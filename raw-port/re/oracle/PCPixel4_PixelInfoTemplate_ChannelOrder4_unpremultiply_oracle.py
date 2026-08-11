#!/usr/bin/env python3
"""PCPixel4<PixelInfoTemplate<(ChannelOrder)4>>::unpremultiply() @ProCore 0x4806a
— differential of the TS port against the LIVE binary.

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/PCPixel4_PixelInfoTemplate_ChannelOrder4_unpremultiply_oracle.py

WHY ROSETTA: every @0xADDR in the port is an x86_64 vmaddr and `disasm.sh` thins to that
slice, while this box is arm64 — OPS_LOG's "the executable oracle calls the wrong
architecture, and fails toward ACCEPT". This body is a precision ladder
(f64 -> f32 -> f64) around a `roundsd`/`cvttsd2si` boundary with a `+ 0.5 + 1e-07` bias, so
it is exactly the kind of code where the two slices can disagree.

THE SYMBOL IS LOCAL (`t`), so dlsym cannot reach it: it is called at slide + 0x4806a, and
the ten bytes there are checked against the encoding of the transcribed first three
instructions —

    0f b6 07              movzbl (%rdi), %eax
    3d ff 00 00 00        cmpl   $0xff, %eax
    74 0e                 je     0x48082          (0x48074 + 0x0e)

— which pins the address AND the instruction lengths the transcription depends on.

WHAT IS MEASURED. The input domain of one channel is small enough to take ALL of it:
alpha 0..255 x channel value 0..255 = 65,536 pixels, every one of them called on the live
routine and rendered again by the port, compared BYTE FOR BYTE. Three further passes cover
what an all-channels-equal sweep cannot: independent random channel values, the two early
exits, and — the claim a return-value comparison can never make — that the routine writes
ONLY +0x01..+0x03, checked by giving each pixel a poisoned 16-byte neighbourhood and
diffing all of it.

NEGATIVE CONTROLS are MUTATIONS OF THE REAL PORT FILE (one token each, run through the same
driver via `modulePath`), scored beside the unmutated baseline.
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
PORT_TS = os.path.abspath(os.path.join(HERE, "..", "..", "src", "infra",
                                       "PCPixel4_PixelInfoTemplate_ChannelOrder4.ts"))
DRIVER = os.path.join(HERE, "PCPixel4_PixelInfoTemplate_ChannelOrder4_unpremultiply_driver.mts")

FW = "ProCore"
VMADDR = 0x4806A
PROLOGUE = bytes.fromhex("0fb6073dff000000740e")

PAD = 6            # poison bytes on each side of the 4-byte pixel
CELL = 4 + 2 * PAD


def ts_render(pixels, module_path=None):
    req = {"pixels": pixels}
    if module_path:
        req["modulePath"] = module_path
    p = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                       input=json.dumps(req), capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stderr[-2000:])
    return json.loads(p.stdout)["pixels"]


def live_render(fn, pixels):
    """Call the real routine once per pixel, each in its own poisoned neighbourhood so that a
    write outside the object is visible."""
    n = len(pixels) // 4
    buf = ctypes.create_string_buffer(n * CELL)
    addr = ctypes.addressof(buf)
    poison = bytes((0xC0 + (i * 37) % 0x3F) for i in range(CELL))
    for i in range(n):
        ctypes.memmove(addr + i * CELL, poison, CELL)
        ctypes.memmove(addr + i * CELL + PAD, bytes(pixels[i * 4:i * 4 + 4]), 4)
    before = bytes(buf.raw)
    for i in range(n):
        fn(addr + i * CELL + PAD)
    after = bytes(buf.raw)
    out, stray = [], 0
    for i in range(n):
        cell_b = before[i * CELL:(i + 1) * CELL]
        cell_a = after[i * CELL:(i + 1) * CELL]
        out.extend(cell_a[PAD:PAD + 4])
        if cell_b[:PAD] != cell_a[:PAD] or cell_b[PAD + 4:] != cell_a[PAD + 4:]:
            stray += 1
        if cell_b[PAD] != cell_a[PAD]:
            stray += 1               # alpha at +0x00 must never be written
    return out, stray


def compare(name, pixels, live, ts):
    bad = [(i, pixels[i], live[i], ts[i]) for i in range(len(live)) if live[i] != ts[i]]
    print(f"{name:<34} {len(live) // 4:>7} pixels  {len(live) - len(bad):>7}/{len(live)} bytes exact"
          f"  {len(bad):>5} differing")
    for i, inp, lv, t in bad[:6]:
        print(f"    pixel {i // 4} byte +0x{i % 4:x}: in={inp} live={lv} ts={t} "
              f"(alpha={pixels[(i // 4) * 4]})")
    return bad


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    here = ctypes.string_at(addr, len(PROLOGUE))
    print(f"image        : {image}")
    print(f"slide+vmaddr : {slide:#x} + {VMADDR:#x} = {addr:#x}")
    print(f"prologue     : {here.hex()}  expected {PROLOGUE.hex()}")
    if here != PROLOGUE:
        print("SELF-CHECK FAILED — the bytes at the address are not the transcribed body.")
        return 1
    print("self-check   : OK\n")
    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p)(addr)

    passes = {}
    # 1. EXHAUSTIVE over (alpha, value) with all three colour channels equal.
    px = []
    for a in range(256):
        for v in range(256):
            px.extend([a, v, v, v])
    passes["exhaustive alpha x value"] = px
    # 2. Independent channels: the sweep above cannot see a channel confusion.
    rng = random.Random(0xB16)
    px = []
    for _ in range(20000):
        px.extend([rng.randrange(256), rng.randrange(256), rng.randrange(256), rng.randrange(256)])
    passes["independent random channels"] = px
    # 3. The two early exits, with distinct colour bytes so a wrong store shows.
    px = []
    for a in (0, 255):
        for v in range(256):
            px.extend([a, v, (v * 7) & 0xFF, (v * 13) & 0xFF])
    passes["early exits (alpha 0 and 255)"] = px

    total_bad, total_stray, total_px = 0, 0, 0
    baseline = {}
    for name, pixels in passes.items():
        live, stray = live_render(fn, pixels)
        ts = ts_render(pixels)
        bad = compare(name, pixels, live, ts)
        baseline[name] = (pixels, live, ts)
        total_bad += len(bad)
        total_stray += stray
        total_px += len(pixels) // 4
    print(f"\npixels compared          : {total_px}")
    print(f"differing bytes          : {total_bad}")
    print(f"pixels where the routine wrote OUTSIDE +0x01..+0x03 (incl. alpha): {total_stray}")

    src = open(PORT_TS).read()
    # The output byte at +0x0k depends ONLY on (alpha, b[k]) — `inv` is a function of alpha
    # alone and the three channels never interact — so pass 1 above, 256 x 256, EXHAUSTS the
    # function's entire input domain. That is what makes it possible to say of a surviving
    # mutant that it is EQUIVALENT rather than that the harness is blind: there is no input
    # left to try.
    MUTANTS = {
        "m1_no_1e7_bias": ("+ K_HALF + K_1E_7", "+ K_HALF"),
        "m2_no_f32_roundtrip": ("const scaled = f32((b[off]! & 0xff) * K_1_OVER_255);",
                                "const scaled = (b[off]! & 0xff) * K_1_OVER_255;"),
        "m3_round_not_floor": ("Math.floor(rounded)", "Math.round(rounded)"),
        "m4_alpha255_falls_through": ("if (alpha === 0xff) {", "if (false) {"),
        "m5_clamp_high_off_by_one": ("v = 255;", "v = 254;"),
        "m6_alpha0_leaves_channel3": ("b[3] = 0; // @0x48078", "// @0x48078"),
        "m7_alpha_read_from_0x01": ("const alpha = b[0]! & 0xff;", "const alpha = b[1]! & 0xff;"),
        "m8_scale_256_not_255": ("const K_255_F = f32(255.0);", "const K_255_F = f32(256.0);"),
    }
    # Mutants that CANNOT change the answer, with the reason. Each was predicted from the
    # code and then confirmed against the exhausted domain; a survivor NOT on this list is a
    # failure.
    EQUIVALENT = {
        "m1_no_1e7_bias":
            "the +1e-07 can only matter when (value + 0.5) lands within 1e-07 below an "
            "integer, and over the whole 256x256 domain it never does — the bias is inert "
            "here, which is worth knowing and is not a hole in the harness",
        "m4_alpha255_falls_through":
            "with alpha = 255, inv = 1.0f exactly and the ladder returns each channel "
            "unchanged, so the `je` at 0x48072 is a fast path rather than a special case — "
            "confirmed for all 256 channel values",
    }
    tmpdir = tempfile.mkdtemp(prefix="pcpixel4_mut_")
    print("\n-- NEGATIVE CONTROLS (mutations of the real port file) --")
    print(f"   baseline M0: {total_px} pixels, {total_bad} differing bytes, {total_stray} strays")
    ok = total_bad == 0 and total_stray == 0
    for name, (a, b) in MUTANTS.items():
        if a not in src:
            print(f"   {name}: PATTERN NOT FOUND — no evidence, not a kill")
            ok = False
            continue
        path = os.path.join(tmpdir, f"{name}.ts")
        open(path, "w").write(src.replace(a, b, 1))
        killed = 0
        for pname, (pixels, live, _ts) in baseline.items():
            mt = ts_render(pixels, path)
            killed += sum(1 for i in range(len(live)) if live[i] != mt[i])
        if killed == 0 and name in EQUIVALENT:
            print(f"   {name}: killed 0 — EQUIVALENT, not blind: {EQUIVALENT[name]}")
        elif killed == 0:
            print(f"   {name}: killed 0 byte(s)")
            print("   !! killed 0 and it is not on the EQUIVALENT list — the harness is blind "
                  "here. Not a clean run.")
            ok = False
        else:
            print(f"   {name}: killed {killed} byte(s)")
            if name in EQUIVALENT:
                print("   !! predicted EQUIVALENT and it was killed — the prediction was wrong, "
                      "which is itself a finding. Not a clean run.")
                ok = False

    print("\n" + ("VERDICT: VERIFIED — the whole (alpha, value) domain is byte-exact against the "
                 "live routine, independent channels and both early exits agree, and the routine "
                 "writes nothing outside +0x01..+0x03"
                 if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
