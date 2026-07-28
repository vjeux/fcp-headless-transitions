// raw-port: FFCMIOPlaybackTimingInfoQueue — Flexo framework (channels layer)
//
// A minimal std::list<T> holder — only its two destructors are in the
// public surface (D1 and D0). Both walk an embedded doubly-linked
// list and free every node via `operator delete`.
//
// The class's OWN data (besides the list) isn't accessed by either
// dtor — there is no vptr write, no other members. So the whole port
// is: "destroy an embedded std::list-of-something".
//
// Public surface (2 methods):
//   0x00d2fcc0  FFCMIOPlaybackTimingInfoQueue::~FFCMIOPlaybackTimingInfoQueue()  (D1)
//   0x00d2fd20  FFCMIOPlaybackTimingInfoQueue::~FFCMIOPlaybackTimingInfoQueue()  (D0, deleting)
//
// LAYOUT (from D1/D0)
// -------------------
//     +0x00 : (unread by dtors — likely vptr, since a sibling class
//              FFCMIOPlaybackTimestampQueue directly following at
//              @0x00d2fd90 installs one at its own +0x00 via a rip-rel
//              vtable_for_FFLocklessQueueBase; we DON'T write the vptr
//              here in the JS port because the asm doesn't observe it)
//     +0x08 : sentinel.next  (list head; when empty, points to &this+0x8)
//     +0x10 : sentinel.prev  (list tail; when empty, points to &this+0x8)
//     +0x18 : size (uint64)  (0 iff list is empty — the fast-path guard)
//
// NODE LAYOUT (from the delete loop — @0xd2fd00..@0xd2fd0f)
//     +0x00 : prev pointer  (walked at 0xd2fce1 via `movq (%rdi),%rdx`)
//     +0x08 : next pointer  (walked at 0xd2fd00 via `movq 0x8(%rdi),%r14`)
//     +0x10 : payload (a "playback timing info" struct — undecoded here;
//              size irrelevant because we call `operator delete` which
//              takes just the pointer)
//
// The payload TYPE isn't decoded from these two dtors — no vfns are
// called on it, and the deallocator is `__ZdlPv` (operator delete(void*)),
// which is size-oblivious. In a real port, callers who need to enqueue/
// pop would supply the payload T; here we type it as opaque.
//
// FRONTIER
// --------
//   __ZdlPv                    @stub _CFRelease-of-nothing;
//                              JS has GC, so we do nothing when the
//                              asm calls operator delete on a node.

/**
 * A payload of the queue — opaque here; the two dtors never inspect it.
 */
export type FFCMIOPlaybackTimingInfo = { readonly __brand: "FFCMIOPlaybackTimingInfo" };

/**
 * One node of the embedded intrusive doubly-linked list.
 *
 *   +0x00 prev — points at another node OR at the queue's sentinel slot
 *                (which lives inside the queue struct at &q + 0x08)
 *   +0x08 next
 *   +0x10 data
 */
interface FFCMIOPlaybackTimingInfoNode {
  prev: FFCMIOPlaybackTimingInfoNode | { __sentinelOf: FFCMIOPlaybackTimingInfoQueue };
  next: FFCMIOPlaybackTimingInfoNode | { __sentinelOf: FFCMIOPlaybackTimingInfoQueue };
  data: FFCMIOPlaybackTimingInfo;
}

/**
 * FFCMIOPlaybackTimingInfoQueue — a std::list<FFCMIOPlaybackTimingInfo>
 * where the list sentinel is embedded in the queue struct itself (the
 * standard libc++ end-iterator layout).
 */
export class FFCMIOPlaybackTimingInfoQueue {
  /**
   * Sentinel of the intrusive linked list. When the list is empty,
   *   sentinelNext === sentinelPrev === this   (the queue itself acts
   * as the sentinel node; libc++ stores its {prev, next} at offsets
   * [+0x8, +0x10]).
   *
   *   ctor placement — @0x00d2fcd2  `movq 0x8(%rdi),%rax` reads it
   *   ctor placement — @0x00d2fcd9  `movq 0x10(%rdi),%rdi` reads it
   */
  private sentinelNext: FFCMIOPlaybackTimingInfoNode | null = null;
  private sentinelPrev: FFCMIOPlaybackTimingInfoNode | null = null;

  /**
   * Count of entries in the list.
   *   accessed — @0x00d2fcc0  `cmpq $0, 0x18(%rdi)` (fast-path guard in D1)
   *   accessed — @0x00d2fd2d  `cmpq $0, 0x18(%rdi)` (same in D0)
   *   written  — @0x00d2fceb / @0x00d2fd4e (cleared to 0 mid-dtor)
   */
  private size: number = 0;

  /**
   * FFCMIOPlaybackTimingInfoQueue::~FFCMIOPlaybackTimingInfoQueue()
   *   @0x00d2fcc0  (D1, base non-deleting)
   *
   * Faithful asm mirror:
   *
   *   @0xd2fcc0  cmpq $0, 0x18(%rdi)           ; if size == 0
   *   @0xd2fcc5  je   0xd2fd15                  ;   return immediately
   *
   *   ; prologue for the non-empty path
   *   @0xd2fcc7  pushq %rbp; movq %rsp,%rbp
   *   @0xd2fccb  pushq %r14; pushq %rbx
   *
   *   ; splice-the-sentinel-out step (libc++ std::list dtor pattern):
   *   ; disconnect the queue's own sentinel slot from the ring, so
   *   ; the subsequent "walk-and-delete" loop terminates when it
   *   ; comes back around to it.
   *   @0xd2fcce  leaq  0x8(%rdi), %rbx         ; rbx = &this[+0x8]  (the sentinel)
   *   @0xd2fcd2  movq  0x8(%rdi), %rax         ; rax = head (first real node)
   *   @0xd2fcd6  movq  %rdi, %rcx              ; rcx = this
   *   @0xd2fcd9  movq  0x10(%rdi), %rdi        ; rdi = tail (last real node)
   *   @0xd2fcdd  movq  0x8(%rax), %rax         ; rax = head.next
   *   @0xd2fce1  movq  (%rdi), %rdx            ; rdx = tail.prev
   *   @0xd2fce4  movq  %rax, 0x8(%rdx)         ; tail.prev.next = head.next
   *   @0xd2fce8  movq  %rdx, (%rax)            ; head.next.prev  = tail.prev
   *   @0xd2fceb  movq  $0, 0x18(%rcx)          ; size = 0
   *
   *   ; if the ring is now empty (rdi==&sentinel), skip the delete loop
   *   @0xd2fcf3  cmpq  %rbx, %rdi
   *   @0xd2fcf6  je    0xd2fd11
   *
   *   ; walk-and-delete loop:
   *   @0xd2fd00  movq  0x8(%rdi), %r14         ; r14 = current.next
   *   @0xd2fd04  callq __ZdlPv                  ; operator delete(current)
   *   @0xd2fd09  movq  %r14, %rdi
   *   @0xd2fd0c  cmpq  %rbx, %r14              ; keep going until we hit sentinel
   *   @0xd2fd0f  jne   0xd2fd00
   *
   *   @0xd2fd11  popq %rbx; popq %r14; popq %rbp; ret
   *
   * NB: the sentinel-splice steps at @0xd2fcdd..@0xd2fce8 don't need
   * to make the ring "correct" — they just relink so the walk-and-
   * delete loop terminates on `&sentinel`. In JS we don't need this
   * dance at all: we just walk from head, drop references, and let GC
   * reclaim the nodes. But the faithful transcription preserves the
   * observable state (size := 0; forward-walk deletion; empty on exit).
   */
  destroy(): void {
    // @0xd2fcc0..0xd2fcc5 — empty fast-path.
    if (this.size === 0) {
      return;
    }

    // @0xd2fcd2 — save `head` before the size-clear (the asm uses it
    // to relink the ring; in JS the relink is a no-op because our
    // sentinel-pointers are the head/tail we're about to walk).
    let cur = this.sentinelNext;

    // @0xd2fceb — publish size=0 mid-dtor, matching the asm's ordering.
    // (Observable: if a concurrent reader saw the queue during the dtor,
    // it would see size=0 BEFORE all nodes are actually freed. Faithful.)
    this.size = 0;
    this.sentinelNext = null;
    this.sentinelPrev = null;

    // @0xd2fcf3..@0xd2fd0f — walk-and-delete loop.
    // We terminate when cur is null (== equivalent-to-hitting-sentinel).
    // The asm calls operator delete; in JS GC handles it — we just drop.
    while (cur !== null) {
      const next: FFCMIOPlaybackTimingInfoNode | null =
        // The asm reads +0x8 (next). If it's the sentinel address
        // (rbx = &this+0x8), we stop. In JS we represent that as null.
        (cur.next as { __sentinelOf?: FFCMIOPlaybackTimingInfoQueue }).__sentinelOf ===
        this
          ? null
          : (cur.next as FFCMIOPlaybackTimingInfoNode);

      // @0xd2fd04 — operator delete(cur). No-op in JS (GC).

      cur = next;
    }
  }

  /**
   * FFCMIOPlaybackTimingInfoQueue::~FFCMIOPlaybackTimingInfoQueue()
   *   @0x00d2fd20  (D0, deleting)
   *
   * Faithful asm mirror — same body as D1 with two differences:
   *   (1) The `rbx = this` register is saved up front (rather than
   *       &this+0x8), and the sentinel address is materialized in %r14.
   *   (2) After the walk, a tail-jump to `__ZdlPv` frees `this` itself.
   *
   * Register-map:
   *   @0xd2fd2a  movq %rdi,%rbx                ; rbx = this
   *   @0xd2fd2d  cmpq $0, 0x18(%rdi); je .skip ; empty fast-path
   *   @0xd2fd34  leaq 0x8(%rbx),%r14           ; r14 = &sentinel
   *   @0xd2fd38  movq 0x8(%rbx),%rax           ; rax = head
   *   @0xd2fd3c  movq 0x10(%rbx),%rdi          ; rdi = tail
   *   @0xd2fd40  movq 0x8(%rax),%rax           ; rax = head.next
   *   @0xd2fd44  movq (%rdi),%rcx              ; rcx = tail.prev
   *   @0xd2fd47  movq %rax, 0x8(%rcx)          ; splice
   *   @0xd2fd4b  movq %rcx, (%rax)             ;   ...
   *   @0xd2fd4e  movq $0, 0x18(%rbx)           ; size = 0
   *   @0xd2fd56  cmpq %r14, %rdi
   *   @0xd2fd59  je   0xd2fd71                 ; skip walk if empty
   *   @0xd2fd60  movq 0x8(%rdi),%r15           ; r15 = current.next
   *   @0xd2fd64  callq __ZdlPv                  ; operator delete(current)
   *   @0xd2fd69  movq %r15,%rdi
   *   @0xd2fd6c  cmpq %r14,%r15
   *   @0xd2fd6f  jne  0xd2fd60
   *   .skip:
   *   @0xd2fd71  movq %rbx,%rdi
   *   ; epilogue + tail-jmp
   *   @0xd2fd7e  jmp __ZdlPv                    ; operator delete(this)
   */
  destroyAndDelete(): void {
    // The list-clearing body is identical to D1, so delegate.
    this.destroy();
    // @0xd2fd7e — tail-jmp to operator delete(this).
    // JS GC handles heap; the wrapper object becomes collectible when
    // no external references remain. Nothing else to do.
  }
}
