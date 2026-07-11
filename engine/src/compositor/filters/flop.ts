/**
 * "Flop" FxPlug filter — plugin UUID 2FF8887B-E673-4727-9601-1B3353531C10
 * (FCP internal class PAEFlop, node name usually "Flop").
 *
 * Mirrors the layer image about its center — horizontally, vertically, or both.
 *
 * Used by 2 built-in transitions:
 *   - Movements/Flip                 (Flop = 0, Horizontal)
 *   - Replicator-Clones/Concentric   (Flop = 0, Horizontal)
 *
 * Parameter block (from the .motr):
 *   <parameter name="Flop" id="1" default="0" value="0"/>   popup: Horizontal|Vertical|Both
 *   <parameter name="Mix"  id="10001" .../>   (host-level mix; 1 in both templates)
 *   <parameter name="Flip" id="10002" .../>   (host-level; unused by the filter)
 *   <parameter name="Input Points" id="10003" .../>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE-1 RE NOTE — PAEFlop (verbatim from Filters.bundle arm64 disassembly)
 * There is NO Metal shader: Flop is a pure geometric transform built CPU-side and
 * applied through a Helium XForm node (FxSupport::makeHeliumXForm). The whole of
 * -[PAEFlop canThrowRenderOutput:withInput:withInfo:]:
 *
 *   1. getPixelTransformForImage:  -> M   (pixel<-normalized, origin at center)
 *      getInversePixelTransformForImage: -> Minv
 *   2. getIntValue:fromParm: parmId=1 -> value (0..2); value>=3 is rejected.
 *   3. Build a 4x4 scale matrix S = identity, then:
 *        w8 = 6 >> value
 *        if (value bit0 == 0)  negate the X axis of S   // value 0 (H) or 2 (Both)
 *        if (w8   bit0 == 1)  negate the Y axis of S    // value 1 (V) or 2 (Both)
 *      i.e.  Horizontal(0): Sx=-1        (mirror left<->right)
 *            Vertical(1):   Sy=-1        (mirror top<->bottom)
 *            Both(2):       Sx=-1, Sy=-1 (180° point reflection)
 *   4. Compose  T = M * S * Minv  (PCMatrix44 rightMult) so the flip happens about
 *      the image CENTER in pixel space (the pixel-transform origin), then
 *      makeHeliumXForm(T, inputHeliumRef, resample?) draws the input through T.
 *   The "Input Points"/"Flip"/"Mix" params are host-level (added by the shared base),
 *   not read here; the only filter parameter consumed is the Flop popup (parmId 1).
 *
 * Because it's an axis-aligned ±1 mirror about the exact center, it is a lossless
 * pixel permutation (no resampling needed for the integer-center case): output(x,y)
 * = input(mirrored x, mirrored y).
 * ── PHASE-2: matches FCP exactly for the axis mirror; verified vs headless below.
 */
import { registerFilter } from './registry.js';

/** Mirror pixels about the image center. flipX/flipY select the axes. */
export function flopFilter(input: ImageData, flipX: boolean, flipY: boolean): ImageData {
  const w = input.width, h = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    const sy = flipY ? (h - 1 - y) : y;
    for (let x = 0; x < w; x++) {
      const sx = flipX ? (w - 1 - x) : x;
      const di = (y * w + x) * 4;
      const si = (sy * w + sx) * 4;
      out[di] = src[si];
      out[di + 1] = src[si + 1];
      out[di + 2] = src[si + 2];
      out[di + 3] = src[si + 3];
    }
  }
  return new ImageData(out, w, h);
}

registerFilter({
  uuid: '2FF8887B-E673-4727-9601-1B3353531C10',
  names: ['paeflop', 'flop'],
  label: 'Flop',
  apply(input, ctx) {
    // Flop popup: 0=Horizontal (mirror X), 1=Vertical (mirror Y), 2=Both.
    const mode = Math.round(ctx.param('Flop', 0));
    if (mode < 0 || mode > 2) return input;
    const flipX = mode === 0 || mode === 2;
    const flipY = mode === 1 || mode === 2;
    if (!flipX && !flipY) return input;
    return flopFilter(input, flipX, flipY);
  },
});
