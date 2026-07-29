// OZAudioSampleTimeFromFrameTime — Ozone free function
// @Ozone /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// @0x23cb00  OZAudioSampleTimeFromFrameTime(CMTime frameTime, float sampleRate) -> CMTime
//
// DECODE: raw-port/re/disasm/__Z30OZAudioSampleTimeFromFrameTime6CMTimef.s
// Signature (SysV x86-64 ABI at call site):
//   %rdi = hidden CMTime* out          (return-slot pointer supplied by caller)
//   %rbp+0x10 .. +0x28 = CMTime (24 B) frameTime  (passed by value on the stack)
//   %xmm0                                = float sampleRate
// Body is literally three operations plus the tail:
//   0x23cb0c  cvttss2si %xmm0, %esi     ;; newTimescale = (int32) truncf(sampleRate)
//                                        ;; cvttss2si truncates toward zero (float32 -> int32)
//   0x23cb10..0x23cb1d  copy 24 B of frameTime from [rbp+0x10] to [rsp]
//                                        (the byval-struct arg for CMTimeConvertScale)
//   0x23cb21  movl $0x3, %edx           ;; roundingMethod = 3
//                                        ;; kCMTimeRoundingMethod_QuickTime  (CoreMedia CMTime.h)
//   0x23cb26  callq _CMTimeConvertScale ;; writes result CMTime into *rdi
//   0x23cb2b  movq %rbx, %rax           ;; return the out pointer (rbx = saved rdi)
// So the function is exactly:
//   CMTimeConvertScale(frameTime, (int32) sampleRate, kCMTimeRoundingMethod_QuickTime).
// It converts an audio frame count expressed as a CMTime (value=frameIndex,
// timescale=some existing scale) into a CMTime whose timescale is the audio
// sample rate — i.e. a "sample-time" — using QuickTime rounding so the result
// aligns to the sample grid the way FCP's audio pipeline expects.

import type { CMTime } from '../infra/CMTime.js';

// ── CoreMedia rounding-method constant (CMTime.h public enum) ─────────────────
// @const CoreMedia CMTime.h  (CMTimeRoundingMethod enum: kCMTimeRoundingMethod_QuickTime = 3)
// Also witnessed at Ozone 0x23cb21 as `movl $0x3, %edx` — the immediate loaded into
// the method register for the _CMTimeConvertScale call.
const kCMTimeRoundingMethod_QuickTime = 3;

/**
 * @Ozone 0x23cb26  _CMTimeConvertScale(CMTime* out, CMTime time, int32_t newTimescale,
 *                                      CMTimeRoundingMethod method)
 * CoreMedia public API — out-of-scope extern. Rounds `time` onto a new timescale
 * using the given rounding method (Apple documents the exact semantics in
 * CMTime.h; the FCP binary calls the symbol stub at this address).
 */
function CMTimeConvertScale_stub(
  _time: CMTime,
  _newTimescale: number,
  _method: number,
): CMTime {
  throw new Error(
    "_CMTimeConvertScale @Ozone 0x23cb26 is not yet ported (CoreMedia public API).",
  );
}

/**
 * OZAudioSampleTimeFromFrameTime(frameTime, sampleRate) — rescales a CMTime
 * onto the audio sample-rate timescale, with QuickTime rounding.
 *
 * @Ozone 0x23cb00
 *
 * Line-for-line transcription of the 19-instruction body:
 *   1. Truncate `sampleRate` (float32) to an int32 timescale
 *      (`cvttss2si %xmm0, %esi` — round toward zero, single-precision input).
 *   2. Call CMTimeConvertScale(frameTime, thatTimescale,
 *      kCMTimeRoundingMethod_QuickTime = 3).
 *   3. Return its result (the assembly returns the caller-supplied out pointer;
 *      in TS we return the CMTime value directly, which is the same object).
 */
export function OZAudioSampleTimeFromFrameTime(
  frameTime: CMTime,
  sampleRate: number,
): CMTime {
  // @Ozone 0x23cb0c  cvttss2si %xmm0, %esi
  //   `sampleRate` is float32 on the wire (xmm0 is a scalar-single here — the caller
  //   spills it through a float, cf. the `f` in the mangled name). cvttss2si truncates
  //   toward zero; Math.fround narrows to f32 first so any f64 caller-side rounding
  //   matches the ABI, then `| 0` performs the same trunc-toward-zero to int32.
  const newTimescale = Math.fround(sampleRate) | 0;

  // @Ozone 0x23cb21  movl $0x3, %edx      ;; kCMTimeRoundingMethod_QuickTime
  // @Ozone 0x23cb26  callq _CMTimeConvertScale
  return CMTimeConvertScale_stub(
    frameTime,
    newTimescale,
    kCMTimeRoundingMethod_QuickTime,
  );
}
