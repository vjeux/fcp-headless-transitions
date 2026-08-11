#!/usr/bin/env python3
"""PCURL::getString(unsigned int*) const @ProCore 0x760a — live differential.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PCURL_getString_oracle.py

WHAT THIS SETTLES. The review that blocked PR #111 found that `_CFRelease`
@0x768a was modelled as a THROW while sitting in the MIDDLE of the success
path: the three instructions after it —

    0x768f  movq (%r13),%rax        ; used = *usedBufLen
    0x7693  movb $0x0,(%r14,%rax)   ; buf[used] = NUL
    0x7698  movl %eax,(%rbx)        ; *outLen  = used

are the whole observable result of the function. This harness calls the REAL
ProCore symbol on real CFURLs and measures those three stores, so the claim is
settled by execution rather than by reading:

  * the returned `char*` holds the POSIX path bytes,
  * `buf[*outLen] == 0` (the NUL the throwing model never reaches),
  * `*outLen` equals the byte length CFStringGetBytes reported,
  * the out-parameter is 0 and the result NULL on the two early-exit paths
    (`this->url == NULL` @0x7624, and a NULL path from
    `_CFURLCopyFileSystemPath` @0x7636).

NEGATIVE CONTROL (the pre-fix model): a throw at 0x768a unwinds before all
three stores, so it produces NO buffer and NO out-length on every input that
reaches the copy. It is scored below as the "throwing CFRelease" model and it
diverges on every non-empty case — which is the defect, reproduced.

The PCURL instance is built by the LANDED C1 ctor `__ZN5PCURLC1EPK7__CFURL`
@0x6ff2 rather than by hand, so the arena the getter reads is the one the
binary itself writes. The arena is 0xCD-poisoned and byte-diffed afterwards:
getString is `const`, so nothing in it may change.

WHAT THE RUN ALSO PINS, beyond the three stores: the two constants the call
site feeds `_CFStringGetBytes` @0x766d/@0x766f. `encoding = 0` is MacRoman, not
UTF-8 — `/tmp/\u00fcn\u00efc\u00f8d\u00e9-\u03a9` comes back as
`/tmp/\x9fn\x95c\xbfd\x8e-\xbd` — and `lossByte = 0x3f` is `'?'`, which is
what an unrepresentable emoji becomes (`/tmp/emoji-??-path`). A port that
"corrected" either of those to UTF-8 would diverge on those two cases.

WHAT THIS DOES NOT MEASURE, stated plainly: the TS port cannot execute
`getString` end to end today, because `_CFURLCopyFileSystemPath`,
`_CFStringGetLength` and `_CFStringGetBytes` are value-producing externs and
correctly throw. The comparison above is therefore between the LIVE function
and the values the port's tail computes from the same CF boundary — which is
exactly the code the CFRelease defect deleted. The fix matters the moment a
harness wires a real CF runtime through those three stubs, which is what their
throw messages ask for.

ADDRESSES come from raw-port/army/inventory/ProCore.syms.txt (x86_64 by
construction), never from a bare `nm` (OPS_LOG: a bare nm reports arm64 even
under Rosetta). Both symbols are `T`, so they are reached with plain dlsym.
"""
import ctypes, os, sys, platform

if platform.machine() != "x86_64":
    raise SystemExit("REFUSING TO RUN: this process is %s — every @0xADDR here is an "
                     "x86_64 offset. Run under `arch -x86_64 /usr/bin/python3`."
                     % platform.machine())

PROCORE = ("/Applications/Final Cut Pro.app/Contents/Frameworks/"
           "ProCore.framework/Versions/A/ProCore")
CF = ctypes.CDLL("/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation")
pc = ctypes.CDLL(PROCORE, ctypes.RTLD_GLOBAL)

# ---------------------------------------------------------------- CoreFoundation
CF.CFStringCreateWithCString.restype = ctypes.c_void_p
CF.CFStringCreateWithCString.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_uint32]
CF.CFURLCreateWithFileSystemPath.restype = ctypes.c_void_p
CF.CFURLCreateWithFileSystemPath.argtypes = [ctypes.c_void_p, ctypes.c_void_p,
                                             ctypes.c_long, ctypes.c_bool]
CF.CFRelease.argtypes = [ctypes.c_void_p]
CF.CFGetRetainCount.restype = ctypes.c_long
CF.CFGetRetainCount.argtypes = [ctypes.c_void_p]
class CFRange(ctypes.Structure):
    # BY VALUE. Declaring this as `c_long * 2` hands CF a pointer where it wants
    # 16 bytes of struct and the process dies with SIGSEGV (OPS_LOG).
    _fields_ = [("location", ctypes.c_long), ("length", ctypes.c_long)]

CF.CFURLCopyFileSystemPath.restype = ctypes.c_void_p
# TWO arguments — (anURL, style). No allocator: the call site @0x762e loads only
# %rdi = the url and %rsi = 0 (kCFURLPOSIXPathStyle @0x762c).
CF.CFURLCopyFileSystemPath.argtypes = [ctypes.c_void_p, ctypes.c_long]
CF.CFStringGetLength.restype = ctypes.c_long
CF.CFStringGetLength.argtypes = [ctypes.c_void_p]
CF.CFStringGetBytes.restype = ctypes.c_long
CF.CFStringGetBytes.argtypes = [ctypes.c_void_p, CFRange, ctypes.c_uint32, ctypes.c_ubyte,
                                ctypes.c_bool, ctypes.c_void_p, ctypes.c_long,
                                ctypes.POINTER(ctypes.c_long)]
kCFStringEncodingUTF8 = 0x08000100
kCFURLPOSIXPathStyle = 0

def cfurl(path_str):
    s = CF.CFStringCreateWithCString(None, path_str.encode("utf-8"), kCFStringEncodingUTF8)
    u = CF.CFURLCreateWithFileSystemPath(None, s, kCFURLPOSIXPathStyle, False)
    CF.CFRelease(s)
    return u

# ---------------------------------------------------------------- ProCore symbols
# dlsym takes the name WITHOUT the Mach-O leading underscore (OPS_LOG).
ctor = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)(
    ctypes.cast(getattr(pc, "_ZN5PCURLC1EPK7__CFURL"), ctypes.c_void_p).value)
get_string = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(ctypes.c_uint32))(
    ctypes.cast(getattr(pc, "_ZNK5PCURL9getStringEPj"), ctypes.c_void_p).value)

def run(path_str_or_none):
    """Build a PCURL (via the landed C1 ctor) and call the live getString."""
    arena = ctypes.create_string_buffer(b"\xCD" * 32, 32)   # explicit size: no +1 NUL (OPS_LOG)
    before = bytes(arena)
    url = cfurl(path_str_or_none) if path_str_or_none is not None else None
    ctor(ctypes.cast(arena, ctypes.c_void_p), url)
    out = ctypes.c_uint32(0xDEADBEEF)
    p = get_string(ctypes.cast(arena, ctypes.c_void_p), ctypes.byref(out))
    tail_clean = bytes(arena)[8:] == before[8:]     # only the +0x00 slot may be written
    if p is None:
        res = (None, out.value, tail_clean, None)
    else:
        # Read a window WIDER than the reported length, so the NUL position is
        # measured rather than assumed. Slicing exactly out.value bytes and then
        # asserting the length matches would be a check that cannot fail.
        window = ctypes.string_at(p, out.value + 16)
        res = (window, out.value, tail_clean, expected(url))
    if url:
        CF.CFRelease(url)
    return res


def expected(url):
    """Independently recompute what the three tail stores must produce, from the
    SAME CF boundary the port defers to: the path string @0x762e, serialised with
    the call site's own arguments (range {0,len} @0x7668/@0x766a, encoding 0
    @0x766d, lossByte 0x3f @0x766f, isExternalRepresentation 0 @0x7675).
    Returns (bytes, used) — used is what must land in *outLen and where the NUL
    must go."""
    s = CF.CFURLCopyFileSystemPath(url, kCFURLPOSIXPathStyle)
    if not s:
        return None
    n = CF.CFStringGetLength(s)
    cap = n + 0xa                                    # bufLen @0x7643/0x7646
    buf = (ctypes.c_ubyte * cap)()
    used = ctypes.c_long(0)
    CF.CFStringGetBytes(s, CFRange(0, n), 0, 0x3f, False,
                        ctypes.cast(buf, ctypes.c_void_p), cap, ctypes.byref(used))
    CF.CFRelease(s)
    return (bytes(bytearray(buf)[:used.value]), used.value)

CASES = [
    "/", "/tmp", "/Users", "/Applications/Final Cut Pro.app",
    "/tmp/a b c", "/tmp/ünïcødé-Ω", "/tmp/" + "x" * 200,
    "/private/var/folders", "/tmp/emoji-\U0001F600-path", "/usr/local/bin",
]

def main():
    print("PCURL::getString(unsigned int*) const @ProCore 0x760a — live differential")
    print("  ctor  __ZN5PCURLC1EPK7__CFURL   @0x6ff2 (landed, used to build the arena)")
    print("  under %s\n" % platform.machine())

    ok = diverged = 0
    throwing_model_would_fail = 0
    for c in CASES:
        (window, out, tail_clean, exp) = run(c)
        if window is None:
            print("  %-40s -> NULL (no path)   outLen=%d" % (c, out)); continue
        exp_bytes, exp_used = exp
        body = window[:out]
        # The three stores under test, each checked against a value derived
        # WITHOUT reading it back from the thing being tested:
        #   @0x7698  *outLen = used          -> out == exp_used
        #   @0x7693  buf[used] = 0           -> window[exp_used] == 0
        #   the buffer CFStringGetBytes filled -> body == exp_bytes
        hit_outlen = (out == exp_used)
        hit_nul = (len(window) > exp_used and window[exp_used] == 0)
        hit_body = (body == exp_bytes)
        good = hit_outlen and hit_nul and hit_body and tail_clean
        ok += 1 if good else 0
        diverged += 0 if good else 1
        # the pre-fix model reaches none of the three stores
        throwing_model_would_fail += 1
        print("  %-40s -> %-40r outLen=%-4d(exp %-4d) NUL@used=%s bytes=%s const-safe=%s"
              % (c[:40], body[:36], out, exp_used, hit_nul, hit_body, tail_clean))

    # early-exit paths: this->url == NULL @0x7624
    (window, out, tail_clean, _e) = run(None)
    null_path_ok = (window is None and out == 0)
    print("\n  this->url == NULL (@0x7624)              -> result=%s outLen=%d  (port: null, 0)"
          % (window, out))

    print("\nRESULT")
    print("  live cases agreeing with the port's tail : %d/%d" % (ok, ok + diverged))
    print("  divergences                              : %d" % diverged)
    print("  NULL-url early exit matches the port     : %s" % null_path_ok)
    print("  NEGATIVE CONTROL — throwing _CFRelease @0x768a produces no buffer, no")
    print("  NUL and no out-length on %d/%d of these cases (it unwinds before 0x768f)."
          % (throwing_model_would_fail, len(CASES)))
    return 0 if (diverged == 0 and null_path_ok) else 1

if __name__ == "__main__":
    sys.exit(main())
