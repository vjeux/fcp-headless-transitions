#!/usr/bin/env python3
"""copyCropValues_nullpath_oracle.py — differential for the ONE path of
`copyCropValues` @Flexo 0xe18390 (`__ZL14copyCropValuesP10__CVBufferjPf`) that is
executable on both sides.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/copyCropValues_nullpath_oracle.py

SCOPE — READ THIS BEFORE READING THE NUMBERS. This harness verifies the null-buffer
early exit at @0xe183b0 (`testq %rdi,%rdi ; je 0xe1846e`) and the single result store
`xorps %xmm0,%xmm0` @0xe1846e + `movups %xmm0,(%rbx)` @0xe1848b. It does NOT verify the
crop math, and it cannot: the attachment paths run through `_CVBufferCopyAttachment`,
`_CFDataGetLength` and `_CFDataGetBytes`, which are VALUE-PRODUCING out-of-scope externs
that the port correctly models as citing throws, so on the TypeScript side those paths
terminate at the boundary by design. Reviewer-1 already re-derived that math against the
binary instruction by instruction (the shll/cvtsi2ss/pmovzxbd/cvtdq2ps/shufps/divps
sequence @0xe18441..0xe18454) and did not dispute it; the rework this harness accompanies
changes only the `_CFRelease` stub from a throw to a no-op.

So: one path, measured properly, and the limit stated. It is worth running anyway
because it is the path a null CVBuffer actually takes in FCP, and because it pins the
store WIDTH — the function writes exactly one 16-byte xmm quad and must not touch the
bytes beyond it.

`copyCropValues` is a LOCAL (`nm` type `t`) symbol, so it is called at
inventory vmaddr + `_dyld_get_image_vmaddr_slide` under `arch -x86_64`, with a
prologue-byte self-check at the call target first.
"""
import ctypes, json, os, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from ozone_loader import local_fn, require_x86_64  # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

require_x86_64()

SYM = "__ZL14copyCropValuesP10__CVBufferjPf"      # @Flexo 0xe18390
ARENA_FLOATS = 8                                  # 4 written + 4 that must NOT be
POISON = 0xCD
# 55 48 89 e5 | 41 57 | 41 56 | 41 54
#  push %rbp ; mov %rsp,%rbp ; push %r15 ; push %r14 ; push %r12
PROLOGUE = bytes.fromhex("554889e5415741564154")

fcp, VMADDR, SLIDE = local_fn(
    "Flexo", SYM, None, [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_void_p])

got = ctypes.string_at(SLIDE + VMADDR, len(PROLOGUE))
if got != PROLOGUE:
    raise SystemExit(
        f"SELF-CHECK FAILED at vmaddr {VMADDR:#x} (slide {SLIDE:#x}): expected prologue "
        f"{PROLOGUE.hex()}, found {got.hex()} — the address does not point at the "
        f"transcribed function, so every number below would be fiction.")

# `shift` reaches the machine as an unsigned int and is masked to 5 bits by `shll %cl`;
# the null path never uses it, and including wild values proves the early exit really is
# taken before any of that.
SHIFTS = [0, 1, 4, 8, 31, 32, 33, 255, 0xFFFFFFFF]


def machine_side():
    rows = []
    for shift in SHIFTS:
        arena = ctypes.create_string_buffer(bytes([POISON]) * (ARENA_FLOATS * 4),
                                            ARENA_FLOATS * 4)
        before = bytes(arena)
        fcp(None, shift, ctypes.byref(arena))
        after = bytes(arena)
        rows.append({
            "shift": shift,
            # BIT PATTERNS, never language-level floats (OPS_LOG): this is the only way
            # to be exact about signed zero, and `xorps` produces +0.0 specifically.
            "written_bits": list(struct.unpack("<4I", after[:16])),
            "tail_untouched": after[16:] == before[16:],
        })
    return rows


def ts_side(shifts):
    driver = os.path.join(HERE, "copyCropValues_nullpath_driver.mts")
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps({"shifts": [int(s) for s in shifts]}),
                       capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        print("TS DRIVER FAILED:\n" + p.stderr, file=sys.stderr)
        sys.exit(2)
    return json.loads(p.stdout)


def main():
    print("=" * 78)
    print("copyCropValues @Flexo 0xe18390 — NULL-BUFFER path, vs the live Flexo binary")
    print("=" * 78)

    rows = machine_side()
    ts = ts_side(SHIFTS)
    ok = True

    print("\n-- the store: 4 float32 written, bit-exact, tail untouched --")
    bad = 0
    for r, t in zip(rows, ts["port"]):
        agree = r["written_bits"] == t and r["tail_untouched"]
        bad += not agree
        if not agree:
            print(f"   DIVERGE shift={r['shift']:#x} binary={[hex(x) for x in r['written_bits']]} "
                  f"port={[hex(x) for x in t]} tail_untouched={r['tail_untouched']}")
    print(f"   {len(rows) - bad}/{len(rows)} bit-exact")
    print(f"   every case wrote +0.0 (0x00000000), not -0.0 (0x80000000): "
          f"{all(all(b == 0 for b in r['written_bits']) for r in rows)}")
    print(f"   bytes 16..31 of the poisoned arena untouched in every case: "
          f"{all(r['tail_untouched'] for r in rows)}  (the store is ONE xmm quad)")
    ok &= bad == 0

    print("\n-- NEGATIVE CONTROLS (same node process as the port) --")
    for label, key in (("M1 writes 8 floats instead of 4 (store too wide)", "m1_wide"),
                       ("M2 writes nothing at all (early exit mis-read)", "m2_nostore"),
                       ("M3 writes 1.0f instead of 0.0f", "m3_ones"),
                       ("M4 writes -0.0f (xorps mis-read as a sign flip)", "m4_negzero")):
        killed = 0
        for r, t in zip(rows, ts["mutants"][key]):
            if r["written_bits"] != t["bits"] or r["tail_untouched"] != t["tail_untouched"]:
                killed += 1
        print(f"   {label}: killed {killed}/{len(rows)}")
        if killed == 0:
            print("   !! scored 0 — say which it is: a BLIND harness, or an EQUIVALENT "
                  "mutant. Not a clean run.")
            ok = False

    print("\nNOT COVERED, stated rather than skipped: the crop math on the two attachment "
          "paths. Those run through value-producing CoreVideo/CoreFoundation externs that "
          "the port correctly models as citing throws, so they are not executable from "
          "TypeScript at all. See the SCOPE note at the top of this file.")

    print("\n" + ("VERDICT: VERIFIED (null path)" if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
