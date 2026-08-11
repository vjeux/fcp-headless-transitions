#!/usr/bin/env python3
"""Differential oracle for HGMetalContext::setCommandBufferLimits(unsigned int,
unsigned long) @Helium 0x1d3534.

MUST run under `arch -x86_64 /usr/bin/python3`: every @0xADDR in the port is an
x86_64 offset, and dlopening the arm64 slice would compare the port against code
it did not transcribe (OPS_LOG, "wrong architecture" — it fails silently toward
VERIFIED).

Body (8 lines @0x1d3530):
    movl %esi, 0x40(%rdi)     ; this->+0x40 (u32) = arg1   — FOUR-byte store
    movq %rdx, 0x48(%rdi)     ; this->+0x48 (u64) = arg2   — EIGHT-byte store
The `movl`/`movq` width difference is exactly what this harness pins: +0x44 must
survive a call untouched, while all eight bytes at +0x48 must change.
"""
import ctypes, platform, random, sys

assert platform.machine() == 'x86_64', f"run under arch -x86_64, got {platform.machine()}"

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium"
OFF32, OFF64, OBJ = 0x40, 0x48, 0x200

lib = ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
fn = getattr(lib, "_ZN14HGMetalContext22setCommandBufferLimitsEjm")
fn.restype = None
fn.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_uint64]

rng = random.Random(20260811)
cases = div = kept_0x44 = 0

u32s = [0, 1, 2, 0x7fffffff, 0x80000000, 0xfffffffe, 0xffffffff]
u64s = [0, 1, 0xffffffff, 0x100000000, 1 << 53, (1 << 53) + 1,
        0x7fffffffffffffff, 0x8000000000000000, 0xffffffffffffffff]

for i in range(1200):
    a = u32s[i % len(u32s)] if i % 2 else rng.getrandbits(32)
    b = u64s[i % len(u64s)] if i % 3 else rng.getrandbits(64)
    obj = (ctypes.c_char * OBJ)()
    ctypes.memset(obj, 0xAA, OBJ)
    fn(ctypes.addressof(obj), a, b)
    cases += 1
    raw = bytes(obj)

    got32 = int.from_bytes(raw[OFF32:OFF32 + 4], "little")
    got64 = int.from_bytes(raw[OFF64:OFF64 + 8], "little")
    if got32 != a:
        div += 1
        if div < 5:
            print(f"DIVERGE +0x40: got {got32:#x} want {a:#x}")
    if got64 != b:
        div += 1
        if div < 5:
            print(f"DIVERGE +0x48: got {got64:#x} want {b:#x}")
    # the +0x40 store is `movl`: the four bytes at +0x44 must still be poison
    if raw[OFF32 + 4:OFF32 + 8] == b"\xaa\xaa\xaa\xaa":
        kept_0x44 += 1
    else:
        div += 1
        print(f"DIVERGE +0x44 changed to {raw[OFF32 + 4:OFF32 + 8].hex()} "
              f"— that would make the first store a movq")
    rest = raw[:OFF32] + raw[OFF64 + 8:]
    if rest != b"\xaa" * len(rest):
        div += 1
        print("DIVERGE the setter wrote outside +0x40..+0x43 and +0x48..+0x4f")

# --- negative controls: WRONG models scored against the live answer -----------
neg = {"stores arg1 as 64 bits (movq, clobbering +0x44)": 0,
       "swaps the two slots (+0x40 <- arg2, +0x48 <- arg1)": 0,
       "truncates arg2 to 32 bits": 0}
NEG_N = 300
for _ in range(NEG_N):
    a = rng.getrandbits(32)
    b = rng.getrandbits(64) | (1 << 63)        # always wider than 32 bits
    obj = (ctypes.c_char * OBJ)()
    ctypes.memset(obj, 0xAA, OBJ)
    fn(ctypes.addressof(obj), a, b)
    raw = bytes(obj)
    if raw[OFF32 + 4:OFF32 + 8] != b"\x00\x00\x00\x00":
        neg["stores arg1 as 64 bits (movq, clobbering +0x44)"] += 1
    if int.from_bytes(raw[OFF32:OFF32 + 4], "little") != (b & 0xffffffff):
        neg["swaps the two slots (+0x40 <- arg2, +0x48 <- arg1)"] += 1
    if int.from_bytes(raw[OFF64:OFF64 + 8], "little") != (b & 0xffffffff):
        neg["truncates arg2 to 32 bits"] += 1

print(f"CASES={cases} DIVERGENCES={div}  (+0x44 preserved in {kept_0x44}/{cases})")
print("negative controls (higher = the wrong port would have been caught):")
for k, v in neg.items():
    print(f"   {v:4d}/{NEG_N}  {k}")
print("ORACLE:", "VERIFIED" if div == 0 else "DIVERGED")
sys.exit(0 if div == 0 else 1)
