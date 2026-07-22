#!/usr/bin/env python3
"""tools/re/gen_behavior_decomp.py — inject a "Decompiled code (ground truth)"
subsection under each decodable *simulation* behavior in docs/types/BEHAVIORS.md.

FCP's physics behaviors live in Ozone's Behaviors.ozp. Each one implements a C++
accumForces(OZSimulationState*, OZTransformNode*) — and some an accumInitialValues(...)
— that the shared Ozone integrator calls per sub-step to add that behavior's force /
initial velocity to the object's motion state. That method IS the per-frame algorithm,
and it disassembles cleanly. This tool embeds the verbatim ARM64 disassembly (via
disasm_behavior.py) under the matching behavior heading. Nothing is paraphrased.

Parameter behaviors (Oscillate, Ramp, Randomize, …) are table-driven in the Ozone core
and are NOT covered here (their per-frame math is not a standalone method in this binary);
they keep their functional descriptions. Regenerate:
  venv/bin/python3 tools/re/gen_behavior_decomp.py
"""
import os, re, subprocess

HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,"..",".."))
DOC=os.path.join(REPO,"docs","types","BEHAVIORS.md")
BIN=("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/"
     "Versions/A/PlugIns/Behaviors.ozp/Contents/MacOS/Behaviors")

# corpus behavior heading -> Ozone C++ class (physics/simulation only)
SIM={
 "Gravity":"OZGravityBehavior","Throw":"OZThrowBehavior","Spin":"OZSpinBehavior",
 "Spring":"OZSpringBehavior","Drag":"OZViscousDragBehavior",
 "Rotational Drag":"OZRotationalDragBehavior","Random Motion":"OZBrownianBehavior",
 "Attractor":"OZAttractorBehavior","Orbit Around":"OZVortexAroundBehavior",
 "Repel":"OZAttractedToBehavior",
}

def dis():
    return subprocess.run(["otool","-arch","arm64","-tV",BIN],capture_output=True,text=True).stdout
def blocks(txt):
    bl={};cur=None;buf=[]
    for ln in txt.split("\n"):
        if ln and not ln[0].isspace() and ln.rstrip().endswith(":") and "\t" not in ln:
            if cur is not None: bl[cur]="\n".join(buf)
            cur=ln.rstrip()[:-1];buf=[]
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
    return None

def methods_for(bl, cls):
    """accum* methods for a class; prefer OZSimulationState* variant, then longest."""
    ms=[s for s in bl if cls_of(s)==cls and ("accumForces" in s or "accumInitialValues" in s)]
    def key(s): return (0 if "SimulationState" in s else 1,
                         0 if "accumInitialValues" in s else 1,
                         -len(bl[s]))
    return sorted(ms,key=key)

def section(cls, bl):
    ms=methods_for(bl,cls)
    if not ms: return None
    out=["### Decompiled code (ground truth)","",
         "Verbatim ARM64 disassembly from the user's licensed FCP install "
         f"(`Ozone.framework/…/Behaviors.ozp`, class `{cls}`). This `accum*` method is "
         "what the shared Ozone simulation integrator calls each sub-step to add this "
         "behavior's contribution to the object's motion state — the actual per-frame "
         "algorithm, not a paraphrase. Regenerate: "
         f"`venv/bin/python3 tools/re/disasm_behavior.py {cls}`",""]
    # show at most: one accumInitialValues + one accumForces (the SimulationState variants)
    shown=set(); picked=[]
    for s in ms:
        kind="accumInitialValues" if "accumInitialValues" in s else "accumForces"
        if kind in shown: continue
        shown.add(kind); picked.append(s)
    for s in picked:
        out.append(f"#### `{demangle(s)}`")
        out.append("```asm"); out.append(bl[s].rstrip()); out.append("```\n")
    return "\n".join(out).rstrip()+"\n"

MARK="### Decompiled code (ground truth)"
def main():
    bl=blocks(dis())
    txt=open(DOC).read()
    lines=txt.split("\n")
    # find heading line indices
    heads=[(i,ln[3:].strip()) for i,ln in enumerate(lines) if ln.startswith("## ")]
    # build new text by walking sections
    out=[]; i=0; n=0
    # index of next heading after each
    head_idx=[i for i,_ in heads]
    for idx in range(len(lines)):
        pass
    # simpler: operate on the raw text per behavior using regex splice
    for name,cls in SIM.items():
        sec=section(cls,bl)
        if not sec: continue
        # locate "## <name>\n" ... up to next "## " heading
        m=re.search(r"(^##\s+"+re.escape(name)+r"\s*$)",txt,re.M)
        if not m: 
            print("heading not found:",name); continue
        start=m.start()
        nxt=re.search(r"^##\s+",txt[m.end():],re.M)
        end=m.end()+nxt.start() if nxt else len(txt)
        body=txt[start:end]
        # strip an existing decompiled subsection if present (idempotent)
        body=re.sub(r"\n### Decompiled code \(ground truth\).*?(?=\Z)", "\n", body, flags=re.S).rstrip()+"\n"
        body=body.rstrip()+"\n\n"+sec+"\n"
        txt=txt[:start]+body+txt[end:]
        n+=1
    open(DOC,"w").write(txt)
    print(f"injected decompiled subsection into {n} simulation behaviors")

if __name__=="__main__":
    main()
