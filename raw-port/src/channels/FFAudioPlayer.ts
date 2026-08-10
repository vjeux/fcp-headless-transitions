// FFAudioPlayer.ts — one method of Flexo's FFAudioPlayer, faithfully transcribed from the FCP
// Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly:
//   raw-port/re/disasm/Flexo.__ZN13FFAudioPlayer22setPlaybackPrerollTimeE6CMTime.s
//
// Only `setPlaybackPrerollTime(CMTime)` is ported here (the sole unit dispatched from the
// dependency queue). Other FFAudioPlayer methods are added by their own ledger units.
//
// STRUCT LAYOUT (the two fields this method touches on `this` = %rbx):
//   +0x28   prerollScale       double   // multiplier applied to the preroll seconds
//                                        //   (read by `mulsd 0x28(%rbx),%xmm0` @0xd131b4)
//   +0x110  playbackPrerollSeconds double // = CMTimeGetSeconds(time) * prerollScale
//                                        //   (written by `movsd %xmm0,0x110(%rbx)` @0xd131b9)
//   (Offsets recovered directly from this method's memory operands; the surrounding fields are
//    filled in by the other FFAudioPlayer ledger units — this file only declares what it uses.)

import type { CMTime } from "../infra/CMTime.js";
import { CMTimeGetSeconds } from "../infra/CMTime.js";

export class FFAudioPlayer {
  // +0x28  double multiplier applied to the preroll time (units-per-second scale factor).
  prerollScale = 0;
  // +0x110  cached preroll time in scaled seconds.
  playbackPrerollSeconds = 0;

  /**
   * FFAudioPlayer::setPlaybackPrerollTime(CMTime time)
   * @0xADDR Flexo 0x0000000000d13190  (__ZN13FFAudioPlayer22setPlaybackPrerollTimeE6CMTime)
   *
   * DECODE (raw-port/re/disasm/Flexo.__ZN13FFAudioPlayer22setPlaybackPrerollTimeE6CMTime.s):
   *
   *   0xd1319c-0xd131aa  (marshal `time` by value: epoch to 0x10(%rsp),
   *                       [value|timescale|flags] to (%rsp))
   *   0xd131af           callq _CMTimeGetSeconds            ; xmm0 = CMTimeGetSeconds(time) (f64)
   *   0xd131b4           mulsd 0x28(%rbx),%xmm0             ; xmm0 = seconds * this->prerollScale
   *   0xd131b9           movsd %xmm0, 0x110(%rbx)           ; this->playbackPrerollSeconds = xmm0
   *   0xd131c1           retq
   *
   *   0xd131c8-0xd131d6  (exception landing pad: ___cxa_begin_catch / ___cxa_end_catch — the
   *                       C++/ObjC exception-handling boundary for the _CMTimeGetSeconds call;
   *                       part of the calling convention, not an in-scope callee. No value path.)
   *
   * All arithmetic is double precision (mulsd / movsd) — no Math.fround narrowing here.
   * Zero in-scope callees. The sole callee (_CMTimeGetSeconds) is a CoreMedia public-API
   * boundary function, modelled in ../infra/CMTime.ts.
   */
  setPlaybackPrerollTime(time: CMTime): void {
    // @0xd131af  seconds = CMTimeGetSeconds(time)  (f64).
    const seconds = CMTimeGetSeconds(time);
    // @0xd131b4  seconds *= this->prerollScale  (double mulsd).
    const scaled = seconds * this.prerollScale;
    // @0xd131b9  this->playbackPrerollSeconds = scaled.
    this.playbackPrerollSeconds = scaled;
  }
}
