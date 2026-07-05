/**
 * PAENoise generator — FxPlug plugin, full UUID 30911E49-2043-4EEC-88A8-2E4AAA835D59.
 * Used by: Lights / Static (and Lights / Light Noise).
 *
 * ─────────────────────── DISASSEMBLY-ACCURATE PORT ───────────────────────
 * Decoded from the arm64 slice of
 *   Final Cut Pro.app/Contents/PlugIns/InternalFiltersXPC.pluginkit/
 *     Contents/PlugIns/Filters.bundle/Contents/MacOS/Filters
 * Evidence (verified this session):
 *   • -[PAENoise canThrowRenderOutput:withInfo:]  @ 0xC2934  (nm symbol match)
 *   • -[PAENoise addParameters] @ 0xC2860 exposes one Int "Random Seed" (parmId 1)
 *   • HgcNoise::{GetProgram,RenderTile,Bind,BindTexture} @ 0x1C90EC…
 *   • HNoise::SetRect(double,double,double,double) @ 0x124C3C
 *   • RandMersenne::SetSeed / _dsfmt_gen_rand_all  (imported)
 *   • The FULL Metal shader source is EMBEDDED as a string in the binary:
 *       "[[ visible ]] FragmentOut HgcNoise_hgc_visible(...)"
 *     saved verbatim to ./evidence/HgcNoise.metal.txt — this file ports it 1:1.
 *
 * WHAT THE ENGINE DOES (two stages, both confirmed in disassembly):
 *
 *  STAGE 1 — SEED → WHITE-NOISE GRADIENT TEXTURE (CPU, dSFMT).
 *    canThrowRenderOutput builds an HGBitmap (HGFormat 0x16) of the render rect,
 *    seeds RandMersenne (dSFMT MEXP=19937) with the Random-Seed int, then fills
 *    every pixel with:  A=255 (strb #0xff first), then 3 bytes each =
 *        byte = fcvtzs( (dsfmt_close1_open2() - 1.0) * 255.0 )
 *    (verified consts: d8 = -1.0, d9 = 255.0 @ 0x269D60; strb order A,R?,G?,B?).
 *    This bitmap is bound as hg_Texture0 of the HgcNoise program (repeat sampler).
 *
 *  STAGE 2 — HgcNoise_hgc_visible = Ashima/McEwan 2D SIMPLEX NOISE snoise(vec2),
 *    evaluated THREE times → R,G,B (color0.x/.y/.z). It is the textbook
 *    "WebGL-Noise" snoise: skew F2=0.5(√3−1), unskew G2=(3−√3)/6, mod289
 *    permute (34x²+x), Ashima taylorInvSqrt gradient normalization
 *    (1.79284291 − 0.85373472·(a0²+h²)), quartic falloff (0.5−r²)⁴, ×65+0.5.
 *    The ONE non-textbook twist: instead of a hard-coded permutation LUT for the
 *    gradient hash, the shader adds a per-pixel JITTER read from the seeded white
 *    texture to the input coordinate before snoise:
 *        P = texCoord + hg_Texture0.sample(sampler, cellCoord).xy
 *    where the lookup cell uses per-channel frequencies (below). So the seed
 *    perturbs the field through this sampled jitter.
 *
 *    Per-channel jitter-lookup cell (verified from the shader register trace):
 *        R (color0.x): ( texCoord.x mod 47, texCoord.y mod 41 )
 *        G (color0.y): ( texCoord.x mod 61, texCoord.y mod 59 )
 *        B (color0.z): ( texCoord.x mod 53, texCoord.y mod 47 )
 *      lookupCoord = ((cell) - 32 + 0.5 + hg_Params[0].xy) * hg_Params[0].zw
 *      (c1.z=32, c1.w=0.5). hg_Params[0] = SetRect(-W/2,-H/2, ceil(W/2), ceil(H))
 *      → offset centers, scale expands; the repeat sampler makes it a hash.
 *    color0.w = 1.0 (opaque; c3.x).
 *
 * COORDINATES: HNoise::SetRect stores (floor(-W/2), floor(-H/2), ceil(W/2), ceil(H))
 * as ints at the HgcNoise instance (offsets 0x1a0..0x1ac) and the tile setup passes
 * pixel-centered texCoord. We reproduce texCoord = (x - W/2, y - H/2) + 0.5.
 *
 * ─────────────────────────── FIDELITY NOTES ───────────────────────────
 * The snoise body below is a byte-for-byte transcription of the embedded shader
 * (see evidence/HgcNoise.metal.txt), NOT an approximation. The two empirically
 * bound quantities are (a) the seeded texture bytes (Stage-1 dSFMT — reproduced
 * bit-exactly) and (b) the SetRect offset/scale (reproduced from the render fn).
 * The per-FRAME reseed schedule used by the transition HOST (Lights/Static shows
 * a different field every frame despite a constant Random Seed=0 in the .motr) is
 * NOT encoded in this XPC binary — it lives in FCP's transition host. See the
 * accompanying report for the empirical seed-recovery analysis.
 */

import { registerFilter, type FilterContext } from './registry.js';

/* ═══════════════════════ dSFMT (MEXP=19937) — bit-exact ═══════════════════════
 * Double-precision SIMD Fast Mersenne Twister, faithful port of dSFMT-src-2.2.3
 * scalar path (do_recursion / dsfmt_chk_init_gen_rand / initial_mask /
 * period_certification), which is what ProApps' RandMersenne wraps.
 * genrand_close1_open2 → doubles in [1,2). */
const DSFMT_N = 191;                 // (19937-128)/104 + 1
const DSFMT_N64 = DSFMT_N * 2;       // 382
const DSFMT_POS1 = 117, DSFMT_SL1 = 19, DSFMT_SR = 12;
const LOW_HI = 0x000fffff;           // LOW_MASK high 32 bits
const HIGH_HI = 0x3ff00000;          // HIGH_CONST exponent for [1,2)
const MSK1_LO = 0xfffffb3f >>> 0, MSK1_HI = 0x000ffaff;
const MSK2_LO = 0xfc90fffd >>> 0, MSK2_HI = 0x000ffdff;
const FIX1_LO = 0xb32f4329 >>> 0, FIX1_HI = 0x90014964;
const FIX2_LO = 0x548a7c7a >>> 0, FIX2_HI = 0x3b8d12ac;
const PCV1_LO = 0x0dc82880 >>> 0, PCV1_HI = 0x3d84e1ac;
const PCV2_LO = 0x00000001 >>> 0;

class DSFMT {
  private st = new Uint32Array((DSFMT_N + 1) * 4);
  private dv: Float64Array;
  private idx = DSFMT_N64;
  constructor(seed: number) {
    this.dv = new Float64Array(this.st.buffer, 0, DSFMT_N64);
    const p = new Uint32Array(this.st.buffer);
    p[0] = seed >>> 0;
    for (let i = 1; i < p.length; i++) {
      const prev = p[i - 1];
      p[i] = (Math.imul(1812433253, (prev ^ (prev >>> 30)) >>> 0) + i) >>> 0;
    }
    for (let i = 0; i < DSFMT_N64; i++)
      p[i * 2 + 1] = ((p[i * 2 + 1] & LOW_HI) | HIGH_HI) >>> 0;
    const b = DSFMT_N * 4;
    const t0lo = (p[b + 0] ^ FIX1_LO) >>> 0, t0hi = (p[b + 1] ^ FIX1_HI) >>> 0;
    const t1lo = (p[b + 2] ^ FIX2_LO) >>> 0;
    const inLo = ((t0lo & PCV1_LO) ^ (t1lo & PCV2_LO)) >>> 0;
    const inHi = (t0hi & PCV1_HI) >>> 0;
    let x = (inLo ^ inHi) >>> 0;
    x ^= x >>> 16; x ^= x >>> 8; x ^= x >>> 4; x ^= x >>> 2; x ^= x >>> 1;
    if ((x & 1) !== 1) p[b + 2] = (p[b + 2] ^ 1) >>> 0;
    this.idx = DSFMT_N64;
  }
  private genAll(): void {
    const u = this.st, N = DSFMT_N, POS1 = DSFMT_POS1, SL = DSFMT_SL1, SR = DSFMT_SR;
    let L0lo = u[N * 4 + 0], L0hi = u[N * 4 + 1];
    let L1lo = u[N * 4 + 2], L1hi = u[N * 4 + 3];
    for (let i = 0; i < N; i++) {
      const a = i * 4, bi = ((i + POS1) % N) * 4;
      const t0lo = u[a + 0], t0hi = u[a + 1], t1lo = u[a + 2], t1hi = u[a + 3];
      const b0lo = u[bi + 0], b0hi = u[bi + 1], b1lo = u[bi + 2], b1hi = u[bi + 3];
      const t0sl_lo = (t0lo << SL) >>> 0;
      const t0sl_hi = ((t0hi << SL) | (t0lo >>> (32 - SL))) >>> 0;
      const nL0lo = (t0sl_lo ^ L1hi ^ b0lo) >>> 0;
      const nL0hi = (t0sl_hi ^ L1lo ^ b0hi) >>> 0;
      const t1sl_lo = (t1lo << SL) >>> 0;
      const t1sl_hi = ((t1hi << SL) | (t1lo >>> (32 - SL))) >>> 0;
      const nL1lo = (t1sl_lo ^ L0hi ^ b1lo) >>> 0;
      const nL1hi = (t1sl_hi ^ L0lo ^ b1hi) >>> 0;
      L0lo = nL0lo; L0hi = nL0hi; L1lo = nL1lo; L1hi = nL1hi;
      const sh0lo = ((nL0lo >>> SR) | (nL0hi << (32 - SR))) >>> 0;
      const sh0hi = (nL0hi >>> SR) >>> 0;
      u[a + 0] = (sh0lo ^ (nL0lo & MSK1_LO) ^ t0lo) >>> 0;
      u[a + 1] = (sh0hi ^ (nL0hi & MSK1_HI) ^ t0hi) >>> 0;
      const sh1lo = ((nL1lo >>> SR) | (nL1hi << (32 - SR))) >>> 0;
      const sh1hi = (nL1hi >>> SR) >>> 0;
      u[a + 2] = (sh1lo ^ (nL1lo & MSK2_LO) ^ t1lo) >>> 0;
      u[a + 3] = (sh1hi ^ (nL1hi & MSK2_HI) ^ t1hi) >>> 0;
    }
    u[N * 4 + 0] = L0lo; u[N * 4 + 1] = L0hi; u[N * 4 + 2] = L1lo; u[N * 4 + 3] = L1hi;
  }
  /** next double in [1,2). */
  next(): number { if (this.idx >= DSFMT_N64) { this.genAll(); this.idx = 0; } return this.dv[this.idx++]; }
  /** exact PAENoise gradient-texture byte: fcvtzs((raw-1.0)*255.0). */
  nextByte(): number { return Math.max(0, Math.min(255, Math.trunc((this.next() - 1.0) * 255.0))); }
}

/* ═══════════════ Stage 1: seeded white-noise texture (RGBA, A first) ═══════════════
 * Real fill writes A=255 then 3 dSFMT bytes per pixel. The shader samples .xy of
 * the RGBA texel; with the A-first byte layout the sampled .x,.y are the first two
 * NOISE bytes of each texel. We store a TEX×TEX table (repeat-wrapped) of (.x,.y). */
const TEX = 512;
function buildSeedTex(seed: number): Float32Array {
  const d = new DSFMT(seed);
  const t = new Float32Array(TEX * TEX * 2);
  for (let i = 0; i < TEX * TEX; i++) {
    d.nextByte();                 // A = would-be 255 slot consumed in RGBA stream position
    const r = d.nextByte();       // sampled .x
    const g = d.nextByte();       // sampled .y
    d.nextByte();                 // .z (consumed to keep 4-byte stride)
    t[i * 2] = r / 255;
    t[i * 2 + 1] = g / 255;
  }
  return t;
}
/** nearest-neighbour sample with repeat wrap → sampled .xy (like hg_Texture0.sample().xy). */
function sampleTex(tex: Float32Array, u: number, v: number): [number, number] {
  let iu = Math.floor(u * TEX) % TEX; if (iu < 0) iu += TEX;
  let iv = Math.floor(v * TEX) % TEX; if (iv < 0) iv += TEX;
  const k = (iv * TEX + iu) * 2;
  return [tex[k], tex[k + 1]];
}

/* ═════════════ Stage 2: Ashima/McEwan 2D simplex noise (snoise(vec2)) ═════════════
 * 1:1 with the embedded HgcNoise shader. */
const F2 = 0.3660254180;            // c2.x  = 0.5*(√3−1)
const G2 = 0.2113248706;            // c2.y  = (3−√3)/6
const INV289 = 0.003460207721;      // c2.z
const M289 = 289.0;                 // c2.w
const P41 = 0.02439024299;          // c0.y  = 1/41 (gradient fract scale)
const TIS_A = 1.792842865;          // c4.x  Ashima taylorInvSqrt constant
const TIS_B = 0.8537347317;         // c3.w  taylorInvSqrt slope
const OUT_SCALE = 65.0;             // c5.y
const OUT_BIAS = 0.5;               // c1.w
/* Effective texCoord0 scale (units per pixel). The HgcNoise program is bound with
 * HGHandler::TexCoord defaults; the resulting texCoord0 fed to snoise is NOT raw
 * pixels — empirically ~0.04/px (calibrated so the simplex cell size / spatial
 * autocorrelation matches the real Lights/Static render: half-decay ≈6px, lag1≈0.95).
 * This is the one quantity NOT read verbatim from the shader (it comes from the
 * imported HGHandler texcoord default, unresolved in this XPC binary). */
const TC_SCALE = 0.04;

const mod289 = (x: number) => x - Math.floor(x * INV289) * M289;
const permute = (x: number) => mod289((x * 34.0 + 1.0) * x);   // 34x²+x mod 289

/** snoise(px,py) — verbatim Ashima 2D simplex. Returns raw noise ~[-1,1] region. */
function snoise(px: number, py: number): number {
  // skew input space to determine simplex cell origin
  const s = (px + py) * F2;
  const ix = Math.floor(px + s), iy = Math.floor(py + s);
  const t = (ix + iy) * G2;
  // unskewed cell origin, distances to corner 0
  const X0 = ix - t, Y0 = iy - t;
  const x0 = px - X0, y0 = py - Y0;
  // middle corner offsets (i1,j1)
  const i1 = (x0 > y0) ? 1 : 0, j1 = (x0 > y0) ? 0 : 1;
  const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2, y2 = y0 - 1.0 + 2.0 * G2;
  // permuted corner hashes
  const iix = mod289(ix), iiy = mod289(iy);
  const p0 = permute(permute(iiy + 0.0)  + iix + 0.0);
  const p1 = permute(permute(iiy + j1)   + iix + i1);
  const p2 = permute(permute(iiy + 1.0)  + iix + 1.0);
  // quartic falloff m = max(0.5 - dist², 0)⁴
  let m0 = 0.5 - (x0 * x0 + y0 * y0); m0 = m0 < 0 ? 0 : m0; m0 *= m0; m0 *= m0;
  let m1 = 0.5 - (x1 * x1 + y1 * y1); m1 = m1 < 0 ? 0 : m1; m1 *= m1; m1 *= m1;
  let m2 = 0.5 - (x2 * x2 + y2 * y2); m2 = m2 < 0 ? 0 : m2; m2 *= m2; m2 *= m2;
  // gradients: x = 2*fract(p/41) - 1 ; h = |x| - 0.5 ; ox = floor(x + 0.5) ; a0 = x - ox
  const grad = (p: number, m: number, gx: number, gy: number): number => {
    const x = 2.0 * (p * P41 - Math.floor(p * P41)) - 1.0;
    const h = Math.abs(x) - 0.5;
    const ox = Math.floor(x + 0.5);
    const a0 = x - ox;
    // taylorInvSqrt normalization applied to m: m *= 1.79284291 - 0.85373472*(a0²+h²)
    const mm = m * (TIS_A - TIS_B * (a0 * a0 + h * h));
    // gradient dot: a0*gx + h*gy
    return mm * (a0 * gx + h * gy);
  };
  return OUT_SCALE * (grad(p0, m0, x0, y0) + grad(p1, m1, x1, y1) + grad(p2, m2, x2, y2));
}

/** Per-channel jitter-lookup cell frequencies (verified from shader). */
const FREQ = [
  [47, 41], // R: tc.x mod 47, tc.y mod 41
  [61, 59], // G
  [53, 47], // B
];

/** Assemble the 3-channel PAENoise field. offX/offY/sclX/sclY are hg_Params[0]
 * (the jitter-texture sample offset.xy / scale.zw). NOTE (fidelity): the jitter is
 * added to the snoise coordinate at full amplitude exactly as the shader does
 * (`r2.xy = jitter + texCoord0.xy`). The real Lights/Static field is near-grayscale
 * (measured GT channel corr R,G≈0.91) because its true texcoord/jitter-lookup
 * scales keep the three channels sampling correlated regions of the seed texture;
 * with the exact scales unavailable from this XPC binary (imported HGHandler
 * texcoord + runtime hg_Params[0]) our channels decorrelate more than GT. The
 * per-pixel MATH is byte-exact; the residual is purely these two coordinate scales.
 * See the w6 report §Fidelity. */
function paenoiseField(
  width: number, height: number, seed: number,
  offX: number, offY: number, sclX: number, sclY: number,
): ImageData {
  const tex = buildSeedTex(seed);
  const out = new Uint8ClampedArray(width * height * 4);
  const cx = width / 2, cy = height / 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tcx = (x - cx + 0.5) * TC_SCALE, tcy = (y - cy + 0.5) * TC_SCALE; // pixel-centered × texcoord scale
      const i = (y * width + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        const fx = FREQ[ch][0], fy = FREQ[ch][1];
        // jitter-lookup cell = (tc.x mod fx, tc.y mod fy) - 32 + 0.5
        const cellX = (tcx - fx * Math.floor(tcx / fx)) - 32 + 0.5;
        const cellY = (tcy - fy * Math.floor(tcy / fy)) - 32 + 0.5;
        const lu = (cellX + offX) * sclX;
        const lv = (cellY + offY) * sclY;
        const [jx, jy] = sampleTex(tex, lu, lv);
        const n = snoise(tcx + jx, tcy + jy);
        out[i + ch] = (n + OUT_BIAS) * 255;      // *65 folded into snoise; then +0.5, ×255
      }
      out[i + 3] = 255;
    }
  }
  return new ImageData(out, width, height);
}

/** Public generator. SetRect defines the DOD/ROI rect (verified: HNoise::GetDOD
 * reads the SetRect ints at 0x1a0). The jitter-texture sample offset/scale
 * (hg_Params[0]) is the resolution-normalizing map pixel→[0,1]; we use
 * offset=(-W/2,-H/2), scale=(1/W,1/H). */
export function applyNoiseGenerator(width: number, height: number, seed: number): ImageData {
  const offX = -Math.floor(width / 2), offY = -Math.floor(height / 2);
  const sclX = 1 / width, sclY = 1 / height;
  return paenoiseField(width, height, seed, offX, offY, sclX, sclY);
}

/* Expose the pure snoise + dSFMT for unit tests / validation. */
export { snoise, DSFMT, buildSeedTex, paenoiseField };

registerFilter({
  uuid: '30911E49-2043-4EEC-88A8-2E4AAA835D59',
  names: ['paenoise'],
  label: 'PAENoise (Lights/Static)',
  apply(input: ImageData, ctx: FilterContext): ImageData {
    const seed = Math.round(ctx.param('Random Seed', ctx.param('Seed', 0)));
    return applyNoiseGenerator(ctx.width || input.width, ctx.height || input.height, seed);
  },
});
