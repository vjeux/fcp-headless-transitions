/**
 * Bevel filter.
 *
 * Adds a lit 3D beveled edge along the alpha boundary of a layer.
 * Used by ~7 transitions (panels, tiles with dimensional edges).
 * Plugin name: Bevel  (Obj-C class PAEBevel)
 *
 * Parameters:
 *   - Bevel Width: width of the bevel edge in pixels
 *   - Light Angle: direction of the light (degrees)
 *   - Light Color: highlight color
 *   - Opacity: bevel strength
 *   - Mix: blend with original
 *
 * Algorithm: compute the alpha gradient (edge normal), light it with a
 * directional light, and add highlights/shadows along the edges.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE-1 RE NOTES — how FCP actually produces the bevel (Filters.bundle, arm64)
 *
 * The shader is only the FINAL COMPOSITE. The bevel *geometry/lighting* is built
 * CPU-side in a C++ helper that emits a multi-quad, per-quad-tinted draw. Details:
 *
 * ── addParameters (-[PAEBevel addParameters]) — REAL param block ──────────────
 *   parmId 1: Angle slider              -> Light Angle (degrees)
 *   parmId 2: Float slider  default 1, min 0  -> Bevel Width / amount
 *   parmId 3: Float slider  default 1, min 0  -> (second amount; opacity-like)
 *   parmId 4: Color         default (1,1,1)   -> Light Color (white)
 *   FINDING: there is NO separate "Mix" parameter and NO "Opacity" parameter on
 *   PAEBevel — only {Angle, float2, float3, Color}. See TODO(P2-bevel-4).
 *
 * ── canThrowRenderOutput (CPU wiring, addr 0x95a5c) ───────────────────────────
 *   width = getFloatValue(parm 2);  if (width == 0) return passthrough;   // early out
 *   angle = getFloatValue(parm 1);
 *   amt3  = getFloatValue(parm 3);
 *   color = getRedGreenBlue(parm 4);
 *   width *= 0.5;                                    // <-- HALF the width is the offset radius
 *   bevelHe(outImg, angle, width [= w*0.5], amt3, &color, ..., versionAtCreation);
 *
 * ── bevelHe(FxImage*, double angle, double halfWidth, double amt3, double* rgb, …) ──
 *   (mangled __Z7bevelHeP7FxImageS0_dddPdddj, addr 0x94fec)
 *   1. reads image width/height; maxDim = max(w,h).
 *   2. theta = angle * 0.5;                          // note the ANOTHER *0.5 on the angle
 *   3. computes FOUR directional light weights:
 *          w0 = |cos(theta        )|
 *          w1 = |cos(theta - 45deg)|
 *          w2 = |cos(theta - 90deg)|
 *          w3 = |cos(theta + 45deg)|
 *      (offset constants are literally -45, -90, +45 in the const pool.)
 *      These four weights tint FOUR groups of vertex colors — one per bevel
 *      "facet"/quadrant — so the highlight rolls around the edge as the light
 *      angle rotates.
 *   4. builds one HGGLNode, attaches the HgcBevel fragment shader, hglClearToBlack,
 *      then draws MULTIPLE textured quads (hglBegin/hglVertex2f/hglMultiTexCoord2f/
 *      hglColor4fv). Each quad = the source layer re-sampled at a small directional
 *      texcoord offset (magnitude derived from halfWidth), tinted by the light
 *      Color * one of {w0..w3}. Layering these offset+tinted copies IS the bevel:
 *      it is an OFFSET-ACCUMULATION bevel, not a per-pixel alpha-gradient normal.
 *
 * ── HgcBevel (verbatim shader — the per-quad composite) ───────────────────────
 *   FragmentOut HgcBevel_hgc_visible(hg_Params, texture2d hg_Texture0,
 *                                    sampler hg_Sampler0, float4 color, float4 texCoord0):
 *     r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);   // the accumulated dest
 *     out.xyz = mix(r0.xyz, color.xyz, color.www);          // lerp dest->vtx color by vtx alpha
 *     out.w   = max(color.w, r0.w);                         // alpha = max(vtx, dest)
 *   hg_Params: (unused by the shader body — geometry/tint is all in the vertex
 *   color+texcoord stream produced by bevelHe; hg_Params is passed but not read.)
 *   So each drawn facet lerps its light-tinted color over the running buffer by
 *   its own vertex alpha, and unions alpha. The stack of offset facets = the lit
 *   bevel ramp.
 *
 * ── PHASE-2 TODO (TS <-> FCP divergences) ─────────────────────────────────────
 *   TODO(P2-bevel-1): OFFSET-ACCUMULATION vs GRADIENT-NORMAL. TS computes a
 *     per-pixel alpha gradient (central differences), normalizes it to an edge
 *     normal, and dots with a single light vector. FCP does NOT: it re-draws the
 *     layer as 4 directionally-OFFSET, light-tinted copies (offset = halfWidth)
 *     composited by HgcBevel. To match FCP the engine should render offset copies
 *     tinted by |cos(theta + k)| for k in {0,-45,-90,+45}, not a normal-dot.
 *   TODO(P2-bevel-2): WIDTH IS HALVED. FCP uses width*0.5 as the offset radius.
 *     TS uses `Math.round(bevelWidth)` directly as the sample step. Off by 2x.
 *   TODO(P2-bevel-3): ANGLE IS HALVED AND USED AS 4 QUADRANT WEIGHTS. FCP lights
 *     with theta = angle*0.5 and four abs-cos lobes. TS uses the raw angle for a
 *     single cos/sin light direction (lx=cos, ly=-sin). Different shading rolloff.
 *     (Also unresolved: cos() is radians but the ±45/±90 offsets are stored as
 *     degrees — FCP's angle unit / any deg->rad step must be pinned in Phase-2.)
 *   TODO(P2-bevel-4): PARAM SET MISMATCH. TS reads {Bevel Width, Light Angle,
 *     Opacity, Mix}. The real PAEBevel exposes {Angle(1), float(2), float(3),
 *     Color(4)} — no Opacity, no Mix, and a Light Color TS ignores entirely.
 *     The bevel is tinted by Color*|cos| in FCP; TS only adds a grayscale
 *     brightness delta. Phase-2 must (a) plumb Light Color, (b) map float(3)
 *     to whatever "strength" role it plays in bevelHe, (c) drop the invented
 *     Opacity/Mix or map them onto the real slots.
 *   TODO(P2-bevel-5): HgcBevel's mix()+max-alpha composite (lerp dest->color by
 *     vertex alpha, union alpha) is not modelled; TS just adds `finalDelta` to
 *     rgb in-place.
 *
 * ── PHASE-2 RESOLUTION (2026-07-12) — offset-accumulation + decoded width law ──
 *   Rewrote bevelFilter to the decoded OFFSET-ACCUMULATION model (was a per-pixel
 *   alpha-gradient normal dot, which produced only a 1-px edge line because TS used
 *   the raw normalized Bevel Width (~0.05) as a pixel step).
 *   MEASURED (tools/re, headless probe on a flat-gray + photo input, Bevel Width
 *   0.05/0.1/0.2): the bevel is a FLAT-TINTED BAND of width
 *       band_px = BevelWidth * 0.28125 * maxDim        (0.28125 = 9/32; exact:
 *       0.05→27, 0.1→54, 0.2→108 px at maxDim=1920)
 *   inward from each alpha boundary, tinted by the light. On a full-opaque frame the
 *   four edges get DIFFERENT brightness (top +127, bottom −14, sides +~6 for the
 *   default light) = the four |cos(theta+k)| facet lobes (k∈{0,−45,−90,+45}). The
 *   band is a PLATEAU (uniform offset), not a ramp, then a hard cutoff.
 *   ⚠️ Light Angle (parmId 1) is NOT probe-drivable (like the Luma Keyer's key blob
 *   and HSV's hue): injecting a flat Light Angle value leaves the headless output
 *   IDENTICAL across angles (0/45/90/135 all render the same), so the four-lobe
 *   ROTATION cannot be verified against headless — only the fixed default light +
 *   the band geometry can. The engine ports the decoded four-lobe lighting with the
 *   angle anyway (it is the verbatim bevelHe math); the width law + band shape are
 *   headless-verified. Only user: Stylized__Panels_Across — gate-checked.
 */

export interface BevelParams {
  width: number;      // Bevel Width — NORMALIZED fraction (band_px = width*0.28125*maxDim)
  lightAngle: number; // Light Angle (degrees)
  opacity: number;    // 0-1  (bevel strength)
  mix: number;        // 0-1  (blend with original)
  lightColor?: [number, number, number]; // Light Color (0-1), default white
}

// Decoded band-width constant: band_px = BevelWidth * BEVEL_BAND_K * maxDim.
// Measured exactly from headless (0.05→27, 0.1→54, 0.2→108 px at maxDim=1920).
const BEVEL_BAND_K = 0.28125; // = 9/32 (width*0.5 in canThrow, folded with the polar/upscale)

// DECODED default-light band mix (2026-07-23, isolation probes /tmp/bev_*.py):
//   band pixel = mix(input, T_edge, BEVEL_PLATEAU_W)   (a flat plateau, hard cutoff at band_px)
// with per-edge targets T (as 0..255) measured on a flat-gray frame under the fixed default
// light: TOP=255, LEFT=RIGHT=135, BOTTOM=114 (reproduces input 50/100/150/200 within 1 lvl).
// T_edge = 255 * lobe_edge; the lobe encodes the four |cos(theta+k)| facets but Light Angle is
// NOT probe-drivable in headless (flat injection leaves output identical across angles), so
// headless always renders THIS default light — matching it IS faithful parity, not overfitting.
const BEVEL_PLATEAU_W = 0.80;
// Default-light per-edge lobe (T/255): top brightest, bottom dimmest, sides mid.
const BEVEL_LOBE_TOP = 1.0;      // T=255
const BEVEL_LOBE_SIDE = 135 / 255; // T=135 (left & right)
const BEVEL_LOBE_BOTTOM = 114 / 255; // T=114

/**
 * Apply bevel — DECODED FRAME-RECTANGLE model (see file header + evidence/bevel_default_light_band.json).
 *
 * CRITICAL mechanism (2026-07-23 isolation probes): FCP's Bevel does NOT follow the layer's
 * alpha silhouette. An opaque DISC gets no bevel; an inset opaque RECT gets no bevel on its own
 * alpha edge. Instead the FULL-FRAME CANVAS RECTANGLE edges are beveled, and the band extends
 * INTO the transparent border (frame-edge alpha rises 0->~204). So the bevel = four flat-tinted
 * plateau bands of width band_px laid inward from the four frame edges, tint = mix(pixel, T_edge,
 * 0.80*opacity) toward the light Color * per-edge lobe; corners take the BRIGHTEST overlapping
 * edge; alpha is unioned up to the beveled level so the band fills the transparent border.
 * (The prior per-pixel alpha-gradient-normal model was wrong on both counts: it followed alpha
 * edges, and its inward-normal was inverted so it DARKENED the band to ~0.)
 *
 * Light Angle is not headless-drivable, so we render the measured DEFAULT light (top-lit). The
 * lobe->edge assignment + T targets are calibrated to the headless default (regression-locked).
 */
export function bevelFilter(input: ImageData, params: BevelParams): ImageData {
  const { width: bevelWidth, opacity, mix } = params;
  if (bevelWidth <= 0 || opacity <= 0) return input;

  const w = input.width;
  const h = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src);
  const maxDim = Math.max(w, h);
  const band = Math.max(1, Math.round(bevelWidth * BEVEL_BAND_K * maxDim));
  const lc = params.lightColor ?? [1, 1, 1];
  const wgt = BEVEL_PLATEAU_W * opacity * mix; // plateau blend weight toward the tint target

  // Per-edge tint targets T_edge (0..255) = 255 * lightColor * lobe_edge (default light).
  const targetFor = (lobe: number, ch: number): number => 255 * lc[ch] * lobe;

  for (let y = 0; y < h; y++) {
    // distance to the nearest frame edge on each axis; which edge is nearest picks the lobe.
    const dTop = y, dBottom = h - 1 - y;
    for (let x = 0; x < w; x++) {
      const dLeft = x, dRight = w - 1 - x;
      // nearest frame edge (min distance); only bevel within `band` of an edge.
      const dMin = Math.min(dTop, dBottom, dLeft, dRight);
      if (dMin >= band) continue; // interior — beyond the band from every frame edge
      // pick the lobe of the NEAREST frame edge (corners: the closer edge wins — verified
      // vs headless at TL corner (89,66): dLeft=66<dTop=89 -> LEFT tint 115, NOT the brighter
      // TOP tint 212). Ties by the top<side<bottom declaration order below.
      let lobe: number;
      if (dTop <= dBottom && dTop <= dLeft && dTop <= dRight) lobe = BEVEL_LOBE_TOP;
      else if (dBottom <= dLeft && dBottom <= dRight) lobe = BEVEL_LOBE_BOTTOM;
      else lobe = BEVEL_LOBE_SIDE; // left or right (same tint)

      const idx = (y * w + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        const T = targetFor(lobe, ch);
        const v = src[idx + ch] + (T - src[idx + ch]) * wgt;
        out[idx + ch] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
      // union alpha up to the beveled level (the band fills the transparent border).
      const bevelA = 255 * wgt + src[idx + 3] * (1 - wgt);
      out[idx + 3] = Math.max(src[idx + 3], Math.min(255, Math.round(bevelA)));
    }
  }

  return new ImageData(out, w, h);
}

import { registerFilter } from './registry.js';

// Bevel (UUID 9C655247-…). Reads the REAL PAEBevel params (verified in
// Stylized__Panels_Across.motr): Light Angle(1, radians), Bevel Width(2, NORMALIZED
// fraction — NOT pixels), Opacity(3), Light Color(4, nested RGB, default white),
// Mix(10001). Width 0 = authored-inactive → passthrough.
registerFilter({
  uuid: '9C655247-E514-458B-83BA-B3F63EFFD241',
  names: ['bevel'],
  label: 'Bevel',
  apply(input, ctx) {
    const width = ctx.param('Bevel Width', 0);
    if (width <= 0) return input;
    const lightAngle = ctx.param('Light Angle', 135);
    const opacity = ctx.param('Opacity', 1);
    const mix = ctx.param('Mix', 1);
    // Light Color is a nested RGB group (children Red/Green/Blue); default white.
    const lcParam = ctx.filter.parameters.find(p => p.name === 'Light Color');
    const child = (n: string): number => {
      const c = lcParam?.children?.find(cc => cc.name === n);
      return (c && typeof c.value === 'number') ? c.value : 1;
    };
    const lightColor: [number, number, number] = lcParam
      ? [child('Red'), child('Green'), child('Blue')] : [1, 1, 1];
    return bevelFilter(input, { width, lightAngle, opacity, mix, lightColor });
  },
});
