/**
 * Gradient generator.
 *
 * Fills a region with a color gradient (linear or radial).
 * Used by ~8 transitions for background fills, light sweeps, and overlays.
 *
 * A gradient has color stops (position 0-1 → RGBA color). Between stops,
 * colors interpolate linearly.
 *
 * ============================================================================
 * VERBATIM FCP SHADERS (Phase-1 reverse-engineering — source of truth)
 * ============================================================================
 * CPU wiring: `-[PAEGradient addParameters]` (Filters.bundle arm64) adds:
 *   - addGradientPositionedWithName  → the gradient color RAMP (baked into a 1-D
 *     lookup TEXTURE, hg_Texture0, that the shaders SAMPLE — NOT a per-stop CPU
 *     interpolation like this TS file does; see FINDING A below).
 *   - addPopupMenuWithName           → the "Type" selector (Linear / Radial / …)
 *     which picks WHICH Hgc<…> fragment shader runs.
 *   - addToggleButtonWithName        → a boolean toggle (e.g. dither/repeat).
 * PAEGradient uses the Hgc shaders below; PAECIGaussianGradient uses
 * HgcCIGaussianGradient (documented over renderGaussianGradient further down).
 *
 * ── HgcGradientLinear (LEN=0x374), verbatim: ────────────────────────────────
 *   const float4 c0 = float4(0.0, 0.5, 0.0, 0.0);
 *   r0.xyz = hg_Params[1].xyz - hg_Params[0].xyz;   // axis  = end - start
 *   r1.xyz = texCoord0.xyz    - hg_Params[0].xyz;   // p     = pixel - start
 *   r1.x   = dot(r0.xyz, r1.xyz);                    // p·axis
 *   r0.x   = dot(r0.xyz, r0.xyz);                    // |axis|²
 *   r1.x   = r1.x / r0.x;                            // t = (p·axis)/|axis|²  (0..1 along axis)
 *   r1.x   = r1.x * hg_Params[2].x;                  // × ramp width  (params[2].x = LUT texel count)
 *   r1.x   = fmax(r1.x, 0.0);
 *   r1.x   = fmin(r1.x, hg_Params[2].y);             // clamp to [0, lastTexel]
 *   r1.y   = 0.0;
 *   r1.xy  = floor(r1.xy);                           // NEAREST texel (integer index)
 *   r1.xy  = r1.xy + 0.5;                            // texel centre
 *   r1.xy  = r1.xy + hg_Params[3].xy;                // LUT atlas offset
 *   r1.xy  = r1.xy * hg_Params[3].zw;                // LUT atlas scale → uv
 *   r1     = hg_Texture0.sample(hg_Sampler0, r1.xy); // fetch ramp color (RGBA)
 *   r1.xyz = r1.xyz * r1.www;                        // PREMULTIPLY rgb by alpha
 *   output.color0 = r1;
 *
 *   Meaning: linear gradient is the SCALAR PROJECTION of the pixel onto the
 *   (start→end) axis, normalized by axis length² so t∈[0,1] runs start→end.
 *   The projection is then quantized to the nearest ramp texel and looked up in
 *   a precomputed 1-D color LUT (hg_Texture0). Output is PREMULTIPLIED alpha.
 *   hg_Params slot map:
 *     [0].xyz = start point (texCoord space)
 *     [1].xyz = end point   (texCoord space)   → axis = [1]-[0]
 *     [2].x   = ramp texel count (t → texel index scale)
 *     [2].y   = max texel index (clamp upper bound)
 *     [3].xy  = LUT atlas offset ; [3].zw = LUT atlas scale (index → uv)
 *
 * ── HgcGradientRadial (LEN=0x4d5), verbatim: ────────────────────────────────
 *   const float4 c0 = float4(0.0, 0.5, 1.0, 0.0);
 *   r0.xyz = texCoord0.xyz - hg_Params[0].xyz;       // p - center
 *   r0.x   = dot(r0.xyz, r0.xyz);
 *   r0.x   = sqrt(r0.x);                             // d = |p - center|
 *   r0.x   = r0.x - hg_Params[1].x;                  // d - innerRadius
 *   r1.x   = hg_Params[1].y - hg_Params[1].x;        // outerRadius - innerRadius
 *   r0.x   = r0.x / r1.x;                            // t = (d - inner)/(outer - inner)  (0..1)
 *   r2.x   = r0.x * hg_Params[1].z;                  // × ramp texel count
 *   r2.x   = fmax(r2.x, 0.0); r2.x = fmin(r2.x, hg_Params[1].w);  // clamp [0,lastTexel]
 *   r2.y   = 0.0; r2.xy = floor(r2.xy); r2.xy += 0.5;             // nearest texel centre
 *   r2.xy  = r2.xy + hg_Params[2].xy; r2.xy = r2.xy * hg_Params[2].zw;  // LUT atlas uv
 *   r2     = hg_Texture0.sample(hg_Sampler0, r2.xy); // ramp color
 *   // --- edge alpha rolloff (soft in/out at the inner & outer rings): ---
 *   r3.x   = 1.0 - r0.x;                             // distance past outer edge
 *   r0.x   = clamp(r0.x*r1.x + 0.5, 0, 1);           // fade-in  near inner ring (½-texel wide)
 *   r4.x   = float(0.0 >= hg_Params[1].x);           // if innerRadius<=0, disable inner fade
 *   r0.x   = fmax(r0.x, r4.x);
 *   r3.x   = clamp(r3.x*r1.x + 0.5, 0, 1);           // fade-out near outer ring
 *   r4.x   = float(0.0 >= hg_Params[1].y);           // if outerRadius<=0, disable outer fade
 *   r3.x   = fmax(r3.x, r4.x);
 *   r0.x   = r0.x * r3.x;                            // combined edge alpha
 *   r2.w   = r2.w * r0.x;                            // modulate ramp alpha
 *   r2.xyz = r2.xyz * r2.www;                        // PREMULTIPLY
 *   output.color0 = r2;
 *
 *   Meaning: radial gradient is the NORMALIZED DISTANCE from `center`, remapped
 *   from [innerRadius, outerRadius] → [0,1], quantized to nearest ramp texel and
 *   looked up in the same 1-D LUT. It additionally applies a ½-texel-wide
 *   anti-aliased alpha rolloff at the inner and outer rings (disabled when the
 *   respective radius is ≤ 0). Output is PREMULTIPLIED alpha.
 *   hg_Params slot map:
 *     [0].xyz = center (texCoord space)
 *     [1].x   = innerRadius ; [1].y = outerRadius
 *     [1].z   = ramp texel count ; [1].w = max texel index (clamp)
 *     [2].xy  = LUT atlas offset ; [2].zw = LUT atlas scale
 *
 * ── FINDINGS where this TS impl differs from FCP (Phase-2 TODO): ─────────────
 * FINDING A [Phase-2 TODO]: FCP bakes the color stops into a 1-D LUT TEXTURE and
 *   fetches the NEAREST texel (floor + 0.5, no interpolation between texels).
 *   This TS `sampleGradient` interpolates LINEARLY between adjacent stops instead.
 *   With a fine enough LUT the visual result is close, but hard color-banding /
 *   posterization present in FCP (nearest-texel) is smoothed away here.
 * FINDING B [Phase-2 TODO]: FCP outputs PREMULTIPLIED alpha (rgb *= a). This TS
 *   file writes straight (un-premultiplied) rgb with alpha in the A channel.
 *   Downstream compositing must account for this convention mismatch.
 * FINDING C [Phase-2 TODO]: FCP's linear gradient is the projection onto the
 *   (start→end) point axis normalized by |axis|². This TS `renderGradient` linear
 *   path derives the axis from an `angle` (degrees) and normalizes by a
 *   diagonal-`extent`, not from explicit start/end points as FCP does. The
 *   GradientConfig carries startX/Y & endX/Y but the linear branch ignores them.
 * FINDING D [Phase-2 TODO]: FCP's radial gradient uses BOTH an innerRadius and
 *   outerRadius (t = (d-inner)/(outer-inner)) plus per-ring ½-texel alpha rolloff.
 *   This TS radial path uses a single `radius` (t = d/radius), no inner radius and
 *   no anti-aliased edge alpha.
 */

export interface GradientStop {
  position: number; // 0-1
  r: number; g: number; b: number; a: number; // 0-255 / 0-1 for alpha
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  stops: GradientStop[];
  /** Linear: start/end points (centered coords). Radial: center + radius. */
  startX: number; startY: number;
  endX: number; endY: number;
  angle: number; // linear gradient angle in degrees
}

/** Sample a gradient's color at a normalized position t (0-1). */
function sampleGradient(stops: GradientStop[], t: number): [number, number, number, number] {
  if (stops.length === 0) return [0, 0, 0, 0];
  if (stops.length === 1) return [stops[0].r, stops[0].g, stops[0].b, stops[0].a];

  t = Math.max(0, Math.min(1, t));

  // Find the two stops surrounding t
  for (let i = 0; i < stops.length - 1; i++) {
    const s0 = stops[i], s1 = stops[i + 1];
    if (t >= s0.position && t <= s1.position) {
      const range = s1.position - s0.position;
      const f = range > 0 ? (t - s0.position) / range : 0;
      return [
        s0.r + (s1.r - s0.r) * f,
        s0.g + (s1.g - s0.g) * f,
        s0.b + (s1.b - s0.b) * f,
        s0.a + (s1.a - s0.a) * f,
      ];
    }
  }

  // Beyond last stop
  const last = stops[stops.length - 1];
  return [last.r, last.g, last.b, last.a];
}

/**
 * Render a gradient into an ImageData.
 */
export function renderGradient(config: GradientConfig, width: number, height: number): ImageData {  const out = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
  const { type, stops } = config;

  if (type === 'linear') {
    // Gradient direction from angle
    const rad = config.angle * Math.PI / 180;
    const dx = Math.cos(rad), dy = -Math.sin(rad);
    // Project each pixel onto the gradient axis
    const cx = width / 2, cy = height / 2;
    // Normalize by the diagonal extent
    const extent = Math.abs(dx) * width + Math.abs(dy) * height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const px = x - cx, py = y - cy;
        const proj = (px * dx + py * dy) / extent + 0.5;
        const [r, g, b, a] = sampleGradient(stops, proj);
        const idx = (y * width + x) * 4;
        out.data[idx] = Math.round(r);
        out.data[idx + 1] = Math.round(g);
        out.data[idx + 2] = Math.round(b);
        out.data[idx + 3] = Math.round(a * 255);
      }
    }
  } else {
    // Radial: distance from center
    const cx = width / 2 + config.startX;
    const cy = height / 2 - config.startY;
    const radius = Math.sqrt(width * width + height * height) / 2;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / radius;
        const [r, g, b, a] = sampleGradient(stops, dist);
        const idx = (y * width + x) * 4;
        out.data[idx] = Math.round(r);
        out.data[idx + 1] = Math.round(g);
        out.data[idx + 2] = Math.round(b);
        out.data[idx + 3] = Math.round(a * 255);
      }
    }
  }

  return out;
}

// ============================================================================
// Motion "Gaussian Gradient" generator
// (pluginUUID 96A13FF0-1BBF-11D9-94CD-000A95DF1816)
// ============================================================================
//
// VERBATIM FCP SHADER — HgcCIGaussianGradient (LEN=0x26c), used by
// `PAECIGaussianGradient` (Filters.bundle arm64). Source of truth:
//   const float4 c0 = float4(1.0, -2.0, 3.0, 0.0);
//   r0.xy = texCoord0.xy - hg_Params[0].xy;   // p - center
//   r0.x  = r0.x * hg_Params[0].w;            // scale X by aspect (params[0].w)
//   r0.x  = dot(r0.xy, r0.xy);
//   r0.x  = sqrt(r0.x);                       // d = |p - center| (aspect-corrected)
//   r0.x  = r0.x * hg_Params[0].z;            // d /= radius  (params[0].z = 1/radius)
//   r0.x  = fmin(r0.x, 1.0);                  // clamp normalized distance to 1
//   r0.y  = r0.x * -2.0 + 3.0;                // (3 - 2t)
//   r0.y  = r0.y * r0.x;                      // t·(3 - 2t)
//   r0.x  = r0.y * r0.x;                      // t²·(3 - 2t)  == SMOOTHSTEP(0,1,t)
//   output.color0 = mix(hg_Params[1], hg_Params[2], r0.x);  // lerp color1→color2
//
//   Meaning: FCP's Gaussian Gradient is NOT a true Gaussian bell — the falloff
//   is the classic Hermite SMOOTHSTEP  s = t²(3 − 2t)  of the clamped normalized
//   radial distance t = min(|p−c|/radius, 1). Output = mix(color1, color2, s).
//   hg_Params slot map:
//     [0].xy = center (texCoord space) ; [0].z = 1/radius ; [0].w = X aspect scale
//     [1]    = color1 (at center, t=0) ; [2] = color2 (at/beyond radius, t=1)
//
// FINDING E [Phase-2 TODO]: this TS `renderGaussianGradient` uses a real Gaussian
//   falloff  t = 1 − exp(−K·(d/r)²)  with a fitted K≈4.5. FCP instead uses the
//   analytic SMOOTHSTEP  t²(3−2t)  of the CLAMPED distance (hard cutoff at d=r,
//   flat color2 beyond). The two curves differ in shape (Gaussian has an infinite
//   tail; smoothstep is exactly color2 past the radius). Phase-2 should switch to
//   smoothstep to match FCP exactly and drop GG_FALLOFF_K.
// FINDING F [Phase-2 TODO]: FCP applies an X aspect scale (params[0].w) to the
//   distance so the falloff can be ELLIPTICAL, not strictly circular. This TS impl
//   uses an isotropic (circular) distance only.
// ============================================================================

import type { GaussianGradientConfig } from '../../types.js';

/**
 * Gaussian falloff constant. The Motion generator draws a radial glow whose
 * weight follows a Gaussian bell centred on Center: weight = exp(-K·(d/r)²).
 * At d = radius the weight is exp(-K); K≈4.5 puts the Color-2 mix at ~0.99 by
 * the radius, matching the observed near-full falloff at the ring in FCP GT.
 */
const GG_FALLOFF_K = 4.5;

/**
 * Render the Motion Gaussian Gradient generator to an ImageData at the
 * generator's own canvas resolution (config.width × config.height).
 *
 * Color 1 sits at the Center; the pixel colour is
 *   mix(Color1, Color2, 1 - exp(-K·(d/radius)²))
 * where d is the distance from Center in canvas pixels. Alpha is interpolated
 * the same way so a transparent Color 2 yields a soft glow that fades out.
 */
export function renderGaussianGradient(config: GaussianGradientConfig): ImageData {
  const { width, height, radius, color1, color2, flip } = config;
  const c1 = flip ? color2 : color1;
  const c2 = flip ? color1 : color2;

  // Resolve the centre in canvas pixels. Normalized (absolutePoints=false):
  // (0,0)=top-left, (1,1)=bottom-right. Absolute: pixels from canvas centre,
  // +Y up (Motion convention) → convert to top-left image space.
  let cx: number, cy: number;
  if (config.absolutePoints) {
    cx = width / 2 + config.centerX;
    cy = height / 2 - config.centerY;
  } else {
    cx = config.centerX * width;
    cy = config.centerY * height;
  }

  const r = radius > 0 ? radius : 1;
  const out = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx, dy = y - cy;
      const nd = Math.sqrt(dx * dx + dy * dy) / r;
      // t=0 at centre (Color 1), →1 at/past the radius (Color 2).
      const t = 1 - Math.exp(-GG_FALLOFF_K * nd * nd);
      const idx = (y * width + x) * 4;
      out.data[idx]     = Math.round(c1.r + (c2.r - c1.r) * t);
      out.data[idx + 1] = Math.round(c1.g + (c2.g - c1.g) * t);
      out.data[idx + 2] = Math.round(c1.b + (c2.b - c1.b) * t);
      out.data[idx + 3] = Math.round((c1.a + (c2.a - c1.a) * t) * 255);
    }
  }
  return out;
}
