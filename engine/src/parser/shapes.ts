/**
 * Parser — shape / mask / axis-vertex parsing.
 *
 * Handles vector shape geometry: control-point axis vertices, fill/panel colors,
 * stroke + arrowhead caps, mask detection, and the Object Source reference used by
 * replicator cells. Split out of parser/index.ts (ROADMAP item 7).
 */
import type { Shape, Curve } from '../types.js';
import { directChildren, firstChild, parseCurve, findDescendant } from './xml.js';

/** One vertex extracted from a curve_X or curve_Y element (single axis). */
interface AxisVertex {
  index: number;
  value: number;
  /**
   * ANIMATED vertex Value (T-q11397f86 — Stylized/Center_Reveal). Motion authors
   * a `<curve>` (with `<keypoint>`s) INSIDE the vertex Value `<parameter id="2">`
   * when the shape's control point moves over time (the reveal sweep on
   * Center_Reveal's Arrow left/right mask shapes: 8 of 96 vertex Values are
   * animated with a ~240-unit outward swing keyed at scene t=0.467s→0.567s). The
   * static `value` above is the current-frame sample (curve's `value` attribute)
   * for backward compatibility with the compositor's static-vertex path; when
   * this Curve is present, the evaluator samples it at frame time and writes the
   * sample into the shape's `verticesX/Y` array before the compositor rasterizes.
   */
  valueCurve?: Curve;
  inTangent?: number;  // Input Tangent (id=4): relative offset toward previous vertex
  outTangent?: number; // Output Tangent (id=5): relative offset toward next vertex
}

/**
 * SIDE-CHANNEL: animated shape vertex Curves, keyed on the shape's `verticesX`
 * ARRAY (not the outer Shape object).
 *
 * Motion masks can author a `<curve>` (keypoint list) inside a shape control
 * point's Value parameter to animate the vertex over time (Stylized/Center_Reveal
 * — the Arrow left/right mask shapes on the "Grad middle" Gradient generator that
 * feeds Transition B's Image Mask). The compositor reads `shape.verticesX/Y` as
 * plain number arrays (static geometry), so we CANNOT change the Shape type
 * without touching the compositor (owned by the Concentric agent). Instead, we
 * publish the per-vertex axis Curves via a WeakMap: the evaluator (which runs
 * before compositing each frame) looks up the map, samples each Curve at the
 * current frame time, and MUTATES the shape's `verticesX[i]/verticesY[i]` in
 * place. Downstream (compositor, framing, mask source-radius) sees numeric
 * vertices as before.
 *
 * WHY KEYED ON `verticesX` (not on the Shape itself): parser/index.ts spreads
 * masks into lifted Layer.shape objects via `{ ...mshape, isMask: true }` — a
 * NEW outer Shape but the INNER arrays (verticesX/verticesY/tangents) are
 * shared references. Keying on `verticesX` lets both the original Shape and any
 * spread clones look up the same animation entry without additional plumbing.
 *
 * A shape with NO animated vertices does not appear in the map — its parse and
 * render are byte-identical to origin/main.
 *
 * Arrays are sparse: `xCurves[i]` / `yCurves[i]` is undefined for static
 * vertices (default, keeps a byte-neutral fast path) and a Curve for animated
 * ones. Only present when at least one axis has at least one animated vertex.
 */
export interface ShapeVertexAnimation {
  xCurves?: (Curve | undefined)[];
  yCurves?: (Curve | undefined)[];
}
export const shapeVertexAnimations: WeakMap<number[], ShapeVertexAnimation> = new WeakMap();

/**
 * Find the `Object Source` (id=128) parameter anywhere in a scenenode subtree.
 * Motion stores this on the Replicator Cell node, referencing the scenenode/layer
 * ID of the drawable content the replicator tiles across its instances. The id
 * varies slightly across templates, so we match by parameter NAME and fall back
 * to a bare "Source" with a plausible object-ID value. Returns the referenced ID.
 */
export function findObjectSource(el: Element): number | undefined {
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

export function parseShape(el: Element, factories: Map<number, string>, linkSourceIds: Set<number>): Shape | undefined {
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

  // Solid fill color for a non-mask filled shape. Motion stores it as a
  // "Fill Color" (id=111) parameter with Red/Green/Blue (ids 1/2/3, 0-1 float)
  // children under the shape's Style → Fill. Used by Lights/Flash's white flash
  // rectangles (which additively/overlay-blend a full-frame white peak). Only
  // read for non-mask shapes; masks provide alpha, not color.
  let fillColor: { r: number; g: number; b: number; a: number } | undefined;
  if (!isMask) {
    // A color-DRIVER shape (Heart's "Gradient"/"Grad color link") either carries
    // a direct `Link` (factory "Link") behavior that pipes its color into another
    // layer, OR is itself referenced as a Link `Source Object` (id=201) by some
    // behavior — i.e. it is a color swatch that other layers link FROM. A genuine
    // decorative card (Center's panels) is neither. Only when the shape is not a
    // color driver do we accept a gradient-mode-flagged (bit-clear) solid Fill
    // Color — see findFillColor's exception comment.
    const shapeId = parseInt(el.getAttribute('id') || '0', 10);
    const hasColorLink =
      linkSourceIds.has(shapeId) ||
      directChildren(el, 'behavior').some(
        b => factories.get(parseInt(b.getAttribute('factoryID') || '0', 10)) === 'Link',
      );
    // Panels_Across authors a couple of STRAY rectangles ("White line",
    // "Rectangle 8") that carry an EXPLICIT `Fill Mode` (id=114) parameter with a
    // bit-clear Fill Color — Motion leaves them transparent (they are decorative
    // guides masked by the panel choreography, not rendered cards). Center's
    // decorative cards carry NO explicit `Fill Mode` param (the fill mode is
    // implicit). So the presence of an explicit `Fill Mode` (id=114) param on a
    // bit-clear shape marks it as an author-controlled fill that Motion does not
    // render solid — do NOT extend the relaxed bit-clear acceptance to it. This
    // keeps Center's cards painted while leaving Panels_Across's stray rectangles
    // transparent (Panels_Across stays on p7's panelFill path). Verified: Center's
    // 7 cards have no Fill Mode param; Panels_Across's 2 stray shapes both do.
    const hasExplicitFillMode = Array.from(el.getElementsByTagName('parameter')).some(
      p => p.getAttribute('name') === 'Fill Mode' && p.getAttribute('id') === '114',
    );
    const fc = findFillColor(el, !hasColorLink && !hasExplicitFillMode);
    if (fc) fillColor = fc;
  }

  // Candidate solid-panel fill: read the "Fill Color" PERMISSIVELY (any solid
  // Fill Mode 0, ignoring the solid-fill flag bit that `findFillColor` requires).
  // This is ONLY a candidate — it is promoted to `isSolidPanel`/`panelFill` at the
  // layer level (parseSceneNode) after the negative-time-Position + offset>in gate
  // confirms the shape is an OFFSET-AUTHORED sweeping panel. Never used to paint a
  // gradient shape (those fail the position/offset gate). Kept off `fillColor` so
  // main's strict solid-fill path (Lights/Flash) and the gradient path are intact.
  let panelFillCandidate: { r: number; g: number; b: number; a: number } | undefined;
  let panelFillOpacityCandidate: number | undefined;
  if (!isMask) {
    const pf = findPanelFillColor(el);
    if (pf) { panelFillCandidate = pf.color; panelFillOpacityCandidate = pf.opacity; }
  }

  // The Fill Color RGB swatch, read even when solid fill is NOT the active mode
  // (gradient/particle-cell shapes). Recovers the base tint a particle field

  // Stroke ("Outline" id=108) geometry — the Objects/Arrows mechanism. When a
  // non-mask shape carries an Outline with a positive Width, its visible geometry
  // is a thick band ALONG the path (with arrow end-caps and an animated arc trim),
  // NOT a fill of the polygon interior. Capture the stroke params so the shape
  // rasterizer can draw the trimmed, capped stroke. Only read for non-mask shapes
  // with an actual positive-Width Outline so ordinary fill/mask shapes are
  // unaffected.
  let stroke: Shape['stroke'];
  {
    // Find the shape's Shape param (id=353) and Outline (id=108). NOTE: a shape
    // with a nested <mask> child (Objects/Arrows C1 has a Circle Mask) would have
    // the mask's own Shape/Outline appear first; the C1 body-arrow stroke is not
    // detected in that case (its geometry would also be mis-sourced from the mask
    // shape), which is acceptable — C1 is one of eight arcs and its bad geometry
    // hurts more than its coverage helps. We simply take the first Shape/Outline.
    const shapeParam = Array.from(el.getElementsByTagName('parameter'))
      .find(p => p.getAttribute('name') === 'Shape' && p.getAttribute('id') === '353');
    const outline = shapeParam
      ? Array.from(shapeParam.getElementsByTagName('parameter'))
        .find(p => p.getAttribute('name') === 'Outline' && p.getAttribute('id') === '108')
      : undefined;
    if (outline) {
      // Width (id=105) — may be static or a curve; strokes here are static width.
      const widthP = Array.from(outline.getElementsByTagName('parameter'))
        .find(p => p.getAttribute('name') === 'Width' && p.getAttribute('id') === '105');
      const width = widthP ? parseFloat(widthP.getAttribute('value') || '0') : 0;
      // Only treat as a STROKED-ARROW shape (Objects/Arrows) when the outline is a
      // genuine heavy arrow stroke — a substantial width AND an arrowhead cap
      // (Start/End Cap 3 or 4). Ordinary shapes carry a thin default outline
      // (Width 2, caps 0/1) that must NOT hijack the fill path: Stylized/Center
      // Reveal ("Color linker") and Event/Heart ("Circle"/"Gradient") shapes have
      // Width-2 outlines with caps 0/1 and are FILLED gradient/decorative shapes.
      // Gating on width>threshold AND an arrow cap keeps them on the fill path
      // (verified: Center Reveal 40.59, Heart 20.78 unchanged) while Arrows'
      // 145–470-px caps-3/4 strokes are detected.
      const capOf = (name: string, id: string): number => {
        const p = Array.from(outline.getElementsByTagName('parameter'))
          .find(q => q.getAttribute('name') === name && q.getAttribute('id') === id);
        const v = p?.getAttribute('value');
        return v !== null && v !== undefined ? parseInt(v, 10) : 0;
      };
      const sc = capOf('Start Cap', '119'), ec = capOf('End Cap', '134');
      const hasArrowCap = sc === 3 || sc === 4 || ec === 3 || ec === 4;
      if (widthP && width > 20 && hasArrowCap) {
        const numOr = (name: string, id: string, def: number): number => {
          const p = Array.from(outline.getElementsByTagName('parameter'))
            .find(q => q.getAttribute('name') === name && q.getAttribute('id') === id);
          if (!p) return def;
          const v = p.getAttribute('value');
          return v !== null ? parseFloat(v) : def;
        };
        // First/Last Point Offset may be a static value OR an animated curve. Read
        // the direct-child curve if present, else the static value.
        const offsetVal = (name: string, id: string, def: number): number | Curve => {
          const p = Array.from(outline.getElementsByTagName('parameter'))
            .find(q => q.getAttribute('name') === name && q.getAttribute('id') === id);
          if (!p) return def;
          const c = firstChild(p, 'curve');
          if (c) {
            const parsed = parseCurve(c);
            if (parsed.keyframes.length >= 2) return parsed;
            // Single-keyframe / valued curve → its scalar value.
            return parsed.keyframes.length === 1 ? parsed.keyframes[0].value
              : (parsed.value ?? parsed.default);
          }
          const v = p.getAttribute('value');
          return v !== null ? parseFloat(v) : def;
        };
        stroke = {
          width,
          startCap: numOr('Start Cap', '119', 0),
          endCap: numOr('End Cap', '134', 0),
          arrowLength: numOr('Arrow Length', '132', 3),
          arrowWidth: numOr('Arrow Width', '133', 3),
          firstPointOffset: offsetVal('First Point Offset', '126', 0),
          lastPointOffset: offsetVal('Last Point Offset', '127', 1),
        };
      }
    }
  }

  // Mask FEATHER (id=105 "Feather"): the soft-edge radius (shape-local units) that
  // Motion blurs the mask alpha by. Read for mask shapes only (a fill shape's
  // Feather softens its FILL, which we don't render for masks). 0/absent = hard
  // edge (unchanged). The scalar lives directly on the shape's "Feather" param.
  let feather: number | undefined;
  if (isMask) {
    for (const p of Array.from(el.getElementsByTagName('parameter'))) {
      if (p.getAttribute('name') !== 'Feather') continue;
      const v = p.getAttribute('value');
      if (v !== null) { const f = parseFloat(v); if (!Number.isNaN(f) && f > 0) { feather = f; break; } }
    }
  }

  const shape: Shape = {
    verticesX,
    verticesY,
    inTangentX: hasTangents ? inTangentX : undefined,
    inTangentY: hasTangents ? inTangentY : undefined,
    outTangentX: hasTangents ? outTangentX : undefined,
    outTangentY: hasTangents ? outTangentY : undefined,
    hasTangents,
    closed,
    isMask,
    feather,
    fillColor,
    // Candidates carried on panelFill/panelFillOpacity; isSolidPanel is set later
    // (parseSceneNode) only if the layer passes the panel gate. If it never passes,
    // isSolidPanel stays falsy and these are ignored by the compositor.
    panelFill: panelFillCandidate,
    panelFillOpacity: panelFillOpacityCandidate,
    stroke,
    fillGradient: isMask ? undefined : parseFillGradient(el),
  };

  // ANIMATED VERTICES (T-q11397f86, Stylized/Center_Reveal). Publish the per-
  // vertex Value Curves into the WeakMap side-channel keyed by this Shape
  // object. The evaluator (evaluator/index.ts) samples them at the current
  // frame's `curveTime` and MUTATES `shape.verticesX[i]/verticesY[i]` in place
  // before compositing. Only registered when at least one axis has at least one
  // animated vertex — a fully-static shape keeps its byte-neutral fast path.
  let hasAnyVertexCurve = false;
  const xCurves: (Curve | undefined)[] = new Array(n);
  const yCurves: (Curve | undefined)[] = new Array(n);
  for (let i = 0; i < n; i++) {
    if (axisX[i].valueCurve && axisX[i].valueCurve!.keyframes.length >= 2) {
      xCurves[i] = axisX[i].valueCurve;
      hasAnyVertexCurve = true;
    }
    if (axisY[i].valueCurve && axisY[i].valueCurve!.keyframes.length >= 2) {
      yCurves[i] = axisY[i].valueCurve;
      hasAnyVertexCurve = true;
    }
  }
  if (hasAnyVertexCurve) {
    shapeVertexAnimations.set(verticesX, { xCurves, yCurves });
  }

  return shape;
}

/**
 * Parse a shape's Fill Mode = gradient STOP LIST from Style → Fill → "Gradient"
 * (id=104) → "RGB" tags folder (id=1). Each stop child is a scenenode ("RGB1"/
 * "RGB2"/…, factoryID=3) carrying a "Location" (id=1) curve and a "Color" (id=3)
 * folder with Red/Green/Blue (ids 1/2/3, factoryID=24) curves (0..1 float). The
 * stop scenenode's own id is the `tagId` that a colour-Link targets via
 * `.../104/1/<tagId>/3/{1,2,3}`. Returns undefined when the shape has no gradient
 * tags (solid-fill / plain shapes) so this is additive + behavior-neutral until a
 * gradient rasteriser consumes it. See docs/notes/GRADIENT_TAG_COLOUR_LINK_RE.md.
 *
 * Structural only — matches on parameter ids (104 Gradient, 1 RGB folder, 3 Color,
 * 1/2/3 R/G/B), never on transition/shape name.
 */
function parseFillGradient(shapeEl: Element): { stops: { tagId: number; location: number; color: { r: number; g: number; b: number } }[] } | undefined {
  // Find the "Gradient" (id=104) parameter (there may be several — take the first
  // that actually carries an RGB tags folder with stops).
  const params = Array.from(shapeEl.getElementsByTagName('parameter'));
  for (const grad of params) {
    if (grad.getAttribute('id') !== '104') continue;
    // RGB tags folder: a direct child <parameter name="RGB" id="1">.
    const rgbFolder = directChildren(grad, 'parameter').find(
      p => p.getAttribute('id') === '1' && (p.getAttribute('name') || '').toUpperCase() === 'RGB',
    );
    if (!rgbFolder) continue;
    const stops: { tagId: number; location: number; color: { r: number; g: number; b: number } }[] = [];
    // Each stop is a direct <parameter> child of the RGB folder (RGB1, RGB2, …),
    // itself an id'd scenenode-style parameter (factoryID=3).
    for (const stop of directChildren(rgbFolder, 'parameter')) {
      const tagId = parseInt(stop.getAttribute('id') || '0', 10);
      if (!tagId) continue;
      // Location (id=1) curve value; Color (id=3) folder → Red/Green/Blue curves.
      let location = 0;
      let color: { r: number; g: number; b: number } | undefined;
      for (const sub of directChildren(stop, 'parameter')) {
        const sid = sub.getAttribute('id');
        if (sid === '1') {
          location = curveValueOf(sub) ?? 0;
        } else if (sid === '3') {
          // Color folder: Red(1)/Green(2)/Blue(3) curves, 0..1 float.
          let r: number | undefined, g: number | undefined, b: number | undefined;
          for (const ch of directChildren(sub, 'parameter')) {
            const cid = ch.getAttribute('id');
            const v = curveValueOf(ch);
            if (v === undefined) continue;
            if (cid === '1') r = v;
            else if (cid === '2') g = v;
            else if (cid === '3') b = v;
          }
          if (r !== undefined && g !== undefined && b !== undefined) color = { r, g, b };
        }
      }
      if (color) stops.push({ tagId, location, color });
    }
    if (stops.length > 0) return { stops };
  }
  return undefined;
}

/**
 * Read a parameter's scalar value: prefer a nested <curve> value/default, else the
 * parameter's own value/default attribute. Motion stores gradient stop channels as
 * <curve> children (see the RE note); a plain attribute is the fallback.
 */
function curveValueOf(param: Element): number | undefined {
  const curve = firstChild(param, 'curve');
  if (curve) {
    const cv = curve.getAttribute('value');
    if (cv !== null && !isNaN(parseFloat(cv))) return parseFloat(cv);
    const cd = curve.getAttribute('default');
    if (cd !== null && !isNaN(parseFloat(cd))) return parseFloat(cd);
  }
  const v = param.getAttribute('value');
  if (v !== null && !isNaN(parseFloat(v))) return parseFloat(v);
  const d = param.getAttribute('default');
  if (d !== null && !isNaN(parseFloat(d))) return parseFloat(d);
  return undefined;
}

/**
 * Permissive "Fill Color" (id=111) reader for candidate solid-panel shapes.
 *
 * Unlike `findFillColor` (which REQUIRES the solid-fill flag bit 0x100000000 and
 * powers Lights/Flash), this reads the Fill Color regardless of that flag, but
 * ONLY when the shape's Fill Mode (id=114) is 0 (solid color). The Stylized/Panels
 * sweeping rectangles are Fill Mode 0 with the flag CLEAR, so `findFillColor`
 * skips them. This candidate is gated at the layer level by the negative-time
 * Position + offset>in test before it is ever painted, so gradient-rendered
 * Fill-Mode-0 shapes (Heart, Center Reveal) never reach the panel-paint path.
 */
function findPanelFillColor(shapeEl: Element): { color: { r: number; g: number; b: number; a: number }; opacity: number } | undefined {
  const params = Array.from(shapeEl.getElementsByTagName('parameter'));
  // Require Fill Mode 0 (solid). If a Fill Mode param exists and is non-zero, the
  // shape renders a gradient/texture, not a flat color.
  for (const p of params) {
    if (p.getAttribute('name') === 'Fill Mode' && p.getAttribute('id') === '114') {
      const v = p.getAttribute('value');
      if (v !== null && parseFloat(v) !== 0) return undefined;
      break;
    }
  }
  for (const p of params) {
    if (p.getAttribute('name') !== 'Fill Color' || p.getAttribute('id') !== '111') continue;
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
    if (r === undefined || g === undefined || b === undefined) continue;
    // Fill Opacity (id=141) is a SIBLING of Fill Color inside the Fill group.
    // Find the closest Fill Opacity param following this Fill Color, if any.
    let opacity = 1;
    const parent = (p as any).parentNode as Element | null;
    if (parent) {
      for (const sib of directChildren(parent, 'parameter')) {
        if (sib.getAttribute('name') === 'Fill Opacity' && sib.getAttribute('id') === '141') {
          const vAttr = sib.getAttribute('value');
          const dAttr = sib.getAttribute('default');
          const ov = vAttr !== null ? parseFloat(vAttr) : (dAttr !== null ? parseFloat(dAttr) : NaN);
          if (!isNaN(ov)) opacity = ov;
          break;
        }
      }
    }
    return { color: { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: 1 }, opacity };
  }
  return undefined;
}

/**
 * Read a Shape node's solid "Fill Color" (id=111) → Red/Green/Blue (0-1) as
 * 0-255 RGB. Returns undefined when no Fill Color param is present. Prefers the
 * animated `value` over `default`. Only the FIRST Fill Color found (the shape's
 * own fill) is used.
 */
function findFillColor(
  shapeEl: Element,
  allowGradientModeSolid: boolean,
): { r: number; g: number; b: number; a: number } | undefined {
  const params = Array.from(shapeEl.getElementsByTagName('parameter'));
  for (const p of params) {
    if (p.getAttribute('name') !== 'Fill Color' || p.getAttribute('id') !== '111') continue;
    // Distinguish a SOLID-fill shape (whose Fill Color is the rendered fill —
    // e.g. Lights/Flash's white flash rectangles) from a GRADIENT-fill shape
    // (whose Fill Color is only a swatch; the shape actually renders its Gradient
    // — e.g. Stylized/Heart's reveal shapes). Motion sets bit 0x100000000 in the
    // "Fill Color" (id=111) flags when solid color is the ACTIVE fill mode; a
    // gradient-mode shape leaves it clear.
    //
    // EXCEPTION (Stylized/Kinetic/Center's decorative cards): some solidly-filled
    // shapes leave that bit CLEAR (flags 0x2xxxxxxxx) yet render their solid Fill
    // Color — the "Gradient" sub-branch is the untouched red→blue placeholder.
    // These are indistinguishable from Heart's gradient shapes by the flag alone
    // (Heart's shapes share the exact same 0x2xxxxxxxx pattern). The structural
    // discriminator: Heart's shapes are COLOR-DRIVERS — they carry `Link`
    // (factory "Link") behaviors that pipe their color into a gradient/other layer
    // (affectingChannel `.../113/104/...`). A genuine decorative card carries NO
    // such Link behavior. So when the shape has no color-publishing Link behavior
    // (`allowGradientModeSolid`), accept its solid Fill Color even with the bit
    // clear. This keeps Heart/Center Reveal/Wipes on the gradient path while
    // painting Center's cards (Center 4.0→ double digits).
    //
    // NB: JS bitwise ops are 32-bit; bit 32 (0x100000000) must be tested via
    // floating-point division, not `&`.
    const flags = Number(p.getAttribute('flags') || '0');
    const solidFillActive = Math.floor(flags / 0x100000000) % 2 === 1;
    if (!solidFillActive && !allowGradientModeSolid) return undefined;
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
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: 1 };
    }
  }
  return undefined;
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
 *
 * ANIMATED VERTICES (T-q11397f86, Stylized/Center_Reveal): a vertex Value
 * parameter can carry a `<curve>` (keypoint list) child in addition to (or
 * instead of) the static `value` attribute. When present, we parse the Curve
 * and stash it on `AxisVertex.valueCurve`; the caller then publishes a
 * ShapeVertexAnimation entry so the evaluator can sample at frame time. The
 * static `value` — the current-frame scalar — is read from the curve's own
 * `value` attribute (or `default` as a fallback, or the first keyframe's
 * value), matching Motion's authored-state semantics. Static vertices (no
 * `<curve>`) still read the direct `value` attribute exactly as before, so a
 * shape with no animated vertices parses byte-identically to origin/main.
 */
function extractAxisVertices(curveEl: Element): AxisVertex[] {
  const verts: AxisVertex[] = [];
  // ANIMATED VERTEX VALUE (T-q11397f86) — default OFF (opt-in via
  // `FCT_ANIMATED_VERTEX=1`) because promoting previously-dropped animated
  // vertices from undefined to real numeric geometry changes the parsed shape
  // count for masks that authored ONLY a `<curve>` Value with no static
  // `value` attribute on the outer parameter (e.g. Heart's Bezier/Swoosh/
  // Shadow/Bezier 4/Bezier 5 lifted-shape masks) — the old code SKIPPED
  // those vertices, so the entire shape had 0 vertices and was dropped by
  // parseShape's `axisX.length === 0` guard. Turning that path on
  // unconditionally regressed Stylized__Heart 18.24→13.83 in the full-corpus
  // gate. Under the flag we parse the animated curve AND accept a scalar
  // snapshot from the curve's `value`/`default`/first-keyframe; without the
  // flag the outer-attr scan is byte-identical to origin/main.
  const animatedVertexEnabled = typeof process !== 'undefined'
    && process.env?.FCT_ANIMATED_VERTEX === '1';
  for (const vertex of directChildren(curveEl, 'vertex')) {
    const folder = firstChild(vertex, 'vertex_folder');
    if (!folder) continue;
    const idx = parseInt(vertex.getAttribute('index') || '0', 10);
    let value: number | undefined;
    let valueCurve: Curve | undefined;
    let inTangent: number | undefined;
    let outTangent: number | undefined;
    for (const param of directChildren(folder, 'parameter')) {
      const id = param.getAttribute('id');
      // Animated vertex Value: a `<curve>` child on the Value parameter (id=2).
      // Read the CURVE's `value` attribute (Motion's authored current-frame
      // sample) for the static snapshot; the evaluator will overwrite this
      // in-place at frame time. Only the Value axis (id=2) is animated on the
      // shapes we've seen (Center_Reveal); tangents stay static — Motion never
      // authors per-vertex tangent curves in the built-in transition corpus.
      if (id === '2' && animatedVertexEnabled) {
        const inner = firstChild(param, 'curve');
        if (inner) {
          const parsed = parseCurve(inner);
          valueCurve = parsed;
          // Snapshot: prefer the curve's `value` attr (Motion's rendered state
          // at document authoring time), else first keyframe, else `default`.
          if (parsed.value !== undefined) value = parsed.value;
          else if (parsed.keyframes.length > 0) value = parsed.keyframes[0].value;
          else value = parsed.default;
          continue;
        }
      }
      const vAttr = param.getAttribute('value');
      const v = vAttr !== null ? parseFloat(vAttr) : NaN;
      if (isNaN(v)) continue;
      // id=2 → Value, id=4 → Input Tangent, id=5 → Output Tangent.
      if (id === '2') value = v;
      else if (id === '4') inTangent = v;
      else if (id === '5') outTangent = v;
    }
    if (value === undefined) continue;
    verts.push({ index: idx, value, valueCurve, inTangent, outTangent });
  }
  verts.sort((a, b) => a.index - b.index);
  return verts;
}
