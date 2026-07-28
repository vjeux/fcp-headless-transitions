// PCToneMapMethod — small POD describing a tone-map operator (type + gain).
// Framework: ProCore
//
// Provenance (raw-port/re/disasm/ProCore.PCToneMapMethod.*.s):
//   PCToneMapMethod::PCToneMapMethod()  (C2)  @0x0006bc7c  (base ctor — ICF-folded with C1; same demangled name)
//   PCToneMapMethod::PCToneMapMethod()  (C1)  @0x0006bc9c  (__ZN15PCToneMapMethodC1Ev)
//   PCToneMapMethod::getType()  const         @0x0006bcbc  (__ZNK15PCToneMapMethod7getTypeEv)
//   PCToneMapMethod::getGain()  const         @0x0006bcc4  (__ZNK15PCToneMapMethod7getGainEv)
//
// Callees / vtable refs:
//   PCColorUtil::getWhiteGainForHLG_75()  @ProCore 0x4657   (imported from ../render/PCColorUtil)
//     -> returns a single f32 in xmm0 (currently a THROWing stub — see PCColorUtil.ts).
//
// STRUCT LAYOUT (recovered from the three methods):
//   +0x00  int32   type        (getType returns this; ctor stores 5)
//   +0x04  float32 gain        (getGain returns this; ctor stores PCColorUtil::getWhiteGainForHLG_75())
//   size >= 8 bytes; nothing else is touched by any method in this port unit.
//
// The struct is a plain-old-data value object: no vtable, no owned pointers,
// no destructor (there is no D0/D2 symbol in the class brief).

import { PCColorUtil } from '../render/PCColorUtil';

/**
 * PCToneMapMethod — a tone-map operator identifier plus its associated
 * highlight-gain scalar. Concretely a `{ type: int32, gain: float32 }` pair.
 *
 * The default constructor initializes to type=5 (HLG-75 tone map — inferred
 * from the callee's name; do not over-claim beyond that) and gain =
 * `PCColorUtil::getWhiteGainForHLG_75()`.
 */
export class PCToneMapMethod {
  /** int32 tone-map type tag at struct offset +0x00. */
  type: number;

  /** float32 highlight gain at struct offset +0x04 (single precision). */
  gain: number;

  /**
   * PCToneMapMethod::PCToneMapMethod() — default ctor.
   *
   * Provenance:
   *   C1 @0x0006bc9c (__ZN15PCToneMapMethodC1Ev)
   *   C2 @0x0006bc7c (base ctor; ICF-folded with C1 — same symbol name)
   *
   * Verbatim body (C1):
   *
   *   0x6bc9c  pushq  %rbp
   *   0x6bc9d  movq   %rsp, %rbp
   *   0x6bca0  pushq  %rbx
   *   0x6bca1  pushq  %rax                     // 16-byte stack align
   *   0x6bca2  movq   %rdi, %rbx               // rbx = this
   *   0x6bca5  callq  PCColorUtil::getWhiteGainForHLG_75()   ; returns f32 in xmm0
   *   0x6bcaa  movl   $0x5, (%rbx)             // this->type = 5
   *   0x6bcb0  movss  %xmm0, 0x4(%rbx)         // this->gain = xmm0 (f32)
   *   0x6bcb5  addq   $0x8, %rsp
   *   0x6bcb9  popq   %rbx
   *   0x6bcba  popq   %rbp
   *   0x6bcbb  retq
   *
   * Because `getWhiteGainForHLG_75` currently throws (see PCColorUtil.ts —
   * the underlying memoized free-fn @0x4550 is not yet decoded), constructing
   * a PCToneMapMethod at runtime will surface that throw. That mirrors the
   * "un-decoded callee" demand signal — do not fabricate the gain value.
   */
  constructor() {
    // NB: the C++ compiler emits the callee ONCE, and its f32 return goes to
    // both `xmm0` and then straight into `this->gain`. If the callee throws
    // in TS, `this->type` is never written — matching the FCP behavior where
    // the whole ctor is a linear sequence with no partial-write recovery.
    this.gain = Math.fround(PCColorUtil.getWhiteGainForHLG_75());
    this.type = 5 | 0;
  }

  /**
   * PCToneMapMethod::getType() const @0x0006bcbc.
   *
   *   0x6bcbc  pushq  %rbp
   *   0x6bcbd  movq   %rsp, %rbp
   *   0x6bcc0  movl   (%rdi), %eax            // return *(int32*)this
   *   0x6bcc2  popq   %rbp
   *   0x6bcc3  retq
   *
   * Reads the int32 at struct-offset +0x00 and returns it.
   */
  getType(): number {
    // movl (%rdi), %eax — the int32 at +0x00.
    return this.type | 0;
  }

  /**
   * PCToneMapMethod::getGain() const @0x0006bcc4.
   *
   *   0x6bcc4  pushq  %rbp
   *   0x6bcc5  movq   %rsp, %rbp
   *   0x6bcc8  movss  0x4(%rdi), %xmm0        // return *(float32*)(this+4)
   *   0x6bccd  popq   %rbp
   *   0x6bcce  retq
   *
   * Reads the f32 at struct-offset +0x04 and returns it in xmm0. `movss` is
   * single-precision, so we round-trip through `Math.fround` to match FCP
   * bit-exactly (the stored value came from a single `movss %xmm0,0x4(%rbx)`
   * in the ctor, so it is already f32-quantized on-heap; the Math.fround here
   * is defense against any TS caller that assigned a non-f32 value to `gain`
   * directly).
   */
  getGain(): number {
    // movss 0x4(%rdi), %xmm0 — the f32 at +0x04.
    return Math.fround(this.gain);
  }
}
