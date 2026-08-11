#!/usr/bin/env python3
"""Differential oracle for PCString::PCString(unsigned short const*)
@ProCore 0x31eac  [C1]  /  @ProCore 0x31e7a  [C2, byte-identical twin].

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PCString_ctor_char16_oracle.py

Rosetta is mandatory: every @0xADDR the port cites is an x86_64 offset, and a native
arm64 process would compare the port against a body it never read (OPS_LOG: "the
executable oracle calls the wrong architecture" — it fails silently toward VERIFIED).

The ctor does three observable things: (1) if the pointer is NULL it returns WITHOUT
writing this->ref at all, (2) otherwise it counts UTF-16 code units up to the first
NUL with the `movq $-1,%rdx / cmpw $0,0x2(%rsi,%rdx,2) / leaq 0x1(%rdx),%rdx / jne`
loop, and (3) it calls CFStringCreateWithCharacters(NULL, chars, count) and stores the
result at this+0x00. All three are checked here against the live binary: the stored
CFStringRef is read back with the REAL CoreFoundation CFStringGetLength /
CFStringGetCharacters, so the length the loop computed is observed directly.
"""
import ctypes, ctypes.util, json, os, platform, random, subprocess, sys

assert platform.machine() == 'x86_64', f"WRONG SLICE: {platform.machine()}"

PC = "/Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore"
procore = ctypes.CDLL(PC, ctypes.RTLD_GLOBAL)
CF = ctypes.CDLL(ctypes.util.find_library("CoreFoundation"), ctypes.RTLD_GLOBAL)

ctor = procore._ZN8PCStringC1EPKt              # the claimed unit (C1)
ctor.restype = None
ctor.argtypes = [ctypes.c_void_p, ctypes.c_void_p]

ctor_c2 = procore._ZN8PCStringC2EPKt           # the byte-identical base-object twin
ctor_c2.restype = None
ctor_c2.argtypes = [ctypes.c_void_p, ctypes.c_void_p]

class CFRange(ctypes.Structure):
    """CoreFoundation CFRange — TWO CFIndex fields passed BY VALUE. Declaring it as
    `c_long * 2` (a pointer) instead segfaults the process; that is not a port bug,
    it is a harness ABI bug, and it is worth stating because a segfaulting oracle is
    indistinguishable from a broken port until you look."""
    _fields_ = [("location", ctypes.c_long), ("length", ctypes.c_long)]


CF.CFStringGetLength.restype = ctypes.c_long
CF.CFStringGetLength.argtypes = [ctypes.c_void_p]
CF.CFStringGetCharacters.restype = None
CF.CFStringGetCharacters.argtypes = [ctypes.c_void_p, CFRange, ctypes.c_void_p]

SENTINEL = 0xDEADBEEFCAFEF00D

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TSX = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
TS_DRIVER = os.path.join(REPO, "raw-port", "re", "oracle", "PCString_ctor_char16_driver.ts")


def run_ts(cases):
    """Run the ACTUAL TypeScript port over the same corpus (code units on the wire in
    both directions, so a lone surrogate cannot be mangled by an encoder). Returns a
    list of code-unit lists, or None where the port left `ref` null."""
    p = subprocess.run([TSX, TS_DRIVER], input=json.dumps(cases),
                       capture_output=True, text=True, cwd=REPO)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return json.loads(p.stdout)


def port(units):
    """What the TS port computes: NUL-terminated scan, then a CFString of that prefix.
    Returns None to mean 'this->ref was not written'."""
    if units is None:                       # @0x31eac testq %rsi,%rsi ; @0x31eaf je 0x31edd
        return None                         # ref left untouched
    n = 0                                   # @0x31eba..@0x31ecb the strlen16 loop
    while units[n] != 0:
        n += 1
    return ''.join(chr(u) for u in units[:n])


def call_real(units, which=ctor):
    obj = (ctypes.c_uint64 * 1)(SENTINEL)   # this+0x00, pre-poisoned
    if units is None:
        buf = None
    else:
        arr = (ctypes.c_uint16 * len(units))(*units)
        buf = ctypes.cast(arr, ctypes.c_void_p)
        _keep.append(arr)
    which(ctypes.cast(obj, ctypes.c_void_p), buf)
    ref = obj[0]
    if ref == SENTINEL:
        return None, True                   # field untouched
    if ref == 0:
        return '', False                    # a NULL CFStringRef was stored
    n = CF.CFStringGetLength(ctypes.c_void_p(ref))
    out = (ctypes.c_uint16 * (n + 1))()
    CF.CFStringGetCharacters(ctypes.c_void_p(ref), CFRange(0, n), ctypes.cast(out, ctypes.c_void_p))
    return ''.join(chr(out[i]) for i in range(n)), False


_keep = []


def main():
    random.seed(20260811)
    cases = [
        [0],                                        # empty: first unit is the NUL -> length 0
        [0x41, 0],                                  # "A"
        [0x41, 0x42, 0x43, 0],                      # "ABC"
        [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0],          # "Hello"
        [0xFFFF, 0],                                # max code unit
        [0x0001, 0],                                # min non-NUL
        [0x00E9, 0x00F1, 0],                        # latin-1 supplement
        [0x4E2D, 0x6587, 0],                        # CJK
        [0xD83D, 0xDE00, 0],                        # a surrogate PAIR (non-BMP emoji)
        [0xD83D, 0],                                # a LONE high surrogate (ill-formed UTF-16)
        [0xDE00, 0],                                # a LONE low surrogate
        [0x41, 0x00, 0x42, 0],                      # embedded NUL: the scan must stop at index 1
        [0x20] * 64 + [0],                          # 64 units
        [0x41] * 255 + [0],                         # 255 units
        list(range(1, 300)) + [0],                  # 299 distinct units
    ]
    for _ in range(300):                            # random lengths / contents
        n = random.randint(0, 40)
        cases.append([random.randint(1, 0xFFFF) for _ in range(n)] + [0])

    ts = run_ts([list(u) for u in cases])   # the REAL TypeScript port, same corpus

    n = bad = ts_bad = 0
    fails = []
    for i, units in enumerate(cases):
        got, untouched = call_real(units)
        exp = port(units)
        n += 1
        if untouched or got != exp:
            bad += 1
            if len(fails) < 8:
                fails.append((units[:8], repr(got)[:40], repr(exp)[:40]))
        # the authoritative comparison: LIVE BINARY vs the actual TS port
        ts_str = None if ts[i] is None else ''.join(chr(u) for u in ts[i])
        if ts_str != got:
            ts_bad += 1
            if len(fails) < 8:
                fails.append((units[:8], repr(got)[:40], "TS:" + repr(ts_str)[:36]))

    # --- the NULL-pointer path: the machine must NOT write this->ref at all ---
    null_untouched = 0
    for _ in range(50):
        got, untouched = call_real(None)
        if untouched and port(None) is None:
            null_untouched += 1

    # --- the C2 base-object twin must behave identically (byte-identical body) ---
    c2_mismatch = 0
    for units in cases[:60]:
        a, _ = call_real(units, ctor)
        b, _ = call_real(units, ctor_c2)
        if a != b:
            c2_mismatch += 1

    ts_null = run_ts([None])[0]

    print(f"CASES={n} TS_PORT_vs_LIVE_DIVERGED={ts_bad} PY_MODEL_vs_LIVE_DIVERGED={bad} "
          f"NULL_LEAVES_FIELD_UNTOUCHED={null_untouched}/50 C2_TWIN_MISMATCH={c2_mismatch}/60 "
          f"TS_NULL_REF={ts_null}")
    for f in fails:
        print("  FAIL units=%s real=%s port=%s" % f)

    def ctl(name, f):
        w = 0
        for units in cases:
            got, _ = call_real(units)
            if f(units) != got:
                w += 1
        print(f"  NEGATIVE CONTROL {name}: {w}/{n} wrong")

    ctl("scan misses the terminator (length+1)",
        lambda u: ''.join(chr(x) for x in u[:next(i for i, c in enumerate(u) if c == 0) + 1]))
    ctl("off-by-one short (length-1)",
        lambda u: ''.join(chr(x) for x in u[:max(0, next(i for i, c in enumerate(u) if c == 0) - 1)]))
    ctl("stops at the first byte-zero instead of the first UNIT-zero (8-bit scan)",
        lambda u: ''.join(chr(x) for x in u[:next((i for i, c in enumerate(u) if (c & 0xFF) == 0), len(u))]))
    ctl("ignores the embedded NUL and takes the whole buffer",
        lambda u: ''.join(chr(x) for x in u if x != 0))

    ok = (bad == 0 and ts_bad == 0 and null_untouched == 50 and c2_mismatch == 0
          and ts_null is None)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
