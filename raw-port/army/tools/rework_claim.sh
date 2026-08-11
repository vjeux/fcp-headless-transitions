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

# ── AUTHOR-ANSWERED TEST ──────────────────────────────────────────────────────────────────────
# Does the head carry AUTHOR WORK done since the rejection, or has it merely MOVED?
#
# The skip below used to be `rej != head`, a bare SHA comparison. A head moves for reasons that
# are not an answer to the review: a reviewer's `update-branch`, a worker clearing a conflict from
# the REBASE queue, GitHub's own merge-main-into-branch button. Measured live 2026-08-11 on #656:
# its head moved from 23632095 to 816a8a5f by one commit, `merge origin/main into
# tools/slot-liveness`, carrying not a line of the author's — and from that moment rework_claim
# reported it as "already reworked … waiting on a REVIEWER" forever, while `reviewDecision` stayed
# CHANGES_REQUESTED and the reviewer's asks stayed unanswered. That is the file's oldest failure
# shape (#33: work no queue can see), re-entering through the fix for its opposite (#28: work the
# queue re-hands after a peer fixed it).
#
# So ask what the commits ARE, not whether the SHA changed. The author has answered iff, since the
# rejected commit, the branch gained
#   the branch gained a PATCH-ID it did not have at the rejection.
#
# WHY PATCH-IDS AND NOT COMMITS (reviewer 2 on #690, with a reproduction I confirmed). Counting
# "non-merge commits since the rejection that are not on main" looks right and is wrong one
# tool-path over: `rebase_pr.sh`'s Attempt 2 runs `git rebase -q origin/main` and force-pushes, so
# every commit on the branch is NEW — non-merge, not on main, and not a line of the author's. The
# rework queue would drop the PR for exactly the reason it must not. A rebase PRESERVES patch-ids
# and real authoring introduces one, so the question "did anything new get written" has a direct
# answer that does not care which tool moved the branch. It subsumes the merge case for free (a
# merge contributes no non-merge patch-id), so merges are handled by the mechanism rather than by a
# special case, and it covers whatever the next branch-moving tool turns out to do.
#
# A FORCE-PUSH IS NOT AUTHORSHIP EITHER, for the same reason: in a swarm where a queue rewrites
# branches on its own, "the rejected commit is unreachable" says nothing about who wrote what. When
# the rejected commit cannot be read, the two sets cannot be compared and the answer is OFFER.
#
# DIRECTION OF ERROR, on purpose: anything this cannot establish means OFFER the PR. Offering a PR
# that was already fixed costs one worker one look and the attempt counter resets on a new head
# (#28); NOT offering a genuinely rejected PR strands finished review evidence with nobody able to
# act on it, and nothing else in the swarm will notice.
_branch_patch_ids () { # <tip> : sorted patch-ids of the non-merge commits <tip> has beyond main
  local c
  git rev-list --no-merges "origin/main..$1" 2>/dev/null | while read -r c; do
    git show "$c" 2>/dev/null | git patch-id --stable 2>/dev/null | cut -d' ' -f1
  done | sort -u
}

author_answered () { # <PR#> <rejSHA> <headSHA> ; 0 = the author answered, 1 = still the author's turn
  local num="$1" rej="$2" head="$3" old new p
  [ -n "$rej" ] && [ "$rej" != "null" ] || return 1
  [ "$rej" = "$head" ] && return 1
  # The PR head ref always exists on the remote, even when the branch was deleted or rewritten.
  git fetch -q origin "refs/pull/$num/head" 2>/dev/null || true
  git cat-file -e "${rej}^{commit}" 2>/dev/null  || return 1        # cannot compare -> offer
  git cat-file -e "${head}^{commit}" 2>/dev/null || return 1        # cannot see it   -> offer
  old="$(_branch_patch_ids "$rej")"
  new="$(_branch_patch_ids "$head")"
  for p in $new; do
    printf '%s\n' "$old" | grep -qx -- "$p" || return 0            # a change nobody had written
  done
  return 1
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
    # The head SHA the rejection was RECORDED AGAINST is where the answer starts, but a MOVED head
    # is not by itself an answer — see `author_answered` above, which asks what the new commits ARE
    # (a merge of main is not a rework). When it says the author answered, the PR belongs to the
    # review queue (`review_claim.sh` selects on the head's faithfulness-gate status, and a freshly
    # pushed head has none, so it is visible there as an ordinary unreviewed head).
    local rej
    rej=$(gh api "repos/$SLUG/pulls/$num/reviews" \
            --jq '[.[] | select(.state=="CHANGES_REQUESTED")] | last | .commit_id' 2>/dev/null)
    # An EMPTY answer is a transport failure or an API shape change, never a verdict — offer the PR
    # rather than starving the queue on it (OPS_LOG: a gh "not found" is not information).
    if author_answered "$num" "$rej" "$sha"; then
      echo "rework_claim: PR #$num already reworked (rejection was on ${rej:0:8}, head is now ${sha:0:8}, and the head carries author work since it) — it is waiting on a REVIEWER, skipping" >&2
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
  # ASK-THE-QUEUE, for swarm_doctor and for a human wondering why a PR is not being offered.
  # Read-only: no lease, no counter, no post. Prints SKIP/OFFER and the reason.
  would-skip)
    _n="${2:?usage: rework_claim.sh would-skip <PR#>}"
    _sha=$(gh pr view "$_n" --repo "$SLUG" --json headRefOid --jq .headRefOid 2>/dev/null)
    _rej=$(gh api "repos/$SLUG/pulls/$_n/reviews" \
             --jq '[.[] | select(.state=="CHANGES_REQUESTED")] | last | .commit_id' 2>/dev/null)
    if [ -z "$_sha" ]; then echo "UNKNOWN could not read the head of PR #$_n"; exit 2; fi
    if author_answered "$_n" "$_rej" "$_sha"; then
      echo "SKIP author work since ${_rej:0:8}; head ${_sha:0:8} belongs to the REVIEW queue"
    else
      echo "OFFER still the author's turn at head ${_sha:0:8} (rejected on ${_rej:0:8})"
    fi
    ;;
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
