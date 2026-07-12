// buildTimeMap — the engine's single scene-time authority (ROADMAP item 6).
//
// Both `render(progress)` (via `progress * endSec`) and `renderAt(timeSec)` funnel
// their raw scene-time through ONE remap here. It reads retime curves and layer
// lifetimes to decide two things, entirely from node/behavior TYPES (no transition
// names, no ground-truth constants):
//
//   • wrapSec  — the scene time past which a drop zone with retimingExtrapolation
//                mode 1 ("wrap") has run out its media/lifetime, so Motion loops the
//                playhead back to t=0 and the drop zones re-show source A.
//   • clampSec — for a stroked-mask reveal, the tail frames instead HOLD just under
//                the drop-zone timeout so the fully-revealed B persists.
//
// The remap applies wrap first, then clamp. If neither fires it is the identity.
import type { MotrScene, Layer, RationalTime } from './types.js';
import { hasFilledShapeOverlay, hasStrokedMaskShape, hasReplicatorMaskReveal } from './capabilities.js';

export interface TimeMap {
  /** Remap a raw scene time (seconds) to the effective render time (seconds). */
  remap(tSec: number): number;
  /** The wrap-to-zero threshold (seconds), or undefined when no wrap applies. */
  readonly wrapSec: number | undefined;
  /** The stroked-mask clamp ceiling (seconds), or undefined when none applies. */
  readonly clampSec: number | undefined;
}

const t2s = (rt: RationalTime): number => (rt.timescale > 0 ? rt.value / rt.timescale : 0);

export function buildTimeMap(scene: MotrScene): TimeMap {
  const endSec = scene.settings.animationEndSec
    ?? (scene.settings.duration.value / scene.settings.duration.timescale);
  const frameSec = scene.settings.frameRate > 0 ? 1 / scene.settings.frameRate : 1 / 30;
  const wrapFrameTol = frameSec / 2;

  // Object IDs cloned by a Clone Layer whose lifetime extends past the source's own
  // timeout. Such a source's timeout does NOT end the visible transition — its
  // Clone keeps rendering the (rotating) content — so we must NOT treat that
  // (early) timeout as the scene's wrap-to-frame-0 point. Movements/Switch's
  // "Clone B" (in=0.934s, out=1.735s) clones the timed-out Transition B (out=0.9s):
  // using B's 0.9s as the wrap collapsed the whole second half to frame 0. Excluding
  // it leaves Transition A's 1.702s as the true wrap (GT frames past 1.702s ARE
  // frame-0/source-A; the tail before that keeps animating via the clone).
  const clonedContinuationSourceIds = new Set<number>();
  (function scanClones(layers: readonly Layer[]) {
    for (const l of layers) {
      if (l.type === 'clone' && l.cloneSourceId !== undefined && l.timing) {
        clonedContinuationSourceIds.add(l.cloneSourceId);
      }
      scanClones(l.children);
    }
  })(scene.layers);

  // Retime wrap threshold: the time (seconds) past which FCP loops the transition
  // playhead back to the start (t=0) because a drop zone with retimingExtrapolation
  // mode 1 (wrap) has run out its media/lifetime — so the drop zones re-show source
  // A. The loop fires when the FIRST wrapping drop zone times out (its layer timing
  // `out`), which is when the outgoing content disappears. Verified on Blurs/Zoom:
  // the A drop zone times out at 0.4338s and GT frames past that are byte-identical
  // to frame 0 (pure A). The retime curve's last keyframe (0.4671s) over-shoots this,
  // so we use the layer lifetime, not the keyframe time.
  let wrapSec: number | undefined;
  (function scan(layers: readonly Layer[]) {
    for (const l of layers) {
      const rv = l.retimeValue;
      if (rv && rv.retimingExtrapolation === 1 && rv.keyframes.length >= 2) {
        // A drop zone whose media is continued by a Clone Layer does not end the
        // transition at its own timeout — skip it from the wrap-min.
        if (clonedContinuationSourceIds.has(l.id)) { scan(l.children); continue; }
        // Prefer the layer's lifetime end (when the outgoing content times out);
        // fall back to the retime curve's last keyframe if the layer is untimed.
        let wrap: number;
        if (l.timing) wrap = t2s(l.timing.out);
        else {
          const kf = rv.keyframes[rv.keyframes.length - 1];
          wrap = t2s(kf.time);
        }
        if (wrap > 0 && (wrapSec === undefined || wrap < wrapSec)) wrapSec = wrap;
      }
      scan(l.children);
    }
  })(scene.layers);

  // The wrap freezes the WHOLE scene back to frame 0 (drop zones re-show A). That
  // is correct when the drop-zone crossfade IS the entire visible transition (e.g.
  // Blurs/Zoom and Lights/Bloom, whose GT past the drop-zone timeout is
  // byte-identical to frame 0). But a transition with a SOLID-FILL SHAPE overlay
  // (Lights/Flash's white flash rectangles) keeps that overlay animating past the
  // drop-zone wrap — freezing would kill the flash. Disable the wrap ONLY when
  // such a filled-shape overlay exists AND the true animation end extends past the
  // wrap. The same applies to a SCREEN/ADD-blend VIDEO overlay that plays along
  // its own frame-numbered Retime timeline (Lights/Light Noise's light-noise .mov):
  // its second light burst fires PAST the drop-zone wrap, so freezing the scene to
  // time 0 (before the overlay's `in`) would drop that whole burst. Gating on a
  // filled shape OR a blended media overlay (not just "end > wrap") avoids breaking
  // plain media-crossfade Lights transitions (Bloom) whose correct tail IS the
  // frozen-A wrap.
  let clampSec: number | undefined;
  {
    // Structural overlay probes (capabilities.ts) — each keys off node/shape/mask
    // TYPES, not transition names.
    const filledShapeOverlay = hasFilledShapeOverlay(scene);
    const strokedMaskShape = hasStrokedMaskShape(scene);
    const replicatorMaskReveal = hasReplicatorMaskReveal(scene);
    // A blended (screen/add) VIDEO media leaf that OUTLIVES the wrap plays along its
    // own frame-numbered Retime timeline (Lights/Light Noise's light-noise .mov): its
    // second burst fires past the drop-zone wrap, so freezing to time 0 would drop it.
    // This one depends on wrapSec (is the overlay's `out` past the wrap?), so it stays
    // local rather than in capabilities.ts.
    let blendedMediaOverlay = false;
    (function scanBlend(layers: readonly Layer[]) {
      for (const l of layers) {
        // A screen/add-family-blended OVERLAY leaf that OUTLIVES the wrap keeps
        // animating past the drop-zone timeout, so freezing the scene to time 0
        // would drop it. Two forms share this class:
        //   • a VIDEO media leaf (Lights/Light Noise's light-noise .mov — its 2nd
        //     burst fires past the wrap), and
        //   • a procedural GENERATOR leaf (Lights/Lens_Flare's LensFlareGenerator,
        //     Blend Mode 10=screen, out=1.001s past the A-drop-zone wrap at 0.567s;
        //     without this the completed A→B crossfade tail wrongly wrapped back to
        //     pure A — GT shows B). Both are "a blended overlay that survives the
        //     wrap", keyed on layer type + screen-family blend + out > wrapSec.
        const isBlendedOverlayLeaf =
          (l.type === 'image' && l.source?.type === 'media') || l.type === 'generator';
        if (isBlendedOverlayLeaf
          && (l.blendMode === 'screen' || l.blendMode === 'add' || l.blendMode === 'overlay' || l.blendMode === 'lighten')
          && l.timing) {
          const outSec = l.timing.out.timescale > 0 ? l.timing.out.value / l.timing.out.timescale : 0;
          if (outSec > (wrapSec ?? 0) + frameSec) blendedMediaOverlay = true;
        }
        scanBlend(l.children);
      }
    })(scene.layers);
    // The wrap freezes the WHOLE scene back to frame 0, which is correct only when the
    // drop-zone crossfade IS the entire transition (Blurs/Zoom, Lights/Bloom). A
    // filled-shape / blended-media / replicator-matte overlay keeps animating past the
    // wrap, so its presence (plus a true animation end beyond the wrap) CANCELS the wrap.
    if (wrapSec !== undefined && (filledShapeOverlay || blendedMediaOverlay || replicatorMaskReveal) && endSec > wrapSec + frameSec) {
      wrapSec = undefined;
    }
    // Stroked-mask reveal (Objects/Arrows): the growing arrow arcs cut A away to
    // full B by the drop-zone `out`. Past `out` the drop zones would vanish
    // (blank frame) and the retime-wrap would snap back to A — both wrong (GT
    // holds full B). Instead of wrapping, CLAMP the scene time to just under the
    // drop-zone timeout for the tail frames so the fully-revealed B (mask at full
    // coverage, both drop zones alive) persists to progress=1.
    clampSec = (strokedMaskShape && wrapSec !== undefined)
      ? Math.max(0, wrapSec - frameSec * 0.25)
      : undefined;
    if (clampSec !== undefined) wrapSec = undefined;
  }

  const remap = (tSec: number): number => {
    let timeSec = tSec;
    // Retime extrapolation (mode 1 = wrap): once the wrapping drop zone has
    // timed out by this frame (within a half-frame tolerance — FCP samples the
    // frame centre), the transition loops back to the start and re-shows A.
    if (wrapSec !== undefined && timeSec >= wrapSec - wrapFrameTol) {
      timeSec = 0;
    }
    // Stroked-mask reveal tail: clamp to just under the drop-zone timeout so the
    // fully-revealed B holds for the last frames (see clampSec).
    if (clampSec !== undefined && timeSec > clampSec) {
      timeSec = clampSec;
    }
    return timeSec;
  };

  return { remap, wrapSec, clampSec };
}
