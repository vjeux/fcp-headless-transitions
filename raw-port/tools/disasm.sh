#!/bin/bash
# disasm.sh <ClassName> [method] [framework]
#   framework: Ozone (default) | ProChannel | ProCore
# Dumps x86_64 disasm of <Class>::<method> to raw-port/re/disasm/<fw>.<Class>.<method>.s
set -euo pipefail
CLS="${1:?usage: disasm.sh <Class> [method] [framework]}"; METH="${2:-parseElement}"; FW="${3:-Ozone}"
BIN="/Applications/Final Cut Pro.app/Contents/Frameworks/${FW}.framework/Versions/A/${FW}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PFX="$FW"; [ "$FW" = "Ozone" ] && PFX="" || PFX="${FW}."
OUT="$ROOT/re/disasm/${PFX}${CLS}.${METH}.s"
mkdir -p "$(dirname "$OUT")"
MAP="/tmp/${FW}_symmap.tsv"; DIS="/tmp/${FW}_tV.txt"
if [ ! -s "$MAP" ]; then
  nm -arch x86_64 "$BIN" 2>/dev/null | awk '$2=="T"{print $3}' | grep '^__ZN' > "/tmp/${FW}_mangled.txt"
  c++filt < "/tmp/${FW}_mangled.txt" > "/tmp/${FW}_demangled.txt"
  paste "/tmp/${FW}_mangled.txt" "/tmp/${FW}_demangled.txt" > "$MAP"
fi
[ -s "$DIS" ] || otool -tV -arch x86_64 "$BIN" > "$DIS" 2>/dev/null
SYM=$(awk -F'\t' -v k="${CLS}::${METH}(" 'index($2,k)==1{print $1; exit}' "$MAP")
if [ -z "${SYM:-}" ]; then echo "symbol not found: ${FW} ${CLS}::${METH}"; exit 1; fi
awk -v s="$SYM:" '$0==s{f=1;print;next} f&&/:$/{exit} f{print}' "$DIS" > "$OUT"
echo "wrote $OUT ($(wc -l < "$OUT") lines)  [$SYM]"
