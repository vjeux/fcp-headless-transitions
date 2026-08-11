#!/usr/bin/env python3
"""HgcYUV420BiPlanar_chroma_SetParameter_oracle.py — differential for
`HgcYUV420BiPlanar_chroma::SetParameter(int, float, float, float, float)` @Helium 0x2ff680
(`__ZN24HgcYUV420BiPlanar_chroma12SetParameterEiffff`, nm class `t` — LOCAL, so dlsym cannot see it).

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/HgcYUV420BiPlanar_chroma_SetParameter_oracle.py

WHAT IS COMPARED. The live Helium function, called by ADDRESS in this process, against the REAL
TypeScript port run by `HgcYUV420BiPlanar_chroma_SetParameter_driver.mts` under
`node --experimental-strip-types`. The ported module imports nothing, so the driver loads the file
exactly as committed — no resolve hook, no stubs.

WHY A CONSTANT FUNCTION STILL GETS A REAL DIFFERENTIAL. The body is `movl $0xffffffff,%eax ; ret`,
and OPS_LOG's warning about this shape is that a harness which never reads `%eax` agrees with any
constant port — the measurement is vacuous unless the instrument is proved. Two controls prove it,
both on the SAME call path rather than in principle:

  SIBLING OVERRIDE — `HGComicQuantize::SetParameter` @Helium 0x7450 is the same virtual with the
  same signature and a REAL implementation: it answers 1 when it stores a new value, 0 when the
  value was unchanged, and -1 for a key it does not own. Called through the IDENTICAL CFUNCTYPE
  with the IDENTICAL argument tuples, it produces all three answers, so the instrument
  demonstrably distinguishes them — and its -1 for an unowned key is what says this port's -1 is
  an ANSWER rather than an artifact.

  SAME-CLASS SIBLING — `HgcYUV420BiPlanar_chroma::GetOutput` @0x2ff6a0 is `movq %rdi,%rax ; retq`,
  i.e. it returns a value THE HARNESS CHOOSES (the receiver address). A fixed-value or
  stale-register reading of the return path cannot survive that.

WHY `arch -x86_64` IS NOT OPTIONAL, and why the bytes are checked first: every @0xADDR here is an
x86_64 offset while the box is arm64, so a native process would call a different function at the
same address and fail silently toward VERIFIED. `ozone_loader.require_x86_64()` refuses to run
otherwise, and the prologue-byte check below catches it independently.
"""
import ctypes, json, os, struct, subprocess, sys, tempfile
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))          # raw-port/
SRC = os.path.join(REPO, "src")
sys.path.insert(0, HERE)
import ozone_loader as oz                                        # noqa: E402

FW = "Helium"
SYM = "__ZN24HgcYUV420BiPlanar_chroma12SetParameterEiffff"
VMADDR_EXPECTED = 0x2FF680
# 0x2ff680 pushq %rbp / movq %rsp,%rbp / movl $0xffffffff,%eax / popq %rbp / retq — the whole body
BODY_BYTES = bytes.fromhex("554889e5b8ffffffff5dc3")

CONTROL_SIBLING = ("__ZN15HGComicQuantize12SetParameterEiffff", 0x7450)   # real override, 1/0/-1
CONTROL_GETOUTPUT = ("__ZN24HgcYUV420BiPlanar_chroma9GetOutputEP10HGRenderer", 0x2FF6A0)  # -> this
QUANTIZE_F0_OFFSET = 0x198        # the float slot HGComicQuantize::SetParameter compares/stores

ARENA = 0x400
POISON = 0xCD

F32 = {  # label -> raw u32 bit pattern, so NaN / -0.0 / Inf survive the wire and the comparison
    "+0.0": 0x00000000, "-0.0": 0x80000000, "1.0": 0x3F800000, "-1.0": 0xBF800000,
    "NaN": 0x7FC00000, "+Inf": 0x7F800000, "-Inf": 0xFF800000,
    "denormal": 0x00000001, "1e38": 0x7E967699,
}
FLOAT_TUPLES = [
    ("zeros",     ["+0.0", "+0.0", "+0.0", "+0.0"]),
    ("neg zero",  ["-0.0", "-0.0", "-0.0", "-0.0"]),
    ("unit",      ["1.0", "-1.0", "1.0", "-1.0"]),
    ("NaN/Inf",   ["NaN", "+Inf", "-Inf", "NaN"]),
    ("denorm/big", ["denormal", "1e38", "denormal", "1e38"]),
]
KEYS = [-1, 0, 1, 2, 7, 0x7FFFFFFF]
# The FULL cross product, 6 keys x 5 float shapes = 30. An earlier revision truncated this to 24 to
# save a second of node startup and thereby dropped every INT32_MAX case — a corpus that quietly
# omits the boundary it advertises is worse than a smaller one that does not claim it.
CASES = [(k, t) for k in KEYS for t in FLOAT_TUPLES]

PORT_REL = "render/HgcYUV420BiPlanar_chroma.ts"
MUTANTS = {
    "M0": None,                                            # baseline: must kill 0
    "M1_return_0": ("return -1;", "return 0;"),
    # the classic misreading of `movl $0xffffffff,%eax` — the same bits, read UNSIGNED.
    "M2_return_u32": ("return -1;", "return 0xffffffff;"),
    # "surely it must look at its arguments": an answer that depends on the key.
    "M3_key_dependent": ("return -1;", "return _key === 0 ? -1 : 0;"),
}


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
        p = os.path.join(td, f"chroma_{name}.ts")
        open(p, "w").write(text)
        modules[name] = p
    req = {"modules": modules,
           "cases": [{"key": k, "f": [F32[n] for n in names]} for k, (_, names) in CASES]}
    r = subprocess.run(["node", "--experimental-strip-types",
                        os.path.join(HERE, "HgcYUV420BiPlanar_chroma_SetParameter_driver.mts")],
                       input=json.dumps(req), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if r.returncode != 0:
        sys.exit("node driver failed:\n" + r.stdout[-2000:] + r.stderr[-2000:])
    return json.loads(r.stdout)


def as_c_float(bits):
    """Build the float argument BIT-EXACTLY. `ctypes.c_float(python_float)` goes through a C double
    and QUIETS a signalling NaN (OPS_LOG); memmove of the raw word cannot."""
    cf = ctypes.c_float()
    ctypes.memmove(ctypes.byref(cf), struct.pack("<I", bits), 4)
    return cf


def main():
    oz.require_x86_64()
    oz.load_framework(FW)
    slide, image = oz.image_slide(FW)
    vmaddr = oz.nm_addr(FW, SYM)
    if vmaddr != VMADDR_EXPECTED:
        sys.exit(f"inventory says {SYM} is at {vmaddr:#x}, the port cites {VMADDR_EXPECTED:#x}")
    addr = slide + vmaddr
    got = ctypes.string_at(addr, len(BODY_BYTES))
    if got != BODY_BYTES:
        sys.exit(f"bytes at {addr:#x} are {got.hex()}, the transcription says {BODY_BYTES.hex()} — "
                 "refusing to call an address whose contents are not the body under test")

    PROTO = ctypes.CFUNCTYPE(ctypes.c_int32, ctypes.c_void_p, ctypes.c_int32,
                             ctypes.c_float, ctypes.c_float, ctypes.c_float, ctypes.c_float)
    fn = PROTO(addr)
    ctrl_sym, ctrl_va = CONTROL_SIBLING
    if oz.nm_addr(FW, ctrl_sym) != ctrl_va:
        sys.exit("the control sibling moved; refusing to run a control I cannot locate")
    ctrl = PROTO(slide + ctrl_va)
    out_sym, out_va = CONTROL_GETOUTPUT
    if oz.nm_addr(FW, out_sym) != out_va:
        sys.exit("GetOutput moved; refusing to run a control I cannot locate")
    getoutput = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_void_p)(slide + out_va)

    ts = ts_side(tempfile.mkdtemp(prefix="chroma_"))

    print(f"image     {image}")
    print(f"slide     {slide:#x}   {SYM} @ {vmaddr:#x}  ->  {addr:#x}  (local `t`: called by address)")
    print(f"bytes     {got.hex()}  == the transcribed body")
    print()

    kills = {m: 0 for m in MUTANTS}
    wrote = 0
    for i, (key, (flabel, fnames)) in enumerate(CASES):
        buf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        before = bytes(buf)
        args = [as_c_float(F32[n]) for n in fnames]
        r = fn(ctypes.addressof(buf), key, *args)
        if bytes(buf) != before:
            wrote += 1
        for m in MUTANTS:
            v = ts[m]["results"][i]
            if not isinstance(v, int) or v != r:
                kills[m] += 1
        mark = "OK " if ts["M0"]["results"][i] == r else "DIVERGED"
        print(f"  {mark}  key={key:<11} floats={flabel:<11} live={r:<3} ts={ts['M0']['results'][i]}")

    # ── the receiver is never touched, in its strongest form: a NULL `this` ──────────────────────
    null_ok, null_ret = True, None
    try:
        null_ret = fn(None, 0, as_c_float(0), as_c_float(0), as_c_float(0), as_c_float(0))
    except Exception:                                          # pragma: no cover - a fault would
        null_ok = False                                        # mean the body DOES read %rdi
    if null_ret != -1:
        null_ok = False

    # ── control 1: the sibling override, same CFUNCTYPE, same arguments ──────────────────────────
    cbuf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
    ctypes.memmove(ctypes.byref(cbuf, QUANTIZE_F0_OFFSET), struct.pack("<f", 0.0), 4)
    c_store = ctrl(ctypes.addressof(cbuf), 0, as_c_float(F32["1.0"]),
                   as_c_float(0), as_c_float(0), as_c_float(0))      # new value -> stores, 1
    c_same = ctrl(ctypes.addressof(cbuf), 0, as_c_float(F32["1.0"]),
                  as_c_float(0), as_c_float(0), as_c_float(0))       # same value -> 0
    c_unknown = ctrl(ctypes.addressof(cbuf), 99, as_c_float(F32["1.0"]),
                     as_c_float(0), as_c_float(0), as_c_float(0))    # unowned key -> -1
    stored = struct.unpack("<f", bytes(cbuf)[QUANTIZE_F0_OFFSET:QUANTIZE_F0_OFFSET + 4])[0]

    # ── control 2: same-class GetOutput returns the pointer WE passed ────────────────────────────
    obuf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
    o_ret = getoutput(ctypes.addressof(obuf))

    print()
    print(f"cases                       {len(CASES)}")
    print(f"agreed (TS vs live)         {len(CASES) - kills['M0']}")
    print(f"receiver bytes modified     {wrote} of {len(CASES)}")
    print(f"NULL receiver               returned {null_ret} without faulting: {null_ok}"
          "   (the body never reads %rdi)")
    print()
    print("instrument controls — a constant function is only as good as the proof that the harness")
    print("can see a DIFFERENT answer coming back through the same path:")
    print(f"  HGComicQuantize::SetParameter @0x7450, same CFUNCTYPE, same arg shapes:")
    print(f"      key=0 new value   -> {c_store:<3} (and wrote {stored} into +0x{QUANTIZE_F0_OFFSET:x})")
    print(f"      key=0 same value  -> {c_same}")
    print(f"      key=99 (unowned)  -> {c_unknown}   <- the same -1 this port returns, from a"
          " function that also returns other things")
    print(f"  HgcYUV420BiPlanar_chroma::GetOutput @0x2ff6a0 returned the receiver we passed: "
          f"{o_ret == ctypes.addressof(obuf)}")
    print()
    print("mutation table — M0 is an unmutated copy of the port through the same pipeline:")
    for m in MUTANTS:
        note = "  (baseline: the instrument itself)" if m == "M0" else ""
        print(f"  {m:<20} killed {kills[m]:>2} of {len(CASES)}{note}")

    controls_ok = (c_store == 1 and c_same == 0 and c_unknown == -1
                   and o_ret == ctypes.addressof(obuf))
    ok = (kills["M0"] == 0 and wrote == 0 and null_ok and controls_ok
          and all(kills[m] > 0 for m in MUTANTS if m != "M0"))
    print()
    print("VERDICT: " + ("VERIFIED — the real TypeScript matches live Helium on every case, on an "
                         "instrument shown to distinguish 1, 0, -1 and a chosen pointer"
                         if ok else "FAILED — see the rows above"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
