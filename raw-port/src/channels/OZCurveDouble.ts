// OZCurveDouble — a curve subtype whose value domain is unbounded double
// (min = -DBL_MAX, max = +DBL_MAX, step = 0.01). Framework: ProChannel.
//
// Faithful port. Decode: disasm of the 5 methods below.
//   struct size: `new (0xb0)` @0x6a11a in getCurveWorkingCopy / @0x6a16a in cloneCurve —
//   OZCurveDouble is exactly OZCurve-sized (176 B); it adds NO fields, only the vtable and
//   a spline-state singleton wired in the ctor.
//   vtable: `__ZTV13OZCurveDouble + 0x10` stored at (this+0x0) — the vptr slot (@0x397f,
//   @0x6a13e, @0x6a18b).
//
// Base helpers we ride but haven't decoded yet (each is a throwing stub — Rule 3):
//   __ZN7OZCurveC2Edddd    OZCurve::OZCurve(double,double,double,double)      (@ProChannel U-stub, called @0x3973)
//   __ZN7OZCurveC2ERKS_b   OZCurve::OZCurve(OZCurve const&, bool)             (called @0x6a132, @0x6a17f)
//   __ZN7OZCurveD2Ev       OZCurve::~OZCurve()                                (called @0x3a0d)
//   __ZN7OZCurve14setSplineStateEP13OZSplineState  OZCurve::setSplineState(...)  (called @0x3999)
//   __ZN24OZCurveDoubleSplineState11getInstanceEv OZCurveDoubleSplineState::getInstance() (called @0x3986)
//
// (The parser model OZCurve.ts in this file's sibling is intentionally NOT touched — it
// is the .motr keyframe container, not the runtime curve class the ctor here initialises.)

import { OZCurve } from "./OZCurve.js";

/** OZCurve::OZCurve(double, double, double, double) @ProChannel __ZN7OZCurveC2Edddd — undecoded.
 */
function OZCurve_ctor_bounds(
  _self: OZCurveDouble,
  _minVal: number,
  _maxVal: number,
  _step: number,
  _initVal: number,
): void {
  throw new Error(
    "OZCurve::OZCurve(double,double,double,double) @ProChannel 0x0 (__ZN7OZCurveC2Edddd U-import; call site @0x3973) not yet transcribed",
  );
}

/** OZCurve::OZCurve(OZCurve const&, bool) @ProChannel __ZN7OZCurveC2ERKS_b — undecoded.
 */
function OZCurve_copy_ctor(_self: OZCurveDouble, _src: OZCurveDouble, _flag: boolean): void {
  throw new Error(
    "OZCurve::OZCurve(OZCurve const&, bool) @ProChannel 0x0 (__ZN7OZCurveC2ERKS_b U-import; call sites @0x6a132 @0x6a17f) not yet transcribed",
  );
}

/** OZCurve::~OZCurve() @ProChannel __ZN7OZCurveD2Ev — undecoded.
 */
function OZCurve_dtor(_self: OZCurveDouble): void {
  throw new Error("OZCurve::~OZCurve() @ProChannel 0x0 (__ZN7OZCurveD2Ev U-import; call sites @0x39a9 @0x3a0d @0x6a104) not yet transcribed");
}

/** OZCurve::setSplineState(OZSplineState*) @ProChannel __ZN7OZCurve14setSplineStateEP13OZSplineState — undecoded. */
function OZCurve_setSplineState(_self: OZCurveDouble, _state: unknown): void {
  throw new Error(
    "OZCurve::setSplineState(OZSplineState*) @ProChannel 0x0 (__ZN7OZCurve14setSplineStateEP13OZSplineState U-import; call site @0x3999) not yet transcribed",
  );
}

/** OZCurveDoubleSplineState::getInstance() @ProChannel 0x39b6 (__ZN24OZCurveDoubleSplineState11getInstanceEv).
 *  Meyers-singleton-via-call_once returning an OZCurveDoubleSplineState* (or null on race). Undecoded. */
function OZCurveDoubleSplineState_getInstance(): { addr: number } | null {
  throw new Error(
    "OZCurveDoubleSplineState::getInstance() @ProChannel 0x39b6 (__ZN24OZCurveDoubleSplineState11getInstanceEv; call site @0x3986) not yet transcribed",
  );
}

/** Vtable base for OZCurveDouble. The vptr stored at (this+0x0) is `&vtable + 0x10`, i.e. it
 *  skips the 16-byte Itanium ABI header (offset-to-top + typeinfo*) and points at the first
 *  virtual slot. `__ZTV13OZCurveDouble` @ProChannel — undecoded (address-only sentinel). */
const OZCurveDouble_vtable_plus_0x10: unique symbol = Symbol("__ZTV13OZCurveDouble+0x10");

export class OZCurveDouble extends OZCurve {
  /** (this+0x0) — vptr, set to `&__ZTV13OZCurveDouble + 0x10` after base construction. */
  __vptr?: symbol;

  /** OZCurveDouble::OZCurveDouble(double) @ProChannel 0x394e (__ZN13OZCurveDoubleC2Ed).
   *  Structure (from disasm 0x394e..0x39a2):
   *    xmm3 <- x                                  (movaps %xmm0,%xmm3 @0x3955)
   *    xmm0 <- *(0xaf530) = -DBL_MAX = -1.7976931348623157e+308  (movsd @0x395b)
   *    xmm1 <- *(0xaf538) = +DBL_MAX = +1.7976931348623157e+308  (movsd @0x3963)
   *    xmm2 <- *(0xaf520) = 0.01                                  (movsd @0x396b)
   *    OZCurve::OZCurve(-DBL_MAX, +DBL_MAX, 0.01, x)              (callq  @0x3973)
   *    this->vptr = &__ZTV13OZCurveDouble + 0x10                  (leaq/addq/movq @0x3978..0x3983)
   *    OZSplineState* s = OZCurveDoubleSplineState::getInstance() (callq  @0x3986)
   *    // rsi = (s ? s + 0x8 : s) — leaq 0x8(%rax),%rsi ; testq/cmoveq @0x398b..0x3992
   *    this->setSplineState(s ? s + 0x8 : nullptr)                (callq  @0x3999)
   *  Landing pad (@0x39a3..0x39b1): on throw, invoke OZCurve::~OZCurve() and _Unwind_Resume.
   *  No fields of OZCurveDouble itself are touched — the class adds no state beyond OZCurve. */
  constructor(x: number) {
    super();
    // Constants live at file-scope in the .rodata of ProChannel:
    //   @ProChannel 0xaf530 : double -DBL_MAX
    //   @ProChannel 0xaf538 : double +DBL_MAX
    //   @ProChannel 0xaf520 : double  0.01
    const MIN_VAL = -1.7976931348623157e308; // -DBL_MAX @ProChannel 0xaf530
    const MAX_VAL = 1.7976931348623157e308;  // +DBL_MAX @ProChannel 0xaf538
    const STEP = 0.01;                        // 0.01     @ProChannel 0xaf520
    OZCurve_ctor_bounds(this, MIN_VAL, MAX_VAL, STEP, x);
    this.__vptr = OZCurveDouble_vtable_plus_0x10;
    const s = OZCurveDoubleSplineState_getInstance();
    // leaq 0x8(%rax),%rsi ; testq %rax,%rax ; cmoveq %rax,%rsi @0x398b..0x3992:
    // rsi = (s != null) ? (s + 0x8) : null   (i.e. pass &s->field_at_0x8, or null).
    const spline = s !== null ? { addr: s.addr + 0x8 } : null;
    OZCurve_setSplineState(this, spline);
  }

  /** OZCurveDouble::~OZCurveDouble() @ProChannel 0x6a104 (__ZN13OZCurveDoubleD1Ev — non-deleting).
   *  Body @Ozone 0xa96f0 (parallel build) is: `pushq %rbp; movq %rsp,%rbp; popq %rbp;
   *  jmp OZCurve::~OZCurve()` — a bare tail-call to the base dtor with NO derived-class
   *  cleanup. OZCurveDouble adds no fields to destroy.
   *
   *  ProChannel D1 @0x6a104: symmetric tail-call to `__ZN7OZCurveD2Ev`. Mirror that. */
  dtor(): void {
    // @0x6a104..: tail-call to OZCurve::~OZCurve().
    OZCurve_dtor(this);
  }

  /** OZCurveDouble::~OZCurveDouble() (D0 — deleting) @ProChannel 0x3a04 (__ZN13OZCurveDoubleD0Ev).
   *    OZCurve::~OZCurve()                    (callq @0x3a0d)
   *    operator delete(this)                  (jmp   @0x3a1b to __ZdlPv stub)
   *  In TS there is no `operator delete`; that half is a no-op (GC owns the heap). */
  dtor_deleting(): void {
    OZCurve_dtor(this);
    // @0x3a1b: jmp __ZdlPv (operator delete) — no TS equivalent; the GC reclaims.
  }

  /** OZCurveDouble::getCurveWorkingCopy() @ProChannel 0x6a110 (__ZN13OZCurveDouble19getCurveWorkingCopyEv).
   *  Body (@0x6a110..0x6a14c):
   *    p = operator new(0xb0)                          (callq __Znwm @0x6a11f)
   *    OZCurve::OZCurve(p, *this, true)                (callq __ZN7OZCurveC2ERKS_b @0x6a132, edx=1)
   *    p->vptr = &__ZTV13OZCurveDouble + 0x10          (leaq/addq/movq @0x6a137..0x6a142)
   *    return p
   *  Landing pad (@0x6a14d..0x6a15b): on throw, operator delete(p) + _Unwind_Resume. */
  getCurveWorkingCopy(): OZCurveDouble {
    // operator new(0xb0) — 176-byte allocation @0x6a11a/0x6a11f. GC-managed in TS.
    const p = Object.create(OZCurveDouble.prototype) as OZCurveDouble;
    // OZCurve::OZCurve(OZCurve const&, bool=true) — the base copy-ctor with flag=1 @0x6a132.
    OZCurve_copy_ctor(p, this, true);
    // vptr slot @0x6a137..0x6a142.
    p.__vptr = OZCurveDouble_vtable_plus_0x10;
    return p;
  }

  /** OZCurveDouble::cloneCurve() @ProChannel 0x6a160 (__ZN13OZCurveDouble10cloneCurveEv).
   *  Identical to getCurveWorkingCopy EXCEPT the bool flag to the base copy-ctor is FALSE
   *  (xorl %edx,%edx @0x6a17d) instead of 1 — the sole functional difference.
   *  Body (@0x6a160..0x6a199):
   *    p = operator new(0xb0)                          (callq __Znwm @0x6a16f)
   *    OZCurve::OZCurve(p, *this, false)               (callq __ZN7OZCurveC2ERKS_b @0x6a17f, edx=0)
   *    p->vptr = &__ZTV13OZCurveDouble + 0x10          (leaq/addq/movq @0x6a184..0x6a18f)
   *    return p
   *  Landing pad (@0x6a19a..0x6a1a8): matches getCurveWorkingCopy's. */
  cloneCurve(): OZCurveDouble {
    const p = Object.create(OZCurveDouble.prototype) as OZCurveDouble;
    // Same base copy-ctor, but flag=false (edx=0 @0x6a17d).
    OZCurve_copy_ctor(p, this, false);
    p.__vptr = OZCurveDouble_vtable_plus_0x10;
    return p;
  }
}

// Self-check on the raw constants read out of ProChannel .rodata: verify the u64 bit patterns
// resolved above match the movsd loads in the ctor. (Purely a compile-time sanity string; the
// actual @0xADDR resolution is documented at the constant sites and in the header comment.)
// -DBL_MAX u64 = 0xffefffffffffffff  @ProChannel 0xaf530
// +DBL_MAX u64 = 0x7fefffffffffffff  @ProChannel 0xaf538
//  0.01    u64 = 0x3f847ae147ae147b  @ProChannel 0xaf520
