#!/usr/bin/env python3
"""tools/re/gen_decompiled_docs.py — write the VERBATIM decompiled code into each
filter doc's "Decompiled code (ground truth)" section.

For every one of the 141 corpus filters this embeds, INLINE and verbatim:
  1. the extracted Metal fragment shader(s) that carry the per-pixel math
     (extract_shader.py), and
  2. the ARM64 disassembly of the PAE render method's parameter-wiring window
     (otool -arch arm64 -tV on -[PAE<Name> canThrowRenderOutput:...]) — the CPU
     code that reads each UI parameter (getFloatValue:fromParm: / getColorValue:
     / mixAmountAtTime:) and pushes it into the shader's hg_Params[] slots via the
     Helium primitive's SetParameter vtable call, plus
  3. a parameter→slot table DECODED FROM (2), not invented.

Nothing is paraphrased or guessed: the code shown is exactly what Apple shipped in
the user's licensed Final Cut Pro install, disassembled/extracted for building an
interoperable renderer. Filters with no decompilable Apple code (3rd-party plugins,
Keynote-style ·KF template presets, CIFilter wrappers, structural/OSC nodes) say so
honestly and show what evidence does exist.

Regenerate with:  venv/bin/python3 tools/re/gen_decompiled_docs.py
Reads tools/re/filter_binding.json (the PAE-class / shader / primitive bindings,
themselves produced from disasm by the session that built this tool).
"""
import os, re, json, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
DOCDIR = os.path.join(REPO, "docs", "filters")
SHDIR = os.path.join(REPO, "engine", "src", "compositor", "filters", "evidence", "shaders")
BINDING = json.load(open(os.path.join(HERE, "filter_binding.json")))

FBIN = ("/Applications/Final Cut Pro.app/Contents/PlugIns/InternalFiltersXPC.pluginkit/"
        "Contents/PlugIns/Filters.bundle/Contents/MacOS/Filters")

_DIS = None
def disasm_blocks():
    global _DIS
    if _DIS is not None: return _DIS
    txt = subprocess.run(["otool","-arch","arm64","-tV",FBIN],capture_output=True,text=True).stdout
    bl={}; cur=None; buf=[]
    for ln in txt.split("\n"):
        if ln and not ln[0].isspace() and ln.rstrip().endswith(":") and "\t" not in ln:
            if cur is not None: bl[cur]="\n".join(buf)
            cur=ln.rstrip()[:-1]; buf=[]
        else: buf.append(ln)
    if cur is not None: bl[cur]="\n".join(buf)
    _DIS=bl; return bl

def class_of(sym):
    m=re.match(r"[-+]\[(PAE[A-Za-z0-9_]+)\s",sym); return m.group(1) if m else None

def render_body(cls):
    bl=disasm_blocks()
    ms={s:b for s,b in bl.items() if class_of(s)==cls}
    for key in ("canThrowRenderOutput",):
        for s,b in ms.items():
            if key in s: return s,b
    for s,b in ms.items():
        if "Render:" in s and "canThrow" not in s: return s,b
    for s,b in ms.items():
        if "frameSetup" in s: return s,b
    return None,None

def wiring_window(body):
    lines=body.split("\n")
    getters=("getFloatValue","getIntValue","getColor","getRedValue","getBoolValue",
             "getXValue","mixAmount","ParmValue")
    start=None
    for i,ln in enumerate(lines):
        if any(g in ln for g in getters) or re.search(r"__ZN\d+(Hgc|H)[A-Za-z0-9_]+C[12]E",ln):
            start=i; break
    if start is None: return None
    end=start
    for i,ln in enumerate(lines):
        if any(k in ln for k in ("SetParameter","setHeliumRef","SetInput","setInput")):
            end=i
    return "\n".join(lines[max(0,start-1):min(len(lines),end+2)])

def wiring_events(body):
    ev=[]; reg={}
    for ln in body.split("\n"):
        m=re.search(r"\bmov\s+w(\d+),\s+#(0x[0-9a-f]+|\d+)",ln)
        if m: reg["w"+m.group(1)]=int(m.group(2),0)
        m2=re.search(r"ldr\s+x8, \[x8, #(0x[0-9a-f]+)\]",ln)
        if m2: reg["vtslot"]=int(m2.group(1),0)
        for sel,tag,pr in [("getFloatValue:fromParm:","getFloat","w3"),
                           ("getIntValue:fromParm:","getInt","w3"),
                           ("getBoolValue:fromParm:","getBool","w3"),
                           ("getRedValue:greenValue:blueValue:fromParm:","getColor","w5"),
                           ("getXValue:yValue:fromParm:","getPoint","w4")]:
            if sel in ln: ev.append((tag,reg.get(pr)))
        if "mixAmountAtTime:" in ln: ev.append(("mixAmount",None))
        if re.search(r"\bblr\s+x8\b",ln):
            if reg.get("vtslot") in (0x58,0x60,0x68):
                ev.append(("SetParameter",reg.get("w1")))
            reg.pop("vtslot",None)
    return ev


def trace_slot_sources(cls):
    """Deterministically map each shader SetParameter(slot K) to its data source by
    dataflow: colour/point getters write to [sp,#off] out-pointers; float getters and
    mixAmountAtTime: return in d0 (often copied to a callee-saved dN); SetParameter
    then loads from those offsets/registers. Pure disasm dataflow — no guessing.
    Returns (sym, getters, slotmap)."""
    bl=disasm_blocks()
    ms={s:b for s,b in bl.items() if class_of(s)==cls}
    sym=body=None
    for key in ("canThrowRenderOutput",):
        for s2,b2 in ms.items():
            if key in s2: sym,body=s2,b2; break
        if sym: break
    if not body:
        for s2,b2 in ms.items():
            if "Render:" in s2 and "canThrow" not in s2: sym,body=s2,b2; break
    if not body: return None,[],[]
    lines=body.split("\n"); reg={}; off2src={}; getters=[]; pend=[]; last_ret=None; ret_reg={}
    for ln in lines:
        m=re.search(r"\bmov\s+w(\d+),\s+#(0x[0-9a-f]+|\d+)",ln)
        if m: reg["w"+m.group(1)]=int(m.group(2),0)
        mp=re.search(r"add\s+x[2-7], sp, #(0x[0-9a-f]+)",ln)
        if mp: pend.append(int(mp.group(1),0))
        if "getRedValue:greenValue:blueValue:fromParm:" in ln:
            lbl="parm%s (colour)"%reg.get("w5")
            for o in pend: off2src[o]=lbl
            getters.append(lbl); pend=[]; last_ret=None
        elif "getXValue:yValue:fromParm:" in ln:
            lbl="parm%s (point)"%(reg.get("w4") or reg.get("w5"))
            for o in pend: off2src[o]=lbl
            getters.append(lbl); pend=[]; last_ret=None
        elif "getFloatValue:fromParm:" in ln:
            last_ret="parm%s (float)"%reg.get("w3"); getters.append(last_ret)
            for o in pend: off2src[o]=last_ret
            pend=[]
        elif "getIntValue:fromParm:" in ln:
            last_ret="parm%s (int)"%reg.get("w3"); getters.append(last_ret)
            for o in pend: off2src[o]=last_ret
            pend=[]
        elif "getBoolValue:fromParm:" in ln:
            last_ret="parm%s (bool)"%reg.get("w3"); getters.append(last_ret)
            for o in pend: off2src[o]=last_ret
            pend=[]
        elif "mixAmountAtTime:" in ln:
            last_ret="host Mix"; getters.append(last_ret)
        # float return copied to callee-saved reg: mov.16b vN, v0  /  fmov dN,d0
        mo=re.search(r"mov\.16b\s+v(\d+), v0",ln)
        if mo and last_ret: ret_reg["d"+mo.group(1)]=last_ret
        ms_=re.search(r"str\s+d0, \[sp, #(0x[0-9a-f]+)\]",ln)
        if ms_ and last_ret: off2src[int(ms_.group(1),0)]=last_ret
    # pass 2: slot loads
    reg={}; offs=[]; regs=[]; slotmap=[]
    for ln in lines:
        m=re.search(r"\bmov\s+w(\d+),\s+#(0x[0-9a-f]+|\d+)",ln)
        if m: reg["w"+m.group(1)]=int(m.group(2),0)
        m2=re.search(r"ldr\s+x8, \[x8, #(0x[0-9a-f]+)\]",ln)
        if m2: reg["vtslot"]=int(m2.group(1),0)
        for mo in re.finditer(r"ld[rp]\s+[dsq]\d+(?:, [dsq]\d+)?, \[sp, #(0x[0-9a-f]+)\]",ln):
            offs.append(int(mo.group(1),0))
        for mo in re.finditer(r"fcvt\s+s\d+, (d\d+)",ln): regs.append(mo.group(1))
        for mo in re.finditer(r"fmov\s+s\d+, (d\d+)",ln): regs.append(mo.group(1))
        if re.search(r"\bblr\s+x8\b",ln) and reg.get("vtslot") in (0x58,0x60,0x68):
            srcs=[]
            for o in offs:
                if o in off2src: srcs.append(off2src[o])
            for r in regs:
                if r in ret_reg: srcs.append(ret_reg[r])
            seen=set(); srcs=[x for x in srcs if not (x in seen or seen.add(x))]
            slotmap.append((reg.get("w1"),srcs))
            offs=[]; regs=[]; reg.pop("vtslot",None)
    return sym, getters, slotmap


def read_shader(name):
    p=os.path.join(SHDIR,name+".metal")
    if not os.path.exists(p): return None
    txt=open(p).read().strip()
    txt=re.sub(r"^=====.*?=====\s*\n","",txt)
    return txt.strip()

# ================= section builders =================

def param_names_ordered(uuid):
    """Best-effort creative-param list for slot annotation (from doc_payload)."""
    return None  # slot names are annotated from the disasm evidence itself

def fmt_slotmap(cls):
    """Decoded parameter->shader-slot mapping, derived from the dataflow in the
    disassembly above (NOT invented): which UI parm feeds each SetParameter slot."""
    sym,getters,slotmap=trace_slot_sources(cls)
    if not slotmap and not getters: return None
    out=["Parameter -> shader-slot mapping, decoded from the dataflow above",
         "(parm N = the getter's fromParm: index; slot K = the primitive/shader",
         " SetParameter index that feeds hg_Params[K]):",""]
    if getters:
        out.append("  parameters read, in program order:")
        for g in getters: out.append("    - "+g)
        out.append("")
    if slotmap:
        out.append("  SetParameter slots (source decoded by stack/register dataflow):")
        for slot,srcs in slotmap:
            src=", ".join(srcs) if srcs else "(constant / computed)"
            out.append(f"    slot {slot}  <-  {src}")
    return "\n".join(out)

def section_shader(slug, b):
    cls=b["resolved_cls"]; shaders=b["final_shaders"]
    out=["## Decompiled code (ground truth)",""]
    out.append("The code below is **verbatim** from the user's licensed Final Cut Pro install — "
               "the embedded Metal shader source and the ARM64 disassembly of the plug-in class, "
               "extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple "
               "shipped, not a paraphrase. Implement against this.\n")
    # 1. shaders
    for sh in shaders:
        body=read_shader(sh)
        if not body: continue
        out.append(f"### Metal fragment shader — `{sh}`")
        out.append(f"Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py {sh}` "
                   f"→ [`{sh}.metal`](../../engine/src/compositor/filters/evidence/shaders/{sh}.metal)\n")
        out.append("```metal")
        out.append(body)
        out.append("```\n")
    # 2. CPU wiring disasm
    if cls:
        sym,rb=render_body(cls)
        if rb:
            win=wiring_window(rb)
            if win:
                out.append(f"### CPU parameter wiring — `{sym}`")
                out.append("How each UI parameter is read and pushed into the shader's `hg_Params[]` "
                           "slots. Regenerate: "
                           f"`venv/bin/python3 tools/re/disasm_pae.py {cls}`\n")
                out.append("```asm")
                out.append(win)
                out.append("```\n")
                tbl=fmt_slotmap(cls)
                if tbl:
                    out.append("```")
                    out.append(tbl)
                    out.append("```\n")
    return "\n".join(out).rstrip()+"\n"

def section_helium_cpu(slug, b):
    cls=b["resolved_cls"]; prims=b.get("prims",[])
    out=["## Decompiled code (ground truth)",""]
    out.append("This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done "
               "by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code "
               "below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of "
               "the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly "
               "which parameters are read and which primitive is constructed. Nothing is paraphrased.\n")
    if prims:
        out.append(f"**Helium primitive(s) constructed:** {', '.join('`'+p+'`' for p in prims)}. "
                   "The primitive's math lives in the Helium framework binary; disassemble it with "
                   "`otool -arch arm64 -tV \"…/Helium.framework/Versions/A/Helium\" | "
                   "grep -A400 '<primitive>'`.\n")
    if cls:
        sym,rb=render_body(cls)
        if rb:
            win=wiring_window(rb) or rb
            out.append(f"### CPU render method — `{sym}`")
            out.append(f"Regenerate: `venv/bin/python3 tools/re/disasm_pae.py {cls}`\n")
            out.append("```asm")
            out.append(win)
            out.append("```\n")
            tbl=fmt_slotmap(cls)
            if tbl:
                out.append("```"); out.append(tbl); out.append("```\n")
    return "\n".join(out).rstrip()+"\n"

NONRE_TEXT={
 "preset": ("This is a **Motion template preset** (a `· KF` / packaged template), not a filter "
            "class with its own compiled algorithm. There is no Apple per-pixel code to decompile — "
            "it is a composition of other primitives with saved keyframes. The decompilable pieces "
            "are whatever built-in filters/behaviors the preset instantiates (documented in their own "
            "pages)."),
 "cifilter": ("This filter is a thin **Core Image (`CIFilter`) wrapper**: the per-pixel math lives in "
              "Apple's private CoreImage kernels (`/System/Library/Frameworks/CoreImage.framework`), "
              "not in FCP's Filters binary, so there is no `Hgc*` shader to extract here. The FCP class "
              "only marshals parameters into the CI filter. To recover the exact kernel, dump the CI "
              "kernel source (e.g. `CIKernel`/`.cikernel` in CoreImage) for the named filter."),
 "3rdparty": ("This is a **third-party plug-in**, not an Apple filter — its code ships in the vendor's "
              "own bundle, so there is nothing in FCP's binaries to decompile. Reverse-engineer it from "
              "the vendor bundle if an interoperable implementation is needed."),
 "osc": ("This is an **on-screen-control helper** (drag handles / gizmo), not a render filter. It has "
         "no per-pixel algorithm to decompile — it only feeds geometry back into the real filter's "
         "parameters."),
 "dangling": ("This is a **dangling parser record** — a corpus artifact that does not correspond to a "
              "real registered plug-in class. There is no code to decompile."),
 "structural": ("This is a **structural/source node** (an image source, not a per-pixel filter). It has "
                "no filtering algorithm to decompile; it supplies pixels for downstream filters."),
}

def section_nonre(slug,b):
    cat=b["category"]
    out=["## Decompiled code (ground truth)",""]
    out.append(NONRE_TEXT.get(cat,"No Apple algorithm to decompile for this entry."))
    return "\n".join(out)+"\n"

def build_section(slug,b):
    if b["final_shaders"]:
        return section_shader(slug,b)
    if b["category"] in ("helium_cpu","helium_shader"):
        return section_helium_cpu(slug,b)
    return section_nonre(slug,b)

# ================= splice into docs =================
ALGO_HEADERS = ("## Ground-truth shader source",
                "## Algorithm — NOT YET REVERSE-ENGINEERED",
                "## Algorithm (decoded",
                "## Decompiled code (ground truth)",
                "## See also")

def splice(slug,b):
    p=os.path.join(DOCDIR,slug+".md")
    txt=open(p).read()
    # cut at the first algorithm-ish header
    cut=len(txt)
    for h in ALGO_HEADERS:
        i=txt.find("\n"+h)
        if i!=-1: cut=min(cut,i)
    head=txt[:cut].rstrip()+"\n\n"
    sec=build_section(slug,b)
    open(p,"w").write(head+sec)
    return len(sec)

def main():
    import sys
    only=sys.argv[1:] or list(BINDING.keys())
    n=0
    for slug in only:
        if slug not in BINDING: 
            print("skip (no binding):",slug); continue
        L=splice(slug,BINDING[slug]); n+=1
    print(f"rewrote {n} filter docs")

if __name__=="__main__":
    main()
