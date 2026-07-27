// CMTime.ts — CoreMedia CMTime, a rational time (value/timescale). This models Apple's public
// CMTime struct + the CMTime functions that FCP's interpolators call through the __stubs table:
//   CMTimeCompare, CMTimeSubtract, CMTimeGetSeconds, CMTimeMake, and ProCore's PC_CMTimeSaferAdd/
//   PC_CMTimeSaferSubtract wrappers. Semantics are Apple's documented CMTime contract (not invented):
//   a valid CMTime has flags bit0 (kCMTimeFlags_Valid) set; seconds = value/timescale.
//
// Struct layout (CoreMedia, matches what OZ* read at vertex+0x10/+0x20):
//   +0x00 value:      int64   (CMTimeValue)
//   +0x08 timescale:  int32   (CMTimeScale)
//   +0x0c flags:      uint32  (CMTimeFlags)
//   +0x10 epoch:      int64   (CMTimeEpoch)
export const kCMTimeFlags_Valid = 1 << 0;
export const kCMTimeFlags_HasBeenRounded = 1 << 1;
export const kCMTimeFlags_PositiveInfinity = 1 << 2;
export const kCMTimeFlags_NegativeInfinity = 1 << 3;
export const kCMTimeFlags_Indefinite = 1 << 4;

export interface CMTime {
  value: bigint;      // int64
  timescale: number;  // int32
  flags: number;      // uint32
  epoch: bigint;      // int64
}

/** CMTimeMake(value, timescale) — a valid rational time with epoch 0. (CoreMedia) */
export function CMTimeMake(value: bigint | number, timescale: number): CMTime {
  return { value: BigInt(value), timescale, flags: kCMTimeFlags_Valid, epoch: 0n };
}

/** CMTimeGetSeconds(t) = t.value / t.timescale as a double. (CoreMedia) */
export function CMTimeGetSeconds(t: CMTime): number {
  if (t.timescale === 0) return NaN;
  return Number(t.value) / t.timescale;
}

/**
 * CMTimeSubtract(a, b): rational subtraction with a common timescale. CoreMedia converts both to a
 * common timescale (here we use a.timescale * b.timescale, then this is what the toolbox does before
 * numeric reduction) and subtracts numerators. Result carries the common timescale.
 */
export function CMTimeSubtract(a: CMTime, b: CMTime): CMTime {
  if (a.timescale === b.timescale) {
    return { value: a.value - b.value, timescale: a.timescale, flags: kCMTimeFlags_Valid, epoch: 0n };
  }
  const ts = a.timescale * b.timescale;
  const av = a.value * BigInt(b.timescale);
  const bv = b.value * BigInt(a.timescale);
  return { value: av - bv, timescale: ts, flags: kCMTimeFlags_Valid, epoch: 0n };
}

/** CMTimeAdd(a, b): rational addition with a common timescale (see CMTimeSubtract). */
export function CMTimeAdd(a: CMTime, b: CMTime): CMTime {
  if (a.timescale === b.timescale) {
    return { value: a.value + b.value, timescale: a.timescale, flags: kCMTimeFlags_Valid, epoch: 0n };
  }
  const ts = a.timescale * b.timescale;
  const av = a.value * BigInt(b.timescale);
  const bv = b.value * BigInt(a.timescale);
  return { value: av + bv, timescale: ts, flags: kCMTimeFlags_Valid, epoch: 0n };
}

/** CMTimeCompare(a, b): -1 if a<b, 0 if a==b, 1 if a>b (compares value/timescale). (CoreMedia) */
export function CMTimeCompare(a: CMTime, b: CMTime): number {
  const lhs = a.value * BigInt(b.timescale);
  const rhs = b.value * BigInt(a.timescale);
  if (lhs < rhs) return -1;
  if (lhs > rhs) return 1;
  return 0;
}

// ProCore wrappers: PC_CMTimeSaferAdd / PC_CMTimeSaferSubtract avoid int64 overflow in the common-
// timescale conversion (CMTimeAdditions.mm). Functionally they compute a+b / a-b; the "safer" part is
// overflow handling on the intermediate products, which the BigInt arithmetic above already avoids.
export const PC_CMTimeSaferAdd = CMTimeAdd;
export const PC_CMTimeSaferSubtract = CMTimeSubtract;
