#!/usr/bin/env python3
"""Call OZChannelPosition3D_Factory::revision() @ProChannel 0x935c in the LIVE Final Cut Pro
ProChannel image and compare it against the TypeScript port's answer.

The symbol is LOCAL (`t` in raw-port/army/inventory/ProChannel.syms.txt), so it is not dlsym-able;
it is called by address at `_dyld_get_image_vmaddr_slide(ProChannel) + 0x935c`, and the eight
prologue bytes at that address are checked against the re-derived disassembly BEFORE the address is
trusted, so a wrong slide or a shifted symbol cannot masquerade as agreement.

Run under `arch -x86_64 /usr/bin/python3` — every address in the port is transcribed from the
x86_64 slice, and this file refuses to run anywhere else.

Three things are measured, not read off the listing:
  1. the returned value, over four receivers including a live poisoned arena;
  2. that the method WRITES NOTHING — a 0x200-byte `this` arena poisoned with 0xCD is compared
     byte for byte afterwards;
  3. that the whole 64-bit %rax is 0, i.e. `xorl %eax, %eax` leaves no garbage in the upper half.

Mutation controls (M1..M3) point the same harness at neighbouring methods of the SAME class whose
returns differ; each must be KILLED, which is what makes the M0 agreement worth anything.
"""
import ctypes, os, platform, subprocess, sys

FCP = "/Applications/Final Cut Pro.app/Contents"
PC = FCP + "/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RP = [FCP + "/Frameworks",
      FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
      FCP + "/PlugIns",
      FCP + "/Frameworks/ProApps"]

VA = 0x935c                                          # __ZN27OZChannelPosition3D_Factory8revisionEv
EXPECT = bytes.fromhex("554889e531c05dc3")          # push rbp; mov rsp,rbp; xor eax,eax; pop rbp; ret
TS_ANSWER = 0                                       # what raw-port/src/channels/...ts returns

if platform.machine() != "x86_64":
    sys.exit("INCONCLUSIVE: running as %s; re-run under arch -x86_64" % platform.machine())


def deps(p):
    out = subprocess.run(["otool", "-L", p], capture_output=True, text=True).stdout
    return [l.split()[0] for l in out.splitlines()[1:] if l.strip()]


def resolve(n):
    if n.startswith("@rpath/"):
        for r in RP:
            q = os.path.join(r, n[7:])
            if os.path.exists(q):
                return q
        return None
    return n if os.path.exists(n) else None


seen = set()


def preload(p, d=0):
    if p in seen or d > 6:
        return
    seen.add(p)
    for x in deps(p):
        r = resolve(x)
        if r and r != p:
            preload(r, d + 1)
    try:
        ctypes.CDLL(p, mode=ctypes.RTLD_GLOBAL)
    except OSError:
        pass


preload(PC)
ctypes.CDLL(PC, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]

slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/ProChannel"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        break
if slide is None:
    sys.exit("INCONCLUSIVE: ProChannel is not in the loaded image list")

got = ctypes.string_at(slide + VA, len(EXPECT))
print("slide=0x%x  addr=0x%x" % (slide, slide + VA))
print("  opcode live   = %s" % got.hex())
print("  opcode expect = %s  -> %s" % (EXPECT.hex(), "OK" if got == EXPECT else "MISMATCH"))
if got != EXPECT:
    sys.exit("FAIL: the bytes at slide+0x%x are not the function this port transcribes" % VA)

fn = ctypes.CFUNCTYPE(ctypes.c_uint32, ctypes.c_void_p)(slide + VA)
fn_u64 = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p)(slide + VA)

bad = 0
arena = ctypes.create_string_buffer(b"\xcd" * 0x200, 0x200)
before = ctypes.string_at(ctypes.addressof(arena), 0x200)

cases = [("NULL", 0),
         ("1 (unmapped)", 1),
         ("0xdeadbeef", 0xdeadbeef),
         ("0xCD-poisoned 0x200 arena", ctypes.addressof(arena))]
for tag, recv in cases:
    r = fn(recv)
    ok = (r == TS_ANSWER)
    bad += 0 if ok else 1
    print("  this=%-26s -> live=%d  ts=%d  %s" % (tag, r, TS_ANSWER, "AGREE" if ok else "DIVERGED"))

after = ctypes.string_at(ctypes.addressof(arena), 0x200)
wrote = sum(1 for a, b in zip(before, after) if a != b)
print("  receiver arena (0x200 bytes, 0xCD-poisoned): %s"
      % ("unchanged — the method stores nothing" if wrote == 0 else "%d BYTE(S) CHANGED" % wrote))
bad += 0 if wrote == 0 else 1

full = fn_u64(0)
print("  full %%rax after the 32-bit xorl = 0x%x  %s" % (full, "OK" if full == 0 else "UPPER HALF DIRTY"))
bad += 0 if full == 0 else 1

# ---- mutation controls: same harness, neighbouring methods of the SAME class -------------------
print("  controls (each must be KILLED, else this harness cannot tell anything apart):")
controls = [
    ("M0 unmutated re-run of 0x%x" % VA, VA, 0),
    ("M1 version @0x9350 (returns 1)", 0x9350, 1),
    ("M2 getCategoryName @0x9364 (PCString() into *%rdi)", 0x9364, 1),
    ("M3 manufacturer @0x9330 (PCString(CFString) into *%rdi)", 0x9330, 1),
]
ctl_bad = 0
for tag, va, must_kill in controls:
    # every control gets its OWN poisoned arena, so M3's write cannot contaminate M0..M2
    a = ctypes.create_string_buffer(b"\xcd" * 0x200, 0x200)
    b0 = ctypes.string_at(ctypes.addressof(a), 0x200)
    v = ctypes.CFUNCTYPE(ctypes.c_uint32, ctypes.c_void_p)(slide + va)(ctypes.addressof(a))
    b1 = ctypes.string_at(ctypes.addressof(a), 0x200)
    touched = sum(1 for x, y in zip(b0, b1) if x != y)
    killed = 1 if (v != TS_ANSWER or touched != 0) else 0
    ok = (killed == must_kill)
    ctl_bad += 0 if ok else 1
    print("   %-56s -> 0x%08x, %2d arena byte(s) written  %s (expected %s)"
          % (tag, v, touched, "KILLED" if killed else "not killed",
             "killed" if must_kill else "not killed"))
# M3 is also the control for claim (2): if it writes and the diff sees it, "unchanged" has teeth.

print("RESULT:", "PASS" if (bad == 0 and ctl_bad == 0) else "FAIL")
sys.exit(0 if (bad == 0 and ctl_bad == 0) else 1)
