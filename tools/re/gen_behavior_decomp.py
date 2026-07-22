#!/usr/bin/env python3
"""tools/re/gen_behavior_decomp.py — inject a "Decompiled code (ground truth)"
subsection under EVERY behavior in docs/types/BEHAVIORS.md that has a decodable
per-frame method in FCP's Ozone binaries.

Behaviors live across two Mach-O binaries (Ozone core + Behaviors.ozp). Each behavior's
per-frame math is one of: accumForces / accumInitialValues (physics), solveNode /
computeValue (parameter behaviors), createCurveNode (curve-node builders), getMultiplier
(Fade), or handleCollisions (Edge Collision). This tool embeds the VERBATIM ARM64
disassembly of that method under the matching behavior heading. Nothing is paraphrased.

The 4 behaviors with no behavior-specific method (Custom, Sequence, Sequence Text,
Randomize) evaluate through the shared OZSingleChannelBehavior::solveNode base plus a
per-instance user/table curve — that shared base is shown once and they are noted honestly.

Reads tools/re/behavior_binding.json. Regenerate:
  venv/bin/python3 tools/re/gen_behavior_decomp.py
"""
import os, re, json, subprocess

HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,"..",".."))
DOC=os.path.join(REPO,"docs","types","BEHAVIORS.md")
BINDING=json.load(open(os.path.join(HERE,"behavior_binding.json")))

OZONE=("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone")
BEHAV=("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/"
       "Versions/A/PlugIns/Behaviors.ozp/Contents/MacOS/Behaviors")

_CACHE={}
def blocks(binp):
    if binp in _CACHE: return _CACHE[binp]
    txt=subprocess.run(["otool","-arch","arm64","-tV",binp],capture_output=True,text=True).stdout
    bl={}; cur=None; buf=[]
    for ln in txt.split("\n"):
        if ln and not ln[0].isspace() and ln.rstrip().endswith(":") and "\t" not in ln:
            if cur is not None: bl[cur]="\n".join(buf)
            cur=ln.rstrip()[:-1]; buf=[]
        else: buf.append(ln)
    if cur is not None: bl[cur]="\n".join(buf)
    _CACHE[binp]=bl; return bl

def demangle(s):
    return subprocess.run(["c++filt"],input=s,capture_output=True,text=True).stdout.strip()

def body_for(mangled, binlabel):
    binp = BEHAV if binlabel=="behaviors" else OZONE
    bl=blocks(binp)
    if mangled in bl: return bl[mangled]
    # otool may drop leading underscore differences; try both
    alt = mangled[1:] if mangled.startswith("_") else "_"+mangled
    return bl.get(alt)

BINLABEL={"behaviors":"Ozone.framework/…/Behaviors.ozp","ozone":"Ozone.framework/…/Ozone"}

def section(name, b):
    out=["### Decompiled code (ground truth)",""]
    if b["category"]=="shared_base":
        out.append(f"This behavior (`{b['class']}`) has **no behavior-specific per-frame method** in "
                   "the binary: it evaluates through the shared "
                   "`OZSingleChannelBehavior::solveNode` base together with a per-instance "
                   "user/table curve — for Custom/Sequence/Randomize the actual shape comes from the "
                   "saved keyframes / sequence table in the `.motn`, not from compiled code. The "
                   "verbatim shared base solver Apple ships is shown below; regenerate with "
                   "`venv/bin/python3 tools/re/disasm_behavior.py OZSingleChannelBehavior`.\n")
        base="__ZN23OZSingleChannelBehavior9solveNodeEjRK6CMTimedd"
        body=body_for(base,"ozone")
        if body:
            out.append("#### `OZSingleChannelBehavior::solveNode(unsigned int, CMTime const&, double, double)`  (shared base)")
            out.append("```asm"); out.append(body.rstrip()); out.append("```\n")
        return "\n".join(out).rstrip()+"\n"
    meth=b["method"]; sym=b["mangled"]; binl=b["binary"]
    kind=b.get("kind",meth)
    out.append(f"Verbatim ARM64 disassembly from the user's licensed FCP install "
               f"(`{BINLABEL[binl]}`, class `{b['class']}`). This `{meth}` method is the behavior's "
               f"**{kind}** — the actual per-frame algorithm Apple ships, not a paraphrase. "
               f"Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method {meth} {b['class']}`\n")
    body=body_for(sym,binl)
    if not body:
        out.append(f"> (method `{demangle(sym)}` is present in the binary symbol table; run the "
                   "regenerate command above to print it.)")
        return "\n".join(out)+"\n"
    out.append(f"#### `{demangle(sym)}`")
    out.append("```asm"); out.append(body.rstrip()); out.append("```\n")
    # if it's a simulation behavior, also show accumInitialValues when present
    if meth=="accumForces":
        cls=b["class"]
        bl=blocks(BEHAV)
        for s2,bd in bl.items():
            if not s2.startswith("__ZThn") and "accumInitialValues" in s2 and cls in s2:
                # verify class match
                m=re.match(r"__ZN(\d+)([A-Za-z0-9_]+)",s2)
                if m and m.group(2)[:int(m.group(1))]==cls:
                    out.append(f"#### `{demangle(s2)}`")
                    out.append("```asm"); out.append(bd.rstrip()); out.append("```\n")
                    break
    return "\n".join(out).rstrip()+"\n"

def main():
    txt=open(DOC).read()
    n=0
    for name,b in BINDING.items():
        sec=section(name,b)
        m=re.search(r"(^##\s+"+re.escape(name)+r"\s*$)",txt,re.M)
        if not m:
            print("heading not found:",name); continue
        start=m.start()
        nxt=re.search(r"^##\s+",txt[m.end():],re.M)
        end=m.end()+nxt.start() if nxt else len(txt)
        body=txt[start:end]
        body=re.sub(r"\n### Decompiled code \(ground truth\).*?(?=\Z)","\n",body,flags=re.S).rstrip()+"\n"
        body=body.rstrip()+"\n\n"+sec+"\n"
        txt=txt[:start]+body+txt[end:]
        n+=1
    open(DOC,"w").write(txt)
    print(f"injected decompiled subsection into {n} behaviors")

if __name__=="__main__":
    main()
