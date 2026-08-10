// PCThread — ProCore's POSIX-thread wrapper. This file currently
// transcribes:
//   * the default (no-arg) constructor `PCThread::PCThread()` @ProCore
//     0x34b14 (the C1 "complete-object" ABI variant), and
//   * the query method `PCThread::isSelf() const` @ProCore 0x34b8e.
// All other members (parameterised C1/C2 ctors, D1/D2 dtors, startup,
// cancel, wait, detach, self, operator==) are SEPARATE ledger units
// currently `todo`/claimed elsewhere and are NOT added to this file —
// they will extend this class file as their own claims land, per the
// "one class per file" rule.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProCore.framework/Versions/A/ProCore (x86_64 slice; unadjusted VAs
// from `otool -tV`). Disassembly sources:
//   raw-port/re/disasm/ProCore.__ZN8PCThreadC1Ev.s
//   raw-port/re/disasm/ProCore.__ZNK8PCThread6isSelfEv.s
//
// Full 12-line disassembly of the CLAIMED method (verbatim):
//
//   __ZN8PCThreadC1Ev:
//   0x34b14  pushq   %rbp
//   0x34b15  movq    %rsp, %rbp
//   0x34b18  pushq   %rbx
//   0x34b19  pushq   %rax                            ; 16B stack align
//   0x34b1a  movq    %rdi, %rbx                      ; rbx = this (spill)
//   0x34b1d  callq   0xdeada                         ## symbol stub for: _pthread_self
//   0x34b22  movq    %rax, (%rbx)                    ; *this = pthread_self()
//   0x34b25  addq    $0x8, %rsp
//   0x34b29  popq    %rbx
//   0x34b2a  popq    %rbp
//   0x34b2b  retq
//
// SEMANTIC SUMMARY
//   PCThread's default ctor initialises the object by capturing the
//   CALLING thread's pthread_t as the thread identity — i.e. a
//   default-constructed PCThread represents "this thread". The
//   parametrised ctor (PCThreadC1EPFvPvES0_PKc @0x34af2, ledger `todo`)
//   is what actually spawns a new thread; the default ctor is used
//   where code needs a PCThread handle bound to its own thread
//   (typically the initialiser for `PCThread::self()` @0x34b76 — also
//   currently `todo`, so its exact usage pattern is not yet cross-
//   referenced but the semantics of "store pthread_self() at +0x00"
//   are unambiguous from the disasm).
//
// STRUCT LAYOUT DECODED FROM THIS BODY
//   PCThread instance layout (partial — only what THIS function touches):
//     +0x00  pthread_t threadId    // written here @0x34b22
//     +0x08  ... (rest of layout unknown until D1/isSelf/operator==
//                 ports; those functions will extend the layout doc
//                 as they are transcribed)
//
// DEPENDENCIES
//   Direct in-scope callees: NONE. The only call targets are POSIX /
//   libpthread / libSystem externs — TRUE out-of-scope (not one of the
//   five FCP frameworks), modelled as boundary stubs per policy (see
//   PORTING_SPEC.md):
//     * `_pthread_self`  @ProCore stub 0xdeada
//     * `_pthread_equal` @ProCore stub 0xdeaa4  (used by isSelf)
//
// Symbols ported here (mangled -> address):
//   * __ZN8PCThreadC1Ev       —  PCThread::PCThread()      @ProCore 0x34b14  (C1)
//   * __ZNK8PCThread6isSelfEv —  PCThread::isSelf() const  @ProCore 0x34b8e
//
// -----------------------------------------------------------------------------
// FULL DISASM for isSelf (raw-port/re/disasm/ProCore.__ZNK8PCThread6isSelfEv.s)
// -----------------------------------------------------------------------------
//   __ZNK8PCThread6isSelfEv:
//   0x34b8e  pushq   %rbp
//   0x34b8f  movq    %rsp, %rbp
//   0x34b92  pushq   %rbx
//   0x34b93  pushq   %rax                    ; 16B stack align
//   0x34b94  movq    (%rdi), %rbx            ; rbx = this->threadId
//   0x34b97  callq   0xdeada                 ## symbol stub for: _pthread_self
//                                            ; %rax = pthread_self()
//   0x34b9c  movq    %rbx, %rdi              ; arg0 = this->threadId
//   0x34b9f  movq    %rax, %rsi              ; arg1 = pthread_self()
//   0x34ba2  callq   0xdeaa4                 ## symbol stub for: _pthread_equal
//                                            ; %eax = pthread_equal(t1,t2)
//                                            ; (POSIX: nonzero if equal)
//   0x34ba7  testl   %eax, %eax              ; ZF = (eax == 0)
//   0x34ba9  setne   %al                     ; al = (eax != 0) ? 1 : 0
//                                            ; → returns bool "equal"
//   0x34bac  addq    $0x8, %rsp              ; unwind the 16B-align pad
//   0x34bb0  popq    %rbx
//   0x34bb1  popq    %rbp
//   0x34bb2  retq                            ; return value in %al
//
// SEMANTIC SUMMARY
//   `PCThread::isSelf()` asks "does this PCThread's wrapped pthread_t
//   refer to the CALLING thread?" — i.e. compares `this->threadId`
//   against `pthread_self()` via POSIX `pthread_equal`. Uses the POSIX-
//   correct opaque comparator (never `==`), which is important because
//   pthread_t is opaque and may not be a raw integer on every platform.
//   Returns a C++ `bool`.

/**
 * `pthread_self()` — POSIX thread self-identifier. Called via ProCore's
 * imported stub at @0xdeada. TRUE out-of-scope extern: POSIX threads live
 * in libpthread (part of libSystem on macOS), not one of the five FCP
 * frameworks. Returns the opaque pthread_t of the calling thread.
 *
 * In this port there is no libpthread runtime, so we model the value as
 * an opaque handle. A faithful raise here is the correct behaviour: any
 * caller reaching this point would depend on a real thread identity we
 * cannot manufacture without a JS-side pthread implementation.
 */
function pthread_self_stub(): unknown {
  throw new Error(
    "pthread_self() @ProCore imported stub 0xdeada (libpthread/libSystem — " +
      "TRUE out-of-scope extern; not yet transcribed)",
  );
}

/**
 * `pthread_equal(pthread_t, pthread_t)` — POSIX opaque-thread-handle
 * equality comparator. Called via ProCore's imported stub at @0xdeaa4
 * from `PCThread::isSelf` @0x34ba2. TRUE out-of-scope extern
 * (libpthread/libSystem — not one of the five FCP frameworks), same
 * policy as `pthread_self_stub` above.
 *
 * POSIX semantics: returns a nonzero `int` if the two pthread_t handles
 * refer to the same thread, zero otherwise. The FCP caller reads the
 * result as a C++ `bool` via `testl %eax,%eax ; setne %al` @0x34ba7.
 *
 * In this port there is no libpthread runtime, so we can't compare real
 * pthread_t values. A faithful raise is the correct behaviour: any
 * caller reaching this point would have already had to obtain a real
 * pthread_t via `pthread_self_stub` (which itself raises), so control
 * cannot legitimately arrive here in the current partially-ported state.
 */
function pthread_equal_stub(_t1: unknown, _t2: unknown): number {
  throw new Error(
    "pthread_equal() @ProCore imported stub 0xdeaa4 (libpthread/libSystem — " +
      "TRUE out-of-scope extern; not yet transcribed)",
  );
}

/**
 * `pthread_join(pthread_t, void**)` — POSIX join: block until the target
 * thread terminates, optionally receiving its return value. Called via
 * ProCore's imported stub at @0xdeaaa from `PCThread::wait` @0x34b5c.
 * TRUE out-of-scope extern (libpthread/libSystem — not one of the five FCP
 * frameworks), same policy as `pthread_self_stub` / `pthread_equal_stub`.
 *
 * The FCP caller passes a stack slot pre-zeroed to null as the `void**`
 * retval-out (it discards the thread's return value), and `this->threadId`
 * (+0x00) as the pthread_t to join.
 *
 * In this port there is no libpthread runtime, so a faithful raise is the
 * correct behaviour: any caller reaching this point would depend on a real
 * thread that only a JS-side pthread implementation could join.
 */
function pthread_join_stub(_thread: unknown, _retval: unknown): number {
  throw new Error(
    "pthread_join() @ProCore imported stub 0xdeaaa (libpthread/libSystem — " +
      "TRUE out-of-scope extern; not yet transcribed)",
  );
}

/**
 * `PCThread` — ProCore's POSIX-thread wrapper (partial port).
 *
 * Currently transcribed:
 *   * the default constructor `PCThread::PCThread()` @0x34b14, and
 *   * the query method `PCThread::isSelf() const` @0x34b8e.
 *
 * All other members (parameterised C1/C2, D1/D2, startup, cancel, wait,
 * detach, self, operator==) are SEPARATE ledger symbols and are the
 * responsibility of separate claims.
 *
 * Struct layout (partial, decoded from ported members only):
 *   +0x00  pthread_t threadId  — written by the default ctor with
 *                                pthread_self(); read by isSelf()
 *                                @0x34b94.
 */
export class PCThread {
  /**
   * `PCThread::threadId` — the wrapped pthread_t. Held here as an
   * opaque field (its representation is a POSIX pthread_t; we do NOT
   * pretend to know its width or bit layout — in the disasm it is
   * simply the 64-bit return of pthread_self() stored at `+0x00`).
   *
   * Initialised to a sentinel until the ctor runs. The default ctor
   * will overwrite this with pthread_self() (via pthread_self_stub —
   * see the ctor body). This mirrors the disasm: the ctor writes
   * `*this = pthread_self()` at @0x34b22, so any observation of
   * `threadId` on a properly-constructed instance sees a real
   * pthread_t; observation before construction would see whatever
   * allocator handed us (typically zero for calloc, undefined for
   * malloc). We initialise to `null` for TS type safety.
   */
  threadId: unknown = null; // @ProCore instance +0x00

  /**
   * `PCThread::PCThread()` @ProCore 0x34b14
   * (__ZN8PCThreadC1Ev).
   *
   * The C1 "complete-object" ctor variant. Body:
   *
   *   this->threadId = pthread_self();
   *
   * Under the Itanium C++ ABI the C1 variant is used for stand-alone
   * (non-inherited-into) objects — most call sites (including
   * `PCThread::self()`) invoke C1. The C2 "base-object" ctor variant
   * (__ZN8PCThreadC2Ev, currently `todo`) has an identical body and
   * lives at a nearby address (0x34afc); when it lands its file entry
   * will be added below this one.
   *
   * Faithful line-for-line transcription of the 12-line disasm quoted
   * in the file header.
   */
  constructor() {
    // @0x34b14–0x34b19: prologue (rbp frame + rbx callee-save + 16B align).
    // @0x34b1a:         rbx = this (spill %rdi so the callq below can
    //                    clobber %rax without losing the this pointer).

    // @0x34b1d: callq 0xdeada  ; pthread_self() -> %rax.
    //           TRUE out-of-scope extern (POSIX/libpthread). See stub.
    const tid = pthread_self_stub();

    // @0x34b22: movq %rax, (%rbx)  ; this->threadId = pthread_self().
    this.threadId = tid;

    // @0x34b25–0x34b2b: epilogue + retq. (No return value.)
  }

  /**
   * `PCThread::isSelf() const` @ProCore 0x34b8e
   * (__ZNK8PCThread6isSelfEv).
   *
   * Returns true iff the pthread_t held at `this->threadId` (+0x00)
   * refers to the CALLING thread — i.e. compares against
   * `pthread_self()` via the POSIX opaque comparator `pthread_equal`.
   *
   * Faithful line-for-line transcription of the 15-line disasm quoted
   * in the file header:
   *
   *   %rbx = this->threadId               ; @0x34b94
   *   %rax = pthread_self()               ; @0x34b97 (stub 0xdeada)
   *   %eax = pthread_equal(%rbx, %rax)    ; @0x34ba2 (stub 0xdeaa4)
   *                                       ;   ; args (arg0=this->threadId,
   *                                       ;   ;       arg1=pthread_self())
   *   %al  = (%eax != 0) ? 1 : 0          ; @0x34ba7-0x34ba9 (testl/setne)
   *   return %al  (bool)                  ; @0x34bb2 (retq)
   *
   * Note operand ordering: the disasm passes `this->threadId` first
   * (%rdi) and `pthread_self()` second (%rsi). `pthread_equal` is
   * commutative (nonzero iff the two handles refer to the same thread),
   * so the argument order is a decoding detail — we preserve it here
   * for faithful transcription (an inverted argument order would still
   * produce the same boolean, but the disassembly names this order).
   */
  isSelf(): boolean {
    // @0x34b8e–0x34b93: prologue (rbp frame + rbx callee-save + 16B align).
    //                    No TS-visible effect.

    // @0x34b94: movq (%rdi), %rbx  ; rbx = *(this + 0) = this->threadId.
    const t1 = this.threadId;

    // @0x34b97: callq 0xdeada     ; rax = pthread_self().
    //                             ; TRUE out-of-scope extern (POSIX). Stub raises.
    const t2 = pthread_self_stub();

    // @0x34b9c: movq %rbx, %rdi   ; arg0 = t1 (this->threadId).
    // @0x34b9f: movq %rax, %rsi   ; arg1 = t2 (pthread_self()).
    // @0x34ba2: callq 0xdeaa4     ; eax = pthread_equal(t1, t2).
    //                             ; TRUE out-of-scope extern (POSIX). Stub raises.
    const eq = pthread_equal_stub(t1, t2);

    // @0x34ba7: testl %eax,%eax   ; ZF = (eax == 0).
    // @0x34ba9: setne %al         ; al = (eax != 0) ? 1 : 0.
    //   pthread_equal's C-int contract: NONZERO iff the two thread
    //   handles refer to the same thread. The `setne` idiom collapses
    //   that C-int into a proper C++ bool.
    //
    // @0x34bac–0x34bb2: epilogue + retq (return value in %al).
    return eq !== 0;
  }

  /**
   * `PCThread::wait()` @ProCore 0x34b46
   * (__ZN8PCThread4waitEv).
   *
   * Blocks until the wrapped thread terminates by joining it. The thread's
   * exit value is discarded: the caller allocates a `void*` slot on the
   * stack, zero-initialises it, and passes its address as pthread_join's
   * `void**` out-param, ignoring whatever is written back.
   *
   * Faithful line-for-line transcription of the 12-line disasm:
   *
   *   sub  $0x10,%rsp                 ; reserve stack (retval slot)
   *   lea  -0x8(%rbp),%rsi            ; rsi = &retvalSlot
   *   movq $0x0,(%rsi)                ; retvalSlot = null
   *   movq (%rdi),%rdi               ; rdi = *(this+0) = this->threadId
   *   callq 0xdeaaa                  ; pthread_join(this->threadId, &retvalSlot)
   *   ret                             ; (return value discarded)
   *
   * Returns void. The only callee is the POSIX `pthread_join` extern (stub).
   */
  wait(): void {
    // @0x34b4e leaq -0x8(%rbp),%rsi ; @0x34b52 movq $0x0,(%rsi)
    //   retvalSlot = null (a void* out-param, pre-zeroed; result discarded).
    const retvalSlot: unknown = null;

    // @0x34b59 movq (%rdi),%rdi : rdi = *(this+0) = this->threadId.
    const tid = this.threadId;

    // @0x34b5c callq 0xdeaaa : pthread_join(this->threadId, &retvalSlot).
    //   TRUE out-of-scope extern (POSIX/libpthread). Stub raises.
    //   Return value (int status) is not stored by the caller.
    pthread_join_stub(tid, retvalSlot);

    // @0x34b61–0x34b66: epilogue + retq. (No return value.)
  }

  /**
   * `PCThread::~PCThread()` (D1 complete object destructor) — @ProCore 0x34b32
   *
   * Full disassembly (re/disasm/ProCore.__ZN8PCThreadD1Ev.s):
   *   0x34b32  pushq %rbp             ; frame prologue
   *   0x34b33  movq  %rsp, %rbp
   *   0x34b36  popq  %rbp             ; frame epilogue
   *   0x34b37  retq                   ; return
   *
   * A REAL trivial destructor: PCThread holds only a `pthread_t threadId`
   * (a POD scalar at +0x00), so there is no member/base teardown to run.
   * The compiler emitted only the frame prologue/epilogue. Transcribed
   * faithfully as an empty body — it never touches `this` and calls
   * nothing (no `operator delete`, no base dtor).
   */
  destructor_D1(): void {
    // no-op (@ProCore 0x34b32 — push rbp; mov rbp,rsp; pop rbp; ret)
    // Trivial dtor: only member is the POD `threadId` at +0x00 (no teardown).
  }
}
