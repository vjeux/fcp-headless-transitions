#!/usr/bin/env python3
"""End-to-end differential: the LIVE ProCore symbol vs the actual TYPESCRIPT
port (not a Python re-model) for PCSolveQuadratic @ProCore 0xc0582.

    arch -x86_64 /usr/bin/python3 PCSolveQuadratic_oracle_ts.py

Run from anywhere inside a worktree; it locates raw-port/ from its own path and
drives raw-port/re/oracle/PCSolveQuadratic_driver.ts through the checked-in
node_modules/.bin/tsx. Doubles cross as hex bit patterns (JSON.parse rejects
bare NaN/Infinity — OPS_LOG), so the comparison is bit-exact.

The Python-model harness next door (PCSolveQuadratic_oracle.py) proves the
transcription against 4,022 cases; THIS one closes the last gap by running the
shipped TypeScript itself.
"""
import ctypes, json, math, os, platform, random, struct, subprocess, sys

assert platform.machine() == 'x86_64', f"run under arch -x86_64, got {platform.machine()}"

HERE = os.path.dirname(os.path.abspath(__file__))
RAWPORT = os.path.dirname(os.path.dirname(HERE))          # .../raw-port
TSX = os.path.join(RAWPORT, "node_modules", ".bin", "tsx")
DRIVER = os.path.join(HERE, "PCSolveQuadratic_driver.ts")

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore"
lib = ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
fn = getattr(lib, "_Z16PCSolveQuadraticdddPiPd")
fn.restype = None
fn.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double,
               ctypes.POINTER(ctypes.c_int32), ctypes.c_void_p]

POISON = 0x7ff8dead0000beef


def bits(x):
    return struct.unpack("<Q", struct.pack("<d", x))[0]


def call_live(a, b, c):
    cnt = ctypes.c_int32(-12345)
    roots = (ctypes.c_uint64 * 4)(POISON, POISON, POISON, POISON)
    fn(a, b, c, ctypes.byref(cnt), ctypes.cast(roots, ctypes.c_void_p))
    return cnt.value, [roots[0], roots[1]]


rng = random.Random(20260811)
cases = []
vals = [0.0, -0.0, 1.0, -1.0, 1e-7, -1e-7, 1e-8, 1e300, 1e-300, math.pi,
        float("inf"), float("-inf"), float("nan"), 5e-324]
for _ in range(700):
    r1 = rng.uniform(-500, 500)
    r2 = r1 if rng.random() < 0.3 else rng.uniform(-500, 500)
    a = rng.choice([1.0, -1.0, 0.5, 3.25, 1e-3])
    cases.append((a, -a * (r1 + r2), a * r1 * r2))
for a in vals:
    for b in vals:
        cases.append((a, b, rng.choice(vals)))
for _ in range(300):
    cases.append(tuple(struct.unpack("<d", struct.pack("<Q", rng.getrandbits(64)))[0]
                       for _ in range(3)))

payload = json.dumps([[f"{bits(a):016x}", f"{bits(b):016x}", f"{bits(c):016x}"]
                      for a, b, c in cases])
res = subprocess.run([TSX, DRIVER], input=payload, capture_output=True, text=True,
                     cwd=RAWPORT)
if res.returncode != 0:
    print(res.stderr[-2000:])
    sys.exit(2)
ts = json.loads(res.stdout)

div = nan_only = 0
counts = {}
for (a, b, c), got in zip(cases, ts):
    live_count, live_roots = call_live(a, b, c)
    counts[live_count] = counts.get(live_count, 0) + 1
    if got["count"] != live_count:
        div += 1
        if div < 6:
            print(f"DIVERGE count a={a!r} b={b!r} c={c!r}: ts={got['count']} live={live_count}")
        continue
    for i, h in enumerate(got["roots"]):
        tsw = int(h, 16)
        if tsw != live_roots[i]:
            tsf = struct.unpack("<d", struct.pack("<Q", tsw))[0]
            lvf = struct.unpack("<d", struct.pack("<Q", live_roots[i]))[0]
            if tsf != tsf and lvf != lvf:
                nan_only += 1          # NaN payload bits are not the contract
                continue
            div += 1
            if div < 6:
                print(f"DIVERGE root{i} a={a!r} b={b!r} c={c!r}: "
                      f"ts={tsf!r} ({tsw:#018x}) live={lvf!r} ({live_roots[i]:#018x})")
    # slots the machine did not write must not be claimed by the port either
    if len(got["roots"]) < 2 and live_roots[1] != POISON:
        div += 1
        print(f"DIVERGE the live call wrote a second root the port did not: a={a!r}")

print(f"CASES={len(cases)} DIVERGENCES={div}  counts: {counts}"
      f"  (NaN-payload-only, not counted: {nan_only})")
print("TS-vs-LIVE ORACLE:", "VERIFIED" if div == 0 else "DIVERGED")
sys.exit(0 if div == 0 else 1)
