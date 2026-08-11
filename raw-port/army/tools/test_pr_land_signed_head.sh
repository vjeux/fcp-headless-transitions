#!/bin/bash
# test_pr_land_signed_head.sh — pin `signed_head_of`, the walk that recovers which head a reviewer
# actually signed.
#
# WHY. GitHub re-points a review's `commit_id` forward onto each `Merge branch 'main' into <branch>`
# that `update-branch` creates — measured +3 s to +39 s AFTER the review was submitted, on #599,
# #610 and #585, and two hops on the last of those. So the field pr_land would naturally trust says
# "the reviewer signed the merge commit we just made", which is never true. The first-parent chain
# is durable: those merges carry the branch head as parent 1, so walking back through them lands on
# the commit the reviewer read. Everything pr_land's final content check concludes rests on this
# walk stopping in the right place — one hop too far and it would compare against an older head; one
# hop too few and it compares a commit with itself and always agrees.
#
# Drives the tool's OWN function, extracted verbatim, in a throwaway repo. No PR, no pool slot, no
# state under ~/.fct-pool. Mutation-checked at the end: two mutants, both must die.
#
#   bash raw-port/army/tools/test_pr_land_signed_head.sh
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL="${TOOL_OVERRIDE:-$HERE/pr_land.sh}"
PASS=0; FAIL=0
ok  () { echo "  ok   — $1"; PASS=$((PASS+1)); }
bad () { echo "  FAIL — $1"; FAIL=$((FAIL+1)); }

FN=$(sed -n '/^signed_head_of () {/,/^}/p' "$TOOL")
[ -n "$FN" ] || { echo "could not extract signed_head_of() from $TOOL"; exit 1; }
walk () { ( cd "$1" && eval "$FN"$'\n''signed_head_of "'"$2"'"' ); }

D=$(mktemp -d)
git -C "$D" init -q -b main
git -C "$D" config user.email t@t; git -C "$D" config user.name t
echo base > "$D/f"; git -C "$D" add -A; git -C "$D" commit -qm base
git -C "$D" checkout -qb work
echo pr >> "$D/f"; git -C "$D" commit -qam "port: the thing the reviewer read"
SIGNED=$(git -C "$D" rev-parse HEAD)

echo "== signed_head_of =="

# 0. no merges yet: the walk must be a no-op, not a step backwards
[ "$(walk "$D" "$SIGNED")" = "$SIGNED" ] \
  && ok "0 a plain head walks to itself" \
  || bad "0 a plain head walked somewhere else — the walk steps off a non-merge commit"

# 1. one update-branch merge, exactly as GitHub makes it (branch head first, main second)
git -C "$D" checkout -q main; echo main1 >> "$D/g"; git -C "$D" add -A; git -C "$D" commit -qm "main moves"
git -C "$D" checkout -q work
git -C "$D" merge -q --no-edit main -m "Merge branch 'main' into work"
H1=$(git -C "$D" rev-parse HEAD)
[ "$(walk "$D" "$H1")" = "$SIGNED" ] \
  && ok "1 one update-branch merge -> the signed head" \
  || bad "1 one update-branch merge did not walk back to the signed head"

# 2. TWO hops — #585's case, where the review moved twice inside one landing
git -C "$D" checkout -q main; echo main2 >> "$D/g"; git -C "$D" commit -qam "main moves again"
git -C "$D" checkout -q work
git -C "$D" merge -q --no-edit main -m "Merge branch 'main' into work"
H2=$(git -C "$D" rev-parse HEAD)
[ "$(walk "$D" "$H2")" = "$SIGNED" ] \
  && ok "2 two update-branch merges -> still the signed head" \
  || bad "2 the walk did not survive two hops (this is #585's measured case)"

# 3. AN AUTHOR COMMIT MUST STOP THE WALK. This is the whole safety property: if the walk stepped
#    past a commit the author wrote, pr_land would compare against content that was never reviewed
#    and merge it.
echo "author adds something nobody reviewed" >> "$D/f"
git -C "$D" commit -qam "author pushes"
AUTHORED=$(git -C "$D" rev-parse HEAD)
[ "$(walk "$D" "$AUTHORED")" = "$AUTHORED" ] \
  && ok "3 an author commit stops the walk" \
  || bad "3 the walk stepped THROUGH an author commit — it would compare against unreviewed content"

# 4. a merge that is NOT one of ours (different subject) must stop the walk too
git -C "$D" checkout -q main; echo main3 >> "$D/g"; git -C "$D" commit -qam "main moves a third time"
git -C "$D" checkout -q work
git -C "$D" merge -q --no-edit main -m "Merge remote-tracking branch 'origin/main' into work"
FOREIGN=$(git -C "$D" rev-parse HEAD)
[ "$(walk "$D" "$FOREIGN")" = "$FOREIGN" ] \
  && ok "4 a merge with a different subject is not assumed to be ours" \
  || bad "4 the walk treated a foreign merge as an update-branch merge"

# 5. an unreadable sha must come back unchanged rather than empty (the caller's cat-file refuses it)
[ "$(walk "$D" deadbeefdeadbeefdeadbeefdeadbeefdeadbeef)" = "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef" ] \
  && ok "5 an unreadable sha is returned unchanged for the caller to refuse" \
  || bad "5 an unreadable sha did not come back unchanged"

rm -rf "$D"
echo "BASELINE (M0): $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || { echo "TEST_PR_LAND_SIGNED_HEAD: FAIL"; exit 1; }

# ------------------------------------------------------------------ mutants: watch it fail
if [ -n "${TOOL_OVERRIDE:-}" ]; then exit 0; fi
MUT=$(mktemp -d); MFAIL=0
mutate () { # <name> <sed-expr> <what it breaks>
  local m="$MUT/$1.sh"; sed "$2" "$TOOL" > "$m"
  if cmp -s "$m" "$TOOL"; then echo "  MUTANT $1 — NOT APPLIED (the pattern moved); no evidence"; MFAIL=$((MFAIL+1)); return; fi
  if TOOL_OVERRIDE="$m" bash "${BASH_SOURCE[0]}" >/dev/null 2>&1; then
    echo "  MUTANT $1 SURVIVED — the suite is blind to $3"; MFAIL=$((MFAIL+1))
  else
    echo "  mutant $1 killed (would break $3)"
  fi
}
echo "== mutation control (each must be KILLED) =="
# walk through ANY commit, not just our merges: case 3 (author commit) must go red
mutate walk_anything "s|    case \"\$subj\" in \"Merge branch 'main' into \"\\*) ;; \\*) break ;; esac|    :|" \
  "the subject test — the walk would step through an author commit"
# never walk at all: cases 1 and 2 must go red
mutate never_walk 's|  local c="$1" hops=0 subj p1|  local c="$1" hops=99 subj p1|' \
  "the walk itself — a rebound commit_id would be compared with itself and always agree"
rm -rf "$MUT"
[ "$MFAIL" -eq 0 ] || { echo "TEST_PR_LAND_SIGNED_HEAD: FAIL (a mutant survived)"; exit 1; }
echo "TEST_PR_LAND_SIGNED_HEAD: PASS ($PASS cases, 2 mutants killed)"
