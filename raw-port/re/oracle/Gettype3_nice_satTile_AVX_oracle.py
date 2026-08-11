#!/usr/bin/env python3
"""Differential oracle for Gettype3_nice_satTile_AVX @Helium 0x279470.

Runs the REAL kernel out of the shipping Helium.framework over randomized tiles and State blocks
and compares its output plane, bit for bit, with the TypeScript port in
raw-port/src/render/Gettype3_nice_satTile_AVX.ts.

MUST BE RUN UNDER ROSETTA:

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/Gettype3_nice_satTile_AVX_oracle.py

Two reasons, both load-bearing:
  * every `@0xADDR` in the port is an offset in the x86_64 slice, and a native arm64 process would
    compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls the
    wrong architecture" — it fails silently toward VERIFIED);
  * the kernel is AVX, and the arm64 slice has no such function at all.
AVX code DOES execute under Rosetta, so this is a real execution test, not a static one.

The symbol is FILE-LOCAL (`nm` class `t`), so dlsym cannot see it: the address is resolved as
`nm -arch x86_64` vmaddr + the loaded image's slide, which is also the correct way to avoid the
`_vmaddr` bug in fct/parity/local_call.py (a bare `nm -n` reports ARM64 addresses even under
Rosetta).
"""
import ctypes
import ctypes.util
import glob
import json
import os
import platform
import random
import struct
import subprocess

# A driver that does not terminate is a mutant that was KILLED, not a pending result: two of them
# held a core for 2h31m before anyone noticed. See re/oracle/oracle_driver.py for the full account.
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
import sys

FW_NAME = "Helium"
SYM = "__ZL25Gettype3_nice_satTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode"

STATE_BYTES = 0x1000          # the kernel reads up to +0x960; allocate a page, 32B-aligned
TILE_BYTES = 0x80             # fields at +0x00..+0x58

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.environ.get("FCT_TS_DRIVER") or os.path.join(
    REPO, "raw-port", "re", "oracle", "Gettype3_nice_satTile_AVX_driver.ts")


# ── loading the framework and finding a file-local function ───────────────────────────────
def fcp_frameworks_dir():
    hits = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")
    if not hits:
        raise SystemExit("Final Cut Pro.app not found — this oracle needs FCP installed")
    return hits[0]


def framework_path(name):
    return os.path.join(fcp_frameworks_dir(), f"{name}.framework", name)


def load_with_rpath(path, seen=None):
    """dlopen `path` after depth-first preloading its @rpath dependencies by absolute path."""
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
            cand = os.path.join(fcp_frameworks_dir(), dep[len("@rpath/"):])
            if os.path.exists(cand):
                try:
                    load_with_rpath(cand, seen)
                except OSError:
                    pass
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


def symbol_vmaddr(path, sym):
    """x86_64 vmaddr of `sym` — `-arch x86_64` is REQUIRED (a bare nm reports the arm64 slice)."""
    out = subprocess.run(["nm", "-arch", "x86_64", path], capture_output=True, text=True).stdout
    for line in out.splitlines():
        parts = line.split()
        if len(parts) == 3 and parts[2] == sym:
            return int(parts[0], 16)
    raise SystemExit(f"symbol {sym} not found in the x86_64 slice of {path}")


def image_slide(path):
    libc = ctypes.CDLL(ctypes.util.find_library("System"), use_errno=True)
    libc._dyld_image_count.restype = ctypes.c_uint32
    libc._dyld_get_image_name.restype = ctypes.c_char_p
    libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
    libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
    libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
    target = os.path.realpath(path)
    for i in range(libc._dyld_image_count()):
        name = libc._dyld_get_image_name(i).decode()
        if os.path.realpath(name) == target:
            return int(libc._dyld_get_image_vmaddr_slide(i) or 0)
    raise SystemExit(f"{path} is not in the loaded image list")


def aligned_buffer(nbytes, align=32):
    raw = ctypes.create_string_buffer(nbytes + align)
    addr = ctypes.addressof(raw)
    off = (-addr) % align
    return raw, addr + off, off


# ── corpus ────────────────────────────────────────────────────────────────────────────────
# A "realistic" State: the constants an sRGB-ish tone curve would carry, in the slots the decode
# assigns them. The differential does not depend on these being FCP's true values (both sides read
# the same bytes) — they just keep the arithmetic in a sane range so the comparison is meaningful.
def realistic_state(rng):
    st = bytearray(STATE_BYTES)

    def put_f(off, v):
        struct.pack_into("<f", st, off, v)

    def put_vec(off, v):
        for l in range(8):
            struct.pack_into("<f", st, off + 4 * l, v)

    def put_bits(off, u):
        for l in range(8):
            struct.pack_into("<I", st, off + 4 * l, u)

    put_f(0x00, rng.choice([2.4, 1 / 2.2, 1.0, 0.0]))        # gamma
    put_f(0x04, 0.055)                                       # pre-offset
    put_f(0x0c, 1.055)                                       # post-scale
    put_f(0x20, 12.92)                                       # linear slope
    put_f(0x24, 0.0031308)                                   # linear threshold
    put_bits(0x80, 0x00000000)                               # rcp OR pattern
    put_vec(0xa0, 1.0)                                       # one / upper clamp
    put_bits(0x1e0, 0xffffffff)                              # rcp AND mask
    put_vec(0x200, 1.1754944e-38)                            # alpha floor (FLT_MIN)
    put_vec(0x220, 1.0)                                      # rcp fixup
    put_bits(0x240, 0x007fffff)                              # mantissa mask
    put_vec(0x260, 0.0)                                      # log cutoff
    put_vec(0x280, 1.0)                                      # cutoff adjustment
    put_vec(0x2a0, 127.0)                                    # exponent bias
    put_vec(0x2c0, 1.4142135)                                # mantissa split (sqrt 2)
    put_vec(0x2e0, 0.5)                                      # split scale
    put_vec(0x380, -127.0)                                   # exp floor
    for l in range(4):                                       # integer exponent bias
        struct.pack_into("<i", st, 0x400 + 4 * l, 127)
    for off, v in ((0x460, 0.07037683), (0x480, -0.1151461), (0x4a0, 0.1920599),
                   (0x4c0, -0.2401073), (0x4e0, 0.4998722), (0x500, -0.7213476),
                   (0x520, 1.4426950)):
        put_vec(off, v)
    for off, v in ((0x540, 0.0001530), (0x560, 0.0013422), (0x580, 0.0096181),
                   (0x5a0, 0.0555041), (0x5c0, 0.2402265)):
        put_vec(off, v)
    put_vec(0x940, 0.0)                                      # zero / lower clamp
    return st


def random_state(rng, base):
    """Perturb the interesting slots — the port must be right for ANY State, not a tuned one."""
    st = bytearray(base)
    for off in (0x00, 0x04, 0x0c, 0x20, 0x24):
        struct.pack_into("<f", st, off, rng.uniform(-3, 3))
    for off in (0xa0, 0x200, 0x220, 0x260, 0x280, 0x2a0, 0x2c0, 0x2e0, 0x380, 0x940,
                0x460, 0x480, 0x4a0, 0x4c0, 0x4e0, 0x500, 0x520,
                0x540, 0x560, 0x580, 0x5a0, 0x5c0):
        for l in range(8):
            struct.pack_into("<f", st, off + 4 * l, rng.uniform(-2, 2))
    return st


PIXEL_POOL = [0.0, -0.0, 1.0, -1.0, 0.5, 255.0, 1e-30, -1e-30, 1e30, 65504.0,
              float("inf"), float("-inf")]


def random_plane(rng, n, allow_nan):
    out = []
    for _ in range(n):
        r = rng.random()
        if r < 0.25:
            out.append(rng.choice(PIXEL_POOL))
        elif allow_nan and r < 0.28:
            out.append(float("nan"))
        else:
            out.append(rng.uniform(-2.0, 2.0))
    return out


def build_cases(n, seed=0xA5A5):
    rng = random.Random(seed)
    base = realistic_state(rng)
    cases = []
    # deliberate edge shapes first: zero/negative extents, width 1 (tail only), width 2/3
    # (pair + tail), a multi-row tile with a stride wider than the tile.
    shapes = [(0, 0, 0, 0), (4, 0, 4, 0), (1, 1, 1, 1), (2, 1, 2, 1), (3, 1, 3, 1),
              (3, 2, 5, 2), (8, 3, 8, 3), (7, 4, 9, 4), (5, 1, 5, 1), (2, 2, 2, 2)]
    for (w, h, sw, sh) in shapes:
        cases.append((w, h, max(sw, w), max(sh, h), realistic_state(rng), True))
    while len(cases) < n:
        w = rng.randint(0, 9)
        h = rng.randint(0, 4)
        stride = w + rng.choice([0, 0, 1, 3])
        st = base if rng.random() < 0.5 else random_state(rng, base)
        cases.append((w, h, max(stride, w), h, st, rng.random() < 0.5))
    return cases


# ── native side ───────────────────────────────────────────────────────────────────────────
def run_native(cases, fn):
    results = []
    for (w, h, stride, _sh, st, allow_nan) in cases:
        rng = random.Random(hash((w, h, stride, bytes(st[:64]), allow_nan)) & 0xFFFFFFFF)
        n_tex = max(stride * max(h, 1), 1)
        src = random_plane(rng, n_tex * 4, allow_nan)

        state_raw, state_addr, _ = aligned_buffer(STATE_BYTES)
        ctypes.memmove(state_addr, bytes(st), STATE_BYTES)
        in_raw, in_addr, _ = aligned_buffer(n_tex * 16)
        out_raw, out_addr, _ = aligned_buffer(n_tex * 16)
        struct.pack_into("<%df" % (n_tex * 4), (ctypes.c_char * (n_tex * 16)).from_address(in_addr),
                         0, *src)
        # the destination starts as a recognisable pattern so untouched texels are visible
        struct.pack_into("<%df" % (n_tex * 4),
                         (ctypes.c_char * (n_tex * 16)).from_address(out_addr), 0,
                         *([-777.0] * (n_tex * 4)))

        tile_raw, tile_addr, _ = aligned_buffer(TILE_BYTES)
        tile = (ctypes.c_char * TILE_BYTES).from_address(tile_addr)
        ctypes.memset(tile_addr, 0, TILE_BYTES)
        struct.pack_into("<i", tile, 0x00, 0)          # x0
        struct.pack_into("<i", tile, 0x04, 0)          # y0
        struct.pack_into("<i", tile, 0x08, w)          # x1
        struct.pack_into("<i", tile, 0x0c, h)          # y1
        struct.pack_into("<Q", tile, 0x10, out_addr)   # outPtr
        struct.pack_into("<i", tile, 0x18, stride)     # outRowStride (texels)
        struct.pack_into("<Q", tile, 0x50, in_addr)    # inPtr
        struct.pack_into("<i", tile, 0x58, stride)     # inRowStride (texels)

        fn(tile_addr, state_addr, None)

        out = list(struct.unpack_from("<%dI" % (n_tex * 4),
                                      (ctypes.c_char * (n_tex * 16)).from_address(out_addr), 0))
        results.append({
            "w": w, "h": h, "stride": stride, "n_tex": n_tex,
            "src": ["%08x" % struct.unpack("<I", struct.pack("<f", v))[0] for v in src],
            "state": bytes(st).hex(),
            "out": ["%08x" % u for u in out],
        })
        del state_raw, in_raw, out_raw, tile_raw
    return results


def run_ts(cases_payload):
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    p = subprocess.run([tsx, TS_DRIVER], input=json.dumps(cases_payload),
                       capture_output=True, text=True, cwd=os.path.join(REPO, "raw-port"), timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return json.loads(p.stdout.strip().splitlines()[-1])


def is_nan_bits(u):
    return (u & 0x7f800000) == 0x7f800000 and (u & 0x007fffff) != 0


def ordered(u):
    """Monotone remap of float bits so |a-b| is an ulp distance."""
    return (u ^ 0x7FFFFFFF) if (u & 0x80000000) else (u | 0x80000000)


def neutralise_rcpps(st):
    """Set the State's own AND/OR masks @+0x1e0/+0x80 so the refined reciprocal is exactly 1.0.

    @0x279510/0x279518 finish the reciprocal with `(r' & K1E0) | K80`, both read from the State —
    so an AND of 0 and an OR of bits(1.0f) pin r' to 1.0 WHATEVER the hardware seed was. That
    removes `vrcpps`, the one implementation-defined instruction in the kernel, from the
    comparison, and makes the remaining differential a bit-exact test of every other instruction:
    the loop control, the strides, the 8-wide/4-wide split, the log2/exp2 chain, every mask and
    blend, and the alpha passthrough.
    """
    st = bytearray(st)
    for l in range(8):
        struct.pack_into("<I", st, 0x1E0 + 4 * l, 0x00000000)
        struct.pack_into("<I", st, 0x080 + 4 * l, 0x3F800000)
    return st


def compare(native, ts):
    """-> (touched, exact, nan_payload_only, diffs[]) with diffs carrying an ulp distance."""
    touched = exact = nan_payload = 0
    diffs = []
    for i, c in enumerate(native):
        for j, (a, b) in enumerate(zip(c["out"], ts[i])):
            ua, ub = int(a, 16), int(b, 16)
            if ua == 0xC4423000 and ub == 0xC4423000:
                continue                      # -777.0 sentinel: texel outside the tile
            touched += 1
            if ua == ub:
                exact += 1
            elif is_nan_bits(ua) and is_nan_bits(ub):
                nan_payload += 1              # payload only; JS arithmetic canonicalises NaN
            elif is_nan_bits(ua) != is_nan_bits(ub):
                diffs.append((1 << 30, i, j, a, b))
            else:
                diffs.append((abs(ordered(ua) - ordered(ub)), i, j, a, b))
    return touched, exact, nan_payload, diffs


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 200
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    path = framework_path(FW_NAME)
    load_with_rpath(path)
    vmaddr = symbol_vmaddr(path, SYM)
    slide = image_slide(path)
    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p)(vmaddr + slide)
    print(f"calling {SYM}\n  at 0x{vmaddr + slide:x}  (x86_64 vmaddr 0x{vmaddr:x} + slide 0x{slide:x})")

    cases = build_cases(n)

    # ── PASS 1 (authoritative): vrcpps neutralised -> must be bit-exact ─────────────────────
    flat = [(w, h, s, sh, neutralise_rcpps(st), nan) for (w, h, s, sh, st, nan) in cases]
    native = run_native(flat, fn)
    ts = run_ts([{k: c[k] for k in ("w", "h", "stride", "n_tex", "src", "state")} for c in native])
    touched, exact, nanp, diffs = compare(native, ts)
    print(f"\nPASS 1  vrcpps NEUTRALISED (State AND/OR pin the reciprocal to 1.0)")
    print(f"  cases={len(native)}  touched lanes={touched}  bit-exact={exact}  "
          f"nan-payload-only={nanp}  DIVERGENCES={len(diffs)}")
    for d, i, j, a, b in sorted(diffs, reverse=True)[:12]:
        c = native[i]
        print(f"    case {i} lane {j}: native=0x{a} ts=0x{b} ({d} ulp, w={c['w']} h={c['h']} "
              f"stride={c['stride']})")
    verdict_ok = not diffs

    # ── PASS 2 (informational): live vrcpps -> report the residual, do not fail on it ───────
    native2 = run_native(cases, fn)
    ts2 = run_ts([{k: c[k] for k in ("w", "h", "stride", "n_tex", "src", "state")}
                  for c in native2])
    t2, e2, n2, d2 = compare(native2, ts2)
    buckets = {}
    for d, *_ in d2:
        key = d if d <= 4 else (">4" if d < (1 << 30) else "nan-vs-number")
        buckets[key] = buckets.get(key, 0) + 1
    print(f"\nPASS 2  LIVE vrcpps (implementation-defined seed; informational)")
    print(f"  cases={len(native2)}  touched lanes={t2}  bit-exact={e2}  nan-payload-only={n2}  "
          f"differing={len(d2)}")
    for k in sorted(buckets, key=str):
        print(f"    {k} ulp: {buckets[k]}")
    print("    (the seed is hardware-defined — see the rcpps() doc comment in the port; a "
          "realistic State stays within a few ulp, random polynomial coefficients amplify it "
          "through the log2/exp2 chain)")

    # ── PASS 3 (informational): live vrcpps but only REALISTIC States ──────────────────────
    # PASS 2 deliberately includes random polynomial coefficients, which amplify the seed's 2^-12
    # through log2/exp2. This pass answers the question a reader actually cares about: how far
    # apart are the port and the binary on a State that a tone curve would really carry?
    rng3 = random.Random(0xBEEF)
    real_cases = []
    for _ in range(n):
        w = rng3.randint(0, 9)
        h = rng3.randint(0, 4)
        stride = w + rng3.choice([0, 1])
        real_cases.append((w, h, max(stride, w), h, realistic_state(rng3), False))
    native3 = run_native(real_cases, fn)
    ts3 = run_ts([{k: c[k] for k in ("w", "h", "stride", "n_tex", "src", "state")}
                  for c in native3])
    t3, e3, n3, d3 = compare(native3, ts3)
    worst3 = max((d for d, *_ in d3), default=0)
    print(f"\nPASS 3  LIVE vrcpps, REALISTIC State only")
    print(f"  cases={len(native3)}  touched lanes={t3}  bit-exact={e3}  nan-payload-only={n3}  "
          f"differing={len(d3)}  WORST={worst3} ulp")

    print("\nVERIFIED bit-exact vs live Helium (rcpps-neutralised differential)" if verdict_ok
          else "\nDIVERGED")
    return 0 if verdict_ok else 1


if __name__ == "__main__":
    sys.exit(main())
