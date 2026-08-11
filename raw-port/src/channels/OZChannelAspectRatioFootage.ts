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
 * OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageInfo() —
 * static lambda under `_OZChannelAspectRatioFootageInfo_once`, bound
 * through `std::__1::__call_once_proxy`. Populates the class-scoped
 * `_OZChannelAspectRatioFootageInfo` global (a pointer to an
 * OZChannelAspectRatioFootageInfo instance).
 *
 * Referenced by OZChannelAspectRatioFootage::C2 @0xbfd00-2f (once-flag +
 * proxy stub setup) and returned via a load of
 * `__ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageInfoE`
 * @0xbfd58-69. NOT yet decoded.
 */
function createOZChannelAspectRatioFootageInfo_default(): OZChannelInfo {
  throw new Error(
    "OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageInfo() " +
      "(lambda under __ZZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEvE37_OZChannelAspectRatioFootageInfo_once) " +
      "@Ozone — bound via " +
      "__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN27OZChannelAspectRatioFootage37createOZChannelAspectRatioFootageInfoEvEUlvE_EEEEEvPv. " +
      "Not yet decoded; populates " +
      "__ZN27OZChannelAspectRatioFootage32_OZChannelAspectRatioFootageInfoE " +
      "(loaded @0xbfd58 in the info-fixup 'else' branch).",
  );
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
      self.info = createOZChannelAspectRatioFootageInfo_default(); // frontier throw
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
