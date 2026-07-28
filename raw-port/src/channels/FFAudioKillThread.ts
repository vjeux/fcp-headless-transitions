// FFAudioKillThread — Flexo's process-wide singleton audio-kill worker.
//
// Faithful transcription @0x00000000d0aeb0..0x00000000d0b057 from FCP's
// Flexo framework at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//     Versions/A/Flexo
//
// This is a WorkerThread subclass owned by a function-local static
// dispatch_once singleton, protected across kill/add by a global FFLockBase
// (`s_instanceLock`). The purpose is a background thread that services
// FFAudioKillThreadTask items — i.e. releases audio-graph resources off the
// hot audio path so real-time callbacks don't stall on destructors.
//
// nm evidence (`nm -arch x86_64 -m Flexo | grep FFAudioKillThread`):
//   0000000000d0aeb0 T __ZN17FFAudioKillThread8instanceEv
//   0000000000d0aee0 t ____ZN17FFAudioKillThread8instanceEv_block_invoke
//   0000000000d0af30 T __ZN17FFAudioKillThread10killThreadEv
//   0000000000d0af90 T __ZN17FFAudioKillThread11addKillTaskEP21FFAudioKillThreadTask
//   0000000000d0b030 T __ZN17FFAudioKillThreadD1Ev
//   0000000000d0b040 T __ZN17FFAudioKillThreadD0Ev
//   0000000001487670 t __ZN17FFAudioKillThread8instanceEv.cold.1
//   0000000001487690 t __ZN17FFAudioKillThread11addKillTaskEP21FFAudioKillThreadTask.cold.1
//   0000000001c96378 C __ZN17FFAudioKillThread10s_instanceE
//   0000000001c96380 C __ZN17FFAudioKillThread14s_instanceLockE
//   0000000001c7f4c0 b __ZZN17FFAudioKillThread8instanceEvE9predicate
//   0000000001911218 D __ZTV17FFAudioKillThread                (class vtable)
//   0000000001911238 D __ZTI17FFAudioKillThread                (RTTI)
//   000000000157d9aa T __ZTS17FFAudioKillThread                (typeinfo name)
//   00000000019119b0 D __ZTI21FFAudioKillThreadTask            (RTTI of task base)
//   000000000157de98 T __ZTS21FFAudioKillThreadTask            (typeinfo name)
//
// Static bss layout:
//   __ZN17FFAudioKillThread10s_instanceE       @Flexo 0x1c96378  (class-scope)
//   __ZN17FFAudioKillThread14s_instanceLockE   @Flexo 0x1c96380  (FFLockBase*)
//   __ZZN17FFAudioKillThread8instanceEvE9predicate @Flexo 0x1c7f4c0
//     — function-local static dispatch_once_t (sentinel value ~0 = "done")
//
// Disassembly saved at:
//   raw-port/re/disasm/Flexo.FFAudioKillThread.instance.s          (12 lines)
//   raw-port/re/disasm/Flexo.FFAudioKillThread.killThread.s        (26 lines)
//   raw-port/re/disasm/Flexo.FFAudioKillThread.addKillTask.s       (45 lines)
//   raw-port/re/disasm/Flexo.FFAudioKillThread.~FFAudioKillThread.s (D0, 13 lines)
//   D1 body recovered via `awk` over /tmp/Flexo_tV.txt at
//     __ZN17FFAudioKillThreadD1Ev (6 lines — thin trampoline to WorkerThread::~D2)
//   block_invoke body recovered similarly (24 lines — the singleton ctor)
//
// ─── instance() @Flexo 0xd0aeb0 ───────────────────────────────────────────────
//   __ZN17FFAudioKillThread8instanceEv:
//     0xd0aeb0  cmpq  $-0x1, predicate(%rip)    ; dispatch_once "done" sentinel
//     0xd0aeb8  jne   0xd0aec2                  ; slow path (not yet run)
//     0xd0aeba  movq  s_instance(%rip), %rax    ; fast path — return cached
//     0xd0aec1  retq
//     0xd0aec2  pushq %rbp / movq %rsp,%rbp
//     0xd0aec6  callq .cold.1                    ; dispatch_once trampoline
//     0xd0aecb  popq  %rbp
//     0xd0aecc  movq  s_instance(%rip), %rax
//     0xd0aed3  retq
//
// ─── instance()._block_invoke @Flexo 0xd0aee0 ─────────────────────────────────
// This is the dispatch_once block body — the actual singleton constructor:
//   0xd0aee7  movl  $0x18, %edi              ; alloc 24 bytes (WorkerThread + 8 fields)
//   0xd0aeec  callq __Znwm                   ; operator new
//   0xd0aef4  leaq  "com.apple.flexo.audio-kill-thread"(%rip), %rsi
//   0xd0aefe  callq __ZN12WorkerThreadC2EPKc  ; WorkerThread::WorkerThread(name)
//   0xd0af03  leaq  vtable_offset(%rip), %rax ; @0xd0af03 + 5 + 0xc0631e = 0x1911228
//                                              ; = __ZTV17FFAudioKillThread + 0x10
//                                              ; (canonical vtable slot pointer:
//                                              ;  vtable base 0x1911218 + 16 = &vptr)
//   0xd0af0d  movq  %rbx, s_instance(%rip)   ; publish
//   0xd0af18  retq
//   0xd0af19..0xd0af28: Itanium C++ personality landing pad — if
//                       WorkerThread ctor threw, call operator delete on the
//                       storage then _Unwind_Resume (rethrow).
//
// So the singleton is a 24-byte object: 8-byte vtable + 16 bytes of WorkerThread
// state. The vtable is Flexo's FFAudioKillThread class vtable.
//
// The C++ instance name string "com.apple.flexo.audio-kill-thread" identifies
// this as the "audio-kill-thread" of the flexo audio subsystem.
//
// ─── killThread() @Flexo 0xd0af30 ─────────────────────────────────────────────
//   __ZN17FFAudioKillThread10killThreadEv:
//     0xd0af3b  movq  s_instanceLock(%rip), %rsi   ; load FFLockBase*
//     0xd0af42  leaq  -0x20(%rbp), %r14            ; &FFLocker on stack
//     0xd0af46  movq  %r14, %rdi                   ; this = &FFLocker
//     0xd0af49  xorl  %edx, %edx                   ; type = 0 (LockType::Read? or default)
//     0xd0af4b  callq FFLocker::FFLocker(FFLockBase*, FFLocker::LockType)
//     0xd0af50  movq  s_instance(%rip), %rbx       ; save old instance
//     0xd0af57  movq  $0x0, s_instance(%rip)       ; s_instance = nullptr
//     0xd0af62  movq  %r14, %rdi
//     0xd0af65  callq FFLocker::~FFLocker()        ; unlock
//     0xd0af6a  testq %rbx, %rbx                   ; if (old != null)
//     0xd0af6d  je    0xd0af78
//     0xd0af6f  movq  (%rbx), %rax                 ;   vtable = *old
//     0xd0af72  movq  %rbx, %rdi
//     0xd0af75  callq *0x8(%rax)                   ;   virtual dispatch @slot 0x8
//                                                  ;   (Itanium ABI: D1 in a
//                                                  ;    virtual dtor = complete
//                                                  ;    object destructor)
//     0xd0af78  addq $0x10, %rsp / popq %rbx / popq %r14 / popq %rbp / retq
//
// Semantics: atomically null out s_instance under the lock (so nobody else
// grabs a stale pointer), then destroy the old singleton if it existed.
//
// ─── addKillTask(task) @Flexo 0xd0af90 ────────────────────────────────────────
//   __ZN17FFAudioKillThread11addKillTaskEP21FFAudioKillThreadTask:
//     0xd0af99  movq  %rdi, %rbx                   ; save task ptr
//     0xd0af9c  movq  s_instanceLock(%rip), %rsi   ; load FFLockBase*
//     0xd0afa3  leaq  -0x18(%rbp), %rdi            ; &FFLocker
//     0xd0afa7  xorl  %edx, %edx                   ; type = 0
//     0xd0afa9  callq FFLocker::FFLocker(FFLockBase*, FFLocker::LockType)
//     0xd0afae  cmpq  $-0x1, predicate(%rip)       ; is singleton constructed?
//     0xd0afb6  jne   0xd0afdc                     ; NO → slow path (init first)
//     0xd0afb8  movq  s_instance(%rip), %rdi       ; instance ptr (as this-arg)
//     0xd0afbf  testq %rdi, %rdi                   ; if (instance != null)
//     0xd0afc2  je    0xd0afed                     ; NO → task-drop path
//     0xd0afc4  movq  %rbx, %rsi                   ; arg2 = task
//     0xd0afc7  callq WorkerThread::addTask(WorkerThread::Task*)
//     0xd0afcc  leaq  -0x18(%rbp), %rdi
//     0xd0afd0  callq FFLocker::~FFLocker()        ; unlock
//     0xd0afd5  addq $0x18,%rsp / popq %rbx / popq %rbp / retq
//     0xd0afdc  callq .cold.1                       ; slow path: dispatch_once
//     0xd0afe1  movq  s_instance(%rip), %rdi
//     0xd0afe8  testq %rdi, %rdi
//     0xd0afeb  jne   0xd0afc4                     ; init succeeded → deliver
//     0xd0afed  leaq  -0x18(%rbp), %rdi            ; killThread ran between:
//     0xd0aff1  callq FFLocker::~FFLocker()        ;   unlock,
//     0xd0aff6  movq  (%rbx), %rax                 ;   virtual call task->[0x10]
//     0xd0aff9  movq  %rbx, %rdi                   ;   (Itanium: 3rd slot after
//     0xd0affc  callq *0x10(%rax)                  ;    RTTI/offset-to-top ptrs)
//     0xd0afff  movq  (%rbx), %rax                 ;   then task->[0x28]
//     0xd0b002  movq  %rbx, %rdi                   ;   (5th slot)
//     0xd0b005  callq *0x28(%rax)                  ;
//     0xd0b008  addq $0x18,%rsp / popq %rbx / popq %rbp / retq
//     0xd0b00f..: cleanup landing pad — unlock, then _Unwind_Resume(exception).
//
// So addKillTask has THREE paths:
//   (A) fast: predicate=done, instance!=null → forward to WorkerThread::addTask
//   (B) cold: predicate!=done → run dispatch_once, then check instance again
//   (C) drop: instance==null (killThread already ran) → dispose the task
//       by two virtual calls at task-vtable slots +0x10 and +0x28. These are
//       the Itanium C++ ABI virtual-slot indices on the FFAudioKillThreadTask
//       polymorphic base — after fixed prefix (RTTI + offset-to-top) the
//       first two user-defined virtuals live at +0x10 and +0x28. The
//       compiler chose this pair to fully release the task without ever
//       enqueuing it. Names of these slots are undecoded — they are FRONTIER.
//
// ─── ~FFAudioKillThreadD1Ev @Flexo 0xd0b030 ───────────────────────────────────
//   __ZN17FFAudioKillThreadD1Ev:
//     0xd0b030  pushq %rbp / movq %rsp,%rbp / popq %rbp
//     0xd0b035  jmp   __ZN12WorkerThreadD2Ev         ; TAIL CALL to base D2
//
// Thin trampoline — no FFAudioKillThread-specific members to release; all
// state lives in the WorkerThread base.
//
// ─── ~FFAudioKillThreadD0Ev @Flexo 0xd0b040 ───────────────────────────────────
//   __ZN17FFAudioKillThreadD0Ev:
//     0xd0b049  callq __ZN12WorkerThreadD2Ev        ; base D2
//     0xd0b055..0xd0b057  jmp __ZdlPv                ; TAIL CALL operator delete
//
// FRONTIER CALLEES (undecoded — the ported code cites them; stubs THROW):
//   __ZN12WorkerThreadC2EPKc      WorkerThread::WorkerThread(char const*)
//                                  Flexo — invoked in the block_invoke
//   __ZN12WorkerThreadD2Ev        WorkerThread::~WorkerThread()
//                                  Flexo — invoked in ~D1 / ~D0
//   __ZN12WorkerThread7addTaskEPNS_4TaskE   WorkerThread::addTask(WorkerThread::Task*)
//                                  Flexo — dispatched in addKillTask
//   __ZN8FFLockerC1EP10FFLockBaseNS_8LockTypeE   FFLocker(FFLockBase*, LockType)
//                                  Flexo — RAII lock guard ctor
//   __ZN8FFLockerD1Ev              FFLocker::~FFLocker()
//                                  Flexo — RAII lock guard dtor
//   __Znwm                         operator new(size_t)  Flexo stub 0x1497452
//   __ZdlPv                        operator delete(void*) Flexo stub 0x1497404
//   _dispatch_once                 libdispatch — Flexo stub (via .cold.1)
//   ___block_literal_global        the "instance()" dispatch_once block
//   FFAudioKillThreadTask virtual slots @+0x10 and @+0x28 — undecoded
//                                  disposal virtuals on the task base.

/**
 * Frontier-typed opaque handles for the Flexo threading primitives. The
 * concrete classes (FFLockBase — a lock-implementation ABC; FFLocker — an
 * RAII guard) live elsewhere in Flexo and aren't ported here. We surface
 * them as opaque object types so the ported control flow is faithful to
 * the disasm without inventing internals.
 *
 * @Flexo __ZN10FFLockBase / __ZN8FFLocker — undecoded classes.
 */
type FFLockBase = { readonly __opaque: "FFLockBase" };
type FFLocker = { readonly __opaque: "FFLocker" };

/**
 * FFAudioKillThreadTask — undecoded polymorphic base. All we know from the
 * disasm of addKillTask's cold-drop path is:
 *   task+0x00 : vtable
 *   vtable+0x10 : virtual method (called on the "drop" path)
 *   vtable+0x28 : virtual method (called on the "drop" path)
 * We surface these as two abstract virtual callbacks so downstream code can
 * plug in the real subclass. See raw-port/re/disasm/Flexo.FFAudioKillThread.addKillTask.s
 * @Flexo 0xd0affc / 0xd0b005.
 */
export interface FFAudioKillThreadTask {
  /** @Flexo vtable-slot +0x10 — called on the "instance==null" drop path. */
  vslot10(): void;
  /** @Flexo vtable-slot +0x28 — called on the "instance==null" drop path. */
  vslot28(): void;
}

/**
 * Static bss:
 *   s_instance     — the singleton pointer (nullable)     @Flexo 0x1c96378
 *   s_instanceLock — process-wide FFLockBase* guarding    @Flexo 0x1c96380
 *                    s_instance transitions (init / kill / add)
 *   predicate      — dispatch_once_t; -1 == "block ran"   @Flexo 0x1c7f4c0
 *
 * Faithful fp32 transcription of a runtime dispatch_once — TS cannot marshal
 * a real libdispatch predicate, so we model the sentinel with a plain integer
 * and let `_instance_cold_1()` throw with the frontier callee address (the
 * caller is expected to install a real singleton at boot).
 */
let s_instance: FFAudioKillThread | null = null;
// eslint-disable-next-line prefer-const
let s_instanceLock: FFLockBase | null = null;
let predicate = 0;

/**
 * .cold.1 slow-path body for `instance()` and `addKillTask()`.
 *
 * Both entry points share the same cold callee — the .cold.1 ICF cluster
 * calls _dispatch_once(&predicate, &___block_literal_global). Faithful fp32
 * transcription of a runtime libdispatch primitive is impossible in TS, so
 * this throws citing the frontier callee address; a boot-time initializer
 * must publish an FFAudioKillThread into `s_instance` and mark `predicate`
 * as done before any consumer calls the accessors.
 *
 * @Flexo 0x1487670 (instance().cold.1)
 * @Flexo 0x1487690 (addKillTask.cold.1 — same ICF body)
 * @Flexo block_invoke @0xd0aee0 (the singleton constructor body):
 *          new(24)  →  WorkerThread::WorkerThread("com.apple.flexo.audio-kill-thread")
 *          vtable = &__ZTV17FFAudioKillThread+0x10  → s_instance = new-obj.
 */
function _instance_cold_1(): void {
  // @Flexo 0x1487670 / 0x1487690 → _dispatch_once via Flexo stub (libdispatch)
  throw new Error(
    "FFAudioKillThread::instance().cold.1 not yet transcribed " +
      "(frontier callee @Flexo 0x1487670 _dispatch_once via libdispatch stub; " +
      "block_invoke @Flexo 0xd0aee0 constructs the singleton via " +
      "WorkerThread::WorkerThread(\"com.apple.flexo.audio-kill-thread\") — unwired)",
  );
}

/**
 * FFAudioKillThread — process-wide singleton subclass of WorkerThread.
 *
 * Instance layout observed in block_invoke @0xd0aee0 and ~D1 @0xd0b030:
 *   this+0x00 : vtable pointer (canonical Itanium ABI)                 (24 bytes total)
 *   this+0x08..0x17 : WorkerThread base fields (undecoded — no direct reads here)
 *
 * @Flexo symbols owned by this class:
 *   instance()   @0xd0aeb0
 *   killThread() @0xd0af30
 *   addKillTask(FFAudioKillThreadTask*) @0xd0af90
 *   ~D1          @0xd0b030
 *   ~D0          @0xd0b040
 *   .cold.1 (both instance and addKillTask) @0x1487670 / 0x1487690
 *   vtable       @0x1911218  (__ZTV17FFAudioKillThread)
 *   RTTI         @0x1911238  (__ZTI17FFAudioKillThread)
 */
export class FFAudioKillThread {
  /**
   * FFAudioKillThread::instance()
   * @Flexo 0xd0aeb0.
   *
   *   0xd0aeb0  cmpq  $-0x1, predicate(%rip)     ; ~0 = "block ran" sentinel
   *   0xd0aeb8  jne   0xd0aec2                   ; slow path
   *   0xd0aeba  movq  s_instance(%rip), %rax     ; fast path — return cached
   *   0xd0aec2  callq .cold.1                     ; run dispatch_once
   *   0xd0aecc  movq  s_instance(%rip), %rax
   *
   * The `-1` comparison is libdispatch's completion sentinel (dispatch_once_t
   * is set to ~0 after the once-block returns).
   */
  static instance(): FFAudioKillThread | null {
    // @Flexo 0xd0aeb0 cmpq $-0x1, predicate ; jne slow-path
    if ((predicate | 0) !== -1) {
      // @Flexo 0xd0aec6 callq .cold.1 (dispatch_once)
      _instance_cold_1();
    }
    // @Flexo 0xd0aecc movq s_instance(%rip), %rax
    return s_instance;
  }

  /**
   * FFAudioKillThread::killThread()
   * @Flexo 0xd0af30.
   *
   * Atomically nulls out s_instance under s_instanceLock, then (outside
   * the lock) tail-calls the virtual D1 (vtable slot +0x8) on the old
   * singleton — i.e. destroys the WorkerThread subclass instance without
   * holding the lock so any thread-join can wait without deadlocking on
   * the lock.
   */
  static killThread(): void {
    // @Flexo 0xd0af3b..0xd0af4b: FFLocker guard(s_instanceLock, LockType=0)
    const guard: FFLocker = _FFLockerBegin(s_instanceLock, 0);
    // @Flexo 0xd0af50..0xd0af57: rbx = s_instance ; s_instance = nullptr
    const old = s_instance;
    s_instance = null;
    // @Flexo 0xd0af65: FFLocker::~FFLocker() (release lock BEFORE virtual D1)
    _FFLockerEnd(guard);
    // @Flexo 0xd0af6a..0xd0af75: if (old) old->vptr[0x8]() — virtual D1
    if (old !== null) {
      // Itanium virtual D1 slot +0x8 — the "complete-object destructor".
      // In TS the GC releases storage; we mirror observable behaviour by
      // calling the ported destroy() (which chains to WorkerThread::~D2).
      old.destroy();
    }
  }

  /**
   * FFAudioKillThread::addKillTask(FFAudioKillThreadTask* task)
   * @Flexo 0xd0af90.
   *
   * Enqueue `task` on the singleton's WorkerThread. If the singleton has
   * been killed (instance==null after re-check), the task is disposed via
   * two virtual calls at task-vtable slots +0x10 and +0x28 (undecoded).
   *
   * Path branching (see disasm):
   *   (A) fast: predicate=~0 && instance!=null → WorkerThread::addTask
   *   (B) cold: predicate!=~0 → .cold.1 dispatch_once, then recheck
   *   (C) drop: instance==null → unlock and call task->[0x10] + task->[0x28]
   */
  static addKillTask(task: FFAudioKillThreadTask): void {
    // @Flexo 0xd0afa9: FFLocker guard(s_instanceLock, LockType=0)
    const guard: FFLocker = _FFLockerBegin(s_instanceLock, 0);
    // @Flexo 0xd0afae..0xd0afb6: cmpq $-0x1, predicate ; jne cold
    let inst: FFAudioKillThread | null;
    if ((predicate | 0) !== -1) {
      // @Flexo 0xd0afdc callq .cold.1 (dispatch_once — construct singleton)
      _instance_cold_1();
      // @Flexo 0xd0afe1..0xd0afeb: reload s_instance ; testq ; jne fast
      inst = s_instance;
    } else {
      // @Flexo 0xd0afb8: movq s_instance(%rip), %rdi
      inst = s_instance;
    }
    if (inst !== null) {
      // @Flexo 0xd0afc7 callq WorkerThread::addTask(WorkerThread::Task*)
      _WorkerThread_addTask(inst, task);
      // @Flexo 0xd0afd0: FFLocker::~FFLocker() (unlock, task in-flight)
      _FFLockerEnd(guard);
      return;
    }
    // @Flexo 0xd0afed drop-path — killThread() ran before this call and
    // the once-block already published, so no way to enqueue: unlock, then
    // dispose the task via its own vtable.
    _FFLockerEnd(guard);
    // @Flexo 0xd0affc callq *0x10(%rax) — virtual dispose slot 1
    task.vslot10();
    // @Flexo 0xd0b005 callq *0x28(%rax) — virtual dispose slot 2
    task.vslot28();
  }

  /**
   * ~FFAudioKillThread() (D1 — complete-object destructor)
   * @Flexo 0xd0b030.
   *
   *   0xd0b030 pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   0xd0b035 jmp   WorkerThread::~WorkerThread()   ; TAIL CALL
   *
   * Thin trampoline — no FFAudioKillThread-specific members exist, so the
   * entire destructor is just a tail-call into the WorkerThread base D2.
   */
  destroy(): void {
    // @Flexo 0xd0b035 jmp __ZN12WorkerThreadD2Ev — WorkerThread::~WorkerThread()
    _WorkerThread_destroy(this);
  }

  /**
   * ~FFAudioKillThread() (D0 — deleting destructor)
   * @Flexo 0xd0b040.
   *
   *   0xd0b049  callq WorkerThread::~WorkerThread()
   *   0xd0b057  jmp   __ZdlPv                        ; TAIL CALL operator delete
   *
   * TS GC subsumes operator delete; observable behaviour differs only in
   * that the storage is not eagerly reclaimed.
   */
  destroyAndFree(): void {
    // @Flexo 0xd0b049 callq __ZN12WorkerThreadD2Ev
    _WorkerThread_destroy(this);
    // @Flexo 0xd0b057 jmp __ZdlPv (operator delete via Flexo stub 0x1497404)
    //   TS GC handles storage reclamation.
  }
}

// ─── Frontier callee stubs ─────────────────────────────────────────────────────
// These are undecoded C++ symbols in Flexo we call from FFAudioKillThread. Each
// throws citing its @0xADDR so a caller wiring the audio-kill-thread pipeline
// hits a hard stop instead of silently succeeding with fake behaviour.

/**
 * FFLocker::FFLocker(FFLockBase*, FFLocker::LockType) — RAII lock guard ctor.
 * @Flexo callq __ZN8FFLockerC1EP10FFLockBaseNS_8LockTypeE
 *          @0xd0af4b (killThread) and @0xd0afa9 (addKillTask).
 * LockType passed as 0 in both call sites (xorl %edx,%edx).
 */
function _FFLockerBegin(_lock: FFLockBase | null, _type: number): FFLocker {
  // Frontier: FFLocker/FFLockBase are undecoded — the concrete lock impl
  // (pthread_mutex? read/write lock? spin?) lives in the Flexo threading
  // subsystem and isn't ported here.
  throw new Error(
    "FFLocker::FFLocker(FFLockBase*, FFLocker::LockType) not yet transcribed " +
      "(frontier callee @Flexo 0xd0af4b/0xd0afa9 __ZN8FFLockerC1EP10FFLockBaseNS_8LockTypeE)",
  );
}

/**
 * FFLocker::~FFLocker() — RAII lock guard dtor.
 * @Flexo callq __ZN8FFLockerD1Ev
 *          @0xd0af65 (killThread), @0xd0afd0/@0xd0aff1 (addKillTask), and the
 *          exception-cleanup landing pad @0xd0b016.
 */
function _FFLockerEnd(_guard: FFLocker): void {
  throw new Error(
    "FFLocker::~FFLocker() not yet transcribed " +
      "(frontier callee @Flexo 0xd0af65/0xd0afd0/0xd0aff1 __ZN8FFLockerD1Ev)",
  );
}

/**
 * WorkerThread::addTask(WorkerThread::Task*) — deliver a task to the worker
 * thread's queue.
 * @Flexo 0xd0afc7 callq __ZN12WorkerThread7addTaskEPNS_4TaskE.
 * The task-base type is technically WorkerThread::Task, but on this call site
 * the compiler passes an FFAudioKillThreadTask* — the former is a base of the
 * latter (RTTI names confirm both derive from a common polymorphic base).
 */
function _WorkerThread_addTask(
  _self: FFAudioKillThread,
  _task: FFAudioKillThreadTask,
): void {
  throw new Error(
    "WorkerThread::addTask(WorkerThread::Task*) not yet transcribed " +
      "(frontier callee @Flexo 0xd0afc7 __ZN12WorkerThread7addTaskEPNS_4TaskE)",
  );
}

/**
 * WorkerThread::~WorkerThread() — base D2 (base-object destructor).
 * @Flexo callq __ZN12WorkerThreadD2Ev
 *          @0xd0b035 (~D1 tail-jmp), @0xd0b049 (~D0 non-tail).
 * Joins the worker thread and releases its queue+lock. Undecoded here.
 */
function _WorkerThread_destroy(_self: FFAudioKillThread): void {
  throw new Error(
    "WorkerThread::~WorkerThread() not yet transcribed " +
      "(frontier callee @Flexo 0xd0b035/0xd0b049 __ZN12WorkerThreadD2Ev)",
  );
}
