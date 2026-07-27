#!/bin/bash
# fn.sh <FW> <Class> <method> — one-shot decode: disasm a method AND auto-resolve every callq target,
# __stubs import, and rip-relative constant referenced in it. The starting point for porting any fn.
set -euo pipefail
FW="${1:?usage: fn.sh <FW> <Class> <method>}"; CLS="${2:?}"; METH="${3:?}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
S="$ROOT/re/disasm/${FW}.${CLS}.${METH}.s"
"$ROOT/tools/disasm.sh" "$CLS" "$METH" "$FW" >/dev/null 2>&1 || true
[ -s "$S" ] || { echo "no disasm produced for $FW $CLS::$METH"; exit 1; }
echo "=== $FW $CLS::$METH ($(wc -l < "$S") lines)  -> $S ==="
echo "--- callq targets ---"
grep -oE "callq\s+0x[0-9a-f]+" "$S" | grep -oE "0x[0-9a-f]+" | sort -u | while read a; do
  printf "  %s  " "$a"; python3 "$ROOT/army/tools/resolve.py" "$FW" "$a" 2>/dev/null | head -1
done
echo "--- __stubs / imports (## comments) ---"
grep -oE "## [_A-Za-z].*" "$S" | sort -u | head -20
echo "--- rip-relative data (## 0x...) — likely constants ---"
grep -oE "## 0x[0-9a-f]+" "$S" | grep -oE "0x[0-9a-f]+" | sort -u | head -20 | while read a; do
  printf "  %s  " "$a"; python3 "$ROOT/army/tools/resolve.py" "$FW" const "$a" 2>/dev/null | head -1
done
echo "--- vtable calls (callq *0xNN(%rax)) — resolve on the object's class vtable manually ---"
grep -oE "callq\s+\*0x[0-9a-f]+\(" "$S" | sort -u
