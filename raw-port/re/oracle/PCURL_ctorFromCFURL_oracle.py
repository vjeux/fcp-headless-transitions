#!/usr/bin/env python3
"""PCURL_ctorFromCFURL_oracle.py — does the @0x700c store happen on BOTH paths?

  arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PCURL_ctorFromCFURL_oracle.py

WHY THIS EXISTS. `PCURL::PCURL(__CFURL const*)` [C1] @ProCore 0x6ff2 is 14
instructions whose only real work is one store:

    0x6fff  testq %rsi,%rsi
    0x7002  je    0x700c          <- NULL skips the retain
    0x7004  movq  %rbx,%rdi
    0x7007  callq _CFRetain       (stub 0xde018)
    0x700c  movq  %rbx,(%r14)     <- JOIN POINT: the store is on BOTH paths

The review of PR #82's sibling PR #268 rejected the first version of this port
for modelling `_CFRetain` as a THROW. That is a convention violation (the
RESOLVED CFRetain/CFRelease ruling names `_CFRetain` explicitly as a no-op /
identity), but it is also an execution bug with a consequence you can measure:
a throw at 0x7007 unwinds before 0x700c, so for every NON-NULL argument — the
entire point of the constructor — the store never happens. This harness makes
that concrete rather than arguing it.

WHAT IS AND IS NOT COMPARED. A JS surrogate has no machine address, so the
qword the binary stores cannot be compared bit-for-bit with a TS field. What
IS compared, on both sides and on both paths, is the pair
(did the store happen, is the stored operand the ARGUMENT) — which is exactly
what the disassembly asserts and exactly what the throw destroyed. The machine
side additionally checks the retain count and byte-diffs a poisoned arena, so
"nothing else was written" is checked too.
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import ozone_loader                                        # noqa: E402

DRIVER = os.path.join(HERE, "PCURL_ctorFromCFURL_driver.mts")
PORT_TS = os.path.join(ROOT, "src", "infra", "PCURL.ts")
CTOR = "_ZN5PCURLC1EPK7__CFURL"                            # T symbol @0x6ff2
POISON = 0xCD

CF = ctypes.CDLL("/System/Library/Frameworks/CoreFoundation.framework/"
                 "CoreFoundation")
CF.CFStringCreateWithCString.restype = ctypes.c_void_p
CF.CFStringCreateWithCString.argtypes = [ctypes.c_void_p, ctypes.c_char_p,
                                         ctypes.c_uint32]
CF.CFURLCreateWithString.restype = ctypes.c_void_p
CF.CFURLCreateWithString.argtypes = [ctypes.c_void_p, ctypes.c_void_p,
                                     ctypes.c_void_p]
CF.CFGetRetainCount.restype = ctypes.c_long
CF.CFGetRetainCount.argtypes = [ctypes.c_void_p]
CF.CFRetain.restype = ctypes.c_void_p
CF.CFRetain.argtypes = [ctypes.c_void_p]
kCFStringEncodingUTF8 = 0x08000100


def make_cfurl(s):
    cs = CF.CFStringCreateWithCString(None, s.encode(), kCFStringEncodingUTF8)
    if not cs:
        raise SystemExit("CFStringCreateWithCString failed for %r" % s)
    u = CF.CFURLCreateWithString(None, ctypes.c_void_p(cs), None)
    if not u:
        raise SystemExit("CFURLCreateWithString failed for %r" % s)
    # HEADROOM (OPS_LOG: a control released to zero reads back as "the callee
    # touched it", and CFGetRetainCount on a dead object returns 0x0FFF…FFF).
    for _ in range(4):
        CF.CFRetain(ctypes.c_void_p(u))
    return u


def call_ctor(fn, url_ptr):
    """Run the ctor on a poisoned 32-byte arena; return (stored_qword, tail_ok)."""
    arena = ctypes.create_string_buffer(bytes([POISON]) * 32, 32)  # exact size
    before = bytes(arena)
    fn(ctypes.byref(arena), ctypes.c_void_p(url_ptr))
    after = bytes(arena)
    stored = int.from_bytes(after[0:8], "little")
    # everything past the one 8-byte field must be untouched
    tail_ok = after[8:] == before[8:]
    return stored, tail_ok


def run_driver(module_path, cases):
    p = subprocess.run(["node", "--experimental-strip-types", DRIVER,
                        module_path],
                       input=json.dumps({"cases": cases}),
                       capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("driver failed for %s:\n%s\n%s"
                         % (module_path, p.stdout[-2000:], p.stderr[-2000:]))
    return json.loads(p.stdout)


# (name, exact substitution on the SHIPPED source) — the control is the port as
# it was REJECTED: `_CFRetain` modelled as a throw.
MUTANTS = [
    ("M1 pre-fix: CFRetain throws",
     "function CFRetain(cf: CFURLRef): CFURLRef {\n  return cf;",
     "function CFRetain(cf: CFURLRef): CFURLRef {\n  "
     "throw new Error('_CFRetain @ProCore 0x7007 not yet transcribed');"),
]


def ts_variants(cases):
    import tempfile
    src = open(PORT_TS).read()
    res = {}
    with tempfile.TemporaryDirectory() as td:
        shipped = os.path.join(td, "shipped.ts")
        open(shipped, "w").write(src)
        res["SHIPPED"] = run_driver(shipped, cases)
        for name, old, new in MUTANTS:
            if old not in src:
                raise SystemExit("mutant %r no longer applies — fix the "
                                 "harness rather than reporting a control "
                                 "that cannot fire." % name)
            mp = os.path.join(td, "m1.ts")
            open(mp, "w").write(src.replace(old, new, 1))
            res[name] = run_driver(mp, cases)
    return res


def main():
    ozone_loader.require_x86_64()
    lib = ozone_loader.load_framework("ProCore")
    fn = getattr(lib, CTOR)
    fn.restype = None
    fn.argtypes = [ctypes.c_void_p, ctypes.c_void_p]

    url = make_cfurl("file:///tmp/w5.mov")
    rc_before = CF.CFGetRetainCount(ctypes.c_void_p(url))

    machine = {}
    s, tail = call_ctor(fn, None)
    machine["null"] = {"stored": s, "is_arg": s == 0, "tail_untouched": tail}
    s, tail = call_ctor(fn, url)
    machine["nonnull"] = {"stored": s, "is_arg": s == url,
                          "tail_untouched": tail}
    rc_after = CF.CFGetRetainCount(ctypes.c_void_p(url))

    print("live ProCore  %s @0x6ff2" % CTOR)
    print("  NULL    : stored %#018x  stores-the-argument=%s  tail-untouched=%s"
          % (machine["null"]["stored"], machine["null"]["is_arg"],
             machine["null"]["tail_untouched"]))
    print("  non-NULL: stored %#018x  stores-the-argument=%s  tail-untouched=%s"
          % (machine["nonnull"]["stored"], machine["nonnull"]["is_arg"],
             machine["nonnull"]["tail_untouched"]))
    print("  CFGetRetainCount %d -> %d (the conditional retain @0x7007 fired "
          "exactly once)" % (rc_before, rc_after))

    if rc_after != rc_before + 1:
        raise SystemExit("retain count moved by %d, expected 1 — the harness "
                         "is not measuring what it claims"
                         % (rc_after - rc_before))

    ts = ts_variants(["null", "nonnull"])
    ok = True
    for variant, res in ts.items():
        agree = all(res[c]["stored"] == machine[c]["is_arg"]
                    for c in ("null", "nonnull"))
        tag = "AGREES" if agree else "DIVERGES"
        if variant == "SHIPPED":
            ok = agree
        elif agree:
            print("      ^^ DEAD CONTROL — the mutant is equivalent or the "
                  "harness is blind.")
            ok = False
        print("%-34s %s   null: stored=%s   non-null: stored=%s%s"
              % (variant, tag, res["null"]["stored"], res["nonnull"]["stored"],
                 "  (threw: %s)" % res["nonnull"]["threw"]
                 if res["nonnull"]["threw"] else ""))
    print("\nVERDICT: %s" % (
        "VERIFIED — the port stores the argument on BOTH paths, as the machine "
        "does at the 0x700c join point, and the pre-fix throwing model is "
        "caught skipping that store on every non-NULL argument" if ok else "FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
