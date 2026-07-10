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
