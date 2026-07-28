// FFAudioInputAdapter — Flexo base class for a pull-driven audio input node.
//
// This is the ABC that FFAudioInputCallbackAdapter (already ported at
// `raw-port/src/channels/FFAudioInputCallbackAdapter.ts`) and other
// concrete audio input adapters inherit from. It carries the outer
// Render/DoRender vtable ladder plus a suite of empty "control" hooks
// (UpdateMaxPullFrames / ChangeFormat / SetStartTime / Start / Stop) that
// return 0 by default and are meant to be overridden by concrete
// subclasses.
//
// Framework: Final Cut Pro / Flexo.framework (arch x86_64).
//
// Source symbols (all @ Flexo file offsets, VMs read directly from
// `otool -tV` of the x86_64 slice):
//   0xd37690  FFAudioInputAdapter::DoRender(unsigned int&, AudioTimeStamp const&,
//                                           unsigned int, unsigned int,
//                                           AudioBufferList&)
//   0xd38e30  FFAudioInputAdapter::RenderHelper(void*, unsigned int*,
//                                               AudioTimeStamp const*,
//                                               unsigned int, unsigned int,
//                                               AudioBufferList*)
//   0xd3d550  FFAudioInputAdapter::UpdateMaxPullFrames(unsigned int)
//   0xd3d560  FFAudioInputAdapter::ChangeFormat(double, unsigned int)
//   0xd3d570  FFAudioInputAdapter::SetStartTime(double)
//   0xd3d580  FFAudioInputAdapter::Start()
//   0xd3d590  FFAudioInputAdapter::Stop()
//
// Disassembly files:
//   raw-port/re/disasm/Flexo.FFAudioInputAdapter.DoRender.s              (66 lines)
//   raw-port/re/disasm/Flexo.FFAudioInputAdapter.RenderHelper.s          (66 lines)
//   raw-port/re/disasm/Flexo.FFAudioInputAdapter.UpdateMaxPullFrames.s   (7 lines)
//   raw-port/re/disasm/Flexo.FFAudioInputAdapter.ChangeFormat.s          (7 lines)
//   raw-port/re/disasm/Flexo.FFAudioInputAdapter.SetStartTime.s          (7 lines)
//   raw-port/re/disasm/Flexo.FFAudioInputAdapter.Start.s                 (7 lines)
//   raw-port/re/disasm/Flexo.FFAudioInputAdapter.Stop.s                  (7 lines)
//
// STRUCT LAYOUT (recovered from DoRender / RenderHelper reads):
//   +0x00  void*   vtable
//              slot 0x38 = virtual `Render(...)` — the concrete pull hook
//                          (returns OSStatus in EAX; concrete subclasses
//                           override it, e.g. FFAudioInputCallbackAdapter::Render
//                           @0xd3d5a0).
//   +0x08  void*   monitor        (nullable — an optional "render-bracket
//                                  monitor" object; can be null)
//              monitor -> +0x70   inner-monitor pointer (nullable)
//                     -> vtable
//                        slot 0x10 = preRender (called BEFORE the concrete
//                                     Render — see DoRender @0xd376f2 /
//                                     RenderHelper @0xd38e92)
//                        slot 0x18 = postRender (called AFTER — see
//                                     DoRender @0xd3773c /
//                                     RenderHelper @0xd38edc)
//              preRender / postRender receive:
//                  arg0 = monitor.inner    (@0xd376d5 / @0xd376e8)
//                  arg1 = *ioActionFlagsRef (dereferenced from rsi @0xd376de:
//                                            movl (%r12),%esi — this reads the
//                                            u32 pointed to by the reference)
//                  arg2 = &timeStamp        (leaq -0x70(%rbp) — the local
//                                            copy of the AudioTimeStamp)
//                  arg3 = busNumber         (unsigned int, from ecx)
//                  arg4 = numberFrames      (unsigned int, from r8d)
//                  arg5 = &bufferList       (r9 / -0x30(%rbp) reload)
//
// Both DoRender and RenderHelper are BYTE-FOR-BYTE structurally identical
// (same prologue, same reg allocation, same vtable slot offsets, same
// branch layout, same epilogue).  The only C++-level differences are the
// argument types (reference-vs-pointer vs. an extra opaque `void*` arg for
// RenderHelper); at the ABI level in System V x86_64 both signatures land
// on the exact same register file, so the compiler emitted them as
// twinned bodies.
//
// Faithful fp32 transcription — no reordering, no fusion.

/**
 * Local AudioTimeStamp snapshot.  The two Render bodies both stack-copy
 * 0x40 bytes = four xmm registers = the CoreAudio `AudioTimeStamp`
 * struct (64 bytes) from `[rdx]` to `[rbp-0x70]` BEFORE any callback
 * fires, so that if `preRender` mutates the source timestamp the
 * concrete Render still sees the original value.
 *
 * We keep it opaque here — the raw-port models it as a passthrough
 * blob and defers to the caller to interpret.
 * @0xd376ad..@0xd376c8 (DoRender), @0xd38e4d..@0xd38e68 (RenderHelper)
 */
export type AudioTimeStamp = unknown;

/** Opaque AudioBufferList — passed straight through to the concrete Render. */
export type AudioBufferList = unknown;

/**
 * The render-bracket monitor object at `this[+0x08]`.  Its purpose is to
 * hook every input-adapter Render call so it can log / meter / profile
 * both before and after the concrete pull.  The .s reads it lazily:
 * both `monitor` and `monitor.inner` may be null (each is guarded by a
 * `testq %rax, %rax` / `testq %rdi, %rdi` — DoRender @0xd376d0/@0xd376dc,
 * RenderHelper @0xd38e70/@0xd38e7c).
 *
 * @0xd376cc — monitor       = *(u64*)(this + 0x08)
 * @0xd376d5 — monitor.inner = *(u64*)(monitor + 0x70)
 */
export interface FFAudioInputAdapter_RenderMonitor {
  /**
   * The nested monitor (@monitor+0x70). Nullable.  When present, its
   * vtable slots 0x10 and 0x18 are called before and after the concrete
   * Render.  Both entries receive `inner` as their `this` pointer.
   */
  inner: FFAudioInputAdapter_RenderMonitorInner | null;
}

/**
 * Inner render-bracket monitor.  Only two vtable slots are ever touched:
 *   slot 0x10 = preRender    (@0xd376f2 / @0xd38e92)
 *   slot 0x18 = postRender   (@0xd3773c / @0xd38edc)
 * We model these directly as JS methods (a full C++ vtable is not
 * required for a faithful behavioural transcription; the port ships the
 * observable side-effects).
 *
 * @shader — n/a (C++ class; no shader IR).
 */
export interface FFAudioInputAdapter_RenderMonitorInner {
  /**
   * vtable slot +0x10.  Called BEFORE the concrete Render.
   * @0xd376f2 (DoRender) / @0xd38e92 (RenderHelper)
   */
  preRender(
    ioActionFlags: number,
    timeStamp: AudioTimeStamp,
    busNumber: number,
    numberFrames: number,
    bufferList: AudioBufferList,
  ): void;
  /**
   * vtable slot +0x18.  Called AFTER the concrete Render.
   * @0xd3773c (DoRender) / @0xd38edc (RenderHelper)
   */
  postRender(
    ioActionFlags: number,
    timeStamp: AudioTimeStamp,
    busNumber: number,
    numberFrames: number,
    bufferList: AudioBufferList,
  ): void;
}

/**
 * Instance layout used by every ported method.  Offsets in comments
 * cite the exact instruction that reads them.
 *
 * @0xd376cc — `this[+0x08]` monitor read (DoRender)
 * @0xd376fc — `this[+0x00]` vtable read (DoRender)
 * @0xd37715 — `this[+0x08]` monitor read (post-hook, DoRender)
 */
export interface FFAudioInputAdapter_Object {
  /**
   * The concrete `Render(...)` vtable slot at `vtable[+0x38]`.  Every
   * subclass overrides this; e.g. FFAudioInputCallbackAdapter::Render
   * @0xd3d5a0 (see FFAudioInputCallbackAdapter.ts).
   * @0xd37710 (DoRender) / @0xd38eb0 (RenderHelper) — `callq *0x38(%rax)`
   */
  render(
    ioActionFlagsRef: { value: number },
    timeStamp: AudioTimeStamp,
    busNumber: number,
    numberFrames: number,
    bufferList: AudioBufferList,
  ): number;
  /**
   * Optional render-bracket monitor at `this[+0x08]`.
   * @0xd376cc / @0xd38e6c
   */
  monitor: FFAudioInputAdapter_RenderMonitor | null;
}

/**
 * Shared body for the twinned DoRender/RenderHelper vtable-bracket
 * dispatchers.  Both symbols land on the exact same 66-line asm shape,
 * so a single helper captures the semantics; the two exported entry
 * points below each delegate to it, citing their own @0xADDR.
 *
 * Behaviour (from the .s files, in exact source order):
 *   1. Snapshot the caller-supplied AudioTimeStamp into a local 64-byte
 *      copy so pre/post hooks and the concrete Render all see the same
 *      value even if some hook mutates the source.
 *      (Modelled here as passing `timeStamp` straight through; JS has no
 *      analogue of the 0x40-byte stack copy — the observable end-state
 *      is that every callee receives the SAME `timeStamp` reference we
 *      were handed at entry, which is exactly what the stack copy
 *      guarantees for read-only consumers.)
 *   2. If `this.monitor != null` AND `this.monitor.inner != null`, call
 *      `this.monitor.inner.preRender(*ioActionFlagsRef, timeStamp,
 *      busNumber, numberFrames, bufferList)` — the ioActionFlags is
 *      dereferenced to a scalar BEFORE the call (@0xd376de: movl
 *      (%r12),%esi), matching a `unsigned int` pass-by-value in the
 *      callee.
 *   3. Call `this.render(ioActionFlagsRef, timeStamp, busNumber,
 *      numberFrames, bufferList)` — the return value (OSStatus in EAX)
 *      is stashed in `ebx` for the epilogue.
 *   4. If `this.monitor != null` AND `this.monitor.inner != null`, call
 *      `this.monitor.inner.postRender(*ioActionFlagsRef, timeStamp,
 *      busNumber, numberFrames, bufferList)`.  Same pre-deref of
 *      ioActionFlags @0xd37727 as step 2.
 *   5. Return the OSStatus captured in step 3.
 *
 * NOTE on the ioActionFlags deref: the .s reads `movl (%r12),%esi` where
 * `%r12` holds the reference `unsigned int&`.  This is a load of the u32
 * VALUE (not the address) as an argument to the monitor call.  In our JS
 * model we mirror this by reading `ioActionFlagsRef.value` at each hook
 * site — critical because the concrete Render may mutate the flags
 * between the pre- and post-hook, and BOTH hooks must observe the flag
 * value LIVE at the moment they fire (@0xd376de vs @0xd37727 are two
 * DIFFERENT loads separated by the render call).
 *
 * @0xd376ad..@0xd3773f (DoRender) / @0xd38e4d..@0xd38edf (RenderHelper)
 */
function FFAudioInputAdapter__renderBracket(
  self: FFAudioInputAdapter_Object,
  ioActionFlagsRef: { value: number },
  timeStamp: AudioTimeStamp,
  busNumber: number,
  numberFrames: number,
  bufferList: AudioBufferList,
): number {
  // Steps 1: the .s stack-copies the AudioTimeStamp into rbp-0x70..rbp-0x30
  // via four movups/movaps pairs (@0xd376ad..@0xd376c8) so downstream
  // callees receive a stable reference.  JS has no stack-copy analogue;
  // we hand the same `timeStamp` reference through unchanged, which
  // preserves the observable end-state for read-only consumers.

  // Step 2 — pre-hook.  Guard `monitor != null` (@0xd376d0) and
  // `monitor.inner != null` (@0xd376dc).
  const monitor = self.monitor;
  if (monitor !== null) {
    const inner = monitor.inner;
    if (inner !== null) {
      // @0xd376de — movl (%r12),%esi  reads the u32 VALUE of the flags.
      const flagsSnapshot = ioActionFlagsRef.value | 0;
      // @0xd376f2 — callq *0x10(%rax)
      inner.preRender(
        flagsSnapshot,
        timeStamp,
        busNumber | 0,
        numberFrames | 0,
        bufferList,
      );
    }
  }

  // Step 3 — dispatch the concrete Render via vtable[+0x38].
  // @0xd37710 (DoRender) / @0xd38eb0 (RenderHelper) — callq *0x38(%rax).
  // Return goes into ebx (@0xd37713 / @0xd38eb3).
  const status = self.render(
    ioActionFlagsRef,
    timeStamp,
    busNumber | 0,
    numberFrames | 0,
    bufferList,
  ) | 0;

  // Step 4 — post-hook.  Same guards as step 2, re-read to observe any
  // flag mutation the concrete Render performed.
  // @0xd37715 (monitor reload) / @0xd3771c (null-check) / @0xd37725 (inner null-check).
  const monitor2 = self.monitor;
  if (monitor2 !== null) {
    const inner2 = monitor2.inner;
    if (inner2 !== null) {
      // @0xd37727 — SECOND deref of the flags (separate load — Render
      // may have mutated the u32 through the ref).
      const flagsSnapshot2 = ioActionFlagsRef.value | 0;
      // @0xd3773c — callq *0x18(%rax)
      inner2.postRender(
        flagsSnapshot2,
        timeStamp,
        busNumber | 0,
        numberFrames | 0,
        bufferList,
      );
    }
  }

  // Step 5 — return the OSStatus captured in step 3.  @0xd3773f / @0xd38edf.
  return status | 0;
}

/**
 * `FFAudioInputAdapter::DoRender(unsigned int& ioActionFlags,
 *                                 AudioTimeStamp const& inTimeStamp,
 *                                 unsigned int busNumber,
 *                                 unsigned int numberFrames,
 *                                 AudioBufferList& ioData)`
 *
 * Symbol: __ZN19FFAudioInputAdapter8DoRenderERjRK14AudioTimeStampjjR15AudioBufferList
 * @0xd37690 (66-line body).  Vtable-bracket dispatch — see
 * `FFAudioInputAdapter__renderBracket` above for the full commentary.
 */
export function FFAudioInputAdapter_DoRender(
  self: FFAudioInputAdapter_Object,
  ioActionFlagsRef: { value: number },
  inTimeStamp: AudioTimeStamp,
  busNumber: number,
  numberFrames: number,
  ioData: AudioBufferList,
): number {
  // @0xd37690..@0xd3774f
  return FFAudioInputAdapter__renderBracket(
    self,
    ioActionFlagsRef,
    inTimeStamp,
    busNumber,
    numberFrames,
    ioData,
  );
}

/**
 * `FFAudioInputAdapter::RenderHelper(void* [unused-in-body],
 *                                     unsigned int* ioActionFlags,
 *                                     AudioTimeStamp const* inTimeStamp,
 *                                     unsigned int busNumber,
 *                                     unsigned int numberFrames,
 *                                     AudioBufferList* ioData)`
 *
 * Symbol: __ZN19FFAudioInputAdapter12RenderHelperEPvPjPK14AudioTimeStampjjP15AudioBufferList
 * @0xd38e30 (66-line body).  BYTE-FOR-BYTE structurally identical to
 * DoRender @0xd37690 — same prologue, same reg allocation, same vtable
 * slot offsets, same branches, same epilogue.  The only C++-level
 * difference is reference-vs-pointer argument types, which at the SysV
 * x86_64 ABI level land on the exact same register file.
 *
 * NOTE: on entry the .s reads `%rdi` as `this`; the C++ signature has
 * `void* [this-shadow]` as arg0 followed by the "real" this in some
 * other slot — actually, inspection of @0xd38e4a `movq %rdi,%r13` shows
 * the compiler DOES treat `%rdi` as the `this` pointer.  The C++
 * signature quoted in the mangled name is `(void*, uint*, ...)` because
 * this method is being called as a plain C callback in some places; the
 * compiler emitted it with an extra `void*` shadow that's discarded.
 * The body only ever uses `%rdi` and `%r12=%rsi` and the tail of the
 * arg list, matching the DoRender code path exactly.
 */
export function FFAudioInputAdapter_RenderHelper(
  self: FFAudioInputAdapter_Object,
  ioActionFlagsRef: { value: number },
  inTimeStamp: AudioTimeStamp,
  busNumber: number,
  numberFrames: number,
  ioData: AudioBufferList,
): number {
  // @0xd38e30..@0xd38eef
  return FFAudioInputAdapter__renderBracket(
    self,
    ioActionFlagsRef,
    inTimeStamp,
    busNumber,
    numberFrames,
    ioData,
  );
}

/**
 * `FFAudioInputAdapter::UpdateMaxPullFrames(unsigned int)`
 * Symbol: __ZN19FFAudioInputAdapter19UpdateMaxPullFramesEj @0xd3d550
 *
 * ```
 *   0xd3d550  pushq %rbp
 *   0xd3d551  movq  %rsp, %rbp
 *   0xd3d554  xorl  %eax, %eax         ; return 0 (OSStatus noErr)
 *   0xd3d556  popq  %rbp
 *   0xd3d557  retq
 * ```
 *
 * Default no-op: return 0.  Subclasses override to actually resize their
 * pull buffers.  Argument in `%edi` is discarded.
 */
export function FFAudioInputAdapter_UpdateMaxPullFrames(
  _self: FFAudioInputAdapter_Object,
  _maxPullFrames: number,
): number {
  // @0xd3d554 — xorl %eax,%eax
  return 0;
}

/**
 * `FFAudioInputAdapter::ChangeFormat(double, unsigned int)`
 * Symbol: __ZN19FFAudioInputAdapter12ChangeFormatEdj @0xd3d560
 *
 * ```
 *   0xd3d560  pushq %rbp
 *   0xd3d561  movq  %rsp, %rbp
 *   0xd3d564  xorl  %eax, %eax         ; return 0
 *   0xd3d566  popq  %rbp
 *   0xd3d567  retq
 * ```
 *
 * Default no-op: return 0.  The `double` (sample rate) in %xmm0 and the
 * `unsigned int` (channel count) in %edi are both discarded.  Subclasses
 * override to reconfigure their internal format state.
 */
export function FFAudioInputAdapter_ChangeFormat(
  _self: FFAudioInputAdapter_Object,
  _sampleRate: number,
  _channelCount: number,
): number {
  // @0xd3d564 — xorl %eax,%eax
  return 0;
}

/**
 * `FFAudioInputAdapter::SetStartTime(double)`
 * Symbol: __ZN19FFAudioInputAdapter12SetStartTimeEd @0xd3d570
 *
 * ```
 *   0xd3d570  pushq %rbp
 *   0xd3d571  movq  %rsp, %rbp
 *   0xd3d574  xorl  %eax, %eax         ; return 0
 *   0xd3d576  popq  %rbp
 *   0xd3d577  retq
 * ```
 *
 * Default no-op: return 0.  The `double` start time in %xmm0 is
 * discarded.  Subclasses override to seed their internal clock.
 */
export function FFAudioInputAdapter_SetStartTime(
  _self: FFAudioInputAdapter_Object,
  _startTime: number,
): number {
  // @0xd3d574 — xorl %eax,%eax
  return 0;
}

/**
 * `FFAudioInputAdapter::Start()`
 * Symbol: __ZN19FFAudioInputAdapter5StartEv @0xd3d580
 *
 * ```
 *   0xd3d580  pushq %rbp
 *   0xd3d581  movq  %rsp, %rbp
 *   0xd3d584  xorl  %eax, %eax         ; return 0
 *   0xd3d586  popq  %rbp
 *   0xd3d587  retq
 * ```
 *
 * Default no-op: return 0.  Subclasses override to actually spin up.
 */
export function FFAudioInputAdapter_Start(
  _self: FFAudioInputAdapter_Object,
): number {
  // @0xd3d584 — xorl %eax,%eax
  return 0;
}

/**
 * `FFAudioInputAdapter::Stop()`
 * Symbol: __ZN19FFAudioInputAdapter4StopEv @0xd3d590
 *
 * ```
 *   0xd3d590  pushq %rbp
 *   0xd3d591  movq  %rsp, %rbp
 *   0xd3d594  xorl  %eax, %eax         ; return 0
 *   0xd3d596  popq  %rbp
 *   0xd3d597  retq
 * ```
 *
 * Default no-op: return 0.  Subclasses override to actually spin down.
 */
export function FFAudioInputAdapter_Stop(
  _self: FFAudioInputAdapter_Object,
): number {
  // @0xd3d594 — xorl %eax,%eax
  return 0;
}
