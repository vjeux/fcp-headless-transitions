#!/bin/bash
# test_stale_file_check.sh — acceptance test for stale_file_check.py.
#
# WHY IT LOOKS LIKE THIS. Two rules from OPS_LOG shaped it:
#   * "a guard is not evidence until you have watched it fail" — so this does not merely assert the
#     guard's verdicts, it MUTATES the guard and asserts the suite goes RED. The baseline (M0) is
#     printed next to every mutant, because a mutant result without its baseline is not a result.
#   * "a case whose subject is the evidence record must not aim its probe at the live queue" — so
#     every case runs in a throwaway git repo under $TMPDIR. This test touches no PR, no pool
#     worktree, and no state under ~/.fct-pool.
#
# The two central cases are exactly the two the reviewer of PR #600 measured against the first
# version of the guard, which got both of them backwards:
#   A  the real incident (fresh branch, whole-file write from a stale copy) -> must REJECT
#   B  a stale branch that only appends                                     -> must PASS
#
# usage: bash raw-port/army/tools/test_stale_file_check.sh
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARD="${GUARD_OVERRIDE:-$HERE/stale_file_check.py}"
PASS=0; FAIL=0

ok   () { echo "  ok   — $1"; PASS=$((PASS+1)); }
bad  () { echo "  FAIL — $1"; FAIL=$((FAIL+1)); }
check () { # <desc> <want-exit> <got-exit> [needle] [output]
  local desc="$1" want="$2" got="$3" needle="${4:-}" out="${5:-}"
  if [ "$got" != "$want" ]; then bad "$desc (want exit $want, got $got)"; return; fi
  if [ -n "$needle" ] && ! grep -qF -- "$needle" <<<"$out"; then
    bad "$desc (exit $want but output never mentions '$needle')"; return; fi
  ok "$desc"
}

newrepo () { # -> path of a fresh repo with one commit on main
  local d; d="$(mktemp -d)"
  git -C "$d" init -q -b main
  git -C "$d" config user.email t@t; git -C "$d" config user.name t
  mkdir -p "$d/raw-port/army/tools" "$d/raw-port/src/nodes"
  printf 'line1\nline2 original content here\nline3 tail of the tool\n' > "$d/raw-port/army/tools/tool.sh"
  printf 'export const x = 1;\n' > "$d/raw-port/src/nodes/Port.ts"
  git -C "$d" add -A; git -C "$d" commit -qm base
  echo "$d"
}
run () { python3 "$GUARD" "$@" 2>&1; }

echo "== stale_file_check acceptance =="

# ---------------------------------------------------------------- A: the incident
D=$(newrepo)
printf 'line1\nline2 original content here\nPEER FIX: the landed work that must survive\nline3 tail of the tool\n' \
  > "$D/raw-port/army/tools/tool.sh"
git -C "$D" commit -qam "peer fix (landed 40 minutes ago)"
git -C "$D" checkout -qb work                       # fresh branch: it CONTAINS the peer fix
printf 'line1\nline2 original content here\nline3 tail of the tool\nMY OWN NEW FIX written back whole\n' \
  > "$D/raw-port/army/tools/tool.sh"                # whole-file write from a stale /tmp copy
git -C "$D" commit -qam "my own fix (written back from a stale copy)"
OUT=$(cd "$D" && run main work); RC=$?
check "A  fresh branch, whole-file write reverting a peer fix -> REJECT" 2 "$RC" "PEER FIX" "$OUT"

# ---------------------------------------------------------------- C: same, acknowledged
git -C "$D" commit -q --amend -m "my own fix
reverts-ok: raw-port/army/tools/tool.sh"
OUT=$(cd "$D" && run main work); RC=$?
check "C  the same deletion, declared 'reverts-ok:' in the message -> PASS" 0 "$RC" "ACKNOWLEDGED" "$OUT"
OUT=$(cd "$D" && run main work --ack-all); RC=$?
check "C2 the same deletion, --ack-all on the command line -> PASS" 0 "$RC" "" "$OUT"
rm -rf "$D"

# ---------------------------------------------------------------- B: stale base, pure append
D=$(newrepo)
git -C "$D" checkout -qb work                       # fork FIRST
git -C "$D" checkout -q main
printf 'line1\nline2 original content here\nPEER FIX: the landed work that must survive\nline3 tail of the tool\n' \
  > "$D/raw-port/army/tools/tool.sh"
git -C "$D" commit -qam "peer fix, landed after the fork"
git -C "$D" checkout -q work
printf 'HONEST unrelated improvement by another worker\n' >> "$D/raw-port/army/tools/tool.sh"
git -C "$D" commit -qam "honest append on a stale base"
OUT=$(cd "$D" && run main work); RC=$?
check "B  stale branch that only appends -> PASS (a merge applies the THREE-dot delta)" 0 "$RC" "" "$OUT"
rm -rf "$D"

# ---------------------------------------------------------------- D: src is out of scope
D=$(newrepo)
git -C "$D" checkout -qb work
printf 'export const y = 2;\n' > "$D/raw-port/src/nodes/Port.ts"     # deletes the landed export
git -C "$D" commit -qam "src change"
OUT=$(cd "$D" && run main work); RC=$?
check "D  a src/**.ts deletion is out of scope (G6 owns it) -> PASS" 0 "$RC" "no non-src files" "$OUT"
rm -rf "$D"

# ---------------------------------------------------------------- E: a pure move is not a loss
D=$(newrepo)
git -C "$D" checkout -qb work
printf 'line3 tail of the tool\nline1\nline2 original content here\n' > "$D/raw-port/army/tools/tool.sh"
git -C "$D" commit -qam "reorder the same three lines"
OUT=$(cd "$D" && run main work); RC=$?
check "E  reordering lines within a file is not a deletion -> PASS" 0 "$RC" "" "$OUT"
rm -rf "$D"

# ---------------------------------------------------------------- F: deleting a whole file
D=$(newrepo)
git -C "$D" checkout -qb work
git -C "$D" rm -q raw-port/army/tools/tool.sh
git -C "$D" commit -qam "drop the tool"
OUT=$(cd "$D" && run main work); RC=$?
check "F  deleting a whole non-src file -> REJECT" 2 "$RC" "tool.sh" "$OUT"
rm -rf "$D"

# ---------------------------------------------------------------- G: main deleted it first
D=$(newrepo)
git -C "$D" checkout -qb work
sed -i '' '/line2/d' "$D/raw-port/army/tools/tool.sh" 2>/dev/null || sed -i '/line2/d' "$D/raw-port/army/tools/tool.sh"
git -C "$D" commit -qam "branch drops line2"
git -C "$D" checkout -q main
sed -i '' '/line2/d' "$D/raw-port/army/tools/tool.sh" 2>/dev/null || sed -i '/line2/d' "$D/raw-port/army/tools/tool.sh"
git -C "$D" commit -qam "main drops line2 too"
OUT=$(cd "$D" && run main work); RC=$?
check "G  removing a line main has ALREADY removed loses nothing -> PASS" 0 "$RC" "" "$OUT"
rm -rf "$D"

echo "BASELINE (M0): $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || { echo "TEST_STALE_FILE_CHECK: FAIL"; exit 1; }

# ---------------------------------------------------------------- mutants: watch the suite fail
if [ -n "${GUARD_OVERRIDE:-}" ]; then exit 0; fi     # a mutant run does not spawn more mutants
MUTDIR=$(mktemp -d); MFAIL=0
mutate () { # <name> <sed-expr> <case-that-must-break>
  local name="$1" expr="$2" breaks="$3" m="$MUTDIR/$1.py"
  sed "$expr" "$GUARD" > "$m"
  if cmp -s "$m" "$GUARD"; then echo "  MUTANT $name — NOT APPLIED (the pattern moved); treat as no evidence"; MFAIL=$((MFAIL+1)); return; fi
  if GUARD_OVERRIDE="$m" bash "${BASH_SOURCE[0]}" >/dev/null 2>&1; then
    echo "  MUTANT $name SURVIVED — the suite is blind to $breaks"; MFAIL=$((MFAIL+1))
  else
    echo "  mutant $name killed (would break $breaks)"
  fi
}
echo "== mutation control (each must be KILLED) =="
# The three-dot rule lives in the PRE-IMAGE the removal is measured against: the merge base, not
# main's current tip. Mutating the path SELECTION from three dots to two does NOT survive as a defect
# (it only widens the candidate list, and the extra paths then measure zero loss), so the mutant that
# is worth running is the one that moves the pre-image — which is precisely the inversion this rework
# was rejected for.
mutate pre_image 's|mb_c = Counter(l for l in blob_lines(mb, p)|mb_c = Counter(l for l in blob_lines(base, p)|' \
                 "the three-dot rule — measuring against main's tip instead of the merge base (case B)"
mutate no_filter 's|lost = removed & main_c|lost = removed|'    "the still-on-main filter (case G)"
mutate no_ack    's|if not unacked:|if False:|'                 "the acknowledgement path (case C)"
rm -rf "$MUTDIR"
[ "$MFAIL" -eq 0 ] || { echo "TEST_STALE_FILE_CHECK: FAIL (a mutant survived)"; exit 1; }
echo "TEST_STALE_FILE_CHECK: PASS ($PASS cases, 3 mutants killed)"
