// OZEveryFramePlaybackClock — @Ozone 0x62cfc0..0x62d893
// A playback clock that steps EVERY frame with no rate control — each nextFrameToRender()/
// incrementDisplayTime() advances one frameDuration through OZIncrementTimeLooped (which
// wraps around the scene's play/loop range). Two independent CMTime cursors are kept:
//   - renderTime   (used by nextFrameToRender/…ToRender loop)
//   - displayTime  (used by nextFrameToDisplay/…DisplayTime loop)
// each guarded by its own PCSpinLock so render and display can advance concurrently.
//
// FCP class layout (probed byte-for-byte from ctor stores at 0x62cfc0..0x62d060 and consumers):
//   +0x00        vtable (Ozone data @0x887320 — resolved via resolve.py sym 0x887327)   [ptr]
//   +0x08        scene:              OZScene*                                            [ptr, 8B]
//   +0x10..+0x27 frameDuration:      CMTime — set from OZSceneSettings::getFrameDuration
//                                    (scene+0x90) at ctor+0x2b; negated in place if bool
//                                    forwardPlay arg is FALSE (ctor+0x77..0xa4 via CMTimeMake).
//   +0x28..+0x2b renderLock:         PCSpinLock (4-byte int, zero-init at ctor+0x39)
//   +0x2c..+0x43 renderTime:         CMTime — init = ctor's sceneTime arg (16B value+ts+flags
//                                    + 8B epoch)
//   +0x44        renderWrappedFlag:  uint8_t (0 init; updated by OZIncrementTimeLooped when the
//                                    step crosses a loop boundary)
//   +0x48..+0x4b displayLock:        PCSpinLock (4-byte int)
//   +0x4c..+0x63 displayTime:        CMTime — init = ctor's sceneTime arg
// Total object size: 0x64 = 100 bytes (aligned).
//
// FCP methods (all present, all faithfully transcribed):
//   OZEveryFramePlaybackClock::OZEveryFramePlaybackClock(OZScene*, CMTime const&, bool) C2  @0x62cfc0
//   OZEveryFramePlaybackClock::OZEveryFramePlaybackClock(OZScene*, CMTime const&, bool) C1  @0x62d090
//     (C1 and C2 have byte-identical bodies at distinct addresses — NOT ICF-folded; each was
//      individually disassembled and confirmed via otool -tvV.)
//   OZEveryFramePlaybackClock::nextFrameToRender(bool*)                                     @0x62d160
//   OZEveryFramePlaybackClock::nextFrameToDisplay()                                         @0x62d230
//   OZEveryFramePlaybackClock::incrementDisplayTime()                                       @0x62d280
//   OZEveryFramePlaybackClock::setPlayMode(int)                                             @0x62d320
//     — NO-OP in FCP. Body is literally `pushq %rbp; movq %rsp,%rbp; popq %rbp; retq` at
//       @0x62d320..0x62d325. The "every-frame" clock intentionally ignores play mode.
//   OZEveryFramePlaybackClock::~OZEveryFramePlaybackClock() D1                              @0x62d830
//   OZEveryFramePlaybackClock::~OZEveryFramePlaybackClock() D0                              @0x62d860
//
// Disasm evidence (in this worktree):
//   raw-port/re/disasm/OZEveryFramePlaybackClock.OZEveryFramePlaybackClock.s     (C1 @0x62d090)
//   raw-port/re/disasm/OZEveryFramePlaybackClock.nextFrameToRender.s
//   raw-port/re/disasm/OZEveryFramePlaybackClock.nextFrameToDisplay.s
//   raw-port/re/disasm/OZEveryFramePlaybackClock.incrementDisplayTime.s
//   raw-port/re/disasm/OZEveryFramePlaybackClock.setPlayMode.s
//   raw-port/re/disasm/OZEveryFramePlaybackClock.~OZEveryFramePlaybackClock.s    (D0 @0x62d860)
//   (C2 @0x62cfc0 dumped inline via `otool -tvV -p ...C2...` — byte-identical to C1)
//
// Frontier decode gap surfaced by this port (throw-stub, addr-cited):
//   OZSceneSettings::getFrameDuration() const   @Ozone 0x62cff4 (C2), 0x62d0c4 (C1) — undecoded.
//     Called with rdi=&this[+0x10] (hidden-return CMTime slot) and rsi=scene+0x90 (embedded
//     OZSceneSettings). Also cited in OZIncrementTimeLooped and OZImageEnvironment.

import { CMTime, CMTimeMake } from "../infra/CMTime.js";
import { PCSpinLock } from "../infra/PCSpinLock.js";
import {
  OZIncrementTimeLooped,
  // OZScene interface used here is the same nominal type declared alongside
  // OZIncrementTimeLooped's frontier stubs.
} from "./OZIncrementTimeLooped.js";
// OZScene comes from the scene-node hierarchy — same import that OZIncrementTimeLooped uses so
// the OZScene* argument passes through unchanged.
import type { OZScene } from "../nodes/OZScene.js";

// ────────────────────────────────────────────────────────────────────────────────────────
// Frontier accessor — undecoded. Cite the call-sites and throw.
//
// OZSceneSettings::getFrameDuration() const @Ozone 0x62cff4 (from C2 ctor @0x62cfc0),
//                                             0x62d0c4 (from C1 ctor @0x62d090).
// Reads a CMTime from an OZSceneSettings block that lives embedded at scene+0x90.
// ────────────────────────────────────────────────────────────────────────────────────────
function OZSceneSettings_getFrameDuration(_scene: OZScene): CMTime {
  throw new Error(
    "OZSceneSettings::getFrameDuration() @Ozone 0x62cff4/0x62d0c4 not yet transcribed"
  );
}

export class OZEveryFramePlaybackClock {
  /** +0x08 — the scene this clock reads frameDuration and play-range from. */
  scene: OZScene;
  /** +0x10..+0x27 — the per-frame step. Negated in the ctor when forwardPlay=false. */
  frameDuration: CMTime;
  /** +0x28..+0x2b — 4-byte spinlock guarding renderTime + renderWrappedFlag. */
  renderLock: PCSpinLock;
  /** +0x2c..+0x43 — current render-side cursor (advanced by nextFrameToRender). */
  renderTime: CMTime;
  /** +0x44 — set by OZIncrementTimeLooped when the last step crossed a loop boundary. */
  renderWrappedFlag: boolean;
  /** +0x48..+0x4b — 4-byte spinlock guarding displayTime. */
  displayLock: PCSpinLock;
  /** +0x4c..+0x63 — current display-side cursor (advanced by incrementDisplayTime). */
  displayTime: CMTime;

  // ────────────────────────────────────────────────────────────────────────────────────
  // OZEveryFramePlaybackClock(OZScene* scene, CMTime const& sceneTime, bool forwardPlay)
  //   @Ozone 0x62d090 (C1)  and  @0x62cfc0 (C2, byte-identical body)
  // Disasm mirrored line-for-line (C1 shown; C2 differs only in vtable RIP offset):
  //   *this          := vtable OZEveryFramePlaybackClock (@0x887320)   @0x62d0a8..0x62d0af
  //   this[+0x08]    := scene                                          @0x62d0b2
  //   this[+0x10..]  := OZSceneSettings::getFrameDuration(scene+0x90)  @0x62d0c4
  //   this[+0x28]    := 0    (renderLock init)                         @0x62d0c9
  //   this[+0x2c..+0x3b] := sceneTime[0..0xf]                           @0x62d0d1..0x62d0d6
  //   this[+0x3c..+0x43] := sceneTime[0x10..0x17]  (epoch)              @0x62d0db..0x62d0e0
  //   this[+0x44]    := 0    (renderWrappedFlag)                       @0x62d0e4
  //   this[+0x48]    := 0    (displayLock init)                        @0x62d0e9
  //   this[+0x4c..+0x5b] := sceneTime[0..0xf]                           @0x62d0f1..0x62d0f6
  //   this[+0x5c..+0x63] := sceneTime[0x10..0x17]                       @0x62d0fb..0x62d100
  //   if (!forwardPlay) {                                              @0x62d104 test+jne
  //     rsi := 0 - this[+0x10]   (negate frameDuration.value)          @0x62d113
  //     rdx := this[+0x18]       (frameDuration.timescale)             @0x62d117
  //     tmp := CMTimeMake(-value, timescale)                           @0x62d11f
  //     this[+0x10..+0x1f] := tmp[0..0xf]                              @0x62d128..0x62d130
  //     this[+0x20..+0x27] := tmp[0x10..0x17]   (epoch, 0 from CMTimeMake)
  //   }
  // Note: FCP's CMTimeMake sets flags=Valid and epoch=0 regardless of the input's original epoch,
  // so the negate branch also RESETS frameDuration.epoch to 0 — matched here by CMTimeMake().
  // ────────────────────────────────────────────────────────────────────────────────────
  constructor(scene: OZScene, sceneTime: CMTime, forwardPlay: boolean) {
    // @0x62d0b2
    this.scene = scene;
    // @0x62d0c4 — frameDuration read from settings (undecoded frontier stub).
    this.frameDuration = OZSceneSettings_getFrameDuration(scene);
    // @0x62d0c9
    this.renderLock = new PCSpinLock();
    // @0x62d0d1..0x62d0e0 — copy sceneTime into renderTime (value+ts+flags+epoch).
    this.renderTime = {
      value: sceneTime.value,
      timescale: sceneTime.timescale,
      flags: sceneTime.flags,
      epoch: sceneTime.epoch,
    };
    // @0x62d0e4
    this.renderWrappedFlag = false;
    // @0x62d0e9
    this.displayLock = new PCSpinLock();
    // @0x62d0f1..0x62d100 — copy sceneTime into displayTime.
    this.displayTime = {
      value: sceneTime.value,
      timescale: sceneTime.timescale,
      flags: sceneTime.flags,
      epoch: sceneTime.epoch,
    };
    // @0x62d104..0x62d132 — if forwardPlay is false, negate frameDuration via CMTimeMake.
    if (!forwardPlay) {
      // @0x62d113: rsi = 0 - frameDuration.value; @0x62d117: rdx = frameDuration.timescale;
      // @0x62d11f: CMTimeMake(-value, timescale) — resets flags to Valid, epoch to 0.
      this.frameDuration = CMTimeMake(-this.frameDuration.value, this.frameDuration.timescale);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // nextFrameToRender(bool* wrappedOut) → CMTime                      @Ozone 0x62d160
  // Disasm mirrored:
  //   temp = OZIncrementTimeLooped(this.renderTime, this.scene)                 @0x62d189
  //          (constructed on the stack from a snapshot of renderTime — note the FUNCTOR takes
  //           sceneTime NOT frameDuration; frameDuration is the step passed at call-time.)
  //   this.renderLock.lock()                                                    @0x62d19a
  //   ret.value/ts/flags := this.renderTime[+0x2c..+0x3b]                       @0x62d1a8
  //   ret.epoch         := this.renderTime[+0x3c..+0x43]                        @0x62d19f
  //   if (wrappedOut != NULL)  *wrappedOut = (uint8_t)this.renderWrappedFlag    @0x62d1b1..0x62d1bc
  //   newRT = temp(this.renderTime, this.frameDuration, &this.renderWrappedFlag)@0x62d1d7
  //   this.renderTime := newRT                                                  @0x62d1dc..0x62d1e8
  //   this.renderLock.unlock()                                                  @0x62d1ef
  //   return ret                                                                @0x62d1f4
  // ────────────────────────────────────────────────────────────────────────────────────
  nextFrameToRender(wrappedOut?: { value: boolean }): CMTime {
    // @0x62d189 — snapshot ctor argument is the CURRENT renderTime (before lock; matches asm
    // ordering — the asm does the leaq to r14 before the lock call, then reads renderTime through
    // that pointer inside operator(), but the OZIncrementTimeLooped CTOR only reads sceneTime,
    // which is our pre-lock renderTime here).
    const temp = new OZIncrementTimeLooped(this.renderTime, this.scene);
    // @0x62d19a
    this.renderLock.lock();
    // @0x62d19f..0x62d1ae — snapshot renderTime as the return value.
    const ret: CMTime = {
      value: this.renderTime.value,
      timescale: this.renderTime.timescale,
      flags: this.renderTime.flags,
      epoch: this.renderTime.epoch,
    };
    // @0x62d1b1..0x62d1bc — publish the LAST-step wrap flag (byte read → bool).
    if (wrappedOut !== undefined) {
      wrappedOut.value = this.renderWrappedFlag;
    }
    // @0x62d1d7 — advance renderTime by frameDuration; operator() also overwrites renderWrappedFlag
    // via its out-param (asm passes r8=&renderWrappedFlag as the wrappedOut* arg).
    const wrapOut = { value: false };
    const newRT = temp.call(this.renderTime, this.frameDuration, wrapOut);
    // @0x62d1dc..0x62d1e8
    this.renderTime = newRT;
    this.renderWrappedFlag = wrapOut.value;
    // @0x62d1ef
    this.renderLock.unlock();
    // @0x62d1f4
    return ret;
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // nextFrameToDisplay() → CMTime                                     @Ozone 0x62d230
  // Disasm mirrored:
  //   this.displayLock.lock()                                                   @0x62d247
  //   ret.epoch         := this.displayTime[+0x5c..+0x63]                       @0x62d24c..0x62d250
  //   ret.value/ts/flags := this.displayTime[+0x4c..+0x5b]                      @0x62d254..0x62d259
  //   this.displayLock.unlock()                                                 @0x62d25f
  //   return ret                                                                @0x62d264
  // (Pure read — advancing displayTime is incrementDisplayTime's job.)
  // ─────────────────────────────────────────────────────────────────────────────────
  nextFrameToDisplay(): CMTime {
    // @0x62d247
    this.displayLock.lock();
    // @0x62d24c..0x62d259 — snapshot displayTime as the return value.
    const ret: CMTime = {
      value: this.displayTime.value,
      timescale: this.displayTime.timescale,
      flags: this.displayTime.flags,
      epoch: this.displayTime.epoch,
    };
    // @0x62d25f
    this.displayLock.unlock();
    // @0x62d264
    return ret;
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // incrementDisplayTime()                                            @Ozone 0x62d280
  // Disasm mirrored:
  //   temp = OZIncrementTimeLooped(this.displayTime, this.scene)               @0x62d2a4
  //   this.displayLock.lock()                                                   @0x62d2b4
  //   newDT = temp(this.displayTime, this.frameDuration, /*wrappedOut=*/NULL)  @0x62d2cd
  //          (r8d is xor'd to zero → the wrappedOut* arg is NULL; the operator() body has an
  //           early-out for that case per OZIncrementTimeLooped's decode.)
  //   this.displayTime := newDT                                                 @0x62d2d2..0x62d2de
  //   this.displayLock.unlock()                                                 @0x62d2e4
  // (No return value; no wrap flag stored — the display cursor's wrap events are unused here.)
  // ────────────────────────────────────────────────────────────────────────────────────
  incrementDisplayTime(): void {
    // @0x62d2a4
    const temp = new OZIncrementTimeLooped(this.displayTime, this.scene);
    // @0x62d2b4
    this.displayLock.lock();
    // @0x62d2cd — advance displayTime by frameDuration; wrappedOut* is NULL in the asm (r8d=0).
    const newDT = temp.call(this.displayTime, this.frameDuration, undefined);
    // @0x62d2d2..0x62d2de
    this.displayTime = newDT;
    // @0x62d2e4
    this.displayLock.unlock();
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // setPlayMode(int mode)                                             @Ozone 0x62d320
  // Disasm (verbatim, all 5 instructions):
  //   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
  // The "every-frame" clock intentionally does NOT respond to play mode — this override is
  // a no-op. (Not stubbed: the *only* correct transcription of an empty body is an empty body.)
  // ────────────────────────────────────────────────────────────────────────────────────
  setPlayMode(_mode: number): void {
    // @0x62d320..0x62d325 — no-op in FCP.
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // ~OZEveryFramePlaybackClock() (D0 deleting dtor @0x62d860 → D1 body inlined; D1 @0x62d830)
  // Disasm of D0 mirrored:
  //   *this := vtable OZEveryFramePlaybackClock (@0x887320)             @0x62d869..0x62d873
  //   this.displayLock.~PCSpinLock()                                    @0x62d877 (rdi=this+0x48)
  //   this.renderLock.~PCSpinLock()                                     @0x62d880 (rdi=this+0x28)
  //   operator delete(this)                                             @0x62d88e (jmp __ZdlPv)
  // No CMTime members need destruction (plain data); no scene ownership (raw pointer).
  // TypeScript port has no explicit dtor — the JS GC handles the memory; PCSpinLock has no
  // resource-holding state to release (see raw-port/src/infra/PCSpinLock.ts).
  // ────────────────────────────────────────────────────────────────────────────────────
}
