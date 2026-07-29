#!/usr/bin/env python3
"""depclaim.py — atomic claim/dispatch over the STRICT dependency queue (depgraph.py).

Hands a worker exactly ONE ready unit — a function (or a small SCC cycle to port atomically) whose
EVERY in-scope callee is already `ported` and which has no unresolved indirect/virtual calls. Because
every dependency is resolved before dispatch, the worker has NO legitimate reason to throw for an
internal call: those callees exist and must be imported+called. A throw is only ever allowed for a
true out-of-scope extern (libc/ObjC/CoreFoundation) — and the brief says so explicitly.

  depclaim.py next [maxscc]     atomically claim + print the next ready unit (default maxscc=8: skip
                                cycles bigger than 8 so a solo worker isn't handed the 719-tangle)
  depclaim.py done <sym>        release a claim after merge (mark_ported flips it to ported)
  depclaim.py fail <sym> <why>  release (defer) a claim
  depclaim.py claims            list active claims
State: army/depgraph/claims.json in the canonical main worktree (shared across git worktrees)."""
import sys, os, json, time, subprocess, fcntl

HERE=os.path.dirname(os.path.abspath(__file__))
def _canon_repo():
    repo=os.path.dirname(os.path.dirname(HERE))
    try:
        cg=subprocess.run(["git","-C",repo,"rev-parse","--git-common-dir"],capture_output=True,text=True,timeout=5).stdout.strip()
        if cg:
            if not os.path.isabs(cg): cg=os.path.join(repo,cg)
            main=os.path.dirname(os.path.abspath(cg))
            if os.path.isdir(os.path.join(main,"raw-port","army","depgraph")): return main
    except Exception: pass
    return repo
CANON=_canon_repo()
sys.path.insert(0, os.path.join(CANON,"raw-port","army","tools"))
import depgraph
depgraph.OUT=os.path.join(CANON,"raw-port","army","depgraph")
depgraph.LED=os.path.join(CANON,"raw-port","army","ledger")
CLAIMS=os.path.join(CANON,"raw-port","army","depgraph","claims.json")
LOCK=CLAIMS+".lock"

def _locked(fn):
    os.makedirs(os.path.dirname(CLAIMS),exist_ok=True)
    with open(LOCK,"w") as lk:
        fcntl.flock(lk,fcntl.LOCK_EX)
        try: return fn()
        finally: fcntl.flock(lk,fcntl.LOCK_UN)

def _load():
    if os.path.exists(CLAIMS):
        try: return json.load(open(CLAIMS))
        except Exception: pass
    return {"claimed":{},"done":{},"deferred":{}}

def _save(c): json.dump(c,open(CLAIMS,"w"),indent=1)

def cmd_next(maxscc=8):
    def go():
        c=_load()
        rows=depgraph.ready_scc(N=4000)  # returns sorted (sz, next, i, comp); prints too — ok
        for sz,ne,i,comp in rows:
            if sz>maxscc: continue                        # don't hand a solo worker a huge cycle
            head=comp[0]
            if head in c["claimed"] or head in c["done"]: continue
            if head in c["deferred"] and time.time()-c["deferred"][head]<1800: continue
            c["claimed"][head]={"ts":time.time(),"members":comp}; _save(c)
            _,known=depgraph._status_map()
            print("CLAIMED_UNIT")
            for m in comp:
                fw,cls,st,dem=known.get(m,("?","?","?",m))
                print(f"{fw}\t{cls}\t{m}\t{dem}")
            return
        print("NO_READY_UNIT (all ready units claimed, or remaining are big cycles / virtual-blocked)")
    return _locked(go)

def cmd_done(sym):
    def go():
        c=_load(); c["claimed"].pop(sym,None); c["done"][sym]=time.time(); _save(c); print("done",sym)
    return _locked(go)

def cmd_fail(sym,why):
    def go():
        c=_load(); c["claimed"].pop(sym,None); c["deferred"][sym]=time.time(); _save(c); print("deferred",sym,why)
    return _locked(go)


def cmd_reap(max_age_min=90):
    """Release claims abandoned by dead workers (age > max_age_min). depclaim has no per-worktree
    heartbeat, so age is the signal; a live worker re-claims fast. Frees the unit back to the queue."""
    import time as _t
    def go():
        c=_load(); now=_t.time(); freed=0
        for sym,v in list(c["claimed"].items()):
            if now - v.get("ts",now) > max_age_min*60:
                c["claimed"].pop(sym,None); c["deferred"][sym]=now; freed+=1
        _save(c); print(f"reaped {freed} stale claim(s) (age>{max_age_min}m) -> back in queue")
    return _locked(go)

def cmd_claims():
    c=_load()
    print(f"claimed={len(c['claimed'])} done={len(c['done'])} deferred={len(c['deferred'])}")
    for s,v in list(c["claimed"].items())[:30]:
        print(f"  {s}  ({len(v.get('members',[s]))} fns, age {int(time.time()-v['ts'])}s)")

if __name__=="__main__":
    a=sys.argv[1:] or ["claims"]
    if a[0]=="next": cmd_next(int(a[1]) if len(a)>1 else 8)
    elif a[0]=="done": cmd_done(a[1])
    elif a[0]=="fail": cmd_fail(a[1]," ".join(a[2:]))
    elif a[0]=="reap": cmd_reap(int(a[1]) if len(a)>1 else 90)
    else: cmd_claims()
