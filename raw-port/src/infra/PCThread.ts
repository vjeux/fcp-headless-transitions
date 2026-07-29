// PCThread — ProCore's POSIX-thread wrapper. This file transcribes ONLY
// the default (no-arg) constructor `PCThread::PCThread()` @ProCore 0x34b14
// (the C1 variant — the Itanium-ABI "complete-object" alias that ordinary
// code sees). All other members (parameterised C1/C2 ctors, the D1/D2
// dtors, startup, cancel, wait, detach, self, isSelf, operator==) are
// SEPARATE ledger units currently `todo`/claimed elsewhere and are NOT
// added to this file — they will extend this class file as their own
// claims land, per the "one class per file" rule.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProCore.framework/Versions/A/ProCore (x86_64 slice; unadjusted VAs
// from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProCore.__ZN8PCThreadC1Ev.s
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
//   Direct in-scope callees: NONE. The one call target is `_pthread_self`
//   @ProCore stub 0xdeada — TRUE out-of-scope extern (POSIX / libpthread /
//   libSystem runtime, not one of the five FCP frameworks). Modelled as
//   a boundary stub per policy (see PORTING_SPEC.md).
//
// Symbols ported here (mangled -> address):
//   * __ZN8PCThreadC1Ev  —  PCThread::PCThread()  @ProCore 0x34b14  (C1)

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
 * `PCThread` — ProCore's POSIX-thread wrapper (partial port).
 *
 * ONLY the default constructor `PCThread::PCThread()` @0x34b14 is
 * transcribed here. All other members (parameterised C1/C2, D1/D2,
 * startup, cancel, wait, detach, self, isSelf, operator==) are SEPARATE
 * ledger symbols and are the responsibility of separate claims.
 *
 * Struct layout (partial, decoded from ported members only):
 *   +0x00  pthread_t threadId  — written by the default ctor with
 *                                pthread_self() (see body below).
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
}
