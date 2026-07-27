#!/bin/bash
# disasm.sh <ClassName> [method]  — dump the x86_64 disassembly of an Ozone parse method.
# Uses cached symbol map (/tmp/ozone_symmap.tsv) + cached disasm (/tmp/ozone_tV.txt), building
# them on first run. Saves to raw-port/re/disasm/<Class>.<method>.s
set -euo pipefail
OZ="/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone"
CLS="${1:?usage: disasm.sh <Class> [method]}"; METH="${2:-parseElement}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; OUT="$ROOT/re/disasm/${CLS}.${METH}.s"
mkdir -p "$(dirname "$OUT")"
MAP="/tmp/ozone_symmap.tsv"; DIS="/tmp/ozone_tV.txt"
if [ ! -s "$MAP" ]; then
  nm -arch x86_64 "$OZ" 2>/dev/null | awk '$2=="T"{print $3}' | grep '^__ZN' > /tmp/ozone_mangled.txt
  c++filt < /tmp/ozone_mangled.txt > /tmp/ozone_demangled.txt
  paste /tmp/ozone_mangled.txt /tmp/ozone_demangled.txt > "$MAP"
fi
[ -s "$DIS" ] || otool -tV -arch x86_64 "$OZ" > "$DIS" 2>/dev/null
SYM=$(awk -F'\t' -v k="${CLS}::${METH}(" 'index($2,k)==1{print $1; exit}' "$MAP")
if [ -z "${SYM:-}" ]; then echo "symbol not found: ${CLS}::${METH}"; exit 1; fi
awk -v s="$SYM:" '$0==s{f=1;print;next} f&&/:$/{exit} f{print}' "$DIS" > "$OUT"
echo "wrote $OUT ($(wc -l < "$OUT") lines)  [$SYM]"
