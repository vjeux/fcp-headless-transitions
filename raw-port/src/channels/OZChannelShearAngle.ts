// OZChannelShearAngle — ProChannel OZChannel subclass exposing the
// "shear angle" channel scope (an angle-valued OZChannel whose ObjC
// wrapper is `CHChannelShearAngle`, per the __cfstring decoded from
// getObjCWrapperName's leaq target below).
//
// Framework: ProChannel (/Applications/Final Cut Pro.app/Contents/Frameworks/
//   ProChannel.framework).  The x86_64 slice is a fat sub-arch at fat-offset
//   0x4000.  All VAs below are unadjusted VM addresses from `otool -tV`
//   (i.e. within the slice, not fat-file offsets).
//
// Faithful transcription of the eight exported symbols on this class:
//   0x000055f4  OZChannelShearAngle::OZChannelShearAngle(OZFactory*, PCString const&, unsigned int, OZChannelImpl*, OZChannelInfo*)   [C2 — factory-taking, 5-arg]
//   0x00087892  OZChannelShearAngle::OZChannelShearAngle(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)  [C2 — folder-taking, 6-arg]
//   0x00087970  OZChannelShearAngle::OZChannelShearAngle(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)  [C2 — double-first, 7-arg]
//   0x0001cff2  OZChannelShearAngle::~OZChannelShearAngle()   [D1 — trivial tail-jmp to OZChannel::~OZChannel]
//   0x0001cffc  OZChannelShearAngle::~OZChannelShearAngle()   [D0 — call OZChannel::~OZChannel + operator delete]
//   0x0001cc6c  OZChannelShearAngle::getObjCWrapperName()
//   0x0001d018  OZChannelShearAngle::clone() const
//   0x000056a4  OZChannelShearAngle::createOZChannelShearAngleInfo()
//   0x000056ee  OZChannelShearAngle::createOZChannelShearAngleImpl()
// (No separate C1 emission — the Itanium ABI aliases C1 onto C2 for
//  these ctors.)
//
// VTABLE — resolved via `resolve.py ProChannel vtable OZChannelShearAngle`
// (`# OZChannelShearAngle vtable @0xd2730; installed ptr 0xd2740`):
//   *0x00 -> 0x1cff2    ~OZChannelShearAngle()             [D1]
//   *0x08 -> 0x1cffc    ~OZChannelShearAngle()             [D0]
//   *0x10 -> 0x69e90    OZFactoryBase::getIconName() const    (inherited)
//   *0x18 -> 0x51888    OZFactoryBase::getIconNameBW() const  (inherited)
//   *0x20 -> 0x69eb0    OZFactoryBase::getIconID() const      (inherited)
//   *0x28 -> 0x69ec0    OZFactoryBase::getLibraryIconName() const (inherited)
//   *0x30 -> 0x518a8    OZFactoryBase::description()          (inherited)
//   *0x38 -> 0x69ee0    OZChannelBase::getInstanceID() const  (inherited)
//   *0x40 -> 0x518c8    OZChannelBase::getSerializer()        (inherited)
//   *0x48 -> 0x732a0    OZFactoryBase::getFactoryForSerialization(...) const (inherited)
//   *0x50 -> 0x49b94    OZChannelBase::finishInitializing()    (inherited)
//   *0x58 -> 0x1cc6c    OZChannelShearAngle::getObjCWrapperName()  (this class)
//   *0xe8 -> 0x1439e    OZChannel::copy(OZChannelBase const*, bool)  (inherited)
//   *0xf0 -> 0x14562    OZChannel::compare(OZChannelBase const*) const (inherited)
//   *0xf8 -> 0x1d018    OZChannelShearAngle::clone() const         (this class)
// The primary vptr is installed as `vtable + 0x10` (0xd2740) by all entry
// points that write it (C2 5-arg @0x562b, C2 6-arg @0x878ef, C2 7-arg
// @0x879d3, clone @0x1d043).  A SECONDARY vptr = `vtable + 0x370`
// (0xd2aa0) is written to `this+0x10` by C2 5-arg @0x5634, C2 6-arg
// @0x878f8, C2 7-arg @0x879dc, clone @0x1d04d — matching Ozone/ProChannel's
// characteristic two-vptr layout for OZChannel-family derived classes
// (see raw-port/src/channels/OZChannelAngle.ts and OZChannelAffectedNodes.ts).
//
// STRUCT LAYOUT (recovered from field references in this class's own slice
// and cross-checked against OZChannelAngle/OZChannelAffectedNodes/
// OZChannelDouble):
//   +0x000  primary vptr        (= vtable[OZChannelShearAngle] + 0x10 = 0xd2740)
//   +0x008..+0x00f              (OZChannel base subobject slot 0 — opaque)
//   +0x010  secondary vptr      (= vtable[OZChannelShearAngle] + 0x370 = 0xd2aa0)
//   +0x018..+0x06f              (OZChannel base subobject — opaque)
//   +0x070  OZChannelImpl*  impl  (mirror of +0x78)
//   +0x078  OZChannelImpl*  impl  (initial slot; base ctor writes here from caller arg)
//   +0x080  OZChannelInfo*  info  (mirror of +0x88)
//   +0x088  OZChannelInfo*  info  (initial slot; base ctor writes here)
//   +0x090..                    (rest of OZChannel base subobject — opaque)
//   sizeof(OZChannelShearAngle) = 0x98 = 152 bytes
//     (recovered from clone @0x1d022: `movl $0x98, %edi` fed straight to
//      `operator new` — identical to OZChannelAffectedNodes / OZChannelAngle).
//
// The mirror-write pattern (writing the same pointer to both +0x70/+0x78 or
// +0x80/+0x88) matches OZChannelAngle/OZChannelDouble/OZChannelAffectedNodes
// exactly — the base ctor deposits the caller's pointer at the higher
// offset, and the derived ctor decides whether to keep it (mirror it
// down) or to replace with the once-initialized per-class default
// (which is written to BOTH slots).
//
// FRONTIER CALLEES (each surfaced as a throwing stub with its call site cited):
//   getOZChannelShearAngle_FactoryBase()
//     [__Z34getOZChannelShearAngle_FactoryBasev] — free fn returning the
//     OZChannelShearAngle factory-base pointer.  Called from BOTH 6-arg
//     ctors @0x878b6 (folder-taking) and @0x8799d (double-first). NOT
//     yet transcribed on this class's own surface.
//   OZChannel::OZChannel(OZFactory*, PCString&, OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*)
//     [__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo]
//     — OZChannel base ctor.  Called from ALL THREE derived ctors:
//     5-arg @0x561b (with folder=nullptr, uint2=0),
//     6-arg @0x878df (folder+uint1+uint2 forwarded),
//     7-arg @0x879c3 (same as 6-arg; the double arg is saved on the
//     stack and then applied POST base-ctor via setDefaultValue+setInitialValue).
//   OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
//     [__ZN9OZChannelC2ERKS_P15OZChannelFolder] — OZChannel copy-ctor.
//     Called from clone @0x1d037 with (new-instance, *this, folder=nullptr).
//   OZChannel::~OZChannel()  [__ZN9OZChannelD2Ev] — base dtor.  Tail-jmp
//     from D1 @0x1cff7, body-call from D0 @0x1d005 followed by
//     `operator delete` @0x1d013.  Also invoked from the 5-arg C2
//     exception-unwind @0x5696 (unwind resume @0x569e).
//   OZChannel::setDefaultValue(double)
//     [__ZN9OZChannel15setDefaultValueEd] — post-base-ctor setter, called
//     ONLY from the 7-arg (double-first) ctor @0x87a39 with the caller's
//     double.  Not yet transcribed.
//   OZChannel::setInitialValue(double, bool)
//     [__ZN9OZChannel15setInitialValueEdb] — post-base-ctor setter, called
//     ONLY from the 7-arg ctor @0x87a48 with (double, false).  Not yet
//     transcribed.
//   operator new(unsigned long)   [__Znwm] — 0x98-byte allocation in
//     clone @0x1d027.  All other allocations reside in unrelated slices.
//   operator delete(void*)        [__ZdlPv] — D0 tail-jmp @0x1d013;
//     clone exception-unwind @0x1d05f (deletes half-constructed copy).
//   std::__1::__call_once(unsigned long&, void*, void(*)(void*))
//     [__ZNSt3__111__call_onceERVmPvPFvS2_E] — libc++ once-runner.  Called
//     with proxy stubs at
//     createOZChannelShearAngleInfo @0x56d9 and
//     createOZChannelShearAngleImpl @0x5723.
//   __Unwind_Resume — exception-unwind rethrow from 5-arg C2 @0x569e,
//     clone @0x1d067.
//
// REUSED PORTS: OZChannelAffectedNodes / OZChannelAngle / OZChannelDouble in
// ./OZChannelAffectedNodes.ts / ./OZChannelAngle.ts / ./OZChannelDouble.ts
// served as byte-for-byte structural templates.  This class's 6-arg and
// 7-arg ctors match OZChannelAffectedNodes's folder-taking ctor exactly
// (same std::__call_once fast-path gate on _*Info_once / _*Impl_once,
// same +0x78/+0x88 mirror-write, same two-vptr install).  The 7-arg ctor
// adds ONLY a trailing pair of setDefaultValue+setInitialValue calls
// against the caller's double.
//
// Source disassembly saved at:
//   raw-port/re/disasm/ProChannel.OZChannelShearAngle.OZChannelShearAngle.s          (5-arg C2)
//   raw-port/re/disasm/ProChannel.OZChannelShearAngle.ctor_folder.s                  (6-arg C2)
//   raw-port/re/disasm/ProChannel.OZChannelShearAngle.ctor_dbl_folder.s              (7-arg C2)
//   raw-port/re/disasm/ProChannel.OZChannelShearAngle.D1.s                           (D1 dtor)
//   raw-port/re/disasm/ProChannel.OZChannelShearAngle.~OZChannelShearAngle.s         (D0 dtor)
//   raw-port/re/disasm/ProChannel.OZChannelShearAngle.clone.s                        (clone)
//   raw-port/re/disasm/ProChannel.OZChannelShearAngle.getObjCWrapperName.s
//   raw-port/re/disasm/ProChannel.OZChannelShearAngle.createOZChannelShearAngleInfo.s
//   raw-port/re/disasm/ProChannel.OZChannelShearAngle.createOZChannelShearAngleImpl.s

/** Opaque handle for `OZFactory` — passed through as an opaque pointer. */
export type OZFactory = object;

/** Opaque handle for `OZChannelFolder` — parent-folder pointer. */
export type OZChannelFolder = object;

/**
 * Opaque handle for `OZChannelImpl` — stored at +0x70 / +0x78. When the
 * caller passes nullptr, both slots receive the once-initialized default
 * loaded from `_OZChannelShearAngleImpl` global.
 */
export type OZChannelImpl = object;

/**
 * Opaque handle for `OZChannelInfo` — stored at +0x80 / +0x88. Same
 * mirror / default fallback pattern as impl.
 */
export type OZChannelInfo = object;

// ─────────────────────────────────────────────────────────────────────────
// Frontier callees.  Each throws with its call site cited.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `getOZChannelShearAngle_FactoryBase()` — free fn @ProChannel U-extern
 * `__Z34getOZChannelShearAngle_FactoryBasev`; NOT yet transcribed.
 * Called from 6-arg C2 @ProChannel 0x878b6 and 7-arg C2 @0x8799d.  The
 * returned pointer is fed as `factory=%rsi` into the OZChannel base ctor
 * at @0x878df / @0x879c3 respectively.
 */
function getOZChannelShearAngle_FactoryBase(): OZFactory {
  throw new Error(
    "getOZChannelShearAngle_FactoryBase() @ProChannel U-extern " +
      "__Z34getOZChannelShearAngle_FactoryBasev " +
      "(not yet transcribed) — invoked by OZChannelShearAngle 6-arg C2 @ProChannel 0x878b6, " +
      "7-arg C2 @0x8799d",
  );
}

/**
 * `OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*,
 *   unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)` — the
 * OZChannel base ctor (mangled
 * __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo).
 * NOT yet transcribed.
 *
 * Called from ALL THREE OZChannelShearAngle ctors:
 *   • 5-arg C2 @ProChannel 0x561b with (this, factory=caller, name=caller,
 *     folder=nullptr, uint1=caller, uint2=0, impl=caller, info=caller-stack).
 *   • 6-arg C2 @ProChannel 0x878df with (this, factory=singleton, name,
 *     folder, uint1, uint2, impl, info).
 *   • 7-arg C2 @ProChannel 0x879c3 with (this, factory=singleton, name,
 *     folder, uint1, uint2, impl, info) — same shape as 6-arg; the double
 *     is applied POST-ctor.
 */
function OZChannel_base_ctor(
  _self: OZChannelShearAngle,
  _factory: OZFactory,
  _name: string,
  _folder: OZChannelFolder | null,
  _uint1: number,
  _uint2: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*) @ProChannel U-extern " +
      "__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo " +
      "(not yet transcribed) — invoked by OZChannelShearAngle " +
      "5-arg C2 @ProChannel 0x561b, 6-arg C2 @0x878df, 7-arg C2 @0x879c3",
  );
}

/**
 * `OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)` — the
 * OZChannel copy-ctor (__ZN9OZChannelC2ERKS_P15OZChannelFolder).  NOT
 * yet transcribed.  Called from clone @ProChannel 0x1d037 with
 * (new-instance, *this, folder=nullptr).
 */
function OZChannel_copy_ctor(
  _self: OZChannelShearAngle,
  _src: OZChannelShearAngle,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @ProChannel U-extern " +
      "__ZN9OZChannelC2ERKS_P15OZChannelFolder " +
      "(not yet transcribed) — invoked by OZChannelShearAngle::clone @ProChannel 0x1d037",
  );
}

/**
 * `OZChannel::~OZChannel()` — OZChannel base dtor (__ZN9OZChannelD2Ev).
 * NOT yet transcribed.  Called tail-jmp from D1 @ProChannel 0x1cff7,
 * body-call from D0 @0x1d005, and from the 5-arg C2 exception-unwind
 * path @0x5696.
 */
function OZChannel_dtor(_self: OZChannelShearAngle): void {
  throw new Error(
    "OZChannel::~OZChannel() @ProChannel U-extern __ZN9OZChannelD2Ev " +
      "(not yet transcribed) — invoked by OZChannelShearAngle " +
      "D1 tail-jmp @ProChannel 0x1cff7, D0 call @0x1d005, 5-arg C2 unwind @0x5696",
  );
}

/**
 * `OZChannel::setDefaultValue(double)` — post-base-ctor setter
 * (__ZN9OZChannel15setDefaultValueEd).  NOT yet transcribed.  Called
 * ONLY from the 7-arg (double-first) ctor @ProChannel 0x87a39 with the
 * caller's double.
 */
function OZChannel_setDefaultValue(_self: OZChannelShearAngle, _v: number): void {
  throw new Error(
    "OZChannel::setDefaultValue(double) @ProChannel U-extern __ZN9OZChannel15setDefaultValueEd " +
      "(not yet transcribed) — invoked by OZChannelShearAngle 7-arg C2 @ProChannel 0x87a39",
  );
}

/**
 * `OZChannel::setInitialValue(double, bool)` — post-base-ctor setter
 * (__ZN9OZChannel15setInitialValueEdb).  NOT yet transcribed.  Called
 * ONLY from the 7-arg ctor @ProChannel 0x87a48 with (double, boolFalse=false).
 */
function OZChannel_setInitialValue(
  _self: OZChannelShearAngle,
  _v: number,
  _flag: boolean,
): void {
  throw new Error(
    "OZChannel::setInitialValue(double, bool) @ProChannel U-extern __ZN9OZChannel15setInitialValueEdb " +
      "(not yet transcribed) — invoked by OZChannelShearAngle 7-arg C2 @ProChannel 0x87a48",
  );
}

/**
 * `operator new(unsigned long)` — libc++abi/CRT extern (__Znwm).  Called
 * from clone @ProChannel 0x1d027 with size = 0x98 (152 bytes = sizeof
 * this class).  NOT yet transcribed.
 */
function operator_new(size: number): object {
  throw new Error(
    "operator new(unsigned long) @ProChannel U-extern __Znwm " +
      "(not yet transcribed) — invoked by OZChannelShearAngle::clone @ProChannel 0x1d027 (size=" +
      String(size) +
      ")",
  );
}

/**
 * `operator delete(void*)` — libc++abi/CRT extern (__ZdlPv).  Called
 * tail-jmp from D0 @ProChannel 0x1d013; also from clone exception-unwind
 * @0x1d05f (deleting half-constructed copy).  NOT yet transcribed.
 */
function operator_delete(_p: object): void {
  throw new Error(
    "operator delete(void*) @ProChannel U-extern __ZdlPv " +
      "(not yet transcribed) — invoked by OZChannelShearAngle D0 tail-jmp @ProChannel 0x1d013, " +
      "clone unwind @0x1d05f",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Once-guarded singleton lambdas (createOZChannelShearAngleInfo/Impl).
// Both share the same "if once-flag == -1 (done sentinel) then fast-path
// out, else stage tuple + call std::__call_once" gate, then load the
// populated global pointer.  The lambda BODIES that populate the two
// globals are not yet decoded (they live in nearby uninstantiated
// helpers) — we surface them as throwing stubs that cite the call sites.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelShearAngle::createOZChannelShearAngleInfo()` @ProChannel 0x56a4.
 *
 * DISASM:
 *   0x56a4..0x56a8  frame setup, subq $0x20,%rsp
 *   0x56ac  movq  __ZZN19OZChannelShearAngle29createOZChannelShearAngleInfoEvE29_OZChannelShearAngleInfo_once(%rip), %rax
 *   0x56b3  cmpq  $-0x1, %rax
 *   0x56b7  je    0x56de                       ; fast-path: once already done
 *   0x56b9..0x56d2  stage std::__call_once tuple (proxy stub at
 *                   __ZNSt3__117__call_once_proxyB9nqe210106<...
 *                   OZChannelShearAngle::createOZChannelShearAngleInfo()::
 *                   lambda...>Pv, once-flag rdi = _OZChannelShearAngleInfo_once)
 *   0x56d9  callq __ZNSt3__111__call_onceERVmPvPFvS2_E
 *   0x56de  leaq  __ZN19OZChannelShearAngle24_OZChannelShearAngleInfoE(%rip), %rax
 *   0x56e5  movq  (%rax), %rax                 ; load the populated singleton ptr
 *   0x56e8..0x56ed  frame teardown + retq
 *
 * We express this as a throwing stub whose thrown message cites both the
 * once-flag call site and the load site.  The stub's TS shape matches
 * the C++ signature `OZChannelInfo*()`.
 */
function createOZChannelShearAngleInfo_default(): OZChannelInfo {
  throw new Error(
    "OZChannelShearAngle::createOZChannelShearAngleInfo() (once-guarded lambda) @ProChannel 0x56a4 — " +
      "once-flag test @0x56ac (`_OZChannelShearAngleInfo_once`); __call_once @0x56d9; " +
      "singleton load @0x56de (`_OZChannelShearAngleInfo`); populated by the not-yet-transcribed lambda",
  );
}

/**
 * `OZChannelShearAngle::createOZChannelShearAngleImpl()` @ProChannel 0x56ee.
 *
 * DISASM (structurally identical to createOZChannelShearAngleInfo):
 *   0x56ee..0x56f2  frame setup
 *   0x56f6  movq  __ZZN19OZChannelShearAngle29createOZChannelShearAngleImplEvE29_OZChannelShearAngleImpl_once(%rip), %rax
 *   0x56fd  cmpq  $-0x1, %rax
 *   0x5701  je    0x5728                       ; fast-path
 *   0x5703..0x571c  stage __call_once tuple
 *   0x5723  callq __call_once
 *   0x5728  leaq  __ZN19OZChannelShearAngle24_OZChannelShearAngleImplE(%rip), %rax
 *   0x572f  movq  (%rax), %rax
 *   0x5732..0x5737  frame teardown + retq
 */
function createOZChannelShearAngleImpl_default(): OZChannelImpl {
  throw new Error(
    "OZChannelShearAngle::createOZChannelShearAngleImpl() (once-guarded lambda) @ProChannel 0x56ee — " +
      "once-flag test @0x56f6 (`_OZChannelShearAngleImpl_once`); __call_once @0x5723; " +
      "singleton load @0x5728 (`_OZChannelShearAngleImpl`); populated by the not-yet-transcribed lambda",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelShearAngle` — an OZChannel-lineage channel exposing the
 * "shear angle" scope.  sizeof = 0x98 (152 bytes, from clone @0x1d022).
 * Layout: primary vptr @+0x00, secondary vptr @+0x10, impl @+0x70/+0x78,
 * info @+0x80/+0x88; the rest is opaque OZChannel base state.
 *
 * The C++ class exposes THREE ctor variants (5-arg factory-taking,
 * 6-arg folder-taking, 7-arg double-first folder-taking), a trivial D1
 * dtor + delete-form D0 dtor pair, a `clone()` method that hand-rolls a
 * copy through the OZChannel copy ctor, and a `getObjCWrapperName()`
 * method that returns the constant NSString @"CHChannelShearAngle".
 *
 * NB: We do NOT `extends` an OZChannel base class here — the OZChannel
 * base ctor is a frontier stub (see OZChannel_base_ctor above), so
 * inheriting would only propagate un-populatable fields.  Instead we
 * model the observable per-instance state directly (impl / info) and
 * route the rest through the frontier.
 */
export class OZChannelShearAngle {
  /** Primary vptr @ProChannel install site 0x562b (5-arg C2) / 0x878ef (6-arg C2)
   *  / 0x879d3 (7-arg C2) / 0x1d043 (clone): all resolve to vtable+0x10 = 0xd2740.
   *  Implicit in JS via prototype identity. */
  // (primary vtable slot is implicit)

  /** Secondary vptr @ProChannel install site 0x5634 (5-arg C2) / 0x878f8 (6-arg C2)
   *  / 0x879dc (7-arg C2) / 0x1d04d (clone): all resolve to vtable+0x370 = 0xd2aa0.
   *  Implicit. */
  // (secondary vtable slot is implicit)

  /** `OZChannelImpl*` at C++ offset +0x70 (mirror of +0x78).  Assigned by
   *  ALL THREE ctors — 5-arg @0x5681, 6-arg @0x87949, 7-arg @0x87a2d. */
  impl!: OZChannelImpl;

  /** `OZChannelInfo*` at C++ offset +0x80 (mirror of +0x88).  Assigned by
   *  ALL THREE ctors — 5-arg @0x565c (post either-branch), 6-arg @0x87922,
   *  7-arg @0x87a06. */
  info!: OZChannelInfo;

  /**
   * `OZChannelShearAngle::OZChannelShearAngle(OZFactory*, PCString const&,
   *   unsigned int, OZChannelImpl*, OZChannelInfo*)` @ProChannel 0x55f4 [C2].
   *
   * Faithful transcription:
   *   1. Frame setup + reg spills @0x55f4-0x560d:
   *        rdi=this (→rbx), rsi=factory (→passed through to base as-is),
   *        rdx=name, rcx=uint1 (→r8d for base-ctor 5th SysV slot),
   *        r8=impl (→r14), r9=info (→r15).
   *        Then @0x560d/0x5612: stack[+0x8] = r9 (info),
   *                             stack[+0x0] = r14 (impl).
   *   2. Base-ctor arg staging @0x5616-0x5618:
   *        ecx = 0 (folder=nullptr — 4th SysV arg),
   *        r9d = 0 (uint2 — 6th SysV arg).
   *      @0x561b `callq OZChannel::OZChannel` with SysV args:
   *        rdi=this, rsi=factory, rdx=name, rcx=folder(=null), r8=uint1,
   *        r9=uint2(=0), [rsp]=impl, [rsp+8]=info.
   *   3. Vptr installs @0x5620-0x5638:
   *        %rax = &__ZTV19OZChannelShearAngle   (rip-relative load).
   *        *(this+0)     = %rax + 0x10  (= 0xd2740, primary vptr).
   *        *(this+0x10)  = %rax + 0x370 (= 0xd2aa0, secondary vptr).
   *   4. `createOZChannelShearAngleInfo()` @0x5638 — once-guarded init.
   *   5. Info-slot fixup @0x563d-0x565c — tests SAVED r15 (info arg):
   *        if (info != nullptr):  rax = this->+0x88  @0x5642
   *        else:                   rax = _OZChannelShearAngleInfo (global load)
   *                                 @0x564b-0x5652;
   *                                 this->+0x88 = rax  @0x5655
   *        this->+0x80 = rax   @0x565c   (unconditional mirror-write).
   *   6. `createOZChannelShearAngleImpl()` @0x5663 — once-guarded init.
   *   7. Impl-slot fixup @0x5668-0x5681 — tests SAVED r14 (impl arg):
   *        if (impl != nullptr):  rax = this->+0x78  @0x566d
   *        else:                   rax = _OZChannelShearAngleImpl (global load)
   *                                 @0x5673-0x567a;
   *                                 this->+0x78 = rax  @0x567d
   *        this->+0x70 = rax   @0x5681   (unconditional mirror-write).
   *   8. Frame teardown + retq @0x5685-0x568f.
   *   Exception path @0x5690-0x569e: `OZChannel::~OZChannel()` +
   *   `__Unwind_Resume`.
   */
  static newWithFactory(
    factory: OZFactory,
    name: string,
    uint1: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelShearAngle {
    const self = new OZChannelShearAngle();

    // Step 2 — @0x561b: OZChannel base ctor with folder=null, uint2=0.
    OZChannel_base_ctor(self, factory, name, null, uint1, 0, impl, info);
    // Step 3 — vptrs implicit @0x5620-0x5638.

    // Step 4 — @0x5638: createOZChannelShearAngleInfo() once-guarded init.
    // (Frontier stub; body not yet decoded.)
    // Deliberately call it EVEN IF the caller passed a non-null info,
    // matching the asm: the once-init is unconditional — only the
    // *use* of the resulting global (as the fallback) is conditional.
    // The stub throws, so this reflects the frontier gap loudly.
    createOZChannelShearAngleInfo_default();

    // Step 5 — @0x563d tests SAVED r15 (the info arg).
    if (info !== null) {
      // mirror +0x88 -> +0x80.  @0x5642-0x565c
      self.info = info;
    } else {
      // load _OZChannelShearAngleInfo singleton, store in both. @0x564b-0x565c
      self.info = createOZChannelShearAngleInfo_default();
    }

    // Step 6 — @0x5663: createOZChannelShearAngleImpl() once-guarded init.
    createOZChannelShearAngleImpl_default();

    // Step 7 — @0x5668 tests SAVED r14 (the impl arg).
    if (impl !== null) {
      // mirror +0x78 -> +0x70.  @0x566d-0x5681
      self.impl = impl;
    } else {
      // load _OZChannelShearAngleImpl singleton, store in both. @0x5673-0x5681
      self.impl = createOZChannelShearAngleImpl_default();
    }

    return self;
  }

  /**
   * `OZChannelShearAngle::OZChannelShearAngle(PCString const&,
   *   OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*,
   *   OZChannelInfo*)` @ProChannel 0x87892 [C2 — folder-taking, 6-arg].
   *
   * DIFFERENCES from newWithFactory():
   *   • The factory is NOT a caller-supplied arg — it is fetched from
   *     `getOZChannelShearAngle_FactoryBase()` @0x878b6.
   *   • BOTH `uint1` AND `uint2` are caller-supplied (unlike the 5-arg
   *     variant, which hardwires uint2 = 0).
   *   • The info-null check @0x87901 uses `0x10(%rbp)` (the STACK info
   *     arg — the SysV 7th arg spilled by the caller).
   *   • The impl-null check @0x8792e uses `-0x38(%rbp)` (the saved r9
   *     spilled @0x878a3), i.e. the 6th SysV arg (impl).
   *
   * Full disasm walk:
   *   1. Frame + reg spills @0x87892-0x878b3.
   *   2. @0x878b6: `callq getOZChannelShearAngle_FactoryBase` — result in %rax.
   *   3. Base-ctor arg staging @0x878bb-0x878cf:
   *        stack[+0x8] = 0x10(%rbp) (7th SysV = info),
   *        stack[+0]   = r15 = -0x38(%rbp) (impl),
   *        rsi = %rax  (factory result),
   *        rdx = %r14  (name), rcx = %r13 (folder),
   *        r8d = %r12d (uint1), r9d = -0x2c(%rbp) (uint2).
   *      @0x878df `callq OZChannel::OZChannel`.
   *   4. Vptr installs @0x878e4-0x878f8:
   *        primary = vtable+0x10 (0xd2740), secondary = vtable+0x370 (0xd2aa0).
   *   5. `createOZChannelShearAngleInfo()` @0x878fc.
   *   6. Info-slot fixup @0x87901-0x87922:
   *        if (0x10(%rbp) != 0):  this->+0x80 = this->+0x88   @0x87908-0x8790f
   *        else:                   this->+0x88 = this->+0x80 = _OZChannelShearAngleInfo
   *                                                              @0x87911-0x87922
   *   7. `createOZChannelShearAngleImpl()` @0x87929.
   *   8. Impl-slot fixup @0x8792e-0x87949:
   *        if (-0x38(%rbp) != 0):  rax = this->+0x78   @0x87935
   *        else:                    rax = _OZChannelShearAngleImpl
   *                                 this->+0x78 = rax   @0x8793b-0x87945
   *        this->+0x70 = rax   @0x87949   (unconditional).
   *   9. Frame teardown + retq @0x8794d-0x8795b.
   *   Exception path @0x8795c-0x8796a: `OZChannel::~OZChannel()` +
   *   `__Unwind_Resume`.
   */
  static newWithFolder(
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelShearAngle {
    const self = new OZChannelShearAngle();

    // Step 2 — @0x878b6: factory-base singleton fetch.
    const factory = getOZChannelShearAngle_FactoryBase();

    // Step 3 — @0x878df.
    OZChannel_base_ctor(self, factory, name, folder, uint1, uint2, impl, info);
    // Step 4 — vptrs implicit @0x878e4-0x878f8.

    // Step 5 — @0x878fc: createOZChannelShearAngleInfo() once-guarded init.
    createOZChannelShearAngleInfo_default();

    // Step 6 — @0x87901 tests the STACK info arg.
    if (info !== null) {
      self.info = info;                                    // @0x87908-0x8790f
    } else {
      self.info = createOZChannelShearAngleInfo_default(); // @0x87911-0x87922
    }

    // Step 7 — @0x87929: createOZChannelShearAngleImpl() once-guarded init.
    createOZChannelShearAngleImpl_default();

    // Step 8 — @0x8792e tests -0x38(%rbp) (saved impl arg).
    if (impl !== null) {
      self.impl = impl;                                    // @0x87935
    } else {
      self.impl = createOZChannelShearAngleImpl_default(); // @0x8793b-0x87945
    }

    return self;
  }

  /**
   * `OZChannelShearAngle::OZChannelShearAngle(double, PCString const&,
   *   OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*,
   *   OZChannelInfo*)` @ProChannel 0x87970 [C2 — double-first, 7-arg].
   *
   * DIFFERENCE from newWithFolder(): the FIRST arg is a `double`
   * (xmm0), which is spilled to `-0x38(%rbp)` @0x87991 immediately on
   * entry.  After the base ctor + info/impl fixup runs identically to
   * the 6-arg ctor, TWO trailing calls apply the double:
   *   @0x87a34 xmm0 = -0x38(%rbp) (reloaded double)
   *   @0x87a39 `callq OZChannel::setDefaultValue(double)`
   *   @0x87a41 xmm0 = -0x38(%rbp)  (reloaded double)
   *   @0x87a46 xorl %esi, %esi     (bool arg = false)
   *   @0x87a48 `callq OZChannel::setInitialValue(double, bool)`
   *
   * All other reg spill / arg offsets mirror the 6-arg ctor but shifted
   * by 8 bytes to accommodate the double slot:
   *   -0x30(%rbp) = uint2  (was -0x2c in the 6-arg),
   *   -0x2c(%rbp) = uint1  (was ecx),
   *   -0x38(%rbp) = double (as noted; the impl-arg is at -0x40 here),
   *   -0x40(%rbp) = impl   (saved r15 @0x87984 / re-tested @0x87a12).
   *
   * The info-null check @0x879e5 uses `0x10(%rbp)` (7th SysV, stack info)
   * exactly as the 6-arg ctor does.
   *
   * Full disasm walk (from raw-port/re/disasm/.../ctor_dbl_folder.s):
   *   1. Frame + reg spills @0x87970-0x87999.  Notable spills:
   *        xmm0 (double) → -0x38(%rbp)      @0x87991
   *        r15 (impl)     → -0x40(%rbp)      (via `movq %r15, -0x40(%rbp)`
   *                                           implicit through the r12
   *                                           load @0x87999?  Actually
   *                                           @0x87999 loads r12 =
   *                                           0x10(%rbp) which is the 7th
   *                                           SysV = info stack slot.
   *                                           The impl slot in this ctor
   *                                           lives in r15 throughout the
   *                                           base-ctor call and is spilled
   *                                           by the compiler as needed;
   *                                           the fixup @0x87a12 reads
   *                                           -0x40(%rbp) which the compiler
   *                                           has populated from r15.)
   *   2. @0x8799d: factory-base singleton fetch.
   *   3. Base-ctor arg staging @0x879a2-0x879c3.  Same as 6-arg ctor,
   *      shifted by 8 (uint1 at -0x2c, uint2 at -0x30, info stack still
   *      at 0x10(%rbp)).
   *   4. Vptr installs @0x879c8-0x879dc.
   *   5. `createOZChannelShearAngleInfo()` @0x879e0.
   *   6. Info-slot fixup @0x879e5-0x87a06.  Same as 6-arg ctor.
   *   7. `createOZChannelShearAngleImpl()` @0x87a0d.
   *   8. Impl-slot fixup @0x87a12-0x87a2d.  Tests -0x40(%rbp) (saved impl).
   *   9. Double application @0x87a31-0x87a48:
   *        setDefaultValue(double)  @0x87a39
   *        setInitialValue(double, false)  @0x87a48
   *  10. Frame teardown + retq @0x87a4d-0x87a5b.
   *  Exception path @0x87a5c-0x87a6a: `OZChannel::~OZChannel()` +
   *  `__Unwind_Resume`.
   */
  static newWithDoubleAndFolder(
    dbl: number,
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelShearAngle {
    const self = new OZChannelShearAngle();

    // Step 2 — @0x8799d.
    const factory = getOZChannelShearAngle_FactoryBase();

    // Step 3 — @0x879c3.
    OZChannel_base_ctor(self, factory, name, folder, uint1, uint2, impl, info);
    // Step 4 — vptrs implicit @0x879c8-0x879dc.

    // Step 5 — @0x879e0.
    createOZChannelShearAngleInfo_default();

    // Step 6 — @0x879e5 tests STACK info arg.
    if (info !== null) {
      self.info = info;                                    // @0x879ec-0x879f3
    } else {
      self.info = createOZChannelShearAngleInfo_default(); // @0x879f5-0x87a06
    }

    // Step 7 — @0x87a0d.
    createOZChannelShearAngleImpl_default();

    // Step 8 — @0x87a12 tests -0x40(%rbp) (saved impl arg).
    if (impl !== null) {
      self.impl = impl;                                    // @0x87a19
    } else {
      self.impl = createOZChannelShearAngleImpl_default(); // @0x87a1f-0x87a29
    }

    // Step 9 — @0x87a39: setDefaultValue(dbl).
    OZChannel_setDefaultValue(self, dbl);
    // @0x87a48: setInitialValue(dbl, false).
    OZChannel_setInitialValue(self, dbl, false);

    return self;
  }

  /**
   * `OZChannelShearAngle::~OZChannelShearAngle()` @ProChannel 0x1cff2 [D1].
   *
   * DISASM (D1):
   *   0x1cff2  pushq %rbp
   *   0x1cff3  movq  %rsp, %rbp
   *   0x1cff6  popq  %rbp
   *   0x1cff7  jmp   __ZN9OZChannelD2Ev   ; tail-jmp OZChannel::~OZChannel()
   *
   * Trivial: this class introduces no owned per-instance state; all
   * cleanup is inherited.
   *
   * The deleting-dtor form @ProChannel 0x1cffc [D0]:
   *   0x1cffc..0x1d002  frame setup + spill %rdi(this)->%rbx
   *   0x1d005  callq __ZN9OZChannelD2Ev   ; OZChannel::~OZChannel()
   *   0x1d00a  movq  %rbx, %rdi
   *   0x1d00d..0x1d012  frame teardown
   *   0x1d013  jmp   __ZdlPv               ; operator delete(this)
   *
   * We express both as a single TS `destructor()` method; the D0-specific
   * `operator delete(this)` tail-jmp has no runtime TS mirror (JS GC
   * reclaims the object once no live refs remain — the frontier stub
   * `operator_delete` above is cited for provenance).
   */
  destructor(): void {
    // @0x1cff7 (D1 tail-jmp) / @0x1d005 (D0 body-call).
    OZChannel_dtor(this);

    // @0x1d013 (D0 only) — operator delete(this).  No TS mirror.
  }

  /**
   * `OZChannelShearAngle::clone() const` @ProChannel 0x1d018
   * (vtable slot *0xf8).
   *
   * DISASM:
   *   0x1d018..0x1d01f  frame setup + spill %rdi(this)->%r14
   *   0x1d022  movl  $0x98, %edi                     ; size = 152 bytes
   *   0x1d027  callq __Znwm                          ; operator new(0x98)
   *   0x1d02c  movq  %rax, %rbx                      ; rbx = new instance
   *   0x1d02f  movq  %rax, %rdi                      ; rdi = new instance
   *   0x1d032  movq  %r14, %rsi                      ; rsi = &(*this)
   *   0x1d035  xorl  %edx, %edx                      ; rdx = 0 (folder=null)
   *   0x1d037  callq __ZN9OZChannelC2ERKS_P15OZChannelFolder ; OZChannel copy ctor
   *   0x1d03c  leaq  0xb56fd(%rip), %rax             ; rax = 0xd2740 (primary vptr, vtable+0x10)
   *   0x1d043  movq  %rax, (%rbx)
   *   0x1d046  leaq  0xb5a53(%rip), %rax             ; rax = 0xd2aa0 (secondary vptr, vtable+0x370)
   *   0x1d04d  movq  %rax, 0x10(%rbx)
   *   0x1d051  movq  %rbx, %rax                      ; return new instance
   *   0x1d054..0x1d058  frame teardown + retq
   *   Exception path @0x1d059-0x1d067: operator delete + __Unwind_Resume.
   *
   * The copy is a SHALLOW OZChannel-level copy — the OZChannel copy ctor
   * handles the memberwise duplication of the base subobject, which
   * includes this class's own +0x70/+0x78/+0x80/+0x88 slots (they live
   * within the OZChannel base subobject).  The only per-derived-class
   * work here is re-installing the two vptrs.
   */
  clone(): OZChannelShearAngle {
    // @0x1d027 — 0x98-byte allocation.
    const copy = operator_new(0x98) as OZChannelShearAngle;

    // @0x1d037 — OZChannel copy-ctor with folder = null.
    OZChannel_copy_ctor(copy, this, null);

    // @0x1d043 / @0x1d04d — vptr re-installs (implicit in JS: `copy`
    // is already a JS object whose prototype is
    // `OZChannelShearAngle.prototype`, matching the C++ vtable identity).

    return copy;
  }

  /**
   * `OZChannelShearAngle::getObjCWrapperName()` @ProChannel 0x1cc6c
   * (vtable slot *0x58).
   *
   * DISASM:
   *   0x1cc6c  pushq %rbp
   *   0x1cc6d  movq  %rsp, %rbp
   *   0x1cc70  leaq  0xc8139(%rip), %rax   ; rax = &(__cfstring @ProChannel 0xe4db0)
   *   0x1cc77  popq  %rbp
   *   0x1cc78  retq
   *
   * The RIP-relative target is `0x1cc77 + 0xc8139 = 0xe4db0`, which lands
   * in the __cfstring section (VA 0xe4c90..0xe6210 per the load command:
   * `sectname __cfstring; addr 0x00000000000e4c90; size 0x00000000000001580`).
   *
   * Direct binary read (fat sub-arch offset 0x4000; section file offset
   * 937104) of the 32-byte CFString record @0xe4db0:
   *   isa    = 0x802000000000020a  (__CFConstantStringClassReference,
   *                                  chained-fixups–tagged)
   *   flags  = 0x00000000000007c8  (kCFStringGraphicsBit-family; ASCII)
   *   cstr   = 0x00200000000bc4d8  (chained-fixups tag masked -> 0xbc4d8)
   *   length = 19                   (0x13 bytes of ASCII payload)
   *
   * At __cstring VA 0xbc4d8 (fat file offset 0xc04d8) the payload is the
   * 19-byte ASCII "CHChannelShearAngle" (nul-terminated).  Verified by a
   * direct read of the FCP binary — see the recall in the class-header
   * comment above.
   *
   * We return that verbatim — the ObjC wrapper name for this class is
   * the NSString @"CHChannelShearAngle".
   */
  getObjCWrapperName(): string {
    // @0x1cc70 — leaq to the __cfstring record @0xe4db0, whose 19-byte
    // __cstring payload was decoded from the binary (see JSDoc above).
    return "CHChannelShearAngle";
  }
}
