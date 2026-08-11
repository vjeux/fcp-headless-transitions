#!/usr/bin/env python3
"""Differential oracle for OZImageGenerator::filteredEdges() @Ozone 0x30c120
(__ZN16OZImageGenerator13filteredEdgesEv, `nm` class T).

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZImageGenerator_filteredEdges_oracle.py

The body is `xorl %eax,%eax; ret`, so the question that decides whether this differential is worth
anything is NOT "does it return false" but "could this harness tell if it did not". A harness that
never reads %eax, or that lands on the wrong address, agrees with a constant-returning port no
matter what either side does — the "a port that always returns 0 cannot be distinguished from a
harness that reads no %rax" trap. Three assertions, and the last two are what give the first weight:

  1. the live function returns false, and the TS port returns false;
  2. SENSITIVITY, and it is a good one: `OZGradientSource::filteredEdges` @Ozone 0x2fd2f0 is the
     SAME virtual with the SAME signature and a DIFFERENT constant (`movb $0x1,%al`). It is called
     through the same CFUNCTYPE immediately before each measured call. If the harness were blind,
     the two would read alike; they do not — true then false, 64 times.
  3. ADDRESS: the 5 bytes at slide+vmaddr are checked against `55 48 89 e5 31` before anything is
     reported. Every sibling override returns a small constant, so landing on the wrong one is a
     live risk that would look perfect.

`OZGradientSource::filteredEdges` is `nm` class `t` (file-local), so it is reached the way OPS_LOG
prescribes for locals: the x86_64 vmaddr from raw-port/army/inventory/Ozone.syms.txt plus dyld's
slide, with its own prologue bytes checked too. Ozone loads outside the app bundle once its @rpath
chain is preloaded depth-first, which `ozone_loader` does.
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

FW = "Ozone"
VMADDR = 0x30C120
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x31))            # pushq %rbp / movq %rsp,%rbp / xorl
CTRL_VMADDR = 0x2FD2F0                                       # OZGradientSource::filteredEdges
CTRL_PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0xB0, 0x01))  # ... / movb $0x1,%al
CALLS = 64


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    for name, vm, pro in (("OZImageGenerator::filteredEdges", VMADDR, PROLOGUE),
                          ("OZGradientSource::filteredEdges", CTRL_VMADDR, CTRL_PROLOGUE)):
        got = ctypes.string_at(slide + vm, len(pro))
        if got != pro:
            raise SystemExit("PROLOGUE MISMATCH for %s at %#x: %s != %s — refusing to report"
                             % (name, slide + vm, got.hex(), pro.hex()))

    PROTO = ctypes.CFUNCTYPE(ctypes.c_bool, ctypes.c_void_p)   # (this) -> bool
    fn = PROTO(slide + VMADDR)
    ctrl = PROTO(slide + CTRL_VMADDR)

    # `this` is never dereferenced by either body (neither moves %rdi), so a poisoned pointer is
    # safe AND is itself a check: if a future body did read it, this would fault rather than
    # silently return whatever a null page holds.
    fake_this = ctypes.addressof(ctypes.create_string_buffer(b"\xCD" * 256))

    live, ctrl_vals = [], []
    for _ in range(CALLS):
        ctrl_vals.append(bool(ctrl(fake_this)))      # a DIFFERENT constant, immediately before
        live.append(bool(fn(fake_this)))

    driver = os.path.join(HERE, "OZImageGenerator_filteredEdges_driver.mts")
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps({"calls": CALLS}), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    reply = json.loads(p.stdout)
    ts = reply["port"]
    diverged = sum(1 for a, b in zip(live, ts) if a != b)
    sensitive = all(v is True for v in ctrl_vals) and all(v is False for v in live)

    print("OZImageGenerator::filteredEdges  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-checks: %s (target) / %s (control) OK"
          % (PROLOGUE.hex(), CTRL_PROLOGUE.hex()))
    print()
    print("calls=%d   live: %s   TS port: %s   divergences=%d"
          % (CALLS, sorted(set(live)), sorted(set(ts)), diverged))
    print("SENSITIVITY control — OZGradientSource::filteredEdges @0x%x, the SAME virtual with a"
          % CTRL_VMADDR)
    print("  different constant, through the SAME CFUNCTYPE, called immediately before each")
    print("  measured call: %s. %s" % (sorted(set(ctrl_vals)),
          "The instrument distinguishes true from false, so the false above is this function's."
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
