// raw-port/src/channels/OZOpticalFlow_Private_CacheFileHeader.ts
//
// FCP class `OZOpticalFlow::Private::CacheFileHeader` (Ozone.framework, x86_64)
// — the fixed-size record at the head of an on-disk optical-flow motion-vector
// cache file. It is a plain POD of scalars plus one packed flags byte; every
// exported member is a one-to-three-instruction accessor over that POD.
//
// Symbols transcribed here (Ozone.framework, x86_64):
//   0x4e52a0  OZOpticalFlow::Private::CacheFileHeader::vectorsHeight() const
//             __ZNK13OZOpticalFlow7Private15CacheFileHeader13vectorsHeightEv
//
// Source disassembly (dumped via raw-port/tools/disasm.sh --sym … Ozone):
//   raw-port/re/disasm/__ZNK13OZOpticalFlow7Private15CacheFileHeader13vectorsHeightEv.s
//
// ── STRUCT LAYOUT: OZOpticalFlow::Private::CacheFileHeader (partial) ────────
// Recovered from the sibling accessors, each of which is a single load/store at
// a fixed offset (addresses are the exact instruction the offset was read from):
//
//   +0x04 : sourceWidth  : u32  — sourceWidth()      @Ozone 0x4e51c4  movl 0x4(%rdi), %eax
//                                 setSourceWidth(u32)@Ozone 0x4e51b0
//   +0x08 : sourceHeight : u32  — sourceHeight()     @Ozone 0x4e51e4  movl 0x8(%rdi), %eax
//                                 setSourceHeight(u32)@Ozone 0x4e51d4 movl %esi, 0x8(%rdi)
//   +0x0c : totalFields  : u32  — totalFields()      @Ozone 0x4e5204  movl 0xc(%rdi), %eax
//   +0x10 : flags        : u8   — a packed bitfield, read with `movzbl` by every user:
//              bit0 (0x1) = resolution
//                   resolution()   @Ozone 0x4e5218  movzbl 0x10(%rdi),%eax ; andl $0x1,%eax
//              bit1 (0x2) = field-mode bit, stored INVERTED
//                   fieldMode()    @Ozone 0x4e5246  testb $0x2,0x10(%rdi) ; sete %al
//                                  => returns 1 when bit1 is CLEAR, 0 when SET
//                   setFieldMode(m)@Ozone 0x4e5254  sete on (m == 0), then
//                                  @Ozone 0x4e5264  movb (flags & ~0x2) | ((m==0) << 1)
//                                  => bit1 is set exactly when the stored mode is 0
//
// Offset +0x00 is not touched by the accessor ported here and is left undecoded
// rather than named on no evidence (needsSwap()@0x4e51a0 / the ctor @0x4e5150
// are separate ledger units).
//
// NOTE on `resolution` as a SHIFT: the value at bit0 is not merely a tag — the
// vectors-dimension accessors use it directly as a right-shift amount, so
// resolution=1 means the motion-vector field is stored at half the source
// dimensions. That is exactly what the function below transcribes.

/**
 * OZOpticalFlow::Private::CacheFileHeader — partial record.
 *
 * Fields are added as the methods that touch them are transcribed; every field
 * carries its byte offset, per PORTING_SPEC Rule 5.
 */
export interface OZOpticalFlow_Private_CacheFileHeader {
  /** sourceWidth — u32 at +0x04 (per sourceWidth() @Ozone 0x4e51c4). */
  sourceWidth: number;
  /** sourceHeight — u32 at +0x08 (per sourceHeight() @Ozone 0x4e51e4). */
  sourceHeight: number;
  /** totalFields — u32 at +0x0c (per totalFields() @Ozone 0x4e5204). */
  totalFields: number;
  /**
   * flags — u8 at +0x10. bit0 = resolution (@Ozone 0x4e5218),
   * bit1 = inverted field-mode bit (@Ozone 0x4e5246 / 0x4e5264).
   */
  flags: number;
}

/**
 * OZOpticalFlow::Private::CacheFileHeader::vectorsHeight() const
 * @Ozone 0x4e52a0.
 * Mangled: __ZNK13OZOpticalFlow7Private15CacheFileHeader13vectorsHeightEv
 *
 * Height in motion-vector samples: the source height shifted right by the
 * header's resolution bit (bit0 of the flags byte at +0x10), so a
 * half-resolution cache reports half the source height.
 *
 * Faithful transcription — the whole body is six instructions:
 *
 *   0x4e52a0  pushq   %rbp                 ; frame setup, no semantic effect
 *   0x4e52a1  movq    %rsp, %rbp           ; frame setup, no semantic effect
 *   0x4e52a4  movzbl  0x10(%rdi), %ecx     ; ecx = zero-extended flags byte @ +0x10
 *   0x4e52a8  movl    0x8(%rdi), %eax      ; eax = sourceHeight (u32 @ +0x08)
 *   0x4e52ab  andb    $0x1, %cl            ; cl  = flags & 1   (= resolution())
 *   0x4e52ae  shrl    %cl, %eax            ; eax = eax >>> cl  (LOGICAL: shrl, not sarl)
 *   0x4e52b0  popq    %rbp
 *   0x4e52b1  retq                         ; return eax (u32)
 *
 * The shift is `shrl` (logical) on a 32-bit register, so the value is treated
 * as unsigned — matched below with `>>>`. The x86 shift count is taken from
 * %cl mod 32, but `andb $0x1` has already constrained it to 0 or 1, so no
 * masking behavior is observable and none is emulated.
 *
 * The count register is loaded with `movzbl` (zero-extend BYTE), which is why
 * the flags field is modelled as a u8 and masked to 8 bits here before the
 * `andb`.
 *
 * @param h  the CacheFileHeader (passed by `this` in %rdi)
 * @returns  sourceHeight >>> (flags & 1), as a u32
 */
export function ozOpticalFlowPrivateCacheFileHeaderVectorsHeight(
  h: OZOpticalFlow_Private_CacheFileHeader,
): number {
  // movzbl 0x10(%rdi), %ecx @0x4e52a4 — zero-extended byte load.
  const flagsByte = h.flags & 0xff;
  // movl 0x8(%rdi), %eax @0x4e52a8 — 32-bit load of sourceHeight.
  const sourceHeight = h.sourceHeight >>> 0;
  // andb $0x1, %cl @0x4e52ab — the shift count is the resolution bit.
  const shift = flagsByte & 0x1;
  // shrl %cl, %eax @0x4e52ae — logical (unsigned) right shift.
  return (sourceHeight >>> shift) >>> 0;
}
