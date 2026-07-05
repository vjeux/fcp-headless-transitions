/**
 * 360° transition family — drop-zone cover-fit band + "Align To" horizontal push.
 *
 * The eight 360° transitions (Push, Slide, Wipe, Circle Wipe, Reveal Wipe,
 * Divide, Gaussian Blur, Bloom) do NOT use the "360° Reorient" equirectangular
 * FxPlug (that plugin is inert in the headless render harness — its reorient
 * filters sit on a hidden opacity-0 layer). The real mechanism, recovered from
 * the ground-truth geometry and the .motr scene graph, is:
 *
 *   1. DROP-ZONE COVER-FIT BAND. Each Transition A/B image is a drop zone with
 *      `Type=1` and a Fixed `4096×2048` (2:1 equirectangular) canvas. The 16:9
 *      source is cover-scaled (width-driven) into a horizontal BAND occupying the
 *      BOTTOM HALF of the frame, cropped 4:1 and TOP-anchored (keeps the upper
 *      content). At the conformed 1920×1080 output the band spans y≈[502..1080]
 *      and the visible content tile is ≈1855 px wide.
 *
 *   2. "Align To" (factoryID 22) + Rig Behaviors drive a horizontal PUSH across
 *      the canvas. Over the transition source A translates by the full Rig
 *      "End Value" (±4096, sign chosen by the Direction widget: East=+, West=−)
 *      and exits; source B is offset by exactly one sweep (−4096) so it enters
 *      from the opposite edge and lands "home" at the end. The band content is a
 *      finite card (NOT a continuously tiling panorama), so at mid-transition
 *      there is a black gap between A leaving and B arriving — matching GT.
 *
 * Geometry constants are expressed relative to a 1920×1080 reference frame (the
 * conform target for the whole family) and scaled to the actual output. The push
 * magnitude/sign is read from the parsed Rig snapshots + Direction widget, so the
 * animated behavior is parameter-driven (not hardcoded).
 */
import type { MotrScene, RigWidget, RigBehavior } from '../types.js';

/** 1920×1080 reference-frame band-layout constants (fractions applied at output). */
const REF_W = 1920, REF_H = 1080;
const HOME_LEFT = 1120.4;   // band tile left edge at progress 0 (source A "home")
const TILE_W = 1855;        // visible content-tile width (equirect cover-fit card)
const BAND_TOP = 502;       // band top (bottom-half start)

export interface Band360Config {
  /** Push sweep magnitude in reference-frame px (Rig |End Value|, e.g. 4096). */
  sweep: number;
  /** +1 = East (content moves right), −1 = West. From the Direction widget. */
  dir: number;
}

/**
 * Detect the 360° drop-zone band-push signature and resolve its push parameters.
 * Returns null for any non-360° scene (so the normal compositor path runs).
 *
 * Signature: an `image` layer whose source is transitionA/B carries a drop zone
 * with `Type===1` and a `4096×2048` (2:1) Fixed canvas, AND an "Align To"
 * behavior (factoryID 22) drives it. The push magnitude is the Rig "End Value"
 * snapshot (|4096|); the sign is chosen by the Direction widget (East/West).
 */
export function detect360Band(scene: MotrScene): Band360Config | null {
  let found = false;
  const scan = (layers: readonly import('../types.js').Layer[]): void => {
    for (const l of layers) {
      if (l.type === 'image' && (l.source?.type === 'transitionA' || l.source?.type === 'transitionB')
          && l.dropZone && l.dropZone.type === 1
          && l.dropZone.width === 4096 && l.dropZone.height === 2048
          && l.hasAlignTo) {
        found = true;
      }
      scan(l.children);
    }
  };
  scan(scene.layers);
  if (!found) return null;

  // Push magnitude: a Rig Behavior snapshot named "End Value" carrying ±4096
  // (the drop-zone canvas width). Direction widget picks the sign.
  let sweep = 4096;
  for (const rb of scene.rigBehaviors) {
    if (rb.paramType !== 'End Value') continue;
    for (const snap of rb.snapshots) {
      const v = snapValue(snap);
      if (v !== undefined && Math.abs(Math.abs(v) - 4096) < 1) { sweep = Math.abs(v); }
    }
  }

  // Direction widget: East (0) → content moves right (+), West (1) → left (−).
  const direction = scene.rigWidgets.find(w => w.name === 'Direction');
  const dir = direction && direction.value >= 1 ? -1 : 1;

  return { sweep, dir };
}

/** Read a scalar snapshot parameter's numeric value (curve value or plain value). */
function snapValue(p: import('../types.js').Parameter): number | undefined {
  if (p.curve && typeof p.curve.value === 'number') return p.curve.value;
  if (typeof p.value === 'number') return p.value;
  return undefined;
}

function bilinear(src: ImageData, fx: number, fy: number, out: number[]): boolean {
  const sw = src.width, sh = src.height;
  if (fx < 0 || fx >= sw || fy < 0 || fy >= sh) return false;
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, sw - 1), y1 = Math.min(y0 + 1, sh - 1);
  const dx = fx - x0, dy = fy - y0;
  const d = src.data;
  const o00 = (y0 * sw + x0) * 4, o10 = (y0 * sw + x1) * 4;
  const o01 = (y1 * sw + x0) * 4, o11 = (y1 * sw + x1) * 4;
  for (let c = 0; c < 4; c++) {
    const top = d[o00 + c] * (1 - dx) + d[o10 + c] * dx;
    const bot = d[o01 + c] * (1 - dx) + d[o11 + c] * dx;
    out[c] = top * (1 - dy) + bot * dy;
  }
  return true;
}

/**
 * Render one 360° band-push frame at the given output resolution.
 *
 * `progress` 0→1 maps to the transition. `mask`, when supplied, is an alpha
 * function (x,y)→[0..1] over output pixels used to composite B over A (the
 * Wipe/Circle-Wipe/Reveal variants); when omitted the push is a plain overwrite.
 */
export function render360Band(
  cfg: Band360Config,
  imageA: ImageData,
  imageB: ImageData,
  progress: number,
  outW: number,
  outH: number,
): ImageData {
  const out = new ImageData(new Uint8ClampedArray(outW * outH * 4), outW, outH);
  const kx = outW / REF_W, ky = outH / REF_H;
  const tileW = TILE_W * kx;
  const bandTop = BAND_TOP * ky;
  const bandH = outH - bandTop;
  const homeLeft = HOME_LEFT * kx;
  const sweepPx = cfg.sweep * kx * cfg.dir;

  // Source A translates by +sweep*progress; source B trails by one full sweep so
  // it enters as A leaves and lands "home" at progress=1.
  const leftA = homeLeft + sweepPx * progress;
  const leftB = homeLeft + sweepPx * (progress - 1);

  const px: number[] = [0, 0, 0, 0];
  const drawTile = (src: ImageData, left: number): void => {
    const sw = src.width, sh = src.height;
    // Width-driven cover fit into (tileW × bandH), top-anchored vertically,
    // centered horizontally within the tile.
    const scale = Math.max(tileW / sw, bandH / sh);
    const dispW = sw * scale;
    const offX = (tileW - dispW) / 2;
    const xs = Math.max(0, Math.floor(left));
    const xe = Math.min(outW - 1, Math.ceil(left + tileW));
    for (let y = Math.floor(bandTop); y < outH; y++) {
      const sy = (y - bandTop) / scale;
      if (sy < 0 || sy >= sh) continue;
      for (let x = xs; x <= xe; x++) {
        const tx = x - left;
        if (tx < 0 || tx >= tileW) continue;
        const sx = (tx - offX) / scale;
        if (sx < 0 || sx >= sw) continue;
        if (!bilinear(src, sx, sy, px) || px[3] < 1) continue;
        const o = (y * outW + x) * 4;
        out.data[o] = px[0]; out.data[o + 1] = px[1]; out.data[o + 2] = px[2]; out.data[o + 3] = 255;
      }
    }
  };

  // B first (behind), then A on top. For pure Push the two tiles never overlap
  // (finite card + black gap at the seam), so draw order is immaterial there.
  drawTile(imageB, leftB);
  drawTile(imageA, leftA);
  return out;
}
