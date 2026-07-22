#!/usr/bin/env python3
"""tools/re/disasm_pae.py — extract the VERBATIM ARM64 disassembly of a PAE
filter class's render pipeline out of FCP's Filters Mach-O.

This is the CPU-side ground truth that complements extract_shader.py (the GPU
per-pixel math). It prints, verbatim from `otool -arch arm64 -tV`:
  * the class's canThrowRenderOutput: (or *Render*/frameSetup:) method body, which
    is where UI parameters are read (getFloatValue:fromParm: / getColorValue: /
    mixAmountAtTime:) and pushed into the Helium primitive / Hgc* shader
    (SetParameter(slot, ...) via the primitive vtable), and
  * every Hgc* shader and HG* Helium primitive the class constructs.

Nothing here is invented: it is the exact machine code Apple shipped, disassembled.
Pair with extract_shader.py <Hgc...> for the matching per-pixel source.

Usage:
  disasm_pae.py PAEColorize                 # full render + frameSetup + ctors
  disasm_pae.py --method canThrow PAEBloom  # one method only
  disasm_pae.py --wiring PAEColorize        # decoded param->slot event list
"""
import sys, re, subprocess, os

BIN = ("/Applications/Final Cut Pro.app/Contents/PlugIns/InternalFiltersXPC.pluginkit/"
       "Contents/PlugIns/Filters.bundle/Contents/MacOS/Filters")

def _disasm():
    return subprocess.run(["otool","-arch","arm64","-tV",BIN],
                          capture_output=True,text=True).stdout

def blocks(disasm):
    out={}; cur=None; buf=[]
    for ln in disasm.split("\n"):
        if ln and not ln[0].isspace() and ln.rstrip().endswith(":") and "\t" not in ln:
            if cur is not None: out[cur]="\n".join(buf)
            cur=ln.rstrip()[:-1]; buf=[]
        else:
            buf.append(ln)
    if cur is not None: out[cur]="\n".join(buf)
    return out

def class_of(sym):
    m=re.match(r"[-+]\[(PAE[A-Za-z0-9_]+)\s",sym); return m.group(1) if m else None

def methods_for(bl, cls):
    return {s:b for s,b in bl.items() if class_of(s)==cls}

# render-relevant methods, in the order we print them
ORDER = ["canThrowRenderOutput","Render","frameSetup","dynamicProperties","addParameters"]

def wiring(body):
    """Decode the param->slot event stream from a render method body (verbatim-derived)."""
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

def main(argv):
    if not argv or argv[0] in ("-h","--help"): print(__doc__); return
    only=None; want_wiring=False; args=[]
    i=0
    while i<len(argv):
        a=argv[i]
        if a=="--method": only=argv[i+1]; i+=2; continue
        if a=="--wiring": want_wiring=True; i+=1; continue
        args.append(a); i+=1
    bl=blocks(_disasm())
    for cls in args:
        ms=methods_for(bl,cls)
        if not ms:
            print(f"===== {cls} ===== (class not found)\n"); continue
        if want_wiring:
            rm=[s for s in ms if "canThrowRenderOutput" in s] or [s for s in ms if "Render" in s]
            print(f"===== {cls} param->slot wiring (decoded from disasm) =====")
            for s in rm:
                print(s)
                for e in wiring(ms[s]): print("   ", e)
            print(); continue
        printed=set()
        for key in ([only] if only else ORDER):
            for s,b in ms.items():
                if key in s and s not in printed:
                    printed.add(s)
                    print(f"----- {s} -----"); print(b); print()
        # constructors of Hgc/HG referenced
        ctors=set()
        for b in ms.values():
            for m in re.finditer(r"__ZN\d+((?:Hgc|H)[A-Za-z0-9_]+)C[12]E",b):
                ctors.add(m.group(1))
        if ctors:
            print(f"# {cls} constructs: "+", ".join(sorted(ctors)))
        print()

if __name__=="__main__":
    main(sys.argv[1:])
