// OZMoShape — Ozone motion-shape node. This commit ports its shape-kernel → Li-kernel mapping.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//            (x86_64 slice — every address below is an x86_64 offset)
// DECODE:    raw-port/re/disasm/__ZN9OZMoShape21shapeKernelToLiKernelEN18OZShapeEdgeTexture6KernelE.s
//
// This file ports ONLY the symbol listed below; every other OZMoShape method is its own ledger
// entry and will be ADDED here (additive extension only) when claimed.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN9OZMoShape21shapeKernelToLiKernelEN18OZShapeEdgeTexture6KernelE
//       — OZMoShape::shapeKernelToLiKernel(OZShapeEdgeTexture::Kernel) @Ozone 0x5096c0
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   none. Five instructions, no callq, no memory operand at all — not even `this`.
//
// -----------------------------------------------------------------------------
// FULL DISASM — shapeKernelToLiKernel @0x5096c0 (every instruction, in order)
// -----------------------------------------------------------------------------
//   0x5096c0  pushq  %rbp                     ; frame prologue
//   0x5096c1  movq   %rsp, %rbp
//   0x5096c4  leal   -0x1(%rsi), %ecx         ; ecx = kernel - 1   (32-bit, wraps)
//   0x5096c7  xorl   %eax, %eax               ; the default answer is 0
//   0x5096c9  cmpl   $0x6, %ecx               ; flags on (ecx - 6)
//   0x5096cc  cmovbl %esi, %eax               ; CF=1, i.e. UNSIGNED ecx < 6 -> eax = kernel
//   0x5096cf  popq   %rbp                     ; epilogue
//   0x5096d0  retq
//   0x5096d1  nopw   %cs:(%rax,%rax)          ; padding — not executed
//
// DECODE NOTES
//  - `leal -0x1(%rsi), %ecx` + `cmpl $0x6` + `cmovb` is the classic UNSIGNED range idiom: the
//    condition is `(kernel - 1) <u 6`, i.e. kernel ∈ {1,2,3,4,5,6}. Because the subtraction wraps
//    in 32 bits, kernel = 0 becomes 0xffffffff and FAILS the test — a signed reading (`cmovl`)
//    would have let 0 through, and the oracle below measures exactly that difference.
//  - `cmov`, not a branch: both the 0 and the pass-through are computed unconditionally, so there
//    is no control flow to mirror — the ternary below is the whole function.
//  - The identity mapping is not a no-op wrapper: the point of the function is the CLAMP. In
//    range, the shape kernel's numeric value IS the Li kernel's; out of range it collapses to 0.
//  - `this` (%rdi) is never touched. The method is non-static in the mangling but reads nothing
//    from the object — measured by passing poison.
//  - No enumerator is named by any decoded instruction, so both the parameter and the result are
//    opaque u32 aliases (PORTING_SPEC Rule 5 — no invented constants).

/**
 * `OZShapeEdgeTexture::Kernel` — the shape edge-texture kernel tag. No decoded instruction names
 * an enumerator; all this function establishes is that the valid tags are exactly 1..6 and that
 * everything else maps to 0. Modelled as an opaque u32 alias until a ctor or a comparison site
 * reveals the names (the same treatment the landed HGRenderJob* enum aliases get).
 */
export type OZShapeEdgeTextureKernel = number;

/**
 * The Li-kernel tag this function returns. Numerically identical to the shape kernel for the six
 * valid tags, and 0 otherwise; it is a distinct alias because the two are distinct C++ types at
 * the call site (the return type is not `OZShapeEdgeTexture::Kernel`).
 */
export type OZLiKernel = number;

/**
 * `OZMoShape` — Ozone motion-shape node. This file holds the symbol listed under "Symbols ported
 * here" in the file header; every other method is a separate ledger entry. NO fields are modelled:
 * the ported body never dereferences `this`, and inventing a layout for it would be exactly the
 * magic-offset guesswork PORTING_SPEC Rule 5 forbids.
 */
export class OZMoShape {
  /**
   * `OZMoShape::shapeKernelToLiKernel(OZShapeEdgeTexture::Kernel)` @Ozone 0x5096c0
   *   (__ZN9OZMoShape21shapeKernelToLiKernelEN18OZShapeEdgeTexture6KernelE)
   *
   * Full transcription of the 6-instruction body (see the FULL DISASM block in the file header):
   * pass the tag through when it is in 1..6, else 0. The range test is UNSIGNED on `kernel - 1`,
   * so 0 and everything above 6 — including every value with the high bit set — answer 0.
   *
   * DIFFERENTIAL against the live binary (exported: `00000000005096c0 T` in
   * raw-port/army/inventory/Ozone.syms.txt, so dlsym reaches it once Ozone's `@rpath` chain is
   * preloaded depth-first; run under `arch -x86_64 /usr/bin/python3` because every address cited
   * here is an x86_64 offset and the arm64 slice is a different function, per OPS_LOG):
   * raw-port/re/oracle/OZMoShape_shapeKernelToLiKernel_oracle.py sweeps every value 0..1023 plus
   * the 32-bit extremes and seeded-random u32s, with `this` passed as poison. See the commit
   * message for the recorded run and for the two negative controls that make the corpus
   * discriminating (a SIGNED range test, and an off-by-one that admits 7).
   *
   * @param kernel the shape edge-texture kernel tag (SysV %esi).
   * @returns the Li kernel tag, or 0 when `kernel` is out of range.
   */
  shapeKernelToLiKernel(kernel: OZShapeEdgeTextureKernel): OZLiKernel {
    // ------------------------------------------------------------
    // @0x5096c4 — leal -0x1(%rsi), %ecx : the 32-bit, WRAPPING `kernel - 1`. `>>> 0` after the
    //   subtraction is that wrap, which is what makes kernel = 0 fail the test below instead of
    //   passing it as -1.
    // @0x5096c7/@0x5096c9/@0x5096cc — xorl ; cmpl $6 ; cmovb : unsigned `(kernel-1) < 6`.
    // ------------------------------------------------------------
    const k = kernel >>> 0;
    return (((k - 1) >>> 0) < 6 ? k : 0) >>> 0;
  }
}
