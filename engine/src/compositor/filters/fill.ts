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

  // Fill color scaled to 0..255.
  const fr = r * 255, fg = g * 255, fb = b * 255;
  const m = Math.max(0, Math.min(1, mix));

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
