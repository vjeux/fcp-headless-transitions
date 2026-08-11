#!/usr/bin/env python3
"""FFCachesForRepeatedRetimingCalculations_mediaEndTime_oracle.py — differential for
`FFCachesForRepeatedRetimingCalculations::mediaEndTime(FFRetimingEffect*)` @Flexo 0x6e3270
(`__ZN39FFCachesForRepeatedRetimingCalculations12mediaEndTimeEP16FFRetimingEffect`, nm class `t`).

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/FFCachesForRepeatedRetimingCalculations_mediaEndTime_oracle.py

WHAT IS COMPARED, and what deliberately is not. The method has three paths: cache HIT, NULL effect,
and an Objective-C message send. The first two are driven against the live Flexo function and
against the REAL TypeScript port (run by the sibling driver under
`node --experimental-strip-types`); the third needs a live `FFRetimingEffect` instance, which this
harness has no honest way to build, so it is reported as NOT ORACLED rather than approximated.

TWO OBSERVABLES, because a return-value comparison would miss half of what this method does:
  * the returned CMTime, bit for bit;
  * the WRITE-BACK — which bytes of the receiver changed. The cache-hit path must write nothing at
    all, and the NULL path must write exactly 24 zero bytes at +0x18, leaving the slot INVALID so
    the next call recomputes. A port that memoised the zero (set the Valid bit) would return
    identical values and be wrong on the second call.

The corpus carries several FLAG patterns on purpose: the cache bit is `flags & 1`, so a mutant that
tests the wrong bit only shows up on rows where bit 0 and bit 1 disagree.
"""
import ctypes, json, os, struct, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
SRC = os.path.join(REPO, "src")
sys.path.insert(0, HERE)
import ozone_loader as oz                                        # noqa: E402

FW = "Flexo"
SYM = "__ZN39FFCachesForRepeatedRetimingCalculations12mediaEndTimeEP16FFRetimingEffect"
VMADDR_EXPECTED = 0x6E3270
# pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx / subq $0x20,%rsp / movq %rdi,%rax /
# leaq 0x18(%rsi),%rbx / testb $0x1,0x24(%rsi)
PROLOGUE = bytes.fromhex("554889e5415653 4883ec20 4889f8 488d5e18 f6462401".replace(" ", ""))
SELREF = 0x1BC22E8          # __objc_selrefs slot the uncached path loads (expected: "mediaEndTime")
SLOT_OFF = 0x18
ARENA, POISON = 0x200, 0xCD


class CMTimeS(ctypes.Structure):
    _fields_ = [("value", ctypes.c_int64), ("timescale", ctypes.c_int32),
                ("flags", ctypes.c_uint32), ("epoch", ctypes.c_int64)]


def cmt(value, timescale, flags, epoch):
    return struct.pack("<qiIq", value, timescale, flags, epoch)


def wire(b):
    v, ts, fl, ep = struct.unpack("<qiIq", b)
    return {"value": hex(v & 0xFFFFFFFFFFFFFFFF), "timescale": ts, "flags": fl,
            "epoch": hex(ep & 0xFFFFFFFFFFFFFFFF)}


def unwire(w):
    v = ctypes.c_int64(int(w["value"], 16)).value
    ep = ctypes.c_int64(int(w["epoch"], 16)).value
    return cmt(v, w["timescale"], w["flags"], ep)


# (label, slot CMTime, effect is NULL?)  — flags bit0 set == "already cached"
CASES = [
    ("hit: ordinary",        (12345, 600, 0x1, 0),                    False),
    ("hit: negative both",   (-9, 30, 0x1, -3),                       False),
    ("hit: INT64_MAX",       (0x7FFFFFFFFFFFFFFF, 0x7FFFFFFF, 0x3, 5), False),
    ("hit: flags 0x1f",      (7, 1, 0x1F, 1),                         False),
    ("hit: timescale 0",     (1, 0, 0x1, 0),                          False),
    ("miss(bit1 only)+null", (42, 600, 0x2, 9),                       True),
    ("miss(flags 0)+null",   (42, 600, 0x0, 9),                       True),
]

PORT_REL = "channels/FFCachesForRepeatedRetimingCalculations.ts"
FN_ANCHOR = "export function FFCachesForRepeatedRetimingCalculations_mediaEndTime"
MUTANTS = {
    "M0": None,
    "M1_test_inverted": ("(slot.flags & kCMTimeFlags_Valid) === 0",
                         "(slot.flags & kCMTimeFlags_Valid) !== 0"),
    "M2_wrong_bit": ("(slot.flags & kCMTimeFlags_Valid) === 0", "(slot.flags & 2) === 0"),
    "M3_null_marks_valid": ("      slot.flags = 0;", "      slot.flags = kCMTimeFlags_Valid;"),
    "M4_return_slot": ("""  return {
    epoch: slot.epoch,          // +0x10, copied first (movq/movq)
    value: slot.value,          // +0x00 \u2500\u2510
    timescale: slot.timescale,  // +0x08  \u251c\u2500 the single 16-byte movups
    flags: slot.flags,          // +0x0c \u2500\u2518
  };""", "  return slot;"),
}
# A mutant is only evidence about the branch it changes; the denominators are printed with it.
ELIGIBLE = {
    "M0": lambda null_, flags: True,
    "M1_test_inverted": lambda null_, flags: True,
    "M2_wrong_bit": lambda null_, flags: (flags & 1) != ((flags >> 1) & 1),
    "M3_null_marks_valid": lambda null_, flags: null_,
    "M4_return_slot": lambda null_, flags: False,      # values identical; the aliasing check judges
}


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
                sys.exit(f"mutant {name}: {old!r} appears {tail.count(old)} times inside the "
                         f"function, expected 1")
            text = head + FN_ANCHOR + tail.replace(old, new)
        p = os.path.join(td, f"ff_{name}.ts")
        open(p, "w").write(text)
        modules[name] = p
    # ONE mapping, for the ONE extensionless import the port makes; the target is the REAL file.
    hook = os.path.join(td, "hook.mjs")
    real_cmtime = "file://" + os.path.join(SRC, "infra", "CMTime.ts")
    open(hook, "w").write(
        "// generated by the oracle — never written into the repo\n"
        f"const MAP = {json.dumps({'../infra/CMTime': real_cmtime})};\n"
        "export async function resolve(spec, ctx, next) {\n"
        "  if (Object.prototype.hasOwnProperty.call(MAP, spec))\n"
        "    return { url: MAP[spec], shortCircuit: true };\n"
        "  return next(spec, ctx);\n"
        "}\n")
    req = {"hook": "file://" + hook, "modules": modules,
           "cases": [{"slot": wire(cmt(*s)), "effectNull": n} for _, s, n in CASES]}
    r = subprocess.run(["node", "--experimental-strip-types",
                        os.path.join(HERE,
                                     "FFCachesForRepeatedRetimingCalculations_mediaEndTime_driver.mts")],
                       input=json.dumps(req), capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("node driver failed:\n" + r.stdout[-2000:] + r.stderr[-2000:])
    return json.loads(r.stdout)


def main():
    oz.require_x86_64()
    oz.load_framework(FW)
    slide, image = oz.image_slide(FW)
    vmaddr = oz.nm_addr(FW, SYM)
    if vmaddr != VMADDR_EXPECTED:
        sys.exit(f"inventory says {SYM} is at {vmaddr:#x}, the port cites {VMADDR_EXPECTED:#x}")
    addr = slide + vmaddr
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        sys.exit(f"prologue at {addr:#x} is {got.hex()}, the transcription says {PROLOGUE.hex()}")
    # the selector the uncached path would send, read out of the image rather than assumed
    selptr = ctypes.c_void_p.from_address(slide + SELREF).value
    selname = ctypes.string_at(selptr).decode()

    fn = ctypes.CFUNCTYPE(CMTimeS, ctypes.c_void_p, ctypes.c_void_p)(addr)
    ts = ts_side(tempfile.mkdtemp(prefix="ffmet_"))

    print(f"image     {image}")
    print(f"slide     {slide:#x}   {SYM.split('12mediaEndTime')[0][-20:]}…mediaEndTime @ {vmaddr:#x}"
          f"  ->  {addr:#x}  (local `t`: called by address)")
    print(f"prologue  {got.hex()}  == the transcription")
    print(f"selref    {SELREF:#x} -> \"{selname}\"   (the message the UNCACHED path sends; that path")
    print(f"          is NOT oracled — it needs a live FFRetimingEffect instance)")
    print()

    kills = {m: 0 for m in MUTANTS}
    eligible = {m: 0 for m in MUTANTS}
    ok_rows = 0
    for i, (label, slotvals, null_) in enumerate(CASES):
        buf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        ctypes.memmove(ctypes.byref(buf, SLOT_OFF), cmt(*slotvals), 24)
        before = bytes(buf)
        # a NON-NULL effect is a poisoned pointer the implemented paths must never dereference
        effect = None if null_ else ctypes.c_void_p(0xDEADBEE0)
        r = fn(ctypes.addressof(buf), effect)
        after = bytes(buf)
        live_ret = cmt(r.value, r.timescale, r.flags, r.epoch)
        live_slot = after[SLOT_OFF:SLOT_OFF + 24]
        changed = [x for x in range(ARENA) if before[x] != after[x]]
        outside = [x for x in changed if not (SLOT_OFF <= x < SLOT_OFF + 24)]

        for m in MUTANTS:
            if ELIGIBLE[m](null_, slotvals[2]):
                eligible[m] += 1
            e = ts[m]["results"][i]
            if e["threw"] or unwire(e["ret"]) != live_ret or unwire(e["slot"]) != live_slot:
                kills[m] += 1
        e0 = ts["M0"]["results"][i]
        agree = (not e0["threw"] and unwire(e0["ret"]) == live_ret
                 and unwire(e0["slot"]) == live_slot and not e0["aliased"] and not outside)
        ok_rows += 1 if agree else 0
        print(f"  {'OK ' if agree else 'DIVERGED'}  {label:<22} ret={wire(live_ret)}")
        print(f"          slot after = {wire(live_slot)}   bytes changed: "
              f"{'none' if not changed else hex(changed[0]) + '..' + hex(changed[-1])}"
              f"   outside the slot: {len(outside)}   ts aliased: {e0.get('aliased')}")

    print()
    print(f"cases                       {len(CASES)}  (cache-hit and NULL-effect paths)")
    print(f"agreed on BOTH observables  {ok_rows}   (returned CMTime and the write-back)")
    print()
    print("mutation table — M0 is an unmutated copy through the same pipeline and must kill 0;")
    print("'eligible' is the number of cases whose branch the mutant changes:")
    for m in MUTANTS:
        extra = {"M4_return_slot": "  <- identical values; judged by the aliasing column",
                 "M2_wrong_bit": "  <- only rows where bit0 and bit1 disagree can see it"}.get(m, "")
        note = "  (baseline)" if m == "M0" else ""
        print(f"  {m:<20} killed {kills[m]:>2} of {eligible[m]:>2} eligible{note}{extra}")
    print(f"  aliasing: M0={ts['M0']['results'][0]['aliased']} (must be False), "
          f"M4={ts['M4_return_slot']['results'][0]['aliased']} (must be True)")

    ok = (kills["M0"] == 0 and ok_rows == len(CASES)
          and all(kills[m] == eligible[m] for m in MUTANTS if m not in ("M0", "M4_return_slot"))
          and ts["M0"]["results"][0]["aliased"] is False
          and ts["M4_return_slot"]["results"][0]["aliased"] is True)
    print()
    print("VERDICT: " + ("VERIFIED on the two implemented paths — the real TypeScript matches live "
                         "Flexo on the returned time AND on the write-back; the ObjC path is "
                         "declared, not approximated" if ok else "FAILED — see the rows above"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
