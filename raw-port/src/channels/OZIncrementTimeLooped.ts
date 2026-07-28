// OZIncrementTimeLooped — @Ozone 0x62c8d0..0x62cfb2
// A time-stepping functor: given a scene, snapshots a startTime and endTime bracket, then when
// invoked with (currentTime, delta, wrappedOut), advances currentTime by delta and *loops*
// within [startTime, endTime] — wrapping across either boundary when the step crosses it,
// counting each wrap in the CMTime epoch. Returns the new time.
//
// Class layout (24-byte CMTime slots): probed from ctor stores at rbx / rbx+0x18.
//   +0x00..+0x17  startTime  CMTime (24 bytes)
//   +0x18..+0x2f  endTime    CMTime (24 bytes)  — set to getEndTime(...) + frameDuration
//                                                (see caveats below at ctor @0x62cbf5..cc20)
//
// FCP methods (all present):
//   OZIncrementTimeLooped::getEndTime(CMTime const&, OZScene*)                @Ozone 0x62c8d0
//   OZIncrementTimeLooped::OZIncrementTimeLooped(CMTime const&, OZScene*) C1  @Ozone 0x62cb50
//   (C2 base-ctor symbol at 0x62ca70 is byte-identical to C1 per llvm-objdump — same body; the
//    two mangled names are ICF-aliased. Only C1 is transcribed; C2 folds to it.)
//   OZIncrementTimeLooped::operator()(CMTime const&, CMTime const&, bool*) const  @Ozone 0x62cc30
//
// Frontier decode gaps (throw-stubs cite addrs on-line; the class methods themselves are fully
// transcribed and delegate only these lookups):
//   OZScene::getPlayRange()                @Ozone (called @0x62c8ee, @0x62cb69) — undecoded
//   OZScene[+0x480..+0x4af]                (loop-range struct: two CMTimes) — undecoded field layout
//   OZScene[+0x90] = OZSceneSettings       (base offset of embedded settings) — undecoded
//   OZSceneSettings::getFrameDuration()    @Ozone (called @0x62c969, @0x62cbf5, @0x62cff4) — undecoded
//
// Disasm evidence:
//   raw-port/re/disasm/OZIncrementTimeLooped.getEndTime.s
//   raw-port/re/disasm/OZIncrementTimeLooped.OZIncrementTimeLooped.s
//   raw-port/re/disasm/OZIncrementTimeLooped.operator.s

import {
  CMTime,
  CMTimeMake,
  CMTimeCompare,
  PC_CMTimeSaferAdd,
  PC_CMTimeSaferSubtract,
  kCMTimeFlags_Valid,
} from "../infra/CMTime.js";
import type { OZScene } from "../nodes/OZScene.js";

// ────────────────────────────────────────────────────────────────────────────────────────
// CoreMedia public API — CMTime.h:
//   CMTime CMTimeMakeWithEpoch(int64_t value, int32_t timescale, CMTimeEpoch epoch);
// Local helper (not yet exported from infra/CMTime.ts). Same construction as CMTimeMake but
// carries an explicit epoch. Called from operator() @0x62cf8a to stamp the wrap-count epoch
// onto the returned CMTime.
// ────────────────────────────────────────────────────────────────────────────────────────
function CMTimeMakeWithEpoch(value: bigint, timescale: number, epoch: bigint): CMTime {
  return { value, timescale, flags: kCMTimeFlags_Valid, epoch };
}

// ────────────────────────────────────────────────────────────────────────────────────────
// Frontier accessors — the OZScene shape used by this class is not yet decoded. Each getter
// cites its call-site @0xADDR so the port surfaces the exact demand back to the fleet.
// ────────────────────────────────────────────────────────────────────────────────────────

/** OZScene::getPlayRange() — returns pointer to OZTimeRange (24 bytes start CMTime,
 *  24 bytes duration CMTime, total 48 bytes = layout inferred from field reads at
 *  offsets 0x00..0x17 and 0x18..0x2f of the returned pointer).
 *  @Ozone call-sites: 0x62c8ee (getEndTime), 0x62cb69 (ctor). Body undecoded. */
function OZScene_getPlayRange(_scene: OZScene): OZTimeRange {
  throw new Error("OZScene::getPlayRange() @Ozone 0x62c8ee/0x62cb69 — undecoded");
}

/** OZScene[+0x480..+0x4af] — loop-range: two adjacent CMTimes at scene+0x480 and scene+0x498.
 *  Used by getEndTime @0x62c9a6..c9cd (when sceneTime >= endOfPlayRange) and by ctor @0x62cbb5
 *  (as a fallback when sceneTime < playRange.start). Field layout inferred from struct offsets;
 *  purpose (loop range vs some other pair) undecoded. */
function OZScene_getLoopRange(_scene: OZScene): OZTimeRange {
  throw new Error("OZScene::loopRange @Ozone scene[+0x480/+0x498] — undecoded field");
}

/** OZSceneSettings::getFrameDuration() — returns CMTime.
 *  @Ozone call-sites: 0x62c969, 0x62cbf5, 0x62cff4. Body undecoded. */
function OZSceneSettings_getFrameDuration(_scene: OZScene): CMTime {
  throw new Error("OZSceneSettings::getFrameDuration() @Ozone 0x62c969/0x62cbf5/0x62cff4 — undecoded");
}

/** OZTimeRange — a {start, duration} pair of CMTimes.
 *  Layout: +0x00 start (24 B) + 0x18 duration (24 B) = 48 B total.
 *  Inferred from getEndTime disasm: playRange[0..0x17] read as start, playRange[0x18..0x2f] read
 *  as "the second CMTime" and then PC_CMTimeSaferAdd(start, that) → endOfRange, i.e. the second
 *  slot is treated as a *duration* (start + duration = end) — an FCP convention. */
export interface OZTimeRange {
  start: CMTime;
  duration: CMTime;
}

// ────────────────────────────────────────────────────────────────────────────────────────
// OZIncrementTimeLooped
// ────────────────────────────────────────────────────────────────────────────────────────
export class OZIncrementTimeLooped {
  /** +0x00..+0x17: startTime — the left bracket of the loop window. */
  startTime: CMTime;
  /** +0x18..+0x2f: endTime — the right bracket of the loop window.
   *  Note: at ctor exit this holds `<endPoint> + frameDuration` (see ctor body); the operator()
   *  compares against it as the wrap-at-top threshold. */
  endTime: CMTime;

  // ────────────────────────────────────────────────────────────────────────────────────
  // OZIncrementTimeLooped::getEndTime(sceneTime, scene) → CMTime      @Ozone 0x62c8d0
  // ────────────────────────────────────────────────────────────────────────────────────
  // Disasm (verbatim, mirrored):
  //   r15 = OZScene::getPlayRange()                                              @0x62c8ee
  //   temp1 = PC_CMTimeSaferAdd(playRange.start, playRange.duration)              @0x62c941
  //          (playRange.start read from *r15+0..0x17, .duration from *r15+0x18..0x2f)
  //   sceneMade = CMTimeMake(sceneTime.value, sceneTime.timescale)                @0x62c956
  //   frameDur  = OZSceneSettings::getFrameDuration()  (scene+0x90)               @0x62c969
  //   cmp = CMTimeCompare(sceneMade, temp1)                                       @0x62c99d
  //   if (cmp >= 0)  temp2Range = { scene[+0x480], scene[+0x498] }                @0x62c9a6..c9cd
  //   else            temp2Range = { playRange.start, playRange.duration }        @0x62c9d2..c9f1
  //   temp2 = PC_CMTimeSaferAdd(temp2Range.start, temp2Range.duration)            @0x62ca1f
  //   return  PC_CMTimeSaferSubtract(temp2, frameDur)                             @0x62ca4d
  // ────────────────────────────────────────────────────────────────────────────────────
  static getEndTime(sceneTime: CMTime, scene: OZScene): CMTime {
    // @0x62c8ee
    const playRange = OZScene_getPlayRange(scene);
    // @0x62c941  — endOfPlayRange = playRange.start + playRange.duration
    const endOfPlayRange = PC_CMTimeSaferAdd(playRange.start, playRange.duration);
    // @0x62c956  — reconstruct sceneTime with epoch=0/flags=Valid (matches CMTimeMake)
    const sceneMade = CMTimeMake(sceneTime.value, sceneTime.timescale);
    // @0x62c969
    const frameDur = OZSceneSettings_getFrameDuration(scene);
    // @0x62c99d, @0x62c9a4  (js — jump if signed)
    let rangeStart: CMTime;
    let rangeDuration: CMTime;
    if (CMTimeCompare(sceneMade, endOfPlayRange) >= 0) {
      // @0x62c9a6..c9cd  — sceneTime past end-of-play-range: use scene[+0x480/+0x498] pair
      const loop = OZScene_getLoopRange(scene);
      rangeStart = loop.start;
      rangeDuration = loop.duration;
    } else {
      // @0x62c9d2..c9f1
      rangeStart = playRange.start;
      rangeDuration = playRange.duration;
    }
    // @0x62ca1f
    const endPoint = PC_CMTimeSaferAdd(rangeStart, rangeDuration);
    // @0x62ca4d
    return PC_CMTimeSaferSubtract(endPoint, frameDur);
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // OZIncrementTimeLooped::OZIncrementTimeLooped(sceneTime, scene)   @Ozone 0x62cb50 (C1)
  //   (C2 @0x62ca70 is ICF-folded to C1 — same body.)
  // ────────────────────────────────────────────────────────────────────────────────────
  // Disasm:
  //   r15 = getPlayRange()                                                        @0x62cb69
  //   local -0x30..-0x20 := playRange.start  (16+8 bytes)                         @0x62cb6e..cb79
  //   sceneMade = CMTimeMake(sceneTime.value, sceneTime.timescale)                @0x62cb88
  //   cmp = CMTimeCompare(sceneMade, playRange.start)                             @0x62cbb0
  //   if (cmp < 0)  rax := &scene[+0x480]                                         @0x62cbb5..c2 (cmovsq)
  //   else          rax := &local(-0x30) (playRange.start)                        @0x62cbbe (leaq)
  //   this[+0x00..+0x17] := *rax                                                  @0x62cbc6..cd0
  //   endTime = getEndTime(sceneTime, scene) written to local -0x30..-0x20        @0x62cbe2
  //   frameDur = scene.settings.getFrameDuration()  (scene+0x90) → local -0x48    @0x62cbf5
  //   this[+0x18..+0x2f] := PC_CMTimeSaferAdd(endTime, frameDur)                  @0x62cc20
  // ────────────────────────────────────────────────────────────────────────────────────
  constructor(sceneTime: CMTime, scene: OZScene) {
    // @0x62cb69
    const playRange = OZScene_getPlayRange(scene);
    // @0x62cb88
    const sceneMade = CMTimeMake(sceneTime.value, sceneTime.timescale);
    // @0x62cbb0, @0x62cbbe..c2 (cmovsq — set on SF from CMTimeCompare)
    // If sceneMade < playRange.start (compare < 0), use the loop-range's start (scene[+0x480]);
    // otherwise use playRange.start.
    let start: CMTime;
    if (CMTimeCompare(sceneMade, playRange.start) < 0) {
      const loop = OZScene_getLoopRange(scene);
      start = loop.start;
    } else {
      start = playRange.start;
    }
    // @0x62cbc6..cd0 — this[+0x00..+0x17] = start
    this.startTime = start;
    // @0x62cbe2 — endTime = getEndTime(sceneTime, scene), written into local -0x30..-0x20
    const endTime = OZIncrementTimeLooped.getEndTime(sceneTime, scene);
    // @0x62cbf5 — frameDur (from scene[+0x90])
    const frameDur = OZSceneSettings_getFrameDuration(scene);
    // @0x62cc20 — this[+0x18..+0x2f] = endTime + frameDur
    this.endTime = PC_CMTimeSaferAdd(endTime, frameDur);
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // OZIncrementTimeLooped::operator()(current, delta, wrappedOut) → CMTime  @Ozone 0x62cc30
  //
  // Steps `current` by `delta` and loops within [this.startTime, this.endTime]. The wrap count
  // is stashed into the returned CMTime's epoch. When `wrappedOut` is non-null, sets *wrappedOut
  // to true iff any wrap occurred.
  //
  // ABI: __ZNK21OZIncrementTimeLoopedclERK6CMTimeS2_Pb — const method returning CMTime by SRV.
  //   rdi = &SRV out-CMTime,  rsi = this,  rdx = &current,  rcx = &delta,  r8 = wrappedOut
  //   (In this port: TS returns CMTime and `wrappedOut` is a mutable-box optional.)
  //
  // Disasm:
  //   currMade  = CMTimeMake(current.value, current.timescale)                    @0x62cc61
  //   deltaMade = CMTimeMake(delta.value,   delta.timescale)                      @0x62cc74
  //   epoch     = current.epoch     (loop counter carried in r12)                 @0x62cc79
  //   result    = PC_CMTimeSaferAdd(currMade, deltaMade)                          @0x62ccb0
  //   if (deltaMade.value < 0) goto DECREMENT                                     @0x62ccb5..c1 (js)
  //   INCREMENT:
  //     if (CMTimeCompare(result, this.endTime) < 0) goto EMIT                    @0x62cd0a..11 (js)
  //     loop:
  //       result = PC_CMTimeSaferAdd(this.startTime,
  //                                  PC_CMTimeSaferSubtract(result, this.endTime))  @0x62cd7a..db8
  //       epoch += 1                                                                @0x62cdcc
  //       if (CMTimeCompare(result, this.endTime) >= 0) loop                        @0x62ce12..19 (jns)
  //   DECREMENT:
  //     if (CMTimeCompare(result, this.startTime) >= 0) goto EMIT                  @0x62ce66..d (jns)
  //     loop:
  //       result = PC_CMTimeSaferSubtract(this.endTime,
  //                                       PC_CMTimeSaferSubtract(this.startTime, result))  @0x62cec9..f07
  //       epoch -= 1                                                                @0x62cf1b
  //       if (CMTimeCompare(result, this.startTime) < 0) loop                       @0x62cf60..67 (js)
  //   EMIT (@0x62cf6d..fa2):
  //     if (wrappedOut) *wrappedOut = (epoch != current.epoch)
  //     return CMTimeMakeWithEpoch(result.value, result.timescale, epoch)
  // ────────────────────────────────────────────────────────────────────────────────────
  call(current: CMTime, delta: CMTime, wrappedOut?: { value: boolean }): CMTime {
    // @0x62cc61
    const currMade  = CMTimeMake(current.value, current.timescale);
    // @0x62cc74
    const deltaMade = CMTimeMake(delta.value,   delta.timescale);
    // @0x62cc79 — carry current.epoch as the loop counter (r12)
    let epoch = current.epoch;
    const origEpoch = epoch;
    // @0x62ccb0
    let result = PC_CMTimeSaferAdd(currMade, deltaMade);

    // @0x62ccb5..c1 — dispatch on sign of deltaMade.value (the raw int64, not seconds)
    if (deltaMade.value >= 0n) {
      // INCREMENT branch
      // @0x62cd0a..11: first-iteration gate — if already inside window, skip loop
      if (CMTimeCompare(result, this.endTime) >= 0) {
        // @0x62cd30..ce19 — wrap while result >= endTime
        do {
          // @0x62cd7a — (result - endTime)
          const overflow = PC_CMTimeSaferSubtract(result, this.endTime);
          // @0x62cdb8 — startTime + overflow
          result = PC_CMTimeSaferAdd(this.startTime, overflow);
          // @0x62cdcc
          epoch = epoch + 1n;
        } while (CMTimeCompare(result, this.endTime) >= 0);
      }
    } else {
      // DECREMENT branch
      // @0x62ce66..d
      if (CMTimeCompare(result, this.startTime) < 0) {
        // @0x62ce80..cf67 — wrap while result < startTime
        do {
          // @0x62cec9 — (startTime - result)
          const underflow = PC_CMTimeSaferSubtract(this.startTime, result);
          // @0x62cf07 — endTime - underflow
          result = PC_CMTimeSaferSubtract(this.endTime, underflow);
          // @0x62cf1b
          epoch = epoch - 1n;
        } while (CMTimeCompare(result, this.startTime) < 0);
      }
    }

    // @0x62cf6d..7a — publish wrap flag
    if (wrappedOut) {
      wrappedOut.value = (epoch !== origEpoch);
    }
    // @0x62cf87..8a — stamp epoch into the returned CMTime
    return CMTimeMakeWithEpoch(result.value, result.timescale, epoch);
  }
}
