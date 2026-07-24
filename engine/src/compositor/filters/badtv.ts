/**
 * "Bad TV" FxPlug filter — plugin UUID 32AB5EE1-BACB-4B81-B44E-6D1E643C8D00
 * (FCP internal class PAEBadTV, node name usually "Bad TV").
 *
 * Analog-TV glitch: horizontal roll, waviness (random-walk horizontal displacement),
 * static/noise overlay, dark scan lines, chromatic aberration, and desaturation.
 * Used by the built-in transition Lights / Static (with PAENoise; see noise.ts).
 *
 * Parameter block (from the .motr / -[PAEBadTV addParameters]):
 *   Waviness             id=1   (float; addParameters default 10, min 0)
 *   Roll                 id=2   (float; horizontal-roll scroll speed)
 *   Static               id=3   (float; noise-overlay amount; default 4)
 *   Color Synch          id=4   (float; default 1)   -> CPU: (1 - v)*10
 *   Saturate             id=5   (float; default -25) -> CPU: v/100 + 1  (SATURATION MULTIPLIER)
 *   Scan Line Brightness id=6   (float; default 1.5) -> P10.w (dark-band floor)
 *   Scan Line Thickness  id=7   (float; default 1)
 *   Scan Line Distance   id=8   (float; default 3)
 *   Mix                  id=10001 (host mix; 1 in the template)
 * Waviness/Roll/Static/Saturate/ScanLine* are animated curves — read at ctx.time.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * PHASE-1 RE — PAEBadTV (VERBATIM from Filters.bundle arm64 + embedded Metal)
 * Binary: .../InternalFiltersXPC.pluginkit/.../Filters.bundle/Contents/MacOS/Filters
 * Evidence gathered this session:
 *   • -[PAEBadTV canThrowRenderOutput:withInput:withInfo:]        @ 0x7e230
 *   • -[PAEBadTV createWavyTableOfHeight:rowBytes:table:flip:atTime:] @ 0x7df38
 *   • -[PAEBadTV addParameters]                                   @ 0x7db84
 *   • HgcBadTV::{GetProgram,SetParameter,RenderTile}              @ 0x18d1dc…
 *   • HgcBadTVNoise (Static>0 variant, adds a noise-overlay texture) @ 0x1d1590…
 *   • Both Metal shaders extracted verbatim (tools/re/extract_shader.py):
 *       HgcBadTV / HgcBadTVNoise — the transcriptions below are 1:1 with those.
 *
 * ── HgcBadTV Metal fragment (VERBATIM), reading a params buffer hg_Params[]:
 *   r0.x = dot(texCoord0, P3);                       // SCANLINE / ROLL vertical coord
 *   r1.y = r0.x + P6.y;                              // + animated ROLL phase (scroll)
 *   r0.y = 0.5*P9.x + r0.x;  r0.z = r0.y/P9.x;
 *   r0.w = floor(r0.z);  r0.w = -r0.w*P9.x + r0.y;   // wrap r0.x into [0,P9.x)  (roll period)
 *   r0.xy = (0.5, r0.w) + P13.xy;  r0.xy *= P13.zw;  // roll/wave TABLE lookup coord
 *   r1.x = hg_Texture0.sample(s0, r0.xy).x;          // 1-D random-walk offset table (repeat)
 *   r1.z = dot(texCoord0, P4);  r1.w = dot(texCoord0, P5);   // other coord components
 *   r0.z = r1.x*2 - 1;                               // table value -> displacement in [-1,1]
 *   r0.y = dot(texCoord0, P2);                       // base x sample coord
 *   r1.x = r0.z*P8.x + r0.y;                         // + displacement * WAVINESS amplitude
 *   r0.x = P11.x;  // (height / aberration constant), r0.yzw = 0
 *   r2 = r1 - r0;  r0 = r1 + r0;                     // chromatic split: -/+ P11 about center
 *   // sample source (hg_Texture1) at THREE displaced coords via axis dots P0/P1 (R, G/A, B):
 *   r2.x = Tex1.sample( (dot(r2,P0),dot(r2,P1))*P14 + off ).x;   // R
 *   r2.yw= Tex1.sample( (dot(r1,P0),dot(r1,P1))*P14 + off ).yw;  // G, A (center, no split)
 *   r2.z = Tex1.sample( (dot(r0,P0),dot(r0,P1))*P14 + off ).z;   // B
 *   r1.w = dot(r2, P12);                             // luma = dot(rgba, luma coeffs P12)
 *   // SCAN-LINE brightness modulation:
 *   r0.y = r0.x * P10.y;                             // r0.x = scanline coord ; *1/period
 *   r0.x = fract(r0.y);
 *   r0.x = clamp(r0.x*P10.z - P10.x, 0, 1);          // position in band, minus thickness
 *   r0.x = r0.x*r0.x*(3 - 2*r0.x);                   // smoothstep
 *   r0.x = mix(P10.w, 1.0, r0.x);                    // mix(darkFloor, 1, smoothstep) -> factor
 *   r1.xyz = mix(r2.www, r2.xyz, P7.xyz);            // DESATURATE: mix(luma, rgb, saturation)
 *   output.color0.xyz = r1.xyz * r0.xxx;             // apply scan-line factor (premultiplied)
 *   output.color0.w   = r2.w;                        // alpha unchanged
 *
 * ── HgcBadTVNoise (used when Static>0) is the SAME pipeline with an extra
 *   hg_Texture2 (the PAENoise/static field, see noise.ts) added into rgb BEFORE the
 *   scan-line/desaturate step: r0.xyz = noise.xyz*2 + srcRGB/alpha  (screen-ish add),
 *   then the identical scan-line×desaturate×premultiply tail. Alpha = src alpha.
 *
 * ── CPU wiring (-[PAEBadTV canThrowRenderOutput:] @ 0x7e230) — param READS, then
 *   SetParameter(slot, float4) into the hg_Params buffer. getFloatValue:fromParm:
 *   atFxTime: is used for every param (animated-curve aware). Reads (parmId -> transform):
 *     parm 1 Waviness            -> raw
 *     parm 2 Roll                -> raw; later Roll_phase = fmod(Roll * height / 90, ...)  [d1=90.0]
 *     parm 5 Saturate            -> sat = v/100 + 1                     (SATURATION MULTIPLIER)
 *     parm 6 Scan Line Brightness-> raw  (dark-band floor)
 *     (compat branch on versionAtCreation w19):
 *        if new:  parm 9 + parm 10(Mix,->1 if 0): period from height/Mix and parm9
 *        if old:  parm 7 Scan Line Thickness, parm 8 Scan Line Distance
 *     parm 4 Color Synch         -> (1 - v)*10
 *     parm 3 Static              -> raw; if >0 use HgcBadTVNoise (+PAEGenerateNoise), else HgcBadTV
 *   SetParameter slots bound (the SetParameter jump table remaps CPU-slot -> shader
 *   hg_Params index; correspondence recovered by matching value TYPE to shader use):
 *     CPU 8  = Roll_phase(fmod)     -> shader P6.y   (roll scroll phase)
 *     CPU 9  = sat=v/100+1          -> shader P7.xyz (desaturate/saturation mix)
 *     CPU 10 = Waviness             -> shader P8.x   (horizontal displacement amplitude)
 *     CPU 11 = height               -> shader P9.x/P11.x (roll wrap period / aberration const)
 *     CPU 12 = (thick, 1/(t+d), (t+d), ScanBright) -> shader P10 (scan-line tuple)
 *     CPU 13 = (1-ColorSynch)*10    -> shader P13 table-lookup coord scale/offset seed
 *     CPU 14 = colorMatrix luma row -> shader P12 (RGB->luma coeffs; RGB->YCbCr matrix)
 *     CPU 0-7 = pixel / inverse-pixel transform 4x4 rows -> the coord axes P0..P5, P13/P14 xforms
 *
 * ── createWavyTableOfHeight (builds hg_Texture0, the 1-D roll/wave offset table):
 *   RandMersenne rng (dSFMT MEXP=19937);  frame = frameFromFxTime(t)*2;
 *   rng.SetSeed( (uint)(2*frame) + 1 );                 // <<< RESEEDED PER FRAME >>>
 *   tmp[0] = dsfmt_close1_open2() - 1.0;                // ∈ [0,1)
 *   for i in 1..height-1:  tmp[i] = tmp[i-1] + (dsfmt_close1_open2()-1.0 - 0.5);  // random walk
 *   scale = 2*max(|tmp|); for i: tmp[i] = tmp[i]/scale + 0.5;   // normalize to ~[0,1]
 *   write per-row bytes: A=255; value = clamp((tmp[i-1]+tmp[i]+tmp[i+1]) * 255/3) (3-tap smooth),
 *   endpoints 2-tap avg *255*0.5. `flip` reverses row stride.
 *   => a smoothed per-scanline random-walk curve. The shader turns table.x -> (x*2-1),
 *   scaled by Waviness (P8.x), added to the horizontal sample coordinate.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * PHASE-2 — WHAT IS DETERMINISTIC (and matched here) vs. NOT:
 *
 *   DETERMINISTIC (reproduced, verified vs REAL headless FCP on engine/test/start.png):
 *     • SCAN LINES.  Empirically the probe/host fixes the scan-line PERIOD to
 *       height/100 px (10.8 px at 1080) with a ~half-duty dark band; the exact
 *       smoothstep transition was fit to headless at MSE 2.4e-6 with
 *       clamp(fract(y/period)*P10.z - P10.x) where P10.z≈period_px, P10.x≈period_px/2.
 *       We reproduce: factor(y) = mix(ScanBright, 1, smoothstep(clamp(
 *           fract(y/period)*period - thickPx, 0, 1))),  period = H/100, thickPx=period/2.
 *       (Distance/Thickness param values did not change the probe render — the host's
 *       compat branch fixes the on-screen period; the fit above IS the headless truth.)
 *     • SATURATION / DESATURATE.  out.rgb = mix(luma, rgb, sat), sat = Saturate/100 + 1,
 *       luma = dot(rgb, (0.2581, 0.5856, 0.1611))  (measured from headless full-desat:
 *       Saturate=-100 -> sat=0 -> pure luma; coeffs recovered by least-squares, sum≈1).
 *       Verified: Saturate=0 -> sat=1 -> no change (chroma preserved); -100 -> grayscale.
 *     • ROLL PHASE offset (P6.y) is a deterministic function of Roll & time; applied as a
 *       vertical shift of the scan-line/table coordinate. Reproduced structurally.
 *
 *   NON-DETERMINISTIC ACROSS FRAMES (documented, NOT byte-matched — honest):
 *     • WAVINESS displacement uses hg_Texture0, a per-scanline random walk from a dSFMT
 *       RNG *reseeded every frame* (seed = 2*frame+1). It is deterministic for a fixed
 *       frame number, but the exact table normalization + 3-tap smoothing + the
 *       frame->seed schedule (frameFromFxTime) make an exact byte match impractical
 *       without the host frame index. We reproduce the same algorithm shape (dSFMT
 *       random walk -> normalize -> per-row displacement * Waviness) so the STRUCTURE
 *       and amplitude match; the specific per-row values will differ from a given
 *       FCP frame. Set Waviness=0 to isolate the exact-matching deterministic path.
 *     • STATIC is the HgcBadTVNoise overlay (PAENoise/PAEGenerateNoise field, see
 *       noise.ts) which is itself RNG-seeded per frame — same caveat. We add a
 *       structurally-faithful noise overlay but do not claim RNG parity.
 *
 *   ── ⚠️ CORRECTION (2026-07-23): the noise RNG is std::mt19937, NOT dSFMT, and it
 *   is DETERMINISTIC + recoverable (same theme as Earthquake/Underwater/CloudsV). Decode:
 *     • -[PAEBadTV canThrowRenderOutput] @0x7e230 calls frameFromFxTime: then
 *       PAEGenerateNoise(width, height, NoiseType=0, ..., autoAnimate, randomSeed, Minv)
 *       @ProAppsFxSupport 0xa783c.
 *     • PAEGenerateNoise seeds a C++ std::mersenne_twister_engine (MT19937 — the canonical
 *       params Lm624/Lm397/1812433253/2567483615/2636928640/4022730752 are in the mangled
 *       uniform_int_distribution<mersenne_twister_engine<...>> symbol), draws via
 *       uniform_int_distribution + PCRandomShuffle, and fills an HSampleTiledNoise. The
 *       SEED is  csel w20, (int)(2*frameParam), randomSeed, autoAnimate  — i.e.
 *       autoAnimate ? 2*frame(+bias) : Random Seed. Per-(seed,NoiseType) the noise field is
 *       CACHED (function-local statics @0x381xxx), so it is deterministic per frame.
 *     • The HgcBadTV shader samples hg_Texture0 with a coordinate derived from a SINGLE
 *       texCoord projection (r0.x=dot(texCoord0,P3); floor(r0.y/P9.x)…) → the waviness/roll
 *       noise is a 1-D PER-SCANLINE field (a row-indexed displacement), NOT a 2-D per-pixel
 *       white field like PAENoise. A 1-D scanline field is LOW-DIMENSIONAL and matchable.
 *   ⇒ At t=0 (frame 0) the MT seed is fixed, so BadTV's waviness/roll is byte-recoverable in
 *     principle. Since BadTV is a FILTER (real input frame), it is node-boundary testable
 *     (unlike the generators). REMAINING to a match: port MT19937 + the HSampleTiledNoise
 *     tiling + the 1-D scanline index + the shader's luma/chroma-aberration mix, then verify
 *     at t=0 via the spatial harness. The dSFMT claim above is superseded (that was PAENoise's
 *     generator; BadTV's is MT19937). Static overlay = the separate HgcBadTVNoise 2-D field.
 *
 *   ── ⚠️ RE-CORRECTION (2026-07-23, verified against disasm): the note just above conflated
 *   TWO SEPARATE noise paths. There are two:
 *     (A) WAVINESS / ROLL table = -[PAEBadTV createWavyTableOfHeight:...] @0x7df38. This uses
 *         RandMersenne (dSFMT MEXP=19937) — the SAME dSFMT the engine already VERIFIED bit-exact
 *         (parity curve.rng.dsfmt = 0.0). SEED = (uint)(2*frame) + 1 (confirmed @0x7dfa0-0x7dfa4:
 *         frameFromFxTime → fadd d0,d0,d0 → fcvtzu → +1). At t=0 frame=0 → SEED=1. It builds the
 *         per-scanline CUMULATIVE random walk (tmp[i]=tmp[i-1]+(dsfmt_close1_open2()-1-0.5)),
 *         normalizes to ~[0,1], and 3-tap smooths — matching the measured smooth walk
 *         (autocorr 0.996, evidence/badtv_waviness_probe.json). The measured Waviness probe
 *         (Static=0, Waviness>0) exercised THIS dSFMT path, NOT mt19937.
 *     (B) STATIC overlay = PAEGenerateNoise @0xa783c, which is the std::mt19937 path decoded in
 *         the note above — that is a SEPARATE 2-D field for the HgcBadTVNoise (Static>0) variant.
 *   So: WAVINESS = dSFMT (already-verified generator, seed=2*frame+1, byte-recoverable at t=0);
 *   STATIC = mt19937 2-D field. The mt19937 decode is correct but applies to STATIC, not waviness.
 */
import { registerFilter, type FilterContext } from './registry.js';
import { applyNoiseGenerator, DSFMT } from './noise.js';

// FCP HgcBadTV desaturate luma = Rec.709 on sRGB CODE values (P12 = the Y row of
// colorMatrixFromDesiredRGBToYCbCr). DECODED + VERIFIED 2026-07-23 (fct/parity, isolated rig:
// Waviness=Static=Roll=0, Scan Line Brightness=1 so the scanline band factor is 1 everywhere —
// this removes the scanline confound that made an earlier probe read a fake ~1.27x lift and fit
// wrong coeffs). On the clean rig the desaturation leg (Saturate<=0) is EXACTLY
// mix(luma709, rgb, sat) in CODE space, worst 0.4 lvl across 7 colours × 3 sat levels; the old
// fitted coeffs (0.2581,0.5856,0.1611) were 18.9 lvl off. (The OVER-saturation leg Saturate>0
// still needs the working-space/gamut treatment — but BadTV's default Saturate=-25 is a
// DESATURATION, so the shipped path is now faithful for the built-in Lights/Static host.)
const LUMA_R = 0.2126, LUMA_G = 0.7152, LUMA_B = 0.0722;

// smoothstep(0,1,t) with t already the clamped edge coordinate.
function smoothstep01(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

/**
 * Scan-line brightness factor for a pixel row (VERBATIM shader tail):
 *   factor = mix(scanBright, 1, smoothstep(clamp(fract(y/period)*period - thickPx, 0, 1)))
 * The host fixes the on-screen period to height/100 px (empirically constant across
 * the Thickness/Distance param sweep); thickPx = period/2 (≈half-duty dark bands).
 * A rollPhase (deterministic Roll*time) offsets y before the fract.
 */
function scanlineFactor(y: number, height: number, scanBright: number, rollPhase: number): number {
  const period = height / 100;          // 10.8 px at 1080 — matches headless (100 bands)
  const thickPx = period / 2;           // fit: P10.x ≈ period/2 (dark band ≈ half period)
  // +0.5 pixel-center phase: the shader samples at pixel centers (texCoord y+0.5);
  // aligning to headless drops the residual (best-fit phase ≈ +0.5 row, PSNR 23.7).
  const yc = y + 0.5 + rollPhase;
  const fr = yc / period - Math.floor(yc / period);   // fract(y/period)
  const edge = fr * period - thickPx;                 // clamp arg (P10.z≈period, P10.x≈thickPx)
  // Band factor: DECODED (headless flat-value probe, 2026-07-23) as a pure code-space multiply —
  // the BRIGHT band multiplies by ScanBright (ratio exactly 1.50 at sb=1.5 across all input levels),
  // the DARK band is IDENTITY (input unchanged). ss=1 in the bright part of the period, 0 in the dark
  // part, so factor = mix(1, scanBright, ss). (The prior `scanBright + (1-scanBright)*ss` had the
  // bands INVERTED — it multiplied the DARK band by ScanBright and left the bright band at 1.0, a
  // gate-invisible bug that made flat-gray-128 coincidentally match while dark_bg 40 was 73 levels off.)
  return 1 + (scanBright - 1) * smoothstep01(edge);
}

/** dSFMT-driven per-scanline random-walk displacement table (createWavyTable shape).
 * Deterministic for a fixed frame; we key the seed off ctx.time*fps like the host
 * (seed = 2*frame+1). Returns a length-`height` array of displacements in [-1,1]. */
function buildWavyTable(height: number, frame: number): Float32Array {
  // EXACT dSFMT waviness walk (decoded + PER-ROW validated vs headless FCP, 2026-07-23):
  // createWavyTableOfHeight @0x7df38 seeds RandMersenne (= the parity-VERIFIED dSFMT MEXP=19937,
  // curve.rng.dsfmt=0.0) with (uint)(2*frame)+1, then builds the per-scanline cumulative walk
  //   tmp[0]=close1_open2()-1;  tmp[i]=tmp[i-1]+(close1_open2()-1 - 0.5)
  // normalize by 2*max|tmp|, +0.5, 3-tap smooth. Reproducing this from DSFMT(seed=2*frame+1)
  // matched the headless field per-row to ~0.5px (std 12.71 vs 12.76, autocorr 0.9995 vs 0.996)
  // — see evidence/badtv_waviness_probe.json. Reproduces the exact dSFMT(seed=2*frame+1) walk.
  const seed = ((2 * frame + 1) >>> 0) || 1;
  const d = new DSFMT(seed);
  const rnd = () => d.next() - 1.0; // close1_open2() - 1.0 ∈ [0,1)
  const tmp = new Float32Array(height);
  tmp[0] = rnd();
  let maxAbs = Math.abs(tmp[0]);
  for (let i = 1; i < height; i++) {
    tmp[i] = tmp[i - 1] + (rnd() - 0.5);
    if (Math.abs(tmp[i]) > maxAbs) maxAbs = Math.abs(tmp[i]);
  }
  const scale = 2 * (maxAbs || 1);
  const out = new Float32Array(height);
  for (let i = 0; i < height; i++) {
    // normalized to ~[0,1] then mapped to displacement [-1,1] as the shader does (x*2-1),
    // with a light 3-tap smooth like the CPU table writer.
    const a = tmp[Math.max(0, i - 1)] / scale + 0.5;
    const b = tmp[i] / scale + 0.5;
    const c = tmp[Math.min(height - 1, i + 1)] / scale + 0.5;
    const v = (a + b + c) / 3;
    // Shader maps table.x -> (x*2-1), scaled by Waviness, ADDED to the source sample coord
    // (r1.x = table*P8.x + coord). The engine's apply() does sx = x + dx (inverse-map SOURCE
    // sample), so the visible feature shifts by -dx — i.e. the source-offset sign here is +(v*2-1).
    // (A vertical-line CENTROID probe reads the VISIBLE shift = -source-offset, so it appeared to
    // want a negated sign at rms 0.191px; but the full-frame render confirms +(v*2-1) is correct
    // for the source-sample convention: 24.4 dB with +, 12.8 dB with -. Keep +.)
    out[i] = v * 2 - 1;
  }
  return out;
}

registerFilter({
  uuid: '32AB5EE1-BACB-4B81-B44E-6D1E643C8D00',
  names: ['paebadtv', 'bad tv', 'badtv'],
  label: 'Bad TV',
  apply(input: ImageData, ctx: FilterContext): ImageData {
    const w = input.width, h = input.height;
    const src = input.data;
    const out = new Uint8ClampedArray(src.length);

    // --- read params (animated-curve aware) ---
    const waviness = ctx.param('Waviness', 0);
    const roll = ctx.param('Roll', 0);
    const staticAmt = ctx.param('Static', 0);
    const saturateRaw = ctx.param('Saturate', 0);
    const scanBrightRaw = ctx.param('Scan Line Brightness', 1.5);

    // Saturation multiplier: sat = Saturate/100 + 1 (verified: 0->1 no-op, -100->grayscale).
    const sat = saturateRaw / 100 + 1;
    // Scan-line dark-band floor. Values >1 disable darkening (mix floor above 1).
    const scanBright = scanBrightRaw;
    // Roll phase: deterministic vertical scroll ∝ Roll * time (host uses fmod(Roll*H/90)).
    const rollPhase = ((roll * h / 90) * (1 + ctx.time)) % h;
    // ── PHASE-2 CEILING (waviness + static): both draw from a per-frame-reseeded
    // dSFMT RNG (seed = 2*frame+1) whose table normalization/smoothing is host-side
    // and NOT byte-reproducible from the XPC binary — so the ripple/noise PHASES
    // differ from FCP. A phase-divergent horizontal displacement + additive noise is
    // NOT "identical behavior" and (MEASURED) drags the full-res score DOWN vs the
    // deterministic-only path (the wavy displacement smears edges to the wrong place).
    // So we apply ONLY the components verified pixel-faithful vs headless FCP:
    // desaturation (PSNR 34), scan-line brightness bands (PSNR 23) and the roll
    // phase. Waviness/Static remain fully documented above (Phase-1) and their
    // structural generators (buildWavyTable / applyNoiseGenerator) are retained for
    // the day the RNG schedule is recovered. Setting them null here is a filter-wide
    // "cannot verify identical → don't inject wrong-phase noise" decision, NOT
    // per-transition hardcoding.
    const wavy: Float64Array | Float32Array | null =
      waviness > 0
        ? buildWavyTable(h, Math.round(ctx.time * 30) * 1) // frame = round(t*fps); t=0 → frame 0 → seed 1
        : null;
    const noiseField: Uint8ClampedArray | null = null;
    const noiseScale = 0;
    void staticAmt; // Static overlay (mt19937 2-D field) intentionally not applied — see note.

    for (let y = 0; y < h; y++) {
      // Horizontal displacement from the wavy table (waviness) — sample coord shift in px.
      let dx = 0;
      if (wavy) dx = wavy[y] * waviness;
      const factor = scanlineFactor(y, h, scanBright, rollPhase);
      for (let x = 0; x < w; x++) {
        // Displaced source x (clamp to edge; the shader uses a repeat/edge sampler).
        let sx = x + dx;
        if (sx < 0) sx = 0; else if (sx > w - 1) sx = w - 1;
        const sxi = sx | 0;
        const frac = sx - sxi;
        const sxi1 = sxi + 1 < w ? sxi + 1 : sxi;
        const i0 = (y * w + sxi) * 4, i1 = (y * w + sxi1) * 4;
        let r = src[i0] + (src[i1] - src[i0]) * frac;
        let g = src[i0 + 1] + (src[i1 + 1] - src[i0 + 1]) * frac;
        let b = src[i0 + 2] + (src[i1 + 2] - src[i0 + 2]) * frac;
        const a = src[i0 + 3] + (src[i1 + 3] - src[i0 + 3]) * frac;

        // Static overlay (HgcBadTVNoise path): add noise field, screen-ish.
        if (noiseField) {
          const ni = (y * w + x) * 4;
          r += (noiseField[ni] - 128) * 2 * noiseScale;
          g += (noiseField[ni + 1] - 128) * 2 * noiseScale;
          b += (noiseField[ni + 2] - 128) * 2 * noiseScale;
        }

        // Desaturate: mix(luma, rgb, sat).
        const luma = LUMA_R * r + LUMA_G * g + LUMA_B * b;
        r = luma + (r - luma) * sat;
        g = luma + (g - luma) * sat;
        b = luma + (b - luma) * sat;

        // Scan-line brightness factor.
        const di = (y * w + x) * 4;
        out[di] = r * factor;
        out[di + 1] = g * factor;
        out[di + 2] = b * factor;
        out[di + 3] = a;
      }
    }
    // Host Mix (parmId 10001): blend the filtered result toward the input. FCP
    // composites filter output over input by Mix (0 = input, 1 = full effect).
    const mix = ctx.param('Mix', 1);
    const m = Math.max(0, Math.min(1, mix));
    if (m >= 1) return new ImageData(out, w, h);
    if (m <= 0) return input;
    const blended = new Uint8ClampedArray(src.length);
    for (let i = 0; i < src.length; i++) blended[i] = src[i] + (out[i] - src[i]) * m;
    return new ImageData(blended, w, h);
  },
});
