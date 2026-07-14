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
import { parseShape, findObjectSource } from './shapes.js';
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
): void {
  // FLAG-GATED (FCT_PROCMASK, default OFF). The procedural shape-mask matte is a
  // BUILT + VERIFIED intermediate, but NOT yet a net win on the GUI-GT gate: the
  // instantaneous shape mask reveals then RETREATS (a finite quad sweeps ACROSS
  // the frame and exits), whereas FCP's reveal is a MONOTONIC write-on (once a
  // pixel is revealed by the sweep it STAYS revealed — the greenness grid sweeps
  // BL→TR and never retreats; decoded 2026-07-14). Enabling it as-is regresses the
  // Diagonal pair −0.47 dB (11.39→10.92), so it stays OFF until the write-on
  // temporal accumulation (max-over-time of the mask alpha) lands on top of it.
  // The parse+feather+lift infrastructure below is correct and reused by that
  // next step. Default OFF ⇒ byte-identical to the shipped baseline (gate green).
  if (typeof process === 'undefined' || process.env?.FCT_PROCMASK !== '1') return;
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
    if (!mshape || !mshape.isMask || mshape.verticesX.length < 3) continue;
    const maskParams: Parameter[] = [];
    for (const mp of directChildren(maskEl, 'parameter')) maskParams.push(parseParameter(mp));
    out.push({
      id: parseInt(maskEl.getAttribute('id') || '0', 10),
      name: maskEl.getAttribute('name') || 'Procedural Mask',
      type: 'shape',
      transform: extractTransform(maskParams),
      blendMode: 'normal',
      filters: [],
      children: [],
      shape: mshape,
      timing: parseTiming(maskEl),
      behaviors: parseLayerBehaviors(maskEl, factories),
    });
  }
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
    filters.push({ id: filterId, name: nodeName, pluginName, pluginUUID, parameters: filterParams });
  }

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
  // `Mask Source` (id=1, nested under Object(2)/Mask(100)) references the shape or
  // group supplying the alpha. This masks ONLY this layer (distinct from the
  // "Masks"-group sibling-clip convention). Capture the referenced object ID so
  // the compositor can rasterize it and clip this layer's alpha.
  let imageMaskSourceId: number | undefined;
  let imageMaskInvert = false;
  for (const maskEl of directChildren(el, 'mask')) {
    // Find the Mask Source parameter anywhere within this mask node.
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
      imageMaskSourceId = src;
      // Invert Mask (id=102): when 1, the mask alpha is inverted (Objects/Veil
      // reveals B where the wipe-matte luma is DARK). Read from the same mask node.
      for (const p of Array.from(maskEl.getElementsByTagName('parameter'))) {
        if (p.getAttribute('name') === 'Invert Mask') {
          const v = p.getAttribute('value');
          if (v !== null && parseInt(v, 10) === 1) imageMaskInvert = true;
        }
        // Mask Blend Mode (id=103): default (absent/0) = the mask KEEPS the layer
        // inside the shape (intersect); value 1 = SUBTRACT — the shape region is
        // CUT OUT of the layer (holes), i.e. the layer shows everywhere EXCEPT the
        // shape. Objects/Arrows uses mode 1 so its growing arrow arcs cut holes in
        // the on-top A layer, revealing the base B beneath. Subtract ≡ invert the
        // rasterized alpha. Wipes/Mask has no Mask Blend Mode (default) so it is
        // unaffected.
        if (p.getAttribute('name') === 'Mask Blend Mode' && p.getAttribute('id') === '103') {
          const v = p.getAttribute('value');
          if (v !== null && parseInt(v, 10) === 1) imageMaskInvert = true;
        }
      }
      break;
    }
  }

  // PROCEDURAL (source-less) SHAPE MASK — S8. Lift a `<mask>` child that draws its
  // own alpha (no Mask Source) into a mask-shape child so the compositor clips this
  // node's content. SCOPED to non-clone nodes (clones handle their self-mask above);
  // see liftProceduralMasks for the full rationale + regression scar.
  if (type !== 'clone') liftProceduralMasks(el, factories, linkSourceIds, children);

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

  // PROCEDURAL (source-less) SHAPE MASK — S8. A `<mask>` authored as a DIRECT CHILD
  // of a <layer>/<group> (a sibling of the content it clips) is a layer-level mask
  // in Motion. The child-element loop above only handles scenenode/layer/group/filter
  // and would silently DROP it, leaving the content UNMASKED (Wipes/Diagonal's
  // "Animated mask" sweeps its sibling "Gradient and background" group). Lift it into
  // a mask-shape child so renderChildLayers clips this layer's content. See
  // liftProceduralMasks for the full rationale + the FCT_LIFT_ALL_MASKS regression scar.
  liftProceduralMasks(el, factories, linkSourceIds, children);

  return {
    name: el.getAttribute('name') || '',
    id: parseInt(el.getAttribute('id') || '0', 10),
    type: 'group',
    transform: extractTransform(params),
    blendMode: extractBlendMode(params),
    filters,
    children,
    timing: parseTiming(el),
    enabled: (() => { const t = getTextContent(el, 'enabled'); return t === null ? true : t.trim() !== '0'; })(),
    links: parseLinkBehaviors(el, factories, filtersById),
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
    const curves = Array.from(sceneEl.getElementsByTagName('curve'));
    for (const curve of curves) {
      // Collect the full chain of enclosing <parameter> names, and the nearest
      // enclosing <scenenode> so we can offset-adjust layer-local keyframe times.
      let node: any = (curve as any).parentNode;
      let ownerName = '';
      let skip = false;
      let nodeOffsetSec = 0;
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
      while (node && node.nodeType === 1) {
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
          const sec = camShifted !== null
            ? camShifted
            : mediaShifted !== null
              ? mediaShifted
              : genShifted !== null
                ? genShifted
                : (rawSec >= 0 ? rawSec + shiftAmt : rawSec);
          // A no-op curve (no value change) may only extend the window up to the
          // authored scene duration — never past it (see NO-OP CURVE GUARD above).
          const secCapped = isNoOpCurve ? Math.min(sec, sceneDurSec) : sec;
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
  // These scenes carry NO scene-time spatial keyframes; their motion is the
  // render-time Framing dolly plus the replicator tiles' normalized stroke-profile
  // curves (keyed at normalized time 0..1). The blanket "Over Stroke" exclusion
  // above (needed so Lights/Flash's flash-shape stroke curves don't inflate its end)
  // drops those, so the walk falls back to the padded scene duration — far past the
  // real transition window. The headless GT renderer counts those
  // normalized curves, landing animation_end at the max non-retime keyframe. Mirror
  // that HERE, scoped to Framing scenes: take the max keyframe across all curves
  // EXCEPT the retime/page caches (still excluded). This reads the value from the
  // graph's own keyframes — no constant — and only affects scenes with a Framing
  // behavior (so Flash and every non-framing transition are untouched).
  {
    let hasFraming = false;
    for (const b of Array.from(sceneEl.getElementsByTagName('behavior'))) {
      const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
      if (factories.get(fid) === 'Framing') { hasFraming = true; break; }
    }
    if (hasFraming) {
      const RETIME_ONLY = new Set(['Retime Value', 'Retime Value Cache', 'Duration Cache', 'Page Number']);
      let fmax = 0;
      for (const curve of Array.from(sceneEl.getElementsByTagName('curve'))) {
        let node: any = (curve as any).parentNode;
        let ownerName = '';
        let skip = false;
        while (node && node.nodeType === 1) {
          if (node.tagName === 'parameter') {
            const nm = node.getAttribute('name') || '';
            if (!ownerName) ownerName = nm;
            if (nm === 'Snapshots') { skip = true; break; }
          }
          node = node.parentNode;
        }
        if (skip || RETIME_ONLY.has(ownerName)) continue;
        for (const kp of directChildren(curve as Element, 'keypoint')) {
          const timeEl = firstChild(kp, 'time');
          if (!timeEl || !timeEl.textContent) continue;
          const parts = timeEl.textContent.trim().split(/\s+/);
          const val = parseFloat(parts[0]);
          const scl = parts.length > 1 ? parseFloat(parts[1]) : 1;
          if (scl > 0 && isFinite(val)) { const s = val / scl; if (s > fmax) fmax = s; }
        }
      }
      if (fmax > 0) animationEndSec = fmax;
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