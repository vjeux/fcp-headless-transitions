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

import type { GaussianGradientConfig, LensFlareConfig, LinearGradientConfig } from '../../types.js';
import { evaluateCurve } from '../../evaluator/curves.js';

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


// ============================================================================
// LensFlareGenerator (Transitions/Lights/Lens Flare)
// ============================================================================
// Motion's procedural lens flare, SCREEN-blended (Blend Mode id 203 = 10) over
// the A→B crossfade. RE'd from Lens Flare.motr (see LensFlareConfig). We render an
// RGB glow field on the generator canvas; the layer's blendMode='screen' does the
// compositing. The flare CORE travels the link-driven axis centerStart→centerEnd
// (published "Center Start"/"Center End" controls; verified against GUI-GT: the
// bright core sweeps corner-to-corner, (0,0.99)→(0.99,0.02) in image space, as the
// mean luminance ramps up to a peak at the centre frame then back down).
//
// Appearance = additive sum of three faithful-approximation elements:
//   1. a HOT central core: a Gaussian glow (glowFalloff exponent) — the dominant
//      full-frame wash; its radius/brightness track the Falloff envelope (lower
//      Falloff = tighter+hotter, so brightness peaks mid-transition).
//   2. a radial STAR-BURST: `streakCount` faint rays through the core.
//   3. a concentric HALO RING at ringRadius·(half-diagonal), width ringWidth.
export function renderLensFlare(config: LensFlareConfig, timeSec: number, endSec: number, outW?: number, outH?: number): ImageData {
  // Calibration hook: FCT_FLARE_* env vars let the gate sweep the appearance
  // constants without recompiling. Never set in normal operation (defaults apply).
  const tunable = (name: string, dflt: number): number => {
    if (typeof process !== 'undefined' && process.env?.[name]) {
      const v = parseFloat(process.env[name]!);
      if (!Number.isNaN(v)) return v;
    }
    return dflt;
  };
  const { color, streakColor } = config;
  // Rasterize at the OUTPUT frame size when provided (the flare is full-frame; its
  // authored 1920×1080 canvas is larger than the render frame). Normalized center
  // coords map identically into whatever raster size we use.
  const width = outW && outW > 0 ? outW : config.width;
  const height = outH && outH > 0 ? outH : config.height;
  const out = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);

  const end = endSec > 0 ? endSec : 1;
  const t = Math.min(1, Math.max(0, timeSec / end)); // transition progress 0..1

  // Core centre: interpolate the published endpoints by progress. Motion center is
  // normalized 0-1 with +Y up; image space is +Y down → cy = (1-my)*height.
  const mx = config.centerStart.x + (config.centerEnd.x - config.centerStart.x) * t;
  const my = config.centerStart.y + (config.centerEnd.y - config.centerStart.y) * t;
  const cx = mx * width;
  const cy = (1 - my) * height;

  const halfDiag = 0.5 * Math.sqrt(width * width + height * height);

  // Falloff envelope → master brightness. The Falloff CURVE dips from ~10 (ends)
  // to ~0.71 (middle); LOWER falloff = HOTTER core. Map falloff f∈[~0.7,10] to a
  // 0..1 brightness envelope that peaks (→1) at low falloff and fades (→0) at
  // high falloff. env = clamp((FMAX - f)/(FMAX - FMIN)). Tuned so the core blazes
  // mid-transition and is nearly invisible at the very ends (matches GT).
  const fVal = config.falloff ? evaluateCurve(config.falloff, timeSec) : config.falloffStatic;
  const FMIN = 0.71, FMAX = 10;
  let env = (FMAX - fVal) / (FMAX - FMIN);
  env = Math.min(1, Math.max(0, env));
  // Ease + sharpen the envelope so the bloom peaks near the centre frame and
  // decays faster toward the ends (GT mean luminance is a fairly narrow bell:
  // ~174 at f8, 210 at f12, 165 at f16 — not a wide plateau). smoothstep then a
  // mild gamma>1 narrows the peak.
  env = env * env * (3 - 2 * env);   // smoothstep
  const ENVG = tunable('FCT_FLARE_ENVG', 1.6);
  env = Math.pow(env, ENVG);          // narrow the peak

  // Overall master brightness. `intensity` is the Intensity param (~0.88). The GT
  // mid frame is a bright FULL-FRAME wash (mean ~210), so the flare adds a broad
  // additive term via the Screen blend. Gain lifts the emitted glow into range.
  const GAIN = tunable('FCT_FLARE_GAIN', 1.35);
  const MCAP = tunable('FCT_FLARE_CAP', 1.2);
  const master = Math.min(MCAP, config.intensity * env * GAIN);
  if (master <= 0.001) return out; // fully off at the ends

  // Core glow radius (px). At peak the glow FLOODS the whole frame (GT washes edge
  // to edge); glowFalloff (≈20) controls the radial exponent (smaller = softer).
  const coreRadius = halfDiag * tunable('FCT_FLARE_RAD', 1.7);
  const glowExp = Math.max(1, config.glowFalloff) / tunable('FCT_FLARE_EXPDIV', 13); // ≈1.5 (soft, wide)

  const streakN = Math.max(0, Math.min(64, config.streakCount || 0));
  const streakAmp = config.streakIntensity;

  const ringR = config.ringRadius * halfDiag;
  const ringHalfW = Math.max(2, config.ringWidth * halfDiag * 0.5);

  // A modest broad "veil" wash: at peak the whole frame lifts (GT min ~153). Keep
  // it small enough that the moving CORE still dominates the local brightness.
  const veil = master * 0.30;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 1. Core Gaussian glow (0..1). Normalized distance from core.
      const nd = dist / coreRadius;
      const glow = Math.exp(-glowExp * nd * nd);

      // 2. Star-burst streaks: modulate brightness by angle so `streakN` rays
      //    stand out. Small additive term, strongest near the core.
      let streak = 0;
      if (streakN > 0 && streakAmp > 0 && dist > 1) {
        const ang = Math.atan2(dy, dx);
        const rays = 0.5 + 0.5 * Math.cos(ang * streakN);
        // Rays fade with distance (radial spikes near the core).
        streak = streakAmp * Math.pow(rays, 6) * Math.exp(-2.5 * nd);
      }

      // 3. Halo ring: a thin bright annulus at ringR.
      const rd = (dist - ringR) / ringHalfW;
      const ring = 0.5 * Math.exp(-rd * rd);

      const idx = (y * width + x) * 4;
      // Core + streaks + veil use core colour; ring uses streak colour.
      const gv = master * (glow + streak) + veil * (0.2 + 0.8 * glow);
      const rv = master * ring;
      out.data[idx]     = Math.min(255, gv * color.r + rv * streakColor.r);
      out.data[idx + 1] = Math.min(255, gv * color.g + rv * streakColor.g);
      out.data[idx + 2] = Math.min(255, gv * color.b + rv * streakColor.b);
      out.data[idx + 3] = 255;
    }
  }
  return out;
}

// ============================================================================
// Motion "Gradient" generator — LINEAR variant
// (pluginUUID 40091D89-9517-4344-9CB5-18436B1542D1, pluginName "Gradient")
// ============================================================================
//
// Per the verbatim HgcGradientLinear shader documented at the top of this file,
// the linear gradient at pixel `p` is the SCALAR PROJECTION onto the axis
// `(Start -> End)` normalised by |axis|^2, clamped to [0, 1], then sampled from
// the 1-D color LUT built by the color stops.
//
//   axis  = End - Start                 (canvas-pixel vector)
//   t     = dot(p - Start, axis) / dot(axis, axis)
//   color = LUT( clamp(t, 0, 1) )
//
// Motion authors Start/End in canvas-CENTRED pixels with +Y up. The output image
// uses top-left pixel coordinates with +Y down, so we convert pixel-y to
// canvas-y via `cy = height/2 - y - 0.5` (pixel-centre sample).
//
// Alpha in the LUT is straight (0..1) — we output straight-alpha RGBA so the
// caller's blit path handles premultiplication uniformly.

/**
 * Render Motion's "Gradient" (linear) generator into an ImageData at the
 * generator's own canvas resolution (config.width x config.height). Straight
 * alpha; premultiplication is applied by the compositor blit path.
 */
export function renderLinearGradient(config: LinearGradientConfig): ImageData {
  const { width, height, start, end, stops } = config;
  const out = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);

  // Sort stops by location for the interpolator (parser already does this,
  // but be defensive).
  const S = stops.slice().sort((a, b) => a.location - b.location);
  if (S.length === 0) return out;

  const sample = (t: number): [number, number, number, number] => {
    if (t <= S[0].location) return [S[0].r, S[0].g, S[0].b, S[0].a];
    const last = S[S.length - 1];
    if (t >= last.location) return [last.r, last.g, last.b, last.a];
    for (let i = 0; i < S.length - 1; i++) {
      const s0 = S[i], s1 = S[i + 1];
      if (t >= s0.location && t <= s1.location) {
        const range = s1.location - s0.location;
        const f = range > 0 ? (t - s0.location) / range : 0;
        return [
          s0.r + (s1.r - s0.r) * f,
          s0.g + (s1.g - s0.g) * f,
          s0.b + (s1.b - s0.b) * f,
          s0.a + (s1.a - s0.a) * f,
        ];
      }
    }
    return [last.r, last.g, last.b, last.a];
  };

  const axisX = end.x - start.x;
  const axisY = end.y - start.y;
  const axisLen2 = axisX * axisX + axisY * axisY;
  if (axisLen2 <= 0) {
    // Degenerate axis: fill with the first stop (matches the LUT clamp result).
    const [r, g, b, a] = sample(0);
    for (let i = 0; i < out.data.length; i += 4) {
      out.data[i] = Math.round(r); out.data[i + 1] = Math.round(g);
      out.data[i + 2] = Math.round(b); out.data[i + 3] = Math.round(a * 255);
    }
    return out;
  }

  const hw = width / 2, hh = height / 2;
  for (let y = 0; y < height; y++) {
    // Motion canvas Y is +up, origin at canvas centre; pixel Y is +down from
    // the top. Sample at pixel centres.
    const cy = hh - (y + 0.5);
    for (let x = 0; x < width; x++) {
      const cx = (x + 0.5) - hw;
      const dx = cx - start.x;
      const dy = cy - start.y;
      let t = (dx * axisX + dy * axisY) / axisLen2;
      if (t < 0) t = 0; else if (t > 1) t = 1;
      const [r, g, b, a] = sample(t);
      const idx = (y * width + x) * 4;
      out.data[idx] = Math.round(r);
      out.data[idx + 1] = Math.round(g);
      out.data[idx + 2] = Math.round(b);
      out.data[idx + 3] = Math.round(a * 255);
    }
  }
  return out;
}
