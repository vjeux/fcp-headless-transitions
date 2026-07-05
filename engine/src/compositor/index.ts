import { gaussianBlur } from './filters/gaussian-blur.js';
import { glowFilter } from './filters/glow.js';
import { levelsFilter, brightnessFilter } from './filters/levels.js';
import { channelMixerFilter, colorizeFilter, tintFilter } from './filters/channel-mixer.js';
import { hueSaturationFilter } from './filters/hue-saturation.js';
import { directionalBlur, radialBlur, zoomBlur } from './filters/directional-blur.js';
import { lumaKeyerFilter } from './filters/luma-keyer.js';
import { bevelFilter } from './filters/bevel.js';
import { evaluateCurve } from '../evaluator/curves.js';
import { rasterizeShape, applyMask, unionMasks } from './shapes.js';
import { needsPerspective, projectQuad, renderPerspectiveQuad } from './perspective.js';
import { blendChannel, isSeparable, luma } from './blend.js';
import type { BlendMode } from '../types.js';
import { generateInstances } from './replicator.js';
import { lookupFilter, makeContext } from './filters/registry.js';
import './filters/index.js'; // side-effect: registers all UUID-keyed filter modules

/** Offset a transform matrix's translation by (dx, dy). */
function mat4MultiplyOffset(m: Float64Array, dx: number, dy: number): Float64Array {
  const r = new Float64Array(m);
  r[12] += dx;
  r[13] += dy;
  return r;
}
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
import type { ImageSource, Layer } from '../types.js';

/**
 * Render context set per composite() call. Holds the object-ID map so clone
 * layers can resolve the image of the object they mirror.
 */
interface RenderContext {
  layerById: Map<number, Layer>;
  imageA: ImageData;
  imageB: ImageData;
  /**
   * Camera framing distance for 3D perspective projection. When the scene has a
   * Camera node, this is (frameHeight/2)/tan(AOV/2) so content at Z=0 renders 1:1
   * and layers with world-Z get perspective foreshortening. Falls back to the
   * legacy default (2000) when no camera is present.
   */
  cameraZ: number;
}
let ctx: RenderContext | null = null;

/**
 * Resolve the source image a Clone Layer mirrors. Follows cloneSourceId to the
 * referenced Layer; if that layer is itself a clone/image of Transition A or B,
 * resolves transitively to the underlying source pixels.
 */
function resolveCloneImage(cloneSourceId: number | undefined, depth = 0): ImageData | null {
  if (cloneSourceId === undefined || !ctx || depth > 8) return null;
  const src = ctx.layerById.get(cloneSourceId);
  if (!src) return null;
  if (src.source?.type === 'transitionA') return ctx.imageA;
  if (src.source?.type === 'transitionB') return ctx.imageB;
  if (src.type === 'clone') return resolveCloneImage(src.cloneSourceId, depth + 1);
  // Image/generator source without an explicit A/B tag: fall back to its source.
  if (src.source) return getSourceImage(src.source, ctx.imageA, ctx.imageB);
  return null;
}


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
  crop: { left: number; right: number; top: number; bottom: number },
  blendMode: BlendMode = 'normal'
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
    // Ozone/.motr internal space is Y-DOWN (screen_y = center + motionY): a clone
    // at Motion Y=-1080 renders at the TOP edge, and a +Y position translates
    // content downward. This was verified against the real engine's Push render
    // (B enters from top, A exits the bottom). So dest-centered Y matches screen Y.
    const dyc = dy - dh / 2;

    for (let dx = 0; dx < dw; dx++) {
      const dxc = dx - dw / 2;

      // Inverse-map to source centered coords
      const sxc = ia * dxc + ib * dyc + itx;
      const syc = ic * dxc + id * dyc + ity;

      // Convert from centered to pixel coords (source), Y-down.
      const sx = sxc + sw / 2;
      const sy = syc + sh / 2;

      // Bounds check (with crop)
      if (sx < srcLeft || sx >= srcRight || sy < srcTop || sy >= srcBottom) continue;

      // Bilinear sampling for smooth scaling/rotation
      const fx = sx - Math.floor(sx);
      const fy = sy - Math.floor(sy);
      const x0 = Math.floor(sx), y0 = Math.floor(sy);
      const x1 = Math.min(x0 + 1, sw - 1), y1 = Math.min(y0 + 1, sh - 1);
      if (x0 < 0 || x0 >= sw || y0 < 0 || y0 >= sh) continue;
      const cx0 = Math.max(0, x0), cy0 = Math.max(0, y0);

      const i00 = (cy0 * sw + cx0) * 4;
      const i10 = (cy0 * sw + x1) * 4;
      const i01 = (y1 * sw + cx0) * 4;
      const i11 = (y1 * sw + x1) * 4;

      const lerp2 = (a: number, b: number, c: number, d: number) =>
        (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;

      const sr = lerp2(src.data[i00], src.data[i10], src.data[i01], src.data[i11]);
      const sg = lerp2(src.data[i00+1], src.data[i10+1], src.data[i01+1], src.data[i11+1]);
      const sb = lerp2(src.data[i00+2], src.data[i10+2], src.data[i01+2], src.data[i11+2]);
      const srcAlpha = lerp2(src.data[i00+3], src.data[i10+3], src.data[i01+3], src.data[i11+3]);
      const sa = srcAlpha / 255 * opacity;

      const dstIdx = (dy * dw + dx) * 4;

      if (sa <= 0) continue;

      compositePixel(dst.data, dstIdx, sr, sg, sb, sa, blendMode);
    }
  }
}

/**
 * Composite one source pixel (straight color sr/sg/sb in [0..255], premultiplied
 * coverage `sa` in [0..1]) onto the destination buffer at byte offset `di`,
 * honoring the given blend mode. Destination is straight color with alpha.
 *
 *   Separable modes use the W3C blending equation:
 *     Co = αs·(1−αb)·Cs + αs·αb·B(Cb,Cs) + (1−αs)·αb·Cb
 *   Stencil/Silhouette modes MODULATE the destination's alpha by the source's
 *   coverage/luma (they do not add color); Combine falls back to source-over.
 */
export function compositePixel(
  data: Uint8ClampedArray | Uint8Array,
  di: number,
  sr: number, sg: number, sb: number,
  sa: number,
  mode: BlendMode
): void {
  const db = data[di + 3] / 255;

  // --- Stencil / Silhouette: modulate destination alpha, no color contribution.
  //   Stencil  = keep dst where source is present   (dstA *= sourceCoverage)
  //   Silhouette = cut dst where source is present   (dstA *= 1 - sourceCoverage)
  //   *_ALPHA uses the source alpha; *_LUMA uses the source luma.
  if (mode === 'stencilAlpha' || mode === 'stencilLuma' ||
      mode === 'silhouetteAlpha' || mode === 'silhouetteLuma') {
    let key: number;
    if (mode === 'stencilAlpha' || mode === 'silhouetteAlpha') {
      key = sa; // premultiplied coverage already folds in opacity
    } else {
      // luma of the straight source color, scaled by coverage
      key = (luma(sr, sg, sb) / 255) * sa;
    }
    const isSilhouette = mode === 'silhouetteAlpha' || mode === 'silhouetteLuma';
    const factor = isSilhouette ? (1 - key) : key;
    const outA = db * factor;
    data[di + 3] = Math.round(outA * 255);
    return;
  }

  if (mode !== 'normal' && isSeparable(mode)) {
    const outA = sa + db * (1 - sa);
    if (outA <= 0) return;
    for (let c = 0; c < 3; c++) {
      const cb = data[di + c];
      const cs = c === 0 ? sr : c === 1 ? sg : sb;
      const blended = blendChannel(mode, cb, cs);
      const co = sa * (1 - db) * cs + sa * db * blended + (1 - sa) * db * cb;
      data[di + c] = Math.round(co / outA);
    }
    data[di + 3] = Math.round(outA * 255);
    return;
  }

  // Normal (and 'combine'/unimplemented non-separable) → source-over.
  const outA = sa + db * (1 - sa);
  if (outA <= 0) return;
  data[di]     = Math.round((sr * sa + data[di]     * db * (1 - sa)) / outA);
  data[di + 1] = Math.round((sg * sa + data[di + 1] * db * (1 - sa)) / outA);
  data[di + 2] = Math.round((sb * sa + data[di + 2] * db * (1 - sa)) / outA);
  data[di + 3] = Math.round(outA * 255);
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
  time: number,
  filterOverrides: Map<number, Map<string, number>>
): void {
  if (!evalLayer.visible) return;

  const { layer, worldTransform, opacity, crop } = evalLayer;

  // Replicator: render the cell content at each grid instance
  if (layer.type === 'replicator' && layer.replicator) {
    const instances = generateInstances(layer.replicator);
    for (const inst of instances) {
      // Offset the world transform by the instance position
      const instTransform = new Float64Array(worldTransform);
      instTransform[12] += inst.x;
      instTransform[13] += inst.y;
      // Render each child (cell) at this instance
      for (let i = evalLayer.children.length - 1; i >= 0; i--) {
        const cell = evalLayer.children[i];
        // Build a temp evaluated layer with the instance-offset transform
        const instCell: EvaluatedLayer = {
          ...cell,
          worldTransform: mat4MultiplyOffset(cell.worldTransform, inst.x, inst.y),
        };
        renderLayer(output, instCell, imageA, imageB, time, filterOverrides);
      }
    }
    return;
  }

  if (layer.type === 'clone') {
    // Clone Layer: draw the image of the object it mirrors, at this layer's transform.
    let src = resolveCloneImage(layer.cloneSourceId);
    if (src) {
      // A clone may carry its OWN filters (e.g. Color Planes stacks 6 clones of the
      // same source, each with a Channel Mixer isolating one R/G/B channel, then
      // additively blends them at different Z depths for the chromatic-split look).
      // These per-pixel color filters must be applied to the cloned image BEFORE it
      // is projected/blitted — otherwise every clone renders the full-color source
      // and the additive stack blows out (too bright) or collapses (too dark).
      if (layer.filters.length > 0) {
        for (const filter of layer.filters) {
          src = applyFilter(src, filter, evalLayer, time, filterOverrides.get(filter.id));
        }
      }
      if (needsPerspective(worldTransform)) {
        const corners = projectQuad(worldTransform, src.width, src.height, ctx?.cameraZ ?? 2000);
        renderPerspectiveQuad(output, src, corners, opacity, layer.blendMode);
      } else {
        blitTransformed(output, src, worldTransform, opacity, crop, layer.blendMode);
      }
    }
    // A clone may also have children (rare); fall through to render them.
  }

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
          filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id));
        }
        blitDirect(output, filtered, opacity, layer.blendMode);
      } else if (needsPerspective(worldTransform)) {
        // 3D perspective: project the source quad and rasterize
        const corners = projectQuad(worldTransform, src.width, src.height, ctx?.cameraZ ?? 2000);
        renderPerspectiveQuad(output, src, corners, opacity);
      } else {
        blitTransformed(output, src, worldTransform, opacity, crop, layer.blendMode);
      }
    }
  }

  // Render children (back to front = array order)
  if (evalLayer.children.length > 0) {
    // Separate mask shapes from visible children
    const maskShapes: EvaluatedLayer[] = [];
    const visibleChildren: EvaluatedLayer[] = [];
    for (const child of evalLayer.children) {
      if (child.layer.type === 'shape' && child.layer.shape?.isMask) {
        maskShapes.push(child);
      } else {
        visibleChildren.push(child);
      }
    }

    const hasFilters = layer.filters.length > 0;
    const hasMasks = maskShapes.length > 0;
    const hasBlend = layer.blendMode !== 'normal';

    if (hasFilters || hasMasks || hasBlend) {
      // Render visible children to a temp buffer
      const groupBuffer = createBuffer(output.width, output.height);
      for (let i = visibleChildren.length - 1; i >= 0; i--) {
        renderLayer(groupBuffer, visibleChildren[i], imageA, imageB, time, filterOverrides);
      }

      // Apply masks (rasterize shapes, union them, apply to group content)
      if (hasMasks) {
        const masks = maskShapes
          .filter(m => m.visible && m.layer.shape)
          .map(m => rasterizeShape(m.layer.shape!, output.width, output.height, m.worldTransform));
        if (masks.length > 0) {
          const combined = masks.length === 1 ? masks[0] : unionMasks(masks, output.width, output.height);
          applyMask(groupBuffer, combined);
        }
      }

      // Apply filters
      let processed = groupBuffer;
      for (const filter of layer.filters) {
        processed = applyFilter(processed, filter, evalLayer, time, filterOverrides.get(filter.id));
      }

      // Composite onto output
      blitDirect(output, processed, opacity, layer.blendMode);
    } else {
      for (let i = visibleChildren.length - 1; i >= 0; i--) {
        renderLayer(output, visibleChildren[i], imageA, imageB, time, filterOverrides);
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

  // Set the render context so clone layers can resolve their mirrored image.
  // Use the scene's resolved camera framing distance when present (3D perspective
  // driven by the Camera node's Angle Of View); otherwise the legacy default.
  ctx = { layerById: scene.layerById, imageA, imageB, cameraZ: scene.camera?.distance ?? 2000 };

  // Render layers back-to-front (Motion: first in list = top/foreground, last = bottom/background)
  for (let i = scene.layers.length - 1; i >= 0; i--) {
    renderLayer(output, scene.layers[i], imageA, imageB, scene.time, scene.filterOverrides);
  }

  ctx = null;
  return output;
}


/** Apply a filter to an image buffer. */
function applyFilter(input: ImageData, filter: import('../types.js').Filter, evalLayer: EvaluatedLayer, time: number, overrides?: Map<string, number>): ImageData {
  const name = filter.pluginName.toLowerCase();

  // Skip on-screen-control (OSC) preview filters — they're editor UI, not rendered output.
  if (name.includes('for osc') || name.includes('(osc)') || name.endsWith(' osc')) {
    return input;
  }

  // Registry first (UUID-keyed, self-registering modules — the extensible path
  // that lets filters be added without touching this dispatch). Falls through to
  // the legacy name-matched chain below for filters not yet migrated.
  {
    const mod = lookupFilter(filter);
    if (mod) {
      const ctx = makeContext(filter, time, input.width, input.height, overrides);
      return mod.apply(input, ctx);
    }
  }

  // Resolve a filter parameter, preferring a rig override if present.
  const resolveParam = (paramName: string, fallback: number): number => {
    if (overrides && overrides.has(paramName)) return overrides.get(paramName)!;
    for (const p of filter.parameters) {
      if (p.name === paramName) {
        if (p.curve) return evaluateCurve(p.curve, time);
        if (typeof p.value === 'number') return p.value;
      }
    }
    return fallback;
  };
  if (name.includes('gaussian') || (name.includes('blur') && !name.includes('directional') && !name.includes('radial') && !name.includes('zoom'))) {
    const amount = resolveParam('Amount', 0);
    if (amount > 0) {
      return gaussianBlur(input, amount);
    }
    return input;
  }
  // Bevel
  if (name.includes('bevel')) {
    let width = 0, lightAngle = 135, opacity = 1, mix = 1;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Bevel Width') width = val;
      if (p.name === 'Light Angle') lightAngle = val;
      if (p.name === 'Opacity') opacity = val;
      if (p.name === 'Mix') mix = val;
    }
    if (width > 0) return bevelFilter(input, { width, lightAngle, opacity, mix });
    return input;
  }
  // Luma Keyer
  if (name.includes('luma') && name.includes('key')) {
    let luma = 0.5, rolloff = 0.1, strength = 1;
    let invert = false;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Luma') luma = val;
      if (p.name === 'Luma Rolloff' || p.name === 'DefaultSoftness') rolloff = val;
      if (p.name === 'Strength') strength = val;
      if (p.name === 'Invert') invert = val > 0;
    }
    return lumaKeyerFilter(input, { luma, rolloff, strength, invert });
  }
  // Directional Blur
  if (name.includes('directional')) {
    const amount = resolveParam('Amount', resolveParam('Distance', 0));
    const angle = resolveParam('Angle', 0);
    if (amount > 0) return directionalBlur(input, amount, angle);
    return input;
  }
  // Radial Blur
  if (name.includes('radial')) {
    const amount = resolveParam('Amount', resolveParam('Angle', 0));
    if (amount > 0) return radialBlur(input, amount, 0.5, 0.5, 'spin');
    return input;
  }
  // Zoom Blur
  if (name.includes('zoom')) {
    const amount = resolveParam('Amount', 0);
    if (amount > 0) return zoomBlur(input, amount, 0.5, 0.5);
    return input;
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
  // Tint (PAETint / TintFx)
  if (name.includes('tint')) {
    let r = 1, g = 1, b = 1, intensity = 1, mix = 1;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Red') r = val;
      if (p.name === 'Green') g = val;
      if (p.name === 'Blue') b = val;
      if (p.name === 'Intensity') intensity = val;
      if (p.name === 'Mix') mix = val;
    }
    return tintFilter(input, r, g, b, intensity, mix);
  }
  // Colorize
  if (name.includes('colorize')) {
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
  // Glow filter (PAEGlow): Radius (blur), Threshold, Opacity (intensity, can be >1)
  if (name.includes('glow')) {
    let radius = 0, threshold = 0, intensity = 1;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Radius') radius = val;
      if (p.name === 'Threshold') threshold = val;
      if (p.name === 'Opacity' || p.name === 'Intensity') intensity = val;
    }
    if (radius > 0 && intensity > 0) {
      return glowFilter(input, { radius, threshold, amount: intensity });
    }
    return input;
  }
  // Bloom filter (PAEBloom): Amount (blur spread), Brightness (intensity boost), Threshold
  if (name.includes('bloom')) {
    let amount = 0, brightness = 1, threshold = 0;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Amount') amount = val;
      if (p.name === 'Brightness') brightness = val;
      if (p.name === 'Threshold') threshold = val;
    }
    if (amount > 0 && brightness > 0) {
      // Bloom: brighten above threshold, blur, screen-add. Brightness is 0-100 (÷ scale).
      // Threshold here is 0-100 (÷100 to normalize).
      return glowFilter(input, { radius: amount, threshold: threshold / 100, amount: brightness / 100 });
    }
    return input;
  }
  return input;
}

/** Blit source directly onto destination with opacity (no transform, 1:1 pixel copy). */
function blitDirect(dst: ImageData, src: ImageData, opacity: number, blendMode: BlendMode = 'normal'): void {
  for (let i = 0; i < dst.data.length; i += 4) {
    const sa = src.data[i + 3] / 255 * opacity;
    if (sa <= 0) {
      // Silhouette/Stencil with no source coverage still affect dst alpha
      // (stencil with 0 coverage erases dst); handle via compositePixel only
      // when a masking mode is active and there IS backdrop to modify.
      if ((blendMode === 'stencilAlpha' || blendMode === 'stencilLuma') && dst.data[i + 3] > 0) {
        dst.data[i + 3] = 0; // stencil: no source → erase backdrop
      }
      continue;
    }
    compositePixel(dst.data, i, src.data[i], src.data[i + 1], src.data[i + 2], sa, blendMode);
  }
}
