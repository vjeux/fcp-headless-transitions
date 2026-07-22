#!/usr/bin/env python3
"""tools/re/disasm_behavior.py — verbatim ARM64 disassembly of Motion behaviors
out of Final Cut Pro's Ozone framework.

Behaviors live across two Mach-O binaries:
  * the shared Ozone core  ...Ozone.framework/Versions/A/Ozone  (Link, Rig, Align To,
    Motion Path, Type On evaluators, and the shared OZSingleChannelBehavior base), and
  * the Behaviors plug-in  ...Ozone.framework/Versions/A/PlugIns/Behaviors.ozp/.../Behaviors
    (the physics/simulation accumForces + most parameter-behavior solveNode/getMultiplier).

Per-frame math lives in one of these methods, depending on the behavior family:
  * accumForces / accumInitialValues — physics/simulation behaviors (Gravity, Throw,
    Spring, Drag, Spin, Attractor, …); called by the shared integrator each sub-step.
  * solveNode / computeValue          — parameter behaviors (Oscillate, Ramp, Rate, Link,
    Clamp, Negate, Point At, Align To, …); produces the channel value at a time.
  * createCurveNode                    — behaviors that build a curve node (Wriggle,
    Grow/Shrink, Motion Path, Type On) whose node then solves per frame.
  * getMultiplier                      — Fade In/Fade Out (fade ramp).
  * handleCollisions                   — Edge Collision.

Usage:
  disasm_behavior.py --list                         list OZ*Behavior classes (both bins)
  disasm_behavior.py OZGravityBehavior              all defined methods of a class
  disasm_behavior.py --method accumForces OZSpringBehavior
"""
import sys, re, subprocess

OZONE = ("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/"
         "Versions/A/Ozone")
BEHAV = ("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/"
         "Versions/A/PlugIns/Behaviors.ozp/Contents/MacOS/Behaviors")
BINS = [("behaviors", BEHAV), ("ozone", OZONE)]

def _dis(binpath):
    return subprocess.run(["otool","-arch","arm64","-tV",binpath],
                          capture_output=True,text=True).stdout

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
    m=re.match(r"__ZN(\d+)([A-Za-z0-9_]+)",sym)
    if m:
        n=int(m.group(1)); nm=m.group(2)[:n]
        return nm if nm.startswith(("OZ","BH")) else None
    m=re.match(r"[-+]\[((?:OZ|BH)[A-Za-z0-9_]+)\s",sym)
    return m.group(1) if m else None

def main(argv):
    if not argv or argv[0] in ("-h","--help"): print(__doc__); return
    only=None; args=[]
    i=0
    while i<len(argv):
        if argv[i]=="--method": only=argv[i+1]; i+=2; continue
        args.append(argv[i]); i+=1
    all_blocks={}
    for label,binp in BINS:
        for sym,body in blocks(_dis(binp)).items():
            all_blocks.setdefault(sym,(label,body))
    if args and args[0]=="--list":
        classes=sorted(set(c for c in (cls_of(s) for s in all_blocks) if c and c.endswith("Behavior")))
        for c in classes: print(c)
        return
    for cls in args:
        printed=False
        for sym,(label,body) in all_blocks.items():
            if cls_of(sym)!=cls: continue
            if sym.startswith("__ZThn"): continue
            if only and only not in sym: continue
            print(f"----- [{label}] {demangle(sym)} -----")
            print(body); print(); printed=True
        if not printed:
            print(f"(no matching defined methods for {cls}"+(f" / {only}" if only else "")+")")

if __name__=="__main__":
    main(sys.argv[1:])
