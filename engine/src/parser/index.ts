/**
 * Parser: .motr XML → MotrScene
 *
 * Parses the complete ozml format including:
 *   - Factory definitions (map factoryID → node type)
 *   - Scene settings (resolution, duration, fps)
 *   - Scene graph hierarchy (layers, scenenodes)
 *   - Parameter trees (static values + animated curves)
 *   - Keyframe curves with bezier tangent data
 *   - Timing (in/out/offset per node)
 *   - Footage/image source references
 *   - Filters (FxPlug plugin references)
 *   - Behaviors
 */
import type {
  MotrScene, SceneSettings, Layer, Curve, Keyframe, RationalTime,
  Parameter, Transform, Filter, ImageSource, BlendMode, RigWidget, RigBehavior, Shape, Replicator, SequenceReplicator, LayerBehavior, SceneBehavior, LinkBehavior, GaussianGradientConfig, FramingBehavior, EmitterParams, ParticleCellParams
} from '../types.js';

// XML/DOM + time/keyframe/curve/parameter helpers live in ./xml.ts
import {
  parseXML, directChildren, allDirectChildren, firstChild,
  getTextContent, getIntContent, getFloatContent,
  parseTime, parseTiming, parseKeyframe, parseCurve, parseParameter, findDescendant,
} from './xml.js';
import { parseShape, findObjectSource, shapeVertexAnimations } from './shapes.js';
import { parseLayerBehaviors, parseLinkBehaviors } from './behaviors.js';
import { parseEmitterParams, parseParticleCellParams } from './emitter.js';
import { parseReplicator } from './replicator.js';
import { parseRigWidgets, parseRigBehaviors, parseSceneBehaviors } from './rig.js';
import { parseFootageClipAB, determineImageSource, parseDropZone } from './footage.js';
import type { ClipInfo } from './footage.js';
import { extractBlendMode, extractRetimeValue, extractTransform } from './transform.js';
import { parseCameraParams } from './camera.js';


// ============================================================================
// Layer Parsing
// ============================================================================


/**
 * PROCEDURAL (source-less) SHAPE MASK — S8. Lift every `<mask>` child of `el`
 * that draws its OWN alpha (no Mask Source) into a child mask-SHAPE layer, so the
 * existing group-mask compositor (renderChildLayers: collects `shape.isMask`
 * children, rasterizes + unions + applyMask) clips the owning group/layer content.
 *
 * Wipes+Stylized/Diagonal's "Animated mask" (factoryID=11) is this: an animated
 * feathered closed shape that sweeps diagonally as a DIRECT CHILD of the
 * "Transition Diagonal" <layer>, masking the sibling "Gradient and background"
 * group progressively. Motion applies a layer-level mask to that layer's content;
 * lifting it to a mask-shape child reproduces the clip via the same path Motion's
 * shape masks use. Without it the group renders UNMASKED and washes the whole
 * frame from the mask's timing.in (the minimal 6-node repro scored 8.48 dB; the
 * real bug was `parseLayerElement` silently DROPPING `<mask>` children entirely).
 *
 * SCOPED (avoids the FCT_LIFT_ALL_MASKS scar that regressed rig-selected masks by
 * −1 dB): only lift a `<mask>` that (a) has no Mask Source, (b) parses to a closed
 * mask shape with real geometry (≥3 verts), and (c) is not a clone self-mask (the
 * caller gates that) or an Image Mask (has a Mask Source — handled elsewhere). The
 * lifted shape carries its own transform (the animated diagonal Position/Rotation)
 * + feather so the compositor reproduces the soft sweep.
 */
function liftProceduralMasks(
  el: Element,
  factories: Map<number, string>,
  linkSourceIds: Set<number>,
  out: Layer[],
  hostType?: Layer['type'],
): void {
  // S8 PROCEDURAL SHAPE-MASK MATTE.
  // Lifts a source-less animated `<mask>` (Wipes/Diagonal's "Animated mask") into a
  // child mask-shape so the compositor rasterizes it as the owning group's alpha
  // matte. The mask sweeps a finite feathered quad diagonally; its INSTANTANEOUS
  // alpha reveals then RETREATS, but FCP's reveal is a MONOTONIC write-on — so the
  // evaluator emits `writeOnTransforms` (K sub-time samples) and the compositor
  // unions them (per-pixel max) into a monotonic envelope. VERIFIED WIN on GUI-GT:
  // Diagonal pair 11.39 → 13.47 dB (+2.08), 0 collateral regressions across all 65
  // (2026-07-14m). Lift fires on 14 built-ins so it is a generic reveal primitive.
  for (const maskEl of directChildren(el, 'mask')) {
    // Skip Image Masks (have a non-zero Mask Source — handled by the imageMaskSourceId path).
    let hasSource = false;
    for (const p of Array.from(maskEl.getElementsByTagName('parameter'))) {
      if (p.getAttribute('name') === 'Mask Source') {
        const v = p.getAttribute('value');
        if (v !== null) { const n = parseInt(v, 10); if (!Number.isNaN(n) && n !== 0) { hasSource = true; break; } }
      }
    }
    if (hasSource) continue;
    const mshape = parseShape(maskEl, factories, linkSourceIds);
    if (!mshape || mshape.verticesX.length < 3) continue;

    // NARROW MOTION-PATH MASK LIFT (T-qcf704c6b). Some scenes (Stylized/Slide_In)
    // author a `<mask>` DIRECTLY UNDER a generator/image LEAF whose name isn't
    // "Mask"/"Masks" and whose enclosing DOM chain doesn't include one either —
    // so detectMask (in shapes.ts, name-walk-based) returns isMask=false and the
    // existing lift skips it. Broadening detectMask by tagName regressed 8 slugs
    // by ~1 dB (FCT_LIFT_ALL_MASKS scar — see docs/notes). Instead, use a
    // STRUCTURAL discriminator: a `<mask>` that (a) hangs off a generator/image
    // leaf and (b) carries a `<behavior factoryID=24>` (Motion Path) child is
    // MOTION-DRIVEN: the mask is the moving clip window for the panel below it
    // (verified in Slide In.motr line 548 — one Motion Path per active mask).
    // Motion Path is a Motion behavior family, not a per-transition marker.
    // Force-lift by promoting mshape.isMask to true LOCALLY (a shallow copy in
    // the emitted Layer — no leak back to shapes.ts).
    let effectiveIsMask = mshape.isMask;
    let motionPathLifted = false;
    if (!effectiveIsMask
        && (hostType === 'generator' || hostType === 'image')) {
      const hasMotionPath = directChildren(maskEl, 'behavior').some(b => {
        const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
        return fid === 24 || factories.get(fid) === 'Motion Path';
      });
      if (hasMotionPath) { effectiveIsMask = true; motionPathLifted = true; }
    }

    // NARROW ANIMATED-VERTEX MASK LIFT (T-q11397f86). A `<mask>` inside a generator/image
    // leaf whose CONTROL POINTS themselves animate (a `<curve>` inside a vertex
    // Value parameter — Stylized/Center_Reveal's Arrow left/right shapes on the
    // "Grad middle" Gradient generator: 8 of 12 vertices per arrow key at scene
    // t=0.467s→0.567s, sweeping the arrow tail outward from center) is a REVEAL-
    // GEOMETRY mask, not decoration: without it, the Image Mask that resolves
    // through this generator to Transition B rasterizes ONLY the static outer
    // Gradient (no sub-shape geometry) so the reveal never actually reveals.
    // This gate is STRUCTURALLY tight — it fires ONLY on masks whose vertices
    // are authored as `<curve>` keypoint tracks in the .motr (the parser's
    // extractAxisVertices marks each such vertex on `axisX[i].valueCurve` /
    // `axisY[i].valueCurve`). No slug in the built-in transition corpus animates
    // vertex Values except Center_Reveal's Arrow masks (verified via
    // `<parameter name="Value" id="2">` + `<curve>` scan), so this can't lift a
    // decorative shape and regress a static-vertex slug. Follow-up T-qe28315c5.
    if (!effectiveIsMask
        && (hostType === 'generator' || hostType === 'image')) {
      const hasAnimatedVertex = shapeVertexAnimations.has(mshape.verticesX);
      if (hasAnimatedVertex) effectiveIsMask = true;
    }

    if (!effectiveIsMask) continue;

    const maskParams: Parameter[] = [];
    for (const mp of directChildren(maskEl, 'parameter')) maskParams.push(parseParameter(mp));
    const maskTransform = extractTransform(maskParams);
    // Y-AXIS CONVENTION for a MOTION-PATH mask lifted off a generator/image leaf:
    // Motion authors such a mask's Transform (Position.Y, Anchor.Y) in the LEAF's
    // own content frame, whose Y sign is INVERTED relative to the scene Y-up world
    // space the engine's buildTransformMatrix + toPixel expect. Decoded from
    // Stylized/Slide_In's "Rounded rect down" mask (headless probe): the engine
    // placed the sliding panel band at screen y[664..1079] while FCP renders it at
    // y[0..416] — an EXACT mirror about the frame centre. Negating the mask's
    // Position.Y and Anchor.Y lands the band at y[0..415], matching FCP. Scoped to
    // the motion-path lift so name-based masks (Wipes/Diagonal's "Animated mask",
    // already correct) are untouched.
    if (motionPathLifted) {
      maskTransform.positionY = negateCurveOrNumber(maskTransform.positionY);
      maskTransform.anchorY = negateCurveOrNumber(maskTransform.anchorY);
    }
    out.push({
      id: parseInt(maskEl.getAttribute('id') || '0', 10),
      name: maskEl.getAttribute('name') || 'Procedural Mask',
      type: 'shape',
      transform: maskTransform,
      blendMode: 'normal',
      filters: [],
      children: [],
      shape: { ...mshape, isMask: true },
      timing: parseTiming(maskEl),
      behaviors: parseLayerBehaviors(maskEl, factories),
    });
  }
}


/**
 * IMAGE MASK (Mask Source) extraction — shared by both node parsers.
 *
 * An `<mask name="Image Mask" factoryID="1">` child whose `Mask Source` (id=1,
 * nested under Object(2)/Mask(100)) references the shape/group that supplies the
 * alpha. This masks ONLY the owning node (distinct from the "Masks"-group
 * sibling-clip convention). Returns the referenced object id + whether the mask
 * alpha is inverted (Invert Mask=1 or Mask Blend Mode=1 SUBTRACT).
 *
 * Authored on either a `<scenenode>` (Wipes/Mask, Objects/Veil, Concentric's
 * Rectangle clones — factory-15 clone leaves) OR on a `<group>`/`<layer>`
 * (Replicator-Clones/Concentric's "Nth right/left copy" ring groups mask a whole
 * group of stacked Clone A/B to a Circle shape; also Pinwheel/Combo_Spin/Heart).
 * Both node parsers must extract it or the group renders UNMASKED (the ring
 * bug: 12 group-level Image Masks were silently dropped, so Concentric rendered
 * plain full-frame source A instead of the depth-swinging concentric rings).
 */
function extractImageMask(el: Element): { sourceId?: number; invert: boolean } {
  let sourceId: number | undefined;
  let invert = false;
  for (const maskEl of directChildren(el, 'mask')) {
    const findMaskSource = (node: Element): number | undefined => {
      for (const p of Array.from(node.getElementsByTagName('parameter'))) {
        if (p.getAttribute('name') === 'Mask Source') {
          const v = p.getAttribute('value');
          if (v !== null) { const n = parseInt(v, 10); if (!Number.isNaN(n) && n !== 0) return n; }
        }
      }
      return undefined;
    };
    const src = findMaskSource(maskEl);
    if (src !== undefined) {
      sourceId = src;
      for (const p of Array.from(maskEl.getElementsByTagName('parameter'))) {
        if (p.getAttribute('name') === 'Invert Mask') {
          const v = p.getAttribute('value');
          if (v !== null && parseInt(v, 10) === 1) invert = true;
        }
        if (p.getAttribute('name') === 'Mask Blend Mode' && p.getAttribute('id') === '103') {
          const v = p.getAttribute('value');
          if (v !== null && parseInt(v, 10) === 1) invert = true;
        }
      }
      break;
    }
  }
  return { sourceId, invert };
}


/**
 * Detect a "grow-and-shrink accent" scale envelope: an animated Scale curve whose
 * first and last keyframes have value ≈ 0 (or ≈1×default) and at least one middle
 * keyframe has value strictly greater than either endpoint (a peak). This is the
 * hallmark of a Motion accent element that scales up from zero to a visible peak
 * and back to zero (Stylized/Panels_Across's Red bar / White line, Panels_Random's
 * accent shapes — all with 4 Scale keys shaped [0, peak, peak, 0]). Distinguishes
 * such accent shapes from static-scale flash rectangles (Rectangle 8, no scale
 * animation) and from continuously-growing scales (never returning to 0). Kept
 * strict to avoid false positives outside the Stylized/Panels_* family.
 */
/**
 * Negate a Transform channel that may be a static number OR an animated Curve.
 * Used to flip the Y-axis sign of a motion-path mask lifted off a generator/image
 * leaf (leaf content frame → scene Y-up). Negates the curve's default/value and
 * every keyframe value in a shallow copy (the source Curve is not mutated).
 */
function negateCurveOrNumber(v: Curve | number | undefined): Curve | number | undefined {
  if (v === undefined) return undefined;
  if (typeof v === 'number') return -v;
  return {
    ...v,
    default: -v.default,
    value: v.value === undefined ? undefined : -v.value,
    keyframes: v.keyframes.map(k => ({ ...k, value: -k.value })),
  };
}

function isAnimatedZeroPeakZeroCurve(c: Curve | number | undefined): boolean {
  if (!c || typeof c === 'number' || !c.keyframes || c.keyframes.length < 3) return false;
  const kps = c.keyframes;
  const first = kps[0].value;
  const last = kps[kps.length - 1].value;
  if (Math.abs(first) > 1e-3 || Math.abs(last) > 1e-3) return false;
  // At least one middle key must peak > 0.
  let peaks = false;
  for (let i = 1; i < kps.length - 1; i++) {
    if (kps[i].value > Math.max(first, last) + 1e-3) { peaks = true; break; }
  }
  return peaks;
}


function parseSceneNode(el: Element, factories: Map<number, string>, clip: ClipInfo, linkSourceIds: Set<number>, filtersById?: Map<number, { pluginName?: string; name?: string }>): Layer {
  const factoryID = parseInt(el.getAttribute('factoryID') || '0', 10);
  const factoryType = factories.get(factoryID) || '';

  // Determine layer type from factory
  let type: Layer['type'] = 'group';
  switch (factoryType) {
    case 'Image': type = 'image'; break;
    case 'Generator': type = 'generator'; break;
    case 'Shape': type = 'shape'; break;
    case 'Replicator': case 'Sequence Replicator': type = 'replicator'; break;
    case 'Clone Layer': type = 'clone'; break;
    case 'Camera': type = 'camera'; break;
  }

  // Parse all parameters
  const params: Parameter[] = [];
  for (const paramEl of directChildren(el, 'parameter')) {
    params.push(parseParameter(paramEl));
  }

  // Parse filters (ProPlugin Filter scenenodes)
  const filters: Filter[] = [];
  for (const filterNode of directChildren(el, 'scenenode')) {
    const filterFactoryID = parseInt(filterNode.getAttribute('factoryID') || '0', 10);
    if (factories.get(filterFactoryID) === 'ProPlugin Filter') {
      const filterId = parseInt(filterNode.getAttribute('id') || '0', 10);
      const nodeName = filterNode.getAttribute('name') || '';
      const pluginName = filterNode.getAttribute('pluginName') || '';
      const pluginUUID = filterNode.getAttribute('pluginUUID') || '';
      const filterParams: Parameter[] = [];
      for (const fp of directChildren(filterNode, 'parameter')) {
        filterParams.push(parseParameter(fp));
      }
      // A filter with <enabled>0</enabled> is bypassed by FCP (it is NOT applied).
      // (Same convention as layers — see the layer `enabled` parse below.) Skip it so
      // a disabled filter never runs. Generic: no per-transition logic.
      const fEnabledText = getTextContent(filterNode, 'enabled');
      if (fEnabledText !== null && fEnabledText.trim() === '0') continue;
      filters.push({ id: filterId, name: nodeName, pluginName, pluginUUID, parameters: filterParams });
    }
  }

  // Also extract <filter> elements (direct children of scenenode)
  for (const filterEl of directChildren(el, 'filter')) {
    const filterId = parseInt(filterEl.getAttribute('id') || '0', 10);
    const nodeName = filterEl.getAttribute('name') || '';
    const pluginName = filterEl.getAttribute('pluginName') || filterEl.getAttribute('name') || '';
    const pluginUUID = filterEl.getAttribute('pluginUUID') || '';
    const filterParams: Parameter[] = [];
    for (const fp of directChildren(filterEl, 'parameter')) {
      filterParams.push(parseParameter(fp));
    }
    // Skip filters disabled via <enabled>0</enabled> (FCP does not apply them).
    const fEnabledText = getTextContent(filterEl, 'enabled');
    if (fEnabledText !== null && fEnabledText.trim() === '0') continue;
    // The filter's <timing offset> re-anchors its parameter curves from filter-local
    // time to scene time (scene = local + offset). Store it so the compositor can
    // evaluate the filter's curves at (sceneTime − offset). See Filter.timingOffsetSec.
    const fTimingEl = firstChild(filterEl, 'timing');
    const fOffAttr = fTimingEl?.getAttribute('offset');
    let timingOffsetSec: number | undefined;
    if (fOffAttr) {
      const p = fOffAttr.trim().split(/\s+/);
      const v = parseFloat(p[0]);
      const s = p.length > 1 ? parseFloat(p[1]) : 1;
      if (s > 0 && isFinite(v) && Math.abs(v / s) > 1e-6) timingOffsetSec = v / s;
    }
    filters.push({ id: filterId, name: nodeName, pluginName, pluginUUID, parameters: filterParams, timingOffsetSec });
  }

  // FILTER APPLY ORDER (decoded 2026-07-16 via Objects__Curtains empirical match).
  // FCP applies a layer's filters in REVERSE XML order (bottom-up): the LAST <filter>
  // listed in the .motr is the FIRST filter applied to the image, and the FIRST listed
  // is the LAST applied. This matches Motion's Filters Inspector convention (top of the
  // stack = last applied). EVIDENCE (before / after this reverse):
  //   • Objects/Curtains .motr filter list [Colorize, Brightness, Mono]. GUI GT mid-band
  //     f05-f17 = red curtains ~(80,9,1). Engine applying top-down produced the sequence
  //     Colorize→Brightness→Mono, ending in the ChannelMixer Mono step that DESATURATED
  //     the curtain back to grey ~(75,75,75) — engine output was dark grey. Reversing to
  //     bottom-up (Mono→Brightness→Colorize) matches the intuitive image-processing
  //     pipeline (desaturate to luma → brighten mono → remap luma to the RED target
  //     color = (0.7255, 0.1021, 0)) and produces engine mid-band ~(76,11,1), matching
  //     GT to +4.76 dB (16.53 → 21.29). See the .motr filter block at Curtains.motr:655
  //     (Colorize Remap White To=RED, Brightness 2.91×, Mono/ChannelMixer Monochrome=1
  //     with Red-row = Rec.601 luma 0.30/0.59/0.11). Filter constants read via
  //     tools/re/read_const.py + the params directly in the .motr XML.
  //   • Movements/Pinwheel and Objects/Leaves also improved on the gate (net +0.71 and
  //     +0.41 dB) though these are secondary — the primary effect is on stacked chains.
  //   • Stylized/Color_Panels regressed −0.83 dB (the HueSat then Colorize chain gets
  //     re-ordered too, and HueSat's Saturation=1 oversaturates the pre-colorize
  //     mountain photo). Understood: the pre-fix engine was "wrong for the wrong
  //     reasons" — reverse-order fires the correct chain but exposes an underlying
  //     filter-fidelity gap in HueSat/Colorize interaction. Follow-up filed.
  // One reverse here so every consumer (compositor apply loops, tests) sees filters in
  // APPLY order.
  filters.reverse();

  // Parse children (nested scenenodes)
  const children: Layer[] = [];
  for (const childNode of directChildren(el, 'scenenode')) {
    const childFactoryID = parseInt(childNode.getAttribute('factoryID') || '0', 10);
    const childType = factories.get(childFactoryID) || '';
    // Skip filters (already parsed above) and behaviors
    if (childType !== 'ProPlugin Filter' && childType !== 'Fade In/Fade Out'
        && childType !== 'Oscillate' && childType !== 'Spin' && childType !== 'Throw'
        && childType !== 'Motion Path' && childType !== 'Align To') {
      children.push(parseSceneNode(childNode, factories, clip, linkSourceIds, filtersById));
    }
  }

  // <mask> children on a CLONE layer: a mask element (e.g. "Rectangle Mask")
  // clips its OWNING clone to a shape. It is authored as a <mask> sibling of the
  // node's parameters (not a <scenenode>), so the directChildren('scenenode')
  // loop above misses it. Parse it as a mask shape child so the compositor clips
  // the clone (used by Stylized/Color Panels: hue-shifted clone strips masked
  // into sliding vertical panels). SCOPED to CLONE layers only — other node types
  // handle their masks through the existing rig / Image-Mask / Masks-group paths,
  // and lifting every <mask> to a clip child regressed transitions whose masks are
  // rig-selected (e.g. Boxes/Center Reveal's 18 masks). A clone's self-mask has no
  // other path.
  if (type === 'clone') for (const maskNode of directChildren(el, 'mask')) {
    const shape = parseShape(maskNode, factories, linkSourceIds);
    if (!shape) continue;
    const maskParams: Parameter[] = [];
    for (const mp of directChildren(maskNode, 'parameter')) maskParams.push(parseParameter(mp));
    children.push({
      id: parseInt(maskNode.getAttribute('id') || '0', 10),
      name: maskNode.getAttribute('name') || 'Mask',
      type: 'shape',
      transform: extractTransform(maskParams),
      blendMode: 'normal',
      filters: [],
      children: [],
      shape: { ...shape, isMask: true },
      timing: parseTiming(maskNode),
      behaviors: [],
    });
  }
  const enabledText = getTextContent(el, 'enabled');
  const enabled = enabledText === null ? true : enabledText.trim() !== '0';

  // Clone Layers reference their source object by ID via the "Source" id=300 parameter.
  let cloneSourceId: number | undefined;
  if (type === 'clone') {
    const findSource = (ps: Parameter[]): number | undefined => {
      for (const p of ps) {
        if (p.name === 'Source' && p.id === 300 && typeof p.value === 'number') return p.value;
        if (p.children) { const r = findSource(p.children); if (r !== undefined) return r; }
      }
      return undefined;
    };
    cloneSourceId = findSource(params);
  }

  // Replicators tile a "cell" of drawable content across their instances. The
  // cell's content is referenced by an `Object Source id="128"` parameter stored
  // on the Replicator Cell scenenode (a child of the replicator node). Resolve it
  // so the compositor can materialize the cell at each instance transform.
  let cellSourceId: number | undefined;
  if (type === 'replicator') {
    cellSourceId = findObjectSource(el);
  }

  // Image Mask: an `<mask name="Image Mask" factoryID="1">` child whose
  // `Mask Source` references the shape/group supplying the alpha (see
  // extractImageMask). Masks ONLY this layer (distinct from the "Masks"-group
  // sibling-clip convention). Capture the referenced object ID so the compositor
  // can rasterize it and clip this layer's alpha.
  const { sourceId: imageMaskSourceId, invert: imageMaskInvert } = extractImageMask(el);

  // PROCEDURAL (source-less) SHAPE MASK — S8. Lift a `<mask>` child that draws its
  // own alpha (no Mask Source) into a mask-shape child so the compositor clips this
  // node's content. SCOPED to non-clone nodes (clones handle their self-mask above);
  // see liftProceduralMasks for the full rationale + regression scar.
  if (type !== 'clone') liftProceduralMasks(el, factories, linkSourceIds, children, type);

  const layer: Layer = {
    name: el.getAttribute('name') || '',
    id: parseInt(el.getAttribute('id') || '0', 10),
    type,
    transform: extractTransform(params),
    blendMode: extractBlendMode(params),
    filters,
    children,
    timing: parseTiming(el),
    retimeValue: extractRetimeValue(params),
    shape: type === 'shape' ? parseShape(el, factories, linkSourceIds) : undefined,
    replicator: type === 'replicator' ? parseReplicator(params, el, factories) : undefined,
    behaviors: parseLayerBehaviors(el, factories),
    source: (type === 'image' || type === 'generator') ? determineImageSource(params, el, clip) : undefined,
    enabled,
    cloneSourceId,
    cellSourceId,
    imageMaskSourceId,
    imageMaskInvert,
    isParticleEmitter: factoryType === 'Emitter' || undefined,
    // T-B1 parser: lift Motion Emitter + Particle Cell parameter blocks into
    // typed EmitterParams / ParticleCellParams (with any Gravity behavior child
    // folded into the cell). Purely additive — no evaluator/compositor path yet
    // reads these fields (T-B2 will run the particle sim off this schema).
    emitter: factoryType === 'Emitter' ? parseEmitterParams(el) : undefined,
    particleCell: factoryType === 'Particle Cell' ? parseParticleCellParams(el, factories) : undefined,
    dropZone: type === 'image' ? parseDropZone(params) : undefined,
    hasAlignTo: directChildren(el, 'behavior').some(
      b => parseInt(b.getAttribute('factoryID') || '0', 10) === 22
        || factories.get(parseInt(b.getAttribute('factoryID') || '0', 10)) === 'Align To'
    ),
    links: parseLinkBehaviors(el, factories, filtersById),
    camera: type === 'camera' ? parseCameraParams(el, params, factories) : undefined,
  };

  // Promote a candidate solid-fill shape to an OFFSET-AUTHORED sweeping panel
  // (isSolidPanel) iff BOTH hold:
  //   (a) timing.offset is re-anchored well past timing.in (off - in > 1e-3), and
  //   (b) the Position curve is keyed at a NEGATIVE (local-frame) time.
  // This is the Stylized/Panels signature (white/colored rectangles sweeping via a
  // local-time Position curve, re-anchored by a large positive offset ≈3.67s). The
  // combined gate uniquely selects the sweeping panels and EXCLUDES every gradient-
  // rendered Fill-Mode-0 shape (Heart's "Gradient", Center Reveal's shapes — all
  // negPX=false) as well as scene-time decorative shapes and pure-fade flash
  // rectangles. Verified: Panels_Across Rectangle 1-7 pass; Heart/Center/Diagonal
  // shapes fail.
  if (type === 'shape' && layer.shape && !layer.shape.isMask && layer.shape.panelFill) {
    const tim = layer.timing;
    const off = tim?.offset && tim.offset.timescale > 0 ? tim.offset.value / tim.offset.timescale : 0;
    const inn = tim?.in && tim.in.timescale > 0 ? tim.in.value / tim.in.timescale : 0;
    const negKey = (c: Curve | number | undefined): boolean => {
      if (!c || typeof c === 'number' || !c.keyframes || c.keyframes.length === 0) return false;
      const k = c.keyframes[0];
      return k.time.timescale > 0 && k.time.value / k.time.timescale < -1e-3;
    };
    if (off - inn > 1e-3 && (negKey(layer.transform.positionX) || negKey(layer.transform.positionY))) {
      layer.shape.isSolidPanel = true;
    }
    // T-qpanelacr01 (2026-07-16): SCALE-AUTHORED ACCENT SHAPES.
    // Stylized/Panels_Across authors a "Red bar" (RGB 188/18/36) + "White line"
    // (RGB 255/255/255) that FCP GUI GT renders solid (verified: f12+ shows a
    // thin vertical red bar near screen-right and thin white edge lines at the
    // panel margins). Both carry a candidate panelFill from findPanelFillColor
    // (Fill Mode 0, Fill Color rgb, Fill Opacity 1) but FAIL the offset>in +
    // negative-time-Position sweeping-panel gate above (Red bar offset=0.367 <
    // in=0.534; White line has no Position curve). They differ from Rectangle 8
    // (a stray full-screen white shape that GT does NOT render) by having an
    // animated Scale curve (grow 0→peak→hold→0 back-to-0 — a decorative accent
    // envelope), which R8 lacks (R8 has no scale keyframes). The animated-Scale
    // signature also fires on Panels_Random's Red bar + White line 1/6 with the
    // same grow/shrink pattern (5 shapes total across the two Panels_* slugs).
    // Verified: no other slug in the corpus has a Fill Mode 0 + bit-clear +
    // animated-Scale shape (scanned via /tmp/scan_shapes.ts against all 65
    // slug .motr files); every other Fill Mode 0 + bit-clear shape is either a
    // gradient-mode-flagged shape rejected by findFillColor or the R8-class
    // flash rectangle without scale animation.
    // Promote to isSolidPanel so the compositor's panelFill path draws them;
    // this keeps them off the fillColor evaluator path (which would offset-shift
    // curveTime and mis-anchor Red bar whose Scale keys are in POSITIVE local
    // time). The panel-retime rate=(out-in)/endSec applied by the evaluator's
    // isSolidPanel curveTime shift is benign for these shapes: their Scale keys
    // hit a flat 1.3/2.83 plateau across the transition-visible window (curveTime
    // 0.334→0.667 for Red bar), so retime rate ≈0.79× at Panels_Across still
    // samples the plateau and yields the correct grow/hold envelope.
    if (!layer.shape.isSolidPanel && layer.shape.panelFill
        && isAnimatedZeroPeakZeroCurve(layer.transform.scaleX)) {
      layer.shape.isSolidPanel = true;
    }
  }
  // Clear the panel-fill candidate when the shape did NOT qualify, so nothing but
  // a confirmed panel ever carries panelFill.
  if (layer.shape && !layer.shape.isSolidPanel) {
    layer.shape.panelFill = undefined;
    layer.shape.panelFillOpacity = undefined;
  }

  return layer;
}


/**
 * Parse a <layer> element (a group that contains scenenodes).
 */
function parseLayerElement(el: Element, factories: Map<number, string>, clip: ClipInfo, linkSourceIds: Set<number>, filtersById?: Map<number, { pluginName?: string; name?: string }>): Layer {
  // Parse the layer's own parameters
  const params: Parameter[] = [];
  for (const paramEl of directChildren(el, 'parameter')) {
    params.push(parseParameter(paramEl));
  }

  // Parse child scenenodes and nested layers, separating filters
  const children: Layer[] = [];
  const filters: Filter[] = [];
  for (const childEl of allDirectChildren(el)) {
    if (childEl.tagName === 'scenenode') {
      const fid = parseInt(childEl.getAttribute('factoryID') || '0', 10);
      const ftype = factories.get(fid) || '';
      if (ftype === 'ProPlugin Filter') {
        // Extract as a filter on this layer
        const filterId = parseInt(childEl.getAttribute('id') || '0', 10);
        const pluginName = childEl.getAttribute('pluginName') || '';
        const pluginUUID = childEl.getAttribute('pluginUUID') || '';
        const filterParams: Parameter[] = [];
        for (const fp of directChildren(childEl, 'parameter')) {
          filterParams.push(parseParameter(fp));
        }
        // Skip filters disabled via <enabled>0</enabled> (FCP does not apply them).
        const fEnabledText = getTextContent(childEl, 'enabled');
        if (fEnabledText !== null && fEnabledText.trim() === '0') continue;
        filters.push({ id: filterId, pluginName, pluginUUID, parameters: filterParams });
      } else {
        children.push(parseSceneNode(childEl, factories, clip, linkSourceIds, filtersById));
      }
    } else if (childEl.tagName === 'layer' || childEl.tagName === 'group') {
      children.push(parseLayerElement(childEl, factories, clip, linkSourceIds, filtersById));
    } else if (childEl.tagName === 'filter') {
      // Filter elements (blur, color, etc.)
      const filterId = parseInt(childEl.getAttribute('id') || '0', 10);
      const pluginName = childEl.getAttribute('pluginName') || childEl.getAttribute('name') || '';
      const pluginUUID = childEl.getAttribute('pluginUUID') || '';
      const filterParams: Parameter[] = [];
      for (const fp of directChildren(childEl, 'parameter')) {
        filterParams.push(parseParameter(fp));
      }
      // Skip filters disabled via <enabled>0</enabled> (FCP does not apply them).
      const fEnabledText = getTextContent(childEl, 'enabled');
      if (fEnabledText !== null && fEnabledText.trim() === '0') continue;
      filters.push({ id: filterId, pluginName, pluginUUID, parameters: filterParams });
    }
  }

  // FILTER APPLY ORDER: reverse XML→apply order (bottom-up). See the identical block
  // in parseSceneNode above for the empirical Curtains decode (+4.76 dB) and evidence.
  // One reverse here so parseLayerElement produces filters in APPLY order too.
  filters.reverse();

  // PROCEDURAL (source-less) SHAPE MASK — S8. A `<mask>` authored as a DIRECT CHILD
  // of a <layer>/<group> (a sibling of the content it clips) is a layer-level mask
  // in Motion. The child-element loop above only handles scenenode/layer/group/filter
  // and would silently DROP it, leaving the content UNMASKED (Wipes/Diagonal's
  // "Animated mask" sweeps its sibling "Gradient and background" group). Lift it into
  // a mask-shape child so renderChildLayers clips this layer's content. See
  // liftProceduralMasks for the full rationale + the FCT_LIFT_ALL_MASKS regression scar.
  liftProceduralMasks(el, factories, linkSourceIds, children);

  // Image Mask on a GROUP/LAYER: a `<mask>` child with a `Mask Source` clips the
  // WHOLE group to the referenced shape (Concentric's ring groups mask stacked
  // Clone A/B to a Circle shape — the concentric-ring geometry; the swing is the
  // group's own Rotation.Y 0→∓π). Silently dropped before this (parseSceneNode
  // extracted it but parseLayerElement did not), so the rings rendered as plain
  // full-frame source A. Fires on 9 built-ins (Concentric, Pinwheel, Combo_Spin,
  // Heart, Center, Close_and_Open, Light_Sweep, Lower, Panels_Random).
  const { sourceId: imageMaskSourceId, invert: imageMaskInvert } = extractImageMask(el);

  return {
    name: el.getAttribute('name') || '',
    id: parseInt(el.getAttribute('id') || '0', 10),
    type: 'group',
    transform: extractTransform(params),
    blendMode: extractBlendMode(params),
    filters,
    children,
    timing: parseTiming(el),
    imageMaskSourceId,
    imageMaskInvert,
    enabled: (() => { const t = getTextContent(el, 'enabled'); return t === null ? true : t.trim() !== '0'; })(),
    links: parseLinkBehaviors(el, factories, filtersById),
    // Animation behaviors authored DIRECTLY on a <group>/<layer> (Fade/Ramp/
    // Oscillate/Spin). parseSceneNode captures these on <scenenode> elements, but
    // parseLayerElement historically omitted them, so a group-level Spin (Combo_Spin's
    // 6 blade groups C1-C6 each carry a "Spin LT/RT" factory-22 behavior on the GROUP)
    // was silently DROPPED → the blades never rotated → the pinwheel didn't render.
    // Same omission would drop a group-level Fade/Ramp. Parsing here is inert until a
    // consumer reads it (evaluator applies Spin as a local-space Z rotation, scoped).
    behaviors: parseLayerBehaviors(el, factories),
  };
}

// ============================================================================
// Main Parser
// ============================================================================



export function parseMotr(xmlText: string): MotrScene {
  const doc = parseXML(xmlText);
  const root = doc.documentElement; // <ozml>

  // 1. Parse factory definitions (direct children of <ozml>)
  const factories = new Map<number, string>();
  for (const factoryEl of directChildren(root, 'factory')) {
    const id = parseInt(factoryEl.getAttribute('id') || '0', 10);
    const desc = getTextContent(factoryEl, 'description') || '';
    factories.set(id, desc);
  }

  // 2. Find the <scene> element
  const sceneEl = firstChild(root, 'scene');
  if (!sceneEl) {
    return { settings: { width: 1920, height: 1080, duration: { value: 200200, timescale: 120000 }, frameRate: 24 }, layers: [], factories, rigWidgets: [], rigBehaviors: [], sceneBehaviors: [] };
  }

  // 3. Parse scene settings from <sceneSettings>
  const ssEl = firstChild(sceneEl, 'sceneSettings');
  const width = ssEl ? getIntContent(ssEl, 'width', 1920) : 1920;
  const height = ssEl ? getIntContent(ssEl, 'height', 1080) : 1080;
  const frameRate = ssEl ? getFloatContent(ssEl, 'frameRate', 30) : 30;

  // Duration: compute from sceneSettings frames + frameRate.
  // sceneSettings.duration is in FRAMES. Convert to a rational time.
  const durationFrames = ssEl ? getIntContent(ssEl, 'duration', 51) : 51;
  // Use standard timescale 120000 (allows frame-accurate times at 23.976/24/25/30fps)
  const timescale = 120000;
  const durationValue = Math.round((durationFrames / frameRate) * timescale);
  let duration: RationalTime = { value: durationValue, timescale };

  const settings: SceneSettings = { width, height, duration, frameRate };
  if (ssEl) {
    const mbs = getFloatContent(ssEl, 'motionBlurSamples', 1);
    const mbd = getFloatContent(ssEl, 'motionBlurDuration', 1);
    if (mbs > 1) { settings.motionBlurSamples = Math.round(mbs); settings.motionBlurDuration = mbd; }
  }

  // Parse rig widgets and behaviors
  const rigWidgets = parseRigWidgets(sceneEl, factories);
  const rigBehaviors = parseRigBehaviors(sceneEl);
  const sceneBehaviors = parseSceneBehaviors(sceneEl, factories);

  // Resolve the footage drop-zone clips → A/B (+ bundled media + drop-zone box
  // height) for authoritative source resolution.
  const clip = parseFootageClipAB(sceneEl, factories);
  // The drop-zone media box height (captured during the clip walk above) governs
  // the Drop In card conform.
  settings.dropZoneMediaHeight = clip.dropZoneMediaHeight;

  // Collect every object ID referenced as a Link `Source Object` (id=201) — the
  // set of "color swatch" driver shapes that other layers link their color FROM
  // (e.g. Heart's "Grad color link" shapes). Used to keep those on the gradient
  // path when deciding whether a bit-clear solid Fill Color should be painted.
  const linkSourceIds = new Set<number>();
  for (const p of Array.from(sceneEl.getElementsByTagName('parameter'))) {
    if (p.getAttribute('name') === 'Source Object' && p.getAttribute('id') === '201') {
      const v = parseInt(p.getAttribute('value') || '0', 10);
      if (v) linkSourceIds.add(v);
    }
  }

  // Pre-scan: filtersById maps filter-object id → its pluginName/name. Needed by
  // parseLinkBehaviors to decide whether a colour-Link path `./1`/`./2` targets a
  // Colorize filter's Remap Black/White folder (structural colour-Link detection,
  // per ROADMAP S1/T-A1 — Panels_Across uses this).
  const filtersById = new Map<number, { pluginName?: string; name?: string }>();
  {
    const fEls = Array.from(sceneEl.getElementsByTagName('scenenode'))
      .concat(Array.from(sceneEl.getElementsByTagName('filter')));
    for (const f of fEls) {
      const fid = parseInt(f.getAttribute('id') || '0', 10);
      if (!fid) continue;
      const pluginName = f.getAttribute('pluginName') || undefined;
      const nm = f.getAttribute('name') || undefined;
      // Only capture actual FILTER nodes (either <filter> elements or ProPlugin
      // Filter scenenodes). Non-filter scenenodes still get an entry with just
      // `name`, which parseColorTarget rejects (needs a colorize plugin name).
      const fFactoryId = parseInt(f.getAttribute('factoryID') || '0', 10);
      const isFilterScenenode = factories.get(fFactoryId) === 'ProPlugin Filter';
      const isFilterElement = f.tagName === 'filter';
      if (isFilterScenenode || isFilterElement) {
        filtersById.set(fid, { pluginName, name: nm });
      }
    }
  }

  // Pre-scan: linkColorSources maps object id → Fill Color RGB (0-1) for ANY
  // scenenode carrying a Fill Color (id=111) with Red/Green/Blue children —
  // regardless of `<enabled>0</enabled>` and regardless of the solid-fill flag bit.
  // A colour-channel Link's sourceChannelRef `./2/353/113/111/{1,2,3}` reads these
  // RGB, and the source is usually a HIDDEN driver shape (Panels_Across's "Color
  // linker" is enabled=0 with the solid-fill bit CLEAR — findFillColor skips it —
  // yet its (0.737, 0.070, 0.141) fill is what feeds every Colorize accent). Kept
  // in a separate map so the strict Layer.shape.fillColor path (Lights/Flash) and
  // the gradient path (Heart) are undisturbed. Static values only for now (built-in
  // colour drivers all use static swatches — verified by inspecting the four T-A1
  // slugs).
  const linkColorSources = new Map<number, { r: number; g: number; b: number }>();
  {
    for (const node of Array.from(sceneEl.getElementsByTagName('scenenode'))) {
      const nid = parseInt(node.getAttribute('id') || '0', 10);
      if (!nid) continue;
      // Only shapes / generators carry a Fill Color; the getElementsByTagName scan
      // avoids deep nested Fill Color params (a filter's Remap folder also has
      // Red/Green/Blue children with different ids). We select by name+id.
      let fillColor: { r: number; g: number; b: number } | undefined;
      for (const p of Array.from(node.getElementsByTagName('parameter'))) {
        if (p.getAttribute('name') !== 'Fill Color' || p.getAttribute('id') !== '111') continue;
        // The FIRST Fill Color anywhere in this scenenode is the shape's own fill.
        // A shape with a nested mask (Circle Mask) would show the mask's Fill Color
        // second — the first-match rule captures the outer shape's colour.
        let r: number | undefined, g: number | undefined, b: number | undefined;
        for (const ch of directChildren(p, 'parameter')) {
          const nm = ch.getAttribute('name');
          const vAttr = ch.getAttribute('value');
          const dAttr = ch.getAttribute('default');
          const v = vAttr !== null ? parseFloat(vAttr) : (dAttr !== null ? parseFloat(dAttr) : NaN);
          if (isNaN(v)) continue;
          if (nm === 'Red') r = v;
          else if (nm === 'Green') g = v;
          else if (nm === 'Blue') b = v;
        }
        if (r !== undefined && g !== undefined && b !== undefined) {
          fillColor = { r, g, b };
          break;
        }
      }
      if (fillColor) linkColorSources.set(nid, fillColor);
    }
  }

  // 4. Parse the scene graph (layers + scenenodes under <scene>)
  const layers: Layer[] = [];
  for (const el of allDirectChildren(sceneEl)) {
    if (el.tagName === 'layer' || el.tagName === 'group') {
      layers.push(parseLayerElement(el, factories, clip, linkSourceIds, filtersById));
    } else if (el.tagName === 'scenenode') {
      const fid = parseInt(el.getAttribute('factoryID') || '0', 10);
      const ftype = factories.get(fid) || '';
      // Skip Project, Rig, Widget — they're metadata/control, not visual layers
      if (ftype !== 'Project' && ftype !== 'Rig' && ftype !== 'Widget') {
        layers.push(parseSceneNode(el, factories, clip, linkSourceIds, filtersById));
      }
    }
  }

  // Compute the animation end = max keyframe time across ALL curves in the scene.
  // progress=1 maps here, not to the full scene/playRange duration (which can run a
  // Compute the animation end = the time at which the transition's visible motion
  // finishes. This is the max keyframe time across ANIMATION curves — but we must
  // EXCLUDE retiming/cache curves ("Retime Value", "Retime Value Cache", "Duration
  // Cache"), whose keyframes extend one frame past the spatial animation (e.g.
  // 204204/120000) and, if used, sample past the drop-zones' timing-out and render
  // a black frame. progress=1 maps here, not to the padded scene/playRange duration.
  let animationEndSec = duration.value / duration.timescale;
  // True when animationEndSec came from the `maxOut` layer-timing fallback (no
  // within-span spatial keyframes) rather than a real keyframe. That fallback can
  // read an out-of-span `out` value; the span clamp below applies ONLY in that case.
  let usedMaxOutFallback = false;
  {
    const EXCLUDE_PARAMS = new Set([
      'Retime Value', 'Retime Value Cache', 'Duration Cache',
      // "Page Number" is the drop-zone media frame-index counter (next to Source
      // Media / Speed / Reverse / Time Remap). It shares the SAME keyframes as
      // "Retime Value Cache" (e.g. 0->1, 0.5339->17) and runs one frame past the
      // spatial animation; left in, progress=1 samples past the true visual end and
      // Motion wraps the drop zone back to source A. Blurs/Gaussian, Blurs/Directional,
      // Blurs/Radial, Blurs/Zoom all carry it. Excluding it lands progress=1 on pure B.
      'Page Number',
      // Shape stroke-profile curves parametrise along the STROKE LENGTH (normalized
      // 0..1), not along scene time. Their keypoints live at time=0 and time=1 and
      // would wrongly inflate the animation end to 1.0s for shape transitions
      // (e.g. Wipes/Diagonal, whose real spatial animation ends at ~0.267s).
      'Pressure Over Stroke', 'Pen Speed Over Stroke', 'Opacity Over Stroke',
      'Width Over Stroke', 'Color Over Stroke',
      // Filter INTENSITY curves ("Amount"/"Angle" on a blur/effect) animate the
      // strength of an effect, NOT the on-screen lifetime of the layer. For the
      // Blurs/* transitions the blur "Amount" keeps animating (to 0.5005s) after the
      // drop-zone media has already wrapped back to source A at the Opacity crossfade
      // end (0.4338s). Counting them overshoots the true visual end and the tail
      // frames render pure A. The layer lifetime is governed by transform/opacity/
      // geometry curves, which remain counted.
      'Amount', 'Angle',
      // "Preview Position" (X/Y under an emitter's Object block) is an EDITOR-ONLY
      // preview hint for where Motion draws the emitter's on-canvas control handle —
      // it is NOT a rendered animation curve. Movements/Drop In authors it on its
      // two Drop Impact particle emitters with keyframes out to 3.17s (the padded
      // scene duration), which wrongly inflates animationEndSec to 3.17s. The real
      // rendered content (the Transition A/B card bounce + retime crossfade) tops
      // out at ~1.50s, so counting Preview Position stretches the transition's time
      // domain ~2× and the bounce plays at half speed vs GT (which trims to the
      // black-onset visual end ~1.60s). Excluding it lands animationEndSec on the
      // true card lifetime. Editor-preview metadata, same class as Page Number.
      // (Matched as an ANCESTOR because the actual keyframe curves are its X/Y
      // sub-parameters, so the nearest owner name is 'X'/'Y', not 'Preview Position'.)
    ]);
    // Ancestor parameter names that mean "this curve is not live scene animation".
    // "Snapshots" holds rig-widget snapshot COPIES of filter params (e.g. a copy of
    // the Gaussian Blur "Amount"/"Angle" whose keyframes run to 0.5005s) that are
    // NOT the layer being rendered. If counted, they overshoot the true animation
    // end (the drop-zone Opacity crossfade at 0.4338s) and the render wraps to A.
    const EXCLUDE_ANCESTORS = new Set(['Snapshots', 'Preview Position']);
    // Walk curves, tracking the enclosing <parameter name=...> chain so we can skip
    // retiming curves and rig-snapshot subtrees. getElementsByTagName gives document
    // order; we resolve each curve's owning parameters by climbing parentNode.
    let maxT = 0;
    // Subtree-cache for the loop-container exemption below: for a given
    // scenenode/layer/group element, does its subtree contain ANY <curve
    // retimingExtrapolation="1">? Cached because the outer loop walks every curve
    // in the file and each curve queries every ancestor.
    // STRICT-DESCENDANT variant (T-qupover0001). A GENUINE loop container is a
    // GROUP/LAYER whose *child* nodes carry the retimingExtrapolation=1 loop and
    // whose sibling decorations (Ornaments) legitimately move in-sync past
    // sceneDur (Stylized__Loop's `Transition loop`/`Ornament`, Heart's
    // `Group 2 copy 3`: re=1 on descendant `arc`/`arc 3` drop zones, transform
    // curves on the enclosing group). A leaf IMAGE `scenenode` whose OWN
    // Retime Value is the ONLY re=1 in its subtree is NOT a loop — its re=1 is a
    // per-clip parallax retime, and its trailing Position/Scale keys (bg base /
    // bg overlay at 9.977s vs sceneDur 3.133s in Up-Over) are editor-leftover
    // artifacts that inflate animationEndSec ~3× and collapse the mid-transition
    // render (every mask envelope reads opacity-0 → drop-zone reveal never fires,
    // photo A held static the whole transition). So a node only qualifies as a
    // loop container for its OWN transform curves when a re=1 curve lives on a
    // PROPER DESCENDANT node (nearest enclosing scenenode/layer/group ≠ el),
    // never when the only re=1 is el's own self-retime. Verified: Loop/Heart keep
    // the exemption (re=1 on child drop zones); Up-Over's bg base/bg overlay lose
    // it (re=1 only on themselves) and get capped to sceneDur.
    const strictDescCache = new WeakMap<Element, boolean>();
    function subtreeHasLoopingCurveOnDescendant(el: Element): boolean {
      const cached = strictDescCache.get(el);
      if (cached !== undefined) return cached;
      const cs = (el as any).getElementsByTagName('curve') as HTMLCollectionOf<Element>;
      let has = false;
      for (let i = 0; i < cs.length; i++) {
        const c = cs.item(i);
        if (c?.getAttribute('retimingExtrapolation') !== '1') continue;
        // Climb from this re=1 curve to its nearest enclosing scenenode/layer/group.
        // If that owner is a PROPER descendant of el (i.e. not el itself), el is a
        // real loop container. If the owner IS el, this is el's own self-retime.
        let p: any = (c as any).parentNode;
        while (p && p.nodeType === 1) {
          if (p.tagName === 'scenenode' || p.tagName === 'layer' || p.tagName === 'group') {
            if (p !== el) has = true;
            break;
          }
          p = p.parentNode;
        }
        if (has) break;
      }
      strictDescCache.set(el, has);
      return has;
    }
    // Does `el` DIRECTLY carry a retimingExtrapolation=1 curve (the re=1 curve's
    // nearest enclosing scenenode/layer/group is el itself)? A leaf node that is
    // itself self-retimed — a background/media clip with its OWN Retime Value
    // (Up-Over's bg base / bg overlay, each a decorative <scenenode> image with a
    // re=1 Retime and trailing Position/Scale keys at 9.977s) — is NOT a loop
    // element that moves in sync with a container loop; its own transform curves
    // are editor-leftover artifacts and MUST be capped even though an ancestor
    // (the Background layer, which holds several such self-retimed siblings) looks
    // like a loop container. By contrast Loop's `Ornament` / Heart's
    // `Group 2 copy 3` carry NO direct re=1 (the re=1 lives on child drop zones)
    // and legitimately move with the loop → they stay exempt.
    const directRetimeCache = new WeakMap<Element, boolean>();
    function nodeDirectlyHasRetime(el: Element): boolean {
      const cached = directRetimeCache.get(el);
      if (cached !== undefined) return cached;
      // First: is this node itself directly self-retimed?
      let selfRetime = false;
      const cs = (el as any).getElementsByTagName('curve') as HTMLCollectionOf<Element>;
      for (let i = 0; i < cs.length; i++) {
        const c = cs.item(i);
        if (c?.getAttribute('retimingExtrapolation') !== '1') continue;
        let p: any = (c as any).parentNode;
        while (p && p.nodeType === 1) {
          if (p.tagName === 'scenenode' || p.tagName === 'layer' || p.tagName === 'group') {
            if (p === el) selfRetime = true;
            break;
          }
          p = p.parentNode;
        }
        if (selfRetime) break;
      }
      if (!selfRetime) { directRetimeCache.set(el, false); return false; }
      // CRUCIAL NARROWING (T-qupover0001): a self-retimed leaf that IS a Transition
      // A/B DROP ZONE (its `Source Media`, param id=300, resolves to an A/B footage
      // well) is the actual transition CONTENT — its self-retime + transform curves
      // are the real wipe/mask animation and legitimately extend past sceneDur
      // (Wipes__Mask's Transition A/B Width curves to 5.0s; Movements__Smear's
      // A/Drop-Zone). Those must STAY loop-exempt (return false). Only a DECORATIVE
      // self-retimed media leaf whose source is NOT an A/B well (Up-Over's bg
      // base/bg overlay — bundled background media) is a real artifact and returns
      // true (→ its transform curves get capped at sceneDur). The clip id lives in
      // the `value` attribute: <parameter name="Source Media" id="300" value="…"/>.
      let isABDropZone = false;
      const params = (el as any).getElementsByTagName('parameter') as HTMLCollectionOf<Element>;
      for (let i = 0; i < params.length; i++) {
        const pn = params.item(i);
        if (pn?.getAttribute('name') !== 'Source Media' || pn.getAttribute('id') !== '300') continue;
        const raw = pn.getAttribute('value') ?? pn.getAttribute('default') ?? '';
        const cid = parseInt(raw.trim().split(/\s+/)[0], 10);
        if (isFinite(cid) && clip.ab.has(cid)) { isABDropZone = true; break; }
      }
      const decorativeSelfRetime = !isABDropZone;
      directRetimeCache.set(el, decorativeSelfRetime);
      return decorativeSelfRetime;
    }

    const curves = Array.from(sceneEl.getElementsByTagName('curve'));
    for (const curve of curves) {
      // Collect the full chain of enclosing <parameter> names, and the nearest
      // enclosing <scenenode> so we can offset-adjust layer-local keyframe times.
      let node: any = (curve as any).parentNode;
      let ownerName = '';
      let skip = false;
      let nodeOffsetSec = 0;
      // BROAD SCENE-DURATION CAP (T-q29039791). FCP's authoring pipeline routinely
      // ships trailing keypoints that live FAR past the transition's <duration> —
      // Stylized__Close_and_Open's Camera Position X/Y/Z AND its `Top shapes`
      // layer's Position/Scale X/Y/Z sit at 3.470s while sceneDur=0.7s. If those
      // keys win the maxT walk, animationEndSec inflates ~5× and the whole
      // progress→time map is compressed, so mid-frames sample past every layer's
      // timing-out (drop zones die → empty frame). The safe cap: cap ANY curve's
      // contribution to maxT at sceneDurSec EXCEPT curves inside a "loop container"
      // — a scenenode/layer/group whose subtree contains at least one
      // retimingExtrapolation=1 curve. Retime-wrap semantics mean the layer's own
      // curves LEGITIMATELY loop past sceneDur (Stylized__Loop's `Transition loop`
      // group holds Loop/shape/Transition-A/B with re=1 and its Ornament sub-groups
      // author X/Y Position curves out to 5.54s — those must NOT be capped or the
      // rendered loop stalls). Compare directRE-only vs subtree: the direct-Retime
      // check misses the Ornament siblings (which don't have their own Retime but
      // move in-sync with the loop's wrap); the subtree check correctly exempts
      // every descendant of a container that holds any looping curve, and
      // correctly does NOT exempt Close_and_Open (its `Top shapes` layer contains
      // zero re=1 curves — only the sibling `Transition Drop Zones` layer has
      // re=1). Verified: exempts 10 Loop curves / caps 4 Close_and_Open curves
      // (Camera Z, Top shapes X/Y/Z). This is the T-q29039791 fix per the task
      // brief; the earlier Camera-only variant missed the `Top shapes` inflation.
      let insideLoopContainer = false;
      // T-qupover0001: does the curve's OWN nearest-enclosing node directly carry a
      // re=1 (self-retimed leaf, e.g. a background media clip)? Such a node's own
      // transform curves are never loop-exempt (see nodeDirectlyHasRetime). Set on
      // the first scenenode/layer/group the ancestor walk encounters.
      let curveOwnNodeSelfRetimed: boolean | undefined = undefined;
      // Camera-node local-frame re-anchor: a Camera scenenode with a LARGE-NEGATIVE
      // timeline offset authors its dolly/orientation curves in its own local time
      // frame (Motion places local-frame zero at `offset`). Light Sweep's Camera has
      // offset≈−17.6s and its Position keyframes live at LOCAL t≈18.9s → true scene
      // time ≈1.3s. Unlike the Shape flash-overlay case (small FORWARD offset), the
      // camera's is a big BACKWARD offset, so scene = local + offset. The evaluator
      // already renders the camera at this re-anchored time (its worldTransform is
      // built from the offset-shifted curveTime); the animationEndSec walk must match
      // or it reads raw local 18.9s and inflates the window 13× (→ render(0.5) samples
      // past every layer's `out` = a BLACK frame; Light Sweep scored 4.42). Captured
      // separately from nodeOffsetSec (which is the Shape forward-shift) so the two
      // never interfere. Fires structurally on ANY Camera with a local-frame offset
      // (a generic timing primitive, not a per-transition path).
      let camNegOffsetSec = 0;
      // Media-overlay local-frame re-anchor (screen/add/overlay/lighten media leaf
      // with negative offset + retime) — mirrors the evaluator's curveTime shift so
      // the animation window matches the render. See the Image branch below.
      let mediaOverlayNegOffsetSec = 0;
      // Generator local-frame re-anchor: a Generator scenenode (e.g. Color Solid,
      // Noise) with a NEGATIVE timeline offset authors its transform curves in its
      // own local time frame (Motion places local-frame zero at `offset`). Same class
      // as the Camera negative-offset case, but generators are decorative background
      // fills whose Z-Position/Rotation curves can run well past the true visual end.
      // Movements/Color Planes' "Color Solid" backdrop has offset≈−0.567s and its
      // Z-Position/Y-Rotation keys at LOCAL 2.369s → scene 1.802s (≈ the 1.867s span);
      // the walk read the RAW 2.369s and inflated the window 0.5s past the span, so the
      // additively-recombined RGB channel planes (offset ±154px at that end) over-
      // separated and the tail frames rendered BLACK (Color Planes f23 = 0,0,0 vs GT B).
      // Re-anchor scene = local + offset. Gated on a clearly backward offset (< −0.3s)
      // so a scene-time generator (offset ≈ 0) is untouched. Structural (factory +
      // negative offset), not a per-transition path.
      let genNegOffsetSec = 0;
      // Filter-local-frame re-anchor: a curve inside a <filter> animates on the
      // effect's own timeline, placed at the filter's `timing offset` (scene = local +
      // offset). Recorded when the ancestor walk climbs into a <filter> (see below).
      let filterOffsetSec = 0;
      while (node && node.nodeType === 1) {
        // Loop-container detection for the broad scene-duration cap (T-q29039791,
        // narrowed T-qupover0001). The ancestor is a scenenode/layer/group whose
        // subtree contains a retimingExtrapolation=1 curve on a PROPER DESCENDANT
        // node → this curve is part of a legitimate Retime-wrap loop and must NOT
        // be capped at sceneDur. The strict-descendant form (see
        // subtreeHasLoopingCurveOnDescendant) excludes a leaf image scenenode's
        // OWN self-retime from exempting its OWN transform curves — that pattern
        // (Up-Over's bg base/bg overlay: only re=1 is the node's own Retime Value,
        // trailing Position/Scale keys at 9.977s vs sceneDur 3.133s) is an editor
        // artifact, not a loop. Loop/Heart keep the exemption (re=1 on child drop
        // zones under the enclosing group).
        if (!insideLoopContainer
            && (node.tagName === 'scenenode' || node.tagName === 'layer' || node.tagName === 'group')
            && subtreeHasLoopingCurveOnDescendant(node as Element)) {
          insideLoopContainer = true;
        }
        // Record whether the curve's OWN owning node (first named node up the walk)
        // is a self-retimed leaf. A self-retimed node is never loop-exempt for its
        // own transform curves (T-qupover0001).
        if (curveOwnNodeSelfRetimed === undefined
            && (node.tagName === 'scenenode' || node.tagName === 'layer' || node.tagName === 'group')) {
          curveOwnNodeSelfRetimed = nodeDirectlyHasRetime(node as Element);
        }
        if (node.tagName === 'parameter') {
          const nm = node.getAttribute('name') || '';
          if (!ownerName) ownerName = nm; // nearest enclosing parameter
          if (EXCLUDE_ANCESTORS.has(nm)) { skip = true; break; }
          // Any "* Over Stroke" ANCESTOR parametrises along the shape's STROKE
          // LENGTH (normalized 0..1), NOT along scene time — keypoints live at
          // time 0 and 1 and would wrongly inflate the animation end to 1.0s. This
          // catches both the curve directly (Hidden Opacity/Angle/Spacing Over
          // Stroke) and X/Y sub-curves under a "Jitter Over Stroke" group. Present
          // on Lights/Flash's flash rectangles. Skip the whole family.
          if (nm.endsWith('Over Stroke')) { skip = true; break; }
        } else if (node.tagName === 'filter') {
          // A curve enclosed in a <filter> animates a FILTER PARAM on the effect's
          // OWN timeline, which is re-anchored by the filter's `timing offset` (Motion
          // places the filter-local zero at `offset` on the scene timeline: scene =
          // local + offset). Lights/Bloom's Bloom/Glow filters key Threshold/Softness/
          // Horizontal/Opacity out to filter-LOCAL t≈1.27s but carry offset≈−0.77s, so
          // the TRUE scene-time end is ≈0.50s (near the drop-zone death). The walk read
          // the RAW local time and inflated animationEndSec to 1.27s (2.5× the real 0.5s
          // scene/playRange duration), so render(progress)=progress·1.27 over-ran the
          // transition and every frame sampled far too late. Re-anchor scene = local +
          // filterOffset. (The filter curves are still evaluated live at the un-wrapped
          // scene time by the compositor — this only fixes the animation-window length.)
          const tEl = firstChild(node as Element, 'timing');
          const offAttr = tEl?.getAttribute('offset');
          if (offAttr) {
            const p = offAttr.trim().split(/\s+/);
            const v = parseFloat(p[0]);
            const s = p.length > 1 ? parseFloat(p[1]) : 1;
            if (s > 0 && isFinite(v)) filterOffsetSec = v / s;
          }
        } else if (node.tagName === 'scenenode' && nodeOffsetSec === 0) {
          // The nearest enclosing scenenode's timeline offset. Motion authors a
          // layer's animation curves in the layer's OWN local time frame, placed at
          // `offset` on the parent timeline (e.g. Lights/Flash's flash rectangle at
          // offset=0.133s, opacity keyed to local 0.167s → scene time 0.3s). To get
          // the true SCENE-time animation end, add the offset to the keyframe time.
          // SCOPED to filled-shape (Shape factory) nodes only — Motion drop-zone
          // IMAGE panels also carry an `offset` but their curves are already in
          // scene time (adding the offset would over-extend animationEndSec and
          // shift the mid/last-frame sampling, regressing many transitions). The
          // local-frame convention that needs this shift is the flash-overlay
          // filled shape.
          const fid = parseInt((node as Element).getAttribute('factoryID') || '0', 10);
          if (factories.get(fid) === 'Shape') {
            // Local-frame → scene-time offset shift, applied ONLY when the shape's
            // timeline is genuinely re-anchored FORWARD (offset > in). Lights/Flash
            // (offset 0.133 > in 0) and Stylized/Panels Random's driver (White line 1,
            // offset 1.268 > in 0) are forward-re-anchored and need the shift;
            // Panels_Across's Red bar (offset 0.367 < in 0.534) is NOT — shifting its
            // positive Position key (0.8008 + 0.367 = 1.168) would inflate the
            // animation end past the true visual end (0.8008s) and mis-sample the whole
            // transition. Combined with the rawSec ≥ 0 gate below (which keeps the
            // panels' deep-negative pre-roll keys from being shifted), this lands
            // Panels_Across at the correct 0.8008s end (9.45→28dB).
            const tEl = firstChild(node as Element, 'timing');
            const offAttr = tEl?.getAttribute('offset');
            const inAttr = tEl?.getAttribute('in');
            const parseRT = (a: string | null | undefined): number => {
              if (!a) return 0;
              const p = a.trim().split(/\s+/);
              const v = parseFloat(p[0]);
              const s = p.length > 1 ? parseFloat(p[1]) : 1;
              return s > 0 && isFinite(v) ? v / s : 0;
            };
            const offV = parseRT(offAttr);
            const inV = parseRT(inAttr);
            if (offAttr && offV - inV > 1e-3) nodeOffsetSec = offV;
          } else if (factories.get(fid) === 'Camera' && camNegOffsetSec === 0) {
            // Camera with a large-negative timeline offset → its curves are in a
            // local frame anchored at `offset`. Record it so the keyframe loop
            // re-anchors to scene time (scene = local + offset). Gated on a clearly
            // backward offset (< −1s) so an ordinary scene-time camera (offset ≈ 0)
            // is untouched.
            const tEl = firstChild(node as Element, 'timing');
            const offAttr = tEl?.getAttribute('offset');
            const parseRT = (a: string | null | undefined): number => {
              if (!a) return 0;
              const p = a.trim().split(/\s+/);
              const v = parseFloat(p[0]);
              const s = p.length > 1 ? parseFloat(p[1]) : 1;
              return s > 0 && isFinite(v) ? v / s : 0;
            };
            const offV = parseRT(offAttr);
            if (offAttr && offV < -1.0) camNegOffsetSec = offV;
          } else if (factories.get(fid) === 'Image' && mediaOverlayNegOffsetSec === 0) {
            // Media-overlay local-frame re-anchor: a screen/add/overlay/lighten-blended
            // media (Image) leaf whose timeline offset is NEGATIVE anchors its Opacity/
            // transform curves in the layer-local frame (local zero BEFORE scene zero).
            // This mirrors the EXACT signature the evaluator already re-anchors
            // (curveTime = timeSec − offset; evaluator/index.ts "blended (screen/add)
            // VIDEO overlay" — a media leaf with a screen/add/overlay/lighten Blend Mode
            // + a Retime curve). Lights/Light Noise's light-noise .mov has offset≈−0.734s
            // and its Opacity-fade keys at LOCAL 2.27–2.47s → scene 1.53–1.74s; the walk
            // read the RAW 2.469s (> the 1.733s span), landing the noise fade ~0.73s late
            // in the progress→time map so the burst lingered past the crossfade. Match the
            // evaluator: add the offset when the node carries a screen-family Blend Mode
            // value + a Retime Value curve. Structural (blend+retime+negoff), not a name.
            const tEl = firstChild(node as Element, 'timing');
            const parseRT2 = (a: string | null | undefined): number => {
              if (!a) return 0;
              const p = a.trim().split(/\s+/);
              const v = parseFloat(p[0]);
              const s = p.length > 1 ? parseFloat(p[1]) : 1;
              return s > 0 && isFinite(v) ? v / s : 0;
            };
            const offV = parseRT2(tEl?.getAttribute('offset'));
            if (offV < -1e-3) {
              // Confirm the screen/add-family blend (8=add, 9=lighten, 10=screen,
              // 14=overlay) + a Retime Value curve anywhere under this node.
              let blendVal: number | undefined;
              let hasRetime = false;
              const scan = (e: Element) => {
                for (const p of directChildren(e, 'parameter')) {
                  const nm = p.getAttribute('name');
                  if (nm === 'Blend Mode' && blendVal === undefined) {
                    const v = p.getAttribute('value') ?? p.getAttribute('default');
                    if (v != null) blendVal = parseInt(v, 10);
                  }
                  if (nm === 'Retime Value') hasRetime = true;
                  scan(p);
                }
              };
              scan(node as Element);
              const isScreenFamily = blendVal === 8 || blendVal === 9 || blendVal === 10 || blendVal === 14;
              if (isScreenFamily && hasRetime) mediaOverlayNegOffsetSec = offV;
            }
          } else if (factories.get(fid) === 'Generator' && genNegOffsetSec === 0) {
            // Generator with a negative timeline offset → its transform curves are in
            // a local frame anchored at `offset` (scene = local + offset). Only
            // Color Planes' Color Solid backdrop matches (off≈−0.567, curve to local
            // 2.369s → scene 1.802s ≈ span). Gated on offset < −0.3s so scene-time
            // generators (offset ≈ 0) are untouched.
            const tEl = firstChild(node as Element, 'timing');
            const offAttr = tEl?.getAttribute('offset');
            const parseRTg = (a: string | null | undefined): number => {
              if (!a) return 0;
              const p = a.trim().split(/\s+/);
              const v = parseFloat(p[0]);
              const s = p.length > 1 ? parseFloat(p[1]) : 1;
              return s > 0 && isFinite(v) ? v / s : 0;
            };
            const offVg = parseRTg(offAttr);
            if (offAttr && offVg < -0.3) genNegOffsetSec = offVg;
          }
        }
        node = node.parentNode;
      }
      if (skip) continue;
      if (EXCLUDE_PARAMS.has(ownerName)) continue;
      // NO-OP CURVE GUARD: a curve whose keyframe VALUES never change animates
      // nothing — it cannot define "when visible motion ends". Motion sometimes
      // authors such a curve with a trailing keyframe that sits PAST the scene's
      // authored duration (a leftover editor artifact), which then wins the maxT
      // walk and inflates animationEndSec far past the real motion end. That
      // stretches the progress→time map so the true animation is compressed into
      // the early frames and the tail holds a static frame.
      //   • Movements/Multi-flip: "Transition B" Rotation.Z runs 0.0→0.0003 (a
      //     ~0.017° no-op) with its last key at 1.568s, while the real card-flip
      //     (Clone Layer Rotation.X/Y) ends at 1.034s and the scene duration is
      //     1.167s. Native 1.568s freezes the flip on B by f16 (mean 12.1);
      //     capping the no-op at the scene duration (1.167s) lets the multi-flip
      //     play to f22 (mean 15.5, +3.4 dB).
      //   • Movements/Black_Hole: "Transition A" Scale.X/Y/Z hold a constant
      //     (0.0 value-range) with a key at 0.968s vs scene duration 0.667s; the
      //     real black-hole warp finishes within the duration. Cap → +0.6 dB.
      // A REAL animating curve is never capped (its value-range exceeds epsilon),
      // so scenes that legitimately animate past their nominal duration (e.g. the
      // many "OVER duration" spatial-curve slugs) are untouched. Census (all 65):
      // fires on exactly Multi-flip + Black_Hole. Same class of "not-live-
      // animation" exclusion as Retime/Preview/Snapshot, but keyed on the curve's
      // own value delta rather than a parameter name.
      let curveValueRange = 0;
      {
        let vMin = Infinity, vMax = -Infinity, nVals = 0;
        for (const kp of directChildren(curve as Element, 'keypoint')) {
          const vEl = firstChild(kp, 'value');
          if (!vEl || !vEl.textContent) continue;
          const vv = parseFloat(vEl.textContent.trim().split(/\s+/)[0]);
          if (!isFinite(vv)) continue;
          nVals++;
          if (vv < vMin) vMin = vv;
          if (vv > vMax) vMax = vv;
        }
        curveValueRange = nVals > 0 ? vMax - vMin : 0;
      }
      const isNoOpCurve = curveValueRange < 1e-3;
      const sceneDurSec = duration.value / duration.timescale;
      for (const kp of directChildren(curve as Element, 'keypoint')) {
        const timeEl = firstChild(kp, 'time');
        if (!timeEl || !timeEl.textContent) continue;
        const parts = timeEl.textContent.trim().split(/\s+/);
        const val = parseFloat(parts[0]);
        const scale = parts.length > 1 ? parseFloat(parts[1]) : 1;
        if (scale > 0 && isFinite(val)) {
          const rawSec = val / scale;
          // Offset-shift (local-frame → scene time) is a FLASH-OVERLAY signature and
          // is applied ONLY to an `Opacity` curve with a SMALL re-anchoring offset
          // (< 1.0s) whose RAW local time is ≥ 0. Rationale:
          //   • Lights/Flash authors its flash rectangle's OPACITY fade in the
          //     shape's OWN local time (opacity key at local 0.167s), placed at a
          //     small offset (0.1335s) on the parent timeline → true scene-time end
          //     0.3003s. Without the shift the end collapses to 0.1668s (raw), cutting
          //     the flash off mid-fade (Flash 24.98 → 17.56dB). So Flash NEEDS it.
          //   • The Stylized/Kinetic decorative panels (Lower's "panel wipe"/cyan/
          //     white panels) and the Stylized/Panels_Across sweep panels author their
          //     POSITION (X/Y/Z) sweeps — and some large-offset OPACITY fades — in
          //     SCENE time already, re-anchored by a LARGE offset (0.37s–6.5s). Adding
          //     that offset over-extends animationEndSec far past the true visual end
          //     (GT's animation_end_seconds does NO offset shift → raw-max = Lower
          //     2.336s, Panels_Across 0.801s), compressing the whole progress→time
          //     map and stalling the transition on source A. Gating the shift to
          //     small-offset Opacity curves lands the engine on GT's exact time
          //     domain for those (Lower 11.27 → 13.31, Panels_Across 14.60 → 18.80dB)
          //     while leaving Flash untouched.
          //   • A NEGATIVE raw key is pre-roll (authored before the shape's local
          //     zero); it can never extend maxT, so it is counted UNSHIFTED.
          const isFlashOverlay = ownerName === 'Opacity' && nodeOffsetSec < 1.0;
          const shiftAmt = isFlashOverlay ? nodeOffsetSec : 0;
          // Camera local-frame keys are ≥0 in the camera's own (backward-shifted)
          // frame; add its negative offset to land in scene time (e.g. Light Sweep
          // 18.886 + (−17.584) = 1.301s). Applied to the raw key regardless of sign
          // since a camera dolly key is not "pre-roll" the way a shape's negative key is.
          const camShifted = camNegOffsetSec !== 0 ? rawSec + camNegOffsetSec : null;
          // Screen/add media-overlay local frame → scene time: add its negative offset
          // (Light Noise 2.469 + (−0.734) = 1.735s), mirroring the evaluator's shift.
          const mediaShifted = mediaOverlayNegOffsetSec !== 0 ? rawSec + mediaOverlayNegOffsetSec : null;
          // Generator local frame → scene time: add its negative offset (Color Planes
          // Color Solid 2.369 + (−0.567) = 1.802s). Same class as the camera shift.
          const genShifted = genNegOffsetSec !== 0 ? rawSec + genNegOffsetSec : null;
          // Filter local frame → scene time: add the filter's `timing offset` (Bloom's
          // Threshold key at filter-local 1.2695 + offset(−0.7674) = scene 0.5021s, which
          // lands the animation window on the real 0.5s transition duration instead of the
          // raw 1.27s). Same class as the camera/generator negative-offset shifts.
          const filterShifted = filterOffsetSec !== 0 ? rawSec + filterOffsetSec : null;
          const sec = camShifted !== null
            ? camShifted
            : mediaShifted !== null
              ? mediaShifted
              : genShifted !== null
                ? genShifted
                : filterShifted !== null
                  ? filterShifted
                  : (rawSec >= 0 ? rawSec + shiftAmt : rawSec);
          // A no-op curve (no value change) may only extend the window up to the
          // authored scene duration — never past it (see NO-OP CURVE GUARD above).
          // T-q29039791: also apply the sceneDur cap to any REAL animating curve
          // that is NOT inside a loop container (see insideLoopContainer above).
          // FCP occasionally ships trailing keys past the transition's <duration>
          // (Close_and_Open Camera + `Top shapes` at 3.47s, sceneDur=0.7s) — those
          // are editor-leftover artifacts that inflate animationEndSec ~5× and
          // collapse the mid-transition render. Curves inside a loop container
          // (any ancestor scenenode/layer/group whose subtree holds a
          // retimingExtrapolation=1 curve — e.g. Stylized__Loop's `Transition
          // loop`) are exempted: their Retime-wrap semantics let them legitimately
          // run past sceneDur.
          // T-q29039791 / T-qupover0001: apply the sceneDur cap to any REAL animating
          // curve that is NOT genuinely loop-exempt. A curve is loop-exempt only when
          // (a) an ancestor is a real loop container (re=1 on a proper descendant) AND
          // (b) the curve's OWN owning node is NOT a self-retimed leaf. Condition (b)
          // caps Up-Over's bg base/bg overlay (self-retimed background scenenodes whose
          // trailing Position/Scale keys hit 9.977s vs sceneDur 3.133s) while keeping
          // Loop's Ornament / Heart's Group-2-copy-3 exempt (no direct re=1; they move
          // with a container loop).
          const loopExempt = insideLoopContainer && curveOwnNodeSelfRetimed !== true;
          const secCapped = (isNoOpCurve || !loopExempt)
            ? Math.min(sec, sceneDurSec)
            : sec;
          if (secCapped > maxT) maxT = secCapped;
        }
      }
    }
    if (maxT > 0) animationEndSec = maxT;
    else {
      // No spatial keyframes (e.g. Blurs/Zoom — motion is Retime + procedural
      // behaviors). The animation window is bounded by the transition's own layer
      // timing: the max <timing out=...> across all nodes. Past that, the drop-zone
      // layers time out and the frame goes empty. This is tighter than the padded
      // scene duration (durationFrames/frameRate) and matches what FCP renders.
      let maxOut = 0;
      const timings = Array.from(sceneEl.getElementsByTagName('timing'));
      for (const tEl of timings) {
        const outAttr = tEl.getAttribute('out');
        if (!outAttr) continue;
        const parts = outAttr.trim().split(/\s+/);
        const val = parseFloat(parts[0]);
        const scale = parts.length > 1 ? parseFloat(parts[1]) : 1;
        if (scale > 0 && isFinite(val)) {
          const sec = val / scale;
          if (sec > maxOut) maxOut = sec;
        }
      }
      if (maxOut > 0) { animationEndSec = maxOut; usedMaxOutFallback = true; }
    }
  }

  // Framing-camera scenes (factory-3 "Framing" behaviors) — animation-end domain.
  //
  // DECODED (2026-07-14, M-VIDEOWALL) — the authoritative animation window of a
  // framing transition is the max Framing-behavior <timing out=…> time, NOT any
  // keyframe curve. A framing behavior (e.g. Video_Wall's "Frame B") dollies the
  // camera across its own [in, out] timing window; the LAST behavior's `out` is the
  // moment the dolly finishes = the real end of the visible transition. Video_Wall's
  // two behaviors are "Frame framer" (out 7431424/7680000 = 0.9676s) and "Frame B"
  // (out 15119104/7680000 = 1.9686s) → animEnd = 1.9686s.
  //
  // The scene's ONLY spatial keyframe curves are the replicator tiles' normalized
  // stroke-profile curves keyed at normalized time 0..1 (a "Pressure Over Stroke"
  // family — parametrised along stroke LENGTH, not scene time), so the prior code
  // read fmax=1.0 and TRUNCATED the dolly to half its true length (the wall never
  // fully revealed; every mid/tail frame diverged from the GUI GT). Reading the
  // behavior `out` instead lands the progress→time map on the true 1.9686s window.
  //
  // This is a DECODED value from the graph's own behavior timing (no constant, no
  // per-slug logic) and fires only on scenes with a Framing behavior, so Flash and
  // every non-framing transition are untouched. Fires generically on all framing
  // scenes (Video_Wall, Clone_Spin, Combo_Spin, 3D_Rectangle, Concentric, …).
  {
    let framingOutMax = 0;
    for (const b of Array.from(sceneEl.getElementsByTagName('behavior'))) {
      const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
      if (factories.get(fid) !== 'Framing') continue;
      const tEl = firstChild(b as Element, 'timing');
      const outAttr = tEl?.getAttribute('out');
      if (!outAttr) continue;
      const parts = outAttr.trim().split(/\s+/);
      const val = parseFloat(parts[0]);
      const scl = parts.length > 1 ? parseFloat(parts[1]) : 1;
      if (scl > 0 && isFinite(val)) { const s = val / scl; if (s > framingOutMax) framingOutMax = s; }
    }
    if (framingOutMax > 0) {
      // Clamp to the authored scene span — a behavior `out` authored in a padded
      // editor timeline could exceed the rendered span (the GUI GT captures exactly
      // the span). Video_Wall's 1.9686s < 2.0s span, so it is used as-is.
      const spanSecF = duration.value / duration.timescale;
      animationEndSec = spanSecF > 0 ? Math.min(framingOutMax, spanSecF) : framingOutMax;
    }
  }

  // HARD INVARIANT (maxOut fallback only): when a scene has NO within-span spatial
  // keyframes (maxT==0 above — motion is Retime + procedural behaviors), the window
  // falls back to the max <timing out=…> across nodes. Some scenes carry a node whose
  // `out` sits FAR past the authored span (a Motion editor artifact — e.g. a hidden
  // Comp group or a replicator whose lifetime `out` is authored in a padded timeline),
  // which inflates animationEndSec many× the span. FCP plays the transition over
  // exactly the authored span (sceneSettings/duration ÷ frameRate; the GUI GT captures
  // exactly that many frames at t=(i/N)·span, fct.timing), so a fallback `out` LARGER
  // than the span is definitionally not the visible transition window — clamp it. This
  // rescues Combo_Spin / Squares / Video_Wall (no spatial keyframes → maxOut read 10-19s
  // → render(0.5) sampled past every layer's `out` = a frozen/black tail). It touches
  // ONLY the maxT==0 fallback path, so every keyframe-driven slug is unaffected.
  const spanSec = duration.value / duration.timescale;
  if (usedMaxOutFallback && spanSec > 0 && animationEndSec > spanSec) {
    animationEndSec = spanSec;
  }

  settings.animationEndSec = animationEndSec;

  // T-B1: build flat indexes of every parsed Emitter + Particle Cell in the scene,
  // and stamp each cell's `emitterId` with its enclosing Emitter's id (Motion
  // authors cells as direct scenenode children of an emitter — verified by XML
  // dump of Drop_In / Earthquake / Diagonal — but we walk recursively so a
  // future nested-emitter case still resolves correctly). Absent when the scene
  // has no emitter or no cell (leave the MotrScene fields undefined so consumers
  // can early-out on `!scene.emitters`).
  const emittersMap = new Map<number, EmitterParams>();
  const particleCellsMap = new Map<number, ParticleCellParams>();
  const walkForParticles = (ls: Layer[], enclosingEmitterId: number | undefined) => {
    for (const l of ls) {
      const emId = l.emitter ? l.emitter.id : enclosingEmitterId;
      if (l.emitter) emittersMap.set(l.emitter.id, l.emitter);
      if (l.particleCell) {
        if (l.particleCell.emitterId === undefined && enclosingEmitterId !== undefined) {
          l.particleCell.emitterId = enclosingEmitterId;
        }
        particleCellsMap.set(l.particleCell.id, l.particleCell);
      }
      if (l.children.length > 0) walkForParticles(l.children, emId);
    }
  };
  walkForParticles(layers, undefined);
  const emitters = emittersMap.size > 0 ? emittersMap : undefined;
  const particleCells = particleCellsMap.size > 0 ? particleCellsMap : undefined;

  return { settings, layers, factories, rigWidgets, rigBehaviors, sceneBehaviors, linkColorSources, emitters, particleCells };
}