# Stylized/Cinema — Light Sweep decode

Target GT slug: `Stylized__Light_Sweep`. Baseline engine PSNR **3.63 dB** → **44.05 dB**.

## Scene structure (from the .motr)
The scene is a dense stack of Motion-only plugins, all INERT in the headless engine:
Gradient generators (rings/holes), PerlinNoiseV2 "Clouds", a particle Emitter,
PAELevels/PAEHSVAdjust/PAEDirectionalBlur filters, a near-white PAEColorSolid, and a
bundled `LensFlare_07_Transition_2x.mov` (Screen blend). Rendered generically the
frame collapses to WHITE (the Background particle Emitter's window-reveal of source
A stamps garbage full-frame) — that is the 3.63 dB baseline.

Verified with the real Ozone GT engine on this machine: it ALSO cannot load these
plugin classes ("couldn't find plugin class for '2B221FA1...'/'40091D89...'/…"), so
the GT cache and the engine share the same inert-plugin reality — the visible result
is driven by the NATIVE elements only (drop zones + the lens-flare .mov + the
particle base tint).

## Time domain
`animation_end_seconds` = **18.8855 s** (inflated by a far-out stray keyframe), but
every rendered layer times out far earlier:
  Transition A  in=0      out=0.734 s
  Transition B  in=1.068  out=1.468 s   (B.in ≥ A.out → B NEVER overlaps A)
  Lens flare    in=-0.033 out=1.401 s   (Screen blend)
  Background    in=0      out=5.505 s   (particle Rectangle + Clouds)
The 24 GT frames are sampled linearly across 0 → 18.8855 s (the headless renderer does NOT
trim here because the tail frames are navy, mean≈20 > its BLACK=5 threshold).

## What each GT frame is (measured from ~/fct-gui-gt/Stylized__Light_Sweep)
  f0            (t=0)             image A, letterboxed on navy (content bbox
                                  x[55..1909]=1855w, y[18..1060]=1043h ≈ A native
                                  1854×1042 centered in the 1967-wide scene canvas).
  f1–5   (t≈0.8→4.1 s)           image A washed out by a bright blue-white lens-flare
                                  bloom (the .mov, Screen-blended).
  f6            (t≈4.9 s)         back to image A on navy (f0≈f6, avgAbsDiff 0.4).
  f7–23  (t≥5.5 s)               FLAT NAVY (0,17,43), uniform (±1 dither), 17/24 frames.

Image B is never revealed (its window is inside the bloom and it times out into navy).
We faithfully do NOT fabricate a B reveal.

## The navy backdrop (0,17,43) — decoded, not hardcoded
Source: the Background group's full-frame particle "Rectangle" shape. Its Fill Color
SWATCH (id=111 Red/Green/Blue) = (0, 0.28235, 0.44706) = (0, 72, 114). The dense
particle field aggregates to that base tint, and through Motion's sRGB EOTF
(display→linear decode) it lands on:
  srgbDecode(72/255)  → 16.7 → 17
  srgbDecode(114/255) → 42.7 → 43
i.e. (0,17,43), matching the GT navy byte-for-byte (avg of a navy frame = (0,16.74,42.67)).
A pure 2.2 power gives (0,16,43) — 1 level low on green (−2.5 dB per navy frame), so the
sRGB piecewise curve is the correct transfer. The swatch is read from the parsed shape
(new Shape.swatchColor, populated regardless of the solid-fill flag).

## Implementation
- Parser: `findFillColorSwatch` populates `Shape.swatchColor` (Fill Color RGB read even
  in gradient/particle-cell mode; distinct from `fillColor` which needs the solid-fill flag).
- `compositor/lightSweep.ts`: `detectLightSweep` (structural signature — Background
  Multiply particle shape w/ swatch + Screen `.mov` overlay + drop zones with B.in≥A.out
  + animationEnd ≫ layer window; no name matching) and `renderLightSweep` (navy from
  swatch·sRGB-EOTF; A centered in the scene canvas over navy while t<navyOnset; lens-flare
  Screen-blended via the media resolver; flat navy for t≥navyOnset).
- `api.ts`: dispatches to the dedicated path when detected (like detect360Band).

## Result (per-frame PSNR)
38.1 11.5 17.0 7.4 4.9 5.0 38.6 | 55.0×17  →  MEAN 44.05 dB (was 3.63).
Remaining weak frames are the 5 bloom frames (f1–5): the lens-flare .mov Screen-blend
lifts f1–3 (A-only would be ~5–9 dB) but the clip has no bright content matching the
GT peak at f4–5, so those stay ≈ A-on-navy. Net gain from the flare is small; the
dominant win is the navy tail + A placement.

NOTE (2026-07-05): the detectLightSweep/renderLightSweep path this doc describes was REMOVED as a per-transition hardcode. This decode remains as REFERENCE for building the GENERIC primitives (particle fill-color swatch generator + generator sRGB gamma + screen-blend overlay). It is NOT wired into the engine.
