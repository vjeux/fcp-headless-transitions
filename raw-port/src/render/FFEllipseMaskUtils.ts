// FFEllipseMaskUtils — Flexo mask/shape helper class. Static utility methods
// used by the improved ellipse-mask node family. Three exported methods:
//   FFEllipseMaskUtils::superEllipse(...)                               @0x613dc0
//   FFEllipseMaskUtils::resetSuperEllipseShapeFolderCallback(...)       @0x613e90
//   FFEllipseMaskUtils::defaultShapeDimension(FFEffectStack*)           @0x613f80
//
// Framework: Flexo.framework
// Disassembly:
//   raw-port/re/disasm/Flexo.FFEllipseMaskUtils.superEllipse.s
//   raw-port/re/disasm/Flexo.FFEllipseMaskUtils.resetSuperEllipseShapeFolderCallback.s
//   raw-port/re/disasm/Flexo.FFEllipseMaskUtils.defaultShapeDimension.s

/**
 * FFEffectStack — opaque Flexo class handle (an ObjC receiver for the
 * imageSpaceBoundsAtTime: message). Modeled as an interface that only exposes
 * the ObjC method observed at the call site @0x613fc2, so ports that DO decode
 * FFEffectStack in the future can satisfy this shape without churning us.
 * @frontier Flexo FFEffectStack (referenced by @0x613fa3/@0x613fc2)
 */
export interface FFEffectStack {
  /**
   * -[FFEffectStack imageSpaceBoundsAtTime:(CMTime)] -> CGRect (32 B: x,y,w,h,
   * each a double). Selector name resolved from Flexo __objc_selrefs @0x1bbb3f0
   * (raw chained-fixup rebase into __objc_methname @ file-offset 0x179a306 =
   * cstring "imageSpaceBoundsAtTime:"). Called via _objc_msgSend_stret stub
   * at @0x613fc2.
   */
  imageSpaceBoundsAtTime(t: unknown /* CMTime */): {
    x: number; y: number; width: number; height: number;
  };
}

/**
 * OZChannelBase — opaque Ozone base class. The shape-folder callback iterates
 * its subobjects at fixed offsets and dispatches vtable slot 0x120/0x90.
 * @frontier Ozone OZChannelBase (referenced by @0x613e90 param type)
 */
export interface OZChannelBase {
  /**
   * Virtual slot 0x120 (== index 36 of an 8-byte-slot vtable). Every subobject
   * in the shape folder is dispatched to this slot with a nullptr argument.
   * Semantic (inferred from name "reset...callback"): "reset this channel to
   * default; second arg is a reset-target key". Concrete slot signature and
   * name are NOT decoded here — they live in OZChannelBase's vtable which is
   * not exported in Flexo (`vtable for OZChannelBase` absent from Flexo's
   * exported symbol table AND from Ozone's — both were checked). This is a
   * frontier: any future port that decodes OZChannelBase must name slot 0x120.
   */
  __vslot_0x120__(nullArg: null): void;

  /**
   * Virtual slot 0x90 on the ROOT channel (rbx itself; called via
   * `movq (%rbx),%rax ; movq 0x90(%rax),%rax ; jmpq *%rax`). Tail-called
   * with (rbx, 1, 1) as (this, i32 arg1, i32 arg2). Same frontier caveat as
   * above.
   */
  __vslot_0x90__(arg1: number, arg2: number): void;
}

/**
 * FFEllipseMaskUtils — Flexo static-utility class. No instances / no ctor /
 * no vtable observed in the decoded surface; both methods it exposes are
 * "static" (no `this` pointer used). Modeled as a TS class with `static`
 * methods to preserve the exported call surface.
 */
export class FFEllipseMaskUtils {
  /**
   * superEllipse(theta, aX, aY, n, &outX, &outY) — parametrization of a super-
   * ellipse in the plane. For a super-ellipse
   *   |x/aX|^n + |y/aY|^n = 1
   * this returns one point (x, y) on the curve as a function of theta:
   *   outX =  aX * |cos(theta)|^(2/n)  * sign(cos(theta))
   *   outY =  aY * |sin(theta)|^(2/n)  * sign(sin(theta))
   * The sign flipping is done in a per-quadrant switch keyed off theta
   * against pi/2, pi, and 3pi/2, exactly mirroring the asm's ucomisd chain.
   *
   * @Flexo 0x0000000000613dc0 (__ZN18FFEllipseMaskUtils12superEllipseEffffRfS0_)
   *
   * Constants used (verified by reading the x86_64 slice at fat-offset 0x4000):
   *   @0x156e940  f32  2.0                (arg1 of xmm1 pre-divss)
   *   @0x156cdb0  4xf32 0x7fffffff*4      (abs mask — ANDPS)
   *   @0x156fd00  f64  4.71238898038469   (3*pi/2, ucomisd cutoff)
   *   @0x156fcf0  f64  3.141592653589793  (pi,     ucomisd cutoff)
   *   @0x156fd08  f64  1.5707963267948966 (pi/2,   ucomisd cutoff)
   *   @0x156ccf0  4xf32 0x80000000*4      (negate mask — XORPS)
   *
   * Callees:
   *   ___sincosf_stret  @stub 0x14974ee  called @0x613df1  (float sin+cos pair)
   *   _powf             @stub 0x1497a46  called @0x613e0a and @0x613e29
   *
   * The out-args are float& (references); TS models them as an out-object.
   *
   * NOTE: the asm treats each of the six args as `float` (single precision) —
   * sincosf returns 2 packed floats, powf takes floats, and every store back
   * to *outX/*outY is a movss (32-bit). We use Math.fround where the port
   * would otherwise widen to double, to preserve bit-exactness with the C++
   * source's single-precision arithmetic.
   */
  static superEllipse(
    theta: number,   // xmm0 — arg1
    aX: number,      // xmm1 — arg2
    aY: number,      // xmm2 — arg3
    n: number,       // xmm3 — arg4  (super-ellipse exponent)
  ): { outX: number; outY: number } {
    // @0x613de0-@0x613dec  xmm1 = 2.0/n; store to [rbp-0x14] as "exponent"
    // divss is 32-bit; we replicate.
    const exponent = Math.fround(Math.fround(2.0) / Math.fround(n));

    // @0x613df1  callq ___sincosf_stret(theta)
    // Return: xmm0[0] = sinf(theta), xmm0[1] = cosf(theta)
    const t32 = Math.fround(theta);
    const sinT = Math.fround(Math.sin(t32));
    const cosT = Math.fround(Math.cos(t32));

    // @0x613dfa  movshdup xmm0 -> xmm0 lane0 = cos (from sincosf's lane1)
    // @0x613dfe  andps abs_mask -> lane0 = |cos|
    // @0x613e0a  callq _powf(|cos|, exponent)
    // @0x613e0f  mulss aX, xmm0
    // @0x613e14  movss xmm0, (r14)     — *outX = aX * |cos|^(2/n)
    let outX = Math.fround(
      Math.fround(Math.pow(Math.fround(Math.abs(cosT)), exponent)) *
      Math.fround(aX),
    );

    // @0x613e19  movaps [rbp-0x30], xmm0 — restore full {sin,cos} pack;
    //            lane0 = sinf(theta).
    // @0x613e1d  andps abs_mask -> lane0 = |sin|
    // @0x613e29  callq _powf(|sin|, exponent)
    // @0x613e2e  mulss aY, xmm0
    // @0x613e3c  movss xmm0, (rbx)     — *outY = aY * |sin|^(2/n)
    let outY = Math.fround(
      Math.fround(Math.pow(Math.fround(Math.abs(sinT)), exponent)) *
      Math.fround(aY),
    );

    // @0x613e33-@0x613e38  xmm1 = (double)theta ; the ucomisd compares below
    //                     are DOUBLE-precision against 3pi/2, pi, pi/2 in that
    //                     order. Reproduce the exact branch structure of the
    //                     asm's ja / jbe chain:
    //
    //   if (theta_d >  3pi/2) : Q4     -> negate outY
    //   else if (theta_d >  pi)      -> Q3 : negate outX AND negate outY
    //   else if (theta_d >  pi/2)    -> Q2 : negate outX
    //   else (theta_d <= pi/2)       -> Q1 : no negation
    //
    // The asm expresses this with rbx re-assignment tricks and a shared
    // "xorps neg-mask ; movss xmm0, (rbx)" tail. We spell the four cases out
    // for clarity — the observable result is identical.
    const theta_d = theta;  // cvtss2sd — but we already have the JS double form
    const PI_OVER_2 = 1.5707963267948966;   // @0x156fd08
    const PI        = 3.141592653589793;    // @0x156fcf0
    const THREE_PI_2 = 4.71238898038469;    // @0x156fd00

    // @0x613e40  ucomisd 3pi/2, xmm1   ; ja 0x613e71 (Q4 path — negate xmm0 to rbx=outY)
    if (theta_d > THREE_PI_2) {
      // @0x613e71  xorps neg_mask, xmm0 ; movss xmm0, (rbx=outY)
      outY = Math.fround(-outY);
    }
    // @0x613e4a  ucomisd pi, xmm1      ; jbe 0x613e5f (falls into pi/2 test)
    else if (theta_d > PI) {
      // Q3 path (pi < theta <= 3pi/2)
      // @0x613e54  xorb $-0x80, 0x3(%r14)   — flip sign of outX byte-wise
      // @0x613e59  movss (%rbx), xmm0        — reload outY into xmm0
      // @0x613e5d  jmp 0x613e71              — negate xmm0, store to rbx=outY
      outX = Math.fround(-outX);
      outY = Math.fround(-outY);
    } else {
      // theta_d <= pi
      // @0x613e5f  ucomisd pi/2, xmm1
      if (theta_d > PI_OVER_2) {
        // Q2 path (pi/2 < theta <= pi)
        // @0x613e69  movss (%r14), xmm0  — load outX into xmm0
        // @0x613e6e  movq %r14, %rbx     — rbx = &outX
        // @0x613e71  xorps neg_mask,xmm0 ; movss xmm0, (rbx=outX)
        outX = Math.fround(-outX);
      }
      // else Q1: theta_d <= pi/2 — @0x613e67 jbe 0x613e7c (epilogue) — no flip
    }

    return { outX, outY };
  }

  /**
   * resetSuperEllipseShapeFolderCallback(OZChannelBase* rdi_ignored, void* rsi)
   *
   * @Flexo 0x0000000000613e90 (__ZN18FFEllipseMaskUtils36resetSuperEllipseShapeFolderCallbackEP13OZChannelBasePv)
   *
   * Signature: the class prototype names arg1 OZChannelBase* and arg2 void*,
   * but the body ignores rdi entirely and operates on rsi (the "void*") as
   * an OZChannelBase* holding the super-ellipse SHAPE FOLDER root. This is
   * consistent with a typical OZ callback shape:
   *   `void (*)(OZChannelBase* self, void* context)` — but this callback
   *   uses the CONTEXT as the folder and ignores self.
   *
   * Body (@0x613e93 je 0x613f71) — early-return if rsi == null.
   * Otherwise: for each of 8 fixed byte-offsets into the folder, load the
   * sub-channel's vtable and dispatch slot 0x120 with a nullptr 2nd arg:
   *
   *   offset  addr of leaq/movq                notes
   *   0x2fc0  @0x613e9f / @0x613ea6            (first, ordered by the asm)
   *   0x2f28  @0x613eb8 / @0x613ebf
   *   0x1050  @0x613ece / @0x613ed5
   *   0x33d0  @0x613ee4 / @0x613eeb
   *   0x2cf8  @0x613efa / @0x613f01
   *   0x2d90  @0x613f10 / @0x613f17
   *   0x4930  @0x613f26 / @0x613f2d
   *   0x5688  @0x613f43 / @0x613f4a
   *
   * After the 8 sub-channel resets, tail-call the FOLDER's own vtable slot
   * 0x90 with (folder, 1, 1):
   *   @0x613f52  movq (%rbx), %rax          ; load vtable
   *   @0x613f55  movq 0x90(%rax), %rax      ; slot 0x90
   *   @0x613f5c  movq %rbx, %rdi            ; rdi = folder
   *   @0x613f5f  movl $0x1, %esi            ; arg2 = 1
   *   @0x613f64  movl $0x1, %edx            ; arg3 = 1
   *   @0x613f6f  jmpq *%rax                  ; TAIL-call
   *
   * The exact meaning of vtable slot 0x120 / 0x90 is UNDECIDED here because
   * OZChannelBase's vtable is not decoded yet (no `vtable for OZChannelBase`
   * exported by either Flexo or Ozone). This port therefore models the
   * callees as opaque virtual methods on the OZChannelBase interface. Any
   * future port that pins these slots is free to specialize.
   */
  static resetSuperEllipseShapeFolderCallback(
    _selfIgnored: OZChannelBase | null,   // rdi — the asm does not read it
    folder: OZChannelBase | null,          // rsi
  ): void {
    // @0x613e90-@0x613e93  testq %rsi,%rsi ; je 0x613f71 (retq)
    if (folder === null) {
      return;
    }
    // The 8 sub-channels — order matches the asm literal-by-literal.
    // Each entry: (offset, "site @addr" for the leaq/movq pair)
    const SUBCHANNEL_OFFSETS: ReadonlyArray<readonly [number, string]> = [
      [0x2fc0, "@0x613e9f/@0x613ea6"],
      [0x2f28, "@0x613eb8/@0x613ebf"],
      [0x1050, "@0x613ece/@0x613ed5"],
      [0x33d0, "@0x613ee4/@0x613eeb"],
      [0x2cf8, "@0x613efa/@0x613f01"],
      [0x2d90, "@0x613f10/@0x613f17"],
      [0x4930, "@0x613f26/@0x613f2d"],
      [0x5688, "@0x613f43/@0x613f4a"],
    ];
    for (const [off, site] of SUBCHANNEL_OFFSETS) {
      // @<site>  leaq off(%rbx), %rdi ; movq off(%rbx), %rax
      // @+7      xorl %esi,%esi
      // @+10     callq *0x120(%rax)
      const sub = subchannelAt(folder, off, site);
      sub.__vslot_0x120__(null);
    }
    // @0x613f52-@0x613f6f  TAIL-CALL folder.vtable[0x90](folder, 1, 1)
    folder.__vslot_0x90__(1, 1);
  }

  /**
   * defaultShapeDimension(FFEffectStack* stack) -> float
   *
   * @Flexo 0x0000000000613f80 (__ZN18FFEllipseMaskUtils21defaultShapeDimensionEP13FFEffectStack)
   *
   * Body:
   *   @0x613f88-@0x613f9a  spill kCMTimeZero into a stack slot at [rbp-0x20]
   *                        (low 16 B via movups+movaps) and [rbp-0x10]
   *                        (upper 8 B, the .epoch qword).
   *   @0x613f9e-@0x613fa1  testq %rdi,%rdi ; je 0x613fda (zero-return path)
   *   @0x613fa6  movq 0x15a7443(%rip), %rdx    ; selref for "imageSpaceBoundsAtTime:"
   *                                             (resolved: chained-rebase to
   *                                              __objc_methname @0x179a306)
   *   @0x613fad-@0x613fba  copy the spilled kCMTimeZero onto (%rsp)..(%rsp+0x18)
   *                        (the stack-arg slot for the 24-byte CMTime by-value).
   *   @0x613fbe-@0x613fc2  leaq -0x40(%rbp), %rdi (struct-return ptr, 32 B)
   *                        callq _objc_msgSend_stret
   *                          -> `-[stack imageSpaceBoundsAtTime:kCMTimeZero]`
   *                          returns CGRect at [rbp-0x40..rbp-0x20]:
   *                            +0x00 origin.x   [rbp-0x40]
   *                            +0x08 origin.y   [rbp-0x38]
   *                            +0x10 size.width [rbp-0x30]
   *                            +0x18 size.height[rbp-0x28]
   *   @0x613fc7  movsd -0x28(%rbp), %xmm0     ; load size.height
   *   @0x613fcc  mulsd 0xf58b04(%rip), %xmm0  ; * 0.25 (const @0x156cad8 = 0.25 f64)
   *   @0x613fd9  retq
   *
   * Null-stack fast-path:
   *   @0x613fda  xorps %xmm0,%xmm0 ; ret 0.0
   *
   * Callees:
   *   _objc_msgSend_stret  @stub 0x1497986  called @0x613fc2
   */
  static defaultShapeDimension(stack: FFEffectStack | null): number {
    // @0x613f9e-@0x613fa1  test rdi
    if (stack === null) {
      // @0x613fda  xorps xmm0,xmm0 ; ret
      return 0.0;
    }
    // The asm spills kCMTimeZero into a stack slot to pass by-value. In TS
    // we just import the value directly. The receiver's imageSpaceBoundsAtTime:
    // is the frontier — we let the interface method stand in.
    const bounds = stack.imageSpaceBoundsAtTime(kCMTimeZero_forDispatch);
    // @0x613fc7  size.height  (offset 0x18 of the CGRect returned by stret)
    // @0x613fcc  * 0.25 (double)
    return bounds.height * 0.25;
  }
}

// kCMTimeZero — passed by value to imageSpaceBoundsAtTime:. Modeled as an
// opaque token here so the FFEffectStack interface can accept it without
// dragging in the CMTime module for a single message-send site. The value's
// meaning is: {value:0, timescale:1, flags:Valid, epoch:0}.
// @const CoreMedia CMTime.h (read at @0x613f88 via _kCMTimeZero(%rip))
const kCMTimeZero_forDispatch = Object.freeze({
  value: 0n, timescale: 1, flags: 1, epoch: 0n,
});

/**
 * Byte-offset subobject access on an OZChannelBase. In the raw asm this is
 * `leaq off(%rbx), %rdi` — a pointer-to-embedded-subobject. We can't reify
 * that in TS without a full OZChannelBase layout port. Kept as a throwing
 * stub whose message cites the call-site addr so the frontier stays visible.
 */
function subchannelAt(_folder: OZChannelBase, offset: number, site: string): OZChannelBase {
  throw new Error(
    "OZChannelBase subobject access at offset 0x" + offset.toString(16) +
    " (site " + site + ") requires an OZChannelBase field-layout port. " +
    "Called from FFEllipseMaskUtils::resetSuperEllipseShapeFolderCallback " +
    "@0x613e90 (Flexo). This is the DEMAND SIGNAL for OZChannelBase's " +
    "8-subchannel shape-folder layout — a future port must supply it."
  );
}
