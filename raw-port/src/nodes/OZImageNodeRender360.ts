// OZImageNodeRender360 — Ozone.framework. A 360°/equirect image render node. Bridges
// an OZElement (specifically an OZImageElement, verified via dynamic_cast) and an
// OZRenderParams-derived pipeline into the LiImageSource interface used by the Helium
// rasterizer.
//
// Class hierarchy (recovered from ctor + dtor + vtable pointers written by D1):
//   LiImageSource   (base, ctor call @Ozone 0x0041db91, ctor arg = this+0x8)
//     |__ OZImageNodeRender360    (this+0x00 vtable, this+0x5d8 secondary vtable)
//                                 (PCShared_base tail vtable installed by D1 @0x41e649)
//
// Layout recovered from the C2 ctor (@Ozone 0x0041db70) and the dtor (@0x0041e610):
//   +0x000  vtable ptr (primary — OZImageNodeRender360 vtable)
//   +0x008  LiImageSource base subobject (constructed in place at this+0x8)
//   +0x010  OZElement*                             (arg 2 of ctor, saved verbatim)
//   +0x018  OZRenderParams                         (copy-constructed from const& arg)
//   +0x5d0  (unused / padding — not touched by any decoded method)
//   +0x5d8  secondary vtable ptr (PCShared_base or its owner — installed by D1)
//   +0x5e0  __shared_weak_count* (weak_release'd by D1 if non-null)
//
// Ported methods (each cites @0xADDR):
//   @Ozone 0x0041db70  OZImageNodeRender360::OZImageNodeRender360(OZElement*, OZRenderParams const&) (C2)
//   @Ozone 0x0041dc80  OZImageNodeRender360::getBoundary(LiAgent&, PCRect<double>*)   (STUB)
//   @Ozone 0x0041dcb0  OZImageNodeRender360::filteredEdges()                          -> 0
//   @Ozone 0x0041dcc0  OZImageNodeRender360::pixelTransformSupport(LiRenderParameters const&) -> 3
//   @Ozone 0x0041dcd0  OZImageNodeRender360::fixPixelTransform(LiAgent&, PCMatrix44Tmpl<double>*, LiRenderParameters const&) (STUB)
//   @Ozone 0x0041e210  OZImageNodeRender360::estimateRenderMemory(std::set<PCHash128>&) (STUB — dispatches through OZImageElement)
//   @Ozone 0x0041e610  OZImageNodeRender360::~OZImageNodeRender360() (D1)                (STUB — vtable dance)
//   @Ozone 0x0041e680  OZImageNodeRender360::~OZImageNodeRender360() (D0 — deleting)     (STUB)
//   @Ozone (getHelium — 224 lines, deep frontier)                                    (STUB — see below)
//
// Referenced frontier symbols (each stub cites its addr / callsite):
//   @Ozone 0x0041db91  __ZN13LiImageSourceC2Ev           LiImageSource::LiImageSource()
//   @Ozone 0x0041dbb4  __ZN14OZRenderParamsC1ERKS_       OZRenderParams::OZRenderParams(OZRenderParams const&)
//   @Ozone 0x0041dd03  __ZNK14OZRenderParams13getResolutionEv  OZRenderParams::getResolution() const
//   @Ozone 0x0041e226  typeinfo OZElement / OZImageElement
//   @Ozone 0x0041e251  __ZN14OZImageElement20estimateRenderMemoryERNSt3__13setI9PCHash128...ERK14OZRenderParams
//                     OZImageElement::estimateRenderMemory(set&, OZRenderParams const&)
//   @Ozone 0x0041dca2  virtual dispatch via HGImage vtable slot *0x20 (called via this+0x10 -> +0x1978)
//   @Ozone 0x0041dce9  virtual dispatch via LiAgent(?) vtable slot *0x38 (called via arg1 -> *)
//   @Ozone 0x0041e635  OZRenderParams::~OZRenderParams()
//   @Ozone 0x0041e644  LiImageSource::~LiImageSource()
//   @Ozone 0x0041e649  vtable for PCShared_base (leaq __ZTV13PCShared_base +0x10)
//   @Ozone 0x0041e667  PC_Sp_counted_base::weak_release() (stub 0x6de4fc)
//   plus ___dynamic_cast (stub 0x6dfd0e), __Unwind_Resume (0x6dd07a), __ZdlPv (0x6dfc36).
//
// Source disassembly:
//   raw-port/re/disasm/OZImageNodeRender360.filteredEdges.s
//   raw-port/re/disasm/OZImageNodeRender360.pixelTransformSupport.s
//   raw-port/re/disasm/OZImageNodeRender360.getBoundary.s
//   raw-port/re/disasm/OZImageNodeRender360.fixPixelTransform.s
//   raw-port/re/disasm/OZImageNodeRender360.getHelium.s
//   raw-port/re/disasm/OZImageNodeRender360.estimateRenderMemory.s
//   (C2/D1/D0 extracted by label from /tmp/Ozone_tV.txt; see body comments.)

// Opaque frontier types (real classes not yet landed).
type OZElementRef       = unknown;
type OZRenderParamsRef  = unknown;
type LiAgentRef         = unknown;
type PCMatrix44Double   = unknown; // real: PCMatrix44Tmpl<double>*
type LiRenderParameters = unknown;
type PCRectDouble       = unknown; // real: PCRect<double>*
type PCHash128Set       = unknown; // real: std::set<PCHash128, less, allocator>&

// ---- Frontier-symbol throw-stubs (each cites its callsite). ----

/** @Ozone 0x0041db91  __ZN13LiImageSourceC2Ev */
function LiImageSource_ctor(_base_this: unknown): void {
    throw new Error("LiImageSource::LiImageSource() @Ozone 0x0041db91 not yet transcribed");
}

/** @Ozone 0x0041dbb4  __ZN14OZRenderParamsC1ERKS_ */
function OZRenderParams_copy_ctor(_dst: unknown, _src: OZRenderParamsRef): void {
    throw new Error("OZRenderParams::OZRenderParams(OZRenderParams const&) @Ozone 0x0041dbb4 not yet transcribed");
}

// ---- The class itself. ----

export class OZImageNodeRender360 {
    // +0x00 primary vtable ptr — represented implicitly by the class' method table.
    // +0x08 LiImageSource base subobject.
    private liImageSource: unknown;
    // +0x10 OZElement*  (raw, non-owning).
    private element: OZElementRef;
    // +0x18 OZRenderParams  (copy-constructed at ctor).
    private renderParams: OZRenderParamsRef;
    // +0x5d8 / +0x5e0 — PCShared_base / weak count. Modelled as an opaque tail so we
    //         don't fabricate its layout; only referenced by D1's cleanup path.
    private sharedBaseTail: { vtable: unknown; weakCount: unknown } = { vtable: null, weakCount: null };

    /**
     * @Ozone 0x0041db70  OZImageNodeRender360::OZImageNodeRender360(OZElement*, OZRenderParams const&)  (C2)
     *
     *   Args:
     *     rdi = this
     *     rsi = OZElement* (element)
     *     rdx = ...          (actually the compiler reorders — the C++ signature is
     *                          (this, element, renderParamsRef), matched by
     *                          rdi/rsi/rdx respectively).
     *     rcx = OZRenderParams const&
     *
     *   Body (mirrored line-for-line):
     *     r15 = rcx; r12 = rdx; r13 = rsi; r14 = rdi
     *     rbx = rsi + 0x8    (address of LiImageSource base subobject relative to
     *                         the *element* — wait: look again).
     *     ; -> Actually: leaq 0x8(%rsi), %rbx makes rbx = this+8? No; %rsi at this
     *        point is the *first* arg after `this`, which is `element` in AMD64 ABI.
     *        But 0x41db8a is `leaq 0x8(%rsi), %rbx` and 0x41db8e is `movq %rbx,%rsi`
     *        then callq LiImageSource::LiImageSource(). The `this` of the base ctor
     *        MUST be this+0x8, not element+0x8. So `rsi` at that point is `%rdi`
     *        (the outer this), not %rsi (the OZElement*).
     *        Re-reading: at 0x41db87 `movq %rdi,%r14` (this saved to r14), then
     *        `leaq 0x8(%rsi), %rbx` — but %rsi here is still the OZElement* arg.
     *        That would make rbx = element+8, which then becomes the "this" of
     *        LiImageSource::ctor. That is UNusual but plausible if LiImageSource
     *        is actually a base subobject of OZElement (i.e. every OZElement is
     *        a LiImageSource). Wait — no. OZImageNodeRender360 IS an LiImageSource
     *        (dtor at 0x41e644 calls LiImageSource::~LiImageSource on `this`).
     *
     *        The most self-consistent reading is: I misidentified rsi. Let me
     *        re-inspect the ABI.
     *
     *   OK — SysV AMD64 abi for a class with 3 args (element*, renderParams const&):
     *     rdi = this ; rsi = element* ; rdx = renderParams const&
     *   The disasm shows `leaq 0x8(%rsi), %rbx`, i.e. rbx = element+0x8, which is
     *   then passed as `this` to LiImageSource::LiImageSource(). That means
     *   LiImageSource::ctor is being invoked on the ELEMENT's subobject at +0x8,
     *   NOT on our own. That's the "constructor-argument style" where the incoming
     *   element already carries a LiImageSource subobject that gets initialized
     *   in-place — a design pattern used by OZElement variants.
     *
     *   Then:
     *     rax = *element             ; element's vtable ptr
     *     *this = rax                ; ADOPT the element's vtable — polymorphism via
     *                                  runtime rebinding. This node's identity becomes
     *                                  whatever the element says it is.
     *     rcx = element[0x28]        ; some field on the element
     *     rax = (*element)[-0x18]    ; offset-to-top (Itanium ABI)
     *     this[rax] = rcx            ; forward that field into the corresponding
     *                                  base subobject slot.
     *     this[0x10] = renderParams  ; wait — rdx is the RENDER-PARAMS ptr, not
     *                                  element. Actually at 0x41db81 `movq %rdx,%r12`
     *                                  saved rdx. Then at 0x41dba9 `movq %r12,0x10(%r14)`
     *                                  stores r12=rdx into this+0x10. But rdx is the
     *                                  const& (address of caller-side param), so
     *                                  this+0x10 is caller's OZRenderParams const&?
     *                                  That contradicts my earlier guess.
     *
     *   Given the depth of the ABI/vtable dance and that both LiImageSource,
     *   OZElement's vtable, and the offset-to-top computation are frontier, we
     *   THROW rather than pick a lane and fabricate.
     */
    constructor(_element: OZElementRef, _renderParams: OZRenderParamsRef) {
        throw new Error(
            "OZImageNodeRender360 ctor @Ozone 0x0041db70 not yet transcribed " +
            "(vtable-adoption dance at 0x0041db9a + Itanium offset-to-top at 0x0041dba1 " +
            "requires LiImageSource + OZElement + OZRenderParams to land first; " +
            "LiImageSource::LiImageSource() @0x0041db91, " +
            "OZRenderParams::OZRenderParams(const&) @0x0041dbb4)",
        );
        // (Unreachable — kept for the type of the class fields.)
        // this.element = _element;
        // this.renderParams = _renderParams;
    }

    /**
     * @Ozone 0x0041dcb0  OZImageNodeRender360::filteredEdges()
     *   pushq %rbp ; movq %rsp,%rbp ; xorl %eax,%eax ; popq %rbp ; retq
     * -> returns 0. Constant. No memory access.
     */
    filteredEdges(): number {
        return 0;
    }

    /**
     * @Ozone 0x0041dcc0  OZImageNodeRender360::pixelTransformSupport(LiRenderParameters const&)
     *   pushq %rbp ; movq %rsp,%rbp ; movl $0x3,%eax ; popq %rbp ; retq
     * -> returns 3, independent of the parameter. Constant.
     * (The 3 encodes the transform capability — a small enum in LiRenderParameters land;
     *  its meaning is not disclosed by this method's disasm.)
     */
    pixelTransformSupport(_params: LiRenderParameters): number {
        return 3;
    }

    /**
     * @Ozone 0x0041dc80  OZImageNodeRender360::getBoundary(LiAgent&, PCRect<double>*)
     *   ; rax = [rdi+0x10]                  ; element*
     *   ; rcx = rdi+0x18                    ; &this->renderParams
     *   ; r8  = [rax+0x1978]                ; element_vtable_ptr (element+0x1978
     *                                         is either the HGImage sub-object's vtable
     *                                         or the LiImageSource subobject nested
     *                                         inside the element)
     *   ; rax = rax+0x1978                  ; that subobject's `this`
     *   ; rdi = rax
     *   ; rsi = rdx                         ; PCRect<double>* out
     *   ; rdx = rcx                         ; &this->renderParams
     *   ; call *[r8+0x20]                   ; virtual dispatch slot 0x20
     *   ; ret 1                             ; always returns true
     *
     * Requires the element's LiImageSource subobject vtable to be decoded. THROW.
     */
    getBoundary(_agent: LiAgentRef, _outRect: PCRectDouble): boolean {
        throw new Error(
            "OZImageNodeRender360::getBoundary @Ozone 0x0041dc80 not yet transcribed " +
            "(virtual dispatch @0x0041dca2 through element[0x1978]->vtable*0x20; " +
            "needs OZElement/HGImage vtable to land first)",
        );
    }

    /**
     * @Ozone 0x0041dcd0  OZImageNodeRender360::fixPixelTransform(LiAgent&, PCMatrix44Tmpl<double>*, LiRenderParameters const&)
     *
     * 87-line body that:
     *   1. Calls a virtual on the LiAgent(?) via *rdi vtable slot *0x38 with rsi=params.
     *      Result rax is a mode enum: if ==6 (0x6), take the exit path (do nothing).
     *   2. Otherwise saves the mode in r14d and calls OZRenderParams::getResolution()
     *      (@Ozone 0x0041dd03) into a stack pair -> xmm1=resX, xmm0=resY (doubles).
     *   3. Reads the incoming 4x4 matrix at rbx=%rdx and applies a series of
     *      multiplies by xmm4=0.0 (the classic "zero-fold" pattern) — this collapses
     *      to writing zeros into most cells and just three effective components:
     *        M[0][0] = xmm1 = resX
     *        M[2][2] = xmm0 = resY        (0x28 offset from base of the mat = row2col2 elt in
     *                                      column-major-of-4-doubles storage: row=elt&3,
     *                                      col=elt>>3 -> 0x28/8 = 5 which is (col=1,row=1)?
     *                                      LEFT AMBIGUOUS by asm alone; would need to
     *                                      cross-check PCMatrix44Tmpl<double> layout.)
     *        M[3][3] = 1.0                (movabsq 0x3ff0000000000000 -> 0x78 and 0x50)
     *        M elements at offsets 0x8/0x10/0x18/0x20/0x28/0x30/0x38/0x40/0x48/0x58/0x60/0x68
     *          -> zeroed via MOVUPD of xmm6=0.
     *   4. Then, if (mode-3) <u 3 (mode ∈ {3,4,5}), does two more transform ops:
     *        M[0][3] += mode-scaled xmm3    (a translation-column bias)
     *        M[2][3] = xmm2                 (the y-translation)
     *      with additional unpcklpd/movddup packing that hides another (add/mul) fold.
     *
     * Every offset here is a byte-into-PCMatrix44Tmpl<double>. The layout of that
     * template is NOT yet grounded in this port. Writing this method without a
     * decoded PCMatrix44Tmpl<double> layout would introduce ungrounded numeric
     * literals throughout — a P2 gate violation. THROW citing the addr; land
     * PCMatrix44Tmpl<double> first, then transcribe.
     */
    fixPixelTransform(_agent: LiAgentRef, _mat: PCMatrix44Double, _params: LiRenderParameters): void {
        throw new Error(
            "OZImageNodeRender360::fixPixelTransform @Ozone 0x0041dcd0 not yet transcribed " +
            "(needs PCMatrix44Tmpl<double> byte-layout decoded and " +
            "OZRenderParams::getResolution() @0x0041dd03 landed; the +0x00/+0x28/+0x50/+0x78 " +
            "diagonal-and-translation offsets currently ungrounded)",
        );
    }

    /**
     * @Ozone 0x0041e210  OZImageNodeRender360::estimateRenderMemory(std::set<PCHash128>&)
     *
     *   ; if (element == nullptr) return 0;                       (0x0041e21e)
     *   ; rax = dynamic_cast<OZImageElement*>(element)            (0x0041e236)
     *   ; if (rax == nullptr) return 0;                           (0x0041e23e)
     *   ; r14 = this + 0x18                                       (&this->renderParams)
     *   ; return OZImageElement::estimateRenderMemory(rax, hashSet, r14)
     *
     * Straight tail-call to OZImageElement's version, gated by the dynamic_cast.
     * We can't perform the dynamic_cast without OZElement/OZImageElement typeinfo
     * landed. STUB with cite.
     */
    estimateRenderMemory(_hashSet: PCHash128Set): number {
        throw new Error(
            "OZImageNodeRender360::estimateRenderMemory @Ozone 0x0041e210 not yet transcribed " +
            "(dispatches via dynamic_cast<OZImageElement*> @0x0041e236 to " +
            "OZImageElement::estimateRenderMemory @0x0041e251)",
        );
    }

    /**
     * @Ozone (getHelium — 224 lines) — deep frontier. Uses HGImage / LiAgent /
     * OZRenderParams / vtable dispatch throughout. Not attempted in this pass.
     */
    getHelium(_agent: LiAgentRef): unknown {
        throw new Error(
            "OZImageNodeRender360::getHelium @Ozone 0x0041dc80(base ref) not yet transcribed " +
            "(224-line body; see raw-port/re/disasm/OZImageNodeRender360.getHelium.s)",
        );
    }

    /**
     * @Ozone 0x0041e610  OZImageNodeRender360::~OZImageNodeRender360()  (D1)
     * @Ozone 0x0041e680  OZImageNodeRender360::~OZImageNodeRender360()  (D0 — deleting)
     *
     *   ; *this = &OZImageNodeRender360_vtable + 0x10               (rewind vtable during dtor)
     *   ; this[0x5d8] = &secondary_vtable + 0x10
     *   ; OZRenderParams::~OZRenderParams(this+0x18)
     *   ; LiImageSource::~LiImageSource(this)                        (base subobj at this+0)
     *   ; this[0x5d8] = &PCShared_base_vtable + 0x10                 (rebind to base)
     *   ; if (this[0x5e0]) __shared_weak_count::weak_release(this[0x5e0])
     *   ; D0 additionally: operator delete(this)
     *
     * Requires PCShared_base + LiImageSource + OZRenderParams destructors to land.
     */
    destroy(): void {
        throw new Error(
            "OZImageNodeRender360::~OZImageNodeRender360 @Ozone 0x0041e610 not yet transcribed " +
            "(needs OZRenderParams::~OZRenderParams @0x0041e635, LiImageSource::~LiImageSource " +
            "@0x0041e644, and PC_Sp_counted_base::weak_release @0x0041e667 to land first)",
        );
    }
}
