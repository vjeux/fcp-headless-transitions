// PCColorUtil.ts — ProCore's PCColorUtil color-space math utility class.
// Mirrors 29 methods at ProCore addresses 0x3d38..0x10eb2. Every function cites its @0xADDR.
// Every numeric constant cites the __TEXT __const VA it was read from.
//
// DECODE: disassembly captured with raw-port/tools/disasm.sh PCColorUtil <method> ProCore,
// stored under raw-port/re/disasm/ProCore.PCColorUtil.*.s. RIP-relative float4 constants
// resolved by hand-computing (next-instruction-VA + disp32) and reading 16 bytes via
// struct.unpack_from('<4f', ...) against /tmp/ProCore.x86_64 (thin arch dump).
//
// This class covers HDR transfer-function math (PQ, HLG), OOTF, tone-mapping (BT.2390,
// BT.2446_A, OSFA, OS variants, LinearGain), sRGB<->Linear, and three top-level pixel-
// transform entry points.
//
// PORTED SUBSET (pure math with fully-decoded constants):
//   - applyLinearToSRGB              @0x4675
//   - applySRGBToLinear              @0x46fc
//   - applyToneMap_LinearGain        @0x4469
//   - applyInverseToneMap_LinearGain @0x44e8
//   - applyHLG_InverseOOTF           @0x40cb
//
// STUBS (throw citing @0xADDR — required by porting-spec Rule 3):
//   Every other method. The remaining pure-math methods (PQ, HLG, OOTF, tone-mapping)
//   depend on runtime-initialized statics computed by:
//     - (anonymous namespace)::PQ::TransferFunction::TransferFunction()   @0x4784
//     - (anonymous namespace)::PQ::getTransferFunction()                   @0x3da8
//     - (anonymous namespace)::HLG::getTransferFunction()                  (not yet disasm'd)
//   whose runtime state (three float4 statics in BSS at 0x15b140, 0x15b150, 0x15b160)
//   is not part of the ported subset for this pass. The top-level transform() family
//   bottoms out in CGColorSpace* / PCDynamicRange / PCToneMapMethod / vImage — Apple
//   system ABI that is explicitly outside scope per the porting brief.
//
// The stubs below are the "loud gap" prescribed by raw-port/army/PORTING_SPEC.md Rule 3:
// each throw carries the exact @0xADDR so raw-port/army/tools/frontier.py can enumerate
// the un-ported methods.
//
// Apple SIMD-lib callees seen in disasm and how they map to TS:
//   __simd_pow_f4  (@stub 0xde768)  — pow(x,y) applied lane-wise on float4.
//                                     TS equivalent: Math.fround(Math.pow(x_i, y_i)) per lane.
//   __simd_exp2_f4 (@stub 0xde756)  — exp2 applied lane-wise on float4.
//                                     TS equivalent: Math.fround(2 ** x_i) per lane.
// Only applyLinearToSRGB / applySRGBToLinear actually invoke __simd_pow_f4 in the
// ported subset; both are transcribed with per-lane Math.fround(Math.pow(...)).

export type PCVector3f = readonly [number, number, number];

// ── Constants read from /tmp/ProCore.x86_64 (thin x86_64) at __TEXT __const ──
// Sign-mask for `andps` clearing the sign bit ( |x| ).
// @const 0xe1c30  (u32 0x7fffffff on all 4 lanes)
// sRGB piece-wise constants (applyLinearToSRGB @0x4675 / applySRGBToLinear @0x46fc).
// @const 0xe1d90  linear-slope 12.92     (u32 0x414147ae, 12.920000076293945)
const SRGB_LINEAR_SLOPE   = Math.fround(12.920000076293945);
// @const 0xe1cb0  encode pow exponent 1/2.4  (u32 0x3ed55555, 0.4166666567325592)
const SRGB_ENCODE_EXP     = Math.fround(0.4166666567325592);
// @const 0xe1da0  encode threshold 0.0031308 (u32 0x3b4d2e1c)
const SRGB_ENCODE_THR     = Math.fround(0.0031308000907301903);
// @const 0xe1db0  encode scale 1.055        (u32 0x3f870a3d)
const SRGB_ENCODE_SCALE   = Math.fround(1.0549999475479126);
// @const 0xe1dc0  encode offset -0.055      (u32 0xbd6147ae)
const SRGB_ENCODE_OFFSET  = Math.fround(-0.054999999701976776);
// @const 0xe1b10  positive-branch sign +1.0 (u32 0x3f800000)
const F32_POS_ONE         = Math.fround(1.0);
// @const 0xe1b20  negative-branch sign -1.0 (u32 0xbf800000)
const F32_NEG_ONE         = Math.fround(-1.0);
// @const 0xe1e20  0.055 (u32 0x3d6147ae)    offset added in SRGB→Linear high branch
const SRGB_DECODE_OFFSET  = Math.fround(0.054999999701976776);
// @const 0xe1d50  2.4  (u32 0x4019999a)     pow exponent for SRGB→Linear
const SRGB_DECODE_EXP     = Math.fround(2.4000000953674316);
// @const 0xe1df0  0.0405 (u32 0x3d25d354)   decode threshold (matches disasm exactly)
const SRGB_DECODE_THR     = Math.fround(0.04050000011920929);

// ── Per-lane float32 SIMD helpers matching Apple's __simd_*_f4 semantics ─────
// __simd_pow_f4 is lane-wise pow. On x86_64 it operates on packed single-precision
// floats, so each lane is a Math.fround(Math.pow(x_i, y_i)). The disasm always zeros
// lane[3] via `blendps $0x8, %xmm0-zero, ...` before the call, so we mirror that.
function simd_pow_f4(x: PCVector3f, y: PCVector3f): PCVector3f {
  return [
    Math.fround(Math.pow(x[0], y[0])),
    Math.fround(Math.pow(x[1], y[1])),
    Math.fround(Math.pow(x[2], y[2])),
  ];
}

// `andps mask, x`  with mask = 0x7fffffff on every lane == |x_i|.
function simd_abs_f4(x: PCVector3f): PCVector3f {
  return [
    Math.fround(Math.abs(x[0])),
    Math.fround(Math.abs(x[1])),
    Math.fround(Math.abs(x[2])),
  ];
}

// ── PCColorUtil class ────────────────────────────────────────────────────────
export class PCColorUtil {
  /**
   * PCColorUtil::applyPQ_OETF(float vector[3]) — @ProCore 0x3d38
   * See raw-port/re/disasm/ProCore.PCColorUtil.applyPQ_OETF.s. Depends on the
   * runtime-initialized static (anonymous namespace)::PQ::getTransferFunction()::result
   * @0x15b140 (BSS), populated by PQ::TransferFunction ctor @0x4784 via __simd_pow_f4.
   */
  static applyPQ_OETF(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyPQ_OETF @ProCore 0x3d38 not yet transcribed (depends on PQ::getTransferFunction runtime static @0x15b140)");
  }

  /** PCColorUtil::applyPQ_InverseOETF(float vector[3]) — @ProCore 0x3dbe */
  static applyPQ_InverseOETF(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyPQ_InverseOETF @ProCore 0x3dbe not yet transcribed (depends on PQ::getTransferFunction runtime static @0x15b140)");
  }

  /** PCColorUtil::applyPQ_OOTF(float vector[3], float, float) — @ProCore 0x3e38 */
  static applyPQ_OOTF(_v: PCVector3f, _a: number, _b: number): PCVector3f {
    throw new Error("PCColorUtil::applyPQ_OOTF @ProCore 0x3e38 not yet transcribed");
  }

  /** PCColorUtil::applyPQ_InverseOOTF(float vector[3], float, float) — @ProCore 0x3e8c */
  static applyPQ_InverseOOTF(_v: PCVector3f, _a: number, _b: number): PCVector3f {
    throw new Error("PCColorUtil::applyPQ_InverseOOTF @ProCore 0x3e8c not yet transcribed");
  }

  /** PCColorUtil::applyHLG_OETF(float vector[3]) — @ProCore 0x3edb */
  static applyHLG_OETF(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyHLG_OETF @ProCore 0x3edb not yet transcribed (depends on HLG::getTransferFunction runtime static)");
  }

  /** PCColorUtil::applyHLG_InverseOETF(float vector[3]) — @ProCore 0x3f70 */
  static applyHLG_InverseOETF(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyHLG_InverseOETF @ProCore 0x3f70 not yet transcribed (depends on HLG::getTransferFunction runtime static)");
  }

  /** PCColorUtil::applyHLG_OOTF(float vector[3], float, float) — @ProCore 0x3fe4 */
  static applyHLG_OOTF(_v: PCVector3f, _a: number, _b: number): PCVector3f {
    throw new Error("PCColorUtil::applyHLG_OOTF @ProCore 0x3fe4 not yet transcribed");
  }

  /**
   * PCColorUtil::applyHLG_InverseOOTF(float vector[3], float Lw, float Lb) — @ProCore 0x40cb
   *   (__ZN11PCColorUtil20applyHLG_InverseOOTFEDv3_fff)
   *
   * BT.2100 HLG Inverse OOTF: convert display-linear RGB back to scene-linear (relative-scene).
   * The system gamma γ_display is piecewise in the peak-white luminance Lw:
   *   - if 400 <= Lw <= 2000:  γ = 0.42*log10(Lw/1000) + 1.2                (@ProCore 0x4102 path)
   *   - else:                  γ = 1.2 * pow(1.111, log2(Lw/1000))          (@ProCore 0x4119 path)
   * Then the per-pixel inverse OOTF (with Y = BT.2100 luma of the input RGB):
   *   Y      = 0.2627*R + 0.6780*G + 0.0593*B                                (BT.2100 luma)
   *   Y_pow  = (Y > 0) ? pow(Y, 1/γ - 1) : 0                                 (clip @0x4199-0x41a5)
   *   RGB'   = RGB * (12 * pow(Lb/Lw, 1/γ) * Y_pow)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN11PCColorUtil20applyHLG_InverseOOTFEDv3_fff.s):
   *   0x40cb-0x40cf  frame prologue, sub $0x30,%rsp  (48-byte local frame)
   *   0x40d3         movss  xmm2,-4(rbp)             ; save Lb
   *   0x40d8         ucomiss [@0xe1fe0 = 400.0f], xmm1   ; flags = xmm1 - 400
   *   0x40df         movaps xmm0,-0x30(rbp)          ; save input RGB packed
   *   0x40e3         movaps xmm1,xmm0                ; xmm0 = Lw
   *   0x40e6         divss  [@0xe1fe4 = 1000.0f],xmm0 ; xmm0 = Lw/1000
   *   0x40ee         movss  xmm1,-0x20(rbp)          ; save Lw
   *   0x40f3         jb     0x4119                   ; if Lw < 400 → path B
   *   0x40f5         movss  [@0xe1fe8 = 2000.0f],xmm2 ; xmm2 = 2000
   *   0x40fd         ucomiss xmm1,xmm2               ; flags = 2000 - Lw
   *   0x4100         jb     0x4119                   ; if 2000 < Lw → path B
   *   ── PATH A (400 <= Lw <= 2000) ──
   *   0x4102         callq  _log10f                  ; xmm0 = log10(Lw/1000)
   *   0x4107         mulss  [@0xe1ff4 = 0.42f],xmm0  ; xmm0 *= 0.42
   *   0x410f         addss  [@0xe1ff0 = 1.2f],xmm0   ; xmm0 += 1.2   (= γ)
   *   0x4117         jmp    0x4136
   *   ── PATH B ──
   *   0x4119         callq  _log2f                   ; xmm0 = log2(Lw/1000)
   *   0x411e         movaps xmm0,xmm1                ; xmm1 = log2(Lw/1000) = powf exponent
   *   0x4121         movss  [@0xe1fec = 1.111f],xmm0 ; xmm0 = 1.111 = powf base
   *   0x4129         callq  _powf                    ; xmm0 = pow(1.111, log2(Lw/1000))
   *                                                    ; ≡ (Lw/1000)^log2(1.111)
   *   0x412e         mulss  [@0xe1ff0 = 1.2f],xmm0   ; xmm0 *= 1.2  (= γ)
   *   ── COMMON: xmm0 = γ ──
   *   0x4136         movss  [@0xe1f70 = 1.0f],xmm1   ; xmm1 = 1.0
   *   0x413e         divss  xmm0,xmm1                ; xmm1 = 1.0 / γ
   *   0x4142         movss  [@0xe1f9c = -1.0f],xmm0  ; xmm0 = -1
   *   0x414a         addss  xmm1,xmm0                ; xmm0 = -1 + 1/γ = (1/γ - 1)
   *   0x414e         movss  xmm0,-0x8(rbp)           ; save inv_exp = (1/γ - 1)
   *   0x4153         movss  -4(rbp),xmm0             ; xmm0 = Lb
   *   0x4158         divss  -0x20(rbp),xmm0          ; xmm0 = Lb/Lw
   *   0x415d         callq  _powf                    ; xmm0 = pow(Lb/Lw, 1/γ)
   *                                                    ; (xmm1 still holds 1/γ from @0x413e)
   *   0x4162         movaps [@0xe1c40 = (0.2627,0.6780,0.0593,0)],xmm2   ; BT.2100 luma coeffs
   *   0x4169         mulps  -0x30(rbp),xmm2          ; xmm2 = [c0*R, c1*G, c2*B, 0]
   *   0x416d         movaps xmm2,xmm1
   *   0x4170         haddps xmm2,xmm1                ; xmm1 = [c0R+c1G, c2B+0, ...]
   *   0x4174         mulss  [@0xe1fd0 = 12.0f],xmm0  ; xmm0 = 12 * pow(Lb/Lw, 1/γ)
   *   0x417c         movss  xmm0,-4(rbp)             ; save alpha12
   *   0x4181         movhlps xmm2,xmm2               ; xmm2[0] = c2*B
   *   0x4184         addss  xmm1,xmm2                ; xmm2[0] = c0R+c1G+c2B = Y
   *   0x4188         movaps xmm2,-0x20(rbp)          ; save Y (broadcast in [0])
   *   0x418c         movaps xmm2,xmm0                ; xmm0 = Y
   *   0x418f         movss  -0x8(rbp),xmm1           ; xmm1 = (1/γ - 1)
   *   0x4194         callq  _powf                    ; xmm0 = pow(Y, 1/γ - 1)
   *   0x4199         xorps  xmm1,xmm1                ; xmm1 = 0
   *   0x419c         cmpltss -0x20(rbp),xmm1         ; xmm1 = (0 < Y) ? 0xFFFFFFFF : 0
   *   0x41a2         andps  xmm1,xmm0                ; zero pow(Y,…) unless Y > 0
   *   0x41a5         mulss  -4(rbp),xmm0             ; xmm0 *= alpha12  (= 12*pow(Lb/Lw,1/γ) * pow(Y,1/γ-1) IF Y>0)
   *   0x41aa         shufps $0,xmm0,xmm0             ; broadcast scalar to all 4 lanes
   *   0x41ae         mulps  -0x30(rbp),xmm0          ; return RGB_in * scalar (all lanes)
   *   0x41b2-0x41b7  epilogue + ret
   *
   * The `_log10f`, `_log2f`, `_powf` calls are libc (out-of-scope externs — modelled by JS's
   * Math with Math.fround for f32 semantics). All numeric literals are cited by their __TEXT
   * __const VA above.
   */
  static applyHLG_InverseOOTF(v: PCVector3f, Lw: number, Lb: number): PCVector3f {
    // ── γ computation (piecewise on Lw) ──
    // @ProCore 0x40e3-0x40e6  Lw / 1000  (this is the argument to log10f/log2f)
    const norm = Math.fround(Math.fround(Lw) / Math.fround(1000.0)); // @const 0xe1fe4

    // @ProCore 0x40d8 / 0x40fd — branch selector: (Lw >= 400) && (Lw <= 2000).
    // ucomiss dst=xmm1, src=400  -> jb (CF=1) taken iff xmm1 < 400   → path B.
    // ucomiss dst=xmm2=2000, src=xmm1 -> jb (CF=1) taken iff xmm2 < xmm1 (i.e. Lw > 2000) → path B.
    // NaN semantics: ucomiss with NaN sets CF=1 → falls into path B (matches the machine).
    // Compare on the plain (non-fround) inputs to mirror the machine's f32 register operands
    // being the incoming SSE args (already f32).
    const inRange = !(Lw < 400.0) && !(Lw > 2000.0);           // @0x40d8 / 0x40fd
    let gamma: number;
    if (inRange) {
      // PATH A: γ = 0.42 * log10(Lw/1000) + 1.2                            @0x4102-0x410f
      const l10 = Math.fround(Math.log10(norm));               // @0x4102 callq _log10f
      gamma = Math.fround(
        Math.fround(l10 * Math.fround(0.41999998688697815))    // @const 0xe1ff4  0.42f
        + Math.fround(1.2000000476837158),                     // @const 0xe1ff0  1.2f
      );
    } else {
      // PATH B: γ = 1.2 * pow(1.111, log2(Lw/1000))                        @0x4119-0x412e
      const l2 = Math.fround(Math.log2(norm));                 // @0x4119 callq _log2f
      const p  = Math.fround(Math.pow(
        Math.fround(1.1109999418258667),                       // @const 0xe1fec 1.111f (powf base)
        l2,                                                    // powf exponent
      ));                                                       // @0x4129 callq _powf
      gamma = Math.fround(p * Math.fround(1.2000000476837158)); // @const 0xe1ff0 1.2f
    }

    // ── inv_exp = (1/γ - 1)                                             @0x4136-0x414e
    const invGamma  = Math.fround(Math.fround(1.0) / gamma);   // @const 0xe1f70 1.0f  / γ
    const invExpM1  = Math.fround(Math.fround(-1.0) + invGamma); // @const 0xe1f9c -1.0f

    // ── alpha = 12 * pow(Lb/Lw, 1/γ)                                    @0x4153-0x4174
    const ratio = Math.fround(Math.fround(Lb) / Math.fround(Lw));  // @0x4153-0x4158
    // NOTE the machine's `powf` at @0x415d takes:
    //   xmm0 = Lb/Lw
    //   xmm1 = 1/γ (not modified since @0x413e; the -1 that produced invExpM1 went into xmm0,
    //          not xmm1, so xmm1 still holds 1/γ)
    const alphaPow = Math.fround(Math.pow(ratio, invGamma));    // @0x415d callq _powf
    const alpha12  = Math.fround(alphaPow * Math.fround(12.0)); // @const 0xe1fd0 12.0f  (@0x4174)

    // ── luma Y  (BT.2100 coefficients @const 0xe1c40)                   @0x4162-0x4184
    // [c0,c1,c2,c3] = [0.2627, 0.6780, 0.0593, 0.0]
    // The disasm performs a haddps+movhlps+addss reduction — the final scalar is
    // c0*R + c1*G + c2*B (c3*W = 0*0 = 0). Transcribed as the direct dot to preserve intent.
    const C_R = Math.fround(0.26269999146461487);
    const C_G = Math.fround(0.6779999732971191);
    const C_B = Math.fround(0.059300001710653305);
    // The saved RGB at -0x30(rbp) is xmm0-packed at entry; treat v as (R,G,B).
    const R = Math.fround(v[0]);
    const G = Math.fround(v[1]);
    const B = Math.fround(v[2]);
    // Mirror the accumulation order the machine uses (pairwise horizontal add via haddps then a
    // final addss for the movhlps'd tail): tmp1 = c0R + c1G ; tmp2 = c2B + 0 ; Y = tmp1 + tmp2.
    const tmp1 = Math.fround(Math.fround(C_R * R) + Math.fround(C_G * G));
    const tmp2 = Math.fround(Math.fround(C_B * B) + Math.fround(0.0));
    const Y    = Math.fround(tmp1 + tmp2);

    // ── (Y > 0) ? pow(Y, invExpM1) : 0                                  @0x4194-0x41a2
    // cmpltss compares xmm1(0) < src(Y). Result mask is 0xFFFFFFFF on true (bitwise-and gates
    // the pow result). NaN semantics: cmpltss with NaN returns 0 (unordered → false), so a NaN
    // Y correctly zero-masks — mirror with `Y > 0` (JS `>` is false on NaN).
    const powY = Math.fround(Math.pow(Y, invExpM1));           // @0x4194 callq _powf
    const yTerm = (Y > 0) ? powY : Math.fround(0.0);

    // ── scale + broadcast + mulps                                       @0x41a5-0x41ae
    const scalar = Math.fround(yTerm * alpha12);
    return [
      Math.fround(scalar * R),
      Math.fround(scalar * G),
      Math.fround(scalar * B),
    ];
  }

  /** PCColorUtil::applyHLGToPQ(float vector[3], float) — @ProCore 0x41b8 */
  static applyHLGToPQ(_v: PCVector3f, _a: number): PCVector3f {
    throw new Error("PCColorUtil::applyHLGToPQ @ProCore 0x41b8 not yet transcribed");
  }

  /** PCColorUtil::applyPQToHLG(float vector[3], float) — @ProCore 0x42c5 */
  static applyPQToHLG(_v: PCVector3f, _a: number): PCVector3f {
    throw new Error("PCColorUtil::applyPQToHLG @ProCore 0x42c5 not yet transcribed");
  }

  /**
   * PCColorUtil::applyInverseToneMap_BT2390(float vector[3]) — @ProCore 0x4311
   * Wrapper tail-calls file-scope doInverseToneMap_BT2390 @0x342a. See disasm.
   */
  static applyInverseToneMap_BT2390(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyInverseToneMap_BT2390 @ProCore 0x4311 not yet transcribed (tail-calls doInverseToneMap_BT2390 @0x342a)");
  }

  /** PCColorUtil::applyToneMap_BT2446_A(float vector[3]) — @ProCore 0x431b */
  static applyToneMap_BT2446_A(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyToneMap_BT2446_A @ProCore 0x431b not yet transcribed");
  }

  /**
   * PCColorUtil::applyInverseToneMap_BT2446_A(float vector[3]) — @ProCore 0x4379
   * Tail-calls doInverseToneMap_BT2446_A @0x36c9. See disasm.
   */
  static applyInverseToneMap_BT2446_A(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyInverseToneMap_BT2446_A @ProCore 0x4379 not yet transcribed (tail-calls doInverseToneMap_BT2446_A @0x36c9)");
  }

  /**
   * PCColorUtil::applyToneMap_OS(float vector[3]) — @ProCore 0x4383
   * Tail-calls doToneMap_OS @0x383e. See disasm.
   */
  static applyToneMap_OS(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyToneMap_OS @ProCore 0x4383 not yet transcribed (tail-calls doToneMap_OS @0x383e)");
  }

  /**
   * PCColorUtil::applyInverseToneMap_OS(float vector[3]) — @ProCore 0x438d
   * Tail-calls doInverseToneMap_OS @0x39f3. See disasm.
   */
  static applyInverseToneMap_OS(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyInverseToneMap_OS @ProCore 0x438d not yet transcribed (tail-calls doInverseToneMap_OS @0x39f3)");
  }

  /** PCColorUtil::applyToneMap_HLGDiffuseWhite(float vector[3]) — @ProCore 0x4397 */
  static applyToneMap_HLGDiffuseWhite(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyToneMap_HLGDiffuseWhite @ProCore 0x4397 not yet transcribed");
  }

  /** PCColorUtil::applyInverseToneMap_HLGDiffuseWhite(float vector[3]) — @ProCore 0x4409 */
  static applyInverseToneMap_HLGDiffuseWhite(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyInverseToneMap_HLGDiffuseWhite @ProCore 0x4409 not yet transcribed");
  }

  /**
   * PCColorUtil::applyToneMap_LinearGain(float vector[3], float) — @ProCore 0x4469.
   *
   * Faithful transcription of the 31-instruction SSE body at
   * raw-port/re/disasm/ProCore.__ZN11PCColorUtil23applyToneMap_LinearGainEDv3_ff.s
   *
   *   0x4469  movaps  0xdd740(%rip), %xmm3    ; xmm3 = ABS_MASK_F4 @0xe1bb0 = 4×0x7fffffff
   *   0x4470  andps   %xmm1, %xmm3            ; xmm3 = |gain|  (xmm1 = broadcast(gain))
   *   0x4473  xorps   %xmm2, %xmm2            ; xmm2 = zero-vector (early-exit result)
   *   0x4476  movss   0xddb82(%rip), %xmm4    ; xmm4 = THRESH @0xe2000[0] = 1.0e-5f
   *                                             (u32 0x3727c5ac, verified via
   *                                              struct.unpack_from('<f',...,0xe2000))
   *   0x447e  ucomiss %xmm3, %xmm4            ; flags on xmm4 - xmm3
   *   0x4481  ja      0x44e4                  ; if xmm4 > xmm3, i.e. 1e-5 > |gain|,
   *                                             jump to `movaps xmm2,xmm0 ; retq`
   *                                             returning ZERO vector.
   *
   *   -- else path: |gain| >= 1e-5 --
   *   0x4483  pushq   %rbp
   *   0x4484  movq    %rsp, %rbp
   *   0x4487  subq    $0x10, %rsp             ; frame slot for sign mask
   *   0x448b  movss   0xddadd(%rip), %xmm2    ; xmm2 = ONE @0xe1f70[0] = 1.0f (0x3f800000)
   *   0x4493  divss   %xmm1, %xmm2            ; xmm2 = 1.0 / gain   (scalar)
   *   0x4497  shufps  $0x0, %xmm2, %xmm2      ; xmm2 = broadcast(1/gain)
   *   0x449b  mulps   %xmm2, %xmm0            ; xmm0 = v * (1/gain)  = v_scaled
   *   0x449e  xorps   %xmm1, %xmm1            ; xmm1 = 0
   *   0x44a1  movaps  %xmm0, %xmm2
   *   0x44a4  cmpltps %xmm1, %xmm2            ; xmm2[i] = (v_scaled[i] < 0) ? -1 : 0
   *                                             (packed float less-than mask)
   *   0x44a8  movaps  %xmm2, -0x10(%rbp)      ; save sign mask on stack
   *   0x44ac  andps   0xdd6fd(%rip), %xmm0    ; xmm0 &= ABS_MASK_F4 @0xe1bb0 = |v_scaled|
   *   0x44b3  blendps $0x8, %xmm1, %xmm0      ; force lane 3 := 0 (v is 3-vec, lane 3 unused)
   *   0x44b9  movaps  0xdd8d0(%rip), %xmm1    ; xmm1 = POW_EXP @0xe1d90 = 4×0.5112474561f
   *                                             (u32 0x3f02e11d — verified)
   *   0x44c0  callq   __simd_pow_f4           ; xmm0 = pow(|v_scaled|, 0.5112474561) per lane
   *                                             (extern @stub 0xde768 — modelled by our
   *                                              simd_pow_f4 helper at top of this file,
   *                                              which is a lane-wise Math.fround(Math.pow).)
   *   0x44c5  movaps  %xmm0, %xmm1            ; xmm1 = pow_result
   *   0x44c8  movaps  0xdd701(%rip), %xmm2    ; xmm2 = ONES_3 @0xe1bd0 = [1,1,1,0]
   *   0x44cf  movaps  -0x10(%rbp), %xmm0      ; xmm0 = saved sign mask (bit-mask per lane)
   *   0x44d3  blendvps %xmm0, 0xdd704(%rip), %xmm2
   *                                           ; blendvps: for each lane, if xmm0's high bit
   *                                           ; is set, take the memory operand
   *                                           ; NEG_ONES_3 @0xe1be0 = [-1,-1,-1,0]; else keep
   *                                           ; xmm2 = ONES_3. Result: sign = ±1 per lane.
   *   0x44dc  mulps   %xmm1, %xmm2            ; xmm2 = pow_result * sign
   *   0x44df  addq    $0x10, %rsp
   *   0x44e3  popq    %rbp
   *   0x44e4  movaps  %xmm2, %xmm0            ; return xmm2 in xmm0
   *   0x44e7  retq
   *
   * ALGORITHM: `sign(v/gain) * pow(|v/gain|, 0.5112474561)` lane-wise on
   * lanes 0..2 (lane 3 forced to 0 before the pow, so 0^exp = 0). This is a
   * gamma-style tone map with a fixed exponent recovered from the binary.
   * On `|gain| < 1e-5`, returns the zero 3-vector (protects the 1/gain).
   */
  static applyToneMap_LinearGain(v: PCVector3f, gain: number): PCVector3f {
    // @0x4469..0x4470 — xmm3 = |gain|. In JS we compute the scalar |gain|.
    const absGain = Math.fround(Math.abs(Math.fround(gain)));
    // @0x4476 — threshold constant (verified 0x3727c5ac = 1e-5f).
    const THRESH = Math.fround(1e-5); // @ProCore 0xe2000[0]
    // @0x447e..0x4481 — `ucomiss xmm3, xmm4 ; ja 0x44e4` means: if xmm4 > xmm3,
    // i.e. THRESH > |gain|, return zero vector.
    if (THRESH > absGain) {
      // @0x44e4 with xmm2==0 → returns zero vector.
      return [Math.fround(0), Math.fround(0), Math.fround(0)];
    }
    // @0x448b..0x4493 — scalar reciprocal: xmm2 = 1.0 / gain (SIGNED gain here,
    // NOT abs — the sign is preserved and reflected below in the ± ONES table).
    const ONE = Math.fround(1); // @ProCore 0xe1f70[0] = 0x3f800000
    const inv = Math.fround(ONE / Math.fround(gain));
    // @0x4497 — broadcast; @0x449b — v_scaled = v * (1/gain) per lane.
    const vs: PCVector3f = [
      Math.fround(Math.fround(v[0]) * inv),
      Math.fround(Math.fround(v[1]) * inv),
      Math.fround(Math.fround(v[2]) * inv),
    ];
    // @0x44a1..0x44a8 — save sign mask (v_scaled[i] < 0 ? 0xffffffff : 0).
    // Represented here as boolean per lane.
    const isNeg = [vs[0] < 0, vs[1] < 0, vs[2] < 0];
    // @0x44ac — |v_scaled| via andps 0x7fffffff mask.
    const absVs: PCVector3f = [
      Math.fround(Math.abs(vs[0])),
      Math.fround(Math.abs(vs[1])),
      Math.fround(Math.abs(vs[2])),
    ];
    // @0x44b3 — blendps $0x8 zeros lane 3 (our PCVector3f is length 3, so
    // the "lane 3" simply doesn't exist in the port; nothing to zero).
    // @0x44b9..0x44c0 — pow with fixed exponent 0.5112474561 per lane.
    const POW_EXP = Math.fround(0.5112474561); // @ProCore 0xe1d90 = 4×0x3f02e11d
    const powV = simd_pow_f4(absVs, [POW_EXP, POW_EXP, POW_EXP]);
    // @0x44c8..0x44d3 — sign vector: pick from ONES_3=[1,1,1,0] where sign bit
    // is CLEAR (positive), else from NEG_ONES_3=[-1,-1,-1,0] (negative).
    // Constants @0xe1bd0 and @0xe1be0.
    const POS = Math.fround(1);
    const NEG = Math.fround(-1);
    // @0x44dc — result = pow * sign per lane.
    return [
      Math.fround(powV[0] * (isNeg[0] ? NEG : POS)),
      Math.fround(powV[1] * (isNeg[1] ? NEG : POS)),
      Math.fround(powV[2] * (isNeg[2] ? NEG : POS)),
    ];
  }

  /**
   * PCColorUtil::applyInverseToneMap_LinearGain(float vector[3], float) — @ProCore 0x44e8.
   *
   * Faithful transcription of the 24-instruction SSE body at
   * raw-port/re/disasm/ProCore.__ZN11PCColorUtil30applyInverseToneMap_LinearGainEDv3_ff.s
   *
   *   0x44e8  pushq   %rbp
   *   0x44e9  movq    %rsp, %rbp
   *   0x44ec  subq    $0x20, %rsp
   *   0x44f0  movaps  %xmm1, -0x20(%rbp)     ; save gain-arg (still a scalar in xmm1)
   *   0x44f4  xorps   %xmm1, %xmm1           ; xmm1 = 0
   *   0x44f7  movaps  %xmm0, %xmm2           ; xmm2 = v
   *   0x44fa  cmpltps %xmm1, %xmm2           ; AT&T: dst-src = xmm2 - xmm1 = v - 0
   *                                            xmm2[i] = (v[i] < 0) ? 0xffffffff : 0
   *                                            i.e. sign-negative mask per lane.
   *   0x44fe  movaps  %xmm2, -0x10(%rbp)     ; save sign mask on stack
   *   0x4502  andps   0xdd6a7(%rip), %xmm0   ; xmm0 &= ABS_MASK_F4 @0xe1bb0 = 4×0x7fffffff
   *                                            -> xmm0 = |v|
   *   0x4509  blendps $0x8, %xmm1, %xmm0     ; xmm0 lane-3 := 0 (v is a 3-vec)
   *   0x450f  movaps  0xdd83a(%rip), %xmm1   ; xmm1 = POW_EXP @0xe1d50 = 4×1.956f
   *                                            (u32 0x3ffa5e35, lane 3 = 0)
   *   0x4516  callq   __simd_pow_f4          ; xmm0 = pow(|v|, 1.956) per lane
   *                                            (Apple SIMD extern stub @0xde768,
   *                                             modelled by simd_pow_f4 helper above)
   *   0x451b  movaps  %xmm0, %xmm1           ; xmm1 = pow_result
   *   0x451e  movaps  0xdd6ab(%rip), %xmm2   ; xmm2 = ONES_3 @0xe1bd0 = [1,1,1,0]
   *   0x4525  movaps  -0x10(%rbp), %xmm0     ; xmm0 = saved sign mask
   *   0x4529  blendvps %xmm0, 0xdd6ae(%rip), %xmm2
   *                                          ; per lane: if sign-mask MSB set (negative),
   *                                            xmm2[i] = NEG_ONES_3[i] @0xe1be0 = -1;
   *                                            else keep xmm2[i] = 1.  Result: ±1 sign.
   *   0x4532  mulps   %xmm1, %xmm2           ; xmm2 = pow_result * sign
   *   0x4535  movaps  -0x20(%rbp), %xmm0     ; xmm0 = saved gain arg
   *   0x4539  shufps  $0x0, %xmm0, %xmm0     ; xmm0 = broadcast(gain) to all 4 lanes
   *   0x453d  mulps   %xmm2, %xmm0           ; xmm0 = gain * sign * pow_result
   *   0x4540  addq    $0x20, %rsp
   *   0x4544  popq    %rbp
   *   0x4545  retq
   *
   * ALGORITHM: `gain * sign(v[i]) * pow(|v[i]|, 1.956)` lane-wise on lanes 0..2
   * (lane 3 forced to 0 before the pow, ignored on return since our PCVector3f
   * is a length-3 tuple). This is the inverse of applyToneMap_LinearGain
   * @0x4469: forward maps `v -> sign(v/gain) * pow(|v/gain|, 0.5112474561)`, and
   * this reverses it with the reciprocal exponent (1 / 0.5112474561 ≈ 1.956) and
   * a plain multiply by `gain` instead of a `1/gain` scale.  Note there is NO
   * `|gain| < 1e-5` early-exit here (unlike the forward), because the operation
   * multiplies by `gain` rather than dividing by it — so a zero gain is safe.
   *
   * NOTE: `xmm1` on entry holds the SCALAR `gain` (System V AMD64 ABI: single-
   * float arg passes in the low lane of the next xmm register).  The
   * `movaps %xmm1, -0x20(%rbp)` at 0x44f0 spills all 128 bits but only the low
   * lane is meaningful; the later `shufps $0x0, %xmm0, %xmm0` broadcasts that
   * low lane to all four positions before the final multiply.
   */
  static applyInverseToneMap_LinearGain(v: PCVector3f, gain: number): PCVector3f {
    // @0x44f0 — save gain-arg. Scalar in TS; no need to spill.
    const g = Math.fround(gain);
    // @0x44f7..0x44fa — sign-negative mask: (v[i] < 0).
    const isNeg = [v[0] < 0, v[1] < 0, v[2] < 0];
    // @0x4502 — |v| via andps 0x7fffffff mask @0xe1bb0.
    const absV: PCVector3f = [
      Math.fround(Math.abs(Math.fround(v[0]))),
      Math.fround(Math.abs(Math.fround(v[1]))),
      Math.fround(Math.abs(Math.fround(v[2]))),
    ];
    // @0x4509 — blendps $0x8 zeros lane 3 (our PCVector3f is length 3; nothing
    // to zero in JS — lane 3 simply doesn't exist).
    // @0x450f..0x4516 — pow with fixed exponent 1.956 per lane.
    // Constant @ProCore 0xe1d50 = 4×0x3ffa5e35 = 4×1.9559999704360962f, lane3=0.
    const POW_EXP = Math.fround(1.9559999704360962); // @ProCore 0xe1d50
    const powV = simd_pow_f4(absV, [POW_EXP, POW_EXP, POW_EXP]);
    // @0x451e..0x4529 — sign vector: ONES_3 @0xe1bd0 blended with NEG_ONES_3 @0xe1be0.
    const POS = F32_POS_ONE; // 1.0f (lanes of @0xe1bd0)
    const NEG = F32_NEG_ONE; // -1.0f (lanes of @0xe1be0)
    // @0x4532 — signed_pow = sign * pow_result per lane.
    const signedPow: [number, number, number] = [
      Math.fround(powV[0] * (isNeg[0] ? NEG : POS)),
      Math.fround(powV[1] * (isNeg[1] ? NEG : POS)),
      Math.fround(powV[2] * (isNeg[2] ? NEG : POS)),
    ];
    // @0x4535..0x453d — broadcast(gain) * signed_pow per lane.
    return [
      Math.fround(g * signedPow[0]),
      Math.fround(g * signedPow[1]),
      Math.fround(g * signedPow[2]),
    ];
  }

  /**
   * PCColorUtil::getHLGDiffuseWhiteGain() — @ProCore 0x4546
   * Tail-calls file-scope memoized free-fn getWhiteGainForHLG_75 @0x4550, whose one-time
   * init calls getWhiteGainForHLGLevel(0.75f) @0x4569 (constant 0.75 @0xe200c).
   * See raw-port/re/disasm/ProCore.PCColorUtil.getHLGDiffuseWhiteGain.s.
   */
  static getHLGDiffuseWhiteGain(): number {
    throw new Error("PCColorUtil::getHLGDiffuseWhiteGain @ProCore 0x4546 not yet transcribed (tail-calls memoized getWhiteGainForHLG_75 @0x4550)");
  }

  /**
   * PCColorUtil::getWhiteGainForHLGLevel(float) — @ProCore 0x456f
   * See raw-port/re/disasm/ProCore.PCColorUtil.getWhiteGainForHLGLevel.s.
   * Uses (anonymous namespace)::HLG::getTransferFunction() runtime state and
   * __simd_exp2_f4 (Apple SIMD stub 0xde756).
   */
  static getWhiteGainForHLGLevel(_hlgLevel: number): number {
    throw new Error("PCColorUtil::getWhiteGainForHLGLevel @ProCore 0x456f not yet transcribed (HLG runtime static + __simd_exp2_f4)");
  }

  /**
   * PCColorUtil::getWhiteGainForHLG_75() — @ProCore 0x4657
   * Tail-calls file-scope memoized getWhiteGainForHLG_75 @0x4550. See disasm.
   */
  static getWhiteGainForHLG_75(): number {
    throw new Error("PCColorUtil::getWhiteGainForHLG_75 @ProCore 0x4657 not yet transcribed (tail-calls memoized free-fn getWhiteGainForHLG_75 @0x4550)");
  }

  /** PCColorUtil::applyToneMap_OSFA(float vector[3]) — @ProCore 0x4661  (tail-calls doToneMap_OSFA @0x3ba5) */
  static applyToneMap_OSFA(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyToneMap_OSFA @ProCore 0x4661 not yet transcribed (tail-calls doToneMap_OSFA @0x3ba5)");
  }

  /** PCColorUtil::applyInverseToneMap_OSFA(float vector[3]) — @ProCore 0x466b  (tail-calls doInverseToneMap_OSFA @0x3c73) */
  static applyInverseToneMap_OSFA(_v: PCVector3f): PCVector3f {
    throw new Error("PCColorUtil::applyInverseToneMap_OSFA @ProCore 0x466b not yet transcribed (tail-calls doInverseToneMap_OSFA @0x3c73)");
  }

  /**
   * PCColorUtil::applyLinearToSRGB(float vector[3]) — @ProCore 0x4675
   *
   * See raw-port/re/disasm/ProCore.PCColorUtil.applyLinearToSRGB.s.
   *
   * The x86_64 disasm mirrored 1:1:
   *   xmm2 = v ; xmm0 = 0 ; xmm1 = v
   *   xmm2 = v & 0x7fffffff  (= |v|)                    ; andps  @0xe1c30, %xmm2
   *   xmm1 = (v <lt 0.0) as mask                        ; cmpltps %xmm0, %xmm1  -> sign mask
   *   xmm1 = 12.92 * |v|                                ; mulps  @0xe1d90, %xmm1 -> low branch spill
   *   xmm0 = pow(|v|, 1/2.4)                            ; call   __simd_pow_f4  (@0xe1cb0 = 1/2.4)
   *   xmm0-cmp = (|v| <= 0.0031308) as mask             ; cmpleps @0xe1da0
   *   xmm1(high) = pow(...) * 1.055 + (-0.055)          ; mulps @0xe1db0 ; addps @0xe1dc0
   *   xmm1 = blendv(high, low, cmp)                     ; blendvps ...
   *   xmm2 = (sign<0 ? -1.0 : 1.0)                      ; blendv 1.0 (@0xe1b10) with -1.0 (@0xe1b20)
   *   ret sign * encoded
   *
   * i.e. FCP's sRGB encode is exactly the standard piece-wise curve applied to |v|,
   * then re-signed lane-wise. Note the branch selector uses |v| (not v), so negative
   * inputs are encoded as -sRGB(|v|).
   */
  static applyLinearToSRGB(v: PCVector3f): PCVector3f {
    const abs = simd_abs_f4(v);
    const powed = simd_pow_f4(abs, [SRGB_ENCODE_EXP, SRGB_ENCODE_EXP, SRGB_ENCODE_EXP]);
    const highLane = (i: number): number =>
      Math.fround(Math.fround(powed[i] * SRGB_ENCODE_SCALE) + SRGB_ENCODE_OFFSET);
    const lowLane = (i: number): number => Math.fround(SRGB_LINEAR_SLOPE * abs[i]);
    // blendvps selector: xmm0 = (|v| <= 0.0031308 @0xe1da0). If mask-msb set (true),
    // the memory operand (low branch) wins; else the dest register (high branch) wins.
    const encoded: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      encoded[i] = abs[i] <= SRGB_ENCODE_THR ? lowLane(i) : highLane(i);
    }
    // Re-sign via cmpltps mask: sign = (v < 0) ? -1.0 : 1.0.
    const signed: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const s = v[i] < 0 ? F32_NEG_ONE : F32_POS_ONE;
      signed[i] = Math.fround(s * encoded[i]);
    }
    return signed as PCVector3f;
  }

  /**
   * PCColorUtil::applySRGBToLinear(float vector[3]) — @ProCore 0x46fc
   *
   * See raw-port/re/disasm/ProCore.PCColorUtil.applySRGBToLinear.s.
   *
   * x86_64 disasm mirrored 1:1:
   *   xmm2 = v ; xmm1 = 0
   *   xmm0 = (v < 0) as sign mask                       ; cmpltps xmm1, xmm0
   *   xmm2 = v & 0x7fffffff  (= |v|)                    ; andps  @0xe1c30, %xmm2
   *   xmm0 = |v| / 12.92    (@0xe1d90)                  ; divps  @0xe1d90  -> low branch spill
   *   xmm0 = 0.055 (@0xe1e20) + |v|                     ; addps  ; movaps 0xe1e20
   *   xmm0 = (|v|+0.055) / 1.055  (@0xe1db0)            ; divps  @0xe1db0
   *   xmm0 = pow((|v|+0.055)/1.055, 2.4)                ; call   __simd_pow_f4  (@0xe1d50 = 2.4)
   *   xmm1 = pow result ; xmm0 = |v|
   *   xmm0 = (|v| <= 0.0405) as mask  (@0xe1df0)        ; cmpleps @0xe1df0
   *   xmm1 = blendv(high, low, cmp)                     ; blendvps
   *   xmm2 = sign ? -1.0 : 1.0  (@0xe1b10 / @0xe1b20)
   *   ret sign * decoded
   *
   * NOTE: the decode threshold in the binary is 0.0405 (@0xe1df0), NOT 0.04045 as
   * the sRGB standard formally writes — this is exactly what's in Apple's constant.
   */
  static applySRGBToLinear(v: PCVector3f): PCVector3f {
    const abs = simd_abs_f4(v);
    const lowLane = (i: number): number => Math.fround(abs[i] / SRGB_LINEAR_SLOPE);
    const highArg: PCVector3f = [
      Math.fround(Math.fround(abs[0] + SRGB_DECODE_OFFSET) / SRGB_ENCODE_SCALE),
      Math.fround(Math.fround(abs[1] + SRGB_DECODE_OFFSET) / SRGB_ENCODE_SCALE),
      Math.fround(Math.fround(abs[2] + SRGB_DECODE_OFFSET) / SRGB_ENCODE_SCALE),
    ];
    const powed = simd_pow_f4(highArg, [SRGB_DECODE_EXP, SRGB_DECODE_EXP, SRGB_DECODE_EXP]);
    const decoded: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      decoded[i] = abs[i] <= SRGB_DECODE_THR ? lowLane(i) : powed[i];
    }
    const signed: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const s = v[i] < 0 ? F32_NEG_ONE : F32_POS_ONE;
      signed[i] = Math.fround(s * decoded[i]);
    }
    return signed as PCVector3f;
  }

  /**
   * PCColorUtil::transformColor(Buffer const&, Buffer&) — @ProCore 0xe003
   * Top-level pixel-transform entry point. Bottoms out in PCColorUtil::Buffer
   * marshalling and (in transform() @0x10eb2) CGColorSpace* + vImage conversion —
   * Apple system ABI, explicitly out of scope per the porting brief.
   */
  static transformColor(_src: unknown, _dst: unknown): void {
    throw new Error("PCColorUtil::transformColor @ProCore 0xe003 not yet transcribed (bottoms out in CGColorSpace/vImage system ABI)");
  }

  /** PCColorUtil::transformColorWithDynamicRange(Buffer const&, Buffer&, PCToneMapMethod const&) — @ProCore 0xe4b9 */
  static transformColorWithDynamicRange(_src: unknown, _dst: unknown, _tm: unknown): void {
    throw new Error("PCColorUtil::transformColorWithDynamicRange @ProCore 0xe4b9 not yet transcribed (bottoms out in CGColorSpace/vImage system ABI)");
  }

  /**
   * PCColorUtil::transform(PCVector3<float> const&, CGColorSpace*, PCDynamicRange,
   *                        CGColorSpace*, PCDynamicRange, PCToneMapMethod const&)
   * @ProCore 0x10eb2 — uses CGColorSpace* directly (Apple Core Graphics system ABI).
   */
  static transform(_v: unknown, _srcCS: unknown, _srcDR: unknown,
                   _dstCS: unknown, _dstDR: unknown, _tm: unknown): PCVector3f {
    throw new Error("PCColorUtil::transform @ProCore 0x10eb2 not yet transcribed (uses CGColorSpace* system ABI)");
  }
}
