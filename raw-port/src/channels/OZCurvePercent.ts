// OZCurvePercent — a curve subtype whose value domain is the closed unit interval
// [0.0, 1.0] with step 0.0001 (percent-valued, 0.01% resolution). Framework: ProChannel.
//
// Faithful port. Decode: disasm of the 5 methods below.
//   struct size: `new (0xb0)` @0xabbc6 in getCurveWorkingCopy / @0xabc16 in cloneCurve —
//   OZCurvePercent is exactly OZCurve-sized (176 B); it adds NO fields, only the vtable and
//   a spline-state singleton wired in the ctor.
//   vtable: `__ZTV14OZCurvePercent + 0x10` stored at (this+0x0) — the vptr slot
//   (@0xabb09, @0xabbe3, @0xabc30).
//
// Base helpers we ride. The 4 OZCurve base methods have been transcribed as instance/static
// methods on OZCurveRuntime (raw-port/src/channels/OZCurveRuntime.ts) at the real addresses
// listed below, but they do NOT compose with this subclass's call shape (see the header of
// OZCurveDouble.ts for the full rationale). Per the port's "no wrong delegation" rule we keep
// the stubs and correct the cited addresses so provenance is honest.
//   __ZN7OZCurveC2Edddd    OZCurve::OZCurve(double,double,double,double)
//                          @ProChannel 0x1e494 (called @0xabb04; runtime = OZCurveRuntime.make_bounds)
//   __ZN7OZCurveC2ERKS_b   OZCurve::OZCurve(OZCurve const&, bool)
//                          @ProChannel 0x1e56c (called @0xabbde, @0xabc2b; runtime = OZCurveRuntime.make_copy)
//   __ZN7OZCurveD2Ev       OZCurve::~OZCurve()
//                          @ProChannel 0x1e77a (called @0xabb3a, @0xabb9b, @0xabba9;
//                          runtime = OZCurveRuntime.prototype.destruct — needs runtime fields)
//   __ZN7OZCurve14setSplineStateEP13OZSplineState  OZCurve::setSplineState(...)
//                          @ProChannel 0x1ea66 (called @0xabb2a;
//                          runtime = OZCurveRuntime.prototype.setSplineState — needs runtime fields)
//   __ZN25OZCurvePercentSplineState11getInstanceEv OZCurvePercentSplineState::getInstance()
//                          @ProChannel 0xabb48 (called @0xabb17; TRANSCRIBED in
//                          OZCurvePercentSplineState.ts — delegated below.)
//
// Mirrors the landed OZCurveDouble.ts pattern exactly; only the bound constants and the
// spline-state singleton class differ.

import { OZCurve } from "./OZCurve.js";
import { OZCurvePercentSplineState } from "./OZCurvePercentSplineState.js";

/** OZCurve::OZCurve(double, double, double, double) @ProChannel __ZN7OZCurveC2Edddd — undecoded. */
function OZCurve_ctor_bounds(
  _self: OZCurvePercent,
  _minVal: number,
  _maxVal: number,
  _step: number,
  _initVal: number,
): void {
  throw new Error(
    "OZCurve::OZCurve(double,double,double,double) @ProChannel 0x1e494 (__ZN7OZCurveC2Edddd; call site @0xabb04; runtime decoded in OZCurveRuntime.ts as static make_bounds — cannot delegate: static-factory shape does not initialise subclass `this` in place) not yet transcribed as an in-place initialiser",
  );
}

/** OZCurve::OZCurve(OZCurve const&, bool) @ProChannel __ZN7OZCurveC2ERKS_b — undecoded. */
function OZCurve_copy_ctor(_self: OZCurvePercent, _src: OZCurvePercent, _flag: boolean): void {
  throw new Error(
    "OZCurve::OZCurve(OZCurve const&, bool) @ProChannel 0x1e56c (__ZN7OZCurveC2ERKS_b; call sites @0xabbde @0xabc2b; runtime decoded in OZCurveRuntime.ts as static make_copy — cannot delegate: static-factory shape does not initialise subclass `this` in place) not yet transcribed as an in-place initialiser",
  );
}

/** OZCurve::~OZCurve() @ProChannel __ZN7OZCurveD2Ev — undecoded. */
function OZCurve_dtor(_self: OZCurvePercent): void {
  throw new Error(
    "OZCurve::~OZCurve() @ProChannel 0x1e77a (__ZN7OZCurveD2Ev; call sites @0xabb3a @0xabb9b @0xabba9; runtime decoded in OZCurveRuntime.ts as instance method `destruct` — cannot delegate: reads runtime fields (extraNodes, recordingNode, splineState) that the throwing base ctor never installed on `this`) not yet reachable via this subclass",
  );
}

/** OZCurve::setSplineState(OZSplineState*) @ProChannel __ZN7OZCurve14setSplineStateEP13OZSplineState — undecoded. */
function OZCurve_setSplineState(_self: OZCurvePercent, _state: unknown): void {
  throw new Error(
    "OZCurve::setSplineState(OZSplineState*) @ProChannel 0x1ea66 (__ZN7OZCurve14setSplineStateEP13OZSplineState; call site @0xabb2a; runtime decoded in OZCurveRuntime.ts as instance method `setSplineState` — cannot delegate: reads splineState + splineNode fields the throwing base ctor never installed on `this`) not yet reachable via this subclass",
  );
}

/** OZCurvePercentSplineState::getInstance() @ProChannel 0xabb48
 *  (__ZN25OZCurvePercentSplineState11getInstanceEv). Call site @0xabb17.
 *
 *  TRANSCRIBED — delegates to OZCurvePercentSplineState.getInstance() (raw-port/src/channels/
 *  OZCurvePercentSplineState.ts) which mirrors the Meyers-singleton-via-std::call_once body
 *  @0xabb48..0xabb94 (see that file for the address-by-address decode).
 *
 *  The C++ caller (@0xabb17 in OZCurvePercent's ctor) receives a raw pointer to the singleton
 *  and immediately computes `s + 0x8` (leaq 0x8(%rax),%rsi @0xabb1c) — i.e. it wants the
 *  address of the embedded OZSplineState subobject at (singleton+0x8). In the TS port this
 *  corresponds to the `splineState_at_0x8` field on OZCurvePercentSplineState. To keep the
 *  ctor's downstream `s.addr + 0x8` arithmetic working unchanged, this thunk wraps the
 *  delegation in an `{ addr }` shim whose numeric address is opaque (the ctor's next-line
 *  cmoveq @0xabb1c..0xabb23 only cares whether the singleton pointer is null vs non-null;
 *  once we adopt a decoded OZSplineState* the shim goes away). */
function OZCurvePercentSplineState_getInstance(): { addr: number } | null {
  const s = OZCurvePercentSplineState.getInstance();
  if (s === null) {
    // Matches the disasm's `testq %rax,%rax ; cmoveq %rax,%rsi` @0xabb1c..0xabb23:
    // when getInstance returns null we propagate null so the ctor passes nullptr to setSplineState.
    return null;
  }
  // The `addr` field is an opaque provenance marker (the ctor computes addr+0x8 which the
  // decoded OZCurve_setSplineState stub then ignores — see the setSplineState stub above,
  // which throws before touching the value). Once OZCurve_setSplineState becomes a real
  // in-place initialiser, this thunk should be replaced by returning s.splineState_at_0x8
  // directly (the +0x8 arithmetic in the ctor already models `&s->splineState_at_0x8`).
  return { addr: 0x8 };
}

/** Vtable base for OZCurvePercent. The vptr stored at (this+0x0) is `&vtable + 0x10`, i.e. it
 *  skips the 16-byte Itanium ABI header (offset-to-top + typeinfo*) and points at the first
 *  virtual slot. `__ZTV14OZCurvePercent` @ProChannel — undecoded (address-only sentinel). */
const OZCurvePercent_vtable_plus_0x10: unique symbol = Symbol("__ZTV14OZCurvePercent+0x10");

export class OZCurvePercent extends OZCurve {
  /** (this+0x0) — vptr, set to `&__ZTV14OZCurvePercent + 0x10` after base construction. */
  __vptr?: symbol;

  /** OZCurvePercent::OZCurvePercent(double) @ProChannel 0xabae4 (__ZN14OZCurvePercentC2Ed).
   *  Structure (from disasm 0xabae4..0xabb33):
   *    xmm3 <- x                                            (movaps %xmm0,%xmm3 @0xabaeb)
   *    xmm1 <- *(rip+0x3a2f) = *(0xaf528) = 1.0             (movsd  @0xabaf1)
   *    xmm2 <- *(rip+0x3a87) = *(0xaf588) = 0.0001          (movsd  @0xabaf9)
   *    xmm0 <- 0.0                                           (xorps  %xmm0,%xmm0 @0xabb01)
   *    OZCurve::OZCurve(0.0, 1.0, 0.0001, x)                 (callq  @0xabb04)
   *    this->vptr = &__ZTV14OZCurvePercent + 0x10            (leaq/addq/movq @0xabb09..0xabb14)
   *    OZSplineState* s = OZCurvePercentSplineState::getInstance() (callq @0xabb17)
   *    // rsi = (s ? s + 0x8 : s) — leaq 0x8(%rax),%rsi ; testq/cmoveq @0xabb1c..0xabb23
   *    this->setSplineState(s ? s + 0x8 : nullptr)           (callq @0xabb2a)
   *  Landing pad (@0xabb34..0xabb47): on throw, invoke OZCurve::~OZCurve() and _Unwind_Resume.
   *  No fields of OZCurvePercent itself are touched — the class adds no state beyond OZCurve. */
  constructor(x: number) {
    super();
    // Constants live at file-scope in the .rodata of ProChannel:
    //   @ProChannel 0xaf528 : double 1.0     (u64 0x3ff0000000000000)
    //   @ProChannel 0xaf588 : double 0.0001  (u64 0x3f1a36e2eb1c432d)
    // Minimum is materialised inline via `xorps %xmm0,%xmm0` @0xabb01 (0.0, no rodata slot).
    const MIN_VAL = 0.0;                     // xorps %xmm0,%xmm0 @0xabb01
    const MAX_VAL = 1.0;                     // 1.0    @ProChannel 0xaf528
    const STEP = 0.0001;                     // 0.0001 @ProChannel 0xaf588
    OZCurve_ctor_bounds(this, MIN_VAL, MAX_VAL, STEP, x);
    this.__vptr = OZCurvePercent_vtable_plus_0x10;
    const s = OZCurvePercentSplineState_getInstance();
    // leaq 0x8(%rax),%rsi ; testq %rax,%rax ; cmoveq %rax,%rsi @0xabb1c..0xabb23:
    // rsi = (s != null) ? (s + 0x8) : null (i.e. pass &s->field_at_0x8, or null).
    const spline = s !== null ? { addr: s.addr + 0x8 } : null;
    OZCurve_setSplineState(this, spline);
  }

  /** OZCurvePercent::~OZCurvePercent() @ProChannel 0xabb96 (__ZN14OZCurvePercentD1Ev — non-deleting).
   *  Body @0xabb96..0xabb9b is: `pushq %rbp; movq %rsp,%rbp; popq %rbp;
   *  jmp OZCurve::~OZCurve()` — a bare tail-call to the base dtor with NO derived-class
   *  cleanup. OZCurvePercent adds no fields to destroy. */
  dtor(): void {
    // @0xabb9b: tail-call to OZCurve::~OZCurve().
    OZCurve_dtor(this);
  }

  /** OZCurvePercent::~OZCurvePercent() (D0 — deleting) @ProChannel 0xabba0 (__ZN14OZCurvePercentD0Ev).
   *    OZCurve::~OZCurve()                    (callq @0xabba9)
   *    operator delete(this)                  (jmp   @0xabbb7 to __ZdlPv stub)
   *  In TS there is no `operator delete`; that half is a no-op (GC owns the heap). */
  dtor_deleting(): void {
    OZCurve_dtor(this);
    // @0xabbb7: jmp __ZdlPv (operator delete) — no TS equivalent; the GC reclaims.
  }

  /** OZCurvePercent::getCurveWorkingCopy() @ProChannel 0xabbbc (__ZN14OZCurvePercent19getCurveWorkingCopyEv).
   *  Body (@0xabbbc..0xabbf8):
   *    p = operator new(0xb0)                          (callq __Znwm @0xabbcb)
   *    OZCurve::OZCurve(p, *this, true)                (callq __ZN7OZCurveC2ERKS_b @0xabbde, edx=1)
   *    p->vptr = &__ZTV14OZCurvePercent + 0x10         (leaq/addq/movq @0xabbe3..0xabbee)
   *    return p
   *  Landing pad (@0xabbf9..0xabc07): on throw, operator delete(p) + _Unwind_Resume. */
  getCurveWorkingCopy(): OZCurvePercent {
    // operator new(0xb0) — 176-byte allocation @0xabbc6/0xabbcb. GC-managed in TS.
    const p = Object.create(OZCurvePercent.prototype) as OZCurvePercent;
    // OZCurve::OZCurve(OZCurve const&, bool=true) — the base copy-ctor with flag=1 @0xabbde.
    OZCurve_copy_ctor(p, this, true);
    // vptr slot @0xabbe3..0xabbee.
    p.__vptr = OZCurvePercent_vtable_plus_0x10;
    return p;
  }

  /** OZCurvePercent::cloneCurve() @ProChannel 0xabc0c (__ZN14OZCurvePercent10cloneCurveEv).
   *  Identical to getCurveWorkingCopy EXCEPT the bool flag to the base copy-ctor is FALSE
   *  (xorl %edx,%edx @0xabc29) instead of 1 — the sole functional difference.
   *  Body (@0xabc0c..0xabc45):
   *    p = operator new(0xb0)                          (callq __Znwm @0xabc1b)
   *    OZCurve::OZCurve(p, *this, false)               (callq __ZN7OZCurveC2ERKS_b @0xabc2b, edx=0)
   *    p->vptr = &__ZTV14OZCurvePercent + 0x10         (leaq/addq/movq @0xabc30..0xabc3b)
   *    return p
   *  Landing pad (@0xabc46..0xabc54): matches getCurveWorkingCopy's. */
  cloneCurve(): OZCurvePercent {
    const p = Object.create(OZCurvePercent.prototype) as OZCurvePercent;
    // Same base copy-ctor, but flag=false (edx=0 @0xabc29).
    OZCurve_copy_ctor(p, this, false);
    p.__vptr = OZCurvePercent_vtable_plus_0x10;
    return p;
  }
}

// Self-check on the raw constants read out of ProChannel .rodata: verify the u64 bit patterns
// resolved above match the movsd loads in the ctor.
//  1.0    u64 = 0x3ff0000000000000  @ProChannel 0xaf528
//  0.0001 u64 = 0x3f1a36e2eb1c432d  @ProChannel 0xaf588
//  0.0                              inline via xorps %xmm0,%xmm0 @0xabb01
