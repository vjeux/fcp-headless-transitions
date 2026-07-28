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
  nm -arch x86_64 "$BIN" 2>/dev/null | awk '$2=="T"||$2=="t"{print $3}' | grep '^__ZN' > "/tmp/${FW}_mangled.txt"
  c++filt < "/tmp/${FW}_mangled.txt" > "/tmp/${FW}_demangled.txt"
  paste "/tmp/${FW}_mangled.txt" "/tmp/${FW}_demangled.txt" > "$MAP"
fi
[ -s "$DIS" ] || otool -tV -arch x86_64 "$BIN" > "$DIS" 2>/dev/null
SYM=$(awk -F'\t' -v k="${CLS}::${METH}(" 'index($2,k)==1{print $1; exit}' "$MAP")
if [ -z "${SYM:-}" ]; then echo "symbol not found: ${FW} ${CLS}::${METH}"; exit 1; fi
awk -v s="$SYM:" '$0==s{f=1;print;next} f&&/:$/{exit} f{print}' "$DIS" > "$OUT"
# GUARD: otool -tV sometimes emits NO label for a symbol (ICF identical-code-folding, or a
# linear-sweep that decoded the prior region into this entry so the true start has no line). The
# old code then wrote a 0-line file and returned success — and a worker would GUESS the body. That
# is a decode-integrity hole. Refuse loudly instead: a 0-line extraction is a hard stop, not a body.
if [ ! -s "$OUT" ]; then
  echo "WARNING: 0-line disasm for ${FW} ${CLS}::${METH} [$SYM] — otool -tV has no label here" >&2
  echo "  (ICF-folded / misaligned / pure-stub / extern). DO NOT GUESS the body. Try:" >&2
  echo "  llvm-objdump --arch=x86_64 -d --disassemble-symbols='$SYM' \"$BIN\"   (per-symbol, exact boundary)" >&2
  echo "  or throw-stub the method citing its @0xADDR. Re-run only if you can extract a real body." >&2
  exit 2
fi
echo "wrote $OUT ($(wc -l < "$OUT") lines)  [$SYM]"
