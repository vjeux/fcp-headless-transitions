# Corpus Filter Reference (per pluginUUID)

Every FxPlug filter observed in the ~5365-file Motion corpus (5365 parsed, 5 failed), keyed by pluginUUID — the stable identifier used by `engine/src/compositor/filters/registry.ts`. Each linked file lists every parameter with inferred **type**, **default**, empirical **value range**, and **keyframe frequency**. Complements `docs/FILTER_UNIVERSE.md` (the RE/shader map) with the full parameter surface.

**141 distinct filter UUIDs.** Implemented in engine: 25. Not yet implemented: 116.

| Filter | PAE class | Files | Instances | Params | Status |
|---|---|---|---|---|---|
| [Colorize](Colorize.md) | Colorize | 921 | 2667 | 18 | ✅ |
| [Hue/Saturation](Hue-Saturation.md) | Hue/Saturation | 827 | 1620 | 12 | ✅ |
| [Gaussian Blur](Gaussian-Blur.md) | Gaussian Blur | 788 | 1594 | 17 | ✅ |
| [Fill](Fill.md) | Fill | 531 | 1351 | 12 | ✅ |
| [Prism](Prism.md) | Prism | 538 | 829 | 16 | ❌ |
| [Bump Map](Bump-Map.md) | Bump Map | 257 | 780 | 20 | ❌ |
| [Levels](Levels.md) | Levels | 382 | 702 | 9 | ✅ |
| [Twirl](Twirl.md) | Twirl | 492 | 693 | 16 | ❌ |
| [Brightness](Brightness.md) | Brightness | 259 | 586 | 8 | ✅ |
| [Bad Film](Bad-Film.md) | Bad Film | 231 | 500 | 36 | ❌ |
| [Flop](Flop.md) | Flop | 212 | 487 | 8 | ✅ |
| [Directional Blur](Directional-Blur.md) | Directional Blur | 187 | 456 | 8 | ✅ |
| [Poke](Poke.md) | Poke | 177 | 397 | 14 | ❌ |
| [Channel Mixer](Channel-Mixer.md) | Channel Mixer | 102 | 387 | 10 | ✅ |
| [Offset](Offset.md) | Offset | 228 | 374 | 10 | ❌ |
| [Gradient Blur](Gradient-Blur.md) | Gradient Blur | 235 | 322 | 16 | ❌ |
| [Pixellate](Pixellate.md) | Pixellate | 162 | 296 | 12 | ✅ |
| [Tint](Tint.md) | Tint | 85 | 296 | 5 | ✅ |
| [MinMax](MinMax.md) | MinMax | 117 | 276 | 5 | ✅ |
| [Color Balance](Color-Balance.md) | Color Balance | 196 | 262 | 10 | ❌ |
| [Glint](Glint.md) | Glint | 165 | 241 | 28 | ❌ |
| [Bulge Source](Bulge-Source.md) | Bulge Source | 204 | 236 | 8 | ❌ |
| [Channel Blur](Channel-Blur.md) | Channel Blur | 185 | 228 | 12 | ❌ |
| [Contrast](Contrast.md) | Contrast | 136 | 224 | 16 | ❌ |
| [Disc Warp](Disc-Warp.md) | Disc Warp | 215 | 215 | 7 | ❌ |
| [Bad TV](Bad-TV.md) | Bad TV | 103 | 199 | 22 | ✅ |
| [Underwater](Underwater.md) | Underwater | 111 | 188 | 14 | ✅ |
| [Add Noise](Add-Noise.md) | Add Noise | 123 | 188 | 9 | ❌ |
| [Earthquake](Earthquake.md) | Earthquake | 128 | 145 | 29 | ✅ |
| [Scrape](Scrape.md) | Scrape | 48 | 135 | 16 | ✅ |
| [Page Curl](Page-Curl.md) | Page Curl | 50 | 127 | 14 | ❌ |
| [Extrude](Extrude.md) | Extrude | 60 | 120 | 13 | ❌ |
| [Light Rays](Light-Rays.md) | Light Rays | 93 | 112 | 9 | ❌ |
| [Negative](Negative.md) | Negative | 74 | 112 | 6 | ❌ |
| [Soft Focus](Soft-Focus.md) | Soft Focus | 73 | 111 | 9 | ❌ |
| [Glow](Glow.md) | Glow | 78 | 107 | 9 | ✅ |
| [Threshold](Threshold.md) | Threshold | 81 | 97 | 16 | ❌ |
| [Compound Blur](Compound-Blur.md) | Compound Blur | 83 | 85 | 20 | ❌ |
| [Defocus](Defocus.md) | Defocus | 69 | 84 | 10 | ❌ |
| [Luma Keyer](Luma-Keyer.md) | Luma Keyer | 65 | 81 | 32 | ✅ |
| [Variable Blur](Variable-Blur.md) | Variable Blur | 78 | 81 | 9 | ❌ |
| [Kaleidotile](Kaleidotile.md) | Kaleidotile | 52 | 78 | 8 | ❌ |
| [Zoom Blur](Zoom-Blur.md) | Zoom Blur | 58 | 77 | 9 | ✅ |
| [Color Curves](Color-Curves.md) | Color Curves | 65 | 74 | 9 | ❌ |
| [Circle Blur](Circle-Blur.md) | Circle Blur | 19 | 72 | 8 | ❌ |
| [Unsharp Mask](Unsharp-Mask.md) | Unsharp Mask | 54 | 72 | 9 | ❌ |
| [Stroke](Stroke.md) | Stroke | 61 | 72 | 18 | ❌ |
| [Fisheye](Fisheye.md) | Fisheye | 41 | 70 | 7 | ✅ |
| [Radial Blur](Radial-Blur.md) | Radial Blur | 49 | 69 | 7 | ✅ |
| [Wave](Wave.md) | Wave | 33 | 61 | 8 | ❌ |
| [Outer Glow](Outer-Glow.md) | Outer Glow | 29 | 58 | 11 | ❌ |
| [Simple Border](Simple-Border.md) | Simple Border | 22 | 58 | 6 | ❌ |
| [Mirror](Mirror.md) | Mirror | 14 | 56 | 7 | ❌ |
| [Vignette](Vignette.md) | Vignette | 48 | 54 | 11 | ✅ |
| [mCallouts Simple 2](mCallouts-Simple-2.md) | mCallouts Simple 2 | 50 | 50 | 7 | ❌ |
| [Line Screen](Line-Screen.md) | Line Screen | 5 | 48 | 10 | ❌ |
| [Indent](Indent.md) | Indent | 24 | 47 | 34 | ❌ |
| [OpenEXR Tone Map](OpenEXR-Tone-Map.md) | OpenEXR Tone Map | 16 | 46 | 7 | ❌ |
| [Overdrive](Overdrive.md) | Overdrive | 37 | 46 | 10 | ❌ |
| [Keyer](Keyer.md) | Keyer | 22 | 45 | 25 | ❌ |
| [Gradient Colorize](Gradient-Colorize.md) | Gradient Colorize | 26 | 41 | 9 | ❌ |
| [Droplet](Droplet.md) | Droplet | 8 | 35 | 9 | ❌ |
| [Trails](Trails.md) | Trails | 25 | 34 | 7 | ❌ |
| [Bloom](Bloom.md) | Bloom | 18 | 31 | 22 | ✅ |
| [Fun House](Fun-House.md) | Fun House | 17 | 29 | 8 | ❌ |
| [Hatched Screen](Hatched-Screen.md) | Hatched Screen | 11 | 29 | 10 | ❌ |
| [Dazzle](Dazzle.md) | Dazzle | 18 | 28 | 20 | ❌ |
| [Line Art](Line-Art.md) | Line Art | 21 | 27 | 8 | ❌ |
| [Stripes](Stripes.md) | Stripes | 17 | 26 | 7 | ❌ |
| [Gamma](Gamma.md) | Gamma | 17 | 25 | 8 | ❌ |
| [Neon](Neon.md) | Neon | 23 | 24 | 8 | ❌ |
| [Insect Eye](Insect-Eye.md) | Insect Eye | 10 | 23 | 7 | ❌ |
| [Aura](Aura.md) | Aura | 16 | 21 | 9 | ❌ |
| [Tile](Tile.md) | Tile | 16 | 21 | 9 | ❌ |
| [Sharpen](Sharpen.md) | Sharpen | 19 | 20 | 6 | ❌ |
| [Refraction](Refraction.md) | Refraction | 19 | 20 | 7 | ❌ |
| [Halftone](Halftone.md) | Halftone | 17 | 19 | 8 | ❌ |
| [Relief](Relief.md) | Relief | 11 | 19 | 11 | ❌ |
| [Sphere](Sphere.md) | Sphere | 16 | 18 | 7 | ❌ |
| [Black Hole](Black-Hole.md) | Black Hole | 11 | 17 | 6 | ✅ |
| [Polar](Polar.md) | Polar | 10 | 17 | 6 | ❌ |
| [Comic](Comic.md) | Comic | 14 | 17 | 12 | ❌ |
| [Crystallize](Crystallize.md) | Crystallize | 14 | 16 | 14 | ❌ |
| [PAETarget](PAETarget.md) | PAETarget | 6 | 16 | 7 | ❌ |
| [Color Wheels](Color-Wheels.md) | Color Wheels | 4 | 15 | 11 | ❌ |
| [Glass Block](Glass-Block.md) | Glass Block | 7 | 13 | 8 | ❌ |
| [Sepia](Sepia.md) | Sepia | 8 | 12 | 8 | ❌ |
| [Gloom](Gloom.md) | Gloom | 9 | 11 | 7 | ❌ |
| [Noir](Noir.md) | Noir | 9 | 9 | 3 | ❌ |
| [Posterize](Posterize.md) | Posterize | 2 | 9 | 2 | ❌ |
| [Sliced Scale](Sliced-Scale.md) | Sliced Scale | 5 | 9 | 12 | ❌ |
| [Matte Magic](Matte-Magic.md) | Matte Magic | 5 | 7 | 7 | ❌ |
| [Wavy Screen](Wavy-Screen.md) | Wavy Screen | 4 | 6 | 7 | ❌ |
| [360° Reorient](360-Reorient.md) | 360° Reorient | 4 | 6 | 6 | ✅ |
| [Ripple](Ripple.md) | Ripple | 5 | 5 | 7 | ❌ |
| [Highpass](Highpass.md) | Highpass | 5 | 5 | 5 | ❌ |
| [Echo](Echo.md) | Echo | 4 | 5 | 7 | ❌ |
| [NoiseDither](NoiseDither.md) | NoiseDither | 3 | 5 | 4 | ❌ |
| [Spill Suppression](Spill-Suppression.md) | Spill Suppression | 5 | 5 | 8 | ❌ |
| [Perspective Tile](Perspective-Tile.md) | Perspective Tile | 5 | 5 | 10 | ❌ |
| [Tiny Planet](Tiny-Planet.md) | Tiny Planet | 5 | 5 | 9 | ❌ |
| [Chrome](Chrome.md) | Chrome | 4 | 5 | 3 | ❌ |
| [Hue/Saturation Curves](Hue-Saturation-Curves.md) | Hue/Saturation Curves | 2 | 4 | 11 | ❌ |
| [Bleach](Bleach.md) | Bleach | 4 | 4 | 3 | ❌ |
| [Scrub](Scrub.md) | Scrub | 3 | 4 | 4 | ❌ |
| [PAEColorReduce](PAEColorReduce.md) | PAEColorReduce | 3 | 4 | 10 | ❌ |
| [Color Emboss](Color-Emboss.md) | Color Emboss | 3 | 3 | 6 | ❌ |
| [Slit Tunnel](Slit-Tunnel.md) | Slit Tunnel | 2 | 3 | 5 | ❌ |
| [Sixties](Sixties.md) | Sixties | 3 | 3 | 3 | ❌ |
| [Mono](Mono.md) | Mono | 3 | 3 | 3 | ❌ |
| [Texture Screen](Texture-Screen.md) | Texture Screen | 3 | 3 | 14 | ❌ |
| [Fade](Fade.md) | Fade | 3 | 3 | 3 | ❌ |
| [Angle OSC](Angle-OSC.md) | Angle OSC | 3 | 3 | 8 | ❌ |
| [Ring Lens](Ring-Lens.md) | Ring Lens | 2 | 3 | 9 | ❌ |
| [Glass Distortion](Glass-Distortion.md) | Glass Distortion | 3 | 3 | 11 | ❌ |
| [Edges](Edges.md) | Edges | 2 | 2 | 4 | ❌ |
| [Transfer](Transfer.md) | Transfer | 2 | 2 | 3 | ❌ |
| [Custom LUT](Custom-LUT.md) | Custom LUT | 2 | 2 | 5 | ❌ |
| [Starburst](Starburst.md) | Starburst | 2 | 2 | 6 | ❌ |
| [WideTime](WideTime.md) | WideTime | 2 | 2 | 6 | ❌ |
| [PAECICISharpenLuminance](PAECICISharpenLuminance.md) | PAECICISharpenLuminance | 1 | 2 | 2 | ❌ |
| [PAECICIMotionBlur](PAECICIMotionBlur.md) | PAECICIMotionBlur | 1 | 2 | 3 | ❌ |
| [Cool](Cool.md) | Cool | 2 | 2 | 3 | ❌ |
| [FxPlugHanging::FxPlug Name](FxPlugHanging-FxPlug-Name.md) | FxPlugHanging::FxPlug Name | 1 | 1 | 4 | ❌ |
| [CorridorKey by LateNite](CorridorKey-by-LateNite.md) | CorridorKey by LateNite | 1 | 1 | 12 | ❌ |
| [Gyroflow Toolbox](Gyroflow-Toolbox.md) | Gyroflow Toolbox | 1 | 1 | 12 | ❌ |
| [Rounded · KF](Rounded-KF.md) | Rounded · KF | 1 | 1 | 5 | ❌ |
| [Magic Move · KF](Magic-Move-KF.md) | Magic Move · KF | 1 | 1 | 5 | ❌ |
| [Canvas · KF](Canvas-KF.md) | Canvas · KF | 1 | 1 | 5 | ❌ |
| [Glow · KF](Glow-KF.md) | Glow · KF | 1 | 1 | 5 | ❌ |
| [Lumakey](Lumakey.md) | Lumakey | 1 | 1 | 3 | ❌ |
| [Tonal](Tonal.md) | Tonal | 1 | 1 | 3 | ❌ |
| [Process](Process.md) | Process | 1 | 1 | 3 | ❌ |
| [PAECircleScreen](PAECircleScreen.md) | PAECircleScreen | 1 | 1 | 7 | ❌ |
| [Parallelogram Tile](Parallelogram-Tile.md) | Parallelogram Tile | 1 | 1 | 8 | ❌ |
| [PAEYUVAdjust](PAEYUVAdjust.md) | PAEYUVAdjust | 1 | 1 | 1 | ❌ |
| [PAEYIQAdjust](PAEYIQAdjust.md) | PAEYIQAdjust | 1 | 1 | 1 | ❌ |
| [New York](New-York.md) | New York | 1 | 1 | 3 | ❌ |
| [Source](Source.md) | Source | 1 | 1 | 3 | ❌ |
| [Noise Dissolve](Noise-Dissolve.md) | Noise Dissolve | 1 | 1 | 5 | ❌ |
| [Random Tile](Random-Tile.md) | Random Tile | 1 | 1 | 8 | ❌ |