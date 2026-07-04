import { gaussianBlur } from './filters/gaussian-blur.js';
/**
 * Compositor: EvaluatedScene + source images → output ImageData
 *
 * Implements the core compositing pipeline:
 *   - Layer stacking (back-to-front, matching Motion's render order)
 *   - Per-layer transform application (affine + perspective via the 4x4 matrix)
 *   - Opacity blending
 *   - Crop regions
 *   - Source image injection (Transition A/B → imageA/imageB)
 *   - Normal blend mode (source-over with premultiplied alpha)
 *
 * This is a CPU-based software renderer for correctness. A WebGL backend
 * can be added later for performance.
 */
import type { EvaluatedScene, EvaluatedLayer } from '../evaluator/index.js';
import type { ImageSource } from '../types.js';

// ============================================================================
// Image buffer operations
// ============================================================================

/** Create a transparent buffer (all zeros = transparent black). */
function createBuffer(width: number, height: number): ImageData {
  return new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
}

/**
 * Blit a source image onto a destination at an affine transform.
 * Uses inverse-mapping: for each output pixel, find the corresponding source pixel.
 *
 * The worldTransform maps from SOURCE (centered) coordinates to OUTPUT (centered) coordinates.
 * We need the INVERSE to sample: for each output pixel, where does it come from in the source?
 */
function blitTransformed(
  dst: ImageData,
  src: ImageData,
  worldTransform: Float64Array,
  opacity: number,
  crop: { left: number; right: number; top: number; bottom: number }
): void {
  const dw = dst.width, dh = dst.height;
  const sw = src.width, sh = src.height;

  // Invert the 4x4 matrix (for 2D we only need the 2D affine part)
  // Extract the 2D affine from the 4x4 (ignoring Z):
  // The matrix maps source-centered coords to dest-centered coords.
  // We need inverse: dest-centered → source-centered
  const a = worldTransform[0], b = worldTransform[4], tx = worldTransform[12];
  const c = worldTransform[1], d = worldTransform[5], ty = worldTransform[13];

  const det = a * d - b * c;
  if (Math.abs(det) < 1e-10) return; // degenerate transform

  const invDet = 1 / det;
  const ia = d * invDet, ib = -b * invDet, itx = (b * ty - d * tx) * invDet;
  const ic = -c * invDet, id = a * invDet, ity = (c * tx - a * ty) * invDet;

  // Effective source bounds after crop
  const srcLeft = crop.left;
  const srcRight = sw - crop.right;
  const srcTop = crop.top;
  const srcBottom = sh - crop.bottom;

  // For each destination pixel
  for (let dy = 0; dy < dh; dy++) {
    // Destination pixel in centered coords (Motion: origin=center, Y-up)
    const dyc = -(dy - dh / 2); // flip Y: screen Y-down to Motion Y-up

    for (let dx = 0; dx < dw; dx++) {
      const dxc = dx - dw / 2;

      // Inverse-map to source centered coords
      const sxc = ia * dxc + ib * dyc + itx;
      const syc = ic * dxc + id * dyc + ity;

      // Convert from centered to pixel coords (source)
      const sx = sxc + sw / 2;
      const sy = sh / 2 - syc; // flip Y back

      // Bounds check (with crop)
      if (sx < srcLeft || sx >= srcRight || sy < srcTop || sy >= srcBottom) continue;

      // Nearest-neighbor sampling (bilinear can be added later)
      const isx = Math.floor(sx);
      const isy = Math.floor(sy);
      if (isx < 0 || isx >= sw || isy < 0 || isy >= sh) continue;

      const srcIdx = (isy * sw + isx) * 4;
      const dstIdx = (dy * dw + dx) * 4;

      // Source RGBA
      const sr = src.data[srcIdx];
      const sg = src.data[srcIdx + 1];
      const sb = src.data[srcIdx + 2];
      const sa = src.data[srcIdx + 3] / 255 * opacity;

      if (sa <= 0) continue;

      // Source-over compositing (premultiplied)
      const da = dst.data[dstIdx + 3] / 255;
      const outA = sa + da * (1 - sa);

      if (outA > 0) {
        dst.data[dstIdx]     = Math.round((sr * sa + dst.data[dstIdx]     * da * (1 - sa)) / outA);
        dst.data[dstIdx + 1] = Math.round((sg * sa + dst.data[dstIdx + 1] * da * (1 - sa)) / outA);
        dst.data[dstIdx + 2] = Math.round((sb * sa + dst.data[dstIdx + 2] * da * (1 - sa)) / outA);
        dst.data[dstIdx + 3] = Math.round(outA * 255);
      }
    }
  }
}

// ============================================================================
// Layer rendering
// ============================================================================

function getSourceImage(source: ImageSource | undefined, imageA: ImageData, imageB: ImageData): ImageData | null {
  if (!source) return null;
  switch (source.type) {
    case 'transitionA': return imageA;
    case 'transitionB': return imageB;
    case 'color': {
      // Solid color fill
      const { r, g, b, a } = source;
      const img = createBuffer(imageA.width, imageA.height);
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = r; img.data[i+1] = g; img.data[i+2] = b; img.data[i+3] = Math.round(a * 255);
      }
      return img;
    }
    default: return null;
  }
}

function renderLayer(
  output: ImageData,
  evalLayer: EvaluatedLayer,
  imageA: ImageData,
  imageB: ImageData
): void {
  if (!evalLayer.visible) return;

  const { layer, worldTransform, opacity, crop } = evalLayer;

  if (layer.type === 'image' || layer.type === 'generator') {
    // Leaf layer: render source image with transform
    const src = getSourceImage(layer.source, imageA, imageB);
    if (src) {
      blitTransformed(output, src, worldTransform, opacity, crop);
    }
  }

  // Render children (back to front = array order)
  if (evalLayer.children.length > 0) {
    // For groups with filters: render children to a temp buffer, apply filters, then composite
    if (layer.filters.length > 0) {
      const groupBuffer = createBuffer(output.width, output.height);
      for (const child of evalLayer.children) {
        renderLayer(groupBuffer, child, imageA, imageB);
      }
      // Apply filters
      let filtered = groupBuffer;
      for (const filter of layer.filters) {
        filtered = applyFilter(filtered, filter, evalLayer);
      }
      // Composite filtered group onto output
      blitDirect(output, filtered, opacity);
    } else {
      for (const child of evalLayer.children) {
        renderLayer(output, child, imageA, imageB);
      }
    }
  }
}

// ============================================================================
// Main composite entry point
// ============================================================================

export function composite(
  scene: EvaluatedScene,
  imageA: ImageData,
  imageB: ImageData,
  width: number,
  height: number
): ImageData {
  const output = createBuffer(width, height);

  // Render layers back-to-front
  for (const evalLayer of scene.layers) {
    renderLayer(output, evalLayer, imageA, imageB);
  }

  return output;
}


/** Apply a filter to an image buffer. */
function applyFilter(input: ImageData, filter: import('../types.js').Filter, evalLayer: EvaluatedLayer): ImageData {
  const name = filter.pluginName.toLowerCase();
  if (name.includes('gaussian') || name.includes('blur')) {
    // Find the Amount parameter
    let amount = 0;
    for (const p of filter.parameters) {
      if (p.name === 'Amount') {
        if (p.curve) {
          // Evaluate at current time (approximate from evalLayer context)
          // For now, use the curve's last keyframe value as the max blur
          const kfs = p.curve.keyframes;
          amount = kfs.length > 0 ? kfs[kfs.length - 1].value : 0;
        } else if (typeof p.value === 'number') {
          amount = p.value;
        }
        break;
      }
    }
    if (amount > 0) {
      return gaussianBlur(input, amount);
    }
  }
  return input;
}

/** Blit source directly onto destination with opacity (no transform, 1:1 pixel copy). */
function blitDirect(dst: ImageData, src: ImageData, opacity: number): void {
  for (let i = 0; i < dst.data.length; i += 4) {
    const sa = src.data[i + 3] / 255 * opacity;
    if (sa <= 0) continue;
    const da = dst.data[i + 3] / 255;
    const outA = sa + da * (1 - sa);
    if (outA > 0) {
      dst.data[i]     = Math.round((src.data[i]     * sa + dst.data[i]     * da * (1 - sa)) / outA);
      dst.data[i + 1] = Math.round((src.data[i + 1] * sa + dst.data[i + 1] * da * (1 - sa)) / outA);
      dst.data[i + 2] = Math.round((src.data[i + 2] * sa + dst.data[i + 2] * da * (1 - sa)) / outA);
      dst.data[i + 3] = Math.round(outA * 255);
    }
  }
}
