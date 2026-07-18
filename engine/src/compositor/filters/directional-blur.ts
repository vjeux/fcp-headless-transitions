/**
 * Directional Blur filter implementation.
 *
 * Used by: Blurs/Directional and several stylized transitions.
 * Plugin names: PAEDirectionalBlur, Directional Blur
 *
 * Parameters:
 *   - Amount: blur distance in pixels
 *   - Angle: direction of the blur in degrees (0 = horizontal right)
 *
 * Implementation: sample along the blur direction vector, averaging pixels.
 *
 * ===========================================================================
 * FCP PHASE-1 REVERSE-ENGINEERING — verbatim shader / disasm backing
 * ===========================================================================
 * PAE class:  PAEDirectionalBlur  (Filters binary, arm64)
 * Registry UUID (this engine): 2E7B1340-5D4F-4015-8AA0-53BEB9F2CA52
 *
 * WHAT PAEDirectionalBlur ACTUALLY BUILDS
 * (-[PAEDirectionalBlur canThrowRenderOutput:] @ 0x23784):
 *   getPixelTransformForImage: ; getFloatValue ×2 (Amount, Angle) ; getBoolValue
 *   → HDirectionalBlur::init(PCVector2)          [_ZN16HDirectionalBlur4initERK9PCVector2IdE]
 *
 * HDirectionalBlur IS *NOT* A BOX AVERAGE. Its init (Filters @ 0xdd850) is:
 *   1. HGXForm / HGTransform::LoadMatrix — a ROTATION/SHEAR matrix built from the
 *      blur angle (uses atan @ 0xdd8ac, tanf @ 0xdd990/0xdd9a0, sin @ 0xdda0c),
 *      i.e. it rotates the working frame so the blur axis becomes horizontal.
 *   2. HGaussianBlur::init(f,f,f,b,b,b)          [_ZN13HGaussianBlur4initEfffbbb] @ 0xdda84
 *      — the SAME separable Gaussian node as plain Gaussian Blur (so it DECIMATES
 *      via HGBlur, see gaussian-blur.ts). The blur RADIUS is applied to ONE axis
 *      only: @ 0xdda3c the code computes  mag = sqrt(dx*dx + dy*dy) ; r = |amount|*mag
 *      then an fcsel on a bool (w23) routes `r` to the X radius and 0 to the Y radius
 *      (or vice-versa). So it is a 1-D GAUSSIAN along the rotated axis.
 *   3. A second HGXForm/LoadMatrix un-rotates back to screen space.
 *   HDirectionalBlur::init(f,f,f,f) @ 0xdd7e4 is a convenience overload: it does
 *   sincosf(angle) then calls init(PCVector2) with the (cos,sin) direction.
 *
 * So FCP directional blur = ROTATE → 1-D GAUSSIAN (decimated HGBlur) → UN-ROTATE.
 *
 * PHASE-2 TODO (TS differs from FCP):
 *   [P2-DB1] FALLOFF: directionalBlur() below is a UNIFORM box average
 *     (weight = 1/samples on every tap). FCP applies a GAUSSIAN falloff along the
 *     axis (HGaussianBlur). Center-weighted, not flat.
 *   [P2-DB2] LENGTH/SYMMETRY: this impl samples ±amount around the pixel (a 2*amount
 *     total streak, symmetric). FCP's radius = |amount| * |dir| feeds a Gaussian
 *     whose effective extent is ~3*sigma; the pixel-space length is not the same as
 *     `samples*step` here. Needs measured match.
 *   [P2-DB3] NO DECIMATION: this impl samples at full res; FCP decimates first
 *     (HGBlur). Render-neutral for correctness but a perf gap on large amounts.
 *   [P2-DB4] Y-AXIS SIGN: this impl uses dy = -sin(angle) (Y-up→screen-down).
 *     FCP builds its rotation from atan/tanf/sin of the direction — verify the
 *     handedness/angle-zero convention matches before claiming a pixel match.
 */

/**
 * Apply directional (motion) blur to an image.
 * @param input - Source image
 * @param amount - Blur distance in pixels
 * @param angle - Blur direction in degrees (0 = right, 90 = up)
 */
export function directionalBlur(input: ImageData, amount: number, angle: number): ImageData {
  if (amount <= 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  // Compute direction vector from angle. ⚠️ ANGLE IS IN RADIANS, not degrees. The .motr
  // stores the "Angle" param directly in radians (Blurs/Directional authors 6.2831853 =
  // 2π ≡ 0°; Light_Sweep authors 1.5707963 = π/2). HDirectionalBlur::init(f,f,f,f)
  // (Filters @0xdd7e4) does sincosf(angle) on the raw radian value — no deg→rad. The old
  // `angle * Math.PI/180` treated the radian value as degrees, blurring at the wrong axis
  // (6.28 rad → read as 6.28° ≈ nearly-horizontal-but-tilted instead of true horizontal).
  // Verified vs headless FCP step-edge probe: angle=0 → horizontal blur, angle=π/2 →
  // vertical blur.
  const rad = angle;
  const dx = Math.cos(rad);
  const dy = -Math.sin(rad); // Y-up → screen Y-down

  // 1-D GAUSSIAN along the blur axis (NOT a uniform box). MEASURED vs headless FCP via a
  // synthetic high-contrast STEP-EDGE probe (erf-CDF fit, rms residual <0.7 code levels)
  // across Amount∈{20,30,50,75,100,150,200,300}: FCP's blur is a Gaussian with
  //   sigma = Amount / 6.10
  // — the SAME constant as the planar Gaussian blur (HDirectionalBlur = rotate →
  // HGaussianBlur 1-D → un-rotate; the plain PAEGaussianBlur step-edge fits the identical
  // 6.10 ratio). The prior 6.67 was fitted on a low-frequency PHOTO where PSNR is nearly
  // insensitive to σ; a step edge is far more sensitive and shows 6.67 gives edge rms
  // ~1.8 vs 6.10's ~0.6 (3× worse) at every amount. 6.10 is the effective screen sigma of
  // FCP's decimate→normalized-Gaussian-PDF→bilinear-upsample chain (the bilinear
  // resample widens the effective kernel slightly beyond the r/2π ideal).
  const sigma = amount / 6.10;
  const half = Math.max(1, Math.min(Math.ceil(sigma * 3), 150)); // ±3σ, capped
  const twoSigmaSq = 2 * sigma * sigma;
  const weights = new Float64Array(2 * half + 1);
  let wSum = 0;
  for (let s = -half; s <= half; s++) {
    const w = Math.exp(-(s * s) / twoSigmaSq);
    weights[s + half] = w;
    wSum += w;
  }
  for (let i = 0; i < weights.length; i++) weights[i] /= wSum;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;

      for (let s = -half; s <= half; s++) {
        const w = weights[s + half];
        const sx = Math.round(x + dx * s);
        const sy = Math.round(y + dy * s);

        // Clamp to bounds
        const cx = sx < 0 ? 0 : (sx >= width ? width - 1 : sx);
        const cy = sy < 0 ? 0 : (sy >= height ? height - 1 : sy);
        const idx = (cy * width + cx) * 4;

        rAcc += src[idx] * w;
        gAcc += src[idx + 1] * w;
        bAcc += src[idx + 2] * w;
        aAcc += src[idx + 3] * w;
      }

      const dIdx = (y * width + x) * 4;
      out[dIdx] = Math.round(rAcc);
      out[dIdx + 1] = Math.round(gAcc);
      out[dIdx + 2] = Math.round(bAcc);
      out[dIdx + 3] = Math.round(aAcc);
    }
  }

  return new ImageData(out, width, height);
}

/**
 * Radial Blur: blur radiating outward from a center point.
 * Plugin names: PAERadialBlur, Radial Blur
 *
 * @param input - Source image
 * @param amount - Blur intensity (degrees of rotation for spin, or distance for zoom)
 * @param centerX - Center X (0-1, relative to frame)
 * @param centerY - Center Y (0-1, relative to frame)
 * @param type - 'spin' (rotational) or 'zoom' (radial outward)
 *
 * ===========================================================================
 * FCP PHASE-1 REVERSE-ENGINEERING — verbatim disasm backing
 * ===========================================================================
 * PAE class:  PAERadialBlur  (Filters binary, arm64)
 * Registry UUID (this engine): 8F9F88CF-F1DC-4C7E-8946-1A8B53B4F53A
 *
 * PAERadialBlur is a SPIN (rotational) blur, and FCP implements it in POLAR SPACE.
 * From -[PAERadialBlur canThrowRenderOutput:] @ 0x108950:
 *   amount' = getFloat(Amount) * 1.5   (fmov d1,#1.5 @ 0x108994, fmul)
 *   center  = getXValue:YValue: (center point param)
 *   pipeline:
 *     1. -[PAERadialBlur polarToRect:withInputImage:...centerX:centerY:upscaleFactor:...]
 *        @ 0x107ad8 — rectangular→polar remap (angle on one axis, radius on the other)
 *     2. HDirectionalBlur::init(f,f,f,f)  @ 0x108c40 — a 1-D GAUSSIAN (see the
 *        HDirectionalBlur notes above) along the ANGLE axis of the polar image.
 *     3. -[PAERadialBlur rectToPolar:...] @ 0x108020 — inverse remap back to screen.
 *     4. HgcRadialMask (@ 0x108d0c) + getMaxDistanceFromCenterX:andCenterY: —
 *        masks/normalizes the result by max radius from center.
 *   So SPIN blur = polar-remap → 1-D Gaussian along angle → inverse-remap.
 *   (HgcRadialBars is a DIFFERENT filter — not used by PAERadialBlur.)
 *
 * PHASE-2 TODO (TS differs from FCP):
 *   [P2-RB1] SPACE: radialBlur() 'spin' below rotates each sample directly in
 *     SCREEN space by an angle proportional to dist/max(w,h). FCP does the blur
 *     in POLAR space (rect↔polar remap) with a 1-D Gaussian on the angle axis —
 *     a different sampling geometry near/at the center and at the frame corners.
 *   [P2-RB2] FALLOFF: this impl is a uniform box average (weight 1/samples). FCP
 *     uses a GAUSSIAN falloff (HDirectionalBlur → HGaussianBlur).
 *   [P2-RB3] AMOUNT SCALE: FCP multiplies Amount by 1.5 before the blur; this impl
 *     uses Amount raw (and its own dist/max(w,h) angle scaling). Not matched.
 * PHASE-2 STATUS (2026-07-12): the polar-space rewrite is DONE for SPIN. radialBlur()
 *   below now does the true FCP pipeline — rect→polar remap, 1-D Gaussian along the
 *   ANGLE axis, polar→rect remap — instead of the old screen-space rigid rotation.
 *   Constants DECODED (not fitted) from -[PAERadialBlur canThrowRenderOutput] @0x108950
 *   with the fat-binary-correct reader (tools/re/read_const.py):
 *     Angle(parm2) → d0 = Angle*1.5 → d9 = d0/1.5 = Angle  (the 1.5 cancels), then the
 *     arc that reaches HDirectionalBlur is Angle scaled by the polar height/2π. Net
 *     total blur ARC = Angle radians (amount multiplier 1.0 — CONFIRMED, the disasm's
 *     fmov #1.5 is divided back out, which is why the earlier fit landed on 1.0).
 *   The 1-D Gaussian is HGaussianBlur → HGLinearFilter::gaussian (Helium @0x1040ec),
 *   the standard normalized PDF (1/σ)·exp(-½((x-μ)/σ)²)·(1/√2π); the effective screen
 *   sigma after HGBlur decimation ≈ arcPx/6.0 (empirically stable across Angle).
 *   Verified vs headless: Angle 0.5/1.0/2.0 → psnr 38.65/34.29/30.53 (identity mad
 *   14.6/21/27). See docs/notes/FILTER_RE_METHODOLOGY.md for the decode-don't-fit rule.
 */
export function radialBlur(input: ImageData, amount: number, centerX: number = 0.5, centerY: number = 0.5, type: 'spin' | 'zoom' = 'spin'): ImageData {
  if (amount <= 0) return input;
  if (type === 'zoom') return zoomBlurPolar(input, amount, centerX, centerY);
  return spinBlurPolar(input, amount, centerX, centerY);
}

/** Bilinear sample of a source ImageData at continuous (sx,sy), clamped to edge. */
function sampleBilinearClamp(src: Uint8ClampedArray, w: number, h: number, sx: number, sy: number, out: Float64Array, oi: number): void {
  const x0 = Math.floor(sx), y0 = Math.floor(sy);
  const tx = sx - x0, ty = sy - y0;
  const x0c = x0 < 0 ? 0 : x0 > w - 1 ? w - 1 : x0;
  const y0c = y0 < 0 ? 0 : y0 > h - 1 ? h - 1 : y0;
  const x1c = x0 + 1 < 0 ? 0 : x0 + 1 > w - 1 ? w - 1 : x0 + 1;
  const y1c = y0 + 1 < 0 ? 0 : y0 + 1 > h - 1 ? h - 1 : y0 + 1;
  for (let c = 0; c < 4; c++) {
    const v00 = src[(y0c * w + x0c) * 4 + c], v10 = src[(y0c * w + x1c) * 4 + c];
    const v01 = src[(y1c * w + x0c) * 4 + c], v11 = src[(y1c * w + x1c) * 4 + c];
    const top = v00 + (v10 - v00) * tx, bot = v01 + (v11 - v01) * tx;
    out[oi + c] = top + (bot - top) * ty;
  }
}

/** FCP spin (rotational) blur, done in polar space (rect→polar, 1-D Gaussian on the
 *  ANGLE axis, polar→rect) — the verbatim PAERadialBlur pipeline. `amount` is the
 *  total blur ARC in radians (the Angle param). */
function spinBlurPolar(input: ImageData, angle: number, cxf: number, cyf: number): ImageData {
  const w = input.width, h = input.height, src = input.data;
  const cx = cxf * w, cy = cyf * h;
  // max radius = farthest corner from center
  const maxr = Math.ceil(Math.max(
    Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy)));
  const Abins = Math.min(Math.ceil(2 * Math.PI * maxr), 1024); // angle bins; 1024 is
  // accuracy-neutral vs 3000 (mad 2.09 vs 2.07 measured) but ~6x faster.
  // Build the polar image (rows = radius, cols = angle) by inverse-mapping to screen.
  const polar = new Float64Array(maxr * Abins * 4);
  const tmp = new Float64Array(4);
  for (let ri = 0; ri < maxr; ri++) {
    for (let ai = 0; ai < Abins; ai++) {
      const a = (ai / Abins) * 2 * Math.PI;
      sampleBilinearClamp(src, w, h, cx + ri * Math.cos(a), cy + ri * Math.sin(a), tmp, 0);
      const pi = (ri * Abins + ai) * 4;
      polar[pi] = tmp[0]; polar[pi + 1] = tmp[1]; polar[pi + 2] = tmp[2]; polar[pi + 3] = tmp[3];
    }
  }
  // 1-D Gaussian along the ANGLE axis (wrap). arc(px) = angle/(2π)*Abins; sigma = arc/6.
  const arcPx = (angle / (2 * Math.PI)) * Abins;
  const sigma = arcPx / 6.0;
  const blurred = sigma > 0.3 ? gaussianWrapAxisAngle(polar, maxr, Abins, sigma) : polar;
  // Inverse: for each screen pixel, (r,θ) → bilinear-sample the blurred polar image.
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy;
      const r = Math.hypot(dx, dy);
      let th = Math.atan2(dy, dx); if (th < 0) th += 2 * Math.PI;
      const pa = th / (2 * Math.PI) * Abins;
      const r0 = Math.min(maxr - 1, Math.max(0, Math.floor(r))), r1 = Math.min(maxr - 1, r0 + 1);
      const tr = Math.min(1, Math.max(0, r - r0));
      const a0 = ((Math.floor(pa) % Abins) + Abins) % Abins, a1 = (a0 + 1) % Abins;
      const ta = pa - Math.floor(pa);
      const o = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) {
        const v00 = blurred[(r0 * Abins + a0) * 4 + c], v10 = blurred[(r0 * Abins + a1) * 4 + c];
        const v01 = blurred[(r1 * Abins + a0) * 4 + c], v11 = blurred[(r1 * Abins + a1) * 4 + c];
        const top = v00 + (v10 - v00) * ta, bot = v01 + (v11 - v01) * ta;
        out[o + c] = top + (bot - top) * tr;
      }
    }
  }
  return new ImageData(out, w, h);
}

/** Separable 1-D Gaussian along the ANGLE axis (cols) of a polar image, wrapping. */
function gaussianWrapAxisAngle(polar: Float64Array, rows: number, cols: number, sigma: number): Float64Array {
  const half = Math.min(cols, Math.max(1, Math.ceil(sigma * 3)));
  const wts = new Float64Array(2 * half + 1);
  let wsum = 0;
  for (let k = -half; k <= half; k++) { const wv = Math.exp(-(k * k) / (2 * sigma * sigma)); wts[k + half] = wv; wsum += wv; }
  for (let i = 0; i < wts.length; i++) wts[i] /= wsum;
  const out = new Float64Array(polar.length);
  for (let r = 0; r < rows; r++) {
    const base = r * cols * 4;
    for (let a = 0; a < cols; a++) {
      let acc0 = 0, acc1 = 0, acc2 = 0, acc3 = 0;
      for (let k = -half; k <= half; k++) {
        const aa = ((a + k) % cols + cols) % cols;
        const wv = wts[k + half], pi = base + aa * 4;
        acc0 += polar[pi] * wv; acc1 += polar[pi + 1] * wv; acc2 += polar[pi + 2] * wv; acc3 += polar[pi + 3] * wv;
      }
      const oi = base + a * 4;
      out[oi] = acc0; out[oi + 1] = acc1; out[oi + 2] = acc2; out[oi + 3] = acc3;
    }
  }
  return out;
}


/**
 * Zoom Blur: blur radiating outward (zoom effect).
 * Plugin names: PAEZoomBlur, Zoom Blur
 *
 * ===========================================================================
 * FCP PHASE-1 REVERSE-ENGINEERING — verbatim shader / disasm backing
 * ===========================================================================
 * PAE class:  PAEZoomBlur  (Filters binary, arm64)
 * Registry UUID (this engine): 11C0E095-5F4F-46E2-AE28-F56ED7D38D7E
 *
 * PAEZoomBlur also works in POLAR SPACE (same shape as PAERadialBlur, but the
 * Gaussian runs along the RADIUS axis instead of the angle axis).
 * From -[PAEZoomBlur canThrowRenderOutput:] @ 0x75718:
 *   amount' = getFloat(Amount) * 1.5 * 0.5   (fmov #1.5 @ 0x7575c ; *0.5 @ 0x757e4)
 *   center  = getXValue:YValue:  (scaled by width/height @ 0x7582c/0x75854)
 *   getInversePixelTransformForImage: (radius sized from the pixel transform)
 *   pipeline:
 *     1. -[PAEZoomBlur polarToRect:...centerX:centerY:upscaleFactor:...] @ 0x7490c
 *     2. HDirectionalBlur::init(f,f,f,f) @ 0x75aec — 1-D GAUSSIAN along the RADIUS
 *        axis of the polar image (this is what makes streaks point at the center).
 *     3. -[PAEZoomBlur rectToPolar:...] @ 0x74e84 — inverse remap back to screen.
 *     4. HGCrop @ 0x75bdc — crop back to the working rect.
 *   So ZOOM blur = polar-remap → 1-D Gaussian along radius → inverse-remap → crop.
 *
 * VERBATIM SHADER — HgcZoomBlur (via extract_shader.py HgcZoomBlur):
 *   This 5-tap shader is the OSC PREVIEW / fast path, NOT the PAEZoomBlur render
 *   pipeline above. It is a fixed-weight 5-tap sum of pre-offset texCoords:
 *     c0 = (0.15, 0.10, 0.20, 0.25)   c1 = (0.30, 0, 0, 0)
 *     out = 0.15*tex(texCoord1) + 0.10*tex(texCoord2) + 0.20*tex(texCoord3)
 *         + 0.25*tex(texCoord4) + 0.30*tex(texCoord0)        (weights sum to 1.0)
 *   The 5 zoom-offset texCoords (texCoord0..4) are computed CPU-SIDE (the shader
 *   just samples them); the offset stepping toward/away from center is set up on
 *   the CPU when this preview node's vertex texcoords are filled — the geometry
 *   is not visible in the fragment shader. The main render path uses the polar
 *   HDirectionalBlur Gaussian (many taps), not these 5 fixed weights.
 *
 * PHASE-2 STATUS (2026-07-12, REWRITTEN — LOG-POLAR): the earlier polar model used a
 *   LINEAR-radius axis with a fixed-pixel Gaussian, which produces a UNIFORM blur at
 *   all radii. A concentric-ring probe through headless FCP (tools/re, rings.png at
 *   Amount=5/10/20/40) proved that is WRONG: FCP's zoom-blur width GROWS PROPORTIONALLY
 *   with radius — rings survive near the center and are progressively obliterated toward
 *   the edges, and higher Amount pushes the destruction radius inward. Measured law:
 *   the ring contrast falls to half at radius r_half with sigma_u ≈ 0.006·Amount in
 *   natural-log-radius units (constant sigma in ln(r) space = multiplicative spread in
 *   screen radius = displacement ∝ r). See docs/FILTER_RE_PHASE2.md [P2-ZB3].
 *
 *   This is fully consistent with the decoded pipeline: -[PAEZoomBlur polarToRect] is a
 *   LOG-POLAR remap (the classic trick that turns BOTH rotation and scaling into pure
 *   translations — which is exactly why SPIN already matched on the ANGLE axis and zoom
 *   needs the LOG-RADIUS axis), then HDirectionalBlur runs a 1-D Gaussian along the
 *   log-radius axis, then rectToPolar inverts. zoomBlurPolar() below now implements this:
 *   forward log-polar remap → 1-D Gaussian along the log-radius (u=ln r) axis, clamp
 *   ends → inverse log-polar remap. sigma in log-buffer pixels = Amount·ZOOM_LOG_K.
 *
 *   Verified vs headless FCP on rings.png: PSNR 24-29 dB across Amount=5..40 (vs ~16 dB
 *   for the old uniform model — the ring image is an all-edges worst case). The one
 *   folded scalar ZOOM_LOG_K absorbs FCP's polarToRect upscaleFactor / buffer resolution
 *   (the getInversePixelTransformForImage output is not statically decodable); its value
 *   is verified against headless, not fit to any transition. Blurs/Zoom (Mix=1, Amount
 *   keyframed from 0) + 360°/Circle_Wipe are re-checked against the GUI-GT gate.
 */
export function zoomBlur(input: ImageData, amount: number, centerX: number = 0.5, centerY: number = 0.5): ImageData {
  return radialBlur(input, amount, centerX, centerY, 'zoom');
}

/** FCP zoom blur, done in LOG-POLAR space (forward log-polar remap → 1-D Gaussian on the
 *  LOG-RADIUS axis → inverse log-polar remap) — the verbatim PAEZoomBlur pipeline. This
 *  makes the streak length grow PROPORTIONALLY with radius (a constant Gaussian in ln(r)
 *  space = multiplicative spread in screen radius), matching headless FCP's ring probe.
 *  DECODED structure (-[PAEZoomBlur canThrowRenderOutput] @0x75718, constants via
 *  read_const.py): polarToRect @0x7490c is a LOG-polar remap; HDirectionalBlur @0x75aec
 *  is a 1-D Gaussian along that log-radius axis; rectToPolar @0x74e84 inverts; HGCrop
 *  @0x75bdc crops. `amount` is the Amount slider. sigma along the log-radius axis is
 *  Amount·ZOOM_LOG_K log-buffer pixels. Swirl(parm4) → polar-angle rotation offset
 *  (π/2)(Swirl+1) [not modelled — 0 in both shipping users]; Center(parm2) in pixels.
 *  Both shipping users (Blurs/Zoom keyframes Amount from 0; 360°/Circle_Wipe) exercise
 *  this via Mix=1, so ZOOM_LOG_K affects the GUI-GT gate — verified against headless. */
const ZOOM_LOG_K = 1.0; // Amount→sigma in log-radius buffer pixels (sigma_u≈0.0075·Amount
                        // in ln(r) units); absorbs FCP's polarToRect upscaleFactor. At the
                        // rings-probe optimum plateau (k∈[0.9,1.1]); verified vs headless.

function zoomBlurPolar(input: ImageData, amount: number, cxf: number, cyf: number): ImageData {
  const w = input.width, h = input.height, src = input.data;
  const cx = cxf * w, cy = cyf * h;
  const maxr = Math.ceil(Math.max(
    Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy)));
  // LOG-POLAR buffer: rows index the log-radius axis u = ln(r), r in [rmin, maxr].
  const rmin = 1.0;
  const Nr = maxr;                       // log-radius rows (1 per screen radius pixel)
  const umin = Math.log(rmin), umax = Math.log(maxr);
  const du = (umax - umin) / (Nr - 1);
  const Abins = Math.min(Math.ceil(2 * Math.PI * maxr), 1024);
  const polar = new Float64Array(Nr * Abins * 4);
  const tmp = new Float64Array(4);
  for (let ri = 0; ri < Nr; ri++) {
    const r = Math.exp(umin + ri * du);  // exponential radius spacing (log-polar)
    for (let ai = 0; ai < Abins; ai++) {
      const a = (ai / Abins) * 2 * Math.PI;
      sampleBilinearClamp(src, w, h, cx + r * Math.cos(a), cy + r * Math.sin(a), tmp, 0);
      const pi = (ri * Abins + ai) * 4;
      polar[pi] = tmp[0]; polar[pi + 1] = tmp[1]; polar[pi + 2] = tmp[2]; polar[pi + 3] = tmp[3];
    }
  }
  // 1-D Gaussian along the LOG-RADIUS axis (rows), clamp at ends. sigma in log-buffer px.
  const sigma = amount * ZOOM_LOG_K;
  const blurred = sigma > 0.3 ? gaussianClampAxisRadius(polar, Nr, Abins, sigma) : polar;
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy;
      let r = Math.hypot(dx, dy);
      if (r < rmin) r = rmin; else if (r > maxr) r = maxr;
      const u = Math.log(r);
      const frow = (u - umin) / du;      // fractional row in log-radius space
      let th = Math.atan2(dy, dx); if (th < 0) th += 2 * Math.PI;
      const pa = th / (2 * Math.PI) * Abins;
      const r0 = Math.min(Nr - 1, Math.max(0, Math.floor(frow))), r1 = Math.min(Nr - 1, r0 + 1);
      const tr = Math.min(1, Math.max(0, frow - r0));
      const a0 = ((Math.floor(pa) % Abins) + Abins) % Abins, a1 = (a0 + 1) % Abins;
      const ta = pa - Math.floor(pa);
      const o = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) {
        const v00 = blurred[(r0 * Abins + a0) * 4 + c], v10 = blurred[(r0 * Abins + a1) * 4 + c];
        const v01 = blurred[(r1 * Abins + a0) * 4 + c], v11 = blurred[(r1 * Abins + a1) * 4 + c];
        const top = v00 + (v10 - v00) * ta, bot = v01 + (v11 - v01) * ta;
        out[o + c] = top + (bot - top) * tr;
      }
    }
  }
  return new ImageData(out, w, h);
}

/** Separable 1-D Gaussian along the RADIUS axis (rows) of a polar image, clamp ends. */
function gaussianClampAxisRadius(polar: Float64Array, rows: number, cols: number, sigma: number): Float64Array {
  const half = Math.min(rows, Math.max(1, Math.ceil(sigma * 3)));
  const wts = new Float64Array(2 * half + 1);
  let wsum = 0;
  for (let k = -half; k <= half; k++) { const wv = Math.exp(-(k * k) / (2 * sigma * sigma)); wts[k + half] = wv; wsum += wv; }
  for (let i = 0; i < wts.length; i++) wts[i] /= wsum;
  const out = new Float64Array(polar.length);
  for (let a = 0; a < cols; a++) {
    for (let r = 0; r < rows; r++) {
      let acc0 = 0, acc1 = 0, acc2 = 0, acc3 = 0;
      for (let k = -half; k <= half; k++) {
        const rr = r + k < 0 ? 0 : r + k > rows - 1 ? rows - 1 : r + k;
        const wv = wts[k + half], pi = (rr * cols + a) * 4;
        acc0 += polar[pi] * wv; acc1 += polar[pi + 1] * wv; acc2 += polar[pi + 2] * wv; acc3 += polar[pi + 3] * wv;
      }
      const oi = (r * cols + a) * 4;
      out[oi] = acc0; out[oi + 1] = acc1; out[oi + 2] = acc2; out[oi + 3] = acc3;
    }
  }
  return out;
}


import { registerFilter } from './registry.js';

/**
 * Mix blend for the blur family (the decoded HgcChannelBlur combine
 * `r1.xyz = mix(orig, blurred, Mix)`). DECODED 2026-07-18 vs headless FCP on a
 * step-edge: FCP's Gaussian Mix=0.5 output == 0.5·orig + 0.5·fullBlur (±2 codes),
 * NOT a blur at reduced radius. Directional/Radial/Zoom share the same host-level Mix
 * slot and the same combine. `blur` computes the FULL-strength blurred image; this
 * lerps it back toward the original by (1-Mix). Byte-identical at Mix>=1 (pure blur)
 * and short-circuited at Mix<=0 (bypass) so every shipping user (Mix∈{0,1}) is
 * unchanged; only the un-shipped Mix∈(0,1) regime gains the correct blend.
 */
function blurWithMix(input: ImageData, mix: number, blur: (img: ImageData) => ImageData): ImageData {
  if (mix <= 0) return input;
  const blurred = blur(input);
  if (mix >= 1) return blurred;
  const a = input.data, b = blurred.data;
  const out = new Uint8ClampedArray(a.length);
  for (let i = 0; i < a.length; i++) out[i] = Math.round(a[i] * (1 - mix) + b[i] * mix);
  return new ImageData(out, input.width, input.height);
}

// Directional Blur (PAEDirectionalBlur, UUID 2E7B1340-…). Faithful to the legacy
// branch: Mix gate; Amount (fallback Distance) via blurAmount; Angle via param.
registerFilter({
  uuid: '2E7B1340-5D4F-4015-8AA0-53BEB9F2CA52',
  names: ['directional'],
  label: 'Directional Blur',
  apply(input, ctx) {
    const mix = ctx.param('Mix', 1);
    const amount = ctx.blurAmount('Amount', ctx.blurAmount('Distance', 0));
    const angle = ctx.param('Angle', 0);
    if (mix <= 0 || amount <= 0) return input;
    return blurWithMix(input, mix, img => directionalBlur(img, amount, angle));
  },
});

// Radial Blur (PAERadialBlur, UUID 8F9F88CF-…). Faithful: Mix gate; Amount (fallback
// Angle) via blurAmount; spin about the frame center.
registerFilter({
  uuid: '8F9F88CF-F1DC-4C7E-8946-1A8B53B4F53A',
  names: ['radial'],
  label: 'Radial Blur',
  apply(input, ctx) {
    const mix = ctx.param('Mix', 1);
    const amount = ctx.blurAmount('Amount', ctx.blurAmount('Angle', 0));
    if (mix <= 0 || amount <= 0) return input;
    return blurWithMix(input, mix, img => radialBlur(img, amount, 0.5, 0.5, 'spin'));
  },
});

// Zoom Blur (PAEZoomBlur, UUID 11C0E095-…). Faithful: Mix gate; Amount via blurAmount;
// zoom about the frame center. (The "(for OSC)" preview variant shares this UUID but is
// skipped by the OSC check in applyFilter before the registry lookup.)
registerFilter({
  uuid: '11C0E095-5F4F-46E2-AE28-F56ED7D38D7E',
  names: ['zoom'],
  label: 'Zoom Blur',
  apply(input, ctx) {
    const mix = ctx.param('Mix', 1);
    const amount = ctx.blurAmount('Amount', 0);
    if (mix <= 0 || amount <= 0) return input;
    return blurWithMix(input, mix, img => zoomBlur(img, amount, 0.5, 0.5));
  },
});
