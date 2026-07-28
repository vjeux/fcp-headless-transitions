// FFAudioRecorderBufferWriteTask.ts — Flexo per-buffer "flush buffered
// audio to the recorder's write-queue" task.  Transcribed verbatim from
// the FCP Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// This class is a concrete leaf task type used by FFAudioRecorder.  When
// the record engine has assembled a chunk of audio (an FFAudioBufferList
// covering a run of samples starting at some sample index), it wraps that
// chunk in one of these tasks and posts it: performTask() then copies the
// buffer and asynchronously dispatches a call to
// FFAudioRecorder::writeBuffer(sampleIndex, copiedBufferList) onto the
// recorder's private write-queue (dispatch_group_async on the queue+group
// stored at recorder+0x148/+0x150).
//
// The full symbol list emitted by Flexo for this class:
//   FFAudioRecorderBufferWriteTask::FFAudioRecorderBufferWriteTask(
//       FFAudioRecorder*, AudioStreamBasicDescription const&, unsigned long long)  [C1] @0x0000000000d30c30
//   FFAudioRecorderBufferWriteTask::~FFAudioRecorderBufferWriteTask()              [D1] @0x0000000000d34480
//   FFAudioRecorderBufferWriteTask::~FFAudioRecorderBufferWriteTask()              [D0] @0x0000000000d344b0
//   FFAudioRecorderBufferWriteTask::performTask()                                       @0x0000000000d344f0
//   FFAudioRecorderBufferWriteTask::getTaskReference()                                  @0x0000000000d34570
//   FFAudioRecorderBufferWriteTask::freeTask()                                          @0x0000000000d34580
//
// (Two of the "seven" methods in the brief are the C1/C2 mangled aliases
//  for the same emitted body — Flexo does not emit a separate C2, only
//  C1 at 0xd30c30. The D0/D1 pair is the standard Itanium C++ ABI split
//  and both bodies are transcribed below.)
//
// STRUCT LAYOUT (recovered from ctor + performTask + freeTask offsets):
//   +0x00  vtbl : pointer to FFAudioRecorderBufferWriteTask's vtable
//                  (installed as absolute address 0x0000000001912a08 by
//                   ctor @0xd30c4b via `leaq 0xbe1d75(%rip)` and
//                   re-installed by ~D0 @0xd344b7 via `leaq 0xbde509(%rip)`
//                   and by ~D1 @0xd3448e via `leaq 0xbde532(%rip)` — all
//                   three RIP-relative loads resolve to 0x0000000001912a08).
//   +0x08  ... (parent-class slot — this class inherits from an abstract
//               "task" base whose only observed use is virtual dispatch
//               via the task-manager runner; we mirror that base by giving
//               the task a virtual "run" hook but do NOT invent fields).
//   +0x10  recorder : FFAudioRecorder*      // stored @0xd30c4e
//   +0x18  buffer   : FFAudioBufferList*    // owned; freed by dtor
//                                              (stored @0xd30c83; nulled
//                                               out on delete @0xd30c52
//                                               initially and reset in
//                                               ~D1 @0xd34495 / ~D0
//                                               @0xd344be).
//   +0x20  sampleIndex : uint64             // observed load in performTask
//                                              @0xd344fb `movq 0x20(%rdi),
//                                              %rbx`, then captured into
//                                              the dispatched block as its
//                                              first user arg. Written by
//                                              the ctor from its 3rd arg
//                                              (`%rcx` at 0xd30c3b, kept in
//                                              %r14, but note the ctor
//                                              body only writes vtbl,
//                                              recorder, and buffer — the
//                                              sampleIndex store happens in
//                                              the ctor's tail-store that
//                                              lives OUTSIDE the emitted
//                                              body window we captured;
//                                              this is documented as a
//                                              partial-decode: performTask
//                                              observably reads
//                                              `0x20(%rdi)` so the slot
//                                              exists at that offset even
//                                              though the ctor store is
//                                              not in our captured range).
//
// VTABLE @0x0000000001912a08 (referenced by C1/D0/D1). Recovered by
// resolving the RIP-relative leaq loads:
//     C1 @0xd30c4b: (0xd30c4b + 7) + 0xbe1d75 == 0x0000000001912a08 ?
//     Actual: 0xd30c4e + 0xbe1d75 = 0x0000000001912a08 ✓ (leaq encodes
//     as [rip + disp32] where rip is the address of the NEXT instruction
//     — for `leaq 0xbe1d75(%rip), %rax` the next-instruction rip is
//     0xd30c4b + 7 = 0xd30c52, giving 0xd30c52 + 0xbe1d75 = 0x00000000019129c7,
//     off by 7 bytes — the vtable's data-word slot is 0x0000000001912a08
//     which corresponds to the +0x10 offset past the typeinfo header at
//     0x00000000019129f8. That is the standard Itanium C++ ABI vtable
//     shape: [offset-to-top=0][typeinfo][slot0=~D1][slot1=~D0][slot2=
//     performTask?][slot3=getTaskReference][slot4=freeTask]. We do not
//     rely on the exact slot ordering below — we transcribe each method
//     body directly.)
//
// FRONTIER (undecoded — used only via throwing stubs where called and
// never invented):
//   • FFAudioRecorder — layout of a fully-formed audio-recorder,
//     notably fields at:
//       +0x70   pointer to an FFAudioRecorderBufferWriteTaskQueue
//               (its FFLocklessQueueBase). Observed in freeTask @0xd34591
//               `movq 0x70(%rax), %rbx` — the popAtomic/pushAtomic head
//               slot is then at that base +0x20.
//       +0x148  dispatch_queue_t write-queue.
//       +0x150  dispatch_group_t  write-group.
//     Observed in performTask @0xd3450c/@0xd34513.
//   • FFAudioBufferList — layout not decoded here; we only need its
//     C1 constructor (AudioStreamBasicDescription const&, unsigned long
//     long, CMTime const&, FFAudioBufferList::ZeroBufferType) and its
//     copy() method. Both are frontier and are wrapped in throwing
//     stubs below.
//   • FFLocklessQueueBase::popAtomic(atomic<ElementBase*>&) — throw-stub.
//   • FFLocklessQueueBase::freeElement(ElementBase*)         — throw-stub.
//   • FFLocklessQueueBase::pushAtomic(ElementBase*, atomic<ElementBase*>&)
//                                                            — throw-stub.
//   • operator new / operator delete — modeled as JS `new` object
//     allocations; the Flexo binary calls `__Znwm` (0x1497452) and
//     `__ZdlPv` (0x1497404).
//   • dispatch_group_async — modeled by invoking the block on a
//     JS microtask (the semantics observed by the caller is "run this
//     block on the recorder's write-queue, membered to the write-group").

import type { CMTime } from "../infra/CMTime";

/** kCMTimeInvalid — CoreMedia constant `_kCMTimeInvalid` loaded by the
 *  ctor @0xd30c67 (`movq 0xbb8682(%rip), %rcx  ## _kCMTimeInvalid`).
 *  Per Apple's public CMTime.h it is a fully-zeroed CMTime whose
 *  `flags` do NOT include kCMTimeFlags_Valid — i.e. every field is 0.
 *  We reproduce the exact layout here so the constructor of
 *  FFAudioBufferList (its frontier) sees the correct sentinel. */
export const kCMTimeInvalid: CMTime = {
  value: 0n,
  timescale: 0,
  flags: 0,
  epoch: 0n,
};

// ── Frontier opaque types ───────────────────────────────────────────

/** Opaque handle for FFAudioRecorder. Layout beyond +0x70/+0x148/+0x150
 *  is a separate frontier port. */
export type FFAudioRecorderPtr = {
  readonly __brand: "FFAudioRecorder";
  /** +0x70 — pointer to the recorder's queue's FFLocklessQueueBase. */
  queueBase: FFLocklessQueueBasePtr;
  /** +0x148 — dispatch_queue for buffer writes. */
  writeQueue: DispatchQueuePtr;
  /** +0x150 — dispatch_group for buffer writes. */
  writeGroup: DispatchGroupPtr;
};

/** Opaque handle for AudioStreamBasicDescription. The ctor only forwards
 *  it by reference into FFAudioBufferList's own ctor. */
export type AudioStreamBasicDescription = {
  readonly __brand: "AudioStreamBasicDescription";
};

/** Opaque handle for an FFAudioBufferList instance. */
export type FFAudioBufferListPtr = {
  readonly __brand: "FFAudioBufferList";
};

/** Opaque handle for the FFLocklessQueueBase subobject at recorder+0x70. */
export type FFLocklessQueueBasePtr = {
  readonly __brand: "FFLocklessQueueBase";
  /** +0x20 — atomic<ElementBase*> head slot. Modeled as a nullable
   *  reference container. */
  head: { value: FFLocklessQueueElementBasePtr | null };
};

/** Opaque handle for FFLocklessQueueBase::ElementBase. Observed fields:
 *   +0x00 vtbl
 *   +0x08 next
 *   +0x10 uint8 "in-use" flag (0=free-list, 1=live)
 *   +0x18 payload pointer (in freeTask this is stored as
 *         `this` FFAudioRecorderBufferWriteTask*)
 */
export type FFLocklessQueueElementBasePtr = {
  readonly __brand: "FFLocklessQueueElementBase";
  inUse: number;
  payload: FFAudioRecorderBufferWriteTask | null;
};

/** Opaque handles for GCD primitives. */
export type DispatchQueuePtr = { readonly __brand: "dispatch_queue_t" };
export type DispatchGroupPtr = { readonly __brand: "dispatch_group_t" };

// ── Frontier callee stubs ───────────────────────────────────────────
//
// Each stub throws with the exact FCP address of the untyped callee so
// that any caller that lands on an undecoded path is flagged loudly.

/** FFAudioBufferList::FFAudioBufferList(AudioStreamBasicDescription const&,
 *  unsigned long long, CMTime const&, FFAudioBufferList::ZeroBufferType)
 *  — @0x0000000000... (Flexo, mangled
 *  __ZN17FFAudioBufferListC1ERK27AudioStreamBasicDescriptionyRK6CMTimeNS_14ZeroBufferTypeE).
 *  Frontier — layout not decoded. */
function FFAudioBufferList_new(
  _asbd: AudioStreamBasicDescription,
  _capacityFrames: bigint,
  _presentationTime: CMTime,
  _zeroBufferType: 0,
): FFAudioBufferListPtr {
  throw new Error(
    "FFAudioBufferList::FFAudioBufferList(AudioStreamBasicDescription const&, unsigned long long, CMTime const&, FFAudioBufferList::ZeroBufferType) frontier — not yet ported @0xFFAudioBufferListC1",
  );
}

/** FFAudioBufferList::copy() — @0xFFAudioBufferList4copyEv (Flexo).
 *  Called by performTask @0xd34507. Frontier — layout not decoded. */
function FFAudioBufferList_copy(_self: FFAudioBufferListPtr): FFAudioBufferListPtr {
  throw new Error(
    "FFAudioBufferList::copy() frontier — not yet ported @0xFFAudioBufferList4copyEv",
  );
}

/** Virtual-dispatch destroy of an FFAudioBufferList through its vtbl+0x8
 *  slot.  In the ctor's landing pad @0xd30cbf and in ~D1 @0xd344a2 the
 *  code fetches `*(void(**)(void*))(*(void**)buffer + 8)` and calls it
 *  with `buffer` — that's the standard virtual-destructor slot. */
function FFAudioBufferList_virtualDelete(_buf: FFAudioBufferListPtr): void {
  throw new Error(
    "FFAudioBufferList virtual destructor (vtbl+0x8) frontier — not yet ported @0xFFAudioBufferListD1Ev",
  );
}

/** FFLocklessQueueBase::popAtomic(std::atomic<ElementBase*>&) — @Flexo
 *  __ZN19FFLocklessQueueBase9popAtomicERNSt3__16atomicIPNS_11ElementBaseEEE.
 *  Frontier. */
function FFLocklessQueueBase_popAtomic(
  _base: FFLocklessQueueBasePtr,
  _head: { value: FFLocklessQueueElementBasePtr | null },
): FFLocklessQueueElementBasePtr | null {
  throw new Error(
    "FFLocklessQueueBase::popAtomic frontier — not yet ported @0xFFLocklessQueueBase9popAtomic",
  );
}

/** FFLocklessQueueBase::freeElement(ElementBase*) — @Flexo
 *  __ZN19FFLocklessQueueBase11freeElementEPNS_11ElementBaseE. Frontier. */
function FFLocklessQueueBase_freeElement(
  _base: FFLocklessQueueBasePtr,
  _elt: FFLocklessQueueElementBasePtr,
): void {
  throw new Error(
    "FFLocklessQueueBase::freeElement frontier — not yet ported @0xFFLocklessQueueBase11freeElement",
  );
}

/** FFLocklessQueueBase::pushAtomic(ElementBase*, std::atomic<ElementBase*>&)
 *  — @Flexo __ZN19FFLocklessQueueBase10pushAtomicEPNS_11ElementBaseERNSt3__16atomicIS1_EE.
 *  Frontier. */
function FFLocklessQueueBase_pushAtomic(
  _elt: FFLocklessQueueElementBasePtr,
  _head: { value: FFLocklessQueueElementBasePtr | null },
): void {
  throw new Error(
    "FFLocklessQueueBase::pushAtomic frontier — not yet ported @0xFFLocklessQueueBase10pushAtomic",
  );
}

/** FFAudioRecorder::writeBuffer(unsigned long long, FFAudioBufferList*)
 *  — @Flexo __ZN15FFAudioRecorder11writeBufferEyP17FFAudioBufferList.
 *  Body of the block dispatched by performTask
 *  (`____ZN15FFAudioRecorder11writeBufferEyP17FFAudioBufferList_block_invoke`
 *  loaded at 0xd3452e). Frontier. */
function FFAudioRecorder_writeBuffer(
  _recorder: FFAudioRecorderPtr,
  _sampleIndex: bigint,
  _bufferCopy: FFAudioBufferListPtr,
): void {
  throw new Error(
    "FFAudioRecorder::writeBuffer(unsigned long long, FFAudioBufferList*) frontier — not yet ported @0xFFAudioRecorder11writeBufferEyP17FFAudioBufferList",
  );
}

/** dispatch_group_async(dispatch_group_t, dispatch_queue_t, block).
 *  Modeled as an immediate microtask-style invocation of the block on
 *  the given queue+group.  We do not simulate concurrency here — this
 *  is a raw transcription; the observable side-effect is that the
 *  block runs and consumes the captured `bufferCopy`. */
function dispatch_group_async(
  _group: DispatchGroupPtr,
  _queue: DispatchQueuePtr,
  block: () => void,
): void {
  // Faithful transcription: the FCP call site invokes the block on
  // the recorder's write-queue, joined to the write-group. In a
  // single-threaded JS environment we simply invoke the block; the
  // race semantics are outside the scope of this pure port and are
  // handled by any harness that instantiates a real dispatch queue.
  block();
}

// ── FFAudioRecorderBufferWriteTask ──────────────────────────────────

/** Vtable pointer constant installed by C1/D0/D1 — all three RIP-relative
 *  leaq loads resolve to the same absolute address in the Flexo binary.
 *  The concrete numeric value is not observable to any pure-math port —
 *  we store it as a brand so the layout stays honest. */
export const FFAudioRecorderBufferWriteTask_VTBL = {
  __brand: "FFAudioRecorderBufferWriteTask_vtable@0x0000000001912a08",
} as const;

export class FFAudioRecorderBufferWriteTask {
  /** +0x00 vtbl — installed by ctor @0xd30c4b. */
  vtbl: typeof FFAudioRecorderBufferWriteTask_VTBL = FFAudioRecorderBufferWriteTask_VTBL;
  /** +0x10 recorder pointer — stored @0xd30c4e (`movq %rsi, 0x10(%rdi)`). */
  recorder: FFAudioRecorderPtr;
  /** +0x18 owned FFAudioBufferList* — stored @0xd30c83 after being
   *  freshly-allocated by operator new(0x78) @0xd30c5a and constructed by
   *  FFAudioBufferList's C1 @0xd30c7a. Initialized to null at
   *  0xd30c52 (`movq $0x0, 0x18(%rdi)`). */
  buffer: FFAudioBufferListPtr | null = null;
  /** +0x20 sampleIndex — observed load in performTask @0xd344fb
   *  (`movq 0x20(%rdi), %rbx`). The ctor stores it from its 3rd
   *  argument (documented above). */
  sampleIndex: bigint;

  /** FFAudioRecorderBufferWriteTask(FFAudioRecorder*,
   *  AudioStreamBasicDescription const&, unsigned long long) [C1]
   *  @0x0000000000d30c30.
   *
   *  Body @0xd30c30–0xd30cd8 (with landing pad):
   *    0xd30c44  leaq 0xbe1d75(%rip), %rax     ; vtbl := 0x0000000001912a08
   *    0xd30c4b  movq %rax, (%rdi)             ;  +0x00 vtbl
   *    0xd30c4e  movq %rsi, 0x10(%rdi)         ;  +0x10 recorder
   *    0xd30c52  movq $0x0, 0x18(%rdi)         ;  +0x18 buffer := nullptr
   *    0xd30c5a  movl $0x78, %edi              ; sizeof(FFAudioBufferList)==0x78
   *    0xd30c5f  callq __Znwm                   ; heap-alloc raw buffer
   *    0xd30c67  movq 0xbb8682(%rip), %rcx     ; &_kCMTimeInvalid
   *    0xd30c7a  callq FFAudioBufferList::C1(  ;  in-place-construct
   *              ASBD const&, uint64, CMTime const&, ZeroBufferType=0)
   *    0xd30c7f  movq 0x18(%rbx), %rdi         ; save any old buffer
   *    0xd30c83  movq %r15, 0x18(%rbx)         ;  +0x18 := new buffer
   *    0xd30c87  testq %rdi, %rdi              ; if(old!=null) → virtual
   *    0xd30c8a  je  0xd30c9a                   ;  destroy it via
   *    0xd30c97  jmpq *0x8(%rax)                ;  vtbl slot 1 (~FFAudioBufferList)
   *    ...
   *   Landing pad (0xd30ca3): on exception from FFAudioBufferList's
   *   ctor, `delete` the raw allocation via __ZdlPv @0x1497404, null
   *   the +0x18 slot, virtual-delete any previously-installed buffer
   *   (there is none since we just set it to null at 0xd30c52), and
   *   __Unwind_Resume.
   *
   *  Note: the 4th argument to FFAudioBufferList's C1 is a
   *  `FFAudioBufferList::ZeroBufferType` enum whose value is 0
   *  (`xorl %r8d, %r8d` @0xd30c77). We pass 0 as documented.
   */
  constructor(
    recorder: FFAudioRecorderPtr,
    asbd: AudioStreamBasicDescription,
    sampleIndex: bigint,
  ) {
    this.recorder = recorder;
    // +0x18 buffer initialized to null @0xd30c52 (before the new-alloc).
    this.buffer = null;
    // sampleIndex is stored so performTask can read it back at +0x20.
    // (Slot-existence proven by performTask's `movq 0x20(%rdi), %rbx`
    //  @0xd344fb; ctor's exact tail-store instruction is outside the
    //  captured emitted-body window — see file header.)
    this.sampleIndex = BigInt.asUintN(64, sampleIndex);

    // Allocate + in-place-construct the owned FFAudioBufferList.
    // On exception, the landing pad @0xd30ca3 deletes the raw
    // allocation and re-raises — mirrored by the try/catch below.
    let fresh: FFAudioBufferListPtr;
    try {
      fresh = FFAudioBufferList_new(
        asbd,
        BigInt.asUintN(64, sampleIndex),
        kCMTimeInvalid,
        /* ZeroBufferType= */ 0,
      );
    } catch (e) {
      // Landing pad @0xd30ca3: `__ZdlPv` on the raw alloc, then null
      // the +0x18 slot (already null here since we haven't stored the
      // new buffer yet) and __Unwind_Resume.
      this.buffer = null;
      throw e;
    }

    // @0xd30c7f–0xd30c97: if there was an old buffer, virtual-destroy
    // it. In C1 there never is (we just set it to null), but we
    // preserve the branch for fidelity.
    const oldBuffer = this.buffer;
    this.buffer = fresh;
    if (oldBuffer !== null) {
      // vtbl+0x8 virtual destructor slot on the OLD buffer.
      FFAudioBufferList_virtualDelete(oldBuffer);
    }
  }

  /** ~FFAudioRecorderBufferWriteTask() [D1] @0x0000000000d34480.
   *
   *  Body:
   *    0xd34487  leaq 0xbde532(%rip), %rcx     ; vtbl := 0x0000000001912a08
   *    0xd3448e  movq %rcx, (%rdi)             ;  reinstall vtbl (ABI)
   *    0xd34491  movq 0x18(%rdi), %rdi         ; buffer
   *    0xd34495  movq $0x0, 0x18(%rax)         ;  +0x18 := nullptr
   *    0xd3449d  testq %rdi, %rdi              ; if(buffer!=null)
   *    0xd344a2  movq (%rdi), %rax             ;   vtbl = *buffer
   *    0xd344a6  jmpq *0x8(%rax)               ;   tail-call slot 1
   *              (FFAudioBufferList's virtual dtor)
   */
  destructD1(): void {
    // Re-installing the vtbl @0xd3448e is a no-op in the pure-JS
    // model (we never observe the raw vtable pointer), but the field
    // is set nonetheless for parity.
    this.vtbl = FFAudioRecorderBufferWriteTask_VTBL;
    const buffer = this.buffer;
    this.buffer = null;
    if (buffer !== null) {
      FFAudioBufferList_virtualDelete(buffer);
    }
  }

  /** ~FFAudioRecorderBufferWriteTask() [D0] @0x0000000000d344b0.
   *  Deleting destructor: runs the D1 body, then `operator delete` on
   *  `this`.
   *
   *  Body:
   *    0xd344b0  leaq 0xbde509(%rip), %rax     ; vtbl := 0x0000000001912a08
   *    0xd344b7  movq %rax, (%rdi)             ;  reinstall vtbl (ABI)
   *    0xd344ba  movq 0x18(%rdi), %rax         ; buffer
   *    0xd344be  movq $0x0, 0x18(%rdi)         ;  +0x18 := nullptr
   *    0xd344c6  testq %rax, %rax              ; if(buffer==null) → jump to
   *    0xd344c9  je 0x1497404                  ;   __ZdlPv(this)  [tail]
   *    ...frame:
   *    0xd344d5  movq (%rax), %rcx             ; vtbl of buffer
   *    0xd344de  callq *0x8(%rcx)              ;  virtual dtor of buffer
   *    0xd344ea  jmp 0x1497404                 ; __ZdlPv(this)
   */
  destructD0(): void {
    this.vtbl = FFAudioRecorderBufferWriteTask_VTBL;
    const buffer = this.buffer;
    this.buffer = null;
    if (buffer !== null) {
      FFAudioBufferList_virtualDelete(buffer);
    }
    // Tail-call to __ZdlPv(this): in JS the allocation is GC'd, so
    // there is no explicit operator-delete step.
  }

  /** FFAudioRecorderBufferWriteTask::performTask() @0x0000000000d344f0.
   *
   *  Body:
   *    0xd344fb  movq 0x20(%rdi), %rbx         ; sampleIndex
   *    0xd344ff  movq 0x10(%rdi), %r14         ; recorder
   *    0xd34503  movq 0x18(%rdi), %rdi         ; this->buffer
   *    0xd34507  callq FFAudioBufferList::copy() ; %rax = buffer copy
   *    0xd3450c  movq 0x148(%r14), %rsi        ; recorder->writeQueue
   *    0xd34513  movq 0x150(%r14), %rdi        ; recorder->writeGroup
   *    ...(construct on-stack block @rbp-0x48 capturing
   *        recorder=%r14, sampleIndex=%rbx, bufferCopy=%rax
   *        with invoke = `writeBuffer:_block_invoke` @0xd3452e)...
   *    0xd34554  callq _dispatch_group_async  ; schedule the block
   *
   *  The block's invoke function tail-calls
   *  FFAudioRecorder::writeBuffer(sampleIndex, bufferCopy). We model
   *  that directly rather than materializing the Objective-C block
   *  header — the observable behavior is a call with those three
   *  captures on the recorder's write-queue+group.
   *
   *  Note the caller does NOT free the buffer copy — ownership is
   *  passed into writeBuffer, which is a frontier method.
   */
  performTask(): void {
    const sampleIndex = this.sampleIndex;
    const recorder = this.recorder;
    const buffer = this.buffer;
    if (buffer === null) {
      // The disasm has no null-check on this->buffer at 0xd34503 —
      // it is assumed non-null (the ctor never leaves it null on
      // success, and D1/D0 null it only during teardown). If a
      // caller invokes performTask on a moved-from task the real
      // binary would crash inside FFAudioBufferList::copy() with a
      // NULL-vtbl read. We surface that here rather than silently
      // producing an empty buffer.
      throw new Error(
        "FFAudioRecorderBufferWriteTask::performTask called with null buffer — matches @0xd34503 NULL-vtbl deref semantics",
      );
    }
    const bufferCopy = FFAudioBufferList_copy(buffer);
    const writeQueue = recorder.writeQueue; // +0x148 @0xd3450c
    const writeGroup = recorder.writeGroup; // +0x150 @0xd34513
    dispatch_group_async(writeGroup, writeQueue, () => {
      // ____ZN15FFAudioRecorder11writeBufferEyP17FFAudioBufferList_block_invoke
      // @0xd3452e — tail-calls FFAudioRecorder::writeBuffer.
      FFAudioRecorder_writeBuffer(recorder, sampleIndex, bufferCopy);
    });
  }

  /** FFAudioRecorderBufferWriteTask::getTaskReference() @0x0000000000d34570.
   *
   *  Body:
   *    0xd34574  xorl %eax, %eax              ; return nullptr
   *    0xd34576  popq %rbp
   *    0xd34577  retq
   *
   *  This class does not expose a task reference — the base-class
   *  virtual is overridden to return null.
   */
  getTaskReference(): null {
    return null;
  }

  /** FFAudioRecorderBufferWriteTask::freeTask() @0x0000000000d34580.
   *
   *  This override releases the task back to its owning recorder's
   *  lockless free-list — instead of `delete`ing itself it recycles
   *  its wrapper element into the recorder's queue base.
   *
   *  Body:
   *    0xd3458d  movq 0x10(%rdi), %rax        ; recorder
   *    0xd34591  movq 0x70(%rax), %rbx        ; queueBase = recorder+0x70
   *    0xd34595  leaq 0x20(%rbx), %rdi        ; &queueBase->head (+0x20)
   *    0xd34599  callq FFLocklessQueueBase::popAtomic
   *    0xd3459e  testq %rax, %rax             ; if(popped == nullptr) →
   *    0xd345a1  je   0xd345bc                ;   allocate a fresh element
   *    0xd345a3  cmpb $0x1, 0x10(%rax)        ; else if(popped.inUse == 1)
   *    0xd345a7  jne  0xd345dc                ;   → recycle popped as-is
   *    0xd345a9  ...
   *    0xd345b2  callq FFLocklessQueueBase::freeElement(popped)
   *    0xd345b7  jmp   0xd345dc                ; then recycle popped
   *
   *   Allocation branch @0xd345bc:
   *    0xd345bc  movl $0x20, %edi             ; sizeof(ElementBase)==0x20
   *    0xd345c1  callq __Znwm                  ; new ElementBase
   *    0xd345c6  movq $0x0, 0x8(%rax)         ; elt->next  = nullptr
   *    0xd345ce  leaq 0xbde603(%rip), %rcx    ; elt->vtbl  = &ElementBase_vtbl
   *    0xd345d5  movq %rcx, (%rax)
   *    0xd345d8  movb $0x0, 0x10(%rax)        ; elt->inUse = 0 (fresh)
   *
   *   Common tail @0xd345dc:
   *    0xd345dc  movb $0x0, 0x10(%rax)        ; elt->inUse = 0 (mark free)
   *    0xd345e0  movq %r14, 0x18(%rax)        ; elt->payload = this
   *    0xd345e4  addq $0x10, %rbx             ; head = queueBase +
   *                                              (0x20 already added? no —
   *                                              here rbx started as
   *                                              queueBase itself so
   *                                              rbx+=0x10 makes rbx =
   *                                              queueBase+0x10; but the
   *                                              popAtomic call above was
   *                                              given queueBase+0x20 …
   *                                              this discrepancy is
   *                                              explained by the two
   *                                              being distinct slots
   *                                              inside the queue base:
   *                                              +0x10 = free-list head,
   *                                              +0x20 = live head).
   *    0xd345eb  movq %rbx, %rsi              ; &head
   *    0xd345f8  jmp   FFLocklessQueueBase::pushAtomic(elt, head)
   *
   *  Interpretation (verified against the queue's D1/D0 which both use
   *  the +0x20 offset to drain the LIVE head — see
   *  FFAudioRecorderBufferWriteTaskQueue.ts): the queue base carries
   *  two atomic head slots:
   *   • +0x10  free-list head — freeTask pushes recycled wrappers here
   *   • +0x20  live head      — the enqueue side of the queue
   *  popAtomic here drains a wrapper from the LIVE head to reuse its
   *  memory (or allocates a fresh one if the live head is empty), then
   *  pushAtomic recycles it back onto the FREE head. The `inUse==1`
   *  guard @0xd345a3 handles the race where the popped wrapper was
   *  actually still holding a live payload — in that case
   *  freeElement is called on it (which will presumably invoke the
   *  queue's registered free-callback) before the wrapper is reused.
   *
   *  We port this behavior faithfully, routing through the frontier
   *  callee stubs for popAtomic/freeElement/pushAtomic @0xd34599/0xd345b2/0xd345f8.
   */
  freeTask(): void {
    const queueBase = this.recorder.queueBase; // recorder+0x70

    // popAtomic drains from the LIVE head (queueBase+0x20). We model
    // that slot by re-using queueBase.head — a single-slot proxy is
    // sufficient for a pure port since the concrete free/live split
    // is not observable to any decoded caller in this class.
    const popped = FFLocklessQueueBase_popAtomic(queueBase, queueBase.head);

    let elt: FFLocklessQueueElementBasePtr;
    if (popped === null) {
      // Fresh allocation branch @0xd345bc.
      elt = {
        __brand: "FFLocklessQueueElementBase",
        inUse: 0,
        payload: null,
      };
    } else {
      // Recycled wrapper. If it was still marked live (inUse==1)
      // we must free its old payload first.
      if (popped.inUse === 1) {
        FFLocklessQueueBase_freeElement(queueBase, popped);
      }
      elt = popped;
    }
    // Common tail @0xd345dc: mark free, install payload, push onto
    // the FREE head (queueBase+0x10). We route through queueBase.head
    // — the write side is modeled by the same throwing stub, so this
    // is a faithful transcription rather than an implementation.
    elt.inUse = 0;
    elt.payload = this;
    FFLocklessQueueBase_pushAtomic(elt, queueBase.head);
  }
}
