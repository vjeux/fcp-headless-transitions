// OZElementRender.ts
// Faithful raw-port of Ozone::OZElementRender.
//
// Source: Ozone framework (macOS FCP), x86_64 slice.
//   Disassembly stashed under raw-port/re/disasm/OZElementRender.*.s
//
// Ports (all six methods listed by claim.py):
//   - OZElementRender::OZElementRender(OZElement*, OZImageNode*, OZRenderParams const&) [C1] @0x451210
//   - OZElementRender::OZElementRender(OZElement*, OZImageNode*, OZRenderParams const&) [C2] @0x4511b0
//   - OZElementRender::getBoundary(LiAgent&, PCRect<double>*)                                   @0x4512e0
//   - OZElementRender::fixPixelTransform(LiAgent&, PCMatrix44Tmpl<double>*, LiRenderParameters const&) @0x451340
//   - OZElementRender::~OZElementRender() [D1, base/complete]                                    @0x4514d0
//   - OZElementRender::~OZElementRender() [D0, deleting]                                         @0x451550
//
// Class hierarchy — derived from the C1 body and dtors:
//     OZImageNodeRender       (primary base, subobject at this+0x00, occupies 0x00 .. 0x5d0)
//     └── OZElementRender     (adds this+0x5d0: OZElement*)
//   The class carries a LiImageSource subobject at this+0x5d8 and a PCShared_base
//   secondary subobject at this+0x5e8; both are reflected in the D1/D0 destructors
//   which run LiImageSource::~LiImageSource(this+0x5d8) and rewrite the PCShared_base
//   secondary vptr to &__ZTV13PCShared_base + 0x10 (mirroring OZLiHePixelTransformFixer).
//
// Object layout (only the fields actually read/written by these six methods are modeled):
//   0x000  OZImageNodeRender primary vptr / base subobject
//     0x010  <inherited from OZImageNodeRender>  passed as `LiRenderParameters const&`-like
//            second arg to OZElement's vfn0x5e0/vfn0x600 in fixPixelTransform.
//            The OZImageNodeRender C2 base ctor initializes this from the caller-supplied
//            `OZRenderParams const&`. Since OZImageNodeRender is not yet ported, we model
//            the field as an opaque handle and forward its address into the base ctor.
//   0x5d0  element : OZElement*                   — written by C1 @0x451298 and by C2 @0x4511f3
//   0x5d8  LiImageSource subobject (own vptr @0x5d8, imageSpace u32 @0x5e0, ...).
//          Constructed by C1 via LiImageSourceC2(this+0x5d8, VTT+…) @0x451258.
//          Destroyed by D1/D0 via LiImageSource::~LiImageSource(this+0x5d8) @0x45151a/@0x45159a.
//   0x5e8  PCShared_base secondary vptr slot; rewritten to __ZTV13PCShared_base+0x10 in D1/D0.
//   0x5f0  PC_Sp_counted_base* — conditionally released via weak_release() in D1/D0.
//
// Every callq / RIP-relative load / vtable slot is cited by @0xADDR in the method bodies.

import { LiImageSource } from "./LiImageSource.js";

// ---------------------------------------------------------------------------
// Nominal / opaque frontier types.
// ---------------------------------------------------------------------------

/**
 * Opaque OZElement pointer — the target of `this+0x5d0`. The full OZElement class
 * lives in `../nodes/OZElement.ts` but its vtable slots at 0x5e0 and 0x600 are the
 * only surface `fixPixelTransform` needs, and those virtual methods are not yet
 * ported. We take the pointer nominally and dispatch through the two vtable-thunk
 * stubs declared below.
 */
export type OZElementPtr = unknown;

/**
 * Opaque LiAgent& — a rendering context. Both `getBoundary` and `fixPixelTransform`
 * receive it as their first non-`this` arg and pass it through to OZElement virtuals
 * unchanged; the OZElementRender bodies never dereference it.
 */
export type LiAgent = unknown;

/**
 * Opaque LiRenderParameters& — 3rd arg to `fixPixelTransform`. NOT read by the
 * OZElementRender body (the `LiRenderParameters` handed to OZElement virtuals is
 * `this+0x10`, i.e. the inherited OZImageNodeRender slot — NOT this argument).
 */
export type LiRenderParametersRef = unknown;

/**
 * Opaque OZImageNode* — passed straight through to the OZImageNodeRender base ctor.
 * Not touched otherwise by any of the six methods.
 */
export type OZImageNodePtr = unknown;

/**
 * Opaque OZRenderParams const& — passed straight through to the OZImageNodeRender base
 * ctor at C1 @0x45126d / C2 @0x4511cd. Destroyed at this+0x10 by D1 @0x45150b / D0
 * @0x45158b via OZRenderParams::~OZRenderParams(this+0x10).
 */
export type OZRenderParamsRef = unknown;

/**
 * Opaque PC_Sp_counted_base* — the `this+0x5f0` slot. Released via weak_release()
 * from the D1/D0 dtors when non-null.
 */
export type PCSpCountedBasePtr = unknown | null;

/**
 * PCRect<double>* — the out-parameter of `getBoundary`. Not modeled as a class here
 * since the OZElementRender body never touches its fields; it's forwarded to
 * OZElement::vfn(0x5e0). We keep a nominal type so callers get a distinct handle.
 */
export type PCRectDouble = unknown;

/**
 * PCMatrix44Tmpl<double>* — the out-parameter of `fixPixelTransform`. Storage is
 * 16 doubles (row-major, 128 bytes at offsets 0x00..0x78 in 0x8 steps). We surface
 * it as a plain 16-element Float64Array-ish TS object; the port writes each cell
 * literally at the offsets the asm writes.
 */
export interface PCMatrix44Double {
  /** 16 doubles, row-major. m[row*4 + col]. */
  m: Float64Array;
}

/** Convenience factory for the caller-owned matrix out-slot. */
export function makePCMatrix44Double(): PCMatrix44Double {
  return { m: new Float64Array(16) };
}

// ---------------------------------------------------------------------------
// Undecoded frontier callees — throwing stubs, cited with @0xADDR.
// ---------------------------------------------------------------------------

/**
 * OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&) — base ctor.
 *
 * Symbols: __ZN17OZImageNodeRenderC1EP11OZImageNodeRK14OZRenderParams (C1 @0x45126d),
 *          __ZN17OZImageNodeRenderC2EP11OZImageNodeRK14OZRenderParams (C2 @0x4511cd).
 * The C1 form (called from OZElementRender's own C1 @0x45126d) is the complete-object
 * variant; the C2 form is the base-subobject variant taking a VTT pointer via `rsi`
 * (advanced by +8 before the call at @0x4511c3). OZImageNodeRender is not yet ported.
 */
function OZImageNodeRender_ctor_C1(
  _self: OZElementRender,
  _node: OZImageNodePtr,
  _params: OZRenderParamsRef,
): void {
  throw new Error(
    "raw-port: OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&) [C1] " +
      "is not yet ported (callq @0x45126d → __ZN17OZImageNodeRenderC1EP11OZImageNodeRK14OZRenderParams)",
  );
}

function OZImageNodeRender_ctor_C2(
  _self: OZElementRender,
  _vttThunk: unknown,
  _node: OZImageNodePtr,
  _params: OZRenderParamsRef,
): void {
  throw new Error(
    "raw-port: OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&) [C2] " +
      "is not yet ported (callq @0x4511cd → __ZN17OZImageNodeRenderC2EP11OZImageNodeRK14OZRenderParams)",
  );
}

/**
 * OZRenderParams::~OZRenderParams() — the OZImageNodeRender base's owned params.
 *
 * Symbol: __ZN14OZRenderParamsD1Ev.
 * Called from D1 @0x45150b and D0 @0x45158b with `rdi = this + 0x10` (the params
 * live inside the OZImageNodeRender subobject at +0x10; both dtors do
 * `addq $0x10, %rdi; callq __ZN14OZRenderParamsD1Ev`).
 */
function OZRenderParams_dtor_D1(_paramsAtThisPlus0x10: OZRenderParamsRef): void {
  throw new Error(
    "raw-port: OZRenderParams::~OZRenderParams() [D1] is not yet ported " +
      "(callq @0x45150b/@0x45158b → __ZN14OZRenderParamsD1Ev)",
  );
}

/**
 * LiImageSource::~LiImageSource() — base subobject destructor.
 *
 * Symbol: __ZN13LiImageSourceD2Ev (call target 0x6dd842 — symbol stub).
 * Called from:
 *   D1 @0x45151a with `rdi = this + 0x5d8`, `rsi = VTT-thunked base sub-vtable`,
 *   D0 @0x45159a with `rdi = this + 0x5d8`, `rsi = VTT-thunked base sub-vtable`,
 *   C1 unwind @0x4512bb with `rdi = this + 0x5d8` (exception path).
 *
 * A throwing stub — LiImageSource::~LiImageSource @0x6dd842 is not yet ported.
 */
function LiImageSource_D2(_selfLiImageSubobject: LiImageSource): void {
  throw new Error(
    "raw-port: LiImageSource::~LiImageSource() [D2] is not yet ported " +
      "(callq @0x45151a/@0x45159a/@0x4512bb → 0x6dd842 symbol stub __ZN13LiImageSourceD2Ev)",
  );
}

/**
 * LiImageSource::LiImageSource() — base subobject ctor.
 *
 * Symbol: __ZN13LiImageSourceC2Ev (call target 0x6dd83c — symbol stub).
 * Called from C1 @0x451258 with `rdi = this + 0x5d8`, `rsi = VTT-thunked sub-vtable`.
 */
function LiImageSource_C2(_selfLiImageSubobject: LiImageSource): void {
  throw new Error(
    "raw-port: LiImageSource::LiImageSource() [C2] is not yet ported " +
      "(callq @0x451258 → 0x6dd83c symbol stub __ZN13LiImageSourceC2Ev)",
  );
}

/**
 * PCShared_base::~PCShared_base() — secondary base dtor. Symbol: __ZN13PCShared_baseD2Ev.
 * Called from the C1 exception-handling path @0x4512cf on `rdi = this + 0x5e8`.
 * (The `retq`-path of every dtor does NOT call it — it only rewrites the secondary
 * vptr to `&__ZTV13PCShared_base + 0x10` and leaves the subobject inert.)
 */
function PCShared_base_D2(_pcSharedSubobject: unknown): void {
  throw new Error(
    "raw-port: PCShared_base::~PCShared_base() [D2] is not yet ported " +
      "(callq @0x4512cf → __ZN13PCShared_baseD2Ev)",
  );
}

/**
 * PC_Sp_counted_base::weak_release(). Symbol: __ZN18PC_Sp_counted_base12weak_releaseEv.
 * Call target 0x6de4fc — symbol stub.
 * Called from D1 @0x45153d and D0 @0x4515bd when `*(void**)(this + 0x5f0) != nullptr`.
 */
function PC_Sp_counted_base_weak_release(_counted: PCSpCountedBasePtr): void {
  throw new Error(
    "raw-port: PC_Sp_counted_base::weak_release() is not yet ported " +
      "(callq @0x45153d/@0x4515bd → 0x6de4fc symbol stub __ZN18PC_Sp_counted_base12weak_releaseEv)",
  );
}

/**
 * ::operator delete(void*). Symbol: __ZdlPv. Call target 0x6dfc36 — symbol stub.
 * Tail-jmp'd from D0 @0x4515c9 with `rdi = this` after the base dtor has run.
 */
function operator_delete(_p: unknown): void {
  throw new Error(
    "raw-port: ::operator delete(void*) is not yet ported " +
      "(jmp @0x4515c9 → 0x6dfc36 symbol stub __ZdlPv)",
  );
}

/**
 * __Unwind_Resume — the Itanium C++ ABI exception-continue trampoline.
 * Call target 0x6dd07a — symbol stub. Reached from the C1 exception path @0x4512d7.
 */
function unwind_resume(_exceptionRegister: unknown): void {
  throw new Error(
    "raw-port: __Unwind_Resume is not yet ported " +
      "(callq @0x4512d7 → 0x6dd07a symbol stub ___Unwind_Resume)",
  );
}

// --- OZElement virtual-method thunks (slots 0x5e0 and 0x600) ---------------

/**
 * OZElement::vfn(0x5e0) — the "get boundary rect" virtual. Signature reconstructed
 * from its two call sites:
 *   - getBoundary @0x4512fb:
 *       callq *0x5e0(%r8)   with rdi = element (this+0x5d0),
 *                                rsi = out-rect (the caller-supplied PCRect<double>*),
 *                                rdx = this+0x10 (OZImageNodeRender's params subobject).
 *   - fixPixelTransform @0x45137a:
 *       callq *0x5e0(%rax)  with rdi = element,
 *                                rsi = &localRect (a stack PCRect<double>),
 *                                rdx = this+0x10.
 *
 * So the vtable slot is:
 *   virtual bool OZElement::vfn0x5e0(PCRect<double>*, LiRenderParameters const&);
 *   (return value: `getBoundary` returns `true` unconditionally after this call,
 *    so the vfn's return value is either ignored or is used through an inlined
 *    bool cast; we surface it as `unknown` and don't rely on it.)
 *
 * Throwing stub — vtable slot +0x5e0 on OZElement is not yet ported (@0x4512fb, @0x45137a).
 */
function OZElement_vfn_0x5e0(
  _element: OZElementPtr,
  _outRect: PCRectDouble,
  _renderParamsSubobject: unknown,
): unknown {
  throw new Error(
    "raw-port: OZElement::(virtual vtable slot +0x5e0) is not yet ported " +
      "(callq @0x4512fb / @0x45137a → *0x5e0(vtable(OZElement)))",
  );
}

/**
 * OZElement::vfn(0x600) — a "sample a 2-double value from the element's boundary"
 * virtual. Called only from fixPixelTransform @0x451391:
 *   callq *0x600(%rax)   with rdi = &sretBuf16 (16-byte sret),
 *                             rsi = element,
 *                             rdx = &localRect.
 * The caller then reads the first two doubles of the sret buffer:
 *   xmm0 = *(double*)(sret + 0x00);
 *   xmm1 = *(double*)(sret + 0x08);
 * and uses them as the translation components m[0][3] and m[1][3] of the output matrix.
 *
 * Signature:
 *   virtual struct-of-doubles OZElement::vfn0x600(PCRect<double> const&);
 *   where the first two 8-byte fields (offset 0x00, 0x08) are consumed by the
 *   caller and any trailing bytes are left unread.
 *
 * Throwing stub — vtable slot +0x600 on OZElement is not yet ported (@0x451391).
 */
function OZElement_vfn_0x600(
  _element: OZElementPtr,
  _rect: PCRectDouble,
): { a: number; b: number } {
  throw new Error(
    "raw-port: OZElement::(virtual vtable slot +0x600) is not yet ported " +
      "(callq @0x451391 → *0x600(vtable(OZElement)))",
  );
}

// ---------------------------------------------------------------------------
// OZElementRender
// ---------------------------------------------------------------------------

/**
 * OZElementRender — an OZImageNodeRender that binds an OZElement* at +0x5d0 and
 * routes rendering-time queries (getBoundary, fixPixelTransform) through the
 * element's virtuals.
 *
 * Only fields actually touched by the six ported methods are modeled. The
 * OZImageNodeRender base is present as an opaque subobject via composition.
 */
export class OZElementRender {
  /**
   * @0x5d0 — OZElement* pointer. Set by C1 @0x451298 (`movq %r14, 0x5d0(%rbx)`)
   * and C2 @0x4511f3 (`movq %rbx, 0x5d0(%r15)`). Read by getBoundary @0x4512e4
   * and fixPixelTransform @0x451365 / @0x451380.
   */
  public element: OZElementPtr;

  /**
   * @0x5d8 — LiImageSource base subobject. Ctor'd by C1 @0x451258 via
   * LiImageSource::LiImageSource(this+0x5d8) and destroyed by D1/D0 via
   * LiImageSource::~LiImageSource(this+0x5d8).
   */
  public liImageSource: LiImageSource;

  /**
   * @0x5e8 — PCShared_base secondary vptr slot; each dtor rewrites it to
   * `&__ZTV13PCShared_base + 0x10`. Mirrored as a boolean here (see the sibling
   * OZLiHePixelTransformFixer port for the same idiom).
   */
  public secondaryBoundToPCSharedBase: boolean = false;

  /**
   * @0x5f0 — PC_Sp_counted_base*. C1 @0x45123c stores `$0x0` here (nullptr).
   * D1 @0x451531 and D0 @0x4515b1 conditionally weak_release it when non-null.
   */
  public pcSpCountedBase: PCSpCountedBasePtr = null;

  /**
   * OZElementRender::OZElementRender(OZElement*, OZImageNode*, OZRenderParams const&) [C1] @0x451210
   *
   * Mirrors the asm control flow:
   *   @0x45122a  rax = &__ZTV13PCShared_base                (`leaq __ZTV13PCShared_base(%rip), %rax`)
   *   @0x451231  rax += 0x10
   *   @0x451235  *(void**)(this + 0x5e8) = rax              — provisionally bind secondary vptr
   *   @0x45123c  *(void**)(this + 0x5f0) = 0                — zero the counted-base slot
   *   @0x451247  r15 = this + 0x5d8                         (LiImageSource subobject addr)
   *   @0x45124e  rsi = &VTT_OZElementRender[…]              — VTT thunk for LiImageSource
   *   @0x451258  callq __ZN13LiImageSourceC2Ev(this+0x5d8, sub_vtable)
   *   @0x45125d  rsi = &VTT_OZElementRender[…]              — VTT thunk for OZImageNodeRender base
   *   @0x45126d  callq __ZN17OZImageNodeRenderC1E…(this, OZImageNode*, OZRenderParams const&)
   *   @0x451272  rax = &vtable(OZElementRender)             ; @0x451279 *(void**)this = rax
   *   @0x45127c  rax = &vtable(LiImageSource-in-OZER)       ; @0x451283 *(void**)(this+0x5d8) = rax
   *   @0x45128a  rax = &vtable(PCShared_base-in-OZER)       ; @0x451291 *(void**)(this+0x5e8) = rax
   *   @0x451298  *(void**)(this + 0x5d0) = OZElement*        (was `%r14` = original rsi)
   *   @0x4512ad  retq
   *
   * The exception cleanup path @0x4512ae..@0x4512dc — reached if the base ctor
   * throws — tears down LiImageSource and PCShared_base subobjects and re-raises
   * via __Unwind_Resume. Since both frontier calls throw as stubs today, the
   * cleanup arm remains unreachable in-model; we still document it below.
   *
   * Note: we forward the two vptr rebinds at @0x451279 / @0x451283 / @0x451291
   * as a boolean flag (`secondaryBoundToPCSharedBase`), matching the sibling
   * port. The primary OZElementRender vtable is a process-load-time address;
   * we don't need to model it explicitly for TS calls.
   */
  constructor(element: OZElementPtr, imageNode: OZImageNodePtr, params: OZRenderParamsRef) {
    // @0x45123c: *(void**)(this + 0x5f0) = 0
    this.pcSpCountedBase = null;
    // @0x451235: provisional secondary vptr — &__ZTV13PCShared_base + 0x10
    this.secondaryBoundToPCSharedBase = true;
    // @0x451247..@0x451258: construct the LiImageSource subobject at this+0x5d8.
    // LiImageSourceC2 is a throwing stub — the sub-ctor at @0x451258 is not yet ported.
    this.liImageSource = new LiImageSource();
    LiImageSource_C2(this.liImageSource);
    // @0x45126d: base ctor OZImageNodeRender::OZImageNodeRender(this, OZImageNode*, params).
    // Throwing stub — OZImageNodeRender C1 at @0x45126d is not yet ported.
    try {
      OZImageNodeRender_ctor_C1(this, imageNode, params);
    } catch (e) {
      // Exception cleanup path @0x4512ae..@0x4512dc:
      //   @0x4512b1  rsi = &VTT_thunk for LiImageSource
      //   @0x4512bb  callq __ZN13LiImageSourceD2Ev(this+0x5d8, ...)
      //   @0x4512c5  rdi = this+0x5e8
      //   @0x4512cf  callq __ZN13PCShared_baseD2Ev(this+0x5e8)
      //   @0x4512d7  callq __Unwind_Resume(exception)
      LiImageSource_D2(this.liImageSource);
      PCShared_base_D2(this);
      unwind_resume(e);
      throw e; // unreachable — unwind_resume never returns; kept for TS control flow.
    }
    // @0x451279 / @0x451283 / @0x451291 — primary + LiImageSource + PCShared_base vptrs get set
    // to OZElementRender's own vtables (process-load-time addresses; not modeled directly).
    // @0x451298: *(OZElement**)(this + 0x5d0) = element
    this.element = element;
  }

  /**
   * OZElementRender::OZElementRender(OZElement*, OZImageNode*, OZRenderParams const&) [C2] @0x4511b0
   *
   * The base-subobject variant. In the Itanium C++ ABI, when the containing type
   * has virtual bases, the C2 ctor takes an extra `VTT** vtt` parameter in `%rsi`
   * (this shifts every other user-visible arg one register right). The body:
   *   @0x4511b0  save regs; rdi=this, rsi=VTT, rdx=OZElement*, rcx=OZImageNode*, r8=OZRenderParams&
   *   @0x4511c3  addq $0x8, %rsi                    — advance VTT for the base sub-ctor
   *   @0x4511cd  callq OZImageNodeRenderC2(this, VTT+8, OZImageNode*, OZRenderParams&)
   *   @0x4511d2  *(void**)this = *(void**)VTT       — primary vptr = VTT[0]
   *   @0x4511d8  rcx = *(void**)(VTT + 0x20)        — secondary sub-vptr (LiImageSource / PCShared)
   *   @0x4511dc  rax = *(int64_t*)(*(void**)this - 0x18)   — offset-to-top from primary vtable
   *   @0x4511e0  *(void**)(this + rax) = rcx        — install the secondary sub-vptr at
   *                                                    the offset the primary vtable dictates
   *   @0x4511e4  rax = *(void**)(VTT + 0x28)        — a second secondary sub-vptr
   *   @0x4511e8  rcx = *(int64_t*)(*(void**)this - 0x20)   — another offset-to-top
   *   @0x4511ef  *(void**)(this + rcx) = rax
   *   @0x4511f3  *(OZElement**)(this + 0x5d0) = OZElement*    (was `%rbx` = original rdx)
   *   @0x451204  retq
   *
   * The two VTT-relative sub-vptr installs at @0x4511e0 and @0x4511ef are how the
   * Itanium ABI initializes secondary vptrs of a base subobject from a caller's VTT;
   * their run-time addresses are process-load-time and are not modeled here. We
   * mark the secondary base as bound (mirroring the sibling port).
   *
   * There is no exception cleanup epilogue in C2 — the base OZImageNodeRenderC2 is
   * assumed non-throwing at this call site, so we don't reproduce one.
   */
  static ctorC2(
    self: OZElementRender,
    vtt: unknown,
    element: OZElementPtr,
    imageNode: OZImageNodePtr,
    params: OZRenderParamsRef,
  ): void {
    // @0x4511cd: base OZImageNodeRender C2 (base-subobject variant).
    OZImageNodeRender_ctor_C2(self, vtt, imageNode, params);
    // @0x4511d2..@0x4511ef: VTT-driven vptr installs; we model as a boolean bind.
    self.secondaryBoundToPCSharedBase = true;
    // @0x4511f3: *(OZElement**)(this + 0x5d0) = element
    self.element = element;
  }

  /**
   * OZElementRender::getBoundary(LiAgent&, PCRect<double>*) @0x4512e0
   *
   * Full body (mirrored exactly):
   *   @0x4512e4  rax = *(OZElement**)(this + 0x5d0)         — load element
   *   @0x4512eb  rcx = this + 0x10                          — inherited params slot
   *   @0x4512ef  r8  = *(void**)rax                         — element's vtable
   *   @0x4512f2  rdi = element                              — vfn `this` = element
   *   @0x4512f5  rsi = rdx (caller's PCRect<double>*)       — passed straight through
   *   @0x4512f8  rdx = rcx (this+0x10)                      — inherited-params ref
   *   @0x4512fb  callq *0x5e0(%r8)                          — element->vfn0x5e0(rect, params)
   *   @0x451302  al = 1                                     — return true
   *   @0x451305  retq
   *
   * The `LiAgent& agent` argument occupies `%rsi` on entry but is immediately
   * overwritten with the rect pointer at @0x4512f5; it is NOT forwarded. The
   * vfn0x5e0 signature is `OZElement::vfn(PCRect<double>*, LiRenderParameters const&)`.
   */
  getBoundary(_agent: LiAgent, outRect: PCRectDouble): boolean {
    // @0x4512e4: load element pointer.
    const element = this.element;
    // @0x4512fb: delegate to OZElement's vtable slot +0x5e0.
    // The 3rd arg is `this + 0x10` — the OZImageNodeRender-inherited params slot.
    // We surface `this` in its place since the subobject is composed here.
    OZElement_vfn_0x5e0(element, outRect, this);
    // @0x451302: return true.
    return true;
  }

  /**
   * OZElementRender::fixPixelTransform(LiAgent&, PCMatrix44Tmpl<double>*, LiRenderParameters const&) @0x451340
   *
   * The body assembles a local PCRect<double> `localRect = {0.0, 0.0, -1.0, -1.0}`,
   * asks the element to fill it via vfn(0x5e0), then asks the element for a 2-double
   * value via vfn(0x600) given that rect, and finally fills the caller's 4×4 matrix
   * with a pure "translate by (a, b)" transform (identity + a in [0][3], b in [1][3]).
   *
   * Exact mirror of the asm:
   *   @0x451353  xorps %xmm0,%xmm0                          — xmm0 = {0.0, 0.0}
   *   @0x451356  movaps %xmm0, -0x50(%rbp)                  — local[0..2) = {0.0, 0.0}
   *   @0x45135a  movaps 0x2b405f(%rip), %xmm0               — xmm0 = {-1.0, -1.0} at 0x7053c0
   *   @0x451361  movaps %xmm0, -0x40(%rbp)                  — local[2..4) = {-1.0, -1.0}
   *                                                          → localRect = {x=0.0, y=0.0, w=-1.0, h=-1.0}
   *   @0x451365  rdi = *(OZElement**)(this + 0x5d0)         — element
   *   @0x45136c  rdx = this + 0x10                          — inherited params slot
   *   @0x451370  rax = *(void**)element                     — element vtable
   *   @0x451373  r15 = &localRect
   *   @0x451377  rsi = &localRect
   *   @0x45137a  callq *0x5e0(%rax)                         — element->vfn0x5e0(&localRect, params)
   *   @0x451380  rsi = *(OZElement**)(this + 0x5d0)         — element again
   *   @0x451387  rax = *(void**)element                     — vtable
   *   @0x45138a  rdi = &sretBuf16 (%rbp - 0x28)             — sret target (16 bytes)
   *   @0x45138e  rdx = &localRect
   *   @0x451391  callq *0x600(%rax)                         — element->vfn0x600(sretBuf16, &localRect)
   *   @0x451397  xmm0 = *(double*)(sretBuf16 + 0x00)
   *   @0x45139c  xmm1 = *(double*)(sretBuf16 + 0x08)
   *   @0x4513a1  rax = 0x3ff0000000000000                   — bit-pattern of double 1.0
   *   @0x4513ab  *(uint64_t*)(rbx + 0x00) = rax             — matrix[0][0] = 1.0
   *   @0x4513ae  xmm2 = {0.0, 0.0}
   *   @0x4513b1  *(xmm2)(rbx + 0x08)                        — matrix[0][1] = matrix[0][2] = 0.0
   *   @0x4513b5  *(double*)(rbx + 0x18) = xmm0              — matrix[0][3] = a  (from sret+0x00)
   *   @0x4513ba  xmm0 = {0.0, 0.0}
   *   @0x4513bd  movhps 0x2b401c(%rip), %xmm0               — xmm0.hi = *(double*)0x7053e0 = 1.0
   *                                                          → xmm0 = {0.0, 1.0}
   *   @0x4513c4  *(xmm0)(rbx + 0x20)                        — matrix[1][0] = 0.0, matrix[1][1] = 1.0
   *   @0x4513c8  *(uint64_t*)(rbx + 0x30) = 0               — matrix[1][2] = 0.0
   *   @0x4513d0  *(double*)(rbx + 0x38) = xmm1              — matrix[1][3] = b  (from sret+0x08)
   *   @0x4513d5  *(xmm2)(rbx + 0x40)                        — matrix[2][0] = matrix[2][1] = 0.0
   *   @0x4513d9  *(uint64_t*)(rbx + 0x50) = rax             — matrix[2][2] = 1.0
   *   @0x4513dd  *(xmm2)(rbx + 0x58)                        — matrix[2][3] = matrix[3][0] = 0.0
   *   @0x4513e1  *(xmm2)(rbx + 0x68)                        — matrix[3][1] = matrix[3][2] = 0.0
   *   @0x4513e5  *(uint64_t*)(rbx + 0x78) = rax             — matrix[3][3] = 1.0
   *   @0x4513f3  retq
   *
   * Constant-pool provenance (verified via resolve.py):
   *   0x7053c0  = { -1.0, -1.0 }   (loaded by movaps @0x45135a)
   *   0x7053e0  = { 1.0, 0.0 }     (upper qword loaded by movhps @0x4513bd)
   *
   * The `LiRenderParameters const&` argument is NOT read (passed in `%rcx`,
   * overwritten before use); the params fed to the element virtuals are the
   * inherited `this+0x10` slot.
   */
  fixPixelTransform(
    _agent: LiAgent,
    outMatrix: PCMatrix44Double,
    _params: LiRenderParametersRef,
  ): void {
    // @0x451353..@0x451365: localRect = { 0.0, 0.0, -1.0, -1.0 }.
    const localRect: { x: number; y: number; w: number; h: number } = {
      x: 0.0,
      y: 0.0,
      w: -1.0,
      h: -1.0,
    };
    // @0x45137a: element->vfn0x5e0(&localRect, this+0x10) — may mutate localRect.
    OZElement_vfn_0x5e0(this.element, localRect, this);
    // @0x451391: element->vfn0x600(&sretBuf, &localRect) — returns 2 doubles (a, b).
    const sret = OZElement_vfn_0x600(this.element, localRect);
    const a = sret.a; // xmm0 @0x451397
    const b = sret.b; // xmm1 @0x45139c

    // @0x4513ab..@0x4513e5: fill row-major 4x4 identity + translation (a, b, 0).
    const m = outMatrix.m;
    // Row 0
    m[0] = 1.0; // @0x4513ab
    m[1] = 0.0; // @0x4513b1 (xmm2 low)
    m[2] = 0.0; // @0x4513b1 (xmm2 high)
    m[3] = a; //   @0x4513b5
    // Row 1
    m[4] = 0.0; // @0x4513c4 (xmm0 low)
    m[5] = 1.0; // @0x4513c4 (xmm0 high, from movhps 0x7053e0)
    m[6] = 0.0; // @0x4513c8
    m[7] = b; //   @0x4513d0
    // Row 2
    m[8] = 0.0; // @0x4513d5 (xmm2 low)
    m[9] = 0.0; // @0x4513d5 (xmm2 high)
    m[10] = 1.0; // @0x4513d9
    m[11] = 0.0; // @0x4513dd (xmm2 low)
    // Row 3
    m[12] = 0.0; // @0x4513dd (xmm2 high)
    m[13] = 0.0; // @0x4513e1 (xmm2 low)
    m[14] = 0.0; // @0x4513e1 (xmm2 high)
    m[15] = 1.0; // @0x4513e5
  }

  /**
   * ~OZElementRender() [D1 — base/complete dtor] @0x4514d0
   *
   * Mirrors the asm:
   *   @0x4514da  rax = &vtable(OZElementRender)             ; @0x4514e1 *(void**)this = rax
   *   @0x4514e4  r14 = this + 0x5d8                         — LiImageSource subobject
   *   @0x4514eb  rax = &vtable(LiImageSource-in-OZER)       ; @0x4514f2 *(void**)(this+0x5d8) = rax
   *   @0x4514f9  rax = &vtable(PCShared_base-in-OZER)       ; @0x451500 *(void**)(this+0x5e8) = rax
   *                                                            (vtable rebinds — all process-load-time)
   *   @0x451507  rdi = this + 0x10
   *   @0x45150b  callq __ZN14OZRenderParamsD1Ev(this+0x10)  — destroy inherited OZRenderParams
   *   @0x451510  rsi = &VTT_thunk for LiImageSource
   *   @0x45151a  callq __ZN13LiImageSourceD2Ev(this+0x5d8, sub_vtable)
   *   @0x45151f  rax = &__ZTV13PCShared_base ; @0x451526 rax += 0x10
   *   @0x45152a  *(void**)(this + 0x5e8) = rax              — provisional secondary vptr rebind
   *   @0x451531  rdi = *(void**)(this + 0x5f0)
   *   @0x451538  testq rdi, rdi
   *   @0x45153b  je   0x451542
   *   @0x45153d  callq __ZN18PC_Sp_counted_base12weak_releaseEv(rdi)
   *   @0x451542  retq
   */
  dtorD1(): void {
    // @0x45150b: OZRenderParams::~OZRenderParams(this + 0x10) — throwing stub today.
    OZRenderParams_dtor_D1(this);
    // @0x45151a: LiImageSource::~LiImageSource(this + 0x5d8).
    LiImageSource_D2(this.liImageSource);
    // @0x45152a: rebind secondary vptr to &__ZTV13PCShared_base + 0x10.
    this.secondaryBoundToPCSharedBase = true;
    // @0x451531..@0x45153b: conditional weak_release on this+0x5f0.
    const counted = this.pcSpCountedBase;
    if (counted !== null && counted !== undefined) {
      // @0x45153d: PC_Sp_counted_base::weak_release(counted).
      PC_Sp_counted_base_weak_release(counted);
    }
    // @0x451546: retq
  }

  /**
   * ~OZElementRender() [D0 — deleting dtor] @0x451550
   *
   * Same shape as D1 with an added `operator delete(this)` tail-jmp at the end:
   *   @0x45155a  rax = &vtable(OZElementRender)             ; @0x451561 *(void**)this = rax
   *   @0x451564  r14 = this + 0x5d8
   *   @0x45156b  rax = &vtable(LiImageSource-in-OZER)       ; @0x451572 *(void**)(this+0x5d8) = rax
   *   @0x451579  rax = &vtable(PCShared_base-in-OZER)       ; @0x451580 *(void**)(this+0x5e8) = rax
   *   @0x451587  rdi = this + 0x10
   *   @0x45158b  callq __ZN14OZRenderParamsD1Ev(this+0x10)
   *   @0x451590  rsi = &VTT_thunk for LiImageSource
   *   @0x45159a  callq __ZN13LiImageSourceD2Ev(this+0x5d8, sub_vtable)
   *   @0x45159f  rax = &__ZTV13PCShared_base ; @0x4515a6 rax += 0x10
   *   @0x4515aa  *(void**)(this + 0x5e8) = rax
   *   @0x4515b1  rdi = *(void**)(this + 0x5f0)
   *   @0x4515b8  testq rdi, rdi
   *   @0x4515bb  je   0x4515c2
   *   @0x4515bd  callq __ZN18PC_Sp_counted_base12weak_releaseEv(rdi)
   *   @0x4515c2  rdi = this
   *   @0x4515c9  jmp  __ZdlPv                               — tail-call operator delete(this)
   *
   * The nearby `@0x4515d1  callq ___clang_call_terminate` is the terminate-on-throw
   * landing pad for the base dtor calls; unreachable on the normal return path.
   */
  dtorD0(): void {
    // @0x45158b: OZRenderParams::~OZRenderParams(this + 0x10).
    OZRenderParams_dtor_D1(this);
    // @0x45159a: LiImageSource::~LiImageSource(this + 0x5d8).
    LiImageSource_D2(this.liImageSource);
    // @0x4515aa: rebind secondary vptr.
    this.secondaryBoundToPCSharedBase = true;
    // @0x4515b1..@0x4515bb: conditional weak_release.
    const counted = this.pcSpCountedBase;
    if (counted !== null && counted !== undefined) {
      // @0x4515bd: PC_Sp_counted_base::weak_release(counted).
      PC_Sp_counted_base_weak_release(counted);
    }
    // @0x4515c9: tail-jmp operator delete(this).
    operator_delete(this);
  }
}
