#!/bin/bash
# test_rework_claim_stale_rejection.sh — locks the rule that the REWORK queue only offers a PR that
# is genuinely waiting on its AUTHOR.
#
# THE BUG THIS PINS. `gh pr list --json reviewDecision` reports CHANGES_REQUESTED until a reviewer
# dismisses or re-reviews; an author pushing a fix does NOT clear it. So the queue kept handing
# already-reworked PRs to workers — measured 2026-08-11, two of one worker's six claims (#114 and
# #143, the latter fixed by a peer 14 minutes earlier), and #143 hit the 3-attempt cap without
# anything having failed. The discriminator is the head SHA the rejection was RECORDED against.
#
# SELF-CONTAINED: a fake `gh` on PATH serves canned JSON, HOME points at a scratch dir (so the real
# ~/.fct-pool leases and the live 24-slot pool are never touched), and the script under test is the
# one in this checkout. Run it directly:
#     bash raw-port/army/tools/test_rework_claim_stale_rejection.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TOOL="$HERE/rework_claim.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
pass=0; fail=0
ok   () { echo "  ok   — $1"; pass=$((pass+1)); }
bad  () { echo "  FAIL — $1"; echo "         $2"; fail=$((fail+1)); }

# --- the fake gh ------------------------------------------------------------------------------
# `gh pr list`  -> the three candidate PRs, all CHANGES_REQUESTED.
# `gh api .../pulls/<n>/reviews` -> the commit each rejection was recorded against, from $TMP/rej.<n>
#                                   (an ABSENT file models a transport failure: empty output).
mkdir -p "$TMP/bin"
cat > "$TMP/bin/gh" <<'FAKE'
#!/bin/bash
case "$1 $2" in
  "pr list")
    cat "$FAKE_PRLIST" ;;
  "api "*)
    for a in "$@"; do case "$a" in repos/*/pulls/*/reviews) n=$(echo "$a" | cut -d/ -f5);; esac; done
    [ -f "$FAKE_DIR/rej.$n" ] && cat "$FAKE_DIR/rej.$n"
    ;;
esac
exit 0
FAKE
chmod +x "$TMP/bin/gh"
# `git` is called once (`git fetch -q origin main || true`); stub it so no network/repo is needed.
printf '#!/bin/bash\nexit 0\n' > "$TMP/bin/git"; chmod +x "$TMP/bin/git"

export FAKE_DIR="$TMP"
export FAKE_PRLIST="$TMP/prlist"
export PATH="$TMP/bin:$PATH"
export HOME="$TMP/home"
mkdir -p "$HOME/random/final-cut-pro-transitions"
export FCT_STATE_DIR="$HOME/.fct-pool"

# jq is what the real tool uses to shape `pr list`; the fake serves the SHAPED output directly.
# 501 = rejection on the CURRENT head (still the author's turn)
# 502 = rejection on an OLDER head (already reworked -> the reviewer's turn)
# 503 = the reviews API answers nothing (transport failure -> must NOT be skipped)
printf '502\tport/Reworked\tbbbbbbbbbbbb\n503\tport/Unknown\tcccccccccccc\n501\tport/Standing\taaaaaaaaaaaa\n' > "$FAKE_PRLIST"
printf 'aaaaaaaaaaaa\n' > "$TMP/rej.501"
printf 'oldoldoldold\n' > "$TMP/rej.502"
# no rej.503 on purpose

run () { rm -rf "$FCT_STATE_DIR/rework_leases"; bash "$TOOL" claim 2>"$TMP/err"; }

# --- CASE 1: the already-reworked PR is skipped -------------------------------------------------
out=$(run)
if echo "$out" | grep -q "CLAIMED 502"; then
  bad "an already-reworked PR (rejection on an older head) must NOT be offered" "got: $out"
else
  ok "an already-reworked PR is skipped"
fi
grep -q "already reworked" "$TMP/err" \
  && ok "the skip says why, naming both SHAs" \
  || bad "the skip must explain itself on stderr" "stderr: $(cat "$TMP/err")"

# --- CASE 2: a PR whose reviews API says nothing is still offered (no starvation) ---------------
# 502 is skipped, so the next candidate in the list is 503 (unknown) — it must be claimed.
if echo "$out" | grep -q "CLAIMED 503"; then
  ok "an unanswered reviews API offers the PR rather than starving the queue"
else
  bad "an empty/failed reviews API must not be read as a verdict" "got: $out"
fi

# --- CASE 3: a standing rejection on the CURRENT head is still offered --------------------------
printf '501\tport/Standing\taaaaaaaaaaaa\n' > "$FAKE_PRLIST"
out=$(run)
echo "$out" | grep -q "CLAIMED 501" \
  && ok "a rejection recorded against the current head is still worker work" \
  || bad "the queue must still offer a genuine, unanswered rejection" "got: $out"

# --- CASE 4: the attempt counter is not charged for a skipped PR --------------------------------
printf '502\tport/Reworked\tbbbbbbbbbbbb\n501\tport/Standing\taaaaaaaaaaaa\n' > "$FAKE_PRLIST"
run >/dev/null
[ ! -f "$FCT_STATE_DIR/rework_attempts/502" ] \
  && ok "a skipped PR is not charged an attempt (that is how #143 reached 3/3)" \
  || bad "a PR skipped as already-reworked must not burn its cap" \
         "attempts=$(cat "$FCT_STATE_DIR/rework_attempts/502" 2>/dev/null)"

echo
echo "REWORK_CLAIM_STALE_REJECTION: $pass passed, $fail failed"
[ "$fail" = 0 ] || exit 1
