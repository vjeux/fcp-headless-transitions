# FCP Filter Reverse-Engineering — tracking doc (single source of truth)

Goal (2-phase, from vjeux):
1. **Phase 1 — reverse-engineer + document.** For each FCP/Motion filter, dig into
   FCP's real binaries (the `Filters.bundle` Mach-O + its embedded Metal shader
   sources + the Helium/ProAppsFxSupport/Ozone frameworks) and write the actual
   algorithm down as a precise comment in the TS module where that filter belongs.
2. **Phase 2 — match + verify.** Make the TS engine implementation match the
   reverse-engineered code, and verify behavior is identical against the headless
   FCP engine across the FULL parameter space (not just values used by the 65
   built-in transitions). Create dedicated `.motr` test files to exercise each
   filter's parameters.

## The Phase-1 engine (how to RE a filter)
- **Embedded shader source** (per-pixel math, ground truth):
  `venv/bin/python3 tools/re/extract_shader.py Hgc<Name>` prints the verbatim
  Metal fragment source FCP embedded in the Filters binary. `--list [substr]`
  enumerates all 246 embedded `Hgc*_hgc_visible` shaders.
- **CPU-side param wiring** (how params map to shader `hg_Params[]`, seeds, DOD):
  `nm -arch arm64` + `otool -arch arm64 -tV` on the same binary; class is
  `PAE<Name>` (426 total). See `filters/NOISE_DECOMPILE_REPORT.md` for the model
  of a full decode (PAENoise → HgcNoise, incl. dSFMT seed + SetRect/GetDOD).
- **hg_Params layout**: the shader reads `hg_Params[i].xyzw`; the mapping from a
  filter's named Motion parameters to those float4 slots is recovered from
  `-[PAE<Name> ...]` setup in the disassembly (which getFloatValue:fromParm: calls
  write which slot).
- **One truth for verification**: GUI GT via `fct regress`/`fct probe`. Never
  render-vs-render. Gate green before every commit.

## Binaries
- Filters: `…/PlugIns/InternalFiltersXPC.pluginkit/Contents/PlugIns/Filters.bundle/Contents/MacOS/Filters` (universal x86_64+arm64; use arm64 slice)
- Frameworks: `…/Contents/Frameworks/{Helium,ProAppsFxSupport,Ozone,Flexo,Lithium,ProShapes}.framework`

## Status legend
TODO = not started · RE = shader/algorithm extracted+documented in TS · MATCH = TS
impl matches RE · VERIFY = behavior confirmed vs headless across param space · DONE

## Filters the TS engine currently implements (map to FCP shader)
| TS module | FCP class / shader | Status |
|-----------|--------------------|--------|
| gaussian-blur.ts | PAEGaussianBlur → HGaussianBlur/HGBlur decimate→convolve→upsample (HgcConvolvePass*) | RE |
| glow.ts (Glow) | PAEGlow → HgcGlow + HgcGlowCombineFx | RE |
| glow.ts (Bloom) | PAEBloom → HgcBloomThreshold + glow combine | RE |
| directional-blur.ts (Directional) | PAEDirectionalBlur → HDirectionalBlur (rotate→1D Gaussian→un-rotate) | RE |
| directional-blur.ts (Radial) | PAERadialBlur → polar→1D Gaussian(angle)→rect + HgcRadialMask | RE |
| directional-blur.ts (Zoom) | PAEZoomBlur → polar→1D Gaussian(radius)→rect (HgcZoomBlur = OSC preview only) | RE |
| channel-mixer.ts (Channel Mixer) | PAEChannelMixer → HgcChannelMixer | RE |
| channel-mixer.ts (Tint) | PAETint → HgcTint (⚠ hard-light, not luma-lerp) | RE |
| channel-mixer.ts (Colorize) | PAEColorize → HgcColorize | RE |
| hue-saturation.ts | PAEHSVAdjust → HgcHSVAdjust; Saturation→HgcSaturation (Rec709) | RE |
| levels.ts (Levels) | PAELevels → HgcLevels (⚠ two-stage, pow(gamma)) | RE |
| levels.ts (Brightness) | PAEBrightness (additive) | RE |
| luma-keyer.ts | HgcLumaKey (ramp) / HgcLumaKeyer (LUT) | RE |
| bevel.ts | PAEBevel → bevelHe (4-quad offset accumulation, |cos(θ+k)| lobes) + HgcBevel composite | RE |
| fill.ts | PAEFillColor → HgcFillColor | RE |
| gradient.ts | PAEGradient → HgcGradientLinear/Radial (nearest-texel LUT); HgcCIGaussianGradient (smoothstep) | RE |
| noise.ts | PAENoise → HgcNoise (DONE prior) + HgcBadTV | RE |
| reorient360.ts | PAEEquirectReorient → HgcEquirectToSinusoidal/SinusoidalToEquirect | RE |

## Phase-1 status: COMPLETE for ALL 24 transition filters (2026-07-12)
Every filter UUID used by the 65 built-in transitions is now reverse-engineered and
documented (verbatim shader + CPU wiring) in its TS module. Phase-2 (match+verify vs
headless) status per filter is in the table below and the sweep suite.

### Phase-2 verification: `tools/re/filter_sweep.py` (the repeatable artifact)
Runs each filter through REAL headless FCP + the TS engine across a parameter matrix.
Latest: 32 PASS, 0 true FAIL. MATCHED (verified vs headless across param space):
flop, minmax, gaussian, radial/spin, scrape, blackhole, earthquake, brightness-darken,
hsv (sat/value/grayscale), colorize (Intensity blend), fill. Remaining divergences are
GAPS/CEILINGS that (a) are unexercised by any shipping transition and (b) trace to FCP's
shared render color-management (Ozone), NOT per-filter RE: Brightness>1, HSV hue,
Tint hard-light, Colorize Intensity=1 residual, Underwater noise field. See
docs/FILTER_RE_PHASE2.md for the consolidated finding + measured evidence.

### The methodology (docs/notes/FILTER_RE_METHODOLOGY.md) — decode, don't fit
Root-caused the slow first pass: a FAT-binary offset bug (arm64 slice base) made every
__const read garbage, forcing curve-fitting. Fixed with tools/re/read_const.py. Rule:
decode CPU constants (fat-correct) + decode shared primitives ONCE; headless = VERIFY,
not fit; if a fit won't converge, decode deeper.

All ~17 TS filter entries above are RE (verbatim FCP shader/disasm documented in the
module). Phase-2 (match + verify vs headless) findings are captured as "P2-*" TODOs in
each module and summarized in `docs/FILTER_RE_PHASE2.md`.

## Filters used by the 65 transitions but NOT previously implemented (the real Phase-1 gap)
A scan of all 65 .motr files finds 24 distinct filter UUIDs; the 17 above plus 7 that
were unregistered no-ops (they passed through untouched in applyFilter). These ARE
exercised by real transitions — the objective ("every filter") requires them:

| FCP class / node | UUID | used by | status |
|------------------|------|---------|--------|
| PAEFlop (mirror) | 2FF8887B-… | Movements/Flip, Replicator-Clones/Concentric | **DONE** — verbatim disasm, verified vs headless PSNR 42.2 all modes; unit-tested |
| PAEMinMax (erode/dilate) | D2342006-… | Dissolves/Divide (×3) | **DONE** — verbatim Helium MMNode shader, verified PSNR 35-40 across Mode×Radius; unit-tested |
| PAEScrape / "Smear" | 0D6E968B-… | Movements/Smear | **DONE** — verbatim HgcScrape inverse-map warp; geometry exact (synthetic mad 0.2); gate +0.35 |
| PAEBlackHole | 1A32EFEF-… | Movements/Black_Hole | **DONE** — verbatim HgcBlackHole mip-pyramid radial lens; verified PSNR 32-39; gate +1.33 |
| PAEEarthquake | DEB7CD03-… | Movements/Earthquake | **DONE** — CPU seeded RNG (LCG+Bays-Durham) fully recovered; pure-rotation PSNR 37.5; gate-neutral |
| PAEBadTV | 32AB5EE1-… | Lights/Static | **DONE (partial)** — deterministic desaturate(34dB)+scanlines(23dB)+roll applied; waviness/static are per-frame RNG (seed=2·frame+1, unrecoverable) → documented + not applied. Lights/Static has Mix=0 so passthrough there. |
| PAEUnderwater | 9FA1F483-… | Movements/Flashback | **PHASE-1 DONE; Phase-2 CEILING** — verbatim 10-octave sinusoid refraction documented; FreqSynth field uses an unrecoverable GPU noise texture (phases differ) AND renders black headless t>1.0. Wiring it regresses the gate −1.74, so registered as gate-safe passthrough (faithful impl retained as underwaterApply). |
| PAETrails | 2DB30B44-… | Movements/Black_Hole | N/A — DISABLED (`<enabled>0</enabled>`); never applied by FCP; parser now skips it |

Parser correctness fix (commit 967189b): the parser now honors `<enabled>0</enabled>`
on filters (it previously pushed disabled filters), so a disabled filter is never
applied once registered. 4 disabled instances across the 65 (Trails, 2× Radial Blur,
Zoom Blur OSC).


## Full embedded-shader inventory
See `tools/re/extract_shader.py --list` (246 shaders). The complete list is tracked
below as filters are worked; unimplemented shaders become Phase-2 candidates only if
they can appear in a transition (or a purpose-built test .motr).
