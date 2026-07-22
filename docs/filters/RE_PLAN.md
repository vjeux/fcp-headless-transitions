# Filter Reverse-Engineering Plan & Tracker

Goal: decode the real FCP per-pixel algorithm + parameter→behavior mapping for every one of the
141 corpus filters, and write it into each filter's doc as an **Algorithm (decoded)** section so
the TS engine implementation gets a head start. Follows `docs/notes/FILTER_RE_METHODOLOGY.md`
(**DECODE the constants, do not FIT them**).

## Sources (all from the user's licensed FCP install, for building an interoperable renderer)
- **Embedded Metal shaders** — `tools/re/extract_shader.py Hgc<Name>` prints the verbatim
  per-pixel source FCP embeds as a C-string. 246 `Hgc*` shaders available.
- **PAE class disasm** — `otool -arch arm64 -tV` on `-[PAE<Name> canThrowRenderOutput:...]` /
  `frameSetup:` recovers how UI params map to the shader's `hg_Params[i]` slots. 362 PAE classes.
- **Helium / ProAppsFxSupport** — named primitives (HGaussianBlur, HGLinearFilter::gaussian, …)
  the shaders delegate to; decode once, reuse across the blur family.

## What each doc's RE section captures
**The verbatim extracted shader is the ground truth.** Each shader-backed filter's doc has a
`## Ground-truth shader source` section that points to the checked-in
`engine/src/compositor/filters/evidence/shaders/<Hgc*>.metal` (the single authoritative copy,
regenerable with `extract_shader.py`) and says: implement against that file. Any prose beneath is
clearly labelled **"Decoded notes (annotation — verify against the shader)"**, never a substitute
for the real source.

Filters with **no dedicated `Hgc*` shader** (PAE-only: blurs delegating to Helium `HGBlur`, CPU
color ops, CIFilter wrappers) get a `## Algorithm — NOT YET REVERSE-ENGINEERED` section that is
honest about this: it gives the exact disasm command to recover the real math and marks any
inferred sketch **UNVERIFIED — do not implement as-is**. No invented algorithm is presented as
decoded fact.

## Categories (by RE tractability)
- **Shader-backed (64):** clearest — extract shader, decode `hg_Params`, write math.
- **PAE-class only (56):** no dedicated shader (delegate to Helium primitives or CPU warp);
  decode from disasm + the primitive it calls.
- **Non-RE-able (21):** 3rd-party plugins (Gyroflow, CorridorKey), preset templates (`· KF`,
  mCallouts), CIFilter wrappers (Motion Blur, Sharpen Luminance), or dangling records — documented
  as such, no Apple algorithm to decode.

## Order
Usage-descending, shader-backed first. Progress tracked in `RE_STATUS.md` (generated).

## Status legend (per filter doc)
- 🟢 RE-decoded — algorithm + param mapping written from shader/disasm
- 🔵 primitive-decoded — delegates to an already-decoded Helium primitive (blur family etc.)
- ⚪ pending
- 🚫 non-RE-able (3rd-party/preset/CIFilter) — noted, skipped
