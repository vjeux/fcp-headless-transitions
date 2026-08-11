#!/usr/bin/env python3
"""Live differential for `HGTextureManager::TextureInfo::TextureInfo()` (default ctor)
@Helium 0x46ed0 (__ZN16HGTextureManager11TextureInfoC2Ev, an EXPORTED `T` symbol, so it
is resolved with dlsym — the inventory line is
`0000000000046ed0 T __ZN16HGTextureManager11TextureInfoC2Ev`).

Run: arch -x86_64 /usr/bin/python3 -u \
       raw-port/re/oracle/HGTextureManager_TextureInfo_ctor_default_oracle.py

WHY UNDER ROSETTA: every @0xADDR in the port is an x86_64 offset, and the body is four
`movups` stores whose displacements are the entire content of the port. Running the arm64
slice would measure a different instruction stream.

WHAT IT MEASURES, and why the interesting question is the EXTENT rather than the values:
the body zeroes memory with four overlapping 16-byte stores, the first at +0x2a so that it
ends exactly at 0x3a. "It writes zeros" is trivially true of any zeroing model; what
distinguishes THIS body from a plausible wrong one is that it clears exactly 58 bytes.

  A. the dlsym'd address is slide+0x46ed0 and the mapped opcode bytes are the transcribed
     ones (24 bytes, push .. ret), cross-checked against the on-disk thin slice when it is
     present — an absent slice is reported as skipped, never as agreement
  B. over a 0x80-byte arena pre-filled with a marker, bytes [0x00, 0x3a) are ZERO after the
     call and bytes [0x3a, 0x80) are UNTOUCHED. Three different fills (0xCD, 0xFF, and a
     counting pattern) so that "was already zero" can never be mistaken for "was zeroed"
  C. CONTROLS, each of which must be caught by B: models that zero 0x40, 0x38 or 0x30
     bytes, and one that zeroes nothing. The 0x40 and 0x38 mutants are the realistic
     misreadings — 0x40 is what you get if you round the object up, 0x38 if you drop the
     odd +0x2a store — and they differ from the truth in as little as ONE byte
  D. the SHIPPED TypeScript is executed (via tsx) on a TextureInfo pre-filled with junk;
     every field must read back 0 / 0n, which is this model's spelling of the same 58 bytes
"""
import ctypes, json, os, platform, subprocess, sys

FCP = "/Applications/Final Cut Pro.app/Contents"
HELIUM = FCP + "/Frameworks/Helium.framework/Versions/A/Helium"
RPATHS = [FCP + "/Frameworks", FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/PlugIns", FCP + "/Frameworks/ProApps"]

SYM = "_ZN16HGTextureManager11TextureInfoC2Ev"     # dlsym: no leading underscore
VA = 0x46ED0
SIZEOF = 0x3A                                      # what the four stores cover
ARENA = 0x80
THIN = "/tmp/Helium.x86_64"
#   0x46ed0  55              pushq  %rbp
#   0x46ed1  48 89 e5        movq   %rsp, %rbp
#   0x46ed4  0f 57 c0        xorps  %xmm0, %xmm0
#   0x46ed7  0f 11 47 2a     movups %xmm0, 0x2a(%rdi)
#   0x46edb  0f 11 47 20     movups %xmm0, 0x20(%rdi)
#   0x46edf  0f 11 47 10     movups %xmm0, 0x10(%rdi)
#   0x46ee3  0f 11 07        movups %xmm0, (%rdi)
#   0x46ee6  5d              popq   %rbp
#   0x46ee7  c3              retq
EXPECT = bytes.fromhex("554889e50f57c00f11472a0f1147200f1147100f11075dc3")

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


preload(HELIUM)
print("preloaded %d images (%d failed)" % (len(loaded), len(failed)))
lib = ctypes.CDLL(HELIUM, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/Helium"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        print("Helium image #%d slide=0x%x" % (i, slide))
        break
if slide is None:
    sys.exit("INCONCLUSIVE: Helium not in the image list")

addr = ctypes.cast(getattr(lib, SYM), ctypes.c_void_p).value
fails = []


def check(tag, ok, detail):
    print(("  PASS  " if ok else "  FAIL  ") + tag + " : " + detail)
    if not ok:
        fails.append(tag)


# ---- A. address + opcodes ---------------------------------------------------
check("A dlsym address == slide+0x%x" % VA, addr == slide + VA,
      "dlsym 0x%x vs slide+0x%x = 0x%x" % (addr, VA, slide + VA))
got = ctypes.string_at(addr, len(EXPECT))
check("A opcode self-check (%d bytes)" % len(EXPECT), got == EXPECT,
      "live=%s" % got.hex())
if os.path.exists(THIN):
    with open(THIN, "rb") as fh:
        fh.seek(VA)
        disk = fh.read(len(EXPECT))
    check("A2 mapped bytes == on-disk thin slice", disk == got, "disk=%s" % disk.hex())
else:
    print("  SKIP  A2 on-disk cross-check : %s absent (lipo -thin x86_64 to enable); NOT a pass"
          % THIN)

fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p)(addr)

# ---- B. the EXTENT, over three different fills ------------------------------
FILLS = [("0xCD poison", b"\xCD"),
         ("0xFF", b"\xFF"),
         ("counting pattern", None)]
observed = None
for label, fill in FILLS:
    if fill is None:
        raw = bytes((i * 7 + 3) & 0xFF for i in range(ARENA))
        # make sure no byte inside the object is already zero, or "zeroed" is unfalsifiable
        raw = bytes(b if b else 0xA5 for b in raw)
    else:
        raw = fill * ARENA
    arena = ctypes.create_string_buffer(raw, ARENA)
    fn(ctypes.addressof(arena))
    after = bytes(arena.raw)
    zeroed = [i for i, b in enumerate(after) if b == 0]
    kept = after[SIZEOF:] == raw[SIZEOF:]
    head_zero = all(b == 0 for b in after[:SIZEOF])
    check("B [0x00,0x%x) zeroed, [0x%x,0x%x) untouched — fill %s"
          % (SIZEOF, SIZEOF, ARENA, label), head_zero and kept,
          "first non-zero byte at 0x%x; tail intact=%s"
          % (next((i for i, b in enumerate(after) if b), ARENA), kept))
    if observed is None:
        observed = after

# ---- C. controls ------------------------------------------------------------
# Each mutant is a model of "how many bytes does this ctor clear". They are compared
# against the arena the REAL function produced, so a mutant that matches it is not caught.
print("controls (each MUST differ from what the live ctor produced):")
base_raw = b"\xCD" * ARENA
arena = ctypes.create_string_buffer(base_raw, ARENA)
fn(ctypes.addressof(arena))
truth = bytes(arena.raw)
dead = 0
for name, n in (("zeroes 0x40 bytes (object rounded up)", 0x40),
                ("zeroes 0x38 bytes (the +0x2a store dropped)", 0x38),
                ("zeroes 0x30 bytes", 0x30),
                ("zeroes nothing", 0x00)):
    model = b"\x00" * n + base_raw[n:]
    diff = sum(a != b for a, b in zip(model, truth))
    if diff == 0:
        dead += 1
    print("  %s — %d byte(s) differ from the live result%s"
          % (name, diff, "  <-- DEAD CONTROL" if diff == 0 else ""))
if dead:
    fails.append("dead control")

# ---- D. the shipped TypeScript ---------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
TSX = os.path.abspath(os.path.join(HERE, "..", "..", "node_modules", ".bin", "tsx"))
DRV = os.path.join(HERE, "HGTextureManager_TextureInfo_ctor_default_driver.mts")
if not os.path.exists(TSX):
    print("  SKIP  D TS port : tsx not found at %s ; NOT a pass" % TSX)
    fails.append("D unavailable")
else:
    p = subprocess.run([TSX, DRV], capture_output=True, text=True)
    if p.returncode != 0:
        check("D TS driver ran", False, p.stderr.strip()[-300:])
    else:
        r = json.loads(p.stdout)
        check("D every field of a junk-filled TextureInfo reads back zero",
              r["allZero"], json.dumps(r["fields"]))
        check("D the junk was really there first (the check can fail)",
              r["junkWasNonZero"], "pre-call fields: " + json.dumps(r["before"]))

print("\nRESULT: %s (%d checks failed)" % ("PASS" if not fails else "FAIL " + ",".join(fails),
                                           len(fails)))
sys.exit(0 if not fails else 1)
