# motr-engine — Push transition progress

Generated: 2026-07-04

## Artifacts in this folder
- `push_fcp_groundtruth.mp4` — the **Final Cut Pro** render (real Motion/Ozone engine, headless).
- `push_engine.mp4` — the **new browser TypeScript engine** (`motr-engine`) render of the same transition.
- `push_comparison.mp4` — side-by-side (FCP left, engine right), labeled.
- `push_contact_sheet.png` — static frame grid (frames 0/8/16/24/32/40/49) for quick visual diff.

Source images: `images/start.jpg` (sepia lake) → `images/end.jpg` (blue mountains), 1854×1042, centered 1:1 in 1920×1080.
Transition: built-in FCP **Push**, Direction = "Bottom to Top" (B enters from the top, A slides down and out the bottom).

## Current fidelity
**Mean PSNR: 18.38 dB** over 50 frames (vs. correct ground truth).
- Best frames: f0 = 50.2 dB (pure A), f47/f48 ≈ 32 dB (mostly B).
- Worst frames: the mid-transition boundary frames (f11–f28 ≈ 13 dB) where a sharp
  sepia/blue A–B edge makes any sub-pixel misalignment expensive.

### How this baseline was earned honestly
The previous "37.7 dB Push" was scored against a **broken ground truth**: `render.py`
sampled 0→2.002 s, but Push's real animation ends at **1.6683 s** (last keyframe =
200200/120000). ~15% of the old GT frames were pure **black**, inflating the score.
Regenerated a clean 50-frame GT over the true `[0, 1.6683 s]` domain — frame 0 ≈ A,
frame 49 ≈ B, no black frames.

## What the engine now does correctly (all committed & pushed)
- Skips `<enabled>0</enabled>` driver nodes (Push's hidden "Color Solid").
- **Link behaviors** (factory 7): a layer's position channel is driven by a source
  object's channel × scale, gated by a rig-selected Custom Mix (the ±100 default
  clamp is correctly treated as "unset").
- **Clone Layers**: resolve `Source` (id 300) → mirrored object's image, drawn with transform.
- **Y-down** internal coordinates (verified: clone at Y=−1080 renders at the top).
- Sources placed **1:1 centered** (letterbox), not stretched.
- `progress = 1` maps to the **animation end** (last keyframe), not the padded scene duration.

## Open thread — keyframe easing
The engine's bezier matches an independent solver exactly, but Motion's real easing
is slightly **gentler** than a full time-bezier. Measured on the pure-translation model:
- linear-keyframe displacement: **21.38 dB**
- current time-bezier: 20.12 dB
- normalized-bezier: 20.05 dB

Next step: adopt the gentler easing convention in `src/evaluator/curves.ts` and
re-measure. Remaining fidelity beyond that is sub-pixel boundary anti-aliasing plus a
1px white seam artifact the Ozone compositor emits at the A/B join.

## Repo
github.com/vjeux/fcp-headless-transitions — latest: `0916a80`.
