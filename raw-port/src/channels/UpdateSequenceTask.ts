// UpdateSequenceTask — Flexo class. A tiny task-callback that holds an owned
// ObjC-object back-pointer (a FFAnchoredSequenceAudioStream, the same class
// whose `clearPendingUpdateSequenceTask` selector is invoked below). When
// performed, the task (1) tells the stream to drop its "pending" record of
// this task, (2) asks the stream for its render context, (3) looks up the
// FFAudioPlaybackMediator on that context, and (4) if one exists, forwards
// updateSequence() to it. Decoded surface: 5 methods (D1/D0 dtor pair +
// performTask + getTaskReference + taskIdentifier); no ctor exported.
//
// Framework: Flexo.framework  (x86_64 slice)
// Source disassembly rows: /tmp/Flexo_llvm.txt lines 3578297-3578364
//
// Recovered instance layout (from performTask and destructors):
//   +0x00  vtable ptr — written by both dtors to _ZTV18UpdateSequenceTask+0x10:
//            @0xe4ff84  leaq 0xac77f5(%rip), %rax   ; ⇒ 0x1917780
//            @0xe4ff8b  movq %rax, (%rdi)
//            @0xe4ffb9  leaq 0xac77c0(%rip), %rax   ; ⇒ 0x1917780
//            @0xe4ffc0  movq %rax, (%rdi)
//          Both dtors initialize the SAME vtable slot, which is the standard
//          C++ pattern of resetting vptr to the base class's vtable at the
//          start of destruction. Sizeof-cited: at least 24 bytes (vptr@+0,
//          gap 0x08-0x0f, ObjC id@+0x10).
//   +0x08  (not observed — 8-byte gap; likely a std::string/name field or a
//          base-class member that no decoded method reads or writes.)
//   +0x10  id  stream  — owned ObjC strong reference to the owning
//          FFAnchoredSequenceAudioStream. Both dtors do:
//            @0xe4ff8e  movq 0x10(%rdi), %rdi
//            @0xe4ff92  callq *_objc_release
//          i.e. release the retained ObjC object on destroy. performTask
//          reads it TWICE at +0x10.
//
// Frontier callees (surfaced as throwing stubs / interface methods):
//   objc_release @stub 0xa9d770/0xa9d73b — GC-managed in TS; noop.
//   operator delete (__ZdlPv) @stub 0x1497404 — GC-managed in TS; throwing.
//   -[FFAnchoredSequenceAudioStream clearPendingUpdateSequenceTask]
//     @0xe4fffe/e50005 (ObjC message dispatch) — resolved to the method
//     already visible at /tmp/Flexo_llvm.txt:3577318.
//   -[<FFAnchoredSequenceAudioStream> context]
//     @0xe50013 (ObjC message dispatch) — returns the stream's render
//     context id; passed to FFAudioPlaybackMediatorGetFromContext.
//   FFAudioPlaybackMediatorGetFromContext(id) — C symbol, called @0xe50020;
//     returns FFAudioPlaybackMediator* or NULL. Not yet ported.
//   FFAudioPlaybackMediator::updateSequence() — non-virtual, direct tail-jmp
//     @0xe50031 to __ZN23FFAudioPlaybackMediator14updateSequenceEv. Not yet
//     ported.

/**
 * FFAnchoredSequenceAudioStream — opaque ObjC class (frontier). Only the two
 * selectors observed from UpdateSequenceTask's body are exposed. The context
 * return type is left as `unknown` because it's an opaque `id` passed
 * straight into a C function.
 * @frontier Flexo FFAnchoredSequenceAudioStream (referenced by @0xe50005 and @0xe5001a)
 */
export interface FFAnchoredSequenceAudioStream {
  /**
   * -[FFAnchoredSequenceAudioStream clearPendingUpdateSequenceTask]
   * ObjC selector ref @0xe4fffe → dispatch via `objc_msgSend` @0xe50005.
   * Full method body is in /tmp/Flexo_llvm.txt:3577318 (not ported here —
   * that's this class's own frontier).
   */
  clearPendingUpdateSequenceTask(): void;

  /**
   * -[FFAnchoredSequenceAudioStream context]
   * ObjC selector ref @0xe50013 → dispatch via `objc_msgSend` reused via %r14
   * (already loaded @0xe50005). Returns the stream's render context (opaque
   * `id`); its only observed use is as the argument to
   * FFAudioPlaybackMediatorGetFromContext @0xe50020.
   */
  context(): unknown;
}

/**
 * FFAudioPlaybackMediator — opaque Flexo class (frontier). One direct method
 * is jumped to from performTask; expose it as an interface member.
 * @frontier Flexo FFAudioPlaybackMediator (referenced by @0xe50031)
 */
export interface FFAudioPlaybackMediator {
  /**
   * FFAudioPlaybackMediator::updateSequence()
   * Symbol: __ZN23FFAudioPlaybackMediator14updateSequenceEv.
   * Tail-jumped by UpdateSequenceTask::performTask @0xe50031 as a direct
   * near-jmp (not via a stub). Not decoded here — this is
   * FFAudioPlaybackMediator's own frontier.
   */
  updateSequence(): void;
}

/**
 * FFAudioPlaybackMediatorGetFromContext(context) — C symbol, resolves a
 * render-context `id` to its owning FFAudioPlaybackMediator (or NULL).
 * Called @0xe50020 by performTask. Not ported — surfaced as a frontier
 * throwing stub so any call site is visible in tests.
 * @frontier Flexo FFAudioPlaybackMediatorGetFromContext (referenced by @0xe50020)
 */
export function FFAudioPlaybackMediatorGetFromContext(
  _context: unknown,
): FFAudioPlaybackMediator | null {
  // Native raises via unimplemented-frontier convention.
  throw new Error(
    "FFAudioPlaybackMediatorGetFromContext is a Flexo C frontier not yet " +
    "ported. Cited call site: UpdateSequenceTask::performTask @0xe50020.",
  );
}

/**
 * UpdateSequenceTask — a task-callback that flushes any "pending sequence
 * update" record on its owning FFAnchoredSequenceAudioStream and then asks
 * the stream's playback mediator (if any) to re-run its updateSequence().
 * Instances live in the Flexo audio-task queue; the dispatch loop calls
 * performTask() on each task it drains.
 *
 * Sizeof (from decoded offsets): at least 24 bytes (vptr @+0, opaque gap
 * @+8, ObjC id @+0x10).
 */
export class UpdateSequenceTask {
  /**
   * +0x10 — owned strong ObjC reference to the FFAnchoredSequenceAudioStream
   * this task belongs to. Read by performTask twice and released by both
   * dtors (@0xe4ff8e movq 0x10(%rdi),%rdi ; @0xe4ff92 callq *objc_release).
   * The two dtors ALSO reset the vptr to _ZTV18UpdateSequenceTask+0x10
   * @0x1917780 before the release, i.e. this is the standard "reset vptr to
   * base, then release owned members" C++ dtor shape.
   *
   * There's an 8-byte gap at +0x08 that NO decoded method reads or writes;
   * do not model it (any port that decodes the ctor is free to add it).
   */
  stream: FFAnchoredSequenceAudioStream;

  constructor(stream: FFAnchoredSequenceAudioStream) {
    // The C++ ctor is not exported so we cannot cite an addr for it. We
    // observe that both dtors release +0x10 and performTask reads it twice
    // without any null-check, so the ctor MUST initialize it with a
    // retained ObjC reference. Take it as a required arg.
    this.stream = stream;
  }

  /**
   * ~UpdateSequenceTask() — complete-object (D1) destructor.
   *
   * @Flexo 0x0000000000e4ff80 (__ZN18UpdateSequenceTaskD1Ev)
   *
   * Body:
   *   @0xe4ff80  pushq %rbp
   *   @0xe4ff81  movq  %rsp, %rbp
   *   @0xe4ff84  leaq  0xac77f5(%rip), %rax     ; %rax = 0x1917780
   *                                             ;   = _ZTV18UpdateSequenceTask+0x10
   *   @0xe4ff8b  movq  %rax, (%rdi)             ; this->vptr = base-vtable-slot
   *   @0xe4ff8e  movq  0x10(%rdi), %rdi         ; %rdi = this->stream
   *   @0xe4ff92  callq *_objc_release           ; @stub 0xa9d770
   *   @0xe4ff98  popq  %rbp
   *   @0xe4ff99  retq
   *
   * The `movq %rax, %rdi ; callq ___clang_call_terminate` epilogue at
   * @0xe4ff9a..@0xe4ffa2 is the standard C++ landing pad for an exception
   * escaping objc_release (unreachable under normal flow), not a second
   * dtor body.
   */
  destroy(): void {
    // @0xe4ff8e-e4ff92  release the owned FFAnchoredSequenceAudioStream.
    // In TS/JS this is a GC-managed reference; we drop the field so the GC
    // can collect it, matching the effect of objc_release taking the last
    // retain to 0.
    objc_release_stub(this.stream);
  }

  /**
   * ~UpdateSequenceTask() — deleting (D0) destructor. Runs D1's body then
   * tail-jumps to `operator delete(void*)`.
   *
   * @Flexo 0x0000000000e4ffb0 (__ZN18UpdateSequenceTaskD0Ev)
   *
   * Body:
   *   @0xe4ffb0  pushq %rbp
   *   @0xe4ffb1  movq  %rsp, %rbp
   *   @0xe4ffb4  pushq %rbx
   *   @0xe4ffb5  pushq %rax                  ; align
   *   @0xe4ffb6  movq  %rdi, %rbx            ; save this
   *   @0xe4ffb9  leaq  0xac77c0(%rip), %rax  ; %rax = 0x1917780 (same vptr slot)
   *   @0xe4ffc0  movq  %rax, (%rdi)          ; this->vptr = base-vtable-slot
   *   @0xe4ffc3  movq  0x10(%rdi), %rdi      ; %rdi = this->stream
   *   @0xe4ffc7  callq *_objc_release        ; @stub 0xa9d73b
   *   @0xe4ffcd  movq  %rbx, %rdi            ; %rdi = this
   *   @0xe4ffd0  addq  $0x8, %rsp
   *   @0xe4ffd4  popq  %rbx
   *   @0xe4ffd5  popq  %rbp
   *   @0xe4ffd6  jmp   0x1497404             ; symbol stub for __ZdlPv
   *
   * Same landing pad @0xe4ffdb..e4ffe3 for an exception escaping
   * objc_release; not reachable under normal flow.
   */
  destroyAndDelete(): void {
    this.destroy();
    // @0xe4ffd6  jmp 0x1497404 (symbol stub for __ZdlPv)
    __ZdlPv_stub(this);
  }

  /**
   * performTask() — flush pending state on the owning stream, then (if a
   * playback mediator exists on the stream's context) tail-forward
   * updateSequence() to it.
   *
   * @Flexo 0x0000000000e4fff0 (__ZN18UpdateSequenceTask11performTaskEv)
   *
   * Body:
   *   @0xe4fff0  pushq %rbp
   *   @0xe4fff1  movq  %rsp, %rbp
   *   @0xe4fff4  pushq %r14
   *   @0xe4fff6  pushq %rbx
   *   @0xe4fff7  movq  %rdi, %rbx                       ; save this
   *   @0xe4fffa  movq  0x10(%rdi), %rdi                 ; %rdi = this->stream
   *   @0xe4fffe  movq  <selref>(%rip), %rsi             ; @clearPendingUpdateSequenceTask
   *   @0xe50005  movq  <_objc_msgSend>(%rip), %r14      ; cache msgSend
   *   @0xe5000c  callq *%r14                            ; [stream clearPendingUpdateSequenceTask]
   *   @0xe5000f  movq  0x10(%rbx), %rdi                 ; %rdi = this->stream (again)
   *   @0xe50013  movq  <selref>(%rip), %rsi             ; @context
   *   @0xe5001a  callq *%r14                            ; %rax = [stream context]
   *   @0xe5001d  movq  %rax, %rdi                       ; %rdi = context
   *   @0xe50020  callq _FFAudioPlaybackMediatorGetFromContext
   *   @0xe50025  testq %rax, %rax
   *   @0xe50028  je    0xe50036                         ; skip tail-jmp if NULL
   *   @0xe5002a  movq  %rax, %rdi                       ; %rdi = mediator
   *   @0xe5002d  popq  %rbx
   *   @0xe5002e  popq  %r14
   *   @0xe50030  popq  %rbp
   *   @0xe50031  jmp   __ZN23FFAudioPlaybackMediator14updateSequenceEv
   *   @0xe50036  popq  %rbx
   *   @0xe50037  popq  %r14
   *   @0xe50039  popq  %rbp
   *   @0xe5003a  retq
   *
   * The jmp @0xe50031 is a direct near-jump to FFAudioPlaybackMediator's own
   * method body (NOT via a stub); the tail-call optimization drops the frame
   * before jumping. On the NULL path, performTask simply returns.
   *
   * Note the `movq 0x10(%rbx), %rdi` at @0xe5000f re-loads `this->stream`
   * after `clearPendingUpdateSequenceTask` — the compiler did NOT assume
   * that ObjC call left the stream reachable via a saved register.
   */
  performTask(): void {
    // @0xe5000c  [this.stream clearPendingUpdateSequenceTask]
    this.stream.clearPendingUpdateSequenceTask();
    // @0xe5001a  ctx = [this.stream context]
    const context = this.stream.context();
    // @0xe50020  mediator = FFAudioPlaybackMediatorGetFromContext(ctx)
    const mediator = FFAudioPlaybackMediatorGetFromContext(context);
    // @0xe50025-e50028  if (mediator == NULL) return;
    if (mediator === null) {
      return;
    }
    // @0xe50031  jmp FFAudioPlaybackMediator::updateSequence()   (tail-call)
    mediator.updateSequence();
  }

  /**
   * getTaskReference() — returns the held stream pointer as an opaque
   * "task reference" identity.
   *
   * @Flexo 0x0000000000e50040 (__ZN18UpdateSequenceTask16getTaskReferenceEv)
   *
   * Body:
   *   @0xe50040  pushq %rbp
   *   @0xe50041  movq  %rsp, %rbp
   *   @0xe50044  movq  0x10(%rdi), %rax    ; return this->stream
   *   @0xe50048  popq  %rbp
   *   @0xe50049  retq
   *
   * Mirrors UpdateScrubRateTask::getTaskReference — the identity token by
   * which the task queue dedupes / references this task is simply the
   * back-pointer to the owning ObjC object.
   */
  getTaskReference(): FFAnchoredSequenceAudioStream {
    // @0xe50044  movq 0x10(%rdi), %rax
    return this.stream;
  }

  /**
   * taskIdentifier() const — returns a static C string identifying the task
   * class as "UpdateSequenceTask".
   *
   * @Flexo 0x0000000000e50050 (__ZNK18UpdateSequenceTask14taskIdentifierEv)
   *
   * Body:
   *   @0xe50050  pushq %rbp
   *   @0xe50051  movq  %rsp, %rbp
   *   @0xe50054  leaq  0x815844(%rip), %rax   ; literal pool: "UpdateSequenceTask"
   *   @0xe5005b  popq  %rbp
   *   @0xe5005c  retq
   *
   * Address of the literal is @0xe5005b + 0x815844 = 0x16658a2 which lands in
   * the __cstring section (RIP-relative constants use insn-end + disp for
   * leaq). We surface the exact literal.
   */
  taskIdentifier(): string {
    // @0xe50054  literal pool: "UpdateSequenceTask"
    return "UpdateSequenceTask";
  }
}

/**
 * objc_release(id) — Objective-C runtime stub @0xa9d770/@0xa9d73b. In TS
 * this is a GC no-op; every strong reference is dropped by the GC when the
 * owning JS object is unreachable. Kept as a named function so the citation
 * @0xe4ff92 / @0xe4ffc7 is visible in the source.
 */
function objc_release_stub(_id: FFAnchoredSequenceAudioStream): void {
  // No-op — GC handles reference counting in TS.
}

/**
 * operator delete(void*) — symbol stub __ZdlPv @0x1497404. Called via tail-
 * jmp from UpdateSequenceTask::~D0 @0xe4ffd6. Not modeled in TS (GC handles
 * freeing). Throwing stub keeps the call site honest.
 */
function __ZdlPv_stub(_p: UpdateSequenceTask): void {
  throw new Error(
    "operator delete (__ZdlPv) not modeled in the TS port; JS/TS objects " +
    "are GC'd. Cited call site: UpdateSequenceTask::~UpdateSequenceTask() " +
    "D0 @0xe4ffd6 (jmp 0x1497404).",
  );
}
