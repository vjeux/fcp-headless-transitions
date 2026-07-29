#!/usr/bin/env python3
# claim.py — atomic work dispenser for the raw-port swarm.
# A worker calls `claim.py next` to atomically lease the next unclaimed, un-ported, portable leaf
# class from the ledger. It records the lease in claims.json (under a mkdir lock) so no two workers
# ever grab the same class. On success the worker calls `claim.py done <fw> <class>`; on give-up
# `claim.py fail <fw> <class> <reason>`. `claim.py stats` prints progress.
#
# Prioritizes SMALL, SELF-CONTAINED leaf classes (real math/data, not std/template/UI soup) so the
# swarm drains high-value work first and rarely hits un-portable dead-ends.
import sys, os, json, time, glob, re

ROOT = os.path.dirname(os.path.abspath(__file__))                 # army/tools
ARMY = os.path.dirname(ROOT)                                       # army
REPO = os.path.dirname(os.path.dirname(ARMY))                      # repo root
LED  = os.path.join(ARMY, "ledger")
CLAIMS = os.path.join(ARMY, "swarm", "claims.json")
LOCK   = os.path.join(ARMY, "swarm", ".claims.lock.d")
SRC = os.path.join(REPO, "raw-port", "src")

BAD_SUB = ['<', 'std', '__', '::', ' ', '.cold', 'thunk', '_Factory', 'anonymous']
# ANTI-SHORTCUT: classes bigger than CHUNK_THRESHOLD methods are split into CHUNK-method batches so
# NO agent is ever asked to port 100s-1000s of methods in one context (that forces stub-to-finish
# shortcuts). Each chunk is its own claimable unit "<fw>:<cls>#<k>" -> its own file <Class>.m<k>.ts,
# independently gated + merged. The main <Class>.ts imports the parts. See `claim.py chunk`.
CHUNK = 20
CHUNK_THRESHOLD = 24

# NOTE: the "facade" concept has been REMOVED (2026-07-29, per vjeux). GOAL = port EVERYTHING (all
# 131,792 fns). A class is NEVER out of scope or demoted for being a "facade": ctors/dtors/field
# layout are real FCP code; ObjC-dispatch bodies port via the H1 runtime harness; extern framework
# calls become boundary stubs. There is no BAD_TOK denylist and no shader-facade demotion. Ordering
# only PROMOTES verification-corpus math (MATH_SIG) so the 65-transition math leads; everything else
# is served equally by size. Nothing is skipped, nothing is deprioritized for its name/kind.

# classes whose port would edit a SHARED dispatch file — keep out of the auto-swarm (hand-serialize
# to avoid two workers editing the same file concurrently — NOT a facade judgement).
SHARED = {'OZSpline','OZInterpolators','OZInterpolator','OZBezierInterpolator','OZCardinalInterpolator',
          'OZCurve','OZChannelInfo','PCSingleton','OZSplineState','PCString','OZCurveRuntime','HGRect'}

def _lock():
    for _ in range(600):
        try:
            os.makedirs(LOCK); return
        except FileExistsError:
            time.sleep(0.3)
    raise SystemExit("claim lock timeout")

def _unlock():
    try: os.rmdir(LOCK)
    except OSError: pass

def _load():
    if os.path.exists(CLAIMS): return json.load(open(CLAIMS))
    return {"claimed": {}, "done": {}, "failed": {}}

def _save(c):
    os.makedirs(os.path.dirname(CLAIMS), exist_ok=True)
    tmp = CLAIMS + ".tmp"; json.dump(c, open(tmp, "w"), indent=0); os.replace(tmp, CLAIMS)

def _ported_files():
    return set(os.path.basename(p)[:-3] for p in glob.glob(os.path.join(SRC, "**", "*.ts"), recursive=True))

def _layer(cls):
    if cls.startswith('PC') or 'Matrix' in cls or 'Exception' in cls or 'Timecode' in cls or 'Statistics' in cls: return 'infra'
    if cls.startswith('HG') or cls.startswith('Hgc') or 'Mask' in cls or 'Blend' in cls or 'PanMatrix' in cls or 'HCopy' in cls: return 'render'
    if 'Node' in cls and 'Channel' not in cls: return 'nodes'
    return 'channels'

def _class_methods(fw, cls):
    """Ordered (methkey, unit) list for a class, stable by ledger insertion (addr) order."""
    led = json.load(open(os.path.join(LED, f"{fw}.ledger.json")))
    ms = led.get(cls, {})
    return [(k, v) for k, v in ms.items()]

# Pure-math demangled-method signatures — RARE in plumbing, common in real numeric classes.
# Used ONLY to give math-corpus classes a light lead in the queue (tier 0 vs 1) so the
# 65-transition verification corpus is exercised early. This is a preference, NOT an exclusion —
# a class with zero math signals is served right behind, never skipped or demoted for its name.
MATH_SIG = ("MultMatrix","LoadMatrix","LoadIdentity","PostMultMatrix","determinant",
    "invert","Interpolat","interpolat","evalXSpline","evalBSpline","Bezier","BSpline",
    "Quaternion","crossProduct","dotProduct","SetCoefficient","GetCoefficient",
    "convolve","Convolution","solveNode","getValueAsDouble","superEllipse","calcSnap",
    "Gradient","Catmull","EaseIn","EaseOut","Logarithmic","SampledContour","perspective",
    "homography","Vec3","Vec4","PCVector","PCMatrix","toLinear","fromLinear",
    "OETF","EOTF","OOTF")
def _math_signals(ms):
    # Count math-corpus signals ONLY from the METHOD name of C++ methods — NOT the class-name
    # prefix (else a UI class like OZBSplineMaskTool_UIComponent matches "BSpline" via its own
    # ctor/dtor name echo and wrongly leads the queue). Strip the "Class::" qualifier and the
    # arg list, then match MATH_SIG against just the bare method identifier. ObjC selectors are
    # skipped (kind!=cpp) — incidental selector words must not promote.
    import re as _re
    hits=set()
    for v in ms.values():
        if not isinstance(v,dict): continue
        if v.get("kind")!="cpp": continue
        dem=v.get("demangled","")
        # method = text after the LAST "::" (namespace/class qualifiers dropped), before "(".
        head=dem.split("(",1)[0]
        meth=head.rsplit("::",1)[-1] if "::" in head else head
        # a dtor "~OZBSplineMaskTool_UIComponent" echoes the class name — never a math signal.
        if meth.startswith("~"): continue
        for t in MATH_SIG:
            if t in meth: hits.add(t)
    return len(hits)

def _candidates(defer=None):
    """Portable work units (fw, cls, nMethods, chunk_or_None), best-first.
    FULL-ENGINE scope: dispense the ENTIRE inventory. GOAL = port EVERYTHING (all 131,792 fns).
    There is NO facade concept — every class is real, portable FCP code (ctors/dtors/field-layout
    are real; ObjC-dispatch bodies port via the H1 runtime harness; extern framework calls become
    boundary stubs). NOTHING is skipped or demoted for being a "facade".

    ANTI-SHORTCUT: any class with > CHUNK_THRESHOLD methods is emitted as MULTIPLE chunk units of
    CHUNK methods each — never as one giant unit — so no agent is asked to port 100s-1000s of
    methods in one sitting (the thing that forces stub-to-finish shortcuts). Small classes stay whole.

    Ordering (tier, then size) — a light preference only, never an exclusion:
      * math-corpus classes (>=1 MATH_SIG cpp signal) lead slightly so the 65-transition
        verification corpus gets exercised early; every other class follows right behind.
      * smaller classes sort before larger (quicker merges, less contention).
      * `defer` = classes a worker gave up on this pass; sorted to a bottom band (+DEFER_TIER) so
        fresh work is served first, but they REMAIN claimable and WILL be served once fresh is done.
    """
    defer = defer if defer is not None else (lambda _c: set(_c.get("deferred", {})) | set(_c.get("failed", {})))(_load())
    DEFER_TIER = 1000
    done = _ported_files()
    out = []
    for f in sorted(glob.glob(os.path.join(LED, "*.ledger.json"))):
        fw = os.path.basename(f).split(".")[0]
        if fw == "shaders": continue
        try: led = json.load(open(f))
        except Exception: continue
        for cls, ms in led.items():
            if cls in SHARED or cls == "(free)": continue
            if any(b in cls for b in BAD_SUB): continue   # only strips std::/thunk/_Factory/anon noise
            if not all(isinstance(v, dict) for v in ms.values()): continue
            n = len(ms); todo = sum(1 for v in ms.values() if v.get("status") != "ported")
            if todo == 0: continue
            msig = _math_signals(ms)
            # tier 0 = has math-corpus signal (leads); tier 1 = everything else. No facade demotion.
            base_tier = 0 if msig >= 1 else 1
            if n > CHUNK_THRESHOLD:
                nchunks = (n + CHUNK - 1) // CHUNK
                for k in range(nchunks):
                    if f"{cls}.m{k}" in done: continue
                    tier = base_tier
                    if f"{fw}:{cls}" in defer: tier += DEFER_TIER
                    out.append((tier, CHUNK, fw, cls, k))
            else:
                if cls in done: continue
                tier = base_tier
                if f"{fw}:{cls}" in defer: tier += DEFER_TIER
                out.append((tier, n, fw, cls, None))
    out.sort()
    return [(n, fw, cls, ck) for (tier, n, fw, cls, ck) in out]

def cmd_next():
    _lock()
    try:
        c = _load()
        # GOAL = port EVERYTHING. Only skip classes that are DONE or currently CLAIMED by a live
        # worker. NEVER skip on `failed`/`deferred` — a give-up must not permanently remove a class.
        # (`failed` is legacy/frozen; `cmd_fail` now writes `deferred`, which _candidates orders LAST
        # but still serves. `reclaim` drains any legacy `failed` back into the queue.)
        skip = set(c["claimed"]) | set(c["done"])
        for n, fw, cls, ck in _candidates():
            key = f"{fw}:{cls}#{ck}" if ck is not None else f"{fw}:{cls}"
            if key in skip: continue
            rec = {"fw": fw, "cls": cls, "n": n, "t": time.time()}
            if ck is not None: rec["chunk"] = ck
            c["claimed"][key] = rec
            _save(c)
            if ck is not None:
                # a method-batch of a big class: tell the worker EXACTLY which methods (bounded list)
                print(f"{fw}\t{cls}\t{n}\t{_layer(cls)}\tCHUNK={ck}")
            else:
                print(f"{fw}\t{cls}\t{n}\t{_layer(cls)}")
            return
        print("EMPTY")
    finally:
        _unlock()

def cmd_chunk(fw, cls, k):
    """Print the exact method list for chunk k of a big class — the BOUNDED work unit. The worker
    ports ONLY these into src/<layer>/<Class>.m<k>.ts. Never asked to hold the whole class."""
    k = int(k)
    meths = _class_methods(fw, cls)
    lo, hi = k * CHUNK, min((k + 1) * CHUNK, len(meths))
    print(f"# {fw}:{cls} chunk {k}  methods [{lo}..{hi}) of {len(meths)}")
    print(f"# write ONLY these {hi-lo} methods into raw-port/src/{_layer(cls)}/{cls}.m{k}.ts")
    for i in range(lo, hi):
        mk, v = meths[i]
        print(f"{i}\t{v.get('addr','?')}\t{v.get('kind','cpp')}\t{v.get('demangled', mk)}")

def cmd_claim(fw, cls, ck=None):
    """Atomically claim a SPECIFIC class by name (targeted hand-pick), bypassing the `next` sort.
    Requested by workers 208/210/218 so a math worker can grab a known-good target (e.g. a class
    flagged as a high-value frontier callee) instead of churning `next` through plumbing. Refuses
    if the class is already claimed/done/failed, or if the ledger has no such class. Prints the same
    TSV line as `next` (fw\tcls\tn\tlayer[\tCHUNK=k]) so worker flow is identical after claiming."""
    _lock()
    try:
        c = _load()
        key = _key(fw, cls, ck)
        if key in c["claimed"]: print(f"ALREADY-CLAIMED {key}"); return
        if key in c["done"]:    print(f"ALREADY-DONE {key}");    return
        # A previously-deferred/"failed" class is FAIR GAME — hand-picking it is exactly how we
        # port the things earlier workers gave up on. Clear the stale exclusion and claim it.
        c.get("failed", {}).pop(key, None)
        c.get("deferred", {}).pop(key, None)
        # Verify the class exists in the ledger and count its methods.
        lp = os.path.join(LED, f"{fw}.ledger.json")
        if not os.path.exists(lp): print(f"NO-SUCH-FRAMEWORK {fw}"); return
        try: led = json.load(open(lp))
        except Exception: print(f"BAD-LEDGER {fw}"); return
        ms = led.get(cls)
        if not isinstance(ms, dict) or not ms: print(f"NO-SUCH-CLASS {fw}:{cls}"); return
        n = len(ms)
        rec = {"fw": fw, "cls": cls, "n": n, "t": time.time()}
        ckn = int(ck) if ck not in (None, "") else None
        if ckn is not None: rec["chunk"] = ckn
        c["claimed"][key] = rec
        c.get("failed", {}).pop(key, None)      # claiming clears any stale defer/fail exclusion
        c.get("deferred", {}).pop(key, None)
        _save(c)
        if ckn is not None: print(f"{fw}\t{cls}\t{n}\t{_layer(cls)}\tCHUNK={ckn}")
        else:               print(f"{fw}\t{cls}\t{n}\t{_layer(cls)}")
    finally:
        _unlock()

def _key(fw, cls, ck=None):
    return f"{fw}:{cls}#{ck}" if ck not in (None, "") else f"{fw}:{cls}"

def cmd_done(fw, cls, ck=None):
    _lock()
    try:
        c = _load(); key = _key(fw, cls, ck)
        c["claimed"].pop(key, None); c["done"][key] = time.time(); _save(c)
        print(f"done {key}")
    finally: _unlock()

def cmd_fail(fw, cls, reason, ck=None):
    # DEFER, don't DELETE. GOAL = port EVERYTHING (all 131,792 fns). A "facade" is NOT out of scope:
    # ctors/dtors/field-layout are real FCP code; ObjC-dispatch bodies port via the H1 runtime harness;
    # extern framework calls become boundary stubs (like _CGColorSpaceGetNumberOfComponents). So a
    # worker giving up on a class only DEPRIORITIZES it — it must stay claimable. We record the defer
    # in `deferred` (with reason + count), release the claim, and DO NOT add it to the permanent
    # `failed` exclusion set. `_candidates()` still serves deferred classes, just at the lowest tier,
    # so nothing is ever arbitrarily prevented from being ported.
    _lock()
    try:
        c = _load(); key = _key(fw, cls, ck)
        c["claimed"].pop(key, None)
        c.setdefault("deferred", {})
        prev = c["deferred"].get(key, {})
        c["deferred"][key] = {"t": time.time(), "reason": reason, "count": prev.get("count", 0) + 1}
        _save(c)
        print(f"deferred {key} (still claimable, lowest tier): {reason}")
    finally: _unlock()

def cmd_reclaim():
    """Move EVERY class out of the permanent `failed` exclusion set back into the queue (as
    `deferred`, lowest tier). Undoes the historical 'fail = delete forever' behavior so the swarm
    can port everything. Idempotent."""
    _lock()
    try:
        c = _load(); failed = c.get("failed", {}); c.setdefault("deferred", {})
        n = 0
        for key, rec in list(failed.items()):
            reason = rec.get("reason", "") if isinstance(rec, dict) else ""
            prev = c["deferred"].get(key, {})
            c["deferred"][key] = {"t": time.time(), "reason": f"reclaimed: {reason}",
                                   "count": prev.get("count", 0)}
            n += 1
        c["failed"] = {}
        _save(c)
        print(f"reclaimed {n} previously-failed classes back into the queue (deferred, lowest tier)")
    finally: _unlock()

def cmd_release(fw, cls, ck=None):
    _lock()
    try:
        c = _load(); c["claimed"].pop(_key(fw, cls, ck), None); _save(c); print("released")
    finally: _unlock()

def cmd_stats():
    c = _load(); cands = _candidates()
    print(f"claimed={len(c['claimed'])} done={len(c['done'])} deferred={len(c.get('deferred',{}))} failed={len(c.get('failed',{}))} available_leaves={len(cands)}")
    if c["claimed"]:
        print("in-flight:", ", ".join(k.split(':')[1] for k in list(c["claimed"])[:20]))


def _shader_candidates():
    """All un-ported shaders (fw, name), best-first (fewest-line .ll ~ simplest; we lack line counts
    pre-extraction so just alpha order for determinism)."""
    done = _ported_files()
    p = os.path.join(LED, "shaders.ledger.json")
    if not os.path.exists(p): return []
    led = json.load(open(p))
    out = []
    for name, meta in led.items():
        # On-disk .ts (and .ll) sanitize C++ "::" to "__", so dedup against the sanitized
        # basename — the raw "::" ledger key never matches a ported file (148 keys have "::").
        # Also accept the LEGACY single-"_" collapse (early workers landed "Cls::Cls_foo"
        # as "Cls_foo.ts"), so next-shader stops re-serving those already-ported shaders.
        safe = name.replace("::", "__")
        legacy = None
        if "::" in name:
            a, b = name.split("::", 1)
            legacy = b if b.startswith(a + "_") else (a + "_" + b)
        if safe in done or name in done or (legacy and legacy in done): continue
        out.append((meta["fw"], name))
    out.sort()
    return out

def cmd_next_shader():
    _lock()
    try:
        c = _load()
        # A shader may be marked "done" under EITHER key scheme: cmd_done writes
        # "<fw>:<name>" while historically next-shader leased "shader:<name>".
        # Skip both, plus any already-written .ts file on disk (authoritative).
        skip = set(c["claimed"]) | set(c["done"]) | set(c["failed"])
        for fw, name in _shader_candidates():
            key = f"shader:{name}"
            if key in skip: continue
            if f"{fw}:{name}" in skip: continue
            c["claimed"][key] = {"fw": fw, "shader": name, "t": time.time()}
            _save(c)
            print(f"{fw}\t{name}")
            return
        print("EMPTY")
    finally:
        _unlock()

if __name__ == "__main__":
    a = sys.argv[1:] or ["stats"]
    cmd = a[0]
    if cmd == "next": cmd_next()
    elif cmd == "reclaim": cmd_reclaim()
    elif cmd == "claim": cmd_claim(a[1], a[2], a[3] if len(a) >= 4 and a[3].isdigit() else None)
    elif cmd == "next-shader": cmd_next_shader()
    elif cmd == "chunk": cmd_chunk(a[1], a[2], a[3])
    elif cmd == "done": cmd_done(*a[1:])
    elif cmd == "fail":
        # done/fail/release accept optional trailing chunk index: done <fw> <cls> [chunk]
        if len(a) >= 4 and a[-1].isdigit(): cmd_fail(a[1], a[2], " ".join(a[3:-1]) or "n/a", a[-1])
        else: cmd_fail(a[1], a[2], " ".join(a[3:]))
    elif cmd == "release": cmd_release(*a[1:])
    elif cmd == "reclaim": cmd_reclaim()
    else: cmd_stats()
