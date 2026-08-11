#!/bin/bash
# test_publish_guard.sh — locks the two refusals that would have prevented the #690 loss.
#
# THE INCIDENT (2026-08-11, worker 9, PR #690 `tools/rework-author-answered`): `rebase_pr.sh`'s
# `checkout -B "$BR" "origin/$BR" 2>/dev/null` failed because a peer worker held that branch in
# another pool worktree; the error was swallowed; the tool rebased and force-pushed the branch
# wt_pool had cut from main instead, and the PR's 5 files / 382 lines vanished from the branch
# behind the line `REBASE_CLEAN: … + gate PASS, force-pushed`.
#
# SELF-CONTAINED: scratch repos under $TMPDIR, a real `origin` (a bare repo), no network, no gh, no
# touching ~/.fct-pool or the live pool. Run it directly:
#     bash raw-port/army/tools/test_publish_guard.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SELF="$HERE/$(basename "$0")"
# The mutation runs re-invoke THIS file against a MUTATED copy of the guard, selected by env var.
# (The first version copied "$0" into the scratch dir and re-ran that; the copy silently failed
# because the suite cd's around and $0 was relative, so every mutant "died" of a missing file —
# a lock that cannot fail, which is the exact failure this repo keeps filing. An M0 control is
# included below so that cannot come back unnoticed.)
GUARD="${PUBLISH_GUARD_BIN:-$HERE/publish_guard.sh}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
PASS=0; FAIL=0
ok  () { echo "  ok   — $1"; PASS=$((PASS+1)); }
bad () { echo "  FAIL — $1"; echo "         $2"; FAIL=$((FAIL+1)); }
check () { # <label> <want-rc> <got-rc> <want-substr> <output>
  if [ "$2" != "$3" ]; then bad "$1" "exit $3, wanted $2: $5"; return; fi
  if [ -n "$4" ] && ! printf '%s' "$5" | grep -q "$4"; then bad "$1" "exit ok but no '$4' in: $5"; return; fi
  ok "$1"
}

# ---- a scratch world: bare origin, main with a file, and a PR branch that adds two more ----------
setup () {
  rm -rf "$TMP/o" "$TMP/w" "$TMP/peer"
  git init -q --bare "$TMP/o"
  git clone -q "$TMP/o" "$TMP/w" 2>/dev/null
  cd "$TMP/w"
  git config user.email t@t; git config user.name t
  mkdir -p raw-port/army/tools
  echo "landed on main" > raw-port/army/tools/tool.sh
  git add -A; git commit -qm "main"; git branch -M main; git push -q origin main
  git checkout -qb feature/work
  echo "the author's new test" > raw-port/army/tools/test_new.sh
  echo "the author's edit" >> raw-port/army/tools/tool.sh
  git add -A; git commit -qm "the author's work: 2 files"
  git push -q origin feature/work
  git fetch -q origin
}

# ---- CASE 1: on the right branch, carrying content -> allowed -----------------------------------
setup
OUT=$(bash "$GUARD" both "$TMP/w" feature/work 2>&1); RC=$?
check "1  a real rebase of the PR's own branch is allowed" 0 "$RC" "OK" "$OUT"

# ---- CASE 2: THE #690 SHAPE — the worktree is on some other branch -------------------------------
# Exactly what the failed checkout left behind: a branch cut from main, named after the class.
cd "$TMP/w"; git checkout -q -B port/feature/work origin/main
OUT=$(bash "$GUARD" on-branch "$TMP/w" feature/work 2>&1); RC=$?
check "2  a worktree left on another branch is REFUSED" 4 "$RC" "not on 'feature/work'" "$OUT"

# ---- CASE 3: the same head, caught by the publishes-something check too --------------------------
# Belt and braces: even if the branch NAME were right, a head with no delta must not replace one
# that has content.
OUT=$(bash "$GUARD" publishes "$TMP/w" feature/work 2>&1); RC=$?
check "3  a push that would empty the PR is REFUSED" 4 "$RC" "publish NOTHING" "$OUT"
printf '%s' "$OUT" | grep -q "carries 2 changed file(s)" \
  && ok "3b the refusal counts what is on the remote (2 files), so it is checkable" \
  || bad "3b the refusal must name what would be lost" "$OUT"

# ---- CASE 4: the branch NAME is right but the head was cut from main -----------------------------
# The name test cannot see this one, and an ancestry test would (wrongly) also reject every honest
# rebase — see case 5. The content test is what catches it.
cd "$TMP/w"; git checkout -q -B feature/work origin/main      # right name, no author work in it
OUT=$(bash "$GUARD" publishes "$TMP/w" feature/work 2>&1); RC=$?
check "4  a right-named head carrying none of the branch's work is REFUSED" 4 "$RC" "publish NOTHING" "$OUT"

# ---- CASE 5: a genuine rebase that ADDS commits is still allowed ---------------------------------
setup
cd "$TMP/w"; git checkout -q main; echo "later landing" > raw-port/army/tools/other.sh
git add -A; git commit -qm "main moves"; git push -q origin main; git fetch -q origin
git checkout -q feature/work; git rebase -q origin/main
OUT=$(bash "$GUARD" both "$TMP/w" feature/work 2>&1); RC=$?
check "5  rebasing onto a moved main is allowed (the normal case must not be blocked)" 0 "$RC" "OK" "$OUT"

# ---- CASE 6: a branch held by ANOTHER worktree — the real trigger --------------------------------
# git refuses the second checkout, which is what left #690's tool somewhere else. The guard must
# name the holder rather than let the caller push.
setup
cd "$TMP/w"; git checkout -q main                      # free the branch so the peer can take it
git -C "$TMP/w" worktree add -q "$TMP/peer" feature/work
cd "$TMP/w"; git checkout -q -B port/feature/work origin/main
OUT=$(bash "$GUARD" on-branch "$TMP/w" feature/work 2>&1); RC=$?
check "6  the refusal names the peer worktree holding the branch" 4 "$RC" "currently checked out at" "$OUT"

# ---- CASE 6b: DROPPING ONE FILE (not all) is refused too -----------------------------------------
# The #25/#449 shape: a rebase that carries the .ts files and quietly leaves the oracle behind.
setup
cd "$TMP/w"; git checkout -q -B feature/work origin/main
echo "the author's edit" >> raw-port/army/tools/tool.sh          # keep one file, drop test_new.sh
git add -A; git commit -qm "carries only one of the two files"
OUT=$(bash "$GUARD" publishes "$TMP/w" feature/work 2>&1); RC=$?
check "6b a push that drops ONE of the branch's files is REFUSED" 4 "$RC" "DROPS file" "$OUT"
printf '%s' "$OUT" | grep -q "test_new.sh" \
  && ok "6c the refusal names the file that would be lost" \
  || bad "6c the refusal must name the dropped path" "$OUT"

# ---- CASE 7: could-not-run is not success --------------------------------------------------------
OUT=$(bash "$GUARD" both "$TMP/nope" feature/work 2>&1); RC=$?
check "7  a missing worktree exits 2 (never 0 — the caller must refuse too)" 2 "$RC" "no such worktree" "$OUT"

echo "BASELINE (M0): $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || { echo "TEST_PUBLISH_GUARD: FAIL"; exit 1; }

# ---- mutants: the suite must FAIL when each guard is removed -------------------------------------
if [ -n "${GUARD_OVERRIDE:-}" ]; then exit 0; fi
MUT="$TMP/mut"; mkdir -p "$MUT"; MFAIL=0; MRUN=0
mutate () { # <name> <sed> <what it breaks> [expect-survive]
  MRUN=$((MRUN+1))
  sed "$2" "$GUARD" > "$MUT/publish_guard.sh"
  if [ "${4:-}" != "survive" ] && cmp -s "$MUT/publish_guard.sh" "$GUARD"; then
    echo "  MUTANT $1 — NOT APPLIED (the pattern moved); treat as no evidence"; MFAIL=$((MFAIL+1)); return
  fi
  if GUARD_OVERRIDE=1 PUBLISH_GUARD_BIN="$MUT/publish_guard.sh" bash "$SELF" >/dev/null 2>&1; then
    if [ "${4:-}" = "survive" ]; then
      echo "  control $1 survived, as it must (the mutation pipeline perturbs nothing)"
    else
      echo "  MUTANT $1 SURVIVED — the suite is blind to $3"; MFAIL=$((MFAIL+1))
    fi
  else
    if [ "${4:-}" = "survive" ]; then
      echo "  CONTROL $1 WAS KILLED — the harness is measuring itself, not the guard"; MFAIL=$((MFAIL+1))
    else
      echo "  mutant $1 killed (would break $3)"
    fi
  fi
}
# M0 first: an unmutated copy through the same pipeline MUST pass. Without it, a mutant that dies of
# a broken harness is indistinguishable from a mutant the suite caught.
mutate M0 's|^# M0 marker$|# M0 marker|' "nothing — this is the control" survive
mutate no_branch_test  's|if \[ "$head" != "$BR" \]; then|if false; then|' \
                       "the on-the-right-branch refusal (cases 2 and 6)"
mutate no_empty_test   's|if \[ "$there" -gt 0 \] \&\& \[ "$here" -eq 0 \]; then|if false; then|' \
                       "the publishes-something refusal (case 3)"
mutate no_lost_files   's|if \[ -n "${lost// /}" \]; then|if false; then|' \
                       "the dropped-file refusal (case 6b)"
[ "$MFAIL" -eq 0 ] || { echo "TEST_PUBLISH_GUARD: FAIL (a mutant survived)"; exit 1; }
echo "TEST_PUBLISH_GUARD: PASS ($PASS cases, $((MRUN-1)) mutants killed + the M0 control)"
