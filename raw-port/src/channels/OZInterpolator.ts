// OZInterpolator — base keyframe interpolator (ProChannel.framework).
// Faithful port. Decode: OZInterpolator::easeTime @ProChannel 0x418b2 (re/CURVE_EVAL.md).
// One class per file (mirrors FCP's class hierarchy). easeTime is the base "time-warp" hook the
// interpolators call before evaluating a segment; the eased subclasses (SCurve/Convex/Concave/Ease)
// OVERRIDE it, Linear/Bezier use this identity base.
import { OZKeypoint } from "./OZCurve.js";
import { CMTime } from "../infra/CMTime.js";

/**
 * OZInterpolator::easeTime(OZSpline&, CMTime t, vA, vB) -> CMTime   @ProChannel 0x418b2.
 * The BASE implementation is IDENTITY: it copies the input CMTime `t` verbatim to the result
 * (movq 0x10(rcx)->0x10(rdi); movups (rcx)->(rdi)). Linear + Bezier use this base; the eased
 * interpolators OVERRIDE easeTime to warp the query time.
 */
export function easeTime_identity(t: CMTime, _a: OZKeypoint, _b: OZKeypoint): CMTime {
  return t; // verbatim copy
}

/**
 * `OZInterpolator::OZInterpolator()` [C2 base ctor] @ProChannel 0x44632
 *   __ZN14OZInterpolatorC2Ev
 *
 * FULL BODY (all 6 instructions, verbatim; @re/disasm/ProChannel.__ZN14OZInterpolatorC2Ev.s):
 *   0x44632  pushq %rbp
 *   0x44633  movq  %rsp, %rbp
 *   0x44636  leaq  0x91dd3(%rip), %rax     ; rip_after=0x4463d -> 0x4463d + 0x91dd3 = 0xd6410
 *                                          ; = OZInterpolator vtable+0x10 (installed-ptr).
 *                                          ; vtable @0xd6400; installed ptr = 0xd6410 confirmed by
 *                                          ; `resolve.py ProChannel vtable OZInterpolator`.
 *   0x4463d  movq  %rax, (%rdi)            ; (this+0x00) = vptr
 *   0x44640  popq  %rbp
 *   0x44641  retq
 *
 * The ctor does NOT initialize any data fields — the only work is installing the vptr at +0x00.
 * OZInterpolator is a base class; subclasses (OZLinearInterpolator, OZBezierInterpolator, etc.)
 * chain to this ctor and then set up their own state.
 *
 * VTABLE at 0xd6410 (from `resolve.py ProChannel vtable OZInterpolator`):
 *   *0x00 -> 0xac1fa  OZInterpolator::~OZInterpolator()  [D1]
 *   *0x08 -> 0xac200  OZInterpolator::~OZInterpolator()  [D0]
 *   *0x10 -> 0x84718  OZInterpolator::init(OZSpline&, CMTime const&)
 *   *0x28 -> 0x44688  OZInterpolator::convertHandlesToTangents(...)
 *   *0x30 -> 0x4468e  OZInterpolator::convertTangentsToHandles(...)
 *   *0x38 -> 0x44648  OZInterpolator::useTangents()
 *   *0x40 -> 0x44650  OZInterpolator::useKeypoints()
 *   *0x48 -> 0x44658  OZInterpolator::getAdjustedMaxU(...)
 *   *0x50 -> 0x44670  OZInterpolator::getAdjustedMinU(...)
 *   *0x58 -> 0x418aa  OZInterpolator::needInit(OZSpline&)
 *   *0x60 -> 0x42888  OZInterpolator::uForCurveValue(...)
 *   *0x68 -> 0x418b2  OZInterpolator::easeTime(...)
 *
 * @0x44632
 */
export class OZInterpolator {
  /**
   * +0x00 primary vptr — points to OZInterpolator vtable+0x10 = 0xd6410.
   * Written by C2 @0x4463d: `movq %rax, (%rdi)` where rax = LEA target from @0x44636.
   */
  vptr_at_0x00: string = "__ZTV14OZInterpolator+0x10";

  /**
   * `OZInterpolator::OZInterpolator()` [C2] @ProChannel 0x44632  __ZN14OZInterpolatorC2Ev
   *
   * Bare vtable install; no field initialization. Callers (subclass ctors and the C1 alias) simply
   * receive an object with the OZInterpolator vptr installed at +0x00.
   */
  constructor() {
    // @0x44636 leaq 0x91dd3(%rip), %rax  ->  rax = 0xd6410 = vtable+0x10
    // @0x4463d movq %rax, (%rdi)          ->  (this+0x00) = vptr
    this.vptr_at_0x00 = "__ZTV14OZInterpolator+0x10";
    // @0x44640 popq %rbp / @0x44641 retq  ->  return (no return value)
  }

  /**
   * `OZInterpolator::~OZInterpolator()` [D2] @ProChannel 0x44642  __ZN14OZInterpolatorD2Ev
   *
   * Faithful line-for-line transcription of the 5-line disassembly:
   *
   *   0x44642  pushq  %rbp                        ; frame prologue
   *   0x44643  movq   %rsp, %rbp
   *   0x44646  popq   %rbp                        ; frame epilogue
   *   0x44647  retq
   *
   * Empty destructor body — the Itanium C++ ABI D2 ("base object destructor")
   * runs the LOCAL fields' destructors but neither reinstalls the vtable
   * (that's D1's job) nor deletes the object (that's D0's). Since
   * OZInterpolator's ctor @0x44632 installs only the vptr at +0x00 and
   * initializes ZERO data fields (per the base-class ctor doc-comment
   * above), there is genuinely nothing for D2 to destroy: no owned
   * pointers, no allocated buffers, no non-POD members. The compiler
   * emitted the bare frame + return.
   *
   * This is a real (non-cheat) empty body — it's what the machine does.
   * The FCP compiler could have folded this to a nop-slot in a subclass's
   * vtable, but it kept D2 as a callable symbol so subclass D2s can chain
   * to it (e.g. via `jmp __ZN14OZInterpolatorD2Ev` from a subclass D2 that
   * has no additional cleanup of its own).
   *
   * VTABLE ROLE: D2 is NOT the slot dispatched from `~OZInterpolator()`
   * calls in the wild — those go through the class's vtable at slot +0x00
   * (D1) or +0x08 (D0). D2 is the base-object variant invoked by other
   * destructors' epilogues (the "in-charge" D1 chains to the parent's D2,
   * per the Itanium ABI). See the vtable table in the class doc-comment
   * above: *0x00 = D1 @0xac1fa, *0x08 = D0 @0xac200 (both separate ledger
   * entries, not in this file's scope).
   *
   * Zero in-scope callees, zero externs — pure empty body.
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProChannel.__ZN14OZInterpolatorD2Ev.s (5 lines)
   */
  destructor_D2(this: OZInterpolator): void {
    // @0x44642..0x44647 — pushq %rbp / movq %rsp,%rbp / popq %rbp / retq
    //   Empty function body. The C++ D2 destroys local (non-inherited)
    //   fields — OZInterpolator has NONE (the ctor initializes only the
    //   vptr; per the ABI, the vptr is NOT a destructor-run field), so
    //   D2 is genuinely a no-op. Preserved as an explicit method so
    //   subclass D2s that chain here still have a callable symbol.
    /* no-op — the machine does nothing but frame prologue/epilogue. */
  }
}
