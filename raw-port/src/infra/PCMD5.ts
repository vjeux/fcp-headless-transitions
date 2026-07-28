// PCMD5.ts - ProCore's MD5 message-digest streaming class. Faithful
// transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//     Versions/A/ProCore.
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.PCMD5.writeBytes.s    @0x8b816
//   raw-port/re/disasm/ProCore.PCMD5.flushBlocks.s   @0x8b8ba (685 lines - full MD5 core)
//   raw-port/re/disasm/ProCore.PCMD5.finish.s        @0x8c1e6
//   raw-port/re/disasm/ProCore.PCMD5.getHash.s       @0x8c28a
//
// ALGORITHM IDENTIFICATION (unambiguous from constants + rotate amounts):
//   flushBlocks contains all 64 canonical MD5 T[i] constants
//     T[1]  = 0xd76aa478    T[17] = 0xf61e2562    T[33] = 0xfffa3942    T[49] = 0xf4292244
//     T[2]  = 0xe8c7b756    T[18] = 0xc040b340    T[34] = 0x8771f681    T[50] = 0x432aff97
//     T[3]  = 0x242070db    T[19] = 0x265e5a51    T[35] = 0x6d9d6122    T[51] = 0xab9423a7
//     T[4]  = 0xc1bdceee    T[20] = 0xe9b6c7aa    T[36] = 0xfde5380c    T[52] = 0xfc93a039
//     T[5]  = 0xf57c0faf    T[21] = 0xd62f105d    T[37] = 0xa4beea44    T[53] = 0x655b59c3
//     T[6]  = 0x4787c62a    T[22] = 0x02441453    T[38] = 0x4bdecfa9    T[54] = 0x8f0ccc92
//     T[7]  = 0xa8304613    T[23] = 0xd8a1e681    T[39] = 0xf6bb4b60    T[55] = 0xffeff47d
//     T[8]  = 0xfd469501    T[24] = 0xe7d3fbc8    T[40] = 0xbebfbc70    T[56] = 0x85845dd1
//     T[9]  = 0x698098d8    T[25] = 0x21e1cde6    T[41] = 0x289b7ec6    T[57] = 0x6fa87e4f
//     T[10] = 0x8b44f7af    T[26] = 0xc33707d6    T[42] = 0xeaa127fa    T[58] = 0xfe2ce6e0
//     T[11] = 0xffff5bb1    T[27] = 0xf4d50d87    T[43] = 0xd4ef3085    T[59] = 0xa3014314
//     T[12] = 0x895cd7be    T[28] = 0x455a14ed    T[44] = 0x04881d05    T[60] = 0x4e0811a1
//     T[13] = 0x6b901122    T[29] = 0xa9e3e905    T[45] = 0xd9d4d039    T[61] = 0xf7537e82
//     T[14] = 0xfd987193    T[30] = 0xfcefa3f8    T[46] = 0xe6db99e5    T[62] = 0xbd3af235
//     T[15] = 0xa679438e    T[31] = 0x676f02d9    T[47] = 0x1fa27cf8    T[63] = 0x2ad7d2bb
//     T[16] = 0x49b40821    T[32] = 0x8d2a4c8a    T[48] = 0xc4ac5665    T[64] = 0xeb86d391
//   The rotate amounts are the canonical MD5 per-round schedule:
//     round 1: 7, 12, 17, 22   (repeat 4x)
//     round 2: 5,  9, 14, 20
//     round 3: 4, 11, 16, 23
//     round 4: 6, 10, 15, 21
//   All 62 immediate `addl $0x...` T-constants that appear in the disasm
//   match RFC 1321 exactly (grep verified). Two T constants (T[22] =
//   0x02441453 and T[44] = 0x04881d05) don't appear as raw imm32 in
//   `addl $imm,%reg` form because the compiler folded their value
//   into surrounding `leal disp32(%base,%idx)` addressing under peephole
//   optimization - they are still IN the final result, just not
//   directly visible as `$0x02441453` tokens. The 64 `roll` instructions
//   (grep-verified) confirm all 64 rounds are actually emitted.
//
//   Therefore this class implements RFC 1321 MD5 with an unusual
//   BATCHED 512-byte staging buffer (8 x 64-byte MD5 blocks buffered
//   before flushBlocks is called with a batch count) rather than the
//   textbook per-64-byte flush.
//
// STRUCT LAYOUT (recovered from writeBytes / finish / getHash):
//   +0x000  uint64_t  totalBytesWritten        ; `addq %rdx, (%rdi)` in
//                                                writeBytes; used in finish's
//                                                length-in-bits append.
//   +0x008  uint32_t  state[4]  = {a, b, c, d} ; MD5 chaining state (movl
//                                                0x8/0xc/0x10/0x14(%rdi))
//   +0x018  uint8_t   finished                 ; 1 = finish() already ran
//                                                (getHash checks 0x18(%rsi))
//   +0x019  (3 bytes padding to align next field)
//   +0x01c  uint8_t   buffer[576]              ; staging buffer. writeBytes
//                                                copies user bytes here until
//                                                the fill reaches 0x200 (=512),
//                                                then flushes as 8 blocks.
//                                                The extra 64 bytes (576-512)
//                                                are the padding-and-length
//                                                overflow space finish() uses
//                                                to write "up to 2 more blocks"
//                                                of pad + 8-byte length.
//   +0x25c  uint32_t  bufferFill               ; current count in [0, 512).
//                                                writeBytes reads/writes it;
//                                                finish uses it to place the
//                                                0x80 pad byte and length.
//
//   Total sizeof(PCMD5) = 0x260 = 608 bytes.
//
//   The base pointer trick in flushBlocks (`leaq 0x58(%rdi),%rcx` then
//   reads like `movl -0x3c(%rcx),%edx` = %rdi + 0x1c = buffer[0]) is a
//   compiler optimization to keep 8-bit signed displacements reachable
//   across a 576-byte buffer. It doesn't change the observable layout.
//
// KEY FAITHFULNESS DETAILS a naive port would miss:
//   * writeBytes updates totalBytesWritten by the CALLER's byteCount at
//     the very top (@0x8b82d `addq %rdx,(%rdi)`), BEFORE any buffering.
//     If flushBlocks or the caller panics mid-way, the counter is
//     already advanced. We mirror that.
//   * writeBytes has an INNER loop @0x8b855-0x8b88e that keeps
//     flushing 512-byte batches out of the input while remaining >= 512;
//     the buffer is only NON-empty during the first fill of the outer
//     path (`ecx` holds the initial bufferFill, then set to 0). The
//     tail copy at @0x8b895-0x8b89e stores the residue.
//   * finish's pad-length computation uses the classic MD5 idiom
//         padLen = ((-bufferFill - 1 - 8) mod 64) + 1 ... EXCEPT
//     this version is precomputed as:
//         padLen = ((bufferFill + 63) & ~63) - bufferFill;
//         if (padLen < 9) padLen += 64;
//         padLen -= 8;
//     which is the SAME "leave room for the 8-byte length" pad. The
//     compiler emits it in a slightly different SETcc-based sequence
//     that we transcribe branchlessly.
//   * finish writes the 0x80 pad byte via `movb $-0x80,-0x1(%rdi)` -
//     -0x80 as a signed byte IS 0x80 unsigned, matching RFC 1321.
//   * finish writes the length in BITS, not bytes: `movq (%rbx),%rcx ;
//     shlq $0x3,%rcx` at @0x8c23b-0x8c23e. Little-endian 8-byte store
//     via the `shrq $8` unrolled loop at @0x8c244-0x8c252.
//   * finish then calls flushBlocks with a computed batch count (the
//     `sarq $6` at @0x8c26e divides byte length by 64 to get block
//     count). @0x8c267 `cmovnsq %rcx,%rsi` picks the pre-negation
//     value; the negative-then-positive dance is standard for
//     signed-safe ceiling division.
//   * getHash checks 0x18(%rsi) (the finished flag) and calls finish()
//     lazily if not yet finished. It then constructs a PCHash128 (a
//     4-u32 tuple: a, b, c, d) into %rbx = the return-value slot.
//     PCHash128::PCHash128(u32,u32,u32,u32) is not yet transcribed
//     @ProCore 0x8c2b8 - see PCHash128 port when it lands.
//   * `___bzero` and `_memcpy` in writeBytes/finish are libc stubs;
//     we mirror them with plain TS array fills / TypedArray subarray
//     copies.
//
// FRONTIER (not yet transcribed):
//   PCHash128::PCHash128(u32,u32,u32,u32)  - not yet transcribed @ProCore 0x8c2b8
//   (Ripple: the getHash return value in native code is a 16-byte
//    PCHash128 struct returned by-reference; we surface it as a plain
//    JS object `{a,b,c,d}` tagged with kind:"PCHash128" for now.)

/** A 128-bit hash produced by PCMD5::getHash. Wire-compatible field
 *  order with the not-yet-ported PCHash128 (a,b,c,d = 4 u32 lanes). */
export interface PCHash128 {
  readonly kind: "PCHash128";
  /** state[0] after finish - little-endian first 4 bytes of the digest. */
  readonly a: number;
  /** state[1] */
  readonly b: number;
  /** state[2] */
  readonly c: number;
  /** state[3] */
  readonly d: number;
}

// MD5 T[i] constants (i in 1..64). Direct transcription of the 62
// `addl $imm,%reg` immediates plus the 2 folded-into-`leal` values,
// verified against RFC 1321 and against the rotate-amount pattern.
const T: readonly number[] = [
  // Round 1 (constants @0x8b919 onward)
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
  0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
  0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
  0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
  // Round 2
  0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
  0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
  0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
  // Round 3
  0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
  0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
  0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
  0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  // Round 4
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
  0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
  0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
  0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
];

/** Per-round rotate amounts, exact copy of `roll $imm,%reg` immediates. */
const S: readonly number[] = [
  // Round 1: 7, 12, 17, 22 (repeat 4x)
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  // Round 2: 5, 9, 14, 20
  5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
  // Round 3: 4, 11, 16, 23
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  // Round 4: 6, 10, 15, 21
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

/** Message-word index for round i (RFC 1321 g functions):
 *   round 1: g = i
 *   round 2: g = (5*i + 1) mod 16
 *   round 3: g = (3*i + 5) mod 16
 *   round 4: g = (7*i)     mod 16
 *  Confirmed by the -0x3c/-0x38/-0x34... offsets from the rebased
 *  buffer pointer %rcx (=%rdi + 0x58) in flushBlocks: the disasm reads
 *  the 16 4-byte words of the current block via short-signed displacements
 *  in exactly this pattern. */
const K: readonly number[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  1, 6, 11, 0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12,
  5, 8, 11, 14, 1, 4, 7, 10, 13, 0, 3, 6, 9, 12, 15, 2,
  0, 7, 14, 5, 12, 3, 10, 1, 8, 15, 6, 13, 4, 11, 2, 9,
];

/** 32-bit left rotate.
 *  Faithful to `roll $n,%reg`: the result is a 32-bit integer, unsigned
 *  in JS via `>>> 0`. */
function rotl32(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

/** 32-bit add with wrap. */
function add32(a: number, b: number): number {
  return (a + b) >>> 0;
}

/** PCMD5 - streaming MD5 hasher, byte-compatible with ProCore's PCMD5. */
export class PCMD5 {
  /** +0x000 - uint64 total bytes written (JS number, safe up to 2^53). */
  private totalBytesWritten: number = 0;
  /** +0x008 - MD5 chaining state a, b, c, d. Initial values are the
   *  RFC 1321 constants, which are set by the (not-ported here) ctor
   *  @Helium PCMD5::PCMD5(). We inline them so a freshly constructed
   *  PCMD5 matches the "just after ctor" native state. */
  private a: number = 0x67452301;
  private b: number = 0xefcdab89;
  private c: number = 0x98badcfe;
  private d: number = 0x10325476;
  /** +0x018 - finished flag. */
  private finished: boolean = false;
  /** +0x01c - 576-byte staging buffer. Held as Uint8Array to match the
   *  byte-level asm exactly. */
  private buffer: Uint8Array = new Uint8Array(576);
  /** +0x25c - current fill in [0, 512). */
  private bufferFill: number = 0;

  /**
   * writeBytes(const void* src, unsigned long n) - @ProCore 0x8b816.
   *
   * Faithful transcription:
   *   @0x8b82d  totalBytesWritten += n            ; addq %rdx,(%rdi)
   *   @0x8b830-0x8b834  r12 = &buffer[0] ; ecx = bufferFill
   *   @0x8b83a-0x8b844  if (bufferFill + n < 0x200) goto SHORT_COPY
   *   @0x8b846-0x8b855  memcpy(&buffer[bufferFill], src, 0x200 - bufferFill)
   *   @0x8b860-0x8b868  flushBlocks(8)             ; 0x200 bytes = 8 blocks
   *   @0x8b86d  src       += (0x200 - bufferFill)
   *   @0x8b870  bufferFill = 0
   *   @0x8b87b  n         -= (0x200 - bufferFill)  ; using the pre-update value in r13
   *   @0x8b884-0x8b88e  while (n >= 0x200) {
   *                       memcpy(buffer, src, 0x200); flushBlocks(8);
   *                       src += 0x200; n -= 0x200;
   *                     }
   *   @0x8b890  ecx = 0                            ; xorl %ecx,%ecx
   *   SHORT_COPY:
   *   @0x8b892-0x8b8a3  memcpy(&buffer[ecx], src, n); bufferFill += n
   *
   * @param src A Uint8Array of the bytes to write.
   * @param n   Byte count (must equal src.length in JS; we use the arg
   *            explicitly to mirror the native (void*, size_t) shape).
   */
  writeBytes(src: Uint8Array, n: number): void {
    // @0x8b82d  addq %rdx,(%rdi)
    this.totalBytesWritten = this.totalBytesWritten + n;
    let ecx = this.bufferFill | 0;      // @0x8b834  ecx = bufferFill
    let srcOff = 0;
    let remaining = n | 0;
    // @0x8b83a-0x8b844  cmpq $0x200
    if (ecx + remaining >= 0x200) {
      // First fill: complete the partial buffer to 512 bytes and flush.
      const firstChunk = (0x200 - ecx) | 0;   // @0x8b84c-0x8b852
      // @0x8b855-0x8b85b  memcpy(&buffer[bufferFill], src, firstChunk)
      this.buffer.set(src.subarray(srcOff, srcOff + firstChunk), ecx);
      // @0x8b860-0x8b868  flushBlocks(8)  ; %esi = 8 blocks in the 512-byte buffer
      this.flushBlocks(8);
      // @0x8b86d  src += firstChunk
      srcOff += firstChunk;
      // @0x8b870  bufferFill = 0
      this.bufferFill = 0;
      // @0x8b87b  n -= firstChunk
      remaining -= firstChunk;
      // @0x8b884-0x8b88e  while (n >= 0x200) { fill+flush }
      while ((remaining >>> 0) > 0x1ff) {
        // @0x8b855-0x8b85b  memcpy(buffer, src, 0x200)
        this.buffer.set(src.subarray(srcOff, srcOff + 0x200), 0);
        // @0x8b860-0x8b868  flushBlocks(8)
        this.flushBlocks(8);
        srcOff += 0x200;
        remaining -= 0x200;
      }
      // @0x8b890  ecx = 0
      ecx = 0;
    }
    // SHORT_COPY @0x8b892-0x8b8a3
    // memcpy(&buffer[ecx], src+srcOff, remaining) ; bufferFill = ecx + remaining
    this.buffer.set(src.subarray(srcOff, srcOff + remaining), ecx);
    this.bufferFill = (ecx + remaining) | 0;
  }

  /**
   * flushBlocks(unsigned long count) const - @ProCore 0x8b8ba.
   *
   * Processes `count` consecutive 64-byte MD5 blocks starting at
   * this.buffer[0]. This is the canonical MD5 compression function
   * (RFC 1321) - unambiguously identified in the disasm by:
   *   - all 64 T[i] constants (0xd76aa478 ... 0xeb86d391)
   *   - all 64 canonical rotate amounts (7,12,17,22 / 5,9,14,20 /
   *     4,11,16,23 / 6,10,15,21)
   *   - 64 `roll` instructions, one per round
   *   - the -0x3c(%rcx) / -0x38(%rcx) / ... reads which correspond to
   *     the message-word schedule for the round-2/3/4 g-functions
   *     [5i+1, 3i+5, 7i mod 16].
   *
   * We transcribe the algorithm structurally rather than instruction-
   * by-instruction: the unrolled 685-line body is a straight-line
   * expansion of the standard MD5 core, and any faithful implementation
   * of the T[i]/S[i]/K[i] tables with the standard f/g/h/i round
   * functions produces the same 128-bit chaining state as the asm.
   *
   * NOTE: the const-ness of the asm (marked `const` in the mangled
   * symbol) is a lie: it mutates state[] but reads bufferFill for
   * count. We preserve that "logically not-const" behavior.
   */
  private flushBlocks(count: number): void {
    let a = this.a >>> 0;
    let b = this.b >>> 0;
    let c = this.c >>> 0;
    let d = this.d >>> 0;
    for (let block = 0; block < count; block++) {
      // Read 16 little-endian u32 message words from the current 64-byte block.
      // The asm's %rcx = &buffer[block*64 + 0x3c], then reads -0x3c(%rcx),
      // -0x38(%rcx), ... - which is buffer[block*64 + 0], +4, ... in LE.
      const base = block * 64;
      const M: number[] = new Array(16);
      for (let i = 0; i < 16; i++) {
        const o = base + i * 4;
        M[i] =
          (this.buffer[o] |
            (this.buffer[o + 1] << 8) |
            (this.buffer[o + 2] << 16) |
            (this.buffer[o + 3] << 24)) >>>
          0;
      }
      const A0 = a, B0 = b, C0 = c, D0 = d;
      // 64 rounds - unrolled logically via loop over T/S/K tables.
      // The four per-round F/G/H/I functions are RFC 1321 verbatim,
      // recognizable in the disasm as:
      //   round 1 F(b,c,d) = (b & c) | (~b & d)
      //           impl in asm as `movl %r8d,%esi ; xorl %r9d,%esi ;
      //           andl %eax,%esi ; xorl %r8d,%esi`  (that's the
      //           equivalent d ^ (b & (c ^ d)), verified below)
      //   round 2 G(b,c,d) = (b & d) | (c & ~d)
      //           = c ^ (d & (b ^ c))    (asm pattern @0x8bc00+ range)
      //   round 3 H(b,c,d) = b ^ c ^ d
      //   round 4 I(b,c,d) = c ^ (b | ~d)
      // For each round i in [0,64):  a = b + rotl((a + f + M[K[i]] + T[i]), S[i]);
      // then rotate the (a,b,c,d) register roles - this is the standard
      // MD5 core, and the identity of the disasm's constants+rotates
      // proves it byte-for-byte.
      for (let i = 0; i < 64; i++) {
        let f: number;
        if (i < 16) {
          // Round 1: F(b,c,d) = d ^ (b & (c ^ d))  (RFC 1321 form)
          f = (d ^ (b & (c ^ d))) >>> 0;
        } else if (i < 32) {
          // Round 2: G(b,c,d) = c ^ (d & (b ^ c))
          f = (c ^ (d & (b ^ c))) >>> 0;
        } else if (i < 48) {
          // Round 3: H(b,c,d) = b ^ c ^ d
          f = (b ^ c ^ d) >>> 0;
        } else {
          // Round 4: I(b,c,d) = c ^ (b | ~d)
          f = (c ^ (b | ~d)) >>> 0;
        }
        const temp = add32(add32(add32(a, f), M[K[i]]), T[i]);
        a = d;
        d = c;
        c = b;
        b = add32(b, rotl32(temp, S[i]));
      }
      a = add32(a, A0);
      b = add32(b, B0);
      c = add32(c, C0);
      d = add32(d, D0);
    }
    this.a = a >>> 0;
    this.b = b >>> 0;
    this.c = c >>> 0;
    this.d = d >>> 0;
  }

  /**
   * finish() const - @ProCore 0x8c1e6.
   *
   * Faithful transcription of the MD5 finalization:
   *   @0x8c1f3  r14 = bufferFill
   *   @0x8c1fa-0x8c201  eax = ((bufferFill + 63) & ~63) - bufferFill
   *                     ; distance to next 64-byte boundary
   *   @0x8c204-0x8c20f  if (eax < 9) eax += 64
   *   @0x8c211  eax -= 8                    ; leave 8 bytes for length
   *   @0x8c214-0x8c21b  buffer[bufferFill] = 0x80    ; movb $-0x80,-0x1(%rdi)
   *                     (the `addq $0x1d` at @0x8c217 = 0x1c + 1 for the -0x1
   *                      then puts the 0x80 at &buffer[bufferFill])
   *   @0x8c21f-0x8c22b  if (padBytesAfter0x80 > 0) bzero(&buffer[bufferFill+1], padBytesAfter0x80)
   *   @0x8c230-0x8c23e  cnt = totalBytesWritten << 3   ; length in BITS
   *   @0x8c242-0x8c252  little-endian store 8 bytes of `cnt` at end of pad
   *   @0x8c25f-0x8c272  count = (pad_end_offset) >> 6  ; # of 64-byte blocks
   *   @0x8c275  flushBlocks(count)
   *   @0x8c27a  finished = 1                ; movb $0x1, 0x18(%rbx)
   */
  finish(): void {
    const bf = this.bufferFill | 0;                    // @0x8c1f3
    // @0x8c1fa-0x8c201  padUpToBoundary = ((bf + 63) & ~63) - bf
    let pad = (((bf + 63) & ~63) - bf) | 0;
    // @0x8c204-0x8c20f  if (pad < 9) pad += 64
    if (pad < 9) pad = (pad + 64) | 0;
    // @0x8c211  pad -= 8  (leave 8 bytes at the very end for the bit-length)
    pad = (pad - 8) | 0;
    // @0x8c214-0x8c21b  buffer[bf] = 0x80
    this.buffer[bf] = 0x80;
    // @0x8c21f-0x8c22b  bzero the (pad - 1) trailing zero pad bytes
    // (the -0x1 in the asm's `leaq -0x1(%r15),%rsi` is because the 0x80
    // is already written, so bzero starts AFTER it and covers pad-1 bytes)
    if (pad > 1) {
      const zeroStart = (bf + 1) | 0;
      const zeroEnd = (zeroStart + (pad - 1)) | 0;
      for (let i = zeroStart; i < zeroEnd; i++) this.buffer[i] = 0;
    }
    // @0x8c230-0x8c23e  bitCount = totalBytesWritten * 8, little-endian 8-byte store
    // at position (bf + pad).
    const bitLenOffset = (bf + pad) | 0;
    // JavaScript numbers safely hold up to 2^53 bits ~ 2^50 bytes - way more than
    // any realistic hashing input. We split into hi32/lo32 for the LE store.
    // bitCount = totalBytesWritten * 8
    // In native asm, `shlq $3,%rcx` shifts a 64-bit value in %rcx by 3.
    // We reproduce with BigInt to keep the top bits precise for large inputs.
    const bitsBig = (BigInt(this.totalBytesWritten) << 3n) & 0xffffffffffffffffn;
    const lo = Number(bitsBig & 0xffffffffn) >>> 0;
    const hi = Number((bitsBig >> 32n) & 0xffffffffn) >>> 0;
    // @0x8c244-0x8c252  little-endian 8-byte store (unrolled loop, 8 iterations)
    this.buffer[bitLenOffset + 0] = (lo)         & 0xff;
    this.buffer[bitLenOffset + 1] = (lo >>>  8)  & 0xff;
    this.buffer[bitLenOffset + 2] = (lo >>> 16)  & 0xff;
    this.buffer[bitLenOffset + 3] = (lo >>> 24)  & 0xff;
    this.buffer[bitLenOffset + 4] = (hi)         & 0xff;
    this.buffer[bitLenOffset + 5] = (hi >>>  8)  & 0xff;
    this.buffer[bitLenOffset + 6] = (hi >>> 16)  & 0xff;
    this.buffer[bitLenOffset + 7] = (hi >>> 24)  & 0xff;
    // @0x8c25f-0x8c272  block count = (bf + pad + 8) / 64
    const totalPadded = (bf + pad + 8) | 0;
    const count = (totalPadded >> 6) | 0;
    // @0x8c275  flushBlocks(count)
    this.flushBlocks(count);
    // @0x8c27a  finished = 1
    this.finished = true;
  }

  /**
   * getHash() const - @ProCore 0x8c28a.
   *
   *   @0x8c297-0x8c2a0  if (!finished) finish()
   *   @0x8c2a5-0x8c2b8  construct PCHash128(state[0], state[1], state[2], state[3])
   *                     into %rbx = return-value slot
   *
   * The concrete ctor `PCHash128::PCHash128(u32,u32,u32,u32)` is not
   * yet transcribed @ProCore 0x8c2b8; the on-disk struct layout is
   * (a, b, c, d) = 4x u32 = 16 bytes, mirroring the MD5 chaining state
   * in memory order.
   */
  getHash(): PCHash128 {
    // @0x8c297  cmpb $0,0x18(%rsi)  ; jne skip
    if (!this.finished) {
      // @0x8c2a0  callq __ZNK5PCMD56finishEv
      this.finish();
    }
    // @0x8c2a5-0x8c2b8  PCHash128 ctor call
    // (PCHash128::PCHash128(u32,u32,u32,u32) - not yet transcribed @ProCore 0x8c2b8)
    return {
      kind: "PCHash128",
      a: this.a >>> 0,
      b: this.b >>> 0,
      c: this.c >>> 0,
      d: this.d >>> 0,
    };
  }
}
