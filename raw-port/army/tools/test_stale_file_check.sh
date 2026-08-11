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

# ---------------------------------------------------------------- H: a flag-shaped typo
# The failure this guards is the one that has now bitten three tools in a day: an argument the
# parser does not recognise becomes DATA, and the tool then does something harmless-looking
# instead of what it was asked. Here it would become a PATH, match nothing, and report PASS —
# switching a hard gate off with a typo. It must refuse, with the exit code the CALLER treats as
# a failure (2), not the one pr_gate.sh lets through (1).
D=$(newrepo)
git -C "$D" checkout -qb work
printf 'line1\nline3 tail of the tool\n' > "$D/raw-port/army/tools/tool.sh"    # a real deletion
git -C "$D" commit -qam "drop line2"
OUT=$(cd "$D" && run main work --ack-al); RC=$?     # note the typo
check "H  an unrecognised flag REFUSES (exit 2), it does not become a path" 2 "$RC" "unrecognised flag" "$OUT"
rm -rf "$D"

# ---------------------------------------------------------------- I: a BLANKET ack still names the bill
# `reverts-ok: all` is the spelling an author under pressure reaches for, and it is the one that
# switches the guard off without saying what went — which is the opposite of the hatch's stated
# purpose ("names what went and who is answerable"). It still PASSES; it must also print the
# per-path list it just waved through, so the record is not silent (reviewer 2's note on #600).
D=$(newrepo)
git -C "$D" checkout -qb work
printf 'line1\nline3 tail of the tool\n' > "$D/raw-port/army/tools/tool.sh"    # a real deletion
git -C "$D" commit -qam "drop line2

reverts-ok: all"
OUT=$(cd "$D" && run main work); RC=$?
check "I  'reverts-ok: all' passes AND prints the per-path bill it covers" 0 "$RC" "blanket" "$OUT"
echo "$OUT" | grep -q "reverts-ok: raw-port/army/tools/tool.sh" \
  && { echo "  ok   — I2 the blanket note names the actual path and its line count"; PASS=$((PASS+1)); } \
  || { echo "  FAIL — I2 the blanket note must name each path it covers"; echo "$OUT" | tail -5; FAIL=$((FAIL+1)); }
rm -rf "$D"

# ------------------------------------------------- J: an INSERTION into a line is not a deletion
# The two edits this repo requires of every swarm-level fix are both insertions into ONE line:
# registering a name in swarm_doctor's CHECKS list, and extending prove_all's `return ok and …`
# chain. Git reports each as one `-` plus one `+`. Charging that as "you deleted main's line" is
# what reddened 8 of 24 open PRs — two of them APPROVED — and prescribed a standing `reverts-ok:`
# on the two hottest shared files in the tree. Both shapes are here because they are the ones that
# actually happen, and because plain substring containment catches only the second.
D=$(newrepo)
cat > "$D/raw-port/army/tools/tool.sh" <<'EOF'
CHECKS = [check_leases, check_heartbeats, check_tests_can_fail, check_inventory,
          check_attempts]
return ok and ok2 and ok3 and ok4 and ok5 and ok6 and ok7 and ok8 and ok9 and ok10 and ok11
EOF
git -C "$D" commit -qam "the two shapes, as they are on main"
git -C "$D" checkout -qb work
cat > "$D/raw-port/army/tools/tool.sh" <<'EOF'
CHECKS = [check_leases, check_no_double_lease, check_heartbeats, check_tests_can_fail, check_inventory,
          check_attempts]
return ok and ok2 and ok3 and ok4 and ok5 and ok6 and ok7 and ok8 and ok9 and ok10 and ok11 and ok12
EOF
git -C "$D" commit -qam "register a new check and a new prove_all layer"
OUT=$(cd "$D" && run main work); RC=$?
check "J  registering a CHECKS name mid-line + extending a return chain -> PASS (insertions)" 0 "$RC" "" "$OUT"
rm -rf "$D"

# ------------------------------------------------- K: the SHRINK direction is still a loss
# The rule clears a removed line only when EVERY token of it survives. Dropping half a line keeps
# the rest, so plain substring containment would clear it — and that is the silent revert this
# whole file exists to catch.
D=$(newrepo)
printf 'setup_pool; verify_pool_lease "$WT";\n' >> "$D/raw-port/army/tools/tool.sh"
git -C "$D" commit -qam "peer adds the lease verification"
git -C "$D" checkout -qb work
sed -i '' 's|setup_pool; verify_pool_lease "\$WT";|setup_pool;|' "$D/raw-port/army/tools/tool.sh" 2>/dev/null \
  || sed -i 's|setup_pool; verify_pool_lease "\$WT";|setup_pool;|' "$D/raw-port/army/tools/tool.sh"
git -C "$D" commit -qam "drop half the line"
OUT=$(cd "$D" && run main work); RC=$?
check "K  a line SHORTENED (a token disappears) is still a loss -> REJECT" 2 "$RC" "verify_pool_lease" "$OUT"
rm -rf "$D"

# ------------------------------------------------- L: tokens must survive in ONE added line
# Why the rule is per-added-line and not "somewhere in everything this change adds". A whole-file
# rewrite adds many lines, and their UNION of tokens covers a short guard line by coincidence.
# Measured here on the shape that landed today: a rework wraps a `gh api` call in a retry loop and
# writes the file back from a stale copy, dropping the peer's empty-answer guard — whose every
# token appears somewhere in the retry loop it added. Under a union rule this exits 0 and says
# "the merge removes no line that is on main"; it must not.
D=$(newrepo)
cat > "$D/raw-port/army/tools/tool.sh" <<'EOF'
claim () {
  local rej
  rej=$(gh api "repos/$SLUG/pulls/$num/reviews" --jq '.[].commit_id')
  [ -n "$rej" ] && [ "$rej" != "null" ] && break
  if [ "$rej" != "$sha" ]; then echo skip; fi
}
EOF
git -C "$D" commit -qam "peer fix: an empty answer is not a verdict"
git -C "$D" checkout -qb work
cat > "$D/raw-port/army/tools/tool.sh" <<'EOF'
claim () {
  local rej
  for _try in 1 2 3; do
    rej=$(gh api "repos/$SLUG/pulls/$num/reviews" --jq '.[].commit_id')
    [ -n "$rej" ] && break
    [ "$rej" != "null" ] && sleep 2
  done
  if [ "$rej" != "$sha" ]; then echo skip; fi
}
EOF
git -C "$D" commit -qam "rework: retry the query (written back from a stale copy)"
OUT=$(cd "$D" && run main work); RC=$?
check "L  a token scattered across the ADDED lines does not clear the loss -> REJECT" 2 "$RC" '!= "null" ] && break' "$OUT"
rm -rf "$D"

# ------------------------------------------------- N: an insertion that WRAPPED is still not a loss
# #719's shipped shape: registering a check makes the line too long, so it is split and git reports
# one `-` and two `+`s. Same edit as J, one line longer — and the reason `added_runs` looks at
# ADJACENT added lines rather than single ones.
D=$(newrepo)
cat > "$D/raw-port/army/tools/tool.sh" <<'EOF'
CHECKS = [check_leases, check_heartbeats, check_rebase_branch_naming,
          check_ops_contention, check_layer_letters]
EOF
git -C "$D" commit -qam "the CHECKS list as it is on main"
git -C "$D" checkout -qb work
cat > "$D/raw-port/army/tools/tool.sh" <<'EOF'
CHECKS = [check_leases, check_heartbeats, check_rebase_branch_naming,
          check_ops_contention, check_layer_letters,
          check_orphan_drivers]
EOF
git -C "$D" commit -qam "register check_orphan_drivers (the line wraps)"
OUT=$(cd "$D" && run main work); RC=$?
check "N  an insertion that wraps onto a new line -> PASS (#719's shape)" 0 "$RC" "" "$OUT"
rm -rf "$D"

# ------------------------------------------------- M: the guard must still be REACHABLE in pr_gate
# Not a property of the checker but of its WIRING, and the reason it is asserted rather than
# eyeballed: below `pr_gate.sh`'s `no raw-port/src ports to gate` early exit this guard runs on 1
# open PR in 16 and on NONE of the incidents it was written for — it is a non-src check, and that
# exit fires precisely on non-src PRs. It was already buried there once. Two PRs in flight rewrite
# that short-circuit, so whichever lands second resolves a conflict exactly here, and a re-burying
# would be silent and green.
G="$HERE/pr_gate.sh"
if [ -f "$G" ]; then
  LN_CHECK=$(grep -n 'stale_file_check.py origin/main HEAD' "$G" | head -1 | cut -d: -f1)
  # the SHORT-CIRCUIT itself, not the comment that explains it — a comment moves for free
  LN_EXIT=$(grep -n 'if \[ -z "\$CHANGED" \]' "$G" | head -1 | cut -d: -f1)
  if [ -n "$LN_CHECK" ] && [ -n "$LN_EXIT" ] && [ "$LN_CHECK" -lt "$LN_EXIT" ]; then
    ok "M  pr_gate calls the guard (line $LN_CHECK) BEFORE the no-src early exit (line $LN_EXIT)"
  else
    bad "M  pr_gate must call the guard before the no-src early exit (call=${LN_CHECK:-none}, exit=${LN_EXIT:-none})"
  fi
else
  bad "M  pr_gate.sh not found next to this test — the wiring assertion could not run"
fi

echo "BASELINE (M0): $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || { echo "TEST_STALE_FILE_CHECK: FAIL"; exit 1; }

# ---------------------------------------------------------------- mutants: watch the suite fail
if [ -n "${GUARD_OVERRIDE:-}" ]; then exit 0; fi     # a mutant run does not spawn more mutants
MUTDIR=$(mktemp -d); MFAIL=0
MUTANTS_RUN=0
mutate () { # <name> <sed-expr> <case-that-must-break>
  local name="$1" expr="$2" breaks="$3" m="$MUTDIR/$1.py"
  MUTANTS_RUN=$((MUTANTS_RUN+1))
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
mutate lax_flag  's|            return 2|            return 1|'  "strict flag parsing — exit 1 is a code pr_gate.sh lets through (case H)"
# The two halves of the insertion rule. Removing it entirely re-reddens the repo's own mandated
# edits (J); loosening it from "one added line" to "the union of the added lines" is the change
# that reads as harmless and silently clears a real revert (L).
mutate no_token_rule 's|        lost = lost - rewrites|        lost = lost - Counter()|' \
                 "the insertion rule — an edit inside a line reported as deleting main's work (case J)"
mutate unordered 's|    return any(is_subsequence(want, r) for r in runs)|    return any(not (Counter(want) - Counter(r)) for r in runs)|' \
                 "token ORDER — a rewrite that scatters the tokens then clears a real revert (case L)"
rm -rf "$MUTDIR"
[ "$MFAIL" -eq 0 ] || { echo "TEST_STALE_FILE_CHECK: FAIL (a mutant survived)"; exit 1; }
echo "TEST_STALE_FILE_CHECK: PASS ($PASS cases, $MUTANTS_RUN mutants killed)"
