// PCIsUsableNCLCCode.ts — ProCore free functions:
//   PCIsUsableNCLCCode(PCPrimariesValue, PCTransferFunctionValue, PCMatrixValue)  @ProCore 0xc2088
//   PCIsUsableNCLCCode(PCNCLCCode const&)                                          @ProCore 0xc20df
// Transcribed from the disassembly at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// See raw-port/re/disasm and grep on /tmp/ProCore_symmap.tsv.
//
// ROLE. Predicate used by ProCore's colour-management stack to decide whether a given ISO/IEC
// 23001-8 NCLC triple (primaries, transfer characteristic, matrix coefficient — the same three
// small-int codes that ride in an ISOBMFF `colr`/`nclc` box or an CMFormatDescription's
// kCMFormatDescriptionExtension_ColorPrimaries/TransferFunction/YCbCrMatrix triple) is one this
// build of FCP is prepared to render. Implementation is three flat byte-lookup tables in
// ProCore's __TEXT.__const segment:
//   supportedPrimariesTable  @ProCore 0x1282d0  (13 bytes, indexed 0..12)
//   supportedTransfersTable  @ProCore 0x1282e0  (19 bytes, indexed 0..18)
//   supportedMatricesTable   @ProCore 0x1282f3  (10 bytes, indexed 0..9)
// The value-args overload and the const-ref overload share the same predicate; the ref variant
// simply reads the three u32 fields out of PCNCLCCode and then evaluates the same expression.
//
// STRUCT LAYOUT — PCNCLCCode (12 bytes, recovered from the ref overload's field loads):
//   +0x00  primaries : u32       // movl (%rdi), %edx      @ProCore 0xc20e3
//   +0x04  transfer  : u32       // movl 0x4(%rdi), %ecx   @ProCore 0xc20eb
//   +0x08  matrix    : u32       // movl 0x8(%rdi), %edx   @ProCore 0xc2102
//
// The three ordinal spaces map to the ISO/IEC 23001-8 code points; enum-name aliases are
// provided below for readability but the on-the-wire values are the small ints the disassembly
// tests against.

/**
 * ISO/IEC 23001-8 colour_primaries value (see also H.273 §8.1). Stored as a u32 in PCNCLCCode.
 * The predicate below only inspects codes 0..12; any value above 12 is rejected as unsupported.
 */
export type PCPrimariesValue = number;

/**
 * ISO/IEC 23001-8 transfer_characteristics value (see also H.273 §8.2). Stored as a u32 in
 * PCNCLCCode. The predicate below only inspects codes 0..18; any value above 18 is rejected.
 */
export type PCTransferFunctionValue = number;

/**
 * ISO/IEC 23001-8 matrix_coeffs value (see also H.273 §8.3). Stored as a u32 in PCNCLCCode.
 * The predicate below only inspects codes 0..9; any value above 9 is rejected.
 */
export type PCMatrixValue = number;

/** PCNCLCCode — the 12-byte packed triple that ProCore hands around. */
export interface PCNCLCCode {
  /** +0x00  ISO/IEC 23001-8 colour_primaries. */
  primaries: PCPrimariesValue;
  /** +0x04  ISO/IEC 23001-8 transfer_characteristics. */
  transfer: PCTransferFunctionValue;
  /** +0x08  ISO/IEC 23001-8 matrix_coeffs. */
  matrix: PCMatrixValue;
}

/**
 * supportedPrimariesTable @ProCore 0x1282d0 (__TEXT.__const, 13 bytes).
 * Read verbatim out of the framework: file offset 924432 + (0x1282d0 - 0xe1b10) = 1215952.
 * Indexed 0..12 by ISO 23001-8 primaries code; a 1 byte means "this build accepts it".
 *   idx  0  1  2  3  4  5  6  7  8  9 10 11 12
 *   val  0  1  0  0  0  1  1  0  0  1  0  1  1
 * Non-zero codes: 1 (BT.709), 5 (BT.470BG), 6 (SMPTE 170M), 9 (BT.2020), 11 (SMPTE ST 428),
 * 12 (SMPTE RP 431). Code 0 ("reserved") and everything undefined by H.273 is rejected.
 */
export const supportedPrimariesTable: Readonly<Uint8Array> =
  new Uint8Array([0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1]);

/**
 * supportedTransfersTable @ProCore 0x1282e0 (__TEXT.__const, 19 bytes).
 * Read verbatim from the framework at file offset 1215968.
 * Indexed 0..18 by ISO 23001-8 transfer_characteristics code:
 *   idx  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18
 *   val  0  1  0  0  0  0  0  1  1  0  0  0  0  1  1  0  1  1  1
 * Non-zero codes: 1 (BT.709), 7 (SMPTE 240M), 8 (Linear), 13 (sRGB/IEC 61966-2-1), 14 (BT.2020
 * 10-bit), 16 (SMPTE ST 2084 / PQ), 17 (SMPTE ST 428), 18 (ARIB STD-B67 / HLG).
 */
export const supportedTransfersTable: Readonly<Uint8Array> =
  new Uint8Array([0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1]);

/**
 * supportedMatricesTable @ProCore 0x1282f3 (__TEXT.__const, 10 bytes).
 * Read verbatim from the framework at file offset 1215987.
 * Indexed 0..9 by ISO 23001-8 matrix_coeffs code:
 *   idx  0  1  2  3  4  5  6  7  8  9
 *   val  1  1  0  0  0  0  1  1  0  1
 * Non-zero codes: 0 (Identity/RGB), 1 (BT.709), 6 (SMPTE 170M), 7 (SMPTE 240M), 9 (BT.2020 NCL).
 */
export const supportedMatricesTable: Readonly<Uint8Array> =
  new Uint8Array([1, 1, 0, 0, 0, 0, 1, 1, 0, 1]);

/**
 * PCIsUsableNCLCCode(PCPrimariesValue, PCTransferFunctionValue, PCMatrixValue) @ProCore 0xc2088.
 * Returns true (1) iff all three ISO 23001-8 codes are within table bounds AND their respective
 * table entries are non-zero. Transcribed line-for-line from otool disasm:
 *
 *   0xc208c  xorl %eax, %eax                 ; retval = 0 (early-out default)
 *   0xc208e  cmpl $0xc, %edi                 ; primaries vs 12 (unsigned)
 *   0xc2091  ja   0xc20c9                    ; if (primaries > 12) return 0
 *   0xc2093  cmpl $0x12, %esi                ; transfer  vs 18 (unsigned)
 *   0xc2096  ja   0xc20c9                    ; if (transfer  > 18) return 0
 *   0xc2098  movl %edi, %ecx                 ; rcx = primaries (zero-ext)
 *   0xc209a  leaq supportedPrimariesTable(%rip), %rdi
 *   0xc20a1  cmpb $0x0, (%rcx,%rdi)          ; supportedPrimariesTable[primaries]
 *   0xc20a5  je   0xc20c9                    ; == 0 -> return 0
 *   0xc20a7  xorl %eax, %eax                 ; retval = 0
 *   0xc20a9  cmpl $0x9,  %edx                ; matrix   vs 9  (unsigned)
 *   0xc20ac  ja   0xc20c9                    ; if (matrix > 9) return 0
 *   0xc20ae  movl %esi, %ecx                 ; rcx = transfer (zero-ext)
 *   0xc20b0  leaq supportedTransfersTable(%rip), %rsi
 *   0xc20b7  cmpb $0x0, (%rcx,%rsi)          ; supportedTransfersTable[transfer]
 *   0xc20bb  je   0xc20c9                    ; == 0 -> return 0
 *   0xc20bd  movl %edx, %eax                 ; rax = matrix (zero-ext)
 *   0xc20bf  leaq supportedMatricesTable(%rip), %rcx
 *   0xc20c6  movb (%rax,%rcx), %al           ; al = supportedMatricesTable[matrix]
 *   0xc20c9  popq %rbp; retq                 ; return (byte -> C++ bool)
 *
 * The two `ja` (unsigned above) compares match AT&T dst-src order — `cmpl $0xc, %edi` computes
 * `edi - 0xc` and CF=0,ZF=0 iff edi > 12; per the ANTI_SHORTCUT cheat-sheet.
 */
export function PCIsUsableNCLCCode_values(
  primaries: PCPrimariesValue,
  transfer: PCTransferFunctionValue,
  matrix: PCMatrixValue,
): boolean {
  // Unsigned bounds tests (mirror `cmpl $imm, %reg ; ja` — reject codes outside the tables).
  if ((primaries >>> 0) > 0xc) return false;
  if ((transfer  >>> 0) > 0x12) return false;
  if ((matrix    >>> 0) > 0x9) return false;
  // Byte-lookup tests (mirror `cmpb $0x0, (%rcx,%rsi) ; je` — non-zero means accepted).
  if (supportedPrimariesTable[primaries >>> 0] === 0) return false;
  if (supportedTransfersTable[transfer  >>> 0] === 0) return false;
  return supportedMatricesTable[matrix >>> 0] !== 0;
}

/**
 * PCIsUsableNCLCCode(PCNCLCCode const&) @ProCore 0xc20df.
 * Reads the three u32 fields out of the referenced PCNCLCCode and evaluates the identical
 * predicate. Transcribed line-for-line from otool disasm:
 *
 *   0xc20e3  movl (%rdi), %edx               ; edx = code.primaries        (+0x00)
 *   0xc20e5  cmpq $0xc, %rdx                 ; primaries vs 12 (unsigned, 64-bit compare on the
 *                                            ;   zero-extended u32 -> semantically equivalent to
 *                                            ;   `cmpl $0xc, %edx` for values that fit in 32 bits)
 *   0xc20e9  ja   0xc2125                    ; if (primaries > 12) -> xorl %eax,%eax; ret (0)
 *   0xc20eb  movl 0x4(%rdi), %ecx            ; ecx = code.transfer         (+0x04)
 *   0xc20ee  xorl %eax, %eax                 ; retval = 0
 *   0xc20f0  cmpl $0x12, %ecx                ; transfer vs 18
 *   0xc20f3  ja   0xc2127                    ; if (transfer > 18) return 0
 *   0xc20f5  leaq supportedPrimariesTable(%rip), %rsi
 *   0xc20fc  cmpb $0x0, (%rdx,%rsi)          ; supportedPrimariesTable[primaries]
 *   0xc2100  je   0xc2127                    ; == 0 -> return 0
 *   0xc2102  movl 0x8(%rdi), %edx            ; edx = code.matrix           (+0x08)
 *   0xc2105  xorl %eax, %eax                 ; retval = 0
 *   0xc2107  cmpl $0x9, %edx                 ; matrix vs 9
 *   0xc210a  ja   0xc2127                    ; if (matrix > 9) return 0
 *   0xc210c  leaq supportedTransfersTable(%rip), %rsi
 *   0xc2113  cmpb $0x0, (%rcx,%rsi)          ; supportedTransfersTable[transfer]
 *   0xc2117  je   0xc2127                    ; == 0 -> return 0
 *   0xc2119  leaq supportedMatricesTable(%rip), %rax
 *   0xc2120  movb (%rdx,%rax), %al           ; al = supportedMatricesTable[matrix]
 *   0xc2123  jmp  0xc2127
 *   0xc2125  xorl %eax, %eax                 ; primaries-out-of-range early-out lands here
 *   0xc2127  popq %rbp; retq
 *
 * Note the primaries-out-of-range branch at 0xc2125 lands on a SEPARATE `xorl %eax,%eax` from the
 * one at 0xc20ee — the codegen zero-extends the return in both control paths before the shared
 * epilogue. Behaviour is identical to a single early return of 0.
 */
export function PCIsUsableNCLCCode(code: PCNCLCCode): boolean {
  // Transcribed directly from 0xc20df — the ref overload does NOT tail-call the value overload
  // at the binary level; it inlines the three lookups against the same __TEXT.__const tables.
  const primaries = code.primaries >>> 0;   // movl (%rdi), %edx   @0xc20e3
  if (primaries > 0xc) return false;         // cmpq $0xc, %rdx ; ja @0xc20e5..e9
  const transfer = code.transfer >>> 0;      // movl 0x4(%rdi), %ecx @0xc20eb
  if (transfer > 0x12) return false;         // cmpl $0x12, %ecx ; ja @0xc20f0..f3
  if (supportedPrimariesTable[primaries] === 0) return false;   // cmpb ; je @0xc20fc..0100
  const matrix = code.matrix >>> 0;          // movl 0x8(%rdi), %edx @0xc2102
  if (matrix > 0x9) return false;            // cmpl $0x9, %edx ; ja @0xc2107..0a
  if (supportedTransfersTable[transfer] === 0) return false;    // cmpb ; je @0xc2113..17
  return supportedMatricesTable[matrix] !== 0;                  // movb (%rdx,%rax), %al @0xc2120
}

/**
 * `operator<(PCNCLCCode const& lhs, PCNCLCCode const& rhs)` — the free ADL comparator
 * that libc++ picks up so `std::less<PCNCLCCode>` (used by `std::set<PCNCLCCode>` and
 * `std::map<PCNCLCCode, T>` in ProCore's colour-cache layer) can order two triples.
 *
 * Symbol: __ZltRK10PCNCLCCodeS1_   @ProCore 0xc22bd
 * Disasm: raw-port/re/disasm/ProCore.__ZltRK10PCNCLCCodeS1_.s (14 lines total).
 *
 * Byte-exact transcription:
 *
 *   0xc22bd  pushq %rbp
 *   0xc22be  movq  %rsp, %rbp
 *   0xc22c1  movl  (%rsi), %eax            ; eax = rhs->primaries          (+0x00)
 *   0xc22c3  cmpl  %eax, (%rdi)            ; flags = lhs->primaries - eax  (AT&T: dst-src)
 *   0xc22c5  jne   0xc22d5                 ; if (lhs.p != rhs.p) go to setl using THOSE flags
 *   0xc22c7  movl  0x4(%rsi), %eax         ; eax = rhs->transfer           (+0x04)
 *   0xc22ca  cmpl  %eax, 0x4(%rdi)         ; flags = lhs->transfer - eax
 *   0xc22cd  jne   0xc22d5                 ; if (lhs.t != rhs.t) go to setl
 *   0xc22cf  movl  0x8(%rdi), %eax         ; eax = lhs->matrix             (+0x08)
 *   0xc22d2  cmpl  0x8(%rsi), %eax         ; flags = eax - rhs->matrix = lhs.m - rhs.m
 *   0xc22d5  setl  %al                     ; al = 1 iff signed-less (SF^OF == 1)
 *   0xc22d8  popq  %rbp
 *   0xc22d9  retq
 *
 * The three `cmpl`s all leave SF/OF set by `lhs.<field> - rhs.<field>` (AT&T is `dst - src`):
 *   - @0xc22c3 `cmpl %eax, (%rdi)` computes `(%rdi) - %eax` = `lhs.p - rhs.p`  → setl → lhs.p < rhs.p
 *   - @0xc22ca `cmpl %eax, 0x4(%rdi)` computes `lhs.t - rhs.t`                 → setl → lhs.t < rhs.t
 *   - @0xc22d2 `cmpl 0x8(%rsi), %eax` computes `eax - 0x8(%rsi)` = `lhs.m - rhs.m` → setl → lhs.m < rhs.m
 *
 * Semantics: strict lexicographic less-than on (primaries, transfer, matrix), comparing each
 * u32 field with SIGNED order (the disasm uses `setl`, not `setb`). Two triples with all
 * three fields equal fall through to the third `cmpl` which yields zero (equal), so `setl`
 * returns 0 — i.e. `!(a < b)` and `!(b < a)` together imply equality, giving `std::less` a
 * total order suitable for RB-tree keying.
 *
 * The three fields hold ISO/IEC 23001-8 code points (small u32s in the range 0..18). Signed
 * vs unsigned comparison is observably identical for values ≤ 0x7fffffff, but the port
 * preserves the SIGNED comparison the codegen chose so the ordering stays bit-exact with
 * the binary at any input.
 *
 * NO callees — no in-scope deps. The function reads six int32s and returns a bool.
 */
export function PCNCLCCode_operator_lt(lhs: PCNCLCCode, rhs: PCNCLCCode): boolean {
  // @0xc22c1  eax = rhs.primaries.
  // @0xc22c3  cmpl %eax, (%rdi)   ; flags = lhs.p - rhs.p (AT&T: dst - src).
  // @0xc22c5  jne  0xc22d5        ; if (lhs.p != rhs.p) skip to setl with these flags.
  const lp = lhs.primaries | 0;
  const rp = rhs.primaries | 0;
  if (lp !== rp) {
    // @0xc22d5 setl (signed less) on (lhs.p - rhs.p).
    return lp < rp;
  }
  // @0xc22c7  eax = rhs.transfer.
  // @0xc22ca  cmpl %eax, 0x4(%rdi) ; flags = lhs.t - rhs.t.
  // @0xc22cd  jne  0xc22d5         ; if (lhs.t != rhs.t) skip to setl with these flags.
  const lt = lhs.transfer | 0;
  const rt = rhs.transfer | 0;
  if (lt !== rt) {
    // @0xc22d5 setl on (lhs.t - rhs.t).
    return lt < rt;
  }
  // @0xc22cf  eax = lhs.matrix.
  // @0xc22d2  cmpl 0x8(%rsi), %eax ; flags = eax - rhs.m = lhs.m - rhs.m.
  // @0xc22d5  setl on those flags.
  const lm = lhs.matrix | 0;
  const rm = rhs.matrix | 0;
  return lm < rm;
}

/**
 * `operator==(PCNCLCCode const& lhs, PCNCLCCode const& rhs)` — free ADL equality
 * comparator that libc++ picks up for `std::equal_to<PCNCLCCode>` (used e.g. by the
 * hash-based caches ProCore keys by NCLC triple).
 *
 * Symbol: __ZeqRK10PCNCLCCodeS1_   @ProCore 0xc2286
 * Disasm: raw-port/re/disasm/ProCore.__ZeqRK10PCNCLCCodeS1_.s (10 instructions).
 *
 * Byte-exact transcription:
 *
 *   0xc2286  pushq %rbp
 *   0xc2287  movq  %rsp, %rbp
 *   0xc228a  movq  (%rdi), %rax             ; rax = *(u64*)(lhs)   → lo=lhs.primaries, hi=lhs.transfer
 *   0xc228d  xorq  (%rsi), %rax             ; rax ^= *(u64*)(rhs)  → zero iff both u32s match
 *   0xc2290  movl  0x8(%rdi), %ecx          ; ecx = lhs.matrix     (+0x08)
 *   0xc2293  xorl  0x8(%rsi), %ecx          ; ecx ^= rhs.matrix    → zero iff matrix matches
 *   0xc2296  orq   %rax, %rcx               ; rcx = rax | rcx      → zero iff ALL three fields match
 *   0xc2299  sete  %al                      ; al = (rcx == 0)
 *   0xc229c  popq  %rbp
 *   0xc229d  retq
 *
 * The codegen exploits the packed 12-byte layout: primaries at +0x00 and transfer at +0x04
 * are read as ONE 8-byte load, XOR'd against the other side; the low u32 of the XOR reflects
 * primaries-difference, the high u32 reflects transfer-difference; either being non-zero makes
 * the qword non-zero. The matrix field at +0x08 is compared with a separate 4-byte XOR, then
 * OR'd in — the final `sete` returns true iff every bit is zero, i.e. every field is equal.
 *
 * Because XOR is bit-exact regardless of signed/unsigned interpretation, the resulting boolean
 * is `lhs.primaries == rhs.primaries && lhs.transfer == rhs.transfer && lhs.matrix == rhs.matrix`
 * for any u32 (or i32) input. NO callees, no in-scope deps, no externs.
 */
export function PCNCLCCode_operator_eq(lhs: PCNCLCCode, rhs: PCNCLCCode): boolean {
  // @0xc228a movq (%rdi), %rax        ; low u32=primaries, high u32=transfer.
  // @0xc228d xorq (%rsi), %rax        ; rax = 0 iff BOTH primaries and transfer match.
  //   Faithful decomposition: JS doesn't have real 64-bit ints in a Number, but the two
  //   halves of the qword XOR correspond exactly to XOR'ing each u32 field.
  const primariesDiff = (lhs.primaries ^ rhs.primaries) | 0;    // low half of qword XOR
  const transferDiff  = (lhs.transfer  ^ rhs.transfer)  | 0;    // high half of qword XOR

  // @0xc2290 movl 0x8(%rdi), %ecx
  // @0xc2293 xorl 0x8(%rsi), %ecx     ; ecx = 0 iff matrix matches.
  const matrixDiff = (lhs.matrix ^ rhs.matrix) | 0;

  // @0xc2296 orq %rax, %rcx           ; combined = 0 iff ALL three field-diffs are 0.
  // @0xc2299 sete %al                 ; true iff combined == 0.
  return (primariesDiff | transferDiff | matrixDiff) === 0;
}
