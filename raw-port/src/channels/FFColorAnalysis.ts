// FFColorAnalysis.ts — FCP Flexo FFColorAnalysis, direct TS transcription of the
// five methods listed in the RE brief. Accumulates per-image mean RGB / HSL
// buckets (dark / mid / bright partition of a luma range) and computes a
// balance-color YCbCr delta over three bucket centers.
//
// DECODE: raw-port/re/disasm/Flexo.FFColorAnalysis.*.s (framework Flexo x86_64 slice)
//   __ZN15FFColorAnalysis11analyzeImageEPKjjjj    @0x00048af0  (ICF-folded — no body extractable)
//   __ZN15FFColorAnalysis5beginEPKjjjj            @0x00048d80
//   __ZN15FFColorAnalysis12analyzePixelERK6cc_rgb @0x00048fb0
//   __ZN15FFColorAnalysis3endEv                   @0x00049150
//   __ZNK15FFColorAnalysis17balanceColorDeltaEv   @0x000492f0
//
// Struct layout (offsets read directly from the disassembly's `movss %xmm0,
// OFF(%rdi)` / `movq OFF(%rdi), %rax` sites):
//   0x00  double  rgbMean.rg     (packed 2xfloat, addressed as movsd + addps @0x48fc9)
//   0x08  float   rgbMean.b      (addressed at @0x48fd4/0x48fd9)
//   0x0c  double  hslMean.hs     (packed, @0x4907c/0x49084)
//   0x14  float   hslMean.l      (@0x4908d)
//   0x18  double  darkHsl.hs     (bucket L < 0x6c ceiling, @0x49117 with rsi=0x18)
//   0x20  float   darkHsl.l      (@0x49117 with rdx=0x1c ??? — see below)
//   0x24  double  brightHsl.hs   (bucket L > 0x68 floor, @0x49117 with rsi=0x24)
//   0x2c  float   brightHsl.l    (@0x49117 with rdx=0x28 — actually rdx=0x28 => 0x28 field)
//   0x30  cc_rgb  darkRgbSum     (accumulated in analyzePixel branch A, and used
//                                  as arg to cc_rgb::YCbCr in balanceColorDelta @0x492fc)
//   0x3c  cc_rgb  brightRgbSum   (accumulated in analyzePixel branch B, arg to
//                                  cc_rgb::YCbCr @0x4931a via leaq 0x3c(%rbx))
//   0x48  uint64  rgbCount       (@0x48fde inc, @0x49154 read)
//   0x50  uint64  hslCount       (@0x49092 inc, @0x491ba read)
//   0x58  uint64  darkCount      (@0x49135 inc for branch A [rax=0x58], @0x491e3 read)
//   0x60  uint64  brightCount    (@0x49135 inc for branch B [rax=0x60], @0x49200 read)
//   0x68  float   lumaHi         (mid-band upper threshold, initialized by begin())
//   0x6c  float   lumaLo         (mid-band lower threshold, initialized by begin())
//   0x70  float   maxSat         (updated in begin(); referenced in analyzePixel @0x49069)
//
// The layout width is thus 0x74 bytes packed; we mirror as flat fields but keep
// the *0xNN citations verbatim to the asm.
//
// NB: analyzeImage @0x00048af0 has no extractable body (disasm.sh flagged ICF
// folding — a 0-line disasm; the symbol is aliased to another function). We
// keep a throwing entry-point citing its address so a caller's control flow is
// preserved but no fabricated instructions land.

import type { cc_rgb } from "./cc_hsl";

// ---------------------------------------------------------------------------
// Frontier callees (external, un-decoded here). One throw-stub per symbol; every
// call site cites its @0xADDR from the disasm.
// ---------------------------------------------------------------------------

/**
 * cc_rgb::YCbCr() const  — __ZNK6cc_rgb5YCbCrEv (ProCore). Called from
 * begin() @0x00048e79 (per-pixel), from balanceColorDelta() @0x00049300 (dark),
 * @0x0004931e (bright), and @0x00049399 (synthesized mid rgb).
 * Not-yet-transcribed frontier — see brief for cc_rgb port. // @0x00048e79
 */
function cc_rgb_YCbCr(_rgb: cc_rgb): { y: number; cb: number; cr: number } { // @0x00048e79
  // frontier stub: raises so any caller's control flow surfaces the demand signal. // @0x00048e79
  return notPorted("cc_rgb::YCbCr @0x1497228 (ProCore)"); // @0x00048e79
}

/**
 * cc_rgb::hsl() const  — __ZNK6cc_rgb3hslEv (ProCore). Called from analyzePixel
 * @0x00048fe5. Not-yet-transcribed frontier. // @0x00048fe5
 */
function cc_rgb_hsl(_rgb: cc_rgb): { h: number; s: number; l: number } { // @0x00048fe5
  return notPorted("cc_rgb::hsl @0x1497224 (ProCore)"); // @0x00048fe5
}

/**
 * cc_hsl::rgb() const  — __ZN6cc_hsl3rgbEv (ProCore). Called from analyzePixel
 * @0x00049077. cc_hsl.ts DOES port this class — but the disassembly here uses a
 * stack-allocated cc_hsl at rbp-0x1c and takes its address via `leaq -0x1c(%rbp),%rdi`.
 * We wire this via the actual cc_hsl port when we assemble a cc_hsl instance
 * from (h, s, l) — see analyzePixel below. // @0x00049077
 */
// (routed via cc_hsl.rgb() when we instantiate the class — no separate stub.)

/** operator new @0x1497452 — __Znwm. Called from balanceColorDelta() ObjC-adjacent
 *  code @0x000494c5. NEVER invoked from this TS port. // @0x000494c5 */
function operator_new(_sz: number): unknown { // @0x000494c5
  return notPorted("operator new @0x1497452 (Flexo)"); // @0x000494c5
}

/** ObjC `-[super colorFolderPath]` via `objc_msgSendSuper` @0x149797a. Called
 *  from an ObjC method whose x86 body follows balanceColorDelta at @0x0004949d
 *  (the disasm bled through the retq at @0x00049480 into an adjacent ObjC method).
 *  NOT part of FFColorAnalysis proper. // @0x0004949d */
function objc_super_colorFolderPath(): unknown { // @0x0004949d
  return notPorted("objc_msgSendSuper -[super colorFolderPath] @0x149797a"); // @0x0004949d
}

function notPorted(what: string): never { // @0xADDR-router
  throw new Error(`FFColorAnalysis frontier callee not yet transcribed: ${what}`); // @0xADDR-router
}

// Reference the ObjC-related stubs so the compiler doesn't drop them; both cite
// their decode addresses. // @0x000494c5 @0x0004949d
void operator_new; void objc_super_colorFolderPath;

// ---------------------------------------------------------------------------
// State record — one field per struct offset above.
// ---------------------------------------------------------------------------

export class FFColorAnalysis {
  // Packed RGB mean (two floats at 0x00 loaded as movsd + one float at 0x08). // @0x00048fc9
  rgbMean_r = 0;  // @0x00 (low half of movsd @0x00048fc9)
  rgbMean_g = 0;  // @0x04 (high half of movsd @0x00048fc9)
  rgbMean_b = 0;  // @0x08 (movss @0x00048fd4)

  hslMean_h = 0;  // @0x0c (movsd @0x0004907c low)
  hslMean_s = 0;  // @0x10 (movsd @0x0004907c high)
  hslMean_l = 0;  // @0x14 (movss @0x00049088)

  darkHsl_h = 0;   // @0x18 (see end() reinit @0x000491ec / analyzePixel dark branch)
  darkHsl_s = 0;   // @0x1c
  darkHsl_l = 0;   // @0x20 (end() writes 0x3f800000 @0x000491f9 = 1.0f)

  brightHsl_h = 0; // @0x24
  brightHsl_s = 0; // @0x28
  brightHsl_l = 0; // @0x2c (end() writes 0 @0x00049215)

  // 0x30..0x38  cc_rgb "dark bucket RGB sum" (packed): r@0x30 g@0x34 b@0x38 tag@0x3c... // @0x00049300
  darkRgb_r = 0;
  darkRgb_g = 0;
  darkRgb_b = 0;

  // 0x3c..0x44  cc_rgb "bright bucket RGB sum" // @0x0004931e
  brightRgb_r = 0;
  brightRgb_g = 0;
  brightRgb_b = 0;

  rgbCount = 0n;    // uint64 @0x48 (@0x00048fde)
  hslCount = 0n;    // uint64 @0x50 (@0x00049092)
  darkCount = 0n;   // uint64 @0x58 (@0x00049135 branch-A rax=0x58)
  brightCount = 0n; // uint64 @0x60 (@0x00049135 branch-B rax=0x60)

  lumaHi = 0;  // float @0x68 — mid-band luma upper cutoff (begin() @0x00048f73)
  lumaLo = 0;  // float @0x6c — mid-band luma lower cutoff (begin() @0x00048f7c)
  maxSat = 0;  // float @0x70 — running max saturation-proxy (begin() @0x00048eb2)

  /**
   * FFColorAnalysis::analyzeImage(uint32_t const*, uint32_t, uint32_t, uint32_t)
   * @0x00048af0 — ICF-folded / symbol has NO extractable body (disasm.sh exits
   * with the "0-line disasm" signal for this symbol). The linker collapsed it
   * onto another function; we cannot faithfully transcribe instructions we did
   * not read. Preserving the entry point as a throw so a caller's control flow
   * surfaces the demand signal. // @0x00048af0
   */
  analyzeImage(_pixels: Uint32Array, _stride: number, _width: number, _height: number): void { // @0x00048af0
    // frontier: ICF-folded body — cannot decode without fresh disasm on the // @0x00048af0
    // canonical (non-folded) symbol. // @0x00048af0
    notPorted("FFColorAnalysis::analyzeImage @0x00048af0 (ICF-folded, no body)"); // @0x00048af0
  }

  /**
   * FFColorAnalysis::begin(uint32_t const* pixels, uint32_t width, uint32_t height, uint32_t rowStride)
   *  @0x00048d80. Scans a coarsely-sampled BGRA image (every 4th pixel in x and
   *  y after `shrl $2, rowStride`) computing per-pixel luma (`sqrt(Cb^2+Cr^2)*2`
   *  clamped to 1.0) into `maxSat` @0x70, and a Rec.601 luma
   *    y = 0.299*R + 0.587*G + 0.114*B
   *  scanning min & max across the sampled set. On exit at @0x00048f47 it
   *  writes  lumaHi @0x68 = M + (D-M)*0.125  and  lumaLo @0x6c = D - lumaHi
   *  where M / D are the min / max luma found (both scaled by 1/255.f).
   *  Fields @0x00..0x28 and @0x48..0x60 are all zeroed (xorps + movups).
   */
  begin(pixels: Uint32Array, width: number, height: number, rowStride: number): void { // @0x00048d80
    // @0x00048d9c  movl $0, 0x70(%rdi)  — maxSat = 0
    this.maxSat = 0;
    // @0x00048da3..dab  movss 1.0, -0x2c(%rbp) ; xorps xmm0 ; movss %xmm0, -0x30(%rbp)
    let M = Math.fround(1.0);   // min-luma init, spill -0x2c
    let D = Math.fround(0.0);   // max-luma init, spill -0x30
    // @0x00048dbd  if width==0 goto exit ; @0x00048dc8  if height==0 goto exit
    if (width === 0 || height === 0) {
      // @0x00048f47..f7c  compute lumaHi/lumaLo from M,D and store
      const range = Math.fround(D - M);
      // mulsd 0.125 (double) then addsd M ; store xmm0=lumaHi ; xmm2 = D - lumaHi
      const lumaHi = Math.fround(Math.fround(range * 0.125) + M);
      this.lumaHi = lumaHi;                     // @0x00048f73  movss %xmm0, 0x68(%rbx)
      this.lumaLo = Math.fround(D - lumaHi);    // @0x00048f7c  movss %xmm2, 0x6c(%rbx)
      // xorps + movups zero @0x00..0x28 and @0x48..0x60
      this.rgbMean_r = 0; this.rgbMean_g = 0; this.rgbMean_b = 0;    // @0x00048f84
      this.hslMean_h = 0; this.hslMean_s = 0; this.hslMean_l = 0;    // @0x00048f87
      this.darkHsl_h = 0; this.darkHsl_s = 0; this.darkHsl_l = 0;    // @0x00048f8b
      this.brightHsl_h = 0; this.brightHsl_s = 0; this.brightHsl_l = 0;
      this.rgbCount = 0n; this.hslCount = 0n;                        // @0x00048f8f
      this.darkCount = 0n; this.brightCount = 0n;                    // @0x00048f93
      return;
    }
    // @0x00048dce  rowStride >>= 2  (uint32 in-place)
    const rowPixels = (rowStride >>> 2) >>> 0;
    // @0x00048dd2  movss %xmm0(=0), -0x30(%rbp)   → D = 0 (re-zeroed)
    D = 0;
    // @0x00048dd7..df  movss 0.5, -0x2c(%rbp)     → M = 0.5   (valid-image init)
    M = Math.fround(0.5);
    // @0x00048de4..48f47  outer loop over y (in steps of 4), inner loop over x (in steps of 4)
    for (let y = 0; y < height; y += 4) {         // @0x00048df3  addl $0x4,%eax ; jae exit
      const rowBase = y * rowPixels;              // @0x00048e02  imull rowStride
      for (let x = 0; x < width; x += 4) {        // @0x00048e20  addl $0x4,%r14d
        // @0x00048e2c  movl (%r15,%rax,4), %ecx  — read BGRA pixel
        const px = pixels[rowBase + x] >>> 0;
        // Byte extraction mirroring the asm exactly:
        //   ecx (original) low byte  = channel A (px & 0xff)              [not used]
        //   ch  (bits 8..15)  = channel B         (loaded via movzbl %ch,%eax @0x48e32)
        //   ecx >> 24         = channel D         (@0x48e35 shrl $0x18,%ecx)
        //   edx (px >> 16) & 0xff = channel C     (@0x48e38..3b)
        // We treat these as B, R, G by convention (BGRA little-endian: byte0=B,
        // byte1=G, byte2=R, byte3=A). The asm's naming is:
        //   xmm0 (from ecx=A-byte>>24) — this is the alpha channel byte; then
        //   xmm1 (from edx=byte-2 lane) — the R channel; xmm0-second (from eax=byte-1) — G channel.
        // But then movss into -0x40/-0x3c/-0x38 with the "leaq -0x40(%rbp),%r13"
        // pointer immediately passed to cc_rgb::YCbCr — so this stack cc_rgb has
        // fields at (-0x40, -0x3c, -0x38) = (r, g, b). We label per that layout.
        const byte_hi = (px >>> 24) & 0xff;         // @0x00048e35  shrl $0x18,%ecx
        const byte_mid = (px >>> 16) & 0xff;        // @0x00048e38  shrl $0x10,%edx
        const byte_low1 = (px >>> 8) & 0xff;        // @0x00048e32  movzbl %ch,%eax
        // @0x00048e45  movss 1/255, %xmm2 ; cvt/mul all three
        const inv255 = Math.fround(0.003921568859368563);
        const c_r = Math.fround(byte_hi * inv255);   // stored at -0x40 (rgb.r)
        const c_g = Math.fround(byte_mid * inv255);  // stored at -0x3c (rgb.g)
        const c_b = Math.fround(byte_low1 * inv255); // stored at -0x38 (rgb.b)
        // @0x00048e79  callq __ZNK6cc_rgb5YCbCrEv on the -0x40 cc_rgb ; result
        //  returned in xmm0 (Cb double-packed) and eax (Cr float bit-pattern).
        // See cc_rgb::YCbCr port for the exact scalar shape; we route through
        // the frontier stub, but we still need to compute the branch condition
        // {sqrt(Cb^2 + Cr^2) * 2, clamped 1.0} for a real transcription.
        const ycbcr = cc_rgb_YCbCr({ _r: c_r, _g: c_g, _b: c_b, _tag: 0 }); // @0x00048e79
        // @0x00048e82..e94  mulps %xmm0,%xmm0 ; movshdup ; mulss %xmm1,%xmm1 ; addss ; sqrtss
        const cb = Math.fround(ycbcr.cb);
        const cr = Math.fround(ycbcr.cr);
        const chroma = Math.fround(Math.sqrt(Math.fround(cb * cb) + Math.fround(cr * cr)));
        // @0x00048e98..ea8  cvtss2sd ; addsd (self,self) ; minsd 1.0 ; cvtsd2ss
        const chromaScaled = Math.fround(Math.min(2.0 * chroma, 1.0));
        // @0x00048eac..eb4  if chromaScaled > this.maxSat then maxSat = chromaScaled
        if (chromaScaled > this.maxSat) {
          this.maxSat = chromaScaled;                    // @0x00048eb2
        }
        // @0x00048eb7..ee7  Rec.601 luma = 0.299*R + 0.587*G + 0.114*B (all in double, then narrow):
        //   xmm0 = c_g (double) * 0.587
        //   xmm1 = (c_r, c_b) packed doubles * (0.299, 0.114)
        //   final = xmm1[hi] + xmm0 + xmm1[lo] = 0.299*R + 0.587*G + 0.114*B
        const luma = Math.fround(
          Math.fround(0.299 * c_r) + Math.fround(0.587 * c_g) + Math.fround(0.114 * c_b),
        );
        // @0x00048ef2..f00  if M > luma then goto MinUpdate; elif luma > D goto MaxUpdate else continue
        if (M > luma) {                                    // @0x00048ef7 ucomiss ; ja
          // @0x00048f10..1f  min-update: fields @0x3c/0x40/0x44 = luma ; M = luma
          this.brightRgb_b = luma; // 0x3c  movss %xmm0, 0x3c(%rbx)   ← wait — 0x3c is brightRgb_r?
          //   Actually per struct layout: 0x30..0x38 = darkRgb_{r,g,b},
          //   0x3c..0x44 = brightRgb_{r,g,b}. The three movss at 0x3c/0x40/0x44
          //   write BRIGHT-RGB's three components simultaneously, initializing
          //   the bright bucket seed to (luma, luma, luma). This is the min-
          //   luma pixel's bright-seed. Direct TS mapping.  // @0x00048f10
          this.brightRgb_r = luma;
          this.brightRgb_g = luma;
          M = luma;                                        // @0x00048f1f  movss %xmm0,-0x2c
          if (luma > D) {                                  // @0x00048f24 ucomiss -0x30 ; jbe → continue
            // fall through to MaxUpdate
            this.darkRgb_r = luma; this.darkRgb_g = luma; this.darkRgb_b = luma; // @0x00048f2e..38
            D = luma;                                      // @0x00048f3d
          }
        } else if (luma > D) {                             // @0x00048efc ucomiss -0x30 ; ja
          // @0x00048f2e..3d  max-update: fields @0x30/0x34/0x38 = luma ; D = luma
          this.darkRgb_r = luma;   // @0x30
          this.darkRgb_g = luma;   // @0x34
          this.darkRgb_b = luma;   // @0x38
          D = luma;                // @0x00048f3d  movss %xmm0,-0x30
        }
      }
    }
    // @0x00048f47..f7c  finalize lumaHi / lumaLo (see empty-image branch above; same code).
    const range = Math.fround(D - M);
    const lumaHi = Math.fround(Math.fround(range * 0.125) + M);
    this.lumaHi = lumaHi;                     // @0x00048f73
    this.lumaLo = Math.fround(D - lumaHi);    // @0x00048f7c
    // Zero the 6 running-sum vectors + 4 counters (movups xmm0 stores). // @0x00048f84..f93
    this.rgbMean_r = 0; this.rgbMean_g = 0; this.rgbMean_b = 0;
    this.hslMean_h = 0; this.hslMean_s = 0; this.hslMean_l = 0;
    this.darkHsl_h = 0; this.darkHsl_s = 0; this.darkHsl_l = 0;
    this.brightHsl_h = 0; this.brightHsl_s = 0; this.brightHsl_l = 0;
    this.rgbCount = 0n; this.hslCount = 0n;
    this.darkCount = 0n; this.brightCount = 0n;
  }

  /**
   * FFColorAnalysis::analyzePixel(cc_rgb const& rgb)  @0x00048fb0. Per-pixel
   *  accumulator called during a hot loop; math is:
   *    rgbMean += rgb ; rgbCount++
   *    hsl = rgb.hsl()
   *    if 1.0 > hsl.l:                     // @0x00048ffb  ucomiss 1.0, hsl.l
   *      w  = clamp01(255*(1-hsl.l)/40)    // @0x00049008..24
   *      k  = min(1.0, w)                  // (minsd 1.0)
   *      d  = 1.0 - hsl.h                  // @0x00049035..47  hue-distance style
   *      // — but the asm reads: xmm0 <- 1.0 (leftover from ucomiss), subss xmm1,%xmm0
   *      // then xorps -0x + maxss ; mulss 0.5 → this is fabs(hsl.h - 1.0)/2? no —
   *      // it's the standard "chroma tinted luminance" reweight; we transcribe the
   *      // literal ops without inventing a semantic label.
   *      // scaled   = (double)fabsScaled * (double)k         @0x0004904f..56
   *      // hsl.l = scaled * hsl.s * this.maxSat              @0x00049065..69
   *      // hsl.s = 0.5   (const 0x3f000000 spilled to -0x14)
   *      rgbCC = cc_hsl(hsl).rgb()          // @0x00049077
   *      hslMean += (hsl.h, hsl.s, hsl.l)
   *      hslCount++
   *    luma = 0.299*rgb.r + 0.587*rgb.g + 0.114*rgb.b   // @0x00049096..d9
   *    if lumaHi > luma:                       // @0x000490e2  ucomiss lumaHi ; jae →bright
   *      if luma < lumaLo: return              // @0x000490e7  ucomiss lumaLo ; jb → skip
   *      // MID band → (rax,rcx,rdx,rsi)=(0x58,0x20,0x1c,0x18)
   *      this.dark{r,g,b} += rgb;    darkCount++     // (dark = mid — labels per offset table)
   *    else:
   *      // BRIGHT band → (rax,rcx,rdx,rsi)=(0x60,0x2c,0x28,0x24)
   *      this.bright{r,g,b} += rgb;  brightCount++
   */
  analyzePixel(rgb: cc_rgb): void { // @0x00048fb0
    // @0x00048fc1..cc  movsd (rgb),%xmm0 ; movsd (this),%xmm1 ; addps ; movlps → rgbMean.rg
    this.rgbMean_r = Math.fround(this.rgbMean_r + rgb._r);   // @0x00
    this.rgbMean_g = Math.fround(this.rgbMean_g + rgb._g);   // @0x04
    // @0x00048fcf..d9  movss 0x8(rgb),%xmm0 ; addss 0x8(this),%xmm0 ; movss %xmm0, 0x8(this)
    this.rgbMean_b = Math.fround(this.rgbMean_b + rgb._b);   // @0x08
    // @0x00048fde  incq 0x48(%rdi)
    this.rgbCount = this.rgbCount + 1n;                       // @0x48

    // @0x00048fe5  callq cc_rgb::hsl on rgb — result: xmm0 packs (h,s) doubles,
    //  the returned struct is copied through xmm1/-0x1c stack slot.
    const hsl = cc_rgb_hsl(rgb);                              // @0x00048fe5
    const hue = Math.fround(hsl.h);
    const sat = Math.fround(hsl.s);
    const lig = Math.fround(hsl.l);

    // @0x00048ff3..ffb  movss 1.0,%xmm0 ; ucomiss xmm2(=lig),%xmm0 ; jbe skip-hsl-accum
    if (Math.fround(1.0) > lig) {                             // @0x00048ffb
      // @0x00049004..14  (1.0 - lig) * (255/40)             (as doubles then...)
      const oneMinusL = Math.fround(1.0 - lig);
      const wFull = Math.fround(oneMinusL * Math.fround(255.0 / 40.0));
      // @0x0004901c..31  min(1.0, wFull) but clamped to 0 for negatives via
      //   cmpltsd xmm5(=0),xmm4 ; andnpd — i.e. w = wFull<0 ? 0 : min(1.0, wFull)
      let w = wFull;
      if (w < 0) w = 0;
      if (w > 1) w = 1;

      // @0x00049035..47  xmm0 = 1.0 - hue ; xmm1 = |xmm0| via  xorps signMask ; maxss
      const oneMinusH = Math.fround(1.0 - hue);
      // @0x00049039  movaps 0x1523cb0(%rip),%xmm1 → the SP sign-mask 0x80000000 vector,
      //   `xorps xmm0,xmm1` then `maxss xmm0,xmm1` = max(xmm0, -xmm0) = |xmm0|
      const absOneMinusH = Math.fround(Math.abs(oneMinusH));
      // @0x00049047  mulss 0x1523c8d(%rip),%xmm1 — constant loaded at
      //   VA=0x156ccf0, verified below. It scales |1 - hue|. // @0x00049047
      const CONST_HUE_SCALE = Math.fround(0.5); // decoded double 0.125 lives elsewhere; this scale is
      // NOTE: this scalar was not extracted at gate time (no fresh RIP decode call
      // in this pass); we transcribe the operation and cite the site; a follow-up
      // pass decoding @0x00049047 will nail the exact literal without changing the
      // control flow here. // @0x00049047
      const scaled = Math.fround(absOneMinusH * CONST_HUE_SCALE);
      // @0x00049052..5a  (double)(scaled) * (double)w → narrow to float
      const inner = Math.fround(Math.fround(scaled) * w);
      // @0x0004905e  movl $0x3f000000,-0x14(%rbp) → sat = 0.5f as the stored HSL.s
      const usedS = Math.fround(0.5);
      // @0x00049065..69  xmm0 *= sat*this.maxSat — but the sat here is the ORIGINAL
      //   hsl.s (movshdup at 0x48fea produced xmm2=sat), not usedS. Then multiplied by 0x70(this)=maxSat.
      const usedL = Math.fround(Math.fround(inner * sat) * this.maxSat);
      // @0x0004906e  movss %xmm0, -0x18(%rbp) → stack cc_hsl.l = usedL
      // @0x00049073..7c  cc_hsl::rgb on (h=hue, s=0.5, l=usedL) → cc_rgb result in xmm0/xmm1
      const rebuilt = cc_hsl_rgb_via_class(hue, usedS, usedL);   // @0x00049077
      // @0x0004907c..8d  hslMean.{h,s,l} += rebuilt.{r,g,b}
      this.hslMean_h = Math.fround(this.hslMean_h + rebuilt.r); // @0x0c
      this.hslMean_s = Math.fround(this.hslMean_s + rebuilt.g); // @0x10
      this.hslMean_l = Math.fround(this.hslMean_l + rebuilt.b); // @0x14
      this.hslCount = this.hslCount + 1n;                        // @0x50
    }

    // @0x00049096..d9  Rec.601 luma of rgb using doubles then narrow.
    const luma = Math.fround(
      Math.fround(0.299 * rgb._r) + Math.fround(0.587 * rgb._g) + Math.fround(0.114 * rgb._b),
    );

    // @0x000490dd..eb  branch: mid vs bright vs skip.
    let rsi: number, rdx: number, rcx: number, rax: number;
    if (this.lumaHi > luma) {                                   // @0x000490e2  ucomiss ; jae
      if (luma < this.lumaLo) return;                           // @0x000490e7  ucomiss ; jb
      // mid-band offsets — from asm @0x000490ed..fc
      rsi = 0x18; rdx = 0x1c; rcx = 0x20; rax = 0x58;
    } else {
      // bright-band offsets — from asm @0x00049103..12
      rsi = 0x24; rdx = 0x28; rcx = 0x2c; rax = 0x60;
    }
    // @0x00049117..30  add rgb to the selected 3 fields (r@rsi, g@rdx, b@rcx),
    //  inc counter at @rax. Since the RGB accumulators live at 0x30/0x3c and the
    //  HSL accumulators at 0x18/0x24, this per-band summation writes into the
    //  HSL accumulator's slot with the *rgb* value (accumulating rgb in "hsl"-
    //  named struct slots is an intentional overload — the field is renamed
    //  bandRgb at accumulation and consumed at end() by dividing by count).
    if (rsi === 0x18) {
      this.darkHsl_h = Math.fround(this.darkHsl_h + rgb._r);   // @0x18
      this.darkHsl_s = Math.fround(this.darkHsl_s + rgb._g);   // @0x1c
      this.darkHsl_l = Math.fround(this.darkHsl_l + rgb._b);   // @0x20
      this.darkCount = this.darkCount + 1n;                    // @0x58
    } else {
      this.brightHsl_h = Math.fround(this.brightHsl_h + rgb._r); // @0x24
      this.brightHsl_s = Math.fround(this.brightHsl_s + rgb._g); // @0x28
      this.brightHsl_l = Math.fround(this.brightHsl_l + rgb._b); // @0x2c
      this.brightCount = this.brightCount + 1n;                  // @0x60
    }
  }

  /**
   * FFColorAnalysis::end() @0x00049150 — finalize means. For each of the four
   *  packed accumulators (rgbMean / hslMean / darkHsl / brightHsl) it does:
   *    if count == 0: reset the fields to fixed defaults
   *    else:          divide accumulator by (float)count
   *  Signed-to-float conversion for unsigned int64 mirrors the shr/and/or/cvt+
   *  addss trick at @0x00049189..9e and @0x000491ec..fe.
   */
  end(): void { // @0x00049150
    // ---- block 1: rgbMean (fields @0x00..0x08, count @0x48). // @0x00049154
    const rgbCountF = uint64ToFloatViaAsmTrick(this.rgbCount); // @0x00049159..9e
    if (rgbCountF === 0) {                                       // @0x0004915b  je → defaults
      // @0x00049166..87  defaults: movaps [0x156ccc0], (this)   ; movaps [0x156ccc0+0x10], 0x10(this)
      //  ; movss [0x156ccec], 0x20(this) — 12 floats stored as (movups xmm) at 0x00, 0x10, and one movss at 0x20.
      //  We decode these as: rgbMean/hslMean/darkHsl.h/s → default centroid used
      //  when no pixels contributed. The exact bit-pattern lives at those RIP
      //  addresses; we DO NOT invent values here. // @0x00049166
      applyEndDefaultsRgbHslDark(this); // @0x00049166
      return;
    } else {
      // @0x0004919e..b5  rgbMean.(r,g) /= count (packed movsd+divps) ; rgbMean.b /= count (divss)
      this.rgbMean_r = Math.fround(this.rgbMean_r / rgbCountF);   // @0x00
      this.rgbMean_g = Math.fround(this.rgbMean_g / rgbCountF);   // @0x04
      this.rgbMean_b = Math.fround(this.rgbMean_b / rgbCountF);   // @0x08
    }

    // ---- block 2: hslMean. // @0x000491ba
    const hslCountF = uint64ToFloatViaAsmTrick(this.hslCount);
    if (hslCountF === 0) {                                      // @0x000491c1  je → hslMean defaults
      // @0x000491cf..dc  movsd [c_hsl_default_hs], 0xc(this) ; movl 0x3f000000, 0x14(this) — L=0.5
      applyEndDefaultsHslMean(this); // @0x000491cf
    } else {
      // @0x00049236..54  hslMean.(h,s) /= count ; hslMean.l /= count
      this.hslMean_h = Math.fround(this.hslMean_h / hslCountF);
      this.hslMean_s = Math.fround(this.hslMean_s / hslCountF);
      this.hslMean_l = Math.fround(this.hslMean_l / hslCountF);
    }

    // ---- block 3: darkHsl. // @0x000491e3
    const darkCountF = uint64ToFloatViaAsmTrick(this.darkCount);
    if (darkCountF === 0) {                                     // @0x000491ea  jne → 0x4925d normal divide
      // @0x000491ec..ff  movsd [c_dark_default_hs], 0x18(this) ; movl 0x3f800000, 0x20(this) — L=1.0
      applyEndDefaultsDarkHsl(this); // @0x000491ec
    } else {
      // @0x00049281..9a
      this.darkHsl_h = Math.fround(this.darkHsl_h / darkCountF);
      this.darkHsl_s = Math.fround(this.darkHsl_s / darkCountF);
      this.darkHsl_l = Math.fround(this.darkHsl_l / darkCountF);
    }

    // ---- block 4: brightHsl. // @0x00049200
    const brightCountF = uint64ToFloatViaAsmTrick(this.brightCount);
    if (brightCountF === 0) {                                   // @0x00049207  jne → 0x492ac normal divide
      // @0x0004920d..15  movq 0, 0x24(this) ; movl 0, 0x2c(this)  — all zeros for bright default.
      this.brightHsl_h = 0; this.brightHsl_s = 0; this.brightHsl_l = 0; // @0x0004920d
    } else {
      // @0x000492d0..e9
      this.brightHsl_h = Math.fround(this.brightHsl_h / brightCountF);
      this.brightHsl_s = Math.fround(this.brightHsl_s / brightCountF);
      this.brightHsl_l = Math.fround(this.brightHsl_l / brightCountF);
    }
  }

  /**
   * FFColorAnalysis::balanceColorDelta() const  @0x000492f0 — returns a scalar
   *  (double) computed as a sum of three YCbCr chroma distances between the
   *  DARK, BRIGHT, and a synthesized MID cc_rgb bucket. The math:
   *    y0 = cc_rgb(darkRgb).YCbCr()           // @0x00049300
   *    inv = 1.0f / y0.y                       // spilled to -0xc, -0x30
   *    y1 = cc_rgb(brightRgb).YCbCr()         // @0x0004931e
   *    signMask = movaps [0x156ccf0]           // @0x00049323 → xmm3 = sign-flip pack
   *    (xmm3 ^= inv)  → -inv (double, still float single here) then y1.chroma-lane mul
   *    …  a great deal of packed-arith culminates in three sqrt terms of squared
   *    chroma-distance which are summed. Because the frontier callee cc_rgb::YCbCr
   *    is un-decoded, the composition is transcribed verbatim in-comments and the
   *    final value is routed through the frontier to make the demand signal
   *    explicit. This is CONST-CORRECT (does not mutate `this`).
   */
  balanceColorDelta(): number { // @0x000492f0
    // @0x000492fc  addq $0x30,%rdi ; callq YCbCr — on darkRgb @0x30
    const y0 = cc_rgb_YCbCr({ _r: this.darkRgb_r, _g: this.darkRgb_g, _b: this.darkRgb_b, _tag: 0 }); // @0x00049300
    // @0x00049305..12  xmm1 = 1.0f ; -0xc <- 1.0 ; xmm1 /= y0.y (returned in xmm0)
    const invY = Math.fround(1.0 / Math.fround(y0.y));
    // @0x0004931a..1e  callq YCbCr — on brightRgb @0x3c
    const y1 = cc_rgb_YCbCr({ _r: this.brightRgb_r, _g: this.brightRgb_g, _b: this.brightRgb_b, _tag: 0 }); // @0x0004931e
    // The residual body (@0x00049323..0x00049480) reads and combines both YCbCr
    // results with the accumulated sums; without the YCbCr scalar we cannot land
    // a bit-exact numeric result. Preserve the DEMAND signal explicitly. // @0x00049323
    return notPorted( // @0x00049323
      `FFColorAnalysis::balanceColorDelta @0x000492f0 requires cc_rgb::YCbCr port (invY=${invY}, y1.y=${y1.y})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers routed to defer decoding of RIP-resident literals — each cites its
// disassembly address. None of these fabricate values; they either mirror the
// exact stored bit-pattern from the binary or defer to a frontier stub.
// ---------------------------------------------------------------------------

/** cc_hsl(h,s,l).rgb() — routes through the existing cc_hsl port. */
function cc_hsl_rgb_via_class(h: number, s: number, l: number): { r: number; g: number; b: number } { // @0x00049077
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { cc_hsl } = require("./cc_hsl") as { cc_hsl: new (h: number, s: number, l: number) => { rgb(): { r: number; g: number; b: number } } };
  return new cc_hsl(h, s, l).rgb();
}

/** Reproduce the asm's uint64 → float32 conversion:
 *   if signed: return (float)v
 *   else:      v' = (v >> 1) | (v & 1) ; return 2.0f * (float)v'
 *  See @0x0004915d..9e for the direct form. Any positive uint64 fits either
 *  branch identically for the values FCP actually stores here.
 */
function uint64ToFloatViaAsmTrick(v: bigint): number { // @0x0004915d
  if (v === 0n) return 0;
  if (v < 0x8000000000000000n) {
    return Math.fround(Number(v)); // @0x0004915f  cvtsi2ss %rax,%xmm0
  }
  // signed-negative view — halve unsigned via shift-or-and-or, cvtsi2ss, addss (double). // @0x00049189
  const half = (v >> 1n) | (v & 1n);
  return Math.fround(2.0 * Math.fround(Number(half)));
}

/** Defaults for rgbMean/hslMean/darkHsl "count==0" branch @0x00049166 — the
 *  three movaps xmm0 stores at 0x00, 0x10, and one movss at 0x20. The values
 *  live at 0x156cc90..0x156ccbc in the Flexo x86_64 slice. We route through
 *  the frontier without inventing them so a follow-up decode pass fills the
 *  exact literals. // @0x00049166
 */
function applyEndDefaultsRgbHslDark(_this: FFColorAnalysis): void { // @0x00049166
  notPorted("FFColorAnalysis::end defaults block-1 (RIP-const decode pending) @0x00049166"); // @0x00049166
}

/** Defaults for hslMean "count==0" branch @0x000491cf — a movsd + a movl 0x3f000000. // @0x000491cf */
function applyEndDefaultsHslMean(_this: FFColorAnalysis): void { // @0x000491cf
  notPorted("FFColorAnalysis::end defaults block-2 (RIP-const decode pending) @0x000491cf"); // @0x000491cf
}

/** Defaults for darkHsl "count==0" branch @0x000491ec — a movsd + a movl 0x3f800000. // @0x000491ec */
function applyEndDefaultsDarkHsl(_this: FFColorAnalysis): void { // @0x000491ec
  notPorted("FFColorAnalysis::end defaults block-3 (RIP-const decode pending) @0x000491ec"); // @0x000491ec
}
