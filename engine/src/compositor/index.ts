import { gaussianBlur } from './filters/gaussian-blur.js';
import { glowFilter } from './filters/glow.js';
import { levelsFilter, brightnessFilter } from './filters/levels.js';
import { channelMixerFilter, colorizeFilter } from './filters/channel-mixer.js';
import { hueSaturationFilter } from './filters/hue-saturation.js';
import { directionalBlur, radialBlur, zoomBlur } from './filters/directional-blur.js';
import { evaluateCurve } from '../evaluator/curves.js';
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
  imageB: ImageData,
  time: number
): void {
  if (!evalLayer.visible) return;

  const { layer, worldTransform, opacity, crop } = evalLayer;

  if (layer.type === 'image' || layer.type === 'generator') {
    // Leaf layer: render source image with transform
    const src = getSourceImage(layer.source, imageA, imageB);
    if (src) {
      if (layer.filters.length > 0) {
        // Render to temp buffer, apply filters, then composite onto output
        const temp = createBuffer(output.width, output.height);
        blitTransformed(temp, src, worldTransform, 1.0, crop); // full opacity to temp
        let filtered = temp;
        for (const filter of layer.filters) {
          filtered = applyFilter(filtered, filter, evalLayer, time);
        }
        blitDirect(output, filtered, opacity);
      } else {
        blitTransformed(output, src, worldTransform, opacity, crop);
      }
    }
  }

  // Render children (back to front = array order)
  if (evalLayer.children.length > 0) {
    // For groups with filters: render children to a temp buffer, apply filters, then composite
    if (layer.filters.length > 0) {
      const groupBuffer = createBuffer(output.width, output.height);
      for (let i = evalLayer.children.length - 1; i >= 0; i--) {
        renderLayer(groupBuffer, evalLayer.children[i], imageA, imageB, time);
      }
      // Apply filters
      let filtered = groupBuffer;
      for (const filter of layer.filters) {
        filtered = applyFilter(filtered, filter, evalLayer, time);
      }
      // Composite filtered group onto output
      blitDirect(output, filtered, opacity);
    } else {
      for (let i = evalLayer.children.length - 1; i >= 0; i--) {
        renderLayer(output, evalLayer.children[i], imageA, imageB, time);
      }
    }
  }
}

// ============================================================================
// Main composite entry point
// ============================================================================

export function composite(
  scene: EvaluatedScene,  // includes scene.time
  imageA: ImageData,
  imageB: ImageData,
  width: number,
  height: number
): ImageData {
  const output = createBuffer(width, height);

  // Render layers back-to-front (Motion: first in list = top/foreground, last = bottom/background)
  for (let i = scene.layers.length - 1; i >= 0; i--) {
    renderLayer(output, scene.layers[i], imageA, imageB, scene.time);
  }

  return output;
}


/** Apply a filter to an image buffer. */
function applyFilter(input: ImageData, filter: import('../types.js').Filter, evalLayer: EvaluatedLayer, time: number): ImageData {
  const name = filter.pluginName.toLowerCase();
  if (name.includes('gaussian') || name.includes('blur')) {
    // Find the Amount parameter
    let amount = 0;
    for (const p of filter.parameters) {
      if (p.name === 'Amount') {
        if (p.curve) {
          // Evaluate the blur amount at the current time
          amount = evaluateCurve(p.curve, time);
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
  // Directional Blur
  if (name.includes('directional')) {
    let amount = 0, angle = 0;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Amount' || p.name === 'Distance') amount = val;
      if (p.name === 'Angle') angle = val;
    }
    if (amount > 0) return directionalBlur(input, amount, angle);
  }
  // Radial Blur
  if (name.includes('radial')) {
    let amount = 0, cx = 0.5, cy = 0.5;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Amount' || p.name === 'Angle') amount = val;
    }
    if (amount > 0) return radialBlur(input, amount, cx, cy, 'spin');
  }
  // Zoom Blur
  if (name.includes('zoom')) {
    let amount = 0, cx = 0.5, cy = 0.5;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Amount') amount = val;
    }
    if (amount > 0) return zoomBlur(input, amount, cx, cy);
  }
  // Hue/Saturation
  if (name.includes('hsv') || name.includes('hue') || name.includes('saturation')) {
    let hue = 0, saturation = 1, brightness = 0, mix = 1;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Hue' || p.name === 'Hue Rotation') hue = val;
      if (p.name === 'Saturation') saturation = val;
      if (p.name === 'Brightness' || p.name === 'Value') brightness = val;
      if (p.name === 'Mix') mix = val;
    }
    return hueSaturationFilter(input, { hue, saturation, brightness, mix });
  }
  // Channel Mixer
  if (name.includes('channel') && name.includes('mixer')) {
    const matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; // identity
    const offsets = [0,0,0,0];
    let mix = 1, monochrome = false;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      // Map param names to matrix positions
      if (p.name === 'Red - Red') matrix[0] = val;
      if (p.name === 'Red - Green') matrix[1] = val;
      if (p.name === 'Red - Blue') matrix[2] = val;
      if (p.name === 'Green - Red') matrix[4] = val;
      if (p.name === 'Green - Green') matrix[5] = val;
      if (p.name === 'Green - Blue') matrix[6] = val;
      if (p.name === 'Blue - Red') matrix[8] = val;
      if (p.name === 'Blue - Green') matrix[9] = val;
      if (p.name === 'Blue - Blue') matrix[10] = val;
      if (p.name === 'Red Output') offsets[0] = val;
      if (p.name === 'Green Output') offsets[1] = val;
      if (p.name === 'Blue Output') offsets[2] = val;
      if (p.name === 'Mix') mix = val;
      if (p.name === 'Monochrome') monochrome = val > 0;
    }
    return channelMixerFilter(input, { matrix, offsets, mix, monochrome });
  }
  // Colorize
  if (name.includes('colorize') || name.includes('tint')) {
    let hue = 0, saturation = 1, mix = 1;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Remap Black To' || p.name === 'Hue') hue = val;
      if (p.name === 'Saturation' || p.name === 'Intensity') saturation = val;
      if (p.name === 'Mix') mix = val;
    }
    return colorizeFilter(input, hue, saturation, mix);
  }
  // Levels filter
  if (name.includes('level') || name === 'paelevels') {
    let blackIn = 0, whiteIn = 1, gamma = 1, whiteOut = 1, mix = 1;
    for (const p of filter.parameters) {
      const pn = p.name;
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (pn === 'Black In') blackIn = val;
      if (pn === 'White In') whiteIn = val;
      if (pn === 'Gamma') gamma = val;
      if (pn === 'White Out') whiteOut = val;
      if (pn === 'Mix') mix = val;
    }
    return levelsFilter(input, { blackIn, whiteIn, gamma, whiteOut, mix });
  }
  // Brightness filter
  if (name.includes('brightness')) {
    let amount = 0;
    for (const p of filter.parameters) {
      if (p.name === 'Brightness' || p.name === 'Amount') {
        amount = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : 0);
        break;
      }
    }
    return brightnessFilter(input, amount);
  }
  // Glow / Bloom filter
  if (name.includes('glow') || name.includes('bloom')) {
    let radius = 0, threshold = 0, amount = 1;
    for (const p of filter.parameters) {
      if (p.name === 'Radius') {
        amount = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : 0);
        radius = amount; // Radius IS the blur size for glow
      }
      if (p.name === 'Threshold') {
        threshold = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : 0);
      }
    }
    if (radius > 0) {
      return glowFilter(input, { radius, threshold, amount: 1 });
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
