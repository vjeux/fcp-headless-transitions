#!/usr/bin/env python3
"""Differential oracle for videoanalysis::collation::box_t::dist(box_t const&) const @Flexo 0x1322200.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/box_t_dist_oracle.py

TWO OPS_LOG hazards apply to this one and both are handled here explicitly:

1. WRONG ARCHITECTURE. Every @0xADDR in the port is an x86_64 offset. A native arm64 process
   would call a different function at the same nominal address and fail silently TOWARD
   VERIFIED, so this script refuses to run unless platform.machine() == 'x86_64'.

2. LOCAL SYMBOL + BARE `nm`. `__ZNK13videoanalysis9collation5box_t4distERKS1_` is `nm` type `t`
   (local), so dlsym cannot see it: the address has to be computed as
   (x86_64 vmaddr) + (image slide). OPS_LOG's open entry records that `local_call.py::_vmaddr`
   uses a BARE `nm -n`, which reports the ARM64 slice even from a Rosetta process — producing an
   address inside the mapped x86_64 image that points at some OTHER function. This script passes
   `-arch x86_64` to `nm` for exactly that reason, and asserts the symbol it resolved is the one
   it wanted.

Flexo does load outside the app bundle once its @rpath dependencies are preloaded depth-first
(OPS_LOG, worker 1) — no DYLD_* variable can help, because /usr/bin/python3 is hardened.

Comparison is BIT-EXACT on the IEEE-754 payload (doubles cross the JSON boundary as hex bit
patterns, never as bare floats — json.dump would emit NaN/Infinity, which JSON.parse rejects).
"""
import ctypes
import ctypes.util
import glob
import json
import math
import os
import platform
import random
import struct
import subprocess
import sys

SYM = "__ZNK13videoanalysis9collation5box_t4distERKS1_"   # as `nm` prints it (leading _ kept)
BOX_SIZE = 0x58
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.path.join(REPO, "raw-port", "re", "oracle", "box_t_dist_driver.ts")


def fwdir():
    return glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]


def load_with_rpath(path, seen=None):
    seen = seen if seen is not None else set()
    real = os.path.realpath(path)
    if real in seen:
        return None
    seen.add(real)
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if dep.startswith("@rpath/"):
            cand = os.path.join(fwdir(), dep[len("@rpath/"):])
            if os.path.exists(cand):
                try:
                    load_with_rpath(cand, seen)
                except OSError:
                    pass
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


def x86_vmaddr(symbol, fw="Flexo"):
    """The symbol's vmaddr in the X86_64 slice.

    NOT from `nm` on the framework, for two independent reasons:
      * CORRECTNESS — a bare `nm` reports the ARM64 slice even from a Rosetta process (OPS_LOG),
        which would hand back an address pointing at some other function.
      * COST — `nm` on the 78 MB fat framework costs 60-120s and a full core, and the corp
        security stack rescans the file every time. raw-port/army/inventory/<FW>.syms.txt is the
        same data (x86_64, `<addr> <T|t> <mangled>`) in ~0.08s.

    That cache is gitignored, so it exists in the CANONICAL checkout but NOT in the pool worktree
    this script normally runs from (the same shape as OPS_LOG #16). Hence: try this tree, then
    the canonical checkout, and only then fall back to `nm` on the THIN x86_64 slice that
    disasm.sh leaves at /tmp/<FW>.x86_64 — never the fat original.
    """
    rel = os.path.join("raw-port", "army", "inventory", f"{fw}.syms.txt")
    for root in (REPO, os.path.expanduser("~/random/final-cut-pro-transitions")):
        path = os.path.join(root, rel)
        if os.path.exists(path):
            hits = [ln for ln in open(path) if ln.rstrip("\n").endswith(" " + symbol)]
            if len(hits) == 1:
                return int(hits[0].split()[0], 16)
            raise SystemExit(f"expected exactly one {symbol} in {path}, got {len(hits)}")
    thin = f"/tmp/{fw}.x86_64"
    if not os.path.exists(thin):
        raise SystemExit(f"no symbol cache and no thin slice {thin}; run "
                         f"raw-port/tools/disasm.sh once to produce it")
    out = subprocess.run(["nm", "-n", thin], capture_output=True, text=True).stdout
    hits = [ln for ln in out.splitlines() if ln.endswith(" " + symbol)]
    if len(hits) != 1:
        raise SystemExit(f"expected exactly one {symbol} in {thin}, got {len(hits)}")
    return int(hits[0].split()[0], 16)


def image_slide(substr):
    libc = ctypes.CDLL(None)
    libc._dyld_image_count.restype = ctypes.c_uint32
    libc._dyld_get_image_name.restype = ctypes.c_char_p
    libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
    libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_long
    libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
    for i in range(libc._dyld_image_count()):
        name = libc._dyld_get_image_name(i).decode()
        if substr in name:
            return libc._dyld_get_image_vmaddr_slide(i), name
    raise SystemExit(f"{substr} is not in the loaded image list")


def pack_box(box):
    b = (ctypes.c_char * BOX_SIZE)()
    ctypes.memset(ctypes.addressof(b), 0xEE, BOX_SIZE)      # poison the undecoded +0x20..+0x47
    struct.pack_into("<dddd", b, 0x00, box["x"], box["y"], box["w"], box["h"])
    struct.pack_into("<d", b, 0x48, box["sx"])
    struct.pack_into("<d", b, 0x50, box["sy"])
    return b


def build_cases():
    rng = random.Random(0x1322200)

    def rnd_box(kind):
        if kind == "int":
            x, y, w, h = (float(rng.randint(-50, 50)) for _ in range(4))
        elif kind == "frac":
            x, y = rng.uniform(-40, 40), rng.uniform(-40, 40)
            w, h = rng.uniform(-20, 20), rng.uniform(-20, 20)
        elif kind == "degenerate":
            x, y = rng.uniform(-10, 10), rng.uniform(-10, 10)
            w = rng.choice([0.0, -0.0, rng.uniform(-5, 5)])
            h = rng.choice([0.0, -0.0, rng.uniform(-5, 5)])
        else:  # tiny / huge magnitudes
            x, y = rng.choice([1e-8, 1e8, -1e8]) * rng.random(), rng.uniform(-1, 1)
            w, h = rng.choice([1e-8, 1e8]) * rng.random(), rng.uniform(0.1, 3)
        sx = rng.choice([1.0, 0.5, 2.0, 0.0, -1.0, rng.uniform(-3, 3)])
        sy = rng.choice([1.0, 0.5, 2.0, 0.0, -1.0, rng.uniform(-3, 3)])
        return {"x": x, "y": y, "w": w, "h": h, "sx": sx, "sy": sy}

    cases = []
    kinds = ["int", "frac", "degenerate", "extreme"]
    while len(cases) < 3584:
        k = kinds[len(cases) % 4]
        cases.append({"a": rnd_box(k), "b": rnd_box(k)})

    # 512 boundary pairs: B placed so a scaled edge lands EXACTLY on A's, which is where every
    # `jae`/`jbe` in the body flips (and where a >= vs > misread would hide).
    for _ in range(512):
        a = rnd_box("int")
        a["sx"], a["sy"] = 1.0, 1.0
        b = rnd_box("int")
        b["sx"], b["sy"] = 1.0, 1.0
        aMinX, aMaxX = min(a["x"], a["x"] + a["w"]), max(a["x"], a["x"] + a["w"])
        aMinY, aMaxY = min(a["y"], a["y"] + a["h"]), max(a["y"], a["y"] + a["h"])
        which = rng.randrange(4)
        b["w"], b["h"] = abs(b["w"]) + 1.0, abs(b["h"]) + 1.0
        if which == 0:      # B's max X exactly on A's min X
            b["x"] = aMinX - b["w"]
        elif which == 1:    # B's min X exactly on A's max X
            b["x"] = aMaxX
        elif which == 2:
            b["y"] = aMinY - b["h"]
        else:
            b["y"] = aMaxY
        cases.append({"a": a, "b": b})
    return cases


def bits(d):
    return struct.unpack("<Q", struct.pack("<d", d))[0]


def to_wire(cases):
    return [{k: {f: "%016x" % bits(v[f]) for f in ("x", "y", "w", "h", "sx", "sy")}
             for k, v in c.items()} for c in cases]


# --- python mirrors of the port, for the negative controls ----------------------------------
def cg_min(v, e):
    """CGRectGetMinX/MinY: the standardized origin (one rounding when the extent is negative)."""
    return v + e if e < 0 else v


def cg_max(v, e):
    """CGRectGetMaxX/MaxY: `(v + e) - e` when the extent is negative — TWO roundings, which is a
    different double from `max(v, v + e)` on 50 of this corpus's 8,198 rectangles."""
    return (v + e) - e if e < 0 else v + e


def axis_intersects(a_lo, a_hi, b_lo, b_hi):
    """One axis of CGRectIntersectsRect: half-open [lo, hi), a zero extent being the point {lo}."""
    a_pt, b_pt = a_lo == a_hi, b_lo == b_hi
    if a_pt and b_pt:
        return a_lo == b_lo
    if a_pt:
        return b_lo <= a_lo < b_hi
    if b_pt:
        return a_lo <= b_lo < a_hi
    return max(a_lo, b_lo) < min(a_hi, b_hi)


def intersects(a, b, scaled=False):
    ax, ay, aw, ah = a["x"], a["y"], a["w"], a["h"]
    bx, by, bw, bh = b["x"], b["y"], b["w"], b["h"]
    if scaled:
        ax, aw = ax * a["sx"], aw * a["sx"]
        ay, ah = ay * a["sy"], ah * a["sy"]
        bx, bw = bx * b["sx"], bw * b["sx"]
        by, bh = by * b["sy"], bh * b["sy"]
    # The live CGRectIntersectsRect is NOT "empty never intersects" and NOT a plain strict
    # overlap: each axis is the half-open [min, max), except a zero-extent axis which is the
    # single point {min}. Measured exact on 16,000 rect pairs; see the port's doc comment.
    return (axis_intersects(cg_min(ax, aw), cg_max(ax, aw), cg_min(bx, bw), cg_max(bx, bw))
            and axis_intersects(cg_min(ay, ah), cg_max(ay, ah), cg_min(by, bh), cg_max(by, bh)))


def model(a, b, variant="port"):
    if intersects(a, b, scaled=(variant == "scaled_intersect")):
        return 0.0
    sxa, sya = (a["sx"], a["sy"])
    sxb, syb = (b["sx"], b["sy"])
    if variant == "swapped_scales":
        sxa, sya, sxb, syb = b["sx"], b["sy"], a["sx"], a["sy"]
    aMinXs = cg_min(a["x"], a["w"]) * sxa
    aMaxXs = cg_max(a["x"], a["w"]) * sxa
    aMinYs = cg_min(a["y"], a["h"]) * sya
    aMaxYs = cg_max(a["y"], a["h"]) * sya
    bMinXs = cg_min(b["x"], b["w"]) * sxb
    bMaxXs = cg_max(b["x"], b["w"]) * sxb
    bMinYs = cg_min(b["y"], b["h"]) * syb
    bMaxYs = cg_max(b["y"], b["h"]) * syb

    def axis(v):
        if variant == "abs_axis":
            return abs(v)
        if variant == "sqrt_axis":
            return math.sqrt(v * v)
        return v

    if aMinXs >= bMaxXs:
        if aMinYs >= bMaxYs:
            dx, dy = aMinXs - bMaxXs, aMinYs - bMaxYs
            return math.sqrt(dx * dx + dy * dy)
        if bMinYs <= aMaxYs:
            return axis(aMinXs - bMaxXs)
        dx, dy = aMinXs - bMaxXs, aMaxYs - bMinYs
        return math.sqrt(dx * dx + dy * dy)
    if bMinXs <= aMaxXs:
        if aMinYs >= bMaxYs:
            return axis(aMinYs - bMaxYs)
        return axis(bMinYs - aMaxYs)
    if aMinYs >= bMaxYs:
        dx, dy = bMinXs - aMaxXs, aMinYs - bMaxYs
        return math.sqrt(dx * dx + dy * dy)
    if bMinYs <= aMaxYs:
        return axis(bMinXs - aMaxXs)
    dx, dy = bMinXs - aMaxXs, aMaxYs - bMinYs
    return math.sqrt(dx * dx + dy * dy)


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    flexo = os.path.join(fwdir(), "Flexo.framework", "Flexo")
    load_with_rpath(flexo)
    slide, name = image_slide("Flexo.framework")
    vmaddr = x86_vmaddr(SYM)
    addr = slide + vmaddr
    print(f"image={name}\n  x86_64 vmaddr=0x{vmaddr:x}  slide=0x{slide:x}  call=0x{addr:x}")
    if vmaddr != 0x1322200:
        raise SystemExit(f"unexpected vmaddr 0x{vmaddr:x}: the port cites @Flexo 0x1322200")
    fn = ctypes.CFUNCTYPE(ctypes.c_double, ctypes.c_void_p, ctypes.c_void_p)(addr)

    cases = build_cases()
    native = []
    for c in cases:
        ba, bb = pack_box(c["a"]), pack_box(c["b"])
        native.append(fn(ctypes.addressof(ba), ctypes.addressof(bb)))

    p = subprocess.run([os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx"), TS_DRIVER],
                       input=json.dumps(to_wire(cases)), capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"))
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    ts = [int(h, 16) for h in json.loads(p.stdout.strip().splitlines()[-1])]

    bad = [i for i in range(len(cases)) if bits(native[i]) != ts[i]]
    print(f"cases={len(cases)}  bit-exact matches={len(cases) - len(bad)}  divergences={len(bad)}")
    for i in bad[:8]:
        print(f"  case {i}: native={native[i]!r} (0x{bits(native[i]):016x})  "
              f"ts=0x{ts[i]:016x}\n    a={cases[i]['a']}\n    b={cases[i]['b']}")

    for variant, label in (("scaled_intersect", "intersection test applied to SCALED rects"),
                           ("abs_axis", "abs() on the single-axis result"),
                           ("swapped_scales", "each box scaled by the OTHER box's factors"),
                           ("sqrt_axis", "sqrt() on the single-axis paths")):
        n = sum(1 for i, c in enumerate(cases)
                if bits(model(c["a"], c["b"], variant)) != bits(native[i]))
        print(f"  NEGATIVE CONTROL {label}: {n} divergences")

    print("VERIFIED vs live Flexo (bit-exact)" if not bad else "DIVERGED")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
