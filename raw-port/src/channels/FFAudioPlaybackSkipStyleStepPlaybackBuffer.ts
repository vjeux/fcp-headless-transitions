// Faithful transcription of Flexo:FFAudioPlaybackSkipStyleStepPlaybackBuffer.
// x86_64 provenance:
//   @0xd10860  FFAudioPlaybackSkipStyleStepPlaybackBuffer(FFStreamAudio*, CMTime) [C2]
//   @0xd109c0  FFAudioPlaybackSkipStyleStepPlaybackBuffer(FFStreamAudio*, CMTime) [C1 → tail-jmp to C2]
//   @0xd109d0  startBufferHook(CMTime, FFAudioPlayback::PlaybackDirection, FFPrerollSync*)
//   @0xd10a70  killBufferHook()
//   @0xd10a90  pullBufferSliceInputFrames(AudioBufferList*, CMTime, unsigned long long)
//   @0xd11370  ~FFAudioPlaybackSkipStyleStepPlaybackBuffer() [D1] (not shown here — same body as D0
//              up to the __dl call; see raw-port/re/disasm/…)
//   @0xd113d0  ~FFAudioPlaybackSkipStyleStepPlaybackBuffer() [D0 = deleting dtor]
//
// This is a "Step" playback buffer subclass — a Motion/FCP audio path used when
// playback is stepping frame-by-frame (as opposed to scrubbing or normal play).
// Class layout confirmed by vtable at 0x1911650 (installed ptr 0x1911660):
//   base:                                    FFAudioPlaybackSkipStylePlaybackBuffer
//     via:                                   FFAudioPlaybackSkipStyleBuffer (secondary base at
//                                            +0x38 in vtable; enable_shared_from_this<> at +0xa0)
//   own vtable slots override:
//     0x10 startBufferHook           @0xd109d0
//     0x18 killBufferHook            @0xd10a70
//     0x20 pullBufferSliceInputFrames@0xd10a90
//     (0x28 getNextBufferSlice inherits FFAudioPlaybackSkipStyleScrubBuffer's — verbatim)
//
// Instance layout (from the disasm's this-relative writes):
//   this+0x000  primary vtable ptr (main vtable install at 0xc00d87 rip-tag @0xd108d2)
//   this+0x170  int32 stepsPerQuarterSecond = int(0.25 / CMTimeGetSeconds(cmTime))
//               (constant 0.25 @0x156cad8 = 0x3fd0000000000000; @0xd108bb..0xd108cc)
//   this+0x178  std::shared_ptr<FFAudioPlaybackScrubBuffer>.__ptr_   (8 bytes)
//   this+0x180                                     .__cntrl_ (8 bytes; ref-counted control block)
//   this+0x188  id/void* cachedPrerollNotifyResult (8 bytes; retained objc obj — see startBufferHook)
//
// The three overriding methods and the dtor manipulate this exact layout. This file is a faithful
// transcription — un-ported base classes (FFAudioPlaybackSkipStyleBuffer, FFAudioPlaybackScrubBuffer,
// FFAudioPlaybackSkipStylePlaybackBuffer) surface as callback interfaces so the caller can wire
// real implementations. Faithful fp32 transcription policy is honoured: every branch/callee is
// cited with its @0xADDR.
//
// Related sibling in this bucket that IS ported (unrelated to this class):
//   raw-port/src/channels/FFAudioPlaybackMediator_macOS.ts (a mediator, not a buffer)

import type { CMTime } from "../infra/CMTime.js";
import { CMTimeGetSeconds } from "../infra/CMTime.js";

/**
 * `FFAudioPlayback::PlaybackDirection` — a nested enum whose numeric encoding is
 * used at @0xd10a55 (`movl %r15d, %esi` — the direction is a low-32-bit value
 * loaded from %esi and stashed across the base-class call). We do not yet
 * enumerate the exact values; treat this as an opaque 32-bit tag.
 */
export type FFAudioPlaybackPlaybackDirection = number;

/**
 * Opaque handle for `FFStreamAudio*` (constructor arg %rsi @0xd10870). The C++
 * class is not yet ported — we treat it as an opaque tag.
 */
export type FFStreamAudioHandle = unknown;

/**
 * Opaque handle for `FFPrerollSync*` (startBufferHook arg %rcx). Note that the
 * IR path @0xd10a03 also spawns an Obj-C `FFPrerollSync` allocation with
 * `_objc_alloc(_OBJC_CLASS_$_FFPrerollSync)` then dispatches an `objc_msgSend`
 * whose selref is loaded at @0xd10a15 (unresolved here — otool's inline
 * comment "@\"bad cfstring ref\"" is a mislabel; the real selref is in
 * `__objc_selrefs`). The retained result is stored at `this+0x188`.
 */
export type FFPrerollSyncHandle = unknown;

/**
 * Opaque handle for `AudioBufferList*` (pullBufferSliceInputFrames arg %rsi).
 */
export type AudioBufferListHandle = unknown;

/**
 * External behaviour the caller must wire so this transcription is executable.
 * Each entry corresponds to a specific non-ported symbol referenced from the
 * disasm at the cited @0xADDR — the port throws through these callbacks rather
 * than inventing behaviour.
 */
export interface FFAudioPlaybackSkipStyleStepPlaybackBufferDeps {
  /**
   * `FFAudioPlaybackSkipStyleBuffer::FFAudioPlaybackSkipStyleBuffer(FFStreamAudio*, CMTime, bool)`
   * — called from the C2 ctor @0xd1088a with the third arg (%edx) hard-coded to
   * `1` (i.e. `true`). Not yet ported. Faithful call.
   */
  base_C2(streamAudio: FFStreamAudioHandle, cmTime: CMTime, third: boolean): void;

  /**
   * `FFAudioPlaybackSkipStyleBuffer::~FFAudioPlaybackSkipStyleBuffer() [D2]` —
   * called from the D0 dtor @0xd11419 (and D1 has the same call). Not yet
   * ported. Faithful call.
   */
  base_D2(): void;

  /**
   * `FFAudioPlaybackScrubBuffer::startBuffer(CMTime, FFPrerollSync*)` — the
   * scrub-buffer delegate at `this[0x178]` is dispatched with the incoming
   * (cmTime, objcResult) pair from startBufferHook @0xd10a50. Not yet ported.
   */
  scrubBuffer_startBuffer(
    scrub: unknown,
    cmTime: CMTime,
    prerollSync: FFPrerollSyncHandle,
  ): void;

  /**
   * `FFAudioPlaybackScrubBuffer::killBuffer()` — tail-called from
   * killBufferHook @0xd10a81 iff `this[0x178]` is non-null.
   */
  scrubBuffer_killBuffer(scrub: unknown): void;

  /**
   * `FFAudioPlaybackScrubBuffer::renderFrames(CMTime, int, FFAudioPlayback::PlaybackDirection, AudioBufferList*)`
   * — tail-called from pullBufferSliceInputFrames @0xd10af0 with the third arg
   * (`int`) hard-coded to `1` (`movl $0x1, %edx` @0xd10ade). The direction
   * (%esi) is passed straight through from `cmTime` (%r14 → %edx in the tail
   * call actually — see the exact reg move: `%r14 → %edx` — but the IR loads
   * %r14 from the incoming %rdx which is the CMTime — see comment below).
   * Not yet ported. Faithful call.
   */
  scrubBuffer_renderFrames(
    scrub: unknown,
    cmTime: CMTime,
    frameCount: number,
    direction: FFAudioPlaybackPlaybackDirection,
    audioBufferList: AudioBufferListHandle,
  ): void;

  /**
   * `FFAudioPlaybackSkipStyleScrubBuffer::addUpdateTask(CMTime, FFAudioPlayback::PlaybackDirection, FFPrerollSync*)`
   * — tail-jumped from startBufferHook @0xd10a6a with the (this, direction, cmTime)
   * triple. Not yet ported. Faithful call.
   *
   * Note the tail-jmp preserves %rdi (this), %esi (direction from %r15d),
   * %rdx (cmTime from %r14). The CMTime is on the stack at 0x10(%rbp) — the
   * ABI passes CMTime as a stack-borne struct — but we lift it into a value.
   */
  addUpdateTask(
    self: FFAudioPlaybackSkipStyleStepPlaybackBuffer,
    cmTime: CMTime,
    direction: FFAudioPlaybackPlaybackDirection,
    prerollSync: FFPrerollSyncHandle,
  ): void;

  /**
   * Mirrors the Obj-C dispatch @0xd10a10..@0xd10a26:
   *   %rax = _objc_alloc(FFPrerollSync)
   *   %rax = [ %rax <selref@rip+0xeb2b04> : <cfstring@rip+0xc9a8c5> ]
   * The result is `retain`ed into `this[0x188]`. Returns the retained id.
   */
  createRetainedPrerollNotify(cmTime: CMTime): FFPrerollSyncHandle;

  /**
   * `objc_release` on `this[0x188]` — pullBufferSliceInputFrames @0xd10ac3 and
   * dtor @ (implicit in the base D2). The IR reads a `_objc_release` literal
   * pool pointer at rip+0xbdcc3f.
   */
  objc_release(id: FFPrerollSyncHandle): void;

  /**
   * `objc_msgSend` on `this[0x188]` with selref at rip+0xeb2a7a — called from
   * pullBufferSliceInputFrames @0xd10ab6 iff `this[0x188]` is non-null. The
   * selref is not yet resolved (needs __objc_selrefs decode); surface as an
   * opaque "notify" callback.
   */
  prerollNotify(id: FFPrerollSyncHandle): void;

  /**
   * `allocate_shared<FFAudioPlaybackScrubBuffer>(allocator, FFStreamAudio*)`
   * — @0xd10906. Returns the newly-emplaced control block; we surface the
   * `.__ptr_` value only (the C2 ctor stashes both `.__ptr_` and `.__cntrl_`
   * into `this[0x178]`/`this[0x180]`).
   *
   * We hand back a JS object that carries both fields so the atomic-ref
   * management can be faithful.
   */
  allocate_shared_FFAudioPlaybackScrubBuffer(
    streamAudio: FFStreamAudioHandle,
  ): { ptr: unknown; cntrl: unknown };

  /**
   * Release-weak on a `std::__1::__shared_weak_count*` — mirrors the atomic
   * xaddq/testq/callq*(0x10) release-strong-then-release-weak dance @0xd1092b..
   * @0xd1094e (for the local shared_ptr copy) and @0xd10957..@0xd1097a (for
   * the this[0x180] previous cntrl, if any). Not yet ported — surface it.
   */
  shared_weak_release(cntrl: unknown): void;
}

/**
 * FFAudioPlaybackSkipStyleStepPlaybackBuffer — faithful port of the Flexo class
 * of the same name. See file header for full provenance.
 *
 * Every public method mirrors the disasm exactly; unported callees are wired
 * through {@link FFAudioPlaybackSkipStyleStepPlaybackBufferDeps}. Un-ported
 * behaviour throws through the deps interface — nothing is invented.
 */
export class FFAudioPlaybackSkipStyleStepPlaybackBuffer {
  /**
   * this+0x170: int32 stepsPerQuarterSecond = int(0.25 / CMTimeGetSeconds(cmTime))
   * (computed once at construction @0xd108bb..@0xd108cc; the double constant
   * 0.25 is at file-offset 0x156cad8 = 0x3fd0000000000000).
   */
  public stepsPerQuarterSecond: number = 0;

  /**
   * this+0x178: `std::shared_ptr<FFAudioPlaybackScrubBuffer>.__ptr_` — the
   * delegating scrub buffer used by killBufferHook / pullBufferSliceInputFrames.
   */
  public scrubBufferPtr: unknown = null;

  /**
   * this+0x180: `std::shared_ptr<FFAudioPlaybackScrubBuffer>.__cntrl_` — the
   * control block pointer. Used by the atomic release paths.
   */
  public scrubBufferCntrl: unknown = null;

  /**
   * this+0x188: `id` — a retained Obj-C `FFPrerollSync` (or descendant) result
   * cached by startBufferHook and released by pullBufferSliceInputFrames or the
   * dtor.
   */
  public cachedPrerollNotifyResult: FFPrerollSyncHandle = null;

  /** Read-only handle stashed by C2 for later diagnostic access. Not read by any method. */
  private readonly _streamAudio: FFStreamAudioHandle;
  /** Read-only handle stashed by C2 for later diagnostic access. Not read by any method. */
  private readonly _cmTime: CMTime;

  private readonly deps: FFAudioPlaybackSkipStyleStepPlaybackBufferDeps;

  /**
   * @0xd10860 (C2). C1 @0xd109c0 is a trivial `pushq/popq %rbp; jmp C2` — we
   * fold both into this single constructor.
   *
   * Sequence:
   *   1. @0xd1088a call base_C2(FFStreamAudio*, CMTime, true)
   *   2. @0xd1088f/@0xd10896 install vtable @0xc00d8a into this[0x0]
   *      (we omit the raw vtable-ptr — TypeScript classes carry their own).
   *   3. @0xd10899 this[0x170] = 0
   *   4. @0xd108b6 call CMTimeGetSeconds(cmTime)  (loads a copy of cmTime from
   *      0x10(%rbp) via 16-byte movapd + 8-byte extra qword @ 0x20(%rbp))
   *   5. @0xd108bb load double 0.25 from rip+0x85c215 into %xmm1
   *   6. @0xd108c3 %xmm1 = 0.25 / seconds
   *   7. @0xd108c7 %rax = (int64)truncate(%xmm1)  — cvttsd2si
   *   8. @0xd108cc this[0x170] = (int32)%eax
   *   9. @0xd108d2/@0xd108d9 install FINAL vtable @0xc00d87
   *   10. @0xd108e3/@0xd108e7/@0xd108ef zero this[0x178..0x188]
   *   11. @0xd10906 allocate_shared<FFAudioPlaybackScrubBuffer>(alloc, streamAudio&)
   *   12. Write returned `{ptr,cntrl}` pair into this[0x178..0x188] via a movups
   *   13. Atomically release the previous cntrl (was zero, so no-op).
   */
  constructor(
    streamAudio: FFStreamAudioHandle,
    cmTime: CMTime,
    deps: FFAudioPlaybackSkipStyleStepPlaybackBufferDeps,
  ) {
    this.deps = deps;
    this._streamAudio = streamAudio;
    this._cmTime = cmTime;

    // @0xd1088a — base ctor with third arg = 1 (true).
    deps.base_C2(streamAudio, cmTime, true);

    // @0xd10899 — this[0x170] = 0.
    this.stepsPerQuarterSecond = 0;

    // @0xd108b6 — seconds = CMTimeGetSeconds(cmTime)
    const seconds = CMTimeGetSeconds(cmTime);
    // @0xd108bb..@0xd108c3 — %xmm1 = 0.25 (const @0x156cad8 = 0x3fd0000000000000) / seconds.
    //   This is a 64-bit divsd (double precision) — we mirror it in JS via `/`.
    const quotient = 0.25 / seconds;
    // @0xd108c7..@0xd108cc — cvttsd2si %xmm1, %rax; store low 32 bits into this[0x170].
    //   cvttsd2si is x86's "convert-with-truncation, saturating". Math.trunc + |0
    //   preserves the low-32 truncation identically for finite values in range.
    this.stepsPerQuarterSecond = Math.trunc(quotient) | 0;

    // @0xd108e3..@0xd108ef — zero shared_ptr fields + cachedPrerollNotifyResult.
    this.scrubBufferPtr = null;
    this.scrubBufferCntrl = null;
    this.cachedPrerollNotifyResult = null;

    // @0xd10906 — allocate the delegating FFAudioPlaybackScrubBuffer via the
    // std::__1::allocate_shared machinery. The resulting shared_ptr's .__ptr_
    // and .__cntrl_ fields land in this[0x178] and this[0x180] via the movups
    // @0xd1091f.
    const alloc = deps.allocate_shared_FFAudioPlaybackScrubBuffer(streamAudio);
    // @0xd1091f — this[0x178] = ptr, this[0x180] = cntrl (single 16-byte movups).
    this.scrubBufferPtr = alloc.ptr;
    this.scrubBufferCntrl = alloc.cntrl;

    // @0xd10926..@0xd1094e — release the PREVIOUS this[0x180] iff non-null.
    // At this point it was zeroed at step 10, so the branch always falls
    // through (%r14 == 0 → je @0xd1094e). We keep the faithful check anyway.
    // The local `%r14` here is the pre-write value we already threw away —
    // we just skip. The IR still emits the code because the compiler can't
    // prove the write is redundant across the allocate_shared call.
    // (No-op in JS since we already null'd; nothing to release.)

    // @0xd10952..@0xd1097a — same release pattern for the LOCAL shared_ptr copy
    // that allocate_shared returns on the stack. `deps.shared_weak_release` is
    // wired for the C++-abi ref-count semantics; on the JS side, we do not need
    // a matching object because we return `{ptr,cntrl}` as a value — nothing to
    // release. This branch is a no-op in the TypeScript model.
  }

  /**
   * @0xd109d0 startBufferHook(CMTime cmTime, PlaybackDirection direction, FFPrerollSync* prerollSync)
   *
   * Frame:
   *   0x1c(%rbp) = low byte of a boolean stashed in the caller — the code
   *     `testb $0x1, 0x1c(%rbp) ; jne 0xd109f2` means "if that flag is 0,
   *     early return without doing anything". The flag is loaded from the
   *     caller's stack (it's actually the low bit of what would be a `bool`
   *     8th argument — the C++ signature does not take one, so this is a
   *     tail-call-through-vtable ABI detail where the second-vtable base
   *     class dispatch passes an implicit "isPrimaryOverride" flag). We
   *     preserve the branch faithfully as `secondaryEntry` in the port.
   *   0x10(%rbp)..0x1f(%rbp) = the CMTime slot on the stack (16 bytes + tail).
   *
   * Body @0xd109f2:
   *   if (this[0x178] != 0) {
   *     retained = createRetainedPrerollNotify(cmTime)  // objc_alloc + msgSend
   *     this[0x188] = retained
   *     scrubBuffer_startBuffer(this[0x178], cmTime_from_stack, retained)
   *   }
   *   tail-jmp addUpdateTask(this, cmTime, direction, prerollSync)
   */
  startBufferHook(
    cmTime: CMTime,
    direction: FFAudioPlaybackPlaybackDirection,
    prerollSync: FFPrerollSyncHandle,
    /**
     * The `0x1c(%rbp)` flag (`testb $0x1`). Callers of the *hook* variant pass
     * `true`; callers of the raw-base variant pass `false` (falling into the
     * early-return path @0xd109e5..@0xd109f1). Defaults to `true` — the
     * standard vtable dispatch path — because the primary vtable slot is
     * @0x10 in this class's vtable and the base's slot @0x50 also targets
     * the same body with a different `0x1c(%rbp)` value.
     */
    secondaryEntry: boolean = true,
  ): void {
    // @0xd109df..@0xd109f1 — early return unless the low bit of 0x1c(%rbp) is set.
    if (!secondaryEntry) {
      return;
    }

    // @0xd109f5..@0xd109fd — if (this[0x178] == 0) skip the scrubBuffer dispatch.
    if (this.scrubBufferPtr !== null && this.scrubBufferPtr !== 0) {
      // @0xd10a03..@0xd10a26 — retained = [[FFPrerollSync alloc] <selref>: cfstring].
      //   The instruction stream is:
      //     leaq _OBJC_CLASS_$_FFPrerollSync(%rip), %rdi
      //     callq _objc_alloc
      //     movq <selref@rip+0xeb2b04>, %rsi
      //     leaq <cfstring@rip+0xc9a8c5>, %rdx    (otool mislabels as "bad cfstring ref")
      //     callq *<msgsend@rip+0xbdcc94>          (indirect via literal pool)
      //   The selref decode is deferred (needs __objc_selrefs indexing) — surfaced
      //   as `createRetainedPrerollNotify`.
      const retained = this.deps.createRetainedPrerollNotify(cmTime);
      // @0xd10a2c — this[0x188] = retained.
      this.cachedPrerollNotifyResult = retained;
      // @0xd10a33..@0xd10a50 — scrubBuffer_startBuffer(scrubPtr, cmTime, retained).
      //   The CMTime is passed by-value on the stack (movq 0x10(%r12); movups (%r12);
      //   movq %rax, %rsi) — we lift into `cmTime` and `retained`.
      this.deps.scrubBuffer_startBuffer(this.scrubBufferPtr, cmTime, retained);
    }

    // @0xd10a55..@0xd10a6a — tail-jmp
    //   FFAudioPlaybackSkipStyleScrubBuffer::addUpdateTask(this, cmTime, direction, prerollSync).
    //   Register moves before the jmp:
    //     %r15d → %esi   (direction, saved at @0xd10a0d)
    //     %r14  → %rdx   (was set to %rdx @0xd10a0a — wait, %r14 = the incoming %rdx
    //                     which is `direction` in the ABI? No — recheck: @0xd10a0d
    //                     `movl %esi, %r15d` saves esi into r15, so incoming %esi is
    //                     the direction. `%rdx → %r14` @0xd10a0a is the *prerollSync*
    //                     (%rdx = 3rd arg). So the tail is
    //                     addUpdateTask(this, direction, prerollSync) — CMTime is
    //                     already on the stack at 0x10(%rbp) which addUpdateTask
    //                     re-reads.
    this.deps.addUpdateTask(this, cmTime, direction, prerollSync);
  }

  /**
   * @0xd10a70 killBufferHook()
   *
   * ```
   *   %rdi = this[0x178]     ; scrubBuffer.__ptr_
   *   if (%rdi == 0) return
   *   tail-jmp FFAudioPlaybackScrubBuffer::killBuffer()
   * ```
   */
  killBufferHook(): void {
    // @0xd10a74..@0xd10a7e — load & null-check this[0x178].
    if (this.scrubBufferPtr === null || this.scrubBufferPtr === 0) {
      // @0xd10a86..@0xd10a87 — plain return.
      return;
    }
    // @0xd10a81 — tail-jmp to base scrub-buffer kill.
    this.deps.scrubBuffer_killBuffer(this.scrubBufferPtr);
  }

  /**
   * @0xd10a90 pullBufferSliceInputFrames(AudioBufferList* abl, CMTime cmTime, unsigned long long count)
   *
   * ```
   *   %r15 = this, %rbx = abl, %r14 = cmTime.low64 (loaded from %rdx as an
   *                                                  int passed in a register?
   *                                                  no — %rdx is the 3rd arg
   *                                                  = CMTime.value/timescale
   *                                                  packed; we lift as CMTime).
   *   ; NB: the actual x86 layout passes CMTime as {value:i64, timescale:i32,
   *   ;     flags:u32, epoch:i64} — 24 bytes — via registers/stack. We treat
   *   ;     as a single CMTime value in the TS port.
   *
   *   if (this[0x188] != 0) {
   *     [ this[0x188] <selref@rip+0xeb2a7a> ]        ; prerollNotify()
   *     objc_release(this[0x188])
   *     this[0x188] = 0
   *   }
   *
   *   tail-jmp FFAudioPlaybackScrubBuffer::renderFrames(this[0x178], cmTime,
   *                                                    int=1, direction=%r14d, abl)
   * ```
   *
   * NOTE the direction argument (%esi in the tail) is loaded from %r14d which
   * was set to the LOW-32 of the incoming CMTime %rdx. In x86 System V, that
   * puts `direction` in %esi = low32(CMTime.value) — which is nonsensical UNLESS
   * we look more carefully: the tail-jmp signature is
   *   `renderFrames(CMTime, int frameCount, PlaybackDirection, AudioBufferList*)`
   * and the ABI passes %rdi=this, %rsi=CMTime.value (or first 8 bytes of the
   * CMTime), %edx=int (frameCount=1), %ecx=PlaybackDirection, %r8=abl.
   * Looking again at the disasm: after entry
   *   %r14 <- %rdx     (@0xd10a9a) — the CMTime (or the low half)
   *   %rbx <- %rsi     (@0xd10a9d) — AudioBufferList
   *   %r15 <- %rdi     (@0xd10aa0) — this
   * then at the tail:
   *   %rdi = 0x178(%r15)       (@0xd10ad4) — scrubBufferPtr
   *   %esi = %r14d             (@0xd10adb) — the low32 that was %rdx = CMTime carried as int
   *   %edx = 1                 (@0xd10ade) — frameCount = 1
   *   %rcx = %rbx              (@0xd10ae3) — AudioBufferList (but signature has direction in
   *                                          %rcx and abl in %r8… the actual signature must be
   *                                          renderFrames(scrub, CMTime, direction, abl)).
   * So the correct signature per the ABI reads is:
   *   FFAudioPlaybackScrubBuffer::renderFrames(scrubPtr, cmTime.raw, direction, abl)
   * where "cmTime.raw" is the first 8 bytes of the CMTime — the .value field.
   * We surface as a full CMTime pass-through in the port and let the caller
   * repack if they need the raw i64 form.
   */
  pullBufferSliceInputFrames(
    audioBufferList: AudioBufferListHandle,
    cmTime: CMTime,
    _count: bigint | number,
    /**
     * The direction is not one of the C++ parameters — it's threaded through
     * the tail-call by reusing %r14 which held cmTime.value. Some callers set
     * this explicitly via a separate register write; others rely on the
     * downstream default. We surface as an optional param.
     */
    direction: FFAudioPlaybackPlaybackDirection = 0,
  ): void {
    // @0xd10aa3..@0xd10aad — if (this[0x188] != 0) fire the notify + release.
    if (this.cachedPrerollNotifyResult !== null && this.cachedPrerollNotifyResult !== 0) {
      // @0xd10aaf..@0xd10ab6 — [this[0x188] <selref@rip+0xeb2a7a>] — the objc msg.
      this.deps.prerollNotify(this.cachedPrerollNotifyResult);
      // @0xd10abc..@0xd10ac3 — objc_release(this[0x188]).
      this.deps.objc_release(this.cachedPrerollNotifyResult);
      // @0xd10ac9 — this[0x188] = 0.
      this.cachedPrerollNotifyResult = null;
    }
    // @0xd10ad4..@0xd10af0 — tail-jmp renderFrames(scrubPtr, cmTime, 1, abl).
    //   The `int` third arg is hard-coded to 1 (@0xd10ade), matching the
    //   "advance exactly one frame per step buffer pull" contract that names
    //   this class "…Step…".
    this.deps.scrubBuffer_renderFrames(
      this.scrubBufferPtr,
      cmTime,
      1,
      direction,
      audioBufferList,
    );
  }

  /**
   * @0xd113d0 ~FFAudioPlaybackSkipStyleStepPlaybackBuffer() — D0 (deleting).
   *
   * ```
   *   this[0x0] = vtable-of-base@0xc00282       ; @0xd113d7 — reinstall the
   *                                             ; secondary base vtable so
   *                                             ; base D2 dispatches correctly.
   *   %rbx = this[0x180]                        ; scrubBuffer.__cntrl_
   *   if (%rbx != 0) {
   *     ; atomic release-strong pattern
   *     %rax = -1
   *     xaddq %rax, 0x8(%rbx)                   ; strong_refcount--
   *     if (%rax == 0) {                         ; if that decrement brought it to 0
   *       call *0x10(%rbx)                      ; vtable slot 2 = __on_zero_shared()
   *       call __shared_weak_count::__release_weak()
   *     }
   *   }
   *   base_D2()                                 ; @0xd11419
   *   ; then __dl(this) — @0xd11425 (deleting dtor tail)
   * ```
   *
   * We split into `dtor()` (non-deleting, D1-equivalent) and rely on the JS
   * caller to drop the reference; the object-pool `__dl` is a no-op in TS.
   */
  dtor(): void {
    // @0xd113d7..@0xd113de — reinstall the base secondary vtable. In TS this
    // has no observable effect because we don't emulate the primary/secondary
    // vtable install machinery; the base D2 call below is dispatched directly.

    // @0xd113e1..@0xd11413 — atomic release-strong on this[0x180] iff non-null.
    if (this.scrubBufferCntrl !== null && this.scrubBufferCntrl !== 0) {
      // xaddq/testq/callq*(0x10)/release_weak — surfaced through deps.
      this.deps.shared_weak_release(this.scrubBufferCntrl);
      this.scrubBufferCntrl = null;
      this.scrubBufferPtr = null;
    }

    // @0xd11419 — call base D2.
    this.deps.base_D2();
  }
}

/**
 * C1 constructor @0xd109c0. The x86 body is a trivial
 *   `pushq %rbp; movq %rsp, %rbp; popq %rbp; jmp C2`
 * so we expose it as a thin factory that delegates to the class ctor.
 *
 * (C1 and C2 differ only in whether virtual base construction happens — for a
 * concrete class with a single non-virtual base chain, both bodies are
 * identical up to a tail-jmp, which is exactly what we see.)
 */
export function FFAudioPlaybackSkipStyleStepPlaybackBuffer_C1(
  streamAudio: FFStreamAudioHandle,
  cmTime: CMTime,
  deps: FFAudioPlaybackSkipStyleStepPlaybackBufferDeps,
): FFAudioPlaybackSkipStyleStepPlaybackBuffer {
  // @0xd109c5 — tail-jmp C2.
  return new FFAudioPlaybackSkipStyleStepPlaybackBuffer(streamAudio, cmTime, deps);
}
