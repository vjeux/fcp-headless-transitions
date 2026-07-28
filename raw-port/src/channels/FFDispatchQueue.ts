// FFDispatchQueue.ts — Flexo's dispatch-queue wrapper (bounded-concurrency GCD queue).
// Faithful transcription from x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// -----------------------------------------------------------------------------
// SHAPE
// -----------------------------------------------------------------------------
// A tiny 32-byte object bundling three things:
//   +0x00 : dispatch_queue_t  serialQueue      (dispatch_queue_create result)
//   +0x08 : FFSemaphore       inlineSemaphore  (16 bytes — a counting semaphore
//                                               used to cap in-flight async work)
//   +0x18 : dispatch_queue_t  globalQueue      (dispatch_get_global_queue(qos,0))
//
// It exposes:
//   FFDispatchQueue(label, maxConcurrent, qos)   — ctor  @0x12ad260
//   ~FFDispatchQueue()                           — dtor  @0x12ad2d0
//   dispatchASync(void () block)                 — main entry point @0x12ad300
//
// Semantics observed from asm: `dispatchASync` FIRST waits on the semaphore
// (blocking on the CALLER's thread — this is a bounded producer), THEN
// dispatch_async's an inner block onto the GLOBAL queue that runs the user's
// block and finally signals the semaphore.  The `serialQueue` field is created
// but is NOT the target of the caller's dispatchASync — instead only the
// global queue receives work.  This means the object is really used as a
// "N-concurrent slot pool" hitched to a global queue, plus an owned serial
// queue that other code paths (e.g. -[FFDispatchQueueObject ...] or the C
// `FFDispatchQueueDispatchAsync` — see 0x12ad300 block_invoke below) can
// target for serialized ordering.  The block-invoke path (block_invoke @
// 0x12ad350) demonstrates this — it dispatches the SECOND enqueue onto
// `queue[+0x18]` (globalQueue) after waiting the semaphore, then signals in
// block_invoke_2 @ 0x12ad3c0.
//
// -----------------------------------------------------------------------------
// FFDispatchQueue::FFDispatchQueue(char const*, unsigned int, qos_class_t) @0x12ad260
// -----------------------------------------------------------------------------
// Disassembly (from /tmp/Flexo_tV.txt line 4635674):
//     pushq %rbp / movq %rsp,%rbp
//     pushq %r15 / pushq %r14 / pushq %rbx / pushq %rax          ; save + align
//     movl  %ecx, %r14d                                          ; r14d = qos_class
//     movq  %rsi, %r15                                           ; r15 = label
//     movq  %rdi, %rbx                                           ; rbx = this
//     addq  $0x8, %rdi                                           ; rdi = &this->sem
//     cmpl  $0x1, %edx / adcl $0x0, %edx / movl %edx, %esi       ; sem count = max(edx,1)
//     callq __ZN11FFSemaphoreC1Ei                                ; FFSemaphore(count)
//     movl  $0x1, %esi / xorl %edi, %edi
//     callq _dispatch_queue_attr_make_with_autorelease_frequency ; attr = default+AF=1
//     movq  %rax, %rdi
//     movl  %r14d, %esi / xorl %edx, %edx
//     callq _dispatch_queue_attr_make_with_qos_class             ; attr = qos-decorated
//     movq  %r15, %rdi / movq %rax, %rsi
//     callq _dispatch_queue_create                               ; new dispatch queue
//     movq  %rax, (%rbx)                                         ; this->serialQueue = q
//     movl  %r14d, %edi / xorl %esi, %esi
//     callq _dispatch_get_global_queue                           ; global(qos, 0)
//     movq  %rax, 0x18(%rbx)                                     ; this->globalQueue = g
//     ...pop / ret
//
// Note: `cmpl $1, edx ; adcl $0, edx` is the classic "max(edx,1)" idiom (if
// edx==0, adcl adds carry=1; else it adds 0). The semaphore's initial count is
// clamped up to a minimum of 1 so single-slot queues work.
//
// -----------------------------------------------------------------------------
// FFDispatchQueue::~FFDispatchQueue()  @0x12ad2d0
// -----------------------------------------------------------------------------
// Disassembly (from /tmp/Flexo_tV.txt line 4635711):
//     pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     movq  %rdi, %rbx
//     movq  (%rdi), %rdi                          ; rdi = this->serialQueue
//     callq _dispatch_release                     ; dispatch_release(serialQueue)
//     addq  $0x8, %rbx / movq %rbx, %rdi          ; rdi = &this->sem
//     addq  $0x8, %rsp / popq %rbx / popq %rbp
//     jmp   __ZN11FFSemaphoreD1Ev                 ; tail-call ~FFSemaphore
//
// The dtor releases the owned serialQueue and destroys the inline
// semaphore.  The `globalQueue` field is NOT released — dispatch_get_global_queue
// returns a shared singleton that doesn't need balancing.
//
// -----------------------------------------------------------------------------
// FFDispatchQueue::dispatchASync(void () block_pointer)  @0x12ad300
//   (also exported as C `_FFDispatchQueueDispatchAsync`)
// -----------------------------------------------------------------------------
// Disassembly (from /tmp/Flexo_tV.txt line 4635735):
//     pushq %rbp / movq %rsp,%rbp / subq $0x30,%rsp
//     movq  (%rdi), %rax                            ; rax = this->serialQueue
//     ; -- build first stack-allocated block (48 bytes) on the caller's frame:
//     movq  __NSConcreteStackBlock@GOTPCREL, %rcx
//     movq  %rcx, -0x30(%rbp)                        ; block.isa
//     movl  $0xc2000000, %ecx
//     movq  %rcx, -0x28(%rbp)                        ; block.flags|reserved  (BLOCK_HAS_COPY_DISPOSE=0? etc.)
//     leaq  block_invoke(%rip), %rcx
//     movq  %rcx, -0x20(%rbp)                        ; block.invoke = block_invoke @0x12ad350
//     leaq  ___block_descriptor_48_e8_32b_e5_v8?0l(%rip), %rcx
//     movq  %rcx, -0x18(%rbp)                        ; block.descriptor
//     movq  %rdi, -0x8(%rbp)                         ; block.captured[1] = this
//     movq  %rsi, -0x10(%rbp)                        ; block.captured[0] = user block ptr
//     leaq  -0x30(%rbp), %rsi
//     movq  %rax, %rdi                               ; rdi = serialQueue
//     callq _dispatch_async                          ; async onto serialQueue
//     ...pop/ret
//
// So the top-level dispatchASync ENQUEUES A TRAMPOLINE BLOCK onto the SERIAL
// queue.  That trampoline (block_invoke) runs SERIALIZED against the same
// FFDispatchQueue, and its job is:
//   1. `FFSemaphore::wait()` on &this->sem       (block bounded concurrency)
//   2. Build a second block that:
//        a. calls the user's captured block ptr (via block.invoke @0x10)
//        b. `FFSemaphore::signal()` afterwards
//   3. `dispatch_async(this->globalQueue, secondBlock)`.
//
// The result: outer serial-queue enforces FIFO ORDERING of *submissions*, and
// the semaphore enforces *concurrency* — up to N of the submitted user blocks
// can be running on the global queue at once.  When the pool is full, the
// serial queue's own worker BLOCKS on the semaphore, back-pressuring the
// producer.
//
// block_invoke  @0x12ad350   (runs on serialQueue)
// ------------------------------------------------------------
//     pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx / subq $0x30,%rsp
//     movq  %rdi, %rbx                              ; rbx = outer block
//     movq  0x28(%rdi), %r14                        ; r14 = this  (captured[1])
//     leaq  0x8(%r14), %rdi                         ; rdi = &this->sem
//     callq __ZN11FFSemaphore4waitEv                ; sem.wait()
//     movq  0x18(%r14), %rdi                        ; rdi = this->globalQueue
//     ; -- build inner block with capture[0]=this, capture[1]=user block --
//     movq  __NSConcreteStackBlock@GOTPCREL, %rax
//     movq  %rax, -0x40(%rbp)
//     movl  $0xc2000000, %eax
//     movq  %rax, -0x38(%rbp)
//     leaq  block_invoke_2(%rip), %rax
//     movq  %rax, -0x30(%rbp)                       ; invoke = block_invoke_2
//     leaq  ___block_descriptor_48_e8_32b_e5_v8?0l(%rip), %rax
//     movq  %rax, -0x28(%rbp)
//     movq  %r14, -0x18(%rbp)                       ; capture: this
//     movq  0x20(%rbx), %rax                        ; user block from outer block.captured[0]
//     movq  %rax, -0x20(%rbp)                       ; capture: user block
//     leaq  -0x40(%rbp), %rsi
//     callq _dispatch_async                         ; dispatch_async(globalQueue, inner)
//     ...pop/ret
//
// block_invoke_2  @0x12ad3c0   (runs on globalQueue)
// ------------------------------------------------------------
//     pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     movq  0x20(%rdi), %rax                        ; rax = user block
//     movq  0x28(%rdi), %rbx                        ; rbx = this
//     movq  %rax, %rdi
//     callq *0x10(%rax)                             ; user.block.invoke(user)
//     addq  $0x8, %rbx / movq %rbx, %rdi            ; rdi = &this->sem
//     ...pop
//     jmp   __ZN11FFSemaphore6signalEv              ; sem.signal() (tail-call)
//
// -----------------------------------------------------------------------------
// TypeScript port
// -----------------------------------------------------------------------------
// TS has no native GCD or Objective-C stack-block ABI.  We model the object
// with a shape faithful to the C++ semantics — the queue and semaphore are
// throw-stubs pointing at the underlying decoded primitives — and every
// method carries the @0xADDR provenance for the exact instruction it mirrors.
// A real runtime port would need an FFSemaphore implementation and a shim
// for _dispatch_async on top of a JS-side scheduler; those live outside this
// class and are cited as such.

/**
 * Opaque handle for a `dispatch_queue_t` created by GCD.
 *
 * The x86_64 disassembly calls `dispatch_queue_create` / `dispatch_get_global_queue`
 * (both symbol stubs @0x149768c / @0x149764a in Flexo).  These are Foundation
 * primitives that must be provided by the runtime host; there is no in-repo
 * decoded port yet.
 */
export type DispatchQueueHandle = { readonly __brand: "dispatch_queue_t" };

/**
 * A user "block" — the Objective-C stack-block ABI.  At the ABI level a block
 * pointer is a struct whose slot +0x10 is the `invoke` function pointer.
 * The compiled `block_invoke_2` reads that field verbatim
 * (`callq *0x10(%rax)` @0x12ad3d1) to run the user's code.
 *
 * In TS we represent it as a plain `() => void` callable; the "block-pointer"
 * detail is a target-runtime concern that the shim below (`dispatchAsync`)
 * must satisfy.
 */
export type UserBlock = () => void;

/**
 * FFSemaphore — Flexo's counting semaphore.  Not yet ported.  The ctor is
 * called from FFDispatchQueue's ctor @0x12ad27f (`FFSemaphore::FFSemaphore(int)`)
 * and its `wait()`/`signal()`/`~FFSemaphore()` are invoked from block_invoke,
 * block_invoke_2 and the dtor respectively.
 */
class FFSemaphoreStub {
  /** @asm __ZN11FFSemaphoreC1Ei — see FFDispatchQueue ctor @0x12ad27f */
  constructor(_count: number) {
    throw new Error(
      "FFSemaphore::FFSemaphore(int) @Flexo — not yet ported. " +
        "Required by FFDispatchQueue ctor @0x12ad27f.",
    );
  }
  /** @asm __ZN11FFSemaphore4waitEv — see block_invoke @0x12ad366 */
  wait(): void {
    throw new Error(
      "FFSemaphore::wait() @Flexo — not yet ported. " +
        "Required by FFDispatchQueue::dispatchASync block_invoke @0x12ad366.",
    );
  }
  /** @asm __ZN11FFSemaphore6signalEv — see block_invoke_2 @0x12ad3e1 */
  signal(): void {
    throw new Error(
      "FFSemaphore::signal() @Flexo — not yet ported. " +
        "Required by FFDispatchQueue::dispatchASync block_invoke_2 @0x12ad3e1.",
    );
  }
  /** @asm __ZN11FFSemaphoreD1Ev — see FFDispatchQueue dtor @0x12ad2ee */
  destroy(): void {
    throw new Error(
      "FFSemaphore::~FFSemaphore() @Flexo — not yet ported. " +
        "Required by FFDispatchQueue dtor @0x12ad2ee (tail-call).",
    );
  }
}

/**
 * Shim over libdispatch — throw-stubs cite the symbol stubs the native code
 * jumps to.  Any real port would fulfil these via the host runtime.
 */
function dispatch_queue_attr_make_with_autorelease_frequency(
  _attr: unknown,
  _freq: number,
): unknown {
  throw new Error(
    "_dispatch_queue_attr_make_with_autorelease_frequency (libdispatch) — " +
      "not shimmed. Called from FFDispatchQueue ctor @0x12ad28b.",
  );
}
function dispatch_queue_attr_make_with_qos_class(
  _attr: unknown,
  _qos: number,
  _relPri: number,
): unknown {
  throw new Error(
    "_dispatch_queue_attr_make_with_qos_class (libdispatch) — " +
      "not shimmed. Called from FFDispatchQueue ctor @0x12ad298.",
  );
}
function dispatch_queue_create(_label: string, _attr: unknown): DispatchQueueHandle {
  throw new Error(
    "_dispatch_queue_create (libdispatch) — not shimmed. " +
      "Called from FFDispatchQueue ctor @0x12ad2a3.",
  );
}
function dispatch_get_global_queue(_qos: number, _flags: number): DispatchQueueHandle {
  throw new Error(
    "_dispatch_get_global_queue (libdispatch) — not shimmed. " +
      "Called from FFDispatchQueue ctor @0x12ad2b0.",
  );
}
function dispatch_release(_q: DispatchQueueHandle): void {
  throw new Error(
    "_dispatch_release (libdispatch) — not shimmed. " +
      "Called from FFDispatchQueue dtor @0x12ad2dc.",
  );
}
function dispatch_async(_q: DispatchQueueHandle, _block: UserBlock): void {
  throw new Error(
    "_dispatch_async (libdispatch) — not shimmed. " +
      "Called from FFDispatchQueue::dispatchASync @0x12ad344 " +
      "and from block_invoke @0x12ad3a9.",
  );
}

/**
 * FFDispatchQueue — a bounded-concurrency GCD queue helper.
 *
 * Native layout (32 bytes total):
 *   +0x00  dispatch_queue_t   serialQueue    // owned, released in dtor
 *   +0x08  FFSemaphore        inlineSemaphore  // 16 bytes, inline subobject
 *   +0x18  dispatch_queue_t   globalQueue     // borrowed singleton (not released)
 *
 * @vtable  none (non-polymorphic — no `__ZTV` symbol emitted by Flexo)
 * @asm     ctor           @0x12ad260
 * @asm     dtor  (D1==D2) @0x12ad2d0
 * @asm     dispatchASync  @0x12ad300
 * @asm     block_invoke   @0x12ad350
 * @asm     block_invoke_2 @0x12ad3c0
 */
export class FFDispatchQueue {
  /** @native +0x00 : dispatch_queue_t (owned) */
  private serialQueue: DispatchQueueHandle;
  /** @native +0x08 : FFSemaphore (inline; 16 bytes) */
  private inlineSemaphore: FFSemaphoreStub;
  /** @native +0x18 : dispatch_queue_t (borrowed singleton) */
  private globalQueue: DispatchQueueHandle;

  /**
   * @asm FFDispatchQueue::FFDispatchQueue(char const*, unsigned int, qos_class_t) @0x12ad260
   *
   * Instruction-level transcription:
   *   - clamp `maxConcurrent` up to a minimum of 1 (the `cmpl $1;adcl $0` idiom @0x12ad27a);
   *   - construct the inline FFSemaphore at `this+0x8` with that count;
   *   - build a dispatch queue attribute:
   *       attr = dispatch_queue_attr_make_with_autorelease_frequency(NULL, DISPATCH_AUTORELEASE_FREQUENCY_WORK_ITEM=1)
   *       attr = dispatch_queue_attr_make_with_qos_class(attr, qos_class, 0);
   *   - `this->serialQueue = dispatch_queue_create(label, attr)`;
   *   - `this->globalQueue = dispatch_get_global_queue(qos_class, 0)`.
   */
  constructor(label: string, maxConcurrent: number, qosClass: number) {
    // Semaphore count = max(maxConcurrent, 1).  Exact idiom @0x12ad277-0x12ad27d:
    //   cmpl $1, edx  ;  adcl $0, edx           ; edx += (edx < 1 ? 1 : 0)
    const semCount = maxConcurrent < 1 ? maxConcurrent + 1 : maxConcurrent;

    // @0x12ad27f — FFSemaphore::FFSemaphore(int) at &this->sem (this+0x8)
    this.inlineSemaphore = new FFSemaphoreStub(semCount);

    // @0x12ad28b — dispatch_queue_attr_make_with_autorelease_frequency(NULL, 1)
    const attr0 = dispatch_queue_attr_make_with_autorelease_frequency(null, 1);
    // @0x12ad298 — dispatch_queue_attr_make_with_qos_class(attr, qosClass, 0)
    const attr1 = dispatch_queue_attr_make_with_qos_class(attr0, qosClass, 0);
    // @0x12ad2a3 — dispatch_queue_create(label, attr)
    this.serialQueue = dispatch_queue_create(label, attr1);
    // @0x12ad2b0 — dispatch_get_global_queue(qosClass, 0)
    this.globalQueue = dispatch_get_global_queue(qosClass, 0);
  }

  /**
   * @asm FFDispatchQueue::~FFDispatchQueue()  @0x12ad2d0  (D1 == D2 — same body)
   *
   *   dispatch_release(this->serialQueue);   // @0x12ad2dc
   *   ~FFSemaphore(&this->inlineSemaphore);  // tail-call @0x12ad2ee
   *   // globalQueue is not released — dispatch_get_global_queue is a shared singleton.
   */
  destroy(): void {
    // @0x12ad2dc — dispatch_release(this->serialQueue)
    dispatch_release(this.serialQueue);
    // @0x12ad2ee — tail-call ~FFSemaphore()
    this.inlineSemaphore.destroy();
  }

  /**
   * @asm FFDispatchQueue::dispatchASync(void () block_pointer)  @0x12ad300
   *
   * Enqueues a trampoline block onto `serialQueue`.  The trampoline
   * (block_invoke @0x12ad350) waits the semaphore, then dispatch_async's a
   * second block (block_invoke_2 @0x12ad3c0) onto `globalQueue` which invokes
   * the user's block via `*(block+0x10)` and then signals the semaphore.
   *
   * Overall protocol:  serial order-in  →  N-way concurrent execution  →
   * back-pressure via inlineSemaphore.
   */
  dispatchASync(userBlock: UserBlock): void {
    // Faithful mirror of the two-stage trampoline (@0x12ad308..@0x12ad344).
    // Instead of stack-allocating an Obj-C block (unavailable in JS), we
    // capture-by-closure and hand the compiler-equivalent function to the
    // (throw-stub) dispatch_async shim.
    const self = this;

    // Outer trampoline — runs on serialQueue.  Mirrors block_invoke @0x12ad350.
    const outerTrampoline: UserBlock = () => {
      // @0x12ad366 — FFSemaphore::wait() on &self->sem
      self.inlineSemaphore.wait();

      // Inner block — runs on globalQueue.  Mirrors block_invoke_2 @0x12ad3c0.
      const innerBlock: UserBlock = () => {
        // @0x12ad3d1 — callq *0x10(%rax): invoke the captured user block.
        userBlock();
        // @0x12ad3e1 — FFSemaphore::signal() (tail-call).
        self.inlineSemaphore.signal();
      };

      // @0x12ad3a9 — dispatch_async(self.globalQueue, innerBlock).
      dispatch_async(self.globalQueue, innerBlock);
    };

    // @0x12ad344 — dispatch_async(self.serialQueue, outerTrampoline).
    dispatch_async(this.serialQueue, outerTrampoline);
  }
}
