#!/bin/bash
# shader_disasm.sh <ShaderName> [framework]  — disassemble ONE Metal shader (AIR/LLVM-IR) from FCP's
# metallibs to raw-port/re/shaders/<ShaderName>.ll. Shaders are the per-pixel math the Hgc* render
# nodes dispatch to. Output is readable LLVM IR (named exactly after the shader).
#   framework: optional hint (Helium|Flexo|Ozone|ProMedia|Lithium|...) — omitted = search all metallibs.
set -uo pipefail
NAME="${1:?usage: shader_disasm.sh <ShaderName> [framework]}"; FWHINT="${2:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"                       # raw-port/
# Canonical on-disk name: C++ "::" is not filesystem/tooling friendly, so map it to "__".
# The metal-objdump module header still uses the raw "::" name, so we search by $NAME but
# write to the sanitized $SAFE — .ll / .ts / claim.py dedup all agree on the "__" form.
SAFE="${NAME//::/__}"
OUT="$ROOT/re/shaders/${SAFE}.ll"; mkdir -p "$(dirname "$OUT")"
MOBJDUMP="$(xcrun --find metal-objdump 2>/dev/null || true)"
[ -z "$MOBJDUMP" ] && MOBJDUMP="$(ls /var/run/com.apple.security.cryptexd/mnt/*/Metal.xctoolchain/usr/bin/metal-objdump 2>/dev/null | head -1)"
[ -x "$MOBJDUMP" ] || { echo "metal-objdump not found"; exit 1; }
FWROOT="/Applications/Final Cut Pro.app/Contents/Frameworks"
if [ -n "$FWHINT" ]; then
  LIBS=$(find "$FWROOT/$FWHINT.framework" -name "*.metallib" 2>/dev/null)
else
  LIBS=$(find "$FWROOT" -name "*.metallib" 2>/dev/null)
fi
TMPD="$(mktemp -d)"; trap 'rm -rf "$TMPD"' EXIT
# NOTE: FCP's path contains spaces ("Final Cut Pro.app"), so iterate LIBS line-by-line, never via
# unquoted word-splitting.
while IFS= read -r lib; do
  [ -z "$lib" ] && continue
  DIS="$TMPD/dis.txt"
  "$MOBJDUMP" --disassemble-all "$lib" > "$DIS" 2>/dev/null || continue
  # extract just this shader's module: from "0x.. -- <Name>:" until the next "0x.. -- <other>:"
  awk -v want="$NAME" '
    /^0x[0-9a-fA-F]+ -- .*:$/ {
      hdr=$0; sub(/^0x[0-9a-fA-F]+ -- /,"",hdr); sub(/:$/,"",hdr);
      if (hdr==want) { grab=1; print; next }
      else if (grab) { exit }
    }
    grab { print }
  ' "$DIS" > "$OUT.tmp"
  if [ -s "$OUT.tmp" ]; then
    mv "$OUT.tmp" "$OUT"
    echo "wrote $OUT ($(wc -l < "$OUT") lines)  [from $(echo "$lib" | sed 's#.*/Frameworks/##')]"
    exit 0
  fi
  rm -f "$OUT.tmp"
done <<< "$LIBS"
echo "shader not found: $NAME"; exit 1
