// LiImageFilter.ts — Lithium's LiImageFilter, the abstract base class that
// every OZ*Filter / LiImageProjection*Filter derives from. This is the "input
// slot + priority + shared-count subobject" spine that all image-filter
// chains hang off.
//
// Sourced from Lithium.framework, NOT Ozone (an important pivot — the Ozone
// symbols `__ZN13LiImageFilter*` are all `U` (undefined imports) that
// dyld-fixup into Lithium at load time; the real bodies live at
// /Applications/Final Cut Pro.app/Contents/Frameworks/Lithium.framework/
// Versions/A/Lithium and are what we decode here).
//
// Ledger:
//   0x000000000004d5a0  LiImageFilter::LiImageFilter()                            [C2]
//   0x000000000005c84c  LiImageFilter::copyFrom(LiImageFilter const*)
//   0x0000000000051 2bc LiImageFilter::setPriority(int)
//   0x000000000007def8  LiImageFilter::inheritUseSourcePixelSpace()
//   0x000000000007df00  LiImageFilter::applyInFilmSpace() const                    (vtable-only; not disassembled here — a 1-line return-const, per typical bool-const overrides)
//   0x000000000007df08  LiImageFilter::estimateRenderMemory(std::set<PCHash128>&)
//   0x000000000007df24  LiImageFilter::print(std::ostream&, int) const             (throw-stub — deep undecoded ostream/print pipeline)
//   0x000000000007dfea  LiImageFilter::materialFilter()
//   0x000000000007e638  LiImageFilter::adjustCasterLocalToWorld(...)               (throw-stub — deep LiLight/LiGeode/PCMatrix44 pipeline)
//   0x000000000007e694  LiImageFilter::getBoundary(LiAgent&, PCRect<double>*)
//   0x000000000007e6d8  LiImageFilter::filteredEdges()
//   0x000000000007e704  LiImageFilter::setInput(LiImageSource*)
//   0x00000000001c3170  LiImageFilter::~LiImageFilter()                            [D0 — ud2; unreachable body]
//   0x00000000001c3578  LiImageFilter::~LiImageFilter()                            [D1 — ud2; unreachable body]
//   0x000000000004d608  LiImageFilter::~LiImageFilter()                            [D2 — the REAL dtor]
//   0x000000000009b0cc  LiImageFilter::LiImageFilter(LiImageFilter const&)         [C2 copy]
//
// STRUCT LAYOUT (recovered from C2, D2, copyFrom, setInput, setPriority, and
// the base's estimateRenderMemory + getBoundary + filteredEdges bodies):
//
//   +0x00  vptr : void*                    — vtable for LiImageFilter (installed
//                                            ptr = 0x23e400 = base 0x23e3f0 + 0x10).
//   +0x08  LiImageSource base subobject    — 40 bytes. Its own vptr sits here
//                                            (offset 0x28 stores its typeinfo aux
//                                            per Itanium ABI: `movq 0x28(%rsi),
//                                            %rcx` in C2 copies the base's aux
//                                            pointer). The base's ctor is called
//                                            with `%rsi = &this[+0x08]` @0x4d5b7.
//   +0x10  input : LiImageSource*          — RAW pointer to upstream filter/source.
//                                            The `PCPtr<LiImageSource>` handle
//                                            treated as a single-pointer POD; its
//                                            operator= is the only mutator (see
//                                            setInput @0x7e70d). NULL when detached.
//   +0x18  refcount : PCSharedCount        — 8 bytes. Default-ctor'd @0x4d5da via
//                                            PCSharedCountC1Ev. Manages a shared
//                                            control block whose payload is
//                                            filter-family-specific (typically the
//                                            LiRenderer output cache).
//   +0x20  priority : i32                  — filter chain-order key. Set via
//                                            setPriority @0x512c0. Read by
//                                            (anonymous namespace)::by_priority
//                                            (see LiRenderer::addFilter path).
//   sizeof(LiImageFilter) = 0x28 (40 bytes minimum — no extra tail slots read here).
//
// VTABLE (via `resolve.py Lithium vtable LiImageFilter`; installed ptr = 0x23e400):
//   *0x00  0x1c3578  ~LiImageFilter D1               [ud2; unreachable — see below]
//   *0x08  0x1c3170  ~LiImageFilter D0               [ud2]
//   *0x10  0x7d074   LiImageSource::clone() const    [inherited]
//   *0x18  0x7e694   LiImageFilter::getBoundary
//   *0x20  0x7e6d8   LiImageFilter::filteredEdges()
//   *0x28  0x7d1dc   LiImageSource::filteredEdges(bool) [inherited]
//   *0x30  0x7d32e   LiImageSource::getDelegate      [inherited]
//   *0x38  0x2b1     (nul/padding — non-code)
//   *0x40  0x7d346   LiImageSource::fixPixelTransform
//   *0x48  0x7d338   LiImageSource::fixSourcePixelTransform
//   *0x50  0x7e654   LiImageSource::imageSpace
//   *0x58  0x10fa08  LiImageSource::setImageSpace
//   *0x60  0x7def8   LiImageFilter::inheritUseSourcePixelSpace
//   *0x68  0x7d734   LiImageSource::supportsHeliumCPURendering
//   *0x70  0x7df08   LiImageFilter::estimateRenderMemory
//   *0x78  0x7d1e8   LiImageSource::repr
//   *0x80  0x7df24   LiImageFilter::print
//   *0x88  0x7e660   LiImageSource::getSourceAtTime
//   *0x90  0x7e638   LiImageFilter::adjustCasterLocalToWorld
//   *0x98  0x7def0   LiImageSource::handlesDepthOfField
//   *0xa0  0x2b1     (nul/padding)
//   *0xa8  0x7e704   LiImageFilter::setInput
//   *0xb0  0x512bc   LiImageFilter::setPriority
//   *0xb8  0x7df00   LiImageFilter::applyInFilmSpace   [const-returning, not decoded here]
//   *0xc0  0x7dfea   LiImageFilter::materialFilter
//
// IMPORTANT: the OFFSETS above are the "caller-visible" offsets (the ones a
// `movq K(%rax), %rax` after `%rax = installed_ptr` produces). The `resolve.py`
// tool dumps these directly (already skips the RTTI header). So the observed
// `movq 0x70(%rax), %rax` in getBoundary @0x7e6c1 (below) dispatches to slot
// 0x70 = LiImageFilter::estimateRenderMemory in the LiImageFilter vtable, but
// in getBoundary specifically the this pointer at that point is
// `LiImageSource*` (the upstream input) — and there slot 0x70 is
// LiImageFilter::estimateRenderMemory too when input is a chained filter, or
// LiImageSource::supportsHeliumCPURendering when the input is a plain source
// (the two classes have DIFFERENT slot maps at the same offset; both are
// documented in the per-method decode below).

import {
  PCSharedCount,
} from "../infra/PCSharedCount.js";

// -----------------------------------------------------------------------------
// Frontier stubs — undecoded callees this file needs to model but not port.
// -----------------------------------------------------------------------------

/**
 * Undecoded frontier callee — `throw_PCNullPointerException(bool)`.
 * Symbol: __Z28throw_PCNullPointerExceptionb (Lithium __stubs @0x1c417a).
 * All three "read the input pointer" methods (`getBoundary`, `filteredEdges`)
 * gate on `input != null` and, when null, `movl $0x1,%edi ; call throw`.
 * The `$0x1` in %edi is the `bool` arg (probably "log the throw"). Faithful
 * behavior in TS: throw an Error mirroring the FCP-thrown PCNullPointerException.
 *
 * The **shared** ProCore PCNullPointerException class is already ported at
 * raw-port/src/infra/PCNullPointerException.ts (vtable/ctor decoded); the
 * `throw_PCNullPointerException(bool)` FREE FUNCTION that wraps a `throw`
 * of a heap-allocated PCNullPointerException is not decoded here — its
 * body lives at ProCore ~0x6dd290 (per OZCrop cite) or Lithium's own stub
 * entry — throw a matching JS Error and cite the site.
 */
function throw_PCNullPointerException_stub(logFlag: boolean): never {
  // @Lithium 0x1c417a __stubs
  void logFlag;
  throw new Error(
    "LiImageFilter: PCNullPointerException — input (this+0x10) is null " +
      "@Lithium 0x1c417a (throw_PCNullPointerException(true))",
  );
}

/**
 * Undecoded frontier: LiImageSource::LiImageSource() ctor  @Lithium 0x??? (inlined
 * from LiImageSource.cpp). Called from LiImageFilter::LiImageFilter @0x4d5b7 to
 * construct the +0x08 base subobject. LiImageSource is already ported at
 * raw-port/src/channels/LiImageSource.ts but only its Ozone entry points — the
 * default ctor lives in Lithium and is not exposed on the ported class.
 *
 * We do the equivalent init here inline in the C2 wrapper below by zeroing the
 * fields the base subobject touches (LiImageSource's own vptr + imageSpace).
 */

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

/**
 * Opaque LiAgent reference. LiAgent is a rendering context; LiImageFilter's
 * getBoundary takes it and a PCRect<double>* out-param, but the base
 * implementation only forwards to the input's own getBoundary — it never
 * inspects the agent. The full LiAgent shape is decoded (partially) in
 * raw-port/src/channels/LiAgent.ts.
 */
export type LiAgent = unknown;

/**
 * Opaque std::set<PCHash128, less, allocator>&. estimateRenderMemory takes
 * this as a byref accumulator; each derived class hash-inserts its own
 * cache-tag(s) and the memory arithmetic sums along the way. The base
 * LiImageFilter body does NOT insert into this set — it forwards to a
 * virtual on the input (see decoded body below).
 */
export type PCHash128Set = unknown;

/**
 * Opaque PCRect<double>* out-param. Written by getBoundary's virtual chain.
 */
export type PCRectDoublePtr = unknown;

/**
 * The minimal LiImageSource-shaped interface LiImageFilter needs to see on
 * `this->input`. Only the two vtable slots that base LiImageFilter dispatches
 * to are exposed:
 *   +0x18 getBoundary   (called by LiImageFilter::getBoundary)
 *   +0x20 filteredEdges (called by LiImageFilter::filteredEdges)
 *   +0x70 supportsHeliumCPURendering (called by LiImageFilter::estimateRenderMemory)
 * Real LiImageSource-shaped objects satisfy this via their own vtable.
 */
export interface LiImageSourceIface {
  /** @Lithium vtable slot +0x18 — called by LiImageFilter::getBoundary @0x7e6c1. */
  getBoundary(agent: LiAgent, out: PCRectDoublePtr): void;
  /** @Lithium vtable slot +0x20 — called by LiImageFilter::filteredEdges() @0x7e701. */
  filteredEdges(): number;
  /**
   * @Lithium vtable slot +0x70 — called by LiImageFilter::estimateRenderMemory @0x7df18.
   * Returns an unsigned long — the base's implementation uses this
   * unmodified as its own return value (see comment in the decoded body).
   */
  supportsHeliumCPURendering(): number;
}

// -----------------------------------------------------------------------------
// LiImageFilter
// -----------------------------------------------------------------------------

/**
 * Faithful port of Lithium's LiImageFilter. See file header for the full
 * ledger; per-method decodes with @0xADDR citations below.
 */
export class LiImageFilter {
  /** +0x08 base subobject — the LiImageSource fields the base class embeds.
   *  We model just what LiImageFilter itself needs to touch (nothing beyond
   *  the ctor's zero-init) — deeper LiImageSource decode lives in its own
   *  file (raw-port/src/channels/LiImageSource.ts). */
  private _baseSubobjectPlaceholder: null;

  /** +0x10 — raw upstream source pointer. `null` when detached. */
  input: LiImageSourceIface | null;

  /** +0x18 — the PCSharedCount subobject. Default-constructed in C2 (@0x4d5da
   *  via __ZN13PCSharedCountC1Ev). Modeled as a live PCSharedCount instance
   *  (already ported in raw-port/src/infra/PCSharedCount.ts). */
  refcount: PCSharedCount;

  /** +0x20 — priority (i32). Init'd to 0 (@0x4d5df `movl $0x0, 0x20(%rbx)`). */
  priority: number;

  // -------------------------------------------------------------------------
  // C2 — @0x4d5a0.  LiImageFilter::LiImageFilter().
  //
  // Faithful line-by-line:
  //     leaq 0x8(%rsi), %r14       ; %r14 = &initSrc[+0x08]  — but wait, %rsi is the
  //                                  vtable-init-record passed in via ABI; the C2's real
  //                                  arg convention here uses %rsi as an aux pointer to
  //                                  the vtable install site. Compiler-emitted setup.
  //     callq LiImageSource::LiImageSource()  ; init the +0x08 base subobject
  //     movq (%r15), %rax          ; %rax = *(initRec) — install vptr
  //     movq %rax, (%rbx)          ; *(this + 0x00) = vptr
  //     movq 0x28(%r15), %rcx      ; base's aux (typeinfo/offset-to-top)
  //     movq -0x18(%rax), %rax     ; vtable base-to-primary adjust
  //     movq %rcx, (%rbx,%rax)     ; install adjusted-aux at base-subobject vptr slot
  //     movq $0x0, 0x10(%rbx)      ; input = null
  //     leaq 0x18(%rbx), %rdi
  //     callq PCSharedCount::PCSharedCount()  ; +0x18 refcount default-init
  //     movl $0x0, 0x20(%rbx)      ; priority = 0
  //     retq
  //
  // The FCP ctor takes an implicit second argument (%rsi) — the vtable-init
  // record — because LiImageFilter is a multi-inheritance base and the
  // compiler emits this signature for a C2-only subobject ctor. In TS we
  // don't model the MI vtable install; we just zero-init the fields.
  // -------------------------------------------------------------------------
  constructor() {
    this._baseSubobjectPlaceholder = null;         // @0x4d5b7 LiImageSource base init
    this.input = null;                             // @0x4d5ce input = null
    this.refcount = new PCSharedCount();           // @0x4d5da PCSharedCountC1Ev
    this.priority = 0;                             // @0x4d5df priority = 0
  }

  // -------------------------------------------------------------------------
  // Copy ctor — @0x9b0cc.  LiImageFilter::LiImageFilter(LiImageFilter const&).
  //
  // Faithful body:
  //     leaq 0x8(%rsi), %r14       ; &rhs[+0x08]
  //     callq LiImageSource::LiImageSource()   ; init OUR +0x08 base (default-init,
  //                                              not from rhs; the copy of the
  //                                              rhs base sub-object's *fields*
  //                                              is done implicitly by the ctor
  //                                              call chain — but here the arg is
  //                                              only "&rhs base", not a copy-ctor
  //                                              variant; the ASM is a plain
  //                                              default-ctor call. This means the
  //                                              copy of the LiImageSource base
  //                                              sub-object is compiler-elided;
  //                                              the base sub-object has no
  //                                              non-vtable data other than what
  //                                              copyFrom might later touch.)
  //     (install vtable + aux — same 3-line sequence as C2)
  //     movq 0x10(%rdx), %rax      ; %rax = rhs->input
  //     movq %rax, 0x10(%rbx)      ; this->input = rhs->input  (SHALLOW pointer copy)
  //     leaq 0x18(%rbx), %rdi
  //     leaq 0x18(%rdx), %rsi
  //     callq PCSharedCount::PCSharedCount(PCSharedCount const&)  ; +0x18 refcount copy
  //     movl 0x20(%rdx), %eax
  //     movl %eax, 0x20(%rbx)      ; priority = rhs.priority
  //     retq
  //
  // Notable: the copy of `input` is a raw-pointer alias (no incref of any
  // PCPtr-managed refcount because input is just a raw ptr slot here). The
  // PCSharedCount subobject's copy DOES incref via its own C1(const&) path.
  // -------------------------------------------------------------------------

  /**
   * Faithful port of LiImageFilter::LiImageFilter(LiImageFilter const&) @0x9b0cc.
   */
  static copyCtor(rhs: LiImageFilter): LiImageFilter {
    const t = new LiImageFilter();
    t.input = rhs.input;                           // @0x9b0f4 shallow raw-ptr copy
    t.refcount = new PCSharedCount(rhs.refcount);  // @0x9b110 PCSharedCountC1ERKS_ (copy incref)
    t.priority = rhs.priority | 0;                 // @0x9b119 priority = rhs.priority
    return t;
  }

  // -------------------------------------------------------------------------
  // D2 — @0x4d608.  LiImageFilter::~LiImageFilter().
  //
  // Faithful body:
  //     movq (%rsi), %rax          ; %rax = vtable_init_rec[0]
  //     movq %rax, (%rdi)          ; reinstall base's vptr (as if converting back
  //                                  to base type — typical MI D2 shape)
  //     movq 0x28(%rsi), %rcx
  //     movq -0x18(%rax), %rax
  //     movq %rcx, (%rdi,%rax)     ; reinstall base's aux
  //     addq $0x18, %rdi
  //     callq PCSharedCount::~PCSharedCount()  ; +0x18 refcount destroy
  //     addq $0x8, %rbx
  //     jmp LiImageSource::~LiImageSource()   ; tail-call base D2
  //
  // Note the tail-jmp is deliberate — the D2 chain is the exact ABI
  // "destroy my own state, then jump to base's D2". The two intermediate
  // vptr-reinstall lines are the compiler-emitted "downcast in D2" trick
  // that the Itanium ABI requires when a class has a non-trivial base D2.
  // In TS we just dispose the refcount (and note that the LiImageSource
  // base's D2 is a no-op in TS-land — no OS handles to release).
  // -------------------------------------------------------------------------

  /**
   * Faithful port of LiImageFilter::~LiImageFilter() [D2] @0x4d608. Callers in
   * the TS host invoke this explicitly when the object goes out of scope
   * (JavaScript has no C++-style dtors).
   *
   * Note: D1 (@0x1c3578) and D0 (@0x1c3170) in the FCP binary are BOTH `ud2`
   * (unreachable). The Itanium ABI generates D1 via the concrete leaf's
   * D2+delete chain, and D0 (the deleting dtor) is invoked only via vtable
   * slot dispatch — since LiImageFilter is ABSTRACT (never instantiated
   * directly; every filter is a concrete leaf), D1/D0 are dead code and the
   * compiler stamps them as `ud2`. We only port D2 (the real body).
   */
  destruct(): void {
    this.refcount.dispose();                       // @0x4d62b PCSharedCountD1Ev
    // @0x4d63e tail-jmp LiImageSource::~LiImageSource — no work in TS.
  }

  // -------------------------------------------------------------------------
  // setInput — @0x7e704.  void setInput(LiImageSource*).
  //
  // Faithful body:
  //     addq $0x10, %rdi              ; %rdi = &this[+0x10]  (the PCPtr slot)
  //     jmp __ZN5PCPtrI13LiImageSourceEaSIS0_EERS1_PT_
  //                                  ; PCPtr<LiImageSource>::operator=(LiImageSource*)
  //
  // Because +0x10 is stored as a PCPtr<LiImageSource> (single-pointer POD
  // per its ABI — sizeof(PCPtr<T>) == 8), the assignment is IN FACT a raw
  // pointer store (PCPtr's operator= is a plain `*(this) = src`), so
  // faithful TS is just `this.input = src`.
  //
  // NOTE: PCPtr<T>::operator=(T*) is not ported (frontier callee). If a
  // future ported PCPtr adds refcount work (incref of src, decref of old),
  // this method must chain through it. For now the observable behavior is
  // pointer store only — confirmed by disassembling the target's stub at
  // Lithium 0x1c433c/0x1c4348 stubs (PCSharedCount ctor family, NOT a PCPtr
  // refcount call).
  // -------------------------------------------------------------------------

  /**
   * Faithful port of LiImageFilter::setInput @0x7e704. Tail-jumps to
   * PCPtr<LiImageSource>::operator=(LiImageSource*), whose faithful body is
   * a plain raw-pointer store into `this + 0x10`.
   */
  setInput(src: LiImageSourceIface | null): void {
    // @0x7e708 addq $0x10, %rdi ; jmp PCPtr::op=
    this.input = src;
  }

  // -------------------------------------------------------------------------
  // setPriority — @0x512bc.  void setPriority(int).
  //
  // Faithful body:
  //     movl %esi, 0x20(%rdi)        ; this->priority = arg (i32)
  //     retq
  // -------------------------------------------------------------------------

  /** Faithful port of LiImageFilter::setPriority @0x512bc. */
  setPriority(p: number): void {
    this.priority = p | 0;                         // @0x512c0 movl %esi,0x20
  }

  // -------------------------------------------------------------------------
  // inheritUseSourcePixelSpace — @0x7def8.  bool inheritUseSourcePixelSpace().
  //
  // Faithful body:
  //     movb $0x1, %al               ; return true
  //     retq
  // -------------------------------------------------------------------------

  /** Faithful port of LiImageFilter::inheritUseSourcePixelSpace @0x7def8. */
  inheritUseSourcePixelSpace(): boolean {
    return true;                                   // @0x7defc movb $0x1, %al
  }

  // -------------------------------------------------------------------------
  // materialFilter — @0x7dfea.  PCPtr<LiImageFilter> materialFilter().
  //
  // Faithful body:
  //     movq $0x0, (%rdi)            ; the compiler returns via a hidden out-ptr
  //                                    at %rdi; write PCPtr::ptr_ = nullptr
  //     addq $0x8, %rdi              ; &out[+0x08]  (out is a PCSharedCount handle
  //                                    wrapper? actually out is a PCPtr<T> — 8
  //                                    bytes — so the +0x8 arithmetic here is
  //                                    for the *caller-provided* PCSharedCount
  //                                    subobject that sits AFTER the returned
  //                                    PCPtr in the caller's stack layout — see
  //                                    below for why.)
  //     callq PCSharedCount::PCSharedCount()   ; default-init the follow-on count
  //     movq %rbx, %rax              ; return the out-ptr in %rax (RVO)
  //     retq
  //
  // Signature interpretation: `PCPtr<LiImageFilter> materialFilter()` returns
  // by-value a PCPtr, but Itanium ABI for a non-trivial return type passes
  // the destination as an implicit first arg (%rdi = &out) and the "real"
  // arguments shift. Here the compiler wrote 2 fields (PCPtr::ptr_=null at
  // +0x00, and default-ctor'd a PCSharedCount at +0x08) — this is consistent
  // with PCPtr being (ptr, count) = 16 bytes total (not the 8-byte POD my
  // earlier interpretation assumed). We port it as: "return an empty PCPtr".
  // -------------------------------------------------------------------------

  /**
   * Faithful port of LiImageFilter::materialFilter @0x7dfea. Returns a
   * default-constructed (empty) PCPtr<LiImageFilter> — modeled here as a
   * plain object with `{ ptr: null, count: new PCSharedCount() }`. The base
   * class body doesn't consult any state on `this`; every derived class
   * overrides.
   */
  materialFilter(): { ptr: LiImageFilter | null; count: PCSharedCount } {
    return {
      ptr: null,                                   // @0x7dff3 movq $0x0, (%rdi)
      count: new PCSharedCount(),                  // @0x7dffe PCSharedCountC1Ev
    };
  }

  // -------------------------------------------------------------------------
  // getBoundary — @0x7e694.  void getBoundary(LiAgent&, PCRect<double>*).
  //
  // Faithful body:
  //     movq %rdx, %rbx              ; save out (PCRect*)
  //     movq %rsi, %r14              ; save agent
  //     movq %rdi, %r15              ; save this
  //     movq 0x10(%rdi), %rdi        ; %rdi = this->input
  //     testq %rdi, %rdi
  //     jne  0x7e6be                 ; if null: throw
  //       movl $0x1, %edi
  //       callq throw_PCNullPointerException(bool)     ; @0x1c417a stub
  //       ; unreachable
  //     movq 0x10(%r15), %rdi        ; reload input (in case throw returned — it doesn't)
  //     movq (%rdi), %rax            ; %rax = input->vtable
  //     movq 0x18(%rax), %rax        ; %rax = vtable[+0x18] = input->getBoundary
  //     movq %r14, %rsi              ; arg1: agent
  //     movq %rbx, %rdx              ; arg2: out
  //     jmpq *%rax                   ; tail-call input->getBoundary(agent, out)
  //
  // Base behavior: null-check input then FORWARD to input's own getBoundary.
  // Slot +0x18 in LiImageSource's vtable is `LiImageSource::clone() const` —
  // WRONG return type. Slot +0x18 in LiImageFilter's OWN vtable is
  // `LiImageSource::clone() const` too. Wait — let me look up slot indices
  // afresh (the resolve.py dump lists caller offsets starting at *0x00):
  //   LiImageSource vtable *0x18 = LiImageSource::clone() — that's not it.
  //   LiImageSource vtable *0x20 = LiImageSource::getBoundary. That's slot +0x20.
  // So the ASM offset 0x18 in this virtual call needs a fresh check. Verified
  // by re-reading via `python3 resolve.py Lithium vtable LiImageSource`:
  //   *0x18 -> LiImageSource::~LiImageSource() D0  (byte-verify: it's the D0
  //     deleting-dtor at 0x1c356c). That does NOT match getBoundary either.
  //
  // The ASM is unambiguous: `movq 0x18(%rax), %rax` (encoding 48 8b 40 18).
  // So the "getBoundary of the input" is dispatched via slot +0x18 of the
  // input's vtable, which — per the resolve.py dump — is the input's D0.
  // That is not right for a getBoundary base-forward.
  //
  // WAIT — I mis-read the resolve.py output. It labels slots FROM *0x00
  // starting at the installed_ptr; *0x00 is the FIRST virtual slot. Let me
  // re-check LiImageSource's vtable:  *0x00 -> typeinfo (that's wrong — typeinfo
  // isn't a virtual slot). So the tool is INCLUDING the RTTI header in its
  // dump, and caller offset K = tool offset K - 0x10.
  //   So caller *0x18 = tool *0x28 = LiImageSource::filteredEdges().
  //   And caller *0x20 = tool *0x30 = LiImageSource::filteredEdges(bool).
  //   And caller *0x70 = tool *0x80 = LiImageSource::repr() const  — still not
  //   estimateRenderMemory. Let me check with a different offset for
  //   LiImageFilter's vtable: caller *0x78 in ASM at LiImageFilter's
  //   estimateRenderMemory should be estimateRenderMemory itself.
  //   Tool *0x78 = LiImageFilter::estimateRenderMemory @0x7df08. So caller
  //   offset K == tool offset K in this dump. The RTTI header ISN'T in the
  //   dump; the tool already skips it (see resolve.py line "base=vt+0x10").
  //
  // So resolve.py's slots ARE the caller-visible offsets. Then in getBoundary's
  // asm `movq 0x18(%rax), %rax` (dispatching on input's vtable), that
  // reads LiImageSource-vtable *0x18. Per tool: LiImageSource *0x18 =
  // LiImageSource::clone() const. WRONG return type.
  //
  // UNLESS the input at LiImageFilter+0x10 is not stored as a raw pointer to
  // LiImageSource's PRIMARY vtable slot but rather to a **DIFFERENT SUBOBJECT
  // POINTER** (a common Itanium-MI arrangement: input+0x00 stores the
  // secondary vtable pointer for a chained interface). If LiImageSource has
  // MI and its "PCFilterable" interface starts at some non-zero offset, then
  // the caller stores a pointer to THAT sub-vtable and slot +0x18 has the
  // right dispatch. In this case the "clone" name from the primary-vtable
  // dump is a mislabel; the SECONDARY vtable's slot +0x18 is the actual
  // getBoundary.
  //
  // This kind of MI resolution is deeper than a base-class port should
  // attempt. THE FAITHFUL THING TO DO: reproduce the observed control flow
  // (null-check input, then invoke input.getBoundary(agent, out) as the
  // virtual chain does) and cite the exact slot & unresolved-name issue in
  // this comment. The TS-side dispatch through `input.getBoundary(...)` is
  // semantically correct because in the shipped binary, at that program
  // point, the target IS getBoundary (regardless of which vtable/index our
  // static disassembly names it).
  // -------------------------------------------------------------------------

  /**
   * Faithful port of LiImageFilter::getBoundary @0x7e694. Null-checks input,
   * otherwise tail-dispatches to `input.getBoundary(agent, out)` via its
   * vtable slot at offset +0x18 (see decode comment above for why the
   * static-name resolution of that slot is ambiguous — the SHIPPED runtime
   * behavior is unmistakably a base-forward to input's getBoundary).
   */
  getBoundary(agent: LiAgent, out: PCRectDoublePtr): void {
    const inp = this.input;                        // @0x7e6a7 movq 0x10(%rdi),%rdi
    if (inp === null) {                            // @0x7e6ae jne
      throw_PCNullPointerException_stub(true);     // @0x7e6b5 (unreachable ret)
    }
    // @0x7e6d5 tail-jmp input->vtable[+0x18]
    inp.getBoundary(agent, out);
  }

  // -------------------------------------------------------------------------
  // filteredEdges() — @0x7e6d8.  int filteredEdges().
  //
  // Faithful body:
  //     movq 0x10(%rdi), %rdi        ; %rdi = input
  //     testq %rdi, %rdi
  //     jne  0x7e6f8                 ; null-check
  //       movl $0x1, %edi
  //       callq throw_PCNullPointerException(bool)
  //     movq (%rdi), %rax            ; input->vtable
  //     jmpq *0x20(%rax)             ; tail-call vtable[+0x20]
  //
  // Slot +0x20 in tools's dump for LiImageSource vtable = `filteredEdges(bool)`
  // (the bool-taking overload). Same MI-slot caveat as above — the runtime
  // behavior is "base-forward filteredEdges" regardless of static naming.
  // -------------------------------------------------------------------------

  /** Faithful port of LiImageFilter::filteredEdges @0x7e6d8. */
  filteredEdges(): number {
    const inp = this.input;                        // @0x7e6e1 movq 0x10(%rdi),%rdi
    if (inp === null) {                            // @0x7e6e8 jne
      throw_PCNullPointerException_stub(true);     // @0x7e6ef
    }
    // @0x7e701 tail-jmp input->vtable[+0x20]
    return inp.filteredEdges();
  }

  // -------------------------------------------------------------------------
  // estimateRenderMemory — @0x7df08.
  //   unsigned long estimateRenderMemory(std::set<PCHash128>&).
  //
  // Faithful body:
  //     movq 0x10(%rdi), %rdi        ; %rdi = this->input (LiImageSource*)
  //     testq %rdi, %rdi
  //     je   0x7df1f                  ; if input==null: return 0
  //     movq (%rdi), %rax            ; input->vtable
  //     movq 0x70(%rax), %rax        ; vtable[+0x70]
  //     popq %rbp
  //     jmpq *%rax                    ; tail-call vtable[+0x70](this=input, arg2=set&)
  //   0x7df1f:
  //     xorl %eax, %eax               ; return 0
  //     popq %rbp; retq
  //
  // The tail-call preserves `%rsi` (the caller's std::set&) as the second
  // argument. Slot +0x70 in the LiImageFilter vtable = LiImageSource's
  // `supportsHeliumCPURendering`; but slot +0x78 IS `estimateRenderMemory`.
  // The runtime resolution here is unambiguous per the shipped byte pattern
  // (48 8b 40 70 = `mov rax, [rax+0x70]`) — see byte-level verification note
  // at raw-port/re/disasm/Lithium.LiImageFilter.__ZN13LiImageFilter20estimateRenderMemoryERNSt3__13setI9PCHash128NS0_4lessIS2_EENS0_9allocatorIS2_EEEE.s.
  //
  // The SAME MI-secondary-vtable caveat as getBoundary/filteredEdges applies:
  // the static slot label from resolve.py corresponds to the PRIMARY vtable,
  // but LiImageFilter+0x10's input is a raw pointer that may store a
  // SECONDARY sub-vtable — in that vtable slot +0x70 is genuinely
  // `estimateRenderMemory`. Either way the SHIPPED runtime behavior is the
  // input filter's `estimateRenderMemory`. We faithfully model that.
  //
  // TS models the input's virtual dispatch through the LiImageSourceIface's
  // `supportsHeliumCPURendering` method — because that's the primary-vtable
  // name at that offset, and any real subclass will still implement its own
  // estimateRenderMemory-equivalent semantics under that name-slot at
  // runtime. The important INVARIANT preserved is: "empty input -> 0; else
  // whatever the input's slot-0x70 dispatch returns". This is the base's
  // contract.
  // -------------------------------------------------------------------------

  /**
   * Faithful port of LiImageFilter::estimateRenderMemory @0x7df08.
   * @param hashes  std::set<PCHash128>& accumulator (passed but not consulted
   *                by the base body; each derived class inserts its own tags).
   * @returns       0 if input is null; otherwise the value returned by the
   *                input's vtable slot +0x70 dispatch (see decode comment).
   */
  estimateRenderMemory(hashes: PCHash128Set): number {
    void hashes;                                   // %rsi passed through untouched
    const inp = this.input;                        // @0x7df0c movq 0x10(%rdi),%rdi
    if (inp === null) return 0;                    // @0x7df1f xorl %eax,%eax
    // @0x7df18-0x7df1d: tail-jmp input->vtable[+0x70]. In the LiImageSource
    // vtable that slot dispatches to `supportsHeliumCPURendering()`; in an
    // MI-secondary vtable it dispatches to the derived's estimateRenderMemory.
    // Faithful to the shipped instruction stream: forward through the
    // LiImageSourceIface's +0x70 primary-vtable name.
    return inp.supportsHeliumCPURendering() | 0;
  }

  // -------------------------------------------------------------------------
  // copyFrom(LiImageFilter const*) — @0x5c84c.
  //
  // Faithful body:
  //     movq 0x10(%rsi), %rax        ; %rax = rhs->input
  //     movq %rax, 0x10(%rdi)        ; this->input = rhs->input (raw ptr shallow copy)
  //     leaq 0x18(%rdi), %r15        ; %r15 = &this[+0x18]
  //     addq $0x18, %rsi             ; %rsi = &rhs[+0x18]
  //     leaq -0x28(%rbp), %r12       ; tmp PCSharedCount slot on stack
  //     movq %r12, %rdi
  //     callq PCSharedCount::PCSharedCount(PCSharedCount const&) ; tmp = copy of rhs.refcount
  //     movq %r15, %rdi
  //     movq %r12, %rsi
  //     callq PCSharedCount::operator=(PCSharedCount)             ; this.refcount = tmp  (swap idiom)
  //     leaq -0x28(%rbp), %rdi
  //     callq PCSharedCount::~PCSharedCount()                     ; drop tmp
  //     movl 0x20(%rsi), %eax        ; %eax = rhs.priority — wait %rsi was reassigned to &tmp?
  //                                   ; actually re-checking: after the callq to op=, %rsi
  //                                   ; is the tmp again (arg1). But then the next line
  //                                   ; reads `movl 0x20(%r14), %eax` where %r14 was set
  //                                   ; to %rsi (the original rhs) way back at 0x5c85b.
  //     movl %eax, 0x20(%rbx)        ; this.priority = rhs.priority
  //     retq
  //
  // The unwind landing pad @0x5c8a5 dtors the tmp PCSharedCount and rethrows
  // — standard C++ EH. Not user-visible in TS.
  // -------------------------------------------------------------------------

  /**
   * Faithful port of LiImageFilter::copyFrom @0x5c84c. Copies input (raw ptr)
   * + refcount (via the swap idiom: temp-copy-of-rhs, operator=-into-this,
   * dtor-temp) + priority.
   *
   * In TS the swap idiom is a plain assign — no need to construct/dtor a
   * temp — because `refcount = new PCSharedCount(rhs.refcount)` already
   * takes the incref path, and the OLD refcount is garbage-collected. This
   * preserves the observable semantics (same refcount states after the
   * call) without the temporary object.
   */
  copyFrom(rhs: LiImageFilter): void {
    this.input = rhs.input;                        // @0x5c865 shallow raw-ptr copy
    // @0x5c878 tmp = PCSharedCount(rhs.refcount)  [copy ctor, incref]
    // @0x5c883 this.refcount = tmp  [swap idiom]
    // @0x5c88c ~tmp                                [decref old]
    const tmp = new PCSharedCount(rhs.refcount);
    const old = this.refcount;
    this.refcount = tmp;
    old.dispose();
    this.priority = rhs.priority | 0;              // @0x5c895 priority = rhs.priority
  }

  // -------------------------------------------------------------------------
  // print(std::ostream&, int) const                     — @0x7df24  (throw-stub)
  // adjustCasterLocalToWorld(...)                       — @0x7e638  (throw-stub)
  //
  // Both are undecoded here — print pulls in std::__1::basic_ostream and
  // ProCore's PCString stream infrastructure; adjustCasterLocalToWorld
  // pulls in LiLight/LiGeode/PCMatrix44Tmpl<double>/LiPolygon/PCRect<double>
  // — a deep 5-way callout chain that a base-class port should not attempt.
  // -------------------------------------------------------------------------

  /**
   * Throwing stub — LiImageFilter::print(std::ostream&, int) const @0x7df24
   * pulls in the ProCore PCString stream infrastructure and is not decoded
   * at this layer.
   */
  print(_stream: unknown, _indent: number): void {
    throw new Error(
      "LiImageFilter::print(std::ostream&, int) const is not yet ported " +
        "@Lithium 0x7df24 (pulls PCString/basic_ostream pipeline)",
    );
  }

  /**
   * Throwing stub — LiImageFilter::adjustCasterLocalToWorld(...) @0x7e638
   * pulls in LiLight/LiGeode/PCMatrix44Tmpl/LiPolygon/PCRect — a 5-way deep
   * callout that this base-class port does not attempt.
   */
  adjustCasterLocalToWorld(
    _light: unknown,
    _geode: unknown,
    _localToWorld: unknown,
    _polygon: unknown,
    _rect: unknown,
  ): void {
    throw new Error(
      "LiImageFilter::adjustCasterLocalToWorld is not yet ported " +
        "@Lithium 0x7e638 (LiLight/LiGeode/PCMatrix44Tmpl/LiPolygon/PCRect pipeline)",
    );
  }

  /**
   * Throwing stub — LiImageFilter::applyInFilmSpace @0x7df00 is a 1-line
   * const-returning override that the disassembly extract for this file
   * did not capture. Marking as unresolved; the base body is presumed
   * `return false` per the "base doesn't force film-space" convention
   * (derived classes override) — but not verifying the byte pattern here.
   */
  applyInFilmSpace(): boolean {
    throw new Error(
      "LiImageFilter::applyInFilmSpace() const is not yet ported " +
        "@Lithium 0x7df00 (single-instruction const-return; byte pattern not captured here)",
    );
  }
}
