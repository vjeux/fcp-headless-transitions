// HgcToneParamCurve4AntiSymmetric.ts — FCP Helium framework class.
//
// Raw x86_64 port of ONE ledger unit:
//
//   @Helium 0x350320  HgcToneParamCurve4AntiSymmetric::RenderTile_AVX(HGTile*)
//                     __ZN31HgcToneParamCurve4AntiSymmetric14RenderTile_AVXEP6HGTile
//
// Source binary:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//   (x86_64 slice, unadjusted VAs). Re-derive with:
//     raw-port/tools/disasm.sh --sym \
//       __ZN31HgcToneParamCurve4AntiSymmetric14RenderTile_AVXEP6HGTile Helium
//   -> raw-port/re/disasm/Helium.__ZN31HgcToneParamCurve4AntiSymmetric14RenderTile_AVXEP6HGTile.s
//      (211 lines)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is NOT ported here.
// They are listed only so a later worker can find them (nm -arch x86_64 | c++filt):
//   0x34fef0 GetProgram              0x34ff20 InitProgramDescriptor
//   0x350140 shaderDescription       0x3501a0 BindTexture        0x350210 Bind
//   0x3507a0 RenderTile (SSE sibling / dispatcher)
//   0x350ca0 GetDOD                  0x350cc0 GetROI
//   0x350ce0 C2 ctor                 0x351000 C1 ctor
//   0x351010 / 0x351060 / 0x3510b0   D2 / D1 / D0 dtors
//   0x351100 SetParameter            0x351180 GetParameter       0x3511d0 GetOutput
//   0xa4a848 vtable   0xa4aa88 typeinfo   0x892c46 typeinfo name
//
// ── WHAT IT COMPUTES ────────────────────────────────────────────────────────
// For every float32 RGBA pixel of the tile rectangle, an ODD ("anti-symmetric")
// tone curve with four programmable parameters: a linear arm near zero and a
// power arm above a threshold, with the ORIGINAL SIGN of each channel re-applied
// at the end (`vxorps` with the extracted sign bits @0x350588) — that sign
// restoration is precisely what makes the curve anti-symmetric, f(-x) = -f(x),
// and is what the class name records. Alpha is passed through untouched.
//
// Per RGB lane, with the parameters read lane-wise out of the constant pool at
// `this+0x198` (see POOL LAYOUT below; P[k] denotes the pool cell at byte k):
//
//     a   = |x|                                        ; vandps ABS_MASK  @0x35039e
//     hi  = pow2( P[0x00] * log2( P[0x20]*a + P[0x40] ) ) + P[0xa0]
//     lo  = P[0x60]*a + P[0xc0]
//     y   = (a - P[0x80] < 0) ? lo : hi                 ; vblendvps        @0x350562
//     out = y with the sign bit of x OR-ed back in      ; vxorps           @0x350588
//
// `log2` and `pow2` are NOT calls — they are inlined software kernels built from
// the pool's polynomial coefficients (the classic "exponent field + polynomial in
// the reduced mantissa" log2, and "floor + polynomial + exponent-field synthesis"
// exp2). Both are transcribed instruction-by-instruction below. The body contains
// NO callq at all: no in-scope callee, no extern, no allocation, no indirect or
// virtual dispatch (`depgraph.py deps
// __ZN31HgcToneParamCurve4AntiSymmetric14RenderTile_AVXEP6HGTile` lists nothing).
//
// ── POOL LAYOUT (this+0x198 -> `p`) ─────────────────────────────────────────
// The pool is a `new char[0x447]` block, 32-byte aligned as
// `p = raw + 8 + ((-raw - 8) & 31)` with `*(p-8) = raw`, allocated and filled by
// the C2 ctor @0x350cfe..0x350fc2 (that ctor is a different ledger unit; it is
// quoted here ONLY as the evidence that grounds these offsets and values).
// Each 16-byte constant is written TWICE, into adjacent cells at p+k and p+k+0x10,
// so a 32-byte ymm load at p+k sees the same float4 in both halves. Every value
// below was read out of the Helium __const section at the cited data address.
//
//   p[0x000..0x0e0)  ZERO at ctor  (xorps stores @0x350d1b..0x350d6b) — the
//                    user-programmable parameter zone written by SetParameter
//                    @0x351100. RenderTile_AVX reads SIX of these cells as the
//                    curve parameters:
//                      p[0x00] exponent      (vmovups (%r14),%ymm4      @0x3503b3)
//                      p[0x20] log-arm scale (vmulps 0x20(%r14)         @0x3503a7)
//                      p[0x40] log-arm bias  (vaddps 0x40(%r14)         @0x3503ad)
//                      p[0x60] linear slope  (vmulps 0x60(%r14)         @0x350545)
//                      p[0x80] threshold     (vsubps 0x80(%r14)         @0x35054b)
//                      p[0xa0] power offset  (vaddps 0xa0(%r14)         @0x35053c)
//                      p[0xc0] linear offset (vaddps 0xc0(%r14)         @0x350554)
//   p[0x0e0] = ABS_MASK      (0x7fffffff,0x7fffffff,0x7fffffff,0x00000000)
//                            data @0x3d5960, stores @0x350d7a/@0x350d82
//   p[0x100] = ZERO          (xorps, stores @0x350d8a/@0x350d92)
//   p[0x120] = ONE           (1.0,1.0,1.0,0.0)            data @0x3ca9c0 @0x350da1/@0x350da9
//   p[0x140] = MANT_MASK     (0x807fffff x3, 0)           data @0x892090 @0x350db8/@0x350dc0
//                            (sign+mantissa: clears the 8 exponent bits)
//   p[0x160] = FLT_MIN       (1.1754943508222875e-38 x3, 0) data @0x858f70 @0x350dcf/@0x350dd7
//   p[0x180] = INF           (inf,inf,inf,0.0)            data @0x88f440 @0x350de6/@0x350dee
//   p[0x1a0] = BIAS_127      (127.0 x3, 0.0)              data @0x88ded0 @0x350dfd/@0x350e05
//   p[0x1c0] = SQRT2         (1.4142135381698608 x3, 0)   data @0x88dee0 @0x350e14/@0x350e1c
//   p[0x1e0] = HALF          (0.5,0.5,0.5,0.0)            data @0x85da90 @0x350e2b/@0x350e33
//   p[0x200] = LOG2_A        ( 0.2960891127586365 x3, 0)  data @0x88dfa0 @0x350e42/@0x350e4a
//   p[0x220] = LOG2_B        (-0.35917338728904724 x3, 0) data @0x88dfb0 @0x350e59/@0x350e61
//   p[0x240] = LOG2_C        ( 0.17290928959846497 x3, 0) data @0x88dfc0 @0x350e70/@0x350e78
//   p[0x260] = LOG2_D        (-0.27149274945259094 x3, 0) data @0x88dfd0 @0x350e87/@0x350e8f
//   p[0x280] = LOG2_E        ( 0.4805939197540283 x3, 0)  data @0x88dfe0 @0x350e9e/@0x350ea6
//   p[0x2a0] = LOG2_F        (-0.7213672399520874 x3, 0)  data @0x88dff0 @0x350eb5/@0x350ebd
//   p[0x2c0] = LOG2_G        ( 1.4426966905593872 x3, 0)  data @0x88e000 @0x350ecc/@0x350ed4
//                            (~log2(e); the leading coefficient of the fit)
//   p[0x2e0] = NEG_127       (-127.0 x3, 0.0)             data @0x88df30 @0x350ee3/@0x350eeb
//   p[0x300] = EXP2_A        (0.0017952255439013243 x3,0) data @0x88e010 @0x350efa/@0x350f02
//   p[0x320] = EXP2_B        (0.009189177304506302 x3, 0) data @0x88e020 @0x350f11/@0x350f19
//   p[0x340] = EXP2_C        (0.055661238729953766 x3, 0) data @0x88e030 @0x350f28/@0x350f30
//   p[0x360] = EXP2_D        (0.2402067929506302 x3, 0)   data @0x88e040 @0x350f3f/@0x350f47
//   p[0x380] = EXP2_E        (0.6931475400924683 x3, 0)   data @0x88e050 @0x350f56/@0x350f5e
//                            (~ln 2; the leading coefficient of the 2^f fit)
//   p[0x3a0] = INT_127       (0x0000007f x3, 0) as INTEGER lanes
//                                                         data @0x88df70 @0x350f6d/@0x350f75
//   p[0x3c0] = SIGN_MASK     (0x80000000 x3, 0x00000000)  data @0x88df80 @0x350f84/@0x350f8c
//   p[0x3e0] = (0xffffffff,0,0xffffffff,0)  data @0x88d290 @0x350f9b/@0x350fa3  — NOT read
//   p[0x400] = (0,0,0,0xffffffff)           data @0x85fc40 @0x350fb2/@0x350fba  — NOT read
//              (the last two cells are consumed by the SSE `RenderTile` sibling
//               @0x3507a0, a different unit; RenderTile_AVX uses `vblendps`
//               immediates instead and never loads them.)
//
// ── TWO PIXEL LOOPS ─────────────────────────────────────────────────────────
//   A. @0x350390 — the 32-byte ymm loop: TWO pixels (8 float32 lanes) per
//      iteration, entered only when width >= 2 (@0x350378 cmpl $0x2,%ecx ; jl).
//      Loads/stores with vmovups (UNaligned).
//   B. @0x3505c8 — the 16-byte xmm tail: the single leftover pixel of an odd
//      row (and the whole row when width == 1). Loads/stores with vmovaps
//      (aligned). Runs AT MOST ONCE per row — loop A consumes pixels in pairs,
//      then `@0x3505b8 cmpl %ecx,%r11d ; jge` skips the tail when none is left,
//      and the tail ends with an unconditional `jmp 0x350360` to the next row.
//   The alignment difference between A and B is a property of the emitted code,
//   not of the data model; it has no effect on a faithful value port and is
//   noted only so it is not read as a decode error.
//
// The pool pointer is RE-LOADED from this+0x198 inside both loop bodies
// (@0x350397 in A, @0x3505ce in B) rather than hoisted — the compiler could not
// prove the pixel stores do not alias it. This port re-reads it in the same
// places, so a caller that aliases the pool with the output plane observes what
// the machine observes.
//
// ── A NOTE ON THE REDUNDANT SECOND SELECT ───────────────────────────────────
// Both loops compute the linear-vs-power select TWICE (@0x35055d..0x350562 then
// @0x350577..0x350582 in A; @0x35074c..0x350751 then @0x350769..0x35076e in B)
// and blend only lanes 1 and 5 (imm 0x22) / lane 1 (imm 0x2) out of the second
// one. The second comparison operand for those lanes is unchanged by the
// intervening `vblendps`, so the two selects agree there — the recomputation is
// dead. It is transcribed anyway, in place, because the rule is to mirror the
// instruction stream and not to "clean up" logic away from it.

// ── ORACLE EVIDENCE (differential vs the LIVE Final Cut Pro binary) ─────────
// This port was checked against the real function, not just re-read. Harness:
//   1. `arch -x86_64 /usr/bin/python3` (see the WARNING below), dlopen Helium,
//      resolve the three LOCAL symbols in the x86_64 slice and call them by
//      (vmaddr + dyld image slide): C2 @0x350ce0, SetParameter @0x351100 and
//      RenderTile_AVX @0x350320.
//   2. FCP's OWN ctor fills the +0x198 pool (its pointer came back 32-byte
//      aligned, which is what the alignment idiom @0x350d03..0x350d14 predicts),
//      and FCP's OWN SetParameter writes the parameter cells. Those exact pool
//      BYTES are then handed to the TS port, so the pool layout documented above
//      is part of what the differential tests.
//   3. 200 random tiles — widths 1,2,3,4,5,6,7,8,9,15,16,17,33 (exercising loop
//      A alone, loop B alone at width 1, and A+B for odd widths), heights 1..3,
//      row strides both tight and padded, pixels drawn from ±normal values, ±0,
//      denormals (±1e-40) and ±3.4e38.
//   RESULT: 16,340 / 16,340 output float32 lanes BIT-IDENTICAL (compared as raw
//   u32 encodings, so ±0 and NaN payloads count), return value 0 in every case,
//   and a zero-height tile returns 0 without touching the output.
//   NEGATIVE CONTROLS (the same harness must be able to FAIL): reading LOG2_A
//   from p[0x220] instead of p[0x200] -> 241 lanes wrong; dropping the sign
//   restoration @0x350588 -> 205 wrong; `trunc` instead of `floor` for
//   `vroundps $0x9` -> 104 wrong; dropping ONE `Math.fround` @0x3504ad -> 56
//   wrong. The oracle has teeth.
//
// ── WARNING, AND A NEW ONE (2026-08-10) ─────────────────────────────────────
// OPS_LOG records that the parity oracle dlopens the ARM64 slice while every
// port is transcribed from x86_64, and that `arch -x86_64 /usr/bin/python3` is
// the workaround. That workaround is INCOMPLETE: it fixes dlopen, but a bare
// `nm -n` STILL reports the arm64 slice even from a Rosetta process — and
// `fct/parity/local_call.py::_vmaddr` uses exactly a bare `nm -n`. So
// `local_fn()` under Rosetta computes (arm64 vmaddr + x86_64 slide), which is a
// wild address inside the x86_64 image: it calls SOME OTHER FUNCTION. Measured
// here: this class's C2 ctor is at 0x2ce5f8 in the arm64 slice and 0x350ce0 in
// the x86_64 slice, and the arm64 slice contains NO `RenderTile_AVX` symbol at
// all (AVX is x86-only), so the AVX lookup failed loudly while the ctor and
// SetParameter lookups silently returned arm64 addresses. Resolve symbols with
// `nm -n -arch x86_64` and add the dyld slide to THAT, as this unit's harness
// does.

import type { HGTile } from "./HGTile.js";

// ---------------------------------------------------------------------------
// Machine-level bit reinterpretation.
//
// `vandps` / `vorps` / `vxorps` / `vpslld` / `vpaddd` operate on the RAW 32-bit
// lane encoding, while `vmulps` / `vaddps` operate on the float value of the
// same lane. These two views of one 4-byte lane are what the helpers below
// provide; they are NOT FCP functions and model no FCP symbol — they are the
// TypeScript spelling of "read this register as bits" / "as float32", the same
// device HgcGradientRadialIdentity uses with its parallel f32/u32 scratch views.
// ---------------------------------------------------------------------------
const _laneBuf = new ArrayBuffer(4);
const _laneF32 = new Float32Array(_laneBuf);
const _laneU32 = new Uint32Array(_laneBuf);

/** The 32 raw bits of a float32 lane (IEEE-754 encoding). */
function laneBits(x: number): number {
  _laneF32[0] = x;
  return _laneU32[0];
}

/** The float32 value a 32-bit lane encoding denotes. */
function laneFloat(bits: number): number {
  _laneU32[0] = bits >>> 0;
  return _laneF32[0];
}

/**
 * `vcvttps2dq` — convert float32 to int32 with TRUNCATION toward zero.
 *
 * Out-of-range and NaN inputs produce the x86 "integer indefinite" value
 * 0x80000000 rather than a clamped result; reproducing that is the difference
 * between a faithful port and a plausible one. Cited at @0x35050d (ymm form)
 * and @0x35071a (xmm form).
 */
function cvttps2dq(x: number): number {
  const t = Math.trunc(x);
  if (!(t >= -2147483648 && t <= 2147483647)) {
    return -2147483648 | 0; // 0x80000000 — x86 integer indefinite
  }
  return t | 0;
}

/** Pool cell byte offsets (see POOL LAYOUT above); each is a `p + k` operand. */
const P_EXPONENT = 0x00; // @0x3503b3 vmovups (%r14),%ymm4
const P_LOG_SCALE = 0x20; // @0x3503a7 vmulps 0x20(%r14),%ymm2,%ymm1
const P_LOG_BIAS = 0x40; // @0x3503ad vaddps 0x40(%r14),%ymm1,%ymm5
const P_LIN_SLOPE = 0x60; // @0x350545 vmulps 0x60(%r14),%ymm2,%ymm4
const P_THRESHOLD = 0x80; // @0x35054b vsubps 0x80(%r14),%ymm2,%ymm2
const P_POW_OFFSET = 0xa0; // @0x35053c vaddps 0xa0(%r14),%ymm3,%ymm3
const P_LIN_OFFSET = 0xc0; // @0x350554 vaddps 0xc0(%r14),%ymm4,%ymm4
const P_ABS_MASK = 0xe0; // @0x35039e vandps 0xe0(%r14),%ymm0,%ymm2
const P_ZERO = 0x100; // @0x3503b8 vmovups 0x100(%r14),%ymm1
const P_ONE = 0x120; // @0x3503c1 vmovups 0x120(%r14),%ymm3
const P_MANT_MASK = 0x140; // @0x3503e7 vandps 0x140(%r14),%ymm5,%ymm7
const P_FLT_MIN = 0x160; // @0x3503f0 vcmpltps 0x160(%r14),%ymm5,%ymm8
const P_INF = 0x180; // @0x3503fe vandps 0x180(%r14),%ymm8,%ymm8
const P_BIAS_127 = 0x1a0; // @0x350426 vsubps 0x1a0(%r14),%ymm5,%ymm5
const P_SQRT2 = 0x1c0; // @0x3503ca vmovups 0x1c0(%r14),%ymm6
const P_HALF = 0x1e0; // @0x35043c vmulps 0x1e0(%r14),%ymm6,%ymm6
const P_LOG2_A = 0x200; // @0x350455 vmulps 0x200(%r14),%ymm6,%ymm8
const P_LOG2_B = 0x220; // @0x35045e vaddps 0x220(%r14),%ymm8,%ymm8
const P_LOG2_C = 0x240; // @0x350467 vmulps 0x240(%r14),%ymm6,%ymm9
const P_LOG2_D = 0x260; // @0x350470 vaddps 0x260(%r14),%ymm9,%ymm9
const P_LOG2_E = 0x280; // @0x350479 vmulps 0x280(%r14),%ymm6,%ymm10
const P_LOG2_F = 0x2a0; // @0x350482 vaddps 0x2a0(%r14),%ymm10,%ymm10
const P_LOG2_G = 0x2c0; // @0x3504a0 vaddps 0x2c0(%r14),%ymm7,%ymm7
const P_NEG_127 = 0x2e0; // @0x3504b5 vmaxps 0x2e0(%r14),%ymm4,%ymm4
const P_EXP2_A = 0x300; // @0x3504c8 vmulps 0x300(%r14),%ymm4,%ymm6
const P_EXP2_B = 0x320; // @0x3504d5 vaddps 0x320(%r14),%ymm6,%ymm6
const P_EXP2_C = 0x340; // @0x3504e2 vmulps 0x340(%r14),%ymm4,%ymm7
const P_EXP2_D = 0x360; // @0x3504eb vaddps 0x360(%r14),%ymm7,%ymm7
const P_EXP2_E = 0x380; // @0x3504fc vaddps 0x380(%r14),%ymm6,%ymm6
const P_INT_127 = 0x3a0; // @0x350511 vmovdqa 0x3a0(%r14),%xmm5
const P_SIGN_MASK = 0x3c0; // @0x35056e vandps 0x3c0(%r14),%ymm0,%ymm6

/**
 * `HgcToneParamCurve4AntiSymmetric` instance state — only the ONE field this
 * unit reads.
 *
 * The class is an HGNode subclass; everything below +0x198 is the opaque HGNode
 * base as far as RenderTile_AVX is concerned (the body never touches it, not
 * even the +0x10 flags word the ctor sets up @0x350fc9..0x350fd6).
 */
export interface HgcToneParamCurve4AntiSymmetricState {
  /** HGNode base subobject placeholder (+0x000..+0x197) — untouched by this unit. */
  _hgNode: unknown;

  /**
   * +0x198 — the 32-byte-aligned constant/parameter pool pointer, loaded by
   * `movq 0x198(%rdi),%r14` @0x350397 (loop A) and `movq 0x198(%rdi),%rbx`
   * @0x3505ce (loop B). Allocated and filled by the C2 ctor
   * @0x350cfe..0x350fc2 (a separate ledger unit) — see POOL LAYOUT in the file
   * header for every cell, its ctor store address and its __const data address.
   *
   * Modelled as two views over ONE buffer because the body reads the same cells
   * both as float32 operands (`vmulps`/`vaddps`) and as raw bit patterns
   * (`vandps`/`vorps`/`vxorps`/`vpaddd`), exactly as the machine does.
   */
  pool: { f32: Float32Array; u32: Uint32Array } | null;
}

/**
 * `HgcToneParamCurve4AntiSymmetric::RenderTile_AVX(HGTile* tile)`
 *   — @Helium 0x350320
 *     __ZN31HgcToneParamCurve4AntiSymmetric14RenderTile_AVXEP6HGTile
 *
 * Register map established by the prologue (%rdi = this, %rsi = tile):
 *   eax  = tile[+0x0c] - tile[+0x04] = bottom - top = HEIGHT   @0x350320/@0x350323
 *   ecx  = tile[+0x08] - tile[+0x00] = right - left = WIDTH    @0x350333/@0x350336
 *   r8   = tile[+0x10]  outSlot            (destination)       @0x35033c
 *   rdx  = tile[+0x18]  outStride  (movslq, then shlq $4)      @0x350338/@0x350348
 *   r9   = tile[+0x50]  texPlanes[0].pixels (source)           @0x350340
 *   rsi  = tile[+0x58]  texPlanes[0].stride (movslq, shlq $4)  @0x350344/@0x35034c
 *   r10d = row counter                                          @0x350350
 *   r14  = this[+0x198] pool pointer (re-loaded per iteration)  @0x350397/@0x3505ce
 *
 * The `shlq $0x4` on both strides turns a PIXEL count into a BYTE count (a
 * float4 RGBA pixel is 16 bytes); this port indexes Float32Array in float32
 * ELEMENTS, so the same conversion is `* 4`. Both strides are sign-extended
 * (`movslq`) and may be negative for a bottom-up plane, which the
 * accumulate-per-row form below reproduces exactly.
 *
 * Instruction-by-instruction transcription of the whole 211-line body:
 *
 *   0x350320  movl 0xc(%rsi),%eax        ; eax = bottom
 *   0x350323  subl 0x4(%rsi),%eax        ; eax = bottom - top = height
 *   0x350326  jle  0x350793              ; height <= 0 -> vzeroupper; return 0
 *   0x35032c  pushq %rbp ... 0x350332 pushq %rbx   ; frame (no TS counterpart)
 *   0x350333  movl 0x8(%rsi),%ecx        ; ecx = right
 *   0x350336  subl (%rsi),%ecx           ; ecx = right - left = width
 *   0x350338  movslq 0x18(%rsi),%rdx     ; rdx = (i64)(i32) outStride
 *   0x35033c  movq 0x10(%rsi),%r8        ; r8  = outSlot
 *   0x350340  movq 0x50(%rsi),%r9        ; r9  = texPlanes[0].pixels
 *   0x350344  movslq 0x58(%rsi),%rsi     ; rsi = (i64)(i32) texPlanes[0].stride
 *   0x350348  shlq $0x4,%rdx             ; dst row step in BYTES
 *   0x35034c  shlq $0x4,%rsi             ; src row step in BYTES
 *   0x350350  xorl %r10d,%r10d           ; row = 0
 *   0x350353  jmp  0x350372              ; enter the row body (do-while)
 *   -- row bottom @0x350360 --
 *   0x350360  addq %rsi,%r9              ; src += srcStep
 *   0x350363  addq %rdx,%r8              ; dst += dstStep
 *   0x350366  incl %r10d                 ; row++
 *   0x350369  cmpl %eax,%r10d
 *   0x35036c  je   0x35078f              ; row == height -> epilogue
 *   -- row top @0x350372 --
 *   0x350372  movl $0x0,%r11d            ; x = 0
 *   0x350378  cmpl $0x2,%ecx
 *   0x35037b  jl   0x3505b8              ; width < 2 -> straight to the tail check
 *   0x350381  movl $0x10,%ebx            ; byte cursor = 0x10 (loads at cursor-0x10)
 *   0x350386  xorl %r11d,%r11d           ; x = 0
 *   (loops A and B are transcribed inline at their call sites below)
 *   -- epilogue --
 *   0x35078f  popq %rbx ; popq %r14 ; popq %rbp
 *   0x350793  vzeroupper
 *   0x350796  xorl %eax,%eax
 *   0x350798  retq                       ; always returns 0
 *
 * @param self  %rdi — the HgcToneParamCurve4AntiSymmetric instance.
 * @param tile  %rsi — the HGTile being rendered.
 * @returns the int in %eax, always 0 (@0x350796).
 */
export function HgcToneParamCurve4AntiSymmetric_RenderTile_AVX(
  self: HgcToneParamCurve4AntiSymmetricState,
  tile: HGTile,
): number {
  // @0x350320..@0x350326  height = bottom - top; `jle` -> nothing to render.
  const height = (tile.bottom - tile.top) | 0;
  if (height <= 0) {
    return 0; // @0x350793 vzeroupper ; @0x350796 xorl %eax,%eax
  }

  // @0x350333..@0x350336  width = right - left.
  const width = (tile.right - tile.left) | 0;

  // @0x35033c / @0x350340  the two planes this unit touches.
  const dst = tile.outSlot; // r8 — tile[+0x10]
  const src = tile.texPlanes[0].pixels; // r9 — tile[+0x50]

  // @0x350338/@0x350348 and @0x350344/@0x35034c  strides: pixels -> bytes
  // (`shlq $0x4`) in the machine, pixels -> float32 elements (`* 4`) here.
  const dstStepF = (tile.outStride | 0) * 4; // rdx
  const srcStepF = (tile.texPlanes[0].stride | 0) * 4; // rsi

  if (dst === null || src === null) {
    // The disassembly does NOT null-check either plane — with height > 0 it
    // dereferences them at @0x350390 / @0x3505c8 and faults. That is a fault,
    // not a decoded code path, and no pixel value is defined for it, so the
    // port refuses loudly instead of inventing one.
    throw new Error(
      "HgcToneParamCurve4AntiSymmetric::RenderTile_AVX @Helium 0x350320: null " +
        "tile plane (outSlot @+0x10 / texPlanes[0] @+0x50) — the binary " +
        "dereferences these unconditionally and faults",
    );
  }

  // Row bases in float32 elements. The machine keeps two pointers (r8, r9) and
  // ADDS the row step each row (@0x350360/@0x350363); accumulating the same way
  // keeps negative strides faithful.
  let srcRow = 0;
  let dstRow = 0;

  // @0x350350  row = 0. The row loop is a do-while entered via `jmp 0x350372`.
  let row = 0;
  for (;;) {
    // @0x350372  x = 0.
    let x = 0;

    // @0x350378..@0x35037b  cmpl $0x2,%ecx ; jl 0x3505b8 — signed width < 2
    // skips loop A entirely (leaving x = 0 for the tail check).
    if (width >= 2) {
      // @0x350381  ebx = 0x10 byte cursor; @0x350386 r11d = 0.
      // Iteration k loads at (cursor - 0x10) = 0x20*k bytes = 8*k float32
      // elements, i.e. pixels 2k and 2k+1.
      let cursorBytes = 0x10;
      let r11 = 0; // the machine's signed counter: 0, -2, -4, ...

      // ── LOOP A @0x350390 — two pixels (8 lanes) per iteration ────────────
      for (;;) {
        // @0x350390  vmovups -0x10(%r9,%rbx),%ymm0 — 8 source lanes.
        const base = srcRow + ((cursorBytes - 0x10) >> 2);
        const ymm0 = [
          src[base],
          src[base + 1],
          src[base + 2],
          src[base + 3],
          src[base + 4],
          src[base + 5],
          src[base + 6],
          src[base + 7],
        ];

        // @0x350397  movq 0x198(%rdi),%r14 — RE-LOADED every iteration.
        const pool = self.pool;
        if (pool === null) {
          throw new Error(
            "HgcToneParamCurve4AntiSymmetric::RenderTile_AVX @Helium 0x350397: " +
              "null pool (+0x198) — the binary loads 32 bytes through it and faults",
          );
        }
        const pf = pool.f32;
        const pu = pool.u32;

        // The eight lanes are independent through @0x350568; the lane-selective
        // `vblendps` steps at the end are applied by lane index afterwards.
        const ymm5out = new Array<number>(8); // the first select's result
        const ymm2out = new Array<number>(8); // |x| - threshold (pre-blend)
        const ymm3out = new Array<number>(8); // the power arm
        const ymm4out = new Array<number>(8); // the linear arm
        const ymm6sign = new Array<number>(8); // extracted sign bits

        for (let l = 0; l < 8; l++) {
          const pfi = (k: number): number => pf[(k >> 2) + l];
          const pui = (k: number): number => pu[(k >> 2) + l];

          // @0x35039e  vandps 0xe0(%r14),%ymm0,%ymm2 — ymm2 = |x| (alpha lane
          // masked to +0 by the 0x00000000 lane of ABS_MASK).
          const ymm2 = laneFloat(laneBits(ymm0[l]) & pui(P_ABS_MASK));

          // @0x3503a7  vmulps 0x20(%r14),%ymm2,%ymm1
          let ymm1 = Math.fround(ymm2 * pfi(P_LOG_SCALE));
          // @0x3503ad  vaddps 0x40(%r14),%ymm1,%ymm5
          let ymm5 = Math.fround(ymm1 + pfi(P_LOG_BIAS));

          // @0x3503b3  vmovups (%r14),%ymm4      — the exponent parameter.
          const ymm4param = pfi(P_EXPONENT);
          // @0x3503b8  vmovups 0x100(%r14),%ymm1 — the ZERO cell.
          ymm1 = pfi(P_ZERO);
          // @0x3503c1  vmovups 0x120(%r14),%ymm3 — ONE (0.0 in the alpha lane).
          const ymm3one = pfi(P_ONE);
          // @0x3503ca  vmovups 0x1c0(%r14),%ymm6 — SQRT2.
          let ymm6 = pfi(P_SQRT2);

          // @0x3503d3  vcmpeqps %ymm4,%ymm1,%ymm7  (AT&T 3-op: ymm7 = ymm1 == ymm4)
          let ymm7bits = ymm1 === ymm4param ? 0xffffffff : 0x00000000;
          // @0x3503d8  vandps %ymm3,%ymm7,%ymm7
          let ymm7 = laneFloat(ymm7bits & laneBits(ymm3one));
          // @0x3503dc  vcmpltps %ymm7,%ymm1,%ymm7  (ymm7 = ymm1 < ymm7)
          ymm7bits = ymm1 < ymm7 ? 0xffffffff : 0x00000000;
          // @0x3503e1  vblendvps %ymm7,%ymm3,%ymm5,%ymm5
          //   AT&T (mask, src2, src1, dst) -> dst = mask ? src2 : src1, per the
          //   sign bit of each mask lane. Where the exponent parameter is zero
          //   the log2 argument becomes 1.0, so log2 yields 0.
          ymm5 = (ymm7bits & 0x80000000) !== 0 ? ymm3one : ymm5;

          // ── log2(ymm5), inlined @0x3503e7..@0x3504b1 ─────────────────────
          // @0x3503e7  vandps 0x140(%r14),%ymm5,%ymm7 — sign+mantissa, exponent cleared.
          ymm7 = laneFloat(laneBits(ymm5) & pui(P_MANT_MASK));
          // @0x3503f0  vcmpltps 0x160(%r14),%ymm5,%ymm8 — ymm5 < FLT_MIN (denormal/zero).
          let ymm8bits = ymm5 < pfi(P_FLT_MIN) ? 0xffffffff : 0x00000000;
          // @0x3503fa  vorps %ymm3,%ymm7,%ymm7 — OR in 1.0's bits: mantissa in [1,2).
          ymm7 = laneFloat(laneBits(ymm7) | laneBits(ymm3one));
          // @0x3503fe  vandps 0x180(%r14),%ymm8,%ymm8 — INF where denormal.
          let ymm8 = laneFloat(ymm8bits & pui(P_INF));
          // @0x350407/@0x35040c/@0x350412/@0x350417  vpsrld $0x17 on both 128-bit
          // halves (via vextractf128/vinsertf128) — the raw exponent field.
          let ymm5i = laneBits(ymm5) >>> 0x17;
          // @0x35041d  vcvtdq2ps %ymm5,%ymm5 — signed int32 -> float32. The
          // shifted value is 0..511, so the signed reading is the same number.
          ymm5 = Math.fround(ymm5i | 0);
          // @0x350421  vsubps %ymm8,%ymm5,%ymm5 — subtract INF -> -inf for denormals.
          ymm5 = Math.fround(ymm5 - ymm8);
          // @0x350426  vsubps 0x1a0(%r14),%ymm5,%ymm5 — remove the 127 bias.
          ymm5 = Math.fround(ymm5 - pfi(P_BIAS_127));
          // @0x35042f  vcmpltps %ymm7,%ymm6,%ymm6 — ymm6 = SQRT2 < mantissa.
          const ymm6bits = ymm6 < ymm7 ? 0xffffffff : 0x00000000;
          // @0x350434  vandps %ymm3,%ymm6,%ymm6 — 1.0 where the mantissa is above sqrt2.
          ymm6 = laneFloat(ymm6bits & laneBits(ymm3one));
          // @0x350438  vaddps %ymm5,%ymm6,%ymm5 — exponent += that 1.
          ymm5 = Math.fround(ymm6 + ymm5);
          // @0x35043c  vmulps 0x1e0(%r14),%ymm6,%ymm6 — 0.5 where adjusted.
          ymm6 = Math.fround(ymm6 * pfi(P_HALF));
          // @0x350445  vmulps %ymm7,%ymm6,%ymm6 — (0.5 * mantissa) where adjusted.
          ymm6 = Math.fround(ymm6 * ymm7);
          // @0x350449  vsubps %ymm3,%ymm7,%ymm7 — mantissa - 1.
          ymm7 = Math.fround(ymm7 - ymm3one);
          // @0x35044d  vsubps %ymm6,%ymm7,%ymm6 — f = (m - 1) - 0.5*m*adj, the
          //   reduced argument in [sqrt(2)/2 - 1, sqrt(2) - 1].
          ymm6 = Math.fround(ymm7 - ymm6);
          // @0x350451  vmulps %ymm6,%ymm6,%ymm7 — f^2.
          ymm7 = Math.fround(ymm6 * ymm6);
          // @0x350455  vmulps 0x200(%r14),%ymm6,%ymm8
          ymm8 = Math.fround(ymm6 * pfi(P_LOG2_A));
          // @0x35045e  vaddps 0x220(%r14),%ymm8,%ymm8
          ymm8 = Math.fround(ymm8 + pfi(P_LOG2_B));
          // @0x350467  vmulps 0x240(%r14),%ymm6,%ymm9
          let ymm9 = Math.fround(ymm6 * pfi(P_LOG2_C));
          // @0x350470  vaddps 0x260(%r14),%ymm9,%ymm9
          ymm9 = Math.fround(ymm9 + pfi(P_LOG2_D));
          // @0x350479  vmulps 0x280(%r14),%ymm6,%ymm10
          let ymm10 = Math.fround(ymm6 * pfi(P_LOG2_E));
          // @0x350482  vaddps 0x2a0(%r14),%ymm10,%ymm10
          ymm10 = Math.fround(ymm10 + pfi(P_LOG2_F));
          // @0x35048b  vmulps %ymm7,%ymm9,%ymm9
          ymm9 = Math.fround(ymm9 * ymm7);
          // @0x35048f  vaddps %ymm9,%ymm8,%ymm8
          ymm8 = Math.fround(ymm8 + ymm9);
          // @0x350494  vmulps %ymm7,%ymm8,%ymm7
          ymm7 = Math.fround(ymm8 * ymm7);
          // @0x350498  vaddps %ymm7,%ymm10,%ymm7
          ymm7 = Math.fround(ymm10 + ymm7);
          // @0x35049c  vmulps %ymm7,%ymm6,%ymm7
          ymm7 = Math.fround(ymm6 * ymm7);
          // @0x3504a0  vaddps 0x2c0(%r14),%ymm7,%ymm7
          ymm7 = Math.fround(ymm7 + pfi(P_LOG2_G));
          // @0x3504a9  vmulps %ymm7,%ymm6,%ymm6
          ymm6 = Math.fround(ymm6 * ymm7);
          // @0x3504ad  vaddps %ymm6,%ymm5,%ymm5 — log2(v) = exponent + poly(f).
          ymm5 = Math.fround(ymm5 + ymm6);
          // @0x3504b1  vmulps %ymm5,%ymm4,%ymm4 — exponent parameter * log2(v).
          let ymm4 = Math.fround(ymm4param * ymm5);

          // ── exp2(ymm4), inlined @0x3504b5..@0x350538 ─────────────────────
          // @0x3504b5  vmaxps 0x2e0(%r14),%ymm4,%ymm4 — clamp at -127.
          //   AT&T (src2, src1, dst) -> dst = max(src1, src2). x86 MAXPS returns
          //   the SECOND operand (src2, here the memory constant) when either
          //   input is NaN, which `Math.max` does not do; spelled out below.
          {
            const a = ymm4; // src1 = ymm4
            const b = pfi(P_NEG_127); // src2 = the -127.0 constant
            ymm4 = a > b ? a : b;
          }
          // @0x3504be  vroundps $0x9,%ymm4,%ymm5 — imm8 0x9 = round toward -inf
          //   (floor) with the inexact exception suppressed.
          ymm5 = Math.fround(Math.floor(ymm4));
          // @0x3504c4  vsubps %ymm5,%ymm4,%ymm4 — the fractional part.
          ymm4 = Math.fround(ymm4 - ymm5);
          // @0x3504c8  vmulps 0x300(%r14),%ymm4,%ymm6
          ymm6 = Math.fround(ymm4 * pfi(P_EXP2_A));
          // @0x3504d1  vmulps %ymm4,%ymm4,%ymm7 — frac^2.
          ymm7 = Math.fround(ymm4 * ymm4);
          // @0x3504d5  vaddps 0x320(%r14),%ymm6,%ymm6
          ymm6 = Math.fround(ymm6 + pfi(P_EXP2_B));
          // @0x3504de  vmulps %ymm6,%ymm7,%ymm6
          ymm6 = Math.fround(ymm7 * ymm6);
          // @0x3504e2  vmulps 0x340(%r14),%ymm4,%ymm7
          ymm7 = Math.fround(ymm4 * pfi(P_EXP2_C));
          // @0x3504eb  vaddps 0x360(%r14),%ymm7,%ymm7
          ymm7 = Math.fround(ymm7 + pfi(P_EXP2_D));
          // @0x3504f4  vaddps %ymm7,%ymm6,%ymm6
          ymm6 = Math.fround(ymm6 + ymm7);
          // @0x3504f8  vmulps %ymm6,%ymm4,%ymm6
          ymm6 = Math.fround(ymm4 * ymm6);
          // @0x3504fc  vaddps 0x380(%r14),%ymm6,%ymm6
          ymm6 = Math.fround(ymm6 + pfi(P_EXP2_E));
          // @0x350505  vmulps %ymm6,%ymm4,%ymm4
          ymm4 = Math.fround(ymm4 * ymm6);
          // @0x350509  vaddps %ymm4,%ymm3,%ymm3 — 2^frac ~= ONE + poly(frac).
          let ymm3 = Math.fround(ymm3one + ymm4);
          // @0x35050d  vcvttps2dq %ymm5,%ymm4 — the integer part.
          const expInt = cvttps2dq(ymm5);
          // @0x350511  vmovdqa 0x3a0(%r14),%xmm5 — the integer 127 lanes.
          // @0x35051a/@0x350524  vpaddd (both 128-bit halves).
          const biased = (pui(P_INT_127) + expInt) | 0;
          // @0x350528/@0x35052d/@0x350532  vpslld $0x17 — synthesize 2^i.
          ymm4 = laneFloat((biased << 0x17) >>> 0);
          // @0x350538  vmulps %ymm4,%ymm3,%ymm3 — 2^frac * 2^i.
          ymm3 = Math.fround(ymm3 * ymm4);
          // @0x35053c  vaddps 0xa0(%r14),%ymm3,%ymm3 — the power arm's offset.
          ymm3 = Math.fround(ymm3 + pfi(P_POW_OFFSET));

          // ── the linear arm and the select @0x350545..@0x350562 ───────────
          // @0x350545  vmulps 0x60(%r14),%ymm2,%ymm4
          ymm4 = Math.fround(ymm2 * pfi(P_LIN_SLOPE));
          // @0x35054b  vsubps 0x80(%r14),%ymm2,%ymm2 — |x| - threshold.
          const ymm2thr = Math.fround(ymm2 - pfi(P_THRESHOLD));
          // @0x350554  vaddps 0xc0(%r14),%ymm4,%ymm4
          ymm4 = Math.fround(ymm4 + pfi(P_LIN_OFFSET));
          // @0x35055d  vcmpltps %ymm1,%ymm2,%ymm5 — (|x| - threshold) < 0.
          const ltZero = ymm2thr < ymm1 ? 0xffffffff : 0x00000000;
          // @0x350562  vblendvps %ymm5,%ymm4,%ymm3,%ymm5 — below the threshold
          //   take the linear arm, otherwise the power arm.
          ymm5 = (ltZero & 0x80000000) !== 0 ? ymm4 : ymm3;

          // @0x35056e  vandps 0x3c0(%r14),%ymm0,%ymm6 — the input's sign bits
          //   (the alpha lane's mask is 0, so no sign is carried there).
          ymm6 = laneFloat(laneBits(ymm0[l]) & pui(P_SIGN_MASK));

          ymm5out[l] = ymm5;
          ymm2out[l] = ymm2thr;
          ymm3out[l] = ymm3;
          ymm4out[l] = ymm4;
          ymm6sign[l] = ymm6;
        }

        // @0x350568  vblendps $0xaa,%ymm2,%ymm5,%ymm2 — imm bit l selects ymm2
        //   (the pre-select |x| - threshold) for the ODD lanes 1,3,5,7 and the
        //   selected result for the even lanes.
        const blended = new Array<number>(8);
        for (let l = 0; l < 8; l++) {
          blended[l] = (0xaa >> l) & 1 ? ymm2out[l] : ymm5out[l];
        }

        // @0x350577..@0x350582  the SECOND (redundant, see the header note)
        //   select, of which only lanes 1 and 5 survive the imm-0x22 blend.
        const finalLanes = new Array<number>(8);
        for (let l = 0; l < 8; l++) {
          // @0x350577  vcmpltps %ymm1,%ymm2,%ymm1 — the re-blended value < 0.
          //   %ymm1 still holds the ZERO cell loaded @0x3503b8 through the r14
          //   already in hand; no new pool load happens here.
          const zeroLane = pf[(P_ZERO >> 2) + l];
          const lt2 = blended[l] < zeroLane ? 0xffffffff : 0x00000000;
          // @0x35057c  vblendvps %ymm1,%ymm4,%ymm3,%ymm1
          const sel2 = (lt2 & 0x80000000) !== 0 ? ymm4out[l] : ymm3out[l];
          // @0x350582  vblendps $0x22,%ymm1,%ymm5,%ymm1 — lanes 1 and 5 only.
          const picked = (0x22 >> l) & 1 ? sel2 : ymm5out[l];
          // @0x350588  vxorps %ymm1,%ymm6,%ymm1 — re-apply the input's sign.
          //   THIS is the "anti-symmetric" step: f(-x) = -f(x).
          finalLanes[l] = laneFloat(laneBits(picked) ^ laneBits(ymm6sign[l]));
        }

        // @0x35058c  vblendps $0x88,%ymm0,%ymm1,%ymm0 — lanes 3 and 7 (the two
        //   alpha channels) come straight from the untouched source pixel.
        // @0x350592  vmovups %ymm0,-0x10(%r8,%rbx) — store both pixels.
        const dbase = dstRow + ((cursorBytes - 0x10) >> 2);
        for (let l = 0; l < 8; l++) {
          dst[dbase + l] = (0x88 >> l) & 1 ? ymm0[l] : finalLanes[l];
        }

        // @0x350599  addq $0x20,%rbx — advance by two pixels.
        cursorBytes += 0x20;
        // @0x35059d..@0x3505af  r14d = r11 + width - 2 ; r11 -= 2 ; loop while
        //   r14d > 1 (signed).
        const trip = (r11 + width - 2) | 0;
        r11 = (r11 - 2) | 0;
        if (!(trip > 1)) {
          break;
        }
      }

      // @0x3505b5  negl %r11d — r11 counted -2 per iteration, so the negation
      // is the number of pixels loop A consumed (width rounded down to even).
      x = (-r11) | 0;
    }

    // @0x3505b8..@0x3505bb  cmpl %ecx,%r11d ; jge 0x350360 — signed: nothing
    // left in this row, go to the next one.
    if (x < width) {
      // ── LOOP B @0x3505c1 — the single odd tail pixel (4 lanes) ───────────
      // @0x3505c1  movl %r11d,%r11d ; @0x3505c4 shlq $0x4,%r11 — the byte
      // offset of that pixel; 4 float32 elements per pixel here.
      const sbase = srcRow + (x >>> 0) * 4;

      // @0x3505c8  vmovaps (%r9,%r11),%xmm0 — the source pixel.
      const xmm0 = [src[sbase], src[sbase + 1], src[sbase + 2], src[sbase + 3]];

      // @0x3505ce  movq 0x198(%rdi),%rbx — the pool, re-loaded here too.
      const pool = self.pool;
      if (pool === null) {
        throw new Error(
          "HgcToneParamCurve4AntiSymmetric::RenderTile_AVX @Helium 0x3505ce: " +
            "null pool (+0x198) — the binary loads 16 bytes through it and faults",
        );
      }
      const pf = pool.f32;
      const pu = pool.u32;

      const xmm5out = new Array<number>(4);
      const xmm2out = new Array<number>(4);
      const xmm3out = new Array<number>(4);
      const xmm4out = new Array<number>(4);
      const xmm6sign = new Array<number>(4);

      for (let l = 0; l < 4; l++) {
        const pfi = (k: number): number => pf[(k >> 2) + l];
        const pui = (k: number): number => pu[(k >> 2) + l];

        // @0x3505d5  vandps 0xe0(%rbx),%xmm0,%xmm2 — |x|.
        const xmm2 = laneFloat(laneBits(xmm0[l]) & pui(P_ABS_MASK));
        // @0x3505dd  vmulps 0x20(%rbx),%xmm2,%xmm1
        let xmm1 = Math.fround(xmm2 * pfi(P_LOG_SCALE));
        // @0x3505e2  vaddps 0x40(%rbx),%xmm1,%xmm5
        let xmm5 = Math.fround(xmm1 + pfi(P_LOG_BIAS));
        // @0x3505e7  vmovaps (%rbx),%xmm4
        const xmm4param = pfi(P_EXPONENT);
        // @0x3505eb  vmovaps 0x100(%rbx),%xmm1 — ZERO.
        xmm1 = pfi(P_ZERO);
        // @0x3505f3  vmovaps 0x120(%rbx),%xmm3 — ONE.
        const xmm3one = pfi(P_ONE);
        // @0x3505fb  vcmpeqps %xmm4,%xmm1,%xmm6
        let xmm6bits = xmm1 === xmm4param ? 0xffffffff : 0x00000000;
        // @0x350600  vandps %xmm3,%xmm6,%xmm6
        let xmm6 = laneFloat(xmm6bits & laneBits(xmm3one));
        // @0x350604  vcmpnleps %xmm1,%xmm6,%xmm6 — NLE: xmm6 > xmm1, and TRUE
        //   when either operand is NaN (the unordered predicate), unlike the
        //   `vcmpltps` the ymm path uses with the operands the other way round.
        xmm6bits = !(xmm6 <= xmm1) ? 0xffffffff : 0x00000000;
        // @0x350609  vblendvps %xmm6,%xmm3,%xmm5,%xmm5
        xmm5 = (xmm6bits & 0x80000000) !== 0 ? xmm3one : xmm5;

        // ── log2(xmm5) @0x35060f..@0x3506c4 ──────────────────────────────
        // @0x35060f  vandps 0x140(%rbx),%xmm5,%xmm6
        xmm6 = laneFloat(laneBits(xmm5) & pui(P_MANT_MASK));
        // @0x350617  vmovaps 0x1c0(%rbx),%xmm7 — SQRT2.
        let xmm7 = pfi(P_SQRT2);
        // @0x35061f  vorps %xmm3,%xmm6,%xmm6
        xmm6 = laneFloat(laneBits(xmm6) | laneBits(xmm3one));
        // @0x350623  vcmpltps 0x160(%rbx),%xmm5,%xmm8 — xmm5 < FLT_MIN.
        let xmm8bits = xmm5 < pfi(P_FLT_MIN) ? 0xffffffff : 0x00000000;
        // @0x35062c  vandps 0x180(%rbx),%xmm8,%xmm8 — INF where denormal.
        let xmm8 = laneFloat(xmm8bits & pui(P_INF));
        // @0x350634  vpsrld $0x17,%xmm5,%xmm5 — the raw exponent field.
        const rawExp = laneBits(xmm5) >>> 0x17;
        // @0x350639  vcvtdq2ps %xmm5,%xmm5
        xmm5 = Math.fround(rawExp | 0);
        // @0x35063d  vsubps %xmm8,%xmm5,%xmm5
        xmm5 = Math.fround(xmm5 - xmm8);
        // @0x350642  vsubps 0x1a0(%rbx),%xmm5,%xmm5 — remove the 127 bias.
        xmm5 = Math.fround(xmm5 - pfi(P_BIAS_127));
        // @0x35064a  vcmpltps %xmm6,%xmm7,%xmm7 — SQRT2 < mantissa.
        const gtSqrt2 = xmm7 < xmm6 ? 0xffffffff : 0x00000000;
        // @0x35064f  vandps %xmm3,%xmm7,%xmm7
        xmm7 = laneFloat(gtSqrt2 & laneBits(xmm3one));
        // @0x350653  vaddps %xmm7,%xmm5,%xmm5
        xmm5 = Math.fround(xmm5 + xmm7);
        // @0x350657  vmulps 0x1e0(%rbx),%xmm7,%xmm7
        xmm7 = Math.fround(xmm7 * pfi(P_HALF));
        // @0x35065f  vmulps %xmm6,%xmm7,%xmm7
        xmm7 = Math.fround(xmm7 * xmm6);
        // @0x350663  vsubps %xmm3,%xmm6,%xmm6 — mantissa - 1.
        xmm6 = Math.fround(xmm6 - xmm3one);
        // @0x350667  vsubps %xmm7,%xmm6,%xmm6 — the reduced argument f.
        xmm6 = Math.fround(xmm6 - xmm7);
        // @0x35066b  vmulps %xmm6,%xmm6,%xmm7 — f^2.
        xmm7 = Math.fround(xmm6 * xmm6);
        // @0x35066f  vmulps 0x200(%rbx),%xmm6,%xmm8
        xmm8 = Math.fround(xmm6 * pfi(P_LOG2_A));
        // @0x350677  vaddps 0x220(%rbx),%xmm8,%xmm8
        xmm8 = Math.fround(xmm8 + pfi(P_LOG2_B));
        // @0x35067f  vmulps 0x240(%rbx),%xmm6,%xmm9
        let xmm9 = Math.fround(xmm6 * pfi(P_LOG2_C));
        // @0x350687  vaddps 0x260(%rbx),%xmm9,%xmm9
        xmm9 = Math.fround(xmm9 + pfi(P_LOG2_D));
        // @0x35068f  vmulps 0x280(%rbx),%xmm6,%xmm10
        let xmm10 = Math.fround(xmm6 * pfi(P_LOG2_E));
        // @0x350697  vaddps 0x2a0(%rbx),%xmm10,%xmm10
        xmm10 = Math.fround(xmm10 + pfi(P_LOG2_F));
        // @0x35069f  vmulps %xmm7,%xmm9,%xmm9
        xmm9 = Math.fround(xmm9 * xmm7);
        // @0x3506a3  vaddps %xmm9,%xmm8,%xmm8
        xmm8 = Math.fround(xmm8 + xmm9);
        // @0x3506a8  vmulps %xmm7,%xmm8,%xmm7
        xmm7 = Math.fround(xmm8 * xmm7);
        // @0x3506ac  vaddps %xmm7,%xmm10,%xmm7
        xmm7 = Math.fround(xmm10 + xmm7);
        // @0x3506b0  vmulps %xmm7,%xmm6,%xmm7
        xmm7 = Math.fround(xmm6 * xmm7);
        // @0x3506b4  vaddps 0x2c0(%rbx),%xmm7,%xmm7
        xmm7 = Math.fround(xmm7 + pfi(P_LOG2_G));
        // @0x3506bc  vmulps %xmm7,%xmm6,%xmm6
        xmm6 = Math.fround(xmm6 * xmm7);
        // @0x3506c0  vaddps %xmm6,%xmm5,%xmm5 — log2(v).
        xmm5 = Math.fround(xmm5 + xmm6);
        // @0x3506c4  vmulps %xmm5,%xmm4,%xmm4
        let xmm4 = Math.fround(xmm4param * xmm5);

        // ── exp2(xmm4) @0x3506c8..@0x35072f ──────────────────────────────
        // @0x3506c8  vmaxps 0x2e0(%rbx),%xmm4,%xmm4 — see the ymm note on the
        //   NaN behaviour of MAXPS (the memory operand wins).
        {
          const a = xmm4;
          const b = pfi(P_NEG_127);
          xmm4 = a > b ? a : b;
        }
        // @0x3506d0  vroundps $0x9,%xmm4,%xmm5 — floor.
        xmm5 = Math.fround(Math.floor(xmm4));
        // @0x3506d6  vsubps %xmm5,%xmm4,%xmm4 — the fraction.
        xmm4 = Math.fround(xmm4 - xmm5);
        // @0x3506da  vmulps 0x300(%rbx),%xmm4,%xmm6
        xmm6 = Math.fround(xmm4 * pfi(P_EXP2_A));
        // @0x3506e2  vmulps %xmm4,%xmm4,%xmm7 — frac^2.
        xmm7 = Math.fround(xmm4 * xmm4);
        // @0x3506e6  vaddps 0x320(%rbx),%xmm6,%xmm6
        xmm6 = Math.fround(xmm6 + pfi(P_EXP2_B));
        // @0x3506ee  vmulps %xmm6,%xmm7,%xmm6
        xmm6 = Math.fround(xmm7 * xmm6);
        // @0x3506f2  vmulps 0x340(%rbx),%xmm4,%xmm7
        xmm7 = Math.fround(xmm4 * pfi(P_EXP2_C));
        // @0x3506fa  vaddps 0x360(%rbx),%xmm7,%xmm7
        xmm7 = Math.fround(xmm7 + pfi(P_EXP2_D));
        // @0x350702  vaddps %xmm7,%xmm6,%xmm6
        xmm6 = Math.fround(xmm6 + xmm7);
        // @0x350706  vmulps %xmm6,%xmm4,%xmm6
        xmm6 = Math.fround(xmm4 * xmm6);
        // @0x35070a  vaddps 0x380(%rbx),%xmm6,%xmm6
        xmm6 = Math.fround(xmm6 + pfi(P_EXP2_E));
        // @0x350712  vmulps %xmm6,%xmm4,%xmm4
        xmm4 = Math.fround(xmm4 * xmm6);
        // @0x350716  vaddps %xmm4,%xmm3,%xmm3 — 2^frac.
        let xmm3 = Math.fround(xmm3one + xmm4);
        // @0x35071a  vcvttps2dq %xmm5,%xmm4
        const expInt = cvttps2dq(xmm5);
        // @0x35071e  vpaddd 0x3a0(%rbx),%xmm4,%xmm4 — + integer 127.
        const biased = (expInt + pui(P_INT_127)) | 0;
        // @0x350726  vpslld $0x17,%xmm4,%xmm4 — synthesize 2^i.
        xmm4 = laneFloat((biased << 0x17) >>> 0);
        // @0x35072b  vmulps %xmm4,%xmm3,%xmm3
        xmm3 = Math.fround(xmm3 * xmm4);
        // @0x35072f  vaddps 0xa0(%rbx),%xmm3,%xmm3
        xmm3 = Math.fround(xmm3 + pfi(P_POW_OFFSET));

        // ── the linear arm and the select @0x350737..@0x350751 ────────────
        // @0x350737  vmulps 0x60(%rbx),%xmm2,%xmm4
        xmm4 = Math.fround(xmm2 * pfi(P_LIN_SLOPE));
        // @0x35073c  vsubps 0x80(%rbx),%xmm2,%xmm2
        const xmm2thr = Math.fround(xmm2 - pfi(P_THRESHOLD));
        // @0x350744  vaddps 0xc0(%rbx),%xmm4,%xmm4
        xmm4 = Math.fround(xmm4 + pfi(P_LIN_OFFSET));
        // @0x35074c  vcmpltps %xmm1,%xmm2,%xmm5 — (|x| - threshold) < 0.
        const ltZero = xmm2thr < xmm1 ? 0xffffffff : 0x00000000;
        // @0x350751  vblendvps %xmm5,%xmm4,%xmm3,%xmm5
        xmm5 = (ltZero & 0x80000000) !== 0 ? xmm4 : xmm3;

        xmm5out[l] = xmm5;
        xmm2out[l] = xmm2thr;
        xmm3out[l] = xmm3;
        xmm4out[l] = xmm4;
        // @0x35075d  vandps 0x3c0(%rbx),%xmm0,%xmm6 — the input's sign bits.
        xmm6sign[l] = laneFloat(laneBits(xmm0[l]) & pui(P_SIGN_MASK));
      }

      // @0x350757  vblendps $0xa,%xmm2,%xmm5,%xmm2 — lanes 1 and 3 keep the
      //   pre-select |x| - threshold; lanes 0 and 2 take the selected value.
      const blended = new Array<number>(4);
      for (let l = 0; l < 4; l++) {
        blended[l] = (0xa >> l) & 1 ? xmm2out[l] : xmm5out[l];
      }

      const finalLanes = new Array<number>(4);
      for (let l = 0; l < 4; l++) {
        // @0x350765  vxorps %xmm5,%xmm6,%xmm5 — sign restored on the FIRST
        //   select (this ordering differs from the ymm path, where the xor
        //   happens once after the lane blend; both restore the same bit).
        const first = laneFloat(laneBits(xmm5out[l]) ^ laneBits(xmm6sign[l]));
        // @0x350769  vcmpltps %xmm1,%xmm2,%xmm1 — the re-blended value < 0.
        const zeroLane = pf[(P_ZERO >> 2) + l];
        const lt2 = blended[l] < zeroLane ? 0xffffffff : 0x00000000;
        // @0x35076e  vblendvps %xmm1,%xmm4,%xmm3,%xmm1
        const sel2 = (lt2 & 0x80000000) !== 0 ? xmm4out[l] : xmm3out[l];
        // @0x350774  vxorps %xmm1,%xmm6,%xmm1 — sign restored on the second one.
        const second = laneFloat(laneBits(sel2) ^ laneBits(xmm6sign[l]));
        // @0x350778  vblendps $0x2,%xmm1,%xmm5,%xmm1 — only lane 1 comes from
        //   the (redundant, see the header note) second select.
        finalLanes[l] = (0x2 >> l) & 1 ? second : first;
      }

      // @0x35077e  vblendps $0x8,%xmm0,%xmm1,%xmm0 — lane 3 (alpha) passes
      //   through untouched.
      // @0x350784  vmovaps %xmm0,(%r8,%r11) — store the pixel.
      const dbase = dstRow + (x >>> 0) * 4;
      for (let l = 0; l < 4; l++) {
        dst[dbase + l] = (0x8 >> l) & 1 ? xmm0[l] : finalLanes[l];
      }
      // @0x35078a  jmp 0x350360 — one tail pixel only, then the next row.
    }

    // @0x350360..@0x35036c  advance both row pointers, row++, stop at height.
    srcRow += srcStepF;
    dstRow += dstStepF;
    row += 1;
    if (row === height) {
      break;
    }
  }

  // @0x35078f popq ; @0x350793 vzeroupper ; @0x350796 xorl %eax,%eax ; retq
  return 0;
}
