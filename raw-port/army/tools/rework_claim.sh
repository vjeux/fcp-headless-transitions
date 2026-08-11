#!/bin/bash
# rework_claim.sh — PULL-side of the REWORK queue: PRs a reviewer REJECTED, waiting on their author.
#
# WHY THIS EXISTS. The swarm had two pull queues — port units (depclaim) and stale bases
# (rebase_claim) — and no queue at all for the third thing that stops a PR: a reviewer's
# REQUEST_CHANGES. Both sides behaved correctly and the work still stranded:
#   * `review_claim.sh` deliberately SKIPS a PR whose head is CHANGES_REQUESTED — it is the author's
#     turn, and re-reviewing it would be the duplicate-review race (#7/#224).
#   * `rebase_claim.sh` only matches a faithfulness-gate FAILURE whose description says
#     regression/rebase. A rejected PR is usually gate-GREEN; the defect is semantic.
#   * `depclaim.py next` hands out fresh symbols, never an existing PR.
# So nothing routed a rejection to anybody. Measured 2026-08-11: 31 of 32 open PRs were
# CHANGES_REQUESTED, the oldest 16 hours untouched, while every reviewer slot polled `NONE` — the
# review backlog had not been cleared so much as MOVED somewhere no queue could see it. A rejection
# that names a real defect is the most valuable signal the swarm produces (a reviewer already did
# the differential and told you exactly what is wrong); leaving it unrouted wastes both the port and
# the review.
#
# A rework is AUTHOR work — deciding what the code should say — so a WORKER pulls it, exactly as
# with a conflict rebase. The reviewer must not fix the thing they judged.
#
#   rework_claim.sh claim        -> lease + print CLAIMED <PR#> <branch>, or NONE (exit 1)
#   rework_claim.sh release <PR> -> drop the lease (always, when you stop working it)
#   rework_claim.sh status       -> leases + attempt counts
#
# Leases: $STATE/rework_leases/<PR> (atomic mkdir, auto-reclaimed after REWORK_LEASE_MIN, default 90).
# Attempts: $STATE/rework_attempts/<PR>, keyed to the head SHA the attempt was charged against, so a
# PR that produces a NEW head is making progress and is not penalised — the #28 lesson, applied
# before it can bite here. Past the cap this queue STOPS OFFERING the PR; it never closes it. Closing
# an author's work is a decision for a human, and the rebase queue's auto-close is what discarded
# oracle-verified bodies today.
set -uo pipefail
SLUG="${FCT_REPO:-vjeux/fcp-headless-transitions}"; CANON="$HOME/random/final-cut-pro-transitions"
cd "$CANON"
STATE="${FCT_STATE_DIR:-$HOME/.fct-pool}"; LEAS="$STATE/rework_leases"; ATT="$STATE/rework_attempts"
mkdir -p "$LEAS" "$ATT"
CAP="${REWORK_ATTEMPT_CAP:-3}"; LEASE_MIN="${REWORK_LEASE_MIN:-90}"

stamp_owner () { # <leasedir> : record the CLAIMANT — or REMOVE a name that is no longer the holder.
  # The `else rm -f` is the whole point, and the first cut of this patch did not have it. The
  # STALE-RECLAIM branch below reuses a directory that already carries an owner file, so a reclaim
  # by a caller with no FCT_AGENT_ID would leave the DEAD agent's id sitting on a lease it does not
  # hold. This harness reuses slot ids by design (HARNESS_LOOP invariant 2: one fixed slot per
  # process, and the only thing that creates an agent is the harness restarting a dead slot), so
  # that agent comes back — and the release guard would then authorise the returning `worker-9` to
  # free a lease held by someone else while refusing every other identified agent. A guard whose key
  # names the wrong agent is worse than none, because the refusals it does emit read as proof that
  # it works. So the file always names the CURRENT holder, or nothing at all.
  # Identical rule to `wt_pool.sh::stamp_holder`; the three copies are pinned to agree by
  # test_guards case I (behaviour) and swarm_doctor's `lease-ownership` check (all three paths).
  if [ -n "${FCT_AGENT_ID:-}" ]; then echo "$FCT_AGENT_ID" > "$1/owner"; else rm -f "$1/owner"; fi
}

lease_free () { # <PR> : 0 if we can take it (free or stale), else 1
  local lk="$LEAS/$1"
  mkdir "$lk" 2>/dev/null && { echo "$(date +%s)" > "$lk/held"; stamp_owner "$lk"; return 0; }
  if [ -n "$(find "$lk/held" -mmin +$LEASE_MIN 2>/dev/null)" ]; then
    echo "$(date +%s)" > "$lk/held"; stamp_owner "$lk"; return 0; fi
  return 1
}

reap_dead_counters () {
  # SELF-HEAL: an attempt counter must not outlive its PR.
  #
  # Counters are the authority to stop offering work, and they are never cleared when a PR merges or
  # closes — so they accumulate as dead state that reads exactly like stranded work. Measured today:
  # 64 counters for long-merged PRs, one of which (#387, MERGED) reported as "stranded at 3/3" and
  # cost a round of investigation. Worse, a counter inflated by a bug that has SINCE BEEN FIXED stays
  # at the cap and keeps real work invisible — the fix alone does not free the state it created
  # (OPS_LOG #28), which is why two PRs had to be un-stranded by hand this session.
  #
  # So the queue reaps its own dead state on every claim. Cheap (only counters at or past the cap are
  # checked, and only their state field), self-limiting, and it removes a standing manual chore that
  # otherwise depends on somebody noticing.
  local f b n st
  for f in "$ATT"/*; do
    [ -f "$f" ] || continue
    b="$(basename "$f")"; case "$b" in *.sha) continue;; esac
    case "$b" in ''|*[!0-9]*) continue;; esac
    n=$(cat "$f" 2>/dev/null || echo 0)
    [ "${n:-0}" -ge "$CAP" ] || continue
    st=$(gh pr view "$b" --repo "$SLUG" --json state --jq .state 2>/dev/null)
    if [ "$st" = "MERGED" ] || [ "$st" = "CLOSED" ]; then
      rm -f "$f" "$f.sha" 2>/dev/null
      echo "rework_claim: reaped a dead counter for PR #$b ($st) — it was masquerading as stranded work" >&2
    fi
  done
}

cmd_claim () {
  reap_dead_counters
  git fetch -q origin main 2>/dev/null || true
  local cand
  # Oldest first: a rejection that has sat longest is the one whose reviewer evidence is most at risk
  # of being re-derived from scratch by somebody else.
  cand=$(gh pr list --repo "$SLUG" --state open --limit 200 \
      --json number,headRefName,headRefOid,reviewDecision,updatedAt \
      --jq '[.[] | select(.reviewDecision=="CHANGES_REQUESTED")] | sort_by(.updatedAt) | .[]
            | "\(.number)\t\(.headRefName)\t\(.headRefOid)"' 2>/dev/null)
  [ -z "$cand" ] && { echo "NONE"; return 1; }
  while IFS=$'\t' read -r num br sha; do
    [ -z "$num" ] && continue
    # IS THE PR ACTUALLY WAITING ON THE AUTHOR? `reviewDecision` stays CHANGES_REQUESTED until a
    # reviewer dismisses or re-reviews — pushing a fix does NOT clear it. So the filter above also
    # matches every PR that has ALREADY been reworked and is waiting on a REVIEWER, and this queue
    # hands each of those to a worker again, one full run at a time, until the cap stops offering
    # it. Measured 2026-08-11: two of one worker's six claims (#114, #143) were already fixed by a
    # peer, one of them 14 minutes earlier; #143 reached 3/3 that way without anything failing.
    # The head SHA the rejection was RECORDED AGAINST answers it: if the head has moved since, the
    # author has already answered and the PR belongs to the review queue (`review_claim.sh` selects
    # on the head's faithfulness-gate status, and a freshly pushed head has none, so it is visible
    # there as an ordinary unreviewed head).
    local rej
    rej=$(gh api "repos/$SLUG/pulls/$num/reviews" \
            --jq '[.[] | select(.state=="CHANGES_REQUESTED")] | last | .commit_id' 2>/dev/null)
    # An EMPTY answer is a transport failure or an API shape change, never a verdict — offer the PR
    # rather than starving the queue on it (OPS_LOG: a gh "not found" is not information).
    if [ -n "$rej" ] && [ "$rej" != "null" ] && [ "$rej" != "$sha" ]; then
      echo "rework_claim: PR #$num already reworked (rejection was on ${rej:0:8}, head is now ${sha:0:8}) — it is waiting on a REVIEWER, skipping" >&2
      rm -f "$ATT/$num" "$ATT/$num.sha" 2>/dev/null
      continue
    fi
    local af="$ATT/$num" sf="$ATT/$num.sha" n last
    n=$(cat "$af" 2>/dev/null || echo 0); last=$(cat "$sf" 2>/dev/null || echo "")
    # A new head means the author pushed a fix and the reviewer rejected again on NEW code — that is
    # a fresh round, not a repeat failure. Only a re-claim of the SAME head counts against the cap.
    if [ -n "$last" ] && [ "$last" != "$sha" ]; then n=0; echo 0 > "$af"; fi
    if [ "$n" -ge "$CAP" ]; then
      echo "rework_claim: PR #$num at $n/$CAP attempts on head ${sha:0:8} — skipping (NOT closing; a human decides)" >&2
      continue
    fi
    if lease_free "$num"; then
      echo "$((n+1))" > "$af"; echo "$sha" > "$sf"
      echo "CLAIMED $num $br   (rework attempt $((n+1))/$CAP on head ${sha:0:8})"
      return 0
    fi
  done <<< "$cand"
  echo "NONE"; return 1
}

case "${1:-claim}" in
  claim)   cmd_claim ;;
  release)
  # OWNERSHIP: a release must only free YOUR OWN lease.
  #
  # `rm -rf` on a lease nobody checked ownership of means any agent can free any other's — and an
  # end-of-run cleanup sweep did exactly that today, deleting a peer's lease taken 39 seconds
  # earlier. It is the same hole `wt_pool.sh release` had and closed, arriving here through the
  # queues. The peer then works a PR it no longer holds, and a second agent can claim it
  # underneath — the duplicate-work race the leases exist to prevent.
  #
  # Fails OPEN on an unowned lease (one written before this landed, or by a caller with no
  # FCT_AGENT_ID): a stuck lease is worse than an occasional double-free, and the stale reclaim
  # still bounds it.
    _pr="${2:?usage: rework_claim.sh release <PR>}"; _lk="$LEAS/$_pr"; _own=$(cat "$_lk/owner" 2>/dev/null || echo "")
    if [ -n "$_own" ] && [ "$_own" != "unknown" ] && [ -n "${FCT_AGENT_ID:-}" ] && [ "$_own" != "$FCT_AGENT_ID" ]; then
      echo "rework_claim: lease on PR #$_pr is held by $_own, not ${FCT_AGENT_ID}; NOT releasing another agents lease" >&2
      exit 0
    fi
    rm -rf "$_lk" 2>/dev/null; echo "RELEASED rework lease $_pr" ;;
  status)
    echo "rework leases:"; ls -1 "$LEAS" 2>/dev/null | while read -r p; do
      echo "  PR#$p  held $(cat "$LEAS/$p/held" 2>/dev/null)"; done
    [ -z "$(ls -A "$LEAS" 2>/dev/null)" ] && echo "  (none)"
    echo "attempt counts:"; ls -1 "$ATT" 2>/dev/null | grep -v '\.sha$' | while read -r p; do
      echo "  PR#$p = $(cat "$ATT/$p" 2>/dev/null)/$CAP"; done
    ;;
  *) echo "usage: rework_claim.sh {claim|release <PR>|status}" >&2; exit 2;;
esac
