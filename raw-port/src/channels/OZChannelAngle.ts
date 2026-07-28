// OZChannelAngle — the "angle" channel in FCP's OZChannel family (angles
// stored in radians internally, with a display-time ° suffix; see
// OZChannelAngleInfo.ts for the min/max/step display metadata).
//
// Framework: Ozone
// Provenance (raw-port/re/disasm/OZChannelAngle.*.s):
//   createOZChannelAngleCurve(double)                  @0x000ac100  (__ZN14OZChannelAngle25createOZChannelAngleCurveEd)
//   OZChannelAngle(PCString&, OZChannelFolder*, u, u, OZChannelImpl*, OZChannelInfo*)
//                                                      @0x01d5340  (__ZN14OZChannelAngleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo)
//   OZChannelAngle(double, PCString&, OZChannelFolder*, u, u, OZChannelImpl*, OZChannelInfo*)
//                                                      @0x000ac3e0  (__ZN14OZChannelAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo)
//
// Callees / RIP-relative refs (resolved via raw-port/army/tools/resolve.py Ozone ...):
//   __Znwm                                              // operator new(unsigned long)
//   __ZN7OZCurveC2Edddd                                 // OZCurve::OZCurve(double,double,double,double)
//   __ZTV12OZCurveAngle                                 // vtable for OZCurveAngle (used at +0x10)
//   __ZN23OZCurveAngleSplineState13_instanceOnceE       // std::once_flag for the SplineState singleton
//   __ZN23OZCurveAngleSplineState9_instanceE            // singleton instance pointer
//   __ZNSt3__117__call_once_proxyB9nqe210106<...>_EEEEEvPv  // std::__call_once_proxy stub
//   __ZNSt3__111__call_onceERVmPvPFvS2_E                // std::__1::__call_once entry point
//   __ZN7OZCurve14setSplineStateEP13OZSplineState       // OZCurve::setSplineState
//   __ZdlPv                                              // operator delete(void*) (unwind paths)
//   __ZN7OZCurveD2Ev                                    // OZCurve::~OZCurve() (unwind paths)
//   __Unwind_Resume
//   __Z29getOZChannelAngle_FactoryBasev                 // free fn returning OZFactory*
//   __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//                                                       // OZChannel base ctor
//   __ZTV14OZChannelAngle                                // this class's vtable (primary +0x10 / secondary +0x370)
//   __ZZN14OZChannelAngle24createOZChannelAngleInfoEvE24_OZChannelAngleInfo_once  // once flag
//   __ZZN14OZChannelAngle24createOZChannelAngleImplEvE24_OZChannelAngleImpl_once  // once flag
//   __ZN14OZChannelAngle19_OZChannelAngleInfoE          // singleton info pointer
//   __ZN14OZChannelAngle19_OZChannelAngleImplE          // singleton impl pointer
//   __ZN9OZChannel15setDefaultValueEd
//   __ZN9OZChannel15setInitialValueEdb
//   __ZN9OZChannelD2Ev                                   // OZChannel::~OZChannel() (unwind)
//
// STRUCT LAYOUT (from the three method bodies — partial):
//   +0x000  primary vptr        (=vtable[OZChannelAngle]+0x10)
//   +0x010  secondary vptr      (=vtable[OZChannelAngle]+0x370)
//   +0x070  OZChannelImpl*  impl  (mirror of +0x78)
//   +0x078  OZChannelImpl*  impl  (initial slot; base ctor writes here from caller arg)
//   +0x080  OZChannelInfo*  info  (mirror of +0x88)
//   +0x088  OZChannelInfo*  info  (initial slot; base ctor writes here)
//   [rest of the layout inherited from OZChannel; not touched by these methods]
//
// The mirror-write pattern (writing the same pointer to both +0x70/+0x78 or
// +0x80/+0x88) matches OZChannelDouble exactly — the base ctor deposits at
// the higher offset and the derived ctor decides whether to keep the caller-
// supplied pointer (mirror it down) or to replace with the once-initialized
// per-class default (which is written to BOTH slots).

import type { OZChannelFolder, OZChannelImpl, OZChannelInfo, OZFactory, OZSplineState } from './OZChannelDouble';
import type { OZCurve } from './OZCurve';

// -------------------------------- Frontier stubs -------------------------------
//
// Everything below is a THROWing stub whose message cites the exact @0xADDR at
// which it is called. Each represents an un-decoded callee we transcribe as a
// "demand signal" rather than fabricating a body. (Matches the OZChannelDouble
// convention already established in this project — see
// raw-port/src/channels/OZChannelDouble.ts.)

/** External free function `__Z29getOZChannelAngle_FactoryBasev` @Ozone U-extern (from ProChannel).
 *  Called @0x1d5364 and @0xac40d. NOT yet decoded. */
function getOZChannelAngle_FactoryBase(): OZFactory {
  throw new Error(
    "getOZChannelAngle_FactoryBase() @Ozone U-extern __Z29getOZChannelAngle_FactoryBasev " +
    "(defined in ProChannel; not yet transcribed) — called by OZChannelAngle ctors " +
    "@Ozone 0x1d5364 and 0xac40d",
  );
}

/** External `__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 *  — OZChannel base ctor (ProChannel-defined). Called from both OZChannelAngle ctors at
 *  @0x1d538d and @0xac433. */
function OZChannel_base_ctor(
  _self: OZChannelAngle,
  _factory: OZFactory,
  _name: string,
  _folder: OZChannelFolder | null,
  _uint1: number,
  _uint2: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, uint, uint, " +
    "OZChannelImpl*, OZChannelInfo*) @Ozone U-extern " +
    "__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo " +
    "(defined in ProChannel; not yet transcribed) — invoked by OZChannelAngle ctors " +
    "@Ozone 0x1d538d and 0xac433",
  );
}

/** External `__ZN9OZChannel15setDefaultValueEd` — called @0xac51b (double-variant ctor only). */
function OZChannel_setDefaultValue(_self: OZChannelAngle, _v: number): void {
  throw new Error(
    "OZChannel::setDefaultValue(double) @Ozone U-extern __ZN9OZChannel15setDefaultValueEd " +
    "(defined in ProChannel; not yet transcribed) — invoked by " +
    "OZChannelAngle(double, PCString&, ...) @Ozone 0xac51b",
  );
}

/** External `__ZN9OZChannel15setInitialValueEdb` — called @0xac52a. The bool is `xorl %esi,%esi`
 *  @0xac528, i.e. ALWAYS false. */
function OZChannel_setInitialValue(_self: OZChannelAngle, _v: number, _keyframed: boolean): void {
  throw new Error(
    "OZChannel::setInitialValue(double, bool) @Ozone U-extern __ZN9OZChannel15setInitialValueEdb " +
    "(defined in ProChannel; not yet transcribed) — invoked by " +
    "OZChannelAngle(double, PCString&, ...) @Ozone 0xac52a",
  );
}

/** OZChannelAngle::createOZChannelAngleInfo() — lambda under `_OZChannelAngleInfo_once`, bound
 *  through `std::__call_once_proxy`. Populates the `_OZChannelAngleInfo` global pointer.
 *  Referenced by both ctors @0x1d53aa-d9 and @0xac450-7f. NOT yet decoded. */
function createOZChannelAngleInfo_default(): OZChannelInfo {
  throw new Error(
    "OZChannelAngle::createOZChannelAngleInfo() (lambda under _OZChannelAngleInfo_once) @Ozone — " +
    "bound via __ZNSt3__117__call_once_proxyB9nqe210106<...OZChannelAngle::createOZChannelAngleInfo::lambda...>Pv. " +
    "Not yet decoded; populates __ZN14OZChannelAngle19_OZChannelAngleInfoE (loaded @0x1d5402 / 0xac4a8).",
  );
}

/** OZChannelAngle::createOZChannelAngleImpl() — lambda under `_OZChannelAngleImpl_once`, bound
 *  through `std::__call_once_proxy`. Populates the `_OZChannelAngleImpl` global pointer.
 *  Referenced by both ctors @0x1d53f3-449 and @0xac499-4ef. NOT yet decoded. */
function createOZChannelAngleImpl_default(): OZChannelImpl {
  throw new Error(
    "OZChannelAngle::createOZChannelAngleImpl() (lambda under _OZChannelAngleImpl_once) @Ozone — " +
    "bound via __ZNSt3__117__call_once_proxyB9nqe210106<...OZChannelAngle::createOZChannelAngleImpl::lambda...>Pv. " +
    "Not yet decoded; populates __ZN14OZChannelAngle19_OZChannelAngleImplE (loaded @0x1d545b / 0xac501).",
  );
}

/** OZCurve::OZCurve(double, double, double, double) @Ozone U-extern __ZN7OZCurveC2Edddd
 *  (defined in ProChannel; not yet transcribed) — called @0xac13d from createOZChannelAngleCurve. */
function OZCurve_ctor4d(_self: OZCurve, _minVal: number, _maxVal: number, _step: number, _initVal: number): void {
  throw new Error(
    "OZCurve::OZCurve(double,double,double,double) @Ozone U-extern __ZN7OZCurveC2Edddd " +
    "(defined in ProChannel; not yet transcribed) — invoked by " +
    "OZChannelAngle::createOZChannelAngleCurve @Ozone 0xac13d",
  );
}

/** OZCurve::setSplineState(OZSplineState*) @Ozone U-extern __ZN7OZCurve14setSplineStateEP13OZSplineState
 *  (defined in ProChannel; not yet transcribed) — called @0xac19f. */
function OZCurve_setSplineState(_self: OZCurve, _s: OZSplineState | null): void {
  throw new Error(
    "OZCurve::setSplineState(OZSplineState*) @Ozone U-extern " +
    "__ZN7OZCurve14setSplineStateEP13OZSplineState (defined in ProChannel; not yet transcribed) " +
    "— invoked by OZChannelAngle::createOZChannelAngleCurve @Ozone 0xac19f",
  );
}

/** OZCurveAngleSplineState::getInstance() (Ozone-local; once-guarded via
 *  __ZN23OZCurveAngleSplineState13_instanceOnceE / _instanceE globals). NOT yet decoded here
 *  even though `raw-port/src/channels/OZCurveAngleSplineState.ts` exists as a TS wrapper —
 *  the underlying lambda body that FILLS the singleton is still a frontier. */
function OZCurveAngleSplineState_getInstance(): OZSplineState {
  throw new Error(
    "OZCurveAngleSplineState::getInstance() @Ozone — once-guarded via " +
    "__ZN23OZCurveAngleSplineState13_instanceOnceE and __ZN23OZCurveAngleSplineState9_instanceE. " +
    "Lambda body (bound through std::__call_once_proxy) not yet decoded. Referenced by " +
    "OZChannelAngle::createOZChannelAngleCurve @Ozone 0xac187-0xac198 (the loaded instance " +
    "pointer, offset by +0x8 to skip its vtable slot, is passed to OZCurve::setSplineState).",
  );
}

// -----------------------------------------------------------------------------

/**
 * The concrete `OZCurve` returned by `createOZChannelAngleCurve()`. It's an
 * `OZCurveAngle` at the C++ level (its vtable pointer @0xac142 is
 * `__ZTV12OZCurveAngle + 0x10`), but we model it as the base `OZCurve`
 * because none of these three methods actually touch OZCurveAngle-specific
 * fields — the entire post-ctor work goes through the base `setSplineState`.
 */
export interface OZCurveAngleShape extends OZCurve {
  readonly __brand: 'OZCurveAngle';
}

/**
 * OZChannelAngle — see file header. The class body is the two ctors + the
 * `createOZChannelAngleCurve` static factory. No other methods are decoded
 * in this framework slice (`nm` lists exactly these 3 T-symbols under
 * `__ZN14OZChannelAngle*` outside of the Impl subclass).
 *
 * NB: TS does NOT extend `OZChannel` here — the base ctor is a frontier stub
 * (see OZChannel_base_ctor above @0x1d538d/@0xac433), so extending would only
 * pull in fields we cannot yet populate faithfully. We model the two derived
 * vptr slots implicitly and store the `info`/`impl` pointers directly.
 */
export class OZChannelAngle {
  /** Primary vptr — @0x1d5399 / @0xac43f stores `__ZTV14OZChannelAngle + 0x10` at (this+0). Implicit in JS. */
  // (vtable slot is implicit)

  /** Secondary vptr — @0x1d53a6 / @0xac44c stores `__ZTV14OZChannelAngle + 0x370` at (this+0x10). Implicit. */
  // (secondary vtable slot is implicit)

  /** OZChannelImpl* at C++ offset +0x70. Set by both ctors from either caller arg (mirror of
   *  +0x78) or the once-guarded `_OZChannelAngleImpl` global. @Ozone writes: 0x1d5469 / 0xac50f. */
  impl!: OZChannelImpl;

  /** OZChannelInfo* at C++ offset +0x80. Same pattern as `impl` but at +0x80/+0x88.
   *  @Ozone writes: 0x1d53ec/0x1d5413 / 0xac492/0xac4b9. */
  info!: OZChannelInfo;

  /**
   * OZChannelAngle::OZChannelAngle(PCString const& name, OZChannelFolder* folder,
   *   unsigned int uint1, unsigned int uint2, OZChannelImpl* impl, OZChannelInfo* info) @0x01d5340.
   *
   * Faithful transcription (see re/disasm/OZChannelAngle.OZChannelAngle.s):
   *   1. Save regs: rsi=name (r14 backup), rdx=folder (r13), ecx=uint1 (r12d), r8d=uint2 spilled
   *      to -0x44(%rbp), r9=impl (r15), rdi=this (rbx); stack-arg info at 0x10(%rbp) (7th arg,
   *      SysV: stack). (@0x1d5344-61)
   *   2. Call `getOZChannelAngle_FactoryBase()` -> rax (factory). @0x1d5364
   *   3. Put stack-arg info (0x10(%rbp)) at [rsp+0x8]; put impl (r15) at [rsp]. Save r15 to
   *      -0x50(%rbp). @0x1d5369-76
   *   4. Call OZChannel::OZChannel(this, factory, name, folder, uint1, uint2, impl, info). @0x1d538d
   *   5. Store primary vptr `__ZTV14OZChannelAngle + 0x10` at (this+0x00). @0x1d5392-9d
   *   6. Store secondary vptr `__ZTV14OZChannelAngle + 0x370` at (this+0x10). @0x1d53a0-a6
   *   7. `std::call_once(_OZChannelAngleInfo_once, createOZChannelAngleInfo)` @0x1d53aa-d9 —
   *      only if the once flag != -1 sentinel (the "already-done" fast path).
   *   8. Info-slot fixup — reads STACK slot at 0x10(%rbp) (i.e. the `info` arg) @0x1d53de:
   *        if (info != NULL) mirror (this+0x88) -> (this+0x80).   @0x1d53e5-ec
   *        else load `_OZChannelAngleInfo` and store to BOTH +0x88 and +0x80.   @0x1d5402-13
   *      Both paths fall through to step 9.
   *   9. `std::call_once(_OZChannelAngleImpl_once, createOZChannelAngleImpl)` @0x1d53f3-449 —
   *      same "already-done" gate.
   *   10. Impl-slot fixup — reads -0x50(%rbp) (i.e. the saved impl arg) @0x1d544e:
   *         if (impl != NULL) load (this+0x78) into rax @0x1d5455 (mirror-source).
   *         else load `_OZChannelAngleImpl` and store to (this+0x78). @0x1d545b-65
   *       Then unconditionally store rax to (this+0x70). @0x1d5469
   *   Exception path @0x1d547c-8a: `OZChannel::~OZChannel()` + `_Unwind_Resume`.
   */
  static newNamed(
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelAngle {
    const self = new OZChannelAngle();

    // Step 2 — @0x1d5364.
    const factory = getOZChannelAngle_FactoryBase(); // frontier throw

    // Step 4 — @0x1d538d.
    OZChannel_base_ctor(self, factory, name, folder, uint1, uint2, impl, info);
    // Steps 5-6 — vptrs implicit.

    // Steps 7-8 — info at (+0x88/+0x80). @0x1d53de reads STACK 0x10(%rbp) (the `info` arg).
    if (info !== null) {
      // mirror +0x88 -> +0x80.  @0x1d53e5-ec
      self.info = info;
    } else {
      // load `_OZChannelAngleInfo` singleton (once-init'd @0x1d53aa-d9), store in both.
      // @0x1d5402-13
      self.info = createOZChannelAngleInfo_default(); // frontier throw
    }

    // Steps 9-10 — impl at (+0x78/+0x70). @0x1d544e reads -0x50(%rbp) (the saved impl arg).
    if (impl !== null) {
      // mirror +0x78 -> +0x70.  @0x1d5455
      self.impl = impl;
    } else {
      // load `_OZChannelAngleImpl` singleton, store in both.  @0x1d545b-65
      self.impl = createOZChannelAngleImpl_default(); // frontier throw
    }

    return self;
  }

  /**
   * OZChannelAngle::OZChannelAngle(double initialValue, PCString const& name,
   *   OZChannelFolder* folder, unsigned int uint1, unsigned int uint2,
   *   OZChannelImpl* impl, OZChannelInfo* info) @0x000ac3e0.
   *
   * See re/disasm/OZChannelAngle.C2EdRK.s. Body is IDENTICAL to newNamed() up
   * through the singleton fixup, then TWO trailing calls:
   *   • OZChannel::setDefaultValue(this, initialValue)          — @0xac51b
   *   • OZChannel::setInitialValue(this, initialValue, false)   — @0xac52a (esi=0)
   * xmm0 (initialValue) is spilled to -0x50(%rbp) @0xac401 and reloaded twice
   * (@0xac516 / @0xac523) so both calls see the identical bit-pattern.
   *
   * NB the arg-slot layout for this ctor variant:
   *   xmm0 = initialValue        (spilled to -0x50(%rbp) @0xac401)
   *   rsi  = name (r14 backup)
   *   rdx  = folder (r13)
   *   ecx  = uint1 (spilled to -0x44 @0xac3f8)
   *   r8d  = uint2 (spilled to -0x48 @0xac3f4)
   *   r9   = impl (r15; also saved to -0x58 @0xac417 for the null-check @0xac4f4)
   *   0x10(%rbp) = info (7th arg, SysV stack; loaded to r12 @0xac409, null-checked @0xac484)
   *
   * IMPORTANT — the info-null check uses `0x10(%rbp)` @0xac484 (matching
   * newNamed above; the info-arg still lives on the stack), and the
   * impl-null check uses `-0x58(%rbp)` @0xac4f4 (the saved r15). Same pattern
   * as newNamed, just with different spill slots.
   */
  static newDouble(
    initialValue: number,
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelAngle {
    const self = new OZChannelAngle();

    // @0xac40d.
    const factory = getOZChannelAngle_FactoryBase(); // frontier throw

    // @0xac433.
    OZChannel_base_ctor(self, factory, name, folder, uint1, uint2, impl, info);
    // Vptrs implicit @0xac438-4c.

    // Info fixup.  @0xac484 tests the STACK info arg.
    if (info !== null) {
      self.info = info;                                     // @0xac48b-92
    } else {
      self.info = createOZChannelAngleInfo_default();       // frontier throw @0xac4a8-b9
    }

    // Impl fixup.  @0xac4f4 tests -0x58(%rbp) (saved r15).
    if (impl !== null) {
      self.impl = impl;                                     // @0xac4fb
    } else {
      self.impl = createOZChannelAngleImpl_default();       // frontier throw @0xac501-0b
    }

    // Trailing set-values — @0xac51b / @0xac52a. Both calls pass the SAME
    // saved bit-pattern from -0x50(%rbp) (no NaN games).
    OZChannel_setDefaultValue(self, initialValue);            // frontier throw
    OZChannel_setInitialValue(self, initialValue, false);     // frontier throw (esi=0 @0xac528)

    return self;
  }

  /**
   * OZChannelAngle::createOZChannelAngleCurve(double angle) @0x000ac100.
   *
   * See re/disasm/OZChannelAngle.createOZChannelAngleCurve.s. Faithful:
   *   1. Spill xmm0 (`angle`) to -0x20(%rbp). @0xac10b
   *   2. `operator new(0xb0)` @0xac110-1a — 176-byte allocation (== sizeof(OZCurveAngle)).
   *   3. Load three RIP-relative doubles:
   *        xmm0 = *(0xac125 + 0x65ba13) = *0x707b38 = -DBL_MAX
   *                                                   (u64 0xffefffffffffffff = -1.7976931348623157e+308)
   *        xmm1 = *(0xac12d + 0x65ba13) = *0x707b40 = +DBL_MAX
   *                                                   (u64 0x7fefffffffffffff = +1.7976931348623157e+308)
   *        xmm2 = *(0xac135 + 0x65ba33) = *0x707b68 = 0.00017453292519943296
   *                                                   (u64 0x3f2626e05a695f81 = deg2rad(0.01°) = π/18000)
   *        xmm3 = -0x20(%rbp)                       = `angle` (the caller-supplied initial value).
   *      The three constants were verified by direct binary read from the Ozone x86_64 slice
   *      (file offset 0x4000 + VA). Notably, the STEP matches the OZChannelAngleInfo constant
   *      `OZ_CHANNEL_ANGLE_INFO_STEP_FINE_RAD` @0xaf560 in ./OZChannelAngleInfo.ts (both encode
   *      deg2rad(0.01°) as the same bit-pattern).
   *   4. Call OZCurve::OZCurve(new_obj, -DBL_MAX, +DBL_MAX, deg2rad(0.01°), angle). @0xac13d
   *   5. Store `__ZTV12OZCurveAngle + 0x10` at (new_obj+0). @0xac142-4d — the OZCurveAngle vptr.
   *   6. `std::call_once(OZCurveAngleSplineState::_instanceOnce,
   *                       OZCurveAngleSplineState::getInstance-lambda)` @0xac150-82.
   *   7. Load `OZCurveAngleSplineState::_instance` @0xac187-8e (a data slot holding the class
   *      instance pointer). Compute `rsi = &instance + 0x8` @0xac191 (offset past the instance's
   *      own vtable slot to the OZSplineState-shaped payload). BUT if instance == nullptr,
   *      `cmoveq %rax, %rsi` @0xac198 restores rsi = nullptr — i.e. "no spline state yet"
   *      (unlikely on the second-and-later calls).
   *   8. Call OZCurve::setSplineState(new_obj, rsi). @0xac19f
   *   9. Return new_obj. @0xac1a4-af
   *
   * Exception paths @0xac1b0-d9: two variants — one before the OZCurve ctor completed
   * (operator delete only), one after (OZCurve::~OZCurve then operator delete), each rethrows.
   */
  static createOZChannelAngleCurve(angle: number): OZCurveAngleShape {
    // Step 2 — @0xac110-1a: sizeof = 0xb0 == 176. TS allocates via a plain object shape.
    const curve = Object.create(null) as OZCurveAngleShape;

    // Step 3 constants — read from the Ozone binary at the addresses cited above.
    // All three are IEEE-754 doubles; no float narrowing (no `Math.fround`) — the underlying
    // OZCurve ctor is `OZCurveC2Edddd` (four doubles).
    const MIN_VAL: number = -Number.MAX_VALUE;                 // @Ozone 0x707b38  -DBL_MAX
    const MAX_VAL: number =  Number.MAX_VALUE;                 // @Ozone 0x707b40  +DBL_MAX
    const STEP: number    = 0.00017453292519943296;            // @Ozone 0x707b68  deg2rad(0.01°) = π/18000

    // Step 4 — @0xac13d. Frontier throw (OZCurve ctor is ProChannel-side and not yet transcribed).
    OZCurve_ctor4d(curve, MIN_VAL, MAX_VAL, STEP, angle);
    // Step 5 — vptr write is implicit in the class shape.

    // Steps 6-8 — the shared OZCurveAngleSplineState singleton. Frontier throws.
    const state = OZCurveAngleSplineState_getInstance();
    OZCurve_setSplineState(curve, state);

    return curve;
  }
}
