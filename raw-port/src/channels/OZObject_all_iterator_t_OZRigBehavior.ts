// OZObject::all_iterator_t<OZRigBehavior, false, true, OZObject::defaultAllValidator>
// — one template-instantiated class per file. This file holds only the destructor
// (D1 base-object dtor) recovered from Ozone.framework. Other members of the same
// template instantiation will be added incrementally as they are ported.

import type { OZRigBehavior } from "./OZRigBehavior.js";

/**
 * `operator delete(void*)` — libc++ ABI extern.
 *
 * Called through Ozone imported-stubs slot `__ZdlPv @ Ozone 0x6dfc36`. This is
 * the sized/unsized single-object `operator delete` from the C++ runtime (libc++abi).
 * TRUE out-of-scope extern per the port policy: the C++ runtime is not one of
 * the five FCP frameworks. Modelled as a boundary stub — the concrete
 * implementation frees the heap block, which is not observable from TS (GC
 * handles reclamation).
 *
 * The dtor calls this exactly to release two kinds of heap block:
 *   1. Every node of a singly-linked list rooted at `this+0x40`. Each node
 *      is laid out with the "next" pointer at offset 0x0 (`movq (%rdi), %r14`
 *      @0x4f1c0) — a classic intrusive singly-linked list.
 *   2. The (single) buffer pointed to by `this+0x30` (if non-null), whose
 *      pointer slot is nulled BEFORE the delete (@0x4f1d4) — the same "clear
 *      then delete" pattern the base class uses to make the slot idempotent.
 *
 * In TS we model this as marking the linked list drained; there is no real
 * memory to free.
 */
function operator_delete_void_ptr(_p: unknown): void {
  // No-op boundary stub: libc++ heap deallocation is not observable in TS.
  // Referenced from OZObject::all_iterator_t<OZRigBehavior,...>::~all_iterator_t
  // @0x4f1c3 (loop) and @0x4f1e5 (tail-jmp) — both through Ozone stub 0x6dfc36.
  void _p;
}

/**
 * OZObject::all_iterator_t<OZRigBehavior, false, true,
 *                          OZObject::defaultAllValidator>::~all_iterator_t()
 * (D1 = base-object destructor, mangled `__ZN8OZObject14all_iterator_tI13OZRigBehaviorLb0ELb1ENS_19defaultAllValidatorEED1Ev`).
 *
 * @0x000000000004f1a0..0x000000000004f1ee  (Ozone.framework)
 *
 * Layout (recovered from the dtor body — offsets read/written verbatim):
 *
 *   struct OZObject::all_iterator_t<OZRigBehavior, false, true, defaultAllValidator> {
 *     ...                              // fields [0x00..0x30) — not read by this dtor
 *     T*   __single_at_0x30;           // @+0x30 — single owned buffer, freed via operator delete
 *     ...                              // [0x38..0x40) — 8 bytes, layout not observed
 *     Node* __list_head_at_0x40;       // @+0x40 — head of an intrusive singly-linked list
 *   };                                 // total sizeof observed >= 0x48
 *
 *   struct Node { Node* next; ... };   // @+0x00 is the `next` pointer (read @0x4f1c0)
 *
 * Body (line-by-line correspondence to the disasm):
 *
 *   @0x4f1a0..0x4f1a7  prologue: push rbp/r14/rbx; rbx = this (rdi).
 *   @0x4f1aa  rdi = *(rbx+0x40)     ; head = this->__list_head_at_0x40.
 *   @0x4f1ae..0x4f1b1  test rdi,rdi ; je 0x4f1d0 — skip the list-walk if head == NULL.
 *   @0x4f1b3  nopw %cs:(...)        — 16-byte alignment nop (loop header pad).
 *
 *   .LOOP: @0x4f1c0..0x4f1ce
 *     @0x4f1c0  movq (%rdi), %r14   ; r14 = cur->next   (offset 0x0 in Node)
 *     @0x4f1c3  callq __ZdlPv        ; operator delete(cur)  — Ozone stub 0x6dfc36
 *     @0x4f1c8  movq %r14, %rdi     ; cur = next
 *     @0x4f1cb  testq %r14, %r14    ; ZF = (next == NULL)
 *     @0x4f1ce  jne 0x4f1c0         ; loop while next != NULL
 *
 *   @0x4f1d0  rdi = *(rbx+0x30)     ; single = this->__single_at_0x30.
 *   @0x4f1d4  *(rbx+0x30) = 0       ; this->__single_at_0x30 = NULL   (clear BEFORE delete)
 *   @0x4f1dc..0x4f1df  test rdi,rdi ; je 0x4f1ea — skip the second delete if single == NULL.
 *   @0x4f1e1..0x4f1e5  epilogue + `jmp __ZdlPv` — tail-call operator delete(single).
 *
 *   @0x4f1ea..0x4f1ee  epilogue + retq   (NULL-single branch).
 *
 * Semantics:
 *   Walk the singly-linked list at `this->__list_head_at_0x40` calling `operator delete`
 *   on each node in turn (freeing the intrusive spine). Then, if the auxiliary buffer at
 *   `this->__single_at_0x30` is non-null, null the slot and free it. The dtor does NOT
 *   null the list-head slot: after the loop terminates, `this->__list_head_at_0x40` is
 *   a dangling pointer — this is safe because the caller has just entered the dtor and
 *   the object is about to become inaccessible (typical C++ destructor discipline).
 *
 *   Notably absent: no OZRigBehavior*-typed callback runs on any node (e.g. no vtable
 *   invocation, no `T::~T()` for the list nodes). The nodes are POD-like from the
 *   iterator's perspective — the template parameter `OZRigBehavior` only affects the
 *   iterator's dereference/advance code paths (deleted-elsewhere), not the dtor spine.
 *
 * @param self  the iterator instance. The dtor mutates `self.__single_at_0x30` to null
 *              as a side effect before releasing it (mirrors @0x4f1d4).
 */
export function OZObject_all_iterator_t_OZRigBehavior_dtor(
  self: OZObject_all_iterator_t_OZRigBehavior,
): void {
  // @0x4f1aa  rdi = *(this + 0x40) — head of the intrusive list.
  let cur: OZObject_all_iterator_t_OZRigBehavior_Node | null =
    self.__list_head_at_0x40;

  // @0x4f1ae..0x4f1b1  test rdi,rdi ; je 0x4f1d0 — skip walk on empty list.
  if (cur !== null) {
    // .LOOP body — do/while with a not-null head, matching the "nopw pad + jne back"
    // shape at @0x4f1b3/0x4f1c0/0x4f1ce. Semantically equivalent to a do-while.
    do {
      // @0x4f1c0  movq (%rdi), %r14 — read the `next` pointer from Node offset 0x0.
      const next: OZObject_all_iterator_t_OZRigBehavior_Node | null = cur.next;
      // @0x4f1c3  callq __ZdlPv — operator delete(cur). Boundary stub — no observable
      // effect in TS (GC reclaims once references drop).
      operator_delete_void_ptr(cur);
      // @0x4f1c8  movq %r14, %rdi — cur = next.
      cur = next;
      // @0x4f1cb..0x4f1ce  testq %r14,%r14 ; jne .LOOP — continue while next != NULL.
    } while (cur !== null);
  }

  // @0x4f1d0  rdi = *(this + 0x30) — pointer to the single owned buffer.
  const single: unknown = self.__single_at_0x30;
  // @0x4f1d4  movq $0x0, 0x30(%rbx) — clear the slot to NULL BEFORE the delete. This
  //   ordering is deliberate: if operator delete throws (or reenters), the slot no
  //   longer points at the freed block. We faithfully mirror the write ordering.
  self.__single_at_0x30 = null;
  // @0x4f1dc..0x4f1df  test rdi,rdi ; je 0x4f1ea — skip delete if slot was NULL.
  if (single !== null) {
    // @0x4f1e5  jmp __ZdlPv — tail-call operator delete(single). Boundary stub.
    operator_delete_void_ptr(single);
  }
  // @0x4f1e8/0x4f1ee  retq — return void.
}

/**
 * Node type for the intrusive singly-linked list rooted at
 * `all_iterator_t<OZRigBehavior,...>::__list_head_at_0x40`.
 *
 * The dtor observes only offset 0x0 (`next` pointer @0x4f1c0). Any payload
 * fields (the enclosed OZRigBehavior reference / validator state / etc.)
 * are laid out at higher offsets that this destructor does NOT read.
 */
export interface OZObject_all_iterator_t_OZRigBehavior_Node {
  /** @Ozone Node layout offset 0x0 (read @0x4f1c0 as `movq (%rdi), %r14`). */
  next: OZObject_all_iterator_t_OZRigBehavior_Node | null;
}

/**
 * TS shape of the iterator itself. The dtor observes offsets 0x30 and 0x40;
 * other fields (`begin`/`end`/`validator`/`elem` cursors — recovered from
 * OTHER template members not yet ported) will be filled in as those members
 * land. Only the offsets the dtor touches are named here.
 */
export interface OZObject_all_iterator_t_OZRigBehavior {
  /** @Ozone offset 0x30 (read @0x4f1d0, written @0x4f1d4). Single owned buffer. */
  __single_at_0x30: unknown | null;
  /** @Ozone offset 0x40 (read @0x4f1aa). Head of the intrusive Node linked list. */
  __list_head_at_0x40: OZObject_all_iterator_t_OZRigBehavior_Node | null;

  /**
   * The template parameter binds the iterator's dereference type. It is NOT
   * touched by the dtor; the field is declared here purely so the TS type
   * carries the concrete instantiation (matching the mangled name).
   */
  __ozrigbehavior_element_type?: OZRigBehavior;
}
