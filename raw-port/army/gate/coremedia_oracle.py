#!/usr/bin/env python3
"""coremedia_oracle.py — differential oracle: ported CMTime functions vs the REAL CoreMedia.

WHY THIS EXISTS
---------------
reviewer-02, after rejecting three PRs in one run:

    "The recurring theme: three of the four rejects were throw-free bodies that pass G0-G7 cleanly
     — the mechanical gate is structurally blind to a wrong model, and only the executable
     differential caught them."

Every gate we have reasons about the SHAPE of a port: does it cite an address (G1), typecheck (G2),
avoid an unreachable-throw stub (G5), delete nothing (G6), assert an index it shouldn't (G7). None
of them can tell whether the MODEL IS WRONG. A port can transcribe every instruction plausibly,
throw nowhere, and still return a different number than the machine.

The proof of that is already on main: `CMTimeMultiplyByFloat64` was merged and fails this oracle
**322/360** (issue #286), and `CMTimeMultiply` was rejected in #114 for the same reason at 622/910.
Meanwhile `oracle_map.json` had a `"CMTime": []` entry — the key existed with NO nodes, so G4 ran
nothing for the file.

These functions are the easiest possible oracle target and were going unchecked: CoreMedia is a
public system framework, dlsym-able with ctypes, and the calls are pure value -> value.

WHAT IT CHECKS
--------------
Every ported CoreMedia function against the live system implementation over a grid that
deliberately includes the two divergence classes reviewer-02 found (both re-confirmed here against
real CoreMedia before writing this):

  * NON-VALID input   CMTime(100,600,flags=0) x2  ->  real: (0, ts=0, flags=0)   [everything zeroed]
  * OVERFLOW          CMTime(2^62,600,flags=1) x4 ->  real: (INT64_MAX, ts=300, flags=3)
                                                       [CoreMedia REDUCES the timescale and sets
                                                        HasBeenRounded; it does not widen]

int64 fields cross the TS boundary as strings, because JSON numbers are doubles and would silently
lose exactly the high bits these overflow cases test.

USAGE
    coremedia_oracle.py <path-to-CMTime.ts>      exit 0 = match / not applicable, 2 = DIVERGED
"""
import ctypes, json, os, struct, subprocess, sys

CM_PATH = "/System/Library/Frameworks/CoreMedia.framework/CoreMedia"


class CMTime(ctypes.Structure):
    _fields_ = [("value", ctypes.c_int64), ("timescale", ctypes.c_int32),
                ("flags", ctypes.c_uint32), ("epoch", ctypes.c_int64)]


# (ts export, CoreMedia symbol, kind) — kind: "t_double" = (CMTime, double)->CMTime,
# "t_t" = (CMTime, CMTime)->CMTime, "t_secs" = (CMTime)->Float64
FUNCS = [
    ("CMTimeMultiplyByFloat64", "CMTimeMultiplyByFloat64", "t_double"),
    ("CMTimeAdd",               "CMTimeAdd",               "t_t"),
    ("CMTimeSubtract",          "CMTimeSubtract",          "t_t"),
    ("CMTimeGetSeconds",        "CMTimeGetSeconds",        "t_secs"),
]

VALID = 1
# Deliberately includes non-Valid flags, huge values (overflow), negatives and odd timescales.
TIMES = [
    (100, 600, VALID, 0), (0, 600, VALID, 0), (-100, 600, VALID, 0),
    (1, 1, VALID, 0), (600, 600, VALID, 0), (7, 3, VALID, 0),
    (100, 600, 0, 0),                      # non-Valid: the normalization class
    (100, 600, VALID, 5),                  # non-zero epoch
    (2**62, 600, VALID, 0),                # overflow: the timescale-reduction class
    (-(2**62), 600, VALID, 0),
    (2**31, 30000, VALID, 0),
]
MULTS = [0.0, 1.0, 2.0, -1.0, 0.5, 4.0, 1e6, -3.25]


def load_cm():
    cm = ctypes.CDLL(CM_PATH)
    cm.CMTimeMultiplyByFloat64.argtypes = [CMTime, ctypes.c_double]
    cm.CMTimeMultiplyByFloat64.restype = CMTime
    for n in ("CMTimeAdd", "CMTimeSubtract"):
        f = getattr(cm, n); f.argtypes = [CMTime, CMTime]; f.restype = CMTime
    cm.CMTimeGetSeconds.argtypes = [CMTime]; cm.CMTimeGetSeconds.restype = ctypes.c_double
    return cm


def d(t):
    return {"value": str(t[0]), "timescale": t[1], "flags": t[2], "epoch": str(t[3])}


def main():
    paths = [p for p in sys.argv[1:] if p.endswith(".ts")]
    tgt = next((p for p in paths if os.path.basename(p) == "CMTime.ts"), None)
    if not tgt:
        return 0
    # NOTE: do NOT os.path.exists() a system framework. Since the dyld shared cache, CoreMedia has
    # no on-disk file even though dlopen resolves it fine — an exists() check silently skips the
    # oracle on every modern macOS, which is precisely the "gate quietly does nothing" failure this
    # file exists to end. Probe by loading it.
    try:
        cm = load_cm()
    except OSError as e:
        print(f"  (CoreMedia unavailable: {e} — oracle skipped)"); return 0

    repo = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
    rawport = os.path.join(repo, "raw-port")
    worker = os.path.join(repo, "raw-port", "army", "gate", "coremedia_worker.ts")
    tsx = os.path.join(rawport, "node_modules", ".bin", "tsx")
    if not os.path.exists(tsx) or not os.path.exists(worker):
        print("  (tsx/worker unavailable — CoreMedia oracle skipped)"); return 0

    p = subprocess.Popen([tsx, worker], cwd=rawport, stdin=subprocess.PIPE,
                         stdout=subprocess.PIPE, text=True, bufsize=1)
    if (p.stdout.readline() or "").strip() != "READY":
        print("  (CoreMedia worker failed to start — skipped)")
        p.kill(); return 0

    def call(req):
        p.stdin.write(json.dumps(req) + "\n"); p.stdin.flush()
        try: return json.loads(p.stdout.readline() or "{}")
        except Exception: return {"ok": False, "error": "bad worker reply"}

    total = diverged = errors = 0
    samples = []
    for ts_fn, cm_fn, kind in FUNCS:
        for t in TIMES:
            args = MULTS if kind == "t_double" else (TIMES if kind == "t_t" else [None])
            for a in args:
                req = {"modulePath": os.path.abspath(tgt), "fn": ts_fn, "t": d(t)}
                if kind == "t_double": req["arg"] = a
                elif kind == "t_t":    req["b"] = d(a)
                got = call(req)
                total += 1
                if not got.get("ok"):
                    # A throw here is a hard failure: the real function returns a value.
                    errors += 1
                    if len(samples) < 6:
                        samples.append(f"{ts_fn}{t} -> THREW: {got.get('error','')[:80]}")
                    continue
                A = CMTime(t[0], t[1], t[2], t[3])
                if kind == "t_double":   R = cm.CMTimeMultiplyByFloat64(A, a)
                elif kind == "t_t":      R = getattr(cm, cm_fn)(A, CMTime(a[0], a[1], a[2], a[3]))
                else:                    R = getattr(cm, cm_fn)(A)
                if kind == "t_secs":
                    # The scalar arrives as `nbits`, the exact IEEE754 pattern, because JSON cannot
                    # carry NaN or +/-Infinity: `JSON.stringify(NaN)` is `null`, and reading that
                    # `null` as the port's answer made every non-finite case an unpassable
                    # divergence — and rewarded a port that returned a finite number where the
                    # framework returns NaN. `n` is only a fallback for an older worker.
                    if isinstance(got.get("nbits"), str):
                        have = struct.unpack("<d", bytes.fromhex(got["nbits"]))[0]
                    else:
                        have = got.get("n")
                    want = R
                    ok = (isinstance(have, (int, float)) and
                          (abs(have - want) <= 1e-12 * max(1.0, abs(want)) or
                           (have != have and want != want) or       # NaN == NaN
                           have == want))                           # +/-Infinity
                    desc = f"{want!r} vs {have!r}"
                else:
                    g = got.get("r", {})
                    want = (R.value, R.timescale, R.flags, R.epoch)
                    have = (int(g.get("value", 0)), int(g.get("timescale", 0)),
                            int(g.get("flags", 0)), int(g.get("epoch", 0)))
                    ok = want == have
                    desc = f"real={want} port={have}"
                if not ok:
                    diverged += 1
                    if len(samples) < 6:
                        extra = f" x{a}" if kind == "t_double" else ""
                        samples.append(f"{ts_fn}({t}){extra}: {desc}")
    p.stdin.close(); p.kill()

    for s in samples:
        print(f"    {s}")
    if diverged or errors:
        print(f"  CoreMedia ORACLE DIVERGENCE: {diverged} wrong + {errors} threw, of {total} calls "
              f"vs the live system framework")
        return 2
    print(f"  CoreMedia oracle: {total} calls bit-exact vs live CoreMedia ✅")
    return 0


if __name__ == "__main__":
    sys.exit(main())
