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
//   +0x1b60 failedPreroll  i32(atomic)  // one-shot latch set to 1 by setFailedPreroll(true); the
//                                       // xchgl store is a std::atomic<int>/std::atomic<bool> seq-cst
//                                       // exchange whose old value is discarded (a set-only flag).
//   ---- ring buffer of recent frames (read by diskLates @0xda30e0) ----
//   +0x2f8  ringStatus  i32[60]  // per-frame status code; 0 marks a "disk late" frame that missed
//                                //   its deadline. Indexed 0..59 (wrap constant 0x3b = 59).
//   +0x7a8  ringLateCnt u8[60]   // per-frame late-count byte, accumulated by diskLates for every
//                                //   slot whose ringStatus == 0.
//   +0x1888 ringCount   u32      // number of ring slots to scan backward from ringHead.
//   +0x188c ringHead    i32      // index of the most-recent ring slot (walk backward, wrapping 0→59).

import type { CMTime } from "../infra/CMTime.js";
import {
  CMTimeMake,
  CMTimeCompare,
  CMTimeGetSeconds,
} from "../infra/CMTime.js";

/** Ring buffer capacity — the backward walk wraps index 0 → 59 (wrap constant
 *  0x3b at Flexo @0xda311a / @0xda3137 / @0xda3160), i.e. 60 slots. */
const FFPLAYER_HEALTH_RING = 60;

export class FFPlayerHealthMeter {
  // +0x00  the current frame duration (rational time).
  frameDur: CMTime = { value: 0n, timescale: 0, flags: 0, epoch: 0n };
  // +0x18  frame duration in seconds (single precision).
  frameDurSeconds = 0;
  // +0x1c  frame rate = 1/frameDurSeconds (single precision).
  frameRate = 0;
  // +0x1b60  one-shot "failed preroll" latch. Set to 1 by setFailedPreroll(true) via an atomic
  //          exchange (xchgl) whose old value is discarded; never cleared by that method.
  failedPreroll = 0;
  // +0x2f8  per-frame status ring (i32[60]); a 0 entry marks a "disk late" frame.
  ringStatus: Int32Array = new Int32Array(FFPLAYER_HEALTH_RING);
  // +0x7a8  per-frame late-count ring (u8[60]); summed by diskLates over late slots.
  ringLateCnt: Uint8Array = new Uint8Array(FFPLAYER_HEALTH_RING);
  // +0x1888 number of ring slots to scan.
  ringCount = 0;
  // +0x188c index of the newest ring slot (scan walks backward from here).
  ringHead = 0;


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
   * FFPlayerHealthMeter::diskLates()
   * @0xADDR Flexo 0x0000000000da30e0  (__ZN19FFPlayerHealthMeter9diskLatesEv)
   *
   * Sums the per-slot "late count" (ringLateCnt @+0x7a8, a u8) over the most
   * recent `ringCount` (@+0x1888) ring slots, walking BACKWARD from `ringHead`
   * (@+0x188c) and wrapping index 0 → 59 (ring capacity 60). A slot contributes
   * only when its status (ringStatus @+0x2f8, an i32) is 0 — i.e. a frame that
   * was flagged "disk late". Returns 0 when ringCount == 0.
   *
   * DECODE (raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter9diskLatesEv.s):
   *   @0xda30e4  ecx = ringCount (+0x1888)
   *   @0xda30ea  testl %ecx,%ecx ; je 0xda310f → count 0 → return 0
   *   @0xda30ee  edx = ringHead (+0x188c)
   *   @0xda30f4  cmpl $1,%ecx ; jne 0xda3113 → count>1 uses the unrolled loop
   *   ; --- count == 1 (single slot at `edx`) ---
   *   @0xda30f9  eax = 0
   *   @0xda30fb  testb $1,%cl ; je 0xda310d (cl bit0 set for odd count → fall through)
   *   @0xda3100  rcx = (i64)edx
   *   @0xda3103  cmpl $0,0x2f8(%rdi,%rcx,4) ; je 0xda317d → ringStatus[edx]==0 ?
   *   @0xda317d  ecx = (u8)0x7a8(%rdi,%rcx) ; eax += ecx  → add ringLateCnt[edx]
   *   @0xda310d  return eax
   *   ; --- count > 1 (2x-unrolled backward walk) ---
   *   @0xda3113  esi = ecx & ~1  (pair count) ; eax = 0 ; r8d = 0x3b (=59 wrap)
   *   loop @0xda3140:  idx=edx: if ringStatus[idx]==0 eax += ringLateCnt[idx]
   *   @0xda315a: r9d = (edx==0)?59:edx-1  (prev, cmovel r8d)
   *   @0xda3167: idx=r9d: if ringStatus[idx]==0 eax += ringLateCnt[idx]
   *   @0xda3130: edx = (r9==0)?59:r9-1 ; esi -= 2 ; je 0xda30fb (odd-remainder tail)
   *
   * The 2x unroll + `esi = count & ~1` + odd tail at `testb $1,%cl` is exactly a
   * `count`-iteration backward walk (start at ringHead, prev = idx==0?59:idx-1).
   * Transcribed as that loop; the accumulation and wrap constant are identical.
   *
   * Zero in-scope callees; pure field arithmetic.
   */
  diskLates(): number {
    // @0xda30e4/@0xda30ea — count == 0 → return 0.
    const count = this.ringCount | 0;
    if (count === 0) return 0;
    // @0xda30ee — start index = ringHead.
    let idx = this.ringHead | 0;
    let sum = 0;
    // `count`-iteration backward walk (the unrolled machine visits exactly this
    // many slots: (count & ~1) pairs + the odd-count tail at @0xda30fb).
    for (let i = 0; i < count; i++) {
      // @0xda3103/@0xda3143/@0xda3167 — cmpl $0,ringStatus[idx] ; only late (==0)
      // slots contribute.
      if ((this.ringStatus[idx] | 0) === 0) {
        // @0xda317d/@0xda314e/@0xda3171 — movzbl ringLateCnt[idx] ; eax += byte.
        sum = (sum + (this.ringLateCnt[idx] & 0xff)) | 0;
      }
      // @0xda315a/@0xda3130 — prev = (idx == 0) ? 59 : idx - 1 (cmovel $0x3b).
      idx = idx === 0 ? FFPLAYER_HEALTH_RING - 1 : idx - 1;
    }
    // @0xda310d/@0xda3111 — return eax.
    return sum | 0;
  }
}
