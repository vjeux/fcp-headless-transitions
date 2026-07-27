// CMTime.ts — CoreMedia CMTime primitive + the CM* functions FCP's interpolators call through the
// __stubs table (CMTimeCompare @0xaca80, CMTimeGetSeconds @0xaca8c, CMTimeMake @0xaca92,
// PC_CMTimeSaferAdd @0xacad4, PC_CMTimeSaferSubtract @0xacada). These are Apple public API with
// exact, documented semantics (not FCP-internal); implemented per the CoreMedia contract so the
// interpolator transcriptions run on real rational-time arithmetic rather than float seconds.
//
// struct CMTime { int64 value; int32 timescale; uint32 flags; int64 epoch; }  (Apple layout)
//   flags bit0 = kCMTimeFlags_Valid. seconds = value / timescale (for a valid, numeric time).

export const kCMTimeFlags_Valid = 1 << 0;
export const kCMTimeFlags_HasBeenRounded = 1 << 1;
export const kCMTimeFlags_PositiveInfinity = 1 << 2;
export const kCMTimeFlags_NegativeInfinity = 1 << 3;
export const kCMTimeFlags_Indefinite = 1 << 4;

export interface CMTime {
  value: number;      // int64 (JS number; template times fit well within 2^53)
  timescale: number;  // int32
  flags: number;      // uint32
  epoch: number;      // int64
}

/** CMTimeMake(value, timescale) — a valid numeric time with epoch 0. */
export function CMTimeMake(value: number, timescale: number): CMTime {
  return { value, timescale, flags: kCMTimeFlags_Valid, epoch: 0 };
}

/** CMTimeGetSeconds(t) = t.value / t.timescale (double). */
export function CMTimeGetSeconds(t: CMTime): number {
  return t.value / t.timescale;
}

/**
 * CMTimeCompare(a, b): -1 if a<b, 0 if a==b, 1 if a>b. Compares epoch first, then value/timescale
 * by cross-multiplication (a.value*b.timescale vs b.value*a.timescale) — done in double here to
 * avoid 64-bit overflow; template magnitudes are small enough that this is exact.
 */
export function CMTimeCompare(a: CMTime, b: CMTime): number {
  if (a.epoch !== b.epoch) return a.epoch < b.epoch ? -1 : 1;
  const lhs = a.value * b.timescale;
  const rhs = b.value * a.timescale;
  if (lhs === rhs) return 0;
  return lhs < rhs ? -1 : 1;
}

/**
 * Common-timescale add/subtract. CoreMedia converts both operands to a shared timescale and combines
 * the values; PC_CMTimeSaferAdd/Subtract are Meta wrappers that guard against 64-bit overflow. With a
 * shared timescale (the common case for one curve's keypoints) this is exact; otherwise we use the
 * product timescale, matching value/timescale = a±b arithmetic.
 */
function combine(a: CMTime, b: CMTime, sub: boolean): CMTime {
  if (a.timescale === b.timescale) {
    return { value: sub ? a.value - b.value : a.value + b.value, timescale: a.timescale, flags: kCMTimeFlags_Valid, epoch: 0 };
  }
  const ts = a.timescale * b.timescale;
  const av = a.value * b.timescale;
  const bv = b.value * a.timescale;
  return { value: sub ? av - bv : av + bv, timescale: ts, flags: kCMTimeFlags_Valid, epoch: 0 };
}

/** PC_CMTimeSaferAdd(a, b). */
export function PC_CMTimeSaferAdd(a: CMTime, b: CMTime): CMTime { return combine(a, b, false); }
/** PC_CMTimeSaferSubtract(a, b) = a - b. */
export function PC_CMTimeSaferSubtract(a: CMTime, b: CMTime): CMTime { return combine(a, b, true); }
