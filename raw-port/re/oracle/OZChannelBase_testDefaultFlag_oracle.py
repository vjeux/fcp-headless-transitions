#!/usr/bin/env python3
"""OZChannelBase_testDefaultFlag_oracle.py — live TS-vs-binary differential for
`OZChannelBase::testDefaultFlag(unsigned long long) const` @ProChannel 0x4a540
(__ZNK13OZChannelBase15testDefaultFlagEy — an EXPORTED `T` symbol, so it is reached with dlsym
rather than by slide+offset; the inventory line is
`000000000004a540 T __ZNK13OZChannelBase15testDefaultFlagEy`).

WHY UNDER ROSETTA. Every port in this repo is transcribed from the x86_64 slice while a plain
dlopen on this box maps arm64. This body is a mask-and-test on a struct qword, so the two slices
would agree — but the rule is not conditional, the cost is nothing, and it keeps the probe honest
about which code it measured. The script REFUSES to run natively.

WHY THE TYPESCRIPT IS EXECUTED RATHER THAN RESTATED. There is no Python copy of the port in this
file. The expected values come from running the REAL `raw-port/src/channels/OZChannelBase.ts`
through `OZChannelBase_testDefaultFlag_driver.mts` (tsx). A Python restatement would share any
misreading of the disassembly with the port and agree with it for the wrong reason.

WHAT IT MEASURES, against the live x86_64 ProChannel image:
  A. the dlsym'd address IS slide+0x4a540, and the 13 mapped opcode bytes there are the ones the
     port was transcribed from (55 48 89 e5 48 85 77 40 0f 95 c0 5d c3 — `pushq %rbp`,
     `movq %rsp,%rbp`, `testq %rsi,0x40(%rdi)`, `setne %al`, `popq %rbp`, `retq`)
  B. DIFFERENTIAL: over a 0xCD-poisoned 0x100-byte arena standing in for `this`, the live function
     and the TypeScript port return the same boolean for all 204 corpus cases — all 64 single bits
     set in the word with the matching mask and with its complement (bit 63 included: that pair is
     what fails if the AND is transcribed 32-bit), the disjoint 0xAAAA…/0x5555… pair, the
     0xFFFFFFFDECA4CF86 mask `saveStateAsDefault` @0x4bb80 applies, the all-ones and all-zeros
     corners, and 64 seeded random pairs
  C. the arena is byte-identical after every call — a `const` method that reads one qword writes
     nothing. Poison rather than zeros, so "untouched" is distinguishable from "wrote zeros"
  D. SLOT IDENTITY: every case also loads DECOY values into the neighbouring +0x38 (the live flags
     word) and +0x48 slots, chosen to differ from the +0x40 value under the same mask, so a port
     reading a neighbouring qword cannot pass B by coincidence
  E. NEGATIVE CONTROLS: six deliberately wrong variants of the method, evaluated by the same tsx
     process on the same corpus (inverted, 32-bit AND, OR-instead-of-AND, reads +0x38, constant
     true, constant false). EACH must diverge from the live function somewhere in the corpus —
     otherwise the corpus is too weak for the agreement in B to mean anything, and this script
     FAILS rather than reporting a pass.

WHAT IT CANNOT SHOW: nothing about who calls this, and nothing about the upper bits of %eax — the
ABI leaves them unspecified for a bool return and the caller reads only %al, which is what the
`c_uint8` restype below reads.

Run: arch -x86_64 /usr/bin/python3 -u raw-port/re/oracle/OZChannelBase_testDefaultFlag_oracle.py
     (no arguments; paths are resolved relative to this file, so it runs in any worktree)
"""
import ctypes
import json
import os
import platform
import random
import subprocess
import sys

FCP = "/Applications/Final Cut Pro.app/Contents"
PC = FCP + "/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RPATHS = [FCP + "/Frameworks", FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/PlugIns", FCP + "/Frameworks/ProApps"]

SYM = "_ZNK13OZChannelBase15testDefaultFlagEy"   # dlsym: no leading Mach-O underscore
VA = 0x4a540                                     # inventory address of that symbol
EXPECT = bytes.fromhex("554889e5488577400f95c05dc3")   # 13 bytes: the whole body
U64 = 0xFFFFFFFFFFFFFFFF
SAVE_MASK = 0xFFFFFFFDECA4CF86                   # saveStateAsDefault movabsq @0x4bb80

HERE = os.path.dirname(os.path.abspath(__file__))
DRIVER = os.path.join(HERE, "OZChannelBase_testDefaultFlag_driver.mts")
TSX = os.path.abspath(os.path.join(HERE, "..", "..", "node_modules", ".bin", "tsx"))

if platform.machine() != "x86_64":
    sys.exit("REFUSING: %s — rerun under `arch -x86_64 /usr/bin/python3`" % platform.machine())

# ---------------------------------------------------------------- the corpus
# Each case is (word@+0x40, mask, decoy@+0x38, decoy@+0x48). The decoys are chosen so that a port
# reading the wrong slot answers differently: +0x38 carries the COMPLEMENT of the word under the
# same mask wherever that is possible.
cases = []


def add(w, m):
    w &= U64
    m &= U64
    cases.append((w, m, (~w) & U64, (w ^ 0x0F0F0F0F0F0F0F0F) & U64))


add(0, 0)
add(0, U64)
add(U64, 0)
add(U64, U64)
for b in range(64):
    add(1 << b, 1 << b)          # the bit is present     -> true
    add(1 << b, U64 ^ (1 << b))  # every OTHER bit asked  -> false
add(0xAAAAAAAAAAAAAAAA, 0x5555555555555555)   # disjoint -> false
add(0xAAAAAAAAAAAAAAAA, 0xAAAAAAAAAAAAAAAA)   # identical -> true
add(SAVE_MASK, SAVE_MASK)
add(SAVE_MASK, U64 ^ SAVE_MASK)               # exactly the bits the snapshot clears -> false
add(U64 ^ SAVE_MASK, SAVE_MASK)
add(0x8000000000000000, 0x8000000000000000)   # the sign bit alone
add(0x8000000000000000, 0xFFFFFFFF)           # low dword asked of a high-bit word -> false
add(0x00000000FFFFFFFF, 0xFFFFFFFF00000000)   # halves swapped -> false
rnd = random.Random(0x4A540)
for _ in range(64):
    add(rnd.getrandbits(64), rnd.getrandbits(64))

# ------------------------------------------------------- load the live image


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
lib = ctypes.CDLL(PC, mode=ctypes.RTLD_GLOBAL)

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
        print("ProChannel image #%d slide=0x%x" % (i, slide))
        break
if slide is None:
    sys.exit("INCONCLUSIVE: ProChannel not in the image list")

addr = ctypes.cast(getattr(lib, SYM), ctypes.c_void_p).value
fails = []


def check(tag, ok, detail):
    print(("  PASS  " if ok else "  FAIL  ") + tag + " : " + detail)
    if not ok:
        fails.append(tag)


# A — the address and the bytes.
check("A dlsym address == slide+0x%x" % VA, addr == slide + VA,
      "dlsym 0x%x vs slide+0x%x = 0x%x" % (addr, VA, slide + VA))
got = ctypes.string_at(addr, len(EXPECT))
check("A opcode self-check (%d bytes)" % len(EXPECT), got == EXPECT,
      "live=%s expect=%s" % (got.hex(), EXPECT.hex()))

# The return is a `bool` in %al; the ABI leaves the upper bytes of %eax unspecified, so read one
# byte. The argument is the u64 mask in %rsi, `this` the arena pointer in %rdi.
fn = ctypes.CFUNCTYPE(ctypes.c_uint8, ctypes.c_void_p, ctypes.c_uint64)(addr)

N = 0x100
arena = ctypes.create_string_buffer(b"\xCD" * N, N)
base = ctypes.addressof(arena)


def poisoned():
    return b"\xCD" * N


# ------------------------------------------------- B/C/D: run the live function
live = []
arena_dirty = 0
for (w, m, d38, d48) in cases:
    arena.raw = poisoned()
    ctypes.c_uint64.from_address(base + 0x40).value = w
    ctypes.c_uint64.from_address(base + 0x38).value = d38
    ctypes.c_uint64.from_address(base + 0x48).value = d48
    r = fn(base, m)
    live.append(1 if r else 0)
    check_bytes = bytes(arena.raw)
    expect_bytes = bytearray(poisoned())
    expect_bytes[0x40:0x48] = w.to_bytes(8, "little")
    expect_bytes[0x38:0x40] = d38.to_bytes(8, "little")
    expect_bytes[0x48:0x50] = d48.to_bytes(8, "little")
    if check_bytes != bytes(expect_bytes):
        arena_dirty += 1
    if r not in (0, 1):
        check("B %%al is a clean boolean (w=0x%016x m=0x%016x)" % (w, m), False, "al=0x%02x" % r)

check("C arena byte-identical after all %d calls" % len(cases), arena_dirty == 0,
      "%d call(s) modified the arena" % arena_dirty)

# ------------------------------------------------- run the TypeScript port
if not os.path.exists(TSX):
    sys.exit("INCONCLUSIVE: tsx not found at %s (run npm install in raw-port/)" % TSX)
req = {"cases": [{"w": hex(w), "m": hex(m), "d38": hex(d38), "d48": hex(d48)}
                 for (w, m, d38, d48) in cases]}
proc = subprocess.run([TSX, DRIVER], input=json.dumps(req), capture_output=True, text=True)
if proc.returncode != 0:
    print(proc.stdout[-2000:])
    print(proc.stderr[-2000:])
    sys.exit("INCONCLUSIVE: the TS driver did not run (exit %d)" % proc.returncode)
reply = json.loads(proc.stdout)
ts = reply["port"]
muts = reply["mutants"]

# B — the differential itself.
div = [(i, cases[i], live[i], ts[i]) for i in range(len(cases)) if live[i] != ts[i]]
check("B TS port == live binary on %d cases" % len(cases), not div,
      "%d divergence(s)%s" % (len(div), "" if not div else
                              "; first: case %d w=0x%016x m=0x%016x live=%d ts=%d"
                              % (div[0][0], div[0][1][0], div[0][1][1], div[0][2], div[0][3])))

# D — the corpus must actually exercise both answers, or B is vacuous.
check("D corpus exercises both answers", 0 in live and 1 in live,
      "%d true / %d false" % (sum(live), len(live) - sum(live)))

# E — every negative control must be caught by this corpus.
for name in sorted(muts):
    n = sum(1 for i in range(len(cases)) if muts[name][i] != live[i])
    check("E mutant '%s' DIVERGES from the live function" % name, n > 0,
          "%d of %d cases differ" % (n, len(cases)))

print("\nRESULT: %s (%d checks failed)" % ("PASS" if not fails else "FAIL " + ",".join(fails),
                                           len(fails)))
sys.exit(0 if not fails else 1)
