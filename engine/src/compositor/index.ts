/**
 * Compositor: EvaluatedScene + source images → output ImageData
 *
 * Implements:
 *   - Layer stacking with blend modes
 *   - Affine + perspective transforms (CSS-like transform-origin)
 *   - Crop regions
 *   - Opacity
 *   - Filters (blur, color adjust, etc.)
 *   - Masks (alpha and luminance)
 *   - Replicators (clone grids/patterns)
 */
import type { EvaluatedScene, EvaluatedLayer } from '../evaluator/index.js';

export function composite(
  scene: EvaluatedScene,
  imageA: ImageData,
  imageB: ImageData,
  width: number,
  height: number
): ImageData {
  // TODO: implement full compositor
  // For now, return a simple crossfade as placeholder
  const out = new ImageData(width, height);
  const progress = scene.time / 2.002; // normalize to 0-1 based on scene duration
  const t = Math.max(0, Math.min(1, progress));
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i]   = Math.round(imageA.data[i]   * (1 - t) + imageB.data[i]   * t);
    out.data[i+1] = Math.round(imageA.data[i+1] * (1 - t) + imageB.data[i+1] * t);
    out.data[i+2] = Math.round(imageA.data[i+2] * (1 - t) + imageB.data[i+2] * t);
    out.data[i+3] = 255;
  }
  return out;
}
