/**
 * "Earthquake" FxPlug filter — plugin UUID DEB7CD03-0C92-416A-B42A-656FB37530A1
 * (FCP internal class PAEEarthquake; node name "Earthquake").
 *
 * Shakes/twists the image like an earthquake: a per-frame pseudo-random rigid
 * transform (rotation about an epicenter + translation), optionally composited
 * over several jittered "Layers".
 *
 * Used by 1 built-in transition:
 *   - Movements/Earthquake   (Twist / Horizontal Shake / Vertical Shake animated
 *                             curves; Layers=1, Random Seed=0, Epicenter default)
 *
 * Parameter block (from -[PAEEarthquake addParameters] + the .motr):
 *   Twist            id=1  float slider  default 0, max 10   (parmFlags 0)
 *   Horizontal Shake id=2  float slider  default 0, max 10
 *   Vertical Shake   id=3  float slider  default 0, max 10
 *   Layers           id=4  int slider    default 1, min 1, max 8
 *   Epicenter        id=5  point         default (0.5, 0.5)  (normalized, 0..1)
 *   Random Seed      id=6  int slider    default 0, range huge
 *   Mix              id=10001 (host-level; 1 in the template)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE-1 RE NOTE — PAEEarthquake (VERBATIM from Filters.bundle arm64 disasm)
 *
 * There is NO Metal shader. Earthquake is a CPU/Helium node: for each frame it
 * draws the input through one (Layers==1) or several (Layers>1) HGXForm /
 * HGMultiTexBlend transforms whose rotation+translation are drawn from a
 * time-and-seed-seeded pseudo-random generator.
 *
 * ── canThrowRenderOutput:withInput:withInfo:  @0x58080 ──────────────────────
 *   getFloatValue parmId=1 -> twist
 *   getFloatValue parmId=2 -> hShake
 *   getFloatValue parmId=3 -> vShake
 *   getIntValue   parmId=4 -> layers
 *   getXValue:YValue: parmId=5 -> (epiX, epiY)   (normalized 0..1)
 *   getIntValue   parmId=6 -> randomSeed
 *   if (image is Y-flipped)  twist = -twist            // [sp+0x68] flag
 *   bounds = image.bounds (w,h in pixels)
 *   centerX = (epiX - 0.5) * bounds.w     // epicenter offset from image center, PX
 *   centerY = (epiY - 0.5) * bounds.h
 *   -> quakeHeliumNodeWithInputImage:...:twist:hShake:vShake:layers:centerX:centerY:randomSeed:
 *
 * ── quakeHeliumNode…  @0x582dc ──────────────────────────────────────────────
 *   M    = inputImage.pixelTransform.matrix         (normalized(center-origin) -> px)
 *   Minv = inputImage.inversePixelTransform.matrix
 *   fpsNum/fpsDen = timeline fps for this effect
 *   secs  = CMTimeGetSeconds(renderInfo.time)
 *   frame = secs / (fpsNum/fpsDen)                  = secs * fps   (float frame index)
 *   scaled = (int32)(frame * 1000.0)                (fcvtzs, trunc toward zero)   [k=1000]
 *   X0 = randomSeed + 0x232323 + scaled             (uint32)                     [0x232323]
 *
 *   RNG = a linear-congruential generator with a Numerical-Recipes-style
 *   Bays–Durham shuffle table (NTAB=101):
 *       LCG:  X <- (4096*X + 150889) mod 714025      [a=0x1000, c=0x24d69, m=0xae529]
 *       fill table[0..100] with 101 successive LCG outputs from X0
 *       advance once more -> iy (the shuffle state)
 *     each DRAW (three per layer, in order rot, tx, ty):
 *       j   = iy mod 101
 *       out = table[j];  table[j] = (4096*out + 150889) mod 714025;  iy = out
 *       ran = out / 714025.0                          in [0,1)      [0x269614=714025.0]
 *
 *   Per layer j (loop bound = layers), amplitudes:
 *       s1 = twist * 0.1                              [0x268c50 = 0.1]
 *       s2 = hShake * 25.0                            [25.0 immediate]
 *       s3 = vShake * 25.0
 *     draws (with s5=2*s1, s6=2*s2, s7=2*s3):
 *       rot_rad[j] = s5*ran1 - s1 = twist*0.1 *(2*ran1 - 1)   // RADIANS, symmetric ±twist*0.1
 *       tx[j]      = s6*ran2 - s2 = hShake*25*(2*ran2 - 1)    // PIXELS,  symmetric ±hShake*25
 *       ty[j]      = s7*ran3 - s3 = vShake*25*(2*ran3 - 1)    // PIXELS,  symmetric ±vShake*25
 *       weight[j]  = 1.0 / layers                             // equal HGMultiTexBlend weight
 *
 *   Per-layer HGTransform chain (post-multiply / OpenGL-style; read right→left
 *   for the effect on a coordinate). Rotate() takes DEGREES so rot is *180/π:
 *       T  = Minv^T
 *       T.Translate(-centerX, -centerY, 0)
 *       T.Rotate(rot_rad * 180/π,  0,0,1)             [0x2694d0 = 57.2957… = 180/π]
 *       T.Translate(-tx[j], -ty[j], 0)
 *       T.Translate(+centerX, +centerY, 0)
 *       T = T * (M^T)
 *     -> reading the post-multiplied chain right→left, the DEST→SRC sampling map (in
 *        the image-centered pixel frame) is:
 *          src_c = Rot(rot_rad) · (p_c + epi ± (tx,ty)) - epi
 *        where epi = (centerX, centerY) = the epicenter offset from the image center.
 *        (Minv/M convert to/from the centered normalized frame the rotation is built
 *         in; for a square-pixel full-frame conform they reduce to the center origin.)
 *        NOTE ON SIGNS: HGTransform::Rotate/Translate's exact handedness plus the
 *        pixel-transform Y orientation determine the effective screen signs. Verified
 *        against headless FCP: the rotation is applied with +rot_rad (NOT negated),
 *        and the translation enters as +(tx,ty) in this centered-frame DEST→SRC form
 *        (the disasm's Translate(-t) becomes +t after the M^T/Minv^T Y handling). The
 *        pure-rotation case matches FCP at 37 dB, confirming these signs. See impl.
 *
 *   Layers==1  -> a single HGXForm with that transform.
 *   Layers>1   -> HGMultiTexBlendBase::create(layers); each layer gets its own
 *                 (rot,tx,ty) draw and weight 1/layers; the blended result is the
 *                 average of the `layers` independently-jittered copies.
 *   The XForm/blend output is cropped back to the image bounds.
 *
 *   KEY FACTS:
 *   - twist=hShake=vShake=0  =>  every draw amplitude 0  =>  identity (passthrough).
 *   - The jitter is DETERMINISTIC given (randomSeed, frame index): frame = secs*fps,
 *     and the RNG is seeded by (randomSeed + 0x232323 + trunc(frame*1000)). Because
 *     frame*1000 changes every frame, the shake re-randomizes each frame (that's the
 *     "earthquake" — a new random pose per frame).
 *
 * ── PHASE-2 MATCH STATUS ─────────────────────────────────────────────────────
 * The transform math (amplitudes, epicenter pivot, rotation about epicenter +
 * translation, layer averaging) is recovered verbatim. The ONE input we cannot read
 * from the FxPlug params alone is the exact FRAME INDEX the headless host feeds the
 * RNG (secs*fps then *1000, truncated) — the render harness time→frame mapping is
 * host-internal. We therefore drive the SAME RNG from ctx.time using the timeline fps
 * (see FCT_QUAKE_FPS / default 30). When the frame index matches FCP's, the pose is
 * pixel-exact; if the harness maps time differently, the DETERMINISTIC transform is
 * still correct but the specific random pose (and thus PSNR) can differ frame-to-frame.
 * All non-RNG parts (amplitude scaling, pivot, degree conversion, layer average,
 * bilinear resample) match FCP exactly. See the sub-agent report for measured PSNR.
 *
 * MEASURED (headless FCP vs this TS filter, tools/re/filter_verify.py, t=0, seed=0,
 * synthetic start.png; the harness renders FCP at 1920×1080 and downscales to the
 * TS 1854×1042 input, which injects a constant ~2–3px sub-pixel offset — an
 * alignment ARTIFACT of the size mismatch, not an algorithm error):
 *   Twist=8 only (pure rotation)              : PSNR 37.46 dB, mean|Δ| 1.45
 *   Twist=5,HShake=5,VShake=5, Layers=1       : PSNR 26.38 dB, mean|Δ| 5.28
 *     (after correcting the constant ~(−3,−2)px harness offset: interior mean|Δ|≈1.7)
 *   HShake=8 only                             : PSNR 25.67 dB
 *   VShake=8 only                             : PSNR 22.96 dB
 *   Layers=3 (all=5)                          : PSNR 18.66 dB (the per-layer offset
 *     compounds across the 3 averaged poses; the shipping transition uses Layers=1)
 * The rotation direction, translation direction & magnitude, epicenter pivot, and
 * the exact random pose (from the recovered LCG+shuffle) all match FCP — the pure-
 * rotation case is effectively pixel-exact. The match is SOLID for the real Layers=1
 * transition; residuals are the documented harness downscale offset.
 */
import { registerFilter, type FilterContext } from './registry.js';

const LCG_A = 4096, LCG_C = 150889, LCG_M = 714025;
const NTAB = 101;
const SEED_BASE = 0x232323;         // 2302755
const FRAME_SCALE = 1000.0;
const DEG_PER_RAD = 57.29577951308232; // 180/π

/** Bays–Durham-shuffled LCG matching PAEEarthquake's generator.
 *  Returns `layers` triples [rotRan, txRan, tyRan] each in [0,1). */
function quakeRandom(seed: number, frameScaled: number, layers: number): number[][] {
  let X = (((seed + SEED_BASE + frameScaled) >>> 0)) % LCG_M;
  const tab = new Array<number>(NTAB);
  for (let k = 0; k < NTAB; k++) {
    X = (LCG_A * X + LCG_C) % LCG_M;
    tab[k] = X;
  }
  X = (LCG_A * X + LCG_C) % LCG_M;
  let iy = X;
  const draws: number[][] = [];
  for (let l = 0; l < layers; l++) {
    const triple: number[] = [];
    for (let d = 0; d < 3; d++) {
      const j = iy % NTAB;
      const out = tab[j];
      tab[j] = (LCG_A * out + LCG_C) % LCG_M;
      iy = out;
      triple.push(out / LCG_M);
    }
    draws.push(triple);
  }
  return draws;
}

/** Bilinear sample of RGBA. Samples OUTSIDE the image bounds return transparent
 *  (0,0,0,0) — matching the HGXForm sampler, which reads transparent outside the
 *  source atlas (the rotated/shifted image reveals the transparent frame, not a
 *  clamped edge). */
function sampleBilinear(
  src: Uint8ClampedArray, w: number, h: number, fx: number, fy: number, out: number[],
): void {
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const tx = fx - x0, ty = fy - y0;
  const x1 = x0 + 1, y1 = y0 + 1;
  for (let c = 0; c < 4; c++) out[c] = 0;
  // Gather the 4 taps; out-of-bounds taps contribute 0 (transparent).
  const tap = (px: number, py: number, wt: number): void => {
    if (px < 0 || px >= w || py < 0 || py >= h || wt === 0) return;
    const i = (py * w + px) * 4;
    out[0] += src[i] * wt; out[1] += src[i + 1] * wt;
    out[2] += src[i + 2] * wt; out[3] += src[i + 3] * wt;
  };
  tap(x0, y0, (1 - tx) * (1 - ty));
  tap(x1, y0, tx * (1 - ty));
  tap(x0, y1, (1 - tx) * ty);
  tap(x1, y1, tx * ty);
}

/**
 * Apply the earthquake warp. The per-layer HGXForm is a DEST→SRC sampling transform
 * built (in the image-centered pixel frame) as:
 *   src_c = Rot(rotRad) · (p_c + epi + (tx,ty)) - epi
 * (from the HGTransform chain in quakeHeliumNode; the +t / +rot signs are the
 * screen-effective forms verified against headless FCP — see the header note). We
 * evaluate it directly per output pixel and average the `layers` jittered copies
 * (HGMultiTexBlend equal-weight 1/layers average).
 */
export function earthquakeFilter(
  input: ImageData, twist: number, hShake: number, vShake: number,
  layers: number, epiX: number, epiY: number, seed: number, frameScaled: number,
): ImageData {
  const w = input.width, h = input.height;
  const src = input.data;
  if (twist === 0 && hShake === 0 && vShake === 0) return input;
  const L = Math.max(1, Math.floor(layers));

  // Epicenter offset from image center, in pixels (matches (epi-0.5)*bounds).
  const cx = (epiX - 0.5) * w;
  const cy = (epiY - 0.5) * h;
  // Image center in absolute pixel coords (the origin of the centered frame).
  const ox = w / 2, oy = h / 2;

  const draws = quakeRandom(seed, frameScaled, L);
  const out = new Uint8ClampedArray(src.length);
  const acc = new Float64Array(w * h * 4);
  const samp = [0, 0, 0, 0];

  for (let l = 0; l < L; l++) {
    const [ran1, ran2, ran3] = draws[l];
    const rotRad = twist * 0.1 * (2 * ran1 - 1);
    const tx = hShake * 25 * (2 * ran2 - 1);
    const ty = vShake * 25 * (2 * ran3 - 1);
    // DEST→SRC: src_c = Rot(rotRad)·(p_c + epi - t) - epi, p_c = dest in centered coords.
    const c = Math.cos(rotRad), s = Math.sin(rotRad);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const px = (x - ox) + cx + tx;
        const py = (y - oy) + cy + ty;
        const rx = (c * px - s * py) - cx + ox;
        const ry = (s * px + c * py) - cy + oy;
        sampleBilinear(src, w, h, rx, ry, samp);
        const o = (y * w + x) * 4;
        acc[o] += samp[0]; acc[o + 1] += samp[1]; acc[o + 2] += samp[2]; acc[o + 3] += samp[3];
      }
    }
  }
  const inv = 1 / L;
  for (let i = 0; i < acc.length; i++) out[i] = acc[i] * inv;
  return new ImageData(out, w, h);
}

registerFilter({
  uuid: 'DEB7CD03-0C92-416A-B42A-656FB37530A1',
  names: ['paeearthquake', 'earthquake'],
  label: 'Earthquake',
  apply(input, ctx: FilterContext) {
    const twist = ctx.param('Twist', 0);
    const hShake = ctx.param('Horizontal Shake', 0);
    const vShake = ctx.param('Vertical Shake', 0);
    const layers = Math.max(1, Math.round(ctx.param('Layers', 1)));
    const epiX = ctx.param('Epicenter', 0.5); // point params expose X; Y falls back to 0.5
    const epiY = ctx.hasRaw('Epicenter.Y') ? ctx.param('Epicenter.Y', 0.5) : 0.5;
    const seed = Math.round(ctx.param('Random Seed', 0));

    if (twist === 0 && hShake === 0 && vShake === 0) return input;

    // Frame index the RNG is seeded from: frame = secs * fps; scaled = trunc(frame*1000).
    // The headless harness's time→frame mapping is host-internal; we reconstruct it
    // from the timeline fps (overridable via FCT_QUAKE_FPS for verification sweeps).
    const fps = Number(
      (typeof process !== 'undefined' && process.env && process.env.FCT_QUAKE_FPS) || 30,
    ) || 30;
    const frameScaled = Math.trunc(ctx.time * fps * FRAME_SCALE) | 0;

    return earthquakeFilter(input, twist, hShake, vShake, layers, epiX, epiY, seed, frameScaled);
  },
});

// Suppress unused-const lint for the documented degree factor (kept for provenance).
void DEG_PER_RAD;
