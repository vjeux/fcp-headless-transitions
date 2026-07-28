// OZKeypointModificationUndo — Ozone.framework undo record for a "keypoint modification"
// operation (edit to one or more animation curves' keypoints). FAITHFUL PORT — every method
// cites @0xADDR (Ozone x86_64 slice). Do NOT approximate.
//
// STRUCT LAYOUT (0x30 = 48 bytes total; recovered from ctor @0x101f80, D2 @0x102180,
// D0 @0x1022a0, Swap @0x102340):
//
//   offset  size  field
//   ------  ----  ---------------------------------------------------------------------
//   +0x00   0x08  __vptr           (leaq 0x73b72a(%rip),%rax; %rax,(%rdi) @0x101f97/@0x101f9e)
//   +0x08   0x08  view    : id     (NSView*; the `%rsi` ctor arg, `movq %rsi,0x8(%rdi)` @0x101fa1)
//   +0x10   0x08  toolState : id   (retained id; ctor stores [selectionList endLightAccess]
//                                   at 0x101fcc, Swap replaces via objc_release; a plain
//                                   `movq %rax,0x10(%r13)` — no explicit objc_retain because
//                                   the msgSend call returns a +1 retained value under ARC.)
//   +0x18   0x08  vec_begin        (std::vector<OZChannelUndo*>::__begin_)
//   +0x20   0x08  vec_end          (std::vector<OZChannelUndo*>::__end_)
//   +0x28   0x08  vec_cap_end      (std::vector<OZChannelUndo*>::__end_cap_.first)
//
// The vector element type is confirmed by
//   __ZNSt3__16vectorIP13OZChannelUndoNS_9allocatorIS2_EEE20__throw_length_error...  @0x102131
// (throwing helper for `vector<OZChannelUndo*>` — mangled type name is authoritative).
//
// OZChannelUndo (inner element) — 3 slots (24 bytes), constructed inline by this ctor:
//   +0x00  __vptr    (leaq 0x73b50d(%rip),%rax; @0x102024)
//   +0x08  channelRef  = OZChannelBase::getRef(false)    (@0x102033, __ZNK13OZChannelBase6getRefEb)
//   +0x10  clone       = ((*chBase->vtable)[0xF8/8])(chBase)   (@0x102042: `callq *0xf8(%rax)`
//                        — virtual slot @+0xF8, i.e. index 31 in OZChannelBase's vtable; the same
//                        slot is used by __ZN13OZChannelUndoC2ERK13OZChannelBase @0xFFE30
//                        immediately after `getRef` — this class inlines the C2 body.)
//
// DECODE references:
//   Ozone.OZKeypointModificationUndo.OZKeypointModificationUndo.s (C1 thunk -> C2)   @0x102170
//   Ozone.OZKeypointModificationUndo.OZKeypointModificationUndo.s (C2 real ctor)     @0x101f80
//   Ozone.OZKeypointModificationUndo.~OZKeypointModificationUndo.s (D2)              @0x102180
//   Ozone.OZKeypointModificationUndo.~OZKeypointModificationUndo.s (D1)              @0x102210
//   Ozone.OZKeypointModificationUndo.~OZKeypointModificationUndo.s (D0 delete)       @0x1022a0
//   Ozone.OZKeypointModificationUndo.Swap.s                                          @0x102340
//
// ObjC selectors (rebased from __objc_selrefs via `dyld_info -fixups`):
//   selref @0x90A030 -> "endLightAccess"    (ctor +0x1FBC, Swap +0x2363)
//   selref @0x90A078 -> "UID:"              (Swap +0x2352)
//   selref @0x90A080 -> "PathHUDController" (Swap +0x239A)
//   ObjC-msgSend GOT slot @0x826028 (ctor call @0x101FC6, Swap calls @0x102360/@0x10236D/@0x1023A1)
//   objc_release GOT slot @0x826070 (D0 @0x1022BB, D1 @0x10222B, D2 @0x10219B, Swap @0x1023AB)
//
// NOTE ON SELECTOR NAMES: the strings above are literal bytes from Ozone's __objc_methname
// (dyld_info-verified). They look like fragments of longer method names (e.g. "UID:" appears
// as the tail of "initWithPluginUUID:" in the string table); this is what FCP's stripped
// binary contains. We record them verbatim — we do NOT invent "the real" selectors.
//
// FRONTIER (undecoded callees preserved as throwing stubs — real code paths must supply):
//   - the ObjC msgSend targets on the NSView / OZCurveSelectionList — plain host bridge calls.
//   - OZChannelBase::getRef(bool)  @Ozone 0x6DF56A (stub)  — imported / stubbed here.
//   - OZChannelBase::vtable[+0xF8]   — used to clone the base into the undo record.
//
// -----------------------------------------------------------------------------------------

import { OZChannelBase } from "./OZChannelBase.js";

// Placeholder id types (ObjC objects the port cannot introspect).
type ObjcId = unknown;

/** OZChannelUndo — inner record captured per-channel by this undo. Fully-decoded 3-slot
 *  layout; C2 body @Ozone 0xFFE30 is inlined by OZKeypointModificationUndo's ctor. */
export class OZChannelUndo {
  /** From OZChannelBase::getRef(false) — @Ozone 0x6DF56A. */
  readonly channelRef: unknown;
  /** From (*chBase.__vptr)[+0xF8]() — virtual slot the enclosing ctor invokes @0x102042. */
  readonly clone: unknown;

  constructor(chBase: OZChannelBase) {
    // @0x102033 — call OZChannelBase::getRef(false).
    this.channelRef = OZKeypointModificationUndo.__stub_OZChannelBase_getRef(chBase, false);
    // @0x102042 — call (*chBase.__vptr)[+0xF8](chBase).
    this.clone = OZKeypointModificationUndo.__stub_OZChannelBase_vtable_0xF8(chBase);
  }

  /** OZChannelUndo::Swap — virtual slot @+0x10 (index 2). Invoked by
   *  OZKeypointModificationUndo::Swap @0x102386 as `movq (%rdi),%rax ; callq *0x10(%rax)`. */
  Swap(): void {
    throw new Error(
      "OZChannelUndo::Swap — virtual slot @+0x10 (vtable index 2) not yet transcribed " +
        "(Ozone frontier; body lives in a subclass; caller @Ozone 0x102386).",
    );
  }
}

/** OZKeypointModificationUndo — top-level undo record for a keypoint modification. */
export class OZKeypointModificationUndo {
  /** +0x08 — NSView captured at construction. */
  view: ObjcId;
  /** +0x10 — retained id returned by `[selectionList endLightAccess]` @0x101FCC. */
  toolState: ObjcId;
  /** +0x18..+0x28 — std::vector<OZChannelUndo*>. Modelled as a plain JS array (semantic
   *  equivalent; the length_error / bad_array_new_length exception paths are libc++
   *  bookkeeping, not FCP-observable behaviour). */
  channels: OZChannelUndo[] = [];

  /**
   * OZKeypointModificationUndo::OZKeypointModificationUndo(
   *     NSView* view,
   *     std::vector<OZChannelBase*> const& channels,
   *     OZCurveSelectionList* selectionList)
   *   @Ozone 0x101F80  (C2 — the real ctor; C1 @0x102170 is a tail-jump thunk to C2).
   *
   * Control flow (mirrored below):
   *   0x101F97  __vptr = &vtable_for_OZKeypointModificationUndo  (leaq 0x73B72A(%rip))
   *   0x101FA1  this->view = %rsi
   *   0x101FAD  zero out {vec_begin, vec_end}  (xorps %xmm0,%xmm0; movups %xmm0,0x18(%rdi))
   *   0x101FB4  this->vec_cap_end = null       (movq $0x0,0x28(%rdi))
   *   0x101FBC  rsi = @sel("endLightAccess")
   *   0x101FC3  rdi = selectionList
   *   0x101FC6  rax = objc_msgSend(selectionList, "endLightAccess")
   *   0x101FCC  this->toolState = rax
   *   0x101FD0  rbx = channels.__begin_
   *   0x101FD3  rsi(saved) = channels.__end_
   *   0x101FDB  if (begin == end) goto epilogue     (empty vector => skip loop entirely)
   *   loop body @0x10200C..0x10211C:
   *     0x102010  raw = operator new(0x18)         (allocate 24-byte OZChannelUndo)
   *     0x102024  raw->__vptr = &vtable_for_OZChannelUndo
   *     0x102031  arg2 = false (esi = 0)
   *     0x102033  raw->channelRef = OZChannelBase::getRef(chBase, false)
   *     0x102042  raw->clone     = (*chBase.__vptr)[+0xF8](chBase)
   *     — vector push_back with growth via operator new(bytes) + memcpy(old->new) + delete(old):
   *     0x10204C  check capacity; if room, in-place store `raw` at *vec_end then vec_end += 8
   *     0x102059+ grow path: doubles capacity (rbx = old_cap*2, capped at max half-size,
   *              also capped at absolute max SIZE_T/8 = 0x1FFFFFFFFFFFFFFF; on overflow
   *              throws length_error @0x102131 or bad_array_new_length @0x102138)
   *     — advance rbx by 8, loop while rbx != saved_end
   *   epilogue: pop callee-saves, ret.
   *
   * NOTE: the growth path is a libc++ implementation detail (equivalent to
   * `channels.push_back(new OZChannelUndo(...))` from a semantic standpoint). We do not
   * transcribe the pointer arithmetic literally — pushing to a JS array preserves the
   * observable FCP behaviour (order + count + element identity).
   */
  constructor(
    view: ObjcId,
    channels: ReadonlyArray<OZChannelBase>,
    selectionList: ObjcId,
  ) {
    // @0x101FA1 — capture the view.
    this.view = view;
    // @0x101FBC..@0x101FCC — toolState = [selectionList endLightAccess].
    // Under ARC the returned id is +1 retained; the dtor pairs this with objc_release.
    this.toolState = OZKeypointModificationUndo.__stub_objc_msgSend_endLightAccess(selectionList);
    // @0x101FDB — loop over the input const& vector<OZChannelBase*>. Empty => no-op.
    for (const chBase of channels) {
      // @0x102010..@0x102048 — allocate and populate an OZChannelUndo, then push_back.
      this.channels.push(new OZChannelUndo(chBase));
    }
  }

  /**
   * OZKeypointModificationUndo::~OZKeypointModificationUndo()  (D2 base-object destructor)
   *   @Ozone 0x102180
   *
   *   0x10218D  __vptr = &vtable_for_OZKeypointModificationUndo (reset to own class's vtable
   *             before destroying children — standard base-object dtor pattern)
   *   0x102197  rdi = this->toolState        (0x10(%rdi))
   *   0x10219B  objc_release(toolState)      (call *[GOT: _objc_release])
   *   0x1021A1  r14 = this->vec_begin, r15 = this->vec_end
   *   0x1021AC  if (r14 == r15) goto trailing (empty vector — skip element destroy loop)
   *   0x1021E0  element loop:
   *     0x1021E0  rdi = *r14 (OZChannelUndo*)
   *     0x1021E3  if rdi == null: skip -> just null the slot @0x1021D0
   *     0x1021E8  rax = *rdi (element's vtable)
   *     0x1021EB  call *0x8(%rax)   (vtable slot +0x8 = index 1 = deleting-dtor D0)
   *     0x1021D0  *r14 = null       (defensive nulling of the vector slot)
   *     0x1021D7  r14 += 8; if r14 != r15 loop else fall through
   *   0x1021F0  r14 = this->vec_begin
   *   0x1021F4  if r14 == null: return
   *   0x1021B7  else this->vec_end = r14 (SHRINK end back to begin; not that it matters,
   *             we're about to free the buffer) and:
   *   0x1021C4  jmp __ZdlPv          (delete[] the vector's raw storage; tail-call)
   *
   * We model deleting-each-OZChannelUndo as `elt.Swap()` — NO! that's wrong. The vtable
   * slot invoked here is +0x8 (D0, the deleting-destructor), not +0x10 (Swap). In JS we
   * have no delete operator, so freeing the elements is implicit; we clear the array to
   * match the vector shrink-to-zero.
   */
  __destroy(): void {
    // @0x102197..@0x10219B — release the retained toolState id.
    OZKeypointModificationUndo.__stub_objc_release(this.toolState);
    this.toolState = null;
    // @0x1021E0..@0x1021E8 loop — invokes each element's virtual deleting-dtor. In JS the
    // elements are simply dropped; if the D0 has side-effects beyond `operator delete`
    // those must be captured on a per-subclass basis (frontier).
    this.channels.length = 0;
  }

  /**
   * OZKeypointModificationUndo::Swap()
   *   @Ozone 0x102340
   *
   *   0x10234E  rdi = this->view                              (0x8(%rdi))
   *   0x102352  rsi = @sel("UID:")                             (movq 0x807D1F(%rip),%rsi)
   *   0x102359  r14 = *[GOT: _objc_msgSend]                    (movq 0x723CC8(%rip),%r14)
   *   0x102360  rax = objc_msgSend(view, "UID:")
   *   0x102363  rsi = @sel("endLightAccess")                   (movq 0x807CC6(%rip),%rsi)
   *   0x102369  rdi = rax                                      (chain the previous result)
   *   0x10236D  rax = objc_msgSend(rax, "endLightAccess")      (call *%r14)
   *   0x102370  r14 = rax                                      (freshly-captured tool state)
   *   0x102373  r15 = this->vec_begin, r12 = this->vec_end
   *   0x10237B  if (r15 == r12) goto skip-loop
   *   0x102380  loop:
   *     0x102380  rdi = *r15                                    (OZChannelUndo*)
   *     0x102383  rax = *rdi                                    (element's vtable)
   *     0x102386  call *0x10(%rax)                              (vtable slot +0x10 = index 2 = Swap)
   *     0x102389  r15 += 8; if r15 != r12 loop else fall through
   *   0x102392  rdi = this->view
   *   0x102396  rdx = this->toolState                           (2nd msgSend arg)
   *   0x10239A  rsi = @sel("PathHUDController")                 (movq 0x807CDF(%rip),%rsi)
   *   0x1023A1  objc_msgSend(view, "PathHUDController", toolState)  (call *[GOT: _objc_msgSend])
   *   0x1023A7  rdi = this->toolState
   *   0x1023AB  objc_release(toolState)                         (call *[GOT: _objc_release])
   *   0x1023B1  this->toolState = r14                           (the freshly-captured tool state)
   *   0x1023B5  ret
   *
   * Semantics: the modification and its "before" state trade places. Any subsequent Swap
   * flips them back. Classic undo/redo toggle.
   */
  Swap(): void {
    // @0x102352..@0x10236D — capture the current tool state via
    //   newTool = [[this.view UID:] endLightAccess]
    // (both selectors take no args; return-values are chained.)
    const inner = OZKeypointModificationUndo.__stub_objc_msgSend_UID(this.view);
    const capturedTool = OZKeypointModificationUndo.__stub_objc_msgSend_endLightAccess(inner);
    // @0x102380 loop — invoke Swap() on each captured channel undo.
    for (const elt of this.channels) {
      elt.Swap();
    }
    // @0x10239A..@0x1023A1 — install the OLD tool state on the view via
    //   [this.view PathHUDController:this.toolState]
    OZKeypointModificationUndo.__stub_objc_msgSend_PathHUDController(this.view, this.toolState);
    // @0x1023AB — release the old tool state we just handed off.
    OZKeypointModificationUndo.__stub_objc_release(this.toolState);
    // @0x1023B1 — remember the current tool state so the next Swap can restore it.
    this.toolState = capturedTool;
  }

  // --- Frontier stubs (undecoded host / ObjC / virtual callees) ---------------------

  /** @Ozone 0x6DF56A — OZChannelBase::getRef(bool) — cross-framework stub. */
  static __stub_OZChannelBase_getRef(_chBase: OZChannelBase, _flag: boolean): unknown {
    throw new Error("OZChannelBase::getRef(bool) not yet transcribed (@Ozone 0x6DF56A).");
  }
  /** vtable slot @+0xF8 on OZChannelBase (index 31). Used by the ctor @0x102042 to snapshot
   *  the channel into the undo record. Concrete subclasses provide the body. */
  static __stub_OZChannelBase_vtable_0xF8(_chBase: OZChannelBase): unknown {
    throw new Error(
      "OZChannelBase virtual slot +0xF8 (index 31) — subclass-specific clone-into-undo " +
        "not yet transcribed (called @Ozone 0x102042).",
    );
  }
  /** [id "endLightAccess"] — ObjC msg-send, host bridge (@Ozone selref 0x90A030). */
  static __stub_objc_msgSend_endLightAccess(_recv: ObjcId): ObjcId {
    throw new Error(
      "objc_msgSend(recv, \"endLightAccess\") not modelled (host bridge; " +
        "@Ozone selref 0x90A030; callers @0x101FC6 / @0x10236D).",
    );
  }
  /** [id "UID:"] — ObjC msg-send, host bridge (@Ozone selref 0x90A078). */
  static __stub_objc_msgSend_UID(_recv: ObjcId): ObjcId {
    throw new Error(
      "objc_msgSend(recv, \"UID:\") not modelled (host bridge; " +
        "@Ozone selref 0x90A078; caller @0x102360).",
    );
  }
  /** [id "PathHUDController":arg] — ObjC msg-send, host bridge (@Ozone selref 0x90A080). */
  static __stub_objc_msgSend_PathHUDController(_recv: ObjcId, _arg: ObjcId): void {
    throw new Error(
      "objc_msgSend(recv, \"PathHUDController\", arg) not modelled (host bridge; " +
        "@Ozone selref 0x90A080; caller @0x1023A1).",
    );
  }
  /** objc_release — host bridge (@Ozone GOT 0x826070). */
  static __stub_objc_release(_id: ObjcId): void {
    // No-op in TS (GC handles lifetime); the real @0x82_6070 call is retained here for
    // provenance — call-sites @0x1022BB (D0), @0x10222B (D1), @0x10219B (D2), @0x1023AB (Swap).
  }
}
