#!/usr/bin/env python3
"""OZSceneSettings_getDisplayFrameRate_oracle.py — the shipped port vs LIVE Ozone.

  arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/OZSceneSettings_getDisplayFrameRate_oracle.py

WHY THE ARCH MATTERS HERE MORE THAN USUAL. This unit turns on `cvttpd2dq`
@Ozone 0x33a3b5, and the two slices of Ozone do NOT agree: the x86_64 body uses
CVTTPD2DQ, which yields the integer-indefinite 0x80000000 for NaN, infinities
and out-of-range values, while the arm64 body @0x2c4ba8 uses `fcvtms`, which
SATURATES to INT32_MAX/MIN and maps NaN to 0. Every @0xADDR in the port is an
x86_64 offset, so a differential run natively would compare the port against a
function it did not transcribe and disagree at exactly the inputs under test.
`ozone_loader.require_x86_64()` refuses to run outside Rosetta for that reason.

WHAT IS COMPARED. `getDisplayFrameRate` reads a double at this+0x20 and a byte
at this+0x28, so the harness builds the receiver itself: a 0x30-byte arena
poisoned with 0xCD, with the two fields written bit-exactly. Doubles cross as
RAW BIT PATTERNS in both directions (`struct.pack('<d')` in, u64 out, rebuilt
with a DataView on the TS side) — never as language-level floats — so signed
zero and NaN payloads survive and the comparison is bit-exact rather than
value-equal. NaN-vs-NaN is classified separately from a real divergence.

CONTROLS. Each mutant is an exact substitution on the SHIPPED source. M1 is the
rejected head's `x | 0`, which must diverge on precisely the unrepresentable
inputs; M2 saturates the arm64 way (INT32_MAX at the top end) to show the
harness can tell the two slices' semantics apart.
"""
import ctypes, json, os, struct, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import ozone_loader                                        # noqa: E402

SYM = "_ZNK15OZSceneSettings19getDisplayFrameRateEv"       # @Ozone 0x33a380
PORT_TS = os.path.join(ROOT, "src", "channels", "OZSceneSettings.ts")
DRIVER = os.path.join(HERE, "OZSceneSettings_getDisplayFrameRate_driver.mts")
POISON = 0xCD

MUTANTS = [
    ("M1 rejected head: `x | 0` (ToInt32 wrap, NaN -> 0)",
     "    x =\n      Number.isNaN(x) || x < -2147483648 || x > 2147483647\n"
     "        ? -2147483648\n        : x | 0;",
     "    x = x | 0;"),
    ("M2 arm64 `fcvtms` semantics (saturate high, NaN -> 0)",
     "    x =\n      Number.isNaN(x) || x < -2147483648 || x > 2147483647\n"
     "        ? -2147483648\n        : x | 0;",
     "    x = Number.isNaN(x) ? 0 : x > 2147483647 ? 2147483647 "
     ": x < -2147483648 ? -2147483648 : x | 0;"),
]


def corpus():
    rates = [23.976, 24.0, 25.0, 29.97, 30.0, 50.0, 59.94, 60.0, 120.0, 0.0,
             -0.0, 1.0, -1.0, 23.976023976023978, 47.952, 119.88,
             float("nan"), float("inf"), float("-inf"),
             1e9, -1e9, 1e300, -1e300, 5e-324, -5e-324,
             # straddle the int32 boundary of the INTERMEDIATE
             # (rate * (1000/1001) * 100 + 0.5 + 1e-7)
             21474836.0, 21474837.0, 21500000.0, -21474836.0, -21474837.0]
    # HEX STRINGS, not JSON numbers: a double's bit pattern routinely exceeds
    # 2**53, so carrying it as a JSON number would round it in transit and the
    # harness would corrupt its own corpus (and its own results).
    return [{"bits": "%016x" % struct.unpack("<Q", struct.pack("<d", r))[0],
             "flag": f}
            for r in rates for f in (0, 1, 2, 0xFF)]


def run_driver(module_path, cases):
    p = subprocess.run(["node", "--experimental-strip-types", DRIVER,
                        module_path], input=json.dumps({"cases": cases}),
                       capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("driver failed for %s:\n%s\n%s"
                         % (module_path, p.stdout[-2000:], p.stderr[-2000:]))
    return [int(h, 16) for h in json.loads(p.stdout)["out"]]


def is_nan_bits(u):
    return (u & 0x7FF0000000000000) == 0x7FF0000000000000 and (u & 0xFFFFFFFFFFFFF)


def main():
    ozone_loader.require_x86_64()
    lib = ozone_loader.load_framework("Ozone")
    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_double
    fn.argtypes = [ctypes.c_void_p]

    cases = corpus()
    live, tails_ok = [], True
    for c in cases:
        arena = ctypes.create_string_buffer(bytes([POISON]) * 0x30, 0x30)
        struct.pack_into("<Q", arena, 0x20, int(c["bits"], 16))
        struct.pack_into("<B", arena, 0x28, c["flag"])
        before = bytes(arena)
        r = fn(ctypes.byref(arena))
        if bytes(arena) != before:
            tails_ok = False
        live.append(struct.unpack("<Q", struct.pack("<d", r))[0])
    print("live Ozone %s @0x33a380 — %d cases" % (SYM, len(cases)))
    print("  receiver unmodified by the call (const method): %s" % tails_ok)
    if not tails_ok:
        raise SystemExit("the callee WROTE to the receiver — that is news; "
                         "stop and investigate before reporting a verdict")

    src = open(PORT_TS).read()
    results = {}
    with tempfile.TemporaryDirectory() as td:
        shipped = os.path.join(td, "shipped.ts")
        open(shipped, "w").write(src)
        results["SHIPPED"] = run_driver(shipped, cases)
        for i, (name, old, new) in enumerate(MUTANTS):
            if src.count(old) != 1:
                raise SystemExit("mutant %r anchors %d sites, need exactly 1 — "
                                 "a control that patches the wrong code is "
                                 "worse than no control." % (name, src.count(old)))
            mp = os.path.join(td, "m%d.ts" % i)
            open(mp, "w").write(src.replace(old, new, 1))
            results[name] = run_driver(mp, cases)

    ok = True
    for name, got in results.items():
        diverged, nan_pairs = [], 0
        for c, l, g in zip(cases, live, got):
            if g == l:
                continue
            if is_nan_bits(g) and is_nan_bits(l):
                nan_pairs += 1          # both NaN: payload/sign only, not a defect
                continue
            diverged.append((c, g, l))
        tag = "VERIFIED" if not diverged else "DIVERGED"
        print("%-48s %s  %d/%d bit-exact, %d divergences, %d NaN-pairs"
              % (name, tag, len(cases) - len(diverged) - nan_pairs, len(cases),
                 len(diverged), nan_pairs))
        for c, g, l in diverged[:6]:
            print("      rate %-24r flag %-4d port %-22r live %r"
                  % (struct.unpack("<d", struct.pack("<Q", int(c["bits"], 16)))[0],
                     c["flag"],
                     struct.unpack("<d", struct.pack("<Q", g))[0],
                     struct.unpack("<d", struct.pack("<Q", l))[0]))
        if name == "SHIPPED":
            ok = not diverged
        elif not diverged:
            print("      ^^ DEAD CONTROL — equivalent mutant or a blind "
                  "harness; do not read the SHIPPED line as evidence.")
            ok = False
    print("\nVERDICT: %s" % ("VERIFIED — bit-exact against live Ozone on every "
                             "case, and both controls fired" if ok else "FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
