// raw-port: OZChannelDoubleImpl — Ozone.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//   Versions/A/Ozone (x86_64 thin at /tmp/Ozone.x86_64; VAs are absolute within the
//   x86_64 slice, offset 0x4000 in the on-disk fat binary).
// A leaf channel-implementation for double-valued parameters. Ledger declares 3 methods
// (one ctor + two dtor variants):
//   OZChannelDoubleImpl::OZChannelDoubleImpl()       @0x00000000000a9d10   (C2 ctor)
//   OZChannelDoubleImpl::~OZChannelDoubleImpl()      @0x00000000000a9e40   (D1 base-obj dtor)
//   OZChannelDoubleImpl::~OZChannelDoubleImpl()      @0x00000000000a9e60   (D0 deleting dtor)
//
// FIELD LAYOUT (recovered from ctor + dtor accessor offsets):
//   +0x00  vptr = &OZChannelDoubleImpl_vtable + 0x10   (installed @0xa9dd8/de3)
//   +0x08..+0x27  inherited OZChannelImpl fields (ctor'd by OZChannelImpl::C2 @0xa9dc5).
//                 Exact size 0x28 known because PCSingleton lives at +0x28 (below).
//   +0x28  PCSingleton sub-object (ctor'd @0xa9dd3 with param 0x64 = 100).
//                 The MI-thunk `__ZThn40_N19OZChannelDoubleImplD1Ev` uses "-0x28(rdi)" to
//                 back up from a PCSingleton pointer to the OZChannelDoubleImpl this-ptr —
//                 confirming PCSingleton sits at +0x28 within the enclosing class.
//   +0x28  ALSO stores the SECONDARY vtable pointer (&OZChannelDoubleImpl_vtable + 0x30)
//                 installed at the PCSingleton MI slot @0xa9dea (this is how the MI
//                 dispatch table addresses PCSingleton methods on a DoubleImpl).
//   (Total sizeof(OZChannelDoubleImpl) = 0x28 + sizeof(PCSingleton) = deferred until
//    PCSingleton is ported.)
//
// CONSTRUCTOR SEQUENCE (from disasm @0xa9d10..@0xa9df8):
//   1) heap-allocate an OZCurveDouble (size 0xb0, via operator new @stub __Znwm 0x6dfca2)
//      @0xa9d20..@0xa9d2a — save the raw pointer in local %r14.
//   2) build OZCurveDouble's OZCurve base via OZCurve::OZCurve(d,d,d,d) @stub 0x6dec16:
//        arg0 (%xmm0) = double @VA 0x707b38 = -DBL_MAX (= -1.7976931348623157e+308)
//        arg1 (%xmm1) = double @VA 0x707b40 = +DBL_MAX (= +1.7976931348623157e+308)
//        arg2 (%xmm2) = double @VA 0x705420 = 0.01                (tolerance)
//        arg3 (%xmm3) = xorps -> 0.0                              (default value)
//   3) install the OZCurveDouble vtable at (%r14): (%r14) = &OZCurveDouble_vtable + 0x10.
//   4) lazy-init the OZCurveDoubleSplineState singleton via std::__call_once:
//        - probes the guard word at OZCurveDoubleSplineState::_instanceOnce for -1
//          (already-run marker) @0xa9d68
//        - if not, calls __call_once with the __call_once_proxy lambda that eventually
//          invokes OZCurveDoubleSplineState::getInstance()
//   5) load OZCurveDoubleSplineState::_instance (a pointer), skip 8 bytes to reach the
//      SplineState body (%rsi = &_instance + 8; if _instance is null, %rsi = null).
//      Call OZCurve::setSplineState(splineState) on the curve (%r14) @stub 0x6debfe.
//   6) OZChannelImpl::OZChannelImpl(curve, 1.0, 1, 1) via stub 0x6dd9f8:
//        %rdi=this, %rsi=%r14=curve, %xmm0 = 0.0 (xorps'd — NOTE: 4th arg is xmm0),
//        %edx=1 (uint), %ecx=1 (bool). The signature is
//        `OZChannelImpl::OZChannelImpl(OZCurve*, double, uint, bool)`.
//        WAIT — the mangling __ZN13OZChannelImplC2EP7OZCurvedjb decodes to:
//        `OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool)`.
//        So the double at xmm0=0.0 is the "initial value" (or possibly a tolerance).
//   7) construct the embedded PCSingleton at (this + 0x28) via
//      PCSingleton::PCSingleton(unsigned int) @stub 0x6dd638, arg %esi = 0x64 = 100.
//   8) install BOTH vtable pointers:
//        (this)         = &OZChannelDoubleImpl_vtable + 0x10           (primary  vptr)
//        (this + 0x28)  = &OZChannelDoubleImpl_vtable + 0x30           (secondary MI vptr
//                                                                       for PCSingleton MI base)
//   The unwind cleanup fragments @0xa9df9..@0xa9e3a handle exceptions from steps 5,6,7
//   (unwinding partial state by calling the appropriate D2 destructors + operator delete
//   on the OZCurveDouble allocation).
//
// DESTRUCTORS (from Ozone.HGColorGamma-style thin-slice extraction on /tmp/Ozone.x86_64):
//   D1 @0xa9e40..@0xa9e5b (16 instrs) — the "base object destructor":
//     - call PCSingleton::~PCSingleton() on (this + 0x28) via stub 0x6dd63e.
//     - tail-jmp OZChannelImpl::~OZChannelImpl() on (this) via stub 0x6dd9fe.
//   D0 @0xa9e60..@0xa9e83 (17 instrs) — the "deleting destructor":
//     - call PCSingleton::~PCSingleton() on (this + 0x28)  @0xa9e6d
//     - call OZChannelImpl::~OZChannelImpl() on (this)     @0xa9e75
//     - tail-jmp operator delete(this) via stub 0x6dfc36    @0xa9e83
//   MI thunk `__ZThn40_...D1Ev` @0xa9e90+ adjusts %rdi by -0x28 back to the enclosing
//   this-ptr before entering D1's body — standard C++ MI-thunk pattern.
//
// ── Frontier callees (loud throw citing @0xADDR — Spec Rule 3) ────────────────────
//   operator new(unsigned long)         @stub 0x00000000006dfca2  (__Znwm ; site @0xa9d25)
//   OZCurve::OZCurve(d,d,d,d)           @stub 0x00000000006dec16  (site @0xa9d4b)
//   OZCurve::setSplineState(OZSplineState*) @stub 0x00000000006debfe (site @0xa9dad)
//   OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool)
//                                       @stub 0x00000000006dd9f8  (site @0xa9dc5)
//   OZChannelImpl::~OZChannelImpl()     @stub 0x00000000006dd9fe  (sites @0xa9dff/a9e75, D1 tail-jmp)
//   PCSingleton::PCSingleton(unsigned int) @stub 0x00000000006dd638 (site @0xa9dd3)
//   PCSingleton::~PCSingleton()         @stub 0x00000000006dd63e  (sites @0xa9e4d / a9e6d)
//   OZCurve::~OZCurve()                 @stub 0x00000000006dec1c  (unwind site @0xa9e25)
//   operator delete(void*)              @stub 0x00000000006dfc36  (sites @0xa9e12 unwind, @0xa9e2d unwind, @0xa9e83 D0 tail)
//   __Unwind_Resume                     @stub 0x00000000006dd07a  (unwind edges)
//   __call_once                         @stub 0x00000000006dfb2e  (site @0xa9d90; ONE-TIME init of OZCurveDoubleSplineState)
//   OZCurveDoubleSplineState::_instanceOnce   guard-var  @VA-loaded via LEA @0xa9d5e / a9d7e
//   OZCurveDoubleSplineState::_instance       instance-slot @VA-loaded via LEA @0xa9d95
//   OZCurveDouble vtable                @VA (unresolved — LEA @0xa9d50)
//   OZChannelDoubleImpl vtable          @VA (unresolved — LEA @0xa9dd8)
//   std::__1::__call_once_proxy<...OZCurveDoubleSplineState::getInstance()::lambda...>
//                                       @VA (unresolved — LEA @0xa9d85)

// ── Rodata (all cited @VA + @0xADDR of the RIP-rel load) ────────────────────────────
/** VA 0x0000000000707b38 — read as f64 by the ctor @0xa9d2d (xmm0 = OZCurve arg0). */
const OZCHANNEL_DOUBLE_MIN: number = -1.7976931348623157e+308; // = -Number.MAX_VALUE (-DBL_MAX)
/** VA 0x0000000000707b40 — read as f64 by the ctor @0xa9d35 (xmm1 = OZCurve arg1). */
const OZCHANNEL_DOUBLE_MAX: number = 1.7976931348623157e+308;  // = +Number.MAX_VALUE (+DBL_MAX)
/** VA 0x0000000000705420 — read as f64 by the ctor @0xa9d3d (xmm2 = OZCurve arg2). */
const OZCHANNEL_DOUBLE_TOL: number = 0.01;                     // interpolation-tolerance
/** xorps @0xa9d45 -> f64 0.0 (xmm3 = OZCurve arg3; also xmm0 for OZChannelImpl arg1). */
const OZCHANNEL_DOUBLE_ZERO: number = 0.0;

/**
 * Opaque brands for the pointer types the ctor threads through. These come from other
 * classes not yet ported; kept opaque here so downstream can pass them in without us
 * inventing an internal shape.
 */
export interface OZCurveDoubleOpaque      { readonly __ozcurvdbl: unique symbol; }
export interface OZSplineStateOpaque      { readonly __ozsplinest: unique symbol; }
export interface PCSingletonInstance      { readonly __pcsingle:   unique symbol; }
export interface OZChannelImplInstance    { readonly __ozchimpl:   unique symbol; }

/**
 * OZChannelDoubleImpl object layout (partial — full sizeof is deferred until PCSingleton is ported).
 * Fields are recovered from the ctor + dtor accessor offsets cited in the header comment.
 */
export interface OZChannelDoubleImpl {
  // +0x00 primary vptr (opaque — the target is &OZChannelDoubleImpl_vtable + 0x10).
  //       We model it as a boolean "installed" flag; the vtable itself is a distinct entity
  //       we can't fabricate without decoding the vtable structure. `null` = un-installed.
  vptrPrimaryInstalled: boolean;                                  // +0x00 vtable slot
  // +0x08..+0x27 inherited OZChannelImpl subobject (opaque brand).
  channelImplBase: OZChannelImplInstance;                          // +0x08..+0x27
  // +0x28 PCSingleton subobject. Also carries the SECONDARY vptr (+0x30 of the class vtable).
  pcSingleton: PCSingletonInstance;                                // +0x28
  // secondary vptr installed at (this + 0x28) — semantically part of the PCSingleton MI slot.
  vptrSecondaryInstalled: boolean;                                 // +0x28 (overlaps pcSingleton head)
  // The curve threaded through OZChannelImpl (owned by OZChannelImpl once ctor 6 completes).
  curve: OZCurveDoubleOpaque;
}

// ── Frontier stubs (loud throws — Spec Rule 3) ────────────────────────────────────────
/** operator new (size). Stub @0x00000000006dfca2 (__Znwm). Site @0xa9d25. */
function operator_new_size(_sz: number): OZCurveDoubleOpaque {
  throw new Error(
    "raw-port: operator new(unsigned long) not yet transcribed " +
    "(target @stub 0x00000000006dfca2 __Znwm — called from OZChannelDoubleImpl::C2 " +
    "@0x00000000000a9d25 with size 0xb0 — Ozone)",
  );
}
/** OZCurve::OZCurve(double,double,double,double). Stub @0x00000000006dec16. Site @0xa9d4b. */
function OZCurve_ctor4d(
  _p: OZCurveDoubleOpaque, _lo: number, _hi: number, _tol: number, _init: number,
): void {
  throw new Error(
    "raw-port: OZCurve::OZCurve(double,double,double,double) not yet transcribed " +
    "(target @stub 0x00000000006dec16 — called from OZChannelDoubleImpl::C2 " +
    "@0x00000000000a9d4b with args (-DBL_MAX, +DBL_MAX, 0.01, 0.0) — Ozone)",
  );
}
/** OZCurveDouble vtable install: (this) = &OZCurveDouble_vtable + 0x10. LEA @0xa9d50. */
function installOZCurveDoubleVtable(_p: OZCurveDoubleOpaque): void {
  throw new Error(
    "raw-port: install OZCurveDouble vtable (&__ZTV13OZCurveDouble + 0x10) not yet transcribed " +
    "(LEA @0x00000000000a9d50 -> store @0x00000000000a9d5b — vtable symbol unresolved — Ozone)",
  );
}
/** Get / lazy-init OZCurveDoubleSplineState singleton via std::__call_once. Site @0xa9d5e..@0xa9dad. */
function getOZCurveDoubleSplineState(): OZSplineStateOpaque | null {
  throw new Error(
    "raw-port: OZCurveDoubleSplineState::getInstance()-via-__call_once not yet transcribed " +
    "(guard @VA (LEA @0x00000000000a9d5e), instance @VA (LEA @0x00000000000a9d95), " +
    "__call_once stub @0x00000000006dfb2e, proxy lambda @VA (LEA @0x00000000000a9d85), " +
    "final OZCurve::setSplineState stub @0x00000000006debfe site @0x00000000000a9dad — Ozone)",
  );
}
/** OZCurve::setSplineState(OZSplineState*). Stub @0x00000000006debfe. Site @0xa9dad. */
function OZCurve_setSplineState(_p: OZCurveDoubleOpaque, _s: OZSplineStateOpaque | null): void {
  throw new Error(
    "raw-port: OZCurve::setSplineState(OZSplineState*) not yet transcribed " +
    "(target @stub 0x00000000006debfe — called from OZChannelDoubleImpl::C2 " +
    "@0x00000000000a9dad — Ozone)",
  );
}
/** OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool). Stub @0x00000000006dd9f8. */
function OZChannelImpl_C2(
  _this: OZChannelDoubleImpl, _curve: OZCurveDoubleOpaque,
  _initValue: number, _kindTag: number, _flag: boolean,
): void {
  throw new Error(
    "raw-port: OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool) not yet transcribed " +
    "(target @stub 0x00000000006dd9f8 — called from OZChannelDoubleImpl::C2 " +
    "@0x00000000000a9dc5 with args (curve, 0.0, 1u, true) — Ozone)",
  );
}
/** PCSingleton::PCSingleton(unsigned int). Stub @0x00000000006dd638. Site @0xa9dd3. */
function PCSingleton_C2(_this: OZChannelDoubleImpl, _seed: number): void {
  throw new Error(
    "raw-port: PCSingleton::PCSingleton(unsigned int) not yet transcribed " +
    "(target @stub 0x00000000006dd638 — called from OZChannelDoubleImpl::C2 " +
    "@0x00000000000a9dd3 with arg 0x64 = 100 (this + 0x28) — Ozone)",
  );
}
/** Install OZChannelDoubleImpl vtable pair. Base LEA @0xa9dd8. */
function installOZChannelDoubleImplVtables(_this: OZChannelDoubleImpl): void {
  throw new Error(
    "raw-port: install OZChannelDoubleImpl vtable pair not yet transcribed " +
    "(LEA @0x00000000000a9dd8 -> primary store @0x00000000000a9de3 (this) = &vtable+0x10; " +
    "secondary store @0x00000000000a9dea (this+0x28) = &vtable+0x30 — vtable symbol " +
    "__ZTV19OZChannelDoubleImpl unresolved — Ozone)",
  );
}
/** OZChannelImpl::~OZChannelImpl(). Stub @0x00000000006dd9fe. */
function OZChannelImpl_D2(_this: OZChannelDoubleImpl): void {
  throw new Error(
    "raw-port: OZChannelImpl::~OZChannelImpl() not yet transcribed " +
    "(target @stub 0x00000000006dd9fe — called from OZChannelDoubleImpl::D1 tail-jmp " +
    "@0x00000000000a9e5b and D0 body @0x00000000000a9e75 — Ozone)",
  );
}
/** PCSingleton::~PCSingleton(). Stub @0x00000000006dd63e. */
function PCSingleton_D2(_this: OZChannelDoubleImpl): void {
  throw new Error(
    "raw-port: PCSingleton::~PCSingleton() not yet transcribed " +
    "(target @stub 0x00000000006dd63e — called from OZChannelDoubleImpl::D1 @0x00000000000a9e4d " +
    "and D0 @0x00000000000a9e6d, both on (this + 0x28) — Ozone)",
  );
}
/** operator delete(void*). Stub @0x00000000006dfc36 (__ZdlPv). Site @0xa9e83 (D0 tail). */
function operator_delete(_p: OZChannelDoubleImpl): void {
  throw new Error(
    "raw-port: operator delete(void*) not yet transcribed " +
    "(target @stub 0x00000000006dfc36 __ZdlPv — called from OZChannelDoubleImpl::D0 " +
    "tail-jmp @0x00000000000a9e83 — Ozone)",
  );
}

// ── Method 0: OZChannelDoubleImpl::OZChannelDoubleImpl() (C2 ctor) ────────────────────
/**
 * OZChannelDoubleImpl::OZChannelDoubleImpl() — the C2 (complete-object) constructor.
 * @0x00000000000a9d10..0x00000000000a9df8 — 77-line body.
 *
 * See the class header comment for the full step-by-step decode. Each frontier call is
 * routed through a loud-throw stub so the ledger frontier sees the exact @0xADDR call site.
 */
export function ozChannelDoubleImpl_C2(self: OZChannelDoubleImpl): void {
  // Step 1: allocate an OZCurveDouble (0xb0 bytes). @0xa9d20..@0xa9d2a.
  const curve = operator_new_size(0xb0);
  // Step 2: build OZCurve base via OZCurve::OZCurve(-DBL_MAX, +DBL_MAX, 0.01, 0.0). @0xa9d4b.
  OZCurve_ctor4d(
    curve,
    OZCHANNEL_DOUBLE_MIN,  // xmm0 @0xa9d2d rodata @VA 0x707b38
    OZCHANNEL_DOUBLE_MAX,  // xmm1 @0xa9d35 rodata @VA 0x707b40
    OZCHANNEL_DOUBLE_TOL,  // xmm2 @0xa9d3d rodata @VA 0x705420
    OZCHANNEL_DOUBLE_ZERO, // xmm3 @0xa9d45 xorps
  );
  // Step 3: install OZCurveDouble vtable at (curve). @0xa9d50..@0xa9d5b.
  installOZCurveDoubleVtable(curve);
  // Step 4: lazy-init OZCurveDoubleSplineState singleton. @0xa9d5e..@0xa9dad.
  const splineState = getOZCurveDoubleSplineState();
  // Step 5: OZCurve::setSplineState(curve, splineState). @0xa9dad.
  OZCurve_setSplineState(curve, splineState);
  // Step 6: OZChannelImpl base ctor: (this, curve, 0.0, 1u, true). @0xa9dc5.
  OZChannelImpl_C2(self, curve, OZCHANNEL_DOUBLE_ZERO, 1, true);
  // Step 7: PCSingleton at (this + 0x28) with seed 100. @0xa9dd3.
  PCSingleton_C2(self, 0x64);
  // Step 8: install BOTH vtable slots ((this)+0 and (this)+0x28). @0xa9dd8..@0xa9dea.
  installOZChannelDoubleImplVtables(self);
  // Record the installed state in the model (opaque flag; a real port fills the vptr word).
  self.vptrPrimaryInstalled = true;
  self.vptrSecondaryInstalled = true;
  self.curve = curve;
}

// ── Method 1: OZChannelDoubleImpl::~OZChannelDoubleImpl() (D1 base-obj dtor) ─────────
/**
 * OZChannelDoubleImpl::~OZChannelDoubleImpl() — D1 base-object destructor.
 * @0x00000000000a9e40..0x00000000000a9e5b — 8 instrs.
 *
 * Disasm sequence:
 *   a9e49  addq $0x28, %rdi              // %rdi = this + 0x28 (PCSingleton base)
 *   a9e4d  callq __ZN11PCSingletonD2Ev   // PCSingleton::~PCSingleton()
 *   a9e52  movq %rbx, %rdi               // restore %rdi = this
 *   a9e5b  jmp   __ZN13OZChannelImplD2Ev // tail-jmp OZChannelImpl::~OZChannelImpl()
 */
export function ozChannelDoubleImpl_D1(self: OZChannelDoubleImpl): void {
  // @0xa9e4d — PCSingleton::~PCSingleton() on (this + 0x28)
  PCSingleton_D2(self);
  // @0xa9e5b — tail-jmp OZChannelImpl::~OZChannelImpl() on this
  OZChannelImpl_D2(self);
}

// ── Method 2: OZChannelDoubleImpl::~OZChannelDoubleImpl() (D0 deleting dtor) ─────────
/**
 * OZChannelDoubleImpl::~OZChannelDoubleImpl() — D0 deleting destructor.
 * @0x00000000000a9e60..0x00000000000a9e83 — 9 instrs.
 *
 * Disasm sequence:
 *   a9e69  addq $0x28, %rdi              // %rdi = this + 0x28
 *   a9e6d  callq PCSingleton::~PCSingleton()
 *   a9e72  movq %rbx, %rdi               // %rdi = this
 *   a9e75  callq OZChannelImpl::~OZChannelImpl()
 *   a9e7a  movq %rbx, %rdi
 *   a9e83  jmp   __ZdlPv                 // tail-jmp operator delete(this)
 */
export function ozChannelDoubleImpl_D0(self: OZChannelDoubleImpl): void {
  // @0xa9e6d — PCSingleton::~PCSingleton() on (this + 0x28)
  PCSingleton_D2(self);
  // @0xa9e75 — OZChannelImpl::~OZChannelImpl() on this
  OZChannelImpl_D2(self);
  // @0xa9e83 — tail-jmp operator delete(this)
  operator_delete(self);
}
