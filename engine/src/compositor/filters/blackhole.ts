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
 *   3. numLevels = max(1, round(log2(Amount * 0.125)))     // fcvtas @0x88368
 *      = max(1, round(log2(Amount/8)))   (Amount<=~11 -> 1 level; 100->4, 300->5,
 *      600->6, 1000->7). -> Black Hole is a MIP PYRAMID of `numLevels` HBlackHole
 *      warp nodes (loop @0x88594; d9=2.0, d10=-1.0, s11=1.0, s8=0.0).
 *   4. getPixelTransformForImage / getInversePixelTransformForImage -> M, Minv
 *      (pixel<->texcoord homogeneous transforms -> hg_Params[2..4] fwd, [5..7] inv).
 *   5. For level iter i, the loop uses THREE counters:
 *        w21 = (1-numLevels)+i    (exponent, counts UP  from 1-N to 0)
 *        w26 = 1 on the FIRST iter, 0 thereafter    (the edge gate; @0x887a0)
 *      Per-level SetParameter idx1 (@0x88640, method off #0x60) computes:
 *        p1z   = ldexp(1.0, w21) = 2^w21                     // level render scale
 *        div   = 2.0 / p1z - 1.0                             // fdiv d9/d0, fadd d10
 *        warp  = Amount / div                                // fdiv d1/d2
 *        edge  = (w26 & 1) ? 0.0 : 1.0                        // fcsel s3
 *        radius= (w26 & 1) ? 0.0 : warp                       // fcsel s1  ***
 *        SetParameter(idx0, center.x, center.y, 0, 0)         -> hg_Params[0]
 *        SetParameter(idx1, (Amount, radius, p1z, edge))      -> hg_Params[1]
 *      *** CONFIRMED FROM DISASM: on the FIRST iteration (w26=1) BOTH radius=0 AND
 *      edge=0. radius=0 makes the shader's t=clamp(|p|/0)->1 everywhere, so level 0
 *      is a UNIFORM radial push-out by `Amount` (the coarse base fill), composited
 *      with edge=0 => blend b=1 (full replace). The FINAL level has w21=0 => p1z=1
 *      (full res), radius=Amount, edge=1 — the dominant sharp near-field warp.
 *      Each level warps the (transformed) ORIGINAL heliumRef — the pyramid array was
 *      built up-front from the SAME source node (first loop @0x884c0, makeHeliumXForm
 *      on the original), and each level's output is makeHeliumCrop'd (DOD shrinks by
 *      p1z, @0x886c4..0x88740) then composited over the running result. Levels are
 *      NOT chained warp-of-warp; every level re-warps the original and blends over
 *      the accumulator via the edge-falloff factor b (below).
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
 * PHASE-2 — TS IMPLEMENTATION (verified against REAL headless FCP)
 * ─────────────────────────────────────────────────────────────────────────────
 * We render at the image resolution, so pixel space == our (x,y) grid and the
 * M / Minv homogeneous transforms collapse to identity (the shipping transition's
 * pixel transform is a pure axis-aligned conform — no perspective). We reproduce
 * the full `numLevels` mip pyramid EXACTLY as the CPU wiring builds it:
 *
 *   result = original
 *   for i in 0..numLevels-1:
 *     p1z    = 2^((1-numLevels)+i)          // 2^(1-N) (coarse) .. 2^0 = 1 (full)
 *     div    = 2/p1z - 1
 *     radius = (i==0) ? 0 : Amount/div
 *     edge   = (i==0) ? 0 : 1
 *     warpedSample(x,y) = radial-pull the ORIGINAL about Center (see per-pixel math)
 *     b(x,y) = clamp(2*|p|/((|p|+Amount)*p1z) - 1, 0, 1)*edge + 1   // ->1 far, ->0 core
 *     result = mix(result, warpedSample, b)     // b=1 (full replace) when edge=0
 *
 * Each level RE-WARPS THE ORIGINAL (not the running result) and blends over the
 * accumulator — matching the disasm (§5): the level 0 uniform push-out lays down the
 * coarse "everything sucked toward the point" base (edge=0 => b=1), and finer levels
 * (edge=1) composite their sharper near-field warp on top only where b>0 (far from
 * center). Samples whose source maps OUTSIDE the frame become transparent black
 * (the shader's `select(r1, 0, outsideFlag)`), which is what produces the black
 * wedges/corners as content collapses inward.
 *
 * RESOLUTION CONFORM. `Amount` is specified in FCP RENDER pixels (the harness renders
 * FCP at 1920×1080 — see docs/RENDERER_CONTRACT.md: the engine's canonical output is
 * 1920×1080). Our TS grid is the INPUT image size (e.g. 1854×1042), so the same
 * Amount would produce a proportionally larger warp. We therefore convert Amount into
 * input-pixel space by the conform ratio  conform = ½·(width/1920 + height/1080)
 * (the input→output scale; NOT a per-transition constant — it is purely the ratio of
 * our render grid to the documented 1920×1080 output). Center is a RELATIVE (0..1)
 * point → input pixels via ctx.width/ctx.height, so it needs no conform.
 *
 * MEASURED (tools/re/filter_verify.py, center=0.5,0.5, PSNR vs headless FCP):
 *   Amount= 100 -> 34.6 dB     Amount= 600 -> 35.1 dB
 *   Amount= 300 -> 34.3 dB     Amount=1000 -> 40.2 dB
 *   off-center (0.35,0.6) Amount=300 -> 33.6 dB.  All comfortably ≥32 dB; the
 *   residual is the documented ~1-2px sub-pixel halo from the 1920→input downscale
 *   in the verify harness (same artifact noted in earthquake.ts / minmax.ts), plus
 *   FCP's per-level DOD crop we approximate with the |p|-based edge-falloff blend.
 */
import { registerFilter } from './registry.js';

const EPS = 1e-6;
/** Canonical FCP render size (docs/RENDERER_CONTRACT.md). `Amount` is expressed in
 *  these render pixels; we conform it to our input-pixel grid below. */
const RENDER_W = 1920;
const RENDER_H = 1080;

/** Bilinear sample of RGBA at continuous (fx,fy) in `src` (w×h). Returns transparent
 *  black when the sample position is OUTSIDE the frame (matches the shader's
 *  `select(sample, 0, outsideFlag)` on the out-of-bounds source texcoord). */
function sampleOrTransparent(
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

/**
 * One BlackHole warp level (VERBATIM per-pixel math from HBlackHole::TransformPoint /
 * HgcBlackHole shader). For every destination pixel p (relative to Center):
 *     len    = |p|
 *     t      = clamp(len / radius, 0, 1)     [radius==0 => t=1, uniform push-out]
 *     len'   = len + t * amount              [warped radius — pull content inward:
 *                                             dest at len samples SOURCE at len' > len]
 *     src    = Center + (p/len) * len'
 *     b      = clamp(2*len / ((len+amount)*p1z) - 1, 0, 1) * edge + 1   [blend]
 *     dst    = mix(base, sample(warpedOrigin @ src), b)
 * `warpSrc` is the ORIGINAL frame (every level re-warps the original); `base` is the
 * running accumulator that this level composites over.
 */
function warpLevel(
  base: Uint8ClampedArray, warpSrc: Uint8ClampedArray, dst: Uint8ClampedArray,
  w: number, h: number, cx: number, cy: number,
  amount: number, radius: number, p1z: number, edge: number,
): void {
  const smp: number[] = [0, 0, 0, 0];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy;
      const len = Math.sqrt(dx * dx + dy * dy);
      const inv = len >= EPS ? 1 / len : 0;
      const t = radius > 0 ? Math.max(0, Math.min(1, len / radius)) : 1;
      const warped = len + t * amount;                 // warped radius (shader r0.w)
      const sxf = cx + dx * inv * warped;
      const syf = cy + dy * inv * warped;
      sampleOrTransparent(warpSrc, w, h, sxf, syf, smp);
      // edge-falloff blend  b = clamp(2|p|/((|p|+amount)*p1z) -1,0,1)*edge + 1
      const denom = (len + amount) * p1z;
      let ramp = denom > 0 ? len / denom : 0;
      ramp = Math.max(0, Math.min(1, ramp * 2 - 1));
      const b = (ramp - 1) * edge + 1;
      const o = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) {
        dst[o + c] = base[o + c] * (1 - b) + smp[c] * b;
      }
    }
  }
}

/**
 * Full Black Hole = mip pyramid of `numLevels` warp levels composited in order
 * (see the PHASE-2 doc above). `amount` is already conformed to input-pixel space.
 * centerX/centerY are input-pixel coordinates.
 */
export function blackHoleFilter(
  input: ImageData, centerX: number, centerY: number, amount: number,
): ImageData {
  const w = input.width, h = input.height;
  if (amount <= 0) return input;
  const original = input.data;
  const numLevels = Math.max(1, Math.round(Math.log2(amount * 0.125)));

  let acc = new Uint8ClampedArray(original.length);
  acc.set(original);
  for (let i = 0; i < numLevels; i++) {
    const w21 = (1 - numLevels) + i;
    const p1z = Math.pow(2, w21);
    const div = 2.0 / p1z - 1.0;
    const radius = i === 0 ? 0 : (div !== 0 ? amount / div : amount);
    const edge = i === 0 ? 0.0 : 1.0;
    const out = new Uint8ClampedArray(original.length);
    warpLevel(acc, original, out, w, h, centerX, centerY, amount, radius, p1z, edge);
    acc = out;
  }
  return new ImageData(acc, w, h);
}

registerFilter({
  uuid: '1A32EFEF-6687-401B-A078-300A7AE8F621',
  names: ['paeblackhole', 'black hole', 'blackhole'],
  label: 'Black Hole',
  apply(input, ctx) {
    // Center: point param (children X/Y, relative 0..1) -> input-pixel coords.
    const cp = ctx.filter.parameters.find(p => p.name === 'Center');
    const cx = cp?.children?.find(c => c.name === 'X');
    const cy = cp?.children?.find(c => c.name === 'Y');
    const rx = typeof cx?.value === 'number' ? (cx.value as number) : 0.5;
    const ry = typeof cy?.value === 'number' ? (cy.value as number) : 0.5;
    const centerX = rx * ctx.width;
    const centerY = ry * ctx.height;
    const amount = ctx.blurAmount('Amount', 150);
    if (amount <= 0) return input;
    // Conform Amount (render-pixel units) to our input-pixel grid.
    const conform = 0.5 * (ctx.width / RENDER_W + ctx.height / RENDER_H);
    return blackHoleFilter(input, centerX, centerY, amount * conform);
  },
});
