/**
 * Compositor — Movements/Drop In card conform.
 *
 * Drop In renders its two Transition A/B drop zones NOT full-frame but conformed into a
 * smaller CARD anchored at the scene's top-left (the drop-zone media is ~600px tall in a
 * 720px scene). detectDropInCard derives the card geometry from the scene; blitDropInCard
 * draws a source through that conform (image A static, image B riding the bounce behind
 * it). Split out of compositor/index.ts (ROADMAP item 7).
 */
import type { Curve } from '../types.js';
import type { EvaluatedScene } from '../evaluator/index.js';
import type { DropInCard } from './context.js';

/**
 * Detect Movements/Drop In and compute its card-conform geometry.
 *
 * Drop In's signature (distinct from Push, which fills the frame): the scene is
 * authored SMALLER than the output (1280×720 → 1920×1080 upscale), it has two
 * Transition A/B drop-zone image nodes, and the incoming (Transition B) node
 * carries a multi-keyframe Position-Y BOUNCE curve that starts ≈ one scene-height
 * below (value ≈ scene height, so B enters from off-screen bottom) and settles to
 * 0 with decaying overshoot. Push has no such per-panel bounce and its scene ==
 * output. Divide/other upscaled templates have no Transition-B position bounce.
 *
 * The card geometry: the drop-zone media is 600px tall (its Fixed Height, a square
 * 600×600 media box). Motion conforms the source to that media box's HEIGHT and
 * pins it to the scene's top-left, then the whole scene scales to output. So the
 * card height in output = (mediaFixedHeight / sceneH) × outputH, and the width
 * follows the source's aspect. Validated: mediaH=600, sceneH=720, outputH=1080 →
 * cardH = 900 (GT measures 902); cardW = cardH × srcAspect (GT measures 1588).
 */
export function detectDropInCard(
  scene: EvaluatedScene,
  imageA: ImageData,
  imageB: ImageData,
  outputW: number,
  outputH: number
): DropInCard | undefined {
  // Only the upscale case (scene authored smaller than output).
  if (!(scene.width < outputW && scene.height < outputH)) return undefined;

  // Find the two Transition A/B drop-zone image nodes and B's Position-Y bounce.
  let aId: number | undefined, bId: number | undefined;
  let bBounce: Curve | undefined;
  for (const l of scene.layerById.values()) {
    if (l.type !== 'image' || !l.source) continue;
    if (l.source.type === 'transitionA' && l.dropZone) aId = l.id;
    if (l.source.type === 'transitionB' && l.dropZone) {
      bId = l.id;
      const py = l.transform?.positionY;
      if (py && typeof py === 'object' && py.keyframes && py.keyframes.length >= 4) bBounce = py;
    }
  }
  if (aId === undefined || bId === undefined || !bBounce) return undefined;

  // The bounce must ENTER from ~one scene-height below (off-screen bottom) and
  // settle near 0 — the "drop in" signature. First keyframe ≈ +sceneH, last ≈ 0.
  const first = bBounce.keyframes[0].value;
  const last = bBounce.keyframes[bBounce.keyframes.length - 1].value;
  if (!(first > scene.height * 0.6 && Math.abs(last) < scene.height * 0.2)) return undefined;

  // The drop-zone media box height governs the card conform. It lives on the
  // referenced <clip> (Fixed Height, id 115), captured at parse time. If
  // unavailable, fall back to the observed default (600 in a 720 scene = 5/6 of
  // scene height — the media/scene ratio Motion authors for this template).
  const mediaFixedH = scene.dropZoneMediaHeight ?? Math.round(scene.height * (5 / 6));
  const posScale = outputH / scene.height;
  const cardH = Math.round((mediaFixedH / scene.height) * outputH);
  const srcAspect = imageB.width / imageB.height;
  const cardW = Math.round(cardH * srcAspect);
  return { cardW, cardH, posScale, aId, bId };
}

/**
 * Blit a source image conformed into a top-left CARD (Drop In). The source is
 * scaled to cardW×cardH and pinned to the output's top-left (0,0), then shifted
 * DOWN by `yOffset` output-pixels (the bounce). Pixels outside the card are left
 * untouched (source-over onto whatever is already there — black background, or the
 * static A card beneath a bouncing B). Bilinear sampled.
 */
export function blitDropInCard(
  dst: ImageData,
  src: ImageData,
  cardW: number,
  cardH: number,
  yOffset: number,
  opacity: number
): void {
  const OW = dst.width, OH = dst.height;
  const sw = src.width, sh = src.height;
  const y0 = Math.max(0, Math.floor(yOffset));
  const y1 = Math.min(OH, Math.ceil(cardH + yOffset));
  const ddata = dst.data, sdata = src.data;
  for (let dy = y0; dy < y1; dy++) {
    const cy = dy - yOffset;               // card-local y
    if (cy < 0 || cy >= cardH) continue;
    const syf = cy * sh / cardH;
    const sy0 = Math.min(sh - 1, Math.floor(syf));
    const sy1 = Math.min(sh - 1, sy0 + 1);
    const fy = syf - sy0;
    for (let dx = 0; dx < cardW; dx++) {
      const sxf = dx * sw / cardW;
      const sx0 = Math.min(sw - 1, Math.floor(sxf));
      const sx1 = Math.min(sw - 1, sx0 + 1);
      const fx = sxf - sx0;
      const i00 = (sy0 * sw + sx0) * 4, i10 = (sy0 * sw + sx1) * 4;
      const i01 = (sy1 * sw + sx0) * 4, i11 = (sy1 * sw + sx1) * 4;
      const gx = 1 - fx, gy = 1 - fy;
      const w00 = gx * gy, w10 = fx * gy, w01 = gx * fy, w11 = fx * fy;
      const r = sdata[i00] * w00 + sdata[i10] * w10 + sdata[i01] * w01 + sdata[i11] * w11;
      const g = sdata[i00 + 1] * w00 + sdata[i10 + 1] * w10 + sdata[i01 + 1] * w01 + sdata[i11 + 1] * w11;
      const b = sdata[i00 + 2] * w00 + sdata[i10 + 2] * w10 + sdata[i01 + 2] * w01 + sdata[i11 + 2] * w11;
      const a = (sdata[i00 + 3] * w00 + sdata[i10 + 3] * w10 + sdata[i01 + 3] * w01 + sdata[i11 + 3] * w11) / 255 * opacity;
      if (a <= 0) continue;
      const di = (dy * OW + dx) * 4;
      const ia = 1 - a;
      ddata[di] = r * a + ddata[di] * ia;
      ddata[di + 1] = g * a + ddata[di + 1] * ia;
      ddata[di + 2] = b * a + ddata[di + 2] * ia;
      ddata[di + 3] = Math.min(255, a * 255 + ddata[di + 3] * ia);
    }
  }
}
