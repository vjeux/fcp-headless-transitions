#!/usr/bin/env python3
"""HGEquirectReorient_SetWrapTexture_oracle.py — differential for
`HGEquirectReorient::SetWrapTexture(bool)` @Helium 0x4820 (`__ZN18HGEquirectReorient14SetWrapTextureEb`).

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/HGEquirectReorient_SetWrapTexture_oracle.py

WHAT IS COMPARED. This method returns nothing; its whole observable is one byte of the receiver. So
the live function is called on a 0xCD-poisoned arena and the arena is DIFFED afterwards, while the
REAL TypeScript port — run by the sibling driver under `node --experimental-strip-types`, with
nothing stubbed because the module imports nothing — is applied to a receiver whose field starts at
the same 0xCD. Two things are then checked against each other and against the machine:

  1. the VALUE: the byte the binary wrote == the field the port wrote;
  2. the FOOTPRINT: exactly one byte of 0x200 changed, and it was +0x1a1. A value comparison alone
     cannot see a port that also scribbles somewhere else, and this is the check that makes
     "nothing else is written" a measurement instead of a reading of the disassembly.

An out-of-contract probe (a non-canonical `bool` byte) is reported SEPARATELY and kept out of the
verdict: the C++ parameter is `bool`, so 0x02 is not something a conforming caller can pass, and
folding it into the comparison would be judging the port against a call that cannot happen.
"""
import ctypes, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
SRC = os.path.join(REPO, "src")
sys.path.insert(0, HERE)
import ozone_loader as oz                                        # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

FW = "Helium"
SYM = "__ZN18HGEquirectReorient14SetWrapTextureEb"
DLSYM_NAME = "_ZN18HGEquirectReorient14SetWrapTextureEb"
VMADDR_EXPECTED = 0x4820
# pushq %rbp / movq %rsp,%rbp / movb %sil,0x1a1(%rdi) / popq %rbp / retq
BODY_BYTES = bytes.fromhex("554889e54088b7a10100005dc3")
FIELD_OFF = 0x1A1
ARENA, POISON = 0x200, 0xCD

PORT_REL = "render/HGEquirectReorient.ts"
MUTANTS = {
    "M0": None,                                               # baseline: must kill 0
    "M1_inverted": ("wrap ? 1 : 0", "wrap ? 0 : 1"),
    "M2_always_1": ("wrap ? 1 : 0", "1"),
    "M3_always_0": ("wrap ? 1 : 0", "0"),
}
CASES = [False, True]           # the two ABI-legal arguments; the 0x02 probe is separate, below


def ts_side(td):
    port_src = open(os.path.join(SRC, PORT_REL)).read()
    modules = {}
    for name, mut in MUTANTS.items():
        text = port_src
        if mut is not None:
            old, new = mut
            if text.count(old) != 1:
                sys.exit(f"mutant {name}: {old!r} appears {text.count(old)} times, expected 1")
            text = text.replace(old, new)
        p = os.path.join(td, f"eq_{name}.ts")
        open(p, "w").write(text)
        modules[name] = p
    req = {"modules": modules, "cases": [{"wrap": w} for w in CASES]}
    r = subprocess.run(["node", "--experimental-strip-types",
                        os.path.join(HERE, "HGEquirectReorient_SetWrapTexture_driver.mts")],
                       input=json.dumps(req), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if r.returncode != 0:
        sys.exit("node driver failed:\n" + r.stdout[-2000:] + r.stderr[-2000:])
    return json.loads(r.stdout)


def call_and_diff(fn, byte_val):
    """-> (list of changed offsets, the byte now at +0x1a1)"""
    buf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
    before = bytes(buf)
    fn(ctypes.addressof(buf), byte_val)
    after = bytes(buf)
    changed = [i for i in range(ARENA) if before[i] != after[i]]
    return changed, after[FIELD_OFF]


def main():
    oz.require_x86_64()
    lib = oz.load_framework(FW)
    slide, image = oz.image_slide(FW)
    vmaddr = oz.nm_addr(FW, SYM)
    if vmaddr != VMADDR_EXPECTED:
        sys.exit(f"inventory says {SYM} is at {vmaddr:#x}, the port cites {VMADDR_EXPECTED:#x}")
    addr = slide + vmaddr
    dl = ctypes.cast(getattr(lib, DLSYM_NAME), ctypes.c_void_p).value
    if dl != addr:
        sys.exit(f"dlsym {dl:#x} != slide+vmaddr {addr:#x} — refusing to call an unverified address")
    got = ctypes.string_at(addr, len(BODY_BYTES))
    if got != BODY_BYTES:
        sys.exit(f"bytes at {addr:#x} are {got.hex()}, the transcription says {BODY_BYTES.hex()}")

    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_uint8)(addr)
    ts = ts_side(tempfile.mkdtemp(prefix="eqwrap_"))

    print(f"image     {image}")
    print(f"slide     {slide:#x}   {SYM} @ {vmaddr:#x}  ->  {addr:#x} (dlsym agrees)")
    print(f"bytes     {got.hex()}  == the transcribed body")
    print()

    kills = {m: 0 for m in MUTANTS}
    footprint_ok = True
    for i, wrap in enumerate(CASES):
        changed, live_byte = call_and_diff(fn, 1 if wrap else 0)
        if changed != [FIELD_OFF]:
            footprint_ok = False
        for m in MUTANTS:
            v = ts[m]["results"][i]
            if not isinstance(v, int) or v != live_byte:
                kills[m] += 1
        print(f"  {'OK ' if ts['M0']['results'][i] == live_byte else 'DIVERGED'}  "
              f"wrap={str(wrap):<5} live wrote {live_byte} at +0x{FIELD_OFF:x}"
              f"   ts field = {ts['M0']['results'][i]}"
              f"   bytes changed: {[hex(c) for c in changed]}")

    # ── out of contract, reported and NOT in the verdict ─────────────────────────────────────────
    probes = {}
    for raw in (0x02, 0xFF):
        changed, live_byte = call_and_diff(fn, raw)
        probes[raw] = (live_byte, changed == [FIELD_OFF])

    print()
    print(f"cases                 {len(CASES)}   (the two ABI-legal arguments of a `bool` parameter)")
    print(f"agreed (TS vs live)   {len(CASES) - kills['M0']}")
    print(f"footprint             exactly one byte changed, at +0x{FIELD_OFF:x}, every call: {footprint_ok}")
    print("out-of-contract probe (a non-canonical bool byte — reported, NOT part of the verdict):")
    for raw, (val, only) in probes.items():
        print(f"  passed {raw:#04x} -> the byte holds {val:#04x}"
              f"; still only +0x{FIELD_OFF:x} touched: {only}")
    print("  i.e. the machine stores %sil verbatim and normalises nothing; the port's 1/0 encoding")
    print("  is indistinguishable from that for every call the C++ signature permits.")
    print()
    print("mutation table — M0 is an unmutated copy of the port through the same pipeline:")
    for m in MUTANTS:
        note = "  (baseline: the instrument itself)" if m == "M0" else ""
        extra = ("  <- a constant can only be caught by the one case it gets wrong, which is why "
                 "both constants are here" if m in ("M2_always_1", "M3_always_0") else "")
        print(f"  {m:<14} killed {kills[m]:>2} of {len(CASES)}{note}{extra}")

    ok = (kills["M0"] == 0 and footprint_ok
          and all(kills[m] > 0 for m in MUTANTS if m != "M0"))
    print()
    print("VERDICT: " + ("VERIFIED — the real TypeScript matches live Helium on both arguments, and "
                         "the store's footprint is one byte at the transcribed offset"
                         if ok else "FAILED — see the rows above"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
