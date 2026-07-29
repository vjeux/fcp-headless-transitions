#!/usr/bin/env python3
"""callgraph.py — build the intra-framework static call graph from the cached otool -tV dumps and
compute a LEAF-FIRST implementability order, so workers are only ever handed a function they can
FULLY implement (all internal callees already real), instead of being forced to throw-stub.

Data source: /tmp/<FW>_tV.txt (otool -tV). Each function is a label line `__ZN...:` followed by
instruction lines. A `callq/jmp __ZN...` with a mangled operand = an INTERNAL edge (same framework).
A `## symbol stub for:` line = an EXTERN boundary (other framework / ObjC / libc) — a LEGITIMATE
throw-stub, does NOT block implementability. A `callq *reg`/`*off(reg)` = a VIRTUAL/indirect call —
also a legitimate boundary (dispatched at runtime), does NOT block.

  callgraph.py build <FW>              parse dump -> /tmp/<FW>_callgraph.json  {sym: {calls:[...], ncalls, nextern, nindirect}}
  callgraph.py ready <FW> [N]          list up to N functions whose EVERY internal callee is already ported (implementable NOW)
  callgraph.py stats <FW>              histogram: leaves / ready / blocked / by internal-fanout
  callgraph.py deps <FW> <mangled>     show one function's internal callees + their ported/stub/todo status
"""
import sys, os, re, json, glob

TV = "/tmp/{fw}_tV.txt"
LED = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ledger")
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "src")

LABEL = re.compile(r'^(__Z[A-Za-z0-9_$.]+):$')
# a direct call/jmp to a named internal symbol: "callq\t__ZN..."  (operand starts with __Z, before any ##)
DIRECT = re.compile(r'\t(?:callq|jmp)\t(__Z[A-Za-z0-9_$.]+)\b')
STUB   = re.compile(r'symbol stub for:')
INDIR  = re.compile(r'\t(?:callq|jmp)\t\*')

def build(fw):
    path = TV.format(fw=fw)
    if not os.path.exists(path): print(f"no dump {path}"); return {}
    g = {}
    cur = None
    with open(path, errors="replace") as f:
        for line in f:
            m = LABEL.match(line)
            if m:
                cur = m.group(1); g[cur] = {"calls": set(), "nextern": 0, "nindirect": 0}
                continue
            if cur is None: continue
            if STUB.search(line):
                g[cur]["nextern"] += 1; continue
            if INDIR.search(line):
                g[cur]["nindirect"] += 1; continue
            dm = DIRECT.search(line)
            if dm:
                tgt = dm.group(1)
                # a "## symbol stub for" line also matches DIRECT-ish? no: stub lines have callq 0xADDR, not __Z.
                if tgt != cur: g[cur]["calls"].add(tgt)
    out = {k: {"calls": sorted(v["calls"]), "ncalls": len(v["calls"]),
               "nextern": v["nextern"], "nindirect": v["nindirect"]} for k,v in g.items()}
    op = f"/tmp/{fw}_callgraph.json"; json.dump(out, open(op,"w"))
    print(f"built {fw}: {len(out)} functions, "
          f"{sum(v['ncalls'] for v in out.values())} internal edges, "
          f"{sum(1 for v in out.values() if v['ncalls']==0)} true leaves (0 internal calls) -> {op}")
    return out

def load_cg(fw):
    p=f"/tmp/{fw}_callgraph.json"
    if not os.path.exists(p): return build(fw)
    return json.load(open(p))

def ported_mangled(fw):
    """mangled symbols whose body is REAL (ported), from the ledger status (kept fresh by mark_ported)."""
    lp=os.path.join(LED,f"{fw}.ledger.json")
    real=set()
    if not os.path.exists(lp): return real
    led=json.load(open(lp))
    for cls,ms in led.items():
        if not isinstance(ms,dict): continue
        for k,v in ms.items():
            if isinstance(v,dict) and v.get("status")=="ported" and v.get("mangled"):
                real.add(v["mangled"])
    return real

def all_known_mangled(fw):
    lp=os.path.join(LED,f"{fw}.ledger.json"); m={}
    if not os.path.exists(lp): return m
    led=json.load(open(lp))
    for cls,ms in led.items():
        if not isinstance(ms,dict): continue
        for k,v in ms.items():
            if isinstance(v,dict) and v.get("mangled"): m[v["mangled"]]=(cls,v.get("status","?"),v.get("demangled",""))
    return m

def ready(fw, N=40):
    cg=load_cg(fw); real=ported_mangled(fw); known=all_known_mangled(fw)
    rows=[]
    for sym,info in cg.items():
        meta=known.get(sym)
        if not meta: continue                      # not a ledger method (thunk/anon) — skip
        cls,status,dem=meta
        if status=="ported": continue              # already real
        # internal callees that are IN this framework's ledger AND not yet ported = blockers
        blockers=[c for c in info["calls"] if c in known and known[c][1]!="ported"]
        if blockers: continue                      # can't implement yet
        # ready: every internal callee is already real (or extern/virtual/leaf)
        rows.append((info["ncalls"], info["nextern"]+info["nindirect"], sym, cls, dem))
    rows.sort()                                    # fewest internal calls first (true leaves lead)
    print(f"# {fw}: {len(rows)} functions implementable NOW (all internal deps ported). top {min(N,len(rows))}:")
    for ncalls,nbound,sym,cls,dem in rows[:N]:
        print(f"  [{ncalls} int-calls, {nbound} extern/virt] {cls}\t{dem[:80]}")
    return rows

def stats(fw):
    cg=load_cg(fw); real=ported_mangled(fw); known=all_known_mangled(fw)
    leaves=readyc=blocked=already=0
    for sym,info in cg.items():
        if sym not in known: continue
        if known[sym][1]=="ported": already+=1; continue
        if info["ncalls"]==0: leaves+=1
        blockers=[c for c in info["calls"] if c in known and known[c][1]!="ported"]
        if blockers: blocked+=1
        else: readyc+=1
    print(f"{fw}: ledger-methods-in-graph={sum(1 for s in cg if s in known)}  already_ported={already}")
    print(f"  true leaves (0 internal calls, unported) = {leaves}")
    print(f"  IMPLEMENTABLE NOW (all int-deps ported)   = {readyc}")
    print(f"  blocked (>=1 unported internal callee)     = {blocked}")

def deps(fw, sym):
    cg=load_cg(fw); known=all_known_mangled(fw)
    info=cg.get(sym)
    if not info: print(f"no graph node for {sym}"); return
    print(f"{sym}: {info['ncalls']} internal, {info['nextern']} extern-stub, {info['nindirect']} indirect")
    for c in info["calls"]:
        if c in known: cls,st,dem=known[c]; print(f"  [{st:7}] {dem[:80]}")
        else: print(f"  [extern ] {c}")

if __name__=="__main__":
    if len(sys.argv)<3: print(__doc__); sys.exit(0)
    cmd,fw=sys.argv[1],sys.argv[2]
    if cmd=="build": build(fw)
    elif cmd=="ready": ready(fw, int(sys.argv[3]) if len(sys.argv)>3 else 40)
    elif cmd=="stats": stats(fw)
    elif cmd=="deps": deps(fw, sys.argv[3])
    else: print(__doc__)
