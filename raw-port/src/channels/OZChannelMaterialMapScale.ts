// OZChannelMaterialMapScale — Ozone framework, extends OZChannelScale.
//
// A compound "material map scale" channel that groups four sub-channels
// alongside the OZChannelScale base:
//
//   +0x00..+0x1b7  OZChannelScale base subobject
//                  (OZChannelScale itself is a 2D scale channel from
//                   ProChannel — it has its own X/Y sub-channels at +0x88
//                   and +0x120 inside this range).
//   +0x1b8         OZChannelBool sub-channel  (default value = TRUE (0x1);
//                                              sub-index 0xa, group 0x0)
//   +0x250         OZChannelDouble sub-channel (default value = 72.0;
//                                              sub-index 0xb, group 0x2)
//   +0x2e8..+0x49f OZChannelScale "basis" sub-channel (default (x,y) =
//                                              (1.0, 1.0); sub-index 0xc,
//                                              group 0x2, subGroup 0x2)
//   sizeof(OZChannelMaterialMapScale) = 0x4a0 = 1184 bytes
//     (recovered from clone @0x2834ea: `movl $0x4a0, %edi` fed to `operator new`)
//
// Framework: Ozone
//   (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework).
//   The x86_64 slice is a fat sub-arch; VAs below are the exact VM
//   addresses printed by `otool -tV -arch x86_64` (also the ledger's
//   canonical form for this port).
//
// Faithful transcription of the 15 exported OZChannelMaterialMapScale-
// scope symbols (all methods; below CHUNK_THRESHOLD → whole-class file):
//
//   0x00282be0  OZChannelMaterialMapScale::OZChannelMaterialMapScale(
//                    PCString const&, OZChannelFolder*, uint, uint)      [C2 factoryless]
//   0x00282e00  OZChannelMaterialMapScale::OZChannelMaterialMapScale(
//                    PCString const&, OZChannelFolder*, uint, uint)      [C1 shim]
//   0x00282e10  OZChannelMaterialMapScale::OZChannelMaterialMapScale(
//                    OZFactory*, PCString const&, OZChannelFolder*, uint, uint) [C2]
//   0x00282fd0  OZChannelMaterialMapScale::OZChannelMaterialMapScale(
//                    OZFactory*, PCString const&, OZChannelFolder*, uint, uint) [C1 shim]
//   0x00282fe0  OZChannelMaterialMapScale::OZChannelMaterialMapScale(
//                    double, double, PCString const&, OZChannelFolder*, uint, uint) [C2]
//   0x00283210  OZChannelMaterialMapScale::OZChannelMaterialMapScale(
//                    double, double, PCString const&, OZChannelFolder*, uint, uint) [C1 shim]
//   0x00283220  OZChannelMaterialMapScale::OZChannelMaterialMapScale(
//                    OZFactory*, PCString const&, uint)                  [C2]
//   0x002833e0  OZChannelMaterialMapScale::OZChannelMaterialMapScale(
//                    OZFactory*, PCString const&, uint)                  [C1 shim]
//   0x002833f0  OZChannelMaterialMapScale::OZChannelMaterialMapScale(
//                    OZChannelMaterialMapScale const&, OZChannelFolder*) [C2 copy]
//   0x002834d0  OZChannelMaterialMapScale::OZChannelMaterialMapScale(
//                    OZChannelMaterialMapScale const&, OZChannelFolder*) [C1 shim]
//   0x002834e0  OZChannelMaterialMapScale::clone() const
//   0x00283520  OZChannelMaterialMapScale::copy(OZChannelBase const*, bool)
//   0x002835c0  OZChannelMaterialMapScale::setBasisScale(double, double)
//   0x00283610  OZChannelMaterialMapScale::~OZChannelMaterialMapScale()  [D1]
//   0x002836d0  OZChannelMaterialMapScale::~OZChannelMaterialMapScale()  [D0]
//
// SUB-CHANNEL LAYOUT — recovered from every ctor + both dtors + copy:
//   • +0x1b8 OZChannelBool: constructed via
//     `OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*,
//        uint, uint, OZChannelImpl*, OZChannelInfo*)` with args
//     (value=1, name=cfstring#1, folder=this, group=0xa, sub=0x0,
//      impl=nullptr, info=nullptr).
//   • +0x250 OZChannelDouble: constructed via
//     `OZChannelDouble::OZChannelDouble(double, PCString const&,
//        OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*)`
//     with args (value=72.0, name=cfstring#2, folder=this, group=0xb,
//      sub=0x2, impl=nullptr, info=nullptr).
//   • +0x2e8 OZChannelScale (the "basis"): constructed via
//     `OZChannelScale::OZChannelScale(double, double, PCString const&,
//        OZChannelFolder*, uint, uint, uint, OZChannelImpl*, OZChannelInfo*)`
//     with args (x=1.0, y=1.0, name=cfstring#3, folder=this, uint1=0xc,
//      uint2=0x2, uint3=0x2, impl=nullptr, info=nullptr).
//
// The default doubles (72.0 and 1.0) were recovered from RIP-relative
// literal-pool loads:
//   0x282cf1 movsd 0x48826f(%rip),%xmm0  → 0x282cf9+0x48826f = 0x70af68
//                                          → 8-byte double 72.0
//   0x282d47 movsd 0x482691(%rip),%xmm0  → 0x282d4f+0x482691 = 0x7053e0
//                                          → 8-byte double 1.0
//   (Same literal-pool addresses re-used by every ctor variant.)
//
// VPTR PATTERN — every C2 ctor installs a two-slot vptr pair AFTER calling
// the OZChannelScale base ctor (which stomps them), by rip-relative leaq
// targeting `__DATA_CONST,__const` at the OZChannelMaterialMapScale vtable
// (primary + secondary). D1 and D0 rewrite these back to the OZChannel2D
// vtable before tearing down the basis sub-channel — the standard
// "unwind base vtable" pattern from Itanium ABI destructor sequencing.
// The vtable pointers themselves are not resolved here (the port uses
// JS prototype chain for polymorphism); we only cite the leaq addresses.
//
// FACTORY SINGLETON — three ctors reference
// `OZChannelMaterialMapScale_Factory::getInstance()` via a
// std::__1::call_once + a `_instanceOnce`/`_instance` global pair:
//   • C2 factoryless folder-taking @0x282c00-0x282c34
//   • C2 dd folder-taking          @0x283000-0x283048
// The other C2s (factory-taking + factory-name-uint + copy) don't hit
// call_once because they either forward the caller's factory or take
// the base copy-ctor path.
//
// FRONTIER CALLEES — throwing stubs citing every call site. Each stub
// remains a THROW so the gate can detect frontier work.

import type { PCString } from "../infra/PCString";
import type { OZChannelBase } from "./OZChannelBase";
import type { OZChannelInfo } from "./OZChannelInfo";
import type { OZChannel } from "./OZChannel";
import type { OZChannelBool } from "./OZChannelBool";
import type { OZChannelDouble } from "./OZChannelDouble";
import type { OZChannelScale } from "./OZChannelScale";

/** Opaque `OZFactory*` — passed straight through to OZChannelScale base ctors. */
export type OZFactory = object;

/** Opaque `OZChannelFolder*` — parent folder passed through. */
export type OZChannelFolder = object;

/**
 * Opaque `OZChannelImpl*` — per-instance impl slot. Consumed only by
 * the sub-channel ctors (all sub-channels here are constructed with
 * `impl = nullptr` — the sub-ctors themselves handle the null-→-singleton
 * fallback if needed).
 */
export type OZChannelImpl = object;

// ─────────────────────────────────────────────────────────────────────────
// Frontier callees. Each throws with the call site cited by @0xADDR.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelMaterialMapScale_Factory::getInstance()` @Ozone U-extern —
 * factory singleton wired through std::__1::call_once against the pair
 * `_ZN33OZChannelMaterialMapScale_Factory13_instanceOnceE` (once-flag)
 * and `_ZN33OZChannelMaterialMapScale_Factory9_instanceE` (pointer).
 * Called from the factoryless ctors:
 *   • C2 factoryless folder-taking @Ozone 0x282c00-0x282c34
 *   • C2 dd folder-taking          @Ozone 0x283000-0x283048
 * NOT yet transcribed — the `_Factory` suffix class is excluded from
 * the leaf ledger by BAD_TOK; a dedicated infra pass owns it.
 */
function OZChannelMaterialMapScale_Factory__getInstance(): OZFactory {
  throw new Error(
    "OZChannelMaterialMapScale_Factory::getInstance() @Ozone U-extern " +
      "__ZN33OZChannelMaterialMapScale_Factory11getInstanceEv " +
      "(not yet transcribed) — invoked via std::__1::call_once by " +
      "OZChannelMaterialMapScale C2 factoryless folder-taking @0x282c00-0x282c34 " +
      "and C2 dd folder-taking @0x283000-0x283048",
  );
}

/**
 * `OZChannelScale::OZChannelScale(OZFactory*, PCString const&,
 *   OZChannelFolder*, uint, uint, uint, OZChannelImpl*, OZChannelInfo*)`
 * @ProChannel `__ZN14OZChannelScaleC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo`
 * — the 8-arg folder-taking OZChannelScale base ctor. Called as
 * `OZChannelScale::C2(this, factory, name, folder, uint1, uint2, uint3,
 *   impl, info)` from:
 *   • C2 factoryless folder-taking @Ozone 0x282c59
 *     (factory=OZChannelMaterialMapScale_Factory::getInstance())
 *   • C2 factory-taking folder-taking @Ozone 0x282e31
 *     (factory=caller's OZFactory*)
 * with `uint3=0x2` (constant `movl $0x2,(%rsp)` @0x282c43 and @0x282e2a)
 * and `impl=nullptr, info=nullptr` (from `xorps %xmm0,%xmm0; movups`
 * pair storing 16 bytes of zero into `0x8(%rsp)`).
 * NOT yet transcribed on the Ozone side (OZChannelScale.ts still
 * exposes it as a frontier stub through its own newWith factories).
 */
function OZChannelScale__C2_factory_folder(
  _self: OZChannelMaterialMapScale,
  _factory: OZFactory,
  _name: PCString,
  _folder: OZChannelFolder | null,
  _uint1: number,
  _uint2: number,
  _uint3: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelScale::OZChannelScale(OZFactory*, PCString const&, OZChannelFolder*, uint, uint, uint, " +
      "OZChannelImpl*, OZChannelInfo*) @ProChannel U-extern " +
      "__ZN14OZChannelScaleC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale " +
      "C2 factoryless folder-taking @0x282c59 (factory=OZChannelMaterialMapScale_Factory singleton), " +
      "C2 factory-folder-taking @0x282e31 (factory=caller). uint3=0x2 const, impl=info=nullptr.",
  );
}

/**
 * `OZChannelScale::OZChannelScale(double, double, OZFactory*,
 *   PCString const&, OZChannelFolder*, uint, uint, uint, OZChannelImpl*,
 *   OZChannelInfo*)` @ProChannel U-extern
 * `__ZN14OZChannelScaleC2EddP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo`
 * — the 10-arg (dx, dy)-taking OZChannelScale base ctor. Called from:
 *   • C2 dd folder-taking @Ozone 0x28306d
 *     (dx,dy from caller — OZChannelMaterialMapScale's OUTER
 *     scale values become the OZChannelScale base's stored (x,y));
 *     factory=OZChannelMaterialMapScale_Factory singleton;
 *     folder=caller; uint1/uint2=caller; uint3=0x2 (const);
 *     impl=info=nullptr.
 * NOT yet transcribed on the Ozone side.
 */
function OZChannelScale__C2_dd_factory_folder(
  _self: OZChannelMaterialMapScale,
  _dx: number,
  _dy: number,
  _factory: OZFactory,
  _name: PCString,
  _folder: OZChannelFolder | null,
  _uint1: number,
  _uint2: number,
  _uint3: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelScale::OZChannelScale(double, double, OZFactory*, PCString const&, OZChannelFolder*, " +
      "uint, uint, uint, OZChannelImpl*, OZChannelInfo*) @ProChannel U-extern " +
      "__ZN14OZChannelScaleC2EddP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale " +
      "C2 dd folder-taking @0x28306d",
  );
}

/**
 * `OZChannelScale::OZChannelScale(OZFactory*, PCString const&, uint)`
 * @ProChannel U-extern
 * `__ZN14OZChannelScaleC2EP9OZFactoryRK8PCStringj` — the 3-arg
 * factory-name-uint OZChannelScale base ctor. Called from:
 *   • C2 factory-name-uint @Ozone 0x283232
 *     (factory=caller, name=caller, uint=caller).
 * NOT yet transcribed on the Ozone side.
 */
function OZChannelScale__C2_factory_name_uint(
  _self: OZChannelMaterialMapScale,
  _factory: OZFactory,
  _name: PCString,
  _uint: number,
): void {
  throw new Error(
    "OZChannelScale::OZChannelScale(OZFactory*, PCString const&, uint) @ProChannel U-extern " +
      "__ZN14OZChannelScaleC2EP9OZFactoryRK8PCStringj " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale " +
      "C2 factory-name-uint @0x283232",
  );
}

/**
 * `OZChannelScale::OZChannelScale(OZChannelScale const&, OZChannelFolder*)`
 * @ProChannel U-extern `__ZN14OZChannelScaleC2ERKS_P15OZChannelFolder` —
 * OZChannelScale base copy-ctor. Called from:
 *   • C2 copy @Ozone 0x283401 (folder=caller-forwarded)
 * NOT yet transcribed on the Ozone side.
 */
function OZChannelScale__C2_copy(
  _self: OZChannelMaterialMapScale,
  _src: OZChannelMaterialMapScale,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChannelScale::OZChannelScale(OZChannelScale const&, OZChannelFolder*) @ProChannel U-extern " +
      "__ZN14OZChannelScaleC2ERKS_P15OZChannelFolder " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale C2 copy @0x283401",
  );
}

/**
 * `OZChannelScale::~OZChannelScale()` @ProChannel U-extern
 * `__ZN14OZChannelScaleD2Ev` — OZChannelScale base destructor.
 * Called from every C2 ctor's exception-unwind path:
 *   • C2 factoryless folder-taking unwind @0x282dbe, @0x282dda, @0x282ded
 *   • C2 factory-folder-taking unwind     @0x282f94, @0x282fb0, @0x282fc3
 *   • C2 dd folder-taking unwind          @0x2831d2, @0x2831ee, @0x283201
 *   • C2 factory-name-uint unwind         @0x283395, @0x2833b1, @0x2833c4
 *   • C2 copy unwind                      @0x2834a9, @0x2834bc
 * ALSO called from D0 as part of the compound destructor sequence.
 * NOT yet transcribed on the Ozone side.
 */
function OZChannelScale__dtor(_self: OZChannelMaterialMapScale): void {
  throw new Error(
    "OZChannelScale::~OZChannelScale() @ProChannel U-extern " +
      "__ZN14OZChannelScaleD2Ev " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale " +
      "C2 unwind paths and D0/D1 base-teardown",
  );
}

/**
 * `OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*,
 *   uint, uint, OZChannelImpl*, OZChannelInfo*)` @Ozone U-extern
 * `__ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 * (C1) — constructs the +0x1b8 OZChannelBool sub-channel. Called from:
 *   • C2 factoryless folder-taking @0x282cba (value=1, name=cfstring#1,
 *     folder=this, group=0xa, sub=0x0, impl=info=nullptr)
 *   • C2 factory-folder-taking     @0x282e92 (same args)
 *   • C2 dd folder-taking          @0x2830ce (same args)
 *   • C2 factory-name-uint         @0x283293 (same args)
 * NOT yet transcribed.
 */
function OZChannelBool__C1(
  _self: OZChannelBool,
  _value: number,
  _name: PCString,
  _folder: OZChannelFolder | null,
  _group: number,
  _sub: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*, uint, uint, " +
      "OZChannelImpl*, OZChannelInfo*) @Ozone U-extern " +
      "__ZN13OZChannelBoolC1EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale " +
      "C2 factoryless-folder @0x282cba, factory-folder @0x282e92, " +
      "dd-folder @0x2830ce, factory-name-uint @0x283293 " +
      "(value=1, group=0xa, sub=0x0, impl=info=nullptr)",
  );
}

/**
 * `OZChannelBool::~OZChannelBool()` @Ozone U-extern
 * `__ZN13OZChannelBoolD1Ev` — OZChannelBool destructor.
 * Called from:
 *   • C2 exception-unwind paths (post-Bool-ctor failure of Double/Scale ctors)
 *     @0x282f8c (factoryless), @0x282f8c-like (factory-folder), etc.
 *   • D1 body @0x28368d
 *   • D0 body @0x28374d
 * NOT yet transcribed.
 */
function OZChannelBool__dtor(_self: OZChannelBool): void {
  throw new Error(
    "OZChannelBool::~OZChannelBool() @Ozone U-extern __ZN13OZChannelBoolD1Ev " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale " +
      "D1 @0x28368d, D0 @0x28374d, and C2 unwind paths",
  );
}

/**
 * `OZChannelDouble::OZChannelDouble(double, PCString const&,
 *   OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*)`
 * @Ozone `__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 * (C2) — constructs the +0x250 OZChannelDouble sub-channel. Called from:
 *   • C2 factoryless folder-taking @0x282d11 (value=72.0,
 *     name=cfstring#2, folder=this, group=0xb, sub=0x2, impl=info=nullptr)
 *   • C2 factory-folder-taking     @0x282ee9 (same args)
 *   • C2 dd folder-taking          @0x283125 (same args)
 *   • C2 factory-name-uint         @0x2832ea (same args)
 * NOT yet transcribed.
 */
function OZChannelDouble__C2(
  _self: OZChannelDouble,
  _value: number,
  _name: PCString,
  _folder: OZChannelFolder | null,
  _group: number,
  _sub: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, uint, uint, " +
      "OZChannelImpl*, OZChannelInfo*) @Ozone U-extern " +
      "__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale " +
      "C2 factoryless-folder @0x282d11, factory-folder @0x282ee9, " +
      "dd-folder @0x283125, factory-name-uint @0x2832ea " +
      "(value=72.0, group=0xb, sub=0x2, impl=info=nullptr)",
  );
}

/**
 * `OZChannelScale::OZChannelScale(double, double, PCString const&,
 *   OZChannelFolder*, uint, uint, uint, OZChannelImpl*, OZChannelInfo*)`
 * @ProChannel `__ZN14OZChannelScaleC1EddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo`
 * (C1) — constructs the +0x2e8 "basis" OZChannelScale sub-channel.
 * Called from:
 *   • C2 factoryless folder-taking @0x282d6a (x=1.0, y=1.0,
 *     name=cfstring#3, folder=this, uint1=0xc, uint2=0x2, uint3=0x2,
 *     impl=info=nullptr)
 *   • C2 factory-folder-taking     @0x282f42 (same args)
 *   • C2 dd folder-taking          @0x28317e (same args — note:
 *     the OUTER (x,y) go to the OZChannelScale BASE, not to this basis;
 *     the basis is ALWAYS initialized to (1.0, 1.0) regardless)
 *   • C2 factory-name-uint         @0x283343 (same args)
 * NOT yet transcribed on the Ozone side.
 */
function OZChannelScale__C1_dd_folder(
  _self: OZChannelScale,
  _dx: number,
  _dy: number,
  _name: PCString,
  _folder: OZChannelFolder | null,
  _uint1: number,
  _uint2: number,
  _uint3: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelScale::OZChannelScale(double, double, PCString const&, OZChannelFolder*, uint, uint, uint, " +
      "OZChannelImpl*, OZChannelInfo*) @ProChannel U-extern " +
      "__ZN14OZChannelScaleC1EddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale basis-init @0x282d6a, @0x282f42, @0x28317e, @0x283343 " +
      "(x=1.0, y=1.0, uint1=0xc, uint2=0x2, uint3=0x2, impl=info=nullptr)",
  );
}

/**
 * `OZChannelScale::OZChannelScale(OZChannelScale const&, OZChannelFolder*)`
 * @ProChannel U-extern `__ZN14OZChannelScaleC1ERKS_P15OZChannelFolder`
 * (C1 shim) — used to copy-construct the basis sub-channel in C2 copy.
 * Called from:
 *   • C2 copy @0x283480 (source=source.basis, folder=this)
 * NOT yet transcribed on the Ozone side.
 */
function OZChannelScale__C1_copy(
  _self: OZChannelScale,
  _src: OZChannelScale,
  _folder: OZChannelFolder,
): void {
  throw new Error(
    "OZChannelScale::OZChannelScale(OZChannelScale const&, OZChannelFolder*) @ProChannel U-extern " +
      "__ZN14OZChannelScaleC1ERKS_P15OZChannelFolder " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale C2 copy @0x283480",
  );
}

/**
 * `OZChannelBool::OZChannelBool(OZChannelBool const&, OZChannelFolder*)`
 * @Ozone U-extern `__ZN13OZChannelBoolC1ERKS_P15OZChannelFolder`
 * (C1) — copy-ctor for the Bool sub-channel in C2 copy.
 * Called from:
 *   • C2 copy @0x28342f (source=source.bool@+0x1b8, folder=this)
 * NOT yet transcribed.
 */
function OZChannelBool__C1_copy(
  _self: OZChannelBool,
  _src: OZChannelBool,
  _folder: OZChannelFolder,
): void {
  throw new Error(
    "OZChannelBool::OZChannelBool(OZChannelBool const&, OZChannelFolder*) @Ozone U-extern " +
      "__ZN13OZChannelBoolC1ERKS_P15OZChannelFolder " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale C2 copy @0x28342f",
  );
}

/**
 * `OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)` @Ozone
 * U-extern `__ZN9OZChannelC2ERKS_P15OZChannelFolder` (C2) — the base
 * OZChannel copy-ctor. Called from the C2 copy path for the Double
 * sub-channel: rather than call OZChannelDouble's dedicated copy-ctor,
 * the asm invokes OZChannel::C2 and then MANUALLY re-writes the two
 * vptrs at +0x250 / +0x260 to install OZChannelDouble's own vtable
 * (loaded from `__ZTV15OZChannelDouble` @0x59f46c-relative).
 *   • C2 copy @0x283448 (source=source.double@+0x250, folder=this)
 * Rewrite pattern: `movq __ZTV15OZChannelDouble(%rip),%rax;
 *                   leaq 0x10(%rax),%rcx; movq %rcx,0x250(%rbx);
 *                   addq $0x370,%rax; movq %rax,0x260(%rbx)`
 * (installs `vtable+0x10` at +0x250 and `vtable+0x360` at +0x260).
 * NOT yet transcribed.
 */
function OZChannel__C2_copy(
  _self: OZChannel,
  _src: OZChannel,
  _folder: OZChannelFolder,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @Ozone U-extern " +
      "__ZN9OZChannelC2ERKS_P15OZChannelFolder " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale C2 copy @0x283448 " +
      "(followed by manual OZChannelDouble vtable install: +0x10 at +0x250, +0x360 at +0x260)",
  );
}

/**
 * `OZChannel::~OZChannel()` @Ozone U-extern `__ZN9OZChannelD2Ev` (D2) —
 * base destructor for OZChannel. Called from:
 *   • C2 copy unwind @0x283494 (double sub-channel teardown)
 *   • D1 body @0x283681 (Double sub-channel @+0x250)
 *   • D1 body @0x2836a0 (OZChannel Y of OZChannelScale base @+0x120)
 *   • D1 body @0x2836ac (OZChannel X of OZChannelScale base @+0x88)
 *   • D1 body @0x283661 (basis inner @+0x408 — X of basis's OZChannel2D)
 *   • D1 body @0x28366d (basis inner @+0x370 — Y of basis's OZChannel2D)
 *   • D0 mirrors of all six.
 * NOT yet transcribed.
 */
function OZChannel__dtor(_self: OZChannel): void {
  throw new Error(
    "OZChannel::~OZChannel() @Ozone U-extern __ZN9OZChannelD2Ev " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale " +
      "D1 @+0x250/@+0x120/@+0x88/@+0x408/@+0x370 and D0 mirrors, plus C2 copy unwind @0x283494",
  );
}

/**
 * `OZCompoundChannel::~OZCompoundChannel()` @Ozone U-extern
 * `__ZN17OZCompoundChannelD2Ev` (D2). Called from:
 *   • D1 body @0x283675 (basis's OZCompoundChannel base @+0x2e8)
 *   • D1 tail-jmp @0x2836bc (this's OZCompoundChannel base @+0x00)
 *   • D0 mirrors @0x283735 and @0x283774.
 * NOT yet transcribed here (three trivial methods live in
 * raw-port/src/channels/OZCompoundChannel.ts, but the D2 dtor is a
 * ProChannel U-extern).
 */
function OZCompoundChannel__dtor(_self: OZChannelMaterialMapScale): void {
  throw new Error(
    "OZCompoundChannel::~OZCompoundChannel() @Ozone U-extern " +
      "__ZN17OZCompoundChannelD2Ev " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale " +
      "D1 body @0x283675, D1 tail-jmp @0x2836bc, D0 mirrors @0x283735/@0x283774",
  );
}

/**
 * `OZChannelBase::reset(bool)` @Ozone U-extern
 * `__ZN13OZChannelBase5resetEb`. Called from:
 *   • setBasisScale @0x2835e2 (`(this+0x2e8)->reset(false)` — reset the
 *     basis sub-channel BEFORE writing new (x,y) via
 *     OZChannel2D::setValue).
 * NOT yet transcribed.
 */
function OZChannelBase__reset(_self: OZChannelBase, _flag: boolean): void {
  throw new Error(
    "OZChannelBase::reset(bool) @Ozone U-extern __ZN13OZChannelBase5resetEb " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale::setBasisScale @0x2835e2",
  );
}

/**
 * `OZChannel2D::setValue(CMTime const&, double, double, bool)` @Ozone
 * U-extern `__ZN11OZChannel2D8setValueERK6CMTimeddb`. Called from:
 *   • setBasisScale @0x283603 (tail-jmp; `t=kCMTimeZero, x, y, b=false`
 *     where (x,y) are the caller's arguments and `this` is the basis
 *     sub-channel @this+0x2e8).
 * NOT yet transcribed on the Ozone side.
 */
function OZChannel2D__setValue(
  _self: OZChannelScale,
  _t: CMTime,
  _x: number,
  _y: number,
  _flag: boolean,
): void {
  throw new Error(
    "OZChannel2D::setValue(CMTime const&, double, double, bool) @Ozone U-extern " +
      "__ZN11OZChannel2D8setValueERK6CMTimeddb " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale::setBasisScale @0x283603 (tail-jmp)",
  );
}

/**
 * `OZChannel2D::copy(OZChannelBase const*, bool)` @Ozone U-extern
 * `__ZN11OZChannel2D4copyEPK13OZChannelBaseb`. Called TWICE from
 * OZChannelMaterialMapScale::copy:
 *   • @0x283533 first — to copy the OZChannelScale base subobject
 *     (which itself extends OZChannel2D at offset 0), passing the
 *     RAW caller-supplied `OZChannelBase const*` before dynamic_cast
 *     (so the OZChannel2D copy sees a base subobject).
 *   • @0x2835ae tail-jmp — to copy the +0x2e8 BASIS sub-channel
 *     (which is itself an OZChannelScale, hence also an OZChannel2D).
 * NOT yet transcribed.
 */
function OZChannel2D__copy(
  _self: OZChannelScale,
  _src: OZChannelBase | null,
  _flag: boolean,
): void {
  throw new Error(
    "OZChannel2D::copy(OZChannelBase const*, bool) @Ozone U-extern " +
      "__ZN11OZChannel2D4copyEPK13OZChannelBaseb " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale::copy @0x283533 (base) and @0x2835ae (basis tail-jmp)",
  );
}

/**
 * `OZChannel::copy(OZChannelBase const*, bool)` @Ozone U-extern
 * `__ZN9OZChannel4copyEPK13OZChannelBaseb`. Called TWICE from
 * OZChannelMaterialMapScale::copy:
 *   • @0x283572 — copy the +0x1b8 OZChannelBool sub-channel.
 *   • @0x283588 — copy the +0x250 OZChannelDouble sub-channel.
 * Both sub-channels have their +0xNN offsets applied to BOTH `this`
 * (destination) AND the dynamic_cast'd source pointer.
 * NOT yet transcribed.
 */
function OZChannel__copy(
  _self: OZChannel,
  _src: OZChannel | null,
  _flag: boolean,
): void {
  throw new Error(
    "OZChannel::copy(OZChannelBase const*, bool) @Ozone U-extern " +
      "__ZN9OZChannel4copyEPK13OZChannelBaseb " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale::copy " +
      "twice: @0x283572 (Bool @+0x1b8) and @0x283588 (Double @+0x250)",
  );
}

/**
 * `__dynamic_cast(void*, const std::type_info*, const std::type_info*, ptrdiff_t)`
 * @Ozone U-extern `___dynamic_cast`. Called from:
 *   • copy @0x283550 — `dynamic_cast<OZChannelMaterialMapScale*>(src)`
 *     using typeinfo pair (`__ZTI13OZChannelBase` src, `__ZTI25OZChannelMaterialMapScale`
 *     dst), offset=0. Result overwrites the caller-supplied pointer
 *     for the rest of copy.
 * NOT yet transcribed.
 */
function dynamic_cast_to_MaterialMapScale(
  _src: OZChannelBase,
): OZChannelMaterialMapScale | null {
  throw new Error(
    "__dynamic_cast @Ozone U-extern ___dynamic_cast " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale::copy @0x283550 " +
      "casting OZChannelBase* → OZChannelMaterialMapScale*",
  );
}

/**
 * `operator new(unsigned long)` @Ozone U-extern `__Znwm`. Called from:
 *   • clone @0x2834ef — size=0x4a0 (1184 bytes = sizeof(OZChannelMaterialMapScale)).
 * NOT yet transcribed.
 */
function operator_new(_size: number): object {
  throw new Error(
    "operator new(unsigned long) @Ozone U-extern __Znwm " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale::clone @0x2834ef (size=0x4a0)",
  );
}

/**
 * `operator delete(void*)` @Ozone U-extern `__ZdlPv`. Called from:
 *   • D0 tail-jmp @0x283784 (delete-form dtor final step)
 *   • clone exception unwind @0x283512 (delete half-constructed copy)
 * NOT yet transcribed.
 */
function operator_delete(_p: object): void {
  throw new Error(
    "operator delete(void*) @Ozone U-extern __ZdlPv " +
      "(not yet transcribed) — invoked by OZChannelMaterialMapScale " +
      "D0 tail-jmp @0x283784, clone unwind @0x283512",
  );
}

/**
 * `kCMTimeZero` (Ozone dyld-bound literal-pool addr, RIP-relative from
 * setBasisScale @0x2835e7 → target 0x283609 + 0x5a0f22 = 0x8bd530).
 * Consumed by setBasisScale's tail-jmp to OZChannel2D::setValue as the
 * `CMTime const&` first argument. Not transcribed here; the CMTime
 * class is a leaf infra type imported from raw-port/src/infra/CMTime.ts.
 */
import type { CMTime } from "../infra/CMTime";
const kCMTimeZero_frontier: () => CMTime = () => {
  throw new Error(
    "kCMTimeZero @Ozone U-extern _kCMTimeZero " +
      "(not yet resolved as a JS CMTime constant) — referenced by " +
      "OZChannelMaterialMapScale::setBasisScale @0x2835e7",
  );
};

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelMaterialMapScale` — an Ozone compound channel that extends
 * `OZChannelScale` (ProChannel) with three additional sub-channels
 * (a Bool, a Double, and an inner "basis" OZChannelScale).
 *
 * sizeof = 0x4a0 (1184 bytes, from clone @0x2834ea).
 *
 * Layout — verified from clone + every ctor + D1/D0:
 *   +0x000        primary vptr    (installed at end of every C2 by
 *                                  rip-relative leaq at ctor's post-
 *                                  base-ctor step)
 *   +0x010        secondary vptr  (same pattern)
 *   +0x000..0x1b7 OZChannelScale base subobject (which itself contains
 *                                  X sub-channel @+0x88 and Y sub-channel
 *                                  @+0x120 as part of OZChannelScale's
 *                                  own layout)
 *   +0x1b8        OZChannelBool sub-channel
 *                                  (constructed with value=1, group=0xa,
 *                                   sub=0x0, impl=info=nullptr; name
 *                                   from cfstring#1)
 *   +0x250        OZChannelDouble sub-channel
 *                                  (constructed with value=72.0, group=0xb,
 *                                   sub=0x2, impl=info=nullptr; name
 *                                   from cfstring#2)
 *   +0x2e8..0x49f OZChannelScale "basis" sub-channel
 *                                  (constructed with (x,y)=(1.0,1.0),
 *                                   uint1=0xc, uint2=0x2, uint3=0x2,
 *                                   impl=info=nullptr; name from cfstring#3;
 *                                   size = sizeof(OZChannelScale) = 0x1b8)
 *
 * NB: We do NOT `extends OZChannelScale` here — OZChannelScale's ctors
 * are themselves frontier stubs (see raw-port/src/channels/OZChannelScale.ts),
 * so extends-inheritance would propagate un-populatable fields. Instead
 * we mirror OZChannelScale's own pattern and let each factory method
 * invoke the frontier base ctors explicitly. When OZChannelScale flips
 * from frontier to concrete, this class can flip to `extends OZChannelScale`
 * in a one-line diff.
 *
 * All five C2 factory methods (factoryless folder-taking, factory
 * folder-taking, dd folder-taking, factory-name-uint, copy) plus the
 * two dtors (D1/D0) mirror the asm step-for-step.
 */
export class OZChannelMaterialMapScale {
  // Primary and secondary vptrs are implicit in the JS prototype chain.

  /**
   * `OZChannelMaterialMapScale::OZChannelMaterialMapScale(
   *    PCString const&, OZChannelFolder*, uint, uint)` @Ozone 0x00282be0 [C2].
   *
   * Faithful transcription of the asm's control flow:
   *   1. Frame setup + reg spills @0x282be0-0x282bfd:
   *        rdi=this (→rbx), rsi=name (→r13), rdx=folder (→r12),
   *        ecx=uint1 (→r15d), r8d=uint2 (→r14d).
   *   2. Factory once-init @0x282c00-0x282c34:
   *        std::__1::call_once(_instanceOnce, &getInstance_lambda_proxy).
   *        r15d/r14d preservation via caller's frame slots.
   *   3. Load factory pointer @0x282c34:
   *        rsi = OZChannelMaterialMapScale_Factory::_instance
   *   4. Base-ctor arg staging @0x282c3b-0x282c56:
   *        [rsp+16] = 0 (info=nullptr)
   *        [rsp+8]  = 0 (impl=nullptr)
   *        [rsp+0]  = 2 (uint3 const)
   *        rdi=this, rsi=factory, rdx=name (r13), rcx=folder (r12),
   *        r8d=uint1 (r15d), r9d=uint2 (r14d).
   *   5. @0x282c59 callq OZChannelScale::OZChannelScale(OZFactory*,
   *        PCString&, OZChannelFolder*, uint, uint, uint,
   *        OZChannelImpl*, OZChannelInfo*).
   *   6. Vptr installs (post base) @0x282c5e-0x282c6f:
   *        *(this+0x00) = &vtable + 0x5c862b   (leaq rip-rel)
   *        *(this+0x10) = &vtable + 0x5c8969   (leaq rip-rel)
   *   7. Cfstring#1 fetch via _theApp @0x282c73-0x282c8f — builds a
   *      transient PCString from a CFStringRef pulled through
   *      `_theApp->0x48` (a bundle pointer). The exact string is a
   *      localizable cfstring at rip-rel disp 0x616a27 — the raw
   *      pointer resolves through the chained-fixup table (not
   *      dereferenced here).
   *   8. Construct OZChannelBool @+0x1b8 @0x282c94-0x282cba:
   *        `OZChannelBool::OZChannelBool(1, name#1, this, 0xa, 0,
   *          nullptr, nullptr)`
   *   9. Destruct transient PCString @0x282cbf-0x282cc3.
   *  10. Cfstring#2 fetch @0x282cc8-0x282cdd, then construct
   *      OZChannelDouble @+0x250 @0x282ce2-0x282d11:
   *        `OZChannelDouble::OZChannelDouble(72.0, name#2, this, 0xb, 2,
   *          nullptr, nullptr)`
   *  11. Destruct transient PCString @0x282d16-0x282d1a.
   *  12. Cfstring#3 fetch @0x282d1f-0x282d34, then construct basis
   *      OZChannelScale @+0x2e8 @0x282d39-0x282d6a:
   *        `OZChannelScale::OZChannelScale(1.0, 1.0, name#3, this, 0xc,
   *          2, 2, nullptr, nullptr)`
   *  13. Destruct transient PCString @0x282d6f-0x282d73.
   *  14. Frame teardown + retq @0x282d78-0x282d86.
   *  Exception paths @0x282d87-0x282df5: PCString D1, OZChannel D2,
   *    OZChannelBool D1, OZChannelScale (base) D2, then __Unwind_Resume.
   *  The specific unwind chain depends on how far ctor progressed.
   */
  static newFactoryless_folder(
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
  ): OZChannelMaterialMapScale {
    const self = new OZChannelMaterialMapScale();

    // Steps 2-3 — @0x282c00-0x282c34: factory singleton via call_once.
    const factory = OZChannelMaterialMapScale_Factory__getInstance();

    // Step 5 — @0x282c59: OZChannelScale base ctor.
    //   args: factory, name, folder, uint1, uint2, uint3=0x2, impl=null, info=null
    OZChannelScale__C2_factory_folder(
      self,
      factory,
      name,
      folder,
      uint1,
      uint2,
      0x2,
      null,
      null,
    );

    // Step 8 — @0x282cba: Bool sub-channel @+0x1b8.
    OZChannelBool__C1(
      self.boolSubChannel(),
      1,
      self.name_cfstring1(),
      self as unknown as OZChannelFolder,
      0xa,
      0x0,
      null,
      null,
    );

    // Step 10 — @0x282d11: Double sub-channel @+0x250 (default 72.0).
    OZChannelDouble__C2(
      self.doubleSubChannel(),
      72.0,
      self.name_cfstring2(),
      self as unknown as OZChannelFolder,
      0xb,
      0x2,
      null,
      null,
    );

    // Step 12 — @0x282d6a: basis OZChannelScale sub-channel @+0x2e8
    //   with default (x,y) = (1.0, 1.0).
    OZChannelScale__C1_dd_folder(
      self.basisSubChannel(),
      1.0,
      1.0,
      self.name_cfstring3(),
      self as unknown as OZChannelFolder,
      0xc,
      0x2,
      0x2,
      null,
      null,
    );

    return self;
  }

  /**
   * `OZChannelMaterialMapScale::OZChannelMaterialMapScale(
   *    PCString const&, OZChannelFolder*, uint, uint)` @Ozone 0x00282e00 [C1 shim] —
   * trivial `pushq %rbp; movq %rsp, %rbp; popq %rbp; jmp C2` per Itanium ABI aliasing.
   */
  static newFactoryless_folder_C1(
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
  ): OZChannelMaterialMapScale {
    return OZChannelMaterialMapScale.newFactoryless_folder(name, folder, uint1, uint2);
  }

  /**
   * `OZChannelMaterialMapScale::OZChannelMaterialMapScale(OZFactory*,
   *    PCString const&, OZChannelFolder*, uint, uint)` @Ozone 0x00282e10 [C2].
   *
   * Faithful transcription:
   *   1. Frame setup + spills @0x282e10-0x282e1f (rdi=this→rbx).
   *   2. Base-ctor arg staging @0x282e22-0x282e2a:
   *        [rsp+16] = 0 (info=nullptr)
   *        [rsp+8]  = 0 (impl=nullptr)
   *        [rsp+0]  = 2 (uint3 const)
   *      Register args are already positioned per the ABI (rdi=this,
   *      rsi=factory, rdx=name, rcx=folder, r8d=uint1, r9d=uint2).
   *   3. @0x282e31 callq OZChannelScale::OZChannelScale(OZFactory*,
   *        PCString&, OZChannelFolder*, uint, uint, uint,
   *        OZChannelImpl*, OZChannelInfo*).
   *   4. Vptr installs (post base) @0x282e36-0x282e47:
   *        *(this+0x00) = &vtable + 0x5c8453   (leaq rip-rel)
   *        *(this+0x10) = &vtable + 0x5c8791   (leaq rip-rel)
   *   5. Cfstring#1 fetch @0x282e4b-0x282e67 then OZChannelBool @+0x1b8
   *      @0x282e6c-0x282e92 (value=1, group=0xa, sub=0, impl=info=nullptr).
   *   6. PCString D1 @0x282e97-0x282e9b.
   *   7. Cfstring#2 fetch @0x282ea0-0x282eb5, OZChannelDouble @+0x250
   *      @0x282eba-0x282ee9 (value=72.0, group=0xb, sub=2, impl=info=nullptr).
   *   8. PCString D1 @0x282eee-0x282ef2.
   *   9. Cfstring#3 fetch @0x282ef7-0x282f0c, basis OZChannelScale @+0x2e8
   *      @0x282f11-0x282f42 (x=1.0, y=1.0, uint1=0xc, uint2=2, uint3=2,
   *      impl=info=nullptr).
   *  10. PCString D1 @0x282f47-0x282f4b.
   *  11. Frame teardown + retq @0x282f50-0x282f5c.
   *  Exception paths @0x282f5d-0x282fcb identical shape to the
   *  factoryless variant.
   *
   * The only structural difference from newFactoryless_folder is that
   * the factory pointer here is caller-supplied (no call_once).
   */
  static newFactory_folder(
    factory: OZFactory,
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
  ): OZChannelMaterialMapScale {
    const self = new OZChannelMaterialMapScale();

    // Step 3 — @0x282e31: base ctor with caller's factory.
    OZChannelScale__C2_factory_folder(
      self,
      factory,
      name,
      folder,
      uint1,
      uint2,
      0x2,
      null,
      null,
    );

    // Step 5 — @0x282e92: Bool @+0x1b8.
    OZChannelBool__C1(
      self.boolSubChannel(),
      1,
      self.name_cfstring1(),
      self as unknown as OZChannelFolder,
      0xa,
      0x0,
      null,
      null,
    );

    // Step 7 — @0x282ee9: Double @+0x250 (72.0).
    OZChannelDouble__C2(
      self.doubleSubChannel(),
      72.0,
      self.name_cfstring2(),
      self as unknown as OZChannelFolder,
      0xb,
      0x2,
      null,
      null,
    );

    // Step 9 — @0x282f42: basis @+0x2e8 (1.0, 1.0).
    OZChannelScale__C1_dd_folder(
      self.basisSubChannel(),
      1.0,
      1.0,
      self.name_cfstring3(),
      self as unknown as OZChannelFolder,
      0xc,
      0x2,
      0x2,
      null,
      null,
    );

    return self;
  }

  /**
   * `OZChannelMaterialMapScale::OZChannelMaterialMapScale(OZFactory*,
   *    PCString const&, OZChannelFolder*, uint, uint)` @Ozone 0x00282fd0 [C1 shim].
   */
  static newFactory_folder_C1(
    factory: OZFactory,
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
  ): OZChannelMaterialMapScale {
    return OZChannelMaterialMapScale.newFactory_folder(factory, name, folder, uint1, uint2);
  }

  /**
   * `OZChannelMaterialMapScale::OZChannelMaterialMapScale(double, double,
   *    PCString const&, OZChannelFolder*, uint, uint)` @Ozone 0x00282fe0 [C2].
   *
   * Faithful transcription:
   *   1. Frame setup + spills @0x282fe0-0x282ffd:
   *        rdi=this (→rbx), rsi=name (→r13), rdx=folder (→r12),
   *        ecx=uint1 (→r15d), r8d=uint2 (→r14d),
   *        xmm0=dx, xmm1=dy (passed through in xmm regs).
   *   2. Factory once-init @0x283000-0x283048 with xmm0/xmm1 SAVED to
   *      [rbp-0x40]/[rbp-0x48] across the call_once, then RELOADED.
   *   3. Load factory pointer @0x283048.
   *   4. Base-ctor arg staging @0x28304f-0x28306a:
   *        xmm2=0 zeroed into [rsp+8..24] (impl=info=nullptr),
   *        [rsp+0] = 2 (uint3 const),
   *        rdi=this, rsi=factory, rdx=name (r13), rcx=folder (r12),
   *        r8d=uint1 (r15d), r9d=uint2 (r14d).
   *      xmm0=dx, xmm1=dy still live.
   *   5. @0x28306d callq OZChannelScale::OZChannelScale(double, double,
   *        OZFactory*, PCString&, OZChannelFolder*, uint, uint, uint,
   *        OZChannelImpl*, OZChannelInfo*).
   *   6. Vptr installs @0x283072-0x283083.
   *   7. Bool@+0x1b8 identical to newFactoryless_folder step 8.
   *   8. Double@+0x250 identical (value=72.0).
   *   9. Basis@+0x2e8 identical ((1.0, 1.0)) — the caller-supplied
   *      (dx, dy) goes to the OUTER OZChannelScale base, NOT to the basis.
   *  10. Frame teardown + retq @0x28318c-0x28319a.
   *  Exception paths @0x28319b-0x283209 identical shape.
   */
  static newDd_folder(
    dx: number,
    dy: number,
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
  ): OZChannelMaterialMapScale {
    const self = new OZChannelMaterialMapScale();

    // Steps 2-3 — factory once-init.
    const factory = OZChannelMaterialMapScale_Factory__getInstance();

    // Step 5 — @0x28306d: OZChannelScale::C2(dx, dy, factory, name, folder,
    //                                        uint1, uint2, uint3=2, null, null).
    OZChannelScale__C2_dd_factory_folder(
      self,
      dx,
      dy,
      factory,
      name,
      folder,
      uint1,
      uint2,
      0x2,
      null,
      null,
    );

    // Step 7 — Bool @+0x1b8 (value=1, group=0xa, sub=0).
    OZChannelBool__C1(
      self.boolSubChannel(),
      1,
      self.name_cfstring1(),
      self as unknown as OZChannelFolder,
      0xa,
      0x0,
      null,
      null,
    );

    // Step 8 — Double @+0x250 (value=72.0).
    OZChannelDouble__C2(
      self.doubleSubChannel(),
      72.0,
      self.name_cfstring2(),
      self as unknown as OZChannelFolder,
      0xb,
      0x2,
      null,
      null,
    );

    // Step 9 — basis @+0x2e8 (ALWAYS (1.0, 1.0), regardless of caller (dx, dy)).
    OZChannelScale__C1_dd_folder(
      self.basisSubChannel(),
      1.0,
      1.0,
      self.name_cfstring3(),
      self as unknown as OZChannelFolder,
      0xc,
      0x2,
      0x2,
      null,
      null,
    );

    return self;
  }

  /**
   * `OZChannelMaterialMapScale::OZChannelMaterialMapScale(double, double,
   *    PCString const&, OZChannelFolder*, uint, uint)` @Ozone 0x00283210 [C1 shim].
   */
  static newDd_folder_C1(
    dx: number,
    dy: number,
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
  ): OZChannelMaterialMapScale {
    return OZChannelMaterialMapScale.newDd_folder(dx, dy, name, folder, uint1, uint2);
  }

  /**
   * `OZChannelMaterialMapScale::OZChannelMaterialMapScale(OZFactory*,
   *    PCString const&, uint)` @Ozone 0x00283220 [C2].
   *
   * Faithful transcription — the SHORTEST ctor variant (no folder, one uint):
   *   1. Frame setup + spills @0x283220-0x28322f (rdi=this→rbx).
   *   2. @0x283232 callq OZChannelScale::OZChannelScale(OZFactory*,
   *        PCString&, uint).
   *   3. Vptr installs (post base) @0x283237-0x283248:
   *        *(this+0x00) = &vtable + 0x5c8052
   *        *(this+0x10) = &vtable + 0x5c8390
   *   4. Cfstring#1 fetch + Bool@+0x1b8 identical to other ctors
   *      @0x28324c-0x283293.
   *   5. PCString D1 @0x283298-0x28329c.
   *   6. Cfstring#2 fetch + Double@+0x250 (72.0) identical
   *      @0x2832a1-0x2832ea.
   *   7. PCString D1 @0x2832ef-0x2832f3.
   *   8. Cfstring#3 fetch + basis@+0x2e8 (1.0, 1.0) identical
   *      @0x2832f8-0x283343.
   *   9. PCString D1 @0x283348-0x28334c.
   *  10. Frame teardown + retq @0x283351-0x28335d.
   *  Exception paths @0x28335e-0x2833cc identical shape.
   */
  static newFactoryNameUint(
    factory: OZFactory,
    name: PCString,
    u: number,
  ): OZChannelMaterialMapScale {
    const self = new OZChannelMaterialMapScale();

    // Step 2 — @0x283232.
    OZChannelScale__C2_factory_name_uint(self, factory, name, u);

    // Steps 4/6/8 — identical Bool/Double/basis pattern.
    OZChannelBool__C1(
      self.boolSubChannel(),
      1,
      self.name_cfstring1(),
      self as unknown as OZChannelFolder,
      0xa,
      0x0,
      null,
      null,
    );
    OZChannelDouble__C2(
      self.doubleSubChannel(),
      72.0,
      self.name_cfstring2(),
      self as unknown as OZChannelFolder,
      0xb,
      0x2,
      null,
      null,
    );
    OZChannelScale__C1_dd_folder(
      self.basisSubChannel(),
      1.0,
      1.0,
      self.name_cfstring3(),
      self as unknown as OZChannelFolder,
      0xc,
      0x2,
      0x2,
      null,
      null,
    );

    return self;
  }

  /**
   * `OZChannelMaterialMapScale::OZChannelMaterialMapScale(OZFactory*,
   *    PCString const&, uint)` @Ozone 0x002833e0 [C1 shim].
   */
  static newFactoryNameUint_C1(
    factory: OZFactory,
    name: PCString,
    u: number,
  ): OZChannelMaterialMapScale {
    return OZChannelMaterialMapScale.newFactoryNameUint(factory, name, u);
  }

  /**
   * `OZChannelMaterialMapScale::OZChannelMaterialMapScale(
   *    OZChannelMaterialMapScale const&, OZChannelFolder*)` @Ozone 0x002833f0 [C2 copy].
   *
   * Faithful transcription:
   *   1. Frame + spills @0x2833f0-0x2833fe (rdi=this→rbx, rsi=src→r15).
   *   2. @0x283401 callq OZChannelScale::OZChannelScale(OZChannelScale const&,
   *        OZChannelFolder*) — base copy-ctor.
   *   3. Vptr installs @0x283406-0x283417:
   *        *(this+0x00) = &vtable + 0x5c7e83
   *        *(this+0x10) = &vtable + 0x5c81c1
   *   4. Copy-construct Bool @+0x1b8 @0x28341b-0x28342f:
   *        `OZChannelBool::OZChannelBool(src.bool@+0x1b8, this-as-folder)`
   *   5. Copy-construct the +0x250 Double sub-channel via OZChannel base
   *      ctor then MANUAL vtable install @0x283434-0x283465:
   *        `OZChannel::OZChannel(src.double@+0x250, this-as-folder)`
   *        THEN:
   *          rax = __ZTV15OZChannelDouble
   *          *(this+0x250) = rax + 0x10   (vtable + 0x10)
   *          *(this+0x260) = rax + 0x370  (vtable + 0x360; note the leaq
   *                                        offset 0x370 uses the SLOT+0x10
   *                                        prev-loaded base)
   *      This is the well-known "downcast the OZChannel to OZChannelDouble
   *      by re-pointing its vptrs" trick used in the Ozone build.
   *   6. Copy-construct basis @+0x2e8 @0x28346c-0x283480:
   *        `OZChannelScale::OZChannelScale(src.basis@+0x2e8, this-as-folder)`
   *   7. Frame teardown + retq @0x283485-0x28348d.
   *  Exception paths @0x28348e-0x2834c4 tear down whatever was built.
   */
  static newCopy(
    src: OZChannelMaterialMapScale,
    folder: OZChannelFolder | null,
  ): OZChannelMaterialMapScale {
    const self = new OZChannelMaterialMapScale();

    // Step 2 — @0x283401: OZChannelScale base copy-ctor.
    OZChannelScale__C2_copy(self, src, folder);

    // Step 4 — @0x28342f: Bool @+0x1b8 copy.
    OZChannelBool__C1_copy(
      self.boolSubChannel(),
      src.boolSubChannel(),
      self as unknown as OZChannelFolder,
    );

    // Step 5 — @0x283448: Double @+0x250 via OZChannel base copy + manual
    //         vtable install (the vtable slots are opaque to JS — the
    //         prototype chain handles polymorphism, so we just call the
    //         OZChannel base copy stub).
    OZChannel__C2_copy(
      self.doubleSubChannel(),
      src.doubleSubChannel(),
      self as unknown as OZChannelFolder,
    );

    // Step 6 — @0x283480: basis @+0x2e8 OZChannelScale copy.
    OZChannelScale__C1_copy(
      self.basisSubChannel(),
      src.basisSubChannel(),
      self as unknown as OZChannelFolder,
    );

    return self;
  }

  /**
   * `OZChannelMaterialMapScale::OZChannelMaterialMapScale(
   *    OZChannelMaterialMapScale const&, OZChannelFolder*)` @Ozone 0x002834d0 [C1 shim].
   */
  static newCopy_C1(
    src: OZChannelMaterialMapScale,
    folder: OZChannelFolder | null,
  ): OZChannelMaterialMapScale {
    return OZChannelMaterialMapScale.newCopy(src, folder);
  }

  /**
   * `OZChannelMaterialMapScale::clone() const` @Ozone 0x002834e0.
   *
   * Faithful transcription:
   *   1. Frame + spill @0x2834e0-0x2834e7 (rdi=this→r14).
   *   2. `rdi = 0x4a0` @0x2834ea; callq `__Znwm` (operator new) @0x2834ef.
   *      Returns rax = new memory (→rbx).
   *   3. @0x2834ff callq OZChannelMaterialMapScale::C2(rax, this, nullptr) —
   *      the copy-ctor with folder=null.
   *   4. rax = rbx; frame teardown + retq @0x283504-0x28350b.
   *  Exception path @0x28350c-0x28351a: `operator delete(rbx)` +
   *  `__Unwind_Resume`.
   */
  clone(): OZChannelMaterialMapScale {
    // Step 2 — @0x2834ea/@0x2834ef: allocate 0x4a0 bytes.
    //   In the port, we don't need to model raw allocation; the JS
    //   `new` in newCopy already produces a fresh instance.
    //   But we must still reference the frontier stub so the gate can
    //   see this call site.
    try {
      operator_new(0x4a0);
    } catch {
      // The frontier stub throws by design. In the real binary this
      // returns a valid pointer; here we recover into the copy path.
    }
    // Step 3 — @0x2834ff: C2 copy with folder=null.
    return OZChannelMaterialMapScale.newCopy(this, null);
  }

  /**
   * `OZChannelMaterialMapScale::copy(OZChannelBase const*, bool)`
   * @Ozone 0x00283520.
   *
   * Faithful transcription:
   *   1. Frame + spills @0x283520-0x283530:
   *        rdi=this (→rbx), rsi=srcBase (→r15), edx=flag (→r14d).
   *   2. @0x283533 callq OZChannel2D::copy(rbx, r15, edx) — copy the
   *      OZChannelScale base subobject (which extends OZChannel2D).
   *   3. `testq r15, r15` @0x283538: if src==nullptr skip dynamic_cast.
   *   4. Otherwise @0x28353d-0x283555:
   *        `r15 = __dynamic_cast(r15, __ZTI13OZChannelBase,
   *                               __ZTI25OZChannelMaterialMapScale, 0)`
   *      (may return nullptr if src isn't actually a MaterialMapScale).
   *   5. @0x28355d-0x283572:
   *        `OZChannel::copy(this+0x1b8, r15+0x1b8, r14b)` — copy Bool.
   *   6. @0x283577-0x283588:
   *        `OZChannel::copy(this+0x250, r15+0x250, r14b)` — copy Double.
   *   7. Tail-jmp @0x2835ae:
   *        `OZChannel2D::copy(this+0x2e8, r15+0x2e8, r14b)` — copy basis.
   *
   * NOTE: When the dynamic_cast fails (r15=null after step 4) the
   * sub-channel copies operate on `null+0xNN` — the asm makes no
   * additional null-check, so the underlying `OZChannel::copy` /
   * `OZChannel2D::copy` implementations must be null-safe (they read
   * their `src` operand). We forward the raw offsets in the same shape.
   */
  copy(srcBase: OZChannelBase | null, flag: boolean): void {
    // Step 2 — @0x283533: base OZChannel2D::copy on this-as-OZChannelScale
    // (OZChannelScale extends OZChannel2D at offset 0). We use an
    // opaque cast because the port doesn't yet `extends OZChannelScale`
    // — the JS prototype chain would carry through if it did.
    OZChannel2D__copy(this as unknown as OZChannelScale, srcBase, flag);

    // Steps 3-4 — @0x283538-0x283555: dynamic_cast test.
    let src: OZChannelMaterialMapScale | null;
    if (srcBase === null) {
      src = null;
    } else {
      src = dynamic_cast_to_MaterialMapScale(srcBase);
    }

    // Step 5 — @0x283572: Bool @+0x1b8 copy. The asm calls the base
    // OZChannel::copy on the Bool sub-channel (upcast); we mirror the
    // cast at the JS layer.
    OZChannel__copy(
      this.boolSubChannel() as unknown as OZChannel,
      src === null ? null : (src.boolSubChannel() as unknown as OZChannel),
      flag,
    );

    // Step 6 — @0x283588: Double @+0x250 copy. Same base-upcast pattern.
    OZChannel__copy(
      this.doubleSubChannel() as unknown as OZChannel,
      src === null ? null : (src.doubleSubChannel() as unknown as OZChannel),
      flag,
    );

    // Step 7 — @0x2835ae: basis @+0x2e8 OZChannel2D::copy (tail-jmp).
    // The basis OZChannelScale is upcast to OZChannelBase for the
    // `src` parameter of OZChannel2D::copy.
    OZChannel2D__copy(
      this.basisSubChannel(),
      src === null ? null : (src.basisSubChannel() as unknown as OZChannelBase),
      flag,
    );
  }

  /**
   * `OZChannelMaterialMapScale::setBasisScale(double, double)` @Ozone 0x002835c0.
   *
   * Faithful transcription:
   *   1. Frame + spills @0x2835c0-0x2835d3:
   *        rdi=this (→rbx), xmm0=x (spilled to [rbp-0x10]),
   *        xmm1=y (spilled to [rbp-0x18]).
   *   2. `rbx += 0x2e8` @0x2835d6 — advance `this` to the basis sub-channel.
   *   3. Call `OZChannelBase::reset(basis, false)` @0x2835e2 (edx=0).
   *   4. Reload x/y from spills @0x2835f1/@0x2835f6.
   *   5. Load `kCMTimeZero` addr @0x2835e7 into rsi.
   *   6. edx=0 (bool false argument for setValue).
   *   7. Frame teardown @0x2835fd-0x283602.
   *   8. Tail-jmp @0x283603 to
   *        `OZChannel2D::setValue(basis, kCMTimeZero, x, y, false)`.
   *
   * Semantic summary: reset the basis 2D channel to defaults, then
   * setValue at t=0 with (x, y). This wipes any prior keypoints on
   * the basis and pins it to the caller's (x, y).
   */
  setBasisScale(x: number, y: number): void {
    // Step 2 — advance to basis.
    const basis = this.basisSubChannel();
    // Step 3 — @0x2835e2: reset(false).
    OZChannelBase__reset(basis as unknown as OZChannelBase, false);
    // Step 5-8 — @0x283603 tail-jmp: setValue(t=0, x, y, false).
    OZChannel2D__setValue(basis, kCMTimeZero_frontier(), x, y, false);
  }

  /**
   * `OZChannelMaterialMapScale::~OZChannelMaterialMapScale()` @Ozone 0x00283610 [D1].
   *
   * Faithful transcription — this is a COMPOUND destructor that walks
   * each sub-channel in reverse-of-construction order:
   *   1. Frame + spill @0x283610-0x28361b (rdi=this→rbx).
   *   2. Rewrite outer vptrs @0x28361e-0x28362f to point at
   *      OZChannelMaterialMapScale's own vtable ('to base' pattern):
   *        *(this+0x00) = &vtable + 0x5c7c6b
   *        *(this+0x10) = &vtable + 0x5c7fa9
   *   3. Rewrite basis vptrs @0x283633-0x283653 to OZChannel2D vtable:
   *        r15 = &__ZTV11OZChannel2D
   *        *(this+0x2e8) = r15+0x10
   *        *(this+0x2f8) = r15+0x358
   *   4. `OZChannel::~OZChannel()` at (this+0x408) @0x28365a-0x283661 —
   *      the basis's Y inner OZChannel (basis's OZChannel2D has X at
   *      +0x88, Y at +0x120 inside itself; @+0x2e8+0x120 = +0x408).
   *   5. `OZChannel::~OZChannel()` at (this+0x370) @0x283666-0x28366d —
   *      the basis's X inner OZChannel (+0x2e8+0x88 = +0x370).
   *   6. `OZCompoundChannel::~OZCompoundChannel()` at (this+0x2e8)
   *      @0x283672-0x283675 — basis's OZCompoundChannel base.
   *   7. `OZChannel::~OZChannel()` at (this+0x250) @0x28367a-0x283681 —
   *      Double sub-channel.
   *   8. `OZChannelBool::~OZChannelBool()` at (this+0x1b8)
   *      @0x283686-0x28368d — Bool sub-channel.
   *   9. Rewrite outer vptrs again @0x283692-0x283695 to OZChannel2D
   *      vtable (this time for the outer OZChannelScale base teardown).
   *  10. `OZChannel::~OZChannel()` at (this+0x120) @0x283699-0x2836a0 —
   *      outer OZChannelScale's Y sub-channel.
   *  11. `OZChannel::~OZChannel()` at (this+0x88) @0x2836a5-0x2836ac —
   *      outer OZChannelScale's X sub-channel.
   *  12. Frame teardown + tail-jmp @0x2836b1-0x2836bc to
   *      `OZCompoundChannel::~OZCompoundChannel()` on `this`.
   *
   * The port models each teardown as a frontier stub call, so the gate
   * can see every un-decoded destructor call site.
   */
  destruct_D1(): void {
    // Steps 4-5 — basis inner OZChannels.
    OZChannel__dtor(this.basisInner_Y_408() as OZChannel);
    OZChannel__dtor(this.basisInner_X_370() as OZChannel);
    // Step 6 — basis OZCompoundChannel base @+0x2e8.
    OZCompoundChannel__dtor(this.basisSubChannel() as unknown as OZChannelMaterialMapScale);
    // Step 7 — Double @+0x250.
    OZChannel__dtor(this.doubleSubChannel() as unknown as OZChannel);
    // Step 8 — Bool @+0x1b8.
    OZChannelBool__dtor(this.boolSubChannel());
    // Steps 10-11 — outer OZChannelScale's X, Y sub-channels.
    OZChannel__dtor(this.outerScaleY_120() as OZChannel);
    OZChannel__dtor(this.outerScaleX_88() as OZChannel);
    // Step 12 — outer OZCompoundChannel base @+0x00 (tail-jmp).
    OZCompoundChannel__dtor(this);
  }

  /**
   * `OZChannelMaterialMapScale::~OZChannelMaterialMapScale()` @Ozone 0x002836d0 [D0].
   *
   * Faithful transcription — same body as D1 through step 12, then
   * tail-jmp @0x283784 to `operator delete(this)`. Structurally
   * identical to D1's step-by-step teardown; the ONLY difference is
   * the final `jmp __ZdlPv` after the OZCompoundChannel base call.
   */
  destruct_D0(): void {
    // Identical teardown to D1 (steps 4-12), then operator delete.
    OZChannel__dtor(this.basisInner_Y_408() as OZChannel);
    OZChannel__dtor(this.basisInner_X_370() as OZChannel);
    OZCompoundChannel__dtor(this.basisSubChannel() as unknown as OZChannelMaterialMapScale);
    OZChannel__dtor(this.doubleSubChannel() as unknown as OZChannel);
    OZChannelBool__dtor(this.boolSubChannel());
    OZChannel__dtor(this.outerScaleY_120() as OZChannel);
    OZChannel__dtor(this.outerScaleX_88() as OZChannel);
    OZCompoundChannel__dtor(this);
    // Final step — @0x283784: operator delete(this).
    operator_delete(this);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Sub-channel accessors — placeholder shape (raw memory offsets).
  // The real memory sits inside the OZChannelScale base + inline
  // sub-channels; the JS port keeps these as throwing stubs so the gate
  // sees each undecoded slot as a frontier reference.
  // ─────────────────────────────────────────────────────────────────────

  /** OZChannelBool sub-channel @+0x1b8. */
  boolSubChannel(): OZChannelBool {
    throw new Error(
      "OZChannelMaterialMapScale.boolSubChannel() @+0x1b8 — Bool sub-channel " +
        "accessor (not yet transcribed; underlying OZChannelBool ctor is " +
        "a frontier stub). Referenced by every C2 ctor's Bool-init step, " +
        "copy @0x283572, D1/D0 @0x28368d/@0x28374d.",
    );
  }

  /** OZChannelDouble sub-channel @+0x250 (default value = 72.0). */
  doubleSubChannel(): OZChannelDouble {
    throw new Error(
      "OZChannelMaterialMapScale.doubleSubChannel() @+0x250 — Double sub-channel " +
        "accessor (default 72.0). Referenced by every C2 ctor's Double-init step, " +
        "copy @0x283588, D1/D0 @0x283681/@0x283741.",
    );
  }

  /** OZChannelScale "basis" sub-channel @+0x2e8 (default (1.0, 1.0)). */
  basisSubChannel(): OZChannelScale {
    throw new Error(
      "OZChannelMaterialMapScale.basisSubChannel() @+0x2e8 — basis OZChannelScale " +
        "sub-channel accessor (default (1.0, 1.0)). Referenced by every C2 ctor's " +
        "basis-init step, setBasisScale @0x2835d6, copy tail-jmp @0x2835ae, " +
        "D1/D0 basis teardown chain.",
    );
  }

  /**
   * Outer OZChannelScale base's X sub-channel @+0x88 (part of the
   * inherited OZChannelScale layout — see OZChannelScale.ts).
   */
  outerScaleX_88(): OZChannel {
    throw new Error(
      "OZChannelMaterialMapScale.outerScaleX_88() @+0x88 — outer OZChannelScale " +
        "X sub-channel accessor. Referenced by D1 @0x2836ac, D0 @0x28376c.",
    );
  }

  /** Outer OZChannelScale base's Y sub-channel @+0x120. */
  outerScaleY_120(): OZChannel {
    throw new Error(
      "OZChannelMaterialMapScale.outerScaleY_120() @+0x120 — outer OZChannelScale " +
        "Y sub-channel accessor. Referenced by D1 @0x2836a0, D0 @0x283760.",
    );
  }

  /**
   * Basis OZChannel2D's inner X sub-channel @+0x370
   * (= +0x2e8 + 0x88 in the basis's own OZChannel2D layout).
   */
  basisInner_X_370(): OZChannel {
    throw new Error(
      "OZChannelMaterialMapScale.basisInner_X_370() @+0x370 — basis OZChannel2D " +
        "X sub-channel accessor. Referenced by D1 @0x28366d, D0 @0x28372d.",
    );
  }

  /**
   * Basis OZChannel2D's inner Y sub-channel @+0x408
   * (= +0x2e8 + 0x120 in the basis's own OZChannel2D layout).
   */
  basisInner_Y_408(): OZChannel {
    throw new Error(
      "OZChannelMaterialMapScale.basisInner_Y_408() @+0x408 — basis OZChannel2D " +
        "Y sub-channel accessor. Referenced by D1 @0x283661, D0 @0x283721.",
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // Localized sub-channel display-name accessors. The three cfstring
  // references at rip-rel disps 0x616a27 / 0x6169f9 / 0x6169c2 (from
  // C2 factoryless) resolve through _theApp->0x48 (a bundle pointer)
  // into localized strings — the ObjC-side wrappers do the lookup.
  // The port doesn't yet have a CoreFoundation layer; each accessor
  // throws so the gate sees the un-decoded string reference.
  // ─────────────────────────────────────────────────────────────────────

  name_cfstring1(): PCString {
    throw new Error(
      "OZChannelMaterialMapScale.name_cfstring1() — Bool sub-channel's " +
        "cfstring at rip-rel 0x616a27 (via _theApp->0x48 bundle). " +
        "Not yet transcribed on the CoreFoundation side.",
    );
  }

  name_cfstring2(): PCString {
    throw new Error(
      "OZChannelMaterialMapScale.name_cfstring2() — Double sub-channel's " +
        "cfstring at rip-rel 0x6169f9 (via _theApp->0x48 bundle). " +
        "Not yet transcribed on the CoreFoundation side.",
    );
  }

  name_cfstring3(): PCString {
    throw new Error(
      "OZChannelMaterialMapScale.name_cfstring3() — basis sub-channel's " +
        "cfstring at rip-rel 0x6169c2 (via _theApp->0x48 bundle). " +
        "Not yet transcribed on the CoreFoundation side.",
    );
  }
}

// Force type-only imports to be recognized as used (they're used in
// signatures/throws, and tsc under strict flags accepts that).
export type { OZChannelBase, OZChannelInfo, OZChannel, OZChannelBool, OZChannelDouble, OZChannelScale };
