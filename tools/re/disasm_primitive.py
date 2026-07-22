#!/usr/bin/env python3
"""tools/re/disasm_primitive.py — verbatim ARM64 disassembly of a Helium image
primitive (HGColorMatrix, HDirectionalBlur, HGModulatedBlur, HGaussianBlur, HTwirl,
HDiscWarp, …) out of FCP's Filters Mach-O and the Helium framework.

Filters with no dedicated Hgc* fragment shader delegate their per-pixel work to a
compiled C++ Helium primitive. This tool prints that primitive's real setup + output
methods (init / SetParameter / setBlurValues / GetOutput / RenderFragment / RenderTile)
— the actual math, not a paraphrase. Searches both binaries a primitive can live in.

Usage:
  disasm_primitive.py HDirectionalBlur
  disasm_primitive.py --method GetOutput HGColorMatrix
"""
import sys, re, subprocess

FILTERS=("/Applications/Final Cut Pro.app/Contents/PlugIns/InternalFiltersXPC.pluginkit/"
         "Contents/PlugIns/Filters.bundle/Contents/MacOS/Filters")
HELIUM =("/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium")
BINS=[("Filters",FILTERS),("Helium",HELIUM)]

# the methods that carry a primitive's real algorithm (setup + per-pixel/tile output)
CORE_METHODS=("init","SetParameter","setBlurValues","setValues","LoadMatrix",
              "GetOutput","RenderFragment","RenderTile","GetProgram","ParameterizeMatrix",
              "getKernel","buildKernel")

def _dis(binp):
    return subprocess.run(["otool","-arch","arm64","-tV",binp],capture_output=True,text=True).stdout

def blocks(txt):
    bl={}; cur=None; buf=[]
    for ln in txt.split("\n"):
        if ln and not ln[0].isspace() and ln.rstrip().endswith(":") and "\t" not in ln:
            if cur is not None: bl[cur]="\n".join(buf)
            cur=ln.rstrip()[:-1]; buf=[]
        else: buf.append(ln)
    if cur is not None: bl[cur]="\n".join(buf)
    return bl

def demangle(s):
    return subprocess.run(["c++filt"],input=s,capture_output=True,text=True).stdout.strip()

def cls_of(sym):
    ss=sym.replace("__ZNK","__ZN")
    m=re.match(r"__ZN(\d+)([A-Za-z0-9_]+)",ss)
    if m:
        n=int(m.group(1)); nm=m.group(2)[:n]
        return nm if nm[0] in "H" else None
    return None

def meth_of(sym):
    ss=sym.replace("__ZNK","__ZN")
    m=re.match(r"__ZN(\d+)([A-Za-z0-9_]+)",ss)
    if not m: return None
    rest=m.group(2)[int(m.group(1)):]
    mm=re.match(r"(\d+)([A-Za-z0-9_]+)",rest)
    return mm.group(2)[:int(mm.group(1))] if mm else None

def collect(prim, only=None, core_only=True):
    """Return ordered list of (binlabel, mangled, demangled, body)."""
    out=[]
    for label,binp in BINS:
        for sym,body in blocks(_dis(binp)).items():
            if sym.startswith("__ZThn"): continue
            if cls_of(sym)!=prim: continue
            m=meth_of(sym)
            if only and (not m or only not in m): continue
            if core_only and not only and (m not in CORE_METHODS): continue
            out.append((label,sym,demangle(sym),body))
    return out

def main(argv):
    if not argv or argv[0] in ("-h","--help"): print(__doc__); return
    only=None; args=[]
    i=0
    while i<len(argv):
        if argv[i]=="--method": only=argv[i+1]; i+=2; continue
        if argv[i]=="--all": args.append(("__ALL__",)); i+=1; continue
        args.append(argv[i]); i+=1
    core_only = not any(a==("__ALL__",) for a in args)
    prims=[a for a in args if a!=("__ALL__",)]
    for prim in prims:
        hits=collect(prim, only, core_only)
        if not hits:
            print(f"(no methods found for {prim}"+(f" / {only}" if only else "")+")"); continue
        for label,sym,dem,body in hits:
            print(f"----- [{label}] {dem} -----")
            print(body); print()

if __name__=="__main__":
    main(sys.argv[1:])
