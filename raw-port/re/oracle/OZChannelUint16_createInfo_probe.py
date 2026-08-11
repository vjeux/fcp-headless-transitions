#!/usr/bin/env python3
"""OZChannelUint16_createInfo_probe.py — live differential probe for
OZChannelUint16::createOZChannelUint16Info() @ProChannel 0xf4e4
(__ZN15OZChannelUint1625createOZChannelUint16InfoEv, a LOCAL `t` symbol, so it is called BY
ADDRESS at slide + 0xf4e4, not by dlsym).

What it measures, against the live x86_64 ProChannel image (the SAME slice the port is
transcribed from):
  A. the 19 opcode bytes at slide+0xf4e4 are the ones the port was transcribed from (self-check)
  B. before any call: once-flag word @0xeb7d0 == 0 and the singleton @0xec258 == NULL
  C. call #1 returns a non-NULL pointer P
  D. after call #1: the once flag reads exactly -1 (0xFFFFFFFFFFFFFFFF), NOT 1 — this is the
     decode fact the port's `!== -1n` fast path rests on, and the one a `=== 1` model gets wrong
  E. the singleton word @0xec258 == P (the accessor returns the DEREF of that global)
  F. call #2 returns the SAME P and allocates nothing new (idempotence of the call_once path)
  G. WHAT THE INITIALIZER BUILT: the object at P carries the OZChannelUint16Info vtable pointer
     at +0x00 (0xcfac8 + slide) and the PCSingleton sub-object vtable at +0x50 (0xcfae8 + slide).
     Those are exactly the two words `OZChannelUint16Info::C2` @0xf5cc writes, at 0xf610 and
     0xf61a (`leaq 0xc04b8(%rip)` @0xf609 -> 0xf610+0xc04b8 = 0xcfac8; `leaq 0xc04ce(%rip)`
     @0xf613 -> 0xf61a+0xc04ce = 0xcfae8), and they are the addresses the landed
     OZChannelUint16Info.ts records.

     G is the check that pays here, and it is why it must not be skipped: the Info side is the
     one part of this port that is a TRANSCRIPTION rather than a deferral. Its initializer was
     inlined into the STL instantiation `__invoke` @0xf588 — `cmpq $0x0,(%r14)` @0xf596,
     `operator new(0x58)` @0xf5a1, `OZChannelUint16Info::C2` called @0xf5ac, published to the
     singleton @0xf5b1 — and the port transcribes that. A–F would pass for ANY call_once
     accessor whatsoever (they say only "a stable non-NULL pointer came back and a flag went to
     -1"); G is the only check that says the thing that came back is an OZChannelUint16Info
     constructed by that ctor.

     NOT measured by G, stated so `RESULT: PASS` cannot be read as covering it: the 0x58
     allocation SIZE. It is decoded from `movl $0x58,%edi` @0xf59c and is not observable from
     outside the allocator.

Run: arch -x86_64 /usr/bin/python3 -u raw-port/re/oracle/OZChannelUint16_createInfo_probe.py
     (from the repo root; the probe needs no arguments)
"""
import ctypes, ctypes.util, os, platform, subprocess, sys

FCP = "/Applications/Final Cut Pro.app/Contents"
PC = FCP + "/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RPATHS = [FCP + "/Frameworks", FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/PlugIns", FCP + "/Frameworks/ProApps"]

ACC = 0xf4e4          # the accessor under test
ONCE = 0xeb7d0        # once-flag BSS   (0xf4f3 + 0xdc2dd, from the movq's disp32 `dd c2 0d 00`)
GLOB = 0xec258        # singleton pointer BSS (0xf525 + 0xdcd33)
VT_INFO = 0xcfac8     # primary vtable ptr written by C2 @0xf610 (leaq @0xf609, disp 0xc04b8)
VT_PCS = 0xcfae8      # PCSingleton sub-object vtable, written by C2 @0xf61a (leaq @0xf613)
# first 19 bytes of the accessor (pushq..cmpq), read out of /tmp/ProChannel.x86_64
EXPECT = bytes.fromhex("554889e54883ec20488b05ddc20d004883f8ff")

if platform.machine() != "x86_64":
    sys.exit("REFUSING: %s — rerun under `arch -x86_64 /usr/bin/python3`" % platform.machine())


def deps(path):
    out = subprocess.run(["otool", "-L", path], capture_output=True, text=True).stdout
    return [l.split()[0] for l in out.splitlines()[1:] if l.strip()]


def resolve(name):
    if name.startswith("@rpath/"):
        for r in RPATHS:
            p = os.path.join(r, name[len("@rpath/"):])
            if os.path.exists(p):
                return p
        return None
    return name if os.path.exists(name) else None


loaded, failed = set(), []


def preload(path, depth=0):
    if path in loaded or depth > 6:
        return
    loaded.add(path)
    for d in deps(path):
        rp = resolve(d)
        if rp and rp != path and rp not in loaded:
            preload(rp, depth + 1)
    try:
        ctypes.CDLL(path, mode=ctypes.RTLD_GLOBAL)
    except OSError as e:
        failed.append((os.path.basename(path), str(e).split(":")[-1].strip()[:60]))


preload(PC)
print("preloaded %d images (%d failed)" % (len(loaded), len(failed)))
for f in failed[:5]:
    print("   failed:", f)
ctypes.CDLL(PC, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]

slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/ProChannel"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        print("ProChannel image #%d slide=0x%x  %s" % (i, slide, libc._dyld_get_image_name(i).decode()))
        break
if slide is None:
    sys.exit("INCONCLUSIVE: ProChannel not in the image list")

fails = []


def check(tag, ok, detail):
    print(("  PASS  " if ok else "  FAIL  ") + tag + " : " + detail)
    if not ok:
        fails.append(tag)


# A — opcode self-check
got = ctypes.string_at(slide + ACC, len(EXPECT))
check("A opcode self-check @0x%x"%ACC, got == EXPECT,
      "live=%s expect=%s" % (got.hex(), EXPECT.hex()))

u64 = lambda va: ctypes.c_uint64.from_address(slide + va).value

# B — pre-state
check("B once flag pre-call @0x%x"%ONCE, u64(ONCE) == 0, "0x%x (expect 0)" % u64(ONCE))
check("B singleton pre-call @0x%x"%GLOB, u64(GLOB) == 0, "0x%x (expect 0)" % u64(GLOB))

fn = ctypes.CFUNCTYPE(ctypes.c_void_p)(slide + ACC)

# C — first call
p1 = fn()
check("C call#1 returns non-NULL", bool(p1), "P = 0x%x" % (p1 or 0))

# D — the sentinel encoding. This is the decode claim the port's fast path rests on.
flag = u64(ONCE)
check("D once flag post-call == -1 (NOT 1)", flag == 0xFFFFFFFFFFFFFFFF,
      "0x%x  (a `=== 1n` model would read %s here)" % (flag, "TRUE" if flag == 1 else "FALSE"))

# E — the accessor returns the deref of the global
check("E singleton word == returned P", u64(GLOB) == p1,
      "*0x%x = 0x%x  vs  P = 0x%x" % (GLOB, u64(GLOB), p1 or 0))

# F — idempotence
p2 = fn()
check("F call#2 returns the same pointer", p2 == p1, "P2 = 0x%x" % (p2 or 0))
check("F once flag unchanged after call#2", u64(ONCE) == 0xFFFFFFFFFFFFFFFF, "0x%x" % u64(ONCE))

# G — what the initializer actually BUILT: the two vtable words C2 @0xf5cc writes.
#     A–F are true of any call_once accessor; this is the check that binds the returned object to
#     `operator new(0x58)` @0xf5a1 + OZChannelUint16Info::C2 @0xf5ac, i.e. to the one initializer
#     this port TRANSCRIBES rather than defers. A NULL P is a FAIL, not a skip — silently doing
#     nothing is how the previous revision of this file promised G and never ran it.
if p1:
    vt0 = ctypes.c_uint64.from_address(p1).value
    vt50 = ctypes.c_uint64.from_address(p1 + 0x50).value
    check("G object +0x00 vtable == 0xcfac8+slide", vt0 == slide + VT_INFO,
          "0x%x vs 0x%x" % (vt0, slide + VT_INFO))
    check("G object +0x50 vtable == 0xcfae8+slide", vt50 == slide + VT_PCS,
          "0x%x vs 0x%x" % (vt50, slide + VT_PCS))
    # CONTROL for G: G only means something if a WRONG class's vtable would fail it. The addresses
    # of the sibling OZChannelAspectRatioFootageInfo (0xccaa8 / 0xccac8) are the ones a copied probe
    # would have carried, so print the comparison G would have made against them.
    print("  control  G vs the sibling ARFInfo vtables 0xccaa8/0xccac8: "
          "+0x00 0x%x != 0x%x -> %s, +0x50 0x%x != 0x%x -> %s"
          % (vt0, slide + 0xccaa8, "would FAIL" if vt0 != slide + 0xccaa8 else "would pass",
             vt50, slide + 0xccac8, "would FAIL" if vt50 != slide + 0xccac8 else "would pass"))
else:
    check("G object vtables", False, "not run: call #1 returned NULL")


# NEGATIVE CONTROL: a port that modelled the flag as "non-zero means done" would be
# indistinguishable here, so state what this probe can and cannot separate.
print("\ncontrol: flag transitions 0 -> 0x%x. A `!== 0n` model and a `!== -1n` model agree on"
      "\n         this trace; what the trace REFUTES is the `=== 1` sentinel (measured 0x%x)."
      % (u64(ONCE), u64(ONCE)))

print("\nRESULT: %s (%d checks failed)" % ("PASS" if not fails else "FAIL " + ",".join(fails), len(fails)))
sys.exit(0 if not fails else 1)
