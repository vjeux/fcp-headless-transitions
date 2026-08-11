#!/usr/bin/env python3
"""depgraph.py — GLOBAL cross-framework dependency graph + STRICT topological work order.

The rule (vjeux 2026-07-29): a function is only dispensable once EVERY function it calls is already
ported. No unresolved dependency => no license to throw. Unlike a naive intra-framework call graph, extern
(cross-framework) calls are NOT a free pass — a `## symbol stub for: __ZN...` names a REAL target
symbol in another framework, and that target is a hard dependency too. So we build ONE graph across
ProCore/ProChannel/Helium/Ozone/Flexo and topologically order the whole thing.

Edge sources (per function label `__ZN...:` in /tmp/<FW>_tV.txt):
  - direct  : `callq/jmp __ZN...`                         -> edge to that global symbol
  - extern  : `... ## symbol stub for: __ZN...`           -> edge to that global symbol (cross-fw)
  - indirect: `callq/jmp *off(reg)`                       -> a VIRTUAL call. NOT statically named.
              We count these separately. A function with unresolved indirect calls is NOT a clean
              leaf; it is HELD in a separate `virtual-blocked` tier (never silently dispensed as
              "ready"), because its behaviour depends on a runtime target we haven't pinned. The
              vtable resolver (tools/vtable.py) can later turn specific slots into real edges.

A symbol is a KNOWN PORT TARGET if it appears in some framework's ledger (i.e. it's one of the
131K functions we intend to port). Edges to symbols NOT in any ledger (libc __Znwm/__ZdlPv, ObjC
_objc_*, pthread, CoreFoundation, etc.) are TRUE externs — outside our port scope — and do not block
(they are modelled as boundary stubs by policy, like the CGColorSpace externs already in-tree).

Commands:
  depgraph.py build                 parse all dumps -> depgraph/graph.json (sym -> {fw,deps,extern,indirect,status})
  depgraph.py order                 compute strict topo order -> depgraph/order.json (waves) + stats
  depgraph.py ready [N]             next N functions whose EVERY in-scope dependency is ported (+0 unresolved indirect)
  depgraph.py deps <mangled>        show a function's dependencies with each one's status
  depgraph.py stats                 tier histogram (ready / dep-blocked / virtual-blocked / ported)
  depgraph.py why <mangled>         explain why a function is NOT ready (lists unported deps / indirect count)
"""
import sys, os, re, json, glob, subprocess
from collections import defaultdict, deque

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raw-port/
LED  = os.path.join(ROOT, "army", "ledger")
OUT  = os.path.join(ROOT, "army", "depgraph")
FWS  = ["ProCore", "ProChannel", "Helium", "Ozone", "Flexo"]
TV   = "/tmp/{fw}_tV.txt"

LABEL  = re.compile(r'^(__Z[A-Za-z0-9_$.]+):$')
DIRECT = re.compile(r'\t(?:callq|jmp)\t(__Z[A-Za-z0-9_$.]+)\b')
# PLAIN-C DIRECT CALLS. DIRECT only matches Itanium-mangled `__Z*`, so a `jmp _PCPrint` — a C
# function DEFINED IN ProCore at 0x64e7 and not ported — produced NO edge at all, and the caller was
# handed out as READY with "no deps". worker-01 hit exactly that on _pcCheckGetTransformation
# (ProCore 0x133b5): "depgraph treats plain C symbols (no __ZN mangling) as true externs, so in-scope
# C deps don't block a unit."
# Scoped deliberately: only `_name` symbols that are DEFINED as text in one of the five frameworks
# count as in-scope. ObjC (`-[...]`/`+[...]`), Swift (`_$s...`), and libc/CF imports are excluded, so
# this adds real blocking edges without the false blocking that gating on all 16k non-__Z defined
# symbols would cause.
DIRECT_C = re.compile(r'\t(?:callq|jmp)\t(_[A-Za-z][A-Za-z0-9_$.]*)\b')
STUBT  = re.compile(r'symbol stub for:\s*(__Z[A-Za-z0-9_$.]+|_[A-Za-z0-9_$.]+)\b')
INDIR  = re.compile(r'\t(?:callq|jmp)\t\*')

def _canon(sym):
    # strip clang cold/thunk suffixes so an edge to foo.cold.1 resolves to foo
    return re.sub(r'\.(cold|part|constprop|isra|llvm)\.\d+$', '', sym)

def _ledger_symbols():
    """global map: mangled -> (fw, cls, status, demangled) for every known port target."""
    known = {}
    for fw in FWS:
        lp = os.path.join(LED, f"{fw}.ledger.json")
        if not os.path.exists(lp): continue
        led = json.load(open(lp))
        for cls, ms in led.items():
            if not isinstance(ms, dict): continue
            for k, v in ms.items():
                if isinstance(v, dict) and v.get("mangled"):
                    known[v["mangled"]] = (fw, cls, v.get("status", "todo"), v.get("demangled", ""))
    return known

def _defined_c_symbols():
    """Plain-C (`_name`) functions DEFINED as text in our five frameworks — i.e. in-scope code that a
    caller genuinely depends on, as opposed to a libc/CF/ObjC import. Cached; nm over 5 binaries."""
    cache = os.path.join(OUT, "defined_c.json")
    if os.path.exists(cache):
        try: return set(json.load(open(cache)))
        except Exception: pass
    out = set()
    for fw in FWS:
        binp = (f"/Applications/Final Cut Pro.app/Contents/Frameworks/{fw}.framework/Versions/A/{fw}")
        if not os.path.exists(binp): continue
        try:
            p = subprocess.run(["nm", "-arch", "x86_64", binp], capture_output=True, text=True, timeout=300)
        except Exception:
            continue
        for line in p.stdout.splitlines():
            parts = line.split()
            if len(parts) >= 3 and parts[1] in ("T", "t"):
                s = parts[2]
                # plain C only: skip C++ (__Z), ObjC (-[ / +[ / ___), Swift (_$s)
                if s.startswith("_") and not s.startswith("__Z") and not s.startswith("_$s") \
                   and not s.startswith("___") and "[" not in s:
                    out.add(s)
    os.makedirs(OUT, exist_ok=True)
    try: json.dump(sorted(out), open(cache, "w"))
    except OSError: pass
    return out

def build():
    os.makedirs(OUT, exist_ok=True)
    defined_c = _defined_c_symbols()
    g = {}
    for fw in FWS:
        path = TV.format(fw=fw)
        if not os.path.exists(path): print(f"  (no dump {path}, skip)"); continue
        cur = None
        with open(path, errors="replace") as f:
            for line in f:
                m = LABEL.match(line)
                if m:
                    cur = _canon(m.group(1))
                    if cur not in g:
                        g[cur] = {"fw": fw, "deps": set(), "extern_out": set(), "indirect": 0}
                    continue
                if cur is None: continue
                sm = STUBT.search(line)
                if sm:
                    g[cur]["deps"].add(_canon(sm.group(1))); continue   # extern stub NAMES its target
                if INDIR.search(line):
                    g[cur]["indirect"] += 1; continue
                dm = DIRECT.search(line)
                if dm:
                    t = _canon(dm.group(1))
                    if t != cur: g[cur]["deps"].add(t)
                    continue
                # plain-C callee that is DEFINED in one of our frameworks = a real in-scope dep
                cm = DIRECT_C.search(line)
                if cm:
                    t = _canon(cm.group(1))
                    if t != cur and t in defined_c:
                        g[cur]["deps"].add(t)
                        g[cur]["c_deps"] = g[cur].get("c_deps", set()); g[cur]["c_deps"].add(t)
    known = _ledger_symbols()
    out = {}
    for sym, v in g.items():
        # Split deps into IN-SCOPE (code we must port) vs true extern (out of scope).
        # A plain-C callee DEFINED in one of our frameworks is in scope even though it is absent from
        # the ledger — the ledger indexes C++/ObjC members, so a C helper like _PCPrint appears
        # nowhere in it and would otherwise be silently reclassified as an out-of-scope extern, which
        # is exactly the hole that handed out _pcCheckGetTransformation as READY.
        inscope = sorted(d for d in v["deps"] if d in known or d in defined_c)
        out[sym] = {"fw": v["fw"], "deps": inscope, "n_extern_oos": len(v["deps"]) - len(inscope),
                    "indirect": v["indirect"]}
    json.dump(out, open(os.path.join(OUT, "graph.json"), "w"))
    print(f"built global graph: {len(out)} functions, "
          f"{sum(len(v['deps']) for v in out.values())} in-scope dep edges, "
          f"{sum(1 for v in out.values() if not v['deps'] and v['indirect']==0)} pure leaves (0 in-scope deps, 0 indirect)")
    return out

def _load():
    p = os.path.join(OUT, "graph.json")
    return json.load(open(p)) if os.path.exists(p) else build()

def _status_map():
    known = _ledger_symbols()
    return {s: meta[2] for s, meta in known.items()}, known

def ready(N=40, allow_indirect=False):
    g = _load(); status, known = _status_map()
    rows = []
    for sym, info in g.items():
        st = status.get(sym)
        if st is None: continue          # not a ledger method (thunk/anon-only) — not a work item
        if st == "ported": continue
        # blockers = in-scope deps that are NOT ported yet
        blockers = [d for d in info["deps"] if status.get(d, "todo") != "ported"]
        if blockers: continue
        if not allow_indirect and info["indirect"] > 0: continue   # virtual-blocked, held separately
        cls, dem = known[sym][1], known[sym][3]
        rows.append((len(info["deps"]), info["indirect"], sym, info["fw"], cls, dem))
    rows.sort()
    print(f"# {len(rows)} functions READY NOW (every in-scope dependency ported"
          f"{', 0 indirect' if not allow_indirect else ''}). top {min(N,len(rows))}:")
    for nd, ni, sym, fw, cls, dem in rows[:N]:
        print(f"  {fw}\t{cls}\t{sym}\t[{nd} deps, {ni} indirect]\t{dem[:70]}")
    return rows

def stats():
    g = _load(); status, known = _status_map()
    ported = dep_blocked = ready_now = virt_blocked = notwork = 0
    for sym, info in g.items():
        st = status.get(sym)
        if st is None: notwork += 1; continue
        if st == "ported": ported += 1; continue
        blockers = [d for d in info["deps"] if status.get(d, "todo") != "ported"]
        if blockers: dep_blocked += 1
        elif info["indirect"] > 0: virt_blocked += 1
        else: ready_now += 1
    print("GLOBAL dependency tiers over ledger work items:")
    print(f"  ported                              = {ported}")
    print(f"  READY NOW (deps ported, 0 indirect) = {ready_now}")
    print(f"  virtual-blocked (indirect>0, deps ok)= {virt_blocked}")
    print(f"  dep-blocked (>=1 unported dep)       = {dep_blocked}")
    print(f"  (graph nodes not in ledger)          = {notwork}")

def why(sym):
    g = _load(); status, known = _status_map()
    info = g.get(sym)
    if not info: print(f"no graph node for {sym}"); return
    print(f"{sym} [{info['fw']}]: {len(info['deps'])} in-scope deps, "
          f"{info['indirect']} indirect, {info['n_extern_oos']} out-of-scope externs")
    unp = [d for d in info["deps"] if status.get(d, "todo") != "ported"]
    if unp:
        print(f"  BLOCKED by {len(unp)} unported deps:")
        for d in unp[:30]:
            print(f"    [{status.get(d,'todo'):8}] {known.get(d,(None,None,None,d))[3][:70]}")
    if info["indirect"]:
        print(f"  + {info['indirect']} indirect/virtual calls (resolve via tools/vtable.py to add edges)")
    if not unp and info["indirect"] == 0:
        print("  READY: all deps ported, no indirect calls.")

def deps(sym):
    g = _load(); status, known = _status_map()
    info = g.get(sym)
    if not info: print(f"no node {sym}"); return
    for d in info["deps"]:
        meta = known.get(d)
        if meta: print(f"  [{meta[2]:8}] {meta[3][:75]}")
        else:    print(f"  [oos/lib] {d}")

def order():
    """Kahn topological order over in-scope edges. Emits waves; reports cycle members."""
    g = _load(); status, known = _status_map()
    nodes = {s for s in g if s in known}
    indeg = {s: 0 for s in nodes}
    rdeps = defaultdict(list)
    for s in nodes:
        for d in g[s]["deps"]:
            if d in nodes:
                indeg[s] += 1; rdeps[d].append(s)
    q = deque(sorted(s for s in nodes if indeg[s] == 0))
    waves = []; seen = 0
    while q:
        wave = list(q); q.clear(); waves.append(len(wave)); seen += len(wave)
        nxt = []
        for s in wave:
            for c in rdeps[s]:
                indeg[c] -= 1
                if indeg[c] == 0: nxt.append(c)
        for s in sorted(nxt): q.append(s)
    cyc = [s for s in nodes if indeg[s] > 0]
    json.dump({"waves": waves, "n_nodes": len(nodes), "n_ordered": seen, "n_cyclic": len(cyc)},
              open(os.path.join(OUT, "order.json"), "w"))
    print(f"topo order: {len(nodes)} nodes, {seen} in {len(waves)} waves, {len(cyc)} in cycles (SCCs)")
    print(f"  wave sizes (first 15): {waves[:15]}")
    if cyc: print(f"  NOTE: {len(cyc)} functions are in dependency cycles (mutually recursive classes) "
                  f"— these need SCC-batch porting, see 'depgraph.py cycles'.")



# ---------------------------------------------------------------------------------------------
# SCC condensation — mutually-recursive functions (A calls B, B calls A) can never be "fully
# resolved first". We collapse each strongly-connected component into ONE atomic work unit: the
# whole cycle is ported together (a small SCC by one agent; a large SCC flagged for a coordinated
# batch). The condensed graph is a DAG, so topo order over SCC-units is always well-defined.
# ---------------------------------------------------------------------------------------------
def _tarjan(nodes, adj):
    idx={}; low={}; onstk={}; stk=[]; c=[0]; sccs=[]
    for v in list(nodes):
        if v in idx: continue
        work=[(v,0)]
        while work:
            node,pi=work[-1]
            if pi==0:
                idx[node]=low[node]=c[0]; c[0]+=1; stk.append(node); onstk[node]=True
            recurse=False
            for j in range(pi,len(adj.get(node,[]))):
                w=adj[node][j]
                if w not in idx:
                    work[-1]=(node,j+1); work.append((w,0)); recurse=True; break
                elif onstk.get(w): low[node]=min(low[node],idx[w])
            if recurse: continue
            if low[node]==idx[node]:
                comp=[]
                while True:
                    w=stk.pop(); onstk[w]=False; comp.append(w)
                    if w==node: break
                sccs.append(comp)
            work.pop()
            if work:
                par=work[-1][0]; low[par]=min(low[par],low[node])
    return sccs

def build_sccs():
    g=_load(); status,known=_status_map()
    nodes={s for s in g if s in known}
    adj={s:[d for d in g[s]["deps"] if d in nodes] for s in nodes}
    sccs=_tarjan(nodes,adj)
    comp_of={}
    for i,comp in enumerate(sccs):
        for m in comp: comp_of[m]=i
    data={"sccs":[sorted(c) for c in sccs],"comp_of":comp_of}
    json.dump(data,open(os.path.join(OUT,"sccs.json"),"w"))
    nontrivial=[c for c in sccs if len(c)>1]
    print(f"SCCs: {len(sccs)} components, {len(nontrivial)} non-trivial (cycles), "
          f"{sum(len(c) for c in nontrivial)} functions in cycles; largest={max((len(c) for c in sccs),default=0)}")
    return data

def _load_sccs():
    p=os.path.join(OUT,"sccs.json")
    if not os.path.exists(p): return build_sccs()
    return json.load(open(p))

def ready_scc(N=40, quiet=False):
    """Next SCC-units whose EVERY external (non-self) in-scope dep is ported and no unresolved
    indirect calls inside the unit. A unit of size 1 = a normal ready function; size>1 = a cycle
    ported atomically. This NEVER dispenses a function with an unresolved dependency.
    quiet=True suppresses the human backlog dump (used when called as a library, e.g. depclaim.next)."""
    g=_load(); status,known=_status_map(); sd=_load_sccs()
    comp_of=sd["comp_of"]; sccs=sd["sccs"]
    rows=[]
    for i,comp in enumerate(sccs):
        compset=set(comp)
        # skip units already fully ported
        if all(status.get(m)=="ported" for m in comp): continue
        # external deps = deps of any member that are NOT in this SCC
        ext_deps=set()
        indirect=0
        ok=True
        for m in comp:
            info=g.get(m,{"deps":[],"indirect":0})
            indirect+=info.get("indirect",0)
            for d in info["deps"]:
                if d not in compset: ext_deps.add(d)
        blockers=[d for d in ext_deps if status.get(d,"todo")!="ported"]
        if blockers: continue          # a dependency OUTSIDE the cycle isn't ported yet -> not ready
        if indirect>0: continue        # unresolved virtual calls inside the unit -> held
        rows.append((len(comp), len(ext_deps), i, comp))
    rows.sort()
    if not quiet:
        print(f"# {len(rows)} SCC-UNITS ready (all external deps ported, 0 indirect). top {min(N,len(rows))}:")
        for sz,ne,i,comp in rows[:N]:
            tag="fn" if sz==1 else f"CYCLE x{sz}"
            head=known.get(comp[0],(None,None,None,comp[0]))
            print(f"  [{tag}, {ne} ext-deps] {head[0]}\t{head[1]}\t{head[3][:60]}")
    return rows




def reconcile():
    """Refresh ledger status HONESTLY, then rebuild the graph — so the traversal never unblocks a
    caller based on a stub. Runs: mark_ported (citation-based: address-cited throw-stubs -> stub,
    DISPATCH_ONLY -> skeleton) THEN mark_stub_bodies (body-based: throw-only method bodies whose
    stub-throw cites only callee/call-site addrs -> stub). Then depgraph build. Run this before
    `ready`/`order`/`stats` whenever src changed."""
    import subprocess
    tools=os.path.join(os.path.dirname(os.path.abspath(__file__)))
    for step in ("mark_ported.py", "mark_stub_bodies.py"):
        args=[sys.executable, os.path.join(tools, step)]
        if step=="mark_stub_bodies.py": args.append("--apply")
        r=subprocess.run(args, capture_output=True, text=True)
        print(f"[{step}] " + (r.stdout.strip().splitlines() or [""])[-1])
    build()


if __name__ == "__main__":
    if len(sys.argv) < 2: print(__doc__); sys.exit(0)
    cmd = sys.argv[1]
    if cmd == "build": build()
    elif cmd == "order": order()
    elif cmd == "ready": ready(int(sys.argv[2]) if len(sys.argv) > 2 else 40)
    elif cmd == "stats": stats()
    elif cmd == "why": why(sys.argv[2])
    elif cmd == "deps": deps(sys.argv[2])
    elif cmd == "sccs": build_sccs()
    elif cmd == "ready_scc": ready_scc(int(sys.argv[2]) if len(sys.argv)>2 else 40)
    elif cmd == "reconcile": reconcile()
    else: print(__doc__)
