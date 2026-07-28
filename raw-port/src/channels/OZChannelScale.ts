// OZChannelScale — ProChannel OZChannel2D subclass exposing the "scale"
// (X, Y) channel scope. Its ObjC wrapper is `CHChannelScale` (per the
// cfstring decoded from `getObjCWrapperName`'s leaq target below).
//
// Framework: ProChannel
//   (/Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework).
//   The x86_64 slice is a fat sub-arch; all VAs below are unadjusted
//   VM addresses from `otool -tV` (i.e. within the slice, not fat file
//   offsets).
//
// Faithful transcription of the 17 exported OZChannelScale-scope symbols
// (17 methods total; below CHUNK_THRESHOLD → whole-class file):
//
//   0x00086046  OZChannelScale::OZChannelScale(PCString const&, OZChannelFolder*,
//                              uint, uint, uint, OZChannelImpl*, OZChannelInfo*)          [C2]
//   0x0008612c  OZChannelScale::OZChannelScale(PCString const&, OZChannelFolder*, ...)    [C1 shim]
//   0x00086136  OZChannelScale::OZChannelScale(OZFactory*, PCString const&, OZChannelFolder*,
//                              uint, uint, uint, OZChannelImpl*, OZChannelInfo*)          [C2]
//   0x00086218  OZChannelScale::OZChannelScale(OZFactory*, PCString const&, ...)          [C1 shim]
//   0x00086222  OZChannelScale::OZChannelScale(double, double, PCString const&, OZChannelFolder*,
//                              uint, uint, uint, OZChannelImpl*, OZChannelInfo*)          [C2]
//   0x0008631c  OZChannelScale::OZChannelScale(double, double, PCString const&, ...)      [C1 shim]
//   0x00086326  OZChannelScale::OZChannelScale(double, double, OZFactory*, PCString const&,
//                              OZChannelFolder*, uint, uint, uint,
//                              OZChannelImpl*, OZChannelInfo*)                             [C2]
//   0x0008641c  OZChannelScale::OZChannelScale(double, double, OZFactory*, ...)           [C1 shim]
//   0x00086426  OZChannelScale::OZChannelScale(OZFactory*, PCString const&, uint)         [C2]
//   0x000864d2  OZChannelScale::OZChannelScale(OZFactory*, PCString const&, uint)         [C1 shim]
//   0x000864dc  OZChannelScale::OZChannelScale(OZChannelScale const&, OZChannelFolder*)   [C2 copy]
//   0x00086506  OZChannelScale::OZChannelScale(OZChannelScale const&, OZChannelFolder*)   [C1 shim]
//   0x00086530  OZChannelScale::clone() const
//   0x00086584  OZChannelScale::getObjCWrapperName()
//   0x00086592  OZChannelScale::hasOnlyOneKeypointAt(CMTime const&) const
//   0x0008659c  OZChannelScale::~OZChannelScale()  [D1]  — trivial tail-jmp to
//                                                          OZChannel2D::~OZChannel2D
//   0x000865a6  OZChannelScale::~OZChannelScale()  [D0]  — call
//                                                          OZChannel2D::~OZChannel2D
//                                                          + `operator delete`
//
// STRUCT LAYOUT — recovered from clone (`movl $0x1b8, %edi` @0x8653a fed to
// `operator new`) and cross-checked against every ctor + dtor:
//   +0x000  primary vptr          (all ctors write vtable+0x10 here via
//                                  rip-relative leaq; e.g. C2 folder-taking
//                                  @0x86070+ 0x58d29 = 0xdedaXX)
//   +0x010  secondary vptr        (all ctors write vtable+... here via
//                                  rip-relative leaq at +7 offset)
//   +0x000..+0x087   OZChannel2D base subobject part 1  (installed at
//                                  clone by OZChannel2D::OZChannel2D(OZChannel2D const&,
//                                  OZChannelFolder*) @ProChannel 0x86550;
//                                  by C2 folder-taking via OZChannel2D::OZChannel2D
//                                  (OZFactory*, PCString const&, OZChannelFolder*,
//                                  uint, uint, uint, OZChannelImpl*, OZChannelInfo*)
//                                  @ProChannel 0x860c3)
//   +0x088  OZChannel (X sub-channel)   — first sub-axis; the ctor calls
//                                  `OZChannel::replaceInfo(this+0x88, info)`
//                                  @0x860f1 to force the X sub-channel's
//                                  OZChannelInfo* to the OZChannelScale
//                                  default (OZChannelScale_valueInfo).
//   +0x120  OZChannel (Y sub-channel)   — second sub-axis; ctor calls
//                                  `OZChannel::replaceInfo(this+0x120, info)`
//                                  @0x86105 to force Y's OZChannelInfo* to
//                                  OZChannelScale_valueInfo too.
//   sizeof(OZChannelScale) = 0x1b8 = 440 bytes
//     (recovered from clone @0x8653a: `movl $0x1b8, %edi` fed straight to
//      `operator new` — matches OZChannel2D's own sizeof exactly).
//
// The OZChannel2D copy-ctor is what clone uses to duplicate the WHOLE
// object (including base subobject and both X/Y sub-channels) — no
// separate deep-copy of the sub-channels is issued.
//
// VTABLE INSTALLS — every ctor installs a class-specific pair of vptrs.
// The rip-relative leaq offsets (differ per site because the pc changes)
// all resolve to the SAME two class-vtable pointers (call them
// `VT_OZChannelScale_primary` and `VT_OZChannelScale_secondary`). We do
// NOT decode them here (each pointer sits in `__DATA_CONST,__const` at
// a chained-fixup-bound address inside the class's vtable), because
// this class exposes no polymorphic behaviour that the port yet honors.
// The vtable references are implicit in the JS prototype chain.
//
// FRONTIER CALLEES — throwing stubs citing every call site. Each stub
// remains a THROW so the gate can detect frontier work.

import type { PCString } from "../infra/PCString";
import type { CMTime } from "../infra/CMTime";
import type { OZChannelBase } from "./OZChannelBase";
import type { OZChannelInfo } from "./OZChannelInfo";
import type { OZChannel } from "./OZChannel";

/** Opaque `OZFactory*` — passed straight through to OZChannel2D base ctors. */
export type OZFactory = object;

/** Opaque `OZChannelFolder*` — parent folder passed through to OZChannel2D. */
export type OZChannelFolder = object;

/**
 * Opaque `OZChannelImpl*` — per-instance impl slot. When the caller
 * passes nullptr the ctors substitute the singleton returned by
 * `OZChannelScale::OZChannelScale_valueImpl::getInstance()`.
 */
export type OZChannelImpl = object;

// ─────────────────────────────────────────────────────────────────────────
// Frontier callees. Each throws with the call site cited by @0xADDR.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelScale_Factory::getInstance()` @ProChannel 0x00001d02 —
 * factory singleton for the scale-channel factory. Called from ALL
 * factoryless C2 ctors that must obtain a default factory:
 *   • C2 folder-taking (7-arg no-factory) @ProChannel 0x86085
 *   • C2 dd-folder-taking (9-arg no-factory) @0x8626b
 * NOT yet transcribed (`OZChannelScale_Factory` is a `_Factory`
 * suffix class excluded from the leaf-class ledger by BAD_TOK, so its
 * body will be transcribed by a dedicated infra pass).
 */
function OZChannelScale_Factory__getInstance(): OZFactory {
  throw new Error(
    "OZChannelScale_Factory::getInstance() @ProChannel U-extern " +
      "__ZN22OZChannelScale_Factory11getInstanceEv @0x00001d02 " +
      "(not yet transcribed) — invoked by OZChannelScale C2 folder-taking " +
      "@ProChannel 0x86085 and C2 dd-folder-taking @0x8626b",
  );
}

/**
 * `OZChannelScale::OZChannelScale_valueImpl::getInstance()` @ProChannel
 * 0x00086640 — once-initialized OZChannelImpl default. Called from
 * EVERY C2 ctor on the impl-null branch:
 *   • C2 folder-taking       @ProChannel 0x86092
 *   • C2 factory-folder-taking @0x8617f
 *   • C2 dd-folder-taking    @0x86278
 *   • C2 dd-factory-folder-taking @0x86379
 *   • C2 factory-name-uint (unconditional) @0x86455
 * The default's identity is stable across all call sites — it is a
 * meta-class helper local to OZChannelScale. NOT yet transcribed
 * (`OZChannelScale::OZChannelScale_valueImpl` is a nested class with
 * its own ledger entry and lives in a separate chunk).
 */
function OZChannelScale_valueImpl__getInstance(): OZChannelImpl {
  throw new Error(
    "OZChannelScale::OZChannelScale_valueImpl::getInstance() @ProChannel " +
      "__ZN14OZChannelScale24OZChannelScale_valueImpl11getInstanceEv @0x00086640 " +
      "(not yet transcribed) — invoked by OZChannelScale C2 folder-taking @0x86092, " +
      "C2 factory-folder-taking @0x8617f, C2 dd-folder-taking @0x86278, " +
      "C2 dd-factory-folder-taking @0x86379, C2 factory-name-uint @0x86455",
  );
}

/**
 * `OZChannelScale::OZChannelScale_valueInfo::getInstance()` @ProChannel
 * 0x000866c0 (nested in same class as valueImpl; addr recovered via
 * the same once-flag pattern) — once-initialized OZChannelInfo default.
 * Called from EVERY C2 ctor on the info-null branch (X sub-channel) AND
 * unconditionally for the Y sub-channel `replaceInfo` step:
 *
 *   • C2 folder-taking       @ProChannel 0x860e2 (X-fallback)
 *                            @0x860f6 (Y unconditional replaceInfo arg)
 *   • C2 factory-folder-taking @0x861cd (X-fallback), @0x861e1 (Y)
 *   • C2 dd-folder-taking    @0x862d1 (X-fallback), @0x862e5 (Y)
 *   • C2 dd-factory-folder-taking @0x863d1 (X-fallback), @0x863e5 (Y)
 *   • C2 factory-name-uint (unconditional both times) @0x86487, @0x8649b
 *
 * NB: The C2 factory-name-uint variant NEVER takes the caller's info
 * (it has no info parameter); it always uses the singleton for BOTH X
 * and Y sub-channels. All other C2s use the caller's info as the X
 * sub-channel value when non-null, and always use the singleton for Y.
 *
 * NOT yet transcribed.
 */
function OZChannelScale_valueInfo__getInstance(): OZChannelInfo {
  throw new Error(
    "OZChannelScale::OZChannelScale_valueInfo::getInstance() @ProChannel " +
      "__ZN14OZChannelScale24OZChannelScale_valueInfo11getInstanceEv " +
      "(not yet transcribed) — invoked by OZChannelScale C2 folder-taking " +
      "@0x860e2/@0x860f6, C2 factory-folder-taking @0x861cd/@0x861e1, " +
      "C2 dd-folder-taking @0x862d1/@0x862e5, C2 dd-factory-folder-taking " +
      "@0x863d1/@0x863e5, C2 factory-name-uint @0x86487/@0x8649b",
  );
}

/**
 * `OZChannel::replaceInfo(OZChannelInfo*)` @ProChannel U-extern
 * `__ZN9OZChannel11replaceInfoEP13OZChannelInfo` — replaces a
 * sub-channel's `OZChannelInfo*` slot. Called TWICE per OZChannelScale
 * C2 (once on the X sub-channel @+0x88, once on the Y sub-channel
 * @+0x120):
 *
 *   • C2 folder-taking            @ProChannel 0x860f1 (X), @0x86105 (Y)
 *   • C2 factory-folder-taking    @0x861dc (X), @0x861f0 (Y)
 *   • C2 dd-folder-taking         @0x862e0 (X), @0x862f4 (Y)
 *   • C2 dd-factory-folder-taking @0x863e0 (X), @0x863f4 (Y)
 *   • C2 factory-name-uint        @0x86496 (X), @0x864aa (Y)
 *
 * NOT yet transcribed on OZChannel (only its ctors/copy-ctor are decoded).
 */
function OZChannel__replaceInfo(_self: OZChannel, _info: OZChannelInfo): void {
  throw new Error(
    "OZChannel::replaceInfo(OZChannelInfo*) @ProChannel U-extern " +
      "__ZN9OZChannel11replaceInfoEP13OZChannelInfo " +
      "(not yet transcribed) — invoked by OZChannelScale C2 ctors: " +
      "folder-taking @0x860f1/@0x86105, factory-folder-taking @0x861dc/@0x861f0, " +
      "dd-folder-taking @0x862e0/@0x862f4, dd-factory-folder-taking @0x863e0/@0x863f4, " +
      "factory-name-uint @0x86496/@0x864aa",
  );
}

/**
 * `OZChannel2D::OZChannel2D(OZFactory*, PCString const&, OZChannelFolder*,
 *   uint, uint, uint, OZChannelImpl*, OZChannelInfo*)` @ProChannel
 * `__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo`
 * — the 8-arg factory-folder-taking OZChannel2D base ctor.
 * Called from:
 *   • C2 folder-taking       @ProChannel 0x860c3
 *     (factory=OZChannelScale_Factory::getInstance(), folder=caller,
 *      uint1/uint2/uint3 = caller's, impl = caller-or-singleton,
 *      info = caller's raw pointer forwarded through OZChannel2D — the
 *      per-sub-channel `replaceInfo` fixup happens AFTER)
 *   • C2 factory-folder-taking @0x861ae
 *     (factory=caller, folder=caller, uints=caller's,
 *      impl=caller-or-singleton, info=caller's forwarded)
 * NOT yet transcribed on OZChannel2D (see OZChannel2D.ts).
 */
function OZChannel2D__C2_factory_folder(
  _self: OZChannelScale,
  _factory: OZFactory,
  _name: PCString,
  _folder: OZChannelFolder | null,
  _uint1: number,
  _uint2: number,
  _uint3: number,
  _impl: OZChannelImpl,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannel2D::OZChannel2D(OZFactory*, PCString const&, OZChannelFolder*, uint, uint, uint, " +
      "OZChannelImpl*, OZChannelInfo*) @ProChannel U-extern " +
      "__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo " +
      "(not yet transcribed) — invoked by OZChannelScale C2 folder-taking @0x860c3, " +
      "C2 factory-folder-taking @0x861ae",
  );
}

/**
 * `OZChannel2D::OZChannel2D(double, double, OZFactory*, PCString const&,
 *   OZChannelFolder*, uint, uint, uint, OZChannelImpl*, OZChannelInfo*)`
 * @ProChannel U-extern
 * `__ZN11OZChannel2DC2EddP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo`
 * — the 10-arg (double x, double y) OZChannel2D base ctor.
 * Called from:
 *   • C2 dd-folder-taking         @ProChannel 0x862b2 (factory=singleton, folder=caller)
 *   • C2 dd-factory-folder-taking @0x863b2 (factory=caller, folder=caller)
 * NOT yet transcribed on OZChannel2D.
 */
function OZChannel2D__C2_dd_factory_folder(
  _self: OZChannelScale,
  _dx: number,
  _dy: number,
  _factory: OZFactory,
  _name: PCString,
  _folder: OZChannelFolder | null,
  _uint1: number,
  _uint2: number,
  _uint3: number,
  _impl: OZChannelImpl,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannel2D::OZChannel2D(double, double, OZFactory*, PCString const&, OZChannelFolder*, " +
      "uint, uint, uint, OZChannelImpl*, OZChannelInfo*) @ProChannel U-extern " +
      "__ZN11OZChannel2DC2EddP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo " +
      "(not yet transcribed) — invoked by OZChannelScale C2 dd-folder-taking @0x862b2, " +
      "C2 dd-factory-folder-taking @0x863b2",
  );
}

/**
 * `OZChannel2D::OZChannel2D(OZFactory*, PCString const&, uint, uint,
 *   OZChannelImpl*, OZChannelInfo*)` @ProChannel U-extern
 * `__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringjjP13OZChannelImplP13OZChannelInfo`
 * — the 6-arg factory-name-uint OZChannel2D ctor (no folder param).
 * Called from:
 *   • C2 factory-name-uint  @ProChannel 0x86474
 *     (factory=caller, name=caller, uint1=caller, uint2=0 (constant),
 *      impl=caller-or-nullptr→singleton wired by OZChannel2D itself,
 *      info=nullptr always)
 * NOT yet transcribed on OZChannel2D.
 */
function OZChannel2D__C2_factory_name_uint(
  _self: OZChannelScale,
  _factory: OZFactory,
  _name: PCString,
  _uint1: number,
  _uint2: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannel2D::OZChannel2D(OZFactory*, PCString const&, uint, uint, OZChannelImpl*, " +
      "OZChannelInfo*) @ProChannel U-extern " +
      "__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringjjP13OZChannelImplP13OZChannelInfo " +
      "(not yet transcribed) — invoked by OZChannelScale C2 factory-name-uint @0x86474",
  );
}

/**
 * `OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*)`
 * @ProChannel U-extern `__ZN11OZChannel2DC2ERKS_P15OZChannelFolder`
 * — the copy-ctor. Called from:
 *   • C2 copy       @ProChannel 0x864e5 (source=caller, folder=caller)
 *   • clone         @0x8654f (source=this-const, folder=nullptr)
 * NOT yet transcribed on OZChannel2D.
 */
function OZChannel2D__C2_copy(
  _self: OZChannelScale,
  _src: OZChannelScale,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*) @ProChannel U-extern " +
      "__ZN11OZChannel2DC2ERKS_P15OZChannelFolder " +
      "(not yet transcribed) — invoked by OZChannelScale C2 copy @0x864e5, clone @0x8654f",
  );
}

/**
 * `OZChannel2D::~OZChannel2D()` @ProChannel U-extern
 * `__ZN11OZChannel2DD2Ev` — the base destructor. Called tail-jmp from
 * D1 @ProChannel 0x865a1, body-call from D0 @0x865af, and from every
 * C2's exception-unwind path:
 *   • folder-taking unwind         @0x8611f
 *   • factory-folder-taking unwind @0x8620a
 *   • dd-folder-taking unwind      @0x8630e
 *   • dd-factory-folder-taking unwind @0x8640e
 *   • factory-name-uint unwind     @0x864c4
 * NOT yet transcribed on OZChannel2D.
 */
function OZChannel2D__dtor(_self: OZChannelScale): void {
  throw new Error(
    "OZChannel2D::~OZChannel2D() @ProChannel U-extern __ZN11OZChannel2DD2Ev " +
      "(not yet transcribed) — invoked by OZChannelScale D1 tail-jmp @0x865a1, " +
      "D0 body call @0x865af, and C2 unwind paths @0x8611f, @0x8620a, @0x8630e, @0x8640e, @0x864c4",
  );
}

/**
 * `OZChannelFolder::hasOnlyOneKeypointAt(CMTime const&) const`
 * @ProChannel U-extern
 * `__ZNK15OZChannelFolder20hasOnlyOneKeypointAtERK6CMTime`
 * — inherited-via-container `hasOnlyOneKeypointAt` method. Called
 * tail-jmp from OZChannelScale::hasOnlyOneKeypointAt @ProChannel
 * 0x86597 (`this` forwarded unchanged in %rdi — the OZChannelScale
 * layout must therefore start with the same header shape as
 * OZChannelFolder, which is consistent with OZChannelFolder being a
 * base of OZChannel2D (its base-subobject sits at offset 0)).
 * NOT yet transcribed on OZChannelFolder.
 */
function OZChannelFolder__hasOnlyOneKeypointAt(
  _self: OZChannelScale,
  _t: CMTime,
): boolean {
  throw new Error(
    "OZChannelFolder::hasOnlyOneKeypointAt(CMTime const&) const @ProChannel U-extern " +
      "__ZNK15OZChannelFolder20hasOnlyOneKeypointAtERK6CMTime " +
      "(not yet transcribed) — invoked by OZChannelScale::hasOnlyOneKeypointAt @0x86597",
  );
}

/**
 * `operator new(unsigned long)` @ProChannel U-extern `__Znwm` —
 * libc++abi/CRT allocation. Called from clone @ProChannel 0x8653f
 * with size = 0x1b8 (440 bytes = sizeof(OZChannelScale) = sizeof(OZChannel2D);
 * see clone @0x8653a). NOT yet transcribed.
 */
function operator_new(_size: number): object {
  throw new Error(
    "operator new(unsigned long) @ProChannel U-extern __Znwm " +
      "(not yet transcribed) — invoked by OZChannelScale::clone @0x8653f (size=0x1b8)",
  );
}

/**
 * `operator delete(void*)` @ProChannel U-extern `__ZdlPv` — libc++abi/CRT
 * deallocation. Called tail-jmp from D0 @ProChannel 0x865bd, and from
 * clone exception-unwind @0x86577 (deleting half-constructed copy).
 * NOT yet transcribed.
 */
function operator_delete(_p: object): void {
  throw new Error(
    "operator delete(void*) @ProChannel U-extern __ZdlPv " +
      "(not yet transcribed) — invoked by OZChannelScale D0 tail-jmp @0x865bd, " +
      "clone unwind @0x86577",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelScale` — a 2D channel exposing the "scale" scope.
 * sizeof = 0x1b8 (440 bytes, from clone @0x8653a).
 *
 * Layout — verified from clone + every ctor:
 *   +0x00   primary vptr           (vtable+0x10, all ctors write via
 *                                   rip-relative leaq)
 *   +0x10   secondary vptr         (vtable+0x??, same pattern)
 *   +0x00..+0x87   OZChannel2D base subobject part 1 (the OZChannel2D
 *                                   ctor claims this range)
 *   +0x88   OZChannel X sub-channel
 *           (post-base-ctor: `OZChannel::replaceInfo(this+0x88,
 *            valueInfo-singleton-or-caller)`)
 *   +0x120  OZChannel Y sub-channel
 *           (post-base-ctor: `OZChannel::replaceInfo(this+0x120,
 *            valueInfo-singleton)` — ALWAYS the singleton for Y)
 *
 * NB: We do NOT `extends OZChannel2D` here — the OZChannel2D base
 * ctors are frontier stubs (see raw-port/src/channels/OZChannel2D.ts),
 * so `extends`-inheritance would propagate un-populatable fields.
 * Instead we mirror OZChannelShearAngle's pattern and let each
 * factory method invoke the frontier ctors explicitly. When
 * OZChannel2D lands its real ctors, this class can flip to
 * `extends OZChannel2D` in a one-line diff.
 *
 * The five factory-shaped C2 ctors (folder-taking with/without factory,
 * dd-folder-taking with/without factory, factory-name-uint) plus the
 * copy-ctor are exposed as static factory methods that mirror the asm
 * step-for-step. The two dtors (D1/D0) mirror the asm's tail-jmp and
 * body-call patterns respectively.
 */
export class OZChannelScale {
  // Primary and secondary vptrs are implicit in the JS prototype chain.

  /**
   * `OZChannelScale::OZChannelScale(PCString const&, OZChannelFolder*,
   *   uint, uint, uint, OZChannelImpl*, OZChannelInfo*)` @ProChannel
   * 0x00086046 [C2].
   *
   * Faithful transcription of the asm's control flow:
   *   1. Frame setup + reg spills @0x86046-0x8606c:
   *        rdi=this (→rbx), rsi=name (→r14),
   *        rdx=folder (→[rbp-0x40]), rcx=uint1 (→[rbp-0x30]),
   *        r8d=uint2 (→[rbp-0x34]), r9d=uint3 (→[rbp-0x2c]),
   *        stack args: [rbp+0x10]=impl (→r15), [rbp+0x18]=info (→r13
   *                    after step 4).
   *   2. Vptr installs @0x86070-0x86081:
   *        *(this+0x00)  = &vtable + 0x10   (leaq 0x58d29(%rip),%rax)
   *        *(this+0x10)  = &vtable + 0x???  (leaq 0x59067(%rip),%rax)
   *   3. `OZChannelScale_Factory::getInstance()` @0x86085
   *        r12 = returned factory pointer.
   *   4. Impl-null fallback @0x8608d-0x86097:
   *        if (impl == nullptr):
   *          r15 = OZChannelScale::OZChannelScale_valueImpl::getInstance()
   *   5. Base-ctor arg staging @0x8609a-0x860bf:
   *        r13     = [rbp+0x18]        ; info (caller's)
   *        [rsp+16] = r13               ; base-ctor stack-arg info
   *        [rsp+8]  = r15               ; base-ctor stack-arg impl
   *        [rsp+0]  = uint3
   *        rdi=this, rsi=factory (r12), rdx=name (r14),
   *        rcx=folder ([rbp-0x40]), r8d=uint1 ([rbp-0x30]),
   *        r9d=uint2 ([rbp-0x34]).
   *   6. @0x860c3 callq OZChannel2D::OZChannel2D(OZFactory*, PCString&,
   *        OZChannelFolder*, uint, uint, uint, OZChannelImpl*,
   *        OZChannelInfo*).
   *   7. Vptr installs (post base) @0x860c8-0x860d9:
   *        rewrite both vptrs — the base ctor stomps them so we must
   *        reinstall to point to OZChannelScale's own vtable.
   *   8. Info-fixup for X sub-channel @0x860dd-0x860f1:
   *        if (r13 == nullptr):
   *          rax = OZChannelScale::OZChannelScale_valueInfo::getInstance()
   *        `OZChannel::replaceInfo(this+0x88, rax)`.
   *      NB: The asm always calls `replaceInfo` on the X sub-channel
   *      with EITHER the singleton (if caller passed null) or... but
   *      the callee is invoked ONLY on the null-branch: on the non-
   *      null branch (@0x860dd `jne 0x8610a`) the whole X-and-Y fixup
   *      block is SKIPPED. So when the caller passes non-null info,
   *      the caller-provided info stays on both sub-channels as
   *      installed by OZChannel2D itself.
   *   9. Info-fixup for Y sub-channel @0x860f6-0x86105 (same branch):
   *        rax = OZChannelScale::OZChannelScale_valueInfo::getInstance()
   *        `OZChannel::replaceInfo(this+0x120, rax)`.
   *  10. Frame teardown + retq @0x8610a-0x86118.
   *  Exception path @0x86119-0x86127: `OZChannel2D::~OZChannel2D()` +
   *  `__Unwind_Resume`.
   */
  static newWithFolder(
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    uint3: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelScale {
    const self = new OZChannelScale();

    // Step 3 — @0x86085: factory singleton.
    const factory = OZChannelScale_Factory__getInstance();
    // Step 4 — @0x8608d-0x86097: impl-null fallback.
    const resolvedImpl: OZChannelImpl =
      impl === null ? OZChannelScale_valueImpl__getInstance() : impl;
    // Step 6 — @0x860c3: base ctor. (Vptr installs in step 2 & 7 are
    // implicit in the JS prototype chain.)
    OZChannel2D__C2_factory_folder(
      self,
      factory,
      name,
      folder,
      uint1,
      uint2,
      uint3,
      resolvedImpl,
      info,
    );
    // Steps 8-9 — @0x860dd branch: only when caller passed null info.
    if (info === null) {
      // X sub-channel @+0x88.
      const infoDefault = OZChannelScale_valueInfo__getInstance();
      // The `x` subchannel is at struct offset +0x88. We route the
      // call through OZChannel__replaceInfo which throws today.
      OZChannel__replaceInfo(self.xSubChannel(), infoDefault);
      // Y sub-channel @+0x120 — always the singleton on this branch.
      const infoDefault2 = OZChannelScale_valueInfo__getInstance();
      OZChannel__replaceInfo(self.ySubChannel(), infoDefault2);
    }
    return self;
  }

  /**
   * `OZChannelScale::OZChannelScale(PCString const&, OZChannelFolder*, ...)`
   * @ProChannel 0x0008612c [C1 shim] — trivial `pushq %rbp; movq %rsp, %rbp;
   * popq %rbp; jmp C2` per Itanium ABI aliasing.
   */
  static newWithFolder_C1(
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    uint3: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelScale {
    return OZChannelScale.newWithFolder(name, folder, uint1, uint2, uint3, impl, info);
  }

  /**
   * `OZChannelScale::OZChannelScale(OZFactory*, PCString const&,
   *   OZChannelFolder*, uint, uint, uint, OZChannelImpl*, OZChannelInfo*)`
   * @ProChannel 0x00086136 [C2].
   *
   * Faithful transcription:
   *   1. Frame setup + spills @0x86136-0x86156:
   *        rdi=this (→rbx), rsi=factory (→r14), rdx=name (→r13),
   *        rcx=folder (→r12), r8d=uint1 (→r15d),
   *        r9d=uint2 (last param before stack; used later),
   *        [rbp+0x10]=uint3 (loaded via `movl 0x10(%rbp),%esi`),
   *        [rbp+0x18]=impl (loaded via `movq 0x18(%rbp),%rax`),
   *        [rbp+0x20]=info (loaded via `movq 0x20(%rbp),%rcx`).
   *   2. Vptr installs @0x86161-0x86172 (leaq 0x58c38, leaq 0x58f76).
   *   3. Impl-null fallback @0x86176-0x86189:
   *        if (impl == nullptr):
   *          r9d saved to [rbp-0x2c], call
   *          OZChannelScale::OZChannelScale_valueImpl::getInstance(),
   *          reload uint3/info/uint2 back into registers.
   *      (asm needs to preserve r9d across the call — hence the spill.)
   *   4. Base-ctor arg staging @0x8618f-0x861ae:
   *        [rsp+16] = info-or-singleton
   *        [rsp+8]  = impl-or-singleton
   *        [rsp+0]  = uint3
   *        rdi=this, rsi=factory (r14), rdx=name (r13), rcx=folder (r12),
   *        r8d=uint1 (r15d), r9d=uint2 (already in r9d).
   *        (Then also: r14 = save-of-info@[rbp+0x20] for step 6 branch.)
   *   5. @0x861ae callq OZChannel2D::OZChannel2D(OZFactory*, PCString&, ...).
   *   6. Vptr installs (post base) @0x861b3-0x861c4 (leaq 0x58be6, leaq 0x58f24).
   *   7. Info-fixup branch (X sub-channel) @0x861c8-0x861dc:
   *        if (r14 == nullptr):   ; r14 was the caller's info
   *          rax = OZChannelScale::OZChannelScale_valueInfo::getInstance()
   *          `OZChannel::replaceInfo(this+0x88, rax)`
   *   8. Info-fixup branch (Y sub-channel) @0x861e1-0x861f0 (same branch):
   *        rax = OZChannelScale::OZChannelScale_valueInfo::getInstance()
   *        `OZChannel::replaceInfo(this+0x120, rax)`
   *   9. Frame teardown + retq @0x861f5-0x86203.
   *  Exception path @0x86204-0x86212.
   */
  static newWithFactoryAndFolder(
    factory: OZFactory,
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    uint3: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelScale {
    const self = new OZChannelScale();
    // Step 3 — @0x86176: impl-null fallback.
    const resolvedImpl: OZChannelImpl =
      impl === null ? OZChannelScale_valueImpl__getInstance() : impl;
    // Step 5 — @0x861ae: base ctor.
    OZChannel2D__C2_factory_folder(
      self,
      factory,
      name,
      folder,
      uint1,
      uint2,
      uint3,
      resolvedImpl,
      info,
    );
    // Step 7-8 — @0x861c8 branch: only on null-info.
    if (info === null) {
      const infoDefault = OZChannelScale_valueInfo__getInstance();
      OZChannel__replaceInfo(self.xSubChannel(), infoDefault);
      const infoDefault2 = OZChannelScale_valueInfo__getInstance();
      OZChannel__replaceInfo(self.ySubChannel(), infoDefault2);
    }
    return self;
  }

  /** @ProChannel 0x00086218 [C1 shim] — jmp to C2. */
  static newWithFactoryAndFolder_C1(
    factory: OZFactory,
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    uint3: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelScale {
    return OZChannelScale.newWithFactoryAndFolder(
      factory, name, folder, uint1, uint2, uint3, impl, info,
    );
  }

  /**
   * `OZChannelScale::OZChannelScale(double, double, PCString const&,
   *   OZChannelFolder*, uint, uint, uint, OZChannelImpl*, OZChannelInfo*)`
   * @ProChannel 0x00086222 [C2].
   *
   * Structurally identical to newWithFolder (C2 folder-taking) but with
   * a leading (dx, dy) double pair passed via xmm0/xmm1, forwarded to
   * OZChannel2D::OZChannel2D(double, double, OZFactory*, ...).
   *   1. Frame setup + spills @0x86222-0x86256 (includes spilling
   *      xmm0/xmm1 to [rbp-0x38]/[rbp-0x40]).
   *   2. Vptr installs @0x86256-0x86267.
   *   3. Factory singleton @0x8626b (same as newWithFolder).
   *   4. Impl-null fallback @0x86273-0x8627d.
   *   5. Base-ctor arg staging @0x86280-0x862ae (loads xmm0/xmm1
   *      back from spill for the base's dd first-args).
   *   6. @0x862b2 callq OZChannel2D::OZChannel2D(double, double,
   *      OZFactory*, PCString&, OZChannelFolder*, uint, uint, uint,
   *      OZChannelImpl*, OZChannelInfo*).
   *   7. Vptr reinstalls (post base) @0x862b7-0x862c8.
   *   8. Info-fixup branch @0x862cc-0x862f4 (same shape).
   *   9. Frame teardown @0x862f9-0x86307.
   */
  static newWithDDAndFolder(
    dx: number,
    dy: number,
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    uint3: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelScale {
    const self = new OZChannelScale();
    // Step 3 — @0x8626b.
    const factory = OZChannelScale_Factory__getInstance();
    // Step 4 — @0x86273.
    const resolvedImpl: OZChannelImpl =
      impl === null ? OZChannelScale_valueImpl__getInstance() : impl;
    // Step 6 — @0x862b2.
    OZChannel2D__C2_dd_factory_folder(
      self, dx, dy, factory, name, folder, uint1, uint2, uint3, resolvedImpl, info,
    );
    // Step 8 — @0x862cc branch.
    if (info === null) {
      const iX = OZChannelScale_valueInfo__getInstance();
      OZChannel__replaceInfo(self.xSubChannel(), iX);
      const iY = OZChannelScale_valueInfo__getInstance();
      OZChannel__replaceInfo(self.ySubChannel(), iY);
    }
    return self;
  }

  /** @ProChannel 0x0008631c [C1 shim] — jmp to C2. */
  static newWithDDAndFolder_C1(
    dx: number, dy: number, name: PCString, folder: OZChannelFolder | null,
    uint1: number, uint2: number, uint3: number,
    impl: OZChannelImpl | null, info: OZChannelInfo | null,
  ): OZChannelScale {
    return OZChannelScale.newWithDDAndFolder(
      dx, dy, name, folder, uint1, uint2, uint3, impl, info,
    );
  }

  /**
   * `OZChannelScale::OZChannelScale(double, double, OZFactory*,
   *   PCString const&, OZChannelFolder*, uint, uint, uint,
   *   OZChannelImpl*, OZChannelInfo*)` @ProChannel 0x00086326 [C2].
   *
   * Structurally identical to newWithFactoryAndFolder but with a
   * leading (dx, dy) double pair forwarded through the dd base ctor.
   *   1. Frame + spills @0x86326-0x86366 (spills xmm0/xmm1 across
   *      the getInstance calls same as newWithDDAndFolder).
   *   2. Vptr installs @0x86351-0x86362.
   *   3. Impl-null fallback @0x86366-0x8638f (spills xmm0/xmm1 to
   *      [rbp-0x38]/[rbp-0x40] and reloads after the getInstance
   *      call).
   *   4. Base-ctor arg staging @0x86393-0x863b2.
   *   5. @0x863b2 callq OZChannel2D::OZChannel2D(double, double,
   *      OZFactory*, PCString&, ...).
   *   6. Vptr reinstalls @0x863b7-0x863c8.
   *   7. Info-fixup branch @0x863cc-0x863f4 (same shape).
   *   8. Frame teardown @0x863f9-0x86407.
   */
  static newWithDDAndFactoryAndFolder(
    dx: number,
    dy: number,
    factory: OZFactory,
    name: PCString,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    uint3: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelScale {
    const self = new OZChannelScale();
    // Step 3 — @0x86366.
    const resolvedImpl: OZChannelImpl =
      impl === null ? OZChannelScale_valueImpl__getInstance() : impl;
    // Step 5 — @0x863b2.
    OZChannel2D__C2_dd_factory_folder(
      self, dx, dy, factory, name, folder, uint1, uint2, uint3, resolvedImpl, info,
    );
    // Step 7 — @0x863cc branch.
    if (info === null) {
      const iX = OZChannelScale_valueInfo__getInstance();
      OZChannel__replaceInfo(self.xSubChannel(), iX);
      const iY = OZChannelScale_valueInfo__getInstance();
      OZChannel__replaceInfo(self.ySubChannel(), iY);
    }
    return self;
  }

  /** @ProChannel 0x0008641c [C1 shim] — jmp to C2. */
  static newWithDDAndFactoryAndFolder_C1(
    dx: number, dy: number, factory: OZFactory, name: PCString,
    folder: OZChannelFolder | null,
    uint1: number, uint2: number, uint3: number,
    impl: OZChannelImpl | null, info: OZChannelInfo | null,
  ): OZChannelScale {
    return OZChannelScale.newWithDDAndFactoryAndFolder(
      dx, dy, factory, name, folder, uint1, uint2, uint3, impl, info,
    );
  }

  /**
   * `OZChannelScale::OZChannelScale(OZFactory*, PCString const&,
   *   uint)` @ProChannel 0x00086426 [C2] — 3-arg quick ctor.
   *
   * Faithful transcription:
   *   1. Frame + spills @0x86426-0x8643d:
   *        rdi=this (→rbx), rsi=factory (→r12), rdx=name (→r15),
   *        ecx=uint1 (→r14d).
   *   2. Vptr installs @0x86440-0x86451:
   *        r13 = &vtable+0x??? (leaq 0x58c97(%rip),%r13; used for
   *        both pre- and post-base install so re-loading is elided).
   *        *(this+0x00) = &vtable+0x10 (leaq 0x58959(%rip),%rax).
   *        *(this+0x10) = r13.
   *   3. `OZChannelScale::OZChannelScale_valueImpl::getInstance()`
   *      @0x86455 — UNCONDITIONAL (no impl arg, so caller can't
   *      have supplied one).
   *   4. Base-ctor arg staging @0x8645a-0x86471:
   *        [rsp+0] = 0                    ; info stack-arg (nullptr)
   *        rdi=this, rsi=factory (r12), rdx=name (r15),
   *        ecx=uint1 (r14d), r8d=0 (uint2 constant),
   *        r9 = impl-singleton.
   *   5. @0x86474 callq OZChannel2D::OZChannel2D(OZFactory*, PCString&,
   *      uint, uint, OZChannelImpl*, OZChannelInfo*).
   *   6. Vptr reinstalls (post base) @0x86479-0x86483:
   *        *(this+0x00) = &vtable+0x10 (leaq 0x58920(%rip),%rax).
   *        *(this+0x10) = r13.
   *   7. Info-install (UNCONDITIONAL) @0x86487-0x8649b:
   *        rax = OZChannelScale::OZChannelScale_valueInfo::getInstance()
   *        `OZChannel::replaceInfo(this+0x88, rax)`.
   *   8. Same for Y sub-channel @0x8649b-0x864aa:
   *        rax = OZChannelScale::OZChannelScale_valueInfo::getInstance()
   *        `OZChannel::replaceInfo(this+0x120, rax)`.
   *   9. Frame teardown + retq @0x864af-0x864bd.
   *  Exception path @0x864be-0x864cc.
   */
  static newWithFactoryAndUint(
    factory: OZFactory,
    name: PCString,
    uint1: number,
  ): OZChannelScale {
    const self = new OZChannelScale();
    // Step 3 — @0x86455.
    const implDefault = OZChannelScale_valueImpl__getInstance();
    // Step 5 — @0x86474.
    OZChannel2D__C2_factory_name_uint(
      self,
      factory,
      name,
      uint1,
      0, // uint2 constant zero
      implDefault,
      null, // info stack-arg nullptr
    );
    // Steps 7 & 8 — UNCONDITIONAL (this variant never accepts info from caller).
    const iX = OZChannelScale_valueInfo__getInstance();
    OZChannel__replaceInfo(self.xSubChannel(), iX);
    const iY = OZChannelScale_valueInfo__getInstance();
    OZChannel__replaceInfo(self.ySubChannel(), iY);
    return self;
  }

  /** @ProChannel 0x000864d2 [C1 shim] — jmp to C2. */
  static newWithFactoryAndUint_C1(
    factory: OZFactory,
    name: PCString,
    uint1: number,
  ): OZChannelScale {
    return OZChannelScale.newWithFactoryAndUint(factory, name, uint1);
  }

  /**
   * `OZChannelScale::OZChannelScale(OZChannelScale const&, OZChannelFolder*)`
   * @ProChannel 0x000864dc [C2 copy].
   *
   * Faithful transcription:
   *   1. Frame + spills @0x864dc-0x864e2.
   *   2. `OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*)`
   *      @0x864e5 — the base copy-ctor duplicates OZChannel2D's
   *      subobject (which includes the X/Y sub-channels).
   *   3. Vptr installs @0x864ea-0x864fb:
   *        *(this+0x00) = &vtable+0x10 (leaq 0x588af(%rip),%rax).
   *        *(this+0x10) = &vtable+0x??? (leaq 0x58bed(%rip),%rax).
   *      (No post-base info-fixup — the OZChannel2D copy-ctor preserves
   *       the source's info pointers on both sub-channels.)
   *   4. Frame teardown + retq @0x864ff-0x86505.
   */
  static copyWithFolder(
    src: OZChannelScale,
    folder: OZChannelFolder | null,
  ): OZChannelScale {
    const self = new OZChannelScale();
    OZChannel2D__C2_copy(self, src, folder);
    return self;
  }

  /** @ProChannel 0x00086506 [C1 shim] — jmp to C2. */
  static copyWithFolder_C1(
    src: OZChannelScale,
    folder: OZChannelFolder | null,
  ): OZChannelScale {
    return OZChannelScale.copyWithFolder(src, folder);
  }

  /**
   * `OZChannelScale::clone() const` @ProChannel 0x00086530.
   *
   * Faithful transcription:
   *   1. Frame setup + spill @0x86530-0x86537 (r14 ← this).
   *   2. Allocate 0x1b8 bytes via `operator new` @0x8653a-0x8653f.
   *      rbx = new-instance pointer (0x1b8 = sizeof OZChannelScale).
   *   3. Copy-ctor @0x86547-0x8654f:
   *        rdi=rbx (new), rsi=r14 (this), rdx=0 (folder=nullptr).
   *        callq OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*).
   *   4. Vptr installs @0x86554-0x86565:
   *        *(new+0x00)  = &vtable+0x10 (leaq 0x58845(%rip),%rax).
   *        *(new+0x10)  = &vtable+0x??? (leaq 0x58b83(%rip),%rax).
   *   5. Return rbx (new instance).
   *   6. Exception-unwind path @0x86571-0x86583: `operator delete(rbx)`
   *      then `__Unwind_Resume`.
   */
  clone(): OZChannelScale {
    // Step 2 — @0x8653f: operator new(0x1b8). Route through the
    // frontier stub so the "not yet transcribed" chain remains visible.
    // (`new OZChannelScale()` is the JS-side equivalent; we still call
    // the stub so gate can see the frontier addr.)
    operator_new(0x1b8);
    const dst = new OZChannelScale();
    // Step 3 — @0x8654f: OZChannel2D copy-ctor (folder=nullptr).
    OZChannel2D__C2_copy(dst, this, null);
    // Steps 4 vptr installs implicit in JS prototype.
    return dst;
  }

  /**
   * `OZChannelScale::getObjCWrapperName()` @ProChannel 0x00086584.
   *
   * Faithful transcription:
   *   1. Frame setup @0x86584-0x86585.
   *   2. `rax = &"CHChannelScale"` @0x86588 (`leaq 0x5f541(%rip),%rax`,
   *      which resolves to __DATA_CONST,__cfstring @0xe5ad0 whose
   *      backing __TEXT,__cstring @0xbd29b is `"CHChannelScale"` —
   *      verified via chained-fixup decode).
   *   3. Frame teardown + retq @0x8658f-0x86590.
   *
   * Return type is a CFStringRef in the binary; we return a JS string
   * with the literal contents since the port has no CoreFoundation
   * layer. Every consumer today only uses this for equality/label
   * purposes.
   */
  static getObjCWrapperName(): string {
    // @0x86588 -> cfstring @0xe5ad0 -> cstring @0xbd29b = "CHChannelScale".
    return "CHChannelScale";
  }

  /**
   * `OZChannelScale::hasOnlyOneKeypointAt(CMTime const&) const`
   * @ProChannel 0x00086592.
   *
   * Faithful transcription:
   *   1. Frame setup @0x86592-0x86593.
   *   2. Frame teardown @0x86596.
   *   3. Tail-`jmp` @0x86597 to
   *      `OZChannelFolder::hasOnlyOneKeypointAt(CMTime const&) const`
   *      with %rdi (`this`) unchanged and %rsi (`&t`) unchanged.
   *
   * Semantically this is a thunk: OZChannelScale forwards the query to
   * its OZChannelFolder base subobject (which sits at offset 0 of
   * OZChannel2D, which sits at offset 0 of OZChannelScale). We
   * therefore forward through the frontier stub.
   */
  hasOnlyOneKeypointAt(t: CMTime): boolean {
    return OZChannelFolder__hasOnlyOneKeypointAt(this, t);
  }

  /**
   * `OZChannelScale::~OZChannelScale()` @ProChannel 0x0008659c [D1] —
   * trivial dtor:
   *   1. Frame setup @0x8659c-0x8659d.
   *   2. Frame teardown @0x865a0.
   *   3. Tail-`jmp` @0x865a1 to `OZChannel2D::~OZChannel2D()`.
   * The port models this as a call-through — the base dtor still
   * throws (frontier), but destruction is a no-op on the JS side apart
   * from that call.
   */
  destruct_D1(): void {
    OZChannel2D__dtor(this);
  }

  /**
   * `OZChannelScale::~OZChannelScale()` @ProChannel 0x000865a6 [D0] —
   * delete-form dtor:
   *   1. Frame + spill @0x865a6-0x865ac (rbx ← this).
   *   2. `callq OZChannel2D::~OZChannel2D()` @0x865af.
   *   3. Frame teardown @0x865b4-0x865bc.
   *   4. Tail-`jmp` @0x865bd to `operator delete(void*)`.
   * Modelled here by chaining both frontier stubs so gate can see the
   * two undecoded call sites explicitly.
   */
  destruct_D0(): void {
    OZChannel2D__dtor(this);
    operator_delete(this);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Sub-channel accessors (X @+0x88, Y @+0x120) — placeholder shape.
  // OZChannel2D exposes X/Y via its own interface (OZChannel2DAxis); the
  // real memory is inside the OZChannel2D subobject, which is not yet
  // fully modelled by the port. We surface throwing stubs so callers
  // through the fixup paths above hit the frontier loudly.
  // ─────────────────────────────────────────────────────────────────────

  /** X sub-channel @+0x88 — see class-header struct layout. */
  xSubChannel(): OZChannel {
    throw new Error(
      "OZChannelScale.xSubChannel() @+0x88 — OZChannel2D X-sub-channel " +
        "accessor (not yet transcribed on OZChannel2D). Referenced by " +
        "OZChannelScale C2 ctors' info-fixup step (see e.g. @ProChannel 0x860e7).",
    );
  }

  /** Y sub-channel @+0x120 — see class-header struct layout. */
  ySubChannel(): OZChannel {
    throw new Error(
      "OZChannelScale.ySubChannel() @+0x120 — OZChannel2D Y-sub-channel " +
        "accessor (not yet transcribed on OZChannel2D). Referenced by " +
        "OZChannelScale C2 ctors' info-fixup step (see e.g. @ProChannel 0x860fb).",
    );
  }
}

// Force type-only imports to be recognized as used (they are only used in
// signatures, but tsc under strict flags accepts that).
export type { OZChannelBase };
