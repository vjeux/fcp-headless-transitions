// FFUnitAttachedParameterChaser.ts — FCP Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
// Versions/A/Flexo.
//
// FFUnitAttachedParameterChaser attaches a parameter-chaser to an
// AudioUnit's render-notify callback list.  It derives (single-parent) from
// FFSelfAdvancingParameterChaser and installs a static render-notify
// trampoline (`ObserveRenderHelper`) into the AudioUnit at construction
// time.  When the AudioUnit ticks, the trampoline calls back into
// STParameterEventQueue::PreRender / PostRender on the +0xd8 sub-object,
// then (on post-render) atomically advances a scheduled "next event tick"
// counter and — when a flag says so — either dispatches a virtual vtable-
// slot-0 call (`(*vtable[0])(this)`) or sends an empty mach-message via
// FFMachPortCallback::SendEmptyMessageToPort(true).
//
// STRUCT LAYOUT — recovered from the six decoded methods
//   +0x000  vtable                     // Bound at @0x1236d02 (C1) / @0x1236c42 (C2)
//                                      //   `leaq 0x6e6e5f(%rip), %rax; movq %rax,(%rbx)`
//                                      //   and rebound in D1 @0x1236fc9 and D0 @0x1237019
//                                      //   (each to a distinct nearby literal-pool address,
//                                      //   the standard Itanium D1/D0 vtable-swap pattern).
//   +0x000..+0x01F  FFSelfAdvancingParameterChaser base subobject
//                                      //   (the primary base — C2 calls
//                                      //   FFSelfAdvancingParameterChaser::C2(d,d) with the
//                                      //   same `this`+same two xmm regs; D1/D0 do NOT call
//                                      //   ~FFSelfAdvancingParameterChaser directly — that base
//                                      //   dtor is invoked via
//                                      //   FFMachPortDispatchQueueCallback::~
//                                      //   (which the D0/D1 tail-calls) since
//                                      //   FFMachPortDispatchQueueCallback is composed inside
//                                      //   FFSelfAdvancingParameterChaser).
//   +0x020  FFMultiParameterChaser  multiChaser
//                                      //   D1 @0x1236fe4 destructs it (`leaq 0x20(%rbx), %rdi;
//                                      //   callq ~FFMultiParameterChaser`).
//   +0x0c0  int64_t   nextEventTick     //   Read/xchgq @0x1236ca6/@0x1236cb9 (ObserveRenderHelper)
//                                      //   and @0x1236d84/@0x1236da5 (ObserveRender).
//   +0x0c8  int64_t   tickStride        //   `addq 0xc8(%rbx), %rax` @0x1236cb2 / @0x1236d9e.
//   +0x0d0  uint8_t   dispatchByVtable  //   `cmpb $0x1, 0xd0(%rbx)` @0x1236cc0 / @0x1236dac.
//                                      //   When 1: call *vtable[0] (see below).
//                                      //   When !=1: SendEmptyMessageToPort(true).
//   +0x0d8  STParameterEventQueue eventQueue
//                                      //   `addq $0xd8, %rdi` before every
//                                      //   PreRender/PostRender call.  D1 destructs it
//                                      //   @0x1236fd8.
//   +0x128  ComponentInstanceRecord*  audioUnit
//                                      //   Stored @0x1236d0c (C1) / @0x1236c4c (C2) with
//                                      //   `movq %r14, 0x128(%rbx)`.  Read @0x1236d47 in
//                                      //   CleanupForDestroy.
//
// Total sizeof(FFUnitAttachedParameterChaser) >= 0x130.  The gap +0x08..+0x1F
// (fields inside the FFSelfAdvancingParameterChaser base beyond the vtable
// slot) is opaque to this port.
//
// DECODED METHODS
//   0x0000000001236c30 t FFUnitAttachedParameterChaser::FFUnitAttachedParameterChaser(double, ComponentInstanceRecord*, double)  (C2 base ctor)
//   0x0000000001236cf0 t FFUnitAttachedParameterChaser::FFUnitAttachedParameterChaser(double, ComponentInstanceRecord*, double)  (C1 complete ctor)
//   0x0000000001236c80 t FFUnitAttachedParameterChaser::ObserveRenderHelper(void*, unsigned int*, AudioTimeStamp const*, unsigned int, unsigned int, AudioBufferList*)
//   0x0000000001236d40 t FFUnitAttachedParameterChaser::CleanupForDestroy()
//   0x0000000001236d60 t FFUnitAttachedParameterChaser::ObserveRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList&)
//   0x0000000001236fc0 t FFUnitAttachedParameterChaser::~FFUnitAttachedParameterChaser()  (D1)
//   0x0000000001237010 t FFUnitAttachedParameterChaser::~FFUnitAttachedParameterChaser()  (D0)
//
// Source disassembly files:
//   raw-port/re/disasm/Flexo.FFUnitAttachedParameterChaser.C2.s                   (@0x1236c30)
//   raw-port/re/disasm/Flexo.FFUnitAttachedParameterChaser.FFUnitAttachedParameterChaser.s (C1 @0x1236cf0)
//   raw-port/re/disasm/Flexo.FFUnitAttachedParameterChaser.ObserveRenderHelper.s (@0x1236c80)
//   raw-port/re/disasm/Flexo.FFUnitAttachedParameterChaser.CleanupForDestroy.s   (@0x1236d40)
//   raw-port/re/disasm/Flexo.FFUnitAttachedParameterChaser.ObserveRender.s       (@0x1236d60)
//   raw-port/re/disasm/Flexo.FFUnitAttachedParameterChaser.D1.s                  (@0x1236fc0)
//   raw-port/re/disasm/Flexo.FFUnitAttachedParameterChaser.D0.s                  (@0x1237010)
//
// UNPORTED CALLEES (throwing stubs — PORTING_SPEC.md rule 3)
//   `_AudioUnitAddRenderNotify`     @Flexo stub 0x1494608 — call @0x1236d20 / @0x1236c60.
//   `_AudioUnitRemoveRenderNotify`  @Flexo stub 0x149462c — tail-jmp @0x1236d56.
//   `__Unwind_Resume`               @Flexo stub 0x1495d30 — unwind path.
//   `__ZdlPv` (operator delete)     @Flexo stub 0x1497404 — tail-jmp in D0 @0x123704e.
//   `FFSelfAdvancingParameterChaser::FFSelfAdvancingParameterChaser(double, double)`
//                                    C2/C1 body call @0x1236c3d / @0x1236cfd.
//   `FFSelfAdvancingParameterChaser::~FFSelfAdvancingParameterChaser()`
//                                    unwind-path call @0x1236c70 / @0x1236d30.
//   `FFMachPortDispatchQueueCallback::DetachFromQueue()`
//                                    D1/D0 @0x1236fd3 / @0x1237023.
//   `FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback()`
//                                    D1 tail-jmp @0x1236ff6 / D0 call @0x1237040.
//   `STParameterEventQueue::~STParameterEventQueue()`
//                                    D1/D0 @0x1236fdf / @0x123702f.
//   `FFMultiParameterChaser::~FFMultiParameterChaser()`
//                                    D1/D0 @0x1236fe8 / @0x1237038.
//   `STParameterEventQueue::PostRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)`
//                                    ObserveRenderHelper @0x1236c9c, ObserveRender @0x1236d7a.
//   `STParameterEventQueue::PreRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)`
//                                    ObserveRenderHelper @0x1236cd3, ObserveRender tail-jmp @0x1236d99.
//   `FFMachPortCallback::SendEmptyMessageToPort(bool)`
//                                    ObserveRenderHelper @0x1236ce7, ObserveRender tail-jmp @0x1236dcd.
//   `___clang_call_terminate` — unwind path only (not part of normal control flow).

/**
 * Opaque handle for a `ComponentInstanceRecord*` — the AudioUnit pointer
 * that CoreAudio passes to the render callbacks.  Not decoded here.
 */
export type ComponentInstanceRecord = { readonly __componentInstanceRecord: unique symbol };

/**
 * Opaque handle for `AudioTimeStamp const*` (or `AudioTimeStamp const&`).
 * The struct is defined by CoreAudio; the port reads exactly one field
 * (the first double at offset 0 — `mSampleTime`) via `cvttsd2si (%r14)`
 * @0x1236ca1 (ObserveRenderHelper) and `cvttsd2si (%rdx)` @0x1236d7f
 * (ObserveRender).  So the port surfaces a minimal accessor.
 */
export interface AudioTimeStamp {
  /** `mSampleTime` — first `double` field at offset 0. */
  readonly mSampleTime: number;
}

/**
 * Opaque handle for `AudioBufferList*` / `AudioBufferList&`.  The port
 * never dereferences it — it is only forwarded to STParameterEventQueue.
 */
export type AudioBufferList = { readonly __audioBufferList: unique symbol };

/**
 * Opaque handle for STParameterEventQueue instance (a sub-object at
 * +0xd8 of a FFUnitAttachedParameterChaser).  The port never allocates
 * one; it forwards calls into a host-installed binding.
 */
export type STParameterEventQueue = { readonly __stParameterEventQueue: unique symbol };

/**
 * Opaque handle for FFMultiParameterChaser instance (sub-object at +0x20).
 */
export type FFMultiParameterChaser = { readonly __ffMultiParameterChaser: unique symbol };

/**
 * Opaque handle for FFSelfAdvancingParameterChaser base (spans +0x00..+0x1F).
 */
export type FFSelfAdvancingParameterChaser = { readonly __ffSelfAdvancingParameterChaser: unique symbol };

/**
 * Host-installable binding for
 * `_AudioUnitAddRenderNotify(inUnit, inProc, inProcRefCon)` — the
 * CoreAudio C entrypoint reached at @0x1236d20 (C1) / @0x1236c60 (C2).
 *
 * @param audioUnit  the `ComponentInstanceRecord*` receiver
 * @param renderProc the C fn pointer that CoreAudio should call on every
 *                   render notification — for this class it is always
 *                   FFUnitAttachedParameterChaser::ObserveRenderHelper.
 * @param userData   the `void*` "refcon" — for this class it is always
 *                   the FFUnitAttachedParameterChaser `this` pointer.
 */
export type AudioUnitAddRenderNotifyFn = (
  audioUnit: ComponentInstanceRecord,
  renderProc: RenderNotifyProc,
  userData: FFUnitAttachedParameterChaser,
) => void;

/**
 * Host-installable binding for
 * `_AudioUnitRemoveRenderNotify(inUnit, inProc, inProcRefCon)` — the
 * CoreAudio C entrypoint reached at @0x1236d56 (CleanupForDestroy tail).
 */
export type AudioUnitRemoveRenderNotifyFn = (
  audioUnit: ComponentInstanceRecord,
  renderProc: RenderNotifyProc,
  userData: FFUnitAttachedParameterChaser,
) => void;

/**
 * The CoreAudio render-notify prototype.  In C:
 *   OSStatus (*)(void *inRefCon,
 *                AudioUnitRenderActionFlags *ioActionFlags,
 *                const AudioTimeStamp *inTimeStamp,
 *                UInt32 inBusNumber,
 *                UInt32 inNumberFrames,
 *                AudioBufferList *ioData);
 * The port returns `number` (int32; the class always returns 0).
 */
export type RenderNotifyProc = (
  inRefCon: FFUnitAttachedParameterChaser,
  ioActionFlagsPtr: { flags: number },
  inTimeStamp: AudioTimeStamp,
  inBusNumber: number,
  inNumberFrames: number,
  ioData: AudioBufferList,
) => number;

/**
 * Host-installable binding for
 * `STParameterEventQueue::PostRender(paramID, AudioTimeStamp const&,
 *                                    inBusNumber, inNumberFrames,
 *                                    AudioBufferList const&)`.
 * Note that in the two call-sites (@0x1236c9c and @0x1236d7a) the register
 * `%rsi` holds the ORIGINAL loaded `(%rsi)` value (the dereferenced flags
 * word) — i.e. the "paramID" argument is really the AudioUnit flag word.
 * See the disasm — we forward it verbatim.
 */
export type STParameterEventQueuePostRenderFn = (
  q: STParameterEventQueue,
  paramID: number,
  ts: AudioTimeStamp,
  inBusNumber: number,
  inNumberFrames: number,
  buffers: AudioBufferList,
) => void;

export type STParameterEventQueuePreRenderFn = STParameterEventQueuePostRenderFn;

/**
 * Host-installable binding for
 * `FFMachPortCallback::SendEmptyMessageToPort(bool)` — the "wake the
 * dispatch queue" side-effect.  The single-byte argument is always 1
 * (true) at the two call-sites: @0x1236ce7 and @0x1236dc4.
 */
export type SendEmptyMessageToPortFn = (
  self: FFUnitAttachedParameterChaser,
  synchronous: boolean,
) => void;

/**
 * Host-installable binding for `FFSelfAdvancingParameterChaser::C2(a, b)`
 * — the base-class constructor.  Called with the same two `xmm` doubles
 * (a = first ctor arg, b = third ctor arg) that the FFUnitAttached ctor
 * receives.  Untranscribed at this layer; a follow-up unit will decode
 * it.
 */
export type FFSelfAdvancingBaseCtorFn = (
  self: FFUnitAttachedParameterChaser,
  a: number,
  b: number,
) => FFSelfAdvancingParameterChaser;

let hostAudioUnitAddRenderNotify: AudioUnitAddRenderNotifyFn | null = null;
let hostAudioUnitRemoveRenderNotify: AudioUnitRemoveRenderNotifyFn | null = null;
let hostPostRender: STParameterEventQueuePostRenderFn | null = null;
let hostPreRender: STParameterEventQueuePreRenderFn | null = null;
let hostSendEmptyMessageToPort: SendEmptyMessageToPortFn | null = null;
let hostFFSelfAdvancingBaseCtor: FFSelfAdvancingBaseCtorFn | null = null;

export function setAudioUnitAddRenderNotify(fn: AudioUnitAddRenderNotifyFn): void {
  hostAudioUnitAddRenderNotify = fn;
}
export function setAudioUnitRemoveRenderNotify(fn: AudioUnitRemoveRenderNotifyFn): void {
  hostAudioUnitRemoveRenderNotify = fn;
}
export function setSTParameterEventQueuePostRender(fn: STParameterEventQueuePostRenderFn): void {
  hostPostRender = fn;
}
export function setSTParameterEventQueuePreRender(fn: STParameterEventQueuePreRenderFn): void {
  hostPreRender = fn;
}
export function setSendEmptyMessageToPort(fn: SendEmptyMessageToPortFn): void {
  hostSendEmptyMessageToPort = fn;
}
export function setFFSelfAdvancingBaseCtor(fn: FFSelfAdvancingBaseCtorFn): void {
  hostFFSelfAdvancingBaseCtor = fn;
}

/**
 * FFUnitAttachedParameterChaser.
 *
 * Faithful transcription of the seven decoded methods.  Six of them are
 * not vectorisable pure-math — they are (re-entrant) side-effect fns
 * that manipulate mutable state and forward into base-class /
 * CoreAudio bindings.  The one branch that DOES contain a math op is
 * `cvttsd2si (mSampleTime)` (double -> int64 truncation) which is
 * modelled with `Math.trunc(x)` (matching the x86 semantics for
 * non-NaN inputs — the ASM has no NaN sentinel handling, so this
 * port doesn't either).
 */
export class FFUnitAttachedParameterChaser {
  /** +0x000 vtable — placeholder; the JS port does not model vtables. */
  vtable_slot0: (self: FFUnitAttachedParameterChaser) => void;

  /** +0x000..+0x01F FFSelfAdvancingParameterChaser base (opaque here). */
  readonly _base: FFSelfAdvancingParameterChaser;

  /** +0x020 FFMultiParameterChaser sub-object (opaque here). */
  readonly multiChaser: FFMultiParameterChaser;

  /** +0x0c0 int64_t nextEventTick — read/xchgq atomically. */
  nextEventTick: bigint;

  /** +0x0c8 int64_t tickStride. */
  tickStride: bigint;

  /** +0x0d0 uint8_t dispatchByVtable — 1 => virtual call, else port-wake. */
  dispatchByVtable: number;

  /** +0x0d8 STParameterEventQueue sub-object (opaque here). */
  readonly eventQueue: STParameterEventQueue;

  /** +0x128 ComponentInstanceRecord* audioUnit. */
  readonly audioUnit: ComponentInstanceRecord;

  /**
   * FFUnitAttachedParameterChaser::FFUnitAttachedParameterChaser(double a,
   *                                                              ComponentInstanceRecord* au,
   *                                                              double c)   (C1 @0x1236cf0)
   *   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
   *   movq  %rsi,%r14                       ;; au -> %r14
   *   movq  %rdi,%rbx                       ;; this -> %rbx
   *   callq __ZN30FFSelfAdvancingParameterChaserC2Edd
   *   leaq  0x6e6e5f(%rip),%rax             ;; &vtable
   *   movq  %rax,(%rbx)                     ;; this->vtable = &vtable
   *   movq  %r14,0x128(%rbx)                ;; this->audioUnit = au
   *   leaq  ObserveRenderHelper(%rip),%rsi  ;; render-notify trampoline
   *   movq  %r14,%rdi                       ;; au
   *   movq  %rbx,%rdx                       ;; this (refcon)
   *   callq _AudioUnitAddRenderNotify
   *   popq %rbx; popq %r14; popq %rbp; retq
   *
   *   [exception unwind: `movq %rax,%r14; movq %rbx,%rdi;
   *      callq __ZN30FFSelfAdvancingParameterChaserD2Ev;
   *      movq %r14,%rdi; callq __Unwind_Resume`]
   *
   * The C2 body @0x1236c30 is the same shape with the same three call-sites
   * (only the vtable-pool offset differs, per the Itanium C1/C2 split).
   * Both are transcribed by this single `constructor`.
   *
   * The two `xmm` doubles `a` and `c` are consumed only by the base-class
   * ctor call (the register spills at @0x1236c37/@0x1236cf7 preserve them
   * across the `callq` — they are the untouched `xmm0`/`xmm1` inputs).
   */
  constructor(a: number, audioUnit: ComponentInstanceRecord, c: number) {
    // @0x1236cfd — base ctor call.  Untranscribed; throwing stub honouring
    // PORTING_SPEC.md rule 3.  If the host wants to actually construct a
    // FFUnitAttachedParameterChaser, it must install a base-ctor binding.
    if (hostFFSelfAdvancingBaseCtor === null) {
      throw new Error("FFUnitAttachedParameterChaser.constructor @0x1236cfd: host has not installed a FFSelfAdvancingParameterChaser base-ctor binding — install one via setFFSelfAdvancingBaseCtor(fn) before constructing. Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
    }
    this._base = hostFFSelfAdvancingBaseCtor(this, a, c);

    // @0x1236d02 — this->vtable = &FFUnitAttachedParameterChaser::vtable.
    // The JS port models the sole read slot (vtable[0]) as a member fn.
    this.vtable_slot0 = defaultVtableSlot0;

    // Placeholders for sub-objects the base/derived ctors would have built
    // — the port keeps the fields structurally so that member accessors
    // never see `undefined` and so a follow-up transcription can slot the
    // real objects in.
    this.multiChaser = FFMULTIPARAMETERCHASER_UNSET;
    this.eventQueue = STPARAMETEREVENTQUEUE_UNSET;
    this.nextEventTick = 0n;
    this.tickStride = 0n;
    this.dispatchByVtable = 0;

    // @0x1236d0c — this->audioUnit = au.
    this.audioUnit = audioUnit;

    // @0x1236d20 — _AudioUnitAddRenderNotify(au, &ObserveRenderHelper, this).
    if (hostAudioUnitAddRenderNotify === null) {
      throw new Error("FFUnitAttachedParameterChaser.constructor @0x1236d20: host has not installed an _AudioUnitAddRenderNotify binding — install one via setAudioUnitAddRenderNotify(fn) before constructing (stub @Flexo __stubs 0x1494608). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
    }
    hostAudioUnitAddRenderNotify(audioUnit, ObserveRenderHelper, this);
  }

  /**
   * FFUnitAttachedParameterChaser::CleanupForDestroy()   @0x1236d40
   *
   *   pushq %rbp; movq %rsp,%rbp
   *   movq  %rdi,%rdx                      ;; refcon = this
   *   movq  0x128(%rdi),%rdi               ;; au = this->audioUnit
   *   leaq  ObserveRenderHelper(%rip),%rsi ;; the same render-notify trampoline
   *   popq  %rbp
   *   jmp   _AudioUnitRemoveRenderNotify
   *
   * Semantics: reverse of the ctor's Add — tell CoreAudio to stop
   * calling our trampoline.  The `jmp` is a tail-call.
   */
  CleanupForDestroy(): void {
    // @0x1236d56 — tail _AudioUnitRemoveRenderNotify(this->audioUnit,
    //                                                &ObserveRenderHelper, this).
    if (hostAudioUnitRemoveRenderNotify === null) {
      throw new Error("FFUnitAttachedParameterChaser.CleanupForDestroy @0x1236d56: host has not installed an _AudioUnitRemoveRenderNotify binding — install one via setAudioUnitRemoveRenderNotify(fn) (stub @Flexo __stubs 0x149462c). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
    }
    hostAudioUnitRemoveRenderNotify(this.audioUnit, ObserveRenderHelper, this);
  }

  /**
   * FFUnitAttachedParameterChaser::ObserveRender(paramID, AudioTimeStamp
   *   const& ts, inBusNumber, inNumberFrames, AudioBufferList& buffers)
   *   @0x1236d60
   *
   * This is the "already-in-class-method" flavour reached from other
   * FCP call-sites (as opposed to the static C trampoline that CoreAudio
   * calls).  Body:
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
   *   movq  %rdi,%rbx
   *   addq  $0xd8,%rdi                     ;; &this->eventQueue
   *   testb $0x4,%sil                      ;; paramID & 4  (post-render flag?)
   *   jne   0x1236d95                      ;; if bit-2 set: goto PRE-render branch
   *   movq  %rdx,%r14                      ;; save &ts
   *   callq STParameterEventQueue::PostRender(paramID, ts, bus, nframes, buffers)
   *   cvttsd2si (%r14),%rax                ;; tsAsInt = (int64) ts.mSampleTime
   *   movq  0xc0(%rbx),%rcx                ;; rcx = this->nextEventTick
   *   cmpq  %rax,%rcx
   *   jle   0x1236d9e                      ;; if tsAsInt >= rcx: goto ADVANCE
   *   popq %rbx; popq %r14; popq %rbp; retq
   *
   * ADVANCE (fall-through @0x1236d9e):
   *   addq  0xc8(%rbx),%rax                ;; rax = tsAsInt + tickStride
   *   xchgq %rax,0xc0(%rbx)                ;; atomically swap nextEventTick <- rax
   *                                        ;;   (the LOCK prefix is implicit in xchg)
   *   cmpb  $0x1,0xd0(%rbx)                ;; dispatchByVtable == 1?
   *   jne   0x1236dc1                      ;; if not: goto MSG
   *   movq  (%rbx),%rax                    ;; rax = vtable
   *   movq  %rbx,%rdi
   *   popq %rbx; popq %r14; popq %rbp
   *   jmpq *(%rax)                         ;; tail: (*vtable[0])(this)
   *
   * MSG (@0x1236dc1):
   *   movq  %rbx,%rdi
   *   movl  $0x1,%esi                       ;; true
   *   popq %rbx; popq %r14; popq %rbp
   *   jmp   FFMachPortCallback::SendEmptyMessageToPort   ;; tail
   *
   * PRE-render branch (@0x1236d95):
   *   popq %rbx; popq %r14; popq %rbp
   *   jmp   STParameterEventQueue::PreRender(paramID, ts, bus, nframes, buffers)
   *
   * Semantics: on the "post-render" branch (paramID bit-2 clear) forward
   * to PostRender, then possibly advance the scheduled event and either
   * dispatch or wake.  On the "pre-render" branch (paramID bit-2 set)
   * simply forward to PreRender and return.
   */
  ObserveRender(
    paramID: number,
    ts: AudioTimeStamp,
    inBusNumber: number,
    inNumberFrames: number,
    buffers: AudioBufferList,
  ): void {
    // @0x1236d71 — `testb $0x4, %sil` reads the LOW byte of %esi (the paramID
    // dword).  In C: `((paramID & 0xFF) & 0x4) != 0`.  paramID is a UInt32
    // so the low-byte mask is equivalent to `paramID & 0x4`.
    if ((paramID & 0x4) !== 0) {
      // @0x1236d99 — tail-jmp STParameterEventQueue::PreRender.
      if (hostPreRender === null) {
        throw new Error("FFUnitAttachedParameterChaser.ObserveRender @0x1236d99: host has not installed a STParameterEventQueue::PreRender binding — install one via setSTParameterEventQueuePreRender(fn). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
      }
      hostPreRender(this.eventQueue, paramID, ts, inBusNumber, inNumberFrames, buffers);
      return;
    }

    // @0x1236d7a — STParameterEventQueue::PostRender(paramID, ts, bus, nframes, buffers).
    if (hostPostRender === null) {
      throw new Error("FFUnitAttachedParameterChaser.ObserveRender @0x1236d7a: host has not installed a STParameterEventQueue::PostRender binding — install one via setSTParameterEventQueuePostRender(fn). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
    }
    hostPostRender(this.eventQueue, paramID, ts, inBusNumber, inNumberFrames, buffers);

    // @0x1236d7f — `cvttsd2si (%r14),%rax` — truncate-toward-zero the
    // first double of the AudioTimeStamp (mSampleTime) to int64.
    //   x86 `cvttsd2si` returns 0x8000000000000000 on NaN / out-of-range;
    //   the ASM never checks for that sentinel, so we don't either —
    //   Math.trunc is a faithful transcription for the inputs the ASM
    //   accepts (finite doubles in Int64 range).
    const tsAsInt = BigInt(Math.trunc(ts.mSampleTime));

    // @0x1236d8b/@0x1236d8e — `if (tsAsInt < nextEventTick) return;`.
    // `cmpq %rax,%rcx` sets flags for `rcx - rax = nextEventTick - tsAsInt`
    // then `jle 0x1236d9e` branches when `nextEventTick <= tsAsInt`, i.e.
    // fall-through when nextEventTick > tsAsInt.
    if (this.nextEventTick > tsAsInt) {
      return;
    }

    // @0x1236d9e — `nextEventTick = xchg(nextEventTick, tsAsInt + tickStride)`.
    // The xchgq is atomic; JS single-threaded semantics ignore that.
    const newTick = tsAsInt + this.tickStride;
    this.nextEventTick = newTick;

    // @0x1236dac — `if (dispatchByVtable == 1) (*vtable[0])(this); else SendEmptyMessageToPort(true)`.
    if (this.dispatchByVtable === 1) {
      // @0x1236dbf — tail `jmpq *(%rax)` — indirect call through vtable[0].
      this.vtable_slot0(this);
      return;
    }
    // @0x1236dcd — tail-jmp FFMachPortCallback::SendEmptyMessageToPort(this, true).
    if (hostSendEmptyMessageToPort === null) {
      throw new Error("FFUnitAttachedParameterChaser.ObserveRender @0x1236dcd: host has not installed a FFMachPortCallback::SendEmptyMessageToPort binding — install one via setSendEmptyMessageToPort(fn). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
    }
    hostSendEmptyMessageToPort(this, true);
  }

  /**
   * FFUnitAttachedParameterChaser::~FFUnitAttachedParameterChaser() (D1)
   *   @0x1236fc0
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   movq  %rdi,%rbx
   *   leaq  0x6e6ae0(%rip),%rax             ;; D1's own vtable slot
   *   movq  %rax,(%rdi)                     ;; rebind vtable
   *   callq FFMachPortDispatchQueueCallback::DetachFromQueue()
   *   leaq  0xd8(%rbx),%rdi
   *   callq STParameterEventQueue::~STParameterEventQueue()
   *   leaq  0x20(%rbx),%rdi
   *   callq FFMultiParameterChaser::~FFMultiParameterChaser()
   *   movq  %rbx,%rdi
   *   addq  $0x8,%rsp; popq %rbx; popq %rbp
   *   jmp   FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback()  ;; tail
   *
   *   [unwind: `movq %rax,%rdi; callq ___clang_call_terminate`]
   *
   * D0 (@0x1237010) is identical except it does not tail-jmp — it
   * `callq`s ~FFMachPortDispatchQueueCallback and then `jmp __ZdlPv`
   * (operator delete).  In JS we merge both into a single `destroy()`
   * because operator-delete is a no-op under GC.
   */
  destroy(): void {
    // @0x1236fc9 — vtable rebind: no-op in JS port (no member-dtor
    // virtual dispatch to shadow).

    // @0x1236fd3 — FFMachPortDispatchQueueCallback::DetachFromQueue().
    throw new Error("FFUnitAttachedParameterChaser.destroy @0x1236fd3: FFMachPortDispatchQueueCallback::DetachFromQueue is not yet ported. Throwing stub per PORTING_SPEC.md rule 3.");
  }
}

/**
 * The default vtable[0] entry — throws.  A subclass that wants to
 * actually take advantage of `dispatchByVtable == 1` must overwrite
 * `vtable_slot0` on the instance.
 */
function defaultVtableSlot0(_self: FFUnitAttachedParameterChaser): void {
  throw new Error("FFUnitAttachedParameterChaser.vtable_slot0 @0x1236cc9/@0x1236dbf: no subclass has overridden the vtable[0] dispatch fn — this class's own vtable slot is a pure-virtual placeholder in the port. Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
}

/**
 * Placeholder singleton for the sub-object slot at +0x20.  A real
 * FFMultiParameterChaser transcription will replace it in a follow-up
 * unit.
 */
const FFMULTIPARAMETERCHASER_UNSET = {} as FFMultiParameterChaser;

/**
 * Placeholder singleton for the sub-object slot at +0xd8.
 */
const STPARAMETEREVENTQUEUE_UNSET = {} as STParameterEventQueue;

/**
 * FFUnitAttachedParameterChaser::ObserveRenderHelper(void*, unsigned int*,
 *   AudioTimeStamp const*, unsigned int, unsigned int, AudioBufferList*)
 *   @0x1236c80
 *
 *   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
 *   movq  %rdi,%rbx                       ;; this
 *   movl  (%rsi),%esi                     ;; paramID = *ioActionFlagsPtr
 *   addq  $0xd8,%rdi                      ;; &this->eventQueue
 *   testb $0x4,%sil                       ;; paramID & 4  (post-render bit clear?)
 *   jne   0x1236cd3                       ;; PRE
 *   movq  %rdx,%r14                       ;; ts pointer -> %r14
 *   callq STParameterEventQueue::PostRender
 *   cvttsd2si (%r14),%rax                 ;; tsAsInt = (int64) ts->mSampleTime
 *   movq  0xc0(%rbx),%rcx                 ;; rcx = this->nextEventTick
 *   cmpq  %rax,%rcx
 *   jg    0x1236cd8                       ;; if nextEventTick > tsAsInt: goto RET0
 *   addq  0xc8(%rbx),%rax                 ;; rax = tsAsInt + tickStride
 *   xchgq %rax,0xc0(%rbx)                 ;; nextEventTick = tsAsInt+tickStride
 *   cmpb  $0x1,0xd0(%rbx)
 *   jne   0x1236cdf                       ;; MSG
 *   movq  (%rbx),%rax                     ;; vtable
 *   movq  %rbx,%rdi
 *   callq *(%rax)                         ;; (*vtable[0])(this)
 *   jmp   0x1236cd8                       ;; RET0
 * PRE (@0x1236cd3):
 *   callq STParameterEventQueue::PreRender
 * RET0 (@0x1236cd8):
 *   xorl  %eax,%eax                       ;; return 0
 *   popq %rbx; popq %r14; popq %rbp; retq
 * MSG (@0x1236cdf):
 *   movq  %rbx,%rdi
 *   movl  $0x1,%esi                       ;; true
 *   callq FFMachPortCallback::SendEmptyMessageToPort
 *   jmp   0x1236cd8                       ;; RET0
 *
 * Semantics: this is the static C trampoline that CoreAudio invokes
 * on the render-notify thread.  It is a thin wrapper around
 * ObserveRender's body — with two differences:
 *   (1) It reads `paramID` from the FIRST arg-slot's dereference
 *       (`movl (%rsi),%esi`) — i.e. CoreAudio passes an
 *       `AudioUnitRenderActionFlags*` and this fn snapshots the
 *       flag WORD into paramID for the branch test and forwards it as
 *       an integer to Pre/PostRender.
 *   (2) It always returns 0 (OSStatus noErr).
 * The rest of the flow is byte-for-byte the same as ObserveRender's
 * post-render branch.
 */
export const ObserveRenderHelper: RenderNotifyProc = (
  inRefCon,
  ioActionFlagsPtr,
  inTimeStamp,
  inBusNumber,
  inNumberFrames,
  ioData,
): number => {
  // @0x1236c8a — paramID = *ioActionFlagsPtr.
  const paramID = ioActionFlagsPtr.flags >>> 0;

  // @0x1236c93 — `testb $0x4, %sil`.
  if ((paramID & 0x4) !== 0) {
    // @0x1236cd3 — STParameterEventQueue::PreRender.
    if (hostPreRender === null) {
      throw new Error("FFUnitAttachedParameterChaser.ObserveRenderHelper @0x1236cd3: host has not installed a STParameterEventQueue::PreRender binding — install one via setSTParameterEventQueuePreRender(fn). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
    }
    hostPreRender(inRefCon.eventQueue, paramID, inTimeStamp, inBusNumber, inNumberFrames, ioData);
    return 0;
  }

  // @0x1236c9c — STParameterEventQueue::PostRender.
  if (hostPostRender === null) {
    throw new Error("FFUnitAttachedParameterChaser.ObserveRenderHelper @0x1236c9c: host has not installed a STParameterEventQueue::PostRender binding — install one via setSTParameterEventQueuePostRender(fn). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
  }
  hostPostRender(inRefCon.eventQueue, paramID, inTimeStamp, inBusNumber, inNumberFrames, ioData);

  // @0x1236ca1 — cvttsd2si — see the same note in ObserveRender above.
  const tsAsInt = BigInt(Math.trunc(inTimeStamp.mSampleTime));

  // @0x1236cad-@0x1236cb0 — `cmpq %rax,%rcx; jg RET0`.
  // Flags set for `rcx - rax = nextEventTick - tsAsInt`; `jg` fires when
  // `nextEventTick > tsAsInt` (signed).  Note that this differs from
  // ObserveRender's `jle ADVANCE` at @0x1236d8e (which fires when
  // `nextEventTick <= tsAsInt`) — the two are logical duals; both
  // implement `if (tsAsInt < nextEventTick) return`.
  if (inRefCon.nextEventTick > tsAsInt) {
    return 0;
  }

  // @0x1236cb2 — ADVANCE.
  const newTick = tsAsInt + inRefCon.tickStride;
  inRefCon.nextEventTick = newTick;

  // @0x1236cc0 — dispatchByVtable dispatch.
  if (inRefCon.dispatchByVtable === 1) {
    // @0x1236ccf — `callq *(%rax)`.
    inRefCon.vtable_slot0(inRefCon);
    return 0;
  }

  // @0x1236ce7 — SendEmptyMessageToPort(true).
  if (hostSendEmptyMessageToPort === null) {
    throw new Error("FFUnitAttachedParameterChaser.ObserveRenderHelper @0x1236ce7: host has not installed a FFMachPortCallback::SendEmptyMessageToPort binding — install one via setSendEmptyMessageToPort(fn). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
  }
  hostSendEmptyMessageToPort(inRefCon, true);
  return 0;
};

// ORACLE NOTE
// This class exposes no pure-scalar fn to fuzz against a dlsym'd oracle
// — every method mutates instance state and forwards into C bindings the
// port does not (yet) reach.  The gate still enforces provenance,
// tsc-clean, and PORTING_SPEC.md compliance.
