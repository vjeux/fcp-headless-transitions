#!/usr/bin/env python3
"""Differential oracle for
FFAudioSourceScope::DifferentFadeInOrOutInfo(FFAudioSourceScope const&) @Flexo 0xe6a090.

MUST run under `arch -x86_64 /usr/bin/python3`: the port cites x86_64 offsets and
the symbol is LOCAL (`t`), so the harness calls it BY ADDRESS at slide+0xe6a090
after preloading Flexo's @rpath chain depth-first (OPS_LOG 2026-08-10). An
address call against the arm64 slice would land in unrelated code and fail
silently toward VERIFIED, so the harness refuses to run unless the process is
x86_64 AND the bytes at the target match the transcribed prologue.

Body: al = 1; compare the u32 pairs at +0x80, +0x88, +0x84, +0x8c in THAT order;
any difference returns true early; the last one lands in al via `setne`.
"""
import ctypes, importlib.util, itertools, os, platform, random, re, struct, subprocess, sys

assert platform.machine() == 'x86_64', f"run under arch -x86_64, got {platform.machine()}"

FWDIR = "/Applications/Final Cut Pro.app/Contents/Frameworks"
TARGET = f"{FWDIR}/Flexo.framework/Versions/A/Flexo"
VMADDR = 0xe6a090
OFFSETS = (0x80, 0x88, 0x84, 0x8c)      # compared in this order by the body
OBJ = 0x100

_loaded = {}


def _deps(path):
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    res = []
    for line in out.splitlines()[1:]:
        m = re.match(r"\s+(\S+)\s+\(", line)
        if not m:
            continue
        p = m.group(1)
        if p.startswith("@rpath/"):
            p = os.path.join(FWDIR, p[len("@rpath/"):])
        if not p.startswith("@"):
            res.append(p)
    return res


def load(path=TARGET, depth=0):
    real = os.path.realpath(path)
    if real in _loaded or depth > 3:
        return _loaded.get(real)
    _loaded[real] = None
    for d in _deps(path):
        if os.path.exists(d) and os.path.realpath(d) != real:
            load(d, depth + 1)
    try:
        _loaded[real] = ctypes.CDLL(path, ctypes.RTLD_GLOBAL)
    except OSError:
        pass
    return _loaded[real]


assert load() is not None, "Flexo failed to load"
libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_uint64
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
slide = next(libc._dyld_get_image_vmaddr_slide(i)
             for i in range(libc._dyld_image_count())
             if libc._dyld_get_image_name(i).decode().endswith("/Flexo"))

addr = slide + VMADDR
head = ctypes.string_at(addr, 4)
assert head == bytes.fromhex("554889e5"), (
    f"code at 0x{addr:x} starts {head.hex()} — not the transcribed prologue")
print(f"slide=0x{slide:x} DifferentFadeInOrOutInfo@0x{addr:x}")

PROTO = ctypes.CFUNCTYPE(ctypes.c_uint8, ctypes.c_void_p, ctypes.c_void_p)
fn = PROTO(addr)

rng = random.Random(20260811)


def make_pair(vals_a, vals_b):
    """Two objects whose OTHER bytes are independently random — so a body that
       read any field but the four would disagree with the model almost always."""
    a = (ctypes.c_char * OBJ)()
    b = (ctypes.c_char * OBJ)()
    a.raw = bytes(rng.randrange(256) for _ in range(OBJ))
    b.raw = bytes(rng.randrange(256) for _ in range(OBJ))
    for off, v in zip(OFFSETS, vals_a):
        struct.pack_into("<I", a, off, v)
    for off, v in zip(OFFSETS, vals_b):
        struct.pack_into("<I", b, off, v)
    return a, b


def model(va, vb):
    """The TypeScript port: true when ANY of the four u32s differs."""
    # @0xe6a094/@0xe6a09c  +0x80 ; @0xe6a0a4  +0x88 ; @0xe6a0b2  +0x84 ; @0xe6a0c0 +0x8c
    for x, y in zip(va, vb):
        if x != y:
            return 1
    return 0


cases = div = true_n = 0

# --- A: all 16 match/differ patterns, repeated with fresh random noise --------
pool = [0, 1, 2, 0x7fffffff, 0x80000000, 0xffffffff]
for pattern in itertools.product((0, 1), repeat=4):
    for _ in range(40):
        va, vb = [], []
        for differs in pattern:
            x = rng.choice(pool) if rng.random() < 0.5 else rng.getrandbits(32)
            va.append(x)
            vb.append((x + rng.randrange(1, 1 << 32)) & 0xffffffff if differs else x)
        a, b = make_pair(va, vb)
        live = fn(ctypes.addressof(a), ctypes.addressof(b))
        want = model(va, vb)
        cases += 1
        true_n += live
        if live != want:
            div += 1
            if div < 6:
                print(f"DIVERGE pattern={pattern} va={va} vb={vb} live={live} want={want}")

# --- B: the same object compared with ITSELF must always be false -------------
for _ in range(200):
    a, _b = make_pair([rng.getrandbits(32) for _ in range(4)], [0] * 4)
    live = fn(ctypes.addressof(a), ctypes.addressof(a))
    cases += 1
    true_n += live
    if live != 0:
        div += 1
        print("DIVERGE self-comparison returned true")

# --- C: fully random pairs ----------------------------------------------------
for _ in range(600):
    va = [rng.choice(pool + [rng.getrandbits(32)]) for _ in range(4)]
    vb = [rng.choice(pool + [rng.getrandbits(32)]) for _ in range(4)]
    a, b = make_pair(va, vb)
    live = fn(ctypes.addressof(a), ctypes.addressof(b))
    want = model(va, vb)
    cases += 1
    true_n += live
    if live != want:
        div += 1
        if div < 6:
            print(f"DIVERGE va={va} vb={vb} live={live} want={want}")

# --- negative controls: WRONG models scored against the live answer -----------
neg = {"compares only the +0x80/+0x88 pair (the DifferentFadeInfo(true) half)": 0,
       "compares only the +0x84/+0x8c pair (the DifferentFadeInfo(false) half)": 0,
       "returns EQUAL-ness instead of DIFFERENT-ness (inverted)": 0,
       "compares the 64-bit lanes at +0x80/+0x88 instead of four u32s": 0}
NEG_N = 400
for _ in range(NEG_N):
    va = [rng.choice([0, 1, 7]) for _ in range(4)]
    vb = [v if rng.random() < 0.5 else (v + 1) & 0xffffffff for v in va]
    a, b = make_pair(va, vb)
    live = fn(ctypes.addressof(a), ctypes.addressof(b))
    if (1 if (va[0] != vb[0] or va[1] != vb[1]) else 0) != live:
        neg["compares only the +0x80/+0x88 pair (the DifferentFadeInfo(true) half)"] += 1
    if (1 if (va[2] != vb[2] or va[3] != vb[3]) else 0) != live:
        neg["compares only the +0x84/+0x8c pair (the DifferentFadeInfo(false) half)"] += 1
    if (1 - model(va, vb)) != live:
        neg["returns EQUAL-ness instead of DIFFERENT-ness (inverted)"] += 1
    qa = struct.unpack_from("<QQ", bytes(a), 0x80)
    qb = struct.unpack_from("<QQ", bytes(b), 0x80)
    if (1 if qa != qb else 0) != live:
        neg["compares the 64-bit lanes at +0x80/+0x88 instead of four u32s"] += 1

print(f"CASES={cases} DIVERGENCES={div}  (live said DIFFERENT in {true_n})")
print("negative controls (higher = the wrong port would have been caught):")
for k, v in neg.items():
    print(f"   {v:4d}/{NEG_N}  {k}")
print("ORACLE:", "VERIFIED" if div == 0 else "DIVERGED")
sys.exit(0 if div == 0 else 1)
