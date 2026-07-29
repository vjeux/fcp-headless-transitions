// raw-port/src/render/HGUserExecUnit.ts
//
// FCP `HGUserExecUnit` — Helium framework. A pthread-backed worker unit that
// pulls `HGUserJob`s off an `HGRenderQueue` and runs them until the queue is
// shutting down. Each unit gets a stable numeric id from a monotonic global
// counter (`HGUserExecUnit::_count`) and a lock-protected "state" cell at
// +0x08 that other threads poll to know what the unit is currently doing.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGUserExecUnit.HGUserExecUnit.s   (C1 @0x95d80)
//   raw-port/re/disasm/Helium.HGUserExecUnit.RunLoop.s          (      @0x95e10)
//   raw-port/re/disasm/Helium.HGUserExecUnit.StartRunLoop.s     (      @0x95f40)
//   raw-port/re/disasm/Helium.HGUserExecUnit.~HGUserExecUnit.s  (D0    @0x95de0)
//
// Ledger addresses (Helium.ledger.json):
//   0x95d40  HGUserExecUnit::HGUserExecUnit(HGRenderQueue*)   [C2 base ctor]
//   0x95d80  HGUserExecUnit::HGUserExecUnit(HGRenderQueue*)   [C1 complete ctor]
//   0x95dc0  HGUserExecUnit::~HGUserExecUnit()                [D2 base dtor]
//   0x95dd0  HGUserExecUnit::~HGUserExecUnit()                [D1 complete dtor]
//   0x95de0  HGUserExecUnit::~HGUserExecUnit()                [D0 deleting dtor]
//   0x95e10  HGUserExecUnit::RunLoop()
//   0x95f40  HGUserExecUnit::StartRunLoop()
//
// Referenced externs (each callsite cited inline below):
//   __ZTV14HGUserExecUnit                     vtable for HGUserExecUnit
//   __ZN14HGUserExecUnit6_countE              HGUserExecUnit::_count  (mutable static uint64)
//   __ZN13HGRenderQueue14IsShuttingDownEv     HGRenderQueue::IsShuttingDown()
//   __ZN13HGRenderQueue10GetUserJobEP14HGUserExecUnitPP9HGUserJob
//                                             HGRenderQueue::GetUserJob(HGUserExecUnit*, HGUserJob**)
//   __ZN16HGSynchronizable4LockEv             HGSynchronizable::Lock()
//   __ZN16HGSynchronizable6UnlockEv           HGSynchronizable::Unlock()
//   __ZN9HGUserJob8SetStateENS_5StateE        HGUserJob::SetState(HGUserJob::State)
//   __ZN9HGUserJob14CallNotifyFuncEv          HGUserJob::CallNotifyFunc()
//   __ZNSt3__14listIP16HGGPUReadbackJobNS_9allocatorIS2_EEE6removeERKS2_
//                                             std::list<HGGPUReadbackJob*>::remove(&)
//   __Z21StartUserExecUnitFuncPv              StartUserExecUnitFunc(void*)  -> RunLoop trampoline
//   _pthread_attr_init / _setdetachstate / _create / _destroy / _setname_np
//
// ── STRUCT LAYOUT (recovered from C1 @0x95d80 + RunLoop @0x95e10 + StartRunLoop @0x95f40) ──
//
//   +0x00  vptr : HGUserExecUnit_vtable*
//            C1 @0x95d84 leaq 0x975add(%rip) → __ZTV14HGUserExecUnit + 0x10.
//   +0x08  state : atomic<uint32_t>
//            C1 @0x95dae-b0 `xorl %eax,%eax; xchgl %eax, 0x8(%rdi)` — atomic init to 0.
//            RunLoop @0x95e4e-53 `movl $0x3; xchgl %eax, 0x8(%rbx)` — state = 3 on exit path.
//            RunLoop @0x95ea8-ad `movl $0x2; xchgl %eax, 0x8(%rbx)` — state = 2 while job runs.
//            RunLoop @0x95f03-08 `movl $0x1; xchgl %eax, 0x8(%rbx)` — state = 1 after job done.
//            i.e. states: 0=Idle (post-ctor), 1=Ready-for-next-job, 2=Running-job,
//                          3=Shutting-down (queue.IsShuttingDown() observed).
//   +0x10  queue : HGRenderQueue*
//            C1 @0x95d8e `movq %rsi, 0x10(%rdi)` — saved verbatim from the sole ctor arg.
//   +0x18  id : uint32_t
//            C1 @0x95d92-a3 loads static `_count`, increments it, stores it back, then
//            copies the low 32 bits into 0x18(%rdi). Monotonic per-process instance id.
//   +0x20  thread : pthread_t
//            StartRunLoop @0x95f64 `leaq 0x20(%rdi), %rbx` — pthread_create writes the
//            thread handle straight into this slot.
//            Initialised to null-pointer by C1 @0x95da6 (`movq $0x0, 0x20(%rdi)`).
//
//   The parent HGRenderQueue's HGSynchronizable + std::list<HGGPUReadbackJob*> that RunLoop
//   touches live INSIDE the queue at queue+0x1d0 (Lock/Unlock target) and queue+0x188 (list;
//   see RunLoop @0x95e6f `movl $0x188, %r12d`), NOT inside HGUserExecUnit itself.
//
// ── STATE TRANSITIONS (recovered from RunLoop) ──
//     0  (ctor) →  1  (idle in outer loop, GetUserJob about to run)
//     1        →  2  (job accepted, notify + drive vtable slot 0x18 of the job)
//     2        →  1  (job returned, back to polling)
//     any      →  3  (IsShuttingDown() returned true — Lock/Unlock the queue's synchronizable
//                     and return from RunLoop; the thread ends)
//
// The three cross-thread state writes are xchgl — sequential-consistency (x86 xchg is a full
// barrier). We model this with a plain integer store in the port; JS is single-threaded so any
// observer reads the last write anyway. The barrier is only there for the C++ producer/consumer
// pair (main thread reading state while the worker thread updates it).

// ── Opaque frontier types (real classes not yet landed) ──
type HGRenderQueueRef = {
    /** HGRenderQueue::IsShuttingDown() — @Helium extern, callsite RunLoop @0x95e32/95e84. */
    IsShuttingDown(): boolean;
    /** HGRenderQueue::GetUserJob — writes into *outJob, returns 0 on success, non-zero on no-job.
     *  Callsite RunLoop @0x95e9f. Non-zero return re-polls IsShuttingDown; zero drives the job. */
    GetUserJob(unit: HGUserExecUnit, outJob: { job: HGUserJobRef | null }): number;
    /** Queue-owned HGSynchronizable at queue+0x1d0 — lock/unlock guard around list mutation.
     *  See RunLoop @0x95e3f/95ed6: `movq 0x10(%rbx), %rax; movq 0x1d0(%rax), %r14`. */
    readonly _syncAt1d0: HGSynchronizableRef;
    /** Queue-owned std::list<HGGPUReadbackJob*> at queue+0x188 — RunLoop calls
     *  `list<HGGPUReadbackJob*>::remove(&job)` on it after each user-job completes.
     *  See RunLoop @0x95e6f (`movl $0x188, %r12d`) and @0x95ee9. */
    readonly _readbackListAt188: unknown;
};
type HGSynchronizableRef = {
    /** HGSynchronizable::Lock()   — RunLoop @0x95e49. */ Lock(): void;
    /** HGSynchronizable::Unlock() — RunLoop @0x95e59/95ef4. */ Unlock(): void;
};
type HGUserJobRef = {
    /** HGUserJob::SetState(State) — RunLoop @0x95eb9. Called with State=3 after
     *  the job's virtual `run` slot returns. State is an enum inside HGUserJob (not
     *  the same as HGUserExecUnit.state at +0x8). */
    SetState(state: number): void;
    /** HGUserJob::CallNotifyFunc() — RunLoop @0x95ec2. Fires the completion callback. */
    CallNotifyFunc(): void;
    /** Virtual dispatch RunLoop @0x95efd-f00: `movq (%rdi), %rax; callq *0x18(%rax)`.
     *  Slot +0x18 in HGUserJob's vtable — the "execute the job body" slot. */
    _vtable_slot18_execute(): void;
};

// ── HGUserJob::State enum values written by RunLoop (grounded to specific addrs) ──
/** Written by RunLoop @0x95eb4 (`movl $0x3, %esi`) right before HGUserJob::SetState. */
const HGUSERJOB_STATE_FINISHED = 3;

// ── HGUserExecUnit state cell at +0x08 (grounded to specific addrs) ──
/** RunLoop @0x95ea8: `movl $0x2, %eax; xchgl %eax, 0x8(%rbx)` — set right BEFORE the job runs. */
const HG_EXEC_STATE_RUNNING = 2;
/** RunLoop @0x95f03: `movl $0x1, %eax; xchgl %eax, 0x8(%rbx)` — set AFTER the job returns. */
const HG_EXEC_STATE_IDLE_READY = 1;
/** RunLoop @0x95e4e: `movl $0x3, %eax; xchgl %eax, 0x8(%rbx)` — set when queue is shutting down. */
const HG_EXEC_STATE_SHUTDOWN = 3;

// ── std::list<HGGPUReadbackJob*>::remove(&) frontier stub ──
/** RunLoop @0x95ec-1: `callq __ZNSt3__14listIP16HGGPUReadbackJobNS_9allocatorIS2_EEE6removeERKS2_`.
 *  Called on the queue's list at queue+0x188 with the address of the local HGUserJob* on the stack
 *  (which is being reinterpreted as an HGGPUReadbackJob* — see std::list::remove semantics: linear
 *  scan, erase every element == the reference). Because HGGPUReadbackJob and HGUserJob overlap in
 *  the queue's tracking list, the same node address is used for both. */
function HGRenderQueue__readbackList_remove(
    _list: unknown,
    _jobRef: HGUserJobRef | null,
): void {
    throw new Error(
        "std::__1::list<HGGPUReadbackJob*>::remove(HGGPUReadbackJob* const&) " +
        "@Helium callsite 0x95eec not yet transcribed",
    );
}

// ── pthread frontier stubs — RunLoop is dispatched via a real POSIX thread; we model the
//    ABI shape here and throw on invocation since JS has no OS threads. StartRunLoop's
//    numeric return code is `pthread_create`'s return code (Ebx captured @0x95f99). ──
/** _pthread_create stub — StartRunLoop @0x95f94. Returns 0 on success in the real ABI. */
function pthread_create_stub(
    _thread: unknown, _attr: unknown, _start: (arg: unknown) => unknown, _arg: unknown,
): number {
    throw new Error("_pthread_create @Helium callsite 0x95f94 not yet transcribed");
}
/** _pthread_attr_init stub — StartRunLoop @0x95f72. */
function pthread_attr_init_stub(_attr: unknown): void {
    throw new Error("_pthread_attr_init @Helium callsite 0x95f72 not yet transcribed");
}
/** _pthread_attr_setdetachstate stub — StartRunLoop @0x95f7f (arg2=$0x2 = PTHREAD_CREATE_DETACHED). */
function pthread_attr_setdetachstate_stub(_attr: unknown, _state: number): void {
    throw new Error("_pthread_attr_setdetachstate @Helium callsite 0x95f7f not yet transcribed");
}
/** _pthread_attr_destroy stub — StartRunLoop @0x95f9e. */
function pthread_attr_destroy_stub(_attr: unknown): void {
    throw new Error("_pthread_attr_destroy @Helium callsite 0x95f9e not yet transcribed");
}
/** _pthread_setname_np stub — RunLoop @0x95e29 (first thing the worker thread does). */
function pthread_setname_np_stub(_name: string): void {
    throw new Error("_pthread_setname_np @Helium callsite 0x95e29 not yet transcribed");
}

/**
 * Global monotonic instance-id counter — @Helium `__ZN14HGUserExecUnit6_countE`.
 * C1 @0x95d92-9c: `movq _count, %rax; incq %rax; movq %rax, _count; movl %eax, 0x18(%rdi)`.
 * Real relocation address in the Helium slice: PC-relative from 0x95d99 (see disasm).
 * We hold it here as a module-scoped uint64 (BigInt) because the real cell is 8 bytes and
 * the low-32-bit truncation happens explicitly at the store into +0x18.
 */
let HGUserExecUnit__count: bigint = 0n;

/**
 * HGUserExecUnit — pthread-backed HGUserJob consumer.
 * @Helium ~0x95d40..0x95fc5 (all methods in this class occupy that block).
 */
export class HGUserExecUnit {
    /** +0x08 atomic<uint32_t> — see HG_EXEC_STATE_* constants above. */
    state: number;
    /** +0x10 HGRenderQueue* — saved from the sole ctor arg (C1 @0x95d8e). */
    queue: HGRenderQueueRef;
    /** +0x18 uint32_t — this-instance id, low-32-bits of the post-increment of `_count`. */
    id: number;
    /** +0x20 pthread_t — written by pthread_create in StartRunLoop; null until then. */
    thread: unknown;

    /**
     * HGUserExecUnit::HGUserExecUnit(HGRenderQueue*) — C1 @Helium 0x95d80  (C2 @0x95d40).
     *
     * Full C1 body (16 lines):
     *   0x95d80  push rbp; mov rsp,rbp
     *   0x95d84  leaq __ZTV14HGUserExecUnit+0x10(%rip), %rax
     *   0x95d8b  movq %rax, (%rdi)                    ; +0x00 vptr = vtable+0x10
     *   0x95d8e  movq %rsi, 0x10(%rdi)                ; +0x10 queue = arg
     *   0x95d92  movq _count(%rip), %rax
     *   0x95d99  incq %rax
     *   0x95d9c  movq %rax, _count(%rip)              ; ++_count
     *   0x95da3  movl %eax, 0x18(%rdi)                ; +0x18 id = low32(_count)
     *   0x95da6  movq $0x0, 0x20(%rdi)                ; +0x20 thread = null
     *   0x95dae  xorl %eax, %eax
     *   0x95db0  xchgl %eax, 0x8(%rdi)                ; +0x08 state = 0 (atomic init)
     *   0x95db3  pop rbp; retq
     *
     * C2 @0x95d40 has identical body (verified in ledger — same 4 method entries at the
     * same offsets); C1/C2 differ only in vtable RIP-relative displacement (the class has
     * no derived subobject with a shifted vtable, so both point at __ZTV14HGUserExecUnit+0x10).
     */
    constructor(queue: HGRenderQueueRef) {
        // vptr install (@0x95d84-8b) is implicit in JS — methods dispatch through the class.
        this.queue = queue;                                   // @0x95d8e
        HGUserExecUnit__count = HGUserExecUnit__count + 1n;   // @0x95d92-9c
        this.id = Number(HGUserExecUnit__count & 0xffffffffn);// @0x95da3  (movl truncates to u32)
        this.thread = null;                                   // @0x95da6
        this.state = 0;                                       // @0x95db0 (xchgl init to 0)
    }

    /**
     * HGUserExecUnit::~HGUserExecUnit() — D1 @Helium 0x95dd0 / D2 @0x95dc0.
     *
     * Both D1 and D2 are 6-line trivial NOP dtors:
     *   push rbp; mov rsp,rbp; pop rbp; retq
     * i.e. HGUserExecUnit has NO owned resources requiring teardown — the thread it started
     * is detached (PTHREAD_CREATE_DETACHED, StartRunLoop @0x95f7f) and self-terminates via
     * `IsShuttingDown()` on the queue. `queue` is a raw non-owning pointer (no shared_ptr,
     * no atomic-release). We model D1/D2 as a no-op.
     *
     * D0 @0x95de0 is the deleting dtor — it tail-calls D1 then `operator delete`. In JS,
     * garbage collection handles the free, so D0 also collapses to a no-op call to `destroy`.
     */
    destroy(): void {
        // No-op — HGUserExecUnit's dtors are trivial. See file header for provenance.
    }

    /**
     * HGUserExecUnit::RunLoop() — @Helium 0x95e10.
     *
     * The worker thread's entry point (invoked from StartUserExecUnitFunc @0x95df0, which is
     * pthread_create's start_routine). Loops pulling HGUserJobs off the queue until the queue
     * reports it is shutting down.
     *
     * Full body flow (80 lines of disasm, distilled):
     *   @0x95e22-29 pthread_setname_np("com.apple.helium-render-queue-exec-unit-user")
     *   @0x95e32    if (queue->IsShuttingDown()) goto EXIT
     *   Outer loop @0x95e6b:
     *     @0x95e85  if (queue->IsShuttingDown()) goto EXIT
     *     @0x95e8d  HGUserJob* job = null
     *     @0x95e9f  int r = queue->GetUserJob(this, &job)
     *     @0x95ea4  if (r == 0)  jmp back to outer loop  (empty job, retry after shutdown check)
     *              // job accepted:
     *     @0x95ea8  state = 2 (HG_EXEC_STATE_RUNNING)
     *     @0x95eb9  job->SetState(3)             (HGUSERJOB_STATE_FINISHED — the SET happens
     *                                              BEFORE the callback + execute; matches the
     *                                              disasm order exactly — this is FCP's choice,
     *                                              not a "correct" chess move to swap)
     *     @0x95ec2  job->CallNotifyFunc()
     *     @0x95edd  queue->_syncAt1d0.Lock()
     *     @0x95eec  std::list<HGGPUReadbackJob*>::remove(queue+0x188, &job)
     *     @0x95ef4  queue->_syncAt1d0.Unlock()
     *     @0x95f00  (*job.vtable[0x18])()        (virtual "execute" slot on HGUserJob)
     *     @0x95f08  state = 1 (HG_EXEC_STATE_IDLE_READY)
     *     @0x95f0b  jmp outer loop
     * EXIT @0x95e3b:
     *     @0x95e49  queue->_syncAt1d0.Lock()
     *     @0x95e53  state = 3 (HG_EXEC_STATE_SHUTDOWN)
     *     @0x95e59  queue->_syncAt1d0.Unlock()
     *     @0x95e5e  return
     *
     * Exception path @0x95f10-2f: __clang_call_terminate on unwind out of CallNotifyFunc/
     *   list::remove/execute; HGSynchronizer(D1 @HGSynchronizer.ts) cleans the auto-guard.
     *   Not modelled here — JS throw propagates natively.
     */
    RunLoop(): void {
        pthread_setname_np_stub("com.apple.helium-render-queue-exec-unit-user"); // @0x95e29
        // Fast exit if queue is already shutting down BEFORE we ever grab a job (matches
        // disasm @0x95e32-39: the first cbranch skips the outer loop entirely).
        if (this.queue.IsShuttingDown()) {                                 // @0x95e32
            // EXIT path (@0x95e3b-6a) — lock, set state=3, unlock, return.
            const sync = this.queue._syncAt1d0;                            // @0x95e3f
            sync.Lock();                                                   // @0x95e49
            this.state = HG_EXEC_STATE_SHUTDOWN;                           // @0x95e53 (xchgl $3)
            sync.Unlock();                                                 // @0x95e59
            return;                                                         // @0x95e5e
        }
        // Outer loop @0x95e6b.
        // r12 = 0x188 constant in the disasm — offset of the readback-list inside the queue.
        while (true) {
            // The disasm re-tests IsShuttingDown at the top of the wait loop (@0x95e84).
            // This is the "loop-back after empty-job return-code" path.
            const jobBox: { job: HGUserJobRef | null } = { job: null };    // @0x95e8d init null
            const r = this.queue.GetUserJob(this, jobBox);                 // @0x95e9f
            if (r === 0) {                                                 // @0x95ea4  je -> loop
                // r == 0 in the disasm means "no job right now" — re-check shutdown and retry.
                if (this.queue.IsShuttingDown()) {                         // @0x95e84
                    const sync = this.queue._syncAt1d0;
                    sync.Lock();
                    this.state = HG_EXEC_STATE_SHUTDOWN;
                    sync.Unlock();
                    return;
                }
                continue;
            }
            // Job accepted (r != 0 -> fall-through to the job-run block).
            const job = jobBox.job;
            if (job === null) {
                // The real code path never observes r != 0 with job == null (GetUserJob writes
                // *outJob before returning non-zero). This branch would be a caller-contract
                // violation in FCP; we surface it loudly instead of silently continuing.
                throw new Error(
                    "HGRenderQueue::GetUserJob returned success but *outJob is null " +
                    "— caller-contract violation (RunLoop @Helium 0x95ea8)",
                );
            }
            this.state = HG_EXEC_STATE_RUNNING;                            // @0x95ea8 (xchgl $2)
            job.SetState(HGUSERJOB_STATE_FINISHED);                        // @0x95eb9 (SetState(3))
            job.CallNotifyFunc();                                          // @0x95ec2
            const sync = this.queue._syncAt1d0;                            // @0x95ecb
            sync.Lock();                                                   // @0x95edd
            HGRenderQueue__readbackList_remove(                            // @0x95eec
                this.queue._readbackListAt188,
                job,
            );
            sync.Unlock();                                                 // @0x95ef4
            job._vtable_slot18_execute();                                  // @0x95f00 (call *0x18(vtbl))
            this.state = HG_EXEC_STATE_IDLE_READY;                         // @0x95f08 (xchgl $1)
            // jmp back to outer loop (@0x95f0b -> 0x95e80).
        }
    }

    /**
     * HGUserExecUnit::StartRunLoop() — @Helium 0x95f40.
     *
     * Spawns a detached pthread whose start_routine is StartUserExecUnitFunc (@0x95df0), a
     * 12-line trampoline that just calls `this->RunLoop()` and returns `this` as the thread
     * exit value. Returns the `pthread_create` error code (0 on success).
     *
     * Full body (42 lines of disasm):
     *   @0x95f5d  if (thread != nullptr) goto EARLY_EXIT           ; already started
     *   @0x95f64  attr on stack
     *   @0x95f72  pthread_attr_init(&attr)
     *   @0x95f7f  pthread_attr_setdetachstate(&attr, 2)             ; PTHREAD_CREATE_DETACHED
     *   @0x95f94  int rc = pthread_create(&this->thread, &attr,
     *                                     StartUserExecUnitFunc, this)
     *   @0x95f9e  pthread_attr_destroy(&attr)
     *   @0x95fa3  return rc
     * EARLY_EXIT @0x95fa5-bf:
     *   returns 0 (via `xorl %eax, %eax` @0x95f5b before the cmpq — %eax stays 0 through
     *   the shutdown/stack-check block since we skip the whole pthread_create branch).
     *
     * The stack-check-guard prologue/epilogue (@0x95f4d..0x95fbf) is FCP's -fstack-protector
     * plumbing; it does not affect observable behaviour and is not modelled.
     */
    StartRunLoop(): number {
        // Early-out — already spawned. @0x95f5d: `cmpq $0x0, 0x20(%rdi); jne EARLY_EXIT`.
        // %eax was zeroed at @0x95f5b before the cmpq, so the early-exit falls through with rc=0.
        if (this.thread !== null) {                                        // @0x95f5d
            return 0;                                                      // @0x95f5b sets eax=0
        }
        // NOTE: we don't have a real pthread_attr_t in JS; the three attr calls are stubs that
        // throw on invocation. This method must not be called from JS runtime paths that don't
        // provide an alternative threading model — the throw is deliberate ("loud gap"), not a
        // "handle later" hole.
        const attr: unknown = {};                                          // @0x95f64 stack-alloc
        pthread_attr_init_stub(attr);                                      // @0x95f72
        pthread_attr_setdetachstate_stub(attr, 2);                         // @0x95f7f  (2 = DETACHED)
        const rc = pthread_create_stub(                                    // @0x95f94
            this, // &this->thread — the ABI writes into +0x20; pthread_create_stub is a throw.
            attr,
            StartUserExecUnitFunc,                                         // @0x95f84 leaq
            this,                                                          // @0x95f91 movq %r15
        );
        pthread_attr_destroy_stub(attr);                                   // @0x95f9e
        return rc;                                                         // @0x95fa3 movl %ebx,%eax
    }
}

/**
 * StartUserExecUnitFunc — @Helium 0x95df0 (free function, not a class method).
 *
 * pthread start_routine trampoline. Full 12-line body:
 *   0x95df0  push rbp; mov rsp,rbp
 *   0x95df4  push rbx; push rax
 *   0x95df6  movq %rdi, %rbx                       ; save arg (= this)
 *   0x95df9  callq __ZN14HGUserExecUnit7RunLoopEv  ; this->RunLoop()
 *   0x95dfe  movq %rbx, %rax                       ; return arg  (thread exit value = this)
 *   0x95e01  addq $0x8, %rsp; pop rbx; pop rbp; retq
 *
 * The saved argument comes back out as the thread's exit value — matches POSIX
 * `pthread_join` retrieving `this` as `void*`. FCP never actually joins these threads
 * (they're detached), so the return is mostly cosmetic.
 */
export function StartUserExecUnitFunc(arg: unknown): unknown {
    // @0x95df6 %rdi -> %rbx (the "this" pointer)
    const self = arg as HGUserExecUnit;
    // @0x95df9 callq HGUserExecUnit::RunLoop()
    self.RunLoop();
    // @0x95dfe movq %rbx, %rax  — the original arg is the return value.
    return arg;
}
