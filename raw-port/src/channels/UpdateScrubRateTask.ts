// UpdateScrubRateTask — Flexo class. A tiny task-descriptor that holds a back-
// pointer to an FFAudioScrubUnit and forwards two virtual calls (performTask,
// getTaskReference) into it. Decoded surface: 4 methods (D1/D0 dtor pair +
// performTask + getTaskReference); no ctor exported.
//
// Framework: Flexo.framework
// Disassembly:
//   raw-port/re/disasm/Flexo.UpdateScrubRateTask.D1.s
//   raw-port/re/disasm/Flexo.UpdateScrubRateTask.D0.s
//   raw-port/re/disasm/Flexo.UpdateScrubRateTask.performTask.s
//   raw-port/re/disasm/Flexo.UpdateScrubRateTask.getTaskReference.s
//
// Recovered instance layout (from performTask and getTaskReference):
//   +0x00  (vtable ptr — 8 bytes; not read in the 4 decoded bodies, but implied
//          by the class being a task-hierarchy participant. The class name and
//          performTask/getTaskReference signatures match the standard task-
//          callback vtable shape used elsewhere in Flexo.)
//   +0x08  FFAudioScrubUnit*  scrubUnit    // read by performTask @0xd206d4
//                                          // and getTaskReference @0xd206e4
//
// Frontier callees:
//   FFAudioScrubUnit::updateScrubRate()  @Flexo (direct call, not stub)
//     tail-jumped from performTask @0xd206d9
//   operator delete (__ZdlPv)  @stub 0x1497404
//     tail-jumped from D0 @0xd206c5

/**
 * FFAudioScrubUnit — opaque Flexo class. Only the ONE method observed from
 * UpdateScrubRateTask's body is exposed here as a frontier stub. Any future
 * port that decodes FFAudioScrubUnit is free to concretize this shape.
 * @frontier Flexo FFAudioScrubUnit (referenced by @0xd206d9)
 */
export interface FFAudioScrubUnit {
  /**
   * updateScrubRate() — direct, non-virtual call. Symbol resolved:
   * __ZN16FFAudioScrubUnit15updateScrubRateEv. Tail-jumped by
   * UpdateScrubRateTask::performTask @0xd206d9.
   * NOT decoded here — this is FFAudioScrubUnit's own frontier.
   */
  updateScrubRate(): void;
}

/**
 * UpdateScrubRateTask — a task-callback that, when performed, asks its held
 * FFAudioScrubUnit to recompute its scrub rate. Instances live in the Flexo
 * audio-task queue; the task queue's dispatch loop calls performTask() on
 * each task it drains.
 *
 * Sizeof (from the offsets touched): at least 16 bytes (vtable @+0, scrubUnit
 * @+8). Only these two fields are observed in the 4 decoded methods.
 */
export class UpdateScrubRateTask {
  /**
   * +0x08 — FFAudioScrubUnit*, the target of both public methods. Loaded via
   *   @0xd206d4  movq 0x8(%rdi), %rdi   (in performTask)
   *   @0xd206e4  movq 0x8(%rdi), %rax   (in getTaskReference)
   * Never written in any of the 4 decoded methods; must be set by the ctor
   * (which is NOT in the export table for this class — probably inlined at
   * every construction site inside Flexo).
   */
  scrubUnit: FFAudioScrubUnit;

  constructor(scrubUnit: FFAudioScrubUnit) {
    // The C++ ctor is not exported so we cannot cite an addr for it. We do
    // observe that the ONLY per-instance field touched by any decoded method
    // is +0x08 = scrubUnit, and that both methods READ it without any null-
    // check, so the ctor MUST initialize it. Take it as a required arg.
    this.scrubUnit = scrubUnit;
  }

  /**
   * ~UpdateScrubRateTask() — complete-object (D1) destructor.
   *
   * @Flexo 0x0000000000d206b0 (__ZN19UpdateScrubRateTaskD1Ev)
   *
   * Body: empty. No members to release (the FFAudioScrubUnit is a NON-owned
   * back-pointer — the dtor never touches +0x08, so this task doesn't own it).
   *   @0xd206b0  pushq %rbp
   *   @0xd206b1  movq  %rsp, %rbp
   *   @0xd206b4  popq  %rbp
   *   @0xd206b5  retq
   */
  destroy(): void {
    // Empty — matches D1 @0xd206b4 popq+retq.
  }

  /**
   * ~UpdateScrubRateTask() — deleting (D0) destructor. Runs D1 (empty) then
   * tail-jumps to `operator delete(void*)`.
   *
   * @Flexo 0x0000000000d206c0 (__ZN19UpdateScrubRateTaskD0Ev)
   *
   * Body:
   *   @0xd206c0  pushq %rbp
   *   @0xd206c1  movq  %rsp, %rbp
   *   @0xd206c4  popq  %rbp
   *   @0xd206c5  jmp   0x1497404          ; symbol stub for __ZdlPv
   *
   * The absence of any base-class D2 call and the trivial D1 body together
   * mean UpdateScrubRateTask's only base has an empty (or inlined-away) dtor.
   *
   * TS-side: operator delete is a GC hook — throwing stub preserves the
   * frontier while making a bad call visible in tests.
   */
  destroyAndDelete(): void {
    this.destroy();
    // @0xd206c5  jmp 0x1497404 (symbol stub for __ZdlPv)
    __ZdlPv_stub(this);
  }

  /**
   * performTask() — tail-forwards to FFAudioScrubUnit::updateScrubRate() on
   * the held +0x08 pointer.
   *
   * @Flexo 0x0000000000d206d0 (__ZN19UpdateScrubRateTask11performTaskEv)
   *
   * Body:
   *   @0xd206d0  pushq %rbp
   *   @0xd206d1  movq  %rsp, %rbp
   *   @0xd206d4  movq  0x8(%rdi), %rdi     ; rdi = this->scrubUnit
   *   @0xd206d8  popq  %rbp
   *   @0xd206d9  jmp   FFAudioScrubUnit::updateScrubRate()   ; TAIL-CALL
   *
   * The jmp is a direct near-jump to the FFAudioScrubUnit method's own body
   * (NOT via a stub) — verified in the disasm comment.
   */
  performTask(): void {
    // @0xd206d9  jmp FFAudioScrubUnit::updateScrubRate()
    this.scrubUnit.updateScrubRate();
  }

  /**
   * getTaskReference() — returns the held FFAudioScrubUnit pointer as an
   * opaque "task reference" identity.
   *
   * @Flexo 0x0000000000d206e0 (__ZN19UpdateScrubRateTask16getTaskReferenceEv)
   *
   * Body:
   *   @0xd206e0  pushq %rbp
   *   @0xd206e1  movq  %rsp, %rbp
   *   @0xd206e4  movq  0x8(%rdi), %rax     ; return this->scrubUnit
   *   @0xd206e8  popq  %rbp
   *   @0xd206e9  retq
   *
   * The return type in the mangled symbol is left unspecified; the body
   * returns a pointer directly out of %rax so the semantic type is
   * `FFAudioScrubUnit*` (== "the identity token by which the task queue
   * dedupes / references this task"). We surface it typed accordingly.
   */
  getTaskReference(): FFAudioScrubUnit {
    // @0xd206e4  movq 0x8(%rdi), %rax
    return this.scrubUnit;
  }
}

/**
 * operator delete(void*) — symbol stub __ZdlPv @0x1497404. Called via tail-
 * jump from UpdateScrubRateTask::~D0 @0xd206c5. Not modeled in TS (GC handles
 * freeing). Throwing stub keeps the call site honest.
 */
function __ZdlPv_stub(_p: UpdateScrubRateTask): void {
  throw new Error(
    "operator delete (__ZdlPv) not modeled in the TS port; JS/TS objects " +
    "are GC'd. Cited call site: UpdateScrubRateTask::~UpdateScrubRateTask() " +
    "D0 @0xd206c5 (jmp 0x1497404)."
  );
}
