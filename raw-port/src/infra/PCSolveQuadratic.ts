// PCSolveQuadratic.ts — raw transcription of ProCore's free function
// `PCSolveQuadratic(double, double, double, int*, double*)`.
//
// A free function, so per PORTING_SPEC.md's naming rule the file is named after
// the function itself (precedent on main: procore_anon_invert_3x3.ts, in this
// same infra layer).
//
// Provenance (ProCore framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Symbol ported in this file — ONE function:
//   @0xc0582  PCSolveQuadratic(double, double, double, int*, double*)
//             __Z16PCSolveQuadraticdddPiPd
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym __Z16PCSolveQuadraticdddPiPd ProCore`):
//   raw-port/re/disasm/ProCore.__Z16PCSolveQuadraticdddPiPd.s   (49 lines)
//
// ---------------------------------------------------------------------------
// ABI
// ---------------------------------------------------------------------------
// SysV: %xmm0 = a, %xmm1 = b, %xmm2 = c (the three coefficients of
// a*x^2 + b*x + c), %rdi = int* outCount, %rsi = double* outRoots. The two
// POINTER arguments take the first two integer registers, which is why the
// count lands in %rdi and the root array in %rsi. Nothing is returned in %eax
// to the C caller — %eax is the count, and it is stored through %rdi
// @0xc0642 on every path.
//
// The function writes AT MOST as many doubles as it reports: 0 on the no-root
// paths, 1 on the linear path, 2 on the quadratic path (both slots are written
// even when the two roots then compare equal and the count comes back 1). The
// oracle checks that with a poisoned array.
//
// ---------------------------------------------------------------------------
// CONSTANTS (read from the live ProCore image; each is one 8- or 16-byte
// literal at the cited address, reachable rip-relative from the instruction)
// ---------------------------------------------------------------------------
//   @0x122670  0x7fffffffffffffff x2  — the absolute-value mask (`andpd`)
//   @0x122880  1e-07                  — EPS, the degeneracy threshold
//   @0xe2070   0x8000000000000000 x2  — the sign mask (`xorpd` / `andpd`)
//   @0x122a88  -4.0                   — the discriminant's -4ac factor
//   @0x1225a8  -0.5                   — the -1/2 in q = -(b + sign(b)*sqrt)/2
//
// ---------------------------------------------------------------------------
// FULL DISASM — PCSolveQuadratic @0xc0582
// ---------------------------------------------------------------------------
//   0xc0582  pushq %rbp ; movq %rsp, %rbp
//   0xc0586  movapd 0x620e2(%rip), %xmm4     ; xmm4 = abs mask @0x122670
//   0xc058e  andpd  %xmm0, %xmm4             ; xmm4 = |a|
//   0xc0592  movsd  0x622e6(%rip), %xmm3     ; xmm3 = EPS @0x122880 = 1e-07
//   0xc059a  ucomisd %xmm4, %xmm3            ; flags on (EPS - |a|)
//   0xc059e  jbe    0xc05c9                  ; EPS <= |a| (or NaN) -> QUADRATIC
//   -- linear path (|a| < EPS) --
//   0xc05a0  movapd 0x620c8(%rip), %xmm0     ; xmm0 = abs mask
//   0xc05a8  andpd  %xmm1, %xmm0             ; xmm0 = |b|
//   0xc05ac  ucomisd %xmm0, %xmm3            ; flags on (EPS - |b|)
//   0xc05b0  ja     0xc05ef                  ; EPS > |b| -> no roots
//   0xc05b2  xorpd  0x21ab6(%rip), %xmm2     ; xmm2 = -c   (sign mask @0xe2070)
//   0xc05ba  divsd  %xmm1, %xmm2             ; xmm2 = -c / b
//   0xc05be  movsd  %xmm2, (%rsi)            ; roots[0] = -c/b
//   0xc05c2  movl   $0x1, %eax               ; count = 1
//   0xc05c7  jmp    0xc0642
//   -- quadratic path --
//   0xc05c9  movapd %xmm1, %xmm5 ; mulsd %xmm1, %xmm5   ; xmm5 = b*b
//   0xc05d1  movsd  0x624af(%rip), %xmm4     ; xmm4 = -4.0 @0x122a88
//   0xc05d9  mulsd  %xmm0, %xmm4             ; xmm4 = -4*a
//   0xc05dd  mulsd  %xmm2, %xmm4             ; xmm4 = (-4*a)*c
//   0xc05e1  addsd  %xmm5, %xmm4             ; disc = (-4*a)*c + b*b
//   0xc05e5  xorpd  %xmm5, %xmm5             ; xmm5 = 0.0
//   0xc05e9  ucomisd %xmm4, %xmm5            ; flags on (0 - disc)
//   0xc05ed  jbe    0xc05f3                  ; 0 <= disc (or NaN) -> roots
//   0xc05ef  xorl   %eax, %eax ; jmp 0xc0642 ; count = 0, roots untouched
//   0xc05f3  sqrtsd %xmm4, %xmm4             ; s = sqrt(disc)
//   0xc05f7  movapd 0x62071(%rip), %xmm5     ; xmm5 = abs mask
//   0xc05ff  andpd  %xmm5, %xmm4             ; s = |s|
//   0xc0603  movapd 0x21a65(%rip), %xmm6     ; xmm6 = sign mask
//   0xc060b  andpd  %xmm1, %xmm6             ; xmm6 = signbit(b)
//   0xc060f  orpd   %xmm4, %xmm6             ; xmm6 = copysign(s, b)
//   0xc0613  addsd  %xmm1, %xmm6             ; xmm6 = b + copysign(s, b)
//   0xc0617  mulsd  0x61f89(%rip), %xmm6     ; q = that * -0.5   (@0x1225a8)
//   0xc061f  unpcklpd %xmm6, %xmm0           ; xmm0 = [a, q]
//   0xc0623  unpcklpd %xmm2, %xmm6           ; xmm6 = [q, c]
//   0xc0627  divpd  %xmm0, %xmm6             ; xmm6 = [q/a, c/q]
//   0xc062b  movupd %xmm6, (%rsi)            ; roots[0] = q/a ; roots[1] = c/q
//   0xc062f  hsubpd %xmm6, %xmm6             ; xmm6[0] = roots[0] - roots[1]
//   0xc0633  andpd  %xmm5, %xmm6             ; |roots[0] - roots[1]|
//   0xc0637  xorl   %eax, %eax
//   0xc0639  ucomisd %xmm6, %xmm3            ; flags on (EPS - |diff|)
//   0xc063d  setbe  %al                      ; al = EPS <= |diff| (or NaN)
//   0xc0640  incl   %eax                     ; count = 1 + that
//   0xc0642  movl   %eax, (%rdi)             ; *outCount = count
//   0xc0644  popq %rbp ; retq
//
// ---------------------------------------------------------------------------
// WHY THE FORMULA LOOKS UNUSUAL — it is the numerically stable one
// ---------------------------------------------------------------------------
// The textbook `(-b +/- sqrt(disc)) / 2a` loses precision to cancellation when
// `b` dominates the square root. This body instead computes the intermediate
//     q = -(b + sign(b) * sqrt(disc)) / 2
// (the `copysign` at @0xc060b/@0xc060f is what makes the two magnitudes ADD
// rather than cancel) and takes the two roots as `q/a` and `c/q` — the
// classic "citardauq" pairing, via Vieta's `r0*r1 = c/a`. Transcribe it as
// written: swapping in the naive formula changes the last ulp on most inputs
// (267 of 600 measured, below) and PORTING_SPEC Rule 1 forbids it anyway.
//
// Three details that are easy to get backwards, all pinned by the oracle:
//   * the ORDER of the discriminant's operations is `((-4.0 * a) * c) + b*b`,
//     not `b*b - 4*a*c`; floating-point multiplication is not associative, so
//     the parenthesisation is part of the answer.
//   * the branch conditions are `jbe`/`ja` on `EPS - x`, i.e. UNORDERED-
//     INCLUSIVE: a NaN coefficient takes the quadratic path @0xc059e, survives
//     the discriminant test @0xc05ed, and reaches the roots as NaN. The port
//     writes them as `!(EPS > x)` so a NaN behaves the same way.
//   * `setbe` at @0xc063d makes the count 2 unless the two roots are within
//     EPS of each other — a WINDOW, not an equality test. 16 of 600 planted
//     twin-root cases distinguish it from `r0 === r1`.
//
// FRONTIER CALLEES: none. `sqrtsd` is a single instruction, not a libm call.
//
// ---------------------------------------------------------------------------
// ORACLE — BIT-EXACT differential against the live ProCore binary: 4,022 cases,
// 0 divergences (raw-port/re/oracle/PCSolveQuadratic_oracle.py). The symbol is
// exported (`T`), so the harness dlsym's it and calls it under
// `arch -x86_64 /usr/bin/python3` — load-bearing for float code, where the
// arm64 slice may contract a multiply-add the x86_64 slice does not and move
// the last ulp (OPS_LOG). Roots are compared as RAW 64-BIT PATTERNS, so signed
// zero and the final ulp count, and the output array is pre-filled with a
// poison NaN so an unwritten slot is visible.
// Coverage: 1,500 planted-root quadratics `a(x-r1)(x-r2)` (including deliberate
// twin roots and roots spanning 1e-300..1e300); the EPS boundary walked on |a|,
// on |b| and on the root separation at scale 0, 0.5, 0.999999, 1, 1.000001, 2,
// 10 in both signs; a full cross-product of degenerate and extreme coefficients
// (+/-0, +/-inf, NaN, 5e-324, DBL_MAX); and 1,500 uniformly random bit patterns.
// All three count values were exercised: 768 x 0 roots, 1,152 x 1, 2,102 x 2.
// 42 comparisons differed only in NaN PAYLOAD bits, which are not part of the
// contract; they are reported by the harness rather than silently skipped.
// NEGATIVE CONTROLS (600 solvable cases): the naive `(-b +/- sqrt)/2a` -> 267
// wrong; swapping the root order -> 410 wrong; dropping the copysign -> 191
// wrong; using `r0 === r1` instead of the EPS window -> 16 wrong.
//
// AND THE SHIPPED TYPESCRIPT ITSELF, end to end: raw-port/re/oracle/
// PCSolveQuadratic_oracle_ts.py drives THIS file through
// PCSolveQuadratic_driver.ts (the checked-in node_modules/.bin/tsx) and
// compares it against the live symbol on 1,196 cases — 700 planted-root
// quadratics, the full 14x14 cross-product of degenerate/extreme coefficients
// and 300 random bit patterns: 0 divergences, counts 194/368/634 across 0/1/2
// roots. That closes the gap the Python-model harness leaves open (a model can
// agree with the binary while the TypeScript disagrees with the model).
// Doubles cross that boundary as hex bit patterns, never JSON numbers, because
// json.dump emits bare NaN/Infinity and JSON.parse rejects it (OPS_LOG) — and
// hex is what makes the comparison bit-exact. 24 comparisons differed only in
// NaN payload bits and are reported, not hidden.

/** EPS — the degeneracy threshold, `movsd 0x622e6(%rip), %xmm3` @0xc0592
 *  reading the literal at @ProCore 0x122880. Used three times: |a| < EPS
 *  demotes the problem to linear, |b| < EPS then means "no root at all", and
 *  |r0 - r1| < EPS collapses the two roots into one. */
const PC_SOLVE_QUADRATIC_EPS = 1e-7; // @ProCore 0x122880

/** -4.0 — the `-4ac` factor, `movsd 0x624af(%rip), %xmm4` @0xc05d1 reading the
 *  literal at @ProCore 0x122a88. */
const PC_DISC_MINUS_FOUR = -4.0; // @ProCore 0x122a88

/** -0.5 — the halving in `q = -(b + sign(b)*sqrt(disc))/2`, `mulsd
 *  0x61f89(%rip), %xmm6` @0xc0617 reading the literal at @ProCore 0x1225a8. */
const PC_MINUS_HALF = -0.5; // @ProCore 0x1225a8

/** Scratch view used to read a double's SIGN BIT the way the machine does.
 *  @0xc060b is `andpd <sign mask @0xe2070>, %xmm6`, i.e. a raw bit operation —
 *  it is true for -0.0 and for a negative NaN, neither of which `b < 0`
 *  catches. Reading bit 63 through a typed-array view models that exactly. */
const PC_SIGN_PROBE_F64 = new Float64Array(1);
const PC_SIGN_PROBE_U8 = new Uint8Array(PC_SIGN_PROBE_F64.buffer);

/**
 * `signbit(x)` — bit 63 of the IEEE-754 double, as `andpd` with the sign mask
 * @ProCore 0xe2070 extracts it @0xc060b. True for negative values, for -0.0
 * and for a negative NaN.
 */
function pcSignBit(x: number): boolean {
  PC_SIGN_PROBE_F64[0] = x;
  // Little-endian: byte 7 holds the sign bit. (Every platform this port targets
  // is little-endian, as is the x86_64 slice it is transcribed from.)
  return (PC_SIGN_PROBE_U8[7]! & 0x80) !== 0;
}

/**
 * The out-parameters of `PCSolveQuadratic`. C hands the function an `int*` and
 * a `double*`; TypeScript has no out-pointers, so the two writes are modelled
 * as one result object. `roots` holds exactly the doubles the machine STORES —
 * length 0, 1 or 2 — while `count` is the value written through `int*`
 * @0xc0642, which is 1 (not 2) when the two stored roots are within EPS.
 */
export interface PCQuadraticSolution {
  /** `*outCount` — stored through %rdi @0xc0642 on every path. */
  count: number;
  /** The doubles stored through %rsi: none @0xc05ef, one @0xc05be, two
   *  @0xc062b. When two are stored but `count` is 1, both are still here —
   *  that is what the machine leaves in the caller's array. */
  roots: number[];
}

/**
 * `PCSolveQuadratic(double a, double b, double c, int* outCount, double* outRoots)`
 *   @ProCore 0xc0582 (__Z16PCSolveQuadraticdddPiPd)
 *
 * Solves `a*x^2 + b*x + c = 0` with the numerically stable citardauq pairing;
 * see the file header for the full disassembly, the constants and the reasons
 * the formula is shaped this way.
 *
 * @param a the quadratic coefficient (%xmm0).
 * @param b the linear coefficient (%xmm1).
 * @param c the constant coefficient (%xmm2).
 * @returns the count the machine writes through `int*` and the doubles it
 *          writes through `double*`.
 */
export function PCSolveQuadratic(
  a: number,
  b: number,
  c: number,
): PCQuadraticSolution {
  // @0xc0586..0xc059e — `andpd` |a| against EPS. `jbe` takes the quadratic
  //   path when EPS <= |a| OR the compare is UNORDERED (a NaN sets CF and ZF),
  //   which `!(EPS > |a|)` reproduces exactly.
  if (!(PC_SOLVE_QUADRATIC_EPS > Math.abs(a))) {
    // ---- quadratic path @0xc05c9 -------------------------------------------
    // @0xc05c9/@0xc05cd — xmm5 = b*b
    // @0xc05d1..0xc05e1 — disc = ((-4.0 * a) * c) + b*b, in THAT order.
    const disc = PC_DISC_MINUS_FOUR * a * c + b * b;
    // @0xc05e5..0xc05ed — `ucomisd` against 0.0; `jbe` continues when
    //   0 <= disc OR unordered, so only a strictly negative disc bails out.
    if (0.0 > disc) {
      return { count: 0, roots: [] }; // @0xc05ef xorl %eax,%eax
    }
    // @0xc05f3 sqrtsd, then @0xc05ff `andpd` with the abs mask.
    const s = Math.abs(Math.sqrt(disc));
    // @0xc0603..0xc060f — copysign(s, b): the sign bit of b OR'd onto |s|.
    //   This is what makes the two magnitudes add instead of cancel.
    // @0xc0613/@0xc0617 — q = (b + copysign(s, b)) * -0.5
    const q = (b + (pcSignBit(b) ? -s : s)) * PC_MINUS_HALF;
    // @0xc061f..0xc062b — one `divpd` computes both lanes: [q/a, c/q].
    const r0 = q / a;
    const r1 = c / q;
    // @0xc062f..0xc0640 — |r0 - r1| against EPS; `setbe` is again unordered-
    //   inclusive, so `!(EPS > d)` reproduces the NaN case too, and `incl`
    //   turns the flag into a count of 1 or 2.
    const d = Math.abs(r0 - r1);
    return {
      count: !(PC_SOLVE_QUADRATIC_EPS > d) ? 2 : 1,
      roots: [r0, r1], // @0xc062b movupd — BOTH slots are written either way
    };
  }
  // ---- linear path @0xc05a0 (|a| < EPS, so a*x^2 is negligible) -------------
  // @0xc05a8/@0xc05ac/@0xc05b0 — |b| against EPS; `ja` bails out when
  //   EPS > |b| (an ORDERED compare: a NaN b falls through, as the machine does).
  if (PC_SOLVE_QUADRATIC_EPS > Math.abs(b)) {
    return { count: 0, roots: [] }; // @0xc05ef
  }
  // @0xc05b2 — `xorpd` with the sign mask negates c (it flips the sign bit, so
  //   +0 becomes -0, which `-c` also does in JS).
  // @0xc05ba/@0xc05be — roots[0] = -c / b ; @0xc05c2 count = 1.
  return { count: 1, roots: [-c / b] };
}
