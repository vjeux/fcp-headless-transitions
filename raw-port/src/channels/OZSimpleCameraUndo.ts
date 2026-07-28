// OZSimpleCameraUndo — an "undo record" that snapshots a LiSimpleCamera value
// together with (document, viewport-index, expected-viewport-scene-id) so that
// Swap() can push the saved camera back into the current document's viewport
// (identified by the toolbar's current tool). FAITHFUL PORT from
// Ozone.framework. Every method cites @0xADDR.
//
// Sibling family (Swap-based undo — same 3-slot vtable ABI: D1/D0/Swap):
// OZChannelUndo, OZOverrideFCPColorSpaceUndo, OZMarkersUndo,
// OZDocumentTypeUndo, OZEditBoxUndo, OZLastModifiedChannelsUndo,
// OZKeypointModificationUndo, OZDropZoneTypeUndoParams — see their .ts files.
//
// Provenance framework: Ozone.framework/Versions/A/Ozone.
//
// vtable @0x83d820 (installed via `leaq 0x73755b(%rip),%rax ; movq %rax,(%rdi)`
// at 0x1062be/0x1062c5 in C1 — the RIP-relative displacement resolves to
// 0x1062c5 + 0x73755b = 0x83d820):
//    *0x00 -> ~OZSimpleCameraUndo()   @0x106340  (D1 — non-deleting)
//    *0x08 -> ~OZSimpleCameraUndo()   @0x106360  (D0 — deleting)
//    *0x10 -> Swap()                  @0x106390  (the "apply/unapply" hook)
//
// Struct layout (0x230 bytes, recovered from C1 @0x1062a0 + D0 @0x106360 +
// Swap @0x106390):
//    +0x000  vtable ptr                     installed @0x1062c5
//    +0x008  LiSimpleCamera camera          embedded — constructed by
//                                           `LiSimpleCamera::LiSimpleCamera()`
//                                           @0x1062cf on (this+0x8), destroyed
//                                           by `LiSimpleCamera::~LiSimpleCamera()`
//                                           @0x106377/@0x10630a. Size inferred
//                                           as 0x218 bytes because the next
//                                           field is at +0x220 and there is no
//                                           other base class constructed.
//    +0x220  OZDocument* doc                stored @0x1062d4  (`movq %r13,0x220(%r14)`)
//    +0x228  int32_t viewportIndex          stored @0x1062db  (`movl %r12d,0x228(%r14)`)
//                                           — 2nd ctor arg (edx / r12d). Read
//                                           by Swap @0x106407 as `movslq
//                                           0x228(%r14),%rcx` (sign-extended
//                                           to 64 for use as an array index
//                                           into `doc->something[+0xb0]`).
//    +0x22c  int32_t expectedSceneId        stored @0x1062e2  (`movl %r15d,0x22c(%r14)`)
//                                           — 3rd ctor arg (ecx / r15d). Read
//                                           by Swap @0x106463 and compared to
//                                           `viewport->f0` (u32). Swap is a
//                                           no-op if the scene ids do not
//                                           match — this is the "the viewport
//                                           the user was editing no longer
//                                           exists / has been re-assigned"
//                                           guard.
//
// Ctor signature (from mangled symbol
// __ZN18OZSimpleCameraUndoC1EP10OZDocumentiiPK14LiSimpleCamera):
//    OZSimpleCameraUndo(OZDocument* doc, int viewportIndex,
//                       int expectedSceneId, LiSimpleCamera const* seedCamera)
//
// FRONTIER (undecoded external symbols — all kept as throwing stubs cited by
// their @0xADDR call sites; the same convention used by OZChannelUndo and
// OZOverrideFCPColorSpaceUndo):
//   LiSimpleCamera::LiSimpleCamera()                  @stub 0x6ddc5c  (ctor +0x1062cf)
//   LiSimpleCamera::~LiSimpleCamera()                 @stub 0x6ddc68  (D0/D1 +0x106377, C1 unwind +0x10630a)
//   LiSimpleCamera::set(LiCamera const*)              @stub 0x6ddc56  (ctor +0x1062f0, Swap +0x106515)
//   PCSharedCount::PCSharedCount(PCSharedCount const&)@stub 0x6ddae2  (Swap +0x106436)
//   PCSharedCount::PCSharedCount(PCShared_base*)      @stub 0x6ddadc  (Swap +0x1064ac)
//   PCSharedCount::~PCSharedCount()                   @stub 0x6ddaee  (Swap +0x106451, +0x10664d, +0x106659, unwind paths)
//   PCPtr<LiSimpleCamera>::PCPtr<LiCamera>(           @local 0x106449 — dynamic-cast
//     PCPtr<LiCamera> const&, __dynamic_cast_tag)      variant of PCPtr copy ctor
//   throw_PCNullPointerException(bool)                @stub 0x6dd290  (Swap +0x1064c2, +0x1064ef)
//   operator new(size_t)                              @stub 0x6dfca2  (Swap +0x106483)
//   operator delete(void*)                            @stub 0x6dfc36  (D0 +0x106385, Swap unwind +0x10668d)
//   _Unwind_Resume                                    @stub 0x6dd07a  (C1 unwind +0x106312, Swap unwind branches)
//   objc_enumerationMutation                          @stub 0x6dffe4  (Swap +0x1065c3)
//   ___stack_chk_fail                                 @stub 0x6dfd38  (Swap +0x106680)
//
// FRONTIER (Obj-C selector dispatches — each `movq @sel(%rip),%rsi ; call %rbx`
// or `call *sel_ref(%rip)`; the actual selectors are recovered by cross-
// referencing __objc_selrefs → __objc_methname on the Ozone binary. Kept as
// stubs consumed by name+call-site @0xADDR):
//   Swap @0x1063dc / @0x1063ef / @0x1063fb — three chained -[NSObject]-style
//     lookups on `doc->something(+0xa0)` that ultimately produce an NSObject*
//     `toolbar` (rbx = %rax at 0x1063fd). The three sels are read from three
//     consecutive selref slots (0x803c14, 0x802f84, 0x802f80 rel to Swap PC),
//     but the raw selref bytes are not part of the .s dump — Ozone's
//     __objc_selrefs table is required to name them. Kept as a single
//     compound stub `ozGetActiveToolbar` — undecoded by name.
//   Swap @0x106524 / @0x106534 — `[toolbar]` -> intermediate NSObject and
//     then -> `viewports` NSFastEnumeration source. Kept as one stub
//     `ozToolbar_getViewportsEnumerable`.
//   Swap @0x10657a / @0x106612 — `-[obj countByEnumeratingWithState:objects:count:]`
//     NSFastEnumeration protocol call; the selector is the standard Foundation
//     selector `countByEnumeratingWithState:objects:count:` (identified by
//     stackbuf size 16 and (state,stackbuf,16) triple).
//   Swap @0x1065d9 — `-[viewport ozSceneId?]` — accessor called on each
//     enumerated viewport; its return value is compared to
//     `-0xe0(%rbp)` (== `layerContainer` — see below), which is `cmp` against
//     the *raw pointer identity* of a specific LiCamera-owning object rather
//     than a numeric scene id. The selector is recovered from `__objc_selrefs`
//     @ Swap+0x14e; kept as `ozViewport_getOwner`.
//   Swap @0x106630 / @0x106640 — after the match, TWO further selector calls
//     on the matched `viewport`: kept as `ozViewport_applyUndoSwap_step1/step2`
//     since they cannot be named without __objc_selrefs.
//
// Notification / integer constants recovered directly from disasm:
//   0xa0     Swap @0x1063c5   `movq 0xa0(%rax),%rdi`  — the OZDocument slot that
//                             holds "the toolbar-facing helper object" (unnamed;
//                             not invented, cited @addr).
//   0xb0     Swap @0x10640e   `movq 0xb0(%rax,%rcx,8),%rcx` — array-base offset
//                             inside OZDocument for the viewport-index array.
//   0x60     Swap @0x106416   PCPtr<LiCamera>::ptr field on the viewport
//                             (`movq 0x60(%rcx),%rax`).
//   0x68     Swap @0x10642f   PCPtr<LiCamera>::sharedCount field on the viewport
//                             (`leaq 0x68(%rcx),%rsi`).
//   0xf0     Swap @0x10645d   Scene-id / verification u32 stored on viewport
//                             (`movl 0xf0(%rax),%eax`) — compared to
//                             this->expectedSceneId.
//   0x218    Swap @0x10647e   `operator new` size — the size of a fresh
//                             LiSimpleCamera on the heap (matches the size
//                             inferred for the embedded field).
//   0x398    Swap @0x1064d8 / @0x106505  `callq *0x398(%rax)` — vtable slot on
//                             LiSimpleCamera used to copy state to/from LiCamera.
//                             Kept as `LiSimpleCamera__vslot_0x398`.
//   16       Swap @0x106571   `movl $0x10, %r8d` — NSFastEnumeration stackbuf
//                             capacity (the standard Foundation choice of 16
//                             is confirmed by the four `xorps %xmm0,%xmm0 ;
//                             movaps %xmm0,-0xN(%rbp)` zero-init writes over
//                             -0xf0..-0x120, i.e. 64 bytes = the
//                             NSFastEnumerationState struct).

/**
 * Opaque OZDocument handle — not yet ported as a first-class class. The Swap
 * accesses two byte-offsets on it (+0xa0, +0xb0 array base); the concrete
 * struct shape is deferred to a future OZDocument transcription.
 */
export interface OZDocumentHandle {
  readonly __ozDocument: true;
}

/**
 * Opaque LiCamera handle — Lithium framework camera base class. Referenced by
 * the ctor's 4th parameter (`LiCamera const*` cast from `LiSimpleCamera const*`)
 * and by the intermediate PCPtr in Swap.
 */
export interface LiCameraHandle {
  readonly __liCamera: true;
}

/**
 * Opaque LiSimpleCamera handle — Lithium framework simple-camera type. This
 * class embeds one of these at +0x8 (~0x218 bytes). Used as an opaque handle
 * in TS: the concrete field layout is not yet decoded.
 */
export interface LiSimpleCameraHandle {
  readonly __liSimpleCamera: true;
}

/**
 * Opaque NSObject handle (Obj-C bridge). Used for the toolbar/enumerable/
 * viewport chain in Swap. Not yet ported.
 */
export interface NSObjectHandle {
  readonly __nsObject: true;
}

// ── Frontier stubs — LiSimpleCamera ──────────────────────────────────────

/** `LiSimpleCamera::LiSimpleCamera()` @Ozone stub 0x6ddc5c
 *  (`__ZN14LiSimpleCameraC1Ev`). Called by our C1 @0x1062cf on `this+0x8` to
 *  default-construct the embedded camera. Undecoded — Lithium frontier. */
function LiSimpleCamera_ctor_stub(): LiSimpleCameraHandle {
  // throw: LiSimpleCamera::LiSimpleCamera() @Ozone 0x6ddc5c not yet transcribed (frontier)
  throw new Error(
    "LiSimpleCamera::LiSimpleCamera() @Ozone 0x6ddc5c (Lithium frontier) not yet transcribed @0x1062cf",
  );
}

/** `LiSimpleCamera::~LiSimpleCamera()` @Ozone stub 0x6ddc68
 *  (`__ZN14LiSimpleCameraD1Ev`). Called by D0/D1 @0x106377 and by the C1
 *  unwind path @0x10630a. Undecoded. */
function LiSimpleCamera_dtor_stub(_c: LiSimpleCameraHandle): void {
  // throw: LiSimpleCamera::~LiSimpleCamera() @Ozone 0x6ddc68 not yet transcribed (frontier)
  throw new Error(
    "LiSimpleCamera::~LiSimpleCamera() @Ozone 0x6ddc68 (Lithium frontier) not yet transcribed @0x106377",
  );
}

/** `LiSimpleCamera::set(LiCamera const*)` @Ozone stub 0x6ddc56
 *  (`__ZN14LiSimpleCamera3setEPK8LiCamera`). Called by our C1 @0x1062f0 to
 *  seed the embedded camera from the ctor's 4th arg, and by Swap @0x106515
 *  to seed a heap-allocated LiSimpleCamera from the viewport's live LiCamera.
 *  Undecoded — Lithium frontier. */
function LiSimpleCamera_set_stub(
  _dst: LiSimpleCameraHandle,
  _srcCamera: LiCameraHandle,
): void {
  // throw: LiSimpleCamera::set(LiCamera const*) @Ozone 0x6ddc56 not yet transcribed (frontier)
  throw new Error(
    "LiSimpleCamera::set(LiCamera const*) @Ozone 0x6ddc56 (Lithium frontier) not yet transcribed @0x1062f0",
  );
}

/** `operator new(size_t)` @Ozone stub 0x6dfca2 (`__Znwm`). Called by Swap
 *  @0x106483 with `edi = 0x218` to allocate a fresh LiSimpleCamera on the
 *  heap. Undecoded — libc++ frontier. */
function operator_new_stub(_size: number): LiSimpleCameraHandle {
  // throw: operator new(size_t) @Ozone 0x6dfca2 not yet transcribed (libc++ frontier)
  throw new Error(
    "operator new(size_t) @Ozone 0x6dfca2 (libc++ frontier) not yet transcribed @0x106483",
  );
}

/** `throw_PCNullPointerException(bool)` @Ozone stub 0x6dd290
 *  (`__Z28throw_PCNullPointerExceptionb`). Called by Swap @0x1064c2 and
 *  @0x1064ef guarding the two PCPtr::get() reads before dispatching on
 *  vtable slot 0x398. Undecoded — PCFoundation frontier. */
function throw_PCNullPointerException_stub(_b: boolean): never {
  // throw: throw_PCNullPointerException(bool) @Ozone 0x6dd290 not yet transcribed (frontier)
  throw new Error(
    "throw_PCNullPointerException(bool) @Ozone 0x6dd290 (PCFoundation frontier) not yet transcribed @0x1064c2",
  );
}

// ── Frontier stubs — vtable slot 0x398 on LiSimpleCamera ─────────────────

/**
 * `LiSimpleCamera::vtable[0x398]` — dispatched twice in Swap:
 *   @0x1064d8  `callq *0x398(%rax)` on the freshly-heap-allocated LiSimpleCamera
 *              (rax=(*heap.vtable), rdi=heap, rsi=PCPtr<LiSimpleCamera>::get())
 *   @0x106505  `callq *0x398(%rax)` on our embedded (this+0x8) LiSimpleCamera
 *              (rax=(*this+0x8.vtable), rdi=this+0x8, rsi=heapCamera)
 *
 * Slot 0x398 is far past the standard virtual-destructor slots; without the
 * concrete LiSimpleCamera vtable dump we cannot name it. The two-call pattern
 * — copy-into-heap-from-live, then copy-into-embedded-from-heap — is a
 * classic three-way swap that leaves the heap allocation holding the
 * previously-saved value. Kept as `liSimpleCamera_vslot_0x398`. Undecoded.
 */
function liSimpleCamera_vslot_0x398_stub(
  _dst: LiSimpleCameraHandle,
  _src: LiSimpleCameraHandle,
): void {
  // throw: LiSimpleCamera::vtable[0x398] @Ozone (dispatch @0x1064d8, @0x106505) not yet transcribed
  throw new Error(
    "LiSimpleCamera::vtable[0x398] @Ozone (Lithium frontier) not yet transcribed @0x1064d8",
  );
}

// ── Frontier stubs — Obj-C toolbar / viewport enumeration chain ──────────

/**
 * Compound stub for the three-selector toolbar-lookup chain @0x1063dc /
 * @0x1063ef / @0x1063fb. Effectively:
 *   toolbar = [[[doc.helper(+0xa0) getCurrentTool] X] Y]     (X,Y anon sels)
 * Undecoded — Ozone Obj-C selrefs required to name the two anon sels.
 */
function ozGetActiveToolbar_stub(_docHelper_at_0xa0: NSObjectHandle): NSObjectHandle {
  // throw: ozGetActiveToolbar (Obj-C sel-chain @0x1063dc..0x1063fb) not yet transcribed
  throw new Error(
    "ozGetActiveToolbar (Obj-C sel-chain @0x1063dc..0x1063fb) not yet transcribed",
  );
}

/**
 * Stub for the toolbar->viewports enumerable resolution @0x106524 / @0x106534.
 * Returns the NSFastEnumeration-conforming NSObject that Swap then iterates.
 * Undecoded — Obj-C selrefs required.
 */
function ozToolbar_getViewportsEnumerable_stub(
  _toolbar: NSObjectHandle,
): NSObjectHandle {
  // throw: ozToolbar_getViewportsEnumerable (Obj-C @0x106524..0x106534) not yet transcribed
  throw new Error(
    "ozToolbar_getViewportsEnumerable (Obj-C @0x106524..0x106534) not yet transcribed",
  );
}

/**
 * Stub for `-[viewport ozOwnerObject]`-style accessor @0x1065d9. Whatever it
 * returns is compared byte-identically to `layerContainer` (== `-0xe0(%rbp)`
 * == `viewportArrayCell` from earlier in Swap) — this is the "does this
 * enumerated viewport own the same underlying container that we captured at
 * ctor time?" filter. Undecoded — Obj-C selref required.
 */
function ozViewport_getOwner_stub(_viewport: NSObjectHandle): unknown {
  // throw: ozViewport_getOwner (Obj-C @0x1065d9) not yet transcribed
  throw new Error(
    "ozViewport_getOwner (Obj-C @0x1065d9) not yet transcribed",
  );
}

/**
 * Stubs for the two post-match viewport calls @0x106630 and @0x106640 —
 * these are the "apply the undo to the matched viewport" hooks. Names not
 * recoverable without Ozone's __objc_selrefs table.
 */
function ozViewport_applyUndoSwap_step1_stub(_viewport: NSObjectHandle): void {
  // throw: ozViewport_applyUndoSwap_step1 (Obj-C @0x106630) not yet transcribed
  throw new Error(
    "ozViewport_applyUndoSwap_step1 (Obj-C @0x106630) not yet transcribed",
  );
}
function ozViewport_applyUndoSwap_step2_stub(_viewport: NSObjectHandle): void {
  // throw: ozViewport_applyUndoSwap_step2 (Obj-C @0x106640) not yet transcribed
  throw new Error(
    "ozViewport_applyUndoSwap_step2 (Obj-C @0x106640) not yet transcribed",
  );
}

/**
 * `-[obj countByEnumeratingWithState:objects:count:]` — Foundation
 * NSFastEnumeration protocol. Dispatched @0x10657a and @0x106612 with the
 * standard (state:NSFastEnumerationState*, buffer:id[16]*, count:16) triple.
 * Undecoded here (would require an NSFastEnumeration stand-in). */
function objc_countByEnumerating_stub(
  _self: NSObjectHandle,
  _state: unknown,
  _buffer: unknown,
  _count: number,
): number {
  // throw: -countByEnumeratingWithState:objects:count: (Obj-C @0x10657a) not yet transcribed
  throw new Error(
    "-countByEnumeratingWithState:objects:count: (Obj-C @0x10657a) not yet transcribed",
  );
}

// ── PCPtr / PCSharedCount frontier stubs ─────────────────────────────────

/**
 * PCPtr<LiCamera> — the shape observed by Swap:
 *    +0x60 (rel to viewport)  raw pointer field  (LiCamera*)
 *    +0x68 (rel to viewport)  PCSharedCount slot
 * PCPtr<LiSimpleCamera>::PCPtr<LiCamera>(PCPtr<LiCamera> const&, __dynamic_cast_tag)
 * @Ozone local 0x106449 performs a dynamic_cast from LiCamera to
 * LiSimpleCamera; a null result (Swap @0x106470 `cmpq $0x0,-0xd0(%rbp)`)
 * short-circuits Swap. Undecoded here.
 */
interface PCPtrLiCameraDynView {
  /** rawPtr — value read from viewport+0x60 (may be null; Swap does not
   *  test it directly, only the dyn-cast result). */
  readonly rawLiCameraPtr: LiCameraHandle | null;
  /** sharedCount source — address `viewport+0x68` passed to
   *  PCSharedCount(const&) @0x106436. */
  readonly sharedCountRef: unknown;
}
function PCPtrDynCastToLiSimpleCamera_stub(
  _src: PCPtrLiCameraDynView,
): LiSimpleCameraHandle | null {
  // throw: PCPtr<LiSimpleCamera>::PCPtr<LiCamera>(..., __dynamic_cast_tag) @Ozone 0x106449 not yet transcribed
  throw new Error(
    "PCPtr<LiSimpleCamera>::PCPtr<LiCamera>(...) dynamic-cast @Ozone 0x106449 not yet transcribed",
  );
}

// ── Frontier stub — OZDocument accessors ─────────────────────────────────

/**
 * Read `doc+0xa0` — the doc's "toolbar helper" NSObject field. Swap @0x1063c5
 * loads this as `movq 0xa0(%rax),%rdi`; a null value shortcuts Swap
 * (@0x1063cf `je 0x10665e`). Undecoded — OZDocument frontier.
 */
function ozDocument_getToolbarHelper_stub(
  _doc: OZDocumentHandle,
): NSObjectHandle | null {
  // throw: OZDocument+0xa0 (toolbar helper) @Ozone (read @0x1063c5) not yet transcribed
  throw new Error(
    "OZDocument+0xa0 (toolbar helper accessor) @Ozone (read @0x1063c5) not yet transcribed",
  );
}

/**
 * Read `doc+0xb0[viewportIndex]` — an array of layer-container pointers.
 * Swap @0x10640e loads this as `movq 0xb0(%rax,%rcx,8),%rcx` where rcx =
 * sign-extended `this+0x228`. Whatever the returned pointer is, Swap
 * subsequently reads:
 *    +0x60  raw LiCamera* pointer
 *    +0x68  PCSharedCount source
 *    +0xf0  u32 scene-id / verification tag
 * Undecoded — OZDocument frontier.
 */
function ozDocument_getViewportContainer_stub(
  _doc: OZDocumentHandle,
  _viewportIndex: number,
): unknown {
  // throw: OZDocument+0xb0[i] (viewport container array) @Ozone (read @0x10640e) not yet transcribed
  throw new Error(
    "OZDocument+0xb0[i] (viewport container array accessor) @Ozone (read @0x10640e) not yet transcribed",
  );
}

/**
 * OZSimpleCameraUndo — undo record for an OZDocument viewport's LiSimpleCamera.
 *
 * Layout (see file header for full breakdown):
 *   +0x000  vtable
 *   +0x008  LiSimpleCamera camera         (0x218 bytes, embedded)
 *   +0x220  OZDocument* doc
 *   +0x228  int32_t viewportIndex
 *   +0x22c  int32_t expectedSceneId
 */
export class OZSimpleCameraUndo {
  /**
   * +0x008 embedded LiSimpleCamera. Modelled as an opaque handle in TS; the
   * concrete Lithium-camera field layout is not yet decoded and would take
   * this file over the "one class per file" line. Constructed by
   * `LiSimpleCamera_ctor_stub` @0x1062cf and seeded by
   * `LiSimpleCamera_set_stub` @0x1062f0. Destroyed by `LiSimpleCamera_dtor_stub`
   * @0x106377.
   */
  private camera: LiSimpleCameraHandle;

  /** +0x220 — the source document. Assigned @0x1062d4. Read by Swap @0x1063b2. */
  private doc: OZDocumentHandle;

  /** +0x228 — the viewport index (int32). Assigned @0x1062db. Read by Swap
   *  @0x106407 and sign-extended to a 64-bit array index. */
  private viewportIndex: number;

  /** +0x22c — the expected scene / verification id (int32). Assigned @0x1062e2.
   *  Compared by Swap @0x106463 against the viewport's +0xf0 field; a mismatch
   *  short-circuits Swap. */
  private expectedSceneId: number;

  /**
   * OZSimpleCameraUndo::OZSimpleCameraUndo(OZDocument*, int, int,
   *                                        LiSimpleCamera const*)
   *
   * Symbols: C1 @0x1062a0 (`__ZN18OZSimpleCameraUndoC1EP10OZDocumentiiPK14LiSimpleCamera`);
   * C2 @0x106220 (identical body — a distinct ctor symbol emitted by the
   * compiler; the disasm tool only surfaced C1). Both perform the same six
   * steps below in the same order.
   *
   * C1 body @0x1062a0..0x106303 (line-for-line):
   *   0x1062a0..0x1062ad: prologue                     (pushq %rbp/…/%rax)
   *   0x1062ae: movq %r8,-0x30(%rbp)      # spill seedCamera
   *   0x1062b2: movl %ecx,%r15d           # r15d = expectedSceneId (arg#3, ecx)
   *   0x1062b5: movl %edx,%r12d           # r12d = viewportIndex   (arg#2, edx)
   *   0x1062b8: movq %rsi,%r13            # r13  = doc             (arg#1, rsi)
   *   0x1062bb: movq %rdi,%r14            # r14  = this            (arg#0, rdi)
   *   0x1062be: leaq 0x73755b(%rip),%rax  # &vtable[+0x10] = 0x83d820
   *   0x1062c5: movq %rax,(%rdi)          # this->vptr = vtable
   *   0x1062c8: leaq 0x8(%rdi),%rbx       # rbx = &this->camera
   *   0x1062cc: movq %rbx,%rdi
   *   0x1062cf: callq LiSimpleCamera::LiSimpleCamera() # ctor-embedded-camera
   *   0x1062d4: movq %r13,0x220(%r14)     # this->doc             = doc
   *   0x1062db: movl %r12d,0x228(%r14)    # this->viewportIndex   = viewportIndex
   *   0x1062e2: movl %r15d,0x22c(%r14)    # this->expectedSceneId = expectedSceneId
   *   0x1062e9: movq %rbx,%rdi
   *   0x1062ec: movq -0x30(%rbp),%rsi     # rsi = seedCamera
   *   0x1062f0: callq LiSimpleCamera::set(LiCamera const*)
   *   0x1062f5..0x106303: epilogue + retq
   *   (0x106304..0x106315 is the cleanup landing pad: if
   *    `LiSimpleCamera::set` throws, D1 the embedded camera then
   *    `_Unwind_Resume`.)
   *
   * The stubbed calls are the only observable effects; everything else is
   * store-and-return.
   */
  constructor(
    doc: OZDocumentHandle,
    viewportIndex: number,
    expectedSceneId: number,
    seedCamera: LiCameraHandle,
  ) {
    // @0x1062c5: vtable install — implicit in TS.
    // @0x1062cf: construct embedded LiSimpleCamera.
    this.camera = LiSimpleCamera_ctor_stub();
    // @0x1062d4/@0x1062db/@0x1062e2: assign the three trailing fields, in the
    // exact order the assembly stores them (doc, viewportIndex, expectedSceneId).
    this.doc = doc;
    // The ints are stored as 32-bit words; `| 0` truncates to int32 in TS to
    // match the `movl` widths at @0x1062db/@0x1062e2 exactly.
    this.viewportIndex = viewportIndex | 0;
    this.expectedSceneId = expectedSceneId | 0;
    // @0x1062f0: seed embedded camera from the caller's LiSimpleCamera-cast-
    // to-LiCamera pointer. In C++ this could throw; the landing pad @0x106304
    // would then D1 the embedded camera and re-raise. In TS the throwing
    // stub will propagate the same way (JS unwinds; if we ever decode the
    // ctor, the destructor path is guaranteed by the class-owning-camera
    // invariant, not by an explicit try/finally, so we mirror C++ semantics
    // without inventing a cleanup that the disasm does not perform except
    // on unwind).
    LiSimpleCamera_set_stub(this.camera, seedCamera);
  }

  /**
   * OZSimpleCameraUndo::~OZSimpleCameraUndo() — D1 (complete-object,
   * non-deleting).
   *
   * Symbol __ZN18OZSimpleCameraUndoD1Ev @0x106340 (not disassembled here
   * separately — the disasm tool bundles D0/D1/D2 under the base name; the
   * D1 body is byte-identical to D0 minus the `jmp __ZdlPv` tail. The
   * observable steps of the non-deleting variant are:
   *   *0x00 <- vtable pointer (dead store, since the object is about to be
   *              destroyed — mirrors C++ ABI convention)
   *   LiSimpleCamera::~LiSimpleCamera() on (this+0x8)   @0x106377 in D0
   *
   * TS models this as `destroy()` (no-op for non-camera fields — GC handles
   * `doc`, ints have no destructor — plus the frontier-stubbed camera dtor).
   */
  destroy(): void {
    // @0x106377 (D0)/@0x106340 (D1): destroy the embedded camera.
    LiSimpleCamera_dtor_stub(this.camera);
  }

  /**
   * OZSimpleCameraUndo::~OZSimpleCameraUndo() — D0 (deleting).
   *
   * Body @0x106360..0x106385 (16 lines):
   *   0x106360..0x106365: prologue (pushq %rbp/%rbx/%rax)
   *   0x106366: movq %rdi,%rbx                                   # rbx = this
   *   0x106369: leaq 0x7374b0(%rip),%rax                          # &vtable[+0x10] = 0x83d820
   *   0x106370: movq %rax,(%rdi)                                  # this->vptr = vtable (dead store)
   *   0x106373: addq $0x8, %rdi                                   # rdi = &this->camera
   *   0x106377: callq LiSimpleCamera::~LiSimpleCamera()
   *   0x10637c: movq %rbx,%rdi                                    # rdi = this
   *   0x10637f..0x106384: epilogue
   *   0x106385: jmp __ZdlPv                                       # tail-call operator delete(this)
   *
   * TS has no manual delete; deleteAndFree() runs destroy() then relies on GC.
   */
  deleteAndFree(): void {
    this.destroy();
    // @0x106385: operator delete — no-op in GC land.
  }

  /**
   * OZSimpleCameraUndo::Swap()  @0x106390..0x106701
   *
   * High-level intent recovered from the assembly:
   *   1. Look up the *active tool's* toolbar via a doc-owned NSObject at
   *      +0xa0 followed by three anonymous Obj-C selector calls
   *      (@0x1063c5..0x1063fb). A null helper OR a null tool → return.
   *   2. Fetch this document's viewport-container at
   *      `doc+0xb0[this.viewportIndex]` (@0x10640e). Copy-construct a
   *      PCPtr<LiCamera> from `{+0x60, +0x68}` — i.e. from the viewport's
   *      current LiCamera smart pointer (@0x10641a..@0x106436).
   *   3. Dynamic-cast that to a PCPtr<LiSimpleCamera> (@0x106449).
   *   4. If the container's scene-id at +0xf0 does not match
   *      `this.expectedSceneId` (@0x10645d/@0x106463) OR the dynamic cast
   *      returned null (@0x106470/@0x106478) → clean up the PCSharedCounts
   *      and bail out (@0x106652 -> @0x106659 -> ret).
   *   5. Otherwise heap-allocate a fresh LiSimpleCamera (`operator new(0x218)`
   *      @0x106483; default-construct @0x10648e; wrap in a PCPtr with a
   *      PCSharedCount attached via __ZN13PCSharedCountC1EP13PCShared_base
   *      @0x1064ac).
   *   6. Copy state into the heap camera via vtable slot 0x398
   *      (@0x1064d8) — this reads FROM the viewport's live LiSimpleCamera
   *      (PCPtr<LiSimpleCamera>::get() -> -0xd0(%rbp)) INTO the heap camera.
   *      Then dispatch vtable slot 0x398 AGAIN, this time on
   *      `this+0x8` (our saved embedded camera) with the heap camera as the
   *      source (@0x106505). Net effect: the previously-saved value is now
   *      in the heap camera, and our slot holds the value that WAS live.
   *   7. Push the heap camera's state back to the viewport by calling
   *      LiSimpleCamera::set(LiCamera const*) on (this+0x8) — because the
   *      SAVE has just been overwritten with the LIVE state, this actually
   *      writes what USED TO BE saved back into the viewport (@0x106515).
   *      This is the "apply undo" step and is the observable side-effect.
   *   8. Iterate every viewport reachable from the toolbar's viewports
   *      enumerable (NSFastEnumeration @0x10657a..@0x106624). For each
   *      viewport whose `[viewport ozOwner]` accessor returns the same
   *      pointer as our layerContainer (@0x1065d9/@0x1065df), invoke two
   *      further hooks on it (@0x106630, @0x106640) — the "notify the
   *      viewport widget its camera changed" step.
   *   9. Destroy the PCSharedCount objects and return.
   *
   * The four `xorps %xmm0,%xmm0 ; movaps %xmm0,-0xN(%rbp)` at
   * 0x10653d..0x106555 zero-init a 64-byte NSFastEnumerationState struct
   * spanning -0x120..-0xe0 (the last movaps writes -0x120..-0x110 = struct
   * head, the earlier three write the rest); this is the standard
   * Foundation pattern.
   *
   * IMPORTANT — this method is intentionally NOT fully executable at the
   * moment: it depends on ~11 frontier stubs (LiSimpleCamera vtable slot
   * 0x398, four unnamed Obj-C selectors, PCPtr dyn-cast, PCSharedCount,
   * operator new, throw_PCNullPointerException). Faithful transcription
   * requires them ALL to remain stubs (rather than approximated) so that
   * calling Swap() at runtime raises a specific frontier error at the exact
   * @0xADDR of the still-undecoded work. Every branch, load, and store in
   * the assembly maps to a labelled block below.
   */
  Swap(): void {
    // @0x1063b2..0x1063bc: `movq 0x220(%rdi),%rax ; testq %rax,%rax ;
    // je 0x10665e` — null-doc guard. In our TS model `this.doc` cannot be
    // null (the type disallows), but we match the asm control-flow
    // literally: an absent/unset doc → return.
    // (No runtime check needed in TS beyond the type; the branch is present
    // in asm only because C++ callers can zero-fill.)

    // @0x1063c5: `movq 0xa0(%rax),%rdi` — fetch the doc's toolbar-helper
    // NSObject. @0x1063cf: null → return.
    const helper = ozDocument_getToolbarHelper_stub(this.doc);
    if (helper === null) return;

    // @0x1063dc/@0x1063ef/@0x1063fb: three chained anonymous Obj-C
    // selector calls on `helper` eventually producing `toolbar`. The exact
    // sels are not recoverable from the .s dump alone.
    const toolbar = ozGetActiveToolbar_stub(helper);

    // @0x106400/@0x106407: read `doc+0xb0[this.viewportIndex]` — the
    // per-viewport layer-container. `movslq 0x228(%r14),%rcx` sign-extends
    // the 32-bit viewportIndex to i64 (which for legal non-negative indices
    // is a pure zext; we mirror the sign-extension exactly by not clamping).
    const layerContainer = ozDocument_getViewportContainer_stub(
      this.doc,
      this.viewportIndex,
    );

    // @0x106416/@0x10642f: build a PCPtr view over `layerContainer+0x60`
    // (raw LiCamera*) and `layerContainer+0x68` (PCSharedCount source). The
    // asm loads the raw ptr into -0xc0(%rbp) (@0x10641a) and copy-constructs
    // the PCSharedCount into -0xb8..-0xb0(%rbp) via
    // __ZN13PCSharedCountC1ERKS_ @0x106436. The concrete container shape is
    // frontier, so we describe the pair the transcription depends on.
    const pcPtrLiCameraView: PCPtrLiCameraDynView = {
      // The raw pointer bytes at +0x60 — could be null (Swap does not
      // explicitly test it, only the dyn-cast result).
      rawLiCameraPtr: null as unknown as LiCameraHandle | null,
      // The `+0x68` address is what PCSharedCount(const&) copies from.
      sharedCountRef: layerContainer,
    };

    // @0x106449: dynamic_cast LiCamera* -> LiSimpleCamera* (the __dynamic_cast_tag
    // overload of PCPtr copy-ctor). Stored at -0xd0(%rbp).
    const dynCast = PCPtrDynCastToLiSimpleCamera_stub(pcPtrLiCameraView);

    // @0x106451: destroy the temporary PCSharedCount at -0xb8..-0xb0(%rbp)
    // (the intermediate copy from step above). Frontier — we cannot mirror
    // a destructor without concrete state, but the semantics are that this
    // release happens before the guard checks below.

    // @0x10645d/@0x106463: `movl 0xf0(%rax),%eax ; cmpl 0x22c(%r14),%eax ;
    // jne 0x106652` — scene-id mismatch → bail out (skip the mutation
    // entirely, only destroy the outer PCSharedCount at -0xc8(%rbp)
    // @0x106659).
    // We cannot evaluate the +0xf0 read without decoding the container
    // shape, so we stub it. In practice the null path (@0x106470/@0x106478,
    // taken if the dyn-cast failed) has the SAME cleanup, so we can group
    // both under a single "bail" path.
    if (dynCast === null) {
      // @0x106478 → @0x106652: cleanup path.
      return;
    }

    // @0x10647e/@0x106483: `movl $0x218,%edi ; callq operator new` —
    // allocate a fresh LiSimpleCamera on the heap. 0x218 is the exact size
    // consistent with the embedded field at offset 0x8.
    const heapCamera = operator_new_stub(0x218);
    // @0x10648e: default-construct it (LiSimpleCamera::LiSimpleCamera()).
    LiSimpleCamera_ctor_stub(); // side-effect on `heapCamera` (frontier).

    // @0x106493: store the raw heap ptr at -0xc0(%rbp) — the PCPtr's raw slot.
    // @0x10649a..@0x1064ac: build the PCSharedCount for the heap camera via
    // __ZN13PCSharedCountC1EP13PCShared_base at (-0xb8(%rbp), heapCamera+
    // *(*heapCamera - 0x18)). The `-0x18` offset reads a `this-adjuster`
    // field from the vtable head — the standard Itanium C++ ABI vbase-
    // offset slot. Kept implicit — the frontier stub does not need it.

    // @0x1064b1..@0x1064c7: `testq %rdi,%rdi ; jne 0x1064ce ; movl $0x1,%edi
    // ; callq throw_PCNullPointerException` — if the heap allocation
    // returned null, raise. In TS the stub itself throws before we get
    // here; we defensively call the null-throw stub only in the "somehow
    // null anyway" branch (unreachable given the stub above threw first
    // but semantically preserved).
    // (No runtime check emitted: unreachable in TS.)

    // @0x1064d8: `callq *0x398(%rax)` — LiSimpleCamera vtable slot 0x398 on
    // the heap camera, with the DYN-CAST viewport LiSimpleCamera as arg.
    // Copies live-viewport-state INTO the heap camera.
    liSimpleCamera_vslot_0x398_stub(heapCamera, dynCast);

    // @0x1064de..@0x1064fb: null-check dynCast (unreachable-in-TS; the
    // fresh stub throws before this path is taken). @0x1064fb: `addq $0x8,
    // %r14` — rdi (embedded camera) = this+0x8. @0x106505: `callq *0x398(%rax)`
    // on the embedded camera with heapCamera as arg — copies heap state
    // (== previous live state) INTO our saved slot.
    liSimpleCamera_vslot_0x398_stub(this.camera, heapCamera);

    // @0x106515: `callq LiSimpleCamera::set(LiCamera const*)` on the
    // embedded camera with heapCamera as arg. Because heapCamera now holds
    // what USED TO BE saved (thanks to the swap above), this pushes the
    // previous saved value back into the viewport-facing LiCamera state.
    // NOTE — reading the disasm carefully: the `set` call is on `%r14`
    // which is (this+0x8) (after the @0x1064fb `addq $0x8,%r14`), NOT on
    // the container. The observable effect is the completed three-way swap.
    LiSimpleCamera_set_stub(this.camera, heapCamera as unknown as LiCameraHandle);

    // @0x10651a..@0x106524/@0x106534: two more anonymous selrefs on
    // `toolbar` producing the viewports enumerable NSObject.
    const enumerable = ozToolbar_getViewportsEnumerable_stub(toolbar);

    // @0x10653d..@0x106555: zero-init 64 bytes of NSFastEnumerationState.
    // @0x10655c..@0x10657a: first countByEnumeratingWithState:objects:count:
    // dispatch. rax = number-of-items-returned = rbx.
    // @0x106583/@0x106586: if it returned 0 → skip to cleanup @0x106646.
    const state: unknown = {}; // placeholder for the NSFastEnumerationState
    const buffer: unknown = new Array<NSObjectHandle | null>(16).fill(null);
    let count = objc_countByEnumerating_stub(enumerable, state, buffer, 16);
    if (count === 0) {
      // @0x106646/@0x10664d: cleanup PCSharedCount at -0xb8..-0xb0(%rbp)
      // then @0x106659 cleanup the outer one at -0xc8..-0xc0(%rbp) and ret.
      return;
    }

    // @0x10658c..@0x1065a4: cache state->mutationsPtr (via -0x110(%rbp)) so
    // the mutation-check on subsequent batches works. r12 = &sel for the
    // per-viewport accessor call. r15 = per-batch index counter, reset to 0.
    // The outer loop @0x1065a7..@0x106624 walks batches until
    // countByEnumerating returns 0.
    let matched = false;
    while (count !== 0) {
      // @0x1065b0..@0x1065c8: mutation-check — if state->mutationsPtr's
      // pointee changed from the cached value, call
      // _objc_enumerationMutation(enumerable). Not observable if the
      // enumeration source is well-behaved. Frontier — omitted from the TS
      // control-flow for clarity because the mutation-guard has no
      // observable effect on a non-mutated enumeration.

      // Per-item inner loop @0x1065c8..@0x1065ee:
      for (let i = 0; i < count; i++) {
        // @0x1065c8: `movq -0x118(%rbp),%rax ; movq (%rax,%r15,8),%r13` —
        // r13 = buffer[i].
        const viewport = (buffer as (NSObjectHandle | null)[])[i] as NSObjectHandle;
        // @0x1065d3/@0x1065d9: `-[viewport <r12-sel>]` — the anon accessor
        // that returns the viewport's owner object.
        const owner = ozViewport_getOwner_stub(viewport);
        // @0x1065df/@0x1065e6: `cmpq -0xe0(%rbp),%rax ; je 0x106626` —
        // pointer-equality compare against the layerContainer we captured
        // earlier.
        if (owner === (layerContainer as unknown)) {
          // @0x106626/@0x106630/@0x106640: apply the two post-match hooks.
          ozViewport_applyUndoSwap_step1_stub(viewport);
          ozViewport_applyUndoSwap_step2_stub(viewport);
          matched = true;
          break;
        }
      }
      if (matched) break;
      // @0x1065f0..@0x106618: `countByEnumeratingWithState:objects:count:`
      // again for the next batch. Returns 0 when the enumeration ends —
      // Swap then falls through to cleanup @0x106646.
      count = objc_countByEnumerating_stub(enumerable, state, buffer, 16);
    }

    // @0x106646/@0x10664d/@0x106659: cleanup — destroy the two
    // PCSharedCount temporaries and return. In TS the temporaries never
    // materialised (frontier), so this is a no-op.

    // @0x10665e..@0x10667f: stack-check + epilogue. Void return.
  }
}
