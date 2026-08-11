#!/usr/bin/env python3
"""HGGPURenderer_GetRenderEvent_oracle.py — live TS-vs-binary differential for
`HGGPURenderer::GetRenderEvent()` @Helium 0x11eb0 (__ZN13HGGPURenderer14GetRenderEventEv — an
EXPORTED `T` symbol, so it is reached with dlsym; the inventory line is
`0000000000011eb0 T __ZN13HGGPURenderer14GetRenderEventEv`).

WHY UNDER ROSETTA. Every @0xADDR in the port is an x86_64 offset while a plain dlopen on this box
maps arm64; an address-based differential run natively fails silently TOWARD verified. This script
REFUSES to run natively.

WHY THE TYPESCRIPT IS EXECUTED RATHER THAN RESTATED. The slot-identity expectations come from
running the REAL `raw-port/src/render/HGGPURenderer.ts` through
`HGGPURenderer_GetRenderEvent_driver.mts`. A Python restatement of a one-load getter is exactly as
wrong as the port if the offset was misread, and it would agree with it.

A ONE-LOAD GETTER IS EASY TO PORT AND EASY TO GET SUBTLY WRONG — wrong offset, wrong width, an
invented null guard — so the corpus is built for those three, in two families:

  A. the dlsym'd address IS slide+0x11eb0 and the 13 mapped opcode bytes are the ones transcribed
     (55 48 89 e5 48 8b 87 30 05 00 00 5d c3: pushq/movq/movq 0x530(%rdi),%rax/popq/retq)
  B. VALUE ROUND-TRIP (live only — a JS reference has no bit pattern to compare, and saying so is
     the honest boundary of this differential): 14 sentinels planted at +0x530 come back
     bit-for-bit, including 0 (nothing substituted for a null pointer), 0xFFFFFFFFFFFFFFFF (no
     sign/width mangling), both halves-only patterns, and the 0xEE poison word itself
  C. SLOT IDENTITY, as the actual DIFFERENTIAL: with a DISTINCT value in each of +0x458, +0x520,
     +0x528, +0x530 and +0x538 — the five slots this class's decoded methods touch around here —
     the live function returns the +0x530 one, and the TypeScript port returns the object from the
     same slot. Both a populated and a NULL render-event case are run, because "returns null
     unchanged" is a property a guard-adding port would break
  D. the arena is byte-identical after every call (0xEE poison, so "untouched" is distinguishable
     from "wrote zeros"), and the getter therefore has no side effect
  E. NEGATIVE CONTROLS: five deliberately wrong variants, evaluated by the same tsx process on the
     same cases (read +0x520, read +0x458, always null, fabricate a fresh event, return something
     derived). EACH must diverge from the live answers, or the corpus is too weak for C to mean
     anything and this script FAILS rather than passing.

Run: arch -x86_64 /usr/bin/python3 -u raw-port/re/oracle/HGGPURenderer_GetRenderEvent_oracle.py
     (no arguments; paths resolve relative to this file, so it runs in any worktree)
"""
import ctypes
import glob
import json
import os
import platform
import random
import subprocess
import sys

FW = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0] + \
     "/Helium.framework/Versions/A/Helium"
SYM = "_ZN13HGGPURenderer14GetRenderEventEv"     # dlsym: no leading Mach-O underscore
VA = 0x11eb0
EXPECT = bytes.fromhex("554889e5488b8730050000" "5dc3")   # 13 bytes: the whole body
OFF = 0x530
OBJ_SIZE = 0x600
POISON = 0xEE
# The five slots this class's decoded methods touch around the one under test.
SLOTS = {0x458: "+0x458", 0x520: "+0x520", 0x528: "+0x528", 0x530: "+0x530", 0x538: "+0x538"}

HERE = os.path.dirname(os.path.abspath(__file__))
DRIVER = os.path.join(HERE, "HGGPURenderer_GetRenderEvent_driver.mts")
TSX = os.path.abspath(os.path.join(HERE, "..", "..", "node_modules", ".bin", "tsx"))

if platform.machine() != "x86_64":
    sys.exit("REFUSING: %s — rerun under `arch -x86_64 /usr/bin/python3`" % platform.machine())


def load_with_rpath(path, seen=None):
    """Depth-first @rpath preload, the recipe OPS_LOG records for the FCP frameworks."""
    seen = seen if seen is not None else set()
    real = os.path.realpath(path)
    if real in seen:
        return None
    seen.add(real)
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if dep.startswith("@rpath/"):
            cand = os.path.join(fwdir, dep[len("@rpath/"):])
            if os.path.exists(cand):
                try:
                    load_with_rpath(cand, seen)
                except OSError:
                    pass
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


lib = load_with_rpath(FW)

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


# A — address and bytes.
check("A dlsym address == slide+0x%x" % VA, addr == slide + VA,
      "dlsym 0x%x vs slide+0x%x = 0x%x" % (addr, VA, slide + VA))
got = ctypes.string_at(addr, len(EXPECT))
check("A opcode self-check (%d bytes)" % len(EXPECT), got == EXPECT,
      "live=%s expect=%s" % (got.hex(), EXPECT.hex()))

fn = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p)(addr)

arena = ctypes.create_string_buffer(bytes([POISON]) * OBJ_SIZE, OBJ_SIZE)
base = ctypes.addressof(arena)
POISONED = bytes([POISON]) * OBJ_SIZE

# B — value round-trip, live only.
rng = random.Random(VA)
SENTINELS = [0, 1, 0xFFFFFFFFFFFFFFFF, 0x7FFFFFFFFFFFFFFF, 0x8000000000000000,
             0x00000000FFFFFFFF, 0xFFFFFFFF00000000, 0xDEADBEEF, 0xDEADBEEFCAFEBABE,
             0xEEEEEEEEEEEEEEEE, 0x530] + [rng.getrandbits(64) for _ in range(3)]
bad = []
dirty = 0
for s in SENTINELS:
    arena.raw = POISONED
    ctypes.c_uint64.from_address(base + OFF).value = s
    r = fn(base)
    if r != s:
        bad.append((s, r))
    expect = bytearray(POISONED)
    expect[OFF:OFF + 8] = s.to_bytes(8, "little")
    if bytes(arena.raw) != bytes(expect):
        dirty += 1
check("B all %d sentinels round-trip bit-for-bit from +0x%x" % (len(SENTINELS), OFF), not bad,
      "%d wrong%s" % (len(bad), "" if not bad else "; first planted 0x%016x got 0x%016x" % bad[0]))
check("D arena byte-identical after all %d calls" % len(SENTINELS), dirty == 0,
      "%d call(s) modified it" % dirty)

# C — slot identity, the differential. One distinct value per slot; a NULL case as well.
CASES = [{"name": "render event present", "renderEventNull": False},
         {"name": "render event NULL (never ran InitMetal)", "renderEventNull": True}]
VALUES = {off: (0x1000 + off) * 0x0001000100010001 for off in SLOTS}


def tag_of(v):
    if v == 0:
        return "null"
    for off, name in SLOTS.items():
        if v == VALUES[off]:
            return name
    if v == 0xEEEEEEEEEEEEEEEE:
        return "poison"
    return "other"


live = []
for c in CASES:
    arena.raw = POISONED
    for off in SLOTS:
        ctypes.c_uint64.from_address(base + off).value = VALUES[off]
    if c["renderEventNull"]:
        ctypes.c_uint64.from_address(base + OFF).value = 0
    r = fn(base)
    live.append(tag_of(r))
    print("  live %-40s -> 0x%016x  (%s)" % (c["name"], r, tag_of(r)))
    expect = bytearray(POISONED)
    for off in SLOTS:
        expect[off:off + 8] = VALUES[off].to_bytes(8, "little")
    if c["renderEventNull"]:
        expect[OFF:OFF + 8] = (0).to_bytes(8, "little")
    check("D arena byte-identical (%s)" % c["name"], bytes(arena.raw) == bytes(expect),
          "%d byte(s) differ" % sum(a != b for a, b in zip(bytes(arena.raw), bytes(expect))))

check("C live returns the +0x530 slot, not a neighbour", live[0] == "+0x530", live[0])
check("C live returns NULL unchanged when +0x530 is 0", live[1] == "null", live[1])

# ------------------------------------------------- run the TypeScript port
if not os.path.exists(TSX):
    sys.exit("INCONCLUSIVE: tsx not found at %s (run npm install in raw-port/)" % TSX)
proc = subprocess.run([TSX, DRIVER], input=json.dumps({"cases": CASES}),
                      capture_output=True, text=True)
if proc.returncode != 0:
    print(proc.stdout[-2000:])
    print(proc.stderr[-2000:])
    sys.exit("INCONCLUSIVE: the TS driver did not run (exit %d)" % proc.returncode)
reply = json.loads(proc.stdout)

for i, c in enumerate(CASES):
    check("C TS answers from the same slot as the live function (%s)" % c["name"],
          reply["port"][i] == live[i], "ts=%s live=%s" % (reply["port"][i], live[i]))

for name in sorted(reply["mutants"]):
    rows = reply["mutants"][name]
    n = sum(1 for i in range(len(CASES)) if rows[i] != live[i])
    check("E mutant '%s' DIVERGES from the live function" % name, n > 0,
          "%d of %d cases differ (%s)" % (n, len(CASES), ",".join(rows)))

print("\nRESULT: %s (%d checks failed)" % ("PASS" if not fails else "FAIL " + ",".join(fails),
                                           len(fails)))
sys.exit(0 if not fails else 1)
