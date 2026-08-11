#!/usr/bin/env python3
"""Differential oracle for HGBufferDumper::setPath(char const*) @Helium 0x1c79f0.

MUST run under `arch -x86_64 /usr/bin/python3`: the port cites x86_64 offsets AND
this harness decodes a libc++ `std::string` in memory, whose layout DIFFERS
between the two slices (x86_64: is_long = bit 0 of byte +0x00, short size =
byte0 >> 1, long data at +0x10; arm64: sign bit of byte +0x17, data at +0x00).
Reading an x86_64-layout string with arm64 rules reports every string as EMPTY —
a silent false VERIFIED (OPS_LOG, "wrong architecture").

What the body does (13 lines @0x1c79f0):
    rbx = this
    std::string::assign(this /*the string is at +0x00*/, cstr)   @0x1c79f9
    movl $0xffffffff, 0x48(%rbx)                                 @0x1c79fe
Note the store is `movl` (4 bytes). The ctor @0x1c7913, reset @0x1c7b33 and
setLevel @0x1c7a55 all use `movq %rax, 0x48(...)` with rax = 0xffffffff, which
also clears +0x4c. setPath does NOT. The harness poisons +0x4c to prove it.
"""
import ctypes, platform, random, sys

assert platform.machine() == 'x86_64', f"run under arch -x86_64, got {platform.machine()}"

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium"
SETPATH_VMADDR = 0x1c79f0
STRING_OFF = 0x00          # std::string subobject — assign() gets `this` unchanged
COUNTER_OFF = 0x48         # movl $0xffffffff, 0x48(%rbx)
OBJ_SIZE = 0x100

lib = ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
setPath = getattr(lib, "_ZN14HGBufferDumper7setPathEPKc")
setPath.restype = None
setPath.argtypes = [ctypes.c_void_p, ctypes.c_char_p]


def read_libcxx_string(buf, off):
    """Decode a libc++ std::string at buf+off using the X86_64 layout."""
    raw = bytes(buf)[off:off + 24]
    if raw[0] & 1:                                     # is_long = bit 0 of byte 0
        size = int.from_bytes(raw[8:16], "little")
        data = int.from_bytes(raw[16:24], "little")    # long data pointer at +0x10
        return ctypes.string_at(data, size)
    return raw[1:1 + (raw[0] >> 1)]                    # short: size = byte0 >> 1


rng = random.Random(20260811)
cases = div = 0
kept_c4c = 0

strings = [b"", b"/tmp", b"a" * 22, b"a" * 23, b"a" * 24, b"a" * 200,
           b"/Users/vjeux/dump/frame", b"relative/path.tif", b"  spaced  ",
           bytes(rng.randrange(1, 128) for _ in range(37))]

for i in range(900):
    s = strings[i % len(strings)] if i % 2 else bytes(
        rng.randrange(1, 128) for _ in range(rng.randrange(0, 60)))
    obj = (ctypes.c_char * OBJ_SIZE)()
    ctypes.memset(obj, 0xAA, OBJ_SIZE)          # poison everything...
    ctypes.memset(obj, 0, 24)                   # ...but a VALID empty std::string at +0x00
    setPath(ctypes.addressof(obj), s)
    cases += 1

    # (1) the string subobject now holds the argument  (the TS port: this.path = s)
    got = read_libcxx_string(obj, STRING_OFF)
    if got != s:
        div += 1
        if div < 5:
            print(f"DIVERGE string: got {got!r} want {s!r}")
    # (2) the i32 at +0x48 is -1
    counter = int.from_bytes(bytes(obj)[COUNTER_OFF:COUNTER_OFF + 4], "little")
    if counter != 0xffffffff:
        div += 1
        print(f"DIVERGE counter: {counter:#x}")
    # (3) the store is `movl`, so +0x4c must STILL be poison (a `movq` would zero it)
    tail = bytes(obj)[COUNTER_OFF + 4:COUNTER_OFF + 8]
    if tail == b"\xaa\xaa\xaa\xaa":
        kept_c4c += 1
    else:
        div += 1
        print(f"DIVERGE +0x4c was modified: {tail.hex()} — that would be a movq store")
    # (4) nothing else in the object changed
    rest = bytes(obj)[24:COUNTER_OFF] + bytes(obj)[COUNTER_OFF + 8:]
    if rest != b"\xaa" * len(rest):
        div += 1
        print("DIVERGE the setter wrote outside the string and +0x48")

# --- negative controls: WRONG models scored against the live answer -----------
neg = {"writes the counter as a 64-bit 0xffffffff (movq, like the ctor/reset)": 0,
       "leaves the counter alone": 0,
       "assigns to a string at +0x18 instead of +0x00": 0}
NEG_N = 200
for i in range(NEG_N):
    s = b"path-%d" % i
    obj = (ctypes.c_char * OBJ_SIZE)()
    ctypes.memset(obj, 0xAA, OBJ_SIZE)
    ctypes.memset(obj, 0, 24)
    ctypes.memset(ctypes.addressof(obj) + 0x18, 0, 24)   # a second valid empty string
    setPath(ctypes.addressof(obj), s)
    raw = bytes(obj)
    if raw[COUNTER_OFF + 4:COUNTER_OFF + 8] != b"\x00\x00\x00\x00":
        neg["writes the counter as a 64-bit 0xffffffff (movq, like the ctor/reset)"] += 1
    if int.from_bytes(raw[COUNTER_OFF:COUNTER_OFF + 4], "little") != 0:
        neg["leaves the counter alone"] += 1
    if read_libcxx_string(obj, 0x18) != s:
        neg["assigns to a string at +0x18 instead of +0x00"] += 1

print(f"CASES={cases} DIVERGENCES={div}  (+0x4c preserved in {kept_c4c}/{cases})")
print("negative controls (higher = the wrong port would have been caught):")
for k, v in neg.items():
    print(f"   {v:4d}/{NEG_N}  {k}")
print("ORACLE:", "VERIFIED" if div == 0 else "DIVERGED")
sys.exit(0 if div == 0 else 1)
