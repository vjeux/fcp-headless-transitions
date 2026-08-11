#!/usr/bin/env python3
"""Differential oracle for HGExecutionUnit::SwapStack() @Helium 0x144570
(__ZN15HGExecutionUnit9SwapStackEv, `nm` class T).

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGExecutionUnit_SwapStack_oracle.py

The method returns void, so the observable is the pointee, and the comparison is an ARENA SNAPSHOT
DIFF: a 0x100-byte pointee poisoned with 0xCD, the int32 at +0x98 set per case, the live function
called, and every byte compared against the pre-call snapshot. That checks both halves of the claim
— the intended dword changed, and NOTHING else did.

WHY THE CORPUS IS NOT {0, 1}. The body is `cmpl $0x0` + `sete`, so every non-zero value collapses to
0. `x ^= 1` and `x = 1 - x` are indistinguishable from that on {0,1} and wrong everywhere else, so a
two-value corpus would rate three different models identically. The corpus therefore sweeps both
signs, the int32 extremes and randoms, and both wrong models are carried as controls to show the
corpus can actually tell them apart.

Prologue bytes at slide+vmaddr are checked before any number is reported; the vmaddr comes from
raw-port/army/inventory/Helium.syms.txt.
"""
import ctypes, json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

FW = "Helium"
VMADDR = 0x144570
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x48, 0x8B, 0x87))   # ... movq 0x90(%rdi),%rax
OFF_STATE = 0x90
OFF_INDEX = 0x98
ARENA = 0x100
POISON = 0xCD


def build_cases():
    rng = random.Random(0x144570)
    vals = [0, 1, 2, 3, -1, -2, 7, 0x7FFFFFFF, -0x80000000, 0x100, 0xFF, 0x10000]
    vals += [rng.randint(-0x80000000, 0x7FFFFFFF) for _ in range(33)]
    return vals


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit("PROLOGUE MISMATCH at %#x: %s != %s — refusing to report"
                         % (addr, got.hex(), PROLOGUE.hex()))
    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p)(addr)

    cases = build_cases()
    live, stray_total = [], 0
    for v in cases:
        pointee = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        recv = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        pbase, rbase = ctypes.addressof(pointee), ctypes.addressof(recv)
        ctypes.c_uint64.from_address(rbase + OFF_STATE).value = pbase
        ctypes.c_int32.from_address(pbase + OFF_INDEX).value = v
        before_p = ctypes.string_at(pbase, ARENA)
        before_r = ctypes.string_at(rbase, ARENA)
        fn(rbase)
        after_p = ctypes.string_at(pbase, ARENA)
        after_r = ctypes.string_at(rbase, ARENA)
        live.append(ctypes.c_int32.from_address(pbase + OFF_INDEX).value)
        stray_total += sum(1 for i in range(ARENA)
                           if before_p[i] != after_p[i] and not (OFF_INDEX <= i < OFF_INDEX + 4))
        stray_total += sum(1 for i in range(ARENA) if before_r[i] != after_r[i])

    driver = os.path.join(HERE, "HGExecutionUnit_SwapStack_driver.mts")
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps(cases), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    reply = json.loads(p.stdout)

    diverged = [(cases[i], live[i], reply["port"][i])
                for i in range(len(cases)) if live[i] != reply["port"][i]]

    print("HGExecutionUnit::SwapStack  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-check: %s OK" % PROLOGUE.hex())
    print()
    print("cases=%d  divergences=%d  stray bytes written (pointee outside +0x98, and the whole "
          "receiver)=%d" % (len(cases), len(diverged), stray_total))
    for v, a, b in diverged[:6]:
        print("   in=%-12d live=%-3d ts=%-3d" % (v, a, b))
    print()
    print("NEGATIVE CONTROLS (wrong TS models, same node process, scored against live):")
    for m in reply["mutants"]:
        killed = sum(1 for i in range(len(cases)) if m["values"][i] != live[i])
        note = "" if killed else "   <-- EQUIVALENT or BLIND, not a control that fired"
        print("  %-52s killed %d/%d%s" % (m["name"], killed, len(cases), note))
    print()
    ok = not diverged and stray_total == 0
    print("VERDICT: %s" % ("VERIFIED — 0 divergences, 0 stray writes" if ok else "DIVERGED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
