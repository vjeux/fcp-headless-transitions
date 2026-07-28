// raw-port/src/channels/FFColorBoardInterpolator.ts
//
// FCP `FFColorBoardInterpolator` — Flexo framework keyframe interpolator
// used by the Color Board effect. Subclass of `OZInterpolator` (base
// ctor/dtor callq'd through Flexo's __stubs to ProChannel).
//
// Source disassembly (Flexo.framework, x86_64 slice; VAs verbatim):
//   raw-port/re/disasm/Flexo.FFColorBoardInterpolator.FFColorBoardInterpolator.s
//   raw-port/re/disasm/Flexo.FFColorBoardInterpolator.~FFColorBoardInterpolator.s
//   raw-port/re/disasm/Flexo.FFColorBoardInterpolator.interpolate.s
//   raw-port/re/disasm/Flexo.FFColorBoardInterpolator.isActive.s
//   raw-port/re/disasm/Flexo.FFColorBoardInterpolator.subDivide.s
//   /tmp/Flexo_tV.txt for D1/D2 alias bodies (C2 is ICF-folded to C1 —
//   no separate label emitted; both are declared with identical bodies).
//
// Symbols ported (all cited @Flexo VA):
//   0x662e0  FFColorBoardInterpolator::FFColorBoardInterpolator()   [C2 base ctor — ICF-folded to C1]
//   0x66300  FFColorBoardInterpolator::FFColorBoardInterpolator()   [C1 complete ctor]
//   0x66320  FFColorBoardInterpolator::~FFColorBoardInterpolator()  [D2 base dtor, tail-jmp OZInterpolator::D2]
//   0x66330  FFColorBoardInterpolator::~FFColorBoardInterpolator()  [D1 complete dtor, identical to D2]
//   0x66340  FFColorBoardInterpolator::~FFColorBoardInterpolator()  [D0 deleting dtor]
//   0x66360  FFColorBoardInterpolator::interpolate(OZSpline&, CMTime const&, void*, void*, CMTime const&, bool, bool)
//   0x66460  FFColorBoardInterpolator::isActive(OZSpline&, void*)
//   0x66470  FFColorBoardInterpolator::subDivide(OZSpline&, CMTime const&, void*, void*, void*)
//
// Vtable @Flexo 0x18f1918; installed pointer 0x18f1928 (from ctor
// @0x6630e: leaq 0x188b613(%rip); resolve.py Flexo sym 0x18f1928 ->
// "vtable for FFColorBoardInterpolator (+0x10)"). Overriding slots:
//   *0x00 -> 0x66330  ~FFColorBoardInterpolator [D1]     (this class)
//   *0x08 -> 0x66340  ~FFColorBoardInterpolator [D0]     (this class)
//   *0x10 -> 0x66480  OZInterpolator::init                (inherited from base)
//   *0x18 -> 0x66360  FFColorBoardInterpolator::interpolate (this class)
//   *0x20 -> 0x66470  FFColorBoardInterpolator::subDivide   (this class)
//   *0x58 -> 0x66490  OZInterpolator::needInit             (inherited)
//   *0x60 -> 0x664a0  OZInterpolator::uForCurveValue       (inherited)
//   *0x68 -> 0x664b0  OZInterpolator::easeTime             (inherited)
//   *0x70 -> 0x66460  FFColorBoardInterpolator::isActive   (this class)
//
// FRONTIER CALLEES (declared as throwing stubs per PORTING_SPEC rule 3):
//   OZInterpolator::OZInterpolator() [C2 base ctor]
//                                     @Flexo callq stub 0x1496474 (C1 @0x66309)
//                                     resolve.py Flexo stub 0x1496474 -> __ZN14OZInterpolatorC2Ev
//   OZInterpolator::~OZInterpolator() [D2 base dtor]
//                                     @Flexo callq/jmp stub 0x149647a
//                                     resolve.py Flexo stub 0x149647a -> __ZN14OZInterpolatorD2Ev
//   ::operator delete(void*)          @Flexo jmp stub 0x1497404 (D0 @0x66357)
//                                     resolve.py Flexo stub 0x1497404 -> __ZdlPv
//   virtual *0x18 on the void* keyframe args of `interpolate` (@0x6640d,
//   @0x6641f) — `getValueV(&CMTime)`. The concrete vertex type isn't on
//   this slice; declared as an opaque handle with a getValueV method.
//
// -------------------------------------------------------------------------
// interpolate — decode of the arithmetic (from the disasm; instruction-
// level breakdown in-body). Args (SysV x86_64):
//   rdi = this
//   rsi = OZSpline&                              [not read by this body]
//   rdx = CMTime const& t                        [not read directly here]
//   rcx = void* vA                               [keyframe A object; has CMTime at +0x10]
//   r8  = void* vB                               [keyframe B object; has CMTime at +0x10]
//   r9  = CMTime const& u                        [the current query time]
//   stack: bool _fX, bool _fY                    [ignored]
//
// The body:
//   1) Copies 24 bytes of vA->CMTime (at vA+0x10) and vB->CMTime (at vB+0x10)
//      onto the stack, and the raw *r9 (24 bytes at r9+0x0) onto the stack.
//   2) Calls CMTimeGetSeconds three times, one on each of those copies:
//        tA_sec = CMTimeGetSeconds( *(CMTime*)(vA+0x10) )     [-0x38(%rbp)]
//        tB_sec = CMTimeGetSeconds( *(CMTime*)(vB+0x10) )     [-0x30(%rbp)]
//        t_sec  = CMTimeGetSeconds( *r9 )                     [-0x28(%rbp)]
//   3) Virtual dispatch (twice) — reads *rcx (vA->vtable) then callq
//      *0x18(%rax) with rdi=vA, rsi=&stack_copy_of_vA_CMTime. Returns a
//      double in xmm0. Same for vB. This is the standard vertex/keypoint
//      getValueV(CMTime) virtual, as documented on the OZDynamicVertex
//      vtable (*0x18 = getValueV) in resolve.py's example note.
//        valA = vA->getValueV(&vA.time)                       [-0x20(%rbp)]
//        valB = vB->getValueV(&vB.time)                       [xmm0]
//   4) Compute linear interpolation (all IEEE 754 double, no fround
//      because every op is *sd — scalar double, not single):
//        xmm0 = valB - valA                       (subsd -0x20 from xmm0)
//        xmm2 = t_sec - tA_sec                    (subsd tA from t_sec)
//        xmm0 *= xmm2                             ; (valB-valA)*(t-tA)
//        xmm2 = tB_sec - tA_sec                   (subsd tA from tB)
//        xmm0 /= xmm2                             ; ...(t-tA)/(tB-tA)
//        xmm0 += valA                             ; + valA
//      Returns xmm0.
//
// Note the DIFFERENCES vs OZLinearInterpolator (@ProChannel 0x44ec8):
//   - No easeTime() call; the raw query CMTime is used verbatim (the
//     vtable slot *0x68 of the base OZInterpolator is IDENTITY here
//     anyway per that class's port, so numerically it's identical if
//     unwrapped, but this class doesn't even do the wrap).
//   - No PC_CMTimeSaferSubtract; uses plain doubles-in-seconds diffs.
//   - No zero-denominator guard: if tB_sec == tA_sec, `divsd` returns
//     ±Inf or NaN (matches x86 IEEE 754 semantics — an out-of-band signal
//     to the caller). We mirror this exactly (no artificial early-out).
//   - Keyframes are dereferenced through a vtable getValueV, not a
//     stored scalar `.value` — the C++ type at rcx/r8 is `void*` and its
//     content is discovered by virtual dispatch only.
//
// isActive @0x66460:
//   mov $0x1, %al ; ret          — returns true unconditionally.
//
// subDivide @0x66470:
//   ret                          — empty body (returns void, no work).
// -------------------------------------------------------------------------

import { CMTime, CMTimeGetSeconds } from "../infra/CMTime.js";

/**
 * Opaque handle for `OZSpline&` — the spline arg reference is passed
 * through unread by any FFColorBoardInterpolator method (isActive
 * ignores it, subDivide is empty, interpolate never dereferences rsi).
 * Declared for API-shape fidelity only.
 */
export type OZSpline = object;

/**
 * `void*` keyframe/vertex argument type for FFColorBoardInterpolator's
 * `interpolate`. The C++ signature reads `void*`, but the body:
 *   - reads a 24-byte CMTime at offset +0x10, and
 *   - virtually dispatches through *(void**)vertex at vtable slot 0x18
 *     with signature `double (*getValueV)(this, CMTime const*)`.
 * The base OZDynamicVertex vtable places `getValueV` at *0x18 (see
 * resolve.py example note). The concrete vertex class isn't on this
 * slice; we model just those two accessible fields.
 */
export interface FFColorBoardKeyframeVertex {
  /** CMTime at offset +0x10 of the vertex struct — copied 24B in the asm. */
  time: CMTime;
  /**
   * `virtual double getValueV(CMTime const*)` @vtable slot *0x18.
   * Called with a pointer to a stack copy of `this.time` in the asm;
   * we pass the same value through here.
   */
  getValueV(t: CMTime): number;
}

/**
 * `OZInterpolator::OZInterpolator()` [C2 base ctor] — the primary base
 * class's ctor. Called from both this class's ctors via Flexo's __stubs
 * to ProChannel (stub 0x1496474 -> __ZN14OZInterpolatorC2Ev). Body not
 * on this slice.
 */
function OZInterpolator_C2_ctor(_self: FFColorBoardInterpolator): void {
  throw new Error(
    "FFColorBoardInterpolator: OZInterpolator::OZInterpolator() [C2] not " +
      "yet transcribed @Flexo callq stub 0x1496474 (call sites 0x66309/@C1, " +
      "and the ICF-folded C2 body @0x662e0)",
  );
}

/**
 * `OZInterpolator::~OZInterpolator()` [D2 base dtor] — chained by all
 * three of this class's dtors via Flexo's __stubs to ProChannel (stub
 * 0x149647a -> __ZN14OZInterpolatorD2Ev). Body not on this slice.
 */
function OZInterpolator_D2_dtor(_self: FFColorBoardInterpolator): void {
  throw new Error(
    "FFColorBoardInterpolator: OZInterpolator::~OZInterpolator() [D2] not " +
      "yet transcribed @Flexo tail-jmp stubs 0x149647a (D1@0x66335, D2@0x66325, D0 callq@0x66349)",
  );
}

/**
 * `::operator delete(void*)` — the global (Itanium ABI) operator delete
 * (Flexo's __stubs entry 0x1497404 -> __ZdlPv). Tail-jmp'd from D0
 * @0x66357.
 */
function operator_delete(_p: FFColorBoardInterpolator): void {
  throw new Error(
    "FFColorBoardInterpolator: ::operator delete(void*) not yet transcribed " +
      "@Flexo D0 tail-jmp stub 0x1497404 (@0x66357)",
  );
}

/**
 * `FFColorBoardInterpolator` — Color-Board effect keyframe interpolator.
 *
 * Behaviour summary (from the fully-decoded body of `interpolate`):
 *   Linear interpolation in the seconds-domain between the two provided
 *   keyframe vertices, using each vertex's own stored CMTime (at +0x10)
 *   as the segment endpoints and its virtual getValueV as the sample.
 *   No easing, no safer-subtract wrapping, no zero-denominator guard.
 */
export class FFColorBoardInterpolator {
  /**
   * Vtable pointer at struct offset +0x0 (single field written by
   * either ctor). Installed value = `0x18f1928` (Flexo.framework) — the
   * "vtable for FFColorBoardInterpolator (+0x10)" address.
   */
  vtable: number = 0x18f1928;

  /**
   * `FFColorBoardInterpolator::FFColorBoardInterpolator()` — both the
   * C2 base-object ctor @Flexo 0x662e0 (ICF-folded — no separate label
   * emitted by otool, but the mangled symbol __ZN24FFColorBoardInterpolatorC2Ev
   * exists in the nm map) and the C1 complete-object ctor @Flexo 0x66300
   * have byte-identical bodies:
   *
   *   push %rbp; mov %rsp,%rbp; push %rbx; push %rax
   *   mov %rdi,%rbx                                      ; save this
   *   callq <stub 0x1496474>                             ; OZInterpolator::C2(this)
   *   leaq  0x188b613(%rip),%rax                         ; %rax = 0x18f1928
   *   movq  %rax,(%rbx)                                  ; this->vtable = 0x18f1928
   *   add   $0x8,%rsp; pop %rbx; pop %rbp; retq
   */
  constructor() {
    // 0x66309: callq base ctor stub
    OZInterpolator_C2_ctor(this);
    // 0x6630e / 0x66315: install own-class vtable pointer
    this.vtable = 0x18f1928;
  }

  /**
   * `FFColorBoardInterpolator::~FFColorBoardInterpolator()` [D1 & D2]
   * @Flexo 0x66330 (D1) / 0x66320 (D2). Byte-identical bodies:
   *
   *   push %rbp; mov %rsp,%rbp; pop %rbp
   *   jmp <stub 0x149647a>                              ; tail-jmp OZInterpolator::D2
   */
  destroy_D1(): void {
    // 0x66335 (D1) / 0x66325 (D2): tail-jmp base D2 dtor stub
    OZInterpolator_D2_dtor(this);
  }

  /**
   * `FFColorBoardInterpolator::~FFColorBoardInterpolator()` [D0 —
   * deleting dtor] @Flexo 0x66340:
   *
   *   push %rbp; mov %rsp,%rbp; push %rbx; push %rax
   *   mov %rdi,%rbx                                      ; save this
   *   callq <stub 0x149647a>                             ; OZInterpolator::D2(this)
   *   mov %rbx,%rdi                                      ; restore this
   *   add $0x8,%rsp; pop %rbx; pop %rbp
   *   jmp <stub 0x1497404>                              ; ::operator delete(this)
   */
  destroy_D0(): void {
    // 0x66349: callq base D2 dtor stub
    OZInterpolator_D2_dtor(this);
    // 0x66357: tail-jmp ::operator delete stub
    operator_delete(this);
  }

  /**
   * `FFColorBoardInterpolator::interpolate(OZSpline& sp, CMTime const& t,
   *  void* vA, void* vB, CMTime const& u, bool _fX, bool _fY)` @Flexo 0x66360.
   *
   * NOTE: `t` (rdx) and `_fX`/`_fY` (stack) are unreferenced by the
   * decoded body — the query time actually used is `u` (r9). `sp` (rsi)
   * is likewise unreferenced. We keep them in the signature for ABI
   * fidelity to the C++ declaration but mark them unused.
   *
   * Instruction-level provenance (see re/disasm file):
   *   0x66370  mov  r9,r15                     ; r15 = &u
   *   0x66373  mov  r8,rbx                     ; rbx = vB
   *   0x66376  mov  rcx,r14                    ; r14 = vA
   *   0x66379..0x66385  copy 24B of *(vA+0x10) to -0x90(%rbp)  [vA.time]
   *   0x6638c..0x66399  copy 24B of *(vB+0x10) to -0x50(%rbp)  [vB.time]
   *   0x6639d..0x663ae  push arg copy of vA.time; callq CMTimeGetSeconds
   *   0x663b3  movsd xmm0 -> -0x38(%rbp)       ; tA_sec
   *   0x663b8..0x663c9  push arg copy of vB.time; callq CMTimeGetSeconds
   *   0x663ce  movsd xmm0 -> -0x30(%rbp)       ; tB_sec
   *   0x663d3..0x663f6  push arg copy of *r15 (u); callq CMTimeGetSeconds
   *   0x663fb  movsd xmm0 -> -0x28(%rbp)       ; t_sec
   *   0x66400  mov (%r14),%rax; call *0x18(%rax) with rsi=&vA.time
   *                                            ; valA = vA->getValueV(vA.time)
   *   0x66410  movsd xmm0 -> -0x20(%rbp)
   *   0x66415  mov (%rbx),%rax; call *0x18(%rax) with rsi=&vB.time
   *                                            ; xmm0 = valB = vB->getValueV(vB.time)
   *   0x66422  movsd -0x20(%rbp),xmm3          ; xmm3 = valA
   *   0x66427  subsd xmm3,xmm0                 ; xmm0 = valB - valA
   *   0x6642b  movsd -0x38(%rbp),xmm1          ; xmm1 = tA_sec
   *   0x66430  movsd -0x28(%rbp),xmm2          ; xmm2 = t_sec
   *   0x66435  subsd xmm1,xmm2                 ; xmm2 = t_sec - tA_sec
   *   0x66439  mulsd xmm2,xmm0                 ; xmm0 = (valB-valA)*(t-tA)
   *   0x6643d  movsd -0x30(%rbp),xmm2          ; xmm2 = tB_sec
   *   0x66442  subsd xmm1,xmm2                 ; xmm2 = tB_sec - tA_sec
   *   0x66446  divsd xmm2,xmm0                 ; xmm0 /= (tB-tA)
   *   0x6644a  addsd xmm3,xmm0                 ; xmm0 += valA
   *   0x6644e  ret                             ; return xmm0
   *
   * All arithmetic is IEEE 754 double (scalar `*sd` instructions) —
   * no Math.fround wrapping needed (per PORTING_SPEC rule 4: single-
   * precision applies only to `*ss` / `cvt*` narrowing).
   */
  interpolate(
    _sp: OZSpline,
    _t: CMTime,
    vA: FFColorBoardKeyframeVertex,
    vB: FFColorBoardKeyframeVertex,
    u: CMTime,
    _fX: boolean,
    _fY: boolean,
  ): number {
    // 0x663ae: tA_sec = CMTimeGetSeconds(vA.time)
    const tA_sec = CMTimeGetSeconds(vA.time);
    // 0x663c9: tB_sec = CMTimeGetSeconds(vB.time)
    const tB_sec = CMTimeGetSeconds(vB.time);
    // 0x663f6: t_sec  = CMTimeGetSeconds(u)
    const t_sec = CMTimeGetSeconds(u);
    // 0x6640d: valA = vA->getValueV(vA.time)   [virtual *0x18]
    const valA = vA.getValueV(vA.time);
    // 0x6641f: valB = vB->getValueV(vB.time)   [virtual *0x18]
    const valB = vB.getValueV(vB.time);
    // 0x66427..0x6644a: linear interp in seconds domain.
    // Kept in the SAME order as the asm (no algebraic re-association)
    // so the IEEE 754 rounding sequence matches instruction-for-instruction:
    //   step1 = valB - valA
    //   step2 = t_sec - tA_sec
    //   step3 = step1 * step2
    //   step4 = tB_sec - tA_sec
    //   step5 = step3 / step4
    //   result = step5 + valA
    const step1 = valB - valA;
    const step2 = t_sec - tA_sec;
    const step3 = step1 * step2;
    const step4 = tB_sec - tA_sec;
    const step5 = step3 / step4;
    return step5 + valA;
  }

  /**
   * `FFColorBoardInterpolator::isActive(OZSpline&, void*)` @Flexo 0x66460.
   * Body: `mov $0x1,%al; ret` — returns true unconditionally, regardless
   * of arguments. `sp` (rsi) and the vertex ptr (rdx) are received but
   * never read.
   */
  isActive(_sp: OZSpline, _vertex: FFColorBoardKeyframeVertex): boolean {
    // 0x66464: mov $0x1,%al ; the low byte of the return register
    return true;
  }

  /**
   * `FFColorBoardInterpolator::subDivide(OZSpline&, CMTime const&, void*,
   *  void*, void*)` @Flexo 0x66470. Body: `ret` — empty. All args
   *  received but never read; no side effects.
   */
  subDivide(
    _sp: OZSpline,
    _t: CMTime,
    _vA: FFColorBoardKeyframeVertex,
    _vB: FFColorBoardKeyframeVertex,
    _out: FFColorBoardKeyframeVertex,
  ): void {
    // 0x66474: pushq %rbp; movq %rsp,%rbp; popq %rbp; retq  — no-op
  }
}
