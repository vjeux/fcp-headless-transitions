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

## What each doc's "Algorithm (decoded)" section captures
The **functional algorithm** — per-pixel math as pseudocode/formulas, the param→slot mapping, and
pointers to the checked-in shader-evidence file — i.e. the implementation head-start. (Verbatim
Apple source stays in `engine/src/compositor/filters/evidence/shaders/*.metal` where the repo
already keeps it; docs describe the decoded math, matching the existing `*_RE.md` style.)

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
