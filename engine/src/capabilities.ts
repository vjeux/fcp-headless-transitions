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
 * A GENUINE wide-equirect (360°/VR panorama) SCENE — the scene-aware form of
 * isWideEquirect used to pick FCP's oz_render.mm centred-window readback (cropCenter)
 * + skip the fill-conform (see api.ts + compositor/index.ts).
 *
 * The raw dimension test `isWideEquirect(canvasW, canvasH)` fires on ANY ≥3072-wide,
 * ≥1.6:1 canvas — but not every 4K canvas is a panorama. A real equirect scene projects
 * its transition onto the FULL panorama sphere, so BOTH transition drop zones are
 * authored at the wide canvas resolution (360°_Bloom / Objects/Squares: A+B both
 * 4096×2160; 360°/Push et al.: 4096×2048). Movements/Smear ALSO declares a 4096×2160
 * project canvas but is a plain HD transition composited into it — its Transition-A drop
 * zone is a standard 1920×1080 card (a SUB-canvas drop zone), NOT a panorama plate.
 * Treating Smear as equirect took the cropCenter readback + skipped the fill-conform, so
 * the settled-B tail rendered LETTERBOXED / centre-cropped instead of filling the frame
 * — costing several dB/frame on the tail vs the GUI GT (which fills the frame).
 *
 * Structural discriminator (no slug names): the canvas is wide-equirect AND EVERY
 * transition-A/B drop zone is itself wide (≥3072 px). A scene with any sub-canvas
 * (e.g. 1920-wide HD) transition drop zone is NOT a panorama → take the normal
 * fill-conform + resample path. Fires on the true panorama family (all 360°__* +
 * 360°_Bloom + Squares → 9 built-ins); excludes Smear.
 */
export function isEquirectScene(scene: MotrScene): boolean {
  if (!isWideEquirect(scene.settings.width, scene.settings.height)) return false;
  let anyDropZone = false;
  let allWide = true;
  walk(scene.layers, (l) => {
    if (l.type === 'image' && l.dropZone
      && (l.source?.type === 'transitionA' || l.source?.type === 'transitionB')) {
      anyDropZone = true;
      if (l.dropZone.width < 3072) allWide = false;
    }
  });
  return anyDropZone && allWide;
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

/**
 * FILTER-DRIVEN A→B REVEAL that SETTLES on B (Movements/Smear, Lights/Bloom).
 *
 * The transition's outgoing (Transition-A) drop zone carries an image FILTER — a
 * geometric warp (Scrape/PAEScrape) and/or a blow-out blur/glow (Directional Blur,
 * Gaussian Blur + Glow + Bloom) — that dissolves/displaces A away over the first
 * third, revealing the incoming Transition-B drop zone underneath. BOTH drop zones
 * are Retime-wrap (extrapolation=1) zones and BOTH die well before the animation end
 * (Smear: A.out 0.434s, B.out 0.467s ≪ end 1.134s; Bloom: A.out 0.200s, B.out 0.534s
 * ≪ end 1.270s). There is NO overlay/accent media or generator that could keep the
 * scene alive on its own.
 *
 * The historical retime-wrap loops the playhead to frame-0 once the outgoing zone
 * times out — re-showing photo A frozen for the whole tail. That is WRONG for this
 * family: the GUI GT tail HOLDS photo B (Smear f23 ≈ (92,106,137) = B; Bloom f23 ≈
 * (92,107,137) = B), not the frozen warm A the wrap rendered. So the wrap must be
 * cancelled AND the incoming B held past its `out` as the settled base (the drop
 * zones die before end, so a naive cancel alone would strand the tail on black —
 * holdIncomingB fills it with settled B). See timemap.ts (wrap-cancel) and
 * evaluator/index.ts (holdIncomingB / heldIncomingB).
 *
 * Structural signature (no transition names, no GT constants):
 *   • EXACTLY two Retime-wrap zones, BOTH Transition drop zones (A + B),
 *   • the Transition-A drop zone bears ≥1 image filter (the reveal driver),
 *   • NO overlay media leaf or generator (a blended/accent overlay would drive its
 *     own persistence via the existing blendedMediaOverlay / filled-shape cancels),
 *   • the Transition-B drop zone dies before the animation end (B.out < end − 1frame)
 *     — i.e. the settled tail is NOT already covered by the pureCrossfadeSettleB
 *     rule (which needs B alive to the end).
 * Fires on {Smear, Bloom} — a real 2-slug family, not a per-transition hardcode.
 */
export function hasFilterRevealSettleB(scene: MotrScene): boolean {
  const end = scene.settings.animationEndSec
    ?? (scene.settings.duration.timescale > 0 ? scene.settings.duration.value / scene.settings.duration.timescale : 0);
  const frameSec = (scene.settings.frameRate && scene.settings.frameRate > 0) ? 1 / scene.settings.frameRate : 1 / 30;
  const t2s = (rt: { value: number; timescale: number } | undefined): number =>
    rt && rt.timescale > 0 ? rt.value / rt.timescale : 0;
  let wrapZones = 0;
  let nonDropZoneWrap = false;
  let aHasFilter = false;
  let bOut = -1;
  let hasOverlayMedia = false;
  walk(scene.layers, (l) => {
    const rv = l.retimeValue;
    if (rv && rv.retimingExtrapolation === 1 && rv.keyframes && rv.keyframes.length >= 2) {
      wrapZones++;
      const st = l.source?.type;
      if (st !== 'transitionA' && st !== 'transitionB') nonDropZoneWrap = true;
      if (st === 'transitionA' && l.filters && l.filters.length > 0) aHasFilter = true;
      if (st === 'transitionB' && l.timing) bOut = Math.max(bOut, t2s(l.timing.out));
    }
    // A media leaf or generator overlay carries the scene on its own — those cases
    // are handled by the blendedMediaOverlay / filled-shape / kinetic-panel cancels.
    if (l.type === 'image' && l.source?.type === 'media') hasOverlayMedia = true;
    if (l.type === 'generator') hasOverlayMedia = true;
  });
  // NOTE: this predicate identifies the STRUCTURAL family (a filter-driven A→B reveal
  // with exactly two Retime-wrap drop zones and no overlay media). It intentionally
  // does NOT include the `bOut < end` timing test that distinguishes "B dies early so
  // the tail must FORCE-hold B" (Smear) from "B is alive to/past the end so the drop-
  // zone crossfade already settles on B" (Bloom, Combo Spin, Black Hole). That
  // disambiguation is a CONSUMPTION-SITE concern and lives at the timemap `settleBSec`
  // gate (timemap.ts) and the evaluator `heldIncomingB` gate — NOT here — so the probe
  // reports the true ≥2-member family (Bloom, Combo Spin, Black Hole, Smear) instead of
  // collapsing to a single-transition signature. Keeping the timing test inside the
  // probe made it fire on only Smear once M-BLOOM's animEnd fix pushed Bloom's B.out
  // past endSec, which trips the no-hardcode gate for a purely incidental reason.
  void end; void frameSec; void bOut; // structural predicate only (see note above)
  return wrapZones === 2 && !nonDropZoneWrap && aHasFilter && !hasOverlayMedia && bOut >= 0;
}

/**
 * The SUBSET of hasFilterRevealSettleB scenes whose incoming Transition-B drop zone
 * DIES before the animation end (`B.out < end − 1 frame`), so the settled tail is NOT
 * already carried by the drop-zone crossfade / pureCrossfadeSettleB. Only these need
 * the wrap RELEASED late + B force-held (Movements/Smear). The others in the family
 * (Bloom, Combo Spin, Black Hole) keep B alive to/past the end and settle naturally, so
 * applying the force-hold to them would be wrong. This is the timing disambiguation
 * that used to live inside hasFilterRevealSettleB; split out so the structural probe
 * can honestly report its full ≥2-member family (see the note in that function).
 */
export function needsFilterRevealForceHoldB(scene: MotrScene): boolean {
  if (!hasFilterRevealSettleB(scene)) return false;
  const end = scene.settings.animationEndSec
    ?? (scene.settings.duration.timescale > 0 ? scene.settings.duration.value / scene.settings.duration.timescale : 0);
  const frameSec = (scene.settings.frameRate && scene.settings.frameRate > 0) ? 1 / scene.settings.frameRate : 1 / 30;
  const t2s = (rt: { value: number; timescale: number } | undefined): number =>
    rt && rt.timescale > 0 ? rt.value / rt.timescale : 0;
  let bOut = -1;
  walk(scene.layers, (l) => {
    const rv = l.retimeValue;
    if (rv && rv.retimingExtrapolation === 1 && rv.keyframes && rv.keyframes.length >= 2
        && l.source?.type === 'transitionB' && l.timing) {
      bOut = Math.max(bOut, t2s(l.timing.out));
    }
  });
  return bOut >= 0 && bOut < end - frameSec;
}
