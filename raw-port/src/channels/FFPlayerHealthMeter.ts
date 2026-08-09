// FFPlayerHealthMeter.ts — one method of Flexo's FFPlayerHealthMeter, faithfully transcribed
// from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly: raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter11setFrameDurE6CMTime.s
//
// Only `setFrameDur(CMTime)` is ported here (the sole unit dispatched from the dependency
// queue). Other FFPlayerHealthMeter methods are added by their own ledger units.
//
// STRUCT LAYOUT (recovered from setFrameDur's field reads/writes on `this` = %rbx):
//   +0x00  frameDur       CMTime   // 24 bytes: value(i64)@+0x00, timescale(i32)@+0x08,
//                                  //           flags(u32)@+0x0c, epoch(i64)@+0x10
//                                  //   (stored/read as a 16B movups [value|timescale|flags] plus
//                                  //    an 8B movq for epoch — see 0xda189e / 0xda186b et al.)
//   +0x18  frameDurSeconds  float  // f32: CMTimeGetSeconds(frameDur) truncated to single precision
//   +0x1c  frameRate        float  // f32: 1.0f / frameDurSeconds
//   +0x1b38 graphBuildDenom float  // f32 denominator read by GetGraphBuildPercent (>0 gate)
//   +0x1b5c graphBuildCount i32    // int32 sample count read by GetGraphBuildPercent (cvtsi2sdl)
//   +0x1b60 failedPreroll  i32(atomic)  // one-shot latch set to 1 by setFailedPreroll(true); the
//                                       // xchgl store is a std::atomic<int>/std::atomic<bool> seq-cst
//                                       // exchange whose old value is discarded (a set-only flag).

import type { CMTime } from "../infra/CMTime.js";
import {
  CMTimeMake,
  CMTimeCompare,
  CMTimeGetSeconds,
} from "../infra/CMTime.js";

export class FFPlayerHealthMeter {
  // +0x00  the current frame duration (rational time).
  frameDur: CMTime = { value: 0n, timescale: 0, flags: 0, epoch: 0n };
  // +0x18  frame duration in seconds (single precision).
  frameDurSeconds = 0;
  // +0x1c  frame rate = 1/frameDurSeconds (single precision).
  frameRate = 0;
  // +0x1b38  denominator for the graph-build percentage (single precision). GetGraphBuildPercent
  //          only divides by it when it is > 0.
  graphBuildDenom = 0;
  // +0x1b5c  sample count for the graph-build percentage (int32), widened to double before scaling.
  graphBuildCount = 0;
  // +0x1b60  one-shot "failed preroll" latch. Set to 1 by setFailedPreroll(true) via an atomic
  //          exchange (xchgl) whose old value is discarded; never cleared by that method.
  failedPreroll = 0;

  /**
   * FFPlayerHealthMeter::setFrameDur(CMTime dur)
   * @0xADDR Flexo 0x0000000000da1820  (__ZN19FFPlayerHealthMeter11setFrameDurE6CMTime)
   *
   * DECODE (raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter11setFrameDurE6CMTime.s):
   *
   *   0xda182c-0xda183a  leaq -0x20(%rbp),%rdi ; movl $1,%esi ; movl $0x3e8,%edx
   *   0xda183a           callq _CMTimeMake                 ; local = CMTimeMake(1, 1000)
   *   0xda183f-0xda1862  (marshal CMTimeMake result as arg1, `dur` as arg2)
   *   0xda1862           callq _CMTimeCompare              ; CMTimeCompare(CMTimeMake(1,1000), dur)
   *                                                        ;   -> %eax DISCARDED (no test/branch
   *                                                        ;      follows; compiled-out assert/artifact)
   *   0xda1867-0xda1889  (marshal this->frameDur as arg1, `dur` as arg2)
   *   0xda1889           callq _CMTimeCompare              ; cmp = CMTimeCompare(this->frameDur, dur)
   *   0xda188e-0xda1890  testl %eax,%eax ; je 0xda18d3     ; if (cmp == 0, i.e. equal) return
   *
   *   ; --- not equal: adopt the new duration and recompute the derived floats ---
   *   0xda1892-0xda18a1  (rax=&dur) this->frameDur = dur   ; movq epoch to 0x10(%rbx),
   *                                                        ;   movups [value|ts|flags] to (%rbx)
   *   0xda18a4-0xda18b4  (marshal dur by value) callq _CMTimeGetSeconds  ; xmm0 = seconds (f64)
   *   0xda18b9           cvtsd2ss %xmm0,%xmm0              ; secF32 = (float)seconds
   *   0xda18bd           movss %xmm0, 0x18(%rbx)           ; this->frameDurSeconds = secF32
   *   0xda18c2           movss 0x156ccd0(%rip),%xmm1       ; xmm1 = 1.0f   (@Flexo __TEXT __const 0x156ccd0)
   *   0xda18ca           divss %xmm0,%xmm1                 ; rate = 1.0f / secF32   (single precision)
   *   0xda18ce           movss %xmm1, 0x1c(%rbx)           ; this->frameRate = rate
   *   0xda18d3           retq
   *
   * The `dur` argument is passed BY VALUE (a 24-byte CMTime). The first CMTimeCompare's result is
   * genuinely unused by the machine — we call it faithfully (it is a CoreMedia boundary function)
   * but do not branch on it.
   *
   * Zero in-scope callees. The three callees (_CMTimeMake / _CMTimeCompare / _CMTimeGetSeconds) are
   * CoreMedia public-API boundary functions, modelled in ../infra/CMTime.ts.
   */
  setFrameDur(dur: CMTime): void {
    // @0xda182c..0xda183a  local = CMTimeMake(1, 1000).
    const probe = CMTimeMake(1, 1000);
    // @0xda1862  CMTimeCompare(CMTimeMake(1,1000), dur) — result discarded by the machine.
    CMTimeCompare(probe, dur);

    // @0xda1889  cmp = CMTimeCompare(this->frameDur, dur).
    const cmp = CMTimeCompare(this.frameDur, dur);
    // @0xda1890  je 0xda18d3 — if the durations are equal, leave everything untouched.
    if (cmp === 0) return;

    // @0xda1892..0xda18a1  this->frameDur = dur  (adopt the new duration).
    this.frameDur = { value: dur.value, timescale: dur.timescale, flags: dur.flags, epoch: dur.epoch };

    // @0xda18b4  seconds = CMTimeGetSeconds(dur)  (f64).
    const seconds = CMTimeGetSeconds(dur);
    // @0xda18b9  cvtsd2ss — truncate to single precision.
    const secF32 = Math.fround(seconds);
    // @0xda18bd  this->frameDurSeconds = secF32.
    this.frameDurSeconds = secF32;

    // @0xda18c2..0xda18ce  rate = 1.0f / secF32  (single precision divss).
    //   @const 1.0f @ Flexo __TEXT __const 0x156ccd0.
    const rate = Math.fround(Math.fround(1.0) / secF32);
    this.frameRate = rate;
  }

  /**
   * FFPlayerHealthMeter::setFailedPreroll(bool)
   * @0xADDR Flexo 0x0000000000da37d0  (__ZN19FFPlayerHealthMeter16setFailedPrerollEb)
   *
   * DECODE (raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter16setFailedPrerollEb.s):
   *
   *   0xda37d0  pushq %rbp ; movq %rsp,%rbp        ; prologue
   *   0xda37d4  testl %esi,%esi                    ; test the bool argument (arg1 = %esi = b)
   *   0xda37d6  je    0xda37e3                      ; if (b == 0) skip the store — pure no-op
   *   0xda37d8  movl  $0x1, %eax                    ; eax = 1
   *   0xda37dd  xchgl %eax, 0x1b60(%rdi)            ; ATOMIC exchange: this->failedPreroll = 1
   *                                                 ;   (old value loaded into eax, then DISCARDED —
   *                                                 ;    an `xchg` on memory carries an implicit LOCK
   *                                                 ;    prefix, i.e. a seq-cst std::atomic store.)
   *   0xda37e3  popq %rbp ; retq                    ; epilogue
   *
   * Semantics: a set-only latch. `setFailedPreroll(true)` stores 1 into the +0x1b60 flag atomically
   * (and ignores the prior value); `setFailedPreroll(false)` does nothing at all. There is no path
   * that clears the flag here. Zero in-scope callees; no externs. Pure field write.
   */
  setFailedPreroll(b: boolean): void {
    // @0xda37d4..0xda37d6  testl %esi,%esi ; je — false is a no-op (the store is skipped entirely).
    if (!b) return;
    // @0xda37d8..0xda37dd  movl $1 ; xchgl %eax,0x1b60(%rdi) — atomic set-to-1, old value discarded.
    this.failedPreroll = 1;
  }

  /**
   * FFPlayerHealthMeter::GetGraphBuildPercent() -> float
   * @0xADDR Flexo 0x0000000000da3860  (__ZN19FFPlayerHealthMeter20GetGraphBuildPercentEv)
   *
   * DECODE (otool -tvV address slice 0xda3860..0xda38c0; disasm at
   *   raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter20GetGraphBuildPercentEv.s):
   *
   *   0xda3864  movss 0x1b38(%rdi),%xmm1          ; xmm1 = this->graphBuildDenom (f32)
   *   0xda386c  xorps %xmm0,%xmm0                 ; xmm0 = 0.0f
   *   0xda386f  ucomiss %xmm0,%xmm1               ; compare xmm1 - 0  (AT&T: dst=xmm1, src=xmm0)
   *   0xda3872  jbe 0xda38aa                      ; if (xmm1 <= 0) -> degenerate branch
   *   ; --- main path: graphBuildDenom > 0 ---
   *   0xda3874  xorps %xmm0,%xmm0
   *   0xda3877  cvtsi2sdl 0x1b5c(%rdi),%xmm0      ; xmm0 = (double)(int32)this->graphBuildCount
   *   0xda387f  mulsd 0x156e268(%rip),%xmm0       ; xmm0 *= 0.05        (@const Flexo 0x156e268)
   *   0xda3887  addsd 0x156f820(%rip),%xmm0       ; xmm0 += 0.95        (@const Flexo 0x156f820)
   *   0xda388f  cvtsd2ss %xmm0,%xmm0              ; xmm0 = (float)xmm0
   *   0xda3893  divss %xmm1,%xmm0                 ; xmm0 /= graphBuildDenom   (dst/src = xmm0/xmm1)
   *   0xda3897  movss 0x1c(%rdi),%xmm1            ; xmm1 = this->frameRate (f32)
   *   0xda389c  mulss 0x156f0d0(%rip),%xmm0       ; xmm0 *= 100.0f      (@const Flexo 0x156f0d0)
   *   0xda38a4  divss %xmm1,%xmm0                 ; xmm0 /= frameRate
   *   0xda38a9  retq                              ; return xmm0
   *   ; --- degenerate branch: graphBuildDenom <= 0 (0xda38aa) ---
   *   0xda38aa  movss 0x1c(%rdi),%xmm1            ; xmm1 = this->frameRate (f32)
   *   0xda38af  movaps %xmm1,%xmm0                ; xmm0 = frameRate
   *   0xda38b2  mulss 0x156f0d0(%rip),%xmm0       ; xmm0 = frameRate * 100.0f (same 100.0 const)
   *   0xda38ba  divss %xmm1,%xmm0                 ; xmm0 /= frameRate  => 100.0f (NaN if frameRate 0)
   *   0xda38bf  retq                              ; return xmm0
   *
   * All arithmetic is transcribed at the machine's widths: the count is widened i32->f64
   * (cvtsi2sdl), the *0.05 + 0.95 happens in DOUBLE, then the result is narrowed to f32 (cvtsd2ss)
   * before the two single-precision divides/multiply. Math.fround marks every f32 rounding point.
   * The degenerate branch computes frameRate*100/frameRate, i.e. 100.0f (and NaN if frameRate==0,
   * faithfully — the binary does the divide unconditionally).
   *
   * @const Flexo __TEXT,__const 0x156e268 = 0.05  (f64)
   * @const Flexo __TEXT,__const 0x156f820 = 0.95  (f64)
   * @const Flexo __TEXT,__const 0x156f0d0 = 100.0 (f32, shared by both branches)
   *
   * Zero in-scope callees; no externs. Pure field arithmetic.
   */
  GetGraphBuildPercent(): number {
    // @0xda3864  denom = this->graphBuildDenom (f32).
    const denom = Math.fround(this.graphBuildDenom);
    // @0xda386f..0xda3872  ucomiss vs 0 ; jbe -> take the degenerate branch when denom <= 0.
    if (denom > 0) {
      // @0xda3877  (double)(int32)graphBuildCount.
      const count = this.graphBuildCount | 0;
      // @0xda387f..0xda3887  count*0.05 + 0.95 in DOUBLE precision.
      const d = count * 0.05 + 0.95; // @const 0.05 @0x156e268, 0.95 @0x156f820
      // @0xda388f  cvtsd2ss — narrow to f32.
      let r = Math.fround(d);
      // @0xda3893  divss by denom (f32).
      r = Math.fround(r / denom);
      // @0xda3897  frameRate (f32).
      const frameRate = Math.fround(this.frameRate);
      // @0xda389c  *100.0f  (@const 100.0 @0x156f0d0).
      r = Math.fround(r * Math.fround(100.0));
      // @0xda38a4  /frameRate (f32).
      r = Math.fround(r / frameRate);
      return r;
    }
    // @0xda38aa..0xda38bf  degenerate: frameRate*100.0f/frameRate  (== 100.0f, or NaN if 0).
    const frameRate = Math.fround(this.frameRate);
    let r = frameRate;                             // @0xda38af  movaps
    r = Math.fround(r * Math.fround(100.0));        // @0xda38b2  mulss 100.0f (@0x156f0d0)
    r = Math.fround(r / frameRate);                 // @0xda38ba  divss
    return r;
  }
}
