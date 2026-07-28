// DisconnectAudioDestWorkerTask.ts — Flexo DisconnectAudioDestWorkerTask:
// a one-shot audio-graph teardown worker-task that (a) resets a
// unique_ptr<FFAudioPlaybackUnit>, (b) sends an Objective-C
// `-audioPlaybackMediator` probe to the FFPlaybackContext and disables its
// live-update thread if the mediator is non-null, (c) releases the
// FFStreamAudio Objective-C object, (d) sends `-deleteAudioPlaybackMediator`
// to the FFPlaybackContext, and (e) releases the FFPlaybackContext itself.
//
// Faithful transcription of the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//     Versions/A/Flexo.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Flexo.DisconnectAudioDestWorkerTask.C2.s
//   raw-port/re/disasm/Flexo.DisconnectAudioDestWorkerTask.performTask.s
//   raw-port/re/disasm/Flexo.DisconnectAudioDestWorkerTask.D1.s
//   raw-port/re/disasm/Flexo.DisconnectAudioDestWorkerTask.D0.s
//   raw-port/re/disasm/Flexo.DisconnectAudioDestWorkerTask.getTaskReference.s
//
// Flexo symbols transcribed:
//   @0x00d11e90  DisconnectAudioDestWorkerTask::DisconnectAudioDestWorkerTask(
//                    unique_ptr<FFAudioPlaybackUnit>,
//                    FFStreamAudio*,
//                    FFPlaybackContext*)                             (C1 == C2, aliased)
//   @0x00d11ec0  DisconnectAudioDestWorkerTask::performTask()
//   @0x00d16d00  DisconnectAudioDestWorkerTask::~DisconnectAudioDestWorkerTask()  (D1)
//   @0x00d16d30  DisconnectAudioDestWorkerTask::~DisconnectAudioDestWorkerTask()  (D0)
//   @0x00d16d70  DisconnectAudioDestWorkerTask::getTaskReference()
//
// C1 and C2 are aliased to the same code address in the x86_64 slice
// (confirmed via `nm -arch x86_64`: both mangle to 0x00d11e90).
//
// Vtable & data symbols (from nm on the x86_64 slice):
//   _ZTV29DisconnectAudioDestWorkerTask  @0x01911938  (Itanium vtable start)
//   _ZTI29DisconnectAudioDestWorkerTask  @0x01911998  (typeinfo)
//   _ZTS29DisconnectAudioDestWorkerTask  @0x0157de78  (typeinfo-name)
//
// The C++ "vtable pointer" installed at *this by C2 (and re-installed by
// D1/D0 at the start of the dtor sequence) is `_ZTV + 0x10 = 0x01911948`.
// This is the standard Itanium layout that skips the two 8-byte header
// slots (offset-to-top and RTTI) so the pointer lands on the first
// virtual-method slot.
//
// STRUCT LAYOUT (fully recovered from C2's stores):
//   offset  size  type                         name             (from mangling)
//   ------  ----  ---------------------------  ---------------
//   0x00    8     void*                        __vtable_ptr    (= 0x01911948)
//   0x08    8     FFAudioPlaybackUnit*         playbackUnit     (raw ptr owned by
//                                                                 the moved-from
//                                                                 unique_ptr; the
//                                                                 ctor null-outs the
//                                                                 source slot)
//   0x10    8     FFStreamAudio*               streamAudio     (ObjC id, RC++ implied
//                                                                 by objc_release call)
//   0x18    8     FFPlaybackContext*           playbackContext (ObjC id, RC++ implied
//                                                                 by objc_release call)
//
// Called stubs / data (from otool -tV comments in the disasm):
//   __ZN17PCAutoreleasePoolC1Ev  PCAutoreleasePool::PCAutoreleasePool()
//                                callq 0x14965f4 stub @0x00d11ecd (performTask)
//   __ZN17PCAutoreleasePoolD1Ev  PCAutoreleasePool::~PCAutoreleasePool()
//                                callq 0x14965fa stub @0x00d11f15 (performTask)
//                                callq 0x14965fa stub @0x00d11f43 (performTask exception cleanup)
//   objc_msgSend (via literal-pool fptr @Flexo 0x018ed6c0)
//                                callq *0xbdb7c6(%rip) @0x00d11ef4 (performTask)
//                                callq *0xbdb795(%rip) @0x00d11f25 (performTask)
//   objc_release (via literal-pool fptr @Flexo — same 0x018ed6c0 fptr
//                 table region, but at a different function slot)
//                                callq *0xbdb7f7(%rip) @0x00d11f0b (performTask)
//                                callq *0xbdb7d3(%rip) @0x00d11f2f (performTask)
//   __ZN23FFAudioPlaybackMediator23disableLiveUpdateThreadEv
//                                FFAudioPlaybackMediator::disableLiveUpdateThread()
//                                callq @0x00d11f02
//   __ZdlPv                      ::operator delete(void*)
//                                jmp 0x1497404 stub @0x00d16d49 (D0)
//                                jmp 0x1497404 stub @0x00d16d6a (D0)
//   __Unwind_Resume              callq 0x1495d30 stub @0x00d11f4b (performTask)
//
// Selectors (RIP-relative selref reads, resolved by walking the
// __objc_selrefs table):
//   selref @0x00bf1138  ->  "audioPlaybackMediator"       (@0x00d11eed)
//   selref @0x00bf1140  ->  "deleteAudioPlaybackMediator" (@0x00d11f1e)
//
// (These selrefs are stored with the chained-fixup high-bit ORed into the
// value; the low 32 bits are the RVA of the null-terminated selector
// string. Verified by xxd of the Flexo x86_64 slice at file-offsets
// 0x0175aa5b+0x4000 and 0x01779796+0x4000, which read the strings
// "audioPlaybackMediator" and "deleteAudioPlaybackMediator" respectively.)
//
// Frontier callees (not-yet-transcribed):
//   PCAutoreleasePool ctor/dtor                                        — throw-stub
//   objc_msgSend (dynamic ObjC dispatch)                                — throw-stub
//   objc_release (ObjC ARC release)                                     — throw-stub
//   FFAudioPlaybackMediator::disableLiveUpdateThread()                  — throw-stub
//   FFAudioPlaybackUnit's own vtable[0x8] (its "reset"/"destroy" vfn)   — throw-stub
//   ::operator delete(void*)                                            — JS GC; documented only
//   ::__Unwind_Resume                                                   — JS: exception rethrow

// ---------------------------------------------------------------------------
// Frontier types (undecoded C++/ObjC types surfaced as opaque handles).
// ---------------------------------------------------------------------------

/** FFAudioPlaybackUnit — the C++ playback-unit owned by the incoming
 *  unique_ptr. Its own vtable[0x8] slot is invoked during performTask; not
 *  yet decoded (that vfn is `virtual reset()`/`virtual destroy()`-ish
 *  based on the null-out pattern surrounding it). */
export interface FFAudioPlaybackUnit {
  /** Vtable slot at byte offset 0x08 on FFAudioPlaybackUnit's own vtable
   *  (i.e., `*(void**)&vtable[0x08]`). Invoked as `(*this->vt[0x08])(this)`
   *  from performTask @0x00d11ee6. Not yet decoded — throwing stub. */
  __vfn_at_0x08(): void;
}

/** FFStreamAudio — an Objective-C class (id-typed retainable). We only
 *  ever objc_release it here, so the surface is a nominal opaque handle. */
export interface FFStreamAudio {}

/** FFAudioPlaybackMediator — a C++ class exposed by FFPlaybackContext via
 *  the `-audioPlaybackMediator` ObjC selector. Only its
 *  `disableLiveUpdateThread()` member is referenced here. */
export interface FFAudioPlaybackMediator {}

/** FFPlaybackContext — an Objective-C class (id-typed retainable). Two
 *  selectors are sent to it in performTask: `-audioPlaybackMediator`
 *  (returns a `FFAudioPlaybackMediator*` or nil) and
 *  `-deleteAudioPlaybackMediator` (return type unused). */
export interface FFPlaybackContext {}

/** PCAutoreleasePool — RAII wrapper for an NSAutoreleasePool. Used by
 *  performTask to bracket the ObjC calls. Not decoded here. */
export interface PCAutoreleasePool {}

/** Global stubs for the ObjC runtime hooks and the Flexo helper called
 *  from performTask. All throw with @0xADDR provenance. */
export function PCAutoreleasePool_ctor(_pool: PCAutoreleasePool): void {
  throw new Error(
    "PCAutoreleasePool::PCAutoreleasePool @Flexo (stub 0x14965f4; callq @0x00d11ecd) not yet transcribed",
  );
}
export function PCAutoreleasePool_dtor(_pool: PCAutoreleasePool): void {
  throw new Error(
    "PCAutoreleasePool::~PCAutoreleasePool @Flexo (stub 0x14965fa; callq @0x00d11f15/@0x00d11f43) not yet transcribed",
  );
}
export function objc_msgSend<T>(_receiver: unknown, _selector: string, ..._args: unknown[]): T {
  throw new Error(
    "objc_msgSend @Flexo (fptr *(0x018ed6c0)(%rip); callq @0x00d11ef4 / @0x00d11f25) not yet transcribed",
  );
}
export function objc_release(_receiver: unknown): void {
  throw new Error(
    "objc_release @Flexo (fptr callq *0xbdb7f7(%rip)/*0xbdb7d3(%rip) @0x00d11f0b / @0x00d11f2f) not yet transcribed",
  );
}
export function FFAudioPlaybackMediator_disableLiveUpdateThread(_m: FFAudioPlaybackMediator): void {
  throw new Error(
    "FFAudioPlaybackMediator::disableLiveUpdateThread @Flexo (callq @0x00d11f02) not yet transcribed",
  );
}
export function Unwind_Resume(_exception: unknown): never {
  throw new Error(
    "__Unwind_Resume @Flexo (stub 0x1495d30; callq @0x00d11f4b) not yet transcribed",
  );
}

// ---------------------------------------------------------------------------
// The vtable pointer for HasVtable-installed instances of this class.
// ---------------------------------------------------------------------------

/** _ZTV29DisconnectAudioDestWorkerTask + 0x10 — the pointer the ctor
 *  writes at *this[0x00]. (D1 and D0 re-install this value at the start
 *  of their bodies to detach any subclass override before running the
 *  base-part of the cleanup.) */
export const DisconnectAudioDestWorkerTask_VTABLE_PTR = 0x01911948;

// ---------------------------------------------------------------------------
// The struct.
// ---------------------------------------------------------------------------

/** DisconnectAudioDestWorkerTask — the class this file transcribes.
 *  Layout recovered from C2's stores (see file-level comment). */
export interface DisconnectAudioDestWorkerTask {
  /** offset 0x00. Written by C2 @0x00d11e9b to _ZTV + 0x10; rewritten by
   *  D1 @0x00d16d0e and D0 @0x00d16d37 to the same value. */
  __vtable_ptr: number;
  /** offset 0x08. FFAudioPlaybackUnit raw pointer moved out of the
   *  caller's unique_ptr at ctor time (source slot null-out at
   *  @0x00d11ea1). */
  playbackUnit: FFAudioPlaybackUnit | null;
  /** offset 0x10. FFStreamAudio* (ObjC, refcounted; released by
   *  performTask @0x00d11f0b). */
  streamAudio: FFStreamAudio | null;
  /** offset 0x18. FFPlaybackContext* (ObjC, refcounted; released by
   *  performTask @0x00d11f2f, after two selectors are sent to it). */
  playbackContext: FFPlaybackContext | null;
}

// ---------------------------------------------------------------------------
// DisconnectAudioDestWorkerTask::DisconnectAudioDestWorkerTask(...)
//   C1/C2 aliased @Flexo 0x00d11e90
//
// Faithful to raw-port/re/disasm/Flexo.DisconnectAudioDestWorkerTask.C2.s:
//
//   @0x00d11e90  pushq %rbp ; movq %rsp, %rbp
//   @0x00d11e94  leaq 0xbffaad(%rip), %rax
//                   ; rax = _ZTV29DisconnectAudioDestWorkerTask + 0x10 = 0x01911948
//   @0x00d11e9b  movq %rax, (%rdi)          ; self.__vtable_ptr = 0x01911948
//   @0x00d11e9e  movq (%rsi), %rax          ; rax = *arg1 = arg1->_ptr
//                                             ; (unique_ptr layout: raw ptr at +0)
//   @0x00d11ea1  movq $0x0, (%rsi)          ; *arg1 = null (moved-from state)
//   @0x00d11ea8  movq %rax, 0x8(%rdi)       ; self.playbackUnit = raw ptr
//   @0x00d11eac  movq %rdx, 0x10(%rdi)      ; self.streamAudio = arg2
//   @0x00d11eb0  movq %rcx, 0x18(%rdi)      ; self.playbackContext = arg3
//   @0x00d11eb4  popq %rbp ; retq
//
// Note the arg1 (unique_ptr) is passed BY VALUE (in the calling convention
// this means "as a pointer to a temporary the caller allocated"). The
// standard libc++ layout of `unique_ptr<T, default_delete<T>>` is a single
// raw pointer at offset 0 — that's what the ctor reads. We DO null the
// caller's slot at @0x00d11ea1, matching move-construction semantics.
// ---------------------------------------------------------------------------

/** DisconnectAudioDestWorkerTask constructor. C1/C2 aliased @Flexo 0x00d11e90.
 *  Adopts the FFAudioPlaybackUnit* out of the caller's unique_ptr (which
 *  is null'd), stores the raw FFStreamAudio* and FFPlaybackContext*, and
 *  installs the class vtable pointer.
 *
 *  The first argument mirrors the C++ signature by passing a mutable
 *  1-slot container the ctor null's out — the TS equivalent of the libc++
 *  unique_ptr's single-pointer field. */
export function DisconnectAudioDestWorkerTask_ctor(
  self: DisconnectAudioDestWorkerTask,
  playbackUnitSlot: { ptr: FFAudioPlaybackUnit | null },
  streamAudio: FFStreamAudio | null,
  playbackContext: FFPlaybackContext | null,
): void {
  // @0x00d11e94/@0x00d11e9b  install vtable pointer
  self.__vtable_ptr = DisconnectAudioDestWorkerTask_VTABLE_PTR;
  // @0x00d11e9e/@0x00d11ea1/@0x00d11ea8  move raw ptr out of unique_ptr
  const adopted = playbackUnitSlot.ptr;
  playbackUnitSlot.ptr = null;
  self.playbackUnit = adopted;
  // @0x00d11eac  streamAudio slot
  self.streamAudio = streamAudio;
  // @0x00d11eb0  playbackContext slot
  self.playbackContext = playbackContext;
}

// ---------------------------------------------------------------------------
// DisconnectAudioDestWorkerTask::performTask() @Flexo 0x00d11ec0
//
// Faithful to raw-port/re/disasm/Flexo.DisconnectAudioDestWorkerTask.performTask.s:
//
//   Prologue: allocate an on-stack PCAutoreleasePool at -0x10(%rbp).
//
//   @0x00d11ec9  leaq -0x10(%rbp), %rdi
//   @0x00d11ecd  callq PCAutoreleasePool::PCAutoreleasePool()   ; pool ctor
//
//   Step 1: reset the unique_ptr<FFAudioPlaybackUnit> (self+0x08). Read
//   the raw pointer, null the slot, then if non-null invoke the unit's
//   own vtable slot 0x08 (its virtual "destroy"/"reset" hook).
//
//   @0x00d11ed2  movq 0x8(%rbx), %rdi              ; rdi = self.playbackUnit
//   @0x00d11ed6  movq $0x0, 0x8(%rbx)              ; self.playbackUnit = null
//   @0x00d11ede  testq %rdi, %rdi
//   @0x00d11ee1  je   0xd11ee9                     ; if null skip vtable call
//   @0x00d11ee3  movq (%rdi), %rax                 ; rax = *(void**)unit = unit's vtable
//   @0x00d11ee6  callq *0x8(%rax)                  ; unit.__vfn_at_0x08()
//
//   Step 2: probe FFPlaybackContext for an FFAudioPlaybackMediator via
//   ObjC dispatch; if non-null, call its disableLiveUpdateThread().
//
//   @0x00d11ee9  movq 0x18(%rbx), %rdi             ; rdi = self.playbackContext
//   @0x00d11eed  movq 0xedf244(%rip), %rsi         ; rsi = selref -> "audioPlaybackMediator"
//   @0x00d11ef4  callq *0xbdb7c6(%rip)             ; rax = objc_msgSend(rdi, rsi)
//   @0x00d11efa  testq %rax, %rax
//   @0x00d11efd  je   0xd11f07                     ; if nil skip
//   @0x00d11eff  movq %rax, %rdi
//   @0x00d11f02  callq FFAudioPlaybackMediator::disableLiveUpdateThread()
//
//   Step 3: objc_release self.streamAudio, then destroy the autorelease
//   pool.
//
//   @0x00d11f07  movq 0x10(%rbx), %rdi             ; rdi = self.streamAudio
//   @0x00d11f0b  callq *0xbdb7f7(%rip)             ; objc_release(streamAudio)
//   @0x00d11f11  leaq -0x10(%rbp), %rdi
//   @0x00d11f15  callq PCAutoreleasePool::~PCAutoreleasePool() ; pool dtor
//
//   Step 4: send `-deleteAudioPlaybackMediator` to FFPlaybackContext,
//   discarding the return value, then objc_release the context.
//
//   @0x00d11f1a  movq 0x18(%rbx), %rdi             ; rdi = self.playbackContext
//   @0x00d11f1e  movq 0xedf21b(%rip), %rsi         ; rsi = selref -> "deleteAudioPlaybackMediator"
//   @0x00d11f25  callq *0xbdb795(%rip)             ; objc_msgSend(rdi, rsi) — result discarded
//   @0x00d11f2b  movq 0x18(%rbx), %rdi             ; rdi = self.playbackContext (reload)
//   @0x00d11f2f  callq *0xbdb7d3(%rip)             ; objc_release(playbackContext)
//   @0x00d11f35  addq $0x8, %rsp ; popq %rbx ; popq %rbp ; retq
//
//   Exception cleanup landing pad (@0x00d11f3c-@0x00d11f4b): if the pool
//   ctor or the unit's virtual dtor throws, the compiler unwinds the pool
//   via PCAutoreleasePool::~PCAutoreleasePool() and re-raises via
//   __Unwind_Resume. In TypeScript we express the same shape with a
//   try/finally around the pool ctor/dtor and let JS's throw semantics
//   handle the "re-raise" implicitly.
// ---------------------------------------------------------------------------

/** DisconnectAudioDestWorkerTask::performTask() @Flexo 0x00d11ec0.
 *  Tears down the playback graph in the order documented in the block
 *  comment above. */
export function DisconnectAudioDestWorkerTask_performTask(
  self: DisconnectAudioDestWorkerTask,
): void {
  // @0x00d11ec9/@0x00d11ecd  PCAutoreleasePool pool;
  const pool: PCAutoreleasePool = {};
  PCAutoreleasePool_ctor(pool);
  try {
    // @0x00d11ed2/@0x00d11ed6  move unique_ptr out of self.playbackUnit
    const unit = self.playbackUnit;
    self.playbackUnit = null;
    // @0x00d11ede-@0x00d11ee6  if (unit != null) unit->vt[0x8](unit)
    if (unit !== null) {
      unit.__vfn_at_0x08();
    }
    // @0x00d11ee9-@0x00d11ef4  mediator = [playbackContext audioPlaybackMediator]
    const mediator = objc_msgSend<FFAudioPlaybackMediator | null>(
      self.playbackContext,
      "audioPlaybackMediator",
    );
    // @0x00d11efa-@0x00d11f02  if (mediator != nil) mediator.disableLiveUpdateThread()
    if (mediator !== null) {
      FFAudioPlaybackMediator_disableLiveUpdateThread(mediator);
    }
    // @0x00d11f07/@0x00d11f0b  objc_release(self.streamAudio)
    objc_release(self.streamAudio);
  } finally {
    // @0x00d11f11/@0x00d11f15  ~PCAutoreleasePool (both success and
    // exception-cleanup paths — the compiler emits an equivalent to
    // try/finally for the RAII wrapper).
    PCAutoreleasePool_dtor(pool);
  }
  // @0x00d11f1a-@0x00d11f25  [playbackContext deleteAudioPlaybackMediator]
  //   (return value discarded)
  objc_msgSend<unknown>(self.playbackContext, "deleteAudioPlaybackMediator");
  // @0x00d11f2b/@0x00d11f2f  objc_release(self.playbackContext)
  objc_release(self.playbackContext);
}

// ---------------------------------------------------------------------------
// DisconnectAudioDestWorkerTask::~DisconnectAudioDestWorkerTask()  D1 @0x00d16d00
//
// Faithful to raw-port/re/disasm/Flexo.DisconnectAudioDestWorkerTask.D1.s.
//
// D1 (complete-object dtor) re-installs the vtable pointer and then does
// a "release-and-reset" of the unique_ptr member — if non-null, it tail-
// calls the unit's own vtable slot 0x08 (matching the same "delete via
// virtual" pattern performTask uses).
//
//   @0x00d16d00  pushq %rbp ; movq %rsp, %rbp
//   @0x00d16d04  movq  %rdi, %rax                     ; rax = self (saved for later)
//   @0x00d16d07  leaq  0xbfac3a(%rip), %rcx           ; rcx = _ZTV + 0x10 = 0x01911948
//   @0x00d16d0e  movq  %rcx, (%rdi)                   ; self.__vtable_ptr = 0x01911948
//   @0x00d16d11  movq  0x8(%rdi), %rdi                ; rdi = self.playbackUnit
//   @0x00d16d15  movq  $0x0, 0x8(%rax)                ; self.playbackUnit = null
//   @0x00d16d1d  testq %rdi, %rdi
//   @0x00d16d20  je    0xd16d29                       ; if null return
//   @0x00d16d22  movq  (%rdi), %rax                   ; rax = unit's vtable
//   @0x00d16d25  popq  %rbp
//   @0x00d16d26  jmpq  *0x8(%rax)                     ; tail-call unit.__vfn_at_0x08()
//   @0x00d16d29  popq  %rbp ; retq                    ; else return
//
// NOTE: D1 does NOT release the ObjC members (streamAudio /
// playbackContext) — that responsibility belongs to performTask (which is
// how this class works: performTask consumes/releases everything, and
// D1/D0 are only run if performTask was never invoked or partway through
// exception unwinding). We surface the exact structural behavior below
// without adding ObjC releases.
// ---------------------------------------------------------------------------

/** DisconnectAudioDestWorkerTask::~DisconnectAudioDestWorkerTask() (D1)
 *  @Flexo 0x00d16d00. Re-installs the class vtable pointer, resets
 *  self.playbackUnit to null, and tail-invokes the unit's own vtable slot
 *  0x8 if it was non-null. */
export function DisconnectAudioDestWorkerTask_dtor_D1(
  self: DisconnectAudioDestWorkerTask,
): void {
  // @0x00d16d07/@0x00d16d0e
  self.__vtable_ptr = DisconnectAudioDestWorkerTask_VTABLE_PTR;
  // @0x00d16d11/@0x00d16d15
  const unit = self.playbackUnit;
  self.playbackUnit = null;
  // @0x00d16d1d-@0x00d16d26
  if (unit !== null) {
    unit.__vfn_at_0x08();
  }
}

// ---------------------------------------------------------------------------
// DisconnectAudioDestWorkerTask::~DisconnectAudioDestWorkerTask()  D0 @0x00d16d30
//
// Faithful to raw-port/re/disasm/Flexo.DisconnectAudioDestWorkerTask.D0.s.
//
// D0 (deleting-dtor) is the "same behavior as D1 followed by operator
// delete" variant. The disasm inlines the D1 body rather than calling D1,
// then either tail-jumps to ::operator delete (fast path when the unit
// pointer was null) or calls the unit's vtable slot 0x8 and then tail-
// jumps to ::operator delete.
//
//   @0x00d16d30  leaq 0xbfac11(%rip), %rax            ; rax = _ZTV + 0x10 = 0x01911948
//   @0x00d16d37  movq %rax, (%rdi)                    ; self.__vtable_ptr = 0x01911948
//   @0x00d16d3a  movq 0x8(%rdi), %rax                 ; rax = self.playbackUnit
//   @0x00d16d3e  movq $0x0, 0x8(%rdi)                 ; self.playbackUnit = null
//   @0x00d16d46  testq %rax, %rax
//   @0x00d16d49  je   0x1497404                       ; if null, tail-jmp to ::operator delete
//   ---
//   @0x00d16d4f  pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; pushq %rax
//   @0x00d16d55  movq (%rax), %rcx                    ; rcx = unit's vtable
//   @0x00d16d58  movq %rdi, %rbx                      ; rbx = self (saved for delete)
//   @0x00d16d5b  movq %rax, %rdi                      ; rdi = unit (arg1 of vfn)
//   @0x00d16d5e  callq *0x8(%rcx)                     ; unit.__vfn_at_0x08()
//   @0x00d16d61  movq %rbx, %rdi                      ; rdi = self
//   @0x00d16d64  addq $0x8, %rsp ; popq %rbx ; popq %rbp
//   @0x00d16d6a  jmp   0x1497404                       ; tail-jmp to ::operator delete(self)
// ---------------------------------------------------------------------------

/** DisconnectAudioDestWorkerTask::~DisconnectAudioDestWorkerTask() (D0)
 *  @Flexo 0x00d16d30. Runs the same body as D1, then tail-calls
 *  ::operator delete on self. In TypeScript there is no `operator delete`
 *  (JS GC handles reclamation), so this reduces to the D1 body. */
export function DisconnectAudioDestWorkerTask_dtor_D0(
  self: DisconnectAudioDestWorkerTask,
): void {
  // @0x00d16d30/@0x00d16d37
  self.__vtable_ptr = DisconnectAudioDestWorkerTask_VTABLE_PTR;
  // @0x00d16d3a/@0x00d16d3e
  const unit = self.playbackUnit;
  self.playbackUnit = null;
  // @0x00d16d46-@0x00d16d5e
  if (unit !== null) {
    unit.__vfn_at_0x08();
  }
  // @0x00d16d49 / @0x00d16d6a  jmp __ZdlPv (::operator delete(self)).
  // No-op in TypeScript; JS GC reclaims `self`.
}

// ---------------------------------------------------------------------------
// DisconnectAudioDestWorkerTask::getTaskReference() @Flexo 0x00d16d70
//
// Faithful to raw-port/re/disasm/Flexo.DisconnectAudioDestWorkerTask.getTaskReference.s:
//   @0x00d16d70  pushq %rbp ; movq %rsp, %rbp
//   @0x00d16d74  xorl  %eax, %eax                     ; return 0 / nullptr
//   @0x00d16d76  popq  %rbp ; retq
//
// A pure "return nullptr". In the FCP worker-task hierarchy, `getTaskReference()`
// is a virtual that lets a task supply a shared "reference-counted handle"
// via which the scheduler tracks it; this class opts out by always
// returning nullptr.
// ---------------------------------------------------------------------------

/** DisconnectAudioDestWorkerTask::getTaskReference() @Flexo 0x00d16d70.
 *  Always returns null. */
export function DisconnectAudioDestWorkerTask_getTaskReference(
  _self: DisconnectAudioDestWorkerTask,
): null {
  // @0x00d16d74 xorl %eax, %eax -> return 0.
  return null;
}
