// UpdateSoloedObjectsTask — Flexo class. A task-callback that, when performed,
// asks the FFAudioPlaybackMediator to recompute the set of "soloed scopes" for
// the sequence that owns the task's anchored-object back-pointer. The class is
// a sibling of UpdateSequenceTask / UpdateScrubRateTask — they all share the
// same shape: an ObjC anchored-object handle at instance +0x10, a vtable at
// +0x00, and 5 exported methods (D1 + D0 + performTask + getTaskReference +
// taskIdentifier const).
//
// Framework: Flexo.framework (x86_64 slice, file offset 0x4000)
// Disassembly:
//   raw-port/re/disasm/Flexo.UpdateSoloedObjectsTask.performTask.s
//   raw-port/re/disasm/Flexo.UpdateSoloedObjectsTask.~UpdateSoloedObjectsTask.s
//   raw-port/re/disasm/Flexo.UpdateSoloedObjectsTask.getTaskReference.s
//
// Recovered instance layout (from all 5 method bodies):
//   +0x00  vtable*  (written by both D1 @0xe4fef4/D0 @0xe4ff29 to
//                    _ZTV23UpdateSoloedObjectsTask+16 == @0x1917720)
//   +0x08  (unread by any decoded method — likely a base-class field the
//           dtors do not touch. Sibling classes UpdateSequenceTask and
//           UpdateScrubRateTask show the same +0x08 gap when they inherit a
//           thin task-base. No numeric value invented; the byte is opaque.)
//   +0x10  id  anchoredObject   // an ObjC handle; retained by ctor (not
//                                  exported), released by both dtors via
//                                  callq *_objc_release  @0xe4ff02, 0xe4ff37
//
// Frontier callees (undecoded — throwing stubs, cited by @0xADDR):
//   @0xe4db8e  callq  _FFAudioPlaybackMediatorGetFromContext
//              (extern C function — returns FFAudioPlaybackMediator* or NULL)
//   @0xe4dbc7  jmp   __ZN23FFAudioPlaybackMediator29updateSoloedScopesForSequenceEP18FFAnchoredSequence
//              (FFAudioPlaybackMediator::updateSoloedScopesForSequence(FFAnchoredSequence*)
//               — tail-called from performTask; not yet ported)
//   @0xe4db85  callq *0xa9fb35(%rip)  →  objc_msgSend  -[anchoredObject context]
//   @0xe4dbad  callq *%r14             →  objc_msgSend  -[anchoredObject anchoredObject]
//   @0xe4dbba  callq *%r14             →  objc_msgSend  -[context     sequence]
//   @0xe4ff02  callq *0xa9d800(%rip)   →  _objc_release
//   @0xe4ff37  callq *0xa9d7cb(%rip)   →  _objc_release
//   @0xe4ff46  jmp   __ZdlPv           →  operator delete  (from D0)
//   @0xe4ff0d  callq ___clang_call_terminate  (exception cleanup path)
//
// The literal "UpdateSoloedObjectsTask" lives at file address 0x16658ab and
// is returned verbatim by taskIdentifier() const @0xe4ff74.

/**
 * FFAudioPlaybackMediator — opaque Flexo class. Only the ONE method observed
 * from UpdateSoloedObjectsTask's body is exposed here as a frontier stub.
 * A separate port will concretize this class.
 * @frontier Flexo FFAudioPlaybackMediator (referenced by @0xe4dbc7)
 */
export interface FFAudioPlaybackMediator {
  /**
   * updateSoloedScopesForSequence(FFAnchoredSequence*) — direct, non-virtual
   * call. Symbol: __ZN23FFAudioPlaybackMediator29updateSoloedScopesForSequenceEP18FFAnchoredSequence.
   * Tail-jumped by UpdateSoloedObjectsTask::performTask @0xe4dbc7.
   * NOT decoded here — this is FFAudioPlaybackMediator's own frontier.
   */
  updateSoloedScopesForSequence(sequence: FFAnchoredSequence | null): void;
}

/**
 * FFAnchoredSequence — the ObjC class named at Flexo's Objc-selector-ref
 * "sequence" chain from an FFAnchoredObject's -context. Opaque here; the only
 * observable is that it is the pointer type passed to
 * updateSoloedScopesForSequence @0xe4dbc7. Represented as a nominal handle.
 * @frontier Flexo FFAnchoredSequence
 */
export interface FFAnchoredSequence {
  readonly __anchoredSequenceBrand: unique symbol;
}

/**
 * FFAnchoredObject — the ObjC handle stored at UpdateSoloedObjectsTask+0x10.
 * The two selectors invoked on it, -[anchoredObject] and -[context], are
 * observed as objc_msgSend targets @0xe4dbad and @0xe4db85 respectively.
 * @frontier Flexo FFAnchoredObject
 */
export interface FFAnchoredObject {
  /** ObjC selector "anchoredObject" — invoked @0xe4dbad. */
  anchoredObject(): FFAnchoredObject | null;
  /** ObjC selector "context" — invoked @0xe4db85. */
  context(): FFAnchoredContext | null;
  /**
   * ObjC selector "sequence" — invoked @0xe4dbba on the result of the
   * -[anchoredObject anchoredObject] chain. The receiver is nominally an
   * FFAnchoredObject-shaped handle whose -sequence returns an
   * FFAnchoredSequence; ObjC's dynamic dispatch does not distinguish. Both
   * the FFAnchoredObject variant here and the FFAnchoredContext variant
   * below are the same selector name resolved on different classes.
   */
  sequence(): FFAnchoredSequence | null;
}

/**
 * FFAnchoredContext — the ObjC value returned by -[FFAnchoredObject context]
 * and consumed by both _FFAudioPlaybackMediatorGetFromContext and by the
 * -[context sequence] selector call @0xe4dbba.
 * @frontier Flexo FFAnchoredContext
 */
export interface FFAnchoredContext {
  /** ObjC selector "sequence" — invoked @0xe4dbba. */
  sequence(): FFAnchoredSequence | null;
}

/**
 * _FFAudioPlaybackMediatorGetFromContext — extern C helper called by
 * performTask @0xe4db8e. Returns a raw FFAudioPlaybackMediator*, or NULL when
 * the given context has no mediator attached. NOT yet ported; raise here so
 * a future port must wire it in.
 * @frontier Flexo _FFAudioPlaybackMediatorGetFromContext (referenced by @0xe4db8e)
 */
export function FFAudioPlaybackMediatorGetFromContext(
  _context: FFAnchoredContext | null,
): FFAudioPlaybackMediator | null {
  // Undecoded extern; raise to demand a real port. Cited: @0xe4db8e.
  throw new Error(
    "FFAudioPlaybackMediatorGetFromContext: frontier stub — not yet transcribed (@0xe4db8e)",
  );
}

/**
 * UpdateSoloedObjectsTask — a task-callback that, when performed, asks the
 * FFAudioPlaybackMediator attached to the anchored-object's context to
 * recompute the set of soloed scopes for that context's sequence.
 *
 * Sizeof: at least 24 bytes (vtable @+0x00, +0x08 gap, anchoredObject @+0x10).
 */
export class UpdateSoloedObjectsTask {
  /**
   * +0x10 — the anchored-object handle. Loaded verbatim by:
   *   @0xe4db7a  movq 0x10(%rdi), %rdi        (performTask)
   *   @0xe4db9b  movq 0x10(%r14), %rdi        (performTask, second reload)
   *   @0xe4fefe  movq 0x10(%rdi), %rdi        (D1)
   *   @0xe4ff33  movq 0x10(%rdi), %rdi        (D0)
   *   @0xe4ff64  movq 0x10(%rdi), %rax        (getTaskReference — returns it)
   * Retained by the (not-exported) ctor; released by both dtors via
   * _objc_release @0xe4ff02 (D1) and @0xe4ff37 (D0).
   */
  anchoredObject: FFAnchoredObject | null;

  /**
   * Ctor is NOT exported by Flexo for this class (all callsites inline it).
   * The two dtors observe that anchoredObject is either NULL or a valid
   * retained handle, so a zero-arg constructor that leaves it NULL is the
   * faithful transcription: any actual construction path in Flexo assigns
   * anchoredObject directly. No addr is invented — cited: no ctor decoded.
   */
  constructor() {
    this.anchoredObject = null;
  }

  /**
   * performTask() — @0xe4db70  __ZN23UpdateSoloedObjectsTask11performTaskEv
   *
   * Control-flow transcription (mirrors the asm):
   *   %rdi = this
   *   this->anchoredObject                      // @0xe4db7a
   *   let ctx = [anchoredObject context]        // @0xe4db85 objc_msgSend
   *   let mediator = FFAudioPlaybackMediatorGetFromContext(ctx)  // @0xe4db8e
   *   if (mediator == NULL) return              // @0xe4db93/0xe4db96 je →ret
   *   this->anchoredObject                      // @0xe4db9b (reload)
   *   let anchored = [anchoredObject anchoredObject] // @0xe4dbad objc_msgSend
   *   let seq       = [anchored sequence]            // @0xe4dbba objc_msgSend
   *   tail-call mediator->updateSoloedScopesForSequence(seq)     // @0xe4dbc7
   */
  performTask(): void {
    // @0xe4db7a — load this->anchoredObject
    const anchoredObject = this.anchoredObject;

    // @0xe4db7e/0xe4db85 — [anchoredObject context]. The asm unconditionally
    // dispatches; a null receiver mirrors objc_msgSend's null-safety by
    // returning null. Cited: @0xe4db85.
    const ctx = anchoredObject == null ? null : anchoredObject.context();

    // @0xe4db8e — FFAudioPlaybackMediatorGetFromContext(ctx)
    const mediator = FFAudioPlaybackMediatorGetFromContext(ctx);

    // @0xe4db93 testq %rax,%rax ; @0xe4db96 je 0xe4dbcc — early return when
    // no mediator is attached to the context.
    if (mediator === null) {
      return;
    }

    // @0xe4db9b — reload this->anchoredObject into %rdi. The asm re-reads
    // the field rather than reusing the earlier value; we do the same.
    const anchoredObject2 = this.anchoredObject;

    // @0xe4dbad — [anchoredObject anchoredObject]. The Objc-message target
    // pointer is cached in %r14 @0xe4dba6 and re-used @0xe4dbba for the
    // "sequence" selector; both dispatch through objc_msgSend.
    const anchored =
      anchoredObject2 == null ? null : anchoredObject2.anchoredObject();

    // @0xe4dbba — [anchored sequence]
    const seq = anchored == null ? null : anchored.sequence();

    // @0xe4dbc7 — jmp updateSoloedScopesForSequence  (tail-call).
    mediator.updateSoloedScopesForSequence(seq);
  }

  /**
   * ~UpdateSoloedObjectsTask()  [D1 — non-deleting dtor]  @0xe4fef0
   *
   *   @0xe4fef4  leaq  vtable+16(%rip), %rax         ; %rax = 0x1917720
   *   @0xe4fefb  movq  %rax, (%rdi)                  ; this->vtable = &vt+16
   *   @0xe4fefe  movq  0x10(%rdi), %rdi              ; %rdi = anchoredObject
   *   @0xe4ff02  callq *_objc_release                ; release anchoredObject
   *   @0xe4ff09  retq
   *
   * The exception path @0xe4ff0a/@0xe4ff0d ends in ___clang_call_terminate;
   * TypeScript has no equivalent, so it is captured only in the doc-comment.
   */
  destroy(): void {
    // @0xe4fefe / @0xe4ff02 — release the anchored-object handle. In the ObjC
    // runtime this decrements retain count; here we drop the reference so it
    // can be collected. The asm also rewrites this->vtable back to
    // _ZTV23UpdateSoloedObjectsTask+16 (@0x1917720) — a no-op in TS since we
    // do not model the C++ vtable pointer.
    this.anchoredObject = null;
  }

  /**
   * ~UpdateSoloedObjectsTask()  [D0 — deleting dtor]  @0xe4ff20
   *
   *   @0xe4ff29  leaq vtable+16(%rip), %rax          ; same vtable as D1
   *   @0xe4ff30  movq %rax, (%rdi)                   ; write vtable
   *   @0xe4ff33  movq 0x10(%rdi), %rdi
   *   @0xe4ff37  callq *_objc_release                ; release anchoredObject
   *   @0xe4ff46  jmp   __ZdlPv                       ; operator delete(this)
   *
   * D0 is D1 + a tail-call to operator delete. In TS both collapse to the
   * same destroy() semantic; no separate "delete" step exists.
   */
  destroyAndDelete(): void {
    this.destroy();
    // @0xe4ff46 jmp __ZdlPv — no direct TS equivalent; deallocation is GC.
  }

  /**
   * getTaskReference()  @0xe4ff60
   *
   *   @0xe4ff64  movq 0x10(%rdi), %rax   ; %rax = this->anchoredObject
   *   @0xe4ff69  retq                    ; return anchoredObject
   *
   * The "task reference" the queue holds onto is literally the anchored-
   * object handle stored at +0x10.
   */
  getTaskReference(): FFAnchoredObject | null {
    // @0xe4ff64 — direct field load.
    return this.anchoredObject;
  }

  /**
   * taskIdentifier() const  @0xe4ff70
   *
   *   @0xe4ff74  leaq 0x815937(%rip), %rax   ; %rax = "UpdateSoloedObjectsTask"
   *                                          ;  literal @0x16658ab
   *   @0xe4ff7b  retq
   *
   * Constant identifier used by the task queue for logging / dedup.
   */
  taskIdentifier(): string {
    // Literal string from Flexo's read-only data section @0x16658ab.
    return "UpdateSoloedObjectsTask";
  }
}
