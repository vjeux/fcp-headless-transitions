#!/bin/bash
# disasm.sh <ClassName> [method] [framework]
#   framework: Ozone (default) | ProChannel | ProCore | Flexo | Helium
# Dumps x86_64 disasm of <Class>::<method> to raw-port/re/disasm/<fw>.<Class>.<method>.s
#
# MANGLED MODE (preferred by leaf workers): disasm.sh --sym <mangledSymbol> <FW>
#   Uses the EXACT mangled symbol leafq hands you — skips the demangled lookup entirely, so the
#   D0/D1/D2 destructor-variant collision (three symbols demangle to the identical "~Class()"
#   string, and the old name-lookup grabbed whichever came first) can't happen. Output goes to
#   <fw>.<sanitized-mangled>.s.
set -euo pipefail
if [ "${1:-}" = "--sym" ]; then
  SYM="${2:?usage: disasm.sh --sym <mangledSymbol> <FW>}"; FW="${3:?framework required}"
  BIN="/Applications/Final Cut Pro.app/Contents/Frameworks/${FW}.framework/Versions/A/${FW}"
  ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  PFX="$FW"; [ "$FW" = "Ozone" ] && PFX="" || PFX="${FW}."
  SAFE="$(printf '%s' "$SYM" | tr -cd 'A-Za-z0-9_')"
  # FILENAME LENGTH CAP: 318 STL template instantiations (__tree/__hash_table) have sanitized
  # mangled names > 240 chars, so "${PFX}${SAFE}.s" exceeds the 255-byte filename limit and the
  # write silently fails -> those units are unportable. Cap to a stable prefix + sha1 tail. The
  # reader (classify_disasm.find_disasm) applies the IDENTICAL rule so both sides agree. The full
  # mangled symbol is preserved as the first line of the file body (awk prints "$SYM:"), so nothing
  # is lost. Threshold 200 leaves headroom for the "${PFX}" (<=11) + ".s" + hash suffix.
  if [ "${#SAFE}" -gt 200 ]; then
    H="$(printf '%s' "$SAFE" | shasum | cut -c1-16)"
    SAFE="${SAFE:0:200}__H${H}"
  fi
  OUT="$ROOT/re/disasm/${PFX}${SAFE}.s"
  mkdir -p "$(dirname "$OUT")"
  DIS="/tmp/${FW}_tV.txt"; THIN="/tmp/${FW}.x86_64"
  [ -s "$DIS" ] || otool -tV -arch x86_64 "$BIN" > "$DIS" 2>/dev/null
  # INDEXED LOOKUP (symidx.py): seek straight to the symbol instead of linear-scanning the dump.
  # These dumps are 9-220MB and this scan ran several times per ported unit (worker, G5 in gate.sh,
  # reviewer re-derivation); under the corp MDM file-inspection stack one full Flexo scan measured
  # 42s wall for 7.7s CPU, which pinned the box at load 119 with 31% CPU idle and capped the swarm
  # at ~4 slots. The index is proven byte-identical to the awk below (tools/verify_symidx.py checks
  # all ~45.8k symbol bodies), and falls back to the awk scan if anything is off.
  if ! python3 "$ROOT/tools/symidx.py" slice "$FW" "$SYM" > "$OUT" 2>/dev/null; then
    awk -v s="$SYM:" '$0==s{f=1;print;next} f&&/^([A-Za-z_$][^ \t]*|[-+]\[[^]]*\]):$/{exit} f{print}' "$DIS" > "$OUT"
  fi
  # PER-SYMBOL RE-DISASSEMBLY. otool's LINEAR sweep decodes the whole __text
  # section sequentially, so one mis-decode (in-text alignment padding, a jump
  # table, data) desynchronises the instruction boundaries: the sweep then
  # emits FABRICATED instructions until it happens to resynchronise, and any
  # symbol whose start it stepped over gets no label at all. Measured across
  # the five frameworks: 2,453 of 56,060 defined text symbols (4.4%) have NO
  # label in the linear dump — ProCore 501/4,633 (10.8%), Flexo 776/10,766.
  # `otool -tV -p <sym>` starts decoding AT the symbol, so the boundaries are
  # right; it costs ~0.1s on the thin slice. Do this BEFORE the objdump
  # fallback: it keeps otool's `## symbol stub for:` annotations, which the
  # objdump path does not produce.
  if [ ! -s "$OUT" ]; then
    [ -s "$THIN" ] || lipo "$BIN" -thin x86_64 -output "$THIN" 2>/dev/null || true
    if [ -s "$THIN" ]; then
      # NOTE: materialise otool's output FIRST instead of piping it into awk.
      # This script runs under `set -euo pipefail`, and the awk below exits at
      # the next label — which SIGPIPEs otool, makes the pipeline status 141,
      # and kills the whole script. (Caught by checking the exit status
      # directly rather than eyeballing the output; the .s was written and the
      # script still died.)
      TMPD="/tmp/disasm_p_$$.txt"
      otool -arch x86_64 -tV -p "$SYM" "$THIN" > "$TMPD" 2>/dev/null || true
      awk -v s="$SYM:" '$0==s{f=1;print;next} f&&/^([A-Za-z_$][^ \t]*|[-+]\[[^]]*\]):$/{exit} f{print}' "$TMPD" > "$OUT" || true
      rm -f "$TMPD"
      if [ -s "$OUT" ]; then
        echo "note: the linear -tV dump has no label for [$SYM] (sweep desync);" >&2
        echo "  re-disassembled from the symbol's own address with otool -tV -p." >&2
      fi
    fi
  fi
  if [ ! -s "$OUT" ]; then
    OBJDUMP="$(command -v llvm-objdump || command -v objdump || echo /usr/bin/objdump)"
    [ -s "$THIN" ] || lipo "$BIN" -thin x86_64 -output "$THIN" 2>/dev/null || true
    [ -s "$THIN" ] && "$OBJDUMP" --macho -d --disassemble-symbols="$SYM" "$THIN" 2>/dev/null > "$OUT" || true
    if [ -s "$OUT" ] && [ "$(wc -l < "$OUT")" -gt 600 ]; then
      echo "WARNING: objdump fallback for [$SYM] emitted $(wc -l < "$OUT") lines — ICF alias into a larger host fn." >&2
      echo "  Not the method body. nm -n slice or throw-stub @0xADDR." >&2; : > "$OUT"
    fi
  fi
  if [ ! -s "$OUT" ]; then
    # DELETE the empty artifact. Leaving a 0-byte .s on disk is a correctness hazard, not just
    # untidy: classify_disasm reads it as `EMPTY instrs=0`, which is INDISTINGUISHABLE from a
    # genuinely empty function body — so a no-op TS port of a REAL function can be accepted as
    # faithful. reviewer-03 hit this on #276 via a mistyped framework: `disasm.sh --sym <sym>
    # <wrongFW>` finds nothing, writes the empty file, and every later reader silently believes the
    # function has no body. Absence of a disassembly must look like an ERROR, never like evidence.
    rm -f "$OUT"
    echo "0-line disasm for [$SYM] in $FW (wrong framework? stub/extern/ICF?) — no .s written." >&2
    echo "  Do NOT treat this as an empty body: verify the framework with \`nm -n\` before porting." >&2
    exit 2
  fi
  # otool -tV symbolizes the disp32 of NON-%rip memory operands, turning struct field offsets into
  # unrelated function names (see desymbolize_disp.py). Put the numbers back before anyone reads it.
  python3 "$ROOT/tools/desymbolize_disp.py" "$OUT" "$FW" || true
  echo "wrote $OUT ($(wc -l < "$OUT") lines)  [$SYM]"; exit 0
fi
CLS="${1:?usage: disasm.sh <Class> [method] [framework]   OR   disasm.sh --sym <mangled> <FW>}"; METH="${2:-parseElement}"; FW="${3:-Ozone}"
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
NHIT=$(awk -F'\t' -v k="${CLS}::${METH}(" 'index($2,k)==1{n++} END{print n+0}' "$MAP")
if [ -z "${SYM:-}" ]; then echo "symbol not found: ${FW} ${CLS}::${METH}"; exit 1; fi
if [ "${NHIT:-0}" -gt 1 ]; then
  echo "note: '${CLS}::${METH}' matches ${NHIT} symbols (e.g. D0/D1/D2 variants demangle alike);" >&2
  echo "  grabbed the first ($SYM). For an EXACT variant use: disasm.sh --sym <mangled> ${FW}" >&2
fi
# Indexed lookup (see the --sym branch above for why); identical bytes, with the awk scan as fallback.
if ! python3 "$ROOT/tools/symidx.py" slice "$FW" "$SYM" > "$OUT" 2>/dev/null; then
  awk -v s="$SYM:" '$0==s{f=1;print;next} f&&/^([A-Za-z_$][^ \t]*|[-+]\[[^]]*\]):$/{exit} f{print}' "$DIS" > "$OUT"
fi
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
    # BOUND THE ICF BLOWUP: objdump --disassemble-symbols on an ICF-folded symbol whose address
    # aliases INTO a large host function emits that whole host (hundreds/thousands of lines) — a
    # misleading blob that invites guessing. A real single method here is small. If the fallback
    # ran past a sane cap, it's the alias pathology: refuse the blob, tell the worker to slice by
    # the real boundary via `nm -n` (next symbol addr) or to throw-stub citing @0xADDR.
    LINES=$(wc -l < "$OUT" 2>/dev/null || echo 0)
    if [ "${LINES:-0}" -gt 600 ]; then
      echo "WARNING: objdump fallback for [$SYM] emitted $LINES lines — ICF alias into a LARGER host fn." >&2
      echo "  This is NOT the method body. Find the real bounded slice:" >&2
      echo "  nm -n $THIN | grep -A1 '$SYM'   # next symbol addr = end of this (folded) body" >&2
      echo "  then sed the [start,next) VA range out of $OUT, OR throw-stub the method citing @0xADDR." >&2
      : > "$OUT"   # clear the misleading blob so no worker transcribes it wholesale
    fi
  fi
  if [ ! -s "$OUT" ]; then
    echo "WARNING: still 0-line after objdump fallback for ${FW} ${CLS}::${METH} [$SYM]" >&2
    echo "  (pure-stub / extern / truly-empty). DO NOT GUESS the body — throw-stub it citing @0xADDR." >&2
    exit 2
  fi
  # ICF-ALIAS OVER-DUMP GUARD: objdump --disassemble-symbols stops at the symbol's function end —
  # BUT for an ICF-folded trivial body (e.g. a ~Foo dtor), `nm` reports the symbol at an address
  # that is actually the START of a large UNRELATED kept function, so objdump dumps that whole
  # function (100s–1000s of lines). A worker must NOT transcribe that tail as the method body.
  # A real folded trivial method is tiny (<~40 lines). Flag any oversized fallback as UNRELIABLE.
  NLINES=$(wc -l < "$OUT")
  NLABELS=$(grep -cE '^[A-Za-z_][A-Za-z0-9_]*:$' "$OUT")
  if [ "$NLINES" -gt 400 ] || [ "${NLABELS:-0}" -gt 1 ]; then
    echo "WARNING: objdump fallback for ${FW} ${CLS}::${METH} [$SYM] returned $NLINES lines / $NLABELS labels" >&2
    echo "  — this looks like an ICF-ALIAS OVER-DUMP (the folded symbol aliases into a large kept" >&2
    echo "  function; the dump is NOT this method's body). DO NOT transcribe it. Options:" >&2
    echo "   * nm -n /tmp/${FW}.x86_64 | grep -n <mangled> to find the real labeled body slice, or" >&2
    echo "   * verify the trivial folded body at its @0xADDR and port it as the tiny idiom it is, or" >&2
    echo "   * throw-stub the method citing @0xADDR. (kept the dump at $OUT for inspection.)" >&2
    exit 3
  fi
  python3 "$ROOT/tools/desymbolize_disp.py" "$OUT" "$FW" || true
  echo "wrote $OUT ($NLINES lines via objdump ICF-fallback)  [$SYM]"
  exit 0
fi
python3 "$ROOT/tools/desymbolize_disp.py" "$OUT" "$FW" || true
echo "wrote $OUT ($(wc -l < "$OUT") lines)  [$SYM]"
