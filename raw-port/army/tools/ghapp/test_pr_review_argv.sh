#!/bin/bash
# test_pr_review_argv.sh [path-to-pr_review.sh] — lock the argv contract of pr_review.sh.
#
# WHY THIS TEST EXISTS. Every bug this file guards against ends the same way: exit 0, a plausible
# success line, and a permanent review whose EVIDENCE IS GONE. The body is the whole product of a
# review, and four separate argv shapes have destroyed it or wedged the caller:
#
#   * an unknown flag captured as the body (11KB of a differential lost, at exit 0);
#   * `--body-file "$EVIDENCE"` with the variable unset — the empty value was consumed, the flag was
#     re-emitted, and the review posted was the 12 characters "--body-file ";
#   * `--expect-head $SHA` with the variable unset — one positional left, `shift 2` shifted NOTHING,
#     and the parse loop SPUN FOREVER holding a review lease and a slot lock;
#   * a literal body BEFORE `--body-file` — the flag and the path entered the review body and the
#     file's contents were discarded.
#
# None of them is visible from the caller's side, which is why they are pinned mechanically here.
# The test runs the REAL script against a FAKE gh_as.sh in a throwaway sandbox: no network, nothing
# is posted, and the assertion is on the body that WOULD have been submitted.
#
# Run it against another copy to watch it fail, which is the only way a guard is evidence:
#   bash test_pr_review_argv.sh /path/to/an/older/pr_review.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-$HERE/pr_review.sh}"
[ -r "$TARGET" ] || { echo "no such script: $TARGET" >&2; exit 2; }

SB="$(mktemp -d "${TMPDIR:-/tmp}/pr_review_argv.XXXXXX")"
trap 'rm -rf "$SB"' EXIT
mkdir -p "$SB/state/ghapp"
printf '{"slug":"sandbox-reviewer"}' > "$SB/state/ghapp/reviewer.json"
printf 'real body evidence, thirty-plus characters of it\n' > "$SB/body.md"
cp "$TARGET" "$SB/pr_review.sh"; chmod +x "$SB/pr_review.sh"

# FAKE gh_as.sh, resolved through the script's own ROOT=dirname($0). Answers the three calls the
# script makes and records the submitted payload instead of sending it.
cat > "$SB/gh_as.sh" <<'FAKE'
#!/bin/bash
SB="$(cd "$(dirname "$0")" && pwd)"
case "$*" in
  *"pr view"*headRefOid*) echo "aaaaaaaa11111111aaaaaaaa11111111aaaaaaaa" ;;
  *"api -X POST"*reviews*)
      cat > "$SB/posted.json"
      python3 -c "import json;d=json.load(open('$SB/posted.json'));print(json.dumps({'state':'CHANGES_REQUESTED','body':d['body'],'commit_id':d['commit_id']}))" ;;
  *reviews*) echo "[]" ;;
  *) echo "" ;;
esac
FAKE
chmod +x "$SB/gh_as.sh"

SHA=aaaaaaaa11111111aaaaaaaa11111111aaaaaaaa
BODY_TEXT="real body evidence, thirty-plus characters of it"
pass=0; fail=0

check () { # <label> <expected-exit> <expected-body-or-NONE> -- <args...>
  local label="$1" want_rc="$2" want_body="$3"; shift 4
  rm -f "$SB/posted.json"
  local out rc got
  out=$(cd "$SB" && FCT_STATE_DIR="$SB/state" timeout 10 "$SB/pr_review.sh" "$@" 2>&1); rc=$?
  if [ -f "$SB/posted.json" ]; then
    got=$(python3 -c "import json;print(json.load(open('$SB/posted.json'))['body'])" 2>/dev/null)
  else
    got="NONE"
  fi
  local why=""
  [ "$rc" = "$want_rc" ] || why="exit $rc (want $want_rc)"
  [ "$got" = "$want_body" ] || why="$why body $(printf '%.60s' "$got") (want $(printf '%.40s' "$want_body"))"
  if [ -z "$why" ]; then
    pass=$((pass+1)); printf '  ok   %s\n' "$label"
  else
    fail=$((fail+1)); printf '  FAIL %s -- %s\n' "$label" "$why"
    [ "$rc" = 124 ] && printf '       (124 = the parse loop HUNG)\n'
  fi
}

echo "test_pr_review_argv: $TARGET"
echo "-- the shapes that must WORK (a regression here breaks every reviewer) --"
check "expect-head + body-file"        0 "$BODY_TEXT" -- 596 request-changes --expect-head "$SHA" --body-file "$SB/body.md"
check "body-file + expect-head"        0 "$BODY_TEXT" -- 596 request-changes --body-file "$SB/body.md" --expect-head "$SHA"
check "body-file alone"                0 "$BODY_TEXT" -- 596 request-changes --body-file "$SB/body.md"
check "literal body alone"             0 "a literal body" -- 596 request-changes "a literal body"
check "literal multi-word body"        0 "two words" -- 596 request-changes two words
check "-- then a literal body"         0 "after the dashes" -- 596 request-changes -- "after the dashes"
check "approve needs no body"          0 "" -- 596 approve

echo "-- the shapes that must REFUSE (each one destroyed a review body or wedged a slot) --"
check "body-file with EMPTY value"     2 NONE -- 596 request-changes --body-file ""
check "body-file with NO value"        2 NONE -- 596 request-changes --body-file
check "expect-head with NO value"      2 NONE -- 596 request-changes --body-file "$SB/body.md" --expect-head
check "expect-head EMPTY (unbinds)"    2 NONE -- 596 request-changes --expect-head "" --body-file "$SB/body.md"
check "literal body BEFORE body-file"  2 NONE -- 596 request-changes "real evidence" --body-file "$SB/body.md"
check "body-file plus trailing words"  2 NONE -- 596 request-changes --body-file "$SB/body.md" and some words
check "unknown flag"                   2 NONE -- 596 request-changes --nope --body-file "$SB/body.md"
check "unreadable body file"           2 NONE -- 596 request-changes --body-file "$SB/nope.md"
check "request-changes with no body"   2 NONE -- 596 request-changes
check "bad verdict word"               2 NONE -- 596 rubber-stamp --body-file "$SB/body.md"

echo "-- the head binding --"
check "expect-head matching the head"  0 "$BODY_TEXT" -- 596 request-changes --expect-head "$SHA" --body-file "$SB/body.md"
check "expect-head that MOVED"         5 NONE -- 596 request-changes --expect-head deadbeefdeadbeefdeadbeefdeadbeefdeadbeef --body-file "$SB/body.md"

echo "test_pr_review_argv: $pass passed, $fail failed"
[ "$fail" = 0 ] || exit 1
