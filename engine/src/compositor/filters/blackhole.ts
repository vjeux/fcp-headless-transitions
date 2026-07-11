/**
 * "Black Hole" FxPlug filter — plugin UUID 1A32EFEF-6687-401B-A078-300A7AE8F621
 * (FCP internal class PAEBlackHole; node name usually "Black Hole").
 * FCP UI: "Pulls an object toward a point."
 *
 * Used by 1 built-in transition:
 *   - Movements/Black_Hole  (Center = 0.5,0.5 ; Amount animated 0 → 1000)
 *
 * Parameter block (from -[PAEBlackHole addParameters], Filters.bundle arm64):
 *   addPointParameterWithName:parmId:1 defaultX:0.5 defaultY:0.5  -> "Center"
 *   addFloatSliderWithName:parmId:2  default 150                  -> "Amount"
 *   Mix id=10001 (host-level).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE-1 RE — PAEBlackHole CPU wiring + HgcBlackHole Metal shader (VERBATIM)
 * ─────────────────────────────────────────────────────────────────────────────
 * BlackHole is a RADIAL "gravity" lens warp: it displaces the sample position
 * radially AWAY from Center as a function of distance |p| (so the object appears
 * pulled toward the point), then composites the warped sample over the original.
 *
 * ── CPU wiring, -[PAEBlackHole canThrowRenderOutput:withInput:withInfo:] @0x882b8:
 *   1. getXValue:YValue:fromParm: parmId=1 -> Center (relative), then
 *      convertRelativeToImageCoordinates: -> center in PIXEL space.  [hg_Params[0].xy]
 *   2. getFloatValue: parmId=2 -> Amount (float, default 150, animated 0..1000).
 *   3. numLevels = max(1, round(log2(Amount * 0.125)))     // fcvtas = round-half-away
 *      (round(log2(Amount/8)); Amount<=~11 -> 1 level).
 *      -> Black Hole is a MIP PYRAMID of `numLevels` stacked HBlackHole warp nodes.
 *   4. getPixelTransformForImage / getInversePixelTransformForImage -> M, Minv
 *      (pixel<->texcoord homogeneous transforms -> hg_Params[2..4] fwd, [5..7] inv).
 *   5. For level i = 0..numLevels-1  (w21 = (1-numLevels)+i, so w21 = 1-N .. 0):
 *        p1z   = 2^w21                       // render scale of this level (mip step)
 *        div   = 2.0 / p1z - 1.0
 *        warp  = Amount / div                // == hg_Params[1].y (radius)
 *        edge  = (i == 0) ? 0.0 : 1.0        // == hg_Params[1].w (edge-blend gate)
 *        SetParameter(idx0, center.x, center.y, 0, 0)         -> hg_Params[0]
 *        SetParameter(idx1, Amount, warp, p1z, edge)          -> hg_Params[1]
 *      The FINAL level has w21=0 => p1z=1 (full res), warp=Amount, edge=1 — this is
 *      the dominant full-resolution warp. Earlier (coarser) levels render the warp
 *      at a downsampled scale (p1z<1) with a SMALLER warp radius; they are chained
 *      so a mip-blurred copy fills the "hole" near the center (avoids smearing one
 *      pixel across the pulled region). Level 0 (edge=0) is the coarsest base fill.
 *      Each level's output is makeHeliumXForm(M*flip*Minv, prev) + makeHeliumCrop.
 *
 * ── HBlackHole::TransformPoint(p, lo, hi, P1.x, P1.y, P1.z) @0x9c620 (VERBATIM),
 *    which matches the shader per-pixel math exactly:
 *      p   = M * p                              // to pixel space
 *      d   = p - center ; len = |d|
 *      if |len| >= 1e-7: d /= len               // unit direction
 *      t   = clamp(len / P1.y, 0, 1)            // radius ramp
 *      len' = len + t * P1.x                     // warped radius  (== shader r0.w)
 *      p'  = center + d * len'
 *      p'  = Minv * p'                           // back to texcoord
 *      p'  = p' * P1.z                           // mip scale
 *      p'  = clamp(p', lo, hi)                   // DOD bounds
 *
 * ── HgcBlackHole_hgc_visible (VERBATIM, extract_shader.py HgcBlackHole):
 *   const float4 c0 = float4(1.0, 2.0, 9.999999975e-07, 0.0);
 *   r0.x = dot(texCoord0, hg_Params[4]);  r0.z = 1/r0.x;      // forward homog (w)
 *   r0.y = dot(texCoord0, hg_Params[3]);
 *   r0.x = dot(texCoord0, hg_Params[2]);
 *   r0.xy = r0.xy*r0.zz - hg_Params[0].xy;    // p = M*texCoord (persp) - center
 *   r1.x = dot(r0.xy, r0.xy);                 // |p|^2
 *   r0.z = fmax(r1.x, 1e-6); r0.z = rsqrt(r0.z);   // 1/|p|
 *   r1.z = r0.z*r1.x;                         // |p|
 *   r0.w = clamp(r1.z / hg_Params[1].y, 0, 1);     // t = clamp(|p|/radius,0,1)
 *   r0.w = r0.w*hg_Params[1].x + r1.z;        // len' = |p| + t*Amount   (warped radius)
 *   r0.xy = r0.zz*r0.xy;                      // unit dir
 *   r0.xy = r0.xy*r0.ww + hg_Params[0].xy;    // src = dir*len' + center
 *   r0.w = 1.0;
 *   r1.x = dot(r0.xyw, hg_Params[7].xyz);  r1.w = 1/r1.x;     // inverse homog
 *   r1.y = dot(r0.xyw, hg_Params[6].xyz);
 *   r1.x = dot(r0.xyw, hg_Params[5].xyz);
 *   r0.xy = r1.xy*r1.ww;                      // src texcoord (persp divide)
 *   r0.xy = r0.xy * hg_Params[1].zz;          // * mip scale P1.z
 *   r1.xy = (hg_Params[9].xy < r0.xy);        // out-of-bounds hi test
 *   r0.zw = (r0.xy < hg_Params[8].xy);        // out-of-bounds lo test
 *   r0.z = fmax(r0.z,r0.w); r1.x=fmax(r1.x,r1.y); r0.z=fmax(r0.z,r1.x);  // outside flag
 *   r0.xy = fmax(r0.xy, hg_Params[8].xy);     // clamp src to bounds
 *   r0.w = (r1.z + hg_Params[1].x) * hg_Params[1].z;   // (|p|+Amount)*P1.z
 *   r1.xy = fmin(r0.xy, hg_Params[9].xy);
 *   r0.x = r1.z / r0.w;                        // |p| / ((|p|+Amount)*P1.z)
 *   r0.x = clamp(r0.x*2 - 1, 0, 1);           // edge falloff ramp
 *   r2.x = r0.x*hg_Params[1].w - hg_Params[1].w;    // (ramp-1)*edge
 *   r1.xy = (clampedSrc + hg_Params[10].xy) * hg_Params[10].zw;   // -> uv (normalize)
 *   r1 = sample(r1.xy);
 *   r1 = select(r1, 0, outsideFlag);          // pixels sampling outside -> transparent
 *   r0 = color1;                               // color1 = ORIGINAL/background input
 *   r2.x = r2.x + 1.0;                         // blend = ramp*edge (=1 at far, ->0 core)
 *   output = mix(color1, r1, r2.xxxx);         // blend warped sample over original
 *
 *   KEY: `color1` is the untransformed input (composite base). The final blend
 *   factor is  b = clamp(2*|p|/((|p|+Amount)*P1.z) - 1, 0,1) ... for edge=1 levels;
 *   near the center b -> 0 (keep original), far away b -> 1 (use warped sample).
 *   For edge=0 (level 0), r2.x = 0*... = 0, so b = 1 everywhere (full warp base).
 *   Samples that map OUTSIDE the source bounds become transparent black.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE-2 — TS IMPLEMENTATION
 * We render at the image resolution, so pixel space == our (x,y) grid and the
 * M / Minv homogeneous transforms collapse to identity (no perspective in the
 * shipping transition; getPixelTransform is a pure translate/scale of an axis-
 * aligned conform). We reproduce the full `numLevels` mip pyramid: each level warps
 * a (progressively downsampled) copy toward Center and composites over the running
 * result using the shader's edge-falloff blend `b`. The final full-res level
 * dominates. Bilinear sampling with transparent-outside (matches select-to-0).
 * See tools/re/filter_verify.py sweep in the commit message for measured PSNR.
 */
import { registerFilter } from './registry.js';

const EPS = 1e-6;

/** Bilinear sample of premult-free RGBA at continuous (fx,fy) in `src` (W×H).
 *  Returns transparent black for coordinates outside [0,W-1]×[0,H-1] (shader's
 *  select-to-0 on the out-of-bounds flag). */
function sampleTransparent(
  src: Uint8ClampedArray, w: number, h: number, fx: number, fy: number, out: number[],
): void {
  if (fx < 0 || fy < 0 || fx > w - 1 || fy > h - 1) {
    out[0] = out[1] = out[2] = out[3] = 0;
    return;
  }
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
  const tx = fx - x0, ty = fy - y0;
  const i00 = (y0 * w + x0) * 4, i10 = (y0 * w + x1) * 4;
  const i01 = (y1 * w + x0) * 4, i11 = (y1 * w + x1) * 4;
  for (let c = 0; c < 4; c++) {
    const top = src[i00 + c] * (1 - tx) + src[i10 + c] * tx;
    const bot = src[i01 + c] * (1 - tx) + src[i11 + c] * tx;
    out[c] = top * (1 - ty) + bot * ty;
  }
}

/** One BlackHole warp level. Warps `src` radially about `center` and blends the
 *  warped sample over `base` using the shader's edge-falloff factor. Writes to `dst`.
 *  amount = P1.x (radial magnitude), radius = P1.y, p1z = P1.z (mip scale),
 *  edge = P1.w (0 => full warp base fill; 1 => edge-blend over base). */
function warpLevel(
  base: Uint8ClampedArray, src: Uint8ClampedArray, dst: Uint8ClampedArray,
  w: number, h: number, cx: number, cy: number,
  amount: number, radius: number, p1z: number, edge: number,
): void {
  const smp: number[] = [0, 0, 0, 0];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy;
      const len2 = dx * dx + dy * dy;
      const len = Math.sqrt(len2);
      const inv = len >= EPS ? 1 / len : 0;
      const t = Math.max(0, Math.min(1, len / radius));
      const warped = len + t * amount;
      // source position = center + unit_dir * warped, then * mip scale P1.z
      const sx = (cx + dx * inv * warped) * p1z;
      const sy = (cy + dy * inv * warped) * p1z;
      sampleTransparent(src, w, h, sx, sy, smp);
      // edge-falloff blend factor  b = clamp(2*|p|/((|p|+amount)*p1z) -1,0,1); *edge
      const denom = (len + amount) * p1z;
      let ramp = denom > 0 ? len / denom : 0;
      ramp = Math.max(0, Math.min(1, ramp * 2 - 1));
      const b = (ramp - 1) * edge + 1; // r2.x+1 ; edge=0 => b=1 everywhere
      const o = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) {
        dst[o + c] = base[o + c] * (1 - b) + smp[c] * b;
      }
    }
  }
}

/** Full Black Hole = mip pyramid of `numLevels` warp levels composited in order. */
export function blackHoleFilter(
  input: ImageData, centerX: number, centerY: number, amount: number,
): ImageData {
  const w = input.width, h = input.height;
  if (amount <= 0) return input;
  const numLevels = Math.max(1, Math.round(Math.log2(amount * 0.125)));

  let base = input.data;
  let out = new Uint8ClampedArray(base.length);
  for (let i = 0; i < numLevels; i++) {
    const w21 = (1 - numLevels) + i;
    const p1z = Math.pow(2, w21);
    const div = 2.0 / p1z - 1.0;
    const radius = div !== 0 ? amount / div : amount;
    const edge = i === 0 ? 0.0 : 1.0;
    warpLevel(base, base, out, w, h, centerX, centerY, amount, radius, p1z, edge);
    // running composite: this level's output becomes the base for the next
    const swap = base === input.data ? new Uint8ClampedArray(base.length) : base;
    swap.set(out);
    base = swap;
  }
  const res = new Uint8ClampedArray(base.length);
  res.set(base);
  return new ImageData(res, w, h);
}

registerFilter({
  uuid: '1A32EFEF-6687-401B-A078-300A7AE8F621',
  names: ['paeblackhole', 'black hole', 'blackhole'],
  label: 'Black Hole',
  apply(input, ctx) {
    // Center: point param (children X/Y, relative 0..1) -> pixel coords.
    const cp = ctx.filter.parameters.find(p => p.name === 'Center');
    const rx = typeof cp?.children?.find(c => c.name === 'X')?.value === 'number'
      ? (cp!.children!.find(c => c.name === 'X')!.value as number) : 0.5;
    const ry = typeof cp?.children?.find(c => c.name === 'Y')?.value === 'number'
      ? (cp!.children!.find(c => c.name === 'Y')!.value as number) : 0.5;
    const centerX = rx * ctx.width;
    const centerY = ry * ctx.height;
    const amount = ctx.blurAmount('Amount', 150);
    if (amount <= 0) return input;
    return blackHoleFilter(input, centerX, centerY, amount);
  },
});
