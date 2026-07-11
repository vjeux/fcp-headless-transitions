/**
 * "Smear" FxPlug filter — plugin UUID 0D6E968B-0291-43E2-A8DA-88EB80E9C4B2
 * (FCP internal class PAEScrape; node name "PAEScrape"/"Smear").
 *
 * FCP UI: "Smears an object along an axis." Used by 1 built-in transition:
 *   - Movements/Smear
 *
 * Parameter block (from the .motr / -[PAEScrape addParameters]):
 *   <parameter name="Center"   id="1"> {X id=1, Y id=2}   point, RELATIVE [0..1] of frame
 *   <parameter name="Rotation" id="2"/>                    angle slider, RADIANS
 *   <parameter name="Amount"   id="3"/>                    slider, UI 0..? (clamped 0..200)
 *   <parameter name="Crop"     id="4"/>                    toggle, default 1
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE-1 RE NOTE — PAEScrape + Helium HgcScrape (VERBATIM)
 *
 * PAEScrape builds a Helium node that runs the HgcScrape Metal fragment shader.
 * It is an INVERSE-MAP geometric warp: for each OUTPUT pixel it computes a source
 * texcoord and samples the input. No blur, no accumulation — a per-pixel remap.
 *
 * CPU wiring — -[PAEScrape canThrowRenderOutput:withInput:withInfo:]
 * (Filters.bundle arm64 @ 0x5d930), verbatim:
 *   getScaleForImage:               -> scale   (image pixel-transform scale, sx,sy)
 *   getPixelTransformForImage:       (pixel <- normalized transform)
 *   Center parmId=1: getXValue:YValue: then convertRelativeToPixelCoordinates:
 *                                    -> center in PIXEL coords.
 *   Rotation parmId=2 (float radians): sincos(rot) -> (cos, sin).
 *   Amount parmId=3: clamp to [0,200];
 *                    a = (amount < 0 ? 200 : 200 - min(amount,200));
 *                    threshold = a;   s8 = (a > 0 ? 1/a : 0).
 *   Crop parmId=4 (toggle, default 1).
 *   SetParameter slots (the float4 constant rows the shader dots against):
 *     [0] = (center.x, center.y, ., .)                 // center in pixels
 *     [1] = (-cos(rot), sin(rot), ., .)                // "axis" unit vector
 *     [2] = (threshold, 0, 0, 0)
 *     [3] = (s8, 0, 0, 0)                              // NOTE: shader reads slot[3].w
 *                                                      //  which is 0 -> that branch is DEAD
 *     [4] = (scale.x, scale.y, 1/scale.x, 1/scale.y)
 *     [5] = (offset.x, offset.y, 1/texW, 1/texH)       // pixel -> normalized texcoord
 *
 * VERBATIM HgcScrape Metal shader (Helium.framework; LEN=0x1DD):
 *   FragmentOut HgcScrape_hgc_visible(hg_Params, hg_Texture0, hg_Sampler0, texCoord0){
 *     const float4 c0 = float4(0.5, 0, 0, 0);
 *     r0.zw = texCoord0.xy - hg_Params[0].xy;   // p = pixel - center   (PIXEL space)
 *     r0.xy = r0.zw / hg_Params[4].xy;          // q = p / scale        (q-space)
 *     r0.zw = r0.xy * hg_Params[1].xy;          // (qx*ax, qy*ay)  componentwise
 *     r1.x  = dot(r0.xy, hg_Params[1].xy);      // d = dot(q, axis) = qx*ax + qy*ay
 *     r0.z  = float(r0.z >= -r0.w);             // cond1 = ( qx*ax >= -(qy*ay) )
 *     r1.y  = float(r1.x >= hg_Params[2].x);    // cond2 = ( d >= threshold )
 *     r1.z  = float(-r1.y >= 0.0);              // = 0 whenever cond2==1, else = 1
 *     r1.z  = fmin(r0.z, r1.z);                 // min(cond1, r1.z)
 *     r1.w  = r1.x * hg_Params[3].w;            // = 0  (slot3.w == 0 in shipped wiring)
 *     r0.w  = 0.5*hg_Params[2].x - r1.x;        // 0.5*threshold - d
 *     r0.z  = fmin(r0.z, r1.y);                 // min(cond1, cond2) = (cond1 AND cond2)
 *     r0.z  = select(0, r0.w, -r0.z < 0);       // (cond1 && cond2) ? (0.5*thr - d) : 0
 *     r1.w  = -r1.x * r1.w;                     // = 0
 *     r0.w  = r1.w * 0.5;                       // = 0
 *     r0.z  = select(r0.z, r0.w, -r1.z < 0);    // DEAD branch: only fires if r1.z>0
 *                                               //   i.e. cond1==1 AND cond2==0; then
 *                                               //   disp := 0 (r0.w). See below.
 *     r0.zw = r0.z * hg_Params[1].xy + r0.xy;   // q' = q + disp*axis
 *     r0.xy = 1.0 / hg_Params[4].zw;            // = scale   (slot4.zw = 1/scale)
 *     r0.xy = r0.zw * r0.xy + hg_Params[0].xy;  // pixel' = q'*scale + center
 *     r0.xy = r0.xy + hg_Params[5].xy;          // + offset
 *     r0.xy = r0.xy * hg_Params[5].zw;          // -> normalized texcoord
 *     output = hg_Texture0.sample(hg_Sampler0, r0.xy);
 *   }
 *
 * EXACT disp LOGIC (folding the two select()s; r1.z = (cond1 && !cond2)):
 *   let d = dot(q, axis)
 *   cond1 = (qx*ax >= -(qy*ay))          // == (d >= 0) since d = qx*ax + qy*ay,
 *                                        //    and qx*ax >= -qy*ay  <=>  d >= 0
 *   cond2 = (d >= threshold)
 *   // first select: r0.z = (cond1 && cond2) ? (0.5*thr - d) : 0
 *   // second select fires only when r1.z>0 i.e. (cond1 && !cond2): then disp := 0
 *   //   -> but in that case the first select already gave 0, so disp stays 0.
 *   // NET: disp = (cond1 && cond2) ? (0.5*threshold - d) : 0
 *
 * GEOMETRY. Because slot4 divides then multiplies by scale symmetrically, the net
 * displacement in PIXEL space is  scale*disp*axis. But disp itself is a function of
 * the q-space projection d = dot((pixel-center)/scale, axis). So the WEDGE and the
 * threshold live in q-space (scale-normalized). axis = (-cos rot, sin rot).
 *   - The half-plane cond1 = (d >= 0) selects the side of the line through center
 *     perpendicular to axis where the projection onto axis is positive.
 *   - Inside that half-plane AND where d >= threshold, source is pulled back toward
 *     the threshold band: q' = q + (0.5*thr - d)*axis. Since there d >= threshold,
 *     (0.5*thr - d) <= -0.5*thr < 0, so q' is pushed in the -axis direction (toward
 *     and past the center line). Samples whose q' leaves [0,1] read the sampler's
 *     border (transparent black) -> the characteristic dark smear tail.
 *   - Everywhere else (d < threshold, or d < 0) disp = 0 -> identity passthrough.
 *
 * Rotation=0 => axis=(-1,0) (nearly horizontal, negative-x). Rotation=pi/2 =>
 * axis=(0,1) (straight down). The band boundary is threshold units of q along axis.
 *
 * SCALE / CENTER units. Center is stored RELATIVE (0..1) and converted to pixels
 * (center_px = center_rel * renderSize). getScaleForImage returns the pixel-transform
 * scale; for a full-frame conform render it is ~1 px per q-unit on each axis, so we
 * use scale = (1,1) (identity q<->pixel). threshold ("a") is therefore in pixels of
 * projection along axis.  The border sampler is transparent/black outside [0,1].
 *
 * ── PHASE-2: verified against REAL headless FCP via tools/re/filter_verify.py across
 *    a Rotation x Amount x Center sweep (see commit message for the PSNR table).
 */
import { registerFilter } from './registry.js';
import { evaluateCurve } from '../../evaluator/curves.js';

/** Read a child param (X/Y) of a named group param, honoring curves. */
function childValue(ctx: import('./registry.js').FilterContext, group: string, childName: string, childId: number, fallback: number): number {
  const g = ctx.filter.parameters.find(p => p.name === group);
  if (g?.children) {
    for (const c of g.children) {
      if (c.name === childName || c.id === childId) {
        if (c.curve) return evaluateCurve(c.curve, ctx.time);
        if (typeof c.value === 'number') return c.value;
      }
    }
  }
  return fallback;
}

/**
 * HgcScrape inverse-map warp. For each output pixel, compute the source pixel via
 * the verbatim shader math and bilinear-sample the input; out-of-[0,1] reads
 * transparent black (the shader's border sampler).
 */
export function scrapeFilter(
  input: ImageData, cx: number, cy: number, cosR: number, sinR: number,
  threshold: number, scaleX: number, scaleY: number,
): ImageData {
  const w = input.width, h = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  const ax = -cosR, ay = sinR;                 // slot[1] = (-cos, sin)

  // Bilinear sample in pixel coords; outside the image -> transparent black (0,0,0,0).
  const sample = (fx: number, fy: number, o: number) => {
    if (fx < 0 || fx > w - 1 || fy < 0 || fy > h - 1) {
      out[o] = 0; out[o + 1] = 0; out[o + 2] = 0; out[o + 3] = 0; return;
    }
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
    const tx = fx - x0, ty = fy - y0;
    for (let c = 0; c < 4; c++) {
      const p00 = src[(y0 * w + x0) * 4 + c], p10 = src[(y0 * w + x1) * 4 + c];
      const p01 = src[(y1 * w + x0) * 4 + c], p11 = src[(y1 * w + x1) * 4 + c];
      const top = p00 + (p10 - p00) * tx, bot = p01 + (p11 - p01) * tx;
      out[o + c] = top + (bot - top) * ty;
    }
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      // p = pixel - center ; q = p / scale
      const qx = (x - cx) / scaleX;
      const qy = (y - cy) / scaleY;
      const d = qx * ax + qy * ay;             // dot(q, axis)
      const cond1 = (qx * ax) >= -(qy * ay);   // == (d >= 0)
      const cond2 = d >= threshold;
      const disp = (cond1 && cond2) ? (0.5 * threshold - d) : 0;
      // q' = q + disp*axis ; pixel' = q'*scale + center
      const qpx = qx + disp * ax;
      const qpy = qy + disp * ay;
      const sx = qpx * scaleX + cx;
      const sy = qpy * scaleY + cy;
      sample(sx, sy, o);
    }
  }
  return new ImageData(out, w, h);
}

registerFilter({
  uuid: '0D6E968B-0291-43E2-A8DA-88EB80E9C4B2',
  names: ['paescrape', 'smear', 'scrape'],
  label: 'Smear',
  apply(input, ctx) {
    const w = input.width, h = input.height;
    // Center is RELATIVE [0..1]; convert to pixel coords of the render frame.
    const cxRel = childValue(ctx, 'Center', 'X', 1, 0.5);
    const cyRel = childValue(ctx, 'Center', 'Y', 2, 0.5);
    const cx = cxRel * w;
    const cy = cyRel * h;
    // Rotation in radians.
    const rot = ctx.param('Rotation', 0);
    const cosR = Math.cos(rot), sinR = Math.sin(rot);
    // Amount -> threshold "a": clamp [0,200]; a = amount<0 ? 200 : 200 - min(amount,200).
    let amount = ctx.param('Amount', 0);
    if (amount < 0) amount = 0; else if (amount > 200) amount = 200;
    const a = amount < 0 ? 200 : 200 - Math.min(amount, 200);
    const threshold = a;
    if (threshold <= 0) {
      // a==0 => every pixel with d>=0 gets disp=0.5*0 - d = -d, a full fold; but
      // amount clamps keep a>=0. a==0 only at amount>=200. Handle generically below.
    }
    // scale: pixel-transform scale. Full-frame conform => 1 px per q-unit.
    const scaleX = 1, scaleY = 1;
    return scrapeFilter(input, cx, cy, cosR, sinR, threshold, scaleX, scaleY);
  },
});
