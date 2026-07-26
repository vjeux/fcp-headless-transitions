/**
 * Bilinear image resampling.
 * Used to conform the scene's native authoring resolution to a target output
 * resolution (matching FCP's project-resolution conform, e.g. a 4096x2048 VR
 * template rendered into a 1920x1080 project).
 *
 * MEMOIZED: resample is a PURE function of (source pixels, targetW, targetH). In the
 * fct minimizer hot loop the SAME source plates (Transition A/B) are conformed to the
 * SAME output box on every trial and every frame — so without a cache we recompute the
 * identical ~2M-pixel bilinear resample hundreds of times (profiled as the #1 render
 * cost, ~500ms/call). The cache is keyed by SOURCE-OBJECT IDENTITY (WeakMap, so it never
 * pins memory once a source is dropped) plus the "WxH" target. To stay 100% safe against
 * any caller that might mutate the returned buffer in place, we cache the computed pixels
 * and return a fresh COPY each call (an ~8MB memcpy, ~2ms — negligible vs the 500ms
 * resample it replaces). Output is byte-identical to the uncached path.
 */
const _resampleCache = new WeakMap<ImageData, Map<string, Uint8ClampedArray>>();

export function resample(src: ImageData, targetW: number, targetH: number): ImageData {
  if (src.width === targetW && src.height === targetH) return src;
  const key = targetW + "x" + targetH;
  let byTarget = _resampleCache.get(src);
  const cached = byTarget?.get(key);
  if (cached) {
    // Defensive copy so a downstream in-place mutation can't corrupt the cache.
    return new ImageData(new Uint8ClampedArray(cached), targetW, targetH);
  }
  const buf = new Uint8ClampedArray(targetW * targetH * 4);
  const sw = src.width, sh = src.height;
  for (let y = 0; y < targetH; y++) {
    const sy = (y + 0.5) * sh / targetH - 0.5;
    const y0 = Math.max(0, Math.floor(sy));
    const y1 = Math.min(sh - 1, y0 + 1);
    const fy = sy - Math.floor(sy);
    for (let x = 0; x < targetW; x++) {
      const sx = (x + 0.5) * sw / targetW - 0.5;
      const x0 = Math.max(0, Math.floor(sx));
      const x1 = Math.min(sw - 1, x0 + 1);
      const fx = sx - Math.floor(sx);
      const o = (y * targetW + x) * 4;
      const i00 = (y0 * sw + x0) * 4, i10 = (y0 * sw + x1) * 4;
      const i01 = (y1 * sw + x0) * 4, i11 = (y1 * sw + x1) * 4;
      for (let c = 0; c < 4; c++) {
        const top = src.data[i00 + c] * (1 - fx) + src.data[i10 + c] * fx;
        const bot = src.data[i01 + c] * (1 - fx) + src.data[i11 + c] * fx;
        buf[o + c] = Math.round(top * (1 - fy) + bot * fy);
      }
    }
  }
  if (!byTarget) { byTarget = new Map(); _resampleCache.set(src, byTarget); }
  byTarget.set(key, buf);
  return new ImageData(new Uint8ClampedArray(buf), targetW, targetH);
}


/**
 * Extract a `targetW × targetH` window CENTERED on the source, clamped to bounds.
 *
 * This is what FCP does for a WIDE EQUIRECT (360°/VR) scene: it renders the full
 * 2:1 panorama (e.g. 4096×2048) then reads back a 1920×1080 window anchored on the
 * aperture centre — a front-facing view of the panorama — NOT a bilinear squeeze of
 * the whole 2:1 canvas into 16:9 (which horizontally compresses everything ~2.13×).
 * Verified against oz_render.mm's equirect readback (roi = {cx-960, cy-540, W, H},
 * cx=-sceneBounds.x, cy=-sceneBounds.y) and the ~12 dB gap between the headless
 * centred crop (Bloom 16.9 dB) and the old engine squeeze (5.1 dB). See
 * docs/notes/FCP_360_BLUR_REVERSE_ENGINEERING.md.
 */
export function cropCenter(src: ImageData, targetW: number, targetH: number): ImageData {
  if (src.width === targetW && src.height === targetH) return src;
  const out = new ImageData(new Uint8ClampedArray(targetW * targetH * 4), targetW, targetH);
  const sw = src.width, sh = src.height;
  const x0 = Math.round((sw - targetW) / 2);
  const y0 = Math.round((sh - targetH) / 2);
  for (let y = 0; y < targetH; y++) {
    const syRow = y + y0;
    if (syRow < 0 || syRow >= sh) continue; // out-of-bounds rows stay transparent
    for (let x = 0; x < targetW; x++) {
      const sx = x + x0;
      if (sx < 0 || sx >= sw) continue;
      const o = (y * targetW + x) * 4;
      const i = (syRow * sw + sx) * 4;
      out.data[o] = src.data[i]; out.data[o + 1] = src.data[i + 1];
      out.data[o + 2] = src.data[i + 2]; out.data[o + 3] = src.data[i + 3];
    }
  }
  return out;
}
