#!/usr/bin/env python3
"""Differential oracle for OZRetimingUtil::RetimingExaminer::RetimingExaminer() [C2] @Ozone 0x460610.

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/OZRetimingUtil__RetimingExaminer_C2_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

Ozone IS dlopen-able outside the app bundle (OPS_LOG, worker 1): walk its `@rpath` entries
depth-first with RTLD_GLOBAL and the target then loads with no DYLD_* variables — which a hardened
/usr/bin/python3 would strip anyway.

This ctor's observable output is TWO things: the object it fills in and the process-global list
head it moves. Both are read back here. The global at @Ozone 0x932c78 is SAVED before the test,
forced NULL so the sequence starts from a known empty list, and RESTORED afterwards, so the loaded
framework is left exactly as it was found.
"""
import ctypes
import glob
import json
import os
import platform
import struct
import subprocess

# A driver that does not terminate is a mutant that was KILLED, not a pending result: two of them
# held a core for 2h31m before anyone noticed. See re/oracle/oracle_driver.py for the full account.
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
import sys

FW = "Ozone"
SYM = "_ZN14OZRetimingUtil16RetimingExaminerC2Ev"      # dlsym: no leading underscore
NM_SYM = "__ZN14OZRetimingUtil16RetimingExaminerC2Ev"
VTABLE_SYM = "__ZTVN14OZRetimingUtil16RetimingExaminerE"
SHEAD_VMADDR = 0x932c78          # decoded from the instruction bytes; see the port's header
OBJ_SIZE = 0x40
POISON = 0xEE
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.environ.get("FCT_TS_DRIVER") or os.path.join(
    REPO, "raw-port", "re", "oracle", "OZRetimingUtil__RetimingExaminer_C2_driver.ts")


def load_with_rpath(path, seen=None):
    seen = seen if seen is not None else set()
    real = os.path.realpath(path)
    if real in seen:
        return None
    seen.add(real)
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if dep.startswith("@rpath/"):
            cand = os.path.join(fwdir, dep[len("@rpath/"):])
            if os.path.exists(cand):
                try:
                    load_with_rpath(cand, seen)
                except OSError:
                    pass
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


def symbol_table(fw, path):
    """{name: vmaddr}. Never `nm` on the fat binary in the app bundle (swarm perf directive): the
    inventory cache first, then `nm -n -arch x86_64` on the THIN slice disasm.sh already made —
    the explicit -arch because a bare `nm` reports ARM64 even under Rosetta (OPS_LOG). The cache
    holds functions only, so the vtable DATA symbol comes from the thin-slice pass."""
    text = ""
    cache = os.path.join(REPO, "raw-port", "army", "inventory", fw + ".syms.txt")
    if os.path.exists(cache):
        text = open(cache, encoding="utf-8", errors="replace").read()
    thin = "/tmp/%s.x86_64" % fw
    if not os.path.exists(thin):
        subprocess.run(["lipo", "-thin", "x86_64", path, "-output", thin], check=True)
    text += subprocess.run(["nm", "-n", "-arch", "x86_64", thin],
                           capture_output=True, text=True).stdout
    out = {}
    for line in text.splitlines():
        p = line.split(None, 2)
        if len(p) == 3 and p[0].strip():
            try:
                out.setdefault(p[2], int(p[0], 16))
            except ValueError:
                pass
    return out


def run_ts():
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    p = subprocess.run([tsx, TS_DRIVER], capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"), timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return json.loads(p.stdout.strip().splitlines()[-1])


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    path = os.path.join(fwdir, FW + ".framework", FW)
    lib = load_with_rpath(path)
    syms = symbol_table(FW, path)

    ctor = getattr(lib, SYM)
    ctor.restype = None
    ctor.argtypes = [ctypes.c_void_p]
    slide = ctypes.cast(ctor, ctypes.c_void_p).value - syms[NM_SYM]
    print(f"image slide = {slide:#x}   (Ozone loaded via its @rpath chain)")

    want_vptr = syms[VTABLE_SYM] + 0x10 + slide
    shead = ctypes.cast(SHEAD_VMADDR + slide, ctypes.POINTER(ctypes.c_uint64))
    saved = shead[0]
    print(f"sHead @Ozone {SHEAD_VMADDR:#x} (+slide {SHEAD_VMADDR + slide:#x}) currently {saved:#x}"
          f" — saved; will be restored")

    ts = run_ts()
    print(f"TS port: {json.dumps(ts, sort_keys=True)}")

    checks = []

    def check(name, ok, detail):
        checks.append((name, bool(ok), detail))

    try:
        shead[0] = 0                       # start from a known EMPTY list
        a = ctypes.create_string_buffer(OBJ_SIZE)
        ctypes.memset(ctypes.addressof(a), POISON, OBJ_SIZE)
        ctor(ctypes.addressof(a))
        raw_a = bytes(a.raw)
        addr_a = ctypes.addressof(a)

        check("1st ctor on an EMPTY list: next == NULL (port next === null)",
              struct.unpack_from("<Q", raw_a, 0x08)[0] == 0 and ts["first"]["next"] is None,
              "live %#x, port %r" % (struct.unpack_from("<Q", raw_a, 0x08)[0], ts["first"]["next"]))
        check("1st ctor: prev == NULL (port prev === null)",
              struct.unpack_from("<Q", raw_a, 0x10)[0] == 0 and ts["first"]["prev"] is None,
              "live %#x" % struct.unpack_from("<Q", raw_a, 0x10)[0])
        check("1st ctor: sHead == the new object (port sHead === it)",
              shead[0] == addr_a and ts["first"]["isHead"] is True,
              "live %#x vs %#x" % (shead[0], addr_a))
        check("1st ctor: vptr == __ZTVN...RetimingExaminerE + 0x10 (port vptrAddr)",
              struct.unpack_from("<Q", raw_a, 0x00)[0] == want_vptr
              and ts["vptrAddr"] == syms[VTABLE_SYM] + 0x10,
              "live %#x vs %#x (unslid %#x); port %#x"
              % (struct.unpack_from("<Q", raw_a, 0x00)[0], want_vptr,
                 struct.unpack_from("<Q", raw_a, 0x00)[0] - slide, ts["vptrAddr"]))
        check("1st ctor: +0x18.. UNTOUCHED (only the three slots are written)",
              raw_a[0x18:] == bytes([POISON]) * (OBJ_SIZE - 0x18),
              "%d of %d tail bytes still poison"
              % (sum(1 for b in raw_a[0x18:] if b == POISON), OBJ_SIZE - 0x18))

        b = ctypes.create_string_buffer(OBJ_SIZE)
        ctypes.memset(ctypes.addressof(b), POISON, OBJ_SIZE)
        ctor(ctypes.addressof(b))
        raw_b = bytes(b.raw)
        addr_b = ctypes.addressof(b)
        raw_a2 = bytes(a.raw)                       # A after B's ctor ran

        check("2nd ctor: next == the PREVIOUS head (port next === first)",
              struct.unpack_from("<Q", raw_b, 0x08)[0] == addr_a
              and ts["second"]["nextIsFirst"] is True,
              "live %#x vs %#x" % (struct.unpack_from("<Q", raw_b, 0x08)[0], addr_a))
        check("2nd ctor: prev == NULL",
              struct.unpack_from("<Q", raw_b, 0x10)[0] == 0 and ts["second"]["prev"] is None,
              "live %#x" % struct.unpack_from("<Q", raw_b, 0x10)[0])
        check("2nd ctor: the OLD head's prev now points BACK at the new node "
              "(port first.prev === second)",
              struct.unpack_from("<Q", raw_a2, 0x10)[0] == addr_b
              and ts["second"]["firstPrevIsSecond"] is True,
              "live %#x vs %#x" % (struct.unpack_from("<Q", raw_a2, 0x10)[0], addr_b))
        check("2nd ctor: the old head's OTHER slots are unchanged (only +0x10 is written)",
              raw_a2[:0x10] == raw_a[:0x10] and raw_a2[0x18:] == raw_a[0x18:],
              "vptr/next/tail identical: %s" % (raw_a2[:0x10] == raw_a[:0x10]))
        check("2nd ctor: sHead == the new object",
              shead[0] == addr_b and ts["second"]["isHead"] is True,
              "live %#x vs %#x" % (shead[0], addr_b))
    finally:
        shead[0] = saved
        print(f"sHead restored to {shead[0]:#x}")

    for name, ok, detail in checks:
        print(f"  {'PASS' if ok else 'FAIL'}  {name}\n          {detail}")

    print("NEGATIVE CONTROLS (mis-reads of this same ctor, judged by the SAME bytes):")
    print("  %s — next/prev swapped (+0x08 would hold NULL after the 2nd ctor)"
          % ("rejected" if struct.unpack_from("<Q", raw_b, 0x08)[0] != 0 else "NOT REJECTED"))
    print("  %s — no back-link (the old head's +0x10 would still be poison)"
          % ("rejected" if raw_a2[0x10:0x18] != bytes([POISON]) * 8 else "NOT REJECTED"))
    print("  %s — the ctor APPENDS instead of pushing front (sHead would still be the 1st object)"
          % ("rejected" if addr_b != addr_a else "NOT REJECTED"))
    print("  %s — the vptr is the vtable SYMBOL address (no +0x10)"
          % ("rejected" if struct.unpack_from("<Q", raw_a, 0)[0] != syms[VTABLE_SYM] + slide
             else "NOT REJECTED"))

    ok = all(c[1] for c in checks)
    print("VERIFIED vs live Ozone" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
