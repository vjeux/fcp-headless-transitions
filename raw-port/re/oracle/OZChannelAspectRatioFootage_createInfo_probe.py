#!/usr/bin/env python3
"""w3_probe_arf_info.py — live differential probe for
OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageInfo() @ProChannel 0x6698
(__ZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEv, a LOCAL `t` symbol,
so it is called BY ADDRESS at slide + 0x6698, not by dlsym).

What it measures, against the live x86_64 ProChannel image (the SAME slice the port is
transcribed from):
  A. the opcode bytes at slide+0x6698 are the ones the port was transcribed from (self-check)
  B. before any call: once-flag word @0xeb7b0 == 0 and the singleton @0xec2b8 == NULL
  C. call #1 returns a non-NULL pointer P
  D. after call #1: the once flag reads exactly -1 (0xFFFFFFFFFFFFFFFF), NOT 1 — this is the
     decode fact the port's `!== -1n` fast path rests on, and the one a `=== 1` model gets wrong
  E. the singleton word @0xec2b8 == P (the accessor returns the DEREF of that global)
  F. call #2 returns the SAME P and allocates nothing new (idempotence of the call_once path)
  G. the allocation is 0x58 bytes with the OZChannelAspectRatioFootageInfo vtable installed at
     +0x00 (0xccaa8 + slide) and the PCSingleton sub-object vtable at +0x50 (0xccac8 + slide) —
     i.e. the initializer really ran `operator new(0x58)` + C2 @0x6780

Run: arch -x86_64 /usr/bin/python3 -u /tmp/w3_probe_arf_info.py
"""
import ctypes, ctypes.util, os, platform, subprocess, sys

FCP = "/Applications/Final Cut Pro.app/Contents"
PC = FCP + "/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RPATHS = [FCP + "/Frameworks", FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/PlugIns", FCP + "/Frameworks/ProApps"]

ACC = 0x6698          # the accessor under test
ONCE = 0xeb7b0        # once-flag BSS (derived from the bytes: 0x66a7 + 0xe5109)
GLOB = 0xec2b8        # singleton pointer BSS (0x66d9 + 0xe5bdf)
VT_INFO = 0xccaa8     # vtable installed ptr written by the C2 @0x67ce
VT_PCS = 0xccac8      # PCSingleton sub-object vtable, written @0x67d8
# first 16 bytes of the accessor, read out of /tmp/ProChannel.x86_64
EXPECT = bytes.fromhex("554889e54883ec20488b0509510e004883f8ff")

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
check("A opcode self-check @0x6698", got == EXPECT,
      "live=%s expect=%s" % (got.hex(), EXPECT.hex()))

u64 = lambda va: ctypes.c_uint64.from_address(slide + va).value

# B — pre-state
check("B once flag pre-call @0xeb7b0", u64(ONCE) == 0, "0x%x (expect 0)" % u64(ONCE))
check("B singleton pre-call @0xec2b8", u64(GLOB) == 0, "0x%x (expect 0)" % u64(GLOB))

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
      "*0xec2b8 = 0x%x  vs  P = 0x%x" % (u64(GLOB), p1 or 0))

# F — idempotence
p2 = fn()
check("F call#2 returns the same pointer", p2 == p1, "P2 = 0x%x" % (p2 or 0))
check("F once flag unchanged after call#2", u64(ONCE) == 0xFFFFFFFFFFFFFFFF, "0x%x" % u64(ONCE))

# G — what the initializer actually built (operator new(0x58) + C2 @0x6780)
if p1:
    vt0 = ctypes.c_uint64.from_address(p1).value
    vt50 = ctypes.c_uint64.from_address(p1 + 0x50).value
    check("G object +0x00 vtable == 0xccaa8+slide", vt0 == slide + VT_INFO,
          "0x%x vs 0x%x" % (vt0, slide + VT_INFO))
    check("G object +0x50 vtable == 0xccac8+slide", vt50 == slide + VT_PCS,
          "0x%x vs 0x%x" % (vt50, slide + VT_PCS))

# NEGATIVE CONTROL: a port that modelled the flag as "non-zero means done" would be
# indistinguishable here, so state what this probe can and cannot separate.
print("\ncontrol: flag transitions 0 -> 0x%x. A `!== 0n` model and a `!== -1n` model agree on"
      "\n         this trace; what the trace REFUTES is the `=== 1` sentinel (measured 0x%x)."
      % (u64(ONCE), u64(ONCE)))

print("\nRESULT: %s (%d checks failed)" % ("PASS" if not fails else "FAIL " + ",".join(fails), len(fails)))
sys.exit(0 if not fails else 1)
