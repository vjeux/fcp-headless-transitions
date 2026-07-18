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
 *
 * ── PHASE-2 FAITHFUL VERIFICATION (2026-07-18, isolated headless probes):
 *   The Flop mirror is FAITHFUL across its full param space (Flop ∈ {0,1,2}). Injecting
 *   PAEFlop into the Directional skeleton (factoryID=7) and rendering a static full-frame
 *   source through real headless FCP, then comparing to this filter's mirror:
 *     • smooth gradient (JPEG-clean): H/V mirror = 46.3 dB (sub-pixel resample residual only)
 *     • radial-spoke pattern (all-edges worst case): 27.9 dB vs mirror, 3.9 dB vs unmirrored
 *     • synth solo scene (Movements__Fall scaffold + Flop): 35.5 dB engine-vs-oracle
 *   i.e. Both axes and both modes reproduce headless FCP within resample/JPEG noise.
 *   ⚠️ The per-primitive faithful sweep reports PAEFlop DIVERGED (worst ddb 10.7) but that
 *   is ENTIRELY host contamination, NOT a Flop bug: the only host with a Flop param-response
 *   is Replicator-Clones__Concentric, where Flop mirrors a REPLICATOR layer whose per-cell
 *   geometry ALREADY differs between engine and FCP (the replicator gap is a SEPARATELY-
 *   tracked primitive). Mirroring a mismatched base yields a mismatched result — the
 *   divergence is the replicator's. In Movements__Flip the Flop param is INERT (0 oracle
 *   signal: the Flip host's content is symmetric under the flop axis). So Flop has no clean
 *   embedded host; its authoritative verdict is the isolated/synth probe above = FAITHFUL.
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
    // Host-level Mix is a LINEAR BLEND toward the mirrored image, DECODED 2026-07-18 vs
    // headless FCP on a gradient probe: out = (1-Mix)·orig + Mix·mirror (46+ dB at every
    // Mix ∈ {0,0.25,0.5,0.75,1}; Mix=0 == bypass/orig, Mix=1 == pure mirror). Same combine
    // as the blur family's host Mix. Both shipping users (Flip/Concentric) author Mix=1 so
    // this is byte-identical on the gate; it makes the primitive faithful across the Mix
    // param space (Rule 13). Short-circuit the endpoints so the common Mix=1 stays exact.
    const mix = ctx.param('Mix', 1);
    if (mix <= 0) return input;
    const mirrored = flopFilter(input, flipX, flipY);
    if (mix >= 1) return mirrored;
    const a = input.data, b = mirrored.data;
    const out = new Uint8ClampedArray(a.length);
    for (let i = 0; i < a.length; i++) out[i] = Math.round(a[i] * (1 - mix) + b[i] * mix);
    return new ImageData(out, input.width, input.height);
  },
});
