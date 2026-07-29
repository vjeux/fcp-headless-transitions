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

// ================================================================================================
// ProChannel-framework counterpart methods
// ================================================================================================
//
// OZChannelDouble is registered under BOTH Ozone.framework AND ProChannel.framework (each is a
// separate dylib slice). The Ozone slice above covers 5 method bodies (0x4ede50, 0xc01a0, 0xa99f0,
// 0xf5cb0, 0xa9570). The ProChannel slice defines an ADDITIONAL 12 method bodies at completely
// different addresses (`nm -n` on ProChannel.framework/Versions/A/ProChannel confirms — see
// raw-port/army/inventory/ProChannel.syms.txt). Some are unique factories/dtors that Ozone
// doesn't ship; the ctor variants overlap in shape but are separately compiled + linked into
// ProChannel.
//
// STRUCT LAYOUT DELTA (ProChannel slice):
//   OZChannelDouble sizeof = 0x98 == 152 bytes    ; read from `movl $0x98, %edi` @0x1cd52 (the
//                                                    `__Znwm` allocation in clone()). Confirms
//                                                    the layout enumerated in the file header
//                                                    (primary vptr @+0, secondary vptr @+0x10,
//                                                    impl @+0x70/0x78, info @+0x80/0x88 — remainder
//                                                    of 0x98 belongs to the OZChannel base subobject).
//   `__ZTV15OZChannelDouble` (ProChannel slice) is at data address 0xd17f0; the two vtable slots
//   installed at +0/+0x10 are `+0x10` (primary sub-table) and `+0x370` (secondary sub-table) —
//   confirmed by nm: `00000000000d17f0 S __ZTV15OZChannelDouble` and by the exact leaq offsets
//   in this class's clone()/ctors (@0x1cd6c leaq 0xd1800 = 0xd17f0+0x10; @0x1cd76 leaq 0xd1b60 =
//   0xd17f0+0x370).
//
// FRONTIER (undecoded ProChannel-slice callees invoked from the methods below):
//   __ZN9OZChannelC2ERKS_P15OZChannelFolder             OZChannel(OZChannel const&, OZChannelFolder*)
//     — the OZChannel copy-ctor; called by clone() @ProChannel 0x1cd67.
//   __ZN9OZChannelD2Ev                                    (already stubbed above — same base dtor)
//   __ZN13OZCurveDoubleC2Ed                              OZCurveDouble::OZCurveDouble(double)
//     — called by createOZChannelDoubleImpl::lambda @ProChannel 0x6a36b and by
//       createOZChannelDoubleCurve @ProChannel 0x6a051.
//   __ZN13OZChannelImplC2EP7OZCurvedjb                   OZChannelImpl::OZChannelImpl(OZCurve*, double, uint, bool)
//     — called by createOZChannelDoubleImpl::lambda @ProChannel 0x6a383. Args: (curve, 0.0, 1, true).
//   __ZN11PCSingletonC2Ej                                PCSingleton::PCSingleton(uint)
//     — called by createOZChannelDoubleImpl::lambda @ProChannel 0x6a394 on (impl+0x28) with slot=0x64.

/** External `__ZN9OZChannelC2ERKS_P15OZChannelFolder` — OZChannel copy-ctor. Called from
 *  clone() @ProChannel 0x1cd67. NOT yet transcribed. */
function OZChannel_copy_ctor(
  _self: OZChannelDouble,
  _other: OZChannelDouble,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @ProChannel U-extern " +
    "__ZN9OZChannelC2ERKS_P15OZChannelFolder (defined in ProChannel; not yet transcribed) — " +
    "invoked by OZChannelDouble::clone() @ProChannel 0x1cd67"
  );
}

/** External `__ZN13OZCurveDoubleC2Ed` — OZCurveDouble(double) ctor. Called from
 *  createOZChannelDoubleImpl::lambda @ProChannel 0x6a36b and createOZChannelDoubleCurve
 *  @ProChannel 0x6a051. NOT yet transcribed. */
function OZCurveDouble_ctor_d(_self: OZCurveDouble, _initVal: number): void {
  throw new Error(
    "OZCurveDouble::OZCurveDouble(double) @ProChannel U-extern __ZN13OZCurveDoubleC2Ed " +
    "(defined in ProChannel; not yet transcribed) — invoked by " +
    "OZChannelDouble::createOZChannelDoubleImpl::lambda @ProChannel 0x6a36b and " +
    "OZChannelDouble::createOZChannelDoubleCurve @ProChannel 0x6a051"
  );
}

/** External `__ZN13OZChannelImplC2EP7OZCurvedjb` — OZChannelImpl(OZCurve*, double, uint, bool)
 *  ctor. Called from createOZChannelDoubleImpl::lambda @ProChannel 0x6a383 with
 *  args = (curve, 0.0, 1, 1). NOT yet transcribed. */
function OZChannelImpl_ctor(
  _self: OZChannelImpl,
  _curve: OZCurveDouble,
  _defaultValue: number,
  _uint1: number,
  _bool1: boolean,
): void {
  throw new Error(
    "OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool) @ProChannel U-extern " +
    "__ZN13OZChannelImplC2EP7OZCurvedjb (defined in ProChannel; not yet transcribed) — " +
    "invoked by OZChannelDouble::createOZChannelDoubleImpl::lambda @ProChannel 0x6a383"
  );
}

/** External `__ZN13OZChannelImplD2Ev` — OZChannelImpl base dtor. Unwind path @0x6a3c2. */
function OZChannelImpl_dtor(_self: OZChannelImpl): void {
  throw new Error(
    "OZChannelImpl::~OZChannelImpl() @ProChannel U-extern __ZN13OZChannelImplD2Ev " +
    "(defined in ProChannel; not yet transcribed) — invoked by " +
    "OZChannelDouble::createOZChannelDoubleImpl::lambda exception-unwind @ProChannel 0x6a3c2"
  );
}

/** External `__ZN11PCSingletonC2Ej` — PCSingleton(uint) ctor. Called from
 *  createOZChannelDoubleImpl::lambda @ProChannel 0x6a394 on (impl + 0x28) with uint=0x64. NOT yet
 *  transcribed. */
function PCSingleton_ctor(_self: PCSingleton, _slotID: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProChannel U-extern __ZN11PCSingletonC2Ej " +
    "(defined in ProChannel; not yet transcribed) — invoked by " +
    "OZChannelDouble::createOZChannelDoubleImpl::lambda @ProChannel 0x6a394 (arg slotID = 0x64)"
  );
}

/** OZChannelImpl — placeholder interface for the impl subobject constructed in
 *  createOZChannelDoubleImpl. The lambda embeds a PCSingleton sub-object at +0x28 and installs a
 *  primary vptr at +0 (leaq 0x60a58(%rip) @0x6a399) and a secondary vptr at +0x28 (leaq
 *  0x60a6e(%rip) @0x6a3a3). Both vtables are OZChannelImpl vtable slots — offsets not decoded
 *  here (leaf class not yet ported). Total sizeof is 0x30 (48 bytes) — from `__Znwm` @0x6a34b. */
interface PCSingleton {
  readonly _prochannelPCSingletonMarker: true;
}

/**
 * OZChannelDouble::getObjCWrapperName() @ProChannel 0x1cc0c.
 *
 * Faithful transcription (see re/disasm/__ZN15OZChannelDouble18getObjCWrapperNameEv.s):
 *   @0x1cc10: leaq 0xc8119(%rip), %rax                    ; RIP-relative to __cfstring @0xe4d30.
 *             Compute:  RIP-post-instr = 0x1cc17, add disp 0xc8119 => 0xe4d30 (matches
 *             __DATA_CONST,__cfstring). The struct at 0xe4d30 is a canonical CFStringRef:
 *               +0x00  isa flags       (0x07c88020_00000200 — ObjC CFString isa + flags 0x7c8)
 *               +0x10  cstr pointer    ; file offset 0xbc499 (in __TEXT,__cstring), reads
 *                                       exactly the bytes b'CHChannelDouble\x00'.
 *               +0x18  length          ; 0x0f == 15 characters (matches "CHChannelDouble").
 *   @0x1cc17: retq                     ; return the CFString ptr in %rax.
 *
 * Semantics: returns the ObjC class name for the CH-side wrapper — every OZChannel* subclass
 * pairs with a `CHChannel*` ObjC class registered at runtime (see CHChannelDouble.ts header).
 * The ObjC bridge uses this method to look up the correct wrapper class per OZChannel type.
 * @ProChannel 0x1cc10 (cfstring pointer read) + 0x1cc17 (return).
 */
export function OZChannelDouble_getObjCWrapperName(): string {
  // The literal string bytes at __cstring +0xbc499 in the ProChannel binary.
  return "CHChannelDouble"; // @ProChannel cfstring @0xe4d30 -> cstring @0xbc499 (len 15)
}

/**
 * OZChannelDouble::~OZChannelDouble() D1 @ProChannel 0x1cd22.
 *
 * Faithful transcription:
 *   @0x1cd22-27:  push %rbp / mov %rsp,%rbp / pop %rbp
 *   @0x1cd27:     jmp __ZN9OZChannelD2Ev                  ; tail-call the OZChannel base dtor.
 *
 * The complete D1 dtor for OZChannelDouble is a bare tail-call into OZChannel::~OZChannel().
 * There are no owned resources at the OZChannelDouble layer that need cleanup — the impl and
 * info slots at +0x70/+0x78/+0x80/+0x88 hold pointers to shared singletons (or caller-owned
 * objects), so this class never owns them.
 */
export function OZChannelDouble_D1(self: OZChannelDouble): void {
  // Tail-call @ProChannel 0x1cd27 — the OZChannel base dtor cleans up all inherited state.
  OZChannel_base_dtor(self); // frontier stub — base dtor @ProChannel 0x1cd27 tail-jmp to OZChannel::~OZChannel()
}

/** External `__ZN9OZChannelD2Ev` — OZChannel base dtor. Called by D1/D0 tail. NOT yet transcribed. */
function OZChannel_base_dtor(_self: OZChannelDouble): void {
  throw new Error(
    "OZChannel::~OZChannel() @ProChannel U-extern __ZN9OZChannelD2Ev " +
    "(defined in ProChannel; not yet transcribed) — invoked by OZChannelDouble D1 dtor tail @ProChannel 0x1cd27 " +
    "and D0 dtor @ProChannel 0x1cd35"
  );
}

/**
 * OZChannelDouble::~OZChannelDouble() D0 @ProChannel 0x1cd2c.
 *
 * Faithful transcription:
 *   @0x1cd2c-31:  standard prologue (push %rbp, mov %rsp,%rbp, push %rbx, push %rax [align]).
 *   @0x1cd32:     mov %rdi,%rbx                            ; save `this`.
 *   @0x1cd35:     callq __ZN9OZChannelD2Ev                 ; run base dtor.
 *   @0x1cd3a:     mov %rbx,%rdi
 *   @0x1cd3d-42:  epilogue restore (add $8,%rsp / pop %rbx / pop %rbp).
 *   @0x1cd43:     jmp __ZdlPv                              ; tail-call operator delete(void*).
 *
 * The D0 ("deleting destructor") variant runs the D2 base dtor then frees the storage. Semantically
 * equivalent to `delete this` on a `new`-allocated OZChannelDouble.
 */
export function OZChannelDouble_D0(self: OZChannelDouble): void {
  // @0x1cd35 — run the OZChannel base dtor on `this`.
  OZChannel_base_dtor(self);
  // @0x1cd43 — tail-call operator delete(void*). In TS/JS the GC handles reclamation; modeling
  // the free explicitly is a no-op at the language level, but we cite it so the transcription is
  // complete.
  operator_delete(self); // frontier stub — cite @ProChannel 0x1cd43
}

/** `__ZdlPv` — global `operator delete(void*)`. Trivial: releases heap memory. Not transcribed
 *  as JS has GC; we model it as a no-op with a citation. */
function operator_delete(_ptr: unknown): void {
  // @ProChannel symbol stub @0xace04 — global `::operator delete(void*)`. GC handles this in JS.
  // (No-op is CORRECT: the raw malloc/free indirection is not something the language exposes.)
}

/**
 * OZChannelDouble::clone() const @ProChannel 0x1cd48.
 *
 * Faithful transcription (see the disasm block above the additions):
 *   Step 1 @0x1cd52:  `movl $0x98, %edi`                        ; sizeof(OZChannelDouble) = 0x98.
 *   Step 2 @0x1cd57:  `callq __Znwm`                            ; ::operator new(size_t).
 *   Step 3 @0x1cd5c-62: save allocation into %rbx, feed it into the copy-ctor with %rsi=other
 *                       (the original `this`), %rdx=NULL (folder=null).
 *   Step 4 @0x1cd67:  `callq __ZN9OZChannelC2ERKS_P15OZChannelFolder` — OZChannel(const OZChannel&,
 *                       OZChannelFolder*). Base copy-ctor; frontier throw.
 *   Step 5 @0x1cd6c-73: write primary vptr `__ZTV15OZChannelDouble + 0x10` (= 0xd1800) at (new+0x00).
 *   Step 6 @0x1cd76-7d: write secondary vptr `__ZTV15OZChannelDouble + 0x370` (= 0xd1b60) at (new+0x10).
 *   Step 7 @0x1cd81:  `movq %rbx,%rax`                          ; return the new instance.
 *   Exception path @0x1cd89-97: if the base copy-ctor throws, `__ZdlPv` frees the allocation
 *   and `__Unwind_Resume` rethrows.
 *
 * Semantics: identity-preserving duplicate of the receiver. Unlike Ozone's Rotoshape/etc. clone
 * pattern (which recursively deep-clones subordinate objects), this delegates the ENTIRE
 * per-field copy to `OZChannel::OZChannel(const OZChannel&, OZChannelFolder*)` — the OZChannel
 * base subobject owns every stateful field (name, folder pointer, impl/info pointers, keyframe
 * list, etc.), so a bare `folder=null` copy-ctor call is complete.
 */
export function OZChannelDouble_clone(self: OZChannelDouble): OZChannelDouble {
  // Step 1-2 @ProChannel 0x1cd52-57 — allocate sizeof(OZChannelDouble)=0x98 bytes.
  // In TS we materialize a class shape; the numeric size is asserted here for the record.
  const cloned = Object.create(null) as OZChannelDouble;

  // Step 4 @ProChannel 0x1cd67 — copy-ctor OZChannel base with folder=null. Frontier throw.
  OZChannel_copy_ctor(cloned, self, /*folder*/ null);

  // Steps 5-6 — vptr writes @ProChannel 0x1cd6c/0x1cd76. Implicit in the JS class shape.
  //   +0x00  <- __ZTV15OZChannelDouble + 0x10   (data addr 0xd1800; leaq 0xb4a8d(%rip))
  //   +0x10  <- __ZTV15OZChannelDouble + 0x370  (data addr 0xd1b60; leaq 0xb4de3(%rip))

  // Step 7 @ProChannel 0x1cd81 — return the clone.
  return cloned;
}

/**
 * OZChannelDouble::createOZChannelDoubleInfo() @ProChannel 0x6a1bc.
 *
 * Faithful transcription:
 *   @0x6a1c4: load __ZZN15OZChannelDouble25createOZChannelDoubleInfoEvE25_OZChannelDoubleInfo_once
 *             into %rax.
 *   @0x6a1cb-cf: cmpq $-1, %rax ; je 0x6a1f6                    ; skip once-init if already done.
 *   @0x6a1d1-f1: set up std::call_once with args (once, lambda_capture, __call_once_proxy<lambda>).
 *                The lambda is __ZZN15OZChannelDouble25createOZChannelDoubleInfoEvENKUlvE_clEv
 *                — its body is NOT symbol-visible in this framework slice (only exposed via the
 *                std::once_proxy stub); the lambda populates the _OZChannelDoubleInfo global.
 *   @0x6a1f1: callq __ZNSt3__111__call_onceERVmPvPFvS2_E        ; std::__1::__call_once trampoline.
 *   @0x6a1f6-fd: load _OZChannelDoubleInfo global + deref (movq (%rax),%rax), return.
 *
 * Semantics: idempotent lazy-init of the shared `OZChannelDoubleInfo` singleton (a constant
 * "metadata for a double-typed channel" object). All OZChannelDouble ctors that don't get a
 * caller-supplied `info` fall back to this singleton at their `+0x80` slot.
 */
export function OZChannelDouble_createOZChannelDoubleInfo(): OZChannelInfo {
  // @ProChannel 0x6a1d1-f1 — std::call_once(_OZChannelDoubleInfo_once, lambda).
  // Lambda body is not symbol-exposed in the ProChannel slice; frontier throw preserves the gap.
  return _OZChannelDoubleInfo_once_body();
}

/** The `_OZChannelDoubleInfo` lambda body (std::once_proxy-wrapped, no direct symbol exposed).
 *  Populates the module-static `_OZChannelDoubleInfo` global. NOT yet decoded. */
function _OZChannelDoubleInfo_once_body(): OZChannelInfo {
  throw new Error(
    "OZChannelDouble::createOZChannelDoubleInfo()::lambda @ProChannel U-extern " +
    "(bound via __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelDouble25createOZChannelDoubleInfoEvEUlvE_EEEEEvPv" +
    " -- lambda body not symbol-visible in framework slice; not yet transcribed). " +
    "Referenced by OZChannelDouble::createOZChannelDoubleInfo() @ProChannel 0x6a1ea"
  );
}

/**
 * OZChannelDouble::createOZChannelDoubleImpl() @ProChannel 0x3868.
 *
 * Faithful transcription (symmetric with createOZChannelDoubleInfo above):
 *   @0x3870: load `_OZChannelDoubleImpl_once` into %rax.
 *   @0x3877-7b: cmpq $-1,%rax ; je 0x38a2                       ; skip if already initialized.
 *   @0x387d-9d: set up std::call_once(_OZChannelDoubleImpl_once, lambda_capture,
 *                __call_once_proxy<lambda>) — the lambda body is decoded here (see
 *                OZChannelDouble_createOZChannelDoubleImpl_lambda below @0x6a334).
 *   @0x389d: callq __ZNSt3__111__call_onceERVmPvPFvS2_E         ; std::__1::__call_once.
 *   @0x38a2-b1: load `_OZChannelDoubleImpl` global + deref, return.
 *
 * Semantics: idempotent lazy-init of the shared `OZChannelDoubleImpl` singleton. Every
 * OZChannelDouble ctor that isn't passed a caller-owned `impl` falls back to this singleton at
 * its `+0x70` slot.
 */
export function OZChannelDouble_createOZChannelDoubleImpl(): OZChannelImpl {
  // @ProChannel 0x387d-9d — std::call_once(_OZChannelDoubleImpl_once, lambda).
  return OZChannelDouble_createOZChannelDoubleImpl_lambda();
}

/**
 * OZChannelDouble::createOZChannelDoubleImpl()::'lambda'() @ProChannel 0x6a334.
 *
 * Faithful transcription (11 numbered steps, see the disasm block above):
 *   Step  1 @0x6a33e:  leaq _OZChannelDoubleImpl(%rip),%r15    ; addr of the shared singleton slot.
 *   Step  2 @0x6a345-49: `cmpq $0,(%r15) ; jne 0x6a3b1`         ; if slot already set, skip.
 *   Step  3 @0x6a34b-50: `movl $0x30,%edi ; call __Znwm`        ; alloc 48 bytes for OZChannelImpl.
 *                                                                (sizeof(OZChannelImpl) = 0x30.)
 *   Step  4 @0x6a355:  mov %rax,%rbx                            ; save impl allocation.
 *   Step  5 @0x6a358-5d: `movl $0xb0,%edi ; call __Znwm`        ; alloc 176 bytes for OZCurveDouble.
 *                                                                (sizeof(OZCurveDouble) = 0xb0.)
 *   Step  6 @0x6a362:  mov %rax,%r14                            ; save curve allocation.
 *   Step  7 @0x6a365-6b: `xorps %xmm0,%xmm0 ; mov %rax,%rdi ;
 *                          call __ZN13OZCurveDoubleC2Ed`         ; OZCurveDouble::OZCurveDouble(0.0)
 *                                                                (curve init'd with default 0.0).
 *   Step  8 @0x6a370-83: `xorps %xmm0,%xmm0 ; mov %rbx,%rdi ; mov %r14,%rsi ; movl $1,%edx ;
 *                          movl $1,%ecx ; call __ZN13OZChannelImplC2EP7OZCurvedjb`
 *                                                                ; OZChannelImpl::OZChannelImpl(
 *                                                                    curve=r14,
 *                                                                    defaultValue=0.0,
 *                                                                    uint1=1,
 *                                                                    bool1=true).
 *   Step  9 @0x6a388-94: `mov %rbx,%rdi ; add $0x28,%rdi ; movl $0x64,%esi ; call __ZN11PCSingletonC2Ej`
 *                                                                ; construct a PCSingleton in
 *                                                                  place at (impl + 0x28) with
 *                                                                  slotID = 0x64.
 *   Step 10 @0x6a399-a0: `leaq 0x60a58(%rip),%rax ; mov %rax,(%rbx)`
 *                                                                ; primary vptr at impl+0x00.
 *                                                                  0x6a3a0 + 0x60a58 = 0xcadf8.
 *   Step 11 @0x6a3a3-aa: `leaq 0x60a6e(%rip),%rax ; mov %rax,0x28(%rbx)`
 *                                                                ; secondary vptr at impl+0x28.
 *                                                                  0x6a3aa + 0x60a6e = 0xcae18.
 *   Step 12 @0x6a3ae:  `mov %rbx,(%r15)`                        ; publish the fully-formed impl
 *                                                                  into `_OZChannelDoubleImpl`.
 *   Exception paths @0x6a3bc-e4:
 *     if OZChannelImpl ctor threw    -> OZChannelImpl::~OZChannelImpl() + __ZdlPv(impl) + __ZdlPv(curve) + resume.
 *     if OZCurveDouble ctor threw    -> __ZdlPv(curve) + __ZdlPv(impl) + resume.
 *     if the outer allocs succeeded but a later step threw -> __ZdlPv(impl) + resume.
 *
 * The two vptr targets 0xcadf8 (=0xcae40-0x48) and 0xcae18 land inside `__ZTV19OZChannelImpl` (the
 * OZChannelImpl vtable in ProChannel; nm confirms `__ZTV19OZChannelImpl` at 0xcadf0). Slots at
 * +0x08 (0xcadf8) and +0x28 (0xcae18) are the standard primary/secondary base sub-table slots.
 */
function OZChannelDouble_createOZChannelDoubleImpl_lambda(): OZChannelImpl {
  // Step 3 @0x6a34b — OZChannelImpl sizeof = 0x30 (48 bytes).
  const impl = Object.create(null) as OZChannelImpl & {
    _pcSingleton?: PCSingleton;
  };

  // Step 5-7 @0x6a358-6b — alloc OZCurveDouble (sizeof 0xb0 = 176 bytes), ctor with 0.0.
  const curve = Object.create(null) as OZCurveDouble;
  OZCurveDouble_ctor_d(curve, 0.0); // frontier throw

  // Step 8 @0x6a370-83 — OZChannelImpl(curve, 0.0, 1, true).
  //   defaultValue = 0.0                                    (xorps %xmm0,%xmm0 @0x6a370)
  //   uint1        = 1                                      (movl $1,%edx      @0x6a379)
  //   bool1        = true                                   (movl $1,%ecx      @0x6a37e)
  OZChannelImpl_ctor(impl, curve, /*defaultValue*/ 0.0, /*uint1*/ 1, /*bool1*/ true);

  // Step 9 @0x6a388-94 — PCSingleton in-place at impl+0x28 with slotID = 0x64.
  const pcs = Object.create(null) as PCSingleton;
  PCSingleton_ctor(pcs, /*slotID*/ 0x64);
  impl._pcSingleton = pcs;

  // Steps 10-11 — vptr writes @0x6a399-aa. Data addrs 0xcadf8 (primary) and 0xcae18 (secondary),
  // both inside __ZTV19OZChannelImpl (the OZChannelImpl vtable — data slot for this class's
  // subordinate impl). Implicit in the JS class shape.

  // Step 12 @0x6a3ae — publish. The caller of _OZChannelDoubleImpl_once retrieves this via the
  // global `_OZChannelDoubleImpl` slot; here we just return it (call-once + global semantics are
  // wrapped by OZChannelDouble_createOZChannelDoubleImpl above).
  return impl;
}

/**
 * OZChannelDouble::createOZChannelDoubleCurve(double value) @ProChannel 0x6a02c.
 *
 * NOTE: this is DIFFERENT from the Ozone slice's createOZChannelDoubleCurve @Ozone 0xa9570
 * (which additionally wires OZCurveDoubleSplineState). The ProChannel slice's version is
 * strictly `new OZCurveDouble(value)` — no spline-state wiring, no bounds ctor.
 *
 * Faithful transcription:
 *   @0x6a03c-41: `movl $0xb0,%edi ; call __Znwm`             ; alloc 176 bytes for OZCurveDouble.
 *   @0x6a046:    mov %rax,%rbx                               ; save allocation.
 *   @0x6a049-4c: mov %rax,%rdi ; movsd -0x18(%rbp),%xmm0     ; feed alloc + value into ctor.
 *   @0x6a051:    callq __ZN13OZCurveDoubleC2Ed               ; OZCurveDouble::OZCurveDouble(value).
 *   @0x6a056:    mov %rbx,%rax                               ; return curve.
 *   Exception path @0x6a062-70: __ZdlPv(curve) + __Unwind_Resume.
 *
 * This is used by the ProChannel-side factory glue; the Ozone slice uses its more elaborate
 * variant. Both bear the same C++ symbol name in each framework — they are TWO separately-
 * compiled bodies (not ICF-folded — the disassembled bytes are objectively different).
 */
export function OZChannelDouble_createOZChannelDoubleCurve_ProChannel(value: number): OZCurveDouble {
  // Step 1 @ProChannel 0x6a03c — sizeof(OZCurveDouble) = 0xb0 (176 bytes).
  const curve = Object.create(null) as OZCurveDouble;
  // Step 2 @ProChannel 0x6a051 — bare OZCurveDouble(value) ctor. Frontier throw.
  OZCurveDouble_ctor_d(curve, value);
  return curve;
}
