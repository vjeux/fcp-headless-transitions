# FCP Transition Benchmark Scoreboard

Mean PSNR of the TypeScript engine vs headless Final Cut Pro ground truth, over up to **24 frames** per transition (progress `i/23`, `i=0..23`). Engine output is conformed to GT native 1920×1080. Source images: `images/start.jpg` / `images/end.jpg`. Sorted by PSNR ascending (worst first). 360° transitions render at 4K-equirect native (~30–50s/frame in JS), so they are scored on 3 evenly-spaced progress points (0, 0.5, 1.0) rather than all 24 (noted in the Sampled column).

- **Mean PSNR:** 19.20 dB across 65 scored transitions
- **Pass (>30 dB):** 11
- **Partial (20–30 dB):** 7
- **Fail (<20 dB):** 47

| # | Transition | Mean PSNR (dB) | Frames | Sampled | Bucket |
|---|------------|---------------:|-------:|--------:|--------|
| 1 | Stylized__Center | 4.01 | 24 | 24 | fail |
| 2 | Replicator-Clones__3D_Rectangle | 6.75 | 24 | 24 | fail |
| 3 | Dissolves__Divide | 7.54 | 24 | 24 | fail |
| 4 | Replicator-Clones__Video_Wall | 8.40 | 24 | 24 | fail |
| 5 | Stylized__Light_Sweep | 8.66 | 24 | 24 | fail |
| 6 | Replicator-Clones__Clone_Spin | 8.74 | 24 | 24 | fail |
| 7 | Movements__Reflection | 8.84 | 24 | 24 | fail |
| 8 | 360°__360°_Bloom | 9.40 | 24 | 3 | fail |
| 9 | Movements__Drop_In | 9.41 | 24 | 24 | fail |
| 10 | Lights__Light_Noise | 9.42 | 24 | 24 | fail |
| 11 | Stylized__Panels_Across | 9.45 | 24 | 24 | fail |
| 12 | Replicator-Clones__Multi | 9.79 | 24 | 24 | fail |
| 13 | 360°__360°_Push | 9.82 | 24 | 3 | fail |
| 14 | 360°__360°_Slide | 9.82 | 24 | 3 | fail |
| 15 | Movements__Switch | 9.84 | 24 | 24 | fail |
| 16 | Movements__Smear | 9.95 | 24 | 24 | fail |
| 17 | 360°__360°_Wipe | 10.19 | 24 | 3 | fail |
| 18 | 360°__360°_Circle_Wipe | 10.23 | 24 | 3 | fail |
| 19 | 360°__360°_Reveal_Wipe | 10.23 | 24 | 3 | fail |
| 20 | 360°__360°_Divide | 10.40 | 24 | 3 | fail |
| 21 | Movements__Color_Planes | 10.42 | 24 | 24 | fail |
| 22 | 360°__360°_Gaussian_Blur | 10.49 | 24 | 3 | fail |
| 23 | Objects__Squares | 10.57 | 24 | 24 | fail |
| 24 | Lights__Flash | 11.01 | 24 | 24 | fail |
| 25 | Stylized__Color_Panels | 11.70 | 24 | 24 | fail |
| 26 | Replicator-Clones__Combo_Spin | 12.10 | 24 | 24 | fail |
| 27 | Replicator-Clones__Concentric | 12.57 | 24 | 24 | fail |
| 28 | Objects__Leaves | 12.97 | 24 | 24 | fail |
| 29 | Objects__Veil | 13.76 | 24 | 24 | fail |
| 30 | Stylized__Lower | 13.85 | 24 | 24 | fail |
| 31 | Movements__Scale | 13.98 | 24 | 24 | fail |
| 32 | Stylized__Slide | 14.08 | 24 | 24 | fail |
| 33 | Stylized__Close_and_Open | 14.18 | 24 | 24 | fail |
| 34 | Wipes__Diagonal | 15.22 | 24 | 24 | fail |
| 35 | Movements__Flip | 15.60 | 24 | 24 | fail |
| 36 | Movements__Swing | 15.83 | 24 | 24 | fail |
| 37 | Lights__Lens_Flare | 16.12 | 24 | 24 | fail |
| 38 | Stylized__Glide | 16.16 | 24 | 24 | fail |
| 39 | Objects__Arrows | 16.47 | 24 | 24 | fail |
| 40 | Objects__Curtains | 16.57 | 24 | 24 | fail |
| 41 | Movements__Multi-flip | 17.06 | 24 | 24 | fail |
| 42 | Lights__Static | 18.21 | 24 | 24 | fail |
| 43 | Replicator-Clones__Vertigo | 18.66 | 24 | 24 | fail |
| 44 | Replicator-Clones__Duplicate | 19.46 | 24 | 24 | fail |
| 45 | Movements__Fall | 19.69 | 24 | 24 | fail |
| 46 | Stylized__Diagonal | 19.84 | 24 | 24 | fail |
| 47 | Stylized__Up-Over | 19.92 | 24 | 24 | fail |
| 48 | Stylized__Heart | 20.78 | 24 | 24 | partial |
| 49 | Stylized__Panels_Random | 21.59 | 24 | 24 | partial |
| 50 | Movements__Pinwheel | 23.35 | 24 | 3 | partial |
| 51 | Stylized__Loop | 23.95 | 24 | 24 | partial |
| 52 | Movements__Clothesline | 24.34 | 24 | 24 | partial |
| 53 | Movements__Rotate | 24.45 | 24 | 3 | partial |
| 54 | Movements__Earthquake | 27.63 | 24 | 24 | partial |
| 55 | Movements__Push | 31.96 | 24 | 24 | pass |
| 56 | Movements__Flashback | 39.68 | 24 | 24 | pass |
| 57 | Stylized__Center_Reveal | 40.59 | 24 | 24 | pass |
| 58 | Wipes__Mask | 42.32 | 24 | 24 | pass |
| 59 | Blurs__Zoom | 45.71 | 24 | 24 | pass |
| 60 | Blurs__Directional | 47.86 | 24 | 24 | pass |
| 61 | Blurs__Gaussian | 47.86 | 24 | 24 | pass |
| 62 | Blurs__Radial | 47.86 | 24 | 24 | pass |
| 63 | Movements__Black_Hole | 50.19 | 24 | 24 | pass |
| 64 | Lights__Bloom | 50.20 | 24 | 24 | pass |
| 65 | Stylized__Slide_In | 50.20 | 24 | 24 | pass |
