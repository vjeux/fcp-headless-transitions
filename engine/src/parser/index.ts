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
  Parameter, Transform, Filter, ImageSource, BlendMode, RigWidget, RigBehavior, Shape, Replicator, LayerBehavior, SceneBehavior, LinkBehavior, GaussianGradientConfig
} from '../types.js';

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

  // Capture the current value separately (used for Retime-driven interpolation from default→value)
  const valueAttr = el.getAttribute('value');
  if (valueAttr !== null) {
    curve.value = parseFloat(valueAttr);
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

  // Default value (used for Retime-driven interpolation)
  const defaultAttr = el.getAttribute('default');
  if (defaultAttr !== null) {
    const numDef = parseFloat(defaultAttr);
    param.default = isNaN(numDef) ? defaultAttr : numDef;
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

/**
 * Parse the scene's <footage> block into a map of clip-id → 'A' | 'B'.
 *
 * Transition templates declare two drop-zone clips inside <footage>:
 *   <clip name="Transition A" id="..."><pathURL>Drop Zone Transition A.tiff</pathURL>
 *   <clip name="Transition B" id="..."><pathURL>Drop Zone Transition B.tiff</pathURL>
 * Image nodes reference these by clip id via their "Source Media" (id 300) param.
 *
 * Classification is by pathURL (…Transition A… / …Transition B…), which is stable
 * and not localized. As a last resort the two clips are ordered A, B by document
 * order (the format always lists A before B).
 */
function parseFootageClipAB(sceneEl: Element): Map<number, 'A' | 'B'> {
  const map = new Map<number, 'A' | 'B'>();
  const clips: { id: number; path: string; name: string }[] = [];
  for (const footage of Array.from(sceneEl.getElementsByTagName('footage'))) {
    for (const clip of directChildren(footage, 'clip')) {
      const id = parseInt(clip.getAttribute('id') || '0', 10);
      if (!id) continue;
      const path = (getTextContent(clip, 'pathURL') || '').toLowerCase();
      const name = (clip.getAttribute('name') || '').toLowerCase();
      clips.push({ id, path, name });
    }
  }
  let sawA = false, sawB = false;
  for (const c of clips) {
    if (/transition\s*a\b|drop zone transition a| a\.tiff|\ba\.|source a/.test(c.path) || /transition\s*a\b|\ba\b/.test(c.name)) {
      map.set(c.id, 'A'); sawA = true;
    } else if (/transition\s*b\b|drop zone transition b| b\.tiff|\bb\.|source b/.test(c.path) || /transition\s*b\b|\bb\b/.test(c.name)) {
      map.set(c.id, 'B'); sawB = true;
    }
  }
  // Fallback: if pathURL/name matching failed, order the two clips A then B.
  if ((!sawA || !sawB) && clips.length >= 2) {
    map.set(clips[0].id, 'A');
    map.set(clips[1].id, 'B');
  } else if (clips.length === 1 && !sawA && !sawB) {
    map.set(clips[0].id, 'A');
  }
  return map;
}

/** Find an image node's referenced clip id via its "Source Media" (id 300) param. */
function findSourceMediaId(params: Parameter[]): number | undefined {
  for (const p of params) {
    if (p.name === 'Source Media' && p.id === 300 && typeof p.value === 'number') return p.value;
    if (p.children) { const r = findSourceMediaId(p.children); if (r !== undefined) return r; }
  }
  return undefined;
}


/**
 * Determine the image source for an image-type scenenode.
 *
 * Resolves the node's "Source Media" (id 300) clip reference against the footage
 * clip→A/B map. This is the authoritative, localization-proof signal. A node with
 * a Color Solid plugin is a solid fill, not a drop zone. Anything else is not an
 * image source (returns undefined so the caller treats it as a plain group/leaf).
 */
/** Recursively find the first parameter matching id (and optionally name). */
function findParamByIdName(ps: Parameter[], id: number, name?: string): Parameter | undefined {
  for (const p of ps) {
    if (p.id === id && (name === undefined || p.name === name)) return p;
    if (p.children) { const r = findParamByIdName(p.children, id, name); if (r) return r; }
  }
  return undefined;
}

/**
 * Parse the Motion "Gaussian Gradient" generator's Object parameter block.
 *
 * Layout (see .motr):
 *   <parameter name="Object"> <parameter name="Gaussian Gradient" id=1>
 *      Width(300) Height(301) PixelAspectRatio(302)
 *      Center(1) { X(1) Y(2) }             — empty ⇒ default centre
 *      Color 1(2) { Red Green Blue Opacity }  — empty ⇒ white opaque
 *      Color 2(3) { Red Green Blue Opacity }  — empty ⇒ black transparent
 *      Radius(4)  Flip(10002)  Absolute Points(10004)
 */
function parseGaussianGradient(params: Parameter[]): GaussianGradientConfig {
  // Locate the inner "Gaussian Gradient" object folder (child of "Object" id=2).
  let obj: Parameter[] | undefined;
  const objectFolder = findParamByIdName(params, 2, 'Object');
  if (objectFolder?.children) {
    const gg = objectFolder.children.find(p => p.name.trim() === 'Gaussian Gradient');
    obj = gg?.children ?? objectFolder.children;
  }
  const src = obj ?? params;

  const num = (p: Parameter | undefined, dflt: number): number => {
    if (!p) return dflt;
    const v = p.curve ?? p.value;
    return typeof v === 'number' ? v : dflt;
  };

  const width = num(src.find(p => p.id === 300), 1920);
  const height = num(src.find(p => p.id === 301), 1080);
  const radius = num(src.find(p => p.id === 4 && p.name.trim() === 'Radius'), 300);
  const flip = num(src.find(p => p.id === 10002), 0) !== 0;
  // Absolute Points default is 1 in the schema but transitions set 0 (normalized).
  const absolutePoints = num(src.find(p => p.id === 10004), 0) !== 0;

  // Center folder (id=1). Empty ⇒ default centre. Motion's default-value attr on
  // X/Y is 150 (a legacy pixel default) but a normalized centre is 0.5,0.5.
  const centerFolder = src.find(p => p.id === 1 && p.name.trim() === 'Center');
  let centerX = 0.5, centerY = 0.5;
  if (centerFolder?.children && centerFolder.children.length > 0) {
    const cx = centerFolder.children.find(p => p.id === 1);
    const cy = centerFolder.children.find(p => p.id === 2);
    if (cx) centerX = num(cx, 0.5);
    if (cy) centerY = num(cy, 0.5);
  }

  // Colour folders. Color 1 (id=2) default white opaque; Color 2 (id=3) default
  // black transparent (the classic Motion "glow" gradient).
  const readColor = (id: number, dfltR: number, dfltG: number, dfltB: number, dfltA: number) => {
    const folder = src.find(p => p.id === id);
    let r = dfltR, g = dfltG, b = dfltB, a = dfltA;
    if (folder?.children && folder.children.length > 0) {
      const rp = folder.children.find(p => p.name === 'Red');
      const gp = folder.children.find(p => p.name === 'Green');
      const bp = folder.children.find(p => p.name === 'Blue');
      const ap = folder.children.find(p => p.name === 'Opacity');
      if (rp) r = num(rp, dfltR); if (gp) g = num(gp, dfltG);
      if (bp) b = num(bp, dfltB); if (ap) a = num(ap, dfltA);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
  };
  const color1 = readColor(2, 1, 1, 1, 1);   // white, opaque
  const color2 = readColor(3, 0, 0, 0, 0);   // black, transparent

  return { width, height, centerX, centerY, absolutePoints, radius, color1, color2, flip };
}

function determineImageSource(params: Parameter[], el: Element | undefined, clipAB: Map<number, 'A' | 'B'>): ImageSource | undefined {
  // Gaussian Gradient generator (radial glow used by Nature/Diagonal & Nature/Glide).
  const pluginUUID = el?.getAttribute('pluginUUID') || '';
  const pluginName = el?.getAttribute('pluginName') || '';
  if (pluginUUID.toUpperCase().startsWith('96A13FF0') || pluginName.trim() === 'Gaussian Gradient') {
    return { type: 'gaussianGradient', gradient: parseGaussianGradient(params) };
  }

  // Color Solid generator (a plugin fill, not a drop zone).
  if (el && (el.getAttribute('pluginName')?.includes('Color Solid') || el.getAttribute('pluginName')?.includes('PAEColorSolid'))) {
    // Motion's Color Solid generator defaults to BLACK. Motion only serializes
    // color channels that differ from the object default; e.g. Reflection's "Floor"
    // Color Solid writes only <Blue value="0"/> (and Group 1's driver likewise) —
    // Red/Green are absent because they equal the default 0. Defaulting to white
    // here painted the floor plane bright yellow (255,255,0). Black is correct.
    let r = 0, g = 0, b = 0;
    (function findColor(ps: Parameter[]) {
      for (const p of ps) {
        if (p.name === 'Red' && typeof p.value === 'number') r = p.value;
        if (p.name === 'Green' && typeof p.value === 'number') g = p.value;
        if (p.name === 'Blue' && typeof p.value === 'number') b = p.value;
        if (p.children) findColor(p.children);
      }
    })(params);
    return { type: 'color', r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: 1 };
  }

  // Resolve by footage clip reference (the authoritative signal).
  const clipId = findSourceMediaId(params);
  if (clipId !== undefined && clipAB.has(clipId)) {
    return clipAB.get(clipId) === 'A' ? { type: 'transitionA' } : { type: 'transitionB' };
  }

  return undefined;
}


/**
 * Parse a scenenode element into a Layer.
 */

/**
 * Parse shape geometry from a Shape scenenode.
 * Shapes store vertex coordinates in <curve_X> and <curve_Y> elements,
 * each containing <vertex> → <vertex_folder> → <parameter name="Value">.
 */

/**
 * Parse replicator configuration from a Replicator scenenode.
 * Extracts grid arrangement, rows/columns, and sizing.
 */

/**
 * Parse animation behaviors (Fade, Ramp, etc.) attached as children of a layer.
 * Excludes Rig Behaviors (handled separately via the rig system).
 */
function parseLayerBehaviors(el: Element, factories: Map<number, string>): LayerBehavior[] {
  const behaviors: LayerBehavior[] = [];
  for (const b of directChildren(el, 'behavior')) {
    const name = b.getAttribute('name') || '';
    if (name.startsWith('Rig Behavior')) continue; // handled by rig system

    const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
    const ftype = factories.get(fid) || '';

    let type: LayerBehavior['type'] = 'other';
    if (ftype === 'Fade In/Fade Out') type = 'fade';
    else if (ftype === 'Ramp') type = 'ramp';
    else if (ftype === 'Oscillate') type = 'oscillate';
    else if (ftype === 'Spin') type = 'spin';

    // Collect params
    const params: Record<string, number> = {};
    let targetParam: string | undefined;
    for (const p of directChildren(b, 'parameter')) {
      const pname = p.getAttribute('name') || '';
      const pval = p.getAttribute('value');
      if (pval !== null) {
        const num = parseFloat(pval);
        if (!isNaN(num)) params[pname] = num;
      }
      if (pname === 'Apply To' || pname === 'Target') targetParam = p.getAttribute('value') || undefined;
    }

    behaviors.push({ type, params, targetParam, timing: parseTiming(b) });
  }
  return behaviors;
}

/**
 * Parse Link behaviors (factory "Link", id 7) attached to a layer.
 *
 * A Link drives one of the host layer's Position channels from a source object's
 * Position channel. Motion uses these for pushes/slides: a hidden driver node
 * (e.g. Push's "Color Solid") animates its position, and Links copy that motion
 * onto the visible transition group — one Link per axis, gated by the Direction rig.
 *
 * Channel refs like "./1/100/101/1" mean Properties(1)/Transform(100)/Position(101)/X(1);
 * the trailing 1/2/3 = X/Y/Z.
 */
function parseLinkBehaviors(el: Element, factories: Map<number, string>): LinkBehavior[] {
  const links: LinkBehavior[] = [];

  for (const b of directChildren(el, 'behavior')) {
    const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
    if (factories.get(fid) !== 'Link') continue;

    let sourceObjectId = 0, scale = 1, customMix = 1, min = -Infinity, max = Infinity;
    // Motion nests LinkX/LinkY on the "Group" layer; their "Affecting Object" names
    // Transition A, but the observed effect is that the whole group (A + the B
    // clones) is driven together (so B enters as A leaves). We therefore apply the
    // link to the ENCLOSING layer, which carries both. (Applying it to A alone
    // leaves the clones static and B never enters — verified against ground truth.)
    const affectedId = parseInt(el.getAttribute('id') || '0', 10);
    for (const p of directChildren(b, 'parameter')) {
      const pname = p.getAttribute('name') || '';
      const v = p.getAttribute('value');
      const num = v !== null ? parseFloat(v) : NaN;
      if (pname === 'Source Object') sourceObjectId = parseInt(v || '0', 10);
      else if (pname === 'Scale' && !isNaN(num)) scale = num;
      else if (pname === 'Custom Mix' && !isNaN(num)) customMix = num;
      else if ((pname === 'X min' || pname === 'Y min' || pname === 'Z min') && !isNaN(num)) min = num;
      else if ((pname === 'X max' || pname === 'Y max' || pname === 'Z max') && !isNaN(num)) max = num;
    }

    // Determine which channels are driven from expressionChannels.
    const chanName = (ref: string | null): 'X' | 'Y' | 'Z' | undefined => {
      if (!ref) return undefined;
      const last = ref.trim().split('/').pop();
      return last === '1' ? 'X' : last === '2' ? 'Y' : last === '3' ? 'Z' : undefined;
    };
    let targetChannel: 'X' | 'Y' | 'Z' | undefined;
    let sourceChannel: 'X' | 'Y' | 'Z' | undefined;
    const expr = firstChild(b, 'expressionChannels');
    if (expr) {
      const srcRef = getTextContent(expr, 'sourceChannelRef');
      const tgtId = getTextContent(expr, 'targetChannelID');
      sourceChannel = chanName(srcRef);
      targetChannel = tgtId === '1' ? 'X' : tgtId === '2' ? 'Y' : tgtId === '3' ? 'Z' : undefined;
    }
    // Fallback from the channelBehavior affectingChannel (the driven channel).
    if (!targetChannel) {
      const cb = firstChild(b, 'channelBehavior');
      targetChannel = chanName(cb?.getAttribute('affectingChannel') ?? null);
    }
    if (!sourceChannel) sourceChannel = targetChannel;
    if (!targetChannel || !sourceChannel || sourceObjectId === 0) continue;

    // Sibling "Rig Behavior"s drive this Link's Custom Mix (channel "./207") AND
    // its Scale (channel "./204") per direction. Both are rig snapshot arrays
    // indexed by the Direction widget value. The Scale snapshots carry the
    // per-direction SIGN (e.g. Left→Right needs scale −1, Right→Left +1) — without
    // them only one direction renders correctly.
    let rigWidgetId: number | undefined;
    let rigCustomMix: number[] | undefined;
    let rigScale: number[] | undefined;
    const linkId = parseInt(b.getAttribute('id') || '0', 10);
    const parent = (el as any).parentNode as Element | null;
    const searchScope = parent ? Array.from(parent.getElementsByTagName('behavior')) : [];
    const readSnapshots = (rb: Element): number[] | undefined => {
      const snapsParam = directChildren(rb, 'parameter').find(p => p.getAttribute('name') === 'Snapshots');
      if (!snapsParam) return undefined;
      const out: number[] = [];
      for (const snap of directChildren(snapsParam, 'parameter')) {
        const curveEl = firstChild(snap, 'curve');
        const val = curveEl?.getAttribute('value');
        out.push(val !== null && val !== undefined ? parseFloat(val) : 0);
      }
      return out;
    };
    for (const rb of searchScope) {
      const nm = rb.getAttribute('name') || '';
      if (!nm.startsWith('Rig Behavior')) continue;
      const cb = firstChild(rb, 'channelBehavior');
      const affCh = cb?.getAttribute('affectingChannel') || '';
      let affObj = 0, widgetId = 0;
      for (const p of directChildren(rb, 'parameter')) {
        if (p.getAttribute('name') === 'Affecting Object (Hidden)') affObj = parseInt(p.getAttribute('value') || '0', 10);
        if (p.getAttribute('name') === 'Widget') widgetId = parseInt(p.getAttribute('value') || '0', 10);
      }
      if (affObj !== linkId) continue;
      if (affCh.endsWith('/207')) { rigCustomMix = readSnapshots(rb); rigWidgetId = widgetId; }
      else if (affCh.endsWith('/204')) { rigScale = readSnapshots(rb); rigWidgetId = widgetId; }
    }

    links.push({
      affectedObjectId: affectedId,
      sourceObjectId,
      targetChannel,
      sourceChannel,
      scale,
      customMix,
      min,
      max,
      rigWidgetId,
      rigCustomMix,
      rigScale,
    });
  }
  return links;
}


function parseReplicator(params: Parameter[]): Replicator | undefined {
  function findVal(ps: Parameter[], name: string): number | undefined {
    for (const p of ps) {
      if (p.name === name && typeof p.value === 'number') return p.value;
      if (p.children) {
        const found = findVal(p.children, name);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  }

  const arrangement = findVal(params, 'Arrangement') ?? 0;
  const columns = findVal(params, 'Columns') ?? 1;
  const rows = findVal(params, 'Rows') ?? 1;
  // Grid extent lives in the "Size id=347" sub-group (Width/Height children),
  // NOT the top-level "Width id=354" (which is a per-cell stroke width and is
  // often 1). Prefer Size's Width/Height; fall back to any Width/Height.
  function findSizeGroup(ps: Parameter[]): Parameter | undefined {
    for (const p of ps) {
      if (p.name === 'Size' && p.children && p.children.some(c => c.name === 'Width')) return p;
      if (p.children) { const r = findSizeGroup(p.children); if (r) return r; }
    }
    return undefined;
  }
  const sizeGroup = findSizeGroup(params);
  const sizeWidth = (sizeGroup ? findVal(sizeGroup.children!, 'Width') : undefined) ?? findVal(params, 'Width') ?? 0;
  const sizeHeight = (sizeGroup ? findVal(sizeGroup.children!, 'Height') : undefined) ?? findVal(params, 'Height') ?? 0;
  const origin = findVal(params, 'Origin') ?? 0;

  return { arrangement, columns, rows, sizeWidth, sizeHeight, origin };
}

/** One vertex extracted from a curve_X or curve_Y element (single axis). */
interface AxisVertex {
  index: number;
  value: number;
  inTangent?: number;  // Input Tangent (id=4): relative offset toward previous vertex
  outTangent?: number; // Output Tangent (id=5): relative offset toward next vertex
}

/**
 * Find the `Object Source` (id=128) parameter anywhere in a scenenode subtree.
 * Motion stores this on the Replicator Cell node, referencing the scenenode/layer
 * ID of the drawable content the replicator tiles across its instances. The id
 * varies slightly across templates, so we match by parameter NAME and fall back
 * to a bare "Source" with a plausible object-ID value. Returns the referenced ID.
 */
function findObjectSource(el: Element): number | undefined {
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType !== 1) continue;
    const elem = child as Element;
    if (elem.tagName === 'parameter') {
      const name = elem.getAttribute('name') || '';
      if (name === 'Object Source') {
        const v = elem.getAttribute('value');
        if (v !== null) {
          const n = parseInt(v, 10);
          if (!isNaN(n) && n > 0) return n;
        }
      }
    }
    const found = findObjectSource(elem);
    if (found !== undefined) return found;
  }
  return undefined;

}

function parseShape(el: Element): Shape | undefined {
  const curveX = findDescendant(el, 'curve_X');
  const curveY = findDescendant(el, 'curve_Y');
  if (!curveX || !curveY) return undefined;

  const axisX = extractAxisVertices(curveX);
  const axisY = extractAxisVertices(curveY);
  if (axisX.length === 0) return undefined;

  const n = Math.min(axisX.length, axisY.length);
  const verticesX: number[] = [];
  const verticesY: number[] = [];
  const inTangentX: (number | undefined)[] = [];
  const inTangentY: (number | undefined)[] = [];
  const outTangentX: (number | undefined)[] = [];
  const outTangentY: (number | undefined)[] = [];
  let hasTangents = false;
  for (let i = 0; i < n; i++) {
    verticesX.push(axisX[i].value);
    verticesY.push(axisY[i].value);
    inTangentX.push(axisX[i].inTangent);
    inTangentY.push(axisY[i].inTangent);
    outTangentX.push(axisX[i].outTangent);
    outTangentY.push(axisY[i].outTangent);
    if (axisX[i].inTangent !== undefined || axisX[i].outTangent !== undefined
      || axisY[i].inTangent !== undefined || axisY[i].outTangent !== undefined) {
      hasTangents = true;
    }
  }

  // "closed" appears both as a <closed> element and as a "Closed" (id=116) param.
  const closedEl = findDescendant(el, 'closed');
  const closed = closedEl ? closedEl.textContent?.trim() === '1' : true;

  const isMask = detectMask(el);

  return {
    verticesX,
    verticesY,
    inTangentX: hasTangents ? inTangentX : undefined,
    inTangentY: hasTangents ? inTangentY : undefined,
    outTangentX: hasTangents ? outTangentX : undefined,
    outTangentY: hasTangents ? outTangentY : undefined,
    hasTangents,
    closed,
    isMask,
  };
}

/**
 * Decide whether a Shape scenenode is acting as a mask.
 *
 * Motion never tags the shape node itself as a mask — the intent is expressed by
 * containment. We therefore walk UP the DOM: a shape is a mask if it (or any
 * ancestor layer) is named "Mask"/"Masks", OR it is an explicit "Image Mask"
 * scenenode. This catches masks nested inside a "Masks" sub-group (e.g.
 * Wipes/Diagonal's "Bezier Top"/"Bezier Bot" under <layer name="Masks">), which
 * the old direct-name check missed.
 */
function detectMask(el: Element): boolean {
  // Explicit Image Mask scenenode.
  if ((el.getAttribute('factoryDescription') || '').toLowerCase().includes('mask')) return true;

  let cur: Element | null = el;
  let depth = 0;
  while (cur && depth < 32) {
    const name = (cur.getAttribute('name') || '').toLowerCase();
    // Match "mask" / "masks" but not incidental substrings like "unmasked task".
    if (name === 'mask' || name === 'masks' || /\bmasks?\b/.test(name)) return true;
    cur = (cur as any).parentNode as Element | null;
    // Guard against reaching non-element nodes (e.g. Document).
    if (cur && cur.nodeType !== 1) cur = null;
    depth++;
  }
  return false;
}

/**
 * Extract vertices (Value + optional tangents) from a curve_X/curve_Y element,
 * sorted by the vertex "index" attribute so path order matches Motion's.
 */
function extractAxisVertices(curveEl: Element): AxisVertex[] {
  const verts: AxisVertex[] = [];
  for (const vertex of directChildren(curveEl, 'vertex')) {
    const folder = firstChild(vertex, 'vertex_folder');
    if (!folder) continue;
    const idx = parseInt(vertex.getAttribute('index') || '0', 10);
    let value: number | undefined;
    let inTangent: number | undefined;
    let outTangent: number | undefined;
    for (const param of directChildren(folder, 'parameter')) {
      const id = param.getAttribute('id');
      const vAttr = param.getAttribute('value');
      const v = vAttr !== null ? parseFloat(vAttr) : NaN;
      if (isNaN(v)) continue;
      // id=2 → Value, id=4 → Input Tangent, id=5 → Output Tangent.
      if (id === '2') value = v;
      else if (id === '4') inTangent = v;
      else if (id === '5') outTangent = v;
    }
    if (value === undefined) continue;
    verts.push({ index: idx, value, inTangent, outTangent });
  }
  verts.sort((a, b) => a.index - b.index);
  return verts;
}

/** Find first descendant element with a given tag (recursive). */
function findDescendant(el: Element, tag: string): Element | null {
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType === 1) {
      const elem = child as Element;
      if (elem.tagName === tag) return elem;
      const found = findDescendant(elem, tag);
      if (found) return found;
    }
  }
  return null;
}

function parseSceneNode(el: Element, factories: Map<number, string>, clipAB: Map<number, 'A' | 'B'>): Layer {
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
      children.push(parseSceneNode(childNode, factories, clipAB));
    }
  }

  // <enabled>0</enabled> marks a node that drives others but is not itself drawn.
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
    shape: type === 'shape' ? parseShape(el) : undefined,
    replicator: type === 'replicator' ? parseReplicator(params) : undefined,
    behaviors: parseLayerBehaviors(el, factories),
    source: (type === 'image' || type === 'generator') ? determineImageSource(params, el, clipAB) : undefined,
    enabled,
    cloneSourceId,
    cellSourceId,
    links: parseLinkBehaviors(el, factories),
    camera: type === 'camera' ? parseCameraParams(el, params, factories) : undefined,
  };

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
): { angleOfView: number; aovSnapshots?: number[]; aovWidgetId?: number; aovDefault?: number } {
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

  return { angleOfView: aov, aovSnapshots, aovWidgetId, aovDefault: aov };
}

/**
 * Parse a <layer> element (a group that contains scenenodes).
 */
function parseLayerElement(el: Element, factories: Map<number, string>, clipAB: Map<number, 'A' | 'B'>): Layer {
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
        children.push(parseSceneNode(childEl, factories, clipAB));
      }
    } else if (childEl.tagName === 'layer' || childEl.tagName === 'group') {
      children.push(parseLayerElement(childEl, factories, clipAB));
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


// ============================================================================
// Rig Parsing
// ============================================================================

/**
 * Parse rig widgets (popup menus/checkboxes controlling transition direction/variants).
 * Widgets live inside a <scenenode name="Rig"> and have a current "value".
 */
function parseRigWidgets(sceneEl: Element, factories: Map<number, string>): RigWidget[] {
  const widgets: RigWidget[] = [];
  for (const sn of Array.from(sceneEl.getElementsByTagName('scenenode'))) {
    const fid = parseInt(sn.getAttribute('factoryID') || '0', 10);
    if (factories.get(fid) === 'Widget') {
      const id = parseInt(sn.getAttribute('id') || '0', 10);
      const name = sn.getAttribute('name') || '';
      // The widget's current value is stored in a parameter matching the widget name
      // (e.g., "Direction" widget has a "Direction" parameter with value=2).
      let raw: string | null = null;
      for (const p of Array.from(sn.getElementsByTagName('parameter'))) {
        if (p.getAttribute('name') === name) {
          const v = p.getAttribute('value');
          if (v !== null) { raw = v; break; }
        }
      }
      let value = 0;
      if (raw !== null) {
        const num = parseFloat(raw);
        if (Number.isInteger(num)) {
          // Discrete-index widget. Motion's "Pop-up" menu widget stores a 1-BASED
          // selection (menu item 1 = the first snapshot), whereas the "Direction"
          // widget stores a 0-BASED index. Both share factoryID 13 and identical
          // <snapshot>1..4</snapshot> tags, so we disambiguate by the widget name.
          // Getting this wrong for Blurs/Gaussian & Blurs/Radial (Pop-up value=1)
          // selected snapshot[1] — the blur ramp (Amount 0→100→0, Mix=1) — and
          // over-blurred, when FCP actually shows NO blur (snapshot[0]: Mix=0).
          if (name === 'Pop-up') {
            value = Math.max(0, num - 1);
          } else {
            // Direction and other discrete widgets: the value IS the index.
            value = num;
          }
        } else {
          // Continuous-value widget (e.g. an Aspect Ratio pop-up storing 1.7777…).
          // The value is NOT a snapshot index — it matches one of the declared
          // Snapshot entries by its numeric "Value". Rig behaviors index their
          // snapshot arrays by (snapshot id − 1), so resolve to that ordinal.
          value = resolveContinuousWidgetIndex(sn, num);
        }
      }
      widgets.push({ id, name, value });
    }
  }
  return widgets;
}

/**
 * A continuous-value Widget (e.g. Aspect Ratio) stores a float like 1.7777. The
 * active snapshot is the declared <Snapshots> entry whose "Value" matches. Rig
 * behaviors driven by this widget index their snapshot arrays by (snapshot id − 1),
 * so return that ordinal (falling back to nearest match, then 0).
 */
function resolveContinuousWidgetIndex(sn: Element, num: number): number {
  let bestId = 1;
  let bestDelta = Infinity;
  for (const p of Array.from(sn.getElementsByTagName('parameter'))) {
    if (p.getAttribute('name') !== 'Snapshots' || p.getAttribute('id') !== '101') continue;
    for (const child of directChildren(p, 'parameter')) {
      const snapId = parseInt(child.getAttribute('id') || '0', 10);
      const valEl = directChildren(child, 'parameter').find(x => x.getAttribute('name') === 'Value');
      if (!valEl) continue;
      const v = parseFloat(valEl.getAttribute('value') || 'NaN');
      if (Number.isNaN(v)) continue;
      const delta = Math.abs(v - num);
      if (delta < bestDelta) { bestDelta = delta; bestId = snapId; }
    }
  }
  return bestId - 1;
}


/**
 * Parse rig behaviors. Each maps (affectedObject, widget) → parameter snapshots.
 * The active snapshot is selected by the widget's current value.
 */
function parseRigBehaviors(sceneEl: Element): RigBehavior[] {
  const behaviors: RigBehavior[] = [];
  for (const b of Array.from(sceneEl.getElementsByTagName('behavior'))) {
    const name = b.getAttribute('name') || '';
    if (!name.startsWith('Rig Behavior')) continue;

    let affectedObjectId = 0;
    let widgetId = 0;
    let snapshotsParam: Element | null = null;

    for (const p of directChildren(b, 'parameter')) {
      const pname = p.getAttribute('name');
      if (pname === 'Affecting Object (Hidden)') {
        affectedObjectId = parseInt(p.getAttribute('value') || '0', 10);
      } else if (pname === 'Widget') {
        widgetId = parseInt(p.getAttribute('value') || '0', 10);
      } else if (pname === 'Snapshots') {
        snapshotsParam = p;
      }
    }

    if (!snapshotsParam) continue;

    // Parse the snapshot parameters (one per widget value)
    const snapshots: Parameter[] = [];
    let paramType = '';
    for (const snapEl of directChildren(snapshotsParam, 'parameter')) {
      const snap = parseParameter(snapEl);
      if (!paramType) paramType = snap.name;
      snapshots.push(snap);
    }

    behaviors.push({ affectedObjectId, widgetId, paramType, snapshots });
  }
  return behaviors;
}


/**
 * Resolve a `channelBehavior affectingChannel` path into a transform channel.
 *
 * Channel paths are relative param-ID paths from the affected scenenode, e.g.
 * "./1/100/109/2" = Properties(1) → Transform(100) → Rotation(109) → Y(2).
 * Under Transform(100): Position=101, Scale=105, Rotation=109.
 * Sub-index 1/2/3 = X/Y/Z. Scale may be uniform (no sub-index) → scaleX/Y/Z all.
 * Paths that don't resolve to a transform channel (rig End Values like "./203",
 * plugin params like "./2/353/...") return undefined and are handled elsewhere.
 */
function resolveRampTargetChannel(path: string | undefined): import('../types.js').RampTargetChannel | undefined {
  if (!path) return undefined;
  const parts = path.replace(/^\.\//, '').split('/').map(s => s.trim()).filter(Boolean);
  // Expect Properties(1)/Transform(100)/<group>/<axis?>
  if (parts.length < 3) return undefined;
  if (parts[0] !== '1' || parts[1] !== '100') return undefined;
  const group = parts[2];
  const axis = parts[3]; // '1'|'2'|'3' or undefined (uniform)
  const axisSuffix = axis === '1' ? 'X' : axis === '2' ? 'Y' : axis === '3' ? 'Z' : undefined;
  if (group === '109') { // Rotation
    if (axisSuffix) return `rotation${axisSuffix}` as import('../types.js').RampTargetChannel;
    return undefined;
  }
  if (group === '101') { // Position
    if (axisSuffix) return `position${axisSuffix}` as import('../types.js').RampTargetChannel;
    return undefined;
  }
  if (group === '105') { // Scale (uniform on this node type)
    // Uniform scale: driven onto all axes. Represent as scaleX; evaluator mirrors.
    return 'scaleX';
  }
  return undefined;
}

/**
 * Parse scene-level behaviors that affect objects by ID (Ramp, Oscillate).
 * These are distinct from rig behaviors (which use snapshots) and layer behaviors
 * (like Fade, which attach directly to their parent).
 */
function parseSceneBehaviors(sceneEl: Element, factories: Map<number, string>): SceneBehavior[] {
  const result: SceneBehavior[] = [];
  for (const b of Array.from(sceneEl.getElementsByTagName('behavior'))) {
    const name = b.getAttribute('name') || '';
    if (name.startsWith('Rig Behavior')) continue;

    const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
    const ftype = factories.get(fid) || '';
    let type: SceneBehavior['type'] = 'other';
    if (ftype === 'Ramp') type = 'ramp';
    else if (ftype === 'Oscillate') type = 'oscillate';
    else if (ftype === 'Spin') type = 'spin';
    else continue; // only track behaviors that affect objects by ID

    let affectedObjectId = 0;
    const params: Record<string, number> = {};
    for (const p of directChildren(b, 'parameter')) {
      const pname = p.getAttribute('name') || '';
      const pval = p.getAttribute('value');
      if (pname === 'Affecting Object (Hidden)') {
        affectedObjectId = parseInt(pval || '0', 10);
      } else if (pval !== null) {
        const num = parseFloat(pval);
        if (!isNaN(num)) params[pname] = num;
      }
    }
    // The driven channel + active time window come from <channelBehavior> / <timing>.
    const cb = firstChild(b, 'channelBehavior');
    const affectingChannel = cb?.getAttribute('affectingChannel') || undefined;
    const targetChannel = resolveRampTargetChannel(affectingChannel);
    // sliderRange scales the Oscillate amplitude for filter-parameter targets.
    if (cb) {
      const sr = cb.getAttribute('sliderRange');
      if (sr !== null) { const n = parseFloat(sr); if (!isNaN(n)) params['sliderRange'] = n; }
    }
    const t = parseTiming(b);
    // Store raw RationalTime (converted to seconds at use-site via timeToSeconds).
    const timing = t ? { in: t.in, out: t.out, offset: t.offset } : undefined;
    if (affectedObjectId !== 0) {
      result.push({ type, affectedObjectId, params, affectingChannel, targetChannel, timing });
    }
  }
  return result;
}

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

  // Parse rig widgets and behaviors
  const rigWidgets = parseRigWidgets(sceneEl, factories);
  const rigBehaviors = parseRigBehaviors(sceneEl);
  const sceneBehaviors = parseSceneBehaviors(sceneEl, factories);

  // Resolve the footage drop-zone clips → A/B for authoritative source resolution.
  const clipAB = parseFootageClipAB(sceneEl);

  // 4. Parse the scene graph (layers + scenenodes under <scene>)
  const layers: Layer[] = [];
  for (const el of allDirectChildren(sceneEl)) {
    if (el.tagName === 'layer' || el.tagName === 'group') {
      layers.push(parseLayerElement(el, factories, clipAB));
    } else if (el.tagName === 'scenenode') {
      const fid = parseInt(el.getAttribute('factoryID') || '0', 10);
      const ftype = factories.get(fid) || '';
      // Skip Project, Rig, Widget — they're metadata/control, not visual layers
      if (ftype !== 'Project' && ftype !== 'Rig' && ftype !== 'Widget') {
        layers.push(parseSceneNode(el, factories, clipAB));
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
    ]);
    // Ancestor parameter names that mean "this curve is not live scene animation".
    // "Snapshots" holds rig-widget snapshot COPIES of filter params (e.g. a copy of
    // the Gaussian Blur "Amount"/"Angle" whose keyframes run to 0.5005s) that are
    // NOT the layer being rendered. If counted, they overshoot the true animation
    // end (the drop-zone Opacity crossfade at 0.4338s) and the render wraps to A.
    const EXCLUDE_ANCESTORS = new Set(['Snapshots']);
    // Walk curves, tracking the enclosing <parameter name=...> chain so we can skip
    // retiming curves and rig-snapshot subtrees. getElementsByTagName gives document
    // order; we resolve each curve's owning parameters by climbing parentNode.
    let maxT = 0;
    const curves = Array.from(sceneEl.getElementsByTagName('curve'));
    for (const curve of curves) {
      // Collect the full chain of enclosing <parameter> names.
      let node: any = (curve as any).parentNode;
      let ownerName = '';
      let skip = false;
      while (node && node.nodeType === 1) {
        if (node.tagName === 'parameter') {
          const nm = node.getAttribute('name') || '';
          if (!ownerName) ownerName = nm; // nearest enclosing parameter
          if (EXCLUDE_ANCESTORS.has(nm)) { skip = true; break; }
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
          const sec = val / scale;
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
  settings.animationEndSec = animationEndSec;

  return { settings, layers, factories, rigWidgets, rigBehaviors, sceneBehaviors };
}