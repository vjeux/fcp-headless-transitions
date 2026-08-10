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
import { CMTimeMake, CMTimeAdd, CMTimeSubtract, kCMTimeZero } from "../infra/CMTime.js";

export class FFPlayerHealthMeter {
  // +0x18  frame duration in seconds (single precision) — read by this method.
  frameDurSeconds = 0;
  // +0x1b10  first live-edit per-frame allowance limit in seconds (f32).
  liveEditAllowanceLimit1 = 0;
  // +0x1b44  second live-edit allowance limit in seconds (f32).
  liveEditAllowanceLimit2 = 0;
  // +0x1b60  failed-preroll latch (u32, accessed atomically). Set to 1 by
  //          setFailedPreroll(true) via an `xchgl` (atomic store); never
  //          cleared by that setter — a one-way "preroll failed" flag.
  failedPreroll = 0;

  // ---- fields first observed by GetGraphExecPercent() @0xda38c0 ----
  // +0x1c    graphExecDivisor float (f32) — final normalizer/divisor.
  // +0x1b3c  graphExecBudget  float (f32) — graph-exec budget (denominator).
  // +0x1b5c  graphExecCount   int32       — executed-graph count (signed).
  graphExecDivisor = 0;
  graphExecBudget = 0;
  graphExecCount = 0;

  // ---- fields first observed by calcDiskHealth(bool,int,bool) @0xda2450 ----
  // Fixed-size ring buffer of 60 (0x3c) per-frame sample slots; calcDiskHealth
  // walks it backward from `ringHead` over `numSamples` slots, skipping any slot
  // flagged "dropped".
  //   +0x2f8   dropped[i]   i32[]  — nonzero => slot i is a dropped frame (skip).
  //   +0xa78   perfA[i]     f32[]  — per-slot metric A (summed then averaged).
  //   +0x14c8  frameNum[i]  i32[]  — per-slot frame number (deltas + windows).
  //   +0x15b8  frameNum2[i] i32[]  — per-slot secondary frame number (averaged).
  //   +0x1888  numSamples   i32
  //   +0x188c  ringHead     i32
  //   +0x1894  clampScoreFlag i32  — when nonzero the final score is min'd to 0.75.
  // Output fields:
  //   +0x1b40 avgPerfA f32   +0x1b4c healthScore f32   +0x1b50 meanFrameNum f32
  //   +0x1b54 scoreInput f32 +0x1b58 avgFrameNum2 f32  +0x1b60 (failedPreroll)
  //   +0x1b64 avgDelta f32   +0x1b68 stallCounter i32  +0x1b6c stallScore f32
  dropped: number[] = [];
  perfA: number[] = [];
  frameNum: number[] = [];
  frameNum2: number[] = [];
  numSamples = 0;
  ringHead = 0;
  clampScoreFlag = 0;
  avgPerfA = 0;
  healthScore = 0;
  meanFrameNum = 0;
  scoreInput = 0;
  avgFrameNum2 = 0;
  avgDelta = 0;
  stallCounter = 0;
  stallScore = 0;

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

  /**
   * FFPlayerHealthMeter::GetGraphExecPercent()
   * @0xADDR Flexo 0x0000000000da38c0  (__ZN19FFPlayerHealthMeter19GetGraphExecPercentEv)
   *
   * Returns a float32 percentage. Reads three fields on `this`:
   *   +0x1b3c  graphExecBudget  (f32) — the budget/denominator.
   *   +0x1b5c  graphExecCount   (int32) — the executed-graph count.
   *   +0x1c    graphExecDivisor (f32) — final normalizer.
   *
   * FULL DISASM (raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter19GetGraphExecPercentEv.s — 22 lines):
   *   0xda38c4  movss   0x1b3c(%rdi),%xmm1        ; xmm1 = graphExecBudget (f32)
   *   0xda38cc  xorps   %xmm0,%xmm0               ; xmm0 = 0.0
   *   0xda38cf  ucomiss %xmm0,%xmm1               ; flags on (budget - 0)
   *   0xda38d2  jbe     0xda38f6                  ; if (budget <= 0.0) -> fallback branch
   *   ; --- main branch (budget > 0) ---
   *   0xda38d4  xorps   %xmm0,%xmm0
   *   0xda38d7  cvtsi2ssl 0x1b5c(%rdi),%xmm0      ; xmm0 = (float)(int32) graphExecCount  (SIGNED)
   *   0xda38df  divss   %xmm1,%xmm0               ; xmm0 = count / budget
   *   0xda38e3  movss   0x1c(%rdi),%xmm1          ; xmm1 = graphExecDivisor (f32)
   *   0xda38e8  mulss   0x7cb7e0(%rip),%xmm0      ; xmm0 *= 100.0   (@Flexo __const 0x156f0d0)
   *   0xda38f0  divss   %xmm1,%xmm0               ; xmm0 = (count/budget * 100.0) / divisor
   *   0xda38f4  retq                              ; return xmm0
   *   ; --- fallback branch (budget <= 0), 0xda38f6 ---
   *   0xda38f6  movss   0x1c(%rdi),%xmm1          ; xmm1 = graphExecDivisor (f32)
   *   0xda38fb  movaps  %xmm1,%xmm0               ; xmm0 = divisor
   *   0xda38fe  mulss   0x7cb7ca(%rip),%xmm0      ; xmm0 *= 100.0   (@Flexo __const 0x156f0d0)
   *   0xda3906  divss   %xmm1,%xmm0               ; xmm0 = (divisor * 100.0) / divisor
   *   0xda390b  retq                              ; return xmm0
   *
   * SEMANTICS: when the budget is positive, the percentage is
   * `(graphExecCount / graphExecBudget) * 100.0 / graphExecDivisor`. When the
   * budget is non-positive, it degenerates to `(graphExecDivisor * 100.0) /
   * graphExecDivisor` — 100.0 for any finite nonzero divisor, but the machine
   * literally recomputes `divisor*100/divisor` (a zero/non-finite divisor yields
   * NaN/±Inf exactly as the hardware would); this port transcribes that
   * arithmetic verbatim rather than folding it to 100.0.
   *
   * `ucomiss %xmm0,%xmm1` sets flags on `budget - 0.0`; `jbe` (CF|ZF) is taken
   * iff `budget <= 0.0` — the fallback path. A NaN budget also takes `jbe`.
   *
   * In-scope callees: NONE. No externs. Both constants are the same IEEE-754
   * float32 `100.0` @Flexo __TEXT __const 0x156f0d0 (verified: 4 bytes at
   * fat-x86_64 file offset 0x4000+0x156f0d0 = 00 00 c8 42 = 100.0f). All ops
   * are single-precision, so every intermediate is wrapped in Math.fround.
   */
  GetGraphExecPercent(): number {
    // @0xda38c4  movss 0x1b3c(%rdi),%xmm1 : budget (f32).
    const budget = Math.fround(this.graphExecBudget);
    // divisor (f32), read in both branches from +0x1c.
    const divisor = Math.fround(this.graphExecDivisor);

    // @0xda38cf..0xda38d2  ucomiss %xmm0(0),%xmm1(budget) ; jbe 0xda38f6 :
    //   fallback iff (budget <= 0.0) — NaN budget also falls here (!(budget>0)).
    if (!(budget > 0)) {
      // --- fallback branch @0xda38f6 --- xmm0=divisor ; *100.0 ; /divisor.
      return Math.fround(Math.fround(divisor * 100.0) / divisor);
    }

    // --- main branch (budget > 0) @0xda38d4 ---
    // @0xda38d7  cvtsi2ssl 0x1b5c(%rdi),%xmm0 : SIGNED int32 count -> float32.
    const countF = Math.fround(this.graphExecCount | 0);
    // @0xda38df  divss %xmm1,%xmm0 : count / budget (f32).
    const ratio = Math.fround(countF / budget);
    // @0xda38e8  mulss 100.0 ; @0xda38f0 divss %xmm1(divisor).
    return Math.fround(Math.fround(ratio * 100.0) / divisor);
  }

  /**
   * FFPlayerHealthMeter::calcDiskHealth(bool arg1, int arg2, bool commit)
   * @0xADDR Flexo 0x0000000000da2450  (__ZN19FFPlayerHealthMeter14calcDiskHealthEbib)
   *
   * Faithful transcription of the 354-line disassembly
   * (raw-port/re/disasm/Flexo.__ZN19FFPlayerHealthMeter14calcDiskHealthEbib.s).
   *
   * The machine code is IRREDUCIBLE: a ring-buffer walk with three overlapping
   * sliding-window snapshots + a running max, feeding a deep post-loop scoring
   * tree, plus two tail blocks (@0xda2676 "commit tail" and @0xda2950 "finish
   * score") that are `jmp`-targets reached from several places. It is therefore
   * rendered as a SINGLE function driven by a labeled dispatch loop whose states
   * are the exact block addresses in the binary (the standard faithful way to
   * port goto-structured code — NO invented helper functions). Every `jmp`/`jCC`
   * becomes `blk = <addr>; continue;` to the matching state.
   *
   * f32 ops wrapped in Math.fround; cvtss2sd/cvtsd2ss transitions are explicit
   * doubles; signed int32->float uses `| 0`. No in-scope callees, no externs.
   *
   * Constants (Flexo __TEXT __const, read at fat-x86_64 file off 0x4000+VA):
   *   2.0 @0x156e940 · 4.0 @0x156ccdc · 5.0d @0x156ca50 · 15.0d @0x156f9a0 ·
   *   30.0d @0x156efd8 · 26.0 @0x157f328 · 25.0 @0x157f32c · 22.0 @0x157f330 ·
   *   -0.5 @0x156cf6c · 0.25 @0x156cd6c · 1.5 @0x1572ba0 · 10.0 @0x156e7e8 ·
   *   -1.5d @0x156f9e8 · 8.5d @0x157f348 · 1.0 @0x156ccd0(=imm 0x3f800000) ·
   *   0.5 @0x156ccd8 · 0.75 @0x156cf14.
   *
   * AT&T dst-src reminder: `ucomiss %src,%dst` => flags on (dst-src); `ja`=dst>src,
   * `jbe`=dst<=src, `jae`=dst>=src, `jb`=dst<src.
   */
  calcDiskHealth(arg1: boolean, arg2: number, commit: boolean): void {
    const f = Math.fround;
    const cvtsi2ss = (n: number): number => f(n | 0); // signed int32 -> f32.

    const C_2 = f(2.0); // @0x156e940
    const C_4 = f(4.0); // @0x156ccdc
    const C_5d = 5.0; // @0x156ca50
    const C_15d = 15.0; // @0x156f9a0
    const C_30d = 30.0; // @0x156efd8
    const C_26 = f(26.0); // @0x157f328
    const C_25 = f(25.0); // @0x157f32c
    const C_22 = f(22.0); // @0x157f330
    const C_negHalf = f(-0.5); // @0x156cf6c
    const C_025 = f(0.25); // @0x156cd6c
    const C_15f = f(1.5); // @0x1572ba0
    const C_10 = f(10.0); // @0x156e7e8
    const C_negOneHalf_d = -1.5; // @0x156f9e8
    const C_85d = 8.5; // @0x157f348
    const C_1 = f(1.0); // @0x156ccd0 / imm 0x3f800000
    const C_half = f(0.5); // @0x156ccd8
    const C_075 = f(0.75); // @0x156cf14

    const EDX_WRAP = 0x3b; // ring size-1 = 59 (movl $0x3b,%edx).

    // ---- machine registers as locals ----
    let r8d = 0; // validCount
    let r9d = this.numSamples | 0; // countdown of remaining slots
    let r10d = 0; // deltaCount
    let r11d = 0; // frameNum2 count
    let r12d = 0; // ring index
    let r13d = 0; // curFrameNum
    let r14d = 0; // firstFrameNum
    let r15d = 0; // count where frameNum==frameNum2
    let ebx = 0; // perfA count
    let eax = 0; // scratch int
    let r9b = false; // (r15d==0) flag

    let xmm0 = 0; // sumDelta / meanAll carrier
    let xmm1 = 0; // sumFrameNum / scoreInput carrier
    let xmm2 = 0; // window@<5 snapshot; later win9_d holder in refine
    let xmm3 = 0; // scratch
    let xmm4 = 0; // window@<15 snapshot
    let xmm5 = 0; // sumFrameNum2
    let xmm6 = 0; // scratch / runningMax carrier
    let xmm7 = 0; // sumPerfA
    let xmm8 = 0; // runningMax; later win2_d
    let xmm9 = 0; // window@<30 snapshot

    let win2_d = 0;
    let win4_d = 0;
    let win9_d = 0;

    // @0xda2464 testl %r9d,%r9d ; je 0xda25d3
    if (r9d === 0) {
      this.healthScore = C_1; // @0xda25d3 movl $0x3f800000,0x1b4c
      this.avgPerfA = 0; // @0xda25dd movl $0x0,0x1b40
      return; // @0xda25e7 jmp 0xda2a35
    }

    // Dispatch-loop state (block address). Start by deciding walk vs reset.
    // @0xda2470 jle 0xda25ec (r9d<0 here since ==0 handled) else main loop.
    let blk: number;
    if (r9d < 0) {
      blk = 0x25ec;
    } else {
      // @0xda247c setup for the main walk.
      r12d = this.ringHead | 0; // movslq 0x188c
      eax = this.frameNum[r12d] | 0; // prevFrameNum
      blk = 0x252a; // enter Ltop
    }

    // eslint-disable-next-line no-constant-condition
    dispatch: while (true) {
      switch (blk) {
        // ===================== main walk =====================
        case 0x252a: {
          // Ltop: fetch slot r12d.
          const rsi = r12d; // movslq %r12d,%rsi
          // @0xda252d cmpl $0x0,0x2f8(%rdi,%rsi,4) ; jne 0xda2517
          if ((this.dropped[rsi] | 0) !== 0) {
            blk = 0x2517;
            continue dispatch;
          }
          // @0xda2537 movl 0x14c8(%rdi,%rsi,4),%r13d
          r13d = this.frameNum[rsi] | 0;
          const r8WasZero = r8d === 0; // testl %r8d,%r8d
          // @0xda2542 cvtsi2ss %r13d,%xmm8
          xmm8 = cvtsi2ss(r13d);
          // @0xda254b cmovel %r13d,%r14d
          if (r8WasZero) r14d = r13d;
          // @0xda254f addss %xmm8,%xmm1
          xmm1 = f(xmm1 + xmm8);
          // @0xda2554 cmpl $0x1d,%r8d ; jg 0xda2580
          if (r8d > 0x1d) {
            // @0xda2580 ucomiss %xmm8,%xmm6 ; ja 0xda24d0 else 0xda259a
            if (!(xmm6 > xmm8)) {
              xmm8 = xmm6; // @0xda259a movaps %xmm6,%xmm8
            }
            blk = 0x24d0;
            continue dispatch;
          }
          // @0xda255a cmpl $0xe,%r8d ; jg 0xda258c
          if (r8d > 0xe) {
            xmm9 = xmm1; // @0xda258c movaps %xmm1,%xmm9
            // @0xda2590 ucomiss %xmm8,%xmm6 ; ja 0xda24d0 else 0xda259a
            if (!(xmm6 > xmm8)) {
              xmm8 = xmm6;
            }
            blk = 0x24d0;
            continue dispatch;
          }
          // @0xda2560 cmpl $0x5,%r8d ; jge 0xda2569
          if (r8d < 5) {
            xmm2 = xmm1; // @0xda2566 movaps %xmm1,%xmm2
          }
          // @0xda2569 movaps %xmm1,%xmm9 ; movaps %xmm1,%xmm4
          xmm9 = xmm1;
          xmm4 = xmm1;
          // @0xda2570 testl %r8d,%r8d ; je 0xda24bc
          if (r8d === 0) {
            // @0xda24bc movaps %xmm1,%xmm9/%xmm4/%xmm2
            xmm9 = xmm1;
            xmm4 = xmm1;
            xmm2 = xmm1;
          }
          blk = 0x24d0;
          continue dispatch;
        }

        case 0x24d0: {
          // ADVANCE: accumulate this slot, then ring-decrement.
          const rsi = r12d; // rsi still holds the current slot index.
          r8d = (r8d + 1) | 0; // incl %r8d
          eax = (eax - r13d) | 0; // subl %r13d,%eax : delta
          xmm0 = f(xmm0 + cvtsi2ss(eax)); // cvtsi2ss+addss : sumDelta
          r10d = (r10d + 1) | 0; // incl %r10d
          xmm7 = f(xmm7 + f(this.perfA[rsi])); // addss 0xa78[rsi]
          ebx = (ebx + 1) | 0; // incl %ebx
          eax = this.frameNum2[rsi] | 0; // movl 0x15b8[rsi],%eax
          xmm5 = f(xmm5 + cvtsi2ss(eax)); // sumFrameNum2
          r11d = (r11d + 1) | 0; // incl %r11d
          if (r13d === eax) r15d = (r15d + 1) | 0; // sete+addl
          xmm6 = xmm8; // movaps %xmm8,%xmm6 : carry runningMax
          eax = r13d; // movl %r13d,%eax : prev=cur
          r12d = r12d !== 0 ? r12d - 1 : EDX_WRAP; // ring decrement (cmovel)
          r9d = (r9d - 1) | 0; // decl %r9d
          if (r9d === 0) {
            blk = 0x25a3;
            continue dispatch;
          }
          blk = 0x252a;
          continue dispatch;
        }

        case 0x2517: {
          // dropped-slot skip: ring-decrement + dec r9d, back to Ltop.
          r12d = r12d !== 0 ? r12d - 1 : EDX_WRAP;
          r9d = (r9d - 1) | 0;
          if (r9d === 0) {
            blk = 0x25a3;
            continue dispatch;
          }
          blk = 0x252a;
          continue dispatch;
        }

        // ===================== walk done =====================
        case 0x25a3: {
          // @0xda25a7 cvtss2sd of the three window snapshots.
          win2_d = xmm2;
          win4_d = xmm4;
          win9_d = xmm9;
          r9b = r15d === 0; // sete %r9b
          // @0xda25bf testl %ebx,%ebx ; jle 0xda2616
          if (ebx > 0) {
            xmm7 = f(xmm7 / cvtsi2ss(ebx)); // avgPerfA
          } else {
            xmm7 = 0; // @0xda2616 xorps %xmm7
          }
          blk = 0x261f;
          continue dispatch;
        }

        case 0x25ec: {
          // reset path (negative count): zero everything.
          xmm2 = 0;
          r9b = true;
          r14d = 0;
          xmm5 = 0;
          r11d = 0;
          xmm0 = 0;
          r10d = 0;
          xmm4 = 0;
          xmm8 = 0;
          xmm6 = 0;
          xmm1 = 0;
          r8d = 0;
          xmm7 = 0;
          blk = 0x261f;
          continue dispatch;
        }

        // ===================== store simple averages =====================
        case 0x261f: {
          // @0xda2628 movss %xmm7,0x1b40 : avgPerfA.
          this.avgPerfA = xmm7;
          // @0xda2630 divss %xmm9(=(f32)r10d),%xmm0
          xmm0 = f(xmm0 / cvtsi2ss(r10d));
          // @0xda2638 testl %r10d ; jle 0xda2640 ; movaps %xmm0,%xmm7
          xmm7 = r10d > 0 ? xmm0 : 0;
          this.avgDelta = xmm7; // @0xda2640 movss %xmm7,0x1b64
          // @0xda2648 testl %r11d ; jle 0xda265c
          xmm3 = 0;
          if (r11d > 0) {
            xmm5 = f(xmm5 / cvtsi2ss(r11d));
            xmm3 = xmm5;
          }
          this.avgFrameNum2 = xmm3; // @0xda265c movss %xmm3,0x1b58
          // @0xda2664 testb %cl,%cl ; je 0xda27dd
          blk = commit ? 0x266c : 0x27dd;
          continue dispatch;
        }

        // ===================== commit tail =====================
        case 0x266c: {
          this.avgDelta = 0; // @0xda266c movl $0,0x1b64
          const eaxOld = this.failedPreroll | 0; // @0xda2678 xchgl
          this.failedPreroll = 0;
          xmm0 = f(this.stallScore); // @0xda267e movss 0x1b6c,%xmm0
          // @0xda2686 testl %eax,%eax ; je 0xda26b7
          if (eaxOld !== 0) {
            // @0xda268a movss C_2,%xmm3 ; ucomiss %xmm0,%xmm3 ; jbe 0xda26a4
            if (!(C_2 <= xmm0)) {
              this.stallScore = C_2; // @0xda2697 movl $0x40000000,0x1b6c
              xmm0 = C_2;
            }
            // @0xda26a4 cmpl $0x3b,0x1b68 ; jg 0xda26b7 ; else movl $0x3c
            if (!((this.stallCounter | 0) > 0x3b)) {
              this.stallCounter = 0x3c;
            }
          }
          // @0xda26b7 xorps %xmm3 ; ucomiss %xmm0,%xmm3 ; ja 0xda26cc (0 > stallScore)
          if (0 > xmm0) {
            this.stallScore = 0; // @0xda26cc clamp low
          } else {
            // @0xda26bf movss C_4,%xmm3 ; ucomiss %xmm3,%xmm0 ; jbe 0xda26d4 (stallScore<=4 skip)
            if (!(xmm0 <= C_4)) {
              this.stallScore = C_4; // clamp high
            }
          }
          // @0xda26d4 testl %r8d ; je 0xda282b
          if (r8d === 0) {
            this.healthScore = C_1; // @0xda282b movl $0x3f800000,0x1b4c
            return; // jmp 0xda2a35
          }
          // @0xda26dd jle 0xda2866 (r8 < 0)
          if (r8d < 0) {
            blk = 0x2866;
            continue dispatch;
          }
          // @0xda26e6 cvtsi2ss %r8d ; divss -> meanAll ; movss 0x1b50
          xmm1 = f(xmm1 / cvtsi2ss(r8d));
          this.meanFrameNum = xmm1;
          // @0xda26f7 cmpl $0x5,%r8d ; jb 0xda2894
          if ((r8d >>> 0) < 5) {
            blk = 0x2894;
            continue dispatch;
          }
          // @0xda2704 refine with window@<5 (win2/5).
          {
            const cand = win2_d / C_5d;
            if (!(cand > xmm1)) xmm1 = f(cand); // ucomisd ja keep; else cvtsd2ss
          }
          xmm0 = xmm1; // @0xda2720 movaps %xmm1,%xmm0
          // @0xda2723 cmpl $0xf,%r8d ; jb 0xda2770
          if ((r8d >>> 0) >= 0xf) {
            const cand = win4_d / C_15d; // @0xda2733 divsd C_15d
            xmm0 = xmm1;
            if (!(cand > xmm1)) xmm0 = f(cand);
            // @0xda274b cmpl $0x1e,%r8d ; jb 0xda2770
            if ((r8d >>> 0) >= 0x1e) {
              const cand2 = win9_d / C_30d; // @0xda275b divsd C_30d
              if (!(cand2 > xmm0)) xmm0 = f(cand2);
            }
          }
          blk = 0x2770;
          continue dispatch;
        }

        case 0x2770: {
          // @0xda2770 cmpl $0xf,%r8d ; setb %al
          const al = (r8d >>> 0) < 0xf;
          // @0xda277a cvtsi2ss %r14d,%xmm3 ; ucomiss %xmm0,%xmm3 ; setbe %cl ; jbe 0xda278a
          xmm3 = cvtsi2ss(r14d);
          const clBit = xmm3 <= xmm0;
          if (!clBit) {
            xmm3 = xmm1; // @0xda2787 movaps %xmm1,%xmm3
          }
          // @0xda278a orb %al,%cl ; jne 0xda2950
          if (al || clBit) {
            blk = 0x2950;
            continue dispatch;
          }
          // @0xda2792 refine xmm1 with window@<15 (win4/15).
          {
            const cand = win4_d / C_15d; // @0xda2799 divsd C_15d
            if (!(cand > xmm1)) xmm1 = f(cand);
          }
          // @0xda27ae cmpl $0x1e,%r8d ; jb 0xda28a5
          if ((r8d >>> 0) >= 0x1e) {
            const cand = win9_d / C_30d; // @0xda27bf divsd C_30d
            if (!(cand > xmm1)) xmm1 = f(cand);
          }
          // @0xda27d8 jmp 0xda28a5 (scoreInput = xmm1)
          xmm3 = xmm1;
          blk = 0x2950;
          continue dispatch;
        }

        case 0x2894: {
          // @0xda2897 cvtsi2ss %r14d,%xmm3 ; ucomiss %xmm1,%xmm3 ; jbe 0xda2950
          xmm3 = cvtsi2ss(r14d);
          if (xmm3 <= xmm1) {
            blk = 0x2950; // xmm3 = (f32)firstFrameNum
            continue dispatch;
          }
          // @0xda28a5 movaps %xmm1,%xmm3 ; jmp 0xda2950
          xmm3 = xmm1;
          blk = 0x2950;
          continue dispatch;
        }

        case 0x2866: {
          this.meanFrameNum = 0; // @0xda2866 movl $0,0x1b50
          // @0xda2870 testl %r14d,%r14d ; jle 0xda2948
          if (r14d > 0) {
            this.scoreInput = 0; // @0xda2879 movl $0,0x1b54
            xmm0 = 0;
            // @0xda2886 testb %r9b ; jne 0xda2971 else jmp 0xda29f7
            blk = r9b ? 0x2971 : 0x29f7;
            continue dispatch;
          }
          // @0xda2948 cvtsi2ss %r14d,%xmm3 -> 0xda2950
          xmm3 = cvtsi2ss(r14d);
          blk = 0x2950;
          continue dispatch;
        }

        // ===================== finish score (@0xda2950) =====================
        case 0x2950: {
          // @0xda2950 movss %xmm3,0x1b54 : scoreInput.
          this.scoreInput = xmm3;
          xmm0 = 0; // @0xda2958 xorps %xmm0
          // @0xda295b movss C_10,%xmm1 ; ucomiss %xmm3,%xmm1 ; jb 0xda29bb : (10.0 - xmm3) jb -> 10.0 < xmm3.
          if (C_10 < xmm3) {
            blk = 0x29bb;
            continue dispatch;
          }
          // @0xda2968 testb %r9b ; je 0xda29f7
          if (!r9b) {
            blk = 0x29f7;
            continue dispatch;
          }
          blk = 0x2971;
          continue dispatch;
        }

        case 0x29bb: {
          // @0xda29bb ucomiss C_15f,%xmm3 ; jae 0xda29e6 : (xmm3 - 1.5) jae -> xmm3 >= 1.5.
          if (xmm3 >= C_15f) {
            // @0xda29e6 movss C_1,%xmm0 ; testb %r9b ; jne 0xda2971 else jmp 0xda29f7
            xmm0 = C_1;
            blk = r9b ? 0x2971 : 0x29f7;
            continue dispatch;
          }
          // @0xda29c4 cvtss2sd %xmm3,%xmm0 ; addsd C_negOneHalf_d ; divsd C_85d ; cvtsd2ss
          xmm0 = f((xmm3 + C_negOneHalf_d) / C_85d);
          // @0xda29df testb %r9b ; jne 0xda2971 else jmp 0xda29f7
          blk = r9b ? 0x2971 : 0x29f7;
          continue dispatch;
        }

        case 0x29f7: {
          // @0xda29f7 mulss C_half,%xmm0
          xmm0 = f(xmm0 * C_half);
          // @0xda29ff movl 0x1894,%eax ; movaps %xmm0,%xmm2 ; testl %eax,%eax ; je 0xda2982
          const clampFlag = this.clampScoreFlag | 0;
          xmm2 = xmm0;
          if (clampFlag === 0) {
            blk = 0x2982;
            continue dispatch;
          }
          blk = 0x2a10;
          continue dispatch;
        }

        case 0x2971: {
          // @0xda2971 movl 0x1894,%eax ; movaps %xmm0,%xmm2 ; testl %eax,%eax ; jne 0xda2a10
          const clampFlag = this.clampScoreFlag | 0;
          xmm2 = xmm0;
          if (clampFlag !== 0) {
            blk = 0x2a10;
            continue dispatch;
          }
          blk = 0x2982;
          continue dispatch;
        }

        case 0x2982: {
          // @0xda2982 movss 0x1b4c,%xmm1 ; ucomiss %xmm2,%xmm1 ; jae 0xda2a2d : (score - xmm2) jae -> score >= xmm2.
          const score = f(this.healthScore);
          if (score >= xmm2) {
            this.healthScore = xmm2; // @0xda2a2d movss %xmm2,0x1b4c
            return; // epilogue
          }
          // @0xda2993 testl %eax,%eax ; setne %al ; xorb $1,%sil ; orb %al,%sil ; jne 0xda2a35
          //   %sil = arg1 (bool); condition to SKIP the ema update:
          //   (clampFlag != 0) OR (!arg1). i.e. update only when clampFlag==0 && arg1.
          const clampFlag = this.clampScoreFlag | 0;
          if (clampFlag !== 0 || !arg1) {
            return; // @0xda2a35 no update
          }
          // @0xda29a5 addss %xmm1,%xmm0 ; mulss C_half,%xmm0 ; movss %xmm0,0x1b4c
          //   healthScore = (xmm0 + score) * 0.5.  (xmm0 is the new candidate.)
          this.healthScore = f(f(xmm0 + score) * C_half);
          return;
        }

        case 0x2a10: {
          // @0xda2a10 movss C_075,%xmm2 ; minss %xmm0,%xmm2 : xmm2 = min(0.75, xmm0).
          xmm2 = f(Math.min(C_075, xmm0));
          // @0xda2a1c movss 0x1b4c,%xmm1 ; ucomiss %xmm2,%xmm1 ; jb 0xda2993 : (score - xmm2) jb -> score < xmm2.
          const score = f(this.healthScore);
          if (score < xmm2) {
            // @0xda2993 same skip-condition as above.
            const clampFlag = this.clampScoreFlag | 0;
            if (clampFlag !== 0 || !arg1) {
              return;
            }
            this.healthScore = f(f(xmm0 + score) * C_half);
            return;
          }
          // @0xda2a2d movss %xmm2,0x1b4c
          this.healthScore = xmm2;
          return;
        }

        // ===================== not-commit path (@0xda27dd) =====================
        case 0x27dd: {
          // @0xda27dd cmpl $0x3,%edx ; jl 0xda283a
          if (arg2 >= 3) {
            // @0xda27e2 ucomiss C_26,%xmm6 ; jb 0xda283a : (xmm6 - 26.0) jb -> xmm6 < 26.0.
            if (!(xmm6 < C_26)) {
              // @0xda27eb ucomiss %xmm7,%xmm0(0) ; ja 0xda2676 : (0 - avgVal) ja -> 0 > xmm7.
              if (!(0 > xmm7)) {
                // @0xda27f7 cmpl $0,0x1b68 ; jne 0xda2676
                if ((this.stallCounter | 0) === 0) {
                  // @0xda2804 stallScore += -0.5 ; stallCounter = 15.
                  this.stallScore = f(f(this.stallScore) + C_negHalf);
                  this.stallCounter = 0xf;
                }
              }
            }
            blk = 0x2676;
            continue dispatch;
          }
          // @0xda283a cmpl $0x3,%edx ; jle 0xda28ad
          if (arg2 <= 3) {
            blk = 0x28ad;
            continue dispatch;
          }
          // @0xda283f movss C_25,%xmm3 ; ucomiss %xmm6,%xmm3 ; jae 0xda28d5 : (25.0 - xmm6) jae -> 25.0>=xmm6.
          if (C_25 >= xmm6) {
            blk = 0x28d5;
            continue dispatch;
          }
          // @0xda2850 movss C_22,%xmm3 ; ucomiss %xmm6,%xmm3 ; jae 0xda28fd ; else jmp 0xda2676
          if (C_22 >= xmm6) {
            blk = 0x28fd;
            continue dispatch;
          }
          blk = 0x2676;
          continue dispatch;
        }

        case 0x28ad: {
          // arg2 == 3 exactly.
          // @0xda28ad stallCounter = (>=11)?keep:10.
          {
            const e = this.stallCounter | 0;
            this.stallCounter = e >= 0xb ? e : 0xa;
          }
          // @0xda28c4 movss C_25,%xmm3 ; ucomiss %xmm6,%xmm3 ; jb 0xda2850 : (25.0 - xmm6) jb -> 25.0<xmm6.
          if (C_25 < xmm6) {
            // @0xda2850 (22.0 - xmm6) jae -> 22.0>=xmm6 -> 0xda28fd ; else 0xda2676.
            blk = C_22 >= xmm6 ? 0x28fd : 0x2676;
            continue dispatch;
          }
          // @0xda28d5 falls through path below.
          blk = 0x28d5;
          continue dispatch;
        }

        case 0x28d5: {
          // @0xda28d5 stallCounter = (>=11)?keep:10.
          {
            const e = this.stallCounter | 0;
            this.stallCounter = e >= 0xb ? e : 0xa;
          }
          // @0xda28ec movss C_22,%xmm3 ; ucomiss %xmm6,%xmm3 ; jb 0xda2676 : (22.0 - xmm6) jb -> 22.0<xmm6.
          if (C_22 < xmm6) {
            blk = 0x2676;
            continue dispatch;
          }
          blk = 0x28fd;
          continue dispatch;
        }

        case 0x28fd: {
          // @0xda28fd testl %r10d,%r10d ; jle 0xda2676
          if (r10d <= 0) {
            blk = 0x2676;
            continue dispatch;
          }
          // @0xda2909 ucomiss %xmm3(0),%xmm7 ; ja 0xda2676 : (avgVal - 0) ja -> xmm7 > 0.
          if (xmm7 > 0) {
            blk = 0x2676;
            continue dispatch;
          }
          // @0xda2912 subss %xmm0,%xmm3 : xmm3 = 0 - xmm0 = -avgDelta (xmm0 holds avgDelta here).
          xmm3 = f(0 - xmm0);
          // @0xda2916 movss 0x1b6c,%xmm0 : stallScore.
          xmm0 = f(this.stallScore);
          // @0xda291e movss C_025,%xmm5 ; movaps %xmm0,%xmm6 ; addss %xmm5,%xmm6 : xmm6 = stallScore + 0.25.
          xmm6 = f(xmm0 + C_025);
          // @0xda292d maxss %xmm3,%xmm5 : xmm5 = max(0.25, xmm3).
          xmm5 = f(Math.max(C_025, xmm3));
          // @0xda2931 cmpltss %xmm3,%xmm0 : mask = (stallScore < xmm3)? all-ones:0.
          //   @0xda2936 blendvps %xmm0,%xmm5,%xmm6 : xmm6 = mask ? xmm5 : xmm6.
          const sel = xmm0 < xmm3 ? xmm5 : xmm6;
          // @0xda293b movss %xmm6,0x1b6c : stallScore = sel.
          this.stallScore = sel;
          blk = 0x2676;
          continue dispatch;
        }

        // 0xda2676 is the commit-body re-entry; it is identical to case 0x266c.
        case 0x2676: {
          blk = 0x266c;
          continue dispatch;
        }

        default:
          // Unreachable: every jmp/jCC target above is enumerated. A missing
          // state would be a decode gap, so surface it loudly (Rule 3).
          throw new Error(
            "FFPlayerHealthMeter.calcDiskHealth @Flexo 0xda2450: unhandled block 0x" +
              blk.toString(16),
          );
      }
    }
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
}
