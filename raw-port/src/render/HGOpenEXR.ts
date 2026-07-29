// HGOpenEXR — Helium framework, x86_64 slice @0x187de0..@0x18812a
//
// FCP `HGOpenEXR` — a compound HGNode that computes 6 output parameters from 5 double-precision
// inputs (an OpenEXR-style exposure / white-point / stops search) and forwards them into a child
// HGNode at (this+0x198) via vtable slot +0x60 (a five-slot setParameter dispatch loop followed
// by a tail-call for the 6th slot).
//
// This class contains ONE piece of real math (ProcessOpenEXRInput) and three pure-plumbing
// wrappers (SetParameter tail-jumps into the child; GetOutput / dtors not yet decoded here).
// The math is a numeric ROOT-FINDING SEARCH: a doubling-then-bisection over a scalar `step` such
// that `log(1 + t*step) / step ≈ lo` where `t = exp2(d) - c` and `lo = 1 - c`. That converges to
// the OpenEXR "middle-gray" mapping value that best fits the exposure/black-point pair.
//
// Source symbols (Helium.framework, x86_64, FAT slice at file offset 0x4000):
//   __ZN9HGOpenEXR19ProcessOpenEXRInputEddddd  ::ProcessOpenEXRInput(d,d,d,d,d)  @0x187de0
//   __ZN9HGOpenEXR12SetParameterEiffff         ::SetParameter(i,f,f,f,f)         @0x188130
//   __ZN9HGOpenEXR9GetOutputEP10HGRenderer     ::GetOutput(HGRenderer*)          (not decoded)
//   __ZN9HGOpenEXRC{1,2}Ev                     ::HGOpenEXR()                     (not decoded)
//   __ZN9HGOpenEXRD{0,1,2}Ev                   ::~HGOpenEXR()                    (not decoded)

// -------------------------------------------------------------------------------------------------
// Struct layout (recovered from ProcessOpenEXRInput + SetParameter):
//
//   +0x000  HGNode base (vtable at (this))
//   +0x198  HGNodeLike*  child  — the downstream node that receives the 6 outputs.
//                                 Every dispatch is `child->vtable[+0x60](child, i, v, v, v, v)`.
//                                 SetParameter @0x188130 is just a tail-jmp into that same vtable
//                                 slot (i.e. HGOpenEXR::SetParameter is transparent forwarding).
// -------------------------------------------------------------------------------------------------

interface HGChildNodeLike {
  // vtable +0x60: SetParameter(paramIdx, f0, f1, f2, f3) — matches the callq *0x60(%rax) sites at
  // 0x188049 / 0x188070 / 0x188094 / 0x1880b8 / 0x1880dc / 0x188128 in ProcessOpenEXRInput.
  setParameter(paramIdx: number, f0: number, f1: number, f2: number, f3: number): number;
}

export class HGOpenEXR {
  child: HGChildNodeLike | null = null;   // +0x198  (child node for parameter fan-out)

  /**
   * HGOpenEXR::SetParameter(int idx, float f0, float f1, float f2, float f3)  @0x188130
   *
   * Full disassembly (9 lines) — pure transparent forwarding into the child:
   *   movq  0x198(%rdi), %rdi        ; rdi = this->child
   *   movq  (%rdi), %rax             ; rax = *child (vtable ptr)
   *   movq  0x60(%rax), %rax         ; rax = vtable[+0x60]  (child->setParameter)
   *   jmpq  *%rax                    ; tail-call child->setParameter(idx, f0, f1, f2, f3)
   *
   * No math, no state update on `this`. It literally proxies to the child.
   */
  setParameter(idx: number, f0: number, f1: number, f2: number, f3: number): number {
    if (this.child == null) {
      throw new Error("HGOpenEXR.setParameter @0x188130: child vtable+0x60 not yet wired");
    }
    return this.child.setParameter(idx, f0, f1, f2, f3);
  }

  /**
   * HGOpenEXR::ProcessOpenEXRInput(double a, double b, double c, double d, double e)  @0x187de0
   *
   * Runs a doubling-then-bisection search for the scalar `step` such that
   *
   *    log(1 + t * step) / step   ≈   lo         where  t = exp2(d) - c,  lo = f32(1 - c)
   *
   * Then computes 5 further scalars and dispatches all 6 values (as f32) to `this->child` via
   * `child->setParameter(i, v, v, v, v)` for i=0..5.
   *
   * ------------------------------------------------------------------------------------------------
   * PHASE 1 — Setup (@0x187de0..@0x187e64)
   *
   *   t_f64  = exp2(d) - c                     ; @0x187e0c _exp2, @0x187e16 subsd, stored -0x20
   *   hi_f32 = f32(exp2(d) - c)                ; @0x187e1a cvtsd2ss  (not directly used?)
   *   lo_f64 = 1.0 - c                         ; @0x187e1e movsd 1.0 @VA=0x3ca260, @0x187e26 subsd
   *   lo_f32 = f32(1.0 - c)                    ; @0x187e2a cvtsd2ss, stored -0x28
   *
   *   probe0 = f64(log(1.0 + t_f64))           ; @0x187e47 addsd 1.0 to xmm1=t, @0x187e4b _log
   *   probe0_f32 = f32(probe0)                 ; @0x187e50 cvtsd2ss
   *   step   = 1.0f                            ; @0x187e59 movss 1.0 @VA=0x3c7cc0 → xmm2
   *
   *   ucomiss lo_f32, probe0_f32               ; @0x187e61
   *   jbe  0x187eb4                            ; if lo_f32 <= probe0_f32 (i.e. converged already)
   *                                            ;   → skip search, set result = 0.0f at -0x14
   *
   * PHASE 2 — Doubling loop (@0x187e70..@0x187eb0)
   *   Repeatedly double `step` until log(1 + t*step)/step ≤ lo.
   *
   *     -0x14         = step                                              ; @0x187e70 (save)
   *     step         *= 2.0f                                              ; @0x187e75 addss step,step
   *     -0x40         = step                                              ; @0x187e79
   *     step_f64      = f64(step)                                         ; @0x187e80 cvtss2sd
   *     -0x50         = step_f64
   *     probe         = log(1.0 + t_f64 * step_f64) / step_f64            ; @0x187e89..@0x187ea3
   *     probe_f32     = f32(probe)                                        ; @0x187ea8
   *     ucomiss lo_f32, probe_f32 ; ja LOOP                               ; @0x187eac..0x187eb0
   *
   * PHASE 3 — Bisection (@0x187ebc..@0x187fc2, r14 counter 30 → 0 step -2 = 15 iterations)
   *   Bisect between the previous `step` (in -0x14) and the current doubled `step` (in -0x40).
   *
   *     Iter (executed 15 times):
   *       mid            = (step_prev + step_curr) * 0.5f                 ; @0x187ef4 addss, @0x187ef9 mulss 0.5 @VA=0x3c7cc8
   *       probe_mid      = log(1 + t * mid) / mid                          ; via f64 promotion
   *       if lo_f32 < probe_mid:  step_prev = mid                          ; blendvps @0x187f40
   *       else:                   step_curr = mid                          ; (opposite branch)
   *       ... second half of the iteration does the same pattern with step_curr updated
   *
   *   After 15 iterations, the two bounds have converged. Result at -0x40 is the final `step`.
   *
   * PHASE 4 — Output fan-out (@0x187fc7..@0x188128)
   *
   *     out0 = f32(exp2(a + 1.0))               ; @0x187fcc addsd 1.0 @VA=0x85c4c0 (=11.31... wrong, that's for something else)
   *                                             ;   actually: @0x187fcc addsd 0x6d44f4 → VA=0x85c4c0 = 11.313708...
   *                                             ;   HOLD ON — recheck below.
   *     final_step = f32(prev + last_step) * 0.5f                          ; @0x187fe8..@0x187ff5
   *     out2 = f64(1.0) / e                                                ; @0x188003 movsd 1.0, @0x18800b divsd
   *     out3 = exp2(-3.5 * (1.0/e))                                        ; @0x188015 -3.5 @VA=0x85c4d0, @0x18801d mulsd, @0x188021 _exp2
   *     out5 = f32(1.0 / (final_step * log2(e)))                           ; @0x1880e4 mulsd 1.4426950408889634 (=log2(e)), @0x1880fb 1.0/x
   *
   *   Fan-out:
   *     child.setParameter(0, out0, out0, out0, out0)                     ; @0x188049
   *     child.setParameter(1, f32(b), f32(b), f32(b), f32(b))             ; @0x188070 (uses -0x88 = b)
   *     child.setParameter(2, f32(out2), out2, out2, out2)                ; @0x188094
   *     child.setParameter(3, f32(out3), out3, out3, out3)                ; @0x1880b8
   *     child.setParameter(4, f32(c), c, c, c)                            ; @0x1880dc (uses -0x58 = c)
   *     tail-jmp: child.setParameter(5, out5, 0, 0, final_step)           ; @0x188128 (xmm0=out5, xmm1..3 mixed)
   *
   * ------------------------------------------------------------------------------------------------
   * BLOCKER — the bisection is a 15-iteration two-half loop with blendvps result selection whose
   * branch-condition sign encoding must be transcribed exactly (cmpltss + blendvps = "if xmm0 <
   * xmm1 select xmm2 else xmm1", per Intel manual). A guessed transcription of this loop would
   * silently corrupt every EXR ingest. Marking this a throwing frontier — the driver + constants
   * are decoded; the loop body needs one more careful pass to trace both blendvps sites.
   */
  processOpenEXRInput(a: number, b: number, c: number, d: number, e: number): void {
    const f = Math.fround;

    // --- PHASE 1 — Setup (fully transcribed) ---
    // @0x187e0c _exp2(d):  xmm0 = 2^d
    const exp2d = Math.pow(2, d);                        // _exp2 is IEEE exp2; JS Math.pow(2, ) is bit-exact for finite d.
    // @0x187e16 xmm0 -= c ;   t_f64 = exp2(d) - c
    const t_f64 = exp2d - c;                             // stored at -0x20 (f64)
    // @0x187e1e xmm1 = 1.0 @VA=0x3ca260 ; @0x187e26 xmm1 -= c
    const lo_f64 = 1.0 - c;                              // f64 pre-cast
    // @0x187e2a cvtsd2ss:  lo_f32 = f32(1 - c)
    const lo_f32 = f(lo_f64);                            // stored at -0x28

    // @0x187e47 xmm0 = 1.0 + t_f64 ; @0x187e4b _log
    const probe0 = Math.log(1.0 + t_f64);                // f64
    const probe0_f32 = f(probe0);                        // @0x187e50 cvtsd2ss

    // @0x187e59 xmm2 = 1.0f (step) @VA=0x3c7cc0
    let step_f32 = f(1.0);

    // @0x187e61 ucomiss lo_f32, probe0_f32 ; jbe 0x187eb4
    //   jbe fires when CF=1 OR ZF=1 → lo_f32 <= probe0_f32 (unsigned comparison for FP is
    //   equivalent to ≤ for non-NaN; if either is NaN, PF=1 and jbe fires too — matches x86).
    if (
      Number.isNaN(lo_f32) || Number.isNaN(probe0_f32) ||
      lo_f32 <= probe0_f32
    ) {
      // @0x187eb4 xorps xmm1,xmm1 ; movss xmm1, -0x14  →  result field is 0.0f
      // Fall directly to PHASE 4 with -0x14 = 0.0f and -0x40 = 1.0f (step remained the initial 1.0
      // because the doubling loop was skipped).
      this._exrPhase4FanOut(a, b, c, e, /*prevStep_neg14=*/ f(0.0), /*currStep_neg40=*/ step_f32);
      return;
    }

    // --- PHASE 2 & 3 — Doubling-then-bisection search (FRONTIER) ---
    //
    // Per PORTING_SPEC rule 3: the two blendvps result-selection sites at @0x187f40 and @0x187fa8
    // (both preceded by cmpltss xmm1,xmm0) drive the branch structure of the bisection. A guessed
    // sign convention would corrupt every EXR ingest silently. Defer to a targeted follow-up port.
    void step_f32; void t_f64; void lo_f32; // avoid unused-locals in the throw path
    throw new Error(
      "HGOpenEXR.processOpenEXRInput @0x187e70..@0x187fc2: doubling+bisection loop body not yet transcribed " +
        "(two blendvps sites @0x187f40 / @0x187fa8 must be traced to preserve branch fidelity)"
    );
  }

  /**
   * PHASE 4 — Output fan-out. Called with the two bisection bounds `prevStep` (stack -0x14) and
   * `currStep` (stack -0x40). Reads the five original inputs (a, b, c, e; `d` is already consumed)
   * plus the two bounds and dispatches all 6 outputs to the child via vtable +0x60.
   *
   * Constants (all read from FAT slice + 0x4000):
   *   1.0                @VA=0x3ca260 (f64) and @VA=0x3c7cc0 (f32)
   *   0.5f               @VA=0x3c7cc8 (f32)                   — bisection midpoint factor
   *   11.313708498984761 @VA=0x85c4c0 (f64) = 2^3.5           — NOT used in fan-out, sits before
   *                                                             the search inputs (padding? const).
   *                        Actually: @0x187fcc addsd 0x6d44f4(%rip) → VA=(0x187fd4+0x6d44f4)=0x85c4c8
   *                        which is 2.47393 (see below).
   *   2.47393            @VA=0x85c4c8 (f64)                    — added to `a` before exp2 (out0)
   *   -3.5               @VA=0x85c4d0 (f64)                    — scaled by (1/e) before exp2 (out3)
   *   1.4426950408889634 @VA=0x85c4d8 (f64) = log2(e)          — multiplied into final_step for out5
   */
  private _exrPhase4FanOut(
    a: number, b: number, c: number, e: number,
    prevStep_neg14: number, currStep_neg40: number
  ): void {
    const f = Math.fround;
    if (this.child == null) {
      throw new Error("HGOpenEXR._exrPhase4FanOut: this.child (+0x198) not wired; cannot dispatch outputs");
    }

    // @0x187fcc: xmm0 = a (from -0x78) + 2.47393 @VA=0x85c4c8;  @0x187fd9 _exp2
    const out0_f64 = Math.pow(2, a + 2.47393);
    const out0 = f(out0_f64);                          // @0x188037 cvtsd2ss just before dispatch

    // @0x187fe3..@0x187ff5: final_step = f32((prev + curr) * 0.5f)  — midpoint of the two bounds
    const final_step = f(f(prevStep_neg14 + currStep_neg40) * f(0.5)); // 0.5f @VA=0x3c7cc8

    // @0x188003..@0x188010: xmm1 = 1.0 / e   (stored at -0x20 as f64)
    const inv_e_f64 = 1.0 / e;
    const out2 = f(inv_e_f64);                          // @0x18807b cvtsd2ss before dispatch

    // @0x188015..@0x188021: xmm0 = exp2(-3.5 * inv_e)
    const out3_f64 = Math.pow(2, -3.5 * inv_e_f64);
    const out3 = f(out3_f64);                           // @0x1880a3 cvtsd2ss before dispatch

    // @0x1880df..@0x1880fb: xmm0 = 1.0 / (final_step * log2(e))
    //   xmm1 = f64(final_step) * 1.4426950408889634
    //   xmm0 = 1.0 / xmm1
    const out5_f64 = 1.0 / (final_step * 1.4426950408889634);
    const out5 = f(out5_f64);                           // @0x188102 cvtsd2ss into xmm1

    // Dispatch chain:
    // @0x188049 : child.setParameter(0, out0, out0, out0, out0)
    this.child.setParameter(0, out0, out0, out0, out0);
    // @0x188070 : child.setParameter(1, f32(b), f32(b), f32(b), f32(b))
    const b_f32 = f(b);
    this.child.setParameter(1, b_f32, b_f32, b_f32, b_f32);
    // @0x188094 : child.setParameter(2, out2, out2, out2, out2)
    this.child.setParameter(2, out2, out2, out2, out2);
    // @0x1880b8 : child.setParameter(3, out3, out3, out3, out3)
    this.child.setParameter(3, out3, out3, out3, out3);
    // @0x1880dc : child.setParameter(4, f32(c), f32(c), f32(c), f32(c))
    const c_f32 = f(c);
    this.child.setParameter(4, c_f32, c_f32, c_f32, c_f32);
    // @0x188128 : tail-jmp child.setParameter(5, out5, 0, 0, final_step)
    //   (xmm2, xmm3 xored @0x18810d/0x188110 — passed as zeros; xmm0=out5, xmm1=final_step-ish
    //   actually xmm0 at @0x188118 = final_step from -0x14 !!! and xmm1 = out5.)
    // Re-reading the tail sequence carefully:
    //   @0x1880ff : cvtsd2ss xmm0 (= 1/x) → xmm1
    //   @0x18810d : xorps xmm2  ; xmm2 = 0
    //   @0x188110 : xorps xmm3  ; xmm3 = 0
    //   @0x188113 : mov  esi, 5
    //   @0x188118 : movss xmm0, -0x14(%rbp)   ← xmm0 = final_step (stored at -0x14 earlier)
    //   ⇒ dispatch  child.setParameter(5, final_step, out5, 0.0f, 0.0f)
    //     because the ABI passes xmm0..xmm3 as f0..f3.
    this.child.setParameter(5, final_step, out5, f(0.0), f(0.0));
  }
}
