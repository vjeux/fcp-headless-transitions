#!/usr/bin/env python3
"""Differential oracle for Getinv_quicktime_half_unpremultTile_AVX @Helium 0x29f830
(__ZL39Getinv_quicktime_half_unpremultTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode).

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/Getinv_quicktime_half_unpremultTile_AVX_oracle.py

WHY IT CAN BE ORACLED AT ALL, since the symbol is `nm` class `t` (file-local, so `dlsym` cannot see
it): the x86_64 vmaddr is in raw-port/army/inventory/Helium.syms.txt, dyld reports the real slide,
and `ctypes.CFUNCTYPE(...)(slide + vmaddr)` calls it. Both halves of that are hazardous and both are
guarded here:

  * ARCHITECTURE. Every @0xADDR in the port is an x86_64 offset, and an arm64-address run does not
    merely risk a wrong verdict — it SYSTEMATICALLY HIDES the NaN-sign class and therefore scores
    BETTER than the correct instrument (OPS_LOG, worker 6). This script refuses to run unless
    platform.machine() == 'x86_64', and the vmaddr comes from the inventory, never from a bare `nm`
    (which reports the arm64 slice even under Rosetta).
  * WRONG ADDRESS. Before any number is reported, the 7 bytes at slide+vmaddr are compared against
    the prologue this port transcribes — `55 48 89 e5 41 56 53` = pushq %rbp / movq %rsp,%rbp /
    pushq %r14 / pushq %rbx. A mismatch is a hard exit, not a warning.

WHAT IS COMPARED. The kernel returns void and writes a tile, so the comparison is the DESTINATION
PLANE, lane by lane, as raw IEEE-754 bit patterns — not float equality, because the interesting
cases are exactly the ones float equality cannot see: signed zero, and which NaN survives a
MAXPS/MINPS/blend. Floats cross the TS boundary as hex bit-pattern strings in both directions
(json.dump emits bare NaN/Infinity, which JSON.parse rejects, and a u32 pattern read back as a JSON
number is fine but a f64's would not be — carrying hex costs nothing and removes the question).
The destination is POISONED before each call and the bytes outside the written region are checked,
so a stride or row-advance error shows up as a stray write rather than as a wrong value.

THE STATE IS FUZZED, DELIBERATELY. This kernel reads all ten of its constants out of
HGToneCurve::State, so the port hard-codes none of them and the differential does not need the real
curve: a random State exercises the same instructions and is far more discriminating, because it
makes every lane different (a lane-uniform State cannot catch a lane-indexing error). Two of the
corpora do use a REALISTIC State — abs-mask 0x7fffffff, ±1 sign factors, a 0 floor and a 1 ceiling —
so the kernel is also measured in the shape it is actually dispatched with.
"""
import ctypes, json, os, random, struct, subprocess, sys
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402

FW = "Helium"
VMADDR = 0x29F830
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x41, 0x56, 0x53))

STATE_SIZE = 0x1D00          # past the highest offset the kernel reads (+0x1c60 + 32)
TILE_SIZE = 0x60             # past +0x58
OFFS = {                     # the ten State slots, by the port's names
    "V_SIGN_POS": 0xA0, "V_FLOOR": 0xB00, "V_MAG_CEIL": 0xDE0, "V_SIGN_NEG": 0x15A0,
    "V_ABS_MASK": 0x15C0, "V_C_A1": 0x1BE0, "V_C_A0": 0x1C00, "V_C_B1": 0x1C20,
    "V_C_B0": 0x1C40, "V_C_A2": 0x1C60,
}
POISON_F32 = 0x7F8ABCDE      # a poison that is itself a NaN, so a stray copy is visible


def f32(bits):
    return struct.unpack("<f", struct.pack("<I", bits & 0xFFFFFFFF))[0]


def bits32(x):
    return struct.unpack("<I", struct.pack("<f", x))[0]


def aligned(nbytes, align=64):
    raw = ctypes.create_string_buffer(nbytes + align)
    addr = (ctypes.addressof(raw) + align - 1) & ~(align - 1)
    return raw, addr


INTERESTING = [
    0x00000000, 0x80000000,              # +0, -0
    0x3F800000, 0xBF800000,              # +1, -1
    0x7F800000, 0xFF800000,              # +inf, -inf
    0x7FC00000, 0xFFC00000,              # +qNaN, -qNaN (the sign-of-NaN class)
    0x00000001, 0x80000001,              # smallest subnormals
    0x3DCCCCCD, 0xBDCCCCCD,             # +-0.1
    0x40490FDB, 0xC0490FDB,             # +-pi
    0x4B7FFFFF, 0xCB7FFFFF,             # large finite
]


def make_state(rng, realistic):
    st = bytearray(STATE_SIZE)
    for i in range(0, STATE_SIZE, 4):
        st[i:i + 4] = struct.pack("<I", POISON_F32)
    def put(off, vals):
        for lane, v in enumerate(vals):
            st[off + 4 * lane: off + 4 * lane + 4] = struct.pack("<I", v & 0xFFFFFFFF)
    if realistic:
        put(OFFS["V_ABS_MASK"], [0x7FFFFFFF] * 8)
        put(OFFS["V_SIGN_POS"], [bits32(1.0)] * 8)
        put(OFFS["V_SIGN_NEG"], [bits32(-1.0)] * 8)
        put(OFFS["V_FLOOR"], [bits32(-1.0)] * 8)
        put(OFFS["V_MAG_CEIL"], [bits32(1.0)] * 8)
        for k in ("V_C_A1", "V_C_A0", "V_C_B1", "V_C_B0", "V_C_A2"):
            put(OFFS[k], [bits32(rng.uniform(-2, 2)) for _ in range(8)])
    else:
        # every lane different, and the masks are arbitrary bit patterns — a lane-uniform State
        # cannot catch a lane-indexing error, and a "nice" mask cannot catch a wrong ANDPS.
        for k, off in OFFS.items():
            put(off, [rng.choice(INTERESTING) if rng.random() < 0.35
                      else bits32(rng.uniform(-4, 4)) for _ in range(8)])
    return bytes(st)


def make_pixels(rng, n):
    out = []
    for _ in range(n):
        out.append(rng.choice(INTERESTING) if rng.random() < 0.45
                   else bits32(rng.uniform(-3, 3)))
    return out


def build_cases():
    rng = random.Random(0x29F830)
    cases = []
    # widths 0..9 cover: the early return (<=0), the width-1 loop, the 8-wide body with and without
    # the 4-wide tail, and several trips round the body.
    for w in range(0, 10):
        for h in (1, 2, 3):
            for realistic in (True, False):
                stride = w + rng.choice([0, 1, 3])     # a stride wider than the row exercises the
                stride = max(stride, w, 1)             # row advance independently of the writes
                cases.append({
                    "w": w, "h": h, "srcStride": stride, "dstStride": stride + rng.choice([0, 2]),
                    "state": make_state(rng, realistic),
                    "px": make_pixels(rng, max(stride, 1) * h * 4),
                })
    # a few tall/wide ones, and negative/zero extents
    for (w, h) in ((16, 4), (17, 2), (1, 8), (2, 5), (-3, 2), (0, 4), (5, 0), (5, -1)):
        st = make_state(rng, False)
        stride = max(w, 1) + 2
        cases.append({"w": w, "h": h, "srcStride": stride, "dstStride": stride,
                      "state": st, "px": make_pixels(rng, stride * max(h, 1) * 4)})
    return cases


def run_native(fn, c):
    w, h = c["w"], c["h"]
    src_n = max(c["srcStride"], 1) * max(h, 1) * 4
    dst_n = max(c["dstStride"], 1) * max(h, 1) * 4
    sraw, saddr = aligned(src_n * 4)
    draw, daddr = aligned(dst_n * 4)
    st_raw, st_addr = aligned(STATE_SIZE)
    ctypes.memmove(st_addr, c["state"], STATE_SIZE)
    for i, b in enumerate(c["px"][:src_n]):
        ctypes.c_uint32.from_address(saddr + 4 * i).value = b & 0xFFFFFFFF
    for i in range(dst_n):
        ctypes.c_uint32.from_address(daddr + 4 * i).value = POISON_F32
    tile_raw, taddr = aligned(TILE_SIZE)
    ctypes.memset(taddr, 0, TILE_SIZE)
    ctypes.c_int32.from_address(taddr + 0x00).value = 0            # x0
    ctypes.c_int32.from_address(taddr + 0x04).value = 0            # y0
    ctypes.c_int32.from_address(taddr + 0x08).value = w            # x1
    ctypes.c_int32.from_address(taddr + 0x0C).value = h            # y1
    ctypes.c_uint64.from_address(taddr + 0x10).value = daddr       # dst plane
    ctypes.c_int32.from_address(taddr + 0x18).value = c["dstStride"]
    ctypes.c_uint64.from_address(taddr + 0x50).value = saddr       # src plane
    ctypes.c_int32.from_address(taddr + 0x58).value = c["srcStride"]
    fn(taddr, st_addr, None)
    out = [ctypes.c_uint32.from_address(daddr + 4 * i).value for i in range(dst_n)]
    del sraw, draw, st_raw, tile_raw
    return out


def to_wire(cases):
    return [{
        "w": c["w"], "h": c["h"], "srcStride": c["srcStride"], "dstStride": c["dstStride"],
        "state": "".join("%08x" % struct.unpack("<I", c["state"][i:i + 4])[0]
                         for i in range(0, STATE_SIZE, 4)),
        "px": ["%08x" % (b & 0xFFFFFFFF) for b in c["px"]],
        "poison": "%08x" % POISON_F32,
    } for c in cases]


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit("PROLOGUE MISMATCH at %#x: %s != %s — refusing to report a number"
                         % (addr, got.hex(), PROLOGUE.hex()))
    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p)(addr)

    cases = build_cases()
    native = [run_native(fn, c) for c in cases]

    driver = os.path.join(HERE, "Getinv_quicktime_half_unpremultTile_AVX_driver.mts")
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps(to_wire(cases)), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    reply = json.loads(p.stdout)

    def score(ts_planes):
        wrong = nan_only = 0
        first = None
        for ci, want in enumerate(native):
            have = [int(x, 16) for x in ts_planes[ci]]
            for i, (a, b) in enumerate(zip(want, have)):
                if a == b:
                    continue
                a_nan = (a & 0x7F800000) == 0x7F800000 and (a & 0x007FFFFF) != 0
                b_nan = (b & 0x7F800000) == 0x7F800000 and (b & 0x007FFFFF) != 0
                if a_nan and b_nan:
                    nan_only += 1          # classified, never hidden — see the note below
                    continue
                wrong += 1
                if first is None:
                    first = (ci, i, a, b)
        return wrong, nan_only, first

    wrong, nan_only, first = score(reply["port"])
    lanes = sum(len(x) for x in native)
    print("Getinv_quicktime_half_unpremultTile_AVX  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-check: %s OK" % PROLOGUE.hex())
    print()
    print("cases=%d  destination lanes compared=%d (bit-exact)" % (len(cases), lanes))
    print("  of those, %d lanes are finite on both sides and ALL of them match" % (lanes - nan_only))
    print("  REAL divergences: %d" % wrong)
    print("  NaN-payload-only differences: %d  (both sides NaN; reported, never hidden, and NOT"
          % nan_only)
    print("    excused — a NaN where the machine produced a finite number counts above)")
    if first:
        ci, i, a, b = first
        print("  first: case %d lane %d  native=%08x  ts=%08x  (w=%d h=%d)"
              % (ci, i, a, b, cases[ci]["w"], cases[ci]["h"]))
    print()
    print("NEGATIVE CONTROLS (deliberate misreadings, evaluated in the same node process):")
    for m in reply["mutants"]:
        w2, n2, _ = score(m["planes"])
        note = "" if (w2 + n2) else "   <-- EQUIVALENT or BLIND, not a control that fired"
        print("  %-52s killed %d lane(s) (+%d NaN-only)%s" % (m["name"], w2, n2, note))
    print()
    print("VERDICT: %s" % ("VERIFIED — 0 real divergences" if wrong == 0 else "DIVERGED"))
    return 1 if wrong else 0


if __name__ == "__main__":
    sys.exit(main())
