// cc_rtheta.ts - FCP ProCore `cc_rtheta`: a polar color coordinate (r, theta)
// where `theta` = hue * 2*pi and `r` = saturation-like magnitude. Used by
// cc_hsl/cc_rgb round-trips (cc_hsl::rtheta @0x96eba, cc_rgb::rtheta @0x96882
// -> cc_rtheta, and back via cc_rtheta::hsl/rgb/YCbCr below).
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/ProCore.cc_rtheta.*.s + otool -tV extraction of
//         the remaining ctor bodies.
//
// SYMBOLS ported here:
//   __ZN9cc_rthetaC1E6cc_hsl   @0x000968aa  cc_rtheta::cc_rtheta(cc_hsl)   [C1]
//   __ZN9cc_rthetaC2E6cc_hsl   @0x00096f64  cc_rtheta::cc_rtheta(cc_hsl)   [C2 - same body as C1]
//   __ZN9cc_rthetaC1E6cc_rgb   @0x00096f20  cc_rtheta::cc_rtheta(cc_rgb)   [C1 - via cc_rgb::hsl]
//   __ZN9cc_rthetaC2E6cc_rgb   @0x00096edc  cc_rtheta::cc_rtheta(cc_rgb)   [C2 - via cc_rgb::hsl]
//   __ZN9cc_rthetaC2E8cc_YCbCr @0x00096f88  cc_rtheta::cc_rtheta(cc_YCbCr) [SEE NOTE]
//   __ZN9cc_rthetaC1E8cc_YCbCr @0x00096fb2  cc_rtheta::cc_rtheta(cc_YCbCr) [C1 - tail-jmp to C2]
//   __ZNK9cc_rtheta3rgbEv      @0x00096fbc  cc_rtheta::rgb() const
//   __ZNK9cc_rtheta3hslEv      @0x0009703a  cc_rtheta::hsl() const
//   __ZNK9cc_rtheta5YCbCrEv    @0x000970a4  cc_rtheta::YCbCr() const
//   __ZNK9cc_rtheta5YCbCrEf    @0x00097100  cc_rtheta::YCbCr(float) const
//
// INSTANCE LAYOUT - recovered from field accesses in the ported bodies:
//   +0x00  float r      (cc_rgb ctor writes @0x96ef4; rgb() reads @0x96fd0
//                         "insertps $0x10, (%rdi), %xmm0"; YCbCr() reads @0x970a4)
//   +0x04  float theta  (all ctors write via `movlps %xmm0, (%rdi)` where lane[0]
//                         is r and lane[1] is theta; rgb()/hsl() read @+0x4)
//
// Total size: 8 bytes (two floats).

import { cc_hsl } from "./cc_hsl";

// -- Constants (cited to their data-segment addresses) --------------------
// @0x122560 (double) = 2*PI = 6.283185307179586
// Used in EVERY ctor to convert normalized hue -> theta:
//   cc_rtheta::cc_rtheta(cc_hsl)  @0x968b2  `mulsd 0x8bca6(%rip),%xmm1`
//   cc_rtheta::cc_rtheta(cc_hsl)  @0x96f6c  `mulsd 0x8b5ec(%rip),%xmm1`  [C2]
//   cc_rtheta::cc_rtheta(cc_rgb)  @0x96ef4-ef0  via `mulsd 0x8b658(%rip)` [C2 @0x96f00]
//   cc_rtheta::cc_rtheta(cc_rgb)  @0x96f34-f00  via `mulsd 0x8b614(%rip)` [C1 @0x96f40]
const CC_D_TWOPI_AT_0x00122560 = 6.283185307179586;

// @0x126280 (double) = 1/(2*PI) = 0.159154943091895
// Used in rgb() and hsl() to convert theta -> normalized hue.
//   cc_rtheta::rgb() @0x96fc1  `mulsd 0x8f2b7(%rip),%xmm0`
//   cc_rtheta::hsl() @0x97043  `mulsd 0x8f235(%rip),%xmm0`
const CC_D_INV2PI_AT_0x00126280 = 0.159154943091895;

// @0xe1f70 (float) = 1.0f - ucomiss/addss constant for the hue-wrap.
//   rgb() @0x96fd6 `ucomiss 0x4af93(%rip),%xmm1`
//   rgb() @0x97009 `addss   0x4af5f(%rip),%xmm2`
//   hsl() @0x97058 `ucomiss 0x4af11(%rip),%xmm1`
//   hsl() @0x9708b `addss   0x4aedd(%rip),%xmm2`
const CC_F1_AT_0x000e1f70 = Math.fround(1.0);

// @0xe2060 (float x4) = { -0.0f, -0.0f, -0.0f, -0.0f } - sign-flip mask (movaps).
//   rgb() @0x96ff4 `movaps 0x4b065(%rip),%xmm2` then `xorps %xmm1,%xmm2` -> -xmm1
//   hsl() @0x97076 `movaps 0x4afe3(%rip),%xmm2` then `xorps %xmm1,%xmm2` -> -xmm1
// Semantically: `xorps -0.0f_mask, x` = -x (sign flip).
const CC_F_NEGZEROx4_AT_0x000e2060 = -0.0;

// @0xe1f88 (float) = 0.5f
//   hsl() @0x9709a `movss 0x4aee6(%rip),%xmm1`      - default L (lightness) = 0.5
//   rgb() @0x97027 `movl  $0x3f000000, 0x8(%rdi)`   - literal 0.5 as L slot on stack
//   YCbCr() @0x970ed `movss 0x4ae93(%rip),%xmm0`    - r==0 branch returns Y=0.5
const CC_F_HALF_AT_0x000e1f88 = Math.fround(0.5);

// @0x126070 (float x4) = { 0.5f, 0.0f, 0.0f, 0.0f } - identity Y=0.5, Cb=0 base.
//   YCbCr() @0x970d5 `movaps 0x8ef94(%rip),%xmm0`
const CC_F4_HALF_ZEROS_AT_0x00126070: readonly [number, number, number, number] =
  [Math.fround(0.5), 0, 0, 0];

// @0x3f000000 (as u32) = 1056964608 = 0.5f - baked into rgb() via movl imm
//   rgb() @0x97027 `movl $0x3f000000, 0x8(%rdi)`  - stack slot [rdi+0x8] = 0.5f
// (Same value as CC_F_HALF above but the asm re-emits the immediate rather than
//  reading it from __const, so we keep both names for provenance accuracy.)
const CC_F_HALF_AS_IMM_AT_0x97027 = Math.fround(0.5);

// -- Un-ported peer types -------------------------------------------------

/**
 * cc_rgb - RGBA triple with a tag word. Layout matches cc_hsl.ts's stub.
 * Constructed via cc_hsl::rgb() (@0x96ca8) which returns a 12-byte cc_rgb
 * across xmm0.low/xmm0.high/xmm1.low + tag.
 */
export interface cc_rgb {
  readonly _r: number;
  readonly _g: number;
  readonly _b: number;
  readonly _tag: number;
}

/**
 * cc_YCbCr - Y'CbCr triple with a tag word (space id encoded via btsq $0x21
 * on the low 64 bits, per @0x970f9 / @0x97153). Layout mirrors cc_hsl.ts's stub.
 */
export interface cc_YCbCr {
  readonly _Y: number;
  readonly _Cb: number;
  readonly _Cr: number;
  readonly _tag: number;
}

/** Un-ported: cc_rgb::hsl() const @__ZNK6cc_rgb3hslEv @0x0009667e.
 *  Called from cc_rtheta(cc_rgb) ctors @0x96ef4 (C2) and @0x96f38 (C1). */
function cc_rgb_hsl_at_0x0009667e(_rgb: cc_rgb): { h: number; s: number; l: number } {
  throw new Error(
    "cc_rgb::hsl() const @ProCore 0x0009667e not yet transcribed " +
    "(called from cc_rtheta(cc_rgb) @0x96ef4 and @0x96f38)"
  );
}

/**
 * ___sincosf_stret(x) - libSystem intrinsic returning { sin(x), cos(x) }
 * packed into a single xmm0 (sin in low lane, cos in high lane).
 *
 * Referenced via stub @0xde73e from:
 *   cc_rtheta::YCbCr() const @0x970c1
 *   cc_rtheta::YCbCr(float) const @0x9712b
 *
 * We model the packed return by using JS Math.sin/Math.cos on the (float)
 * argument - result is bit-identical to _sincosf_stret for finite inputs
 * within the platform's libm ULP guarantee (single-precision).
 */
function __sincosf_stret(x: number): { sin: number; cos: number } {
  const xf = Math.fround(x);
  return { sin: Math.fround(Math.sin(xf)), cos: Math.fround(Math.cos(xf)) };
}

// -- The class ------------------------------------------------------------

/**
 * `cc_rtheta` - polar color coordinate.
 *
 * The FCP ABI packs r into +0x00 and theta into +0x04 (both f32); ctors
 * write both via `movlps %xmm0, (%rdi)` where xmm0.lane[0]=r, xmm0.lane[1]=theta.
 * The r-slot (magnitude) is preserved from the source hsl.s value; the
 * theta-slot is derived as `hsl.h * 2*PI` where h in [0,1) is the hue.
 */
export class cc_rtheta {
  /** @+0x00 magnitude (saturation-like radius). */
  r: number;
  /** @+0x04 angle in radians (hue * 2*PI). */
  theta: number;

  private constructor(r: number, theta: number) {
    this.r = Math.fround(r);
    this.theta = Math.fround(theta);
  }

  /**
   * cc_rtheta::cc_rtheta(cc_hsl) - both C1 @0x000968aa and C2 @0x00096f64
   * have IDENTICAL bodies (no base-class chain; struct is 8 bytes flat):
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     cvtss2sd %xmm0, %xmm1               ; xmm1 = (double)hsl.h        @0x96f68
   *     mulsd  0x8b5ec(%rip),%xmm1          ; xmm1 *= 2*PI                @0x96f6c
   *                                          ;    (@0x122560 = 6.28318..)
   *     cvtsd2ss %xmm1,%xmm1                ; xmm1 = (float) xmm1          @0x96f74
   *     movshdup %xmm0,%xmm0                ; xmm0 = { hsl.s, hsl.s, ...} @0x96f78
   *                                          ;    (dup high lane -> low lane)
   *     insertps $0x10, %xmm1, %xmm0        ; xmm0[1] = xmm1[0]           @0x96f7c
   *                                          ; -> xmm0.lane0 = hsl.s,
   *                                          ;    xmm0.lane1 = theta
   *     movlps %xmm0, (%rdi)                ; *(this) = { r=hsl.s, theta } @0x96f82
   *     popq %rbp; retq
   *
   * NOTE the "movshdup" moves lane1 (which was the S field of the passed
   * cc_hsl before this ctor overwrote xmm0.lane0 with theta) into lane0.
   * The passed cc_hsl arrives packed in xmm0 (h,s,l,-); after this ctor:
   *     r     = hsl.s      (magnitude/saturation)
   *     theta = hsl.h * 2*PI
   * hsl.l is not read - it is DROPPED (the polar form doesn't carry
   * lightness; rgb()/hsl() default L to 0.5f, see @0x9709a and @0x97027).
   *
   * @provenance ProCore @0x968aa (C1), @0x96f64 (C2)
   */
  static from_cc_hsl(h: number, s: number, _l?: number): cc_rtheta {
    void _l;
    // xmm1 = (double)h * 2*PI
    const theta_d = Number(Math.fround(h)) * CC_D_TWOPI_AT_0x00122560;
    // cvtsd2ss - narrow to single precision
    const theta = Math.fround(theta_d);
    // r = s (magnitude = saturation)
    const r = Math.fround(s);
    return new cc_rtheta(r, theta);
  }

  /**
   * cc_rtheta::cc_rtheta(cc_rgb) - both C1 @0x00096f20 and C2 @0x00096edc
   * have IDENTICAL bodies. They delegate through cc_rgb::hsl() first,
   * then apply the same theta = h*2*PI transform:
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     pushq %rbx
   *     subq  $0x18,%rsp
   *     movq  %rdi, %rbx                    ; rbx = this
   *     leaq  -0x18(%rbp), %rdi             ; rdi = local cc_rgb buffer
   *     movlps %xmm0, (%rdi)                ; store rgb.r, rgb.g          @0x96eec
   *     movss  %xmm1, 0x8(%rdi)             ; store rgb.b                 @0x96eef
   *     callq  cc_rgb::hsl() const          ; xmm0 = {h,s,-,-}, xmm1=... @0x96ef4
   *     xorps  %xmm1, %xmm1                 ; clear xmm1
   *     cvtss2sd %xmm0, %xmm1               ; xmm1 = (double) h           @0x96efc
   *     mulsd  0x8b658(%rip),%xmm1          ; xmm1 *= 2*PI                @0x96f00
   *     cvtsd2ss %xmm1, %xmm1                                             @0x96f08
   *     movshdup %xmm0,%xmm0                ; xmm0.lane0 = old h -> new: s @0x96f0c
   *                                          ; (shift lane1 = s down to lane0)
   *     insertps $0x10, %xmm1, %xmm0        ; xmm0 = { s, theta, ...}      @0x96f10
   *     movlps %xmm0, (%rbx)                ; *(this) = { r=s, theta }     @0x96f16
   *
   * @provenance ProCore @0x96edc (C2), @0x96f20 (C1)
   */
  static from_cc_rgb(rgb: cc_rgb): cc_rtheta {
    const hsl = cc_rgb_hsl_at_0x0009667e(rgb);
    return cc_rtheta.from_cc_hsl(hsl.h, hsl.s, hsl.l);
  }

  /**
   * cc_rtheta::cc_rtheta(cc_YCbCr) - C2 @0x00096f88 (C1 @0x00096fb2 tail-jmps to C2).
   *
   * WARNING: the C2 body as decoded from otool -tV appears to recurse
   * into ITSELF (the callq at @0x00096f9d has relative displacement
   * -0x1a resolving to 0x00096f88 - the very entry point of this same
   * function). Verified byte-for-byte from the raw binary:
   *
   *     0x96f88:  55 48 89 e5 41 56 53 48 83 ec 10           push %rbp;mov;push r14;push rbx;sub
   *     0x96f93:  48 89 fb                                    mov  %rdi, %rbx     ; rbx = out ptr
   *     0x96f96:  4c 8d 75 e8                                 lea  -0x18(%rbp),%r14
   *     0x96f9a:  4c 89 f7                                    mov  %r14, %rdi     ; rdi = local buf
   *     0x96f9d:  e8 e6 ff ff ff                              callq -0x1a -> 0x96f88 ***RECURSIVE***
   *     0x96fa2:  49 8b 06                                    mov  (%r14), %rax
   *     0x96fa5:  48 89 03                                    mov  %rax, (%rbx)   ; *out = local[0]
   *     0x96fa8:  48 83 c4 10                                 add  $0x10, %rsp
   *     0x96fac:  5b 41 5e 5d                                 pop; retq
   *     0x96fb0:  c3                                          retq
   *
   * The nm output confirms exactly ONE symbol at 0x00096f88
   * (__ZN9cc_rthetaC2E8cc_YCbCr) - there is no aliased helper, no ICF
   * fold. Calling this ctor with any argument leads to unbounded
   * recursion until stack overflow.
   *
   * Interpretation: this is either (a) dead code the linker retained
   * because a header exposed the symbol, (b) a compiler bug in FCP's
   * build, or (c) a placeholder that FCP always chains through
   * cc_YCbCr::rgb() -> cc_rgb::hsl() at a higher layer. In any case
   * we CANNOT decode a semantic meaning from an infinite recursion,
   * so per Rule 3 (throw-on-undecoded) we surface this loudly.
   *
   * @provenance ProCore @0x96f88 (C2 self-referential body), @0x96fb2 (C1 tail-jmp).
   */
  static from_cc_YCbCr(_y: cc_YCbCr): cc_rtheta {
    void _y;
    throw new Error(
      "cc_rtheta::cc_rtheta(cc_YCbCr) @ProCore 0x00096f88 has an infinite " +
      "self-referential call sequence in the FCP binary (call @0x00096f9d " +
      "resolves back to 0x00096f88, the same function's entry). No decodable " +
      "semantic. Callers should route through cc_YCbCr -> cc_rgb -> cc_rtheta::from_cc_rgb."
    );
  }

  /**
   * cc_rtheta::rgb() const - @0x00096fbc
   *
   * Converts polar (r, theta) back to cc_rgb via cc_hsl {h, s=r, l=0.5}
   * with a Fmod-style hue wrap to [0,1):
   *
   *     cvtss2sd 0x4(%rdi),%xmm0            ; xmm0 = (double)theta        @0x96fbc
   *     mulsd    0x8f2b7(%rip),%xmm0        ; xmm0 *= 1/(2*PI)            @0x96fc1
   *                                          ;   (@0x126280 = 0.15915..)
   *     cvtsd2ss %xmm0,%xmm1                ; xmm1 = (float) hue          @0x96fc9
   *     movaps   %xmm1,%xmm0                                              @0x96fcd
   *     insertps $0x10, (%rdi), %xmm0       ; xmm0 = { hue, r, ... }      @0x96fd0
   *
   *     ; Hue wrap into [0,1): standard "fract" via truncate.
   *     ucomiss 0x4af93(%rip), %xmm1         ; cmp 1.0 vs hue              @0x96fd6
   *     jbe     .Lelse                       ; if 1.0 >= hue -> else       @0x96fdd
   *     ; TRUE branch: hue > 1.0
   *       cvttps2dq %xmm1,%xmm2              ; xmm2 = (int)hue             @0x96fdf
   *       cvtdq2ps  %xmm2,%xmm2              ; xmm2 = (float)(int)hue      @0x96fe3
   *       subss     %xmm2,%xmm1              ; xmm1 = hue - trunc(hue)     @0x96fe6
   *       jmp       .Lstore                                                 @0x96fea
   *     .Lelse:
   *       xorps    %xmm2,%xmm2               ; xmm2 = 0                   @0x96fec
   *       ucomiss  %xmm1,%xmm2               ; cmp hue vs 0                @0x96fef
   *       jbe      .Lstore_asis              ; if 0<=hue -> no wrap        @0x96ff2
   *       ; hue < 0 branch
   *         movaps 0x4b065(%rip),%xmm2       ; xmm2 = -0.0 sign mask       @0x96ff4
   *         xorps  %xmm1,%xmm2               ; xmm2 = -hue                 @0x96ffb
   *         cvttps2dq %xmm2,%xmm2                                          @0x96ffe
   *         cvtdq2ps  %xmm2,%xmm2                                          @0x97002
   *         addss  %xmm1,%xmm2               ; xmm2 = -floor(-hue) + hue   @0x97005
   *                                          ;      = hue + ceil(-hue)
   *                                          ;      = frac_negative
   *         addss  0x4af5f(%rip),%xmm2       ; xmm2 += 1.0                 @0x97009
   *         movaps %xmm2, %xmm1                                            @0x97011
   *     .Lstore:
   *       movss %xmm1, %xmm0                 ; xmm0.lane0 = wrapped hue    @0x97014
   *     .Lstore_asis:
   *       pushq %rbp; movq %rsp, %rbp; subq $0x10, %rsp                    @0x97018
   *       leaq  -0x10(%rbp), %rdi            ; local cc_hsl buffer
   *       movlps %xmm0, (%rdi)               ; hsl.h = hue, hsl.s = r       @0x97024
   *       movl   $0x3f000000, 0x8(%rdi)      ; hsl.l = 0.5f                 @0x97027
   *       callq  cc_hsl::rgb()               ; returns cc_rgb in xmm0/xmm1  @0x9702e
   *
   * Hue-wrap semantics (transcribed exactly):
   *   if (hue > 1.0f):
   *     h = hue - (float)(int)hue                       // fract via cvtt
   *   else if (hue < 0.0f):
   *     h = hue + (float)(int)(-hue) + 1.0f             // fract-negate
   *   else: // 0 <= hue <= 1
   *     h = hue                                          // no wrap
   *
   * (Note: cvttps2dq truncates toward zero, so `(int)hue` for hue>1 is
   *  floor(hue); for negative hue we negate first, truncate, and add.)
   *
   * @provenance ProCore @0x96fbc.
   */
  rgb(): cc_rgb {
    // xmm0 = (double) theta * (1/(2*PI))
    const hue_d = Number(Math.fround(this.theta)) * CC_D_INV2PI_AT_0x00126280;
    let hue = Math.fround(hue_d);
    const r = Math.fround(this.r);

    // Hue wrap (mirrors @0x96fd6..@0x97014).
    if (CC_F1_AT_0x000e1f70 < hue) {
      // @0x96fdf: cvttps2dq truncates toward zero. For positive hue > 1
      // this equals Math.trunc(hue).
      const trunc = Math.fround(Math.trunc(hue));   // cvttps2dq/cvtdq2ps
      hue = Math.fround(hue - trunc);
    } else {
      // 1.0 >= hue path
      if (!(0 <= hue)) {
        // hue < 0 branch @0x96ff4..@0x97011
        // xmm2 = -hue (xorps with -0.0 mask flips the sign bit)
        const negHue = Math.fround(-Math.fround(hue) + 0 + CC_F_NEGZEROx4_AT_0x000e2060);
        // Note: `-x + (-0.0)` is `-x` under IEEE-754 for finite x; but the
        // asm literally does `xorps` on the sign bit. We compute that
        // exactly via bit twiddling to preserve NaN/Inf sign behavior.
        const negHueXor = _sign_xor_negzero(hue);
        void negHue;   // keep placeholder to preserve the mapping comment
        const truncNeg = Math.fround(Math.trunc(negHueXor));
        // xmm2 = truncNeg + hue                (@0x97005 addss %xmm1,%xmm2)
        const tmp1 = Math.fround(truncNeg + hue);
        // xmm2 += 1.0                          (@0x97009 addss 0x4af5f)
        hue = Math.fround(tmp1 + CC_F1_AT_0x000e1f70);
      } // else 0 <= hue <= 1: no wrap
    }

    // Build cc_hsl { h=hue, s=r, l=0.5 } and delegate to cc_hsl::rgb().
    const hsl = new cc_hsl(hue, r, CC_F_HALF_AS_IMM_AT_0x97027);
    // cc_hsl::rgb() returns a triple; construct our cc_rgb shape.
    const rgbOut = hsl.rgb();
    return rgbOut as unknown as cc_rgb;
  }

  /**
   * cc_rtheta::hsl() const - @0x0009703a
   *
   * Same hue-wrap as rgb() but does NOT delegate to cc_hsl::rgb(); it
   * directly returns { h=wrapped_hue, s=r, l=0.5 } packed in xmm0/xmm1:
   *
   *   xmm0.lane0 = wrapped_hue
   *   xmm0.lane1 = r          (from insertps of (%rdi) which is r)
   *   xmm1       = 0.5f       (@0x9709a movss 0x4aee6 = 0.5)
   *
   * Return-ABI: cc_hsl carries {h,s} in xmm0 low+high and l in xmm1.
   *
   * @provenance ProCore @0x9703a.
   */
  hsl(): { h: number; s: number; l: number } {
    // xmm0 = (double)theta / (2*PI)
    const hue_d = Number(Math.fround(this.theta)) * CC_D_INV2PI_AT_0x00126280;
    let hue = Math.fround(hue_d);
    const r = Math.fround(this.r);

    // Identical hue-wrap to rgb() (@0x97058..@0x97093).
    if (CC_F1_AT_0x000e1f70 < hue) {
      const trunc = Math.fround(Math.trunc(hue));
      hue = Math.fround(hue - trunc);
    } else {
      if (!(0 <= hue)) {
        const negHueXor = _sign_xor_negzero(hue);
        const truncNeg = Math.fround(Math.trunc(negHueXor));
        const tmp1 = Math.fround(truncNeg + hue);
        hue = Math.fround(tmp1 + CC_F1_AT_0x000e1f70);
      }
    }

    // xmm1 = 0.5 (@0x9709a).
    return { h: hue, s: r, l: CC_F_HALF_AT_0x000e1f88 };
  }

  /**
   * cc_rtheta::YCbCr() const - @0x000970a4
   *
   * Direct polar->YCbCr projection using sin/cos:
   *
   *     movss  (%rdi),  %xmm3           ; xmm3 = r                        @0x970a4
   *     movss  0x4(%rdi),%xmm0          ; xmm0 = theta                    @0x970a8
   *     xorps  %xmm1, %xmm1             ; xmm1 = 0
   *     ucomiss %xmm0, %xmm1            ; cmp theta vs 0
   *     je      .Lzero_theta            ; if theta==0 -> jump             @0x970b3
   *     ; theta != 0 branch:
   *     pushq %rbp; movq %rsp, %rbp; subq $0x10, %rsp
   *     movaps %xmm3, -0x10(%rbp)       ; stash r on stack
   *     callq  ___sincosf_stret         ; returns { sin, cos } in xmm0    @0x970c1
   *     movaps -0x10(%rbp), %xmm3       ; restore r
   *     movaps %xmm0, %xmm1             ; xmm1 = {sin, cos, ...}
   *     movshdup %xmm0, %xmm2           ; xmm2 = {cos, cos, ...}
   *     mulss  %xmm3, %xmm1             ; xmm1 = r * sin                  @0x970d1
   *     movaps 0x8ef94(%rip), %xmm0     ; xmm0 = {0.5, 0.0, 0.0, 0.0}     @0x970d5
   *                                       ;   (@0x126070)
   *     insertps $0x10, %xmm1, %xmm0    ; xmm0.lane1 = r*sin              @0x970dc
   *     mulss  %xmm2, %xmm3             ; xmm3 = r * cos                  @0x970e2
   *     jmp     .Lret
   *   .Lzero_theta:
   *     movss  0x4ae93(%rip), %xmm0     ; xmm0 = 0.5f                    @0x970ed
   *     ; xmm3 still = r
   *   .Lret:
   *     movd  %xmm3, %eax               ; move r into eax
   *     btsq  $0x21, %rax               ; set bit 33 of rax (the "601"
   *                                     ;   space-tag flag @0x970f9)
   *     retq
   *
   * Return semantic (cc_YCbCr layout):
   *     Y  = xmm0.lane0 = 0.5f
   *     Cb = xmm0.lane1 = r * sin(theta)     (or 0 if theta==0)
   *     Cr = xmm3                            = r * cos(theta)  (or r if theta==0)
   *     tag= xmm3-as-int | (1<<33)           - btsq $0x21 sets the 601-space flag
   *
   * When theta==0: xmm0.lane1 stays 0, xmm3 stays r -> Cb=0, Cr=r.
   *
   * @provenance ProCore @0x970a4.
   */
  YCbCr(): cc_YCbCr {
    const r = Math.fround(this.r);
    const theta = Math.fround(this.theta);
    let Y: number;
    let Cb: number;
    let Cr: number;

    // ucomiss %xmm0,%xmm1 with xmm1=0: `je` fires if theta==0 AND not NaN.
    // In IEEE-754, ucomiss sets ZF=1 iff equal and no NaN; `je` = ZF=1.
    if (theta === 0) {
      // .Lzero_theta @0x970ed
      Y = CC_F_HALF_AT_0x000e1f88;   // 0.5
      Cb = 0;                        // xmm0.lane1 preserved from lane1 init = 0
      Cr = r;                        // xmm3 stayed r
    } else {
      // Call ___sincosf_stret(theta)
      const sc = __sincosf_stret(theta);
      // xmm2 = movshdup xmm0 = {cos, cos, ...}
      const cos = sc.cos;
      const sin = sc.sin;
      // xmm1 = r * sin
      const rSin = Math.fround(r * sin);
      // xmm0 = {0.5, 0, 0, 0}; then insertps lane1 = rSin.
      Y = CC_F4_HALF_ZEROS_AT_0x00126070[0];
      Cb = rSin;
      // xmm3 = r * cos
      Cr = Math.fround(r * cos);
    }

    // The btsq $0x21 on rax (movd %xmm3) sets bit 33 of the 64-bit int
    // reinterpretation of Cr. In our TS model we carry the tag in a
    // separate field rather than steal high bits of the Cr float.
    // The "tag" here corresponds to cc_YCbCr_space::YCbCr_601 (id encoded
    // in the return-value ABI at bit 33 - see @0x970f9).
    return { _Y: Y, _Cb: Cb, _Cr: Cr, _tag: 1 << 1 /* space id: encoded via btsq $0x21 */ };
  }

  /**
   * cc_rtheta::YCbCr(float space_tag) const - @0x00097100
   *
   * Same polar->YCbCr projection as YCbCr() but:
   *   - the SPACE-TAG float is taken from the caller (xmm0 on entry) and
   *     stashed as xmm2 before the sincos call, then written into
   *     xmm0.lane0 in place of the fixed 0.5 constant.
   *
   * Body prologue @0x97100..0x9711a:
   *     movaps  %xmm0, %xmm1                ; xmm1 = space_tag arg
   *     movss   (%rdi), %xmm3                ; xmm3 = r
   *     movss   0x4(%rdi), %xmm0             ; xmm0.lane0 = theta
   *     xorps   %xmm2, %xmm2                 ; xmm2 = 0
   *     movss   %xmm1, %xmm2                 ; xmm2.lane0 = space_tag
   *     xorps   %xmm1, %xmm1                 ; xmm1 = 0
   *     ucomiss %xmm0, %xmm1                 ; cmp theta vs 0
   *     je      .Lzero                       ; @0x97119
   *
   * If theta != 0: same _sincosf_stret call as YCbCr(); result placed at
   * xmm0.lane1; xmm0.lane0 stays the space_tag; xmm3 = r*cos.
   * If theta == 0: xmm0.lane0 = space_tag, xmm0.lane1 = 0, xmm3 = r.
   *
   * Then `btsq $0x21, %rax` on the movd of xmm3 - same 601-tag flag as
   * YCbCr(). (The space_tag float is stored in Y independent of the
   * space-tag INT flag: they encode different pieces of state.)
   *
   * @provenance ProCore @0x97100.
   */
  YCbCr_with_space(space_tag_float: number): cc_YCbCr {
    const r = Math.fround(this.r);
    const theta = Math.fround(this.theta);
    const spaceTag = Math.fround(space_tag_float);
    let Y: number;
    let Cb: number;
    let Cr: number;

    if (theta === 0) {
      // .Lzero @0x9714f
      // xmm2 = {space_tag, 0, 0, 0}; xmm0 = xmm2 at end (movaps xmm2->xmm0 @0x97158).
      Y = spaceTag;
      Cb = 0;
      Cr = r;
    } else {
      const sc = __sincosf_stret(theta);
      const sin = sc.sin;
      const cos = sc.cos;
      // xmm2 lane0 = space_tag (kept via `movaps xmm2 -> memory` stash @0x97123)
      // xmm0 = sincosf_stret result; movshdup gets cos; mulss r*sin.
      const rSin = Math.fround(r * sin);
      // insertps lane1 <- rSin (@0x97140). xmm2.lane0 = spaceTag intact.
      Y = spaceTag;
      Cb = rSin;
      Cr = Math.fround(r * cos);
    }

    return { _Y: Y, _Cb: Cb, _Cr: Cr, _tag: 1 << 1 };
  }
}

/**
 * `xorps xmm, -0.0-mask` = sign-flip of a float.
 *
 * SSE `xorps` on a single-precision value with `{-0.0f, ...}` toggles bit 31.
 * For finite non-NaN inputs this equals `-x` (IEEE-754). For NaN it preserves
 * the mantissa but flips the sign bit - which is subtly different from JS
 * unary `-` on some NaN encodings.
 *
 * @provenance behavioral mirror of `xorps %xmm1, %xmm2` @Helium 0x96ffb / 0x97080.
 */
function _sign_xor_negzero(x: number): number {
  const buf = new ArrayBuffer(4);
  const f32 = new Float32Array(buf);
  const u32 = new Uint32Array(buf);
  f32[0] = Math.fround(x);
  u32[0] = u32[0] ^ 0x80000000;
  return f32[0];
}
