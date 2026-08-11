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

lease_free () { # <PR> : 0 if we can take it (free or stale), else 1
  local lk="$LEAS/$1"
  # ── THE OTHER WORKER QUEUE'S LEASE COUNTS TOO ─────────────────────────────────────────────────
  # A PR that is CHANGES_REQUESTED *and* CONFLICTING is selected by BOTH worker queues, and until
  # now neither looked at the other's lease directory — so two workers were handed the same PR.
  # Measured 2026-08-11 on #656 (a 936-line tooling PR): a peer took the REBASE lease at 13:32:36
  # and was 43 files into a merge in ~/.fct-pool/wt/3 when this queue handed the same PR to worker 8
  # at 13:33:42, 66 seconds later. Nothing in either tool could see the collision; the second worker
  # only found it because `git checkout` refused a branch another worktree already held.
  # The combination became common the same hour: #643 taught `rebase_claim` to select DIRTY PRs
  # (right, and it un-stranded four), and the side effect is that every rejected+conflicted PR is
  # now double-claimable. Both workers then reconcile the same conflicts and one of them loses the
  # race at push time — the duplicated-evidence waste this log already records for the REWORK queue
  # alone ("two workers can transcribe the same reviewer's finding").
  # Same staleness window as our own leases, so a dead peer cannot block the PR forever.
  local peer="$STATE/rebase_leases/$1"
  if [ -d "$peer" ] && [ -z "$(find "$peer/held" -mmin +$LEASE_MIN 2>/dev/null)" ]; then
    echo "rework_claim: PR #$1 is already leased by the REBASE queue — skipping (a rejected PR that also conflicts is in both queues; one worker is enough)" >&2
    return 1
  fi
  mkdir "$lk" 2>/dev/null && { echo "$(date +%s)" > "$lk/held"; return 0; }
  if [ -n "$(find "$lk/held" -mmin +$LEASE_MIN 2>/dev/null)" ]; then
    echo "$(date +%s)" > "$lk/held"; return 0; fi
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
  # THE CAP FILTER WAS THE BUG. This used to check only counters already AT the cap, to bound the
  # number of API calls — one `gh pr view` each. But swarm_doctor's dead-counters check flags ANY
  # counter whose PR has merged or closed, so the tool that reports the fault and the tool that
  # fixes it disagreed by construction: #554 sat at 1/3, merged, and the doctor asked a human to
  # `rm` it on every run while this function was coded to skip it forever. Every dead counter I
  # cleared by hand today was under the cap. A counter for a merged PR is garbage at any value.
  #
  # Checking them all costs nothing extra because they now go in ONE aliased GraphQL query instead
  # of one call per counter: 6 counters, 0.575s, one round trip. That is cheaper than the old
  # capped-only loop was, so the bound the filter existed to provide is no longer needed.
  local f b nums="" q="" resp k st
  for f in "$ATT"/*; do
    [ -f "$f" ] || continue
    b="$(basename "$f")"; case "$b" in *.sha) continue;; esac
    case "$b" in ''|*[!0-9]*) continue;; esac
    nums="$nums $b"
  done
  [ -z "$nums" ] && return 0
  for b in $nums; do q="$q p$b: pullRequest(number: $b) { state }"; done
  resp=$(gh api graphql -f query="query { repository(owner: \"${SLUG%%/*}\", name: \"${SLUG##*/}\") { $q } }" \
           --jq '.data.repository | to_entries[] | "\(.key) \(.value.state)"' 2>/dev/null)
  # An unanswered query is not evidence. Reaping on silence would clear a LIVE counter and re-offer
  # work the cap is deliberately holding back, which is the failure the cap exists to prevent.
  [ -z "$resp" ] && return 0
  printf '%s\n' "$resp" | while read -r k st; do
    b="${k#p}"
    case "$st" in
      MERGED|CLOSED)
        rm -f "$ATT/$b" "$ATT/$b.sha" 2>/dev/null
        echo "rework_claim: reaped a dead counter for PR #$b ($st) — it was masquerading as stranded work" >&2 ;;
    esac
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
    # RETRY BEFORE FAILING OPEN. The fail-open below is right in principle and it is reached far too
    # often in practice: `gh` on this box intermittently dies with
    # `tls: failed to verify certificate: x509: certificate signed by unknown authority`, and the
    # identical call succeeds on the next attempt. When that lands here the guard sees an empty
    # answer, offers a PR the author has ALREADY answered, and a worker spends a full run
    # rediscovering it — the exact cost #36 was written to remove. Measured 2026-08-11: #655 was
    # handed to me at attempt 1/3 with its rejection recorded on dbeb23cc and its head at 998dfc5f,
    # two pushes and a peer's completed rework later. Re-running this very query three times
    # immediately afterwards returned dbeb23cc every time — the data was there, the call was not.
    local rej="" _try
    for _try in 1 2 3; do
      rej=$(gh api "repos/$SLUG/pulls/$num/reviews" \
              --jq '[.[] | select(.state=="CHANGES_REQUESTED")] | last | .commit_id' 2>/dev/null)
      [ -n "$rej" ] && [ "$rej" != "null" ] && break
      [ "$_try" -lt 3 ] && sleep 2
    done
    # An EMPTY answer AFTER THREE TRIES is a transport failure or an API shape change, never a
    # verdict — offer the PR rather than starving the queue on it (OPS_LOG: a gh "not found" is not
    # information). Say so out loud, though: a silent fail-open is indistinguishable from a real
    # offer, and the worker who receives the PR is the only one who can tell the difference.
    if [ -z "$rej" ] || [ "$rej" = "null" ]; then
      echo "rework_claim: WARNING PR #$num — could not read the rejection's commit after 3 tries;" >&2
      echo "              offering it anyway (fail-open). If its head has moved since the review it" >&2
      echo "              may already be reworked — check before redoing the work." >&2
    fi
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
  release) rm -rf "$LEAS/${2:?usage: rework_claim.sh release <PR>}" 2>/dev/null; echo "RELEASED rework lease ${2}" ;;
  status)
    echo "rework leases:"; ls -1 "$LEAS" 2>/dev/null | while read -r p; do
      echo "  PR#$p  held $(cat "$LEAS/$p/held" 2>/dev/null)"; done
    [ -z "$(ls -A "$LEAS" 2>/dev/null)" ] && echo "  (none)"
    echo "attempt counts:"; ls -1 "$ATT" 2>/dev/null | grep -v '\.sha$' | while read -r p; do
      echo "  PR#$p = $(cat "$ATT/$p" 2>/dev/null)/$CAP"; done
    ;;
  *) echo "usage: rework_claim.sh {claim|release <PR>|status}" >&2; exit 2;;
esac
