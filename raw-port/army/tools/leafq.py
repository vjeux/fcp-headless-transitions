#!/usr/bin/env python3
"""leafq.py — dependency-ordered, LEAF-FIRST function dispenser for the raw-port swarm.

The problem this fixes: the swarm optimized for classes-touched, not functions-implemented. Workers
ported trivial ctor/dtor/layout and throw-stubbed every hard body, and nothing ever came back to
fill the stubs — because you cannot write a correct body while its callees still throw. Result:
most files just throw.

leafq serves work by IMPLEMENTABILITY, computed from the static call graph (army/graph/<FW>.callgraph.json,
built by callgraph.py). A function is READY when every one of its internal callees is already `ported`
in the ledger. Externs (`symbol stub for:`) and indirect/virtual (`callq *`) calls are legitimate
boundary stubs, NOT blockers. As leaves get implemented, their callers become ready — a topological
wavefront that drains the whole graph with NO permanent stubs.

Crucially it is STATUS-DRIVEN, not file-existence-driven: a function stays claimable until its
ledger status is actually `ported` (real body). Filling a stub later is a first-class queue item.

State lives in the CANONICAL main worktree (shared by all git worktrees) via claim.py's resolver.

Commands:
  leafq.py ready <FW> [N]              list up to N implementable-now functions (fewest lines first)
  leafq.py next <FW>                   atomically CLAIM + print the next implementable function (TSV)
  leafq.py deps <FW> <mangled>         show a function's internal callees + each one's ledger status
  leafq.py done <FW> <mangled>         mark claimed function done (worker calls after gate+merge)
  leafq.py fail <FW> <mangled> <why>   release (defer) a claim — stays claimable, never deleted
  leafq.py stats [FW]                  wavefront summary (ready / blocked-by-N / ported) per framework
"""
import sys, os, json, time, glob, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# reuse claim.py's canonical-repo resolution so state is the ONE shared copy, not a worktree snapshot
def _canonical_repo():
    here = os.path.dirname(os.path.abspath(__file__))
    repo = os.path.dirname(os.path.dirname(here))
    try:
        cg = subprocess.run(["git","-C",repo,"rev-parse","--git-common-dir"],
                            capture_output=True,text=True,timeout=5).stdout.strip()
        if cg:
            if not os.path.isabs(cg): cg = os.path.join(repo, cg)
            main = os.path.dirname(os.path.abspath(cg))
            if os.path.isdir(os.path.join(main,"raw-port","army","swarm")): return main
    except Exception: pass
    return repo

CANON = _canonical_repo()

# --- DISPATCH_ONLY guard (anti-cheat): never serve a function whose real work IS its callees ---
# The 7385eb01 root cause: leafq classified virtual/vtable dispatch as an allowed "boundary", so a
# function whose ENTIRE body is unimplemented dispatch (callees==[], ext==0, ind>=1, no compute)
# qualified as an implementable leaf. Porting it can only produce a shell. We refuse to dispense it.
_VERIFIER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "verifier")
sys.path.insert(0, os.path.abspath(_VERIFIER))
try:
    from classify_disasm import classify as _classify_disasm
except Exception:
    _classify_disasm = None
_DISASM_SH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "disasm.sh")
_DISPATCH_CACHE = {}

def _is_dispatch_only(fw, sym, info):
    """True if this function is a pure vtable/dispatch shell (no transcribable work of its own).
    Fast pre-filter on callgraph fields, then confirm with the disasm classifier when available."""
    # cheap structural pre-filter: no internal callees, no external named calls, but has indirect
    # dispatch, and a small body -> strong DISPATCH_ONLY candidate.
    if not (not info.get("callees") and info.get("ext", 0) == 0 and info.get("ind", 0) >= 1):
        return False
    if sym in _DISPATCH_CACHE:
        return _DISPATCH_CACHE[sym]
    if _classify_disasm is None:
        # can't classify -> be safe and treat the structural candidate as dispatch-only (skip it).
        _DISPATCH_CACHE[sym] = True
        return True
    # re-derive the disasm on demand (adversarial, do not trust a saved .s), then classify.
    verdict = False
    try:
        safe = re.sub(r"[^A-Za-z0-9_]", "", sym)
        pfx = "" if fw == "Ozone" else fw + "."
        dpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "re", "disasm",
                             f"{pfx}{safe}.s")
        if not (os.path.exists(dpath) and os.path.getsize(dpath) > 0):
            subprocess.run(["bash", _DISASM_SH, "--sym", sym, fw],
                           capture_output=True, text=True, timeout=120)
        if os.path.exists(dpath) and os.path.getsize(dpath) > 0:
            verdict = _classify_disasm(dpath)["class"] == "DISPATCH_ONLY"
        else:
            verdict = True  # structural candidate + no disasm -> refuse to dispense (safe)
    except Exception:
        verdict = True
    _DISPATCH_CACHE[sym] = verdict
    return verdict

GRAPH = os.path.join(CANON, "raw-port", "army", "graph")
LED   = os.path.join(CANON, "raw-port", "army", "ledger")
CLAIMS= os.path.join(CANON, "raw-port", "army", "swarm", "leaf_claims.json")
LOCK  = os.path.join(CANON, "raw-port", "army", "swarm", ".leafq.lock.d")
FWS   = ["ProCore","ProChannel","Helium","Ozone","Flexo"]

def _lock():
    for _ in range(600):
        try: os.mkdir(LOCK); return
        except FileExistsError: time.sleep(0.5)
def _unlock():
    try: os.rmdir(LOCK)
    except FileNotFoundError: pass
def _load():
    try: return json.load(open(CLAIMS))
    except Exception: return {"claimed":{}, "done":{}, "deferred":{}}
def _save(c):
    os.makedirs(os.path.dirname(CLAIMS), exist_ok=True)
    tmp=CLAIMS+".tmp"; json.dump(c, open(tmp,"w")); os.replace(tmp, CLAIMS)

def _graph(fw):
    p=os.path.join(GRAPH, f"{fw}.callgraph.json")
    if not os.path.exists(p): return {}
    return json.load(open(p))

def _ledger_index(fw):
    """mangled -> (cls, methkey, status, demangled, addr)."""
    lp=os.path.join(LED, f"{fw}.ledger.json"); idx={}
    if not os.path.exists(lp): return idx
    for cls,ms in json.load(open(lp)).items():
        if not isinstance(ms,dict): continue
        for k,v in ms.items():
            if isinstance(v,dict) and v.get("mangled"):
                idx[v["mangled"]]=(cls,k,v.get("status","todo"),v.get("demangled",""),v.get("addr",""))
    return idx

def _ported_all():
    done=set()
    for f in glob.glob(os.path.join(LED,"*.ledger.json")):
        if os.path.basename(f).startswith("shaders"): continue
        try: led=json.load(open(f))
        except Exception: continue
        for cls,ms in led.items():
            if not isinstance(ms,dict): continue
            for k,v in ms.items():
                if isinstance(v,dict) and v.get("status")=="ported" and v.get("mangled"):
                    done.add(v["mangled"])
    return done

SHARED = {'OZSpline','OZInterpolators','OZInterpolator','OZBezierInterpolator','OZCardinalInterpolator',
          'OZCurve','OZChannelInfo','PCSingleton','OZSplineState','PCString','OZCurveRuntime','HGRect'}

def _ready_rows(fw, min_lines=0):
    g=_graph(fw); idx=_ledger_index(fw); done=_ported_all()
    c=_load(); deferred=set(c.get("deferred",{}))
    rows=[]
    for sym,info in g.items():
        meta=idx.get(sym)
        if not meta: continue                       # not a ledger method (thunk/anon) — skip
        cls,mk,status,dem,addr=meta
        if status=="ported": continue               # already real
        if cls in SHARED: continue                  # hand-serialized dispatch files — never auto-serve
        if sym in deferred: continue                # a worker gave up this pass — try later
        if "non-virtual thunk to" in dem or "virtual thunk to" in dem: continue  # ABI thunk, not a body
        if info.get("lines",0) < min_lines: continue  # --min: skip trivial dtors/getters, target real logic
        blockers=[c2 for c2 in info.get("callees",[]) if c2 not in done]
        if blockers: continue                       # not implementable yet
        if _is_dispatch_only(fw, sym, info): continue  # 7385eb01 shape — real work IS callees, not a leaf
        rows.append((info.get("lines",0), info.get("ext",0), info.get("ind",0), sym, cls, dem, addr))
    rows.sort()                                     # smallest body first = truest leaves lead
    return rows

def cmd_ready(fw=None, N=40, min_lines=0):
    fws = [fw] if fw else FWS
    allrows=[]
    for f in fws:
        for lines,ext,ind,sym,cls,dem,addr in _ready_rows(f, min_lines):
            allrows.append((lines,ext,ind,sym,cls,dem,addr,f))
    allrows.sort(key=lambda r:(r[0], r[7], r[3]))   # smallest body first, then fw, then sym
    print(f"# {'+'.join(fws)}: {len(allrows)} functions implementable NOW (all internal callees ported"
          f"{', min '+str(min_lines)+'L' if min_lines else ''}). top {min(N,len(allrows))}:")
    for lines,ext,ind,sym,cls,dem,addr,f in allrows[:N]:
        print(f"  {f}\t{addr}  [{lines}L ext={ext} ind={ind}]  {cls}::{dem[:66]}")

def cmd_next(fw=None, min_lines=0):
    _lock()
    try:
        c=_load(); skip=set(c["claimed"])|set(c["done"])
        fws = [fw] if fw else FWS
        cands=[]
        for f in fws:
            for lines,ext,ind,sym,cls,dem,addr in _ready_rows(f, min_lines):
                if sym in skip: continue
                cands.append((lines, ext, ind, sym, cls, dem, addr, f))
                break   # rows already sorted smallest-first; first unclaimed of this fw is its best
        if not cands:
            print("EMPTY"); return
        cands.sort(key=lambda r:(r[0], r[7], r[3]))     # globally smallest across frameworks
        lines,ext,ind,sym,cls,dem,addr,f = cands[0]
        c["claimed"][sym]={"fw":f,"cls":cls,"addr":addr,"dem":dem,"lines":lines,"t":time.time()}
        _save(c)
        print(f"{f}\t{cls}\t{addr}\t{sym}\t{dem}")
    finally: _unlock()

def cmd_deps(fw, sym):
    g=_graph(fw); idx=_ledger_index(fw); done=_ported_all()
    info=g.get(sym)
    if not info: print(f"no graph node {sym}"); return
    print(f"{sym}  ({info.get('lines',0)}L, ext={info.get('ext',0)}, ind={info.get('ind',0)})")
    for c in info.get("callees",[]):
        st = "ported" if c in done else (idx[c][2] if c in idx else "extern?")
        dem = idx[c][3] if c in idx else c
        print(f"  [{st:8}] {dem[:78]}")

def cmd_done(fw, sym):
    _lock()
    try:
        c=_load(); c["done"][sym]={"fw":fw,"t":time.time()}; c["claimed"].pop(sym,None); c["deferred"].pop(sym,None); _save(c)
        print(f"done {fw} {sym}")
    finally: _unlock()

def cmd_fail(fw, sym, why="n/a"):
    _lock()
    try:
        c=_load(); c["deferred"][sym]={"fw":fw,"why":why,"t":time.time()}; c["claimed"].pop(sym,None); _save(c)
        print(f"deferred {fw} {sym} (still claimable): {why}")
    finally: _unlock()

def cmd_stats(fw=None):
    for f in ([fw] if fw else FWS):
        rows=_ready_rows(f)
        g=_graph(f); done=_ported_all(); idx=_ledger_index(f)
        ported=sum(1 for s in g if s in done)
        print(f"{f}: implementable_now={len(rows)}  ported={ported}  graph_fns={len(g)}")

if __name__=="__main__":
    a=sys.argv[1:]
    if not a: print(__doc__); sys.exit(0)
    cmd=a[0]; rest=a[1:]
    # optional --min N (target substantive bodies, skipping trivial dtors/getters)
    minl=0
    if "--min" in rest:
        i=rest.index("--min"); minl=int(rest[i+1]); del rest[i:i+2]
    if   cmd=="next":  cmd_next(rest[0] if rest and not rest[0].isdigit() else None, minl)
    elif cmd=="ready":
        fw = rest[0] if rest and not rest[0].isdigit() else None
        nums = [int(x) for x in rest if x.isdigit()]
        cmd_ready(fw, nums[0] if nums else 40, minl)
    elif cmd=="deps":  cmd_deps(rest[0], rest[1])
    elif cmd=="done":  cmd_done(rest[0], rest[1])
    elif cmd=="fail":  cmd_fail(rest[0], rest[1], " ".join(rest[2:]) or "n/a")
    elif cmd=="stats": cmd_stats(rest[0] if rest else None)
    else: print(__doc__)
