// OZLockingGroup — Ozone's per-scene locking-group container. Holds an intrusive
// doubly-linked list head (embedded at +0x08), a back-pointer to the owning
// OZScene (+0x18), and a 32-bit counter/flag (+0x20). Later methods (their own
// ledger units) populate the rest.
//
// Faithful port of the Ozone x86_64 disassembly. Every method cites its @Ozone
// addr. Framework: Ozone (thin slice extracted from
// Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone).
//
// Provenance (raw-port/re/disasm/__ZN14OZLockingGroupC1EP7OZScene.s):
//   OZLockingGroup(OZScene*)  @0x34ae10  (__ZN14OZLockingGroupC1EP7OZScene)
//
// ── Decoded struct layout (only the fields this ctor writes are pinned; the
//    rest are filled in by their own ledger units) ─────────────────────────
//
//   +0x00  ptr  listHead    // points at the embedded list node at +0x08.
//                           //   leaq 0x8(%rdi),%rax ; movq %rax,(%rdi)  @0x34ae14/0x34ae1f
//   +0x08  ptr  next        // intrusive-list "next", zero-cleared to null.
//   +0x10  ptr  prev        // intrusive-list "prev", zero-cleared to null.
//                           //   xorps %xmm0 ; movups %xmm0,0x8(%rdi)    @0x34ae18/0x34ae1b
//                           //   (the 16-byte store zeroes [+0x08,+0x18))
//   +0x18  ptr  scene       // OZScene* back-pointer (arg %rsi).
//                           //   movq %rsi,0x18(%rdi)                    @0x34ae22
//   +0x20  u32  count       // counter/flag, cleared to 0.
//                           //   movl $0x0,0x20(%rdi)                    @0x34ae26
//
// The `leaq 0x8(%rdi),%rax ; movq %rax,(%rdi)` pair, together with next/prev at
// +0x08/+0x10 zeroed, is the canonical EMPTY intrusive doubly-linked list: the
// head pointer at +0x00 aims at the embedded sentinel node at +0x08 whose next
// and prev links are both null (an empty list). No callees, no externs — a pure
// field-init ctor.

/** Opaque back-pointer to the owning OZScene (arg %rsi, stored at +0x18). Its
 *  concrete layout is not touched by this ctor, so it is modeled opaquely; later
 *  ports of OZLockingGroup members will pin the fields they read. */
export type OZScene = unknown;

/** An entry in OZLockingGroup's intrusive doubly-linked list. The list is
 *  embedded in the group at +0x08 (next) / +0x10 (prev); the head pointer at
 *  +0x00 references this embedded node. A fresh group is an empty list, so both
 *  links start null. */
export interface OZLockingGroupListNode {
  /** +0x08 intrusive "next" link, or null when the list is empty. */
  next: OZLockingGroupListNode | null;
  /** +0x10 intrusive "prev" link, or null when the list is empty. */
  prev: OZLockingGroupListNode | null;
}

export class OZLockingGroup {
  /** +0x00 head pointer — references the embedded list node at +0x08. The ctor
   *  sets it to `this.listNode` (the `leaq 0x8(%rdi)` self-reference). */
  listHead: OZLockingGroupListNode;
  /** +0x08/+0x10 the embedded intrusive-list node (next/prev), both zeroed by
   *  the 16-byte `movups %xmm0` store — i.e. an empty list. */
  listNode: OZLockingGroupListNode;
  /** +0x18 OZScene* back-pointer (arg %rsi @0x34ae22). */
  scene: OZScene | null;
  /** +0x20 u32 counter/flag, cleared to 0 (movl $0x0 @0x34ae26). */
  count: number;

  /**
   * OZLockingGroup::OZLockingGroup(OZScene*)
   * @0xADDR Ozone 0x000000000034ae10  (__ZN14OZLockingGroupC1EP7OZScene)
   *
   * DECODE (raw-port/re/disasm/__ZN14OZLockingGroupC1EP7OZScene.s):
   *   0x34ae10  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x34ae14  leaq 0x8(%rdi), %rax               ; rax = &this->listNode (+0x08)
   *   0x34ae18  xorps %xmm0, %xmm0                 ; xmm0 = 0
   *   0x34ae1b  movups %xmm0, 0x8(%rdi)            ; zero [+0x08,+0x18) : next=prev=null
   *   0x34ae1f  movq %rax, (%rdi)                  ; this->listHead = &this->listNode
   *   0x34ae22  movq %rsi, 0x18(%rdi)              ; this->scene = arg0 (OZScene*)
   *   0x34ae26  movl $0x0, 0x20(%rdi)              ; this->count = 0
   *   0x34ae2d  popq %rbp ; retq                   ; void
   *
   * A pure field-initializing constructor: builds an EMPTY intrusive doubly-
   * linked list (head at +0x00 pointing at the embedded node at +0x08 whose
   * next/prev are null), stashes the OZScene back-pointer, and clears the u32
   * counter. Zero callees, no externs.
   */
  constructor(scene: OZScene | null) {
    // @0x34ae1b — movups %xmm0,0x8(%rdi) : zero [+0x08,+0x18) => empty list.
    this.listNode = { next: null, prev: null };
    // @0x34ae14/0x34ae1f — leaq 0x8(%rdi),%rax ; movq %rax,(%rdi) :
    //   head pointer references the embedded list node (self-referential head).
    this.listHead = this.listNode;
    // @0x34ae22 — movq %rsi,0x18(%rdi)
    this.scene = scene;
    // @0x34ae26 — movl $0x0,0x20(%rdi)
    this.count = 0;
  }
}
