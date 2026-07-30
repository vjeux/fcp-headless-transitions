// FigTimeToFrameWithRate.ts — ProCore free function that converts a CMTime + a
// frame rate (frames-per-second, double) to a frame index (double, floored to
// an integer). Named FigTimeToFrameWithRate in the FCP binary — a helper the
// media stack uses to map a rational timestamp to a whole-frame index at a
// given target rate.
//
// Provenance:
//   @ProCore /Applications/Final Cut Pro.app/Contents/Frameworks/
//            ProCore.framework/Versions/A/ProCore
//   Symbol   __Z22FigTimeToFrameWithRateRK6CMTimed
//   Address  0x66f81
//   Disasm   raw-port/re/disasm/ProCore.__Z22FigTimeToFrameWithRateRK6CMTimed.s
//
// Full disassembly (31 lines):
//   0x66f81  pushq  %rbp
//   0x66f82  movq   %rsp, %rbp
//   0x66f85  pushq  %rbx
//   0x66f86  subq   $0x58, %rsp
//   0x66f8a  movsd  %xmm0, -0x10(%rbp)              ; save rate  (arg 2)
//   0x66f8f  movl   0x8(%rdi), %esi                 ; esi = time.timescale
//   0x66f92  movq   0x10(%rdi), %rax                ; rax = time.epoch
//   0x66f96  movq   %rax,   -0x20(%rbp)             ; stash epoch
//   0x66f9a  movups (%rdi), %xmm0                   ; xmm0 = time[+0..+15]
//   0x66f9d  movaps %xmm0, -0x30(%rbp)              ; stash first 16 bytes
//   0x66fa1  movq   -0x20(%rbp), %rax
//   0x66fa5  movq   %rax,   0x10(%rsp)              ; push epoch (arg slot @+16)
//   0x66faa  movaps -0x30(%rbp), %xmm0
//   0x66fae  movups %xmm0,  (%rsp)                  ; push value+timescale+flags (arg @+0)
//   0x66fb2  leaq   -0x48(%rbp), %rbx               ; rbx = sret slot for return CMTime
//   0x66fb6  movq   %rbx,   %rdi                    ; rdi = sret
//   0x66fb9  movl   $0x2,   %edx                    ; edx = kCMTimeRoundingMethod_RoundHalfAwayFromZero
//   0x66fbe  callq  _CMTimeConvertScale             ; time' = CMTimeConvertScale(time, time.timescale, RoundHalfAwayFromZero)
//   0x66fc3  movq   0x10(%rbx), %rax
//   0x66fc7  movq   %rax,   0x10(%rsp)              ; push time'.epoch
//   0x66fcc  movupd (%rbx), %xmm0
//   0x66fd0  movupd %xmm0,  (%rsp)                  ; push time'.value/timescale/flags
//   0x66fd5  callq  _CMTimeGetSeconds               ; xmm0 = CMTimeGetSeconds(time')
//   0x66fda  mulsd  -0x10(%rbp), %xmm0              ; xmm0 *= rate
//   0x66fdf  addsd  0xbb899(%rip), %xmm0            ; xmm0 += 1e-07     [const @0x122880]
//   0x66fe7  roundsd $0x9, %xmm0, %xmm0             ; floor toward -inf, SAE
//   0x66fed  addq   $0x58, %rsp
//   0x66ff1  popq   %rbx
//   0x66ff2  popq   %rbp
//   0x66ff3  retq
//
// SEMANTICS
//   frame = floor( CMTimeGetSeconds( CMTimeConvertScale(time, time.timescale,
//                                                       RoundHalfAwayFromZero) )
//                 * rate + 1e-07 )
//
//   The CMTimeConvertScale call passes the SAME timescale as the input's own
//   timescale — so it's not really rescaling. What it IS doing is forcing a
//   canonical rounding of the rational (per Apple's CoreMedia docs, converting
//   a CMTime to its own scale with an explicit rounding-method normalizes any
//   already-rounded / lossy state). Then CMTimeGetSeconds converts to double
//   seconds; multiplying by rate gives fractional frames; adding the 1e-07
//   epsilon absorbs binary-float noise so the subsequent floor doesn't slip
//   one frame low on values that were mathematically integers. `roundsd $0x9`
//   is imm-immediate `0x9` = round-toward-negative-infinity (bit0=1, bit1=0)
//   with SAE (bit3=1); i.e. floor().
//
// CALLEES (both are CoreMedia public API — Apple system ABI, boundary-modelled
//          alongside the other CoreMedia externs already in CMTime.ts):
//   - _CMTimeConvertScale @ ProCore __stubs 0xde3ae
//   - _CMTimeGetSeconds   @ ProCore __stubs 0xde3ba (already ported in CMTime.ts)
//
// CONSTANTS
//   - 1e-07  (double 0x3E7AD7F29ABCAF48 little-endian: 48 af bc 9a f2 d7 7a 3e)
//     read from ProCore __TEXT __const @ 0x122880, RIP-relative @0x66fdf+7+0xbb899
//   - CMTimeRoundingMethod 0x2 = kCMTimeRoundingMethod_RoundHalfAwayFromZero
//     (CoreMedia CMTime.h enum) — imm-immediate at 0x66fb9

import {
  CMTime,
  CMTimeGetSeconds,
  CMTimeConvertScale,
  kCMTimeRoundingMethod_RoundHalfAwayFromZero,
} from "./CMTime";

// @const ProCore __TEXT __const 0x122880 (read via RIP-relative @0x66fdf)
// Purpose: epsilon that guards against binary-float underslip when the pre-
// floor product should have been mathematically integer. Value confirmed by
// dumping 8 bytes at ProCore+0x122880 (`otool -s __TEXT __const`) and
// interpreting little-endian IEEE-754 double: 48afbc9af2d77a3e -> 1.0e-07.
const kFigTimeToFrameEpsilon = 1e-7;

/**
 * `FigTimeToFrameWithRate(CMTime const&, double)` — @ProCore 0x66f81
 *   __Z22FigTimeToFrameWithRateRK6CMTimed
 *
 * Convert a CMTime to a frame index (as an integer double) at the supplied
 * frame rate. Faithful transcription of the 31-instruction body above.
 *
 * Returns `floor( CMTimeGetSeconds(normalized) * rate + 1e-7 )` where
 * `normalized = CMTimeConvertScale(time, time.timescale,
 *                                  RoundHalfAwayFromZero)`.
 *
 * @param time  CMTime rational timestamp (passed by const-ref — read-only).
 * @param rate  frames-per-second scalar (arg 2 in xmm0 @0x66f8a).
 */
export function FigTimeToFrameWithRate(time: CMTime, rate: number): number {
  // @0x66f8f–0x66fbe — repack the CMTime by value onto the CMTimeConvertScale
  // arg slot and call it with newTimescale = time.timescale (no-op scale) and
  // rounding = RoundHalfAwayFromZero (imm $0x2 @0x66fb9). The purpose is
  // canonical rounding, not rescaling.
  const normalized = CMTimeConvertScale(
    time,
    time.timescale,
    kCMTimeRoundingMethod_RoundHalfAwayFromZero,
  );
  // @0x66fc3–0x66fd5 — seconds = CMTimeGetSeconds(normalized)
  const seconds = CMTimeGetSeconds(normalized);
  // @0x66fda  mulsd -0x10(%rbp), %xmm0     — seconds *= rate
  // @0x66fdf  addsd 0xbb899(%rip), %xmm0   — += 1e-7
  // @0x66fe7  roundsd $0x9, %xmm0, %xmm0   — floor (round toward -inf, SAE)
  return Math.floor(seconds * rate + kFigTimeToFrameEpsilon);
}
