// STParameterEvent.ts — Flexo's STParameterEvent, an audio parameter-event
// value class whose only emitted methods are the two Itanium-ABI destructor
// aliases. Transcribed one-for-one from the disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
// Versions/A/Flexo.
//
// Source disassembly:  raw-port/re/disasm/Flexo.STParameterEvent.dtors.s
//
// Flexo symbols transcribed (exactly the two listed for this class in
// /tmp/Flexo_symmap.tsv — the class has NO other emitted methods):
//   @0x123f720  STParameterEvent::~STParameterEvent()   (D1 — non-deleting)
//   @0x123f730  STParameterEvent::~STParameterEvent()   (D0 — deleting)
//
// DECODE evidence:
//   * D1 body @0x123f720:
//        pushq %rbp / movq %rsp,%rbp / popq %rbp / retq
//     That is, a trivial "return immediately" body. No field access, no
//     callee, no vtable-slot install, no base-dtor call. This is what
//     clang emits when the class carries no owned resources AND has no
//     virtual base — it inherits its base's dtor and adds nothing.
//   * D0 body @0x123f730:
//        pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp __ZdlPv
//     I.e. tail-call `operator delete(this)` after the (trivial) D1 body
//     inlined away. `__ZdlPv` is at @Flexo 0x1497404 (symbol stub);
//     otool annotates the callsite `## symbol stub for: __ZdlPv`.
//
// STRUCT LAYOUT: not pinned by these two symbols. Neither dtor reads any
// field, so the only fact recovered is that the class has trivial
// (member-wise) cleanup semantics. Related symbols in the same binary
// (see e.g. `STParameterEventQueue::PostValueAtTime(STParameter*, double,
// float)` @Flexo __ZN21STParameterEventQueue15PostValueAtTimeEP11STParameterdf)
// suggest the class holds a parameter target, a time, and a float value —
// but that layout will be pinned by a ctor/queue-op port, not by these
// dtors.
//
// Related, undecoded:
//   * `operator delete(void*)` (libc++abi `__ZdlPv`) @Flexo 0x1497404 —
//     tail-jmp target from D0. Modeled here as a GC no-op stub for
//     control-flow parity with the disasm.

// ── Frontier: undecoded runtime helper ─────────────────────────────────

/** `operator delete(void*)` (libc++abi __ZdlPv) — tail-jmp target from
 *  the deleting destructor D0 @0x123f735. Modeled as a no-op in a GC'd
 *  runtime, but expressed here so the control flow matches the disasm
 *  exactly. Not a decode of the C++ runtime symbol. */
function operator_delete_stub(_this: STParameterEvent): void {
  // GC'd runtime — no explicit free. Faithful to the tail-call jmp at
  // 0x123f735 (`jmp 0x1497404  ## symbol stub for: __ZdlPv`).
}

// ── The class ──────────────────────────────────────────────────────────

/** STParameterEvent — Flexo audio parameter-event value type. Referenced
 *  by STParameterEventQueue methods (AddInFlightRamp, MarkForFlush,
 *  PostValueAtTime, ProcessEvent, FlushEvent, etc.); STParameterEventQueue
 *  is itself a subclass of the FFLocklessQueueBase family and stores
 *  STParameterEvent instances as element payloads.
 *
 *  This port surfaces ONLY the two dtor symbols emitted for the class.
 *  Its field layout is not pinned by these two symbols (both are empty)
 *  and will be pinned by a queue-op / ctor port later. */
export class STParameterEvent {
  /** STParameterEvent::~STParameterEvent() — D1 (non-deleting)
   *  destructor @Flexo 0x123f720.
   *
   *  Body:
   *    0x123f720  pushq %rbp
   *    0x123f721  movq  %rsp, %rbp
   *    0x123f724  popq  %rbp
   *    0x123f725  retq
   *
   *  Trivial: no member cleanup, no base-dtor call. `return` immediately. */
  destroy_D1(): void {
    // @0x123f725 retq — nothing to do.
  }

  /** STParameterEvent::~STParameterEvent() — D0 (deleting) destructor
   *  @Flexo 0x123f730.
   *
   *  Body:
   *    0x123f730  pushq %rbp
   *    0x123f731  movq  %rsp, %rbp
   *    0x123f734  popq  %rbp
   *    0x123f735  jmp   __ZdlPv   ; operator delete(this) @Flexo 0x1497404
   *
   *  Trivial member cleanup (inlined to nothing) plus `operator delete`
   *  on `this`. In TS, dropping refs is enough. */
  destroy_D0(): void {
    // @0x123f735 jmp __ZdlPv — GC'd runtime no-op stub below.
    operator_delete_stub(this);
  }
}
