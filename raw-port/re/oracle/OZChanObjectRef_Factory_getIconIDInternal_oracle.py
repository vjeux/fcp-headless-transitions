#!/usr/bin/env python3
"""Differential oracle for OZChanObjectRef_Factory::getIconIDInternal() @ProChannel 0x13054
(__ZN23OZChanObjectRef_Factory17getIconIDInternalEv, `nm` class `t`).

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/OZChanObjectRef_Factory_getIconIDInternal_oracle.py

The body is five instructions and one of them is `movl $0xffffffff, %eax`, so the interesting
question is not "what does it return" but "is this harness capable of noticing if it returned
something else". A constant-returning function is exactly the case where a differential can be
VACUOUS: a harness that never actually reads %eax, or that calls the wrong address, agrees with a
port that returns a constant no matter what either of them does. So this script asserts three
things, and the second and third are the ones that give the first any weight:

  1. the live function returns -1, and the TS port returns -1;
  2. SENSITIVITY — the same CFUNCTYPE, called on a different nullary int function immediately
     before, returns something else. If the harness were not reading %eax it would report that
     other value here too. (The control is libc `getpid`, which is nullary, returns a non-negative
     int through the same ABI register, and cannot be -1. It proves the READ path, and nothing
     about ProChannel — stated plainly rather than dressed up.)
  3. ADDRESS — the 9 bytes at slide+vmaddr are compared against the prologue this port transcribes
     (`55 48 89 e5 b8 ff ff ff ff` = pushq %rbp / movq %rsp,%rbp / movl $0xffffffff,%eax) before
     anything is reported. That is what makes "it returned -1" evidence about THIS function rather
     than about whatever happens to sit at a mis-computed address — and it is doubly worth doing
     here, because every sibling factory's getIconIDInternal returns the same -1, so landing on the
     wrong one would look perfect.

Runs only under `arch -x86_64 /usr/bin/python3`: the port cites x86_64 offsets, the vmaddr comes
from raw-port/army/inventory/ProChannel.syms.txt (x86_64 by construction), and a bare `nm` would
report the arm64 slice.
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402

FW = "ProChannel"
VMADDR = 0x13054
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0xB8, 0xFF, 0xFF, 0xFF, 0xFF))
CALLS = 64          # the function is stateless; repeat only to show it is not a one-off read


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit("PROLOGUE MISMATCH at %#x: %s != %s — refusing to report a number"
                         % (addr, got.hex(), PROLOGUE.hex()))

    PROTO = ctypes.CFUNCTYPE(ctypes.c_int32)
    fn = PROTO(addr)
    libc = ctypes.CDLL(None)
    control = PROTO(ctypes.cast(libc.getpid, ctypes.c_void_p).value)

    live = []
    control_vals = []
    for _ in range(CALLS):
        control_vals.append(control())    # a DIFFERENT value into %eax, immediately before
        live.append(fn())

    driver = os.path.join(HERE, "OZChanObjectRef_Factory_getIconIDInternal_driver.mts")
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps({"calls": CALLS}), capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    reply = json.loads(p.stdout)

    ts = reply["port"]
    diverged = sum(1 for a, b in zip(live, ts) if a != b)
    sensitive = all(v != -1 for v in control_vals) and len(set(control_vals)) >= 1

    print("OZChanObjectRef_Factory::getIconIDInternal  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-check: %s OK" % PROLOGUE.hex())
    print()
    print("calls=%d   live returns: %s   TS port returns: %s   divergences=%d"
          % (CALLS, sorted(set(live)), sorted(set(ts)), diverged))
    print("SENSITIVITY control (libc getpid through the SAME CFUNCTYPE, called immediately before")
    print("  each measured call): returned %s — %s"
          % (sorted(set(control_vals)),
             "the harness does read %eax, so the -1 above is the function's"
             if sensitive else "INCONCLUSIVE: the control did not produce a distinguishable value"))
    print()
    print("NEGATIVE CONTROLS (wrong TS models, same node process):")
    for m in reply["mutants"]:
        killed = sum(1 for a, b in zip(live, m["values"]) if a != b)
        note = "" if killed else "   <-- EQUIVALENT or BLIND, not a control that fired"
        print("  %-44s killed %d/%d%s" % (m["name"], killed, CALLS, note))
    print()
    ok = diverged == 0 and sensitive
    print("VERDICT: %s" % ("VERIFIED — 0 divergences, with a live sensitivity control"
                           if ok else "NOT VERIFIED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
