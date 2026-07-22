#!/usr/bin/env python3
"""tools/re/gen_component_decomp.py — inject a "Decompiled code (ground truth)"
subsection under each component type in docs/types/COMPONENTS.md that has a
decodable node method in FCP's Ozone / Lithium binaries.

Component (scene-graph node) render/eval math is spread across the Ozone core and the
Lithium rendering layer. Where a component type concentrates its math in a single
decodable CPU method, this tool embeds the VERBATIM ARM64 disassembly of that method:
  * Camera   -> LiCamera::localToClipMatrix       (3D->2D projection matrix)
  * Light    -> LiLight::getSpotNodeSurface       (cone/attenuation shading node)
  * Shape    -> OZShapeBehavior::solveNode         (vector-contour solver)
  * Clone    -> OZCloneGenerator::getDimensions    (output geometry / time remap)
  * Text     -> OZTextLayout::setText              (glyph-run layout)
  * Widget   -> OZRigWidget::getSnapshotForValue   (snapshot interpolation)
  * Rig      -> OZRigBehavior::solveNode           (rig fan-out)
  * Generator-> OZSoftGradientGenerator::getHelium (representative procedural generator)
  * Image    -> OZImageNode::getImageBounds        (drop-zone geometry)
Component types whose work is GPU-render-graph driven (Replicator, Emitter, Particle
Cell, …) have no single decodable CPU method; they are noted honestly.

Reads tools/re/component_binding.json. Regenerate:
  venv/bin/python3 tools/re/gen_component_decomp.py
"""
import os, re, json, subprocess

HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,"..",".."))
DOC=os.path.join(REPO,"docs","types","COMPONENTS.md")
CB=json.load(open(os.path.join(HERE,"component_binding.json")))

OZONE=("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone")
LITH =("/Applications/Final Cut Pro.app/Contents/Frameworks/Lithium.framework/Versions/A/Lithium")
PART =("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/"
       "Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles")
LABEL={"ozone":"Ozone.framework/…/Ozone","lithium":"Lithium.framework/…/Lithium",
       "particles":"Ozone.framework/…/Particles.ozp"}

_C={}
def blocks(binp):
    if binp in _C: return _C[binp]
    txt=subprocess.run(["otool","-arch","arm64","-tV",binp],capture_output=True,text=True).stdout
    bl={}; cur=None; buf=[]
    for ln in txt.split("\n"):
        if ln and not ln[0].isspace() and ln.rstrip().endswith(":") and "\t" not in ln:
            if cur is not None: bl[cur]="\n".join(buf)
            cur=ln.rstrip()[:-1]; buf=[]
        else: buf.append(ln)
    if cur is not None: bl[cur]="\n".join(buf)
    _C[binp]=bl; return bl

def demangle(s):
    return subprocess.run(["c++filt"],input=s,capture_output=True,text=True).stdout.strip()

def body_for(mangled, binl):
    binp = {"lithium":LITH,"particles":PART}.get(binl,OZONE)
    bl=blocks(binp)
    if mangled in bl: return bl[mangled]
    alt=mangled[1:] if mangled.startswith("_") else "_"+mangled
    return bl.get(alt)

def section_decodable(name,b):
    out=["#### Decompiled code (ground truth)",""]
    kind=b['kind'].rstrip('.')
    out.append(f"Verbatim ARM64 disassembly from the user's licensed FCP install "
               f"(`{LABEL[b['binary']]}`, class `{b['class']}`). `{b['method']}` — {kind}. "
               f"The actual code Apple ships, not a paraphrase. Regenerate: "
               f"`venv/bin/python3 tools/re/disasm_component.py --method {b['method']} {b['class']}`\n")
    body=body_for(b["mangled"],b["binary"])
    if not body:
        out.append(f"> (method `{demangle(b['mangled'])}` is in the symbol table; run the regenerate command to print it.)")
        return "\n".join(out)+"\n"
    out.append(f"##### `{demangle(b['mangled'])}`")
    out.append("```asm"); out.append(body.rstrip()); out.append("```\n")
    for extra in b.get("extra_mangled",[]):
        eb=body_for(extra,b["binary"])
        if eb:
            out.append(f"##### `{demangle(extra)}`  (sibling shape generator)")
            out.append("```asm"); out.append(eb.rstrip()); out.append("```\n")
    if b.get("shader_note"):
        out.append(b["shader_note"])
    return "\n".join(out).rstrip()+"\n"

def section_nondec(name):
    out=["#### Decompiled code (ground truth)",""]
    out.append("No single decodable CPU method: "+CB["nondecodable"][name]+".")
    return "\n".join(out)+"\n"

MARK="#### Decompiled code (ground truth)"
def main():
    txt=open(DOC).read()
    n=0
    # map ### headings whose leading token matches a component name
    def splice(name, sec):
        nonlocal txt
        # heading like "### Camera  ·  ..." — match name as the first word(s) after ###
        pat=re.compile(r"(^###\s+"+re.escape(name)+r"\b.*$)",re.M)
        m=pat.search(txt)
        if not m: return False
        start=m.start()
        nxt=re.search(r"^###\s+",txt[m.end():],re.M)
        end=m.end()+nxt.start() if nxt else len(txt)
        body=txt[start:end]
        body=re.sub(r"\n#### Decompiled code \(ground truth\).*?(?=\Z)","\n",body,flags=re.S).rstrip()+"\n"
        body=body.rstrip()+"\n\n"+sec+"\n"
        txt=txt[:start]+body+txt[end:]
        return True
    for name,b in CB["decodable"].items():
        if splice(name, section_decodable(name,b)): n+=1
        else: print("heading not found (decodable):",name)
    for name in CB["nondecodable"]:
        if splice(name, section_nondec(name)): n+=1
        else: print("heading not found (nondec):",name)
    open(DOC,"w").write(txt)
    print(f"injected decompiled subsection into {n} component types")

if __name__=="__main__":
    main()
