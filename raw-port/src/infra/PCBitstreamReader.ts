// PCBitstreamReader.ts — MSB-first bitstream reader with a 64-bit shift register. Transcribed
// from FCP ProCore framework (Final Cut Pro.app/.../ProCore) — three methods: initialize, getBits,
// flushBits. Pure integer math over unsigned bit operations; no external state.
//
// DECODE: raw-port/re/disasm/ProCore.PCBitstreamReader.initialize.s
//         raw-port/re/disasm/ProCore.PCBitstreamReader.flushBits.s
//         raw-port/re/disasm/ProCore.PCBitstreamReader.getBits.s
//
// Struct layout (recovered from stores in initialize and reads in flushBits/getBits):
//   +0x00  reg_lo  : uint32  (low 32 bits of the 64-bit MSB-aligned shift register — the "output"
//                             half; getBits shifts the WHOLE 64-bit value left by n, then reads
//                             the top 32 bits via `shrq $0x20,%rax` to extract the requested n bits)
//   +0x04  reg_hi  : uint32  (high 32 bits of the register — this is where initial data lands
//                             from source bytes)
//                    Together offsets +0x00..+0x07 are one uint64 loaded as `movq (%rdi),%xmm0`
//                    in getBits/flushBits and stored back with `movq %xmm1,(%rdi)`.
//   +0x08  bitPos  : int32   (signed — bits consumed since last refill; getBits does
//                             `bitPos -= n` and if the result goes NEGATIVE that's the signal to
//                             refill from source; after refill `bitPos += 32`).
//   +0x10  cur     : uint8*  (current source-byte pointer, advanced by 4 on aligned refills and
//                             by 1 on final unaligned tail bytes).
//   +0x18  end_aligned : uint8*  (last address at which a 4-byte aligned refill can still be
//                             performed — `cur < end_aligned` gates the fast bswapl path).
//   +0x20  end     : uint8*  (one past the last source byte — `cur < end` gates any byte-wise
//                             tail refill).
//   +0x28  validBits : int32 (saturated bit-count in the register; capped at 0x3f = 63 — never
//                             65 despite the ideal-arithmetic addition being 32+existing).
// Total sizeof >= 0x2c (44 bytes, likely padded to 0x30).
//
// Behavior summary (from the three disasms — MSB-first, RFC-3550/H.264-style entropy reader):
//   initialize(src, size): loads up to 4 bytes MSB-packed into the register's high half, records
//     the empty-bit count in validBits (0x28), fixes up source-pointer alignment so subsequent
//     refills can bswap-load a uint32 in one instruction, and records the current/aligned-end/end
//     pointers.
//   getBits(n): shift register left by n; if bitPos went negative, refill 32 fresh bits from
//     source (aligned bswap fast path, else byte-by-byte pack, else zero-fill); OR the refilled
//     bits in at the emptied low half; return the top n bits (shifted down from the high half).
//   flushBits(n): same as getBits WITHOUT the final `shr` extraction — advances the register but
//     discards the shifted-out bits.

/** Signed int32-modular arithmetic helper for the "shift left by up to 63" ops that must match
 *  the x86 psllq instruction bit-for-bit. Because JS bitwise ops are 32-bit, we use BigInt for
 *  the register-wide shift-left, then mask to 64 bits. */
function shl64(value: bigint, count: number): bigint {
  // psllq masks the count to 6 bits (0..63); for count == 64 psllq yields 0.
  const k = count & 0x3f;
  return (value << BigInt(k)) & 0xFFFF_FFFF_FFFF_FFFFn;
}

export class PCBitstreamReader {
  /** +0x00..+0x07 — 64-bit MSB-aligned shift register (stored as one uint64). */
  reg: bigint = 0n;
  /** +0x08 — bits consumed since last refill; goes negative → refill. */
  bitPos: number = 0;
  /** +0x10 — current source-byte pointer, expressed as an index into `src`. */
  cur: number = 0;
  /** +0x18 — last aligned-refill position (cur < endAligned ⇒ can bswap-load a uint32). */
  endAligned: number = 0;
  /** +0x20 — one past the last source byte. */
  end: number = 0;
  /** +0x28 — saturated valid-bit-count in the register (cap 0x3f = 63). */
  validBits: number = 0;
  /** The source bytes. Held by index rather than raw pointer since JS has no pointer arithmetic;
   *  cur/endAligned/end are all indices into this. In C++ they are raw uint8* — this rewrite is
   *  a pointer-to-index reindexing, semantics preserved. */
  src: Uint8Array = new Uint8Array(0);

  /**
   * PCBitstreamReader::initialize(unsigned char const* src, unsigned int size)
   * @ProCore 0x0000000000068a1a  (__ZN17PCBitstreamReader10initializeEPKhj)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCBitstreamReader.initialize.s):
   *   0x68a1a-0x68a1d  cmpl $3, %edx ; ja 0x68a5b — if size > 3, take the fast 4-byte-load path.
   *   0x68a1f-0x68a21  testl %edx,%edx ; je 0x68a6b — if size == 0, jump to zero-fill path.
   *   0x68a23-0x68a44  BYTE-PACK LOOP (size in 1..3): pack size bytes MSB-first into %eax with
   *                    shift amounts 24, 16, 8; %r9 = 0 (empty-slot count zero because we haven't
   *                    added 8 back yet); %r8 = size, %rcx starts at 0x18 and decrements by 8.
   *   0x68a46-0x68a56  leal (,%rdx,8),%ecx ; movl $0x20,%r9d ; subl %ecx,%r9d — r9 = 32 - size*8
   *                    = empty-bit-count in the register's high half. rsi += size (advance src ptr).
   *   0x68a59           jmp 0x68a73 — to the common tail (ecx <- 0 in a moment).
   *   0x68a5b-0x68a59  FAST PATH (size >= 4): movl (%rsi),%eax ; bswapl %eax — load 4 bytes big-
   *                    endian. rsi += 4, ecx = size - 4, r9 = 0. Jump to 0x68a75 (skips the
   *                    `xor %ecx,%ecx` at 0x68a73).
   *   0x68a6b-0x68a71  ZERO-FILL PATH (size == 0): eax = 0, r9 = 0x20 (whole register empty),
   *                    falls through to 0x68a73.
   *   0x68a73           xorl %ecx,%ecx — ecx = 0 (only from BYTE-PACK or ZERO-FILL paths).
   *   0x68a75-0x68a7c  Store validBits=%r9, reg_hi=%eax (at +0x04!), bitPos=0.
   *   0x68a83           xorl %eax,%eax  — eax = 0 (reg_lo starting fill).
   *   0x68a85-0x68a89  testb $0x3, %sil ; je 0x68afb — if src pointer already 4-aligned, skip the
   *                    alignment-fixup block, go straight to storing reg_lo=0 and pointers.
   *   0x68a8b-0x68afa  ALIGNMENT FIXUP (src is 1/2/3 bytes off a 4-byte boundary AND we have
   *                    enough remaining bytes to reach the next boundary): pack the misaligned
   *                    tail bytes into %eax MSB-first (shift 24, 16, 8), advance rsi to the next
   *                    aligned position, recompute the outstanding-byte count in %ecx.
   *   0x68afb           movl %eax, (%rdi)  — reg_lo = eax (this is +0x00 = low 32 of register).
   *   0x68afd-0x68b02  movl %ecx,%eax ; andl $-0x4,%ecx ; movq %rsi,0x10(%rdi) — cur = rsi.
   *   0x68b06-0x68b09  end_aligned = cur + (remaining & ~3).
   *   0x68b0d-0x68b10  end = cur + remaining.
   */
  initialize(src: Uint8Array, offset: number, size: number): void {
    this.src = src;

    let regHi = 0;              // eax across all paths (destination reg_hi at +0x04)
    let validBits = 0;          // r9d — empty-slot count in reg_hi
    let outstanding = 0;        // ecx — bytes remaining after the initial fill
    let cursor = offset;        // rsi — source-byte index

    if (size > 3) {
      // 0x68a5b-0x68a69 — FAST PATH: load 4 bytes big-endian.
      regHi =
        ((src[cursor + 0] << 24) |
         (src[cursor + 1] << 16) |
         (src[cursor + 2] <<  8) |
         (src[cursor + 3])) >>> 0;    // bswapl of movl (%rsi),%eax
      cursor += 4;                    // 0x68a5f: addq $0x4,%rsi
      outstanding = size - 4;         // 0x68a63: leal -0x4(%rdx),%ecx
      validBits = 0;                  // 0x68a66: xorl %r9d,%r9d
      // jmp 0x68a75 — the xorl %ecx,%ecx at 0x68a73 is SKIPPED here.
    } else if (size === 0) {
      // 0x68a6b-0x68a71 — ZERO-FILL PATH.
      regHi = 0;
      validBits = 0x20;               // 32 empty bits in reg_hi
      // Falls through to 0x68a73 which sets ecx=0 — already 0.
      outstanding = 0;
    } else {
      // 0x68a23-0x68a44 — BYTE-PACK LOOP for size ∈ {1,2,3}.
      const n = size;                 // r8d = size
      let shiftCount = 24;            // ecx starts at 0x18
      let packed = 0;                 // eax = 0
      for (let i = 0; i < n; i++) {   // r9 = i, r8 = n
        packed = (packed | ((src[cursor + i] << shiftCount) >>> 0)) >>> 0;  // 0x68a30-0x68a3b
        shiftCount -= 8;              // 0x68a3e: addl $-0x8,%ecx
      }
      regHi = packed;
      // 0x68a46-0x68a53: r9 = 32 - size*8 (empty-bit count).
      validBits = (0x20 - size * 8) | 0;
      cursor += n;                    // 0x68a56: addq %r8,%rsi
      // Falls through to 0x68a73: ecx = 0 (no aligned-refill outstanding — we consumed everything).
      outstanding = 0;
    }

    // 0x68a75-0x68a7c — store the initial validBits count + reg_hi + reset bitPos.
    this.validBits = validBits;       // 0x68a75: movl %r9d,0x28(%rdi)
    // NOTE: `movl %eax,0x4(%rdi)` stores reg_hi at +0x04 = the HIGH half of the 64-bit register.
    // The LOW half (+0x00) is written a few instructions later; between the two the register is
    // temporarily in an inconsistent state — as long as we do both before any reader observes it,
    // the final state is correct. We defer both to the very end.
    this.bitPos = 0;                  // 0x68a7c: movl $0x0,0x8(%rdi)

    // 0x68a83 — eax = 0 (reg_lo starting fill).
    let regLo = 0;

    // 0x68a85-0x68a89 — testb $0x3,%sil ; je 0x68afb : is src pointer misaligned?
    const misalign = cursor & 0x3;
    if (misalign !== 0) {
      // 0x68a8b-0x68a98 — %r9 = 4 - misalign (bytes needed to reach next 4-boundary).
      const need = 4 - misalign;
      // 0x68a9b-0x68a9e — cmpl %ecx,%r9d ; ja 0x68afb : if we don't have enough remaining bytes
      // to fill up to the boundary, skip the alignment fixup entirely.
      if (need <= outstanding) {
        // 0x68aa5-0x68acd — pack `need` bytes MSB-first into %eax (shifts 24, 16, 8) — same as
        // the initial byte-pack but starting from the current cursor.
        // Note the exact loop bound: r10 = 4 - misalign = need (also computed via negl + movslq
        // + addq 4 in the asm — equivalent to `need`).
        let shiftCount = 24;          // 0x68ab4: movl $0x18,%ecx
        let packed = 0;               // 0x68ab9: xorl %eax,%eax
        for (let i = 0; i < need; i++) {
          packed = (packed | ((src[cursor + i] << shiftCount) >>> 0)) >>> 0;
          shiftCount -= 8;
        }
        regLo = packed;               // will be stored at +0x00 below

        // 0x68acf-0x68ad7 — r10d = misalign * 8 (bits from before, unused? — actually it's used
        // to recompute bitPos): the empty-bit count in reg_lo after this pack.
        const misalignBits = misalign * 8;    // r10d = misalign * 8

        // 0x68ada — rsi += need (advance cursor past the fill).
        cursor += need;

        // 0x68add-0x68ae5 — outstanding recount: ecx = min(size, 4) after adding misalign
        // adjustment; see the asm exactly:
        //   0x68add-0x68ae0: cmpl $0x5,%edx ; movl $0x4,%ecx ; cmovael %edx,%ecx
        //   0x68ae8:         addl %r8d,%ecx     (add misalign)
        //   0x68aeb:         addl $-0x8,%ecx    (subtract 8 — dead? no, it's `-8` bytes → adjust
        //                                        the outstanding count by 8 to reflect what we
        //                                        just consumed, in bytes).
        // We already tracked `outstanding` in bytes above the fixup; the asm here recomputes it
        // from %edx (original size arg) but that's equivalent to `outstanding - need + misalign
        // - 8` per the sequence. In practice this ecx will be masked to a 4-multiple at 0x68aff
        // (`andl $-0x4,%ecx`) so only its 4-multiple part matters, and it's used for
        // end_aligned = cur + (ecx & ~3). We replicate the asm exactly:
        // (0x68add) if size < 5, ecx = 4; else ecx = size (from %edx).
        let ecx = size < 5 ? 4 : size;    // cmovael from movl $0x4,%ecx
        ecx = (ecx + misalign) | 0;       // 0x68ae8: addl %r8d,%ecx
        ecx = (ecx - 8) | 0;              // 0x68aeb: addl $-0x8,%ecx
        outstanding = ecx;

        // 0x68aee-0x68af6 — bitPos = 32 - misalignBits. This records that the low half of the
        // register is now "underfilled" by misalign*8 bits.
        this.bitPos = (0x20 - misalignBits) | 0;    // movl %edx,0x8(%rdi)
      }
    }

    // 0x68afb: movl %eax,(%rdi) — reg_lo goes to +0x00.
    // Combined with the earlier reg_hi at +0x04, the full 64-bit register is:
    //   reg = (uint64)regHi << 32 | (uint64)regLo    (little-endian in-memory as one uint64).
    // NOTE: because +0x00..+0x07 is loaded as one movq later, and x86 is little-endian, the
    // 64-bit value read is (regHi_shifted_left_32 | regLo). Confirmed by matching subsequent
    // getBits/flushBits load `movq (%rdi),%xmm0` which uses the whole 8-byte little-endian read.
    this.reg = ((BigInt(regHi >>> 0) << 32n) | BigInt(regLo >>> 0)) & 0xFFFF_FFFF_FFFF_FFFFn;

    // 0x68afd-0x68b02 — movl %ecx,%eax (save total); andl $-0x4,%ecx (mask to 4-multiple);
    //                   movq %rsi,0x10(%rdi) — cur = cursor.
    this.cur = cursor;
    // 0x68b06-0x68b09 — end_aligned = cur + (outstanding & ~3).
    this.endAligned = cursor + (outstanding & ~0x3);
    // 0x68b0d-0x68b10 — end = cur + outstanding.
    this.end = cursor + outstanding;
    // 0x68b14 — retq.
  }

  /**
   * PCBitstreamReader::flushBits(int n)
   * @ProCore 0x0000000000068b16  (__ZN17PCBitstreamReader9flushBitsEi)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCBitstreamReader.flushBits.s):
   *   0x68b1b-0x68b26  Load state: eax = bitPos (0x8), rdx = cur (0x10), r8d = validBits (0x28),
   *                    xmm0 = reg (0x00..0x07 as one movq).
   *   0x68b2a-0x68b2e  xmm1 = n (as scalar in low lane); psllq %xmm1,%xmm0 — shift the register
   *                    left by n (n is masked to 6 bits by psllq itself: 0..63).
   *   0x68b32           subl %esi,%eax — bitPos -= n.
   *   0x68b34-0x68b3b  js 0x68b40 — if bitPos went negative, take the REFILL branch. Otherwise
   *                    (register still had >= n valid bits) rcx = shifted register, jmp to store.
   *   0x68b40-0x68bbe  REFILL BRANCH:
   *     0x68b40-0x68b42   esi = -bitPos (positive shortage — bits we NEED to add).
   *     0x68b44-0x68b48   cmpq 0x18(%rdi),%rdx ; jae 0x68b56 — if cur >= end_aligned, take the
   *                       byte-wise TAIL PATH.
   *     0x68b4a-0x68b54   ALIGNED PATH: movl (%rdx),%r9d ; bswapl %r9d ; addq $0x4,%rdx — read
   *                       32 fresh bits big-endian, advance cur by 4. Jump to 0x68ba8 (OR-in).
   *     0x68b56-0x68b91   TAIL PATH: r10 = end (0x20). If cur >= end, r9 = 0 (nothing left) and
   *                       ecx = 0x20 (validBits addition = full 32) — this happens at 0x68b93.
   *                       Otherwise byte-pack the remaining `end - cur` bytes MSB-first into r9
   *                       (shifts 24, 16, 8, 0), then compute ecx = 32 - (end-cur)*8 = the number
   *                       of BIT-slots the tail refill actually filled — via the tricky sequence:
   *                         shll $0x3,%edx        edx = cur * 8 (bit offset of cur)
   *                         movl %r10d,%ecx ; shll $0x3,%ecx     ecx = end * 8
   *                         subl %ecx,%edx        edx = (cur - end) * 8   (negative)
   *                         addl $0x20,%edx       edx = 32 - (end-cur)*8  (bits contributed)
   *                         movl %edx,%ecx        ecx = that bit count
   *                       cur = end (r10 = end).
   *     0x68b93-0x68b96   (cur >= end short-circuit landing) — ecx = 0x20 (32 bits — but zero of
   *                       value, contributing 0 to the register while claiming 32 bits added to
   *                       validBits — this saturates the counter without corrupting reg).
   *     0x68b98-0x68ba4   validBits (r8) += ecx; saturated at 0x3f (movl $0x3f,%r8d ; cmovbl
   *                       %ecx,%r8d — cmov below-63 selects the not-saturated value).
   *     0x68ba8-0x68bb9   xmm1 = r9 (fresh bits) ; psllq %esi,%xmm1 — shift left by -bitPos
   *                       (the shortage); por %xmm0,%xmm1 — OR into the shifted register.
   *     0x68bbe           addl $0x20,%eax — bitPos += 32.
   *   0x68bc1-0x68bcb   Store rcx to (%rdi) (reg), eax to 0x8 (bitPos), rdx to 0x10 (cur),
   *                     r8d to 0x28 (validBits). emms (leaves MMX/SSE).
   */
  flushBits(n: number): void {
    // 0x68b1b-0x68b26 — load state (already in fields).
    const nMasked = n & 0x3f;                            // psllq's implicit mask

    // 0x68b2a-0x68b2e — psllq: reg <<= n.
    let reg = shl64(this.reg, n);

    // 0x68b32 — bitPos -= n.
    let bitPos = (this.bitPos - n) | 0;

    if (bitPos < 0) {
      // 0x68b40-0x68b42 — shortage = -bitPos (positive).
      const shortage = -bitPos | 0;
      let refillBits = 0;                                // r9d
      let addedBitCount = 0;                             // ecx (contribution to validBits)
      let cur = this.cur;

      if (cur < this.endAligned) {
        // 0x68b4a-0x68b54 — ALIGNED PATH: read 4 bytes big-endian.
        refillBits =
          ((this.src[cur + 0] << 24) |
           (this.src[cur + 1] << 16) |
           (this.src[cur + 2] <<  8) |
           (this.src[cur + 3])) >>> 0;
        cur += 4;
        addedBitCount = 0x20;                            // full 32 bits added to validBits
      } else {
        // 0x68b56-0x68b91 — TAIL PATH.
        const end = this.end;
        if (cur < end) {
          // Byte-pack `end - cur` remaining bytes MSB-first into refillBits.
          let shiftCount = 24;                           // ecx = 0x18
          let packed = 0;
          let p = cur;                                   // r14 = rdx
          while (p !== end) {
            packed = (packed | ((this.src[p] << shiftCount) >>> 0)) >>> 0;
            p += 1;
            shiftCount -= 8;
          }
          refillBits = packed;
          // 0x68b7e-0x68b8c — addedBitCount = 32 - (end - cur) * 8. Preserves the fact that the
          // low bits of the fresh word are ZERO (never written by the pack loop), so shifting
          // them into the register still adds them to validBits without corrupting reg.
          addedBitCount = ((cur << 3) - (end << 3) + 0x20) | 0;
          cur = end;
        } else {
          // 0x68b93 — no source left; 32 zero bits, but claim the 32-bit slot for validBits so
          // the caller sees "space still there" (saturated later).
          refillBits = 0;
          addedBitCount = 0x20;
        }
      }

      // 0x68b98-0x68ba4 — validBits += addedBitCount, saturated at 0x3f.
      const sum = (this.validBits + addedBitCount) | 0;
      const newValidBits = sum < 0x3f ? sum : 0x3f;      // cmovbl %ecx,%r8d (r8d preloaded to 0x3f)

      // 0x68ba8-0x68bb9 — shift refill left by `shortage`, OR into reg.
      reg = (reg | shl64(BigInt(refillBits >>> 0), shortage)) & 0xFFFF_FFFF_FFFF_FFFFn;

      // 0x68bbe — bitPos += 32.
      bitPos = (bitPos + 0x20) | 0;

      this.cur = cur;
      this.validBits = newValidBits;
    }
    // else: 0x68b36 — no refill; rcx = shifted reg — falls through to common store.

    // 0x68bc1-0x68bcb — store back.
    this.reg = reg;
    this.bitPos = bitPos;
    // emms — no analogue in TS.
    // (silence "unused local" for nMasked: kept as decode comment.)
    void nMasked;
  }

  /**
   * PCBitstreamReader::getBits(int n) → uint32
   * @ProCore 0x0000000000068bd4  (__ZN17PCBitstreamReader7getBitsEi)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCBitstreamReader.getBits.s):
   *   Body is IDENTICAL to flushBits from 0x68bd4 through 0x68c98 (the state-store), reading and
   *   writing exactly the same offsets and doing the same refill logic. The only difference is
   *   the tail after the state store:
   *     0x68c9c   emms
   *     0x68c9e   shrq $0x20, %rax   — %rax was set at 0x68bdd (`movq (%rdi),%rax`) — this is the
   *                                   register's ORIGINAL value BEFORE the shift; shifting it
   *                                   right by 32 puts the register's high 32 bits (which contain
   *                                   the n-highest bits of the pre-shift buffer) into eax.
   *                                   Wait — actually rax was saved into rcx for the store, but
   *                                   ALSO %xmm0's bits went to rcx. Re-check: at 0x68bdd
   *                                   rax = *(this) (register). At 0x68beb xmm0 = rax. So rax
   *                                   still holds the ORIGINAL register. After all the branchy
   *                                   refill logic, rax is unchanged. Then shrq $0x20,%rax
   *                                   yields the ORIGINAL register's high 32 bits — which are
   *                                   the top of the MSB-aligned register PRE-refill.
   *     0x68ca2   negb %sil          — sil = -n (byte).
   *     0x68ca5   movl %esi,%ecx     — ecx = -n (as int32, sign-extended from the low byte).
   *     0x68ca7   shrl %cl,%eax      — eax >>= (-n & 0x1f) = eax >>= (32 - n) mod 32.
   *                                   For n in 1..32 this is `eax >> (32 - n)` which extracts
   *                                   the TOP n bits of the original register-high half → the
   *                                   requested n-bit value, right-justified.
   *     0x68caf   retq — return eax (uint32).
   *
   * IMPORTANT: getBits does exactly the same STATE MUTATION as flushBits (updates reg/bitPos/
   * cur/validBits). The extraction is done from the PRE-shift register-high half, not from any
   * "consumed" bits in the low half — so the returned value is the top n bits of the buffer
   * BEFORE the shift, i.e. the natural MSB-first bitstream-read result.
   */
  getBits(n: number): number {
    // 0x68bdd — snapshot the register's TOP 32 bits BEFORE mutation (this is what the return
    // comes from). shrq $0x20 on the pre-shift 64-bit value = high 32 bits.
    const preHi = Number((this.reg >> 32n) & 0xFFFF_FFFFn);

    // 0x68be0-0x68c9c — this half is identical to flushBits: do the same shift/refill/store.
    this.flushBits(n);

    // 0x68ca2-0x68ca7 — `negb %sil ; movl %esi,%ecx ; shrl %cl,%eax`:
    //   shift amount = (-n) & 0x1f = (32 - (n & 0x1f)) & 0x1f  (32-bit shift-count mask).
    // For n in 1..31 that's (32 - n). For n == 32, negb of 32 → 0 low byte → shrl by 0 = no
    // shift → returns the full top-32-bits word. For n == 0, negb of 0 → shrl by 0 → returns
    // whole top 32 bits (which is what a "read 0 bits" degenerate call would produce — the FCP
    // callers guard against n == 0 so this is essentially unreachable).
    const shiftAmount = ((-n) & 0x1f) >>> 0;
    return ((preHi >>> shiftAmount) >>> 0);
  }
}
