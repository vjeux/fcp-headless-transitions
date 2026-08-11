#!/usr/bin/env python3
"""Behavioural oracle for PCCFRef<CGImageSource*>::~PCCFRef() [D2] @ProCore 0x69496.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PCCFRef_CGImageSource_D2_oracle.py

LOCAL symbol (`nm` type `t` — a template instantiation), so dlsym cannot reach it:
called at dyld slide + 0x69496 through ozone_loader.py, which refuses to run
outside an x86_64 process.

The body is `movq (%rdi),%rdi ; testq ; je ; callq _CFRelease`, i.e. "release the
handle at +0x00 unless it is NULL". Both halves are checked against the live
binary using CoreFoundation's own retain count, which is the only externally
visible consequence:
  1. RELEASE — a CF object retained to a known count is handed to the dtor and
     its count must drop by EXACTLY one (a real CF object is used, not a fake
     pointer, so CFRelease genuinely runs; the count is kept >= 1 throughout so
     nothing is ever freed out from under the harness);
  2. NULL GUARD — a zero handle must be a no-op and must not crash;
  3. the D2 flavour must NOT null the field afterwards (the sibling
     PCCFRef_CFData.ts documents this; here it is measured).
The type parameter is irrelevant to the body — it CFReleases an opaque pointer —
so a CFString stands in for a CGImageSourceRef, and that substitution is stated
rather than hidden.
"""
import ctypes, ctypes.util, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZN7PCCFRefIP13CGImageSourceED2Ev"
VA = 0x69496


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn("ProCore", SYM, None, [ctypes.c_void_p])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    CF = ctypes.CDLL(ctypes.util.find_library("CoreFoundation"), ctypes.RTLD_GLOBAL)
    CF.CFStringCreateWithCString.restype = ctypes.c_void_p
    CF.CFStringCreateWithCString.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_uint32]
    CF.CFRetain.restype = ctypes.c_void_p
    CF.CFRetain.argtypes = [ctypes.c_void_p]
    CF.CFGetRetainCount.restype = ctypes.c_long
    CF.CFGetRetainCount.argtypes = [ctypes.c_void_p]

    released_ok = 0
    field_nulled = 0
    trials = 32
    for i in range(trials):
        # a heap-allocated (non-tagged) CFString, so the retain count is real
        cf = CF.CFStringCreateWithCString(None, b"PCCFRef oracle payload %d" % i, 0x8000100)
        for _ in range(3):
            CF.CFRetain(ctypes.c_void_p(cf))
        before = CF.CFGetRetainCount(ctypes.c_void_p(cf))

        obj = (ctypes.c_void_p * 1)(cf)
        fn(ctypes.cast(obj, ctypes.c_void_p))

        after = CF.CFGetRetainCount(ctypes.c_void_p(cf))
        if after == before - 1:
            released_ok += 1
        if obj[0] != cf:
            field_nulled += 1

    # NULL guard: must not crash, must do nothing
    nullobj = (ctypes.c_void_p * 1)(None)
    fn(ctypes.cast(nullobj, ctypes.c_void_p))
    null_ok = nullobj[0] is None

    print(f"TRIALS={trials} RETAIN_COUNT_DROPPED_BY_ONE={released_ok}/{trials} "
          f"FIELD_NULLED_AFTERWARDS={field_nulled}/{trials} (expected 0 — D2 does not clear it) "
          f"NULL_HANDLE_NOOP={null_ok}")
    print("  NEGATIVE CONTROL a port that released TWICE would drop the count by 2; "
          "one that released nothing would leave it unchanged — both are excluded by "
          f"the exact-by-one result above ({released_ok}/{trials}).")

    ok = released_ok == trials and field_nulled == 0 and null_ok
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
