// OZOverrideFCPColorSpaceUndo — an "undo record" that snapshots OZDocument's
// override-FCP-color-space bool flag so it can be restored by Swap(). FAITHFUL
// PORT from Ozone.framework. Every method cites @0xADDR.
//
// Sibling family (same "Swap-based undo" ABI): OZMarkersUndo, OZDocumentTypeUndo,
// OZEditBoxUndo, OZLastModifiedChannelsUndo, OZKeypointModificationUndo, OZDropZoneTypeUndo.
// This is the SIMPLEST member of the family — a single bool payload, no channel-ref,
// no heap allocations, no dynamic_cast.
//
// vtable @0x83d628 (installed via `leaq 0x73bf28(%rip),%rax ; movq %rax,(%rdi)` at
// 0x1016f9/0x101700 in C1, and `0x73bf58(%rip)` at 0x1016c9/0x1016d0 in C2 — both
// land on the same address because C1 is 0x30 bytes ahead of C2 and the RIP delta
// differs by exactly 0x30):
//    *0x00 -> ~OZOverrideFCPColorSpaceUndo()  @0x101730  (D1 — non-deleting, empty)
//    *0x08 -> ~OZOverrideFCPColorSpaceUndo()  @0x101740  (D0 — deleting; tail-calls
//                                                        operator delete via stub 0x6dfc36)
//    *0x10 -> Swap()                          @0x101750  (the "apply/unapply" hook)
//
// Struct layout (0x9 bytes payload, allocated as 0x10 with padding; recovered from
// ctor @0x1016c0/@0x1016f0 and swap @0x101750):
//   +0x00   vtable ptr           installed at 0x1016d0 / 0x101700.
//   +0x08   savedValue : u8/bool the previous FCP-color-space-override flag, captured
//                                by calling OZDocument::getOverrideFCPColorSpace() on
//                                the input document and stored as a byte
//                                (`movb %al,0x8(%rbx)` @0x1016db / @0x10170b).
//
// FRONTIER (undecoded — kept as throwing stubs cited by @0xADDR):
//   OZDocument::getOverrideFCPColorSpace() const  @ __ZNK10OZDocument24getOverrideFCPColorSpaceEv
//                                                 (ctor @0x101706; Swap @0x101777)
//   OZDocument::setOverrideFCPColorSpace(bool)    @ __ZN10OZDocument24setOverrideFCPColorSpaceEb
//                                                 (Swap @0x101786)
//   OZDocument::postNotification(unsigned int)    @ __ZN10OZDocument16postNotificationEj
//                                                 (Swap tail-call @0x1017a1)
//   _theApp global + OZApplication::getCurrentDoc()   @ __ZN13OZApplication13getCurrentDocEv
//                                                 (Swap @0x101767)
//   operator delete                               @ stub 0x6dfc36 (D0 tail-call @0x101745)
//
// Notification id 0x1010 (Swap @0x101792) — an integer notification code posted after the
// Document mutation; kept as-is (a raw provenance constant, not "invented magic").

/**
 * Opaque OZDocument handle. Not yet ported as a first-class class — kept as an
 * interface so the frontier stubs can consume it without inventing shape.
 */
export interface OZDocumentHandle {
  readonly __ozDocument: true;
}

/**
 * Global _theApp singleton (the Ozone process-wide OZApplication instance) —
 * referenced in Swap() via `leaq _theApp(%rip),%rax ; movq (%rax),%rdi` at
 * 0x10175d/0x101764. Not yet ported; frontier-stubbed.
 */
export function ozGetTheApp_getCurrentDoc(): OZDocumentHandle | null {
  // raise: _theApp / OZApplication::getCurrentDoc() @ __ZN13OZApplication13getCurrentDocEv @0x101767
  throw new Error("OZApplication::getCurrentDoc frontier @0x101767 not yet ported");
}

/** OZDocument::getOverrideFCPColorSpace() const — frontier @0x101706 / @0x101777. */
export function ozDocument_getOverrideFCPColorSpace(_doc: OZDocumentHandle): boolean {
  // raise: OZDocument::getOverrideFCPColorSpace @ __ZNK10OZDocument24getOverrideFCPColorSpaceEv
  throw new Error("OZDocument::getOverrideFCPColorSpace frontier @0x101706 not yet ported");
}

/** OZDocument::setOverrideFCPColorSpace(bool) — frontier @0x101786. */
export function ozDocument_setOverrideFCPColorSpace(_doc: OZDocumentHandle, _v: boolean): void {
  // raise: OZDocument::setOverrideFCPColorSpace @ __ZN10OZDocument24setOverrideFCPColorSpaceEb
  throw new Error("OZDocument::setOverrideFCPColorSpace frontier @0x101786 not yet ported");
}

/** OZDocument::postNotification(unsigned int) — frontier @0x1017a1. */
export function ozDocument_postNotification(_doc: OZDocumentHandle, _notif: number): void {
  // raise: OZDocument::postNotification @ __ZN10OZDocument16postNotificationEj
  throw new Error("OZDocument::postNotification frontier @0x1017a1 not yet ported");
}

/**
 * OZDocument-post-notification code used by Swap() (@0x101792 `movl $0x1010,%esi`).
 * A raw provenance constant recovered directly from the disassembly — not invented.
 */
export const NOTIF_OVERRIDE_FCP_COLOR_SPACE_CHANGED = 0x1010;

export class OZOverrideFCPColorSpaceUndo {
  /**
   * +0x08. The prior FCP-color-space-override bool captured from the source document
   * at construction time and swapped with the live document on Swap(). Stored as a
   * byte in the binary (`movb %al,0x8(%rbx)`); TS models it as a boolean.
   */
  private savedValue: boolean = false;

  /**
   * OZOverrideFCPColorSpaceUndo::OZOverrideFCPColorSpaceUndo(OZDocument const*)
   *
   * C1 body @0x1016f0..0x101714 (identical to C2 @0x1016c0..0x1016e4 modulo the
   * RIP-delta on the vtable leaq):
   *   0x1016f0: pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax        # prologue
   *   0x1016f6: movq %rdi,%rbx                                                # rbx = this
   *   0x1016f9: leaq 0x73bf28(%rip),%rax    # &vtable body = 0x83d628
   *   0x101700: movq %rax,(%rdi)            # this->vtable = vtable
   *   0x101703: movq %rsi,%rdi              # rdi = doc
   *   0x101706: callq OZDocument::getOverrideFCPColorSpace()   # -> al (bool)
   *   0x10170b: movb  %al,0x8(%rbx)         # this->savedValue = doc.getOverrideFCPColorSpace()
   *   0x10170e..0x101714: epilogue
   */
  constructor(doc: OZDocumentHandle) {
    // @0x101706: captured directly from the source document — mirrors asm exactly.
    this.savedValue = ozDocument_getOverrideFCPColorSpace(doc);
  }

  /**
   * OZOverrideFCPColorSpaceUndo::~OZOverrideFCPColorSpaceUndo() (D1/D2, non-deleting)
   *
   * D2 body @0x101720..0x101725: pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq  — no-op.
   * D1 body @0x101730..0x101735: same — no-op.
   *
   * The class owns nothing that needs releasing (bool payload only), so the
   * non-deleting destructor slot is a pure return. TS has no explicit dtor; provided
   * as an idempotent no-op method for symmetry with the sibling family.
   */
  destroy(): void {
    // no-op — mirrors @0x101720 / @0x101730 empty bodies.
  }

  /**
   * OZOverrideFCPColorSpaceUndo::~OZOverrideFCPColorSpaceUndo() (D0, deleting)
   *
   * D0 body @0x101740..0x101745:
   *   0x101740..0x101744: pushq %rbp ; movq %rsp,%rbp ; popq %rbp                # prologue+epilogue
   *   0x101745: jmp   __ZdlPv                                                    # tail-call operator delete(void*)
   *
   * i.e. the deleting dtor is a thin wrapper that just frees the object — the
   * non-deleting body @0x101730 is inlined as the empty prologue/epilogue above
   * it. In TS there's no manual delete; we model this as `deleteAndFree` calling
   * `destroy()` then dropping the handle.
   */
  deleteAndFree(): void {
    this.destroy();
    // raise: operator delete @ stub 0x6dfc36 — no-op in TS/GC land.
  }

  /**
   * OZOverrideFCPColorSpaceUndo::Swap()
   *
   * Body @0x101750..0x1017b0:
   *   0x101750-0x101759: prologue (pushq %rbp ; movq %rsp,%rbp ; pushq %r15/r14/rbx ; pushq %rax)
   *   0x10175a: movq %rdi,%rbx                                             # rbx = this
   *   0x10175d: leaq _theApp(%rip),%rax                                     # &_theApp
   *   0x101764: movq (%rax),%rdi                                            # rdi = _theApp
   *   0x101767: callq OZApplication::getCurrentDoc()                        # rax = doc
   *   0x10176c: testq %rax,%rax
   *   0x10176f: je    0x1017a6                                              # if (!doc) return
   *   0x101771: movq %rax,%r14                                              # r14 = doc
   *   0x101774: movq %rax,%rdi
   *   0x101777: callq OZDocument::getOverrideFCPColorSpace()                # r15b = doc.get()
   *   0x10177c: movl %eax,%r15d
   *   0x10177f: movzbl 0x8(%rbx),%esi                                       # esi = this->savedValue
   *   0x101783: movq %r14,%rdi
   *   0x101786: callq OZDocument::setOverrideFCPColorSpace(bool)            # doc.set(saved)
   *   0x10178b: movb %r15b,0x8(%rbx)                                        # this->savedValue = prev
   *   0x10178f: movq %r14,%rdi
   *   0x101792: movl $0x1010,%esi                                           # notif code
   *   0x101797-0x1017a0: epilogue
   *   0x1017a1: jmp   OZDocument::postNotification(unsigned int)            # tail-call
   *   0x1017a6-0x1017b0: null-doc bail-out epilogue
   *
   * Semantics: atomically SWAP `this->savedValue` with the live current-document's
   * `overrideFCPColorSpace` flag, then post the "override-fcp-color-space changed"
   * notification (0x1010). If there is no current document, do nothing.
   */
  Swap(): void {
    // @0x101767: fetch the app-global "current document".
    const doc = ozGetTheApp_getCurrentDoc();
    // @0x10176c/@0x10176f: null-doc guard → early return.
    if (doc === null) return;

    // @0x101777: read the doc's current flag (destination of the swap).
    const prev = ozDocument_getOverrideFCPColorSpace(doc);
    // @0x10177f/@0x101786: write our saved flag into the doc.
    ozDocument_setOverrideFCPColorSpace(doc, this.savedValue);
    // @0x10178b: store the doc's previous flag back into our slot (completes the swap).
    this.savedValue = prev;
    // @0x101792/@0x1017a1: post notification 0x1010 on the same doc (tail-call in asm).
    ozDocument_postNotification(doc, NOTIF_OVERRIDE_FCP_COLOR_SPACE_CHANGED);
  }
}
