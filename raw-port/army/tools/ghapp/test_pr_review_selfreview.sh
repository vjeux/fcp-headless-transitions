#!/bin/bash
# test_pr_review_selfreview.sh [path-to-pr_review.sh] — the reviewer-app dead-end message must be
# REACHABLE, and must not fire for anyone else.
#
# WHY THIS EXISTS. A PR authored by the REVIEWER app is structurally unmergeable: every reviewer slot
# shares that one identity, GitHub refuses a self-review, `pr_land` always refuses for want of an
# approval, and no queue can claim it — so it sits open forever while each slot burns a lease
# rediscovering the dead end (#601, #604). pr_review.sh gained a message that names it and gives the
# rescue recipe, and the message could never print: it compared the AUTHOR from `pulls/<n>`
# (`app/vjeux-reviewer`) against $ME built for `pulls/<n>/reviews` (`vjeux-reviewer[bot]`) — ONE
# PRINCIPAL, TWO NAMES — so on the very PRs it was written for the comparison was false and the
# reader got the generic "apps are not configured" message instead. Third guard in one day that was
# correct and unreachable; the standing rule is that a guard nobody has watched fire is not evidence.
#
# SELF-CONTAINED: a fake `gh_as.sh` beside a copy of the script answers the three calls it makes; no
# network, nothing posted. The mutation control is built in — case 4 reverts the comparison to the
# form that shipped and requires the message to disappear.
#
#   bash raw-port/army/tools/ghapp/test_pr_review_selfreview.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-$HERE/pr_review.sh}"
[ -r "$TARGET" ] || { echo "no such script: $TARGET" >&2; exit 2; }
SB="$(mktemp -d "${TMPDIR:-/tmp}/pr_review_selfrev.XXXXXX")"
trap 'rm -rf "$SB"' EXIT
mkdir -p "$SB/state/ghapp"
printf '{"slug":"sandbox-reviewer"}' > "$SB/state/ghapp/reviewer.json"
printf 'a body with more than thirty characters in it\n' > "$SB/body.md"
pass=0; fail=0
ok  () { pass=$((pass+1)); printf '  ok   %s\n' "$1"; }
bad () { fail=$((fail+1)); printf '  FAIL %s -- %s\n' "$1" "$2"; }

# The fake gh_as.sh. GitHub's real self-review rejection carries no "state" key, which is what the
# script tests for, so the POST answer below is the shape that drives the error path.
make_stub () { # <what pr view --json author should print>
  cat > "$SB/gh_as.sh" <<FAKE
#!/bin/bash
case "\$*" in
  *"pr view"*headRefOid*) echo "aaaaaaaa11111111aaaaaaaa11111111aaaaaaaa" ;;
  *"pr view"*author*)     printf '%s' "$1"; [ -n "$1" ] && echo ;;
  *"api -X POST"*reviews*) echo '{"message":"Unprocessable Entity","errors":[{"resource":"PullRequestReview","code":"custom","field":"user_id","message":"Can not approve your own pull request"}]}' ;;
  *reviews*) echo "[]" ;;
  *) echo "" ;;
esac
exit 0
FAKE
  chmod +x "$SB/gh_as.sh"
}

run () { # -> stdout+stderr of a real invocation; sets RC
  local script="$1"
  out=$(cd "$SB" && FCT_STATE_DIR="$SB/state" timeout 20 bash "$script" 4242 approve --body-file "$SB/body.md" 2>&1)
  RC=$?
}

cp "$TARGET" "$SB/pr_review.sh"; chmod +x "$SB/pr_review.sh"
echo "test_pr_review_selfreview: $TARGET"

# --- 1. the case the message exists for: the PR was authored by THIS reviewer app ---------------
make_stub "app/sandbox-reviewer"
run "$SB/pr_review.sh"
if [ "$RC" != 3 ]; then bad "reviewer-app PR exits 3" "exit $RC"; else ok "reviewer-app PR exits 3"; fi
if printf '%s' "$out" | grep -q "NO reviewer can ever approve it"; then
  ok "reviewer-app PR names the dead end"
else
  bad "reviewer-app PR names the dead end" "got: $(printf '%.140s' "$out")"
fi
printf '%s' "$out" | grep -q "git_push_as.sh worker" \
  && ok "…and prints the rescue recipe" || bad "…and prints the rescue recipe" "recipe missing"

# --- 2. somebody else's PR must NOT get that message -------------------------------------------
# (GitHub still refuses — that is how the apps-not-configured case looks — so the generic message is
# correct there, and claiming "the reviewer app authored it" would send the reader to the wrong fix.)
make_stub "app/sandbox-worker"
run "$SB/pr_review.sh"
if printf '%s' "$out" | grep -q "NO reviewer can ever approve it"; then
  bad "a worker-app PR must get the GENERIC message" "it got the reviewer-app dead-end message"
else
  ok "a worker-app PR gets the generic message"
fi
[ "$RC" = 3 ] && ok "worker-app PR still exits 3" || bad "worker-app PR still exits 3" "exit $RC"

# --- 3. an UNREADABLE author is its own state, not 'somebody else' ------------------------------
make_stub ""
run "$SB/pr_review.sh"
if printf '%s' "$out" | grep -q "could not read PR #4242's author"; then
  ok "an unreadable author is reported as unreadable"
else
  bad "an unreadable author is reported as unreadable" "got: $(printf '%.140s' "$out")"
fi
printf '%s' "$out" | grep -q "NO reviewer can ever approve it" \
  && ok "…and the dead end is still named (GitHub's refusal already proves it)" \
  || bad "…and the dead end is still named" "the message was suppressed by a failed lookup"

# --- 4. MUTATION CONTROL: the comparison that shipped must make case 1 go red -------------------
# `[ "$AUTHOR" = "${ME%\[bot\]}[bot]" ]` is what #616 shipped, and `app/sandbox-reviewer` never
# equals `sandbox-reviewer[bot]`. If this case does not go quiet, the test is not measuring the fix.
sed -e 's|^  case "${AUTHOR:-}" in|  case "NEVER-MATCHES" in|' "$TARGET" > "$SB/mutant.sh"
chmod +x "$SB/mutant.sh"
if ! cmp -s "$TARGET" "$SB/mutant.sh"; then
  make_stub "app/sandbox-reviewer"
  run "$SB/mutant.sh"
  if printf '%s' "$out" | grep -q "NO reviewer can ever approve it"; then
    bad "MUTATION: with the identity match broken the message must NOT print" \
        "it printed anyway — this test cannot see the defect it was written for"
  else
    ok "MUTATION: breaking the identity match takes case 1 red"
  fi
else
  bad "MUTATION: could not build the mutant" "the case arm this test edits is not in $TARGET"
fi

echo "test_pr_review_selfreview: $pass passed, $fail failed"
[ "$fail" = 0 ] || exit 1
