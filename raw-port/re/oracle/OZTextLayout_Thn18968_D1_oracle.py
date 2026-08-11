#!/usr/bin/env python3
"""Behavioural oracle for the non-virtual thunk to OZTextLayout::~OZTextLayout()
[D1] @Ozone 0x6dc620.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZTextLayout_Thn18968_D1_oracle.py

This body is `pushq %rbp ; movq %rsp,%rbp ; ud2` — an intentional
undefined-opcode trap. The port therefore throws, and "the port throws" is only
honest if the machine really does trap, so this harness proves it TWO ways:

  1. STATICALLY — the two bytes at slide + 0x6dc624 are read back through the
     mapped image and must be 0f 0b, the `ud2` encoding, with the frame prologue
     55 48 89 e5 in front of it;
  2. BEHAVIOURALLY — the function is actually CALLED, in a forked CHILD process
     (a `ud2` raises SIGILL and would take the harness down with it), and the
     child must die with signal 4 = SIGILL.

The sibling thunks (Thn200/216/240/18968 D1, and the Thn18968 D0) are checked
statically too: the whole thunk family is traps, which is what makes "deliberately
unreachable entry point" the right reading rather than "undecoded".
"""
import ctypes, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

TARGET = ("__ZThn18968_N12OZTextLayoutD1Ev", 0x6DC620)
FAMILY = [
    ("__ZN12OZTextLayoutD1Ev", 0x6DC5D0),
    ("__ZThn200_N12OZTextLayoutD1Ev", 0x6DC5E0),
    ("__ZThn216_N12OZTextLayoutD1Ev", 0x6DC5F0),
    ("__ZThn240_N12OZTextLayoutD1Ev", 0x6DC600),
    ("__ZThn6720_N12OZTextLayoutD1Ev", 0x6DC610),
    ("__ZThn18968_N12OZTextLayoutD1Ev", 0x6DC620),
    ("__ZN12OZTextLayoutD0Ev", 0x6DC630),
    ("__ZThn200_N12OZTextLayoutD0Ev", 0x6DC640),
    ("__ZThn216_N12OZTextLayoutD0Ev", 0x6DC650),
    ("__ZThn240_N12OZTextLayoutD0Ev", 0x6DC660),
    ("__ZThn6720_N12OZTextLayoutD0Ev", 0x6DC670),
    ("__ZThn18968_N12OZTextLayoutD0Ev", 0x6DC680),
]
PROLOGUE_UD2 = bytes([0x55, 0x48, 0x89, 0xE5, 0x0F, 0x0B])  # push rbp; mov rbp,rsp; ud2


def main():
    L.require_x86_64()
    L.load_framework("Ozone")
    slide, image = L.image_slide("Ozone")
    print(f"image={image}\nslide={slide:#x}")

    bad = 0
    for name, va in FAMILY:
        got = ctypes.string_at(ctypes.c_void_p(slide + va), len(PROLOGUE_UD2))
        ok = got == PROLOGUE_UD2
        if not ok:
            bad += 1
        print(f"  {va:#x} {name:42s} bytes={got.hex()} ud2={'yes' if ok else 'NO'}")

    # ---- behavioural: calling it must raise SIGILL, so do it in a child ----
    pid = os.fork()
    if pid == 0:
        # child: call the thunk for real. It must not return.
        proto = ctypes.CFUNCTYPE(None, ctypes.c_void_p)
        fn = proto(slide + TARGET[1])
        obj = (ctypes.c_ubyte * 0x40)()
        fn(ctypes.cast(ctypes.byref(obj), ctypes.c_void_p))
        os._exit(0)  # reached only if the trap did NOT fire
    _, status = os.waitpid(pid, 0)
    signalled = os.WIFSIGNALED(status)
    sig = os.WTERMSIG(status) if signalled else None
    print(f"CALLED IN CHILD: signalled={signalled} signal={sig} (4 = SIGILL, the ud2 trap)")

    ok = bad == 0 and signalled and sig == 4
    print(f"FAMILY_CHECKED={len(FAMILY)} NON_UD2={bad}")
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
