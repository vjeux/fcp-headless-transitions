// OZChannelAspectRatioFootage — the "footage aspect ratio" concrete
// OZChannel type in FCP's OZChannel family (Ozone framework).
//
// This class is a byte-for-byte structural twin of OZChannelAngle's
// double-taking constructor (see raw-port/src/channels/OZChannelAngle.ts
// `newDouble()` for the shared shape). Both derive from OZChannel, both
// spill xmm0 to -0x50(%rbp), both mirror-store on +0x70/+0x78 (impl)
// and +0x80/+0x88 (info), both install their own primary vptr at
// (this+0x0) via `VT+0x10` and their secondary vptr at (this+0x10) via
// `VT+0x370`, and both trail with `setDefaultValue(d)` +
// `setInitialValue(d, false)`. Only the class-scoped symbols differ:
// the factory-base free fn, the two once-guarded lambdas + their
// paired instance-pointer globals, and the class's own vtable/typeinfo.
//
// Framework: Ozone
// Provenance (raw-port/re/disasm/OZChannelAspectRatioFootage.OZChannelAspectRatioFootage.s):
//   OZChannelAspectRatioFootage(double, PCString&, OZChannelFolder*,
//                               u, u, OZChannelImpl*, OZChannelInfo*)
//                             @0x000bfc90  (__ZN27OZChannelAspectRatioFootageC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo)
// (The C1 complete-object variant is NOT emitted separately — this ctor is only
//  invoked as a base ctor. otool -tV shows only the C2 body @0xbfc90.)
//
// Callees / RIP-relative refs (each cited by its address in the ctor
// body; resolved via `resolve.py Ozone stub <addr>` + comment scans in
// otool -tV):
//   __Z42getOZChannelAspectRatioFootage_FactoryBasev
//                                              ; getOZChannelAspectRatioFootage_FactoryBase()
//                                              ; called @0xbfcbd via stub 0x6dd332
//   __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//                                              ; OZChannel base ctor (ProChannel-defined,
//                                              ;  U-extern in Ozone); called @0xbfce3 via
//                                              ;  stub 0x6df474
//   __ZTV27OZChannelAspectRatioFootage         ; this class's vtable
//                                              ;  (loaded @0xbfce8; primary+0x10, secondary+0x370)
//   __ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEvE37_OZChannelAspectRatioFootageInfo_once
//                                              ; std::once_flag for the class-scoped info
//                                              ;  singleton; read @0xbfd00, tested for -1
//   __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEvEUlvE_EEEEEvPv
//                                              ; std::__call_once_proxy stub bound to the
//                                              ;  info-creation lambda; taken @0xbfd24
//   __ZNSt3__111__call_onceERVmPvPFvS2_E        ; std::__1::__call_once entry point; called
//                                              ;  @0xbfd2f (info) and @0xbfd9f (impl) via
//                                              ;  stub 0x6dfb2e
//   __ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageInfoE
//                                              ; class-scoped info instance pointer;
//                                              ;  loaded @0xbfd58 (only in the "info arg == null"
//                                              ;  branch)
//   __ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEvE37_OZChannelAspectRatioFootageImpl_once
//                                              ; std::once_flag for the class-scoped impl
//                                              ;  singleton; read @0xbfd49 and @0xbfd70
//   __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEvEUlvE_EEEEEvPv
//                                              ; std::__call_once_proxy stub bound to the
//                                              ;  impl-creation lambda; taken @0xbfd94
//   __ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageImplE
//                                              ; class-scoped impl instance pointer;
//                                              ;  loaded @0xbfdb1 (only in the "impl arg == null"
//                                              ;  branch)
//   __ZN9OZChannel15setDefaultValueEd           ; OZChannel::setDefaultValue(d); called @0xbfdcb
//                                              ;  via stub 0x6df306
//   __ZN9OZChannel15setInitialValueEdb          ; OZChannel::setInitialValue(d, false); called
//                                              ;  @0xbfdda via stub 0x6df30c (esi=0 @0xbfdd8)
//   __ZN9OZChannelD2Ev                          ; OZChannel::~OZChannel() (unwind); called
//                                              ;  @0xbfdf4 via stub 0x6df480
//   __Unwind_Resume                             ; @0xbfdfc via stub 0x6dd07a
//
// STRUCT LAYOUT (from the ctor's field writes — matches OZChannelAngle):
//   +0x000  primary vptr        (= __ZTV27OZChannelAspectRatioFootage + 0x10)
//                                (stored @0xbfcf3)
//   +0x010  secondary vptr      (= __ZTV27OZChannelAspectRatioFootage + 0x370)
//                                (stored @0xbfcfc)
//   +0x070  OZChannelImpl* impl (mirror of +0x78)
//                                (stored @0xbfdbf: `movq %rax, 0x70(%rbx)`)
//   +0x078  OZChannelImpl* impl (initial slot; base ctor wrote here from caller arg
//                                or once-init'd default was stored at both +0x78 and
//                                +0x70; see the impl-fixup branch @0xbfda4-bf)
//   +0x080  OZChannelInfo* info (mirror of +0x88)
//                                (stored @0xbfd42 or @0xbfd69)
//   +0x088  OZChannelInfo* info (initial slot; base ctor wrote here or the once-init'd
//                                default was stored at both slots; see the info-fixup
//                                branch @0xbfd34-6f)
//   [rest of the layout inherited from OZChannel; not touched by this method]
//
// This is EXACTLY the pattern OZChannelAngle::newDouble uses (see that
// file's "static newDouble" doc block). All 96 lines of the ctor body
// agree with OZChannelAngle.C2EdRK.s byte-for-byte except for the
// class-name-scoped symbol tags (checked directly in
// re/disasm/OZChannelAspectRatioFootage.OZChannelAspectRatioFootage.s).

import type {
  OZChannelFolder,
  OZChannelImpl,
  OZChannelInfo,
  OZFactory,
} from "./OZChannelDouble";

// The class-scoped info singleton is an OZChannelAspectRatioFootageInfo (ProChannel 0x6780 C2,
// already ported); the initializer inlined into __invoke @ProChannel 0x673c constructs one.
// A VALUE import, not a type import — the initializer really calls that ctor.
import { OZChannelAspectRatioFootageInfo } from "./OZChannelAspectRatioFootageInfo";

// ------------------------------ Frontier stubs -------------------------------
//
// Everything below is a THROWing stub whose message cites the exact @0xADDR
// at which it is called (PORTING_SPEC Rule 3). Matches the convention
// established in OZChannelAngle.ts / OZChannelDouble.ts.

/**
 * External free function `__Z42getOZChannelAspectRatioFootage_FactoryBasev`
 * — U-extern in Ozone (defined in ProChannel). Returns the shared
 * OZFactory* for this concrete channel class.
 *
 * Called at @Ozone 0xbfcbd via stub 0x6dd332 from
 * OZChannelAspectRatioFootage::C2. NOT yet transcribed.
 */
function getOZChannelAspectRatioFootage_FactoryBase(): OZFactory {
  throw new Error(
    "getOZChannelAspectRatioFootage_FactoryBase() @Ozone U-extern " +
      "__Z42getOZChannelAspectRatioFootage_FactoryBasev " +
      "(defined in ProChannel; not yet transcribed) — called by " +
      "OZChannelAspectRatioFootage ctor @Ozone 0xbfcbd via stub 0x6dd332",
  );
}

/**
 * External `__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 * — OZChannel base ctor (ProChannel-defined, U-extern in Ozone). NOT yet transcribed.
 *
 * Called at @Ozone 0xbfce3 via stub 0x6df474 from OZChannelAspectRatioFootage::C2.
 */
function OZChannel_base_ctor(
  _self: OZChannelAspectRatioFootage,
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
      "(defined in ProChannel; not yet transcribed) — invoked by " +
      "OZChannelAspectRatioFootage ctor @Ozone 0xbfce3 via stub 0x6df474",
  );
}

/**
 * External `__ZN9OZChannel15setDefaultValueEd` — called @Ozone 0xbfdcb via
 * stub 0x6df306 from OZChannelAspectRatioFootage::C2. NOT yet transcribed.
 */
function OZChannel_setDefaultValue(
  _self: OZChannelAspectRatioFootage,
  _v: number,
): void {
  throw new Error(
    "OZChannel::setDefaultValue(double) @Ozone U-extern " +
      "__ZN9OZChannel15setDefaultValueEd (defined in ProChannel; not yet transcribed) " +
      "— invoked by OZChannelAspectRatioFootage ctor @Ozone 0xbfdcb via stub 0x6df306",
  );
}

/**
 * External `__ZN9OZChannel15setInitialValueEdb` — called @Ozone 0xbfdda via
 * stub 0x6df30c from OZChannelAspectRatioFootage::C2. The bool is always
 * `xorl %esi,%esi` @0xbfdd8 (i.e. false). NOT yet transcribed.
 */
function OZChannel_setInitialValue(
  _self: OZChannelAspectRatioFootage,
  _v: number,
  _keyframed: boolean,
): void {
  throw new Error(
    "OZChannel::setInitialValue(double, bool) @Ozone U-extern " +
      "__ZN9OZChannel15setInitialValueEdb (defined in ProChannel; not yet transcribed) " +
      "— invoked by OZChannelAspectRatioFootage ctor @Ozone 0xbfdda via stub 0x6df30c " +
      "(esi=0 @0xbfdd8 -> `false`)",
  );
}

/**
 * `OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageInfo()`
 *   — @ProChannel 0x6698
 *   — __ZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEv
 *
 * WAS a frontier throw-stub ("not yet decoded") for @ProChannel 0x6698; transcribed here.
 * The name keeps its `_default` suffix because the Ozone ctor's null-info branch calls it
 * through that name (see `newDouble` step F below) — same convention as the landed
 * `createOZChannelAspectRatioFootageImpl_default` twin directly beneath it.
 *
 * WHICH BINARY THIS ADDRESS IS IN, because this file's other citations are Ozone's: the class
 * is emitted into BOTH frameworks. Ozone carries the ctor (@0xbfc90) and inlines the once-guard
 * at its own call sites (once-flag + proxy setup @0xbfd00-2f, singleton load @0xbfd58-69) but
 * NOT this accessor as a standalone symbol; ProChannel emits the accessor @0x6698, its proxy
 * @0x672c and the (inlined) initializer inside `__invoke` @0x673c. ProChannel's is the only
 * copy that can be transcribed, and it is cited as such.
 *
 * Line-for-line transcription of the 20-line body. Every address below was re-derived from the
 * RAW BYTES of the thin x86_64 slice rather than from otool's symbolized column, because
 * `otool -tV` renders a RIP displacement (and an immediate) as a symbol name and that has
 * already produced a wrong constant in this repo:
 *
 *   0x6698  55                    pushq  %rbp
 *   0x6699  48 89 e5              movq   %rsp, %rbp
 *   0x669c  48 83 ec 20           subq   $0x20, %rsp        ; 32-byte frame: libc++ tuple<lambda&&>
 *   0x66a0  48 8b 05 09 51 0e 00  movq   0xe5109(%rip), %rax ; 0x66a7+0xe5109 = BSS 0xeb7b0 (once)
 *   0x66a7  48 83 f8 ff           cmpq   $-0x1, %rax        ; libc++ writes ~0UL on completion
 *   0x66ab  74 25                 je     0x66d2             ; fast path: skip __call_once
 *   0x66ad  48 8d 45 ff           leaq   -0x1(%rbp), %rax   ; the captureless lambda's 1-byte slot
 *   0x66b1  48 8d 4d e8           leaq   -0x18(%rbp), %rcx  ; the tuple<T&&> slot
 *   0x66b5  48 89 01              movq   %rax, (%rcx)       ; tuple.head = &lambda-slot
 *   0x66b8  48 8d 75 f0           leaq   -0x10(%rbp), %rsi  ; __call_once's `void* arg`
 *   0x66bc  48 89 0e              movq   %rcx, (%rsi)       ; *arg = &tuple
 *   0x66bf  48 8d 3d ea 50 0e 00  leaq   0xe50ea(%rip), %rdi ; 0x66c6+0xe50ea = BSS 0xeb7b0 (&once)
 *   0x66c6  48 8d 15 5f 00 00 00  leaq   0x5f(%rip), %rdx   ; 0x66cd+0x5f = 0x672c (the proxy)
 *   0x66cd  e8 f6 66 0a 00        callq  0xacdc8            ; 0x66d2+0xa66f6 = stub std::__call_once
 *   0x66d2  48 8d 05 df 5b 0e 00  leaq   0xe5bdf(%rip), %rax ; 0x66d9+0xe5bdf = BSS 0xec2b8 (&global)
 *   0x66d9  48 8b 00              movq   (%rax), %rax       ; the return value: the singleton pointer
 *   0x66dc  48 83 c4 20           addq   $0x20, %rsp
 *   0x66e0  5d                    popq   %rbp
 *   0x66e1  c3                    retq
 *
 * The stack tuple at 0x66ad..0x66bc is an ABI artefact of libc++'s `__call_once` template
 * instantiation — two levels of indirection so the proxy can find a captureless lambda that has
 * no state to find. It has no observable effect, and the model below calls the proxy directly,
 * exactly as the landed Impl twin does.
 *
 * MEASURED AGAINST THE LIVE BINARY (raw-port/re/oracle/OZChannelAspectRatioFootage_createInfo_probe.py,
 * `arch -x86_64 /usr/bin/python3`, ProChannel slide 0x10a641000, 10/10 checks PASS). The symbol is
 * a LOCAL (`t`) so it was called by address at slide+0x6698, and the probe first asserts the 19
 * opcode bytes above are the ones actually mapped:
 *   before   once @0xeb7b0 = 0            singleton @0xec2b8 = NULL
 *   call #1  returns 0x60000392c060      once -> 0xffffffffffffffff, singleton == the return value
 *   call #2  returns 0x60000392c060      once unchanged (the fast path at 0x66ab is taken)
 *   object   +0x00 = 0xccaa8+slide (OZChannelAspectRatioFootageInfo vtable, written by C2 @0x67ce)
 *            +0x50 = 0xccac8+slide (PCSingleton sub-object vtable, written by C2 @0x67d8)
 * That last pair is what proves the initializer below really is `operator new(0x58)` + C2 @0x6780
 * rather than something that merely returns a pointer. What the trace REFUTES is the `=== 1`
 * sentinel of the 2026-07-29 call_once cheat (the flag reads ~0UL, never 1); what it CANNOT
 * separate is `!== -1n` from `!== 0n`, since a single 0 -> ~0 transition satisfies both — the
 * `-1` in the port comes from the `cmpq $-0x1` encoding at 0x66a7 (bytes `48 83 f8 ff`), not
 * from the trace.
 */
function createOZChannelAspectRatioFootageInfo_default(): OZChannelInfo {
  // @0x66a0-0x66ab — the libc++ fast path: once == ~0UL means init already completed.
  if (_OZChannelAspectRatioFootageInfo_once !== -1n) {
    // @0x66ad-0x66cd — marshal the tuple and call std::__1::__call_once(&once, arg, proxy)
    //   through ProChannel stub 0xacdc8 (libc++, a TRUE out-of-scope extern).
    std_call_once_AspectRatioFootageInfo();
  }
  // @0x66d2-0x66d9 — return the global the initializer wrote (leaq &global, then deref).
  if (_OZChannelAspectRatioFootageInfo === null) {
    throw new Error(
      "OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageInfo() @ProChannel " +
        "0x6698 completed std::__call_once without the initializer writing " +
        "__ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageInfoE (BSS 0xec2b8) — " +
        "the load @0x66d9 would return NULL.",
    );
  }
  // The C++ return is an implicit derived-to-base pointer conversion: the global holds an
  // `OZChannelAspectRatioFootageInfo*` (built by the initializer below) and every consumer —
  // the ctor's +0x80/+0x88 slots — types it as `OZChannelInfo*`. `OZChannelInfo` in this file is
  // the OPAQUE BRAND from OZChannelDouble.ts (`{ readonly __brand }`), structurally unrelated to
  // the concrete class, so the upcast has to be spelled out for tsc. No value is changed.
  return _OZChannelAspectRatioFootageInfo as unknown as OZChannelInfo;
}

/**
 * @ProChannel BSS 0xeb7b0
 * `__ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEvE37_OZChannelAspectRatioFootageInfo_once`
 * — the libc++ `std::once_flag` word read @0x6698's 0x66a0 and address-taken @0x66bf (both
 * displacements resolve to 0xeb7b0). 0n = not started, -1n (~0UL) = completed, which is the only
 * value the accessor's fast path @0x66a7 tests for. BSS is zero-filled at load, so it starts 0n —
 * measured 0 before the first live call and 0xffffffffffffffff after it.
 */
let _OZChannelAspectRatioFootageInfo_once: bigint = 0n; // @ProChannel 0x66a0 read-site

/**
 * @ProChannel BSS 0xec2b8
 * `__ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageInfoE` — the singleton pointer,
 * address-taken @0x66d2 and dereferenced @0x66d9 as the accessor's return value, and written by
 * the initializer @0x6765. Zero-filled at load, i.e. nullptr. Also read by the Ozone ctor's
 * info-fixup 'else' branch @0xbfd58.
 *
 * Typed as the CONCRETE class rather than the `OZChannelInfo` brand because that is what the
 * initializer stores (`operator new(0x58)` + `OZChannelAspectRatioFootageInfoC2Ev`); the accessor
 * widens it to the brand on return, which is the C++ upcast.
 */
let _OZChannelAspectRatioFootageInfo: OZChannelAspectRatioFootageInfo | null = null; // @ProChannel 0x66d2

/**
 * `std::__1::__call_once(flag&, void*, void(*)(void*))` — libc++, reached through ProChannel stub
 * 0xacdc8 @0x66cd. A TRUE out-of-scope extern; there is no libc++ runtime here, so the contract
 * the accessor depends on is modelled: run the initializer once, and write ~0UL into the flag ONLY
 * on success. If the initializer raises, the flag stays 0 and a later call retries — which is what
 * the real runtime does, and why the fast-path test @0x66a7 is against -1 rather than "non-zero".
 *
 * THE INITIALIZER IS TRANSCRIBED HERE, not deferred, and that is the one place this function
 * departs from its landed Impl twin. For the Impl the lambda body is its own out-of-line symbol
 * (`__ZZN27...createOZChannelAspectRatioFootageImplEvENKUlvE_clEv` @0x6890, a separate ledger
 * unit). For the Info the compiler INLINED the lambda into the libc++ template instantiation
 *   __ZNSt3__18__invokeB9nqe210106IJZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEvEUlvE_EEE...
 * @ProChannel 0x673c — there is no `...NKUlvE_clEv` symbol for Info at all (checked in
 * army/inventory/ProChannel.syms.txt: 0x672c proxy, 0x673c __invoke, then 0x6780 is already the
 * Info ctor). STL template instantiations are auto-filtered out of the port queue, so deferring
 * to "a separate ledger unit" would defer to a unit that can never be claimed, and its only
 * in-scope callee — `OZChannelAspectRatioFootageInfo::OZChannelAspectRatioFootageInfo()`
 * @ProChannel 0x6780 — is ALREADY PORTED (raw-port/src/channels/OZChannelAspectRatioFootageInfo.ts),
 * so a throw here would be a throw-stub for a ported in-scope callee.
 *
 *   0x672c  proxy:  pushq %rbp / movq %rsp,%rbp / movq (%rdi),%rax / movq (%rax),%rdi /
 *                   popq %rbp / jmp 0x673c            ; unpacks tuple<lambda&&> -> __invoke
 *   0x673c  55 48 89 e5           pushq %rbp / movq %rsp,%rbp
 *   0x6740  41 56 53              pushq %r14 / pushq %rbx
 *   0x6743  4c 8d 35 6e 5b 0e 00  leaq  0xe5b6e(%rip),%r14   ; 0x674a+0xe5b6e = BSS 0xec2b8
 *   0x674a  49 83 3e 00           cmpq  $0x0, (%r14)         ; already published?
 *   0x674e  75 18                 jne   0x6768               ; yes -> return, allocate nothing
 *   0x6750  bf 58 00 00 00        movl  $0x58, %edi          ; sizeof(OZChannelAspectRatioFootageInfo)
 *   0x6755  e8 f2 66 0a 00        callq 0xace4c              ; stub for operator new (__Znwm)
 *   0x675a  48 89 c3              movq  %rax, %rbx
 *   0x675d  48 89 c7              movq  %rax, %rdi
 *   0x6760  e8 1b 00 00 00        callq 0x6780               ; OZChannelAspectRatioFootageInfo::C2
 *   0x6765  49 89 1e              movq  %rbx, (%r14)         ; publish the singleton
 *   0x6768  5b 41 5e 5d c3        popq %rbx / popq %r14 / popq %rbp / retq
 *   unwind pad @0x676d: movq %rax,%r14 / movq %rbx,%rdi / callq 0xace04 (operator delete) /
 *                       movq %r14,%rdi / callq 0xacaf2 (_Unwind_Resume) — i.e. if C2 throws, the
 *                       0x58-byte allocation is freed and the exception propagates WITHOUT the
 *                       store @0x6765, so the global stays NULL. In TS the allocation is garbage
 *                       collected and the exception propagates; the effect on the global (never
 *                       written) is the same, and __call_once then leaves the flag at 0.
 */
function std_call_once_AspectRatioFootageInfo(): void {
  if (_OZChannelAspectRatioFootageInfo_once === -1n) return; // libc++ fast path
  // ---- the initializer, @0x673c-0x6768 ----------------------------------------------------
  // @0x6743-0x674e — r14 = &global; if it is already non-null, allocate nothing and return.
  if (_OZChannelAspectRatioFootageInfo === null) {
    // @0x6750-0x6760 — operator new(0x58) (stub 0xace4c) then
    //   __ZN31OZChannelAspectRatioFootageInfoC2Ev @0x6780. The ported C2 raises while its own
    //   base (OZChannelInfo) is a frontier class; that raise is that class's gap, not this one's,
    //   and it correctly leaves the flag at 0 through the `once.set(-1n)` below being skipped.
    const created = new OZChannelAspectRatioFootageInfo();
    // @0x6765 — publish: *(&global) = the new object.
    _OZChannelAspectRatioFootageInfo = created;
  }
  // libc++ writes ~0UL into the flag only after the initializer returns normally (@0x66a7's
  // sentinel). A throw above skips this line, exactly like the real runtime.
  _OZChannelAspectRatioFootageInfo_once = -1n;
}

/**
 * `OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageImpl()`
 *   — @ProChannel 0x66e2
 *   — __ZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEv
 *
 * WHICH BINARY THIS ADDRESS IS IN, because this file's other citations are Ozone's.
 * The class is emitted into BOTH frameworks. Ozone carries the ctor (@0xbfc90) and the
 * `__call_once_proxy` instantiation (@0xbff70) but NOT this accessor as a standalone
 * symbol; ProChannel emits all three — the accessor @0x66e2, its proxy @0x687f and the
 * lambda body @0x6890. So the only copy that can be transcribed is ProChannel's, and it
 * is cited as such. The Ozone call sites this function serves (@0xbfdb1 in the ctor's
 * impl-fixup branch) are unchanged and still cited below.
 *
 * Line-for-line transcription of the 20-line body — the standard libc++
 * `std::call_once`-guarded singleton accessor, the same shape as the landed
 * `OZChannelAngleOverRange_Factory::getInstance()` @ProChannel 0x2404:
 *
 *   0x66e2  pushq  %rbp
 *   0x66e3  movq   %rsp, %rbp
 *   0x66e6  subq   $0x20, %rsp            ; 32-byte frame: the libc++ tuple<lambda&&>
 *   0x66ea  movq   _..._once(%rip), %rax  ; rax = the once_flag word
 *   0x66f1  cmpq   $-0x1, %rax            ; libc++ writes ~0UL on completion
 *   0x66f5  je     0x671c                 ; fast path: skip call_once
 *   0x66f7  leaq   -0x1(%rbp), %rax       ; the empty captureless lambda's 1-byte slot
 *   0x66fb  leaq   -0x18(%rbp), %rcx      ; the tuple<T&&> slot
 *   0x66ff  movq   %rax, (%rcx)           ; tuple.head = &lambda-slot
 *   0x6702  leaq   -0x10(%rbp), %rsi      ; call_once's `void* arg`
 *   0x6706  movq   %rcx, (%rsi)           ; *arg = &tuple
 *   0x6709  leaq   _..._once(%rip), %rdi  ; rdi = &once_flag
 *   0x6710  leaq   __call_once_proxy<...>(%rip), %rdx   ; the proxy @0x687f
 *   0x6717  callq  0xacdc8                ; symbol stub for std::__1::__call_once
 *   0x671c  leaq   _OZChannelAspectRatioFootageImpl(%rip), %rax
 *   0x6723  movq   (%rax), %rax           ; the return value: the singleton pointer
 *   0x6726  addq   $0x20, %rsp
 *   0x672a  popq   %rbp
 *   0x672b  retq
 *
 * The stack tuple at 0x66f7..0x6706 is an ABI artefact of libc++'s `__call_once`
 * template instantiation — two levels of indirection so the proxy can find a captureless
 * lambda that has no state to find. It has no observable effect, and the model below
 * calls the proxy directly, exactly as the landed `getInstance()` port does.
 *
 * FRONTIER, and it is not this unit: the lambda body
 * `__ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEvENKUlvE_clEv`
 * @ProChannel 0x6890 and its proxy @0x687f are SEPARATE ledger units
 * (`depgraph.py deps` lists no in-scope dependency for this symbol, because the proxy is
 * passed as DATA — a function pointer — and never appears as a call target). Until they
 * are claimed, the initializer raises citing both addresses, which is what makes the gap
 * visible to depgraph instead of silently returning a fabricated pointer.
 */
function createOZChannelAspectRatioFootageImpl_default(): OZChannelImpl {
  // @0x66ea-0x66f5 — the libc++ fast path: once == ~0UL means init already completed.
  if (_OZChannelAspectRatioFootageImpl_once !== -1n) {
    // @0x66f7-0x6717 — marshal the tuple and call std::__1::__call_once(&once, arg, proxy)
    //   through ProChannel stub 0xacdc8 (libc++, a TRUE out-of-scope extern).
    std_call_once_AspectRatioFootageImpl();
  }
  // @0x671c-0x6723 — return the global the initializer wrote.
  if (_OZChannelAspectRatioFootageImpl === null) {
    throw new Error(
      "OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageImpl() @ProChannel " +
        "0x66e2 completed std::__call_once without the initializer writing " +
        "__ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageImplE — the load " +
        "@0x6723 would return NULL.",
    );
  }
  return _OZChannelAspectRatioFootageImpl;
}

/**
 * @ProChannel BSS
 * `__ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEvE37_OZChannelAspectRatioFootageImpl_once`
 * — the libc++ `std::once_flag` word read @0x66ea. 0n = not started, -1n (~0UL) =
 * completed, which is the only value the accessor's fast path @0x66f1 tests for. BSS is
 * zero-filled at load, so it starts 0n.
 */
let _OZChannelAspectRatioFootageImpl_once: bigint = 0n; // @ProChannel 0x66ea read-site

/**
 * @ProChannel BSS `__ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageImplE`
 * — the singleton pointer, loaded @0x671c-0x6723 as the return value and written by the
 * initializer lambda. Zero-filled at load, i.e. nullptr.
 */
let _OZChannelAspectRatioFootageImpl: OZChannelImpl | null = null; // @ProChannel 0x671c

/**
 * `std::__1::__call_once(flag&, void*, void(*)(void*))` — libc++, reached through
 * ProChannel stub 0xacdc8 @0x6717. A TRUE out-of-scope extern; there is no libc++ runtime
 * here, so the contract the accessor actually depends on is modelled: run the initializer
 * once, and write ~0UL into the flag ONLY on success. If the initializer raises, the flag
 * stays 0 and a later call retries — which is what the real runtime does, and why the
 * fast-path test @0x66f1 is against -1 rather than "non-zero".
 *
 * The initializer itself (the lambda @0x6890 through the proxy @0x687f) is a separate
 * ledger unit, so it raises citing both addresses rather than fabricating a pointer.
 */
function std_call_once_AspectRatioFootageImpl(): void {
  if (_OZChannelAspectRatioFootageImpl_once === -1n) return; // libc++ fast path
  throw new Error(
    "OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageImpl()'s once-init " +
      "lambda is not yet transcribed @ProChannel 0x6890 " +
      "(__ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEvENKUlvE_clEv), " +
      "reached through the libc++ proxy @ProChannel 0x687f " +
      "(__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageImplEvEUlvE_EEEEEvPv) " +
      "from std::__1::__call_once @ProChannel 0x6717 (stub 0xacdc8). It allocates the " +
      "OZChannelAspectRatioFootageImpl singleton and stores it into " +
      "__ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageImplE, which the " +
      "accessor then loads @0x6723. Both are separate ledger units.",
  );
}

// -----------------------------------------------------------------------------

/**
 * OZChannelAspectRatioFootage — concrete "footage aspect ratio" channel.
 *
 * Layout (partial — mirrors OZChannelAngle):
 *   +0x00  primary vptr (implicit in JS)
 *   +0x10  secondary vptr (implicit in JS)
 *   +0x70  impl mirror
 *   +0x78  impl initial (base-ctor slot)
 *   +0x80  info mirror
 *   +0x88  info initial (base-ctor slot)
 *
 * We model this with two direct properties (impl, info) since the
 * initial and mirror slots always hold the same pointer after the
 * ctor finishes (the ctor either mirrors down (+0x88 -> +0x80,
 * +0x78 -> +0x70) or writes the once-init'd singleton to BOTH slots).
 * If a future decode surfaces a code path that legitimately
 * distinguishes the two slots, we'll split the field then.
 */
export class OZChannelAspectRatioFootage {
  /**
   * OZChannelImpl* at C++ offset +0x70/+0x78. Both slots are always
   * equal after the ctor completes (either both = the caller arg,
   * mirrored down @0xbfdab-bf; or both = the once-init'd default,
   * stored at +0x78 then mirrored to +0x70 @0xbfdb8-bf).
   */
  impl!: OZChannelImpl;

  /**
   * OZChannelInfo* at C++ offset +0x80/+0x88. Same pattern as impl
   * — mirrored down (@0xbfd3b-42) or default-stored to both (@0xbfd62-69).
   */
  info!: OZChannelInfo;

  /**
   * OZChannelAspectRatioFootage::OZChannelAspectRatioFootage(
   *   double initialValue, PCString const& name, OZChannelFolder* folder,
   *   unsigned int uint1, unsigned int uint2, OZChannelImpl* impl,
   *   OZChannelInfo* info)   @Ozone 0xbfc90.
   *
   * Full faithful transcription of the ctor body — see the file-level
   * comment above for the address-by-address disassembly annotation.
   *
   * SysV register bindings recovered from the prologue (@0xbfc90-b9):
   *   xmm0 = initialValue          (spilled to -0x50(%rbp) @0xbfcb1)
   *   rsi  = name (PCString&)      (saved to r14 @0xbfcae)
   *   rdx  = folder                (saved to r13 @0xbfcab)
   *   ecx  = uint1                 (spilled to -0x44(%rbp) @0xbfca8)
   *   r8d  = uint2                 (spilled to -0x48(%rbp) @0xbfca4)
   *   r9   = impl                  (saved to r15 @0xbfca1; ALSO saved to
   *                                 -0x58(%rbp) @0xbfcc7 for the
   *                                 impl-null test @0xbfda4)
   *   rdi  = this                  (saved to rbx @0xbfcb6)
   *   0x10(%rbp) = info (7th arg,  (loaded to r12 @0xbfcb9; the SAME
   *                     SysV stack)  stack slot is re-read @0xbfd34 for
   *                                  the info-null test)
   *
   * Body:
   *   Step A — get factory. @0xbfcbd. → rax.
   *   Step B — set up base-ctor call frame:
   *     8(%rsp) = info (r12)    @0xbfcc2
   *     (%rsp)  = impl (r15)    @0xbfccb
   *     Save r15 to -0x58(%rbp) @0xbfcc7 (for the later impl-null test).
   *     Register args:
   *       rdi=this (rbx), rsi=factory (rax), rdx=name (r14), rcx=folder (r13),
   *       r8d=uint1 (from -0x44), r9d=uint2 (from -0x48).
   *   Step C — call OZChannel::OZChannel base ctor. @0xbfce3.
   *   Step D — install this-class vptrs:
   *     rax = &__ZTV27OZChannelAspectRatioFootage @0xbfce8.
   *     rcx = rax + 0x10; (this+0x00) = rcx.  @0xbfcef-f3.
   *     rax += 0x370; (this+0x10) = rax.  @0xbfcf6-fc.
   *   Step E — once-init the info singleton (fast-path skip if once flag
   *     == -1 sentinel):  @0xbfd00-32.
   *     If flag != -1: setup `-0x40(%rbp) = -0x29(%rbp)`, `-0x38(%rbp) =
   *       &-0x40(%rbp)`, load once-flag ptr into rdi, load proxy stub ptr
   *       into rdx, rsi = &-0x38(%rbp); call __call_once.
   *     Else skip.
   *   Step F — info-slot fixup. @0xbfd34-6f.
   *     `cmpq $0x0, 0x10(%rbp)` — test the STACK slot holding the info arg.
   *     If info != NULL: (this+0x80) = (this+0x88) (mirror down). @0xbfd3b-42.
   *     Else: load _OZChannelAspectRatioFootageInfo, store to (this+0x88)
   *       AND (this+0x80). @0xbfd58-6f.
   *   Step G — once-init the impl singleton (twice-gated: cmpq $-1 in both
   *     the "info was non-null" branch @0xbfd49-56 and the "info was null"
   *     branch @0xbfd70-7b). If flag == -1 in the current branch, jump
   *     over the __call_once setup; else run the same proxy pattern as
   *     Step E, using the impl-scoped once flag + proxy stub. @0xbfd7d-a3.
   *   Step H — impl-slot fixup. @0xbfda4-bf.
   *     `cmpq $0x0, -0x58(%rbp)` — test the SAVED r15 (impl arg).
   *     If impl != NULL: rax = (this+0x78) (mirror source). @0xbfda4-af.
   *     Else: load _OZChannelAspectRatioFootageImpl, store to (this+0x78)
   *       @0xbfdb1-b8, then rax retains that value.
   *     `movq %rax, 0x70(%rbx)` @0xbfdbf — mirror to (this+0x70).
   *   Step I — trailing set-values. @0xbfdc3-dd.
   *     `movq %rbx, %rdi ; movsd -0x50(%rbp), %xmm0 ; callq
   *      OZChannel::setDefaultValue(this, initialValue)` @0xbfdcb.
   *     `movq %rbx, %rdi ; movsd -0x50(%rbp), %xmm0 ; xorl %esi,%esi ;
   *      callq OZChannel::setInitialValue(this, initialValue, false)`
   *      @0xbfdd8-dda.
   *
   *   Exception path @0xbfdee-fc:
   *     `movq %rax, %r14 ; movq %rbx, %rdi ; callq OZChannel::~OZChannel()
   *      @0xbfdf4 ; movq %r14, %rdi ; callq __Unwind_Resume` @0xbfdfc.
   *   (In TS we let the exception propagate naturally; GC handles the
   *    partially-constructed base subobject once it's unreachable.)
   *
   * Named as a static factory (`newDouble`) to match OZChannelAngle's
   * TS convention — the C++ ctor is a base-ctor (C2), which we surface
   * in TS as an explicit construct-and-return step.
   */
  static newDouble(
    initialValue: number,
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelAspectRatioFootage {
    const self = new OZChannelAspectRatioFootage();

    // Step A — @0xbfcbd.
    const factory = getOZChannelAspectRatioFootage_FactoryBase(); // frontier throw

    // Steps B-C — @0xbfce3.
    OZChannel_base_ctor(
      self,
      factory,
      name,
      folder,
      uint1,
      uint2,
      impl,
      info,
    );
    // Step D — vptrs (implicit in JS).

    // Steps E-F — info fixup.  @0xbfd34 tests 0x10(%rbp) (stack info arg).
    if (info !== null) {
      // Mirror +0x88 -> +0x80.  @0xbfd3b-42.
      self.info = info;
    } else {
      // Load the once-init'd _OZChannelAspectRatioFootageInfo and store
      // to both slots (mirror equal).  @0xbfd58-6f.
      self.info = createOZChannelAspectRatioFootageInfo_default(); // -> the @ProChannel 0x6698 accessor
    }

    // Steps G-H — impl fixup.  @0xbfda4 tests -0x58(%rbp) (saved r15).
    if (impl !== null) {
      // Mirror +0x78 -> +0x70.  @0xbfdab-bf.
      self.impl = impl;
    } else {
      // Load the once-init'd _OZChannelAspectRatioFootageImpl and store
      // to both slots.  @0xbfdb1-bf.
      self.impl = createOZChannelAspectRatioFootageImpl_default(); // frontier throw
    }

    // Step I — trailing set-values.
    //   @0xbfdcb — OZChannel::setDefaultValue(this, initialValue).
    OZChannel_setDefaultValue(self, initialValue); // frontier throw
    //   @0xbfdda — OZChannel::setInitialValue(this, initialValue, false).
    //     `xorl %esi,%esi` @0xbfdd8 forces the bool = false.
    OZChannel_setInitialValue(self, initialValue, false); // frontier throw

    return self;
  }
}
