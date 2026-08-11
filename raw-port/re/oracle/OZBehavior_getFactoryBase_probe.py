#!/usr/bin/env python3
"""Call OZBehavior::getFactoryBase() @Ozone 0x10c880 in the LIVE Final Cut Pro Ozone image and
compare it against the TypeScript port's answer.

The symbol is LOCAL (`t` in raw-port/army/inventory/Ozone.syms.txt — the exported OZBehavior
methods are `T`, this one is not), so it is not dlsym-able; it is called by address at
`_dyld_get_image_vmaddr_slide(Ozone) + 0x10c880`, and the nine prologue bytes at that address are
checked against the re-derived disassembly BEFORE the address is trusted, so a wrong slide or a
shifted symbol cannot masquerade as agreement.

Ozone loads outside the app bundle, with its `@rpath` chain preloaded depth-first (OPS_LOG: 44
images, 0 failures). Run under `arch -x86_64 /usr/bin/python3` — every address is transcribed from
the x86_64 slice, and this file refuses to run anywhere else.

WHAT IS MEASURED, rather than read off the listing:
  1. the return is the RECEIVER ITSELF, bit for bit, over five receivers including one whose low
     bits would be lost by any adjustment — so `movq %rdi, %rax` is an identity and not an
     adjust-by-zero that happens to look like one on a round pointer;
  2. the method WRITES NOTHING — a 0x200-byte arena poisoned with 0xCD is byte-compared after;
  3. the controls: the class's OWN adjustor thunk @0x10c960 returns `this - 0x10`, which is what
     an offset of any size would look like here, and `getSceneNode` @0x10a8b0 returns a planted
     field instead of the receiver. Both must be KILLED or this harness cannot tell an identity
     from anything else.
"""
import ctypes, os, platform, subprocess, sys

FCP = "/Applications/Final Cut Pro.app/Contents"
OZ = FCP + "/Frameworks/Ozone.framework/Versions/A/Ozone"
RP = [FCP + "/Frameworks",
      FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
      FCP + "/PlugIns",
      FCP + "/Frameworks/ProApps"]

VA = 0x10c880                                       # __ZN10OZBehavior14getFactoryBaseEv
EXPECT = bytes.fromhex("554889e54889f85dc3")        # push rbp; mov rsp,rbp; mov rdi,rax; pop rbp; ret
THUNK = 0x10c960                                    # __ZThn16_N10OZBehavior14getFactoryBaseEv
GETSCENENODE = 0x10a8b0                             # __ZN10OZBehavior12getSceneNodeEv (reads +0x140)

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


seen, failed = set(), []


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
        failed.append(p)


preload(OZ)
ctypes.CDLL(OZ, mode=ctypes.RTLD_GLOBAL)
print("preloaded %d image(s), %d failed" % (len(seen), len(failed)))

libc = ctypes.CDLL(None)
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]

slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/Ozone"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        break
if slide is None:
    sys.exit("INCONCLUSIVE: Ozone is not in the loaded image list")

got = ctypes.string_at(slide + VA, len(EXPECT))
print("slide=0x%x  addr=0x%x" % (slide, slide + VA))
print("  opcode live   = %s" % got.hex())
print("  opcode expect = %s  -> %s" % (EXPECT.hex(), "OK" if got == EXPECT else "MISMATCH"))
if got != EXPECT:
    sys.exit("FAIL: the bytes at slide+0x%x are not the function this port transcribes" % VA)

fn = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_uint64)(slide + VA)

arena = ctypes.create_string_buffer(b"\xcd" * 0x200, 0x200)
base = ctypes.addressof(arena)
before = ctypes.string_at(base, 0x200)

bad = 0
# the odd/unaligned receivers matter: an adjust-by-N that happens to be 0 for a round pointer, or a
# masking of the low bits, would survive a test that only ever passes 8-byte-aligned addresses.
cases = [("NULL", 0), ("1", 1), ("0xdeadbeef", 0xdeadbeef),
         ("live 0x200 arena", base), ("arena+0x37 (unaligned)", base + 0x37)]
for tag, recv in cases:
    r = fn(recv)
    ok = (r == recv)                       # the TS port returns `self`, unchanged
    bad += 0 if ok else 1
    print("  this=%-24s -> live=0x%-16x ts=0x%-16x %s"
          % (tag, r, recv, "AGREE" if ok else "DIVERGED"))

after = ctypes.string_at(base, 0x200)
wrote = sum(1 for a, b in zip(before, after) if a != b)
print("  receiver arena (0x200 bytes, 0xCD-poisoned): %s"
      % ("unchanged — the method stores nothing" if wrote == 0 else "%d BYTE(S) CHANGED" % wrote))
bad += 0 if wrote == 0 else 1

print("  controls (each must be KILLED, else an identity is indistinguishable from anything else):")
ctl_bad = 0
# plant a recognisable qword at +0x140 so getSceneNode returns something that is NOT the receiver
ctypes.memmove(base + 0x140, ctypes.byref(ctypes.c_uint64(0x1122334455667788)), 8)
for tag, va, must_kill in (
        ("M0 unmutated re-run of 0x%x" % VA, VA, 0),
        ("M1 __ZThn16_ adjustor thunk @0x%x (this - 0x10)" % THUNK, THUNK, 1),
        ("M2 getSceneNode @0x%x (returns *(this+0x140))" % GETSCENENODE, GETSCENENODE, 1)):
    v = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_uint64)(slide + va)(base)
    killed = 1 if v != base else 0
    ok = (killed == must_kill)
    ctl_bad += 0 if ok else 1
    print("   %-52s -> 0x%016x  %s (expected %s)"
          % (tag, v, "KILLED" if killed else "not killed",
             "killed" if must_kill else "not killed"))

print("RESULT:", "PASS" if (bad == 0 and ctl_bad == 0) else "FAIL")
sys.exit(0 if (bad == 0 and ctl_bad == 0) else 1)
