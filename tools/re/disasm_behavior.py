#!/usr/bin/env python3
"""tools/re/disasm_behavior.py — verbatim ARM64 disassembly of Motion behaviors
out of Final Cut Pro's Ozone Behaviors plug-in.

FCP's procedural-animation behaviors live in
  Ozone.framework/Versions/A/PlugIns/Behaviors.ozp/Contents/MacOS/Behaviors
The physics ("simulation") behaviors — Gravity, Throw, Spin, Spring, Drag,
Rotational Drag, Random Motion (Brownian), Attractor, Attracted To, Repel,
Orbit Around (Vortex), Wind — each implement a C++ `accumForces(OZSimulationState*,
OZTransformNode*)` (and some an `accumInitialValues(...)`) that the shared Ozone
integrator calls once per sub-step to add that behavior's contribution to the
object's velocity/position state. That method IS the per-frame algorithm.

Usage:
  disasm_behavior.py --list                     list OZ*Behavior classes
  disasm_behavior.py OZGravityBehavior          all defined methods of a class
  disasm_behavior.py --method accumForces OZSpringBehavior
"""
import sys, re, subprocess

BIN = ("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/"
       "Versions/A/PlugIns/Behaviors.ozp/Contents/MacOS/Behaviors")

def _dis():
    return subprocess.run(["otool","-arch","arm64","-tV",BIN],capture_output=True,text=True).stdout

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
    m=re.match(r"[-+]\[((?:OZ|BH)[A-Za-z0-9_]+)\s",sym)
    if m: return m.group(1)
    # C++ mangled: __ZN<len><Name>... — <len> counts exactly <Name>'s chars
    m=re.match(r"__ZN(\d+)([A-Za-z0-9_]+)",sym)
    if m:
        n=int(m.group(1)); nm=m.group(2)[:n]
        return nm if nm.startswith(("OZ","BH")) else None
    return None

def main(argv):
    if not argv or argv[0] in ("-h","--help"): print(__doc__); return
    only=None; args=[]
    i=0
    while i<len(argv):
        if argv[i]=="--method": only=argv[i+1]; i+=2; continue
        args.append(argv[i]); i+=1
    bl=blocks(_dis())
    if args and args[0]=="--list":
        classes=sorted(set(c for c in (cls_of(s) for s in bl) if c and c.endswith("Behavior")))
        for c in classes: print(c)
        return
    for cls in args:
        printed=False
        for sym,body in bl.items():
            if cls_of(sym)!=cls: continue
            if only and only not in sym: continue
            print(f"----- {demangle(sym)} -----")
            print(body); print(); printed=True
        if not printed:
            print(f"(no matching defined methods for {cls}"+(f" / {only}" if only else "")+")")

if __name__=="__main__":
    main(sys.argv[1:])
