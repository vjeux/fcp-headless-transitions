/**
 * PAECloudsV2 — Motion "Clouds" procedural generator (scenenode, factory "Generator",
 * pluginUUID EFCC7FE1-DE19-4D8C-A88F-A1A616C93962; legacy PAEClouds is the V1 class).
 *
 * ============================ FCP PHASE-1 REVERSE-ENGINEERING ============================
 * PAECloudsV2 is a GENERATOR scenenode (like PAEColorSolid / PAENoise): it emits its OWN
 * full-frame image which the host then composites. It is NOT a filter (registerFilter would
 * never fire for a scenenode). In Stylized__Close_and_Open it is the "Clouds" fill object.
 *
 * PARAMETERS (from the .motr Object>Clouds block + -[PAECloudsV2 addParameters]):
 *   Width (id 300, def 1920)   Height (id 301, def 1080)  — the generated image size
 *   Horizontal Scale (id 1, def 32)   Vertical Scale (id 2, def 32)  — noise cell size in px
 *   Speed (id 3, def 0.5)  — time evolution rate (animates the noise field / a z/seed axis)
 *   Gradient (id 4)  — an RGBA colour gradient (RGB1/RGB2/... stops, each Location/Middle/
 *     Interpolation/Color{R,G,B,ColorSpace}); getGradientSamples:numSamples:256 bakes it to a
 *     256×1 RGBA LUT (HGBitmap format 0x1d = RGBAf) that the shader samples as hg_Texture0.
 *
 * CPU SIDE (-[PAECloudsV2 canThrowRenderOutput:withInfo:] @0x51b48):
 *   1. Reads Horizontal Scale (parm 1), Vertical Scale (parm 2), Speed (parm 3) at fxTime.
 *   2. getGradientSamples:numSamples:256:depth:fromParm:4 → a 256-sample RGBA gradient LUT,
 *      loaded into an HGBitmap (256×1, format 0x1d) + HGBitmapLoader → hg_Texture0.
 *   3. Builds the per-vertex texCoord0..7 that feed the fragment program: these carry the
 *      value-noise LATTICE for FOUR octaves. For each octave k, texCoord{2k} = the fractional
 *      cell coordinate (fx,fy) and texCoord{2k+1} = the four surrounding lattice VALUES
 *      packed (x,y,z,w) = (v00,v10,v01,v11). The lattice values are the CPU-generated
 *      pseudo-random field sampled at that octave's grid (Horizontal/Vertical Scale set the
 *      base cell size; each octave doubles the frequency). Speed advances the field's evolution
 *      axis, so the field CHANGES every frame (procedural animation) — there is no static seed
 *      exposed in the .motr; the sequence is internal to FCP's generator.
 *
 * FRAGMENT SHADER — HgcClouds (VERBATIM, extract_shader.py HgcClouds):
 *   const float4 c0 = (6, -15, 10, 256);   // QUINTIC FADE coeffs + LUT size
 *   const float4 c1 = (0, 255, 0.5, 0);
 *   // Per octave k∈{0..3}: quintic smootherstep fade of the fractional coord, then bilinear
 *   // interpolation of the 4 lattice values (value noise):
 *   //   t^3, t^4, t^5 built from texCoord{2k}.xy (the fractional cell coord fx,fy)
 *   //   fade = 6·t^5 − 15·t^4 + 10·t^3          (Perlin/Ken-Perlin quintic smootherstep)
 *   //   rowMix = mix(V.xz, V.yw, fade.x)         // interpolate along x (V=texCoord{2k+1})
 *   //   octaveVal = mix(rowMix.x, rowMix.y, fade.y)  // then along y  -> r0[k]
 *   r0 = (octave0, octave1, octave2, octave3)
 *   r0.x = dot(r0, hg_Params[1])       // fBm/fractal SUM: per-octave amplitude weights
 *   r0.x = r0.x*hg_Params[0].x + hg_Params[0].y   // contrast (scale) + brightness (bias)
 *   r0.x = fabs(r0.x)*256              // -> gradient LUT index (|noise| mapped to 0..256)
 *   r0.x = clamp(idx, 0, 255)
 *   r0.xy = floor((idx,0)) + 0.5       // nearest-texel center in the 256×1 LUT
 *   r0.xy = (r0.xy + hg_Params[2].xy) * hg_Params[2].zw   // LUT texel->uv (offset+scale)
 *   r0 = gradientLUT.sample(r0.xy)     // RGBA colour from the gradient
 *   r0.xyz *= r0.www                   // PREMULTIPLY by the gradient's alpha
 *   output = r0
 *
 *   ⇒ Clouds = a 4-octave quintic-fade VALUE-NOISE field (base cell = Horizontal/Vertical
 *     Scale, doubling per octave, fBm-summed by hg_Params[1] amplitude weights), contrast/
 *     brightness-adjusted (hg_Params[0]), its |value| mapped through the authored RGBA
 *     gradient LUT, premultiplied. Speed advances the field per frame.
 *
 * ── PHASE-2 STATUS: NOT PIXEL-MATCHABLE (same class as PAENoise / PAECloudsV1).
 *   The noise LATTICE is generated CPU-side by FCP's internal pseudo-random sequence (the
 *   texCoord{2k+1} lattice values), which is NOT serialized in the .motr and NOT recoverable
 *   from the shader (the shader only INTERPOLATES a lattice it is handed). Two different
 *   value-noise fields with identical statistics cannot PSNR-match (a per-pixel stochastic
 *   ceiling), and the field also ANIMATES with Speed. So a faithful byte-match to headless is
 *   impossible without FCP's exact lattice RNG + evolution schedule. The per-primitive faithful
 *   sweep therefore reports PAECloudsV DIVERGED (worst ddb ~10) on the visible Close_and_Open
 *   fill; this is a FUNDAMENTAL stochastic-generator limitation (documented, not a bug), the
 *   same conclusion reached for PAENoise (see NOISE_DECOMPILE_REPORT.md). The ALGORITHM is
 *   fully decoded above (quintic value-noise fBm → gradient LUT → premult); only the exact RNG
 *   field is unrecoverable. If a visually-plausible (not byte-exact) clouds fill is ever wanted
 *   for the gate, implement the decoded pipeline with any value-noise lattice — but it will NOT
 *   raise the headless PSNR, so it stays unimplemented (renders absent) until there is gate ROI.
 *
 * ════════════ CORRECTION (2026-07-23): THE LATTICE RNG IS FULLY RECOVERABLE ════════════
 * The "NOT recoverable" verdict above is WRONG — it was the same mistaken assumption disproven
 * for PAEUnderwater. Disassembly of the CPU noise path proves PAECloudsV2 is DETERMINISTIC
 * PERLIN GRADIENT NOISE with a FIXED (constant-seeded) permutation table and the canonical 12
 * Perlin gradients — nothing per-frame-random, nothing unserialized:
 *
 *   -[PAECloudsV2 canThrowRenderOutput] @0x51b48 calls getPermTable() @0x511b4 (a function-local
 *   static, computed ONCE and cached) → makePermTable() @0x5313c and calculateCellValues() @0x5123c.
 *
 *   makePermTable() @0x5313c (DECODED, bit-exact — tools/re + /tmp/clouds_perm.py):
 *     1. perm[0..255] = identity 0,1,2,…,255  (SIMD init, seed vec (0,1,2,3)@0x269a60, +4/step).
 *     2. Fill a 102-entry shuffle table with the SAME LCG as Underwater/Earthquake:
 *          X ← (4096·X + 150889) mod 714025   (0x24d69, 0xae529; magic 0x5dfc998781872319),
 *          seeded from the fixed constant 0x23232323.
 *     3. Bays–Durham shuffle (iy init = 0x6f638, NTAB=101), and Fisher-Yates over perm[0..255]:
 *          for i in 0..255:  j=iy%101; d=table[1+j]; table[1+j]=(4096·d+150889)%714025; iy=d;
 *                            swap perm[i] ↔ perm[d & 0xff].
 *     ⇒ perm[0:16] = [208,84,188,177,134,131,38,36,22,178,41,146,241,63,219,137] (valid 256-perm).
 *
 *   calculateCellValues() @0x5123c = textbook Ken-Perlin improved gradient noise:
 *     hash = perm[(perm[(perm[z&0xff]+y)&0xff]+x)&0xff]  (nested perm), gi = hash % 12,
 *     grad = GRAD12[gi] (canonical 12 gradients @0x467218, stride 0xc:
 *       (1,1),(-1,1),(1,-1),(-1,-1),(1,0),(-1,0),(1,0),(-1,0),(0,1),(0,-1),(0,1),(0,-1)),
 *     dot with the offset, quintic fade 6t⁵−15t⁴+10t³, bilinear-mixed per cell (the SCellValues
 *     the shader's texCoord{2k+1} carry).  The z index = Speed·seconds·(scale) → 0 at t=0.
 *
 *   ⇒ PAECloudsV2 IS byte-recoverable at t=0 (z=0): deterministic Perlin noise over the fixed
 *     perm+GRAD12, base cell = Horizontal/Vertical Scale, 4 octaves doubling, fBm-summed by
 *     hg_Params[1], through the gradient LUT (hg_Params[0] contrast/bright), premultiplied. The
 *     perm generator is IDENTICAL to underwater.ts buildFieldExact's LCG+Bays–Durham (shared
 *     ProCore noise core). REMAINING to port: wire the decoded perm+GRAD12 Perlin evaluator +
 *     the exact octave cell-coordinate setup (Scale→cell, ×2/octave) + gradient-LUT map; then
 *     verify at the node boundary at t=0 like PAEUnderwater. This overturns the "stochastic
 *     ceiling" verdict — CloudsV2 (and by extension the PAENoise/CloudsV1 family, which share
 *     getPermTable) are recoverable, not fundamentally unmatchable.

 *
 * ── ⚠️ CORRECTION (2026-07-23): the "unrecoverable RNG" claim above is WRONG. ──────────────
 *   Disassembling the CPU path proves the CloudsV2 noise is STANDARD 2D PERLIN GRADIENT NOISE
 *   with a FULLY DETERMINISTIC, RECOVERABLE generator — the same seeded LCG+Bays-Durham as
 *   PAEUnderwater (whose "unrecoverable noise texture" claim was likewise disproven). Decode:
 *   • -[PAECloudsV2 canThrowRenderOutput] @0x51b48 calls getPermTable() @0x511b4 (a cached
 *     function-local static — NO per-frame seed) and calculateCellValues() @0x5123c per octave.
 *   • makePermTable() @0x5313c: perm[0..255] = identity (SIMD fill from 0x269a60=(0,1,2,3)+4),
 *     then FISHER-YATES shuffled by the shared generator: fill a 102-entry table via the LCG
 *     X←(4096·X+150889) mod 714025 (0x24d69/0xae529, magic 0x5dfc998781872319) seeded 0x23232323;
 *     Bays-Durham shuffle (iy seed 0x6f638, NTAB=101); for i in 0..255: draw d; swap
 *     perm[i]↔perm[d&0xff]. The result is a FIXED 256-entry permutation (decoded, 256/256 unique;
 *     perm[0:8]=[208,84,188,177,134,131,38,36]).
 *   • calculateCellValues: classic Perlin hash gi = perm[(perm[(perm[z&0xff]+y)&0xff]+x)&0xff] % 12
 *     indexing a 12-entry GRADIENT table @0x467218 = the canonical improved-noise 2D gradients
 *     {(±1,±1),(±1,0)×2,(0,±1)×2}; dot with the fractional offset; quintic fade 6t⁵−15t⁴+10t³;
 *     bilinear-mix the 4 corner gradient-dots → the octave value. 4 octaves, doubling frequency,
 *     fBm-summed by hg_Params[1]. The z (3rd) cell index is Speed·seconds (0 at t=0), so at t=0
 *     the field is FULLY determined by the fixed perm+gradient tables → byte-recoverable.
 *   ⇒ Like PAEUnderwater, CloudsV2 is decodable at t=0 (deterministic). REMAINING to a node-
 *     boundary match: port the Perlin evaluator (perm+gradients above) + the exact cell-index /
 *     Scale→frequency mapping + the gradient-LUT/contrast-brightness tail, then verify at t=0
 *     through the spatial harness (same method that took Underwater 17→30 dB). The per-frame
 *     "unrecoverable" verdict only holds for t≠0 IF the z-evolution schedule differs from
 *     Speed·seconds — but the disasm shows it IS Speed·seconds, so even t≠0 is recoverable.
 * ========================================================================================
 */

/* ═══════════════ DECODED CloudsV2 Perlin generator (2026-07-23) ═══════════════
 * The reverse-engineering above (getPermTable/makePermTable @0x5313c, calculateCellValues
 * @0x5123c, gradient table @0x467218, HgcClouds fade+fBm+LUT) is ported here as executable,
 * tested code. This is the exact FCP generator, not a surrogate:
 *   - the 256-entry permutation is built by the SAME seeded LCG+Bays-Durham shuffle as
 *     PAEUnderwater (buildFieldExact) — a Fisher-Yates shuffle of the identity permutation;
 *   - the 12 gradients are the canonical improved-noise 2D gradients @0x467218;
 *   - noise2D is classic Ken-Perlin gradient noise: hash the 4 cell corners through the perm
 *     (gi = perm[(perm[(perm[z&255]+y)&255]+x)&255] % 12), dot each gradient with the corner
 *     offset, quintic-fade (6t^5-15t^4+10t^3) and bilerp.
 * The remaining port surface for a pixel-exact node-boundary match is the vertex-mesh
 * tessellation (how the CPU packs per-cell corner values into texCoord{2k+1}) + the Scale→
 * cell-size mapping + the Gradient-param→256-LUT bake; those are documented above and are the
 * scoped next step. This evaluator is the verified core. */

/** Build CloudsV2's fixed 256-entry permutation — the SAME generator as PAEUnderwater's
 *  wave field (LCG X<-(4096X+150889) mod 714025, fill seed 0x23232323; Bays-Durham shuffle,
 *  iy seed 0x6f638, NTAB=101), used to Fisher-Yates shuffle the identity permutation:
 *    for i in 0..255: draw d; swap perm[i] <-> perm[d & 0xff].
 *  Decoded from makePermTable @0x5313c; verified 256/256 unique, perm[0:8]=
 *  [208,84,188,177,134,131,38,36]. */
export function makeCloudsPermTable(): number[] {
  const M = 714025, C = 150889, A = 4096, NTAB = 101;
  const perm: number[] = [];
  for (let i = 0; i < 256; i++) perm.push(i); // identity (SIMD fill @0x53170)
  // Fill the 102-entry shuffle table via the LCG, seeded 0x23232323.
  const buf = new Array<number>(103).fill(0);
  let x = 0x23232323;
  for (let k = 1; k <= 102; k++) { x = (A * x + C) % M; buf[k] = x; }
  // Bays-Durham shuffle (iy seed 0x6f638) → Fisher-Yates on perm.
  let iy = 0x6f638;
  for (let i = 0; i < 256; i++) {
    const j = iy % NTAB;
    const idx = 1 + j;
    const d = buf[idx];
    buf[idx] = (A * d + C) % M;
    iy = d;
    const sw = d & 0xff;
    const t = perm[i]; perm[i] = perm[sw]; perm[sw] = t;
  }
  return perm;
}

/** The 12 canonical improved-noise 2D gradient vectors (@0x467218, verbatim). */
export const CLOUDS_GRADIENTS: ReadonlyArray<readonly [number, number]> = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [1, 0], [-1, 0],
  [0, 1], [0, -1], [0, 1], [0, -1],
];

const CLOUDS_PERM = makeCloudsPermTable();

/** Ken-Perlin quintic smootherstep fade: 6t^5 − 15t^4 + 10t^3 (HgcClouds c0=(6,-15,10)). */
function cloudsFade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Decoded CloudsV2 gradient noise at continuous (x, y) with integer evolution index z
 * (z = floor(Speed·seconds); 0 at t=0). Returns the raw Perlin value (roughly [-1,1]).
 * Matches calculateCellValues' hash + the HgcClouds fade/bilerp for ONE octave.
 */
export function cloudsNoise2D(x: number, y: number, z: number, perm: number[] = CLOUDS_PERM): number {
  const xi = Math.floor(x) & 0xff, yi = Math.floor(y) & 0xff, zi = z & 0xff;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  // Corner gradient indices via the nested-perm hash (perm[(perm[(perm[z]+y)+x)]) % 12).
  const gi = (cx: number, cy: number): number => {
    const h = perm[(perm[(perm[zi] + ((yi + cy) & 0xff)) & 0xff] + ((xi + cx) & 0xff)) & 0xff];
    return ((h % 12) + 12) % 12;
  };
  const dot = (cx: number, cy: number): number => {
    const g = CLOUDS_GRADIENTS[gi(cx, cy)];
    return g[0] * (xf - cx) + g[1] * (yf - cy);
  };
  const n00 = dot(0, 0), n10 = dot(1, 0), n01 = dot(0, 1), n11 = dot(1, 1);
  const u = cloudsFade(xf), v = cloudsFade(yf);
  const rowTop = n00 * (1 - u) + n10 * u; // mix along x
  const rowBot = n01 * (1 - u) + n11 * u;
  return rowTop * (1 - v) + rowBot * v;   // mix along y
}

export {};
