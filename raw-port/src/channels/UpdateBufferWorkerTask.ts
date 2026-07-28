// UpdateBufferWorkerTask.ts — Flexo framework's UpdateBufferWorkerTask, a
// worker-task subclass that (in performTask()) tail-calls FFAudioPlaybackScrub
// Buffer::readUpdateBuffer with three POD arguments loaded verbatim from this-
// pointer offsets, and (in its destructor) fires an ObjC "_notifyOfFirstDrawing:"
// completion notification and releases three owned handles (a shared_ptr, an
// ObjC id, and a second ObjC id).
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// FOUR EXPORTED SYMBOLS (the complete API of the class):
//   @Flexo 0x0000000000d0eeb0  UpdateBufferWorkerTask::~UpdateBufferWorkerTask()   (D1 — complete)
//   @Flexo 0x0000000000d0ef30  UpdateBufferWorkerTask::~UpdateBufferWorkerTask()   (D0 — deleting)
//   @Flexo 0x0000000000d0efb0  UpdateBufferWorkerTask::performTask()
//   @Flexo 0x0000000000d0efd0  UpdateBufferWorkerTask::getTaskReference()
//
// No ctor is exported — the class is either constructed inline in a header or
// built via a factory outside this file. The vtable pointer installed in the
// destructor lets us pin the vtable location precisely (see STRUCT LAYOUT).
//
// Source disassembly (in this worktree's raw-port/re/disasm/):
//   Flexo.UpdateBufferWorkerTask.~UpdateBufferWorkerTask.s   (D0 body @0xd0ef30)
//   Flexo.UpdateBufferWorkerTask.performTask.s               (@0xd0efb0)
//   Flexo.UpdateBufferWorkerTask.getTaskReference.s          (@0xd0efd0)
// D1 (@0xd0eeb0) recovered from /tmp/Flexo_tV.txt (transcribed inline below).
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────────────
// Recovered from the reads/writes across all four methods:
//
//   offset  size  field                    comments
//   ------  ----  -----------------------  --------------------------------------------------
//   +0x00   0x08  vptr        : void*      Installed by both destructors as they run,
//                                          replacing whatever the derived-most ctor put there
//                                          with the base-in-hierarchy vtable location:
//                                          D1 @0xd0eeb9 writes 0xd0eec0+0xc02610 = 0x19114d0
//                                          D0 @0xd0ef3a writes 0xd0ef41+0xc02589 =
//                                                       hmm 0xd0ef41+0xc0258f = 0x19114d0
//                                          Same VA both times — this IS the installed vptr
//                                          (i.e. vtable base + 0x10 typeinfo header). The
//                                          "reset vtable during destruction" pattern is standard
//                                          Itanium behaviour for base classes still owning
//                                          virtual overrides.
//   +0x08   0x08  (unread)    : void*      Not touched by any of the four methods; part of the
//                                          object shape carried by whichever base class this
//                                          derives from. Left opaque.
//   +0x10   0x08  taskRef     : FFAudioPlaybackScrubBuffer*   getTaskReference returns this
//                                          @0xd0efd4; performTask passes it as the 'this'
//                                          receiver to readUpdateBuffer @0xd0efb8.
//   +0x18   0x08  shared_ctrl : __shared_weak_count*          libc++ intrusive control block.
//                                          D1 @0xd0eeec-0xd0ef20 does the standard "dec shared
//                                          count; if last-shared call __on_zero_shared via
//                                          vtable slot +0x10; then tail-call __release_weak".
//                                          Layout of the block (per libc++):
//                                            +0x00  vtable  (contains __on_zero_shared at +0x10)
//                                            +0x08  __shared_owners_  (long; -1 == 0 owners)
//                                            +0x10  __shared_weak_owners_ (long)
//                                          D1 uses `lock xaddq $-1, 0x8(%rbx)` (atomic dec) then
//                                          `testq old, old` to check if the pre-dec value was 0
//                                          (meaning this was the last shared_ptr). D0 does the
//                                          same at @0xd0ef7d.
//   +0x20   0x08  bytesToRead : int64      Passed as arg #2 (rdx) to readUpdateBuffer.
//                                          `long long` per the Itanium mangling
//                                          `FFAudioPlaybackScrubBuffer::readUpdateBuffer(
//                                          unsigned long long, long long, bool)`.
//   +0x28   0x08  offset      : uint64     Passed as arg #1 (rsi) to readUpdateBuffer.
//                                          `unsigned long long` per the mangling.
//   +0x30   0x01  wait        : bool       Passed as arg #3 (cl) via movzbl @0xd0efc0.
//                                          `bool` per the mangling.
//                                          (Bytes +0x31..+0x37 are padding to align +0x38.)
//   +0x38   0x08  notifyTarget : id        ObjC id retained by ctor (unexported); the
//                                          destructor sends it -[_notifyOfFirstDrawing:] then
//                                          objc_release()s it. This is the object that
//                                          receives the completion callback when the buffer
//                                          update finishes (i.e. "first drawing" of the audio).
//   +0x40   0x08  notifyArg   : id         ObjC id retained by ctor; passed as the argument to
//                                          the -[_notifyOfFirstDrawing:] selector, then
//                                          objc_release()d.
//
// Total sizeof observed = 0x48 bytes.
//
// ── PERFORMTASK — THE ACTUAL WORK ───────────────────────────────────────────
// performTask() is a pure 4-arg-load-then-tail-call, forwarding to
// FFAudioPlaybackScrubBuffer::readUpdateBuffer(offset, bytesToRead, wait):
//
//   0xd0efb4  movq  0x28(%rdi), %rsi          ; rsi = offset      (arg #1, uint64)
//   0xd0efb8  movq  0x10(%rdi), %rax          ; rax = taskRef*    (target this)
//   0xd0efbc  movq  0x20(%rdi), %rdx          ; rdx = bytesToRead (arg #2, int64)
//   0xd0efc0  movzbl 0x30(%rdi), %ecx         ; ecx = wait        (arg #3, bool)
//   0xd0efc4  movq  %rax, %rdi                ; rdi = taskRef*    (this for the callee)
//   0xd0efc7  popq  %rbp / jmp readUpdateBuffer
//
// The class carries the exact triple {offset, bytesToRead, wait} that
// FFAudioPlaybackScrubBuffer::readUpdateBuffer takes. The class is essentially a
// deferred-call closure around one specific method invocation, with the ObjC
// completion pair holding the callback target/arg pair.
//
// ── DESTRUCTOR ANALYSIS ─────────────────────────────────────────────────────
// Both destructors share the same 4-step teardown:
//   1. Reset vptr to the base 0x19114d0 (guards against virtual-dispatch races
//      during teardown).
//   2. Fire the completion callback: [self.notifyTarget _notifyOfFirstDrawing:self.notifyArg].
//      Neither the return value nor an exception path is captured — the ObjC
//      call is fire-and-forget (any raised NSException is picked up by the
//      Itanium landing pad at @0xd0efa5 which calls __clang_call_terminate).
//   3. objc_release(self.notifyTarget) then objc_release(self.notifyArg).
//   4. Release the intrusive shared_ptr control block held at +0x18:
//      - atomic dec of shared_owners_ (+0x08 of the block);
//      - if the OLD value was 0 (i.e. this was the last shared_ptr owner),
//        virtual-dispatch through vtable +0x10 to __on_zero_shared (which
//        typically deletes the managed object), then;
//      - D1 tail-jumps to __release_weak (the weak-count releaser), while D0
//        calls it and then falls through to jmp __ZdlPv (operator delete this).
//
// The `___clang_call_terminate` landing pad at @0xd0efa5 (D0) and @0xd0ef25
// (D1) is the standard "an exception was thrown during a NON-throwing dtor —
// terminate" backstop. We do not model it — a JS-thrown exception from any
// frontier stub propagates naturally and does not need explicit terminate
// wiring; if a caller wants FCP's abort-on-throw semantics it must add its
// own top-level std::terminate equivalent.
//
// ── FRONTIER CALLEES (all throw-stubbed with @0xADDR provenance) ────────────
//   @Flexo 0xd0efc8  __ZN26FFAudioPlaybackScrubBuffer16readUpdateBufferEyxb
//         FFAudioPlaybackScrubBuffer::readUpdateBuffer(unsigned long long,
//                                                       long long, bool)
//         — its own task-queue entry. performTask's only work is to tail-call
//         this callee; without it the port is a scaffolded closure.
//   @Flexo 0xd0ef53 / 0xd0eed2  objc_msgSend(_notifyOfFirstDrawing:)
//         Selector: -[NSObject _notifyOfFirstDrawing:] — external ObjC callee.
//         objc_msgSend cannot be transcribed as C++; we surface a raising stub
//         so callers that need the dispatch decode it in ObjC-runtime scope.
//   @Flexo 0xd0ef5d / 0xd0eedc  _objc_release   — external Cocoa runtime.
//   @Flexo 0xd0ef67 / 0xd0eee6  _objc_release   — external Cocoa runtime.
//   @Flexo 0xd0ef8e / 0xd0ef14  vtable[+0x10]() on the shared_weak_count block
//         __on_zero_shared virtual dispatch — the managed-object disposer.
//   @Flexo 0xd0ef94 / 0xd0ef20  __ZNSt3__119__shared_weak_count14__release_weakEv
//         libc++'s weak-count releaser — its own task-queue entry.
//   @Flexo 0xd0efa0             __ZdlPv (operator delete) — libc++abi.
//   @Flexo 0xd0efa8 / 0xd0ef28  ___clang_call_terminate  — libc++abi terminate
//         backstop for an exception raised during a `noexcept` destructor.
//
// Reused ports:
//   None — every callee above is unported. This class is a scaffold-only port
//   until FFAudioPlaybackScrubBuffer::readUpdateBuffer is decoded.
//
// ── FRONTIER STUB DECLARATIONS ──────────────────────────────────────────────

/** Opaque nominal handle for the ObjC id at +0x38 / +0x40. Values passed in
 *  from FCP are actual NSObject*s; TS carries them as opaque brands. */
export interface ObjCId {
  readonly __brand_ObjCId: unique symbol;
}

/** Opaque nominal handle for FFAudioPlaybackScrubBuffer* at +0x10. Ported
 *  separately when its symbols hit the queue. getTaskReference() and
 *  performTask() only read this pointer verbatim. */
export interface FFAudioPlaybackScrubBuffer {
  readonly __brand_FFAudioPlaybackScrubBuffer: unique symbol;
}

/** Opaque nominal handle for libc++'s __shared_weak_count* at +0x18. */
export interface SharedWeakCount {
  readonly __brand_SharedWeakCount: unique symbol;
  /** @+0x08 __shared_owners_ (long). D1 @0xd0eefd atomically decrements this. */
  __shared_owners_: bigint;
  /** vtable slot +0x10 — __on_zero_shared. Virtual dispatch @0xd0ef8e / 0xd0ef14. */
  __on_zero_shared(): void;
}

/** Stub for FFAudioPlaybackScrubBuffer::readUpdateBuffer(unsigned long long,
 *  long long, bool) — the tail-call target of performTask @0xd0efc8. Not yet
 *  ported (its own task-queue entry). */
function FFAudioPlaybackScrubBuffer_readUpdateBuffer_stub(
  _self: FFAudioPlaybackScrubBuffer,
  _offset: bigint,
  _bytesToRead: bigint,
  _wait: boolean,
): void {
  throw new Error(
    "FFAudioPlaybackScrubBuffer::readUpdateBuffer(uint64,int64,bool) @Flexo 0xd0efc8 (call site) — target callee not decoded here (@Flexo readUpdateBuffer's own address unknown at time of writing)",
  );
}

/** Stub for objc_msgSend(target, sel:_notifyOfFirstDrawing:, arg). Wrapped so
 *  the destructor's control flow is legible; the ObjC dispatch itself lives in
 *  the Cocoa runtime and cannot be decoded as C++. */
function objc_msgSend_notifyOfFirstDrawing_stub(
  _target: ObjCId,
  _arg: ObjCId,
): void {
  throw new Error(
    "objc_msgSend -[_notifyOfFirstDrawing:] @Flexo 0xd0ef53 (D0) / @Flexo 0xd0eed2 (D1) — Cocoa runtime dispatch, no C++ decode possible",
  );
}

/** Stub for objc_release(id). Cocoa runtime function. */
function objc_release_stub(_id: ObjCId): void {
  // No-throw stub: objc_release is idempotent for nil and does not raise. In a
  // GC'd JS runtime this is a courtesy no-op. Kept as an explicit call so the
  // destructor's release order matches @Flexo 0xd0ef5d, 0xd0ef67 (D0) and
  // 0xd0eedc, 0xd0eee6 (D1).
}

/** Stub for __ZNSt3__119__shared_weak_count14__release_weakEv — libc++'s weak
 *  count releaser. Called after __on_zero_shared to potentially free the
 *  control block. Not yet ported. */
function shared_weak_count_release_weak_stub(_ctrl: SharedWeakCount): void {
  throw new Error(
    "__shared_weak_count::__release_weak() @Flexo (external libc++ stub) — tail-called from UpdateBufferWorkerTask D1 @0xd0ef20 / D0 @0xd0ef94; not decoded here",
  );
}

// The installed vtable pointer for UpdateBufferWorkerTask, computed from the
// RIP-relative `leaq` in both destructors: 0xd0eec0 + 0xc02610 = 0x19114d0 (D1)
// and 0xd0ef41 + 0xc0258f = 0x19114d0 (D0). Same address. Modeled as an
// opaque constant so downstream vtable-decoding tools can pin it.
const UPDATE_BUFFER_WORKER_TASK_INSTALLED_VPTR = 0x19114d0;

/**
 * UpdateBufferWorkerTask — worker-task holding a deferred call to
 * FFAudioPlaybackScrubBuffer::readUpdateBuffer, plus an ObjC completion pair.
 *
 * Field access matches the observed struct layout exactly; there is no
 * exported ctor so consumers must build the instance via direct field writes
 * (the equivalent of the compiler-inlined ctor that whichever owner uses).
 */
export class UpdateBufferWorkerTask {
  /** @+0x00 vtable pointer. Written by both destructors mid-teardown as
   *  UPDATE_BUFFER_WORKER_TASK_INSTALLED_VPTR (=0x19114d0). Initialised by
   *  the unexported ctor to some derived-class vtable slot. */
  vptr: number = UPDATE_BUFFER_WORKER_TASK_INSTALLED_VPTR;

  /** @+0x08 unused-by-observed-methods 8-byte slot (part of the base class
   *  the destructors implicitly finalize via the reset vptr). */
  _slot0x08: bigint = 0n;

  /** @+0x10 FFAudioPlaybackScrubBuffer*. Returned by getTaskReference();
   *  passed as `this` to readUpdateBuffer in performTask. */
  taskRef: FFAudioPlaybackScrubBuffer | null = null;

  /** @+0x18 __shared_weak_count* — libc++ intrusive control block. */
  sharedCtrl: SharedWeakCount | null = null;

  /** @+0x20 int64 bytesToRead — arg #2 to readUpdateBuffer. */
  bytesToRead: bigint = 0n;

  /** @+0x28 uint64 offset — arg #1 to readUpdateBuffer. */
  offset: bigint = 0n;

  /** @+0x30 bool wait — arg #3 to readUpdateBuffer.
   *  Note: bytes @+0x31..+0x37 are padding-align to +0x38 (not fields). */
  wait: boolean = false;

  /** @+0x38 ObjC id — receives -[_notifyOfFirstDrawing:] in the destructor. */
  notifyTarget: ObjCId | null = null;

  /** @+0x40 ObjC id — argument to -[_notifyOfFirstDrawing:]. */
  notifyArg: ObjCId | null = null;

  /**
   * UpdateBufferWorkerTask::performTask() — tail-call to
   * FFAudioPlaybackScrubBuffer::readUpdateBuffer(offset, bytesToRead, wait)
   * on this.taskRef.
   *   @Flexo 0x0000000000d0efb0..0x0000000000d0efcd
   *
   * Disassembly:
   *   0xd0efb0  pushq %rbp / movq %rsp,%rbp
   *   0xd0efb4  movq  0x28(%rdi), %rsi                 ; rsi = this->offset
   *   0xd0efb8  movq  0x10(%rdi), %rax                 ; rax = this->taskRef
   *   0xd0efbc  movq  0x20(%rdi), %rdx                 ; rdx = this->bytesToRead
   *   0xd0efc0  movzbl 0x30(%rdi), %ecx                ; ecx = this->wait (bool)
   *   0xd0efc4  movq  %rax, %rdi                       ; rdi = taskRef (callee this)
   *   0xd0efc7  popq  %rbp
   *   0xd0efc8  jmp   __ZN26FFAudioPlaybackScrubBuffer16readUpdateBufferEyxb
   *              ; tail-call: readUpdateBuffer(uint64 offset, int64 bytesToRead, bool wait)
   *
   * Semantics: perform one buffered audio-update read. The wait flag chooses
   * blocking vs non-blocking behaviour inside readUpdateBuffer (its own port).
   */
  performTask(): void {
    if (this.taskRef === null) {
      // The asm does NOT null-check — a null taskRef would dereference NULL in
      // readUpdateBuffer. We surface it explicitly rather than silently
      // pretending, matching the "decode-don't-fit" rule (there IS no null
      // check to transcribe, so the port shouldn't add one — but we DO refuse
      // to invoke a nulled-out stub with an invalid receiver).
      throw new Error(
        "UpdateBufferWorkerTask::performTask() @Flexo 0xd0efb8 — taskRef is null; asm does no null-check and would deref null",
      );
    }
    // 0xd0efb4..0xd0efc4: gather the four register arguments then tail-jump.
    FFAudioPlaybackScrubBuffer_readUpdateBuffer_stub(
      this.taskRef,
      this.offset,
      this.bytesToRead,
      this.wait,
    );
  }

  /**
   * UpdateBufferWorkerTask::getTaskReference() — accessor returning
   * this.taskRef (the FFAudioPlaybackScrubBuffer* held at +0x10).
   *   @Flexo 0x0000000000d0efd0..0x0000000000d0efda
   *
   * Disassembly:
   *   0xd0efd0  pushq %rbp / movq %rsp,%rbp
   *   0xd0efd4  movq  0x10(%rdi), %rax                 ; rax = this->taskRef
   *   0xd0efd8  popq  %rbp / retq
   *   0xd0efda  nopw  (%rax,%rax)                       ; alignment padding
   *
   * Trivial getter. `const`-qualified in the C++ signature (this method does
   * not mutate the receiver).
   */
  getTaskReference(): FFAudioPlaybackScrubBuffer | null {
    // 0xd0efd4: read pointer at (this+0x10).
    return this.taskRef;
  }

  /**
   * UpdateBufferWorkerTask::~UpdateBufferWorkerTask() — D1 (complete-object).
   *   @Flexo 0x0000000000d0eeb0..0x0000000000d0ef2d
   *
   * Disassembly (control flow, spills condensed):
   *   0xd0eeb0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0xd0eeb6  movq  %rdi, %rbx                              ; rbx = this
   *   0xd0eeb9  leaq  0xc02610(%rip), %rax                    ; rax = 0x19114d0 (installed vptr)
   *   0xd0eec0  movq  %rax, (%rdi)                            ; this->vptr = 0x19114d0
   *   0xd0eec3  movq  0x38(%rdi), %rdi                        ; rdi = this->notifyTarget
   *   0xd0eec7  movq  0x40(%rbx), %rdx                        ; rdx = this->notifyArg
   *   0xd0eecb  movq  ...(%rip), %rsi                         ; rsi = @selector(_notifyOfFirstDrawing:)
   *   0xd0eed2  callq *objc_msgSend(%rip)                     ; [notifyTarget _notifyOfFirstDrawing: notifyArg]
   *   0xd0eed8  movq  0x38(%rbx), %rdi                        ; rdi = this->notifyTarget
   *   0xd0eedc  callq *objc_release(%rip)                     ; objc_release(notifyTarget)
   *   0xd0eee2  movq  0x40(%rbx), %rdi                        ; rdi = this->notifyArg
   *   0xd0eee6  callq *objc_release(%rip)                     ; objc_release(notifyArg)
   *   0xd0eeec  movq  0x18(%rbx), %rbx                        ; rbx = this->sharedCtrl
   *   0xd0eef0  testq %rbx, %rbx / je 0xd0ef07                ; if (ctrl == nullptr) skip
   *   0xd0eef5  movq  $-0x1, %rax                             ; rax = -1
   *   0xd0eefc  lock xaddq %rax, 0x8(%rbx)                    ; atomic dec &ctrl->__shared_owners_
   *                                                          ;   → rax = OLD value
   *   0xd0ef02  testq %rax, %rax / je 0xd0ef0e                ; if (OLD == 0) goto dispose
   *   0xd0ef07  addq $0x8,%rsp / popq %rbx / popq %rbp / retq ; else normal return
   *   0xd0ef0e  movq  (%rbx), %rax                            ; rax = ctrl->vtable
   *   0xd0ef11  movq  %rbx, %rdi                              ; rdi = ctrl
   *   0xd0ef14  callq *0x10(%rax)                             ; ctrl->__on_zero_shared()
   *   0xd0ef17  movq  %rbx, %rdi                              ; rdi = ctrl
   *   0xd0ef1a  addq $0x8,%rsp / popq %rbx / popq %rbp
   *   0xd0ef20  jmp   __shared_weak_count::__release_weak     ; tail-call
   *
   * Standard libc++ shared_ptr teardown, augmented with the ObjC completion
   * callback + release pair.
   */
  destroy_D1(): void {
    // 0xd0eec0 — reset vptr (guards against races on any residual virtual call).
    this.vptr = UPDATE_BUFFER_WORKER_TASK_INSTALLED_VPTR;

    // 0xd0eec3..0xd0eed2 — fire completion callback.
    if (this.notifyTarget !== null && this.notifyArg !== null) {
      objc_msgSend_notifyOfFirstDrawing_stub(this.notifyTarget, this.notifyArg);
    }

    // 0xd0eed8..0xd0eee6 — release both ObjC handles.
    if (this.notifyTarget !== null) objc_release_stub(this.notifyTarget);
    if (this.notifyArg !== null) objc_release_stub(this.notifyArg);

    // 0xd0eeec..0xd0ef20 — decref intrusive shared_ptr.
    const ctrl = this.sharedCtrl;
    if (ctrl === null) return; // 0xd0eef4 je-branch: nothing to do.

    // 0xd0eefc lock xaddq $-1, 0x8(ctrl) — atomic post-dec of __shared_owners_,
    // returning the OLD value. JS is single-threaded per event loop; we
    // model the atomic without a lock but preserve pre/post-decrement
    // semantics precisely.
    const old = ctrl.__shared_owners_;
    ctrl.__shared_owners_ = old - 1n;

    // 0xd0ef02 — if (OLD == 0) → dispose (this was the last shared owner).
    if (old !== 0n) return;

    // 0xd0ef0e — dispose managed object via virtual dispatch @ vtable +0x10.
    ctrl.__on_zero_shared();

    // 0xd0ef20 — tail-jmp to __release_weak (decs weak count, may free ctrl).
    shared_weak_count_release_weak_stub(ctrl);
  }

  /**
   * UpdateBufferWorkerTask::~UpdateBufferWorkerTask() — D0 (deleting).
   *   @Flexo 0x0000000000d0ef30..0x0000000000d0efad
   *
   * Disassembly (control flow, spills condensed):
   *   0xd0ef30  pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
   *   0xd0ef37  movq  %rdi, %rbx                              ; rbx = this
   *   0xd0ef3a  leaq  0xc0258f(%rip), %rax                    ; rax = 0x19114d0 (installed vptr)
   *   0xd0ef41  movq  %rax, (%rdi)                            ; this->vptr = 0x19114d0
   *   0xd0ef44  movq  0x38(%rdi), %rdi                        ; rdi = notifyTarget
   *   0xd0ef48  movq  0x40(%rbx), %rdx                        ; rdx = notifyArg
   *   0xd0ef4c  movq  ...(%rip), %rsi                         ; rsi = @selector(_notifyOfFirstDrawing:)
   *   0xd0ef53  callq *objc_msgSend(%rip)                     ; msg send
   *   0xd0ef59  movq  0x38(%rbx), %rdi
   *   0xd0ef5d  callq *objc_release(%rip)                     ; release notifyTarget
   *   0xd0ef63  movq  0x40(%rbx), %rdi
   *   0xd0ef67  callq *objc_release(%rip)                     ; release notifyArg
   *   0xd0ef6d  movq  0x18(%rbx), %r14                        ; r14 = sharedCtrl
   *   0xd0ef71  testq %r14, %r14 / je 0xd0ef99                ; skip if null
   *   0xd0ef76  movq  $-0x1, %rax
   *   0xd0ef7e  lock xaddq %rax, 0x8(%r14)                    ; atomic dec
   *   0xd0ef83  testq %rax, %rax / jne 0xd0ef99               ; if OLD != 0, skip dispose
   *   0xd0ef88  movq  (%r14), %rax
   *   0xd0ef8b  movq  %r14, %rdi
   *   0xd0ef8e  callq *0x10(%rax)                             ; __on_zero_shared()
   *   0xd0ef91  movq  %r14, %rdi
   *   0xd0ef94  callq __release_weak                          ; NOT a tail-call in D0!
   *   0xd0ef99  movq  %rbx, %rdi
   *   0xd0ef9c  popq  %rbx / popq %r14 / popq %rbp
   *   0xd0efa0  jmp   __ZdlPv                                 ; tail-call operator delete(this)
   *
   * Structurally identical to D1's body except:
   *   - D0 uses r14 (not rbx) for the ctrl pointer, keeping rbx = this alive
   *     through the ctrl teardown, so that after ctrl-teardown D0 can still
   *     `delete this` (D1 doesn't need this).
   *   - The last step is `jmp __ZdlPv` (delete this), which is the whole
   *     reason D0 differs from D1.
   */
  destroy_D0(): void {
    // 0xd0ef30..0xd0ef94 — the D1 body verbatim (asm inlines it here rather
    // than tail-calling D1, because D0 keeps `this` in rbx for the trailing
    // delete). Semantically equivalent to invoking D1 directly, which we do
    // here for structural clarity.
    this.destroy_D1();

    // 0xd0efa0 — jmp __ZdlPv (operator delete this). GC'd runtime — no-op.
    // See raw-port/src/channels/OZLibraryPresetsMap.ts for the analogous
    // rationale.
  }
}
