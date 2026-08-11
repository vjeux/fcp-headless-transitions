#!/bin/bash
# test_wt_pool_clean.sh — a released pool slot must carry NOTHING of the previous holder's, and
# must still carry the warm cache.
#
# THE INCIDENT (2026-08-11, slot 2). `reset_clean` cleaned `-- raw-port/src raw-port/re` only, so an
# untracked file anywhere else survived a release. A peer's abandoned `raw-port/army/ops/<entry>.md`
# was handed to the next holder of the slot, whose `git add -A && commit` published it inside an
# unrelated PR — it appeared in that PR's three-dot file list under a commit message about something
# else. Nothing else can catch that: the file is an ADD, so every `--diff-filter=D` guard is silent,
# and `gate.sh` only inspects the `.ts` files it is handed.
#
# WHY THE TEST IS END-TO-END rather than a unit test of the function: the two things that can go
# wrong here are opposite, and only the real `acquire`/`release` path exercises both.
#   * too narrow  -> a stray survives and lands in a stranger's PR (the incident);
#   * too wide    -> `clean -fdx` would blow away node_modules, the tsgo cache and the symbol
#                    inventory, i.e. the entire reason the warm pool exists, and the damage would
#                    show up as everyone's gate getting slower rather than as a failure.
# It runs against a THROWAWAY $HOME (wt_pool derives both its pool and the canonical checkout from
# $HOME), so it touches no live slot, no lease, and nothing under the real ~/.fct-pool.
#
# usage: bash raw-port/army/tools/test_wt_pool_clean.sh
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL="${TOOL_OVERRIDE:-$HERE/wt_pool.sh}"
PASS=0; FAIL=0
ok  () { echo "  ok   — $1"; PASS=$((PASS+1)); }
bad () { echo "  FAIL — $1"; [ -n "${2:-}" ] && echo "         $2"; FAIL=$((FAIL+1)); }

T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
export HOME="$T"
CANON="$T/random/final-cut-pro-transitions"
mkdir -p "$T/origin.git" "$CANON"
git init -q --bare "$T/origin.git"
git init -q -b main "$CANON"
cd "$CANON"
git config user.email t@t; git config user.name t
mkdir -p raw-port/src/nodes raw-port/re/disasm raw-port/army/ops raw-port/army/tools raw-port/army/inventory
printf 'export const x = 1;\n'      > raw-port/src/nodes/Port.ts
printf '# a landed tool\n'          > raw-port/army/tools/keep.sh
printf 'node_modules/\n*.tsbuildinfo\nraw-port/army/inventory/\n' > .gitignore
git add -A >/dev/null; git commit -qm base
git remote add origin "$T/origin.git"; git push -q -u origin main

bash "$TOOL" init 1 >/dev/null 2>&1
WT="$(bash "$TOOL" acquire Foo 2>/dev/null)"
[ -n "$WT" ] && [ -d "$WT" ] || { echo "TEST_WT_POOL_CLEAN: FAIL (could not acquire a slot in the scratch pool)"; exit 1; }

# what the previous holder leaves behind
mkdir -p "$WT/raw-port/army/ops" "$WT/node_modules" "$WT/raw-port/army/inventory"
printf '# a peers abandoned finding\n' > "$WT/raw-port/army/ops/stray-entry.md"     # the incident
printf 'print("half a tool")\n'        > "$WT/raw-port/army/tools/stray_tool.py"    # same class
printf 'cached\n'                      > "$WT/node_modules/dep.js"                  # gitignored
printf 'cached\n'                      > "$WT/raw-port/.gate.tsbuildinfo"           # gitignored
printf '0x1 T _sym\n'                  > "$WT/raw-port/army/inventory/OZ.syms.txt"  # gitignored
printf '# EDITED by the previous holder\n' > "$WT/raw-port/army/tools/keep.sh"        # tracked, edited

bash "$TOOL" release "$WT" >/dev/null 2>&1

[ -e "$WT/raw-port/army/ops/stray-entry.md" ] \
  && bad "an untracked ops entry must not survive a release (it lands in the next holder's PR)" \
  || ok "an untracked file OUTSIDE src/re does not survive a release"
[ -e "$WT/raw-port/army/tools/stray_tool.py" ] \
  && bad "an untracked tool must not survive a release either" \
  || ok "...nor an untracked tool"

# NOTHING IS DESTROYED: widening a delete is the dangerous direction, so it is archived first.
ARCH="$(ls "$T/.fct-pool/rescue/"strays-*.tar 2>/dev/null | head -1)"
if [ -n "$ARCH" ] && tar -tf "$ARCH" 2>/dev/null | grep -q 'raw-port/army/ops/stray-entry.md'; then
  ok "what the clean removes is archived first, so a dead peer's work is not destroyed"
else
  bad "the removed strays must be archived to \$POOL/rescue (a wider delete must not lose work)" \
      "archive: ${ARCH:-none}"
fi

# ...AND THE WARM CACHE SURVIVES. This is the half a `-x` would break, invisibly.
[ -e "$WT/node_modules/dep.js" ] && ok "gitignored node_modules survives (no -x)" \
  || bad "node_modules must survive — the pool exists to keep it warm"
[ -e "$WT/raw-port/.gate.tsbuildinfo" ] && ok "the gitignored tsgo cache survives (no -x)" \
  || bad "the tsbuildinfo cache must survive — typecheck goes 0.2s -> 1.2s without it"
[ -e "$WT/raw-port/army/inventory/OZ.syms.txt" ] && ok "the gitignored symbol inventory survives (no -x)" \
  || bad "the symbol inventory must survive — without it agents fall back to a 78MB nm"

# and the tracked edit is still reset
if [ "$(cat "$WT/raw-port/army/tools/keep.sh" 2>/dev/null)" = "# a landed tool" ]; then
  ok "a tracked modification is still reset to origin/main"
else
  bad "release must reset tracked files" "got: $(cat "$WT/raw-port/army/tools/keep.sh" 2>/dev/null)"
fi

# ROUND 2: the ORIGINAL scope must not be lost. An untracked file under src/ is what release
# refuses to throw away silently (wt_has_work sees it), so this is the --force path the stale-slot
# reclaim uses — and it must still end clean.
WT2="$(bash "$TOOL" acquire Bar 2>/dev/null)"
if [ -n "$WT2" ] && [ -d "$WT2" ]; then
  printf 'export const y = 2;\n' > "$WT2/raw-port/src/nodes/Stray.ts"
  bash "$TOOL" release "$WT2" --force >/dev/null 2>&1
  [ -e "$WT2/raw-port/src/nodes/Stray.ts" ] \
    && bad "an untracked src file must still be cleaned (the original scope is not lost)" \
    || ok "an untracked src file is still cleaned, and archived with the rest"
else
  bad "could not acquire a second slot for the --force case"
fi

echo "BASELINE (M0): $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || { echo "TEST_WT_POOL_CLEAN: FAIL"; exit 1; }

# ── mutation: the old narrow scope must make this suite RED ─────────────────────────────────────
if [ -n "${TOOL_OVERRIDE:-}" ]; then exit 0; fi
MUT="$(mktemp -d)"; MFAIL=0
sed 's|^  git -C "$wt" clean -fdq 2>/dev/null|  git -C "$wt" clean -fdq -- raw-port/src raw-port/re 2>/dev/null|' \
    "$TOOL" > "$MUT/wt_pool.sh"
if cmp -s "$MUT/wt_pool.sh" "$TOOL"; then
  echo "  MUTANT narrow_scope — NOT APPLIED (the line moved); treat as no evidence"; MFAIL=1
elif TOOL_OVERRIDE="$MUT/wt_pool.sh" bash "${BASH_SOURCE[0]}" >/dev/null 2>&1; then
  echo "  MUTANT narrow_scope SURVIVED — the suite cannot see the incident it was written for"; MFAIL=1
else
  echo "  mutant narrow_scope killed (restoring the src/re-only pathspec lets the stray survive)"
fi
rm -rf "$MUT"
[ "$MFAIL" -eq 0 ] || { echo "TEST_WT_POOL_CLEAN: FAIL (a mutant survived)"; exit 1; }
echo "TEST_WT_POOL_CLEAN: PASS ($PASS cases, 1 mutant killed)"
