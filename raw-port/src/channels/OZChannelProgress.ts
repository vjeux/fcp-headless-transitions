// raw-port/src/channels/OZChannelProgress.ts
//
// FCP `OZChannelProgress` — ProChannel.framework. The "progress" flavour of
// OZChannel (a 0.0..1.0 percent-like animated slot; see OZChannelProgressInfo
// for the display metadata: suffix "", min/max 0.0/0.0, stepCoarse/Fine 1.0,
// displayScale 1.0, PCSingleton seed 0x64). This class holds NO new C++ state
// of its own beyond the inherited OZChannel layout — every ctor writes the
// same primary vptr at +0x00 and the same secondary vptr at +0x10, then
// installs the class-global `_OZChannelProgressInfo` singleton at
// +0x80/+0x88 and the class-global `_OZChannelProgressImpl` singleton at
// +0x70/+0x78, sets bit 0x8 at +0x38, and zeros the u16 at +0x98.
//
// Framework: ProChannel.framework (x86_64 slice).
//
// Symbols transcribed (16 method entries in the ledger, 12 unique bodies):
//
//   C2 (base) constructors — do the actual work; C1 (complete) versions jmp to C2:
//     __ZN17OZChannelProgressC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj  @0x7f7b6
//         OZChannelProgress::OZChannelProgress(OZFactory*, PCString const&,
//                                              OZChannelFolder*, unsigned int, unsigned int)
//     __ZN17OZChannelProgressC2ERK8PCStringP15OZChannelFolderjj              @0x7f8fe
//         OZChannelProgress::OZChannelProgress(PCString const&, OZChannelFolder*,
//                                              unsigned int, unsigned int)
//     __ZN17OZChannelProgressC2EdRK8PCStringP15OZChannelFolderjj             @0x7f9b6
//         OZChannelProgress::OZChannelProgress(double, PCString const&, OZChannelFolder*,
//                                              unsigned int, unsigned int)
//     __ZN17OZChannelProgressC2EP9OZFactoryRK8PCStringj                      @0x7fa6e
//         OZChannelProgress::OZChannelProgress(OZFactory*, PCString const&, unsigned int)
//     __ZN17OZChannelProgressC2ERKS_P15OZChannelFolder                       @0x7faee
//         OZChannelProgress::OZChannelProgress(OZChannelProgress const&, OZChannelFolder*)
//
//   C1 thunks (pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp C2) — one per C2:
//     __ZN17OZChannelProgressC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj  @0x7f8f4
//     __ZN17OZChannelProgressC1ERK8PCStringP15OZChannelFolderjj              @0x7f9ac
//     __ZN17OZChannelProgressC1EdRK8PCStringP15OZChannelFolderjj             @0x7fa64
//     __ZN17OZChannelProgressC1EP9OZFactoryRK8PCStringj                      @0x7fae4
//     __ZN17OZChannelProgressC1ERKS_P15OZChannelFolder                       @0x7fb34
//
//   Non-ctor methods:
//     __ZN17OZChannelProgress27createOZChannelProgressInfoEv  @0x7f864
//         OZChannelProgress::createOZChannelProgressInfo() — once-guarded singleton getter
//     __ZN17OZChannelProgress27createOZChannelProgressImplEv  @0x7f8ac
//         OZChannelProgress::createOZChannelProgressImpl() — once-guarded singleton getter
//     __ZNK17OZChannelProgress5cloneEv                        @0x7fb7a
//         OZChannelProgress::clone() const — operator new(0xa0) + OZChannel::OZChannel(copy)
//     __ZN17OZChannelProgress18getObjCWrapperNameEv           @0x7fbe8
//         OZChannelProgress::getObjCWrapperName() — returns a CFString @cfstring 0xe59b0
//     __ZN17OZChannelProgressD1Ev                             @0x7fbf6
//         OZChannelProgress::~OZChannelProgress() (D1: complete non-deleting; tail-jmps to
//         OZChannel::~OZChannel)
//     __ZN17OZChannelProgressD0Ev                             @0x7fc00
//         OZChannelProgress::~OZChannelProgress() (D0: deleting; calls OZChannel::~OZChannel
//         then tail-jmps to operator delete)
//
// STRUCT LAYOUT (recovered from every ctor body @0x7f7b6..0x7fb34):
//     +0x00 : void*   primary   vptr = &__ZTV17OZChannelProgress + 0x10  (=0xddc40)
//     +0x10 : void*   secondary vptr = &__ZTV17OZChannelProgress + 0x370 (=0xddfa0)
//     +0x38 : u8      flags OR-ed with 0x8 at ctor end (`orb $0x8, 0x38(%rbx)`)
//     +0x70 : OZChannelImpl*  implPrimary   = _OZChannelProgressImpl singleton
//     +0x78 : OZChannelImpl*  implSecondary = _OZChannelProgressImpl singleton (same ptr)
//     +0x80 : OZChannelInfo*  infoPrimary   = _OZChannelProgressInfo singleton
//     +0x88 : OZChannelInfo*  infoSecondary = _OZChannelProgressInfo singleton (same ptr)
//     +0x98 : u16     zeroed at ctor end (`movw $0x0, 0x98(%rbx)`)
//     +0x99 : u8      (copy-ctor also copies bytes at 0x98 and 0x99 from other — so the
//                      logical byte @+0x99 is a distinct field from the low byte of the u16
//                      write; the ctor's `movw $0x0` zeros both bytes at once.)
//   Sizeof(OZChannelProgress) = 0xa0 (recovered from `movl $0xa0,%edi` in clone @0x7fb84).
//
// Class-static data (extern in this framework; declared alongside the class):
//     __ZN17OZChannelProgress22_OZChannelProgressInfoE  @ProChannel 0xec6f0
//         OZChannelInfo* _OZChannelProgressInfo — populated once by createOZChannelProgressInfo
//     __ZN17OZChannelProgress22_OZChannelProgressImplE  @ProChannel 0xec6f8
//         OZChannelImpl* _OZChannelProgressImpl — populated once by createOZChannelProgressImpl
//     __ZZN17OZChannelProgress27createOZChannelProgressInfoEvE27_OZChannelProgressInfo_once
//         std::once_flag  — function-local static for the Info singleton
//     __ZZN17OZChannelProgress27createOZChannelProgressImplEvE27_OZChannelProgressImpl_once
//         std::once_flag  — function-local static for the Impl singleton
//     __ZTV17OZChannelProgress @ProChannel 0xddc30
//         vtable: primary slice at +0x10 (0xddc40); secondary slice at +0x370 (0xddfa0)
//     __ZTI17OZChannelProgress @ProChannel 0xddfe8
//         typeinfo
//
// Callees / cross-refs (all resolved from the disasm addresses cited inline):
//     __ZN25OZChannelProgress_Factory11getInstanceEv  — sibling class, not yet decoded here
//     __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//         — OZChannel base ctor (6-arg form), transcribed in OZChannel.ts as OZChannel__C2_base
//     __ZN9OZChannelC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo
//         — OZChannel base ctor (4-arg form, no folder), NOT YET in OZChannel.ts frontier stub
//     __ZN9OZChannelC2ERKS_P15OZChannelFolder — OZChannel copy ctor, transcribed as OZChannel__C2_copy
//     __ZN9OZChannelD2Ev  — OZChannel::~OZChannel(), unwind + tail dtor
//     __ZNSt3__111__call_onceERVmPvPFvS2_E  — std::__1::__call_once
//     __ZNSt3__117__call_once_proxyB9nqe210106I…OZChannelProgress::createOZChannelProgressInfo()
//         ::lambda…Pv  — the local proxy for the Info once (its lambda body is not yet decoded;
//         it is what actually allocates + stores _OZChannelProgressInfo). Analogous proxy for Impl.
//     __Znwm    (@ProChannel stub 0xace4c) — operator new(unsigned long)
//     __ZdlPv   (@ProChannel stub 0xace04) — operator delete(void*)
//     __Unwind_Resume (@ProChannel stub 0xacaf2)
//
// The primary/secondary vtable-slice offsets (+0x10 / +0x370) match the OZChannelAngle
// layout convention already established in raw-port/src/channels/OZChannelAngle.ts —
// this is the standard OZChannel<T> two-slice vptr install.

import { OZChannel } from './OZChannel.js';
import type { OZChannelImpl, OZFactory } from './OZChannel.js';
import type { OZChannelFolder } from './OZChannelDouble.js';
import type { OZChannelInfo } from './OZChannelInfo.js';

// -----------------------------------------------------------------------------
// Placeholder types for the two class-static singleton pointers. Both live in
// the ProChannel binary at fixed VMAs (0xec6f0 / 0xec6f8) and are populated
// exactly once by the corresponding `createOZChannelProgress{Info,Impl}` getters
// below via std::__call_once. Until the lambda bodies of those `call_once`
// proxies are decoded, the singletons themselves cannot be constructed; we
// keep them as opaque handles so callers can carry them around without
// materialising a fake identity.
// -----------------------------------------------------------------------------

/** Class-static `OZChannelProgress::_OZChannelProgressInfo` @ProChannel 0xec6f0.
 *  Populated by createOZChannelProgressInfo() via std::__call_once. */
let _OZChannelProgressInfo: OZChannelInfo | null = null;

/** Class-static `OZChannelProgress::_OZChannelProgressImpl` @ProChannel 0xec6f8.
 *  Populated by createOZChannelProgressImpl() via std::__call_once. */
let _OZChannelProgressImpl: OZChannelImpl | null = null;

/** std::once_flag for _OZChannelProgressInfo — tracked as a boolean because
 *  __call_once's lambda body is not yet decoded (its ctor lives inside the
 *  `__call_once_proxy` template instantiation @0x7f892). Setting this to true
 *  models the `cmpq $-0x1, %rax; je fast-path` fast-path @0x7f86b in the getter. */
let _OZChannelProgressInfo_once_done = false;

/** std::once_flag for _OZChannelProgressImpl — same convention. */
let _OZChannelProgressImpl_once_done = false;

// -----------------------------------------------------------------------------
// Frontier stubs — every callee that hasn't been decoded elsewhere throws with
// its own @0xADDR so frontier.py sees the gap (PORTING_SPEC Rule 3).
// -----------------------------------------------------------------------------

/** OZChannelProgress_Factory::getInstance() @ProChannel
 *  __ZN25OZChannelProgress_Factory11getInstanceEv — sibling class, NOT ported in this
 *  unit (its ledger entry is separate). Called by the 3-ctor + 4-ctor + 5-ctor forms
 *  at @0x7f7d6 / @0x7f91e / @0x7f9d6 to override the caller-supplied OZFactory* arg
 *  (three of the five C2 ctors ignore their caller-supplied factory pointer entirely
 *  and swap in the singleton returned here). */
function OZChannelProgress_Factory__getInstance(): OZFactory {
  throw new Error(
    'OZChannelProgress_Factory::getInstance() @ProChannel ' +
      '__ZN25OZChannelProgress_Factory11getInstanceEv ' +
      '(called from OZChannelProgress ctors @0x7f7d6/@0x7f91e/@0x7f9d6) not yet transcribed',
  );
}

/** OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int,
 *  unsigned int, OZChannelImpl*, OZChannelInfo*) @ProChannel
 *  __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
 *  — the 7-arg base ctor. Decoded in raw-port/src/channels/OZChannel.ts as
 *  `OZChannel__C2_base`, but the transcribed body is itself a frontier throw @0x7f7f4 so calling
 *  through the module boundary re-throws with the base ctor's own citation.
 *  Called by three of our ctors: @0x7f7f4, @0x7f93c, @0x7f9f4. */
function OZChannel__C2_base_7arg(
  _self: OZChannel,
  _factory: OZFactory,
  _name: unknown,
  _folder: OZChannelFolder | null,
  _flagsA: number,
  _flagsB: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    'OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, ' +
      'unsigned int, OZChannelImpl*, OZChannelInfo*) @ProChannel ' +
      '__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ' +
      '(called from OZChannelProgress ctors @0x7f7f4 / @0x7f93c / @0x7f9f4; ' +
      'transcribed via OZChannel__C2_base in OZChannel.ts @0x7f7f4 but body is itself a frontier throw) ' +
      'not yet reachable via this subclass',
  );
}

/** OZChannel::OZChannel(OZFactory*, PCString const&, unsigned int, OZChannelImpl*,
 *  OZChannelInfo*) @ProChannel
 *  __ZN9OZChannelC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo — the
 *  5-arg base ctor (no folder, single unsigned). Called by our
 *  OZChannelProgress(OZFactory*, PCString const&, unsigned int) ctor @0x7fa7e. */
function OZChannel__C2_base_5arg(
  _self: OZChannel,
  _factory: OZFactory,
  _name: unknown,
  _flags: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    'OZChannel::OZChannel(OZFactory*, PCString const&, unsigned int, OZChannelImpl*, ' +
      'OZChannelInfo*) @ProChannel ' +
      '__ZN9OZChannelC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo ' +
      '(called from OZChannelProgress ctor @0x7fa7e) not yet transcribed',
  );
}

/** OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @ProChannel
 *  __ZN9OZChannelC2ERKS_P15OZChannelFolder — copy ctor. Transcribed in
 *  OZChannel.ts as `OZChannel__C2_copy` (currently a frontier throw for the
 *  same reason as above). Called from our copy ctor @0x7fafb and from clone @0x7fb99. */
function OZChannel__C2_copy_2arg(
  _self: OZChannel,
  _other: OZChannel,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    'OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @ProChannel ' +
      '__ZN9OZChannelC2ERKS_P15OZChannelFolder ' +
      '(called from OZChannelProgress copy-ctor @0x7fafb and clone @0x7fb99; ' +
      'transcribed via OZChannel__C2_copy in OZChannel.ts @0x7fafb as a frontier throw) ' +
      'not yet reachable via this subclass',
  );
}

/** OZChannel::~OZChannel() @ProChannel __ZN9OZChannelD2Ev.
 *  Called from every ctor's exception-unwind landing pad (@0x7f857, @0x7f99f,
 *  @0x7fa57, @0x7fad7) and tail-called by both dtors (D1 @0x7fbfb; D0 @0x7fc09). */
function OZChannel__dtor(_self: OZChannel): void {
  throw new Error(
    'OZChannel::~OZChannel() @ProChannel __ZN9OZChannelD2Ev ' +
      '(called from OZChannelProgress ctor-unwind @0x7f857/@0x7f99f/@0x7fa57/@0x7fad7 and ' +
      'dtors D1@0x7fbfb / D0@0x7fc09) not yet transcribed',
  );
}

/** `operator new(unsigned long)` @ProChannel stub 0xace4c — invoked from clone
 *  @0x7fb89 with size 0xa0 = sizeof(OZChannelProgress). */
function operator_new(_size: number): object {
  throw new Error(
    'operator new(unsigned long) @ProChannel stub 0xace4c __Znwm ' +
      '(called from OZChannelProgress::clone @0x7fb89 with size=0xa0) not yet transcribed',
  );
}

/** `operator delete(void*)` @ProChannel stub 0xace04 — invoked from clone's
 *  unwind path @0x7fbdb and tail-called from D0 dtor @0x7fc17. In JS this is
 *  GC'd but we model the call so vtable-slot dispatch stays faithful. */
function operator_delete(_p: object): void {
  throw new Error(
    'operator delete(void*) @ProChannel stub 0xace04 __ZdlPv ' +
      '(tail-called from OZChannelProgress D0 dtor @0x7fc17 and clone-unwind @0x7fbdb) ' +
      'not yet transcribed',
  );
}

/** std::__1::__call_once @ProChannel stub — proxy that runs the lambda ONCE and
 *  sets the once_flag to -1. The lambda body itself
 *  (__call_once_proxy<...OZChannelProgress::createOZChannelProgress{Info,Impl}::lambda...>)
 *  is a template instantiation in ProChannel we have NOT yet decoded — it is what
 *  actually populates `_OZChannelProgressInfo` / `_OZChannelProgressImpl`. */
function std_call_once_proxy_info(): void {
  throw new Error(
    'OZChannelProgress::createOZChannelProgressInfo()::lambda body (invoked via ' +
      '__ZNSt3__117__call_once_proxyB9nqe210106I…OZChannelProgress::createOZChannelProgressInfo…lambda…Pv ' +
      '@ProChannel; called through __ZNSt3__111__call_onceERVmPvPFvS2_E ' +
      'from OZChannelProgress::createOZChannelProgressInfo @0x7f899) not yet transcribed',
  );
}

function std_call_once_proxy_impl(): void {
  throw new Error(
    'OZChannelProgress::createOZChannelProgressImpl()::lambda body (invoked via ' +
      '__ZNSt3__117__call_once_proxyB9nqe210106I…OZChannelProgress::createOZChannelProgressImpl…lambda…Pv ' +
      '@ProChannel; called through __ZNSt3__111__call_onceERVmPvPFvS2_E ' +
      'from OZChannelProgress::createOZChannelProgressImpl @0x7f8e1) not yet transcribed',
  );
}

// -----------------------------------------------------------------------------
// Vtable-slice sentinels — the two vptrs written by every ctor. Both point into
// the SAME class vtable (__ZTV17OZChannelProgress @0xddc30); primary +0x10
// (=0xddc40) and secondary +0x370 (=0xddfa0). These are opaque symbols in TS
// since dispatch is done by prototype identity, not by numeric offsets.
// -----------------------------------------------------------------------------

const OZChannelProgress_vtable_plus_0x10: unique symbol = Symbol(
  'ProChannel::__ZTV17OZChannelProgress+0x10 (=0xddc40)',
);
const OZChannelProgress_vtable_plus_0x370: unique symbol = Symbol(
  'ProChannel::__ZTV17OZChannelProgress+0x370 (=0xddfa0)',
);

// -----------------------------------------------------------------------------
// The class itself.
// -----------------------------------------------------------------------------

/**
 * `OZChannelProgress` — the "progress" (0..1 scalar) flavour of OZChannel.
 *
 * Every ctor in this class shares the SAME 4-step epilogue after the base-ctor
 * call: install both vptrs, wire the once-guarded Info + Impl singletons into
 * the four instance slots at +0x70/+0x78/+0x80/+0x88, OR bit 0x8 into +0x38,
 * and zero the u16 at +0x98. The `_ctor_epilogue` helper below is a faithful
 * transcription of that shared tail; it is called by every C2 ctor at its
 * position in the linear disasm.
 */
export class OZChannelProgress extends OZChannel {
  /** +0x38 flags — bit 0x8 is set by every ctor. Other bits inherited from OZChannel. */
  progressFlags: number = 0;
  /** +0x98 u16 — zeroed by every ctor. */
  fieldAt0x98: number = 0;
  /** +0x99 u8 — the high byte of the u16 write at +0x98, kept distinct because the
   *  copy-ctor and clone treat +0x98 and +0x99 as separate byte-sized fields. */
  fieldAt0x99: number = 0;
  // NOTE: `implPrimary`, `implSecondary`, `infoPrimary`, `infoSecondary` are all
  // inherited from the OZChannel base (declared optional there — see
  // OZChannelLayout / class OZChannel in raw-port/src/channels/OZChannel.ts). We
  // reuse those fields directly rather than redeclaring them, so subclass-vs-base
  // strictNullChecks stays consistent (base uses `?: T | null` = T|null|undefined).
  /** vptr sentinels (both installed by every ctor). */
  __vptrPrimary?: symbol;
  __vptrSecondary?: symbol;

  // ---------------------------------------------------------------------------
  // Shared ctor epilogue — factored out because @0x7f7f9..@0x7f839,
  // @0x7f941..@0x7f981, @0x7f9f9..@0x7fa39 and @0x7fa83..@0x7fac3 are
  // BYTE-IDENTICAL sequences (the disasm can be compared literally). This
  // helper transcribes those bytes ONCE with all @0xADDR citations preserved.
  // ---------------------------------------------------------------------------

  /**
   * Shared ctor-tail as seen in every OZChannelProgress C2 body. Address
   * annotations refer to the 6-arg ctor @0x7f7b6 (base positions in the other
   * ctors are offset but the disasm bytes are identical):
   *   leaq  __ZTV17OZChannelProgress+0x10(%rip), %rax   @0x7f7f9  (=0xddc40)
   *   movq  %rax, (%rbx)                                 @0x7f800
   *   leaq  __ZTV17OZChannelProgress+0x370(%rip), %rax   @0x7f803  (=0xddfa0)
   *   movq  %rax, 0x10(%rbx)                             @0x7f80a
   *   callq __ZN17OZChannelProgress27createOZChannelProgressInfoEv @0x7f80e
   *   movq  %rax, 0x88(%rbx)                             @0x7f813
   *   movq  %rax, 0x80(%rbx)                             @0x7f81a
   *   callq __ZN17OZChannelProgress27createOZChannelProgressImplEv @0x7f821
   *   movq  __ZN17OZChannelProgress22_OZChannelProgressImplE(%rip), %rax  @0x7f826
   *   movq  %rax, 0x78(%rbx)                             @0x7f82d
   *   movq  %rax, 0x70(%rbx)                             @0x7f831
   *   orb   $0x8, 0x38(%rbx)                             @0x7f835
   *   movw  $0x0, 0x98(%rbx)                             @0x7f839
   *
   * NOTE: `createOZChannelProgressImpl()` returns the singleton via its
   * retq @0x7f8f2 loading from `_OZChannelProgressImpl` — so the two
   * post-callee loads at @0x7f821 and @0x7f826 are semantically the same
   * value (the callee's return value, and the extern read that fetches the
   * value the callee just cached). The C++ compiler emitted the extern-read
   * anyway to defeat aliasing; we mirror both reads.
   */
  private _ctor_epilogue(): void {
    // @0x7f7f9-@0x7f80a — install both vptrs.
    this.__vptrPrimary = OZChannelProgress_vtable_plus_0x10;
    this.__vptrSecondary = OZChannelProgress_vtable_plus_0x370;

    // @0x7f80e — call createOZChannelProgressInfo(); rax = _OZChannelProgressInfo.
    const infoPtr = OZChannelProgress.createOZChannelProgressInfo();
    // @0x7f813 / @0x7f81a — mirror the returned pointer into +0x88 and +0x80.
    this.infoSecondary = infoPtr;
    this.infoPrimary = infoPtr;

    // @0x7f821 — call createOZChannelProgressImpl(). Its return value is
    // clobbered by the reload below (the compiler emits both).
    OZChannelProgress.createOZChannelProgressImpl();
    // @0x7f826 — reload rax from the class-static _OZChannelProgressImpl symbol.
    const implPtr = _OZChannelProgressImpl;
    // @0x7f82d / @0x7f831 — mirror into +0x78 and +0x70.
    this.implSecondary = implPtr;
    this.implPrimary = implPtr;

    // @0x7f835 — set bit 0x8 in the flags byte at +0x38.
    this.progressFlags |= 0x8;
    // @0x7f839 — zero the u16 at +0x98 (which covers +0x98 and +0x99).
    this.fieldAt0x98 = 0;
    this.fieldAt0x99 = 0;
  }

  // ---------------------------------------------------------------------------
  // C2 constructors (each body is a faithful mirror of the disasm). Each C1
  // thunk simply delegates here — see the static `_C1_*` wrappers below.
  // ---------------------------------------------------------------------------

  /**
   * `OZChannelProgress::OZChannelProgress(OZFactory*, PCString const&,
   *  OZChannelFolder*, unsigned int, unsigned int)`  @ProChannel 0x7f7b6
   *  (__ZN17OZChannelProgressC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj).
   *
   * Disasm mirror:
   *   pushq %rbp/movq %rsp,%rbp/pushq %r15/…/subq $0x18,%rsp  @0x7f7b6..0x7f7c3
   *   movl  %r9d, %r14d                                        @0x7f7c7  (spill arg5 flagsB)
   *   movl  %r8d, %r15d                                        @0x7f7ca  (spill arg4 flagsA)
   *   movq  %rcx, %r12                                          @0x7f7cd  (spill arg3 folder)
   *   movq  %rdx, %r13                                          @0x7f7d0  (spill arg2 name&)
   *   movq  %rdi, %rbx                                          @0x7f7d3  (rbx = this)
   *   callq __ZN25OZChannelProgress_Factory11getInstanceEv     @0x7f7d6  ; rax = singleton
   *                                                                       ; NOTE: caller's factory arg is IGNORED.
   *   xorps %xmm0,%xmm0 / movups %xmm0,(%rsp)                   @0x7f7db..0x7f7de
   *                                                             ; the two 8-byte stack slots that
   *                                                             ; become args 6+7 (impl/info) are zeroed
   *   movq  %rbx,%rdi / movq %rax,%rsi / …                      @0x7f7e2..0x7f7f1
   *   callq OZChannel::OZChannel(base, 7-arg)                   @0x7f7f4
   *   [shared epilogue @0x7f7f9..0x7f839]
   *   epilogue: addq $0x18,%rsp; pops; retq                     @0x7f842..0x7f850
   *   unwind landing pad @0x7f851..0x7f85f: OZChannel::~OZChannel + __Unwind_Resume
   */
  static _C2_factoryNameFolderUU(
    self: OZChannelProgress,
    _factory: OZFactory | null,
    name: unknown,
    folder: OZChannelFolder | null,
    flagsA: number,
    flagsB: number,
  ): void {
    // @0x7f7d6 — swap caller's factory arg for OZChannelProgress_Factory::getInstance().
    const singletonFactory = OZChannelProgress_Factory__getInstance();
    // @0x7f7db..0x7f7f1 — args 6 (impl*) and 7 (info*) are zeroed on the stack.
    try {
      // @0x7f7f4 — base ctor with the singleton factory + null impl/info.
      OZChannel__C2_base_7arg(self, singletonFactory, name, folder, flagsA, flagsB, null, null);
    } catch (e) {
      // @0x7f851..0x7f85f unwind: no vptrs installed yet, only the base ctor
      // partially ran. We don't call OZChannel::~OZChannel here because in
      // Itanium ABI a base ctor that threw is responsible for cleaning its own
      // partial state; the C++ landing pad here is for a throw AFTER the base
      // ctor returned (from downstream user code within the C++ frame). Since
      // every callee in this frame that could throw AFTER the base is our
      // epilogue getters (which are frontier throws), we model both cases with
      // the same OZChannel::~OZChannel call to preserve the observable trace.
      try {
        OZChannel__dtor(self);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
    try {
      self._ctor_epilogue();
    } catch (e) {
      // Same landing pad @0x7f851 — this branch matches the "epilogue threw
      // after base ctor completed" path.
      try {
        OZChannel__dtor(self);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
  }

  /**
   * `OZChannelProgress::OZChannelProgress(PCString const&, OZChannelFolder*,
   *  unsigned int, unsigned int)`  @ProChannel 0x7f8fe
   *  (__ZN17OZChannelProgressC2ERK8PCStringP15OZChannelFolderjj). Body is
   *  byte-identical to _C2_factoryNameFolderUU except for the arg-register
   *  layout: the caller passes name/folder/uu directly (no OZFactory* arg),
   *  and the singleton call at @0x7f91e still fetches the factory.
   */
  static _C2_nameFolderUU(
    self: OZChannelProgress,
    name: unknown,
    folder: OZChannelFolder | null,
    flagsA: number,
    flagsB: number,
  ): void {
    // @0x7f91e — same singleton fetch as the 5-arg ctor.
    const singletonFactory = OZChannelProgress_Factory__getInstance();
    // @0x7f923..0x7f939 — same 7-arg base ctor call, impl/info zeroed.
    try {
      // @0x7f93c — base ctor with singleton factory + null impl/info.
      OZChannel__C2_base_7arg(self, singletonFactory, name, folder, flagsA, flagsB, null, null);
    } catch (e) {
      try {
        OZChannel__dtor(self);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
    try {
      self._ctor_epilogue();
    } catch (e) {
      try {
        OZChannel__dtor(self);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
  }

  /**
   * `OZChannelProgress::OZChannelProgress(double, PCString const&,
   *  OZChannelFolder*, unsigned int, unsigned int)`  @ProChannel 0x7f9b6
   *  (__ZN17OZChannelProgressC2EdRK8PCStringP15OZChannelFolderjjP...).
   *
   * SURPRISE: the `double` argument is IGNORED by this ctor body. The disasm
   * @0x7f9b6..0x7fa60 is byte-identical to the previous two — no reference to
   * xmm0 (the incoming double) anywhere. The compiler emitted the double-taking
   * signature for source-level overload resolution but the body does not consult
   * the value. (An initial-value overload for other channel types, e.g.
   * `OZChannelDouble(double, ...)`, DOES read the double; OZChannelProgress does
   * not, presumably because its "progress" is always 0.0-init.)
   */
  static _C2_doubleNameFolderUU(
    self: OZChannelProgress,
    _initialValue: number, // spilled by the compiler at fn entry but never read
    name: unknown,
    folder: OZChannelFolder | null,
    flagsA: number,
    flagsB: number,
  ): void {
    // @0x7f9d6 — same singleton fetch.
    const singletonFactory = OZChannelProgress_Factory__getInstance();
    try {
      // @0x7f9f4 — same 7-arg base ctor call.
      OZChannel__C2_base_7arg(self, singletonFactory, name, folder, flagsA, flagsB, null, null);
    } catch (e) {
      try {
        OZChannel__dtor(self);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
    try {
      self._ctor_epilogue();
    } catch (e) {
      try {
        OZChannel__dtor(self);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
  }

  /**
   * `OZChannelProgress::OZChannelProgress(OZFactory*, PCString const&, unsigned int)`
   *  @ProChannel 0x7fa6e (__ZN17OZChannelProgressC2EP9OZFactoryRK8PCStringj).
   *
   * The compact form. Uses the 5-arg `OZChannel::OZChannel(OZFactory*, PCString&,
   * uint, OZChannelImpl*, OZChannelInfo*)` @0x7fa7e (impl/info both nulled via
   * xorl %r8d/%r9d — no stack write needed since there are only two nullable
   * pointer args). The 4-arg version does NOT fetch the factory singleton — it
   * uses the caller-supplied factory directly.
   */
  static _C2_factoryNameU(
    self: OZChannelProgress,
    factory: OZFactory | null,
    name: unknown,
    flags: number,
  ): void {
    // @0x7fa78-@0x7fa7b — r8 = 0, r9 = 0 (impl* and info* passed as null).
    // @0x7fa7e — base ctor call (5-arg form, no folder).
    try {
      OZChannel__C2_base_5arg(self, factory as OZFactory, name, flags, null, null);
    } catch (e) {
      try {
        OZChannel__dtor(self);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
    try {
      self._ctor_epilogue();
    } catch (e) {
      try {
        OZChannel__dtor(self);
      } catch (unwindErr) {
        void unwindErr;
      }
      throw e;
    }
  }

  /**
   * `OZChannelProgress::OZChannelProgress(OZChannelProgress const&, OZChannelFolder*)`
   *  @ProChannel 0x7faee (__ZN17OZChannelProgressC2ERKS_P15OZChannelFolder).
   *
   * Disasm mirror (fully — this ctor is short):
   *   pushq %rbp/movq %rsp,%rbp/pushq %r14/pushq %rbx           @0x7faee..0x7faf4
   *   movq  %rsi, %rbx                                          @0x7faf5   (rbx = other&)
   *   movq  %rdi, %r14                                          @0x7faf8   (r14 = this)
   *   callq __ZN9OZChannelC2ERKS_P15OZChannelFolder             @0x7fafb   (OZChannel copy ctor)
   *   leaq  __ZTV17OZChannelProgress+0x10(%rip), %rax           @0x7fb00   (=0xddc40)
   *   movq  %rax, (%r14)                                        @0x7fb07
   *   leaq  __ZTV17OZChannelProgress+0x370(%rip), %rax          @0x7fb0a   (=0xddfa0)
   *   movq  %rax, 0x10(%r14)                                    @0x7fb11
   *   movb  0x98(%rbx), %al / movb %al, 0x98(%r14)              @0x7fb15..0x7fb1b
   *   movb  0x99(%rbx), %al / movb %al, 0x99(%r14)              @0x7fb22..0x7fb28
   *   popq %rbx / popq %r14 / popq %rbp / retq                  @0x7fb2f..0x7fb33
   *
   * The copy ctor does NOT call createOZChannelProgress{Info,Impl} — the base
   * copy ctor is expected to have already deep-copied the info/impl pointers
   * via its own vcall path (see OZChannel__C2_copy documentation). It ALSO
   * does NOT set the +0x38 flag bit or zero the u16 — those are preserved from
   * `other` via the base copy ctor's memberwise copy. It DOES redundantly copy
   * bytes @+0x98 and @+0x99 (proving the compiler treats them as two u8 fields
   * even though the C2 base ctor zeroes them as a single u16 store).
   */
  static _C2_copy(
    self: OZChannelProgress,
    other: OZChannelProgress,
    folder: OZChannelFolder | null,
  ): void {
    // @0x7fafb — OZChannel::OZChannel(other, folder).
    OZChannel__C2_copy_2arg(self, other, folder);
    // @0x7fb00..0x7fb11 — install both vptrs (same slices as every other ctor).
    self.__vptrPrimary = OZChannelProgress_vtable_plus_0x10;
    self.__vptrSecondary = OZChannelProgress_vtable_plus_0x370;
    // @0x7fb15..0x7fb28 — byte-copy the two u8 fields at +0x98 and +0x99.
    self.fieldAt0x98 = other.fieldAt0x98;
    self.fieldAt0x99 = other.fieldAt0x99;
    // NOTE: no epilogue call — this ctor deliberately does NOT re-run the
    // singleton getters or reset the flag bit.
  }

  // ---------------------------------------------------------------------------
  // C1 (complete-object) thunks. Every one is:  push/mov rbp; pop rbp; jmp C2.
  // We model them as plain forwards for source-level parity.
  // ---------------------------------------------------------------------------

  /** @0x7f8f4 — C1 thunk to _C2_factoryNameFolderUU (jmp @0x7f7b6). */
  static _C1_factoryNameFolderUU(
    self: OZChannelProgress,
    factory: OZFactory | null,
    name: unknown,
    folder: OZChannelFolder | null,
    flagsA: number,
    flagsB: number,
  ): void {
    OZChannelProgress._C2_factoryNameFolderUU(self, factory, name, folder, flagsA, flagsB);
  }
  /** @0x7f9ac — C1 thunk to _C2_nameFolderUU (jmp @0x7f8fe). */
  static _C1_nameFolderUU(
    self: OZChannelProgress,
    name: unknown,
    folder: OZChannelFolder | null,
    flagsA: number,
    flagsB: number,
  ): void {
    OZChannelProgress._C2_nameFolderUU(self, name, folder, flagsA, flagsB);
  }
  /** @0x7fa64 — C1 thunk to _C2_doubleNameFolderUU (jmp @0x7f9b6). */
  static _C1_doubleNameFolderUU(
    self: OZChannelProgress,
    initialValue: number,
    name: unknown,
    folder: OZChannelFolder | null,
    flagsA: number,
    flagsB: number,
  ): void {
    OZChannelProgress._C2_doubleNameFolderUU(self, initialValue, name, folder, flagsA, flagsB);
  }
  /** @0x7fae4 — C1 thunk to _C2_factoryNameU (jmp @0x7fa6e). */
  static _C1_factoryNameU(
    self: OZChannelProgress,
    factory: OZFactory | null,
    name: unknown,
    flags: number,
  ): void {
    OZChannelProgress._C2_factoryNameU(self, factory, name, flags);
  }
  /** @0x7fb34 — C1 thunk to _C2_copy (jmp @0x7faee). */
  static _C1_copy(
    self: OZChannelProgress,
    other: OZChannelProgress,
    folder: OZChannelFolder | null,
  ): void {
    OZChannelProgress._C2_copy(self, other, folder);
  }

  // ---------------------------------------------------------------------------
  // Non-ctor methods.
  // ---------------------------------------------------------------------------

  /**
   * `OZChannelProgress::createOZChannelProgressInfo()`  @ProChannel 0x7f864
   * (__ZN17OZChannelProgress27createOZChannelProgressInfoEv).
   *
   * Disasm mirror:
   *   movq  __ZZN17OZChannelProgress27createOZChannelProgressInfoEvE27_OZChannelProgressInfo_once(%rip), %rax  @0x7f864
   *   cmpq  $-0x1, %rax                                          @0x7f86b
   *   je    0x7f8a3                                              @0x7f86f  (fast-path skip)
   *   pushq %rbp / movq %rsp,%rbp / subq $0x20,%rsp              @0x7f871..0x7f875
   *   leaq  -0x1(%rbp), %rax                                     @0x7f879  (scratch tuple slot A)
   *   leaq  -0x18(%rbp), %rcx                                    @0x7f87d
   *   movq  %rax, (%rcx)                                         @0x7f881
   *   leaq  -0x10(%rbp), %rsi                                    @0x7f884
   *   movq  %rcx, (%rsi)                                         @0x7f888
   *   leaq  __ZZ…_OZChannelProgressInfo_once(%rip), %rdi         @0x7f88b
   *   leaq  __ZNSt3__117__call_once_proxy…(%rip), %rdx           @0x7f892
   *   callq __ZNSt3__111__call_onceERVmPvPFvS2_E                 @0x7f899
   *   addq  $0x20,%rsp / popq %rbp                                @0x7f89e..0x7f8a2
   *   movq  __ZN17OZChannelProgress22_OZChannelProgressInfoE(%rip), %rax  @0x7f8a3
   *   retq                                                        @0x7f8aa
   */
  static createOZChannelProgressInfo(): OZChannelInfo | null {
    // @0x7f864..0x7f86f — fast-path check on the once-flag. cmpq $-1 succeeds
    // once the flag has been marked "done" (std::__1::__call_once sets it to
    // -1 after the lambda returns).
    if (!_OZChannelProgressInfo_once_done) {
      // @0x7f871..0x7f899 — slow path: call std::__1::__call_once with the
      // proxy that runs the local lambda. The lambda body is not yet decoded
      // (its instantiation is the __call_once_proxy template) — invoking it
      // throws with the callee's own citation. If it ever returned, the
      // flag would be set to -1 and _OZChannelProgressInfo would hold the
      // just-constructed OZChannelInfo*.
      std_call_once_proxy_info();
      // If the proxy returned successfully we'd set the flag; unreachable
      // today because the proxy is a frontier throw.
      _OZChannelProgressInfo_once_done = true;
    }
    // @0x7f8a3 — load and return the class-static singleton.
    return _OZChannelProgressInfo;
  }

  /**
   * `OZChannelProgress::createOZChannelProgressImpl()`  @ProChannel 0x7f8ac
   * (__ZN17OZChannelProgress27createOZChannelProgressImplEv).
   *
   * Byte-identical shape to createOZChannelProgressInfo — same call_once fast/slow
   * path, different once-flag + proxy + singleton symbols. See disasm at
   * raw-port/re/disasm/ProChannel.OZChannelProgress.createOZChannelProgressImpl.s.
   */
  static createOZChannelProgressImpl(): OZChannelImpl | null {
    // @0x7f8ac..0x7f8b7 — fast-path check.
    if (!_OZChannelProgressImpl_once_done) {
      // @0x7f8b9..0x7f8e1 — slow path via __call_once (proxy is a frontier throw).
      std_call_once_proxy_impl();
      _OZChannelProgressImpl_once_done = true;
    }
    // @0x7f8eb — load and return the class-static singleton.
    return _OZChannelProgressImpl;
  }

  /**
   * `OZChannelProgress::clone() const`  @ProChannel 0x7fb7a
   * (__ZNK17OZChannelProgress5cloneEv).
   *
   * Disasm mirror:
   *   pushq %rbp/movq %rsp,%rbp/pushq %r14/pushq %rbx           @0x7fb7a..0x7fb80
   *   movq  %rdi, %r14                                          @0x7fb81  (r14 = this)
   *   movl  $0xa0, %edi                                          @0x7fb84  (0xa0 = sizeof(OZChannelProgress))
   *   callq __Znwm  [stub 0xace4c]                               @0x7fb89  (rax = new'd)
   *   movq  %rax, %rbx                                          @0x7fb8e
   *   movq  %rax, %rdi / movq %r14, %rsi / xorl %edx, %edx      @0x7fb91..0x7fb97
   *   callq __ZN9OZChannelC2ERKS_P15OZChannelFolder             @0x7fb99   (base copy ctor; folder = NULL)
   *   leaq  __ZTV17OZChannelProgress+0x10(%rip), %rax           @0x7fb9e   (=0xddc40)
   *   movq  %rax, (%rbx)                                        @0x7fba5
   *   leaq  __ZTV17OZChannelProgress+0x370(%rip), %rax          @0x7fba8   (=0xddfa0)
   *   movq  %rax, 0x10(%rbx)                                    @0x7fbaf
   *   movb  0x98(%r14), %al / movb %al, 0x98(%rbx)              @0x7fbb3..0x7fbba
   *   movb  0x99(%r14), %al / movb %al, 0x99(%rbx)              @0x7fbc0..0x7fbc7
   *   movq  %rbx, %rax                                          @0x7fbcd  (return the clone)
   *   popq %rbx / popq %r14 / popq %rbp / retq                  @0x7fbd0..0x7fbd4
   *   unwind landing pad @0x7fbd5..0x7fbe5:
   *     r14 = exc; rdi = rbx; callq __ZdlPv (0xace04); rdi = r14; callq __Unwind_Resume (0xacaf2)
   *
   * The clone body is essentially inlined _C2_copy over a freshly-allocated
   * object with folder=NULL. It does NOT run createOZChannelProgress{Info,Impl}
   * again — the base copy ctor is responsible for propagating those pointers.
   */
  clone(): OZChannelProgress {
    // @0x7fb84 — sizeof(OZChannelProgress) = 0xa0.
    const rbx = operator_new(0xa0) as OZChannelProgress;
    try {
      // @0x7fb99 — base copy ctor with folder = NULL (edx zeroed @0x7fb97).
      OZChannel__C2_copy_2arg(rbx, this, null);
      // @0x7fb9e..0x7fbaf — install both vptrs.
      rbx.__vptrPrimary = OZChannelProgress_vtable_plus_0x10;
      rbx.__vptrSecondary = OZChannelProgress_vtable_plus_0x370;
      // @0x7fbb3..0x7fbc7 — byte-copy fields at +0x98 and +0x99.
      rbx.fieldAt0x98 = this.fieldAt0x98;
      rbx.fieldAt0x99 = this.fieldAt0x99;
    } catch (e) {
      // @0x7fbd5..0x7fbe5 unwind: operator delete(rbx) + rethrow.
      operator_delete(rbx);
      throw e;
    }
    // @0x7fbcd — return rbx.
    return rbx;
  }

  /**
   * `OZChannelProgress::getObjCWrapperName()`  @ProChannel 0x7fbe8
   * (__ZN17OZChannelProgress18getObjCWrapperNameEv).
   *
   * Disasm mirror (7 lines total):
   *   pushq %rbp / movq %rsp,%rbp                               @0x7fbe8..0x7fbeb
   *   leaq  0x65dbd(%rip), %rax                                 @0x7fbec   (RIP+0x65dbd = cfstring @0xe59b0)
   *   popq  %rbp / retq                                          @0x7fbf3..0x7fbf4
   *
   * Returns a `CFStringRef` pointing to a __cfstring entry in ProChannel at
   * VMA 0xe59b0. The __cfstring struct there (isa/info/strPtr/len) is not yet
   * decoded — its `strPtr` field points into ProChannel's __cstring section
   * (otool -tV printed "@\"bad cfstring ref\"" because it couldn't resolve the
   * chained-fixup pointer, but the CFString itself is a legitimate constant).
   * Per the OZChannel2D.getObjCWrapperName precedent (see
   * raw-port/src/channels/OZChannel2D.ts) we defer the decode with a throwing
   * stub citing the addresses.
   */
  getObjCWrapperName(): string {
    throw new Error(
      'OZChannelProgress::getObjCWrapperName() @ProChannel 0x7fbe8 not yet transcribed ' +
        '(returns __cfstring @0xe59b0; cfstring body has chained-fixup strPtr that otool -tV ' +
        'printed as "bad cfstring ref")',
    );
  }

  /**
   * `OZChannelProgress::~OZChannelProgress()` D1 — complete non-deleting dtor
   *  @ProChannel 0x7fbf6 (__ZN17OZChannelProgressD1Ev).
   *
   * Disasm mirror (4 lines):
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp                  @0x7fbf6..0x7fbfa
   *   jmp   __ZN9OZChannelD2Ev                                  @0x7fbfb   (tail-call base dtor)
   *
   * OZChannelProgress adds no new heap owners beyond the OZChannel base, so
   * the complete-object dtor is a bare tail-call to the base dtor.
   */
  _D1_dtor(): void {
    // @0x7fbfb — tail-call OZChannel::~OZChannel().
    OZChannel__dtor(this);
  }

  /**
   * `OZChannelProgress::~OZChannelProgress()` D0 — deleting dtor
   *  @ProChannel 0x7fc00 (__ZN17OZChannelProgressD0Ev).
   *
   * Disasm mirror:
   *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax    @0x7fc00..0x7fc05
   *   movq  %rdi, %rbx                                          @0x7fc06
   *   callq __ZN9OZChannelD2Ev                                  @0x7fc09
   *   movq  %rbx, %rdi                                          @0x7fc0e
   *   addq  $0x8, %rsp / popq %rbx / popq %rbp                 @0x7fc11..0x7fc16
   *   jmp   __ZdlPv [stub 0xace04]                              @0x7fc17   (tail-call operator delete)
   *
   * Same as D1 plus a final `operator delete(this)`. Modeled as two sequential
   * calls (JS/TS has no direct `delete this` semantics — GC handles the memory,
   * but we still invoke the operator delete stub so vtable-slot dispatch is
   * faithful to what the C++ vtable would call).
   */
  _D0_dtor(): void {
    // @0x7fc09 — call OZChannel::~OZChannel().
    OZChannel__dtor(this);
    // @0x7fc17 — tail-call operator delete(this).
    operator_delete(this);
  }
}
