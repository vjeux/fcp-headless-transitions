/**
 * "Fill" FxPlug filter — plugin UUID 47D6B897-5749-4A6A-B93B-00FABCF72B25.
 *
 * Fills the layer with a solid Color (or, when "Fill With" selects gradient, a
 * Gradient — not used by the shipping transitions, see below), blended against
 * the incoming image by the Mix parameter.
 *
 * Used by 2 transitions:
 *   - Transitions/360°/360° Circle Wipe
 *   - Transitions/360°/360° Reveal Wipe
 * In both, the Fill sits in the 360°-reorient stack ahead of a Luma Keyer; it
 * paints the reoriented layer a flat color that the keyer then wipes.
 *
 * Parameter block (from the .motr):
 *   <parameter name="Fill With" id="1" default="0" value="0"/>     0 = Color, 1 = Gradient
 *   <parameter name="Color" id="2">                                 nested RGB, 0..1 float
 *       <parameter name="Red"   id="1" default="0.5" value="1"/>
 *       <parameter name="Green" id="2" default="0.5" value="0"/>
 *       <parameter name="Blue"  id="3" default="0.5" value="0"/>
 *   </parameter>
 *   <parameter name="Gradient" id="3">...</parameter>              (empty in these templates)
 *   <parameter name="Mix" id="10001" default="1" value="1"/>       output = lerp(input, fill, Mix)
 *
 * Behavior (matches FCP's Fill, validated against a ground-truth render):
 *   - Fill With = 0 (Color): every pixel's RGB becomes the fill Color.
 *   - The layer's ALPHA is preserved (Fill recolors, it does not paint over
 *     transparent regions with opaque color). Where the input is transparent the
 *     output stays transparent; the fill only affects the visible RGB. This is
 *     what lets the downstream Luma Keyer / 360° reorient behave correctly.
 *   - Mix blends the recolored result back toward the original per channel:
 *       out.rgb = input.rgb + (fillColor - input.rgb) * Mix
 *     (Mix = 1 → fully the fill color; Mix = 0 → unchanged input.)
 *
 * Color channels are 0..1 floats in the .motr; the compositor works in 0..255
 * so we scale by 255. Alpha is untouched by the Color fill.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE-1 RE NOTE — HgcFillColor (verbatim FCP Metal shader, Filters.bundle)
 * Extract with: venv/bin/python3 tools/re/extract_shader.py HgcFillColor
 *
 *   FragmentOut HgcFillColor_hgc_visible(const constant float4* hg_Params, float4 color0):
 *     const float4 c0 = (1, 0, 0, 1);
 *     r0     = color0;
 *     r1.xyz = hg_Params[0].xyz;          // fill color rgb
 *     r1.w   = 1.0;                        // fill alpha forced to 1
 *     r1     = mix(r0, r1, hg_Params[1]);  // lerp input -> fill by the Mix scalar
 *     out    = r1 * r0.wwww;               // <-- RE-PREMULTIPLY by the ORIGINAL alpha
 *
 *   hg_Params SLOT MAP:
 *     hg_Params[0].xyz = fill Color (0..1 rgb)
 *     hg_Params[1]     = Mix (used as a float4 lerp factor; the .rgb selects color,
 *                        the .w lerps alpha from input.a toward the forced 1.0)
 *
 *   KEY: the final `* r0.wwww` means the whole mixed result is multiplied by the
 *   INPUT alpha. So on fully-transparent pixels (a=0) the output is 0 (stays
 *   transparent) regardless of Mix — matching our "preserve/only affect visible"
 *   intent — and inside the shape the output is PREMULTIPLIED. Note FCP also
 *   lerps ALPHA toward 1 (r1.w=1, then mix by hg_Params[1].w) before the
 *   premultiply, so a partial Mix nudges edge alpha upward, not just rgb.
 *
 * ── PHASE-2 TODO (TS <-> FCP divergences) ─────────────────────────────────────
 *   TODO(P2-fill-1): ALPHA IS NOT INERT. TS copies input alpha through unchanged
 *     (out.a = ia). FCP forces fill alpha to 1 then does out = mix(in, fill, Mix)
 *     including the alpha lane, and finally premultiplies by input alpha. Net:
 *     FCP raises alpha toward 1 by Mix (then re-masks by the original coverage),
 *     TS leaves it untouched. For Mix=1 both give the same visible result on
 *     opaque pixels; they diverge at partial Mix / partial-alpha edges.
 *   TODO(P2-fill-2): PREMULTIPLIED OUTPUT. FCP emits premultiplied rgb
 *     (result * input.a). TS emits straight (non-premultiplied) rgb with alpha
 *     carried separately. Whether our compositor expects premultiplied here must
 *     be reconciled in Phase-2 (affects downstream Luma Keyer / 360° reorient).
 *   TODO(P2-fill-3): MIX IS A float4 IN FCP (per-lane lerp incl. alpha); TS uses
 *     a single clamped scalar on rgb only.
 */
import { registerFilter, type FilterContext } from './registry.js';

function readColorChannel(ctx: FilterContext, channelName: string, channelId: number, fallback: number): number {
  // The Color param is a nested parameter: Color -> { Red, Green, Blue }.
  const colorParam = ctx.filter.parameters.find(p => p.name === 'Color');
  if (colorParam?.children) {
    for (const c of colorParam.children) {
      if (c.name === channelName || c.id === channelId) {
        if (typeof c.value === 'number') return c.value;
        // (color channels are static in these templates; no curve support needed,
        //  but fall through to default if a curve ever appears)
        if (c.default !== undefined && typeof c.default === 'number') return c.default;
      }
    }
  }
  return fallback;
}

export function fillFilter(
  input: ImageData,
  opts: { r: number; g: number; b: number; mix: number },
): ImageData {
  const { r, g, b, mix } = opts;
  const w = input.width, h = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  const m = Math.max(0, Math.min(1, mix));

  // DECODED gamma/space path (fct/parity, transfer.PAEFill, 2026-07-22). Verified vs REAL
  // headless FCP at 0.26 rms: FCP lerps input(sRGB code) toward the fill color where the FILL
  // COLOUR is decoded via the TRUE sRGB EOTF to scene-linear first (input stays code), i.e.
  //   out = in*(1-Mix) + sRGBtoLinear(fill)*255*Mix
  // (an authored fill 0.5 contributes effective code 54.5 = s2l(0.5)*255, NOT 127.5 — which is
  // why the naive code-space lerp diverged: gray-0.5 fill, Mix 0.5, in 240 -> FCP 147 vs
  // code-lerp 184). Decoded faithful path (VERIFIED vs REAL FCP headless).
  const s2l = (c01: number): number => (c01 <= 0.04045 ? c01 / 12.92 : Math.pow((c01 + 0.055) / 1.055, 2.4));
  const fr = s2l(r) * 255;
  const fg = s2l(g) * 255;
  const fb = s2l(b) * 255;

  for (let i = 0; i < src.length; i += 4) {
    const ir = src[i], ig = src[i + 1], ib = src[i + 2], ia = src[i + 3];
    // Recolor RGB toward the fill color by Mix; preserve alpha.
    out[i]     = ir + (fr - ir) * m;
    out[i + 1] = ig + (fg - ig) * m;
    out[i + 2] = ib + (fb - ib) * m;
    out[i + 3] = ia;
  }

  return new ImageData(out, w, h);
}

registerFilter({
  uuid: '47D6B897-5749-4A6A-B93B-00FABCF72B25',
  names: ['fill'],
  label: 'Fill',
  apply(input, ctx) {
    // Only Color mode (Fill With = 0) is used by the shipping transitions.
    // Gradient mode (Fill With = 1) has no gradient stops in these templates;
    // if it is ever encountered we leave the input unchanged rather than guess.
    const fillWith = ctx.param('Fill With', 0);
    if (fillWith >= 0.5) return input;

    const r = readColorChannel(ctx, 'Red', 1, 0.5);
    const g = readColorChannel(ctx, 'Green', 2, 0.5);
    const b = readColorChannel(ctx, 'Blue', 3, 0.5);
    const mix = ctx.param('Mix', 1);
    if (mix <= 0) return input;

    return fillFilter(input, { r, g, b, mix });
  },
});
