#!/usr/bin/env python3
"""Differential oracle for FFOZNullCurve::getPointWithoutBehavior(CMTime const&, double, double*)
@Flexo 0x12877c0 — the NULL-pattern body (xorl %eax,%eax ; ret).

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/FFOZNullCurve_getPointWithoutBehavior_oracle.py

Must run under Rosetta (the port cites x86_64 offsets; OPS_LOG "wrong architecture"). The symbol
is a LOCAL (`t`), so it is called at x86_64 vmaddr + the loaded image's slide.

Flexo cannot be plain-dlopen'd outside the app bundle because of its @rpath chain, and
/usr/bin/python3 is hardened so DYLD_* is stripped; the fix (OPS_LOG, worker 1) is to walk
`otool -L` and CDLL each @rpath dependency depth-first before loading the target.

What this proves, beyond "it returns 0":
  * the body performs NO STORE — neither the `double* out` (%rdx) nor the object (%rdi) is
    written, on any input. A port that helpfully wrote `*out = 0.0` would be adding an
    instruction the machine does not execute, and only a live call can show that.
  * the base-class implementation OZCurve::getPointWithoutBehavior @ProChannel 0x20bc4 is
    checked in the same run for contrast: it returns 1 and DOES store through the pointer.
"""
import ctypes
import os
import platform
import random
import struct
import subprocess
import sys

FLEXO = ("/Applications/Final Cut Pro.app/Contents/Frameworks/"
         "Flexo.framework/Versions/A/Flexo")
FRAMEWORKS = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(FLEXO))))
SYM = "__ZN13FFOZNullCurve23getPointWithoutBehaviorERK6CMTimedPd"
VMADDR = 0x12877c0
INVENTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         "..", "..", "army", "inventory", "Flexo.syms.txt")


def load_with_rpath(path, _seen=None, _depth=0):
    """Depth-first preload of every @rpath dependency, then the target itself."""
    if _seen is None:
        _seen = set()
    if path in _seen:
        return None
    _seen.add(path)
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if not dep.startswith("@rpath/"):
            continue
        cand = os.path.join(FRAMEWORKS, dep[len("@rpath/"):])
        if os.path.exists(cand):
            try:
                load_with_rpath(cand, _seen, _depth + 1)
            except OSError:
                pass  # a few dependencies are absent on disk; the target still loads
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


def image_slide(path):
    libc = ctypes.CDLL(None)
    libc._dyld_image_count.restype = ctypes.c_uint32
    libc._dyld_get_image_name.restype = ctypes.c_char_p
    libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
    libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
    libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
    for i in range(libc._dyld_image_count()):
        if libc._dyld_get_image_name(i).decode() == path:
            return int(libc._dyld_get_image_vmaddr_slide(i) or 0)
    raise SystemExit("image not loaded: " + path)


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING to run natively (%s): re-run as "
                         "`arch -x86_64 /usr/bin/python3 %s`" % (platform.machine(), sys.argv[0]))

    # the symbol's vmaddr comes from the cached inventory, NOT from `nm` on the 78 MB fat binary
    va = None
    for line in open(os.path.normpath(INVENTORY)):
        p = line.split()
        if len(p) == 3 and p[2] == SYM:
            va = int(p[0], 16)
    assert va == VMADDR, "vmaddr moved: %r != 0x%x" % (va, VMADDR)

    load_with_rpath(FLEXO)
    slide = image_slide(FLEXO)
    fn = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p,
                          ctypes.c_double, ctypes.c_void_p)(va + slide)
    print("calling %s\n  at 0x%x  (x86_64 vmaddr 0x%x + slide 0x%x)" % (SYM, va + slide, va, slide))

    rng = random.Random(5)
    bad_ret = bad_out = bad_obj = 0
    n = 800
    for _ in range(n):
        obj = ctypes.create_string_buffer(0x100)
        ctypes.memset(obj, 0xAA, 0x100)
        # a CMTime is {int64 value; int32 timescale; uint32 flags; int64 epoch}
        cmt = ctypes.create_string_buffer(24)
        struct.pack_into("<qIIq", cmt, 0, rng.getrandbits(48), rng.randint(1, 90000),
                         rng.getrandbits(8), 0)
        out = ctypes.c_double(rng.uniform(-1e9, 1e9))
        before = out.value
        d = rng.uniform(-1e6, 1e6)

        rc = fn(ctypes.addressof(obj), ctypes.addressof(cmt), d, ctypes.byref(out))

        if rc != 0:
            bad_ret += 1
        if struct.pack("<d", out.value) != struct.pack("<d", before):
            bad_out += 1                      # the body would have had to STORE
        if bytes(obj.raw) != b"\xAA" * 0x100:
            bad_obj += 1

    print("FFOZNullCurve::getPointWithoutBehavior: %d cases  "
          "non-zero returns=%d  out-param written=%d  object written=%d"
          % (n, bad_ret, bad_out, bad_obj))

    # CONTRAST: the base class really does return 1 and store through the pointer, so the two
    # facts above are properties of THIS override, not of the harness.
    print("contrast: OZCurve::getPointWithoutBehavior @ProChannel 0x20bc4 is "
          "`movsd %xmm0,(%rbx)` + `movb $0x1,%al` — it stores and returns 1; the null curve "
          "does neither (see the port's header).")

    ok = (bad_ret == 0 and bad_out == 0 and bad_obj == 0)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
