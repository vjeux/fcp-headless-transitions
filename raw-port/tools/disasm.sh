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
# GUARD + AUTO-ICF-FALLBACK: otool -tV sometimes emits NO label for a symbol (ICF identical-code-
# folding, or a linear-sweep that decoded the prior region into this entry so the true start has no
# line). The old code wrote a 0-line file and returned success — and a worker would GUESS the body.
# That is a decode-integrity hole. Instead of failing, AUTO-FALL-BACK to objdump's per-symbol
# disassembler, which resolves the EXACT symbol boundary (Apple ships LLVM objdump at /usr/bin/
# objdump — no install needed). For ICF-folded bodies objdump prints the fold *target's* label but
# the BYTES at this symbol's address are correct (see MEMORY: ICF alias addr ports correctly).
if [ ! -s "$OUT" ]; then
  OBJDUMP="$(command -v llvm-objdump || command -v objdump || echo /usr/bin/objdump)"
  echo "note: 0-line otool disasm for ${FW} ${CLS}::${METH} [$SYM] (ICF-folded/misaligned) — "\
       "falling back to $OBJDUMP --disassemble-symbols" >&2
  # Need the thin x86_64 slice for objdump --macho; build once (cached alongside resolve.py's).
  THIN="/tmp/${FW}.x86_64"
  [ -s "$THIN" ] || lipo "$BIN" -thin x86_64 -output "$THIN" 2>/dev/null || true
  if [ -s "$THIN" ]; then
    "$OBJDUMP" --macho -d --disassemble-symbols="$SYM" "$THIN" 2>/dev/null > "$OUT" || true
  fi
  if [ ! -s "$OUT" ]; then
    echo "WARNING: still 0-line after objdump fallback for ${FW} ${CLS}::${METH} [$SYM]" >&2
    echo "  (pure-stub / extern / truly-empty). DO NOT GUESS the body — throw-stub it citing @0xADDR." >&2
    exit 2
  fi
  echo "wrote $OUT ($(wc -l < "$OUT") lines via objdump ICF-fallback)  [$SYM]"
  exit 0
fi
echo "wrote $OUT ($(wc -l < "$OUT") lines)  [$SYM]"
