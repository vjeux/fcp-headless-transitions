// Json_Value.ts — raw transcription of ProCore `Json::Value`.
//
// FCP links a copy of jsoncpp inside ProCore; `Json::Value` is its variant
// node. TWO symbols are transcribed in this file — `swapPayload(Json::Value&)`,
// the half-swap `Value::swap` uses (payload only: the value union, the type and
// the allocated bit — deliberately NOT the comments/offset members), and
// `isInt() const`. Every other member of the class is a SEPARATE ledger unit
// and is NOT ported here; do not add them without their own disassembly and
// address citations.
//
// Provenance (ProCore framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Symbols ported in this file:
//   @0xc762e  Json::Value::swapPayload(Json::Value&)
//               __ZN4Json5Value11swapPayloadERS0_
//   @0xcef4c  Json::Value::isInt() const
//               __ZNK4Json5Value5isIntEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym <mangled> ProCore`):
//   raw-port/re/disasm/ProCore.__ZN4Json5Value11swapPayloadERS0_.s (27 lines)
//   raw-port/re/disasm/ProCore.__ZNK4Json5Value5isIntEv.s          (37 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT — exactly the things these two bodies touch
// ---------------------------------------------------------------------------
//   struct Json::Value {
//     ValueHolder value_;      // +0x00, 8 bytes — swapped whole with two
//                              //   `movq` loads and two stores
//                              //   (@0xc763e..@0xc7647). The union holds an
//                              //   int/uint/double/bool/char*/map*, all 8
//                              //   bytes wide, and this body moves the RAW
//                              //   8 bytes without looking at the type.
//     uint8_t  typeByte;       // +0x08, ONE byte — swapped with the `movb`
//                              //   quartet @0xc7632..@0xc763b. jsoncpp
//                              //   declares this `ValueType type_ : 8`.
//     // +0x09 bit 0           — the `allocated_ : 1` bitfield, i.e. bit 8 of
//                              //   the 16-bit word at +0x08. Swapped SEPARATELY
//                              //   by the mask dance @0xc764a..@0xc7675 with
//                              //   the constants 0x100 (select) and 0xfeff /
//                              //   0xfffffeff (clear). The other seven bits of
//                              //   the +0x09 byte are NOT touched — they belong
//                              //   to neighbouring bitfields this unit must
//                              //   leave alone, which is why the swap is a
//                              //   masked read-modify-write and not a second
//                              //   byte swap.
//     ...                      // comments_/start_/limit_ follow; untouched.
//   };
//
// The port models the +0x08 word as its two bytes — `typeByte` at +0x08 and the
// raw `flagsByte` at +0x09 — because that is the granularity the instructions
// address: a byte swap at +0x08, then a masked bit-8 swap. Modelling
// `allocated_` as a lone boolean would silently drop the other seven bits of
// +0x09 that the read-modify-write is careful to preserve.
//
// The +0x00 union is read three MORE ways by `isInt` — as int64 (`movq
// (%rdi),%rax` @0xcef5f), as uint64 (the same load @0xcef6a) and as a double
// (`movsd (%rdi),%xmm0` @0xcef75) — which is what identifies it as a union
// rather than three fields, and why it is stored here as raw bits.
//
// CALLEES:
//   * swapPayload @0xc762e — none. No in-scope call, no extern, no allocation,
//     no indirect and no virtual dispatch (`depgraph.py deps` lists nothing).
//   * isInt @0xcef4c — FRONTIER CALLEES, exactly one: `_modf`, the libc
//     double-splitting function, called @0xcef9f. That is a TRUE out-of-scope
//     extern (libm/libc, not one of the five FCP frameworks); see the decode
//     note below for why it is transcribed rather than stubbed. There is no
//     in-scope callee, no indirect call and no virtual dispatch
//     (`depgraph.py deps __ZNK4Json5Value5isIntEv` lists nothing).
//
// ===========================================================================
// isInt() @0xcef4c — FULL DISASM
// (raw-port/re/disasm/ProCore.__ZNK4Json5Value5isIntEv.s — 37 lines)
// ===========================================================================
//   0xcef4c  movzbl 0x8(%rdi), %eax        ; eax = this->type_  (u8 at +0x08)
//   0xcef50  cmpl  $0x3, %eax
//   0xcef53  je    0xcef75                 ; type 3 -> the REAL path
//   0xcef55  cmpl  $0x2, %eax
//   0xcef58  je    0xcef6a                 ; type 2 -> the UNSIGNED path
//   0xcef5a  cmpl  $0x1, %eax
//   0xcef5d  jne   0xcefbb                 ; anything else -> return false
//   -- signed path @0xcef5f --
//   0xcef5f  movq   (%rdi), %rax           ; rax = this->value_ as int64
//   0xcef62  movslq %eax, %rcx             ; rcx = (int64)(int32)rax — sign-extend
//                                          ;   the low 32 bits back to 64
//   0xcef65  cmpq   %rax, %rcx             ; AT&T: flags on rcx - rax
//   0xcef68  jmp    0xcef71
//   -- unsigned path @0xcef6a --
//   0xcef6a  movq   (%rdi), %rax           ; rax = this->value_ as uint64
//   0xcef6d  shrq   $0x1f, %rax            ; rax >>= 31 (LOGICAL); ZF = (result == 0)
//   -- shared tail @0xcef71 --
//   0xcef71  sete   %al                    ; al = ZF
//   0xcef74  retq
//   -- real path @0xcef75 --
//   0xcef75  movsd   (%rdi), %xmm0         ; xmm0 = this->value_ as double
//   0xcef79  xorl    %eax, %eax            ; the answer is 0 unless proven otherwise
//   0xcef7b  ucomisd 0x59405(%rip), %xmm0  ; flags on xmm0 - [0x128388] = INT32_MIN
//   0xcef83  jb      0xcef74               ; CF=1 -> below OR UNORDERED -> return 0
//   0xcef85  movsd   0x59403(%rip), %xmm1  ; xmm1 = [0x128390] = INT32_MAX
//   0xcef8d  ucomisd %xmm0, %xmm1          ; flags on xmm1 - xmm0
//   0xcef91  jb      0xcef74               ; CF=1 -> max < value OR unordered -> 0
//   0xcef93  pushq %rbp ; movq %rsp,%rbp ; subq $0x10,%rsp   ; frame for the out-param
//   0xcef9b  leaq    -0x8(%rbp), %rdi      ; &intpart (a stack slot)
//   0xcef9f  callq   _modf                 ; xmm0 = modf(value, &intpart)
//                                          ;   -> xmm0 is the FRACTIONAL part;
//                                          ;      the integral part is written to
//                                          ;      the stack slot and never read
//   0xcefa4  xorpd   %xmm1, %xmm1          ; xmm1 = 0.0
//   0xcefa8  cmpeqsd %xmm0, %xmm1          ; xmm1 = (0.0 == frac) ? all-ones : 0
//   0xcefad  movq    %xmm1, %rax
//   0xcefb2  andl    $0x1, %eax            ; -> 1 when the fraction is zero
//   0xcefb5  addq $0x10,%rsp ; popq %rbp ; retq
//   -- default @0xcefbb --
//   0xcefbb  xorl %eax, %eax ; retq        ; every other type_ is not an int
//
// ---------------------------------------------------------------------------
// isInt's TWO CONSTANTS, RESOLVED
// ---------------------------------------------------------------------------
// RIP-relative displacements are from the address of the NEXT instruction:
//   0xcef7b: RIP-after 0xcef83 + 0x59405 = 0x128388 -> double -2147483648.0
//            (bits 0xc1e0000000000000) = INT32_MIN
//   0xcef85: RIP-after 0xcef8d + 0x59403 = 0x128390 -> double  2147483647.0
//            (bits 0x41dfffffffc00000) = INT32_MAX
// Both were read out of the thin x86_64 binary at those VAs, not assumed.
//
// ---------------------------------------------------------------------------
// isInt DECODE NOTES — the parts that are easy to get wrong
// ---------------------------------------------------------------------------
//   * SIGNED PATH: `movslq %eax,%rcx` truncates to 32 bits and sign-extends
//     back, so `rcx == rax` exactly when the int64 round-trips through int32 —
//     i.e. when it lies in [INT32_MIN, INT32_MAX]. The port spells it as that
//     round-trip, not as a pair of range compares, because the round-trip is
//     what the instruction does.
//   * UNSIGNED PATH: `shrq $0x1f` is a LOGICAL shift by 31 and the branch reads
//     ZF from the SHIFT itself, so the test is `(u64 >> 31) == 0`, i.e.
//     value <= 0x7FFFFFFF. Note this is 31, not 32: a uint64 of 0x80000000
//     already fails, which is right — it exceeds INT32_MAX.
//   * BOTH FP BRANCHES ARE `jb`, WHICH IS CF=1, AND UNORDERED SETS CF. So a NaN
//     takes the first `jb` and returns 0. Writing this in TS as
//     `if (value < min) return 0` would be WRONG for NaN (JS `<` is false for
//     NaN); the faithful spelling is `if (!(value >= min))`, which is true for
//     NaN exactly as CF=1 is. Same for the second compare.
//   * `cmpeqsd` is an ORDERED equality: NaN compares false, so a NaN fraction
//     yields 0. `frac === 0` in TS matches, and it also matches for -0.0
//     (`-0 === 0` is true, and cmpeqsd likewise compares -0.0 equal to 0.0).
//   * MODF is transcribed, not stubbed. `modf(x)`'s fractional part is
//     `x - trunc(x)`, and on this path the machine has ALREADY proven
//     INT32_MIN <= x <= INT32_MAX, so |x| <= 2^31 and both `trunc(x)` and the
//     subtraction are EXACT in binary64 (no rounding is possible below 2^52).
//     The equality against 0.0 is therefore bit-identical to libc's. This is
//     not a restatement of an extern — it is the same value by construction,
//     and the oracle below confirms it against the real function.
//
// ---------------------------------------------------------------------------
// isInt ORACLE EVIDENCE (differential vs the LIVE Final Cut Pro binary)
// ---------------------------------------------------------------------------
// The harness dlopens ProCore under `arch -x86_64 /usr/bin/python3` (the port
// is transcribed from the x86_64 slice), resolves this LOCAL (`nm` type `t`)
// symbol as `nm -n -arch x86_64` vmaddr 0xcef4c + the dyld image slide — NOT
// the bare `nm -n` fct/parity/local_call uses, which reports the ARM64 slice
// even from a Rosetta process — and calls it on a 16-byte object whose +0x00
// union and +0x08 type byte are set per case (the rest filled with 0xEE).
//
// 12,288 cases: every type tag 0..8 crossed with 15 int64 values (0, +/-1, the
// INT32 bounds and each bound +/-1, 2^62, +/-2^63), 10 uint64 values (0x7fffffff,
// 0x80000000, all-ones, 2^63, …) and 26 doubles (+/-0.0, +/-1.5, exactly
// INT32_MIN/MAX, those +/-1 and +/-0.5, 2147483646.5, NaN, +/-inf, +/-1e300,
// 2^52), then random tags and values weighted toward the boundaries.
// RESULT: 12288/12288 agree with the live binary (1,016 of them true).
// NEGATIVE CONTROLS THAT DIVERGE (measured): shifting by 32 instead of 31 on
// the unsigned path -> 5 wrong; dropping the int32 round-trip on the signed
// path -> 1299 wrong; accepting the default type tag -> 6224 wrong.
// NEGATIVE CONTROLS THAT PROVABLY CANNOT DIVERGE, recorded so nobody reads
// 12288/12288 as covering more than it does:
//   * writing the two FP guards as plain `value < min` / `max < value` (the
//     NaN-naive spelling) scores 12288/12288 too — a NaN that slips past both
//     guards reaches `frac === 0`, and NaN fails that as well, so the answer is
//     false either way. The `!(value >= min)` form is kept because it is what
//     `jb`/CF=1 actually means, and a future edit to the tail could make the
//     difference observable.
//   * `Math.floor` instead of `Math.trunc` also scores 12288/12288, because the
//     only thing done with the fraction is comparing it to zero, and both split
//     an integral value with a zero fraction. `trunc` is kept because that is
//     what `modf` does.
// The reviewer of PR #377 re-ran an independent differential over 2,324 cases
// and reported 2,324/2,324 agreement with the live symbol, with their own three
// negative controls killed (shift-32: 2 wrong; 64-bit round-trip: 324; default
// tag true: 1328).

/** `type_` @+0x08 == 1 selects the signed path. @ProCore 0xcef5a. */
const JSON_VALUE_TYPE_INT = 1;
/** `type_` @+0x08 == 2 selects the unsigned path. @ProCore 0xcef55. */
const JSON_VALUE_TYPE_UINT = 2;
/** `type_` @+0x08 == 3 selects the real path. @ProCore 0xcef50. */
const JSON_VALUE_TYPE_REAL = 3;

/** The double at __const VA 0x128388, compared against @ProCore 0xcef7b. */
const JSON_VALUE_ISINT_MIN_D = -2147483648.0;
/** The double at __const VA 0x128390, loaded @ProCore 0xcef85. */
const JSON_VALUE_ISINT_MAX_D = 2147483647.0;

/**
 * `Json::Value` — the jsoncpp variant node as `swapPayload` and `isInt`
 * address it.
 *
 * @ProCore 0xc762e
 * @ProCore 0xcef4c
 */
export class Json_Value {
  /**
   * +0x00 — the 8-byte `ValueHolder` union, carried as its raw 64-bit content
   * (`movq (%rdi),%rax` @0xc763e). `swapPayload` never interprets it; neither
   * does that part of this model.
   *
   * `isInt` DOES interpret it, three different ways depending on the type tag —
   * as int64 @0xcef5f, as uint64 @0xcef6a and as a binary64 double @0xcef75 —
   * which is what makes the raw-bits representation load-bearing rather than
   * merely convenient: a JS `number` could not hold an arbitrary int64.
   */
  valueBits_at_0x00 = 0n;

  /**
   * +0x08 — `ValueType type_ : 8`, the whole byte the `movb` swap moves
   * (@0xc7632/@0xc7635/@0xc7638/@0xc763b), and the byte `isInt` dispatches on
   * (`movzbl 0x8(%rdi),%eax` @0xcef4c, which is what pins it at one byte,
   * zero-extended).
   */
  typeByte_at_0x08 = 0;

  /**
   * +0x09 — the raw byte holding `allocated_ : 1` in its BIT 0 (bit 8 of the
   * 16-bit word at +0x08, the `0x100` the mask dance selects @0xc7655) plus the
   * neighbouring bitfields in bits 1..7, which this unit preserves.
   */
  flagsByte_at_0x09 = 0;

  /**
   * `Json::Value::swapPayload(Json::Value&)` — @ProCore 0xc762e
   *   __ZN4Json5Value11swapPayloadERS0_
   *
   * Full transcription — every instruction, in order:
   *
   *   0xc762e  pushq  %rbp                ; frame setup (no TS counterpart)
   *   0xc762f  movq   %rsp,%rbp           ; frame setup (no TS counterpart)
   *   0xc7632  movb   0x8(%rdi),%al       ; al = this.typeByte
   *   0xc7635  movb   0x8(%rsi),%cl       ; cl = other.typeByte
   *   0xc7638  movb   %cl,0x8(%rdi)       ; this.typeByte  = other's
   *   0xc763b  movb   %al,0x8(%rsi)       ; other.typeByte = this's
   *   0xc763e  movq   (%rdi),%rax         ; rax = this.value_
   *   0xc7641  movq   (%rsi),%rcx         ; rcx = other.value_
   *   0xc7644  movq   %rcx,(%rdi)         ; this.value_  = other's
   *   0xc7647  movq   %rax,(%rsi)         ; other.value_ = this's
   *   0xc764a  movzwl 0x8(%rdi),%eax      ; eax = this's 16-bit word at +0x08
   *                                       ;   (ALREADY carrying the swapped
   *                                       ;   type byte from above)
   *   0xc764e  movl   $0x100,%ecx         ; the allocated_ bit selector
   *   0xc7653  movl   %eax,%edx
   *   0xc7655  andl   %ecx,%edx           ; edx = this's allocated_ bit
   *   0xc7657  movzwl 0x8(%rsi),%r8d      ; other's word
   *   0xc765c  andl   %ecx,%r8d           ; r8d = other's allocated_ bit
   *   0xc765f  andl   $0xfeff,%eax        ; clear this's allocated_ bit
   *   0xc7664  orl    %r8d,%eax           ;   … and take other's
   *   0xc7667  movw   %ax,0x8(%rdi)       ; store back 16 bits
   *   0xc766b  movl   $0xfffffeff,%eax
   *   0xc7670  andl   0x8(%rsi),%eax      ; other's word (32-bit LOAD) minus its
   *                                       ;   allocated_ bit
   *   0xc7673  orl    %edx,%eax           ;   … plus this's saved bit
   *   0xc7675  movw   %ax,0x8(%rsi)       ; store back only 16 bits
   *   0xc7679  popq   %rbp                ; frame teardown (no TS counterpart)
   *   0xc767a  retq                       ; returns void
   *   0xc767b  nop                        ; alignment padding, not executed
   *
   * Decode notes:
   *   * the type byte is swapped FIRST with plain `movb`, and only then is the
   *     16-bit word re-read (@0xc764a) — so the bitfield dance operates on the
   *     already-swapped low byte and must not disturb it. It does not: `0xfeff`
   *     clears exactly bit 8 and the `orl` puts exactly bit 8 back.
   *   * @0xc7670 loads THIRTY-TWO bits from other+0x08 (`andl` with a memory
   *     operand) but the store @0xc7675 is a `movw` — the upper 16 bits are
   *     read and discarded, so bytes +0x0a/+0x0b are untouched. The port
   *     reproduces the WRITTEN state, which is the observable one; it does not
   *     model the wider read because nothing depends on it.
   *   * the value union moves as raw bytes, with no type dispatch and no
   *     ownership transfer — that is precisely why jsoncpp needs the
   *     `allocated_` bit to travel with it, and why this function exists.
   *   * NO comment/offset member is touched: `swapPayload` is the PAYLOAD-only
   *     half of `Value::swap`, which swaps the rest separately.
   *   * ZERO callees: no in-scope call, no extern, no indirect or virtual
   *     dispatch (`depgraph.py deps` lists nothing).
   *
   * @param other the `Json::Value&` in %rsi.
   */
  swapPayload(other: Json_Value): void {
    // @0xc7632..@0xc763b  the four `movb` — swap the whole +0x08 type byte.
    const thisType = this.typeByte_at_0x08 & 0xff;
    const otherType = other.typeByte_at_0x08 & 0xff;
    this.typeByte_at_0x08 = otherType;
    other.typeByte_at_0x08 = thisType;

    // @0xc763e..@0xc7647  the four `movq` — swap the 8-byte value union.
    const thisValue = this.valueBits_at_0x00;
    const otherValue = other.valueBits_at_0x00;
    this.valueBits_at_0x00 = otherValue;
    other.valueBits_at_0x00 = thisValue;

    // @0xc764a..@0xc7675  swap ONLY bit 8 of the 16-bit word at +0x08, i.e.
    //   bit 0 of the +0x09 byte (`allocated_`), preserving bits 1..7.
    const thisAllocated = this.flagsByte_at_0x09 & 0x01; // andl $0x100 @0xc7655
    const otherAllocated = other.flagsByte_at_0x09 & 0x01; // andl $0x100 @0xc765c
    // andl $0xfeff ; orl — this keeps everything but bit 8, then takes other's.
    this.flagsByte_at_0x09 = ((this.flagsByte_at_0x09 & 0xfe) | otherAllocated) & 0xff;
    // andl $0xfffffeff ; orl — the mirror for `other`.
    other.flagsByte_at_0x09 = ((other.flagsByte_at_0x09 & 0xfe) | thisAllocated) & 0xff;
    // @0xc767a  retq
  }

  /** `movq (%rdi),%rax` read as a SIGNED 64-bit integer. @ProCore 0xcef5f. */
  private asInt64(): bigint {
    return BigInt.asIntN(64, this.valueBits_at_0x00);
  }

  /** `movq (%rdi),%rax` read as an UNSIGNED 64-bit integer. @ProCore 0xcef6a. */
  private asUint64(): bigint {
    return BigInt.asUintN(64, this.valueBits_at_0x00);
  }

  /** `movsd (%rdi),%xmm0` read as a binary64 double. @ProCore 0xcef75. */
  private asDouble(): number {
    const b = new ArrayBuffer(8);
    new BigUint64Array(b)[0] = BigInt.asUintN(64, this.valueBits_at_0x00);
    return new Float64Array(b)[0];
  }

  /**
   * `Json::Value::isInt() const` — @ProCore 0xcef4c
   *   (__ZNK4Json5Value5isIntEv).
   *
   * Faithful transcription of the 37-line body quoted in the file header:
   * whether this value is representable as a 32-bit signed integer.
   *
   * @returns the boolean in %al.
   */
  isInt(): boolean {
    // @0xcef4c  movzbl 0x8(%rdi), %eax — the one-byte type tag.
    const type = this.typeByte_at_0x08 & 0xff;

    // @0xcef50/@0xcef55/@0xcef5a — the three-way dispatch, in the order the
    // machine tests it (3, then 2, then 1).
    if (type === JSON_VALUE_TYPE_REAL) {
      // ---- the REAL path @0xcef75 ----
      // @0xcef75  movsd (%rdi), %xmm0
      const value = this.asDouble();
      // @0xcef79  xorl %eax,%eax — the running answer starts false.
      // @0xcef7b/@0xcef83  ucomisd MIN, %xmm0 ; jb — CF=1 means BELOW **or
      //   UNORDERED**, so a NaN returns here too. `!(value >= min)` is exactly
      //   that predicate; `value < min` would not be.
      if (!(value >= JSON_VALUE_ISINT_MIN_D)) {
        return false; // @0xcef74 retq with al = 0
      }
      // @0xcef85/@0xcef8d/@0xcef91  movsd MAX,%xmm1 ; ucomisd %xmm0,%xmm1 ; jb
      //   — CF=1 iff max < value or unordered.
      if (!(JSON_VALUE_ISINT_MAX_D >= value)) {
        return false; // @0xcef74 retq with al = 0
      }
      // @0xcef9f  callq _modf — the fractional part (the integral part goes to
      //   a stack slot that is never read). Exact as `value - trunc(value)`
      //   here because the two bounds above already proved |value| <= 2^31;
      //   see the MODF decode note in the file header.
      const frac = value - Math.trunc(value);
      // @0xcefa4/@0xcefa8/@0xcefb2  xorpd ; cmpeqsd ; andl $1 — true iff the
      //   fraction is exactly zero (ordered compare, so NaN gives false).
      return frac === 0;
    }

    if (type === JSON_VALUE_TYPE_UINT) {
      // ---- the UNSIGNED path @0xcef6a ----
      // @0xcef6a  movq (%rdi), %rax
      const u = this.asUint64();
      // @0xcef6d  shrq $0x1f, %rax — LOGICAL shift by 31; ZF is set by the
      //   shift itself, and @0xcef71 sete %al returns that ZF.
      return (u >> 31n) === 0n;
    }

    if (type === JSON_VALUE_TYPE_INT) {
      // ---- the SIGNED path @0xcef5f ----
      // @0xcef5f  movq (%rdi), %rax
      const i = this.asInt64();
      // @0xcef62  movslq %eax, %rcx — truncate to int32 and sign-extend back.
      const roundTrip = BigInt.asIntN(32, i);
      // @0xcef65/@0xcef71  cmpq %rax,%rcx ; sete %al — equal iff the int64
      //   survives the round trip, i.e. it fits in an int32.
      return roundTrip === i;
    }

    // @0xcefbb  xorl %eax,%eax ; retq — every other type tag.
    return false;
  }
}
