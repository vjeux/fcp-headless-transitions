#!/usr/bin/env python3
# audit_ports.py — continuous SEMANTIC reviewer for the raw-port army.
# The mechanical gate (G1 regex provenance + G2 tsc + G4 oracle) proves a file COMPILES, cites
# @0xADDR, and doesn't regress oracle nodes. It CANNOT tell whether a cited address actually contains
# what the agent claims, or whether "transcribed" math secretly diverges. This tool gathers the
# evidence a reviewer agent needs to catch that class of cheat.
#
# Usage:
#   python3 audit_ports.py since <git-ref>     # list ported src files touched since <ref>
#   python3 audit_ports.py bundle <src.ts>     # emit a review bundle: TS + every cited @0xADDR's disasm
#   python3 audit_ports.py queue               # files landed on main not yet in the audit ledger
#
# It does NOT judge — it produces the material for the reviewer agent to judge, and tracks verdicts.
import sys, os, re, subprocess, json, hashlib

REPO = subprocess.run(["git","rev-parse","--show-toplevel"],capture_output=True,text=True,
                      cwd=os.path.dirname(os.path.abspath(__file__))).stdout.strip()
LEDGER = os.path.join(REPO, "raw-port/army/audit/audit_ledger.json")
FW_BIN = {
 "ProChannel":"/Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel",
 "ProCore":"/Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore",
 "Ozone":"/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone",
 "Flexo":"/Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo",
 "Helium":"/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium",
}

def sh(*a, **k):
    return subprocess.run(a, capture_output=True, text=True, cwd=REPO, **k).stdout

def load_ledger():
    if os.path.exists(LEDGER): return json.load(open(LEDGER))
    return {}

def save_ledger(d):
    os.makedirs(os.path.dirname(LEDGER), exist_ok=True)
    json.dump(d, open(LEDGER,"w"), indent=2)

# addr + framework citation patterns from the doc-comments, e.g. "@ProChannel 0x44ec8", "@0x407e6", "@Ozone 0x62a3c0"
CITE = re.compile(r'@(ProChannel|ProCore|Ozone|Flexo|Helium)?\s*(0x[0-9a-fA-F]{3,})')

def disasm_at(fw, addr, nbytes=0x140):
    """Objdump a window at a VA in the framework's __text (best-effort; the addr is a file/VA offset)."""
    binpath = FW_BIN.get(fw)
    if not binpath or not os.path.exists(binpath): return f"(no binary for {fw})"
    a = int(addr,16)
    # otool -tV over the whole text is cached in /tmp by disasm.sh; grep a window around the addr.
    dis = f"/tmp/{fw}_tV.txt"
    if not os.path.exists(dis):
        subprocess.run(["bash","-c",f'otool -tV -arch x86_64 "{binpath}" > "{dis}"'])
    # find the line whose leading hex == addr (otool prints 16-digit zero-padded VA)
    key = f"{a:016x}"
    out=[]; grab=False; n=0
    for line in open(dis, errors="ignore"):
        lead = line.strip().split("\t",1)[0].strip()
        if not grab and lead.lower()==key.lower(): grab=True
        if grab:
            out.append(line.rstrip()); n+=1
            if n>60: break
    return "\n".join(out) if out else f"(addr {addr} not found at line-start in {fw} __text — may be a data/const or inlined addr)"

def cmd_since(ref):
    files = sh("git","diff","--name-only",ref,"HEAD","--","raw-port/src/**/*.ts").splitlines()
    for f in files:
        if f.strip(): print(f.strip())

def cmd_queue():
    led = load_ledger()
    # all ported src files on main
    files = sh("git","ls-files","raw-port/src").splitlines()
    files = [f for f in files if f.endswith(".ts")]
    for f in files:
        h = sh("git","log","-1","--format=%H","--",f).strip()
        rec = led.get(f)
        if not rec or rec.get("reviewed_sha")!=h:
            print(f)

def cmd_bundle(src):
    full = os.path.join(REPO, src)
    if not os.path.exists(full):
        print(f"NO SUCH FILE: {src}"); return
    ts = open(full).read()
    print("="*80); print(f"REVIEW BUNDLE: {src}"); print("="*80)
    print(f"\n----- TS SOURCE ({ts.count(chr(10))+1} lines) -----\n")
    print(ts)
    # collect cited addresses. If a citation carries an explicit @Framework token, use it.
    # Otherwise DO NOT blindly inherit the last-seen framework (that mislabels ProCore/Ozone imports
    # cited without a prefix) — mark it ambiguous and re-disassemble against ALL frameworks, showing
    # whichever actually has a function start at that address.
    cites=[]
    for m in CITE.finditer(ts):
        cites.append((m.group(1), m.group(2)))   # group(1) may be None = ambiguous
    seen=set(); uniq=[]
    for fw,a in cites:
        key=(fw,a)
        if key in seen: continue
        seen.add(key); uniq.append((fw,a))
    print(f"\n----- {len(uniq)} UNIQUE CITED ADDRESSES — RE-DISASSEMBLED FROM THE BINARY -----")
    print("(addresses cited WITHOUT an explicit @Framework are resolved against ALL frameworks)")
    for fw,a in uniq[:60]:
        if fw:
            print(f"\n########## @{fw} {a} ##########")
            print(disasm_at(fw,a))
        else:
            # ambiguous: try every framework, show the ones that have a real fn start there
            hits=[]
            for cand in FW_BIN:
                d=disasm_at(cand,a)
                if not d.startswith("(addr") and not d.startswith("(no binary"):
                    hits.append((cand,d))
            if hits:
                for cand,d in hits:
                    print(f"\n########## @{cand} {a}  (framework inferred — no explicit @FW in citation) ##########")
                    print(d)
            else:
                print(f"\n########## @??? {a}  (no fn start at this addr in ANY framework — data const, inlined, or bogus) ##########")

def cmd_verdict(src, verdict, note):
    led = load_ledger()
    h = sh("git","log","-1","--format=%H","--",src).strip()
    led[src] = {"reviewed_sha":h, "verdict":verdict, "note":note}
    save_ledger(led)
    print(f"recorded {verdict} for {src} @ {h[:8]}")

if __name__=="__main__":
    if len(sys.argv)<2: print(__doc__); sys.exit(1)
    c=sys.argv[1]
    if c=="since": cmd_since(sys.argv[2])
    elif c=="queue": cmd_queue()
    elif c=="bundle": cmd_bundle(sys.argv[2])
    elif c=="verdict": cmd_verdict(sys.argv[2], sys.argv[3], " ".join(sys.argv[4:]))
    else: print(__doc__)
