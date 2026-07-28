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
BAD_TOK = ['Cache','Hash','Tree','Alloc','Iterator','Impl','CFRef','_UIComponent','Controller',
           'Overlay','HUD','Inspector','Tool','Cell','Button','Picker','View','Window','Menu',
           'Panel','Dialog','Sentry','__cxx']
# classes whose port would edit a SHARED dispatch file — keep out of the auto-swarm (hand-serialize)
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

def _candidates():
    """Portable leaf classes (fw, cls, nMethods), best-first.
    FULL-ENGINE scope (ARMY.md §1): dispense the ENTIRE inventory, not just tiny C++ leaves.
    Ordering = smallest-first so simple leaves drain before heavies, but NOTHING is permanently
    excluded — a class only being big/ObjC/std means it sorts LATER, not that it's skipped.
    Only hard-skip: already-ported, SHARED hand-serialized dispatch files, and the (free) bucket
    (free functions are dispensed separately via next-free so they don't dominate the class queue)."""
    done = _ported_files()
    out = []
    for f in sorted(glob.glob(os.path.join(LED, "*.ledger.json"))):
        fw = os.path.basename(f).split(".")[0]
        if fw == "shaders": continue
        try: led = json.load(open(f))
        except Exception: continue
        for cls, ms in led.items():
            if cls in done or cls in SHARED or cls == "(free)": continue
            if any(b in cls for b in BAD_SUB): continue      # std/template/anon — genuinely un-nameable as a file
            if not all(isinstance(v, dict) for v in ms.values()): continue
            n = len(ms); todo = sum(1 for v in ms.values() if v.get("status") != "ported")
            if todo == 0: continue                            # fully ported already
            # priority tier: small clean C++ first (0), then bigger (1), then ObjC-heavy (2)
            objc = sum(1 for v in ms.values() if v.get("kind") == "objc")
            heavy_tok = any(t in cls for t in BAD_TOK)
            tier = 0 if (2 <= n <= 12 and objc == 0 and not heavy_tok) else (2 if objc > n//2 else 1)
            out.append((tier, n, fw, cls))
    out.sort()  # tier first, then fewest methods
    return [(n, fw, cls) for (tier, n, fw, cls) in out]

def cmd_next():
    _lock()
    try:
        c = _load()
        leased = set(c["claimed"]) | set(c["done"])
        # failed classes are retryable after a while, but skip for now to avoid loops
        skip = leased | set(c["failed"])
        for n, fw, cls in _candidates():
            key = f"{fw}:{cls}"
            if key in skip: continue
            c["claimed"][key] = {"fw": fw, "cls": cls, "n": n, "t": time.time()}
            _save(c)
            print(f"{fw}\t{cls}\t{n}\t{_layer(cls)}")
            return
        print("EMPTY")
    finally:
        _unlock()

def cmd_done(fw, cls):
    _lock()
    try:
        c = _load(); key = f"{fw}:{cls}"
        c["claimed"].pop(key, None); c["done"][key] = time.time(); _save(c)
        print(f"done {key}")
    finally: _unlock()

def cmd_fail(fw, cls, reason):
    _lock()
    try:
        c = _load(); key = f"{fw}:{cls}"
        c["claimed"].pop(key, None); c["failed"][key] = {"t": time.time(), "reason": reason}; _save(c)
        print(f"failed {key}: {reason}")
    finally: _unlock()

def cmd_release(fw, cls):
    # release a stale claim without marking done/failed (e.g. worker crashed)
    _lock()
    try:
        c = _load(); c["claimed"].pop(f"{fw}:{cls}", None); _save(c); print("released")
    finally: _unlock()

def cmd_stats():
    c = _load(); cands = _candidates()
    print(f"claimed={len(c['claimed'])} done={len(c['done'])} failed={len(c['failed'])} available_leaves={len(cands)}")
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
    elif cmd == "next-shader": cmd_next_shader()
    elif cmd == "done": cmd_done(a[1], a[2])
    elif cmd == "fail": cmd_fail(a[1], a[2], " ".join(a[3:]))
    elif cmd == "release": cmd_release(a[1], a[2])
    else: cmd_stats()
