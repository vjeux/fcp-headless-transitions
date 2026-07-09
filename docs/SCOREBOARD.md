# FCP Transition Benchmark Scoreboard

Mean PSNR of the TypeScript engine (`engine/`, `motr-engine`) vs Final Cut Pro's
**GUI reference** render, per transition.

> ⚠️ **Scores are in flux — this table is a dated snapshot, not the source of truth.**
> Per-transition PSNR moves every time a fix lands (recent work has changed Switch,
> Rotate, Light_Sweep and others). Always read the **live** scoreboard rather than
> trusting numbers copied into docs:
>
> - **Live file:** `~/fct-notes/gui_scoreboard.tsv` (`<slug>  <PSNR>  <black-frame-count>`)
> - **Regenerate:** `~/fct-notes/gui_scoreboard.py` (full 65) / `~/fct-notes/score_slug.py <slug>` (one)
> - **Ground truth:** FCP GUI frames in `~/fct-gui-gt/<slug>/frame_0000..0023.png`;
>   headless GT cache in `~/fct-gt-cache/`.

## Methodology

- Up to **24 frames** per transition, progress `i/N` with the half-open mapping
  `sample_time = i/24 · scene_duration` (matches `tools/slice_gui_gt.py`).
- Engine output conformed to the GT native shape (typically 1920×1080). Source images:
  `images/start.jpg` / `images/end.jpg`.
- Scored on the **corrected time domain** with a near-uniform color model
  (R:1.095/0.977 G:1.070/0.963 B:1.074/0.966) applied *in the scorers*, not in
  `oz_render.mm`. This replaced the earlier headless-vs-headless comparison, whose
  numbers were inflated by a shared off-by-one timing bug and are **no longer valid**.
- **Ceiling:** the FCP GUI reference is ProRes-422 (bt709) compressed, so ~37 dB is the
  practical pixel-perfect ceiling — a transition at ~36 dB is effectively exact.
- The **third column is a black/frozen-frame count** (0 = clean); a few transitions still
  emit genuine content gaps (Multi-flip, Smear, Multi, Flip). 360° transitions render at
  4K-equirect native (~30–50 s/frame), so 360° Push is scored on 3 evenly-spaced points.

## Snapshot — 2026-07-08 (corrected full-65 run)

Source: `~/fct-notes/gui_scoreboard_corrected.tsv` + `~/fct-notes/FINAL_STATE.md`.
Sorted by PSNR ascending (worst first).

- **Overall mean:** 20.10 dB across 65 transitions
- **Pass (>30 dB):** 7 — Mask, Flip, Color_Planes, Directional, Push, Scale, Zoom
- **Partial (20–30 dB):** 14
- **Fail (<20 dB):** 44
- **Pixel-perfect at GT ceiling (~37 dB via the direct color model):** Push 36.63,
  Color_Planes 34.9, Mask 34.3, Flip 33.5

| # | Transition | Mean PSNR (dB) | Black/frozen frames |
|---|------------|---------------:|--------------------:|
| 1 | 360°__360°_Push | 10.91 | 3 |
| 2 | Stylized__Up-Over | 13.13 | 0 |
| 3 | Replicator-Clones__Video_Wall | 13.26 | 0 |
| 4 | Movements__Switch | 13.33 | 0 |
| 5 | Replicator-Clones__Clone_Spin | 13.49 | 0 |
| 6 | 360°__360°_Slide | 13.59 | 0 |
| 7 | Stylized__Light_Sweep | 13.75 | 0 |
| 8 | Movements__Rotate | 14.05 | 0 |
| 9 | Replicator-Clones__Combo_Spin | 14.11 | 0 |
| 10 | Dissolves__Divide | 14.27 | 0 |
| 11 | 360°__360°_Divide | 14.33 | 0 |
| 12 | Objects__Veil | 14.97 | 0 |
| 13 | Movements__Drop_In | 15.11 | 0 |
| 14 | 360°__360°_Wipe | 15.26 | 0 |
| 15 | Stylized__Lower | 15.34 | 0 |
| 16 | Movements__Multi-flip | 15.60 | 2 |
| 17 | Stylized__Center | 15.92 | 0 |
| 18 | Stylized__Color_Panels | 16.09 | 0 |
| 19 | 360°__360°_Bloom | 16.61 | 0 |
| 20 | Objects__Leaves | 16.75 | 0 |
| 21 | Movements__Smear | 16.80 | 0 |
| 22 | Stylized__Slide_In | 16.80 | 0 |
| 23 | Movements__Pinwheel | 17.36 | 0 |
| 24 | Objects__Squares | 17.40 | 0 |
| 25 | Lights__Static | 17.43 | 0 |
| 26 | Lights__Bloom | 17.50 | 0 |
| 27 | Stylized__Center_Reveal | 17.50 | 0 |
| 28 | Stylized__Slide | 17.61 | 0 |
| 29 | Stylized__Glide | 18.27 | 0 |
| 30 | 360°__360°_Reveal_Wipe | 18.39 | 0 |
| 31 | Movements__Clothesline | 18.52 | 0 |
| 32 | Replicator-Clones__Multi | 18.69 | 1 |
| 33 | Objects__Curtains | 18.81 | 0 |
| 34 | Stylized__Diagonal | 18.93 | 0 |
| 35 | Wipes__Diagonal | 18.93 | 0 |
| 36 | Lights__Flash | 19.17 | 0 |
| 37 | Movements__Swing | 19.28 | 0 |
| 38 | 360°__360°_Circle_Wipe | 19.74 | 0 |
| 39 | Movements__Fall | 19.76 | 0 |
| 40 | Movements__Flashback | 19.91 | 0 |
| 41 | Stylized__Close_and_Open | 19.94 | 0 |
| 42 | Objects__Arrows | 20.07 | 0 |
| 43 | Stylized__Heart | 20.55 | 0 |
| 44 | Replicator-Clones__Vertigo | 20.59 | 0 |
| 45 | Movements__Earthquake | 21.05 | 0 |
| 46 | Lights__Lens_Flare | 21.29 | 0 |
| 47 | Stylized__Loop | 21.72 | 0 |
| 48 | Stylized__Panels_Across | 21.76 | 0 |
| 49 | Movements__Black_Hole | 22.96 | 0 |
| 50 | Lights__Light_Noise | 23.89 | 0 |
| 51 | Replicator-Clones__Duplicate | 23.93 | 0 |
| 52 | Replicator-Clones__Concentric | 26.34 | 0 |
| 53 | Blurs__Radial | 26.46 | 0 |
| 54 | Stylized__Panels_Random | 26.73 | 0 |
| 55 | Movements__Reflection | 26.96 | 0 |
| 56 | Replicator-Clones__3D_Rectangle | 27.14 | 0 |
| 57 | 360°__360°_Gaussian_Blur | 27.93 | 0 |
| 58 | Blurs__Gaussian | 29.86 | 0 |
| 59 | Blurs__Zoom | 30.66 | 0 |
| 60 | Movements__Scale | 30.79 | 0 |
| 61 | Movements__Push | 31.45 | 0 |
| 62 | Blurs__Directional | 31.48 | 0 |
| 63 | Movements__Color_Planes | 31.51 | 0 |
| 64 | Movements__Flip | 31.94 | 1 |
| 65 | Wipes__Mask | 32.85 | 0 |

## Remaining gaps (all structural — no discrete fixable bugs at snapshot time)

- **PMClip headless pipeline unavailable** — blocks replicator cells (~7 slugs) and
  filter pixel-transforms (blurs stuck ~3 dB below ceiling).
- **3D geometry** — Rotate / Reflection / 3D_Rectangle / Switch plateau (~13–27 dB);
  the rig 3D-rotation snapshot geometry differs from FCP (perspective / card-hinge).
- **Procedural content** — Light_Noise / Diagonal / Glide (noise/particle content differs).
- **360° equirect** — front-camera projection missing (3 slugs; 360° Push/Slide/Divide).

For the current worst-first backlog, always read the live `~/fct-notes/gui_scoreboard.tsv`.
