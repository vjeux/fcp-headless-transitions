#!/usr/bin/env python3
"""Differential for `FFVTDecompressionSession::getFormatDescriptionDimensions() const`
@Flexo 0xe38290.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/\
FFVTDecompressionSession_getFormatDescriptionDimensions_oracle.py

THE FUNCTION IS FIVE INSTRUCTIONS, so the two things that can be wrong are the OFFSET it reads and
the CALLEE it forwards to:

    0xe38290  pushq %rbp
    0xe38291  movq  %rsp, %rbp
    0xe38294  movq  0x8(%rdi), %rdi
    0xe38298  popq  %rbp
    0xe38299  jmp   _CMVideoFormatDescriptionGetDimensions      ; tail call, stub @0x1495232

Both are measured here against the live Flexo image, with REAL CoreMedia format descriptions built
by `CMVideoFormatDescriptionCreate` — not with hand-made pointers, because the callee dereferences
the object and a fabricated one would only prove that it crashes.

ONE CASE LIST DRIVES BOTH SIDES (`CASES` below is the only source of inputs), because a harness
whose two sides are constructed separately can agree for unrelated reasons — that is what let an
inverted guard pass nine green checks on #741 (see
`raw-port/army/ops/2026-08-11-a-differential-that-builds-its-two-sides-separately-confirms.md`).

  MEASURED, live, per case
    * the thunk called on a 0xCD-poisoned receiver whose +0x8 holds that case's format description
      returns exactly what `CMVideoFormatDescriptionGetDimensions` returns for the SAME object,
      which is also exactly the width/height the case was created with;
    * the receiver is byte-identical afterwards (the function writes nothing).

  CONTROLS, so that a pass means something
    * FIELD CONTROL: the arenas are rebuilt with +0x8 pointing at ANOTHER case's description and
      the answer follows +0x8. An answer that does not move with the field is measuring something
      else — and this is the check that would catch a wrong offset, which is the likeliest defect
      in a function this short;
    * NEGATIVE CONTROL: each case's live answer is also compared against a DIFFERENT case's
      dimensions and must disagree, so the comparison is known to be able to fail;
    * ENTRY BYTES: `55 48 89 e5 48 8b 7f 08 5d e9` — frame, `movq 0x8(%rdi), %rdi`, frame torn
      down, then `e9` (JMP rel32, a TAIL call — not `e8` CALL). Re-run one byte off the entry
      point, where it must not pass.

  DECLARED NOT COMPARABLE, and never presented as agreement
    * the TypeScript side. `CMVideoFormatDescriptionGetDimensions` is a VALUE-PRODUCING out-of-scope
      extern, so the port raises at that boundary by policy and there is no value to compare. What
      is required of the port instead — and checked — is that it throws citing @0xe38299, i.e.
      refuses rather than inventing dimensions.
"""
import ctypes
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "Flexo"
SYM = "__ZNK24FFVTDecompressionSession30getFormatDescriptionDimensionsEv"
ADDR = 0xE38290
THIS_SIZE = 0x200
FMT_OFFSET = 0x08
KCMVIDEOCODECTYPE_H264 = 0x61766331  # 'avc1'

# ── THE case list: every input in this harness comes from here ────────────────────────────────
CASES = [
    {"name": "1920x1080", "width": 1920, "height": 1080},
    {"name": "640x480", "width": 640, "height": 480},
    {"name": "7x3 (deliberately not a video size)", "width": 7, "height": 3},
]

fails = []
declared = []


class CMVideoDimensions(ctypes.Structure):
    _fields_ = [("width", ctypes.c_int32), ("height", ctypes.c_int32)]

    def as_tuple(self):
        return (self.width, self.height)


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


def inconclusive(name, detail):
    """Could not run. Never a pass — an unrun check is a hole, not a result."""
    print(f"  INCONCLUSIVE {name}: {detail}")
    fails.append(name + " (INCONCLUSIVE — could not run, which is not a pass)")


def declare_not_comparable(name, detail):
    """The comparison does not EXIST (an out-of-scope boundary), as opposed to existing and not
    having been run. Reported, listed in the summary, never counted as agreement."""
    print(f"  DECLARED NOT COMPARABLE  {name}: {detail}")
    declared.append(name)


oz.require_x86_64()
fn, va, slide = oz.local_fn(FW, SYM, CMVideoDimensions, [ctypes.c_void_p])
print(f"{FW} slide=0x{slide:x}  vmaddr=0x{va:x}")
check("address", va == ADDR, f"0x{va:x} == the port's @0x{ADDR:x}")

ENTRY = bytes([0x55, 0x48, 0x89, 0xE5, 0x48, 0x8B, 0x7F, 0x08, 0x5D, 0xE9])
body = ctypes.string_at(slide + va, 10)
print("  entry bytes: " + " ".join(f"{b:02x}" for b in body))
check("entry bytes: read +0x8, tear the frame down, TAIL-jump", body == ENTRY,
      "55 | 48 89 e5 | 48 8b 7f 08 | 5d | e9 — `movq 0x8(%rdi), %rdi` is the only field access, "
      "and the transfer is e9 (JMP rel32), not e8 (CALL): a tail call, so the callee's "
      "CMVideoDimensions is returned directly to our caller")
check("the byte check can fail", ctypes.string_at(slide + va + 1, 10) != ENTRY,
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")

# ── real CoreMedia format descriptions, one per case ──────────────────────────────────────────
CM = ctypes.CDLL("/System/Library/Frameworks/CoreMedia.framework/CoreMedia")
CM.CMVideoFormatDescriptionCreate.restype = ctypes.c_int32
CM.CMVideoFormatDescriptionCreate.argtypes = [
    ctypes.c_void_p, ctypes.c_uint32, ctypes.c_int32, ctypes.c_int32,
    ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)]
CM.CMVideoFormatDescriptionGetDimensions.restype = CMVideoDimensions
CM.CMVideoFormatDescriptionGetDimensions.argtypes = [ctypes.c_void_p]


def make_format_description(case):
    out = ctypes.c_void_p()
    st = CM.CMVideoFormatDescriptionCreate(None, KCMVIDEOCODECTYPE_H264,
                                           case["width"], case["height"], None,
                                           ctypes.byref(out))
    if st != 0 or not out.value:
        return None, f"CMVideoFormatDescriptionCreate returned OSStatus {st}"
    return out.value, "ok"


def arena_with(fd_ptr):
    """A 0xCD-poisoned receiver with ONLY +0x8 set — the single field @0xe38290 reads."""
    a = (ctypes.c_char * THIS_SIZE)(*([0xCD] * THIS_SIZE))
    ctypes.memmove(ctypes.byref(a, FMT_OFFSET), ctypes.byref(ctypes.c_uint64(fd_ptr)), 8)
    return a


def live(fd_ptr):
    """Call the live thunk on a receiver holding fd_ptr at +0x8. Returns (dims, writes_nothing)."""
    a = arena_with(fd_ptr)
    before = bytes(a)
    got = fn(ctypes.byref(a))
    return got.as_tuple(), bytes(a) == before


fds = {}
for case in CASES:
    fd, why = make_format_description(case)
    if fd is None:
        inconclusive(f"case {case['name']!r}: build a real CMFormatDescription", why)
        continue
    fds[case["name"]] = fd

# ── the differential, per case ────────────────────────────────────────────────────────────────
for case in CASES:
    n = case["name"]
    if n not in fds:
        continue
    expected = (case["width"], case["height"])
    coremedia = CM.CMVideoFormatDescriptionGetDimensions(fds[n]).as_tuple()
    got, unchanged = live(fds[n])
    print(f"  live[{n}] -> {got}   (created {expected}; CoreMedia itself says {coremedia})")
    check(f"case {n!r}: the live thunk returns the format description's dimensions",
          got == coremedia == expected,
          f"@0xe38290 returned {got}; `CMVideoFormatDescriptionGetDimensions` called directly on "
          f"the same object returns {coremedia}; the object was created as {expected} — the field "
          "read at +0x8 and the tail call both executed")
    check(f"case {n!r}: the thunk writes nothing", unchanged,
          f"the 0xCD-poisoned 0x{THIS_SIZE:x}-byte receiver is byte-identical after the call")

# ── FIELD CONTROL: the answer must follow +0x8 ────────────────────────────────────────────────
names = [c["name"] for c in CASES if c["name"] in fds]
if len(names) < 2:
    inconclusive("FIELD CONTROL: the answer follows +0x8",
                 "fewer than two format descriptions could be built")
else:
    moved = []
    for i, n in enumerate(names):
        other = names[(i + 1) % len(names)]
        got, _ = live(fds[other])
        want = next((c["width"], c["height"]) for c in CASES if c["name"] == other)
        moved.append((n, other, got, want))
    check("FIELD CONTROL: the answer follows +0x8",
          all(got == want for _, _, got, want in moved),
          "planting each OTHER case's description at +0x8 of an otherwise identical receiver "
          "changes the answer to that description's dimensions "
          + "; ".join(f"+0x8={o} -> {g}" for _, o, g, _ in moved)
          + " — so the value comes from the field the port cites, not from somewhere else")

    # NEGATIVE CONTROL: the comparison must be able to fail.
    a, b = names[0], names[1]
    got_a, _ = live(fds[a])
    want_b = next((c["width"], c["height"]) for c in CASES if c["name"] == b)
    check("NEGATIVE CONTROL: a wrong expectation is rejected", got_a != want_b,
          f"case {a!r} measured {got_a}, which does NOT equal case {b!r}'s {want_b} — the "
          "equality above is discriminating, not vacuous")

# ── the TypeScript side ───────────────────────────────────────────────────────────────────────
PORT = os.path.join(REPO, "src", "channels", "FFVTDecompressionSession.ts")
DRIVER = """
const [modPath, casesJson] = process.argv.slice(2);
const mod = await import(modPath);
const out = [];
for (const c of JSON.parse(casesJson)) {
  const o = new mod.FFVTDecompressionSession();
  // The SAME case the ctypes arena is built from: a format description at +0x8.
  o.formatDescriptionAt0x8 = { marker: c.name };
  try {
    out.push({ name: c.name, threw: null, ret: o.getFormatDescriptionDimensions() });
  } catch (e) {
    out.push({ name: c.name, threw: String(e && e.message), ret: null });
  }
}
process.stdout.write(JSON.stringify({ results: out }));
"""
drv = os.path.join(HERE, ".ffvt_driver.mts")
open(drv, "w").write(DRIVER)
try:
    p = subprocess.run(["node", "--experimental-strip-types", drv, PORT, json.dumps(CASES)],
                       capture_output=True, text=True, cwd=HERE)
    if p.returncode != 0:
        check("the TS port runs", False, f"node failed: {p.stderr[-600:]}")
    else:
        ts = {r["name"]: r for r in json.loads(p.stdout)["results"]}
        declare_not_comparable(
            "live == port",
            "the live thunk's value comes out of CoreMedia, which the port may not call: "
            "CMVideoFormatDescriptionGetDimensions is a true out-of-scope extern that PRODUCES "
            "the dimensions, so the port raises at that boundary by policy. There is no value to "
            "compare for any case; what IS required of the port is the refusal, checked next")
        bad = [n for n, r in ts.items()
               if not (r["threw"] and "CMVideoFormatDescriptionGetDimensions" in r["threw"]
                       and "0xe38299" in r["threw"])]
        check("the port refuses at the CoreMedia boundary, for every case", not bad,
              "each case throws citing the tail-call site rather than returning dimensions"
              if not bad else f"these cases did not throw as required: {bad}")
finally:
    os.unlink(drv)

print()
if declared:
    print("DECLARED NOT COMPARABLE (an out-of-scope boundary, not an unrun check): "
          + ", ".join(declared))
print("FFVTDecompressionSession::getFormatDescriptionDimensions() @Flexo 0xe38290 — "
      + ("VERIFIED as far as an out-of-scope callee allows: the live thunk was called on real "
         "CoreMedia format descriptions and returned exactly their dimensions for every case, the "
         "answer follows +0x8 when the field is repointed (so the offset is measured, not "
         "asserted), the receiver is untouched, the entry bytes confirm a TAIL jump rather than a "
         "call, and the port is required to refuse at the CoreMedia boundary instead of inventing "
         "a size."
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
