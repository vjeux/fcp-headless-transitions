#!/usr/bin/env python3
"""Differential oracle for the +216 non-virtual thunk of
OZRotoshape::prepareForDragOperation(OZPasteList*, OZChannelBase*, unsigned, unsigned)
@Ozone 0x41b850
(__ZThn216_N11OZRotoshape23prepareForDragOperationEP11OZPasteListP13OZChannelBasejj, `nm` T).

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/OZRotoshape_prepareForDragOperation_thunk216_oracle.py

The body is `movb $0x1,%al; ret`, so what decides whether this differential is worth anything is
not "does it return true" but "could this harness tell if it did not" — a harness that never reads
%al agrees with any constant. Three assertions, and the last two give the first its weight:

  1. the live thunk returns true, and the TS port returns true;
  2. SENSITIVITY: `OZImageGenerator::filteredEdges` @Ozone 0x30c120 is a bool-returning method with
     the same ABI shape and the OPPOSITE constant (`xorl %eax,%eax`). It is called through the same
     CFUNCTYPE immediately before each measured call, and reads false while this one reads true —
     in the same loop, in the same process, on the same instrument;
  3. ADDRESS: the 6 bytes at slide+0x41b850 are checked against `55 48 89 e5 b0 01` first. That
     matters more here than anywhere else in this repo: the base symbol @0x41b830 and the +200
     thunk @0x41b840 hold the IDENTICAL five instructions, 32 and 16 bytes away, so a mis-resolved
     address would return a perfect-looking `true`. The check pins which entry point ran.

`this` and all four arguments are passed as poisoned pointers/values: the body never reads them, and
if a future revision did, this would fault rather than quietly answer.
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402

FW = "Ozone"
VMADDR = 0x41B850
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0xB0, 0x01))     # ... movb $0x1,%al
CTRL_VMADDR = 0x30C120                                      # OZImageGenerator::filteredEdges
CTRL_PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x31))       # ... xorl %eax,%eax
CALLS = 64


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    for name, vm, pro in (("the +216 thunk", VMADDR, PROLOGUE),
                          ("the sensitivity control", CTRL_VMADDR, CTRL_PROLOGUE)):
        got = ctypes.string_at(slide + vm, len(pro))
        if got != pro:
            raise SystemExit("PROLOGUE MISMATCH for %s at %#x: %s != %s — refusing to report"
                             % (name, slide + vm, got.hex(), pro.hex()))

    PROTO = ctypes.CFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p,
                             ctypes.c_uint32, ctypes.c_uint32)
    fn = PROTO(slide + VMADDR)
    CTRL = ctypes.CFUNCTYPE(ctypes.c_bool, ctypes.c_void_p)
    ctrl = CTRL(slide + CTRL_VMADDR)
    poison = ctypes.addressof(ctypes.create_string_buffer(b"\xCD" * 256))

    live, ctrl_vals = [], []
    for i in range(CALLS):
        ctrl_vals.append(bool(ctrl(poison)))
        live.append(bool(fn(poison, poison, poison, 0xDEADBEEF, 0xFEEDFACE)))

    driver = os.path.join(HERE, "OZRotoshape_prepareForDragOperation_thunk216_driver.mts")
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps({"calls": CALLS}), capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    reply = json.loads(p.stdout)
    ts = reply["port"]
    diverged = sum(1 for a, b in zip(live, ts) if a != b)
    sensitive = all(v is True for v in live) and all(v is False for v in ctrl_vals)

    print("OZRotoshape::prepareForDragOperation +216 thunk  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-checks: %s (thunk) / %s (control) OK"
          % (PROLOGUE.hex(), CTRL_PROLOGUE.hex()))
    print()
    print("calls=%d   live: %s   TS port: %s   divergences=%d"
          % (CALLS, sorted(set(live)), sorted(set(ts)), diverged))
    print("SENSITIVITY control — OZImageGenerator::filteredEdges @0x%x, the OPPOSITE constant"
          % CTRL_VMADDR)
    print("  through the same CFUNCTYPE, interleaved with the measured calls: %s. %s"
          % (sorted(set(ctrl_vals)),
             "The instrument distinguishes true from false, so the true above is this thunk's."
             if sensitive else "INCONCLUSIVE — the control did not read differently."))
    print()
    print("NEGATIVE CONTROLS (wrong TS models, same node process):")
    for m in reply["mutants"]:
        killed = sum(1 for a, b in zip(live, m["values"]) if a != b)
        note = "" if killed else "   <-- EQUIVALENT or BLIND, not a control that fired"
        print("  %-46s killed %d/%d%s" % (m["name"], killed, CALLS, note))
    print()
    ok = diverged == 0 and sensitive
    print("VERDICT: %s" % ("VERIFIED — 0 divergences, with a live sensitivity control"
                           if ok else "NOT VERIFIED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
