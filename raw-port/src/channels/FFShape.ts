// FFShape.ts — raw transcription of Flexo `FFShape`.
//
// Flexo's shape object (the drawn mask/roto shape that OZShape rendering
// consumes; 31 symbols in the x86_64 slice). It supplies the intrinsic 2D
// transform components — position, pivot, scale, shear — that the shape render
// state queries.
//
// Provenance (Flexo framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file — ONE method:
//   @0x657d80  FFShape::getShear(double*, double*, OZShapeRenderState const&)
//                __ZN7FFShape8getShearEPdS0_RK18OZShapeRenderState
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym
//  __ZN7FFShape8getShearEPdS0_RK18OZShapeRenderState Flexo`):
//   raw-port/re/disasm/Flexo.__ZN7FFShape8getShearEPdS0_RK18OZShapeRenderState.s
//   (12 lines)
//
// Every other FFShape member is a SEPARATE ledger unit and is NOT ported here.
// Later units extend THIS file, ADD-only.
//
// ---------------------------------------------------------------------------
// WHY THE ZEROS ARE THE WHOLE ANSWER — the getScale contrast
// ---------------------------------------------------------------------------
// `getShear` is the immediate neighbour of
// `FFShape::getScale(double*, double*, OZShapeRenderState const&)` @0x657ce0,
// which has the SAME signature and answers the same kind of question. getScale
// was disassembled purely as corroboration (it is its own ledger unit and is
// NOT ported here) and it is a much bigger body:
//
//   0x657cf6  movabsq $0x3ff0000000000000, %rax   ; 1.0
//   0x657d00  movq    %rax, (%rsi)                ; *scaleX = 1.0  (the DEFAULT)
//   0x657d08  movq    %rax, (%rdx)                ; *scaleY = 1.0
//   0x657d0b  leaq    0x4d90(%rdi), %rax          ; &this->scaleXChannel
//   0x657d21  callq   OZChannel::getValueAsDouble(CMTime const&, double) const
//   0x657d29  movsd   %xmm0, (%r14)               ; *scaleX = channel value
//   ... same again for +0x4e28 (the scaleY channel)
//
// i.e. scale writes an identity default and then OVERWRITES it from two
// OZChannels. getShear does the first half and stops: it writes the identity
// default (0.0 — no shear) and never consults a channel, never touches `this`,
// and never reads the render state. So the zeros are not a placeholder or an
// unfinished path — "no shear" is this implementation's complete answer, and
// the absence of the channel lookup is the very thing that distinguishes it
// from its neighbour.
//
// CALLEES: none. No in-scope call, no extern, no virtual and no indirect
// dispatch (`depgraph.py deps` lists nothing for this symbol) — in pointed
// contrast to getScale's two OZChannel calls.

import type { OZShapeRenderState } from "./OZShapeRenderState";

/**
 * `FFShape` — Flexo's shape object.
 *
 * No fields are declared yet: the one method ported here never reads `this`
 * (%rdi is untouched by the whole body). Units that port members which DO
 * touch the object — e.g. getScale @0x657ce0, whose channels live at +0x4d90
 * and +0x4e28 — will add the layout, ADD-only.
 *
 * @Flexo 0x657d80
 */
export class FFShape {
  /**
   * `FFShape::getShear(double* shearX, double* shearY, OZShapeRenderState const& state)`
   * @Flexo 0x657d80
   * (__ZN7FFShape8getShearEPdS0_RK18OZShapeRenderState).
   *
   * Faithful transcription of the 12-line body, quoted in full:
   *
   *   0x657d80  pushq %rbp                ; frame prologue
   *   0x657d81  movq  %rsp, %rbp
   *   0x657d84  testq %rsi, %rsi          ; shearX == nullptr?
   *   0x657d87  je    0x657d90            ;   yes -> skip the store
   *   0x657d89  movq  $0x0, (%rsi)        ; *shearX = 0.0   (8-byte store of
   *                                       ;   the bit pattern
   *                                       ;   0x0000000000000000 = +0.0)
   *   0x657d90  testq %rdx, %rdx          ; shearY == nullptr?
   *   0x657d93  je    0x657d9c            ;   yes -> skip the store
   *   0x657d95  movq  $0x0, (%rdx)        ; *shearY = 0.0
   *   0x657d9c  popq  %rbp                ; frame epilogue
   *   0x657d9d  retq
   *   0x657d9e  nop                       ; padding — not executed
   *
   * SEMANTICS: write 0.0 through each out-pointer that is non-null. The two
   * null checks are INDEPENDENT — a null `shearX` does not skip the `shearY`
   * store (the `je` at @0x657d87 lands on the second `testq`, not on the
   * return), so the port keeps them as two separate guards rather than one.
   *
   * `this` (%rdi) is never read, and `state` (%rcx, `OZShapeRenderState const&`)
   * is never dereferenced — it is accepted and ignored. No return value is
   * produced: there is no `xor %eax, %eax` and no other write to %eax, which is
   * what a `void` function looks like (contrast the null-implementation bodies
   * in FFOZNullCurve.m*.ts, which DO zero %eax).
   *
   * NUMERICS: `movq $0x0` stores the all-zero doubleword, which as an IEEE-754
   * f64 is POSITIVE zero. JS `0` is the same value and the same bit pattern, so
   * no sign-of-zero care is needed (a `-0` would have been `0x8000000000000000`
   * and would have needed a `movabsq`, as the neighbouring 1.0 does).
   *
   * DEPENDENCIES: none in-scope; no extern.
   */
  getShear(
    shearX: { value: number } | null,
    shearY: { value: number } | null,
    _state: OZShapeRenderState /* never dereferenced */,
  ): void {
    // @0x657d84..@0x657d87  testq %rsi, %rsi ; je 0x657d90
    if (shearX !== null) {
      // @0x657d89  movq $0x0, (%rsi)
      shearX.value = 0;
    }

    // @0x657d90..@0x657d93  testq %rdx, %rdx ; je 0x657d9c
    // Reached whether or not the first store happened.
    if (shearY !== null) {
      // @0x657d95  movq $0x0, (%rdx)
      shearY.value = 0;
    }

    // @0x657d9c..@0x657d9d  popq %rbp ; retq — no value returned.
  }
}
