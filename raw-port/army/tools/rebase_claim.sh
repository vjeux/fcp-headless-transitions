#!/bin/bash
# rebase_claim.sh — PULL-side of the rebase queue (Model B: workers pull, nobody dispatches).
#
# A worker slot calls `rebase_claim.sh claim`; it atomically LEASES exactly one open PR that is stuck
# on a regression/rebase faithfulness-gate FAILURE and is under the per-PR attempt cap, and prints
#   CLAIMED <PR#> <branch>
# The worker then runs rebase_pr.sh <PR#>. If no such PR is free, prints `NONE` (exit 1) and the
# worker falls through to normal port units. Leases live in $STATE/rebase_leases/<PR> (atomic mkdir,
# auto-reclaimed after REBASE_LEASE_MIN min). Attempt counter in $STATE/rebase_attempts/<PR>; past the
# cap the PR is closed (append-only queue re-hands the symbol to a fresh worker).
#
#   rebase_claim.sh claim        -> lease + print CLAIMED <PR#> <branch>, or NONE (exit 1)
#   rebase_claim.sh release <PR> -> drop the lease (call after rebase_pr finishes / on give-up)
#   rebase_claim.sh status       -> show leases + attempt counts
set -uo pipefail
SLUG="vjeux/fcp-headless-transitions"; CANON="$HOME/random/final-cut-pro-transitions"; cd "$CANON"
STATE="${FCT_STATE_DIR:-$HOME/.fct-pool}"; LEAS="$STATE/rebase_leases"; ATT="$STATE/rebase_attempts"
mkdir -p "$LEAS" "$ATT"
CAP="${REBASE_ATTEMPT_CAP:-3}"; LEASE_MIN="${REBASE_LEASE_MIN:-90}"

lease_free () { # <PR> : 0 if we can take it (free or stale), else 1
  local lk="$LEAS/$1"
  mkdir "$lk" 2>/dev/null && { echo "$(date +%s)" > "$lk/held"; [ -n "${FCT_AGENT_ID:-}" ] && echo "$FCT_AGENT_ID" > "$lk/owner"; return 0; }
  if [ -n "$(find "$lk/held" -mmin +$LEASE_MIN 2>/dev/null)" ]; then
    echo "$(date +%s)" > "$lk/held"; [ -n "${FCT_AGENT_ID:-}" ] && echo "$FCT_AGENT_ID" > "$lk/owner"; return 0; fi
  return 1
}

reap_dead_counters () {
  # SELF-HEAL — see the long note in rework_claim.sh. An attempt counter is the authority to stop
  # offering work, and nothing cleared it when a PR merged: 64 dead counters had accumulated, and one
  # (#387, MERGED) read as "stranded at 3/3". A counter inflated by a bug that has since been fixed
  # also stays at the cap, so the fix alone does not free the work it hid (OPS_LOG #28).
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
      echo "rebase_claim: reaped a dead counter for PR #$b ($st)" >&2
    fi
  done
}

cmd_claim () {
  reap_dead_counters
  git fetch -q origin main 2>/dev/null || true
  # candidate PRs whose LATEST faithfulness-gate is FAILURE
  local cand
  cand=$(gh pr list --repo "$SLUG" --state open --limit 100 \
      --json number,headRefName,headRefOid,statusCheckRollup \
      --jq '.[] | select([.statusCheckRollup[]?|select(.context=="faithfulness-gate")]|last|.state=="FAILURE") | "\(.number)\t\(.headRefName)\t\(.headRefOid)"' 2>/dev/null)
  [ -z "$cand" ] && { echo "NONE"; return 1; }
  while IFS=$'\t' read -r num br sha; do
    [ -z "$num" ] && continue
    # confirm the failure reason is a regression/rebase (REST has the description; GraphQL doesn't)
    local desc; desc=$(gh api "repos/$SLUG/commits/$sha/statuses" \
      --jq '[.[]|select(.context=="faithfulness-gate")][0].description' 2>/dev/null)
    # A stale base caught by G6 (add-only) posts "G0-G5 gate reject", NOT "regression (rebase
    # needed)" — same condition, different words — so those PRs matched no filter and sat open
    # forever while a reviewer hand-wrote the status to get them queued. Accept both spellings.
    echo "$desc" | grep -qiE 'regression|rebase|add-only|G6|gate reject' || continue
    local af="$ATT/$num"; local n; n=$(cat "$af" 2>/dev/null || echo 0)

    # ── THE COUNTER MEASURES PROGRESS, NOT ATTENDANCE ────────────────────────────────────────
    # This counter is the authority to DESTROY a finished port, so what it counts matters. It was
    # written on every successful LEASE, before the rebase ran and regardless of the outcome, and
    # cleared only by the cap branch that closes the PR. So it counted "times this PR needed a
    # rebase" while the cap and its close comment both asserted "times rebasing FAILED".
    # Those diverge exactly when a rebase SUCCEEDS and a SIBLING then re-stales the branch — the
    # normal state of a contended class file, not a pathology. With K open PRs on one class the cap
    # is consumed in ~K sibling merges no matter how well the rebases work, so it retires the losers
    # of a race, fastest when the merge rate is healthiest, and most expensively where the work was
    # best (an oracle-verified, reviewer-approved body is the costliest thing to throw away).
    # Measured: #387 sat at 3/3 while GREEN and APPROVED; #390 was closed carrying a 1400/1400
    # differential and had to be reopened by hand; #389's symbol was left claimed-forever, on no
    # branch and in no PR.
    # Two changes, either of which alone would have prevented all three:
    #   1. A NEW HEAD IS PROGRESS. Record the head SHA the attempt was charged against; if the head
    #      has moved since, the branch produced a new gating head and the count resets.
    #   2. VERIFIED WORK IS EXEMPT. A PR that already holds an APPROVED review has been paid for by
    #      a reviewer's differential; a rebase is bookkeeping, not evidence of un-rebasability.
    local sf="$ATT/$num.sha"; local last; last=$(cat "$sf" 2>/dev/null || echo "")
    if [ -n "$last" ] && [ "$last" != "$sha" ]; then
      n=0; echo 0 > "$af"
      echo "rebase_claim: PR #$num head moved ($last -> $sha) since its last attempt — counter reset (progress, not failure)" >&2
    fi
    if [ "$n" -ge "$CAP" ]; then
      local approved; approved=$(gh pr view "$num" --repo "$SLUG" --json reviewDecision --jq .reviewDecision 2>/dev/null)
      if [ "$approved" = "APPROVED" ]; then
        echo "rebase_claim: PR #$num is at the cap but is APPROVED — NOT closing verified work; it stays queued." >&2
        n=0; echo 0 > "$af"
      else
        gh pr close "$num" --repo "$SLUG" --comment "Closed after $CAP rebase attempts on a stale-base shared-class conflict that could not be auto-rebased. The append-only claim queue re-hands this symbol to a fresh worker cut from current main. NOTE: if this PR carried verified evidence, it is in the comments above — carry it over rather than re-deriving it." >/dev/null 2>&1
        rm -rf "$LEAS/$num" 2>/dev/null; rm -f "$af" "$sf" 2>/dev/null
        continue
      fi
    fi
    # try to lease it
    if lease_free "$num"; then
      echo "$((n+1))" > "$af"; echo "$sha" > "$sf"
      echo "CLAIMED $num $br   (attempt $((n+1))/$CAP on head ${sha:0:8})"
      return 0
    fi
  done <<< "$cand"
  echo "NONE"; return 1
}

case "${1:-claim}" in
  claim)   cmd_claim;;
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
    _pr="${2:?usage: rebase_claim.sh release <PR>}"; _lk="$LEAS/$_pr"; _own=$(cat "$_lk/owner" 2>/dev/null || echo "")
    if [ -n "$_own" ] && [ "$_own" != "unknown" ] && [ -n "${FCT_AGENT_ID:-}" ] && [ "$_own" != "$FCT_AGENT_ID" ]; then
      echo "rebase_claim: lease on PR #$_pr is held by $_own, not ${FCT_AGENT_ID}; NOT releasing another agents lease" >&2
      exit 0
    fi
    rm -rf "$_lk" 2>/dev/null; echo "released lease $_pr" ;;
  status)
    echo "rebase leases:"; ls -1 "$LEAS" 2>/dev/null | while read -r p; do echo "  PR#$p held $(cat "$LEAS/$p/held" 2>/dev/null)"; done
    echo "attempt counts:"; ls -1 "$ATT" 2>/dev/null | while read -r p; do echo "  PR#$p = $(cat "$ATT/$p" 2>/dev/null)/$CAP"; done
    ;;
  *) echo "usage: rebase_claim.sh {claim|release <PR>|status}" >&2; exit 2;;
esac
