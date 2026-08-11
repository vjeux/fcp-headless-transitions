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
# carry_tree_identity <approved-sha> <head-sha>
# Prints the two tree hashes and exits 0 only when the head's tree is EXACTLY what merging the
# approved content into current origin/main produces. A missing object, an unreadable commit or a
# failed merge-tree all exit non-zero — this must never fail open, because failing open means
# merging on an approval nobody's evidence describes. Locked by
# raw-port/army/tools/test_pr_land_carry.sh, which drives THIS function.
carry_tree_identity () {
  local approved="$1" head="$2" t1 t2
  git cat-file -e "${approved}^{commit}" 2>/dev/null || {
    echo "  carry: the approved commit ${approved:0:8} is not readable here — NOT carrying"; return 1; }
  git cat-file -e "${head}^{commit}" 2>/dev/null || {
    echo "  carry: the head commit ${head:0:8} is not readable here — NOT carrying"; return 1; }
  # TREE IDENTITY, not a diff hash. `git diff origin/main...<sha>` computes each side against its
  # OWN merge base, so when main advances INSIDE THE SAME FILE the context differs and two identical
  # contributions hash differently — the normal case for OPS_LOG.md, which every agent appends to.
  # And a `git diff` that FAILS prints nothing, whose shasum is the stable da39a3ee… of empty input,
  # so two failures compare EQUAL and the carry fires on content nobody read. merge-tree prints
  # nothing and exits non-zero instead. (Both measured by reviewer 2 on #603.)
  local mt_rc
  t1=$(git merge-tree --write-tree origin/main "$approved" 2>/dev/null); mt_rc=$?
  # A CONFLICT EXITS NON-ZERO AND STILL PRINTS A TREE OID — and that tree holds conflict markers, so
  # carrying an approval onto it would be carrying it onto text nobody wrote, let alone reviewed.
  # `|| true` swallowed that status, which made the header comment above ("a failed merge-tree …
  # exits non-zero — this must never fail open") a promise the code did not keep. `update-branch`
  # cannot produce such a head, which is why it was not exploitable; the point of a predicate like
  # this one is that it must not depend on that staying true somewhere else. (reviewer 1 on #603.)
  [ "$mt_rc" = 0 ] || {
    echo "  carry: main and the approved commit ${approved:0:8} CONFLICT — NOT carrying"; return 1; }
  t2=$(git rev-parse "${head}^{tree}" 2>/dev/null || true)
  echo "    merge-tree(origin/main, ${approved:0:8}) = ${t1:0:12}"
  echo "    tree(${head:0:8})                        = ${t2:0:12}"
  [ -n "$t1" ] && [ -n "$t2" ] && [ "$t1" = "$t2" ]
}

for round in 1 2 3 4 5 6; do
  st=$(ghr pr view "$PR" --repo "$SLUG" --json state --jq .state 2>/dev/null)
  [ "$st" = "MERGED" ] && { echo "pr_land: PR #$PR already MERGED"; exit 0; }
  [ "$st" = "CLOSED" ] && { echo "pr_land: PR #$PR CLOSED (not merged)"; exit 1; }
  ms=$(ghr pr view "$PR" --repo "$SLUG" --json mergeStateStatus --jq .mergeStateStatus 2>/dev/null)
  echo "pr_land round $round: state=$st mergeState=$ms"
  if [ "$ms" = "BEHIND" ]; then
    # REMEMBER WHAT WAS APPROVED BEFORE WE MOVE THE HEAD — as INSURANCE, not as the mechanism.
    #
    # THE PREMISE THIS BLOCK WAS FIRST WRITTEN ON IS FALSE, and it is worth writing down because it
    # is the obvious thing to assume: GitHub does NOT leave the approval pinned to the old SHA when
    # WE call update-branch. It re-points the review record onto the merge commit it creates.
    # Measured on two PRs that landed with the UNPATCHED tool (reviewer 2, corroborated on #609 by
    # its author): review id 4909626168, submitted 18:42:54Z against c72d57ed, now reports
    # commit_id 4a6c06ef — the "Merge branch 'main' into port/…" commit update-branch made at
    # 18:43:05Z, eleven seconds later. The approval check below therefore PASSED and the PR merged.
    #
    # What GitHub does NOT carry is an approval across a push the AUTHOR made — a rebase force-push
    # re-points nothing, which is correct and is the guard doing its job on a head nobody reviewed.
    # (#594's deadlock was that case, not this one.)
    #
    # So this block is a belt for an undocumented server-side behaviour that could change, and it is
    # deliberately narrower than GitHub's own rule: it carries only when the resulting TREE is
    # exactly what merging the approved content into current main produces.
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
    # main being merged in, NOT anything the author wrote.
    # WHAT IS ACTUALLY TESTED IS CONTENT, NOT PROVENANCE, and the distinction matters enough to
    # write down because the previous wording ("it carries over a merge WE performed, and never over
    # a push the author made") describes a check this code does not make, and someone would later
    # "fix" the code to match the sentence. `carry_tree_identity` asserts that the head's TREE is
    # exactly `merge-tree(origin/main, approved-sha)`. An author push that happened to produce that
    # identical tree would also carry — which is harmless, because the content is then provably the
    # content the reviewer read, byte for byte. The property is "nothing unreviewed is in this tree",
    # which is stronger than "we made this commit" and is the one the verdict actually depends on.
    # (The earlier form compared `git diff origin/main...<sha>` hashes at both SHAs. It failed twice
    # over: a diff computes each side against its OWN merge base, so main advancing inside the same
    # file made identical contributions hash differently; and a FAILED diff hashes to the stable
    # da39a3ee… of empty input, so two unreadable commits compared EQUAL and it carried on content
    # nobody read.)
    if [ -n "${APPROVED_BEFORE:-}" ] && [ "$APPROVED_BEFORE" != "$HEAD_SHA" ]; then
      # The fetches are REPORTED, not swallowed: if the objects are not here the carry must not run.
      git fetch -q origin main "+refs/pull/$PR/head:refs/prland/$PR" >/dev/null 2>&1 \
        || echo "pr_land: could not fetch the PR head — the carry will refuse"
      git fetch -q origin "$APPROVED_BEFORE" >/dev/null 2>&1 \
        || echo "pr_land: could not fetch the approved commit — the carry will refuse"
      if carry_tree_identity "$APPROVED_BEFORE" "$HEAD_SHA"; then
        echo "pr_land: carrying the approval on ${APPROVED_BEFORE:0:8} forward to ${HEAD_SHA:0:8}"
        echo "  our own update-branch moved the head, and the head's tree is exactly what merging"
        echo "  the approved content into current main produces (hashes above)."
        APPROVED=1
      else
        echo "pr_land: NOT carrying the approval — see above."
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
