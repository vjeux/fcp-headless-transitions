#!/bin/bash
# test_pr_comment_once_argv.sh [path-to-pr_comment_once.sh] — lock the argv contract of
# pr_comment_once.sh, the way test_pr_review_argv.sh locks pr_review.sh's.
#
# WHY THIS TEST EXISTS. `pr_comment_once.sh <PR> --body-file <path>` used to post the LITERAL STRING
# "--body-file <path>" as the comment, at exit 0, behind the line "pr_comment_once: posted to PR
# #<n>". Measured on PR #600 on 2026-08-11: 1,204 bytes of reconciliation evidence replaced by 33
# characters of shell flag. It is the same family as the eleven-KB review body destroyed by the same
# shape in pr_review.sh — #596 closed that door and left this one open, even though the OPS_LOG entry
# that asked for --body-file named BOTH tools.
#
# Two harms specific to this tool are pinned below as their own cases:
#   * the dedup KEY is computed FROM the body, so a mangled body also breaks idempotence: the correct
#     comment posted afterwards carries a different marker and the PR keeps both;
#   * a multi-word literal body is joined with spaces, so "two words" must survive as "two words".
#
# The test runs the REAL script against a FAKE `gh` on PATH in a throwaway sandbox: no network,
# nothing is posted to any PR, and the assertion is on the body that WOULD have been sent. (A probe
# whose subject is the evidence record must never aim at the live queue — a test_guards case that
# did left "--definitely-not-a-real-flag" reviews on two real PRs.)
#
# Run it against another copy to watch it fail, which is the only way a guard is evidence:
#   bash test_pr_comment_once_argv.sh /path/to/an/older/pr_comment_once.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-$HERE/pr_comment_once.sh}"
[ -r "$TARGET" ] || { echo "no such script: $TARGET" >&2; exit 2; }

SB="$(mktemp -d "${TMPDIR:-/tmp}/pr_comment_argv.XXXXXX")"
trap 'rm -rf "$SB"' EXIT
cp "$TARGET" "$SB/pr_comment_once.sh"; chmod +x "$SB/pr_comment_once.sh"
BODY_TEXT="real comment evidence, thirty-plus characters of it"
printf '%s\n' "$BODY_TEXT" > "$SB/body.md"
: > "$SB/existing.txt"

# FAKE gh, first on PATH. Records the posted body instead of sending it; answers the dedup read from
# $SB/existing.txt and the read-back from the recorded body.
mkdir -p "$SB/bin"
cat > "$SB/bin/gh" <<FAKE
#!/bin/bash
SB="$SB"
case "\$*" in
  *"pr view"*comments*) cat "\$SB/existing.txt" ;;
  *"pr comment"*)
      # Print the new comment's URL, as the real `gh pr comment` does: the tool parses the
      # #issuecomment-<id> fragment out of it so the read-back reads ITS OWN comment rather than
      # `.[-1]`, which with 16 slots live can be a peer's comment posted in between.
      echo "https://github.com/vjeux/fcp-headless-transitions/pull/600#issuecomment-4242"
      # Record the body whether it arrives as --body-file <path> or as --body <text>. Accepting BOTH
      # is what keeps this harness from being blind to the OLD implementation: it posts through
      # --body, so a fake that understood only --body-file would fail every case against it — turning
      # a precise negative control ("the refusals are missing") into an uninformative wall of red.
      prev=""; for a in "\$@"; do
        [ "\$prev" = "--body-file" ] && cp "\$a" "\$SB/posted.txt"
        [ "\$prev" = "--body" ] && printf '%s' "\$a" > "\$SB/posted.txt"
        prev="\$a"
      done ;;
  # CODEPOINTS, not bytes — this is what jq's `.body|length` returns, and counting bytes on one
  # side and codepoints on the other is the false alarm the em-dash case below exists to catch.
  *"api"*issues/comments/4242*) [ -f "\$SB/posted.txt" ] && python3 -c 'import sys;print(len(open(sys.argv[1],"rb").read().decode("utf-8","replace")))' "\$SB/posted.txt" || echo 0 ;;
  # THE `.[-1]` FALLBACK ANSWERS WITH A PEER'S COMMENT. 999999 stands for another agent commenting
  # between the POST and the read-back — the race that makes `.[-1]` the wrong question with 16
  # slots live. The shipped tool reads its OWN id (the branch above) and never sees this; a tool
  # that falls back to `.[-1]` reports a mismatch on a comment that is perfectly intact.
  *"api"*comments*) echo 999999 ;;
  *) : ;;
esac
FAKE
chmod +x "$SB/bin/gh"

# PER-CASE TIMEOUT. It is a real assertion — case "expect-head with NO value" exists because
# a bad argv made the parse loop SPIN FOREVER, and 124 is reported as a HUNG parse loop. But
# 10s is a property of an idle box: wired into prove_all (LAYER 2j), which every reviewer runs
# at startup, a case that merely LOSES A RACE on a 16-agent box reads as "the verifier is
# broken" and stops the swarm — the failure test_guards case E already cost us once. Observed
# exactly that while wiring it: 23/24 under a concurrent prove_all, 24/24 twice immediately
# after, no change to anything. A hang is unbounded, so 60s discriminates just as well.
CASE_TIMEOUT="${ARGV_CASE_TIMEOUT:-60}"
pass=0; fail=0
run () { rm -f "$SB/posted.txt"; (cd "$SB" && PATH="$SB/bin:$PATH" timeout "$CASE_TIMEOUT" "$SB/pr_comment_once.sh" "$@" 2>&1); }
posted_body () { # the body WITHOUT the trailing marker block
  [ -f "$SB/posted.txt" ] || { echo "NONE"; return; }
  python3 - "$SB/posted.txt" <<'PY'
import re,sys
t=open(sys.argv[1]).read()
print(re.sub(r'\n\n<!--rc:[^>]*-->\s*$','',t))
PY
}

check () { # <label> <expected-exit> <expected-body-or-NONE> -- <args...>
  local label="$1" want_rc="$2" want_body="$3"; shift 4
  local out rc got why=""
  out=$(run "$@"); rc=$?
  got=$(posted_body)
  [ "$rc" = "$want_rc" ] || why="exit $rc (want $want_rc)"
  [ "$got" = "$want_body" ] || why="$why body [$(printf '%.60s' "$got")] (want [$(printf '%.40s' "$want_body")])"
  if [ -z "$why" ]; then pass=$((pass+1)); printf '  ok   %s\n' "$label"
  else fail=$((fail+1)); printf '  FAIL %s -- %s\n' "$label" "$why"
       [ "$rc" = 124 ] && printf '       (124 = the parse loop HUNG)\n'; fi
}

echo "test_pr_comment_once_argv: $TARGET"
echo "-- the shapes that must WORK --"
check "body-file alone"               0 "$BODY_TEXT" -- 600 --body-file "$SB/body.md"
check "literal body alone"            0 "a literal body" -- 600 "a literal body"
check "literal multi-word body"       0 "two words" -- 600 two words
check "-- then a literal body"        0 "after the dashes" -- 600 -- "after the dashes"

echo "-- the shapes that must REFUSE (each one would post a flag as the record) --"
# RULE, learned on this file in review: for every case here, ask WHICH guard answers it, and make
# sure no OTHER guard can. Three of the six refusals were deletable with this suite green on its
# first head — two because a sibling guard answered them (both cases below now carry a literal body
# so the behaviours differ) and one because it is genuinely equivalent (the unreadable-file check:
# `cat` of a missing file yields an empty body, which the empty-body guard refuses, so no input
# distinguishes them — reported, not counted). A suite whose cases are answerable by a sibling
# guard measures the DISJUNCTION of your guards, not each of them.
check "body-file with EMPTY value"    2 NONE -- 600 --body-file "" "real evidence"
check "body-file with NO value"       2 NONE -- 600 --body-file
check "literal body BEFORE body-file" 2 NONE -- 600 "real evidence" --body-file "$SB/body.md"
check "body-file plus trailing words" 2 NONE -- 600 --body-file "$SB/body.md" and some words
check "unknown flag"                  2 NONE -- 600 --nope "real evidence"
check "unreadable body file"          2 NONE -- 600 --body-file "$SB/nope.md"
check "no body at all"                2 NONE -- 600

echo "-- idempotence keys on the REAL body (a mangled body also breaks the dedup) --"
run 600 --body-file "$SB/body.md" >/dev/null
cp "$SB/posted.txt" "$SB/existing.txt"
out=$(run 600 --body-file "$SB/body.md"); rc=$?
if [ "$rc" = 0 ] && printf '%s' "$out" | grep -q "skipping duplicate" && [ ! -f "$SB/posted.txt" ]; then
  pass=$((pass+1)); printf '  ok   second identical call posts nothing\n'
else
  fail=$((fail+1)); printf '  FAIL second identical call should have skipped -- rc=%s out=%.60s\n' "$rc" "$out"
fi
out=$(run 600 --body-file "$SB/body.md" 2>&1)   # marker still present, different tmp file
: > "$SB/existing.txt"

echo "-- the read-back reports the stored length --"
out=$(run 600 --body-file "$SB/body.md")
if printf '%s' "$out" | grep -q "read back and confirmed"; then
  pass=$((pass+1)); printf '  ok   posts and confirms the stored body length\n'
else
  fail=$((fail+1)); printf '  FAIL no read-back confirmation in: %.80s\n' "$out"
fi

echo "-- the read-back must not cry wolf on non-ASCII, with the locale a launchd agent has --"
printf 'evidence — with em dashes — three of them —\n' > "$SB/emdash.md"
rm -f "$SB/posted.txt"
out=$(cd "$SB" && env -u LANG -u LC_ALL -u LC_CTYPE PATH="$SB/bin:$PATH" timeout "$CASE_TIMEOUT" "$SB/pr_comment_once.sh" 600 --body-file "$SB/emdash.md" 2>&1)
if printf '%s' "$out" | grep -q "read back and confirmed"; then
  pass=$((pass+1)); printf '  ok   a non-ASCII body reads back as intact in a byte-locale\n'
else
  fail=$((fail+1)); printf '  FAIL the read-back miscounted a non-ASCII body: %.100s\n' "$out"
fi

echo "test_pr_comment_once_argv: $pass passed, $fail failed"
[ "$fail" = 0 ] || exit 1
