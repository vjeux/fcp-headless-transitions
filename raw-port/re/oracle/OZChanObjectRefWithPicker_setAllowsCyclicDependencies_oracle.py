#!/usr/bin/env python3
"""OZChanObjectRefWithPicker_setAllowsCyclicDependencies_oracle.py — live TS-vs-binary differential
for `OZChanObjectRefWithPicker::setAllowsCyclicDependencies(bool)` @Ozone 0x3cc6b0
(__ZN25OZChanObjectRefWithPicker27setAllowsCyclicDependenciesEb — an EXPORTED `T` symbol; the
inventory line is
`00000000003cc6b0 T __ZN25OZChanObjectRefWithPicker27setAllowsCyclicDependenciesEb`).

WHY UNDER ROSETTA. Every @0xADDR in the port is an x86_64 offset while a plain dlopen maps arm64;
an address-based differential run natively fails silently TOWARD verified. This REFUSES to run
natively.

A ONE-STORE SETTER RETURNS NOTHING, so there is no value to compare — and that is exactly the shape
this repo's notes warn about, because "it did the right thing" and "it did nothing" look identical
from the outside. The instrument is a POISONED ARENA DIFFED BYTE FOR BYTE: 0x100 bytes of 0xCD
standing in for the object, the whole buffer compared after every call. That measures the write AND
the absence of every other write, and because the poison is not zero, writing a ZERO is
distinguishable from writing nothing.

WHAT IT MEASURES, against the live x86_64 Ozone image:
  A. the dlsym'd address IS slide+0x3cc6b0, and the 13 mapped opcode bytes there are the ones the
     port was transcribed from (55 48 89 e5 40 88 b7 9b 00 00 00 5d c3 — note the bare REX 0x40,
     which is what makes the byte register %sil rather than %ah)
  B. for each argument, EXACTLY ONE byte of the arena changes, it is the one at +0x9b, and it holds
     the low 8 bits of the argument. 0xFF and 0x02 are passed as well as 0/1 — not because a C++
     `bool` can be those (the SysV ABI says it cannot), but because the answer establishes that the
     machine stores the byte VERBATIM rather than normalising it, which is the fact the port's
     `value ? 1 : 0` transcription rests on
  C. READ-BACK THROUGH THE LIVE GETTER: `OZChanObjectRefWithPicker::getAllowsCyclicDependencies()
     const` @Ozone 0x3cc5a0 (`movzbl 0x9b(%rdi), %eax`) returns what the setter just stored. That
     is what proves the setter writes where the getter reads — a same-offset claim neither function
     can establish alone
  D. DIFFERENTIAL: the REAL TypeScript, driven by
     `OZChanObjectRefWithPicker_setAllowsCyclicDependencies_driver.mts` over the same true/false
     cases, reports the same (offset, value) observation
  E. NEGATIVE CONTROLS: five deliberately wrong variants (write +0x9a, write +0x9c, invert the
     flag, only ever set it, write two bytes) must EACH diverge from the live observations, or the
     cases are too weak for D to mean anything and this script FAILS rather than passing.

Run: arch -x86_64 /usr/bin/python3 -u \
       raw-port/re/oracle/OZChanObjectRefWithPicker_setAllowsCyclicDependencies_oracle.py
"""
import ctypes
import glob
import json
import os
import platform
import subprocess
import sys

FWDIR = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
OZONE = FWDIR + "/Ozone.framework/Versions/A/Ozone"
SET_SYM = "_ZN25OZChanObjectRefWithPicker27setAllowsCyclicDependenciesEb"
GET_SYM = "_ZNK25OZChanObjectRefWithPicker27getAllowsCyclicDependenciesEv"
SET_VA, GET_VA = 0x3cc6b0, 0x3cc5a0
OFF = 0x9b
EXPECT = bytes.fromhex("554889e54088b79b0000005dc3")   # 13 bytes: the whole body
ARENA, POISON = 0x100, 0xCD

HERE = os.path.dirname(os.path.abspath(__file__))
DRIVER = os.path.join(HERE, "OZChanObjectRefWithPicker_setAllowsCyclicDependencies_driver.mts")
TSX = os.path.abspath(os.path.join(HERE, "..", "..", "node_modules", ".bin", "tsx"))

if platform.machine() != "x86_64":
    sys.exit("REFUSING: %s — rerun under `arch -x86_64 /usr/bin/python3`" % platform.machine())


def load_with_rpath(path, seen=None):
    """Depth-first @rpath preload — the recipe OPS_LOG records for the FCP frameworks."""
    seen = seen if seen is not None else set()
    real = os.path.realpath(path)
    if real in seen:
        return None
    seen.add(real)
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if dep.startswith("@rpath/"):
            for root in (FWDIR, FWDIR + "/Flexo.framework/Versions/A/Frameworks",
                         os.path.dirname(FWDIR) + "/PlugIns", FWDIR + "/ProApps"):
                cand = os.path.join(root, dep[len("@rpath/"):])
                if os.path.exists(cand):
                    try:
                        load_with_rpath(cand, seen)
                    except OSError:
                        pass
                    break
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


lib = load_with_rpath(OZONE)

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

set_addr = ctypes.cast(getattr(lib, SET_SYM), ctypes.c_void_p).value
get_addr = ctypes.cast(getattr(lib, GET_SYM), ctypes.c_void_p).value
fails = []


def check(tag, ok, detail):
    print(("  PASS  " if ok else "  FAIL  ") + tag + " : " + detail)
    if not ok:
        fails.append(tag)


# A — address and bytes.
check("A dlsym address == slide+0x%x" % SET_VA, set_addr == slide + SET_VA,
      "dlsym 0x%x vs slide+0x%x = 0x%x" % (set_addr, SET_VA, slide + SET_VA))
got = ctypes.string_at(set_addr, len(EXPECT))
check("A opcode self-check (%d bytes)" % len(EXPECT), got == EXPECT,
      "live=%s expect=%s" % (got.hex(), EXPECT.hex()))
check("A the getter used for read-back is at slide+0x%x" % GET_VA, get_addr == slide + GET_VA,
      "0x%x" % get_addr)

setter = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_uint8)(set_addr)
getter = ctypes.CFUNCTYPE(ctypes.c_uint32, ctypes.c_void_p)(get_addr)

arena = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
base = ctypes.addressof(arena)
POISONED = bytes([POISON]) * ARENA


def call_and_diff(arg):
    """-> (list of '(off, value)' the call changed, the getter's read-back)"""
    arena.raw = POISONED
    setter(base, arg)
    after = bytes(arena.raw)
    changed = [(i, after[i]) for i in range(ARENA) if after[i] != POISON]
    return changed, getter(base)


# B — one byte, the right byte, the right value; and the machine does not normalise.
for arg in (0, 1, 0xFF, 0x02, 0x80):
    changed, back = call_and_diff(arg)
    check("B arg 0x%02x -> exactly one byte written, at +0x%x, = 0x%02x" % (arg, OFF, arg),
          changed == [(OFF, arg)],
          "changed=%s" % ["+0x%x:0x%02x" % (o, v) for o, v in changed])
    # C — the live getter reads the byte the live setter wrote.
    check("C live getter reads back 0x%02x after setting it" % arg, back == arg, "0x%x" % back)

# D — the differential, over the two cases a C++ `bool` can actually be.
CASES = [{"value": False}, {"value": True}]
live = []
for c in CASES:
    changed, _ = call_and_diff(1 if c["value"] else 0)
    live.append({"changed": ["+0x%x:%d" % (o, v) for o, v in changed]})
    print("  live setAllowsCyclicDependencies(%-5s) -> %s" % (c["value"], live[-1]["changed"]))

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
    ts = reply["port"][i]["changed"]
    check("D TS writes what the live function writes (value=%s)" % c["value"], ts == live[i]["changed"],
          "ts=%s live=%s" % (ts, live[i]["changed"]))

# E — the negative controls.
for name in sorted(reply["mutants"]):
    rows = reply["mutants"][name]
    n = sum(1 for i in range(len(CASES)) if rows[i]["changed"] != live[i]["changed"])
    check("E mutant '%s' DIVERGES from the live function" % name, n > 0,
          "%d of %d cases differ (%s)" % (n, len(CASES), [r["changed"] for r in rows]))

print("\nRESULT: %s (%d checks failed)" % ("PASS" if not fails else "FAIL " + ",".join(fails),
                                           len(fails)))
sys.exit(0 if not fails else 1)
