#!/usr/bin/env python3
"""Differential oracle for OZBSplineInterpolator::operator== @ProChannel 0x41bc0.

Calls the REAL exported symbol in the shipping ProChannel.framework via dlsym and compares its
answer to the TypeScript port in raw-port/src/channels/OZBSplineInterpolator.ts, over a fuzz
corpus that deliberately hits every exit in the disassembly (order mismatch, each of the four
vector size mismatches, each element-wise mismatch, count mismatch, the empty-values TRUE exit,
and the all-equal TRUE exit) plus the NaN / +-0.0 cases the `ucomisd`+`jp` pair encodes.

MUST BE RUN UNDER ROSETTA:

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZBSplineInterpolator_operatorEquals_oracle.py

Every @0xADDR in the port is an offset in the **x86_64** slice (raw-port/tools/disasm.sh thins to
x86_64). A native arm64 process would dlopen the arm64 slice and compare the port against code it
did not transcribe — see OPS_LOG.md, "THE EXECUTABLE ORACLE CALLS THE WRONG ARCHITECTURE". This
script refuses to run when the process is not x86_64 rather than emitting a confident wrong verdict.

The object is synthesised directly: operator== touches nothing but six fields of `this`/`rhs`
(vtable slot +0x00 is never read, no callee is invoked), so a 0x78-byte buffer with real double
buffers hung off the begin/end pointer pairs is a complete, faithful stand-in for a live object.

    +0x08/+0x10  values  begin/end      +0x40/+0x48  knots  begin/end
    +0x20        count   (u32)          +0x58/+0x60  basis  begin/end
    +0x28/+0x30  weights begin/end      +0x70        order  (u32)

Doubles cross the Python/TS boundary as raw 64-bit hex bit patterns (json.dump would emit bare
NaN / Infinity, which JSON.parse rejects — OPS_LOG, "two traps"), so the comparison is bit-exact.
"""
import ctypes
import glob
import json
import os
import platform
import random
import struct
import subprocess
import sys

SYMBOL = "_ZN21OZBSplineInterpolatoreqERKS_"       # dlsym wants no leading underscore
OBJ_SIZE = 0x78
OFF = {
    "values": (0x08, 0x10),
    "weights": (0x28, 0x30),
    "knots": (0x40, 0x48),
    "basis": (0x58, 0x60),
}
OFF_COUNT = 0x20
OFF_ORDER = 0x70

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
# FCT_TS_DRIVER overrides the TS side — used to run a NEGATIVE CONTROL (a deliberately wrong
# comparator must DIVERGE, proving the corpus actually discriminates instead of agreeing by luck).
TS_DRIVER = os.environ.get("FCT_TS_DRIVER") or os.path.join(
    REPO, "raw-port", "re", "oracle", "OZBSplineInterpolator_operatorEquals_driver.ts")


def _fcp_frameworks_dir():
    hits = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")
    if not hits:
        raise SystemExit("Final Cut Pro.app not found")
    return hits[0]


def load_with_rpath(path, seen=None):
    """dlopen `path` after depth-first preloading its @rpath dependencies.

    `/usr/bin/python3` is hardened, so dyld strips DYLD_FRAMEWORK_PATH and the framework's
    @rpath references cannot be resolved that way (OPS_LOG, "Ozone AND Flexo *are* dlopen-able").
    What works with no env vars: load each @rpath dependency by ABSOLUTE path with RTLD_GLOBAL
    first — once an image with the right install name is in the process, dyld satisfies the
    @rpath reference from it. Missing/unloadable dependencies are skipped; a leaf value call
    does not need lazily-bound symbols.
    """
    seen = seen if seen is not None else set()
    real = os.path.realpath(path)
    if real in seen:
        return None
    seen.add(real)
    fwdir = _fcp_frameworks_dir()
    try:
        out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                             capture_output=True, text=True).stdout
    except OSError:
        out = ""
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if not dep.startswith("@rpath/"):
            continue
        cand = os.path.join(fwdir, dep[len("@rpath/"):])
        if os.path.exists(cand):
            try:
                load_with_rpath(cand, seen)
            except OSError:
                pass                       # a missing/unloadable dep is not fatal for a leaf call
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


def find_prochannel():
    pats = ["/Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/ProChannel",
            "/Applications/Final*Cut*Pro.app/Contents/Frameworks/ProChannel.framework/ProChannel"]
    for p in pats:
        hits = glob.glob(p)
        if hits:
            return hits[0]
    raise SystemExit("ProChannel.framework not found — this oracle needs Final Cut Pro installed")


# ── fuzz corpus ───────────────────────────────────────────────────────────────────────────
POOL = [0.0, -0.0, 1.0, -1.0, 0.5, 3.25, -7.75, 1e-7, 1e300, -1e300,
        float("inf"), float("-inf"), float("nan")]


def rand_vec(rng, n):
    return [rng.choice(POOL) if rng.random() < 0.45 else rng.uniform(-100, 100) for _ in range(n)]


def rand_state(rng):
    return {
        "values": rand_vec(rng, rng.randint(0, 5)),
        "weights": rand_vec(rng, rng.randint(0, 5)),
        "knots": rand_vec(rng, rng.randint(0, 6)),
        "basis": rand_vec(rng, rng.randint(0, 5)),
        "count": rng.randint(0, 6),
        "order": rng.randint(0, 5),
    }


def mutate(rng, s):
    """Perturb one field so the corpus covers every early-exit branch, not just 'all equal'."""
    t = {k: (list(v) if isinstance(v, list) else v) for k, v in s.items()}
    what = rng.choice(["order", "count", "values", "weights", "knots", "basis",
                       "len_values", "len_weights", "len_knots", "len_basis"])
    if what == "order":
        t["order"] = (t["order"] + rng.randint(1, 3)) & 0xFFFFFFFF
    elif what == "count":
        t["count"] = (t["count"] + rng.randint(1, 3)) & 0xFFFFFFFF
    elif what.startswith("len_"):
        f = what[4:]
        if rng.random() < 0.5 or not t[f]:
            t[f] = t[f] + [rng.uniform(-5, 5)]
        else:
            t[f] = t[f][:-1]
    else:
        f = what
        if t[f]:
            i = rng.randrange(len(t[f]))
            t[f][i] = rng.choice(POOL) if rng.random() < 0.5 else t[f][i] + 1.0
    return t


def build_corpus(n, seed=0x5B5B):
    rng = random.Random(seed)
    cases = []
    # hand-written edge cases first: every structural exit + the NaN / signed-zero semantics
    empty = {"values": [], "weights": [], "knots": [], "basis": [], "count": 0, "order": 0}
    cases.append((empty, dict(empty)))                                     # all empty -> TRUE
    cases.append(({**empty, "knots": [1.0]}, {**empty, "knots": [1.0]}))   # empty values -> TRUE
    nanv = {"values": [float("nan")], "weights": [], "knots": [], "basis": [], "count": 0, "order": 0}
    cases.append((nanv, {k: (list(v) if isinstance(v, list) else v) for k, v in nanv.items()}))
    nank = {"values": [], "weights": [], "knots": [float("nan")], "basis": [], "count": 0, "order": 0}
    cases.append((nank, {k: (list(v) if isinstance(v, list) else v) for k, v in nank.items()}))
    zpos = {"values": [0.0], "weights": [], "knots": [], "basis": [], "count": 0, "order": 0}
    zneg = {"values": [-0.0], "weights": [], "knots": [], "basis": [], "count": 0, "order": 0}
    cases.append((zpos, zneg))                                             # +0 vs -0 -> TRUE
    cases.append(({**zpos, "knots": [0.0]}, {**zpos, "knots": [-0.0]}))    # +0 vs -0 in knots
    while len(cases) < n:
        a = rand_state(rng)
        r = rng.random()
        if r < 0.30:
            b = {k: (list(v) if isinstance(v, list) else v) for k, v in a.items()}   # identical
        elif r < 0.85:
            b = mutate(rng, a)
        else:
            b = rand_state(rng)
        cases.append((a, b))
    return cases


# ── native side ───────────────────────────────────────────────────────────────────────────
def make_obj(state, keep):
    """Return (buffer, [backing arrays]) for one synthetic OZBSplineInterpolator."""
    buf = ctypes.create_string_buffer(OBJ_SIZE)
    base = ctypes.addressof(buf)
    for field, (b_off, e_off) in OFF.items():
        vals = state[field]
        arr = (ctypes.c_double * max(len(vals), 1))()
        for i, v in enumerate(vals):
            arr[i] = v
        keep.append(arr)
        begin = ctypes.addressof(arr)
        struct.pack_into("<Q", buf, b_off, begin)
        struct.pack_into("<Q", buf, e_off, begin + 8 * len(vals))
    struct.pack_into("<I", buf, OFF_COUNT, state["count"] & 0xFFFFFFFF)
    struct.pack_into("<I", buf, OFF_ORDER, state["order"] & 0xFFFFFFFF)
    keep.append(buf)
    return base


def run_native(cases):
    if platform.machine() != "x86_64":
        raise SystemExit(
            f"REFUSING TO RUN: process is {platform.machine()}, but every @0xADDR in the port is an "
            "x86_64 offset. Re-run as: arch -x86_64 /usr/bin/python3 " + os.path.relpath(__file__, REPO))
    lib = load_with_rpath(find_prochannel())
    fn = getattr(lib, SYMBOL)
    fn.restype = ctypes.c_bool
    fn.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
    out = []
    for a, b in cases:
        keep = []
        pa = make_obj(a, keep)
        pb = make_obj(b, keep)
        out.append(bool(fn(pa, pb)))
    return out


# ── TS side ───────────────────────────────────────────────────────────────────────────────
def bits(x):
    return "%016x" % struct.unpack("<Q", struct.pack("<d", x))[0]


def enc(state):
    return {
        "values": [bits(v) for v in state["values"]],
        "weights": [bits(v) for v in state["weights"]],
        "knots": [bits(v) for v in state["knots"]],
        "basis": [bits(v) for v in state["basis"]],
        "count": state["count"],
        "order": state["order"],
    }


def run_ts(cases):
    payload = json.dumps([[enc(a), enc(b)] for a, b in cases])
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    p = subprocess.run([tsx, TS_DRIVER], input=payload, capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"))
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return json.loads(p.stdout.strip().splitlines()[-1])


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 1200
    cases = build_corpus(n)
    native = run_native(cases)
    ts = run_ts(cases)
    assert len(native) == len(ts) == len(cases)
    bad = [(i, native[i], ts[i]) for i in range(len(cases)) if native[i] != ts[i]]
    ntrue = sum(1 for v in native if v)
    print(f"cases={len(cases)}  native TRUE={ntrue}  native FALSE={len(cases) - ntrue}  "
          f"divergences={len(bad)}")
    for i, nv, tv in bad[:10]:
        print(f"  case {i}: native={nv} ts={tv}\n    a={cases[i][0]}\n    b={cases[i][1]}")
    print("VERIFIED bit-exact vs live ProChannel" if not bad else "DIVERGED")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
