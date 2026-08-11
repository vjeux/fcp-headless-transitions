#!/bin/bash
# disasm_class.sh <Class> [framework]  — batch-disassemble EVERY method of one class in ONE pass.
#   framework: Ozone (default) | ProChannel | ProCore | Flexo | Helium
# Workers were disassembling methods one-at-a-time and repeatedly hitting the 5s foreground timeout
# (N round-trips per class). This does the whole class at once: builds the symmap+otool cache ONCE,
# greps every `<Class>::` symbol, slices each body out of the cached otool -tV dump, and writes them
# to raw-port/re/disasm/<pfx><Class>.<method>.s. 0-line (ICF-folded) bodies auto-fall-back to
# objdump --disassemble-symbols (same as disasm.sh). Prints a one-line-per-method manifest.
set -euo pipefail
CLS="${1:?usage: disasm_class.sh <Class> [framework]}"; FW="${2:-Ozone}"
BIN="/Applications/Final Cut Pro.app/Contents/Frameworks/${FW}.framework/Versions/A/${FW}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PFX="$FW"; [ "$FW" = "Ozone" ] && PFX="" || PFX="${FW}."
OUTDIR="$ROOT/re/disasm"; mkdir -p "$OUTDIR"
MAP="/tmp/${FW}_symmap.tsv"; DIS="/tmp/${FW}_tV.txt"; THIN="/tmp/${FW}.x86_64"
OBJDUMP="$(command -v llvm-objdump || command -v objdump || echo /usr/bin/objdump)"

# Build caches once (shared with disasm.sh).
if [ ! -s "$MAP" ]; then
  nm -arch x86_64 "$BIN" 2>/dev/null | awk '$2=="T"||$2=="t"{print $3}' | grep '^__ZN' > "/tmp/${FW}_mangled.txt"
  c++filt < "/tmp/${FW}_mangled.txt" > "/tmp/${FW}_demangled.txt"
  paste "/tmp/${FW}_mangled.txt" "/tmp/${FW}_demangled.txt" > "$MAP"
fi
[ -s "$DIS" ]  || otool -tV -arch x86_64 "$BIN" > "$DIS" 2>/dev/null
[ -s "$THIN" ] || lipo "$BIN" -thin x86_64 -output "$THIN" 2>/dev/null || true

# Every symbol whose demangled name is "<CLS>::..." (methods, ctors, dtors, operators).
# Sanitize the method label for a filesystem name (strip args, "::"->".", drop bad chars).
MATCHES="$(awk -F'\t' -v k="${CLS}::" 'index($2,k)==1{print $1"\t"$2}' "$MAP")"
if [ -z "$MATCHES" ]; then echo "no symbols for ${FW} ${CLS}::"; exit 1; fi

N=0; OK=0; ICF=0; EMPTY=0
while IFS=$'\t' read -r SYM DEM; do
  [ -n "$SYM" ] || continue
  N=$((N+1))
  # method label = text after LAST "::" up to "(" ; sanitize for filename
  METH="$(printf '%s' "$DEM" | sed 's/(.*//; s/.*:://; s#[/ <>*&,:]#_#g')"
  [ -n "$METH" ] || METH="sym$N"
  OUT="$OUTDIR/${PFX}${CLS}.${METH}.s"
  # OVERLOAD-SAFE: N overloads (e.g. doLog(CFString*)/doLog(double)/...) all demangle to the same
  # METH and would clobber ONE .s file (only the last variant survives — a real data-loss bug that
  # bit FFPMRNoOpInstrument's 6 doLog variants). If this METH's file was already written THIS run,
  # disambiguate by a short suffix from the mangled symbol so every overload keeps its own body.
  if [ -n "${SEEN_METH:-}" ] && printf '%s\n' "$SEEN_METH" | grep -qxF "$METH"; then
    SFX="$(printf '%s' "$SYM" | tr -cd 'A-Za-z0-9' | tail -c 8)"
    OUT="$OUTDIR/${PFX}${CLS}.${METH}__${SFX}.s"
  fi
  SEEN_METH="${SEEN_METH:-}
$METH"
  # Indexed lookup — this loop runs ONE PER METHOD, so on a 20-method class the old awk scan re-read
  # the whole dump 20 times (20 x 220MB on Flexo). symidx seeks to each body instead; byte-identical
  # (verify_symidx.py), with the awk scan as fallback.
  if ! python3 "$ROOT/tools/symidx.py" slice "$FW" "$SYM" > "$OUT" 2>/dev/null; then
    awk -v s="$SYM:" '$0==s{f=1;print;next} f&&/:$/{exit} f{print}' "$DIS" > "$OUT"
  fi
  if [ ! -s "$OUT" ]; then
    # ICF-folded / no otool label — objdump per-symbol fallback (exact boundary).
    if [ -s "$THIN" ]; then "$OBJDUMP" --macho -d --disassemble-symbols="$SYM" "$THIN" 2>/dev/null > "$OUT" || true; fi
    # BOUND THE ICF BLOWUP: a folded symbol aliasing into a large host fn makes objdump emit that
    # whole host (100s-1000s of lines) — a misleading blob, not the method. Cap it: clear + flag.
    if [ -s "$OUT" ] && [ "$(wc -l < "$OUT")" -gt 600 ]; then
      echo "  [BLOB] ${METH}  $(wc -l < "$OUT")L — ICF alias into larger host fn; clearing (nm -n slice or throw-stub @0xADDR)  [$SYM]"
      : > "$OUT"
    fi
    if [ -s "$OUT" ]; then ICF=$((ICF+1)); L=$(wc -l < "$OUT"); echo "  [icf] ${METH}  ${L}L  [$SYM]";
    else EMPTY=$((EMPTY+1)); echo "  [EMPTY] ${METH}  (pure-stub/extern — throw-stub @0xADDR)  [$SYM]"; fi
  else
    OK=$((OK+1)); L=$(wc -l < "$OUT"); echo "  [ok]  ${METH}  ${L}L  [$SYM]"
  fi
done <<< "$MATCHES"
echo "== ${FW} ${CLS}: ${N} symbols  (${OK} otool, ${ICF} objdump-ICF, ${EMPTY} empty) -> $OUTDIR/${PFX}${CLS}.*.s =="
