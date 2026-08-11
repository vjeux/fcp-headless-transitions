#!/bin/bash
# test_pr_land_carry.sh — pin `pr_land.sh`'s approval-carry predicate.
#
# WHY THIS EXISTS. pr_land carries a reviewer's APPROVE across the head move that ITS OWN
# `update-branch` causes. That is a guard about a MERGE, so it is the last one that should go
# unwatched — and the first version of it failed OPEN: it compared `git diff origin/main...<sha>`
# hashes, and a `git diff` that FAILS prints nothing, whose shasum is the stable
# da39a3ee5e6b4b0d3255bfef95601890afd80709 of empty input. Two unreadable commits therefore
# compared EQUAL and the carry fired on content nobody had read.
#
# It drives the tool's OWN `carry_tree_identity`, extracted verbatim from pr_land.sh, in a
# throwaway repo under $TMPDIR. It touches no PR, no pool slot and no state under ~/.fct-pool.
#
# usage: bash raw-port/army/tools/test_pr_land_carry.sh
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL="${TOOL_OVERRIDE:-$HERE/pr_land.sh}"
PASS=0; FAIL=0
ok  () { echo "  ok   — $1"; PASS=$((PASS+1)); }
bad () { echo "  FAIL — $1"; FAIL=$((FAIL+1)); }

# the function under test, taken from the tool rather than restated here
FN=$(sed -n '/^carry_tree_identity () {/,/^}/p' "$TOOL")
[ -n "$FN" ] || { echo "could not extract carry_tree_identity() from $TOOL"; exit 1; }

newrepo () {
  local d; d="$(mktemp -d)"
  git -C "$d" init -q -b main
  git -C "$d" config user.email t@t; git -C "$d" config user.name t
  mkdir -p "$d/raw-port/army"
  printf 'line1\nline2\nline3\n' > "$d/raw-port/army/OPS_LOG.md"
  git -C "$d" add -A; git -C "$d" commit -qm base
  git -C "$d" branch -f origin/main main          # a local ref named origin/main, as the tool reads
  echo "$d"
}
carry () { ( cd "$1" && eval "$FN"$'\n''carry_tree_identity "'"$2"'" "'"$3"'" >/dev/null 2>&1' ); }

echo "== pr_land approval-carry =="

# 1. the case the carry EXISTS for: an approval, then OUR update-branch merge of current main.
#    main also advances INSIDE THE SAME FILE, which is the normal case for OPS_LOG.md and the one
#    the diff-hash predicate got wrong.
D=$(newrepo)
git -C "$D" checkout -qb work
printf 'AUTHOR ENTRY appended by the PR\n' >> "$D/raw-port/army/OPS_LOG.md"
git -C "$D" commit -qam "the approved content"
APPROVED=$(git -C "$D" rev-parse HEAD)
git -C "$D" checkout -q main
sed -i '' 's/^line2$/line2 EDITED ON MAIN/' "$D/raw-port/army/OPS_LOG.md" 2>/dev/null \
  || sed -i 's/^line2$/line2 EDITED ON MAIN/' "$D/raw-port/army/OPS_LOG.md"
git -C "$D" commit -qam "main advances in the same file"
git -C "$D" branch -f origin/main main
git -C "$D" checkout -q work
git -C "$D" merge -q --no-edit main -m "Merge branch 'main' into work"   # what update-branch does
HEAD_SHA=$(git -C "$D" rev-parse HEAD)
if carry "$D" "$APPROVED" "$HEAD_SHA"; then
  ok "1 our own update-branch merge, main touching the same file -> CARRY"
else
  bad "1 our own update-branch merge, main touching the same file -> should CARRY"
fi

# 2. an AUTHOR push on top must NEVER carry
printf 'AUTHOR ADDED SOMETHING NOBODY REVIEWED\n' >> "$D/raw-port/army/OPS_LOG.md"
git -C "$D" commit -qam "author pushes real content"
if carry "$D" "$APPROVED" "$(git -C "$D" rev-parse HEAD)"; then
  bad "2 an author push after the approval -> should REFUSE"
else
  ok "2 an author push after the approval -> REFUSE"
fi

# 3. unreadable objects must REFUSE, not hash emptiness into agreement
if carry "$D" deadbeefdeadbeefdeadbeefdeadbeefdeadbeef cafebabecafebabecafebabecafebabecafebabe; then
  bad "3 two unreadable commits -> should REFUSE (this is the fail-open the first version had)"
else
  ok "3 two unreadable commits -> REFUSE"
fi
if carry "$D" "$APPROVED" deadbeefdeadbeefdeadbeefdeadbeefdeadbeef; then
  bad "4 an unreadable head -> should REFUSE"
else
  ok "4 an unreadable head -> REFUSE"
fi
rm -rf "$D"

echo "BASELINE (M0): $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || { echo "TEST_PR_LAND_CARRY: FAIL"; exit 1; }

# ---------------------------------------------------------------- mutants: watch it fail
if [ -n "${TOOL_OVERRIDE:-}" ]; then exit 0; fi
MUT=$(mktemp -d); MFAIL=0
mutate () { # <name> <sed-expr> <what it breaks> [why-it-is-EQUIVALENT]
  local m="$MUT/$1.sh"; sed "$2" "$TOOL" > "$m"
  if cmp -s "$m" "$TOOL"; then echo "  MUTANT $1 — NOT APPLIED (the pattern moved); no evidence"; MFAIL=$((MFAIL+1)); return; fi
  if TOOL_OVERRIDE="$m" bash "${BASH_SOURCE[0]}" >/dev/null 2>&1; then
    if [ -n "${4:-}" ]; then
      echo "  mutant $1 SURVIVED — EQUIVALENT, not blind: $4"
    else
      echo "  MUTANT $1 SURVIVED — the suite is blind to $3"; MFAIL=$((MFAIL+1))
    fi
  else
    if [ -n "${4:-}" ]; then
      echo "  MUTANT $1 was predicted EQUIVALENT and was KILLED — the prediction was wrong"; MFAIL=$((MFAIL+1))
    else
      echo "  mutant $1 killed (would break $3)"
    fi
  fi
}
echo "== mutation control (each must be KILLED) =="
# the original defect, restored exactly: diff hashes instead of tree identity
mutate diff_hash \
  's|  t1=$(git merge-tree --write-tree origin/main "$approved" 2>/dev/null .. true)|  t1=$(git diff "origin/main...$approved" 2>/dev/null \| shasum \| cut -d" " -f1)|;
   s|  t2=$(git rev-parse "${head}^{tree}" 2>/dev/null .. true)|  t2=$(git diff "origin/main...$head" 2>/dev/null \| shasum \| cut -d" " -f1)|' \
  "tree identity — the diff-hash form fails cases 1 and 3"
# drop the readability preconditions
# Predicted EQUIVALENT and confirmed: the tree-identity form CANNOT fail open on a missing
# object — `merge-tree` prints nothing and `rev-parse` fails, so the empty guard already refuses.
# The cat-file precondition buys a precise message ("the approved commit is not readable here"),
# not the safety. That is the honest reading of a surviving mutant, and it is only sayable because
# the reason was predicted from the code first; a survivor with no entry here fails the suite.
mutate no_precond 's|  git cat-file -e "${approved}^{commit}" 2>/dev/null .. {|  false \&\& {|' \
  "the cat-file precondition (case 3/4)" \
  "the tree-identity form already refuses on an unreadable object — merge-tree prints nothing, so cases 3 and 4 still pass; the precondition only improves the message"
rm -rf "$MUT"
[ "$MFAIL" -eq 0 ] || { echo "TEST_PR_LAND_CARRY: FAIL (a mutant survived)"; exit 1; }
echo "TEST_PR_LAND_CARRY: PASS ($PASS cases, 1 mutant killed, 1 proven equivalent)"
