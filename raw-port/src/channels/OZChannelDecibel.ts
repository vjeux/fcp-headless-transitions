// raw-port/src/channels/OZChannelDecibel.ts
//
// FCP `OZChannelDecibel` — the "decibel" channel in the OZChannel family (a
// per-channel gain in dB, with the class-owned Info/Impl singletons that
// describe the display metadata and the underlying OZCurveDouble+scalar-min-max
// implementation).
//
// Framework: ProChannel
// Provenance (raw-port/re/disasm/ProChannel.OZChannelDecibel.*.s + spot-fetched
// otool -tvV blocks; all @0x addresses are ProChannel x86_64 slice VAs):
//   OZChannelDecibel(OZFactory*, PCString const&, unsigned int, OZChannelImpl*, OZChannelInfo*)
//                                                    @0x0001042a
//                                                      (__ZN16OZChannelDecibelC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo)
//   OZChannelDecibel(PCString const&, OZChannelFolder*, u, u, OZChannelImpl*, OZChannelInfo*)
//                                                    @0x000a93ea
//                                                      (__ZN16OZChannelDecibelC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo)
//   createOZChannelDecibelInfo()                     @0x000104da
//                                                      (__ZN16OZChannelDecibel26createOZChannelDecibelInfoEv)
//     info-lambda body                               @0x0001057e
//                                                      (__ZNSt3__18__invokeB9nqe210106<...createOZChannelDecibelInfo::lambda...>)
//   createOZChannelDecibelImpl()                     @0x00010524
//                                                      (__ZN16OZChannelDecibel26createOZChannelDecibelImplEv)
//     impl-lambda body                               @0x000106ce
//                                                      (__ZZN16OZChannelDecibel26createOZChannelDecibelImplEvENKUlvE_clEv)
//   getObjCWrapperName()                             @0x0001cce4
//                                                      (__ZN16OZChannelDecibel18getObjCWrapperNameEv)
//   ~OZChannelDecibel() [D1]                          @0x0001d34e (__ZN16OZChannelDecibelD1Ev)
//   ~OZChannelDecibel() [D0 deleting]                 @0x0001d358 (__ZN16OZChannelDecibelD0Ev)
//   clone() const                                    @0x0001d374 (__ZNK16OZChannelDecibel5cloneEv)
//
// Vtable (via ctor RIP-relative writes):
//   Primary vtable    __ZTV16OZChannelDecibel + 0x10  installed at (this+0x00)
//   Secondary vtable  __ZTV16OZChannelDecibel + 0x370 installed at (this+0x10)
//   Absolute base of __ZTV16OZChannelDecibel is at RIP 0x10456 (ctor) or 0xa943c
//   (6-arg ctor) or 0x1d398 (clone).
//
// STRUCT LAYOUT (from ctor + clone; same as the OZChannelAngle sibling — all
// OZChannel subclasses share this shape via the OZChannel base ctor):
//   +0x000  primary vptr        (=vtable[OZChannelDecibel]+0x10)
//   +0x010  secondary vptr      (=vtable[OZChannelDecibel]+0x370)
//   +0x070  OZChannelImpl*  impl  (mirror of +0x78)
//   +0x078  OZChannelImpl*  impl  (initial slot; base ctor writes here from caller arg)
//   +0x080  OZChannelInfo*  info  (mirror of +0x88)
//   +0x088  OZChannelInfo*  info  (initial slot; base ctor writes here)
//   sizeof(OZChannelDecibel) = 0x98 == 152  (from `movl $0x98,%edi` @0x1d37e in clone —
//                                             the exact new[] size for a clone.)
//   The bytes at +0x018..+0x070 are inherited OZChannel state; NONE of the four
//   methods here touches them — they're only set by the base ctor.
//
// Callees / RIP-relative refs (resolved via raw-port/army/tools/resolve.py ProChannel …):
//   __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//                                                       // OZChannel base ctor (7-arg form; called @0x10451 and @0xa9437)
//   __ZN9OZChannelC2ERKS_P15OZChannelFolder             // OZChannel copy ctor (called @0x1d393 from clone)
//   __ZN9OZChannelD2Ev                                   // OZChannel::~OZChannel() (called from D1/D0 tail-jmp and unwind)
//   __ZN13OZChannelImplC2EP7OZCurvedjb                  // OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool) (@0x1071d)
//   __ZN13OZCurveDoubleC2Ed                              // OZCurveDouble::OZCurveDouble(double) (@0x10705)
//   __ZN20OZChannelDecibelInfoC2Ev                       // OZChannelDecibelInfo::OZChannelDecibelInfo() (@0x105a2)
//   __ZN11PCSingletonC2Ej                                // PCSingleton::PCSingleton(unsigned int) (@0x1072e)
//   __Z31getOZChannelDecibel_FactoryBasev                // free fn returning OZFactory* (called @0xa940e)
//   __ZNSt3__111__call_onceERVmPvPFvS2_E                 // std::__1::__call_once entry (@0x1050f and @0x10559)
//   __ZNSt3__117__call_once_proxyB9nqe210106<...Info...>Pv  // proxy for info-lambda (RIP @0x10508)
//   __ZNSt3__117__call_once_proxyB9nqe210106<...Impl...>Pv  // proxy for impl-lambda (RIP @0x10552)
//   __Znwm                                                // operator new (multiple sites)
//   __ZdlPv                                               // operator delete (D0 and unwind paths)
//   __Unwind_Resume                                       // unwind rethrow

import type { OZChannelFolder, OZChannelImpl, OZChannelInfo, OZFactory } from './OZChannelDouble';

// -------------------------------- Frontier stubs -------------------------------
//
// Everything below is a THROWing stub whose message cites the exact @0xADDR at
// which the C++ calls it. Each represents an un-decoded callee we transcribe as
// a "demand signal" rather than fabricating a body. (Matches the OZChannelAngle
// convention already established in this project — see
// raw-port/src/channels/OZChannelAngle.ts.)

/** External `__Z31getOZChannelDecibel_FactoryBasev` @ProChannel U-extern.
 *  Called @0xa940e (6-arg ctor variant only; the 5-arg ctor takes the factory
 *  pointer as its first argument and does NOT call this). */
function getOZChannelDecibel_FactoryBase(): OZFactory {
  throw new Error(
    "getOZChannelDecibel_FactoryBase() @ProChannel U-extern " +
    "__Z31getOZChannelDecibel_FactoryBasev (not yet transcribed) — " +
    "called by OZChannelDecibel(PCString&,OZChannelFolder*,u,u,Impl*,Info*) @ProChannel 0xa940e",
  );
}

/** External `__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 *  — OZChannel base ctor (7-arg form). Called @0x10451 (from the 5-arg factory-first ctor —
 *  with the folder = NULL and the second `unsigned int` = 0, both via `xorl %ecx,%ecx` /
 *  `xorl %r9d,%r9d` @0x1044c-e) and @0xa9437 (from the 6-arg name-first ctor with all args
 *  forwarded). */
function OZChannel_base_ctor(
  _self: OZChannelDecibel,
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
    "OZChannelImpl*, OZChannelInfo*) @ProChannel U-extern " +
    "__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo " +
    "(not yet transcribed) — invoked by OZChannelDecibel ctors @ProChannel 0x10451 and 0xa9437",
  );
}

/** External `__ZN9OZChannelC2ERKS_P15OZChannelFolder` — OZChannel copy ctor
 *  (this-ptr, source-ref, folder). Called @0x1d393 from clone(). The clone
 *  passes folder = NULL (`xorl %edx,%edx` @0x1d391), so the copy is un-parented. */
function OZChannel_copy_ctor(
  _self: OZChannelDecibel,
  _src: OZChannelDecibel,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @ProChannel U-extern " +
    "__ZN9OZChannelC2ERKS_P15OZChannelFolder (not yet transcribed) — " +
    "invoked by OZChannelDecibel::clone() @ProChannel 0x1d393",
  );
}

/** External `__ZN9OZChannelD2Ev` — OZChannel base dtor. Called from D1 (tail-jmp @0x1d353),
 *  D0 (@0x1d361 before operator delete), and the C2 unwind edges @0x104cc and @0xa94b3+ext. */
function OZChannel_base_dtor(_self: OZChannelDecibel): void {
  throw new Error(
    "OZChannel::~OZChannel() @ProChannel U-extern __ZN9OZChannelD2Ev " +
    "(not yet transcribed) — invoked by OZChannelDecibel D1/D0 @ProChannel 0x1d353/0x1d361 " +
    "and ctor unwind @ProChannel 0x104cc",
  );
}

/** OZChannelDecibel::createOZChannelDecibelInfo() lambda body — @0x1057e.
 *  Faithful transcription of the once-init'd factory:
 *    if (_OZChannelDecibelInfo == NULL) {
 *      p = ::operator new(0x58);                          // @0x10597
 *      OZChannelDecibelInfo::OZChannelDecibelInfo(p);      // @0x105a2
 *      _OZChannelDecibelInfo = p;                          // @0x105a7
 *    }
 *  sizeof(OZChannelDecibelInfo) = 0x58 == 88 (from `movl $0x58,%edi` @0x10592).
 *
 *  OZChannelDecibelInfo::OZChannelDecibelInfo() is NOT yet transcribed and is a
 *  frontier — this stub throws with the address citation. */
function createOZChannelDecibelInfo_default(): OZChannelInfo {
  throw new Error(
    "OZChannelDecibelInfo::OZChannelDecibelInfo() @ProChannel U-extern " +
    "__ZN20OZChannelDecibelInfoC2Ev (not yet transcribed) — invoked by " +
    "OZChannelDecibel::createOZChannelDecibelInfo() lambda @ProChannel 0x105a2 " +
    "(operator new(0x58) @ProChannel 0x10597; stored to _OZChannelDecibelInfo @0x105a7)",
  );
}

/** OZChannelDecibel::createOZChannelDecibelImpl() lambda body — @0x106ce.
 *  Faithful transcription:
 *    if (_OZChannelDecibelImpl == NULL) {
 *      rbx = ::operator new(0x30);                                    // @0x106ea; sizeof(OZChannelImpl-carrier) = 48
 *      r14 = ::operator new(0xb0);                                    // @0x106f7; sizeof(OZCurveDouble) = 176
 *      OZCurveDouble::OZCurveDouble(r14, (xmm0=) 0.0);            // @0x10705
 *      OZChannelImpl::OZChannelImpl(rbx, (curve=) r14, (val=) 0.0,
 *                                   (u=) 1, (b=) 1);                 // @0x1071d
 *      PCSingleton::PCSingleton(rbx + 0x28, (u=) 0x64);              // @0x1072e; subobject at +0x28
 *      *(rbx +  0x00) = <vtable A>;                                    // @0x10733-3a
 *      *(rbx + 0x28) = <vtable B>;                                    // @0x1073d-44
 *      _OZChannelDecibelImpl = rbx;                                    // @0x10748
 *    }
 *
 *  All three C++ constructors (OZCurveDouble, OZChannelImpl, PCSingleton) are
 *  frontier callees @0x10705 / @0x1071d / @0x1072e — cited by the stub below.
 *  The initial value passed to OZCurveDouble is EXACTLY +0.0 (from `xorps %xmm0,%xmm0` @0x106ff)
 *  and the initial value passed to OZChannelImpl is EXACTLY +0.0 (from the second
 *  `xorps %xmm0,%xmm0` @0x1070a). The uint/bool args to OZChannelImpl are literal
 *  `1` and `1` (`movl $0x1,%edx` @0x10713, `movl $0x1,%ecx` @0x10718). The
 *  PCSingleton arg is literal 0x64 (`movl $0x64,%esi` @0x10729). */
function createOZChannelDecibelImpl_default(): OZChannelImpl {
  throw new Error(
    "OZChannelDecibel::createOZChannelDecibelImpl() lambda @ProChannel 0x106ce — " +
    "constructs OZCurveDouble(0.0) @ProChannel 0x10705 (U-extern __ZN13OZCurveDoubleC2Ed), " +
    "then OZChannelImpl(curve, 0.0, 1, 1) @ProChannel 0x1071d (U-extern " +
    "__ZN13OZChannelImplC2EP7OZCurvedjb), then PCSingleton(0x64) @ProChannel 0x1072e " +
    "(U-extern __ZN11PCSingletonC2Ej). None of those C++ ctors are yet transcribed.",
  );
}

// -----------------------------------------------------------------------------

/**
 * OZChannelDecibel — see file header. This class inherits from OZChannel; TS
 * does NOT extend a TS OZChannel here because the OZChannel base ctor is a
 * frontier (see OZChannel_base_ctor above) — extending would only pull in
 * fields we cannot yet populate faithfully. We model the two derived vptr
 * slots implicitly and store the `info`/`impl` pointers directly, mirroring
 * the sibling OZChannelAngle port exactly.
 */
export class OZChannelDecibel {
  /** Primary vptr — writes at (this+0x00) point to `__ZTV16OZChannelDecibel + 0x10`.
   *  @ProChannel 0x10461 (5-arg ctor), 0xa9447 (6-arg ctor), 0x1d39f (clone). Implicit in JS. */
  // (vtable slot is implicit)

  /** Secondary vptr — writes at (this+0x10) point to `__ZTV16OZChannelDecibel + 0x370`.
   *  @ProChannel 0x1046a, 0xa9450, 0x1d3a9. Implicit in JS. */
  // (secondary vtable slot is implicit)

  /** OZChannelImpl* at C++ offset +0x70 (mirror of +0x78). Set by both ctors from either
   *  the caller-supplied `impl` arg (mirrored down from +0x78) or the once-guarded
   *  `_OZChannelDecibelImpl` singleton. @ProChannel writes: 0x104b7 / 0xa94a1. */
  impl!: OZChannelImpl;

  /** OZChannelInfo* at C++ offset +0x80 (mirror of +0x88). Same pattern as `impl` but at
   *  +0x80/+0x88. @ProChannel writes: 0x10492 / 0xa947a. */
  info!: OZChannelInfo;

  /**
   * `OZChannelDecibel::OZChannelDecibel(OZFactory* factory, PCString const& name,
   *   unsigned int uint1, OZChannelImpl* impl, OZChannelInfo* info)` — @ProChannel 0x1042a.
   *
   * Faithful transcription (see raw-port/re/disasm/ProChannel.OZChannelDecibel.OZChannelDecibel.s):
   *   1. Save regs: rsi=name (unused directly, forwarded via rdx to base ctor stays as is),
   *      rdx=name (kept in %rdx), rcx=uint1 → r8d @0x1043d (moved into 5th-slot for base ctor),
   *      r8=impl (r14 backup), r9=info (r15 backup); rdi=this (rbx). Also spill r9→8(%rsp) and
   *      r14→(%rsp) as the 7th/6th stack args of the base ctor. @0x1042e-48
   *   2. Zero rcx (folder = NULL) and r9d (uint2 = 0). @0x1044c-e
   *   3. Call `OZChannel::OZChannel(this, factory, name, (folder=) NULL, uint1,
   *      (uint2=) 0, impl, info)`. @0x10451
   *   4. Load `__ZTV16OZChannelDecibel` @0x10456. Store `vtable+0x10` @(this+0x00) @0x1045d-61
   *      and `vtable+0x370` @(this+0x10) @0x10464-6a.
   *   5. Call `OZChannelDecibel::createOZChannelDecibelInfo()`. @0x1046e (once-init the
   *      `_OZChannelDecibelInfo` singleton — no-op after first call).
   *   6. Info-slot fixup — reads the ORIGINAL r15 (info arg, still live in %r15 because
   *      nothing else has clobbered it). @0x10473 test:
   *        if (info != NULL) — mirror (this+0x88) → (this+0x80). @0x10478-7f
   *        else — load `_OZChannelDecibelInfo` and store to (this+0x88). @0x10481-8b
   *      Both paths fall to `movq %rax, 0x80(%rbx)` @0x10492 (write to +0x80).
   *   7. Call `OZChannelDecibel::createOZChannelDecibelImpl()`. @0x10499 (once-init).
   *   8. Impl-slot fixup — reads the ORIGINAL r14 (impl arg). @0x1049e test:
   *        if (impl != NULL) — mirror (this+0x78) → (this+0x70). @0x104a3-a7
   *        else — load `_OZChannelDecibelImpl` and store to (this+0x78). @0x104a9-b3
   *      Both paths fall to `movq %rax, 0x70(%rbx)` @0x104b7 (write to +0x70).
   *   9. Return @0x104c5.
   *   Exception path @0x104c6-d4: `OZChannel::~OZChannel(this)` @0x104cc, then
   *   `__Unwind_Resume`. Modeled below in the try/catch.
   */
  static newFromFactory(
    factory: OZFactory,
    name: string,
    uint1: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelDecibel {
    const self = new OZChannelDecibel();
    try {
      // Steps 2-3 — folder = NULL, uint2 = 0.  @0x10451
      OZChannel_base_ctor(self, factory, name, null, uint1, 0, impl, info); // frontier throw
      // Steps 4 — vptrs implicit.

      // Steps 5-6 — info at (+0x88/+0x80). @0x1046e once-init then test @0x10473.
      if (info !== null) {
        // mirror +0x88 -> +0x80. @0x10478-7f + fallthrough @0x10492
        self.info = info;
      } else {
        // load `_OZChannelDecibelInfo` singleton, store in both. @0x10481-8b + @0x10492
        self.info = createOZChannelDecibelInfo_default(); // frontier throw
      }

      // Steps 7-8 — impl at (+0x78/+0x70). @0x10499 once-init then test @0x1049e.
      if (impl !== null) {
        // mirror +0x78 -> +0x70. @0x104a3-a7 + fallthrough @0x104b7
        self.impl = impl;
      } else {
        // load `_OZChannelDecibelImpl` singleton, store in both. @0x104a9-b3 + @0x104b7
        self.impl = createOZChannelDecibelImpl_default(); // frontier throw
      }
    } catch (e) {
      // @0x104c6-d4: OZChannel::~OZChannel(this) then Unwind_Resume (rethrow).
      // In TS, we call the base dtor stub (which itself throws — but the outer
      // throw semantics match: the ctor propagates an exception).
      try {
        OZChannel_base_dtor(self);
      } catch {
        /* base dtor is itself a frontier stub; the ctor still propagates `e`. */
      }
      throw e;
    }
    return self;
  }

  /**
   * `OZChannelDecibel::OZChannelDecibel(PCString const& name, OZChannelFolder* folder,
   *   unsigned int uint1, unsigned int uint2, OZChannelImpl* impl, OZChannelInfo* info)`
   *   — @ProChannel 0xa93ea.
   *
   * Faithful transcription (from otool -tvV block above):
   *   1. Save regs — rsi=name (r14), rdx=folder (r13), ecx=uint1 (r12d),
   *      r8d=uint2 spilled to -0x2c(%rbp), r9=impl (r15; also -0x38(%rbp)),
   *      rdi=this (rbx); stack-arg info at 0x10(%rbp). @0xa93ea-40b
   *   2. Call `getOZChannelDecibel_FactoryBase()` -> rax (factory). @0xa940e
   *   3. Put stack-arg info (0x10(%rbp)) at [rsp+0x8]; put impl (r15) at [rsp].
   *      Save r15 also to -0x38(%rbp). @0xa9413-20
   *   4. Call OZChannel::OZChannel(this, factory, name, folder, uint1, uint2, impl, info).
   *      @0xa9437
   *   5. Store vtable+0x10 @(this+0x00) @0xa9447; vtable+0x370 @(this+0x10) @0xa9450.
   *   6. Call createOZChannelDecibelInfo(). @0xa9454
   *   7. Info fixup: test STACK 0x10(%rbp) (the `info` arg). @0xa9459
   *        if (info != NULL) mirror +0x88 -> +0x80.  @0xa9460-67
   *        else load `_OZChannelDecibelInfo`, store to +0x88.  @0xa9469-73
   *      Both fall to `movq %rax, 0x80(%rbx)` @0xa947a.
   *   8. Call createOZChannelDecibelImpl(). @0xa9481
   *   9. Impl fixup: test -0x38(%rbp) (the saved r15 = impl arg). @0xa9486
   *        if (impl != NULL) mirror +0x78 -> +0x70.  @0xa948d-91
   *        else load `_OZChannelDecibelImpl`, store to +0x78.  @0xa9493-9d
   *      Both fall to `movq %rax, 0x70(%rbx)` @0xa94a1.
   *   10. Return @0xa94b3.
   *   Exception path modeled in the try/catch below (same shape as the 5-arg variant).
   */
  static newNamed(
    name: string,
    folder: OZChannelFolder | null,
    uint1: number,
    uint2: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelDecibel {
    const self = new OZChannelDecibel();
    try {
      // Step 2 — @0xa940e.
      const factory = getOZChannelDecibel_FactoryBase(); // frontier throw

      // Step 4 — @0xa9437.
      OZChannel_base_ctor(self, factory, name, folder, uint1, uint2, impl, info); // frontier throw
      // Step 5 — vptrs implicit.

      // Steps 6-7 — info at (+0x88/+0x80). @0xa9459 tests the STACK info arg.
      if (info !== null) {
        self.info = info;                                     // @0xa9460-67 + @0xa947a
      } else {
        self.info = createOZChannelDecibelInfo_default();     // @0xa9469-73 + @0xa947a
      }

      // Steps 8-9 — impl at (+0x78/+0x70). @0xa9486 tests -0x38(%rbp) (saved r15).
      if (impl !== null) {
        self.impl = impl;                                     // @0xa948d-91 + @0xa94a1
      } else {
        self.impl = createOZChannelDecibelImpl_default();     // @0xa9493-9d + @0xa94a1
      }
    } catch (e) {
      // Exception unwind edges are attached to the base-ctor callsite; same
      // shape as the 5-arg variant.
      try {
        OZChannel_base_dtor(self);
      } catch {
        /* frontier */
      }
      throw e;
    }
    return self;
  }

  /**
   * `OZChannelDecibel::~OZChannelDecibel()` [D1] — @ProChannel 0x1d34e.
   *
   * Disasm:
   *   0x1d34e: pushq %rbp
   *   0x1d34f: movq  %rsp, %rbp
   *   0x1d352: popq  %rbp
   *   0x1d353: jmp   __ZN9OZChannelD2Ev     ; tail-jmp OZChannel::~OZChannel()
   *
   * Trivial — no owned resources at this class level; all cleanup delegated
   * to the OZChannel base dtor (which itself is a frontier stub).
   */
  destruct(): void {
    // @0x1d353 — tail-jmp OZChannel::~OZChannel(this)
    OZChannel_base_dtor(this);
  }

  /**
   * `OZChannelDecibel::~OZChannelDecibel()` [D0 deleting] — @ProChannel 0x1d358.
   *
   * Disasm:
   *   0x1d358: pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   0x1d35e: movq  %rdi, %rbx              ; save this
   *   0x1d361: callq __ZN9OZChannelD2Ev      ; OZChannel::~OZChannel(this)
   *   0x1d366: movq  %rbx, %rdi              ; rdi = this
   *   0x1d369: <epilogue>
   *   0x1d36f: jmp   __ZdlPv                 ; ::operator delete(this)  [no-op in GC'd TS]
   *
   * Called via vtable slot when the OZChannel's refcount/release path fires.
   */
  deleteDtor(): void {
    // @0x1d361 — OZChannel::~OZChannel(this)
    OZChannel_base_dtor(this);
    // @0x1d36f — tail-jmp ::operator delete(this) — no-op in GC'd TS.
  }

  /**
   * `OZChannelDecibel::getObjCWrapperName() const` — @ProChannel 0x1cce4.
   *
   * Disasm:
   *   0x1cce4: pushq %rbp
   *   0x1cce5: movq  %rsp, %rbp
   *   0x1cce8: leaq  0xc8161(%rip), %rax   ; RIP-relative CFString pointer
   *                                         (`otool` labels this as "Objc cfstring ref";
   *                                          the loader mangles the exact target string but
   *                                          the RIP offset is 0xc8161 relative to the next
   *                                          instruction @0x1ccef, i.e. target = 0xe4e50 in
   *                                          the ProChannel binary — a CFString constant
   *                                          under the `__objc_classrefs` layout).
   *   0x1ccef: popq %rbp
   *   0x1ccf0: retq
   *
   * The class of the CFString is not decoded in this port (there's no CoreFoundation
   * runtime in TS); the C++ returns a pointer to a static NSString. The wrapper name
   * on this class in the FCP Objective-C runtime is `CHChannelDecibel` — verified by
   * the `-[CHChannelDecibel ozChannel]` symbol appearing right after this class at
   * @0xa92bd in the same binary. We return the string literal exactly.
   */
  getObjCWrapperName(): string {
    // @0x1cce8 — return the RIP-relative CFString "CHChannelDecibel"
    // (target address in the binary = 0x1ccef + 0xc8161 = 0xe4e50, an Objc
    //  CFString ref; the wrapper class name matches the `-[CHChannelDecibel …]`
    //  ObjC method symbol at @0xa92bd in the same binary).
    return "CHChannelDecibel";
  }

  /**
   * `OZChannelDecibel::clone() const` — @ProChannel 0x1d374.
   *
   * Disasm:
   *   0x1d37e: movl  $0x98, %edi          ; sizeof = 152
   *   0x1d383: callq __Znwm                ; operator new(152)
   *   0x1d38b: movq  %rax, %rdi           ; rdi = new'd obj
   *   0x1d38e: movq  %r14, %rsi           ; rsi = this (source)
   *   0x1d391: xorl  %edx, %edx           ; rdx = folder = NULL
   *   0x1d393: callq __ZN9OZChannelC2ERKS_P15OZChannelFolder    ; OZChannel(clone, this, NULL)
   *   0x1d398: leaq  0xb66b1(%rip), %rax  ; = __ZTV16OZChannelDecibel + 0x10  (target 0xd3a50)
   *   0x1d39f: movq  %rax, (%rbx)         ; (this+0x00) = primary vptr
   *   0x1d3a2: leaq  0xb6a07(%rip), %rax  ; = __ZTV16OZChannelDecibel + 0x370 (target 0xd3db0)
   *   0x1d3a9: movq  %rax, 0x10(%rbx)     ; (this+0x10) = secondary vptr
   *   0x1d3ad: movq  %rbx, %rax           ; return new'd obj
   *
   * Notable: clone DOES NOT call `createOZChannelDecibelInfo/Impl`. The base
   * OZChannel copy ctor is expected to copy the info/impl pointer fields
   * verbatim from the source (the +0x70/+0x78/+0x80/+0x88 slots) — clone only
   * has to overwrite the two vtable pointers to point at OZChannelDecibel's
   * vtable rather than OZChannel's. This matches the OZChannelAngle sibling
   * clone if/when it lands.
   *
   * Exception path @0x1d3b5-c3: `::operator delete(new_obj)` @0x1d3bb, then
   * `__Unwind_Resume` @0x1d3c3 — same shape as OZChannelAngle's implicit unwind.
   */
  clone(): OZChannelDecibel {
    // @0x1d383 — operator new(0x98). In TS we simply construct the class shape.
    const cloned = new OZChannelDecibel();
    try {
      // @0x1d393 — OZChannel copy ctor with folder = NULL.
      OZChannel_copy_ctor(cloned, this, null); // frontier throw
      // @0x1d39f — primary vptr write (implicit).
      // @0x1d3a9 — secondary vptr write (implicit).
      // NB: info/impl are copied by the base OZChannel copy ctor (from the
      // +0x70/+0x78/+0x80/+0x88 slots), so we do NOT touch them here.
    } catch (e) {
      // @0x1d3bb — ::operator delete(new'd) is a no-op in TS (GC).
      throw e;
    }
    return cloned;
  }
}
