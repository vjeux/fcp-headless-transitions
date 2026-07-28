// raw-port: BitstreamReader — Flexo framework (channels layer)
//
// A big-endian bitstream reader. State is kept as a 32-bit lookahead
// register (buffer0) with a companion 32-bit "next" register (buffer1),
// a bit-position counter, plus source pointer bookkeeping. All reads
// treat the source bytes as a big-endian stream.
//
// Only three entry points are published, all decoded here:
//   0x014203f0  BitstreamReader::initialize(unsigned char const*, unsigned int)
//   0x01420500  BitstreamReader::flushBits(int)
//   0x014206e0  BitstreamReader::getBits(int)
//
// Object layout (proven by field-offset stores across all three methods):
//   +0x00 (u32)  buffer0                — current MSB-aligned 32-bit window
//   +0x04 (u32)  buffer1                — next 32-bit window (prefetched, MSB-aligned)
//   +0x08 (u32)  bitsInBuffer1          — position within buffer1 (0..32).
//                                        Stored 0 by initialize (@0x142045a),
//                                        stored `pos+32` by flushBits (@0x14206c8)
//                                        after each 4-byte refill. Getters read at
//                                        @0x142050d / @0x14206f1.
//   +0x10 (u8*)  srcCursor              — next byte to consume from source (@0x14204e5)
//   +0x18 (u8*)  srcAlignedEnd          — cursor rounded down to a 4-byte boundary
//                                        from the actual end (@0x14204ec)
//   +0x20 (u8*)  srcEnd                 — one past the last valid source byte (@0x14204f3)
//   +0x28 (u32)  bitsAvailable          — count of bits still buffered, clamped
//                                        to 0x3f (63). Initialized to 32-8*prefix
//                                        by initialize (@0x14204d9), decremented
//                                        by consumer methods.
//
// SIMD note: both flushBits and getBits contain an inner SSE4 loop
// (@0x14205e0..0x142063d for flushBits, @0x14207d0..0x142082d for getBits)
// that vectorizes the tail-byte accumulation used when the aligned-end
// pointer has been reached but the buffer still holds fewer than four
// bytes of remaining input. The vector loop reads 8 bytes at a time as
// bytes, shifts each into an MSB-aligned dword using `pmulld` against a
// shift-count-derived multiplier vector, ORs them together, then
// horizontally reduces the four lanes with two `pshufd`+`por` pairs.
// This is semantically identical to the scalar big-endian byte-into-
// -word accumulator at @0x1420670..0x1420681 (flushBits) and
// @0x1420860..0x1420873 (getBits) that runs on the leftover 0..7 bytes.
// Because the SIMD path is a strict optimization of the scalar path,
// this port implements the scalar refill (which is a subset of the
// asm graph) — the SIMD path is provenance-cited but its lane math is
// not separately re-implemented; any input that exercises it produces
// the same u32 as the scalar path.

/**
 * BitstreamReader — big-endian MSB-first bitstream reader.
 *
 * The reader mutates its own state on every extraction call. All
 * external observation is via the state fields (which mirror C++'s
 * struct fields at the offsets given above) or the u32 return of
 * getBits.
 */
export class BitstreamReader {
  /** Field +0x00 — current 32-bit MSB-aligned window. */
  buffer0: number = 0;
  /** Field +0x04 — next 32-bit MSB-aligned window (prefetched). */
  buffer1: number = 0;
  /**
   * Field +0x08 — bit position inside buffer1 (0..32). Initialized to 0
   * @0x142045a; flushBits recomputes this as `edx += 32` after each
   * refill (@0x14206a8) and stores back @0x14206c8.
   */
  bitsInBuffer1: number = 0;
  /**
   * Field +0x10 — cursor into the source byte array. Undefined when
   * the source is empty. Post-initialize points at the first byte AFTER
   * the bytes already loaded into buffer0/buffer1 (@0x14204e5).
   */
  srcCursor: number = 0;
  /**
   * Field +0x18 — cursor's 4-byte-aligned reach limit
   * (srcCursor + ((len - prefix) & ~3) @0x14204ec).
   */
  srcAlignedEnd: number = 0;
  /** Field +0x20 — one-past-the-last source byte (@0x14204f3). */
  srcEnd: number = 0;
  /**
   * Field +0x28 — total buffered bits available, clamped to 63.
   * Initialize sets this to 32 - 8*prefixBytesLoaded (@0x14204d9);
   * getBits/flushBits decrement it by the extraction count and refill
   * paths clamp with `cmovbl` against 0x3f (@0x14206a4 / @0x1420896).
   */
  bitsAvailable: number = 0;

  /** Source byte array (external). initialize captures a view into this. */
  private _src: Uint8Array = new Uint8Array(0);

  /**
   * BitstreamReader::initialize(unsigned char const*, unsigned int)
   *   @0x014203f0
   *
   * Faithful asm mirror. The function has three top-level branches on
   * the `len` (%edx) argument:
   *   len == 0       →  buffer0 = 0, bitsAvailable = 32   (@0x142044c/@0x1420452)
   *                     — the reader is initialized empty; subsequent
   *                     getBits will return whatever `buffer0>>(32-n)` yields
   *                     from all zeros (i.e. 0). Note bitsAvailable=32 is
   *                     the "no data buffered" sentinel used by the refill
   *                     path (see the `subl %esi,%eax; jns done` short
   *                     circuit at @0x1420536/@0x1420728).
   *   1 <= len <= 3  →  buffer0 = up to 3 source bytes packed MSB-first
   *                     into a 32-bit register, low bytes zero-padded
   *                     (@0x14203fb..0x1420420).
   *                     bitsAvailable = 32 - 8*len                (@0x142042b..0x1420434 → r8)
   *                     srcCursor advanced by len                 (@0x1420437)
   *                     len (r9) becomes new "consumed" count so
   *                     bitsInBuffer1 stays 0.
   *   len >= 4       →  buffer0 = bswap32(*(u32*)src)             (@0x142043c..0x142043e)
   *                     srcCursor += 4                             (@0x1420440)
   *                     bitsAvailable = 0 (unclamped counter r8)    (@0x1420447)
   *                     len' (%eax) = len - 4                       (@0x1420444)
   *
   * After the top block, all three branches join at @0x1420454, which
   * writes bitsAvailable=r8, buffer0=%ecx, and bitsInBuffer1=0.
   *
   * The tail (@0x1420461..0x14204dc) attempts one immediate refill of
   * buffer1 from the source, ONLY if the current srcCursor is not
   * 4-byte aligned AND enough bytes remain past the misalignment to
   * fill a whole u32. That refill is a big-endian byte read gated on
   * the low 2 bits of the pointer.
   *
   * Final field writes @0x14204dd..0x14204f3:
   *   buffer1        = %ecx (whatever the refill produced or original 0)
   *   srcAlignedEnd  = srcCursor + ((remaining) & ~3)
   *   srcEnd         = srcCursor + remaining
   */
  initialize(src: Uint8Array, srcOffset: number, len: number): void {
    this._src = src;
    const rsiStart = srcOffset >>> 0;
    const lenU = len >>> 0;
    let rsi = rsiStart;
    // %eax initialized to 0 @0x14203f5.
    let eax = 0 >>> 0;
    // r8 (→ +0x28) and ecx (→ +0x00) computed by branch.
    let r8: number;
    let ecx: number;

    if (lenU === 0) {
      // @0x142044c: r8 = 0x20 ; ecx = 0
      r8 = 0x20;
      ecx = 0;
    } else {
      // @0x14203fb..0x1420420 — load 1..3 bytes MSB-first into ecx.
      ecx = (src[rsi] << 24) >>> 0;
      if (lenU >= 2) {
        // @0x1420406..0x142040f
        ecx = (ecx | ((src[rsi + 1] << 16) >>> 0)) >>> 0;
      }
      if (lenU >= 3) {
        // @0x1420417..0x1420420
        ecx = (ecx | ((src[rsi + 2] << 8) >>> 0)) >>> 0;
      }

      if (lenU >= 4) {
        // @0x142043c..0x1420447 — full u32 fast path.
        // Overwrite ecx with bswap32(*(u32*)rsi).
        const b0 = src[rsi];
        const b1 = src[rsi + 1];
        const b2 = src[rsi + 2];
        const b3 = src[rsi + 3];
        ecx = (((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0);
        rsi = (rsi + 4) >>> 0;
        eax = (lenU - 4) >>> 0;
        r8 = 0;
      } else {
        // @0x1420423..0x1420437 — 1..3 byte path fixup.
        // r9 = len*8 ; r8 = 32 - r9 ; rsi += len
        const r9 = (lenU * 8) >>> 0;
        r8 = (0x20 - r9) >>> 0;
        rsi = (rsi + lenU) >>> 0;
        // %eax stays 0 (initialized) — remaining bytes to consume.
      }
    }

    // Join @0x1420454..0x142045a:
    //   this->bitsAvailable = r8 ; this->buffer0 = ecx ; this->bitsInBuffer1 = 0
    this.bitsAvailable = r8 >>> 0;
    this.buffer0 = ecx >>> 0;
    this.bitsInBuffer1 = 0;

    // @0x1420461 — ecx = 0 (this is the "buffer1 preload" candidate).
    let bufOne = 0 >>> 0;

    // @0x1420463..0x14204dc — one-shot pre-alignment refill of buffer1
    // if rsi is not 4-byte aligned AND we have enough remaining bytes
    // to fill the misalignment gap. `%eax` here is the "remaining bytes"
    // count set at @0x1420444 (only for len>=4 path; else 0).
    if ((rsi & 0x3) !== 0) {
      // @0x1420469..0x142046c: r8 = rsi & 3  (misalignment)
      const r8sub = rsi & 0x3;
      // @0x1420470..0x1420476: r9 = 4 - r8   (bytes needed for alignment)
      const r9sub = (4 - r8sub) >>> 0;
      // @0x1420479..0x142047c: if r9 > eax, skip refill (not enough data)
      if (r9sub <= eax) {
        // @0x1420482..0x14204b0 — big-endian byte accumulator, reading
        // up to 4 bytes but only summing (r9) of them (i.e. bytes
        // needed for alignment). The switch is on r8sub (1..3).
        let acc = ((src[rsi] << 24) >>> 0);
        if (r8sub !== 3) {
          acc = (acc | ((src[rsi + 1] << 16) >>> 0)) >>> 0;
        }
        if (r8sub !== 3 && r8sub !== 2) {
          acc = (acc | ((src[rsi + 2] << 8) >>> 0)) >>> 0;
        }
        if (r8sub !== 3 && r8sub !== 2 && r8sub !== 1) {
          acc = (acc | (src[rsi + 3] >>> 0)) >>> 0;
        }
        // @0x14204b2..0x14204b7: r10 = r8*8  (bits contributed above the shift base)
        const r10 = (r8sub * 8) >>> 0;
        // @0x14204ba..0x14204bd: rsi += r9  (advance cursor by the refill count)
        rsi = (rsi + r9sub) >>> 0;
        // @0x14204c0..0x14204ce:
        //   eaxNew = ((len < 5) ? len : 4) + r8 - 8
        //   → adjusted remaining bit-account for buffer1.
        const eaxSel = (lenU >= 5) ? 4 : lenU;
        const eaxNew = ((eaxSel + r8sub) - 8) | 0;   // signed subtract
        eax = eaxNew >>> 0;
        // @0x14204d1..0x14204d9: bitsInBuffer1 = 32 - r10
        this.bitsInBuffer1 = ((0x20 - r10) >>> 0);
        bufOne = acc >>> 0;
      }
    }

    // Final field writes @0x14204dd..0x14204f3:
    //   buffer1        = ecx (bufOne)
    //   srcCursor      = rsi
    //   srcAlignedEnd  = rsi + (eax & ~3)
    //   srcEnd         = rsi + eax
    this.buffer1 = bufOne >>> 0;
    // @0x14204e0..0x14204e2: ecx = eax ; eax &= ~3
    const alignedRem = (eax & (~0x3 >>> 0)) >>> 0;
    this.srcCursor = rsi >>> 0;
    this.srcAlignedEnd = (rsi + alignedRem) >>> 0;
    this.srcEnd = (rsi + eax) >>> 0;
  }

  /**
   * Internal 32-bit big-endian refill used by BOTH flushBits (@0x142053e
   * dispatch, join @0x14206a8) AND getBits (@0x1420730 dispatch, join
   * @0x142089a). The two functions share this refill block verbatim
   * (same asm, different register colouring).
   *
   * Two paths:
   *   Fast path @0x1420544..0x142054e / @0x1420736..0x1420740:
   *     if (srcCursor < srcAlignedEnd) {
   *       nextWord = bswap32(*(u32*)srcCursor);
   *       srcCursor += 4;
   *     }
   *   Tail path @0x1420553..0x14206a4 / @0x1420745..0x1420896:
   *     Otherwise, pull the remaining 0..7 bytes as a big-endian
   *     accumulator into `nextWord`, updating bitsAvailable-adjustment
   *     accordingly and clamping to 63 via cmovbl.
   *
   * Returns {word, added} where `added` is the bit-count contribution
   * to bitsAvailable BEFORE the +32 baseline join, matching the asm's
   * cmovbl-clamped `%r10d/%r11d` value.
   */
  private _refillWord(): { word: number; added: number } {
    // @0x142053e..0x1420542 / @0x1420730..0x1420734
    if (this.srcCursor < this.srcAlignedEnd) {
      // @0x1420544..0x142054e — fast path.
      const p = this.srcCursor;
      const s = this._src;
      const w = (((s[p] << 24) | (s[p + 1] << 16) | (s[p + 2] << 8) | s[p + 3]) >>> 0);
      this.srcCursor = (p + 4) >>> 0;
      // Fast path re-joins at @0x14206a8: `leal 0x20(%rdx),%esi` — bitsInBuffer1 += 32
      // and bitsAvailable is NOT re-clamped (the caller code below @0x14208b2 sets edx
      // = esi to the new bitsInBuffer1 count). We surface `added=32` here so the
      // caller can perform the same accounting; but note in the FAST path the asm
      // takes a different code path that doesn't run through the 0x3f clamp.
      return { word: w, added: 32 };
    }

    // @0x1420553..0x14206a4 — tail path.
    let sc = this.srcCursor;
    const se = this.srcEnd;
    if (sc >= se) {
      // @0x142076a..0x142088a in getBits / @0x1420578..0x1420698 in flushBits:
      // no bytes left. ecx = 0x20 ; r14 = 0.
      // Falls through to the shared join that adds `r11d` (below).
      const ecx = 0x20;
      // Join @0x1420698..0x14206a4: ecx += bitsAvailable ; r10 = min(ecx, 0x3f)
      const added = Math.min((ecx + this.bitsAvailable) >>> 0, 0x3f) >>> 0;
      // srcCursor left unchanged (already >= srcEnd).
      return { word: 0, added };
    }

    // Some bytes remain (0 < remaining < 8 for the pure-scalar case; up to 7
    // for the vector case which is a semantic equivalent).
    // @0x142055c..0x142055f / @0x142074e..0x1420751: rbx = srcEnd - srcCursor
    const remaining = (se - sc) >>> 0;
    let acc = 0 >>> 0;
    // ecx starts at 0x20 - 8*fastLanes, i.e. we accumulate bytes into
    // the MSB of `acc`, decrementing the shift count by 8 each byte.
    // The vectorized fast lane runs (remaining & ~7) bytes; the trailing
    // (remaining & 7) bytes are handled by the scalar loop
    // @0x142065f..0x1420681 / @0x142084f..0x1420873. The vector path is a
    // strict optimization of the scalar accumulator (each `pmulld` slot
    // computes byte<<((32-1-i)*8) — cf. @0x14205e0..0x142063d), so this
    // faithful port implements the scalar equivalent for ALL remaining
    // bytes. Same result, no lane math.
    // NOTE: scalar shift base is 24 (i.e. `shll $0x18` @0x142082e-style
    // — actually @0x14205e0..0x14205ff and its scalar analogue @0x1420860
    // subtract 8 each iteration starting from a 0x20 base).
    let shift = 24;
    for (let i = 0; i < remaining && shift >= 0; i++) {
      acc = (acc | ((this._src[sc + i] << shift) >>> 0)) >>> 0;
      shift -= 8;
    }
    // @0x1420683..0x1420695 (/ @0x1420875..0x1420887):
    //   r8 = srcEnd*8 ; ecx = edx*8 ; r8 -= ecx ; r8 = r8 + 0x20 ; srcCursor = srcEnd
    // In words: the "unread bits" contribution is 32 + 8*(srcEnd_bit - edx_bit)
    // where edx here is a local "byte offset" derived from remaining. This
    // is equivalent to `added = 32 + 8*remaining` before clamp.
    this.srcCursor = se >>> 0;
    // @0x1420698..0x14206a4 (/ @0x142088a..0x1420896): ecx += bitsAvailable ; r11 = min(ecx, 0x3f)
    const ecxTail = ((0x20 + 8 * remaining) + this.bitsAvailable) >>> 0;
    const added = Math.min(ecxTail, 0x3f) >>> 0;
    return { word: acc, added };
  }

  /**
   * BitstreamReader::flushBits(int)   @0x01420500
   *
   * Consumes `n` (%esi) bits from the front of the bitstream, refilling
   * buffer0/buffer1 as needed and updating bitsAvailable. Does NOT
   * return a value.
   *
   * Faithful asm mirror:
   *   @0x1420507..0x1420509  ebx = buffer0 ; r11 = buffer1
   *   @0x142050d              eax = bitsInBuffer1
   *   @0x1420510              ebx <<= 1                       ; buffer0 <<= 1 pre-shift
   *   @0x1420512..0x1420517   ebx <<= (n - 1)                 ; ebx = buffer0 << n
   *   @0x1420519              r8 = srcCursor
   *   @0x142051d..0x1420524   r9 = buffer1 >> (32 - n)        ; top n bits of buffer1
   *   @0x1420527              r10 = bitsAvailable
   *   @0x142052b              r9 |= ebx                       ; combined bits (going to buffer0)
   *   @0x142052e..0x1420533   r11 <<= n                       ; buffer1 <<= n
   *   @0x1420536              eax -= n                        ; bitsInBuffer1 -= n
   *   @0x1420538  jns 0x14206c1                                ; if still positive, skip refill
   *   [refill block — see _refillWord()]
   *   @0x14206a8              edx = eax + 32                  ; new bitsInBuffer1 after +32 credit
   *   @0x14206ab..0x14206b0   r9 |= (nextWord >> eax)         ; splice refill bits into r9
   *   @0x14206b5              r11 = nextWord << 1
   *   @0x14206b8..0x14206bc   r11 <<= (~eax & 31)             ; (i.e. r11 <<= (32 - eax) - 1)
   *   @0x14206bf              eax = edx
   *   @0x14206c1..0x14206cf   Store: buffer0=r9; buffer1=r11;
   *                                  bitsInBuffer1=eax; srcCursor=r8;
   *                                  bitsAvailable = r10  (unchanged in fast path)
   *                                              or  = capped (in refill path via cmovbl @0x14206a4)
   */
  flushBits(n: number): void {
    // @0x1420507..0x142050d
    let ebx = this.buffer0 >>> 0;
    let r11 = this.buffer1 >>> 0;
    let eax = this.bitsInBuffer1 | 0;
    // @0x1420510..0x1420517: ebx = buffer0 << n  (via <<=1 then <<=(n-1))
    ebx = ((ebx << 1) >>> 0);
    ebx = ((ebx << ((n - 1) & 31)) >>> 0);
    // @0x1420519
    let r8 = this.srcCursor >>> 0;
    // @0x142051d..0x1420524: r9 = buffer1 >>> (32 - n)   — top n bits of buffer1
    const shiftHi = ((-n) & 31) >>> 0; // == 32 - n for 1<=n<=31 (matches negl+shrl asm)
    let r9 = (this.buffer1 >>> shiftHi) >>> 0;
    // @0x1420527
    let r10 = this.bitsAvailable >>> 0;
    // @0x142052b
    r9 = (r9 | ebx) >>> 0;
    // @0x142052e..0x1420533: r11 <<= n
    r11 = (((r11 << 1) >>> 0) << ((n - 1) & 31)) >>> 0;
    // @0x1420536
    eax = (eax - n) | 0;

    if (eax < 0) {
      // Refill path @0x142053e..0x14206a4.
      const savedCursor = this.srcCursor;
      const refill = this._refillWord();
      // _refillWord already advanced this.srcCursor and used bitsAvailable
      // implicitly for the "added" clamp; capture the new cursor/state.
      r8 = this.srcCursor >>> 0;
      r10 = refill.added >>> 0;
      const nextWord = refill.word >>> 0;
      // @0x14206a8: edx = eax + 32
      const edx = (eax + 32) | 0;
      // @0x14206ab..0x14206b2: r9 |= (nextWord >>> eax_shift)
      // The %ecx used at @0x14206ae is the ORIGINAL negative eax; x86
      // shr masks to low 5 bits, so this is (nextWord >>> (eax & 31)).
      r9 = (r9 | (nextWord >>> (eax & 31))) >>> 0;
      // @0x14206b5..0x14206bc: r11 = (nextWord << 1) << (~eax & 31)
      r11 = (((nextWord << 1) >>> 0) << ((~eax) & 31)) >>> 0;
      // @0x14206bf: eax = edx
      eax = edx | 0;
      // Suppress unused-var lint on savedCursor: intentionally kept for provenance
      // (r8 pre-refill @0x1420519 vs post @0x142054a).
      void savedCursor;
    }
    // else: fast path — skip refill (@0x1420538 jns 0x14206c1). bitsAvailable
    // is NOT re-computed in this branch (%r10d remains the loaded value).

    // Store @0x14206c1..0x14206cf.
    this.buffer0 = r9 >>> 0;
    this.buffer1 = r11 >>> 0;
    this.bitsInBuffer1 = (eax | 0) >>> 0;
    this.srcCursor = r8 >>> 0;
    this.bitsAvailable = r10 >>> 0;
  }

  /**
   * BitstreamReader::getBits(int)  @0x014206e0
   *
   * Extracts `n` (%esi) bits from the front of the bitstream (as an
   * unsigned integer in the low bits of the return), advances the
   * cursor by `n`, and refills as needed. Returns the extracted u32.
   *
   * Faithful asm mirror:
   *   @0x14206eb..0x14206f8   Load: eax=buffer0 ; r14=buffer1 ; edx=bitsInBuffer1;
   *                                 r10=srcCursor ; r11=bitsAvailable
   *   @0x14206fc..0x1420707   r15 = buffer0 << n
   *   @0x142070a..0x1420719   r8 = 32 - n
   *   @0x142070a..0x142071c   ebx = (buffer1 >>> (32-n)) | r15
   *   @0x142071f..0x1420725   r14 = buffer1 << n
   *   @0x1420728..0x142072a   edx -= n ; jns 0x14208b4 (skip refill if edx >= 0)
   *   [refill @0x1420730..0x1420896 — see _refillWord()]
   *   @0x142089a..0x14208af   Same splice as flushBits refill.
   *   @0x14208b4..0x14208b7   eax = buffer0 >>> (32 - n)      ; RETURN VALUE = top n bits
   *   @0x14208b9..0x14208c6   Store fields.
   *
   * The return value (`%eax` on exit @0x14208d2) is `buffer0 >>> (32 - n)`.
   */
  getBits(n: number): number {
    // @0x14206eb..0x14206f8
    let eax = this.buffer0 >>> 0;
    let r14 = this.buffer1 >>> 0;
    let edx = this.bitsInBuffer1 | 0;
    let r10 = this.srcCursor >>> 0;
    let r11 = this.bitsAvailable >>> 0;

    // @0x14206fc..0x1420707: r15 = buffer0 << n  (via <<=1 then <<=(n-1))
    let r15 = ((eax << 1) >>> 0);
    r15 = ((r15 << ((n - 1) & 31)) >>> 0);
    // @0x142070a..0x142071c
    const r8 = ((32 - n) & 31) >>> 0;
    let ebx = ((r14 >>> r8) >>> 0);
    ebx = (ebx | r15) >>> 0;
    // @0x142071f..0x1420725: r14 = buffer1 << n
    r14 = ((((r14 << 1) >>> 0)) << ((n - 1) & 31)) >>> 0;
    // @0x1420728..0x142072a
    edx = (edx - n) | 0;

    if (edx < 0) {
      // Refill @0x1420730..0x1420896.
      const refill = this._refillWord();
      r10 = this.srcCursor >>> 0;
      r11 = refill.added >>> 0;
      const nextWord = refill.word >>> 0;
      // @0x142089a: esi = edx + 32
      const esi = (edx + 32) | 0;
      // @0x142089d..0x14208a5: ebx |= (nextWord >>> (edx & 31))
      ebx = (ebx | (nextWord >>> (edx & 31))) >>> 0;
      // @0x14208a8..0x14208af: r14 = (nextWord << 1) << (~edx & 31)
      r14 = (((nextWord << 1) >>> 0) << ((~edx) & 31)) >>> 0;
      // @0x14208b2
      edx = esi | 0;
    }

    // @0x14208b4..0x14208b7: eax = buffer0_ORIG >>> (32 - n)  — the return value.
    // Note the asm reads %eax which was set @0x14206eb to buffer0 and never
    // rewritten before this point; %r8d holds (32 - n). This is precisely
    // the "top n bits of buffer0" i.e. the extracted field.
    const ret = (n === 0) ? 0 : ((this.buffer0 >>> ((32 - n) & 31)) >>> 0);

    // Store @0x14208b9..0x14208c6.
    this.buffer0 = ebx >>> 0;
    this.buffer1 = r14 >>> 0;
    this.bitsInBuffer1 = (edx | 0) >>> 0;
    this.srcCursor = r10 >>> 0;
    this.bitsAvailable = r11 >>> 0;

    return ret >>> 0;
  }
}
