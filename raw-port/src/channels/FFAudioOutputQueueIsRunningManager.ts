/**
 * FFAudioOutputQueueIsRunningManager — Flexo.framework subclass of
 * `FFAudioOutputIsRunningManager` that watches the AudioToolbox
 * `kAudioQueueProperty_IsRunning` (four-char code `'aqrn'` = 0x6171726E) of a
 * specific `OpaqueAudioQueue*` (AudioQueueRef) and forwards state changes into
 * the parent class's shared plumbing.
 *
 * This is the AudioQueue sibling of `FFAudioOutputUnitIsRunningManager` — the
 * two ports are structurally identical; only the CoreAudio APIs differ:
 *   AudioQueue path:    AudioQueueAddPropertyListener /
 *                       AudioQueueRemovePropertyListener /
 *                       AudioQueueGetProperty
 *   AudioUnit path:     AudioUnitAddPropertyListener /
 *                       AudioUnitRemovePropertyListenerWithUserData /
 *                       AudioUnitGetProperty
 *
 * Framework: Flexo (macOS x86_64, FCP build).
 *
 * @classAddr Flexo
 *   @0x0000000000d0b4b0  ctor C2 (base-object constructor)
 *   @0x0000000000d0b520  ctor C1 (complete-object constructor)
 *   @0x0000000000d0b590  dtor D2 (base-object destructor)
 *   @0x0000000000d0b5f0  dtor D1 (complete-object destructor)
 *   @0x0000000000d0b650  dtor D0 (deleting destructor)
 *   @0x0000000000d0b6b0  getIsRunningStatus()
 *
 * INHERITANCE (proven by ctor/dtor bodies — identical shape to the AudioUnit
 * sibling):
 *   FFAudioOutputQueueIsRunningManager → FFAudioOutputIsRunningManager
 *     - ctor C1 @0xd0b52d calls
 *         __ZN29FFAudioOutputIsRunningManagerC2Ev
 *       for the base-subobject constructor at offset 0.
 *     - ctor C1 @0xd0b55d ends by calling
 *         __ZN29FFAudioOutputIsRunningManager20updateIsRunningStateEv
 *       to seed the initial state.
 *     - The exception-cleanup path (@0xd0b574..0xd0b580) tears down
 *         FFConditionLock  at +0x20                (D1)
 *         FFMachPortDispatchQueueCallback  at +0   (D2)
 *       proving the base's own composition.
 *
 * INSTANCE LAYOUT:
 *   +0x00  vtable                                                (set @0xd0b539/0xd0b4c9)
 *   +0x00  FFMachPortDispatchQueueCallback  (base subobject at 0)
 *   +0x20  FFConditionLock  (base's cond var)
 *   +0xb0  OpaqueAudioQueue*  (audio queue handle — THIS class's own field,
 *                              written @0xd0b53c: movq %r14, 0xb0(%rbx))
 *   Total sizeof ≥ 0xb8.
 *
 * ── NATIVE PLUGIN POINT ──
 *   Ctor and D0/D1/D2 all reference the C free function:
 *     __Z44FFAudioOutputQueue_IsRunningPropertyListenerPvP16OpaqueAudioQueuej
 *   the property-listener callback registered with AudioToolbox via
 *   AudioQueueAddPropertyListener (@0xd0b4e5 / @0xd0b555) and removed via
 *   AudioQueueRemovePropertyListener (@0xd0b5b9 / @0xd0b619 / @0xd0b679).
 *   The property selector 0x6171726E = kAudioQueueProperty_IsRunning; userData
 *   is `this`, so the callback's third arg points back to the manager.
 *
 * ── HOST BRIDGE ──
 *   TS has no CoreAudio; we surface an injectable bridge for the three
 *   AudioQueue calls the class touches. The default bridge raises loudly.
 */

/** Opaque handle for a native `OpaqueAudioQueue*` (AudioQueueRef). */
export type OpaqueAudioQueueLike = {
  readonly __brand: "OpaqueAudioQueueLike";
};

/**
 * kAudioQueueProperty_IsRunning = 0x6171726E = fourCC `'aqrn'`.
 * Cited on every callsite:
 *   ctor    @0xd0b4dd  movl $0x6171726e,%esi  → AudioQueueAddPropertyListener
 *   dtor D2 @0xd0b5b1  movl $0x6171726e,%esi  → AudioQueueRemovePropertyListener
 *   dtor D1 @0xd0b611  movl $0x6171726e,%esi  → AudioQueueRemovePropertyListener
 *   dtor D0 @0xd0b671  movl $0x6171726e,%esi  → AudioQueueRemovePropertyListener
 *   getIsRunningStatus @0xd0b6ce  movl $0x6171726e,%esi → AudioQueueGetProperty
 */
const kAudioQueueProperty_IsRunning = 0x6171726e;

/**
 * AudioQueue property-listener callback shape:
 *   `AudioQueuePropertyListenerProc =
 *      void (*)(void* inUserData, AudioQueueRef inAQ, AudioQueuePropertyID inID)`
 * The native listener mangled as
 *   `__Z44FFAudioOutputQueue_IsRunningPropertyListenerPvP16OpaqueAudioQueuej`
 * matches this shape (`P v`, `P 16OpaqueAudioQueue`, `j`).
 */
export type AudioQueuePropertyListenerProc = (
  inUserData: FFAudioOutputQueueIsRunningManager,
  inAQ: OpaqueAudioQueueLike,
  inID: number
) => void;

/** Host bridge for the three CoreAudio calls the class uses. */
export interface FFAudioOutputQueueIsRunningManagerBridge {
  /**
   * Mirrors `AudioQueueAddPropertyListener(inAQ, inID, inProc, inUserData)` — see
   * @0xd0b4e5 (symbol stub 0x14945a8). The `inUserData` is `this`, so the host can
   * wire up notifications back into the parent class's `updateIsRunningState()`.
   */
  audioQueueAddPropertyListener(
    inAQ: OpaqueAudioQueueLike,
    inID: number,
    inProc: AudioQueuePropertyListenerProc,
    inUserData: FFAudioOutputQueueIsRunningManager
  ): void;

  /**
   * Mirrors `AudioQueueRemovePropertyListener(inAQ, inID, inProc, inUserData)` — see
   * @0xd0b5b9 (symbol stub 0x14945de). Called from every destructor variant to
   * unwire the listener before the object is torn down.
   */
  audioQueueRemovePropertyListener(
    inAQ: OpaqueAudioQueueLike,
    inID: number,
    inProc: AudioQueuePropertyListenerProc,
    inUserData: FFAudioOutputQueueIsRunningManager
  ): void;

  /**
   * Mirrors `AudioQueueGetProperty(inAQ, inID, outData, ioSize)` — see @0xd0b6d3
   * (symbol stub 0x14945d2). Called only by `getIsRunningStatus()`.
   *
   * For the IsRunning property, `outData` is a UInt32 (bytes 0..3) — the native
   * binary sets *ioSize=4 before the call (@0xd0b6b8 `movl $0x4,-0x4(%rbp)`) and
   * returns success ⇔ (OSStatus==0 AND *outData!=0).
   *
   * Bridges should return { status, value } where `status` is the OSStatus and
   * `value` is the u32 that AudioQueue wrote into the out-buffer.
   */
  audioQueueGetIsRunningProperty(
    inAQ: OpaqueAudioQueueLike,
    inID: number
  ): { status: number; value: number };
}

const raiseBridgeMissing = (methodName: string, addr: string): never => {
  throw new Error(
    `FFAudioOutputQueueIsRunningManager.${methodName}: no CoreAudio bridge installed — ` +
      `native symbol stub referenced at @${addr}. ` +
      `Call setFFAudioOutputQueueIsRunningManagerBridge() first.`
  );
};

let g_bridge: FFAudioOutputQueueIsRunningManagerBridge = {
  audioQueueAddPropertyListener: () => {
    return raiseBridgeMissing(
      "ctor(_AudioQueueAddPropertyListener)",
      "0xd0b4e5"
    );
  },
  audioQueueRemovePropertyListener: () => {
    return raiseBridgeMissing(
      "dtor(_AudioQueueRemovePropertyListener)",
      "0xd0b5b9"
    );
  },
  audioQueueGetIsRunningProperty: () => {
    return raiseBridgeMissing(
      "getIsRunningStatus(_AudioQueueGetProperty)",
      "0xd0b6d3"
    );
  },
};

export function setFFAudioOutputQueueIsRunningManagerBridge(
  b: FFAudioOutputQueueIsRunningManagerBridge
): void {
  g_bridge = b;
}

/**
 * The base class's `updateIsRunningState()` hook — hosted here as an injection
 * point because the property-listener callback
 * (`FFAudioOutputQueue_IsRunningPropertyListener`) is a free function that
 * reaches into `FFAudioOutputIsRunningManager::updateIsRunningState` through
 * the `inUserData = this` pointer.
 *
 * The ctor also calls it directly as its final act @0xd0b4ed / @0xd0b55d to
 * seed the initial state.
 */
export type FFAudioOutputIsRunningManagerUpdateFn = (
  m: FFAudioOutputQueueIsRunningManager
) => void;

let g_updateIsRunningState: FFAudioOutputIsRunningManagerUpdateFn = () => {
  // Native @0xd0b4ed / @0xd0b55d invokes
  //   FFAudioOutputIsRunningManager::updateIsRunningState()
  // on the base subobject. If the host has not yet wired the base manager, we
  // raise so callers do not silently skip the initial "seed" state.
  throw new Error(
    "FFAudioOutputQueueIsRunningManager: no updateIsRunningState hook installed — " +
      "native @0xd0b4ed calls FFAudioOutputIsRunningManager::updateIsRunningState() " +
      "on the base subobject. Wire up the base manager via " +
      "setFFAudioOutputIsRunningManagerUpdateHook() first."
  );
};

export function setFFAudioOutputIsRunningManagerUpdateHook(
  hook: FFAudioOutputIsRunningManagerUpdateFn
): void {
  g_updateIsRunningState = hook;
}

/**
 * FFAudioOutputQueueIsRunningManager — the class body.
 *
 * @classAddr Flexo @0xd0b4b0 (C2) / @0xd0b520 (C1) / @0xd0b590 (D2) /
 *   @0xd0b5f0 (D1) / @0xd0b650 (D0) / @0xd0b6b0 (getIsRunningStatus)
 */
export class FFAudioOutputQueueIsRunningManager {
  /**
   * this+0xb0 — the OpaqueAudioQueue* the manager is bound to. Set by the ctor
   * @0xd0b4cc / @0xd0b53c `movq %r14,0xb0(%rbx)` where %r14 is the second-arg
   * pointer coming in (rsi in the C1 signature — the OpaqueAudioQueue*).
   */
  private queue: OpaqueAudioQueueLike;

  /**
   * The listener the ctor registers and every dtor variant unregisters. Native
   * code passes a fixed extern "C" function pointer
   * (`FFAudioOutputQueue_IsRunningPropertyListener`); in TS we bind a closure
   * that forwards through `g_updateIsRunningState` so the host can observe each
   * property notification through the base-class hook.
   *
   * @symRef Flexo @0xd0b4d3 (ctor lea of the listener) /
   *   @0xd0b543 (C1 lea) / @0xd0b5aa (D2 lea) / @0xd0b60a (D1 lea) /
   *   @0xd0b66a (D0 lea).
   */
  private readonly listener: AudioQueuePropertyListenerProc;

  /**
   * FFAudioOutputQueueIsRunningManager::FFAudioOutputQueueIsRunningManager(
   *     OpaqueAudioQueue* audioQueue) — C1 @0xd0b520. Native body:
   *   0xd0b527  movq %rsi,%r14 ; movq %rdi,%rbx                     ; save queue + this
   *   0xd0b52d  callq  FFAudioOutputIsRunningManager::ctor          ; base init
   *   0xd0b532  leaq 0xc05d9f(%rip),%rax                            ; &vtable_of_this_class
   *   0xd0b539  movq %rax,(%rbx)                                    ; overwrite vptr
   *   0xd0b53c  movq %r14,0xb0(%rbx)                                ; this->queue = audioQueue
   *   0xd0b543  leaq FFAudioOutputQueue_IsRunningPropertyListener(%rip),%rdx
   *   0xd0b54a  movq %r14,%rdi                                       ; inAQ = queue
   *   0xd0b54d  movl $0x6171726e,%esi                                ; kAudioQueueProperty_IsRunning
   *   0xd0b552  movq %rbx,%rcx                                       ; inUserData = this
   *   0xd0b555  callq _AudioQueueAddPropertyListener                 ; register
   *   0xd0b55d  callq FFAudioOutputIsRunningManager::updateIsRunningState  ; seed
   *
   * (C2 @0xd0b4b0 is byte-identical up to base ctor / vtable RIP-relative
   * offsets. Clang emits both mangled forms because the class is used both as
   * a complete object and as a base subobject; the observable effect is
   * the same.)
   *
   * @ctorAddr Flexo C1 @0xd0b520, C2 @0xd0b4b0
   */
  constructor(audioQueue: OpaqueAudioQueueLike) {
    // The C++ base ctor (@0xd0b52d) sets up
    //   FFMachPortDispatchQueueCallback @+0
    //   FFConditionLock @+0x20
    // Those subobjects are the base class's responsibility; this port models
    // them by CONSTRUCTION-ORDER contract only — the host is expected to have
    // installed the base-manager port's own facade before instantiating us.

    // @0xd0b53c  this->queue = audioQueue
    this.queue = audioQueue;

    // @0xd0b543..0xd0b555  AudioQueueAddPropertyListener(this->queue,
    //   kAudioQueueProperty_IsRunning, &FFAudioOutputQueue_IsRunningPropertyListener,
    //   this)
    // The listener is stored so the destructors can pass the SAME function
    // pointer to AudioQueueRemovePropertyListener (native compares by address —
    // each dtor re-leas the same symbol).
    this.listener = (inUserData, _inAQ, _inID): void => {
      // Native listener body is `FFAudioOutputQueue_IsRunningPropertyListener` —
      // a separate C free function whose disassembly is its OWN port. Called
      // with (inUserData=this, inAQ=queue, inID=0x6171726E) it forwards to
      // `FFAudioOutputIsRunningManager::updateIsRunningState()` on the base
      // subobject of inUserData. We mirror that contract by delegating to the
      // hook — the base port owns the state-transition logic.
      g_updateIsRunningState(inUserData);
    };
    g_bridge.audioQueueAddPropertyListener(
      this.queue,
      kAudioQueueProperty_IsRunning,
      this.listener,
      this
    );

    // @0xd0b55d  FFAudioOutputIsRunningManager::updateIsRunningState() on base.
    g_updateIsRunningState(this);
  }

  /**
   * bool FFAudioOutputQueueIsRunningManager::getIsRunningStatus() — @0xd0b6b0.
   *
   * Native body:
   *   0xd0b6b4  subq  $0x10,%rsp                        ; local stack (u32 outData + u32 ioSize)
   *   0xd0b6b8  movl  $0x4,-0x4(%rbp)                   ; ioSize = 4
   *   0xd0b6bf  movq  0xb0(%rdi),%rdi                   ; inAQ = this->queue
   *   0xd0b6c6  leaq  -0x8(%rbp),%rdx                   ; outData ptr
   *   0xd0b6ca  leaq  -0x4(%rbp),%rcx                   ; ioSize ptr
   *   0xd0b6ce  movl  $0x6171726e,%esi                  ; inID = kAudioQueueProperty_IsRunning
   *   0xd0b6d3  callq _AudioQueueGetProperty             ; OSStatus in %eax
   *   0xd0b6d8  testl %eax,%eax
   *   0xd0b6da  sete  %cl                                ; cl = (status == 0)
   *   0xd0b6dd  cmpl  $0x0,-0x8(%rbp)                   ; outData != 0 ?
   *   0xd0b6e1  setne %al                                ; al = (outData != 0)
   *   0xd0b6e4  andb  %cl,%al                            ; return status_ok && outData_nonzero
   *   0xd0b6e6-0xd0b6eb  epilogue, return in %al
   *
   * Note the AudioQueue variant of GetProperty has fewer args than the
   * AudioUnit sibling — no inScope/inElement.
   *
   * @methodAddr Flexo @0xd0b6b0
   */
  getIsRunningStatus(): boolean {
    // @0xd0b6d3  AudioQueueGetProperty(this->queue, kAudioQueueProperty_IsRunning,
    //   &outData, &ioSize)
    const r = g_bridge.audioQueueGetIsRunningProperty(
      this.queue,
      kAudioQueueProperty_IsRunning
    );
    // @0xd0b6d8-0xd0b6e4  return (status == 0) && (outData != 0)
    const statusOk = r.status === 0;
    const outDataNonzero = r.value !== 0;
    return statusOk && outDataNonzero;
  }

  /**
   * FFAudioOutputQueueIsRunningManager::~FFAudioOutputQueueIsRunningManager()
   * — D0 @0xd0b650 (deleting destructor). Native body:
   *   0xd0b656  movq  %rdi,%rbx                                    ; save this
   *   0xd0b659  leaq  0xc05c78(%rip),%rax                          ; &this-class-vtable
   *   0xd0b660  movq  %rax,(%rdi)                                  ; reinstall vptr
   *   0xd0b663  movq  0xb0(%rdi),%rdi                              ; inAQ = this->queue
   *   0xd0b66a  leaq  FFAudioOutputQueue_IsRunningPropertyListener(%rip),%rdx
   *   0xd0b671  movl  $0x6171726e,%esi                             ; kAudioQueueProperty_IsRunning
   *   0xd0b676  movq  %rbx,%rcx                                    ; inUserData = this
   *   0xd0b679  callq _AudioQueueRemovePropertyListener            ; unregister
   *   0xd0b67e  leaq  0xc05beb(%rip),%rax                          ; &BASE-vtable
   *   0xd0b685  movq  %rax,(%rbx)                                  ; reinstall base vptr
   *   0xd0b688  leaq  0x20(%rbx),%rdi                              ; &this->cond @+0x20
   *   0xd0b68c  callq FFConditionLock::~FFConditionLock            ; tear down cond
   *   0xd0b691  movq  %rbx,%rdi                                    ; this
   *   0xd0b694  callq FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback
   *   0xd0b699  movq  %rbx,%rdi                                    ; this
   *   0xd0b6a2  jmp   _ZdlPv                                        ; ::operator delete(void*)
   *
   * D1 @0xd0b5f0 is the SAME body minus the trailing `_ZdlPv` (a complete-
   * object dtor that does not free storage — used for stack instances).
   * D2 @0xd0b590 is the base-only variant used when this class is a
   * subobject; its shape is identical up to which vtable pointer is written
   * back into `(%rbx)` at the end.
   *
   * In TS we don't own storage; GC frees the object once we drop it. We
   * faithfully mirror the observable side-effect
   * (AudioQueueRemovePropertyListener) and cite the base subobject teardown
   * as documentation — the base port handles its own cleanup on its own
   * destroy().
   *
   * @dtorAddr Flexo D0 @0xd0b650, D1 @0xd0b5f0, D2 @0xd0b590
   */
  destroy(): void {
    // @0xd0b679  AudioQueueRemovePropertyListener(this->queue,
    //   kAudioQueueProperty_IsRunning, listener, this)
    g_bridge.audioQueueRemovePropertyListener(
      this.queue,
      kAudioQueueProperty_IsRunning,
      this.listener,
      this
    );
    // @0xd0b68c  FFConditionLock::~FFConditionLock() on this+0x20 — base's
    //   cond lock. Owned by the base port; base's destroy() takes it down.
    // @0xd0b694  FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback()
    //   on this — base's dispatch-queue callback. Owned by the base port.
    // @0xd0b6a2  ::operator delete(this) — freed by JS GC; no explicit call.
  }

  /**
   * TC39 explicit-resource-management sugar so `using m = new ...(queue)` invokes
   * destroy() at end of block scope. Direct TS mapping of C++ RAII cleanup.
   */
  [Symbol.dispose](): void {
    this.destroy();
  }
}
