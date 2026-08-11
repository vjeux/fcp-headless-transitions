// OZOpticalFlow__Private__CacheFileHeader.ts — raw transcription of Ozone
// `OZOpticalFlow::Private::CacheFileHeader`.
//
// The fixed-size header at the front of an optical-flow motion-vector cache
// file (the struct `OZOpticalFlow::Private::ReadHeader(FILE*, CacheFileHeader&)`
// @0x4e52d0 fills). FIVE accessors are transcribed in this file. The rest of the
// class (the ctors @0x4e5150/@0x4e5170, setSwap/needsSwap, the three setters,
// fieldMode/setFieldMode, setResolution, vectorsHeight @0x4e52a0,
// hasMaxDisplacements @0x4e52c0) are SEPARATE ledger units and are NOT ported
// here; do not add them without their own disassembly and address citations.
//
// The file is named `Outer__Inner` after the nested class, matching the landed
// convention (PCBezierNamespace__SampledContour.ts,
// PCEvictionHeap__EquivalenceKey.ts, OZOpticalFlow__Private__JobIDPred.ts).
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbols ported in this file (all `const` accessors):
//   @0x4e51c0  CacheFileHeader::sourceWidth()   __ZNK13OZOpticalFlow7Private15CacheFileHeader11sourceWidthEv
//   @0x4e51e0  CacheFileHeader::sourceHeight()  __ZNK13OZOpticalFlow7Private15CacheFileHeader12sourceHeightEv
//   @0x4e5200  CacheFileHeader::totalFields()   __ZNK13OZOpticalFlow7Private15CacheFileHeader11totalFieldsEv
//   @0x4e5210  CacheFileHeader::resolution()    __ZNK13OZOpticalFlow7Private15CacheFileHeader10resolutionEv
//   @0x4e5270  CacheFileHeader::vectorsWidth()  __ZNK13OZOpticalFlow7Private15CacheFileHeader12vectorsWidthEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym <mangled> Ozone`):
//   raw-port/re/disasm/__ZNK13OZOpticalFlow7Private15CacheFileHeader11sourceWidthEv.s   (7 lines)
//   raw-port/re/disasm/__ZNK13OZOpticalFlow7Private15CacheFileHeader12sourceHeightEv.s  (7 lines)
//   raw-port/re/disasm/__ZNK13OZOpticalFlow7Private15CacheFileHeader11totalFieldsEv.s   (7 lines)
//   raw-port/re/disasm/__ZNK13OZOpticalFlow7Private15CacheFileHeader10resolutionEv.s    (8 lines)
//   raw-port/re/disasm/__ZNK13OZOpticalFlow7Private15CacheFileHeader12vectorsWidthEv.s  (22 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT (offsets from the five bodies below, corroborated by the sibling
// bodies cited under each field — those siblings are EVIDENCE, not ports):
//
//   struct CacheFileHeader {                 // >= 0x11 bytes
//     uint16_t version;      // +0x00  ctor writes `movw $0x6,(%rdi)` @0x4e5154
//     uint8_t  needsSwap;    // +0x01  the whole body of needsSwap() @0x4e51a4 is
//                            //        `movzbl 0x1(%rdi),%eax` (the high byte of
//                            //        that same movw, hence 0 after the ctor)
//     uint32_t sourceWidth;  // +0x04  read @0x4e51c4 / @0x4e5283 / @0x4e528d / @0x4e5294
//     uint32_t sourceHeight; // +0x08  read @0x4e51e4
//     uint32_t totalFields;  // +0x0c  read @0x4e5204
//     uint8_t  flags;        // +0x10  read @0x4e5214 (resolution) and @0x4e5274
//                            //        (vectorsWidth); ctor sets it to 3 @0x4e5168
//   };
//
// THE +0x10 FLAGS BYTE — two independent one-bit fields:
//   bit 0 (mask 0x01) — the RESOLUTION flag. `setResolution(Resolution r)`
//                       @0x4e5220 computes `sete` on `cmpl $0x1,%esi` and merges
//                       it in with `andb $-0x2 ; orb` (@0x4e522e/@0x4e5231), so
//                       bit0 == (r == 1). `resolution()` @0x4e5210 hands that
//                       bit straight back.
//   bit 1 (mask 0x02) — the FIELD-MODE flag. `setFieldMode(FieldMode f)`
//                       @0x4e5250 computes `sete` on `testl %esi,%esi`, doubles
//                       it (`addb %al,%al` @0x4e5260) and merges with
//                       `andb $-0x3 ; orb`, so bit1 == (f == 0). `fieldMode()`
//                       @0x4e5240 returns `sete` on `testb $0x2` — 1 when the
//                       bit is CLEAR.
//   The ctor's `movb $0x3,0x10(%rdi)` @0x4e5168 therefore defaults BOTH bits set.
//
// CALLEES: none in any of the five bodies. No in-scope call, no extern, no
// indirect and no virtual dispatch (`depgraph.py deps` lists nothing for any of
// them).

/**
 * `OZOpticalFlow::Private::CacheFileHeader` — the motion-vector cache-file
 * header.
 *
 * Only the four slots the five ported accessors read are modelled; see the file
 * header for the byte layout and the evidence behind each offset.
 *
 * @Ozone 0x4e51c0 (and the four sibling accessor addresses listed above)
 */
export class OZOpticalFlow__Private__CacheFileHeader {
  /** +0x04 — uint32 source width (`movl 0x4(%rdi),%eax` @0x4e51c4). */
  sourceWidthAt4 = 0;

  /** +0x08 — uint32 source height (`movl 0x8(%rdi),%eax` @0x4e51e4). */
  sourceHeightAt8 = 0;

  /** +0x0c — uint32 total field count (`movl 0xc(%rdi),%eax` @0x4e5204). */
  totalFieldsAtC = 0;

  /**
   * +0x10 — the flags BYTE, kept as the raw byte the machine loads and masks
   * (`movzbl 0x10(%rdi),%eax` @0x4e5214 and @0x4e5274). bit0 = resolution,
   * bit1 = field mode; see the file header for the setter evidence. The ctor
   * @0x4e5168 leaves it at 3, which is the value used here as the default.
   */
  flagsAt10 = 3;

  /**
   * `CacheFileHeader::sourceWidth() const` — @Ozone 0x4e51c0
   *   __ZNK13OZOpticalFlow7Private15CacheFileHeader11sourceWidthEv
   *
   *   0x4e51c0  pushq %rbp              ; frame setup (no TS counterpart)
   *   0x4e51c1  movq  %rsp,%rbp         ; frame setup (no TS counterpart)
   *   0x4e51c4  movl  0x4(%rdi),%eax    ; return this->sourceWidth (u32)
   *   0x4e51c7  popq  %rbp              ; frame teardown (no TS counterpart)
   *   0x4e51c8  retq
   *   0x4e51c9  nopl  (%rax)            ; alignment padding, not executed
   *
   * A single 32-bit load; no masking, no callee.
   */
  sourceWidth(): number {
    // @0x4e51c4  movl 0x4(%rdi),%eax
    return this.sourceWidthAt4;
  }

  /**
   * `CacheFileHeader::sourceHeight() const` — @Ozone 0x4e51e0
   *   __ZNK13OZOpticalFlow7Private15CacheFileHeader12sourceHeightEv
   *
   *   0x4e51e0  pushq %rbp
   *   0x4e51e1  movq  %rsp,%rbp
   *   0x4e51e4  movl  0x8(%rdi),%eax    ; return this->sourceHeight (u32)
   *   0x4e51e7  popq  %rbp
   *   0x4e51e8  retq
   *   0x4e51e9  nopl  (%rax)            ; alignment padding, not executed
   */
  sourceHeight(): number {
    // @0x4e51e4  movl 0x8(%rdi),%eax
    return this.sourceHeightAt8;
  }

  /**
   * `CacheFileHeader::totalFields() const` — @Ozone 0x4e5200
   *   __ZNK13OZOpticalFlow7Private15CacheFileHeader11totalFieldsEv
   *
   *   0x4e5200  pushq %rbp
   *   0x4e5201  movq  %rsp,%rbp
   *   0x4e5204  movl  0xc(%rdi),%eax    ; return this->totalFields (u32)
   *   0x4e5207  popq  %rbp
   *   0x4e5208  retq
   *   0x4e5209  nopl  (%rax)            ; alignment padding, not executed
   */
  totalFields(): number {
    // @0x4e5204  movl 0xc(%rdi),%eax
    return this.totalFieldsAtC;
  }

  /**
   * `CacheFileHeader::resolution() const` — @Ozone 0x4e5210
   *   __ZNK13OZOpticalFlow7Private15CacheFileHeader10resolutionEv
   *
   *   0x4e5210  pushq  %rbp
   *   0x4e5211  movq   %rsp,%rbp
   *   0x4e5214  movzbl 0x10(%rdi),%eax  ; zero-extend the flags BYTE
   *   0x4e5218  andl   $0x1,%eax        ; keep bit 0 only
   *   0x4e521b  popq   %rbp
   *   0x4e521c  retq
   *   0x4e521d  nopl   (%rax)           ; alignment padding, not executed
   *
   * Returns the raw bit (0 or 1), NOT a boolean — the byte is zero-extended and
   * masked, so the value handed back is an integer. `setResolution` @0x4e5220
   * stores `(r == 1)` into that bit, so 1 means "Resolution == 1".
   */
  resolution(): number {
    // @0x4e5214/@0x4e5218  movzbl 0x10(%rdi),%eax ; andl $0x1,%eax
    return (this.flagsAt10 & 0xff) & 0x1;
  }

  /**
   * `CacheFileHeader::vectorsWidth() const` — @Ozone 0x4e5270
   *   __ZNK13OZOpticalFlow7Private15CacheFileHeader12vectorsWidthEv
   *
   * Scales `sourceWidth` by the two-bit flags value at +0x10.
   *
   * Full transcription — every instruction, in order:
   *
   *   0x4e5270  pushq  %rbp                ; frame setup (no TS counterpart)
   *   0x4e5271  movq   %rsp,%rbp           ; frame setup (no TS counterpart)
   *   0x4e5274  movzbl 0x10(%rdi),%eax     ; eax = flags byte (zero-extended)
   *   0x4e5278  andl   $0x3,%eax           ; eax = flags & 3  (both bits)
   *   0x4e527b  leal   -0x1(%rax),%ecx     ; ecx = mode - 1   (no flags touched)
   *   0x4e527e  cmpl   $0x2,%ecx           ; flags on (mode - 1) - 2, UNSIGNED
   *   0x4e5281  jae    0x4e5288            ;   (u32)(mode-1) >= 2 -> the tail
   *   0x4e5283  movl   0x4(%rdi),%eax      ; mode 1 or 2: return sourceWidth
   *   0x4e5286  popq   %rbp
   *   0x4e5287  retq
   *   0x4e5288  cmpl   $0x3,%eax           ; mode == 3 ?
   *   0x4e528b  jne    0x4e5294
   *   0x4e528d  movl   0x4(%rdi),%eax      ; mode 3: sourceWidth >> 1
   *   0x4e5290  shrl   %eax                ;   UNSIGNED shift
   *   0x4e5292  popq   %rbp
   *   0x4e5293  retq
   *   0x4e5294  movl   0x4(%rdi),%eax      ; mode 0: sourceWidth + sourceWidth
   *   0x4e5297  addl   %eax,%eax           ;   32-bit add, wraps mod 2^32
   *   0x4e5299  popq   %rbp
   *   0x4e529a  retq
   *   0x4e529b  nopl   (%rax,%rax)         ; alignment padding, not executed
   *
   * Decode notes (PORTING_SPEC Rule 4 — AT&T `dst - src`):
   *   * `leal -0x1(%rax),%ecx ; cmpl $0x2,%ecx ; jae` is the compiler's range
   *     test for "mode is 1 or 2": `lea` does not set flags, and `jae` is the
   *     UNSIGNED CF=0 pair, so mode == 0 makes `mode - 1` wrap to 0xffffffff and
   *     takes the branch. The four cases are therefore exactly:
   *       mode 0 -> sourceWidth * 2
   *       mode 1 -> sourceWidth
   *       mode 2 -> sourceWidth
   *       mode 3 -> sourceWidth / 2  (unsigned)
   *   * every value is a u32: the port applies `>>> 0` to the doubled result so
   *     it wraps exactly as `addl` does, and uses `>>> 1` (not `>> 1`) for the
   *     unsigned `shrl`.
   *   * the mask is `& 3`, i.e. BOTH the resolution bit and the field-mode bit
   *     — this accessor reads the pair as a single 2-bit selector, which is why
   *     the default header (flags = 3 from the ctor @0x4e5168) halves the width.
   *   * three separate `retq`s, no fallthrough between cases; ZERO callees.
   */
  vectorsWidth(): number {
    // @0x4e5274/@0x4e5278  movzbl 0x10(%rdi),%eax ; andl $0x3,%eax
    const mode = (this.flagsAt10 & 0xff) & 0x3;
    // @0x4e5283 / @0x4e528d / @0x4e5294 — every case reloads sourceWidth.
    const w = this.sourceWidthAt4 >>> 0;

    // @0x4e527b-0x4e5281  leal -0x1(%rax),%ecx ; cmpl $0x2,%ecx ; jae 0x4e5288
    //   — UNSIGNED, so mode 0 wraps to 0xffffffff and falls through to the tail.
    if (((mode - 1) >>> 0) < 2) {
      // @0x4e5283  movl 0x4(%rdi),%eax — modes 1 and 2 return the width as-is.
      return w;
    }

    // @0x4e5288-0x4e528b  cmpl $0x3,%eax ; jne 0x4e5294
    if (mode === 3) {
      // @0x4e528d/@0x4e5290  movl 0x4(%rdi),%eax ; shrl %eax — unsigned halve.
      return w >>> 1;
    }

    // @0x4e5294/@0x4e5297  movl 0x4(%rdi),%eax ; addl %eax,%eax — 32-bit double.
    return (w + w) >>> 0;
  }
}
