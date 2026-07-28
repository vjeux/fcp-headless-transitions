// FFWorkerQueueThread — Flexo's function-local Meyers-style singleton that
// owns a single background FFWorkerQueueThread instance. Very close cousin
// of ScheduledIOWorkerThread (already ported) — same dispatch_once + local
// static pattern.
//
// The exported "class" surface is really just a namespace-scoped `instance()`
// accessor plus the two Itanium-ABI destructors emitted for the class itself
// (both bodies observed in the binary). The dispatch_once fallback is an
// ICF-coalesced `.cold.1` stub at Flexo 0x1492ff0 that calls dispatch_once
// on the local static predicate.
//
// Verbatim from FCP's Flexo framework at:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// nm evidence (`nm -arch x86_64 -m Flexo | grep FFWorkerQueueThread`):
//   0000000001304ab0 T __ZN19FFWorkerQueueThread8instanceEv
//   0000000001305610 T __ZN19FFWorkerQueueThreadD1Ev
//   0000000001305690 T __ZN19FFWorkerQueueThreadD0Ev
//   0000000001492ff0 t __ZN19FFWorkerQueueThread8instanceEv.cold.1
//                     (ICF-coalesced with __ZN13FFWorkerQueue7addTaskEPNS_4TaskE.cold.1)
//   0000000001c7f100 b __ZZN19FFWorkerQueueThread8instanceEvE10s_instance
//   0000000001c7f108 b __ZZN19FFWorkerQueueThread8instanceEvE11s_predicate
//
// Static bss layout (from the nm dump above):
//   __ZZN19FFWorkerQueueThread8instanceEvE10s_instance   @ Flexo bss 0x1c7f100
//   __ZZN19FFWorkerQueueThread8instanceEvE11s_predicate  @ Flexo bss 0x1c7f108
// Standard dispatch_once_t predicate + FFWorkerQueueThread* pointer pair
// used by the compiler for a function-local static.
//
// Disassembly saved at:
//   raw-port/re/disasm/Flexo.FFWorkerQueueThread.instance.s (12 lines)
//   raw-port/re/disasm/Flexo.FFWorkerQueueThread.~FFWorkerQueueThread.s (D0 body, 38 lines)
//   D1 body recovered via `grep` over /tmp/Flexo_tV.txt at
//     __ZN19FFWorkerQueueThreadD1Ev (~40 lines)
//   .cold.1 body recovered by dumping @0x1492ff0 (7 lines — dispatch_once trampoline)
//
// ─── instance() @Flexo 0x1304ab0 ──────────────────────────────────────────────
//   __ZN19FFWorkerQueueThread8instanceEv:
//     0x1304ab0  cmpq  $-0x1, s_predicate(%rip)
//     0x1304ab8  jne   0x1304ac2                       ; not-yet-initialised
//     0x1304aba  movq  s_instance(%rip), %rax          ; fast path
//     0x1304ac1  retq
//     0x1304ac2  pushq %rbp
//     0x1304ac3  movq  %rsp, %rbp
//     0x1304ac6  callq __ZN13FFWorkerQueue7addTaskEPNS_4TaskE.cold.1
//                                                       ; ICF-coalesced with
//                                                       ; this class's own .cold.1
//     0x1304acb  popq  %rbp
//     0x1304acc  movq  s_instance(%rip), %rax
//     0x1304ad3  retq
//
// ─── .cold.1 @Flexo 0x1492ff0 ─────────────────────────────────────────────────
// (ICF-coalesced with FFWorkerQueue::addTask.cold.1 — same body):
//     0x1492ff0  pushq %rbp
//     0x1492ff1  movq  %rsp, %rbp
//     0x1492ff4  leaq  s_predicate(%rip), %rdi
//     0x1492ffb  leaq  ___block_literal_global(%rip), %rsi
//     0x1493002  popq  %rbp
//     0x1493003  jmp   0x1497674  ## _dispatch_once
//
// So instance() is a "sentinel == 0xffffffffffffffff means done" fast-path
// with a dispatch_once slow-path in the cold section. On first call, the
// cold path runs the block literal which allocates+constructs
// FFWorkerQueueThread and stores the pointer in s_instance.
//
// ─── ~FFWorkerQueueThreadD1Ev @Flexo 0x1305610 ────────────────────────────────
// (Complete-object dtor; ~40 disasm lines.)
//   0x1305610  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//   0x1305616  movq  %rdi, %rbx                ; save `this`
//   0x1305619  leaq  0x621330(%rip), %rax      ; load class vtable ptr
//                                              ; (self-relative from D1's addr:
//                                              ; 0x1305619 + 5 + 0x621330 = 0x192694e-ish
//                                              ; which is the FFWorkerQueueThread
//                                              ; vtable in Flexo's __DATA_CONST)
//   0x1305620  movq  %rax, (%rdi)              ; this->vtable = &class vtable
//                                              ; (canonical Itanium D1 "restore
//                                              ;  most-derived vtable before
//                                              ;  destructing subobjects")
//   0x1305623  movq  0x10(%rdi), %rdi          ; load field @+0x10
//   0x1305627  movq  $0x0, 0x10(%rbx)          ; clear it
//   0x130562f  testq %rdi, %rdi                ; null?
//   0x1305632  je    0x130563a
//   0x1305634  movq  (%rdi), %rax              ; load vtable of that owned obj
//   0x1305637  callq *0x8(%rax)                ; virtual dispatch slot [0x8]
//                                              ; (Itanium D1 in a virtual dtor)
//   0x130563a  movq  0x8(%rbx), %rdi           ; load field @+0x8
//   0x130563e  movq  $0x0, 0x8(%rbx)           ; clear it
//   0x1305646  testq %rdi, %rdi ; je ; ...     ; same null-check + virtual D1 pair
//                                              ; (second owned pointer @+0x8)
//   0x1305651  movq  0x10(%rbx), %rdi          ; load @+0x10 AGAIN (yes — see note)
//   0x1305655  movq  $0x0, 0x10(%rbx)          ;
//   ...       null-check + virtual D1
//   0x1305668  movq  0x8(%rbx), %rdi           ; load @+0x8 AGAIN
//   0x130566c  movq  $0x0, 0x8(%rbx)
//   0x130567c  addq  $0x8, %rsp / popq %rbx / popq %rbp
//   0x1305682  jmpq  *0x8(%rax)                ; TAIL-CALL final virtual D1
//
// Note on the "load @+0x10 AGAIN then load @+0x8 AGAIN" — the compiler
// emitted TWO separate release passes: first pass cleared and released the
// current pointers, second pass repeats the check to catch late writes that
// the first-pass virtual D1 chain might have introduced by re-entering the
// destructor via a shared owner. Faithful to the disasm; not an optimisation
// bug on our end.
//
// Struct layout proved by these loads:
//   this+0x00 : vtable pointer (canonical Itanium C++ ABI)
//   this+0x08 : some owned polymorphic object (has vtable, virtual D1 @slot 0x8)
//   this+0x10 : some other owned polymorphic object (same shape)
// The two double-releases hint these are shared/observer pointers between the
// two thread-runnable slots (probably a runnable + a runnable-adapter — matches
// FFWorkerQueueThreadRunnable that we ported alongside).
//
// ─── ~FFWorkerQueueThreadD0Ev @Flexo 0x1305690 ────────────────────────────────
// (Deleting dtor; 38 disasm lines.)
// Same as D1 but final step is `jmp __ZdlPv` (Flexo stub 0x1497404) instead
// of a virtual-D1 tail-call. Sequence identical up to the tail:
//   0x1305708  jmp   __ZdlPv
//
// FRONTIER CALLEES (undecoded — the ported code cites them; stubs THROW):
//   __ZN13FFWorkerQueue7addTaskEPNS_4TaskE.cold.1  ICF alias for
//                                                  __ZN19FFWorkerQueueThread8instanceEv.cold.1
//                                                  → _dispatch_once
//   _dispatch_once                                  libdispatch entry
//                                                  Flexo stub 0x1497674
//   ___block_literal_global                          the dispatch_once block
//                                                  (opaque Objective-C block —
//                                                   its body constructs the
//                                                   FFWorkerQueueThread singleton)
//   __ZdlPv                                          operator delete(void*)
//                                                  Flexo stub 0x1497404
//   virtual D1 slots @+0x8 of the two owned polymorphic objects
//                                                  (unknown identity — the
//                                                   compiler stripped the
//                                                   concrete type)

/**
 * Static predicate + instance pair — modelled as module-private state to
 * match the file-local `static` scope of the Flexo bss symbols. Not exported;
 * the singleton is only reachable through `FFWorkerQueueThread.instance()`.
 *
 * @Flexo 0x1c7f108  __ZZN19FFWorkerQueueThread8instanceEvE11s_predicate
 * @Flexo 0x1c7f100  __ZZN19FFWorkerQueueThread8instanceEvE10s_instance
 */
let s_predicate = 0;
let s_instance: FFWorkerQueueThread | null = null;

/**
 * The .cold.1 slow-path: call _dispatch_once on s_predicate with the
 * block-literal that constructs the singleton. In TS we cannot marshall a
 * real dispatch_once + Objective-C block; the ported cold path throws
 * citing the frontier callee.
 *
 * @Flexo 0x1492ff0 (ICF-coalesced with FFWorkerQueue::addTask.cold.1)
 *   0x1492ff4  arg1 = &s_predicate
 *   0x1492ffb  arg2 = &___block_literal_global
 *   0x1493003  jmp   _dispatch_once (Flexo stub 0x1497674)
 */
function _instance_cold_1(): void {
  // @Flexo 0x1493003 jmp _dispatch_once via stub 0x1497674
  throw new Error(
    "FFWorkerQueueThread::instance().cold.1 not yet transcribed " +
      "(frontier callee @Flexo 0x1493003 _dispatch_once via stub 0x1497674; " +
      "constructs the singleton via ___block_literal_global — unwired)",
  );
}

/**
 * FFWorkerQueueThread — the singleton-only class shape. Members proved by
 * the destructor's loads:
 *   this+0x00 : vtable   (Itanium C++ ABI)
 *   this+0x08 : owned polymorphic ptr A (virtual D1 @slot 0x8)
 *   this+0x10 : owned polymorphic ptr B (virtual D1 @slot 0x8)
 *
 * @Flexo symbols owned by this class:
 *   instance()   @0x1304ab0    (fast path)
 *   .cold.1      @0x1492ff0    (dispatch_once slow path — ICF alias)
 *   ~D1          @0x1305610
 *   ~D0          @0x1305690
 */
export class FFWorkerQueueThread {
  /** @Flexo this+0x08 — owned polymorphic runnable / thread. */
  slotA: { destroy(): void } | null = null;
  /** @Flexo this+0x10 — owned polymorphic runnable / thread. */
  slotB: { destroy(): void } | null = null;

  /**
   * FFWorkerQueueThread::instance()
   * @Flexo 0x1304ab0
   *
   *   0x1304ab0  cmpq  $-0x1, s_predicate(%rip)   ; -1 = "completed" marker
   *   0x1304ab8  jne   0x1304ac2                  ; slow path
   *   0x1304aba  movq  s_instance(%rip), %rax     ; fast path — return cached
   *   0x1304ac2  callq .cold.1                     ; run dispatch_once
   *   0x1304acc  movq  s_instance(%rip), %rax     ; return cached
   *
   * The `-0x1` comparison is dispatch_once_t's "already run" sentinel value
   * (libdispatch guarantees the predicate is set to ~0 after the block runs).
   * We preserve that convention with s_predicate === -1 (via the |0 cast so
   * the check runs on a 32-bit int rather than TS's default float compare).
   */
  static instance(): FFWorkerQueueThread | null {
    // @Flexo 0x1304ab0: cmpq $-0x1, s_predicate ; jne slow-path
    // We use `>>> 0` to match the ABI's unsigned interpretation; ~0 >>> 0 = 0xFFFFFFFF.
    if ((s_predicate | 0) !== -1) {
      // @Flexo 0x1304ac6 callq .cold.1 (dispatch_once)
      _instance_cold_1();
    }
    // @Flexo 0x1304acc: movq s_instance(%rip), %rax
    return s_instance;
  }

  /**
   * ~FFWorkerQueueThread() (D1 — complete-object destructor)
   * @Flexo 0x1305610.
   *
   * Restores the class vtable @0x1305619..0x1305620, then releases the two
   * owned polymorphic slots @+0x8 and @+0x10 in a two-pass shape, tail-calling
   * the final virtual D1 @0x1305682.
   *
   * Every observable step below reaches a virtual D1 slot at +0x8 of an
   * undecoded polymorphic object — those are frontier callees. Faithfulness
   * requires we invoke them (or throw citing their addresses).
   */
  destroy(): void {
    // @Flexo 0x1305619..0x1305620: restore vtable — the vtable pointer is a
    // pure runtime-model concept in TS; noop preserves observable behaviour
    // (there is no downstream code that reads a "vtable slot" from a TS obj).

    // We route the two owned-slot fields through an untyped indexed accessor
    // so TS's control-flow narrowing does not collapse the second-pass reads
    // (which mirror the disasm's second-pass loads @0x1305651 / @0x1305668)
    // to `never` after the first pass nulls them.
    type OwnedSlot = { destroy(): void } | null;
    const self = this as unknown as { slotA: OwnedSlot; slotB: OwnedSlot };

    // @Flexo 0x1305623..0x1305637: first release of slotB (@+0x10 — treated
    // first in the disasm's release order; assignment order matches x86 layout).
    const a1: OwnedSlot = self.slotB;
    self.slotB = null;
    if (a1 !== null) {
      // @Flexo 0x1305637 callq *0x8(%rax) — virtual D1
      a1.destroy();
    }
    // @Flexo 0x130563a..0x130564e: first release of slotA (@+0x8)
    const b1: OwnedSlot = self.slotA;
    self.slotA = null;
    if (b1 !== null) {
      // @Flexo 0x130564e callq *0x8(%rax) — virtual D1
      b1.destroy();
    }
    // @Flexo 0x1305651..0x1305665: second pass on slot @+0x10
    const a2 = (self as { slotB: OwnedSlot }).slotB;
    self.slotB = null;
    if (a2 !== null) {
      // @Flexo 0x1305665 callq *0x8(%rax)
      (a2 as { destroy(): void }).destroy();
    }
    // @Flexo 0x1305668..0x1305682: second pass on slot @+0x8, tail-called
    const b2 = (self as { slotA: OwnedSlot }).slotA;
    self.slotA = null;
    if (b2 !== null) {
      // @Flexo 0x1305682 jmpq *0x8(%rax) — TAIL CALL to virtual D1
      (b2 as { destroy(): void }).destroy();
    }
  }

  /**
   * ~FFWorkerQueueThread() (D0 — deleting destructor)
   * @Flexo 0x1305690.
   *
   * Identical sequence to D1 up until the tail: instead of tail-calling the
   * final virtual D1, D0 tail-calls `operator delete` (Flexo stub 0x1497404).
   * In TS the GC subsumes operator delete; observable behaviour differs only
   * in that the storage is not eagerly reclaimed.
   */
  destroyAndFree(): void {
    // Same destroy chain as D1.
    this.destroy();
    // @Flexo 0x1305708 jmp __ZdlPv (Flexo stub 0x1497404) — TS GC handles this.
  }
}

