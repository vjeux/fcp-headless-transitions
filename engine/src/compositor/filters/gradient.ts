/**
 * Gradient generator.
 *
 * Fills a region with a color gradient (linear or radial).
 * Used by ~8 transitions for background fills, light sweeps, and overlays.
 *
 * A gradient has color stops (position 0-1 → RGBA color). Between stops,
 * colors interpolate linearly.
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
export function renderGradient(config: GradientConfig, width: number, height: number): ImageData {
  const out = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
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
