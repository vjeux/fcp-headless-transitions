#!/usr/bin/env python3
"""Faithfulness oracle for HGGPURenderer::GetMaxTileArea() const @Helium 0x15d90
(__ZNK13HGGPURenderer14GetMaxTileAreaEv).

Calls the REAL exported symbol inside a live Final Cut Pro image and compares with the REAL
TypeScript port (imported by the .mts driver through raw-port/node_modules/.bin/tsx), so the
comparison is TypeScript-against-binary and not binary-against-a-Python-restatement.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGGPURenderer_GetMaxTileArea_oracle.py

MUST be x86_64: the port is transcribed from the x86_64 slice, a natively loaded image is arm64, and
an address-based differential on the wrong slice fails silently TOWARD "verified".

What it checks, in order:
  A. IDENTITY — the dlsym'd address is slide+0x15d90 and the 17 mapped opcode bytes are the ones the
     port was transcribed from. Anything else is INCONCLUSIVE, never a pass.
  B. VALUES — 16 int32 page sizes planted at +0x294 of a 0x600-byte 0xEE-poisoned arena, live vs
     port, compared as unsigned 32-bit decimal strings (no numeric coercion on the wire).
  C. PURITY — the arena is byte-identical after every call (the method is `const`; that is checked,
     not assumed).
  D. OFFSET — a negative control that plants DIFFERENT values at +0x290 and +0x298 and requires the
     answer to follow +0x294, so the offset is pinned by measurement and not by reading a
     displacement.
  E. MUTANTS — five misreadings evaluated in the same tsx process; each declares in advance whether
     it must diverge ("kill") or is provably indistinguishable at this interface ("same").

Exit 0 = VERIFIED, 1 = DIVERGED, 2 = INCONCLUSIVE (could not run — never read as a pass).
"""
import ctypes, json, os, platform, subprocess, sys

if platform.machine() != "x86_64":
    print("INCONCLUSIVE: running as %s — re-run under `arch -x86_64 /usr/bin/python3`"
          % platform.machine())
    sys.exit(2)

HERE = os.path.dirname(os.path.abspath(__file__))
DRIVER = os.path.join(HERE, "HGGPURenderer_GetMaxTileArea_driver.mts")
TSX = os.path.abspath(os.path.join(HERE, "..", "..", "node_modules", ".bin", "tsx"))
FCP = "/Applications/Final Cut Pro.app"
FW = FCP + "/Contents/Frameworks/Helium.framework/Versions/A/Helium"
RPATHS = [FCP + "/Contents/Frameworks",
          FCP + "/Contents/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/Contents/PlugIns",
          FCP + "/Contents/Frameworks/ProApps"]

SYM = "_ZNK13HGGPURenderer14GetMaxTileAreaEv"     # dlsym wants it WITHOUT the leading underscore
VA = 0x15D90
ARENA = 0x600
FIELD = 0x294
POISON = 0xEE
# 17 bytes, read out of /tmp/Helium.x86_64 (__TEXT vmaddr 0 == fileoff 0):
#   55                    pushq %rbp
#   48 89 e5              movq  %rsp,%rbp
#   8b 87 94 02 00 00     movl  0x294(%rdi),%eax
#   0f af c0              imull %eax,%eax
#   01 c0                 addl  %eax,%eax
#   5d                    popq  %rbp
#   c3                    retq
EXPECT = bytes.fromhex("554889e58b87940200000fafc001c05dc3")

CASES = [0, 1, 2, 555, 750, 1500, 3000, 5000,
         0x8000,        # 2*2^30 == 2^31 — the sign bit of the RESULT is set
         0x10000,       # 2*2^32 ≡ 0 — a non-zero page size whose tile area is 0
         46340, 46341,  # either side of where 2*x*x crosses 2^31
         0x7FFFFFFF, -1, -46341,
         -0x80000000]   # x*x ≡ 0 (mod 2^32)

# ---------------------------------------------------------------------------------------------
_seen, _loaded = set(), []


def _resolve(dep):
    if dep.startswith("@rpath/"):
        for r in RPATHS:
            p = os.path.join(r, dep[len("@rpath/"):])
            if os.path.exists(p):
                return p
        return None
    if dep.startswith("@"):
        return None
    return dep if os.path.exists(dep) else None


def _load(path, depth=0):
    if path in _seen or depth > 6:
        return
    _seen.add(path)
    out = subprocess.run(["otool", "-L", path], capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        if line.startswith("\t"):
            r = _resolve(line.split()[0])
            if r and r != path:
                _load(r, depth + 1)
    try:
        ctypes.CDLL(path, mode=ctypes.RTLD_GLOBAL)
        _loaded.append(path)
    except OSError:
        pass


_load(FW)
if FW not in _loaded:
    print("INCONCLUSIVE: could not load Helium")
    sys.exit(2)

libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode() == FW:
        slide = libc._dyld_get_image_vmaddr_slide(i)
        break
if slide is None:
    print("INCONCLUSIVE: Helium loaded but absent from the image list")
    sys.exit(2)

helium = ctypes.CDLL(FW, mode=ctypes.RTLD_GLOBAL)
try:
    addr = ctypes.cast(getattr(helium, SYM), ctypes.c_void_p).value
except AttributeError:
    print("INCONCLUSIVE: dlsym(%s) failed" % SYM)
    sys.exit(2)

print("A. IDENTITY")
print("   Helium slide      0x%x  (%d images loaded)" % (slide, len(_loaded)))
print("   dlsym(%s)\n     -> 0x%x, vmaddr 0x%x %s" % (SYM, addr, addr - slide,
                                                      "OK" if addr - slide == VA else "MISMATCH"))
if addr - slide != VA:
    sys.exit(2)
got = ctypes.string_at(addr, len(EXPECT))
print("   opcode bytes      %s %s" % (got.hex(), "OK" if got == EXPECT else "MISMATCH"))
if got != EXPECT:
    print("   expected          %s" % EXPECT.hex())
    sys.exit(2)

fn = ctypes.CFUNCTYPE(ctypes.c_uint32, ctypes.c_void_p)(addr)


def call(page, neighbours=None):
    """plant an int32 at +0x294 (and optionally at +0x290/+0x298), call, return (u32, dirty)"""
    buf = (ctypes.c_ubyte * ARENA)(*([POISON] * ARENA))
    ctypes.memmove(ctypes.addressof(buf) + FIELD,
                   ctypes.byref(ctypes.c_int32(page)), 4)
    if neighbours:
        lo, hi = neighbours
        ctypes.memmove(ctypes.addressof(buf) + FIELD - 4, ctypes.byref(ctypes.c_int32(lo)), 4)
        ctypes.memmove(ctypes.addressof(buf) + FIELD + 4, ctypes.byref(ctypes.c_int32(hi)), 4)
    before = bytes(buf)
    r = fn(ctypes.byref(buf))
    return r & 0xFFFFFFFF, bytes(buf) != before


live, dirty_any = [], False
for x in CASES:
    r, dirty = call(x)
    live.append(str(r))
    dirty_any = dirty_any or dirty

# ---------------------------------------------------------------------------------------------
if not os.path.exists(TSX):
    print("INCONCLUSIVE: tsx not found at %s (run npm install in raw-port/)" % TSX)
    sys.exit(2)
proc = subprocess.run([TSX, DRIVER], input=json.dumps({"cases": [str(x) for x in CASES]}),
                      capture_output=True, text=True)
if proc.returncode != 0 or not proc.stdout.strip():
    print("INCONCLUSIVE: the TypeScript driver did not run\n%s" % proc.stderr[-2000:])
    sys.exit(2)
ts = json.loads(proc.stdout)

print("\n   THE CODE THAT WAS RUN (as loaded from the committed module):")
for line in ts["src"].splitlines():
    print("     " + line)

print("\nB. VALUES — live Helium vs the committed port, %d cases" % len(CASES))
bad = 0
for x, want, got in zip(CASES, live, ts["port"]):
    ok = want == got
    bad += 0 if ok else 1
    print("   page %-12d live %-12s port %-12s %s" % (x, want, got, "" if ok else "<<< DIVERGED"))

print("\nC. PURITY — arena byte-identical after every call: %s" % ("YES" if not dirty_any else "NO"))

print("\nD. OFFSET — neighbours planted with different values, answer must follow +0x294")
off_bad = 0
for page, lo, hi in [(1000, 7, 9), (46341, -1, 0x7FFFFFFF), (0, 5000, 5000)]:
    r, _ = call(page, (lo, hi))
    want = (2 * ((page * page) & 0xFFFFFFFF)) & 0xFFFFFFFF
    ok = r == want
    off_bad += 0 if ok else 1
    print("   +0x290=%-11d +0x294=%-8d +0x298=%-11d -> %-12d %s"
          % (lo, page, hi, r, "OK" if ok else "<<< the answer is NOT from +0x294"))

print("\nE. MUTANTS — evaluated in the same tsx process; each declares its expected verdict")
mut_bad = 0
for name, vals in ts["mutants"].items():
    expect = ts["verdicts"][name]
    diffs = sum(1 for a, b in zip(live, vals) if a != b)
    if expect == "kill":
        ok = diffs > 0
    else:
        ok = diffs == 0
    mut_bad += 0 if ok else 1
    print("   %-17s expect=%-5s diverges on %2d/%d cases  %s"
          % (name, expect, diffs, len(CASES), "OK" if ok else "<<< WRONG VERDICT"))

fails = bad + off_bad + mut_bad + (1 if dirty_any else 0)
print("\n%s" % ("VERIFIED: %d cases bit-exact against live Helium, arena untouched, offset pinned, "
                "every mutant's declared verdict met." % len(CASES) if fails == 0 else
                "DIVERGED: %d check(s) failed" % fails))
sys.exit(0 if fails == 0 else 1)
