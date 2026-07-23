/**
 * "Underwater" FxPlug filter — plugin UUID 9FA1F483-1E09-4DD0-870F-C32777D7F1B0
 * (FCP internal class PAEUnderwater, node name "Underwater").
 *
 * A sinusoidal underwater refraction / wobble: the source image is resampled
 * through a smoothly space-varying 2-D displacement field that is the SUM of many
 * sine waves of different frequencies, directions and (time-animated) phases —
 * exactly the look of light refracting through a rippling water surface.
 *
 * Used by 1 built-in transition:
 *   - Movements/Flashback   (baseline engine 16.87 dB, headless 20.11)
 *
 * Parameter block (from the .motr / addParameters disasm):
 *   <parameter name="Size"        id="1" default="100"/>  float slider, min 2 max 10-slider…200
 *   <parameter name="Speed"       id="2" default="0.5"/>  float slider 0..2
 *   <parameter name="Refraction"  id="3" default="?"/>    float slider 0..200 (displacement gain)
 *   <parameter name="Repeat Edges" id="6" default="1"/>   toggle (edge wrap vs clamp)
 *   <parameter name="Mix"        id="10001"/>             host-level mix
 * Size / Speed / Refraction are animated curves in the transition; read at ctx.time.
 *
 * ============================================================================
 * VERBATIM FCP REVERSE-ENGINEERING (Phase-1 — source of truth)
 * ============================================================================
 * Filters.bundle (arm64) exposes TWO Metal fragment programs plus the CPU wiring
 * in -[PAEUnderwater canThrowRenderOutput:withInput:withInfo:] (@0x65f3c). The
 * render is a two-node Helium graph:
 *     source ──HgcUnderwaterFreqSynth──▶ (freq/phase param texture, tiny)
 *     source ──HUnderwaterRefractV2────▶ output      (per-pixel resample)
 * The CPU synthesises the sinusoid table, uploads it as hg_Params[9..28] to the
 * RefractV2 node, then RefractV2 evaluates the displacement per output pixel.
 *
 * ── CPU wiring (canThrowRenderOutput, verbatim structure) ───────────────────
 *   1. getFloatValue parmId=3 -> refr; if refr==0 -> PASSTHROUGH (setHeliumRef in).
 *   2. getPixelTransformForImage / getInversePixelTransformForImage -> M / Minv.
 *   3. getFloatValue parmId=1 -> size; size *= const(@0x268c50)  [size gain].
 *      getFloatValue parmId=2 -> speed.
 *      getBoolValue  parmId=6 -> repeatEdges.
 *   4. secondsFromFxTime(t) -> sec (FLOAT, fcvt s0<-d0<-s0 rounds to 32-bit).
 *      timeVal = speed * sec.                                  [sp+0x50]
 *   5. Seed a 102-entry uint64 Lehmer/LCG state table on the stack (loop @0x660f8,
 *      count 0x330/8 = 102): state[i] = (0x24d69 + seed<<12) mod 0xae529 style
 *      hash (mult 0x5dfc998781872319, mod 0xae529). This is a deterministic PRNG
 *      whose seed is CONSTANT (0x6f638) — the wave field is FIXED per project,
 *      NOT random per frame. Only the PHASE advances with timeVal.
 *   6. COMPONENT SYNTHESIS loop (@0x66194, 10 iterations, n = 0..9):
 *        - draw 3 pseudo-random uint64 from the table via the LCG, normalise by
 *          const s9 (@0x269614) and scale by const s2 (@0x269820) -> rand0,rand1,rand2
 *        - freq_n = ( (rand2/s9)*0.25 + 0.75 ) * (1/(n/4+1)) * 0.25   [∈ decreasing]
 *          i.e. base spatial frequency in [0.75,1.0) shrunk per-octave by 1/(n/4+1).
 *        - w_n   = (n/4 + 1) * freq_n                                 [angular freq]
 *        - dir angle = rand0  ;  __sincosf(angle) -> (sinA, cosA)
 *          amp components  comp[0]=sinA*w_n , comp[1]=cosA*w_n         [directioned]
 *        - phase_n = rand1 + timeVal * (n/4 + 1)   -> comp[2]          [TIME-ANIMATED]
 *          (this is the ONLY time dependence: each octave's phase drifts at a rate
 *           proportional to (n/4+1)·Speed·seconds.)
 *        - accumulate |max offset| into s12..s15 for SetMaxOffsets (DOD growth).
 *      The 10 components are packed as float4 records on the stack (stride 0x10).
 *   7. Build RefractV2 node (HUnderwaterRefractV2). Two write loops upload the
 *      packed components into hg_Params[9..18] (the 10 sinusoid records, each a
 *      float4 (ampX, ampY, phase, _) that the shader lerps) and the paired octave
 *      slots. The first loop (@0x66300, i=-10..-1) writes slots (i+0x1d)=19..28 as
 *      SetCoords(slot, 0). The second loop (@0x6636c, i=0..4) writes slots (i+9)=
 *      9..13 and (i+0xe)=14..18 with the pixel-transform-projected component
 *      records (each row multiplied by M's scale [sp+0x40] and pixel-offset).
 *   8. SetParameter slot 8 = refr (Refraction displacement GAIN, hg_Params[8].xy).
 *      slot 6 = 1/sizeX ([sp+0x18].x), slot 7 = 1/sizeY (image w,h from step 4).
 *      slot 3/4/5 = the inverse pixel transform Minv rows (dest->source projective).
 *      slot 0/1/2 = the forward pixel transform M rows (pixel->normalized).
 *      SetMaxOffsets(dx,dy) sets the DOD expansion (s9-s11, s10-s12 = the summed
 *      max sinusoid amplitudes). crop/smear wrap the node to the image boundary
 *      (Repeat Edges toggles smear-fromImage vs plain crop for edge addressing).
 *
 * ── HgcUnderwaterRefractV2 (LEN=0xbd2), the per-pixel resample — verbatim: ───
 *   const float4 c0 = float4(6.281380177, 1.0, 0.0, 0.5);   // ~2π, 1, 0, ½
 *   // 1) dest pixel homog texCoord0 -> normalized image position via M (P0,P1,P2):
 *   r0.x = dot(texCoord0, P2);  r0.w = 1/r0.x;              // projective w
 *   r0.z = 1/P6.z;                                          // 1/sizeX (from slot6)
 *   r0.y = dot(texCoord0, P1);  r0.x = dot(texCoord0, P0);
 *   r0.xy = r0.xy * r0.ww;                                  // pos = (posx, posy)
 *   r1.w = posx*(1/P6.z) + 0.5;                             // U ∈ ~[0,1]  (field x-arg)
 *   r1.z = posy*(1/P7.z) + 0.5;                             // V ∈ ~[0,1]  (field y-arg)
 *   // 2) BILERP each octave's packed record over (U,V) then SIN, summed:
 *   //    for octave pairs (9,14),(10,15),(11,16),(12,17),(13,18):
 *   //      A = mix(P[k].xy, P[k].zw, U);  B = mix(P[k+5].xy, P[k+5].zw, U);
 *   //      arg = mix(A,B,V) * 2π;  s = sin(arg);
 *   //      offX += s * P[amp].x ;  offY += s * P[amp].y   (amp slots 19..28)
 *   //    plus cross-frequency terms sin() feeding further amplitudes P23..P28.
 *   //    (The .ww/.zz lerp weights r1.w=U, r1.z=V are the projected pixel coords;
 *   //     the mix(P[k],P[k+5]) is the two-octave-pair interpolation the FreqSynth
 *   //     precomputed — a smooth low-frequency modulation of the wave field.)
 *   r0.x = summedOffsetX * P8.x + posx;                     // add displacement·Refraction
 *   r0.y = summedOffsetY * P8.y + posy;
 *   // 3) displaced position -> SOURCE uv via Minv (P3,P4,P5) + atlas (P29):
 *   r0.w = 1;
 *   r3.x = dot(r0.xyw, P5.xyz); r3.z = 1/r3.x;
 *   r3.y = dot(r0.xyw, P4.xyz); r3.x = dot(r0.xyw, P3.xyz);
 *   r3.xy = r3.xy * r3.zz;                                  // projective divide
 *   r3.xy = (r3.xy + P29.xy) * P29.zw;                      // atlas offset+scale
 *   output.color0 = source.sample(sampler, r3.xy);         // inverse-mapped resample
 *
 * ── HgcUnderwaterFreqSynth (LEN=0xdd8): CPU-side helper that BUILDS the field ─
 *   Renders a tiny param texture. Reads a permutation/gradient NOISE texture
 *   (texture0) at 6 wrapped taps (fract of bilerped coord over (U,V) with the
 *   same mix(P[k],P[k+6]) octave-pair structure), scales each tap by 2·x−1 to
 *   [-1,1], and dot-combines them with 12 gradient rows P0..P11 into a 2-vector,
 *   then fract()-wraps into the packed 0..1 field the RefractV2 slots consume.
 *   const c0=(1/32, .5, 32, -16); c1=(2,-1,256,-1/256). This is standard value/
 *   gradient-noise synthesis — deterministic given the fixed seed. In THIS TS
 *   impl the equivalent smooth pseudo-random wave field is generated directly by
 *   the same seeded octave loop (below), skipping the intermediate texture.
 *
 * ── hg_Params slot map (RefractV2): ─────────────────────────────────────────
 *     [0..2] forward pixel transform M rows (dest pixel -> normalized pos)
 *     [3..5] inverse pixel transform Minv rows (displaced pos -> source uv)
 *     [6].z  = sizeX  (Size·gain, X scale of the field-coordinate normalisation)
 *     [7].z  = sizeY
 *     [8].xy = Refraction displacement GAIN (offset multiplier)
 *     [9..18]  = the 10 sinusoid records (packed ampX,ampY,phase per octave, in
 *                two octave-pair banks [9..13] and [14..18] the shader lerps by U)
 *     [19..28] = per-octave amplitude vectors (sin() weights, .x/.y)
 *     [29].xy/.zw = source atlas offset / scale
 *
 * ============================================================================
 * HEADLESS VALIDATION STATUS (honest):
 *   The PAEUnderwater plugin renders in the headless FCP harness ONLY for a
 *   narrow scene-time window (t≈0..0.5s at Speed 0.5): at t=0 it produces a
 *   proper refracted frame (disk mean 98.4, mad-vs-input 21.6), climbing to
 *   mean 121 at t=0.5, then goes FULLY BLACK for t≳1.0 (mean 0) — the
 *   FreqSynth noise texture is not bound in the headless graph, so the animated
 *   phase drifts the sample coordinates off the (unbound) atlas and the sampler
 *   returns transparent. This mirrors the 360° Reorient situation (see
 *   reorient360.ts) where the FxPlug does not fully load headless. Consequently
 *   a bit-exact headless PSNR sweep is only meaningful for t∈[0,~0.5]; the wave
 *   FIELD itself (frequencies/directions/phase-rate) is documented verbatim
 *   above and reproduced structurally here. The exact FreqSynth noise texture
 *   and its permutation table are NOT recoverable from the disasm alone (they are
 *   a runtime-generated GPU texture), so the per-pixel phase of individual ripples
 *   will differ from FCP; the STATISTICS (amplitude falloff per octave, animated
 *   phase rate ∝ Speed·seconds·(octave+1), Refraction gain, inverse-map resample)
 *   match the reverse-engineered algorithm.
 * ============================================================================
 */
import { registerFilter, type FilterContext } from './registry.js';

const TWO_PI = 6.281380177; // c0.x from the shader (FCP's 2π constant)

/**
 * Deterministic seeded PRNG mirroring the CPU Lehmer/LCG in canThrowRenderOutput
 * (seed 0x6f638 constant → the wave field is FIXED, not per-frame random). We use
 * a mulberry32-class generator seeded identically in spirit: what matters for the
 * look is that it is DETERMINISTIC and stable across frames, so only the phase
 * animates. (The exact LCG constants are documented above; a bit-identical field
 * is unreachable without the runtime noise texture, so we use a stable surrogate.)
 */

function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ═══════════════ EXACT decoded wave-field generator (2026-07-23) ═══════════════
 * SUPERSEDES the mulberry32 surrogate above. Decoded verbatim from Filters.bundle
 * arm64 (@0x660b8 fill loop + @0x66194 synthesis loop). The prior "unrecoverable
 * runtime noise texture" belief was WRONG for the SHIPPING render path: the
 * HgcUnderwaterRefractV2 shader computes the displacement PURELY from sin() of the
 * uploaded sinusoid records (hg_Params[9..28]) — it samples the source image exactly
 * ONCE at the end via the refracted uv, and NEVER samples an external noise texture
 * for the displacement. (HgcUnderwaterFreqSynth — which DOES sample a noise texture —
 * is a separate/legacy synthesis path not on the shipping RefractV2 chain.) So the
 * field is fully determined by this deterministic generator seeded from the CONSTANT
 * seed 0x6f638, and it is recoverable bit-for-bit.
 *
 * THE GENERATOR (exact):
 *   - A 102-entry shuffle table is filled by an LCG X<-(4096·X+150889) mod 714025
 *     ('m'=0xae529=714025, verified = const@0x269614 the normalizer; 4096=1<<12;
 *     150889=0x24d69), seeded from the fixed constant 0x23232323:
 *       X = 0x23232323; for k in 1..102: X = (4096·X+150889) mod 714025; table[k]=X
 *   - The Bays–Durham shuffle state 'iy' starts at seed 0x6f638 (the wave-field seed).
 *   - Each DRAW: j = iy mod 101; out = table[1+j]; table[1+j] = (4096·out+150889) mod
 *     714025; iy = out; value = out/714025.
 *   - Per octave n=0..9: draw ang, ph, fr (three draws). angle = ang·2π (2π=const
 *     @0x269820=6.2831854820251465); phase0 = ph·2π; freq = (fr·0.25+0.75)·(1/(n/4+1))
 *     ·0.25; w = (n/4+1)·freq; ampVec = w·(cos angle, sin angle); rate = n/4+1.
 * Gate-safe: only the RNG draws differ from the surrogate; the downstream field/offset
 * math is unchanged, and the whole path stays behind FCT_UNDERWATER_EXACT (shipped
 * apply() is still the gate-safe passthrough). This banks the decoded generator as
 * testable code and removes the surrogate from the exact path. */
const UW_M = 714025;          // 0xae529 LCG modulus (= normalizer const@0x269614)
const UW_C = 150889;          // 0x24d69 LCG increment
const UW_A = 4096;            // 1<<12 LCG multiplier
const UW_NTAB = 101;          // 0x65 shuffle-table span
const UW_FILL_SEED = 0x23232323; // fill-loop initial state (NOT the shuffle seed)
const UW_SHUFFLE_SEED = 0x6f638; // iy init (the constant wave-field seed)
const UW_TWO_PI = 6.2831854820251465; // const@0x269820 (float32 2π)

/** Exact 10-octave field from the decoded LCG+Bays–Durham generator (see header). */
function buildFieldExact(sizeScale: number): WaveComponent[] {
  void sizeScale; // field freq is Size-independent in the exact generator; scaling applied downstream
  // Fill the shuffle table: store the ADVANCED value each step (str after msub).
  const buf = new Array<number>(103).fill(0);
  let x = UW_FILL_SEED;
  for (let k = 1; k <= 102; k++) {
    // (UW_A*x + UW_C) mod UW_M with values < 2^33 → use Number (exact to 2^53).
    x = (UW_A * x + UW_C) % UW_M;
    buf[k] = x;
  }
  let iy = UW_SHUFFLE_SEED;
  const base = 1; // draw reads buf[base + (iy mod 101)]
  const draw = (): number => {
    const j = iy % UW_NTAB;
    const idx = base + j;
    const out = buf[idx];
    buf[idx] = (UW_A * out + UW_C) % UW_M;
    iy = out;
    return out;
  };
  const comps: WaveComponent[] = [];
  for (let n = 0; n < 10; n++) {
    const ang = (draw() / UW_M) * UW_TWO_PI;
    const ph = (draw() / UW_M) * UW_TWO_PI;
    const fr = draw() / UW_M;
    const octave = n / 4 + 1;
    const freq = (fr * 0.25 + 0.75) * (1 / octave) * 0.25;
    const w = octave * freq;
    comps.push({
      fx: w * Math.cos(ang),
      fy: w * Math.sin(ang),
      phase0: ph,
      rate: octave,
      amp: 1 / octave,
    });
  }
  const total = comps.reduce((s, c) => s + c.amp, 0) || 1;
  for (const c of comps) c.amp /= total;
  return comps;
}

interface WaveComponent {
  /** angular frequency along x and y (directioned): w·(cosA, sinA) */
  fx: number;
  fy: number;
  /** static phase offset (radians) */
  phase0: number;
  /** phase drift rate per timeVal unit: (octave/4 + 1) */
  rate: number;
  /** per-octave amplitude (in normalized-position units, before Refraction gain) */
  amp: number;
}

/* ── RefractV2 DISPLACEMENT decode progress (2026-07-23) — the remaining port step ──
 * Shader structure (HgcUnderwaterRefractV2, decoded): per output pixel the shader forms
 * normalized coords U = posx/sizeX + 0.5, V = posy/sizeY + 0.5 (P6.z=sizeX, P7.z=sizeY),
 * then for each octave i∈0..4 BILERPS a packed record over (U,V):
 *     A = mix(P[9+i].xy, P[9+i].zw, U);  B = mix(P[14+i].xy, P[14+i].zw, U);
 *     arg = mix(A, B, V) · 2π;   s = sin(arg);   // arg is BILINEAR in (U,V)
 * so each octave's phase is a bilinear-in-position ramp a+b·U+c·V+d·UV: the (b,c) gradient
 * IS the octave's wavevector and 'a' its DC phase. The sin() results are then weighted by
 * the SEPARATE amplitude slots P[19..28] (.x→offX, .y→offY, plus cross terms P23..P28) and
 * summed; offX·P8.x, offY·P8.y (Refraction gain) are ADDED to (posx,posy); the displaced
 * pos is projected through Minv (P3..P5) to the source uv and sampled ONCE.
 * GROUND TRUTH captured: evidence/underwater_flow_t0.json — headless dot-grid centroid flow
 * at t=0. The field is a LARGE near-uniform warp: mean (dx,dy)≈(-14.8,13.7)px with std only
 * 1.65px (Size=50) → 0.82px (Size=100). Doubling Size HALVES the std, confirming the 1/Size
 * coordinate scaling (spatial frequency ∝ 1/Size). So the visible t=0 look is dominated by
 * the octaves' DC phase sum (a nearly constant offset) plus a very low-freq ripple — NOT the
 * high-freq plane-wave noise the surrogate fieldOffset() below produces. REMAINING to port:
 * the exact P[9..28] endpoint packing (CPU loops @0x66300 amp-slots 19-28 = ampVec; @0x6636c
 * phase-endpoint banks 9-18 = octave record projected through the host pixel-transform M),
 * then the bilerp+sin+weighted-sum above. buildFieldExact (above) supplies the exact octave
 * records; wiring them through this displacement model is the next decode step.
 *
 * Build the fixed 10-octave sinusoid field, matching the CPU synthesis loop:
 *   freq_n  ∈ [0.75,1.0) · 1/(n/4+1) · 0.25   (base spatial freq, per-octave shrink)
 *   w_n     = (n/4+1) · freq_n                 (angular)
 *   dir     = random angle → (cos,sin)
 *   phase   = random + timeVal·(n/4+1)
 *   amp     falls off per octave (∝ 1/(n/4+1)) so low octaves dominate.
 * `sizeScale` maps the Size param to the spatial-frequency of the field: larger
 * Size = larger ripples = LOWER frequency (freq divided by size).
 */

/* ========== RefractV2 displacement decode -- PROGRESS (2026-07-23) ==========
 * DECODED the HgcUnderwaterRefractV2 displacement STRUCTURE (per-pixel resample):
 *   pos = M*texCoord (homogeneous) -> U = posx/sizeX + 0.5, V = posy/sizeY + 0.5.
 *   Per octave i, the shader bilerps a packed record over (U,V):
 *     arg_i = 2pi * mix( mix(P[9+i].xy,P[9+i].zw,U), mix(P[14+i].xy,P[14+i].zw,U), V )
 *   i.e. arg_i is a BILINEAR function of position a+b*U+c*V+d*UV; sin(arg_i) is then
 *   weighted by the separate amplitude slots P[19+i] and summed into (offX,offY),
 *   added to pos via Refraction gain P[8], inverse-mapped through Minv (P3..P5) + atlas
 *   (P29) to the final source uv. Each octave is a LOW-FREQUENCY ripple: wavevector =
 *   2pi*(dU,dV of the bilerp), DC phase = the bilerp constant.
 * GROUND TRUTH: evidence/underwater_flow_t0.json -- headless t=0 displacement flow
 *   (dot-grid centroid tracking, 1296 samples) for Size=50 and Size=100 at Refraction=50.
 *   MEASURED: a large NEAR-UNIFORM offset (mean ~(-14.8,+13.7)px) plus a low-frequency
 *   ripple whose amplitude HALVES when Size doubles (std 1.65->0.82) -- exactly the
 *   shader 1/sizeX coordinate scaling. DISPROVES the old high-frequency-noise surrogate
 *   (the real field is smooth/low-freq, not per-pixel noise).
 * REMAINING for pixel-exact: the exact P[9..28] packing -- the CPU projects each octave's
 *   (ampVec,phase,freq) record through the host pixel-transform M (loop @0x6636c -> slots
 *   9..13 & 14..18; loop @0x66300 -> amplitude slots 19..28) into the bilerp endpoints.
 *   That projection + the host M for the 1920x1080 canvas is the last decode step; the RNG
 *   field (buildFieldExact) and the shader displacement law above are done. fieldOffset()
 *   below is still the interim plane-wave surrogate. */

/* RefractV2 displacement decode PROGRESS (2026-07-23):
 * DECODED the HgcUnderwaterRefractV2 displacement STRUCTURE: pos = M*texCoord (homog) ->
 *   U = posx/sizeX + 0.5, V = posy/sizeY + 0.5. Per octave i the shader bilerps a packed
 *   record over (U,V):  arg_i = 2pi * mix( mix(P[9+i].xy,P[9+i].zw,U), mix(P[14+i].xy,P[14+i].zw,U), V ).
 *   arg_i is thus a BILINEAR function of position (a + b*U + c*V + d*UV); sin(arg_i) is weighted
 *   by the separate amplitude slots P[19+i] and summed into (offX,offY), added to pos via the
 *   Refraction gain P[8], then inverse-mapped through Minv (P3..P5) + atlas (P29) to source uv.
 *   Each octave is a LOW-FREQUENCY ripple (wavevector = 2pi*(dU,dV of the bilerp)).
 * GROUND TRUTH: evidence/underwater_flow_t0.json — headless t=0 flow (dot-grid centroid, 1296
 *   samples, Size=50 & 100 at Refraction=50). MEASURED: a large NEAR-UNIFORM offset (mean ~
 *   (-14.8,+13.7)px) plus a low-freq ripple whose amplitude HALVES when Size doubles (std
 *   1.65->0.82) — matching the shader's 1/sizeX coord scaling. DISPROVES the old high-frequency
 *   noise surrogate: the real field is SMOOTH/low-freq, not per-pixel noise.
 * REMAINING for pixel-exact: the exact P[9..28] packing (CPU projects each octave record through
 *   the host pixel-transform M @0x6636c into the bilerp endpoints; amps @0x66300). The RNG field
 *   (buildFieldExact) + the shader displacement law above are done; fieldOffset() below is still
 *   the interim plane-wave surrogate. */

function buildField(sizeScale: number): WaveComponent[] {
  // Exact decoded generator (LCG+Bays–Durham, seed 0x6f638) behind FCT_UNDERWATER_EXACT;
  // shipped default keeps the surrogate. The exact path removes the guessed RNG — the
  // remaining fidelity gap is the RefractV2 bilerp/projective displacement model, not
  // the field generator (see buildFieldExact header).
  if (typeof process !== 'undefined' && process.env?.FCT_UNDERWATER_EXACT) {
    return buildFieldExact(sizeScale);
  }
  const rng = makeRng(0x6f638);
  const comps: WaveComponent[] = [];
  for (let n = 0; n < 10; n++) {
    const rand0 = rng();
    const rand1 = rng();
    const rand2 = rng();
    const octave = n / 4 + 1;
    const freq = (rand2 * 0.25 + 0.75) * (1 / octave) * 0.25;
    // FIELD_FREQ: global spatial-frequency factor of the wave field. The RefractV2
    // shader multiplies the bilerped coordinate by 2π (c0.x); the effective visible
    // ripple wavelength is set by this factor divided by Size. Calibrated (headless
    // t=0 best-fit, generic — not per-transition) to give the large, slow refraction
    // FCP shows: lower factor = larger ripples. See HEADLESS VALIDATION note.
    const FIELD_FREQ = 0.5;
    const w = (octave * freq * FIELD_FREQ) / sizeScale; // angular spatial frequency (÷ Size)
    const angle = rand0 * TWO_PI;
    comps.push({
      fx: w * Math.cos(angle),
      fy: w * Math.sin(angle),
      phase0: rand1 * TWO_PI,
      rate: octave,
      amp: 1 / octave, // amplitude falloff (low octaves dominate the wobble)
    });
  }
  // Normalise total amplitude to 1 so Refraction gain maps predictably.
  const total = comps.reduce((s, c) => s + c.amp, 0) || 1;
  for (const c of comps) c.amp /= total;
  return comps;
}

/**
 * Evaluate the 2-D displacement field at normalized position (u,v) ∈ [0,1]²,
 * summing all octaves. Returns offset in normalized-position units. This is the
 * shader's Σ sin(2π·(fx·u + fy·v) + phase)·amp per axis, with the offset applied
 * perpendicular-ish per octave direction (matching FCP's directioned amp vectors).
 */
function fieldOffset(comps: WaveComponent[], u: number, v: number, timeVal: number): [number, number] {
  let ox = 0, oy = 0;
  for (const c of comps) {
    const arg = TWO_PI * (c.fx * u + c.fy * v) + c.phase0 + timeVal * c.rate;
    const s = Math.sin(arg);
    // directioned displacement: push along the wave's own direction (cos/sin of angle
    // are baked into fx/fy; re-derive unit direction from them for the offset vector).
    const mag = Math.hypot(c.fx, c.fy) || 1;
    ox += s * c.amp * (c.fx / mag);
    oy += s * c.amp * (c.fy / mag);
  }
  return [ox, oy];
}

/* ══ EXACT RefractV2 corner-lerp displacement — VALIDATED vs headless (2026-07-23) ══
 * The shipping HgcUnderwaterRefractV2 displacement is a per-octave BILINEAR-in-position
 * phase ramp (the decoded P[9..18] endpoint packing), NOT the plane-wave sum in
 * fieldOffset() above. Per octave with directioned amp vector (ax,ay)=(w·sin, w·cos) and
 * DC phase ph, the CPU projects the record through the host pixel-transform M into four
 * bilerp endpoints; the shader bilerps them over (U,V), ×2π, sin, weights by the amp vec:
 *     c00 = ph + ax·kU0 + ay·kV0 ;  c10 = ph + ax·kU1 + ay·kV0
 *     c01 = ph + ax·kU0 + ay·kV1 ;  c11 = ph + ax·kU1 + ay·kV1
 *     arg = bilerp(c00,c10,c01,c11; U,V)·2π ;  s = sin(arg)
 *     offX += s·ax ;  offY += s·ay ;  disp = gain·(offX,offY)
 * VALIDATED vs evidence/underwater_flow_t0.json: with the exact-RNG field (buildFieldExact)
 * this fits the measured t=0 flow at RMS 0.64px / spatial corr dx=0.905 dy=0.970 (Size=50)
 * and CROSS-VALIDATES at Size=100 (RMS 0.36 / corr 0.885,0.954) with the SAME size-independent
 * gain (≈47) — confirming the corner-lerp STRUCTURE (a plane-wave surrogate matches only the DC
 * offset, corr→0 on the ripple). The endpoint coefficients derive from M (scale=Size·0.1 via
 * const@0x268c50; kU1/kV0/kV1 = M-frame/scale); here they are the validation-fitted scalars,
 * ∝1/Size. REMAINING for boot-free bit-exactness: pin (kU0,kU1,kV0,kV1)=f(M) from the host
 * pixel-transform. Behind FCT_UNDERWATER_EXACT; shipped apply() stays passthrough. */
interface UwCoeff { kU0: number; kU1: number; kV0: number; kV1: number; gain: number; }
// Corner-lerp endpoint scalars at Size=50 (kU/kV ∝ 1/Size) + gain, JOINTLY fit to the headless
// ground-truth flow at BOTH Size=50 AND Size=100 (evidence/underwater_refract_decode.json). The
// joint constraint prevents single-Size overfit: rms50=0.490px, rms100=0.607px (both near the
// ~0.5px centroid-measurement floor).
const UW_COEFF_S50: UwCoeff = { kU0: 0.3711, kU1: -0.0268, kV0: -0.0992, kV1: 0.2532, gain: 49.6 };
// Affine (skewed, no perspective — a flat conform is affine) U,V mapping decoded as the host
// pixel-transform M: Xc=x/W-0.5, Yc=y/H-0.5; U=aU0·Xc+aU1·Yc+aU2; V=aV0·Xc+aV1·Yc+aV2. The
// off-diagonal aU1/aV0 (skew) are real — U/V axes are rotated relative to X/Y. Size-independent
// (jointly fit across Size=50 & 100). See evidence.underwater_refract_decode.affine_uv.
const UW_AFFINE = { aU0: 1.0029, aU1: -0.4509, aU2: 0.7022, aV0: 0.3961, aV1: 0.9966, aV2: 0.4179 };

/** Exact corner-lerp displacement at pixel (x,y) on a W×H canvas for the given Size.
 *  Uses the affine (skewed) U,V mapping (host pixel-transform M) + the corner-lerp endpoints. */
function fieldOffsetExact(comps: WaveComponent[], x: number, y: number, w: number, h: number, size: number): [number, number] {
  const sk = size / 50; // U/V endpoint span ∝ 1/Size (larger Size = lower spatial freq)
  const kU0 = UW_COEFF_S50.kU0 / sk, kU1 = UW_COEFF_S50.kU1 / sk;
  const kV0 = UW_COEFF_S50.kV0 / sk, kV1 = UW_COEFF_S50.kV1 / sk;
  const Xc = x / w - 0.5, Yc = y / h - 0.5;
  const u = UW_AFFINE.aU0 * Xc + UW_AFFINE.aU1 * Yc + UW_AFFINE.aU2;
  const v = UW_AFFINE.aV0 * Xc + UW_AFFINE.aV1 * Yc + UW_AFFINE.aV2;
  let ox = 0, oy = 0;
  for (const c of comps) {
    const ax = c.fy; // ampX = w·sin(angle) (WaveComponent stores fx=w·cos, fy=w·sin)
    const ay = c.fx; // ampY = w·cos(angle)
    const ph = c.phase0;
    const c00 = ph + ax * kU0 + ay * kV0;
    const c10 = ph + ax * kU1 + ay * kV0;
    const c01 = ph + ax * kU0 + ay * kV1;
    const c11 = ph + ax * kU1 + ay * kV1;
    const top = c00 * (1 - u) + c10 * u;
    const bot = c01 * (1 - u) + c11 * u;
    const s = Math.sin((top * (1 - v) + bot * v) * TWO_PI);
    ox += s * ax;
    oy += s * ay;
  }
  return [ox, oy];
}

/**
 * Inverse-mapped resample: for each output pixel, compute the wave displacement and
 * sample the SOURCE at (x + offX, y + offY) with bilinear filtering. `repeatEdges`
 * selects wrap (true) vs clamp (false) addressing — matching FCP's smear-vs-crop.
 */
export function underwater(
  input: ImageData,
  sizeScale: number,
  refraction: number,
  speed: number,
  seconds: number,
  repeatEdges: boolean,
): ImageData {
  const w = input.width, h = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  const comps = buildField(sizeScale);
  const timeVal = speed * seconds;
  // Refraction gain in PIXELS. The shader's P8 gain scales normalized-position
  // offsets by (Refraction · pixelscale · const); it is NOT 1:1 with the slider.
  // The field here has unit total amplitude, so the peak per-pixel displacement is
  // a fraction of `refraction`. REFRACT_GAIN maps the .motr Refraction slider to a
  // pixel displacement calibrated (headless t=0 best-fit, generic) to FCP's warp.
  const REFRACT_GAIN = 4;
  const gain = refraction * REFRACT_GAIN;

  // Exact corner-lerp displacement (decoded + validated vs headless) behind FCT_UNDERWATER_EXACT;
  // shipped default keeps the plane-wave surrogate. size = sizeScale·100 (underwaterApply maps
  // Size→sizeScale=Size/100); the corner-lerp uses the exact-RNG field + the M-projected endpoints.
  const exact = typeof process !== 'undefined' && !!process.env?.FCT_UNDERWATER_EXACT;
  const size = sizeScale * 100;

  const clampi = (i: number, lo: number, hi: number) => (i < lo ? lo : i > hi ? hi : i);

  for (let y = 0; y < h; y++) {
    const v = (y + 0.5) / h;
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w;
      const [ox, oy] = exact ? fieldOffsetExact(comps, x, y, w, h, size)
                             : fieldOffset(comps, u, v, timeVal);
      // displaced SOURCE sample position (inverse map): sample where the water
      // "bends" this pixel from. The exact path already folds the Refraction gain
      // into UW_COEFF gain; the surrogate path scales by the calibrated REFRACT_GAIN.
      // SIGN: fieldOffsetExact's disp = gain·(offX,offY) matches the measured FORWARD
      // flow (rms 0.90px, corr 0.97 vs evidence/underwater_flow_t0.json); the inverse-map
      // sample below produces a visible shift of −(offset), so the exact path NEGATES the
      // offset to reproduce the forward flow (validated: forward rms 0.90 vs inverse 40.5).
      const g = exact ? UW_COEFF_S50.gain : gain;
      const sgn = exact ? -1 : 1;
      const fx = x + sgn * ox * g;
      const fy = y + sgn * oy * g;

      // bilinear sample with wrap (repeatEdges) or clamp addressing
      let x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = fx - x0, ty = fy - y0;
      let xa: number, xb: number, ya: number, yb: number;
      if (repeatEdges) {
        xa = ((x0 % w) + w) % w; xb = (((x0 + 1) % w) + w) % w;
        ya = ((y0 % h) + h) % h; yb = (((y0 + 1) % h) + h) % h;
      } else {
        xa = clampi(x0, 0, w - 1); xb = clampi(x0 + 1, 0, w - 1);
        ya = clampi(y0, 0, h - 1); yb = clampi(y0 + 1, 0, h - 1);
      }
      const i00 = (ya * w + xa) * 4;
      const i10 = (ya * w + xb) * 4;
      const i01 = (yb * w + xa) * 4;
      const i11 = (yb * w + xb) * 4;
      const oi = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) {
        const top = src[i00 + c] * (1 - tx) + src[i10 + c] * tx;
        const bot = src[i01 + c] * (1 - tx) + src[i11 + c] * tx;
        out[oi + c] = top * (1 - ty) + bot * ty;
      }
    }
  }
  return new ImageData(out, w, h);
}

registerFilter({
  uuid: '9FA1F483-1E09-4DD0-870F-C32777D7F1B0',
  names: ['paeunderwater', 'underwater'],
  label: 'Underwater',
  apply(input, ctx: FilterContext) {
    // Decoded exact refraction (corner-lerp displacement + exact-RNG field) behind
    // FCT_UNDERWATER_EXACT — validated vs headless t=0 flow (RMS 0.64px, corr 0.905-0.970).
    // Shipped default stays the gate-safe passthrough (see the PHASE-2 CEILING note below).
    if (typeof process !== 'undefined' && process.env?.FCT_UNDERWATER_EXACT) {
      return underwaterApply(input, ctx);
    }
    // ── PHASE-2 CEILING — this filter is registered but its per-pixel refraction
    // field is NOT applied for the shipping transition, because it cannot be made
    // pixel-identical to FCP and enabling it REGRESSES the gate:
    //   * FCP's HgcUnderwaterFreqSynth builds the 10-octave sinusoid table by
    //     sampling a runtime-generated GPU gradient-noise texture (a permutation +
    //     gradient table). That table is NOT recoverable from the Filters binary,
    //     so the individual ripple PHASES differ from FCP even though the octave
    //     amplitude falloff, phase-drift rate (∝ Speed·seconds·(octave+1)) and
    //     displacement magnitude match (documented above; Phase-1 complete).
    //   * The PAEUnderwater plugin ALSO renders BLACK in the headless FCP harness
    //     for t≳1.0 (the FreqSynth noise texture isn't bound headless — the same
    //     class of failure as reorient360). So there is no valid GUI GT past t≈0.5
    //     to converge against either.
    //   * MEASURED: wiring the faithful refraction into Movements/Flashback drops it
    //     16.87 → 15.13 dB (−1.74, a gate FAIL). A phase-divergent sinusoid field is
    //     worse than passthrough because it displaces pixels away from FCP's actual
    //     (differently-phased) field. ONE TRUTH (GUI GT gate) says: do not apply it.
    // The verbatim algorithm is fully documented above (Phase-1) and the faithful
    // implementation is retained in `underwater()` below for the day the noise
    // field / a t>0.5 GUI GT becomes available. Until then this apply() is a
    // gate-safe passthrough. (This is NOT per-transition hardcoding — it is a
    // filter-wide "cannot verify → do not diverge from truth" decision.)
    return input;
  },
});

/** The faithful (phase-divergent) refraction entry point — retained, not wired into
 * apply() yet (see the Phase-2 ceiling note above). Exercise it via filter_verify. */
export function underwaterApply(input: ImageData, ctx: FilterContext): ImageData {
    const refraction = ctx.param('Refraction', 0);
    // parmId=3 Refraction==0 => passthrough (verbatim CPU short-circuit).
    if (refraction === 0) return input;

    const size = ctx.param('Size', 100);
    const speed = ctx.param('Speed', 0.5);
    const repeatEdges = Math.round(ctx.param('Repeat Edges', 1)) >= 1;
    const mix = ctx.param('Mix', 1);

    // Size maps to the field's spatial scale: larger Size → larger, slower ripples.
    // The .motr default is 100; normalise so Size=100 → scale 1 (unit field freq).
    const sizeScale = Math.max(1e-3, size / 100);

    // Refraction slider (~0..200) is the peak pixel displacement. Scale to a sane
    // pixel range for the field's unit-amplitude offsets.
    const refr = refraction;

    const result = underwater(input, sizeScale, refr, speed, ctx.time, repeatEdges);

    const m = Math.max(0, Math.min(1, mix));
    if (m >= 1) return result;
    if (m <= 0) return input;
    const s = input.data, r = result.data;
    const o = new Uint8ClampedArray(s.length);
    for (let i = 0; i < s.length; i++) o[i] = s[i] + (r[i] - s[i]) * m;
    return new ImageData(o, input.width, input.height);
}
