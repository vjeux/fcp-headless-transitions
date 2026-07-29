// PCGetMatrixString.ts — ProCore free function:
//   PCGetMatrixString(PCMatrixValue)  @ProCore 0xc191b   __Z17PCGetMatrixString13PCMatrixValue
// Transcribed from the disassembly at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// See raw-port/re/disasm/ProCore.__Z17PCGetMatrixString13PCMatrixValue.s.
//
// ROLE. Small dispatch that maps an ISO/IEC 23001-8 matrix_coeffs code (the PCMatrixValue enum,
// same u32 codepoints used by PCIsUsableNCLCCode / PCNCLCCode.matrix, see PCIsUsableNCLCCode.ts)
// to the corresponding CoreVideo attachment key CFString. The returned pointer is the value of
// one of Apple's dyld-imported globals:
//
//   _kCVImageBufferYCbCrMatrix_ITU_R_709_2         (matrix code 1, BT.709)
//   _kCVImageBufferYCbCrMatrix_ITU_R_601_4         (matrix code 6, SMPTE 170M / BT.601-4)
//   _kCVImageBufferYCbCrMatrix_SMPTE_240M_1995     (matrix code 7, SMPTE 240M)
//   _kCVImageBufferYCbCrMatrix_ITU_R_2020          (matrix code 9, BT.2020 NCL)
//
// Any other code — including 0, 2..5, 8, and anything > 9 — returns the null pointer. Consumers
// use that as "no matching CoreVideo key; do not attach". This is a boundary function against
// the CoreVideo dynamic library so the four global reads are modelled as opaque extern handles;
// nothing about their internal identity affects the port's value semantics.
//
// x86_64 CONTROL FLOW (all VAs are within ProCore's __TEXT.__text):
//
//   0xc191b  pushq  %rbp
//   0xc191c  movq   %rsp, %rbp
//   0xc191f  xorl   %eax, %eax                ; retval = 0 (default early)
//   0xc1921  decl   %edi                       ; edi = PCMatrixValue - 1  (zero-based)
//   0xc1923  cmpl   $0x8, %edi                 ; unsigned compare (edi > 8 => out of table)
//   0xc1926  ja     0xc195d                    ; -> epilogue with %rax==0
//   0xc1928  leaq   0x31(%rip), %rcx           ; rcx = &jumpTable  = 0xc1960
//   0xc192f  movslq (%rcx,%rdi,4), %rdx        ; sign-extend jumpTable[edi] (a 32-bit disp)
//   0xc1933  addq   %rcx, %rdx                 ; rdx = jumpTable[edi] + jumpTable base
//   0xc1936  jmpq   *%rdx
//   0xc1938  movq   0x86029(%rip), %rax        ; case: -> _kCVImageBufferYCbCrMatrix_ITU_R_709_2 GOT slot
//   0xc193f  jmp    0xc195a                    ;   fall through the shared load-and-return tail
//   0xc1941  movq   0x86028(%rip), %rax        ; case: -> _kCVImageBufferYCbCrMatrix_SMPTE_240M_1995
//   0xc1948  jmp    0xc195a
//   0xc194a  movq   0x8600f(%rip), %rax        ; case: -> _kCVImageBufferYCbCrMatrix_ITU_R_601_4
//   0xc1951  jmp    0xc195a
//   0xc1953  movq   0x85ffe(%rip), %rax        ; case: -> _kCVImageBufferYCbCrMatrix_ITU_R_2020
//   0xc195a  movq   (%rax), %rax               ; dereference the GOT slot -> the CFStringRef value
//   0xc195d  popq   %rbp
//   0xc195e  retq
//
// JUMP TABLE — 9 signed 32-bit displacements at ProCore 0xc1960, base = 0xc1960. Read verbatim
// out of the framework's x86_64 slice at file offset (16384 + 0xc1960) = 0xc5960:
//
//   e8dfffff fdffffff fdffffff fdffffff fdffffff eaffffff e1ffffff fdffffff f3ffffff
//    input=1  input=2  input=3  input=4  input=5  input=6  input=7  input=8  input=9
//   disp:
//     [1] -0x28 -> 0xc1938  (709_2)
//     [2..5,8] -0x3 -> 0xc195d (default: %rax==0 already)
//     [6] -0x16 -> 0xc194a  (601_4)
//     [7] -0x1f -> 0xc1941  (240M)
//     [9] -0xd  -> 0xc1953  (2020)
//
// The dispatcher's pre-jump `decl %edi` means the ONLY input that lands on jumpTable[0] is
// PCMatrixValue==1; PCMatrixValue==0 wraps to 0xffffffff and is rejected by the `ja` at 0xc1926,
// exactly like every value >= 10. So the accepted codes are the four listed above; everything
// else returns null.
//
// AT&T CHEAT-SHEET NOTE. `cmpl $0x8, %edi ; ja` reads as `edi - 8` with the unsigned/CF form:
// taken iff edi > 8 (see raw-port/army/PORTING_SPEC.md §Rule 4). This is not > 9 — it is > 8
// after the earlier `decl %edi`, i.e. the range check for the 9-entry table.

import type {PCMatrixValue} from "./PCIsUsableNCLCCode";

/**
 * CoreVideo CFStringRef handle for the four YCbCr matrix attachment keys. In the FCP binary
 * these are `CFStringRef` globals imported from the CoreVideo dylib (opaque
 * `struct __CFString *`); we model them as branded singletons because JS has no CoreFoundation.
 * Only identity/nullness is observed by PCGetMatrixString's callers.
 */
export type CVImageBufferYCbCrMatrixKey = {
  readonly __brand: "CVImageBufferYCbCrMatrixKey";
  readonly name: string;
};

/**
 * _kCVImageBufferYCbCrMatrix_ITU_R_709_2  — CoreVideo extern, dyld-imported at ProCore 0xc1938.
 * Boundary handle: opaque CFStringRef pointer produced by the CoreVideo dylib at load time.
 */
export const kCVImageBufferYCbCrMatrix_ITU_R_709_2: CVImageBufferYCbCrMatrixKey =
  Object.freeze({__brand: "CVImageBufferYCbCrMatrixKey", name: "ITU_R_709_2"}) as CVImageBufferYCbCrMatrixKey;

/**
 * _kCVImageBufferYCbCrMatrix_SMPTE_240M_1995  — CoreVideo extern, ProCore 0xc1941.
 */
export const kCVImageBufferYCbCrMatrix_SMPTE_240M_1995: CVImageBufferYCbCrMatrixKey =
  Object.freeze({__brand: "CVImageBufferYCbCrMatrixKey", name: "SMPTE_240M_1995"}) as CVImageBufferYCbCrMatrixKey;

/**
 * _kCVImageBufferYCbCrMatrix_ITU_R_601_4  — CoreVideo extern, ProCore 0xc194a.
 */
export const kCVImageBufferYCbCrMatrix_ITU_R_601_4: CVImageBufferYCbCrMatrixKey =
  Object.freeze({__brand: "CVImageBufferYCbCrMatrixKey", name: "ITU_R_601_4"}) as CVImageBufferYCbCrMatrixKey;

/**
 * _kCVImageBufferYCbCrMatrix_ITU_R_2020  — CoreVideo extern, ProCore 0xc1953.
 */
export const kCVImageBufferYCbCrMatrix_ITU_R_2020: CVImageBufferYCbCrMatrixKey =
  Object.freeze({__brand: "CVImageBufferYCbCrMatrixKey", name: "ITU_R_2020"}) as CVImageBufferYCbCrMatrixKey;

/**
 * PCGetMatrixString(PCMatrixValue) @ProCore 0xc191b.
 *
 * Returns the CoreVideo attachment-key CFString for a given ISO/IEC 23001-8 matrix_coeffs code,
 * or null for any code the built-in table does not name. The switch layout, the four accepted
 * codes, and the "0 / out-of-range -> null" default all come straight from the jump table
 * transcribed above.
 *
 * @param value  ISO/IEC 23001-8 matrix_coeffs value (a `PCMatrixValue` u32, see
 *               PCIsUsableNCLCCode.ts). Legal codes handled here: 1 (BT.709), 6 (SMPTE 170M /
 *               BT.601-4), 7 (SMPTE 240M), 9 (BT.2020 NCL). All others return `null`.
 * @returns      The `kCVImageBufferYCbCrMatrix_*` CFString handle, or `null`.
 */
export function PCGetMatrixString(value: PCMatrixValue): CVImageBufferYCbCrMatrixKey | null {
  // @0xc1921  decl %edi                    ; edi = value - 1  (unsigned wrap for value==0)
  // @0xc1923  cmpl $0x8, %edi              ; edi - 8   (AT&T: dst-src)
  // @0xc1926  ja   0xc195d                 ; if (edi > 8) -> return 0 (rax was xorl'd)
  const idx = ((value >>> 0) - 1) >>> 0;
  if (idx > 0x8) return null;   // covers value == 0 (wraps to 0xffffffff) and value >= 10
  // Jump table dispatch — transcribed cases from ProCore 0xc1960..0xc1983:
  switch (idx) {
    // @0xc1938  movq  0x86029(%rip), %rax  ; load _kCVImageBufferYCbCrMatrix_ITU_R_709_2 GOT slot
    // @0xc195a  movq  (%rax), %rax         ; dereference to CFStringRef value
    case 0: return kCVImageBufferYCbCrMatrix_ITU_R_709_2;    // PCMatrixValue==1
    // @0xc194a  movq  0x8600f(%rip), %rax  ; _kCVImageBufferYCbCrMatrix_ITU_R_601_4
    case 5: return kCVImageBufferYCbCrMatrix_ITU_R_601_4;    // PCMatrixValue==6
    // @0xc1941  movq  0x86028(%rip), %rax  ; _kCVImageBufferYCbCrMatrix_SMPTE_240M_1995
    case 6: return kCVImageBufferYCbCrMatrix_SMPTE_240M_1995;// PCMatrixValue==7
    // @0xc1953  movq  0x85ffe(%rip), %rax  ; _kCVImageBufferYCbCrMatrix_ITU_R_2020
    case 8: return kCVImageBufferYCbCrMatrix_ITU_R_2020;     // PCMatrixValue==9
    // idx = 1,2,3,4,7 -> table entry lands on 0xc195d (default): %rax was already xorl'd @0xc191f
    default: return null;                                    // PCMatrixValue == 2,3,4,5,8
  }
}
