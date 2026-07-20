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
 * ── PHASE-2 STATUS: implemented below, block size = Scale verified against headless FCP. No
 *    shipping transition in the 65 uses PAEPixellate, so byte-neutral to the GUI-GT gate.
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
  for (let y = 0; y < H; y++) {
    // snap y to the centre of its Scale-px cell (anchored at oy)
    const cyCell = Math.floor((y - oy) / cell) * cell + cell / 2 + oy;
    const sy = Math.min(H - 1, Math.max(0, Math.round(cyCell)));
    for (let x = 0; x < W; x++) {
      const cxCell = Math.floor((x - ox) / cell) * cell + cell / 2 + ox;
      const sx = Math.min(W - 1, Math.max(0, Math.round(cxCell)));
      const si = (sy * W + sx) * 4;
      const di = (y * W + x) * 4;
      if (mix < 1) {
        const oi = di;
        dst[di]     = src[oi]     + (src[si]     - src[oi])     * mix;
        dst[di + 1] = src[oi + 1] + (src[si + 1] - src[oi + 1]) * mix;
        dst[di + 2] = src[oi + 2] + (src[si + 2] - src[oi + 2]) * mix;
        dst[di + 3] = src[oi + 3] + (src[si + 3] - src[oi + 3]) * mix;
      } else {
        dst[di] = src[si]; dst[di + 1] = src[si + 1]; dst[di + 2] = src[si + 2]; dst[di + 3] = src[si + 3];
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
