/**
 * Fisheye (PAEFisheye) — Motion "Fisheye" filter.
 *   pluginUUID C1278154-B061-453F-8BDE-9F70AB2E6066, pluginVersion 1.
 *
 * ============================ FCP PHASE-1 REVERSE-ENGINEERING ============================
 * VERBATIM HgcFisheye shader (evidence/shaders/HgcFisheye.metal) — an ANISOTROPIC RADIAL POWER
 * warp (barrel/fisheye). Fully decoded: shader structure + CPU wiring (-[PAEFisheye
 * canThrowRenderOutput:]) + oracle per-axis radial-ramp measurement (tools/re/warp_probe.py).
 *
 * EXACT MODEL (all pieces decoded, not fitted):
 *   exponent = (Amount/30 <= 0) ? 1/(1 - Amount/30) : (Amount/30 + 1)     // fcsel in the binary
 *   nx = dx / (W*Radius),  ny = dy / (H*Radius)   // hg_Params[5]=(1/(W*R)^2, 1/(H*R)^2) — the
 *                                                  //   normalization is by frame W and H (aspect)
 *   nd = sqrt(nx^2 + ny^2)                         // normalized radius (rsqrt(dot(d*d,params5)))
 *   factor = nd^(exponent-1) = nd^(Amount/30)      // invD*pow(invD,-exp) = |d|_norm^(exp-1)
 *   srcOffset = d * factor                         // d = (dx,dy) in PIXELS
 *   src = Center + srcOffset                       // inverse map → sample the source there
 * VERIFIED per-axis vs headless FCP (Amount=30, p=1): src_dx = dx·(dx/W), src_dy = dy·(dy/H),
 *   i.e. sx≈W (1972 measured, W=1920), sy≈H (1095 measured, H=1080), residual ~1-2px.
 *
 * PARAMETERS: Radius (id1, def 1) scales the norm; Amount (id2, def 15) the strength; Center
 *   (id3, def 0.5,0.5); Mix (10001). Amount 0 → identity.
 *
 * ── PHASE-2 STATUS: implemented below with the EXACT anisotropic model (was a naive circular
 *    power law, refuted at 16 dB — the fix is the per-axis W/H normalization). No shipping
 *    transition in the 65 uses PAEFisheye → byte-neutral to the GUI-GT gate.
 */
import { registerFilter } from './registry.js';

export function fisheyeFilter(
  input: ImageData,
  opts: { amount: number; radius: number; centerX: number; centerY: number; mix: number },
): ImageData {
  const { width: W, height: H } = input;
  const src = input.data;
  const dst = new Uint8ClampedArray(src.length);
  const cx = opts.centerX * W;
  const cy = opts.centerY * H;
  const a = opts.amount / 30;
  const exponent = a <= 0 ? 1 / (1 - a) : a + 1;
  const p = exponent - 1;                          // factor = nd^p
  const R = Math.max(1e-3, opts.radius);
  const sxN = W * R, syN = H * R;                  // per-axis normalization (aspect)
  const mix = opts.mix;
  // BORDER (zero) address mode — decoded 2026-07-23 from the negative-Amount (pincushion)
  // regime: FCP samples out-of-bounds texels as TRANSPARENT BLACK (0), leaving black borders
  // where the shrunk image doesn't cover the frame. The engine previously CLAMP-replicated
  // edge pixels into that border (stretched streaks), a +22.9-level bias that dropped
  // Amount=-20 to 16 dB. Positive (barrel) Amounts keep all samples in-bounds so they were
  // unaffected (40-43 dB). Each bilinear tap outside [0,W-1]×[0,H-1] contributes 0.
  const tap = (ix: number, iy: number, ch: number): number =>
    (ix < 0 || ix > W - 1 || iy < 0 || iy > H - 1) ? 0 : src[(iy * W + ix) * 4 + ch];
  const bilinear = (fx: number, fy: number, ch: number): number => {
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const x1 = x0 + 1, y1 = y0 + 1;
    const tx = fx - x0, ty = fy - y0;
    const t = tap(x0, y0, ch) + (tap(x1, y0, ch) - tap(x0, y0, ch)) * tx;
    const b = tap(x0, y1, ch) + (tap(x1, y1, ch) - tap(x0, y1, ch)) * tx;
    return t + (b - t) * ty;
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx, dy = y - cy;
      const di = (y * W + x) * 4;
      let sx: number, sy: number;
      const nx = dx / sxN, ny = dy / syN;
      const nd = Math.sqrt(nx * nx + ny * ny);
      if (nd < 1e-9 || p === 0) {
        sx = x; sy = y;
      } else {
        const factor = Math.pow(nd, p);            // |d|_norm^(exponent-1)
        sx = cx + dx * factor;
        sy = cy + dy * factor;
      }
      if (mix < 1) {
        for (let c = 0; c < 4; c++) {
          const warped = bilinear(sx, sy, c);
          dst[di + c] = src[di + c] + (warped - src[di + c]) * mix;
        }
      } else {
        dst[di]     = bilinear(sx, sy, 0);
        dst[di + 1] = bilinear(sx, sy, 1);
        dst[di + 2] = bilinear(sx, sy, 2);
        dst[di + 3] = bilinear(sx, sy, 3);
      }
    }
  }
  return new ImageData(dst, W, H);
}

registerFilter({
  uuid: 'C1278154-B061-453F-8BDE-9F70AB2E6066',
  names: ['paefisheye'],
  label: 'Fisheye',
  apply(input, ctx) {
    return fisheyeFilter(input, {
      amount: ctx.param('Amount', 15),
      radius: ctx.param('Radius', 1),
      centerX: ctx.nestedParam('Center', 'X', 0.5),
      centerY: ctx.nestedParam('Center', 'Y', 0.5),
      mix: ctx.param('Mix', 1),
    });
  },
});
