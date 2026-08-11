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
    # REMEMBER WHAT WAS APPROVED BEFORE WE MOVE THE HEAD.
    # This loop's own update-branch invalidates the approval it is about to require: the head moves,
    # the reviewer's APPROVE stays pinned to the old SHA, and the check below then refuses with "no
    # APPROVED review on the current head". The tool creates the condition it rejects, so an APPROVED
    # PR that happens to be BEHIND can NEVER land without a human re-approving a merge commit they
    # did not write. Four approved PRs (#594, #568, #554, #523) were deadlocked exactly this way.
    # We record the approved SHA here; after the update, the check below carries the approval forward
    # ONLY IF the PR's own contribution is byte-identical (see CARRY note there).
    APPROVED_BEFORE=$(ghr api "repos/$SLUG/pulls/$PR/reviews" --paginate 2>/dev/null \
      | python3 -c "
import json,sys
try: rs=json.load(sys.stdin)
except Exception: raise SystemExit
a=[r for r in rs if r.get('state')=='APPROVED']
print(a[-1]['commit_id'] if a else '')
" 2>/dev/null)
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
    # DISTINGUISH "no approval" FROM "the lookup failed". During a burst of TLS errors this printed
    # "no APPROVED review on the current head ." — with an EMPTY SHA — seconds after an approval had
    # succeeded, and an unchanged retry merged fine. That message would convince a reviewer its
    # verdict had not registered and send it to re-review or abandon a correct PR. A transient API
    # failure must never render as a verdict. Retry, and refuse to speak if we still cannot see.
    HEAD_SHA=""; REVJSON=""
    for _try in 1 2 3; do
      HEAD_SHA=$(ghr pr view "$PR" --repo "$SLUG" --json headRefOid --jq .headRefOid 2>/dev/null)
      REVJSON=$(ghr api "repos/$SLUG/pulls/$PR/reviews" --paginate 2>/dev/null)
      [ -n "$HEAD_SHA" ] && [ -n "$REVJSON" ] && break
      sleep 3
    done
    if [ -z "$HEAD_SHA" ] || [ -z "$REVJSON" ]; then
      echo "pr_land: could not read PR #$PR review state after 3 tries (transient API failure)."
      echo "  NOT a verdict about the PR — retry when the API settles."
      exit 6
    fi
    # HARD STOP ON AN OUTSTANDING REJECTION. All reviewer slots share ONE bot identity, so GitHub's
    # per-user "latest review wins" does NOT protect us: slot B's APPROVE silently supersedes slot A's
    # CHANGES_REQUESTED. That is how a rejected port landed — reviewer-06 rejected #221, a peer
    # approved a newer head, and the NaN-branch defect went to main as eb6f6086 (issue #224).
    # Rule: ANY CHANGES_REQUESTED that has not been explicitly DISMISSED blocks the merge. Overriding
    # a peer's rejection must be a deliberate act (dismiss it with a reason), never an accident of
    # ordering.
    BLOCKED_BY=$(printf '%s' "$REVJSON" | python3 -c "
import json,sys
try: rs=json.load(sys.stdin)
except Exception: raise SystemExit
out=[r for r in rs if r.get('state')=='CHANGES_REQUESTED']
if out:
    r=out[-1]
    print('%s @%s' % ((r.get('user') or {}).get('login','?'), (r.get('commit_id') or '')[:8]))
" 2>/dev/null)
    if [ -n "$BLOCKED_BY" ]; then
      echo "pr_land: REFUSING to merge PR #$PR — an un-dismissed CHANGES_REQUESTED stands ($BLOCKED_BY)."
      echo "  A rejection is not superseded by a later approval (all slots share one bot identity)."
      echo "  If it is genuinely resolved, dismiss it deliberately:"
      echo "    gh api -X PUT repos/$SLUG/pulls/$PR/reviews/<review_id>/dismissals -f message='<why>'"
      exit 5
    fi
    APPROVED=$(printf '%s' "$REVJSON" | python3 -c "
import json,sys
try: rs=json.load(sys.stdin)
except Exception: raise SystemExit
print('yes' if any(r.get('state')=='APPROVED' and r.get('commit_id')=='$HEAD_SHA' for r in rs) else '')
" 2>/dev/null)
    if [ -z "$APPROVED" ]; then
    # CARRY THE APPROVAL ACROSS OUR OWN UPDATE — but only when the author's content is unchanged.
    # If update-branch moved the head, the difference between the approved SHA and the new head is
    # main being merged in, NOT anything the author wrote. So compare the PR's own CONTRIBUTION —
    # `git diff origin/main...<sha>` — at both SHAs. Byte-identical means the reviewer's evidence
    # still describes exactly this content, and their verdict stands. Any difference at all means a
    # real re-review, and we refuse as before. This is deliberately narrow: it carries an approval
    # over a merge WE performed, and never over a push the author made.
    if [ -n "${APPROVED_BEFORE:-}" ] && [ "$APPROVED_BEFORE" != "$HEAD_SHA" ]; then
      git fetch -q origin main "+refs/pull/$PR/head:refs/prland/$PR" >/dev/null 2>&1 || true
      git fetch -q origin "$APPROVED_BEFORE" >/dev/null 2>&1 || true
      A=$(git diff "origin/main...$APPROVED_BEFORE" 2>/dev/null | shasum | cut -d" " -f1)
      B=$(git diff "origin/main...$HEAD_SHA" 2>/dev/null | shasum | cut -d" " -f1)
      if [ -n "$A" ] && [ "$A" = "$B" ]; then
        echo "pr_land: carrying the approval on ${APPROVED_BEFORE:0:8} forward to ${HEAD_SHA:0:8}"
        echo "  (our own update-branch moved the head; the PR's contribution vs main is byte-identical)"
        APPROVED=1
      fi
    fi
    if [ "${APPROVED:-0}" = "1" ]; then :; else
      echo "pr_land: REFUSING to merge PR #$PR — no APPROVED review on the current head ${HEAD_SHA:0:8}."
      echo "  Verify it, then sign your verdict with your own evidence:"
      echo "    bash raw-port/army/tools/ghapp/pr_review.sh $PR approve \"<one-line evidence>\""
      echo "  (A merge tool minting its own approval is a rubber stamp — that is why this refuses.)"
      exit 4
    fi
    fi
  fi
  # try the merge (auto = waits for the just-posted status if still settling)
  ghr pr merge "$PR" --repo "$SLUG" --squash --auto --delete-branch >/dev/null 2>&1 || true
  sleep 4
  st=$(ghr pr view "$PR" --repo "$SLUG" --json state --jq .state 2>/dev/null)
  [ "$st" = "MERGED" ] && { echo "pr_land: PR #$PR MERGED ✅"; exit 0; }
done
echo "pr_land: REBASE-RACE — PR #$PR still not merged after 6 rounds (main advancing under swarm); retry later"; exit 3
