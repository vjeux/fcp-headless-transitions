// FFSonySLog2SGamutProcessingInfo.ts
//
// FCP Flexo ObjC class FFSonySLog2SGamutProcessingInfo (extends FFLogProcessingInfo).
// Holds the per-clip Sony S-Log2 / S-Gamut decode parameters (exposure gain +
// tungsten-vs-daylight matrix flag) and, at render time, programs an HGColorConform
// preset for the correct log-linearization + primaries chain.
//
// Source binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//                Versions/A/Flexo   (x86_64 slice mapped VA==offset at /tmp/Flexo.x86_64)
// Disasm saved:
//   raw-port/re/disasm/Flexo.FFSonySLog2SGamutProcessingInfo.init.s
//   raw-port/re/disasm/Flexo.FFSonySLog2SGamutProcessingInfo.setColorConformPreset.s
//
// Symbols (from nm -arch x86_64 Flexo):
//   -[FFSonySLog2SGamutProcessingInfo initWithExposureIndex:isoSensitivity:whiteBalance:]
//                                                                          @0x75c770
//   -[FFSonySLog2SGamutProcessingInfo setColorConformPresetAndParameters:
//        toConvertToColorSpace:forInputWithYCbCrMatrix:]                    @0x75c8a0
//
// STRUCT LAYOUT (from OBJC_IVAR_$_ offset globals in the binary):
//   +0x00  isa                                    (NSObject)
//   +0x08  _processingMode   uint32_t             (FFLogProcessingInfo parent ivar)
//   +0x0c  _parametersMD5    uint8_t[16]          (FFLogProcessingInfo parent ivar)
//   +0x1c  _exposureGain     float                (this class ivar)
//   +0x20  _useTungstenMatrix uint8_t (bool)      (this class ivar)
// Provenance: read the 8-byte u64 at each OBJC_IVAR_$_ symbol in /tmp/Flexo.x86_64:
//   _processingMode      @0x1c191a8 -> 0x08
//   _parametersMD5       @0x1c191b0 -> 0x0c
//   _exposureGain        @0x1c19218 -> 0x1c
//   _useTungstenMatrix   @0x1c19220 -> 0x20
//
// NUMERICS: _exposureGain is stored/consumed as SINGLE precision (movss). We enforce
// that with Math.fround at every write and load. The Euclidean gcd loop uses 32-bit
// unsigned integer divmod (divl on 32-bit regs); JS Number is safe for all inputs.

// ---- external stubs (not yet transcribed; loudly refuse to fake) --------------

/**
 * `_FFMD5WithBytes(ptr, len)` — Flexo C helper. Called at
 * `-[FFSonySLog2SGamutProcessingInfo init...]` @0x75c85a with
 *   %rdi = &stack{u32 xUnits, u32 yUnits, u32 tungsten} (12 bytes)
 *   %rsi = 12
 * Returns a 16-byte hash in the {rax, rdx} pair (Itanium-style small-struct return),
 * stored verbatim into `_parametersMD5` @+0xc..+0x1c.
 * @throws — @0x75c85a decode not yet transcribed; do not fabricate a hash.
 */
function FFMD5WithBytes(_bytes: Uint8Array): Uint8Array {
  throw new Error("FFMD5WithBytes @Flexo @0x75c85a not yet transcribed (called from FFSonySLog2SGamutProcessingInfo.init)");
}

/**
 * Enum for HGColorConform matrix-coefficients (`HGColorGamma::hgColorGammaMatrixCoefficients`).
 * We forward as raw u32 codes — the exact identity of each numeric code lives inside the
 * still-to-be-decoded HGColorGamma enum. Values used here appear as immediate constants
 * in the disasm: 3, 5, 6, 8 (and pass-throughs from the ycbcr argument).
 */
export type HgColorGammaMatrixCoefficients = number;
export type HgColorConformLogLinearization = number;
export type HgColorGammaLogGamut           = number;
export type HgColorGammaColorPrimaries     = number;
export type HgColorConformLogConversion    = number;

/**
 * `HGColorConform` — Helium color-conform preset object. Only the three entry points
 * called from this class are described here; the class body lives in Helium and is not
 * yet transcribed. The setters mutate `preset` in place.
 */
export interface HGColorConformPreset {
  /**
   * `HGColorConform::SetConversion(matrixCoefficients, logLinearization, logGamut, colorPrimaries)`
   * mangled: __ZN14HGColorConform13SetConversionEN12HGColorGamma30hgColorGammaMatrixCoefficientsENS_30hgColorConformLogLinearizationENS0_20hgColorGammaLogGamutENS0_26hgColorGammaColorPrimariesE
   * Called from @Flexo 0x75c8e1.
   */
  SetConversion4(
    matrixCoefficients: HgColorGammaMatrixCoefficients,
    logLinearization:   HgColorConformLogLinearization,
    logGamut:           HgColorGammaLogGamut,
    colorPrimaries:     HgColorGammaColorPrimaries,
  ): void;

  /**
   * `HGColorConform::SetConversion(matrixCoefficients, logConversion, colorPrimaries)`
   * mangled: __ZN14HGColorConform13SetConversionEN12HGColorGamma30hgColorGammaMatrixCoefficientsENS_27hgColorConformLogConversionENS0_26hgColorGammaColorPrimariesE
   * Called from @Flexo 0x75c8fc.
   */
  SetConversion3(
    matrixCoefficients: HgColorGammaMatrixCoefficients,
    logConversion:      HgColorConformLogConversion,
    colorPrimaries:     HgColorGammaColorPrimaries,
  ): void;

  /**
   * `HGColorConform::SetSonySGamutGainAndMatrix(float gain, bool useTungsten)`
   * mangled: __ZN14HGColorConform26SetSonySGamutGainAndMatrixEfb
   * Tail-called from @Flexo 0x75c93f.
   */
  SetSonySGamutGainAndMatrix(gain: number, useTungsten: boolean): void;
}

// ---- the class ---------------------------------------------------------------

/**
 * `FFSonySLog2SGamutProcessingInfo` — FCP Flexo ObjC class.
 * @Flexo class symbol _OBJC_CLASS_$_FFSonySLog2SGamutProcessingInfo @0x1c42d58
 */
export class FFSonySLog2SGamutProcessingInfo {
  // parent (FFLogProcessingInfo) ivars — modeled directly since parent isn't ported yet
  processingMode: number = 0;                     // +0x08, u32
  parametersMD5:  Uint8Array = new Uint8Array(16); // +0x0c..+0x1c, u8[16]
  // own ivars
  exposureGain:      number  = 0.0;               // +0x1c, f32
  useTungstenMatrix: boolean = false;             // +0x20, u8

  /**
   * `-[FFSonySLog2SGamutProcessingInfo initWithExposureIndex:isoSensitivity:whiteBalance:]`
   * @Flexo 0x75c770.
   *
   * Steps (from disasm):
   *  1. `[super init]` (@0x75c7af).  If nil, return (skip the setup).                 // @0x75c7b7
   *  2. If `exposureIndex == 0`  -> exposureIndex  = 1250 (0x4e2).                    // @0x75c7bd..c5
   *  3. If `isoSensitivity == 0` -> isoSensitivity = 1250 (0x4e2).                    // @0x75c7d0..d2
   *  4. `_processingMode = 33`  (immediate 0x21 written into +0x08).                  // @0x75c7df
   *  5. `_exposureGain = (float)((double)exposureIndex / (double)isoSensitivity)`.    // @0x75c7d5..f5
   *     Single-precision result (cvtsd2ss then movss into +0x1c).
   *  6. `_useTungstenMatrix = ( (uint32_t)(whiteBalance - 1) < 5000 )`                 // @0x75c7fa..0e
   *     i.e. true iff 1 <= whiteBalance <= 5000 (unsigned compare, so wb==0 is false).
   *  7. Compute `gcd = gcd(exposureIndex, isoSensitivity)` via 32-bit Euclidean loop.  // @0x75c817..2a
   *  8. Pack `{ exposureIndex/gcd (u32), isoSensitivity/gcd (u32), useTungsten (u32) }` on stack. // @0x75c82c..4e
   *  9. `md5 = FFMD5WithBytes(&pack, 12)`.                                             // @0x75c85a
   * 10. Write `md5` (16 bytes) into `_parametersMD5` @+0xc.                            // @0x75c86c..70
   * 11. return self.
   *
   * VERIFICATION (from disasm arithmetic, not oracle-checked): for the FCP default
   * `(exposureIndex=0, isoSensitivity=0, whiteBalance=3200)`, step 2/3 promote both to 1250,
   * so _exposureGain = 1250/1250 = 1.0 exactly, and 1 <= 3200 <= 5000 so
   * _useTungstenMatrix = true. Similarly `(0,0,5600)`: gain=1.0, useTungsten=false
   * (5600-1=5599 is NOT below 5000). Confirms both signed-input handling and the
   * unsigned-below test.
   */
  initWithExposureIndex_isoSensitivity_whiteBalance(
    exposureIndex: number,   // %edx -> %r15d
    isoSensitivity: number,  // %ecx -> %ebx
    whiteBalance: number,    // %r8d -> %r14d
  ): FFSonySLog2SGamutProcessingInfo {
    // Step 1: `[super init]` — modeled as "self is already allocated". Nothing to guard.
    // (In native the null-check @0x75c7b7 was for the super returning nil under OOM. In
    // TS the closest equivalent is: if the caller passes a fresh instance, proceed.)

    // Step 2/3: default zero inputs to 1250 (imm 0x4e2 at @0x75c7c0).
    // cmovel (cmov if zero from testl before it) matches `input == 0`.
    if (exposureIndex  === 0) exposureIndex  = 0x4e2; // 1250
    if (isoSensitivity === 0) isoSensitivity = 0x4e2; // 1250

    // Step 4: processingMode = 0x21 (33).                                              @0x75c7df
    this.processingMode = 0x21;

    // Step 5: exposureGain = (float)((double)exposureIndex / (double)isoSensitivity).  @0x75c7d5..f5
    // In native: cvtsi2sd/cvtsi2sd/divsd/cvtsd2ss/movss. IEEE-754 double divide then
    // rounded to float32. JS `/` on Number is double; Math.fround gives the movss step.
    this.exposureGain = Math.fround(exposureIndex / isoSensitivity);

    // Step 6: useTungstenMatrix = (uint32_t)(whiteBalance - 1) < 5000                  @0x75c7fa..0e
    // Native: decl r14d ; cmp r14d, 0x1387 ; setb ub. `setb` = unsigned-less-than.
    // We convert to a u32 explicitly (>>> 0) to match the unsigned compare (so
    // negative whiteBalance ends up above 5000 in unsigned space, i.e. false).
    const wbMinus1 = (whiteBalance - 1) >>> 0;
    this.useTungstenMatrix = wbMinus1 < 0x1387; // 5000

    // Step 7: gcd(exposureIndex, isoSensitivity) via 32-bit Euclidean loop.            @0x75c817..2a
    // Native: eax=r15d, edx=ebx ; loop: esi=edx ; edx=0 ; div esi (edx:eax /= esi) ;
    //         eax=esi ; if (edx != 0) goto loop.  Result: esi = gcd.
    // Precondition here: both operands are u32 and both >= 1 (steps 2/3 forced non-zero).
    let a = exposureIndex >>> 0;
    let b = isoSensitivity >>> 0;
    while (b !== 0) {
      const r = a % b;   // 32-bit unsigned mod (JS Number is safe: both < 2^32)
      a = b;
      b = r;
    }
    const gcd = a;

    // Step 8: build the 12-byte packed struct {u32 xU, u32 yU, u32 tungstenFlag}.      @0x75c82c..4e
    // Native also stores `useTungsten ? 1 : 0` into the 3rd u32 (from `setb dil` at
    // @0x75c835, produced BEFORE the div — but the flag itself is unchanged by the
    // gcd computation, so this is identical to reading `_useTungstenMatrix`).
    const xU  = (exposureIndex  / gcd) | 0; // divl at @0x75c83e
    const yU  = (isoSensitivity / gcd) | 0; // divl at @0x75c846
    const tf  = this.useTungstenMatrix ? 1 : 0;
    const pack = new Uint8Array(12);
    // little-endian u32 writes matching movl to -0x34/-0x30/-0x2c(%rbp)
    const dv = new DataView(pack.buffer);
    dv.setUint32(0, xU, true);
    dv.setUint32(4, yU, true);
    dv.setUint32(8, tf, true);

    // Step 9-10: md5 = FFMD5WithBytes(&pack, 12); parametersMD5 = md5[0..16].          @0x75c85a..70
    // Native returns the 16 bytes in a {rax, rdx} pair (see the movq %rcx,(%r12,%rsi)
    // then movq %rdx,0x8(%r12,%rsi) pair). We model it as a Uint8Array(16).
    this.parametersMD5 = FFMD5WithBytes(pack);

    // Step 11: return self.
    return this;
  }

  /**
   * `-[FFSonySLog2SGamutProcessingInfo setColorConformPresetAndParameters:
   *      toConvertToColorSpace:forInputWithYCbCrMatrix:]`
   * @Flexo 0x75c8a0.
   *
   * Args (arg-reg map after prologue):
   *   %rdi = self  (kept in %r14)
   *   %rsi = _cmd  (discarded; the register is later reused as the stale-copy of ycbcr)
   *   %rdx = preset (HGColorConform*)  (kept in %rbx)
   *   %ecx = colorSpace  (kept in %r15d)
   *   %r8d = ycbcr matrix code (moved into %esi at prologue @0x75c8ab so it can be
   *          passed as arg1 to the SetConversion callees below)
   *
   * Control flow (from disasm):
   *
   *  if (colorSpace == 0x81) {                                                         @0x75c8b7..bd
   *      // "Rec2020 HLG"-ish branch: use the 4-arg SetConversion overload.
   *      matrixCoeffs = 6 - useTungstenMatrix;                                         @0x75c8bf..d0
   *      //   cmpb 1, useTung ; sbb 6, 0    ->  useTung=1 -> CF=0, ecx=6
   *      //                                    useTung=0 -> CF=1, ecx=5
   *      preset->SetConversion4(
   *          matrixCoefficients = ycbcr    (from stale %esi = %r8d),                   @0x75c8ae
   *          logLinearization   = 8,       (imm at @0x75c8d6)
   *          logGamut           = matrixCoeffs (in %ecx, 5 or 6),
   *          colorPrimaries     = 3        (imm at @0x75c8db)
   *      );                                                                            @0x75c8e1
   *  } else {                                                                          @0x75c8e8..
   *      // "SDR"-ish branch: use the 3-arg SetConversion overload.
   *      matrixCoeffs = (colorSpace == 1) ? 3 : 0;                                     @0x75c8ea..f1
   *      //   xor eax,eax ; cmp r15d,1 ; sete al ; leal (rax,rax,2),ecx -> 3 or 0
   *      preset->SetConversion3(
   *          matrixCoefficients = ycbcr    (from stale %esi),                          @0x75c8ae
   *          logConversion      = 6,       (imm at @0x75c8f7)
   *          colorPrimaries     = matrixCoeffs  (in %ecx, 3 or 0)                      @0x75c8f1
   *      );                                                                            @0x75c8fc
   *  }
   *
   *  // gain + tungsten-matrix tail                                                    @0x75c901..3f
   *  useTung = (self->_useTungstenMatrix != 0);
   *  csNonZero = (colorSpace != 0);
   *  gain = csNonZero ? self->_exposureGain : 1.0f;   // 1.0f const @0x156ccd0
   *  preset->SetSonySGamutGainAndMatrix(gain, useTung && csNonZero);                   @0x75c93f (tail)
   */
  setColorConformPresetAndParameters_toConvertToColorSpace_forInputWithYCbCrMatrix(
    preset: HGColorConformPreset,
    colorSpace: number,   // enum, u32
    ycbcrMatrix: number,  // enum, u32
  ): void {
    if (colorSpace === 0x81) {
      // Tungsten-aware log-linearization branch.
      // useTung=1 -> logGamut=6; useTung=0 -> logGamut=5.  (cmpb+sbb identity, above.)
      const logGamut = this.useTungstenMatrix ? 6 : 5;
      preset.SetConversion4(
        ycbcrMatrix, // matrixCoefficients @0x75c8ae (via stale %esi)
        8,           // logLinearization   @0x75c8d6 imm
        logGamut,    // logGamut           @0x75c8cb..d0 (6 - useTung)
        3,           // colorPrimaries     @0x75c8db imm
      );
    } else {
      // Direct SDR-like log-conversion branch.
      const colorPrim = (colorSpace === 1) ? 3 : 0; // leal (rax,rax,2), rax=(cs==1)
      preset.SetConversion3(
        ycbcrMatrix, // matrixCoefficients @0x75c8ae
        6,           // logConversion      @0x75c8f7 imm
        colorPrim,   // colorPrimaries     @0x75c8f1
      );
    }

    // Tail: SetSonySGamutGainAndMatrix(gain, useTung && cs!=0).
    // Native uses a movss of a float32 1.0 from a rodata slot at @0x156ccd0 (verified:
    // that offset in /tmp/Flexo.x86_64 reads bytes 00 00 80 3f = f32(1.0)).
    const csNonZero = (colorSpace !== 0);
    const gain = csNonZero ? this.exposureGain : Math.fround(1.0);
    // andb %al, %cl at @0x75c92f: both are boolean bytes.
    const useTung = this.useTungstenMatrix && csNonZero;
    preset.SetSonySGamutGainAndMatrix(gain, useTung);
  }
}
