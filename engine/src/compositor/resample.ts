/**
 * Bilinear image resampling.
 * Used to conform the scene's native authoring resolution to a target output
 * resolution (matching FCP's project-resolution conform, e.g. a 4096x2048 VR
 * template rendered into a 1920x1080 project).
 */
export function resample(src: ImageData, targetW: number, targetH: number): ImageData {
  if (src.width === targetW && src.height === targetH) return src;
  const out = new ImageData(new Uint8ClampedArray(targetW * targetH * 4), targetW, targetH);
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
        out.data[o + c] = Math.round(top * (1 - fy) + bot * fy);
      }
    }
  }
  return out;
}
