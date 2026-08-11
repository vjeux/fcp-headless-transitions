#!/usr/bin/env python3
"""depclaim.py — DEAD-SIMPLE claim queue for the raw-port swarm.

DESIGN (rewritten 2026-08-09, per vjeux): there is ONE append-only ledger of claims,
`army/depgraph/claims.jsonl` (one JSON object per line). A claim, once written, is NEVER
taken back — no `done`, no `fail`, no `deferred`, no `reap`, no timeout. This is the whole
point: the CLAIM ITSELF is the source of truth for "someone is/was handling this symbol",
so a lagging ledger or a lagging merge can NEVER cause the same symbol to be handed out
twice. A worker that dies just leaves a dead claim; that unit is simply done-with (a human
or a later sweep can re-open it explicitly, but the queue never auto-recycles it).

Availability of a unit is decided by exactly TWO facts, both monotonic (only ever move a
symbol OUT of the pool, never back in):
  1. it is already `ported` in the ledger, OR
  2. it has already been claimed (present in claims.jsonl).
Dependency-readiness (every in-scope callee ported, no unresolved indirect) is still
enforced via depgraph, so a worker is never handed a unit whose deps aren't ready.

  depclaim.py next [maxscc]   atomically claim + print the next ready, unclaimed unit
  depclaim.py claims          summary (count + last few)
  depclaim.py claimed <sym>   test: is this symbol already claimed? (exit 0 yes / 1 no)
  depclaim.py reopen <sym>    EXPLICIT, rare: drop the claim for <sym> so it can be re-handed
                              (the ONLY way a claim leaves the ledger; requires a human/coord)

State: army/depgraph/claims.jsonl (append-only). Shared across all git worktrees via the
canonical main checkout. A single flock serializes the read-newest + append.
"""
import sys, os, json, time, subprocess, fcntl, re

HERE = os.path.dirname(os.path.abspath(__file__))
def _canon_repo():
    repo = os.path.dirname(os.path.dirname(HERE))
    try:
        cg = subprocess.run(["git","-C",repo,"rev-parse","--git-common-dir"],
                            capture_output=True, text=True, timeout=5).stdout.strip()
        if cg:
            if not os.path.isabs(cg): cg = os.path.join(repo, cg)
            main = os.path.dirname(os.path.abspath(cg))
            if os.path.isdir(os.path.join(main,"raw-port","army","depgraph")): return main
    except Exception: pass
    return repo
CANON = _canon_repo()
sys.path.insert(0, os.path.join(CANON,"raw-port","army","tools"))
import depgraph
depgraph.OUT = os.path.join(CANON,"raw-port","army","depgraph")
depgraph.LED = os.path.join(CANON,"raw-port","army","ledger")

CLAIMS = os.path.join(CANON,"raw-port","army","depgraph","claims.jsonl")
LOCK   = CLAIMS + ".lock"

def _locked(fn):
    os.makedirs(os.path.dirname(CLAIMS), exist_ok=True)
    with open(LOCK,"w") as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)
        try: return fn()
        finally: fcntl.flock(lk, fcntl.LOCK_UN)

def _claimed_set():
    """Every symbol ever claimed (across all members of every claim). Reads the append-only log.
    A `reopen` line removes a symbol; last-writer-wins per symbol."""
    claimed = {}
    if not os.path.exists(CLAIMS): return set()
    with open(CLAIMS, errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try: rec = json.loads(line)
            except Exception: continue
            if rec.get("op") == "reopen":
                for m in rec.get("members", [rec.get("head")]):
                    claimed.pop(m, None)
                continue
            for m in rec.get("members", [rec.get("head")]):
                if m: claimed[m] = rec.get("ts", 0)
    return set(claimed)

def _append(rec):
    with open(CLAIMS,"a") as f:
        f.write(json.dumps(rec) + "\n")
        f.flush(); os.fsync(f.fileno())

INFLIGHT = os.path.join(CANON,"raw-port","army","depgraph","inflight_branch_syms.txt")

def _inflight_set():
    """Symbols that already have a pushed origin/port/* branch (or are on origin/main). A symbol
    here must NEVER be dispensed — it needs MERGING/REBASING, not re-porting. This is the durable
    guard against seed-drift: even if claims.jsonl has a stale `reopen` for such a symbol (as
    happened when orphan-reopen wrongly reopened branch-backed symbols), cmd_next still skips it.
    Populated as a side-effect of `depclaim.py seed`. Fail-open: missing/empty cache => empty set
    => at worst a worker collides once and refuses to ship a dup (the merge/push then rejects)."""
    s = set()
    if os.path.exists(INFLIGHT):
        try:
            with open(INFLIGHT, errors="replace") as f:
                for line in f:
                    t = line.strip()
                    if t: s.add(t)
        except Exception: pass
    return s

def _is_stl(sym):
    """libc++ template instantiations are compiler-emitted boilerplate the swarm defers
    indefinitely. With an append-only queue there is no 'defer', so skip them at dispatch so they
    never clog the head of the ready list. Two cases:
      1. the symbol IS a std::__1 method   -> mangled starts __ZNSt / __ZNKSt / __ZSt
      2. the symbol is a normal class but is PARAMETERIZED by std::__1 containers (e.g.
         PCEvictionHeap<std::__1::__map_iterator<...>>::bubble) -> the mangled embeds `NSt3__1`
         or `St3__1`. These are just as un-portable by a solo worker.
    """
    if sym.startswith("__ZNSt") or sym.startswith("__ZNKSt") or sym.startswith("__ZSt"):
        return True
    return ("NSt3__1" in sym) or ("St3__1" in sym)

def cmd_next(maxscc=8, allow_stl=False):
    def go():
        claimed = _claimed_set()
        inflight = _inflight_set()      # symbols with a pushed branch / on main — never re-hand
        rows = depgraph.ready_scc(N=6000, quiet=True)   # dependency-ready SCC units (deps ported, 0 indirect); quiet: no backlog dump before CLAIMED_UNIT
        for sz, ne, i, comp in rows:
            if sz > maxscc: continue               # don't hand a solo worker a giant cycle
            head = comp[0]
            # skip if ANY member is already claimed (append-only: never re-hand)
            if any(m in claimed for m in comp): continue
            # skip if ANY member already has a pushed origin/port/* branch (needs merge/rebase, not
            # re-port) — the durable guard against claims.jsonl reopen-drift.
            if any(m in inflight for m in comp): continue
            # skip libc++ template boilerplate unless explicitly asked (they'd clog forever)
            if not allow_stl and any(_is_stl(m) for m in comp): continue
            rec = {"op":"claim","head":head,"members":comp,"ts":time.time()}
            _append(rec)
            _, known = depgraph._status_map()
            print("CLAIMED_UNIT")
            for m in comp:
                fw, cls, st, dem = known.get(m, ("?","?","?",m))
                print(f"{fw}\t{cls}\t{m}\t{dem}")
            return
        print("NO_READY_UNIT (every dependency-ready unit is already claimed or ported)")
    return _locked(go)

def cmd_claimed(sym):
    def go():
        hit = sym in _claimed_set()
        print("CLAIMED" if hit else "UNCLAIMED", sym)
        return 0 if hit else 1
    return _locked(go)

def cmd_reopen(sym):
    """EXPLICIT re-open: append a reopen record so <sym> can be handed out again. Rare; human/maint only."""
    def go():
        _append({"op":"reopen","head":sym,"members":[sym],"ts":time.time()})
        print("reopened", sym)
    return _locked(go)

def cmd_claims():
    def go():
        n = 0; last = []
        if os.path.exists(CLAIMS):
            with open(CLAIMS, errors="replace") as f:
                lines = [l for l in f if l.strip()]
            n = len(lines); last = lines[-8:]
        distinct = len(_claimed_set())
        print(f"claim records={n}  distinct symbols claimed={distinct}")
        for l in last:
            try:
                r = json.loads(l)
                age = int(time.time() - r.get("ts", time.time()))
                print(f"  {r.get('op','claim'):6} {r.get('head','?')[:60]}  ({len(r.get('members',[r.get('head')]))} fns, {age}s ago)")
            except Exception: pass
    return _locked(go)


def cmd_seed():
    """One-time / catch-up: harvest every mangled symbol that ALREADY has a cited port — on
    origin/main OR any pushed origin/port/* branch tip — and record it as claimed. This makes
    the append-only queue reflect work done OUTSIDE depclaim (direct commits, older waves), so
    `next` never re-hands a symbol that is already built somewhere. Idempotent: only appends
    symbols not already claimed. Run occasionally from swarm_maint (git-grep is ~30-90s)."""
    import subprocess as sp
    def go():
        claimed=_claimed_set()
        # main: one full grep (the bulk of already-merged symbols)
        found=set()
        g=sp.run(["git","-C",CANON,"grep","-hoE","__Z[A-Za-z0-9_$.]+","origin/main","--","raw-port/src"],
                 capture_output=True,text=True)
        for tok in g.stdout.split():
            if tok.startswith("__Z"): found.add(tok)
        # each pushed port branch: grep ONLY the files that differ from main (branches are tiny
        # diffs, usually 1 file) — 100x faster than full-tree grep per branch, so this stays fast
        # even under heavy swarm load.
        r=sp.run(["git","-C",CANON,"for-each-ref","--format=%(refname:short)","refs/remotes/origin/port/*"],
                 capture_output=True,text=True)
        refs=[x for x in r.stdout.split() if x]
        for ref in refs:
            d=sp.run(["git","-C",CANON,"diff","--name-only",f"origin/main...{ref}","--","raw-port/src"],
                     capture_output=True,text=True)
            files=[x for x in d.stdout.split() if x]
            if not files: continue
            g=sp.run(["git","-C",CANON,"grep","-hoE","__Z[A-Za-z0-9_$.]+",ref,"--",*files],
                     capture_output=True,text=True)
            for tok in g.stdout.split():
                if tok.startswith("__Z"): found.add(tok)
        new=[m for m in found if m not in claimed]
        for m in new:
            _append({"op":"claim","head":m,"members":[m],"ts":time.time(),"src":"seed"})
        # ALSO write the durable inflight cache: EVERY symbol found on main/a branch tip (not just
        # the newly-appended ones). cmd_next unions this into its skip-set, so a symbol with a
        # pushed branch is never re-dispensed even if claims.jsonl has a stale reopen for it.
        try:
            tmp = INFLIGHT + ".tmp"
            with open(tmp, "w") as f:
                for m in sorted(found): f.write(m + "\n")
            os.replace(tmp, INFLIGHT)
            wrote = len(found)
        except Exception as e:
            wrote = -1
        print(f"seed: scanned {len(refs)} refs, found {len(found)} cited symbols, "
              f"appended {len(new)} new claims (skipped {len(found)-len(new)} already claimed); "
              f"inflight cache <- {wrote} symbols")
    return _locked(go)

def cmd_drop(sym, reason):
    """Return a claimed-but-unportable unit to the queue, recording WHY.

    THE PROBLEM THIS SOLVES. A worker that correctly refuses to fake a port — unported callee,
    unresolved virtual dispatch, an out-of-scope body — was told to "drop the unit and claim the
    next one". But `next` skips anything present in claims.jsonl, and nothing ever removed a claim:
    across 5,799 claim records this repo had exactly ZERO reopens. So every honest refusal silently
    and permanently DELETED a symbol from the work queue. Five separate workers reported dropping
    units this way; those symbols are still gone, and the ledger's own coverage numbers are wrong by
    that amount.

    `reopen` existed but was documented as "rare; requires a human/coord" and appeared in no brief,
    so no agent ever used it. Refusing to fake a port is the CORRECT behavior and must not cost the
    project the unit — it should cost the unit a note about why it is blocked, and put it back.

    The reason string is the valuable part: it accumulates the real blocked-taxonomy (call_once init
    chains, plain-C in-scope callees invisible to depgraph, vtable dispatch, Lithium/ProShapes/CF
    boundaries) instead of that knowledge dying in one agent's exit report.
    """
    def go():
        _append({"op": "reopen", "head": sym, "members": [sym], "ts": time.time(),
                 "dropped_reason": reason})
        try:
            with open(os.path.join(os.path.dirname(CLAIMS), "blocked.jsonl"), "a") as f:
                f.write(json.dumps({"sym": sym, "reason": reason, "ts": time.time()}) + "\n")
        except OSError:
            pass
        print(f"dropped + requeued {sym}")
        print(f"  reason: {reason}")
        print("  (the unit is claimable again; the reason is recorded in army/depgraph/blocked.jsonl)")
    return _locked(go)


def cmd_blocked():
    """Show the accumulated blocked-reason taxonomy — what is actually stopping the port."""
    p = os.path.join(os.path.dirname(CLAIMS), "blocked.jsonl")
    if not os.path.exists(p):
        print("no dropped units recorded yet"); return
    rows = []
    for line in open(p, errors="replace"):
        line = line.strip()
        if line:
            try: rows.append(json.loads(line))
            except Exception: pass
    print(f"{len(rows)} dropped/requeued unit(s):")
    for r in rows[-25:]:
        print(f"  {r.get('sym','?')[:70]}\n      {r.get('reason','')[:150]}")


if __name__ == "__main__":
    a = sys.argv[1:] or ["claims"]
    if   a[0] == "next":    cmd_next(int(a[1]) if len(a) > 1 else 8, allow_stl=("--stl" in a))
    elif a[0] == "claimed": sys.exit(cmd_claimed(a[1]))
    elif a[0] == "reopen":  cmd_reopen(a[1])
    elif a[0] == "drop":
        if len(a) < 3:
            print('usage: depclaim.py drop <mangled> "<why it is not portable yet>"', file=sys.stderr)
            sys.exit(2)
        cmd_drop(a[1], " ".join(a[2:]))
    elif a[0] == "blocked": cmd_blocked()
    elif a[0] == "seed":    cmd_seed()
    # legacy no-ops kept so old briefs/scripts don't crash mid-transition:
    elif a[0] in ("done","fail","reap","refresh_inflight"):
        print(f"depclaim: '{a[0]}' is retired (append-only queue: claims are never taken back). no-op.")
    else: cmd_claims()
