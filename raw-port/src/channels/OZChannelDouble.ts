// OZChannelDouble — a leaf scalar-double animatable channel (Ozone.framework). Extends
// ProChannel's OZChannel base with a distinguished vtable + a fixed "double" impl/info pair.
//
// FAITHFUL PORT. Every function cites its `@Ozone 0xADDR` from
// re/disasm/__ZN15OZChannelDouble*.s. Every constant / offset cites the address it was read
// from. Undecoded base callees throw citing their `@Ozone 0xADDR` (Rule 3 / ANTI_SHORTCUT).
//
// STRUCT LAYOUT (recovered from the 5 method bodies below; sizeof reported by
// `nm` on __ZN15OZChannelDouble* is not published — the class adds NO fields beyond OZChannel,
// only two vtable slots and the two info/impl singleton slots that OZChannel already owns):
//
//   +0x000   primary vptr        ; set to `__ZTV15OZChannelDouble + 0x10`
//                                  (@0x4ede83 / @0xc01fd / @0xa9a53 / @0xf5d0d — leaq 0x10(%rax))
//   +0x010   secondary vptr      ; set to `__ZTV15OZChannelDouble + 0x370`
//                                  (@0x4ede8a-90 / @0xc0200-06 / @0xa9a56-5c / @0xf5d10-16 —
//                                   `addq $0x370,%rax; movq %rax, 0x10(%rbx)`).
//                                  This is the DR-vtable slot for the secondary base subobject
//                                  installed by OZChannel::OZChannel — the offset 0x370 into
//                                  the vtable is where the second sub-table lives.
//   +0x070   OZChannelImpl* impl_primary
//                                ; @0xa9b1f `movq %rax, 0x70(%rbx)` after choosing between
//                                  +0x78 (caller-supplied path) or `_OZChannelDoubleImpl` singleton.
//   +0x078   OZChannelImpl* impl_secondary (OZChannel base owns this slot — the ctor merely
//                                MIRRORS it when the caller didn't supply one)
//   +0x080   OZChannelInfo* info_primary
//                                ; @0xa9ac9 `movq %rax, 0x80(%rbx)`.
//   +0x088   OZChannelInfo* info_secondary
//                                ; OZChannel base ctor already wrote the caller-supplied info
//                                  here; we read it back at @0xa9a9b.
//
// The two `once`-guarded singletons this class owns:
//   _OZChannelDoubleInfo  (data symbol @Ozone U-extern __ZN15OZChannelDouble20_OZChannelDoubleInfoE)
//     — populated by `createOZChannelDoubleInfo()` under `_OZChannelDoubleInfo_once`.
//   _OZChannelDoubleImpl  (data symbol @Ozone U-extern __ZN15OZChannelDouble20_OZChannelDoubleImplE)
//     — populated by `createOZChannelDoubleImpl()` under `_OZChannelDoubleImpl_once`.
// Both lambdas are only visible via std::once_proxy stubs in the framework (see
// __ZNSt3__117__call_once_proxyB9nqe210106... symbols) and are NOT yet decoded — the "install
// default singleton" paths therefore throw citing their @Ozone addresses.
//
// FRONTIER (undecoded base + factory callees this file's ctors JUMP into):
//   __Z30getOZChannelDouble_FactoryBasev            (external, from ProChannel)  — called
//     @0xc01c4 / @0xa9a1d / @0xf5cd8 to get the OZFactory* the PCString/dbl/int ctors delegate with.
//   __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//     (external, from ProChannel) — the OZChannel base ctor; called from ALL FOUR ctors.
//   __ZN9OZChannel15setDefaultValueEd    (external, from ProChannel) — @0xa9b2b / @0xf5dea.
//   __ZN9OZChannel15setInitialValueEdb   (external, from ProChannel) — @0xa9b3a / @0xf5df9.
//   __ZN9OZChannelD2Ev                   (external, from ProChannel) — the base dtor for the
//     exception-unwind epilogue (@0x4edf64 / @0xc02e2 / @0xa9b54 / @0xf5e13).
//   __ZN7OZCurveC2Edddd                  (external, from ProChannel) — OZCurve(double,double,
//     double,double) ctor called by createOZChannelDoubleCurve @0xa95ad.
//   __ZN7OZCurve14setSplineStateEP13OZSplineState  (external, from ProChannel) — @0xa960f.
//   __ZN24OZCurveDoubleSplineState11getInstanceEv  (Ozone-local, once-guarded via
//     __ZN24OZCurveDoubleSplineState13_instanceOnceE / _instanceE data slots) — installed as the
//     spline state on the newly-built OZCurveDouble.
//
// vtable + secondary vtable symbol `__ZTV15OZChannelDouble` is EXTERNAL — resolve.py returns
// "no vtable for OZChannelDouble" against Ozone, meaning it lives in the linked binary at runtime
// but this framework object only references it.

import { OZChannel } from "./OZChannel.js";
import { OZCurve } from "./OZCurve.js";

// ---------------------------------------------------------------------------------------------
// Local frontier type aliases + throwing stubs. These exist purely so the OZChannelDouble body
// typechecks. Every real invocation throws citing its @Ozone (or ProChannel) address per Rule 3.
// ---------------------------------------------------------------------------------------------

/** OZChannelInfo* — descriptor object slot. Base class not yet ported in Ozone; the ProChannel
 *  variant lives in OZChannelDoubleInfo.ts (a sibling info descriptor). Kept opaque here. */
export interface OZChannelInfo { readonly __brand: "OZChannelInfo"; }

/** OZChannelImpl* — implementation-detail slot. Base class not yet ported. Opaque here. */
export interface OZChannelImpl { readonly __brand: "OZChannelImpl"; }

/** OZChannelFolder* — parent folder (nullable). Existing sibling file OZChannelFolder.ts covers
 *  its layout; forward-referenced opaquely here to keep this file to one class. */
export interface OZChannelFolder { readonly __brand: "OZChannelFolder"; }

/** OZFactory* — the base factory owning descriptor + impl singletons. Opaque here. */
export interface OZFactory { readonly __brand: "OZFactory"; }

/** OZSplineState* — the shared spline-state singleton attached to every OZCurveDouble via
 *  OZCurve::setSplineState. Opaque here (transcribed with OZSplineState.ts). */
export interface OZSplineState { readonly __brand: "OZSplineState"; }

/** OZCurveDouble = the scalar-double specialization of OZCurve. It sits in a sibling file
 *  (OZCurveDouble.ts) that itself is a faithful port. We re-declare only the public shape the
 *  createOZChannelDoubleCurve() factory needs to fill in. */
export interface OZCurveDouble extends OZCurve {
  splineState?: OZSplineState;
}

/** External free function `__Z30getOZChannelDouble_FactoryBasev` @Ozone U-extern (from ProChannel).
 *  Called @0xc01c4 / @0xa9a1d / @0xf5cd8. NOT yet decoded. */
function getOZChannelDouble_FactoryBase(): OZFactory {
  throw new Error(
    "getOZChannelDouble_FactoryBase() @Ozone U-extern __Z30getOZChannelDouble_FactoryBasev " +
    "(defined in ProChannel; not yet transcribed) — called by OZChannelDouble ctors " +
    "@Ozone 0xc01c4 / 0xa9a1d / 0xf5cd8"
  );
}

/** External `__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 *  — OZChannel base ctor (ProChannel-defined). Called from every OZChannelDouble ctor at
 *  @0x4ede77 / @0xc01ed / @0xa9a43 / @0xf5cfd. */
function OZChannel_base_ctor(
  _self: OZChannelDouble,
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
    "(defined in ProChannel; not yet transcribed) — invoked by every OZChannelDouble ctor " +
    "@Ozone 0x4ede77 / 0xc01ed / 0xa9a43 / 0xf5cfd"
  );
}

/** External `__ZN9OZChannel15setDefaultValueEd` — called @0xa9b2b / @0xf5dea. */
function OZChannel_setDefaultValue(_self: OZChannelDouble, _v: number): void {
  throw new Error(
    "OZChannel::setDefaultValue(double) @Ozone U-extern __ZN9OZChannel15setDefaultValueEd " +
    "(defined in ProChannel; not yet transcribed) — invoked by OZChannelDouble(double,...) " +
    "@Ozone 0xa9b2b and OZChannelDouble(int,...) @Ozone 0xf5dea"
  );
}

/** External `__ZN9OZChannel15setInitialValueEdb` — called @0xa9b3a / @0xf5df9. Two args: (double,
 *  bool keyframed). The bool is `xorl %esi,%esi` in both call sites (@0xa9b38 / @0xf5df7), i.e.
 *  ALWAYS false. */
function OZChannel_setInitialValue(_self: OZChannelDouble, _v: number, _keyframed: boolean): void {
  throw new Error(
    "OZChannel::setInitialValue(double, bool) @Ozone U-extern __ZN9OZChannel15setInitialValueEdb " +
    "(defined in ProChannel; not yet transcribed) — invoked by OZChannelDouble(double,...) " +
    "@Ozone 0xa9b3a and OZChannelDouble(int,...) @Ozone 0xf5df9"
  );
}

/** Lazy default singletons owned by this class. Both are populated under `std::call_once` from
 *  a lambda that Ozone exposes only as a std::once_proxy stub (see file header). NOT yet decoded. */
function createOZChannelDoubleInfo_default(): OZChannelInfo {
  throw new Error(
    "OZChannelDouble::createOZChannelDoubleInfo() (lambda under _OZChannelDoubleInfo_once) " +
    "@Ozone — bound via " +
    "__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleInfoEvEUlvE_EEEEEvPv " +
    "and populates the __ZN15OZChannelDouble20_OZChannelDoubleInfoE global. Lambda body not yet decoded."
  );
}
function createOZChannelDoubleImpl_default(): OZChannelImpl {
  throw new Error(
    "OZChannelDouble::createOZChannelDoubleImpl() (lambda under _OZChannelDoubleImpl_once) " +
    "@Ozone — bound via " +
    "__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleImplEvEUlvE_EEEEEvPv " +
    "and populates the __ZN15OZChannelDouble20_OZChannelDoubleImplE global. Lambda body not yet decoded."
  );
}

/** OZCurve::OZCurve(double, double, double, double) @Ozone U-extern __ZN7OZCurveC2Edddd
 *  (defined in ProChannel; not yet transcribed) — called @0xa95ad. */
function OZCurve_ctor4d(_self: OZCurveDouble, _minVal: number, _maxVal: number, _step: number, _initVal: number): void {
  throw new Error(
    "OZCurve::OZCurve(double,double,double,double) @Ozone U-extern __ZN7OZCurveC2Edddd " +
    "(defined in ProChannel; not yet transcribed) — invoked by " +
    "OZChannelDouble::createOZChannelDoubleCurve @Ozone 0xa95ad"
  );
}

/** OZCurve::setSplineState(OZSplineState*) @Ozone U-extern __ZN7OZCurve14setSplineStateEP13OZSplineState
 *  (defined in ProChannel; not yet transcribed) — called @0xa960f. */
function OZCurve_setSplineState(_self: OZCurveDouble, _s: OZSplineState | null): void {
  throw new Error(
    "OZCurve::setSplineState(OZSplineState*) @Ozone U-extern " +
    "__ZN7OZCurve14setSplineStateEP13OZSplineState (defined in ProChannel; not yet transcribed) " +
    "— invoked by OZChannelDouble::createOZChannelDoubleCurve @Ozone 0xa960f"
  );
}

/** OZCurveDoubleSplineState::getInstance() (Ozone-local; once-guarded via
 *  __ZN24OZCurveDoubleSplineState13_instanceOnceE / _instanceE globals). NOT yet decoded. */
function OZCurveDoubleSplineState_getInstance(): OZSplineState {
  throw new Error(
    "OZCurveDoubleSplineState::getInstance() @Ozone — once-guarded via " +
    "__ZN24OZCurveDoubleSplineState13_instanceOnceE and __ZN24OZCurveDoubleSplineState9_instanceE. " +
    "Lambda body (bound through std::__call_once_proxy) not yet decoded. Referenced by " +
    "OZChannelDouble::createOZChannelDoubleCurve @Ozone 0xa95f7-0xa9608 (the loaded instance " +
    "pointer, offset by +0x8 to skip its vtable slot, is passed to OZCurve::setSplineState)."
  );
}

// ---------------------------------------------------------------------------------------------

/**
 * OZChannelDouble — see file header. The class body is the four ctors + the
 * createOZChannelDoubleCurve() static factory. No other methods are decoded in this framework
 * slice (`nm` lists exactly these 5 symbols under __ZN15OZChannelDouble*).
 */
export class OZChannelDouble extends OZChannel {
  /** Primary vptr — @0x4ede83 stores `__ZTV15OZChannelDouble + 0x10` at (this+0). Implicit in JS. */
  // (vtable slot is implicit)

  /** Secondary vptr — @0x4ede90 stores `__ZTV15OZChannelDouble + 0x370` at (this+0x10). Implicit. */
  // (secondary vtable slot is implicit)

  /** OZChannelImpl* at C++ offset +0x70. Set by ctors from either caller arg (mirror of +0x78) or
   *  the once-guarded `_OZChannelDoubleImpl` global singleton. @Ozone writes: 0x4edf4f / 0xc02c9 /
   *  0xa9b1f / 0xf5dd9. */
  impl!: OZChannelImpl;

  /** OZChannelInfo* at C++ offset +0x80. Same pattern as `impl` but at +0x80/+0x88. @Ozone writes:
   *  0x4edecd/0x4edef1 / 0xc0245/0xc0262 / 0xa9aa2/0xa9abf / 0xf5d5c/0xf5d72. */
  info!: OZChannelInfo;

  /**
   * OZChannelDouble::OZChannelDouble(OZFactory* factory, PCString const& name, uint uint1,
   *   OZChannelImpl* impl, OZChannelInfo* info) @Ozone 0x4ede50.
   *
   * Faithful transcription (see re/disasm/__ZN15OZChannelDoubleC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo.s):
   *   1. Save r14=impl, r15=info; move ecx (uint1) into r8d; put impl/info onto the stack at
   *      offsets 0 and 8 (@0x4ede5d-6e).
   *   2. Zero rcx (folder=NULL) and r9d (uint2=0) — this ctor variant passes them fixed
   *      (@0x4ede72-74).
   *   3. Call OZChannel::OZChannel(this, factory, name, folder=NULL, uint1, uint2=0, impl, info)
   *      — the ProChannel base ctor — @0x4ede77.
   *   4. Store `__ZTV15OZChannelDouble + 0x10` at (this+0) @0x4ede7c-87 (primary vptr).
   *   5. Store `__ZTV15OZChannelDouble + 0x370` at (this+0x10) @0x4ede8a-90 (secondary vptr).
   *   6. `std::call_once(_OZChannelDoubleInfo_once, createOZChannelDoubleInfo)` — @0x4ede94-c3.
   *   7. If (r15==info)!=NULL @0x4edec8: mirror (this+0x88) -> (this+0x80) @0x4edecd-d4;
   *      else load `_OZChannelDoubleInfo` and write it to BOTH (this+0x88) and (this+0x80)
   *      @0x4edeea-ef1. Both paths then fall through to step 8.
   *   8. `std::call_once(_OZChannelDoubleImpl_once, createOZChannelDoubleImpl)` — @0x4ededb-f31.
   *   9. If (r14==impl)!=NULL @0x4edf36: mirror (this+0x78) -> (this+0x70) @0x4edf3b-f;
   *      else load `_OZChannelDoubleImpl` and write it to BOTH (this+0x78) and (this+0x70)
   *      @0x4edf41-4f. Both paths then fall through to the epilogue (@0x4edf53).
   *  Exception path @0x4edf5e-6c: `OZChannel::~OZChannel()` + `_Unwind_Resume`.
   */
  static newFromFactory(
    factory: OZFactory,
    name: string,
    uint1: number,          // ecx / arg-4 (unsigned int)
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelDouble {
    const self = new OZChannelDouble();

    // Step 3 — @0x4ede77. Folder=NULL, uint2=0 always for this ctor variant.
    OZChannel_base_ctor(self, factory, name, /*folder*/ null, uint1, /*uint2*/ 0, impl, info);
    // Steps 4-5 — vptrs are implicit in the TS class.

    // Steps 6-7 — @0x4ede94-ef1.
    if (info !== null) {
      // (base ctor already stored info at +0x88) mirror +0x88 -> +0x80.  @0x4edecd-d4
      self.info = info;
    } else {
      // @0x4edeea: load `_OZChannelDoubleInfo` singleton (once-init'd @0x4ede94-c3), store in both.
      const d = createOZChannelDoubleInfo_default(); // frontier throw
      self.info = d;
    }

    // Steps 8-9 — @0x4ededb-4f.
    if (impl !== null) {
      // mirror +0x78 -> +0x70.  @0x4edf3b-f
      self.impl = impl;
    } else {
      // @0x4edf41: load `_OZChannelDoubleImpl` singleton, store in both.
      const d = createOZChannelDoubleImpl_default(); // frontier throw
      self.impl = d;
    }

    return self;
  }

  /**
   * OZChannelDouble::OZChannelDouble(PCString const& name, OZChannelFolder* folder, uint uint1,
   *   uint uint2, OZChannelImpl* impl, OZChannelInfo* info) @Ozone 0xc01a0.
   *
   * See re/disasm/__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo.s.
   * Faithful:
   *   1. Save regs: r15=impl (rsi=name r13=folder r12d=uint1 [rbp-0x44]=uint2 r14=name backup)
   *      (@0xc01a4-c1). NB the ASM keeps `info` on the stack at 0x10(%rbp) (7th arg, sysV: stack).
   *   2. Call `getOZChannelDouble_FactoryBase()` -> rax (factory) @0xc01c4.
   *   3. Put stack-arg info (0x10(%rbp)) at [rsp+0x8]; put impl (r15) at [rsp] @0xc01c9-d6.
   *   4. Call OZChannel::OZChannel(this, factory, name, folder, uint1, uint2, impl, info) @0xc01ed.
   *   5. Steps 4-9 identical to the OZFactory ctor (write both vptrs, once-init info+impl, then
   *      pick between caller-supplied and default singletons at +0x80/+0x70 respectively).
   *      Info-null check reads the STACK slot at 0x10(%rbp) @0xc023e/@0xc0262 — this is the `info`
   *      arg. Impl-null check reads -0x50(%rbp) @0xc02ae — the saved copy of r15 (the impl arg).
   */
  static newNamed(
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelDouble {
    const self = new OZChannelDouble();

    // Step 2 — @0xc01c4.
    const factory = getOZChannelDouble_FactoryBase(); // frontier throw

    // Step 4 — @0xc01ed.
    OZChannel_base_ctor(self, factory, name, folder, uint1, uint2, impl, info);

    // Steps 5+ — info at (+0x88/+0x80).
    if (info !== null) {
      self.info = info;
    } else {
      self.info = createOZChannelDoubleInfo_default(); // frontier throw
    }
    // impl at (+0x78/+0x70).
    if (impl !== null) {
      self.impl = impl;
    } else {
      self.impl = createOZChannelDoubleImpl_default(); // frontier throw
    }

    return self;
  }

  /**
   * OZChannelDouble::OZChannelDouble(double initialValue, PCString const& name,
   *   OZChannelFolder* folder, uint uint1, uint uint2, OZChannelImpl* impl, OZChannelInfo* info)
   *   @Ozone 0xa99f0.
   *
   * See re/disasm/__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo.s.
   * Body is IDENTICAL to newNamed() up through the singleton fixup, then two extra calls:
   *   • OZChannel::setDefaultValue(this, initialValue)          — @0xa9b2b
   *   • OZChannel::setInitialValue(this, initialValue, false)   — @0xa9b3a (esi=0)
   *   xmm0 (initialValue) is spilled to -0x50(%rbp) @0xa9a11 and reloaded twice @0xa9b26 / @0xa9b33
   *   so both calls see the identical bit-pattern (no NaN games).
   */
  static newDouble(
    initialValue: number,
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelDouble {
    const self = new OZChannelDouble();

    // @0xa9a1d.
    const factory = getOZChannelDouble_FactoryBase(); // frontier throw
    // @0xa9a43.
    OZChannel_base_ctor(self, factory, name, folder, uint1, uint2, impl, info);

    if (info !== null) {
      self.info = info;
    } else {
      self.info = createOZChannelDoubleInfo_default(); // frontier throw
    }
    if (impl !== null) {
      self.impl = impl;
    } else {
      self.impl = createOZChannelDoubleImpl_default(); // frontier throw
    }

    // Trailing set-values — @0xa9b2b / @0xa9b3a. xmm0 is the SAME saved bit-pattern for both.
    OZChannel_setDefaultValue(self, initialValue);          // frontier throw
    OZChannel_setInitialValue(self, initialValue, false);   // frontier throw

    return self;
  }

  /**
   * OZChannelDouble::OZChannelDouble(int initialValue, PCString const& name,
   *   OZChannelFolder* folder, uint uint1, uint uint2, OZChannelImpl* impl, OZChannelInfo* info)
   *   @Ozone 0xf5cb0.
   *
   * See re/disasm/__ZN15OZChannelDoubleC2EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo.s.
   * Same body as newDouble(), with `initialValue` promoted from int32 -> double via
   * `cvtsi2sdl -0x4c(%rbp), %xmm0` @0xf5ddd BEFORE the two setDefaultValue/setInitialValue calls
   * (@0xf5dea / @0xf5df9). We call Math.fround only on FLOAT (single-precision) paths per
   * PORTING_SPEC Rule 4 — cvtsi2sdl produces an EXACT double from a 32-bit int, so no fround here.
   *
   * Note the different arg-slot layout vs newDouble: `esi=initialValue` (%esi is int32 arg 2 in
   * sysV), so we get it in a GPR not an xmm; the ASM spills it to -0x4c(%rbp) @0xf5cce and
   * converts on demand @0xf5ddd.
   */
  static newInt(
    initialValue: number,      // int (int32; exactly representable as double)
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelDouble {
    const self = new OZChannelDouble();

    // int -> double promotion — `cvtsi2sdl` @0xf5ddd. Exact for int32.
    // (We treat the JS `number` as int-domain here; the CPP arg was `int`.)
    const iv = (initialValue | 0);                // signed int32 truncation to match the arg width
    const dv = iv;                                // exact int32 -> double (@0xf5ddd cvtsi2sdl)

    // @0xf5cd8.
    const factory = getOZChannelDouble_FactoryBase(); // frontier throw
    // @0xf5cfd.
    OZChannel_base_ctor(self, factory, name, folder, uint1, uint2, impl, info);

    if (info !== null) {
      self.info = info;
    } else {
      self.info = createOZChannelDoubleInfo_default(); // frontier throw
    }
    if (impl !== null) {
      self.impl = impl;
    } else {
      self.impl = createOZChannelDoubleImpl_default(); // frontier throw
    }

    // @0xf5dea / @0xf5df9. Both calls pass the SAME converted double from the -0x38 spill slot.
    OZChannel_setDefaultValue(self, dv);          // frontier throw
    OZChannel_setInitialValue(self, dv, false);   // frontier throw

    return self;
  }

  /**
   * OZChannelDouble::createOZChannelDoubleCurve(double value) @Ozone 0xa9570.
   *
   * See re/disasm/OZChannelDouble.createOZChannelDoubleCurve.s. Faithful:
   *   1. Spill xmm0 (value) to -0x20(%rbp) @0xa957b.
   *   2. `operator new(0xb0)` @0xa9580-a — 176-byte allocation (== sizeof(OZCurve[Double])).
   *   3. Load three RIP-relative constants:
   *      xmm0 = *(0xa9595 + 0x65e5a3) = *0x707B38 = -DBL_MAX = -1.7976931348623157e+308
   *                                                (u64 0xffefffffffffffff)
   *      xmm1 = *(0xa959d + 0x65e5a3) = *0x707B40 = +DBL_MAX = +1.7976931348623157e+308
   *                                                (u64 0x7fefffffffffffff)
   *      xmm2 = *(0xa95a5 + 0x65be7b) = *0x705420 = 0.01     (u64 0x3f847ae147ae147b)
   *      xmm3 = -0x20(%rbp) (the caller's `value`).
   *      (All three constants verified via `resolve.py Ozone const 0x707B38/0x707B40/0x705420`.)
   *   4. Call OZCurve::OZCurve(new_obj, -DBL_MAX, +DBL_MAX, 0.01, value) @0xa95ad.
   *   5. Store `__ZTV13OZCurveDouble + 0x10` at (new_obj+0) @0xa95b2-bd — the OZCurveDouble vptr.
   *   6. `std::call_once(OZCurveDoubleSplineState::_instanceOnce,
   *                       OZCurveDoubleSplineState::getInstance-lambda)` @0xa95c0-f2.
   *   7. Load `OZCurveDoubleSplineState::_instance` @0xa95f7-fe (double indirection through the
   *      _instance data slot; the value there is a raw class instance pointer).
   *      Compute `rsi = &instance + 0x8` @0xa9601 (offset past the instance's own vtable slot to
   *      the actual OZSplineState-shaped payload) — BUT if instance==nullptr, `cmoveq` @0xa9608
   *      restores rsi=nullptr (i.e. "no spline state yet"; unlikely on the second-and-later calls).
   *   8. Call OZCurve::setSplineState(new_obj, rsi) @0xa960f.
   *   9. Return new_obj @0xa9614.
   * Exception paths @0xa9620-49: two variants — one before the OZCurve ctor completed
   * (operator delete only), one after (OZCurve::~OZCurve then operator delete), each rethrows.
   */
  static createOZChannelDoubleCurve(value: number): OZCurveDouble {
    // Step 2 — @0xa9580: sizeof = 0xb0 == 176.  The TS side allocates via `new` on a class shape.
    const curve = Object.create(null) as OZCurveDouble & {
      minVal?: number; maxVal?: number; step?: number; value?: number;
    };

    // Step 3 constants — read from the Ozone binary at the addresses cited above.
    // -DBL_MAX / +DBL_MAX / 0.01 — the CANONICAL "unbounded double with 0.01 step" curve range.
    const MIN_VAL: number = -Number.MAX_VALUE; // @Ozone 0x707B38  u64 0xffefffffffffffff
    const MAX_VAL: number =  Number.MAX_VALUE; // @Ozone 0x707B40  u64 0x7fefffffffffffff
    const STEP: number    = 0.01;              // @Ozone 0x705420  u64 0x3f847ae147ae147b

    // Step 4 — @0xa95ad. Frontier throw (OZCurve ctor is ProChannel-side and not yet transcribed).
    OZCurve_ctor4d(curve as OZCurveDouble, MIN_VAL, MAX_VAL, STEP, value);
    // Step 5 — vptr write is implicit in the class shape.

    // Steps 6-8 — the shared spline-state singleton. Frontier throws.
    const state = OZCurveDoubleSplineState_getInstance();
    OZCurve_setSplineState(curve as OZCurveDouble, state);

    return curve as OZCurveDouble;
  }
}
