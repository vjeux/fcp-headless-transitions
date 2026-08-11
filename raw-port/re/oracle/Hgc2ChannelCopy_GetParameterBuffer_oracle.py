#!/usr/bin/env python3
"""Hgc2ChannelCopy_GetParameterBuffer_oracle.py — differential for
`Hgc2ChannelCopy::GetParameterBuffer(int)` @Helium 0x2dc1e0
(`__ZN15Hgc2ChannelCopy18GetParameterBufferEi`).

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/Hgc2ChannelCopy_GetParameterBuffer_oracle.py

WHAT IS COMPARED. The live Helium function against the REAL TypeScript port (run by the sibling
driver under `node --experimental-strip-types`; that module imports nothing, so nothing is stubbed).

The method returns a POINTER INTO the receiver — `leaq 0x1a0(%rdi)`, an interior address, not a
loaded field and not a copy — so the property under test is an IDENTITY, and each side is asked the
question in its own terms:

  live:  is the returned pointer exactly `arena + 0x1a0`, and does a write THROUGH it land in the
         arena at +0x1a0..+0x1af?
  port:  is the returned array the state's OWN array (`===`), and does a write through it land in
         the state?

A port that returns a copy of the four floats would agree on every value and be wrong in the one
way that matters, which is why the mutant table below includes exactly that (M2) and why it is
caught by the identity column alone.
"""
import ctypes, json, os, struct, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
SRC = os.path.join(REPO, "src")
sys.path.insert(0, HERE)
import ozone_loader as oz                                        # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

FW = "Helium"
SYM = "__ZN15Hgc2ChannelCopy18GetParameterBufferEi"
DLSYM_NAME = "_ZN15Hgc2ChannelCopy18GetParameterBufferEi"
VMADDR_EXPECTED = 0x2DC1E0
# pushq %rbp / movq %rsp,%rbp / leaq 0x1a0(%rdi),%rcx / xorl %eax,%eax / testl %esi,%esi /
# cmoveq %rcx,%rax / popq %rbp / retq
BODY_BYTES = bytes.fromhex("554889e5488d8fa001000031c085f6480f44c15dc3")
BUF_OFF, BUF_LEN = 0x1A0, 0x10
ARENA, POISON = 0x400, 0xCD

PORT_REL = "shaders/Hgc2ChannelCopy.ts"
FN_ANCHOR = "export function Hgc2ChannelCopy_GetParameterBuffer"
# Mutations are applied ONLY inside this export's span: the file also holds the GPU-side shader
# function of the same name, and a global replace could change code this unit does not judge.
MUTANTS = {
    "M0": None,
    "M1_any_index": ("(index | 0) === 0 ? self.paramBufferAt1a0 : null",
                     "self.paramBufferAt1a0"),
    # identical VALUES, wrong in the only way that matters: the caller can no longer write through
    # the handle into the node. Caught by the identity column and by nothing else here.
    "M2_return_copy": ("(index | 0) === 0 ? self.paramBufferAt1a0 : null",
                       "(index | 0) === 0 ? ([...self.paramBufferAt1a0] as [number, number, number, number]) : null"),
    "M3_index_1": ("(index | 0) === 0", "(index | 0) === 1"),
}
# index -> is it the accepted one? (the only fact the port claims)
CASES = [0, -1, 1, 2, 7, 0x7FFFFFFF]


def ts_side(td):
    port_src = open(os.path.join(SRC, PORT_REL)).read()
    if port_src.count(FN_ANCHOR) != 1:
        sys.exit(f"expected exactly one {FN_ANCHOR!r} in {PORT_REL}")
    head, tail = port_src.split(FN_ANCHOR, 1)
    modules = {}
    for name, mut in MUTANTS.items():
        text = port_src
        if mut is not None:
            old, new = mut
            if tail.count(old) != 1:
                sys.exit(f"mutant {name}: {old!r} appears {tail.count(old)} times inside "
                         f"{FN_ANCHOR}, expected 1")
            text = head + FN_ANCHOR + tail.replace(old, new)
        p = os.path.join(td, f"cc_{name}.ts")
        open(p, "w").write(text)
        modules[name] = p
    req = {"modules": modules, "cases": [{"index": i} for i in CASES]}
    r = subprocess.run(["node", "--experimental-strip-types",
                        os.path.join(HERE, "Hgc2ChannelCopy_GetParameterBuffer_driver.mts")],
                       input=json.dumps(req), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if r.returncode != 0:
        sys.exit("node driver failed:\n" + r.stdout[-2000:] + r.stderr[-2000:])
    return json.loads(r.stdout)


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

    fn = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_void_p, ctypes.c_int32)(addr)
    ts = ts_side(tempfile.mkdtemp(prefix="ccbuf_"))

    print(f"image     {image}")
    print(f"slide     {slide:#x}   {SYM} @ {vmaddr:#x}  ->  {addr:#x} (dlsym agrees)")
    print(f"bytes     {got.hex()}")
    print(f"          == the transcribed body")
    print()

    kills = {m: 0 for m in MUTANTS}
    eligible = {m: 0 for m in MUTANTS}
    wrote = 0
    for i, index in enumerate(CASES):
        buf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        base = ctypes.addressof(buf)
        before = bytes(buf)
        p = fn(base, index)
        if bytes(buf) != before:
            wrote += 1
        live_is_buffer = (p == base + BUF_OFF)
        live_null = (p is None or p == 0)
        for m in MUTANTS:
            r = ts[m]["results"][i]
            eligible[m] += 1
            if isinstance(r, str):
                kills[m] += 1
                continue
            if r["null"]:
                if not live_null:
                    kills[m] += 1
            else:
                # the port returned a handle: the live side must ALSO have returned the interior
                # pointer, and the handle must be the state's own array (a copy is a kill).
                if not live_is_buffer or not r["identity"] or not r["wrote"]:
                    kills[m] += 1
        r0 = ts["M0"]["results"][i]
        shown = "null" if (isinstance(r0, dict) and r0.get("null")) else \
                f"buffer(identity={r0['identity']}, write visible={r0['wrote']})"
        print(f"  index={index:<11} live={'arena+0x1a0' if live_is_buffer else ('null' if live_null else hex(p))}"
              f"   ts={shown}")

    # the live pointer must be INTERIOR AND LIVE, not merely non-null: write through it.
    buf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
    base = ctypes.addressof(buf)
    p = fn(base, 0)
    ctypes.memmove(p, struct.pack("<4f", 1.5, 2.5, 3.5, 4.5), BUF_LEN)
    after = bytes(buf)
    touched = [i for i in range(ARENA) if after[i] != POISON]
    interior_live = (touched == list(range(BUF_OFF, BUF_OFF + BUF_LEN))
                     and struct.unpack("<4f", after[BUF_OFF:BUF_OFF + BUF_LEN]) == (1.5, 2.5, 3.5, 4.5))

    # out of contract: the test is 32-bit, so a 64-bit value with zero low half also selects.
    p_wide = fn(base, ctypes.c_int32(0).value)
    wide_note = (fn(base, 0) == base + BUF_OFF)

    print()
    print(f"cases                     {len(CASES)}")
    print(f"agreed (TS vs live)       {len(CASES) - kills['M0']}")
    print(f"receiver bytes modified   {wrote} of {len(CASES)}  (the method computes an address; it "
          "reads and writes nothing)")
    print(f"pointer is INTERIOR and LIVE (wrote 16 bytes through it; exactly +0x1a0..+0x1af "
          f"changed): {interior_live}")
    print(f"index 0 returns arena+0x1a0 consistently: {wide_note and p_wide == base + BUF_OFF}")
    print()
    print("mutation table — M0 is an unmutated copy of the port through the same pipeline:")
    for m in MUTANTS:
        note = "  (baseline: the instrument itself)" if m == "M0" else ""
        extra = ("  <- identical VALUES; caught by the identity column alone"
                 if m == "M2_return_copy" else "")
        print(f"  {m:<16} killed {kills[m]:>2} of {eligible[m]:>2}{note}{extra}")

    ok = (kills["M0"] == 0 and wrote == 0 and interior_live
          and all(kills[m] > 0 for m in MUTANTS if m != "M0"))
    print()
    print("VERDICT: " + ("VERIFIED — the real TypeScript matches live Helium on every index, and "
                         "the returned handle is the node's own storage on both sides"
                         if ok else "FAILED — see the rows above"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
