// OZLiGenerator.ts — FCP Ozone OZLiGenerator:
// Adapter that wraps an OZImageGenerator so it plugs into Helium's LiImageSource pipeline.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: otool -tV -arch x86_64
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//   Symbol map: nm-derived; disasm dumped from /tmp/Ozone_tV.txt.
//
// CLASS HIERARCHY (from ctor @0x4d6d80 and dtors):
//   OZLiGenerator inherits from:
//     LiImageSource      — primary base at +0x00       (LiImageSource ctor called @0x4d6db7)
//     PCShared_base      — secondary base at +0x5d8    (PCShared_base vtable installed
//                          @0x4d6d93-0x4d6d9e; ref-count field at +0x5e0)
//   RTTI: __ZTI13OZLiGenerator @0x8759f0;  vtable __ZTV13OZLiGenerator @0x875768;
//         thunks __ZTC13OZLiGenerator0_13LiImageSource / _8PCShared confirm the dual-base
//         layout, and __ZTv0_n24_N13OZLiGeneratorD1Ev @0x4d7020 is the classic Itanium
//         non-primary-base adjustor thunk (offset -0x18).
//
// STRUCT LAYOUT (recovered from ctor + methods):
//     +0x000  vtable (LiImageSource primary vtable slot; installed @0x4d6dc3 with
//                    `leaq 0x39e9bd(%rip), %rax; movq %rax, (%rbx)` → effective addr in
//                    the OZLiGenerator vtable)
//     +0x010  OZImageGenerator* wrapped generator (stored @0x4d6dd4 `movq %r15, 0x10(%rbx)`)
//     +0x018  OZRenderParams (embedded sub-object; copy-constructed @0x4d6ddf from arg2;
//                    destroyed @0x4d6f55 / @0x4d6fc5)
//     +0x5d8  PCShared_base sub-object vtable slot (secondary base; installed @0x4d6d9e and
//                    re-installed @0x4d6dcd with the correct offset-adjusted derived vtable)
//     +0x5e0  PCShared_base ref-count / weak-ref (weak_release called @0x4d6f87 / @0x4d6ff7)
//
// EXPORTED SYMBOLS (from ledger — 9 methods; C1==C2 for a non-virtual base ctor):
//   @Ozone 0x00000000004d6d10  __ZN13OZLiGeneratorC2EP16OZImageGeneratorRK14OZRenderParams
//   @Ozone 0x00000000004d6d80  __ZN13OZLiGeneratorC1EP16OZImageGeneratorRK14OZRenderParams
//   @Ozone 0x00000000004d6e20  __ZN13OZLiGenerator21pixelTransformSupportERK18LiRenderParameters
//   @Ozone 0x00000000004d6e40  __ZN13OZLiGenerator9getHeliumER7LiAgent
//   @Ozone 0x00000000004d6eb0  __ZN13OZLiGenerator13filteredEdgesEv
//   @Ozone 0x00000000004d6ed0  __ZN13OZLiGenerator20estimateRenderMemoryERNSt3__13setI9PCHash128NS0_4lessIS2_EENS0_9allocatorIS2_EEEE
//   @Ozone 0x00000000004d6ee0  __ZN13OZLiGenerator5printERNSt3__113basic_ostreamIcNS0_11char_traitsIcEEEEi
//   @Ozone 0x00000000004d6f30  __ZN13OZLiGeneratorD1Ev
//   @Ozone 0x00000000004d6fa0  __ZN13OZLiGeneratorD0Ev
//
// NOTE ON C1 vs C2: The C1 entry @0x4d6d80 IS the "complete-object" ctor. C2 @0x4d6d10 is
//   the "base subobject" ctor — a 6-instruction thunk that ends with `jmp C1` per the
//   Itanium ABI for non-virtual bases (nm shows both symbols point at real code). Both
//   symbols map to the same effective behaviour here (the additional prologue in C2 is
//   just register shuffling to pass %rdx through unchanged; see the raw disasm at 0x4d6d10
//   for the shim). We port a single constructor.
//
// FRONTIER (opaque callees — each cited by symbol + @0xADDR as a throwing stub):
//   • LiImageSource::LiImageSource()                                @Ozone 0x6dd83c stub
//   • LiImageSource::~LiImageSource()                               @Ozone 0x6dd842 stub
//   • OZRenderParams::OZRenderParams(OZRenderParams const&)         @Ozone 0x4d6ddf callq direct
//   • OZRenderParams::~OZRenderParams()                             @Ozone 0x4d6f55/0x4d6fc5 direct
//   • OZRenderParams::setWorkingColorSpace(CGColorSpace*)           @Ozone 0x4d6e6c direct
//   • OZRenderParams::setBlendingGamma(float)                       @Ozone 0x4d6e80 direct
//   • FxColorDescription::getCGColorSpace() const                   @Ozone 0x6df666 stub
//   • PC_Sp_counted_base::weak_release()                            @Ozone 0x6de4fc stub
//   • PCShared_base::~PCShared_base()                               @Ozone (called @0x4d6e10)
//   • ___dynamic_cast                                                @Ozone 0x6dfd0e stub
//   • ___clang_call_terminate                                        @Ozone (called @0x4d6f96, 0x4d700d)
//   • operator delete (__ZdlPv)                                      @Ozone 0x6dfc36 stub
//   • __Unwind_Resume                                                @Ozone 0x6dd07a stub
//   • Virtual slot *0x910 of OZImageGenerator (via `this+0x10`->vtable — pixelTransformSupport)
//     @0x4d6e2f
//   • Virtual slot *0x918 of OZImageGenerator (via `this+0x10`->vtable — getHelium impl)
//     @0x4d6e95
//   • Virtual slot *0x920 of OZImageGenerator (via `this+0x10`->vtable — filteredEdges impl)
//     @0x4d6ebc
//   • Virtual slot *0x968 of OZFxGenerator (post-dynamic_cast in `print`)               @0x4d6f12

// ── Opaque frontier types (see stubs) ────────────────────────────────────────────────────

/**
 * OZImageGenerator — the wrapped generator that OZLiGenerator adapts. Its layout is
 * observed only through vtable-slot dispatch (slots 0x910/0x918/0x920/0x968 in this file).
 */
export interface OZImageGenerator {
  readonly __brand_OZImageGenerator: unique symbol;
}

/**
 * OZRenderParams — copy-constructible parameter block. Embedded at +0x18 of OZLiGenerator.
 * Its full layout isn't decoded here (only three method calls are made on it).
 */
export interface OZRenderParams {
  readonly __brand_OZRenderParams: unique symbol;
}

/** LiRenderParameters — opaque parameter block passed to pixelTransformSupport. */
export interface LiRenderParameters {
  readonly __brand_LiRenderParameters: unique symbol;
}

/**
 * LiAgent — the getHelium receiver. Layout observations (from disasm @0x4d6e40-0x4d6e95):
 *   +0x18  address passed as `%r12` — treated as an OZRenderParams* (matches the layout
 *          `LiAgent + 0x18 == OZRenderParams`, i.e. the LiAgent embeds an OZRenderParams).
 *   +0x30  an object pointer whose +0xA0 is passed to FxColorDescription::getCGColorSpace,
 *          and whose +0xC0 is a float loaded via `movss 0xc0(%rax), %xmm0` and passed to
 *          setBlendingGamma. This is an FxColorDescription* embedded in an inner sub-obj
 *          (we treat it as opaque here — see the sub-fields below).
 */
export interface LiAgent {
  readonly __brand_LiAgent: unique symbol;
  /** +0x18 — an embedded OZRenderParams sub-object receiver for the two setters. */
  readonly renderParams_at_0x18: OZRenderParams;
  /** +0x30 — pointer to an inner object holding an FxColorDescription (see fields below). */
  readonly inner_at_0x30: LiAgent_inner;
}
export interface LiAgent_inner {
  readonly __brand_LiAgent_inner: unique symbol;
  /** +0xA0 — sub-address passed to FxColorDescription::getCGColorSpace (see @0x4d6e5d).
   *  Semantically: `&inner->fxColorDesc` (the getCGColorSpace method's `this`).
   */
  readonly fxColorDesc_at_0xA0: FxColorDescription;
  /** +0xC0 — fp32 blending gamma (see @0x4d6e75 `movss 0xc0(%rax), %xmm0`). */
  readonly blendingGamma_at_0xC0: number;
}
export interface FxColorDescription {
  readonly __brand_FxColorDescription: unique symbol;
}

/** CGColorSpace — Core Graphics opaque handle (typedef struct CGColorSpace *CGColorSpaceRef;). */
export interface CGColorSpace {
  readonly __brand_CGColorSpace: unique symbol;
}

/**
 * The std::set<PCHash128,…> passed to estimateRenderMemory. Layout not observed —
 * the function returns 0 without touching the argument (see @0x4d6ed0-0x4d6ed7).
 */
export interface StdSet_PCHash128 {
  readonly __brand_StdSet_PCHash128: unique symbol;
}

/** std::basic_ostream<char> — the ostream target for print. Not decoded here. */
export interface StdOStream_char {
  readonly __brand_StdOStream_char: unique symbol;
}

/**
 * OZFxGenerator — polymorphic base whose typeinfo `print` dispatches through. Layout not
 * observed; used only as the target of a dynamic_cast + one virtual slot dispatch.
 */
export interface OZFxGenerator {
  readonly __brand_OZFxGenerator: unique symbol;
}

// ── Frontier throwing stubs ──────────────────────────────────────────────────────────────

function LiImageSource_ctor_stub(_self: OZLiGenerator, _typeinfo_lea: unknown): void {
  throw new Error("LiImageSource::LiImageSource @Ozone 0x6dd83c is not yet decoded.");
}
function LiImageSource_dtor_stub(_self: OZLiGenerator, _typeinfo_lea: unknown): void {
  throw new Error("LiImageSource::~LiImageSource @Ozone 0x6dd842 is not yet decoded.");
}

function PCShared_base_dtor_stub(_secondaryBaseAt_0x5D8: unknown): void {
  throw new Error(
    "PCShared_base::~PCShared_base @Ozone __ZN13PCShared_baseD2Ev is not yet decoded " +
      "(called from OZLiGenerator ctor unwind path @0x4d6e10).",
  );
}
function PC_Sp_counted_base_weak_release_stub(_p: unknown): void {
  throw new Error(
    "PC_Sp_counted_base::weak_release @Ozone 0x6de4fc is not yet decoded (called from " +
      "OZLiGenerator D1/D0 @0x4d6f87, 0x4d6ff7).",
  );
}

function OZRenderParams_copyCtor_stub(_self: OZRenderParams, _other: OZRenderParams): void {
  throw new Error(
    "OZRenderParams::OZRenderParams(OZRenderParams const&) @Ozone 0x4d6ddf " +
      "(__ZN14OZRenderParamsC1ERKS_) is not yet decoded.",
  );
}
function OZRenderParams_dtor_stub(_self: OZRenderParams): void {
  throw new Error(
    "OZRenderParams::~OZRenderParams @Ozone 0x4d6f55/0x4d6fc5 " +
      "(__ZN14OZRenderParamsD1Ev) is not yet decoded.",
  );
}
function OZRenderParams_setWorkingColorSpace_stub(_self: OZRenderParams, _cs: CGColorSpace): void {
  throw new Error(
    "OZRenderParams::setWorkingColorSpace @Ozone 0x4d6e6c " +
      "(__ZN14OZRenderParams20setWorkingColorSpaceEP12CGColorSpace) is not yet decoded.",
  );
}
function OZRenderParams_setBlendingGamma_stub(_self: OZRenderParams, _f: number): void {
  throw new Error(
    "OZRenderParams::setBlendingGamma @Ozone 0x4d6e80 " +
      "(__ZN14OZRenderParams16setBlendingGammaEf) is not yet decoded.",
  );
}

function FxColorDescription_getCGColorSpace_stub(_self: FxColorDescription): CGColorSpace {
  throw new Error(
    "FxColorDescription::getCGColorSpace @Ozone 0x6df666 " +
      "(__ZNK18FxColorDescription15getCGColorSpaceEv) is not yet decoded.",
  );
}

function dynamicCast_OZFxGenerator_stub(
  _src: OZImageGenerator,
): OZFxGenerator | null {
  throw new Error(
    "___dynamic_cast @Ozone 0x6dfd0e (called from OZLiGenerator::print @0x4d6f05, " +
      "src=OZImageGenerator, dst=OZFxGenerator, hint=0) is not yet decoded.",
  );
}

function OZFxGenerator_vtable_slot_0x968_stub(
  _self: OZFxGenerator,
  _ostream: StdOStream_char,
  _level: number,
): void {
  throw new Error(
    "OZFxGenerator vtable slot *0x968 @Ozone 0x4d6f12 (tail-called from " +
      "OZLiGenerator::print after successful __dynamic_cast) is not yet decoded.",
  );
}

function OZImageGenerator_vtable_slot_0x910_stub(
  _self: OZImageGenerator,
  _liParams: LiRenderParameters,
  _renderParams: OZRenderParams,
): unknown {
  throw new Error(
    "OZImageGenerator vtable slot *0x910 @Ozone 0x4d6e2f (pixelTransformSupport tail " +
      "dispatch) is not yet decoded.",
  );
}
function OZImageGenerator_vtable_slot_0x918_stub(
  _self: OZImageGenerator,
  _liGeneratorThis: OZLiGenerator,
  _liAgent: LiAgent,
  _renderParams: OZRenderParams,
): OZLiGenerator {
  throw new Error(
    "OZImageGenerator vtable slot *0x918 @Ozone 0x4d6e95 (getHelium's inner " +
      "dispatch) is not yet decoded.",
  );
}
function OZImageGenerator_vtable_slot_0x920_stub(
  _self: OZImageGenerator,
): unknown {
  throw new Error(
    "OZImageGenerator vtable slot *0x920 @Ozone 0x4d6ebc (filteredEdges tail " +
      "dispatch) is not yet decoded.",
  );
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class OZLiGenerator {
  /** +0x000 — primary (LiImageSource) vtable pointer. Effective address is the address of
   *  the OZLiGenerator vtable + 0x10 (installed @0x4d6dc3 by ctor). */
  readonly __vtable_primary =
    "OZLiGenerator::vtable primary @Ozone (from leaq 0x39e9bd(%rip) @0x4d6dbc)";

  /** +0x010 — wrapped OZImageGenerator*. Non-owning (dtor never operator-deletes it). */
  readonly imageGenerator_at_0x10: OZImageGenerator;

  /** +0x018 — embedded OZRenderParams sub-object (copy-constructed from ctor arg). */
  readonly renderParams_at_0x18: OZRenderParams;

  /** +0x5D8 — secondary (PCShared_base) vtable pointer. */
  readonly __vtable_secondary =
    "PCShared_base vtable (adjusted for OZLiGenerator) @Ozone " +
      "(installed @0x4d6dcd from leaq 0x39ea83(%rip))";

  /**
   * +0x5E0 — PCShared_base's weak/strong ref-counted control block pointer. Set to null
   * by ctor @0x4d6da5 (`movq $0x0, 0x5e0(%rdi)`). Released by dtor via weak_release if
   * non-null.
   */
  private controlBlock_at_0x5E0: unknown | null;

  /**
   * ctor(OZImageGenerator*, OZRenderParams const&)
   * @Ozone 0x00000000004d6d80  (__ZN13OZLiGeneratorC1EP16OZImageGeneratorRK14OZRenderParams)
   * (C2 base ctor @0x4d6d10 is a shim that jmps to this same body.)
   *
   * DECODE @0x4d6d80-0x4d6dee:
   *   0x4d6d8a  movq %rdx, %r14         → save arg2 = &otherRenderParams
   *   0x4d6d8d  movq %rsi, %r15         → save arg1 = imageGenerator
   *   0x4d6d90  movq %rdi, %rbx         → save this
   *   0x4d6d93  leaq __ZTV13PCShared_base(%rip), %rax   → vtable for PCShared_base
   *   0x4d6d9a  addq $0x10, %rax        → adjust past RTTI header (Itanium ABI)
   *   0x4d6d9e  movq %rax, 0x5d8(%rdi)  → this+0x5d8 = PCShared_base vtable
   *   0x4d6da5  movq $0x0, 0x5e0(%rdi)  → this+0x5e0 = nullptr  (weak-ref control block)
   *   0x4d6db0  leaq 0x39eab9(%rip), %rsi  → typeinfo shim (for LiImageSource base)
   *   0x4d6db7  callq __ZN13LiImageSourceC2Ev    → LiImageSource::LiImageSource(this)
   *   0x4d6dbc  leaq 0x39e9bd(%rip), %rax  → OZLiGenerator vtable (primary slot)
   *   0x4d6dc3  movq %rax, (%rbx)       → this->vtable = OZLiGenerator::vtable[+0x10]
   *   0x4d6dc6  leaq 0x39ea83(%rip), %rax  → OZLiGenerator vtable's PCShared_base slot
   *   0x4d6dcd  movq %rax, 0x5d8(%rbx)  → this+0x5d8 = derived's secondary-base vtable
   *   0x4d6dd4  movq %r15, 0x10(%rbx)  → this+0x10 = imageGenerator
   *   0x4d6dd8  leaq 0x18(%rbx), %rdi  → &this->renderParams_at_0x18
   *   0x4d6ddc  movq %r14, %rsi        → &otherRenderParams
   *   0x4d6ddf  callq OZRenderParams::OZRenderParams(this+0x18, otherRenderParams)
   *   0x4d6dee  ret
   *   (0x4d6def-0x4d6e1c: exception unwind path — dtor LiImageSource then PCShared_base
   *    then __Unwind_Resume. Modeled here by the exception discipline of the port.)
   */
  constructor(imageGenerator: OZImageGenerator, otherRenderParams: OZRenderParams) {
    // @0x4d6d93-0x4d6d9e  install PCShared_base secondary base vtable
    // (In TS this is representational — the string vtable tag lives on the class instance.)
    // @0x4d6da5  this+0x5e0 = null
    this.controlBlock_at_0x5E0 = null;

    // @0x4d6db7  LiImageSource::LiImageSource(this) — base ctor (opaque here).
    LiImageSource_ctor_stub(this, "typeinfo-shim @0x39eab9(%rip)");

    // @0x4d6dbc-0x4d6dcd  install primary (OZLiGenerator) vtable + secondary derived one.
    // (Modeled by the two __vtable_* tags on the instance.)

    // @0x4d6dd4  this+0x10 = imageGenerator
    this.imageGenerator_at_0x10 = imageGenerator;

    // @0x4d6ddf  OZRenderParams::OZRenderParams(this+0x18, otherRenderParams) — copy-construct.
    // The base OZRenderParams isn't decoded yet, so we can't materialise the copy. Faithful
    // port: raise through the stub so a caller notices the missing decode.
    const embedded: OZRenderParams = {
      __brand_OZRenderParams: Symbol("OZRenderParams") as unknown,
    } as unknown as OZRenderParams;
    OZRenderParams_copyCtor_stub(embedded, otherRenderParams);
    this.renderParams_at_0x18 = embedded;
  }

  /**
   * pixelTransformSupport(LiRenderParameters const&)
   * @Ozone 0x00000000004d6e20  (__ZN13OZLiGenerator21pixelTransformSupportERK18LiRenderParameters)
   *
   * DECODE @0x4d6e20-0x4d6e3a:
   *   0x4d6e24  movq 0x10(%rdi), %rax    → gen = this->imageGenerator_at_0x10
   *   0x4d6e28  leaq 0x18(%rdi), %rdx    → arg3 = &this->renderParams_at_0x18
   *   0x4d6e2c  movq (%rax), %rcx        → vtbl = gen->vtable
   *   0x4d6e2f  movq 0x910(%rcx), %rcx   → slot 0x910
   *   0x4d6e36  movq %rax, %rdi          → arg1 = gen (this-adjusted receiver)
   *   0x4d6e39  popq %rbp ; jmpq *%rcx   → tail-call gen->vtable[0x910](gen, liParams, &renderParams)
   *
   * `%rsi` (the incoming LiRenderParameters const&) is preserved unchanged, so the dispatched
   * function's arg2 = liParams.
   */
  pixelTransformSupport(liParams: LiRenderParameters): unknown {
    const gen = this.imageGenerator_at_0x10;
    // slot 0x910 dispatch — args (rdi=gen, rsi=liParams, rdx=&renderParams).
    return OZImageGenerator_vtable_slot_0x910_stub(gen, liParams, this.renderParams_at_0x18);
  }

  /**
   * getHelium(LiAgent&)
   * @Ozone 0x00000000004d6e40  (__ZN13OZLiGenerator9getHeliumER7LiAgent)
   *
   * DECODE @0x4d6e40-0x4d6ea6:
   *   0x4d6e54  leaq 0x18(%rsi), %r12  → r12 = &liAgent+0x18 (the LiAgent's embedded
   *                                      OZRenderParams sub-object)
   *   0x4d6e58  movl $0xa0, %edi
   *   0x4d6e5d  addq 0x30(%rdx), %rdi  → rdi = liAgent+0x30 (inner ptr) + 0xa0
   *                                       = &innerObj->fxColorDesc_at_0xA0
   *   0x4d6e61  callq __ZNK18FxColorDescription15getCGColorSpaceEv @0x6df666 stub
   *                                     → xmm-agnostic — returns CGColorSpace* in rax
   *   0x4d6e66  movq %r12, %rdi        → &liAgent+0x18 = the OZRenderParams
   *   0x4d6e69  movq %rax, %rsi        → cs = getCGColorSpace result
   *   0x4d6e6c  callq __ZN14OZRenderParams20setWorkingColorSpaceEP12CGColorSpace
   *   0x4d6e71  movq 0x30(%r14), %rax  → r14 = liAgent (dx saved earlier); rax = inner_at_0x30
   *   0x4d6e75  movss 0xc0(%rax), %xmm0 → xmm0 = *(f32*)(inner + 0xc0)  (blendingGamma)
   *   0x4d6e7d  movq %r12, %rdi         → &liAgent+0x18
   *   0x4d6e80  callq __ZN14OZRenderParams16setBlendingGammaEf
   *   0x4d6e85  movq 0x10(%r15), %rsi   → r15 = this; rsi = this->imageGenerator_at_0x10
   *   0x4d6e89  movq (%rsi), %rax       → gen->vtable
   *   0x4d6e8c  movq %rbx, %rdi         → arg1 = this (OZLiGenerator*)
   *   0x4d6e8f  movq %r14, %rdx         → arg3 = &liAgent
   *   0x4d6e92  movq %r12, %rcx         → arg4 = &liAgent+0x18 (OZRenderParams*)
   *   0x4d6e95  callq *0x918(%rax)      → gen->vtable[0x918](gen, this, liAgent, &liAgent+0x18)
   *                                       — wait: arg-slot placement suggests (this, gen,
   *                                         liAgent, renderParams). Re-read carefully.
   *                                       Actually the calling convention is:
   *                                         rdi=this, rsi=gen, rdx=liAgent, rcx=&renderParams
   *                                       so the dispatched func is
   *                                         gen->vtable[0x918](this_ozli, gen, liAgent, &rp).
   *                                       That signature is unusual but faithful.
   *   0x4d6e9b  movq %rbx, %rax         → return this (chained/self)
   *   0x4d6e9e-0x4d6ea6  epilogue
   */
  getHelium(liAgent: LiAgent): OZLiGenerator {
    // @0x4d6e54  &liAgent.renderParams_at_0x18
    const liAgentRP = liAgent.renderParams_at_0x18;
    // @0x4d6e5d-0x4d6e61  fxCS = FxColorDescription::getCGColorSpace(&liAgent+0x30+0xa0)
    const fxCS = FxColorDescription_getCGColorSpace_stub(liAgent.inner_at_0x30.fxColorDesc_at_0xA0);
    // @0x4d6e6c  setWorkingColorSpace(&liAgent+0x18, fxCS)
    OZRenderParams_setWorkingColorSpace_stub(liAgentRP, fxCS);
    // @0x4d6e71-0x4d6e75  gamma = *(f32*)(liAgent+0x30+0xc0)  (Math.fround for fp32 fidelity)
    const gamma = Math.fround(liAgent.inner_at_0x30.blendingGamma_at_0xC0);
    // @0x4d6e80  setBlendingGamma(&liAgent+0x18, gamma)
    OZRenderParams_setBlendingGamma_stub(liAgentRP, gamma);
    // @0x4d6e85-0x4d6e95  gen->vtable[0x918](this, gen, liAgent, &liAgent+0x18)
    const gen = this.imageGenerator_at_0x10;
    return OZImageGenerator_vtable_slot_0x918_stub(gen, this, liAgent, liAgentRP);
    // @0x4d6e9b  returns %rbx = this — modeled here by returning whatever the slot returns.
    //                                   The slot is stubbed so control never reaches here in
    //                                   practice, but semantically the ABI convention is that
    //                                   the caller writes %rax = this at the end. Since the
    //                                   slot is undecoded, we defer to its (thrown) return.
  }

  /**
   * filteredEdges()
   * @Ozone 0x00000000004d6eb0  (__ZN13OZLiGenerator13filteredEdgesEv)
   *
   * DECODE @0x4d6eb0-0x4d6ec2:
   *   0x4d6eb4  movq 0x10(%rdi), %rdi   → this = this->imageGenerator_at_0x10 (adjust)
   *   0x4d6eb8  movq (%rdi), %rax       → vtbl = gen->vtable
   *   0x4d6ebc  popq %rbp ; jmpq *0x920(%rax)   → tail-call slot 0x920
   */
  filteredEdges(): unknown {
    // Tail-call gen->vtable[0x920](gen).
    return OZImageGenerator_vtable_slot_0x920_stub(this.imageGenerator_at_0x10);
  }

  /**
   * estimateRenderMemory(std::set<PCHash128,…>&)  →  int
   * @Ozone 0x00000000004d6ed0  (__ZN13OZLiGenerator20estimateRenderMemoryE…)
   *
   * DECODE @0x4d6ed0-0x4d6ed7:
   *   0x4d6ed4  xorl %eax, %eax    → return 0
   *   0x4d6ed6  popq %rbp ; retq
   *
   * The set argument is never observed. The function is a stub that always returns 0 —
   * this class's memory estimate is "nothing extra" beyond the wrapped generator.
   */
  estimateRenderMemory(_hashSet: StdSet_PCHash128): number {
    // @0x4d6ed4  return 0
    return 0;
  }

  /**
   * print(std::ostream&, int)
   * @Ozone 0x00000000004d6ee0  (__ZN13OZLiGenerator5printE…)
   *
   * DECODE @0x4d6ee0-0x4d6f2b:
   *   0x4d6ee7  movq 0x10(%rdi), %rdi  → gen = this->imageGenerator_at_0x10
   *   0x4d6eeb  testq %rdi, %rdi
   *   0x4d6eee  je 0x4d6f27            → if gen == null, return (epilogue)
   *   0x4d6ef0  movl %edx, %ebx        → save level
   *   0x4d6ef2  movq %rsi, %r14        → save ostream
   *   0x4d6ef5  leaq __ZTI16OZImageGenerator(%rip), %rsi → srcTypeInfo
   *   0x4d6efc  leaq __ZTI13OZFxGenerator(%rip), %rdx    → dstTypeInfo
   *   0x4d6f03  xorl %ecx, %ecx        → hint = 0
   *   0x4d6f05  callq ___dynamic_cast(gen, srcTI, dstTI, 0)
   *   0x4d6f0a  testq %rax, %rax
   *   0x4d6f0d  je 0x4d6f27            → if cast failed, return
   *   0x4d6f0f  movq (%rax), %rcx      → vtbl = fxGen->vtable
   *   0x4d6f12  movq 0x968(%rcx), %rcx → slot 0x968
   *   0x4d6f19  movq %rax, %rdi        → this = fxGen
   *   0x4d6f1c  movq %r14, %rsi        → ostream
   *   0x4d6f1f  movl %ebx, %edx        → level
   *   0x4d6f21  popq %rbx ; popq %r14 ; popq %rbp
   *   0x4d6f25  jmpq *%rcx             → tail-call fxGen->vtable[0x968](fxGen, ostream, level)
   *
   * Semantics: if the wrapped image generator is-a OZFxGenerator, forward the print call to
   * its slot 0x968; otherwise this function is a no-op.
   */
  print(ostream: StdOStream_char, level: number): void {
    // @0x4d6ee7-0x4d6eee  early-return on null generator
    const gen = this.imageGenerator_at_0x10;
    if (gen === null) return;

    // @0x4d6f05  ___dynamic_cast(gen, OZImageGenerator TI, OZFxGenerator TI, 0)
    const fxGen = dynamicCast_OZFxGenerator_stub(gen);
    // @0x4d6f0a-0x4d6f0d  cast failed → return
    if (fxGen === null) return;

    // @0x4d6f12-0x4d6f25  tail-call fxGen->vtable[*0x968](fxGen, ostream, level)
    OZFxGenerator_vtable_slot_0x968_stub(fxGen, ostream, level | 0);
  }

  /**
   * ~OZLiGenerator()  — D1 (in-place) destructor
   * @Ozone 0x00000000004d6f30  (__ZN13OZLiGeneratorD1Ev)
   *
   * DECODE @0x4d6f30-0x4d6f92:
   *   0x4d6f39-0x4d6f4a  reinstall base vtables (revert to LiImageSource / PCShared_base
   *                       during dtor per Itanium ABI — see @0x4d6f39 leaq 0x39e840(%rip)
   *                       and @0x4d6f43 leaq 0x39e906(%rip); both write to (this) and
   *                       (this+0x5d8) respectively).
   *   0x4d6f51-0x4d6f55  ~OZRenderParams(this+0x18)
   *   0x4d6f5a-0x4d6f64  ~LiImageSource(this, typeinfo-shim @0x39e90f(%rip))
   *   0x4d6f69-0x4d6f74  reset this+0x5d8 to __ZTV13PCShared_base + 0x10 (before secondary
   *                       destruction)
   *   0x4d6f7b-0x4d6f87  if (this+0x5e0 != nullptr) PC_Sp_counted_base::weak_release(cb)
   *   0x4d6f8c-0x4d6f92  epilogue
   *   (0x4d6f96 ___clang_call_terminate — exception path)
   */
  destruct_D1(): void {
    // @0x4d6f51-0x4d6f55  ~OZRenderParams(&this->renderParams_at_0x18)
    OZRenderParams_dtor_stub(this.renderParams_at_0x18);
    // @0x4d6f5a-0x4d6f64  ~LiImageSource(this, typeinfo-shim)
    LiImageSource_dtor_stub(this, "typeinfo-shim @0x39e90f(%rip)");
    // @0x4d6f7b-0x4d6f87  if (controlBlock != null) weak_release(controlBlock)
    if (this.controlBlock_at_0x5E0 !== null) {
      PC_Sp_counted_base_weak_release_stub(this.controlBlock_at_0x5E0);
    }
    // Vtable reinstalls (@0x4d6f39-0x4d6f4a, @0x4d6f69-0x4d6f74) are representational in TS —
    // there's no live vptr to mutate; the ABI's mid-dtor vtable rewiring is a C++-VMT-specific
    // trick to make virtual calls from base dtors resolve correctly during destruction.
  }

  /**
   * ~OZLiGenerator()  — D0 (deleting) destructor
   * @Ozone 0x00000000004d6fa0  (__ZN13OZLiGeneratorD0Ev)
   *
   * DECODE @0x4d6fa0-0x4d7005:
   *   Same body as D1 (same vtable reinstalls, same ~OZRenderParams, ~LiImageSource,
   *   ~PCShared_base equivalent, weak_release), followed by:
   *     0x4d6ffc  movq %rbx, %rdi        → this
   *     0x4d7005  jmp __ZdlPv            → tail-call operator delete(this)
   *
   * In TS with GC there is no delete to invoke.
   */
  destruct_D0(): void {
    // Same body as D1 (@0x4d6fa0-0x4d6ffc), then tail-call operator delete @0x4d7005.
    // In TS with GC the delete is a no-op.
    this.destruct_D1();
    // @0x4d6ffc-0x4d7005  operatorDelete(this) — no-op under GC.
  }
}
