#!/usr/bin/env python3
"""Faithfulness oracle for OZ3DEngineSceneFileImpl::postReadMedia() @Ozone 0x3c0950
(__ZN23OZ3DEngineSceneFileImpl13postReadMediaEv) — vtable slot 15.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZ3DEngineSceneFileImpl_postReadMedia_oracle.py

The body is `movb $0x1,%al ; retq`, so the ANSWER is trivial and the INSTRUMENT is the whole
problem: a harness that can only ever produce 1 would report PASS on a function that returns
nothing. This one proves it can see other values before it believes this one, using two controls
that go through the IDENTICAL CFUNCTYPE and the identical (empty) argument tuple:

  CONTROL 1 — a same-class sibling whose answer the HARNESS chooses. `getFileState()` @0x3baf10 is
             `movl 0xc0(%rdi),%eax ; retq`, so a value planted at +0xc0 of the arena comes straight
             back. Five different values are demanded and must be returned.
  CONTROL 2 — the REAL OVERRIDE of the same virtual: OZ3DEngineSceneFileImplUSDZ::postReadMedia()
             @0x3c0870, whose nil path returns 0. It messages the ObjC runtime, so it runs in a
             SEPARATE PROCESS (this file re-executed with --usdz-control, again under
             `arch -x86_64`): a crash there costs that control, not the run, and is reported as
             INCONCLUSIVE rather than skipped. A fork() is NOT good enough and was measured to be
             wrong here — the parent has already initialised the ObjC runtime by loading Ozone, so
             the child aborts with `+[NSUnitLength initialize] may have been in progress in another
             thread when fork() was called`.

Plus, for the port itself: 8 arenas (three poison patterns and five planted +0xc0 values), live vs
the committed TypeScript, and a byte-diff of every arena afterwards (the function must write
nothing).

Exit 0 = VERIFIED, 1 = DIVERGED, 2 = INCONCLUSIVE (could not run — never read as a pass).
"""
import ctypes, json, os, platform, struct, subprocess, sys

if platform.machine() != "x86_64":
    print("INCONCLUSIVE: running as %s — re-run under `arch -x86_64 /usr/bin/python3`"
          % platform.machine())
    sys.exit(2)

HERE = os.path.dirname(os.path.abspath(__file__))
DRIVER = os.path.join(HERE, "OZ3DEngineSceneFileImpl_postReadMedia_driver.mts")
TSX = os.path.abspath(os.path.join(HERE, "..", "..", "node_modules", ".bin", "tsx"))
FCP = "/Applications/Final Cut Pro.app"
FW = FCP + "/Contents/Frameworks/Ozone.framework/Versions/A/Ozone"
RPATHS = [FCP + "/Contents/Frameworks",
          FCP + "/Contents/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/Contents/PlugIns",
          FCP + "/Contents/Frameworks/ProApps"]

VA = 0x3C0950            # the subject
VA_GETFILESTATE = 0x3BAF10   # control 1
VA_USDZ = 0x3C0870           # control 2 (the override)
FIELD_STATE = 0xC0
ARENA = 0x200
# The 8 bytes of the function proper: 55 | 48 89 e5 | b0 01 | 5d | c3. Read out of
# /tmp/Ozone.x86_64 (__TEXT vmaddr 0 == fileoff 0), not typed from the listing — the first draft of
# this file guessed the encoding of the `nopl` padding that follows (`0f 1f 44 …` instead of the
# 8-byte `0f 1f 84 00 00 00 00 00`) and the assertion refused the real image, which is the check
# working. The padding is not part of the function and is asserted separately, below.
EXPECT = bytes.fromhex("554889e5b0015dc3")
PADDING = bytes.fromhex("0f1f840000000000")

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
    print("INCONCLUSIVE: could not load Ozone")
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
    print("INCONCLUSIVE: Ozone loaded but absent from the image list")
    sys.exit(2)

print("A. IDENTITY")
print("   Ozone slide 0x%x, %d images loaded" % (slide, len(_loaded)))
got = ctypes.string_at(slide + VA, len(EXPECT))
print("   bytes @0x%x  %s %s" % (VA, got.hex(), "OK" if got == EXPECT else "MISMATCH"))
if got != EXPECT:
    print("   expected     %s" % EXPECT.hex())
    sys.exit(2)
pad = ctypes.string_at(slide + VA + len(EXPECT), len(PADDING))
print("   padding      %s %s (not executed; asserted only so the listing is honest)"
      % (pad.hex(), "OK" if pad == PADDING else "DIFFERS"))

BoolFn = ctypes.CFUNCTYPE(ctypes.c_uint8, ctypes.c_void_p)
IntFn = ctypes.CFUNCTYPE(ctypes.c_uint32, ctypes.c_void_p)
subject = BoolFn(slide + VA)
control1 = IntFn(slide + VA_GETFILESTATE)

if "--usdz-control" in sys.argv:
    # CHILD MODE. Call the real override on a zeroed arena so its ObjC chain takes the nil path,
    # print the answer, and get out. It lives in its own process because the override touches the
    # ObjC runtime and must be allowed to crash without taking the measurement with it.
    _buf = (ctypes.c_ubyte * ARENA)()
    print("USDZ_CONTROL=%d" % BoolFn(slide + VA_USDZ)(ctypes.byref(_buf)))
    sys.exit(0)

# ---------------------------------------------------------------------------------------------
# The corpus: three poison patterns, then five arenas with a planted +0xc0.
CASES = [("poison 0x00", 0x00, None), ("poison 0xcd", 0xCD, None), ("poison 0xff", 0xFF, None),
         ("+0xc0=0", 0xCD, 0), ("+0xc0=1", 0xCD, 1), ("+0xc0=7", 0xCD, 7),
         ("+0xc0=255", 0xCD, 255), ("+0xc0=42", 0xCD, 42)]


def arena(poison, state):
    buf = (ctypes.c_ubyte * ARENA)(*([poison] * ARENA))
    if state is not None:
        ctypes.memmove(ctypes.addressof(buf) + FIELD_STATE, ctypes.byref(ctypes.c_uint32(state)), 4)
    return buf


print("\nB. THE PORT vs LIVE OZONE — %d arenas" % len(CASES))
live, dirty = [], []
for name, poison, state in CASES:
    buf = arena(poison, state)
    before = bytes(buf)
    r = subject(ctypes.byref(buf))
    live.append(r)
    dirty.append(bytes(buf) != before)

print("\nC. CONTROL 1 — getFileState() @0x%x, same class, same CFUNCTYPE, answer planted by the "
      "harness at +0xc0" % VA_GETFILESTATE)
c1_bad = 0
for want in (0, 1, 7, 255, 42):
    buf = arena(0xCD, want)
    got = control1(ctypes.byref(buf))
    ok = got == want
    c1_bad += 0 if ok else 1
    print("   planted %-4d -> live %-4d %s" % (want, got, "OK" if ok else "<<< the instrument is stuck"))

print("\nD. CONTROL 2 — the REAL override of this same virtual, "
      "OZ3DEngineSceneFileImplUSDZ::postReadMedia() @0x%x, in a separate process" % VA_USDZ)
child = subprocess.run(["arch", "-x86_64", "/usr/bin/python3", os.path.abspath(__file__),
                        "--usdz-control"], capture_output=True, text=True, timeout=300)
tag = [l for l in child.stdout.splitlines() if l.startswith("USDZ_CONTROL=")]
if child.returncode != 0 or not tag:
    c2 = None
    print("   INCONCLUSIVE: the child exited %d (the override messages the ObjC runtime; this "
          "control is unavailable, and that is reported, not dropped)\n   %s"
          % (child.returncode, child.stderr.strip().splitlines()[-1:] or ""))
else:
    c2 = int(tag[-1].split("=")[1])
    print("   the override returned %d on a zeroed arena %s"
          % (c2, "— the instrument can see a DIFFERENT answer from this very virtual"
             if c2 != 1 else "<<< same as the subject; this control proves nothing today"))

# ---------------------------------------------------------------------------------------------
if not os.path.exists(TSX):
    print("INCONCLUSIVE: tsx not found at %s" % TSX)
    sys.exit(2)
proc = subprocess.run([TSX, DRIVER], input=json.dumps({"cases": [c[0] for c in CASES]}),
                      capture_output=True, text=True)
if proc.returncode != 0 or not proc.stdout.strip():
    print("INCONCLUSIVE: the TypeScript driver did not run\n%s" % proc.stderr[-2000:])
    sys.exit(2)
ts = json.loads(proc.stdout)

print("\n   THE CODE THAT WAS RUN (as loaded from the committed module):")
for line in ts["src"].splitlines():
    print("     " + line)

bad = 0
print()
for (name, _, _), lv, ported, dt in zip(CASES, live, ts["port"], dirty):
    ok = (lv == 1) == (ported is True) and lv in (0, 1)
    bad += 0 if ok else 1
    print("   %-12s live %d  port %-5s  arena %s  %s"
          % (name, lv, ported, "UNCHANGED" if not dt else "MODIFIED", "" if ok else "<<< DIVERGED"))
dirty_bad = sum(1 for d in dirty if d)

print("\nE. MUTANT")
mut_bad = 0
for mname, vals in ts["mutants"].items():
    diffs = sum(1 for lv, v in zip(live, vals) if (lv == 1) != (v is True))
    ok = diffs == len(CASES)
    mut_bad += 0 if ok else 1
    print("   %-12s diverges on %d/%d %s" % (mname, diffs, len(CASES), "OK" if ok else "<<< NOT KILLED"))

fails = bad + dirty_bad + mut_bad + c1_bad + (0 if c2 == 0 else 1)
print("\n%s" % ("VERIFIED: live Ozone returns 1 on every arena and the port returns true; the arena "
                "is untouched; both controls produced other values (planted 0/1/7/255/42, override "
                "0); the mutant dies on every case." if fails == 0 else
                "DIVERGED/INCONCLUSIVE: %d check(s) failed" % fails))
sys.exit(0 if fails == 0 else 1)
