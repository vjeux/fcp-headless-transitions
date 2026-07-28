// OZCurveNode.ts — FCP ProChannel `OZCurveNode`, the abstract BASE class for
// every animation-curve node (OZConstantNode, OZBezierNode, OZLinearNode,
// OZHermiteNode, OZContinuousNode, etc.). The base class contains ONLY
// default/no-op implementations of a virtual interface — each derived class
// overrides the ones it cares about.
//
// FRAMEWORK: ProChannel.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/ProChannel.OZCurveNode.*.s.
//
// SYMBOLS ported here (every non-inlined member function):
//   __ZN11OZCurveNodeC2Ev                    @0x00029c40  OZCurveNode::OZCurveNode()          [C2 — vtable install]
//   __ZN11OZCurveNodeC2ERKS_                 @0x00029c50  OZCurveNode::OZCurveNode(OZCurveNode const&)  [C2 copy — vtable install only]
//   __ZN11OZCurveNodeD2Ev                    @0x00029c60  OZCurveNode::~OZCurveNode()         [D2 — trivial: pushq/movq/popq/retq]
//   __ZN11OZCurveNodeD1Ev                    @0x000ac186  OZCurveNode::~OZCurveNode()         [D1 — `ud2` (never emitted; abort if reached)]
//   __ZN11OZCurveNodeD0Ev                    @0x000ac18c  OZCurveNode::~OZCurveNode()         [D0 — `ud2` (never emitted; abort if reached)]
//   __ZN11OZCurveNode15getCurrentRangeEv     @0x00029ba6  OZCurveNode::getCurrentRange()
//   __ZN11OZCurveNode13getNeededTimeERK6CMTime @0x00029bc4 OZCurveNode::getNeededTime(CMTime const&)
//   __ZN11OZCurveNode12getMaxValueUEv        @0x00029bdc  OZCurveNode::getMaxValueU()
//   __ZN11OZCurveNode12getMinValueUEv        @0x00029bfa  OZCurveNode::getMinValueU()
//   __ZN11OZCurveNode14isPointToPointEv      @0x00029c18  OZCurveNode::isPointToPoint()
//   __ZN11OZCurveNode15isRemappingTimeEv     @0x00029c20  OZCurveNode::isRemappingTime()
//   __ZN11OZCurveNode13isPassThroughEv       @0x00029c28  OZCurveNode::isPassThrough()
//   __ZN11OZCurveNode11getMaxValueEb         @0x00029c66  OZCurveNode::getMaxValue(bool)
//   __ZN11OZCurveNode11getMinValueEb         @0x00029c70  OZCurveNode::getMinValue(bool)
//   __ZN11OZCurveNode9solveNodeERK6CMTimedd  @0x00029c7a  OZCurveNode::solveNode(CMTime const&, double, double)
//   __ZN11OZCurveNode8setValueERK6CMTimedb   @0x00029c84  OZCurveNode::setValue(CMTime const&, double, bool)
//   __ZN11OZCurveNode15setDefaultValueEd     @0x00029c8a  OZCurveNode::setDefaultValue(double)
//   __ZN11OZCurveNode15getDefaultValueEv     @0x00029c90  OZCurveNode::getDefaultValue()
//   __ZN11OZCurveNode15setInitialValueEd     @0x00029c9a  OZCurveNode::setInitialValue(double)
//   __ZN11OZCurveNode15getInitialValueEv     @0x00029ca0  OZCurveNode::getInitialValue()
//   __ZN11OZCurveNode5resetEv                @0x00029caa  OZCurveNode::reset()
//
// ---------------------------------------------------------------------------
// INSTANCE LAYOUT (proven by the ctor(s) and by derived-class field accesses):
//   +0x00   8   vtable*   — installed at ctor via `leaq 0xab2bd(%rip), %rax; movq %rax, (%rdi)`
//                           (@0x29c44/@0x29c54 → resolves to `vtable for OZCurveNode + 0x10`
//                            at 0xd4f08, per raw-port/army/tools/resolve.py ProChannel sym).
//   +0x08 …   (derived-class fields — not visible from this base class)
//
// The base ctor writes ONLY the vtable pointer. No fields are initialized here.
// Derived classes (OZConstantNode etc.) initialize their own state.
//
// ---------------------------------------------------------------------------
// VTABLE (declared here for reviewer reference; installed by ctor).
// See raw-port/re/VERTEX_VTABLES.md for the vtable-scan convention; specific
// slot offsets for OZCurveNode are captured in each derived class's port
// (e.g. OZConstantNode overrides solveNode/compare/getNeededRange).
// ---------------------------------------------------------------------------

import { kCMTimeZero, type CMTime } from "../infra/CMTime";

// ============================================================================

/**
 * OZCurveNode — abstract animation-curve node base. Every method here is a
 * TRIVIAL DEFAULT (no-op setter, zero-returning getter, CMTimeZero-returning
 * CMTime accessor, arg-passthrough solveNode). Derived classes override.
 *
 * Because every method is a simple default, the "port" is nearly literal:
 * we mirror each asm body exactly. The methods are `virtual` in C++ so the
 * base version only runs when a derived class DOESN'T override — but the
 * whole point of listing the base defaults here is that they define the
 * semantic contract for "a curve node that does nothing".
 */
export class OZCurveNode {
  // Field +0x00 — vtable pointer. In TS we can't literally embed a vtable,
  // but we surface the address of the installed table for review parity.
  // Concrete derived-class dispatch is handled per subclass file.
  static readonly VTABLE_ADDRESS = 0xd4f08; // = &(vtable for OZCurveNode) + 0x10

  /**
   * OZCurveNode::OZCurveNode()   @0x00029c40 (C2)
   *
   * DECODE (7 lines including prologue/epilogue):
   *   @0x29c40 pushq %rbp ; movq %rsp, %rbp
   *   @0x29c44 leaq 0xab2bd(%rip), %rax     — rax = &vtable_for_OZCurveNode + 0x10
   *                                            (RIP+disp: 0x29c4b + 0xab2bd = 0xd4f08)
   *   @0x29c4b movq %rax, (%rdi)            — this->vtable = rax
   *   @0x29c4e popq %rbp ; retq
   *
   * NO other fields are touched. Any subclass constructor calls this first,
   * writes its own vtable pointer over ours, then initializes its members.
   *
   * NOTE: There is no separately-emitted C1 ctor in the binary — the C1 sym
   * is expected to be an alias for C2 (or is inlined). We surface a single
   * TS constructor that models the C2 body.
   */
  constructor(other?: OZCurveNode) {
    // @0x29c44-@0x29c4b — install vtable. In TS this is a no-op field record;
    // we keep it for parity with the copy ctor and derived-class overrides.
    // The copy ctor @0x29c50 has an IDENTICAL body — see the class doc comment.
    // Reference the parameter so TypeScript's noUnusedParameters (and reviewers)
    // see we intentionally accept-and-ignore it:
    void other;
    // No other init — matches the 7-line asm body exactly.
  }

  /**
   * OZCurveNode::~OZCurveNode()   @0x00029c60 (D2 — used-in-place dtor)
   *
   * DECODE (4 lines, empty body):
   *   @0x29c60 pushq %rbp ; movq %rsp, %rbp
   *   @0x29c64 popq %rbp ; retq
   *
   * The D1/D0 destructor variants at @0x000ac186 and @0x000ac18c are BOTH
   * `ud2` (crash instructions) — meaning the compiler emitted them but they
   * MUST NEVER BE CALLED. This is the classic pattern for a virtual base
   * whose complete-object destruction only ever happens through derived
   * classes (never through a bare OZCurveNode*). We surface an explicit
   * dispose() that mirrors the D2 body (empty) and note the abort variants.
   */
  dispose(): void {
    // @0x29c64 — empty body. No-op.
  }

  /**
   * OZCurveNode::getCurrentRange()   @0x00029ba6
   *
   * DECODE (10 lines): loads the ObjC literal `_kCMTimeZero` and copies its
   * 24 bytes into the return-slot at (%rdi):
   *   @0x29ba6 pushq %rbp ; movq %rsp, %rbp
   *   @0x29baa movq %rdi, %rax                 — return-slot passthrough
   *   @0x29bad movq 0xa090c(%rip), %rcx        — rcx = _kCMTimeZero (ObjC literal-pool ptr)
   *   @0x29bb4 movq 0x10(%rcx), %rdx           — rdx = kCMTimeZero.epoch (bytes +0x10..+0x17)
   *   @0x29bb8 movq %rdx, 0x10(%rdi)           — write epoch to (%rdi)+0x10
   *   @0x29bbc movups (%rcx), %xmm0            — xmm0 = kCMTimeZero.{value,timescale,flags} (bytes 0..0xF)
   *   @0x29bbf movups %xmm0, (%rdi)            — write 16 bytes to (%rdi)+0
   *   @0x29bc2 popq %rbp ; retq
   *
   * Returns: CMTimeZero (the standard zero-valued CMTime).
   */
  getCurrentRange(): CMTime {
    // @0x29bad-@0x29bbf — return kCMTimeZero.
    return { ...kCMTimeZero };
  }

  /**
   * OZCurveNode::getNeededTime(CMTime const& t)   @0x00029bc4
   *
   * DECODE (10 lines): copies its argument (%rdx = &t) into the return slot
   * (%rdi). Pure passthrough.
   *   @0x29bc4 pushq %rbp ; movq %rsp, %rbp
   *   @0x29bc8 movq %rdi, %rax                 — return-slot passthrough
   *   @0x29bcb movq 0x10(%rdx), %rcx           — rcx = t.epoch
   *   @0x29bcf movq %rcx, 0x10(%rdi)           — write epoch to out+0x10
   *   @0x29bd3 movups (%rdx), %xmm0            — xmm0 = t.{value,timescale,flags}
   *   @0x29bd6 movups %xmm0, (%rdi)            — write 16 bytes to out+0
   *   @0x29bd9 popq %rbp ; retq
   *
   * Returns: t unchanged (the base class asserts "the needed time IS the
   * requested time" — no time remapping in the default).
   */
  getNeededTime(t: CMTime): CMTime {
    // @0x29bcb-@0x29bd6 — verbatim 24-byte copy of t.
    return { ...t };
  }

  /**
   * OZCurveNode::getMaxValueU()   @0x00029bdc
   *
   * DECODE (10 lines): IDENTICAL body to getCurrentRange() — loads
   * `_kCMTimeZero` and copies its 24 bytes to the return slot.
   *   @0x29be3 movq 0xa08d6(%rip), %rcx        — rcx = _kCMTimeZero
   *   … (same 3 loads/stores as getCurrentRange) …
   *
   * Returns: CMTimeZero. (Semantic: base returns "no upper time bound".)
   */
  getMaxValueU(): CMTime {
    // @0x29be3-@0x29bf5 — return kCMTimeZero.
    return { ...kCMTimeZero };
  }

  /**
   * OZCurveNode::getMinValueU()   @0x00029bfa
   *
   * DECODE (10 lines): IDENTICAL body to getCurrentRange() and getMaxValueU().
   *   @0x29c01 movq 0xa08b8(%rip), %rcx        — rcx = _kCMTimeZero
   *   … same 3 loads/stores …
   *
   * Returns: CMTimeZero. (Semantic: base returns "no lower time bound".)
   */
  getMinValueU(): CMTime {
    // @0x29c01-@0x29c13 — return kCMTimeZero.
    return { ...kCMTimeZero };
  }

  /**
   * OZCurveNode::isPointToPoint()   @0x00029c18
   *
   * DECODE (5 lines): `movb $0x1, %al` — returns bool true.
   *   @0x29c18 pushq %rbp ; movq %rsp, %rbp
   *   @0x29c1c movb $0x1, %al
   *   @0x29c1e popq %rbp ; retq
   *
   * Returns: true. (Base default: "yes, this is a point-to-point curve segment.")
   */
  isPointToPoint(): boolean {
    // @0x29c1c — al = 1.
    return true;
  }

  /**
   * OZCurveNode::isRemappingTime()   @0x00029c20
   *
   * DECODE (5 lines): `xorl %eax, %eax` — returns bool false.
   *   @0x29c24 xorl %eax, %eax
   *
   * Returns: false. (Base default: "no time remapping.")
   */
  isRemappingTime(): boolean {
    // @0x29c24 — eax = 0.
    return false;
  }

  /**
   * OZCurveNode::isPassThrough()   @0x00029c28
   *
   * DECODE (5 lines): `xorl %eax, %eax` — returns bool false.
   *   @0x29c2c xorl %eax, %eax
   *
   * Returns: false. (Base default: "not a pass-through node.")
   */
  isPassThrough(): boolean {
    // @0x29c2c — eax = 0.
    return false;
  }

  /**
   * OZCurveNode::getMaxValue(bool (unused))   @0x00029c66
   *
   * DECODE (6 lines): `xorps %xmm0, %xmm0` — returns double 0.0.
   *   @0x29c6a xorps %xmm0, %xmm0
   *
   * The bool arg (in %esi) is IGNORED by the asm — no register read.
   * Returns: 0.0. (Base default: "value has no maximum.")
   */
  getMaxValue(_useSecondaryClamp: boolean = false): number {
    // @0x29c6a — xmm0 = 0.
    void _useSecondaryClamp;
    return 0.0;
  }

  /**
   * OZCurveNode::getMinValue(bool (unused))   @0x00029c70
   *
   * DECODE (6 lines): `xorps %xmm0, %xmm0` — returns double 0.0.
   *   @0x29c74 xorps %xmm0, %xmm0
   *
   * The bool arg is IGNORED.
   * Returns: 0.0.
   */
  getMinValue(_useSecondaryClamp: boolean = false): number {
    // @0x29c74 — xmm0 = 0.
    void _useSecondaryClamp;
    return 0.0;
  }

  /**
   * OZCurveNode::solveNode(CMTime const& (t), double (interp), double defaultValue)
   *                                      @0x00029c7a
   *
   * DECODE (6 lines): passthrough — return the SECOND double argument.
   *   @0x29c7a pushq %rbp ; movq %rsp, %rbp
   *   @0x29c7e movaps %xmm1, %xmm0            — xmm0 = xmm1 (arg2 = defaultValue → return slot)
   *   @0x29c81 popq %rbp ; retq
   *
   * ABI mapping (SysV AMD64):
   *   %rdi   = this
   *   %rsi   = &t          (const CMTime&)   ← IGNORED
   *   %xmm0  = interp      (double, 1st fp arg)   ← IGNORED
   *   %xmm1  = defaultValue (double, 2nd fp arg)  ← RETURNED via xmm0
   *
   * Returns: defaultValue. (Base "solve" is "yield the default — no curve to evaluate.")
   */
  solveNode(_t: CMTime, _interp: number, defaultValue: number): number {
    // @0x29c7e — movaps xmm1, xmm0 — return the 2nd double arg (defaultValue).
    void _t;
    void _interp;
    return defaultValue;
  }

  /**
   * OZCurveNode::setValue(CMTime const& (t), double (v), bool (enable))
   *                                      @0x00029c84
   *
   * DECODE (4 lines): pure prologue/epilogue — no-op.
   *   @0x29c84 pushq %rbp ; movq %rsp, %rbp ; popq %rbp ; retq
   *
   * All 3 arguments are IGNORED.
   */
  setValue(_t: CMTime, _v: number, _enable: boolean): void {
    // @0x29c84-@0x29c89 — empty body.
    void _t;
    void _v;
    void _enable;
  }

  /**
   * OZCurveNode::setDefaultValue(double (v))   @0x00029c8a
   *
   * DECODE (4 lines): pure prologue/epilogue — no-op.
   *   @0x29c8a pushq %rbp ; movq %rsp, %rbp ; popq %rbp ; retq
   *
   * Argument IGNORED.
   */
  setDefaultValue(_v: number): void {
    // @0x29c8a-@0x29c8f — empty body.
    void _v;
  }

  /**
   * OZCurveNode::getDefaultValue()   @0x00029c90
   *
   * DECODE (6 lines): `xorps %xmm0, %xmm0` — returns double 0.0.
   *   @0x29c94 xorps %xmm0, %xmm0
   *
   * Returns: 0.0.
   */
  getDefaultValue(): number {
    // @0x29c94 — xmm0 = 0.
    return 0.0;
  }

  /**
   * OZCurveNode::setInitialValue(double (v))   @0x00029c9a
   *
   * DECODE (4 lines): pure prologue/epilogue — no-op.
   *   @0x29c9a pushq %rbp ; movq %rsp, %rbp ; popq %rbp ; retq
   *
   * Argument IGNORED.
   */
  setInitialValue(_v: number): void {
    // @0x29c9a-@0x29c9f — empty body.
    void _v;
  }

  /**
   * OZCurveNode::getInitialValue()   @0x00029ca0
   *
   * DECODE (6 lines): `xorps %xmm0, %xmm0` — returns double 0.0.
   *   @0x29ca4 xorps %xmm0, %xmm0
   *
   * Returns: 0.0.
   */
  getInitialValue(): number {
    // @0x29ca4 — xmm0 = 0.
    return 0.0;
  }

  /**
   * OZCurveNode::reset()   @0x00029caa
   *
   * DECODE (4 lines): pure prologue/epilogue — no-op.
   *   @0x29caa pushq %rbp ; movq %rsp, %rbp ; popq %rbp ; retq
   *
   * Semantic: "clear any per-solve state" — no state to clear at the base.
   */
  reset(): void {
    // @0x29caa-@0x29caf — empty body.
  }
}

// ============================================================================
// Complete-object destructor variants D1 and D0 — both are `ud2` (abort).
//
// __ZN11OZCurveNodeD1Ev  @0x000ac186   pushq %rbp ; movq %rsp, %rbp ; ud2
// __ZN11OZCurveNodeD0Ev  @0x000ac18c   pushq %rbp ; movq %rsp, %rbp ; ud2
//
// These are emitted to satisfy the vtable slot but MUST NEVER BE CALLED —
// concrete destruction always goes through a derived class's D0/D1. If a
// caller ever routes complete-object destruction through a bare OZCurveNode*
// (which would indicate a bug: the class is abstract in practice), the C++
// runtime hits ud2 and crashes. We reflect that with an explicit throw so
// the frontier scanner (throw + "not yet transcribed" + @0xADDR) records
// this abort point.
// ============================================================================

/**
 * `ud2` at D1 @0x000ac186 — a "complete-object destructor on the abstract
 * base was invoked" trap. Not yet transcribed in the sense of "we do not
 * have a normal implementation here" — the binary itself intentionally
 * aborts here. Callers should never hit this path.
 */
export function OZCurveNode_completeObjectDestructor_D1(): never {
  throw new Error(
    "OZCurveNode::~OZCurveNode() [D1 complete-object destructor] is `ud2` @0x000ac186 not yet transcribed — the FCP binary aborts here; concrete destruction must go through a derived class",
  );
}

/**
 * `ud2` at D0 @0x000ac18c — a "deleting destructor on the abstract base"
 * trap. Same story as D1.
 */
export function OZCurveNode_deletingDestructor_D0(): never {
  throw new Error(
    "OZCurveNode::~OZCurveNode() [D0 deleting destructor] is `ud2` @0x000ac18c not yet transcribed — the FCP binary aborts here; concrete destruction must go through a derived class",
  );
}
