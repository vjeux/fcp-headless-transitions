// Gettype4_floatTile_AVX(HGTile*, HGToneCurve::State*, HGNode*) @Helium 0x27c420
//
// Raw transcription of the file-local x86_64 AVX kernel
// `__ZL22Gettype4_floatTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode`.
// The body is a 319-line leaf: no calls, no virtual dispatch, and every numeric
// coefficient is loaded from HGToneCurve::State through %rsi.
//
// The 256-bit path handles two RGBA-f32 pixels at a time; the 128-bit tail
// handles one. All arithmetic is lane-local except alpha broadcasts within each
// 128-bit pixel half. The two paths differ at two compares: the wide path uses
// ordered `vcmpltps` @0x27c53d/@0x27c74a, while the tail uses unordered-true
// `vcmpnleps` @0x27c87b/@0x27ca63. `type4Lane` keeps that distinction explicit.
//
// State slots read by this body (byte offsets from %rsi):
//   scalars: +0x00 @0x27c51b, +0x04 @0x27c515, +0x08 @0x27c75f,
//            +0x0c @0x27c755, +0x20 @0x27c765, +0x24 @0x27c773,
//            +0x40 @0x27c788.
//   vectors: +0x80 @0x27c4e8, +0xa0 @0x27c529, +0x1e0 @0x27c4e0,
//            +0x220 @0x27c4ac, +0x240 @0x27c562, +0x260 @0x27c549,
//            +0x280 @0x27c531, +0x2a0 @0x27c5c7, +0x2c0 @0x27c5d4,
//            +0x2e0 @0x27c5e6, +0x400 @0x27c712, +0x440 @0x27c4c4,
//            +0x5e0 @0x27c552, +0x600 @0x27c57d, +0x620 @0x27c589,
//            +0x640..+0x740 @0x27c601..0x27c669,
//            +0x760/+0x780 @0x27c684/@0x27c68c,
//            +0x7a0..+0x880 @0x27c6a4..0x27c6f9,
//            +0x8c0/+0x8e0 @0x27c4b4/@0x27c497,
//            +0x940/+0x960 @0x27c4fc/@0x27c4f4.
//
// HGTile fields read by the prologue @0x27c420..0x27c44c:
//   +0x00 x0, +0x04 y0, +0x08 x1, +0x0c y1,
//   +0x10 destination, +0x18 destination stride in pixels,
//   +0x50 source, +0x58 source stride in pixels.
// The HGNode* argument is never read.

const f32 = Math.fround;
const bitScratch = new DataView(new ArrayBuffer(4));

function bitsOf(x: number): number {
  bitScratch.setFloat32(0, f32(x), true);
  return bitScratch.getUint32(0, true);
}

function floatOf(bits: number): number {
  bitScratch.setUint32(0, bits >>> 0, true);
  return bitScratch.getFloat32(0, true);
}

/** Intel MAXPS: src2 wins on equal and unordered. */
function maxps(src1: number, src2: number): number {
  return src1 > src2 ? f32(src1) : f32(src2);
}

/** Intel MINPS: src2 wins on equal and unordered. */
function minps(src1: number, src2: number): number {
  return src1 < src2 ? f32(src1) : f32(src2);
}

/** `vrcpps` @0x27c4a8/@0x27c7ee, modelled as the IEEE f32 reciprocal seed. */
function rcpps(x: number): number {
  // The exact seed bits are implementation-defined. This body performs two
  // refinement rounds @0x27c4c0..0x27c4dc / @0x27c806..0x27c822.
  return f32(1 / f32(x));
}

/** `vcvttps2dq` @0x27c70e/@0x27ca41. */
function truncI32(x: number): number {
  const t = Math.trunc(f32(x));
  if (!Number.isFinite(t) || t < -2147483648 || t > 2147483647) {
    return -2147483648;
  }
  return t | 0;
}

function loadF32(a: Float32Array, i: number, role: string): number {
  const value = a[i];
  if (value === undefined) {
    throw new RangeError(
      `Gettype4_floatTile_AVX @Helium 0x27c420: ${role} index ${i} out of range`,
    );
  }
  return f32(value);
}

function storeF32(a: Float32Array, i: number, value: number): void {
  if (i < 0 || i >= a.length) {
    throw new RangeError(
      `Gettype4_floatTile_AVX @Helium 0x27c420: destination index ${i} out of range`,
    );
  }
  a[i] = f32(value);
}

/** HGTile fields addressed by this kernel. @Helium 0x27c420 */
export interface Gettype4FloatTile {
  /** +0x00 @0x27c436 */ readonly x0: number;
  /** +0x04 @0x27c423 */ readonly y0: number;
  /** +0x08 @0x27c433 */ readonly x1: number;
  /** +0x0c @0x27c420 */ readonly y1: number;
  /** +0x10 @0x27c43c */ readonly dst: Float32Array;
  /** Element index represented by the +0x10 pointer. */ readonly dstBase: number;
  /** +0x18 @0x27c438, in 16-byte pixels. */ readonly dstRowStridePixels: number;
  /** +0x50 @0x27c440 */ readonly src: Float32Array;
  /** Element index represented by the +0x50 pointer. */ readonly srcBase: number;
  /** +0x58 @0x27c444, in 16-byte pixels. */ readonly srcRowStridePixels: number;
}

/** Opaque HGToneCurve::State storage, addressed by byte offset. @Helium 0x27c420 */
export type Gettype4FloatState = DataView;

function stateF32(state: Gettype4FloatState, off: number, lane: number): number {
  return state.getFloat32(off + lane * 4, true);
}

function stateI32(state: Gettype4FloatState, off: number, lane: number): number {
  return state.getInt32(off + lane * 4, true);
}

function pixelLane(px: readonly [number, number, number, number], lane: number): number {
  const value = px[lane];
  if (value === undefined) {
    throw new RangeError(
      `Gettype4_floatTile_AVX @Helium 0x27c420: pixel lane ${lane} out of range`,
    );
  }
  return value;
}

/**
 * One lane of the arithmetic body. `stateLane` is 0..7 in the AVX path and
 * 0..3 in the tail. `tailCompare` selects the two NLE predicates emitted only
 * by the tail.
 */
function type4Lane(
  state: Gettype4FloatState,
  stateLane: number,
  sourceLane: number,
  alpha: number,
  upperClamp: number,
  tailCompare: boolean,
): {value: number; unpremultiplied: number} {
  const sv = (off: number): number => stateF32(state, off, stateLane);
  const scalar = (off: number): number => stateF32(state, off, 0);
  const one = sv(0xa0); // @0x27c529 / @0x27c86f
  const low = sv(0x940); // @0x27c4fc / @0x27c842

  // Two reciprocal-refinement rounds @0x27c49f..0x27c4e8 / @0x27c7e5..0x27c82e.
  let reciprocal = rcpps(maxps(alpha, sv(0x8e0)));
  reciprocal = f32(reciprocal * sv(0x220));
  reciprocal = minps(reciprocal, sv(0x8c0));
  reciprocal = maxps(reciprocal, sv(0x8e0));
  let residual = f32(sv(0x440) - f32(alpha * reciprocal));
  reciprocal = f32(reciprocal * residual);
  residual = f32(sv(0x440) - f32(alpha * reciprocal));
  reciprocal = f32(reciprocal * residual);
  reciprocal = floatOf(bitsOf(reciprocal) & bitsOf(sv(0x1e0)));
  reciprocal = floatOf(bitsOf(reciprocal) | bitsOf(sv(0x80)));
  const unpremultiplied = f32(sourceLane * reciprocal);

  // Clamp @0x27c508..0x27c511 / @0x27c84e..0x27c857.
  const clamped = minps(maxps(unpremultiplied, low), upperClamp);
  const shifted = f32(clamped + scalar(0x04));

  // Zero-gamma selection. The wide form is ordered LT; the tail's NLE form is
  // unordered-true while remaining equivalent on ordered operands.
  const gamma = scalar(0x00);
  const gammaEqLow = gamma === low ? one : 0;
  const forceOne = tailCompare ? !(gammaEqLow <= low) : low < gammaEqLow;
  const x = forceOne ? one : shifted;

  // Log decomposition @0x27c549..0x27c5fc / @0x27c886..0x27c92f.
  const belowCutoff = x < sv(0x260);
  const scaled = f32(x * f32(one + (belowCutoff ? sv(0x5e0) : 0)));
  const mantissa = floatOf(
    (bitsOf(scaled) & bitsOf(sv(0x240))) | bitsOf(one),
  );

  let exponent = f32((!(0 <= x) ? sv(0x600) : 0) - (x === 0 ? sv(0x280) : 0));
  exponent = f32(exponent - (belowCutoff ? sv(0x620) : 0));
  exponent = f32(exponent + (x === sv(0x280) ? sv(0x280) : 0));
  exponent = f32(exponent - sv(0x2a0));
  exponent = f32(exponent + f32(bitsOf(scaled) >>> 23));

  const split = sv(0x2c0) < mantissa ? one : 0;
  exponent = f32(exponent + split);
  const splitProduct = f32(f32(split * sv(0x2e0)) * mantissa);
  const t = f32(f32(mantissa - one) - splitProduct);
  const t2 = f32(t * t);

  // Nine-coefficient log polynomial @0x27c601..0x27c669.
  let p0 = f32(f32(t * sv(0x640)) + sv(0x660));
  const p1 = f32(f32(t * sv(0x680)) + sv(0x6a0));
  let p2 = f32(f32(t * sv(0x6c0)) + sv(0x6e0));
  const p3 = f32(f32(t * sv(0x700)) + sv(0x720));
  p0 = f32(f32(t2 * p0) + p1);
  p2 = f32(f32(t2 * p2) + p3);
  let logPoly = f32(f32(f32(t2 * t2) * p0) + p2);
  logPoly = f32(f32(t * logPoly) + sv(0x740));
  const logValue = f32(exponent + f32(t * logPoly));

  // Exp polynomial @0x27c680..0x27c750.
  const gammaLog = f32(gamma * logValue);
  let bounded = maxps(gammaLog, sv(0x760));
  bounded = minps(bounded, sv(0x780));
  const floorValue = f32(Math.floor(bounded)); // vroundps $1 @0x27c694/@0x27c9c7
  const fraction = f32(bounded - floorValue);
  const fraction2 = f32(fraction * fraction);
  let q = f32(f32(fraction * sv(0x7a0)) + sv(0x7c0));
  const q1 = f32(f32(fraction * sv(0x7e0)) + sv(0x800));
  const q2 = f32(f32(fraction * sv(0x820)) + sv(0x840));
  q = f32(f32(fraction2 * q) + q1);
  q = f32(f32(fraction2 * q) + q2);
  const expFraction = f32(one + f32(fraction * q));

  const lowExponent = floorValue < sv(0x860);
  const adjustedFloor = f32(floorValue + (lowExponent ? sv(0x620) : 0));
  const exponentBits =
    ((truncI32(adjustedFloor) + stateI32(state, 0x400, stateLane & 3)) | 0) << 23;
  let expValue = f32(floatOf(exponentBits) * expFraction);
  expValue = f32(expValue * f32(one + (lowExponent ? sv(0x880) : 0)));

  // Ordered-value fallback @0x27c741..0x27c74f / @0x27ca5a..0x27ca68.
  const orderedMarker = !Number.isNaN(gammaLog) ? one : 0;
  const useExp = tailCompare ? !(orderedMarker <= low) : low < orderedMarker;
  let result = useExp ? expValue : gammaLog;

  result = f32(f32(result * scalar(0x0c)) + scalar(0x08));
  const linear = f32(scalar(0x20) * clamped);
  const useLinear = f32(clamped - scalar(0x24)) < low;
  result = useLinear ? linear : result;
  result = f32(result + scalar(0x40));

  return {value: result, unpremultiplied};
}

/**
 * Process one RGBA pixel through the wide or tail instruction form.
 */
function type4Pixel(
  state: Gettype4FloatState,
  stateHalf: number,
  px: readonly [number, number, number, number],
  tailCompare: boolean,
): [number, number, number, number] {
  const alpha = pixelLane(px, 3);

  // The upper clamp is lane 3 of `(first residual & State+0x960) | State+0x940`
  // @0x27c4f4..0x27c50c / @0x27c83a..0x27c852.
  const alphaLane = stateHalf + 3;
  let seed = rcpps(maxps(alpha, stateF32(state, 0x8e0, alphaLane)));
  seed = f32(seed * stateF32(state, 0x220, alphaLane));
  seed = minps(seed, stateF32(state, 0x8c0, alphaLane));
  seed = maxps(seed, stateF32(state, 0x8e0, alphaLane));
  const firstResidual = f32(
    stateF32(state, 0x440, alphaLane) - f32(alpha * seed),
  );
  const upperClamp = floatOf(
    (bitsOf(firstResidual) & bitsOf(stateF32(state, 0x960, alphaLane))) |
      bitsOf(stateF32(state, 0x940, alphaLane)),
  );

  const values: [number, number, number, number] = [0, 0, 0, 0];
  let unpremultipliedAlpha = 0;
  for (let lane = 0; lane < 4; lane++) {
    const laneResult = type4Lane(
      state,
      stateHalf + lane,
      pixelLane(px, lane),
      alpha,
      upperClamp,
      tailCompare,
    );
    values[lane] = laneResult.value;
    if (lane === 3) {
      unpremultipliedAlpha = laneResult.unpremultiplied;
    }
  }

  // Re-premultiply @0x27c792..0x27c79b / @0x27caa7..0x27cab4, then preserve
  // the unpremultiplied alpha lane with vblendps @0x27c79b/@0x27cab4.
  values[0] = f32(values[0] * unpremultipliedAlpha);
  values[1] = f32(values[1] * unpremultipliedAlpha);
  values[2] = f32(values[2] * unpremultipliedAlpha);
  values[3] = unpremultipliedAlpha;
  return values;
}

/**
 * `Gettype4_floatTile_AVX(HGTile*, HGToneCurve::State*, HGNode*)`
 * @Helium 0x27c420
 * `__ZL22Gettype4_floatTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode`
 */
export function Gettype4_floatTile_AVX(
  tile: Gettype4FloatTile,
  state: Gettype4FloatState,
  _node?: unknown,
): void {
  // @0x27c420..0x27c426: rows = y1-y0; jle -> return.
  const rows = (tile.y1 - tile.y0) | 0;
  if (rows <= 0) return;

  // @0x27c433..0x27c436: columns = x1-x0.
  const cols = (tile.x1 - tile.x0) | 0;
  // @0x27c438..0x27c44c: signed pixel strides scaled by 16 bytes = 4 f32.
  const dstRowStride = (tile.dstRowStridePixels | 0) * 4;
  const srcRowStride = (tile.srcRowStridePixels | 0) * 4;
  let dstRow = tile.dstBase | 0;
  let srcRow = tile.srcBase | 0;

  for (let row = 0; row < rows; row++) {
    let done = 0; // @0x27c472

    // Wide loop @0x27c490..0x27c7c4: two pixels / eight lanes per iteration.
    while (cols - done >= 2) {
      for (let pixel = 0; pixel < 2; pixel++) {
        const srcIndex = srcRow + (done + pixel) * 4;
        const dstIndex = dstRow + (done + pixel) * 4;
        const px: [number, number, number, number] = [
          loadF32(tile.src, srcIndex, "source"),
          loadF32(tile.src, srcIndex + 1, "source"),
          loadF32(tile.src, srcIndex + 2, "source"),
          loadF32(tile.src, srcIndex + 3, "source"),
        ];
        const result = type4Pixel(state, pixel * 4, px, false);
        storeF32(tile.dst, dstIndex, result[0]);
        storeF32(tile.dst, dstIndex + 1, result[1]);
        storeF32(tile.dst, dstIndex + 2, result[2]);
        storeF32(tile.dst, dstIndex + 3, result[3]);
      }
      done += 2; // @0x27c7a8..0x27c7c4
    }

    // Tail @0x27c7d0..0x27cac0: at most one pixel.
    if (done < cols) {
      const srcIndex = srcRow + done * 4;
      const dstIndex = dstRow + done * 4;
      const px: [number, number, number, number] = [
        loadF32(tile.src, srcIndex, "source"),
        loadF32(tile.src, srcIndex + 1, "source"),
        loadF32(tile.src, srcIndex + 2, "source"),
        loadF32(tile.src, srcIndex + 3, "source"),
      ];
      const result = type4Pixel(state, 0, px, true);
      storeF32(tile.dst, dstIndex, result[0]);
      storeF32(tile.dst, dstIndex + 1, result[1]);
      storeF32(tile.dst, dstIndex + 2, result[2]);
      storeF32(tile.dst, dstIndex + 3, result[3]);
    }

    // @0x27c460..0x27c46c: advance both row pointers and count the row.
    srcRow += srcRowStride;
    dstRow += dstRowStride;
  }
  // @0x27cac5..0x27cacc: epilogue, vzeroupper, ret.
}
