// PCGrayAlphaPixel<ProCore::Private::PixelInfoTemplate<(PCPixelFormat::ChannelOrder)2>>
//   — ProCore 8-bit gray+alpha pixel (2 bytes: gray at +0x00, alpha at +0x01).
//   ChannelOrder 2 = the gray/alpha ordering. Only its `unpremultiply()`
//   in-place method is ported in this file.
//
// One symbol transcribed here:
//   @ProCore 0x476ae
//     PCGrayAlphaPixel<...ChannelOrder 2...>::unpremultiply()
//     mangled: __ZN16PCGrayAlphaPixelIN7ProCore7Private17PixelInfoTemplateILN13PCPixelFormat12ChannelOrderE2EEEE13unpremultiplyEv
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.__ZN16PCGrayAlphaPixelIN7ProCore7Private17PixelInfoTemplateILN13PCPixelFormat12ChannelOrderE2EEEE13unpremultiplyEv.s
//
// STRUCT LAYOUT (recovered from the method disasm):
//   PCGrayAlphaPixel<ChannelOrder 2> (2 bytes):
//     +0x00 : u8  gray   (read via `movzbl (%rdi),%ecx` @0x476c4; written @0x47725)
//     +0x01 : u8  alpha  (read via `movzbl 0x1(%rdi),%eax` @0x476b2)
//
// PURE MATH — no in-scope callees, no externs. Every constant cites the
// RIP-relative data address it was read from in ProCore's __TEXT __const.
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   0x476ae  pushq  %rbp
//   0x476af  movq   %rsp, %rbp
//   0x476b2  movzbl 0x1(%rdi), %eax          ; eax = alpha
//   0x476b6  testl  %eax, %eax
//   0x476b8  je     0x47725                   ; if alpha==0 -> store al(=0) into gray, return
//   0x476ba  cmpl   $0xff, %eax
//   0x476bf  je     0x47727                   ; if alpha==0xff -> return unchanged (no store)
//   0x476c1  movzbl %al, %eax                 ; eax = alpha (zero-extend, redundant)
//   0x476c4  movzbl (%rdi), %ecx             ; ecx = gray
//   0x476c7  movd   %ecx, %xmm0               ; xmm0 lane0(byte) = gray
//   0x476cb  pinsrb $0x1, %eax, %xmm0         ; xmm0 byte1 = alpha  -> bytes [gray, alpha, ...]
//   0x476d1  pmovzxbd %xmm0, %xmm0            ; 4 bytes -> 4 dwords: [gray, alpha, 0, 0]
//   0x476d6  cvtdq2pd %xmm0, %xmm0            ; low 2 dwords -> 2 f64: [gray, alpha]
//   0x476da  mulpd  0xdc99e(%rip), %xmm0      ; * [1/255, 1/255]   (const @0x124080 = 0.00392156862745098 x2)
//   0x476e2  cvtpd2ps %xmm0, %xmm0            ; -> f32 lanes: [gray/255, alpha/255, 0, 0]
//   0x476e6  movshdup %xmm0, %xmm1            ; xmm1 lane0 = xmm0 lane1 = alpha/255
//   0x476ea  divss  %xmm1, %xmm0             ; xmm0 lane0 = (gray/255) / (alpha/255)  [f32]
//   0x476ee  mulss  0x9a8c6(%rip), %xmm0     ; * 255.0            (const @0xe1fbc = 255.0f)  [f32]
//   0x476f6  cvtss2sd %xmm0, %xmm0            ; -> f64
//   0x476fa  addsd  0xdb18e(%rip), %xmm0     ; + 0.5             (const @0x122890 = 0.5)
//   0x47702  addsd  0xdb176(%rip), %xmm0     ; + 1e-07           (const @0x122880 = 1e-07)
//   0x4770a  roundsd $0x9, %xmm0, %xmm0       ; floor (mode 0x9 = round-toward-neg-inf + no-exc)
//   0x47710  cvttsd2si %xmm0, %ecx           ; ecx = (int)floor(...)   (truncate; value already integral)
//   0x47714  xorl   %eax, %eax               ; eax = 0
//   0x47716  testl  %ecx, %ecx
//   0x47718  cmovgl %ecx, %eax               ; if (ecx > 0) eax = ecx        ; clamp low @ 0
//   0x4771b  movl   $0xff, %ecx
//   0x47720  cmpl   %ecx, %eax
//   0x47722  cmovgel %ecx, %eax              ; if (eax >= 255) eax = 255      ; clamp high @ 255
//   0x47725  movb   %al, (%rdi)              ; gray = clamped result
//   0x47727  popq   %rbp
//   0x47728  retq
//
// SEMANTICS: standard 8-bit unpremultiply of the gray channel by alpha, with a
// round-half-up (floor(x + 0.5 + 1e-7)) and clamp to [0,255]. Two shortcut
// branches: alpha==0 stores gray=0; alpha==255 leaves gray unchanged (division
// by 1 is the identity, so no store is needed). The divide/scale is done in
// SINGLE precision (cvtpd2ps -> divss -> mulss) then widened back to double for
// the round — modelled with Math.fround at those exact f32 truncation points.
//
// DECODED CONSTANTS (ProCore __TEXT __const, x86_64 slice):
//   @0x124080 : f64 0.00392156862745098  (= 1/255), read twice by mulpd (both lanes)
//   @0xe1fbc  : f32 255.0                 (mulss)
//   @0x122890 : f64 0.5                   (addsd)
//   @0x122880 : f64 1e-07                 (addsd)

/** In-place gray+alpha pixel state for ChannelOrder 2. Bytes are u8 in [0,255]. */
export interface PCGrayAlphaPixel_ChannelOrder2State {
  /** +0x00 gray channel (premultiplied on input; unpremultiplied on output). */
  gray: number;
  /** +0x01 alpha channel. */
  alpha: number;
}

/** @ProChannel? no — ProCore const @0x124080: 1/255 (mulpd, both lanes). */
const INV_255 = 0.00392156862745098; // @ProCore 0x124080
/** @ProCore const @0xe1fbc: 255.0f (mulss, single precision). */
const F255 = Math.fround(255.0); // @ProCore 0xe1fbc
/** @ProCore const @0x122890: 0.5 (addsd, round-half-up bias). */
const HALF = 0.5; // @ProCore 0x122890
/** @ProCore const @0x122880: 1e-07 (addsd, tie-break epsilon). */
const EPS = 1e-7; // @ProCore 0x122880

/**
 * `PCGrayAlphaPixel<ProCore::Private::PixelInfoTemplate<(PCPixelFormat::ChannelOrder)2>>::unpremultiply()`
 *   — @ProCore 0x476ae
 *   — __ZN16PCGrayAlphaPixelIN7ProCore7Private17PixelInfoTemplateILN13PCPixelFormat12ChannelOrderE2EEEE13unpremultiplyEv
 *
 * Faithful line-for-line transcription of the disassembly quoted in the file
 * header. Mutates `p.gray` in place (the C++ method returns void and writes
 * (%rdi) = gray).
 */
export function unpremultiply(p: PCGrayAlphaPixel_ChannelOrder2State): void {
  // @0x476b2..0x476b8 — alpha; if alpha==0, store gray=0 and return.
  const alpha = p.alpha & 0xff;
  if (alpha === 0) {
    // je 0x47725: al still holds alpha(=0) from movzbl 0x1(%rdi) -> gray := 0.
    p.gray = 0;
    return;
  }
  // @0x476ba..0x476bf — if alpha==0xff, return WITHOUT storing (gray unchanged).
  if (alpha === 0xff) {
    return;
  }

  // @0x476c4 — gray.
  const gray = p.gray & 0xff;

  // @0x476d6..0x476da — [gray, alpha] -> f64 -> * (1/255) -> [gray/255, alpha/255].
  const grayNorm = gray * INV_255; // f64
  const alphaNorm = alpha * INV_255; // f64

  // @0x476e2 — cvtpd2ps: narrow both to single precision.
  const grayNormF = Math.fround(grayNorm);
  const alphaNormF = Math.fround(alphaNorm);

  // @0x476ea — divss: xmm0 = (gray/255) / (alpha/255)   [single precision].
  const dividedF = Math.fround(grayNormF / alphaNormF);

  // @0x476ee — mulss: * 255.0   [single precision].
  const scaledF = Math.fround(dividedF * F255);

  // @0x476f6 — cvtss2sd: widen back to double.
  let v = scaledF; // exact f32->f64 widening (no rounding)

  // @0x476fa..0x47702 — + 0.5 + 1e-7 (round-half-up bias).
  v = v + HALF;
  v = v + EPS;

  // @0x4770a — roundsd $0x9: floor (round toward -inf).
  v = Math.floor(v);

  // @0x47710 — cvttsd2si: truncate to int32 (value already integral post-floor).
  let ecx = Math.trunc(v) | 0;

  // @0x47714..0x47718 — eax = (ecx > 0) ? ecx : 0   (clamp low @ 0).
  let eax = ecx > 0 ? ecx : 0;

  // @0x4771b..0x47722 — if (eax >= 255) eax = 255   (clamp high @ 255).
  if (eax >= 0xff) eax = 0xff;

  // @0x47725 — store the clamped result back into the gray byte.
  p.gray = eax & 0xff;
}
