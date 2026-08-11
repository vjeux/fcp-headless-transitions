// hg_span_read_1h.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * hg_span_read_1h(float vector[4]*, int, void const*)   @Helium 0x1e6d00
//     __ZL15hg_span_read_1hPDv4_fiPKv
//
// A FREE function with internal linkage (the `__ZL` prefix / `nm` class `t`), so per
// PORTING_SPEC's naming rule the file is named after the function itself, matching the landed
// sibling `hg_span_read_null.ts` @0x1e8f90 in this same span-reader family.
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZL15hg_span_read_1hPDv4_fiPKv.s  (47 instructions)
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// NONE. No callq, no vtable dispatch; the only non-register operands are two rip-relative
// constant vectors. `depgraph.py deps __ZL15hg_span_read_1hPDv4_fiPKv` reports nothing.
//
// -----------------------------------------------------------------------------
// WHAT IT DOES
// -----------------------------------------------------------------------------
// Expands a span of `count` IEEE half-precision (binary16) samples into `count` RGBA float4
// vectors: each output is (half, 0.0, 0.0, 1.0) — a ONE-CHANNEL source read, hence `_1h`.
//
// It does NOT call a half-to-float conversion. It builds the float32 bit pattern by hand with a
// shift and a mask and then rescales, and THAT MATTERS: the trick is exact for zeros, denormals
// and normals but does NOT reproduce Inf/NaN, and the port must reproduce the trick, not the
// intent (PORTING_SPEC Rule 1). Measured on the live function (see ORACLE):
//     half +Inf 0x7c00 -> 65536      half -Inf 0xfc00 -> -65536
//     half  NaN 0x7e00 -> 98304      half max normal 0x7bff -> 65504
// A "correct" half decoder would answer Infinity/NaN here and diverge from FCP.
//
// -----------------------------------------------------------------------------
// FULL DISASM (@0x1e6d00..@0x1e6db8)
// -----------------------------------------------------------------------------
//   0x1e6d00  testl %esi, %esi                    ; count
//   0x1e6d02  jle   0x1e6db8                      ; SIGNED <= 0 -> return, no frame, no write
//   0x1e6d08  pushq %rbp ; movq %rsp,%rbp
//   0x1e6d0c  testb $0x1, %sil                    ; count odd?
//   0x1e6d10  jne   0x1e6d1e                      ;   -> peel one sample first
//   0x1e6d12  movl  %esi, %eax                    ; even: eax = count
//   0x1e6d14  cmpl  $0x1, %esi
//   0x1e6d17  jne   0x1e6d51                      ;   (always taken for an even count > 0)
//   0x1e6d19  jmp   0x1e6db7
//   -- the peeled odd sample --
//   0x1e6d1e  movswl (%rdx), %eax                 ; SIGN-extend the 16-bit half
//   0x1e6d21  shll  $0xd, %eax                    ; << 13
//   0x1e6d24  andl  $0x8fffe000, %eax             ; keep bit 31 (sign) and bits 27..13
//   0x1e6d29  movdqa 0x678b5f(%rip), %xmm0        ; = @Helium 0x85f890 (the base vector)
//   0x1e6d31  pinsrd $0x0, %eax, %xmm0            ; lane 0 = the constructed bit pattern
//   0x1e6d37  mulps 0x678b62(%rip), %xmm0         ; = @Helium 0x85f8a0 (2^112 in all 4 lanes)
//   0x1e6d3e  movaps %xmm0, (%rdi)                ; store one float4
//   0x1e6d41  addq  $0x10, %rdi                   ; dst++
//   0x1e6d45  addq  $0x2, %rdx                    ; src++ (2 bytes per half)
//   0x1e6d49  leal  -0x1(%rsi), %eax              ; eax = count - 1
//   0x1e6d4c  cmpl  $0x1, %esi
//   0x1e6d4f  je    0x1e6db7                      ; count == 1 -> done
//   -- the two-at-a-time loop --
//   0x1e6d51  decl  %eax                          ; eax = (odd ? count-2 : count-1)
//   0x1e6d53  xorl  %ecx, %ecx                    ; rcx = byte offset into src
//   0x1e6d55  movdqa 0x678b33(%rip), %xmm0        ; the SAME 0x85f890, hoisted
//   0x1e6d5d  movaps 0x678b3c(%rip), %xmm1        ; the SAME 0x85f8a0, hoisted
//   0x1e6d70  movswl (%rdx,%rcx), %esi            ; sample A
//   0x1e6d74  shll  $0xd, %esi
//   0x1e6d77  andl  $0x8fffe000, %esi
//   0x1e6d7d  movdqa %xmm0, %xmm2
//   0x1e6d81  pinsrd $0x0, %esi, %xmm2
//   0x1e6d87  mulps %xmm1, %xmm2
//   0x1e6d8a  movaps %xmm2, (%rdi,%rcx,8)         ; dst[+0]  (rcx counts SRC bytes; x8 = x16/half)
//   0x1e6d8e  movswl 0x2(%rdx,%rcx), %esi         ; sample B
//   0x1e6d93  shll  $0xd, %esi
//   0x1e6d96  andl  $0x8fffe000, %esi
//   0x1e6d9c  movdqa %xmm0, %xmm2
//   0x1e6da0  pinsrd $0x0, %esi, %xmm2
//   0x1e6da6  mulps %xmm1, %xmm2
//   0x1e6da9  movaps %xmm2, 0x10(%rdi,%rcx,8)     ; dst[+1]
//   0x1e6dae  addq  $0x4, %rcx                    ; two halves consumed
//   0x1e6db2  addl  $-0x2, %eax
//   0x1e6db5  jb    0x1e6d70                      ; see THE LOOP COUNTER below
//   0x1e6db7  popq  %rbp
//   0x1e6db8  retq
//
// THE LOOP COUNTER. `addl $-0x2, %eax` is an ADDITION of 0xfffffffe, so it sets CF when the
// unsigned addition CARRIES OUT, which happens exactly when the pre-add %eax >= 2. `jb` tests
// CF, so the back edge is taken while the counter was >= 2 — a do/while that runs the body once
// and then continues while at least two more samples remain. Both entry values are odd
// (count-1 for an even count, count-2 for an odd one), so the loop consumes the remaining
// samples exactly two at a time and cannot overrun. Verified live for counts 0..9: nothing is
// ever written past `count` float4s.
//
// THE BIT TRICK, derived. `movswl` sign-extends the half, so after `shll $13` bit 31 holds the
// half's sign bit (every bit at or above 15 was a copy of it). The mask keeps bit 31 and bits
// 27..13 and clears everything else, so the assembled dword is
//     sign | (half_exponent << 23) | (half_mantissa << 13)
// i.e. a float32 whose exponent FIELD equals the half's 5-bit exponent. A normal half is
// 2^(e-15) * 1.m and this dword is 2^(e-127) * 1.m — smaller by exactly 2^112 — which is what
// the `mulps` puts back. It is exact for normals, and it also happens to be exact for zeros and
// for denormals (a zero exponent field makes the dword a float32 denormal whose value is
// m * 2^-136, and m * 2^-136 * 2^112 = m * 2^-24, which is precisely the half denormal). It is
// NOT exact for e = 31: Inf/NaN become large finite numbers, as measured above.
//
// THE TWO CONSTANT VECTORS (rip target = next-instruction address + displacement; each read
// straight out of the x86_64 slice):
//   @0x1e6d29 -> 0x1e6d31 + 0x678b5f = @Helium 0x85f890
//        = { 0x00000000, 0x00000000, 0x00000000, 0x07800000 } = { 0, 0, 0, 2^-112 }
//   @0x1e6d37 -> 0x1e6d3e + 0x678b62 = @Helium 0x85f8a0
//        = { 0x77800000 x4 } = { 2^112, 2^112, 2^112, 2^112 }
//   (the loop's two loads at @0x1e6d55/@0x1e6d5d resolve to the SAME two addresses)
// So lanes 1 and 2 are 0 * 2^112 = +0.0, and lane 3 is 2^-112 * 2^112 = exactly 1.0 — both
// products are exact, which is why the constant is written as a scaled 1.0 rather than as 1.0.
// The port performs the multiplies rather than hard-coding 0/0/1, because the multiply is what
// the instruction does.
//
// -----------------------------------------------------------------------------
// ORACLE — EXHAUSTIVE, 0 divergences
// -----------------------------------------------------------------------------
// raw-port/re/oracle/hg_span_read_1h_oracle.py. Internal-linkage symbol, so it is called at
// x86_64 vmaddr + the loaded image's slide, under `arch -x86_64 /usr/bin/python3` so dyld maps
// the x86_64 slice these addresses come from (OPS_LOG "wrong architecture").
//
//   * ALL 65,536 half bit patterns in one span -> 262,144 output floats compared BIT-EXACTLY
//     (hex bit patterns, so signed zero is distinguished): 0 divergences. This is what pins the
//     Inf/NaN/denormal behaviour above rather than assuming it.
//   * counts 0, -1, -7 and 1..9 against a 16-byte-aligned destination pre-filled with a -777.0
//     sentinel: 0 divergences and 0 writes past the span, exercising the odd peel and the
//     count-down-by-2 loop.
//   * the SHIPPED TS port below, driven over the identical inputs through
//     raw-port/re/oracle/hg_span_read_1h_driver.ts: 13 spans, 262,740 output floats, 0
//     divergences from the live function.
// NEGATIVE CONTROLS over all 65,536 halves: dropping the 0x8fffe000 mask — 32,768 caught;
// zero-extending instead of `movswl` — 32,768; shifting by 12 instead of 13 — 65,534; omitting
// the 2^112 multiply — 131,070.
// (Scored on the first 1,024 halves the first two controls read ZERO, because that prefix is
// entirely sign-bit-clear and mask-safe. A dead control means the corpus is wrong, not that the
// mutant is harmless — see the OPS_LOG entry.)

/** Single-precision helper: `mulps` rounds each binary32 lane to nearest-even. */
const f32 = Math.fround;

/**
 * The base vector at @Helium 0x85f890, loaded by `movdqa` @0x1e6d29 / @0x1e6d55. Lane 0 is
 * overwritten by the `pinsrd`; lanes 1..3 survive into the multiply.
 */
const BASE_LANE1 = f32(0.0); // 0x00000000
const BASE_LANE2 = f32(0.0); // 0x00000000
/** 0x07800000 = 2^-112 — exactly cancels the scale below, yielding 1.0 in the alpha lane. */
const BASE_LANE3 = 1.9259299443872359e-34;

/** @Helium 0x85f8a0 — 0x77800000 = 2^112, in all four lanes (`mulps` @0x1e6d37 / @0x1e6d87). */
const SCALE = 5.192296858534828e33;

/**
 * Scratch used to reinterpret the assembled dword as a float32 — the `pinsrd $0x0` lane write
 * (@0x1e6d31 / @0x1e6d81 / @0x1e6da0), which deposits raw BITS into the vector rather than
 * converting a value.
 */
const SCRATCH_BUF = new ArrayBuffer(4);
const SCRATCH_U32 = new Uint32Array(SCRATCH_BUF);
const SCRATCH_F32 = new Float32Array(SCRATCH_BUF);

/**
 * `hg_span_read_1h(float vector[4]* dst, int count, void const* src)` — @Helium 0x1e6d00
 *   (__ZL15hg_span_read_1hPDv4_fiPKv)
 *
 * Expands `count` binary16 samples from `src` into `count` consecutive float4 vectors in `dst`,
 * each (sample, 0.0, 0.0, 1.0). See the file header for the full listing, the derivation of the
 * shift-mask-scale trick, its Inf/NaN behaviour, and the exhaustive differential.
 *
 * @param dst   %rdi — destination, indexed in float32 LANES (4 per output vector).
 * @param count %esi — number of samples; a SIGNED test, so 0 or negative writes nothing.
 * @param src   %rdx — the sample bytes, 2 per sample, little-endian (a `void const*` in C, so a
 *                     DataView here: the machine advances this pointer by BYTES).
 */
export function hg_span_read_1h(
  dst: Float32Array,
  count: number,
  src: DataView,
): void {
  // @0x1e6d00 testl %esi,%esi ; @0x1e6d02 jle — a SIGNED early-out, before the frame exists.
  if ((count | 0) <= 0) {
    return; // @0x1e6db8 retq — nothing is written
  }

  /**
   * One sample: `movswl` ; `shll $0xd` ; `andl $0x8fffe000` ; `pinsrd $0,…` ; `mulps`.
   * Written out once because the body emits it three times verbatim (@0x1e6d1e, @0x1e6d70,
   * @0x1e6d8e) with only the register allocation differing.
   */
  const expand = (dstLane: number, srcByte: number): void => {
    // @0x1e6d1e movswl (%rdx),%eax — a SIGN-extending 16-bit load; getInt16 is exactly that.
    const sext = src.getInt16(srcByte, true);
    // @0x1e6d21 shll $0xd  ; @0x1e6d24 andl $0x8fffe000 — keep bit 31 and bits 27..13.
    //   `<< 13` in JS operates on the ToInt32 of the operand, i.e. on the same 32-bit value
    //   `movswl` produced, and `>>> 0` reads the result back as the unsigned bit pattern.
    const bits = ((sext << 13) & 0x8fffe000) >>> 0;
    // @0x1e6d31 pinsrd $0x0 — the dword becomes LANE 0 of the vector, reinterpreted as float32.
    SCRATCH_U32[0] = bits;
    const lane0 = SCRATCH_F32[0];
    // @0x1e6d37 mulps — all four lanes are multiplied; lanes 1..3 come from the base vector.
    //   Lane 3 is 2^-112 * 2^112 = exactly 1.0 and lanes 1..2 are 0 * 2^112 = +0.0, but the
    //   port performs the multiply because that is the instruction.
    dst[dstLane + 0] = f32(lane0 * SCALE);
    dst[dstLane + 1] = f32(BASE_LANE1 * SCALE);
    dst[dstLane + 2] = f32(BASE_LANE2 * SCALE);
    dst[dstLane + 3] = f32(BASE_LANE3 * SCALE);
  };

  let dstLane = 0; // %rdi, in float32 lanes rather than bytes
  let srcByte = 0; // %rdx, in bytes — the machine really does index this by bytes
  let counter: number; // %eax

  // @0x1e6d0c testb $0x1,%sil ; @0x1e6d10 jne — an odd count peels ONE sample first, so the
  // main loop always has an even number left.
  if ((count & 1) !== 0) {
    // @0x1e6d1e..@0x1e6d3e — the peeled sample.
    expand(dstLane, srcByte);
    dstLane += 4; // @0x1e6d41 addq $0x10,%rdi
    srcByte += 2; // @0x1e6d45 addq $0x2,%rdx
    // @0x1e6d49 leal -0x1(%rsi),%eax ; @0x1e6d4c cmpl $0x1,%esi ; @0x1e6d4f je
    if (count === 1) {
      return; // @0x1e6db7 — a single sample is fully handled by the peel
    }
    counter = (count - 1) | 0;
  } else {
    // @0x1e6d12 movl %esi,%eax — and the @0x1e6d14 `cmpl $0x1 ; jne` that follows can only
    // fall through for count == 1, which is odd and therefore unreachable on this path.
    counter = count | 0;
  }

  // @0x1e6d51 decl %eax — the counter entering the loop is count-1 (even count) or count-2
  // (odd count); both are odd, which is what makes the `>= 2` test below consume exactly the
  // remaining pairs.
  counter = (counter - 1) | 0;

  // @0x1e6d70..@0x1e6db5 — a DO/WHILE over sample PAIRS.
  for (;;) {
    // @0x1e6d70..@0x1e6d8a — sample A -> dst[+0].
    //   The machine carries ONE index, %rcx, counting SRC bytes, and reaches the destination
    //   with `(%rdi,%rcx,8)`: a sample is 2 src bytes and 16 dst bytes, so scaling the src-byte
    //   index by 8 gives the dst BYTE offset — i.e. by 2 for a dst LANE index. This port keeps
    //   the two cursors separately (dstLane, srcByte); they advance in lockstep, so
    //   `dstLane === srcByte * 2` holds at every iteration, which is exactly the identity the
    //   `,8` scale encodes.
    expand(dstLane, srcByte);
    // @0x1e6d8e..@0x1e6da9 — sample B -> dst[+1] (`0x10(%rdi,%rcx,8)`, i.e. +4 lanes).
    expand(dstLane + 4, srcByte + 2);
    dstLane += 8; // two float4s
    srcByte += 4; // @0x1e6dae addq $0x4,%rcx
    // @0x1e6db2 addl $-0x2,%eax ; @0x1e6db5 jb — CF is set iff the pre-add counter was >= 2
    // (unsigned), so the back edge is taken while at least two samples remain.
    const carry = (counter >>> 0) >= 2;
    counter = (counter - 2) | 0;
    if (!carry) {
      break;
    }
  }
  // @0x1e6db7 popq %rbp ; @0x1e6db8 retq
}
