#!/usr/bin/env python3
"""HGFormatUtils_RGBtoRGBA_oracle.py — the shipped port vs LIVE Helium.

  arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/HGFormatUtils_RGBtoRGBA_oracle.py

WHY. `HGFormatUtils::RGBtoRGBA(HGFormat)` @Helium 0xa1cf0 is an exported (`T`)
pure int->int static, so it is directly dlsym-able and there is no excuse for
signing it by reading. Three reviewers independently oracled PR #154 and found
the same three wrong answers; this harness is the permanent version of that
check, committed with the fix so the next change to this function has to face
it too.

THE DEFECT IT PINS. `btq %rax,%rcx` @0xa1d00 masks the bit index to (fmt & 63),
but `shlq $0x5,%rcx` @0xa1d08 scales the FULL fmt into the table address, so
fmt >= 64 whose low six bits are in {17..21, 40, 41} passes the bitmap gate and
then indexes past the 44-entry formatInfos table at @0xa1d13 — an unchecked
read, i.e. C++ UB. The rejected port let `undefined` become NaN and then index
0, fabricating 24. The shipped port RAISES there instead (Rule 3, and the same
treatment `toGLFormat` @0xa1c61 already gives the identical shape in this file).

HOW A REFUSAL IS SCORED, because this is the part worth being careful about. A
raise is NOT counted as agreement. Each case is one of:
  EXACT    — port value == live value
  WRONG    — port returned a DIFFERENT value (the failure this exists to catch)
  REFUSED  — port raised; the machine's own read at that input is out of bounds
Only WRONG fails the verdict, and every REFUSED input is separately asserted to
be one where the machine really is reading past the table (mask bit set AND
fmt > 0x2b). If a refusal ever appears outside that domain the harness fails:
that would be a port declining to answer something the binary answers legally.
"""
import ctypes, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import ozone_loader                                        # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

SYM = "_ZN13HGFormatUtils9RGBtoRGBAE8HGFormat"             # T @Helium 0xa1cf0
PORT_TS = os.path.join(ROOT, "src", "render", "HGFormatUtils.ts")
DRIVER = os.path.join(HERE, "HGFormatUtils_RGBtoRGBA_driver.mts")
MASK = 0x300003E0000          # bits {17,18,19,20,21,40,41}
TABLE_MAX = 0x2B              # last transcribed formatInfos index (44 entries)

# Mutants are exact substitutions on the SHIPPED source, so each control is
# provably one edit away from what ships. NOTE what M1 is and is not: it deletes
# the bounds raise from the CURRENT body, where the resulting NaN index reaches
# `RGB_TO_RGBA_BY_SEL[NaN]` and yields 0. The historically rejected head reached
# the same collapse through `(sel-1) & 0xffffffff` + `[idx >>> 0]` and answered
# 24 instead. Same defect, one digit different in the fabricated answer — the
# control is labelled for what it does, not for what the old head did.
MUTANTS = [
    # Each `old` is anchored to text unique to RGBtoRGBA. An earlier version of
    # this harness used `if (s > 0x2b) {\n    throw new Error(`, which matches
    # toGLFormat FIRST — three controls silently patched a different function
    # and all four scored identically to SHIPPED. The dead-control rule caught
    # it; the anchors below are checked for uniqueness at run time.
    ("M1 bounds raise removed (the NaN-index collapse the fix closes)",
     '  if (s > 0x2b) {\n    throw new Error(\n      "HGFormatUtils::RGBtoRGBA(fmt="',
     '  if (false) {\n    throw new Error(\n      "HGFormatUtils::RGBtoRGBA(fmt="'),
    ("M2 bail returns the unsigned view (the rejected head's signedness bug)",
     "    return fmt | 0;\n  }\n\n  // @Helium 0xa1d06",
     "    return s;\n  }\n\n  // @Helium 0xa1d06"),
    ("M3 OOB answers 24 instead of raising",
     '  if (s > 0x2b) {\n    throw new Error(\n      "HGFormatUtils::RGBtoRGBA(fmt="',
     '  if (s > 0x2b) {\n    return 24;\n  }\n  if (false) {\n    throw new Error(\n      "HGFormatUtils::RGBtoRGBA(fmt="'),
    ("M4 OOB answers fmt instead of raising",
     '  if (s > 0x2b) {\n    throw new Error(\n      "HGFormatUtils::RGBtoRGBA(fmt="',
     '  if (s > 0x2b) {\n    return fmt | 0;\n  }\n  if (false) {\n    throw new Error(\n      "HGFormatUtils::RGBtoRGBA(fmt="'),
]


def corpus():
    return list(range(-16, 1024))


def run_driver(module_path, inputs):
    p = subprocess.run(["node", "--experimental-strip-types", DRIVER,
                        module_path],
                       input=json.dumps({"inputs": inputs}),
                       capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        raise SystemExit("driver failed for %s:\n%s\n%s"
                         % (module_path, p.stdout[-2000:], p.stderr[-2000:]))
    return json.loads(p.stdout)["out"]


def machine_reads_oob(fmt):
    """Does the BINARY index past the transcribed table for this input?"""
    s = fmt & 0xFFFFFFFF
    return ((MASK >> (s & 0x3F)) & 1) == 1 and s > TABLE_MAX


def score(xs, live, got):
    exact = wrong = refused = 0
    bad_refusals, wrongs = [], []
    for x, l, g in zip(xs, live, got):
        if g.get("threw"):
            refused += 1
            if not machine_reads_oob(x):
                bad_refusals.append(x)
        elif g["value"] == l:
            exact += 1
        else:
            wrong += 1
            wrongs.append((x, g["value"], l))
    return exact, wrong, refused, wrongs, bad_refusals


FORMAT_INFOS_VA = 0xA0BA40      # __ZN12_GLOBAL__N_111formatInfosE
SLICE = "/tmp/Helium.x86_64"


def oob_is_load_time_data(slide):
    """Show that the OOB domain is NOT part of the transcribed image.

    The load at @0xa1d13 reads `formatInfos + fmt*32 + 0x0c`. Past the 44
    entries that lands in storage the FILE leaves zero and the LOADER fills in,
    so the value is a property of the running process, not of the binary the
    port transcribes. This is printed rather than asserted-on, because it is
    exactly the kind of run-dependent signal that must stay OUT of a verdict.
    """
    try:
        f = open(SLICE, "rb")
    except OSError:
        print("  (no /tmp/Helium.x86_64 slice — skipping the OOB provenance "
              "probe; regenerate with lipo -thin x86_64)")
        return
    print("  OOB provenance — the bytes @0xa1d13 actually reads:")
    with f:
        for fmt in (232, 233, 913, 81, 104):
            va = FORMAT_INFOS_VA + fmt * 32 + 0x0C
            inproc = ctypes.string_at(slide + va, 4).hex()
            f.seek(va)
            infile = f.read(4).hex()
            print("    fmt %-4d VA %#09x  file %s  in-process %s  %s"
                  % (fmt, va, infile, inproc,
                     "same" if infile == inproc else "WRITTEN AT LOAD TIME"))
    print("    => on this domain the machine returns load-time data, so its "
          "answer is a property of the PROCESS, not of the input. Two "
          "independent harnesses on this box disagree about fmt=232 (the PR "
          "#154 reviews measured 232; this one measures 24). Any port that "
          "'matched' either number would be encoding one process's memory.")


def main():
    ozone_loader.require_x86_64()
    lib = ozone_loader.load_framework("Helium")
    slide, _ = ozone_loader.image_slide("Helium")
    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_int32
    fn.argtypes = [ctypes.c_int32]

    xs = corpus()
    live = [fn(x) for x in xs]
    print("live Helium %s @0xa1cf0 — %d cases (fmt %d..%d)"
          % (SYM, len(xs), xs[0], xs[-1]))
    # SELF-CHECK, and note what is deliberately NOT in it. Only the IN-TABLE
    # answers are properties of the transcribed program, so only those are
    # asserted. The out-of-range answers are NOT: see oob_is_load_time_data().
    spot = {17: 24, 18: 24, 19: 25, 20: 27, 21: 28, 40: 24, 41: 24, -8: -8}
    for k, v in sorted(spot.items()):
        got = live[xs.index(k)]
        if got != v:
            raise SystemExit("SELF-CHECK FAILED: live(%d) = %d, expected %d — "
                             "refusing to report against an unexpected build"
                             % (k, got, v))
    print("self-check OK: the 8 in-table answers match "
          "(17->24, 18->24, 19->25, 20->27, 21->28, 40->24, 41->24, -8->-8)")
    oob_is_load_time_data(slide)

    src = open(PORT_TS).read()
    results = {}
    with tempfile.TemporaryDirectory() as td:
        shipped = os.path.join(td, "shipped.ts")
        open(shipped, "w").write(src)
        results["SHIPPED"] = run_driver(shipped, xs)
        for i, (name, old, new) in enumerate(MUTANTS):
            if src.count(old) != 1:
                raise SystemExit("mutant %r anchors %d sites, need exactly 1 "
                                 "— a control that patches the wrong function "
                                 "is worse than no control." % (name, src.count(old)))
            mp = os.path.join(td, "m%d.ts" % i)
            open(mp, "w").write(src.replace(old, new, 1))
            results[name] = run_driver(mp, xs)

    ok = True
    for name, got in results.items():
        exact, wrong, refused, wrongs, bad = score(xs, live, got)
        print("%-52s exact %4d  WRONG %3d  refused %3d"
              % (name, exact, wrong, refused))
        for x, g, l in wrongs[:4]:
            print("        fmt %-5d port %-12d live %d" % (x, g, l))
        if bad:
            print("        REFUSED where the machine is IN BOUNDS: %s" % bad[:6])
            ok = False
        if name == "SHIPPED":
            if wrong or bad:
                ok = False
        elif wrong == 0:
            print("        ^^ DEAD CONTROL — equivalent mutant, or the harness "
                  "is blind. Do not read the SHIPPED line as evidence.")
            ok = False

    print("\nVERDICT: %s" % (
        "VERIFIED — 0 wrong answers; every refusal is an input where the "
        "binary itself reads past the table, and all four controls fired"
        if ok else "FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
