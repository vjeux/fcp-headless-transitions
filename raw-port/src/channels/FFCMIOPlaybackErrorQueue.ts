// FFCMIOPlaybackErrorQueue — Flexo intrusive doubly-linked-list queue of
// heap-allocated error records used by the CMIO playback path. The class's
// only two exported symbols are the Itanium-ABI destructor pair D0 (deleting)
// and D1 (base-object); no ctor is exported (either inlined by the compiler
// or provided as a default-constructor that zeros the head node — the fact
// that both dtors early-out on `size==0` implies a default-constructed
// (empty) instance is a valid initial state and requires no work to destroy).
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   raw-port/re/disasm/Flexo.FFCMIOPlaybackErrorQueue.~FFCMIOPlaybackErrorQueue.s
//     — this file holds D0Ev @0xd30010 (the deleting dtor).
//   D1 body @0xd2ffb0 was extracted directly from otool -tV of Flexo (same
//     framework/binary) — its byte-for-byte identical to D0 with the trailing
//     `jmp __ZdlPv` (operator delete on `this`) stripped. That is exactly the
//     standard C++ Itanium-ABI D1/D0 relationship: D1 destroys sub-objects,
//     D0 == D1 + deallocate.
// Framework: Final Cut Pro / Flexo.framework (arch x86_64).
//
// DECODE — struct layout of FFCMIOPlaybackErrorQueue (recovered from the two
// destructors; every field read is at a fixed offset with a self-consistent
// meaning that matches libc++'s std::list<T>::__end_ / __size_ layout):
//
//   +0x00  vtable ptr / vtable slot for the outer class (never read here — the
//          dtors take `this` as `rdi` and never dereference *(rdi); consistent
//          with a class that either has no virtuals or whose dtor is the vtable
//          slot itself so the slot is not re-read inside the body).
//   +0x08  Node* head_next   // "next" link of the embedded head/sentinel
//                            // node. When the queue is empty this points at
//                            // &head_next itself (i.e. `this+0x08`), producing
//                            // the circular self-loop used below in the splice.
//                            // The dtor loads it @0xd2ffc2 / @0xd30028 as
//                            //   `movq 0x8(%rdi), %rax`.
//   +0x10  Node* head_prev   // "prev" link of the sentinel — the address of
//                            // the LAST real node (or of the sentinel when
//                            // empty). Loaded @0xd2ffc9 / @0xd3002c as
//                            //   `movq 0x10(%rdi), %rdi`.
//   +0x18  uintptr_t size    // element count. Guarded first thing in each dtor
//                            //   `cmpq $0x0, 0x18(%rdi)` @0xd2ffb0/@0xd3001d.
//                            // Zeroed near the end via
//                            //   `movq $0x0, 0x18(%rbx)` @0xd2ffdb/@0xd3003e.
//
// sizeof(FFCMIOPlaybackErrorQueue) is at least 0x20 bytes (the fields at
// 0x08/0x10/0x18 are all read). It matches libc++'s
//   template<class T> class list {
//     __list_node_base __end_;   // { next, prev } at +0x08 / +0x10
//     size_type        __size_;  //             at +0x18
//   };
// with an additional vtable/parent slot at +0x00. Nothing else about the class
// is observable from these two functions.
//
// NODE layout (a heap-allocated `__list_node<T>`), recovered from the delete
// loop `%r14 = 0x8(%rdi); operator delete(%rdi); %rdi = %r14; while %rdi != &sentinel`:
//   +0x00  Node* next   // (unused by these dtors — only read on the sentinel)
//   +0x08  Node* prev   // walked backwards from the tail node to the sentinel.
//                       // Loaded @0xd2fff0 / @0xd30050 as `movq 0x8(%rdi), %r14`.
//   +0x10  T value      // opaque payload (the "playback error" record). Not
//                       // touched by ~FFCMIOPlaybackErrorQueue — libc++ inlines
//                       // T's dtor here only when T is non-trivial; the absence
//                       // of any per-node call before the operator-delete means
//                       // the queue's element type has a TRIVIAL destructor
//                       // (e.g. a POD struct or a raw OSStatus + timestamp).
//
// Runtime imports:
//   __ZdlPv (operator delete(void*))  @Flexo 0x1497404 (__stubs entry)
//     — resolved via `raw-port/army/tools/resolve.py Flexo stub 0x1497404`.
//     Called once per node in the free loop (@0xd2fff4 / @0xd30054) and, for
//     D0 only, once more as a tail-call on `this` itself (@0xd3006e).
//
// The two dtors mirror the same body; the only difference is D0's tail
// `jmp __ZdlPv` on `this`. We factor the shared work into a private helper.

/**
 * Opaque payload type of one queue element. The dtors never touch node+0x10, so
 * we cannot recover T's fields from these two functions; a downstream call
 * site (enqueue/dequeue) will demand a real type here later.
 */
export type FFCMIOPlaybackError = object;

/**
 * Intrusive doubly-linked-list node the queue stores. Only `prev` is read by
 * the destructors (they walk the list backwards from tail to sentinel via
 * `prev`); `next` is read only on the sentinel during the splice.
 * See NODE layout note above for the address citations.
 */
interface Node {
  /** node+0x00 — forward link. Read on the sentinel @0xd2ffd8 / @0xd3003b. */
  next: Node;
  /** node+0x08 — backward link. Walked @0xd2fff0 / @0xd30050 in the free loop. */
  prev: Node;
  /** node+0x10 — payload. Never accessed by ~FFCMIOPlaybackErrorQueue. */
  value: FFCMIOPlaybackError;
}

/**
 * `__ZdlPv` — global `operator delete(void*)` from libc++abi, invoked via the
 * Flexo `__stubs` entry at @Flexo 0x1497404 (resolved to `__ZdlPv` — see
 * top-of-file citation). This is the runtime deallocator; we model it as a
 * throw here because raw-port/ has no libc heap of its own — a real host must
 * inject a deleter, and any code path that reaches the empty-body dtor with a
 * non-empty queue would need this. In practice the dtors of an empty queue
 * (size==0) never reach this stub, matching the disassembly's guard.
 */
function operator_delete(_p: Node): void {
  throw new Error(
    "FFCMIOPlaybackErrorQueue: operator delete(void*) (__ZdlPv) not " +
      "yet transcribed @Flexo 0x1497404 (called from ~FFCMIOPlaybackErrorQueue " +
      "free loop @0xd2fff4 / @0xd30054, and from D0 tail-call @0xd3006e)"
  );
}

/**
 * FFCMIOPlaybackErrorQueue — see file header for the full struct layout and
 * disassembly citations. Only the destructor pair is exported by Flexo, so
 * this class is intentionally opaque: consumers construct an empty queue
 * (all fields default-initialised so that head_next == head_prev == &sentinel
 * and size == 0, matching the empty-queue invariant used by the dtors' guard)
 * and rely on future ports to wire enqueue/dequeue.
 */
export class FFCMIOPlaybackErrorQueue {
  /**
   * +0x08 / +0x10 combined — the embedded sentinel head node. In FCP's C++
   * this is a `__list_node_base { next; prev; }` embedded inside the queue at
   * offset 0x08; we model it as a proper Node here (whose `value` is never
   * read on the sentinel — the dtors never touch node+0x10) and initialise
   * its links to self, which is the empty-list invariant a default C++
   * constructor produces.
   */
  private sentinel: Node;

  /** +0x18 — element count. Guarded first-thing by both dtors. */
  private size_: number;

  constructor() {
    // Default-construct: the disassembly proves an empty queue must satisfy
    // size==0 (@0xd2ffb0 guard) and have a circular sentinel that the splice
    // in the dtor (@0xd2ffdb: `sentinel->prev->next = sentinel->next; ...`)
    // can no-op over — both of which require next==prev==self.
    // FCP's ctor for this class is not exported; the standard libc++
    // std::list default ctor produces exactly this state so we mirror it.
    const s: Node = { next: null as unknown as Node, prev: null as unknown as Node, value: {} };
    s.next = s;
    s.prev = s;
    this.sentinel = s;
    this.size_ = 0;
  }

  /**
   * The shared destructor body — D1 (base-object) at @Flexo 0xd2ffb0 and D0
   * (deleting) at @Flexo 0xd30010 are byte-identical up to D0's trailing
   * `jmp __ZdlPv` (operator delete on `this`). We transcribe the shared body
   * once; the deleting variant would be `destroy(); operator_delete(this)`.
   *
   * Control flow (both dtors, cited by D1's addresses; D0's are shifted by
   * ~+0x60 and cited inline where they differ):
   *
   *   @0xd2ffb0  if (this->size_ == 0) return;                    // early exit
   *   @0xd2ffbe  rbx = &this->sentinel               (this+0x08)  // "sentinel addr"
   *   @0xd2ffc2  rax = this->sentinel.next          (head_next)
   *   @0xd2ffc9  rdi = this->sentinel.prev          (head_prev, i.e. tail node)
   *   @0xd2ffcd  rax = head_next->prev                            // = sentinel
   *   @0xd2ffd1  rdx = tail->next                                 // = sentinel
   *   @0xd2ffd4  tail->next->prev = head_next->prev               // sentinel.prev = sentinel
   *   @0xd2ffd8  head_next->prev->next = tail->next               // sentinel.next = sentinel
   *   @0xd2ffdb  this->size_ = 0
   *   @0xd2ffe3  if (rdi == &sentinel) return;                    // was already empty in shape
   *   @0xd2fff0  loop: r14 = rdi->prev
   *   @0xd2fff4        operator delete(rdi)
   *   @0xd2fff9        rdi = r14
   *   @0xd2fffc        if (r14 != &sentinel) goto loop
   *   @0xd30001  return   (D1);   OR   D0: jmp __ZdlPv(this) @0xd3006e
   */
  destroy(): void {
    // @0xd2ffb0 / @0xd3001d — guard on size==0. This is what makes a
    // default-constructed empty queue a zero-cost dtor.
    if (this.size_ === 0) return;

    // @0xd2ffbe — rbx = &sentinel (used only as the loop's terminator).
    const sentinel = this.sentinel;

    // @0xd2ffc2 — first real node (head_next); == sentinel iff list empty.
    const head_next = sentinel.next;
    // @0xd2ffc9 — last real node (head_prev); walking starts here.
    let cur = sentinel.prev;

    // @0xd2ffcd / @0xd2ffd1 — read head_next->prev and tail->next (both are
    // the sentinel by the doubly-linked-list invariant, but the machine reads
    // them anyway; we mirror the loads faithfully).
    const head_next_prev = head_next.prev;
    const tail_next = cur.next;

    // @0xd2ffd4 — tail->next->prev = head_next->prev
    //   ==> sentinel.prev = sentinel   (self-loop the sentinel)
    tail_next.prev = head_next_prev;
    // @0xd2ffd8 — head_next->prev->next = tail->next
    //   ==> sentinel.next = sentinel
    head_next_prev.next = tail_next;

    // @0xd2ffdb — size_ = 0
    this.size_ = 0;

    // @0xd2ffe3 — if the queue's tail was already the sentinel (shape-empty
    // despite size!=0, which can't happen from public API but the machine
    // guards it anyway), we're done.
    if (cur === sentinel) return;

    // @0xd2fff0..@0xd2fffc — walk `prev` links from tail to sentinel, freeing
    // each real node. `r14` in the disasm is the saved `cur->prev` used as
    // the next iteration's `rdi`.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const prev = cur.prev;              // @0xd2fff0: r14 = 0x8(%rdi)
      operator_delete(cur);               // @0xd2fff4: callq __ZdlPv
      cur = prev;                          // @0xd2fff9: %rdi = %r14
      if (cur === sentinel) break;         // @0xd2fffc: cmp %rbx,%r14 ; jne loop
    }
    // Fall-through @0xd30001 in D1, or @0xd30061 in D0 (which continues into
    // the trailing `jmp __ZdlPv` on `this` — that's the caller's problem
    // when this class is heap-allocated with `new`).
  }
}
