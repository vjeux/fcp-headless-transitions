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
| gaussian-blur.ts | PAEGaussianBlur → (HGBlur decimation + HgcChannelBlur/convolve) | TODO |
| glow.ts (Glow) | PAEGlow → HgcGlow + HgcGlowCombineFx | TODO |
| glow.ts (Bloom) | PAEBloom → HgcBloomThreshold + glow combine | TODO |
| directional-blur.ts (Directional) | PAEDirectionalBlur → HgcChannelBlur (angled) | TODO |
| directional-blur.ts (Radial) | PAERadialBlur → Hgc? | TODO |
| directional-blur.ts (Zoom) | PAEZoomBlur → HgcZoomBlur | TODO |
| channel-mixer.ts (Channel Mixer) | PAEChannelMixer → HgcChannelMixer | TODO |
| channel-mixer.ts (Tint) | PAETint? → HgcTint | TODO |
| channel-mixer.ts (Colorize) | PAEColorize → HgcColorize | TODO |
| hue-saturation.ts | PAEHSVAdjust → HgcHSVAdjust / HgcSaturation | TODO |
| levels.ts (Levels) | PAELevels → HgcLevels | TODO |
| levels.ts (Brightness) | PAEBrightness → Hgc? | TODO |
| luma-keyer.ts | PAE? → HgcLumaKeyer / HgcLumaKey | TODO |
| bevel.ts | PAEBevel → HgcBevel | TODO |
| fill.ts | PAE? → HgcFillColor | TODO |
| gradient.ts | PAE? → HgcGradientLinear/Radial | TODO |
| noise.ts | PAENoise → HgcNoise (DONE prior) + HgcBadTV | RE (noise) |
| reorient360.ts | PAEEquirectReorient → HgcEquirectToSinusoidal/SinusoidalToEquirect | TODO |

## Full embedded-shader inventory
See `tools/re/extract_shader.py --list` (246 shaders). The complete list is tracked
below as filters are worked; unimplemented shaders become Phase-2 candidates only if
they can appear in a transition (or a purpose-built test .motr).
