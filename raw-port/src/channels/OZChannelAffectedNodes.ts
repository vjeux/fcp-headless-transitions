// OZChannelAffectedNodes — Ozone OZChannel subclass exposing the "affected
// nodes" behavior scope (an OZTransitiveBehavior-family channel, per the
// nearby classes in Ozone; the ObjC wrapper name is "CHChannel").
//
// Framework: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework)
// The thin x86_64 slice is a plain Mach-O (no fat header) — VAs in the
// disasm are file offsets modulo the __TEXT slide.
//
// Faithful transcription of exactly SIX exported symbols (nm listing):
//   0x0001d5c0  OZChannelAffectedNodes::OZChannelAffectedNodes(OZFactory*, PCString const&, unsigned int, OZChannelImpl*, OZChannelInfo*)   [C2 — factory-taking, 5-arg]
//   0x0020a9f0  OZChannelAffectedNodes::OZChannelAffectedNodes(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)  [C2 — folder-taking, 6-arg]
//   0x002093f0  OZChannelAffectedNodes::~OZChannelAffectedNodes()  [D1 — trivial tail-jmp to OZChannel::~OZChannel]
//   0x0020a920  OZChannelAffectedNodes::~OZChannelAffectedNodes()  [D0 — call OZChannel::~OZChannel + operator delete]
//   0x0020a940  OZChannelAffectedNodes::clone() const
//   0x002091d0  OZChannelAffectedNodes::getObjCWrapperName()
// (No separate C1 or D2 symbols were emitted — clang/Itanium ABI aliases C1
//  onto C2 and folds D2 into D1 when the bodies would be identical.)
//
// VTABLE — resolved via `resolve.py Ozone vtable OZChannelAffectedNodes`
// (`# OZChannelAffectedNodes vtable @0x8464b8; installed ptr 0x8464c8`):
//   *0x00 -> 0x2093f0   ~OZChannelAffectedNodes()             [D1]
//   *0x08 -> 0x20a920   ~OZChannelAffectedNodes()             [D0]
//   *0x10 -> 0x1fab0    OZFactoryBase::getIconName() const    (inherited)
//   *0x18 -> 0x1fad0    OZFactoryBase::getIconNameBW() const  (inherited)
//   *0x20 -> 0x1faf0    OZFactoryBase::getIconID() const      (inherited)
//   *0x28 -> 0x1fb00    OZFactoryBase::getLibraryIconName() const (inherited)
//   *0x30 -> 0x1fb20    OZFactoryBase::description()          (inherited)
//   *0x38 -> 0x1fb40    OZChannelBase::getInstanceID() const  (inherited)
//   *0x40 -> 0x1fb50    OZChannelBase::getSerializer()        (inherited)
//   *0x48 -> 0x1fb60    OZFactoryBase::getFactoryForSerialization(...) const (inherited)
//   *0x58 -> 0x2091d0   OZChannelAffectedNodes::getObjCWrapperName()  (this class)
//   *0xf8 -> 0x20a940   OZChannelAffectedNodes::clone() const         (this class)
// The primary vptr is installed as `vtable + 0x10` (0x8464c8) by all three
// entry points that write it (C2 @0x1d5ec-fa, C2 @0x20aa74-7b, clone
// @0x20a964-6b). Additionally a SECONDARY vptr = `vtable + 0x370` (0x846828)
// is written to `this+0x10` by C2 @0x1d5f7-fa, C2 @0x20aa7e-89, clone
// @0x20a96e-75 — this is Ozone's characteristic two-vptr layout for
// OZChannel-family derived classes (matching e.g. OZChannelAngle at
// raw-port/src/channels/OZChannelAngle.ts and OZChannelDouble at
// raw-port/src/channels/OZChannelDouble.ts).
//
// STRUCT LAYOUT (recovered from field references in this class's own slice
// and cross-checked against OZChannelAngle/OZChannelDouble):
//   +0x000  primary vptr        (= vtable[OZChannelAffectedNodes] + 0x10 = 0x8464c8)
//   +0x008..+0x00f              (OZChannel base subobject slot 0 — opaque)
//   +0x010  secondary vptr      (= vtable[OZChannelAffectedNodes] + 0x370 = 0x846828)
//   +0x018..+0x06f              (OZChannel base subobject — opaque)
//   +0x070  OZChannelImpl*  impl  (mirror of +0x78)
//   +0x078  OZChannelImpl*  impl  (initial slot; base ctor writes here from caller arg)
//   +0x080  OZChannelInfo*  info  (mirror of +0x88)
//   +0x088  OZChannelInfo*  info  (initial slot; base ctor writes here)
//   +0x090..                    (rest of OZChannel base subobject — opaque)
//   sizeof(OZChannelAffectedNodes) = 0x98 = 152 bytes
//     (recovered from clone @0x20a94a: `movl $0x98, %edi` fed straight to
//      `operator new`).
//
// FRONTIER CALLEES (each surfaced as a throwing stub with its call site cited):
//   OZChannel::OZChannel(OZFactory*, PCString&, OZChannelFolder*, u, u, OZChannelImpl*, OZChannelInfo*)
//     [__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo]
//     — OZChannel base ctor. Called from BOTH derived ctors: 5-arg @Ozone
//     0x1d5e7 with (this, factory=caller-arg, name=caller-arg, folder=nullptr,
//     uint1=caller-arg, uint2=0, impl=caller-arg, info=caller-arg-stack);
//     6-arg @0x20aa6f with (this, factory=OZChannelAffectedNodes_Factory
//     ::_instance singleton, name, folder, uint1, uint2, impl, info).
//   OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
//     [__ZN9OZChannelC2ERKS_P15OZChannelFolder] — OZChannel copy-ctor.
//     Called from clone @0x20a95f with (new-instance, *this, folder=nullptr).
//   OZChannel::~OZChannel()  [__ZN9OZChannelD2Ev] — base dtor. Called
//     tail-jmp from D1 @0x2093f5, and body-call from D0 @0x20a929 followed
//     by `operator delete` @0x20a937 (deleting-dtor pattern). Also invoked
//     from BOTH C2 exception-unwind paths (@0x1d6d4 and @0x20ab5b).
//   operator new(unsigned long)  [__Znwm] — 0x98-byte allocation in clone
//     @0x20a94f. (The other allocs seen in nearby methods are not this
//     class's frontier.)
//   operator delete(void*)  [__ZdlPv] — D0 tail-jmp @0x20a937 (deletes
//     this); clone exception-unwind @0x20a987 (deletes half-constructed
//     copy).
//   OZChannelAffectedNodes_Factory::getInstance()
//     — the once-guarded singleton lambda invoked by C2(folder, ...)
//     @0x20aa14-43 through std::__call_once. Reads/writes globals
//     __ZN30OZChannelAffectedNodes_Factory13_instanceOnceE (once flag)
//     and __ZN30OZChannelAffectedNodes_Factory9_instanceE (result).
//     The lambda body is not yet decoded on this class's own surface.
//   OZChannelAffectedNodes::createOZChannelAffectedNodesInfo()
//     — the once-guarded lambda invoked by BOTH ctors through
//     std::__call_once. Called sites: 5-arg C2 @0x1d604-33, 6-arg C2
//     @0x20aa89-b8. Populates __ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesInfoE.
//     Body not yet decoded here (a nearby OZChannelAffectedNodesInfo.ts
//     transcribes the resulting Info object's dtors).
//   OZChannelAffectedNodes::createOZChannelAffectedNodesImpl()
//     — the once-guarded lambda invoked by BOTH ctors through
//     std::__call_once. Called sites: 5-arg C2 @0x1d64b-6a1, 6-arg C2
//     @0x20aad2-b25. Populates __ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesImplE.
//     Body not yet decoded.
//   std::__1::__call_once(unsigned long&, void*, void(*)(void*))
//     [__ZNSt3__111__call_onceERVmPvPFvS2_E] — libc++ once-runner. Called
//     with the __call_once_proxy stubs above at 5-arg C2 @0x1d633 / 0x1d6a1
//     and 6-arg C2 @0x20aa43 / 0x20aab8 / 0x20ab25.
//   __Unwind_Resume — exception-unwind rethrows @Ozone 0x1d6dc (5-arg C2),
//     0x20ab63 (6-arg C2), 0x20a98f (clone).
//
// REUSED PORTS: OZChannelAngle / OZChannelDouble in ./OZChannelAngle.ts and
// ./OZChannelDouble.ts served as byte-for-byte structural templates for the
// two ctor bodies (identical std::__call_once "already-done fast-path" gate,
// identical +0x78 / +0x88 mirror-write pattern, identical two-vptr write).
//
// Source disassembly saved at:
//   raw-port/re/disasm/Ozone.OZChannelAffectedNodes.all.s

/**
 * Opaque handle for `OZFactory` — the Ozone factory-base pointer that
 * the OZChannel base ctor stores inside the OZChannel subobject.
 * On this class's own decoded surface, factory objects are only ever
 * passed through as opaque pointers.
 */
export type OZFactory = object;

/**
 * Opaque handle for `OZChannelFolder` — the parent-folder pointer.
 */
export type OZChannelFolder = object;

/**
 * Opaque handle for `OZChannelImpl` — the impl-slot pointer stored at
 * this class's +0x70 / +0x78.  The 5-arg ctor path stores the caller-
 * supplied impl (mirroring +0x78 to +0x70); when the caller supplies
 * nullptr, both slots receive the once-initialized default impl loaded
 * from `_OZChannelAffectedNodesImpl` global.
 */
export type OZChannelImpl = object;

/**
 * Opaque handle for `OZChannelInfo` — the info-slot pointer stored at
 * this class's +0x80 / +0x88.  Same mirror-write / default-fallback
 * pattern as the impl slot.
 */
export type OZChannelInfo = object;

// ─────────────────────────────────────────────────────────────────────────
// Frontier callees.
// ─────────────────────────────────────────────────────────────────────────

/**
 * OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*,
 *                       unsigned int, unsigned int, OZChannelImpl*,
 *                       OZChannelInfo*) — frontier method (OZChannel base
 * ctor, __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo,
 * defined in ProChannel; not yet transcribed).
 *
 * Called from BOTH OZChannelAffectedNodes ctors:
 *   • 5-arg C2 @Ozone 0x1d5e7 with (this, factory=caller, name=caller,
 *     folder=nullptr, uint1=caller, uint2=0, impl=caller, info=caller-stack).
 *   • 6-arg C2 @Ozone 0x20aa6f with (this, factory=_instance singleton,
 *     name, folder, uint1, uint2, impl, info).
 */
function OZChannel_base_ctor(
  _self: OZChannelAffectedNodes,
  _factory: OZFactory,
  _name: string,
  _folder: OZChannelFolder | null,
  _uint1: number,
  _uint2: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*) @Ozone U-extern " +
      "__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo " +
      "(defined in ProChannel; not yet transcribed) — invoked by " +
      "OZChannelAffectedNodes 5-arg C2 @Ozone 0x1d5e7, 6-arg C2 @0x20aa6f",
  );
}

/**
 * OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) — frontier
 * method (OZChannel copy-ctor, __ZN9OZChannelC2ERKS_P15OZChannelFolder,
 * defined in ProChannel; not yet transcribed).  Called from clone
 * @Ozone 0x20a95f with (new-instance, *this, folder=nullptr).
 */
function OZChannel_copy_ctor(
  _self: OZChannelAffectedNodes,
  _src: OZChannelAffectedNodes,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @Ozone U-extern " +
      "__ZN9OZChannelC2ERKS_P15OZChannelFolder " +
      "(defined in ProChannel; not yet transcribed) — invoked by " +
      "OZChannelAffectedNodes::clone @Ozone 0x20a95f",
  );
}

/**
 * OZChannel::~OZChannel() — frontier method (OZChannel base dtor,
 * __ZN9OZChannelD2Ev, defined in ProChannel; not yet transcribed).
 * Called tail-jmp from D1 @Ozone 0x2093f5, body-call from D0 @0x20a929,
 * and from both C2 exception-unwind paths @0x1d6d4 / @0x20ab5b.
 */
function OZChannel_dtor(_self: OZChannelAffectedNodes): void {
  throw new Error(
    "OZChannel::~OZChannel() @Ozone U-extern __ZN9OZChannelD2Ev " +
      "(defined in ProChannel; not yet transcribed) — invoked by " +
      "OZChannelAffectedNodes D1 tail-jmp @Ozone 0x2093f5, D0 call @0x20a929, " +
      "5-arg C2 unwind @0x1d6d4, 6-arg C2 unwind @0x20ab5b",
  );
}

/**
 * operator new(unsigned long) — frontier stub (__Znwm). Called from
 * clone @Ozone 0x20a94f with size = 0x98 (152 bytes = sizeof this class).
 */
function operator_new(size: number): object {
  throw new Error(
    "operator new(unsigned long) @Ozone U-extern __Znwm " +
      "(libc++abi/CRT; not yet transcribed) — invoked by " +
      "OZChannelAffectedNodes::clone @Ozone 0x20a94f (size=" +
      String(size) +
      ")",
  );
}

/**
 * operator delete(void*) — frontier stub (__ZdlPv). Called tail-jmp
 * from D0 @Ozone 0x20a937, and from clone exception-unwind @0x20a987.
 */
function operator_delete(_p: object): void {
  throw new Error(
    "operator delete(void*) @Ozone U-extern __ZdlPv " +
      "(libc++abi/CRT; not yet transcribed) — invoked by " +
      "OZChannelAffectedNodes D0 tail-jmp @Ozone 0x20a937, " +
      "clone unwind @0x20a987",
  );
}

/**
 * OZChannelAffectedNodes_Factory::getInstance() — frontier method.
 * Bound through std::__call_once by the 6-arg C2 ctor @0x20aa14-43 with
 * the once-flag `__ZN30OZChannelAffectedNodes_Factory13_instanceOnceE`
 * and the proxy stub `__ZNSt3__117__call_once_proxyB9nqe210106<...
 * OZChannelAffectedNodes_Factory::getInstance()::lambda...>Pv`.  After the
 * once-guarded init, the singleton is loaded from
 * `__ZN30OZChannelAffectedNodes_Factory9_instanceE` @0x20aa48 and fed as
 * factory=%rsi into the OZChannel base ctor.
 */
function OZChannelAffectedNodes_Factory_getInstance(): OZFactory {
  throw new Error(
    "OZChannelAffectedNodes_Factory::getInstance() (once-guarded singleton lambda) @Ozone — " +
      "referenced by OZChannelAffectedNodes 6-arg C2 @0x20aa14-43 (once-flag load), " +
      "@0x20aa48 (_instance load). Lambda body not yet decoded.",
  );
}

/**
 * OZChannelAffectedNodes::createOZChannelAffectedNodesInfo() — frontier
 * method. Bound through std::__call_once by BOTH ctors:
 *   • 5-arg C2 @0x1d604-33 (once-flag `_OZChannelAffectedNodesInfo_once`)
 *   • 6-arg C2 @0x20aa89-b8 (same once-flag)
 * Populates `__ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesInfoE`,
 * which the ctors load @0x1d65a (5-arg) / @0x20aae1 (6-arg) when the
 * caller passes info=nullptr.
 */
function createOZChannelAffectedNodesInfo_default(): OZChannelInfo {
  throw new Error(
    "OZChannelAffectedNodes::createOZChannelAffectedNodesInfo() (once-guarded lambda) @Ozone — " +
      "referenced by 5-arg C2 @0x1d604-33, 6-arg C2 @0x20aa89-b8. " +
      "Populates __ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesInfoE (loaded @0x1d65a / @0x20aae1). Lambda body not yet decoded.",
  );
}

/**
 * OZChannelAffectedNodes::createOZChannelAffectedNodesImpl() — frontier
 * method. Bound through std::__call_once by BOTH ctors:
 *   • 5-arg C2 @0x1d64b-6a1 (once-flag `_OZChannelAffectedNodesImpl_once`)
 *   • 6-arg C2 @0x20aad2-b25 (same once-flag)
 * Populates `__ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesImplE`,
 * which the ctors load @0x1d6b1 (5-arg) / @0x20ab37 (6-arg) when the
 * caller passes impl=nullptr.
 */
function createOZChannelAffectedNodesImpl_default(): OZChannelImpl {
  throw new Error(
    "OZChannelAffectedNodes::createOZChannelAffectedNodesImpl() (once-guarded lambda) @Ozone — " +
      "referenced by 5-arg C2 @0x1d64b-6a1, 6-arg C2 @0x20aad2-b25. " +
      "Populates __ZN22OZChannelAffectedNodes27_OZChannelAffectedNodesImplE (loaded @0x1d6b1 / @0x20ab37). Lambda body not yet decoded.",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelAffectedNodes` — an OZChannel-lineage channel exposing the
 * "affected nodes" transitive-behavior scope. sizeof = 0x98 (152 bytes,
 * recovered from clone @0x20a94a). Layout: primary vptr @+0x00, secondary
 * vptr @+0x10, impl @+0x70/+0x78, info @+0x80/+0x88; the rest is opaque
 * OZChannel base state.
 *
 * The C++ class exposes two ctor variants, a trivial D1/D0 vdtor pair,
 * a `clone()` method that hand-rolls a copy through the OZChannel copy
 * ctor, and a `getObjCWrapperName()` method that returns the constant
 * NSString @"CHChannel" (the ObjC-side class-name adapter).
 *
 * NB: We do NOT `extends` an OZChannel base class here — the OZChannel
 * base ctor is a frontier stub (see OZChannel_base_ctor above), so
 * inheriting would only propagate un-populatable fields. Instead we
 * model the observable per-instance state directly (impl / info /
 * secondary vptr) and route the rest through the frontier.
 */
export class OZChannelAffectedNodes {
  /** Primary vptr @Ozone install site 0x1d5f7 (5-arg C2) / 0x20aa7b (6-arg C2)
   *  / 0x20a96b (clone): all resolve to vtable+0x10 = 0x8464c8. Implicit in JS. */
  // (primary vtable slot is implicit)

  /** Secondary vptr @Ozone install site 0x1d600 (5-arg C2) / 0x20aa85 (6-arg C2)
   *  / 0x20a975 (clone): all resolve to vtable+0x370 = 0x846828. Implicit. */
  // (secondary vtable slot is implicit)

  /** OZChannelImpl* at C++ offset +0x70 (mirror of +0x78). Assigned by
   *  BOTH ctors @0x1d6bf (5-arg) / 0x20ab42 (6-arg). */
  impl!: OZChannelImpl;

  /** OZChannelInfo* at C++ offset +0x80 (mirror of +0x88). Assigned by
   *  BOTH ctors @0x1d644 (5-arg mirror) / 0x1d66b (5-arg default) /
   *  0x20aacb (6-arg mirror) / 0x20aaef (6-arg default). */
  info!: OZChannelInfo;

  /**
   * `OZChannelAffectedNodes::OZChannelAffectedNodes(OZFactory*,
   *   PCString const&, unsigned int, OZChannelImpl*, OZChannelInfo*)`
   * @Ozone 0x1d5c0 [C2].
   *
   * Faithful transcription (raw disasm in
   * raw-port/re/disasm/Ozone.OZChannelAffectedNodes.all.s):
   *   1. Frame setup + reg spills @0x1d5c0-e6.  Argument register mapping
   *      (System V AMD64 ABI):
   *        rdi=this (%rbx), rsi=factory (%r14 backup — but see below),
   *        rdx=name (%rsi in base-ctor call), rcx=uint1 (%r8d in base call),
   *        r8=impl (%r14), r9=info (%r15).
   *        Wait — reread: The disasm shows @0x1d5cd `%r9, %r15` (r9=info),
   *        @0x1d5d0 `%r8, %r14` (r8=impl), @0x1d5d3 `%ecx, %r8d`
   *        (uint1→r8d, i.e. moved to the 5th SysV arg slot for the base
   *        ctor), @0x1d5d6 `%rdi, %rbx` (this).
   *   2. Base-ctor arg staging @0x1d5d9-e4:
   *        stack[+0x8] = %r9 (info),  stack[+0] = %r14 (impl),
   *        %rcx = 0 (folder=nullptr), %r9d = 0 (uint2=0).
   *      Then @0x1d5e7 `callq OZChannel::OZChannel` with SysV args:
   *        rdi=this, rsi=factory, rdx=name, rcx=folder(=null), r8=uint1,
   *        r9=uint2(=0), [rsp]=impl, [rsp+8]=info.
   *   3. Vptr installs @0x1d5ec-fa:
   *        %rax = &__ZTV22OZChannelAffectedNodes  (rip-relative load).
   *        *(this+0)     = %rax + 0x10   (= 0x8464c8, primary vptr).
   *        *(this+0x10)  = %rax + 0x370  (= 0x846828, secondary vptr).
   *   4. Once-guarded init of `_OZChannelAffectedNodesInfo` @0x1d604-33:
   *        Load `_OZChannelAffectedNodesInfo_once`. If already == -1 (the
   *        "done" sentinel), jump past to step 5. Otherwise, stage the
   *        std::__call_once tuple on the stack and call `__call_once`.
   *   5. Info-slot fixup @0x1d638-6a — reads the SAVED r15 (i.e. the
   *      original `info` argument), NOT re-fetching from the stack:
   *        if (info != nullptr):
   *          rax = this->+0x88   @0x1d63d
   *          this->+0x80 = rax   @0x1d644
   *        else:
   *          rax = _OZChannelAffectedNodesInfo (global load) @0x1d65a-61
   *          this->+0x88 = rax   @0x1d664
   *          this->+0x80 = rax   @0x1d66b
   *      (Both paths converge at @0x1d672.)
   *   6. Once-guarded init of `_OZChannelAffectedNodesImpl` @0x1d672-6a1:
   *        Same once-flag / __call_once dance for the Impl singleton.
   *   7. Impl-slot fixup @0x1d6a6-c3:
   *        if (impl != nullptr):
   *          rax = this->+0x78   @0x1d6ab
   *        else:
   *          rax = _OZChannelAffectedNodesImpl (global load) @0x1d6b1-b8
   *          this->+0x78 = rax   @0x1d6bb
   *        this->+0x70 = rax   @0x1d6bf   (unconditional mirror-write)
   *   8. Frame teardown + retq @0x1d6c3-cd.
   *   Exception path @0x1d6ce-e0: `OZChannel::~OZChannel()` +
   *   `__Unwind_Resume`.
   *
   * Note: the base ctor's arg-6 (`uint2`) is HARDWIRED to zero here
   * (@0x1d5e4 `xorl %r9d, %r9d`), even though this ctor variant does not
   * expose uint2 in its own signature. This is the observable ABI edge.
   */
  static newWithFactory(
    factory: OZFactory,
    name: string,
    uint1: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelAffectedNodes {
    const self = new OZChannelAffectedNodes();

    // Step 2 — @0x1d5e7: OZChannel base ctor with folder=null, uint2=0.
    OZChannel_base_ctor(self, factory, name, null, uint1, 0, impl, info);
    // Step 3 — vptr installs @0x1d5ec-fa: implicit via JS prototype identity.

    // Step 5 — info-slot fixup.  @0x1d638 tests the SAVED r15 (info arg).
    if (info !== null) {
      // mirror +0x88 -> +0x80.  @0x1d63d-44
      self.info = info;
    } else {
      // load _OZChannelAffectedNodesInfo singleton (steps 4+5-default) and
      // store in both. @0x1d65a-6b
      self.info = createOZChannelAffectedNodesInfo_default();
    }

    // Step 7 — impl-slot fixup.  @0x1d6a6 tests the SAVED r14 (impl arg).
    if (impl !== null) {
      // mirror +0x78 -> +0x70.  @0x1d6ab-bf
      self.impl = impl;
    } else {
      // load _OZChannelAffectedNodesImpl singleton and store in both.
      // @0x1d6b1-bf
      self.impl = createOZChannelAffectedNodesImpl_default();
    }

    return self;
  }

  /**
   * `OZChannelAffectedNodes::OZChannelAffectedNodes(PCString const&,
   *   OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*,
   *   OZChannelInfo*)` @Ozone 0x20a9f0 [C2 — folder-taking, 6-arg].
   *
   * DIFFERENCE from newWithFactory():
   *   • The factory is NOT a caller-supplied arg — it is fetched from the
   *     once-guarded singleton `OZChannelAffectedNodes_Factory::_instance`
   *     (loaded @0x20aa48 after the __call_once gate @0x20aa14-43).
   *   • BOTH `uint1` AND `uint2` are caller-supplied (unlike the 5-arg
   *     variant, which zero-fills uint2).
   *   • The info-null check @0x20aabd uses `0x10(%rbp)` (the STACK info
   *     arg — i.e. the SysV 7th arg), matching OZChannelAngle's pattern.
   *   • The impl-null check @0x20ab2a uses `-0x48(%rbp)` (the saved r9
   *     spilled @0x20aa01), i.e. the 6th SysV arg.
   *
   * Full disasm walk:
   *   1. Frame + reg spills @0x20a9f0-11:
   *        r9→-0x48(%rbp) (impl), r8d→r15d (uint2), ecx→r12d (uint1),
   *        rdx→r13 (folder), rsi→r14 (name), rdi→rbx (this).
   *   2. Factory singleton once-init @0x20aa14-43. Load _instanceOnce; if
   *      != -1 (done sentinel), fall through to step 3; else stage the
   *      std::__call_once tuple and call it. Regardless, @0x20aa48 loads
   *      `OZChannelAffectedNodes_Factory::_instance` into %rsi.
   *   3. Base-ctor arg staging @0x20aa4f-6c:
   *        stack[+0x8] = 0x10(%rbp) (caller's stack info arg, i.e. 7th SysV),
   *        stack[+0]   = -0x48(%rbp) (saved impl),
   *        rdx = r14 (name), rcx = r13 (folder), r8d = r12d (uint1),
   *        r9d = r15d (uint2), rdi = rbx (this).
   *      @0x20aa6f `callq OZChannel::OZChannel` with those args.
   *   4. Vptr installs @0x20aa74-89:
   *        %rax = 0x63ba4d(%rip)  ->  next=0x20aa7b + 0x63ba4d = 0x8464c8
   *                                    (primary vptr).
   *        *(this+0)    = %rax.
   *        %rax = 0x63bda3(%rip)  ->  next=0x20aa85 + 0x63bda3 = 0x846828
   *                                    (secondary vptr).
   *        *(this+0x10) = %rax.
   *   5. Info once-init @0x20aa89-b8 (`_OZChannelAffectedNodesInfo_once`).
   *   6. Info-slot fixup @0x20aabd-f6.  @0x20aabd tests `cmpq $0, 0x10(%rbp)`
   *      (the STACK info arg):
   *        if (info != nullptr):  this->+0x80 = this->+0x88   @0x20aac4-cb
   *        else:                   this->+0x88 = this->+0x80 = _OZChannelAffectedNodesInfo
   *                                                             @0x20aae1-ef
   *   7. Impl once-init @0x20aad2-b25 (`_OZChannelAffectedNodesImpl_once`).
   *   8. Impl-slot fixup @0x20ab2a-42.  @0x20ab2a tests `cmpq $0, -0x48(%rbp)`
   *      (the SAVED r9, i.e. impl arg):
   *        if (impl != nullptr):  rax = this->+0x78   @0x20ab31
   *        else:                   rax = _OZChannelAffectedNodesImpl
   *                                this->+0x78 = rax   @0x20ab37-3e
   *        this->+0x70 = rax   @0x20ab42   (unconditional).
   *   9. Frame teardown + retq @0x20ab46-54.
   *   Exception path @0x20ab55-63: `OZChannel::~OZChannel()` + `__Unwind_Resume`.
   */
  static newWithFolder(
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelAffectedNodes {
    const self = new OZChannelAffectedNodes();

    // Step 2 — @0x20aa14-48: fetch the once-guarded Factory singleton.
    const factory = OZChannelAffectedNodes_Factory_getInstance();

    // Step 3 — @0x20aa6f.
    OZChannel_base_ctor(self, factory, name, folder, uint1, uint2, impl, info);
    // Step 4 — vptrs implicit @0x20aa74-89.

    // Step 6 — @0x20aabd tests the STACK info arg.
    if (info !== null) {
      self.info = info;                                     // @0x20aac4-cb
    } else {
      self.info = createOZChannelAffectedNodesInfo_default(); // @0x20aae1-ef
    }

    // Step 8 — @0x20ab2a tests -0x48(%rbp) (saved impl arg).
    if (impl !== null) {
      self.impl = impl;                                     // @0x20ab31
    } else {
      self.impl = createOZChannelAffectedNodesImpl_default(); // @0x20ab37-3e
    }

    return self;
  }

  /**
   * `OZChannelAffectedNodes::~OZChannelAffectedNodes()` @Ozone 0x2093f0 [D1].
   *
   * DISASM:
   *   0x2093f0 pushq %rbp
   *   0x2093f1 movq  %rsp, %rbp
   *   0x2093f4 popq  %rbp
   *   0x2093f5 jmp   __ZN9OZChannelD2Ev   ; tail-jmp OZChannel::~OZChannel()
   *
   * Trivial: does no work of its own (this class introduces no owned
   * heap-allocated per-instance state; all cleanup is inherited).
   *
   * The deleting-dtor form is at @Ozone 0x20a920 [D0]:
   *   0x20a920..0x20a926  frame setup + spill %rdi(this)->%rbx
   *   0x20a929 callq __ZN9OZChannelD2Ev   ; OZChannel::~OZChannel()
   *   0x20a92e movq  %rbx, %rdi
   *   0x20a931..0x20a936  frame teardown
   *   0x20a937 jmp   __ZdlPv               ; operator delete(this)
   *
   * We express both as a single TS `destructor()` method; the D0-specific
   * `operator delete(this)` tail-jmp has no distinct TS mirror (JS GC
   * reclaims the object once no live refs remain — the frontier stub
   * `operator_delete` above is cited for provenance).
   */
  destructor(): void {
    // @0x2093f5 (D1 tail-jmp) / @0x20a929 (D0 body-call) — OZChannel base dtor.
    OZChannel_dtor(this);

    // @0x20a937 (D0 only) — operator delete(this). No TS mirror; cited above.
  }

  /**
   * `OZChannelAffectedNodes::clone() const` @Ozone 0x20a940 (vtable slot *0xf8).
   *
   * DISASM:
   *   0x20a940..0x20a947  frame setup + spill %rdi(this)->%r14
   *   0x20a94a movl  $0x98, %edi                     ; size = 152 bytes
   *   0x20a94f callq __Znwm                          ; operator new(0x98)
   *   0x20a954 movq  %rax, %rbx                      ; rbx = new instance
   *   0x20a957 movq  %rax, %rdi                      ; rdi = new instance
   *   0x20a95a movq  %r14, %rsi                      ; rsi = &(*this)
   *   0x20a95d xorl  %edx, %edx                      ; rdx = 0 (folder=null)
   *   0x20a95f callq __ZN9OZChannelC2ERKS_P15OZChannelFolder ; OZChannel copy ctor
   *   0x20a964 leaq  0x63bb5d(%rip), %rax            ; rax = 0x8464c8 (primary vptr)
   *   0x20a96b movq  %rax, (%rbx)
   *   0x20a96e leaq  0x63beb3(%rip), %rax            ; rax = 0x846828 (secondary vptr)
   *   0x20a975 movq  %rax, 0x10(%rbx)
   *   0x20a979 movq  %rbx, %rax                      ; return new instance
   *   0x20a97c..0x20a980  frame teardown + retq
   *   Exception path @0x20a981-8f: operator delete + __Unwind_Resume.
   *
   * The copy is a SHALLOW OZChannel-level copy (the OZChannel copy ctor
   * handles the memberwise duplication of the base subobject); this
   * class's own +0x70/+0x78/+0x80/+0x88 slots ARE covered by that copy
   * ctor because they live within the OZChannel base subobject.  The
   * only per-derived-class work here is re-installing the two vptrs.
   */
  clone(): OZChannelAffectedNodes {
    // @0x20a94f — 0x98-byte allocation.
    const copy = operator_new(0x98) as OZChannelAffectedNodes;

    // @0x20a95f — OZChannel copy-ctor with folder = null.
    OZChannel_copy_ctor(copy, this, null);

    // @0x20a96b / @0x20a975 — vptr re-installs (implicit in JS: `copy`
    // is already a JS object whose prototype is
    // `OZChannelAffectedNodes.prototype`, matching the C++ vtable
    // identity).

    return copy;
  }

  /**
   * `OZChannelAffectedNodes::getObjCWrapperName()` @Ozone 0x2091d0
   * (vtable slot *0x58).
   *
   * DISASM:
   *   0x2091d0 pushq %rbp
   *   0x2091d1 movq  %rsp, %rbp
   *   0x2091d4 leaq  0x68e255(%rip), %rax   ; rax = &(CFString @Ozone 0x897430)
   *   0x2091db popq  %rbp
   *   0x2091dc retq
   *
   * Returns the __CFString at VA 0x897430 whose payload was recovered by
   * seeking into the __cstring section of the thin Mach-O:
   *   __cfstring section @0x88d430 (file offset 8967216, size 0x22a60)
   *     record @0x897430 = offset 0xa000 into section = file 9008176:
   *       isa   = 0x802000000000158b  (__CFConstantStringClassReference,
   *                                     chained-fixups–tagged)
   *       flags = 0x7c8                (kCFStringGraphicsBit-family; ASCII)
   *       cstr  = 0x7cf7cb             (chained-fixups tag masked;
   *                                     resolves to __cstring @0x7cf7cb)
   *       length = 9
   *   __cstring section @0x7c5e20 (file 8150560):
   *     offset 0x99ab (file 8189899) = "CHChannel\0" (nul-terminated, 9 chars).
   *
   * Direct binary read confirms the exact 9-byte payload "CHChannel".
   * We return it verbatim — the ObjC wrapper name for this class is the
   * NSString @"CHChannel".
   */
  getObjCWrapperName(): string {
    // @0x2091d4 — leaq to the __cfstring record at @0x897430, whose
    // payload is the 9-byte __cstring "CHChannel" (see decode in the
    // JSDoc above).
    return "CHChannel";
  }
}
