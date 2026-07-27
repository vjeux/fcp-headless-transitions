#!/bin/bash
# dump_syms.sh — regenerate army/inventory/<FW>.syms.txt for every portable framework.
# The .syms.txt files are gitignored (large, regenerable); build_ledger.py consumes them.
# Format: "<addr> <T|t> <mangled>" (nm -n, defined symbols only).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"          # raw-port/
INV="$ROOT/army/inventory"; mkdir -p "$INV"
FRAMEWORKS="ProChannel ProCore Ozone Flexo Helium"
FWROOT="/Applications/Final Cut Pro.app/Contents/Frameworks"
for fw in $FRAMEWORKS; do
  BIN="$FWROOT/$fw.framework/Versions/A/$fw"
  [ -f "$BIN" ] || { echo "SKIP $fw (no binary)"; continue; }
  nm -arch x86_64 -n "$BIN" 2>/dev/null | grep -E '^[0-9a-f]+ [Tt] ' > "$INV/$fw.syms.txt"
  echo "$fw: $(wc -l < "$INV/$fw.syms.txt") symbols -> $INV/$fw.syms.txt"
done
echo "done. Now: python3 army/tools/build_ledger.py $FRAMEWORKS"
