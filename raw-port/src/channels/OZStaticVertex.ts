// OZStaticVertex — ProChannel static (keyframe) spline vertex.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice). Disassembly sources:
//   raw-port/re/disasm/ProChannel.__ZN14OZStaticVertex6isFlatEv.s            (isFlat — ported here)
//   raw-port/re/disasm/ProChannel.__ZN14OZStaticVertex16getInputTangentsEPdS0_RK6CMTime.s
//   raw-port/re/disasm/ProChannel.__ZN14OZStaticVertex16setInputTangentsEddRK6CMTime.s
//   raw-port/re/disasm/ProChannel.__ZN14OZStaticVertex17getOutputTangentsEPdS0_RK6CMTime.s
//   raw-port/re/disasm/ProChannel.__ZN14OZStaticVertex17setOutputTangentsEddRK6CMTime.s
//   raw-port/re/disasm/ProChannel.__ZN14OZStaticVertex12swapTangentsEv.s
//                                     (the last five are read ONLY to pin the four tangent
//                                      offsets and their widths — each is its own ledger
//                                      entry and is NOT ported in this commit)
//
// This file ports ONLY the methods listed under "Symbols ported here" below. Every other
// OZStaticVertex method is a separate ledger entry and will be ADDED to this file (additive
// extension only — never a rewrite or a drop of a landed sibling) when it is claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only for the offsets the ported method touches)
// -----------------------------------------------------------------------------
// OZStaticVertex {
//   ...                       // +0x00..+0x47 not decoded by this unit. (+0x08 and +0x30 are
//                             // read by setInputTangents @0x40090/@0x40096 as a flag word and
//                             // a byte guard, and OZVertex — the 48-byte base modelled in
//                             // OZVertex.ts — accounts for +0x00..+0x2f; neither is touched by
//                             // isFlat, so neither is modelled here.)
//   double inputTangent0;     // +0x48 — 1st component of the INPUT tangent.
//                             //   getInputTangents  @0x40051 `movsd 0x48(%rdi), %xmm0` -> out param 1
//                             //   setInputTangents  @0x400a4 `movsd %xmm2, 0x48(%rdi)`, where xmm2 is
//                             //     `min(arg0, 0.0)` (xorpd+minsd @0x4009c/@0x400a0) — the input
//                             //     handle's 1st component is clamped to <= 0.
//   double outputTangent0;    // +0x50 — 1st component of the OUTPUT tangent.
//                             //   getOutputTangents @0x40073 `movsd 0x50(%rdi), %xmm0` -> out param 1
//                             //   setOutputTangents @0x400c8 `movsd %xmm2, 0x50(%rdi)`, xmm2 =
//                             //     `max(arg0, 0.0)` (xorpd+maxsd @0x400c0/@0x400c4) — clamped to >= 0.
//   double inputTangent1;     // +0x58 — 2nd component of the INPUT tangent.
//                             //   getInputTangents  @0x4005f `movsd 0x58(%rdi), %xmm0` -> out param 2
//                             //   setInputTangents  @0x400a9 `movsd %xmm1, 0x58(%rdi)` (unclamped)
//   double outputTangent1;    // +0x60 — 2nd component of the OUTPUT tangent.
//                             //   getOutputTangents @0x40081 `movsd 0x60(%rdi), %xmm0` -> out param 2
//                             //   setOutputTangents @0x400cd `movsd %xmm1, 0x60(%rdi)` (unclamped)
//   ...                       // >+0x68 not decoded by this unit
// }
//
// The four slots are confirmed contiguous and 8-byte by swapTangents @0x4018e, which moves them
// as two unaligned 16-byte pairs — `movups 0x48(%rdi), %xmm0` / `movups 0x58(%rdi), %xmm1` with
// `shufps $0x4e` (a 64-bit lane swap) — i.e. it exchanges (+0x48,+0x50) and (+0x58,+0x60), the
// input/output halves of each component. That is what pins the INTERLEAVED order recorded above
// (input0, output0, input1, output1) rather than the "in pair then out pair" one would guess.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   isFlat — none. No `callq` at any address in the body; it reads four doubles and two
//            __TEXT constants (the abs mask @0xb0390 and the epsilon @0xb03b0).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN14OZStaticVertex6isFlatEv
//       — OZStaticVertex::isFlat() @ProChannel 0x4012e
//
// -----------------------------------------------------------------------------
// FULL DISASM — isFlat @0x4012e (every instruction, in order)
// -----------------------------------------------------------------------------
//   0x4012e  pushq   %rbp                       ; frame prologue
//   0x4012f  movq    %rsp, %rbp
//   0x40132  movsd   0x48(%rdi), %xmm1          ; xmm1 = this->inputTangent0
//   0x40137  andpd   0x70251(%rip), %xmm1       ; xmm1 = fabs(xmm1)  [rip=0x4013f -> @0xb0390]
//   0x4013f  movsd   0x70269(%rip), %xmm0       ; xmm0 = 1e-07       [rip=0x40147 -> @0xb03b0]
//   0x40147  ucomisd %xmm1, %xmm0               ; flags on (xmm0 - xmm1) = (eps - |t|)
//   0x4014b  jbe     0x40189                    ; CF|ZF -> eps <= |t| (or UNORDERED) -> false tail
//   0x4014d  movsd   0x58(%rdi), %xmm1          ; xmm1 = this->inputTangent1
//   0x40152  andpd   0x70236(%rip), %xmm1       ; fabs                [rip=0x4015a -> @0xb0390]
//   0x4015a  ucomisd %xmm1, %xmm0
//   0x4015e  jbe     0x40189                    ; same test -> false tail
//   0x40160  movsd   0x50(%rdi), %xmm1          ; xmm1 = this->outputTangent0
//   0x40165  andpd   0x70223(%rip), %xmm1       ; fabs                [rip=0x4016d -> @0xb0390]
//   0x4016d  ucomisd %xmm1, %xmm0
//   0x40171  jbe     0x40189                    ; same test -> false tail
//   0x40173  movsd   0x60(%rdi), %xmm1          ; xmm1 = this->outputTangent1
//   0x40178  andpd   0x70210(%rip), %xmm1       ; fabs                [rip=0x40180 -> @0xb0390]
//   0x40180  ucomisd %xmm1, %xmm0
//   0x40184  seta    %al                        ; al = (CF=0 & ZF=0) = eps > |t|
//   0x40187  jmp     0x4018b
//   0x40189  xorl    %eax, %eax                 ; the false tail
//   0x4018b  popq    %rbp                       ; epilogue
//   0x4018c  retq
//   0x4018d  nop                                ; padding — not executed
//
// DECODE NOTES (AT&T; a compare computes `dst - src`, per PORTING_SPEC):
//  - `ucomisd %xmm1, %xmm0` has dst = xmm0 = the EPSILON, src = xmm1 = |tangent|. So `jbe`
//    (CF=1 or ZF=1) is taken iff `eps <= |t|`, and falling through means `|t| < eps`. Reading
//    the operands in Intel order would inverse the whole predicate.
//  - `seta` (CF=0 & ZF=0) on that same subtraction is `eps > |t|`, i.e. exactly the
//    fall-through condition of the three `jbe`s — so all four components use the SAME strict
//    `|t| < eps` test and the function is a plain 4-way AND.
//  - NaN: an unordered `ucomisd` sets CF=ZF=PF=1, so `jbe` IS taken and `seta` yields 0 — a NaN
//    component makes the result false. JS `<` on NaN is likewise false, so the plain comparison
//    reproduces it without a special case.
//  - The ORDER of the four tests is +0x48, +0x58, +0x50, +0x60 (input0, input1, output0,
//    output1) — not the memory order. It is preserved below. Nothing observable depends on it
//    (there are no side effects and no faulting loads), but it is what the machine does.
//
// -----------------------------------------------------------------------------
// CONSTANTS (read out of the x86_64 slice at the cited addresses)
// -----------------------------------------------------------------------------

/**
 * The absolute-value mask used by the four `andpd` at @ProChannel 0x40137 / 0x40152 / 0x40165 /
 * 0x40178, all four of which resolve to the same 16-byte constant at @ProChannel 0xb0390:
 * `ff ff ff ff ff ff ff 7f  ff ff ff ff ff ff ff 7f`, i.e. two lanes of 0x7fffffffffffffff.
 * ANDing a double with it clears only the sign bit, so it is `fabs` — modelled directly as
 * `Math.abs` below, which is the same operation on every input including -0.0 and NaN payloads
 * (the sign bit is the only bit that changes).
 */
// (No TS constant is emitted for the mask: clearing the sign bit IS `Math.abs`, so the mask is
// documentation of where that operation comes from, not a value the port computes with.)

/**
 * The flatness epsilon loaded by `movsd 0x70269(%rip), %xmm0` @ProChannel 0x4013f. The rip after
 * that 8-byte instruction is 0x40147, and 0x40147 + 0x70269 = @ProChannel 0xb03b0, whose 8 bytes
 * are `48 af bc 9a f2 d7 7a 3e` = 0x3e7ad7f29abcaf48 = 1e-07 exactly (the next quad-word at
 * 0xb03b8 is 0x400921fb54442d18 = pi, a neighbouring literal, not part of this one).
 */
const OZ_STATIC_VERTEX_FLAT_EPSILON = 1e-7; // @ProChannel 0xb03b0 (bits 0x3e7ad7f29abcaf48)

/**
 * `OZStaticVertex` — ProChannel static spline vertex. This file holds the methods listed under
 * "Symbols ported here" in the file header; every other method is a separate ledger entry.
 * Only the offsets the ported method touches are modelled (PORTING_SPEC Rule 5: no magic
 * offsets, and no invented fields either).
 */
export class OZStaticVertex {
  /** @ProChannel OZStaticVertex@0x48 — 1st component of the input tangent. Written by
   *  setInputTangents @0x400a4 as `min(arg, 0.0)`, read by getInputTangents @0x40051 and by
   *  isFlat @0x40132. Zero-initialised until a ctor is transcribed. */
  inputTangent0 = 0; // @ProChannel OZStaticVertex@0x48

  /** @ProChannel OZStaticVertex@0x50 — 1st component of the output tangent. Written by
   *  setOutputTangents @0x400c8 as `max(arg, 0.0)`, read by getOutputTangents @0x40073 and by
   *  isFlat @0x40160. Zero-initialised until a ctor is transcribed. */
  outputTangent0 = 0; // @ProChannel OZStaticVertex@0x50

  /** @ProChannel OZStaticVertex@0x58 — 2nd component of the input tangent. Written by
   *  setInputTangents @0x400a9 (unclamped), read by getInputTangents @0x4005f and by isFlat
   *  @0x4014d. Zero-initialised until a ctor is transcribed. */
  inputTangent1 = 0; // @ProChannel OZStaticVertex@0x58

  /** @ProChannel OZStaticVertex@0x60 — 2nd component of the output tangent. Written by
   *  setOutputTangents @0x400cd (unclamped), read by getOutputTangents @0x40081 and by isFlat
   *  @0x40173. Zero-initialised until a ctor is transcribed. */
  outputTangent1 = 0; // @ProChannel OZStaticVertex@0x60

  /**
   * `OZStaticVertex::isFlat()` -> `bool` @ProChannel 0x4012e
   *   (__ZN14OZStaticVertex6isFlatEv)
   *
   * Full transcription of the 24-instruction body (see the FULL DISASM block in the file
   * header for the line-by-line decode). Returns true iff all FOUR tangent components are
   * strictly within 1e-07 of zero in magnitude:
   *
   *     |inputTangent0| < eps && |inputTangent1| < eps &&
   *     |outputTangent0| < eps && |outputTangent1| < eps
   *
   * tested in that order (+0x48, +0x58, +0x50, +0x60). No callees, no writes, no allocation.
   * The comparison is STRICT and the epsilon is exclusive: a component of exactly 1e-07 makes
   * the answer false, because `jbe` covers the ZF=1 (equal) case.
   *
   * DIFFERENTIAL against the live binary (the symbol is exported — `nm -n -arch x86_64` reports
   * `000000000004012e T __ZN14OZStaticVertex6isFlatEv` — so dlsym reaches it; run under
   * `arch -x86_64 /usr/bin/python3` because every address cited here is an x86_64 offset and the
   * arm64 slice is a different function, per OPS_LOG):
   * raw-port/re/oracle/OZStaticVertex_isFlat_oracle.py calls the real method on a 0xEE-poisoned
   * 0x100-byte object with only the four tangent slots set, over the full cross-product of 15
   * boundary values per component — 0, -0, ±1e-9, ±9.9e-8, ±1e-7 (the exclusive boundary),
   * ±1.0000001e-7, ±1, NaN, ±Infinity — i.e. 15^4 = 50,625 cases: 50,625/50,625 agree with this
   * port, 1,296 TRUE / 49,329 FALSE, 0 divergences.
   *
   * The corpus is measured to be DISCRIMINATING rather than vacuous — four plausible mis-reads
   * of this same body are each rejected by it: `|t| <= eps` instead of `<` (reading `jbe` as
   * `jb`, i.e. losing the ZF=1 equal case) is wrong on 2,800 of those cases; treating a NaN
   * component as flat (forgetting that an unordered compare takes the `jbe`) is wrong on 1,105;
   * comparing the signed value instead of its magnitude (dropping the `andpd` @0xb0390) is
   * wrong on 8,704; and checking only the two input components is wrong on 6,804.
   *
   * @returns true when this vertex's tangents are all (numerically) zero-length.
   */
  isFlat(): boolean {
    // ------------------------------------------------------------
    // @0x4012e..0x4012f — prologue (no TS-visible effect).
    // @0x4013f — movsd the epsilon @0xb03b0 into xmm0; it is the left-hand (dst) operand of
    //   all four ucomisd, i.e. every test below is `eps - |t|`.
    // ------------------------------------------------------------
    const eps = OZ_STATIC_VERTEX_FLAT_EPSILON;

    // ------------------------------------------------------------
    // @0x40132/@0x40137/@0x40147/@0x4014b — |inputTangent0| vs eps; `jbe` to the false tail
    //   when eps <= |t| (or the compare is unordered, i.e. NaN). `Math.abs` is the `andpd`
    //   with the @0xb0390 sign mask; JS `<` is false for NaN, matching the unordered branch.
    // ------------------------------------------------------------
    if (!(Math.abs(this.inputTangent0) < eps)) return false; // @0x4014b jbe 0x40189

    // @0x4014d/@0x40152/@0x4015a/@0x4015e — same test on inputTangent1 (+0x58).
    if (!(Math.abs(this.inputTangent1) < eps)) return false; // @0x4015e jbe 0x40189

    // @0x40160/@0x40165/@0x4016d/@0x40171 — same test on outputTangent0 (+0x50).
    if (!(Math.abs(this.outputTangent0) < eps)) return false; // @0x40171 jbe 0x40189

    // ------------------------------------------------------------
    // @0x40173/@0x40178/@0x40180/@0x40184 — the last component is not branched on: `seta %al`
    //   materialises (CF=0 & ZF=0) = `eps > |t|` straight into the return value, which is the
    //   identical predicate the three `jbe`s fall through on.
    // @0x40187/@0x4018b..0x4018c — jmp to the shared epilogue + retq.
    // ------------------------------------------------------------
    return Math.abs(this.outputTangent1) < eps; // @0x40184 seta %al
  }
}
