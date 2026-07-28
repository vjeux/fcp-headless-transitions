// LTCFrame.ts — Flexo's "Linear TimeCode" frame decoder state. A single
// SMPTE LTC frame is 80 bits, delivered one bit at a time to CollectBit()
// as they are recovered from the audio. Once all 80 bits have arrived,
// Dump() (empty in this build) is where the frame would be logged, and
// GetUserBits() extracts the 32 user bits (SMPTE binary groups 1..8)
// packed as a uint32 for callers.
//
// Transcribed from FCP Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// See raw-port/re/disasm/Flexo.LTCFrame.{CollectBit,Reset,GetUserBits,Dump}.s
// for the verbatim x86_64 disassembly.
//
// STRUCT LAYOUT (recovered from the four transcribed methods; only the
// offsets they actually touch are documented — that is the entire
// observable state, since these are all the methods emitted for the
// class in Flexo):
//
//   +0x00  uint32   bitCount        // number of bits collected so far (0..0x50)
//                                   // Reset writes qword 0 here, blanking +0..+7.
//   +0x04  byte[10] bitBuf          // 80-bit LTC frame buffer (bytes +4..+0xd).
//                                   // CollectBit shifts LEFT by 1 across the
//                                   // whole buffer to make room for the new bit,
//                                   // then OR-s the new bit into +0xd bit 0.
//                                   // GetUserBits reads bytes +4..+0xb (the 32
//                                   // user-bit region) and packs their low
//                                   // nibbles into a uint32.
//                                   // Reset writes qword 0 at +6 THEN qword 0
//                                   // at +0, net-zeroing bytes 0..0xd.
//   (No other offsets are touched by any of the four methods.)
//
// Reset zeros the whole 14-byte state (bitCount + bitBuf). Dump is a
// void no-op in shipping Flexo (the debug print path was compiled out).
// CollectBit and GetUserBits carry the interesting logic — transcribed
// below with every branch preserved.

/**
 * SMPTE LTC frame — 80 bits (10 bytes) of bit-buffer plus a running
 * bitCount. `bitBuf` bytes are the raw LTC frame layout; user bits live
 * in bytes +4..+0xb (i.e. bitBuf[0..7]) with the payload in each byte's
 * low nibble.
 *
 * @see FCP Flexo LTCFrame class emitted at:
 *      LTCFrame::CollectBit(bool)      @0x1227510
 *      LTCFrame::Reset()               @0x12275a0
 *      LTCFrame::GetUserBits(bool*) const @0x12275c0
 *      LTCFrame::Dump()                @0x1227640
 */
export class LTCFrame {
  /** +0x00 — bitCount, uint32. Only the low BYTE is compared against
   *  0 or 0x4f/0x50 in CollectBit; the upper 24 bits are only ever
   *  written 0 by Reset (or via `incl` after being clamped ≤ 0x50).
   *  Modelled as a plain number. */
  bitCount: number = 0;
  /** +0x04..+0x0d — bitBuf, 10 bytes. */
  bitBuf: Uint8Array = new Uint8Array(10);

  /**
   * @see FCP Flexo `LTCFrame::Reset()` @0x00000000012275a0
   *
   * Zeros the state. The disasm writes two overlapping qwords:
   *
   *   0x12275a4  movq $0, 6(%rdi)   ; zero bytes +6..+0xd
   *   0x12275ac  movq $0, (%rdi)    ; zero bytes +0..+7
   *
   * Net result: bytes +0..+0xd (14 bytes: 4-byte bitCount + 10-byte
   * bitBuf) all become 0. The 8-byte writes overlap on bytes +6, +7
   * (double-zeroed), which is a compiler trick to zero 14 bytes with
   * exactly two `movq $0`s.
   */
  Reset(): void {
    // @0x12275a4 — writing qword 0 at +6 zeros bytes +6..+0xd
    // (i.e. bitBuf[2..9] + upper 2 bytes of bitCount if it spilled).
    // @0x12275ac — writing qword 0 at +0 zeros bytes +0..+7
    // (i.e. bitCount, plus bitBuf[0..3]). Combined: everything zero.
    this.bitCount = 0;
    this.bitBuf.fill(0);
    // @0x12275b4 — retq.
  }

  /**
   * @see FCP Flexo `LTCFrame::Dump()` @0x0000000001227640
   *
   * Disassembly (verbatim, empty body):
   *   0x1227640  push %rbp
   *   0x1227641  mov  %rsp, %rbp
   *   0x1227644  pop  %rbp
   *   0x1227645  retq
   *
   * Empty — the debug print path was compiled out of shipping Flexo.
   * Preserved as a method so the class API surface matches. */
  Dump(): void {
    // no-op — Apple emitted the prologue/epilogue only.
  }

  /**
   * @see FCP Flexo `LTCFrame::CollectBit(bool)` @0x0000000001227510
   *
   * Called once per demodulated LTC bit. Shifts the 80-bit `bitBuf`
   * LEFT by ONE bit (with byte-to-byte carry) to make room for the
   * new bit at position (79 - bitCount), then, if `bit` is true, sets
   * bit 0 of `bitBuf[9]` (== byte +0xd). Finally, if bitCount is not
   * yet at 0x50 (= 80), increments bitCount.
   *
   * The disasm shape is:
   *
   *   0x1227514  movl (%rdi), %eax               ; eax = bitCount
   *   0x1227516  movl %eax, %ecx
   *   0x1227518  andl $0xff, %ecx                ; ecx = bitCount & 0xff
   *   0x122751e  je   0x1227584                  ; if bitCount==0 -> tail
   *   0x1227520  movl %eax, %r8d                 ; r8d = bitCount
   *   0x1227523  jmp  0x1227547                  ; enter loop at condition
   *   ; loop body @0x1227530:
   *   0x1227530  shlb 0x4(%rdi,%r8)              ; bitBuf[r8-4] <<= 1
   *   0x1227535  orl  $-0x8, %edx                ; edx |= 0xfffffff8
   *   0x1227538  addl %ecx, %edx                 ; edx += ecx
   *   0x122753a  mov  %edx, %ecx / %r8d
   *   0x122753f  andl $0xff, %ecx
   *   0x1227545  je   0x1227584                  ; low byte of edx == 0 -> tail
   *   ; loop cond @0x1227547:
   *   0x1227547  movl $0x50, %edx                ; edx = 80
   *   0x122754c  subl %r8d, %edx                 ; edx = 80 - r8
   *   0x122754f  movzbl %dl, %r9d                ; r9 = edx & 0xff
   *   0x1227553  movl %r9d, %r8d
   *   0x1227556  shrl $0x3, %r8d                 ; r8 = r9 >> 3 (byte index)
   *   0x122755a  testb $0x7, %r9b                ; r9 & 7 (bit-within-byte)
   *   0x122755e  setne %r10b
   *   0x1227562  cmpb $0x8, %r9b
   *   0x1227566  setb %r9b                       ; r9 = (r9 < 8)
   *   0x122756a  orb  %r10b, %r9b                ; r9 = (r9<8) | ((r9&7)!=0)
   *   0x122756d  jne  0x1227530                  ; skip word-boundary carry step
   *   ; word boundary path @0x122756f:
   *   0x122756f  movzbl 4(%rdi,%r8), %r9d        ; r9 = bitBuf[r8-4]
   *   0x1227575  shrb $0x7, %r9b                 ; r9b = r9>>7 (top bit as carry)
   *   0x1227579  leal -1(%r8), %r10d             ; r10 = r8 - 1
   *   0x122757d  orb  %r9b, 4(%rdi,%r10)         ; bitBuf[r10-4] |= carry
   *   0x1227582  jmp  0x1227530                  ; back into loop body
   *   ; tail @0x1227584:
   *   0x1227584  testb %sil, %sil                ; bit arg?
   *   0x1227587  jne  0x1227590                  ; if true -> set +0xd bit 0
   *   0x1227589  cmpl $0x4f, %eax                ; else if bitCount <= 79
   *   0x122758c  jbe  0x1227599                  ;      -> increment
   *   0x122758e  popq %rbp / retq                ; else return without update
   *   0x1227590  orb  $0x1, 0xd(%rdi)            ; bitBuf[9] |= 0x01
   *   0x1227594  cmpl $0x4f, %eax
   *   0x1227597  ja   0x122758e                  ; if bitCount>79 -> return
   *   0x1227599  incl %eax                       ; bitCount++
   *   0x122759b  movl %eax, (%rdi)
   *   0x122759d  popq %rbp / retq
   *
   * The loop is a per-byte "left shift by 1 with inter-byte carry" that
   * walks DESCENDING byte indices (r8 starts at bitCount, and each
   * iteration adds `(edx | -8) + ecx` — a compiler-optimised way to
   * step `r8 -= 1` while re-checking the byte-boundary condition; the
   * `or -8` + `add ecx` produces the same next-lower r8 that a
   * straightforward `dec r8` would). The word-boundary path
   * (@0x122756f) captures the top bit of byte[r8-4] into byte[r8-5]'s
   * bit 0, i.e. carrying between bytes; the "loop body" (@0x1227530)
   * does the actual `shl byte, 1`.
   *
   * The exact byte-index arithmetic: `r8` in the disasm is an offset
   * relative to `rdi + 4` (i.e. the start of bitBuf). So `4(%rdi, %r8)`
   * indexes `bitBuf[r8 - 4]`? No — `4(rdi, r8)` = `rdi + 4 + r8`, so if
   * r8 starts at 0..79 and drives, it's indexing bitBuf byte at
   * position `r8` inside the WHOLE struct starting at `rdi+4`. Since
   * `r8` starts at `bitCount` (initial), and after `shr 3` in the cond
   * gives the byte-index within the *bit position from top of the frame*,
   * this is really doing a bit-position-driven shift.
   *
   * FAITHFUL PORT NOTE: To transcribe this without slipping into
   * "clever" simplification, we mirror the assembly's registers as
   * variables and preserve every branch. The result is a bit-buffer
   * left-shift by 1 that PRESERVES exactly the disasm's byte-visitation
   * order — this matters because `bitCount` here is the DRIVER, and
   * partial states (before the loop finishes) are not observed by
   * anyone, but keeping the shape means we won't drift if a future
   * refactor exposes an intermediate. All 32-bit compares are masked
   * as-decoded.
   */
  CollectBit(bit: boolean): void {
    // @0x1227514  eax = bitCount
    const eax = this.bitCount >>> 0;
    // @0x1227518  ecx = eax & 0xff
    let ecx = eax & 0xff;
    // @0x122751e  je tail (if low byte of bitCount is 0, no shift needed)
    if (ecx !== 0) {
      // @0x1227520  r8d = bitCount
      let r8 = eax >>> 0;
      let edx = 0;
      // @0x1227523  jmp cond
      for (;;) {
        // ---- loop cond @0x1227547 ----
        // @0x1227547..0x122754c  edx = 80 - r8
        edx = ((0x50 - r8) | 0) >>> 0;
        // @0x122754f  r9 = edx & 0xff
        let r9 = edx & 0xff;
        // @0x1227553..0x1227556  r8 = r9 >> 3 (byte index within bitBuf,
        //                                       offset from bitBuf[0])
        r8 = (r9 >>> 3) >>> 0;
        // @0x122755a..0x122755e  r10 = ((r9 & 7) != 0) ? 1 : 0
        const r10 = (r9 & 7) !== 0 ? 1 : 0;
        // @0x1227562..0x1227566  r9 = (r9 < 8) ? 1 : 0
        const r9lt8 = r9 < 8 ? 1 : 0;
        // @0x122756a  r9 = r9lt8 | r10
        const skipCarry = (r9lt8 | r10) !== 0;
        if (!skipCarry) {
          // ---- word boundary path @0x122756f ----
          // @0x122756f  r9 = bitBuf[r8]  (byte at 4(%rdi,%r8) = bitBuf[r8-0])
          //   Note: r8 is now the byte-index within bitBuf (0..9).
          const r8i = r8 | 0;
          if (r8i >= 0 && r8i < this.bitBuf.length) {
            const byte = this.bitBuf[r8i]!;
            // @0x1227575  r9b = byte >> 7 (top bit)
            const carry = (byte >>> 7) & 1;
            // @0x1227579..0x122757d  bitBuf[r8-1] |= carry
            const r10i = (r8i - 1) | 0;
            if (r10i >= 0 && r10i < this.bitBuf.length) {
              this.bitBuf[r10i] = (this.bitBuf[r10i]! | carry) & 0xff;
            }
          }
          // @0x1227582  jmp back to loop body (0x1227530)
        }
        // ---- loop body @0x1227530 ----
        // @0x1227530  bitBuf[r8] <<= 1 (byte-wise, low bit cleared)
        {
          const r8i = r8 | 0;
          if (r8i >= 0 && r8i < this.bitBuf.length) {
            this.bitBuf[r8i] = (this.bitBuf[r8i]! << 1) & 0xff;
          }
        }
        // @0x1227535  edx |= 0xfffffff8  (== -8 sign-extended)
        edx = (edx | 0xfffffff8) >>> 0;
        // @0x1227538  edx += ecx (low byte of prior count)
        edx = (edx + ecx) >>> 0;
        // @0x122753a  ecx = edx & 0xff
        ecx = edx & 0xff;
        // @0x122753c  r8 = edx
        r8 = edx >>> 0;
        // @0x1227545  if (low byte of edx == 0) exit loop
        if (ecx === 0) break;
      }
    }

    // ---- tail @0x1227584 ----
    // @0x1227584/@0x1227587  testb sil / jne set-bit
    if (bit) {
      // @0x1227590  bitBuf[9] |= 0x01
      this.bitBuf[9] = (this.bitBuf[9]! | 0x01) & 0xff;
      // @0x1227594/@0x1227597  if bitCount > 79 return without inc
      if (eax > 0x4f) return;
      // fall through to inc
    } else {
      // @0x1227589/@0x122758c  if bitCount > 79 return without inc
      if (eax > 0x4f) return;
      // fall through
    }
    // @0x1227599/@0x122759b  bitCount++
    this.bitCount = (eax + 1) >>> 0;
  }

  /**
   * @see FCP Flexo `LTCFrame::GetUserBits(bool*) const` @0x00000000012275c0
   *
   * Returns the 32 SMPTE user-bits (binary groups 1..8) packed into a
   * single uint32. Optionally, if `flagOut` is non-null, writes bit 4
   * of `bitBuf[9]` (== byte +0x9) as the "flag" byte into `*flagOut`
   * (this is the LTC "binary group flag" 1 or 0). The user bits live
   * in the LOW NIBBLE of each of bytes +4..+0xb (bitBuf[0..7]).
   *
   * Disassembly (verbatim):
   *
   *   0x12275c4  testq %rsi,%rsi           ; flagOut != null ?
   *   0x12275c7  je    0x12275d4           ; skip flag write
   *   0x12275c9  movzbl 9(%rdi), %eax      ; eax = bitBuf[5]  (i.e. byte +0x9)
   *   0x12275cd  shrb  $0x4, %al           ; al >>= 4
   *   0x12275d0  andb  $0x1, %al           ; al &= 1
   *   0x12275d2  movb  %al, (%rsi)         ; *flagOut = bit
   *   0x12275d4  ...                       ; --- pack 32 user bits ---
   *   [reads bitBuf[0..7] (== bytes +4..+0xb), takes each low nibble,
   *    packs into a uint32 as (b4 nibble << 28) | (b5 nib << 24) | ... |
   *    (b11 nibble << 0). Full arithmetic chain preserved below.]
   *
   * The register dance (`shlb $0x4` + `movzbl` + `orl` at each level)
   * builds a byte from two source nibbles ((source_i & 0xf) << 4 |
   * (source_{i+1} & 0xf)), then shifts left 8 to open room for the next
   * pair. Four pairs give the 32-bit result.
   *
   * NOTE the disasm shows `movzbl 0x5(%rdi), %r8d`, `0x4(%rdi), %r9d`,
   * ..., `0xb(%rdi), %ecx` — those hex offsets are relative to `rdi`,
   * i.e. bytes +4..+0xb of the object, which are `bitBuf[0..7]` in
   * this port's array. The flag byte is at offset +0x9, i.e.
   * `bitBuf[5]`.
   */
  GetUserBits(flagOut: { value: number } | null): number {
    // @0x12275c4/@0x12275c7  testq rsi / je
    if (flagOut !== null) {
      // @0x12275c9  eax = bitBuf[5] (byte at struct offset +0x9)
      const eax = this.bitBuf[5]! & 0xff;
      // @0x12275cd/@0x12275d0  al = (al >> 4) & 1
      const bit = (eax >>> 4) & 1;
      // @0x12275d2  *flagOut = bit
      flagOut.value = bit;
    }
    // ---- pack the 32-bit user-bits result ----
    // Bytes read (all zero-extended to 32-bit):
    //   b5 = bitBuf[1], b4 = bitBuf[0], b6 = bitBuf[2], b7 = bitBuf[3],
    //   b8 = bitBuf[4], b9 = bitBuf[5], bA = bitBuf[6], bB = bitBuf[7].
    // Each source byte's low nibble is packed as follows (bit ranges in
    // the returned uint32):
    //   bits 28..31 : bitBuf[0] & 0xf   (was byte +0x4)
    //   bits 24..27 : bitBuf[1] & 0xf   (was byte +0x5)
    //   bits 20..23 : bitBuf[2] & 0xf   (was byte +0x6)
    //   bits 16..19 : bitBuf[3] & 0xf   (was byte +0x7)
    //   bits 12..15 : bitBuf[4] & 0xf   (was byte +0x8)
    //   bits  8..11 : bitBuf[5] & 0xf   (was byte +0x9)
    //   bits  4.. 7 : bitBuf[6] & 0xf   (was byte +0xa)
    //   bits  0.. 3 : bitBuf[7] & 0xf   (was byte +0xb)
    // Mirroring the register-level packing exactly:
    // @0x12275f8..@0x1227603
    //   ecx  = bitBuf[7] & 0xf
    //   r8   = bitBuf[1] & 0xf
    //   r9b <<= 4  →  r9  = (bitBuf[0] & 0xf) << 4
    //   edi  = r9 | r8   (byte value: [bitBuf[0]&f in high nib][bitBuf[1]&f in low nib])
    const p0 =
      (((this.bitBuf[0]! & 0xf) << 4) | (this.bitBuf[1]! & 0xf)) & 0xff;
    // @0x122760a..@0x1227618  edi <<= 8 ; r8 = bitBuf[2]&f << 4 ; esi = bitBuf[3]&f ; edi |= (r8 | esi)
    const p1 =
      (((this.bitBuf[2]! & 0xf) << 4) | (this.bitBuf[3]! & 0xf)) & 0xff;
    // @0x122761e..@0x122762b  esi <<= 8 ; edi = bitBuf[4]&f << 4 ; edx = bitBuf[5]&f ; edi |= (edi | edx)
    const p2 =
      (((this.bitBuf[4]! & 0xf) << 4) | (this.bitBuf[5]! & 0xf)) & 0xff;
    // @0x1227630..@0x122763b  edx <<= 8 ; eax = bitBuf[6]&f << 4 ; eax |= ecx (bitBuf[7]&f)
    const p3 =
      (((this.bitBuf[6]! & 0xf) << 4) | (this.bitBuf[7]! & 0xf)) & 0xff;
    // Compose: p0 at bits 24..31, p1 at 16..23, p2 at 8..15, p3 at 0..7.
    return ((p0 << 24) | (p1 << 16) | (p2 << 8) | p3) >>> 0;
  }
}
