#!/usr/bin/env python3
"""OZChannel_getFadeOutOffset_oracle.py — differential for `OZChannel::getFadeOutOffset()`
@ProChannel 0x15ee0 (`__ZN9OZChannel16getFadeOutOffsetEv`, nm class `T`).

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZChannel_getFadeOutOffset_oracle.py

WHAT IS COMPARED. The LIVE ProChannel function, called in this process over a `this`/impl/
savedState chain built in ctypes memory, against the REAL TypeScript port run by
`OZChannel_getFadeOutOffset_driver.mts` under `node --experimental-strip-types`. Not a Python
restatement of the port: a Python restatement shares any misreading of the disassembly with the
port it is supposed to judge, which is OPS_LOG's standing complaint about most oracles in this
tree.

WHY `arch -x86_64` IS NOT OPTIONAL. Every @0xADDR in the port is an x86_64 offset (disasm.sh thins
to the x86_64 slice) while this box runs arm64, so a native process would dlopen a DIFFERENT slice
and call some other function at the same address — an error that fails silently toward VERIFIED.
`ozone_loader.require_x86_64()` refuses to run otherwise, and this file adds two more checks that
would catch it even if that one were removed: `dlsym` and the cached x86_64 inventory must agree on
the address, and the bytes at that address must be this port's transcribed prologue.

THE THREE CLAIMS UNDER TEST, in the order the header of the port states them:
  1. the answer comes from `savedState+0x18` (`timeB`), not `+0x00` (`timeA`, its twin
     getFadeInOffset's slot) — every case plants a DECOY CMTime at +0x00;
  2. the null-savedState answer is CoreMedia's `kCMTimeZero` ({0, 1, Valid, 0}), not a zeroed
     struct — checked against the bytes at the literal-pool target the binary itself loads;
  3. nothing is written: `this`, the impl and the snapshot are poisoned with 0xCD and byte-diffed
     after every call.
"""
import ctypes, json, os, struct, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))          # raw-port/
SRC = os.path.join(REPO, "src")
sys.path.insert(0, HERE)
import ozone_loader as oz                                        # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

FW = "ProChannel"
SYM = "__ZN9OZChannel16getFadeOutOffsetEv"
DLSYM_NAME = "_ZN9OZChannel16getFadeOutOffsetEv"                  # dlsym drops the Mach-O underscore
VMADDR_EXPECTED = 0x15EE0
LITPOOL_KCMTIMEZERO = 0xCA4C0     # 0x15f09 + 0xb45b7, the slot the null path loads &kCMTimeZero from
# 0x15ee0 pushq %rbp / movq %rsp,%rbp / movq %rdi,%rax — the transcription's first three
PROLOGUE = bytes.fromhex("554889e54889f8")

THIS_SZ, IMPL_SZ, SAVED_SZ = 0xA0, 0x40, 0x38
OFF_IMPL_IN_THIS = 0x70           # this->implPrimary
OFF_SAVED_IN_IMPL = 0x10          # impl->savedState
OFF_TIMEA, OFF_TIMEB = 0x00, 0x18  # inside SavedState
POISON = 0xCD


class CMTimeS(ctypes.Structure):
    """CoreMedia CMTime: value:i64 +0x00, timescale:i32 +0x08, flags:u32 +0x0c, epoch:i64 +0x10."""
    _fields_ = [("value", ctypes.c_int64), ("timescale", ctypes.c_int32),
                ("flags", ctypes.c_uint32), ("epoch", ctypes.c_int64)]


def cmt_bytes(value, timescale, flags, epoch):
    return struct.pack("<qiIq", value, timescale, flags, epoch)


def bytes_to_wire(b):
    v, ts, fl, ep = struct.unpack("<qiIq", b)
    return {"value": hex(v & 0xFFFFFFFFFFFFFFFF), "timescale": ts, "flags": fl,
            "epoch": hex(ep & 0xFFFFFFFFFFFFFFFF)}


def wire_to_bytes(w):
    """The driver's hex-string encoding back to the 24 raw bytes, for a BIT-EXACT comparison."""
    v = ctypes.c_int64(int(w["value"], 16)).value
    ep = ctypes.c_int64(int(w["epoch"], 16)).value
    return cmt_bytes(v, w["timescale"], w["flags"], ep)


# ── the corpus ───────────────────────────────────────────────────────────────────────────────────
# timeB is the answer; timeA is the DECOY at +0x00 that a wrong-offset port returns. Every case
# gives them different bytes, so "read the other CMTime" can never coincide with the right answer.
CASES = [
    # (label, savedNull, timeB, timeA-decoy)
    ("ordinary 600ths",        False, (12345, 600, 1, 0),                    (999, 30, 1, 7)),
    ("zero-but-valid",         False, (0, 1, 1, 0),                          (1, 1, 1, 1)),
    ("negative value+epoch",   False, (-1, 30, 3, -2),                       (5, 5, 5, 5)),
    ("int64 extremes",         False, (0x7FFFFFFFFFFFFFFF, 0x7FFFFFFF, 0xFFFFFFFF, -0x8000000000000000),
                                                                             (0, 0, 0, 0)),
    ("timescale 0, flags 0",   False, (7, 0, 0, 3),                          (-7, 90000, 2, -3)),
    ("epoch only",             False, (0, 90000, 1, 0x1234567890),           (0, 90000, 1, 0)),
    ("all-bits-set decoy",     False, (48000, 48000, 1, 4),
                                                                             (-1, -1, 0xFFFFFFFF, -1)),
    ("NULL savedState",        True,  (0, 0, 0, 0),                          (0xDEAD, 25, 1, 9)),
]

# ── mutants: real copies of the port with ONE token changed ──────────────────────────────────────
PORT_REL = "channels/OZChannel.ts"
MUTANTS = {
    # M0 is not a mutation: an unmutated copy through the identical pipeline, which must kill 0.
    "M0": None,
    # +0x18 -> +0x00: return the fade-IN CMTime, i.e. the twin getFadeInOffset @0x15eb4's slot.
    "M1_read_timeA": ("src = saved.timeB;", "src = saved.timeA;"),
    # the null answer as a zeroed struct instead of CoreMedia's exported zero.
    "M2_null_all_zero": ("src = kCMTimeZeroConst;",
                         "src = { value: 0n, timescale: 0, flags: 0, epoch: 0n };"),
    # the two-part copy misread: value/timescale/flags from +0x18 but the epoch from +0x10, i.e.
    # `movq 0x28(%rcx),%rdx` read as `movq 0x10(%rcx),%rdx`.
    "M3_epoch_from_timeA": ("epoch: src.epoch,", "epoch: (saved ? saved.timeA.epoch : src.epoch),"),
    # M4 is the ALIASING mutant: identical values on every case, caught only by the mutation check
    # below, which is the whole reason that check is in the driver.
    "M4_return_source": ("""  return {
    epoch: src.epoch,          // +0x10, copied first (movq/movq)
    value: src.value,          // +0x00 ─┐
    timescale: src.timescale,  // +0x08  ├─ the single 16-byte movups
    flags: src.flags,          // +0x0c ─┘
  };""", "  return src;"),
}

# WHICH CASES CAN EVEN DISCRIMINATE A GIVEN MUTANT. A raw "killed 1 of 8" reads like a weak control
# and a raw "killed 7 of 8" like a leaky one; both are neither. Each of these mutants changes ONE
# branch of a two-branch function, so the other branch's cases are not evidence about it either way
# — the honest denominator is the branch it touches, and printing the two numbers side by side is
# what tells a reader that a low count is structure rather than blindness (OPS_LOG's dead /
# inflated / implied-control family, whose common thread is a number nobody could interpret).
ELIGIBLE = {
    "M0": lambda null_, tb, ta: True,                    # every case; it must still kill none
    "M1_read_timeA": lambda null_, tb, ta: not null_,    # only the savedState branch reads a slot
    "M2_null_all_zero": lambda null_, tb, ta: null_,     # only the null branch returns the constant
    "M3_epoch_from_timeA": lambda null_, tb, ta: not null_ and tb[3] != ta[3],
    # M4 returns the SOURCE object: every value it produces is correct, so no case can kill it on
    # value. Its denominator is 0 by construction and its evidence is the ALIASING column instead —
    # which is the point of having it, and the reason a "0 of 0" row here is not a dead control.
    "M4_return_source": lambda null_, tb, ta: False,
}

STUBS = {  # value imports of OZChannel.ts that this function does not touch and node cannot load
    "./OZChannelBase": "export class OZChannelBase {}",
    "./OZChannelInfo": "export class OZChannelInfo {}",
    "../infra/PCSerializerReadStream": "export class PCSerializerReadStream {}",
    "../infra/PCStreamElement": "export class PCStreamElement {}",
    "./OZCurve": "export class OZCurve {}",
}


# The mutation is applied ONLY inside the function under test. `OZChannel.ts` is a shared class file
# and its landed twin `getFadeInOffset` is the same shape, so tokens like `epoch: src.epoch,` occur
# in BOTH — mutating the file globally would silently change a function this unit is not judging,
# and the mutant would then be "killed" by somebody else's code. Anchoring on the export keeps a
# mutant a statement about one body, which is what the kill counts are read as.
FN_ANCHOR = "export function OZChannel_getFadeOutOffset"


def build_ts_side(td):
    """Write the mutant modules + the resolve hook, run node ONCE, return its JSON."""
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
        p = os.path.join(td, f"OZChannel_{name}.ts")
        open(p, "w").write(text)
        modules[name] = p

    stub_urls = {}
    for spec, body in STUBS.items():
        p = os.path.join(td, "stub_" + spec.replace("/", "_").replace(".", "") + ".ts")
        open(p, "w").write(body + "\n")
        stub_urls[spec] = "file://" + p
    # the REAL leaf module, not a stub: kCMTimeZero must be the port's own constant
    stub_urls["../infra/CMTime"] = "file://" + os.path.join(SRC, "infra", "CMTime.ts")

    hook = os.path.join(td, "hook.mjs")
    open(hook, "w").write(
        "// generated by OZChannel_getFadeOutOffset_oracle.py — never written into the repo\n"
        f"const MAP = {json.dumps(stub_urls)};\n"
        "export async function resolve(spec, ctx, next) {\n"
        "  if (Object.prototype.hasOwnProperty.call(MAP, spec))\n"
        "    return { url: MAP[spec], shortCircuit: true };\n"
        "  return next(spec, ctx);\n"
        "}\n")

    req = {"hook": "file://" + hook, "modules": modules,
           "cases": [{"savedNull": null_, "timeB": bytes_to_wire(cmt_bytes(*b)),
                      "timeA": bytes_to_wire(cmt_bytes(*a))} for _, null_, b, a in CASES]}
    r = subprocess.run(["node", "--experimental-strip-types",
                        os.path.join(HERE, "OZChannel_getFadeOutOffset_driver.mts")],
                       input=json.dumps(req), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if r.returncode != 0:
        sys.exit("node driver failed:\n" + r.stdout[-2000:] + r.stderr[-2000:])
    return json.loads(r.stdout), stub_urls


def main():
    oz.require_x86_64()
    lib = oz.load_framework(FW)
    slide, image = oz.image_slide(FW)
    vmaddr = oz.nm_addr(FW, SYM)
    if vmaddr != VMADDR_EXPECTED:
        sys.exit(f"inventory says {SYM} is at {vmaddr:#x}, the port cites {VMADDR_EXPECTED:#x}")
    addr = slide + vmaddr

    # ADDRESS SELF-CHECKS. Either one alone catches the wrong-slice trap; both are two lines.
    dl = ctypes.cast(getattr(lib, DLSYM_NAME), ctypes.c_void_p).value
    if dl != addr:
        sys.exit(f"dlsym {dl:#x} != slide+vmaddr {addr:#x} — refusing to call an unverified address")
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        sys.exit(f"prologue at {addr:#x} is {got.hex()}, the transcription says {PROLOGUE.hex()}")

    # The literal-pool slot the null path loads, and the CMTime it points at.
    kptr = ctypes.c_void_p.from_address(slide + LITPOOL_KCMTIMEZERO).value
    kzero = ctypes.string_at(kptr, 24)

    fn = ctypes.CFUNCTYPE(CMTimeS, ctypes.c_void_p)(addr)
    ts, stub_urls = build_ts_side(tempfile.mkdtemp(prefix="ozfade_"))

    print(f"image      {image}")
    print(f"slide      {slide:#x}   {SYM} @ {vmaddr:#x}  ->  {addr:#x} (dlsym agrees)")
    print(f"prologue   {got.hex()}  matches the transcription")
    print(f"kCMTimeZero via literal pool {LITPOOL_KCMTIMEZERO:#x} -> {kptr:#x} = {bytes_to_wire(kzero)}")
    print(f"TS kCMTimeZero (real ../infra/CMTime.ts)             = {ts['kCMTimeZero']}")
    same_zero = wire_to_bytes(ts["kCMTimeZero"]) == kzero
    print(f"           the port's null-path constant is BIT-IDENTICAL to CoreMedia's: {same_zero}")
    print(f"stubbed    {', '.join(sorted(STUBS))}  (real: ../infra/CMTime, and the port itself)")
    print()

    live, kills, wrote = [], {m: 0 for m in MUTANTS}, 0
    eligible = {m: 0 for m in MUTANTS}
    for i, (label, null_, tb, ta) in enumerate(CASES):
        this_ = ctypes.create_string_buffer(bytes([POISON]) * THIS_SZ, THIS_SZ)
        impl = ctypes.create_string_buffer(bytes([POISON]) * IMPL_SZ, IMPL_SZ)
        saved = ctypes.create_string_buffer(bytes([POISON]) * SAVED_SZ, SAVED_SZ)
        ctypes.memmove(ctypes.byref(saved, OFF_TIMEB), cmt_bytes(*tb), 24)
        ctypes.memmove(ctypes.byref(saved, OFF_TIMEA), cmt_bytes(*ta), 24)   # the decoy
        saved_ptr = 0 if null_ else ctypes.addressof(saved)
        ctypes.memmove(ctypes.byref(impl, OFF_SAVED_IN_IMPL),
                       struct.pack("<Q", saved_ptr), 8)
        ctypes.memmove(ctypes.byref(this_, OFF_IMPL_IN_THIS),
                       struct.pack("<Q", ctypes.addressof(impl)), 8)
        before = (bytes(this_), bytes(impl), bytes(saved))

        r = fn(ctypes.addressof(this_))
        got_b = cmt_bytes(r.value, r.timescale, r.flags, r.epoch)
        live.append(got_b)
        if (bytes(this_), bytes(impl), bytes(saved)) != before:
            wrote += 1

        expect_note = "kCMTimeZero" if null_ else "savedState+0x18"
        for m in MUTANTS:
            if ELIGIBLE[m](null_, tb, ta):
                eligible[m] += 1
            w = ts[m]["results"][i]
            if "threw" in w or wire_to_bytes(w) != got_b:
                kills[m] += 1
        agree = wire_to_bytes(ts["M0"]["results"][i]) == got_b
        print(f"  {'OK ' if agree else 'DIVERGED'}  {label:<22} live={bytes_to_wire(got_b)}"
              f"  <- {expect_note}")
        if not agree:
            print(f"        TS port returned {ts['M0']['results'][i]}")

    print()
    print(f"cases                 {len(CASES)}")
    print(f"agreed (TS vs live)   {len(CASES) - kills['M0']}")
    print(f"receiver/impl/saved bytes modified by the callee: {wrote} of {len(CASES)}")
    print()
    print("aliasing — does the returned CMTime share storage with the snapshot (or with CoreMedia's")
    print("constant)? The machine cannot: %rax is the CALLER's 24 bytes. A port that returns the")
    print("source object agrees on every value and still hands out a live reference:")
    for m in MUTANTS:
        flag = ts[m].get("aliased")
        want = "must be False" if m != "M4_return_source" else "must be True (that IS the mutation)"
        print(f"  {m:<22} aliased={str(flag):<5}  ({want})")
    print()
    print("mutation table — M0 is an unmutated copy through the same pipeline and MUST kill 0.")
    print("'eligible' is the number of cases whose BRANCH the mutant changes; a mutant cannot be")
    print("evidence about a branch it does not touch, so that is the denominator to read:")
    for m in MUTANTS:
        note = "  (baseline: the instrument itself)" if m == "M0" else ""
        print(f"  {m:<22} killed {kills[m]:>2} of {eligible[m]:>2} eligible "
              f"({len(CASES)} cases run){note}")

    ok = (kills["M0"] == 0 and wrote == 0 and same_zero
          and all(kills[m] == eligible[m] for m in MUTANTS if m != "M0")
          and ts["M0"].get("aliased") is False
          and ts["M4_return_source"].get("aliased") is True)
    print()
    print("VERDICT: " + ("VERIFIED — the real TypeScript agrees with live ProChannel on every "
                         "case, no case is explained by a blind harness"
                         if ok else "FAILED — see the rows above"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
