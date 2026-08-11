// J2KCodeStream.ts — raw transcription of Flexo's `J2KCodeStream`.
//
// Flexo's JPEG 2000 codestream reader: it is constructed over a `GZIOBase&`
// (`J2KCodeStream::J2KCodeStream(GZIOBase&)` @0x1430120), runs
// `preFlightAnalyse()` @0x1430140 to locate the codestream's marker segments,
// and then exposes a family of tiny const accessors that read image geometry
// straight out of the raw, BIG-ENDIAN SIZ marker segment it kept a pointer to.
//
// Provenance (Flexo framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file — ONE method:
//   @0x1430390  J2KCodeStream::getXsiz() const
//                 __ZNK13J2KCodeStream7getXsizEv
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym __ZNK13J2KCodeStream7getXsizEv Flexo`):
//   raw-port/re/disasm/Flexo.__ZNK13J2KCodeStream7getXsizEv.s (9 lines)
//
// Every OTHER member (the ctor @0x1430120, `preFlightAnalyse` @0x1430140, the
// dtor @0x1430330, and the sibling accessors `getRsiz` @0x1430370, `getYsiz`
// @0x14303a0, `getXOsiz` @0x14303b0, `getYOsiz` @0x14303c0, `getXTsiz`
// @0x14303d0, `getYTsiz` @0x14303e0, `getXTOsiz` @0x14303f0, `getYTOsiz`
// @0x1430400, `getCsiz` @0x1430410, `getCompDepth` @0x1430430,
// `getCompSigning` @0x1430470, `getCompHorzSub` @0x14304a0, `getCompVertSub`
// @0x14304d0, `isLossless` @0x1430500, `getWaveTrans` @0x1430520) is a
// SEPARATE ledger unit and is NOT ported here. Four of them are quoted below
// as LAYOUT EVIDENCE only.
//
// ---------------------------------------------------------------------------
// LAYOUT — the object field, and the byte layout it points AT
// ---------------------------------------------------------------------------
//   struct J2KCodeStream {
//     ...                    // +0x00..+0x0f not touched by this method
//     const uint8_t* siz;    // +0x10 — pointer to the raw bytes of the SIZ
//                            //   marker segment. EVERY accessor in the family
//                            //   starts with the identical
//                            //   `movq 0x10(%rdi), %rax`, then reads a fixed
//                            //   byte offset off that pointer.
//   };
//
// The bytes at `siz` are the codestream's own big-endian SIZ payload, NOT a
// decoded C struct — that is what the byte-swap in every accessor proves. The
// offsets read by the accessor family identify the base exactly:
//
//   siz[+0x00]  u16  Rsiz     getRsiz   @0x1430378  movzwl (%rax),%eax
//                                                   rolw $0x8,%ax
//   siz[+0x02]  u32  Xsiz     getXsiz   @0x1430394  movl 0x2(%rax),%eax; bswapl
//   siz[+0x06]  u32  Ysiz     getYsiz   @0x14303a8  movl 0x6(%rax),%eax; bswapl
//   siz[+0x0a]  u32  XOsiz    getXOsiz  @0x14303b8  movl 0xa(%rax),%eax; bswapl
//   ...
//   siz[+0x22]  u16  Csiz     getCsiz   @0x1430418  movzwl 0x22(%rax),%eax
//                                                   rolw $0x8,%ax
//
// which is precisely the ISO/IEC 15444-1 SIZ marker segment with the pointer
// parked immediately AFTER the 2-byte `Lsiz` length field:
//   Rsiz(2) Xsiz(4) Ysiz(4) XOsiz(4) YOsiz(4) XTsiz(4) YTsiz(4) XTOsiz(4)
//   YTOsiz(4) Csiz(2) — Csiz landing at 2+4*8 = 0x22, exactly where getCsiz
//   reads it. The offsets are UNALIGNED (0x2, 0x6, 0xa, ...), which is why the
//   compiler emits plain unaligned `movl`s and not a struct field access.
//
// So the port models the field as the raw byte buffer it is, and reads it with
// the same two steps the machine uses: a host-order (little-endian) 32-bit
// load, then a byte swap.
//
// CALLEES: none. No in-scope call, no extern, no virtual and no indirect
// dispatch (`depgraph.py deps` lists nothing for this symbol).

/**
 * `J2KCodeStream` — Flexo's JPEG 2000 codestream reader, as `getXsiz`
 * addresses it.
 *
 * @Flexo 0x1430390
 */
export class J2KCodeStream {
  /** @Flexo instance +0x10 — `const uint8_t* siz`, the raw SIZ marker-segment
   * bytes (big-endian, unaligned), positioned just after `Lsiz`.
   *
   * Loaded by `getXsiz` @0x1430394 as `movq 0x10(%rdi), %rax`, and identically
   * by every sibling accessor (see the file header's offset table). `null`
   * models the null pointer the C++ field holds before `preFlightAnalyse()`
   * @0x1430140 — a separate ledger unit — has located the segment. */
  siz: Uint8Array | null = null;

  /**
   * `J2KCodeStream::getXsiz() const` @Flexo 0x1430390
   * (__ZNK13J2KCodeStream7getXsizEv).
   *
   * Faithful transcription of the 9-line body, quoted in full:
   *
   *   0x1430390  pushq %rbp                ; frame prologue
   *   0x1430391  movq  %rsp, %rbp
   *   0x1430394  movq  0x10(%rdi), %rax    ; rax = this->siz   (+0x10)
   *   0x1430398  movl  0x2(%rax), %eax     ; eax = *(u32*)(siz + 2), an
   *                                        ;   UNALIGNED little-endian (host
   *                                        ;   order) 4-byte load
   *   0x143039b  bswapl %eax               ; eax = byte-reversed  -> the value
   *                                        ;   the big-endian codestream meant
   *   0x143039d  popq  %rbp                ; frame epilogue
   *   0x143039e  retq
   *   0x143039f  nop                       ; padding — not executed
   *
   * SEMANTICS: return `Xsiz`, the width of the JPEG 2000 reference grid, read
   * as a 32-bit BIG-ENDIAN integer from `siz + 2`.
   *
   * NUMERICS: `bswapl` operates on the 32-bit `%eax`, and writing `%eax`
   * zero-extends into `%rax`, so the result is an UNSIGNED 32-bit value — the
   * port ends with `>>> 0` for exactly that reason. Xsiz legitimately exceeds
   * 2^31 in the spec's value range, so a signed read would be wrong, not
   * merely untidy.
   *
   * The port performs the two steps SEPARATELY (host-order load, then swap)
   * rather than collapsing them into one big-endian read, so each line of the
   * TS maps to one instruction.
   *
   * DEPENDENCIES: none in-scope; no extern.
   */
  getXsiz(): number {
    // @0x1430394  movq 0x10(%rdi), %rax
    const siz: Uint8Array | null = this.siz;
    if (siz === null) {
      // The machine dereferences %rax unconditionally at @0x1430398 — there is
      // no null test in the body. A null `siz` is a hardware fault in FCP, not
      // a value, so the port raises instead of inventing one.
      throw new Error(
        "J2KCodeStream::getXsiz @Flexo 0x1430398 dereferences this->siz (+0x10) " +
          "unconditionally; siz is null (preFlightAnalyse @Flexo 0x1430140 has " +
          "not run) — the machine would fault here",
      );
    }

    // @0x1430398  movl 0x2(%rax), %eax
    //   Unaligned 4-byte load in HOST (little-endian) order, exactly as x86
    //   performs it: byte siz[2] is the least significant. Read through a
    //   DataView rather than four `siz[i]` index reads so a short buffer
    //   raises a RangeError instead of yielding `undefined` and laundering it
    //   into a plausible wrong number (the #154 silent-wrong-answer class);
    //   the machine has no bounds check and would simply read whatever bytes
    //   follow the segment, which is not a value this port can reproduce.
    const view = new DataView(siz.buffer, siz.byteOffset, siz.byteLength);
    const hostOrder: number = view.getUint32(2, /* littleEndian */ true);

    // @0x143039b  bswapl %eax
    //   Reverse the four bytes of the 32-bit register.
    const swapped: number =
      (((hostOrder & 0x000000ff) << 24) |
        ((hostOrder & 0x0000ff00) << 8) |
        ((hostOrder & 0x00ff0000) >>> 8) |
        ((hostOrder & 0xff000000) >>> 24)) >>>
      0;

    // @0x143039e  retq — %eax holds the result, zero-extended into %rax.
    return swapped;
  }
}
