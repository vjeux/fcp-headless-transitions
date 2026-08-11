#!/usr/bin/env python3
"""Differential oracle for Gettype1_half_unpremultTile_AVX(HGTile*, HGToneCurve::State*, HGNode*)
   @Helium 0x2945e0  (__ZL31Gettype1_half_unpremultTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode)

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/Gettype1_half_unpremultTile_AVX_oracle.py

Rosetta is required and enforced (ozone_loader.require_x86_64): every @0xADDR in the port is an
x86_64 offset, and the AVX slice does not even exist in the arm64 image — OPS_LOG, "the executable
oracle calls the wrong architecture ... fails silently toward VERIFIED". AVX kernels DO execute
under Rosetta; the feature bits lie, so this probes by EXECUTING.

The symbol is file-local (`nm` class `t`), so dlsym cannot reach it: it is called at
`_dyld_get_image_vmaddr_slide(Helium) + 0x2945e0` through ozone_loader.local_fn, and the opcode
bytes at that address are checked against the disassembly before anything is believed.

WHAT IS COMPARED. Real tiles in real process memory: a source plane, a poisoned destination plane
and a 0x960-byte HGToneCurve::State, all 32-byte aligned. The live kernel runs on them; the TS
port runs on identical bytes; every f32 of the destination plane is compared BIT-FOR-BIT,
including the padding texels beyond the tile width that the kernel must NOT touch. This kernel
contains no `vrcpps`/`vdivps`/`vsqrtps` — every operation is exactly specified — so the bar is 0
divergences, not an ulp budget.

Two State presets:
  * REALISTIC — a working log2/exp2 constant set (mantissa mask, 1.0, bias 127, sqrt2 split, …),
    so the common path runs with values in normal range;
  * ADVERSARIAL — random f32 in every vector slot, which drives the polynomial into overflow,
    denormals, NaN and the `vcvttps2dq` out-of-range case. Any of those disagreeing would show up
    here rather than in production.

CONTROLS. There are two kinds and they prove different things, which is worth being explicit
about (OPS_LOG: "a dead negative control means your harness is blind or your mutant is equivalent
— say which, next to the numbers"):

  * HARNESS LIVENESS (a true mutant): the TS port is re-run with every State read shifted by 4
    bytes. That is a deliberately wrong port; it MUST diverge. If it does not, the comparison is
    not actually comparing anything.
  * CORPUS SENSITIVITY (not mutants): each State slot the kernel reads is perturbed in turn and
    the LIVE kernel re-run; the number of output lanes that change is reported. A slot with ZERO
    sensitivity means this corpus could not tell a port that ignored that constant from one that
    used it — i.e. the differential is blind THERE, even though it passed. The same probe is run
    for each of the four input lanes (which also pins the alpha-lane passthrough) and for the two
    row strides.
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

SYM = "__ZL31Gettype1_half_unpremultTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode"
ADDR = 0x2945E0
# pushq %rbp is NOT first here: the height test runs before the frame is built.
BODY = bytes([0x8B, 0x47, 0x0C, 0x2B, 0x47, 0x04, 0x0F, 0x8E])  # movl 0xc(%rdi),%eax; subl 0x4(%rdi),%eax; jle
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.path.join(REPO, "raw-port", "re", "oracle",
                         "Gettype1_half_unpremultTile_AVX_driver.ts")

STATE_SIZE = 0x960
TILE_SIZE = 0x60
# HGTile offsets read by this kernel (see the port's interface for the citing instructions).
T_X0, T_Y0, T_X1, T_Y1 = 0x00, 0x04, 0x08, 0x0C
T_OUT, T_OUTSTRIDE, T_IN, T_INSTRIDE = 0x10, 0x18, 0x50, 0x58

# The State slots this kernel reads, as (offset, kind) — kind 's' scalar, 'v' 32-byte vector,
# 'i' 16-byte integer vector.
SLOTS = [(0x00, "s"), (0x04, "s"), (0x0C, "s"), (0x24, "s"),
         (0xA0, "v"), (0x240, "v"), (0x260, "v"), (0x280, "v"), (0x2A0, "v"), (0x2C0, "v"),
         (0x2E0, "v"), (0x300, "v"), (0x320, "v"), (0x340, "v"), (0x360, "v"), (0x380, "v"),
         (0x3A0, "v"), (0x3C0, "v"), (0x3E0, "v"), (0x400, "i"), (0x940, "v")]


def aligned_buffer(nbytes, align=32):
    raw = ctypes.create_string_buffer(nbytes + align)
    addr = ctypes.addressof(raw)
    off = (-addr) % align
    return raw, addr + off, off


def f32(x):
    return struct.unpack("<f", struct.pack("<f", x))[0]


def put_f32(buf, off, val):
    struct.pack_into("<f", buf, off, val)


def realistic_state(rng):
    s = bytearray(b"\x00" * STATE_SIZE)
    put_f32(s, 0x00, 0.45454545)          # gamma exponent
    put_f32(s, 0x04, 0.0)                 # pre-offset
    put_f32(s, 0x0C, 1.0)                 # post scale
    put_f32(s, 0x24, 0.0)                 # linear threshold
    for l in range(8):
        put_f32(s, 0xA0 + 4 * l, 1.0)                                    # one
        struct.pack_into("<I", s, 0x240 + 4 * l, 0x807FFFFF)             # mantissa mask
        put_f32(s, 0x260 + 4 * l, 1.1754944e-38)                         # denormal cutoff
        put_f32(s, 0x280 + 4 * l, 25.0)                                  # cutoff exponent adj
        put_f32(s, 0x2A0 + 4 * l, 127.0)                                 # exponent bias
        put_f32(s, 0x2C0 + 4 * l, 1.4142135)                             # sqrt(2) split
        put_f32(s, 0x2E0 + 4 * l, 0.5)                                   # split scale
        put_f32(s, 0x300 + 4 * l, -0.16852903)                           # log poly
        put_f32(s, 0x320 + 4 * l, 0.20501402)
        put_f32(s, 0x340 + 4 * l, -0.72116581)
        put_f32(s, 0x360 + 4 * l, 1.4426950)
        put_f32(s, 0x380 + 4 * l, -126.0)                                # exp floor
        put_f32(s, 0x3A0 + 4 * l, 0.05550410)                            # exp poly
        put_f32(s, 0x3C0 + 4 * l, 0.24022651)
        put_f32(s, 0x3E0 + 4 * l, 0.69314718)
    for l in range(4):
        struct.pack_into("<i", s, 0x400 + 4 * l, 127)                    # exp2 integer bias
    for l in range(8):
        put_f32(s, 0x940 + 4 * l, 0.0 if (l & 3) != 3 else 1.0)          # lo clamp / hi clamp
    return bytes(s)


def adversarial_state(rng):
    s = bytearray(realistic_state(rng))
    for off, kind in SLOTS:
        n = 1 if kind == "s" else (8 if kind == "v" else 4)
        for l in range(n):
            if kind == "i":
                struct.pack_into("<i", s, off + 4 * l, rng.randrange(-140, 140))
            else:
                put_f32(s, off + 4 * l, rng.uniform(-4.0, 4.0))
    return bytes(s)


def build_cases(rng, states):
    cases = []
    for si, state in enumerate(states):
        for (w, h) in [(0, 3), (1, 1), (1, 3), (2, 1), (3, 2), (4, 1), (5, 3), (8, 2), (9, 4),
                       (7, 1), (6, 5), (2, 0)]:
            stride = w + rng.randrange(0, 3)          # padding the kernel must not touch
            n_in = max(1, (h + 1) * max(stride, 1) * 4)
            vals = []
            for _ in range(n_in):
                r = rng.random()
                if r < 0.12:
                    vals.append(rng.choice([0.0, -0.0, 1.0, -1.0, float("inf"),
                                            float("-inf"), float("nan"), 1e-40, 3.4e38]))
                else:
                    vals.append(rng.uniform(-2.0, 2.0))
            cases.append({"w": w, "h": h, "inStride": stride, "outStride": stride,
                          "n": n_in, "in": [f32(v) for v in vals], "state": state,
                          "preset": si})
    return cases


def run_native(cases, fn):
    outs = []
    for c in cases:
        st_raw, st_addr, _ = aligned_buffer(STATE_SIZE)
        ctypes.memmove(st_addr, c["state"], STATE_SIZE)
        in_raw, in_addr, _ = aligned_buffer(4 * c["n"])
        out_raw, out_addr, _ = aligned_buffer(4 * c["n"])
        for i, v in enumerate(c["in"]):
            struct.pack_into("<f", (ctypes.c_char * (4 * c["n"])).from_address(in_addr), 4 * i, v)
        ctypes.memset(out_addr, 0xCD, 4 * c["n"])
        c["outInit"] = ctypes.string_at(out_addr, 4 * c["n"])

        tile = ctypes.create_string_buffer(TILE_SIZE)
        struct.pack_into("<i", tile, T_X0, 0)
        struct.pack_into("<i", tile, T_Y0, 0)
        struct.pack_into("<i", tile, T_X1, c["w"])
        struct.pack_into("<i", tile, T_Y1, c["h"])
        struct.pack_into("<Q", tile, T_OUT, out_addr)
        struct.pack_into("<i", tile, T_OUTSTRIDE, c["outStride"])
        struct.pack_into("<Q", tile, T_IN, in_addr)
        struct.pack_into("<i", tile, T_INSTRIDE, c["inStride"])

        fn(ctypes.addressof(tile), st_addr, None)
        outs.append(ctypes.string_at(out_addr, 4 * c["n"]))
        del st_raw, in_raw, out_raw
    return outs


def hexes(blob):
    return ["%08x" % struct.unpack_from("<I", blob, 4 * i)[0] for i in range(len(blob) // 4)]


def run_ts(cases, state_shift=0):
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    wire = [{"w": c["w"], "h": c["h"], "inStride": c["inStride"], "outStride": c["outStride"],
             "inPlane": ["%08x" % struct.unpack("<I", struct.pack("<f", v))[0] for v in c["in"]],
             "outPlane": hexes(c["outInit"]),
             "state": c["state"].hex(),
             "stateShift": state_shift}
            for c in cases]
    p = subprocess.run([tsx, TS_DRIVER], input=json.dumps(wire), capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"))
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout[-4000:] + p.stderr[-4000:])
    return json.loads(p.stdout.strip().splitlines()[-1])


def diff_count(native_blobs, ts_hex):
    bad = 0
    first = None
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
        "Helium", SYM, None, [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p])

    live = ctypes.string_at(slide + ADDR, len(BODY))
    ident = (addr == ADDR) and live == BODY
    print(f"identity: nm addr 0x{addr:x} == 0x{ADDR:x}; opcodes {live.hex()} "
          f"expected {BODY.hex()}  match={ident}")

    rng = random.Random(ADDR)
    states = [realistic_state(rng), adversarial_state(rng)]
    cases = build_cases(rng, states)
    native = run_native(cases, fn)
    ts = run_ts(cases)
    bad, first = diff_count(native, ts)
    lanes = sum(len(b) // 4 for b in native)
    touched = sum(c["w"] * c["h"] * 4 for c in cases)
    print(f"tiles={len(cases)}  f32 lanes compared={lanes}  of which inside the tile={touched}  "
          f"divergences={bad}")
    if first:
        print(f"  first: case {first[0]} lane {first[1]} native={first[2]} ts={first[3]}")

    print("HARNESS LIVENESS (a true mutant of the port — it MUST diverge):")
    mbad, _ = diff_count(native, run_ts(cases, state_shift=4))
    print(f"  {mbad:6d} divergent lanes — every State read shifted by 4 bytes")
    liveness_ok = mbad > 0

    print("CORPUS SENSITIVITY (NOT mutants: each probe perturbs an input the kernel reads and "
          "re-runs the LIVE kernel; a 0 means this corpus could not catch a port that IGNORED "
          "that input):")
    dead = []
    for off, kind in SLOTS:
        probe = []
        for c in cases:
            s = bytearray(c["state"])
            n = 1 if kind == "s" else (8 if kind == "v" else 4)
            for l in range(n):
                if kind == "i":
                    cur = struct.unpack_from("<i", s, off + 4 * l)[0]
                    struct.pack_into("<i", s, off + 4 * l, cur + 1)
                else:
                    cur = struct.unpack_from("<f", s, off + 4 * l)[0]
                    put_f32(s, off + 4 * l, f32(cur * 1.5 + 0.125))
            probe.append(dict(c, state=bytes(s)))
        pn = run_native(probe, fn)
        changed = sum(1 for a, b in zip(native, pn) for x, y in zip(hexes(a), hexes(b)) if x != y)
        if changed == 0:
            dead.append(f"State +0x{off:x}")
        print(f"  {changed:6d} lanes move — State +0x{off:03x} ({kind})")

    for lane in range(4):
        probe = []
        for c in cases:
            vals = list(c["in"])
            for i in range(lane, len(vals), 4):
                vals[i] = f32(vals[i] * 0.5 + 0.375)
            probe.append(dict(c, **{"in": vals}))
        pn = run_native(probe, fn)
        changed = sum(1 for a, b in zip(native, pn) for x, y in zip(hexes(a), hexes(b)) if x != y)
        if changed == 0:
            dead.append(f"input lane {lane}")
        note = "  <- alpha: passes through untouched, so it MUST still move the output" if lane == 3 else ""
        print(f"  {changed:6d} lanes move — input lane {lane}{note}")

    ok = ident and bad == 0 and liveness_ok and not dead
    for d in dead:
        print(f"  !! DEAD PROBE: {d} — the corpus is blind to it; this verdict does not cover it")
    if not liveness_ok:
        print("  !! DEAD MUTANT: a 4-byte State shift produced no divergence — the comparison "
              "is not comparing anything")
    print("VERIFIED vs live Helium (bit-exact)" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
