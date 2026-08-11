#!/usr/bin/env python3
"""Differential oracle for FFOZAudioUnitEffectRootChannel_Factory::version()
@Flexo 0x218a20.

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/FFOZAudioUnitEffectRootChannel_Factory_version_oracle.py

LOCAL symbol (`nm` type `t`), so dlsym cannot reach it: called at dyld slide +
0x218a20 via ozone_loader.py, which also loads FLEXO outside the app bundle by
preloading its @rpath chain depth-first (the standing "Flexo can't be dlopen'd"
note is wrong — see OPS_LOG) and refuses to run outside an x86_64 process.

The body is `movl $0x1, %eax`, so there is exactly one thing to check and one way
to get it wrong: the constant. It is checked with several `this` values —
including NULL — because the body has no `(%rdi)` operand at all, which is what
licenses the port's stateless model.
"""
import ctypes, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZN38FFOZAudioUnitEffectRootChannel_Factory7versionEv"
VA = 0x218A20


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn("Flexo", SYM, ctypes.c_uint32, [ctypes.c_void_p])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    this_values = [None, 0x1, 0xDEADBEEF, slide, 0x4141414141414141, 0x7FFFFFFFFFFF]
    got = [fn(ctypes.c_void_p(t)) for t in this_values]
    wrong = sum(1 for g in got if g != 1)
    this_sensitive = len(set(got)) - 1

    print(f"CALLS={len(got)} NOT_ONE={wrong} THIS_SENSITIVE={this_sensitive} values={got}")
    print(f"  NEGATIVE CONTROL a port returning 0 (the revision() constant): "
          f"{sum(1 for g in got if g != 0)}/{len(got)} wrong")
    print(f"  NEGATIVE CONTROL a port returning -1 (the getIconIDInternal shape): "
          f"{sum(1 for g in got if g != 0xFFFFFFFF)}/{len(got)} wrong")

    ok = wrong == 0 and this_sensitive == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
