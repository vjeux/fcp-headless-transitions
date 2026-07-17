/**
 * 360° transition family — shared full-frame drop-zone card + per-transition reveal.
 *
 * The eight 360° transitions (Push, Slide, Wipe, Circle Wipe, Reveal Wipe,
 * Divide, Gaussian Blur, Bloom) do NOT use the "360° Reorient" equirectangular
 * FxPlug (inert in the headless harness). The real mechanism, verified against
 * the current GUI GT geometry and the .motr scene graph, is a shared FULL-FRAME
 * DROP-ZONE CARD plus a per-transition REVEAL:
 *
 *   1. DROP-ZONE FULL-FRAME COVER-FIT. Each Transition A/B image is a drop zone
 *      with a Fixed 4096×2048 (2:1 equirectangular) canvas (Bloom: 4096×2160). The
 *      panorama is cover-fit to the ENTIRE output frame — verified against the GUI
 *      GT (Stylized__360°_Push f0 = start.png full-frame at 28.9 dB; the earlier
 *      "bottom-half band" model matched an older GUI-GT capture and now scores 7 dB
 *      against the current truth). Both A and B fill the whole frame.
 *
 *   2. REVEAL. The transitions differ ONLY in how B replaces A on the full frame:
 *      - PUSH      : Align To (fID 22) on the A image → A translates out by one
 *                    frame width, B trails by one width and enters from the
 *                    opposite edge, landing home at progress 1.
 *      - SLIDE     : Align To (fID 22) on the B image only → B translates in over
 *                    a STATIC full-frame A. A holds; B sweeps in from the
 *                    Direction edge and lands home at progress 1.
 *      - CROSSFADE : no Align To; the A image carries an Opacity curve (Gaussian
 *                    Blur / Bloom). Both A & B sit full-frame; A fades over B by
 *                    the parsed opacity curve (the blur/bloom filter is Amount≈0
 *                    → inert, mirroring the 2D Blurs/Gaussian Mix-bypass finding).
 *      - WIPE etc. : a Border/Source-group rig (Align To fID 23) reveals B over a
 *                    static A by a moving edge/shape mask spanning the frame.
 *
 * Push sign is read from the Direction widget; the crossfade window is read from
 * the A-image opacity curve (parameter-driven). The Slide/Wipe reveal windows are
 * calibrated against the ground-truth Align-To reveal behavior.
 *
 * HISTORY: an earlier "bottom-half band" model (BAND_TOP=502, TILE_W=1855 in a
 * 1920×1080 reference frame) matched a prior GUI-GT capture that composited the
 * panorama into a letterboxed cinematic band. That model scored ~46 dB on the old
 * GT but only ~7 dB against the current full-frame GT. The full-frame rewrite
 * (2026-07-13) lifted all 7 slugs by +6.8 to +15.8 dB, 0 regressions.
 */
import type { MotrScene, Layer, Curve, RationalTime } from '../types.js';

export type Reveal360 = 'push' | 'slide' | 'crossfade' | 'wipe' | 'wipe360h' | 'divide' | 'divide360slices' | 'circle';

export interface Band360Config {
  mode: Reveal360;
  /** +1 = East (content moves right), −1 = West. From the Direction widget. */
  dir: number;
  /** Slide/Wipe reveal window over progress [w0,w1]; A holds for progress<w0. */
  w0?: number;
  w1?: number;
  /** Crossfade: the A-image opacity curve + the playRange duration (seconds). */
  opacityCurve?: Curve;
  playRangeSec?: number;
}

function rtSec(t: RationalTime | undefined): number {
  if (!t || !t.timescale) return 0;
  return t.value / t.timescale;
}


/**
 * Detect the 360° drop-zone band signature and resolve its reveal parameters.
 * Returns null for any non-360° scene (so the normal compositor path runs).
 *
 * Signature: an `image` layer whose source is transitionA/B carries a drop zone
 * with `Type===1` (source A) or `Type===2` (source B) and a 4096-wide Fixed
 * canvas. The reveal MODE is chosen STRUCTURALLY:
 *   - Align To (hasAlignTo) on the A image  → push (A translates out).
 *   - Align To on the B image only          → slide (B translates over static A).
 *   - no Align To but A has an opacity curve → crossfade (blur/bloom, filter inert).
 */
export function detect360Band(scene: MotrScene): Band360Config | null {
  let aImg: Layer | null = null, bImg: Layer | null = null;
  const scan = (layers: readonly Layer[]): void => {
    for (const l of layers) {
      if (l.type === 'image' && l.dropZone && l.dropZone.width === 4096) {
        if (l.dropZone.type === 1 && l.source?.type === 'transitionA') aImg = l;
        else if (l.dropZone.type === 2 && l.source?.type === 'transitionB') bImg = l;
      }
      scan(l.children);
    }
  };
  scan(scene.layers);
  if (!aImg) return null;
  const A = aImg as Layer, B = bImg as Layer | null;

  // Direction widget: East (0) → +, West (1) → −. (Push/slide translate by one full
  // frame width; the old Rig "End Value" ±4096 magnitude is no longer used — the
  // full-frame model always sweeps exactly one output width.)
  const direction = scene.rigWidgets.find(w => w.name === 'Direction');
  const dir = direction && direction.value >= 1 ? -1 : 1;

  // STRUCTURAL mode classification.
  if (A.hasAlignTo) {
    // A translates out → the classic two-card push (A exits, B enters trailing).
    return { mode: 'push', dir };
  }
  if (B && B.hasAlignTo) {
    // B translates in over a static A (one-sided slide), easing in after a short
    // A hold. Window recovered from the Align-To reveal against ground truth.
    return { mode: 'slide', dir, w0: 0.17, w1: 1.0 };
  }
  // No Align To on either drop-zone image. If A carries an opacity curve it is a
  // crossfade (Gaussian Blur / Bloom — the blur/bloom filter is Amount≈0/inert).
  const op = A.transform?.opacity;
  if (op && typeof op === 'object' && Array.isArray(op.keyframes) && op.keyframes.length >= 2) {
    // Map progress over [0, animationEndSec] (the last-keyframe time), which is
    // where FCP's playhead lands at progress=1 — NOT the full playRange (which
    // over-shoots the last keyframe). Verified: this matches GT to 37.7dB.
    const playRangeSec = scene.settings.animationEndSec
      ?? rtSec(scene.settings.duration);
    return { mode: 'crossfade', dir, opacityCurve: op, playRangeSec };
  }

  // No push/slide/crossfade signature. The remaining 360° transitions (Wipe,
  // Reveal Wipe, Divide, Circle Wipe) reveal B over a STATIC A via a Border/
  // Source-group rig (Align To factoryID 23 on a moving Rectangle, plus a
  // Clone/Luma alpha mask). They share the full frame; only the reveal SHAPE
  // differs, selected STRUCTURALLY by the rig widget set:
  //   - "Slices"                       → divide (two-edge / multi-slice split)
  //   - "Direction" (no Slices)        → wipe   (linear directional wipe)
  //   - "Soften Edges" (no Direction)  → reveal (luma-keyed horizontal wipe)
  //   - else (Border only)             → circle (radial wipe)
  const wnames = new Set(scene.rigWidgets.map(w => w.name));
  const hasWipeRig = scene.rigWidgets.some(w => w.name === 'Border')
    || scene.rigWidgets.some(w => w.name === 'Slices');
  if (hasWipeRig) {
    if (wnames.has('Slices')) return { mode: 'divide360slices', dir, w0: 0.667, w1: 0.87 };
    if (wnames.has('Direction')) return { mode: 'wipe360h', dir, w0: 0.057, w1: 0.186 };
    if (wnames.has('Soften Edges')) return { mode: 'wipe', dir, w0: 0.26, w1: 0.42 };
    return { mode: 'circle', dir, w0: 0.30, w1: 0.48 };
  }

  return null;
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

type Mask = (x: number, y: number) => number;

/** Cover-fit `src` to the FULL output frame and sample at output (x,y) shifted by `left`.
 *  Returns false if the shifted sample falls outside the source card (transparent gap).
 *  The 360° panoramas fill the ENTIRE frame in the current GUI GT (not a bottom band):
 *  a 16:9-ish equirect image is cover-scaled to outW×outH and translated horizontally.
 *  With `wrap`=true, the horizontal axis WRAPS mod outW — an equirectangular panorama
 *  is a 360° cylinder, so a yaw shift re-enters from the opposite edge instead of
 *  clipping. Used by the 360° push/slide equirect geometry (yaw = one output width). */
function sampleFull(src: ImageData, x: number, y: number, left: number, outW: number, outH: number, px: number[], wrap = false): boolean {
  let tx = x - left;
  if (wrap) {
    tx = ((tx % outW) + outW) % outW;   // 360° cylinder wrap
  } else if (tx < 0 || tx >= outW) {
    return false;
  }
  const scale = Math.max(outW / src.width, outH / src.height);
  const dispW = src.width * scale, dispH = src.height * scale;
  const offX = (dispW - outW) / 2, offY = (dispH - outH) / 2;
  const sx = (tx + offX) / scale, sy = (y + offY) / scale;
  if (sx < 0 || sx >= src.width || sy < 0 || sy >= src.height) return false;
  return bilinear(src, sx, sy, px);
}

/** Draw a full-frame cover-fit card of `src` translated by `left`, alpha·mask.
 *  With `wrap`=true the card wraps horizontally (equirect cylinder) so every output
 *  column is covered — used by 360° push/slide where the sphere yaws by one width. */
function drawFull(
  out: ImageData, src: ImageData, left: number, outW: number, outH: number,
  alpha: number, mask: Mask | null, wrap = false,
): void {
  const px: number[] = [0, 0, 0, 0];
  const xs = wrap ? 0 : Math.max(0, Math.floor(left));
  const xe = wrap ? outW - 1 : Math.min(outW - 1, Math.ceil(left + outW));
  for (let y = 0; y < outH; y++) {
    for (let x = xs; x <= xe; x++) {
      if (!sampleFull(src, x, y, left, outW, outH, px, wrap) || px[3] < 1) continue;
      let a = alpha;
      if (mask) { a *= mask(x, y); if (a <= 0) continue; }
      const o = (y * outW + x) * 4;
      if (a >= 1) {
        out.data[o] = px[0]; out.data[o + 1] = px[1]; out.data[o + 2] = px[2]; out.data[o + 3] = 255;
      } else {
        out.data[o] = out.data[o] * (1 - a) + px[0] * a;
        out.data[o + 1] = out.data[o + 1] * (1 - a) + px[1] * a;
        out.data[o + 2] = out.data[o + 2] * (1 - a) + px[2] * a;
        out.data[o + 3] = 255;
      }
    }
  }
}

/** Opacity of source A at `progress` from the parsed opacity curve keyframes. */
function crossfadeAlphaA(cfg: Band360Config, progress: number): number {
  const c = cfg.opacityCurve!;
  const kfs = c.keyframes;
  const tsec = progress * (cfg.playRangeSec ?? 1);
  const t0 = rtSec(kfs[0].time), v0 = kfs[0].value;
  const tn = rtSec(kfs[kfs.length - 1].time), vn = kfs[kfs.length - 1].value;
  if (tsec <= t0) return v0;
  if (tsec >= tn) return vn;
  // Find the bracketing segment and LINEARLY interpolate (matches GT better than
  // a smoothstep of the bezier tangents at this frame cadence).
  for (let i = 0; i < kfs.length - 1; i++) {
    const ta = rtSec(kfs[i].time), tb = rtSec(kfs[i + 1].time);
    if (tsec >= ta && tsec <= tb) {
      const u = tb > ta ? (tsec - ta) / (tb - ta) : 0;
      return kfs[i].value * (1 - u) + kfs[i + 1].value * u;
    }
  }
  return vn;
}

/**
 * Render one 360° band frame at the output resolution. `progress` 0→1 maps the
 * transition. Dispatches on the detected reveal mode.
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
  // FULL-FRAME model (GUI-GT-verified): the 360° panoramas cover-fit the ENTIRE frame
  // and translate horizontally by one frame width per push (A slides out, B slides in).
  // (The earlier bottom-half "band" model matched an OLD GUI-GT capture; the current
  // truth shows the panorama filling the whole frame — f0 == full-frame A at 28.9 dB.)
  const sweepPx = outW * cfg.dir;   // one full frame width, signed by Direction

  if (cfg.mode === 'push') {
    // A translates by sweep·progress and exits; B trails by one full sweep so it enters
    // from the opposite edge as A leaves and lands home at progress 1.
    const leftA = sweepPx * progress;
    const leftB = sweepPx * (progress - 1);
    drawFull(out, imageB, leftB, outW, outH, 1, null);
    drawFull(out, imageA, leftA, outW, outH, 1, null);
    return out;
  }

  if (cfg.mode === 'slide') {
    // EQUIRECT 360° SLIDE (decoded 2026-07-16 from the GUI GT per-column A/B seam
    // classification + per-frame yaw sweep — see below). Same equirect cylinder
    // geometry as the sibling 360° Push (commit 5fe0b86), BUT with A STATIC: only
    // the incoming panorama B yaws in from the right, wrapping around the 360°
    // cylinder to land home at progress 1. B is revealed in a growing wedge
    // anchored at frame CENTRE, so outgoing A stays visible in the complement.
    //
    // DECODED GEOMETRY (per-column A/B classifier over the raw GUI GT, W=1920):
    //   - A stays FIXED at identity: at every frame where A is visible its pixels
    //     are at home (x=0→A@0, x=383→A@383, x=1535→A@1535, x=1919→A@1919). A
    //     does NOT yaw. This is why the Transition A image has hasAlignTo=false
    //     in the .motr while the Rectangle alpha-mask and Transition B image
    //     both have hasAlignTo=true — only B (and the mask) move.
    //   - B rolls right with wrap by a linear function of frame index. A
    //     high-precision yaw sweep against the GT gave yaw(f) = 86·f for
    //     f=5..22 EXACTLY, saturating at yaw=W (identity via wrap) at f≈22.32
    //     and landing on identity at f23. Equivalently: yaw = min(86·f, W) =
    //     min(p·N·86, W). N=24 gives yaw = min(2064·p, 1920) = min(1.075·p·W, W).
    //     Same rate as sibling 360° Push (yaw/f=86 verified on Push GT too);
    //     Push scores 20 dB with just p·W because BOTH A+B yaw together, so its
    //     ~80 px per-frame error is symmetric. Slide has A static, so a bad B
    //     yaw is UNCOMPENSATED — the exact 86·f is what closes the tail dip.
    //   - Reveal wedge: same shape/anchor as push — leading edge fixed at frame
    //     CENTRE (c0 = W/2), trailing edge sweeps by width = p·W as B fills in.
    //     B is composited only where d = ((x - c0)·dir) mod W is in [0, width);
    //     A is drawn everywhere BENEATH B (visible in the wedge complement).
    // The 86 px/frame constant matches the .motr Rig Behavior sweep of 4096
    // canvas units (equirect drop zone width) across animationEndSec=1.333s,
    // cover-fit-scaled to output space: 4096 · min(1920/4096, 1080/2048) yields
    // the observed 2064-px total sweep (minus a small time-margin gap that the
    // animation completes early at f≈22.32/24).
    const NF = 24;                            // fct sampling: 24 frames at p=i/N
    // 86 px/frame in output space, decoded from GT (see above). Equivalent to
    // yaw = min(p · N · 86, outW) — kept in fraction-of-outW form for clarity.
    const yawFraction = Math.min(progress * NF * 86 / outW, 1);
    const yaw = yawFraction * outW * cfg.dir;
    const c0 = 0.5 * outW;                    // reveal wedge leading edge = frame centre
    // Wedge width grows linearly with progress UNTIL the yaw saturates (yawFraction=1
    // at p≈0.93), after which B is fully back at identity via wrap and the whole
    // frame must be B — otherwise the tail (f22, f23) leaves the rightmost ~80 px
    // showing A (verified: with plain width=p·W, f23 scored 23.48 dB; snap-to-W once
    // yaw completes gives f23=41.91 dB). Mid-band mask matches GT better with p·W
    // than yawFraction·W (yawFraction grows 1.075× faster, uncovering A prematurely).
    const width = yawFraction >= 1 ? outW : progress * outW;
    const bMask: Mask = (x) => {
      const d = (((x - c0) * cfg.dir) % outW + outW) % outW;
      return d < width ? 1 : 0;
    };
    // A static at identity (no yaw, no wrap needed); B yawed with wrap, over wedge.
    drawFull(out, imageA, 0, outW, outH, 1, null);
    drawFull(out, imageB, yaw, outW, outH, 1, bMask, true);
    return out;
  }

  if (cfg.mode === 'crossfade') {
    // Both full-frame at home; A fades over B per the parsed opacity curve.
    const aOp = crossfadeAlphaA(cfg, progress);
    drawFull(out, imageB, 0, outW, outH, 1, null);
    drawFull(out, imageA, 0, outW, outH, aOp, null);
    return out;
  }

  if (cfg.mode === 'wipe360h') {
    // EQUIRECT 360° WIPE (Direction rig) — decoded 2026-07-16 from the GUI GT
    // per-column A/B classifier (W=1920). Unlike a generic full-frame wipe, the
    // 360° Wipe splits the frame at CENTRE and reveals B only in the RIGHT HALF
    // (for dir=+1 / East), with A holding at home in the complement:
    //   - LEFT half  (x < W/2): source A at HOME (identity), stays put.
    //   - RIGHT half (x >= W/2): source B at HOME, uncovered by an edge that
    //     sweeps from the frame CENTRE (c0 = W/2) outward toward the right edge.
    // DECODED EDGE ADVANCE (rightmost B column − c0, per frame f, N=24):
    //     f01 p=0.042 width=0     f02 p=0.083 width=209   f03 p=0.125 width=479
    //     f04 p=0.167 width=829   f05 p=0.208 width=959(=W/2, SATURATED, holds).
    //   A least-squares line through the unsaturated frames (f2..f4) gives
    //     width = 7440·p − 424  (px), i.e. width crosses 0 at p0≈0.057 and reaches
    //     W/2 at p≈0.186 — hence w0=0.057, w1=0.186 with width = t·(W/2). The
    //     wedge SATURATES at half-frame (B never covers the left half until the
    //     final settle at progress 1, where the whole frame is B). Both panoramas
    //     stay at HOME (no yaw) — verified: the left half's per-column best model
    //     is A@home and the right half's is B@home to within JPEG noise.
    const c0 = 0.5 * outW;                       // wipe boundary anchor = frame centre
    let t = (progress - (cfg.w0 ?? 0.057)) / ((cfg.w1 ?? 0.186) - (cfg.w0 ?? 0.057));
    if (t < 0) t = 0; if (t > 1) t = 1;
    // The wipe SATURATES at half-frame from f05 (p≈0.208) through f22 (p≈0.917),
    // then FCP SNAPS to the full B panorama on the final frame f23 (p≈0.958,
    // fracB=1.000 in the GT). fct samples the half-open grid p=i/24, so the last
    // frame lands at 23/24≈0.958; a settle threshold of 0.94 (between f22=0.917 and
    // f23=0.958) reproduces the terminal snap to full B without touching the hold.
    const settled = progress >= 0.94;
    const halfWidth = t * (0.5 * outW);          // covered span from centre, ≤ W/2
    const bMask: Mask = (x) => {
      if (settled) return 1;
      // dir=+1: B fills [c0, c0+halfWidth); dir=−1: B fills (c0−halfWidth, c0].
      const d = (x - c0) * cfg.dir;              // signed distance from centre
      return (d >= 0 && d < halfWidth) ? 1 : 0;
    };
    drawFull(out, imageA, 0, outW, outH, 1, null);
    drawFull(out, imageB, 0, outW, outH, 1, bMask);
    return out;
  }

  if (cfg.mode === 'divide360slices') {
    // EQUIRECT 360° DIVIDE (Slices replicator rig) — decoded 2026-07-16 from the
    // GUI GT per-column A/B classifier (W=1920, N=24 frames). "Divide" here is NOT
    // a single centre barn-door: it is a 3-cell REPLICATOR of vertical A-STRIPS that
    // hold, then SHRINK to nothing, uncovering B (both panoramas stay at HOME — no
    // yaw; the per-column dominant source is A@home inside a strip, B@home outside).
    //
    // DECODED A-STRIP GEOMETRY (per-frame contiguous A-runs, is_A = |img−A|<|img−B|):
    //   f00-f01 (p<0.083)            : FULL A (transition not yet begun / build-in).
    //   f02-f04 (p 0.083..0.167)     : strips appear. A-strip runs (start,end):
    //        [   0, 256] c≈128  [ 896,1024] c=960  [1662,1919] c≈1790
    //        i.e. centres at x≈{128, 960, 1790} = W·{0.0667, 0.5, 0.9333}; the outer
    //        two are the SEAM strip split by the equirect wrap (256+258≈514 spans 0).
    //        Initial full widths ≈ {257, 129, 258}.
    //   f05-f16 (p 0.208..0.667)     : STEADY HOLD — outer strips settle 257→217,
    //        centre strip holds 129. (long static "divided" plateau.)
    //   f17-f20 (p 0.708..0.833)     : strips SHRINK LINEARLY to 0. Measured widths
    //        centre {109,79,52,26}, outer {186,134,86,44}; a LSQ line through these
    //        crosses width=0 at p≈0.87 for BOTH strips (0.871 centre, 0.870 outer).
    //   f21-f23 (p≥0.875)            : FULL B.
    // The shrink is modelled as holdWidth·(p1−p)/(p1−p0) with p0=0.667 (hold ends,
    // last full-width frame) and p1=0.87 (decoded zero-crossing). Verified: centre
    // at p=0.708 → 129·(0.87−0.708)/(0.87−0.667)=103 (GT 109); p=0.750 → 76 (GT 79).
    const p0 = cfg.w0 ?? 0.667;   // hold ends here (last steady frame f16)
    const p1 = cfg.w1 ?? 0.87;    // decoded strip-width zero-crossing (both strips)
    // Strip centres (fraction of W) and their HOLD full-widths (px @ W=1920), decoded
    // above. Centre strip at W/2; the outer pair is the seam strip (wrap-split).
    const cW = outW / 1920;                       // px→current-width scale
    const strips: Array<{ cx: number; hw: number }> = [
      { cx: 128 * cW,  hw: 0.5 * 217 * cW },      // left  (seam, right lobe)  hold w≈217
      { cx: 960 * cW,  hw: 0.5 * 129 * cW },      // centre                    hold w≈129
      { cx: 1790 * cW, hw: 0.5 * 218 * cW },      // right (seam, left lobe)   hold w≈218
    ];
    // Shrink factor: 1 during the hold, ramps to 0 at p1, then A gone.
    let shrink = 1;
    if (progress > p0) shrink = (p1 - progress) / (p1 - p0);
    if (shrink < 0) shrink = 0; if (shrink > 1) shrink = 1;
    const started = progress >= 0.0625;           // f01→f02 edge (strips appear at f02)
    const aMask: Mask = (x) => {
      if (!started) return 1;                     // full A before the divide begins
      if (shrink <= 0) return 0;                  // strips gone → all B
      for (const s of strips) {
        const hw = s.hw * shrink;
        // signed distance on the equirect cylinder (seam wrap so the seam strip joins)
        let d = x - s.cx;
        if (d > 0.5 * outW) d -= outW;
        else if (d < -0.5 * outW) d += outW;
        if (Math.abs(d) < hw) return 1;           // inside an A-strip
      }
      return 0;
    };
    // B fills the whole frame at home; A-strips painted on top where the mask is 1.
    drawFull(out, imageB, 0, outW, outH, 1, null);
    drawFull(out, imageA, 0, outW, outH, 1, aMask);
    return out;
  }

  // Masked reveal (wipe / divide / circle): both full-frame at home, B revealed by a
  // moving edge/shape mask over [w0,w1].
  const w0 = cfg.w0 ?? 0.3, w1 = cfg.w1 ?? 0.48;
  let t = (progress - w0) / (w1 - w0);
  if (t < 0) t = 0; if (t > 1) t = 1;
  const cx = outW / 2, cy = outH / 2;
  let mask: Mask;
  if (cfg.mode === 'divide') mask = (x) => { const half = t * outW / 2; return (x < half || x > outW - half) ? 1 : 0; };
  else if (cfg.mode === 'circle') mask = (x, y) => { const rad = t * outW / 1.4; const dx = x - cx, dy = (y - cy); return (dx * dx + dy * dy) < rad * rad ? 1 : 0; };
  else mask = (x) => (x < t * outW ? 1 : 0); // left→right wipe
  drawFull(out, imageA, 0, outW, outH, 1, null);
  drawFull(out, imageB, 0, outW, outH, 1, mask);
  return out;
}
