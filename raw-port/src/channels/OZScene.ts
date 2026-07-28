// OZScene.ts — raw transcription of the FCP `OZScene` class (frontier decode).
//
// This is the third piece of the OZ*Undo Swap() shared surface (after
// OZApplication::getCurrentDoc() → OZDocument scene slot at +0x08). Every
// scene-based undo (OZSceneGamutUndo, OZSceneRangeUndo, OZSceneSettingsUndo,
// OZOverrideFCPColorSpaceUndo (partial), OZLastModifiedChannelsUndo, …) reads
// or writes one of the small accessors decoded below.
//
// OZScene has 365 methods; only the SIX getter/setter pairs required by the
// landed OZ*Undo family are transcribed here. The remaining ~359 methods are
// frontier — a dedicated worktree per subsystem is required. Every stub in
// this file cites its @Ozone 0xADDR so the demand signal is filed.
//
// Ozone x86_64 addresses in this file (see /raw-port/re/disasm/OZScene.*.s):
//   __ZN7OZSceneC2EP10OZDocument                                      @0x4cc00  (C2)
//   __ZN7OZSceneC1EP10OZDocument                                      @0x4d720  (C1 — thunk)
//   __ZNK7OZScene7getNodeEj                                           @0x4f9a0  ← CORE
//   __ZN7OZScene12setTimeRangeERK11PCTimeRange                        @0x4fa10  ← CORE
//   __ZNK7OZScene12getPlayRangeEv                                     @0x4fb10  ← CORE
//   __ZN7OZScene12setPlayRangeERK11PCTimeRange                        @0x4fb30  ← CORE
//   __ZNK7OZScene27dynamicRangeTrackingEnabledEv                      @0x62db0  ← CORE
//   __ZN7OZScene34updateColorChannelsForWorkingGamutE19PCWorkingGamutValuebP15OZChannelFolder
//                                                                      @0x62bc0  ← FRONTIER (heavy)
//   __ZNK7OZScene18getRawWorkingGamutEv                               @0x81da0  ← CORE
//   __ZN7OZScene18setRawWorkingGamutE19PCWorkingGamutValue             @0x81de0  ← CORE
//   __ZN7OZScene30setDynamicRangeTrackingEnabledEb                    @0x81ed0  ← CORE
//
// ============================================================================
//  STRUCT LAYOUT (partial — only what's touched by the core surface)
// ============================================================================
//  +0x00   vtable ptr           installed by ctor @0x4cc00 (frontier — not decoded here).
//  +0x08   parentDoc : OZDocument*  set by ctor from its OZDocument* arg (see
//                                OZDocument+0x08 slot — the two point at each other).
//                                Also referenced as scene[+0x8] in some sub-decodes.
//  +0x20   playRangeVariantSelector : u32
//                                Compared against -1 (0xffffffff) at
//                                getPlayRange @0x4fb1b and setPlayRange @0x4fb34.
//                                Value == -1  → the "primary" PCTimeRange lives at +0x4b0.
//                                Value != -1  → the "secondary" PCTimeRange lives at +0x4e0.
//                                Purpose (which sub-range is currently active) not
//                                yet fully decoded — kept as an opaque u32 with the
//                                two documented branches.
//  +0x28   sharedMutex : PCSharedMutex
//                                Locked shared @0x81db1 in getRawWorkingGamut,
//                                locked exclusive @0x81df7 in setRawWorkingGamut.
//                                Size (0x28..0x90) = 0x68 bytes.
//                                (Frontier — PCSharedMutex not ported.)
//  +0x90   settings : OZSceneSettings (embedded — NOT a pointer)
//                                dynamicRangeTrackingEnabled tail-calls
//                                OZSceneSettings::dynamicRangeTrackingEnabled
//                                @0x62dbc after `addq $0x90,%rdi`. Similarly
//                                setDynamicRangeTrackingEnabled tail-calls
//                                @0x81edc, and setRawWorkingGamut forwards to
//                                OZSceneSettings::setRawWorkingGamut @0x81e09
//                                after adding 0x90.
//                                (Frontier — full OZSceneSettings layout not
//                                 decoded; only the tail-call is preserved.)
//  +0xa0   playbackFrameCount : u32
//                                Written by setTimeRange @0x4fae2 (from
//                                CMTimeGetSeconds of range/frameDuration) or 1
//                                on non-numeric range @0x4faf6. Read by other
//                                scene subsystems (frontier — not exposed here).
//  +0xb0   playbackDuration : f64
//                                Read at setTimeRange @0x4fa50 as the "gate"
//                                (must be > 0 to enter the frame-count refresh
//                                path). Frontier for writers.
//  +0xc8   rawWorkingGamutCache : u32
//                                Read by getRawWorkingGamut inside the shared
//                                lock (`movl 0xc8(%rbx),%ebx` @0x81db6). Set by
//                                OZSceneSettings::setRawWorkingGamut via the
//                                embedded-settings tail-call @0x81e09.
//                                NB: this is a CACHE — the source of truth lives
//                                inside OZSceneSettings@+0x90.
//  +0x440  nodeMap : OZScene::OZNodeMap
//                                getNode(u32) forwards to
//                                OZNodeMap::operator[](u32) @0x4f9ab after
//                                `addq $0x440,%rdi`. Then dynamic_casts the
//                                result from OZObjectManipulator (source typeinfo
//                                @0x4f9b5) to OZSceneNode (dest typeinfo @0x4f9bc)
//                                with offset hint $0x10 @0x4f9c3.
//                                (Frontier — OZNodeMap not ported.)
//  +0x480  timeRange : PCTimeRange  (0x30 bytes)
//                                Written by setTimeRange @0x4fa2c-@0x4fa49 as a
//                                full 3×qword + 16-byte block copy from src:
//                                  movq (src+0x10),*(this+0x490)      # [inner qword]
//                                  movups (src),xmm0 ; movups %xmm0,(this+0x480) # [xmm0]
//                                  movq (src+0x28),*(this+0x4a8)
//                                  movups (src+0x18),xmm0 ; movups %xmm0,(this+0x498)
//                                Same layout used at +0x4b0 and +0x4e0 → PCTimeRange
//                                is a 0x30-byte value type (16+8+16 = 40 bytes with
//                                pad? — recovered as { 0x00: xmm0 (16B) , 0x10: qword ,
//                                0x18: xmm0 (16B) , 0x28: qword } — total 0x30).
//  +0x4b0  playRangePrimary : PCTimeRange  (0x30 bytes)
//                                setPlayRange copies here when +0x20 == -1
//                                (@0x4fb6c ; source-offset delta $0x4c8 vs $0x4f8
//                                encodes the paired-slot layout for the second
//                                write burst).
//  +0x4e0  playRangeSecondary : PCTimeRange (0x30 bytes)
//                                setPlayRange copies here when +0x20 != -1
//                                (@0x4fb3a). Same 3×qword + 16B pattern.
//
// ============================================================================
//  PCTimeRange (0x30-byte value type — recovered from the copy patterns above)
// ============================================================================
//  From setTimeRange @0x4fa2c-@0x4fa49 and setPlayRange @0x4fb46-@0x4fb66:
//    +0x00  16 bytes (xmm0 pair)  — likely (start.timeValue:i64, start.timescale:i32, start.flags:i32)
//                                    packed as CMTime = 16B; keeping as opaque.
//    +0x10  8 bytes (qword)       — likely start.epoch or unused padding.
//    +0x18  16 bytes (xmm0 pair)  — likely (duration.timeValue, duration.timescale, duration.flags).
//    +0x28  8 bytes (qword)       — likely duration.epoch or padding.
//  Total 0x30 bytes = 2×(CMTime = 24B) with 2×padding qwords in the middle/tail;
//  the exact CMTime binding is FRONTIER (PCTimeRange full layout not decoded).
//  Modelled here as an opaque 48-byte handle.

// -----------------------------------------------------------------------------
//  Opaque handles for the frontier types referenced by decoded methods.
// -----------------------------------------------------------------------------

/** OZDocument opaque — see OZDocument.ts for the landed frontier port. */
export interface OZDocumentHandle {
  readonly __ozDocument: true;
}

/** OZSceneSettings opaque — embedded at OZScene+0x90; full port frontier. */
export interface OZSceneSettingsHandle {
  readonly __ozSceneSettings: true;
  /** Tail-called by OZScene::dynamicRangeTrackingEnabled @0x62dbc. */
  dynamicRangeTrackingEnabled(): boolean;
  /** Tail-called by OZScene::setDynamicRangeTrackingEnabled @0x81edc. */
  setDynamicRangeTrackingEnabled(v: boolean): void;
  /** Tail-called by OZScene::setRawWorkingGamut @0x81e09. */
  setRawWorkingGamut(v: PCWorkingGamutValue): void;
}

/** PCTimeRange opaque — 0x30-byte value type (see layout comment). */
export interface PCTimeRangeHandle {
  readonly __pcTimeRange: true;
}

/** PCSharedMutex opaque — non-recursive read/write lock (frontier). */
export interface PCSharedMutexHandle {
  readonly __pcSharedMutex: true;
  lock_shared(): void; // @stub 0x6ddafa
  unlock_shared(): void; // @stub 0x6ddb00
  lock(): void; // @stub 0x6ddb06
  unlock(): void; // @stub 0x6ddb0c
}

/** PCWorkingGamutValue — 32-bit enum passed by value. Opaque u32 here. */
export type PCWorkingGamutValue = number;

/** OZSceneNode opaque — return type of getNode() after dynamic_cast. */
export interface OZSceneNodeHandle {
  readonly __ozSceneNode: true;
}

/** OZChannelFolder opaque — arg to updateColorChannelsForWorkingGamut. */
export interface OZChannelFolderHandle {
  readonly __ozChannelFolder: true;
}

// -----------------------------------------------------------------------------
//  OZScene class
// -----------------------------------------------------------------------------

export class OZScene {
  /**
   * +0x08 — parentDoc : OZDocument*
   * Set by ctor @0x4cc00 (frontier — decode of full ctor not landed here).
   */
  parentDoc: OZDocumentHandle | null = null;

  /**
   * +0x20 — playRangeVariantSelector : u32
   * See struct-layout header. Kept as u32; the -1 sentinel is preserved by
   * storing 0xffffffff (>>>0) when applicable.
   */
  playRangeVariantSelector: number = 0;

  /**
   * +0x28 — sharedMutex : PCSharedMutex (embedded)
   * Address-of-slot handle. Not initialized here (frontier ctor decode).
   */
  sharedMutex: PCSharedMutexHandle | null = null;

  /**
   * +0x90 — settings : OZSceneSettings (embedded, NOT a pointer).
   * Address-of-slot forwarded to by the three thin wrappers below.
   */
  settings: OZSceneSettingsHandle | null = null;

  /**
   * +0xa0 — playbackFrameCount : u32.
   * Set by setTimeRange @0x4fae2 or @0x4faf6.
   */
  playbackFrameCount: number = 0;

  /**
   * +0xb0 — playbackDuration : f64.
   * Read as the enable-gate for the frame-count refresh in setTimeRange
   * (`ucomisd %xmm1,%xmm0 ; jbe 0x4faf6` @0x4fa5c/0x4fa60).
   */
  playbackDuration: number = 0;

  /**
   * +0xc8 — rawWorkingGamutCache : u32.
   * Written by OZSceneSettings::setRawWorkingGamut (indirectly through the
   * settings tail-call — the settings object writes back this cache slot
   * on the scene as part of its side-effect chain). Read directly by
   * getRawWorkingGamut inside the shared-mutex.
   */
  rawWorkingGamutCache: PCWorkingGamutValue = 0;

  /**
   * +0x480 — timeRange : PCTimeRange (0x30 bytes).
   * Modelled as a nullable handle; setTimeRange copies bytes from src into
   * this slot.
   */
  timeRange: PCTimeRangeHandle | null = null;

  /**
   * +0x4b0 — playRangePrimary : PCTimeRange (0x30 bytes).
   * Active when playRangeVariantSelector == -1.
   */
  playRangePrimary: PCTimeRangeHandle | null = null;

  /**
   * +0x4e0 — playRangeSecondary : PCTimeRange (0x30 bytes).
   * Active when playRangeVariantSelector != -1.
   */
  playRangeSecondary: PCTimeRangeHandle | null = null;

  // ==========================================================================
  //  CORE — the small getter/setter surface used by the OZ*Undo family
  // ==========================================================================

  /**
   * OZScene::getRawWorkingGamut() const  @0x81da0
   *   __ZNK7OZScene18getRawWorkingGamutEv
   *
   *   0x81da0: pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx     # prologue
   *   0x81da7: movq  %rdi,%rbx                                            # rbx = this
   *   0x81daa: leaq  0x28(%rdi),%r14                                      # r14 = &this->sharedMutex
   *   0x81dae: movq  %r14,%rdi
   *   0x81db1: callq __ZN13PCSharedMutex11lock_sharedEv                   # shared lock
   *   0x81db6: movl  0xc8(%rbx),%ebx                                      # rbx = (u32) this->rawWorkingGamutCache
   *   0x81dbc: movq  %r14,%rdi
   *   0x81dbf: callq __ZN13PCSharedMutex13unlock_sharedEv                 # shared unlock
   *   0x81dc4: movl  %ebx,%eax                                            # return the loaded value
   *   0x81dc6..0x81dca: epilogue ; retq
   *
   *   0x81dcb..0x81dce: unwind cleanup — `__clang_call_terminate` on the
   *                     exception path (mutex lock threw). Preserved as a
   *                     try/finally analogue below.
   */
  getRawWorkingGamut(): PCWorkingGamutValue {
    const mutex = this._requireMutex(0x81db1);
    // @0x81db1: acquire shared lock.
    mutex.lock_shared();
    try {
      // @0x81db6: read the cache slot at +0xc8 while holding the shared lock.
      return this.rawWorkingGamutCache >>> 0;
    } finally {
      // @0x81dbf: release shared lock.
      mutex.unlock_shared();
    }
  }

  /**
   * OZScene::setRawWorkingGamut(PCWorkingGamutValue)  @0x81de0
   *   __ZN7OZScene18setRawWorkingGamutE19PCWorkingGamutValue
   *
   *   0x81de0..0x81de9: prologue
   *   0x81dea: movl  %esi,%r14d                                           # r14d = arg
   *   0x81ded: movq  %rdi,%r15                                            # r15 = this
   *   0x81df0: leaq  0x28(%rdi),%rbx                                      # rbx = &sharedMutex
   *   0x81df4: movq  %rbx,%rdi
   *   0x81df7: callq __ZN13PCSharedMutex4lockEv                           # exclusive lock
   *   0x81dfc: addq  $0x90,%r15                                           # r15 = &this->settings
   *   0x81e03: movq  %r15,%rdi
   *   0x81e06: movl  %r14d,%esi
   *   0x81e09: callq __ZN15OZSceneSettings18setRawWorkingGamutE19PCWorkingGamutValue
   *   0x81e0e: movq  %rbx,%rdi
   *   0x81e11: callq __ZN13PCSharedMutex6unlockEv                         # exclusive unlock
   *   0x81e16..0x81e20: epilogue ; retq
   *
   *   0x81e21..0x81e44: two-stage unwind cleanup that unlocks the mutex on the
   *                     exception path before rethrowing (`__Unwind_Resume`).
   *                     Preserved as try/finally below.
   *
   * NB: the CACHE at +0xc8 is NOT written directly here — OZSceneSettings::
   * setRawWorkingGamut is responsible for propagating the value back to the
   * scene's cache slot. That propagation is FRONTIER (OZSceneSettings not
   * decoded). We preserve the observable ordering by delegating to the
   * settings tail-call inside the write lock.
   */
  setRawWorkingGamut(v: PCWorkingGamutValue): void {
    const mutex = this._requireMutex(0x81df7);
    const settings = this._requireSettings(0x81e09);
    // @0x81df7: acquire exclusive lock.
    mutex.lock();
    try {
      // @0x81dfc/@0x81e09: forward to settings @+0x90.
      settings.setRawWorkingGamut(v);
    } finally {
      // @0x81e11: release exclusive lock.
      mutex.unlock();
    }
  }

  /**
   * OZScene::dynamicRangeTrackingEnabled() const  @0x62db0
   *   __ZNK7OZScene27dynamicRangeTrackingEnabledEv
   *
   *   0x62db0: pushq %rbp ; movq %rsp,%rbp
   *   0x62db4: addq  $0x90,%rdi                                           # rdi = &settings
   *   0x62dbb: popq %rbp
   *   0x62dbc: jmp __ZNK15OZSceneSettings27dynamicRangeTrackingEnabledEv  # tail-call
   *
   * NB: no mutex — the settings method is expected to be lock-free-read-safe
   * (the read path is not synchronised with the write path decoded above).
   */
  dynamicRangeTrackingEnabled(): boolean {
    const settings = this._requireSettings(0x62dbc);
    // @0x62dbc: tail-call.
    return settings.dynamicRangeTrackingEnabled();
  }

  /**
   * OZScene::setDynamicRangeTrackingEnabled(bool)  @0x81ed0
   *   __ZN7OZScene30setDynamicRangeTrackingEnabledEb
   *
   *   0x81ed0: pushq %rbp ; movq %rsp,%rbp
   *   0x81ed4: addq  $0x90,%rdi                                           # rdi = &settings
   *   0x81edb: popq %rbp
   *   0x81edc: jmp __ZN15OZSceneSettings30setDynamicRangeTrackingEnabledEb # tail-call
   *
   * NB: no mutex — unlike setRawWorkingGamut which DOES lock. The FCP code
   * relies on OZSceneSettings' own lock/atomics here.
   */
  setDynamicRangeTrackingEnabled(v: boolean): void {
    const settings = this._requireSettings(0x81edc);
    // @0x81edc: tail-call.
    settings.setDynamicRangeTrackingEnabled(v);
  }

  /**
   * OZScene::getPlayRange() const  @0x4fb10
   *   __ZNK7OZScene12getPlayRangeEv
   *
   *   0x4fb10: pushq %rbp ; movq %rsp,%rbp
   *   0x4fb14: leaq  0x4e0(%rdi),%rax                                     # rax = &playRangeSecondary
   *   0x4fb1b: cmpl  $-0x1,0x20(%rdi)                                     # variantSelector == -1 ?
   *   0x4fb1f: leaq  0x4b0(%rdi),%rcx                                     # rcx = &playRangePrimary
   *   0x4fb26: cmoveq %rcx,%rax                                           # if equal, rax = rcx
   *   0x4fb2a: popq %rbp ; retq
   *
   * Returns a POINTER — not a copy. TS models it by returning whichever
   * PCTimeRange handle the selector picks.
   */
  getPlayRange(): PCTimeRangeHandle | null {
    // @0x4fb14/@0x4fb1b/@0x4fb1f/@0x4fb26: cmoveq semantics.
    // Compare against 0xffffffff (== -1 as i32) using unsigned representation.
    const sel = this.playRangeVariantSelector >>> 0;
    if (sel === 0xffffffff) {
      return this.playRangePrimary;
    }
    return this.playRangeSecondary;
  }

  /**
   * OZScene::setPlayRange(PCTimeRange const&)  @0x4fb30
   *   __ZN7OZScene12setPlayRangeERK11PCTimeRange
   *
   *   0x4fb30: pushq %rbp ; movq %rsp,%rbp
   *   0x4fb34: cmpl  $-0x1,0x20(%rdi)                                     # variantSelector == -1 ?
   *   0x4fb38: je    0x4fb6c                                              # yes -> primary branch
   *   0x4fb3a: leaq  0x4e0(%rdi),%rcx                                     # rcx = &playRangeSecondary
   *   0x4fb41: movl  $0x4f8,%eax                                          # eax = 0x4f8 (secondary+0x18)
   *   0x4fb46: cmpq  %rsi,%rcx                                            # src aliases dest ?
   *   0x4fb49: je    0x4fb6a                                              # yes -> skip (self-copy)
   *   0x4fb4b: movq  0x10(%rsi),%rdx ; movq %rdx,0x10(%rcx)                # [dst+0x10] = [src+0x10]
   *   0x4fb53: movups (%rsi),%xmm0 ; movups %xmm0,(%rcx)                   # [dst..dst+0x10) = [src..src+0x10)
   *   0x4fb59: movq  0x28(%rsi),%rcx ; movq %rcx,0x10(%rdi,%rax)           # [this+0x4f8+0x10]=[src+0x28] i.e. [dst+0x28]
   *   0x4fb62: movups 0x18(%rsi),%xmm0 ; movups %xmm0,(%rdi,%rax)          # [dst+0x18..dst+0x28) = [src+0x18..src+0x28)
   *   0x4fb6a: popq %rbp ; retq
   *
   *   0x4fb6c: leaq  0x4b0(%rdi),%rcx                                     # rcx = &playRangePrimary
   *   0x4fb73: movl  $0x4c8,%eax                                          # eax = 0x4c8 (primary+0x18)
   *   0x4fb78: cmpq  %rsi,%rcx                                            # src aliases dest ?
   *   0x4fb7b: jne   0x4fb4b                                              # no -> reuse copy code above
   *   0x4fb7d: jmp   0x4fb6a                                              # yes -> skip
   *
   * Semantics: bytewise copy the 0x30-byte PCTimeRange from src into the
   * variant-selected slot, with a self-aliasing skip. This is a struct
   * assignment operator — TS models it by copying handle refs and treating
   * the underlying bytes as opaque.
   */
  setPlayRange(src: PCTimeRangeHandle): void {
    // @0x4fb34: which slot is currently active?
    const sel = this.playRangeVariantSelector >>> 0;
    if (sel === 0xffffffff) {
      // @0x4fb6c primary branch — dst = playRangePrimary.
      if (this.playRangePrimary === src) return; // @0x4fb78/@0x4fb7d self-alias skip
      this.playRangePrimary = src;
    } else {
      // @0x4fb3a secondary branch — dst = playRangeSecondary.
      if (this.playRangeSecondary === src) return; // @0x4fb46/@0x4fb49 self-alias skip
      this.playRangeSecondary = src;
    }
    // @0x4fb4b-@0x4fb66: 0x30-byte struct copy. In TS we've referenced the
    // handle above; the byte-level copy is behind the PCTimeRange frontier.
  }

  /**
   * OZScene::setTimeRange(PCTimeRange const&)  @0x4fa10
   *   __ZN7OZScene12setTimeRangeERK11PCTimeRange
   *
   *   0x4fa10..0x4fa19: prologue
   *   0x4fa1d: movq  %rdi,%rbx                                            # rbx = this
   *   0x4fa20: leaq  0x480(%rdi),%rax                                     # rax = &timeRange
   *   0x4fa27: cmpq  %rsi,%rax                                            # src aliases dest ?
   *   0x4fa2a: je    0x4fa50                                              # yes -> skip copy
   *   0x4fa2c: movq  0x10(%rsi),%rcx ; movq %rcx,0x10(%rax)                # 3-qword + 16B copy
   *   0x4fa34: movups (%rsi),%xmm0 ; movups %xmm0,(%rax)
   *   0x4fa3a: movq  0x28(%rsi),%rax ; movq %rax,0x4a8(%rbx)
   *   0x4fa45: movups 0x18(%rsi),%xmm0 ; movups %xmm0,0x498(%rbx)
   *   0x4fa50: movsd  0xb0(%rbx),%xmm0                                    # xmm0 = playbackDuration
   *   0x4fa58: xorpd  %xmm1,%xmm1
   *   0x4fa5c: ucomisd %xmm1,%xmm0                                        # duration > 0 ?
   *   0x4fa60: jbe    0x4faf6                                             # no -> nFrames=1
   *   0x4fa66: movl  0x24(%rsi),%eax                                      # eax = src[+0x24] (CMTime flags?)
   *   0x4fa69: andl  $0x1d,%eax                                           # keep valid-CMTime bits
   *   0x4fa6c: cmpl  $0x1,%eax                                            # == 1 (kCMTimeFlags_Valid) ?
   *   0x4fa6f: jne    0x4faea                                             # not valid -> puts + nFrames=1
   *   0x4fa71..0x4faca: call OZSceneSettings::getFrameDuration() twice,
   *                      compute src.duration / frameDuration via CMTime
   *                      operator/= @stub 0x6dfc42
   *                      (__ZdvRK6CMTimeS1_), pass result to _CMTimeGetSeconds,
   *                      cvttsd2si  → integer frame count → +0xa0.
   *   0x4faea: leaq  "OZScene::setTimeRange range is not numeric, setting num frames to 1.",%rdi
   *   0x4faf1: callq _puts
   *   0x4faf6: movl  $0x1,0xa0(%rbx)                                      # nFrames = 1
   *   0x4fb00..0x4fb0a: epilogue ; retq
   *
   * Deep decode: partial. The 24-byte block after @0x4fa71 pulls in
   * OZSceneSettings::getFrameDuration, CMTime division, and CMTimeGetSeconds
   * — all frontier-heavy. We port the observable EFFECT: copy the src bytes
   * into +0x480, and refresh +0xa0 with 1 when duration<=0 or the CMTime
   * range is not numeric. The "compute frames from duration" branch is a
   * throw-stub citing @0x4fa82.
   */
  setTimeRange(src: PCTimeRangeHandle): void {
    // @0x4fa20-@0x4fa49: bytewise copy src → this->timeRange (with alias skip).
    if (this.timeRange !== src) {
      this.timeRange = src;
      // (byte-level struct copy is opaque behind the PCTimeRange handle.)
    }
    // @0x4fa50-@0x4fa60: duration > 0 check.
    if (!(this.playbackDuration > 0)) {
      // @0x4faf6: frame count sentinel.
      this.playbackFrameCount = 1;
      return;
    }
    // @0x4fa66-@0x4fa6f: CMTime validity check via +0x24 & 0x1d == 1.
    if (!OZScene._srcIsNumericCMTimeRange(src)) {
      // @0x4faea/@0x4faf1: `puts(...)` diagnostic line (side-effect: stderr-ish).
      OZScene._putsSetTimeRangeNotNumeric();
      // @0x4faf6: frame count sentinel.
      this.playbackFrameCount = 1;
      return;
    }
    // @0x4fa71-@0x4fac0: compute nFrames = CMTimeGetSeconds(src.duration /
    //   OZSceneSettings::getFrameDuration()). FRONTIER — throw with the exact
    //   decode point.
    throw new Error(
      "OZScene::setTimeRange numeric branch unimplemented — @Ozone 0x4fa71..0x4fac0 " +
        "(requires OZSceneSettings::getFrameDuration @Ozone 0x4fa82, " +
        "CMTime operator/ @stub 0x6dfc42, _CMTimeGetSeconds @stub 0x6dcac2).",
    );
  }

  /**
   * OZScene::getNode(unsigned int)  @0x4f9a0
   *   __ZN7OZScene7getNodeEj
   *
   *   0x4f9a0: pushq %rbp ; movq %rsp,%rbp
   *   0x4f9a4: addq  $0x440,%rdi                                          # rdi = &this->nodeMap
   *   0x4f9ab: callq __ZN7OZScene9OZNodeMapixEj                           # OZNodeMap::operator[](u32)
   *   0x4f9b0: testq %rax,%rax
   *   0x4f9b3: je    0x4f9d1                                              # -> return null
   *   0x4f9b5: leaq  __ZTI19OZObjectManipulator(%rip),%rsi                # src typeinfo
   *   0x4f9bc: leaq  __ZTI11OZSceneNode(%rip),%rdx                        # dst typeinfo
   *   0x4f9c3: movl  $0x10,%ecx                                           # hint offset
   *   0x4f9c8: movq  %rax,%rdi
   *   0x4f9cb: popq %rbp
   *   0x4f9cc: jmp ___dynamic_cast                                        # tail-call
   *   0x4f9d1: xorl %eax,%eax ; popq %rbp ; retq                          # null
   *
   * dynamic_cast<OZObjectManipulator, OZSceneNode>(ptr) — the hint arg $0x10
   * matches the OZSceneNode base-offset in the OZObjectManipulator layout.
   * Frontier for both the OZNodeMap and dynamic_cast — we keep the outer
   * shape (null-early-return) and stub the inner two.
   */
  getNode(_key: number): OZSceneNodeHandle | null {
    // @0x4f9a4/@0x4f9ab: OZNodeMap::operator[] frontier.
    const raw = OZScene._nodeMapIndex(this, _key);
    // @0x4f9b0-@0x4f9d1: null-check early-out.
    if (raw === null) return null;
    // @0x4f9b5-@0x4f9cc: dynamic_cast frontier.
    return OZScene._dynamicCastToSceneNode(raw);
  }

  // ==========================================================================
  //  FRONTIER — all other 359 methods kept as throwing stubs. Only the ones
  //  the OZ*Undo family names directly (or that appear in the disasm decoded
  //  above) are listed. The rest live in raw-port/army/tools/brief.py's
  //  method list and get their own worktrees.
  // ==========================================================================

  /**
   * OZScene::updateColorChannelsForWorkingGamut(PCWorkingGamutValue, bool, OZChannelFolder*)
   *   @0x62bc0 — FRONTIER. Full body is 94 asm lines involving the channel-
   *   folder tree walk. Called by OZSceneGamutUndo::Swap @0x101638.
   */
  updateColorChannelsForWorkingGamut(
    _gamut: PCWorkingGamutValue,
    _dr: boolean,
    _folder: OZChannelFolderHandle,
  ): void {
    throw new Error(
      "OZScene::updateColorChannelsForWorkingGamut unimplemented — @Ozone 0x62bc0",
    );
  }

  /** OZScene::setFlag(u32)  @0x4d370 — frontier. */
  setFlag(_v: number): void {
    throw new Error("OZScene::setFlag unimplemented — @Ozone 0x4d370");
  }

  /** OZScene::resetFlag(u32)  @0x4d380 — frontier. */
  resetFlag(_v: number): void {
    throw new Error("OZScene::resetFlag unimplemented — @Ozone 0x4d380");
  }

  /** OZScene::addRootNode(OZSceneNode*)  @0x4d390 — frontier. */
  addRootNode(_n: OZSceneNodeHandle): void {
    throw new Error("OZScene::addRootNode unimplemented — @Ozone 0x4d390");
  }

  /** OZScene::getComputedWorkingGamut() const  @0x62d10 — frontier. */
  getComputedWorkingGamut(): PCWorkingGamutValue {
    throw new Error("OZScene::getComputedWorkingGamut unimplemented — @Ozone 0x62d10");
  }

  /** OZScene::publishChannel(OZChannelBase const*, bool)  @0x4f580 — frontier. */
  publishChannel(_ch: unknown, _pub: boolean): void {
    throw new Error("OZScene::publishChannel unimplemented — @Ozone 0x4f580");
  }

  /** OZScene::isChannelPublished(OZChannelBase const*) const  @0x4f5c0 — frontier. */
  isChannelPublished(_ch: unknown): boolean {
    throw new Error(
      "OZScene::isChannelPublished unimplemented — @Ozone 0x4f5c0",
    );
  }

  /** OZScene::getSceneSettings(OZExportSettings&)  @0x4f340 — frontier. */
  getSceneSettings(_out: unknown): void {
    throw new Error("OZScene::getSceneSettings unimplemented — @Ozone 0x4f340");
  }

  // ==========================================================================
  //  Internal helpers — model the address-of-mutex/settings loads so that the
  //  decoded methods above can throw with an exact provenance if the fields
  //  are unset at runtime (e.g. because the ctor decode hasn't landed yet).
  // ==========================================================================

  private _requireMutex(callSite: number): PCSharedMutexHandle {
    const m = this.sharedMutex;
    if (m === null) {
      throw new Error(
        "OZScene sharedMutex unset — @Ozone 0x" +
          callSite.toString(16) +
          " requires the ctor @Ozone 0x4cc00 to install PCSharedMutex at +0x28 (frontier).",
      );
    }
    return m;
  }

  private _requireSettings(callSite: number): OZSceneSettingsHandle {
    const s = this.settings;
    if (s === null) {
      throw new Error(
        "OZScene settings unset — @Ozone 0x" +
          callSite.toString(16) +
          " requires the ctor @Ozone 0x4cc00 to install OZSceneSettings at +0x90 (frontier).",
      );
    }
    return s;
  }

  /** Frontier: OZNodeMap::operator[](u32) @0x4f9ab. */
  private static _nodeMapIndex(_scene: OZScene, _key: number): unknown {
    throw new Error(
      "OZScene::OZNodeMap::operator[] unimplemented — @Ozone 0x4f9ab (called from getNode @0x4f9ab)",
    );
  }

  /** Frontier: `___dynamic_cast(rawPtr, OZObjectManipulator, OZSceneNode, 0x10)` @0x4f9cc. */
  private static _dynamicCastToSceneNode(_raw: unknown): OZSceneNodeHandle | null {
    throw new Error(
      "OZScene::getNode dynamic_cast to OZSceneNode unimplemented — @Ozone 0x4f9cc " +
        "(src=__ZTI19OZObjectManipulator, dst=__ZTI11OZSceneNode, hint=0x10)",
    );
  }

  /**
   * Frontier: mirror of the CMTime validity check at setTimeRange @0x4fa66-@0x4fa6f.
   * The check is `(src[+0x24] & 0x1d) == 1` — bit 0 = "Valid", bit 2/3/4 mask
   * ensures no "positive-infinity/negative-infinity/indefinite" flags are set.
   * PCTimeRange +0x24 is likely the CMTimeFlags of the DURATION member (the
   * pair at +0x18..+0x28), since the arithmetic that follows divides
   * `src+0x18` by frameDuration.
   */
  private static _srcIsNumericCMTimeRange(_src: PCTimeRangeHandle): boolean {
    throw new Error(
      "OZScene::setTimeRange CMTime numeric-range check unimplemented — @Ozone 0x4fa66..0x4fa6f " +
        "(needs PCTimeRange +0x24 CMTimeFlags decode: (flags & 0x1d) == 1).",
    );
  }

  /** Frontier: `puts("OZScene::setTimeRange range is not numeric, setting num frames to 1.")` @0x4faf1. */
  private static _putsSetTimeRangeNotNumeric(): void {
    // Non-throwing — this is a diagnostic side-effect. We model it as a
    // console.error to preserve observability; the FCP code uses `puts` which
    // writes to stdout, but the choice of channel doesn't affect Swap()
    // correctness.
    // eslint-disable-next-line no-console
    console.error(
      "OZScene::setTimeRange range is not numeric, setting num frames to 1.",
    );
  }
}
