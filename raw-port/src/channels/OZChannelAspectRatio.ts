// OZChannelAspectRatio — the "aspect ratio" channel in FCP's OZChannel family.
// Structurally identical to OZChannelAngle / OZChannelScale / OZChannelShear: a
// thin derived class that (a) calls the OZChannel base ctor via the class's
// FactoryBase, (b) installs primary + secondary vptrs, and (c) once-guards a
// per-class default Info and Impl singleton that fill the (+0x80/+0x88) and
// (+0x70/+0x78) slots when the caller passes nullptr.
//
// Framework: Ozone
// Provenance (raw-port/re/disasm/OZChannelAspectRatio.*.s):
//   OZChannelAspectRatio(PCString&, OZChannelFolder*, u, u, OZChannelImpl*, OZChannelInfo*)
//                                                      @0x0030c150
//     __ZN20OZChannelAspectRatioC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//
// (The FCP Ozone symbol table lists exactly this ONE T-symbol under
//  `__ZN20OZChannelAspectRatio*` outside of the Info subclass — no
//  `_C2Ed...` (double-initial variant), no createChannelCurve helper, no
//  static factory. This class only exposes one ctor.)
//
// Callees / RIP-relative refs (resolve.py Ozone stub / const <addr>):
//   __Z35getOZChannelAspectRatio_FactoryBasev                (@0x30c174 stub 0x6dd308)
//   __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//                                                            (@0x30c19d stub 0x6df474)
//   __ZTV20OZChannelAspectRatio                              (@0x30c1a2 lit-pool sym addr)
//                                                             — primary vptr slot: +0x10
//                                                             — secondary vptr slot: +0x370
//   __ZZN20OZChannelAspectRatio30createOZChannelAspectRatioInfoEvE30_OZChannelAspectRatioInfo_once
//                                                            (@0x30c1ba call-once flag)
//   __ZNSt3__117__call_once_proxyB9nqe210106<...createOZChannelAspectRatioInfo...>Pv
//                                                            (@0x30c1de proxy fn)
//   __ZNSt3__111__call_onceERVmPvPFvS2_E                     (@0x30c1e9 stub 0x6dfb2e)
//   __ZN20OZChannelAspectRatio25_OZChannelAspectRatioInfoE   (@0x30c212 lit-pool sym addr)
//   __ZZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEvE30_OZChannelAspectRatioImpl_once
//                                                            (@0x30c203 / @0x30c22a call-once flag)
//   __ZNSt3__117__call_once_proxyB9nqe210106<...createOZChannelAspectRatioImpl...>Pv
//                                                            (@0x30c24e proxy fn)
//   __ZN20OZChannelAspectRatio25_OZChannelAspectRatioImplE   (@0x30c26b lit-pool sym addr)
//   __ZN9OZChannelD2Ev                                        (@0x30c292 stub 0x6df480, unwind path)
//   __Unwind_Resume                                           (@0x30c29a stub 0x6dd07a, unwind path)
//
// STRUCT LAYOUT (from the ctor body — partial):
//   +0x000  primary vptr        (=vtable[OZChannelAspectRatio]+0x10)
//   +0x010  secondary vptr      (=vtable[OZChannelAspectRatio]+0x370)
//   +0x070  OZChannelImpl*  impl  (mirror of +0x78; @0x30c279 unconditional store)
//   +0x078  OZChannelImpl*  impl  (initial slot; base ctor writes here from caller arg;
//                                   @0x30c275 fallback store from singleton when caller was null)
//   +0x080  OZChannelInfo*  info  (mirror of +0x88; @0x30c1fc and @0x30c223 stores)
//   +0x088  OZChannelInfo*  info  (initial slot; base ctor writes here; @0x30c21c fallback store)
//   [rest of the layout inherited from OZChannel; not touched by this method]
//
// The mirror-write pattern (writing the same pointer to both +0x70/+0x78 or
// +0x80/+0x88) matches OZChannelAngle exactly — see the header of
// OZChannelAngle.ts for the family-wide convention.

import type {
  OZChannelFolder,
  OZChannelImpl,
  OZChannelInfo,
  OZFactory,
} from './OZChannelDouble';

// -------------------------------- Frontier stubs -------------------------------
//
// Every callee below is a THROWing stub whose message cites the exact @0xADDR at
// which it is invoked. Each represents an un-decoded callee we transcribe as a
// "demand signal" rather than fabricating a body. Matches the OZChannelAngle
// convention already established in this project.

/** External free function `__Z35getOZChannelAspectRatio_FactoryBasev` @Ozone stub 0x6dd308.
 *  Called @0x30c174. NOT yet decoded. Returns an `OZFactory*` used to seed the base ctor. */
function getOZChannelAspectRatio_FactoryBase(): OZFactory {
  throw new Error(
    'getOZChannelAspectRatio_FactoryBase() @Ozone stub 0x6dd308 ' +
      '(__Z35getOZChannelAspectRatio_FactoryBasev) not yet transcribed — ' +
      'called by OZChannelAspectRatio ctor @0x30c174',
  );
}

/** External `__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 *  — OZChannel base ctor (ProChannel-defined). Called from the ctor @0x30c19d
 *  (stub 0x6df474). Matches the OZChannelAngle usage exactly. */
function OZChannel_base_ctor(
  _self: OZChannelAspectRatio,
  _factory: OZFactory,
  _name: string,
  _folder: OZChannelFolder | null,
  _uint1: number,
  _uint2: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    'OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, uint, uint, ' +
      'OZChannelImpl*, OZChannelInfo*) @Ozone stub 0x6df474 ' +
      '(__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo) ' +
      'not yet transcribed — invoked by OZChannelAspectRatio ctor @0x30c19d',
  );
}

/** OZChannelAspectRatio::createOZChannelAspectRatioInfo() — lambda under
 *  `_OZChannelAspectRatioInfo_once`, bound through `std::__call_once_proxy`. Populates the
 *  `_OZChannelAspectRatioInfo` global pointer. Referenced by the ctor @0x30c1ba (once flag),
 *  @0x30c1d7 (once-flag address load), @0x30c1de (proxy fn address load), and @0x30c1e9
 *  (call_once entry). NOT yet decoded. */
function createOZChannelAspectRatioInfo_default(): OZChannelInfo {
  throw new Error(
    "OZChannelAspectRatio::createOZChannelAspectRatioInfo() (lambda under " +
      "_OZChannelAspectRatioInfo_once) @Ozone — bound via " +
      "__ZNSt3__117__call_once_proxyB9nqe210106<...OZChannelAspectRatio::createOZChannelAspectRatioInfo::lambda...>Pv " +
      "(@0x30c1de), not yet decoded; populates " +
      "__ZN20OZChannelAspectRatio25_OZChannelAspectRatioInfoE (loaded @0x30c212).",
  );
}

/** OZChannelAspectRatio::createOZChannelAspectRatioImpl() — lambda under
 *  `_OZChannelAspectRatioImpl_once`, bound through `std::__call_once_proxy`. Populates the
 *  `_OZChannelAspectRatioImpl` global pointer. Referenced by the ctor @0x30c203/@0x30c22a
 *  (once flag), @0x30c247 (once-flag address load), @0x30c24e (proxy fn address load),
 *  and @0x30c259 (call_once entry). NOT yet decoded. */
function createOZChannelAspectRatioImpl_default(): OZChannelImpl {
  throw new Error(
    "OZChannelAspectRatio::createOZChannelAspectRatioImpl() (lambda under " +
      "_OZChannelAspectRatioImpl_once) @Ozone — bound via " +
      "__ZNSt3__117__call_once_proxyB9nqe210106<...OZChannelAspectRatio::createOZChannelAspectRatioImpl::lambda...>Pv " +
      "(@0x30c24e), not yet decoded; populates " +
      "__ZN20OZChannelAspectRatio25_OZChannelAspectRatioImplE (loaded @0x30c26b).",
  );
}

// -----------------------------------------------------------------------------

/**
 * OZChannelAspectRatio — see file header. The class body is the single ctor.
 * No other T-symbols exist in the Ozone symbol table under this class outside
 * of the Info subclass (OZChannelAspectRatioInfo, ported separately).
 *
 * NB: TS does NOT extend `OZChannel` here — the base ctor is a frontier stub
 * (see OZChannel_base_ctor above @0x30c19d), so extending would only pull in
 * fields we cannot yet populate faithfully. We model the two derived vptr
 * slots implicitly and store the `info` / `impl` pointers directly (matching
 * the OZChannelAngle / OZChannelScale / OZChannelShear convention).
 */
export class OZChannelAspectRatio {
  /** Primary vptr — @0x30c1a2..0x30c1ad stores `__ZTV20OZChannelAspectRatio + 0x10` at (this+0).
   *  Implicit in TS. */
  // (vtable slot is implicit)

  /** Secondary vptr — @0x30c1b0..0x30c1b6 stores `__ZTV20OZChannelAspectRatio + 0x370` at
   *  (this+0x10). Implicit in TS. */
  // (secondary vtable slot is implicit)

  /** OZChannelImpl* at C++ offset +0x70. Set by the ctor from either the caller arg (mirror of
   *  +0x78) or the once-guarded `_OZChannelAspectRatioImpl` global. @Ozone write: 0x30c279. */
  impl!: OZChannelImpl;

  /** OZChannelInfo* at C++ offset +0x80. Same pattern as `impl` but at +0x80/+0x88.
   *  @Ozone writes: 0x30c1fc (mirror path) and 0x30c223 (fallback path). */
  info!: OZChannelInfo;

  /**
   * OZChannelAspectRatio::OZChannelAspectRatio(PCString const& name,
   *   OZChannelFolder* folder, unsigned int uint1, unsigned int uint2,
   *   OZChannelImpl* impl, OZChannelInfo* info) @0x0030c150.
   *
   * Faithful transcription (see re/disasm/OZChannelAspectRatio.OZChannelAspectRatio.s):
   *   1. Save regs: r9=impl -> r15 (@0x30c161); r8d=uint2 -> spilled -0x44(%rbp) (@0x30c164);
   *      ecx=uint1 -> r12d (@0x30c168); rdx=folder -> r13 (@0x30c16b); rsi=name -> r14
   *      (@0x30c16e); rdi=this -> rbx (@0x30c171). Stack-arg `info` remains at 0x10(%rbp)
   *      (7th arg, SysV ABI).
   *   2. Call `getOZChannelAspectRatio_FactoryBase()` -> rax (factory). @0x30c174
   *   3. Load stack-arg info from 0x10(%rbp) into rcx, then store at [rsp+0x8] (7th slot of
   *      the outgoing call). @0x30c179-0x30c17d. Save r15 (impl) to -0x50(%rbp) @0x30c182.
   *      Store impl (r15) at [rsp] (6th slot of the outgoing call). @0x30c186
   *   4. Call OZChannel::OZChannel(this, factory, name, folder, uint1, uint2, impl, info).
   *      @0x30c19d
   *   5. Store primary vptr `__ZTV20OZChannelAspectRatio + 0x10` at (this+0x00).
   *      @0x30c1a2..0x30c1ad
   *   6. Store secondary vptr `__ZTV20OZChannelAspectRatio + 0x370` at (this+0x10).
   *      @0x30c1b0..0x30c1b6
   *   7. `std::call_once(_OZChannelAspectRatioInfo_once, createOZChannelAspectRatioInfo)`
   *      @0x30c1ba-0x30c1ee — only if the once flag != -1 sentinel (the "already-done"
   *      fast path, `cmpq $-0x1, %rax; je 0x30c1ee`).
   *   8. Info-slot fixup — reads STACK slot at 0x10(%rbp) @0x30c1ee (the original `info`
   *      arg):
   *        if (info != NULL) load (this+0x88) into rax @0x30c1f5, mirror to (this+0x80)
   *                          @0x30c1fc.
   *        else load `_OZChannelAspectRatioInfo` @0x30c212, deref @0x30c219, store to
   *                          BOTH (this+0x88) @0x30c21c and (this+0x80) @0x30c223.
   *      Both paths fall through to step 9.
   *   9. `std::call_once(_OZChannelAspectRatioImpl_once, createOZChannelAspectRatioImpl)`
   *      @0x30c203-0x30c25e — same "already-done" gate (`cmpq $-0x1, %rax; je 0x30c25e` on
   *      the null-info branch @0x30c22a, or the equivalent gate @0x30c20a on the non-null
   *      branch).
   *   10. Impl-slot fixup — reads -0x50(%rbp) @0x30c25e (the saved impl arg):
   *         if (impl != NULL) load (this+0x78) into rax @0x30c265 (mirror-source).
   *         else load `_OZChannelAspectRatioImpl` @0x30c26b, deref @0x30c272, store to
   *                          (this+0x78) @0x30c275.
   *       Then unconditionally store rax to (this+0x70). @0x30c279
   *   Exception path @0x30c28c-0x30c29a: `OZChannel::~OZChannel(this)` (stub 0x6df480) +
   *   `_Unwind_Resume` (stub 0x6dd07a).
   */
  static newNamed(
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelAspectRatio {
    const self = new OZChannelAspectRatio();

    // Step 2 — @0x30c174.
    const factory = getOZChannelAspectRatio_FactoryBase(); // frontier throw

    // Step 4 — @0x30c19d.
    OZChannel_base_ctor(self, factory, name, folder, uint1, uint2, impl, info);
    // Steps 5-6 — vptrs implicit in TS.

    // Steps 7-8 — info at (+0x88/+0x80). @0x30c1ee reads STACK 0x10(%rbp) (the `info` arg).
    if (info !== null) {
      // mirror +0x88 -> +0x80.  @0x30c1f5-0x30c1fc
      self.info = info;
    } else {
      // load `_OZChannelAspectRatioInfo` singleton (once-init'd @0x30c1ba-0x30c1ee),
      // store in both.  @0x30c212-0x30c223
      self.info = createOZChannelAspectRatioInfo_default(); // frontier throw
    }

    // Steps 9-10 — impl at (+0x78/+0x70). @0x30c25e reads -0x50(%rbp) (the saved impl arg).
    if (impl !== null) {
      // mirror +0x78 -> +0x70.  @0x30c265
      self.impl = impl;
    } else {
      // load `_OZChannelAspectRatioImpl` singleton (once-init'd @0x30c203-0x30c25e),
      // store in both.  @0x30c26b-0x30c275
      self.impl = createOZChannelAspectRatioImpl_default(); // frontier throw
    }

    return self;
  }

  /**
   * `OZChannelAspectRatio::createOZChannelAspectRatioInfo()` @ProChannel 0x5e9e
   * (__ZN20OZChannelAspectRatio30createOZChannelAspectRatioInfoEv).
   *
   * Faithful line-for-line transcription of the disassembly at
   *   raw-port/re/disasm/ProChannel.__ZN20OZChannelAspectRatio30createOZChannelAspectRatioInfoEv.s
   *
   * This is the standalone STATIC METHOD `createOZChannelAspectRatioInfo`,
   * NOT to be confused with the module-level `createOZChannelAspectRatioInfo_default`
   * fallback stub above (which is used from the ctor's null-info branch
   * at Ozone @0x30c1ee..0x30c223 — see step 8 of newNamed). This method
   * is a call_once-guarded getter for the class-static `_OZChannelAspectRatioInfo`
   * global pointer: on first call it runs the once-init lambda (a SEPARATE
   * ledger unit that allocates + C2-ctors an OZChannelAspectRatioInfo of
   * size 0x58 and writes it to the global), then returns the global's
   * current value.
   *
   * Note on cross-framework class layout: the same C++ class
   * `OZChannelAspectRatio` is compiled into BOTH ProChannel and Ozone
   * binaries (Apple ships the same source through two frameworks; the
   * newer OZ symbols now live under ProChannel with the same mangling).
   * The existing file header cites Ozone addresses for the CTOR; this
   * static method is only present in ProChannel's symbol table (the
   * Ozone binary's ctor inlines the call_once directly at 0x30c1ba..0x30c1ee
   * rather than calling this out-of-line helper). Both frameworks share
   * the same C++ storage duration for the once-flag and _OZChannelAspectRatioInfo
   * globals: function-local statics with libc++'s `std::call_once`
   * guard word (`unsigned long`, 0 = not-started, -1 = completed).
   *
   * -----------------------------------------------------------------------
   * PROCESS-GLOBAL STORAGE
   * -----------------------------------------------------------------------
   *   __ZZN20OZChannelAspectRatio30createOZChannelAspectRatioInfoEvE30_OZChannelAspectRatioInfo_once
   *     — libc++ std::once_flag word for this function's local static.
   *       Fast-path check at @0x5ead: `cmpq $-1, %rax; je 0x5ed8` — if
   *       the flag equals ~0UL (init complete), skip call_once and just
   *       return the global.
   *
   *   __ZN20OZChannelAspectRatio25_OZChannelAspectRatioInfoE
   *     — the class-static `_OZChannelAspectRatioInfo*` (a pointer, not
   *       an inline object). Written by the once-init lambda's __invoke
   *       body at ProChannel 0xbb6b (`_instance = rax`, after the new+C2
   *       @0xbb56+0xbb61). Read here @0x5ed8-0x5edf.
   *
   * -----------------------------------------------------------------------
   * FRONTIER CALLEES
   * -----------------------------------------------------------------------
   *   * `__ZNSt3__111__call_onceERVmPvPFvS2_E`
   *     — std::__1::__call_once — libc++ TRUE out-of-scope extern. Called
   *     @0x5ed3 via ProChannel stub 0xacdc8. Same policy as
   *     OZChannelBase_Factory::getInstance() and OZChannelGradientSampleAlpha_Factory::getInstance().
   *
   *   * `__ZNSt3__117__call_once_proxy<...createOZChannelAspectRatioInfo::lambda...>Pv`
   *     — libc++ proxy template instantiation, referenced @0x5ecc via
   *     `leaq ...(%rip), %rdx`. NOT called by this function directly —
   *     passed as a data reference to __call_once. The proxy tail-jumps
   *     to __invoke, which allocates a 0x58-byte OZChannelAspectRatioInfo
   *     via operator new @ProChannel 0xbb56 (__Znwm stub 0xace4c),
   *     invokes __ZN24OZChannelAspectRatioInfoC2Ev @ProChannel 0xbb61
   *     (C2 base ctor — SEPARATE ledger entry, currently `todo`), and
   *     stores the pointer to `_OZChannelAspectRatioInfo` @0xbb6b. Note
   *     the __invoke body also does a NULL-check on the global first
   *     @0xbb50-0xbb54 (`cmpq $0x0, (%r14); jne 0x5f6e`) — a belt-and-
   *     suspenders guard against double-init that libc++'s call_once
   *     already rules out.
   *
   * -----------------------------------------------------------------------
   * FULL DISASM (raw-port/re/disasm/ProChannel.__ZN20OZChannelAspectRatio30createOZChannelAspectRatioInfoEv.s)
   * -----------------------------------------------------------------------
   *   0x5e9e  pushq  %rbp                              ; prologue
   *   0x5e9f  movq   %rsp, %rbp
   *   0x5ea2  subq   $0x20, %rsp                       ; 32-byte local frame
   *                                                    ; (holds a 3-word libc++
   *                                                    ; "tuple<lambda&&>" plus
   *                                                    ; alignment padding)
   *   0x5ea6  movq   _once(%rip), %rax                 ; rax = _..._once
   *   0x5ead  cmpq   $-0x1, %rax                       ; init complete?
   *   0x5eb1  je     0x5ed8                            ; -> fast_path
   *   0x5eb3  leaq   -0x1(%rbp), %rax                  ; captureless-lambda slot
   *   0x5eb7  leaq   -0x18(%rbp), %rcx                 ; tuple<T&&> slot
   *   0x5ebb  movq   %rax, (%rcx)                      ; tuple.head = &lambda
   *   0x5ebe  leaq   -0x10(%rbp), %rsi                 ; call_once's `void* arg`
   *   0x5ec2  movq   %rcx, (%rsi)                      ; *arg = &tuple
   *   0x5ec5  leaq   _once(%rip), %rdi                 ; rdi = &_once
   *   0x5ecc  leaq   __call_once_proxy<...>(%rip), %rdx ; rdx = &proxy
   *   0x5ed3  callq  0xacdc8                           ; std::__call_once stub
   *   0x5ed8  leaq   _OZChannelAspectRatioInfo(%rip), %rax ; fast_path: rax = &_global
   *   0x5edf  movq   (%rax), %rax                      ; rax = _global (deref)
   *   0x5ee2  addq   $0x20, %rsp                       ; epilogue
   *   0x5ee6  popq   %rbp
   *   0x5ee7  retq
   */
  static createOZChannelAspectRatioInfo(): OZChannelAspectRatioInfoLayout | null {
    // ------------------------------------------------------------
    // @0x5e9e..0x5ea2 — prologue + 0x20 local frame (no TS effect).
    // @0x5ea6..0x5ead — rax = _once; cmpq $-1, %rax.
    // @0x5eb1 — je 0x5ed8 (fast_path).
    // ------------------------------------------------------------
    if (
      OZChannelAspectRatio._createOZChannelAspectRatioInfo_once !== -1n
    ) {
      // ------------------------------------------------------------
      // @0x5eb3..0x5ec2 — set up libc++ tuple<lambda&&> on the stack
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder).
      // @0x5ec5 — rdi = &_once.
      // @0x5ecc — rdx = &__call_once_proxy<...lambda...> (@ProChannel 0xbb17).
      // @0x5ed3 — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      OZChannelAspectRatio_std_call_once(
        {
          get: (): bigint =>
            OZChannelAspectRatio._createOZChannelAspectRatioInfo_once,
          set: (v: bigint): void => {
            OZChannelAspectRatio._createOZChannelAspectRatioInfo_once = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        OZChannelAspectRatio_createOZChannelAspectRatioInfo_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x5ed8..0x5edf — rax = _OZChannelAspectRatioInfo (deref).
    // @0x5ee2..0x5ee7 — epilogue + retq.
    // ------------------------------------------------------------
    return OZChannelAspectRatio._OZChannelAspectRatioInfo;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PROCESS-GLOBAL STORAGE for createOZChannelAspectRatioInfo (ProChannel BSS)
  // ═════════════════════════════════════════════════════════════════════════
  // In the real binary these are function-local statics (guarded by libc++'s
  // call_once). In the port we hoist them to class-static private fields for
  // the same lifetime + zero-init semantics (Mach-O __bss is zero at load).
  //
  // NB: These fields belong to the PROCHANNEL build of OZChannelAspectRatio.
  // The OZONE build's ctor inlines its own call_once at 0x30c1ba-0x30c1ee
  // and does NOT go through this static method — so at the class level the
  // once-flag storage is shared under a single symbol but the two build
  // variants use it independently. In TS we have one instance of this
  // module, so the flag transitions 0 -> -1 on first call regardless of
  // which entry point drove it (matches the C++ observable behaviour).
  // ═════════════════════════════════════════════════════════════════════════

  /** @ProChannel BSS `__ZZN20OZChannelAspectRatio30createOZChannelAspectRatioInfoEvE30_OZChannelAspectRatioInfo_once`.
   *  libc++ std::once_flag word. 0n = not started; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed.
   *  createOZChannelAspectRatioInfo() compares this to $-1 @0x5ead. */
  private static _createOZChannelAspectRatioInfo_once: bigint = 0n; // @ProChannel BSS 0x5ea6

  /** @ProChannel BSS `__ZN20OZChannelAspectRatio25_OZChannelAspectRatioInfoE`.
   *  The `OZChannelAspectRatioInfo*` singleton. Read @0x5ed8-0x5edf.
   *  Written by the once-init __invoke body at ProChannel 0xbb6b (after
   *  operator new(0x58) @0xbb56 + C2 ctor @0xbb61). Also referenced by
   *  the Ozone ctor's fallback path @0x30c212-0x30c21c (see step 8 in
   *  newNamed above — that path currently routes through the
   *  `createOZChannelAspectRatioInfo_default` frontier stub, and once
   *  the once-init lambda is ported it will read this global instead). */
  static _OZChannelAspectRatioInfo: OZChannelAspectRatioInfoLayout | null = null; // @ProChannel BSS 0x5ed8

  /**
   * `OZChannelAspectRatio::createOZChannelAspectRatioImpl()` @ProChannel 0x5ee8
   * (__ZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEv).
   *
   * Disasm source:
   *   raw-port/re/disasm/ProChannel.__ZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEv.s
   *
   * Structural TWIN of `createOZChannelAspectRatioInfo` above — the two share
   * the identical libc++ call_once shape (cmp $-1 fast path, tuple<lambda&&>
   * setup, callq std::__call_once, load-and-deref the singleton pointer).
   * The DIFFERENCE is only which globals it targets:
   *   - once-flag: __ZZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEvE30_OZChannelAspectRatioImpl_once
   *                @ProChannel BSS 0xeb7a8 (this file's `_createOZChannelAspectRatioImpl_once`)
   *   - proxy:     __ZNSt3__117__call_once_proxy<...createOZChannelAspectRatioImpl::lambda...>Pv
   *                @ProChannel 0x6085  (7-insn tail-jmp to the lambda operator())
   *   - lambda:    __ZZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEvENKUlvE_clEv
   *                @ProChannel 0x6096  (53-insn body — the actual allocator/
   *                initialiser of the Impl; SEPARATE ledger unit)
   *   - singleton: __ZN20OZChannelAspectRatio25_OZChannelAspectRatioImplE
   *                @ProChannel BSS 0xec2a0 (this file's `_OZChannelAspectRatioImpl`)
   *
   * FULL DISASM (31 lines, raw-port/re/disasm/ProChannel.__ZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEv.s)
   *
   *   0x5ee8  pushq  %rbp                             ; prologue
   *   0x5ee9  movq   %rsp, %rbp
   *   0x5eec  subq   $0x20, %rsp                      ; 32-byte local frame
   *                                                    ; (libc++ tuple<lambda&&>
   *                                                    ; plus alignment padding)
   *   0x5ef0  movq   _OZChannelAspectRatioImpl_once(%rip), %rax
   *                                                    ; rax = _once
   *   0x5ef7  cmpq   $-0x1, %rax                      ; already-init check
   *   0x5efb  je     0x5f22                           ; fast path: skip call_once
   *   0x5efd  leaq   -0x1(%rbp), %rax                 ; rax = &frame[-1]
   *                                                    ; (empty captureless lambda
   *                                                    ; storage — 1 byte)
   *   0x5f01  leaq   -0x18(%rbp), %rcx                ; rcx = &frame[-0x18]
   *   0x5f05  movq   %rax, (%rcx)                     ; tuple.head = &lambda-slot
   *   0x5f08  leaq   -0x10(%rbp), %rsi                ; rsi = &frame[-0x10]
   *   0x5f0c  movq   %rcx, (%rsi)                     ; *arg = &tuple
   *   0x5f0f  leaq   _OZChannelAspectRatioImpl_once(%rip), %rdi
   *                                                    ; rdi = &_once
   *   0x5f16  leaq   __ZNSt3__117__call_once_proxy<...createOZChannelAspectRatioImpl::lambda...>Pv(%rip), %rdx
   *                                                    ; rdx = proxy fn @0x6085
   *   0x5f1d  callq  std::__call_once                 ; libc++ stub @0xacdc8
   *   0x5f22  leaq   _OZChannelAspectRatioImpl(%rip), %rax
   *                                                    ; rax = &_OZChannelAspectRatioImpl
   *   0x5f29  movq   (%rax), %rax                     ; rax = *_OZChannelAspectRatioImpl (deref)
   *   0x5f2c  addq   $0x20, %rsp                      ; epilogue
   *   0x5f30  popq   %rbp
   *   0x5f31  retq                                     ; return rax (Impl*)
   *
   * SEMANTICS
   *   Standard libc++ std::call_once-guarded singleton accessor: on first
   *   call, invoke the proxy which unpacks the lambda tuple and runs the
   *   Impl allocator/initialiser (see lambda body @ProChannel 0x6096 — a
   *   separate ledger unit that will fill in the storage via operator new
   *   + OZCurveDouble ctor + field assignments). On subsequent calls, the
   *   `cmp $-1` fast path skips straight to loading `_OZChannelAspectRatioImpl`.
   *   The final `movq (%rax), %rax` derefs the global's ADDRESS (%rax) to
   *   read the POINTER stored there. In JS the deref is trivial (just read
   *   the class-static field).
   */
  static createOZChannelAspectRatioImpl(): OZChannelImpl | null {
    // ------------------------------------------------------------
    // @0x5ee8..0x5eec — prologue + 0x20 local frame (no TS effect).
    // @0x5ef0..0x5ef7 — rax = _once; cmpq $-1, %rax.
    // @0x5efb — je 0x5f22 (fast_path).
    // ------------------------------------------------------------
    if (
      OZChannelAspectRatio._createOZChannelAspectRatioImpl_once !== -1n
    ) {
      // ------------------------------------------------------------
      // @0x5efd..0x5f0c — set up libc++ tuple<lambda&&> on the stack
      // (ABI-level, no TS-visible effect — the proxy just needs a
      // stable void* to dispatch through; we pass a null placeholder).
      // @0x5f0f — rdi = &_once.
      // @0x5f16 — rdx = &__call_once_proxy<...lambda...> (@ProChannel 0x6085).
      // @0x5f1d — callq std::__call_once (libc++ stub @0xacdc8).
      // ------------------------------------------------------------
      OZChannelAspectRatio_std_call_once(
        {
          get: (): bigint =>
            OZChannelAspectRatio._createOZChannelAspectRatioImpl_once,
          set: (v: bigint): void => {
            OZChannelAspectRatio._createOZChannelAspectRatioImpl_once = v;
          },
        },
        null, // ABI void* — the real disasm passes &tuple; our proxy ignores it.
        OZChannelAspectRatio_createOZChannelAspectRatioImpl_lambda,
      );
    }
    // ------------------------------------------------------------
    // @0x5f22..0x5f29 — rax = _OZChannelAspectRatioImpl (deref).
    // @0x5f2c..0x5f31 — epilogue + retq.
    // ------------------------------------------------------------
    return OZChannelAspectRatio._OZChannelAspectRatioImpl;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PROCESS-GLOBAL STORAGE for createOZChannelAspectRatioImpl (ProChannel BSS)
  // ═════════════════════════════════════════════════════════════════════════
  // Same pattern as the Info variant above — function-local statics in the
  // real binary; hoisted to class-static private fields here for identical
  // lifetime + zero-init semantics.
  // ═════════════════════════════════════════════════════════════════════════

  /** @ProChannel BSS `__ZZN20OZChannelAspectRatio30createOZChannelAspectRatioImplEvE30_OZChannelAspectRatioImpl_once`.
   *  libc++ std::once_flag word. 0n = not started; -1n (0xFFFF_FFFF_FFFF_FFFF) = completed.
   *  createOZChannelAspectRatioImpl() compares this to $-1 @0x5ef7. */
  private static _createOZChannelAspectRatioImpl_once: bigint = 0n; // @ProChannel BSS 0xeb7a8

  /** @ProChannel BSS `__ZN20OZChannelAspectRatio25_OZChannelAspectRatioImplE`.
   *  The `OZChannelImpl*` singleton. Read @0x5f22-0x5f29.
   *  Written by the once-init lambda body at ProChannel 0x6096 (a
   *  53-insn body that allocates 0x30 bytes via `operator new` @0x60b2,
   *  a 0xb0-byte OZCurveDouble via `operator new` @0x60bf, invokes the
   *  OZCurveDouble ctor @0x60d2, and populates the fields — SEPARATE
   *  ledger unit, currently `todo`). Also referenced by the Ozone ctor
   *  fallback path @0x30c26b (see newNamed above — currently routed
   *  through `createOZChannelAspectRatioImpl_default` frontier stub). */
  static _OZChannelAspectRatioImpl: OZChannelImpl | null = null; // @ProChannel BSS 0xec2a0
}

// ═════════════════════════════════════════════════════════════════════════
// libc++ boundary stubs for createOZChannelAspectRatioInfo (ProChannel)
// ═════════════════════════════════════════════════════════════════════════

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++
 * (libc++.dylib). Called from createOZChannelAspectRatioInfo @0x5ed3
 * via ProChannel stub 0xacdc8. TRUE out-of-scope extern (libc++ runtime).
 * In this port there is no libc++ runtime, so we model the "run the
 * initializer exactly once, atomically" contract at the JS single-threaded
 * level: on first call with a zero once_flag, we invoke the proxy(arg)
 * and — IF it completes without throwing — write $-1 into the flag; on
 * subsequent calls we no-op. If the proxy throws, the flag stays 0
 * (libc++'s ~0UL-on-success write is skipped) and future calls will
 * retry, exactly like the real runtime. This mirrors the identical
 * std_call_once helpers in the OZChannel*Factory files and models only
 * the semantics createOZChannelAspectRatioInfo's disasm relies on (the
 * fast-path @0x5ead `cmp $-1` check). */
function OZChannelAspectRatio_std_call_once(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  // libc++ fast-path: already completed?
  if (once.get() === -1n) return; // (mirrors 0x5ead fast-path exit)
  // First-call slow path (single-threaded model — no atomic CAS needed
  // in JS). Run the proxy; on success mark the flag ~0.
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...createOZChannelAspectRatioInfo::lambda...>Pv`
 * — libc++ template instantiation (ProChannel @0xbb17). Body is
 * `jmp __invoke<...>` @0xbb22, which lives at ProChannel 0xbb27 and:
 *   1. Loads &_OZChannelAspectRatioInfo (@0xbb49) and null-checks it
 *      (@0xbb50-0xbb54): if the global is already non-null, skip the
 *      alloc entirely and return.
 *   2. Allocates 0x58 bytes via `operator new` @ProChannel 0xbb56
 *      (__Znwm stub @0xace4c).
 *   3. Invokes __ZN24OZChannelAspectRatioInfoC2Ev @ProChannel 0xbb61
 *      (OZChannelAspectRatioInfo::C2 base ctor — SEPARATE ledger entry,
 *      currently `todo`).
 *   4. Stores the fresh pointer to `_OZChannelAspectRatioInfo` @0xbb6b.
 * Since neither the C2 ctor nor operator new are ported yet, this stub
 * raises with the exact @0xADDRs of the dispatching call sites — the
 * deferred work is transparently documented and will resolve once those
 * separate ledger units are claimed. The proxy and __invoke themselves
 * are also SEPARATE ledger units (not this file's scope).
 */
function OZChannelAspectRatio_createOZChannelAspectRatioInfo_lambda(
  _arg: unknown,
): void {
  // The __invoke body @ProChannel 0xbb27..0xbb72 is:
  //   1. r14 = &_OZChannelAspectRatioInfo                    @ProChannel 0xbb49
  //   2. if (*r14 != null) skip to epilogue @0xbb6e          @ProChannel 0xbb50-0xbb54
  //   3. rax = operator new(0x58)                            @ProChannel 0xbb56 (imported __Znwm)
  //   4. OZChannelAspectRatioInfo::C2(rax)                   @ProChannel 0xbb61
  //   5. _OZChannelAspectRatioInfo = rax                     @ProChannel 0xbb6b
  // C2 is a separate ledger entry (todo). We cite all call sites.
  throw new Error(
    "OZChannelAspectRatio::createOZChannelAspectRatioInfo() __call_once " +
      "init lambda not yet transcribed — the __invoke body @ProChannel 0xbb27 " +
      "null-checks _OZChannelAspectRatioInfo @0xbb50, otherwise allocates " +
      "0x58 bytes via operator new @0xbb56 then invokes " +
      "__ZN24OZChannelAspectRatioInfoC2Ev @ProChannel 0xbb61 " +
      "(OZChannelAspectRatioInfo C2 base ctor, ledger status: todo) and " +
      "stores the result into _OZChannelAspectRatioInfo @0xbb6b. Neither " +
      "operator new (__Znwm ProChannel stub 0xace4c) nor the C2 ctor is " +
      "yet ported — the proxy, __invoke, and C2 are each SEPARATE ledger " +
      "units and will be filled in when they are next claimed. The proxy " +
      "is invoked from std::__call_once at ProChannel 0x5ed3.",
  );
}

// Bring OZChannelAspectRatioInfoLayout into scope for the class-static field
// declaration above. The type-only import keeps this file's runtime
// dependency graph unchanged (no cycles introduced). The layout interface
// (rather than a class) matches the actual .ts export shape — the info
// object is populated field-by-field by OZChannelAspectRatioInfo__ctor
// (see OZChannelAspectRatioInfo.ts), which is what the SEPARATE C2-ctor
// ledger unit @ProChannel 0xbb61 corresponds to.
import type { OZChannelAspectRatioInfoLayout } from './OZChannelAspectRatioInfo';

/**
 * `__ZNSt3__117__call_once_proxy<...createOZChannelAspectRatioImpl::lambda...>Pv`
 * — libc++ template instantiation (ProChannel @0x6085). Body is
 * `jmp __ZZ...30createOZChannelAspectRatioImplEvENKUlvE_clEv` @0x6090
 * — i.e. it tail-jumps to the lambda's `operator()` at ProChannel 0x6096.
 * That lambda body (53 insns) does the real work:
 *   1. Load &_OZChannelAspectRatioImpl (@0x60a0) and null-check it
 *      (@0x60a7-0x60ab): if the global is already non-null, skip alloc.
 *   2. Allocates 0x30 bytes via `operator new` @ProChannel 0x60b2
 *      (__Znwm stub @0xace4c).
 *   3. Allocates 0xb0 bytes via `operator new` @ProChannel 0x60bf for an
 *      OZCurveDouble object.
 *   4. Invokes `OZCurveDouble::OZCurveDouble(double)` @ProChannel 0x60d2
 *      (__ZN13OZCurveDoubleC2Ed — SEPARATE ledger entry).
 *   5. ...continues initialising fields and stores the outer 0x30-byte
 *      pointer to `_OZChannelAspectRatioImpl` (final store — the singleton
 *      publication).
 * Since neither the OZCurveDouble ctor nor operator new are ported yet,
 * this stub raises with the exact @0xADDRs of the dispatching call sites.
 * The 53-insn lambda body, the proxy, and the OZCurveDouble ctor are each
 * SEPARATE ledger units and will be filled in when they are claimed.
 */
function OZChannelAspectRatio_createOZChannelAspectRatioImpl_lambda(
  _arg: unknown,
): void {
  // The lambda body @ProChannel 0x6096..0x6??? is:
  //   1. r14 = &_OZChannelAspectRatioImpl                    @ProChannel 0x60a0
  //   2. if (*r14 != null) skip to epilogue                  @ProChannel 0x60a7-0x60ab
  //   3. rax = operator new(0x30)                            @ProChannel 0x60b2 (imported __Znwm)
  //   4. rax = operator new(0xb0)                            @ProChannel 0x60bf (imported __Znwm)
  //   5. OZCurveDouble::C2(rax, xmm0)                        @ProChannel 0x60d2
  //   ... (field initialisers, then publication to _OZChannelAspectRatioImpl)
  // The full 53-insn body is a SEPARATE ledger unit.
  throw new Error(
    "OZChannelAspectRatio::createOZChannelAspectRatioImpl() __call_once " +
      "init lambda not yet transcribed — the lambda body @ProChannel 0x6096 " +
      "null-checks _OZChannelAspectRatioImpl @0x60a7, otherwise allocates " +
      "0x30 bytes via operator new @0x60b2, a 0xb0-byte OZCurveDouble via " +
      "operator new @0x60bf, invokes __ZN13OZCurveDoubleC2Ed @ProChannel " +
      "0x60d2 (OZCurveDouble double-ctor, ledger status: todo), continues " +
      "initialising fields, and stores the fresh Impl pointer into " +
      "_OZChannelAspectRatioImpl (published at the store that terminates the " +
      "53-insn body). Neither operator new (__Znwm ProChannel stub 0xace4c) " +
      "nor the OZCurveDouble ctor is yet ported — the proxy (@ProChannel " +
      "0x6085), the lambda's operator() body (@ProChannel 0x6096), and the " +
      "OZCurveDouble ctor are each SEPARATE ledger units and will be filled " +
      "in when they are next claimed. The proxy is invoked from " +
      "std::__call_once at ProChannel 0x5f1d.",
  );
}
