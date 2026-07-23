/**
 * Pixellate (PAEPixellate) — Motion "Pixellate" filter.
 *   pluginUUID 5E7CA164-3AAF-4C70-A377-567E5796528A, pluginVersion 0.
 *
 * ============================ FCP PHASE-1 REVERSE-ENGINEERING ============================
 * VERBATIM HgcPixellate fragment shader (evidence/shaders/HgcPixellate.metal) — a coordinate
 * QUANTIZE (nearest-cell-centre resample). CPU reads Scale (id2) and computes 1/Scale.
 *
 * PARAMETERS (from the real .motr block + -[PAEPixellate addParameters]):
 *   Center (id 1, point, default 0.5,0.5) — grid origin (fraction of frame).
 *   Scale  (id 2, default 8)              — the pixel BLOCK SIZE in output pixels.
 *   Mix    (10001, default 1), Flip, Input Points, Publish OSC — OSC/control params.
 *
 * HgcPixellate SHADER (verbatim):
 *   cell = floor((p - hg_Params[4].xy) * hg_Params[5].x)      // hg_Params[5].x = 1/cellSize
 *   c    = (cell + 0.5) * hg_Params[5].y + hg_Params[4].xy    // hg_Params[5].y = cellSize
 *   out  = sample(source, affine(c))
 *   (hg_Params[0..3] are identity affines for the axis-aligned default; hg_Params[4] = Center.)
 *
 * ⇒ Pixellate = snap each output pixel to the CENTRE of a Scale×Scale-pixel grid cell and
 *   nearest-sample the source there → blocky mosaic. Block size = Scale pixels EXACTLY, on
 *   BOTH axes (oracle-verified: Scale 8/20/50 → 8/20/50-px blocks, horizontal and vertical).
 *   The grid is anchored at Center (frame fraction). Alpha follows the sampled pixel.
 *
 * ── PHASE-2 STATUS: implemented below, block size = Scale verified against headless FCP.
 *    2026-07-23 NODE-BOUNDARY FIX: the cell-centre sample uses the Metal texel-centre
 *    convention — array index (blockstart + cell/2 − 0.5), sampled BILINEARLY, NOT
 *    round(blockstart + cell/2) (nearest integer). The old nearest-int snap gave a +0.5
 *    sample offset → a systematic positive bias (measured +0.57 signed, 24.8 dB at Scale 20).
 *    The fix reproduces headless block values exactly (cell[0,19]→9.5, not 10). No shipping
 *    transition in the 65 uses PAEPixellate, so byte-neutral to the GUI-GT gate.
 */
import { registerFilter } from './registry.js';

export function pixellateFilter(
  input: ImageData,
  opts: { scale: number; centerX: number; centerY: number; mix: number },
): ImageData {
  const { width: W, height: H } = input;
  const src = input.data;
  const dst = new Uint8ClampedArray(src.length);
  const cell = Math.max(1, opts.scale);            // block size in pixels (Scale)
  // Grid origin in pixels (Center is a frame fraction; default 0.5,0.5 = frame centre).
  const ox = opts.centerX * W;
  const oy = opts.centerY * H;
  const mix = opts.mix;
  // FCP's HgcPixellate samples the cell CENTRE at continuous coord c=(cell+0.5)*cellSize,
  // which under Metal's texel-centre-at-(k+0.5) convention is array index (blockstart +
  // cell/2 − 0.5), sampled BILINEARLY. Decoded 2026-07-23: the engine previously snapped to
  // round(blockstart + cell/2) (nearest INTEGER, no texel-centre correction), giving a +0.5
  // sample offset → a systematic positive bias that grows with the gradient slope inside a
  // cell (measured +0.57 signed, 24.8 dB at Scale 20). The −0.5 + bilinear reproduces the
  // headless block values EXACTLY (cell[0,19]→9.5 not 10, etc.).
  const bilin = (fx: number, fy: number, ch: number): number => {
    const cx = fx < 0 ? 0 : fx > W - 1 ? W - 1 : fx;
    const cy = fy < 0 ? 0 : fy > H - 1 ? H - 1 : fy;
    const x0 = Math.floor(cx), y0 = Math.floor(cy);
    const x1 = x0 + 1 > W - 1 ? W - 1 : x0 + 1;
    const y1 = y0 + 1 > H - 1 ? H - 1 : y0 + 1;
    const tx = cx - x0, ty = cy - y0;
    const p00 = src[(y0 * W + x0) * 4 + ch], p10 = src[(y0 * W + x1) * 4 + ch];
    const p01 = src[(y1 * W + x0) * 4 + ch], p11 = src[(y1 * W + x1) * 4 + ch];
    const top = p00 + (p10 - p00) * tx, bot = p01 + (p11 - p01) * tx;
    return top + (bot - top) * ty;
  };
  for (let y = 0; y < H; y++) {
    // cell-centre sample coordinate on Y (texel-centre convention: − 0.5)
    const syf = Math.floor((y - oy) / cell) * cell + cell / 2 + oy - 0.5;
    for (let x = 0; x < W; x++) {
      const sxf = Math.floor((x - ox) / cell) * cell + cell / 2 + ox - 0.5;
      const di = (y * W + x) * 4;
      if (mix < 1) {
        const oi = di;
        for (let ch = 0; ch < 4; ch++) {
          const s = bilin(sxf, syf, ch);
          dst[di + ch] = src[oi + ch] + (s - src[oi + ch]) * mix;
        }
      } else {
        dst[di]     = bilin(sxf, syf, 0);
        dst[di + 1] = bilin(sxf, syf, 1);
        dst[di + 2] = bilin(sxf, syf, 2);
        dst[di + 3] = bilin(sxf, syf, 3);
      }
    }
  }
  return new ImageData(dst, W, H);
}

registerFilter({
  uuid: '5E7CA164-3AAF-4C70-A377-567E5796528A',
  names: ['paepixellate'],
  label: 'Pixellate',
  apply(input, ctx) {
    return pixellateFilter(input, {
      scale: ctx.param('Scale', 8),
      centerX: ctx.nestedParam('Center', 'X', 0.5),
      centerY: ctx.nestedParam('Center', 'Y', 0.5),
      mix: ctx.param('Mix', 1),
    });
  },
});
