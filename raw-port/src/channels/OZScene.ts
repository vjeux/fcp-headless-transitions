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
//   __ZN7OZScene19gotoHeadOfPlayRangeEv                               @0x71ea0  ← CORE
//
// WHY THIS FILE (and not raw-port/src/nodes/OZScene.ts): two files carry the
// name OZScene. THIS one is the raw transcription of Ozone's C++ class — every
// method cites an @Ozone address and the byte offsets of the real 0x500+-byte
// object (+0x20 selector, +0x3b8 currentTime, +0x4b0/+0x4e0 play ranges), which
// is exactly the storage `gotoHeadOfPlayRange` moves bytes between. The
// `nodes/OZScene.ts` file is a different object: a .motr scene-graph model
// (layers/settings/factories, parseElement) with no address provenance and none
// of these fields. A method decoded from the binary belongs here.
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

import type { CMTime } from "../infra/CMTime.js";

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
  /**
   * +0x00..+0x17 — the range's `start` CMTime.
   *
   * Added by the `gotoHeadOfPlayRange` @0x71ea0 port, which reads exactly those
   * 24 bytes out of the selected range (`movups (%rax),%xmm0` @0x71eba for
   * value/timescale/flags and `movq 0x10(%rax),%rax` @0x71ec4 for epoch) and
   * copies them into `currentTime`. The offsets agree with the landed
   * `raw-port/src/infra/PCTimeRange.ts` model (start +0x00, duration +0x18).
   *
   * OPTIONAL because the pre-existing users of this handle (getPlayRange /
   * setPlayRange / setTimeRange) treat the 0x30 bytes as opaque and never
   * populate them; nothing about their behaviour changes.
   */
  start?: CMTime;
  /**
   * +0x18..+0x2f — the range's `duration` CMTime. Not read by any body in this
   * file; recorded so the 0x30-byte layout is complete (same source as above).
   */
  duration?: CMTime;
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

/** `PCColorGamutValue` — 32-bit enum passed by value (the `setViewGamut`
 *  argument arrives in `%esi` and is stored with a 32-bit `movl` @Ozone
 *  0x81e84, which is what fixes the width). Opaque u32 here: no decoded code
 *  compares it against any enumerator, so no names are invented. */
export type PCColorGamutValue = number;

/** OZSceneNode opaque — return type of getNode() after dynamic_cast. */
export interface OZSceneNodeHandle {
  readonly __ozSceneNode: true;
}

/** OZChannelFolder opaque — arg to updateColorChannelsForWorkingGamut. */
export interface OZChannelFolderHandle {
  readonly __ozChannelFolder: true;
}

/**
 * Address-of the OZScene+0x3d0 sentinel slot (the "all selected" collection
 * end anchor). Identity-stable per OZScene. Returned by end_all_sel() @0x50cc0.
 */
export interface OZSceneAllSelSentinelHandle {
  readonly __ozAllSelSentinel: true;
}

/** Companion pointer stored at OZScene+0x3d8 (opaque). */
export interface OZSceneAllSelNodeHandle {
  readonly __ozAllSelNode: true;
}

/**
 * The iterator/range object returned by OZScene::end_all_sel() @0x50cc0.
 *
 * The function zero-fills most of the return record and stores a few fields
 * (byte offsets from the sret pointer `%rdi`):
 *   +0x00  node    = &this->allSelSentinel      (movq %rsi)          @0x50ceb
 *   +0x08  aux     = *(this+0x3d8)  (companion)  (movq %rcx)          @0x50cee
 *   +0x10  nodeAlt = &this->allSelSentinel  (same address again)      @0x50cf2
 *   +0x18  16 bytes zeroed  (xorps %xmm0 ; movups %xmm0)              @0x50ce0
 *   +0x28  u32 = 0                                                    @0x50cf6
 *   +0x30  16 bytes zeroed                                            @0x50cdc
 *   +0x40  16 bytes zeroed                                            @0x50cd8
 *   +0x50  f32 = 1.0  (movl $0x3f800000)                             @0x50ce4
 *
 * This shape (a node pointer repeated at +0x00/+0x10, a companion at +0x08, a
 * trailing float 1.0 and several zeroed vector slots) is a past-the-end
 * iterator bundled with a zeroed cursor/blend state; the +0x50 = 1.0f reads as
 * a normalized fraction/weight default. Each field carries its documented
 * offset per Rule 5.
 */
export interface OZSceneAllSelIterator {
  /** +0x00 — &OZScene::allSelSentinel (past-the-end node). */
  node: OZSceneAllSelSentinelHandle;
  /** +0x08 — companion pointer copied from OZScene+0x3d8. */
  aux: OZSceneAllSelNodeHandle | null;
  /** +0x10 — same sentinel address as `node` (duplicated by the ctor). */
  nodeAlt: OZSceneAllSelSentinelHandle;
  /** +0x18 — 16 bytes, zero-initialized. */
  zero18: [number, number, number, number];
  /** +0x28 — u32, zero-initialized. */
  u28: number;
  /** +0x30 — 16 bytes, zero-initialized. */
  zero30: [number, number, number, number];
  /** +0x40 — 16 bytes, zero-initialized. */
  zero40: [number, number, number, number];
  /** +0x50 — f32 = 1.0 (0x3f800000 == Math.fround(1.0)). */
  f50: number;
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
   * +0xd0 — toneMappingMode : u32 (an enum code).
   *
   * The one and only slot `getToneMappingMode() const` @Ozone 0x81e90 reads,
   * via `movl 0xd0(%rdi), %eax` @0x81e94 — a 32-bit load returned directly
   * in `%eax`. That instruction fixes the WIDTH (4 bytes) and the OFFSET; it
   * does not reveal the enumerator set, so no enum type is invented here and
   * the value is modelled as a plain `number` holding the raw 32 bits.
   *
   * `movl` into a full 32-bit register is width-exact and sign-agnostic (the
   * upper 32 bits of `%rax` are zeroed by the 32-bit write), so the returned
   * value is the unsigned 32-bit word; the getter below preserves that with
   * `>>> 0`. The setter for this slot is a separate ledger unit and is NOT
   * decoded here — nothing about who writes it is claimed.
   *
   * Note this sits immediately after `rawWorkingGamutCache` (+0xc8, u32) and
   * the slot at +0xcc, which is consistent with a run of small colour-pipeline
   * settings caches on the scene object. (+0xcc is now decoded — see
   * `viewGamut_at_0xcc` below, grounded by `setViewGamut` @0x81e84 and
   * `getViewGamut` @0x81e54 — so this adjacency is no longer just an
   * observation.)
   */
  toneMappingMode_at_0xd0: number = 0;

  /**
   * +0xcc — viewGamut : PCColorGamutValue (u32).
   *
   * The scene's VIEW gamut, the sibling of the working gamut cached at +0xc8.
   * Two one-instruction accessors pin the slot and its width:
   *   `OZScene::setViewGamut(PCColorGamutValue)` @Ozone 0x81e84
   *     `movl %esi, 0xcc(%rdi)`   — 32-bit store of the by-value enum;
   *   `OZScene::getViewGamut() const` @Ozone 0x81e54
   *     `movl 0xcc(%rdi), %eax`   — the matching 32-bit load.
   * Neither takes a lock (contrast `getRawWorkingGamut` @0x81da0, which reads
   * +0xc8 under the shared lock @0x81db6), and neither validates the value.
   *
   * Modelled as a plain `number` holding the raw 32 bits, like
   * `rawWorkingGamutCache`.
   */
  viewGamut_at_0xcc: PCColorGamutValue = 0;

  /**
   * +0x480 — timeRange : PCTimeRange (0x30 bytes).
   * Modelled as a nullable handle; setTimeRange copies bytes from src into
   * this slot.
   */
  timeRange: PCTimeRangeHandle | null = null;

  /**
   * +0x3b8..+0x3cf — currentTime : CMTime (24 bytes, packed).
   *
   * Layout is the CoreMedia CMTime shape (see raw-port/src/infra/CMTime.ts):
   *   +0x3b8  int64  value        \
   *   +0x3c0  int32  timescale     > read by getCurrentTime as one 16-byte block
   *   +0x3c4  uint32 flags        /   via `movups 0x3b8(%rsi),%xmm0`
   *   +0x3c8  int64  epoch          — read as an 8-byte tail via `movq 0x3c8(%rsi),%rcx`
   *
   * The 24-byte total matches CMTime exactly (16 low bytes movups + 8-byte
   * epoch tail == sizeof(CMTime)). See disasm addresses cited in
   * getCurrentTime() below. The setter for this slot lives in another
   * OZScene method (setCurrentTime or a broadcast from the playhead
   * subsystem) and is FRONTIER — not decoded here. We only decode what
   * the reader touches; per Rule 3 we don't guess where else it's written.
   */
  currentTime: CMTime = { value: 0n, timescale: 0, flags: 0, epoch: 0n };

  /**
   * +0x3d0..+0x3df — allSelSentinel : the internal sentinel node of the
   * scene's "all selected" collection. `end_all_sel()` @0x50cc0 takes the
   * ADDRESS of this slot (`addq $0x3d0,%rsi`) as the past-the-end iterator
   * anchor and reads a paired qword at +0x3d8 (`movq 0x3d8(%rsi),%rcx`):
   *   +0x3d0  qword  — sentinel/head-node pointer (address-of returned as the
   *                    iterator's `node` at result+0x00 and result+0x10).
   *   +0x3d8  qword  — companion pointer copied into the iterator at result+0x08.
   *
   * Modelled as an opaque address-of-slot handle (identity-stable so a real
   * end() iterator compares equal across calls) plus a nullable companion
   * pointer handle. Both are FRONTIER for their producers (the selection
   * subsystem that populates the collection is not decoded); end_all_sel only
   * READS them, per Rule 3.
   */
  allSelSentinel: OZSceneAllSelSentinelHandle = { __ozAllSelSentinel: true };
  /** +0x3d8 companion qword (see allSelSentinel doc). Opaque pointer handle. */
  allSelSentinelCompanion: OZSceneAllSelNodeHandle | null = null;

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
   * OZScene::setViewGamut(PCColorGamutValue)  @Ozone 0x81e80
   *   __ZN7OZScene12setViewGamutE17PCColorGamutValue
   *
   * Full transcription — every instruction, in order
   * (raw-port/re/disasm/__ZN7OZScene12setViewGamutE17PCColorGamutValue.s):
   *
   *   0x81e80  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x81e81  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x81e84  movl  %esi, 0xcc(%rdi)     ; this->viewGamut_at_0xcc = v
   *   0x81e8a  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x81e8b  retq                       ; void return
   *   0x81e8c  nopl  (%rax)               ; alignment padding, not executed
   *
   * A bare 32-bit field store and NOTHING else. Three things it deliberately
   * does not do, each visible by their absence from the four-instruction body:
   *   • no LOCK — contrast the working-gamut pair on the neighbouring +0xc8
   *     slot, where `getRawWorkingGamut` @0x81da0 reads under `lock_shared`
   *     (@0x81db1) and `setRawWorkingGamut` @0x81de0 writes under the
   *     exclusive `lock` (@0x81df7);
   *   • no FORWARDING to the `OZSceneSettings` sub-object at +0x90 — this
   *     value lives directly on the scene, unlike the raw working gamut;
   *   • no validation of the enum and no change notification.
   *
   * The 32-bit `movl` of `%esi` (the by-value `PCColorGamutValue` argument) is
   * what fixes the slot's width; `getViewGamut() const` @0x81e54 reads the same
   * offset back with the matching `movl 0xcc(%rdi), %eax` (its own ledger unit,
   * not ported here). The port stores the value `>>> 0` to keep the exact 32
   * bits the register holds.
   *
   * ZERO callees, ZERO externs, no indirect/virtual dispatch.
   *
   * @param v the new view gamut (`%esi`).
   */
  setViewGamut(v: PCColorGamutValue): void {
    // @0x81e84: movl %esi, 0xcc(%rdi) — 32-bit store, no lock, no forwarding.
    this.viewGamut_at_0xcc = v >>> 0;
  }

  /**
   * OZScene::getViewGamut() const  @Ozone 0x81e50
   *   __ZNK7OZScene12getViewGamutEv
   *
   * Full transcription — every instruction, in order
   * (raw-port/re/disasm/__ZNK7OZScene12getViewGamutEv.s):
   *
   *   0x81e50  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x81e51  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x81e54  movl  0xcc(%rdi), %eax     ; return this->viewGamut_at_0xcc
   *   0x81e5a  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x81e5b  retq                       ; return %eax (u32)
   *   0x81e5c  nopl  (%rax)               ; alignment padding, not executed
   *
   * The exact inverse of `setViewGamut` @0x81e84 (`movl %esi, 0xcc(%rdi)`) on
   * the same slot, and like it: NO LOCK (contrast `getRawWorkingGamut`
   * @0x81da0, which reads the neighbouring +0xc8 cache under `lock_shared`
   * @0x81db1), NO forwarding to the `OZSceneSettings` sub-object at +0x90, no
   * mask and no validation — the raw 32-bit word, verbatim.
   *
   * `movl` into a 32-bit register zero-extends into `%rax`, so the ABI result
   * is the unsigned 32-bit word; the port preserves that with `>>> 0`, exactly
   * as `getRawWorkingGamut` does for +0xc8.
   *
   * ZERO callees, ZERO externs, no indirect/virtual dispatch — a pure field
   * read.
   *
   * @returns the scene's view gamut (u32).
   */
  getViewGamut(): PCColorGamutValue {
    // @0x81e54: movl 0xcc(%rdi), %eax — 32-bit load, zero-extended.
    return this.viewGamut_at_0xcc >>> 0;
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
   * OZScene::getCurrentTime() const  @0x4fba0
   *   __ZNK7OZScene14getCurrentTimeEv
   *
   *   0x4fba0: pushq  %rbp
   *   0x4fba1: movq   %rsp,%rbp
   *   0x4fba4: movq   %rdi,%rax                                            # sret ptr passthrough
   *   0x4fba7: movq   0x3c8(%rsi),%rcx                                     # rcx = this->currentTime.epoch (8 B @+0x3c8)
   *   0x4fbae: movq   %rcx, 0x10(%rdi)                                     # out->epoch = rcx
   *   0x4fbb2: movups 0x3b8(%rsi),%xmm0                                    # xmm0 = this->{value, timescale, flags} (16 B @+0x3b8)
   *   0x4fbb9: movups %xmm0, (%rdi)                                        # out->{value, timescale, flags} = xmm0
   *   0x4fbbc: popq %rbp ; retq
   *   0x4fbbe: nop
   *
   * A pure by-value CMTime return: the SysV ABI passes a hidden "sret"
   * pointer to the return-value slot in `%rdi`, so `%rsi` holds `this`.
   * The function copies 24 bytes (16 + 8) from OZScene+0x3b8 into the
   * sret slot in a specific order (epoch first, then the value/timescale/
   * flags block). The `movq %rdi,%rax` at 0x4fba4 returns the sret pointer
   * back to the caller as the ABI requires (rax = sret ptr).
   *
   * We can't observe the write order in JS (we return one struct), but
   * we preserve the source order in the field expression and cite the
   * addresses next to each copy.
   *
   * ZERO in-scope callees, ZERO externs. Pure field reads.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK7OZScene14getCurrentTimeEv.s (11 lines)
   */
  getCurrentTime(): CMTime {
    // @0x4fbb2..0x4fbb9  movups 0x3b8(%rsi),%xmm0 ; movups %xmm0,(%rdi)
    //   Copies the 16-byte {value, timescale, flags} block from +0x3b8.
    // @0x4fba7..0x4fbae  movq 0x3c8(%rsi),%rcx ; movq %rcx,0x10(%rdi)
    //   Copies the 8-byte epoch tail from +0x3c8.
    const t = this.currentTime;
    return { value: t.value, timescale: t.timescale, flags: t.flags, epoch: t.epoch };
  }

  /**
   * OZScene::setCurrentTime(CMTime const&)  @0x4fb80
   *   __ZN7OZScene14setCurrentTimeERK6CMTime
   *
   *   0x4fb80: pushq  %rbp
   *   0x4fb81: movq   %rsp,%rbp
   *   0x4fb84: movq   0x10(%rsi),%rax                                      # rax = src->epoch (8 B @+0x10)
   *   0x4fb88: movq   %rax,0x3c8(%rdi)                                     # this->currentTime.epoch = rax  (@+0x3c8)
   *   0x4fb8f: movups (%rsi),%xmm0                                         # xmm0 = src->{value, timescale, flags} (16 B @+0x00)
   *   0x4fb92: movups %xmm0,0x3b8(%rdi)                                    # this->currentTime.{value,timescale,flags} = xmm0 (@+0x3b8)
   *   0x4fb99: popq %rbp ; retq
   *   0x4fb9b: nopl (%rax,%rax)
   *
   * The exact mirror of getCurrentTime() @0x4fba0. `%rdi` = this, `%rsi` =
   * the CMTime const& source (no hidden sret — this returns void). It copies
   * the 24-byte CMTime (16-byte {value,timescale,flags} block via movups from
   * +0x00, then the 8-byte epoch tail via movq from +0x10) into the scene's
   * currentTime slot at +0x3b8..+0x3cf.
   *
   * The CMTime interface layout (raw-port/src/infra/CMTime.ts) is:
   *   +0x00 value:int64  +0x08 timescale:int32  +0x0c flags:uint32  +0x10 epoch:int64
   * so `movups (%rsi)` is exactly {value, timescale, flags} and `movq 0x10(%rsi)`
   * is exactly epoch.
   *
   * ZERO in-scope callees, ZERO externs. Pure field writes.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN7OZScene14setCurrentTimeERK6CMTime.s (10 lines)
   */
  setCurrentTime(t: CMTime): void {
    // @0x4fb84..0x4fb88  movq 0x10(%rsi),%rax ; movq %rax,0x3c8(%rdi)
    //   Copies the 8-byte epoch tail into +0x3c8.
    // @0x4fb8f..0x4fb92  movups (%rsi),%xmm0 ; movups %xmm0,0x3b8(%rdi)
    //   Copies the 16-byte {value, timescale, flags} block into +0x3b8.
    this.currentTime = {
      value: t.value,
      timescale: t.timescale,
      flags: t.flags,
      epoch: t.epoch,
    };
  }

  /**
   * OZScene::gotoHeadOfPlayRange()  @Ozone 0x71ea0
   *   __ZN7OZScene19gotoHeadOfPlayRangeEv
   *
   * Sets `currentTime` to the START of whichever play range the +0x20 variant
   * selector picks — "rewind the playhead to the head of the play range".
   *
   * Full transcription — every instruction, in order (14-line disasm at
   * raw-port/re/disasm/__ZN7OZScene19gotoHeadOfPlayRangeEv.s):
   *
   *   0x71ea0  pushq  %rbp                    ; frame setup (no TS counterpart)
   *   0x71ea1  movq   %rsp,%rbp               ; frame setup (no TS counterpart)
   *   0x71ea4  leaq   0x4e0(%rdi),%rax        ; rax = &playRangeSecondary
   *   0x71eab  leaq   0x4b0(%rdi),%rcx        ; rcx = &playRangePrimary
   *   0x71eb2  cmpl   $-0x1,0x20(%rdi)        ; variantSelector == -1 ?
   *   0x71eb6  cmoveq %rcx,%rax               ;   if equal, rax = &playRangePrimary
   *   0x71eba  movups (%rax),%xmm0            ; \ 16 bytes: start.{value,timescale,flags}
   *   0x71ebd  movups %xmm0,0x3b8(%rdi)       ; /  -> currentTime.{value,timescale,flags}
   *   0x71ec4  movq   0x10(%rax),%rax         ; \ 8 bytes: start.epoch
   *   0x71ec8  movq   %rax,0x3c8(%rdi)        ; /  -> currentTime.epoch
   *   0x71ecf  popq   %rbp                    ; frame teardown (no TS counterpart)
   *   0x71ed0  retq
   *   0x71ed1  nopw %cs:(%rax,%rax)           ; alignment padding, not executed
   *
   * Decode notes:
   *   * the selector test is the SAME `cmpl $-0x1,0x20(%rdi)` + `cmove` pair
   *     that `getPlayRange` @0x4fb10 uses (and the same polarity: EQUAL to -1
   *     selects the PRIMARY range at +0x4b0, otherwise the SECONDARY at +0x4e0),
   *     so this method reuses the ported selector logic verbatim rather than
   *     restating it. Both `leaq`s are computed before the compare; only the
   *     `cmove` chooses.
   *   * the copy reads the range's FIRST 24 bytes — offset +0x00 of the 0x30-byte
   *     PCTimeRange, i.e. its `start` CMTime (the `duration` at +0x18 is not
   *     touched) — and writes them into the +0x3b8 currentTime slot in the same
   *     16-then-8 split the landed getCurrentTime/setCurrentTime ports document.
   *   * unlike `setPlayRange`, there is NO self-alias check: source and
   *     destination can never overlap here (+0x3b8 vs +0x4b0/+0x4e0).
   *   * ZERO callees: no in-scope call, no extern, no indirect or virtual
   *     dispatch (`depgraph.py deps` lists nothing). Pure field moves.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN7OZScene19gotoHeadOfPlayRangeEv.s (14 lines)
   */
  gotoHeadOfPlayRange(): void {
    // @0x71ea4/@0x71eab/@0x71eb2/@0x71eb6 — the selector picks the range whose
    //   address ends up in %rax. Identical to getPlayRange's cmove @0x4fb26.
    const sel = this.playRangeVariantSelector >>> 0;
    const range =
      sel === 0xffffffff ? this.playRangePrimary : this.playRangeSecondary;

    // @0x71eba/@0x71ec4 read 24 bytes out of that range. In the binary the two
    //   slots are EMBEDDED storage (`leaq`, not a pointer load), so %rax is
    //   never null and the bytes always exist. In this port they are nullable
    //   handles because OZScene's ctor @0x4cc00 is still frontier and never
    //   populates them — a null/unpopulated range here is a PORT-STATE gap, not
    //   a branch the machine has, so it is surfaced loudly instead of being
    //   silently replaced with a zero CMTime (which would be a plausible wrong
    //   answer of exactly the kind the gate's G7 note warns about).
    const start = range === null ? undefined : range.start;
    if (start === undefined) {
      throw new Error(
        "OZScene::gotoHeadOfPlayRange @Ozone 0x71eba — the embedded PCTimeRange at " +
          "+0x4b0/+0x4e0 has no decoded `start` in this port (OZScene's ctor @Ozone 0x4cc00 " +
          "is not yet transcribed, so the slot is unpopulated); refusing to invent a CMTime",
      );
    }

    // @0x71eba/@0x71ebd  movups (%rax),%xmm0 ; movups %xmm0,0x3b8(%rdi)
    //   — the 16-byte {value, timescale, flags} block, copied FIRST.
    // @0x71ec4/@0x71ec8  movq 0x10(%rax),%rax ; movq %rax,0x3c8(%rdi)
    //   — then the 8-byte epoch tail. The copy is BY VALUE (bytes into the
    //   embedded currentTime), so the port builds a fresh CMTime rather than
    //   aliasing the range's object.
    this.currentTime = {
      value: start.value,
      timescale: start.timescale,
      flags: start.flags,
      epoch: start.epoch,
    };
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

  /**
   * OZScene::end_all_sel()  @Ozone 0x50cc0
   *   __ZN7OZScene11end_all_selEv
   *
   *   0x50cc0: pushq  %rbp
   *   0x50cc1: movq   %rsp,%rbp
   *   0x50cc4: movq   %rdi,%rax                    # sret ptr passthrough (rax = ret slot)
   *   0x50cc7: movq   0x3d8(%rsi),%rcx             # rcx = *(this+0x3d8)  (companion qword)
   *   0x50cce: addq   $0x3d0,%rsi                  # rsi = &this+0x3d0    (sentinel node addr)
   *   0x50cd5: xorps  %xmm0,%xmm0                  # xmm0 = 0
   *   0x50cd8: movups %xmm0,0x40(%rdi)             # ret[+0x40..+0x4f] = 0
   *   0x50cdc: movups %xmm0,0x30(%rdi)             # ret[+0x30..+0x3f] = 0
   *   0x50ce0: movups %xmm0,0x18(%rdi)             # ret[+0x18..+0x27] = 0
   *   0x50ce4: movl   $0x3f800000,0x50(%rdi)       # ret[+0x50] = 1.0f
   *   0x50ceb: movq   %rsi,(%rdi)                  # ret[+0x00] = &this+0x3d0
   *   0x50cee: movq   %rcx,0x8(%rdi)               # ret[+0x08] = *(this+0x3d8)
   *   0x50cf2: movq   %rsi,0x10(%rdi)              # ret[+0x10] = &this+0x3d0
   *   0x50cf6: movl   $0x0,0x28(%rdi)              # ret[+0x28] = 0 (u32)
   *   0x50cfd: popq %rbp ; retq
   *
   * A struct-returning function: the SysV ABI passes the return-value slot in
   * `%rdi` (sret) so `%rsi` holds `this`. It builds the "past-the-end" iterator
   * of the scene's all-selected collection — both node slots (+0x00, +0x10) get
   * the ADDRESS of the collection's embedded sentinel (this+0x3d0), +0x08 gets
   * the companion pointer read from this+0x3d8, the cursor/accumulator regions
   * (+0x18, +0x28, +0x30, +0x40) are zeroed, and a normalized weight/fraction
   * default of 1.0f is written at +0x50.
   *
   * ZERO in-scope callees, ZERO externs — pure field reads + immediate stores
   * (`python3 raw-port/army/tools/depgraph.py deps __ZN7OZScene11end_all_selEv`
   * returns empty). Constant: 0x3f800000 == Math.fround(1.0).
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN7OZScene11end_all_selEv.s (18 lines)
   */
  end_all_sel(): OZSceneAllSelIterator {
    // @0x50cc7  movq 0x3d8(%rsi),%rcx — companion qword read first (matches
    //           the machine's load order).
    const companion = this.allSelSentinelCompanion;
    // @0x50cce  addq $0x3d0,%rsi — address-of the sentinel slot.
    const sentinel = this.allSelSentinel;
    return {
      node: sentinel, // @0x50ceb  movq %rsi,(%rdi)      ret[+0x00]
      aux: companion, // @0x50cee  movq %rcx,0x8(%rdi)   ret[+0x08]
      nodeAlt: sentinel, // @0x50cf2 movq %rsi,0x10(%rdi) ret[+0x10]
      zero18: [0, 0, 0, 0], // @0x50ce0  movups %xmm0,0x18(%rdi)
      u28: 0, // @0x50cf6  movl $0x0,0x28(%rdi)
      zero30: [0, 0, 0, 0], // @0x50cdc  movups %xmm0,0x30(%rdi)
      zero40: [0, 0, 0, 0], // @0x50cd8  movups %xmm0,0x40(%rdi)
      f50: Math.fround(1.0), // @0x50ce4  movl $0x3f800000,0x50(%rdi)
    };
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
   * Frontier: `__dynamic_cast(node, &__ZTI11OZSceneNode, &__ZTI<Target>, 0)` — the
   * Itanium C++ ABI RTTI helper `___dynamic_cast`, called via @Ozone symbol stub
   * 0x6dfd0e FIVE times by isRootNode (@0x52906/0x52926/0x52943/0x52960/0x5297d).
   * Returns non-null iff `node` is-a `<Target>`. Provided by libc++abi and NOT
   * transcribed here (out-of-scope C++ runtime extern); a faithful port delegates to
   * whatever RTTI/lineage mechanism the surrogate stands up. Mirrors the peer
   * ozSGOnodeValidator's `cxx_dynamic_cast_stub`. The exact target typeinfo is cited so
   * the frontier gap stays visible.
   */
  private static _dynamicCastSceneNodeTo(
    _node: OZSceneNodeHandle,
    _dstTypeInfoName: string,
  ): OZSceneNodeHandle | null {
    throw new Error(
      "OZScene::isRootNode __dynamic_cast @Ozone stub 0x6dfd0e (___dynamic_cast — " +
        "libc++abi RTTI helper, not yet transcribed) — src=__ZTI11OZSceneNode, dst=" +
        _dstTypeInfoName +
        " (call sites @0x52906 -> OZProjectNode, @0x52926 -> OZGroup, @0x52943 -> " +
        "OZCamera, @0x52960 -> OZLight, @0x5297d -> OZRig)",
    );
  }

  /**
   * OZScene::isRootNode(OZSceneNode*)  @Ozone 0x528e0
   *   (__ZN7OZScene10isRootNodeEP11OZSceneNode)
   *
   * Predicate: returns true iff `node` is non-null AND dynamic_casts successfully to
   * ONE of the five "root-eligible" scene-node subclasses — OZProjectNode, OZGroup,
   * OZCamera, OZLight, or OZRig. A null node returns false; otherwise the first
   * successful cast short-circuits to true, and the final cast's success feeds the
   * `setne` result.
   *
   * DECODE (raw-port/re/disasm/__ZN7OZScene10isRootNodeEP11OZSceneNode.s):
   *   0x528e0  pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx    ; frame
   *   0x528e7  testq %rsi,%rsi ; je 0x5298b                             ; node==null -> r14=0
   *   0x528f0  movq  %rsi,%rbx                                          ; rbx = node
   *   ;; Check #1 — is-a OZProjectNode?
   *   0x528f3  leaq __ZTI11OZSceneNode(%rip),%rsi                       ; src typeinfo
   *   0x528fa  leaq __ZTI13OZProjectNode(%rip),%rdx                     ; dst typeinfo
   *   0x52901  movq %rbx,%rdi ; 0x52904 xorl %ecx,%ecx (hint=0)
   *   0x52906  callq ___dynamic_cast
   *   0x5290b  movb $0x1,%r14b                                          ; presume true
   *   0x5290e  testq %rax,%rax ; jne 0x5298e                            ; is-a -> return 1
   *   ;; Check #2 — is-a OZGroup?
   *   0x52913  leaq __ZTI11OZSceneNode ; 0x5291a leaq __ZTI7OZGroup ; movq %rbx,%rdi ; hint=0
   *   0x52926  callq ___dynamic_cast ; 0x5292b testq ; jne 0x5298e      ; is-a -> return 1
   *   ;; Check #3 — is-a OZCamera?
   *   0x52930  leaq __ZTI11OZSceneNode ; 0x52937 leaq __ZTI8OZCamera ; movq %rbx,%rdi ; hint=0
   *   0x52943  callq ___dynamic_cast ; 0x52948 testq ; jne 0x5298e      ; is-a -> return 1
   *   ;; Check #4 — is-a OZLight?
   *   0x5294d  leaq __ZTI11OZSceneNode ; 0x52954 leaq __ZTI7OZLight ; movq %rbx,%rdi ; hint=0
   *   0x52960  callq ___dynamic_cast ; 0x52965 testq ; jne 0x5298e      ; is-a -> return 1
   *   ;; Check #5 — is-a OZRig?  (final; result feeds setne)
   *   0x5296a  leaq __ZTI11OZSceneNode ; 0x52971 leaq __ZTI5OZRig ; movq %rbx,%rdi ; hint=0
   *   0x5297d  callq ___dynamic_cast
   *   0x52982  testq %rax,%rax ; 0x52985 setne %r14b                    ; r14b = (rax != 0)
   *   0x52989  jmp 0x5298e
   *   0x5298b  xorl %r14d,%r14d                                          ; null-node path -> 0
   *   0x5298e  movl %r14d,%eax ; pop ; retq                              ; return r14b
   *
   * The ONLY callee is `___dynamic_cast` (libc++abi RTTI extern) — every cast goes
   * through the frontier helper above. No in-scope callees.
   */
  isRootNode(node: OZSceneNodeHandle | null): boolean {
    // @0x528e7 testq %rsi,%rsi ; je -> a null node is never a root node.
    if (node === null || node === undefined) {
      // @0x5298b xorl %r14d,%r14d -> return false.
      return false;
    }
    // @0x528f3..0x5290e Check #1: is-a OZProjectNode (dst typeinfo __ZTI13OZProjectNode).
    //   `movb $0x1,%r14b` presumes true; a non-null cast returns immediately.
    if (OZScene._dynamicCastSceneNodeTo(node, "__ZTI13OZProjectNode") !== null) {
      return true; // @0x5290e jne 0x5298e (r14b == 1)
    }
    // @0x52913..0x5292e Check #2: is-a OZGroup (__ZTI7OZGroup).
    if (OZScene._dynamicCastSceneNodeTo(node, "__ZTI7OZGroup") !== null) {
      return true; // @0x5292e jne 0x5298e
    }
    // @0x52930..0x5294b Check #3: is-a OZCamera (__ZTI8OZCamera).
    if (OZScene._dynamicCastSceneNodeTo(node, "__ZTI8OZCamera") !== null) {
      return true; // @0x5294b jne 0x5298e
    }
    // @0x5294d..0x52968 Check #4: is-a OZLight (__ZTI7OZLight).
    if (OZScene._dynamicCastSceneNodeTo(node, "__ZTI7OZLight") !== null) {
      return true; // @0x52968 jne 0x5298e
    }
    // @0x5296a..0x52985 Check #5 (final): is-a OZRig (__ZTI5OZRig). `setne %r14b`
    //   sets the result to (cast != null).
    return OZScene._dynamicCastSceneNodeTo(node, "__ZTI5OZRig") !== null;
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

  /**
   * `OZScene::getToneMappingMode() const`
   *   — @Ozone 0x81e90
   *   — __ZNK7OZScene18getToneMappingModeEv
   *
   * Faithful line-for-line transcription of the 5-instruction body — a
   * single 32-bit field read, no branch, no callee:
   *
   *   0x81e90  pushq %rbp                    ; frame prologue
   *   0x81e91  movq  %rsp, %rbp
   *   0x81e94  movl  0xd0(%rdi), %eax        ; eax = *(u32*)(this + 0xd0)
   *   0x81e9a  popq  %rbp                    ; frame epilogue
   *   0x81e9b  retq                          ; return eax
   *   0x81e9c  nopl  (%rax)                  ; alignment padding
   *
   * System-V x86_64: `%rdi` = `this` (the method is `const`, so nothing is
   * written), `%eax` is the return register. `movl` is the 32-bit form, so
   * exactly 4 bytes are read and the write to `%eax` zeroes the upper half
   * of `%rax` — the result is the unsigned 32-bit word at +0xd0, which
   * `>>> 0` reproduces.
   *
   * The return type is an enum code in C++ (the name says "mode"), but the
   * disassembly shows only a raw 32-bit load, so this port returns `number`
   * rather than inventing an enumerator set.
   *
   * Zero in-scope callees, zero externs, no indirect or virtual calls.
   * Confirmed via `depgraph.py deps __ZNK7OZScene18getToneMappingModeEv`
   * (no dependency rows).
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK7OZScene18getToneMappingModeEv.s (7 lines)
   */
  getToneMappingMode(): number {
    // @0x81e90..0x81e91 — prologue (no TS-visible effect).
    // @0x81e94           — movl 0xd0(%rdi), %eax: read the u32 at +0xd0.
    // @0x81e9a..0x81e9b — epilogue + retq (return eax).
    return this.toneMappingMode_at_0xd0 >>> 0;
  }

  /**
   * `OZScene::setToneMappingMode(PCToneMappingMode)`
   *   — @Ozone 0x81ea0
   *   — __ZN7OZScene18setToneMappingModeE17PCToneMappingMode
   *
   * Faithful line-for-line transcription of the 5-instruction body — the
   * exact mirror of `getToneMappingMode()` @0x81e90: one 32-bit store, no
   * branch, no read-back, no callee:
   *
   *   0x81ea0  pushq %rbp                    ; frame prologue
   *   0x81ea1  movq  %rsp, %rbp
   *   0x81ea4  movl  %esi, 0xd0(%rdi)        ; *(u32*)(this + 0xd0) = (u32)mode
   *   0x81eaa  popq  %rbp                    ; frame epilogue
   *   0x81eab  retq                          ; void
   *   0x81eac  nopl  (%rax)                  ; alignment padding
   *
   * System-V x86_64: `%rdi` = `this`, `%esi` = the `PCToneMappingMode`
   * argument (a 32-bit enum passed in the low half of the second integer
   * register). `movl` stores exactly those 4 bytes at +0xd0 — the same slot
   * the getter reads @0x81e94 — with no masking, no range check and no
   * normalisation, so the port stores the raw 32 bits via `>>> 0`.
   *
   * The parameter is typed `number`, not an enum: `PCToneMappingMode` has no
   * transcribed definition anywhere in the port yet (its enumerators are not
   * observable from this instruction), and the machine copies whatever 32
   * bits arrive. Typing it as a TS enum would assert a value set this unit
   * has no evidence for.
   *
   * Returns void — %rax is never written before `retq`.
   *
   * Zero in-scope callees, zero externs, no indirect or virtual calls.
   * Confirmed via `depgraph.py deps
   * __ZN7OZScene18setToneMappingModeE17PCToneMappingMode` (no dependency
   * rows).
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN7OZScene18setToneMappingModeE17PCToneMappingMode.s
   *   (7 lines)
   */
  setToneMappingMode(mode: number): void {
    // @0x81ea0..0x81ea1 — prologue (no TS-visible effect).
    // @0x81ea4           — movl %esi, 0xd0(%rdi): store the 32-bit argument
    //                      into the u32 field at +0xd0.
    this.toneMappingMode_at_0xd0 = mode >>> 0;
    // @0x81eaa..0x81eab — epilogue + retq (no return value).
  }
}
