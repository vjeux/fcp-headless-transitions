// cc_hsl.ts — FCP ProCore cc::cc_hsl: a color-conversion HSL triple with three
// conversion methods (to cc_rgb, to cc_YCbCr via rgb, and to cc_rtheta polar).
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/ProCore.cc_hsl.*.s.
//
// SYMBOLS:
//   __ZN6cc_hsl3rgbEv     @0x00096ca8  ; cc_hsl::rgb()     -> cc_rgb    in xmm0/xmm1
//   __ZN6cc_hsl5YCbCrEv   @0x00096e44  ; cc_hsl::YCbCr()   -> cc_YCbCr  in xmm0/xmm1
//   __ZN6cc_hsl6rthetaEv  @0x00096eba  ; cc_hsl::rtheta()  -> cc_rtheta in xmm0
//
// INSTANCE LAYOUT — recovered from field accesses:
//   +0x00  float h    (rgb @0x96cac, rtheta @0x96ebe)
//   +0x04  float s    (rgb @0x96d04/@0x96d2b/@0x96d05, rtheta @0x96ece)
//   +0x08  float l    (rgb @0x96cf2)

// --- Constants (all cited to their data-segment addresses) ---
// @0xe1f70 (single, 0x3f800000) = 1.0f — used @0x96cb0 (ucomiss vs h) + @0x96ce3 (addss).
const CC_F1_AT_0x000e1f70 = Math.fround(1.0);
// @0xe1f88 (single, 0x3f000000) = 0.5f — L threshold @0x96cf7.
const CC_F_HALF_AT_0x000e1f88 = Math.fround(0.5);
// @0x122530 (double) = 1.0 — @0x96d34 addsd into S.
const CC_D1_AT_0x00122530 = 1.0;
// @0xe2070 (double) = -0.0 — xor'd sign mask @0x96d53.
const CC_D_NEGZERO_AT_0x000e2070 = -0.0;
// @0xe2080 (double) = 2^-23 = 1.1920928955078125e-07 — near-zero threshold @0x96d5a.
const CC_D_2POWNEG23_AT_0x000e2080 = 1.1920928955078125e-07;
// @0x123908 (double) = 6.0 — 6-sector multiplier @0x96d78.
const CC_D6_AT_0x00123908 = 6.0;
// @0x122560 (double) = 2π — rtheta @0x96ec2.
const CC_D_TWOPI_AT_0x00122560 = 6.283185307179586;
// @0xe2060 (float4 sign mask) = { -0.0f, -0.0f, -0.0f, -0.0f } — xorps @0x96cd5.
void CC_D_NEGZERO_AT_0x000e2070; void CC_D6_AT_0x00123908;

// --- Un-ported peer types + calls ----------------------------------------
export interface cc_rgb {
  readonly _r: number; readonly _g: number; readonly _b: number;
  readonly _tag: number;
}
export interface cc_YCbCr {
  readonly _Y: number; readonly _Cb: number; readonly _Cr: number;
  readonly _tag: number;
}
export interface cc_rtheta {
  readonly _r: number; readonly _theta: number;
}
export interface cc_matrix { readonly _opaque: never; }

/** Un-ported: cc_rgb::operator*(cc_matrix const&) @__ZN6cc_rgbmlERK9cc_matrix,
 *  called from cc_hsl::YCbCr @0x00096e64. */
function cc_rgb_operator_mul(_lhs: cc_rgb, _rhs: cc_matrix): cc_rgb {
  throw new Error("cc_rgb::operator*(cc_matrix const&) not yet transcribed — used @0x00096e64");
}

/** Un-ported peer datum: cc::matrix::rgb_to_YCbCr709 (loaded @0x00096e5d via
 *  `leaq __ZN2cc6matrix15rgb_to_YCbCr709E(%rip),%rsi`). */
const CC_MATRIX_RGB_TO_YCBCR709: cc_matrix = { _opaque: undefined as unknown as never };

// --- The class -----------------------------------------------------------
export class cc_hsl {
  h: number;
  s: number;
  l: number;
  constructor(h: number, s: number, l: number) {
    this.h = Math.fround(h);
    this.s = Math.fround(s);
    this.l = Math.fround(l);
  }

  /**
   * cc_hsl::rgb()  @0x00096ca8
   *
   * PHASE A — normalize h into [0,1) and write back to this->h.
   *   xmm2 = this->h                                            @0x96cac movss (%rdi),%xmm2
   *   if (1.0f < xmm2):                                         @0x96cb0-cb7 ucomiss(@0xe1f70=1.0), jbe
   *     xmm0 = trunc(xmm2)                                      @0x96cb9-cbd cvttps2dq/cvtdq2ps
   *     xmm2 -= xmm0        ; fract                             @0x96cc0
   *     goto WRITE_BACK                                         @0x96cc4 jmp 0x96cee
   *   else if (!(0 < xmm2)):                                    @0x96cc6-ccc jbe 0x96cf2
   *     ; h<=0 branch
   *     xmm0 = xor(sign_mask@0xe2060, xmm2)  ; flips sign bits  @0x96cce-cd5
   *     xmm0 = trunc(xmm0)                                      @0x96cd8-cdc
   *     xmm0 += xmm2                                            @0x96cdf
   *     xmm0 += 1.0f                                            @0x96ce3
   *     xmm2 = xmm0                                             @0x96ceb
   *   WRITE_BACK: this->h = xmm2                                @0x96cee movss xmm2,(%rdi)
   *
   * PHASE B — compute the "high" chroma bound:
   *   xmm1 = this->l                                            @0x96cf2
   *   xmm0 = 0.5f                                               @0x96cf7
   *   if (0.5f < xmm1) {                                        @0x96cff-d02 ucomiss, jae takes L<=0.5
   *     xmm4 = this->s                                          @0x96d04
   *     xmm0 = L + S                                            @0x96d09-d0c
   *     xmm3 = L * S                                            @0x96d10-d13
   *     xmm0 -= xmm3          ; xmm0 = L + S - L*S              @0x96d17
   *     xmm3 = (double)xmm4   ; S_d = S                         @0x96d1b-d1e
   *     goto SIGN_CHECK                                         @0x96d22 jmp 0x96d4b
   *   } else {                ; L <= 0.5
   *     xmm0d = (double)L                                       @0x96d24-d27
   *     xmm4  = this->s                                         @0x96d2b
   *     xmm3d = (double)S                                       @0x96d30
   *     xmm5d = 1.0(@0x122530) + S_d                            @0x96d34-d3c
   *     xmm5d *= L_d           ; = L*(1+S)                      @0x96d40
   *     xmm0  = (float)xmm5d                                    @0x96d44-d47
   *   }
   *
   * PHASE C — sign flip and chroma dispatch:
   *   SIGN_CHECK:
   *     if (!(0 <= xmm4=S_original)) xmm3d = xor(-0.0(@0xe2070), xmm3d)   @0x96d4b-d53
   *     xmm4d = 2^-23 (@0xe2080)                                          @0x96d5a
   *     if (xmm4d >= xmm3d) {  ; near-zero chroma                          @0x96d62-d66 jbe 0x96d71
   *       xmm0 = movsldup(xmm1)  ; grayscale: R=G=B=L                     @0x96d68
   *       goto EXIT              (jmp 0x96e28)                            @0x96d6c
   *     }
   *     ; 6-sector lerp
   *     xmm3d = (double)xmm2 (=h)                                          @0x96d71-d74
   *     xmm3d *= 6.0 (@0x123908)                                           @0x96d78
   *     eax = (int)trunc(xmm3d)                                            @0x96d80 cvttsd2si
   *     xmm1d = (double)xmm1 (=L)                                          @0x96d84
   *     xmm1d += xmm1d           ; 2L                                       @0x96d88
   *     xmm4d = (double)xmm0 (=high)                                       @0x96d8c-d8f
   *     xmm1d -= xmm4d           ; low = 2L - high                          @0x96d93
   *     xmm1  = (float)xmm1d                                               @0x96d97
   *     xmm2d = (double)xmm1 (=low)                                        @0x96d9b-d9e
   *     xmm5  = xmm0 - xmm1      ; span = high - low                        @0x96da2-da5
   *     xmm5d = (double)xmm5                                               @0x96da9
   *     xmm6d = floor(xmm3d)     ; roundsd $9 = truncate to -inf, inexact   @0x96dad
   *     xmm3d -= xmm6d           ; fract(h*6)                                @0x96db3
   *     xmm3d *= xmm5d           ; fract * span                              @0x96db7
   *     xmm2d += xmm3d           ; low + fract*span   =: mid                 @0x96dbb
   *     xmm2  = (float)xmm2d                                                 @0x96dbf
   *     if (eax > 5)  goto FALLBACK @0x96de5                                @0x96dc3-dc6 ja
   *     xmm4d -= xmm3d           ; high - fract*span                          @0x96dc8
   *     xmm3  = (float)xmm4d     ; desc                                       @0x96dcc-dcf
   *     ; jump table @0x96e2c dispatches sector 0..5:
   *
   * PHASE C.5 — the sector jump table and its RGB packing swizzles are HIGHLY
   * intricate (each entry uses `insertps $0x10` to merge specific lanes of
   * different xmms into either xmm0 or xmm2, then a jmp to either @0x96e28
   * exit or @0x96e0c which does a xmm0<->xmm2 swap-then-exit).  The three
   * cc_rgb components are returned in xmm0 lanes 0/1 (R,G) and xmm1 lane 0 (B),
   * with lane semantics determined by which swizzle produced the final xmm0.
   * We DO NOT ship guessed lane orderings — that is precisely the "textbook
   * substitution" this port forbids (see PORTING_SPEC Rule 1 + Rule 3).  We
   * transcribe the sector-0 / fallback path (@0x96de5) fully, and throw for
   * sectors 1..5 pending a cc_rgb-layout-probing pass.
   *
   * PHASE D — return (xmm0/xmm1 → cc_rgb).
   */
  rgb(): cc_rgb {
    // --- PHASE A ---
    // @0x96cac
    let h = Math.fround(this.h);
    if (CC_F1_AT_0x000e1f70 < h) {
      // @0x96cb9-cbd: cvttps2dq truncates toward zero; cvtdq2ps casts back.
      const trunc = Math.fround((h | 0));
      // @0x96cc0
      h = Math.fround(h - trunc);
    } else {
      // @0x96cc6-ccc: ucomiss 0,%xmm2; jbe = if xmm2<=0 (or NaN), enter the fold-up branch.
      const goToPhaseB = h > 0; // strict: NaN falls into fold-up
      if (!goToPhaseB) {
        // @0x96cce-cd5: absH = xor(-0.0, h) — flips sign bit.  For h<=0, this = -h.
        const negH = Math.fround(-h);
        // @0x96cd8-cdc: trunc toward zero.
        const truncNegH = Math.fround((negH | 0));
        // @0x96cdf: xmm0 = truncNegH + h  (with h<=0, this = h + |trunc(h)|)
        //   For h in (-1,0], truncNegH = 0, so xmm0 = h.
        //   For h in [-2,-1), truncNegH = 1, so xmm0 = h + 1 which lies in [-1,0).
        //   Combined with the next `+= 1.0` this brings h into [0,1) modulo 1.
        let x = Math.fround(truncNegH + h);
        // @0x96ce3
        x = Math.fround(x + CC_F1_AT_0x000e1f70);
        // @0x96ceb
        h = x;
      }
    }
    // @0x96cee: this->h = h
    this.h = h;

    // --- PHASE B ---
    // @0x96cf2
    const L = Math.fround(this.l);
    // @0x96cff-d02: `jae` on `ucomiss xmm1,xmm0` (with xmm0=0.5) — jae taken if
    // 0.5 >= L (unordered / NaN also takes it).  Fall-through is L>0.5.
    let high_f: number;
    let S_asDouble: number;
    if (!(CC_F_HALF_AT_0x000e1f88 >= L)) {
      // L > 0.5 fall-through
      // @0x96d04
      const S = Math.fround(this.s);
      // @0x96d09-d17
      high_f = Math.fround(Math.fround(L + S) - Math.fround(L * S));
      // @0x96d1b-d1e
      S_asDouble = S;
    } else {
      // @0x96d24-d47
      const S = Math.fround(this.s);
      const L_d = L;
      const S_d = S;
      const t = (CC_D1_AT_0x00122530 + S_d) * L_d;
      high_f = Math.fround(t);
      S_asDouble = S_d;
    }

    // --- PHASE C ---
    const S_orig_f = Math.fround(this.s);
    let S_signed_d = S_asDouble;
    // @0x96d4b-d51: xorps xmm5,xmm5; ucomiss xmm4,xmm5; jbe 0x96d5a
    //   jbe = if xmm5(=0) <= xmm4(=S), i.e. S >= 0, skip xor.  Otherwise negate.
    if (!(S_orig_f >= 0)) {
      // @0x96d53: xor(-0.0(double), S_asDouble) flips its sign bit.
      S_signed_d = S_signed_d === 0 ? -0 : -S_signed_d;
    }

    // @0x96d5a-d66: `ucomisd xmm3,xmm4 (=2^-23)`; jbe 0x96d71 = if 2^-23<=S_signed_d
    // then NOT grayscale (fall to the sector code).  Else (grayscale).
    if (!(CC_D_2POWNEG23_AT_0x000e2080 <= S_signed_d)) {
      // @0x96d68: movsldup xmm1 replicates lane 0 of xmm1(=L).  The final cc_rgb
      // return has R=G=B=L.
      return this._packRGB(L, L, L);
    }

    // @0x96d71-d78: sector = trunc(h * 6.0) (as int).
    const h6 = Math.fround(h) * CC_D6_AT_0x00123908;
    // @0x96d80: cvttsd2si (double->int32, truncate toward zero).
    const sector = (h6 | 0);

    // @0x96d84-d93: low = 2L - high (all doubles).
    const low_d = (2 * L) - high_f;
    // @0x96d97: low = (float)low_d
    const low = Math.fround(low_d);
    // @0x96d9b-da9: span_d = (double)(float)(high - low)
    const span_d = Math.fround(high_f - low); // exact once cast to double
    // @0x96dad-db3: fract = h*6 - floor(h*6).
    const fract = h6 - Math.floor(h6);
    // @0x96db7-dbf: mid_d = low_d + fract*span_d ; mid = (float)mid_d
    const mid = Math.fround(low + fract * span_d);
    // @0x96dc8-dcf: desc_d = high_d - fract*span_d ; desc = (float)desc_d
    // (high is single-precision; cvtss2sd = exact).
    const desc = Math.fround(high_f - fract * span_d);

    // @0x96dc3-dc6: `cmpl $5,%eax; ja 0x96de5` — unsigned > 5 goes to fallback.
    if ((sector >>> 0) > 5) {
      // FALLBACK @0x96de5 (same target as sector-0 branch of the jump table):
      // `insertps $0x10, xmm2, xmm0` puts xmm2.lane0 into xmm0.lane1.  Since
      // xmm0 was `high` and xmm2 is `mid`, and xmm1 low was `low`, the outer
      // convention (R=xmm0.lane0, G=xmm0.lane1, B=xmm1.lane0) yields (high, mid, low).
      return this._packRGB(high_f, mid, low);
    }
    switch (sector) {
      case 0:
        // @0x96de5: (R=high, G=mid, B=low)
        return this._packRGB(high_f, mid, low);
      case 1:
        // @0x96ded → 0x96e0c: swizzle merges xmm2/xmm1 then swaps xmm0<->xmm2.
        // The exact (R,G,B) mapping depends on cc_rgb's lane<->component convention,
        // which is set inside cc_rgb's ctor (not in this file).  We do not fabricate.
        throw new Error("cc_hsl::rgb sector 1 swizzle @0x96ded not yet decoded — needs cc_rgb lane-map");
      case 2:
        throw new Error("cc_hsl::rgb sector 2 swizzle @0x96df5 not yet decoded — needs cc_rgb lane-map");
      case 3:
        throw new Error("cc_hsl::rgb sector 3 swizzle @0x96e03 not yet decoded — needs cc_rgb lane-map");
      case 4:
        throw new Error("cc_hsl::rgb sector 4 swizzle @0x96e14 not yet decoded — needs cc_rgb lane-map");
      case 5:
        throw new Error("cc_hsl::rgb sector 5 swizzle @0x96e1f not yet decoded — needs cc_rgb lane-map");
      default:
        return this._packRGB(high_f, mid, low);
    }
  }

  /** Pack three floats into cc_rgb.  The exact tag is set by cc_rgb ctors — not
   *  in this file.  We hold R/G/B; tag=0 is the "un-tagged" convention. */
  private _packRGB(r: number, g: number, b: number): cc_rgb {
    return {
      _r: Math.fround(r),
      _g: Math.fround(g),
      _b: Math.fround(b),
      _tag: 0,
    };
  }

  /**
   * cc_hsl::YCbCr()  @0x00096e44
   *
   * ASM:
   *   pushq %rbp / movq %rsp,%rbp / subq $0x10,%rsp
   *   callq cc_hsl::rgb()                                    @0x96e4c
   *   leaq  -0x10(%rbp),%rdi                                 @0x96e51
   *   movlps %xmm0,(%rdi)         ; stack[0..7] = R,G        @0x96e55
   *   movd   %xmm1, 0x8(%rdi)     ; stack[8..11] = B         @0x96e58
   *   leaq  cc::matrix::rgb_to_YCbCr709(%rip),%rsi           @0x96e5d
   *   callq cc_rgb::operator*(cc_matrix const&)              @0x96e64
   *   movd   %xmm1, %eax                                     @0x96e69
   *   btsq   $0x21, %rax          ; set bit 33 of the tag    @0x96e6d
   *   addq  $0x10,%rsp / popq %rbp / retq
   */
  YCbCr(): cc_YCbCr {
    // @0x96e4c
    const rgb = this.rgb();
    // @0x96e5d + e64: apply matrix multiply — un-ported.  Throws.
    const asRGBshape = cc_rgb_operator_mul(rgb, CC_MATRIX_RGB_TO_YCBCR709);
    // @0x96e6d: bts $0x21 sets bit 33 of the tag qword — the YCbCr tag marker.
    return {
      _Y: Math.fround(asRGBshape._r),
      _Cb: Math.fround(asRGBshape._g),
      _Cr: Math.fround(asRGBshape._b),
      _tag: (asRGBshape._tag | (1 << 1)) >>> 0,
    };
  }

  /**
   * cc_hsl::rtheta()  @0x00096eba
   *
   * ASM:
   *   pushq %rbp / movq %rsp,%rbp
   *   cvtss2sd (%rdi),%xmm0                                  @0x96ebe   ; (double)h
   *   mulsd 0x8b696(%rip),%xmm0                              @0x96ec2   ; *= 2π @0x122560
   *   cvtsd2ss %xmm0,%xmm1                                   @0x96eca
   *   movss 0x4(%rdi),%xmm0                                  @0x96ece   ; xmm0 = s
   *   insertps $0x10,%xmm1,%xmm0                             @0x96ed3   ; xmm0[lane1] = xmm1[lane0]
   *   popq %rbp / retq
   *
   * Return convention: cc_rtheta lane 0 = radius = s, lane 1 = θ = h·2π.
   */
  rtheta(): cc_rtheta {
    // @0x96ebe: (double)h
    const h_d = this.h;
    // @0x96ec2
    const theta_d = h_d * CC_D_TWOPI_AT_0x00122560;
    // @0x96eca
    const theta = Math.fround(theta_d);
    // @0x96ece
    const r = Math.fround(this.s);
    // @0x96ed3
    return { _r: r, _theta: theta };
  }
}
