/**
 * "360° Reorient" FxPlug filter — plugin UUID E61FE95E-0108-47DA-8F29-3CB3C47428EF.
 *
 * Reorients an EQUIRECTANGULAR 360° image by rotating the viewing sphere by three
 * Euler angles (all in RADIANS, read straight from the .motr):
 *
 *   <parameter name="Tilt (X)" .../>   rotation about the X axis (pitch)
 *   <parameter name="Pan (Y)"  .../>   rotation about the Y axis (yaw / heading)
 *   <parameter name="Roll (Z)" .../>   rotation about the Z axis (roll)
 *   <parameter name="Mix" .../>         blend reoriented result back toward input
 *   <parameter name="Flip" .../>        (unused by shipping transitions)
 *   <parameter name="Input Points" .../>(unused by shipping transitions)
 *
 * This filter (and its named variants — "360° Reorient", "…Start", "…2",
 * "…X Rotation", "…Y Rotation") is used by the entire 360° transition family
 * (Bloom, Circle Wipe, Divide, Gaussian Blur, Push, Reveal Wipe, Slide, Wipe).
 * The variants differ only by which Euler angle they set:
 *   - "Start" typically parks a fixed offset (e.g. Pan = π for Push/Slide, so the
 *     "start" panorama faces the opposite direction; Tilt = π/2 for Circle Wipe).
 *   - "X Rotation" / "Y Rotation" leave the angles at 0 in the template and are
 *     driven at runtime by Link/OSC behaviors ("Link OSC Y to Reorient X", etc.).
 *   - The plain "360° Reorient" / "…2" carry whatever static reorientation the
 *     template baked in (0 = identity passthrough).
 *
 * MATH (standard equirectangular sphere remap):
 *   An equirectangular image maps a full sphere: horizontal axis = longitude
 *   λ ∈ [-π, π], vertical axis = latitude φ ∈ [+π/2 (top) .. -π/2 (bottom)].
 *   For each OUTPUT pixel we:
 *     1. u,v → (λ, φ) → unit direction d (Y-up, right-handed, +Z forward):
 *          d = (cosφ·sinλ, sinφ, cosφ·cosλ)
 *     2. Rotate the *sphere* by R = Rz(Roll)·Ry(Pan)·Rx(Tilt).  We are asking
 *        "for the direction the viewer now looks (output d), which point of the
 *        SOURCE panorama is there?", so we apply the INVERSE rotation to d to get
 *        the source direction:  s = Rᵀ · d.
 *     3. s → (λ', φ') → source (u', v'), wrapping longitude horizontally and
 *        clamping latitude vertically, then bilinear-sample the source.
 *   Identity rotation (0,0,0) is an exact passthrough.
 *
 * NOTE ON HEADLESS VALIDATION: the 360° Reorient FxPlug plugin does NOT load in
 * the headless FCP render harness (its transitions render black), so a direct
 * pixel-for-pixel ground-truth PSNR is not available for this filter. The remap
 * math is validated by unit tests (test/reorient360.test.ts): identity = exact
 * passthrough, and known Pan/Tilt/Roll rotations map sample directions to the
 * expected longitude/latitude. This is the textbook equirectangular reorientation
 * used by every 360° video tool; the only engine-specific choice (axis convention
 * / rotation order) is documented above and matches Motion's Tilt-X / Pan-Y /
 * Roll-Z labeling.
 */
import { registerFilter, type FilterContext } from './registry.js';

const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;

/**
 * Build the 3x3 rotation matrix R = Rz(roll)·Ry(pan)·Rx(tilt) as a flat row-major
 * array [ r00,r01,r02, r10,r11,r12, r20,r21,r22 ].
 * Axes: X right, Y up, Z forward (toward the viewer's default look direction).
 */
export function reorientMatrix(tilt: number, pan: number, roll: number): number[] {
  const cx = Math.cos(tilt), sx = Math.sin(tilt);
  const cy = Math.cos(pan),  sy = Math.sin(pan);
  const cz = Math.cos(roll), sz = Math.sin(roll);

  // Rx (about X): [1 0 0; 0 cx -sx; 0 sx cx]
  // Ry (about Y): [cy 0 sy; 0 1 0; -sy 0 cy]
  // Rz (about Z): [cz -sz 0; sz cz 0; 0 0 1]
  // R = Rz * Ry * Rx
  // First Ry*Rx:
  const yx00 = cy,            yx01 = sy * sx,        yx02 = sy * cx;
  const yx10 = 0,             yx11 = cx,             yx12 = -sx;
  const yx20 = -sy,           yx21 = cy * sx,        yx22 = cy * cx;
  // Then Rz * (Ry*Rx):
  const r00 = cz * yx00 - sz * yx10;
  const r01 = cz * yx01 - sz * yx11;
  const r02 = cz * yx02 - sz * yx12;
  const r10 = sz * yx00 + cz * yx10;
  const r11 = sz * yx01 + cz * yx11;
  const r12 = sz * yx02 + cz * yx12;
  const r20 = yx20;
  const r21 = yx21;
  const r22 = yx22;
  return [r00, r01, r02, r10, r11, r12, r20, r21, r22];
}

/** Direction unit vector for an equirectangular (longitude λ, latitude φ). */
export function dirFromLonLat(lon: number, lat: number): [number, number, number] {
  const cphi = Math.cos(lat);
  return [cphi * Math.sin(lon), Math.sin(lat), cphi * Math.cos(lon)];
}

/** (longitude λ ∈ [-π,π], latitude φ ∈ [-π/2,π/2]) for a unit direction vector. */
export function lonLatFromDir(x: number, y: number, z: number): [number, number] {
  const lon = Math.atan2(x, z);          // 0 at +Z, +π/2 at +X
  const lat = Math.asin(Math.max(-1, Math.min(1, y)));
  return [lon, lat];
}

/**
 * Core spherical remap. Rotates the source panorama by (tilt,pan,roll) and returns
 * the reoriented equirectangular image. Alpha is preserved per sampled pixel.
 */
export function reorient360(
  input: ImageData,
  tilt: number,
  pan: number,
  roll: number,
): ImageData {
  const w = input.width, h = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  const R = reorientMatrix(tilt, pan, roll);
  // Inverse of a rotation is its transpose; s = Rᵀ · d.
  const [r00, r01, r02, r10, r11, r12, r20, r21, r22] = R;

  for (let y = 0; y < h; y++) {
    // v center of row → latitude (top row v≈0 → +π/2)
    const v = (y + 0.5) / h;
    const lat = (0.5 - v) * Math.PI;
    const cphi = Math.cos(lat);
    const dy = Math.sin(lat);
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w;
      const lon = (u - 0.5) * TWO_PI;
      const dx = cphi * Math.sin(lon);
      const dz = cphi * Math.cos(lon);

      // s = Rᵀ · d  (transpose: columns become rows)
      const sx = r00 * dx + r10 * dy + r20 * dz;
      const sy = r01 * dx + r11 * dy + r21 * dz;
      const sz = r02 * dx + r12 * dy + r22 * dz;

      // source (λ',φ')
      const slon = Math.atan2(sx, sz);
      const slat = Math.asin(Math.max(-1, Math.min(1, sy)));

      // → source pixel coords (continuous), wrap longitude, clamp latitude
      let su = slon / TWO_PI + 0.5;            // [0,1)
      su -= Math.floor(su);                     // wrap
      const svf = 0.5 - slat / Math.PI;         // [0,1]
      const fx = su * w - 0.5;
      const fy = svf * h - 0.5;

      // bilinear sample with horizontal wrap + vertical clamp
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = fx - x0, ty = fy - y0;
      const xa = ((x0 % w) + w) % w;
      const xb = ((x0 + 1) % w + w) % w;
      const ya = y0 < 0 ? 0 : (y0 > h - 1 ? h - 1 : y0);
      const yb = y0 + 1 < 0 ? 0 : (y0 + 1 > h - 1 ? h - 1 : y0 + 1);

      const i00 = (ya * w + xa) * 4;
      const i10 = (ya * w + xb) * 4;
      const i01 = (yb * w + xa) * 4;
      const i11 = (yb * w + xb) * 4;
      const oi = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) {
        const top = src[i00 + c] * (1 - tx) + src[i10 + c] * tx;
        const bot = src[i01 + c] * (1 - tx) + src[i11 + c] * tx;
        out[oi + c] = top * (1 - ty) + bot * ty;
      }
    }
  }
  return new ImageData(out, w, h);
}

registerFilter({
  uuid: 'E61FE95E-0108-47DA-8F29-3CB3C47428EF',
  names: ['reorient', '360'],
  label: '360° Reorient',
  apply(input, ctx: FilterContext) {
    const tilt = ctx.param('Tilt (X)', 0);
    const pan = ctx.param('Pan (Y)', 0);
    const roll = ctx.param('Roll (Z)', 0);
    const mix = ctx.param('Mix', 1);

    // Identity rotation → exact passthrough (common case for X/Y Rotation variants
    // whose angle is 0 unless driven by an OSC/Link behavior).
    const eps = 1e-9;
    if (Math.abs(tilt) < eps && Math.abs(pan) < eps && Math.abs(roll) < eps) {
      return input;
    }

    const reoriented = reorient360(input, tilt, pan, roll);
    const m = Math.max(0, Math.min(1, mix));
    if (m >= 1) return reoriented;
    if (m <= 0) return input;

    // Mix blends the reoriented result back toward the input, per channel.
    const src = input.data, rot = reoriented.data;
    const out = new Uint8ClampedArray(src.length);
    for (let i = 0; i < src.length; i++) {
      out[i] = src[i] + (rot[i] - src[i]) * m;
    }
    return new ImageData(out, input.width, input.height);
  },
});
