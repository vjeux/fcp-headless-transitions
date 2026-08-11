// OZSceneSettings — the scene's global-settings bag (canvas format, frame rate,
// 360°-project flag, glyph OSC mode, bit depth, ...). Owned by OZScene and read
// throughout the render pipeline. This file is the FIRST decoded field/method
// for the real OZSceneSettings class (offsets recovered from Ozone disasm; the
// existing `OZSceneSettings` name in OZScene.ts and OZSimulationState.ts is a
// module-local shim/brand stub — those will be reconciled as their peers land).
//
// Framework: Ozone
// Binary:   /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs).
// Disasm:   raw-port/re/disasm/__ZNK15OZSceneSettings12is360ProjectEv.s
//           raw-port/re/disasm/__ZNK15OZSceneSettings16getFrameDurationEv.s
//
// -----------------------------------------------------------------------------
// FIELD LAYOUT (fields discovered from method reads; other slots are
// undecoded and NOT modelled here — future ports will add them)
// -----------------------------------------------------------------------------
//   +0x20   double frameRate            ; @0x33a2be read (`movsd 0x20(%rsi),%xmm1`)
//                                         and @0x33a104 write in setFrameRate
//                                         (`movsd %xmm0, 0x20(%rdi)`).
//   +0x28   uint8  frameRateIsNTSC      ; @0x33a2e4 read (`movzbl 0x28(%rsi),%eax`)
//                                         and @0x33a11d write in setFrameRate
//                                         (`movb %sil, 0x28(%rdi)`). The setter's
//                                         signature `setFrameRate(double, bool)`
//                                         passes the bool in %sil, confirming this
//                                         byte is the "NTSC / drop-frame" flag.
//   +0x10c  int32  is360ProjectFlagAt10c  ; @0x33a554 read (32-bit `cmpl` load)
//
// The `cmpl $0x0, 0x10c(%rdi)` at @0x33a554 reads a 32-bit slot and compares
// to zero. `setne %al` returns 1 iff the loaded value is non-zero. The width
// is 32 bits (`cmpl`), so we model the field as an `int32` (using JS `number`;
// only bit-width matters at truncation points — none here, since we only test
// != 0).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZNK15OZSceneSettings12is360ProjectEv
//       — OZSceneSettings::is360Project() const @Ozone 0x33a550
//         (raw-port/re/disasm/__ZNK15OZSceneSettings12is360ProjectEv.s — 7 lines)
//   * __ZNK15OZSceneSettings16getFrameDurationEv
//       — OZSceneSettings::getFrameDuration() const @Ozone 0x33a2b0
//         (raw-port/re/disasm/__ZNK15OZSceneSettings16getFrameDurationEv.s — 60 lines)
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   __ZNK15OZSceneSettings12is360ProjectEv:
//     0x33a550  pushq  %rbp                        ; frame prologue
//     0x33a551  movq   %rsp, %rbp
//     0x33a554  cmpl   $0x0, 0x10c(%rdi)           ; flag - 0  (32-bit read at +0x10c)
//     0x33a55b  setne  %al                         ; %al = (flag != 0) ? 1 : 0
//                                                    ; (setne = "set if ZF==0"; ZF cleared
//                                                    ;  when flag != 0 in the sub above)
//     0x33a55e  popq   %rbp                        ; frame epilogue
//     0x33a55f  retq                               ; return zero-extended %al

import { CMTime, CMTimeMake } from "../infra/CMTime";

/**
 * `OZSceneSettings` — the scene-wide settings bag. ONLY the fields touched by
 * ported methods are decoded at this layer; the rest of the object is OPAQUE.
 * Peers (setFrameRate, setBGColor, ...) will each land their own offsets as
 * they're ported and extend this class. Per the porting spec, we DON'T
 * fabricate unread fields.
 */
export class OZSceneSettings {
  /**
   * @Ozone offset +0x20 — a 64-bit IEEE-754 double holding the scene's
   * frame rate in frames per second. Read by `getFrameDuration() const`
   * @0x33a2be via `movsd 0x20(%rsi), %xmm1` (the const method receives
   * `this` in %rsi because the hidden CMTime-return pointer occupies
   * %rdi). Written by `setFrameRate(double, bool)` @0x33a104 via
   * `movsd %xmm0, 0x20(%rdi)`. Common values seen in the disasm branches:
   * 24, 30, 60 (integer fps), plus 25/50/23.976/29.97/59.94 via the
   * generic `600 / fps` codepath.
   */
  frameRate: number = 0;

  /**
   * @Ozone offset +0x28 — a single byte flag. Read as
   * `movzbl 0x28(%rsi), %eax` @0x33a2e4 in `getFrameDuration`, tested
   * as `testb %al, %dil` against the (fps==24/30/60)-sete result. When
   * TRUE the getter returns the NTSC-fractional durations
   *   (24 fps + flag) -> 5005 / 120000  (=23.976...)
   *   (30 fps + flag) -> 4004 / 120000  (=29.97...)
   *   (60 fps + flag) -> 2002 / 120000  (=59.94...)
   * When FALSE the getter takes the generic `600 % fps` divisor branch.
   * Written by `setFrameRate(double, bool)` @0x33a11d via
   * `movb %sil, 0x28(%rdi)` (bool arg in %sil). We name it accordingly.
   * Modelled as `boolean` since the ONLY use is a `testb`/`sete` gate.
   */
  frameRateIsNTSC: boolean = false;

  /**
   * @Ozone offset +0x10c — a 32-bit flag read by `is360Project() const`
   * @0x33a554 via `cmpl $0x0, 0x10c(%rdi)`. The 4-byte load width tells us
   * this slot holds a 32-bit integer (possibly a `bool32`/`BOOL` or an
   * enum-like project-type discriminator). Modelled as `number` since JS
   * numbers cover all int32 values; no arithmetic is performed on this
   * field in is360Project so no width-truncation is required here.
   *
   * The name reflects what is360Project reads: a non-zero value means the
   * scene is a 360° project. The setter for this flag lives elsewhere in
   * Ozone (not yet ported); when it lands the field's precise semantics
   * (bool32 vs enum) will be pinned.
   */
  is360ProjectFlagAt10c: number = 0;

  /**
   * `OZSceneSettings::is360Project() const`
   *   — @Ozone 0x33a550
   *   — __ZNK15OZSceneSettings12is360ProjectEv
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *   0x33a550  pushq  %rbp
   *   0x33a551  movq   %rsp, %rbp
   *   0x33a554  cmpl   $0x0, 0x10c(%rdi)   ; flags = (flag - 0), 32-bit
   *   0x33a55b  setne  %al                 ; %al = (flag != 0) ? 1 : 0
   *   0x33a55e  popq   %rbp
   *   0x33a55f  retq                       ; C++ `bool` returned in %al (zero-ext)
   *
   * Semantics: returns TRUE iff the 32-bit flag at +0x10c is non-zero. The
   * `cmpl` computes `dst - src` = `flag - 0` in AT&T operand order; `setne`
   * takes ZF==0, i.e. the subtraction was non-zero, i.e. `flag != 0`. The C++
   * return type is `bool` (1 byte), returned via the low byte %al.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure field
   * comparison. The @Ozone offset +0x10c is decoded here; no other field is
   * touched.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK15OZSceneSettings12is360ProjectEv.s (7 lines)
   */
  is360Project(): boolean {
    // @0x33a554  cmpl $0x0, 0x10c(%rdi)
    // @0x33a55b  setne %al
    //   `setne` after `cmpl X, 0` is TRUE iff X != 0. Truncate to int32
    //   the way the `cmpl` load would (32-bit fetch): the value is used
    //   only for a != 0 test, so `| 0` clamps the JS number to int32 and
    //   preserves the exact zero-vs-non-zero distinction the machine sees.
    return (this.is360ProjectFlagAt10c | 0) !== 0;
  }

  /**
   * `OZSceneSettings::get360ProjectMode() const`
   *   — @Ozone 0x33a540
   *   — __ZNK15OZSceneSettings17get360ProjectModeEv
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *   0x33a540  pushq  %rbp
   *   0x33a541  movq   %rsp, %rbp
   *   0x33a544  movl   0x10c(%rdi), %eax   ; eax = (int32) this->+0x10c
   *   0x33a54a  popq   %rbp
   *   0x33a54b  retq                       ; return the raw 32-bit value in %eax
   *   0x33a54c  nopl   (%rax)              ; padding
   *
   * Semantics: return the raw 32-bit slot at +0x10c verbatim. This is the
   * SAME slot `is360Project()` @0x33a550 tests for non-zero — so the field
   * is a 360°-project MODE discriminator (an int32/enum), and `is360Project`
   * is just the `!= 0` predicate over it. `get360ProjectMode` exposes the
   * full value (a plain 32-bit load, no comparison), confirming the slot is
   * an enum-like project-mode code rather than a bare bool.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure field load.
   * The `movl` is a 32-bit fetch; `| 0` reproduces the int32 read width.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK15OZSceneSettings17get360ProjectModeEv.s (7 lines)
   */
  get360ProjectMode(): number {
    // @0x33a544  movl 0x10c(%rdi),%eax
    //   32-bit load of the +0x10c project-mode slot, returned verbatim.
    return this.is360ProjectFlagAt10c | 0;
  }

  /**
   * `OZSceneSettings::getFrameDuration() const`
   *   — @Ozone 0x33a2b0
   *   — __ZNK15OZSceneSettings16getFrameDurationEv
   *
   * Returns the scene's per-frame duration as a `CMTime` (rational time).
   * The disassembly's structure is: (a) round the stored frame-rate double
   * to the nearest integer FPS via a `+0.5 +1e-7 ; floor` double-round;
   * (b) select a hard-coded (value, timescale) pair based on the integer
   * FPS and the NTSC-flag; (c) call `CMTimeMake(value, timescale)`.
   *
   * The (a) step's constants are @0x706ea8 = 0.5 and @0x706ed0 = 1e-07,
   * verified with `xcrun llvm-objdump -d` on Ozone.x86_64 (bytes
   *   000000000000e03f -> 0.5 and 48afbc9af2d77a3e -> 1e-07). The idiom
   *   `x = floor(x + 0.5 + 1e-7)`
   * rounds half-up while tolerating a 1e-7 downward float error (e.g.
   * turning 23.976023976... nudged to 24.499999... back into 24). The
   * intermediate `cvttpd2dq ; cvtdq2pd` truncates to int32-in-double and
   * back — invisible for any FPS in [0, 2^31), which is every value the
   * caller can plausibly store.
   *
   * The (b) step's TABLE (transcribed from the disasm):
   *
   *   fps==30 && ntsc :  value=0xfa4=4004,  timescale=0x1d4c0=120000
   *                     (@0x33a304+@0x33a309)   -> 29.9700...
   *   fps==24 && ntsc :  value=0x138d=5005, timescale=0x1d4c0=120000
   *                     (@0x33a31a leaves edx unchanged) -> 23.976...
   *   fps==60 && ntsc :  value=0x7d2=2002,  timescale=0x1d4c0=120000
   *                     (@0x33a32b) -> 59.9400...
   *   fps==0          :  value=0x100=256,  timescale=0x1e00=7680
   *                     (@0x33a335 esi=256; @0x33a352 edx=7680)
   *                     -> 256/7680 = 1/30 s (the "unset frame rate"
   *                     default; a caller who never set frameRate lands
   *                     here).
   *   600 % fps == 0  :  value = (600/fps)<<8,  timescale = 600*256 = 153600
   *                     (@0x33a359 movslq %eax,%rsi ; shlq $8,%rsi ;
   *                      @0x33a360 movl $0x25800,%edx)
   *                     -> a fps-exact fraction (fps=24 -> 25*256/153600,
   *                     fps=25 -> 24*256/153600, fps=30 -> 20*256/153600,
   *                     fps=50 -> 12*256/153600, fps=60 -> 10*256/153600).
   *   else             :  value=0x100=256, timescale = fps<<8
   *                     (@0x33a33e-@0x33a350: esi already 256 from
   *                      @0x33a335; ecx <<= 8 then edx = ecx)
   *                     -> 256 / (fps*256) = 1/fps (the generic fallback
   *                     for FPS values that don't divide 600).
   *
   * The `<<8` factor (0x100 numerator, `600*256` timescale, `(600/fps)<<8`
   * numerator, `fps<<8` timescale) is a scaling choice made by the framework
   * — it multiplies both sides by 256 so the resulting CMTime interoperates
   * cleanly with downstream code that may sub-divide the frame into 256
   * ticks. We preserve those constants exactly.
   *
   * Note the "NTSC" branches (@0x33a30e/@0x33a31f/@0x33a330) ALL use
   * `testb %al, %dil` where `%al` = the NTSC flag byte (from `movzbl
   * 0x28(%rsi), %eax` @0x33a2e4) and `%dil` = the corresponding sete
   * result. `testb A,B` computes `A & B`; `jne` fires iff the AND is
   * non-zero, i.e. both flag AND fps-matches. We match with a JS `&&`.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK15OZSceneSettings16getFrameDurationEv.s (60 lines)
   *
   * Zero in-scope callees except `CMTimeMake` (already ported at
   * raw-port/src/infra/CMTime.ts). `CMTimeMake` itself is the CoreMedia
   * public API surfaced as a value-return helper in our infra layer —
   * the disasm's `callq 0x6dcac8 ## symbol stub for: _CMTimeMake`
   * @0x33a368 resolves to the same public symbol our helper wraps.
   */
  getFrameDuration(): CMTime {
    // @0x33a2be movsd 0x20(%rsi), %xmm1 — load the stored frame rate.
    // Wrap in the same double-round idiom the disasm uses. The constants
    // are 0.5 (@0x706ea8) and 1e-07 (@0x706ed0).
    // @0x33a2c3 addsd %xmm0, %xmm1   (xmm0 = 0.5)
    // @0x33a2cf addsd %xmm2, %xmm1   (xmm2 = 1e-7)
    // @0x33a2d3 roundsd $0x9, %xmm1, %xmm1  (mode 9 = round-down/floor + suppress)
    let t = Math.floor(this.frameRate + 0.5 + 1e-7);
    // @0x33a2d9 cvttpd2dq %xmm1, %xmm1  ; truncate double -> int32-vector
    // @0x33a2dd cvtdq2pd  %xmm1, %xmm1  ; convert back to double
    //   The net effect for any finite in-range positive fps is a no-op
    //   (`floor` already produced an integer double). We keep the
    //   truncation-to-int32 step explicit to match the machine's
    //   width-clamp; JS's `x | 0` performs the same int32 truncation and
    //   the following `+ 0.5 + 1e-7 ; floor` re-normalizes.
    t = t | 0; // int32 truncate
    // @0x33a2e8 addsd %xmm0, %xmm1
    // @0x33a2ec addsd %xmm2, %xmm1
    // @0x33a2f3 roundsd $0x9, %xmm1, %xmm0
    // @0x33a2f9 cvttsd2si %xmm0, %ecx   ; result -> ecx = integer fps.
    const fpsInt = Math.floor(t + 0.5 + 1e-7) | 0;

    // @0x33a2e4 movzbl 0x28(%rsi), %eax — load the NTSC/drop-frame flag.
    const ntsc = this.frameRateIsNTSC;

    // Table-driven (value, timescale) selection. See the docstring above
    // for the full derivation; each JS branch cites its disasm addr.
    let value: number;
    let timescale: number;

    // @0x33a2fd cmpl $0x1e, %ecx ; @0x33a300 sete %dil
    // @0x33a304 movl $0xfa4, %esi ; @0x33a309 movl $0x1d4c0, %edx
    // @0x33a30e testb %al, %dil  ; @0x33a311 jne 0x33a365
    if (fpsInt === 30 && ntsc) {
      value = 0xfa4; // 4004 @0x33a304
      timescale = 0x1d4c0; // 120000 @0x33a309
    }
    // @0x33a313 cmpl $0x18, %ecx ; @0x33a316 sete %dil
    // @0x33a31a movl $0x138d, %esi  (edx still 0x1d4c0)
    // @0x33a31f testb %al, %dil ; @0x33a322 jne 0x33a365
    else if (fpsInt === 24 && ntsc) {
      value = 0x138d; // 5005 @0x33a31a
      timescale = 0x1d4c0; // 120000 (unchanged from the fps==30 branch)
    }
    // @0x33a324 cmpl $0x3c, %ecx ; @0x33a327 sete %dil
    // @0x33a32b movl $0x7d2, %esi
    // @0x33a330 testb %al, %dil ; @0x33a333 jne 0x33a365
    else if (fpsInt === 60 && ntsc) {
      value = 0x7d2; // 2002 @0x33a32b
      timescale = 0x1d4c0; // 120000
    }
    // @0x33a335 movl $0x100, %esi   ; reset value=256 for the generic path
    // @0x33a33a testl %ecx, %ecx ; @0x33a33c je 0x33a352
    else if (fpsInt === 0) {
      // @0x33a352 movl $0x1e00, %edx
      value = 0x100; // 256 @0x33a335
      timescale = 0x1e00; // 7680 @0x33a352
    }
    // @0x33a33e movl $0x258, %eax ; @0x33a343 xorl %edx,%edx ; @0x33a345 idivl %ecx
    else {
      // eax = 600 / fps  (i32 signed div; fps > 0 here)
      // edx = 600 % fps  (remainder)
      // JS: Math.trunc for the quotient to match signed 32-bit idiv on
      // the always-positive fpsInt in this branch (see note above).
      const quot = (600 / fpsInt) | 0; // Math.trunc equivalent for positive fpsInt
      const rem = 600 - quot * fpsInt;
      // @0x33a347 testl %edx, %edx ; @0x33a349 je 0x33a359
      if (rem === 0) {
        // @0x33a359 movslq %eax, %rsi ; shlq $0x8, %rsi
        //   rsi = ((int64_t)quot) << 8 — sign-extend then shift. For any
        //   positive `quot` < 2^23 this equals quot*256 with no overflow;
        //   the CMTime.value slot is i64 (bigint in our CMTime port),
        //   and CMTimeMake accepts `bigint | number` — we pass a plain
        //   `number` because 600/fps*256 is bounded by 600*256 = 153600
        //   which fits comfortably in a JS number.
        value = quot << 8; // (600/fps) * 256
        // @0x33a360 movl $0x25800, %edx  = 600*256 = 153600
        timescale = 0x25800;
      } else {
        // @0x33a34b shll $0x8, %ecx  ; @0x33a34e movl %ecx, %edx
        //   ecx = fps<<8 ; edx = ecx. rsi still 256 from @0x33a335.
        value = 0x100; // 256 (unchanged from @0x33a335)
        timescale = (fpsInt << 8) | 0; // fps * 256, int32 wrap
      }
    }
    // @0x33a365 movq %rbx, %rdi ; @0x33a368 callq _CMTimeMake
    //   The hidden return-buffer pointer (`%rbx` = saved %rdi from entry)
    //   is passed as the CMTime* out-param. We return the CMTime by value.
    return CMTimeMake(value, timescale);
  }
}
