#!/bin/bash
# gate.sh [changed-file ...] — the faithfulness gate. Exit 0 = mergeable, non-zero = REJECTED.
# Wired into .git/hooks/pre-commit (blocks the commit) and CI (blocks the PR). Shortcuts cannot land.
#
# G1 PROVENANCE : every ported fn cites @0xADDR; no ungrounded magic numbers; no shortcut language/code.
# G2 TYPECHECK  : tsgo --noEmit clean (the port must actually compile). Uses the Go-native compiler.
# (Dropped the 65-.motr parse: leaf math classes aren't in parseScene's import graph, so re-parsing
#  after e.g. a PCMath change is a provable no-op. tsc already catches any import-graph breakage.)
# G4 ORACLE     : every parity node whose TS changed must still be VERIFIED bit-exact vs live FCP.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"        # raw-port/
REPO="$(cd "$ROOT/.." && pwd)"
FAIL=0

# G0 EXISTENCE : every .ts arg must actually EXIST and be NON-EMPTY. Without this, a worker that
# never wrote its file (e.g. ipython wrote to the wrong node) gets a false "GATE: PASS" — G1 skips
# missing paths, G2 tsc is whole-project, G4 finds no node. Reject unwritten/empty ports up front.
echo "== G0 existence =="
G0_TS_SEEN=0
for f in "$@"; do
  case "$f" in *.ts) ;; *) continue ;; esac
  G0_TS_SEEN=1
  if [ ! -f "$f" ]; then echo "  MISSING FILE: $f (was it written to the right node?)"; FAIL=1
  elif [ ! -s "$f" ]; then echo "  EMPTY FILE: $f"; FAIL=1
  else echo "  ok: $f ($(wc -l < "$f") lines)"; fi
done
if [ "$FAIL" != 0 ]; then echo ""; echo "GATE: REJECT ❌ (G0: unwritten/empty file — nothing to gate)"; exit 1; fi

echo "== G1 provenance =="
python3 "$ROOT/army/gate/provenance_gate.py" "$@" || FAIL=1

echo "== G2 typecheck =="
# Incremental typecheck: keep a per-worktree .tsbuildinfo so a warm pool worktree re-checks only the
# changed file + its dependents (~1.2s cold -> ~0.2s warm) instead of the whole 1,478-file project.
# Cache lives at raw-port/.gate.tsbuildinfo (gitignored). --incremental degrades gracefully to a full
# check when the cache is cold/absent, so this is safe in a fresh checkout too.
( cd "$REPO/raw-port" && node_modules/.bin/tsgo --noEmit --incremental \
    --tsBuildInfoFile .gate.tsbuildinfo -p tsconfig.json ) || { echo "  tsgo FAILED"; FAIL=1; }

echo "== G4 oracle (bit-exact vs live FCP for touched parity nodes) =="
# Map changed .ts -> parity node ids via army/gate/oracle_map.json (class -> [node ids]).
CHANGED="${*:-}"
if [ -n "$CHANGED" ] && [ -f "$ROOT/army/gate/oracle_map.json" ]; then
  IDS=$(python3 "$ROOT/army/gate/oracle_for.py" $CHANGED)
  if [ -n "$IDS" ]; then
    ( cd "$REPO" && python3 -m fct.parity.driver sweep $IDS 2>&1 | tail -12 ) | tee /tmp/gate_oracle.txt
    # Trust the driver's own verdict: DIVERGED/FAILED/ERROR = reject. (VERIFIED with a tiny
    # float-rounding max_abs_err like 3e-14 is a PASS — don't re-judge the magnitude here.)
    grep -qiE "DIVERGED|FAILED|ERROR|NO_SIGNAL" /tmp/gate_oracle.txt && { echo "  ORACLE DIVERGENCE"; FAIL=1; }
  else echo "  (no oracle-mapped node for changed files)"; fi
else echo "  (skipped: no changed files given or no oracle_map)"; fi
# CoreMedia differential oracle. The registry/driver path above only covers hand-registered FCP
# parity nodes, and `oracle_map.json` literally had `"CMTime": []` — the key present with NO nodes —
# so the CoreMedia family was gated by nothing. Those functions are the EASIEST possible oracle
# target (public system framework, dlsym-able, pure value->value) and a wrong model landed anyway:
# CMTimeMultiplyByFloat64 is on main failing 175/341 against live CoreMedia (issue #286), and #114
# was rejected at 622/910 for the same reason. reviewer-02's summary of why no other gate can catch
# this: "three of the four rejects were throw-free bodies that pass G0-G7 cleanly — the mechanical
# gate is structurally blind to a wrong model, and only the executable differential caught them."
python3 "$ROOT/army/gate/coremedia_oracle.py" "$@"
[ $? = 2 ] && { echo "  G4 CoreMedia REJECT"; FAIL=1; }

echo "== G5 semantic completeness (un-gameable: classify disasm + reach fuzz + oracle) =="
# G5 rejects class-C/D cheats: a REAL-disasm function whose TS body throws incompleteness on a
# reachable input (the 7385eb01 family). DISPATCH_ONLY shells are FLAGGED (must be `skeleton`,
# never `ported`). Re-derives disasm from the binary (adversarial: does not trust the saved .s).
python3 "$ROOT/army/gate/g5_impl_gate.py" "$@"
G5=$?
[ "$G5" = 2 ] && { echo "  G5 REJECT"; FAIL=1; }

echo "== G6 add-only (no landed symbol may be deleted) =="
# G6 catches the ONE loss mode G0-G5 are all blind to: a change that REMOVES a ported symbol which
# is already merged on origin/main. Fired for real on 2026-08-10 — commit ef8ffc72 regenerated
# HGRenderContext.ts and silently deleted another worker's landed IsGPU. The file still typechecked,
# the new method was faithful, and every other gate passed; only a human noticing saved it. Same
# signature as stacking on a stale PR-less port/<Class> branch whose file predates landed methods.
python3 "$ROOT/army/gate/addonly_gate.py" "$@"
[ $? = 2 ] && { echo "  G6 REJECT"; FAIL=1; }

echo "== G7 undefined-index (silent-wrong-answer class) =="
# G7 flags NEW non-null-asserted computed table reads. This is the ONE class that passed every other
# gate and was still wrong: #154 RGBtoRGBA returned 24 where live FCP returns 232, because an
# out-of-range read gave `undefined`, `undefined - 1` gave NaN, and `NaN & 0xffffffff` collapsed to 0
# — a plausible wrong number with no throw for G5 to find. Flags (not rejects): ~68 such sites are
# already landed and most are probably bounded, but pr_gate holds the status red while a flag stands,
# so a reviewer must prove the index is in range or match the machine's out-of-range behavior.
python3 "$ROOT/army/gate/undef_index_gate.py" "$@"

echo ""
[ "$FAIL" = 0 ] && echo "GATE: PASS ✅" || echo "GATE: REJECT ❌ (fix the above; shortcuts do not land)"
exit $FAIL
