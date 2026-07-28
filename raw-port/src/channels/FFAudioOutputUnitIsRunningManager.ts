/**
 * FFAudioOutputUnitIsRunningManager — Flexo.framework subclass of
 * `FFAudioOutputIsRunningManager` (audio-plumbing base) that watches the CoreAudio
 * "IsRunning" property (kAudioOutputUnitProperty_IsRunning = 0x7D1) of a specific
 * `AudioComponentInstance` (AURemoteIO / AUHAL) and forwards state changes into the
 * parent class's shared plumbing.
 *
 * Framework: Flexo (macOS x86_64, FCP build).
 *
 * @classAddr Flexo
 *   @0x0000000000d0b730  ctor C2 (base-object constructor)
 *   @0x0000000000d0b7a0  ctor C1 (complete-object constructor)
 *   @0x0000000000d0b810  dtor D2 (base-object destructor)
 *   @0x0000000000d0b870  dtor D1 (complete-object destructor)
 *   @0x0000000000d0b8d0  dtor D0 (deleting destructor)
 *   @0x0000000000d0b930  getIsRunningStatus()
 *
 * INHERITANCE (proven by ctor/dtor bodies):
 *   FFAudioOutputUnitIsRunningManager → FFAudioOutputIsRunningManager (single ineritance).
 *     Evidence: ctor C1 @0xd0b7ad calls
 *       __ZN29FFAudioOutputIsRunningManagerC2Ev  = FFAudioOutputIsRunningManager::ctor
 *     to initialize the base subobject at offset 0, and calls
 *       __ZN29FFAudioOutputIsRunningManager20updateIsRunningStateEv (@0xd0b7dd)
 *     as its final act.
 *   FFAudioOutputIsRunningManager in turn holds two subobjects (visible from
 *   the exception unwind in ctor C1 @0xd0b7f4/@0xd0b7fd — the unwinder tears down
 *   an `FFConditionLock` @+0x20 and a `FFMachPortDispatchQueueCallback` at offset 0).
 *   So the layout is (from THIS class's viewpoint):
 *
 *     +0x00  vtable                                                (set by ctor @0xd0b7b9)
 *     +0x00  FFMachPortDispatchQueueCallback  (base subobject at 0 — its D2 is called
 *                                              directly on `this` @0xd0b800/@0xd0b914)
 *     +0x20  FFConditionLock  (base's cond var; D1 called on this+0x20 @0xd0b7f8/@0xd0b90c)
 *     +0xb0  ComponentInstanceRecord*  (audio unit handle — this class's OWN field,
 *                                       written @0xd0b7bc: movq %r14, 0xb0(%rbx))
 *
 *   Total sizeof ≥ 0xb8 (the field at 0xb0 spans 8 bytes; total object size is what
 *   FFAudioOutputIsRunningManager's ctor sets up plus this class's 8-byte add).
 *
 * ── NATIVE PLUGIN POINT ──
 *   Ctor and D0 both reference a C free function:
 *     __Z43FFAudioOutputUnit_IsRunningPropertyListenerPvP23ComponentInstanceRecordjjj
 *   which is the extern "C" property-listener callback registered with CoreAudio via
 *   AudioUnitAddPropertyListener (@0xd0b7d5) and removed via
 *   AudioUnitRemovePropertyListenerWithUserData (@0xd0b8f9). Both APIs use the property
 *   selector 0x7D1 = kAudioOutputUnitProperty_IsRunning; the userData handed in for
 *   the callback is `this`, so the free function's fourth arg (rcx) points back at the
 *   FFAudioOutputUnitIsRunningManager instance for the parent class to consume.
 *
 * ── HOST BRIDGE ──
 *   TS has no CoreAudio; we surface an injectable bridge for the four AudioUnit calls
 *   the class touches. The default bridge raises loudly (fake success would silently
 *   pretend the audio unit is always running, which mis-models observable behaviour
 *   every caller of `getIsRunningStatus()` depends on).
 */

/**
 * Opaque handle for a native `ComponentInstanceRecord*` (AudioComponentInstance).
 * The kernel/host is responsible for allocating and passing it to the ctor.
 */
export type ComponentInstanceRecordLike = { readonly __brand: "ComponentInstanceRecordLike" };

/**
 * kAudioOutputUnitProperty_IsRunning = 0x7D1. Cited on every callsite:
 *   ctor    @0xd0b7cd  movl $0x7d1, %esi  → AudioUnitAddPropertyListener
 *   getStat @0xd0b94e  movl $0x7d1, %esi  → AudioUnitGetProperty
 *   dtor D0 @0xd0b8f1  movl $0x7d1, %esi  → AudioUnitRemovePropertyListenerWithUserData
 * (0x7D1 is the fourCC 'isru' by AudioUnit property-ID convention; the numeric value
 * is what the machine emits, so we hardcode it here as the AIR/native literal.)
 */
const kAudioOutputUnitProperty_IsRunning = 0x7d1;

/**
 * CoreAudio C-callback shape (nominal — TS-side).
 * Matches `AudioUnitPropertyListenerProc = void (*)(void*, AudioUnit, AudioUnitPropertyID,
 * AudioUnitScope, AudioUnitElement)`. The registered listener in the native binary is
 *   FFAudioOutputUnit_IsRunningPropertyListener(inRefCon, inUnit, inID, inScope, inElement)
 * — see `__Z43…jjj` (three trailing `j` = three unsigned int args after the pointers).
 */
export type AudioUnitPropertyListenerProc = (
  inRefCon: FFAudioOutputUnitIsRunningManager,
  inUnit: ComponentInstanceRecordLike,
  inID: number,
  inScope: number,
  inElement: number
) => void;

/** Host bridge for the four CoreAudio calls the class uses. */
export interface FFAudioOutputUnitIsRunningManagerBridge {
  /**
   * Mirrors `AudioUnitAddPropertyListener(inUnit, inID, inProc, inRefCon)` — see
   * @0xd0b7d5 (symbol stub 0x1494602). The `inRefCon` is `this`, so the host can wire
   * up notifications back into the parent class's `updateIsRunningState()` (a native
   * free function; here it's exposed on the manager).
   */
  audioUnitAddPropertyListener(
    inUnit: ComponentInstanceRecordLike,
    inID: number,
    inProc: AudioUnitPropertyListenerProc,
    inRefCon: FFAudioOutputUnitIsRunningManager
  ): void;

  /**
   * Mirrors `AudioUnitRemovePropertyListenerWithUserData(inUnit, inID, inProc, inRefCon)`
   * — see @0xd0b8f9 (symbol stub 0x1494626). Called from the deleting-dtor to unwire
   * the listener before the object is deallocated.
   */
  audioUnitRemovePropertyListenerWithUserData(
    inUnit: ComponentInstanceRecordLike,
    inID: number,
    inProc: AudioUnitPropertyListenerProc,
    inRefCon: FFAudioOutputUnitIsRunningManager
  ): void;

  /**
   * Mirrors `AudioUnitGetProperty(inUnit, inID, inScope=0, inElement=0, outData, ioSize)`
   * — see @0xd0b957 (symbol stub 0x1494614). Called only by `getIsRunningStatus()`;
   * inScope and inElement are BOTH ZERO (xorl %edx,%edx @0xd0b953 and xorl %ecx,%ecx
   * @0xd0b955) — the "global" scope on the "master" element for a stream-property
   * query. Returns an OSStatus (int32) — 0 on success, negative on error.
   *
   * The status is written into the caller-provided out-buffer `outData` (a u32 or larger)
   * and the size is written back into `ioSize`. For the IsRunning property, `outData`
   * is a UInt32 (bytes 0..3) — the native binary sets *ioSize=4 before the call
   * (@0xd0b938 `movl $0x4, -0x4(%rbp)`) and returns success ⇔ (OSStatus==0 AND *outData!=0).
   *
   * Bridges should return { status, value } where `status` is the OSStatus and `value`
   * is the u32 that CoreAudio wrote into the out-buffer.
   */
  audioUnitGetIsRunningProperty(
    inUnit: ComponentInstanceRecordLike,
    inID: number,
    inScope: number,
    inElement: number
  ): { status: number; value: number };
}

const throwBridgeMissing = (methodName: string, addr: string): never => {
  throw new Error(
    `FFAudioOutputUnitIsRunningManager.${methodName}: no CoreAudio bridge installed — ` +
      `native symbol stub referenced at @${addr}. ` +
      `Call setFFAudioOutputUnitIsRunningManagerBridge() first.`
  );
};

let g_bridge: FFAudioOutputUnitIsRunningManagerBridge = {
  audioUnitAddPropertyListener: () => {
    return throwBridgeMissing("ctor(_AudioUnitAddPropertyListener)", "0xd0b7d5");
  },
  audioUnitRemovePropertyListenerWithUserData: () => {
    return throwBridgeMissing(
      "dtorD0(_AudioUnitRemovePropertyListenerWithUserData)",
      "0xd0b8f9"
    );
  },
  audioUnitGetIsRunningProperty: () => {
    return throwBridgeMissing(
      "getIsRunningStatus(_AudioUnitGetProperty)",
      "0xd0b957"
    );
  },
};

export function setFFAudioOutputUnitIsRunningManagerBridge(
  b: FFAudioOutputUnitIsRunningManagerBridge
): void {
  g_bridge = b;
}

/**
 * The base class's `updateIsRunningState()` — hosted here as a hook because the
 * property-listener callback (`FFAudioOutputUnit_IsRunningPropertyListener` @sym
 * `__Z43FFAudioOutputUnit_IsRunningPropertyListenerPvP23ComponentInstanceRecordjjj`) is
 * a free function that reaches into `FFAudioOutputIsRunningManager::updateIsRunningState`
 * through the `inRefCon = this` pointer at (%rcx) — see @0xd0b7dd where the ctor itself
 * calls this method as its final act to seed the initial state.
 *
 * We do NOT ship a real implementation of the base method here; the base
 * `FFAudioOutputIsRunningManager` is its own port. What we DO ship is the injection
 * point so a host that has wired up the base can plug the observer in.
 */
export type FFAudioOutputIsRunningManagerUpdateFn = (
  m: FFAudioOutputUnitIsRunningManager
) => void;

let g_updateIsRunningState: FFAudioOutputIsRunningManagerUpdateFn = () => {
  // Native @0xd0b7dd invokes FFAudioOutputIsRunningManager::updateIsRunningState() —
  // that base-class method is its own port. If the host has not yet wired the base
  // manager, we raise so callers do not silently skip the initial "seed" state.
  throw new Error(
    "FFAudioOutputUnitIsRunningManager: no updateIsRunningState hook installed — " +
      "native @0xd0b7dd calls FFAudioOutputIsRunningManager::updateIsRunningState() " +
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
 * FFAudioOutputUnitIsRunningManager — the class body.
 *
 * @classAddr Flexo @0xd0b730 (C2) / @0xd0b7a0 (C1) / @0xd0b810 (D2) / @0xd0b870 (D1) /
 *   @0xd0b8d0 (D0) / @0xd0b930 (getIsRunningStatus)
 */
export class FFAudioOutputUnitIsRunningManager {
  /**
   * this+0xb0 — the ComponentInstanceRecord* the manager is bound to. Set by the ctor
   * @0xd0b7bc `movq %r14, 0xb0(%rbx)` where `%r14` is the second-arg pointer coming in
   * from the caller (rsi in the C1 signature — the ComponentInstanceRecord*).
   */
  private unit: ComponentInstanceRecordLike;

  /**
   * The listener the ctor registers and the D0 dtor unregisters. Native code passes a
   * fixed extern "C" function pointer (`FFAudioOutputUnit_IsRunningPropertyListener`); in
   * TS we bind a closure that forwards through `g_updateIsRunningState` so the host can
   * observe each property notification through the base-class hook.
   *
   * @symRef Flexo @0xd0b7c3 (ctor lea of the listener) / @0xd0b8ea (D0 lea of the same).
   */
  private readonly listener: AudioUnitPropertyListenerProc;

  /**
   * FFAudioOutputUnitIsRunningManager::FFAudioOutputUnitIsRunningManager(
   *     ComponentInstanceRecord* audioUnit) — C1 @0xd0b7a0. Native body:
   *   0xd0b7a7  movq %rsi,%r14 ; movq %rdi,%rbx                     ; save unit + this
   *   0xd0b7ad  callq  FFAudioOutputIsRunningManager::ctor            ; base init
   *   0xd0b7b2  leaq 0xc05b77(%rip),%rax                            ; &vtable_of_this_class
   *   0xd0b7b9  movq %rax,(%rbx)                                    ; overwrite vptr
   *   0xd0b7bc  movq %r14,0xb0(%rbx)                                ; this->unit = audioUnit
   *   0xd0b7c3  leaq FFAudioOutputUnit_IsRunningPropertyListener(%rip),%rdx
   *   0xd0b7cd  movl $0x7d1,%esi                                    ; kAudioOutputUnitProperty_IsRunning
   *   0xd0b7d2  movq %rbx,%rcx                                       ; inRefCon = this
   *   0xd0b7d5  callq _AudioUnitAddPropertyListener                   ; register
   *   0xd0b7dd  callq FFAudioOutputIsRunningManager::updateIsRunningState  ; seed
   *
   * (C2 @0xd0b730 is byte-identical up to base ctor / vtable RIP-relative offsets. It
   * exists because Clang emits both mangled forms when the class is used both as a
   * complete object and as a base subobject; the observable effect is the same.)
   *
   * @ctorAddr Flexo C1 @0xd0b7a0, C2 @0xd0b730
   */
  constructor(audioUnit: ComponentInstanceRecordLike) {
    // The C++ base ctor (@0xd0b7ad) sets up FFMachPortDispatchQueueCallback @+0 and
    // FFConditionLock @+0x20. Those subobjects are the base class's responsibility;
    // this port models them by CONSTRUCTION-ORDER contract only — the host is expected
    // to have installed the base-manager port's own facade before instantiating us.
    // The initial "seed" call @0xd0b7dd invokes the base's updateIsRunningState() —
    // we route that through g_updateIsRunningState which the host can wire when it
    // has the base ready.

    // @0xd0b7bc  this->unit = audioUnit
    this.unit = audioUnit;

    // @0xd0b7c3..0xd0b7d5  AudioUnitAddPropertyListener(this->unit,
    //   kAudioOutputUnitProperty_IsRunning, &FFAudioOutputUnit_IsRunningPropertyListener,
    //   this)
    // The listener is stored so D0 can pass the SAME function pointer to
    // AudioUnitRemovePropertyListenerWithUserData (native compares by address — @0xd0b8ea
    // re-leas the same symbol).
    this.listener = (
      inRefCon,
      _inUnit,
      _inID,
      _inScope,
      _inElement
    ): void => {
      // Native listener body is `FFAudioOutputUnit_IsRunningPropertyListener` — a
      // separate C free function whose disassembly is its OWN port. From callsite
      // context (only place it's referenced is here, always with inRefCon=this and
      // inID=0x7D1) it's a thin wrapper that calls
      // `FFAudioOutputIsRunningManager::updateIsRunningState()` on the base subobject
      // of `inRefCon`. We mirror that contract by delegating to the hook — the base
      // port owns the state-transition logic.
      g_updateIsRunningState(inRefCon);
    };
    g_bridge.audioUnitAddPropertyListener(
      this.unit,
      kAudioOutputUnitProperty_IsRunning,
      this.listener,
      this
    );

    // @0xd0b7dd  FFAudioOutputIsRunningManager::updateIsRunningState() on the base.
    g_updateIsRunningState(this);
  }

  /**
   * bool FFAudioOutputUnitIsRunningManager::getIsRunningStatus() — @0xd0b930.
   *
   * Native body:
   *   0xd0b934  subq  $0x10,%rsp                        ; local stack (u32 outData + u32 ioSize)
   *   0xd0b938  movl  $0x4,-0x4(%rbp)                   ; ioSize = 4
   *   0xd0b93f  movq  0xb0(%rdi),%rdi                   ; inUnit = this->unit
   *   0xd0b946  leaq  -0x8(%rbp),%r8                    ; outData ptr
   *   0xd0b94a  leaq  -0x4(%rbp),%r9                    ; ioSize ptr
   *   0xd0b94e  movl  $0x7d1,%esi                       ; inID = kAudioOutputUnitProperty_IsRunning
   *   0xd0b953  xorl  %edx,%edx                         ; inScope = 0
   *   0xd0b955  xorl  %ecx,%ecx                         ; inElement = 0
   *   0xd0b957  callq _AudioUnitGetProperty              ; OSStatus in %eax, outData at rbp-8
   *   0xd0b95c  testl %eax,%eax
   *   0xd0b95e  sete  %cl                                ; cl = (status == 0)
   *   0xd0b961  cmpl  $0x0,-0x8(%rbp)                   ; outData != 0 ?
   *   0xd0b965  setne %al                                ; al = (outData != 0)
   *   0xd0b968  andb  %cl,%al                            ; return status_ok && outData_nonzero
   *   0xd0b96a-0xd0b96f  epilogue, return in %al
   *
   * @methodAddr Flexo @0xd0b930
   */
  getIsRunningStatus(): boolean {
    // @0xd0b957  AudioUnitGetProperty(this->unit, kAudioOutputUnitProperty_IsRunning,
    //   /*inScope=*/0, /*inElement=*/0, &outData, &ioSize)
    // Bridge returns { status, value } bundling the OSStatus and the outData u32.
    const r = g_bridge.audioUnitGetIsRunningProperty(
      this.unit,
      kAudioOutputUnitProperty_IsRunning,
      0, // @0xd0b953
      0  // @0xd0b955
    );
    // @0xd0b95c-0xd0b968  return (status == 0) && (outData != 0)
    const statusOk = r.status === 0;
    const outDataNonzero = r.value !== 0;
    return statusOk && outDataNonzero;
  }

  /**
   * FFAudioOutputUnitIsRunningManager::~FFAudioOutputUnitIsRunningManager() — D0
   * @0xd0b8d0 (deleting destructor). Native body:
   *   0xd0b8d6  movq  %rdi,%rbx                                    ; save this
   *   0xd0b8d9  leaq  0xc05a50(%rip),%rax                          ; &this-class-vtable
   *   0xd0b8e0  movq  %rax,(%rdi)                                  ; reinstall vptr
   *   0xd0b8e3  movq  0xb0(%rdi),%rdi                              ; inUnit = this->unit
   *   0xd0b8ea  leaq  FFAudioOutputUnit_IsRunningPropertyListener(%rip),%rdx
   *   0xd0b8f1  movl  $0x7d1,%esi                                  ; kAudioOutputUnitProperty_IsRunning
   *   0xd0b8f6  movq  %rbx,%rcx                                    ; inRefCon = this
   *   0xd0b8f9  callq _AudioUnitRemovePropertyListenerWithUserData ; unregister
   *   0xd0b8fe  leaq  0xc0596b(%rip),%rax                          ; &BASE-vtable
   *   0xd0b905  movq  %rax,(%rbx)                                  ; reinstall base vptr
   *   0xd0b908  leaq  0x20(%rbx),%rdi                              ; &this->cond @+0x20
   *   0xd0b90c  callq FFConditionLock::~FFConditionLock            ; tear down cond
   *   0xd0b911  movq  %rbx,%rdi                                     ; this
   *   0xd0b914  callq FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback
   *   0xd0b919  movq  %rbx,%rdi                                     ; this
   *   0xd0b922  jmp  _ZdlPv                                         ; ::operator delete(void*)
   *
   * D1 @0xd0b870 is the SAME body minus the trailing `_ZdlPv` (a complete-object dtor
   * that does not free storage — used for stack instances). D2 @0xd0b810 is the base-
   * only variant used when this class is a subobject.
   *
   * In TS we don't own storage; GC frees the object once we drop it. We faithfully
   * mirror the observable side-effect (AudioUnitRemovePropertyListenerWithUserData)
   * and cite the base subobject teardown as documentation — the base port will handle
   * its own cleanup on its own destroy().
   *
   * @dtorAddr Flexo D0 @0xd0b8d0, D1 @0xd0b870, D2 @0xd0b810
   */
  destroy(): void {
    // @0xd0b8f9  AudioUnitRemovePropertyListenerWithUserData(this->unit,
    //   kAudioOutputUnitProperty_IsRunning, listener, this)
    g_bridge.audioUnitRemovePropertyListenerWithUserData(
      this.unit,
      kAudioOutputUnitProperty_IsRunning,
      this.listener,
      this
    );
    // @0xd0b90c  FFConditionLock::~FFConditionLock() on this+0x20 — base's cond lock.
    //   Owned by the base port; base's destroy() takes it down.
    // @0xd0b914  FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback() on
    //   this — base's dispatch-queue callback. Owned by the base port.
    // @0xd0b922  ::operator delete(this) — freed by JS GC; no explicit call needed.
  }

  /**
   * TC39 explicit-resource-management sugar so `using m = new ...(unit)` invokes
   * destroy() at end of block scope. Direct TS mapping of C++ RAII cleanup.
   */
  [Symbol.dispose](): void {
    this.destroy();
  }
}
