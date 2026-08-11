#!/usr/bin/env python3
"""HGEquirectReorient::SetTexW(float) @Helium 0x46e0 — live differential against Final Cut Pro.

The body is nothing but ARGUMENT MARSHALLING ending in a tail-jump through the vtable of the
sub-object at `this+0x198`:

    0x46e4  movq 0x198(%rdi), %rdi     ; receiver = the node's uniform sink
    0x46eb  movq (%rdi), %rax          ; its vtable
    0x46ee  movq 0x60(%rax), %rax      ; slot +0x60
    0x46f2  xorps %xmm1..%xmm3         ; y = z = w = +0.0f
    0x46fb  xorl  %esi, %esi           ; index = 0
    0x46fe  jmpq  *%rax                ; tail-call; xmm0 (the argument) is passed THROUGH

So there is nothing to compute and nothing to compare a return value against — but the marshalling
IS the method, and it is measurable: give the live code a FAKE vtable whose +0x60 slot is a ctypes
callback and it reports exactly what it passed. What that proves, and a reading cannot:

  * the receiver is `*(this+0x198)`, not `this`;
  * the index really is 0 (it is 1 for the SetTexH sibling next door, which is the same body);
  * y/z/w are +0.0f, not just "zero-ish";
  * the float argument is passed through BIT-EXACTLY — NaN payloads, -0.0 and denormals included,
    which is the one thing a value-equality check would hide;
  * slot +0x60 is the slot: the neighbours at +0x58 and +0x68 hold a different callback that would
    flag itself, and it never fires;
  * the method writes NOTHING: a 0xCD-poisoned receiver arena is byte-identical afterwards.

Run under `arch -x86_64 /usr/bin/python3` — every address here is from the x86_64 slice, and the
natively-loaded image would be arm64 (the slice trap).
"""
import ctypes, os, platform, struct, subprocess, sys

FCP = "/Applications/Final Cut Pro.app/Contents"
HELIUM = FCP + "/Frameworks/Helium.framework/Versions/A/Helium"
RP = [FCP + "/Frameworks",
      FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
      FCP + "/PlugIns",
      FCP + "/Frameworks/ProApps"]
VA = 0x46e0
# hand-derived from the disassembly, asserted against BOTH the mapped image and the on-disk slice
WANT = bytes.fromhex("554889e5488bbf98010000488b07488b40600f57c90f57d20f57db31f65dffe0")
SLOT = 0x60
VT_TARGET = 0x364f50          # dyld_info -fixups: __DATA_CONST __const 0x00A02BF0 rebase 0x00364F50

if platform.machine() != "x86_64":
    sys.exit("INCONCLUSIVE: running as %s — re-run under `arch -x86_64 /usr/bin/python3`"
             % platform.machine())


def deps(p):
    out = subprocess.run(["otool", "-L", p], capture_output=True, text=True).stdout
    return [l.split()[0] for l in out.splitlines()[1:] if l.strip()]


def res(n):
    if n.startswith("@rpath/"):
        for r in RP:
            q = os.path.join(r, n[7:])
            if os.path.exists(q):
                return q
        return None
    return n if os.path.exists(n) else None


seen = set()


def pre(p, d=0):
    if p in seen or d > 6:
        return
    seen.add(p)
    for x in deps(p):
        r = res(x)
        if r and r != p:
            pre(r, d + 1)
    try:
        ctypes.CDLL(p, mode=ctypes.RTLD_GLOBAL)
    except OSError:
        pass


pre(HELIUM)
ctypes.CDLL(HELIUM, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/Helium"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        break
if slide is None:
    sys.exit("INCONCLUSIVE: Helium is not loaded")

got = ctypes.string_at(slide + VA, len(WANT))
disk = open("/tmp/Helium.x86_64", "rb").read()[VA:VA + len(WANT)]
print("slide=0x%x" % slide)
print("  opcode mapped = %s" % got.hex())
print("  opcode ondisk = %s" % disk.hex())
print("  opcode expect = %s -> %s" % (WANT.hex(), "OK" if got == WANT == disk else "MISMATCH"))
if not (got == WANT == disk):
    sys.exit("FAIL: the bytes at slide+0x%x are not the ones transcribed" % VA)

# The symbol is exported, so dlsym must agree with slide+VA (the inventory says `T`).
libc.dlsym.restype = ctypes.c_void_p
libc.dlsym.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
sym = libc.dlsym(ctypes.c_void_p(-2), b"_ZN18HGEquirectReorient7SetTexWEf")
print("  dlsym  = %s   slide+VA = 0x%x   -> %s"
      % (hex(sym) if sym else "None", slide + VA,
         "MATCH" if sym == slide + VA else "DIFFER"))
if sym != slide + VA:
    sys.exit("FAIL: dlsym disagrees with the inventory address")

CAPT = {}
WRONG = {}
CB = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_int,
                      ctypes.c_float, ctypes.c_float, ctypes.c_float, ctypes.c_float)


def hook(this_, idx, x, y, z, w):
    CAPT.update(this_=this_, idx=idx, x=x, y=y, z=z, w=w)


def wrong_slot(this_, idx, x, y, z, w):
    WRONG["hit"] = True


cb, cbw = CB(hook), CB(wrong_slot)
cba, cbwa = ctypes.cast(cb, ctypes.c_void_p).value, ctypes.cast(cbw, ctypes.c_void_p).value

# fake vtable: the slot under test, and its two neighbours wired to a callback that flags itself
vt = ctypes.create_string_buffer(b"\x00" * 0x200, 0x200)
vta = ctypes.addressof(vt)
for off in range(0, 0x200, 8):
    ctypes.c_uint64.from_address(vta + off).value = cbwa
ctypes.c_uint64.from_address(vta + SLOT).value = cba

# the sub-object at this+0x198 (its +0x00 is the vtable pointer), and the node itself
sink = ctypes.create_string_buffer(b"\xAA" * 0x40, 0x40)
sinka = ctypes.addressof(sink)
ctypes.c_uint64.from_address(sinka).value = vta

POISON = b"\xCD" * 0x200
node = ctypes.create_string_buffer(POISON, 0x200)
nodea = ctypes.addressof(node)
ctypes.c_uint64.from_address(nodea + 0x198).value = sinka
before = ctypes.string_at(nodea, 0x200)

CASES = [0.0, -0.0, 1.0, -1.0, 0.5, 1920.0, 4096.75, 1e-45, 3.4028234663852886e38,
         float("inf"), float("-inf"), float("nan")]


def bits(f):
    return struct.unpack("<I", struct.pack("<f", f))[0]


def install(slot):
    """Point `slot` at the recording callback and EVERY other slot at the flag callback."""
    for off in range(0, 0x200, 8):
        ctypes.c_uint64.from_address(vta + off).value = cbwa
    ctypes.c_uint64.from_address(vta + slot).value = cba


def sweep(addr, slot=SLOT, verbose=False):
    """Call the body at `addr` over the corpus; return the number of cases that DISAGREE with the
    transcription (receiver = *(this+0x198), index 0, x passed through bit-exactly, y=z=w=+0.0f,
    no other vtable slot called)."""
    install(slot)
    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_float)(addr)
    bad = 0
    for v in CASES:
        CAPT.clear()
        WRONG.clear()
        fn(nodea, ctypes.c_float(v))
        vb = bits(ctypes.c_float(v).value)
        ok = (CAPT.get("this_") == sinka
              and CAPT.get("idx") == 0
              and bits(CAPT.get("x", 1.0)) == vb
              and bits(CAPT.get("y", 1.0)) == 0 and bits(CAPT.get("z", 1.0)) == 0
              and bits(CAPT.get("w", 1.0)) == 0
              and not WRONG)
        bad += 0 if ok else 1
        if verbose:
            print("   x=%-24r -> recv=%s idx=%s x=0x%08x y=0x%08x z=0x%08x w=0x%08x %s%s"
                  % (v,
                     "*(this+0x198)" if CAPT.get("this_") == sinka else hex(CAPT.get("this_") or 0),
                     CAPT.get("idx"), bits(CAPT.get("x", 1.0)), bits(CAPT.get("y", 1.0)),
                     bits(CAPT.get("z", 1.0)), bits(CAPT.get("w", 1.0)),
                     "PASS" if ok else "FAIL",
                     "  <- ANOTHER SLOT WAS CALLED" if WRONG else ""))
    return bad


print("  vtable slot +0x%02x -> the recording callback; every other slot -> a flag callback" % SLOT)
bad = sweep(slide + VA, verbose=True)

after = ctypes.string_at(nodea, 0x200)
touched = [i for i in range(0x200) if before[i] != after[i]]
print("  receiver arena (0x200 bytes, 0xCD-poisoned): %s"
      % ("unchanged — the method stores nothing" if not touched
         else "CHANGED at %s" % [hex(i) for i in touched]))
if touched:
    bad += 1

# ── CONTROLS. A harness that cannot fail proves nothing, so each of these is a claim in the port
# that something else would have satisfied too, checked by making it false on the live binary.
print("  controls (%d cases each):" % len(CASES))
m0 = sweep(slide + VA)
m1 = sweep(slide + 0x4700)      # SetTexH: the SAME body with `movl $0x1,%esi` — index is the
                                # only difference, so this kills the "index 0" claim specifically
m2 = sweep(slide + VA, slot=0x58)   # the neighbouring slot: kills "slot +0x60 is the slot"
m3 = sweep(slide + 0x4730)      # SetCol0(float,float,float): index 2, three real floats — kills
                                # "y = z = +0.0f" as well as the index
print("   M0 unmutated re-run ....................... %2d killed  (expected 0)" % m0)
print("   M1 call SetTexH @0x4700 (esi=1) ........... %2d killed" % m1)
print("   M2 record the neighbouring slot +0x58 ..... %2d killed" % m2)
print("   M3 call SetCol0 @0x4730 (esi=2, y,z real) . %2d killed" % m3)
if m0 != 0 or min(m1, m2, m3) != len(CASES):
    print("   CONTROL FAILURE: the harness does not discriminate what this port claims")
    bad += 1

# what the REAL vtable slot holds, for the record: the frontier this port defers to
print("  real vtable installed by the ctor @0x3f5e = 0x%x; its +0x%02x = 0x%x "
      "(__ZN19HgcEquirectReorient12SetParameterEiffff)" % (0xa02b90, SLOT, VT_TARGET))

print("RESULT:", "PASS" if bad == 0 else "FAIL")
sys.exit(0 if bad == 0 else 1)
