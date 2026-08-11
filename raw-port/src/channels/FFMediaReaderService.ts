// FFMediaReaderService.ts — Flexo framework.
// FFMediaReaderService::prepareForShutdown() — the shutdown barrier of Flexo's media-reader
// service: it cancels the service's dispatch SOURCE (the periodic timer that drives
// deleteUnusedMediaReaders) unless it is already cancelled, and then drains the service's
// serial QUEUE by dispatching an empty block to it synchronously.
//
// Binary source (x86_64 slice of the FAT Flexo framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Source disasm: raw-port/re/disasm/Flexo.__ZN20FFMediaReaderService18prepareForShutdownEv.s
// and Flexo.____ZN20FFMediaReaderService18prepareForShutdownEv_block_invoke.s, both re-derived
// with `raw-port/tools/disasm.sh --sym … Flexo` after deleting any cached copy, so the bodies
// below are read from the binary rather than from a peer's leftover scratch in the pool slot.
//
// -----------------------------------------------------------------------------
// FULL DISASM (@Flexo 0xe08f20  __ZN20FFMediaReaderService18prepareForShutdownEv)
// -----------------------------------------------------------------------------
//   0xe08f20  pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx    ; frame
//   0xe08f27  movq  %rdi, %rbx                 ; rbx = this
//   0xe08f2a  movq  0x8(%rdi), %r14            ; r14 = this->source      (+0x08)
//   0xe08f2e  movq  %r14, %rdi
//   0xe08f31  callq _dispatch_source_testcancel  ; stub 0x14976f2
//   0xe08f36  testq %rax, %rax
//   0xe08f39  jne   0xe08f43                   ; already cancelled -> skip
//   0xe08f3b  movq  %r14, %rdi
//   0xe08f3e  callq _dispatch_source_cancel      ; stub 0x14976c2
//   0xe08f43  movq  (%rbx), %rdi               ; rdi = this->queue       (+0x00)
//   0xe08f46  leaq  ___block_literal_global.50(%rip), %rsi
//   0xe08f4d  popq %rbx ; popq %r14 ; popq %rbp                         ; epilogue BEFORE the jmp
//   0xe08f51  jmp   _dispatch_sync             ; stub 0x14976fe — TAIL CALL
//   0xe08f56  nopw  %cs:(%rax,%rax)            ; alignment padding
//
// (@Flexo 0xe08f60  ____ZN20FFMediaReaderService18prepareForShutdownEv_block_invoke)
//   0xe08f60  pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
// The dispatched block is EMPTY — it has no body at all. That is the point of it: dispatching
// an empty block to a serial queue with dispatch_sync returns only once everything already
// queued has run, so this is a drain barrier and not a piece of work.
//
// STRUCT LAYOUT, as far as THIS function grounds it (the ctor @Flexo 0xe08720 is the unit that
// will establish the rest, and is not claimed here):
//   +0x00  queue   dispatch_queue_t   — read at 0xe08f43, passed to dispatch_sync
//   +0x08  source  dispatch_source_t  — read at 0xe08f2a, passed to the two source calls
// No other offset is touched, so no other field is asserted here.

/** dispatch_queue_t — an opaque libdispatch handle; the port never constructs one. */
export type DispatchQueueRef = unknown;
/** dispatch_source_t — an opaque libdispatch handle; the port never constructs one. */
export type DispatchSourceRef = unknown;

/**
 * `long dispatch_source_testcancel(dispatch_source_t)` — libdispatch extern, out of scope.
 * Entered through the Flexo symbol stub @0x14976f2, called @Flexo 0xe08f31.
 *
 * This one RAISES rather than answering, and that is the rule rather than a shortcut: it is a
 * VALUE-PRODUCING extern whose result the very next instruction branches on
 * (`testq %rax,%rax ; jne`). The cancelled/not-cancelled state lives in a libdispatch source
 * this port does not create or own, so returning 0 or 1 here would be inventing the input to a
 * branch — the "plausible wrong answer with no throw" class the gate exists to stop. Contrast
 * the lifetime primitives (CFRetain/CFRelease), which are modelled as no-ops precisely because
 * they produce no value to invent.
 */
function dispatch_source_testcancel(_source: DispatchSourceRef): bigint {
  throw new Error(
    "dispatch_source_testcancel not available in TS host (Flexo stub 0x14976f2, called @0xe08f31)" +
      " — its result selects the branch at @0xe08f39 and cannot be fabricated",
  );
}

/**
 * `void dispatch_source_cancel(dispatch_source_t)` — libdispatch extern, out of scope.
 * Entered through the Flexo symbol stub @0x14976c2, called @Flexo 0xe08f3e.
 * Raises, following the landed convention for libdispatch scheduling primitives in
 * `raw-port/src/channels/FFPlaybackMemoryMonitor.ts` (dispatch_sync / dispatch_release /
 * dispatch_assert_queue) and `FFDispatchQueue.ts` (dispatch_async): cancelling a source has a
 * real effect on a real queue, and silently doing nothing would make a shutdown path look like
 * it had completed when nothing was torn down.
 */
function dispatch_source_cancel(_source: DispatchSourceRef): void {
  throw new Error(
    "dispatch_source_cancel not available in TS host (Flexo stub 0x14976c2, called @0xe08f3e)",
  );
}

/**
 * `void dispatch_sync(dispatch_queue_t, dispatch_block_t)` — libdispatch extern, out of scope.
 * TAIL-JUMPED through the Flexo symbol stub @0x14976fe, from @Flexo 0xe08f51.
 * Raises, matching `FFPlaybackMemoryMonitor.ts`'s landed dispatch_sync stub (@Flexo 0xda5be7).
 */
function dispatch_sync(_queue: DispatchQueueRef, _block: () => void): void {
  throw new Error(
    "dispatch_sync not available in TS host (Flexo stub 0x14976fe, tail-jumped @0xe08f51)",
  );
}

/**
 * `___block_literal_global.50` — the global block literal whose invoke function is
 * @Flexo 0xe08f60 `____ZN20FFMediaReaderService18prepareForShutdownEv_block_invoke`, addressed
 * at @Flexo 0xe08f46. Its body is four instructions of frame setup and teardown and nothing
 * else, so the transcription is an empty function. It is a global literal rather than a stack
 * block because it captures nothing.
 */
export function FFMediaReaderService_prepareForShutdown_block_invoke(): void {
  // @0xe08f60..0xe08f65 — pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq. No body.
}

export class FFMediaReaderService {
  /** +0x00 — the service's serial dispatch queue. Read at @0xe08f43. */
  queue: DispatchQueueRef = undefined;
  /** +0x08 — the service's dispatch source (the reaper timer). Read at @0xe08f2a. */
  source: DispatchSourceRef = undefined;

  /**
   * FFMediaReaderService::prepareForShutdown() -> void
   * @Flexo __ZN20FFMediaReaderService18prepareForShutdownEv @0xe08f20..0xe08f51
   *
   * Every instruction of the body is above in the file header. In order:
   *   1. load `this->source` (+0x08)                                    @0xe08f2a
   *   2. `dispatch_source_testcancel(source)`                           @0xe08f31
   *   3. if it returned 0 — i.e. the source is NOT already cancelled —
   *      `dispatch_source_cancel(source)`                               @0xe08f39 / @0xe08f3e
   *   4. load `this->queue` (+0x00) and tail-jump
   *      `dispatch_sync(queue, ___block_literal_global.50)`             @0xe08f43 / @0xe08f51
   *
   * Note the sense of the test at @0xe08f39: `jne` skips the cancel, so the cancel happens on
   * the ZERO (not-yet-cancelled) result. The tail `jmp` after the epilogue is a void-to-void
   * tail call, which `return dispatch_sync(...)` mirrors exactly.
   */
  prepareForShutdown(): void {
    // @0xe08f2a  movq 0x8(%rdi), %r14
    const source = this.source;
    // @0xe08f31  callq _dispatch_source_testcancel ; @0xe08f36 testq %rax,%rax ; @0xe08f39 jne
    if (dispatch_source_testcancel(source) === 0n) {
      // @0xe08f3e  callq _dispatch_source_cancel
      dispatch_source_cancel(source);
    }
    // @0xe08f43  movq (%rbx), %rdi ; @0xe08f46 leaq ___block_literal_global.50 ; @0xe08f51 jmp
    return dispatch_sync(this.queue, FFMediaReaderService_prepareForShutdown_block_invoke);
  }
}
