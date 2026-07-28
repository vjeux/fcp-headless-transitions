// FFCentralDecodingUnitManager.ts — Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (see raw-port/re/disasm/Flexo.FFCentralDecodingUnitManager.all.s).
//
// SYMBOLS (nm -arch x86_64 Flexo | c++filt):
//   0x0000000000dff150 T __ZN28FFCentralDecodingUnitManager7lockCDUEv
//                                    FFCentralDecodingUnitManager::lockCDU()
//   0x0000000000dff300 T __ZN28FFCentralDecodingUnitManager8shutdownEv
//                                    FFCentralDecodingUnitManager::shutdown()
//   0x0000000000dff350 T __ZN28FFCentralDecodingUnitManager6getCDUEv
//                                    FFCentralDecodingUnitManager::getCDU()
//   0x0000000000dff360 T __ZN28FFCentralDecodingUnitManager10releaseCDUEv
//                                    FFCentralDecodingUnitManager::releaseCDU()
//   0x0000000001489030 T __ZN28FFCentralDecodingUnitManager7lockCDUEv.cold.1
//                                    FFCentralDecodingUnitManager::lockCDU() (.cold.1)
//                                    — the cold trap invoked by __cxa_guard_abort/abort path
//                                      of the dispatch_once initializer at @0xdff17f (the
//                                      "callq _CDU_processToken.cold.1" edge; only reached
//                                      if the guard predicate is in the ABORT sentinel state).
//                                      Non-portable (calls __cxa_call_unexpected/abort) —
//                                      throw-stub only.
//
// STATIC MEMBERS (RIP-const globals, read at multiple sites in the disasm):
//   __ZZN28FFCentralDecodingUnitManager7lockCDUEvE11s_predicate
//        FFCentralDecodingUnitManager::lockCDU()::s_predicate
//        int64  dispatch_once predicate cell (compared to -1 at @0xdff154 in lockCDU;
//        Itanium-ABI-style dispatch_once wrapper).
//   __ZN28FFCentralDecodingUnitManager11s_semaphoreE
//        FFCentralDecodingUnitManager::s_semaphore
//        dispatch_semaphore_t  (loaded @0xdff15e, 0xdff184, 0xdff339, 0xdff364, ...).
//        A pthread-mutex-like semaphore initialized to count=1 (single-slot binary
//        semaphore) so that pairs of wait()/signal() serialize access to `s_cdu`.
//   __ZN28FFCentralDecodingUnitManager5s_cduE
//        FFCentralDecodingUnitManager::s_cdu
//        FFCentralDecodingUnit*  (loaded @0xdff176, 0xdff31c, 0xdff354; stored
//        @0xdff240 in the block_invoke initializer, @0xdff32e cleared in shutdown()).
//
// FRONTIER CALLEES (referenced from the block_invoke initializer @0xdff1a0-0xdff252):
//   _dispatch_semaphore_create  (libdispatch)          — @0xdff1ac, @0xdff22d
//   _dispatch_semaphore_wait    (libdispatch)          — @0xdff171, @0xdff317
//   _dispatch_semaphore_signal  (libdispatch)          — @0xdff341 (tailcall), @0xdff371 (tailcall)
//   _dispatch_queue_create      (libdispatch)          — @0xdff212
//   _dispatch_queue_attr_make_with_autorelease_frequency (libdispatch)
//                                                     — @0xdff203
//   __Znwm                       (operator new(size_t)) — @0xdff1bd (0x70 = 112 bytes alloc
//                                                                    for an FFCentralDecodingUnit)
//   __ZN6PCInfo14getPhysicalCPUEv (PCInfo::getPhysicalCPU()) — @0xdff1c5 (result clamped
//                                                              min=20 via `cmpl $0x15, %eax; movl $0x14,%r14d; cmovgel %eax,%r14d`)
//   _atexit                                            — @0xdff252 tailcall registering shutdown()
//   __ZdlPv (operator delete)                          — @0xdff25d (unwind path)
//   __Unwind_Resume                                    — @0xdff265 (unwind path)
//   The FFCentralDecodingUnit vtable is loaded from RIP-const @0xdff1d7 (leaq 0xb16fea(%rip))
//   and again @0xdff236 (leaq 0xb16fb3(%rip)); the second is the "fully-constructed" vtable
//   (post-inner-semaphore-create), matching the canonical two-phase C++ ctor vtable stitch
//   pattern.  A third identical vtable-set is used by the standalone constructor
//   __ZN21FFCentralDecodingUnitC1Ev at @0xdff270-0xdff2f9 (the same body without the
//   `s_cdu` store and atexit registration).
//
// STRUCT LAYOUT (FFCentralDecodingUnit — recovered from the block_invoke initializer at
// @0xdff1a0-0xdff247 and the ctor at @0xdff270-0xdff2f9; sizeof = 0x70 = 112 bytes):
//   +0x00  vtbl  : *const void            // vtable ptr — stored @0xdff1de, @0xdff23d, @0xdff293, @0xdff2f2
//   +0x08  ..0x48 : zeroed (5 xmm0 stores)  // @0xdff1e4/1e8/1ec/1f0/1f4 and @0xdff299/29d/2a1/2a5/2a9
//   +0x50  queue : dispatch_queue_t       // "com.apple.flexo.cdufig" — @0xdff217, @0xdff2cc
//   +0x58  flag  : uint8                  // zeroed — @0xdff21b, @0xdff2d0
//   +0x5c  nCPU  : int32                  // max(20, PCInfo::getPhysicalCPU()) — @0xdff21f, @0xdff2d4
//   +0x60  count : int32                  // zero — @0xdff223, @0xdff2d8
//   +0x68  inner : dispatch_semaphore_t   // dispatch_semaphore_create(nCPU) — @0xdff232, @0xdff2e7
// Only vtbl (+0x00) is ever read by the four methods transcribed below (via `movq (%rdi),%rax;
// callq *0x8(%rax)` at @0xdff328 = virtual destructor slot 1). The rest of the layout is only
// exercised by FFCentralDecodingUnit's own methods (out of scope for this class).
//
// ── PORTING NOTES ────────────────────────────────────────────────────────
// This TS runtime is single-threaded (Node harness + FCP-Transitions player), so a
// dispatch_semaphore with initial count=1 degenerates to a NO-OP: wait() always succeeds
// immediately without blocking, and signal() has nothing to unblock.  Correctness of
// the `s_cdu` state is preserved because there is no concurrent access.  We therefore
// model s_semaphore as a boolean "initialized" flag and treat wait()/signal() as no-ops,
// mirroring what the release binary would observe in a single-threaded caller.  The
// real dispatch_semaphore create/wait/signal callees are frontier symbols and are NOT
// transcribed; any caller that actually needs cross-thread serialization must supply
// a real dispatch implementation.
//
// FFCentralDecodingUnit itself is a frontier class (its ctor allocates a dispatch_queue
// and inner semaphore, and its virtual dtor at vtbl+0x8 is never seen in disasm here).
// We reference it by pointer; the actual FFCentralDecodingUnit port lives in a separate
// worktree/branch (see git worktree list -> port/FFCentralDecodingUnit).

/**
 * FFCentralDecodingUnit — forward-declared frontier type.  This class (Flexo, sizeof=0x70)
 * owns a dispatch_queue "com.apple.flexo.cdufig" plus an inner dispatch_semaphore(count=nCPU).
 * Its ctor is __ZN21FFCentralDecodingUnitC1Ev @Flexo 0xdff270; its virtual destructor lives
 * at vtable slot +0x8 (called from FFCentralDecodingUnitManager::shutdown @0xdff32b).
 *
 * Only vtbl (+0x00) is read by FFCentralDecodingUnitManager itself; the remainder of the
 * layout is exercised by FFCentralDecodingUnit's own methods (separate port).
 */
export interface FFCentralDecodingUnit {
  // Nominal handle. Real fields are recovered/ported in the FFCentralDecodingUnit port.
  readonly __brand: "FFCentralDecodingUnit";
}

// ── static globals (RIP-const singletons in the .bss/.data of Flexo) ─────────
//
// s_predicate is the Itanium-ABI dispatch_once "one-shot" cell. In the real binary it is a
// 64-bit value that walks the states { 0 = uninitialized -> in-progress -> -1 = done, or
// ABORT-sentinel = fatal }. Compared to -0x1 at @0xdff154. In this single-threaded TS port
// we model it as a plain boolean "already initialized".
let s_predicate_done = false;

// s_semaphore is a dispatch_semaphore_t (RIP: __ZN28FFCentralDecodingUnitManager11s_semaphoreE).
// In this single-threaded port we model existence-only: null == "not yet created", non-null
// == "created with count=1".  The wait()/signal() operations are no-ops here (see notes above).
let s_semaphore: { count: number } | null = null;

// s_cdu is the singleton FFCentralDecodingUnit*.  RIP-const at
// __ZN28FFCentralDecodingUnitManager5s_cduE.  Stored @0xdff240 in the block_invoke initializer,
// cleared to 0 @0xdff32e in shutdown(), returned to callers by lockCDU()/getCDU().
let s_cdu: FFCentralDecodingUnit | null = null;

/**
 * dispatch_semaphore_wait (libdispatch, frontier).  Single-threaded no-op in this port.
 * Cited @0xdff171 (lockCDU) and @0xdff317 (shutdown).  The real callee blocks the caller
 * until the semaphore count > 0, then decrements; in a single-threaded runtime with a
 * binary semaphore this always completes immediately.
 */
function dispatch_semaphore_wait_noop(sem: { count: number } | null): void {
  if (sem === null) return;
  // Real behavior would block if sem.count <= 0. In single-threaded TS we cannot deadlock
  // (there's no other thread to signal us), so we simply account the decrement.
  sem.count -= 1;
}

/**
 * dispatch_semaphore_signal (libdispatch, frontier).  Single-threaded no-op in this port.
 * Cited @0xdff341 (shutdown tailcall), @0xdff371 (releaseCDU tailcall), @0xdff419 (in
 * _CDU_processToken; that function is out of scope for this class).
 */
function dispatch_semaphore_signal_noop(sem: { count: number } | null): void {
  if (sem === null) return;
  sem.count += 1;
}

/**
 * The dispatch_once initializer body — Itanium-ABI's "block_invoke" trampoline at
 * ____ZN28FFCentralDecodingUnitManager7lockCDUEv_block_invoke @0xdff1a0.  It:
 *   1. dispatch_semaphore_create(1)                  -> s_semaphore   @0xdff1ac,0xdff1b1
 *   2. operator new(0x70)                            -> raw block     @0xdff1bd
 *   3. PCInfo::getPhysicalCPU(); nCPU=max(0x14, eax) [clamp]           @0xdff1c5-0xdff1d3
 *   4. write partial-ctor vtable @+0x00              (leaq 0xb16fea)  @0xdff1d7,0xdff1de
 *   5. zero +0x08..+0x48 (5 xmm0 stores + qword)                       @0xdff1e1-0xdff1fc
 *   6. dispatch_queue_attr_make_with_autorelease_frequency(0, 1)      @0xdff203
 *   7. dispatch_queue_create("com.apple.flexo.cdufig", attr) -> +0x50 @0xdff212,0xdff217
 *   8. zero +0x58 (byte); write nCPU to +0x5c; zero +0x60             @0xdff21b-0xdff223
 *   9. dispatch_semaphore_create(nCPU) -> +0x68                       @0xdff22d,0xdff232
 *  10. write final-ctor vtable @+0x00                                 @0xdff236,0xdff23d
 *  11. s_cdu = new block                                              @0xdff240
 *  12. atexit(&FFCentralDecodingUnitManager::shutdown)                @0xdff247,0xdff252 tailcall
 *
 * All of steps 1, 2, 3, 6, 7, 9, 12 are frontier libdispatch/libc/PCInfo callees. Rather
 * than throw-stub each callee (which would prevent lockCDU() from ever succeeding), we
 * mirror the SEMANTICS of the initializer for the single-threaded TS runtime: create
 * s_semaphore (as a no-op counter) and s_cdu (as an opaque nominal handle so callers can
 * hold and pass it), and skip atexit (there is no process-exit hook in the TS harness;
 * callers who need shutdown must invoke it directly).
 */
function lockCDU_block_invoke(): void {
  // @0xdff1a0 block_invoke entry.
  // step 1: dispatch_semaphore_create(1) — single-threaded model: count=1 binary sem.
  s_semaphore = { count: 1 };
  // steps 2-11: allocate + initialize the FFCentralDecodingUnit itself. The internals
  // (dispatch_queue, inner semaphore, nCPU field, etc.) are FFCentralDecodingUnit's own
  // state and are exercised only by its own methods (separate port). We publish an
  // opaque nominal handle so this class's callers can round-trip the pointer.
  s_cdu = { __brand: "FFCentralDecodingUnit" } as FFCentralDecodingUnit;
  // step 12: atexit(&shutdown) — no process-exit hook in the TS harness; callers who
  // need shutdown must invoke it explicitly. This matches the Node parity harness which
  // does not execute atexit chains.
}

/**
 * FFCentralDecodingUnitManager::lockCDU() @Flexo 0xdff150
 *
 * Asm (@0xdff150-0xdff192):
 *   pushq %rbp; movq %rsp,%rbp                                          @0xdff150-0xdff151
 *   cmpq $-0x1, s_predicate(%rip)                                       @0xdff154 — check dispatch_once done
 *   jne  0xdff17f                            // predicate != -1 -> run initializer
 *   // -- fast path: already initialized --
 *   movq s_semaphore(%rip), %rdi                                        @0xdff15e
 *   testq %rdi,%rdi; je 0xdff176                                        @0xdff165,0xdff168 — skip wait if null
 *   movq $-0x1, %rsi                                                    @0xdff16a — timeout = DISPATCH_TIME_FOREVER
 *   callq _dispatch_semaphore_wait                                      @0xdff171 (frontier)
 *   movq s_cdu(%rip), %rax                                              @0xdff176
 *   popq %rbp; retq                                                     @0xdff17d-0xdff17e
 *   // -- slow path: run initializer --
 *   0xdff17f: callq _CDU_processToken.cold.1                            @0xdff17f  // NB: this is the ABI-mangled
 *                                                                              // dispatch_once thunk — it actually
 *                                                                              // runs block_invoke and sets
 *                                                                              // s_predicate to -1 on success.
 *   movq s_semaphore(%rip), %rdi                                        @0xdff184
 *   testq %rdi,%rdi; jne 0xdff16a                                       @0xdff18b,0xdff18e — fall through to wait
 *   jmp 0xdff176                                                        @0xdff190 — skip wait, load s_cdu
 *
 * Returns the singleton FFCentralDecodingUnit* AFTER acquiring the manager-level lock.
 * The caller MUST subsequently invoke releaseCDU() to release it.
 */
export function FFCentralDecodingUnitManager_lockCDU(): FFCentralDecodingUnit | null {
  // @0xdff154: cmpq $-0x1, s_predicate(%rip); jne 0xdff17f
  if (!s_predicate_done) {
    // @0xdff17f: dispatch_once slow path — run block_invoke, then set predicate=-1.
    lockCDU_block_invoke();
    s_predicate_done = true;
    // @0xdff184: movq s_semaphore(%rip), %rdi; testq/jne 0xdff16a — after init, sem is non-null,
    // so we fall into the wait path below.
  }
  // @0xdff15e: movq s_semaphore(%rip), %rdi
  const sem = s_semaphore;
  // @0xdff165-0xdff168: testq %rdi,%rdi; je 0xdff176
  if (sem !== null) {
    // @0xdff16a-0xdff171: movq $-0x1,%rsi; callq _dispatch_semaphore_wait — DISPATCH_TIME_FOREVER.
    dispatch_semaphore_wait_noop(sem);
  }
  // @0xdff176: movq s_cdu(%rip), %rax; popq %rbp; retq
  return s_cdu;
}

/**
 * FFCentralDecodingUnitManager::shutdown() @Flexo 0xdff300
 *
 * Asm (@0xdff300-0xdff347):
 *   movq s_semaphore(%rip), %rdi                                        @0xdff300
 *   testq %rdi,%rdi; je 0xdff346                                        @0xdff307,0xdff30a — no sem -> ret
 *   pushq %rbp; movq %rsp,%rbp                                          @0xdff30c-0xdff30d
 *   movq $-0x1, %rsi                                                    @0xdff310 — DISPATCH_TIME_FOREVER
 *   callq _dispatch_semaphore_wait                                      @0xdff317 (frontier)
 *   movq s_cdu(%rip), %rdi                                              @0xdff31c
 *   testq %rdi,%rdi; je 0xdff32e                                        @0xdff323,0xdff326 — no cdu -> skip delete
 *   movq (%rdi), %rax                                                   @0xdff328 — load vtable
 *   callq *0x8(%rax)                                                    @0xdff32b — virtual dtor (slot 1, "deleting" per Itanium ABI)
 *   0xdff32e: movq $0x0, s_cdu(%rip)                                    @0xdff32e — clear singleton
 *   movq s_semaphore(%rip), %rdi                                        @0xdff339
 *   popq %rbp                                                           @0xdff340
 *   jmp _dispatch_semaphore_signal                                      @0xdff341 (tailcall)
 *   0xdff346: retq
 *
 * Deletes the singleton FFCentralDecodingUnit under the manager lock (via the virtual
 * "deleting destructor" at vtable slot +0x8), clears s_cdu, and releases the lock.
 * Idempotent: safe to call when s_semaphore is null (returns immediately).
 */
export function FFCentralDecodingUnitManager_shutdown(): void {
  // @0xdff300-0xdff30a: load s_semaphore, if null -> retq.
  const sem = s_semaphore;
  if (sem === null) {
    return;
  }
  // @0xdff310-0xdff317: dispatch_semaphore_wait(sem, DISPATCH_TIME_FOREVER).
  dispatch_semaphore_wait_noop(sem);
  // @0xdff31c-0xdff32b: if (s_cdu) { vtable=*s_cdu; (*vtable[1])(s_cdu); }
  const cdu = s_cdu;
  if (cdu !== null) {
    // @0xdff328,0xdff32b: virtual "deleting destructor" at vtbl+0x8 — not yet transcribed
    // (FFCentralDecodingUnit is a frontier class; its vtable slot 1 is its virtual dtor,
    // which frees the dispatch_queue, the inner semaphore, and the 112-byte block via
    // operator delete). See FFCentralDecodingUnit port. In this TS runtime the opaque
    // handle has no owned resources beyond the reference we hold, so nulling s_cdu below
    // is sufficient for GC to reclaim it.
  }
  // @0xdff32e: s_cdu = nullptr
  s_cdu = null;
  // @0xdff339-0xdff341: tailcall dispatch_semaphore_signal(s_semaphore).
  dispatch_semaphore_signal_noop(s_semaphore);
}

/**
 * FFCentralDecodingUnitManager::getCDU() @Flexo 0xdff350
 *
 * Asm (@0xdff350-0xdff35d):
 *   pushq %rbp; movq %rsp,%rbp                                          @0xdff350-0xdff351
 *   movq s_cdu(%rip), %rax                                              @0xdff354
 *   popq %rbp; retq                                                     @0xdff35b-0xdff35c
 *   nopl (%rax)                                                         @0xdff35d — padding
 *
 * Unlocked read of the singleton pointer. Callers who need mutual exclusion must use
 * lockCDU()/releaseCDU() instead.
 */
export function FFCentralDecodingUnitManager_getCDU(): FFCentralDecodingUnit | null {
  // @0xdff354: movq s_cdu(%rip), %rax
  return s_cdu;
}

/**
 * FFCentralDecodingUnitManager::releaseCDU() @Flexo 0xdff360
 *
 * Asm (@0xdff360-0xdff377):
 *   pushq %rbp; movq %rsp,%rbp                                          @0xdff360-0xdff361
 *   movq s_semaphore(%rip), %rdi                                        @0xdff364
 *   testq %rdi,%rdi; je 0xdff376                                        @0xdff36b,0xdff36e — no sem -> ret
 *   popq %rbp                                                           @0xdff370
 *   jmp _dispatch_semaphore_signal                                      @0xdff371 (tailcall)
 *   0xdff376: popq %rbp; retq                                           @0xdff376-0xdff377
 *
 * Releases the manager lock acquired by lockCDU(). Idempotent when s_semaphore is null
 * (i.e., lockCDU() has never been called).
 */
export function FFCentralDecodingUnitManager_releaseCDU(): void {
  // @0xdff364: movq s_semaphore(%rip), %rdi
  const sem = s_semaphore;
  // @0xdff36b-0xdff36e: testq/je -> if null, return.
  if (sem === null) {
    return;
  }
  // @0xdff371 tailcall: dispatch_semaphore_signal(sem).
  dispatch_semaphore_signal_noop(sem);
}

/**
 * FFCentralDecodingUnitManager::lockCDU() (.cold.1) @Flexo 0x1489030
 *
 * The dispatch_once "abort" cold trap — reached only if s_predicate is in the ABORT
 * sentinel state (i.e., a prior initializer threw and left the guard poisoned). In the
 * real binary this branch calls __cxa_call_unexpected/abort. Not portable in isolation;
 * exposed as a throwing stub citing its address.
 */
export function FFCentralDecodingUnitManager_lockCDU_cold_1(): never {
  throw new Error(
    "FFCentralDecodingUnitManager::lockCDU()::cold.1 not yet transcribed @0x1489030 (Flexo) — dispatch_once abort trap; frontier callees __cxa_call_unexpected/abort.",
  );
}

/**
 * TEST-ONLY reset hook.  The real binary has no such reset — s_predicate/s_semaphore/s_cdu
 * are process-lifetime globals mutated only by lockCDU() (initialize) and shutdown()
 * (partially: clears s_cdu but keeps s_semaphore alive; s_predicate stays -1 forever
 * so a post-shutdown lockCDU() would try to wait() on the still-live semaphore against
 * a null s_cdu). We expose this hook for parity harnesses that need to run multiple
 * independent scenarios in a single process; production code MUST NOT call it.
 */
export function __resetForTests(): void {
  s_predicate_done = false;
  s_semaphore = null;
  s_cdu = null;
}
