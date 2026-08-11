#!/usr/bin/env python3
"""Differential oracle for HgcBT2100_PQ_OOTF_qtApprox::RenderTile_AVX(HGTile*)
   @Helium 0x3a7220  (__ZN26HgcBT2100_PQ_OOTF_qtApprox14RenderTile_AVXEP6HGTile)

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/HgcBT2100_PQ_OOTF_qtApprox_RenderTile_AVX_oracle.py

Rosetta is required and enforced (ozone_loader.require_x86_64): every @0xADDR in the port is an
x86_64 offset, and an address-based differential run against the arm64 image fails SILENTLY toward
VERIFIED. AVX kernels DO execute under Rosetta — the feature bits lie — so this probes by
EXECUTING; `raw-port/army/tools/probe_avx.py` settles that in two seconds if you doubt it.

The symbol is file-local (`nm` class `t`), so dlsym cannot reach it: it is called at
`_dyld_get_image_vmaddr_slide(Helium) + 0x3a7220` through ozone_loader.local_fn, and the opcode
bytes at that address are checked against the disassembly before anything is believed.

WHAT IS COMPARED. Real tiles in real process memory: a source plane, a poisoned destination plane,
a 0x340-byte parameter bank and a fake `this` whose ONLY populated field is +0x198 (the bank
pointer) — which is the only thing the kernel reads out of `this`. The live kernel runs on them;
the SHIPPED TypeScript file runs on identical bytes (the driver imports
raw-port/src/render/HgcBT2100_PQ_OOTF_qtApprox.ts, it does not restate it); every f32 of the destination
plane is compared BIT-FOR-BIT, including the padding texels beyond the tile width that the kernel
must NOT touch, and the int return value is compared too. This kernel has no `vrcpps`/`vdivps`/
`vsqrtps` — every operation is exactly specified by IEEE-754 or by integer semantics — so the bar
is 0 divergences, not an ulp budget.

Three bank presets:
  * CTOR — the exact 26-slot bank the class ctor @0x3a7a90 builds (every constant read out of
    Helium.x86_64 at the literal address its `movaps disp32(%rip)` resolves to), with the three
    settable slots filled with plausible BT.1886-shaped OOTF parameters;
  * SPECIAL — the same, but with both pow exponents equal to slot 2, which is the ONLY way to
    reach the two `vblendvps` "substitute 1.0" arms (@0x3a5a9f / @0x3a5cd1 and their tail twins);
    without this preset those two branches never execute and the corpus is blind to them;
  * ADVERSARIAL — random f32 in every slot the kernel reads, which drives the polynomials into
    overflow, denormals, NaN and the `vcvttps2dq` out-of-range case.

DEGENERATE TILES are in the corpus on purpose (w<=0 and h<=0, including negative): OPS_LOG records
a reviewer finding a whole no-write path a "normal tile" corpus could not have shown. Here the
poisoned destination proves the kernel writes NOTHING in those cases.

CONTROLS. Two kinds, proving different things (OPS_LOG: "a dead negative control means your
harness is blind OR your mutant is equivalent — say which, and print M0 alongside"):

  * HARNESS LIVENESS: M0 is the UNMUTATED port re-run through the same wire, which must show 0
    divergences — printing it alongside is what proves an inflated mutant count is not just a
    broken harness (OPS_LOG: an inflated control hid ~920 units of one agent's own model bug).
    M1 is a true mutant: every bank read shifted by 4 bytes. It MUST diverge.
  * CORPUS SENSITIVITY (not mutants): each bank slot the kernel reads is perturbed in turn and the
    LIVE kernel re-run; the number of output lanes that change is reported. A slot with ZERO
    sensitivity means this corpus could not tell a port that ignored that constant from one that
    used it. The same probe is run per input lane (which pins the alpha passthrough) and for the
    two row strides.
"""
import ctypes
import json
import os
import random
import struct
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

SYM = "__ZN26HgcBT2100_PQ_OOTF_qtApprox14RenderTile_AVXEP6HGTile"
ADDR = 0x3A7220
# movl 0xc(%rsi),%eax ; subl 0x4(%rsi),%eax ; jle — the height test runs BEFORE the frame is built,
# so there is no `pushq %rbp` to key on.
BODY = bytes([0x8B, 0x46, 0x0C, 0x2B, 0x46, 0x04, 0x0F, 0x8E])
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.path.join(REPO, "raw-port", "re", "oracle",
                         "HgcBT2100_PQ_OOTF_qtApprox_RenderTile_AVX_driver.ts")

BANK_SIZE = 0x320          # 25 slots x 32 bytes, as the ctor allocates (__Znam(0x347), aligned)
THIS_SIZE = 0x200          # only +0x198 is ever read
P_BANK = 0x198
TILE_SIZE = 0x60
T_X0, T_Y0, T_X1, T_Y1 = 0x00, 0x04, 0x08, 0x0C
T_OUT, T_OUTSTRIDE, T_IN, T_INSTRIDE = 0x10, 0x18, 0x50, 0x58

# Every bank slot this kernel reads, as (offset, kind): 's' scalar (vbroadcastss),
# 'v' 32-byte vector (ymm), 'i' 16-byte integer vector (vmovdqa).
SLOTS = [(0x00, "s"), (0x04, "s"), (0x08, "s"),
         (0x20, "v"), (0x40, "v"), (0x60, "v"), (0x80, "v"), (0xA0, "v"), (0xC0, "v"),
         (0xE0, "v"), (0x100, "v"), (0x120, "v"), (0x140, "v"), (0x160, "v"), (0x180, "v"),
         (0x1A0, "v"), (0x1C0, "v"), (0x1E0, "v"), (0x200, "v"), (0x220, "v"), (0x240, "v"),
         (0x260, "v"), (0x280, "v"), (0x2A0, "v"), (0x2C0, "i")]

# The ctor's literal table: slot -> the 4 f32 lanes it stores twice. Read out of
# /tmp/Helium.x86_64 at the address each `movaps disp32(%rip)` in
# __ZN17HgcBT2100_PQ_OOTFC2Ev resolves to (next_ip + disp32); see the port's file header.
CTOR_SLOTS = {
    1:  (0.0, 0.0, 0.0, "0xff800000"),              # @0x892950  (0,0,0,-Inf) the clamp floor
    2:  (1.0, 1.0, 1.0, 0.0),                       # @0x3ca9c0
    3:  ("0x807fffff",) * 3 + ("0x00000000",),      # @0x892090  mantissa|sign mask
    4:  ("0x00800000",) * 3 + ("0x00000000",),      # @0x858f70  +FLT_MIN
    5:  ("0x7f800000",) * 3 + ("0x00000000",),      # @0x88f440  +Inf
    6:  (127.0, 127.0, 127.0, 0.0),                 # @0x88ded0
    7:  (1.4142135381698608,) * 3 + (0.0,),         # @0x88dee0  sqrt(2)
    8:  (0.5, 0.5, 0.5, 0.0),                       # @0x85da90
    9:  (0.2960891127586365,) * 3 + (0.0,),         # @0x88dfa0
    10: (-0.35917338728904724,) * 3 + (0.0,),       # @0x88dfb0
    11: (0.17290928959846497,) * 3 + (0.0,),        # @0x88dfc0
    12: (-0.27149274945259094,) * 3 + (0.0,),       # @0x88dfd0
    13: (0.4805939197540283,) * 3 + (0.0,),         # @0x88dfe0
    14: (-0.7213672399520874,) * 3 + (0.0,),        # @0x88dff0
    15: (1.4426966905593872,) * 3 + (0.0,),         # @0x88e000  1/ln2
    16: (-127.0, -127.0, -127.0, 0.0),              # @0x88df30
    17: (0.0017952255439013243,) * 3 + (0.0,),      # @0x88e010
    18: (0.009189177304506302,) * 3 + (0.0,),       # @0x88e020
    19: (0.055661238729953766,) * 3 + (0.0,),       # @0x88e030
    20: (0.2402067929506302,) * 3 + (0.0,),         # @0x88e040
    21: (0.6931475400924683,) * 3 + (0.0,),         # @0x88e050  ln2
    22: ("0x0000007f",) * 3 + ("0x00000000",),      # @0x88df70  the i32 exp2 bias
    23: ("0xffffffff",) * 3 + ("0x00000000",),      # @0x88c7f0  NaN — not read by this kernel
    24: ("0x00000000",) * 3 + ("0xffffffff",),      # @0x85fc40  — not read by this kernel
}


def aligned_buffer(nbytes, align=32):
    raw = ctypes.create_string_buffer(nbytes + align)
    addr = ctypes.addressof(raw)
    off = (-addr) % align
    return raw, addr + off, off


def f32(x):
    return struct.unpack("<f", struct.pack("<f", x))[0]


def put_f32(buf, off, val):
    struct.pack_into("<f", buf, off, val)


def put_lane(buf, off, val):
    """A lane is either an f32 or a literal bit pattern given as a '0x…' string."""
    if isinstance(val, str):
        struct.pack_into("<I", buf, off, int(val, 16))
    else:
        put_f32(buf, off, val)


def ctor_bank(p0):
    """The bank exactly as the ctor @0x3a7a90 leaves it, with the one settable slot filled.
    Each slot holds its float4 TWICE (the ctor's paired movaps), which is what makes a 32-byte
    ymm load of a slot a broadcast-ready (x,y,z,w,x,y,z,w)."""
    b = bytearray(b"\x00" * BANK_SIZE)
    for slot, lanes in CTOR_SLOTS.items():
        for half in (0x00, 0x10):
            for l in range(4):
                put_lane(b, slot * 0x20 + half + 4 * l, lanes[l])
    for half in (0x00, 0x10):
        for l in range(4):
            put_lane(b, half + 4 * l, p0[l])
    return bytes(b)


def realistic_bank():
    # A PQ-shaped OOTF approximation: scale in, raise to a gamma, scale out.
    return ctor_bank(p0=(1.0, 2.4, 0.9, 0.0))


def special_bank():
    # The exponent EQUALS the floor slot lane-for-lane, which is the ONLY way to reach the
    # "substitute 1.0" arm (@0x3a72d1 / @0x3a74b4). The floor's lanes 0..2 are 0.0, so an exponent
    # of 0.0 fires it on RGB; lane 3 is -Inf and can never be equalled by a broadcast 0.0, which is
    # itself worth exercising — the arm fires on three lanes and not the fourth.
    return ctor_bank(p0=(0.75, 0.0, 1.25, 0.0))


def adversarial_bank(rng):
    b = bytearray(realistic_bank())
    for off, kind in SLOTS:
        n = 1 if kind == "s" else (8 if kind == "v" else 4)
        for l in range(n):
            if kind == "i":
                struct.pack_into("<i", b, off + 4 * l, rng.randrange(-140, 140))
            else:
                put_f32(b, off + 4 * l, rng.uniform(-4.0, 4.0))
    return bytes(b)


DRAWS = 6          # independent input draws per (bank preset, tile shape)

SPECIALS = [0.0, -0.0, 1.0, -1.0, float("inf"), float("-inf"), float("nan"),
            1e-40, -1e-40, 3.4e38, 1.1754944e-38, 0.5, 0.018, 0.0179,
            # NaNs with a NON-CANONICAL PAYLOAD, on purpose. JavaScript has one NaN and writing it
            # into a Float32Array canonicalises to 0x7fc00000, while the machine PROPAGATES the
            # payload of an input NaN through mulps/addps. If that difference is reachable here it
            # is a real divergence and this corpus has to be the thing that finds it.
            struct.unpack("<f", struct.pack("<I", 0xFFFFFFFF))[0],
            struct.unpack("<f", struct.pack("<I", 0x7F800001))[0],
            struct.unpack("<f", struct.pack("<I", 0xFFC0DEAD))[0]]


def build_cases(rng, banks):
    cases = []
    # w/h cover: the vector-only path, the vector+tail path, tail-only, and every degenerate
    # shape (0 and negative in each dimension).
    shapes = [(0, 3), (1, 1), (1, 3), (2, 1), (3, 2), (4, 1), (5, 3), (8, 2), (9, 4), (7, 1),
              (6, 5), (2, 0), (0, 0), (-3, 2), (4, -1), (16, 1), (17, 2), (33, 3), (64, 2),
              (31, 4), (2, 7)]
    for bi, bank in enumerate(banks):
        for (w, h) in shapes:
          for _draw in range(DRAWS):
              stride = max(w, 0) + rng.randrange(0, 3)   # padding the kernel must not touch
              n = max(1, (max(h, 0) + 1) * max(stride, 1) * 4)
              vals = []
              for _ in range(n):
                  r = rng.random()
                  if r < 0.18:
                      vals.append(rng.choice(SPECIALS))
                  elif r < 0.30:
                      vals.append(rng.uniform(0.0, 1.0))      # the in-gamut band
                  else:
                      vals.append(rng.uniform(-2.0, 2.0))
              cases.append({"w": w, "h": h, "inStride": stride, "outStride": stride,
                            "n": n, "in": [f32(v) for v in vals], "bank": bank, "preset": bi})
    return cases


def run_native(cases, fn):
    outs, rcs = [], []
    for c in cases:
        bk_raw, bk_addr, _ = aligned_buffer(BANK_SIZE)
        ctypes.memmove(bk_addr, c["bank"], BANK_SIZE)
        in_raw, in_addr, _ = aligned_buffer(4 * c["n"])
        out_raw, out_addr, _ = aligned_buffer(4 * c["n"])
        buf = (ctypes.c_char * (4 * c["n"])).from_address(in_addr)
        for i, v in enumerate(c["in"]):
            struct.pack_into("<f", buf, 4 * i, v)
        ctypes.memset(out_addr, 0xCD, 4 * c["n"])
        c["outInit"] = ctypes.string_at(out_addr, 4 * c["n"])

        # `this`: the kernel reads exactly one field out of it, movq 0x198(%rdi),%r14 @0x3a5a47.
        this_raw, this_addr, _ = aligned_buffer(THIS_SIZE)
        ctypes.memset(this_addr, 0xAA, THIS_SIZE)
        struct.pack_into("<Q", (ctypes.c_char * THIS_SIZE).from_address(this_addr), P_BANK, bk_addr)

        tile = ctypes.create_string_buffer(TILE_SIZE)
        struct.pack_into("<i", tile, T_X0, 0)
        struct.pack_into("<i", tile, T_Y0, 0)
        struct.pack_into("<i", tile, T_X1, c["w"])
        struct.pack_into("<i", tile, T_Y1, c["h"])
        struct.pack_into("<Q", tile, T_OUT, out_addr)
        struct.pack_into("<i", tile, T_OUTSTRIDE, c["outStride"])
        struct.pack_into("<Q", tile, T_IN, in_addr)
        struct.pack_into("<i", tile, T_INSTRIDE, c["inStride"])

        rcs.append(fn(this_addr, ctypes.addressof(tile)))
        outs.append(ctypes.string_at(out_addr, 4 * c["n"]))
        # the poisoned `this` must be untouched: the kernel only READS +0x198
        assert ctypes.string_at(this_addr, P_BANK) == b"\xaa" * P_BANK, "kernel wrote into `this`"
        del bk_raw, in_raw, out_raw, this_raw
    return outs, rcs


def hexes(blob):
    return ["%08x" % struct.unpack_from("<I", blob, 4 * i)[0] for i in range(len(blob) // 4)]


def run_ts(cases, bank_shift=0):
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    wire = []
    for c in cases:
        bank = c["bank"]
        w = {"w": c["w"], "h": c["h"], "inStride": c["inStride"], "outStride": c["outStride"],
             "inPlane": ["%08x" % struct.unpack("<I", struct.pack("<f", v))[0] for v in c["in"]],
             "outPlane": hexes(c["outInit"]),
             "bank": bank.hex(),
             "bankShift": bank_shift}
        wire.append(w)
    p = subprocess.run([tsx, TS_DRIVER], input=json.dumps(wire), capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"))
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout[-4000:] + p.stderr[-4000:])
    res = json.loads(p.stdout.strip().splitlines()[-1])
    return [r["out"] for r in res], [r["rc"] for r in res]


def diff_count(native_blobs, ts_hex):
    bad, first = 0, None
    for c_i, (blob, th) in enumerate(zip(native_blobs, ts_hex)):
        nh = hexes(blob)
        for i, (a, b) in enumerate(zip(nh, th)):
            if a != b:
                bad += 1
                if first is None:
                    first = (c_i, i, a, b)
    return bad, first


def main():
    ozone_loader.require_x86_64()
    fn, addr, slide = ozone_loader.local_fn(
        "Helium", SYM, ctypes.c_int, [ctypes.c_void_p, ctypes.c_void_p])

    live = ctypes.string_at(slide + ADDR, len(BODY))
    ident = (addr == ADDR) and live == BODY
    print(f"identity: nm addr 0x{addr:x} == 0x{ADDR:x}; opcodes {live.hex()} "
          f"expected {BODY.hex()}  match={ident}")

    rng = random.Random(ADDR)
    banks = [realistic_bank(), special_bank(), adversarial_bank(rng)]
    cases = build_cases(rng, banks)
    native, native_rc = run_native(cases, fn)
    ts, ts_rc = run_ts(cases)
    bad, first = diff_count(native, ts)
    lanes = sum(len(b) // 4 for b in native)
    inside = sum(max(c["w"], 0) * max(c["h"], 0) * 4 for c in cases)
    rc_bad = sum(1 for a, b in zip(native_rc, ts_rc) if a != b)
    print(f"tiles={len(cases)}  f32 lanes compared={lanes}  of which inside the tile={inside}  "
          f"divergences={bad}  return-value mismatches={rc_bad}")
    if first:
        print(f"  first: case {first[0]} lane {first[1]} native={first[2]} ts={first[3]}")

    degen = [i for i, c in enumerate(cases) if c["w"] <= 0 or c["h"] <= 0]
    untouched = all(native[i] == cases[i]["outInit"] for i in degen)
    print(f"degenerate tiles (w<=0 or h<=0): {len(degen)} cases; the LIVE kernel left the poisoned "
          f"destination byte-identical = {untouched}")

    print("HARNESS LIVENESS (M0 is the unmutated port and must be 0; the rest MUST diverge):")
    m0, _ = diff_count(native, run_ts(cases)[0])
    print(f"  M0 {m0:6d} divergent lanes — the port as shipped, re-run through the same wire")
    m1, _ = diff_count(native, run_ts(cases, bank_shift=4)[0])
    print(f"  M1 {m1:6d} divergent lanes — every bank read shifted by 4 bytes")
    liveness_ok = (m0 == 0) and m1 > 0

    print("CORPUS SENSITIVITY (NOT mutants: each probe perturbs an input the LIVE kernel reads and "
          "re-runs it; a 0 means this corpus could not catch a port that IGNORED that input):")
    dead = []
    for off, kind in SLOTS:
        probe = []
        for c in cases:
            s = bytearray(c["bank"])
            n = 1 if kind == "s" else (8 if kind == "v" else 4)
            for l in range(n):
                if kind == "i":
                    cur = struct.unpack_from("<i", s, off + 4 * l)[0]
                    struct.pack_into("<i", s, off + 4 * l, cur + 1)
                else:
                    cur = struct.unpack_from("<f", s, off + 4 * l)[0]
                    # `cur * 1.5 + 0.125` is a NO-OP on an infinity or a NaN, and this bank holds
                    # both (+Inf at slot 5, -Inf in slot 1's alpha lane) — a probe that cannot move
                    # the value would report a dead slot that is merely un-perturbed.
                    nxt = f32(cur * 1.5 + 0.125)
                    if not (nxt == nxt) or nxt in (float("inf"), float("-inf")) or nxt == cur:
                        nxt = f32(37.5 + l)
                    put_f32(s, off + 4 * l, nxt)
            probe.append(dict(c, bank=bytes(s)))
        pn, _ = run_native(probe, fn)
        changed = sum(1 for a, b in zip(native, pn) for x, y in zip(hexes(a), hexes(b)) if x != y)
        if changed == 0:
            dead.append(f"bank +0x{off:x}")
        print(f"  {changed:6d} lanes move — bank +0x{off:03x} ({kind})")

    for lane in range(4):
        probe = []
        for c in cases:
            vals = list(c["in"])
            for i in range(lane, len(vals), 4):
                vals[i] = f32(vals[i] * 0.5 + 0.375)
            probe.append(dict(c, **{"in": vals}))
        pn, _ = run_native(probe, fn)
        changed = sum(1 for a, b in zip(native, pn) for x, y in zip(hexes(a), hexes(b)) if x != y)
        if changed == 0:
            dead.append(f"input lane {lane}")
        note = ("  <- alpha: passes through untouched, so it MUST still move the output"
                if lane == 3 else "")
        print(f"  {changed:6d} lanes move — input lane {lane}{note}")

    for name, key in (("in row stride", "inStride"), ("out row stride", "outStride")):
        probe = [dict(c, **{key: c[key] + 1, "n": c["n"] + 4 * max(c["h"], 0) + 4,
                            "in": c["in"] + [0.25] * (4 * max(c["h"], 0) + 4)}) for c in cases]
        pn, _ = run_native(probe, fn)
        changed = sum(1 for a, b in zip(native, pn)
                      for x, y in zip(hexes(a), hexes(b)) if x != y)
        if changed == 0:
            dead.append(name)
        print(f"  {changed:6d} lanes move — {name}")

    ok = ident and bad == 0 and rc_bad == 0 and untouched and liveness_ok and not dead
    for d in dead:
        print(f"  !! DEAD PROBE: {d} — the corpus is blind to it; this verdict does not cover it")
    if not liveness_ok:
        print("  !! DEAD CONTROL: either the mutant is equivalent or the harness is blind — "
              f"M0={m0} (must be 0), M1={m1} (must be > 0)")
    print("VERIFIED vs live Helium (bit-exact)" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
