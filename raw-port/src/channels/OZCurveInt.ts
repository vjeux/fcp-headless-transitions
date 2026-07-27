// OZCurveInt — an int-valued OZCurve subclass. Its value domain is the unsigned
// 32-bit int range: min = 0.0, max = 4294967295.0 (2^32 - 1 = UINT32_MAX),
// step = 1.0.  Frameworks: ProChannel (ctor + spline wiring); Ozone (the dtor +
// getCurveWorkingCopy + cloneCurve overrides shown further down).
//
// Faithful port. Decode: disasm of the 5 methods below.
//
//   Ozone symbols (nm -arch x86_64 Ozone | c++filt | grep OZCurveInt):
//     __ZN10OZCurveIntD1Ev                     @Ozone 0xc0950   OZCurveInt::~OZCurveInt()  (base D1)
//     __ZN10OZCurveIntD0Ev                     @Ozone 0xc0960   OZCurveInt::~OZCurveInt()  (deleting D0)
//     __ZN10OZCurveInt19getCurveWorkingCopyEv  @Ozone 0xc0980   OZCurveInt::getCurveWorkingCopy()
//     __ZN10OZCurveInt10cloneCurveEv           @Ozone 0xc09d0   OZCurveInt::cloneCurve()
//
//   ProChannel symbols (also nm -arch x86_64 ProChannel | c++filt):
//     __ZN10OZCurveIntC2Ed                     @ProChannel 0x461c  OZCurveInt::OZCurveInt(double)
//     __ZN10OZCurveIntD1Ev                     @ProChannel 0x46ce  (parallel base D1)
//     __ZN10OZCurveIntD0Ev                     @ProChannel 0x46da  (parallel deleting D0 — via 0x51ee8 too)
//
// Struct size: `new (0xb0)` @Ozone 0xc098f in getCurveWorkingCopy / @Ozone 0xc09df in cloneCurve —
// OZCurveInt is exactly OZCurve-sized (176 B); it adds NO fields, only the vtable and a
// spline-state singleton wired in the ctor. Same shape as OZCurveDouble / OZCurveAngle.
//
// Vtable: `__ZTV10OZCurveInt + 0x10` stored at (this+0x0) — the vptr slot
// (@ProChannel 0x4641/0x464c ; @Ozone 0xc09a7/0xc09b2 ; @Ozone 0xc09f4/0xc09ff).
//
// Base helpers we ride but haven't decoded yet (each is a throwing stub — Rule 3):
//   __ZN7OZCurveC2Edddd    OZCurve::OZCurve(double,double,double,double)      (called @ProChannel 0x463c)
//   __ZN7OZCurveC2ERKS_b   OZCurve::OZCurve(OZCurve const&, bool)             (called @Ozone 0xc09a2, @Ozone 0xc09ef)
//   __ZN7OZCurveD2Ev       OZCurve::~OZCurve()                                (called @Ozone 0xc0955, @Ozone 0xc0969; @ProChannel 0x4672)
//   __ZN7OZCurve14setSplineStateEP13OZSplineState  OZCurve::setSplineState(OZSplineState*) (called @ProChannel 0x4662)
//   __ZN21OZCurveIntSplineState11getInstanceEv    OZCurveIntSplineState::getInstance()     (called @ProChannel 0x464f)
//
// (The parser model OZCurve.ts in this file's sibling is intentionally NOT touched — it
// is the .motr keyframe container, not the runtime curve class the ctor here initialises.
// We extend it purely for the class hierarchy, matching the landed OZCurveDouble.ts pattern.)

import { OZCurve } from "./OZCurve.js";

/** OZCurve::OZCurve(double, double, double, double) @ProChannel __ZN7OZCurveC2Edddd — undecoded.
 *  Same base bounds-ctor called by OZCurveDouble.ts and OZCurveAngle-family classes.
 */
function OZCurve_ctor_bounds(
  _self: OZCurveInt,
  _minVal: number,
  _maxVal: number,
  _step: number,
  _initVal: number,
): void {
  throw new Error(
    "OZCurve::OZCurve(double,double,double,double) @ProChannel 0x0 (__ZN7OZCurveC2Edddd; call site @ProChannel 0x463c) not yet transcribed",
  );
}

/** OZCurve::OZCurve(OZCurve const&, bool) @Ozone/ProChannel __ZN7OZCurveC2ERKS_b — undecoded.
 *  Working-copy / clone base copy-ctor. edx=1 -> working copy; edx=0 -> plain clone. */
function OZCurve_copy_ctor(_self: OZCurveInt, _src: OZCurveInt, _flag: boolean): void {
  throw new Error(
    "OZCurve::OZCurve(OZCurve const&, bool) @Ozone 0x0 (__ZN7OZCurveC2ERKS_b; call sites @Ozone 0xc09a2 (edx=1) @Ozone 0xc09ef (edx=0)) not yet transcribed",
  );
}

/** OZCurve::~OZCurve() @Ozone/ProChannel __ZN7OZCurveD2Ev — undecoded.
 *  Base non-deleting destructor tail-called by both OZCurveInt destructor variants. */
function OZCurve_dtor(_self: OZCurveInt): void {
  throw new Error(
    "OZCurve::~OZCurve() @Ozone 0x0 (__ZN7OZCurveD2Ev; call sites @Ozone 0xc0955 (from D1) @Ozone 0xc0969 (from D0) @ProChannel 0x4672 (ctor landing pad)) not yet transcribed",
  );
}

/** OZCurve::setSplineState(OZSplineState*) @ProChannel __ZN7OZCurve14setSplineStateEP13OZSplineState
 *  — undecoded. Installs the spline-state singleton the ctor obtained. */
function OZCurve_setSplineState(_self: OZCurveInt, _state: unknown): void {
  throw new Error(
    "OZCurve::setSplineState(OZSplineState*) @ProChannel 0x0 (__ZN7OZCurve14setSplineStateEP13OZSplineState; call site @ProChannel 0x4662) not yet transcribed",
  );
}

/** OZCurveIntSplineState::getInstance() @ProChannel 0x4680 (__ZN21OZCurveIntSplineState11getInstanceEv).
 *  Meyers-singleton-via-call_once returning an OZCurveIntSplineState* (or null on race). Undecoded.
 *  Sibling of OZCurveDoubleSplineState::getInstance() used by OZCurveDouble.ts. */
function OZCurveIntSplineState_getInstance(): { addr: number } | null {
  throw new Error(
    "OZCurveIntSplineState::getInstance() @ProChannel 0x4680 (__ZN21OZCurveIntSplineState11getInstanceEv; call site @ProChannel 0x464f) not yet transcribed",
  );
}

/** Vtable base for OZCurveInt. The vptr stored at (this+0x0) is `&vtable + 0x10`, i.e. it
 *  skips the 16-byte Itanium ABI header (offset-to-top + typeinfo*) and points at the first
 *  virtual slot. `__ZTV10OZCurveInt` @ProChannel 0xcb720 (from nm S line) — the +0x10 slot
 *  is loaded by:
 *    - ctor          @ProChannel 0x4641/0x464c
 *    - getCurveWorkingCopy @Ozone 0xc09a7/0xc09b2
 *    - cloneCurve    @Ozone 0xc09f4/0xc09ff
 *  Held here as an address-only sentinel; the vtable's own contents (slot -> method) are
 *  not decoded in this file (that would require reading __ZTV10OZCurveInt's fixups). */
const OZCurveInt_vtable_plus_0x10: unique symbol = Symbol("__ZTV10OZCurveInt+0x10");

export class OZCurveInt extends OZCurve {
  /** (this+0x0) — vptr, set to `&__ZTV10OZCurveInt + 0x10` after base construction.
   *  See ctor / getCurveWorkingCopy / cloneCurve @-sites above. */
  __vptr?: symbol;

  /** OZCurveInt::OZCurveInt(double) @ProChannel 0x461c (__ZN10OZCurveIntC2Ed).
   *  Structure (from disasm 0x461c..0x4667):
   *    xmm3 <- x                                  (movaps %xmm0,%xmm3 @0x4623)
   *    xmm1 <- *(0xaf540) = 4294967295.0 = UINT32_MAX  (movsd 0xaaf0f(%rip),%xmm1 @0x4629)
   *    xmm2 <- *(0xaf528) = 1.0                        (movsd 0xaaeef(%rip),%xmm2 @0x4631)
   *    xmm0 <- 0.0                                     (xorps %xmm0,%xmm0 @0x4639)
   *    OZCurve::OZCurve(0.0, UINT32_MAX, 1.0, x)       (callq __ZN7OZCurveC2Edddd @0x463c)
   *    this->vptr = &__ZTV10OZCurveInt + 0x10          (leaq/addq/movq @0x4641..0x464c)
   *    OZSplineState* s = OZCurveIntSplineState::getInstance()  (callq @0x464f)
   *    // rsi = (s ? s + 0x8 : s) — leaq 0x8(%rax),%rsi ; testq/cmoveq @0x4654..0x465b
   *    this->setSplineState(s ? s + 0x8 : nullptr)     (callq @0x4662)
   *  Landing pad (@0x466c..0x467f): on throw, invoke OZCurve::~OZCurve() and _Unwind_Resume.
   *  No fields of OZCurveInt itself are touched — the class adds no state beyond OZCurve.
   *
   *  NB: the bounds arg is a double even though this is "Int" — the base OZCurve stores its
   *  min/max/step as doubles; OZCurveInt just pins them to the unsigned-32 range. */
  constructor(x: number) {
    super();
    // Constants live at file-scope in the .rodata of ProChannel:
    //   @ProChannel 0xaf540 : double 4294967295.0  (UINT32_MAX)
    //   @ProChannel 0xaf528 : double 1.0            (step)
    //   xorps %xmm0,%xmm0 @0x4639 : min = 0.0       (immediate, no .rodata site)
    const MIN_VAL = 0.0;                              // xorps @ProChannel 0x4639
    const MAX_VAL = 4294967295.0;                     // @ProChannel 0xaf540 (u64=0x41efffffffe00000)
    const STEP = 1.0;                                 // @ProChannel 0xaf528 (u64=0x3ff0000000000000)
    OZCurve_ctor_bounds(this, MIN_VAL, MAX_VAL, STEP, x);
    this.__vptr = OZCurveInt_vtable_plus_0x10;
    const s = OZCurveIntSplineState_getInstance();
    // leaq 0x8(%rax),%rsi ; testq %rax,%rax ; cmoveq %rax,%rsi @0x4654..0x465b:
    // rsi = (s != null) ? (s + 0x8) : null   (i.e. pass &s->field_at_0x8, or null).
    const spline = s !== null ? { addr: s.addr + 0x8 } : null;
    OZCurve_setSplineState(this, spline);
  }

  /** OZCurveInt::~OZCurveInt() @Ozone 0xc0950 (__ZN10OZCurveIntD1Ev — non-deleting D1).
   *  Body (@Ozone 0xc0950..0xc095a):
   *    pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *    jmp   0x6dec1c    ## symbol stub for: __ZN7OZCurveD2Ev
   *  Tail-call to the base destructor with NO derived-class cleanup. OZCurveInt owns no
   *  additional resources beyond the base OZCurve subobject. */
  dtor(): void {
    // @Ozone 0xc0955: tail-jmp to OZCurve::~OZCurve().
    OZCurve_dtor(this);
  }

  /** OZCurveInt::~OZCurveInt() (D0 — deleting) @Ozone 0xc0960 (__ZN10OZCurveIntD0Ev).
   *  Body (@Ozone 0xc0960..0xc0977):
   *    callq 0x6dec1c    ## symbol stub for: __ZN7OZCurveD2Ev   (base dtor)
   *    jmp   0x6dfc36    ## symbol stub for: __ZdlPv            (operator delete(this))
   *  In TS there is no `operator delete`; that half is a no-op (GC owns the heap). */
  dtor_deleting(): void {
    // @Ozone 0xc0969: callq OZCurve::~OZCurve().
    OZCurve_dtor(this);
    // @Ozone 0xc0977: jmp __ZdlPv (operator delete) — no TS equivalent; the GC reclaims.
  }

  /** OZCurveInt::getCurveWorkingCopy() @Ozone 0xc0980 (__ZN10OZCurveInt19getCurveWorkingCopyEv).
   *  Body (@Ozone 0xc0980..0xc09bc):
   *    p = operator new(0xb0)                          (callq __Znwm @0xc098f)
   *    OZCurve::OZCurve(p, *this, true)                (callq __ZN7OZCurveC2ERKS_b @0xc09a2, edx=1 @0xc099d)
   *    p->vptr = &__ZTV10OZCurveInt + 0x10             (leaq/addq/movq @0xc09a7..0xc09b2)
   *    return p
   *  Landing pad (@0xc09bd..0xc09cf): on throw, operator delete(p) + _Unwind_Resume. */
  getCurveWorkingCopy(): OZCurveInt {
    // operator new(0xb0) — 176-byte allocation @Ozone 0xc098a/0xc098f. GC-managed in TS.
    const p = Object.create(OZCurveInt.prototype) as OZCurveInt;
    // OZCurve::OZCurve(OZCurve const&, bool=true) — the base copy-ctor with flag=1 (edx=1 @0xc099d).
    OZCurve_copy_ctor(p, this, true);
    // vptr slot @Ozone 0xc09a7..0xc09b2.
    p.__vptr = OZCurveInt_vtable_plus_0x10;
    return p;
  }

  /** OZCurveInt::cloneCurve() @Ozone 0xc09d0 (__ZN10OZCurveInt10cloneCurveEv).
   *  Identical to getCurveWorkingCopy EXCEPT the bool flag to the base copy-ctor is FALSE
   *  (xorl %edx,%edx @0xc09ed) instead of 1 — the sole functional difference.
   *  Body (@Ozone 0xc09d0..0xc0a09):
   *    p = operator new(0xb0)                          (callq __Znwm @0xc09df)
   *    OZCurve::OZCurve(p, *this, false)               (callq __ZN7OZCurveC2ERKS_b @0xc09ef, edx=0)
   *    p->vptr = &__ZTV10OZCurveInt + 0x10             (leaq/addq/movq @0xc09f4..0xc09ff)
   *    return p
   *  Landing pad (@0xc0a0a..0xc0a1d): matches getCurveWorkingCopy's. */
  cloneCurve(): OZCurveInt {
    const p = Object.create(OZCurveInt.prototype) as OZCurveInt;
    // Same base copy-ctor, but flag=false (edx=0 @Ozone 0xc09ed).
    OZCurve_copy_ctor(p, this, false);
    p.__vptr = OZCurveInt_vtable_plus_0x10;
    return p;
  }
}

// Self-check on the raw constants read out of ProChannel .rodata: verify the u64 bit patterns
// resolved above match the movsd loads in the ctor. (Purely a compile-time sanity string;
// the actual @0xADDR resolution is documented at the constant sites and in the header comment.)
// UINT32_MAX u64 = 0x41efffffffe00000  @ProChannel 0xaf540    (double 4294967295.0)
//   1.0      u64 = 0x3ff0000000000000  @ProChannel 0xaf528    (double 1.0, step)
//   0.0      via xorps at @ProChannel 0x4639                  (double 0.0, min — no .rodata site)
