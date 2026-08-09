// PCGrayAlphaPixel<ProCore::Private::PixelInfoTemplate<(PCPixelFormat::ChannelOrder)8>>
//   — a 16-bit-per-channel gray+alpha pixel (ProCore.framework). This file
// ports ONLY the `unpremultiply()` method of this ONE template
// instantiation (ChannelOrder == 8). Faithfully transcribed from the FCP
// ProCore binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// Disassembly source:
//   raw-port/re/disasm/ProCore.__ZN16PCGrayAlphaPixelIN7ProCore7Private17PixelInfoTemplateILN13PCPixelFormat12ChannelOrderE8EEEE13unpremultiplyEv.s
// (unadjusted VAs from `otool -tV`).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the accessor offsets in unpremultiply)
// -----------------------------------------------------------------------------
//   +0x00  uint16_t gray   // the (premultiplied) gray/luminance sample.
//                          //   read `movzwl (%rdi)` @0x4773d, written
//                          //   `movw %ax,(%rdi)` @0x4779d.
//   +0x02  uint16_t alpha  // the coverage/alpha sample. read `movzwl
//                          //   0x2(%rdi)` @0x4772e.
//   (both channels are unsigned 16-bit; 0xFFFF == fully opaque / value 1.0.)
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   NONE. unpremultiply() is a leaf: pure SIMD/scalar arithmetic on the two
//   embedded u16 channels, no callq. Every constant it reads is a fixed
//   float/double literal from ProCore's __const (addresses cited below).
//
// -----------------------------------------------------------------------------
// MEMORY CONSTANTS (RIP-relative; VA = next-insn addr + disp; bytes read
// directly from the ProCore x86_64 slice)
// -----------------------------------------------------------------------------
//   @0x124050 (mulpd, 2 doubles) = [1.5259021896696422e-05,
//                                    1.5259021896696422e-05]  == 1.0/65535.0
//       — normalises each u16 channel to [0,1] (double precision).
//   @0x122b94 (mulss, 1 float)   = 65535.0f
//       — scales the unpremultiplied ratio back into u16 range.
//   @0x122890 (addsd, 1 double)  = 0.5
//       — rounding bias added before floor.
//   @0x122880 (addsd, 1 double)  = 1e-07
//       — epsilon added before floor (nudges exact .5 boundaries up).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN16PCGrayAlphaPixelIN7ProCore7Private17PixelInfoTemplateILN13PCPixelFormat12ChannelOrderE8EEEE13unpremultiplyEv
//       — PCGrayAlphaPixel<...PixelInfoTemplate<ChannelOrder 8>>::unpremultiply()
//         @ProCore 0x4772a
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProCore.__ZN16PCGrayAlphaPixel...13unpremultiplyEv.s)
// -----------------------------------------------------------------------------
//   0x4772a  pushq %rbp                                ; prologue
//   0x4772b  movq  %rsp, %rbp
//   0x4772e  movzwl 0x2(%rdi), %eax                    ; eax = alpha (u16, zero-extended)
//   0x47732  testl %eax, %eax
//   0x47734  je    0x4779d                             ; if alpha == 0 -> store (eax=0) into gray, return
//   0x47736  cmpl  $0xffff, %eax
//   0x4773b  je    0x477a0                             ; if alpha == 0xFFFF (opaque) -> return unchanged
//   0x4773d  movzwl (%rdi), %ecx                       ; ecx = gray (u16)
//   0x47740  movd  %ecx, %xmm0                         ; xmm0.i32[0] = gray
//   0x47744  pinsrw $0x1, %eax, %xmm0                  ; xmm0.i16[1] = alpha -> lanes int[gray, alpha]
//   0x47749  pmovzxwd %xmm0, %xmm0                     ; zero-extend the two i16 -> two i32 [gray, alpha]
//   0x4774e  cvtdq2pd %xmm0, %xmm0                     ; xmm0.f64[0..1] = (double)[gray, alpha]
//   0x47752  mulpd 0x124050(%rip), %xmm0               ; *= [1/65535, 1/65535] -> [grayN, alphaN] in [0,1]
//   0x4775a  cvtpd2ps %xmm0, %xmm0                     ; -> floats [grayN, alphaN, 0, 0]
//   0x4775e  movshdup %xmm0, %xmm1                     ; xmm1.f32[0] = xmm0.f32[1] = alphaN
//   0x47762  divss %xmm1, %xmm0                        ; xmm0.f32[0] = grayN / alphaN  (unpremultiply)
//   0x47766  mulss 0x122b94(%rip), %xmm0               ; *= 65535.0f -> back to u16 scale
//   0x4776e  cvtss2sd %xmm0, %xmm0                     ; -> double
//   0x47772  addsd 0x122890(%rip), %xmm0               ; += 0.5  (round bias)
//   0x4777a  addsd 0x122880(%rip), %xmm0               ; += 1e-07 (epsilon)
//   0x47782  roundsd $0x9, %xmm0, %xmm0                ; floor (mode 0x9 = round-toward -inf, no exc)
//   0x47788  cvttsd2si %xmm0, %ecx                     ; ecx = (int)truncated (already integral -> exact)
//   0x4778c  xorl  %eax, %eax                          ; eax = 0
//   0x4778e  testl %ecx, %ecx
//   0x47790  cmovgl %ecx, %eax                         ; eax = max(0, ecx)   (lower clamp)
//   0x47793  movl  $0xffff, %ecx
//   0x47798  cmpl  %ecx, %eax                          ; eax - 0xFFFF
//   0x4779a  cmovgel %ecx, %eax                        ; eax = min(0xFFFF, eax)  (upper clamp)
//   0x4779d  movw  %ax, (%rdi)                         ; gray = clamped result (alpha==0 lands here with ax=0)
//   0x477a0  popq  %rbp                                ; (alpha==0xFFFF fast-return also lands here)
//   0x477a1  retq
// -----------------------------------------------------------------------------

// ── ProCore __const literals (addresses cited per Rule 2) ──────────────────
/** @ProCore __const 0x124050 (mulpd, both lanes) = 1.0/65535.0. Normalises
 *  a u16 channel to [0,1] in double precision. */
const INV_65535 = 1.5259021896696422e-5; // == 1/65535, @ProCore 0x124050
/** @ProCore __const 0x122b94 (mulss) = 65535.0f. Scales the ratio back to
 *  u16 range. Kept single-precision (the machine uses `mulss`). */
const SCALE_65535_F32 = 65535.0; // @ProCore 0x122b94 (f32)
/** @ProCore __const 0x122890 (addsd) = 0.5 — rounding bias before floor. */
const ROUND_BIAS = 0.5; // @ProCore 0x122890
/** @ProCore __const 0x122880 (addsd) = 1e-07 — epsilon before floor. */
const ROUND_EPS = 1e-7; // @ProCore 0x122880

/**
 * `PCGrayAlphaPixel<ProCore::Private::PixelInfoTemplate<(PCPixelFormat::ChannelOrder)8>>`
 * — a 16-bit gray + 16-bit alpha pixel. Only `unpremultiply()` is ported
 * here (one method per ledger unit); the remaining template members are
 * separate entries. Fields model the +0x00 gray / +0x02 alpha layout.
 */
export class PCGrayAlphaPixel_PixelInfoTemplate8 {
  /** @+0x00 gray — premultiplied gray/luminance sample (u16). */
  gray = 0;
  /** @+0x02 alpha — coverage/alpha sample (u16; 0xFFFF == opaque). */
  alpha = 0;

  /**
   * `unpremultiply()` — @ProCore 0x4772a
   * (__ZN16PCGrayAlphaPixelIN7ProCore7Private17PixelInfoTemplateILN13PCPixelFormat12ChannelOrderE8EEEE13unpremultiplyEv).
   *
   * Divides the premultiplied gray channel by the normalised alpha to
   * recover the straight (un-premultiplied) gray, clamped to u16. Faithful
   * line-for-line transcription of the disassembly in the file header:
   *
   *   • alpha == 0      -> gray := 0            (@0x47734 je 0x4779d, eax=0)
   *   • alpha == 0xFFFF -> leave gray unchanged (@0x4773b je 0x477a0)
   *   • otherwise:
   *       grayN  = gray  * (1/65535)            (double)
   *       alphaN = alpha * (1/65535)            (double)
   *       r      = fround(grayN / alphaN)       (cvtpd2ps then divss — f32)
   *       r      = fround(r * 65535.0)          (mulss — f32)
   *       r      = floor((double)r + 0.5 + 1e-7)
   *       gray   = clamp((int)r, 0, 0xFFFF)
   *
   * NUMERICS (Rule 4): the machine narrows to single precision at
   * `cvtpd2ps` (grayN, alphaN) and stays f32 through `divss`/`mulss`, then
   * widens back to double at `cvtss2sd` for the +0.5/+1e-7/floor. We wrap
   * every f32-domain op in Math.fround to match `divss`/`mulss` bit-width,
   * and keep the normalisation multiplies (`mulpd`) in double. `roundsd
   * $0x9` is floor (round toward -inf); the value is already integral after
   * +0.5/+eps in practice, but Math.floor reproduces the mode exactly.
   */
  unpremultiply(): void {
    // @0x4772e-0x47734 — alpha == 0 -> gray = 0, return.
    const alpha = this.alpha & 0xffff;
    if (alpha === 0) {
      this.gray = 0; // store eax(=0) into gray @0x4779d
      return;
    }
    // @0x47736-0x4773b — alpha == 0xFFFF -> unchanged, return.
    if (alpha === 0xffff) {
      return;
    }
    // @0x4773d-0x4774e — lanes (double)[gray, alpha].
    const gray = this.gray & 0xffff;
    // @0x47752 — mulpd [1/65535,1/65535]: normalise both to [0,1] (double).
    const grayN = gray * INV_65535;
    const alphaN = alpha * INV_65535;
    // @0x4775a — cvtpd2ps: narrow both to f32.
    const grayNf = Math.fround(grayN);
    const alphaNf = Math.fround(alphaN);
    // @0x4775e-0x47762 — divss: grayN / alphaN in f32.
    let r = Math.fround(grayNf / alphaNf);
    // @0x47766 — mulss 65535.0f in f32.
    r = Math.fround(r * SCALE_65535_F32);
    // @0x4776e-0x4777a — cvtss2sd then addsd 0.5, addsd 1e-07 (double).
    const d = r + ROUND_BIAS + ROUND_EPS;
    // @0x47782 — roundsd $0x9 (floor) ; @0x47788 cvttsd2si -> int.
    let v = Math.trunc(Math.floor(d));
    // @0x4778c-0x47790 — eax = max(0, v).
    if (v < 0) v = 0;
    // @0x47793-0x4779a — eax = min(0xFFFF, v).
    if (v >= 0xffff) v = 0xffff;
    // @0x4779d — gray = clamped result (low 16 bits stored via movw).
    this.gray = v & 0xffff;
  }
}
