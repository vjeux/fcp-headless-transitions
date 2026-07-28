// FFFigStreamMutex.ts — three signpost/tally instrumentation methods for a Fig-stream
// serialization mutex. Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Three C++ symbols observed (no vtable emitted → not virtual, no dtors here — the type is
// non-polymorphic; instances live inside owning aggregates such as FFFigStreamMutexGuard,
// which pins its `mutex_ptr` at +0x00 and reads the 16-byte signpost id block at +0x58/+0x60):
//   @Flexo 0x0000000000e28eb0  FFFigStreamMutex::start(FFFigStreamMutex::FFSignPostReason)
//   @Flexo 0x0000000000e28ef0  FFFigStreamMutex::acquired()
//   @Flexo 0x0000000000e28f10  FFFigStreamMutex::end(FFFigStreamMutex::FFSignPostReason)
//
// STRUCT LAYOUT (recovered from field reads at 0xe28ec5 / 0xe28ec9 / 0xe28f25 / 0xe28f29):
//   +0x58   signpostId0   uint64   (rsi arg #2 to kdebug_trace  — kernel signpost id, low word)
//   +0x60   signpostId1   uint64   (rdx arg #3 to kdebug_trace  — kernel signpost id, high word)
//   Total known layout is only what these three methods read — this file does NOT claim the full
//   sizeof(FFFigStreamMutex). Other slots are populated by ctor code we haven't disassembled
//   here (frontier: FFFigStreamMutex::FFFigStreamMutex — not in this class's method list).
//
// SIGNPOST CODES (RIP-loaded immediates — 32-bit KDBG codes, class 0x2b = ProAppsClass_ProCore):
//   0x2B7D1600  start   (mov $0x2b7d1600, %edi @0xe28ecf)
//   0x2B7D1604  end     (mov $0x2b7d1604, %edi @0xe28f2f)
//   These pair with the class prefix `KDBG_EVENTID(DBG_APPS, 0x7D, code>>2)` pattern; the +4
//   between start and end is the standard "same signpost, END phase" encoding used across FCP's
//   kdebug instrumentation. (No `acquired` signpost — that method only stops the tally timer.)
//
// ENABLE MASK GATE:
//   `_FFGetFlexoSignPostEnableMask()` returns a bitfield; both start() and end() test bit-0 | bit-3
//   (mask 0x09 via `testb $0x9,%al; je …`). When ANY of those bits is set the kdebug_trace call
//   fires; when both are clear the trace is skipped and the tally-only branch runs (start()) or
//   nothing runs (end()). We faithfully mirror the branch even though we can't invoke kdebug from
//   userspace TS — the frontier callees below raise, exposing the demand signal.
//
// FRONTIER CALLEES (throwing stubs — anti-shortcut Rule 3):
//   _FFGetFlexoSignPostEnableMask                  @Flexo (import, __stub)
//   _kdebug_trace                                  @Flexo 0x1497812 (__stubs)
//   _FFThreadBlockTallyGetCurrent                  @Flexo (import, __stub)
//   _FFThreadBlockTallyStartTimer                  @Flexo (import, __stub — TAIL CALL from start)
//   _FFThreadBlockTallyStopTimer                   @Flexo (import, __stub — TAIL CALL from acquired)
// These are all __stubs entries the loader binds at runtime — the TS port has no host to bind
// them against, so each is a raising stub citing the exact call site.

/**
 * FFSignPostReason — nested enum type inside FFFigStreamMutex (mangled `NS_16FFSignPostReasonE`).
 *
 * ABI: 32-bit int (esi arg-slot in start()/end(), preserved through %ebx to %ecx = kdebug arg #4).
 * The enumerators themselves aren't visible from these three methods — they're just forwarded to
 * kdebug_trace as opaque arg4. Modeled here as `number` (u32) rather than a nominal enum so we
 * don't invent values we haven't decoded.
 */
export type FFSignPostReason = number;

/** __stubs entry @Flexo — imported from Flexo (implemented in FigMediaProAppsFlexoLib or similar). */
function FFGetFlexoSignPostEnableMask(): never {
  throw new Error(
    "FFGetFlexoSignPostEnableMask (__stub @Flexo) not yet ported — imported symbol, called from FFFigStreamMutex::{start,end} @0xe28ebc/0xe28f1c",
  );
}

/**
 * __stubs entry @Flexo 0x1497812 — libsystem_kernel _kdebug_trace.
 * ABI: rdi=code, rsi=arg1, rdx=arg2, rcx=arg3, r8=arg4. Kernel-only side effect (Instruments signpost).
 */
function kdebug_trace(_code: number, _arg1: bigint, _arg2: bigint, _arg3: number, _arg4: number): never {
  throw new Error(
    "kdebug_trace (__stub @Flexo 0x1497812) not yet ported — kernel signpost trace, called from FFFigStreamMutex::{start,end} @0xe28ed7/0xe28f3b",
  );
}

/** __stubs entry @Flexo — imported. Returns the per-thread FFThreadBlockTally* (in rax). */
function FFThreadBlockTallyGetCurrent(): never {
  throw new Error(
    "FFThreadBlockTallyGetCurrent (__stub @Flexo) not yet ported — imported symbol, called from FFFigStreamMutex::start@0xe28edc, ::acquired@0xe28ef4",
  );
}

/** __stubs entry @Flexo — imported. Tail-called from FFFigStreamMutex::start with (tally, this). */
function FFThreadBlockTallyStartTimer(_tally: unknown, _mutex: FFFigStreamMutex): never {
  throw new Error(
    "FFThreadBlockTallyStartTimer (__stub @Flexo) not yet ported — imported symbol, tail-called from FFFigStreamMutex::start @0xe28ee8",
  );
}

/** __stubs entry @Flexo — imported. Tail-called from FFFigStreamMutex::acquired with (tally, 4). */
function FFThreadBlockTallyStopTimer(_tally: unknown, _stopReason: number): never {
  throw new Error(
    "FFThreadBlockTallyStopTimer (__stub @Flexo) not yet ported — imported symbol, tail-called from FFFigStreamMutex::acquired @0xe28f02 with esi=0x4",
  );
}

/**
 * FFFigStreamMutex — Fig-stream serialization mutex with tally/signpost instrumentation.
 *
 * This class holds a 16-byte kernel-signpost id at (+0x58, +0x60) that identifies the mutex
 * across kdebug/Instruments. The three methods below are the "phase" hooks a Fig-stream client
 * wraps around a critical section:
 *   start()    — before blocking on the underlying lock (emits signpost BEGIN + starts tally timer)
 *   acquired() — right after the lock is obtained     (stops tally timer with reason 0x4)
 *   end()      — after releasing the lock             (emits signpost END, no tally op)
 *
 * The class also has state beyond +0x58/+0x60 (the ctor lives elsewhere and touches earlier
 * offsets), but nothing in these three methods reads it, so this port only surfaces the two
 * signpost-id fields.
 */
export class FFFigStreamMutex {
  /** +0x58 — low half of the 16-byte signpost identifier. Read as rsi in kdebug_trace calls. */
  signpostId0: bigint = 0n;

  /** +0x60 — high half of the 16-byte signpost identifier. Read as rdx in kdebug_trace calls. */
  signpostId1: bigint = 0n;

  /**
   * FFFigStreamMutex::start(FFSignPostReason) — @Flexo 0xE28EB0.
   *
   * Full disassembly (20 instructions):
   *   e28eb0  pushq   %rbp
   *   e28eb1  movq    %rsp, %rbp
   *   e28eb4  pushq   %r14
   *   e28eb6  pushq   %rbx
   *   e28eb7  movl    %esi, %ebx                    # ebx  <- reason
   *   e28eb9  movq    %rdi, %r14                    # r14  <- this
   *   e28ebc  callq   _FFGetFlexoSignPostEnableMask # -> al = mask
   *   e28ec1  testb   $0x9, %al
   *   e28ec3  je      0xe28edc                      # if (mask & 0x9) == 0 skip signpost
   *   e28ec5  movq    0x58(%r14), %rsi              # rsi  <- this->signpostId0
   *   e28ec9  movq    0x60(%r14), %rdx              # rdx  <- this->signpostId1
   *   e28ecd  movl    %ebx, %ecx                    # ecx  <- reason
   *   e28ecf  movl    $0x2b7d1600, %edi             # edi  <- KDBG code (start phase)
   *   e28ed4  xorl    %r8d, %r8d                    # r8   <- 0
   *   e28ed7  callq   0x1497812                     # kdebug_trace(0x2b7d1600, id0, id1, reason, 0)
   *   e28edc  callq   _FFThreadBlockTallyGetCurrent # rax  <- tls tally
   *   e28ee1  movq    %rax, %rdi                    # rdi  <- tally
   *   e28ee4  popq    %rbx
   *   e28ee5  popq    %r14
   *   e28ee7  popq    %rbp
   *   e28ee8  jmp     _FFThreadBlockTallyStartTimer # TAIL CALL: StartTimer(tally, this)
   *                                                 #   (rsi still holds `this` from entry — no,
   *                                                 #    actually r14 was `this` and %rsi was
   *                                                 #    clobbered by the signpost path; on the
   *                                                 #    !mask branch %rsi retains the original
   *                                                 #    reason argument. The tail-called API
   *                                                 #    convention is StartTimer(tally, ...) —
   *                                                 #    frontier stub captures both branches.)
   *   e28eed  nopl    (%rax)
   *
   * Note on ABI for the tail call: on the signpost-taken path %rsi has been overwritten by
   * `movq 0x58(%r14), %rsi`, so the tail-called StartTimer sees rsi=signpostId0. On the skip
   * path %rsi still holds `reason`. Either way the second arg is *not* `this` — %r14 (this) is
   * popped and discarded before the jmp. We surface `this` in the frontier stub argument list
   * so callers can see the source pointer; the actual imported StartTimer ABI is unknown from
   * these three methods alone (frontier).
   */
  start(reason: FFSignPostReason): void {
    const mask = (FFGetFlexoSignPostEnableMask as unknown as () => number)();
    if ((mask & 0x9) !== 0) {
      // e28ec5..e28ed7
      kdebug_trace(0x2b7d1600, this.signpostId0, this.signpostId1, reason, 0);
    }
    // e28edc..e28ee8
    const tally = (FFThreadBlockTallyGetCurrent as unknown as () => unknown)();
    FFThreadBlockTallyStartTimer(tally, this);
  }

  /**
   * FFFigStreamMutex::acquired() — @Flexo 0xE28EF0.
   *
   * Full disassembly (7 instructions — no signpost, tally-only):
   *   e28ef0  pushq   %rbp
   *   e28ef1  movq    %rsp, %rbp
   *   e28ef4  callq   _FFThreadBlockTallyGetCurrent # rax  <- tls tally
   *   e28ef9  movq    %rax, %rdi                    # rdi  <- tally
   *   e28efc  movl    $0x4, %esi                    # esi  <- 4 (stop-reason constant)
   *   e28f01  popq    %rbp
   *   e28f02  jmp     _FFThreadBlockTallyStopTimer  # TAIL CALL: StopTimer(tally, 4)
   *   e28f07  nopw    (%rax,%rax)
   *
   * The constant 0x4 is the immediate operand to `movl $0x4,%esi` at 0xe28efc — this is the
   * "stopReason" or "bucket" argument that FFThreadBlockTally uses to categorize the elapsed
   * wait time; without disassembling FFThreadBlockTallyStopTimer itself we can't name the enum
   * value, so it's preserved as the literal 0x4 here.
   */
  acquired(): void {
    const tally = (FFThreadBlockTallyGetCurrent as unknown as () => unknown)();
    FFThreadBlockTallyStopTimer(tally, 0x4);
  }

  /**
   * FFFigStreamMutex::end(FFSignPostReason) — @Flexo 0xE28F10.
   *
   * Full disassembly (18 instructions — signpost only, no tally op on either branch):
   *   e28f10  pushq   %rbp
   *   e28f11  movq    %rsp, %rbp
   *   e28f14  pushq   %r14
   *   e28f16  pushq   %rbx
   *   e28f17  movl    %esi, %ebx                    # ebx  <- reason
   *   e28f19  movq    %rdi, %r14                    # r14  <- this
   *   e28f1c  callq   _FFGetFlexoSignPostEnableMask # -> al = mask
   *   e28f21  testb   $0x9, %al
   *   e28f23  je      0xe28f40                      # if (mask & 0x9) == 0 skip signpost
   *   e28f25  movq    0x58(%r14), %rsi              # rsi  <- this->signpostId0
   *   e28f29  movq    0x60(%r14), %rdx              # rdx  <- this->signpostId1
   *   e28f2d  movl    %ebx, %ecx                    # ecx  <- reason
   *   e28f2f  movl    $0x2b7d1604, %edi             # edi  <- KDBG code (end phase = start+4)
   *   e28f34  xorl    %r8d, %r8d                    # r8   <- 0
   *   e28f37  popq    %rbx
   *   e28f38  popq    %r14
   *   e28f3a  popq    %rbp
   *   e28f3b  jmp     0x1497812                     # TAIL CALL: kdebug_trace(0x2b7d1604, id0, id1, reason, 0)
   *   e28f40  popq    %rbx                          # skip path — clean epilogue
   *   e28f41  popq    %r14
   *   e28f43  popq    %rbp
   *   e28f44  retq
   *   e28f45  nopw    %cs:(%rax,%rax)
   *
   * Note: unlike start(), end() has NO tally call — it only fires the kernel signpost END
   * event. The +4 difference between the two KDBG codes (0x2b7d1600 vs 0x2b7d1604) is the
   * standard begin/end pair encoding in the Apple kdebug ID scheme.
   */
  end(reason: FFSignPostReason): void {
    const mask = (FFGetFlexoSignPostEnableMask as unknown as () => number)();
    if ((mask & 0x9) !== 0) {
      // e28f25..e28f3b (tail call kdebug_trace)
      kdebug_trace(0x2b7d1604, this.signpostId0, this.signpostId1, reason, 0);
      return;
    }
    // e28f40..e28f44 — skip path, plain return
  }
}
