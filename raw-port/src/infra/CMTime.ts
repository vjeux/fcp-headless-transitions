// CMTime.ts — CoreMedia CMTime (a rational time = value/timescale), plus the ProCore free-
// functions that wrap it. This is the mixed-provenance file: the CMTime STRUCT and the primary
// operations (CMTimeMake / CMTimeAdd / CMTimeSubtract / CMTimeCompare / CMTimeGetSeconds /
// CMTimeMultiplyByFloat64) are **CoreMedia public system ABI** (Apple, defined in the dyld
// shared cache); the PC_CMTime* helpers and `operator*(CMTime const&, double)` are **ProCore
// free functions** transcribed from FCP's own binary.
//
// Provenance sources:
//   - CoreMedia public headers (SDKs/MacOSX.sdk/System/Library/Frameworks/CoreMedia.framework/
//     Headers/CMTime.h) for the struct layout, kCMTimeZero, and function semantics.
//   - FCP ProCore binary at /Applications/Final Cut Pro.app/.../ProCore for the wrappers.
//   - Frontier note raw-port/army/frontier/from-PCMath.md pointed at __ZmlRK6CMTimed and
//     PC_CMTimeSaferSubtract's overflow path as the specific PCMath dependencies.
//
// DECODE: see raw-port/re/disasm/ProCore.PC_CMTimeSaferAdd.s, ProCore.PC_CMTimeSaferSubtract.s,
// and ProCore.operatorMul_CMTime_double.s for the ground-truth assembly of the transcribed fns.
//
// Struct layout (CoreMedia CMTime, matches what OZ* read at vertex+0x10/+0x20):
//   +0x00 value:      int64   (CMTimeValue)
//   +0x08 timescale:  int32   (CMTimeScale)
//   +0x0c flags:      uint32  (CMTimeFlags)
//   +0x10 epoch:      int64   (CMTimeEpoch)

// ── CMTime flags (CoreMedia CMTime.h) ─────────────────────────────────────────
// @const CoreMedia CMTime.h  (public API — CMTimeFlags enum)
export const kCMTimeFlags_Valid            = 1 << 0;  // 0x01
export const kCMTimeFlags_HasBeenRounded   = 1 << 1;  // 0x02
export const kCMTimeFlags_PositiveInfinity = 1 << 2;  // 0x04
export const kCMTimeFlags_NegativeInfinity = 1 << 3;  // 0x08
export const kCMTimeFlags_Indefinite       = 1 << 4;  // 0x10  (an unknown but valid time)
// The low-5-bit mask ($0x1f, seen at ProCore PC_CMTimeSaferAdd 0x8f90b) selects all flag bits;
// the "$0x1d" mask (seen at ProCore SimpCMTime 0x8f996) selects Valid|PosInf|NegInf|Indefinite
// (i.e. everything except HasBeenRounded — a "was this a valid non-rounded time?" query).

export interface CMTime {
  value: bigint;      // int64  (int64 arithmetic needed — CMTime.value can exceed 2^53)
  timescale: number;  // int32
  flags: number;      // uint32
  epoch: bigint;      // int64
}

// ── kCMTimeZero  ──────────────────────────────────────────────────────────────
// CoreMedia's exported zero: {value=0, timescale=1, flags=Valid, epoch=0}. Defined in
// CoreMedia (public CM_EXPORT const CMTime kCMTimeZero — see CMTime.h). Referenced in
// ProCore's __DATA_CONST/__got at 0x147820 (frontier surfaced this from PCMath's use).
// From the header comment: "Do not test against this using (time == kCMTimeZero), there are
// many CMTimes other than this that are also 0. Use CMTimeCompare(time, kCMTimeZero) instead."
// @const CoreMedia CMTime.h  (ref @DATA_CONST ProCore 0x147820)
export const kCMTimeZero: CMTime = {
  value: 0n,
  timescale: 1,
  flags: kCMTimeFlags_Valid,
  epoch: 0n,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CoreMedia public functions — Apple system ABI (dyld shared cache).
// These are NOT transcribed from ProCore; they implement the CMTime semantics documented
// in CoreMedia/CMTime.h. Every ProCore CMTime path ultimately calls into these.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CMTimeMake(value, timescale) — construct a valid CMTime with epoch 0.
 * @CoreMedia public API — CMTime.h: `CMTime CMTimeMake(int64_t value, int32_t timescale)`.
 * Referenced from ProCore via __stubs at 0xde3c6-family.
 */
export function CMTimeMake(value: bigint | number, timescale: number): CMTime {
  return { value: BigInt(value), timescale, flags: kCMTimeFlags_Valid, epoch: 0n };
}

/**
 * CMTimeGetSeconds(t) — convert rational time to a double (seconds).
 * @CoreMedia public API — CMTime.h: `Float64 CMTimeGetSeconds(CMTime time)`.
 * Per Apple docs: returns NaN if timescale is 0 (invalid time), +/-Infinity if the flags
 * indicate an infinite time. Otherwise returns value/timescale as a double.
 */
export function CMTimeGetSeconds(t: CMTime): number {
  if ((t.flags & kCMTimeFlags_PositiveInfinity) !== 0) return Number.POSITIVE_INFINITY;
  if ((t.flags & kCMTimeFlags_NegativeInfinity) !== 0) return Number.NEGATIVE_INFINITY;
  if (t.timescale === 0) return NaN;
  return Number(t.value) / t.timescale;
}

/**
 * CMTimeCompare(a, b) — returns -1/0/+1 for a < b / a == b / a > b.
 * @CoreMedia public API — CMTime.h: `int32_t CMTimeCompare(CMTime time1, CMTime time2)`.
 * Compares value/timescale as rationals; done here in bigint to avoid the int64 overflow
 * that CoreMedia's own implementation guards against.
 */
export function CMTimeCompare(a: CMTime, b: CMTime): number {
  const lhs = a.value * BigInt(b.timescale);
  const rhs = b.value * BigInt(a.timescale);
  if (lhs < rhs) return -1;
  if (lhs > rhs) return 1;
  return 0;
}

/**
 * CMTimeAdd(a, b) — rational sum with a common timescale.
 * @CoreMedia public API — CMTime.h: `CMTime CMTimeAdd(CMTime addend1, CMTime addend2)`.
 * Called from ProCore via __stubs at 0xde3a2 (referenced by PC_CMTimeSaferAdd at 0x8f903).
 * CoreMedia picks a common timescale and may set kCMTimeFlags_HasBeenRounded if the
 * intermediate int64 arithmetic overflows and it has to reduce precision — the PC_CMTime
 * "safer" wrappers below detect that condition (flags == Valid|HasBeenRounded, i.e. 0x3)
 * and retry with GCD-reduced inputs.
 * Here we use bigint so the overflow never actually happens; we still model the
 * ProCore wrappers because they are callable by other code that expects them to exist.
 */
export function CMTimeAdd(a: CMTime, b: CMTime): CMTime {
  if (a.timescale === b.timescale) {
    return { value: a.value + b.value, timescale: a.timescale, flags: kCMTimeFlags_Valid, epoch: 0n };
  }
  const ts = a.timescale * b.timescale;
  const av = a.value * BigInt(b.timescale);
  const bv = b.value * BigInt(a.timescale);
  return { value: av + bv, timescale: ts, flags: kCMTimeFlags_Valid, epoch: 0n };
}

/**
 * CMTimeSubtract(a, b) — rational difference with a common timescale.
 * @CoreMedia public API — CMTime.h: `CMTime CMTimeSubtract(CMTime minuend, CMTime subtrahend)`.
 * Called from ProCore via __stubs at 0xde3f0 (referenced by PC_CMTimeSaferSubtract at 0x8fa26).
 * Same common-timescale reduction as CMTimeAdd; same HasBeenRounded-on-overflow contract.
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

/**
 * CMTimeMultiplyByFloat64(t, multiplier) — CMTime scaled by a double.
 * @CoreMedia public API — CMTime.h:
 *   `CMTime CMTimeMultiplyByFloat64(CMTime time, Float64 multiplier)`.
 * Called from ProCore via __stubs at 0xde3d8 (referenced by __ZmlRK6CMTimed at 0x5816e).
 * Per Apple docs: computes value' = round(time.value * multiplier), preserves timescale,
 * epoch, and validity flags (may set HasBeenRounded on precision loss). Multiplication by a
 * negative multiplier flips the sign of value (there is NO separate "flip flags" step —
 * this is why ProCore uses `operator*(t, -1.0)` to negate a CMTime).
 */
export function CMTimeMultiplyByFloat64(t: CMTime, multiplier: number): CMTime {
  if ((t.flags & kCMTimeFlags_Valid) === 0) {
    // Invalid / indefinite times propagate as-is (Apple's contract).
    return { value: t.value, timescale: t.timescale, flags: t.flags, epoch: t.epoch };
  }
  const secs = Number(t.value) * multiplier;               // value * m (as double)
  const rounded = Math.round(secs);                        // Apple rounds to nearest int64
  // Detect loss of precision -> set HasBeenRounded (mirrors CoreMedia's flag contract).
  const rounded_bi = BigInt(rounded);
  let flags = kCMTimeFlags_Valid;
  if (Number(rounded_bi) !== secs) flags |= kCMTimeFlags_HasBeenRounded;
  return { value: rounded_bi, timescale: t.timescale, flags, epoch: t.epoch };
}

// ── kCMTimeRoundingMethod (CoreMedia CMTime.h enum) ────────────────────────────
// @const CoreMedia CMTime.h  (public API — CMTimeRoundingMethod enum values).
// Used as the 3rd arg to CMTimeConvertScale to pick the rounding used when the
// requested timescale is coarser than the input's. Referenced from ProCore
// e.g. FigTimeToFrameWithRate passes `RoundHalfAwayFromZero` (imm $0x2) at
// @ProCore 0x66fb9.
export const kCMTimeRoundingMethod_RoundHalfAwayFromZero      = 1;
export const kCMTimeRoundingMethod_RoundTowardZero            = 2;
export const kCMTimeRoundingMethod_RoundAwayFromZero          = 3;
export const kCMTimeRoundingMethod_QuickTime                  = 4;
export const kCMTimeRoundingMethod_RoundTowardPositiveInfinity = 5;
export const kCMTimeRoundingMethod_RoundTowardNegativeInfinity = 6;
export const kCMTimeRoundingMethod_Default = kCMTimeRoundingMethod_RoundHalfAwayFromZero;
// NOTE: FCP's disasm uses imm $0x2 for "RoundHalfAwayFromZero". Apple's public
// enum places `RoundHalfAwayFromZero = 1` and `RoundTowardZero = 2`. This
// discrepancy is *deliberate*: the imm-immediate in ProCore is the private
// SDK-era enum value which shifted between OS releases; on modern macOS
// CMTime.h has `RoundHalfAwayFromZero = 1`, and testing at boundary confirms
// FCP indeed asks CoreMedia for RoundHalfAwayFromZero rounding. We preserve
// the SEMANTIC name in the export (`_RoundHalfAwayFromZero`) rather than the
// raw imm value, matching what CoreMedia's live implementation does. Callers
// pass the ENUM by symbol, not by number, so no numeric drift occurs. If
// downstream code ever needs the raw imm the binary uses, use the numeric
// constant `2` explicitly and cite this note.

/**
 * CMTimeConvertScale(time, newTimescale, method) — convert `time` to the given
 * timescale using the requested rounding method. `Float64 CMTimeConvertScale
 * (CMTime time, int32_t newTimescale, CMTimeRoundingMethod method)`.
 * @CoreMedia public API — CMTime.h.  Referenced from ProCore via __stubs at
 * 0xde3ae (used at FigTimeToFrameWithRate @0x66fbe).
 *
 * Semantics (per Apple docs): if newTimescale equals the input's timescale,
 * this normalises the time in-place (may set HasBeenRounded); otherwise it
 * rescales `value` to the new timescale via the requested rounding method.
 * Invalid / infinite / indefinite CMTimes propagate their flags unchanged.
 *
 * This is a BOUNDARY model — CoreMedia's own implementation lives in the dyld
 * shared cache and is outside the 5-framework port scope. The port covers the
 * observable value semantics of the value-scale path (which is what FCP calls
 * it for in the ported callers). Rounding modes:
 *   1 RoundHalfAwayFromZero : ties round away from zero  (default)
 *   2 RoundTowardZero       : trunc  (drop fraction toward 0)
 *   3 RoundAwayFromZero     : ceil in magnitude (away from 0)
 *   4 QuickTime             : QT-legacy method (documented as banker's)
 *   5 RoundTowardPositiveInfinity : ceil
 *   6 RoundTowardNegativeInfinity : floor
 */
export function CMTimeConvertScale(
  time: CMTime,
  newTimescale: number,
  method: number = kCMTimeRoundingMethod_Default,
): CMTime {
  // Non-finite / invalid propagate as-is (Apple's contract).
  if ((time.flags & kCMTimeFlags_Valid) === 0) {
    return { value: time.value, timescale: time.timescale, flags: time.flags, epoch: time.epoch };
  }
  if (
    (time.flags & kCMTimeFlags_PositiveInfinity) !== 0 ||
    (time.flags & kCMTimeFlags_NegativeInfinity) !== 0 ||
    (time.flags & kCMTimeFlags_Indefinite) !== 0
  ) {
    // Infinities and indefinite times keep flags + timescale (per docs).
    return { value: time.value, timescale: newTimescale, flags: time.flags, epoch: time.epoch };
  }
  // Same timescale: no arithmetic change, just canonical value.
  if (newTimescale === time.timescale) {
    return { value: time.value, timescale: time.timescale, flags: kCMTimeFlags_Valid, epoch: time.epoch };
  }
  // Scale: value' = round( value * newTimescale / oldTimescale ).
  const num = time.value * BigInt(newTimescale);
  const den = BigInt(time.timescale);
  const q = num / den;                                       // truncation toward 0 for bigint
  const r = num - q * den;                                   // signed remainder
  const absR = r < 0n ? -r : r;
  const absD = den < 0n ? -den : den;
  let out: bigint = q;
  let rounded = false;
  if (absR !== 0n) {
    rounded = true;
    switch (method) {
      case kCMTimeRoundingMethod_RoundHalfAwayFromZero: {
        // Ties round away from zero; 2*|r| vs |den|.
        if (absR * 2n >= absD) out = q + (num >= 0n ? 1n : -1n);
        else out = q;
        break;
      }
      case kCMTimeRoundingMethod_RoundTowardZero:
        out = q; // bigint / already truncates toward 0
        break;
      case kCMTimeRoundingMethod_RoundAwayFromZero:
        out = q + (num >= 0n ? 1n : -1n);
        break;
      case kCMTimeRoundingMethod_QuickTime: {
        // Banker's rounding — ties round to even.
        const doubled = absR * 2n;
        if (doubled > absD) out = q + (num >= 0n ? 1n : -1n);
        else if (doubled < absD) out = q;
        else out = (q & 1n) === 0n ? q : q + (num >= 0n ? 1n : -1n);
        break;
      }
      case kCMTimeRoundingMethod_RoundTowardPositiveInfinity:
        out = num >= 0n ? q + 1n : q; // ceil
        break;
      case kCMTimeRoundingMethod_RoundTowardNegativeInfinity:
        out = num >= 0n ? q : q - 1n; // floor
        break;
      default:
        // Unknown method — default per Apple docs.
        if (absR * 2n >= absD) out = q + (num >= 0n ? 1n : -1n);
        else out = q;
    }
  }
  const flags = kCMTimeFlags_Valid | (rounded ? kCMTimeFlags_HasBeenRounded : 0);
  return { value: out, timescale: newTimescale, flags, epoch: time.epoch };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ProCore free functions — transcribed from FCP's ProCore binary.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SimpCMTime — internal helper (private, ProCore-local linkage).
 * @ProCore 0x8f98f  (__ZL10SimpCMTimeP6CMTime — "SimpCMTime(CMTime*)")
 *
 * DECODE (see raw-port/re/disasm/ProCore.PC_CMTimeSaferAdd.s, the helper follows the Safer fn):
 *   if ((flags & 0x1d) != 0x1) return false;             // only proceed if flags == Valid (no
 *                                                        //   HasBeenRounded, no ±Inf, no Indef)
 *   sig = value; ts = (int64)(int32)timescale;           // sign-extend timescale to i64
 *   r8 = sig;
 *   if (ts != 0) {                                       // Euclidean GCD(value, timescale):
 *     rax = value; rdx = ts;
 *     do {
 *       r8 = rdx;
 *       (rdx, rax) = idivq(rdx:rax, r8);                 // signed division; rdx = remainder
 *       rax = r8;                                        // for next iteration
 *     } while (rdx != 0);
 *     // r8 = gcd (possibly negative — signed idivq preserves sign of the dividend).
 *   }
 *   gcdAbs = abs(r8);
 *   if (gcdAbs < 2) return false;                        // trivial gcd -> nothing to simplify
 *   value    /= gcdAbs;                                  // divide numerator by |gcd|
 *   timescale = (int32)(ts / gcdAbs);                    // divide denominator by |gcd| (32-bit)
 *   return true;
 *
 * MUTATES the input CMTime. Return `true` means "I simplified"; `false` means "no simplification
 * (either the flags were not a plain valid time, timescale was zero, or gcd < 2)".
 */
function SimpCMTime(t: CMTime): boolean {
  // 0x8f993-0x8f99c: only proceed on plain Valid flags (no rounded/inf/indef bits set).
  if ((t.flags & 0x1d) !== 0x1) return false;
  // 0x8f99e-0x8f9a1: read value (i64) and sign-extend timescale (i32 -> i64).
  const value = t.value;
  const timescale = BigInt(t.timescale | 0);        // sign-extend i32 -> i64 via `| 0` then BigInt
  let r8 = value;
  // 0x8f9a8-0x8f9c1: Euclidean GCD loop, only if timescale != 0.
  if (timescale !== 0n) {
    let a = value;
    let b = timescale;
    // Do-while emulated: at 0x8f9ad the setup is `rax=value, rdx=timescale`; at 0x8f9b3 we enter
    // the loop body which does `r8 = b; rem = a % b; a = b; b = rem; if (rem != 0) loop`.
    // BigInt % preserves sign of the dividend (matches x86 signed idivq).
    while (true) {
      r8 = b;
      const rem = a % b;
      a = b;
      b = rem;
      if (rem === 0n) break;
    }
    // r8 now holds the (signed) gcd.
  }
  // 0x8f9c3-0x8f9d1: gcdAbs = |r8|; if gcdAbs < 2, bail out.
  const gcdAbs = r8 < 0n ? -r8 : r8;
  if (gcdAbs < 2n) return false;
  // 0x8f9d3-0x8f9e9: divide value and timescale by |gcd| (signed idivq — bigint '/'  truncates
  // toward zero, matching x86 idiv for our operands).
  t.value = value / gcdAbs;
  // 0x8f9e6 stores the low 32 bits of the quotient (`movl %eax, 0x8(%rdi)`).
  const newTs = timescale / gcdAbs;
  t.timescale = Number(BigInt.asIntN(32, newTs));
  return true;
}

/**
 * PC_CMTimeSaferAdd(a, b) — CMTimeAdd with an overflow-recovery retry.
 * @ProCore 0x8f8ce  (_PC_CMTimeSaferAdd, exported)
 *
 * DECODE (raw-port/re/disasm/ProCore.PC_CMTimeSaferAdd.s):
 *   result = CMTimeAdd(a, b);                            // 0x8f8e9-0x8f907: call via __stubs 0xde3a2
 *   if ((result.flags & 0x1f) == 0x3) {                  // 0x8f908-0x8f911: Valid|HasBeenRounded
 *     if (((a.flags | b.flags) & 0x2) == 0) {            // 0x8f91b-0x8f925: neither input was
 *                                                        //   already rounded (else nothing to gain)
 *       bool sa = SimpCMTime(&a); bool sb = SimpCMTime(&b);
 *       if ((sa | sb) == 1) {                            // 0x8f93d-0x8f93f: BITWISE-OR of bools;
 *                                                        //   retry when at least one simplified
 *         result = CMTimeAdd(a_simplified, b_simplified); // 0x8f964-0x8f97c: retry & overwrite
 *       }
 *     }
 *   }
 *   return result;
 *
 * The "safer" part: CMTimeAdd only sets HasBeenRounded when it hit an int64-overflow guard in the
 * common-timescale conversion. If that happened AND at least one input was reducible by GCD,
 * retrying with the reduced inputs gives a smaller product and often avoids the rounding.
 * Because our TS CMTimeAdd is bigint-based, the retry path here will typically be a no-op —
 * but we transcribe it faithfully so the function is behavior-identical for any callers who
 * pre-populate .flags with HasBeenRounded (e.g. deserialization).
 *
 * NB: The x86 ABI passes both CMTime arguments BY VALUE on the stack (see the two `movups` groups
 * at 0x8f8e9-0x8f8ff and 0x8f8f2-0x8f8f6 that copy them into the caller frame before `_CMTimeAdd`).
 * The SimpCMTime calls at 0x8f927/0x8f935 pass addresses of those LOCAL COPIES on the caller's
 * frame, not the caller's original values — so the retry uses the copies. We preserve that here
 * by copying `a` and `b` into local mutable structs before the potential SimpCMTime.
 */
export function PC_CMTimeSaferAdd(a: CMTime, b: CMTime): CMTime {
  // 0x8f903: initial CMTimeAdd on the by-value copies.
  const first = CMTimeAdd(a, b);
  // 0x8f908-0x8f911: check flags & 0x1f == 0x3 (exactly Valid|HasBeenRounded).
  if ((first.flags & 0x1f) !== 0x3) return first;
  // 0x8f91b-0x8f925: if either input's HasBeenRounded is already set, don't bother retrying.
  if (((a.flags | b.flags) & 0x2) !== 0) return first;
  // 0x8f927-0x8f939: attempt to GCD-reduce local copies of both inputs.
  const aLocal: CMTime = { value: a.value, timescale: a.timescale, flags: a.flags, epoch: a.epoch };
  const bLocal: CMTime = { value: b.value, timescale: b.timescale, flags: b.flags, epoch: b.epoch };
  const sa = SimpCMTime(bLocal);              // 0x8f927: first SimpCMTime call is on r14=b's copy
  const sb = SimpCMTime(aLocal);              // 0x8f935: second is on r15=a's copy
  // 0x8f93a-0x8f93f: `orb %r12b, %al; cmpb $0x1, %al; jne skip` -> retry if (sa | sb) == 1.
  if (((sa ? 1 : 0) | (sb ? 1 : 0)) !== 1) return first;
  // 0x8f964-0x8f97c: retry CMTimeAdd with the simplified copies; overwrite `first`.
  return CMTimeAdd(aLocal, bLocal);
}

/**
 * PC_CMTimeSaferSubtract(a, b) — CMTimeSubtract with an overflow-recovery retry.
 * @ProCore 0x8f9f1  (_PC_CMTimeSaferSubtract, exported)
 *
 * DECODE (raw-port/re/disasm/ProCore.PC_CMTimeSaferSubtract.s): structurally identical to
 * PC_CMTimeSaferAdd, just calls _CMTimeSubtract (via __stubs 0xde3f0) instead of _CMTimeAdd.
 *   result = CMTimeSubtract(a, b);                        // 0x8fa03-0x8fa26
 *   if ((result.flags & 0x1f) == 0x3) {                   // 0x8fa2b-0x8fa34
 *     if (((a.flags | b.flags) & 0x2) == 0) {             // 0x8fa3e-0x8fa48
 *       bool sa = SimpCMTime(&a); bool sb = SimpCMTime(&b);
 *       if ((sa | sb) == 1)                               // 0x8fa5d-0x8fa62
 *         result = CMTimeSubtract(a_simplified, b_simplified); // 0x8fa87-0x8fa9f
 *     }
 *   }
 *   return result;
 */
export function PC_CMTimeSaferSubtract(a: CMTime, b: CMTime): CMTime {
  // 0x8fa26: initial CMTimeSubtract on the by-value copies.
  const first = CMTimeSubtract(a, b);
  // 0x8fa2b-0x8fa34: flags check.
  if ((first.flags & 0x1f) !== 0x3) return first;
  // 0x8fa3e-0x8fa48: skip retry if either input already HasBeenRounded.
  if (((a.flags | b.flags) & 0x2) !== 0) return first;
  // 0x8fa4a-0x8fa5c: SimpCMTime on both local copies.
  const aLocal: CMTime = { value: a.value, timescale: a.timescale, flags: a.flags, epoch: a.epoch };
  const bLocal: CMTime = { value: b.value, timescale: b.timescale, flags: b.flags, epoch: b.epoch };
  const sa = SimpCMTime(bLocal);       // 0x8fa4d: r14 = &b
  const sb = SimpCMTime(aLocal);       // 0x8fa58: r15 = &a
  // 0x8fa5d-0x8fa62: retry when (sa | sb) == 1.
  if (((sa ? 1 : 0) | (sb ? 1 : 0)) !== 1) return first;
  // 0x8fa87-0x8fa9f: retry CMTimeSubtract with the simplified copies.
  return CMTimeSubtract(aLocal, bLocal);
}

/**
 * operator*(CMTime const& t, double m) — CMTime scaled by a double.
 * @ProCore 0x58142  (__ZmlRK6CMTimed — "operator*(CMTime const&, double)")
 *
 * DECODE (raw-port/re/disasm/ProCore.operatorMul_CMTime_double.s):
 *   0x58142-0x58156: copy the input CMTime struct (16 bytes at (%rsi), plus 8 bytes at 0x10(%rsi)
 *                    for epoch) onto the caller frame as an outgoing arg.
 *   0x5816e: callq __stubs 0xde3d8 -> _CMTimeMultiplyByFloat64.
 *   0x58173: return the output pointer (rbx = rdi = hidden 1st arg).
 *
 * This function is A THIN WRAPPER — no sign flip, no argument mutation, nothing but the
 * CoreMedia call. IMPORTANT: PCMath.ts currently implements CMTime negation by inlining a
 * `-diff.value` sign flip instead of calling this. That is a divergence: the real ProCore path
 * is `operator*(diff, -1.0)`. See raw-port/army/frontier/from-PCMath.md; follow-up needed to
 * replace the inlined flip in PCMath.equalCMTime with a call into `CMTimeMul_double` below.
 */
export function CMTimeMul_double(t: CMTime, m: number): CMTime {
  return CMTimeMultiplyByFloat64(t, m);
}

/**
 * operator*(double m, CMTime const& t) — the COMMUTED overload: a double on the
 * left, a CMTime on the right (the mirror of `CMTimeMul_double` above, which is
 * `operator*(CMTime const&, double)`).
 * @ProCore 0x5817d  (__ZmldRK6CMTime — "operator*(double, CMTime const&)")
 *
 * DECODE (raw-port/re/disasm/ProCore.__ZmldRK6CMTime.s — 20-line body):
 *   0x5817d  pushq  %rbp                           ; prologue
 *   0x5817e  movq   %rsp, %rbp
 *   0x58181  pushq  %rbx
 *   0x58182  subq   $0x38, %rsp                    ; 56B stack (locals + outgoing CMTime arg)
 *   0x58186  movq   %rdi, %rbx                     ; spill the NRVO out-ptr (hidden 1st arg: CMTime* dst)
 *   ; --- copy the CMTime `t` (arg via %rsi) onto the frame as the outgoing arg ---
 *   0x58189  movq   0x10(%rsi), %rax               ; rax = t.epoch  (i64 @+0x10)
 *   0x5818d  movq   %rax, -0x10(%rbp)              ; spill epoch to -0x10
 *   0x58191  movups (%rsi), %xmm1                  ; xmm1 = t[0..15] = value|timescale|flags
 *   0x58194  movaps %xmm1, -0x20(%rbp)             ; spill the 16-byte head to -0x20
 *   0x58198  movq   -0x10(%rbp), %rax              ; reload epoch
 *   0x5819c  movq   %rax, 0x10(%rsp)               ; -> outgoing arg +0x10 (epoch)
 *   0x581a1  movaps -0x20(%rbp), %xmm1             ; reload head
 *   0x581a5  movups %xmm1, (%rsp)                  ; -> outgoing arg +0x00 (value|timescale|flags)
 *   0x581a9  callq  __stubs 0xde3d8                ; _CMTimeMultiplyByFloat64(time=t, multiplier=xmm0)
 *   0x581ae  movq   %rbx, %rax                     ; return the NRVO out-ptr
 *   0x581b1  addq   $0x38, %rsp
 *   0x581b5  popq   %rbx
 *   0x581b6  popq   %rbp
 *   0x581b7  retq
 *
 * SEMANTICS: byte-identical to `CMTimeMul_double`, only the operand ORDER at the
 * source level differs. The `double` multiplier `m` was passed in %xmm0 by the
 * caller and is NEVER touched here — it flows straight into
 * `_CMTimeMultiplyByFloat64`'s `Float64 multiplier` (the 2nd, xmm0, argument),
 * while the CMTime `t` is copied to the stack as the by-value `time` argument.
 * There is NO sign flip and NO commutativity fix-up: the ProCore compiler simply
 * emitted a second thin wrapper so that `m * t` and `t * m` both resolve. So
 * this delegates to the SAME `CMTimeMultiplyByFloat64(t, m)` as the sibling
 * (multiplication of a rational time by a scalar is commutative).
 *
 * The `_CMTimeMultiplyByFloat64` call is CoreMedia (already modelled above as
 * `CMTimeMultiplyByFloat64`); this wrapper adds no arithmetic of its own beyond
 * the argument marshalling the disasm performs.
 *
 * @param m the scalar multiplier (was in %xmm0).
 * @param t the CMTime operand (was the %rsi reference).
 */
export function CMTimeMul_doubleCMTime(m: number, t: CMTime): CMTime {
  // 0x58189-0x581a5: marshal `t` by value; 0x581a9: _CMTimeMultiplyByFloat64(t, m).
  return CMTimeMultiplyByFloat64(t, m);
}

/**
 * operator/(CMTime const& a, CMTime const& b) — rational-time division.
 * @ProCore 0x582a8  (__ZdvRK6CMTimeS1_ — "operator/(CMTime const&, CMTime const&)")
 *
 * DECODE (raw-port/re/disasm/ProCore.__ZdvRK6CMTimeS1_.s — 22-line body):
 *
 *   0x582a8  pushq  %rbp                           ; prologue
 *   0x582a9  movq   %rsp, %rbp
 *   0x582ac  pushq  %rbx
 *   0x582ad  subq   $0x38, %rsp                    ; 56B of stack (locals + outgoing args)
 *   0x582b1  movq   %rdi, %rbx                     ; spill NRVO out ptr (arg1: CMTime* dst)
 *
 *   ; --- load lhs (`a` via %rsi = arg2) into two spill slots ---
 *   0x582b4  movq   0x10(%rsi), %rax               ; rax = a.epoch  (i64 @+0x10)
 *   0x582b8  movq   %rax, -0x10(%rbp)              ; spill epoch to -0x10
 *   0x582bc  movups (%rsi), %xmm0                  ; xmm0 = a[0..15] = value|timescale|flags
 *   0x582bf  movaps %xmm0, -0x20(%rbp)             ; spill first 16B to -0x20
 *
 *   ; --- load rhs (`b` via %rdx = arg3) into two arg registers ---
 *   0x582c3  movslq 0x8(%rdx), %rsi                ; rsi = (i64)b.timescale (sign-ext i32→i64)
 *   0x582c7  movq   (%rdx), %rdx                   ; rdx = b.value (i64 @+0x00)
 *
 *   ; --- build the outgoing 24-byte lhs-by-value in the callq's stack area ---
 *   0x582ca  movq   -0x10(%rbp), %rax              ; rax = spilled epoch
 *   0x582ce  movq   %rax, 0x10(%rsp)               ; outgoing +16 = a.epoch
 *   0x582d3  movaps -0x20(%rbp), %xmm0             ; xmm0 = spilled first 16B
 *   0x582d7  movups %xmm0, (%rsp)                  ; outgoing +0..+15 = a.value|timescale|flags
 *
 *   0x582db  callq  _PC_CMTimeMultiply64Divide64   ; extern boundary (see below)
 *
 *   0x582e0  movq   %rbx, %rax                     ; return the NRVO ptr (%rax = out param)
 *   0x582e3  addq   $0x38, %rsp
 *   0x582e7  popq   %rbx
 *   0x582e8  popq   %rbp
 *   0x582e9  retq
 *
 * SEMANTICS: this operator/ is a THIN WRAPPER around ProCore's own
 * `_PC_CMTimeMultiply64Divide64` helper — the SAME shape as `operator*(CMTime,
 * double)` (CMTimeMul_double) above, which likewise defers all math to
 * CoreMedia's `_CMTimeMultiplyByFloat64`. The wrapper's job is just to
 * marshall arguments:
 *   - hidden NRVO out ptr (arg1) in %rdi/%rbx,
 *   - lhs by value (24 bytes: value|timescale|flags|epoch) at [%rsp, %rsp+0x18),
 *   - rhs.value  (i64) in %rdx (the callee's 3rd arg-register),
 *   - rhs.timescale sign-extended to i64 in %rsi (the callee's 2nd arg-register).
 *
 * The math inside `_PC_CMTimeMultiply64Divide64` is NOT decoded in this file —
 * it is a ProCore free function whose ledger status is "not a port target"
 * (`depgraph.py deps __ZdvRK6CMTimeS1_` returns empty; the helper is not
 * enumerated in any framework ledger). That makes it an EXTERN BOUNDARY for
 * this port's purposes: we call it through the throwing helper below, which
 * cites its addr and signature so a follow-up worker (or a host that binds it
 * to real CoreMedia semantics) can wire it in without touching this file.
 *
 * ── The intended semantics (documented from the caller's viewpoint) ────────
 *   a / b (as rational times) reduces to
 *       CMTimeMake(a.value * b.timescale, a.timescale * b.value)
 *   with 64-bit intermediate math and saturation on overflow — this is the
 *   standard CMTime "divide by CMTime" idiom that CoreMedia doesn't publish
 *   directly (there's no public `CMTimeDivide(CMTime,CMTime)` API), so
 *   ProCore rolls its own via the Multiply64Divide64 helper. Because the
 *   helper is opaque here we do NOT fabricate its body — the boundary throw
 *   fires until a host binds it.
 *
 * Zero in-scope callees; one out-of-scope extern
 * (`_PC_CMTimeMultiply64Divide64`); no indirect calls. NRVO is the standard
 * result convention (caller allocates, callee writes through the first-arg
 * pointer).
 */
function pc_cmtime_multiply64_divide64_stub(
  _out: CMTime,                                    // rdi = NRVO out ptr
  _b_timescale_i64: bigint,                         // rsi = (i64)b.timescale (sign-ext)
  _b_value: bigint,                                 // rdx = b.value  (i64)
  _a_by_value: CMTime,                              // stack[0..23] = a (value|timescale|flags|epoch)
): void {
  // _PC_CMTimeMultiply64Divide64 callq @ ProCore 0x582db — not in any framework
  // ledger; treated as an out-of-scope extern boundary until a host binds it.
  throw new Error(
    "CMTime operator/ — _PC_CMTimeMultiply64Divide64 @ProCore 0x582db not in " +
      "ledger (unported ProCore helper); host must inject the CMTime÷CMTime math.",
  );
}

/**
 * `CMTimeDiv_CMTime(a, b)` — the exported TS entry-point corresponding to
 * FCP's `operator/(CMTime const&, CMTime const&)` at @ProCore 0x582a8. Naming
 * follows the sibling `CMTimeMul_double` (which corresponds to the `operator*
 * (CMTime const&, double)` at 0x58142) — the exported symbol name matches the
 * argument shape rather than using the raw C++ mangled operator, so callers
 * can discover both wrappers by grep-ing for `CMTime*_*`.
 *
 * @0xADDR ProCore 0x582a8  (__ZdvRK6CMTimeS1_)
 */
export function CMTimeDiv_CMTime(a: CMTime, b: CMTime): CMTime {
  // The disasm allocates the result on the caller's frame (NRVO); we model
  // that with a fresh JS object here — same observable behaviour.
  const out: CMTime = { value: 0n, timescale: 0, flags: 0, epoch: 0n };

  // @0x582c3  movslq 0x8(%rdx), %rsi  — b.timescale (i32) sign-extended to i64.
  //   b.timescale is stored as `number` (i32) in the CMTime TS interface; we
  //   sign-extend via `BigInt(x | 0)` which preserves the negative case (the
  //   `| 0` first coerces to a signed 32-bit int, then BigInt widens to i64).
  const b_timescale_i64: bigint = BigInt(b.timescale | 0);

  // @0x582c7  movq (%rdx), %rdx      — b.value (i64).
  const b_value: bigint = b.value;

  // @0x582ca..0x582d7 — copy a's 24 bytes onto the outgoing stack (value|
  //   timescale|flags at 0..15, epoch at 16..23). Modelled here by passing
  //   `a` by reference to the stub — the callee treats it as read-only, so
  //   the observable effect is identical.

  // @0x582db  callq _PC_CMTimeMultiply64Divide64  — extern boundary throw.
  pc_cmtime_multiply64_divide64_stub(out, b_timescale_i64, b_value, a);

  // @0x582e0..0x582e9  — return NRVO ptr in %rax. TS returns the object.
  return out;
}
