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

  // Compute direction vector from angle
  const rad = angle * Math.PI / 180;
  const dx = Math.cos(rad);
  const dy = -Math.sin(rad); // Y-up → screen Y-down

  // 1-D GAUSSIAN along the blur axis (NOT a uniform box). MEASURED vs headless FCP
  // (tools/re/filter_probe PAEDirectionalBlur Amount=50/100, Angle=0): FCP's blur is a
  // Gaussian with sigma = Amount/6.67 — the SAME constant as the planar Gaussian blur
  // (HDirectionalBlur = rotate → HGaussianBlur 1-D → un-rotate). Fit: Amount=50 σ=7.5
  // PSNR 46.4, Amount=100 σ=15 PSNR 45.8, vs the old box average's 33.5/32.2. The box
  // both under-weighted the center and over-reached the tails, so activating it
  // regressed Blurs/Directional; the Gaussian matches FCP.
  const sigma = amount / 6.67;
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
 *   Constants MEASURED vs headless FCP (tools/re/filter_probe PAERadialBlur, Angle
 *   0.5/1.0/2.0): total blur arc = Angle radians (amount multiplier 1.0, NOT the 1.5
 *   the disasm's fmul suggested — the 1.5 is absorbed elsewhere in the shipped path),
 *   Gaussian sigma = arc_pixels / 6.0 (the HGaussianBlur constant for this node).
 *   Fit: Angle=0.5 mad 1.26, 1.0 mad 2.07, 2.0 mad 3.57 vs headless (identity mad
 *   14.6/21.0/27.2). The residual is the 1854→1920 conform + polar resampling.
 *   [P2-RB2/RB4] the Gaussian falloff + implicit rim normalization now come from the
 *   polar Gaussian; no separate HgcRadialMask step is needed for the spin match.
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
 * PHASE-2 STATUS (2026-07-12): zoomBlur() now does the polar pipeline (rect→polar,
 *   1-D Gaussian along the RADIUS axis, polar→rect) via zoomBlurPolar() below —
 *   resolving [P2-ZB1] (space) and [P2-ZB2] (Gaussian falloff). The streak length is
 *   Amount * ZOOM_AMT_MUL (disasm suggests 1.5*0.5=0.75; fit vs headless preferred a
 *   symmetric scale-average — see zoomBlurPolar). Zoom converges LESS cleanly than
 *   spin (headless psnr ~24 vs spin's 30-38): FCP's zoom appears to blur over a
 *   radius-PROPORTIONAL scale range (a fixed radius-pixel Gaussian is only an
 *   approximation), so [P2-ZB3] magnitude is improved but not exact. Blurs/Zoom +
 *   360°/Circle_Wipe stay gate-green with the polar model.
 */
export function zoomBlur(input: ImageData, amount: number, centerX: number = 0.5, centerY: number = 0.5): ImageData {
  return radialBlur(input, amount, centerX, centerY, 'zoom');
}

/** FCP zoom blur, done in polar space (rect→polar, 1-D Gaussian on the RADIUS axis,
 *  polar→rect) — the verbatim PAEZoomBlur pipeline. `amount` is the Amount slider;
 *  the streak length in radius-pixels is amount * ZOOM_AMT_MUL, Gaussian sigma =
 *  streakPx / 6.0 (MEASURED vs headless FCP; see spinBlurPolar note). */
const ZOOM_AMT_MUL = 0.75; // FCP: Amount * 1.5 * 0.5 (disasm) — refined vs headless below.
function zoomBlurPolar(input: ImageData, amount: number, cxf: number, cyf: number): ImageData {
  const w = input.width, h = input.height, src = input.data;
  const cx = cxf * w, cy = cyf * h;
  const maxr = Math.ceil(Math.max(
    Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy)));
  const Abins = Math.min(Math.ceil(2 * Math.PI * maxr), 1024);
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
  // 1-D Gaussian along the RADIUS axis (rows), clamp at ends. streak in radius pixels.
  const streakPx = amount * ZOOM_AMT_MUL;
  const sigma = streakPx / 6.0;
  const blurred = sigma > 0.3 ? gaussianClampAxisRadius(polar, maxr, Abins, sigma) : polar;
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
    if (mix > 0 && amount > 0) return directionalBlur(input, amount, angle);
    return input;
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
    if (mix > 0 && amount > 0) return radialBlur(input, amount, 0.5, 0.5, 'spin');
    return input;
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
    if (mix > 0 && amount > 0) return zoomBlur(input, amount, 0.5, 0.5);
    return input;
  },
});
