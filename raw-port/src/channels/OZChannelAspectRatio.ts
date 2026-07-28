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
}
