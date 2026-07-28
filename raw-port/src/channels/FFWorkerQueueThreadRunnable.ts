// FFWorkerQueueThreadRunnable — Flexo's thin dispatcher that lets an
// FFWorkerQueue be driven by the generic WorkerThread scheduler. Each
// WorkerThread pulls the next abstract WorkerThread::Task* off its queue and
// hands it to `performTask` on its runnable; this class overrides that virtual
// slot to (a) verify the incoming task is really an FFWorkerQueue::Task via a
// runtime C++ dynamic_cast, and (b) forward through to
// FFWorkerQueue::performTask if the internal "not-cancelled" pointer at
// +0x8 is still non-null. Everything else drops on the floor.
//
// This class has NO members of its own — the D1 destructor is a 5-byte
// pushq/movq/popq/jmp thin trampoline into WorkerThreadRunnable::~WorkerThreadRunnable(),
// which proves the class adds no fields on top of its base. The D0 (deleting)
// destructor runs the base D2 in place then tail-calls `operator delete`.
//
// Verbatim from FCP's Flexo framework at:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// nm evidence (`nm -arch x86_64 -m Flexo | grep FFWorkerQueueThreadRunnable`):
//   0000000001304650 T __ZN27FFWorkerQueueThreadRunnable11performTaskEPN12WorkerThread4TaskE
//   00000000013054d0 T __ZN27FFWorkerQueueThreadRunnableD1Ev
//   00000000013054e0 T __ZN27FFWorkerQueueThreadRunnableD0Ev
//
// THREE symbols, three real bodies. Under the Itanium C++ ABI D1 is the
// "complete-object" destructor and D0 is the "deleting" destructor; there is
// no separately-emitted D2 because the compiler collapsed the base-subobject
// destructor into a direct tail-call chain into the WorkerThreadRunnable D2.
//
// Source disassembly saved at:
//   raw-port/re/disasm/Flexo.FFWorkerQueueThreadRunnable.performTask.s (22 lines)
//   raw-port/re/disasm/Flexo.FFWorkerQueueThreadRunnable.~FFWorkerQueueThreadRunnable.s (D0 body, 13 lines)
//   D1 body recovered via awk over /tmp/Flexo_tV.txt at __ZN27FFWorkerQueueThreadRunnableD1Ev.
//
// ─── performTask @Flexo 0x1304650 ─────────────────────────────────────────────
//   __ZN27FFWorkerQueueThreadRunnable11performTaskEPN12WorkerThread4TaskE:
//     0x1304650  pushq %rbp
//     0x1304651  movq  %rsp, %rbp
//     0x1304654  testq %rsi, %rsi                    ; task == nullptr?
//     0x1304657  je    0x130468b                     ; -> ret
//     0x1304659  leaq  __ZTIN12WorkerThread4TaskE(%rip), %rax  ; source typeinfo (WorkerThread::Task)
//     0x1304660  leaq  __ZTIN13FFWorkerQueue4TaskE(%rip), %rdx ; dest   typeinfo (FFWorkerQueue::Task)
//     0x1304667  movq  %rsi, %rdi                    ; arg0 = task
//     0x130466a  movq  %rax, %rsi                    ; arg1 = src typeinfo
//     0x130466d  xorl  %ecx, %ecx                    ; arg3 = 0 (no upcast bias hint)
//     0x130466f  callq  0x14974b8  ## symbol stub for: ___dynamic_cast
//     0x1304674  testq %rax, %rax                    ; cast returned null?
//     0x1304677  je    0x130468b                     ; -> ret
//     0x1304679  movq  0x8(%rax), %rdi               ; rdi = casted->field_at_+0x8
//     0x130467d  testq %rdi, %rdi                    ; that field null?
//     0x1304680  je    0x130468b                     ; -> ret
//     0x1304682  movq  %rax, %rsi                    ; arg1 = casted task
//     0x1304685  popq  %rbp
//     0x1304686  jmp   __ZN13FFWorkerQueue11performTaskEPNS_4TaskE  ; TAIL CALL
//     0x130468b  popq  %rbp
//     0x130468c  retq
//
// Semantics: the +0x8 non-null check tests the SAME slot that
// FFWorkerQueue::performTask itself would deref first — a "task target still
// alive / not cancelled" gate. A four-argument call to __cxa_dynamic_cast
// with the 4th argument zeroed (xorl %ecx, %ecx) is the "no known offset
// hint" flavour: FFWorkerQueue::Task's inheritance from WorkerThread::Task
// is virtual (or otherwise non-obvious to the compiler), which is why the
// compiler cannot bake the downcast into a simple pointer adjustment and
// must go through the RTTI runtime. WE MIRROR THAT FIDELITY: the ported
// dispatcher performs an actual runtime type-tag check, not a blind cast.
//
// ─── ~FFWorkerQueueThreadRunnable D1 @Flexo 0x13054d0 ─────────────────────────
//   __ZN27FFWorkerQueueThreadRunnableD1Ev:
//     0x13054d0  pushq %rbp
//     0x13054d1  movq  %rsp, %rbp
//     0x13054d4  popq  %rbp
//     0x13054d5  jmp   __ZN20WorkerThreadRunnableD2Ev   ; tail-call base D2
//
// A 5-byte thin trampoline. No own fields to destroy at this level of the
// hierarchy; every observable side-effect belongs to the base subobject
// destructor.
//
// ─── ~FFWorkerQueueThreadRunnable D0 @Flexo 0x13054e0 ─────────────────────────
//   __ZN27FFWorkerQueueThreadRunnableD0Ev:
//     0x13054e0  pushq %rbp
//     0x13054e1  movq  %rsp, %rbp
//     0x13054e4  pushq %rbx
//     0x13054e5  pushq %rax
//     0x13054e6  movq  %rdi, %rbx                     ; save `this`
//     0x13054e9  callq __ZN20WorkerThreadRunnableD2Ev  ; base D2 in place
//     0x13054ee  movq  %rbx, %rdi                     ; restore `this`
//     0x13054f1  addq  $0x8, %rsp
//     0x13054f5  popq  %rbx
//     0x13054f6  popq  %rbp
//     0x13054f7  jmp   __ZdlPv                         ; tail-call operator delete(this)
//
// The DELETING destructor: run the destroy-in-place chain, then hand the
// storage back to the allocator via operator delete. Invoked via vtable
// slot [0x10] when delete p is called through a base pointer.
//
// FRONTIER CALLEES (un-ported here; the throwing stubs below cite them):
//   __ZN13FFWorkerQueue11performTaskEPNS_4TaskE    FFWorkerQueue::performTask(FFWorkerQueue::Task*)
//   __ZN20WorkerThreadRunnableD2Ev                 WorkerThreadRunnable::~WorkerThreadRunnable()
//   ___dynamic_cast                                the C++ RTTI runtime helper (Flexo stub @0x14974b8)
//   __ZdlPv                                        operator delete(void*)  (Flexo stub @0x1497404)

/**
 * Opaque handle to Flexo's abstract WorkerThread::Task type. In the raw-port
 * layer we model this as a tagged object rather than a raw pointer so the
 * __cxa_dynamic_cast step below can be honoured through a real runtime type
 * check (a blind cast would violate the fidelity rule).
 *
 * The concrete subtype the dispatcher looks for is FFWorkerQueue::Task — a
 * task queued on an FFWorkerQueue — which carries an internal pointer field
 * at byte offset +0x8 that performTask reads before dispatch. Faithful to the
 * disasm at @Flexo 0x1304679 (movq 0x8(%rax), %rdi).
 *
 * Source typeinfo referenced at @Flexo 0x1304659: __ZTIN12WorkerThread4TaskE.
 */
export interface WorkerThreadTask {
  /** The RTTI class-name tag. Enables the __cxa_dynamic_cast step. */
  readonly __rtti: string;
}

/**
 * Frontier stub for FFWorkerQueue::Task. Any real port of FFWorkerQueue must
 * provide a concrete class whose __rtti === "FFWorkerQueue::Task" and whose
 * m8 field carries the same pointer the disasm reads at struct offset +0x8.
 * Until then, performTask cannot advance past the non-null gate.
 *
 * Dest typeinfo referenced at @Flexo 0x1304660: __ZTIN13FFWorkerQueue4TaskE.
 */
export interface FFWorkerQueueTask extends WorkerThreadTask {
  readonly __rtti: "FFWorkerQueue::Task";
  /**
   * The pointer field at struct offset +0x8. Loaded by the disasm at
   * @Flexo 0x1304679 (movq 0x8(%rax), %rdi) and tested non-null at
   * @Flexo 0x130467d (testq %rdi, %rdi ; je 0x130468b). Semantically the
   * "task target still alive / not cancelled" slot.
   */
  m8: unknown | null;
}

/**
 * Frontier: FFWorkerQueue::performTask(FFWorkerQueue::Task*).
 * Not yet transcribed — @Flexo 0x1304686 tail-call target.
 * (Symbol: __ZN13FFWorkerQueue11performTaskEPNS_4TaskE.)
 */
function ffWorkerQueue_performTask(_task: FFWorkerQueueTask): void {
  // @Flexo 0x1304686 jmp __ZN13FFWorkerQueue11performTaskEPNS_4TaskE
  throw new Error(
    "FFWorkerQueue::performTask not yet transcribed (frontier callee " +
      "@Flexo 0x1304686 in FFWorkerQueueThreadRunnable::performTask)",
  );
}

/**
 * The runtime type check performed at @Flexo 0x130466f
 * (callq 0x14974b8 ; symbol stub for: ___dynamic_cast). Returns the
 * argument unchanged when it really is an FFWorkerQueue::Task and null
 * otherwise — mirroring __cxa_dynamic_cast returning nullptr on failed
 * downcast. We honour the fidelity requirement by inspecting the __rtti
 * tag rather than an unchecked cast.
 */
function dynamicCastToFFWorkerQueueTask(
  task: WorkerThreadTask,
): FFWorkerQueueTask | null {
  return task.__rtti === "FFWorkerQueue::Task"
    ? (task as FFWorkerQueueTask)
    : null;
}

/**
 * FFWorkerQueueThreadRunnable — Flexo's thin adapter that lets an
 * FFWorkerQueue be driven by the generic WorkerThread scheduler.
 *
 * The class has NO member fields of its own — this is proved by the D1
 * destructor body being a 5-byte pushq/movq/popq/jmp thin trampoline into
 * WorkerThreadRunnable::~WorkerThreadRunnable(). Its role is purely to
 * override the virtual performTask(WorkerThread::Task*) slot in the
 * scheduler's runnable protocol.
 *
 * @Flexo symbols owned by this class:
 *   performTask  @0x1304650
 *   ~D1           @0x13054d0
 *   ~D0           @0x13054e0
 */
export class FFWorkerQueueThreadRunnable {
  /**
   * FFWorkerQueueThreadRunnable::performTask(WorkerThread::Task*)
   *
   * @Flexo 0x1304650
   *   (mangled __ZN27FFWorkerQueueThreadRunnable11performTaskEPN12WorkerThread4TaskE)
   *
   * Full disasm mirrored branch-for-branch:
   *   - null task → early return                                @0x1304654..0x1304657
   *   - typed dynamic_cast to FFWorkerQueue::Task; null → return @0x1304659..0x1304677
   *   - casted->m8 null-check; null → return                    @0x1304679..0x1304680
   *   - otherwise TAIL-CALL FFWorkerQueue::performTask(casted)  @0x1304686
   */
  performTask(task: WorkerThreadTask | null): void {
    // @Flexo 0x1304654: testq %rsi, %rsi ; je 0x130468b
    if (task === null) return;

    // @Flexo 0x1304659..0x130466f:
    //   leaq __ZTIN12WorkerThread4TaskE(%rip), %rax   ; source typeinfo
    //   leaq __ZTIN13FFWorkerQueue4TaskE(%rip), %rdx  ; dest   typeinfo
    //   callq 0x14974b8 ; symbol stub for: ___dynamic_cast
    const casted = dynamicCastToFFWorkerQueueTask(task);

    // @Flexo 0x1304674: testq %rax, %rax ; je 0x130468b
    if (casted === null) return;

    // @Flexo 0x1304679..0x1304680:
    //   movq 0x8(%rax), %rdi ; testq %rdi, %rdi ; je 0x130468b
    if (casted.m8 === null) return;

    // @Flexo 0x1304686: jmp __ZN13FFWorkerQueue11performTaskEPNS_4TaskE
    ffWorkerQueue_performTask(casted);
  }

  /**
   * ~FFWorkerQueueThreadRunnable — the D1 (complete-object) destructor.
   *
   * @Flexo 0x13054d0 (mangled __ZN27FFWorkerQueueThreadRunnableD1Ev)
   *
   * The Flexo body is a 5-byte thin trampoline:
   *   0x13054d0  pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   0x13054d5  jmp   __ZN20WorkerThreadRunnableD2Ev
   * Nothing to destroy at this level of the hierarchy. The base subobject
   * destructor (transcribed as workerThreadRunnable_destructorBase below)
   * is the frontier callee.
   */
  destroy(): void {
    // @Flexo 0x13054d5 jmp __ZN20WorkerThreadRunnableD2Ev
    workerThreadRunnable_destructorBase(this);
  }

  /**
   * The DELETING destructor (D0), invoked by delete p on a base pointer.
   * Runs the destroy-in-place D2 chain, then hands the storage back to the
   * allocator via operator delete.
   *
   * @Flexo 0x13054e0 (mangled __ZN27FFWorkerQueueThreadRunnableD0Ev)
   *   0x13054e6  save `this`
   *   0x13054e9  callq __ZN20WorkerThreadRunnableD2Ev   ; base D2 in place
   *   0x13054f7  jmp   __ZdlPv                          ; tail-call operator delete
   *
   * TS has no distinct "destroy" vs "delete" ABI so this is a thin adapter
   * over the same base D2, but we retain the two entry points to preserve
   * fidelity to the two exported symbols and their vtable slots.
   */
  destroyAndFree(): void {
    // @Flexo 0x13054e9 callq __ZN20WorkerThreadRunnableD2Ev
    workerThreadRunnable_destructorBase(this);
    // @Flexo 0x13054f7 jmp __ZdlPv — TS GC subsumes operator delete; the
    // storage becomes reclaimable once no reference to this remains.
  }
}

/**
 * Frontier: WorkerThreadRunnable::~WorkerThreadRunnable() (D2 base destructor).
 * Called from both destructor entry points above. Not yet transcribed —
 * @Flexo callees at 0x13054d5 (from D1) and 0x13054e9 (from D0).
 * (Symbol: __ZN20WorkerThreadRunnableD2Ev)
 */
function workerThreadRunnable_destructorBase(
  _self: FFWorkerQueueThreadRunnable,
): void {
  // @Flexo 0x13054d5 / 0x13054e9  __ZN20WorkerThreadRunnableD2Ev
  throw new Error(
    "WorkerThreadRunnable::~WorkerThreadRunnable() not yet transcribed " +
      "(frontier callee @Flexo 0x13054d5 / 0x13054e9)",
  );
}

