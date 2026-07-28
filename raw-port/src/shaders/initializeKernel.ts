// Faithful transcription @0x03c8 — @shader initializeKernel (VAML)
// Transcribed from VAML.framework/Versions/A/Resources/default.metallib
// (function offset 0x03c8).
// IR: raw-port/re/shaders/initializeKernel.ll (129 lines).
//
// COMPUTE kernel — first pass of a Connected-Components-Labeling (CCL)
// pipeline used by VAML's mask/segmentation code.  For each pixel of a
// read/write source texture, it thresholds the RED channel, stamps a
// binary image back into the texture (opaque white above threshold,
// opaque black below), and initialises three flat-linear buffers used by
// later CCL passes:
//
//   idx = gid.y * width + gid.x                             (row-major index)
//   componentCount[idx] = 0     (per-pixel component-size counter — zeroed)
//   centroidX[idx]      = 0     (per-pixel centroid-X accumulator — zeroed)
//   texel = sourceTexture.read(gid)                         (read-write access)
//   red   = texel.r
//   if (red < threshold):
//       labeledImage[idx] = 0
//       sourceTexture.write(gid, (0,0,0,1))                 (mark background)
//   else:
//       labeledImage[idx] = idx + 1                         (unique 1-based label)
//       sourceTexture.write(gid, (1,1,1,1))                 (mark foreground)
//
// Every foreground pixel gets its OWN starting label (idx+1) so that a
// later union-find / equivalence pass can merge neighbours; zero is
// reserved for "background / not-yet-assigned".  The out-of-bounds guard
// at the top uses the standard trick `icmp ult (width-1), gid.x` — i.e.
// treat the "max valid" side as unsigned-less-than the incoming gid.  If
// `gid.x >= width` then `width-1 < gid.x` and the branch takes the early
// exit; same for gid.y vs height.
//
// GATE NOTE: no floating-point math beyond a single `fcmp fast ult` on
// the thresholded red channel; all buffer/texture ops are int/uint.  The
// texture-write literals `(0,0,0,1)` and `(1,1,1,1)` are exact fp32.
//
// Faithful transcription of the IR — no reordering, no fusion.

/**
 * Read-write 2D texture accessor bundled as { read, write, width, height }.
 * The Metal kernel reads and writes the SAME texture via `access::read_write`
 * (per !18 in the .ll).  On the JS side we surface it as an object with
 * separate read/write functions and pre-queried dimensions (mirroring
 * air.get_width_texture_2d / air.get_height_texture_2d).
 *
 * @shader initializeKernel (VAML) IR %8/%14/%25/%31/%33
 */
export type ReadWriteTexture2D = {
  width: number;
  height: number;
  read: (x: number, y: number) => [number, number, number, number];
  write: (x: number, y: number, rgba: [number, number, number, number]) => void;
};

/**
 * initializeKernel — CCL pass 0.  Thresholds one pixel of a source
 * texture on RED and initialises the flat-linear CCL buffers for that
 * pixel.
 *
 * Signature (from .ll):
 *   %0 texture2d<float, read_write> sourceTexture
 *   %1 uint*   labeledImage         (device buffer, per-pixel label)
 *   %2 float*  threshold            (constant buffer, single scalar)
 *   %3 uint*   componentCount       (device buffer, per-pixel counter)
 *   %4 uint*   centroidX            (device buffer, per-pixel accumulator)
 *   %5 ushort2 gid                  (thread_position_in_grid)
 *   %6 uint2   pid                  (thread_position_in_threadgroup, UNUSED)
 *
 * Body:
 *   %8    : width  = air.get_width_texture_2d(sourceTexture, 0)
 *   %9    : gx     = gid.x                                    (i16)
 *   %10   : gxU    = zext gx to i32                           (unsigned widen)
 *   %11   : wMax   = width - 1
 *   %12   : oobX   = icmp ult wMax, gxU                       (gx >= width)
 *   %13   : if oobX -> return
 *   %14   : height = air.get_height_texture_2d(sourceTexture, 0)
 *   %15..%18 : same OOB test on gid.y vs height -> return if oob
 *   %20   : rowStart = width * gid.y                          (i32 mul)
 *   %21   : idx      = rowStart + gid.x                       (linear index)
 *   %22   : idx64    = zext idx to i64                        (buffer offset)
 *   %23   : componentCount[idx] = 0                           (store i32 0)
 *   %24   : centroidX[idx]      = 0                           (store i32 0)
 *   %25   : texel  = sourceTexture.read(gid)                  (rgba+residency)
 *   %26   : texel  = extractvalue lane 0
 *   %27   : red    = texel.r
 *   %28   : t      = *threshold
 *   %29   : below  = fcmp fast ult red, t                     (red < threshold)
 *   %30   : if !below:                                        (foreground)
 *   %31   :   label = idx + 1
 *   %32   :   labeledImage[idx] = label
 *           sourceTexture.write(gid, (1,1,1,1))
 *   %33   : else:                                             (background)
 *   %34   :   labeledImage[idx] = 0
 *           sourceTexture.write(gid, (0,0,0,1))
 *   ret void
 *
 * On the JS side we take gid as an explicit (gx, gy) argument — this
 * matches how compute-kernel drivers dispatch a single thread; the
 * threadgroup position (%6) is unused in the body (per !24 arg_unused).
 *
 * @shader initializeKernel (VAML) IR %8..%34
 */
export function initializeKernel(
  sourceTexture: ReadWriteTexture2D,
  labeledImage: Int32Array | Uint32Array,
  threshold: number,
  componentCount: Int32Array | Uint32Array,
  centroidX: Int32Array | Uint32Array,
  gid: [number, number],
): void {
  // %5..%12 : OOB guard on gid.x vs width using unsigned zext + ult test.
  const width = sourceTexture.width | 0;
  const gx = gid[0] & 0xffff; // zext i16 -> i32 (i.e. treat as unsigned)
  if (((width - 1) >>> 0) < (gx >>> 0)) {
    return;
  }

  // %13..%18 : same OOB guard on gid.y vs height.
  const height = sourceTexture.height | 0;
  const gy = gid[1] & 0xffff;
  if (((height - 1) >>> 0) < (gy >>> 0)) {
    return;
  }

  // %20..%22 : idx = gy * width + gx (row-major).  Cast to unsigned for
  // buffer indexing; JS TypedArrays already treat the index as uint.
  const idx = Math.trunc(width * gy + gx) | 0;

  // %23..%24 : zero the two accumulator slots.  labeledImage assignment
  // happens later inside the branch.
  componentCount[idx] = 0;
  centroidX[idx] = 0;

  // %25..%27 : sample the source texture at integer gid coords (this is
  // `read` not `sample` — no interpolation, no sampler).  Pull red only.
  const texel = sourceTexture.read(gx, gy);
  const red = Math.fround(texel[0]);

  // %28..%29 : compare against the (constant-buffer) threshold using
  // fcmp fast ult.  `ult` returns TRUE for unordered (NaN) as well as
  // less-than.  Our inputs are finite so `<` matches ult here.
  const t = Math.fround(threshold);
  if (red < t) {
    // %33..%34 : background branch.
    labeledImage[idx] = 0;
    sourceTexture.write(gx, gy, [0.0, 0.0, 0.0, 1.0]);
  } else {
    // %30..%32 : foreground branch — stamp a unique 1-based label.
    labeledImage[idx] = (idx + 1) | 0;
    sourceTexture.write(gx, gy, [1.0, 1.0, 1.0, 1.0]);
  }
}
