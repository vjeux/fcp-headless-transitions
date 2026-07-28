// OZCurveBool — Ozone.framework  (channels layer). Faithful port.
//
// The "boolean-valued" curve subtype: value domain is {0.0, 1.0}. Structurally identical to
// OZCurveDouble/OZCurveEnum (176-byte object; no extra fields beyond OZCurve; wires its own
// vtable + a singleton spline state). The KEY differentiator is the two getValue overrides
// below, which threshold the base OZCurve's continuous output to a boolean.
//
// VTABLE / SIZE / SINGLETON:
//   __ZTV11OZCurveBool  @Ozone (see getCurveWorkingCopy @0xE0E47 / cloneCurve @0xE0E94:
//     `leaq __ZTV11OZCurveBool(%rip),%rax ; addq $0x10,%rax ; movq %rax,(%rbx)`).
//   struct size = 0xB0 (176 B) — from `movl $0xB0,%edi ; callq __Znwm` @0xE0E2A/0xE0E7A.
//   spline-state singleton: OZCurveBoolSplineState::getInstance() (see ./OZCurveBoolSplineState.ts).
//
// DECODED METHODS (7):
//   @0xE0DF0  ~OZCurveBool()          D1 (in-place, non-deleting): tail-jmp to OZCurve::~OZCurve()
//   @0xE0E00  ~OZCurveBool()          D0 (deleting):               D2 + operator delete(this)
//   @0xE0E20  getCurveWorkingCopy()   new(0xB0) + OZCurve(*this,true)  + install vtable ; return p
//   @0xE0E70  cloneCurve()            new(0xB0) + OZCurve(*this,false) + install vtable ; return p
//   @0xE0EC0  isCurveBoolean()        return true (mov $1,%al)
//   @0xE0ED0  getValue(CMTime&, void*)  -> forwards to OZCurve::getValue, then boolean threshold
//   @0xE0F00  getValue(CMTime&, double) -> forwards to OZCurve::getValue, then boolean threshold
//
// The boolean threshold (both getValue overrides — identical pattern @0xE0ED9..0xE0EF6 and
// @0xE0F09..0xE0F26) is exactly:
//    r = fabs(OZCurve::getValue(...))       (andpd  [0x706E10]  = mask 0x7FFF... clears sign)
//    m = (r >= 1e-07) ? all-ones : 0        (cmpnltsd [0x706ED0] = compare NLT against 1e-07)
//    return (m & 1.0)                        (andpd  [0x7053E0]  = 1.0 selected by mask)
// i.e. returns 1.0 if |base value| >= 1e-07 else 0.0. The 1e-07 is a hardcoded ε at
// Ozone 0x706ED0 (bit-pattern 0x3E7AD7F29ABCAF48). 1.0 is at Ozone 0x7053E0. The abs-mask at
// Ozone 0x706E10 (0x7FFFFFFFFFFFFFFF).
//
// The base OZCurve constructor helpers we ride follow the SAME pattern OZCurveDouble already
// documents: OZCurve::OZCurve(OZCurve const&, bool) @ProChannel 0x1E56C and
// OZCurve::~OZCurve() @ProChannel 0x1E77A are called via __stubs @Ozone 0x6DEC10 / 0x6DEC1C
// respectively. Both are deferred with throwing stubs citing the addresses (same rationale as
// OZCurveDouble.ts: the ported OZCurveRuntime maps them as static factories, not in-place
// initialisers, so delegating would leave `this` half-constructed).

import { OZCurve } from "./OZCurve.js";
import { OZCurveBoolSplineState } from "./OZCurveBoolSplineState.js";

/** OZCurve::OZCurve(OZCurve const&, bool) @ProChannel 0x1E56C — via __stub @Ozone 0x6DEC10.
 *  Called from getCurveWorkingCopy @0xE0E42 (edx=1) and cloneCurve @0xE0E8F (edx=0). Undecoded
 *  as an in-place initialiser (OZCurveRuntime.make_copy is a static factory; wrong shape). */
function OZCurve_copy_ctor(_self: OZCurveBool, _src: OZCurveBool, _flag: boolean): void {
  throw new Error(
    "OZCurve::OZCurve(OZCurve const&, bool) @ProChannel 0x1E56C (__ZN7OZCurveC2ERKS_b; __stub @Ozone 0x6DEC10; call sites @Ozone 0xE0E42, 0xE0E8F) not yet transcribed as an in-place initialiser",
  );
}

/** OZCurve::~OZCurve() @ProChannel 0x1E77A — via __stub @Ozone 0x6DEC1C. Called from
 *  ~OZCurveBool D1 @0xE0DF5 (tail-jmp) and D0 @0xE0E09 (call). Undecoded here (OZCurveRuntime
 *  provides `destruct` but reads runtime fields the base ctor never installed on `this`). */
function OZCurve_dtor(_self: OZCurveBool): void {
  throw new Error(
    "OZCurve::~OZCurve() @ProChannel 0x1E77A (__ZN7OZCurveD2Ev; __stub @Ozone 0x6DEC1C; call sites @Ozone 0xE0DF5, 0xE0E09) not yet transcribed",
  );
}

/** OZCurve::getValue(CMTime const&, void*) — via __stub @Ozone 0x6DEC04. Called from
 *  OZCurveBool::getValue(CMTime&,void*) @0xE0ED4. Undecoded on OZCurve. */
function OZCurve_getValue_ptr(_self: OZCurveBool, _t: unknown, _out: unknown): number {
  throw new Error(
    "OZCurve::getValue(CMTime const&, void*) (__ZN7OZCurve8getValueERK6CMTimePv; __stub @Ozone 0x6DEC04; call site @Ozone 0xE0ED4) not yet transcribed",
  );
}

/** OZCurve::getValue(CMTime const&, double) — via __stub @Ozone 0x6DEC0A. Called from
 *  OZCurveBool::getValue(CMTime&,double) @0xE0F04. Undecoded on OZCurve. */
function OZCurve_getValue_double(_self: OZCurveBool, _t: unknown, _d: number): number {
  throw new Error(
    "OZCurve::getValue(CMTime const&, double) (__ZN7OZCurve8getValueERK6CMTimed; __stub @Ozone 0x6DEC0A; call site @Ozone 0xE0F04) not yet transcribed",
  );
}

/** Vtable base for OZCurveBool. vptr at (this+0x0) = &__ZTV11OZCurveBool + 0x10 (skips the
 *  16-byte Itanium-ABI header). Address-only sentinel; the vtable itself lives in Ozone. */
const OZCurveBool_vtable_plus_0x10: unique symbol = Symbol("__ZTV11OZCurveBool+0x10");

export class OZCurveBool extends OZCurve {
  /** (this+0x0) — vptr, set to `&__ZTV11OZCurveBool + 0x10` after base construction (@0xE0E47,
   *  @0xE0E94). */
  __vptr?: symbol;

  /** OZCurveBool::~OZCurveBool() @Ozone 0xE0DF0 (__ZN11OZCurveBoolD1Ev — non-deleting).
   *  Body (5 lines):
   *    pushq %rbp; movq %rsp,%rbp
   *    popq  %rbp
   *    jmp   __ZN7OZCurveD2Ev            ; tail-call OZCurve::~OZCurve() (__stub @0x6DEC1C)
   *  No derived-class cleanup; OZCurveBool adds no destructible fields. Mirror the tail-call. */
  dtor(): void {
    OZCurve_dtor(this);
  }

  /** OZCurveBool::~OZCurveBool() @Ozone 0xE0E00 (__ZN11OZCurveBoolD0Ev — deleting).
   *  Body (13 lines):
   *    pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *    movq  %rdi,%rbx
   *    callq __ZN7OZCurveD2Ev            ; OZCurve::~OZCurve() (__stub @0x6DEC1C)
   *    movq  %rbx,%rdi
   *    addq  $0x8,%rsp; popq %rbx; popq %rbp
   *    jmp   __ZdlPv                     ; operator delete(this) — no TS equivalent (GC). */
  dtor_deleting(): void {
    OZCurve_dtor(this);
    // @0xE0E17: jmp __ZdlPv (operator delete). No TS equivalent; the GC reclaims.
  }

  /** OZCurveBool::getCurveWorkingCopy() @Ozone 0xE0E20 (__ZN11OZCurveBool19getCurveWorkingCopyEv).
   *  Body (26 lines):
   *    movl  $0xB0,%edi ; callq __Znwm                         ; operator new(176)  @0xE0E2A/2F
   *    movq  %rax,%rbx                                          ; p = fresh alloc
   *    movq  %rax,%rdi ; movq %r14,%rsi ; movl $0x1,%edx
   *    callq __ZN7OZCurveC2ERKS_b                                ; OZCurve(p, *this, true) @0xE0E42
   *    leaq  __ZTV11OZCurveBool(%rip),%rax ; addq $0x10,%rax
   *    movq  %rax,(%rbx)                                         ; p->vptr = &vt+0x10 @0xE0E47..52
   *    movq  %rbx,%rax ; ... ; retq                              ; return p
   *  Landing pad @0xE0E5D..0xE0E6E: on throw, operator delete(p) + _Unwind_Resume. */
  getCurveWorkingCopy(): OZCurveBool {
    // operator new(0xB0) — 176-byte allocation. GC-managed in TS.
    const p = Object.create(OZCurveBool.prototype) as OZCurveBool;
    // OZCurve::OZCurve(OZCurve const&, bool=true) — base copy-ctor, flag=1 (edx=1 @0xE0E3D).
    OZCurve_copy_ctor(p, this, true);
    // vptr install @0xE0E47..0xE0E52.
    p.__vptr = OZCurveBool_vtable_plus_0x10;
    return p;
  }

  /** OZCurveBool::cloneCurve() @Ozone 0xE0E70 (__ZN11OZCurveBool10cloneCurveEv).
   *  Identical to getCurveWorkingCopy EXCEPT edx=0 (`xorl %edx,%edx` @0xE0E8D) — the sole
   *  functional difference is the boolean flag to OZCurve's copy-ctor (false vs true).
   *  Body (27 lines): new(0xB0) + OZCurve(*this,false) + vtable install + return p.
   *  Landing pad @0xE0EAA..0xE0EBD: same as getCurveWorkingCopy's. */
  cloneCurve(): OZCurveBool {
    const p = Object.create(OZCurveBool.prototype) as OZCurveBool;
    // Same base copy-ctor, flag=false (edx=0 @0xE0E8D).
    OZCurve_copy_ctor(p, this, false);
    p.__vptr = OZCurveBool_vtable_plus_0x10;
    return p;
  }

  /** OZCurveBool::isCurveBoolean() @Ozone 0xE0EC0 (__ZN11OZCurveBool14isCurveBooleanEv).
   *  Body (7 lines):
   *    pushq %rbp; movq %rsp,%rbp
   *    movb  $0x1,%al                    ; return true
   *    popq  %rbp; retq
   *  The "am I a boolean curve?" type predicate the OZCurve base returns false for. */
  isCurveBoolean(): boolean {
    return true;
  }

  /** OZCurveBool::getValue(CMTime const&, void*) @Ozone 0xE0ED0.
   *  Body (11 lines):
   *    pushq %rbp; movq %rsp,%rbp
   *    callq __ZN7OZCurve8getValueERK6CMTimePv           ; base getValue (returns %xmm0)
   *    andpd  [0x706E10](%rip), %xmm0                    ; fabs — mask 0x7FFF...
   *    cmpnltsd [0x706ED0](%rip), %xmm0                  ; xmm0 = (fabs(v) >= 1e-07) ? -1 : 0
   *    movsd  [0x7053E0](%rip), %xmm1                    ; xmm1 = 1.0
   *    andpd  %xmm1, %xmm0                               ; result & 1.0  -> 1.0 or 0.0
   *    popq   %rbp; retq
   *
   *  Constants (verified from Ozone x86_64 slice):
   *    @Ozone 0x706E10 : u64 0x7FFFFFFFFFFFFFFF (fabs mask; packed 2×)
   *    @Ozone 0x706ED0 : double 1e-07 (u64 0x3E7AD7F29ABCAF48)
   *    @Ozone 0x7053E0 : double 1.0   (u64 0x3FF0000000000000)
   *
   *  Numerics: single-precision NOT involved (all SSE ops are `sd`/`pd` doubles). No Math.fround.
   */
  getValueWithOutPtr(t: unknown, out: unknown): number {
    const base = OZCurve_getValue_ptr(this, t, out);
    // andpd 0x7FFFFFFFFFFFFFFF: fabs on the low double lane (upper lane discarded on return).
    const r = Math.abs(base);
    // cmpnltsd 1e-07: NLT compare. IEEE-754: 1e-07 @Ozone 0x706ED0.
    // The compare sets xmm0.lo to all-ones if r >= 1e-07 (equivalently NOT(r < 1e-07)), else 0.
    // andpd with 1.0 then masks 1.0 through iff the compare said "not less than".
    // NOTE on NaN: SSE cmpnltsd of NaN yields "unordered", which produces 0 (predicate false),
    // so NaN -> 0.0 here — mirrored by Number.isNaN(r) below to preserve that.
    if (Number.isNaN(r)) return 0.0;
    return r >= 1e-07 ? 1.0 : 0.0;
  }

  /** OZCurveBool::getValue(CMTime const&, double) @Ozone 0xE0F00.
   *  Same shape as the void* overload above but delegates to the OZCurve::getValue(CMTime&,double)
   *  overload (__stub @0x6DEC0A). Body (10 executable lines):
   *    pushq %rbp; movq %rsp,%rbp
   *    callq __ZN7OZCurve8getValueERK6CMTimed             ; base getValue(double) (%xmm0)
   *    andpd  [0x706E10](%rip), %xmm0                     ; fabs — mask 0x7FFF...  @0xE0F09
   *    cmpnltsd [0x706ED0](%rip), %xmm0                   ; (fabs(v) >= 1e-07) ? -1 : 0   @0xE0F11
   *    movsd  [0x7053E0](%rip), %xmm1                     ; xmm1 = 1.0            @0xE0F1A
   *    andpd  %xmm1, %xmm0                                ; -> 1.0 or 0.0         @0xE0F22
   *    popq   %rbp; retq                                                          @0xE0F26/27
   *
   *  Constants at the SAME three Ozone addresses as the void* overload (0x706E10 mask,
   *  0x706ED0 1e-07 threshold, 0x7053E0 the 1.0). See verified bit patterns above. */
  getValueWithDouble(t: unknown, d: number): number {
    const base = OZCurve_getValue_double(this, t, d);
    const r = Math.abs(base);
    if (Number.isNaN(r)) return 0.0;
    return r >= 1e-07 ? 1.0 : 0.0;
  }
}

// The spline-state singleton install (per OZCurveDouble's pattern @ProChannel 0x3986..0x3999)
// happens in the OZCurveBool ctor path. That ctor is not present in Ozone's ledger for this
// class — it's presumably inlined at construction sites or lives in ProChannel; when it is
// decoded, wire `OZCurveBoolSplineState.getInstance()` here. Reference retained to prevent the
// import from being tree-shaken away by tsc.
void OZCurveBoolSplineState;
