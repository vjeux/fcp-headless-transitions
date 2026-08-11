// FigTimeToRealFrameWithRate.ts — ProCore free function that converts a CMTime
// plus a frame rate (frames-per-second, double) to a REAL (fractional) frame
// position. It is the un-rounded twin of the already-landed
// `FigTimeToFrameWithRate` @ProCore 0x66f81 (raw-port/src/infra/
// FigTimeToFrameWithRate.ts): byte-for-byte the same body up to the multiply,
// then it simply RETURNS the product instead of biasing by 1e-7 and flooring.
// "RealFrame" = the frame position as a real number, i.e. frame 12.5 is legal.
//
// Provenance:
//   @ProCore /Applications/Final Cut Pro.app/Contents/Frameworks/
//            ProCore.framework/Versions/A/ProCore   (x86_64 slice)
//   Symbol   __Z26FigTimeToRealFrameWithRateRK6CMTimed
//   Address  0x66f1c
//   Disasm   raw-port/re/disasm/ProCore.__Z26FigTimeToRealFrameWithRateRK6CMTimed.s
//
// FULL DISASSEMBLY (26 lines — every instruction, in order):
//   0x66f1c  pushq  %rbp                            ; prologue
//   0x66f1d  movq   %rsp, %rbp
//   0x66f20  pushq  %rbx
//   0x66f21  subq   $0x58, %rsp                     ; frame: sret slot + arg area
//   0x66f25  movsd  %xmm0, -0x10(%rbp)              ; save rate (arg 2, xmm0)
//   0x66f2a  movl   0x8(%rdi), %esi                 ; esi = time.timescale (i32 @+0x8)
//   0x66f2d  movq   0x10(%rdi), %rax                ; rax = time.epoch     (i64 @+0x10)
//   0x66f31  movq   %rax, -0x20(%rbp)               ; stash epoch
//   0x66f35  movups (%rdi), %xmm0                   ; xmm0 = time[+0x0..+0xf]
//                                                   ;   (value i64 + timescale i32 + flags u32)
//   0x66f38  movaps %xmm0, -0x30(%rbp)              ; stash those 16 bytes
//   0x66f3c  movq   -0x20(%rbp), %rax
//   0x66f40  movq   %rax, 0x10(%rsp)                ; push epoch          (arg slot @+16)
//   0x66f45  movaps -0x30(%rbp), %xmm0
//   0x66f49  movups %xmm0, (%rsp)                   ; push value/timescale/flags (@+0)
//   0x66f4d  leaq   -0x48(%rbp), %rbx               ; rbx = sret slot for the returned CMTime
//   0x66f51  movq   %rbx, %rdi                      ; rdi = sret (CMTime is MEMORY-class)
//   0x66f54  movl   $0x2, %edx                      ; edx = rounding method, imm 2
//   0x66f59  callq  _CMTimeConvertScale             ; stub 0xde3ae
//   0x66f5e  movq   0x10(%rbx), %rax                ; re-push the RESULT by value:
//   0x66f62  movq   %rax, 0x10(%rsp)                ;   epoch
//   0x66f67  movupd (%rbx), %xmm0                   ;   value/timescale/flags
//   0x66f6b  movupd %xmm0, (%rsp)
//   0x66f70  callq  _CMTimeGetSeconds               ; stub 0xde3ba -> xmm0 = seconds
//   0x66f75  mulsd  -0x10(%rbp), %xmm0              ; xmm0 = seconds * rate
//   0x66f7a  addq   $0x58, %rsp                     ; epilogue
//   0x66f7e  popq   %rbx
//   0x66f7f  popq   %rbp
//   0x66f80  retq                                   ; return xmm0
//
// SEMANTICS
//   realFrame = CMTimeGetSeconds( CMTimeConvertScale(time, time.timescale, 2) )
//               * rate
//
//   * `newTimescale` is the input's OWN timescale (`movl 0x8(%rdi), %esi`
//     @0x66f2a) — this is not a rescale, it is CoreMedia's canonical
//     normalisation of the rational (per Apple's docs, converting to the same
//     scale returns the same value, possibly re-flagged).
//   * There is NO epsilon and NO `roundsd` here. Its sibling
//     `FigTimeToFrameWithRate` @0x66f81 continues past the identical `mulsd`
//     with `addsd 1e-7` @0x66fdf and `roundsd $0x9` (floor) @0x66fe7; this
//     function's very next instruction after the multiply is the epilogue
//     @0x66f7a. That single difference is the whole difference between the two
//     symbols, and it is why this one is the "Real" (fractional) variant.
//   * `mulsd` is DOUBLE precision throughout (no `cvtsd2ss`, no `*f` libm), so
//     no `Math.fround` is involved anywhere — plain JS number arithmetic is
//     bit-identical (Rule 4).
//
// CALLEES — both are CoreMedia public API (Apple system ABI, out of the
// 5-framework port scope), already boundary-modelled in raw-port/src/infra/
// CMTime.ts and imported here rather than re-declared:
//   - _CMTimeConvertScale  @ProCore __stubs 0xde3ae   (called @0x66f59)
//   - _CMTimeGetSeconds    @ProCore __stubs 0xde3ba   (called @0x66f70)
//
// CONSTANTS
//   - rounding method imm `$0x2` @0x66f54. Passed below as
//     `kCMTimeRoundingMethod_RoundTowardZero`, whose value IS 2 — i.e. the
//     exact immediate the instruction encodes, so no numeric drift is possible.
//     (CMTime.ts carries a note preferring the SEMANTIC name
//     `_RoundHalfAwayFromZero` for this same imm, and its landed sibling
//     FigTimeToFrameWithRate follows that; the choice is UNOBSERVABLE here
//     because `newTimescale === time.timescale` takes CMTimeConvertScale's
//     same-scale path, which performs no rounding at all. This port passes the
//     literal imm so the transcription matches the byte in the binary.)

import {
  CMTime,
  CMTimeGetSeconds,
  CMTimeConvertScale,
  kCMTimeRoundingMethod_RoundTowardZero,
} from "./CMTime";

/**
 * `FigTimeToRealFrameWithRate(CMTime const&, double)` — @ProCore 0x66f1c
 *   (`__Z26FigTimeToRealFrameWithRateRK6CMTimed`)
 *
 * Convert a CMTime to a REAL-valued frame position at the supplied frame rate.
 * Faithful transcription of the 26-instruction body quoted in the file header.
 *
 * Returns `CMTimeGetSeconds(normalized) * rate` where
 * `normalized = CMTimeConvertScale(time, time.timescale, /*imm*\/ 2)`.
 *
 * Zero in-scope callees; the two CoreMedia calls are out-of-scope system API
 * modelled in CMTime.ts. No branches, no indirect calls, no allocation.
 *
 * @param time  CMTime rational timestamp — `%rdi`, passed by const-ref and only
 *              ever READ (`movl 0x8(%rdi)`, `movq 0x10(%rdi)`, `movups (%rdi)`).
 * @param rate  frames-per-second scalar — `%xmm0` (saved @0x66f25).
 */
export function FigTimeToRealFrameWithRate(time: CMTime, rate: number): number {
  // @0x66f2a-0x66f59 — repack the CMTime by value into the argument area and
  // call CMTimeConvertScale with newTimescale = time.timescale (the SAME
  // scale, read @0x66f2a) and the rounding method imm $0x2 (@0x66f54).
  const normalized = CMTimeConvertScale(
    time,
    time.timescale,
    kCMTimeRoundingMethod_RoundTowardZero,
  );
  // @0x66f5e-0x66f70 — re-push the returned CMTime by value and call
  // CMTimeGetSeconds on it.
  const seconds = CMTimeGetSeconds(normalized);
  // @0x66f75  mulsd -0x10(%rbp), %xmm0 — seconds * rate, double precision.
  // @0x66f7a-0x66f80 — epilogue, return xmm0 (NO epsilon, NO floor: contrast
  // FigTimeToFrameWithRate @0x66fdf/@0x66fe7).
  return seconds * rate;
}
