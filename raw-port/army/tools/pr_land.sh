#!/bin/bash
# pr_land.sh <PR#> [--reviewed] — drive a gated PR to a server-side merge, handling the
# strict "branch must be up-to-date" dance in ONE command so reviewers don't orchestrate
# update-branch + re-gate by hand on every merge (the #1 PR-flow friction).
#
# LOOP (bounded): (1) if BEHIND, PUT .../update-branch and wait for the new head SHA;
# (2) run pr_gate.sh <PR#> [--reviewed] to post faithfulness-gate on the CURRENT head;
# (3) if MERGEABLE/clean, `gh pr merge --squash --delete-branch`; if it merged, DONE.
# Re-checks BEHIND after gating because main keeps advancing under the live swarm. Gives up
# after N rounds (prints REBASE-RACE so the caller can retry later). NEVER force-merges;
# only merges when the required status is green and GitHub reports it mergeable.
set -uo pipefail
PR="${1:?usage: pr_land.sh <PR#> [--reviewed]}"; REVIEWED="${2:-}"
SLUG="vjeux/fcp-headless-transitions"; CANON="$HOME/random/final-cut-pro-transitions"; cd "$CANON"
# Act as the REVIEWER GitHub App: it posts the gate status, signs the APPROVE, and merges. Distinct
# from the worker app that authored the PR, which is what makes a real review verdict possible.
GHAPP="$CANON/raw-port/army/tools/ghapp"
ghr () { bash "$GHAPP/gh_as.sh" reviewer "$@"; }
for round in 1 2 3 4 5 6; do
  st=$(ghr pr view "$PR" --repo "$SLUG" --json state --jq .state 2>/dev/null)
  [ "$st" = "MERGED" ] && { echo "pr_land: PR #$PR already MERGED"; exit 0; }
  [ "$st" = "CLOSED" ] && { echo "pr_land: PR #$PR CLOSED (not merged)"; exit 1; }
  ms=$(ghr pr view "$PR" --repo "$SLUG" --json mergeStateStatus --jq .mergeStateStatus 2>/dev/null)
  echo "pr_land round $round: state=$st mergeState=$ms"
  if [ "$ms" = "BEHIND" ]; then
    ghr api -X PUT "repos/$SLUG/pulls/$PR/update-branch" >/dev/null 2>&1 || true
    # wait for head SHA to change / mergeState to leave BEHIND
    for _ in 1 2 3 4 5 6 7 8; do sleep 3; nms=$(ghr pr view "$PR" --repo "$SLUG" --json mergeStateStatus --jq .mergeStateStatus 2>/dev/null); [ "$nms" != "BEHIND" ] && break; done
  fi
  # (re)gate the current head, posting the required status
  bash raw-port/army/tools/pr_gate.sh "$PR" $REVIEWED >/tmp/pr_land_gate_$PR.log 2>&1
  grep -qE 'PR_GATE: (PASS|FAIL|NEEDS-REVIEW)' /tmp/pr_land_gate_$PR.log; tail -1 /tmp/pr_land_gate_$PR.log
  if grep -q 'PR_GATE: FAIL' /tmp/pr_land_gate_$PR.log; then echo "pr_land: gate FAIL — not merging"; exit 1; fi
  if grep -q 'PR_GATE: NEEDS-REVIEW' /tmp/pr_land_gate_$PR.log; then echo "pr_land: needs reviewer --reviewed re-derivation"; exit 2; fi
  # DO NOT auto-approve here. This script used to POST a generic APPROVE ("reviewer re-derived the
  # disassembly...") on any green head just before merging — which reviewer-01 correctly called out:
  # #197 carried that APPROVE while actually being a duplicate. An approval minted by the merge tool
  # is a rubber stamp; it records nothing about whether anyone verified anything, and it quietly
  # devalues the very review trail the two GitHub Apps exist to create.
  #
  # Inverted: the reviewer must APPROVE *before* landing, with their own evidence line, via
  #   ghapp/pr_review.sh <PR#> approve "<what I re-derived and why it matches>"
  # and pr_land REQUIRES that approval to exist on the CURRENT head. This also enforces
  # "verify before merge" client-side: a stale approval on an older SHA does not count.
  if [ -f "${FCT_STATE_DIR:-$HOME/.fct-pool}/ghapp/reviewer.json" ]; then
    HEAD_SHA=$(ghr pr view "$PR" --repo "$SLUG" --json headRefOid --jq .headRefOid 2>/dev/null)
    APPROVED=$(ghr api "repos/$SLUG/pulls/$PR/reviews" --paginate 2>/dev/null | python3 -c "
import json,sys
try: rs=json.load(sys.stdin)
except Exception: raise SystemExit
print('yes' if any(r.get('state')=='APPROVED' and r.get('commit_id')=='$HEAD_SHA' for r in rs) else '')
" 2>/dev/null)
    if [ -z "$APPROVED" ]; then
      echo "pr_land: REFUSING to merge PR #$PR — no APPROVED review on the current head ${HEAD_SHA:0:8}."
      echo "  Verify it, then sign your verdict with your own evidence:"
      echo "    bash raw-port/army/tools/ghapp/pr_review.sh $PR approve \"<one-line evidence>\""
      echo "  (A merge tool minting its own approval is a rubber stamp — that is why this refuses.)"
      exit 4
    fi
  fi
  # try the merge (auto = waits for the just-posted status if still settling)
  ghr pr merge "$PR" --repo "$SLUG" --squash --auto --delete-branch >/dev/null 2>&1 || true
  sleep 4
  st=$(ghr pr view "$PR" --repo "$SLUG" --json state --jq .state 2>/dev/null)
  [ "$st" = "MERGED" ] && { echo "pr_land: PR #$PR MERGED ✅"; exit 0; }
done
echo "pr_land: REBASE-RACE — PR #$PR still not merged after 6 rounds (main advancing under swarm); retry later"; exit 3
