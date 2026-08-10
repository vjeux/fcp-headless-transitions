#!/bin/bash
# ensure_ledger.sh — guarantee the 6 per-framework *.ledger.json exist in raw-port/army/ledger/.
#
# WHY: the ledgers are gitignored runtime state (untracked at WS-1, 2026-08-10) so a fresh checkout
# or box recycle loses them. Without them, depgraph.py reports ported=0 / READY=0 and the swarm
# silently spawns workers against an EMPTY queue (they claim nothing and do nothing). This restores
# the base ledger from the LAST git commit that tracked it (dynamic — not hardcoded to a17ba69f^),
# then reconciles status against current origin/main src. Idempotent: if all 6 exist, does nothing.
#
# Run at coordinator STEP 0 before any depgraph stats/dispatch. The restored files stay gitignored
# (never dirties the tree). Exit 0 = ledgers present (restored or already there); exit 1 = could not
# restore (report to vjeux — swarm must not run without a ledger).
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1
LED=raw-port/army/ledger
FWS="ProCore ProChannel Helium Ozone Flexo shaders"
missing=0
for fw in $FWS; do [ -s "$LED/$fw.ledger.json" ] || missing=1; done
if [ "$missing" = 0 ]; then echo "ensure_ledger: all 6 ledgers present"; exit 0; fi

echo "ensure_ledger: ledger(s) MISSING — restoring from git history"
git fetch -q origin main 2>/dev/null || true
# find the newest commit reachable from origin/main that still TRACKED the ledger, then use its parent
# range: the ledger was tracked right up to the untrack commit, so the untrack commit's PARENT has it.
SRC=$(git log --diff-filter=D --format='%H' -1 -- "$LED/ProCore.ledger.json" 2>/dev/null)
if [ -n "$SRC" ]; then SRC="${SRC}^"; else
  # fallback: last commit that had a blob for it
  SRC=$(git log --format='%H' -1 -- "$LED/ProCore.ledger.json" 2>/dev/null)
fi
[ -z "$SRC" ] && { echo "ensure_ledger: FATAL — no git history has the ledger"; exit 1; }
echo "ensure_ledger: restoring 6 ledgers from $SRC"
ok=1
for fw in $FWS; do
  if git cat-file -e "$SRC:$LED/$fw.ledger.json" 2>/dev/null; then
    git cat-file -p "$SRC:$LED/$fw.ledger.json" > "$LED/$fw.ledger.json" && echo "  restored $fw.ledger.json ($(wc -c < "$LED/$fw.ledger.json") bytes)" || ok=0
  else echo "  WARN $fw.ledger.json absent at $SRC"; ok=0; fi
done
[ "$ok" != 1 ] && { echo "ensure_ledger: FATAL — restore incomplete"; exit 1; }
echo "ensure_ledger: reconciling status vs current main src (mark_ported + build)"
timeout 240 python3 raw-port/army/tools/depgraph.py reconcile 2>&1 | tail -3 || echo "  (reconcile timed out — base ledger still usable; stats will re-derive)"
echo "ensure_ledger: DONE (ledgers present + reconciled)"
exit 0
