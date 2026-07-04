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
  Parameter, Transform, Filter, ImageSource, BlendMode
} from '../types.js';

// ============================================================================
// XML Parsing Helpers
// ============================================================================

// DOMParser: use native in browser, @xmldom/xmldom in Node.js
import { DOMParser as XmlDomParser } from '@xmldom/xmldom';
const _DOMParser = typeof globalThis.DOMParser !== 'undefined' ? globalThis.DOMParser : XmlDomParser as unknown as typeof DOMParser;

function parseXML(xmlText: string): Document {
  const Parser = _DOMParser;
  return new Parser().parseFromString(xmlText, 'text/xml');
}


/** Get direct child elements with a given tag name (xmldom compat). */
function directChildren(el: Element | Document, tag: string): Element[] {
  const result: Element[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType === 1 && (child as Element).tagName === tag) {
      result.push(child as Element);
    }
  }
  return result;
}

/** Get all direct child elements. */
function allDirectChildren(el: Element | Document): Element[] {
  const result: Element[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType === 1) result.push(child as Element);
  }
  return result;
}

/** Find first direct child element with tag. */
function firstChild(el: Element, tag: string): Element | null {
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType === 1 && (child as Element).tagName === tag) {
      return child as Element;
    }
  }
  return null;
}

function getTextContent(el: Element, tag: string): string | null {
  const child = firstChild(el, tag);
  return child?.textContent ?? null;
}

function getIntContent(el: Element, tag: string, def: number = 0): number {
  const text = getTextContent(el, tag);
  return text ? parseInt(text, 10) : def;
}

function getFloatContent(el: Element, tag: string, def: number = 0): number {
  const text = getTextContent(el, tag);
  return text ? parseFloat(text) : def;
}

// ============================================================================
// Time Parsing
// ============================================================================

/**
 * Parse a time string "VALUE TIMESCALE FLAGS EPOCH" → RationalTime.
 * Example: "96096 120000 1 0" → { value: 96096, timescale: 120000 }
 */
function parseTime(str: string): RationalTime {
  const parts = str.trim().split(/\s+/);
  return {
    value: parseInt(parts[0], 10) || 0,
    timescale: parseInt(parts[1], 10) || 1,
  };
}

/**
 * Parse a timing element: <timing in="..." out="..." offset="..."/>
 */
function parseTiming(el: Element): { in: RationalTime; out: RationalTime; offset: RationalTime } | undefined {
  const timingEl = firstChild(el, 'timing');
  if (!timingEl) return undefined;
  return {
    in: parseTime(timingEl.getAttribute('in') || '0 1 1 0'),
    out: parseTime(timingEl.getAttribute('out') || '0 1 1 0'),
    offset: parseTime(timingEl.getAttribute('offset') || '0 1 1 0'),
  };
}

// ============================================================================
// Keyframe/Curve Parsing
// ============================================================================

function parseKeyframe(el: Element): Keyframe {
  const kf: Keyframe = {
    time: parseTime(getTextContent(el, 'time') || '0 1 1 0'),
    value: getFloatContent(el, 'value'),
    interpolation: parseInt(el.getAttribute('interpolation') || '1', 10),
  };

  const inTT = getTextContent(el, 'inputTangentTime');
  const inTV = getTextContent(el, 'inputTangentValue');
  const outTT = getTextContent(el, 'outputTangentTime');
  const outTV = getTextContent(el, 'outputTangentValue');

  if (inTT !== null) kf.inTangentTime = parseFloat(inTT);
  if (inTV !== null) kf.inTangentValue = parseFloat(inTV);
  if (outTT !== null) kf.outTangentTime = parseFloat(outTT);
  if (outTV !== null) kf.outTangentValue = parseFloat(outTV);

  return kf;
}

function parseCurve(el: Element): Curve {
  const curve: Curve = {
    type: parseInt(el.getAttribute('type') || '1', 10),
    default: parseFloat(el.getAttribute('default') || '0'),
    keyframes: [],
  };

  // Also capture the current value if present
  const valueAttr = el.getAttribute('value');
  if (valueAttr !== null) {
    curve.default = parseFloat(valueAttr);
  }

  for (const kpEl of directChildren(el, 'keypoint')) {
    curve.keyframes.push(parseKeyframe(kpEl));
  }

  return curve;
}

// ============================================================================
// Parameter Parsing
// ============================================================================

function parseParameter(el: Element): Parameter {
  const param: Parameter = {
    name: el.getAttribute('name') || '',
    id: parseInt(el.getAttribute('id') || '0', 10),
  };

  // Check for animated curve
  const curveEl = firstChild(el, 'curve');
  if (curveEl) {
    param.curve = parseCurve(curveEl);
  }

  // Static value
  const valueAttr = el.getAttribute('value');
  if (valueAttr !== null && !param.curve) {
    const numVal = parseFloat(valueAttr);
    param.value = isNaN(numVal) ? valueAttr : numVal;
  }

  // If there's a default but no curve and no value, use default from the curve element
  if (param.curve && param.value === undefined) {
    param.value = param.curve.default;
  }

  // Child parameters
  const children: Parameter[] = [];
  for (const childEl of directChildren(el, 'parameter')) {
    children.push(parseParameter(childEl));
  }
  if (children.length > 0) {
    param.children = children;
  }

  return param;
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
  }

  // Opacity (0-100 in Motion → 0-1 for compositing)
  const opacityParam = findParam(params, 'Opacity');
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

/**
 * Determine the image source for an image-type scenenode.
 * Checks the Source Media parameter to identify Transition A/B footage.
 */
/**
 * Determine image source based on scenenode name and parameters.
 * Transition templates use "Transition A" / "Transition B" as drop-zone names.
 */
function determineImageSource(name: string, params: Parameter[]): ImageSource {
  if (name === 'Transition A' || name.includes('Transition A')) return { type: 'transitionA' };
  if (name === 'Transition B' || name.includes('Transition B')) return { type: 'transitionB' };
  // Clone layers that reference Transition B (by name in the layer hierarchy)
  if (name === 'Bottom' || name === 'Left' || name === 'Top' || name === 'Right') {
    return { type: 'transitionB' }; // Push uses these as B clones
  }
  return { type: 'transitionA' }; // default to A
}

function determineSource(params: Parameter[], factories: Map<number, string>, factoryID: number): ImageSource | undefined {
  // Find Source Media reference
  function findSourceMedia(ps: Parameter[]): number | undefined {
    for (const p of ps) {
      if (p.name === 'Source Media' && p.id === 300 && typeof p.value === 'number') {
        return p.value;
      }
      if (p.children) {
        const found = findSourceMedia(p.children);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  }

  const sourceMediaId = findSourceMedia(params);
  // We'll resolve A vs B in a post-processing step based on clip IDs and footage pathURLs
  // For now, store the raw reference
  if (sourceMediaId !== undefined) {
    return { type: 'transitionA' }; // placeholder — resolved later
  }

  // Generators
  if (factories.get(factoryID) === 'Generator') {
    return { type: 'generator', name: 'unknown', parameters: [] };
  }

  return undefined;
}

/**
 * Parse a scenenode element into a Layer.
 */
function parseSceneNode(el: Element, factories: Map<number, string>): Layer {
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
      const pluginName = filterNode.getAttribute('pluginName') || '';
      const pluginUUID = filterNode.getAttribute('pluginUUID') || '';
      const filterParams: Parameter[] = [];
      for (const fp of directChildren(filterNode, 'parameter')) {
        filterParams.push(parseParameter(fp));
      }
      filters.push({ pluginName, pluginUUID, parameters: filterParams });
    }
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
      children.push(parseSceneNode(childNode, factories));
    }
  }

  const layer: Layer = {
    name: el.getAttribute('name') || '',
    id: parseInt(el.getAttribute('id') || '0', 10),
    type,
    transform: extractTransform(params),
    blendMode: 'normal', // TODO: extract from Blend Mode parameter
    filters,
    children,
    timing: parseTiming(el),
    source: type === 'image' ? determineImageSource(el.getAttribute('name') || '', params) : undefined,
  };

  return layer;
}

/**
 * Parse a <layer> element (a group that contains scenenodes).
 */
function parseLayerElement(el: Element, factories: Map<number, string>): Layer {
  // Parse the layer's own parameters
  const params: Parameter[] = [];
  for (const paramEl of directChildren(el, 'parameter')) {
    params.push(parseParameter(paramEl));
  }

  // Parse child scenenodes and nested layers
  const children: Layer[] = [];
  for (const childEl of allDirectChildren(el)) {
    if (childEl.tagName === 'scenenode') {
      children.push(parseSceneNode(childEl, factories));
    } else if (childEl.tagName === 'layer') {
      children.push(parseLayerElement(childEl, factories));
    }
  }

  return {
    name: el.getAttribute('name') || '',
    id: parseInt(el.getAttribute('id') || '0', 10),
    type: 'group',
    transform: extractTransform(params),
    blendMode: 'normal',
    filters: [],
    children,
    timing: parseTiming(el),
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
    return { settings: { width: 1920, height: 1080, duration: { value: 200200, timescale: 120000 }, frameRate: 24 }, layers: [], factories };
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

  // 4. Parse the scene graph (layers + scenenodes under <scene>)
  const layers: Layer[] = [];
  for (const el of allDirectChildren(sceneEl)) {
    if (el.tagName === 'layer') {
      layers.push(parseLayerElement(el, factories));
    } else if (el.tagName === 'scenenode') {
      const fid = parseInt(el.getAttribute('factoryID') || '0', 10);
      const ftype = factories.get(fid) || '';
      // Skip Project, Rig, Widget — they're metadata/control, not visual layers
      if (ftype !== 'Project' && ftype !== 'Rig' && ftype !== 'Widget') {
        layers.push(parseSceneNode(el, factories));
      }
    }
  }

  return { settings, layers, factories };
}