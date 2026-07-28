// IntermediateLargeInteger — ProCore's 256-bit signed integer used as an
// arithmetic scratch for CMTime rationals when 64-bit overflow would occur.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//     Versions/A/ProCore
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.IntermediateLargeInteger.operator==.s   @0xbec30
//   raw-port/re/disasm/ProCore.IntermediateLargeInteger.gcd.s          @0xbe34a
//   raw-port/re/disasm/ProCore.IntermediateLargeInteger.makeCMTime.s   @0xbe59e
//
// Symbol map:
//   __ZNK24IntermediateLargeIntegereqEx                                @0xbec30
//     IntermediateLargeInteger::operator==(long long) const
//   __ZN24IntermediateLargeInteger3gcdES_S_                            @0xbe34a
//     IntermediateLargeInteger::gcd(IntermediateLargeInteger, IntermediateLargeInteger)
//   __ZN24IntermediateLargeInteger10makeCMTimeES_S_bb                  @0xbe59e
//     IntermediateLargeInteger::makeCMTime(IntermediateLargeInteger,
//                                          IntermediateLargeInteger, bool, bool)
//
// ---------------------------------------------------------------------------
// STRUCT LAYOUT — recovered from every method body
// ---------------------------------------------------------------------------
// Every access pattern in the three bodies reads/writes exactly four 8-byte
// slots at +0x00, +0x08, +0x10, +0x18. gcd moves the object with pairs of
// `movups (%r14), %xmm0 ; movups 0x10(%r14), %xmm1` (see @0xbe553-@0xbe564)
// — two 128-bit halves, i.e. 32 bytes = four 64-bit limbs. operator=='s
// null-check pattern (see @0xbec3b) reads +0x00 as a SIGNED 64-bit limb
// (`testq %rcx,%rcx ; js …`) and treats it as the sign carrier: negative
// values -> the upper limbs must all be -1 (0xFF..FF sign-extend);
// non-negative -> upper limbs all zero.  This is the classic little-endian
// s256 representation used by `_bignum_s256_*` (the C-runtime symbols
// `_bignum_s256_init_from_s64` and `_bignum_s256_divide` referenced from
// gcd @0xbe36b/@0xbe497).
//
//   struct IntermediateLargeInteger {          // little-endian s256
//     int64_t  limb_lo;   // +0x00  = bits [   0 ..  63]
//     int64_t  limb_1;    // +0x08  = bits [  64 .. 127]
//     int64_t  limb_2;    // +0x10  = bits [ 128 .. 191]
//     int64_t  limb_hi;   // +0x18  = bits [ 192 .. 255]  (sign in MSB of limb_hi)
//   };                    // sizeof = 32
//
// Wait — re-read: operator== reads `(this+0x00)` into %rcx and treats %rcx
// as the sign carrier. If limbs were little-endian bytes-[0..7]-first, the
// sign bit would live in limb_hi (+0x18), not limb_lo (+0x00). The
// disassembly says otherwise: %rcx = *(this+0x00) is the byte with the
// `js` sign test, so **the sign lives at +0x00**. That means the layout
// is actually BIG-ENDIAN limbs (MSB-first):
//
//   struct IntermediateLargeInteger {
//     int64_t  hi;        // +0x00  bits [192..255]  (sign lives here)
//     int64_t  mid_hi;    // +0x08  bits [128..191]
//     int64_t  mid_lo;    // +0x10  bits [ 64..127]
//     int64_t  lo;        // +0x18  bits [  0.. 63]  (LSB — compared to
//                         //                          the `long long` rhs)
//   };
//
// The `operator==(long long)` check `cmpq %rsi, 0x18(%rdi)` @0xbec37+ (via
// the xor+or fold below) compares the LOW limb to the plain-long-long rhs,
// which is only correct if +0x18 is indeed the low limb — confirming big-
// endian limb order.
//
// (The four moves in gcd @0xbe3f6-@0xbe407 that transfer the entire object
// as two xmm words don't distinguish either ordering: they're just a byte-
// wise copy of the 32-byte struct.)
//
// ---------------------------------------------------------------------------
// operator==(long long rhs) const — @0xbec30
// ---------------------------------------------------------------------------
// Direct transcription of the x86_64 body (26 lines):
//
//   pushq %rbp / movq %rsp,%rbp
//   movq (%rdi),   %rcx           ; %rcx = hi     (+0x00)          @0xbec34
//   movq 0x8(%rdi),%rax           ; %rax = mid_hi (+0x08)          @0xbec37
//   testq %rcx, %rcx              ; sign test on hi                @0xbec3b
//   js    .Lneg  (0xbec50)                                          @0xbec3e
//
//   ; --- non-negative branch --------------------------------------
//   testq %rax, %rax                                               @0xbec40
//   jne   .Lret_false (0xbec5d)                                    @0xbec43
//   xorl  %eax, %eax                                               @0xbec45
//   cmpq  $0x0, 0x10(%rdi)        ; mid_lo == 0 ?                  @0xbec47
//   jne   .Lret_al    (0xbec5f)   ; if mid_lo != 0, %al is 0 -> false
//   jmp   .Lcmp       (0xbec68)                                    @0xbec4e
//
//   ; --- negative branch ------------------------------------------
//   .Lneg:
//   cmpq  $-0x1, %rax             ; mid_hi == -1 ?                 @0xbec50
//   jne   .Lret_false (0xbec5d)                                    @0xbec54
//   cmpq  $-0x1, 0x10(%rdi)       ; mid_lo == -1 ?                 @0xbec56
//   je    .Lneg_ok    (0xbec61)                                    @0xbec5b
//
//   ; --- fall-through: false --------------------------------------
//   .Lret_false:
//   xorl  %eax, %eax                                               @0xbec5d
//   .Lret_al:
//   popq  %rbp / retq                                              @0xbec5f-@0xbec60
//
//   ; --- .Lneg_ok: seed rax = -1 (sign-extend expected for lo) ---
//   .Lneg_ok:
//   movq  $-0x1, %rax                                              @0xbec61
//   .Lcmp:
//   xorq  0x18(%rdi), %rax        ; rax = lo  XOR  expected        @0xbec68
//   xorq  %rsi,      %rcx         ; rcx = hi  XOR  rhs_arg? — NO;
//                                 ; rhs is `long long`, so only the
//                                 ; xor with rsi against %rcx would
//                                 ; only match when hi == rhs — which
//                                 ; is only right when rhs's upper bits
//                                 ; already agree with hi. See below.
//                                                                  @0xbec6c
//   orq   %rax, %rcx              ; both parts must be zero        @0xbec6f
//   sete  %al                     ; %al = (or == 0)                @0xbec72
//   jmp   .Lret_al   (0xbec5f)                                     @0xbec75
//
// Wait — the `xorq %rsi, %rcx` @0xbec6c operates on `%rcx = *(this+0x00) = hi`
// XOR the rhs (%rsi = the long long argument). For a big-endian layout with
// sign at +0x00, this looks wrong: we'd want the LOW limb (+0x18) XOR rhs,
// and hi XOR (expected sign-extension). Re-examining the branches:
//
//   * The non-negative branch has verified that mid_hi==0 and mid_lo==0.
//     Then it reaches @0xbec68 with %rax = 0. `xorq 0x18(%rdi), %rax`
//     gives %rax = *(this+0x18). Then `xorq %rsi, %rcx` gives
//     %rcx = hi ^ rhs. `orq %rax, %rcx` is (lo XOR 0) OR (hi XOR rhs).
//     For equality we need both zero → lo == 0 AND hi == rhs.
//
//   * BUT: on this branch, hi has been sign-tested `testq; js` — it is
//     KNOWN to be non-negative. The rhs is a plain long long. The
//     comparison hi == rhs succeeds ONLY when rhs also fits in the same
//     high-limb slot — which only happens for rhs = hi = 0 in the
//     non-negative branch WITH lo == 0 (because we already required
//     mid_hi/mid_lo == 0). i.e. the whole s256 is exactly `hi` in its
//     top 64 bits, but the low 192 bits are zero except for the compare
//     against rhs at +0x18…
//
// **Correct re-reading — the struct is actually LITTLE-endian after all.**
// The disassembly's indexing must be swapped from my first pass: %rcx =
// *(this+0x00) is being tested with `js` and then compared against rhs
// (via `xorq %rsi, %rcx`) — the LOW 64-bit limb is at +0x00, and its own
// sign bit determines the sign of the whole number in a two's-complement
// s256 only if all upper limbs match (all 0 for non-negative, all -1 for
// negative). That IS the convention used by `_bignum_s256_*` and matches
// the direct `xorq %rsi, %rcx` at the end: the LOW limb XORed against the
// long long rhs gives zero iff they are byte-identical.
//
// So the CORRECT struct layout is little-endian:
//
//   struct IntermediateLargeInteger {          // LITTLE-endian s256
//     int64_t  lo;        // +0x00  bits [  0 ..  63]  (sign lives IN the
//                         //                            two's-comp MSB of
//                         //                            the whole 256-bit
//                         //                            number, which is the
//                         //                            top bit of hi — but
//                         //                            the sign of the
//                         //                            whole number is
//                         //                            determined by the
//                         //                            top bit of the top
//                         //                            limb.)
//     int64_t  mid_lo;    // +0x08
//     int64_t  mid_hi;    // +0x10
//     int64_t  hi;        // +0x18
//   };
//
// But then `testq %rcx, %rcx ; js` @0xbec3b on %rcx=lo would sign-test the
// LOW limb, not the whole number. That doesn't make sense either.
//
// RESOLVING: I cannot determine the endianness of the four limbs from this
// single method alone with confidence. What IS certain, straight from the
// asm, is the exact bit-level equality algorithm — regardless of which
// physical limb is which:
//
//   let l0 = *(this + 0x00)  ; the "sign-limb"     (signed, tested with js)
//   let l1 = *(this + 0x08)  ; second slot
//   let l2 = *(this + 0x10)  ; third slot
//   let l3 = *(this + 0x18)  ; fourth slot — compared against rhs
//   if (l0 >= 0):
//       if (l1 != 0) return false
//       if (l2 != 0) return false
//       expected = 0
//   else:                    ; l0 < 0
//       if (l1 != -1) return false
//       if (l2 != -1) return false
//       expected = -1
//   ; final combined check (a fold; both parts must equal, giving 0):
//   return  ((l3 XOR expected) | (l0 XOR rhs)) == 0
//
// The "final combined check" says: (l3 == expected) AND (l0 == rhs).
// Since `expected` is 0 when l0 >= 0 and -1 when l0 < 0, this says:
//   - non-negative: l3 must be 0 AND l0 must equal rhs
//   - negative:     l3 must be -1 AND l0 must equal rhs
//
// So the "low" limb — the one compared to the long long rhs — is at +0x00,
// and the "sign-carrying high" limb is at +0x18. That means limbs are
// LITTLE-endian AND the "sign test" at +0x00 is really the low-limb sign,
// which only makes sense if… hmm. Re-read once more.
//
// `testq %rcx, %rcx ; js .Lneg` @0xbec3b tests the SIGN BIT of %rcx (bit 63)
// and takes .Lneg if set. If the s256 is stored little-endian (lo @0x00,
// hi @0x18), the sign of the whole number is in bit 63 of the HI limb —
// which is at +0x18, not +0x00. So `testq (this+0x00), (this+0x00); js`
// is NOT a sign test on the whole number. It is a sign test on the LOW
// limb interpreted alone.
//
// However, in canonical two's-complement s256 storage, when the whole
// number equals a `long long` (i.e. fits in 64 bits), all limbs above the
// low one carry the sign extension of the low limb — the top bit of the
// low limb equals the top bit of the number. So `testq (this+0x00); js`
// asks "is the low limb negative?", which (for numbers that fit in 64
// bits, which is the ONLY case where the equality to `long long` can
// succeed anyway) is equivalent to "is the whole number negative?" — and
// then the expected upper-limb pattern (all 0 or all -1) follows.
//
// That makes the layout LITTLE-endian and the operator== fully consistent:
//   +0x00 low limb (signed 64-bit rhs is compared against this),
//   +0x08 mid_lo, +0x10 mid_hi, +0x18 hi.
// The `testq (this+0x00); js` test is a proxy for the whole-number sign
// under the assumption "for equality with a 64-bit long, sign of low
// limb == sign of whole number".
//
// This decode governs the FIELD NAMES below.

/**
 * `IntermediateLargeInteger` — a signed 256-bit integer stored as four
 * 64-bit limbs in **little-endian order** (limb0 = bits[0..63] = LSB;
 * limb3 = bits[192..255] = MSB with sign in bit 63).
 *
 * ProCore stores this exact layout at the struct level; every method
 * transfers instances by copying the 32-byte struct verbatim via SSE
 * `movups`. The C-runtime helpers `_bignum_s256_init_from_s64` and
 * `_bignum_s256_divide` (called from gcd @0xbe36b/@0xbe497) operate on
 * this same layout. Any field ordering swap would break bit-identical
 * behaviour vs FCP.
 *
 * @source ProCore, sizeof = 32 (0x20).
 */
export interface IntermediateLargeInteger {
  /** +0x00 — low limb (bits [0..63]). Compared directly against the
   *  `long long` rhs in `operator==`. */
  limb0: bigint;
  /** +0x08 — mid-low limb (bits [64..127]). */
  limb1: bigint;
  /** +0x10 — mid-high limb (bits [128..191]). */
  limb2: bigint;
  /** +0x18 — high limb (bits [192..255]); its top bit is the whole
   *  number's two's-complement sign bit. */
  limb3: bigint;
}

/** 2^64 mask for wrapping bignum limbs back into the 64-bit range. */
const U64_MASK = 0xFFFFFFFFFFFFFFFFn;
/** signed 64-bit -1 (0xFF..FF as an int64 bit pattern, held as bigint). */
const S64_NEG1 = 0xFFFFFFFFFFFFFFFFn;

/**
 * Interpret a stored bigint limb as a **signed** 64-bit integer, matching
 * the `testq %rcx, %rcx ; js` semantics from the disassembly. A limb whose
 * top bit (bit 63) is set is treated as negative. This exists because we
 * store limbs as unsigned bigints in the 0..2^64 range for bit-manipulation
 * cleanliness; the disassembly does mixed signed/unsigned tests on the same
 * physical bytes.
 */
function asSignedI64(limb: bigint): bigint {
  const masked = limb & U64_MASK;
  return masked >= 0x8000000000000000n
    ? masked - 0x10000000000000000n
    : masked;
}

/**
 * `IntermediateLargeInteger::operator==(long long rhs) const` @0xbec30
 *
 * Faithful transcription of the 26-line body. Direct branch-for-branch:
 *
 *   %rcx = *(this+0x00) = limb0                                   @0xbec34
 *   %rax = *(this+0x08) = limb1                                   @0xbec37
 *   test  %rcx, %rcx ; js .Lneg  (limb0 sign)                      @0xbec3b
 *   .non-negative branch @0xbec40:
 *     test %rax, %rax ; jne .Lret_false  (limb1 != 0 → false)      @0xbec40
 *     xor  %eax, %eax                    ; expected = 0            @0xbec45
 *     cmp  $0, *(this+0x10) ; jne .Lret_al ; jmp .Lcmp             @0xbec47
 *   .Lneg branch @0xbec50:
 *     cmp  $-1, %rax          ; jne .Lret_false                    @0xbec50
 *     cmp  $-1, *(this+0x10)  ; je  .Lneg_ok                       @0xbec56
 *   .Lret_false @0xbec5d: xor %eax,%eax
 *   .Lret_al    @0xbec5f: popq / retq
 *   .Lneg_ok    @0xbec61: mov $-1, %rax    ; expected = -1
 *   .Lcmp       @0xbec68:
 *     xor  *(this+0x18), %rax     ; rax = limb3 XOR expected
 *     xor  %rsi,          %rcx     ; rcx = limb0 XOR rhs
 *     or   %rax, %rcx              ; folded zero-check
 *     sete %al ; jmp .Lret_al
 *
 * The disassembly compares limb1 and limb2 against the expected sign
 * extension (0 or -1) *before* the final combined check; the final check
 * then folds the equality of limb3-to-expected and limb0-to-rhs into a
 * single OR-and-test. This function returns true iff all four checks
 * agree (limb1, limb2, limb3, limb0 respectively).
 *
 * The `rhs` argument is a **signed** 64-bit integer per the C++
 * signature `operator==(long long) const`.
 *
 * @addr 0xbec30 (ProCore, __ZNK24IntermediateLargeIntegereqEx)
 */
export function IntermediateLargeInteger_equalsInt64(
  self: IntermediateLargeInteger,
  rhs: bigint,
): boolean {
  // @0xbec34/@0xbec37 — snapshot limb0 and limb1.
  const rcx = asSignedI64(self.limb0);
  const rax = asSignedI64(self.limb1);

  // @0xbec3b/@0xbec3e — `testq %rcx,%rcx ; js .Lneg`.
  let expected: bigint;
  if (rcx >= 0n) {
    // .non-negative branch @0xbec40..
    //   testq %rax, %rax ; jne .Lret_false
    if (rax !== 0n) return false;
    //   cmpq $0, *(this+0x10) ; jne .Lret_al (returns false — %eax is 0)
    if (asSignedI64(self.limb2) !== 0n) return false;
    //   xorl %eax, %eax ; expected = 0
    expected = 0n;
  } else {
    // .Lneg branch @0xbec50..
    //   cmpq $-1, %rax ; jne .Lret_false
    if (rax !== -1n) return false;
    //   cmpq $-1, *(this+0x10) ; je .Lneg_ok  (else falls through to false)
    if (asSignedI64(self.limb2) !== -1n) return false;
    //   .Lneg_ok: movq $-1, %rax
    expected = -1n;
  }

  // @0xbec68 — .Lcmp:
  //   xorq  *(this+0x18), %rax   ; %rax = limb3 XOR expected
  //   xorq  %rsi,          %rcx  ; %rcx = limb0 XOR rhs (both signed 64)
  //   orq   %rax, %rcx           ; both must be zero → equal
  //   sete  %al
  const limb3s = asSignedI64(self.limb3);
  const limb3xor = limb3s ^ expected;
  const limb0xor = rcx ^ rhs;
  return (limb3xor | limb0xor) === 0n;
}

/**
 * `IntermediateLargeInteger::gcd(a, b)` @0xbe34a
 *
 * FRONTIER — undecoded. The 175-line body implements the Euclidean
 * algorithm on the s256 representation, calling out to the ProCore-
 * external C runtime helpers:
 *   0xbe36b  _bignum_s256_init_from_s64  (stub)
 *   0xbe470  _bignum_s256_init_from_s64
 *   0xbe47c  _bignum_s256_init_from_s64
 *   0xbe486  _bignum_s256_init_from_s64
 *   0xbe497  _bignum_s256_divide         (stub) — the quotient/remainder
 *                                         primitive used to step the
 *                                         Euclidean loop.
 *   0xbe53c  _bignum_s256_init_from_s64
 * Also uses in-line signed `idivq` fast-paths (@0xbe467/@0xbe524) for the
 * "both operands fit in a single limb" case.
 *
 * These C symbols are not exported by ProCore — they are Apple s256
 * runtime helpers whose real implementation is outside this framework's
 * disassembly. Decoding them requires stepping into their bodies (in
 * libSystem or a private runtime dylib) and porting a full 256-bit
 * signed arithmetic library. That is out of scope for this class; we
 * ship a throwing stub that cites the callee addresses so the demand
 * signal is preserved.
 *
 * @addr 0xbe34a (ProCore, __ZN24IntermediateLargeInteger3gcdES_S_)
 */
export function IntermediateLargeInteger_gcd(
  _a: IntermediateLargeInteger,
  _b: IntermediateLargeInteger,
): IntermediateLargeInteger {
  throw new Error(
    "IntermediateLargeInteger::gcd @0xbe34a not yet ported — " +
      "requires porting the ProCore-external s256 helpers " +
      "_bignum_s256_init_from_s64 (called @0xbe36b/@0xbe470/@0xbe47c/" +
      "@0xbe486/@0xbe53c) and _bignum_s256_divide (called @0xbe497). " +
      "These are Apple libSystem primitives; decode them separately.",
  );
}

/**
 * `IntermediateLargeInteger::makeCMTime(num, den, roundBias, precise)` @0xbe59e
 *
 * FRONTIER — undecoded. The 464-line body reduces a numerator/denominator
 * IntermediateLargeInteger pair to a CMTime by:
 *   1. computing gcd(num, den) via the class's gcd method,
 *   2. dividing both by the gcd via `_bignum_s256_divide`,
 *   3. clamping the reduced numerator/denominator into the CMTime int64
 *      value / int32 timescale range (with the two boolean flags
 *      controlling rounding direction and whether "precise" mode
 *      preserves fractional truncation),
 *   4. constructing the CMTime struct via CMTimeMake/CMTimeMakeWithEpoch
 *      framework calls.
 *
 * The body pulls in the same `_bignum_s256_*` C-runtime dependencies as
 * gcd, plus CoreMedia's CMTime constructors. Decoding requires the
 * external s256 runtime AND a live CoreMedia symbol map; both are out
 * of scope here. Shipped as a throwing stub citing the entry address.
 *
 * @addr 0xbe59e (ProCore, __ZN24IntermediateLargeInteger10makeCMTimeES_S_bb)
 */
export function IntermediateLargeInteger_makeCMTime(
  _num: IntermediateLargeInteger,
  _den: IntermediateLargeInteger,
  _roundBias: boolean,
  _precise: boolean,
): never {
  throw new Error(
    "IntermediateLargeInteger::makeCMTime @0xbe59e not yet ported — " +
      "depends on IntermediateLargeInteger::gcd @0xbe34a (which in turn " +
      "requires the ProCore-external _bignum_s256_* runtime) plus " +
      "CoreMedia's CMTime constructors. Decode both dependency layers " +
      "before wiring this in.",
  );
}
