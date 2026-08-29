#!/usr/bin/env python3
"""Differential for `HGRasterizer::enableBlending(HGLBlendMode, bool)` @Helium 0x198230.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGRasterizer_enableBlending_oracle.py

This one is fully comparable, both sides, with no out-of-scope boundary in the way: the function
has no callee, no branch and no extern — it read-modify-writes a 32-bit flags word at +0x454 and
stores a 32-bit enum at +0x424:

    0x198234  shll  $0x5, %edx            ; enable << 5
    0x198237  orl   0x454(%rdi), %edx     ; |= the CURRENT flags (32-bit)
    0x19823d  orl   $0x5, %edx            ; |= bits 0 and 2
    0x198240  movl  %edx, 0x454(%rdi)
    0x198246  movl  %esi, 0x424(%rdi)

ONE CASE LIST DRIVES BOTH SIDES. `CASES` below is the only source of inputs; `live(case)` calls the
LOCAL symbol at `_dyld_get_image_vmaddr_slide(Helium) + 0x198230` on a 0xCD-poisoned arena built
from the case, and `port(case)` runs the real TypeScript through node (`--experimental-strip-types`,
importing `raw-port/src/render/HGRasterizer.ts` directly). The comparison the harness can express is
`live(case) == port(case)` for the same case, and nothing else — the shape
`raw-port/army/ops/2026-08-11-a-differential-that-builds-its-two-sides-separately-confirms.md`
asks for.

  MEASURED, per case
    * the 32-bit word left at +0x454 and the 32-bit word left at +0x424;
    * that NO OTHER BYTE of the 0x500-byte arena changed — which is what pins the two offsets and
      the store widths, and would catch a port that also wrote a neighbouring field.

  NEGATIVE CONTROLS — three mutants of the port, each run through the identical case list, each
  required to DISAGREE with the live function:
    * `<< 5` -> `<< 4`            (the bool lands in the wrong bit)
    * `| 0x5` -> `| 0x4`          (drops the unconditional bit 0 that `orl $0x5` also sets)
    * `enable ? 1 : 0` -> `1`     (ignores the argument)
  A harness that cannot fail is not a harness; these say which specific wrong readings it catches.
"""
import ctypes
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "Helium"
SYM = "__ZN12HGRasterizer14enableBlendingE12HGLBlendModeb"
ADDR = 0x198230
THIS_SIZE = 0x500
OFF_FLAGS, OFF_MODE = 0x454, 0x424

FLAG_WORDS = [0x00000000, 0x00000001, 0x00000020, 0x12345678, 0xFFFFFFFF, 0x00000100]
MODES = [0, 1, 2, 3, -1, 0x7FFFFFFF]
CASES = [{"name": f"flags=0x{f:08x} enable={e} mode={m}", "flags": f, "enable": e, "mode": m}
         for f in FLAG_WORDS for e in (False, True) for m in MODES]

fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


def inconclusive(name, detail):
    """Could not run. Never a pass — an unrun check is a hole, not a result."""
    print(f"  INCONCLUSIVE {name}: {detail}")
    fails.append(name + " (INCONCLUSIVE — could not run, which is not a pass)")


oz.require_x86_64()
fn, va, slide = oz.local_fn(FW, SYM, None, [ctypes.c_void_p, ctypes.c_int32, ctypes.c_bool])
print(f"{FW} slide=0x{slide:x}  vmaddr=0x{va:x}  ({len(CASES)} cases)")
check("address", va == ADDR, f"0x{va:x} == the port's @0x{ADDR:x}")

ENTRY = bytes([0x55, 0x48, 0x89, 0xE5, 0xC1, 0xE2, 0x05])
body = ctypes.string_at(slide + va, 7)
print("  entry bytes: " + " ".join(f"{b:02x}" for b in body))
check("entry bytes: the third instruction is `shll $0x5, %edx`", body == ENTRY,
      "55 | 48 89 e5 | c1 e2 05 — the shift count is 5, so the bool lands in bit 5 (0x20)")
check("the byte check can fail", ctypes.string_at(slide + va + 1, 7) != ENTRY,
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")


def live(case):
    """Call the live function for ONE case; return (flags, mode, other_bytes_unchanged)."""
    a = (ctypes.c_char * THIS_SIZE)(*([0xCD] * THIS_SIZE))
    ctypes.memmove(ctypes.byref(a, OFF_FLAGS), ctypes.byref(ctypes.c_uint32(case["flags"])), 4)
    before = bytearray(bytes(a))
    fn(ctypes.byref(a), case["mode"], case["enable"])
    after = bytearray(bytes(a))
    flags = int.from_bytes(after[OFF_FLAGS:OFF_FLAGS + 4], "little")
    mode = int.from_bytes(after[OFF_MODE:OFF_MODE + 4], "little", signed=True)
    for off in (OFF_FLAGS, OFF_MODE):
        before[off:off + 4] = after[off:off + 4]
    return flags, mode, bytes(before) == bytes(after)


PORT = os.path.join(REPO, "src", "render", "HGRasterizer.ts")
DRIVER = """
const [modPath, casesJson] = process.argv.slice(2);
const mod = await import(modPath);
const out = [];
for (const c of JSON.parse(casesJson)) {
  // The SAME case the ctypes arena is built from: the flags word at +0x454, a poisoned +0x424.
  const self = { flags0x454: c.flags >>> 0, blendMode0x424: -0x33333334 };
  mod.HGRasterizer_enableBlending(self, c.mode, c.enable);
  out.push({ name: c.name, flags: self.flags0x454 >>> 0, mode: self.blendMode0x424 | 0 });
}
process.stdout.write(JSON.stringify({ results: out }));
"""
drv = os.path.join(HERE, ".hgrast_driver.mts")
open(drv, "w").write(DRIVER)


def port(module_path):
    p = subprocess.run(["node", "--experimental-strip-types", drv, module_path,
                        json.dumps(CASES)], capture_output=True, text=True, cwd=HERE)
    if p.returncode != 0:
        return None, f"node failed: {p.stderr[-600:]}"
    return {r["name"]: r for r in json.loads(p.stdout)["results"]}, "ok"


live_answers = {}
try:
    ts, why = port(PORT)
    if ts is None:
        inconclusive("the TS port runs", why)
    else:
        bad, untouched_bad = [], []
        for case in CASES:
            n = case["name"]
            flags, mode, untouched = live(case)
            live_answers[n] = (flags, mode)
            if (flags, mode) != (ts[n]["flags"], ts[n]["mode"]):
                bad.append((n, (flags, mode), (ts[n]["flags"], ts[n]["mode"])))
            if not untouched:
                untouched_bad.append(n)
        sample = CASES[len(CASES) // 2]["name"]
        print(f"  sample [{sample}] -> live flags=0x{live_answers[sample][0]:08x} "
              f"mode={live_answers[sample][1]}")
        check(f"live == port on all {len(CASES)} cases", not bad,
              "every case leaves the same 32-bit flags word and the same 32-bit blend mode on both "
              "sides" if not bad else f"{len(bad)} disagreed, first: {bad[0]}")
        check("the call writes ONLY +0x454 and +0x424", not untouched_bad,
              f"the rest of the 0x{THIS_SIZE:x}-byte 0xCD-poisoned arena is byte-identical after "
              "every call — which is what pins both offsets and both store widths"
              if not untouched_bad else f"{len(untouched_bad)} cases wrote elsewhere")

        # ── MUTANT CONTROLS ───────────────────────────────────────────────────────────────────
        src = open(PORT).read()
        MUTANTS = [
            ("the bool lands in bit 5", r"\(\(enable \? 1 : 0\) << 5\)", "((enable ? 1 : 0) << 4)"),
            ("bit 0 is set unconditionally too", r"\(edx \| 0x5\) >>> 0", "(edx | 0x4) >>> 0"),
            ("the bool argument is read at all", r"\(enable \? 1 : 0\) << 5", "(1) << 5"),
        ]
        for label, pat, repl in MUTANTS:
            mutated, n_sub = re.subn(pat, repl, src)
            if n_sub != 1:
                check(f"MUTANT CONTROL ({label}): the mutation applies", False,
                      f"expected exactly one site for {pat!r}, found {n_sub}")
                continue
            mpath = os.path.join(os.path.dirname(PORT), ".hgrast_mutant.ts")
            open(mpath, "w").write(mutated)
            try:
                mts, mwhy = port(mpath)
                if mts is None:
                    check(f"MUTANT CONTROL ({label}): the mutant runs", False, mwhy)
                    continue
                diffs = [n for n in live_answers
                         if (mts[n]["flags"], mts[n]["mode"]) != live_answers[n]]
                check(f"MUTANT CONTROL: this harness catches a port that gets "
                      f"{label!r} wrong", bool(diffs),
                      f"{len(diffs)} of {len(CASES)} cases disagree with the live function once "
                      f"the port is mutated ({repl})")
            finally:
                os.unlink(mpath)
finally:
    os.unlink(drv)

print()
print("HGRasterizer::enableBlending(HGLBlendMode, bool) @Helium 0x198230 — "
      + (f"VERIFIED: {len(CASES)} cases driven from one list agree with the live function on both "
         "stored words — including flag words with bits 8..31 set, both bool values and negative / "
         "0x7fffffff enum values — the call writes nothing outside +0x454 and +0x424, and three "
         "mutants of the port (wrong shift, missing unconditional bit 0, ignored argument) are "
         "each caught."
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
