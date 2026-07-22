#!/usr/bin/env python3
"""tools/re/gen_constructs_decomp.py — embed verbatim decompiled code for the
foundational Motion CONSTRUCTS (keyframe interpolation + Bezier geometry) into
docs/types/CONSTRUCTS.md.

The keyframe interpolation table in CONSTRUCTS.md (Ease In/Out, Accelerate, Decelerate,
S-Curve, …) is driven by two ProCore primitives that this tool embeds verbatim:
  * PCMath::easeInOut(t, easeIn, easeOut, v0, v1, *out, *outDeriv)  — the parametric
    ease used for Ease/Accelerate/Decelerate/S-Curve (parabolic accel + decel segments
    with configurable ease-in / ease-out fractions), and
  * PCMath::inverseEaseInOut(...)                                    — its inverse
    (value -> normalized time), used when solving a keyframe for a target value.
Bezier / Catmull-Rom keyframes evaluate through PCAlgorithm::BezierSubdivide (ProCore),
whose signature is shown. This is the actual code Apple ships; nothing is paraphrased.

Reads nothing but the binaries. Regenerate:
  venv/bin/python3 tools/re/gen_constructs_decomp.py
"""
import os, re, subprocess

HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,"..",".."))
DOC=os.path.join(REPO,"docs","types","CONSTRUCTS.md")
PROCORE=("/Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore")

def disasm(binp, needle):
    txt=subprocess.run(["otool","-arch","arm64","-tV",binp],capture_output=True,text=True).stdout
    out=[]; f=False
    for ln in txt.split("\n"):
        if not f and ln.startswith(needle) and ln.rstrip().endswith(":"): f=True
        if f:
            out.append(ln)
            if ln.rstrip().endswith("\tret"): break
    return "\n".join(out)

def demangle(s):
    return subprocess.run(["c++filt"],input=s,capture_output=True,text=True).stdout.strip()

SEC_TITLE="### Interpolation primitives — decompiled code (ground truth)"
def build():
    ease=disasm(PROCORE,"__ZN6PCMath9easeInOut")
    inv =disasm(PROCORE,"__ZN6PCMath16inverseEaseInOut")
    out=[SEC_TITLE,"",
         "The interpolation table above is not hand-tuned prose: the time-warp eases "
         "(Ease, Accelerate, Decelerate, S-Curve, Ease In/Out) are computed by "
         "**`PCMath::easeInOut`** in ProCore, and Bezier/Catmull-Rom keyframes evaluate "
         "through `PCAlgorithm::BezierSubdivide`. Below is the **verbatim ARM64 "
         "disassembly** from the user's licensed FCP install "
         "(`ProCore.framework/…/ProCore`). Regenerate: "
         "`venv/bin/python3 tools/re/gen_constructs_decomp.py` (or disassemble "
         "`PCMath::easeInOut` / `PCMath::inverseEaseInOut` directly with `otool -tV`).",""]
    if ease:
        out.append("#### `PCMath::easeInOut(double t, double easeIn, double easeOut, double v0, double v1, double* outValue, double* outDeriv)`")
        out.append("The parametric ease: two parabolic segments (accelerate over the first "
                   "`easeIn` fraction, decelerate over the last `easeOut` fraction, linear "
                   "between). Ease=both, Accelerate=easeIn only, Decelerate=easeOut only, "
                   "S-Curve=symmetric. Returns the eased value and its derivative.")
        out.append("```asm"); out.append(ease.rstrip()); out.append("```\n")
    if inv:
        out.append("#### `PCMath::inverseEaseInOut(...)`  — value → normalized time (the inverse)")
        out.append("```asm"); out.append(inv.rstrip()); out.append("```\n")
    out.append("Bezier / Catmull-Rom keyframes call "
               "`PCAlgorithm::BezierSubdivide(PCVector4<double> p0, p1, p2, p3, int depth, "
               "double, double, PCMatrix44 const*, vector<double>&, …)` in ProCore to flatten "
               "the cubic into samples; disassemble it with "
               "`otool -arch arm64 -tV \"…/ProCore.framework/Versions/A/ProCore\" | grep -A400 BezierSubdivide`.")
    return "\n".join(out).rstrip()+"\n"

def main():
    txt=open(DOC).read()
    sec=build()
    # insert right after the interpolation-types table section (before "## 3. Time encoding")
    m=re.search(r"^## 3\. Time encoding",txt,re.M)
    # strip prior injected block
    txt=re.sub(r"\n### Interpolation primitives — decompiled code \(ground truth\).*?(?=\n## 3\. Time encoding)","\n",txt,flags=re.S)
    m=re.search(r"^## 3\. Time encoding",txt,re.M)
    if not m:
        print("anchor '## 3. Time encoding' not found"); return
    txt=txt[:m.start()]+sec+"\n---\n\n"+txt[m.start():]
    open(DOC,"w").write(txt)
    print("injected interpolation-primitives decompiled section")

if __name__=="__main__":
    main()
