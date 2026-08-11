#!/usr/bin/env python3
"""HgcBilateralFilterInterpSC_InterpolatorLastZ::RenderTile_AVX(HGTile*) @Helium 0x312fb0
— differential of the TS port against the LIVE AVX kernel.

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/HgcBilateralFilterInterpSC_InterpolatorLastZ_RenderTile_AVX_oracle.py

WHY THIS RUNS AT ALL. `sysctl hw.optional.avx1_0` reports 0 on this box and that report
is wrong under Rosetta: VEX.256 code executes. Settled by executing one
(`raw-port/army/tools/probe_avx.py`), not by reading a feature bit — and this kernel,
150 instructions of vminps/vblendps/vcmpleps/vrcpps, is its own proof.

WHY ROSETTA. Every @0xADDR in the port is an x86_64 vmaddr and `disasm.sh` thins to that
slice, while the box is arm64. Calling the arm64 image would compare the port against
code it did not transcribe — OPS_LOG's "the executable oracle calls the wrong
architecture, and fails toward ACCEPT". `ozone_loader.require_x86_64` refuses otherwise.

THE SYMBOL IS LOCAL (`t`), so dlsym cannot reach it: it is called at slide + 0x312fb0 and
the fourteen bytes there are checked against the encoding of the three instructions the
transcription opens with —

    44 8b 5e 0c        movl   0xc(%rsi), %r11d
    44 2b 5e 04        subl   0x4(%rsi), %r11d
    0f 8e 34 02 00 00  jle    0x3131f2          (0x3131f2 - 0x312fbe = 0x234)

— which pins the address AND confirms the instruction lengths the transcription depends
on. Without it a passing number would mean nothing.

WHAT IS MEASURED
  A. WHAT `vrcpps` ACTUALLY RETURNS ON THIS MACHINE, measured directly rather than
     assumed. The params block is the harness's to fill, so setting the correction slot
     to 1.0 and the mix weight to 1 makes the kernel's output the raw estimate for a
     chosen input. That turns the port's one documented deviation into a number with an
     error bar instead of a caveat.
  B. WHOLE TILES, BYTE FOR BYTE. The destination is poisoned, both sides render the same
     inputs into it, and the results are compared as u32 BIT PATTERNS — never as JSON
     numbers, because JSON has no NaN and no signed zero and this kernel produces both.
     Widths 1..9 cover the 2-pixel VEX.256 body, the 1-pixel VEX.128 tail and the
     `cols < 2` path that skips the wide loop; heights > 1 exercise the row-stride
     advance. Four corpus CLASSES are counted separately so that a class which collapses
     to nothing cannot hide behind a healthy-looking total:
       random    ordinary values plus specials (NaN, +-Inf, +-0, denormal)
       norcp     t1.z = t2.z = 0, so the reciprocal CANNOT reach the output: this class
                 must be 100% bit-exact, and it is what isolates the vrcpps modelling
                 choice from everything else in the kernel
       specialz  NaN / -0.0 / +0.0 / an exact tie with the clamp edge placed in the .z
                 lanes on purpose — the lanes that decide vminps and vcmpleps operand
                 order
       dupslots  the params block's duplicate slots given DIFFERENT values, which is what
                 proves the kernel reads 32 CONTIGUOUS bytes rather than broadcasting one
                 16-byte slot

NEGATIVE CONTROLS are MUTATIONS OF THE REAL PORT FILE (one token each, imported by the
same driver through `modulePath`), so a control cannot drift from the code under test.
The unmutated baseline (M0) is printed beside them.
"""
import ctypes
import json
import os
import random
import struct
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
PORT_TS = os.path.abspath(os.path.join(HERE, "..", "..", "src", "render",
                                       "HgcBilateralFilterInterpSC_InterpolatorLastZ.ts"))
DRIVER = os.path.join(HERE, "HgcBilateralFilterInterpSC_InterpolatorLastZ_RenderTile_AVX_driver.mts")

FW = "Helium"
VMADDR = 0x312FB0
PROLOGUE = bytes.fromhex("448b5e0c442b5e040f8e34020000")
# The C2 ctor @0x3134f0 installs these, each into TWO adjacent slots.
RODATA = {"indicator": 0x3CAA70, "eps": 0x3CB0B0, "corr": 0x85FED0}

PARAMS_FLOATS = 40          # ten vec4 slots
PIX = 4                     # f32s per pixel
RCPPS_BOUND = 1.5 * 2 ** -12   # the VRCPPS relative-error guarantee


def u32(f):
    return struct.unpack("<I", struct.pack("<f", f))[0]


def as_f32(bits):
    return struct.unpack("<f", struct.pack("<I", bits & 0xFFFFFFFF))[0]


def fr(x):
    return struct.unpack("<f", struct.pack("<f", x))[0]


def ulps(a, b):
    def mono(v):
        return v ^ 0x80000000 if v & 0x80000000 else v | 0x80000000
    return abs(mono(a) - mono(b))


def aligned(n_floats, fill_bits=0xCDCDCDCD):
    """32-byte-aligned storage — the VEX.128 tail uses `vmovaps`, so alignment is part
    of the contract, not a convenience."""
    raw = ctypes.create_string_buffer(n_floats * 4 + 64)
    a = ctypes.addressof(raw)
    a += (-a) % 32
    ctypes.memmove(a, struct.pack("<I", fill_bits) * n_floats, n_floats * 4)
    return raw, a


def read_bits(addr, n):
    return list(struct.unpack("<%dI" % n, ctypes.string_at(addr, n * 4)))


SPECIALS = [0x00000000, 0x80000000, 0x3F800000, 0xBF800000, 0x7F800000, 0xFF800000,
            0x7FC00000, 0x00000001, 0x40490FDB, 0x3727C5AC]
CLASSES = ("random", "norcp", "specialz", "dupslots")


class Rig:
    """One call of the live kernel: builds `this`, the params block, four textures and a
    poisoned destination, all 32-byte aligned."""

    def __init__(self, fn, w, h, params, t0, t1, t2, t3):
        n = w * h * PIX
        self.n, self.w, self.h = n, w, h
        self._keep = []
        pb, pa = aligned(PARAMS_FLOATS)
        ctypes.memmove(pa, struct.pack("<%dI" % PARAMS_FLOATS, *params), PARAMS_FLOATS * 4)
        self._keep.append(pb)
        addrs = {}
        for key, bits in (("t0", t0), ("t1", t1), ("t2", t2), ("t3", t3)):
            b, a = aligned(n)
            ctypes.memmove(a, struct.pack("<%dI" % n, *bits), n * 4)
            self._keep.append(b)
            addrs[key] = a
        db, da = aligned(n)
        self._keep.append(db)
        self.dst_poison = read_bits(da, n)
        th = ctypes.create_string_buffer(0x200 + 64)
        ta = ctypes.addressof(th)
        ta += (-ta) % 32
        ctypes.memmove(ta + 0x198, struct.pack("<Q", pa), 8)
        self._keep.append(th)
        tl = ctypes.create_string_buffer(0x100)
        t = ctypes.addressof(tl)
        self._keep.append(tl)
        ctypes.memmove(t + 0x00, struct.pack("<iiii", 0, 0, w, h), 16)
        ctypes.memmove(t + 0x10, struct.pack("<Q", da), 8)
        ctypes.memmove(t + 0x18, struct.pack("<i", w), 4)
        for off, key in ((0x50, "t0"), (0x60, "t1"), (0x70, "t2"), (0x80, "t3")):
            ctypes.memmove(t + off, struct.pack("<Q", addrs[key]), 8)
            ctypes.memmove(t + off + 8, struct.pack("<i", w), 4)
        self.rc = fn(ta, t)
        self.live = read_bits(da, n)


def ts_render(req, module_path=None):
    if module_path:
        req = dict(req, modulePath=module_path)
    p = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                       input=json.dumps(req), capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stderr[-2000:])
    return json.loads(p.stdout)


def base_params(consts, pv):
    params = [0] * PARAMS_FLOATS
    for i in range(4):
        params[i] = u32(pv[i])
        params[4 + i] = u32(pv[i])
        params[8 + i] = consts["indicator"][i]
        params[12 + i] = consts["indicator"][i]
        params[16 + i] = consts["eps"][i]
        params[20 + i] = consts["eps"][i]
        params[24 + i] = consts["corr"][i]
        params[28 + i] = consts["corr"][i]
    return params


def measure_rcpps(fn, consts):
    """Section A — what the machine's `vrcpps` returns, read straight out of the kernel.

    With the correction slot set to 1.0, p = {-inf, +inf, 0, 1}, t1.z = 0, t2.z = 1 and
    t3.z = 0, the algebra of the body collapses to  out.z = rcpps(max(t2.w, 1e-6)).
    """
    params = base_params(consts, [float("-inf"), float("inf"), 0.0, 1.0])
    for i in range(4):
        params[24 + i] = u32(1.0)
        params[28 + i] = u32(1.0)
    inputs = [1.0, 2.0, 4.0, 0.5, 0.25, 256.0, 3.0, 7.0, 1.5, 10.0, 0.1, 0.001, 5.0, 9.0, 100.0]
    worst_rel, rows = 0.0, []
    for x in inputs:
        n = 2 * PIX
        t0 = [0] * n
        t1 = [0] * n
        t2 = [0] * n
        t3 = [0] * n
        for px in range(2):
            t2[px * PIX + 2] = u32(1.0)
            t2[px * PIX + 3] = u32(x)
            t1[px * PIX + 3] = u32(1.0)
        rig = Rig(fn, 2, 1, params, t0, t1, t2, t3)
        est = as_f32(rig.live[2])
        exact = fr(1.0 / fr(x))
        rel = abs(est - exact) / abs(exact)
        worst_rel = max(worst_rel, rel)
        rows.append((x, rig.live[2], u32(exact), rel))
    return rows, worst_rel


def make_tex(rng, n, mode, kind):
    out = []
    for i in range(n):
        lane = i % PIX
        if mode == "norcp" and lane == 2 and kind in ("t1", "t2"):
            out.append(0x00000000)          # A and B are then 0 whatever the reciprocal is
        elif rng.random() < 0.18:
            out.append(rng.choice(SPECIALS))
        else:
            out.append(u32(rng.uniform(-4.0, 4.0)))
    return out


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    here = ctypes.string_at(addr, len(PROLOGUE))
    print(f"image        : {image}")
    print(f"slide+vmaddr : {slide:#x} + {VMADDR:#x} = {addr:#x}")
    print(f"prologue     : {here.hex()}\n               expected {PROLOGUE.hex()}")
    if here != PROLOGUE:
        print("SELF-CHECK FAILED — the bytes at the address are not the transcribed body. "
              "Refusing to report a number.")
        return 1
    print("self-check   : OK — the local symbol's x86_64 body is at slide + vmaddr\n")

    consts = {k: read_bits(slide + va, 4) for k, va in RODATA.items()}
    print("ctor rodata  : indicator={} eps={} corr={}".format(
        [hex(x) for x in consts["indicator"]], as_f32(consts["eps"][0]), as_f32(consts["corr"][0])))
    if consts["indicator"] != [0, 0, u32(1.0), 0]:
        print("the indicator constant is not {0,0,1,0}; this is not the .z variant — stopping")
        return 1

    fn = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p)(addr)

    print("\n== A. what `vrcpps` returns on this machine (correction slot set to 1.0) ==")
    rows, worst_rel = measure_rcpps(fn, consts)
    print(f"{'x':>10} {'live rcpps(x)':>16} {'IEEE 1/x':>16} {'ULP':>7} {'rel err':>10}")
    for x, live_b, exact_b, rel in rows:
        print(f"{x:>10} {as_f32(live_b):>16.9g} {as_f32(exact_b):>16.9g} "
              f"{ulps(live_b, exact_b):>7} {rel:>10.3e}")
    rcp_in_bound = worst_rel <= RCPPS_BOUND
    print(f"worst relative error {worst_rel:.3e} vs the VRCPPS guarantee {RCPPS_BOUND:.3e} -> "
          f"{'within bound' if rcp_in_bound else 'OUT OF BOUND'}")
    print("Every estimate has its low mantissa bits cleared, which is what a table-based\n"
          "estimate looks like; the port computes the IEEE reciprocal instead, so the .z\n"
          "lane inherits exactly this much error and no other lane can.")

    src = open(PORT_TS).read()
    MUTANTS = {
        "m1_lane0_not_lane2": ("(lane & 3) === 2", "(lane & 3) === 0"),
        "m2_no_rcp_correction": ("rcpps(maxps(shdup3, eps)) * corr", "rcpps(maxps(shdup3, eps)) * 1"),
        "m3_shdup_reads_z_not_w": ("f32(t1[base1 + (lane | 1)])", "f32(t1[base1 + lane])"),
        "m4_min_operands_swapped": ("minps(pY, ymm0)", "minps(ymm0, pY)"),
        "m5_slot_dup_ignored": ("const eps = f32(p[16 + lane]);", "const eps = f32(p[16 + (lane & 3)]);"),
    }
    tmpdir = tempfile.mkdtemp(prefix="lastz_mut_")
    mut_paths, mut_kills, no_evidence = {}, {}, []
    for name, (a, b) in MUTANTS.items():
        if a not in src:
            no_evidence.append(name)
            continue
        path = os.path.join(tmpdir, f"{name}.ts")
        open(path, "w").write(src.replace(a, b, 1))
        mut_paths[name] = path
        mut_kills[name] = 0

    rng = random.Random(0x1A57)
    per_class = {m: [0, 0, 0] for m in CLASSES}
    total = exact = 0
    rcp_diffs, hard = [], []
    tiles = 0
    print("\n== B. whole tiles, bit pattern for bit pattern ==")
    print(f"{'class':>9} {'tile':>7} {'lanes':>6} {'exact':>6} {'.z diff':>8} {'other':>6}  worst ULP")
    for mode in CLASSES:
        for w in (1, 2, 3, 4, 5, 6, 7, 8, 9):
            for h in (1, 2):
                tiles += 1
                n = w * h * PIX
                pv = [rng.uniform(-2.0, 2.0) for _ in range(4)]
                params = base_params(consts, pv)
                t0 = make_tex(rng, n, mode, "t0")
                t1 = make_tex(rng, n, mode, "t1")
                t2 = make_tex(rng, n, mode, "t2")
                t3 = make_tex(rng, n, mode, "t3")
                if mode == "dupslots":
                    for i in range(4):
                        params[4 + i] = u32(rng.uniform(-2.0, 2.0))
                        params[12 + i] = u32(rng.uniform(0.25, 4.0))
                        params[20 + i] = u32(rng.uniform(1e-3, 1.0))
                        params[28 + i] = u32(rng.uniform(0.5, 2.0))
                if mode == "specialz":
                    picks = [params[1], 0x7FC00000, 0x80000000, 0x00000000]
                    for k in range(w * h):
                        t0[k * PIX + 2] = picks[k % len(picks)]
                        t1[k * PIX + 3] = picks[(k + 1) % len(picks)]
                else:
                    t0[2] = params[1]        # one exact tie with the clamp edge

                rig = Rig(fn, w, h, params, t0, t1, t2, t3)
                req = {"paramsBits": params, "t0Bits": t0, "t1Bits": t1, "t2Bits": t2,
                       "t3Bits": t3, "dstBits": rig.dst_poison,
                       "left": 0, "top": 0, "right": w, "bottom": h, "stride": w}
                out = ts_render(req)
                ts = out["dstBits"]
                if out["rc"] != rig.rc:
                    hard.append((mode, w, h, -1, rig.rc, out["rc"]))

                e = z = o = 0
                worst = 0
                for i in range(n):
                    total += 1
                    a, b = ts[i], rig.live[i]
                    both_nan = ((a & 0x7F800000) == 0x7F800000 and (a & 0x7FFFFF) and
                                (b & 0x7F800000) == 0x7F800000 and (b & 0x7FFFFF))
                    if a == b or both_nan:
                        e += 1
                        exact += 1
                        continue
                    worst = max(worst, ulps(a, b))
                    if (i % PIX) == 2:
                        z += 1
                        rcp_diffs.append(ulps(a, b))
                    else:
                        o += 1
                        hard.append((mode, w, h, i, hex(b), hex(a)))
                per_class[mode][0] += n
                per_class[mode][1] += e
                per_class[mode][2] += z + o
                print(f"{mode:>9} {w:>3}x{h:<3} {n:>6} {e:>6} {z:>8} {o:>6}  {worst}")

                for name, path in mut_paths.items():
                    if ts_render(req, path)["dstBits"] != ts:
                        mut_kills[name] += 1

    print()
    for m in CLASSES:
        lanes, ex, diff = per_class[m]
        print(f"class {m:<9}: {lanes:>5} lanes, {ex:>5} bit-exact, {diff:>4} differing")
    norcp_clean = per_class["norcp"][0] == per_class["norcp"][1]
    print(f"\nlanes compared           : {total}")
    print(f"bit-exact                : {exact}")
    print(f"differing, .z lane only  : {len(rcp_diffs)}  (the only lane vrcpps can reach)")
    print(f"differing, OTHER lanes   : {len(hard)}  <- must be zero; these would be real defects")
    if rcp_diffs:
        print(f"worst .z ULP             : {max(rcp_diffs)}  (the estimate's error amplified by "
              f"the mix/accumulate chain that follows it)")
    for row in hard[:8]:
        print(f"   HARD {row}")

    print("\n-- NEGATIVE CONTROLS (mutations of the real port file) --")
    print(f"   baseline M0: the unmutated port is {exact}/{total} bit-exact over {tiles} tiles, "
          f"{len(hard)} hard divergences")
    ok = (not hard) and norcp_clean and rcp_in_bound
    if not norcp_clean:
        print("!! the norcp class is NOT bit-exact — the reciprocal cannot reach the output there, "
              "so a difference is a defect in the port rather than the modelling choice")
    labels = {
        "m1_lane0_not_lane2": "M1 the blend selects lane 0 (the LastX channel), not lane 2",
        "m2_no_rcp_correction": "M2 the 1+2^-12+2^-23 correction constant dropped",
        "m3_shdup_reads_z_not_w": "M3 vmovshdup reads .z instead of .w for the unpremultiply",
        "m4_min_operands_swapped": "M4 vminps operands swapped (decided by ties and NaN)",
        "m5_slot_dup_ignored": "M5 the 32-byte operand folded to one 16-byte slot",
    }
    for name in no_evidence:
        print(f"   {labels[name]}: PATTERN NOT FOUND — no evidence, not a kill")
        ok = False
    for name, k in mut_kills.items():
        print(f"   {labels[name]}: killed {k}/{tiles} tiles")
        if k == 0:
            print("   !! killed 0 — say which: a BLIND harness, or a mutant that is EQUIVALENT on "
                  "this corpus. Not a clean run.")
            ok = False

    print("\n" + ("VERDICT: VERIFIED — every lane the reciprocal cannot reach is bit-exact against "
                 "the live AVX kernel, the norcp class is bit-exact end to end, and the .z "
                 "differences are the documented vrcpps modelling choice, whose measured error "
                 "sits inside the instruction's own guarantee"
                 if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
