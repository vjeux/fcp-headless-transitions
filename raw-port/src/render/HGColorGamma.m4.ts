// raw-port: HGColorGamma (chunk m4) — Helium.framework (render layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium (x86_64 thin at /tmp/Helium.x86_64; VAs are ABSOLUTE within the x86_64
//   slice, which starts at fat offset 0x4000 in the on-disk fat binary).
// This chunk closes out the 84-method HGColorGamma class with the final 4 methods:
//   80 SetGammaFunctionSRGBLinearize()   @0x00000000000fcc90
//   81 SetGammaFunctionSRGBGamma()       @0x00000000000fcd20
//   82 TestConversion(colorPrim,transferFn,matrixCoeffs, colorPrim,transferFn,matrixCoeffs)
//                                        @0x00000000000fcdb0
//   83 ScaleParams(HGNode*, HGRenderer*) (.cold.1)   @0x00000000003c3530
//
// DECODE: raw-port/re/disasm/Helium.HGColorGamma.<method>.s (one .s per method).
//
// FIELD LAYOUT — every field this chunk writes is already declared upstream:
//   +0x2e9  dirtyFlag              (m2)
//   +0x300..+0x360  transformBlock[0..6]   (m2/m3)
//   +0x370  transformBlock_isFixed  (m3)
//   +0x404  gammaForm               (m3)
// No new fields introduced here.
//
// ── Rodata constants decoded for the SRGB gamma variants ────────────────────────────
// SetGammaFunctionSRGBLinearize reads five aligned f32x4 vectors at consecutive rodata
// addresses (each xmm0 movaps loads 16 bytes; lane 0..2 carry the parameter, lane 3 is
// [1.0] for block[0] and [0.0] for the rest — the same tri-splat + terminator pattern
// used by SetGammaFunction(LogCurve)'s "identity col0 then zero" scheme).
//
//   VA 0x3cfa30  f32x4 = [ 2.4, 2.4, 2.4, 1.0 ]                     (transferBlock[0])
//   VA 0x3cfa40  f32x4 = [ 0.9478672742843628, ×3, 0.0 ]            (transferBlock[1])
//   VA 0x3cfa50  f32x4 = [ 0.05213269963860512, ×3, 0.0 ]           (transferBlock[2])
//   VA 0x3cfa60  f32x4 = [ 0.07739938050508499, ×3, 0.0 ]           (transferBlock[3])
//   VA 0x3cfa70  f32x4 = [ 0.040449999272823334, ×3, 0.0 ]          (transferBlock[4])
//
// These are the standard sRGB EOTF (linearize) parameters:
//   0.9478672742843628 = 1/1.055 ; 0.05213269963860512 = 0.055/1.055 ; 0.07739938050508499
//   = 1/12.92 ; 0.04045 = piecewise threshold ; 2.4 = gamma exponent.  Blocks [5],[6]
//   are zero. isFixed = 1 (movb $1 to +0x370).
//
// SetGammaFunctionSRGBGamma reads five f32x4 rodata at:
//   VA 0x3cfa80  f32x4 = [ 0.4166666567325592, ×3, 1.0 ]            (transferBlock[0])
//   VA 0x3cfa90  f32x4 = [ 1.1371190547943115, ×3, 0.0 ]            (transferBlock[1])
//   VA 0x3cfaa0  f32x4 = [ 12.920000076293945, ×3, 0.0 ]            (transferBlock[3])
//   VA 0x3cfab0  f32x4 = [ 0.0031308000907301903, ×3, 0.0 ]         (transferBlock[4])
//   VA 0x3cfac0  f32x4 = [ -0.054999999701976776, ×3, 0.0 ]         (transferBlock[5])
// with transferBlock[2] zeroed and transferBlock[6] zeroed. These are the standard sRGB
// OETF (encode) parameters:
//   0.4166666567325592 = 1/2.4 ; 1.055 ; 12.92 ; 0.0031308 threshold ; -0.055 offset.
// isFixed = 1.
//
// ── Frontier callees (loud throw citing @0xADDR — Spec Rule 3) ─────────────────────
//   HGNode::ClearBits()      target @0x000000000011c890   call sites: fccc99, fcd29
//   HGColorGamma::CanLoadData(HGFormat)     @0x00000000000fa580  (used by ScaleParams; m2 stub)
//   HGBitmapLoader::GetBitmapFormat() const @0x0000000000???     (used by ScaleParams; extern
//     into HGBitmapLoader's own file — kept as a boundary throw-stub with the ScaleParams call
//     site address @0x00000000000f77e3 for future decode).
//
// ScaleParams is a large body (starts @0xf77c0, extends past the ScaleParams .cold.1 fragment
// at @0x3c3530 which is the guard-var initializer for its `lutFactory` static). Its `.cold.1`
// entry at 0x3c3530 is a `pthread_once`-style cxa_guard_acquire/release wrapper that lazy-
// initializes the file-local `lutFactory` (HGColorGammaLUTEntryFactory, already ported).
// ScaleParams' MAIN body was not listed as a chunk-m4 method — the ledger only names the
// cold fragment here. We port just that fragment, deferring the main body which the ledger
// tracks separately (it belongs to an earlier chunk range or is un-chunked because it is
// hot-body plus a distinct cold fragment).

import type { HGColorGammaM3 } from "./HGColorGamma.m3";

// ── Frontier stub: HGNode::ClearBits (same as m3) ───────────────────────────────────
function HGNode_ClearBits(_p: HGColorGammaM3): void {
  throw new Error(
    "raw-port: HGNode::ClearBits() not yet transcribed " +
    "(target @0x000000000011c890 — Helium; call sites in this chunk: " +
    "fcc99, fcd29)",
  );
}

// ── Rodata (all cited @0xADDR of their RIP-relative loads) ──────────────────────────
// Each is a Math.fround'd single-precision quartet — the on-disk bytes are IEEE-754 binary32.
// Lane 3 in block[0] is 1.0 (SRGB linearize marker); block[0] lane-3 in the SRGB gamma variant
// is also 1.0. All other block[i] tails are 0.0.

/** VA 0x3cfa30 — SRGB linearize transferBlock[0]. Loaded @0xfccb0. */
const SRGB_LIN_B0: readonly [number, number, number, number] = [
  Math.fround(2.4),
  Math.fround(2.4),
  Math.fround(2.4),
  Math.fround(1.0),
];
/** VA 0x3cfa40 — SRGB linearize transferBlock[1] (= 1/1.055). Loaded @0xfccbe. */
const SRGB_LIN_B1: readonly [number, number, number, number] = [
  Math.fround(0.9478672742843628),
  Math.fround(0.9478672742843628),
  Math.fround(0.9478672742843628),
  Math.fround(0.0),
];
/** VA 0x3cfa50 — SRGB linearize transferBlock[2] (= 0.055/1.055). Loaded @0xfcccc. */
const SRGB_LIN_B2: readonly [number, number, number, number] = [
  Math.fround(0.05213269963860512),
  Math.fround(0.05213269963860512),
  Math.fround(0.05213269963860512),
  Math.fround(0.0),
];
/** VA 0x3cfa60 — SRGB linearize transferBlock[3] (= 1/12.92). Loaded @0xfccda. */
const SRGB_LIN_B3: readonly [number, number, number, number] = [
  Math.fround(0.07739938050508499),
  Math.fround(0.07739938050508499),
  Math.fround(0.07739938050508499),
  Math.fround(0.0),
];
/** VA 0x3cfa70 — SRGB linearize transferBlock[4] (piecewise threshold 0.04045). Loaded @0xfcce8. */
const SRGB_LIN_B4: readonly [number, number, number, number] = [
  Math.fround(0.040449999272823334),
  Math.fround(0.040449999272823334),
  Math.fround(0.040449999272823334),
  Math.fround(0.0),
];

/** VA 0x3cfa80 — SRGB gamma transferBlock[0] (= 1/2.4 exponent). Loaded @0xfcd40. */
const SRGB_GAM_B0: readonly [number, number, number, number] = [
  Math.fround(0.4166666567325592),
  Math.fround(0.4166666567325592),
  Math.fround(0.4166666567325592),
  Math.fround(1.0),
];
/** VA 0x3cfa90 — SRGB gamma transferBlock[1] (= 1.055). Loaded @0xfcd4e. */
const SRGB_GAM_B1: readonly [number, number, number, number] = [
  Math.fround(1.1371190547943115),
  Math.fround(1.1371190547943115),
  Math.fround(1.1371190547943115),
  Math.fround(0.0),
];
/** VA 0x3cfaa0 — SRGB gamma transferBlock[3] (= 12.92 linear slope). Loaded @0xfcd66. */
const SRGB_GAM_B3: readonly [number, number, number, number] = [
  Math.fround(12.920000076293945),
  Math.fround(12.920000076293945),
  Math.fround(12.920000076293945),
  Math.fround(0.0),
];
/** VA 0x3cfab0 — SRGB gamma transferBlock[4] (= 0.0031308 threshold). Loaded @0xfcd74. */
const SRGB_GAM_B4: readonly [number, number, number, number] = [
  Math.fround(0.0031308000907301903),
  Math.fround(0.0031308000907301903),
  Math.fround(0.0031308000907301903),
  Math.fround(0.0),
];
/** VA 0x3cfac0 — SRGB gamma transferBlock[5] (= -0.055 offset). Loaded @0xfcd82. */
const SRGB_GAM_B5: readonly [number, number, number, number] = [
  Math.fround(-0.054999999701976776),
  Math.fround(-0.054999999701976776),
  Math.fround(-0.054999999701976776),
  Math.fround(0.0),
];

const ZERO4: readonly [number, number, number, number] = [0, 0, 0, 0];

// ── Method 80: SetGammaFunctionSRGBLinearize() @0xfcc90..@0xfcd14 ────────────────────
/**
 * HGColorGamma::SetGammaFunctionSRGBLinearize().
 * @0x00000000000fcc90..0x00000000000fcd14 — 25 instrs.
 *
 * Disasm (Helium.HGColorGamma.SetGammaFunctionSRGBLinearize.s):
 *   fcc99 callq HGNode::ClearBits()
 *   fcc9e movb  $0x1,   0x2e9(%rbx)              // dirtyFlag = 1
 *   fcca5 movq  $0x3,   0x404(%rbx)              // gammaForm = 3 (SRGB linearize form ordinal)
 *                                                //   Note: the movq stores a QUAD-WORD, which
 *                                                //   also zeroes +0x408 (gammaLogCurve /
 *                                                //   unpremultSanitizedLutIdx) as the high 4B
 *                                                //   of the write; we mirror that.
 *   fccb0 movaps rodata[0x3cfa30], %xmm0
 *   fccb7 movaps %xmm0, 0x300(%rbx)              // transferBlock[0] = [2.4,×3,1.0]
 *   fccbe movaps rodata[0x3cfa40], %xmm0
 *   fccc5 movaps %xmm0, 0x310(%rbx)              // transferBlock[1] = [1/1.055,×3,0]
 *   fcccc movaps rodata[0x3cfa50], %xmm0
 *   fccd3 movaps %xmm0, 0x320(%rbx)              // transferBlock[2] = [0.055/1.055,×3,0]
 *   fccda movaps rodata[0x3cfa60], %xmm0
 *   fcce1 movaps %xmm0, 0x330(%rbx)              // transferBlock[3] = [1/12.92,×3,0]
 *   fcce8 movaps rodata[0x3cfa70], %xmm0
 *   fccef movaps %xmm0, 0x340(%rbx)              // transferBlock[4] = [0.04045,×3,0]
 *   fccf6 xorps  %xmm0, %xmm0                    // zero
 *   fccf9 movaps %xmm0, 0x350(%rbx)              // transferBlock[5] = 0
 *   fcd00 movaps %xmm0, 0x360(%rbx)              // transferBlock[6] = 0
 *   fcd07 movb   $0x1,  0x370(%rbx)              // transformBlock_isFixed = 1
 */
export function hgColorGamma_SetGammaFunctionSRGBLinearize(self: HGColorGammaM3): void {
  HGNode_ClearBits(self);                          // @0xfcc99
  self.dirtyFlag = 1;                               // @0xfcc9e
  self.gammaForm = 0x3;                             // @0xfcca5 (movq stores 8B: low 4B = 3)
  self.unpremultSanitizedLutIdx = 0;                // @0xfcca5 (movq high 4B = 0)
  self.transformBlock_300 = SRGB_LIN_B0;            // @0xfccb7
  self.transformBlock_310 = SRGB_LIN_B1;            // @0xfccc5
  self.transformBlock_320 = SRGB_LIN_B2;            // @0xfccd3
  self.transformBlock_330 = SRGB_LIN_B3;            // @0xfcce1
  self.transformBlock_340 = SRGB_LIN_B4;            // @0xfccef
  self.transformBlock_350 = ZERO4;                  // @0xfccf9
  self.transformBlock_360 = ZERO4;                  // @0xfcd00
  self.transformBlock_isFixed = 1;                  // @0xfcd07
}

// ── Method 81: SetGammaFunctionSRGBGamma() @0xfcd20..@0xfcda4 ────────────────────────
/**
 * HGColorGamma::SetGammaFunctionSRGBGamma().
 * @0x00000000000fcd20..0x00000000000fcda4 — 25 instrs. Symmetric to the Linearize method:
 * writes gammaForm=4 and encodes the sRGB OETF (encode / gamma-apply) direction.
 *
 * Disasm (Helium.HGColorGamma.SetGammaFunctionSRGBGamma.s):
 *   fcd29 callq HGNode::ClearBits()
 *   fcd2e movb  $0x1,   0x2e9(%rbx)
 *   fcd35 movq  $0x4,   0x404(%rbx)              // gammaForm = 4 (SRGB gamma-apply ordinal)
 *   fcd40 movaps rodata[0x3cfa80], %xmm0
 *   fcd47 movaps %xmm0, 0x300(%rbx)              // transferBlock[0] = [1/2.4,×3,1.0]
 *   fcd4e movaps rodata[0x3cfa90], %xmm0
 *   fcd55 movaps %xmm0, 0x310(%rbx)              // transferBlock[1] = [1.055,×3,0]
 *   fcd5c xorps  %xmm0, %xmm0
 *   fcd5f movaps %xmm0, 0x320(%rbx)              // transferBlock[2] = 0
 *   fcd66 movaps rodata[0x3cfaa0], %xmm1
 *   fcd6d movaps %xmm1, 0x330(%rbx)              // transferBlock[3] = [12.92,×3,0]
 *   fcd74 movaps rodata[0x3cfab0], %xmm1
 *   fcd7b movaps %xmm1, 0x340(%rbx)              // transferBlock[4] = [0.0031308,×3,0]
 *   fcd82 movaps rodata[0x3cfac0], %xmm1
 *   fcd89 movaps %xmm1, 0x350(%rbx)              // transferBlock[5] = [-0.055,×3,0]
 *   fcd90 movaps %xmm0, 0x360(%rbx)              // transferBlock[6] = 0
 *   fcd97 movb   $0x1,  0x370(%rbx)              // transformBlock_isFixed = 1
 */
export function hgColorGamma_SetGammaFunctionSRGBGamma(self: HGColorGammaM3): void {
  HGNode_ClearBits(self);                          // @0xfcd29
  self.dirtyFlag = 1;                               // @0xfcd2e
  self.gammaForm = 0x4;                             // @0xfcd35 (movq stores 8B: low 4B = 4)
  self.unpremultSanitizedLutIdx = 0;                // @0xfcd35 (movq high 4B = 0)
  self.transformBlock_300 = SRGB_GAM_B0;            // @0xfcd47
  self.transformBlock_310 = SRGB_GAM_B1;            // @0xfcd55
  self.transformBlock_320 = ZERO4;                  // @0xfcd5f
  self.transformBlock_330 = SRGB_GAM_B3;            // @0xfcd6d
  self.transformBlock_340 = SRGB_GAM_B4;            // @0xfcd7b
  self.transformBlock_350 = SRGB_GAM_B5;            // @0xfcd89
  self.transformBlock_360 = ZERO4;                  // @0xfcd90
  self.transformBlock_isFixed = 1;                  // @0xfcd97
}

// ── Method 82: TestConversion(6-arg) @0xfcdb0..@0xfcdf3 ──────────────────────────────
/**
 * HGColorGamma::TestConversion(inColorPrimaries, inTransferFn, inMatrixCoeffs,
 *                              outColorPrimaries, outTransferFn, outMatrixCoeffs).
 * @0x00000000000fcdb0..0x00000000000fcdf3 — 34 instrs.
 *
 * Pure predicate: "is this 6-tuple a SUPPORTED preset?" (no self.* touched — no HGNode::
 * ClearBits, no dirty-flag, no field writes). All 6 args are 4-byte enums, lowered by SysV
 * to %edi,%esi,%edx,%ecx,%r8d,%r9d respectively:
 *   %edi = inColorPrimaries    (arg0)
 *   %esi = inTransferFn        (arg1)
 *   %edx = inMatrixCoeffs      (arg2)
 *   %ecx = outColorPrimaries   (arg3)
 *   %r8d = outTransferFn       (arg4)
 *   %r9d = outMatrixCoeffs     (arg5)
 *
 * Disasm (Helium.HGColorGamma.TestConversion.s):
 *   @ 0xfcdb4  cmpl $0x8, %r8d ; jne 0xfcdc3          if outTransferFn != 8 goto fcdc3
 *   @ 0xfcdba  testl %r9d, %r9d ; je  0xfcddd         if outMatrixCoeffs != 0 return false
 *   @ 0xfcdbf  xorl %eax,%eax ; popq %rbp ; retq      return false
 *   -- fcdc3:
 *   @ 0xfcdc3  cmpl $0x8, %esi ; jne 0xfcdd0          if inTransferFn != 8 goto fcdd0
 *   @ 0xfcdc8  testl %edx, %edx ; je 0xfcdf0          if inMatrixCoeffs == 0 return TRUE
 *   @ 0xfcdcc  xorl %eax,%eax ; popq ; retq           return false
 *   -- fcdd0:
 *   @ 0xfcdd0  xorl %ecx, %edi                        edi = inCP ^ outCP
 *   @ 0xfcdd2  xorl %r8d, %esi                        esi = inTF ^ outTF
 *   @ 0xfcdd5  orl  %edi, %esi                        esi = (inCP^outCP) | (inTF^outTF)
 *   @ 0xfcdd7  je 0xfcdf0                             if 0: TRUE, else fall through
 *   @ 0xfcdd9  xorl %eax,%eax ; popq ; retq           return false
 *   -- fcddd:
 *   @ 0xfcddd  cmpl $0x8, %esi ; sete %al             al = (inTF == 8)
 *   @ 0xfcde3  testl %edx, %edx ; setne %cl           cl = (inMC != 0)
 *   @ 0xfcde8  testb %cl, %al ; je 0xfcdf0            if !(al & cl) TRUE else false
 *   @ 0xfcdec  xorl %eax,%eax ; popq ; retq           return false
 *   -- fcdf0:
 *   @ 0xfcdf0  movb $0x1, %al ; popq ; retq           return TRUE
 *
 * Reduces to:
 *   if outTransferFn == 8:
 *      if outMatrixCoeffs != 0: return false
 *      return !(inTransferFn == 8 && inMatrixCoeffs != 0)
 *   else:
 *      if inTransferFn == 8: return inMatrixCoeffs == 0
 *      return inColorPrimaries == outColorPrimaries && inTransferFn == outTransferFn
 *
 * (inMatrixCoeffs / outMatrixCoeffs do NOT participate in the fcdd0 xor-equal branch,
 * only edi=inCP and esi=inTF and their outgoing counterparts %ecx, %r8d.)
 */
export function hgColorGamma_TestConversion(
  inColorPrimaries: number,
  inTransferFn: number,
  inMatrixCoeffs: number,
  outColorPrimaries: number,
  outTransferFn: number,
  outMatrixCoeffs: number,
): boolean {
  // Normalize to u32 to mirror the 32-bit cmpl / testl / xorl operations.
  const iCP = inColorPrimaries  >>> 0;
  const iTF = inTransferFn      >>> 0;
  const iMC = inMatrixCoeffs    >>> 0;
  const oCP = outColorPrimaries >>> 0;
  const oTF = outTransferFn     >>> 0;
  // outMatrixCoeffs also normalized for parity with the disasm (%r9d test).
  const oMC = outMatrixCoeffs   >>> 0;

  if (oTF === 8) {                       // @0xfcdb4
    if (oMC !== 0) return false;         // @0xfcdba / @0xfcdbf
    // fcddd path
    return !(iTF === 8 && iMC !== 0);    // @0xfcddd..@0xfcdf0
  }
  if (iTF === 8) {                       // @0xfcdc3
    return iMC === 0;                    // @0xfcdc8 / @0xfcdf0
  }
  // fcdd0 xor-equal
  return iCP === oCP && iTF === oTF;     // @0xfcdd0..@0xfcdf0
}

// ── Method 83: HGColorGamma::ScaleParams(HGNode*, HGRenderer*) (.cold.1) ─────────────
/**
 * HGColorGamma::ScaleParams(HGNode*, HGRenderer*)::.cold.1.
 * @0x00000000003c3530..0x00000000003c3553 — 8 instrs (cxa_guard-style lazy init tail).
 *
 * The MAIN body of ScaleParams lives at @0x00000000000f77c0 and is tracked by the ledger
 * outside this chunk. The `.cold.1` fragment is the C++ ABI-emitted second half of a
 * `pthread_once` / `__cxa_guard_acquire`-style initializer for a function-local static
 * variable of type HGColorGammaLUTEntryFactory (name mangled as
 * `__ZGVZN12HGColorGamma11ScaleParamsE...E10lutFactory` — the guard variable for a static
 * named `lutFactory` inside ScaleParams).
 *
 * Disasm (from `llvm-objdump --disassemble-symbols` on the thin slice):
 *   3c3530  pushq %rbp
 *   3c3531  movq  %rsp, %rbp
 *   3c3534  leaq  __ZGVZN...E10lutFactory(%rip), %rdi       ## &guardVar (@VA 0xaddea8)
 *   3c353b  callq __cxa_guard_acquire                        ## stub @0x3c5000
 *   3c3540  testl %eax, %eax
 *   3c3542  je    0x3c3551                                   ## already-initialized
 *   3c3544  leaq  __ZGVZN...E10lutFactory(%rip), %rdi
 *   3c354b  popq  %rbp
 *   3c354c  jmp   __cxa_guard_release                        ## stub @0x3c5006 (tail call)
 *   3c3551  popq  %rbp
 *   3c3552  retq
 *
 * SEMANTICS: this fragment is invoked ONLY if the main-body of ScaleParams needs to
 * initialize the static factory the FIRST time. The main body checks the guard's low byte
 * inline; if it's zero it CALLS this cold fragment which calls __cxa_guard_acquire, checks
 * whether acquisition succeeded (returned non-zero), and if so tail-calls __cxa_guard_release
 * to publish the initialization. If acquire returned zero (another thread beat us), it just
 * returns.
 *
 * The main-body call site issues an ADD-and-CALL sequence in a slow path we haven't ported
 * yet. Port the fragment as a no-op with a loud throw citing every extern it depends on so
 * downstream ports can wire up the guard once __cxa_guard_acquire is available. Since the
 * function has no observable side-effect visible to the ScaleParams caller other than
 * "the static was initialized", and static initialization is an ABI concern (not FCP logic),
 * we mark it deferred pending __cxa_guard_acquire / __cxa_guard_release stubbing.
 *
 * DEFERRED — extern boundary (libcxxabi):
 *   __cxa_guard_acquire        @stub 0x3c5000 (imported)
 *   __cxa_guard_release        @stub 0x3c5006 (imported)
 *   HGColorGammaLUTEntryFactory static @VA 0xaddea8 (guard slot in __DATA)
 */
export function hgColorGamma_ScaleParams_cold_1(): void {
  throw new Error(
    "raw-port: HGColorGamma::ScaleParams(HGNode*, HGRenderer*)::.cold.1 not yet transcribed " +
    "(@0x00000000003c3530..0x00000000003c3553 — cxa_guard-style lazy init for the ScaleParams " +
    "static `lutFactory` @VA 0x0000000000addea8; extern calls __cxa_guard_acquire " +
    "@stub 0x00000000003c5000 and __cxa_guard_release @stub 0x00000000003c5006 — Helium)",
  );
}
