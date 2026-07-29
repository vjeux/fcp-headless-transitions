// PCMakeCanonicalNCLCCode.ts — ProCore free function:
//   PCMakeCanonicalNCLCCode(PCPrimariesValue, PCTransferFunctionValue, PCMatrixValue)
//                                                                          @ProCore 0xc1f5b
//
// Transcribed from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// disasm: raw-port/re/disasm/ProCore.__Z23PCMakeCanonicalNCLCCode16PCPrimariesValue23PCTransferFunctionValue13PCMatrixValue.s
//
// ROLE. Given a candidate ISO/IEC 23001-8 NCLC triple (primaries, transfer, matrix), return the
// CANONICAL triple that ProCore actually renders with — folding known aliases into their preferred
// representative and clamping unsupported codes to the fallback (2,2,2 = unspecified/unspecified/
// unspecified). This is the write-side companion of PCIsUsableNCLCCode (0xc2088), which only
// filters. `PCMakeCanonicalNCLCCode` is what ProCore uses when constructing a PCNCLCCode to attach
// to a bitmap / render context — it makes sure equal-but-differently-spelled codes hash and compare
// as equal in downstream tables.
//
// SHARED CONSTANTS. The three byte-lookup tables live in ProCore.__TEXT.__const at 0x1282d0 /
// 0x1282e0 / 0x1282f3 and are ALREADY transcribed by PCIsUsableNCLCCode.ts — this file imports and
// reuses them (no duplicate literal). See that file for the source-offset dumps and non-zero code
// indices.
//
// C++ RETURN ABI. `PCNCLCCode` is a 12-byte POD (three u32 fields). SysV AMD64 returns a
// ≤16-byte trivial struct in rax:rdx. The disasm packs it exactly:
//   %eax = primaries          @0xc1fce   (movl %edi, %eax)
//   %rcx = transfer  << 32    @0xc1fca   (shlq $0x20, %rcx)
//   %rax = %rax | %rcx        @0xc1fd0   (orq  %rcx, %rax)      -> rax low32=primaries, high32=transfer
//   %edx = matrix                                                -> rdx=matrix
// which matches PCNCLCCode layout {primaries: u32 @+0, transfer: u32 @+4, matrix: u32 @+8}.
//
// FALLBACK (unsupported triple). If any of the three input codes is out-of-table-range OR its byte
// in the corresponding supportedFooTable is zero, control jumps to 0xc1fc0 which sets edi=2,
// ecx=2, and inherits the initial edx=2 set at 0xc1f61 — i.e. returns {2, 2, 2}. Code 2 is the
// H.273 "unspecified" sentinel for all three axes.

import {
  supportedPrimariesTable,
  supportedTransfersTable,
  supportedMatricesTable,
  type PCPrimariesValue,
  type PCTransferFunctionValue,
  type PCMatrixValue,
  type PCNCLCCode,
} from './PCIsUsableNCLCCode';

// Re-export tables not needed publicly; the types travel through PCNCLCCode.
export type { PCNCLCCode, PCPrimariesValue, PCTransferFunctionValue, PCMatrixValue };

/**
 * PCMakeCanonicalNCLCCode(PCPrimariesValue, PCTransferFunctionValue, PCMatrixValue) @ProCore 0xc1f5b.
 *
 * Full transcription of the 92-line function body. The disasm structure is:
 *   1. Bounds+table gate (identical predicate to PCIsUsableNCLCCode) — failure = fallback {2,2,2}.
 *   2. `cmovnel` re-maps a transfer value of 14 to 1 for downstream comparisons (but NOT the
 *      returned transfer field in every branch — some branches overwrite ecx with %esi again).
 *   3. Six alias-collapse cases picked out with `xorl/andl` bitmask tests and `btl` (bit-test)
 *      against small immediate masks (0x1802 = bits {1,11,12}; 0x60 = bits {5,6}).
 *
 * ── (1) Gate ─────────────────────────────────────────────────────────────────────────
 *   0xc1f5f  movl %edx, %eax                 ; eax = matrix (saved for later)
 *   0xc1f61  movl $0x2, %edx                 ; edx = 2  (default matrix = "unspecified")
 *   0xc1f66  cmpl $0xc,  %edi ; ja fallback  ; if (primaries > 12) -> {2,2,2}
 *   0xc1f6b  cmpl $0x12, %esi ; ja fallback  ; if (transfer  > 18) -> {2,2,2}
 *   0xc1f70  movl %edi, %ecx
 *   0xc1f72  leaq supportedPrimariesTable(%rip), %r8
 *   0xc1f79  cmpb $0x0, (%rcx,%r8) ; je fallback   ; unsupported primary -> {2,2,2}
 *   0xc1f80  cmpl $0x9, %eax ; ja fallback         ; if (matrix > 9) -> {2,2,2}
 *   0xc1f85  movl %esi, %ecx
 *   0xc1f87  leaq supportedTransfersTable(%rip), %r8
 *   0xc1f8e  cmpb $0x0, (%rcx,%r8) ; je fallback   ; unsupported transfer -> {2,2,2}
 *   0xc1f95  movl %eax, %ecx
 *   0xc1f97  leaq supportedMatricesTable(%rip), %r8
 *   0xc1f9e  cmpb $0x1, (%rcx,%r8) ; jne fallback  ; unsupported matrix   -> {2,2,2}
 *                                                  ; (`jne` = "not exactly 1" — the matrix table
 *                                                  ;  is 0/1 only, so equivalent to `je 0` inverted)
 *
 * ── (2) transfer==14 alias ───────────────────────────────────────────────────────────
 *   0xc1fa5  cmpl $0xe, %esi                 ; transfer vs 14
 *   0xc1fa8  movl $0x1, %ecx
 *   0xc1fad  cmovnel %esi, %ecx              ; ecx = (transfer == 14) ? 1 : transfer
 *
 * ── (3) fast-paths for transfer ∈ {8, 13}, matrix := 0 ───────────────────────────────
 *   0xc1fb0  cmpl $0x8, %esi ; je 0xc1fba
 *   0xc1fb5  cmpl $0xd, %esi ; jne 0xc1fd5
 *   0xc1fba  movl %esi, %ecx                 ; ecx = transfer (raw)
 *   0xc1fbc  xorl %edx, %edx                 ; edx = 0 (matrix := 0)
 *   0xc1fbe  jmp  0xc1fca                    ; -> pack & return {primaries=edi, transfer=esi, 0}
 *
 * ── Alias collapse: primaries==12 & transfer ∈ {1,14}  ->  (12, 1, 1) ────────────────
 *   0xc1fd5  movl %edi, %r8d  ; xorl $0xc, %r8d       ; r8 = primaries ^ 12
 *   0xc1fdc  movl %ecx, %r9d  ; xorl $0x1, %r9d       ; r9 = (mapped-transfer) ^ 1
 *   0xc1fe3  orl  %r8d, %r9d  ; jne 0xc1ff9           ; branch if either differs
 *   0xc1fe8  movl $0xc, %edi ; movl $0x1, %ecx ; movl $0x1, %edx ; jmp 0xc1fca
 *
 * ── Alias collapse: primaries==11 & transfer==17    ->  (11, 17, 0) ──────────────────
 *   0xc1ff9  movl %edi, %r9d  ; xorl $0xb, %r9d       ; primaries ^ 11
 *   0xc2000  movl %ecx, %r10d ; xorl $0x11, %r10d     ; mapped-transfer ^ 17
 *   0xc2007  orl  %r9d, %r10d ; jne 0xc2018
 *   0xc200c  movl $0x11, %ecx ; movl $0xb, %edi ; jmp 0xc1fbc  (edx := 0, pack)
 *
 * ── Alias collapse: primaries==9  & (ecx & 0x1d) == 0x10  ->  (9, transfer, 9) ───────
 *   0xc2018  movl %edi, %r10d ; xorl $0x9, %r10d      ; primaries ^ 9
 *   0xc201f  movl %ecx, %r9d  ; andl $0x1d, %r9d ; xorl $0x10, %r9d  ; (mapped-t & 0x1d) ^ 0x10
 *   0xc202a  orl  %r9d, %r10d ; jne 0xc203d
 *   0xc202f  movl $0x9, %edi ; movl %esi, %ecx ; movl $0x9, %edx ; jmp 0xc1fca
 *
 * ── Alias collapse: primaries==12 & (ecx & 0x1d) == 0x10  ->  (12, transfer, 1) ──────
 *   0xc203d  orl  %r9d, %r8d ; jne 0xc204b              ; primaries^12 | ((mapped-t&0x1d)^0x10)
 *   0xc2042  movl $0xc, %edi ; movl %esi, %ecx ; jmp 0xc1ff2  (edx := 1, pack)
 *
 * ── Generic tail ─────────────────────────────────────────────────────────────────────
 *   0xc204b  testl %eax, %eax                          ; matrix != 0 ?
 *   0xc204d  je    0xc2056
 *   0xc204f  movl  %eax, %edx                          ; edx = matrix (unchanged)
 *   0xc2051  jmp   0xc1fca                             ; -> pack (primaries, mapped-transfer, matrix)
 *   0xc2056  cmpl  $0xc,  %edi ; ja 0xc1fca            ; defensive (dead — primaries already ≤12)
 *   0xc205f  movl  $0x1802, %eax                       ; bitmask of {1, 11, 12}
 *   0xc2064  btl   %edi, %eax ; jb 0xc1ff2             ; primaries ∈ {1,11,12} -> matrix := 1
 *   0xc2069  movl  $0x60, %eax                         ; bitmask of {5, 6}
 *   0xc206e  btl   %edi, %eax ; jae 0xc207d
 *   0xc2073  movl  $0x6, %edx ; jmp 0xc1fca            ; primaries ∈ {5,6}   -> matrix := 6
 *   0xc207d  cmpl  $0x9, %edi ; jne 0xc1fca            ; primaries != 9      -> matrix stays 2
 *   0xc2086  jmp   0xc2036                             ; primaries == 9      -> {9, transfer, 9}
 *
 * ── Pack epilogue ────────────────────────────────────────────────────────────────────
 *   0xc1fca  shlq  $0x20, %rcx                         ; rcx = transfer << 32
 *   0xc1fce  movl  %edi, %eax                          ; rax low32 = primaries
 *   0xc1fd0  orq   %rcx, %rax                          ; rax high32 = transfer
 *   0xc1fd3  popq %rbp ; retq                          ; return {primaries=rax_lo, transfer=rax_hi, matrix=edx}
 */
export function PCMakeCanonicalNCLCCode(
  primaries: number,   // PCPrimariesValue — H.273 colour_primaries u32
  transfer: number,    // PCTransferFunctionValue — H.273 transfer_characteristics u32
  matrix: number,      // PCMatrixValue — H.273 matrix_coeffs u32
): PCNCLCCode {
  // ── Gate (all three codes must be in-table AND flagged supported). Any failure -> {2,2,2}.
  //   @0xc1f61 edx=2 default; @0xc1f66/6b/f9e are the three `ja/jne fallback` branches.
  const p = primaries >>> 0;                                    // @0xc1f70 movl %edi, %ecx
  const t = transfer  >>> 0;                                    // @0xc1f85 movl %esi, %ecx
  const m = matrix    >>> 0;                                    // @0xc1f95 movl %eax, %ecx
  if (p > 0xc)  return { primaries: 2, transfer: 2, matrix: 2 };   // @0xc1f66 cmpl $0xc,  %edi ; ja
  if (t > 0x12) return { primaries: 2, transfer: 2, matrix: 2 };   // @0xc1f6b cmpl $0x12, %esi ; ja
  if (supportedPrimariesTable[p] === 0) return { primaries: 2, transfer: 2, matrix: 2 }; // @0xc1f79 je
  if (m > 0x9)  return { primaries: 2, transfer: 2, matrix: 2 };   // @0xc1f80 cmpl $0x9,  %eax ; ja
  if (supportedTransfersTable[t] === 0) return { primaries: 2, transfer: 2, matrix: 2 }; // @0xc1f8e je
  if (supportedMatricesTable[m] !== 1)  return { primaries: 2, transfer: 2, matrix: 2 }; // @0xc1f9e jne (table is 0/1)

  // ── (2) transfer==14 alias (BT.2020 10-bit -> BT.709 for the mapped-transfer probe only).
  //   Note: this only affects the DOWNSTREAM alias tests — the returned transfer field is either
  //   ecx (mapped) or a fresh `movl %esi,%ecx` (raw) depending on which alias branch fires.
  //     @0xc1fa5 cmpl $0xe, %esi
  //     @0xc1fa8 movl $0x1, %ecx
  //     @0xc1fad cmovnel %esi, %ecx
  const mappedTransfer = (t === 0xe) ? 1 : t;                   // ecx after cmovne

  // ── (3) transfer ∈ {8, 13}: matrix := 0, transfer := raw (esi).  @0xc1fb0..bE + @0xc1fbc xorl edx,edx.
  if (t === 0x8 || t === 0xd) {                                 // @0xc1fb0 je / @0xc1fb5 jne to 0xc1fd5
    return { primaries: p, transfer: t, matrix: 0 };            // pack via @0xc1fba/bc/be
  }

  // ── Alias collapse: primaries==12 && mappedTransfer==1  ->  (12, 1, 1).  @0xc1fd5..e8.
  //   Predicate is `(primaries ^ 12) | (mappedTransfer ^ 1) == 0` = `AND` of the two equalities.
  if (((p ^ 0xc) | (mappedTransfer ^ 0x1)) === 0) {             // @0xc1fd5/fdc/fe3
    return { primaries: 0xc, transfer: 0x1, matrix: 0x1 };      // @0xc1fe8 movl $0xc/$0x1/$0x1
  }

  // ── Alias collapse: primaries==11 && mappedTransfer==17  ->  (11, 17, 0).  @0xc1ff9..2011 + xorl edx,edx via 0xc1fbc.
  if (((p ^ 0xb) | (mappedTransfer ^ 0x11)) === 0) {            // @0xc1ff9/2000/2007
    return { primaries: 0xb, transfer: 0x11, matrix: 0 };       // @0xc200c movl $0x11,%ecx; movl $0xb,%edi; jmp .xorEdx
  }

  // ── Alias collapse: primaries==9 && (mappedTransfer & 0x1d) == 0x10  ->  (9, raw transfer, 9).
  //   0x1d = 0b11101 selects bits {0,2,3,4}. `== 0x10` (=0b10000) means bit4 set AND bits {0,2,3} clear.
  //   Combined with mappedTransfer coming from cmovne(t==14 ? 1 : t), the feasible originals for
  //   transfer are exactly {16, 18} — the two H.273 codes ProCore treats as "BT.2020-NCL 9-family":
  //   16 = SMPTE ST 2084 (PQ), 18 = ARIB STD-B67 (HLG).  @0xc2018..203b.
  if (((p ^ 0x9) | ((mappedTransfer & 0x1d) ^ 0x10)) === 0) {   // @0xc2018/201f..26/202a
    return { primaries: 0x9, transfer: t, matrix: 0x9 };        // @0xc202f/2034/2036
  }

  // ── Alias collapse: primaries==12 && (mappedTransfer & 0x1d) == 0x10  ->  (12, raw transfer, 1).
  //   Same PQ/HLG family, but under BT.2020 (12).  @0xc203d..2049 + shared 0xc1ff2 edx := 1.
  if (((p ^ 0xc) | ((mappedTransfer & 0x1d) ^ 0x10)) === 0) {   // @0xc203d orl %r9d,%r8d ; jne .skip
    return { primaries: 0xc, transfer: t, matrix: 0x1 };        // @0xc2042/2047 + @0xc1ff2 movl $0x1,%edx
  }

  // ── Generic tail. From here `matrix` was the original argument, `mappedTransfer` is ecx.
  //   @0xc204b testl %eax,%eax ; je 0xc2056
  if (m !== 0) {
    //  @0xc204f movl %eax,%edx ; @0xc2051 jmp .pack — return (primaries, mappedTransfer, matrix).
    return { primaries: p, transfer: mappedTransfer, matrix: m };
  }

  // matrix == 0:  derive matrix from primaries via two bitmask tests.
  //   @0xc205f movl $0x1802, %eax    ; bits {1, 11, 12}
  //   @0xc2064 btl  %edi, %eax ; jb 0xc1ff2
  if ((0x1802 >>> 0) & (1 << p)) {                              // p ∈ {1, 11, 12}
    // @0xc1ff2 movl $0x1, %edx ; jmp .pack — return (primaries, mappedTransfer, 1).
    return { primaries: p, transfer: mappedTransfer, matrix: 0x1 };
  }
  //   @0xc2069 movl $0x60, %eax      ; bits {5, 6}
  //   @0xc206e btl  %edi, %eax ; jae 0xc207d
  if ((0x60 >>> 0) & (1 << p)) {                                // p ∈ {5, 6}
    // @0xc2073 movl $0x6, %edx ; jmp .pack — return (primaries, mappedTransfer, 6).
    return { primaries: p, transfer: mappedTransfer, matrix: 0x6 };
  }
  //   @0xc207d cmpl $0x9, %edi ; jne .pack (matrix stays 2)
  if (p !== 0x9) {
    return { primaries: p, transfer: mappedTransfer, matrix: 0x2 };
  }
  //   @0xc2086 jmp 0xc2036 — landing MID-instruction at `movl %esi,%ecx ; movl $0x9,%edx ; jmp .pack`.
  //   Note this overwrites ecx with the RAW transfer (esi), so the returned transfer is `t`, not
  //   `mappedTransfer`. For t==14 that is the only observable difference here.
  return { primaries: 0x9, transfer: t, matrix: 0x9 };
}
