// OZChannelGammaFootage — the "footage gamma" (float-double) channel in FCP's OZChannel
// family (ProChannel.framework).  Modelled the same way as OZChannelAngle /
// OZChannelDouble: a subclass of OZChannel that owns a per-class singleton Info +
// singleton Impl, each initialised lazily via `std::call_once`, and consulted at
// construction time to fill the base's OZChannelImpl* / OZChannelInfo* slots.
//
// Framework: ProChannel.
// DECODE (raw-port/re/disasm/ProChannel.OZChannelGammaFootage.*.s):
//   OZChannelGammaFootage(OZFactory*, PCString const&, u32, OZChannelImpl*, OZChannelInfo*)
//                              @ProChannel 0x6de2   (C2)
//                              (__ZN21OZChannelGammaFootageC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo)
//   OZChannelGammaFootage(PCString const&, OZChannelFolder*, u32, u32, OZChannelImpl*,
//                         OZChannelInfo*)
//                              @ProChannel 0x977bc  (C2)
//                              (__ZN21OZChannelGammaFootageC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo)
//   ~OZChannelGammaFootage()   @ProChannel 0x1d1f6  (D1 — tail-jmp OZChannel::~OZChannel())
//   ~OZChannelGammaFootage()   @ProChannel 0x1d200  (D0 — OZChannel::~ then __ZdlPv)
//   createOZChannelGammaFootageInfo() @ProChannel 0x6e92
//                              (__ZN21OZChannelGammaFootage31createOZChannelGammaFootageInfoEv)
//   createOZChannelGammaFootageImpl() @ProChannel 0x6edc
//                              (__ZN21OZChannelGammaFootage31createOZChannelGammaFootageImplEv)
//   createOZChannelGammaFootageImpl()::'lambda'()::operator()() @ProChannel 0x708a
//                              (__ZZN21OZChannelGammaFootage31createOZChannelGammaFootageImplEvENKUlvE_clEv)
//   createOZChannelGammaFootageInfo()::'lambda'() body — inlined into the __invoke
//                              helper @ProChannel 0x6f36
//                              (__ZNSt3__18__invokeB9nqe210106IJZN21OZChannelGammaFootage31createOZChannelGammaFootageInfoEvEUlvE_EEE...)
//   getObjCWrapperName()       @ProChannel 0x1ccb4
//                              (__ZN21OZChannelGammaFootage18getObjCWrapperNameEv)
//   clone() const              @ProChannel 0x1d21c
//                              (__ZNK21OZChannelGammaFootage5cloneEv)
//
// Callees / RIP-relative references (resolved via
// `raw-port/army/tools/resolve.py ProChannel {sym|const} 0x...`):
//   __Znwm                                              // operator new(unsigned long)
//   __ZdlPv                                              // operator delete(void*) (unwind + D0)
//   __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//                                                       // OZChannel base ctor
//   __ZN9OZChannelD2Ev                                   // OZChannel::~OZChannel()
//                                                       //   (called from D0/D1 unwind paths)
//   __ZN9OZChannelC2ERKS_P15OZChannelFolder              // OZChannel::OZChannel(OZChannel&, folder)
//                                                       //   used by clone() @0x1d23b
//   __Z36getOZChannelGammaFootage_FactoryBasev           // free fn returning OZFactory*
//                                                       //   called from 2nd ctor @0x977e0
//   __ZTV21OZChannelGammaFootage                         // this class's vtable
//                                                       //   sym 0xd32a0; +0x10 = 0xd32b0 primary
//                                                       //   +0x370 offset = 0xd3610 secondary
//   __ZN21OZChannelGammaFootage26_OZChannelGammaFootageInfoE
//                                                       // static singleton pointer (info)
//   __ZN21OZChannelGammaFootage26_OZChannelGammaFootageImplE
//                                                       // static singleton pointer (impl)
//   __ZZN21OZChannelGammaFootage31createOZChannelGammaFootageInfoEvE31_OZChannelGammaFootageInfo_once
//                                                       // std::once_flag for the Info singleton
//   __ZZN21OZChannelGammaFootage31createOZChannelGammaFootageImplEvE31_OZChannelGammaFootageImpl_once
//                                                       // std::once_flag for the Impl singleton
//   __ZNSt3__111__call_onceERVmPvPFvS2_E                 // std::__1::__call_once entry point
//   __ZNSt3__117__call_once_proxy...GammaFootageInfo...  // __call_once_proxy stubs (info / impl)
//   __ZNSt3__117__call_once_proxy...GammaFootageImpl...
//   __ZN25OZChannelGammaFootageInfoC2Ev                  // Info ctor (called by info-lambda
//                                                       //   inlined @0x6f5a in __invoke helper)
//   __ZN13OZCurveDoubleC2Ed                              // OZCurveDouble::OZCurveDouble(double)
//                                                       //   called by impl-lambda @0x70c1
//   __ZN13OZChannelImplC2EP7OZCurvedjb                   // OZChannelImpl::OZChannelImpl(OZCurve*,
//                                                       //   double, u32, bool) called @0x70d6
//   __ZN13OZChannelImplD2Ev                              // OZChannelImpl::~OZChannelImpl()
//                                                       //   (unwind @0x7115)
//   __ZN11PCSingletonC2Ej                                // PCSingleton ctor(u32=100) called @0x70e7
//                                                       //   on the impl's embedded sub-object
//                                                       //   at this+0x28
//   __Unwind_Resume                                      // cleanup rethrow
//   Objc cfstring ref for getObjCWrapperName()           // rip+0xc8151 @0x1ccb8 (a CFString&
//                                                       //   in the __objc_cfstring section — the
//                                                       //   returned wrapper class name literal)
//
// STRUCT LAYOUT (per ctor writes @0x6e19..0x6e6f and @0x97819..0x97873):
//   +0x000  primary vptr        (= &vtable_OZChannelGammaFootage + 0x10 = 0xd32b0)
//   +0x010  secondary vptr      (= &vtable_OZChannelGammaFootage + 0x370 = 0xd3610)
//   +0x070  OZChannelImpl*  impl  (mirror of +0x78)
//   +0x078  OZChannelImpl*  impl  (initial slot)
//   +0x080  OZChannelInfo*  info  (mirror of +0x88)
//   +0x088  OZChannelInfo*  info  (initial slot)
//   [rest of the layout inherited from OZChannel; not touched by these methods]
//   sizeof(OZChannelGammaFootage) = 0x98 bytes (per `__Znwm $0x98` @0x1d226 in clone()).
//
// The mirror-write pattern (writing the same pointer to both +0x70/+0x78 or +0x80/+0x88)
// matches OZChannelAngle / OZChannelDouble exactly: the base ctor deposits the caller-
// supplied pointer at the higher offset (0x78 / 0x88) and the derived ctor either keeps it
// (mirror it down to 0x70 / 0x80) or replaces both with the once-initialised per-class
// singleton fetched via createOZChannelGammaFootage{Impl,Info}().
//
// The Info singleton size is 0x58 bytes (per `__Znwm $0x58` @0x6f4a in the info-lambda
// inlined into the __invoke helper @0x6f36) and constructed by
// OZChannelGammaFootageInfo::OZChannelGammaFootageInfo() @0x6f5a.
// The Impl singleton is a 0x30-byte OZChannelImpl (per `__Znwm $0x30` @0x70a1 in the impl-
// lambda @0x708a) that owns:
//   - a fresh 0xb0-byte OZCurveDouble (per `__Znwm $0xb0` @0x70ae) built with default 0.0
//   - a PCSingleton sub-object embedded at this+0x28 (constructed with capacity 100 @0x70e7)
//   - a primary/secondary vptr pair (0xccd38 primary, 0xccd58 secondary — resolved via
//     `resolve.py ProChannel sym 0xccd38` = "vtable for OZChannelGammaFootageImpl (+0x10)").
//
// FRONTIER (this file is currently a THROW-cited shell for its ctors + lambdas):
//   OZFactory, PCString, OZChannelFolder, OZChannelImpl, OZChannelInfo, OZCurveDouble,
//   PCSingleton, OZChannelGammaFootageInfo, and the OZChannel base ctor/dtor are all still
//   frontier types.  Their methods are not yet transcribed; every path we would need to
//   execute throws citing the ProChannel address that must land first.  This is deliberate:
//   the ledger's key contract is that every method of OZChannelGammaFootage has an @0xADDR
//   citation, so `mark_ported.py` can flip it to "ported" and `frontier.py` can enumerate the
//   remaining gaps to unblock.

// ---------------------------------------------------------------------------------------------
// Frontier type stubs — these mirror the same convention used by OZChannelAngle.ts and
// OZChannelDouble.ts (see PORTING_SPEC Rule 6: one class per file; imports only).  We can't
// import a type that doesn't yet exist in the port, so each dependency is declared here as a
// nominal placeholder.  When the real classes land, these `type` aliases will be replaced by
// `import type { ... } from './X'` lines and every callsite's shape is already correct.
// ---------------------------------------------------------------------------------------------

/** Placeholder for the ProChannel `OZFactory` type (declared in ProChannel; not ported). */
export type OZFactory = { readonly __brand: "OZFactory" };

/** Placeholder for the ProChannel `PCString` type (declared in ProChannel; not ported). */
export type PCString = { readonly __brand: "PCString" };

/** Placeholder for the ProChannel `OZChannelFolder` type (declared in ProChannel; not ported). */
export type OZChannelFolder = { readonly __brand: "OZChannelFolder" };

/** Placeholder for the ProChannel `OZChannelImpl` type (declared in ProChannel; not ported). */
export type OZChannelImpl = { readonly __brand: "OZChannelImpl" };

/** Placeholder for the ProChannel `OZChannelInfo` type (declared in ProChannel; not ported). */
export type OZChannelInfo = { readonly __brand: "OZChannelInfo" };

// ---------------------------------------------------------------------------------------------
// Frontier callees — every un-decoded call target is a stub that raises with its
// ProChannel @0xADDR cited in the message.  This matches the OZChannelAngle.ts /
// OZChannelDouble.ts convention.
// ---------------------------------------------------------------------------------------------

/** External free function `__Z36getOZChannelGammaFootage_FactoryBasev` (ProChannel; not yet
 *  transcribed).  Called by the 2nd OZChannelGammaFootage ctor @ProChannel 0x977e0. */
function getOZChannelGammaFootage_FactoryBase(): OZFactory {
  throw new Error(
    "getOZChannelGammaFootage_FactoryBase() @ProChannel __Z36getOZChannelGammaFootage_FactoryBasev " +
    "(defined in ProChannel; not yet transcribed) — called by OZChannelGammaFootage ctor " +
    "@ProChannel 0x977e0",
  );
}

/** External `__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 *  — OZChannel base ctor (ProChannel-defined; not yet transcribed).  Called from both
 *  OZChannelGammaFootage ctors at @ProChannel 0x6e09 and @ProChannel 0x97809. */
function OZChannel_base_ctor(
  _self: OZChannelGammaFootage,
  _factory: OZFactory,
  _name: PCString,
  _folder: OZChannelFolder | null,
  _flag0: number,
  _flag1: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, " +
    "unsigned int, OZChannelImpl*, OZChannelInfo*) @ProChannel " +
    "__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo " +
    "not yet transcribed — called from OZChannelGammaFootage ctors " +
    "@ProChannel 0x6e09 and 0x97809",
  );
}

/** External `__ZN9OZChannelC2ERKS_P15OZChannelFolder` — OZChannel copy ctor (ProChannel;
 *  not yet transcribed).  Called from OZChannelGammaFootage::clone() @ProChannel 0x1d23b. */
function OZChannel_copy_ctor(
  _self: OZChannelGammaFootage,
  _src: OZChannelGammaFootage,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @ProChannel " +
    "__ZN9OZChannelC2ERKS_P15OZChannelFolder not yet transcribed — called from " +
    "OZChannelGammaFootage::clone() @ProChannel 0x1d23b",
  );
}

/** External `__ZN9OZChannelD2Ev` — OZChannel::~OZChannel() (ProChannel; not yet transcribed).
 *  Called from D0 @ProChannel 0x1d209 and D1 @ProChannel 0x1d1fb and unwind paths at 0x6e84
 *  and 0x9788c. */
function OZChannel_dtor(_self: OZChannelGammaFootage): void {
  throw new Error(
    "OZChannel::~OZChannel() @ProChannel __ZN9OZChannelD2Ev not yet transcribed — called " +
    "from OZChannelGammaFootage D0 @0x1d209, D1 @0x1d1fb, and unwind @0x6e84 / 0x9788c",
  );
}

/** External `__ZN25OZChannelGammaFootageInfoC2Ev` — OZChannelGammaFootageInfo ctor
 *  (see raw-port/src/channels/OZChannelGammaFootageInfo.ts — that file's ctor path is
 *  itself frontier-blocked on OZChannelInfo/PCSingleton).  Called by the info-lambda
 *  inlined into the __invoke helper @ProChannel 0x6f5a. */
function OZChannelGammaFootageInfo_ctor(): OZChannelInfo {
  throw new Error(
    "OZChannelGammaFootageInfo::OZChannelGammaFootageInfo() @ProChannel " +
    "__ZN25OZChannelGammaFootageInfoC2Ev not yet transcribed (see " +
    "raw-port/src/channels/OZChannelGammaFootageInfo.ts — currently frontier-blocked " +
    "on OZChannelInfo + PCSingleton) — called by info-lambda @ProChannel 0x6f5a",
  );
}

/** External `__ZN13OZCurveDoubleC2Ed` — OZCurveDouble ctor (ProChannel; not yet
 *  transcribed).  Called by the impl-lambda @ProChannel 0x70c1 with xmm0=0.0. */
function OZCurveDouble_ctor(_self: unknown, _defaultValue: number): void {
  throw new Error(
    "OZCurveDouble::OZCurveDouble(double) @ProChannel __ZN13OZCurveDoubleC2Ed not yet " +
    "transcribed — called by impl-lambda @ProChannel 0x70c1 with argument 0.0",
  );
}

/** External `__ZN13OZChannelImplC2EP7OZCurvedjb` — OZChannelImpl ctor (ProChannel;
 *  not yet transcribed).  Called by the impl-lambda @ProChannel 0x70d6 with arguments
 *  (curve=OZCurveDouble*, defaultVal=0.0, tick=0, autoValid=true). */
function OZChannelImpl_ctor(
  _self: unknown,
  _curve: unknown,
  _defaultVal: number,
  _tick: number,
  _autoValid: boolean,
): void {
  throw new Error(
    "OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool) @ProChannel " +
    "__ZN13OZChannelImplC2EP7OZCurvedjb not yet transcribed — called by impl-lambda " +
    "@ProChannel 0x70d6 with (curve, 0.0, 0, true)",
  );
}

/** External `__ZN13OZChannelImplD2Ev` — OZChannelImpl::~OZChannelImpl() (ProChannel;
 *  not yet transcribed).  Called on the unwind path @ProChannel 0x7115. */
function OZChannelImpl_dtor(_self: unknown): void {
  throw new Error(
    "OZChannelImpl::~OZChannelImpl() @ProChannel __ZN13OZChannelImplD2Ev not yet " +
    "transcribed — called on unwind @ProChannel 0x7115",
  );
}

/** External `__ZN11PCSingletonC2Ej` — PCSingleton ctor(u32) (ProCore/ProChannel;
 *  not yet transcribed).  Called by the impl-lambda @ProChannel 0x70e7 on the impl's
 *  embedded sub-object at this+0x28 with capacity 0x64=100. */
function PCSingleton_ctor(_self: unknown, _capacity: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProChannel __ZN11PCSingletonC2Ej not yet " +
    "transcribed — called by impl-lambda @ProChannel 0x70e7 with capacity 0x64=100",
  );
}

// ---------------------------------------------------------------------------------------------
// Per-class singleton state (mirrors the two static pointers `_OZChannelGammaFootageInfo` and
// `_OZChannelGammaFootageImpl` in the framework).  Each is initialised on first access via a
// `std::call_once`-guarded lambda.  In TS we emulate `std::call_once` with a simple boolean —
// but only within the throwing lambdas, so the once-flag semantics don't matter until the
// dependencies land.
// ---------------------------------------------------------------------------------------------

/** Static `__ZN21OZChannelGammaFootage26_OZChannelGammaFootageInfoE` — the singleton Info
 *  pointer.  Written once by the info-lambda (@ProChannel 0x6f5f `movq %rbx, (%r14)`). */
let _OZChannelGammaFootageInfo: OZChannelInfo | null = null;

/** Static `__ZN21OZChannelGammaFootage26_OZChannelGammaFootageImplE` — the singleton Impl
 *  pointer.  Written once by the impl-lambda (@ProChannel 0x7101 `movq %rbx, (%r15)`). */
let _OZChannelGammaFootageImpl: OZChannelImpl | null = null;

/** Once-flag for the Info singleton (`__ZZN...E31_OZChannelGammaFootageInfo_once`).
 *  The disasm @0x6ea1 checks `cmpq $-0x1, %rax` — value -1 means "already run"; otherwise
 *  std::__call_once is invoked which drives the lambda to completion and then sets the flag. */
let _OZChannelGammaFootageInfo_once = false;

/** Once-flag for the Impl singleton (`__ZZN...E31_OZChannelGammaFootageImpl_once`). */
let _OZChannelGammaFootageImpl_once = false;

/**
 * `OZChannelGammaFootage::createOZChannelGammaFootageInfo()::'lambda'()::operator()()`
 * — the body is inlined into the __invoke helper at @ProChannel 0x6f36.
 *
 * DECODE (extracted awk-block from the __invoke helper — see file header):
 *   0x6f3d  leaq _OZChannelGammaFootageInfo(%rip), %r14
 *   0x6f44  cmpq $0x0, (%r14)             ## if already non-null, skip
 *   0x6f48  jne  0x6f62                    ## early-out
 *   0x6f4a  movl $0x58, %edi              ## alloc 0x58 = sizeof(OZChannelGammaFootageInfo)
 *   0x6f4f  callq __Znwm
 *   0x6f57  callq __ZN25OZChannelGammaFootageInfoC2Ev  ## default ctor
 *   0x6f5f  movq %rbx, (%r14)              ## store the singleton
 *   0x6f62  ret
 */
function createOZChannelGammaFootageInfo_lambda(): void {
  // @ProChannel 0x6f44
  if (_OZChannelGammaFootageInfo !== null) return;
  // @ProChannel 0x6f4a..0x6f5a — alloc + ctor OZChannelGammaFootageInfo (frontier).
  _OZChannelGammaFootageInfo = OZChannelGammaFootageInfo_ctor();
}

/**
 * `OZChannelGammaFootage::createOZChannelGammaFootageInfo()` @ProChannel 0x6e92
 *   (__ZN21OZChannelGammaFootage31createOZChannelGammaFootageInfoEv)
 *
 * DECODE (raw-port/re/disasm/ProChannel.OZChannelGammaFootage.createOZChannelGammaFootageInfo.s):
 *   0x6e9a  movq _OZChannelGammaFootageInfo_once(%rip), %rax
 *   0x6ea1  cmpq $-0x1, %rax                 ## already run?
 *   0x6ea5  je    0x6ecc                      ## yes -> tail
 *   0x6ea7..0x6ec7 build a std::call_once frame targetting the __call_once_proxy
 *                  for the info-lambda (see __ZNSt3__117__call_once_proxy...InfoE... symbol)
 *                  and invoke std::__1::__call_once
 *   0x6ecc  leaq _OZChannelGammaFootageInfo(%rip), %rax
 *   0x6ed3  movq (%rax), %rax                ## return the singleton pointer
 *   0x6edb  ret
 *
 * Returns the (lazily initialised) OZChannelGammaFootageInfo singleton.
 */
export function createOZChannelGammaFootageInfo(): OZChannelInfo {
  // @ProChannel 0x6ea1..0x6ec7 — std::call_once dispatch (emulated as run-once boolean).
  if (!_OZChannelGammaFootageInfo_once) {
    createOZChannelGammaFootageInfo_lambda();
    _OZChannelGammaFootageInfo_once = true;
  }
  // @ProChannel 0x6ecc..0x6ed3 — load and return the singleton pointer.
  if (_OZChannelGammaFootageInfo === null) {
    throw new Error(
      "OZChannelGammaFootage::_OZChannelGammaFootageInfo @ProChannel " +
      "__ZN21OZChannelGammaFootage26_OZChannelGammaFootageInfoE is null after call_once — " +
      "expected the info-lambda @0x6f4a to have populated it; frontier-blocked on " +
      "OZChannelGammaFootageInfo::OZChannelGammaFootageInfo() @0x6f5a",
    );
  }
  return _OZChannelGammaFootageInfo;
}

/**
 * `OZChannelGammaFootage::createOZChannelGammaFootageImpl()::'lambda'()::operator()()`
 * @ProChannel 0x708a
 *   (__ZZN21OZChannelGammaFootage31createOZChannelGammaFootageImplEvENKUlvE_clEv)
 *
 * DECODE (extracted from the __invoke listing — see file header):
 *   0x7094  leaq _OZChannelGammaFootageImpl(%rip), %r15
 *   0x709b  cmpq $0x0, (%r15) ; jne 0x7104   ## already non-null -> skip
 *   0x70a1  movl $0x30, %edi                 ## alloc 0x30 = sizeof(OZChannelImpl)
 *   0x70a6  callq __Znwm                     ## rbx = new OZChannelImpl bytes
 *   0x70ae  movl $0xb0, %edi                 ## alloc 0xb0 = sizeof(OZCurveDouble)
 *   0x70b3  callq __Znwm                     ## r14 = new OZCurveDouble bytes
 *   0x70bb  xorps %xmm0, %xmm0               ## xmm0 = 0.0 (default curve value)
 *   0x70c1  callq __ZN13OZCurveDoubleC2Ed    ## OZCurveDouble::OZCurveDouble(0.0)
 *   0x70c6  xorps %xmm0, %xmm0               ## xmm0 = 0.0 (default channel value)
 *   0x70cf  xorl  %edx, %edx                 ## u32 arg = 0 (initial tick)
 *   0x70d1  movl  $0x1, %ecx                 ## bool arg = true (autoValid?)
 *   0x70d6  callq __ZN13OZChannelImplC2EP7OZCurvedjb
 *                                            ## OZChannelImpl::OZChannelImpl(curve, 0.0, 0, true)
 *   0x70de  addq  $0x28, %rdi                ## &(this->+0x28) — embedded PCSingleton subobj
 *   0x70e2  movl  $0x64, %esi                ## capacity = 100
 *   0x70e7  callq __ZN11PCSingletonC2Ej      ## PCSingleton::PCSingleton(100)
 *   0x70ec  leaq  vtable_OZChannelGammaFootageImpl+0x10(%rip), %rax  ## primary vptr = 0xccd38
 *   0x70f3  movq  %rax, (%rbx)               ## this->vtable = 0xccd38
 *   0x70f6  leaq  vtable_OZChannelGammaFootageImpl+0x30(%rip), %rax  ## secondary vptr = 0xccd58
 *   0x70fd  movq  %rax, 0x28(%rbx)           ## this->+0x28 vtable slot = 0xccd58
 *                                            ##   (the embedded PCSingleton's vptr)
 *   0x7101  movq  %rbx, (%r15)               ## _OZChannelGammaFootageImpl = this
 *   0x710e  ret
 *
 * Net effect: construct a new OZChannelImpl wrapping a fresh OZCurveDouble(0.0), install the
 * OZChannelGammaFootageImpl primary+secondary vtables at offsets 0x00 and 0x28, and cache the
 * result in the singleton pointer.
 */
function createOZChannelGammaFootageImpl_lambda(): void {
  // @ProChannel 0x709b — early-out if already initialised.
  if (_OZChannelGammaFootageImpl !== null) return;
  // @ProChannel 0x70a1..0x70e7 — construct the singleton.  Every callee is frontier.
  // Following the disasm exactly:
  const implBytes: unknown = {};
  const curveBytes: unknown = {};
  OZCurveDouble_ctor(curveBytes, 0.0);                       // @0x70c1 with xmm0=0.0
  OZChannelImpl_ctor(implBytes, curveBytes, 0.0, 0, true);   // @0x70d6 with (curve, 0, 0, true)
  PCSingleton_ctor(implBytes, 0x64);                          // @0x70e7 with capacity=100
  // @ProChannel 0x70ec..0x70fd — install the two vptrs @0xccd38 (primary) and @0xccd58
  //   (secondary — the embedded PCSingleton's).  We can't model raw vtable pointers in TS;
  //   the class instance shape already encodes the dispatch.  Address citations preserved
  //   in the doc comment above.
  _OZChannelGammaFootageImpl = implBytes as OZChannelImpl;   // @0x7101 movq %rbx, (%r15)
}

/**
 * `OZChannelGammaFootage::createOZChannelGammaFootageImpl()` @ProChannel 0x6edc
 *   (__ZN21OZChannelGammaFootage31createOZChannelGammaFootageImplEv)
 *
 * DECODE (raw-port/re/disasm/ProChannel.OZChannelGammaFootage.createOZChannelGammaFootageImpl.s):
 *   0x6ee4  movq _OZChannelGammaFootageImpl_once(%rip), %rax
 *   0x6eeb  cmpq $-0x1, %rax  ; je 0x6f16   ## already run -> tail
 *   0x6ef1..0x6f11  set up std::call_once frame targetting the __call_once_proxy for the
 *                   impl-lambda; invoke std::__1::__call_once
 *   0x6f16  leaq _OZChannelGammaFootageImpl(%rip), %rax
 *   0x6f1d  movq (%rax), %rax                ## return the singleton pointer
 *   0x6f25  ret
 */
export function createOZChannelGammaFootageImpl(): OZChannelImpl {
  // @ProChannel 0x6eeb..0x6f11 — std::call_once dispatch.
  if (!_OZChannelGammaFootageImpl_once) {
    createOZChannelGammaFootageImpl_lambda();
    _OZChannelGammaFootageImpl_once = true;
  }
  // @ProChannel 0x6f16..0x6f1d — load and return the singleton pointer.
  if (_OZChannelGammaFootageImpl === null) {
    throw new Error(
      "OZChannelGammaFootage::_OZChannelGammaFootageImpl @ProChannel " +
      "__ZN21OZChannelGammaFootage26_OZChannelGammaFootageImplE is null after call_once — " +
      "expected the impl-lambda @0x70a1 to have populated it; frontier-blocked on " +
      "OZCurveDouble/OZChannelImpl/PCSingleton ctors",
    );
  }
  return _OZChannelGammaFootageImpl;
}

/**
 * `OZChannelGammaFootage` — footage-gamma channel in the OZ family.
 *
 * Sizeof = 0x98 bytes (from clone()'s `__Znwm $0x98` @0x1d226).
 */
export class OZChannelGammaFootage {
  /** @ProChannel primary vptr slot @+0x00 (installed value = 0xd32b0 in both ctors). */
  vptr_primary: number = 0xd32b0;
  /** @ProChannel secondary vptr slot @+0x10 (installed value = 0xd3610 in both ctors). */
  vptr_secondary: number = 0xd3610;
  /** @ProChannel OZChannelImpl* slot @+0x70 (mirror of +0x78). */
  impl_lo: OZChannelImpl | null = null;
  /** @ProChannel OZChannelImpl* slot @+0x78 (as-passed / singleton). */
  impl_hi: OZChannelImpl | null = null;
  /** @ProChannel OZChannelInfo* slot @+0x80 (mirror of +0x88). */
  info_lo: OZChannelInfo | null = null;
  /** @ProChannel OZChannelInfo* slot @+0x88 (as-passed / singleton). */
  info_hi: OZChannelInfo | null = null;

  /**
   * `OZChannelGammaFootage::OZChannelGammaFootage(OZFactory*, PCString const&, u32,
   *                                                OZChannelImpl*, OZChannelInfo*)`
   *   @ProChannel 0x6de2
   *   (__ZN21OZChannelGammaFootageC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo)
   *
   * DECODE (raw-port/re/disasm — 5-arg factory-based ctor):
   *   0x6def  save r9 (info)   as %r15
   *   0x6df2  save r8 (impl)   as %r14
   *   0x6df5  ecx (flag0) -> r8d       (base ctor's u32 flag0 arg)
   *   0x6df8  save %rdi (this) as %rbx
   *   0x6dfb  spill r9=info to  0x8(%rsp)  (base ctor's 6th stack slot arg — info)
   *   0x6e00  spill r14=impl to (%rsp)     (base ctor's 5th stack slot arg — impl)
   *   0x6e04  xor  ecx, ecx                (base ctor's folder arg = nullptr)
   *   0x6e06  xor  r9d, r9d                (base ctor's u32 flag1 arg = 0)
   *   0x6e09  callq OZChannel::OZChannel(this, factory, name, folder=nullptr,
   *                                       flag0=ecx-shifted, flag1=0, impl, info)
   *   0x6e0e..0x6e22 install vptrs: this->+0x00 = vtable+0x10, this->+0x10 = vtable+0x370
   *   0x6e26  callq createOZChannelGammaFootageInfo()   ## drive lazy init
   *   0x6e2b  testq %r15, %r15 ; je 0x6e39  ## info == nullptr ?
   *   0x6e30    yes: skip; keep the base ctor's +0x88 as-is (already set from caller arg)
   *   0x6e39    no : this->+0x88 = *_OZChannelGammaFootageInfo   ## use singleton
   *   0x6e4a  this->+0x80 = rax   (mirror of whichever the branch chose)
   *   0x6e51  callq createOZChannelGammaFootageImpl()   ## drive lazy init
   *   0x6e56  testq %r14, %r14 ; je 0x6e61  ## impl == nullptr ?
   *   0x6e5b    yes: keep the base ctor's +0x78 as-is
   *   0x6e61    no : this->+0x78 = *_OZChannelGammaFootageImpl    ## use singleton
   *   0x6e6f  this->+0x70 = rax   (mirror)
   *   0x6e7d  ret
   *
   * NOTE (branch polarity — verified from `test %rN,%rN; je`):
   *   `testq %r15,%r15; je 0x6e39` skips the singleton branch (jumps to `_ChannelInfo`
   *    load) when r15 == 0, i.e. when the caller's `info` argument IS non-null.  Wait —
   *    `je` on `test r,r` jumps when the ZF is set, which happens when r == 0.  So the
   *    jump target 0x6e39 is taken when info == null, and the fall-through at 0x6e30
   *    (which reads this->+0x88 straight to rax without changing it) runs when info != null.
   *    Result:
   *      info != null : keep the caller-supplied info (base ctor already stored it at +0x88);
   *      info == null : install the class-wide singleton info.
   *    Same polarity applies to the impl branch at 0x6e56..0x6e6f.
   */
  constructor(
    factory: OZFactory,
    name: PCString,
    flag0: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ) {
    // @ProChannel 0x6e09 — base ctor call (folder = null, flag1 = 0).
    OZChannel_base_ctor(this, factory, name, null, flag0 >>> 0, 0, impl, info);
    // @ProChannel 0x6e0e..0x6e22 — install vptrs (values already baked into field defaults).
    // @ProChannel 0x6e26 — drive lazy Info init.
    createOZChannelGammaFootageInfo();
    // @ProChannel 0x6e2b..0x6e4a — pick info source.
    const chosenInfo = info !== null ? this.info_hi : _OZChannelGammaFootageInfo;
    if (info === null) this.info_hi = _OZChannelGammaFootageInfo;   // 0x6e43
    this.info_lo = chosenInfo;                                       // 0x6e4a (mirror)
    // @ProChannel 0x6e51 — drive lazy Impl init.
    createOZChannelGammaFootageImpl();
    // @ProChannel 0x6e56..0x6e6f — pick impl source.
    const chosenImpl = impl !== null ? this.impl_hi : _OZChannelGammaFootageImpl;
    if (impl === null) this.impl_hi = _OZChannelGammaFootageImpl;    // 0x6e6b
    this.impl_lo = chosenImpl;                                       // 0x6e6f (mirror)
  }

  /**
   * Second overload: `OZChannelGammaFootage::OZChannelGammaFootage(PCString const&,
   *   OZChannelFolder*, u32, u32, OZChannelImpl*, OZChannelInfo*)` @ProChannel 0x977bc.
   *
   * This variant calls `getOZChannelGammaFootage_FactoryBase()` @0x977e0 to obtain the
   * factory, then delegates to the same base ctor with folder != null:
   *   0x977e0  callq getOZChannelGammaFootage_FactoryBase() -> rax = factory
   *   0x977e5  load stack arg 0x10(%rbp) = info (7th arg)
   *   0x977e9  spill info    -> 0x8(%rsp)  (base ctor's stack-slot arg)
   *   0x977ee  spill r15=impl-> -0x38(%rbp) and (%rsp)
   *   0x97809  callq OZChannel base ctor with (this, factory, name, folder, flag0, flag1,
   *                                            impl, info)
   *   0x97819..0x97822 install vptrs (same values as 5-arg overload)
   *   0x97826..0x97873 same info/impl branch structure as 5-arg overload, gated on
   *                    `cmpq $0,0x10(%rbp)` (info) and `cmpq $0,-0x38(%rbp)` (impl).
   *
   * We expose this as a static factory since TypeScript lacks C++ ctor overloading.
   */
  static withFolder(
    name: PCString,
    folder: OZChannelFolder | null,
    flag0: number,
    flag1: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelGammaFootage {
    // @ProChannel 0x977e0 — obtain the factory via the free helper.
    const factory = getOZChannelGammaFootage_FactoryBase();
    // Manual construction mirroring the 5-arg ctor but with the caller's folder.
    const self: OZChannelGammaFootage = Object.create(OZChannelGammaFootage.prototype);
    self.vptr_primary = 0xd32b0;
    self.vptr_secondary = 0xd3610;
    // @ProChannel 0x97809 — base ctor call with the caller's folder.
    OZChannel_base_ctor(self, factory, name, folder, flag0 >>> 0, flag1 >>> 0, impl, info);
    // @ProChannel 0x97826 — drive lazy Info init.
    createOZChannelGammaFootageInfo();
    // @ProChannel 0x9782b..0x9784c — pick info source (same polarity as 5-arg ctor).
    if (info === null) self.info_hi = _OZChannelGammaFootageInfo;
    self.info_lo = self.info_hi;
    // @ProChannel 0x97853 — drive lazy Impl init.
    createOZChannelGammaFootageImpl();
    // @ProChannel 0x97858..0x97873 — pick impl source.
    if (impl === null) self.impl_hi = _OZChannelGammaFootageImpl;
    self.impl_lo = self.impl_hi;
    return self;
  }

  /**
   * `OZChannelGammaFootage::~OZChannelGammaFootage()` — D1 @ProChannel 0x1d1f6.
   *
   * DECODE (raw-port/re/disasm/ProChannel.OZChannelGammaFootage.D1 — trivial 3-insn frame):
   *   0x1d1f6  pushq %rbp
   *   0x1d1f7  movq  %rsp, %rbp
   *   0x1d1fa  popq  %rbp
   *   0x1d1fb  jmp   __ZN9OZChannelD2Ev          ## tail-call OZChannel::~OZChannel()
   *
   * Net effect: delegate destruction to the base OZChannel destructor.  No subclass-owned
   * heap resources (the Info/Impl singletons are per-class, not per-instance).
   */
  destruct(): void {
    // @ProChannel 0x1d1fb — tail-jmp to OZChannel::~OZChannel().
    OZChannel_dtor(this);
  }

  /**
   * `OZChannelGammaFootage::~OZChannelGammaFootage()` — D0 @ProChannel 0x1d200 (deleting).
   *
   * DECODE:
   *   0x1d206  save %rdi (this) as %rbx
   *   0x1d209  callq __ZN9OZChannelD2Ev          ## OZChannel::~OZChannel()
   *   0x1d20e..0x1d217  restore + jmp __ZdlPv    ## operator delete(this)
   */
  destructDelete(): void {
    // @ProChannel 0x1d209 — OZChannel::~OZChannel() then operator delete
    OZChannel_dtor(this);
    // @ProChannel 0x1d217 — __ZdlPv is a runtime free; in TS the GC handles the storage.
  }

  /**
   * `OZChannelGammaFootage::getObjCWrapperName()` @ProChannel 0x1ccb4.
   *
   * DECODE (raw-port/re/disasm/ProChannel.OZChannelGammaFootage.getObjCWrapperName.s):
   *   0x1ccb8  leaq 0xc8151(%rip), %rax   ## rip-relative to an ObjC CFStringRef @+0xc8151
   *                                        ## next instr = 0x1ccbf, target = 0x1ccbf + 0xc8151
   *                                        ##                                = 0xe4e10
   *   0x1ccc0  ret
   *
   * The returned pointer is a CFStringRef literal in the __objc_cfstring section — the
   * exact C-string content is retrievable from the framework at file offset 0xe4e10 (the
   * `_CFString` struct there points to a __TEXT __cstring literal).  For a faithful port
   * we return the CFStringRef ADDRESS — decoding the actual CString bytes is a separate
   * step (frontier: ObjC CFString-literal reader).
   */
  getObjCWrapperName(): number {
    // @ProChannel 0x1ccb8 — CFStringRef @0xe4e10 (address arithmetic per above).
    return 0xe4e10;
  }

  /**
   * `OZChannelGammaFootage::clone() const` @ProChannel 0x1d21c.
   *
   * DECODE (raw-port/re/disasm/ProChannel.OZChannelGammaFootage.clone.s):
   *   0x1d223  save %rdi=this as %r14
   *   0x1d226  movl $0x98, %edi                       ## sizeof(OZChannelGammaFootage) = 0x98
   *   0x1d22b  callq __Znwm                           ## rax = new byte-buffer
   *   0x1d230  save %rax as %rbx                       ## save new-obj ptr
   *   0x1d239  xorl  %edx, %edx                       ## folder = nullptr
   *   0x1d23b  callq __ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(&src, nullptr)
   *   0x1d240..0x1d251 install vptrs (primary 0xd32b0 @+0x00, secondary 0xd3610 @+0x10)
   *   0x1d255  return rbx
   *   0x1d25d..0x1d26b unwind: __ZdlPv(rbx); __Unwind_Resume(exc)
   *
   * Net effect: allocate 0x98 bytes, invoke the OZChannel copy ctor (which duplicates the
   * base sub-object AND, by convention, the +0x70..+0x88 impl/info pointer pair — no deep
   * clone), install the OZChannelGammaFootage vtable pointers, and return the new instance.
   */
  clone(): OZChannelGammaFootage {
    // @ProChannel 0x1d226..0x1d22b — alloc 0x98 bytes.
    const cloned: OZChannelGammaFootage = Object.create(OZChannelGammaFootage.prototype);
    // @ProChannel 0x1d23b — OZChannel copy ctor(this, folder=null).
    OZChannel_copy_ctor(cloned, this, null);
    // @ProChannel 0x1d240..0x1d251 — vptr install (defaults are already the right values).
    cloned.vptr_primary = 0xd32b0;
    cloned.vptr_secondary = 0xd3610;
    return cloned;
  }
}
