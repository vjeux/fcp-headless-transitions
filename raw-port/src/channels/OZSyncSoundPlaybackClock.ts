// OZSyncSoundPlaybackClock.ts — @Ozone 0x62d330..0x62d8f6
//
// A "playback clock" that synchronizes visual frame time to an OZAudioMixer's audio-clock. Given
// a scene, an audio mixer, an initial CMTime and a play-mode int, it:
//   - snapshots the scene's frame duration (from OZSceneSettings::getFrameDuration) into +0x10
//   - stores the mixer pointer at +0x30 and the initial time at +0x38 (renderTime) and +0x54
//     (displayTime), both as full 24-byte CMTime slots including epoch
//   - holds a PCSpinLock at +0x28 protecting reads/writes of renderTime/displayTime
//   - exposes 3 time queries: getFlooredMixerTime, nextFrameToRender, nextFrameToDisplay — each
//     asks the mixer for its running frame-time, wraps it in CMTimeMakeWithEpoch stamped with
//     the ctor-captured epoch (this[+0x20]), and floors it to the scene's sample duration via
//     PC_CMTimeFloorToSampleDuration (a ProCore helper that snaps a CMTime to the nearest
//     multiple of a sample-duration CMTime)
//   - nextFrameToRender additionally advances the internal renderTime through the scene's play
//     range via OZIncrementTimeLooped, sets *wrappedOut to the wrap flag, and updates displayTime
//     if the newly-floored mixer time is behind the current renderTime (or ahead of endOfLoop,
//     depending on playMode).
//
// This is a data-holder + glue class: the substantive math lives in
//   OZAudioMixer::getFrameTimeWithEpoch()                       @Ozone (call-sites @0x62d44c, @0x62d4fc, @0x62d74e)  --  undecoded
//   OZIncrementTimeLooped::getEndTime / ctor / operator()       @Ozone 0x62c8d0..0x62cfb2  --  already ported (raw-port/src/channels/OZIncrementTimeLooped.ts)
//   PC_CMTimeFloorToSampleDuration                              @ProCore stub 0x6dced6 -- undecoded
//   CMTimeMakeWithEpoch                                         @CoreMedia (public API)
//   CMTimeMake / CMTimeCompare                                  @CoreMedia (public API, ported in infra/CMTime.ts)
//
// Class layout — recovered from ctor stores at +0x08..+0x64 (see raw-port/re/disasm/
// OZSyncSoundPlaybackClock.OZSyncSoundPlaybackClock.s) and re-read sites in each method:
//   +0x00     vtable ptr                                        @0x62d3c7..ce (leaq 0x259f92(%rip), %rax; mov %rax, (%rdi))
//   +0x08     OZScene* scene                                    @0x62d3d1 (mov %rsi, 0x8(%rdi))
//   +0x10..+0x27  CMTime frameDuration                          @0x62d3d5..e0 (rdi+=0x10; OZSceneSettings::getFrameDuration returns 24-byte CMTime by SRV)
//     +0x10  value (int64), +0x18 timescale (int32) + flags (uint32), +0x20 epoch (int64)
//   +0x28     PCSpinLock (int32 os_unfair_lock word, ProCore)   @0x62d3e5 (movl $0, 0x28(%r12))
//   +0x30     OZAudioMixer* mixer                               @0x62d3ee (mov %r15, 0x30(%r12))
//   +0x38..+0x4f  CMTime renderTime                             @0x62d3f3..401 (movups from %r14=&CMTime arg -> +0x38 16B, mov %rax=epoch -> +0x48 8B)
//   +0x50     int32 playMode                                    @0x62d406 (movl %ebx, 0x50(%r12))
//   +0x54..+0x6b  CMTime displayTime                            @0x62d40b..419 (same 24B CMTime copied a second time)
//
// Notes on the two constructor entry points:
//   C1 @Ozone 0x62d3b0 and C2 @Ozone 0x62d330 are byte-identical bodies (same ordering, same
//   offsets, same callees, same field writes) -- only the vtable-load's PC-relative offset
//   differs (0x259f92 at C1 vs 0x25a012 at C2), which is expected because C1 is exactly 0x80
//   bytes past C2 and both PC-adds resolve to the SAME __ZTV24OZSyncSoundPlaybackClock. Clang
//   emits both because C1 is the "complete-object" and C2 the "base-object" ctor; here there is
//   no vbase so the bodies collapse to the same code. Only ONE TS constructor is transcribed --
//   see @0x62d3b0.
//
// Notes on the two destructors:
//   D1 @Ozone 0x62d8a0 -- writes vtable, tail-calls PCSpinLock::~PCSpinLock() on +0x28.
//   D0 @Ozone 0x62d8c0 -- D1 body + operator delete (deleting destructor). TS has no
//     "operator delete" so D0 just runs the D1 body and lets GC collect.
//
// Frontier decode gaps (each throw-stub cites its @0xADDR so frontier.py can see the demand):
//   OZAudioMixer::getFrameTimeWithEpoch()             @Ozone -- undecoded (used in 3 methods)
//   PC_CMTimeFloorToSampleDuration                    @ProCore stub 0x6dced6 -- undecoded
//   CMTimeMakeWithEpoch                               @CoreMedia public -- see helper below
//   OZSceneSettings::getFrameDuration()               @Ozone call @0x62d3e0 -- undecoded

import type { CMTime } from "../infra/CMTime.js";
import { CMTimeMake, CMTimeCompare, kCMTimeFlags_Valid } from "../infra/CMTime.js";
import { PCSpinLock } from "../infra/PCSpinLock.js";
import { OZIncrementTimeLooped } from "./OZIncrementTimeLooped.js";
import type { OZScene } from "../nodes/OZScene.js";

// ────────────────────────────────────────────────────────────────────────────────────────────
// Forward declarations -- undecoded external types.
// ────────────────────────────────────────────────────────────────────────────────────────────

/** OZAudioMixer -- opaque forward declaration. The mixer is passed in by ctor and stored at
 *  +0x30; the only method we invoke on it is getFrameTimeWithEpoch (which is undecoded). */
export interface OZAudioMixer {
  readonly __ozAudioMixerBrand?: never;
}

// ────────────────────────────────────────────────────────────────────────────────────────────
// CoreMedia public API -- CMTimeMakeWithEpoch. Same construction as CMTimeMake but carries an
// explicit epoch. Called via symbol stub _CMTimeMakeWithEpoch at 0x6dcace (see @0x62d4ac,
// @0x62d602, @0x62d7b4). CoreMedia header signature:
//   CMTime CMTimeMakeWithEpoch(int64_t value, int32_t timescale, CMTimeEpoch epoch);
// ────────────────────────────────────────────────────────────────────────────────────────────
function CMTimeMakeWithEpoch(value: bigint, timescale: number, epoch: bigint): CMTime {
  return { value, timescale, flags: kCMTimeFlags_Valid, epoch };
}

// ────────────────────────────────────────────────────────────────────────────────────────────
// Frontier accessors -- each cites the call-site addresses that surfaced the demand. Bodies
// remain undecoded -- a shortcut would silently corrupt the clock, so these throw.
// ────────────────────────────────────────────────────────────────────────────────────────────

/** OZAudioMixer::getFrameTimeWithEpoch() -- returns a 16-byte struct { int64 value, int32 timescale }
 *  (SRV via rdi at call sites) that is then fed to CMTimeMake. The epoch is not on the return
 *  value; a separate epoch is loaded from this[+0x20] and combined via CMTimeMakeWithEpoch.
 *  Body undecoded.
 *  @Ozone call-sites: 0x62d44c (getFlooredMixerTime), 0x62d4fc (nextFrameToRender), 0x62d74e (nextFrameToDisplay). */
function OZAudioMixer_getFrameTimeWithEpoch(_mixer: OZAudioMixer): { value: bigint; timescale: number } {
  throw new Error("OZAudioMixer::getFrameTimeWithEpoch() @Ozone 0x62d44c/0x62d4fc/0x62d74e -- undecoded");
}

/** PC_CMTimeFloorToSampleDuration(time, sampleDur) -> CMTime.
 *  Snaps `time` to an integer multiple of `sampleDur`. The 3 call-sites (@0x62d499, @0x62d552,
 *  @0x62d7a1) all push 4 stack-slots totalling 32 bytes: the outer CMTime (16 B) at (%rsp), the
 *  epoch (8 B) at 0x10(%rsp), and a second CMTime (16 B) -- the sample-duration -- at
 *  0x18(%rsp) plus its epoch at 0x28(%rsp). Body undecoded.
 *  @ProCore stub 0x6dced6. */
function PC_CMTimeFloorToSampleDuration(_time: CMTime, _sampleDur: CMTime): CMTime {
  throw new Error("PC_CMTimeFloorToSampleDuration @ProCore stub 0x6dced6 (call-sites @Ozone 0x62d499/0x62d552/0x62d7a1) -- undecoded");
}

/** OZSceneSettings::getFrameDuration() -- returns CMTime (24 bytes SRV). Called from ctor
 *  @0x62d3e0 (with %rsi = scene+0x90, i.e. the embedded OZSceneSettings). Body undecoded.
 *  Also demanded by OZIncrementTimeLooped -- when a decoded version lands, both files should
 *  switch to a shared import. */
function OZSceneSettings_getFrameDuration(_scene: OZScene): CMTime {
  throw new Error("OZSceneSettings::getFrameDuration() @Ozone (call @0x62d3e0) -- undecoded");
}

// ────────────────────────────────────────────────────────────────────────────────────────────

/**
 * OZSyncSoundPlaybackClock -- @Ozone 0x62d3b0..0x62d8f6.
 *
 * Fields correspond byte-for-byte to the ctor stores. `renderTime` and `displayTime` are both
 * initialised from the same input CMTime; `frameDuration` is fetched from the scene's settings.
 */
export class OZSyncSoundPlaybackClock {
  /** +0x08  OZScene* -- stored @0x62d3d1. */
  readonly scene: OZScene;
  /** +0x10..+0x27  CMTime -- scene's frame duration, fetched by ctor via
   *  OZSceneSettings::getFrameDuration() (@0x62d3e0). */
  frameDuration: CMTime;
  /** +0x28  PCSpinLock -- os_unfair_lock word, initialised to 0 @0x62d3e5 ("movl $0, 0x28(%r12)"),
   *  destroyed by ~OZSyncSoundPlaybackClock @0x62d8b3 (tail-call PCSpinLock::~PCSpinLock()). */
  readonly lock: PCSpinLock;
  /** +0x30  OZAudioMixer* -- stored @0x62d3ee. */
  readonly mixer: OZAudioMixer;
  /** +0x38..+0x4f  CMTime "renderTime" -- the last time returned by nextFrameToRender.
   *  Ctor initialises from input CMTime @0x62d3f3..401. */
  renderTime: CMTime;
  /** +0x50  int32 playMode -- stored @0x62d406 ("movl %ebx, 0x50(%r12)"), updated by setPlayMode. */
  playMode: number;
  /** +0x54..+0x6b  CMTime "displayTime" -- the last time returned by nextFrameToDisplay.
   *  Ctor initialises from input CMTime @0x62d40b..419. */
  displayTime: CMTime;

  // ──────────────────────────────────────────────────────────────────────────────────────────
  // OZSyncSoundPlaybackClock::OZSyncSoundPlaybackClock(OZScene*, OZAudioMixer*, CMTime const&, int)
  //   C1 @Ozone 0x62d3b0 (used as the single body -- C2 @0x62d330 is byte-identical, ICF-aliased
  //   modulo the RIP-relative constant for the same vtable address).
  //
  // Disasm (C1 body):
  //   (%rdi) = &vtable                                                    @0x62d3c7..ce
  //   0x8(%rdi) = scene                                                    @0x62d3d1
  //   getFrameDuration writes CMTime into this[+0x10..+0x27]               @0x62d3d5..e0
  //   this[+0x28] = 0   (os_unfair_lock init)                              @0x62d3e5
  //   this[+0x30] = mixer                                                  @0x62d3ee
  //   this[+0x38..+0x4f] = *timeArg   (CMTime copy: value+timescale+flags then epoch) @0x62d3f3..401
  //   this[+0x50] = playMode                                               @0x62d406
  //   this[+0x54..+0x6b] = *timeArg   (second CMTime copy, same source)    @0x62d40b..419
  // ──────────────────────────────────────────────────────────────────────────────────────────
  constructor(scene: OZScene, mixer: OZAudioMixer, time: CMTime, playMode: number) {
    // @0x62d3d1
    this.scene = scene;
    // @0x62d3d5..e0 -- OZSceneSettings is embedded at scene[+0x90]; getFrameDuration returns
    // a 24-byte CMTime by SRV. Undecoded -- throw-stub covers it.
    this.frameDuration = OZSceneSettings_getFrameDuration(scene);
    // @0x62d3e5 -- os_unfair_lock word init to 0 (unlocked); PCSpinLock ctor is a no-op that
    // models exactly this. The lock lives at +0x28 in the native layout; we hold it as a class
    // field here.
    this.lock = new PCSpinLock();
    // @0x62d3ee
    this.mixer = mixer;
    // @0x62d3f3..401 -- deep-copy CMTime (renderTime).
    this.renderTime = { value: time.value, timescale: time.timescale, flags: time.flags, epoch: time.epoch };
    // @0x62d406 -- playMode is a plain int32.
    this.playMode = playMode | 0;
    // @0x62d40b..419 -- deep-copy CMTime again (displayTime).
    this.displayTime = { value: time.value, timescale: time.timescale, flags: time.flags, epoch: time.epoch };
  }

  // ──────────────────────────────────────────────────────────────────────────────────────────
  // OZSyncSoundPlaybackClock::getFlooredMixerTime()  @Ozone 0x62d430
  //
  // Returns the mixer's current frame time, floored to the scene's frame-duration boundary,
  // stamped with the ctor-captured epoch (this[+0x20]).
  //
  // Disasm (no lock -- this is the raw query without touching internal state):
  //   base    = OZAudioMixer::getFrameTimeWithEpoch(this.mixer)                @0x62d44c
  //   madeIn  = CMTimeMake(base.value, base.timescale)                         @0x62d45c
  //   epoch   = this.frameDuration.epoch  (this[+0x20])                        @0x62d461..465
  //   dur     = this.frameDuration        (this[+0x10..+0x1f])                 @0x62d469..46e
  //   floored = PC_CMTimeFloorToSampleDuration(madeIn, epoch, dur)             @0x62d499
  //   return CMTimeMakeWithEpoch(floored.value, floored.timescale, epoch)      @0x62d4ac
  // ──────────────────────────────────────────────────────────────────────────────────────────
  /** @Ozone 0x62d430 -- mixer's frame time snapped to this.frameDuration and stamped with
   *  frameDuration.epoch. */
  getFlooredMixerTime(): CMTime {
    // @0x62d44c
    const base = OZAudioMixer_getFrameTimeWithEpoch(this.mixer);
    // @0x62d45c -- normalise to a CMTime with default flags before feeding to the floor helper.
    const madeIn = CMTimeMake(base.value, base.timescale);
    // @0x62d461..465 -- epoch = this.frameDuration.epoch (this[+0x20]).
    const epoch = this.frameDuration.epoch;
    // @0x62d499 -- sample-duration floor uses this.frameDuration as the sample-dur CMTime.
    const floored = PC_CMTimeFloorToSampleDuration(madeIn, this.frameDuration);
    // @0x62d4ac -- restamp with the captured epoch.
    return CMTimeMakeWithEpoch(floored.value, floored.timescale, epoch);
  }

  // ──────────────────────────────────────────────────────────────────────────────────────────
  // OZSyncSoundPlaybackClock::nextFrameToRender(bool* wrappedOut)  @Ozone 0x62d4c0
  //
  // 1) lock this[+0x28] (PCSpinLock::lock @0x62d4ef)
  // 2) flooredMixer = getFlooredMixerTime logic inlined (@0x62d4fc..56b -- same 4 calls)
  // 3) endOfLoop = this[+0x64] epoch value  (r12 = this.displayTime.epoch)     @0x62d577
  // 4) if (CMTimeCompare(this.renderTime[+0x38..+0x4f], flooredMixer) < 0) then
  //        this.renderTime := flooredMixer                                     @0x62d5c4..e1
  //    Layout evidence: %r14 was set to leaq 0x38(%r15) @0x62d5cd, and the compare reads from
  //    (%rbx)=SRV-out AND writes to (%rbx). Actually re-read: the flooredMixer sits at
  //    (%rbx)=SRV-out at this stage (@0x62d57b..586 copied this.renderTime INTO %rbx as the
  //    return-slot, then flooredMixer is the OTHER operand). The compare's result decides whether
  //    to overwrite (%rbx) with flooredMixer. So the SRV out (which is this.renderTime once we
  //    write it back at step 7) starts as a copy of this.renderTime and may be replaced by
  //    flooredMixer.
  // 5) endOfPlay = OZIncrementTimeLooped::getEndTime(this.displayTime, this.scene)  @0x62d5ef
  //    endTime = CMTimeMakeWithEpoch(endOfPlay.value, endOfPlay.timescale, endOfLoop)  @0x62d602
  //    if (CMTimeCompare(this.displayTime, endTime) < 0
  //        && (%rbx).epoch != endOfLoop
  //        && this.playMode == 0)
  //       (%rbx) := endTime                                                    @0x62d666
  // 6) if (wrappedOut) *wrappedOut = ((%rbx).epoch != endOfLoop)                @0x62d670..76
  // 7) OZIncrementTimeLooped incLoop((%rbx), this.scene)                        @0x62d687 (ctor)
  //    stepped = incLoop((%rbx), this.frameDuration, nullptr)                  @0x62d6a7 (operator())
  //    this.renderTime  (this[+0x38..+0x4f]) := stepped                        @0x62d6ac..be
  //    this.displayTime (this[+0x54..+0x6b]) := (%rbx)                         @0x62d6c2..cd
  // 8) unlock; return (%rbx)                                                    @0x62d6d9
  //
  // So the SRV out = the FLOORED/end-adjusted "next frame to render", the NEXT-time is stashed
  // into this.renderTime for the following call, and displayTime is set to the value we returned
  // this call (a "last frame displayed" cache).
  //
  // BECAUSE OZAudioMixer::getFrameTimeWithEpoch AND PC_CMTimeFloorToSampleDuration ARE
  // UNDECODED (both throw), this method will throw at runtime -- which is the correct behaviour
  // per PORTING_SPEC Rule 3 (a loud gap beats a silent guess).
  // ──────────────────────────────────────────────────────────────────────────────────────────
  /** @Ozone 0x62d4c0 -- advances internal renderTime through the scene's play range using
   *  OZIncrementTimeLooped and returns the new frame-to-render. When wrappedOut is non-null,
   *  sets its `value` to true iff the epoch changed vs the captured endOfLoop. */
  nextFrameToRender(wrappedOut: { value: boolean } | null): CMTime {
    // @0x62d4ef
    this.lock.lock();
    try {
      // @0x62d4fc..56b -- inlined getFlooredMixerTime.
      const baseIn = OZAudioMixer_getFrameTimeWithEpoch(this.mixer);
      const madeIn = CMTimeMake(baseIn.value, baseIn.timescale);
      const epoch = this.frameDuration.epoch;               // this[+0x20]
      const flooredMade = PC_CMTimeFloorToSampleDuration(madeIn, this.frameDuration);
      const flooredMixer = CMTimeMakeWithEpoch(flooredMade.value, flooredMade.timescale, epoch);

      // @0x62d57b..586 -- the SRV out-CMTime (%rbx) is seeded as a copy of this.renderTime.
      let out: CMTime = {
        value: this.renderTime.value, timescale: this.renderTime.timescale,
        flags: this.renderTime.flags, epoch: this.renderTime.epoch,
      };

      // @0x62d577 -- endOfLoop = this.displayTime.epoch (this[+0x64]).
      const endOfLoop = this.displayTime.epoch;

      // @0x62d5c4..e1 -- if (CMTimeCompare(out, flooredMixer) < 0) out := flooredMixer.
      if (CMTimeCompare(out, flooredMixer) < 0) {
        out = {
          value: flooredMixer.value, timescale: flooredMixer.timescale,
          flags: flooredMixer.flags, epoch: flooredMixer.epoch,
        };
      }

      // @0x62d5ef -- endOfPlay = OZIncrementTimeLooped::getEndTime(this.displayTime, this.scene).
      // getEndTime is a static-style call taking (CMTime const&, OZScene*).
      const endOfPlay = OZIncrementTimeLooped.getEndTime(this.displayTime, this.scene);
      // @0x62d602 -- endTime = CMTimeMakeWithEpoch(endOfPlay.value, endOfPlay.timescale, endOfLoop).
      const endTime = CMTimeMakeWithEpoch(endOfPlay.value, endOfPlay.timescale, endOfLoop);

      // @0x62d641..666 -- three ANDed guards, then out := endTime.
      if (
        CMTimeCompare(this.displayTime, endTime) < 0 &&
        out.epoch !== endOfLoop &&
        this.playMode === 0
      ) {
        // @0x62d657..663
        out = {
          value: endTime.value, timescale: endTime.timescale,
          flags: endTime.flags, epoch: endTime.epoch,
        };
      }

      // @0x62d670..676 -- if wrappedOut, *wrappedOut = (out.epoch != endOfLoop).
      if (wrappedOut) {
        wrappedOut.value = out.epoch !== endOfLoop;
      }

      // @0x62d687 -- OZIncrementTimeLooped incLoop(out, this.scene).
      const incLoop = new OZIncrementTimeLooped(out, this.scene);
      // @0x62d6a7 -- incLoop(out, this.frameDuration, nullptr).
      const stepped = incLoop.call(out, this.frameDuration, undefined);

      // @0x62d6ac..be -- this.renderTime (this[+0x38..+0x4f]) := stepped.
      this.renderTime = {
        value: stepped.value, timescale: stepped.timescale,
        flags: stepped.flags, epoch: stepped.epoch,
      };
      // @0x62d6c2..cd -- this.displayTime (this[+0x54..+0x6b]) := out.
      this.displayTime = {
        value: out.value, timescale: out.timescale,
        flags: out.flags, epoch: out.epoch,
      };

      return out;
    } finally {
      // @0x62d6d9
      this.lock.unlock();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────────────────
  // OZSyncSoundPlaybackClock::nextFrameToDisplay()  @Ozone 0x62d720
  //
  // Simpler than nextFrameToRender: just lock, inline getFlooredMixerTime (mixer time floored to
  // frameDuration, restamped with the captured epoch), unlock, return. No state update.
  //
  // Disasm:
  //   lock()                                                                    @0x62d741
  //   base = OZAudioMixer::getFrameTimeWithEpoch(this.mixer)                    @0x62d74e
  //   made = CMTimeMake(base.value, base.timescale)                             @0x62d761
  //   epoch = this.frameDuration.epoch                                          @0x62d766..76e
  //   floored = PC_CMTimeFloorToSampleDuration(made, epoch, this.frameDuration) @0x62d7a1
  //   result = CMTimeMakeWithEpoch(floored.value, floored.timescale, epoch)     @0x62d7b4
  //   unlock()                                                                  @0x62d7bc
  //   return result                                                              @0x62d7c1
  // ──────────────────────────────────────────────────────────────────────────────────────────
  /** @Ozone 0x62d720 -- locked variant of getFlooredMixerTime. Does NOT update state. */
  nextFrameToDisplay(): CMTime {
    // @0x62d741
    this.lock.lock();
    try {
      // @0x62d74e..76e -- inline getFlooredMixerTime.
      const base = OZAudioMixer_getFrameTimeWithEpoch(this.mixer);
      const made = CMTimeMake(base.value, base.timescale);
      const epoch = this.frameDuration.epoch;
      // @0x62d7a1
      const floored = PC_CMTimeFloorToSampleDuration(made, this.frameDuration);
      // @0x62d7b4
      return CMTimeMakeWithEpoch(floored.value, floored.timescale, epoch);
    } finally {
      // @0x62d7bc
      this.lock.unlock();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────────────────
  // OZSyncSoundPlaybackClock::setPlayMode(int)  @Ozone 0x62d7f0
  //
  // Locked write of the playMode int at this[+0x50].
  //
  // Disasm:
  //   lock()                                                                    @0x62d806
  //   this[+0x50] = %ebx                                                        @0x62d80b
  //   unlock()                                                                  @0x62d812
  //   return
  // ──────────────────────────────────────────────────────────────────────────────────────────
  /** @Ozone 0x62d7f0 -- atomically (under the spinlock) sets playMode. */
  setPlayMode(mode: number): void {
    // @0x62d806
    this.lock.lock();
    try {
      // @0x62d80b -- the 32-bit low half of the input; mask to int32 for parity with "movl".
      this.playMode = mode | 0;
    } finally {
      // @0x62d812
      this.lock.unlock();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────────────────
  // OZSyncSoundPlaybackClock::incrementDisplayTime()  @Ozone 0x62d8f0
  //
  // Empty. Disasm is push %rbp; mov %rsp,%rbp; pop %rbp; ret -- a 3-byte no-op function body.
  // The symbol exists (declared in the class) but its implementation is a stub. It was likely
  // superseded by nextFrameToDisplay + the renderTime-cache path in nextFrameToRender.
  // ──────────────────────────────────────────────────────────────────────────────────────────
  /** @Ozone 0x62d8f0 -- empty function body in the shipped FCP binary. */
  incrementDisplayTime(): void {
    // No body -- the FCP function is a bare "ret".
  }
}
