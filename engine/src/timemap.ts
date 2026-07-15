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
import { hasFilledShapeOverlay, hasStrokedMaskShape, hasReplicatorMaskReveal, hasFilteredMaskReveal } from './capabilities.js';

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

  // Pure A→B drop-zone crossfade detection. When the ONLY wrapping (extrapolation=1)
  // zones are the two Transition drop zones (A + B) and Transition B is alive all the
  // way to the animation end, the transition is a plain crossfade that genuinely
  // COMPLETES to B — its settled tail is source B, NOT a loop back to frame-0/A. The
  // historical wrap-to-frame-0 was verified against an OLDER GUI GT; the current GUI
  // GT holds B in the tail (verified 2026-07-13m: Blurs/Zoom f17–f23 ≈ (100,110,137) =
  // photo B, not the brown photo A). Cancelling the wrap lets the crossfade settle on
  // B (the render never samples past endSec, where B is fully faded in). Gated tightly
  // so ONLY a pure 2-drop-zone crossfade with B-to-the-end qualifies: an accent/overlay
  // media zone (Loop's "arc", Static's "Static-Clip", Earthquake's "blurry cloud") or a
  // B that dies before the end (Smear: B.out 0.467 << endSec 1.134, the smear-blur
  // continues past the drop zones) does NOT qualify and keeps the frame-0 wrap.
  let pureCrossfadeToB = false;
  {
    const wrapZones: { isDropZone: boolean; isB: boolean; out: number }[] = [];
    (function scanZones(layers: readonly Layer[]) {
      for (const l of layers) {
        const rv = l.retimeValue;
        if (rv && rv.retimingExtrapolation === 1 && rv.keyframes.length >= 2
            && !clonedContinuationSourceIds.has(l.id)) {
          const st = l.source?.type;
          const isDropZone = st === 'transitionA' || st === 'transitionB';
          const out = l.timing ? t2s(l.timing.out) : t2s(rv.keyframes[rv.keyframes.length - 1].time);
          wrapZones.push({ isDropZone, isB: st === 'transitionB', out });
        }
        scanZones(l.children);
      }
    })(scene.layers);
    const bZone = wrapZones.find(z => z.isB);
    pureCrossfadeToB =
      wrapZones.length === 2 &&
      wrapZones.every(z => z.isDropZone) &&
      bZone !== undefined &&
      bZone.out >= endSec - frameSec;
  }

  // PURE A→B DROP-ZONE CROSSFADE that SETTLES on B (cancel the wrap).
  // The wrap-to-frame-0 assumes the transition LOOPS back to source A once the
  // outgoing (A) drop zone times out. That is right for a looping/accent-driven
  // scene, but WRONG for a plain crossfade whose Transition B drop zone stays
  // alive to the animation end: there the transition genuinely COMPLETES on B and
  // the GUI GT tail holds photo B, not A (verified 2026-07-13m: Blurs/Zoom +
  // Movements/Flashback tails are photo B, e.g. Zoom f23 ≈ (92,106,137) = B, while
  // the wrap-to-0 rendered photo A ≈ (131,85,56)). Structural signature (no slug
  // names): the ONLY wrapping (retimingExtrapolation=1) zones are the two drop
  // zones (transitionA + transitionB) — no accent/overlay media that would keep
  // animating past the wrap — AND Transition B outlives the wrap all the way to
  // the animation end (B.out ≥ endSec − 1 frame). Then cancelling the wrap lets the
  // A→B crossfade run to completion and hold B (the identity remap tops out at
  // progress·endSec < endSec, which is already the settled-B instant). Slugs whose
  // wrap is set by a SHORT-lived accent zone (Loop's "arc") or whose drop zones die
  // early while a blur/smear continues (Smear: B.out 0.467 ≪ endSec 1.134) or which
  // have extra overlay media (Static/Earthquake/Heart) do NOT match, so their
  // existing wrap/other-cancel behaviour is untouched.
  let pureCrossfadeSettleB = false;
  if (wrapSec !== undefined) {
    let wrapZoneCount = 0;
    let nonDropZoneWrap = false;
    let bOutSec = -1;
    (function scanX(layers: readonly Layer[]) {
      for (const l of layers) {
        const rv = l.retimeValue;
        if (rv && rv.retimingExtrapolation === 1 && rv.keyframes.length >= 2
            && !clonedContinuationSourceIds.has(l.id)) {
          wrapZoneCount++;
          const st = l.source?.type;
          if (st !== 'transitionA' && st !== 'transitionB') nonDropZoneWrap = true;
          if (st === 'transitionB' && l.timing) bOutSec = Math.max(bOutSec, t2s(l.timing.out));
        }
        scanX(l.children);
      }
    })(scene.layers);
    pureCrossfadeSettleB = wrapZoneCount === 2 && !nonDropZoneWrap && bOutSec >= endSec - frameSec;
  }

  // FILTER-ANIMATION OUTLIVES CONTENT (Lights/Bloom): a plain 2-drop-zone crossfade
  // whose drop zones BOTH time out early (A.out 0.200, B.out 0.534) but whose scene
  // animationEnd is pushed WAY past that (1.270s) by a KEYFRAMED FILTER curve on a drop
  // zone (Bloom's Threshold ramps 100→1 to flash the frame to white, then a 2nd Bloom's
  // Threshold ramps 1→100 to fade the bloom back off and reveal clean B). The wrap-to-0
  // freezes the WHOLE scene to source A, which kills BOTH the A→B content crossfade AND
  // (with filter time now decoupled — see compositor filterTime) leaves the tail stranded
  // on the wrong photo: GT holds photo B in the decaying tail (f23 ≈ (92,107,137) = B),
  // not the sepia photo A the wrap re-shows.
  //
  // The correct behavior: let CONTENT play to the last live drop-zone instant and HOLD
  // there (B fully faded in), while the FILTER animation plays THROUGH in true scene time
  // (the compositor already evaluates filter curves at the un-wrapped time). So instead of
  // wrapping to 0 we CLAMP content time to just under the last drop-zone `out` — the fully
  // revealed B persists and the bloom filter blooms then un-blooms over it.
  //
  // Structural signature (no slug names): the ONLY wrapping (extrapolation=1) zones are the
  // two drop zones (A+B), NEITHER outlives the wrap to endSec (so pureCrossfadeSettleB does
  // NOT already handle it), a drop zone carries a KEYFRAMED (animating) filter param whose
  // last keyframe fires past the last drop-zone death, AND endSec extends materially past
  // DROP-ZONE CONTENT-GAP BRIDGE (Lights/Bloom): the two drop zones do not overlap —
  // Transition A times out at 0.200s but Transition B is not born until 0.234s, leaving
  // a ~1-frame DEAD GAP with no live content (a black hole). FCP holds the outgoing A
  // across that gap until B appears (the A→B swap is masked by the bloom flash). When
  // the wrap is cancelled (pureCrossfadeSettleB, so the scene plays through instead of
  // looping to frame 0), a frame landing in [A.out, B.in) would render black. Bridge it
  // by holding A's last-alive instant until B is born, so the content never flashes to
  // black.
  //
  // ⚠️ SCOPED to a PURE drop-zone crossfade — the two drop zones must be the ONLY visible
  // content. A kinetic media-panel MONTAGE (Stylized/Slide: 15 sliding sprite panels)
  // fills the gap with its own panels, so holding A there strands the montage
  // (Slide regressed 16.6→11.9). Require: exactly two drop zones (A+B), and NO extra
  // media/generator/filled-shape content layers that would be alive during the gap.
  let gapBridgeAHold: number | undefined; // hold-A content time during the gap
  let gapStart = 0, gapEnd = 0;
  {
    let aOut = -1, bIn = -1;
    let dropZoneCount = 0;
    let extraContentLayers = 0; // non-drop-zone media/generator/filled-shape leaves
    (function scanGap(layers: readonly Layer[]) {
      for (const l of layers) {
        const rv = l.retimeValue;
        const isDropZone = rv && rv.retimingExtrapolation === 1
          && !clonedContinuationSourceIds.has(l.id)
          && (l.source?.type === 'transitionA' || l.source?.type === 'transitionB');
        if (isDropZone && l.timing) {
          dropZoneCount++;
          if (l.source?.type === 'transitionA') aOut = t2s(l.timing.out);
          if (l.source?.type === 'transitionB') bIn = t2s(l.timing.in);
        } else {
          // Any OTHER content leaf that can render pixels (bundled media sprite,
          // generator, or a filled/solid shape) means the transition is NOT a pure
          // 2-drop-zone crossfade — the gap is filled by that content, so bridging A
          // would be wrong. (Mask shapes don't render pixels; ignore them.)
          const isMedia = l.type === 'image' && l.source?.type === 'media';
          const isGen = l.type === 'generator';
          const isFilledShape = l.type === 'shape' && !!l.shape && !l.shape.isMask;
          if (isMedia || isGen || isFilledShape) extraContentLayers++;
        }
        scanGap(l.children);
      }
    })(scene.layers);
    if (dropZoneCount === 2 && extraContentLayers === 0 && aOut > 0 && bIn > aOut + frameSec * 0.25) {
      gapStart = aOut;
      gapEnd = bIn;
      gapBridgeAHold = Math.max(0, aOut - frameSec * 0.5);
    }
  }

  // The wrap freezes the WHOLE scene back to frame 0 (drop zones re-show A). That
  // is correct when the drop-zone crossfade IS the entire visible transition (e.g.
  // Blurs/Zoom past the drop-zone timeout). ⚠️ Lights/Bloom is NOT such a case
  // (stale claim REFUTED 2026-07-14h against current GUI GT): its wrap pins f4–f23
  // all to t=0 (sepia photo A), but GT is a flash-to-white A→B wipe — f12 warm
  // (242,204,151), f14 WHITE (241,255,255), f23 photo B (92,107,137). So freezing
  // to frame 0 is wrong for Bloom too; its correct fix (a wrap-cancel that lets the
  // bloom filter + A→B reveal play through) is BLOCKED because both drop zones die
  // early (A.out 0.200, B.out 0.534 ≪ endSec 1.270) so a naive cancel exposes a
  // black tail — the content must PERSIST (hold B) past 0.534s while filter time
  // plays on. That content-persistence is a separate time-authority change (S4).
  // A transition with a SOLID-FILL SHAPE overlay (Lights/Flash's white flash
  // rectangles) keeps that overlay animating past the drop-zone wrap — freezing
  // would kill the flash. Disable the wrap ONLY when such a filled-shape overlay
  // exists AND the true animation end extends past the wrap. The same applies to a
  // SCREEN/ADD-blend VIDEO overlay that plays along its own frame-numbered Retime
  // timeline (Lights/Light Noise's light-noise .mov): its second light burst fires
  // PAST the drop-zone wrap, so freezing the scene to time 0 (before the overlay's
  // `in`) would drop that whole burst. Gating on a filled shape OR a blended media
  // overlay (not just "end > wrap") avoids breaking plain media-crossfade Lights
  // transitions. (Bloom's flash-to-white tail remains mis-frozen pending the S4
  // content-persistence work; it is not a plain frozen-A crossfade.)
  let clampSec: number | undefined;
  {
    // Structural overlay probes (capabilities.ts) — each keys off node/shape/mask
    // TYPES, not transition names.
    const filledShapeOverlay = hasFilledShapeOverlay(scene);
    const strokedMaskShape = hasStrokedMaskShape(scene);
    const replicatorMaskReveal = hasReplicatorMaskReveal(scene);
    // A mask-source group carrying its own image FILTER actively RESHAPES the reveal
    // matte over the transition (Dissolves/Divide's "B Masks" MinMax dilation grows
    // the divide-pieces to full-frame). That growth continues PAST the outgoing drop
    // zone's timeout, so the wrap-to-frame-0 would strand the reveal at its wrap-time
    // coverage — its presence cancels the wrap (see hasFilteredMaskReveal).
    //
    // EXCLUDE the stroked-mask case: Objects/Arrows ALSO carries a filter on its mask
    // source (a Radial Blur) so hasFilteredMaskReveal fires on it too, but Arrows is a
    // STROKED-mask reveal whose tail must CLAMP (below), not wrap-cancel — the clamp
    // needs wrapSec to SURVIVE this line (clampSec = strokedMaskShape && wrapSec !==
    // undefined). Cancelling Arrows' wrap here nulls wrapSec, so clampSec never sets
    // and Arrows loses its held-B tail (regressed 16.9→16.5). Divide has no stroked
    // shape, so `&& !strokedMaskShape` cleanly routes Divide → wrap-cancel, Arrows → clamp.
    const filteredMaskReveal = hasFilteredMaskReveal(scene) && !strokedMaskShape;
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
    // Kinetic media-panel MONTAGE (Stylized/Slide): the transition is driven by a
    // montage of many bundled-media sprite PANELS (Media/*.png "rectangles across")
    // that SLIDE across (Position keyframes) and reveal B, and whose lifetimes OUTLIVE
    // the drop-zone wrap. When the outgoing (A) drop zone times out at wrapSec (0.667s)
    // the panels are still mid-slide (out=1.068s) and B (out=1.668s) is arriving — the
    // wrap-to-frame-0 would freeze the whole scene back to pure A and kill the montage
    // (Slide's tail froze on A: f12 rendered correctly but f23 snapped to A). This is
    // the SAME "an overlay keeps animating past the wrap" class as the filled-shape /
    // blended-media / replicator-matte cancels, just expressed as sliding media panels.
    // Gated on ≥3 such panels surviving past the wrap so it fires ONLY on a genuine
    // panel montage (Slide: 15) — a lone decorative media sprite (Loop: 1, not past
    // the wrap) and every plain drop-zone-crossfade wrap slug (Bloom/Zoom/…: 0) are
    // untouched. Structural (media source + position keyframes + out>wrap + count), not
    // a transition name.
    let kineticMediaPanels = 0;
    (function scanPanels(layers: readonly Layer[]) {
      for (const l of layers) {
        if (l.type === 'image' && l.source?.type === 'media' && l.timing) {
          const px = l.transform?.positionX, py = l.transform?.positionY;
          const animated =
            (px && typeof px === 'object' && 'keyframes' in px && (px as any).keyframes?.length >= 2) ||
            (py && typeof py === 'object' && 'keyframes' in py && (py as any).keyframes?.length >= 2);
          if (animated) {
            const outSec = l.timing.out.timescale > 0 ? l.timing.out.value / l.timing.out.timescale : 0;
            if (outSec > (wrapSec ?? 0) + 2 * frameSec) kineticMediaPanels++;
          }
        }
        scanPanels(l.children);
      }
    })(scene.layers);
    const kineticPanelMontage = kineticMediaPanels >= 3;
    // The wrap freezes the WHOLE scene back to frame 0, which is correct only when the
    // drop-zone crossfade IS the entire transition (Blurs/Zoom, Lights/Bloom). A
    // filled-shape / blended-media / replicator-matte overlay OR a kinetic media-panel
    // montage keeps animating past the wrap, so its presence (plus a true animation end
    // beyond the wrap) CANCELS the wrap.
    // The wrap freezes the WHOLE scene back to frame 0, which is correct only when the
    // drop-zone crossfade IS the entire transition (Blurs/Zoom, Lights/Bloom). A
    // filled-shape / blended-media / replicator-matte overlay OR a kinetic media-panel
    // montage keeps animating past the wrap, so its presence (plus a true animation end
    // beyond the wrap) CANCELS the wrap.
    //
    // filteredMaskReveal (a FILTER-driven Image-Mask matte, e.g. Divide's MinMax
    // dilation) is ALSO a "reveal outlives the wrap" cancel — BUT it must NOT pre-empt
    // the stroked-mask CLAMP below. Objects/Arrows is both a filtered-mask reveal (its
    // arc matte carries a Radial Blur) AND a stroked-mask reveal, and it needs the
    // clamp (which requires wrapSec !== undefined). So gate the filteredMaskReveal
    // cancel on NOT strokedMaskShape — a stroked reveal takes the clamp path instead.
    const nonStrokedFilteredReveal = filteredMaskReveal && !strokedMaskShape;
    if (wrapSec !== undefined && (filledShapeOverlay || blendedMediaOverlay || replicatorMaskReveal || kineticPanelMontage || nonStrokedFilteredReveal || pureCrossfadeSettleB) && endSec > wrapSec + frameSec) {
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
    // Drop-zone content-gap bridge (Lights/Bloom): when the wrap is cancelled and the
    // scene plays through, a frame landing in the dead gap between the outgoing A
    // (out) and incoming B (in) would render black (no live drop zone). Hold A's
    // last-alive instant across [A.out, B.in) so the content never flashes to black.
    if (gapBridgeAHold !== undefined && wrapSec === undefined
        && timeSec >= gapStart - wrapFrameTol && timeSec < gapEnd) {
      timeSec = gapBridgeAHold;
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
