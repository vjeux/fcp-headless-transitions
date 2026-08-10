// FFPlayerHealthMeter.ts — one method of Flexo's FFPlayerHealthMeter, faithfully transcribed
// from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly:
//   raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter35getLiveEditFrameGenerationAllowanceEd.s
//
// Only `getLiveEditFrameGenerationAllowance(double)` is ported here (the sole unit dispatched
// from the dependency queue). Sibling methods (setFrameDur, setFailedPreroll, …) live in the same
// class file under their own ledger units and are ADDED, never removed.
//
// STRUCT LAYOUT (fields this method reads on `this` = %r14):
//   +0x18   frameDurSeconds  float   // f32: current frame duration in seconds (set by setFrameDur).
//   +0x1b10 liveEditAllowanceLimit1 float // f32: first per-frame allowance limit (seconds). Only
//                                          //   used when > 0; caps the frame-duration contribution.
//   +0x1b44 liveEditAllowanceLimit2 float // f32: second allowance limit (seconds). Only used when
//                                          //   > 0; caps the (frameDurSeconds*5) contribution.
//
// Return value: a single CMTime (24-byte sret). The FCP frame ↔ CMTime convention here uses a
// fixed timescale of 10000 (0x2710): a seconds value `s` becomes CMTimeMake(trunc(s*10000), 10000).

import type { CMTime } from "../infra/CMTime.js";
import {
  CMTimeMake,
  CMTimeAdd,
  CMTimeSubtract,
  CMTimeCompare,
  CMTimeGetSeconds,
  kCMTimeZero,
} from "../infra/CMTime.js";

export class FFPlayerHealthMeter {
  // +0x00  current frame duration as a CMTime (24-byte struct) — written by
  //        setFrameDur; the first field of the object. (Recovered from
  //        setFrameDur @Flexo 0xda1820: `this+0x0` is the target of the
  //        24-byte struct copy and the source of the second CMTimeCompare.)
  frameDur: CMTime = { ...kCMTimeZero };
  // +0x18  frame duration in seconds (single precision) — read by
  //        getLiveEditFrameGenerationAllowance, written by setFrameDur.
  frameDurSeconds = 0;
  // +0x1c  frame rate = 1.0f / frameDurSeconds (single precision) — written
  //        by setFrameDur (@Flexo 0xda18c2..0xda18ce). Immediately follows
  //        frameDurSeconds in the object.
  frameRate = 0;
  // +0x1b10  first live-edit per-frame allowance limit in seconds (f32).
  liveEditAllowanceLimit1 = 0;
  // +0x1b44  second live-edit allowance limit in seconds (f32).
  liveEditAllowanceLimit2 = 0;
  // +0x1b60  failed-preroll latch (u32, accessed atomically). Set to 1 by
  //          setFailedPreroll(true) via an `xchgl` (atomic store); never
  //          cleared by that setter — a one-way "preroll failed" flag.
  failedPreroll = 0;

  /**
   * FFPlayerHealthMeter::setFailedPreroll(bool)
   * @0xADDR Flexo 0x0000000000da37d0  (__ZN19FFPlayerHealthMeter16setFailedPrerollEb)
   *
   * One-way latch: when called with `true`, atomically stores 1 into the
   * `failedPreroll` word at this+0x1b60. When called with `false`, it is a
   * no-op — the flag is NEVER cleared here (some other method resets it).
   *
   * FULL DISASM (raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter16setFailedPrerollEb.s — 9 lines):
   *   0xda37d0  pushq %rbp ; movq %rsp,%rbp
   *   0xda37d4  testl %esi, %esi              ; arg (bool) == 0 ?
   *   0xda37d6  je    0xda37e3                ;   if false -> return (no store)
   *   0xda37d8  movl  $0x1, %eax              ; eax = 1
   *   0xda37dd  xchgl %eax, 0x1b60(%rdi)      ; ATOMIC: swap this->failedPreroll <- 1
   *                                           ;   (xchg with a memory operand has an
   *                                           ;    implicit LOCK; old value into eax,
   *                                           ;    discarded)
   *   0xda37e3  popq  %rbp ; retq             ; return (void)
   *
   * In-scope callees: NONE. No externs. Pure atomic field store gated on the
   * boolean argument. The `xchgl`'s implicit LOCK makes the write atomic; in a
   * single-threaded JS realm a plain assignment is the faithful equivalent
   * (the old value the machine loads into eax is discarded).
   *
   * @param failed when true, latch failedPreroll = 1; when false, no-op.
   */
  setFailedPreroll(failed: boolean): void {
    // @0xda37d4 testl %esi,%esi ; @0xda37d6 je 0xda37e3 : if !failed, return.
    if (!failed) {
      return;
    }
    // @0xda37d8 movl $0x1,%eax ; @0xda37dd xchgl %eax,0x1b60(%rdi) :
    //   atomically store 1 into this->failedPreroll (old value discarded).
    this.failedPreroll = 1;
  }
  // +0x1b5c  number of GPUs (int32) — written by setNumGPUs(int) @Flexo 0xda45e0.
  numGPUs = 0;

  /**
   * FFPlayerHealthMeter::setFrameDur(CMTime)
   * @0xADDR Flexo 0x0000000000da1820  (__ZN19FFPlayerHealthMeter11setFrameDurE6CMTime)
   *
   * Stores a new frame-duration CMTime on `this` and, if it differs from the
   * currently-stored duration, updates the cached `frameDurSeconds` (f32) and
   * `frameRate` (= 1.0f / seconds, f32).
   *
   * DECODE (raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter11setFrameDurE6CMTime.s — 50 lines):
   *
   *   ; --- build a local CMTime = CMTimeMake(1, 1000) = 1ms ---
   *   0xda182c  leaq -0x20(%rbp),%rdi                        ; sret = &localOneMs
   *   0xda1830  movl $0x1,%esi                               ; value = 1
   *   0xda1835  movl $0x3e8,%edx                             ; timescale = 1000 (0x3E8)
   *   0xda183a  callq _CMTimeMake                            ; localOneMs = CMTimeMake(1, 1000)
   *
   *   ; --- first CMTimeCompare(param, localOneMs) — RESULT UNUSED ---
   *   0xda183f-0xda185e  stack: arg1 = param CMTime (from 0x10(%rbp)/0x20(%rbp)) @ (%rsp);
   *                              arg2 = localOneMs (from -0x20(%rbp)/-0x10(%rbp)) @ 0x18(%rsp)
   *   0xda1862  callq _CMTimeCompare                         ; eax = compare(param, 1ms) — NOT READ
   *
   *   ; --- second CMTimeCompare(param, this->frameDur@0x0) — gates the update ---
   *   0xda1867-0xda1885  stack: arg1 = param CMTime @ (%rsp);
   *                              arg2 = this->frameDur (from 0x10(%rbx)/(%rbx)) @ 0x18(%rsp)
   *   0xda1889  callq _CMTimeCompare
   *   0xda188e  testl %eax,%eax ; je 0xda18d3                ; if (param == this->frameDur) return
   *
   *   ; --- update block (0xda1892): param differs from stored frameDur ---
   *   0xda1892  leaq 0x10(%rbp),%rax                         ; rax = &param CMTime
   *   0xda1896-0xda18a1  this->frameDur = param              ; 24-byte struct copy to this+0x0
   *                        (movq param+0x10 -> this+0x10 ; movups param[0..15] -> this[0..15])
   *   0xda18a4-0xda18b0  stack: arg = param CMTime @ (%rsp)
   *   0xda18b4  callq _CMTimeGetSeconds                      ; xmm0 = (double)seconds(param)
   *   0xda18b9  cvtsd2ss %xmm0,%xmm0                         ; s = (float)seconds
   *   0xda18bd  movss %xmm0,0x18(%rbx)                       ; this->frameDurSeconds = s
   *   0xda18c2  movss 1.0f(%rip),%xmm1                       ; xmm1 = 1.0f  (@Flexo __const 0x156ccd0)
   *   0xda18ca  divss %xmm0,%xmm1                            ; xmm1 = 1.0f / s
   *   0xda18ce  movss %xmm1,0x1c(%rbx)                       ; this->frameRate = 1.0f / s
   *   0xda18d3  ...retq                                      ; return (void)
   *
   * In-scope callees: NONE. The four callees (_CMTimeMake / _CMTimeCompare (x2) /
   * _CMTimeGetSeconds) are CoreMedia public-API boundary functions, modelled in
   * ../infra/CMTime.ts (imported and called here — no re-stub).
   *
   * @param frameDur the new frame duration (CMTime passed by value — the caller's
   *        24-byte struct at 0x10(%rbp)).
   */
  setFrameDur(frameDur: CMTime): void {
    // @0xda182c..0xda183a  localOneMs = CMTimeMake(1, 1000)  (value=1, timescale=0x3E8=1000).
    const localOneMs = CMTimeMake(1, 1000);

    // @0xda183f..0xda1862  first CMTimeCompare(param, localOneMs). The machine
    //   emits this call but never reads its result (eax is overwritten at
    //   0xda1867 before use). Transcribed faithfully as a call whose return is
    //   discarded — do not drop it (it is real work the binary performs).
    void CMTimeCompare(frameDur, localOneMs);

    // @0xda1867..0xda1890  second CMTimeCompare(param, this->frameDur);
    //   testl %eax,%eax ; je return  →  if equal (compare == 0), no-op return.
    if (CMTimeCompare(frameDur, this.frameDur) === 0) {
      // @0xda1890 je 0xda18d3 : param equals the stored frameDur — return.
      return;
    }

    // @0xda1892..0xda18a1  this->frameDur = param  (24-byte struct copy to this+0x0).
    this.frameDur = {
      value: frameDur.value,
      timescale: frameDur.timescale,
      flags: frameDur.flags,
      epoch: frameDur.epoch,
    };

    // @0xda18b4  s_double = CMTimeGetSeconds(param).
    const sDouble = CMTimeGetSeconds(frameDur);
    // @0xda18b9  cvtsd2ss : s = (float)s_double.
    const s = Math.fround(sDouble);
    // @0xda18bd  this->frameDurSeconds = s.
    this.frameDurSeconds = s;
    // @0xda18c2..0xda18ce  this->frameRate = (float)(1.0f / s).
    //   1.0f is the __const @Flexo 0x156ccd0 (bytes 00 00 80 3f = 1.0f);
    //   divss is single-precision, so wrap the quotient in Math.fround.
    this.frameRate = Math.fround(Math.fround(1.0) / s);
  }

  /**
   * FFPlayerHealthMeter::getLiveEditFrameGenerationAllowance(double)
   * @0xADDR Flexo 0x0000000000da35c0  (__ZN19FFPlayerHealthMeter35getLiveEditFrameGenerationAllowanceEd)
   *
   * Returns a CMTime allowance (sret). The `double` argument (`arg`) only gates behaviour by its
   * value being zero / non-zero / negative — its magnitude is never used arithmetically:
   *   - the two contribution blocks run only when `arg != 0.0`;
   *   - the final result is negated when `arg < 0.0`.
   *
   * DECODE (raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter35getLiveEditFrameGenerationAllowanceEd.s):
   *
   *   0xda35d6  movss 0x18(%r14),%xmm3 ; cvtss2sd -> %xmm4   ; frameDurSeconds (f32) -> dur (f64)
   *   0xda35df  movq _kCMTimeZero(%rip),%r15                 ; &kCMTimeZero
   *   0xda35e6-0xda35f2  result = kCMTimeZero                ; sret (%rdi=%rbx) initialised to zero
   *   0xda35f5-0xda3604  xorpd %xmm5 ; ucomisd %xmm5,%xmm0 ; jne .b1 ; jnp .skip1
   *                                                         ; run block-1 iff (arg != 0.0)
   *
   *   ; --- Block 1 (0xda360a): frameDuration-limited contribution ---
   *   0xda360a  movss 0x1b10(%r14),%xmm1                     ; limit1 (f32)
   *   0xda3613-0xda3619  ucomiss 0,%xmm1 ; jbe .skip1        ; skip block-1 iff (limit1 <= 0)
   *   0xda361b  ucomiss %xmm3(dur_f32),%xmm1(limit1)         ; flags on (limit1 - dur_f32)
   *   0xda3623  movaps %xmm4,%xmm0                           ; v1 = dur (f64), the ja-taken default
   *   0xda3626  ja 0xda362f                                  ; if (limit1 > dur_f32) keep v1 = dur
   *   0xda3628-0xda362b  else  v1 = (double)limit1           ; -> v1 = min(dur, limit1)
   *   0xda363f  mulsd  10000.0(%rip),%xmm0                   ; v1 *= 10000.0   (@Flexo __const 0x156fce8)
   *   0xda3647  cvttsd2si %xmm0,%rsi                         ; n1 = (int64)trunc(v1*10000)
   *   0xda3655  callq _CMTimeMake  (rsi=n1, edx=0x2710)      ; t1 = CMTimeMake(n1, 10000)
   *   0xda3680  callq _CMTimeAdd   (arg1=kCMTimeZero copy, arg2=t1, sret=result)
   *                                                         ; result = kCMTimeZero + t1  == t1
   *
   *   ; --- re-test arg for block 2 (0xda3693) ---
   *   0xda3693-0xda3699  ucomisd %xmm5(0),%xmm0(arg) ; jne .b2 ; jnp .skip2
   *                                                         ; run block-2 iff (arg != 0.0)
   *
   *   ; --- Block 2 (0xda369f): 5x-frameDuration contribution ---
   *   0xda369f  movss 0x1b44(%r14),%xmm2                     ; limit2 (f32)
   *   0xda36a8-0xda36ae  ucomiss 0,%xmm2 ; jbe .skip2        ; skip block-2 iff (limit2 <= 0)
   *   0xda36b3  cvtss2sd %xmm2,%xmm1                         ; xmm1 = (double)limit2
   *   0xda36b7  mulsd 5.0(%rip),%xmm4                        ; xmm4 = dur * 5.0   (@Flexo __const 0x156ca50)
   *   0xda36bf  minsd %xmm1,%xmm4                            ; v2 = min(dur*5.0, limit2)
   *   0xda36d2  mulsd 10000.0(%rip),%xmm4                    ; v2 *= 10000.0   (@Flexo __const 0x156fce8)
   *   0xda36da  cvttsd2si %xmm4,%rsi                         ; n2 = (int64)trunc(v2*10000)
   *   0xda36e8  callq _CMTimeMake  (rsi=n2, edx=0x2710)      ; t2 = CMTimeMake(n2, 10000)
   *   0xda3714  callq _CMTimeAdd   (arg1=t2, arg2=result, sret=result)
   *                                                         ; result = t2 + result
   *
   *   ; --- Block 3 (0xda372d): negate when arg < 0 ---
   *   0xda372d  xorps %xmm1 ; ucomisd %xmm0(arg),%xmm1(0)    ; flags on (0 - arg)
   *   0xda3734  jbe 0xda3792                                 ; if (0 <= arg) skip  -> run iff (arg < 0)
   *   0xda3736-0xda377c  callq _CMTimeSubtract (arg1=kCMTimeZero, arg2=result, sret=result)
   *                                                         ; result = kCMTimeZero - result  == -result
   *   0xda3792  movq %rbx,%rax ; ... ; retq                 ; return result
   *
   * In-scope callees: NONE. The three callees (_CMTimeMake / _CMTimeAdd / _CMTimeSubtract) and the
   * _kCMTimeZero datum are CoreMedia public-API boundary functions, modelled in ../infra/CMTime.ts.
   */
  getLiveEditFrameGenerationAllowance(arg: number): CMTime {
    // @0xda35d6..0xda35db  dur = (double)(float)this.frameDurSeconds.
    const dur = Math.fround(this.frameDurSeconds);

    // @0xda35e6..0xda35f2  result = kCMTimeZero.
    let result: CMTime = { ...kCMTimeZero };

    // @0xda35f9..0xda3604  the two contribution blocks run only when arg != 0.0.
    const argNonZero = arg !== 0;

    // --- Block 1: frame-duration-limited contribution (@0xda360a) ---
    // @0xda3616..0xda3619  gate: limit1 > 0.
    const limit1 = Math.fround(this.liveEditAllowanceLimit1);
    if (argNonZero && limit1 > 0) {
      // @0xda361b..0xda362b  v1 = (limit1 > dur) ? dur : limit1  == min(dur, limit1).
      const v1 = limit1 > dur ? dur : limit1;
      // @0xda363f..0xda3647  n1 = trunc(v1 * 10000.0).   (@const 10000.0 @ Flexo __const 0x156fce8)
      const n1 = BigInt(Math.trunc(v1 * 10000.0));
      // @0xda3655  t1 = CMTimeMake(n1, 10000).   (edx = 0x2710)
      const t1 = CMTimeMake(n1, 0x2710);
      // @0xda3680  result = CMTimeAdd(kCMTimeZero, t1).
      result = CMTimeAdd(kCMTimeZero, t1);
    }

    // --- Block 2: 5x-frame-duration contribution (@0xda369f) ---
    // @0xda36ab..0xda36ae  gate: limit2 > 0.
    const limit2 = Math.fround(this.liveEditAllowanceLimit2);
    if (argNonZero && limit2 > 0) {
      // @0xda36b3..0xda36bf  v2 = min(dur * 5.0, limit2).   (@const 5.0 @ Flexo __const 0x156ca50)
      const v2 = Math.min(dur * 5.0, limit2);
      // @0xda36d2..0xda36da  n2 = trunc(v2 * 10000.0).   (@const 10000.0 @ Flexo __const 0x156fce8)
      const n2 = BigInt(Math.trunc(v2 * 10000.0));
      // @0xda36e8  t2 = CMTimeMake(n2, 10000).   (edx = 0x2710)
      const t2 = CMTimeMake(n2, 0x2710);
      // @0xda3714  result = CMTimeAdd(t2, result).
      result = CMTimeAdd(t2, result);
    }

    // --- Block 3: negate when arg < 0 (@0xda372d) ---
    // @0xda3730..0xda3734  ucomisd (0 - arg) ; jbe skip  -> run iff arg < 0.
    if (arg < 0) {
      // @0xda377c  result = CMTimeSubtract(kCMTimeZero, result)  == -result.
      result = CMTimeSubtract(kCMTimeZero, result);
    }

    // @0xda3792  return result.
    return result;
  }

  /**
   * FFPlayerHealthMeter::setNumGPUs(int)
   * @0xADDR Flexo 0x0000000000da45e0  (__ZN19FFPlayerHealthMeter10setNumGPUsEi)
   *
   * Faithful line-for-line transcription of the 7-line disassembly
   * (raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter10setNumGPUsEi.s):
   *
   *   0xda45e0  pushq %rbp                    ; frame prologue
   *   0xda45e1  movq  %rsp, %rbp
   *   0xda45e4  movl  %esi, 0x1b5c(%rdi)        ; this->+0x1b5c = arg (int32 store)
   *   0xda45ea  popq  %rbp                     ; frame epilogue
   *   0xda45eb  retq
   *   0xda45ec  nopl  (%rax)                    ; alignment padding (not executed)
   *
   * Single-instruction body: store the incoming `int` argument (SysV/AAPCS
   * puts scalar arg2 in `%rsi`; a 32-bit `int` occupies the low half `%esi`)
   * into the class slot at +0x1b5c. The `movl` (32-bit store) confirms the
   * field is a 4-byte int. Modelled as `number` (JS Number covers int32
   * exactly); `| 0` forces int32 truncation to mirror the machine's `movl`.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure field write.
   */
  setNumGPUs(numGPUs: number): void {
    // @0xda45e4  movl %esi,0x1b5c(%rdi)
    this.numGPUs = numGPUs | 0;
  }
}
