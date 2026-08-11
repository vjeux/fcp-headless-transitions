#!/usr/bin/env python3
"""Differential oracle for HgcScaleBiasCrop::RenderTile_AVX(HGTile*) @Helium 0x2daab0.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HgcScaleBiasCrop_RenderTile_AVX_oracle.py

MUST run under Rosetta: the port is transcribed from the x86_64 slice, and calling the arm64
image would compare against code the port did not transcribe (OPS_LOG "wrong architecture" —
it fails silently toward VERIFIED). AVX genuinely executes under Rosetta.

NO NUMPY: the only numpy on this box is an arm64 build, so `import numpy` dies inside the
required `arch -x86_64` process. float32 is emulated with struct round-trips instead, which is
bit-exact — each x86 SSE/AVX op takes f32 inputs and rounds the infinitely-precise result once,
and a Python double multiply/add of two f32 values is exact, so rounding it to f32 afterwards
reproduces the hardware exactly (no double-rounding).

The symbol is a LOCAL (`nm -arch x86_64` type `t`), so it is not dlsym-able: it is called at
`x86_64 vmaddr + the loaded image's slide`. That is also the way around the `_vmaddr` bug in
fct/parity/local_call.py (a bare `nm -n` reports ARM64 addresses even under Rosetta).

Two comparands per case, both bit-exact against the live kernel's output pixels:
  * MODEL — the transcription re-implemented here (validates the decode);
  * TS    — raw-port/re/oracle/HgcScaleBiasCrop_RenderTile_AVX_driver.ts through `npx tsx`
            (validates the shipped port). Skipped with --no-ts.
"""
import ctypes
import json
import os
import platform
import random
import struct
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
RAWPORT = os.path.abspath(os.path.join(HERE, "..", ".."))
FW = ("/Applications/Final Cut Pro.app/Contents/Frameworks/"
      "Helium.framework/Versions/A/Helium")
SYM = "__ZN16HgcScaleBiasCrop14RenderTile_AVXEP6HGTile"
VMADDR = 0x2daab0

_PACK = struct.Struct("<f")


def f32(x):
    """Round a Python float to IEEE-754 binary32, exactly as an SSE/AVX lane op does."""
    return _PACK.unpack(_PACK.pack(x))[0]


def hex32(x):
    return "%08x" % struct.unpack("<I", _PACK.pack(x))[0]


# ─────────────────────────── image loading / address resolution ────────────────────────────
def vmaddr(path, sym):
    """x86_64 vmaddr of `sym` — `-arch x86_64` is REQUIRED (a bare nm reports the arm64 slice)."""
    out = subprocess.run(["nm", "-arch", "x86_64", path], capture_output=True, text=True).stdout
    for line in out.splitlines():
        parts = line.split()
        if len(parts) == 3 and parts[2] == sym:
            return int(parts[0], 16)
    raise SystemExit("symbol not found in the x86_64 slice: " + sym)


def image_slide(path):
    libc = ctypes.CDLL(None)
    libc._dyld_image_count.restype = ctypes.c_uint32
    libc._dyld_get_image_name.restype = ctypes.c_char_p
    libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
    libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
    libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
    for i in range(libc._dyld_image_count()):
        if libc._dyld_get_image_name(i).decode() == path:
            return int(libc._dyld_get_image_vmaddr_slide(i) or 0)
    raise SystemExit("image not loaded: " + path)


# ───────────────────── the transcription, re-implemented lane by lane ──────────────────────
# Constant pool, read straight out of the x86_64 slice (rip arithmetic in the port's header):
K1 = [1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0]              # @Helium 0x88ef00
K2 = [0.5, 0.5, 0.0, 1.0, 0.5, 0.5, 0.0, 1.0]              # @Helium 0x88ef20
K3 = [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0]              # @Helium 0x88ef40
YSTEP = [0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0]           # @Helium 0x88ef60
XSTEP = [2.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0]           # @Helium 0x88ef80

MUT = None  # set by the negative-control pass; None for the faithful transcription


def mask_lane(coord4, p40, p60, p80):
    """One 128-bit lane of the crop test; coord4 = (px, py, 0.0, 1.0)."""
    # @0x2dabf0 vmovlhps / @0x2dab7d vunpcklpd -> (left, top, px, py)
    lo = [p40[0], p40[1], coord4[0], coord4[1]]
    # @0x2dabf4 vblendps $0x3 / @0x2dab77 vblendps $0xcc -> (px, py, right, bottom)
    hi = [coord4[0], coord4[1], p40[2], p40[3]]
    if MUT == "flipdiff":
        d = [f32(lo[i] - hi[i]) for i in range(4)]
    else:
        d = [f32(hi[i] - lo[i]) for i in range(4)]          # @0x2dabfa vsubps
    # @0x2dac03 vcmpltps + @0x2dac10 vandps: an ORDERED <, then a bitwise AND with the
    # all-ones/all-zero mask, i.e. the p80 lane or +0.0.
    m = [(p80[i] if d[i] < p60[i] else 0.0) for i in range(4)]
    # @0x2dac14/@0x2dac18 vhaddps x2 — the summation ORDER is (m0+m1) + (m2+m3).
    hsum = f32(f32(m[0] + m[1]) + f32(m[2] + m[3]))
    if MUT == "strict":
        return [(p80[i] if hsum < p60[i] else 0.0) for i in range(4)]
    # @0x2dac1c vcmpleps + @0x2dac21 vandps
    return [(p80[i] if hsum <= p60[i] else 0.0) for i in range(4)]


def model(c, src, dst, params):
    w, h = c["w"], c["h"]
    if h <= 0:                                              # @0x2daac6 jle -> return 0
        return 0
    # @0x2daad3 vcvtdq2ps then @0x2daad7/@0x2daadf/@0x2daaf0 mul K1, add K2, add K3
    corners = [c["x0"], c["y0"], c["x1"], c["y1"], c["x0"], c["y0"], c["x1"], c["y1"]]
    k2 = [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0] if MUT == "nohalf" else K2
    ymm0 = [f32(f32(f32(f32(corners[i]) * K1[i]) + k2[i]) + K3[i]) for i in range(8)]

    scale = params[0x00 // 4: 0x00 // 4 + 8]
    bias = params[0x20 // 4: 0x20 // 4 + 8]
    p40 = params[0x40 // 4: 0x40 // 4 + 8]
    p60 = params[0x60 // 4: 0x60 // 4 + 8]
    p80 = params[0x80 // 4: 0x80 // 4 + 8]
    xstep = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0] if MUT == "xstep1" else XSTEP

    srcRow, dstRow = 0, 0
    srcStride, dstStride = c["srcStride"] * 4, c["dstStride"] * 4

    if w >= 2:                                              # @0x2dab08 jl -> the w<2 path
        for _row in range(h):
            ymm3 = list(ymm0)                               # @0x2dab4b vmovaps %ymm0,%ymm3
            elem = 0
            ebx = 0
            while True:                                     # do/while @0x2dab50
                v = [f32(src[srcRow + elem + i]) for i in range(8)]
                if MUT == "biasfirst":
                    v = [f32(f32(v[i] + bias[i]) * scale[i]) for i in range(8)]
                else:
                    v = [f32(v[i] * scale[i]) for i in range(8)]   # @0x2dab5d vmulps
                m = (mask_lane(ymm3[0:4], p40[0:4], p60[0:4], p80[0:4])
                     + mask_lane(ymm3[4:8], p40[4:8], p60[4:8], p80[4:8]))
                if MUT != "biasfirst":
                    v = [f32(v[i] + bias[i]) for i in range(8)]    # @0x2dab96 vaddps
                for i in range(8):                          # @0x2dabaf vmulps + @0x2daba9 store
                    dst[dstRow + elem + i] = f32(v[i] * m[i])
                ymm3 = [f32(ymm3[i] + xstep[i]) for i in range(8)]
                elem += 8                                   # @0x2dabb3 addq $0x20,%r11
                # @0x2dabb7..0x2dabc8: r14 = ebx + w - 2 ; ebx -= 2 ; loop while r14 > 1
                r14 = ebx + w - 2
                ebx -= 2
                if not r14 > 1:
                    break
            # @0x2dabca negl %ebx ; @0x2dabcc cmpl %ebx,%r9d ; jle -> no odd pixel
            if w > -ebx:                                    # the 128-bit tail @0x2dabd5
                v = [f32(src[srcRow + elem + i]) for i in range(4)]
                if MUT == "biasfirst":
                    v = [f32(f32(v[i] + bias[i]) * scale[i]) for i in range(4)]
                else:
                    v = [f32(v[i] * scale[i]) for i in range(4)]   # @0x2dabe2 vmulps
                    v = [f32(v[i] + bias[i]) for i in range(4)]    # @0x2dabe6 vaddps
                m = mask_lane(ymm3[0:4], p40[0:4], p60[0:4], p80[0:4])
                for i in range(4):                          # @0x2dac25 vmulps + @0x2dac29 store
                    dst[dstRow + elem + i] = f32(v[i] * m[i])
            ymm0 = [f32(ymm0[i] + YSTEP[i]) for i in range(8)]     # @0x2dab30 vaddps %ymm2
            srcRow += srcStride                             # @0x2dab37 addq %rsi,%rdx
            dstRow += dstStride                             # @0x2dab3a addq %r8,%rcx
    elif w == 1:                                            # @0x2dac34 cmpl $1 ; @0x2dac50 loop
        for _row in range(h):
            v = [f32(src[srcRow + i]) for i in range(4)]
            if MUT == "biasfirst":
                v = [f32(f32(v[i] + bias[i]) * scale[i]) for i in range(4)]
            else:
                v = [f32(v[i] * scale[i]) for i in range(4)]       # @0x2dac5b vmulps
                v = [f32(v[i] + bias[i]) for i in range(4)]        # @0x2dac60 vaddps
            m = mask_lane(ymm0[0:4], p40[0:4], p60[0:4], p80[0:4])
            for i in range(4):
                dst[dstRow + i] = f32(v[i] * m[i])
            ymm0 = [f32(ymm0[i] + YSTEP[i]) for i in range(8)]     # @0x2dacab vaddps %ymm1
            srcRow += srcStride
            dstRow += dstStride
    return 0


# ───────────────────────────────────────── harness ─────────────────────────────────────────
TILE_SZ, THIS_SZ, PARAM_SZ = 0x200, 0x200, 0xA0
SENTINEL = -777.0


def build_case(rng):
    w = rng.choice([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 16, 17])
    h = rng.choice([0, 1, 2, 3, 4, 1, 2, 3, 5])
    x0, y0 = rng.randint(-4, 8), rng.randint(-4, 8)
    srcStride = w + rng.randint(0, 2)
    dstStride = w + rng.randint(0, 2)
    npix_src = max(1, srcStride * max(h, 1) + 8)
    npix_dst = max(1, dstStride * max(h, 1) + 8)

    def dup4():
        v = [f32(rng.uniform(-3, 3)) for _ in range(4)]
        return v + v

    left, top = f32(rng.uniform(x0 - 2, x0 + 3)), f32(rng.uniform(y0 - 2, y0 + 3))
    rect4 = [left, top, f32(left + rng.uniform(0, 6)), f32(top + rng.uniform(0, 6))]
    thr = [0.0] * 8 if rng.random() < 0.7 else [f32(rng.uniform(-1, 1))] * 8
    msk = [1.0] * 8 if rng.random() < 0.7 else [f32(rng.uniform(-2, 2))] * 8
    # The 0xA0-byte params block the ctor allocates at this+0x198, laid out exactly as the
    # kernel reads it: +0x00 scale, +0x20 bias, +0x40 crop rect, +0x60 threshold, +0x80 mask.
    # (An earlier revision of this harness padded an extra 8 floats before the mask, so +0x80
    # read as 0.0, every output pixel was multiplied by zero, and the model "agreed" with the
    # binary about nothing -- every negative control scored 0. That is the tell.)
    params = dup4() + dup4() + rect4 + rect4 + thr + msk
    assert len(params) * 4 == PARAM_SZ, len(params)
    return dict(w=w, h=h, x0=x0, y0=y0, x1=x0 + w, y1=y0 + h,
                srcStride=srcStride, dstStride=dstStride,
                npix_src=npix_src, npix_dst=npix_dst,
                src=[f32(rng.uniform(-4, 4)) for _ in range(npix_src * 4)],
                params=params)


def run_native(fn, c):
    src = (ctypes.c_float * (c["npix_src"] * 4))(*c["src"])
    dst = (ctypes.c_float * (c["npix_dst"] * 4))(*([SENTINEL] * (c["npix_dst"] * 4)))

    # the ctor 32-byte-aligns this block (@0x2daf43..0x2daf50), so the aligned vmovaps in the
    # kernel are legal; reproduce that alignment here.
    prm_raw = ctypes.create_string_buffer(PARAM_SZ + 64)
    prm_addr = (ctypes.addressof(prm_raw) + 31) & ~31
    ctypes.memmove(prm_addr, struct.pack("<%df" % len(c["params"]), *c["params"]),
                   4 * len(c["params"]))

    this_raw = ctypes.create_string_buffer(THIS_SZ)
    ctypes.memset(this_raw, 0xAA, THIS_SZ)
    struct.pack_into("<Q", this_raw, 0x198, prm_addr)

    tile = ctypes.create_string_buffer(TILE_SZ)
    ctypes.memset(tile, 0xAA, TILE_SZ)
    struct.pack_into("<4i", tile, 0x00, c["x0"], c["y0"], c["x1"], c["y1"])
    struct.pack_into("<Q", tile, 0x10, ctypes.addressof(dst))
    struct.pack_into("<i", tile, 0x18, c["dstStride"])
    struct.pack_into("<Q", tile, 0x50, ctypes.addressof(src))
    struct.pack_into("<i", tile, 0x58, c["srcStride"])

    rc = fn(ctypes.addressof(this_raw), ctypes.addressof(tile))
    return rc, [dst[i] for i in range(c["npix_dst"] * 4)], bytes(this_raw.raw)


def run_model(c):
    dst = [SENTINEL] * (c["npix_dst"] * 4)
    model(c, c["src"], dst, c["params"])
    return dst


def bits(xs):
    return [hex32(x) for x in xs]


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING to run natively (%s): re-run as "
                         "`arch -x86_64 /usr/bin/python3 %s`" % (platform.machine(), sys.argv[0]))
    ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
    va = vmaddr(FW, SYM)
    assert va == VMADDR, "vmaddr moved: 0x%x != 0x%x" % (va, VMADDR)
    slide = image_slide(FW)
    fn = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p)(va + slide)
    print("calling %s\n  at 0x%x  (x86_64 vmaddr 0x%x + slide 0x%x)" % (SYM, va + slide, va, slide))

    rng = random.Random(int(os.environ.get("SEED", "5")))
    n = int(os.environ.get("N", "600"))
    cases = [build_case(rng) for _ in range(n)]

    model_div = 0
    natives, wire = [], []
    this_writes = 0
    for c in cases:
        rc, got, this_after = run_native(fn, c)
        assert rc == 0, "return value is not 0: %r" % rc
        # the kernel must not write through `this` (it only reads +0x198)
        if this_after != b"\xAA" * 0x198 + this_after[0x198:0x1a0] + b"\xAA" * (THIS_SZ - 0x1a0):
            this_writes += 1
        want = run_model(c)
        gb, wb = bits(got), bits(want)
        if gb != wb:
            model_div += 1
            if model_div <= 3:
                j = next(k for k in range(len(gb)) if gb[k] != wb[k])
                print("  MODEL DIV w=%d h=%d elem=%d live=%s model=%s"
                      % (c["w"], c["h"], j, gb[j], wb[j]))
        natives.append(gb)
        wire.append(dict(w=c["w"], h=c["h"], x0=c["x0"], y0=c["y0"], x1=c["x1"], y1=c["y1"],
                         srcStride=c["srcStride"], dstStride=c["dstStride"],
                         npix_src=c["npix_src"], npix_dst=c["npix_dst"],
                         src=bits(c["src"]), params=bits(c["params"])))
    print("MODEL: %d cases, %d divergences  (object writes through `this`: %d)"
          % (len(cases), model_div, this_writes))

    ts_div = 0
    if "--no-ts" not in sys.argv:
        drv = os.path.join(HERE, "HgcScaleBiasCrop_RenderTile_AVX_driver.ts")
        p = subprocess.run(["npx", "tsx", drv], cwd=RAWPORT,
                           input=json.dumps(wire), capture_output=True, text=True)
        if p.returncode != 0:
            print("TS driver failed:\n" + p.stdout[-2000:] + p.stderr[-2000:])
            return 2
        ts = json.loads(p.stdout)
        for i, (a, b) in enumerate(zip(natives, ts)):
            if a != b:
                ts_div += 1
                if ts_div <= 3:
                    j = next(k for k in range(len(a)) if a[k] != b[k])
                    print("  TS DIV case=%d w=%d h=%d elem=%d live=%s ts=%s"
                          % (i, cases[i]["w"], cases[i]["h"], j, a[j], b[j]))
        print("TS: %d cases, %d divergences" % (len(ts), ts_div))

    # negative controls — each is a plausible wrong port; the count is how many of the SAME
    # cases would have caught it.
    global MUT
    controls = {}
    for name, kind in (("second compare cmple -> cmplt", "strict"),
                       ("x advances 1.0 per pixel-pair instead of 2.0", "xstep1"),
                       ("pixel centre offset 0.0 instead of 0.5", "nohalf"),
                       ("bias added before the scale multiply", "biasfirst"),
                       ("crop difference (px-left) computed as (left-px)", "flipdiff")):
        MUT = kind
        try:
            controls[name] = sum(1 for c, nat in zip(cases, natives)
                                 if bits(run_model(c)) != nat)
        finally:
            MUT = None
    print("negative controls (higher = the wrong port would have been caught): %r" % controls)

    ok = (model_div == 0 and ts_div == 0 and this_writes == 0)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
