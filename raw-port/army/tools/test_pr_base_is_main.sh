#!/bin/bash
# test_pr_base_is_main.sh — pin the two refusals that stop a PR stacked on another PR's branch from
# being gated or merged as if it targeted main.
#
# WHY. Nothing in the swarm read `baseRefName`. Measured the day this landed: `grep -c baseRefName`
# was 0 in review_claim.sh, rework_claim.sh, rebase_claim.sh, swarm_doctor.py and every other file
# under army/tools and army/gate — while #649 -> main, #650 -> tools/lease-ownership and
# #651 -> tools/review-claim-g5 were all open and all being handed to reviewers by review_claim.
# For such a PR the two tools answer different questions:
#   * pr_gate.sh diffs `origin/main...HEAD`, so the `faithfulness-gate` it posts covers every commit
#     in the stack — on #651 that was three commits belonging to three PRs, one of which carried an
#     un-dismissed CHANGES_REQUESTED.
#   * pr_land.sh merges with `gh pr merge --squash --auto --delete-branch`, which targets the PR's
#     OWN base. Branch protection lives on `main` and nowhere else, so that merge takes no required
#     status at all, and --delete-branch removes a branch a third PR is based on.
#
# Drives the SHIPPED guard blocks, extracted verbatim from the two tools, with `gh` stubbed out. No
# network, no PR, no pool slot, no state under ~/.fct-pool. Mutation-checked at the end: deleting
# either guard from a copy of its tool must make a case fail.
#
#   bash raw-port/army/tools/test_pr_base_is_main.sh
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAND="${LAND_OVERRIDE:-$HERE/pr_land.sh}"
GATE="${GATE_OVERRIDE:-$HERE/pr_gate.sh}"
PASS=0; FAIL=0
ok  () { echo "  OK    $1"; PASS=$((PASS+1)); }
bad () { echo "  FAIL  $1"; FAIL=$((FAIL+1)); }

LAND_GUARD=$(sed -n '/^LAND_BASE=/,/^\[ -z "\$LAND_BASE" \]/p' "$LAND")
GATE_GUARD=$(sed -n '/^if \[ "\$BASE_REF" != "main" \]/,/^fi$/p' "$GATE")

# A MISSING GUARD IS A FAILING CASE, NOT A BROKEN TEST. The mutants below delete the guard outright,
# and a test that exited 1 with "could not extract" would look identical to a crash — which is how a
# dead control gets read as a live one.
[ -n "$LAND_GUARD" ] || { echo "  FAIL  pr_land.sh has no base guard at all"; FAIL=$((FAIL+1)); }
[ -n "$GATE_GUARD" ] || { echo "  FAIL  pr_gate.sh has no base guard at all"; FAIL=$((FAIL+1)); }

# run_land <stubbed-base> [VAR=val ...] -> the guard's output; exit status is the guard's
run_land () {
  local base="$1"; shift
  ( export PR=651 SLUG="vjeux/fcp-headless-transitions" STUB_BASE="$base" ${1+"$@"}
    ghr () { printf '%s' "$STUB_BASE"; }
    eval "$LAND_GUARD"
    echo "PROCEEDED" )
}
run_gate () {
  local base="$1"; shift
  ( export PR=651 REPO_SLUG="vjeux/fcp-headless-transitions" BASE_REF="$base" ${1+"$@"}
    post_status () { echo "POSTED_STATUS $1 $2"; }
    eval "$GATE_GUARD"
    echo "PROCEEDED" )
}

echo "── pr_land.sh"

out=$(run_land main); rc=$?
if [ $rc -eq 0 ] && grep -q PROCEEDED <<<"$out"; then ok "a PR based on main is merged as before"
else bad "a PR based on main was refused (rc=$rc): $out"; fi

out=$(run_land "tools/review-claim-g5"); rc=$?
if [ $rc -eq 4 ] && ! grep -q PROCEEDED <<<"$out"; then ok "a PR based on another PR's branch is REFUSED (exit 4)"
else bad "a stacked-base PR was not refused (rc=$rc)"; fi

if grep -q "tools/review-claim-g5" <<<"$out"; then ok "the refusal names the base it found"
else bad "the refusal does not say which base — the author cannot act on it"; fi

if grep -q -- "--base main" <<<"$out" && grep -q "gh pr edit 651" <<<"$out"; then
  ok "the refusal carries the one command that resolves it"
else bad "the refusal gives no remedy"; fi

# A TLS blip must not wedge every merge in the swarm — this guard fails OPEN on silence, on purpose,
# because the gate still has to be green below it. That is a decision, so it is pinned.
out=$(run_land ""); rc=$?
if [ $rc -eq 0 ] && grep -q PROCEEDED <<<"$out" && grep -qi "could not read" <<<"$out"; then
  ok "an unanswered base query warns and proceeds (fail-open, deliberate)"
else bad "an empty base answer did not fail open with a warning (rc=$rc): $out"; fi

out=$(run_land "tools/x" FCT_ALLOW_NONMAIN_BASE=1); rc=$?
if [ $rc -eq 0 ] && grep -q PROCEEDED <<<"$out"; then ok "FCT_ALLOW_NONMAIN_BASE=1 is the documented escape hatch"
else bad "the escape hatch does not work (rc=$rc)"; fi

echo "── pr_gate.sh"

out=$(run_gate main); rc=$?
if [ $rc -eq 0 ] && grep -q PROCEEDED <<<"$out"; then ok "a PR based on main is gated as before"
else bad "a PR based on main was refused by the gate (rc=$rc): $out"; fi

out=$(run_gate "tools/review-claim-g5"); rc=$?
if [ $rc -eq 3 ] && ! grep -q PROCEEDED <<<"$out"; then ok "a stacked-base PR is REFUSED by the gate (exit 3)"
else bad "the gate did not refuse a stacked-base PR (rc=$rc)"; fi

# THE POINT OF THE REFUSAL IS THAT IT POSTS NOTHING. A `failure` status would hide the PR from
# review_claim (which selects on the head's status and skips FAILURE), stranding it in no queue at
# all — the shape this log already carries three times. Silence keeps it claimable.
if grep -q POSTED_STATUS <<<"$out"; then
  bad "the gate POSTED a status while refusing — that strands the PR outside every queue"
else ok "the gate posts NO status while refusing, so the PR stays visible to review_claim"; fi

echo "── the two guards are independent"

# pr_land greps its pr_gate log for the literal 'PR_GATE: FAIL'; the gate's refusal prints
# 'PR_GATE: REFUSING'. So pr_land CANNOT inherit the gate's judgement here and must carry its own.
if grep -q "PR_GATE: FAIL" "$LAND" && ! grep -q "PR_GATE: REFUSING" "$LAND" && [ -n "$LAND_GUARD" ]; then
  ok "pr_land does not inherit the gate's refusal (it greps only 'PR_GATE: FAIL') and carries its own"
else bad "pr_land's relationship to the gate's refusal is not what this test assumed — re-read both"; fi

# ── mutation, skipped in the inner runs so this does not recurse ────────────────────────────────
if [ -z "${FCT_TEST_INNER:-}" ]; then
  echo "── mutation: delete each guard from a copy of its tool; a case must die"
  T=$(mktemp -d)
  cp "$LAND" "$T/pr_land.sh"; cp "$GATE" "$T/pr_gate.sh"
  python3 - "$T/pr_land.sh" <<'PY'
import sys
p = sys.argv[1]; s = open(p).read()
i = s.index("LAND_BASE=$("); j = s.index("# carry_tree_identity", i)
open(p, "w").write(s[:i] + s[j:])
PY
  python3 - "$T/pr_gate.sh" <<'PY'
import sys
p = sys.argv[1]; s = open(p).read()
i = s.index('if [ "$BASE_REF" != "main" ]'); j = s.index("\nfi\n", i) + 4
open(p, "w").write(s[:i] + s[j:])
PY
  m1=$(FCT_TEST_INNER=1 LAND_OVERRIDE="$T/pr_land.sh" bash "$0" 2>&1)
  if grep -q "FAIL" <<<"$m1"; then ok "mutation — deleting pr_land's guard is caught"
  else bad "mutation — pr_land's guard can be deleted and every case still passes"; fi
  m2=$(FCT_TEST_INNER=1 GATE_OVERRIDE="$T/pr_gate.sh" bash "$0" 2>&1)
  if grep -q "FAIL" <<<"$m2"; then ok "mutation — deleting pr_gate's guard is caught"
  else bad "mutation — pr_gate's guard can be deleted and every case still passes"; fi
  rm -rf "$T"
fi

echo
if [ "$FAIL" = 0 ]; then echo "test_pr_base_is_main: PASS"; exit 0; fi
echo "test_pr_base_is_main: FAIL ($FAIL failing case(s))"; exit 1
