// Capability probes — structural predicates over a parsed scene (ROADMAP item 6).
//
// Each answers a yes/no question about the scene from node/filter/behavior TYPES,
// never from a transition NAME or a ground-truth constant. They gate generic engine
// behavior (motion blur, retime-wrap cancellation, stroked-mask clamp). Because they
// key off structure, each fires on a real FAMILY of transitions — enforced by
// test/no-hardcode.test.ts (a probe firing on < 2 of the 65 built-ins is a
// per-transition hardcode and fails the build).
import type { MotrScene, Layer } from './types.js';

function walk(layers: readonly Layer[], visit: (l: Layer) => void): void {
  for (const l of layers) { visit(l); walk(l.children, visit); }
}

/**
 * A COLORIZE filter rig-driven by a "Color" accent widget through a "remap" behavior.
 * This structural signature marks the decorative-tile "Slide" family (Slide, Diagonal,
 * Glide, Up/Over, Close & Open). It gates the motion-blur pass. MUST require the rigged
 * filter to be a COLORIZE — a "Color" widget can rig other filters (Light Sweep drives a
 * glow), and enabling the tile motion-blur there regressed it (44->15 dB).
 */
export function hasColorizeRemapRig(scene: MotrScene): boolean {
  const colorWidgetIds = new Set<number>();
  for (const w of scene.rigWidgets) if ((w.name || '').toLowerCase() === 'color') colorWidgetIds.add(w.id);
  if (colorWidgetIds.size === 0) return false;
  const colorizeIds = new Set<number>();
  walk(scene.layers, (l) => {
    for (const f of l.filters) {
      const pn = (f.pluginName || '').toLowerCase();
      const nm = (f.name || '').toLowerCase();
      if (pn.includes('colorize') || nm.includes('colorize')) colorizeIds.add(f.id);
    }
  });
  for (const b of scene.rigBehaviors) {
    if (colorizeIds.has(b.affectedObjectId) && colorWidgetIds.has(b.widgetId)
        && (b.paramType || '').toLowerCase().includes('remap')) return true;
  }
  return false;
}

/**
 * A non-mask solid-fill SHAPE overlay (Lights/Flash's white flash rectangles). Such an
 * overlay animates past the drop-zone retime-wrap, so freezing the scene to frame 0
 * would kill it — its presence cancels the wrap.
 */
export function hasFilledShapeOverlay(scene: MotrScene): boolean {
  let found = false;
  walk(scene.layers, (l) => {
    if (l.type === 'shape' && l.shape && !l.shape.isMask && (l.shape.fillColor || l.shape.isSolidPanel)) found = true;
  });
  return found;
}

/**
 * A STROKED shape anywhere in the scene (Objects/Arrows' arrow arcs, whose animated
 * trim grows to full coverage). Marks a stroked-mask reveal whose END state (full B)
 * must persist — the tail frames CLAMP just under the drop-zone timeout instead of
 * wrapping back to A.
 */
export function hasStrokedMaskShape(scene: MotrScene): boolean {
  let found = false;
  walk(scene.layers, (l) => { if (l.type === 'shape' && l.shape && l.shape.stroke) found = true; });
  return found;
}

/**
 * A layer whose Image Mask source is a Replicator (Replicator-Clones/Duplicate's
 * growing-cell matte). That growing-dots reveal IS the whole transition; its end state
 * (full B) must persist, so its presence cancels the wrap.
 */
export function hasReplicatorMaskReveal(scene: MotrScene): boolean {
  const replicatorIds = new Set<number>();
  walk(scene.layers, (l) => { if (l.type === 'replicator') replicatorIds.add(l.id); });
  if (replicatorIds.size === 0) return false;
  let found = false;
  walk(scene.layers, (l) => {
    if (l.imageMaskSourceId !== undefined && replicatorIds.has(l.imageMaskSourceId)) found = true;
  });
  return found;
}

/**
 * WIDE EQUIRECT (360°/VR panorama, e.g. 4096×2048): FCP reads back a centred
 * output-sized window (front-facing view) rather than squeezing the 2:1 panorama into
 * 16:9. Dimension-driven; matches oz_render.mm's `sb.w >= 3072` readback ROI.
 */
export function isWideEquirect(width: number, height: number): boolean {
  return width >= 3072 && width >= 1.6 * height;
}

/**
 * A layer whose Image Mask source is a GROUP that carries its own image FILTERS.
 * A filter on a mask-source group means the reveal MATTE is not a static rasterized
 * shape — it is actively RESHAPED over the transition (morphology GROWS it, blur
 * SOFTENS its edge), so the reveal keeps advancing PAST the outgoing drop zone's
 * retime-wrap. Dissolves/Divide is the canonical case: its "B Masks" group stacks
 * three MinMax (PAEMinMax, Mode=1 = Maximum = morphological DILATE, Radius curves
 * ramping 0→32/194/29 px) over a union of animated rectangle masks, and that dilation
 * GROWS the divide-pieces to tile the whole frame by the transition end (GT f23 = full
 * B). The outgoing (A) drop zone times out at wrapSec (0.80s) while the pieces are
 * only ~50% grown; the wrap-to-frame-0 would freeze the scene at that half-grown state
 * and strand the reveal (Divide froze at 8.77 dB f14–f20 vs 15.96 with the reveal
 * running through). Its presence therefore CANCELS the wrap — the same "an active
 * reveal outlives the drop-zone timeout" class as the replicator-matte / filled-shape
 * / kinetic-panel cancels, expressed as a FILTERED mask-source group.
 *
 * Structural: fires on any scene whose Image-Mask `Mask Source` id resolves to a layer
 * bearing ≥1 filter (Divide's MinMax matte, Objects/Arrows' Radial-Blur matte,
 * Stylized/Light Sweep's Directional-Blur matte). No transition names, no per-filter
 * constants. (Only Divide actually wraps, so the wrap-cancel changes only Divide; the
 * other two already have wrapSec undefined — but the probe legitimately fires on the
 * whole filtered-mask family.)
 */
export function hasFilteredMaskReveal(scene: MotrScene): boolean {
  const maskSourceIds = new Set<number>();
  walk(scene.layers, (l) => { if (l.imageMaskSourceId !== undefined) maskSourceIds.add(l.imageMaskSourceId); });
  if (maskSourceIds.size === 0) return false;
  let found = false;
  walk(scene.layers, (l) => {
    if (maskSourceIds.has(l.id) && l.filters && l.filters.length > 0) found = true;
  });
  return found;
}
