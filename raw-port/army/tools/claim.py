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

BAD_TOK = ['Cache','Hash','Tree','Alloc','Iterator','Impl','CFRef','_UIComponent','Controller',
           'Overlay','HUD','Inspector','Tool','Cell','Button','Picker','View','Window','Menu',
           'Panel','Dialog','Sentry','__cxx',
           # ObjC-facade / plumbing families (blocked on H1 consumer wiring or pure I/O plumbing,
           # no decodable math). Demote so pure-math leaves (PC*/OZChannel*/OZCurve*/HG* LUT) sort
           # first and workers don't burn their skip budget on the FF* facade wall (2026-07-28).
           'Undo','RenderJob','Arbiter','PlaybackUnit','Assistant','Instrument','Queue','Pool',
           'IQA','Callback','LockBase','MachPort','DeviceArbiter','BufferQueue','Playback',
           'Device','Session','Listener','Observer','Delegate','Proxy','Manager','Scheduler',
           'Dispatcher','Registry','Coordinator','Monitor','Adapter','Handler']
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

def _is_shader_facade(ms):
    """True iff a class is a bare GPU-shader RenderTile facade (math lives in the Metal shader
    source, NOT in the C++ body — GetProgram/BindTexture/RenderTile plumbing only). Detected by
    METHOD SIGNATURE, not name prefix, so genuine HG* color math (HGColorMatrix/HGGamma — which
    have SetParameter/GetOutput/matrix ops and NONE of these) is never wrongly demoted. These
    stay claimable (full-engine scope) but sort BELOW all real-math leaves so math workers don't
    burn their whole session churning the ~130-deep Hgc* facade wall (2026-07-29)."""
    names = set(k.split('@', 1)[0] for k in ms.keys())
    has_rendertile = 'RenderTile' in names or 'RenderTile_AVX' in names
    has_prog = bool(names & {'GetProgram', 'BindTexture', 'InitProgramDescriptor', 'shaderDescription'})
    return has_rendertile and has_prog

def _class_methods(fw, cls):
    """Ordered (methkey, unit) list for a class, stable by ledger insertion (addr) order."""
    led = json.load(open(os.path.join(LED, f"{fw}.ledger.json")))
    ms = led.get(cls, {})
    return [(k, v) for k, v in ms.items()]

# Pure-math demangled-method signatures — RARE in plumbing, common in real numeric classes.
# Used to PROMOTE (never demote) classes with >=2 distinct signals to tier -1 so math workers
# reach real leaves first, past the small n=7 non-shader plumbing that dodges BAD_TOK (2026-07-29).
MATH_SIG = ("MultMatrix","LoadMatrix","LoadIdentity","PostMultMatrix","determinant",
    "invert","Interpolat","interpolat","evalXSpline","evalBSpline","Bezier","BSpline",
    "Quaternion","crossProduct","dotProduct","SetCoefficient","GetCoefficient",
    "convolve","Convolution","solveNode","getValueAsDouble","superEllipse","calcSnap",
    "Gradient","Catmull","EaseIn","EaseOut","Logarithmic","SampledContour","perspective",
    "homography","Vec3","Vec4","PCVector","PCMatrix","toLinear","fromLinear",
    "OETF","EOTF","OOTF")
def _math_signals(ms):
    # Only count signals from C++ methods — ObjC selectors (e.g. a retiming UI module whose
    # selector name contains "Interpolate"/"Bezier") are incidental and must not promote.
    hits=set()
    for v in ms.values():
        if not isinstance(v,dict): continue
        if v.get("kind")!="cpp": continue
        nm=v.get("demangled","")
        for t in MATH_SIG:
            if t in nm: hits.add(t)
    return len(hits)

def _candidates():
    """Portable work units (fw, cls, nMethods, chunk_or_None), best-first.
    FULL-ENGINE scope (ARMY.md §1): dispense the ENTIRE inventory. ANTI-SHORTCUT: any class with
    > CHUNK_THRESHOLD methods is emitted as MULTIPLE chunk units of CHUNK methods each — never as one
    giant unit — so no agent is asked to port 100s-1000s of methods in one sitting (the thing that
    forces stub-to-finish shortcuts). Small classes stay whole. Ordering = tier then size."""
    done = _ported_files()
    out = []
    for f in sorted(glob.glob(os.path.join(LED, "*.ledger.json"))):
        fw = os.path.basename(f).split(".")[0]
        if fw == "shaders": continue
        try: led = json.load(open(f))
        except Exception: continue
        for cls, ms in led.items():
            if cls in SHARED or cls == "(free)": continue
            if any(b in cls for b in BAD_SUB): continue
            if not all(isinstance(v, dict) for v in ms.values()): continue
            n = len(ms); todo = sum(1 for v in ms.values() if v.get("status") != "ported")
            if todo == 0: continue
            objc = sum(1 for v in ms.values() if v.get("kind") == "objc")
            is_facade = _is_shader_facade(ms)
            heavy_tok = any(t in cls for t in BAD_TOK) or is_facade
            if n > CHUNK_THRESHOLD:
                # split into chunks; each chunk is its own unit. Whole-class .ts skip check doesn't
                # apply (parts are <Class>.m<k>.ts), so emit every chunk not yet on disk.
                nchunks = (n + CHUNK - 1) // CHUNK
                for k in range(nchunks):
                    if f"{cls}.m{k}" in done: continue
                    tier = 5 if is_facade else 3  # facade chunks last; real chunks after small wins
                    if not is_facade and objc <= n // 2 and _math_signals(ms) >= 2: tier = min(tier, 2)
                    out.append((tier, CHUNK, fw, cls, k))
            else:
                if cls in done: continue
                # tier 0 small-clean-math > 1 normal-math > 2 objc-heavy > 4 shader-facade (last).
                # Shader facades (GetProgram+RenderTile signature) demote BELOW all real-math whole
                # classes so math workers reach OZ/PC/OZChannel leaves without churning the
                # ~130-deep Helium Hgc* facade wall (2026-07-29).
                if is_facade: tier = 4
                elif 2 <= n <= 12 and objc == 0 and not heavy_tok: tier = 0
                elif objc > n // 2: tier = 2
                else: tier = 1
                # PROMOTE-ONLY math-signal tiers (never demote; min with current tier). Guards:
                # not a shader-facade, not objc-dominant, not heavy_tok (BAD_TOK). BAD_SUB already
                # strips std::/thunk/_Factory/anonymous noise upstream, so signals here are real.
                #   >=2 distinct MATH_SIG cpp-method names  -> tier -1 (strong: interpolators,
                #     matrices, HGColorMatrix, etc. lead the queue).
                #   ==1 distinct MATH_SIG (guarded)         -> tier 0 (single-signal math like
                #     OZBehaviorCurveNode/OZCompoundChannel/OZInterpolator/PCQuat/OZ360Camera/HGGradient
                #     surfaces ABOVE the n=7 non-shader plumbing but below strong 2-signal math).
                #     Validated 2026-07-29: 30 genuine math classes surfaced, 0 facade/STL false-pos
                #     (BAD_SUB+BAD_TOK+shader-facade+objc guards catch SequenceFolder/_UIComponent/etc).
                if not is_facade and objc <= n // 2 and not heavy_tok:
                    msig = _math_signals(ms)
                    # single-signal math -> tier -1 (ABOVE the tier-0 n=7 non-shader plumbing that
                    # dodges BAD_TOK — the churn 2 workers hit); strong 2-signal -> tier -2 (leads).
                    if msig >= 2: tier = min(tier, -2)
                    elif msig == 1: tier = min(tier, -1)
                out.append((tier, n, fw, cls, None))
    out.sort()
    return [(n, fw, cls, ck) for (tier, n, fw, cls, ck) in out]

def cmd_next():
    _lock()
    try:
        c = _load()
        leased = set(c["claimed"]) | set(c["done"])
        skip = leased | set(c["failed"])
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
        if key in c["failed"]:  print(f"ALREADY-FAILED {key} (use release to reclaim)"); return
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
    _lock()
    try:
        c = _load(); key = _key(fw, cls, ck)
        c["claimed"].pop(key, None); c["failed"][key] = {"t": time.time(), "reason": reason}; _save(c)
        print(f"failed {key}: {reason}")
    finally: _unlock()

def cmd_release(fw, cls, ck=None):
    _lock()
    try:
        c = _load(); c["claimed"].pop(_key(fw, cls, ck), None); _save(c); print("released")
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
    elif cmd == "claim": cmd_claim(a[1], a[2], a[3] if len(a) >= 4 and a[3].isdigit() else None)
    elif cmd == "next-shader": cmd_next_shader()
    elif cmd == "chunk": cmd_chunk(a[1], a[2], a[3])
    elif cmd == "done": cmd_done(*a[1:])
    elif cmd == "fail":
        # done/fail/release accept optional trailing chunk index: done <fw> <cls> [chunk]
        if len(a) >= 4 and a[-1].isdigit(): cmd_fail(a[1], a[2], " ".join(a[3:-1]) or "n/a", a[-1])
        else: cmd_fail(a[1], a[2], " ".join(a[3:]))
    elif cmd == "release": cmd_release(*a[1:])
    else: cmd_stats()
