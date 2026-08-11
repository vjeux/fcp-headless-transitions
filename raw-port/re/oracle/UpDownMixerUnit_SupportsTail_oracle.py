#!/usr/bin/env python3
"""Differential oracle for UpDownMixerUnit::SupportsTail() @Flexo 0x1241530.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/UpDownMixerUnit_SupportsTail_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset (OPS_LOG: "the executable
oracle calls the wrong architecture" — it fails silently toward VERIFIED).

This symbol is LOCAL (`nm` type `t`, not `T`), so dlsym cannot reach it. It is called the way
fct/parity/local_call.py does — image slide + vmaddr — but the symbol table is read from the
pre-built cache `raw-port/army/inventory/<FW>.syms.txt` (`<addr> <T|t> <mangled>`), NOT by
running `nm` on the 78 MB fat binary in the app bundle: that lookup costs a full core for a
minute or two under the corp security stack, and the swarm runs many of them. The fallback,
used only when the cache is absent (it is gitignored, so a fresh pool worktree lacks it), is
`nm -n -arch x86_64` against the THIN slice /tmp/<FW>.x86_64 that disasm.sh already produced —
never the fat original, and with the OPS_LOG correction that a BARE `nm -n` reports the ARM64
slice even from a Rosetta process (which would compute arm64 vmaddr + x86_64 slide and land on
some other function inside the mapped image).

Two guards make that address arithmetic self-checking rather than trusted:
  1. the first bytes at the computed address are compared to the exact opcode bytes of the
     transcribed body (`55 48 89 e5 b0 01 5d c3`), and
  2. the SAME arithmetic is applied to the neighbouring symbols, which must NOT match those
     bytes — otherwise "the bytes matched" would be vacuous.

The body reads no memory at all (no `%rdi` dereference anywhere in it), so the call is made with
a range of hostile `this` values — NULL, poison patterns, and a real buffer — and every one must
answer the same. That is the measurement behind "this method ignores its object".
"""
import ctypes
import glob
import os
import platform
import subprocess
import sys

FW = "Flexo"
SYM = "__ZN15UpDownMixerUnit12SupportsTailEv"          # nm spelling (leading underscore)
VMADDR = 0x1241530
# 0x1241530 pushq %rbp / movq %rsp,%rbp / movb $0x1,%al / popq %rbp / retq
BODY = bytes([0x55, 0x48, 0x89, 0xE5, 0xB0, 0x01, 0x5D, 0xC3])
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
    """{name: (type, vmaddr)} from the inventory cache, else nm on the THIN slice."""
    cache = os.path.join(REPO, "raw-port", "army", "inventory", fw + ".syms.txt")
    if os.path.exists(cache):
        src, text = cache, open(cache, encoding="utf-8", errors="replace").read()
    else:
        thin = "/tmp/%s.x86_64" % fw
        if not os.path.exists(thin):
            subprocess.run(["lipo", "-thin", "x86_64", path, "-output", thin], check=True)
        src = thin
        text = subprocess.run(["nm", "-n", "-arch", "x86_64", thin],
                              capture_output=True, text=True).stdout
    table = {}
    for line in text.splitlines():
        p = line.split(None, 2)
        if len(p) == 3 and p[0].strip():
            try:
                table.setdefault(p[2], (p[1], int(p[0], 16)))
            except ValueError:
                pass
    print(f"symbol table: {len(table)} names from {src}")
    return table


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    path = os.path.join(fwdir, FW + ".framework", FW)
    lib = load_with_rpath(path)
    table = symbol_table(FW, path)
    syms = {k: v[1] for k, v in table.items()}

    if syms.get(SYM) != VMADDR:
        raise SystemExit(f"symbol moved: table says {syms.get(SYM)}, port cites {VMADDR:#x}")

    # Slide from an EXPORTED symbol we can dlsym, so the slide itself is measured, not assumed.
    slide = None
    for probe_nm in [k for k, v in table.items() if v[0] == "T"]:
        try:
            probe = ctypes.cast(getattr(lib, probe_nm[1:]), ctypes.c_void_p).value
        except AttributeError:
            continue
        if probe:
            slide = probe - syms[probe_nm]
            break
    if slide is None:
        raise SystemExit("could not measure the image slide from any exported symbol")
    print(f"image slide = {slide:#x}   (measured from {probe_nm})")

    addr = VMADDR + slide
    got = ctypes.string_at(addr, len(BODY))
    print(f"bytes at {addr:#x}: {got.hex()}  expected: {BODY.hex()}  "
          f"{'MATCH' if got == BODY else 'MISMATCH'}")
    if got != BODY:
        raise SystemExit("the transcribed body is not at the computed address — refusing to sign")

    # Control: the same arithmetic on the neighbours must NOT produce this body.
    neighbours = [s for s, v in syms.items()
                  if s.startswith("__ZN15UpDownMixerUnit") and v != VMADDR]
    same = sum(1 for s in neighbours if ctypes.string_at(syms[s] + slide, len(BODY)) == BODY)
    print(f"neighbour control: {same} of {len(neighbours)} other UpDownMixerUnit symbols carry the "
          f"same bytes (0 = the byte check is discriminating)")

    fn = ctypes.CFUNCTYPE(ctypes.c_bool, ctypes.c_void_p)(addr)
    thises = [0, 0x1, 0xDEADBEEF, 0xFFFFFFFFFFFF,
              ctypes.addressof(ctypes.create_string_buffer(b"\xEE" * 0x400)),
              ctypes.addressof(ctypes.create_string_buffer(b"\x00" * 0x400))]
    live = [bool(fn(t)) for t in thises]
    port = [True] * len(thises)          # the TS body: `return true;`
    bad = [i for i in range(len(thises)) if live[i] != port[i]]
    for t, v in zip(thises, live):
        print(f"  this={t:#018x} -> live={v}")
    print(f"cases={len(thises)}  divergences={len(bad)}")
    print("VERIFIED vs live Flexo" if not bad else "DIVERGED")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
