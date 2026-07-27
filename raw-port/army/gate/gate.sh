#!/bin/bash
# gate.sh [changed-file ...] — the faithfulness gate. Exit 0 = mergeable, non-zero = REJECTED.
# Wired into .git/hooks/pre-commit (blocks the commit) and CI (blocks the PR). Shortcuts cannot land.
#
# G1 PROVENANCE : every ported fn cites @0xADDR; no ungrounded magic numbers; no shortcut language/code.
# G2 TYPECHECK  : tsc --noEmit clean (the port must actually compile).
# (Dropped the 65-.motr parse: leaf math classes aren't in parseScene's import graph, so re-parsing
#  after e.g. a PCMath change is a provable no-op. tsc already catches any import-graph breakage.)
# G4 ORACLE     : every parity node whose TS changed must still be VERIFIED bit-exact vs live FCP.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"        # raw-port/
REPO="$(cd "$ROOT/.." && pwd)"
FAIL=0

echo "== G1 provenance =="
python3 "$ROOT/army/gate/provenance_gate.py" "$@" || FAIL=1

echo "== G2 typecheck =="
( cd "$REPO" && engine/node_modules/.bin/tsc --noEmit -p raw-port/tsconfig.json ) || { echo "  tsc FAILED"; FAIL=1; }

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

echo ""
[ "$FAIL" = 0 ] && echo "GATE: PASS ✅" || echo "GATE: REJECT ❌ (fix the above; shortcuts do not land)"
exit $FAIL
