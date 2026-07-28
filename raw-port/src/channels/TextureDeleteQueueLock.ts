// TextureDeleteQueueLock.ts — Helium's tiny RAII scope guard that locks a
// `TextureDeleteQueue`'s pthread_mutex on construction and unlocks it on
// destruction. Straight C++ RAII, one ivar.
//
// Object layout (from disasm, native x86_64 pointer size):
//   this + 0x00 : TextureDeleteQueue* queue_    (the queue this guard locks)
//
// Layout of the pointed-to TextureDeleteQueue (only offset we touch):
//   queue_ + 0x50 : opaque — returned by getQueue() as an offset pointer.
//                   getQueue() returns  ((char*)queue_) + 0x50, NOT a load
//                   through queue_. This looks like a pointer to a
//                   sub-object embedded at +0x50 within TextureDeleteQueue
//                   (getQueue's caller then treats the returned address as
//                   the queue's "public" work-item ring / interior view).
//                   We reproduce the exact pointer arithmetic; we don't
//                   attempt to reinterpret the destination structure here.
//   queue_ + 0x80 : pthread_mutex_t mutex  (the mutex the ctor locks and
//                   the dtor unlocks — target of pthread_mutex_lock /
//                   pthread_mutex_unlock).
//
// Transcribed from FCP Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Bodies read directly from /tmp/Helium_tV.txt (otool -tV, x86_64 slice)
// at lines 71669 (C2), 71677 (D2), 71688 (D1), 71706 (getQueue) — the
// per-symbol otool boundary label was missing (disasm.sh reported the
// 0-line/ICF-folded warning) so we transcribed straight from the linear
// dump. The claim brief listed a fifth method `queue()` @0x43e00, but the
// linear dump shows that address is __ZNK7HGStats17RendererStatsImpl5countEv
// (HGStats::RendererStatsImpl::count) — NOT part of this class. Ignored.
//
// ─── C2 @Helium 0x43da0  __ZN22TextureDeleteQueueLockC2EP18TextureDeleteQueue ─
//   Signature: TextureDeleteQueueLock(TextureDeleteQueue* queue)
//   Arguments (System V AMD64):
//     %rdi = this   (TextureDeleteQueueLock*)
//     %rsi = queue  (TextureDeleteQueue*)
//
//   0x43da0  pushq %rbp
//   0x43da1  movq  %rsp, %rbp
//   0x43da4  movq  %rsi, (%rdi)            ; this->queue_ = queue
//   0x43da7  leaq  0x80(%rsi), %rdi        ; %rdi = &queue->[+0x80]  (the mutex)
//   0x43dae  popq  %rbp
//   0x43daf  jmp   0x3c556a                ; TAIL pthread_mutex_lock(&queue->mutex)
//                                          ; symbol stub for _pthread_mutex_lock
//
// C1 is not emitted separately in this build (only the C2 base-object ctor
// exists in the linear dump). Callers that would use C1 fold to C2 — same
// body, no virtual bases in this class.
//
// ─── D2 @Helium 0x43dc0  __ZN22TextureDeleteQueueLockD2Ev ────────────────────
// ─── D1 @Helium 0x43de0  __ZN22TextureDeleteQueueLockD1Ev ────────────────────
//   Both destructors are byte-identical (same 6 instructions, same target):
//     0x43dc0/0x43de0  pushq %rbp
//                      movq  %rsp, %rbp
//                      movq  (%rdi), %rdi        ; %rdi = this->queue_
//                      subq  $-0x80, %rdi        ; %rdi = queue_ + 0x80  (the mutex)
//                                                ; NB: `sub $-0x80` == `add $0x80` (8-bit
//                                                ; sign-extended immediate; +128 doesn't fit
//                                                ; the signed 8-bit range but −128 does, so
//                                                ; the encoder emits `sub -128` which is
//                                                ; numerically identical to `add +128`)
//                      callq 0x3c5570            ; pthread_mutex_unlock(&queue->mutex)
//                      popq  %rbp
//                      retq
//     +0x12  movq  %rax, %rdi
//     +0x15  callq ___clang_call_terminate       ; landing-pad for the unlock call
//                                                ; (unreachable in normal control flow;
//                                                ;  only taken if pthread_mutex_unlock
//                                                ;  throws — it doesn't, so this is dead
//                                                ;  code we don't model in TS)
//
// ─── getQueue()  @Helium 0x43e10  __ZNK22TextureDeleteQueueLock8getQueueEv ───
//   Signature: TextureDeleteQueue* getQueue() const
//   0x43e10  pushq %rbp
//   0x43e11  movq  %rsp, %rbp
//   0x43e14  movq  (%rdi), %rax             ; %rax = this->queue_
//   0x43e17  addq  $0x50, %rax              ; %rax = queue_ + 0x50
//   0x43e1b  popq  %rbp
//   0x43e1c  retq
//   Returns a byte-offset pointer (queue_ + 0x50), NOT this->queue_. This
//   is faithful pointer arithmetic — the returned address falls INSIDE the
//   TextureDeleteQueue object at +0x50, and callers treat it as an
//   interior view of the queue. See note above under object layout.
//
// This class has no virtual functions (no vtable slot loads anywhere in
// the four bodies) and no other data members beyond the single queue_
// pointer at +0x00.

/**
 * Opaque handle to a Helium `TextureDeleteQueue`. The queue's private
 * layout is not decoded here; TextureDeleteQueueLock only needs the queue
 * pointer to (a) store it, (b) locate the `pthread_mutex_t` at offset
 * +0x80 within it for lock/unlock, and (c) form the +0x50 interior view
 * that getQueue() exposes.
 *
 * @see Helium 0x43da0 (ctor uses it), 0x43dc0/0x43de0 (dtor unlocks it),
 *      0x43e10 (getQueue() returns queue_+0x50).
 */
export interface TextureDeleteQueue {
  /**
   * The `pthread_mutex_t` embedded at offset +0x80 inside the queue.
   * TextureDeleteQueueLock's ctor locks this and its dtor unlocks it.
   * @see Helium 0x43da7  (leaq 0x80(%rsi), %rdi → pthread_mutex_lock)
   * @see Helium 0x43dc7  (movq (%rdi), %rdi ; subq $-0x80, %rdi → pthread_mutex_unlock)
   */
  readonly mutexAtPlus0x80: PthreadMutex;

  /**
   * Placeholder for whatever sub-object begins at offset +0x50 inside the
   * queue. getQueue() returns a pointer that lands here — the caller then
   * uses it as an interior view of the queue. Fully decoding this view
   * requires porting `TextureDeleteQueue` itself; kept opaque here so
   * getQueue()'s pointer arithmetic remains meaningful without inventing
   * a layout.
   * @see Helium 0x43e17  (addq $0x50, %rax  →  queue_ + 0x50)
   */
  readonly interiorAtPlus0x50: TextureDeleteQueueInteriorView;
}

/**
 * Opaque pthread mutex handle. In native FCP this is a real
 * `pthread_mutex_t` embedded inside the queue at +0x80. We model it as an
 * opaque brand: the ctor/dtor call `lock()`/`unlock()` on it. Actual
 * pthread bindings are not part of this file — the mutex behaviour lives
 * with whoever owns the TextureDeleteQueue.
 *
 * @see Helium 0x43daf  callq _pthread_mutex_lock @stub 0x3c556a
 * @see Helium 0x43dcb  callq _pthread_mutex_unlock @stub 0x3c5570
 */
export interface PthreadMutex {
  /** Native: pthread_mutex_lock(this). @see Helium 0x3c556a (stub). */
  lock(): void;
  /** Native: pthread_mutex_unlock(this). @see Helium 0x3c5570 (stub). */
  unlock(): void;
}

/**
 * Opaque type for the pointer returned by `getQueue()` — the interior
 * view at queue_+0x50. Not decoded here (see note in @see Helium 0x43e10
 * transcription above).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextureDeleteQueueInteriorView {}

/**
 * RAII scope guard that locks a `TextureDeleteQueue`'s mutex on
 * construction and unlocks it on destruction. Single-member class:
 *
 *   struct TextureDeleteQueueLock {
 *     TextureDeleteQueue* queue_;   // +0x00
 *   };
 *
 * The lifetime discipline in C++ is deterministic (dtor runs at scope
 * exit). In TypeScript we don't have deterministic dtors, so callers must
 * invoke {@link destroy} explicitly at scope exit — or, preferably, use
 * {@link withTextureDeleteQueueLock} which mirrors the C++ scope for you.
 *
 * @see Helium 0x43da0  TextureDeleteQueueLock::TextureDeleteQueueLock(TextureDeleteQueue*)
 * @see Helium 0x43dc0  TextureDeleteQueueLock::~TextureDeleteQueueLock  (D2)
 * @see Helium 0x43de0  TextureDeleteQueueLock::~TextureDeleteQueueLock  (D1)
 * @see Helium 0x43e10  TextureDeleteQueueLock::getQueue() const
 */
export class TextureDeleteQueueLock {
  /**
   * `this + 0x00`: the queue whose mutex we hold. Populated by the ctor,
   * read by the dtor (for unlock) and by getQueue() (for the +0x50 view).
   */
  private readonly queue_: TextureDeleteQueue;

  /**
   * Reproduces C2 @Helium 0x43da0.
   *
   * Native body (5 instructions, tail-calls pthread_mutex_lock):
   *   this->queue_ = queue;                          // 0x43da4
   *   pthread_mutex_lock(&queue->[+0x80]);           // 0x43da7 leaq + 0x43daf jmp
   *
   * @see Helium 0x43da0
   * @see Helium 0x3c556a  _pthread_mutex_lock stub
   */
  constructor(queue: TextureDeleteQueue) {
    // 0x43da4  movq %rsi, (%rdi)  — store queue at this+0x00
    this.queue_ = queue;
    // 0x43da7  leaq 0x80(%rsi), %rdi  ;  0x43daf  jmp _pthread_mutex_lock
    // The lea+tail-jmp is a tail-call: the mutex address is passed as the
    // first (and only) argument to pthread_mutex_lock. In TS we express
    // that by invoking `.lock()` on the mutex handle at +0x80.
    queue.mutexAtPlus0x80.lock();
  }

  /**
   * Reproduces D1/D2 @Helium 0x43de0 / 0x43dc0. Both destructor variants
   * are byte-identical (same 6-instruction body, same unlock stub).
   *
   * Native body:
   *   pthread_mutex_unlock(&this->queue_->[+0x80]);  // 0x43dcb / 0x43deb
   *
   * The landing-pad at +0x12 (`movq %rax,%rdi ; callq ___clang_call_terminate`)
   * is dead in normal flow (pthread_mutex_unlock doesn't throw) and is
   * not modelled here — a clang-generated safety net for the impossible
   * unwind case.
   *
   * @see Helium 0x43dc0  D2
   * @see Helium 0x43de0  D1
   * @see Helium 0x3c5570  _pthread_mutex_unlock stub
   */
  destroy(): void {
    // 0x43dc4/0x43de4  movq (%rdi), %rdi   →  load this->queue_
    // 0x43dc7/0x43de7  subq $-0x80, %rdi   →  add +0x80 (mutex address)
    // 0x43dcb/0x43deb  callq _pthread_mutex_unlock
    this.queue_.mutexAtPlus0x80.unlock();
  }

  /**
   * Reproduces getQueue() @Helium 0x43e10.
   *
   * Native body:
   *   %rax = this->queue_;                           // 0x43e14
   *   %rax = %rax + 0x50;                            // 0x43e17
   *   return %rax;                                   // 0x43e1c
   *
   * NB: this does NOT return `this->queue_` — it returns
   * `((char*)this->queue_) + 0x50`, an interior pointer into the queue.
   *
   * @see Helium 0x43e10
   */
  getQueue(): TextureDeleteQueueInteriorView {
    // 0x43e14 movq (%rdi),%rax  ; 0x43e17 addq $0x50,%rax
    return this.queue_.interiorAtPlus0x50;
  }
}

/**
 * Convenience wrapper reproducing the C++ RAII scope semantics: locks,
 * runs `body`, unlocks even on exception. Mirrors the typical native use
 * `{ TextureDeleteQueueLock lock(queue); ... }`.
 *
 * @see Helium 0x43da0  ctor (lock)
 * @see Helium 0x43dc0  dtor (unlock)
 */
export function withTextureDeleteQueueLock<R>(
  queue: TextureDeleteQueue,
  body: (guard: TextureDeleteQueueLock) => R,
): R {
  const guard = new TextureDeleteQueueLock(queue);
  try {
    return body(guard);
  } finally {
    guard.destroy();
  }
}
