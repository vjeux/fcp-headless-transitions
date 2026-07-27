// FFAudioDuckingMasterRangeData.ts — piecewise-linear loudness envelope over a CMTime range,
// used by FCP's audio-ducking master to look up (and snap-to) target loudness at a query time.
//
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Disassembly saved at:
//   raw-port/re/disasm/Flexo.FFAudioDuckingMasterRangeData.FFAudioDuckingMasterRangeData.s
//   raw-port/re/disasm/Flexo.FFAudioDuckingMasterRangeData.loudnessLimit.s
//
// TWO methods (from `nm` + `otool -tV` on Flexo):
//   @Flexo 0x00000000003788f0  FFAudioDuckingMasterRangeData::FFAudioDuckingMasterRangeData(
//                                CMTimeRange const&,
//                                std::vector<CMTime> const&,
//                                std::vector<double> const&)
//   @Flexo 0x000000000036d9e0  FFAudioDuckingMasterRangeData::loudnessLimit(CMTime, bool&) const
//
// STRUCT LAYOUT (recovered from the ctor's field writes @0x3788f0 and the accessor field reads
// in loudnessLimit @0x36d9e0). Total sizeof = 0x60 = 96 bytes.
//   +0x00 .. +0x2f  range        CMTimeRange   (48 bytes = 2 × CMTime).
//                                 Written as three movups xmm2/xmm1/xmm0 at
//                                   0x37890f (0x20), 0x378913 (0x10), 0x378917 (0x00) — the ctor
//                                 bulk-copies its `CMTimeRange const&` arg (rsi) directly.
//   +0x30 .. +0x47  times        std::__1::vector<CMTime>  (3 × ptr = 24 bytes: begin/end/cap)
//                                 Zero-initialized at 0x378922..0x378931; then the range-copy
//                                 loop @0x378931..0x37898d clones the caller vector via a single
//                                 __Znwm allocation of `end - begin` bytes and a _memcpy of the
//                                 same length. The end pointer is stored twice (@0x378971 and
//                                 @0x37898d) — the second store is after the memcpy completes
//                                 (standard libc++ __construct_at_end pattern).
//                                 Element size derived from `imull $0xaaaaaaab, %edx, ...`
//                                 (loudnessLimit @0x36dad8) applied to a byte-count `%rdx`
//                                 that was `sarq $0x3`-shifted — i.e. total_bytes / 24 gives
//                                 the number of elements. sizeof(CMTime) = 24.
//   +0x48 .. +0x5f  loudness     std::__1::vector<double>  (3 × ptr = 24 bytes: begin/end/cap)
//                                 Zero-initialized at 0x378991..0x378998; range-copy loop
//                                 @0x3789a0..0x3789dd is identical to the times[] loop except
//                                 the throw-length-error stub is the `vector<double>` one
//                                 (see 0x3789f7 → __ZNSt3__16vectorIdNS_9allocatorIdEEE20__throw_length_error…).
//
// The catch/unwind block at 0x3789fe..0x378a30 (reached only if __Znwm/memcpy for the doubles
// throws) frees the times[] allocation via `__ZdlPv` and rethrows — pure exception-safety
// bookkeeping that JS doesn't need (JS arrays own their own storage), so we drop it and rely
// on GC. Documented for completeness.
//
// loudnessLimit ALGORITHM (from 0x36d9e0..0x36dcfd):
//   Given a query time `queryTime` and an out-param `outHardLimit`, the routine:
//     (1) Sets *outHardLimit = false eagerly (0x36d9f1: `movb $0, (%rsi)`).
//     (2) Loads xmm2 with a default return value of FLT_MAX = 3.4028234663852886e+38 (@0x36d9fc
//         reading the 8-byte double at __TEXT __const 0x156f348). If times[] is empty
//         (begin == end at 0x36da04..0x36da07: `cmpq %rbx, %r12; je 0x36dcea`), returns FLT_MAX
//         with outHardLimit=false.
//     (3) Runs a std::lower_bound over times[] using CMTimeCompare (0x36da79) — the classic
//         libc++ half-open binary search: while len>0, pivot = base+len/2; compare *pivot vs
//         query; if pivot<query, base = pivot+1 and len -= len/2+1; else len = len/2. Uses the
//         idiom `cmovnsq` @0x36da8e/0x36da92 to pick the branch without a real jump. On exit
//         r12 = pointer to first element `>= query` (i.e. one-past-end if all are less).
//     (4) Converts the query CMTime to seconds via _CMTimeGetSeconds (@0x36dab1). We save the
//         Float64 to -0x60(%rbp) — call it `qSec`.
//     (5) Computes `i = (r12 - times.begin) / 24` (byte-diff, sar-3, magic-imul by
//         0xAAAAAAAB — the well-known "unsigned divide by 3" trick after already dividing
//         by 8). This i is the lower_bound index in [0, size].
//         Three cases:
//           (a) i == 0     (query strictly before times[0]): i_lo := -1, i_hi := 0, no t_lo.
//                          Enters right-only path @0x36db0b.
//           (b) i == size  (query at or past last time):     i_lo := size-1, i_hi := -1.
//                          Enters left-only path @0x36db24.
//           (c) otherwise (middle, 0 < i < size):           i_lo := i-1, i_hi := i.
//                          Enters both-sides path @0x36db46.
//     (6) In every case, computes t_lo=seconds(times[i_lo]) (if i_lo≥0) and/or
//         t_hi=seconds(times[i_hi]) (if i_hi≥0) via _CMTimeGetSeconds (@0x36db8f, @0x36dc01).
//     (7) SNAP-TO-KEYFRAME test: for each valid endpoint, tests |t_endpoint - qSec| against a
//         literal 0.1 (loaded from __const 0x156cbf8; see xmm compares @0x36dc2e, 0x36dc67,
//         0x36dc2e). If ANY endpoint is within 0.1s, sets *outHardLimit = true (@0x36dc6f,
//         @0x36dcd4). The absolute value uses `andpd 0x7FFFFFFFFFFFFFFF` (__const 0x156ca90;
//         mask literal is a 128-bit repeat of 0x7FFFFFFFFFFFFFFF).
//     (8) The returned loudness value depends on which endpoints qualified:
//           * Neither within 0.1s → return FLT_MAX and set *outHardLimit=false (@0x36dce6).
//           * Both within 0.1s (only possible in the middle-case) → LINEAR-INTERPOLATE:
//               result = loudness[i_lo] + (loudness[i_hi]-loudness[i_lo])
//                                        * (qSec - t_lo) / (t_hi - t_lo)
//             This is the snap path @0x36dc75..0x36dca8: divsd/mulsd/addsd sequence, with
//             loudness base = *(this + 0x48) = loudness.begin.
//           * Only i_hi within 0.1s → return loudness[i_hi] (@0x36dc84..0x36dca8 with r12<0).
//           * Only i_lo within 0.1s → return loudness[i_lo] (@0x36dcd8).
//
// CITED CONSTANTS (all @__TEXT __const in Flexo x86_64 slice; VA == file offset here since
// __const's `addr` 0x156c9c0 equals its `offset` 22464960):
//   0x156f348  double  3.4028234663852886e+38   = FLT_MAX  (sentinel "no snap" return)
//   0x156f350  double -40.0                     (loaded but not used on any path we return —
//                                                  historically the ducking floor; kept here
//                                                  because @0x36daed loads it into xmm2 in the
//                                                  i==size branch before being overwritten by
//                                                  FLT_MAX at 0x36dcca along the taken-hardLimit
//                                                  branch or by loudness[i] on the snap. If a
//                                                  reader ever finds a code path that keeps this
//                                                  in xmm2 through to retq, that path returns
//                                                  -40 dB; none exists in this build.)
//   0x156ca90  16 bytes  0x7FFFFFFFFFFFFFFF ×2   (double-precision abs-value mask, 128-bit)
//   0x156cbf8  double  0.1                       (snap tolerance in SECONDS — the CMTime-diff
//                                                 window inside which we round to a keyframe)
//
// FRONTIER: none — this class is self-contained given CMTime.ts (CMTimeCompare, CMTimeGetSeconds).
// The vector<CMTime>/vector<double> semantics collapse to native JS arrays; no other FCP callee
// is invoked.

import type { CMTime } from "../infra/CMTime";
import { CMTimeCompare, CMTimeGetSeconds } from "../infra/CMTime";

// CMTimeRange has no dedicated port yet in raw-port/src (PCTimeRange is a different ProCore type).
// We use a minimal in-file shape matching the CoreMedia public struct: { start, duration }.
// The ctor merely bulk-copies its arg into this->range via three movups (48 bytes total), so any
// { start:CMTime; duration:CMTime } literal transfers faithfully.
export interface CMTimeRange {
  start: CMTime;
  duration: CMTime;
}

// FLT_MAX as a double literal, byte-for-byte @Flexo 0x156f348 (u64 0x47EFFFFFE0000000).
// Loaded at 0x36d9fc, 0x36db34, 0x36dc36, 0x36dc45, 0x36dcca.
const FLT_MAX_AS_DOUBLE = 3.4028234663852886e+38;

// Snap tolerance in seconds, literal @Flexo 0x156cbf8 (u64 0x3FB999999999999A).
// Used by ucomisd @0x36dc2e, 0x36dc67, 0x36dcc2. NOTE: the on-disk bytes are the double 0.1
// (which is not exactly 0.1 — it's 0x3FB999999999999A). We reproduce the SAME bit pattern by
// using the JS literal `0.1`, which the IEEE-754 spec pins to that exact bit pattern.
const SNAP_TOLERANCE_SECONDS = 0.1;

/**
 * FFAudioDuckingMasterRangeData
 *
 * @Flexo 0x00000000003788f0  ctor  (CMTimeRange const&, vector<CMTime> const&, vector<double> const&)
 * @Flexo 0x000000000036d9e0  loudnessLimit(CMTime, bool&) const
 *
 * Faithful field layout (see file header for provenance):
 *   +0x00 range: CMTimeRange
 *   +0x30 times: CMTime[]
 *   +0x48 loudness: number[]
 *
 * Invariants observed by the native code (NOT enforced here — the ctor never checks them, so
 * this port doesn't either):
 *   - times.length == loudness.length     (accessed in lockstep in loudnessLimit)
 *   - times is sorted ascending in CMTimeCompare order (required by the lower_bound at 0x36da30)
 * A caller passing violation input would exhibit UB in the native code and this port faithfully
 * reproduces that shape (no throw, no reorder).
 */
export class FFAudioDuckingMasterRangeData {
  readonly range: CMTimeRange;
  readonly times: CMTime[];
  readonly loudness: number[];

  /**
   * ctor @Flexo 0x00000000003788f0
   * Byte-for-byte:
   *   0x378904..0x378917  bulk-copy `range` (3 × movups, 48 bytes) into this[+0x00..+0x2f].
   *   0x37891a..0x378931  zero-init this->times (3 pointers @+0x30/+0x38/+0x40).
   *   0x378931..0x37898d  if `times_arg.end - times_arg.begin != 0`:
   *                          __Znwm(bytes)  → this[+0x30] = this[+0x38] = ptr
   *                          this[+0x40] = ptr + bytes
   *                          _memcpy(ptr, times_arg.begin, bytes)
   *                          this[+0x38] = ptr + bytes  (finalize end after copy)
   *                       else: leave zero (empty vector).
   *   0x378991..0x378998  zero-init this->loudness (3 pointers @+0x48/+0x50/+0x58).
   *   0x3789a0..0x3789dd  identical loop for `loudness_arg`, calling the vector<double>
   *                       __throw_length_error if size is negative (impossible here).
   * The catch/unwind block (0x3789fe..0x378a30) frees the times[] alloc on double-alloc failure
   * and rethrows via __Unwind_Resume — JS exception unwind handles this automatically.
   *
   * We deep-copy the caller's arrays (matching the native vector-copy semantics: distinct
   * storage, so subsequent mutations of the caller's array do not affect us). CMTime is a
   * struct-by-value in C++; we shallow-copy each element (its own fields are primitives —
   * BigInt value + numeric timescale/flags/epoch — so shallow copy of the object literal is
   * a faithful "copy of a POD").
   */
  constructor(range: CMTimeRange, times: readonly CMTime[], loudness: readonly number[]) {
    // 0x378904..0x378917: copy the CMTimeRange by value. Shallow-clone start/duration so the
    // caller can freely mutate their local variable without affecting us.
    this.range = { start: { ...range.start }, duration: { ...range.duration } };
    // 0x378931..0x37898d: copy times by value.
    this.times = times.map((t) => ({ ...t }));
    // 0x3789a0..0x3789dd: copy loudness by value (doubles are primitives in JS).
    this.loudness = loudness.slice();
  }

  /**
   * loudnessLimit(query, outHardLimit) — @Flexo 0x000000000036d9e0
   *
   * Returns the piecewise-linear-interpolated loudness at `query`, snapping to a keyframe when
   * `query` is within 0.1s of one. `outHardLimit` (native: bool&) is set to true iff the return
   * value is a real keyframe reading (either a direct snap or a linear-interp between two
   * within-tolerance keyframes); it's set to false when the return is the FLT_MAX sentinel.
   *
   * The native prototype takes `CMTime` BY VALUE and `bool&` by reference. We faithfully mirror
   * that: `query` is passed as an object (in native code it's a 24-byte struct on the stack that
   * is copied into a temp, then copied AGAIN to the CMTimeCompare/GetSeconds args — see the
   * movups pairs at 0x36da49/0x36da4d/0x36da5f/0x36da63 and 0x36dc06/etc.). We take the object
   * reference; since we only READ from `query` this is equivalent.
   *
   * outHardLimit is modeled as a { value: boolean } cell — the caller passes an object whose
   * `.value` field we assign to (this matches the "&" reference semantics with mutation).
   */
  loudnessLimit(query: CMTime, outHardLimit: { value: boolean }): number {
    // 0x36d9f1: *outHardLimit = false (eager clear).
    outHardLimit.value = false;

    const times = this.times;
    const loudness = this.loudness;
    const size = times.length;

    // 0x36d9fc: xmm2 = FLT_MAX (default return). 0x36da04..0x36da07: if times[] is empty, jump
    // to 0x36dcea returning xmm2 unchanged (outHardLimit remains false).
    if (size === 0) {
      return FLT_MAX_AS_DOUBLE;
    }

    // 0x36da30..0x36da9c: std::lower_bound(times, query) using CMTimeCompare.
    //   base = 0, len = size; while (len > 0) { half = len>>1; pivot = base + half;
    //     if CMTimeCompare(times[pivot], query) < 0 (i.e. pivot < query):
    //       base = pivot + 1;  len = len - half - 1;
    //     else:
    //       len = half;
    //   }
    // The `cmovnsq` idiom at 0x36da8e/0x36da92 picks the branch based on the SIGN of the compare
    // result: eax>=0 keeps the "left" branch (len := half via cmovnsq r13->rcx, base := r14 via
    // cmovnsq r14->r12), else "right".
    // On loop exit, `base` is the lower_bound index in [0, size].
    let base = 0;
    let len = size;
    while (len > 0) {
      const half = len >>> 1;
      const pivot = base + half;
      // 0x36da79: callq _CMTimeCompare(times[pivot], query). testl %eax,%eax; cmovns.
      if (CMTimeCompare(times[pivot], query) < 0) {
        base = pivot + 1;
        len = len - half - 1;
      } else {
        len = half;
      }
    }
    const i = base; // lower_bound index in [0, size]

    // 0x36dab1: qSec = CMTimeGetSeconds(query). Stashed to -0x60(%rbp) as xmm3-source later.
    const qSec = CMTimeGetSeconds(query);

    // Now determine i_lo, i_hi and whether each side is valid, per the branch analysis at
    // 0x36dacd (i==0) / 0x36dad3 (i==size) / else (middle).
    let iLo: number;
    let iHi: number;
    let haveLo: boolean;
    let haveHi: boolean;

    if (i === 0) {
      // 0x36db0b branch: r13=0, r12=-1, xmm1=0 (t_lo unset), xmm2=FLT_MAX.
      iLo = -1;
      iHi = 0;
      haveLo = false;
      haveHi = true;
    } else if (i === size) {
      // 0x36db24 branch: r12=size-1, r13=-1, xmm2=FLT_MAX. Note the ctor of this branch also
      // loads -40.0 into xmm2 @0x36daed but that gets overwritten by FLT_MAX @0x36dcca before
      // any return — see file header note on the unused -40 literal.
      iLo = size - 1;
      iHi = -1;
      haveLo = true;
      haveHi = false;
    } else {
      // 0x36dad8 branch: middle case. r13=i, r12=i-1.
      iLo = i - 1;
      iHi = i;
      haveLo = true;
      haveHi = true;
    }

    // 0x36db46..0x36db8f: if haveLo, t_lo = CMTimeGetSeconds(times[iLo]).
    // The native code reloads times.begin from `this` for a bounds check that's unreachable
    // given our loop above; we skip the reload since our `size` is fixed.
    const tLo = haveLo ? CMTimeGetSeconds(times[iLo]) : 0.0;

    // 0x36dbaf..0x36dc01: if haveHi, t_hi = CMTimeGetSeconds(times[iHi]).
    const tHi = haveHi ? CMTimeGetSeconds(times[iHi]) : 0.0;

    // Now decide the return, tracking outHardLimit and the snap index.
    // Mirrors 0x36dc06..0x36dcea. We compute two boolean predicates:
    //   loWithin = haveLo && |qSec - tLo| < 0.1
    //   hiWithin = haveHi && |qSec - tHi| < 0.1
    // The native code encodes these with andpd/ucomisd and inline branching; the semantics
    // are pure |a-b| < 0.1.
    //
    // Note (from 0x36dc6f, 0x36dcd4): outHardLimit is set to TRUE on the "hi within" path and
    // on the "lo-only within" path; if neither is within, it's stamped BACK to false at 0x36dce6.

    if (haveHi) {
      // The r15 flag at 0x36dc06 == haveLo. If haveLo, we ran the lo-within check @0x36dc0b..0x36dc43
      // which computed loWithin and stashed the "snap-to-lo index" into r12 (r12=iLo if within,
      // else r12=-1). Regardless, we always execute the hi-within check @0x36dc57.
      const loWithin = haveLo && Math.abs(qSec - tLo) < SNAP_TOLERANCE_SECONDS;
      const hiWithin = Math.abs(tHi - qSec) < SNAP_TOLERANCE_SECONDS;

      if (hiWithin) {
        // 0x36dc6f: *outHardLimit = true. Fall through to snap-path @0x36dc75.
        outHardLimit.value = true;
        // 0x36dc75..0x36dca8: base := loudness[iHi]; if loWithin (r12>=0) linear-interp else return base.
        const base_val = loudness[iHi];
        if (loWithin) {
          const lo_val = loudness[iLo];
          // slope = (loudness[iHi] - loudness[iLo]) / (t_hi - t_lo)
          // result = loudness[iLo] + slope * (qSec - t_lo)
          // Exactly reproduces subsd/divsd/subsd/mulsd/addsd @0x36dc8c..0x36dca0.
          const slope = (base_val - lo_val) / (tHi - tLo);
          return lo_val + slope * (qSec - tLo);
        }
        return base_val;
      } else {
        // 0x36dcaa: hi NOT within. If loWithin (r12>=0), take 0x36dcd8 path returning loudness[iLo]
        // with outHardLimit = true (the movb $1 @0x36dc6f already ran).
        if (loWithin) {
          outHardLimit.value = true;
          return loudness[iLo];
        }
        // 0x36dce6: neither within → *outHardLimit = false; return FLT_MAX (xmm2 unchanged).
        outHardLimit.value = false;
        return FLT_MAX_AS_DOUBLE;
      }
    } else {
      // haveHi == false → this is the i == size branch, entering 0x36dcb1.
      // haveLo must be true (size>=1). r13=-1, xmm1 was set from t_lo (`movapd xmm1, xmm0` @0x36db94).
      // At 0x36dcb1: xmm0 = qSec; xmm0 -= t_lo; abs; compare to 0.1; xmm2 = FLT_MAX.
      // If far: jae 0x36dce6 → hardLimit=false, return FLT_MAX.
      // Else: movb $1 → hardLimit=true, xmm2 = loudness[iLo=r12], return.
      // (r12 = size-1 = iLo here; we always have haveLo in this path per the ctor of this branch.)
      const loWithin = Math.abs(qSec - tLo) < SNAP_TOLERANCE_SECONDS;
      if (!loWithin) {
        outHardLimit.value = false;
        return FLT_MAX_AS_DOUBLE;
      }
      outHardLimit.value = true;
      return loudness[iLo];
    }
  }
}
