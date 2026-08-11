#!/usr/bin/env python3
"""Differential oracle for
AUSampleRateConverterWithTimeStamps::SupportedNumChannels(AUChannelInfo const**) @Flexo 0x1243d30.

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/AUSampleRateConverterWithTimeStamps_SupportedNumChannels_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

The symbol is LOCAL (`t`), so it is called at slide + vmaddr, with the OPCODE BYTES at that
address checked first — otherwise "the call returned 1" would not prove WHICH function ran (a bare
`nm` reports ARM64 addresses even under Rosetta). `this` is passed as poison because the port
claims it is never dereferenced.
"""
import ctypes
import glob
import os
import platform
import struct
import subprocess
import sys

FW = "Flexo"
NM_SYM = "__ZN35AUSampleRateConverterWithTimeStamps20SupportedNumChannelsEPPK13AUChannelInfo"
VMADDR = 0x1243d30
# pushq %rbp ; movq %rsp,%rbp ; testq %rsi,%rsi ; je +0xa ; leaq ...
BODY = bytes.fromhex("554889e54885f6740a488d058ef2")
SCHANNELS_VMADDR = 0x1582fce
POISON_PTR = 0xDEADBEEFDEADBEEF
POISON_CELL = 0xA5A5A5A5A5A5A5A5
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))


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
    """Inventory cache first, then `nm -n -arch x86_64` on the THIN slice — never nm on the fat
    binary (swarm perf directive)."""
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
                out.setdefault(p[2], (p[1], int(p[0], 16)))
            except ValueError:
                pass
    return out


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    path = os.path.join(fwdir, FW + ".framework", FW)
    lib = load_with_rpath(path)
    table = symbol_table(FW, path)
    if table[NM_SYM][1] != VMADDR:
        raise SystemExit("symbol moved")

    slide = None
    for name, (kind, va) in table.items():
        if kind == "T":
            try:
                a = ctypes.cast(getattr(lib, name[1:]), ctypes.c_void_p).value
            except AttributeError:
                continue
            if a:
                slide = a - va
                break
    print(f"image slide = {slide:#x}")

    addr = VMADDR + slide
    got = ctypes.string_at(addr, len(BODY))
    print(f"bytes at {addr:#x}: {got.hex()}  expected: {BODY.hex()}  "
          f"{'MATCH' if got == BODY else 'MISMATCH'}")
    if got != BODY:
        raise SystemExit("the transcribed body is not at the computed address — refusing to sign")

    fn = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p)(addr)

    checks = []

    def check(name, ok, detail):
        checks.append((name, bool(ok), detail))

    # (1) NULL out-pointer: returns 1, writes nothing (there is nothing to write to — a wrong
    #     port that stored unconditionally would segfault here, which is itself the measurement).
    rc_null = fn(POISON_PTR, None)
    check("NULL outInfo -> returns 1 and does not store", rc_null == 1, "returned %d" % rc_null)

    # (2) non-NULL: returns 1 and stores exactly &sChannels.
    cell = ctypes.c_uint64(POISON_CELL)
    rc = fn(POISON_PTR, ctypes.byref(cell))
    want = SCHANNELS_VMADDR + slide
    check("non-NULL outInfo -> returns 1", rc == 1, "returned %d" % rc)
    check("non-NULL outInfo -> *outInfo == &sChannels (@Flexo 0x1582fce)",
          cell.value == want,
          "stored %#x, expected %#x (unslid %#x)" % (cell.value, want, cell.value - slide))

    # (3) the table's contents, and the count the method promises.
    raw = ctypes.string_at(want, 4)
    pair = struct.unpack("<hh", raw)
    check("sChannels[0] == {-1, -1} as two SInt16 (the port's table)",
          raw == b"\xff\xff\xff\xff" and pair == (-1, -1),
          "bytes %s -> (in=%d, out=%d)" % (raw.hex(), pair[0], pair[1]))

    # (4) idempotence + independence from `this`: three different poison `this` values.
    same = True
    for t in (POISON_PTR, 0, 0x1):
        c = ctypes.c_uint64(POISON_CELL)
        if fn(t, ctypes.byref(c)) != 1 or c.value != want:
            same = False
    check("the answer does not depend on `this` (poison / NULL / 1)", same,
          "all three gave 1 and the same table pointer")

    for name, ok, detail in checks:
        print(f"  {'PASS' if ok else 'FAIL'}  {name}\n          {detail}")

    print("NEGATIVE CONTROLS (mis-reads judged by the same live behaviour):")
    print(f"  {'rejected' if rc_null == 1 else 'NOT REJECTED'} — a NULL out-pointer returns 0 "
          f"(live returned {rc_null})")
    print(f"  {'rejected' if cell.value != POISON_CELL else 'NOT REJECTED'} — the store never "
          f"happens (the cell would still hold the poison)")
    print(f"  {'rejected' if pair != (-1, 0xffff) else 'NOT REJECTED'} — AUChannelInfo is two "
          f"SInt32 (the 4 bytes would then be ONE field, not the pair (-1,-1))")

    ok = all(c[1] for c in checks)
    print("VERIFIED vs live Flexo" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
