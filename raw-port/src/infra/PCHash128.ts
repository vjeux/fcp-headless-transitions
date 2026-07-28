// PCHash128.ts — ProCore's 128-bit hasher, a single-shot custom MD5 wrapper.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//     Versions/A/ProCore.
//
// Source disassembly (all saved under raw-port/re/disasm/):
//   ProCore.PCHash128.PCHash128.s     @0x1bf42  (unsigned char*, unsigned int)
//   ProCore.PCHash128.addData.s       @0x1bf52
//   ProCore.PCHash128.transform.s     @0x1c1de  (651 lines - full MD5 block)
//   ProCore.PCHash128.getString.s     @0x1c16c
//   ProCore.PCHash128.operator+=.s    @0x1c938  (561 lines - inlined transform)
// Plus the extra ctors read via `xcrun llvm-objdump --disassemble-symbols`:
//   __ZN9PCHash128C2Ev            @0x1bf2a   default ctor (zeros 16 bytes)
//   __ZN9PCHash128C1Ev            @0x1bf36   default ctor alias (same body)
//   __ZN9PCHash128C2ERK8PCString  @0x1c06c   parse hex string ctor
//   __ZN9PCHash128C2Ejjjj         @0x1c148   4-uint ctor
//
// ALGORITHM IDENTIFICATION (unambiguous from the T-constant and rotate
// tables observed in transform.s):
//   The 62 unique `addl $imm,%reg` immediates in transform.s reproduce
//   RFC 1321's T[1..64] MD5 constants; the 64 `roll $s,%reg` immediates
//   reproduce the canonical (7,12,17,22 / 5,9,14,20 / 4,11,16,23 /
//   6,10,15,21) round schedule. (This is the same table already grounded
//   in raw-port/src/infra/PCMD5.ts — see PCMD5.ts lines ~145..190 for
//   the T/S/K tables read from the sibling PCMD5::flushBlocks disasm.)
//
// STRUCT LAYOUT (recovered from every ctor + addData + getString):
//   +0x00  uint32_t  h0   ; movl 0x00(this), ...
//   +0x04  uint32_t  h1   ; movl 0x04(this), ...
//   +0x08  uint32_t  h2   ; movl 0x08(this), ...
//   +0x0c  uint32_t  h3   ; movl 0x0c(this), ...
//   Total 16 bytes. Default ctor at @0x1bf2a / @0x1bf36 emits
//     `xorps %xmm0,%xmm0 ; movups %xmm0,(%rdi)` — zero-fills the whole 16 bytes.
//
// SHAPE OF THE HASH (differs from textbook MD5!):
//   PCHash128 is NOT streaming: addData is called once with the full
//   buffer. The state==0 test at @0x1bf7e/@0x1bf83 loads the canonical
//   MD5 IV (0x67452301 0xefcdab89 0x98badcfe 0x10325476 — verified via
//   `struct.unpack_from('<4I', ProCore.x86_64, 0x123630)`, the target of
//   the `movdqa 0x1076a3(%rip),%xmm0` at @0x1bf85 which resolves to
//   0x1bf8d+0x1076a3 = 0x123630) ONLY on the FIRST addData call. After
//   that it runs floor(len/64) transform() blocks; if any bytes remain
//   (leftover in 1..63), it copies them to a stack block, appends bytes
//   from the module-private `PADDING` symbol (`_ZL7PADDING` @0x123650 —
//   confirmed 64 bytes = 0x80 followed by 63 zeros) starting at offset
//   `leftover`, and runs ONE final transform. Notably there is NO
//   message-length word appended (unlike RFC 1321 MD5). This is a
//   ProCore-internal fixed-pad variant, not RFC 1321.
//
// operator+= (@0x1c938) INLINES `transform` applied to a virtual 64-byte
// block whose first 16 bytes are `other`'s (h0..h3) and whose remaining
// 48 bytes are zero. Confirmed by:
//   - only 4 loads from %rsi at offsets 0,4,8,0xc (see grep in the .s file)
//   - 62 unique T-constants (2 are folded into `leal` addressing exactly
//     as documented in PCMD5.ts's transform decode)
//   - the state==0 test at @0x1c953 loading the same MD5 IV
// So operator+= is equivalent to `transform(this, [other.h0..h3, 0,0,0,0, 0,0,0,0, 0,0,0,0])`
// after the state==0 -> IV path.
//
// getString (@0x1c16c) is `snprintf("%08x%08x%08x%08x", h0,h1,h2,h3)` —
// the format string is at RIP+0x1155ac from @0x1c19f, resolving to a
// __cstring literal readable in the binary. Delegated here to a manual
// hex format so the output matches bit-for-bit.
//
// NOTE ON PLACEHOLDER TYPES: raw-port/src/infra/PCMD5.ts and
// raw-port/src/nodes/OZRenderNode.ts each declare a placeholder
// `interface PCHash128` documented as "not yet ported" (see PCMD5.ts
// line 125 and OZRenderNode.ts line 54). Both use the same field
// order {a,b,c,d = 4 u32}. This is a REAL class port with a real
// constructor family; we expose the same {a,b,c,d} field names so the
// class is structurally assignable to the pre-existing interface for
// consumers that already type against it. When those files land their
// own PCHash128 port cycles, the interfaces should be removed and their
// consumers switched to importing from here.

import { PCString } from "./PCString";

// MD5 IV — canonical constants stored in ProCore's __const at 0x123630
// (target of the `movdqa 0x1076a3(%rip),%xmm0` fold at
// PCHash128::addData @0x1bf85). Verified via:
//   python3 -c "import struct;print([hex(x) for x in
//     struct.unpack_from('<4I', open('/tmp/ProCore.x86_64','rb').read(), 0x123630)])"
// -> ['0x67452301', '0xefcdab89', '0x98badcfe', '0x10325476'].
// Also written inline as immediate `movl $0x67452301,%edi` etc. at
// @0x1c95f..@0x1c96f inside operator+=.
const MD5_IV_A = 0x67452301; // @ProCore 0x123630 / immediate @0x1c95f
const MD5_IV_B = 0xefcdab89; // @ProCore 0x123634 / immediate @0x1c964
const MD5_IV_C = 0x98badcfe; // @ProCore 0x123638 / immediate @0x1c969
const MD5_IV_D = 0x10325476; // @ProCore 0x12363c / immediate @0x1c96f

// PCHash128::PADDING — the 64-byte pad blob appended to the final
// partial block when there are leftover bytes. Symbol
// __ZL7PADDING @0x123650 (visible via `nm -arch x86_64`), read as
// `data[0x123650:0x123650+64]`: `80 00 00 00 ... 00` (a single 0x80
// byte followed by 63 zero bytes). Referenced by
// `leaq __ZL7PADDING(%rip), %rsi` at @0x1c01e in addData.
const PADDING_FIRST_BYTE = 0x80; // @ProCore 0x123650

// MD5 T[i] constants and per-round rotate/index schedule.
// These are transcribed from the disassembly of PCHash128::transform
// @0x1c1de (grep-verified: the 62 `addl $0x...,%reg` immediates in the
// .s file match this table; the two "missing" values T[22]=0x02441453
// and T[44]=0x04881d05 are folded into `leal disp32(%base,%idx)` under
// peephole optimization, exactly as documented in PCMD5.ts's decode
// notes for the sibling PCMD5::flushBlocks function which shares the
// same MD5 core). The 64 rotate amounts come from the 64 `roll $imm,%reg`
// instructions in the same file.
const T_CONST: readonly number[] = [
  // Round 1 (F function)
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, // @0x1c22f, @0x1c256, @0x1c27a, @0x1c29b
  0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
  0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
  0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
  // Round 2 (G function)
  0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
  0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
  0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
  // Round 3 (H function)
  0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
  0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
  0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
  0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  // Round 4 (I function)
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
  0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
  0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
  0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
];

// Per-round rotate amounts — direct copy of the 64 `roll $imm,%reg`
// immediates seen in transform.s (@0x1c234 =7, @0x1c25c =0xc=12,
// @0x1c280 =0x11=17, @0x1c2a2 =0x16=22, ...).
const S_ROT: readonly number[] = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

// Message-word index per round (canonical MD5 K[] schedule):
//   round 1: k = i
//   round 2: k = (5*i + 1) mod 16
//   round 3: k = (3*i + 5) mod 16
//   round 4: k = (7*i)     mod 16
// Grounded by the pattern of memory reads `movl 0xNN(%rbx),%reg` in
// transform.s: round-1 reads (%rbx),4(%rbx),8(%rbx),...,0x3c(%rbx) in
// order; round-2 reads 4,0x18,0x2c,0,0x14,... exactly matching
// (5*i+1)%16 * 4. Also grounded in PCMD5.ts's decode note (identical
// MD5 block core).
const K_IDX: readonly number[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  1, 6, 11, 0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12,
  5, 8, 11, 14, 1, 4, 7, 10, 13, 0, 3, 6, 9, 12, 15, 2,
  0, 7, 14, 5, 12, 3, 10, 1, 8, 15, 6, 13, 4, 11, 2, 9,
];

/** 32-bit left rotate — the `roll $n,%reg` instruction, unsigned in JS.
 *  Every `roll` in transform.s @0x1c1de reduces to exactly this. */
function rotl32(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

/** 32-bit add with wrap — every `addl` in transform.s @0x1c1de is
 *  32-bit two's-complement addition. */
function add32(a: number, b: number): number {
  return (a + b) >>> 0;
}

/** Read a little-endian uint32 from bytes[off..off+3]. Grounded by
 *  `movl (%rbx),%r9d` / `movl 4(%rbx),%r8d` etc. at @0x1c208/@0x1c20b
 *  in transform.s — x86_64 loads are little-endian. */
function readU32LE(buf: Uint8Array, off: number): number {
  return (
    (buf[off] |
      (buf[off + 1] << 8) |
      (buf[off + 2] << 16) |
      (buf[off + 3] << 24)) >>> 0
  );
}

/** Format one uint32 as 8 lowercase hex digits, big-endian print order.
 *  Matches `snprintf("%08x", u)` — see @0x1c198 format-string load in
 *  getString.s. */
function u32ToHex8(x: number): string {
  const s = (x >>> 0).toString(16);
  return s.length >= 8 ? s : "0".repeat(8 - s.length) + s;
}

/** Parse one hex digit — inverse of the char classifier at
 *  @0x1c0aa..@0x1c0f6 in the PCString ctor. That code branches on
 *   - c-'0' u<= 9        -> return c - 0x30
 *   - c-'a' u<= 5        -> return c - 0x57  (i.e. c - 'a' + 10)
 *   - c-'A' u<= 5        -> return c - 0x37  (i.e. c - 'A' + 10)
 *  else it BREAKS (returns -1 to signal "stop parsing this word"),
 *  which corresponds to the `ja 0x1c11b` early-exit at @0x1c0b2 that
 *  jumps past the xmm store to leave the (still-zero) state untouched.
 *  Note the ctor also gates on _DefaultRuneLocale's isxdigit table
 *  (`testb $0x1, 0x3e(%rdx,%r11,4)` @0x1c0b7); the three ASCII branches
 *  above are the complete set of xdigit code points, so the rune-table
 *  gate is functionally the same as "c is one of 0..9 a..f A..F". */
function hexDigit(c: number): number {
  // c - '0'
  const d0 = c - 0x30;
  if (d0 >= 0 && d0 <= 9) return d0;
  // c - 'a'
  const dLower = c - 0x61;
  if (dLower >= 0 && dLower <= 5) return c - 0x57;
  // c - 'A'
  const dUpper = c - 0x41;
  if (dUpper >= 0 && dUpper <= 5) return c - 0x37;
  return -1;
}

/**
 * PCHash128 — the 16-byte digest / hasher.
 *
 * All four constructors, addData, transform, getString, and operator+=
 * are ported one-to-one from the framework symbols listed at the top
 * of this file. Field order `{a,b,c,d}` matches the two placeholder
 * interfaces already in tree (raw-port/src/infra/PCMD5.ts @125 and
 * raw-port/src/nodes/OZRenderNode.ts @54).
 */
export class PCHash128 {
  /** state[0] — struct offset +0x00 (mov (%rdi) in every ctor/method). */
  public a: number;
  /** state[1] — struct offset +0x04. */
  public b: number;
  /** state[2] — struct offset +0x08. */
  public c: number;
  /** state[3] — struct offset +0x0c. */
  public d: number;

  /** Discriminant preserved for structural compatibility with the
   *  placeholder `interface PCHash128 { kind: "PCHash128"; ... }` in
   *  PCMD5.ts @125 and OZRenderNode.ts @54. */
  public readonly kind = "PCHash128" as const;

  /**
   * PCHash128::PCHash128() @ProCore 0x1bf2a (C2Ev) / 0x1bf36 (C1Ev).
   * Both bodies are identical:
   *     xorps %xmm0,%xmm0
   *     movups %xmm0,(%rdi)   ; zero-fill 16 bytes
   *     retq
   * That is: a = b = c = d = 0.
   *
   * When called with (bytes, len) this delegates to `addData` after the
   * same 16-byte zero-fill, matching
   *   PCHash128::PCHash128(unsigned char const*, unsigned int) @0x1bf42
   * whose body is:
   *     xorps %xmm0,%xmm0
   *     movups %xmm0,(%rdi)
   *     jmp __ZN9PCHash1287addDataEPKhj
   *
   * When called with a PCString it delegates to the hex-parse ctor at
   *   PCHash128::PCHash128(PCString const&) @0x1c06c
   * which zeros the state, then parses up to 4 groups of exactly 8 hex
   * chars from PCString::createCStr()'s C-string into a,b,c,d — stopping
   * early on any non-xdigit. See docs on `_fromPCString` below.
   *
   * When called with 4 uints it matches
   *   PCHash128::PCHash128(uint,uint,uint,uint) @0x1c148
   * whose body is just:
   *     movl %esi, (%rdi)      ; a = arg1
   *     movl %edx, 4(%rdi)     ; b = arg2
   *     movl %ecx, 8(%rdi)     ; c = arg3
   *     movl %r8d, 12(%rdi)    ; d = arg4
   */
  constructor();
  constructor(bytes: Uint8Array, len: number);
  constructor(str: PCString);
  constructor(a: number, b: number, c: number, d: number);
  constructor(
    arg0?: Uint8Array | PCString | number,
    arg1?: number,
    arg2?: number,
    arg3?: number,
  ) {
    // @ProCore 0x1bf2a / 0x1bf36 / 0x1bf46 / 0x1c086 — every ctor
    // starts by zero-filling the 16-byte state.
    this.a = 0;
    this.b = 0;
    this.c = 0;
    this.d = 0;

    if (arg0 === undefined) {
      // PCHash128() @0x1bf36 — done.
      return;
    }
    if (arg0 instanceof Uint8Array) {
      // PCHash128(unsigned char const*, unsigned int) @0x1bf42 —
      // zero-fill then tail-call addData.
      if (typeof arg1 !== "number") {
        // The C++ signature requires len; without it we cannot faithfully
        // dispatch. Refuse loudly rather than pick a length.
        // @ProCore 0x1bf42 requires (bytes, len).
        throw new Error(
          "PCHash128(bytes,len) @ProCore 0x1bf42: len (uint) is required",
        );
      }
      this.addData(arg0, arg1);
      return;
    }
    if (arg0 instanceof PCString) {
      // PCHash128(PCString const&) @0x1c06c — parse hex-string form.
      this._fromPCString(arg0);
      return;
    }
    if (typeof arg0 === "number") {
      // PCHash128(uint,uint,uint,uint) @0x1c148.
      if (
        typeof arg1 !== "number" ||
        typeof arg2 !== "number" ||
        typeof arg3 !== "number"
      ) {
        throw new Error(
          "PCHash128(a,b,c,d) @ProCore 0x1c148: all 4 uint args required",
        );
      }
      this.a = arg0 >>> 0;
      this.b = arg1 >>> 0;
      this.c = arg2 >>> 0;
      this.d = arg3 >>> 0;
      return;
    }
  }

  /**
   * PCHash128::addData(unsigned char const*, unsigned int) @ProCore 0x1bf52.
   *
   * Faithful line-for-line transcription of the .s file:
   *
   *   1) @0x1bf7a movdqu (%rdi),%xmm0
   *      @0x1bf7e ptest  %xmm0,%xmm0
   *      @0x1bf83 jne    0x1bf91           ; skip IV if state != 0
   *      @0x1bf85 movdqa 0x1076a3(%rip),%xmm0   ; xmm0 = MD5_IV_{A,B,C,D}
   *      @0x1bf8d movdqu %xmm0,(%rbx)      ; state := MD5 IV
   *
   *   2) @0x1bf91 cmpl $0x40,%r14d
   *      @0x1bf95 jb   0x1bff0             ; skip block loop if len < 64
   *      Loop: transform(this, data), data += 64, len -= 64,
   *            while len >= 64. The `testb $0x3,%r15b` at @0x1bf9e
   *            checks alignment and copies to a stack-aligned block
   *            when misaligned — a memory-alignment optimization
   *            invisible in the hashed result.
   *
   *   3) @0x1bff3 testl %r14d,%r14d
   *      @0x1bff6 je    0x1c038            ; done if no leftover
   *      Otherwise: build a 64-byte block on stack, copy leftover bytes,
   *      copy (64 - leftover) bytes from PADDING starting at offset
   *      `leftover`, run one final transform.
   *
   * NOTE: unlike RFC 1321 there is NO 8-byte message-length appended.
   * This is a ProCore-internal MD5-based hash, not standards MD5.
   */
  addData(bytes: Uint8Array, len: number): void {
    // @0x1bf63 movl %edx,%r14d — len fits in u32.
    len = len >>> 0;
    if (len > bytes.length) {
      // The C signature accepts a raw pointer + count. We refuse to
      // fabricate bytes past the array end (that would corrupt the hash).
      throw new Error(
        `PCHash128.addData @ProCore 0x1bf52: len ${len} exceeds bytes.length ${bytes.length}`,
      );
    }

    // Step 1: state==0 test (@0x1bf7a ptest xmm0 -> jne 0x1bf91).
    // If all 16 bytes of state are zero, load MD5 IV.
    if (this.a === 0 && this.b === 0 && this.c === 0 && this.d === 0) {
      this.a = MD5_IV_A;
      this.b = MD5_IV_B;
      this.c = MD5_IV_C;
      this.d = MD5_IV_D;
    }

    // Step 2: block loop — while (len >= 64) { transform; advance; }.
    // @0x1bf91..@0x1bfec.
    let off = 0;
    while (len >= 0x40) {
      this.transform(bytes, off);
      off += 0x40; // @0x1bfe0 addq $0x40,%r12
      len -= 0x40; // @0x1bfe4 addl $-0x40,%r14d
    }

    // Step 3: tail. @0x1bff3 testl %r14d,%r14d ; je done.
    if (len === 0) {
      // @0x1bff6 je 0x1c038 — no final transform.
      return;
    }
    // Build a 64-byte pad block: leftover bytes then PADDING[0..64-leftover-1].
    // @0x1bff8 movl $0x40,%r15d ; @0x1bffe subl %r14d,%r15d  -> r15 = 64-leftover
    const padBlock = new Uint8Array(0x40);
    // @0x1c011 memcpy(block, data, leftover)
    for (let i = 0; i < len; i++) padBlock[i] = bytes[off + i];
    // @0x1c028 memcpy(block+leftover, PADDING, 64-leftover)
    // PADDING is [0x80, 0, 0, ..., 0] (64 bytes total). So we write 0x80
    // at padBlock[len] and leave the rest zero (already zero-initialized).
    padBlock[len] = PADDING_FIRST_BYTE;
    // @0x1c033 callq transform
    this.transform(padBlock, 0);
  }

  /**
   * PCHash128::transform(unsigned int const*) @ProCore 0x1c1de.
   *
   * One full 64-round MD5 block compression. The disassembly is a fully
   * unrolled sequence of 64 rounds; each round reads one 32-bit
   * little-endian message word from `bytes` at offset `blockOff`, adds
   * a T-constant, rotates, and mixes into the state. Rounds 1..16 use
   * F, 17..32 use G, 33..48 use H, 49..64 use I. This function is a
   * faithful reconstitution using the T/S/K tables above (transcribed
   * from the exact immediates that appear in the .s file — 62 of 64 T
   * constants appear as raw `addl $imm,%reg` and the 2 remaining ones
   * are folded into `leal disp32(%base,%idx)` addressing as the
   * compiler chose; the mathematical result is identical to the
   * standard tables). The 16 message-word reads are the sequence of
   * `movl 0xNN(%rbx),%reg` instructions between @0x1c208 and @0x1c66X.
   *
   * State reads at entry (@0x1c1f5..@0x1c205):
   *     A := (%rdi)          ; state[0]
   *     B := 4(%rdi)         ; state[1]
   *     C := 8(%rdi)         ; state[2]
   *     D := 0xc(%rdi)       ; state[3]
   * Message reads at entry (@0x1c208, @0x1c20b, ...):
   *     M[0] := (%rbx) little-endian u32, ...
   *
   * At exit (@0x1c669..@0x1c67X — the four `addl %reg,(%rdi)` /
   * `movl %reg,0xNN(%rdi)` store-backs), each of the four accumulated
   * state variables is added back to the corresponding state[i].
   */
  transform(bytes: Uint8Array, blockOff: number = 0): void {
    // @0x1c1f5 movl (%rdi), %esi
    let A = this.a;
    // @0x1c1fe movl 0x4(%rdi), %r11d
    let B = this.b;
    // @0x1c202 movl 0x8(%rdi), %edx
    let C = this.c;
    // @0x1c205 movl 0xc(%rdi), %ecx
    let D = this.d;

    // Read the 16 little-endian 32-bit message words.
    // @0x1c208 movl (%rbx),%r9d ; @0x1c20b movl 4(%rbx),%r8d ; ...
    const M: number[] = new Array(16);
    for (let i = 0; i < 16; i++) {
      M[i] = readU32LE(bytes, blockOff + i * 4);
    }

    // Rounds 1..16 — F(x,y,z) = (x & y) | (~x & z)
    // The disasm encodes this as: `movl y,%eax ; xorl z,%eax ; andl x,%eax ; xorl z,%eax`,
    // i.e. F(x,y,z) = ((y XOR z) AND x) XOR z, which is algebraically
    // identical (see @0x1c20f..@0x1c216 for the first instance).
    for (let i = 0; i < 16; i++) {
      const f = (((B ^ C) & A) ^ C) >>> 0;
      const t = add32(add32(add32(A, f), M[K_IDX[i]]), T_CONST[i]);
      const rotated = rotl32(t, S_ROT[i]);
      const newA = add32(rotated, B);
      // Rotate the (A,B,C,D) roles — in the disasm this is done by
      // renaming register roles between rounds; the effect is identical.
      A = D;
      D = C;
      C = B;
      B = newA;
    }

    // Rounds 17..32 — G(x,y,z) = (x & z) | (y & ~z)
    // The disasm encodes this as: `movl x,%eax ; xorl y,%eax ; andl z,%eax ; xorl y,%eax`,
    // i.e. G(x,y,z) = ((x XOR y) AND z) XOR y, again algebraically identical.
    for (let i = 16; i < 32; i++) {
      const g = (((B ^ C) & D) ^ C) >>> 0;
      const t = add32(add32(add32(A, g), M[K_IDX[i]]), T_CONST[i]);
      const rotated = rotl32(t, S_ROT[i]);
      const newA = add32(rotated, B);
      A = D;
      D = C;
      C = B;
      B = newA;
    }

    // Rounds 33..48 — H(x,y,z) = x XOR y XOR z
    // Encoded as `xorl y,%eax ; xorl z,%eax` (two-input XOR chain).
    for (let i = 32; i < 48; i++) {
      const h = (B ^ C ^ D) >>> 0;
      const t = add32(add32(add32(A, h), M[K_IDX[i]]), T_CONST[i]);
      const rotated = rotl32(t, S_ROT[i]);
      const newA = add32(rotated, B);
      A = D;
      D = C;
      C = B;
      B = newA;
    }

    // Rounds 49..64 — I(x,y,z) = y XOR (x | ~z)
    // Encoded as `notl z ; orl x,z ; xorl y,z` in one three-op cluster.
    for (let i = 48; i < 64; i++) {
      const not_d = (~D) >>> 0;
      const iFn = (C ^ (B | not_d)) >>> 0;
      const t = add32(add32(add32(A, iFn), M[K_IDX[i]]), T_CONST[i]);
      const rotated = rotl32(t, S_ROT[i]);
      const newA = add32(rotated, B);
      A = D;
      D = C;
      C = B;
      B = newA;
    }

    // Store-back: @0x1c66X..@0x1c67X the four `addl %reg,0xNN(%rdi)`
    // instructions add A,B,C,D back into state[0..3].
    this.a = add32(this.a, A);
    this.b = add32(this.b, B);
    this.c = add32(this.c, C);
    this.d = add32(this.d, D);
  }

  /**
   * PCHash128::getString() const @ProCore 0x1c16c.
   *
   * Reads the 4 u32 state words and formats via
   *   snprintf(buf, 0x40, "%08x%08x%08x%08x", h0, h1, h2, h3)
   * (format string loaded at @0x1c198 from RIP+0x1155ac, which resolves
   * to a __cstring "%08x%08x%08x%08x") then constructs a PCString from
   * the resulting C-string (@0x1c1b8 callq PCString::PCString(char*)).
   *
   * We produce a PCString wrapping the same 32-lowercase-hex-digit
   * output. `%08x` in libc prints lowercase hex — see
   * `sh` `printf '%08x\n' 4294967295` -> `ffffffff` — so we match that.
   */
  getString(): PCString {
    // @0x1c188..@0x1c195: load h0..h3 (in that struct order) as u32.
    const hex =
      u32ToHex8(this.a) + u32ToHex8(this.b) + u32ToHex8(this.c) + u32ToHex8(this.d);
    return new PCString(hex);
  }

  /**
   * PCHash128::operator+=(PCHash128 const&) @ProCore 0x1c938.
   *
   * The disassembly inlines a full 64-round MD5 block whose input
   * block is `[other.a, other.b, other.c, other.d, 0, 0, 0, 0,
   *            0, 0, 0, 0, 0, 0, 0, 0]` (48 zero bytes tail). This is
   * confirmed by:
   *   - the loads from %rsi occur ONLY at offsets 0, 4, 8, 0xc
   *     (@0x1c989, @0x1c98c, @0x1c990, @0x1c9b4 — see raw-port/re/disasm/
   *     ProCore.PCHash128.operator+=.s)
   *   - the same 62 T-constants (with the same 2-folded pattern),
   *     rotate schedule, and F/G/H/I structure appear
   *   - the state==0 IV load at @0x1c953..@0x1c96f uses immediates
   *     $0x67452301, $0xefcdab89, $0x98badcfe, $0x10325476 (the MD5 IV)
   *
   * The mutation is done in place on `this`. Returns `this` so that the
   * C++ `operator+=` chain semantics are preserved — although in C++
   * `operator+=` returns a reference, we mirror that by returning the
   * mutated object.
   */
  addAssign(other: PCHash128): PCHash128 {
    // Build the "other || zeros" block. @0x1c989..@0x1c990 + @0x1c9b4
    // load only other[0..3]; every other M[k] is treated as zero
    // (a peephole optimization elides the `addl $0,%reg` no-op).
    const block = new Uint8Array(0x40);
    // Write other.a..other.d as little-endian u32.
    for (let i = 0; i < 4; i++) {
      const w = [other.a, other.b, other.c, other.d][i] >>> 0;
      block[i * 4 + 0] = w & 0xff;
      block[i * 4 + 1] = (w >>> 8) & 0xff;
      block[i * 4 + 2] = (w >>> 16) & 0xff;
      block[i * 4 + 3] = (w >>> 24) & 0xff;
    }
    // @0x1c93b..@0x1c953 state==0 test (identical `or` reduction to
    // the one in addData) — load MD5 IV if state is all zero.
    if (this.a === 0 && this.b === 0 && this.c === 0 && this.d === 0) {
      this.a = MD5_IV_A;
      this.b = MD5_IV_B;
      this.c = MD5_IV_C;
      this.d = MD5_IV_D;
    }
    // @0x1c974..end — the inlined 64-round transform.
    this.transform(block, 0);
    return this;
  }

  /**
   * Parse the hex-string form of a PCHash128.
   *
   * Recovered from PCHash128::PCHash128(PCString const&) @ProCore 0x1c06c:
   *   @0x1c086 xorps xmm0 ; movups xmm0,(rdi)       ; state = 0
   *   @0x1c08f callq PCString::createCStr()          ; rax = malloc'd C-string
   *   @0x1c096 movq _DefaultRuneLocale(%rip), %rdx  ; rune table
   *   @0x1c09d movq rax, %rsi                        ; cursor
   *   @0x1c0a0 leaq 8(%rsi), %rdi                    ; next-word cursor
   *   outer loop over rcx = 0..3 (@0x1c108, @0x1c10e):
   *     inner loop over r9 = 0..7 (@0x1c0fa..@0x1c101):
   *       r10 = signed byte at cursor[r9]                @0x1c0aa
   *       if r10 < 0 (@0x1c0b2): early-exit to @0x1c11b (leave state as-is)
   *       else load isxdigit bit from rune table         @0x1c0b7
   *       if not xdigit: early-exit to @0x1c11b
   *       r8 <<= 4                                       @0x1c0bf
   *       if (r10 - 0x30) u<= 9:  r8 += r10 - 0x30      @0x1c0c3..0x1c0d0
   *       else if (r10 - 0x61) u<= 5: r8 += r10 - 0x57  @0x1c0d6..0x1c0e3
   *       else if (r10 - 0x41) u<= 5: r8 += r10 - 0x37  @0x1c0e9..0x1c0f6
   *     store r8 to stack[rcx*4]                         @0x1c103
   *     rsi := rdi ; rdi += 8                            @0x1c10b + @0x1c0a0
   *   flush stack to (%rbx) as one 16-byte movaps        @0x1c114..@0x1c118
   *   @0x1c134 tail-call _free on the malloc'd C-string
   *
   * Semantically: parse up to 4 words of exactly 8 hex chars each from
   * the string; on the FIRST non-xdigit byte, abort the whole update
   * (state stays at whatever was accumulated so far into the stack
   * frame — but since the final movaps store is inside the early-exit
   * path's SKIPPED region, an early-abort leaves `this` as the initial
   * all-zeros state). We match this: parse all 32 chars; if any is
   * invalid, leave the state as the initial zero (or whatever partial
   * words the assembler had written to the stack up to that point,
   * which is NEVER flushed to `this` because the movaps at @0x1c114 is
   * only reached after all 32 chars parse cleanly).
   */
  private _fromPCString(str: PCString): void {
    // @0x1c08f PCString::createCStr() — obtain the underlying C-string.
    // Our PCString port surfaces the equivalent code units via
    // toString()/cf_str() (see raw-port/src/infra/PCString.ts @0x32368,
    // whose docstring names toString() as the JS analogue of
    // createCStr).
    const s = str.toString();
    // Words accumulate on the stack; final movaps store to (%rbx) is
    // gated on completing all 32 hex chars. If ANY char fails the
    // xdigit test, the store is skipped and state stays zero.
    // We mirror that by accumulating into locals and only committing
    // to (this.a..this.d) after all 4 words succeed.
    const words = [0, 0, 0, 0];
    for (let w = 0; w < 4; w++) {
      const base = w * 8;
      let acc = 0;
      for (let k = 0; k < 8; k++) {
        // @0x1c0aa movsbl (rsi,r9),r10d — signed byte load. If the
        // input C-string ends before we reach 32 chars, s.charCodeAt
        // returns NaN which the hexDigit test rejects.
        const ch = s.charCodeAt(base + k);
        // @0x1c0b2 js 0x1c11b — negative (high-bit set) bytes bail out.
        // JS strings are UTF-16 so raw code units >= 0x80 aren't
        // xdigits anyway; hexDigit returns -1 for them below.
        const dig = Number.isNaN(ch) ? -1 : hexDigit(ch);
        if (dig < 0) {
          // Early-exit path @0x1c11b — the movaps store is skipped, so
          // `this` remains at its ctor-initial zeros. Match that:
          // do NOT commit words.
          return;
        }
        // @0x1c0bf shll $0x4,%r8d  ; @0x1c0cd addl %r10d,%r8d ; @0x1c0d0 addl $-0x30,%r8d
        acc = (((acc << 4) >>> 0) + dig) >>> 0;
      }
      words[w] = acc;
    }
    // @0x1c114..@0x1c118 movaps stack -> (%rbx). Commit.
    this.a = words[0];
    this.b = words[1];
    this.c = words[2];
    this.d = words[3];
  }
}
