#!/usr/bin/env python3
"""tools/re/disasm_component.py — verbatim ARM64 disassembly of Motion component
(scene-graph node) methods out of FCP's Ozone core + Lithium rendering framework.

Component render/eval math is spread across:
  * Ozone core  ...Ozone.framework/Versions/A/Ozone      (Shape, Clone, Text, Rig,
    Widget, Generator, Image scene-node methods), and
  * Lithium      ...Lithium.framework/Versions/A/Lithium  (Camera projection, Light
    shading nodes — the LiCamera / LiLight math).

Usage:
  disasm_component.py --list [Cam]                list OZ*/Li* node classes
  disasm_component.py LiCamera                    all defined methods of a class
  disasm_component.py --method localToClipMatrix LiCamera
"""
import sys, re, subprocess

OZONE=("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone")
LITH =("/Applications/Final Cut Pro.app/Contents/Frameworks/Lithium.framework/Versions/A/Lithium")
PART =("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/"
       "Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles")
BINS=[("ozone",OZONE),("lithium",LITH),("particles",PART)]

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
    m=re.match(r"[-+]\[([A-Za-z_][A-Za-z0-9_]+)\s",sym)
    if m: return m.group(1)
    ss=sym.replace("__ZNK","__ZN")
    m=re.match(r"__ZN(\d+)([A-Za-z0-9_]+)",ss)
    if m:
        n=int(m.group(1)); nm=m.group(2)[:n]
        return nm if nm.startswith(("OZ","Li","PS","TX","PC")) else None
    return None

def main(argv):
    if not argv or argv[0] in ("-h","--help"): print(__doc__); return
    only=None; args=[]
    i=0
    while i<len(argv):
        if argv[i]=="--method": only=argv[i+1]; i+=2; continue
        args.append(argv[i]); i+=1
    allb={}
    for label,binp in BINS:
        for sym,body in blocks(_dis(binp)).items():
            allb.setdefault(sym,(label,body))
    if args and args[0]=="--list":
        sub=args[1] if len(args)>1 else None
        classes=sorted(set(c for c in (cls_of(s) for s in allb) if c and (not sub or sub.lower() in c.lower())))
        for c in classes: print(c)
        return
    for cls in args:
        printed=False
        for sym,(label,body) in allb.items():
            if cls_of(sym)!=cls or sym.startswith("__ZThn"): continue
            if only and only not in sym: continue
            print(f"----- [{label}] {demangle(sym)} -----")
            print(body); print(); printed=True
        if not printed:
            print(f"(no matching defined methods for {cls}"+(f" / {only}" if only else "")+")")

if __name__=="__main__":
    main(sys.argv[1:])
