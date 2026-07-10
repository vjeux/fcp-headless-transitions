# Renderer contract

Both renderers in this repo — the **headless** FCP engine (`tools/ozengine.py` +
`oz_render.mm`, driving FCP's real Motion/Ozone engine) and the **TS engine**
(`engine/`, our from-scratch reimplementation) — implement the SAME contract so
their frames are directly comparable against the one canonical reference
(`~/fct-gui-gt/`, FCP GUI ground truth). Item 5 of the ROADMAP defined this.

## The contract

A renderer is a pure function:

```
render(motr, imageA, imageB, timeSec) -> frame
```

- **`motr`** — the parsed `.motr` transition (its scene graph + settings).
- **`imageA`, `imageB`** — the two source images (RGBA). A = outgoing, B = incoming.
- **`timeSec`** — an ABSOLUTE scene time in seconds (0 = transition start).
- **`frame`** — the composited output, **1920×1080 RGBA, sRGB**.

Rules:

1. **Output is always 1920×1080 RGBA sRGB.** A renderer that works in a larger
   native canvas (absolute-coordinate masks, 4K equirect drop zones) resamples down
   to 1920×1080 before returning. Color is emitted in sRGB.

2. **The harness owns color conforming, not the renderer.** `fct score` /
   `fct regress` color-conform each source to bt709 (per-source gains in
   `fct/config.py` → `needs_bt709()` / `fct/color.py`) *before* comparing to the GUI
   GT. Renderers must NOT pre-apply a bt709 twist; they emit their native sRGB and
   the scorer aligns color spaces. This keeps "one truth": every source is measured
   against the GUI GT the same way.

3. **Time is sampled identically by both renderers.** A clip of `N` frames covers
   the transition as `N` equal, HALF-OPEN slices. Frame `i` is rendered at

   ```
   timeSec = sample_time(i, N, span)  =  (i / N) * span
   span    = scene_duration_seconds(motr)  =  sceneSettings/duration_frames / frameRate
   ```

   (`fct/timing.py` is the single implementation of `sample_time` / `span`.)
   Frame 0 = pure A; the last frame `N-1` lands INSIDE the transition (near-full B)
   and is NOT nudged to `span` (span is the wrap point back to A). `N = 24` in the
   toolkit (`fct/config.py:N_FRAMES`). Verified on Push seam-fit (RMS 0.0006). This
   replaced the older closed `i/(N-1)` convention, which lagged the back half.

## How each renderer implements it

### Headless (FCP engine)
`fct.gen.gen_headless` calls `timing.sample_time(i, N, span)` directly and hands
that absolute `timeSec` to `oz_render.mm`, which drives FCP's engine at that scene
time. Headless is literally `render(motr, A, B, timeSec)` — the contract is native.

### TS engine
`engine/src/api.ts` `createTransition(motr)` returns a `TransitionFn` with two entry
points that BOTH funnel through one internal `renderInstant(imageA, imageB,
sceneTimeSec)` — the engine's **single time authority** (all retime-wrap,
stroked-mask-clamp, motion-blur, and resolution-conform logic lives there):

- **`renderAt(imageA, imageB, timeSec)`** — the contract entry point. Renders at an
  absolute scene time, exactly like headless. Drive it with
  `renderAt(A, B, sample_time(i, N, span))` to sample the same instant headless does.

- **`render(imageA, imageB, progress)`** — a convenience wrapper equal to
  `renderAt(A, B, progress * animationEndSec)`.

  ⚠️ **`progress` is NOT `i/N` against `span`.** The parser overrides
  `animationEndSec` to each transition's *visual* end (the last animating keyframe /
  layer-out), which for **64 of 65** built-in transitions is EARLIER (sometimes much
  earlier or later) than the authored `span`. So `render(i/N)` samples
  `(i/N) * animationEndSec`, a DIFFERENT scene instant than headless's
  `(i/N) * span` whenever `animationEndSec != span`. `animationEndSec` is an
  intentional, gate-frozen modelling choice (see the extensive parser comments at
  `parseMotr`'s animationEnd walk), not an accident.

  The current toolkit renders the TS engine via `render(i/N)` (see
  `engine/test/_fct_render.ts`), i.e. through the `animationEndSec` remap. `renderAt`
  now exists so a caller can instead address scene time directly and sample the
  exact instant headless uses, without disturbing the `render(progress)` behavior the
  engine gate is frozen against.

  `tr.animationEndSec` is exposed on the `TransitionFn` so callers can convert
  between the progress and absolute-time domains.

## Why this matters

"One truth" (ROADMAP rule 1) requires that a frame-`i` comparison between headless
and engine is a comparison at the SAME scene moment — otherwise a low PSNR could be
pure time misalignment rather than a rendering difference. `sample_time` + `span` is
that shared clock; `renderAt` is the TS engine's door onto it.
