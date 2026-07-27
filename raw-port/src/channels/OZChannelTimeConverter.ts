// OZChannelTimeConverter.ts — per-thread enable flag for the channel-time-converter subsystem.
// Faithfully transcribed from ProChannel framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel
// Source disassembly:
//   raw-port/re/disasm/ProChannel.OZChannelTimeConverter.IsEnabledForCurrentThread.s
//
// Class shape (from what this repo has decoded so far): OZChannelTimeConverter is a base with
// a single static entry point currently visible in the ledger — IsEnabledForCurrentThread(). The
// class also participates in the "Sentry" RAII pattern (OZChannelTimeConverterDisableSentry, seen
// in symmap) which increments a per-thread disable counter; when the counter is 0, the converter
// is enabled for that thread. All state is thread-local. There is NO instance data touched by the
// method we port here (it's effectively a static/free member — rdi is not read as `this`).
//
// FRONTIER CALLEE — undecoded, side-effect-only. OZPerThreadDisableCount::getInstance() is a
// dispatch_once-guarded Meyer's singleton (its .once and .sPerThreadDisableCount symbols are read
// directly by this method — see @0xa9114 and @0xa911e), whose sole product used here is a
// pthread_key_t stored at *sPerThreadDisableCount. The cold path @0xac823 initializes the once
// (dispatch_once(&once, ^{ ... })). We model the effect: a pthread-TLS int32 counter, default 0
// (== enabled), that the (not-yet-ported) DisableSentry ctor/dtor bumps up and down. When the
// singleton is not yet initialized on the calling thread the native code enters the cold path,
// runs dispatch_once, then jumps back to 0xa911e; from TS we always return the fully-initialized
// observable value.

//
// METHOD LIST (from nm on ProChannel):
//   @ProChannel 0x00000000000a9110  OZChannelTimeConverter::IsEnabledForCurrentThread()
//   @ProChannel 0x00000000000ac823  OZChannelTimeConverter::IsEnabledForCurrentThread() (.cold.1)
//
// DISASM SUMMARY (0xa9110..0xa913d + cold @0xac823):
//   cmpq $-1, once(%rip)                   ; if once has completed (== -1 sentinel)
//   jne  cold                              ;   otherwise run dispatch_once (cold branch)
//   mov  sPerThreadDisableCount(%rip),%rax ; load the *(pthread_key_t) storage-ptr
//   mov  (%rax), %rdi                      ; load pthread_key_t value
//   call _pthread_getspecific              ; rax = TLS pointer for this thread
//   test %rax, %rax                        ; if TLS not set:
//   je   .true                              ;   return true (thread has never been touched by
//                                            ;   the DisableSentry — count is implicitly 0)
//   cmp  $0, (%rax)                        ; else compare *count == 0
//   sete %al                                ; return (*count == 0)
//   jmp  .ret
//  .true:
//   mov $1, %al                             ; return true
//  .ret:
//   ret
//  cold (@0xac823..0xac836):
//   leaq &once, %rdi ; leaq __block_literal_global, %rsi ; jmp dispatch_once
//   ; after dispatch_once returns, control resumes at 0xa911e (the load of
//   ;  sPerThreadDisableCount) via the "jmp 0xa911e" fall-through at 0xa9143.
//
// The `___assert_rtn(...)` block right before the cold entry (@0xac7ff..0xac81d) belongs to
// OZBezierFindParameter.cold.1 — it is NOT part of this method (macOS puts many cold slabs in a
// single trampoline range). Do not attribute it to us.
//
// -------------------------------------------------------------------------------------------
// PORT — models the observable answer of IsEnabledForCurrentThread on the caller's thread.
// The counter is pthread-TLS in native; in Node's single-threaded JS runtime we keep an integer
// module-level "per-thread" counter (a single logical thread == module scope). If we ever port
// this to a worker-per-thread model, swap the storage for a per-worker map keyed by worker id.

// Per-thread disable counter — nullable to model "TLS never touched by DisableSentry" (native
// _pthread_getspecific returning NULL). See @0xa9128 / @0xa9130.
// Once the (not-yet-ported) OZChannelTimeConverterDisableSentry ctor bumps it, the pointer
// becomes non-null and holds an int32.
let _perThreadDisableCount: { value: number } | null = null;

// Frontier accessor for the (not-yet-ported) DisableSentry RAII. Exposed so the sentry port,
// when it lands, can inc/dec through this module without reaching into internals.
export function _oz_ptdc_ref(): { value: number } {
  if (_perThreadDisableCount === null) _perThreadDisableCount = { value: 0 };
  return _perThreadDisableCount;
}

// For tests only — reset the TLS slot (equivalent to _pthread_setspecific(key, NULL)).
export function _oz_ptdc_reset(): void {
  _perThreadDisableCount = null;
}

export class OZChannelTimeConverter {
  /**
   * @ProChannel 0x00000000000a9110  OZChannelTimeConverter::IsEnabledForCurrentThread()
   * @ProChannel 0x00000000000ac823  (.cold.1 — dispatch_once slow path, no observable state
   *                                  beyond initializing the singleton; folded in here.)
   *
   * Returns TRUE iff this thread's DisableSentry disable count is zero.
   * A thread that has never been touched by a DisableSentry ctor/dtor has NO TLS pointer set
   * (`_pthread_getspecific` -> NULL) and returns TRUE (@0xa9130 -> 0xa913a). Otherwise the
   * boolean is `(*count == 0)`.
   */
  static IsEnabledForCurrentThread(): boolean {
    // @0xa9114 / 0xa911c: `cmpq $-1, once(%rip); jne cold` — dispatch_once. In TS the singleton
    // is trivially initialized by module load (_perThreadDisableCount starts null; the pthread_key
    // is unobservable in JS). Skip the cold branch: it has no other side effects than the once
    // completion, which happens for free.

    // @0xa911e..0xa9128: pthread_getspecific(key) -> TLS pointer. Modeled as _perThreadDisableCount.
    const tls = _perThreadDisableCount;

    // @0xa912d / 0xa9130: `testq %rax,%rax; je 0xa913a` — if TLS is NULL, return true.
    if (tls === null) {
      // @0xa913a..0xa913c: `movb $0x1, %al` — return true.
      return true;
    }

    // @0xa9132 / 0xa9135: `cmpl $0x0, (%rax); sete %al` — return (*count == 0).
    return (tls.value | 0) === 0;
  }
}
