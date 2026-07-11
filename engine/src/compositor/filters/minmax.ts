/**
 * "MinMax" FxPlug filter — plugin UUID D2342006-51C4-4439-8E89-E970F135E21C
 * (FCP internal class PAEMinMax; node names MinMax2/3/4 in the templates).
 *
 * Morphological erode/dilate. FCP UI: "Erodes or dilates the light or dark areas."
 *   Mode popup (parmId 1): 0 = Minimum (erode), 1 = Maximum (dilate).
 *   Radius (parmId 2): window half-width, 0..250 in the .motr's normalized space.
 *
 * Used by 1 built-in transition (3 stacked instances at different Radius ramps):
 *   - Dissolves/Divide  (MinMax2 Mode=1 R:0→32, MinMax3 Mode=1 R:0→194, MinMax4 Mode=1 R:0→29)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE-1 RE NOTE — PAEMinMax + Helium MinMax::MMNode (VERBATIM)
 *
 * PAEMinMax builds a Helium `HGMinMax` node (Filters.bundle arm64,
 * -[PAEMinMax canThrowRenderOutput:withInput:withInfo:] @ 0x45fa4):
 *   1. getIntValue parmId=1 -> Mode (0/1); parmId=2 -> Radius(int).
 *   2. If Radius == 0  -> passthrough (setHeliumRef input, no node).  [@0x460b4]
 *   3. Else new HGMinMax; setter@0x78(0, Mode) selects Min vs Max.
 *      setter@0x60(idx0, {0,0,0,0}) and setter@0x60(idx1, {d9*R, d8*R, 0,0})
 *      where d9 = pixelXform.sx ([sp+0x50]), d8 = pixelXform.sy ([sp+0x78]) from
 *      getPixelTransformForImage. So the Radius is scaled by the image's pixel
 *      transform to get SEPARATE X and Y pixel radii (equal for a square pixel
 *      conform). getImageBoundary + changeDOD/crop wrap the node.
 *
 * The node is SEPARABLE: Helium instantiates MinMax::MMNode<Mode,Axis> for
 * (MIN,X),(MIN,Y),(MAX,X),(MAX,Y) — an X pass then a Y pass.
 *
 * VERBATIM Helium Metal shader (MMNode<MIN,X>::GetProgram, Helium.framework):
 *   fragment FragmentOut fragmentFunc(... hg_Params, hg_Texture0, hg_Sampler0) {
 *     const int16_t radius {static_cast<int16_t>(hg_Params[0].x)};
 *     float4 R0 {sample(texCoord0)};                 // center pixel
 *     for (int16_t k {1}; k <= radius; ++k) {
 *       float4 R1 {sample(texCoord0.x + k, y)};      // +k pixels
 *       float4 R2 {sample(texCoord0.x - k, y)};      // -k pixels
 *       R0 = min(R0,R1);  R0 = min(R0,R2);           // (MAX variant uses max)
 *     }
 *     return R0;
 *   }
 *   The Y-axis shader is identical with (x, y±k). The MAX variants replace min→max.
 *
 * KEY FACTS for an exact match:
 *   - Window is the FULL [-R, +R] (2R+1 samples), NOT a fixed tap count.
 *   - Samples at INTEGER pixel offsets (texCoord in pixel space; nearest since the
 *     offsets are integers on an aligned grid).
 *   - Runs on ALL 4 channels (RGBA) independently — including ALPHA. The Helium
 *     image is PREMULTIPLIED, so min/max operate on premultiplied rgba.
 *   - Radius is floor()'d to int CPU-side (fcvtms in SetParameter @0x1efd84:
 *     fcvtms w8,s0; reject if negative). Radius=0 => identity (loop never runs).
 *   - Separable: full 2-D result = Ypass(Xpass(image)).
 *
 * ── PHASE-2: TS reproduces the verbatim separable X-then-Y (2R+1) min/max on
 *    premultiplied RGBA with clamp-at-edge addressing (Helium uses a texture wrap
 *    mode set on the input; the transition's DOD is cropped to the image, so edge
 *    pixels clamp/replicate). Verified vs headless FCP (see commit message).
 */
import { registerFilter } from './registry.js';

/** One separable pass: min (mode 0) or max (mode 1) over [-R,+R] along one axis. */
function minmaxPass(
  src: Uint8ClampedArray, w: number, h: number, radius: number, isMax: boolean, horizontal: boolean,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(src.length);
  const pick = isMax ? Math.max : Math.min;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = src[(y * w + x) * 4];
      let g = src[(y * w + x) * 4 + 1];
      let b = src[(y * w + x) * 4 + 2];
      let a = src[(y * w + x) * 4 + 3];
      for (let k = 1; k <= radius; k++) {
        // +k and -k, clamped to the image edge (replicate).
        let xp: number, yp: number, xn: number, yn: number;
        if (horizontal) {
          xp = Math.min(w - 1, x + k); xn = Math.max(0, x - k); yp = y; yn = y;
        } else {
          yp = Math.min(h - 1, y + k); yn = Math.max(0, y - k); xp = x; xn = x;
        }
        const ip = (yp * w + xp) * 4, inn = (yn * w + xn) * 4;
        r = pick(pick(r, src[ip]), src[inn]);
        g = pick(pick(g, src[ip + 1]), src[inn + 1]);
        b = pick(pick(b, src[ip + 2]), src[inn + 2]);
        a = pick(pick(a, src[ip + 3]), src[inn + 3]);
      }
      const o = (y * w + x) * 4;
      out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = a;
    }
  }
  return out;
}

/** Separable morphology: X pass then Y pass, mirroring Helium's MMNode chain. */
export function minmaxFilter(input: ImageData, radius: number, isMax: boolean): ImageData {
  const w = input.width, h = input.height;
  const r = Math.max(0, Math.floor(radius));
  if (r === 0) return input;
  const xPass = minmaxPass(input.data, w, h, r, isMax, true);
  const yPass = minmaxPass(xPass, w, h, r, isMax, false);
  const out = new Uint8ClampedArray(yPass.length);
  out.set(yPass);
  return new ImageData(out, w, h);
}

registerFilter({
  uuid: 'D2342006-51C4-4439-8E89-E970F135E21C',
  names: ['minmax'],
  label: 'MinMax',
  apply(input, ctx) {
    // Mode: 0 = Minimum (erode), 1 = Maximum (dilate).
    const mode = Math.round(ctx.param('Mode', 0));
    // Radius in the .motr's normalized space maps ~1:1 to render pixels at conform
    // (pixel-transform scale ≈ 1 for a full-frame 1920×1080 render). floor() to int.
    const radius = ctx.blurAmount('Radius', 0);
    if (radius <= 0) return input;
    return minmaxFilter(input, radius, mode >= 1);
  },
});
