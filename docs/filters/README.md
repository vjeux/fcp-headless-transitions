# FCP / Motion Filter Reference (All 141 by corpus usage)

This directory documents **all 141 Apple Motion / Final Cut Pro filters** found across the third-party template corpus (`~/motr-collection`), one Markdown file per filter. Each page explains **what the filter actually does** to the image, lists **only its creative parameters** (with human descriptions, correct types, and the value range observed in the wild), notes the FxPlug plumbing parameters separately, and records the reverse-engineering / implementation status. Filter behavior is distilled from three ground-truth sources where available: this engine's decoded TS filter modules (`engine/src/compositor/filters/*.ts`), the verbatim `Hgc*` Metal shaders checked in under `evidence/shaders/`, and the RE write-ups in `evidence/*.md` — falling back to documented Apple Motion behavior (with an explicit *unverified* flag) when no in-repo evidence exists. See [`../FILTER_UNIVERSE.md`](../FILTER_UNIVERSE.md) for the full inventory and status legend.

*Built from `doc_payload.json` (5365 template files parsed). Parameter types apply Motion-domain corrections over the raw sampled types: `Mix`, `Amount` (0–1), `Opacity`, `Intensity`, `Saturation`, `Softness` are continuous **floats** (never bools); `Angle` / `Twirl` / `Rotation` are **radians**; `Center` / `Position` are **point2D** in Motion's normalized frame space where (0.5, 0.5) is the frame center.*

**Status legend** — ✅ implemented (verified against FCP in the TS engine) · 📄 shader only (verbatim `Hgc*` source checked in, TS port pending) · 🔬 not impl (corpus-exercised; no shader extracted). Current: **26 ✅ · 14 📄 · 102 🔬** (of 141). A handful of entries are third-party plugins / preset templates rather than built-in Apple filters, or descriptions rely on standard Motion knowledge — these are flagged *(unverified)* in-page.

**Decompiled code (ground truth).** Every filter page now ends with a `## Decompiled code (ground truth)` section containing the **actual code Apple shipped**, extracted from the user's licensed FCP install — verbatim `Hgc*` Metal fragment shaders (the per-pixel math) and the ARM64 disassembly of the plug-in's render method (the CPU parameter wiring), plus a parameter→shader-slot mapping *decoded from that disassembly by dataflow*, not paraphrased or invented. 103 of 141 filters have shader-level ground truth; 25 more are Helium-primitive-driven (disassembly + the primitive they construct); the remaining 13 are third-party / preset / CIFilter / OSC / structural entries with no Apple `Hgc*` code, documented as such. See [`RE_PLAN.md`](RE_PLAN.md) for the methodology and [`../../tools/re/`](../../tools/re/) for the regenerator (`gen_decompiled_docs.py`).

## Index

| # | Filter | PAE class | Files | Creative params | Status |
|---|---|---|---|---|---|
| 1 | [Colorize](colorize.md) | `Colorize` | 921 | 5 | ✅ implemented |
| 2 | [Hue/Saturation](hue-saturation.md) | `Hue/Saturation` | 827 | 4 | ✅ implemented |
| 3 | [Gaussian Blur](gaussian-blur.md) | `Gaussian Blur` | 788 | 4 | ✅ implemented |
| 4 | [Prism](prism.md) | `Prism` | 538 | 3 | 🔬 not impl |
| 5 | [Fill](fill.md) | `Fill` | 531 | 4 | ✅ implemented |
| 6 | [Twirl](twirl.md) | `Twirl` | 492 | 4 | 🔬 not impl |
| 7 | [Levels](levels.md) | `Levels` | 382 | 3 | ✅ implemented |
| 8 | [Brightness](brightness.md) | `Brightness` | 259 | 2 | ✅ implemented |
| 9 | [Bump Map](bump-map.md) | `Bump Map` | 257 | 7 | 📄 shader only |
| 10 | [Gradient Blur](gradient-blur.md) | `Gradient Blur` | 235 | 4 | 📄 shader only |
| 11 | [Bad Film](bad-film.md) | `Bad Film` | 231 | 16 | 📄 shader only |
| 12 | [Offset](offset.md) | `Offset` | 228 | 3 | 🔬 not impl |
| 13 | [Disc Warp](disc-warp.md) | `Disc Warp` | 215 | 3 | 🔬 not impl |
| 14 | [Flop](flop.md) | `Flop` | 212 | 2 | ✅ implemented |
| 15 | [Bulge Source](bulge-source.md) | `Bulge Source` | 204 | 4 | 🔬 not impl |
| 16 | [Color Balance](color-balance.md) | `Color Balance` | 196 | 7 | 🔬 not impl |
| 17 | [Directional Blur](directional-blur.md) | `Directional Blur` | 187 | 3 | ✅ implemented |
| 18 | [Channel Blur](channel-blur.md) | `Channel Blur` | 185 | 8 | 🔬 not impl |
| 19 | [Poke](poke.md) | `Poke` | 177 | 4 | 📄 shader only |
| 20 | [Glint](glint.md) | `Glint` | 165 | 11 | 🔬 not impl |
| 21 | [Pixellate](pixellate.md) | `Pixellate` | 162 | 3 | ✅ implemented |
| 22 | [Contrast](contrast.md) | `Contrast` | 136 | 6 | 🔬 not impl |
| 23 | [Earthquake](earthquake.md) | `Earthquake` | 128 | 7 | ✅ implemented |
| 24 | [Add Noise](add-noise.md) | `Add Noise` | 123 | 7 | 📄 shader only |
| 25 | [MinMax](minmax.md) | `MinMax` | 117 | 3 | ✅ implemented |
| 26 | [Underwater](underwater.md) | `Underwater` | 111 | 5 | ✅ implemented |
| 27 | [Bad TV](bad-tv.md) | `Bad TV` | 103 | 9 | ✅ implemented |
| 28 | [Channel Mixer](channel-mixer.md) | `Channel Mixer` | 102 | 8 | ✅ implemented |
| 29 | [Light Rays](light-rays.md) | `Light Rays` | 93 | 5 | 🔬 not impl |
| 30 | [Tint](tint.md) | `Tint` | 85 | 3 | ✅ implemented |
| 31 | [Compound Blur](compound-blur.md) | `Compound Blur` | 83 | 8 | 🔬 not impl |
| 32 | [Threshold](threshold.md) | `Threshold` | 81 | 6 | 📄 shader only |
| 33 | [Glow](glow.md) | `Glow` | 78 | 5 | ✅ implemented |
| 34 | [Variable Blur](variable-blur.md) | `Variable Blur` | 78 | 5 | 🔬 not impl |
| 35 | [Negative](negative.md) | `Negative` | 74 | 1 | 🔬 not impl |
| 36 | [Soft Focus](soft-focus.md) | `Soft Focus` | 73 | 5 | 🔬 not impl |
| 37 | [Defocus](defocus.md) | `Defocus` | 69 | 7 | 📄 shader only |
| 38 | [Luma Keyer](luma-keyer.md) | `Luma Keyer` | 65 | 6 | ✅ implemented |
| 39 | [Color Curves](color-curves.md) | `Color Curves` | 65 | 6 | 🔬 not impl |
| 40 | [Stroke](stroke.md) | `Stroke` | 61 | 14 | 🔬 not impl |
| 41 | [Extrude](extrude.md) | `Extrude` | 60 | 10 | 🔬 not impl |
| 42 | [Zoom Blur](zoom-blur.md) | `Zoom Blur` | 58 | 5 | ✅ implemented |
| 43 | [Unsharp Mask](unsharp-mask.md) | `Unsharp Mask` | 54 | 6 | 🔬 not impl |
| 44 | [Kaleidotile](kaleidotile.md) | `Kaleidotile` | 52 | 5 | 🔬 not impl |
| 45 | [Page Curl](page-curl.md) | `Page Curl` | 50 | 11 | 🔬 not impl |
| 46 | [mCallouts Simple 2](mcallouts-simple-2.md) | `mCallouts Simple 2` | 50 | 5 | 🔬 not impl |
| 47 | [Radial Blur](radial-blur.md) | `Radial Blur` | 49 | 3 | ✅ implemented |
| 48 | [Scrape](scrape.md) | `Scrape` | 48 | 4 | ✅ implemented |
| 49 | [Vignette](vignette.md) | `Vignette` | 48 | 7 | ✅ implemented |
| 50 | [Fisheye](fisheye.md) | `Fisheye` | 41 | 4 | ✅ implemented |
| 51 | [Overdrive](overdrive.md) | `Overdrive` | 37 | 6 | 🔬 not impl |
| 52 | [Wave](wave.md) | `Wave` | 33 | 6 | 🔬 not impl |
| 53 | [Outer Glow](outer-glow.md) | `Outer Glow` | 29 | 8 | 🔬 not impl |
| 54 | [Gradient Colorize](gradient-colorize.md) | `Gradient Colorize` | 26 | 7 | 📄 shader only |
| 55 | [Trails](trails.md) | `Trails` | 25 | 5 | 🔬 not impl |
| 56 | [Indent](indent.md) | `Indent` | 24 | 15 | 🔬 not impl |
| 57 | [Neon](neon.md) | `Neon` | 23 | 6 | 🔬 not impl |
| 58 | [Keyer](keyer.md) | `Keyer` | 22 | 9 | 🔬 not impl |
| 59 | [Simple Border](simple-border.md) | `Simple Border` | 22 | 4 | 🔬 not impl |
| 60 | [Line Art](line-art.md) | `Line Art` | 21 | 6 | 🔬 not impl |
| 61 | [Circle Blur](circle-blur.md) | `Circle Blur` | 19 | 4 | 🔬 not impl |
| 62 | [Sharpen](sharpen.md) | `Sharpen` | 19 | 3 | 📄 shader only |
| 63 | [Refraction](refraction.md) | `Refraction` | 19 | 5 | 🔬 not impl |
| 64 | [Bloom](bloom.md) | `Bloom` | 18 | 6 | ✅ implemented |
| 65 | [Dazzle](dazzle.md) | `Dazzle` | 18 | 6 | 🔬 not impl |
| 66 | [Stripes](stripes.md) | `Stripes` | 17 | 4 | 🔬 not impl |
| 67 | [Fun House](fun-house.md) | `Fun House` | 17 | 5 | 🔬 not impl |
| 68 | [Halftone](halftone.md) | `Halftone` | 17 | 5 | 🔬 not impl |
| 69 | [Gamma](gamma.md) | `Gamma` | 17 | 2 | 🔬 not impl |
| 70 | [Aura](aura.md) | `Aura` | 16 | 4 | 🔬 not impl |
| 71 | [Sphere](sphere.md) | `Sphere` | 16 | 3 | 🔬 not impl |
| 72 | [Tile](tile.md) | `Tile` | 16 | 6 | 🔬 not impl |
| 73 | [OpenEXR Tone Map](openexr-tone-map.md) | `OpenEXR Tone Map` | 16 | 5 | 🔬 not impl |
| 74 | [Crystallize](crystallize.md) | `Crystallize` | 14 | 6 | 🔬 not impl |
| 75 | [Mirror](mirror.md) | `Mirror` | 14 | 4 | 🔬 not impl |
| 76 | [Comic](comic.md) | `Comic` | 14 | 10 | 🔬 not impl |
| 77 | [Hatched Screen](hatched-screen.md) | `Hatched Screen` | 11 | 7 | 🔬 not impl |
| 78 | [Black Hole](black-hole.md) | `Black Hole` | 11 | 3 | ✅ implemented |
| 79 | [Relief](relief.md) | `Relief` | 11 | 8 | 🔬 not impl |
| 80 | [Insect Eye](insect-eye.md) | `Insect Eye` | 10 | 5 | 📄 shader only |
| 81 | [Polar](polar.md) | `Polar` | 10 | 3 | 🔬 not impl |
| 82 | [Noir](noir.md) | `Noir` | 9 | 1 | 🔬 not impl |
| 83 | [Gloom](gloom.md) | `Gloom` | 9 | 3 | 🔬 not impl |
| 84 | [Sepia](sepia.md) | `Sepia` | 8 | 2 | 🔬 not impl |
| 85 | [Droplet](droplet.md) | `Droplet` | 8 | 5 | 🔬 not impl |
| 86 | [Glass Block](glass-block.md) | `Glass Block` | 7 | 5 | 🔬 not impl |
| 87 | [PAETarget](paetarget.md) | `PAETarget` | 6 | 3 | 📄 shader only |
| 88 | [Ripple](ripple.md) | `Ripple` | 5 | 3 | 🔬 not impl |
| 89 | [Sliced Scale](sliced-scale.md) | `Sliced Scale` | 5 | 9 | 🔬 not impl |
| 90 | [Highpass](highpass.md) | `Highpass` | 5 | 3 | 📄 shader only |
| 91 | [Spill Suppression](spill-suppression.md) | `Spill Suppression` | 5 | 3 | 🔬 not impl |
| 92 | [Perspective Tile](perspective-tile.md) | `Perspective Tile` | 5 | 7 | 🔬 not impl |
| 93 | [Matte Magic](matte-magic.md) | `Matte Magic` | 5 | 5 | 🔬 not impl |
| 94 | [Line Screen](line-screen.md) | `Line Screen` | 5 | 7 | 📄 shader only |
| 95 | [Tiny Planet](tiny-planet.md) | `Tiny Planet` | 5 | 6 | 🔬 not impl |
| 96 | [Echo](echo.md) | `Echo` | 4 | 5 | 🔬 not impl |
| 97 | [Color Wheels](color-wheels.md) | `Color Wheels` | 4 | 8 | 🔬 not impl |
| 98 | [Bleach](bleach.md) | `Bleach` | 4 | 1 | 🔬 not impl |
| 99 | [Wavy Screen](wavy-screen.md) | `Wavy Screen` | 4 | 5 | 🔬 not impl |
| 100 | [360° Reorient](360-reorient.md) | `360° Reorient` | 4 | 4 | ✅ implemented |
| 101 | [Chrome](chrome.md) | `Chrome` | 4 | 1 | 🔬 not impl |
| 102 | [Color Emboss](color-emboss.md) | `Color Emboss` | 3 | 3 | 🔬 not impl |
| 103 | [NoiseDither](noisedither.md) | `NoiseDither` | 3 | 2 | 🔬 not impl |
| 104 | [Sixties](sixties.md) | `Sixties` | 3 | 1 | 🔬 not impl |
| 105 | [Mono](mono.md) | `Mono` | 3 | 1 | 🔬 not impl |
| 106 | [Texture Screen](texture-screen.md) | `Texture Screen` | 3 | 11 | 🔬 not impl |
| 107 | [Scrub](scrub.md) | `Scrub` | 3 | 4 | 🔬 not impl |
| 108 | [PAEColorReduce](paecolorreduce.md) | `PAEColorReduce` | 3 | 8 | 📄 shader only |
| 109 | [Fade](fade.md) | `Fade` | 3 | 1 | 🔬 not impl |
| 110 | [Angle OSC](angle-osc.md) | `Angle OSC` | 3 | 5 | 🔬 not impl |
| 111 | [Glass Distortion](glass-distortion.md) | `Glass Distortion` | 3 | 8 | 🔬 not impl |
| 112 | [Posterize](posterize.md) | `Posterize` | 2 | 2 | 🔬 not impl |
| 113 | [Slit Tunnel](slit-tunnel.md) | `Slit Tunnel` | 2 | 5 | 🔬 not impl |
| 114 | [Hue/Saturation Curves](hue-saturation-curves.md) | `Hue/Saturation Curves` | 2 | 8 | 🔬 not impl |
| 115 | [Edges](edges.md) | `Edges` | 2 | 2 | 🔬 not impl |
| 116 | [Transfer](transfer.md) | `Transfer` | 2 | 1 | 🔬 not impl |
| 117 | [Custom LUT](custom-lut.md) | `Custom LUT` | 2 | 3 | 🔬 not impl |
| 118 | [Starburst](starburst.md) | `Starburst` | 2 | 3 | 🔬 not impl |
| 119 | [WideTime](widetime.md) | `WideTime` | 2 | 4 | 🔬 not impl |
| 120 | [Cool](cool.md) | `Cool` | 2 | 1 | 🔬 not impl |
| 121 | [Ring Lens](ring-lens.md) | `Ring Lens` | 2 | 5 | 🔬 not impl |
| 122 | [FxPlugHanging::FxPlug Name](fxplughanging-fxplug-name.md) | `FxPlugHanging::FxPlug Name` | 1 | 2 | 🔬 not impl |
| 123 | [CorridorKey by LateNite](corridorkey-by-latenite.md) | `CorridorKey by LateNite` | 1 | 9 | 🔬 not impl |
| 124 | [Gyroflow Toolbox](gyroflow-toolbox.md) | `Gyroflow Toolbox` | 1 | 9 | 🔬 not impl |
| 125 | [Rounded · KF](rounded-kf.md) | `Rounded · KF` | 1 | 1 | 🔬 not impl |
| 126 | [Magic Move · KF](magic-move-kf.md) | `Magic Move · KF` | 1 | 1 | 🔬 not impl |
| 127 | [Canvas · KF](canvas-kf.md) | `Canvas · KF` | 1 | 1 | 🔬 not impl |
| 128 | [Glow · KF](glow-kf.md) | `Glow · KF` | 1 | 1 | 🔬 not impl |
| 129 | [Lumakey](lumakey.md) | `Lumakey` | 1 | 1 | 🔬 not impl |
| 130 | [Tonal](tonal.md) | `Tonal` | 1 | 1 | 🔬 not impl |
| 131 | [Process](process.md) | `Process` | 1 | 1 | 🔬 not impl |
| 132 | [PAECircleScreen](paecirclescreen.md) | `PAECircleScreen` | 1 | 4 | 🔬 not impl |
| 133 | [PAECICISharpenLuminance](paecicisharpenluminance.md) | `PAECICISharpenLuminance` | 1 | 2 | 🔬 not impl |
| 134 | [PAECICIMotionBlur](paecicimotionblur.md) | `PAECICIMotionBlur` | 1 | 3 | 🔬 not impl |
| 135 | [Parallelogram Tile](parallelogram-tile.md) | `Parallelogram Tile` | 1 | 5 | 🔬 not impl |
| 136 | [PAEYUVAdjust](paeyuvadjust.md) | `PAEYUVAdjust` | 1 | 1 | 🔬 not impl |
| 137 | [PAEYIQAdjust](paeyiqadjust.md) | `PAEYIQAdjust` | 1 | 1 | 🔬 not impl |
| 138 | [New York](new-york.md) | `New York` | 1 | 1 | 🔬 not impl |
| 139 | [Source](source.md) | `Source` | 1 | 1 | 🔬 not impl |
| 140 | [Noise Dissolve](noise-dissolve.md) | `Noise Dissolve` | 1 | 3 | 🔬 not impl |
| 141 | [Random Tile](random-tile.md) | `Random Tile` | 1 | 5 | 🔬 not impl |

**Legend:** ✅ implemented in the TS engine · 📄 verbatim shader checked in, not yet implemented · 🔬 corpus-exercised, no shader extracted yet.

## FxPlug plumbing parameters

Every Motion filter carries a set of **host / FxPlug boilerplate parameters** that are *not* creative controls — they are plumbing added by the shared FxPlug base class and the Motion host. The per-filter pages list which ones are present but do not describe them individually; here is the shared explanation once:

| Parameter | What it is |
|---|---|
| `360° Aware` | Whether the filter runs its equirectangular/360-video-aware code path (seam wrapping) rather than the flat path. |
| `Clip to Black` | Clamp/premultiply behavior — clip out-of-range values against black. |
| `Clip to White` | Clamp/premultiply behavior — clip out-of-range values against white. |
| `Crop` | Whether the filtered output is cropped to the working rectangle (vs allowed to bleed past the DOD). |
| `Flip` | Whether the image is Y-flipped in the current render context (Motion's coordinate handedness handshake). Filters read it to keep angles/directions consistent; templates leave it at the context default. |
| `HDR In Rec. 709` | Working-space flag: interpret the input as Rec.709 HDR when computing the effect. Color-management plumbing. |
| `Input Points` | On-screen-control input-point handshake — the OSC anchor points the host passes in. Housekeeping, not a visual knob. |
| `OSC Center` | The on-screen-control center handle position — a UI affordance mirroring the filter's Center param, not an independent control. |
| `Prescale Input` | Whether the host pre-scales the input image before the filter runs (a performance/quality plumbing flag). |
| `Publish OSC` | Whether the filter's on-screen control is published/visible in the inspector. UI-only. |

> When a filter page's *FxPlug plumbing* footer lists parameters like `Flip`, `Input Points`, `Publish OSC`, `Crop`, `360° Aware`, etc., those are the boilerplate above — safe to ignore when reimplementing the creative behavior of the filter.
