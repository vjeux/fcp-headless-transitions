#!/usr/bin/env bash
# test_rework_author_answered.sh — LOCKED test for rework_claim's AUTHOR-ANSWERED test.
#
# WHAT IT PINS. `rework_claim.sh` skips a CHANGES_REQUESTED PR when the author has already answered
# the rejection. That test used to be `rej != head`, a bare SHA comparison, and a head moves for
# reasons that are not an answer: a reviewer's `update-branch`, a worker clearing a conflict out of
# the REBASE queue, GitHub's merge-main button. Measured live on #656 (2026-08-11): one commit,
# `merge origin/main into tools/slot-liveness`, moved the head without carrying a line of the
# author's, and rework_claim then reported the PR "already reworked" forever while its
# reviewDecision stayed CHANGES_REQUESTED. Work no queue could see — this file's oldest failure
# shape, re-entering through the fix for its opposite.
#
# HOW. The function is EXTRACTED FROM THE SHIPPED FILE (never a copy pasted in here — a copy is a
# second source of truth and this repo's log is mostly what happens when two of those drift) and
# driven against REAL git fixtures: no network, no gh, no leases, no $FCT_STATE_DIR. ~1s.
#
# Every case is stated as "what a worker would see", and the last block is a MUTATION check: it
# restores the old bare-SHA test and asserts the suite then FAILS. A test that cannot fail is
# decoration.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$HERE/rework_claim.sh"
[ -f "$SRC" ] || { echo "test_rework_author_answered: FAIL (cannot find rework_claim.sh)"; exit 1; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# ── extract author_answered() verbatim from the shipped script ────────────────────────────────
awk '/^author_answered \(\) \{/,/^\}/' "$SRC" > "$WORK/fn.sh"
if ! grep -q 'rev-list --no-merges' "$WORK/fn.sh" || ! grep -q 'cat-file -e' "$WORK/fn.sh"; then
  echo "test_rework_author_answered: FAIL (could not extract author_answered from rework_claim.sh)"
  exit 1
fi

fails=0
ok () { echo "  OK    $1"; }
bad () { echo "  FAIL  $1 — $2"; fails=$((fails+1)); }

# ── fixtures: one repo, one branch per case ───────────────────────────────────────────────────
REPO="$WORK/repo"
mkdir -p "$REPO"
git -C "$REPO" init -q -b main
git -C "$REPO" config user.email w@x; git -C "$REPO" config user.name w
seed () { printf '%s\n' "$1" > "$REPO/$2"; git -C "$REPO" add -A; git -C "$REPO" commit -q -m "$3"; }

seed base file.txt "base"
MAIN0=$(git -C "$REPO" rev-parse HEAD)
# a branch with the author's original work — this is the commit the reviewer rejected
git -C "$REPO" checkout -q -b feature
seed "author v1" feature.txt "port: the author's work"
REJ=$(git -C "$REPO" rev-parse HEAD)
# main moves on, in a file the branch does not touch
git -C "$REPO" checkout -q main
seed "main moved" other.txt "someone else's PR lands"
MAIN1=$(git -C "$REPO" rev-parse HEAD)
# `origin/main` is what the function excludes; make it exist locally
git -C "$REPO" update-ref refs/remotes/origin/main "$MAIN1"

# The function fetches refs/pull/<n>/head best-effort; with no remote that is a silent no-op, and
# every SHA below is already local. That path is exercised by case F.
run_case () { # <headSHA> ; echoes ANSWERED or AUTHORS-TURN
  ( cd "$REPO" && . "$WORK/fn.sh" && if author_answered 7 "$REJ" "$1"; then echo ANSWERED; else echo AUTHORS-TURN; fi )
}

# A. nothing happened: head IS the rejected commit.
[ "$(run_case "$REJ")" = "AUTHORS-TURN" ] && ok "head == the rejected commit -> the author's turn" \
  || bad "head == rejected" "expected AUTHORS-TURN"

# B. THE BUG. A clean merge of main, carrying no author content, moved the head.
git -C "$REPO" checkout -q -B case_b "$REJ"
git -C "$REPO" merge -q --no-ff -m "merge origin/main into feature" "$MAIN1"
B=$(git -C "$REPO" rev-parse HEAD)
[ "$B" != "$REJ" ] || bad "case B setup" "the head did not move"
[ "$(run_case "$B")" = "AUTHORS-TURN" ] \
  && ok "a clean merge of main moved the head -> STILL the author's turn (the #656 case)" \
  || bad "clean merge of main" "expected AUTHORS-TURN — this is the bug the fix exists for"

# C. a real rework: the author pushed a new commit.
git -C "$REPO" checkout -q -B case_c "$REJ"
seed "author v2" feature.txt "rework: address the review"
C=$(git -C "$REPO" rev-parse HEAD)
[ "$(run_case "$C")" = "ANSWERED" ] && ok "a new non-merge commit -> answered, hand it to a reviewer" \
  || bad "new author commit" "expected ANSWERED"

# D. a merge that RESOLVED a conflict is STILL not an answer to the review. This is the sharp
#    edge of the rule and the case that changed during development: reconciling a branch with main
#    is real work, but it is not work on anything the reviewer asked for, and reviewDecision stays
#    CHANGES_REQUESTED. Measured on #656's own history — the merge a rebase worker pushed there
#    HAD resolved a conflict, so a tree-comparing version of this function still skipped the PR.
git -C "$REPO" checkout -q main
seed "main edits the shared file" shared.txt "main touches shared.txt"
MAIN2=$(git -C "$REPO" rev-parse HEAD)
git -C "$REPO" update-ref refs/remotes/origin/main "$MAIN2"
git -C "$REPO" checkout -q -B case_d "$REJ"
printf 'branch edits the shared file\n' > "$REPO/shared.txt"
git -C "$REPO" add -A; git -C "$REPO" commit -q -m "port: the author touches shared.txt"
REJ_D=$(git -C "$REPO" rev-parse HEAD)     # rejected AFTER that commit, so it is not new work
git -C "$REPO" merge -q --no-ff -m "merge origin/main into feature" "$MAIN2" >/dev/null 2>&1
printf 'both, reconciled by hand\n' > "$REPO/shared.txt"
git -C "$REPO" add -A
git -C "$REPO" commit -q --no-edit >/dev/null 2>&1 || git -C "$REPO" commit -q -m "merge origin/main into feature"
D=$(git -C "$REPO" rev-parse HEAD)
D_ANS=$( cd "$REPO" && . "$WORK/fn.sh" && if author_answered 7 "$REJ_D" "$D"; then echo ANSWERED; else echo AUTHORS-TURN; fi )
if [ "$(git -C "$REPO" rev-list --merges "$REJ_D..$D" | wc -l | tr -d ' ')" = "1" ] \
   && [ "$(git -C "$REPO" rev-list --no-merges "$REJ_D..$D" --not refs/remotes/origin/main | wc -l | tr -d ' ')" = "0" ]; then
  [ "$D_ANS" = "AUTHORS-TURN" ] \
    && ok "a merge that RESOLVED a conflict -> still the author's turn (the review is unanswered)" \
    || bad "resolved merge" "expected AUTHORS-TURN: a conflict resolution answers main, not the reviewer"
else
  bad "case D setup" "expected exactly one merge and no new non-merge commit off main"
fi

# E. a force-push that rewrote the rejected commit away is author work.
git -C "$REPO" checkout -q -B case_e "$MAIN1"
seed "rewritten" feature.txt "port: rewritten from scratch"
E=$(git -C "$REPO" rev-parse HEAD)
GONE=$(printf '%s' "$REJ" | sed 's/^./f/')   # a well-formed SHA that is not in this repo
[ "$(run_case "$E")" = "ANSWERED" ] && ok "a later head with its own commits -> answered" \
  || bad "rewritten branch" "expected ANSWERED"
E_ANS=$( cd "$REPO" && . "$WORK/fn.sh" && if author_answered 7 "$GONE" "$E"; then echo ANSWERED; else echo AUTHORS-TURN; fi )
[ "$E_ANS" = "ANSWERED" ] && ok "the rejected commit is unreachable (force-push) -> answered" \
  || bad "unreachable rejection" "expected ANSWERED"

# F. it cannot see the head at all -> OFFER, never a silent skip.
UNKNOWN_SHA=$(printf '%s' "$MAIN1" | sed 's/^./f/')
F_ANS=$( cd "$REPO" && . "$WORK/fn.sh" && if author_answered 7 "$REJ" "$UNKNOWN_SHA"; then echo ANSWERED; else echo AUTHORS-TURN; fi )
[ "$F_ANS" = "AUTHORS-TURN" ] && ok "an unfetchable head -> offer the PR (never a silent skip)" \
  || bad "unknown head" "expected AUTHORS-TURN: not knowing is not a verdict"

# G. an empty/null rejection SHA is a transport failure, not a verdict -> OFFER.
for empty in "" "null"; do
  G_ANS=$( cd "$REPO" && . "$WORK/fn.sh" && if author_answered 7 "$empty" "$C"; then echo ANSWERED; else echo AUTHORS-TURN; fi )
  [ "$G_ANS" = "AUTHORS-TURN" ] && ok "rejection SHA '${empty:-<empty>}' -> offer the PR" \
    || bad "empty rejection SHA '${empty:-<empty>}'" "expected AUTHORS-TURN"
done

# ── MUTATION: put the old bare-SHA test back and require this suite to notice ──────────────────
cat > "$WORK/mutant.sh" <<'MUT'
author_answered () { # the PRE-FIX behaviour: any moved head counts as an answer
  local num="$1" rej="$2" head="$3"
  [ -n "$rej" ] && [ "$rej" != "null" ] && [ "$rej" != "$head" ]
}
MUT
M_B=$( cd "$REPO" && . "$WORK/mutant.sh" && if author_answered 7 "$REJ" "$B"; then echo ANSWERED; else echo AUTHORS-TURN; fi )
if [ "$M_B" = "ANSWERED" ]; then
  ok "mutation — the old bare-SHA test calls the #656 merge an answer, and case B catches it"
else
  bad "mutation" "the pre-fix test did not reproduce the bug, so case B proves nothing"
fi

if [ "$fails" = 0 ]; then echo "test_rework_author_answered: PASS"; else
  echo "test_rework_author_answered: FAIL ($fails)"; fi
exit $([ "$fails" = 0 ] && echo 0 || echo 1)
