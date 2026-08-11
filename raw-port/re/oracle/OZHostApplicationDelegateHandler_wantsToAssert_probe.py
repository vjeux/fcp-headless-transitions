#!/usr/bin/env python3
"""OZHostApplicationDelegateHandler_wantsToAssert_probe.py — live differential probe for
OZHostApplicationDelegateHandler::wantsToAssertThatLoadedSceneHasAnimateFlagDisabled() const
@Ozone 0x5d3f80
(__ZNK32OZHostApplicationDelegateHandler50wantsToAssertThatLoadedSceneHasAnimateFlagDisabledEv,
an EXPORTED `T` symbol — dlsym'd, and cross-checked against slide+0x5d3f80).

LOADING OZONE OUTSIDE THE APP BUNDLE. Ozone resolves its @rpath chain only when its dependencies
are already in the process, so this walks `otool -L` depth-first and CDLLs each dependency by
absolute path first (the recipe in raw-port/army/tools/oracle_ozone_loader_example.py). No DYLD_*
variable can help: /usr/bin/python3 is hardened and dyld strips them, and @rpath is a different
mechanism anyway. Measured here: 44 images, 0 failed.

WHY UNDER ROSETTA. Every citation in the port is an x86_64 offset; the arm64 slice's build of this
function is different code at a different address, so the opcode self-check below is only
meaningful in an x86_64 process.

WHAT IT MEASURES, against the live x86_64 Ozone image:
  A. dlsym lands on slide+0x5d3f80, and the 0x37 bytes there are the ones the port transcribes
  B. the SELECTOR. `__objc_selrefs` @0x9166a8 (= 0x5d3f91 + 0x342717, from the movq's own disp32)
     holds a SEL, and `sel_getName` on it returns the name the port names. This is measured
     because a selector cannot be read off an address.
  C. the JUMP TARGET. The GOT slot @0x826028 (= 0x5d3fb0 + 0x252078) is compared for POINTER
     IDENTITY against `dlsym(objc_msgSend)`. otool annotates that jmpq line as
     `## Objc message: -[%rdi identifiersForShortIdentifiers:]` — a different selector on an
     unrelated method — so the comment column is WRONG here and the port must not be written from
     it. Two things are asserted: the slot IS objc_msgSend, and it is NOT the selref from B.
  D. THE NIL PATH, which is the part of the port that does not raise. `this`+0x00 = nil, over a
     0xCD-poisoned 0x40-byte arena:
       - the function returns 0
       - the arena is byte-identical afterwards (it reads +0x00 and writes nothing)
       - `objc_opt_respondsToSelector(nil, sel)` returns NO on its own, which is WHY it returns 0
  E. CONTROL — a false answer that is not about nil. `this`+0x00 = a real, live `NSObject`
     instance, which does not implement the selector: the function still returns 0. So D is not
     "any pointer gives 0 because the callee crashed or short-circuited on nil"; the
     respondsToSelector guard is what produces the answer, exactly as the port says.
     (The YES path needs a host-application delegate that implements the selector; there is none
     in this process, and the port raises there rather than inventing one.)

Run: arch -x86_64 /usr/bin/python3 -u \
       raw-port/re/oracle/OZHostApplicationDelegateHandler_wantsToAssert_probe.py
     (from the repo root; the probe needs no arguments)
"""
import ctypes, os, platform, subprocess, sys

FCP = "/Applications/Final Cut Pro.app/Contents"
OZONE = FCP + "/Frameworks/Ozone.framework/Versions/A/Ozone"
RPATHS = [FCP + "/Frameworks", FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/PlugIns", FCP + "/Frameworks/ProApps"]

SYM = "_ZNK32OZHostApplicationDelegateHandler50wantsToAssertThatLoadedSceneHasAnimateFlagDisabledEv"
FN = 0x5d3f80
SELREF = 0x9166a8       # 0x5d3f91 + 0x342717
MSGSEND_GOT = 0x826028  # 0x5d3fb0 + 0x252078
SELNAME = b"wantsToAssertThatLoadedSceneHasAnimateFlagDisabled"
EXPECT = bytes.fromhex(
    "554889e5415653488b1f4c8b35172734004889df4c89f6e88ac0100084c074104889df4c89f65b415e5d"
    "ff257820250031c05b415e5dc3")

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


preload(OZONE)
print("preloaded %d images (%d failed)" % (len(loaded), len(failed)))
for f in failed[:5]:
    print("   failed:", f)
oz = ctypes.CDLL(OZONE, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]

slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/Ozone"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        print("Ozone image #%d slide=0x%x" % (i, slide))
        break
if slide is None:
    sys.exit("INCONCLUSIVE: Ozone not in the image list")

fails = []


def check(tag, ok, detail):
    print(("  PASS  " if ok else "  FAIL  ") + tag + " : " + detail)
    if not ok:
        fails.append(tag)


# A — the symbol, the address, the bytes.
addr = ctypes.cast(getattr(oz, SYM), ctypes.c_void_p).value
check("A dlsym address == slide+0x%x" % FN, addr == slide + FN,
      "dlsym 0x%x vs 0x%x" % (addr, slide + FN))
got = ctypes.string_at(slide + FN, len(EXPECT))
check("A opcode self-check (0x%x bytes)" % len(EXPECT), got == EXPECT, "live=%s" % got.hex())

# B — the selector, resolved rather than assumed.
libc.sel_getName.restype = ctypes.c_char_p
libc.sel_getName.argtypes = [ctypes.c_void_p]
sel = ctypes.c_void_p.from_address(slide + SELREF).value
name = libc.sel_getName(sel)
check("B __objc_selrefs 0x%x -> sel_getName" % SELREF, name == SELNAME, "%r" % name)

# C — the indirect jump target, by pointer identity, NOT by otool's comment.
slot = ctypes.c_void_p.from_address(slide + MSGSEND_GOT).value
msgsend = ctypes.cast(getattr(libc, "objc_msgSend"), ctypes.c_void_p).value
check("C GOT 0x%x == dlsym(objc_msgSend)" % MSGSEND_GOT, slot == msgsend,
      "slot 0x%x vs objc_msgSend 0x%x" % (slot, msgsend))
check("C ... and the slot is NOT the selref (otool's comment names a selector here)", slot != sel,
      "slot 0x%x vs sel 0x%x" % (slot, sel))

fn = ctypes.CFUNCTYPE(ctypes.c_uint8, ctypes.c_void_p)(slide + FN)

# D — the nil path: the only path this port does NOT defer.
N = 0x40
arena = ctypes.create_string_buffer(b"\xCD" * N, N)
base = ctypes.addressof(arena)
ctypes.c_uint64.from_address(base).value = 0            # this->payload = nil
poison_after_nil = bytes(arena.raw)
r_nil = fn(base)
check("D nil delegate -> 0 (the port's `return false`)", r_nil == 0, "returned %d" % r_nil)
check("D arena unchanged by the call", bytes(arena.raw) == poison_after_nil,
      "%d of %d bytes differ" % (sum(a != b for a, b in zip(bytes(arena.raw), poison_after_nil)), N))
libc.objc_opt_respondsToSelector.restype = ctypes.c_bool
libc.objc_opt_respondsToSelector.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
check("D objc_opt_respondsToSelector(nil, sel) is NO — the reason for the 0",
      libc.objc_opt_respondsToSelector(None, sel) is False, "runtime answered NO")

# E — CONTROL: a REAL ObjC object that does not implement the selector.
libc.objc_getClass.restype = ctypes.c_void_p
libc.objc_getClass.argtypes = [ctypes.c_char_p]
libc.sel_registerName.restype = ctypes.c_void_p
libc.sel_registerName.argtypes = [ctypes.c_char_p]
msg = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p)(msgsend)
nsobject = libc.objc_getClass(b"NSObject")
inst = msg(nsobject, libc.sel_registerName(b"new"))
check("E built a live NSObject instance", bool(inst), "0x%x" % (inst or 0))
if inst:
    responds = libc.objc_opt_respondsToSelector(ctypes.c_void_p(inst), sel)
    check("E NSObject does NOT implement the selector", responds is False, "runtime answered NO")
    ctypes.c_uint64.from_address(base).value = inst     # this->payload = a real object
    r_obj = fn(base)
    check("E real non-nil delegate that lacks the selector -> 0", r_obj == 0,
          "returned %d — so the 0 in D is the respondsToSelector guard, not a nil artefact" % r_obj)

print("\nNOT MEASURED: the YES path. It needs a host-application delegate that implements the")
print("              selector; no such object exists in this process, and the port raises there")
print("              citing objc_msgSend @0x5d3faa rather than inventing an answer.")
print("\nRESULT: %s (%d checks failed)" % ("PASS" if not fails else "FAIL " + ",".join(fails), len(fails)))
sys.exit(0 if not fails else 1)
