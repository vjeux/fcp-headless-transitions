// FFDest_GPU_effectiveDurationForRate.ts — raw transcription of the Flexo FREE
// FUNCTION `FFDest_GPU_effectiveDurationForRate(CMTime const&, double)`.
//
// One free function, one file named after it (PORTING_SPEC: "A free function
// goes in a file named after it (or its translation-unit), not a catch-all").
// It belongs to no class: the mangling `__Z35FFDest_GPU_...` has no nested-name
// prefix, and the body takes the sret pointer in %rdi with no `this`.
//
// Provenance (Flexo framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file:
//   @0xd3f340  FFDest_GPU_effectiveDurationForRate(CMTime const&, double)
//                __Z35FFDest_GPU_effectiveDurationForRateRK6CMTimed
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym
//  __Z35FFDest_GPU_effectiveDurationForRateRK6CMTimed Flexo`):
//   raw-port/re/disasm/Flexo.__Z35FFDest_GPU_effectiveDurationForRateRK6CMTimed.s
//   (45 lines)
//
// ABI: the return type is a 24-byte CMTime, so it comes back through an sret
// pointer in %rdi; %rsi is the `CMTime const&` and %xmm0 is the rate. Every
// return path ends `movq %rdi, %rax`, handing the sret pointer back.
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0xd3f340  movl      0xc(%rsi), %eax        ; eax = duration.flags (+0xc)
//   0xd3f343  notl      %eax                   ; eax = ~flags
//   0xd3f345  testb     $0x11, %al             ; (~flags) & (Valid|Indefinite)
//   0xd3f347  jne       0xd3f362               ; any of the two bits CLEAR in
//                                              ;   flags -> the rate path
//   ; ---- path A: flags has BOTH Valid and Indefinite -----------------------
//   0xd3f349  movq      0xba9fc8(%rip), %rax   ; _kCMTimeZero (GOT)
//   0xd3f350  movq      0x10(%rax), %rcx
//   0xd3f354  movq      %rcx, 0x10(%rdi)       ; sret.epoch  = kCMTimeZero.epoch
//   0xd3f358  movups    (%rax), %xmm0
//   0xd3f35b  movups    %xmm0, (%rdi)          ; sret[0..16) = value+timescale+flags
//   0xd3f35e  movq      %rdi, %rax
//   0xd3f361  retq
//   ; ---- the rate paths ----------------------------------------------------
//   0xd3f362  movapd    0x82d906(%rip), %xmm1  ; = 0xd3f36a + 0x82d906 = 0x156cc70
//                                              ;   two -0.0 = the sign-bit mask
//   0xd3f36a  xorpd     %xmm0, %xmm1           ; xmm1 = -rate
//   0xd3f36e  maxsd     %xmm0, %xmm1           ; xmm1 = MAXSD(dst=-rate, src=rate)
//                                              ;   = |rate|  (fabs, done in SSE)
//   0xd3f372  movsd     0x82d686(%rip), %xmm0  ; = 0xd3f37a + 0x82d686 = 0x156ca00 = 1.0
//   0xd3f37a  ucomisd   %xmm1, %xmm0           ; flags on 1.0 - |rate|
//   0xd3f37e  jae       0xd3f3bf               ; 1.0 >= |rate| -> pass through
//   ; ---- path C: |rate| > 1.0 ----------------------------------------------
//   0xd3f380  pushq     %rbp
//   0xd3f381  movq      %rsp, %rbp
//   0xd3f384  pushq     %rbx
//   0xd3f385  subq      $0x38, %rsp
//   0xd3f389  movq      0x10(%rsi), %rax       ; copy the CMTime to the stack,
//   0xd3f38d  movq      %rax, -0x10(%rbp)      ;   because CMTimeMultiply takes
//   0xd3f391  movups    (%rsi), %xmm0          ;   it BY VALUE
//   0xd3f394  movaps    %xmm0, -0x20(%rbp)
//   0xd3f398  cvttsd2si %xmm1, %esi            ; arg1 = (int32)|rate|, TRUNCATED
//   0xd3f39c  movq      -0x10(%rbp), %rax
//   0xd3f3a0  movq      %rax, 0x10(%rsp)
//   0xd3f3a5  movaps    -0x20(%rbp), %xmm0
//   0xd3f3a9  movups    %xmm0, (%rsp)          ; the by-value CMTime argument
//   0xd3f3ad  movq      %rdi, %rbx             ; keep sret
//   0xd3f3b0  callq     _CMTimeMultiply        ; @stub 0x1495160
//   0xd3f3b5  movq      %rbx, %rax
//   0xd3f3b8  addq      $0x38, %rsp
//   0xd3f3bc  popq      %rbx
//   0xd3f3bd  popq      %rbp
//   0xd3f3be  retq
//   ; ---- path B: |rate| <= 1.0 ---------------------------------------------
//   0xd3f3bf  movq      0x10(%rsi), %rax
//   0xd3f3c3  movq      %rax, 0x10(%rdi)       ; sret.epoch = duration.epoch
//   0xd3f3c7  movups    (%rsi), %xmm0
//   0xd3f3ca  movups    %xmm0, (%rdi)          ; the other 16 bytes
//   0xd3f3cd  movq      %rdi, %rax
//   0xd3f3d0  retq
//   0xd3f3d1  nopw      %cs:(%rax,%rax)        ; padding, not executed
//
// ---------------------------------------------------------------------------
// THE FLAG TEST IS INVERTED — READ IT TWICE
// ---------------------------------------------------------------------------
// `notl %eax` then `testb $0x11, %al` tests the two bits against the
// COMPLEMENT of the flags, so the ZERO result — the fall-through — means
// neither bit is set in `~flags`, i.e. **both `kCMTimeFlags_Valid` (0x01) AND
// `kCMTimeFlags_Indefinite` (0x10) are SET in flags**. That is path A, the one
// that returns `kCMTimeZero`. Every other combination, including a plain valid
// finite time, takes the `jne` to the rate paths. Testing `flags & Valid`
// instead — the natural misreading — inverts the busiest branch in the
// function; the oracle's control for exactly that catches 420 of 660 cases.
//
// ---------------------------------------------------------------------------
// FABS IS DONE IN SSE, AND SO IS THE TRUNCATION
// ---------------------------------------------------------------------------
// `xorpd` with the sign mask at 0x156cc70 (two -0.0) followed by
// `maxsd %xmm0, %xmm1` is the compiler's branch-free `fabs`: max(-x, x). It is
// transcribed as those two steps rather than as `Math.abs`, because MAXSD is
// not `Math.max` — it returns its SRC operand whenever the compare is false,
// so for a NaN rate the result is the rate itself, and for -0.0 the result is
// -0.0 (dst = +0.0 is not > src = -0.0). `Math.abs(-0.0)` would give +0.0.
//
// The multiplier is `cvttsd2si %xmm1, %esi`: TRUNCATE toward zero into a
// 32-bit register. On NaN, on an infinity, or on any magnitude that does not
// fit in int32, x86 produces the "integer indefinite" **INT_MIN
// (0x80000000)** — it does not saturate. This is not a detail invented from
// the manual: the first run of the oracle modelled it as a plain truncation
// and diverged on every rate of 1e18, where the live function multiplies the
// duration by -2147483648.
//
// ---------------------------------------------------------------------------
// THE THRESHOLD COMPARISON, AND WHAT `jae` MEANS HERE
// ---------------------------------------------------------------------------
// `ucomisd %xmm1, %xmm0` has dst = xmm0 = 1.0 and src = xmm1 = |rate|, so the
// flags describe `1.0 - |rate|`; `jae` is CF=0, i.e. taken iff `1.0 >= |rate|`
// ORDERED. A NaN rate sets CF=1, so it is NOT taken and NaN goes to the
// CMTimeMultiply path (with the INT_MIN multiplier above). Writing the test as
// `|rate| <= 1.0` in TS reproduces this exactly, since that is false for NaN.
//
// ---------------------------------------------------------------------------
// CALLEES
// ---------------------------------------------------------------------------
//   `_CMTimeMultiply(CMTime, int32)` @stub 0x1495160 — CoreMedia public ABI, a
//   true out-of-scope extern. It is NOT modelled in this file: CoreMedia's
//   CMTime functions live in the landed `raw-port/src/infra/CMTime.ts` (which
//   already implements CMTimeMake/Add/Subtract/Compare/GetSeconds/
//   MultiplyByFloat64 from the documented public contract), and adding
//   `CMTimeMultiply` there is its own unit — putting it in a file named after
//   an unrelated free function would break the one-thing-per-file rule this
//   project rejects grab-bags for. Path C therefore raises a boundary throw
//   citing the address.
//   `_kCMTimeZero` — CoreMedia's exported constant, read through the GOT at
//   @0xd3f349. The landed CMTime.ts already models it, and this file imports
//   it rather than restating it.
// `depgraph.py deps __Z35FFDest_GPU_effectiveDurationForRateRK6CMTimed` reports
// no in-scope callees.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/FFDest_GPU_effectiveDurationForRate_oracle.py, under
// `arch -x86_64 /usr/bin/python3`. ALL THREE exits are exercised, which
// matters because one of them is the CoreMedia call this port defers: the
// harness computes CoreMedia's OWN `CMTimeMultiply(duration, (int32)|rate|)`
// through ctypes and asserts the live Flexo function returns exactly that — so
// **the fabs, the truncation and the 1.0 threshold are all pinned even though
// the port throws at the multiply**. Results are compared over the CMTime's
// RAW 24 BYTES, so a wrong flag bit or a stale epoch cannot hide behind a
// value-equal check. Results (2026-08-11):
//   * dlsym cross-check PASS; byte self-check PASS on
//     `8b 46 0c f7 d0 a8 11 75 19` — the `notl`+`testb` pair is right there.
//   * both rip-relative constants recomputed from their own encodings:
//     0x156cc70 = -0.0 (the sign mask) and 0x156ca00 = 1.0.
//   * 660 cases, 0 divergences. Path coverage: A x90, B x133, C x437 — no path
//     is unexercised, and none dominates.
//   * negative controls, all live: threshold as `>` instead of `>=` 14/660;
//     rounding the multiplier instead of truncating 70/660; forgetting the
//     fabs 119/660; testing Valid only instead of Valid AND Indefinite
//     420/660; path B returning kCMTimeZero 133/660.

import {
  kCMTimeFlags_Indefinite,
  kCMTimeFlags_Valid,
  kCMTimeZero,
  type CMTime,
} from "../infra/CMTime";

/**
 * `MAXSD dst, src` — SSE2 scalar-double max, which is NOT `Math.max`: the
 * result is `src` whenever the compare is false, i.e. for any NaN operand and
 * for +0.0 vs -0.0.
 *
 * @Flexo 0xd3f36e
 */
function sseMaxSd(dst: number, src: number): number {
  return dst > src ? dst : src;
}

/**
 * The sign-bit mask `xorpd` uses at @0xd3f362 to negate the rate: the 16-byte
 * constant at __TEXT,__const VA 0x156cc70, which is two -0.0 doubles
 * (`00 00 00 00 00 00 00 80` twice).
 *
 * @Flexo 0x156cc70
 */
export const FFDEST_GPU_SIGN_MASK = -0.0; // @Flexo 0x156cc70

/**
 * The rate threshold at __TEXT,__const VA 0x156ca00: **1.0**. At or below this
 * magnitude the duration passes through unchanged.
 *
 * @Flexo 0x156ca00
 */
const FFDEST_GPU_RATE_THRESHOLD = 1.0; // @Flexo 0x156ca00

/**
 * `FFDest_GPU_effectiveDurationForRate(CMTime const& duration, double rate)`
 * — @Flexo 0xd3f340 (__Z35FFDest_GPU_effectiveDurationForRateRK6CMTimed).
 *
 * Three exits, in the order the machine tests them:
 *   A. `duration.flags` has BOTH Valid and Indefinite -> `kCMTimeZero`
 *      (@0xd3f349; note the test is against the COMPLEMENT of the flags).
 *   B. `|rate| <= 1.0` -> the duration, copied unchanged (@0xd3f3bf).
 *   C. otherwise -> `CMTimeMultiply(duration, (int32)|rate|)` (@0xd3f3b0),
 *      a CoreMedia call this port does not model — see the file header.
 *
 * @returns the effective duration.
 */
export function FFDest_GPU_effectiveDurationForRate(
  duration: CMTime,
  rate: number,
): CMTime {
  // @0xd3f340..@0xd3f347 — movl 0xc(%rsi),%eax ; notl %eax ; testb $0x11,%al ;
  // jne. The fall-through (ZF=1) needs BOTH bits CLEAR in `~flags`, i.e. both
  // SET in flags.
  const notFlags = ~duration.flags;
  if ((notFlags & (kCMTimeFlags_Valid | kCMTimeFlags_Indefinite)) === 0) {
    // @0xd3f349..@0xd3f35b — copy kCMTimeZero into the sret slot.
    return {
      value: kCMTimeZero.value,
      timescale: kCMTimeZero.timescale,
      flags: kCMTimeZero.flags,
      epoch: kCMTimeZero.epoch,
    };
  }

  // @0xd3f362/@0xd3f36a — movapd FFDEST_GPU_SIGN_MASK ; xorpd %xmm0, %xmm1.
  // XOR-ing a double with the sign-bit mask (-0.0) flips exactly its sign bit,
  // which is negation for every input including NaN and both zeros — so `-rate`
  // is the transcription, not a paraphrase of one.
  const negated = -rate;
  // @0xd3f36e — maxsd %xmm0, %xmm1 : max(-rate, rate), the branch-free fabs.
  // Written as MAXSD, not Math.abs: for -0.0 this yields -0.0, and for NaN it
  // yields the rate itself.
  const magnitude = sseMaxSd(negated, rate);

  // @0xd3f372..@0xd3f37e — movsd 1.0 ; ucomisd %xmm1, %xmm0 ; jae 0xd3f3bf.
  // dst is 1.0 and src is |rate|, so `jae` is taken iff 1.0 >= |rate| ordered;
  // a NaN magnitude is unordered and falls through to the multiply.
  if (magnitude <= FFDEST_GPU_RATE_THRESHOLD) {
    // @0xd3f3bf..@0xd3f3cd — copy the incoming duration into the sret slot.
    return {
      value: duration.value,
      timescale: duration.timescale,
      flags: duration.flags,
      epoch: duration.epoch,
    };
  }

  // @0xd3f3b0 _CMTimeMultiply — CoreMedia boundary, out of scope here.
  throw new Error(
    "FFDest_GPU_effectiveDurationForRate(duration, rate) requires " +
      "_CMTimeMultiply(duration, (int32)|rate|) @Flexo 0xd3f3b0 (CoreMedia " +
      "stub @0x1495160) — CoreMedia's CMTime functions are modelled in " +
      "raw-port/src/infra/CMTime.ts from the documented public contract, and " +
      "CMTimeMultiply is not among them yet; adding it belongs to that file " +
      "as its own unit, not to a file named after this free function. The " +
      "multiplier is cvttsd2si %xmm1, %esi @0xd3f398: |rate| TRUNCATED toward " +
      "zero into int32, yielding INT_MIN (0x80000000) for NaN, for an " +
      "infinity, or for any magnitude that does not fit — x86 does not " +
      "saturate. The duration is passed BY VALUE (copied to the stack at " +
      "@0xd3f389..@0xd3f3a9). Verified live: the real function's result equals " +
      "CoreMedia's own CMTimeMultiply(duration, (int32)|rate|) over 437 cases. " +
      "@0xd3f340",
  );
}
