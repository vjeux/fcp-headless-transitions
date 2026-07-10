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
  Parameter, Transform, Filter, ImageSource, BlendMode, RigWidget, RigBehavior, Shape, Replicator, SequenceReplicator, LayerBehavior, SceneBehavior, LinkBehavior, GaussianGradientConfig, FramingBehavior
} from '../types.js';

// XML/DOM + time/keyframe/curve/parameter helpers live in ./xml.ts
import {
  parseXML, directChildren, allDirectChildren, firstChild,
  getTextContent, getIntContent, getFloatContent,
  parseTime, parseTiming, parseKeyframe, parseCurve, parseParameter, findDescendant,
} from './xml.js';
import { parseShape, findObjectSource } from './shapes.js';
import { parseLayerBehaviors, parseLinkBehaviors } from './behaviors.js';
import { parseReplicator } from './replicator.js';
import { parseRigWidgets, parseRigBehaviors, parseSceneBehaviors } from './rig.js';
import { parseFootageClipAB, determineImageSource, parseDropZone } from './footage.js';
import type { ClipInfo } from './footage.js';

/**
 * PC_BLEND_* enum → BlendMode name.
 *
 * Reverse-engineered from ProCore.framework's ordered PC_BLEND string table
 * (__TEXT,__cstring). The integer values of the .motr "Blend Mode" parameter
 * (id=203 or 227) index directly into this table — SEPARATOR entries occupy
 * indices too (that's why Add=8 not 5, Overlay=14 not 11, etc.).
 *
 * Ordered table (index : PC_BLEND name):
 *   0 NORMAL, 1 SEPARATOR0, 2 SUBTRACT, 3 DARKEN, 4 MULTIPLY, 5 COLOR_BURN,
 *   6 LINEAR_BURN, 7 SEPARATOR1, 8 ADD, 9 LIGHTEN, 10 SCREEN, 11 COLOR_DODGE,
 *   12 LINEAR_DODGE, 13 SEPARATOR2, 14 OVERLAY, 15 SOFT_LIGHT, 16 HARD_LIGHT,
 *   17 VIVID_LIGHT, 18 LINEAR_LIGHT, 19 PIN_LIGHT, 20 HARD_MIX, 21 SEPARATOR3,
 *   22 DIFFERENCE, 23 EXCLUSION, 24 SEPARATOR4, 25 STENCIL_ALPHA,
 *   26 STENCIL_LUMA, 27 SILHOUETTE_ALPHA, 28 SILHOUETTE_LUMA, 29 BEHIND,
 *   30 SEPARATOR5, 31 ALPHA_ADD, 32 LUMINESCENT_PREMUL, 33 SEPARATOR6,
 *   34 COMBINE, 35 LIGHT_WRAP
 *
 * Confirmed: value 28 (Silhouette Luma) on 360° Push measurably improves PSNR.
 * Every blend value observed across the built-in transitions (0,4,5,8,10,14,
 * 15,16,17,25,27,28,34) lands on a real (non-separator) mode.
 */
const BLEND_MODE_ENUM: Record<number, BlendMode> = {
  0: 'normal',
  2: 'subtract',
  3: 'darken',
  4: 'multiply',
  5: 'colorBurn',
  6: 'linearBurn',
  8: 'add',
  9: 'lighten',
  10: 'screen',
  11: 'colorDodge',
  12: 'linearDodge',
  14: 'overlay',
  15: 'softLight',
  16: 'hardLight',
  17: 'vividLight',
  18: 'linearLight',
  19: 'pinLight',
  20: 'hardMix',
  22: 'difference',
  23: 'exclusion',
  25: 'stencilAlpha',
  26: 'stencilLuma',
  27: 'silhouetteAlpha',
  28: 'silhouetteLuma',
  29: 'behind',
  31: 'alphaAdd',
  32: 'luminescentPremul',
  34: 'combine',
  35: 'lightWrap',
};

/**
 * Extract the layer Blend Mode from its parameter tree.
 * Lives at Properties(id=1) > Blending(id=200) > Blend Mode(id=203 or 227).
 * Returns 'normal' when absent or when the value maps to an unknown/separator index.
 */
function extractBlendMode(params: Parameter[]): BlendMode {
  function find(ps: Parameter[]): number | undefined {
    for (const p of ps) {
      if (p.name === 'Blend Mode' && (p.id === 203 || p.id === 227) && typeof p.value === 'number') {
        return p.value;
      }
      if (p.children) {
        const r = find(p.children);
        if (r !== undefined) return r;
      }
    }
    return undefined;
  }
  const v = find(params);
  if (v === undefined) return 'normal';
  // Test/ablation hook: FCT_DISABLE_BLEND forces source-over to measure the
  // blend-mode delta. Never set in normal operation.
  if (typeof process !== 'undefined' && process.env?.FCT_DISABLE_BLEND) return 'normal';
  return BLEND_MODE_ENUM[v] ?? 'normal';
}


// ============================================================================
// Transform Extraction
// ============================================================================

/**
 * Extract transform values from a parameter tree.
 * Motion's standard layout:
 *   Properties (id=1)
 *     Transform (id=100)
 *       Position (id=101): X(1), Y(2), Z(3)
 *       Rotation (id=102): X(1), Y(2), Z(3) [or single value for 2D]
 *       Scale (id=103): X(1)=%, Y(2)=%, Z(3)=%
 *       Anchor Point (id=106): X(1), Y(2), Z(3)
 *       Shear (id=105): X(1), Y(2)
 *     Blending (id=200)
 *       Opacity (id=202): value 0-100
 *     Crop (id=500)
 *       Left(1), Right(2), Top(3), Bottom(4)
 */
function extractRetimeValue(params: Parameter[]): Curve | undefined {
  // Retime Value is at params > Properties > Retime Value (id=304 typically)
  function findCurve(ps: Parameter[], name: string): Curve | undefined {
    for (const p of ps) {
      if (p.name === name && p.curve) return p.curve;
      if (p.children) {
        const found = findCurve(p.children, name);
        if (found) return found;
      }
    }
    return undefined;
  }
  return findCurve(params, 'Retime Value');
}

function extractTransform(params: Parameter[]): Transform {
  const tx: Transform = {};

  function findParam(params: Parameter[], name: string, id?: number): Parameter | undefined {
    for (const p of params) {
      if (p.name === name && (id === undefined || p.id === id)) return p;
      if (p.children) {
        const found = findParam(p.children, name, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  function getAnimValue(params: Parameter[], name: string, id?: number): Curve | number | undefined {
    const p = findParam(params, name, id);
    if (!p) return undefined;
    if (p.curve) return p.curve;
    if (typeof p.value === 'number') return p.value;
    return undefined;
  }

  // Position
  const posParam = findParam(params, 'Position');
  if (posParam?.children) {
    tx.positionX = getAnimValue(posParam.children, 'X') ?? getAnimValue(posParam.children, 'X', 1);
    tx.positionY = getAnimValue(posParam.children, 'Y') ?? getAnimValue(posParam.children, 'Y', 2);
    tx.positionZ = getAnimValue(posParam.children, 'Z') ?? getAnimValue(posParam.children, 'Z', 3);
  }

  // Rotation
  const rotParam = findParam(params, 'Rotation');
  if (rotParam?.children) {
    tx.rotationZ = getAnimValue(rotParam.children, 'Z') ?? getAnimValue(rotParam.children, 'Z', 3);
    tx.rotationX = getAnimValue(rotParam.children, 'X') ?? getAnimValue(rotParam.children, 'X', 1);
    tx.rotationY = getAnimValue(rotParam.children, 'Y') ?? getAnimValue(rotParam.children, 'Y', 2);
  } else if (rotParam) {
    // Single rotation value = Z rotation
    tx.rotationZ = rotParam.curve ?? (typeof rotParam.value === 'number' ? rotParam.value : undefined);
  }

  // Scale (in percent)
  const scaleParam = findParam(params, 'Scale');
  if (scaleParam?.children) {
    tx.scaleX = getAnimValue(scaleParam.children, 'X') ?? getAnimValue(scaleParam.children, 'X', 1);
    tx.scaleY = getAnimValue(scaleParam.children, 'Y') ?? getAnimValue(scaleParam.children, 'Y', 2);
    tx.scaleZ = getAnimValue(scaleParam.children, 'Z') ?? getAnimValue(scaleParam.children, 'Z', 3);
  }

  // Anchor Point
  const anchorParam = findParam(params, 'Anchor Point');
  if (anchorParam?.children) {
    tx.anchorX = getAnimValue(anchorParam.children, 'X') ?? getAnimValue(anchorParam.children, 'X', 1);
    tx.anchorY = getAnimValue(anchorParam.children, 'Y') ?? getAnimValue(anchorParam.children, 'Y', 2);
    tx.anchorZ = getAnimValue(anchorParam.children, 'Z') ?? getAnimValue(anchorParam.children, 'Z', 3);
  }

  // Opacity (0-100 in Motion → 0-1 for compositing). The layer's own opacity is
  // ALWAYS the Properties param id=202. Constrain by id so we don't accidentally
  // grab a nested "Opacity" (e.g. Drop Shadow > Opacity id=211, default 0.75),
  // which would darken the whole layer.
  const opacityParam = findParam(params, 'Opacity', 202);
  if (opacityParam) {
    tx.opacity = opacityParam.curve ?? (typeof opacityParam.value === 'number' ? opacityParam.value : undefined);
  }

  // Crop
  const cropParam = findParam(params, 'Crop');
  if (cropParam?.children) {
    tx.cropLeft = getAnimValue(cropParam.children, 'Left') ?? getAnimValue(cropParam.children, 'Left', 1);
    tx.cropRight = getAnimValue(cropParam.children, 'Right') ?? getAnimValue(cropParam.children, 'Right', 2);
    tx.cropTop = getAnimValue(cropParam.children, 'Top') ?? getAnimValue(cropParam.children, 'Top', 3);
    tx.cropBottom = getAnimValue(cropParam.children, 'Bottom') ?? getAnimValue(cropParam.children, 'Bottom', 4);
  }

  return tx;
}

// ============================================================================
// Layer Parsing
// ============================================================================


function parseSceneNode(el: Element, factories: Map<number, string>, clip: ClipInfo, linkSourceIds: Set<number>): Layer {
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
      children.push(parseSceneNode(childNode, factories, clip, linkSourceIds));
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
    dropZone: type === 'image' ? parseDropZone(params) : undefined,
    hasAlignTo: directChildren(el, 'behavior').some(
      b => parseInt(b.getAttribute('factoryID') || '0', 10) === 22
        || factories.get(parseInt(b.getAttribute('factoryID') || '0', 10)) === 'Align To'
    ),
    links: parseLinkBehaviors(el, factories),
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
 * Extract the Camera node's projection parameters. Motion's Camera stores
 * "Angle Of View" (param id 201) in degrees inside its Object param (id 2).
 * The vertical field of view feeds gluPerspective (verified by decompiling
 * Lithium's PCMatrix44Tmpl<double>::setGLPerspective — fovy in degrees).
 *
 * Some transitions rig-drive the AOV via a "Rig Behavior" whose Snapshots hold
 * per-widget AOV values (channelBehavior affectingChannel=".../201"). We capture
 * both the static default and the snapshot list so the evaluator can resolve the
 * active value from the selected widget index.
 */
function parseCameraParams(
  el: Element,
  params: Parameter[],
  factories: Map<number, string>
): { angleOfView: number; aovSnapshots?: number[]; aovWidgetId?: number; aovDefault?: number; framing?: FramingBehavior[] } {
  // Find "Angle Of View" (id 201) in the param tree.
  let aov = 45; // Motion default
  const findAOV = (ps: Parameter[]): number | undefined => {
    for (const p of ps) {
      if (p.name === 'Angle Of View' && p.id === 201) {
        if (typeof p.value === 'number') return p.value;
        if (p.curve && typeof p.curve.value === 'number') return p.curve.value;
      }
      if (p.children) { const r = findAOV(p.children); if (r !== undefined) return r; }
    }
    return undefined;
  };
  const found = findAOV(params);
  if (found !== undefined) aov = found;

  // Look for a Rig Behavior on the camera driving the AOV via snapshots.
  let aovSnapshots: number[] | undefined;
  let aovWidgetId: number | undefined;
  for (const behEl of directChildren(el, 'behavior')) {
    const cb = findDescendant(behEl, 'channelBehavior');
    const ch = cb?.getAttribute('affectingChannel') || '';
    if (!ch.endsWith('/201')) continue; // this rig drives the AOV channel
    // Widget the behavior reads from (param id 200 "Widget")
    for (const p of Array.from(behEl.getElementsByTagName('parameter'))) {
      if (p.getAttribute('name') === 'Widget' && p.getAttribute('id') === '200') {
        const v = p.getAttribute('value'); if (v) aovWidgetId = parseFloat(v);
      }
    }
    // Snapshots: each holds an "Angle Of View" curve/value.
    const snaps: Array<{ idx: number; val: number }> = [];
    const snapContainer = Array.from(behEl.getElementsByTagName('parameter'))
      .find(p => p.getAttribute('name') === 'Snapshots' && p.getAttribute('id') === '202');
    if (snapContainer) {
      for (const sp of directChildren(snapContainer, 'parameter')) {
        if (sp.getAttribute('name') !== 'Angle Of View') continue;
        const idx = parseInt(sp.getAttribute('id') || '0', 10);
        const curve = findDescendant(sp, 'curve');
        const val = curve ? parseFloat(curve.getAttribute('value') || 'NaN') : NaN;
        if (!isNaN(val)) snaps.push({ idx, val });
      }
    }
    if (snaps.length > 0) {
      // Snapshot ids are 1-based; order them by id so index N-1 → snapshot N.
      snaps.sort((a, b) => a.idx - b.idx);
      aovSnapshots = snaps.map(s => s.val);
    }
  }

  return { angleOfView: aov, aovSnapshots, aovWidgetId, aovDefault: aov, framing: parseFramingBehaviors(el, factories) };
}

/**
 * Parse Framing behaviors (factory 3, "Framing") attached to the Camera node.
 * Each drives the camera to frame its Target object's world bbox over its
 * timing window. Values are read from the behavior's direct parameters (ids
 * 200/204/206/207/209/210/211/213). See OZScene::computeFraming and framing.ts.
 */
function parseFramingBehaviors(el: Element, factories: Map<number, string>): FramingBehavior[] | undefined {
  const out: FramingBehavior[] = [];
  for (const b of directChildren(el, 'behavior')) {
    const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
    if (factories.get(fid) !== 'Framing') continue;
    // Direct scalar param by id.
    const num = (id: number, def: number): number => {
      for (const p of directChildren(b, 'parameter')) {
        if (parseInt(p.getAttribute('id') || '-1', 10) === id) {
          const v = p.getAttribute('value');
          if (v !== null) { const n = parseFloat(v); if (!isNaN(n)) return n; }
        }
      }
      return def;
    };
    // Vector param (X/Y/Z children of a container param id).
    const vec = (id: number): { x: number; y: number; z: number } => {
      const r = { x: 0, y: 0, z: 0 };
      for (const p of directChildren(b, 'parameter')) {
        if (parseInt(p.getAttribute('id') || '-1', 10) !== id) continue;
        for (const c of directChildren(p, 'parameter')) {
          const cid = parseInt(c.getAttribute('id') || '0', 10);
          const v = c.getAttribute('value'); if (v === null) continue;
          const n = parseFloat(v); if (isNaN(n)) continue;
          if (cid === 1) r.x = n; else if (cid === 2) r.y = n; else if (cid === 3) r.z = n;
        }
      }
      return r;
    };
    out.push({
      targetId: num(200, 0),
      framingOffset: vec(204),
      apex: num(206, 0.5),
      pathOffset: vec(207),
      positionTransitionTime: num(209, 0.5),
      rotationTransitionTime: num(210, 0.5),
      transition: num(211, 0),
      easeOutCurve: num(213, 10),
      timing: parseTiming(b),
    });
  }
  return out.length > 0 ? out : undefined;
}

/**
 * Parse a <layer> element (a group that contains scenenodes).
 */
function parseLayerElement(el: Element, factories: Map<number, string>, clip: ClipInfo, linkSourceIds: Set<number>): Layer {
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
        filters.push({ id: filterId, pluginName, pluginUUID, parameters: filterParams });
      } else {
        children.push(parseSceneNode(childEl, factories, clip, linkSourceIds));
      }
    } else if (childEl.tagName === 'layer' || childEl.tagName === 'group') {
      children.push(parseLayerElement(childEl, factories, clip, linkSourceIds));
    } else if (childEl.tagName === 'filter') {
      // Filter elements (blur, color, etc.)
      const filterId = parseInt(childEl.getAttribute('id') || '0', 10);
      const pluginName = childEl.getAttribute('pluginName') || childEl.getAttribute('name') || '';
      const pluginUUID = childEl.getAttribute('pluginUUID') || '';
      const filterParams: Parameter[] = [];
      for (const fp of directChildren(childEl, 'parameter')) {
        filterParams.push(parseParameter(fp));
      }
      filters.push({ id: filterId, pluginName, pluginUUID, parameters: filterParams });
    }
  }

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
    links: parseLinkBehaviors(el, factories),
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

  // 4. Parse the scene graph (layers + scenenodes under <scene>)
  const layers: Layer[] = [];
  for (const el of allDirectChildren(sceneEl)) {
    if (el.tagName === 'layer' || el.tagName === 'group') {
      layers.push(parseLayerElement(el, factories, clip, linkSourceIds));
    } else if (el.tagName === 'scenenode') {
      const fid = parseInt(el.getAttribute('factoryID') || '0', 10);
      const ftype = factories.get(fid) || '';
      // Skip Project, Rig, Widget — they're metadata/control, not visual layers
      if (ftype !== 'Project' && ftype !== 'Rig' && ftype !== 'Widget') {
        layers.push(parseSceneNode(el, factories, clip, linkSourceIds));
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
          }
        }
        node = node.parentNode;
      }
      if (skip) continue;
      if (EXCLUDE_PARAMS.has(ownerName)) continue;
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
          const sec = rawSec >= 0 ? rawSec + shiftAmt : rawSec;
          if (sec > maxT) maxT = sec;
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
      if (maxOut > 0) animationEndSec = maxOut;
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

  settings.animationEndSec = animationEndSec;

  return { settings, layers, factories, rigWidgets, rigBehaviors, sceneBehaviors };
}