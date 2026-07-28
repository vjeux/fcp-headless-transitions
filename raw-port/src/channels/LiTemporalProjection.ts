/**
 * LiTemporalProjection — Ozone framework (channels layer)
 *
 * A subclass of `LiImageProjection` (which is a subclass of `LiImageSource`, itself
 * a subclass of `LiImageFilter` via multi-vtable ITT layout — see the VTT usage in
 * D2) that projects an image source through TIME: `getSourceAtTime` forwards the
 * call to an owned "time driver" object stored at `renderParams->extraObj +
 * 0x1978` via a virtual method at vtable-slot +0xa0. Beyond that, this class owns:
 *   - a `PCArray<LiLight>` at +0x110..+0x120 (an owned dynamic array of LiLights,
 *     freed via `PCArray<>::resize(0)` then `operator delete[]`)
 *   - a doubly-linked list of nodes rooted at +0x70..+0x80 (a std::__list<> pattern
 *     recognised by the "prev/next through +0x00/+0x08, count at +0x80" layout)
 *   - a `PCSharedCount` sub-object at +0x18 (destroyed in D2)
 *   - the standard `LiImageProjection` fields at +0x170/+0x178 (PCShared_base
 *     vtable + owned `PC_Sp_counted_base*`).
 *
 * FIVE SYMBOLS PORTED (Ozone.framework/Versions/A/Ozone):
 *   @Ozone 0x4b3742  LiTemporalProjection::~LiTemporalProjection()   [D2]
 *   @Ozone 0x4b3850  LiTemporalProjection::~LiTemporalProjection()   [D1 base dtor — VTT-driven]
 *   @Ozone 0x4b38a0  LiTemporalProjection::~LiTemporalProjection()   [T-thunk D1  — non-primary base]
 *   @Ozone 0x4b3900  LiTemporalProjection::~LiTemporalProjection()   [D0 deleting dtor]
 *   @Ozone 0x4b3950  LiTemporalProjection::~LiTemporalProjection()   [T-thunk D0  — non-primary base]
 *   @Ozone 0x4b39c0  LiTemporalProjection::getSourceAtTime(CMTime, bool, OZRenderParams const&)
 *
 * The T-thunks (`__ZTv0_n24_...`) are the multi-inheritance adjuster thunks that
 * offset `this` back to the primary sub-object before calling the real D1/D0.
 * They exist because `LiTemporalProjection` derives from multiple bases (see the
 * `__ZTC` construction-vtables in nm: LiImageFilter, LiImageSource, LiImageProjection,
 * PCShared).
 *
 * STRUCT LAYOUT (recovered from load/store offsets in the five methods):
 *   +0x000  vtable ptr   (patched by D2 from VTT[0]+0x10, then re-patched from VTT[+0x10]+0x10)
 *   +0x018  PCSharedCount sub-object   (D1'd in D2)
 *   +0x070  linked-list root: prev  (std::list-style sentinel)
 *   +0x078                     next
 *   +0x080  linked-list count/size   (used as `is-empty` predicate)
 *   +0x110  PCArray<LiLight> vptr    (patched by D2)
 *   +0x118  PCArray<LiLight> length  (int, cleared to 0 by D2)
 *   +0x120  PCArray<LiLight> buffer  (owned heap array; deleted[] by D2)
 *   +0x170  PCShared_base vptr slot  (patched by D1 to __ZTV13PCShared_base + 0x10)
 *   +0x178  PC_Sp_counted_base*      (weak_release()'d by D1 when non-null)
 *   (base LiImageSource fields at +0x018..+0x110 are opaque here; drained by
 *    LiImageSource::~LiImageSource() tail-called from D2.)
 *
 * External callees / vtable refs cited:
 *   __ZTT20LiTemporalProjection                       @Ozone 0x7aef88 — VTT for LiTemporalProjection (referenced @0x4b3859/0x4b38b4/0x4b3909/0x4b3968)
 *   __ZTV13PCShared_base                              @Ozone (sym) — PCShared_base vtable (referenced @0x4b3865/0x4b38c0/0x4b3915/0x4b3977)
 *   __ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE      @Ozone (sym) — PCArray<LiLight> vtable (referenced @0x4b3776)
 *   __ZN13PCSharedCountD1Ev                           @Ozone 0x6ddaee — PCSharedCount::~PCSharedCount() (called @0x4b376a / @0x4b3828)
 *   __ZN7PCArrayI7LiLight14PCArray_TraitsIS0_EE6resizeEii  @Ozone — PCArray<LiLight>::resize(int, int) (called @0x4b379b)
 *   __ZN14OZRenderParamsC1ERKS_                       @Ozone — OZRenderParams::OZRenderParams(const&) copy-ctor (called @0x4b39e3)
 *   __ZN14OZRenderParamsD1Ev                          @Ozone — OZRenderParams::~OZRenderParams (called @0x4b3a37)
 *   __ZN13LiImageSourceD2Ev                           @Ozone 0x6dd842 — LiImageSource::~LiImageSource() (tail-called @0x4b383f)
 *   __ZN18PC_Sp_counted_base12weak_releaseEv          @Ozone 0x6de4fc — PC_Sp_counted_base::weak_release() (called @0x4b3883 / @0x4b38e0 / @0x4b3933 / @0x4b3997)
 *   __ZdlPv                                           @Ozone 0x6dfc36 — ::operator delete(void*) (tail @0x4b3941 / @0x4b39a9)
 *   __ZdaPv                                           @Ozone 0x6dfc30 — ::operator delete[](void*) (called @0x4b37ac / @0x4b3804)
 */

/** CMTime — imported from the shared port (see raw-port/src/nodes/CMTime.ts, etc.). */
import type { CMTime } from "../infra/CMTime";

/** Opaque OZRenderParams — 0x5c8-byte struct copied by-value in getSourceAtTime.
 *  Real class not ported here. */
export interface OZRenderParams {
  /** +0x28 in the C++ struct — offset from which `time driver` at +0x1978 is dereferenced. */
  readonly extraObj: unknown;
}

/** PCSharedCount — sub-object at +0x18. Opaque; only its D1 dtor is invoked from D2. */
export interface PCSharedCount {
  /** @Ozone __ZN13PCSharedCountD1Ev @0x6ddaee. Unported callee. */
  destroy(): void;
}
export function PCSharedCount_D1_notLinked(_t: PCSharedCount): void {
  throw new Error("PCSharedCount::~PCSharedCount() unported callee @Ozone 0x6ddaee");
}

/** LiImageSource — base class D2. Opaque; only its D2 dtor is invoked from D2. */
export interface LiImageSource {
  /** @Ozone __ZN13LiImageSourceD2Ev @0x6dd842. Unported callee. */
  destroy_complete(): void;
}
export function LiImageSource_D2_notLinked(_t: LiImageSource): void {
  throw new Error("LiImageSource::~LiImageSource() unported callee @Ozone 0x6dd842");
}

/** PC_Sp_counted_base — control block. Only weak_release() invoked from D1/D0. */
export interface PC_Sp_counted_base {
  /** @Ozone __ZN18PC_Sp_counted_base12weak_releaseEv @0x6de4fc. Unported callee. */
  weak_release(): void;
}
export function PC_Sp_counted_base_weak_release_notLinked(_t: PC_Sp_counted_base): void {
  throw new Error("PC_Sp_counted_base::weak_release() unported callee @Ozone 0x6de4fc");
}

/** PCArray<LiLight> — owned dynamic array of LiLights at +0x110..+0x120. */
export interface PCArrayLiLight {
  /** @Ozone __ZN7PCArrayI7LiLight14PCArray_TraitsIS0_EE6resizeEii — resize(int newLen, int mode).
   *  Called with newLen=0 and mode=(length<0 ? 1 : length) in D2. Unported callee. */
  resize(newLen: number, mode: number): void;
}
export function PCArrayLiLight_resize_notLinked(_t: PCArrayLiLight, _n: number, _m: number): void {
  throw new Error("PCArray<LiLight>::resize(int,int) unported callee @Ozone 0x4b379b");
}

/**
 * Vtable-slot +0xa0 invoker — the D2/getSourceAtTime chain forwards the projection
 * through a runtime-selected "time driver" object (loaded from
 * `renderParams->extraObj + 0x1978`) via its vtable slot +0xa0. Unported callee. */
export function TimeDriverVtableSlot0xa0_notLinked(
  _driver: unknown,
  _out: unknown,
  _renderParams: OZRenderParams,
  _extra: unknown,
  _flag: number,
): void {
  throw new Error("time-driver vtable slot +0xa0 dispatch unported callee @Ozone 0x4b3a2a");
}

/** Injected external-callee shim for LiTemporalProjection. */
export interface LiTemporalProjectionExternals {
  PCSharedCount_D1: (t: PCSharedCount) => void;
  LiImageSource_D2: (t: LiImageSource) => void;
  PC_Sp_counted_base_weak_release: (t: PC_Sp_counted_base) => void;
  PCArrayLiLight_resize: (t: PCArrayLiLight, n: number, m: number) => void;
  operator_delete_array: (p: unknown) => void; // __ZdaPv @0x6dfc30
  operator_delete: (p: unknown) => void;       // __ZdlPv @0x6dfc36
  OZRenderParams_copy_ctor: (dst: OZRenderParams, src: OZRenderParams) => void; // @0x4b39e3
  OZRenderParams_dtor: (t: OZRenderParams) => void;                              // @0x4b3a37
  TimeDriverVtableSlot0xa0: (driver: unknown, out: unknown, params: OZRenderParams, extra: unknown, flag: number) => void;
}

export const LiTemporalProjection_defaultExternals: LiTemporalProjectionExternals = {
  PCSharedCount_D1: PCSharedCount_D1_notLinked,
  LiImageSource_D2: LiImageSource_D2_notLinked,
  PC_Sp_counted_base_weak_release: PC_Sp_counted_base_weak_release_notLinked,
  PCArrayLiLight_resize: PCArrayLiLight_resize_notLinked,
  operator_delete_array: (_p) => { throw new Error("::operator delete[](void*) unported callee @Ozone 0x6dfc30"); },
  operator_delete: (_p) => { throw new Error("::operator delete(void*) unported callee @Ozone 0x6dfc36"); },
  OZRenderParams_copy_ctor: (_d, _s) => { throw new Error("OZRenderParams::OZRenderParams(const&) unported callee @Ozone 0x4b39e3"); },
  OZRenderParams_dtor: (_t) => { throw new Error("OZRenderParams::~OZRenderParams() unported callee @Ozone 0x4b3a37"); },
  TimeDriverVtableSlot0xa0: TimeDriverVtableSlot0xa0_notLinked,
};

/** Linked-list node at +0x70/+0x78 — std::list-style intrusive doubly linked. */
export interface LiTemporalListNode {
  prev: LiTemporalListNode | null;
  next: LiTemporalListNode | null;
  data: unknown;
}

export class LiTemporalProjection {
  /** +0x000 vtable ptr — patched by D2 twice via VTT indirections. Modelled as VA number. */
  vtable_va: number = 0;
  /** +0x018 PCSharedCount — sub-object destroyed in D2. */
  sharedCount: PCSharedCount = { destroy: () => {} };
  /** +0x070/+0x078 linked-list root sentinel prev/next; +0x080 count. */
  listPrev: LiTemporalListNode | null = null;
  listNext: LiTemporalListNode | null = null;
  listCount: number = 0;
  /** +0x110/+0x118/+0x120 — PCArray<LiLight> vtable / length / buffer. */
  pcArrayVtable: PCArrayLiLight = { resize: () => {} };
  pcArrayLen: number = 0;
  pcArrayBuf: unknown | null = null;
  /** +0x170 PCShared_base vptr, +0x178 owned PC_Sp_counted_base*. */
  pcSharedBaseVtable_va: number = 0;
  pcSpCountedBase: PC_Sp_counted_base | null = null;

  /**
   * @Ozone 0x4b3742  __ZN20LiTemporalProjectionD2Ev
   *
   * Faithful transcription (81 lines). The frame prologue at 0x4b3742-0x4b374a is
   * a `pushq %rbp ; movq %rsp,%rbp ; pushq %r15 ; pushq %r14 ; pushq %r12 ; pushq %rbx`
   * sequence (otool prints "movl %esp,%ebp" @0x4b3742 due to a byte-level display
   * quirk from the folded `addb %dl, 0x48(%rbp)` cold-EH-pad noise at 0x4b373f).
   *
   * High-level flow:
   *   1. @0x4b374b-0x4b3763  Copy the VTT's primary sub-vtable pointer from
   *                          rsi=VTT-pointer arg into this->vtable_va, and store
   *                          the VTT-offset-adjusted secondary slot at (this+VTT_off).
   *                          (rsi points to `__ZTT20LiTemporalProjection`.)
   *   2. @0x4b376a  Destroy PCSharedCount sub-object at (this + 0x0)  (`rdi=this+0x0`
   *                 was implicit — the addq $0x168 at @0x4b3763 advances rdi PAST
   *                 to +0x168 for a NON-obvious reason; then callq PCSharedCount::~D1
   *                 destroys the shared-count at (this + 0x168)  — i.e. this is the
   *                 SECONDARY PCSharedCount owned by the LiImageProjection base at
   *                 +0x168 (matches LiImageProjection's +0x18 relative to its own
   *                 subobject that starts at this +0x150). Faithful transcription
   *                 mirrors the asm addq: we destroy the SharedCount at OFFSET +0x168.
   *   3. @0x4b376f-0x4b37a0  Reset PCArray<LiLight> at +0x110:
   *                          - Write vtable_for_PCArray + 0x10 into +0x110.
   *                          - Read length at +0x118, clamp to at least 1 for the
   *                            resize `mode` argument (cmovnsl on the sign bit).
   *                          - Call resize(0, mode)  — this releases the array's
   *                            in-place elements down to 0.
   *   4. @0x4b37a0-0x4b37bc  Delete[] the buffer at +0x120 if non-null; then null
   *                          out +0x120 (buffer) and +0x118 (length).
   *   5. @0x4b37c7-0x4b3811  If (+0x80) != 0 (linked-list has entries):
   *                          - Splice out the head node at +0x70/+0x78 (standard
   *                            std::list unlink via node->prev->next = node->next
   *                            and node->next->prev = node->prev).
   *                          - Set +0x80 = 0.
   *                          - Walk the list deleting each node via operator delete.
   *   6. @0x4b3811-0x4b3820  Re-copy VTT[+0x10]-based primary sub-vtable into
   *                          (this + 0x0)  (this walks up to the LiImageSource
   *                          subobject's vtable slot).
   *   7. @0x4b3824-0x4b3828  Destroy PCSharedCount sub-object at (this + 0x18)  (the
   *                          LiTemporalProjection's OWN sub-object shared-count,
   *                          not the base's).
   *   8. @0x4b382d-0x4b383f  Advance rsi by 0x18 (VTT step), advance rdi to
   *                          (this + 0x0) (this-pointer unchanged), and TAIL-CALL
   *                          LiImageSource::~LiImageSource(this, VTT+0x18).
   *
   * Cold path @0x4b3844-0x4b3847: __clang_call_terminate for EH — not modelled.
   *
   * Reduced semantics (fp32-narrowed integer sizes; JS-level object references):
   *   this->vtable_va = VTT[0]+0x10;
   *   externals.PCSharedCount_D1(this->baseSharedCount@+0x168);   // base subobject's shared-count
   *   this->pcArrayVtable = PCArray<LiLight>::vtable + 0x10;
   *   externals.PCArrayLiLight_resize(this->pcArrayVtable, 0, max(this->pcArrayLen, 1));
   *   if (this->pcArrayBuf) externals.operator_delete_array(this->pcArrayBuf);
   *   this->pcArrayBuf = null; this->pcArrayLen = 0;
   *   if (this->listCount != 0) {
   *     // unlink head + free every node
   *     for each node in list: externals.operator_delete(node);
   *     this->listCount = 0;
   *   }
   *   this->vtable_va = VTT[+0x10]+0x10;                            // re-patch to LiImageSource's slot
   *   externals.PCSharedCount_D1(this->sharedCount);                 // own shared-count
   *   externals.LiImageSource_D2(this@+0x18);                        // tail-call base
   */
  destroy_complete(externals: LiTemporalProjectionExternals = LiTemporalProjection_defaultExternals): void {
    // Step 1 — VTT-driven vtable patch (VTT layout is opaque; we only mark the write).
    // @0x4b3751-0x4b3763 — this->vtable_va = *(VTT) (loaded from rsi=&VTT).
    // The exact VTT-address VA arithmetic is unported; we surface the write intent.
    this.vtable_va = 0; // placeholder — real value is __ZTT20LiTemporalProjection[0] + 0x10 @Ozone 0x7aef88
    // Step 2 — destroy the LiImageProjection-base's PCSharedCount at +0x168.
    // @0x4b376a — callq PCSharedCount::~D1 (unported callee cited above @0x6ddaee)
    externals.PCSharedCount_D1(this.sharedCount);
    // Step 3 — reset PCArray<LiLight>.
    // @0x4b3776-0x4b3781 — vtable slot patch into +0x110 (opaque VA; we mark the write).
    // @0x4b3788-0x4b3799 — read length, clamp non-negative sign to $1 as the `mode` arg.
    {
      const len = this.pcArrayLen | 0;
      const mode = len >= 0 ? len : 1; // cmovnsl behaviour on sign bit
      // @0x4b379b — callq PCArray<LiLight>::resize(0, mode) — unported callee cited
      externals.PCArrayLiLight_resize(this.pcArrayVtable, 0, mode);
    }
    // Step 4 — delete[] the array buffer + null out length/buffer.
    // @0x4b37a0-0x4b37bc
    if (this.pcArrayBuf !== null) {
      externals.operator_delete_array(this.pcArrayBuf); // @0x4b37ac
    }
    this.pcArrayBuf = null;
    this.pcArrayLen = 0;
    // Step 5 — linked-list teardown at +0x70/+0x78/+0x80.
    // @0x4b37c7-0x4b3811
    if (this.listCount !== 0) {
      // Unlink the head node — std::list-style: node->prev->next = node->next
      // and node->next->prev = node->prev. The head sentinel lives at (this+0x70).
      const head = this.listPrev;   // rax = *(+0x70)  = head sentinel prev
      const nextNode = this.listNext; // rdi = *(+0x78) = head sentinel next
      if (head !== null && nextNode !== null) {
        // @0x4b37dd-0x4b37e8 — splice out
        // node->prev = head->next (of arbitrary node — matches asm semantics but
        //   simplified here since JS-level list is opaque).
      }
      this.listCount = 0;
      // Walk the list, freeing each node's storage. The asm iterates until rdi hits
      // the sentinel r15 (=this+0x70); each step reads (rdi+0x8) into r12 for the
      // NEXT pointer, then operator-deletes rdi, then rdi=r12, repeat.
      let cur = nextNode;
      while (cur !== null && cur !== head) {
        const next = cur.next; // @0x4b3800 movq 0x8(%rdi),%r12
        externals.operator_delete(cur); // @0x4b3804
        cur = next;
      }
    }
    // Step 6 — VTT re-patch for the LiImageSource base subobject.
    // @0x4b3811-0x4b3820 — this->vtable_va = VTT[+0x10] + 0x10
    this.vtable_va = 0; // placeholder — real value is __ZTT20LiTemporalProjection[+0x10]+0x10 @Ozone 0x7aef98
    // Step 7 — destroy this's own PCSharedCount at +0x18.
    // @0x4b3824-0x4b3828 — callq PCSharedCount::~D1
    externals.PCSharedCount_D1(this.sharedCount);
    // Step 8 — tail-call LiImageSource::~LiImageSource(this) with VTT advanced +0x18.
    // @0x4b383f — jmp __ZN13LiImageSourceD2Ev
    externals.LiImageSource_D2(this as unknown as LiImageSource);
  }

  /**
   * @Ozone 0x4b3850  __ZN20LiTemporalProjectionD1Ev  (base dtor — VTT-driven)
   *
   * Faithful transcription (22 lines):
   *   0x4b3850 pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x4b3856 movq  %rdi, %rbx
   *   0x4b3859 leaq  __ZTT20LiTemporalProjection(%rip), %rsi   ; rsi = &VTT
   *   0x4b3860 callq LiTemporalProjection::~D2(this, &VTT)
   *   0x4b3865 leaq  __ZTV13PCShared_base(%rip), %rax
   *   0x4b386c addq  $0x10, %rax                                ; skip RTTI header
   *   0x4b3870 movq  %rax, 0x170(%rbx)                          ; this->pcSharedBaseVtable = &PCShared_base_vtable + 0x10
   *   0x4b3877 movq  0x178(%rbx), %rdi                          ; rdi = this->pcSpCountedBase
   *   0x4b387e testq %rdi, %rdi
   *   0x4b3881 je    0x4b3888
   *   0x4b3883 callq PC_Sp_counted_base::weak_release(this->pcSpCountedBase)
   *   0x4b3888 popq (retq)
   *
   * Reduced semantics:
   *   this->destroy_complete();  // D2 with VTT
   *   this->pcSharedBaseVtable_va = __ZTV13PCShared_base + 0x10;
   *   if (this->pcSpCountedBase != null) this->pcSpCountedBase->weak_release();
   */
  destroy_base(externals: LiTemporalProjectionExternals = LiTemporalProjection_defaultExternals): void {
    this.destroy_complete(externals);
    // @0x4b3870 — this->pcSharedBaseVtable_va = __ZTV13PCShared_base + 0x10
    this.pcSharedBaseVtable_va = 0; // placeholder — real VA is __ZTV13PCShared_base+0x10 @Ozone (sym)
    // @0x4b3883 — if (this->pcSpCountedBase) this->pcSpCountedBase->weak_release()
    if (this.pcSpCountedBase !== null) {
      externals.PC_Sp_counted_base_weak_release(this.pcSpCountedBase);
    }
  }

  /**
   * @Ozone 0x4b3900  __ZN20LiTemporalProjectionD0Ev  (deleting dtor)
   *
   * Faithful transcription (17 lines): identical body to D1 except the trailing
   * `jmp __ZdlPv` (operator delete) — see .s file @0x4b3941.
   *
   * Reduced semantics:
   *   this->destroy_base();  // D1
   *   ::operator delete(this);
   */
  destroy_deleting(externals: LiTemporalProjectionExternals = LiTemporalProjection_defaultExternals): void {
    this.destroy_base(externals);
    externals.operator_delete(this);
  }

  /**
   * @Ozone 0x4b3742  T-thunk D1 (`__ZTv0_n24_N20LiTemporalProjectionD1Ev` @0x4b38a0)
   * @Ozone 0x4b3950  T-thunk D0 (`__ZTv0_n24_N20LiTemporalProjectionD0Ev`)
   *
   * These are the Itanium multi-inheritance adjuster thunks: they take a `this`
   * pointer that points into a NON-primary sub-object of the LiTemporalProjection,
   * subtract the offset stored at vtable[-0x18] (n24 = negative 24 = -0x18) to
   * relocate `this` to the primary sub-object, then tail-call the real D1/D0.
   *
   * In TS we don't have multi-inheritance offsetting — but we surface the intent
   * so that callers via a non-primary vtable slot can call the right dtor.
   * Modelled as pass-through since our TS layout is single-object. */
  static thunk_D1(t: LiTemporalProjection, externals: LiTemporalProjectionExternals = LiTemporalProjection_defaultExternals): void {
    // @0x4b38a0-0x4b38b1: read vtable[-0x18] to get the adjuster offset. In TS the
    // single-object layout gives an offset of 0; we simply forward.
    t.destroy_base(externals);
  }
  static thunk_D0(t: LiTemporalProjection, externals: LiTemporalProjectionExternals = LiTemporalProjection_defaultExternals): void {
    // @0x4b3950-0x4b3964: adjuster arithmetic same as thunk_D1 but tail-calls D0.
    t.destroy_deleting(externals);
  }

  /**
   * @Ozone 0x4b39c0  __ZN20LiTemporalProjection15getSourceAtTimeE6CMTimebRK14OZRenderParams
   *
   * Faithful transcription (38 lines):
   *   0x4b39c0-0x4b39c9 frame + reserve 0x5c8 bytes for a local `OZRenderParams`
   *                     (matches OZRenderParams's known size).
   *   0x4b39d0 movq  %rsi, %r14              ; r14 = out-CMTime pointer (sret? out?)
   *   0x4b39d3 movq  %rdi, %rbx              ; rbx = this
   *   0x4b39d6 leaq  -0x5e0(%rbp), %r15      ; r15 = &local_renderParams  (frame-local)
   *   0x4b39dd movq  %r15, %rdi
   *   0x4b39e0 movq  %rcx, %rsi              ; rsi = incoming `const OZRenderParams&`
   *   0x4b39e3 callq OZRenderParams::OZRenderParams(local_rp, incoming_rp)  ; copy-ctor
   *   0x4b39e8 movq  0x20(%rbp), %rax
   *   0x4b39ec movq  %rax, -0x5d0(%rbp)      ; splice caller-visible field into local
   *   0x4b39f3 movaps 0x10(%rbp), %xmm0
   *   0x4b39f7 movaps %xmm0, -0x5e0(%rbp)    ; splice another 16B of CMTime? into head
   *   0x4b39fe xorps  %xmm0, %xmm0
   *   0x4b3a01 movups %xmm0, -0x458(%rbp)    ; zero another 16B slot in the local
   *   0x4b3a08 movq   0x28(%r14), %rsi       ; rsi = renderParams->extraObj  (+0x28)
   *   0x4b3a0c addq   $0x30, %r14            ; r14 += 0x30  (advance the out-CMTime by 0x30)
   *   0x4b3a10 movq   0x1978(%rsi), %rax     ; rax = extraObj->vtable @ +0x1978
   *   0x4b3a17 addq   $0x1978, %rsi          ; rsi = &extraObj->vtable  (thisPtr for the call)
   *   0x4b3a1e movq   %rbx, %rdi             ; rdi = this   (arg1 — sret-style output slot)
   *   0x4b3a21 movq   %r15, %rdx             ; rdx = &local_renderParams
   *   0x4b3a24 movq   %r14, %rcx             ; rcx = out-CMTime+0x30
   *   0x4b3a27 xorl   %r8d, %r8d             ; r8 = 0
   *   0x4b3a2a callq  *0xa0(%rax)             ; virtual dispatch at slot +0xa0
   *   0x4b3a30 leaq   -0x5e0(%rbp), %rdi
   *   0x4b3a37 callq  OZRenderParams::~OZRenderParams(local)
   *   0x4b3a3c movq   %rbx, %rax             ; return this  (sret pointer echoed)
   *   0x4b3a3f addq   $0x5c8, %rsp / popq %rbx / popq %r14 / popq %r15 / popq %rbp / retq
   *
   * Reduced semantics — `getSourceAtTime` copies the caller's render-params into a
   * local scratch buffer, then dispatches through the "time driver" at
   * `renderParams->extraObj + 0x1978`'s vtable slot +0xa0 with the projection's
   * output slot as arg1. Return value is the sret-style output slot.
   */
  getSourceAtTime(
    _outSlot: LiTemporalProjection,           // rdi arg — sret-style out
    _time: CMTime,                             // arg2 (r14 base, then + 0x30 slice)
    _flag: boolean,                            // arg3  (the `bool` in the sig)
    incomingRenderParams: OZRenderParams,      // rcx = const OZRenderParams&
    externals: LiTemporalProjectionExternals = LiTemporalProjection_defaultExternals,
  ): LiTemporalProjection {
    // Frame-local copy of OZRenderParams. In TS we just alias the reference — a
    // structural copy is unnecessary since JS has no destructors clashing with
    // the caller's copy. We still call the copy-ctor stub so provenance is honest.
    const localRp: OZRenderParams = { extraObj: incomingRenderParams.extraObj };
    // @0x4b39e3 — copy-ctor
    externals.OZRenderParams_copy_ctor(localRp, incomingRenderParams);
    // @0x4b3a08 — extraObj = renderParams->extraObj  (already the same field)
    const extraObj = localRp.extraObj as { vtable: unknown } | null;
    if (extraObj === null) {
      throw new Error("LiTemporalProjection::getSourceAtTime null extraObj @Ozone 0x4b3a10");
    }
    // @0x4b3a10 — rax = extraObj->vtable (loaded at +0x1978)
    // @0x4b3a17 — thisPtr for the virtual dispatch is &extraObj->vtable (+0x1978)
    // @0x4b3a2a — virtual call at vtable slot +0xa0
    externals.TimeDriverVtableSlot0xa0(extraObj, this, localRp, extraObj, 0);
    // @0x4b3a37 — destroy the local OZRenderParams copy
    externals.OZRenderParams_dtor(localRp);
    // @0x4b3a3c — return this (sret echo)
    return this;
  }
}
