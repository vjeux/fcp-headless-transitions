// PCImageDescAtomBox — ProCore's QuickTime/ISO-BMFF "atom box" header reader used
// while parsing an image-description sample-entry's child boxes. This unit ports the
// one method the ledger handed us: readAtomBoxHeader, which decodes a single ISO-BMFF
// box header (the leading `size`/`type` and the optional 64-bit "largesize") from the
// raw byte buffer this descriptor wraps.
//
// @ProCore /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Faithful port of the ProCore x86_64 disassembly. Every method cites its @ProCore
// addr; every branch mirrors the machine's dst-src compare (PORTING_SPEC Rule 4
// cheat-sheet). Zero in-scope callees — the body is pure buffer arithmetic.
//
// ── Decoded struct layout (only the field this unit touches is pinned here) ────
//
//   +0x00  const uint8_t*  buffer   // base pointer of the raw box bytes. Loaded at the
//                                   // top of readAtomBoxHeader (`movq (%rdi),%r10`), then
//                                   // all reads are `buf + boxOffset (+n)`. Modelled as a
//                                   // Uint8Array; a DataView over it performs the exact
//                                   // big-endian (bswap) 32/64-bit loads the machine does.

export class PCImageDescAtomBox {
  // +0x00  const uint8_t* — the raw box byte buffer (`movq (%rdi),%r10` @0x76df3).
  //        readAtomBoxHeader reads big-endian 32/64-bit fields out of it.
  buffer: Uint8Array = new Uint8Array(0);

  /**
   * PCImageDescAtomBox::readAtomBoxHeader(
   *     unsigned long long boxOffset,   // rsi — byte offset of the box within `buffer`
   *     unsigned long long bufLen,      // rdx — number of readable bytes at/after boxOffset
   *     unsigned int*      outType,     // rcx — optional out: the box's 4CC type
   *     unsigned long long* outBoxSize, // r8  — optional out: total box size (incl. header)
   *     unsigned long long* outContent) // r9  — optional out: payload/content size
   *   -> unsigned int  (eax): 0 on success, 0xFFFFFFFF (-1) on a malformed/too-small box.
   *
   * @0xADDR ProCore 0x0000000000076de4  (__ZN18PCImageDescAtomBox17readAtomBoxHeaderEyyPjPyS1_)
   *
   * This is the ISO-BMFF / QuickTime box-header decoder: a box begins with a 32-bit
   * big-endian `size32` then a 32-bit `type` (4CC). If size32 == 1 the real size is a
   * 64-bit big-endian `largesize` that follows the type; if size32 == 0 the box runs to
   * the end of the enclosing region (here `bufLen`). It computes the total box size and
   * the content (payload) size, validates them against `bufLen`, and stores the type,
   * box size and content size through the optional out-pointers.
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN18PCImageDescAtomBox17readAtomBoxHeaderEyyPjPyS1_.s):
   *
   *   0x76de4  movl  $0xffffffff, %eax          ; ret = -1 (default failure)
   *   0x76de9  cmpq  $0x8, %rdx                  ; bufLen - 8
   *   0x76ded  jb    0x76e63                     ; if bufLen < 8  -> return -1 (need >=8 hdr)
   *   0x76df3  movq  (%rdi), %r10                ; r10 = buffer base pointer
   *   0x76df6  movl  (%r10,%rsi), %r11d          ; r11d = *(u32*)(buf+boxOffset)  [LE-in-reg]
   *   0x76dfa  movl  0x4(%r10,%rsi), %edi        ; edi  = *(u32*)(buf+boxOffset+4) [LE-in-reg]
   *   0x76dff  bswapl %r11d                      ; r11d = size32 (big-endian)
   *   0x76e02  cmpl  $0x1, %r11d                 ; size32 - 1
   *   0x76e06  je    0x76e16                      ;  size32 == 1  -> extended 64-bit size
   *   0x76e08  testl %r11d, %r11d                ; size32 == 0 ?
   *   0x76e0b  jne   0x76e2a                      ;  size32 != 0  -> normal 32-bit size
   *   ; --- size32 == 0 : box extends to end of region ---
   *   0x76e0d  leaq  -0x8(%rdx), %rsi            ; content = bufLen - 8
   *   0x76e11  movq  %rdx, %r10                  ; boxSize = bufLen
   *   0x76e14  jmp   0x76e39
   *   ; --- size32 == 1 : 64-bit largesize follows the type ---
   *   0x76e16  cmpq  $0x10, %rdx                 ; bufLen - 16
   *   0x76e1a  jb    0x76e62                      ;  if bufLen < 16 -> fail (need 16-byte hdr)
   *   0x76e1c  movq  0x8(%r10,%rsi), %r10        ; r10 = *(u64*)(buf+boxOffset+8) [LE-in-reg]
   *   0x76e21  bswapq %r10                       ; boxSize = largesize (big-endian)
   *   0x76e24  leaq  -0x10(%r10), %rsi           ; content = boxSize - 16
   *   0x76e28  jmp   0x76e39
   *   ; --- default : size32 is the box size ---
   *   0x76e2a  movl  %r11d, %r10d                ; boxSize = size32 (zero-extended to 64)
   *   0x76e2d  leaq  -0x8(%r10), %rsi            ; content = boxSize - 8
   *   0x76e31  cmpl  $0x8, %r11d                 ; size32 - 8
   *   0x76e35  cmovbq %r10, %rsi                 ; if size32 < 8 : content = boxSize (no room
   *                                              ;   for an 8-byte header -> clamp content up)
   *   ; --- validation @0x76e39 (boxSize=r10, content=rsi) ---
   *   0x76e39  leaq  -0x1(%r10), %r11            ; r11 = boxSize - 1
   *   0x76e3d  cmpq  %rdx, %r11                  ; (boxSize-1) - bufLen
   *   0x76e40  jae   0x76e62                      ; if (boxSize-1) >= bufLen -> fail (overruns)
   *   0x76e42  cmpq  %rsi, %r10                  ; boxSize - content
   *   0x76e45  jbe   0x76e62                      ; if boxSize <= content -> fail
   *   ; --- success: store outputs @0x76e47 ---
   *   0x76e47  testq %rcx, %rcx ; je 0x76e50     ; if outType != null:
   *   0x76e4c  bswapl %edi                       ;   type = big-endian(edi)
   *   0x76e4e  movl  %edi, (%rcx)                ;   *outType = type
   *   0x76e50  testq %r8, %r8 ; je 0x76e58       ; if outBoxSize != null:
   *   0x76e55  movq  %r10, (%r8)                 ;   *outBoxSize = boxSize
   *   0x76e58  xorl  %eax, %eax                  ; ret = 0 (success)
   *   0x76e5a  testq %r9, %r9 ; je 0x76e62       ; if outContent != null:
   *   0x76e5f  movq  %rsi, (%r9)                 ;   *outContent = content
   *   0x76e62/63 popq %rbp ; retq                ; return ret
   *
   * NUMERICS (PORTING_SPEC Rule 4): boxOffset/bufLen/boxSize/content are 64-bit file
   * quantities (a box can exceed 2^53 bytes), so they are bigint. The out-pointers are
   * modelled as single-element boxes ({ value } / null) matching optional `T*` args; a
   * null argument means "don't store" (the je-skips). The unsigned `jb/jbe/jae` compares
   * are transcribed as unsigned bigint comparisons on non-negative values.
   *
   * The read/bswap of size32 and largesize is done with a big-endian DataView (the exact
   * equivalent of the `movl`/`movq` + `bswap` pair). size32 is read as an unsigned 32-bit
   * value; `type` is likewise read big-endian (the `bswapl %edi` before the store).
   */
  readAtomBoxHeader(
    boxOffset: bigint,
    bufLen: bigint,
    outType: { value: number } | null,
    outBoxSize: { value: bigint } | null,
    outContent: { value: bigint } | null,
  ): number {
    // @0x76de4  movl $0xffffffff,%eax — default return is -1 (0xFFFFFFFF as an unsigned int).
    const FAIL = 0xffffffff;

    // @0x76de9 cmpq $0x8,%rdx ; @0x76ded jb 0x76e63 — need at least an 8-byte header.
    if (bufLen < 8n) {
      return FAIL;
    }

    // @0x76df3 movq (%rdi),%r10 — load the buffer base; all reads are buf + boxOffset (+n).
    // A big-endian DataView over the shared buffer performs the movl/movq + bswap loads.
    const dv = new DataView(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );
    const at = Number(boxOffset); // byte index into the buffer for DataView reads.

    // @0x76df6 movl (%r10,%rsi),%r11d ; @0x76dff bswapl %r11d — size32 (big-endian u32).
    const size32 = dv.getUint32(at, false); // false = big-endian (matches bswap)

    // @0x76dfa movl 0x4(%r10,%rsi),%edi — raw type dword (byte-swapped only if stored below).
    // Read big-endian to mirror the later `bswapl %edi; movl %edi,(%rcx)` store.
    const type = dv.getUint32(at + 4, false);

    let boxSize: bigint; // r10 after 0x76e39
    let content: bigint; // rsi after 0x76e39

    // @0x76e02 cmpl $0x1,%r11d ; @0x76e06 je 0x76e16 — size32 == 1: extended 64-bit size.
    if (size32 === 1) {
      // @0x76e16 cmpq $0x10,%rdx ; @0x76e1a jb 0x76e62 — need a 16-byte header now.
      if (bufLen < 16n) {
        return FAIL;
      }
      // @0x76e1c movq 0x8(%r10,%rsi),%r10 ; @0x76e21 bswapq %r10 — largesize (big-endian u64).
      boxSize = dv.getBigUint64(at + 8, false);
      // @0x76e24 leaq -0x10(%r10),%rsi — content = boxSize - 16.
      content = boxSize - 16n;
    } else if (size32 === 0) {
      // @0x76e08 testl %r11d,%r11d ; @0x76e0b jne 0x76e2a (not taken) — size32 == 0.
      // @0x76e11 movq %rdx,%r10 — boxSize = bufLen; @0x76e0d leaq -0x8(%rdx),%rsi — content = bufLen-8.
      boxSize = bufLen;
      content = bufLen - 8n;
    } else {
      // @0x76e2a movl %r11d,%r10d — boxSize = size32 (zero-extended u32 -> u64).
      boxSize = BigInt(size32 >>> 0);
      // @0x76e2d leaq -0x8(%r10),%rsi — content = boxSize - 8.
      content = boxSize - 8n;
      // @0x76e31 cmpl $0x8,%r11d ; @0x76e35 cmovbq %r10,%rsi — if size32 < 8: content = boxSize.
      if ((size32 >>> 0) < 8) {
        content = boxSize;
      }
    }

    // @0x76e39 leaq -0x1(%r10),%r11 ; @0x76e3d cmpq %rdx,%r11 ; @0x76e40 jae 0x76e62 —
    //   (boxSize-1) - bufLen ; jae taken iff (boxSize-1) >= bufLen  -> the box overruns.
    if (boxSize - 1n >= bufLen) {
      return FAIL;
    }

    // @0x76e42 cmpq %rsi,%r10 ; @0x76e45 jbe 0x76e62 — boxSize - content ; jbe taken iff
    //   boxSize <= content  -> degenerate/negative payload -> fail.
    if (boxSize <= content) {
      return FAIL;
    }

    // @0x76e47 testq %rcx,%rcx ; je 0x76e50 — store the type only if outType != null.
    if (outType !== null) {
      // @0x76e4c bswapl %edi ; @0x76e4e movl %edi,(%rcx) — the big-endian type dword.
      outType.value = type >>> 0;
    }

    // @0x76e50 testq %r8,%r8 ; je 0x76e58 — store the box size only if outBoxSize != null.
    if (outBoxSize !== null) {
      // @0x76e55 movq %r10,(%r8)
      outBoxSize.value = boxSize;
    }

    // @0x76e58 xorl %eax,%eax — success return code.
    const ret = 0;

    // @0x76e5a testq %r9,%r9 ; je 0x76e62 — store content size only if outContent != null.
    if (outContent !== null) {
      // @0x76e5f movq %rsi,(%r9)
      outContent.value = content;
    }

    // @0x76e62/63 popq %rbp ; retq — return 0.
    return ret;
  }
}
