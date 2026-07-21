# FCP / Motion Filter Reference (Top 50 by corpus usage)

This directory documents the **50 most-used Apple Motion / Final Cut Pro filters** found across the third-party template corpus (`~/motr-collection`), one Markdown file per filter. Each page explains **what the filter actually does** to the image, lists **only its creative parameters** (with human descriptions, correct types, and the value range observed in the wild), notes the FxPlug plumbing parameters separately, and records the reverse-engineering / implementation status. Filter behavior is distilled from three ground-truth sources where available: this engine's decoded TS filter modules (`engine/src/compositor/filters/*.ts`), the verbatim `Hgc*` Metal shaders checked in under `evidence/shaders/`, and the RE write-ups in `evidence/*.md` — falling back to documented Apple Motion behavior (with an explicit *unverified* flag) when no in-repo evidence exists. See [`../FILTER_UNIVERSE.md`](../FILTER_UNIVERSE.md) for the full inventory and status legend.

*Built from `doc_payload.json` (5365 template files parsed). Parameter types apply Motion-domain corrections over the raw sampled types: `Mix`, `Amount` (0–1), `Opacity`, `Intensity`, `Saturation`, `Softness` are continuous **floats** (never bools); `Angle` / `Twirl` / `Rotation` are **radians**; `Center` / `Position` are **point2D** in Motion's normalized frame space where (0.5, 0.5) is the frame center.*

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
| 10 | [Gradient Blur](gradient-blur.md) | `Gradient Blur` | 235 | 4 | 🔬 not impl |
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
| 37 | [Defocus](defocus.md) | `Defocus` | 69 | 7 | 🔬 not impl |
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
