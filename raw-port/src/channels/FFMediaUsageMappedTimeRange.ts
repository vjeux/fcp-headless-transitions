// FFMediaUsageMappedTimeRange — Flexo ObjC value class holding a CMTimeRange
// plus a byte flag (reversedPolarity). Transcribed line-for-line from otool
// -tV output; every method cites its @0xADDR in Flexo/x86_64.
//
// Object layout (recovered from init's ivar stores + getters' loads):
//   +0x08  int8_t  reversedPolarity          (movb %bl, 0x8(%rax)   @0x7b26aa)
//   +0x0c  CMTime  timeRange.start           (movups %xmm0, 0xc(%rax) @0x7b26a6, 16 bytes)
//   +0x1c  ...     timeRange.start[8..15] + timeRange.duration[0..7] (movups %xmm1, 0x1c(%rax) @0x7b26a2)
//   +0x2c  ...     timeRange.duration[8..23]                          (movups %xmm2, 0x2c(%rax) @0x7b269e)
//   +0x3c  end (init wrote 48 bytes of CMTimeRange starting at +0xc)
//
// The 3-xmm store pattern is a memcpy of the 48-byte CMTimeRange struct-value
// argument (passed in xmms + stack per SysV) into 3 unaligned 16-byte slots
// contiguous at +0xc..+0x3c.
//
// @class Flexo FFMediaUsageMappedTimeRange

import type { CMTime } from "../infra/CMTime.js";

/** CoreMedia CMTimeRange — start + duration (48 bytes = 2 × 24-byte CMTime).
 *  Local re-declaration; matches the CMTime.h layout used across this port. */
export interface CMTimeRange {
  start: CMTime;
  duration: CMTime;
}

/**
 * The FCP-visible mapping struct for one media-usage entry: a CMTimeRange plus
 * a boolean-in-a-signed-byte "reversedPolarity" flag.
 * @class Flexo FFMediaUsageMappedTimeRange
 */
export class FFMediaUsageMappedTimeRange {
  // Ivars mirror the disasm layout above. Public so callers (getters) can be
  // written as one-line loads that echo the assembly, not through indirection.
  timeRange: CMTimeRange;
  reversedPolarity: number; // signed char at +0x8 (0 or 1 in practice)

  private constructor(timeRange: CMTimeRange, reversedPolarity: number) {
    this.timeRange = timeRange;
    this.reversedPolarity = reversedPolarity;
  }

  /**
   * -[FFMediaUsageMappedTimeRange initWithTimeRange:reversedPolarity:]
   *
   * Instruction structure (@0x7b2660):
   *   super init;
   *   if (self != nil) {
   *     memcpy(self + 0x0c, &timeRange, 48);   // 3× movups xmm0/xmm1/xmm2
   *     *(int8_t*)(self + 0x08) = reversedPolarity;
   *   }
   *   return self;
   *
   * @Flexo 0x7b2660
   */
  static initWithTimeRange_reversedPolarity(
    timeRange: CMTimeRange,
    reversedPolarity: number,
  ): FFMediaUsageMappedTimeRange {
    // `super init` (@0x7b2685) is NSObject's no-op init in this class chain —
    // if it returned nil the disasm skips the stores and returns nil
    // (@0x7b268d je). In TS we always return a live instance; nil-return
    // semantics are not exercised by any caller in the ported subset. The one
    // caller (+mappedTimeRangeWithTimeRange:reversedPolarity:) forwards the
    // same arguments and immediately autoreleases the result.
    //
    // memcpy of the 48-byte CMTimeRange struct (@0x7b2693..@0x7b26a6). We
    // model it as an assignment; the storage slot is +0x0c..+0x3c.
    //
    // int8 write at +0x8 (@0x7b26aa: movb %bl, 0x8(%rax)).
    return new FFMediaUsageMappedTimeRange(timeRange, reversedPolarity);
  }

  /**
   * +[FFMediaUsageMappedTimeRange mappedTimeRangeWithTimeRange:reversedPolarity:]
   *
   * @0x7b26c0: `return [[[self alloc] initWithTimeRange:reversedPolarity:]
   *                       autorelease];`
   * The 3-xmm forward at @0x7b26df..@0x7b26f5 copies the 48-byte CMTimeRange
   * argument stack slot into the outbound init call's stack slot; in TS this
   * is just pass-by-reference.
   *
   * @Flexo 0x7b26c0
   */
  static mappedTimeRangeWithTimeRange_reversedPolarity(
    timeRange: CMTimeRange,
    reversedPolarity: number,
  ): FFMediaUsageMappedTimeRange {
    return FFMediaUsageMappedTimeRange.initWithTimeRange_reversedPolarity(
      timeRange,
      reversedPolarity,
    );
  }

  /**
   * -[FFMediaUsageMappedTimeRange timeRange]
   *
   * @0x7b2810: three unaligned 16-byte loads from +0xc/+0x1c/+0x2c into the
   * struct-return slot at (%rdi). i.e. `return *(CMTimeRange*)(self+0xc);`.
   *
   * @Flexo 0x7b2810
   */
  getTimeRange(): CMTimeRange {
    return this.timeRange;
  }

  /**
   * -[FFMediaUsageMappedTimeRange reversedPolarity]
   *
   * @0x7b2830: `movsbl 0x8(%rdi), %eax; ret` — sign-extend the byte at +0x8
   * into a 32-bit int and return it. In practice the field holds a boolean
   * (0 or 1) so the sign-extension is a no-op; we preserve the signed-char
   * semantics anyway (values >= 128 would come back negative).
   *
   * @Flexo 0x7b2830
   */
  getReversedPolarity(): number {
    // movsbl 0x8(%rdi), %eax  — signed 8-bit -> 32-bit sign-extend.
    // (b << 24) >> 24 replicates that in JS integer math.
    return (this.reversedPolarity << 24) >> 24;
  }

  /**
   * -[FFMediaUsageMappedTimeRange mappedTimeRangeByMappingTimeRange:fromTimeRange:reversePolarity:]
   *
   * Instruction structure (@0x7b2720):
   *   1. Load self->timeRange (48 bytes, +0xc..+0x3c) into the 1st stack arg
   *      slot at 0x60(%rsp)..0x8f(%rsp) via 3× movups (@0x7b2736..@0x7b276c).
   *   2. Load the `fromTimeRange:` arg (48 bytes at 0x40(%rbp)) into stack arg
   *      slot 0x30(%rsp)..0x5f(%rsp) (@0x7b276c..@0x7b2782).
   *   3. Load the `MappingTimeRange:` arg (48 bytes at 0x10(%rbp)) into stack
   *      arg slot 0(%rsp)..0x2f(%rsp) (@0x7b2787..@0x7b279d).
   *   4. leaq -0x80(%rbp), %rdi  (struct-return CMTimeRange buffer)
   *      xorl %esi, %esi         (signed char 4th arg = 0 — see NOTE)
   *      callq _mapTimeRange(CMTimeRange, CMTimeRange, CMTimeRange, signed char)
   *      // NOTE: the 4th (signed char) arg to _mapTimeRange is passed as 0,
   *      // NOT the caller's reversePolarity. The polarity handling happens
   *      // AFTER the mapping call (step 5). This is faithful to the disasm.
   *   5. reversedFlag = self->reversedPolarity;             (movzbl 0x8(%rbx), %eax)
   *      r15 = (reversedFlag == 0) ? 1 : 0;                  (xor+sete)
   *      if (reversePolarity_arg == 0) r15 = reversedFlag;   (testb %r14b; cmovel %eax, %r15d)
   *      // i.e. r15 = reversePolarity_arg ? !self->reversedPolarity : self->reversedPolarity
   *   6. return [[[FFMediaUsageMappedTimeRange class] alloc]
   *              initWithTimeRange:mappedRange
   *              reversedPolarity:(signed char)r15];
   *      (@0x7b27c3 opt_class, @0x7b27f0 init… message, tail-return.)
   *
   * @Flexo 0x7b2720
   */
  mappedTimeRangeByMappingTimeRange_fromTimeRange_reversePolarity(
    mappingTimeRange: CMTimeRange,
    fromTimeRange: CMTimeRange,
    reversePolarity: number,
  ): FFMediaUsageMappedTimeRange {
    // Step 1-4: forward to _mapTimeRange free function. Not yet transcribed
    // (600+ bytes of CMTime arithmetic + CMTimeCompare/CMTimeRangeGetEnd/
    // CMTimeMapTimeFromRangeToRange/CMTimeSubtract dispatch — see notes at
    // @Flexo 0x7b2060). ANTI-SHORTCUT: throw with the exact addr so
    // frontier.py can pick it up as an un-transcribed callee.
    const mapped = _mapTimeRange_stub(
      this.timeRange,
      fromTimeRange,
      mappingTimeRange,
      0, // 4th arg literally 0 in the disasm (@0x7b27a5: xorl %esi, %esi)
    );

    // Step 5: XOR-style polarity resolution.
    //   selfPol = self->reversedPolarity (int8 zero-extended to u8, @0x7b27ac movzbl)
    //   invPol  = (selfPol == 0) ? 1 : 0
    //   result  = reversePolarity_arg ? invPol : selfPol
    // i.e. XOR of the two booleans, when both are treated as 0/1.
    const selfPol = this.reversedPolarity & 0xff; // movzbl
    let r15 = selfPol === 0 ? 1 : 0; // xor r15,r15; test al,al; sete r15b
    if (!reversePolarity) {
      r15 = selfPol; // cmovel %eax, %r15d   (cmove when %r14b == 0)
    }
    // sign-extend the byte for the init call: movsbl %r15b, %edx (@0x7b27e9)
    const polByte = (r15 << 24) >> 24;

    // Step 6: alloc+init a fresh FFMediaUsageMappedTimeRange with the mapped
    // range and the resolved polarity. The disasm calls opt_class then sends
    // the init selector via ivar-slot 0x113aeca(%rip); the effective callee
    // is -[FFMediaUsageMappedTimeRange initWithTimeRange:reversedPolarity:]
    // (verified: the class ref is `self`'s class and the selector slot is the
    // one imported from __objc_selrefs).
    return FFMediaUsageMappedTimeRange.initWithTimeRange_reversedPolarity(
      mapped,
      polByte,
    );
  }
}

/**
 * _mapTimeRange(CMTimeRange, CMTimeRange, CMTimeRange, signed char)
 * — internal Flexo free function (mangled as __ZL13_mapTimeRange…) that
 * performs the actual range-into-range mapping. Approximately 600 bytes of
 * CMTime arithmetic dispatching to _CMTimeCompare, _CMTimeRangeGetEnd,
 * _CMTimeMapTimeFromRangeToRange, and _CMTimeSubtract. Not yet transcribed;
 * this stub throws so frontier.py can enumerate the un-decoded callee.
 *
 * @Flexo 0x7b2060  (__ZL13_mapTimeRange11CMTimeRangeS_S_a, file-local)
 */
function _mapTimeRange_stub(
  _selfRange: CMTimeRange,
  _fromRange: CMTimeRange,
  _mappingRange: CMTimeRange,
  _reversePolarityByte: number,
): CMTimeRange {
  throw new Error(
    "_mapTimeRange @Flexo 0x7b2060 not yet transcribed " +
      "(Flexo-internal CMTimeRange mapping helper).",
  );
}
