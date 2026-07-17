/**
 * Compositor — geometry, projection, and per-layer detection helpers.
 *
 * Pure(ish) helpers used by renderLayer that never recurse into the render graph:
 * the framed-camera look-at basis (framedCameraBasis/projectFramed), the drop-zone
 * placeholder cell, cell/content bbox math (cellContentBBox/transformBBoxToOutput/
 * centerEvaluatedLayer), page-flip detection (detectPageFlip), coplanar-stack
 * detection (isFlatCoplanarStack), and the retimed clip-time resolver. Split out of
 * compositor/index.ts (ROADMAP item 7).
 */
import type { EvaluatedLayer } from '../evaluator/index.js';
import type { RenderContext } from './context.js';
import { evaluateCurve } from '../evaluator/curves.js';

/** Orthonormal look-at camera basis from a resolved framing pose (eye→target). */
export function framedCameraBasis(
  framed: { eye: [number, number, number]; target: [number, number, number]; aov: number },
  frameHeight: number,
): { eye: [number, number, number]; right: [number, number, number]; up: [number, number, number]; fwd: [number, number, number]; focal: number } {
  const eye = framed.eye;
  let fx = framed.target[0] - eye[0], fy = framed.target[1] - eye[1], fz = framed.target[2] - eye[2];
  const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  const wu: [number, number, number] = [0, 1, 0];
  let rx = fy * wu[2] - fz * wu[1], ry = fz * wu[0] - fx * wu[2], rz = fx * wu[1] - fy * wu[0];
  const rl = Math.hypot(rx, ry, rz) || 1; rx /= rl; ry /= rl; rz /= rl;
  const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
  const focal = (frameHeight / 2) / Math.tan((framed.aov * Math.PI) / 360);
  return { eye, right: [rx, ry, rz], up: [ux, uy, uz], fwd: [fx, fy, fz], focal };
}

/**
 * Project a world point through the look-at camera to a centre-relative screen
 * offset (+x right, +y up) plus the per-point perspective scale (focal/depth).
 * Returns null when the point is at/behind the camera plane.
 */
export function projectFramed(
  wx: number, wy: number, wz: number,
  cam: { eye: [number, number, number]; right: [number, number, number]; up: [number, number, number]; fwd: [number, number, number]; focal: number },
): { sx: number; sy: number; ps: number } | null {
  const dx = wx - cam.eye[0], dy = wy - cam.eye[1], dz = wz - cam.eye[2];
  const cz = dx * cam.fwd[0] + dy * cam.fwd[1] + dz * cam.fwd[2];
  if (cz <= 1e-3) return null;
  const cx = dx * cam.right[0] + dy * cam.right[1] + dz * cam.right[2];
  const cy = dx * cam.up[0] + dy * cam.up[1] + dz * cam.up[2];
  const ps = cam.focal / cz;
  return { sx: cx * ps, sy: cy * ps, ps };
}

/**
 * Motion Drop Zone placeholder fill for an UNFILLED user-media well
 * (dropZone.type===3 with an empty Fill Color). Decompiled from Ozone's
 * OZImageElement::createDropZoneGridBitmap (the placeholder-grid generator draws
 * its cells at RGB 0x96,0x96,0x96 = 150). This is the generator's own default fill
 * read from the framework — NOT a value traced from any GT frame. Cached by size.
 */
const DROPZONE_PLACEHOLDER_GRAY = 0x96; // 150 — Ozone createDropZoneGridBitmap constant
export function dropZonePlaceholderCell(rctx: RenderContext, w: number, h: number): ImageData {
  const cached = rctx.dzPlaceholder;
  if (cached && cached.w === w && cached.h === h) return cached.img;
  const data = new Uint8ClampedArray(w * h * 4);
  const g = DROPZONE_PLACEHOLDER_GRAY;
  for (let i = 0; i < data.length; i += 4) { data[i] = g; data[i + 1] = g; data[i + 2] = g; data[i + 3] = 255; }
  const img = new ImageData(data, w, h);
  rctx.dzPlaceholder = { w, h, img };
  return img;
}

/** Non-transparent pixel bounding box of a full-frame cell buffer, or null. */
export function cellContentBBox(img: ImageData): { x0: number; y0: number; x1: number; y1: number } | null {
  const w = img.width, h = img.height, d = img.data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      if (d[row + x * 4 + 3] > 0) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  return { x0, y0, x1, y1 };
}

/**
 * Map a source-pixel bbox through the cell's world transform to an output-space
 * integer bbox, so the blit loop only visits pixels the cell can actually cover.
 * The transform maps SOURCE-centered coords to DEST-centered coords (Y-down).
 */
export function transformBBoxToOutput(
  src: ImageData,
  bbox: { x0: number; y0: number; x1: number; y1: number },
  m: Float64Array
): { x0: number; y0: number; x1: number; y1: number } {
  const sw = src.width, sh = src.height;
  // Requires the DEST image dims; the compositor is single-size, so use src dims
  // (cell buffers are full-frame, same size as output).
  const dw = sw, dh = sh;
  const a = m[0], b = m[4], tx = m[12];
  const c = m[1], d = m[5], ty = m[13];
  const corners = [
    [bbox.x0, bbox.y0], [bbox.x1, bbox.y0], [bbox.x0, bbox.y1], [bbox.x1, bbox.y1],
  ];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [sx, sy] of corners) {
    const scx = sx - sw / 2, scy = sy - sh / 2;
    const dcx = a * scx + b * scy + tx;
    const dcy = c * scx + d * scy + ty;
    const px = dcx + dw / 2;
    const py = dcy + dh / 2;
    if (px < x0) x0 = px; if (px > x1) x1 = px;
    if (py < y0) y0 = py; if (py > y1) y1 = py;
  }
  // Pad by 1px for bilinear sampling.
  return { x0: Math.floor(x0) - 1, y0: Math.floor(y0) - 1, x1: Math.ceil(x1) + 1, y1: Math.ceil(y1) + 1 };
}

/**
 * Clone an EvaluatedLayer subtree with its top-level world translation removed,
 * so it renders centered at the frame origin. Child world transforms are shifted
 * by the same delta to preserve their relative layout.
 */
export function centerEvaluatedLayer(el: EvaluatedLayer): EvaluatedLayer {
  const dx = el.worldTransform[12];
  const dy = el.worldTransform[13];
  const shift = (l: EvaluatedLayer): EvaluatedLayer => {
    const wt = new Float64Array(l.worldTransform);
    wt[12] -= dx; wt[13] -= dy;
    return {
      ...l,
      worldTransform: wt,
      visible: true,
      children: l.children.map(shift),
    };
  };
  return shift(el);
}

/** PAEFlop plugin UUID (Movements/Flip's back-page mirror filter). */
const PAEFLOP_UUID = '2FF8887B-E673-4727-9601-1B3353531C10';

/**
 * Detect the PAEFlop page-flip pattern (Movements/Flip): a Group whose Rotation Y
 * is driven 0→π and that holds two full-frame page children, the BACK page (B)
 * carrying a PAEFlop filter. Returns the front/back page eval-layers plus the
 * group's current Y-rotation angle θ (radians), or null if this isn't a flip
 * group. Structural + UUID match only — no name/English heuristics.
 */
export function detectPageFlip(group: EvaluatedLayer): { front: EvaluatedLayer; back: EvaluatedLayer; theta: number } | null {
  if (group.layer.type !== 'group') return null;
  const imgs = group.children.filter(c => (c.layer.type === 'image' || c.layer.type === 'generator') && c.layer.source);
  if (imgs.length !== 2) return null;
  const hasFlop = (c: EvaluatedLayer) => c.layer.filters.some(f => f.pluginUUID.toUpperCase() === PAEFLOP_UUID);
  const back = imgs.find(hasFlop);
  const front = imgs.find(c => !hasFlop(c));
  if (!back || !front) return null;
  // Extract the group's Y-rotation θ from its world transform (Y-rot puts cosθ at
  // m0 and sinθ at m8 — see mat4RotateY). The flip is only meaningful once the
  // group actually rotates about Y.
  const m = group.worldTransform;
  const theta = Math.atan2(m[8], m[0]);
  return { front, back, theta };
}

/**
 * A FLAT coplanar 2D stack: ≥2 visible full-frame image/clone/generator layers
 * that carry ONLY Z-rotation (no camera-facing 3D X/Y tilt), with at least one
 * Clone Layer. This is the Movements/Switch signature (Clone B + the two rotating
 * drop zones). Such groups composite in DECLARED order (LAST-listed on top),
 * unlike the default reverse convention. The 3D-hinge groups (Rotate/Reflection/
 * Flip) are excluded: their pages carry X/Y rotation, which couples into the world
 * matrix's third row/col, so this returns false for them.
 */
export function isFlatCoplanarStack(children: EvaluatedLayer[], groupLayer?: import('../types.js').Layer): boolean {
  const content = children.filter(c =>
    c.layer.type === 'image' || c.layer.type === 'clone' || c.layer.type === 'generator');
  if (content.length < 2) return false;
  if (!content.some(c => c.layer.type === 'clone')) return false;
  // A pure Z-rotation + translation + scale matrix has m2,m6,m8,m9 ≈ 0. A Y- or
  // X-rotation (page flip / hinge) puts sinθ into m8 / m6, so any non-trivial value
  // there means the layer is not coplanar-2D.
  for (const c of content) {
    const m = c.worldTransform;
    if (Math.abs(m[2]) > 1e-3 || Math.abs(m[6]) > 1e-3 || Math.abs(m[8]) > 1e-3 || Math.abs(m[9]) > 1e-3) return false;
  }
  // The instantaneous matrix test above passes for a GENUINE flat 2D stack
  // (Movements/Switch — its content is coplanar for the WHOLE transition), but it
  // ALSO passes at the single instant a 3D-FOLD group is momentarily flat.
  // Movements/Pinwheel and Replicator-Clones/Concentric fold their tiles about X/Y
  // over time; at t=0 every fold angle is exactly 0 (sinθ = 0 → m6/m8 = 0), so the
  // matrix test wrongly flips the group to forward render order and lands the
  // last-listed (source-B) clone on TOP for the FIRST frame (Pinwheel f00,
  // Concentric f00–f01 rendered blue photo-B instead of the brown photo-A the GT
  // starts on; the momentary-flat squares also carry an INVISIBLE fold-driver image
  // whose own X/Y rotation is what un-flattens the group for t>0). Reject any group
  // whose group transform OR whose content subtree carries an ANIMATED X/Y-rotation
  // CURVE that reaches a non-trivial angle — a 3D fold that WILL tilt out of plane
  // even when momentarily flat. Curve-based, so it holds at every instant including
  // t=0. Switch has no X/Y-rotation curve anywhere → stays a flat stack; the fold
  // rotation lives on Pinwheel's invisible "square_fix" fold-driver child and on
  // Concentric's per-tile "copy" GROUP (an ancestor of the clones, hence the
  // groupLayer check) → both correctly excluded. Structural (curve shape), not a
  // per-transition name.
  if (groupLayer && (curveReachesNonZero(groupLayer.transform?.rotationX) || curveReachesNonZero(groupLayer.transform?.rotationY))) return false;
  for (const c of content) {
    if (subtreeHasOutOfPlaneRotationCurve(c.layer)) return false;
  }
  return true;
}

/**
 * True when a layer OR any descendant carries an X- or Y-rotation CURVE that
 * reaches a non-trivial angle across its keyframes — i.e. somewhere in this
 * subtree there is a 3D fold that tilts out of the 2D plane over time. Used by
 * isFlatCoplanarStack to reject a momentarily-coplanar 3D-fold group (at t=0 its
 * sin(θ) matrix terms vanish, but the CURVE still proves the fold).
 */
function subtreeHasOutOfPlaneRotationCurve(layer: import('../types.js').Layer): boolean {
  const tx = layer.transform;
  if (tx && (curveReachesNonZero(tx.rotationX) || curveReachesNonZero(tx.rotationY))) return true;
  for (const child of layer.children) {
    if (subtreeHasOutOfPlaneRotationCurve(child)) return true;
  }
  return false;
}

/** True when a rotation channel (curve or constant) ever reaches |angle| > 1e-3. */
function curveReachesNonZero(c: import('../types.js').Curve | number | undefined): boolean {
  if (c === undefined) return false;
  if (typeof c === 'number') return Math.abs(c) > 1e-3;
  const kfs = c.keyframes;
  if (kfs && kfs.length > 0) {
    for (const k of kfs) if (Math.abs(k.value) > 1e-3) return true;
    return false;
  }
  return Math.abs(c.value ?? c.default ?? 0) > 1e-3;
}


/**
 * Absolute forward clip time (seconds) for a VIDEO media leaf whose Retime Value
 * curve stores clip FRAME numbers. Motion plays such a clip along its own
 * timeline: the Retime curve maps the layer-LOCAL time (scene mediaTime minus the
 * layer offset) to a clip frame; dividing by the clip's frame rate yields the
 * clip second to seek. This is the authoritative per-clip playhead for
 * screen-blend overlays like Lights/Light Noise (the light-noise .mov plays
 * FORWARD through the transition — NOT the reverse heuristic used for the
 * un-falling Veil/Leaves overlays, which lack a frame-numbered Retime curve on
 * their base clip). Returns undefined when there is no usable frame-numbered
 * retime curve, so the caller falls back to the global mediaTime + reverse.
 */
export function retimedClipTime(evalLayer: EvaluatedLayer, rctx: RenderContext): number | undefined {
  const layer = evalLayer.layer;
  if (!layer.source || layer.source.type !== 'media') return undefined;
  // SCOPE (fix 2026-07-06): the forward frame-numbered clip playhead is ONLY correct
  // for a SCREEN/ADD-blend light overlay that FCP plays forward along its own Retime
  // timeline (Lights/Light Noise). Normal-blend media overlays with a wipe-matte
  // (Objects/Leaves, Objects/Veil) ALSO carry a frame-numbered retimeValue ([1..42])
  // but FCP plays them via the reverse heuristic (progress 0 = clip last frame) —
  // forcing them onto this forward path regressed Leaves 13.41→7.23 and Veil
  // 18.64→16.10. Gate on the same blend modes as p12's other Light-Noise changes so
  // reverse-played normal overlays keep the fallback (rctx.mediaTime + reverse).
  const bm = layer.blendMode;
  if (bm !== 'screen' && bm !== 'add' && bm !== 'overlay' && bm !== 'lighten') return undefined;
  const rv = layer.retimeValue;
  if (!rv || rv.keyframes.length < 2) return undefined;
  const fps = layer.source.frameRate;
  if (!fps || fps <= 0) return undefined;
  // Frame-numbered retime curves span a wide frame range (Light Noise 24→119).
  // A curve whose values are ~[0,1] is a normalized progress retime, not a clip
  // frame index — leave those to the fallback path.
  const first = rv.keyframes[0].value;
  const last = rv.keyframes[rv.keyframes.length - 1].value;
  if (Math.max(first, last) <= 2) return undefined;
  // Layer-local time = scene media time minus the layer's timeline offset.
  const off = layer.timing ? (layer.timing.offset.timescale > 0
    ? layer.timing.offset.value / layer.timing.offset.timescale : 0) : 0;
  const localTime = rctx.mediaTime - off;
  const frame = evaluateCurve(rv, localTime);
  // Motion's Retime Value / Page Number is a 1-BASED frame index: frame 1 is the
  // clip's FIRST frame (presentation time 0). Convert to the 0-based presentation
  // time the host resolver seeks with: clipTime = (frame - 1) / fps.
  return Math.max(0, (frame - 1) / fps);
}


// ============================================================================
// Planar floor-reflection primitive  (Movements/Reflection — T-qa7694deb decode)
// ============================================================================
//
// DECODE (Reflection.motr, verified 2026-07-16):
//
// The tail-difference vs the GUI GT on Movements/Reflection is NOT a perspective
// error (that whole line is a MEASURED dead-end — ROADMAP T-qreflect001 +
// T-q50a7f2e6: every camera-distance / hinge-relative variant is monotonic toward
// orthographic). The residual is a DIM MIRRORED COPY of the two folded panels on a
// reflective floor plane, which the engine does not render at all.
//
// The floor is the scenenode **"Color Solid 1"** (id 1999871095), a sibling of the
// two `Transition A/B` panels under the Project. Its Object is a BLACK 1920×1080
// Color Solid (`<Blue value=0/>`, R/G absent = default 0 → black; this is the
// footage.ts::"Reflection's Floor Color Solid" exception, which correctly returns
// {r:0,g:0,b:0}). Its Properties place it as a laid-flat mirror below the scene:
//   Position.Y = -540        (below the frame centre)
//   Rotation.X = +π/2        (tilted flat, normal pointing up: the "floor")
//   Scale      = 4× (X=Y=Z)  (a 4× oversized sheet so the reflection covers frame)
// and — the decisive signal — its Properties carry an ENABLED **Reflection** folder:
//   Reflectivity  = 0.20     (id 228)
//   Falloff.End Distance = 248 (id 226)
//
// GENERIC DISCRIMINATOR (why this is not a per-transition hardcode): EVERY Motion
// object serialises a Reflection folder, but it is DISABLED by default and left at
// Reflectivity=0.80 with the inactive-param flag class 0x3_0000_0010 (e.g.
// 12884901904) plus inert Blur Amount / Blend Mode children. Reflection's floor is
// the ONLY corpus layer whose Reflectivity is a NON-default value (0.20) carried on
// the ENABLED-param flag class 0x2_0000_0010 (8589934608, the same class as its live
// Position/Rotation params) AND accompanied by a Falloff→End Distance child. So
// "reflection is actually ON" is read from the flag class + non-default value +
// Falloff child, never from a slug name. (Scan: fct — 0.80 default fires on ~30
// slugs as an inert default; 0.20-enabled fires on Reflection alone today, but the
// test is structural so it generalises to any future template that turns it on.)
//
// SEMANTICS (a) screen-space vs re-render: Motion's object Reflection is a PLANAR
// mirror — it reflects the OTHER 3D objects in the scene across the plane of the
// reflective object, in world space, then re-projects through the SAME camera. So
// the reflection re-renders the panel subtree through a mirror transform (a Y-flip
// about the floor plane baked into the world matrix), NOT a 2D screen-space flip of
// the already-composited frame. reflectionPlaneMatrix() below builds exactly that
// world-space mirror: reflect across the horizontal plane y = planeY, so a world
// point (x,y,z) → (x, 2·planeY − y, z), which the existing projectFramed() then
// renders. Compose it with each panel's worldTransform to get the mirrored quad.
//   (b) retime/opacity tie: the reflection is the SAME panels re-rendered, so it is
// inherently locked to the panels' retime + fold — no separate driver. Its VISIBLE
// opacity is Reflectivity (0.20) times the distance-falloff attenuation.
//   (c) fade/glow: Falloff.End Distance=248 is a linear distance fade — reflectivity
// ramps 1→0 over 0..248 world-units from the mirror plane, so far parts of the
// panels barely reflect (the reflection darkens toward the horizon). No additive
// glow (Blend Mode is absent on the enabled folder → default Normal/over blend).
//
// STATUS: this is a pure geometry PRIMITIVE (matrix + attenuation math). It is
// INERT — nothing calls it yet, so it changes NO render output and the gate stays
// green. Wiring it is a compositor-lane job (see the cross-lane note in ROADMAP):
// the reflective-floor scene node must be detected in compositor/index.ts, the panel
// subtree re-rendered under reflectionPlaneMatrix(planeY) with its per-pixel alpha
// scaled by reflectivity·falloffAttenuation(depth), and composited UNDER the panels.
// Kept here (a SHARED perspective/fold primitive file) so the fold-rig family can
// reuse it and so this decode is not lost.

/** Decoded floor-reflection constants for Movements/Reflection (Reflection.motr). */
export const REFLECTION_FLOOR = {
  /** Color Solid 1 Position.Y — the mirror plane's world Y (below frame centre). */
  planeY: -540,
  /** Reflection.Reflectivity (id 228) — base mirror opacity. Default is 0.80. */
  reflectivity: 0.2,
  /** Reflection.Falloff.End Distance (id 226) — linear fade-out distance (world u). */
  falloffEndDistance: 248,
} as const;

/**
 * Build a 4×4 (column-major, matching mat4* in the evaluator) WORLD-SPACE mirror
 * matrix that reflects a point across the horizontal plane y = planeY. Composing
 * this on the LEFT of a panel's worldTransform yields the mirrored panel geometry,
 * which projectFramed() then renders through the unchanged camera — Motion's planar
 * object-Reflection, not a 2D screen flip. Mirror across y=planeY:
 *   x' = x,  y' = 2·planeY − y,  z' = z.
 * As a column-major 4×4 that is diag(1,-1,1,1) with a +2·planeY translation in the
 * Y column's w-row (m13). Pure, allocation-cheap, no scene access.
 */
export function reflectionPlaneMatrix(planeY: number): Float64Array {
  const m = new Float64Array(16);
  m[0] = 1;             // x' = x
  m[5] = -1;            // y' = -y ...
  m[10] = 1;            // z' = z
  m[15] = 1;
  m[13] = 2 * planeY;   // ... + 2·planeY   (column-major translation row)
  return m;
}

/**
 * Linear distance-falloff attenuation for the reflection, decoded from
 * Reflection.Falloff.End Distance. Reflectivity ramps from full at the mirror plane
 * (distance 0) to zero at `endDistance`, clamped to [0,1]. `distance` is the
 * world-space separation of the reflected surface point from the mirror plane
 * (|y − planeY|); the compositor multiplies this by REFLECTION_FLOOR.reflectivity to
 * get each reflected pixel's final opacity.
 */
export function falloffAttenuation(distance: number, endDistance: number): number {
  if (endDistance <= 0) return 0;
  const t = 1 - distance / endDistance;
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
