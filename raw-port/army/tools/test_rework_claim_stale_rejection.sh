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
# `gh pr list`  -> the three candidate PRs, all CHANGES_REQUESTED ($FAKE_PRLIST); when the call asks
#                  for `statusCheckRollup` it is the SECOND ARM's query and is served $FAKE_SFLIST
#                  (the open PRs whose latest faithfulness-gate is a FAILURE).
# `gh api .../pulls/<n>/reviews` -> the commit each rejection was recorded against, from $TMP/rej.<n>
#                                   (an ABSENT file models a transport failure: empty output).
# `gh api .../commits/<sha>/statuses` -> that head's faithfulness-gate DESCRIPTION, from $TMP/desc.<sha>
mkdir -p "$TMP/bin"
cat > "$TMP/bin/gh" <<'FAKE'
#!/bin/bash
case "$1 $2" in
  "pr list")
    for a in "$@"; do case "$a" in *statusCheckRollup*) [ -f "$FAKE_SFLIST" ] && cat "$FAKE_SFLIST"; exit 0;; esac; done
    cat "$FAKE_PRLIST" ;;
  "api "*)
    for a in "$@"; do case "$a" in
      repos/*/pulls/*/reviews) n=$(echo "$a" | cut -d/ -f5);;
      repos/*/commits/*/statuses) s=$(echo "$a" | cut -d/ -f5); [ -f "$FAKE_DIR/desc.$s" ] && cat "$FAKE_DIR/desc.$s"; exit 0;;
    esac; done
    # FLAKY MODE: for the PR named in $FAKE_FLAKY, the first N calls die the way `gh` really dies on
    # this box (TLS verify failure, empty stdout, non-zero exit) and later calls answer normally.
    if [ -n "$FAKE_FLAKY" ] && [ "$n" = "$FAKE_FLAKY" ]; then
      c=$(cat "$FAKE_DIR/flaky.count" 2>/dev/null || echo 0); c=$((c+1)); echo "$c" > "$FAKE_DIR/flaky.count"
      if [ "$c" -le "${FAKE_FLAKY_FAILS:-1}" ]; then
        echo "tls: failed to verify certificate: x509: certificate signed by unknown authority" >&2
        exit 1
      fi
    fi
    [ -f "$FAKE_DIR/rej.$n" ] && cat "$FAKE_DIR/rej.$n"
    ;;
esac
exit 0
FAKE
chmod +x "$TMP/bin/gh"
# `git` is called once (`git fetch -q origin main || true`); stub it so no network/repo is needed.
printf '#!/bin/bash\nexit 0\n' > "$TMP/bin/git"; chmod +x "$TMP/bin/git"

export FAKE_DIR="$TMP"
export FAKE_FLAKY=""
export FAKE_PRLIST="$TMP/prlist"
export FAKE_SFLIST="$TMP/sflist"
export PATH="$TMP/bin:$PATH"
export HOME="$TMP/home"
mkdir -p "$HOME/random/final-cut-pro-transitions"
export FCT_STATE_DIR="$HOME/.fct-pool"

# jq is what the real tool uses to shape `pr list`; the fake serves the SHAPED output directly.
# 501 = rejection on the CURRENT head (still the author's turn)
# 502 = rejection on an OLDER head (already reworked -> the reviewer's turn)
# 503 = the reviews API answers nothing (transport failure -> must NOT be skipped)
printf '502\tport/Reworked\tbbbbbbbbbbbb\trejection\n503\tport/Unknown\tcccccccccccc\trejection\n501\tport/Standing\taaaaaaaaaaaa\trejection\n' > "$FAKE_PRLIST"
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
printf '501\tport/Standing\taaaaaaaaaaaa\trejection\n' > "$FAKE_PRLIST"
out=$(run)
echo "$out" | grep -q "CLAIMED 501" \
  && ok "a rejection recorded against the current head is still worker work" \
  || bad "the queue must still offer a genuine, unanswered rejection" "got: $out"

# --- CASE 4: the attempt counter is not charged for a skipped PR --------------------------------
printf '502\tport/Reworked\tbbbbbbbbbbbb\trejection\n501\tport/Standing\taaaaaaaaaaaa\trejection\n' > "$FAKE_PRLIST"
run >/dev/null
[ ! -f "$FCT_STATE_DIR/rework_attempts/502" ] \
  && ok "a skipped PR is not charged an attempt (that is how #143 reached 3/3)" \
  || bad "a PR skipped as already-reworked must not burn its cap" \
         "attempts=$(cat "$FCT_STATE_DIR/rework_attempts/502" 2>/dev/null)"

# THE SECOND ARM — a PR the GATE reddened for something only its author can fix.
#
# `pr_gate.sh`'s stale-file guard posts `faithfulness-gate = failure` described as "deletes lines
# that are on main without a reverts-ok: declaration". There is no REVIEW to select on, so before
# this arm the PR was claimable by nothing: rebase_claim greps regression|rebase|add-only|G6|gate
# reject, review_claim skips a FAILURE that is latest-for-head, and this queue read reviewDecision
# alone. Raised on the review of #600; these cases are what stop it coming back.
# ================================================================================================
printf '' > "$FAKE_PRLIST"          # nobody is CHANGES_REQUESTED
printf '601\tfix/DeletesLines\tddddddddffff\n' > "$FAKE_SFLIST"
printf 'deletes lines that are on main without a reverts-ok: declaration\n' > "$TMP/desc.ddddddddffff"

# --- CASE 5: the gate-red PR is offered, with the remedy in the claim line -----------------------
out=$(run)
if echo "$out" | grep -q "CLAIMED 601"; then
  ok "a PR red for the stale-file guard is routed to a worker (it belonged to no queue before)"
  echo "$out" | grep -q "reverts-ok" \
    && ok "the claim line carries the gate's own reproducer, since there is no review body" \
    || bad "a stale-file claim must name the remedy" "got: $out"
else
  bad "the stale-file arm must offer the PR" "got: $out"
fi

# --- CASE 6: an OLD rejection on that same PR must not make the arm skip it ----------------------
# The head is red RIGHT NOW; a rejection recorded three heads ago says nothing about that, and the
# arm-1 test would read it as "waiting on a reviewer" and drop the PR back into no-queue.
printf 'oldoldoldold\n' > "$TMP/rej.601"
out=$(run)
echo "$out" | grep -q "CLAIMED 601" \
  && ok "a stale-file row is not skipped by the already-reworked test (its status is on THIS head)" \
  || bad "an old rejection must not suppress a CURRENT mechanical failure" "got: $out"
rm -f "$TMP/rej.601"

# --- CASE 7: a gate failure for a DIFFERENT reason is NOT this queue's ---------------------------
# `regression (rebase needed)` belongs to rebase_claim; claiming it here would be two queues holding
# one PR, which is what the lease exists to prevent.
printf 'regression (rebase needed): DIRTY on OPS_LOG.md\n' > "$TMP/desc.ddddddddffff"
out=$(run)
echo "$out" | grep -q "CLAIMED 601" \
  && bad "a regression/rebase failure must stay with the REBASE queue" "got: $out" \
  || ok "the arm matches only the stale-file wording, not every red gate"

# --- CASE 8: a TRANSIENT failure of the reviews call must not defeat the guard ------------------
# This is the failure that actually happened. `gh` on this box intermittently exits non-zero with a
# TLS verification error and succeeds on the very next call; the guard read that as "no answer",
# failed open, and handed out #655 — whose author had already reworked it twice. The retry is what
# closes it, so the case makes the FIRST call fail and asserts the PR is still skipped.
rm -f "$FCT_STATE_DIR/rework_leases/502" "$FCT_STATE_DIR/rework_attempts/502" 2>/dev/null
rmdir "$FCT_STATE_DIR/rework_leases/502" 2>/dev/null
rm -f "$TMP/flaky.count"
export FAKE_FLAKY=502 FAKE_FLAKY_FAILS=1
printf '502\tport/Reworked\tbbbbbbbbbbbb\n501\tport/Standing\taaaaaaaaaaaa\n' > "$FAKE_PRLIST"
out=$(run)
export FAKE_FLAKY=""
if grep -q "PR #502 already reworked" "$TMP/err"; then
  ok "one transient TLS failure does not defeat the already-reworked guard (it retries)"
else
  bad "a retryable transport failure must not fail open into handing out finished work" \
      "stdout: $out ; stderr: $(cat "$TMP/err")"
fi

# =========================================================================================echo
echo "REWORK_CLAIM_STALE_REJECTION: $pass passed, $fail failed"
[ "$fail" = 0 ] || exit 1
