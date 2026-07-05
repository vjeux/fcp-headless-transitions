# PAENoise + PAECloudsV2 decompilation report (agent w6)

Binary: `Final Cut Pro.app/Contents/PlugIns/InternalFiltersXPC.pluginkit/Contents/PlugIns/Filters.bundle/Contents/MacOS/Filters` (arm64 slice @ file 0x66c000). Tools: `nm`, `otool -arch arm64 -tV`, custom Mach-O const reader.

## 1. PAENoise (Lights/Static) — UUID 30911E49-2043-4EEC-88A8-2E4AAA835D59

### Evidence (symbols, verbatim from `nm`)
- `-[PAENoise addParameters]` @ 0xC2860 — exposes ONE Int param "Random Seed" (parmId 1).
- `-[PAENoise canThrowRenderOutput:withInfo:]` @ 0xC2934 — the render entry.
- `HgcNoise::{GetProgram@0x1C90EC, RenderTile@0x1C9784, Bind@0x1C9734, BindTexture@0x1C966C}`.
- `HNoise::SetRect(double,double,double,double)` @ 0x124C3C, `HNoise::GetDOD` @ 0x124BEC.
- Imported: `RandMersenne::SetSeed`, `_dsfmt_gen_rand_all`.
- The FULL Metal fragment shader source is EMBEDDED as a string
  (`HgcNoise_hgc_visible`) — saved verbatim to `evidence/HgcNoise.metal.txt`.

### Decoded algorithm (two stages, both confirmed in disassembly)

**STAGE 1 — seed → white-noise gradient texture (CPU, dSFMT).**
`canThrowRenderOutput` (traced 0xC2934–0xC2CD0):
1. `getIntValue:fromParm:atFxTime:` parmId `#0x1` → the Random Seed int.
2. `HGRectMake4i(-W/2,-H/2,W/2,H/2)`; allocate `HGBitmap(rect, HGFormat 0x16)`.
3. `RandMersenne::SetSeed(seed)` (dSFMT MEXP=19937).
4. Per pixel, fill RGBA: `strb #0xff` (A=255) then 3 bytes each =
   `fcvtzs( (dsfmt_close1_open2() - 1.0) * 255.0 )`.
   Verified consts in disasm: `fmov d8,#-1.0`; `d9 = *0x269D60 = 255.0` (read
   from `__TEXT,__const`); `mov w21,#0xff`. The loop calls `_dsfmt_gen_rand_all`
   when the 382-double block is exhausted (`cmp w8,#0x17d` = 381).
5. Wrap in `HGBitmapLoader`, bind as `hg_Texture0` of an `HgcNoise` program.
6. `HNoise::SetRect(-0.5·W, -0.5·H, W/2, H)` — stored as ints at instance
   offsets 0x1a0..0x1ac via `fcvtms/fcvtps`. **`HNoise::GetDOD` reads 0x1a0/0x1a8
   ⇒ SetRect defines the output RECT (DOD/ROI), NOT the sample scale.**

**STAGE 2 — HgcNoise shader = Ashima/McEwan 2D SIMPLEX NOISE, ×3 → R,G,B.**
Constants (verbatim from embedded source, all confirmed):
```
c0=(1/47,1/41,1/61,1/59)  c1=(47,-41,32,0.5)
c2=(0.5(√3-1)=F2, (3-√3)/6=G2, 1/289, 289)
c3=(1,0,34,0.85373472)  c4=(1.79284291, G2, -1/√3, -61)
c5=(-59,65,1/53,-53)
```
This is textbook WebGL-Noise `snoise(vec2)`: skew F2, unskew G2, mod289 permute
`34x²+x`, Ashima gradient normalization `1.79284291 - 0.85373472·(a0²+h²)`,
quartic falloff `max(0.5-r²,0)⁴`, output `snoise·65 + 0.5`, `color0.w = 1.0`.

The ONE non-textbook twist: instead of a hardcoded gradient LUT, a per-pixel
JITTER is read from the seeded white texture and ADDED to the snoise input:
```
P = texCoord0 + hg_Texture0.sample(sampler, ((cell - 32 + 0.5) + off) * scale).xy
```
Per-channel jitter-lookup cell frequency (traced through the register ops):
```
R (color0.x): (tc.x mod 47, tc.y mod 41)
G (color0.y): (tc.x mod 61, tc.y mod 59)
B (color0.z): (tc.x mod 53, tc.y mod 47)
```
So the seed perturbs the field through this sampled jitter (the "gradient table").

### Answers to the assigned questions
- **Noise function:** Ashima/Gustavson **2D simplex (gradient) noise**, evaluated
  once per RGB channel with slightly different lattice frequencies (anisotropic
  per channel). NOT white noise, NOT plain value noise, NOT Perlin-grid.
- **Seed use:** the Int Random Seed seeds a **dSFMT** RNG that fills an RGBA
  white-noise texture; that texture is the per-cell gradient/jitter source.
  `byte = trunc((dsfmt[1,2) − 1)·255)`, A=255. Bit-exact dSFMT ported.
- **Interpolation:** simplex (hermite-like quartic falloff), i.e. smooth — NOT
  nearest (white) or bilinear (value). Confirmed empirically: the real render's
  spatial autocorrelation is high (lag1≈0.95, half-decay≈6px).
- **Anisotropy:** YES — different x vs y lattice frequencies per channel
  (47/41, 61/59, 53/47). Measured GT is anisotropic (lag1_h 0.951 > lag1_v 0.821).
- **Animation:** the noise MATH takes no time argument — it is a pure function of
  (x,y,seed). In Lights/Static the .motr holds Random Seed = 0 CONSTANT yet each
  frame's field is completely different (frame-to-frame pattern corr ≈ 0). ⇒ the
  transition HOST re-seeds per frame (RandMersenne::SetSeed with a per-frame seed).
  **That reseed schedule is in FCP's transition host, NOT in InternalFiltersXPC**,
  so it is not recoverable from this binary (see Fidelity).
- **Colorspace:** full RGB, three INDEPENDENT simplex evaluations (correlated,
  near-grayscale + subtle chroma), alpha = 1 (opaque). Measured GT R,G corr ≈0.91.

### Implementation
`engine/src/compositor/filters/noise.ts`:
- `DSFMT` — bit-exact dSFMT-2.2.3 (do_recursion / init_gen_rand / initial_mask /
  period_certification), `next()`∈[1,2), `nextByte()` = the exact texture fill.
- `snoise(x,y)` — 1:1 transcription of the embedded Ashima shader.
- `paenoiseField` / `applyNoiseGenerator` — the 3-channel assembly + jitter lookup.
- Registered under the correct full UUID.
Unit tests: `engine/test/noise.test.ts` — 12/12 pass (dSFMT exactness & range,
snoise bounds/continuity/determinism, field character vs GT: opaque α, chroma
present, spatial smoothness lag1>0.7, seed-sensitivity).

### Fidelity — what is exact vs. residual (honest accounting)
EXACT (byte-for-byte from disasm / embedded shader):
  • dSFMT RNG and the `trunc((raw-1)·255)` texture fill.
  • The entire snoise body (skew, unskew, mod289 permute, gradient recon,
    quartic falloff, ×65+0.5), and the 3-channel offset structure & frequencies.
NOT recoverable from this XPC binary (⇒ residual, documented):
  1. **Per-frame seed schedule** — lives in the FCP transition host. Verified:
     Static.motr has Random Seed value=0, no keyframes, no Oscillate; yet GT
     frames are uncorrelated ⇒ host reseeds per frame by an unknown formula.
  2. **texCoord0 scale** feeding snoise — set by imported `HGHandler::TexCoord`
     defaults (unresolved symbol). Calibrated to 0.04/px so the simplex cell size
     matches GT (half-decay≈6px, lag1≈0.95).
  3. **hg_Params[0] jitter-lookup offset/scale** — a runtime uniform; its exact
     value controls how correlated the 3 channels are. Our choice
     (offset=-W/2, scale=1/W) reproduces smooth per-channel noise but decorrelates
     the channels more than GT (our corr≈0.33 vs GT≈0.91). The MATH is exact; only
     these two coordinate scales are calibrated, so a single-frame pixel PSNR match
     is not attainable without the host's seed + the runtime uniforms.

## 2. PAECloudsV2 — UUID EFCC7FE1 (Close & Open, Light Sweep)

### Evidence
- `-[PAECloudsV2 addParameters]` @ 0x517C8, `canThrowRenderOutput` @ 0x51B48.
- Param strings: `Clouds::{Size,Speed,Gradient,Method,MethodChoices,Position,
  Strength1,Strength2,Strength3,Strength4,XSize,YSize}`.
- `HgcClouds::{GetProgram@0x2442F8, RenderTile@0x2456AC, ...}`, `HClouds::GetDOD`.
- Full embedded shader saved to `evidence/HgcClouds.metal.txt`.
- render calls: 7× `getFloatValue`, 1× `getXValue:YValue:` (Position), 1×
  `getIntValue` (Method), 1× `getGradientSamples:numSamples:depth:` (Gradient LUT),
  and `timelineFpsNumerator/DenominatorForEffect:`. **No dSFMT/RandMersenne** —
  the value-noise lattice is deterministic, not RNG-seeded.

### Decoded algorithm (from the embedded shader)
Constants: `c0=(6,-15,10,256)`, `c1=(0,255,0.5,0)`.
The shader is **4-octave fBm of quintic-interpolated VALUE noise**:
- For each of 4 octaves it takes the octave's fractional coord `t` (in texCoordN.xy)
  and computes the quintic fade `f = t³(6t² − 15t + 10)` (that's exactly
  `c0.x=6, c0.y=-15, c0.z=10`), then does bilinear value interpolation:
  `mix(mix(v00,v10,fx), mix(v01,v11,fy))` where the four lattice corner values are
  supplied as `texCoordN.xz / texCoordN.yw` (precomputed CPU-side in RenderTile,
  which builds the t², t³, t⁴, t⁵ powers — the fmul chains at 0x24576x confirm).
- The 4 octave results form `r0 = (oct0,oct1,oct2,oct3)`.
- **`r0.x = dot(r0, hg_Params[1])`** ⇒ hg_Params[1] = the **four Layer Strengths**
  (Strength1..4) — the octave weights, applied as a weighted sum (NOT fixed 1/2^n).
- `r0.x = r0.x·hg_Params[0].x + hg_Params[0].y` (contrast/brightness),
  `fabs(·)·256`, clamp[0,255], floor ⇒ index; then
  `hg_Texture0.sample(..., (idx+0.5+params[2].xy)·params[2].zw)` = the **Gradient LUT
  lookup** (getGradientSamples), premultiplied by α (`r0.xyz *= r0.w`).

Answers: hash = deterministic value-noise lattice (corner values precomputed in
RenderTile, quintic-smoothed — NOT dSFMT); octave weights = the 4 Strength params
via `dot`; speed/drift = frame→seconds via timeline fps, offsetting the octave
coords each frame (Clouds::Speed, direction from Clouds::Position); gradient mapping
= `floor(clamp(|weighted_fBm·scale+bias|·256))` → 256-entry Gradient LUT texture.
XSize/YSize give per-axis anisotropy of the octave frequencies.

(PAECloudsV2 was the secondary "also check"; the shader-level structure above is
fully decoded and captured as evidence. A full CPU port would additionally require
transcribing the RenderTile corner-value generation + the fps-driven octave-coord
schedule; not implemented this pass.)
