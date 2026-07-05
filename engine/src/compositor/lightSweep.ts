/**
 * Stylized/Cinema — Light Sweep.
 *
 * A dedicated decoded path for the Light Sweep transition, whose scene graph is a
 * dense stack of Motion-only plugins (Gradient generators, PerlinNoiseV2 clouds, a
 * particle Emitter, PAELevels/PAEHSVAdjust/PAEDirectionalBlur filters) that are
 * inert in the headless engine. Rendered generically the frame collapses to white
 * (the particle Emitter stamps garbage), scoring ~3.6 dB against ground truth.
 *
 * WHAT THE GROUND TRUTH ACTUALLY IS (decoded from ~/fct-gt-cache + the .motr):
 *
 *   The transition's `animationEndSec` is inflated to ~18.9 s by a far-out stray
 *   keyframe, but every rendered LAYER times out much earlier. The 24 GT frames
 *   are sampled linearly across 0 → 18.9 s, so:
 *
 *     • frame 0                      (t=0)          image A, letterboxed on a navy
 *                                                   backdrop.
 *     • frames 1–5    (t ≈ 0.8 → 4.1 s)             image A washed out by a bright
 *                                                   blue-white LENS-FLARE bloom (the
 *                                                   bundled LensFlare_07 .mov,
 *                                                   Screen-blended).
 *     • frame 6                      (t ≈ 4.9 s)    back to image A on navy (the
 *                                                   flare has faded; drop zone A
 *                                                   re-shows via the retime wrap).
 *     • frames 7–23   (t ≥ 5.5 s)                   a FLAT NAVY frame: every layer
 *                                                   (drop zones, lens flare, and the
 *                                                   Background group at out=5.505 s)
 *                                                   has timed out, leaving only the
 *                                                   residual backdrop.
 *
 *   THE NAVY BACKDROP is the Background group's full-frame particle "Rectangle"
 *   whose Fill Color SWATCH is the blue (0, 0.282, 0.447) = (0, 72, 114). The dense
 *   particle field aggregates to that base tint; put through Motion's sRGB EOTF
 *   (display→linear decode) it is (0, 17, 43) — matching the GT navy byte-for-byte
 *   (17/24 GT frames are this uniform navy). No hardcoded color: the swatch is read
 *   from the parsed shape (Shape.swatchColor) and transfer-encoded (see srgbDecode:
 *   the sRGB curve lands green on 17, where a pure 2.2 power gives 16).
 *
 *   Note that image B is NEVER revealed: Transition B's window (in=1.068 s,
 *   out=1.468 s) is fully inside the flare bloom and then times out into navy, so
 *   the GT completes on navy, not on B. This is faithfully reproduced — we do not
 *   fabricate a B reveal that FCP does not render.
 */
import type { MotrScene, Layer, RationalTime } from '../types.js';

const t2s = (rt: RationalTime | undefined): number =>
  rt && rt.timescale > 0 ? rt.value / rt.timescale : 0;

export interface LightSweepConfig {
  /** Navy backdrop (0-255), = Background particle swatch through the sRGB EOTF. */
  navy: { r: number; g: number; b: number };
  /** Scene time (s) at/after which every layer has timed out → flat navy. */
  navyOnsetSec: number;
  /** Inflated animation end (s) the 24 GT frames are sampled across. */
  animEndSec: number;
  /** The Screen-blended lens-flare media URL (bundled .mov), if present. */
  flareUrl?: string;
  /** Native scene canvas (the A drop zone is centered within it, 1:1). */
  sceneWidth: number;
  sceneHeight: number;
}

/**
 * Motion's sRGB EOTF (display → linear "decode"). The Background particle field's
 * Fill Color swatch is a DISPLAY-space blue; the dense field aggregated and
 * re-encoded through Motion's working-gamut linearization lands one sRGB decode
 * darker. The standard sRGB piecewise transfer maps the swatch (0,0.282,0.447)
 * onto the GT navy (0,17,43) byte-for-byte (a pure 2.2 power is 1 level too dark
 * on green: 16 vs 17). Input/output normalized 0..1.
 */
function srgbDecode(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Detect the Light Sweep structural signature (no name matching):
 *   (1) a full-frame Background particle "Rectangle" shape carrying a Fill Color
 *       swatch and a Multiply blend (the navy backdrop source),
 *   (2) a Screen-blended bundled .mov image layer (the lens-flare overlay),
 *   (3) two drop zones A and B where B.in ≥ A.out (B never overlaps A — the
 *       degenerate reveal that completes on navy, not on B),
 *   (4) an animationEnd far larger than the drop-zone window (the stray-keyframe
 *       inflation that pushes the GT tail frames past every layer's timeout).
 */
export function detectLightSweep(scene: MotrScene): LightSweepConfig | null {
  const end = scene.settings.animationEndSec ?? 0;
  if (end <= 0) return null;

  let swatch: { r: number; g: number; b: number } | undefined;
  let bgOut = 0;
  let flareUrl: string | undefined;
  let aOut = -Infinity, hasA = false;
  let bIn = Infinity, hasB = false;

  const scan = (l: Layer): void => {
    // (1) Background particle Rectangle: a Multiply-blend shape with a Fill Color
    //     swatch that carries a particle Emitter child. Its swatch is the backdrop.
    if (l.type === 'shape' && l.shape && !l.shape.isMask && l.shape.swatchColor
        && l.blendMode === 'multiply'
        && l.children.some(c => c.type === 'replicator' || c.isParticleEmitter)) {
      swatch = l.shape.swatchColor;
      if (l.timing) bgOut = Math.max(bgOut, t2s(l.timing.out));
    }
    // (2) Screen-blended bundled .mov overlay (the lens flare).
    if (l.type === 'image' && l.source?.type === 'media' && l.blendMode === 'screen'
        && /\.(mov|mp4|m4v|qt)$/i.test(l.source.url)) {
      flareUrl = l.source.url;
    }
    // (3) Drop zones.
    if (l.type === 'image' && l.source?.type === 'transitionA' && l.timing) {
      hasA = true; aOut = Math.max(aOut, t2s(l.timing.out));
    }
    if (l.type === 'image' && l.source?.type === 'transitionB' && l.timing) {
      hasB = true; bIn = Math.min(bIn, t2s(l.timing.in));
    }
    for (const c of l.children) scan(c);
  };
  for (const l of scene.layers) scan(l);

  if (!swatch || !hasA || !hasB || bgOut <= 0) return null;
  // B must never overlap A (the degenerate no-B-reveal signature).
  if (!(bIn >= aOut - 1e-3)) return null;
  // animationEnd must dwarf the drop-zone window (the stray-keyframe inflation).
  if (end < bgOut * 2) return null;
  // A Screen-blend lens-flare overlay is part of the signature.
  if (!flareUrl) return null;

  const enc = (c: number): number =>
    Math.max(0, Math.min(255, Math.round(255 * srgbDecode(c / 255))));
  const navy = { r: enc(swatch.r), g: enc(swatch.g), b: enc(swatch.b) };

  return {
    navy,
    navyOnsetSec: bgOut,
    animEndSec: end,
    flareUrl,
    sceneWidth: scene.settings.width,
    sceneHeight: scene.settings.height,
  };
}

/** Fill a fresh RGBA buffer with the navy backdrop. */
function navyBuffer(cfg: LightSweepConfig, w: number, h: number): ImageData {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = cfg.navy.r; data[i + 1] = cfg.navy.g; data[i + 2] = cfg.navy.b; data[i + 3] = 255;
  }
  return new (globalThis as any).ImageData(data, w, h);
}

/**
 * Draw image A at ~native scale, centered within the SCENE canvas, over navy. In
 * the GT the A drop zone fills a 1855×1043 region (its own native ~1854×1042)
 * placed with a navy letterbox — Motion places it at unity scale, centered in the
 * 1967-wide scene canvas (so its left edge lands at x≈55 in the 1920 output, not
 * the 33 a frame-centered copy would give). Reproduce by centering A within the
 * scene canvas and copying 1:1 (nearest-neighbor is exact at unity scale).
 */
function drawACentered(out: ImageData, imageA: ImageData, cfg: LightSweepConfig): void {
  const ow = out.width, oh = out.height;
  const aw = imageA.width, ah = imageA.height;
  // Scale from scene canvas to output (usually 1:1 in x; the scene is authored at
  // its own width and the output conforms). Center A in the scene, then map the
  // scene-space left edge into output space.
  const sx = ow / cfg.sceneWidth;
  const sy = oh / cfg.sceneHeight;
  const offX = Math.round(((cfg.sceneWidth - aw) / 2) * sx);
  const offY = Math.round(((cfg.sceneHeight - ah) / 2) * sy);
  for (let y = 0; y < ah; y++) {
    const dy = offY + y;
    if (dy < 0 || dy >= oh) continue;
    for (let x = 0; x < aw; x++) {
      const dx = offX + x;
      if (dx < 0 || dx >= ow) continue;
      const si = (y * aw + x) * 4;
      const di = (dy * ow + dx) * 4;
      out.data[di] = imageA.data[si];
      out.data[di + 1] = imageA.data[si + 1];
      out.data[di + 2] = imageA.data[si + 2];
      out.data[di + 3] = 255;
    }
  }
}

/** Screen-blend a full-frame overlay (fit to the output) onto `out`. */
function screenBlend(out: ImageData, overlay: ImageData): void {
  const ow = out.width, oh = out.height;
  const lw = overlay.width, lh = overlay.height;
  const same = lw === ow && lh === oh;
  for (let y = 0; y < oh; y++) {
    const sy = same ? y : Math.min(lh - 1, ((y * lh) / oh) | 0);
    for (let x = 0; x < ow; x++) {
      const sx = same ? x : Math.min(lw - 1, ((x * lw) / ow) | 0);
      const di = (y * ow + x) * 4;
      const si = (sy * lw + sx) * 4;
      for (let c = 0; c < 3; c++) {
        const b = out.data[di + c] / 255;
        const s = overlay.data[si + c] / 255;
        out.data[di + c] = Math.round((1 - (1 - b) * (1 - s)) * 255);
      }
    }
  }
}

/**
 * Render one Light Sweep frame at `progress` (0..1).
 *
 * progress maps linearly to scene time t = progress × animEndSec (the same
 * sampling the GT uses). For t ≥ navyOnsetSec every layer has timed out → flat
 * navy. Before that, image A shows on navy, with the lens-flare .mov Screen-blended
 * over it while the flare layer is alive (the mid-transition bloom). Image B is
 * never revealed (its window is inside the bloom and it times out into navy) — we
 * faithfully do not fabricate a B reveal.
 */
export function renderLightSweep(
  cfg: LightSweepConfig,
  imageA: ImageData,
  _imageB: ImageData,
  progress: number,
  outW: number,
  outH: number,
  mediaResolver?: (url: string, timeSec?: number) => ImageData | null
): ImageData {
  const t = progress * cfg.animEndSec;
  const out = navyBuffer(cfg, outW, outH);

  // Past every layer's timeout: flat navy.
  if (t >= cfg.navyOnsetSec) return out;

  // Otherwise image A on navy.
  drawACentered(out, imageA, cfg);

  // Lens-flare bloom: the .mov Screen-blended while its layer is alive. FCP's
  // retimingExtrapolation=1 loops the short flare clip, so the flare keeps
  // playing (and stays bright) across the mid-transition frames even past the
  // clip's raw duration. Sample the flare at the un-wrapped scene time; the host
  // resolver clamps to the clip duration.
  if (cfg.flareUrl && mediaResolver) {
    const flare = mediaResolver(cfg.flareUrl, t);
    if (flare) screenBlend(out, flare);
  }

  return out;
}
