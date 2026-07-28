// OZEditBoxUndo — Ozone.framework undo record for an "edit-box" mutation. A subclass
// of OZKeypointModificationUndo that additionally snapshots the view's editBox (a
// 32-byte struct — four packed doubles) at construction and swaps it with the view's
// current editBox on each Swap() call. FAITHFUL PORT — every method cites @0xADDR
// (Ozone x86_64 slice). Do NOT approximate.
//
// STRUCT LAYOUT (0x50 bytes total — parent's 0x28-byte body followed by our 32-byte
// editBox payload; recovered from ctor @0x102440, D2 @0x1024C0, D0 @0x1025E0,
// Swap @0x102680):
//
//   offset  size  field                    provenance
//   ------  ----  -----------------------  ----------------------------------------------
//   +0x00   0x08  __vptr                   (leaq 0x73B296(%rip),%rax; %rax,(%rbx) @0x102453/@0x10245A)
//   +0x08   0x08  view : id                (inherited from OZKeypointModificationUndo)
//   +0x10   0x08  toolState : id           (inherited)  [reused by our Swap as the "selection copy"]
//   +0x18   0x08  vec_begin                (inherited — std::vector<OZChannelUndo*>::__begin_)
//   +0x20   0x08  vec_end                  (inherited)
//   +0x28   0x08  vec_cap_end              (inherited)
//   +0x30   0x08  editBox.d0 : double      (ctor `movups %xmm0,0x30(%rbx)` @0x102460;
//                                           filled from getEditBox stret if view!=null)
//   +0x38   0x08  editBox.d1 : double
//   +0x40   0x08  editBox.d2 : double      (ctor default = -1.0 — from the 16-byte const
//                                           at file 0x7053C0 = { -1.0, -1.0 }; loaded via
//                                           `movaps 0x602F55(%rip),%xmm1` @0x102464
//                                           then `movups %xmm1,0x40(%rbx)` @0x10246B)
//   +0x48   0x08  editBox.d3 : double      (ctor default = -1.0)
//
// The "editBox" struct is 32 bytes returned by objc_msgSend_stret on the -[view getEditBox]
// selector (@0x102486). Four packed 64-bit doubles is the ONLY footprint that matches the
// `movaps 0x30(%rbp),%xmm0 ; movaps 0x40(%rbp),%xmm1` pair @0x102748 that Swap uses to
// pass it back to -[view setEditBox:] (a stret-input-by-value ABI). The natural
// interpretation is a `struct { CGPoint origin; CGSize size; }` = CGRect (two CGFloat
// pairs), but we transcribe the raw four doubles — no shape assumption beyond size.
//
// vtable @0x83D6E0 (installed ptr 0x83D6F0):
//    *0x00 -> ~OZEditBoxUndo()  D2 (base-object non-deleting)    @0x1024C0
//    *0x08 -> ~OZEditBoxUndo()  D0 (deleting)                    @0x1025E0
//    *0x10 -> Swap()                                              @0x102680
// (installed via `leaq 0x73B296(%rip),%rax ; movq %rax,(%rbx)` at 0x102453/0x10245A.)
//
// DECODE references:
//   Ozone.OZEditBoxUndo.OZEditBoxUndo.s  (C2 @0x102440; C1 @0x1023C0 is a tail-jump thunk)
//   Ozone.OZEditBoxUndo.Swap.s           (Swap @0x102680)
//   raw disasm inline for D2 @0x1024C0, D1 @0x102550, D0 @0x1025E0 (see file below).
//
// ObjC selectors (rebased from __objc_selrefs; dyld_info + on-disk cstring lookup):
//   selref VA 0x90A088 -> "getEditBox"                (ctor msgSend_stret @0x102486;
//                                                      Swap msgSend_stret @0x102719)
//   selref VA 0x90A078 -> "getSelection"              (Swap @0x1026A4)
//   selref VA 0x90A030 -> "copy"                      (Swap @0x1026B1)
//   selref VA 0x90A080 -> "validateSelectedHandles:"  (Swap @0x1026F1)
//   selref VA 0x90A090 -> "setEditBox:"               (Swap @0x102759)
//   objc_msgSend GOT slot: `0x723984(%rip)`-relative from @0x10269D  (= 0x826028)
//   objc_msgSend_stret GOT slot: symbol stub 0x6E000E
//   objc_release GOT slot:  `0x72396F(%rip)`-relative from @0x1026FB
//
// RIP CONSTANT (ctor):
//   file 0x7053C0 (VA 0x7053C0)  = { -1.0, -1.0 } as two little-endian IEEE-754 doubles
//                                (u64=0xbff0000000000000 twice).  Loaded @0x102464.
//                                — this initialises the editBox's second 16 bytes to
//                                {-1.0,-1.0} so a null-view record still holds a
//                                well-defined sentinel.
//
// FRONTIER (undecoded — kept as throwing stubs cited by @0xADDR):
//   [view getEditBox]  -> 32-byte struct                    (host ObjC bridge)
//   [view getSelection]                                     (host ObjC bridge)
//   [id  copy]                                              (host ObjC bridge)
//   [view validateSelectedHandles:selection]                (host ObjC bridge)
//   [view setEditBox:{32-byte struct}]                      (host ObjC bridge; stret input)
//   objc_release(id)                                        (host ObjC ARC bridge)
//
// -----------------------------------------------------------------------------------------
//
// Faithful transcription @0x102440 (C1/C2 ctor) / @0x1024C0 (D2) / @0x1025E0 (D0) /
// @0x102680 (Swap).

import type { OZChannelBase } from "./OZChannelBase.js";
import { OZKeypointModificationUndo } from "./OZKeypointModificationUndo.js";

// The 32-byte "edit box" payload — four packed IEEE-754 doubles (`double[4]`). No
// semantic interpretation is invented; we mirror the raw memory pattern.
export interface OZEditBox {
  d0: number;
  d1: number;
  d2: number;
  d3: number;
}

// Placeholder id type (ObjC objects the port cannot introspect).
type ObjcId = unknown;

/**
 * The 16-byte IEEE-754 constant at file/VA 0x7053C0 = { -1.0, -1.0 }.
 * Loaded by the ctor @0x102464 into %xmm1 and written to editBox.{d2,d3}.
 */
const EDITBOX_INIT_TAIL_D2 = -1.0;
const EDITBOX_INIT_TAIL_D3 = -1.0;

export class OZEditBoxUndo extends OZKeypointModificationUndo {
  /**
   * +0x30..+0x50 — captured "edit box" snapshot. Initialised in the ctor from
   * -[view getEditBox] (or the { 0, 0, -1, -1 } sentinel if view == nil); swapped
   * with the live view's editBox on every Swap() call.
   */
  editBox: OZEditBox;

  /**
   * OZEditBoxUndo::OZEditBoxUndo(NSView*, std::vector<OZChannelBase*> const&, OZCurveSelectionList*)
   *
   * C2 body @0x102440..0x1024B7 (C1 @0x1023C0 is a tail-jump thunk to C2 — same body):
   *
   *   0x102440..0x10244A prologue
   *   0x10244B mov  %rdi,%rbx                                     # rbx = this
   *   0x10244E call __ZN26OZKeypointModificationUndoC2E...        # chain parent ctor
   *                                                                 (view, channels, selectionList)
   *   0x102453 lea  0x73B296(%rip),%rax                            # &vtable_body = 0x83D6F0
   *   0x10245A mov  %rax,(%rbx)                                    # this->__vptr = &vtable
   *   0x10245D xorps %xmm0,%xmm0
   *   0x102460 movups %xmm0,0x30(%rbx)                             # editBox.{d0,d1} = 0.0, 0.0
   *   0x102464 movaps 0x602F55(%rip),%xmm1                         # xmm1 = {-1.0, -1.0}
   *   0x10246B movups %xmm1,0x40(%rbx)                             # editBox.{d2,d3} = -1.0, -1.0
   *   0x10246F mov  0x8(%rbx),%rsi                                 # rsi = this->view
   *   0x102473 xorps %xmm1,%xmm1                                   # (dead — clobbered below)
   *   0x102476 test %rsi,%rsi
   *   0x102479 je   0x102493                                       # if (!view) skip stret-msg
   *   0x10247B mov  0x807C06(%rip),%rdx                            # rdx = @sel("getEditBox")
   *                                                                 (selref @0x90A088)
   *   0x102482 lea  -0x30(%rbp),%rdi                               # stret buf on the stack
   *   0x102486 call _objc_msgSend_stret                            # 32-byte struct return
   *   0x10248B movaps -0x30(%rbp),%xmm0                            # load returned bytes 0..16
   *   0x10248F movaps -0x20(%rbp),%xmm1                            # load returned bytes 16..32
   *   0x102493 movups %xmm0,0x30(%rbx)                             # editBox.{d0,d1} = returned
   *   0x102497 movups %xmm1,0x40(%rbx)                             # editBox.{d2,d3} = returned
   *   0x10249B..0x1024A3 epilogue
   *   0x1024A4..0x1024B7 unwind cleanup (Itanium ABI): on parent-ctor-throw,
   *     call OZKeypointModificationUndo::~OZKeypointModificationUndo() then _Unwind_Resume.
   *     (Not observable from JS — GC handles partial-construction cleanup.)
   *
   * Semantics: chain-construct the parent (view/toolState/channels), install our vtable,
   * then snapshot -[view getEditBox] into +0x30..+0x50 if a view exists, else keep the
   * { 0, 0, -1, -1 } sentinel written just above.
   */
  constructor(
    view: ObjcId,
    channels: ReadonlyArray<OZChannelBase>,
    selectionList: ObjcId,
  ) {
    // @0x10244E — chain-call parent ctor. This initialises view/toolState/channels.
    super(view, channels, selectionList);
    // @0x10245D..@0x10246B — write the { 0, 0, -1, -1 } sentinel into editBox first.
    // (The bytes at +0x30 are zeroed, then +0x40 gets {-1.0, -1.0} from the RIP const
    //  at file 0x7053C0. Both stores complete before the view-null test.)
    this.editBox = { d0: 0.0, d1: 0.0, d2: EDITBOX_INIT_TAIL_D2, d3: EDITBOX_INIT_TAIL_D3 };
    // @0x10246F..@0x102497 — if view != nil, overwrite editBox with -[view getEditBox].
    if (view !== null && view !== undefined) {
      const box = OZEditBoxUndo.__stub_objc_msgSend_stret_getEditBox(view);
      this.editBox = { d0: box.d0, d1: box.d1, d2: box.d2, d3: box.d3 };
    }
  }

  /**
   * OZEditBoxUndo::~OZEditBoxUndo()  (D2 — base-object, non-deleting)
   *   @Ozone 0x1024C0..0x10254C
   *
   *   0x1024C0..0x1024C9 prologue
   *   0x1024CA mov  %rdi,%rbx                                     # rbx = this
   *   0x1024CD lea  0x73B1F4(%rip),%rax                            # rax = parent-vtable body ptr
   *                                                                 (base-object-dtor pattern:
   *                                                                  set to parent's slice at 0x83D6C8
   *                                                                  before running parent-cleanup)
   *   0x1024D4 mov  %rax,(%rdi)                                    # this->__vptr = parent-vtable
   *   0x1024D7 mov  0x10(%rdi),%rdi                                # rdi = this->toolState
   *   0x1024DB call *[GOT: _objc_release]                          # objc_release(toolState)
   *   0x1024E1..0x102543 — inlined copy of OZKeypointModificationUndo's element-destroy loop:
   *     r14 = this->vec_begin ; r15 = this->vec_end
   *     if (r14 == r15) fall through to "free buffer" tail
   *     loop: rdi = *r14; if (rdi) call *0x8(*rdi) (element's D0);  *r14 = 0; r14 += 8; while r14 != r15
   *     tail: if (r14 == null) return; this->vec_end = r14 (shrink); jmp __ZdlPv (delete[] buffer)
   *
   * Semantics: identical to OZKeypointModificationUndo::~OZKeypointModificationUndo() —
   * release the retained toolState id, destroy every OZChannelUndo in the vector, then
   * free the vector's raw storage. The editBox payload (+0x30..+0x50) is 32 bytes of
   * value-type doubles — nothing to release. Under JS/GC, all of this is implicit.
   */
  destroy(): void {
    // Mirrors the D2 body: release parent-owned resources. In JS, the parent
    // destructor's cleared arrays / null'd toolState is sufficient — we just
    // drop the objc references via the host bridge.
    OZEditBoxUndo.__stub_objc_release(this.toolState);
    this.toolState = null;
    this.channels.length = 0;
  }

  /**
   * OZEditBoxUndo::~OZEditBoxUndo()  (D0 — deleting)
   *   @Ozone 0x1025E0..0x102673
   *
   * Identical structure to D2 but ends with a `jmp __ZdlPv` on `this` itself
   * (@0x10262C) after freeing the vector storage — the "deleting destructor" also
   * frees the outer object. In JS there is no explicit delete: `destroyAndFree`
   * simply calls `destroy()`.
   */
  destroyAndFree(): void {
    this.destroy();
    // @0x10262C — operator delete(this) (stub 0x6DFC36).  No-op in TS.
  }

  /**
   * OZEditBoxUndo::Swap()
   *   @Ozone 0x102680..0x10277B
   *
   *   0x102680..0x10268F prologue
   *   0x10268F mov  %rdi,%rbx                                     # rbx = this
   *   0x102692 mov  0x8(%rdi),%rdi                                # rdi = this->view
   *   0x102696 mov  0x8079DB(%rip),%rsi                            # rsi = @sel("getSelection")
   *                                                                 (selref VA 0x90A078)
   *   0x10269D mov  0x723984(%rip),%r14                            # r14 = *[GOT: _objc_msgSend]
   *   0x1026A4 call *%r14                                          # rax = [view getSelection]
   *   0x1026A7 mov  0x807982(%rip),%rsi                            # rsi = @sel("copy")
   *                                                                 (selref VA 0x90A030)
   *   0x1026AE mov  %rax,%rdi
   *   0x1026B1 call *%r14                                          # rax = [selection copy]
   *   0x1026B4 mov  %rax,%r14                                      # r14 = "selectionCopy" (retained)
   *   0x1026B7 mov  0x18(%rbx),%r15                                # r15 = this->vec_begin
   *   0x1026BB mov  0x20(%rbx),%r12                                # r12 = this->vec_end
   *   0x1026BF cmp  %r12,%r15
   *   0x1026C2 je   0x1026E2                                       # empty vec => skip loop
   *   0x1026D0 loop:                                               # per-element Swap
   *     0x1026D0 mov  (%r15),%rdi                                  # rdi = *r15 (OZChannelUndo*)
   *     0x1026D3 mov  (%rdi),%rax                                  # rax = element's vtable
   *     0x1026D6 call *0x10(%rax)                                  # elt->Swap() (vtable +0x10)
   *     0x1026D9 r15 += 8; if r15 != r12 loop
   *   0x1026E2 mov  0x8(%rbx),%rdi                                 # rdi = this->view
   *   0x1026E6 mov  0x10(%rbx),%rdx                                # rdx = this->toolState (OLD selection)
   *   0x1026EA mov  0x80798F(%rip),%rsi                            # rsi = @sel("validateSelectedHandles:")
   *                                                                 (selref VA 0x90A080)
   *   0x1026F1 call *[GOT: _objc_msgSend]                          # [view validateSelectedHandles:oldSel]
   *   0x1026F7 mov  0x10(%rbx),%rdi                                # rdi = this->toolState
   *   0x1026FB call *[GOT: _objc_release]                          # objc_release(oldSel)
   *   0x102701 mov  %r14,0x10(%rbx)                                # this->toolState = selectionCopy
   *
   *   -- editBox swap (32-byte stret) --
   *   0x102705 mov  0x8(%rbx),%rsi                                 # rsi = this->view
   *   0x102709 test %rsi,%rsi
   *   0x10270C je   0x102724                                       # if (!view) zero the temp bufs
   *   0x10270E mov  0x807973(%rip),%rdx                            # rdx = @sel("getEditBox")
   *                                                                 (selref VA 0x90A088)
   *   0x102715 lea  -0x40(%rbp),%rdi                               # stret return-buf
   *   0x102719 call _objc_msgSend_stret                            # capture CURRENT editBox to
   *                                                                 -0x40..-0x20 on the stack
   *   0x10271E mov  0x8(%rbx),%rdi                                 # rdi = this->view (again)
   *   0x102722 jmp  0x102731
   *   0x102724 xorps %xmm0,%xmm0                                   # !view => temp bufs = {0,0,0,0}
   *   0x102727 movaps %xmm0,-0x30(%rbp)                            # zero -0x30..-0x20
   *   0x10272B movaps %xmm0,-0x40(%rbp)                            # zero -0x40..-0x30
   *   0x10272F xor  %edi,%edi                                      # rdi = nil for the setEditBox: call
   *   0x102731 movups 0x30(%rbx),%xmm0                             # load OLD editBox.{d0,d1}
   *   0x102735 movaps %xmm0,-0x60(%rbp)                            #  → stack arg -0x60..-0x50
   *   0x102739 movups 0x40(%rbx),%xmm0                             # load OLD editBox.{d2,d3}
   *   0x10273D movaps %xmm0,-0x50(%rbp)                            #  → stack arg -0x50..-0x40
   *   0x102741 mov  0x807948(%rip),%rsi                            # rsi = @sel("setEditBox:")
   *                                                                 (selref VA 0x90A090)
   *   0x102748 movaps -0x60(%rbp),%xmm0                            # 32-byte struct-arg in xmm0/xmm1
   *   0x10274C movaps -0x50(%rbp),%xmm1
   *   0x102750 movups %xmm1,0x10(%rsp)                             # + rest on stack (SysV struct-arg)
   *   0x102755 movups %xmm0,(%rsp)
   *   0x102759 call *[GOT: _objc_msgSend]                          # [view setEditBox:oldEditBox]
   *
   *   -- store the freshly captured editBox as our new snapshot --
   *   0x10275F movaps -0x40(%rbp),%xmm0                            # CURRENT editBox bytes 0..16
   *   0x102763 movups %xmm0,0x30(%rbx)                             # this->editBox.{d0,d1} = current
   *   0x102767 movaps -0x30(%rbp),%xmm0                            # CURRENT editBox bytes 16..32
   *   0x10276B movups %xmm0,0x40(%rbx)                             # this->editBox.{d2,d3} = current
   *   0x10276F..0x10277B epilogue
   *
   * Semantics — the classic three-part undo/redo toggle for an "edit-box" mutation:
   *   1. capture the view's CURRENT selection (copy) — save it aside as `selectionCopy`
   *   2. per-channel Swap: recurse into every OZChannelUndo element
   *   3. install the OLD selection (this->toolState) back on the view
   *      (`validateSelectedHandles:`), release it, and store the fresh selectionCopy
   *      as our new "old" toolState.
   *   4. snapshot the view's CURRENT editBox to the stack (32-byte stret return)
   *   5. install our OLD editBox on the view (`setEditBox:` — 32-byte struct-by-value)
   *   6. store the freshly-captured editBox into `this->editBox` as our new snapshot.
   * On a subsequent Swap() the two records trade places again — undo/redo toggle.
   *
   * The !view branch (@0x102724..@0x10272F) still runs setEditBox:'s stack marshaling
   * but with a `nil` receiver — the ObjC dispatcher returns zero, and the stret return
   * buffers stay as the {0,0,0,0} we zeroed at 0x102727/0x10272B (so this->editBox
   * ends up cleared to zero after the swap).
   */
  Swap(): void {
    // @0x10269D..@0x1026B4 — capture the current selection then take a +1-retained copy.
    const selectionRaw = OZEditBoxUndo.__stub_objc_msgSend_getSelection(this.view);
    const selectionCopy = OZEditBoxUndo.__stub_objc_msgSend_copy(selectionRaw);

    // @0x1026D0 loop — per-channel Swap (vtable +0x10 = OZChannelUndo::Swap).
    for (const elt of this.channels) {
      elt.Swap();
    }

    // @0x1026E2..@0x1026F1 — install OLD selection onto the view
    //   [this.view validateSelectedHandles:this.toolState]
    OZEditBoxUndo.__stub_objc_msgSend_validateSelectedHandles(this.view, this.toolState);
    // @0x1026F7..@0x1026FB — release the OLD selection.
    OZEditBoxUndo.__stub_objc_release(this.toolState);
    // @0x102701 — store the freshly-captured selectionCopy as the new "old" toolState.
    this.toolState = selectionCopy;

    // @0x102705..@0x102719 — capture the view's CURRENT editBox (or {0,0,0,0} if nil view).
    let currentEditBox: OZEditBox;
    if (this.view !== null && this.view !== undefined) {
      currentEditBox = OZEditBoxUndo.__stub_objc_msgSend_stret_getEditBox(this.view);
    } else {
      // @0x102724..@0x10272B — zero the stret buffers when the view is nil.
      currentEditBox = { d0: 0.0, d1: 0.0, d2: 0.0, d3: 0.0 };
    }

    // @0x102731..@0x102759 — install the OLD editBox onto the view (or nil-view no-op).
    //   [this.view setEditBox:{d0,d1,d2,d3}]
    OZEditBoxUndo.__stub_objc_msgSend_setEditBox(this.view, {
      d0: this.editBox.d0,
      d1: this.editBox.d1,
      d2: this.editBox.d2,
      d3: this.editBox.d3,
    });

    // @0x10275F..@0x10276B — store the freshly-captured editBox into our snapshot.
    this.editBox = {
      d0: currentEditBox.d0,
      d1: currentEditBox.d1,
      d2: currentEditBox.d2,
      d3: currentEditBox.d3,
    };
  }

  // --- Frontier stubs (host ObjC bridge — the port cannot introspect NSView) ----------

  /** [id "getSelection"] — @Ozone selref 0x90A078; call @0x1026A4. */
  static __stub_objc_msgSend_getSelection(_view: ObjcId): ObjcId {
    // raise: objc_msgSend(view, "getSelection") host bridge @0x1026A4
    throw new Error(
      'objc_msgSend(view, "getSelection") not modelled (host bridge; selref @0x90A078; call @0x1026A4).',
    );
  }

  /** [id "copy"] — @Ozone selref 0x90A030; call @0x1026B1. */
  static __stub_objc_msgSend_copy(_recv: ObjcId): ObjcId {
    // raise: objc_msgSend(recv, "copy") host bridge @0x1026B1
    throw new Error(
      'objc_msgSend(recv, "copy") not modelled (host bridge; selref @0x90A030; call @0x1026B1).',
    );
  }

  /** [view "validateSelectedHandles:" selection] — @Ozone selref 0x90A080; call @0x1026F1. */
  static __stub_objc_msgSend_validateSelectedHandles(_view: ObjcId, _selection: ObjcId): void {
    // raise: objc_msgSend(view, "validateSelectedHandles:", selection) host bridge @0x1026F1
    throw new Error(
      'objc_msgSend(view, "validateSelectedHandles:", selection) not modelled ' +
        "(host bridge; selref @0x90A080; call @0x1026F1).",
    );
  }

  /**
   * [view "getEditBox"] — 32-byte struct return via objc_msgSend_stret.
   * @Ozone selref 0x90A088; ctor call @0x102486; Swap call @0x102719.
   */
  static __stub_objc_msgSend_stret_getEditBox(_view: ObjcId): OZEditBox {
    // raise: objc_msgSend_stret(&buf, view, "getEditBox") host bridge @0x102486 / @0x102719
    throw new Error(
      'objc_msgSend_stret(view, "getEditBox") not modelled (host bridge; ' +
        "selref @0x90A088; calls @0x102486 / @0x102719).",
    );
  }

  /**
   * [view "setEditBox:" {d0,d1,d2,d3}] — 32-byte struct-by-value input.
   * @Ozone selref 0x90A090; call @0x102759.
   */
  static __stub_objc_msgSend_setEditBox(_view: ObjcId, _box: OZEditBox): void {
    // raise: objc_msgSend(view, "setEditBox:", {d0,d1,d2,d3}) host bridge @0x102759
    throw new Error(
      'objc_msgSend(view, "setEditBox:", {d0,d1,d2,d3}) not modelled (host bridge; ' +
        "selref @0x90A090; call @0x102759).",
    );
  }

  /** objc_release(id) — host ARC bridge. Ctor D2 @0x1024DB, D0 @0x1025FB, Swap @0x1026FB. */
  static __stub_objc_release(_id: ObjcId): void {
    // raise: objc_release(id) host bridge @0x1024DB / @0x1025FB / @0x1026FB
    // (Modelled as no-op semantically — JS GC — but we keep the stub throwing so
    //  ordinary code paths don't silently rely on it. The `destroy()` method above
    //  intentionally calls it to preserve the ARC-release provenance.)
    throw new Error(
      "objc_release(id) not modelled (host ARC bridge; calls @0x1024DB / @0x1025FB / @0x1026FB).",
    );
  }
}
