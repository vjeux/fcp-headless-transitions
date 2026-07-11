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
 */

export interface BevelParams {
  width: number;      // bevel width in pixels
  lightAngle: number; // degrees
  opacity: number;    // 0-1
  mix: number;        // 0-1
}

/**
 * Apply bevel effect to an image.
 */
export function bevelFilter(input: ImageData, params: BevelParams): ImageData {
  const { width: bevelWidth, lightAngle, opacity, mix } = params;
  if (bevelWidth <= 0 || opacity <= 0) return input;

  const w = input.width;
  const h = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src);

  // Light direction
  const rad = lightAngle * Math.PI / 180;
  const lx = Math.cos(rad);
  const ly = -Math.sin(rad);

  const step = Math.max(1, Math.round(bevelWidth));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const a = src[idx + 3];
      if (a === 0) continue; // outside the shape

      // Compute alpha gradient (edge normal) via central differences
      const xl = Math.max(0, x - step), xr = Math.min(w - 1, x + step);
      const yt = Math.max(0, y - step), yb = Math.min(h - 1, y + step);
      const aL = src[(y * w + xl) * 4 + 3];
      const aR = src[(y * w + xr) * 4 + 3];
      const aT = src[(yt * w + x) * 4 + 3];
      const aB = src[(yb * w + x) * 4 + 3];

      const gx = (aR - aL) / 255;
      const gy = (aB - aT) / 255;
      const gradMag = Math.sqrt(gx * gx + gy * gy);

      if (gradMag < 0.01) continue; // interior — no bevel

      // Normalize gradient (points from transparent → opaque = edge normal)
      const nx = -gx / gradMag;
      const ny = -gy / gradMag;

      // Dot with light direction → highlight (+) or shadow (-)
      const light = nx * lx + ny * ly;

      // Apply as brightness delta scaled by gradient magnitude, opacity
      const delta = light * gradMag * opacity * 128;
      const finalDelta = delta * mix;

      for (let c = 0; c < 3; c++) {
        out[idx + c] = Math.max(0, Math.min(255, src[idx + c] + finalDelta));
      }
    }
  }

  return new ImageData(out, w, h);
}

import { registerFilter } from './registry.js';

// Bevel (UUID 9C655247-…). Behavior-identical to the legacy name-matched branch:
// reads Bevel Width / Light Angle / Opacity / Mix (defaults 0/135/1/1); a width of
// 0 leaves the input unchanged (filter authored-inactive).
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
    return bevelFilter(input, { width, lightAngle, opacity, mix });
  },
});
