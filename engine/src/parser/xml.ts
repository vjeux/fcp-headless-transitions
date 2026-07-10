/**
 * Parser — low-level XML/DOM + time/keyframe/curve/parameter helpers.
 *
 * Leaf-level building blocks shared by all the per-node parsers. Depends only on
 * @xmldom/xmldom and the shared types — no engine internals — so it sits at the
 * bottom of the parser dependency graph.
 */
import type { RationalTime, Keyframe, Curve, Parameter } from '../types.js';

// ============================================================================
// XML Parsing Helpers
// ============================================================================

// DOMParser: use native in browser, @xmldom/xmldom in Node.js
import { DOMParser as XmlDomParser } from '@xmldom/xmldom';
const _DOMParser = typeof globalThis.DOMParser !== 'undefined' ? globalThis.DOMParser : XmlDomParser as unknown as typeof DOMParser;

export function parseXML(xmlText: string): Document {
  const Parser = _DOMParser;
  return new Parser().parseFromString(xmlText, 'text/xml');
}


/** Get direct child elements with a given tag name (xmldom compat). */
export function directChildren(el: Element | Document, tag: string): Element[] {
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
export function allDirectChildren(el: Element | Document): Element[] {
  const result: Element[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType === 1) result.push(child as Element);
  }
  return result;
}

/** Find first direct child element with tag. */
export function firstChild(el: Element, tag: string): Element | null {
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i];
    if (child.nodeType === 1 && (child as Element).tagName === tag) {
      return child as Element;
    }
  }
  return null;
}

export function getTextContent(el: Element, tag: string): string | null {
  const child = firstChild(el, tag);
  return child?.textContent ?? null;
}

export function getIntContent(el: Element, tag: string, def: number = 0): number {
  const text = getTextContent(el, tag);
  return text ? parseInt(text, 10) : def;
}

export function getFloatContent(el: Element, tag: string, def: number = 0): number {
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
export function parseTime(str: string): RationalTime {
  const parts = str.trim().split(/\s+/);
  return {
    value: parseInt(parts[0], 10) || 0,
    timescale: parseInt(parts[1], 10) || 1,
  };
}

/**
 * Parse a timing element: <timing in="..." out="..." offset="..."/>
 */
export function parseTiming(el: Element): { in: RationalTime; out: RationalTime; offset: RationalTime } | undefined {
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

export function parseKeyframe(el: Element): Keyframe {
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

export function parseCurve(el: Element): Curve {
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

  // Retiming extrapolation mode (how the media playhead behaves past the last
  // keyframe). Mode 1 = wrap/loop back to the transition start (see types.ts).
  const reAttr = el.getAttribute('retimingExtrapolation');
  if (reAttr !== null) {
    const re = parseInt(reAttr, 10);
    if (isFinite(re)) curve.retimingExtrapolation = re;
  }

  for (const kpEl of directChildren(el, 'keypoint')) {
    curve.keyframes.push(parseKeyframe(kpEl));
  }

  return curve;
}

// ============================================================================
// Parameter Parsing
// ============================================================================

export function parseParameter(el: Element): Parameter {
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

