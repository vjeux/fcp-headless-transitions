#!/usr/bin/env python3
"""assemble_class.py <FW> <Class> — stitch a big class's landed method-chunks into one <Class>.ts.

Anti-shortcut chunking (claim.py) splits a >24-method class into 20-method chunks, each written to
src/<layer>/<Class>.m<k>.ts by a separate agent. This tool composes them into the canonical
src/<layer>/<Class>.ts once chunks have landed.

CHUNK-FILE CONVENTION (what a worker writes into <Class>.m<k>.ts):
  - A file that exports `export const <Class>_m<k>_methods = { "<sel-or-name>": (self, ...args) => {...}, ... }`
    — a plain object mapping each ported method (by its demangled/selector key) to a faithful fn.
  - Plus any @0xADDR-cited helpers/consts it needs, file-local.
The assembler merges every landed <Class>.m<k>_methods object into one dispatch table and emits
<Class>.ts that re-exports the union + a `<Class>_methods` aggregate. It NEVER invents bodies — it
only unions what chunk files already exported. Missing chunks are listed as TODO comments (not stubbed).

Usage:
  assemble_class.py <FW> <Class>              # emit/refresh src/<layer>/<Class>.ts from landed chunks
  assemble_class.py --status <FW> <Class>     # print chunk coverage (k landed / total)
"""
import sys, os, re, json, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raw-port/
LED  = os.path.join(ROOT, "army", "ledger")
SRC  = os.path.join(ROOT, "src")
CHUNK = 20

def _layer(cls):
    if cls.startswith('PC') or 'Matrix' in cls or 'Exception' in cls or 'Timecode' in cls or 'Statistics' in cls: return 'infra'
    if cls.startswith('HG') or cls.startswith('Hgc') or 'Mask' in cls or 'Blend' in cls or 'PanMatrix' in cls or 'HCopy' in cls: return 'render'
    if 'Node' in cls and 'Channel' not in cls: return 'nodes'
    return 'channels'

def _nchunks(fw, cls):
    led = json.load(open(os.path.join(LED, f"{fw}.ledger.json")))
    n = len(led.get(cls, {}))
    return (n + CHUNK - 1) // CHUNK, n

def _landed_chunks(cls, layer):
    found = {}
    for p in glob.glob(os.path.join(SRC, layer, f"{cls}.m*.ts")):
        m = re.search(rf'{re.escape(cls)}\.m(\d+)\.ts$', p)
        if m: found[int(m.group(1))] = os.path.basename(p)
    return found

def main():
    args = sys.argv[1:]
    status = False
    if args and args[0] == "--status": status = True; args = args[1:]
    if len(args) < 2: print(__doc__); sys.exit(1)
    fw, cls = args[0], args[1]
    layer = _layer(cls)
    nchunks, nmeth = _nchunks(fw, cls)
    landed = _landed_chunks(cls, layer)
    if status:
        miss = [k for k in range(nchunks) if k not in landed]
        print(f"{fw}:{cls}  {len(landed)}/{nchunks} chunks landed ({nmeth} methods)  missing={miss}")
        return
    # Emit <Class>.ts unioning the landed chunk method-objects. Do NOT fabricate missing ones.
    outp = os.path.join(SRC, layer, f"{cls}.ts")
    lines = [f"// {cls} — assembled from method-chunks by assemble_class.py (anti-shortcut chunking).",
             f"// Framework: {fw}. {nmeth} methods across {nchunks} chunks of {CHUNK}.",
             f"// Chunks landed: {sorted(landed)} / {list(range(nchunks))}.",
             "// This file only UNIONS chunk exports; each method body lives in its <Class>.m<k>.ts.",
             ""]
    for k in sorted(landed):
        lines.append(f'import {{ {cls}_m{k}_methods }} from "./{cls}.m{k}";')
    miss = [k for k in range(nchunks) if k not in landed]
    for k in miss:
        lines.append(f"// TODO chunk m{k}: not yet landed — port via `claim.py chunk {fw} {cls} {k}`.")
    lines.append("")
    union = " ,\n  ".join(f"...{cls}_m{k}_methods" for k in sorted(landed)) or "/* no chunks landed yet */"
    lines.append(f"export const {cls}_methods = {{\n  {union}\n}};")
    lines.append("")
    os.makedirs(os.path.dirname(outp), exist_ok=True)
    open(outp, "w").write("\n".join(lines))
    print(f"wrote {outp}  ({len(landed)}/{nchunks} chunks, {len(miss)} TODO)")

if __name__ == "__main__": main()
