// PCH264Parser.ts - FCP ProCore `PCH264Parser`: an H.264 bytestream / NAL /
// SPS parser wrapping a CoreMedia CMSampleBuffer. Used by FCP to inspect
// H.264-encoded video for field-order, interlacing flags, and slice types
// before deciding on a rendering path.
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
// DECODE:    raw-port/re/disasm/ProCore.PCH264Parser.*.s
//
// SYMBOLS ported here:
//   __ZN12PCH264Parser21parseConfigRecordDataEPK25opaqueCMFormatDescription  @0x0008d4ea  [THROW-STUB]
//   __ZN12PCH264Parser17checkSampleBufferEP20opaqueCMSampleBuffer            @0x0008d62c  [THROW-STUB - overload]
//   __ZNK12PCH264Parser31oneSampleBufferContainsOneFieldEv                    @0x0008d6f0
//   __ZNK12PCH264Parser13getFieldOrderEv                                      @0x0008d700
//   __ZN12PCH264ParserD1Ev                                                     @0x0008d728
//   __ZN12PCH264Parser23getNalUnitAndSliceTypesEP20opaqueCMSampleBufferPNSt3__16vectorIiNS2_9allocatorIiEEEES7_  @0x0008d762  [THROW-STUB]
//   __ZNK12PCH264Parser15getNalUnitTypesEPNSt3__16vectorIiNS0_9allocatorIiEEEE  @0x0008d890
//   __ZNK12PCH264Parser13getSliceTypesEPNSt3__16vectorIiNS0_9allocatorIiEEEE    @0x0008d8be
//   __ZN12PCH264Parser8parseSPSEPKhi                                            @0x0008d8ec  [THROW-STUB]
//   __ZN12PCH264Parser17checkSampleBufferEP20opaqueCMSampleBuffer               @0x0008dbb6  [THROW-STUB - second overload address]
//   __ZNK12PCH264Parser16getSampleContentEv                                     @0x0008dd7a
//
// INSTANCE LAYOUT recovered from field accesses:
//
//   +0x30 : u32       fieldMode / interlace-hint flag
//                     (getFieldOrder @0x8d715 reads: `cmpl $0x1, 0x30(%rdi)`)
//   +0x38 : int*      nalUnitTypesVector.begin
//                     (getNalUnitTypes @0x8d89d, D1 @0x8d743)
//   +0x40 : int*      nalUnitTypesVector.end
//                     (getNalUnitTypes @0x8d8a1, D1 @0x8d74c)
//   +0x50 : int*      sliceTypesVector.begin
//                     (getSliceTypes @0x8d8cb, D1 @0x8d731)
//   +0x58 : int*      sliceTypesVector.end
//                     (getSliceTypes @0x8d8cf, D1 @0x8d73a)
//   +0x68 : u8        sampleContentFlag  (top-field-first flag; getSampleContent @0x8dd81,
//                                          oneSampleBufferContainsOneField @0x8d6f7)
//   +0x69 : u8        sampleContentAux   (bottom-field / interlace flag;
//                                          getSampleContent @0x8dd7e, oneSampleBufferContainsOneField @0x8d6f4)
//   +0x6c : u32       fieldOrderRaw      (raw poc_type or similar; getFieldOrder @0x8d704)
//
// The class also holds CoreMedia-related state (CMSampleBuffer refs,
// CMFormatDescription refs) whose exact offsets aren't derivable from
// the small methods we port here - those live in the checkSampleBuffer /
// parseConfigRecordData bodies (throw-stubbed below).
//
// DECODE-DON'T-FIT: every field offset above is transcribed from an
// actual asm instruction's `<off>(%rdi)` operand.

/**
 * `PCH264Parser` - H.264 bytestream / SPS / field-mode parser.
 *
 * The class caches, per sample:
 *   - a top/bottom-field flag pair at +0x68/+0x69,
 *   - a raw field-order value at +0x6c,
 *   - two `std::vector<int>` (NAL-unit types @+0x38/+0x40, slice types
 *     @+0x50/+0x58).
 *
 * All heavy parsing (parseConfigRecordData, checkSampleBuffer,
 * getNalUnitAndSliceTypes @0x8d762, parseSPS @0x8d8ec) is throw-stubbed pending a
 * CoreMedia + bitstream helper decode.
 */
export class PCH264Parser {
  /** @+0x30 u32 fieldMode / interlace hint - read by getFieldOrder. */
  fieldMode_30: number = 0;

  /** @+0x38..+0x40 std::vector<int> - NAL-unit types (as (begin,end) pointers to a heap int[]). */
  nalUnitTypes: number[] = [];

  /** @+0x50..+0x58 std::vector<int> - slice types (as (begin,end)). */
  sliceTypes: number[] = [];

  /** @+0x68 u8 - top-field-first / sample content flag. */
  sampleContentFlag_68: number = 0;

  /** @+0x69 u8 - bottom-field / interlace-aux flag. */
  sampleContentAux_69: number = 0;

  /** @+0x6c u32 - raw poc_type or similar; getFieldOrder examines it. */
  fieldOrderRaw_6c: number = 0;

  // NOTE: the ctor address is NOT in the ledger for this class - the object
  // is presumed zero-initialized by its owner (a CMFormatDescription
  // consumer). We provide a JS-side default ctor that mirrors zero-init.

  /**
   * PCH264Parser::parseConfigRecordData(CMFormatDescription const*) - @0x0008d4ea (101 lines).
   *
   * Extracts the AVCConfigurationRecord (avcC atom) from the format
   * description via _CMFormatDescriptionGetExtension and then hand-parses
   * the SPS/PPS length-prefixed NAL units to fill in +0x30 (fieldMode).
   *
   * Full body includes CFDictionary lookups + calls to
   * _CMFormatDescriptionGetMediaType, _CMVideoFormatDescriptionGetDimensions,
   * and a call into PCH264Parser::parseSPS @0x0008d8ec (also throw-stubbed).
   *
   * @provenance ProCore @0x0008d4ea.
   */
  parseConfigRecordData(_fmt: unknown): unknown {
    void _fmt;
    throw new Error(
      "PCH264Parser::parseConfigRecordData @ProCore 0x0008d4ea not yet " +
      "transcribed (101 lines; depends on _CMFormatDescriptionGetExtension, " +
      "_CMFormatDescriptionGetMediaType, _CMVideoFormatDescriptionGetDimensions " +
      "and PCH264Parser::parseSPS @0x0008d8ec)"
    );
  }

  /**
   * PCH264Parser::checkSampleBuffer(CMSampleBuffer*) - @0x0008d62c (65 lines).
   *
   * Zero-fills +0x68/+0x69 (movw $0x0, 0x68(%rdi) @0x0008d62c), then:
   *   1. calls _CMSampleBufferGetSampleSize @0x0008d655
   *   2. calls _CMSampleBufferGetDataBuffer @0x0008d660
   *   3. if either is zero -> early return leaving the flags at zero
   *      (jne 0x8d6e2 - the shared exit)
   *   4. otherwise walks the block-buffer contents via
   *      _CMBlockBufferAccessDataBytes and calls PCH264Parser::parseSPS
   *      @0x0008d8ec on each nal-unit start it finds.
   *
   * Second overload @0x0008dbb6 handles the "one sample = 2 fields"
   * interlaced case; both live under the same symbol name.
   *
   * @provenance ProCore @0x0008d62c (primary), @0x0008dbb6 (interlaced overload).
   */
  checkSampleBuffer(_sample: unknown): unknown {
    void _sample;
    // @0x0008d62c: `movw $0x0, 0x68(%rdi)` - zero the flag pair unconditionally
    this.sampleContentFlag_68 = 0;
    this.sampleContentAux_69 = 0;
    throw new Error(
      "PCH264Parser::checkSampleBuffer @ProCore 0x0008d62c not yet " +
      "transcribed (65 lines; depends on _CMSampleBufferGetSampleSize, " +
      "_CMSampleBufferGetDataBuffer, _CMBlockBufferAccessDataBytes, " +
      "and parseSPS @0x0008d8ec). A second overload lives at @0x0008dbb6 " +
      "for the interlaced-pair case."
    );
  }

  /**
   * PCH264Parser::oneSampleBufferContainsOneField() const - @0x0008d6f0
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     movb  0x69(%rdi), %al                                     @0x0008d6f4
   *     cmpb  0x68(%rdi), %al                                     @0x0008d6f7
   *     setne %al                                                 @0x0008d6fa
   *     popq  %rbp; retq
   *
   * Returns 1 iff the two content-flag bytes DIFFER (i.e. the parser
   * detected top-field-only or bottom-field-only, not a full frame).
   *
   * @provenance ProCore @0x0008d6f0.
   */
  oneSampleBufferContainsOneField(): number {
    // Compare as unsigned bytes (movb / cmpb).
    const a = this.sampleContentAux_69 & 0xff;
    const b = this.sampleContentFlag_68 & 0xff;
    return (a !== b) ? 1 : 0;
  }

  /**
   * PCH264Parser::getFieldOrder() const - @0x0008d700
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     movl  0x6c(%rdi), %eax                                    @0x0008d704
   *     leal  -0x1(%rax), %ecx     ; ecx = eax - 1                @0x0008d707
   *     cmpl  $0x2, %ecx           ; if ((u32)(eax-1) < 2) ...    @0x0008d70a
   *     jb    .Lret                ; ...return eax                @0x0008d70d
   *     testl %eax, %eax           ; else if (eax != 0) ...       @0x0008d70f
   *     jne   .LretNeg1            ;   return -1                   @0x0008d711
   *     xorl  %eax, %eax           ; else eax = 0                  @0x0008d713
   *     cmpl  $0x1, 0x30(%rdi)     ; if (fieldMode_30 == 1) al=1  @0x0008d715
   *     sete  %al                                                  @0x0008d719
   *     negl  %eax                 ; eax = -(eax != 0)             @0x0008d71c
   *     jmp   .Lret                                                @0x0008d71e
   *   .LretNeg1:
   *     movl  $0xffffffff, %eax    ; return -1                     @0x0008d720
   *   .Lret:
   *     popq %rbp; retq
   *
   * Semantics (from decode):
   *   raw = fieldOrderRaw_6c
   *   if (raw == 1 || raw == 2):     return raw
   *   else if (raw != 0):            return -1
   *   else:  // raw == 0
   *     return (fieldMode_30 == 1) ? -1 : 0
   *   (neg of a `set` bit: sete->1 then negl->0xffffffff = -1 as i32.)
   *
   * @provenance ProCore @0x0008d700.
   */
  getFieldOrder(): number {
    const raw = this.fieldOrderRaw_6c | 0;
    // `leal -0x1(%rax), %ecx; cmpl $0x2, %ecx; jb` = (u32)(raw-1) < 2
    // <=> raw == 1 || raw == 2
    const ecx = (raw - 1) >>> 0;
    if (ecx < 2) return raw;
    if (raw !== 0) return -1;
    // raw == 0 branch: al = (fieldMode_30 == 1); negl al gives 0xFFFFFFFF or 0.
    return (this.fieldMode_30 === 1) ? -1 : 0;
  }

  /**
   * PCH264Parser::~PCH264Parser() - D1 @0x0008d728
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     pushq %rbx; pushq %rax
   *     movq  %rdi, %rbx
   *     ; sliceTypes cleanup:
   *     movq  0x50(%rdi), %rdi                                     @0x0008d731
   *     testq %rdi, %rdi                                           @0x0008d735
   *     je    .LskipSlice                                          @0x0008d738
   *       movq  %rdi, 0x58(%rbx)                                    @0x0008d73a
   *       callq operator delete(void*) [__ZdlPv]                    @0x0008d73e
   *     .LskipSlice:
   *     ; nalUnitTypes cleanup:
   *     movq  0x38(%rbx), %rdi                                     @0x0008d743
   *     testq %rdi, %rdi                                           @0x0008d747
   *     je    .Lret                                                @0x0008d74a
   *       movq  %rdi, 0x40(%rbx)                                    @0x0008d74c
   *       ; tail-jmp operator delete(void*)                         @0x0008d756
   *     .Lret: popq %rbx; popq %rbp; retq
   *
   * Note: BEFORE the delete the code writes 0x38 -> 0x40 (nalUnit begin
   * copied over end) and 0x50 -> 0x58, effectively making end==begin
   * (an empty range). This is std::vector's __end_ = __begin_ before
   * calling ::operator delete on __begin_ - the standard destroy path.
   *
   * @provenance ProCore @0x0008d728.
   */
  destruct(): void {
    // Mirror the "end = begin; delete begin" pattern for both vectors.
    this.sliceTypes.length = 0;      // ~ (0x58 = 0x50; delete 0x50)
    this.nalUnitTypes.length = 0;    // ~ (0x40 = 0x38; delete 0x38)
  }

  /**
   * PCH264Parser::getNalUnitAndSliceTypes(CMSampleBuffer*, vector<int>*, vector<int>*)
   *                                                                     - @0x0008d762 (83 lines).
   *
   * Walks the sample-buffer's NAL units and populates two int vectors.
   * Calls into checkSampleBuffer and libc++ vector::__push_back_slow_path.
   *
   * @provenance ProCore @0x0008d762.
   */
  getNalUnitAndSliceTypes(_sample: unknown, _nalOut: number[], _sliceOut: number[]): void {
    void _sample; void _nalOut; void _sliceOut;
    throw new Error(
      "PCH264Parser::getNalUnitAndSliceTypes @ProCore 0x0008d762 not yet " +
      "transcribed (83 lines; walks CMSampleBuffer NAL units via " +
      "_CMBlockBufferAccessDataBytes + libc++ vector push_back)"
    );
  }

  /**
   * PCH264Parser::getNalUnitTypes(std::vector<int>*) const - @0x0008d890
   *
   *     leaq  0x38(%rdi), %rax          ; rax = &this->nalUnitTypes  @0x0008d894
   *     cmpq  %rax, %rsi                ; if (out == &this->nalUnitTypes) @0x0008d898
   *     je    .Lret                     ;   return                    @0x0008d89b
   *     movq  0x38(%rdi), %rax          ; rax = vec.__begin_          @0x0008d89d
   *     movq  0x40(%rdi), %rdx          ; rdx = vec.__end_            @0x0008d8a1
   *     movq  %rdx, %rcx
   *     subq  %rax, %rcx                ; rcx = end - begin (bytes)
   *     sarq  $0x2, %rcx                ; rcx /= 4  (int count)       @0x0008d8ab
   *     movq  %rsi, %rdi                ; rdi = out
   *     movq  %rax, %rsi                ; rsi = begin
   *     tail-jmp std::vector<int>::__assign_with_size(begin, end, count)
   *
   * Effectively: `*out = this->nalUnitTypes` (assign from a range,
   * with self-assignment as a no-op via the leaq-cmp guard).
   *
   * @provenance ProCore @0x0008d890.
   */
  getNalUnitTypes(out: number[]): void {
    // Self-assignment guard: `if (&out == &this->nalUnitTypes) return`.
    // In TS we model identity via `Object.is` on the array ref (mirrors the
    // asm's `leaq 0x38(%rdi), %rax; cmpq %rax, %rsi; je` pointer-identity check).
    if (Object.is(out, this.nalUnitTypes)) return;
    // Assign in place (mirror vector::__assign_with_size on int).
    out.length = 0;
    for (let i = 0; i < this.nalUnitTypes.length; i++) out.push(this.nalUnitTypes[i] | 0);
  }

  /**
   * PCH264Parser::getSliceTypes(std::vector<int>*) const - @0x0008d8be
   *
   * Same shape as getNalUnitTypes but the source vector lives at
   * @+0x50/+0x58 (sliceTypes):
   *
   *     leaq  0x50(%rdi), %rax                                     @0x0008d8c2
   *     cmpq  %rax, %rsi                                           @0x0008d8c6
   *     je    .Lret                                                @0x0008d8c9
   *     movq  0x50(%rdi), %rax                                     @0x0008d8cb
   *     movq  0x58(%rdi), %rdx                                     @0x0008d8cf
   *     ... tail-jmp std::vector::__assign_with_size ...
   *
   * @provenance ProCore @0x0008d8be.
   */
  getSliceTypes(out: number[]): void {
    if (Object.is(out, this.sliceTypes)) return;
    out.length = 0;
    for (let i = 0; i < this.sliceTypes.length; i++) out.push(this.sliceTypes[i] | 0);
  }

  /**
   * PCH264Parser::parseSPS(u8 const*, i32) - @0x0008d8ec (193 lines).
   *
   * H.264 Sequence Parameter Set parser. Reads the exp-Golomb-coded
   * fields:
   *   profile_idc, level_idc, seq_parameter_set_id, chroma_format_idc,
   *   pic_order_cnt_type, num_ref_frames, gaps_in_frame_num_value_allowed,
   *   pic_width_in_mbs, pic_height_in_map_units, frame_mbs_only_flag,
   *   mb_adaptive_frame_field, direct_8x8_inference, frame_cropping, ...
   * and stores the interlace/field-order state into this->+0x30, +0x6c,
   * +0x68, +0x69.
   *
   * @provenance ProCore @0x0008d8ec.
   */
  parseSPS(_bytes: Uint8Array, _len: number): number {
    void _bytes; void _len;
    throw new Error(
      "PCH264Parser::parseSPS @ProCore 0x0008d8ec not yet transcribed " +
      "(193 lines; H.264 SPS bitstream parser - exp-Golomb ue(v)/se(v), " +
      "profile/level parsing, and field-mode extraction into +0x30/+0x6c). " +
      "Requires an emulation of libc++ bitstream helpers + full H.264 SPS " +
      "syntax; port as a dedicated pass."
    );
  }

  /**
   * PCH264Parser::getSampleContent() const - @0x0008dd7a
   *
   *     movb  0x69(%rdi), %cl                                     @0x0008dd7e
   *     cmpb  $0x1, 0x68(%rdi)                                    @0x0008dd81
   *     jne   .Lnot1                                              @0x0008dd85
   *       movl  $0x1, %eax                                          @0x0008dd87
   *       testb %cl, %cl                                            @0x0008dd8c
   *       jne   .Lret                                               @0x0008dd8e
   *       jmp   .LretZero                                           @0x0008dd90
   *     .Lnot1:
   *       movl  $0x2, %eax                                          @0x0008dd92
   *       testb %cl, %cl                                            @0x0008dd97
   *       jne   .Lret                                               @0x0008dd99
   *     .LretZero:
   *       xorl  %eax, %eax                                          @0x0008dd9b
   *     .Lret:
   *       popq %rbp; retq
   *
   * Semantics:
   *   flag = sampleContentFlag_68 & 0xff
   *   aux  = sampleContentAux_69  & 0xff
   *   if (flag == 1):
   *     return aux != 0 ? 1 : 0
   *   else:
   *     return aux != 0 ? 2 : 0
   *
   * Encoded values plausibly represent: 0 = no interlacing / progressive,
   * 1 = top-field-first, 2 = bottom-field-first (H.264 field parity).
   *
   * @provenance ProCore @0x0008dd7a.
   */
  getSampleContent(): number {
    const flag = this.sampleContentFlag_68 & 0xff;
    const aux = this.sampleContentAux_69 & 0xff;
    if (flag === 1) {
      return (aux !== 0) ? 1 : 0;
    } else {
      return (aux !== 0) ? 2 : 0;
    }
  }
}
