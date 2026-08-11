// HgcToneParamCurve2.ts — raw transcription of Helium `HgcToneParamCurve2`.
//
// Helium's parametric tone-curve node (`hgc1` shader family). This file ports
// its CPU AVX tile kernel.
//
// Provenance (Helium framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//   (thin slice cache /tmp/Helium.x86_64 — file offset == virtual address)
//
// Symbol ported in this file — ONE method:
//   @0x3764d0  HgcToneParamCurve2::RenderTile_AVX(HGTile*)
//                __ZN18HgcToneParamCurve214RenderTile_AVXEP6HGTile
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym
//  __ZN18HgcToneParamCurve214RenderTile_AVXEP6HGTile Helium`):
//   raw-port/re/disasm/Helium.__ZN18HgcToneParamCurve214RenderTile_AVXEP6HGTile.s
//   (160 lines)
//
// Every OTHER member is a SEPARATE ledger unit and is NOT ported here:
// GetProgram @0x3760f0, InitProgramDescriptor @0x376120, shaderDescription
// @0x376340, BindTexture @0x376390, Bind @0x376400, RenderTile @0x376820,
// GetDOD @0x376bb0, GetROI @0x376bd0, the ctor @0x376bf0, the dtors @0x376e40,
// SetParameter @0x376f30, GetParameter @0x376fb0, GetOutput @0x377000.
// The ctor and SetParameter are quoted below as LAYOUT/CONSTANT evidence only.
//
// ===========================================================================
// THE CONSTANT POOL AT this+0x198
// ===========================================================================
// The kernel does `movq 0x198(%rdi), %r14` and then reads every operand as a
// fixed byte offset off that pointer. That pointer is installed by the ctor:
//
//   0x376c09  movl  $0x307, %edi          ; 775 bytes
//   0x376c0e  callq __Znam                ; operator new[]
//   0x376c13..0x376c20                    ; align the block up to 32 bytes,
//                                         ;   stash the raw malloc pointer,
//                                         ;   rdx = p = alignedBase + 8
//   0x376c28..0x376dd3  movaps ... , 0xNN(%rcx,%rax)   ; fill the block
//   0x376dfa  movq  %rdx, 0x198(%rbx)     ; this->pool = p
//
// so a RenderTile offset `0xNN(%r14)` is the ctor's store at `0xNN+8(%rcx,%rax)`.
// Each 0x20-byte slot is written TWICE with the same 16-byte value (e.g.
// @0x376c72 and @0x376c6a write 0xa8 and 0xb8), i.e. every slot is a float4
// BROADCAST into both halves of a ymm — which is why the 8-lane path can index
// its constants by `lane & 3`.
//
// The block splits in two:
//
//   p+0x00 .. p+0x9f   FIVE RUNTIME PARAMETERS, zeroed by the ctor
//                      (`xorps %xmm0,%xmm0` @0x376c28 then ten `movaps`) and
//                      written later by
//                        HgcToneParamCurve2::SetParameter(int i, float x,
//                                                         float y, float z,
//                                                         float w) @0x376f30,
//                      which bounds-checks `i <= 4` (@0x376f35 `cmpl $0x4`),
//                      computes `rax = pool + (i << 5)` (@0x376f43 `shlq $0x5`)
//                      and stores the assembled float4 to BOTH `(%rax)` and
//                      `0x10(%rax)` (@0x376f95 / @0x376f91). So parameter i
//                      lives at p + i*0x20.
//
//   p+0xa0 .. p+0x2df  FIXED MATH CONSTANTS written by the ctor from Helium
//                      rodata. Decoded below, each citing the rodata address
//                      the ctor loaded it from.
//
// ---------------------------------------------------------------------------
// WHAT THE KERNEL COMPUTES (an OBSERVATION about the transcription below, not a
// substitute for it — the code is transcribed instruction by instruction)
// ---------------------------------------------------------------------------
// Per RGB lane, with P0..P4 the five parameters:
//
//   t   = x * P1 + P2
//   L   = log2(t)                       (the classic exponent-extract + degree-4
//                                        mantissa polynomial, coefficients at
//                                        p+0x180..p+0x1e0)
//   y   = P3 + exp2( max(P0 * L, -127) )(exponent split + degree-3 polynomial,
//                                        coefficients at p+0x220..p+0x260)
//   out = (x - P4 < 0) ? P3 : y
//
// and lane 3 (alpha) of every pixel is copied through untouched by the final
// `vblendps`. Note that every pooled constant has 0.0 in its lane 3, so lane 3
// carries garbage all the way through the math — the blend is what makes that
// harmless, and the port reproduces both halves of that arrangement rather than
// "optimising" lane 3 away.
//
// CALLEES: none. The body contains ZERO `callq` — no in-scope call, no extern,
// no virtual and no indirect dispatch (`depgraph.py deps` lists nothing).
//
// ---------------------------------------------------------------------------
// ON VECTOR WIDTH: why this is a lane-wise transcription
// ---------------------------------------------------------------------------
// Every arithmetic instruction in the body is ELEMENTWISE (vmulps, vaddps,
// vsubps, vandps, vorps, vmaxps, vcmpltps, vroundps, vcvtdq2ps, vcvttps2dq,
// vpsrld, vpslld, vpaddd, vblendvps). The ONLY cross-lane instructions are the
// `vextractf128`/`vinsertf128` pairs at @0x376591/@0x37659c and
// @0x376663/@0x376677, and they exist purely because AVX1 has no 256-bit
// integer shift: the code splits the ymm into its two 128-bit halves, runs the
// SSE2 `vpsrld`/`vpslld`/`vpaddd` on each, and reassembles. They move no data
// between lanes. The port therefore evaluates the pipeline lane by lane, in the
// binary's instruction order, which is exactly equivalent — and it keeps the
// machine's OWN duplication: the 8-lane pair path and the 4-lane tail path are
// two separate copies in the binary (@0x376540 and @0x3766da), so they are two
// separate copies here.

// ---------------------------------------------------------------------------
// ON INDEX SAFETY (what a reviewer should check for the #154 class)
// ---------------------------------------------------------------------------
// Two kinds of indexed read appear below, and both are bounded by construction:
//
//   * `p[off/4 + c]` — `p` is this object's own pool, allocated with exactly
//     HgcToneParamCurve2_POOL_F32_COUNT (= 0x2e0/4 = 184) elements. Every `off`
//     used below is one of the pool offsets the disassembly names, the largest
//     being 0x2a0, so the largest index is 0x2a0/4 + 3 = 171 < 184. The
//     `as number` casts are therefore never laundering an `undefined`; they
//     only satisfy `noUncheckedIndexedAccess`.
//   * `HgcToneParamCurve2_POOL_*[c]` — 4-tuples indexed by the constant lane,
//     which is typed `0 | 1 | 2 | 3` (it is `lane & 3` in the 8-lane path and
//     `lane` of a 4-iteration loop in the tail), so the read is total and needs
//     no non-null assertion.
//
// The pixel reads `src[...]`/`dst[...]` are NOT bounded by this file: the
// machine indexes the caller's planes with the tile's own width/height/stride
// and performs no bounds check, so an inconsistent HGTile faults in FCP and
// reads `undefined` here. That is the caller's contract, unchanged by the port.

import type { HGTile } from "./HGTile.js";

// ===========================================================================
// Pooled constants — ctor-installed, at their offsets in the p block.
// Each is a float4 broadcast into both halves of the 0x20-byte slot; lane 3 is
// 0.0 in every one of them (see the raw bytes quoted per entry).
// ===========================================================================

/** p+0xa0 — bits 0x807fffff x3, lane3 0. Rodata @Helium 0x892090
 *  (`ffff7f80 ffff7f80 ffff7f80 00000000`), loaded @0x376c7a, stored to
 *  0xa8/0xb8 @0x376c89/@0x376c81. Used as `vandps` MASK: sign bit + mantissa,
 *  exponent cleared. As a float it reads -1.1754942106924411e-38, which is why
 *  it is documented here by its BIT PATTERN — the code uses it bitwise. */
export const HgcToneParamCurve2_POOL_A0_MANTISSA_MASK_BITS: readonly [number, number, number, number] =
  [0x807fffff, 0x807fffff, 0x807fffff, 0x00000000] as const;

/** p+0xc0 — (1, 1, 1, 0). Rodata @Helium 0x3ca9c0, loaded @0x376c91,
 *  stored to 0xc8/0xd8 @0x376ca0/@0x376c98. */
export const HgcToneParamCurve2_POOL_C0_ONE3_0: readonly [number, number, number, number] =
  [1.0, 1.0, 1.0, 0.0] as const;

/** p+0xe0 — (FLT_MIN x3, 0). Rodata @Helium 0x858f70, loaded @0x376ca8,
 *  stored to 0xe8/0xf8 @0x376cb7/@0x376caf. The `t < FLT_MIN` denormal test. */
export const HgcToneParamCurve2_POOL_E0_FLT_MIN3_0: readonly [number, number, number, number] =
  [1.1754943508222875e-38, 1.1754943508222875e-38, 1.1754943508222875e-38, 0.0] as const;

/** p+0x100 — (+inf x3, 0). Rodata @Helium 0x88f440, loaded @0x376cbf,
 *  stored to 0x108/0x118 @0x376cce/@0x376cc6. Masked by the denormal test and
 *  SUBTRACTED from the exponent, i.e. a denormal drives the log to -inf. */
export const HgcToneParamCurve2_POOL_100_INF3_0: readonly [number, number, number, number] =
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 0.0] as const;

/** p+0x120 — (127 x3, 0). Rodata @Helium 0x88ded0, loaded @0x376cd6,
 *  stored to 0x128/0x138 @0x376ce5/@0x376cdd. The IEEE-754 exponent bias. */
export const HgcToneParamCurve2_POOL_120_BIAS_127: readonly [number, number, number, number] =
  [127.0, 127.0, 127.0, 0.0] as const;

/** p+0x140 — (sqrt(2) x3, 0) as f32. Rodata @Helium 0x88dee0, loaded @0x376ced,
 *  stored to 0x148/0x158 @0x376cfc/@0x376cf4. The mantissa-range split point. */
export const HgcToneParamCurve2_POOL_140_SQRT2: readonly [number, number, number, number] =
  [1.4142135381698608, 1.4142135381698608, 1.4142135381698608, 0.0] as const;

/** p+0x160 — (0.5 x3, 0). Rodata @Helium 0x85da90, loaded @0x376d04,
 *  stored to 0x168/0x178 @0x376d13/@0x376d0b. */
export const HgcToneParamCurve2_POOL_160_HALF: readonly [number, number, number, number] =
  [0.5, 0.5, 0.5, 0.0] as const;

/** p+0x180 — log2 mantissa-polynomial coefficient A.
 *  Rodata @Helium 0x88def0, loaded @0x376d1b, stored @0x376d2a/@0x376d22. */
export const HgcToneParamCurve2_POOL_180_LOG2_A: readonly [number, number, number, number] =
  [-0.331393301486969, -0.331393301486969, -0.331393301486969, 0.0] as const;

/** p+0x1a0 — log2 coefficient B.
 *  Rodata @Helium 0x88df00, loaded @0x376d32, stored @0x376d41/@0x376d39. */
export const HgcToneParamCurve2_POOL_1A0_LOG2_B: readonly [number, number, number, number] =
  [0.5175372958183289, 0.5175372958183289, 0.5175372958183289, 0.0] as const;

/** p+0x1c0 — log2 coefficient C.
 *  Rodata @Helium 0x88df10, loaded @0x376d49, stored @0x376d58/@0x376d50. */
export const HgcToneParamCurve2_POOL_1C0_LOG2_C: readonly [number, number, number, number] =
  [-0.7248122096061707, -0.7248122096061707, -0.7248122096061707, 0.0] as const;

/** p+0x1e0 — log2 coefficient D (~log2(e)).
 *  Rodata @Helium 0x88df20, loaded @0x376d60, stored @0x376d6f/@0x376d67. */
export const HgcToneParamCurve2_POOL_1E0_LOG2_D: readonly [number, number, number, number] =
  [1.4420897960662842, 1.4420897960662842, 1.4420897960662842, 0.0] as const;

/** p+0x200 — (-127 x3, 0). Rodata @Helium 0x88df30, loaded @0x376d77,
 *  stored @0x376d86/@0x376d7e. The `vmaxps` floor on the exp2 argument. */
export const HgcToneParamCurve2_POOL_200_NEG_127: readonly [number, number, number, number] =
  [-127.0, -127.0, -127.0, 0.0] as const;

/** p+0x220 — exp2 fraction-polynomial coefficient A.
 *  Rodata @Helium 0x88df40, loaded @0x376d8e, stored @0x376d9d/@0x376d95. */
export const HgcToneParamCurve2_POOL_220_EXP2_A: readonly [number, number, number, number] =
  [0.07361387461423874, 0.07361387461423874, 0.07361387461423874, 0.0] as const;

/** p+0x240 — exp2 coefficient B.
 *  Rodata @Helium 0x88df50, loaded @0x376da5, stored @0x376db4/@0x376dac. */
export const HgcToneParamCurve2_POOL_240_EXP2_B: readonly [number, number, number, number] =
  [0.23282045125961304, 0.23282045125961304, 0.23282045125961304, 0.0] as const;

/** p+0x260 — exp2 coefficient C (~ln 2).
 *  Rodata @Helium 0x88df60, loaded @0x376dbc, stored @0x376dcb/@0x376dc3. */
export const HgcToneParamCurve2_POOL_260_EXP2_C: readonly [number, number, number, number] =
  [0.6935656666755676, 0.6935656666755676, 0.6935656666755676, 0.0] as const;

/** p+0x280 — INTEGER (127, 127, 127, 0). Rodata @Helium 0x88df70
 *  (`7f000000 7f000000 7f000000 00000000`), loaded @0x376dbc's successor
 *  sequence and stored @0x376dcb-adjacent pair; read by the kernel with
 *  `vmovdqa`/`vpaddd`, i.e. as int32 lanes, to re-bias the exp2 exponent.
 *  NOTE lane 3 is 0, not 127.
 *
 *  MODELLING NOTE: the kernel reads this slot with `vmovdqa`/`vpaddd`, i.e. as
 *  INT32 lanes, while `pool` here is a Float32Array. Rather than reinterpret
 *  the pool bits at the use site, the two `vpaddd` transcriptions read this
 *  exported tuple directly — it is the same ctor-installed value, and reading
 *  it as integers is what the instruction does. The pool slot at p+0x280 is
 *  consequently not consulted by this file. */
export const HgcToneParamCurve2_POOL_280_INT_127: readonly [number, number, number, number] =
  [127, 127, 127, 0] as const;

/** p+0x2a0 — ZERO. Written from the still-zero `%xmm0` (`xorps` @0x376c28) by
 *  @0x376ddb/@0x376dd3 — it is NOT a rodata load. The right-hand side of the
 *  `x - P4 < 0` test. */
export const HgcToneParamCurve2_POOL_2A0_ZERO: readonly [number, number, number, number] =
  [0.0, 0.0, 0.0, 0.0] as const;

/** Number of f32 slots in the pool block: 0x2e0 bytes of ctor stores (the last
 *  pair is at 0x2c8/0x2d8 @0x376df2/@0x376dea) => 0x2e0/4. The allocation is
 *  `operator new[](0x307)` @0x376c09, which is 775 bytes — enough for 0x2e0
 *  bytes plus the up-to-31-byte alignment slack and the 8-byte saved raw
 *  pointer the ctor stashes at `(%rcx,%rax)` @0x376c24. */
export const HgcToneParamCurve2_POOL_F32_COUNT = 0x2e0 / 4;

/** Byte offset of a parameter slot: SetParameter @0x376f43 does `shlq $0x5`. */
export const HgcToneParamCurve2_PARAM_SLOT_BYTES = 0x20;

// ===========================================================================
// Instruction-level models for the bit-exact x86 operations used below.
// These are ISA semantics, not invented FCP helpers: each one models exactly
// one opcode that JavaScript has no direct operator for.
// ===========================================================================

const __f32 = new Float32Array(1);
const __u32 = new Uint32Array(__f32.buffer);

/** Reinterpret an f32 lane's bits as u32 (what `vandps`/`vpsrld` see). */
function __bitsOf(x: number): number {
  __f32[0] = x;
  return __u32[0] >>> 0;
}

/** Reinterpret u32 bits as an f32 lane (what `vorps`/`vpslld` produce). */
function __fromBits(b: number): number {
  __u32[0] = b >>> 0;
  return __f32[0];
}

/**
 * `vroundps $0x9` — round toward -inf (imm 0x1) with the precision exception
 * suppressed (imm 0x8). That is floor(), and floor() of a non-finite value is
 * that value.
 */
function __roundDown(x: number): number {
  return Math.floor(x);
}

/**
 * `vcvttps2dq` — convert f32 to int32 with TRUNCATION toward zero. Any value
 * that does not fit (including NaN and infinities) yields the "integer
 * indefinite" 0x80000000, which is INT32_MIN.
 */
function __cvttps2dq(x: number): number {
  if (!Number.isFinite(x)) {
    return -0x80000000;
  }
  const t = Math.trunc(x);
  if (t < -0x80000000 || t > 0x7fffffff) {
    return -0x80000000;
  }
  return t | 0;
}

/**
 * `vmaxps` — Intel MAXPS is `(src1 > src2) ? src1 : src2`, so it returns src2
 * whenever the comparison is unordered (a NaN operand) or the values are equal.
 * Not the same as Math.max, which returns NaN for a NaN input.
 */
function __maxps(src1: number, src2: number): number {
  return src1 > src2 ? src1 : src2;
}

/**
 * `vcmpltps` — ordered less-than producing an all-ones / all-zero lane mask.
 * Unordered (NaN) compares FALSE. Returned here as a boolean; the code below
 * models the subsequent `vandps`/`vblendvps` with the mask as a selector, which
 * is exactly what an all-ones/all-zero lane does.
 */
function __cmpltps(a: number, b: number): boolean {
  return a < b;
}

/**
 * `HgcToneParamCurve2` — Helium's parametric tone-curve node.
 *
 * @Helium 0x3764d0
 */
export class HgcToneParamCurve2 {
  /**
   * @Helium instance +0x198 — pointer to the 0x2e0-byte constant/parameter
   * pool (`p`), read by the kernel as `movq 0x198(%rdi), %r14` @0x376547 and
   * again @0x3766e0.
   *
   * Modelled as the pooled f32 storage itself. The ctor @0x376bf0 allocates and
   * fills it and SetParameter @0x376f30 updates the five parameter slots — both
   * are SEPARATE ledger units, so this port does NOT initialise the pool; a
   * freshly constructed TS object has the zeroed block that
   * `operator new[]` + the ctor's opening `xorps` sequence leaves, and the
   * ctor-installed constants are documented as the exported
   * `HgcToneParamCurve2_POOL_*` values above.
   */
  pool: Float32Array = new Float32Array(HgcToneParamCurve2_POOL_F32_COUNT);

  /**
   * `HgcToneParamCurve2::RenderTile_AVX(HGTile* tile)` @Helium 0x3764d0
   * (__ZN18HgcToneParamCurve214RenderTile_AVXEP6HGTile).
   *
   * Faithful transcription of the 160-line body. Prologue and loop scaffolding:
   *
   *   0x3764d0  movl   0xc(%rsi), %eax     ; eax = tile->bottom
   *   0x3764d3  subl   0x4(%rsi), %eax     ; eax = bottom - top  = height
   *   0x3764d6  jle    0x37680c            ; height <= 0 -> vzeroupper; xor
   *                                        ;   eax,eax; ret   (NOTE: the test
   *                                        ;   happens BEFORE the prologue —
   *                                        ;   the empty-tile path never even
   *                                        ;   pushes a frame)
   *   0x3764e3  movl   0x8(%rsi), %ecx     ; ecx = tile->right
   *   0x3764e6  subl   (%rsi), %ecx        ; ecx = right - left  = width
   *   0x3764e8  movslq 0x18(%rsi), %rdx    ; sign-extend tile->outStride
   *   0x3764ec  movq   0x10(%rsi), %r8     ; r8  = tile->outSlot
   *   0x3764f0  movq   0x50(%rsi), %r9     ; r9  = tile->texPlanes[0].pixels
   *   0x3764f4  movslq 0x58(%rsi), %rsi    ; sign-extend texPlanes[0].stride
   *   0x3764f8  shlq   $0x4, %rdx          ; outStride  * 16 bytes  (= 4 f32)
   *   0x3764fc  shlq   $0x4, %rsi          ; srcStride  * 16 bytes
   *   0x376500  xorl   %r10d, %r10d        ; y = 0
   *   ... row body ...
   *   0x376510  addq   %rsi, %r9           ; src += srcStride
   *   0x376513  addq   %rdx, %r8           ; dst += outStride
   *   0x376516  incl   %r10d               ; ++y
   *   0x376519  cmpl   %eax, %r10d
   *   0x37651c  je     0x376808            ; done when y == height
   *   0x376808  popq %rbx; popq %r14; popq %rbp
   *   0x37680c  vzeroupper
   *   0x37680f  xorl   %eax, %eax          ; return 0
   *   0x376811  retq
   *
   * Row body — pairs first, then at most one leftover pixel:
   *
   *   0x376522  movl   $0x0, %r11d
   *   0x376528  cmpl   $0x2, %ecx
   *   0x37652b  jl     0x3766ca            ; width < 2 -> straight to the tail
   *   0x376531  movl   $0x10, %ebx         ; byte cursor, biased by +0x10 (the
   *                                        ;   loads use -0x10(%r9,%rbx))
   *   0x376536  xorl   %r11d, %r11d
   *   ... 8-lane body ...
   *   0x3766ab  addq   $0x20, %rbx         ; advance one PAIR (32 bytes)
   *   0x3766af  movl   %r11d, %r14d
   *   0x3766b2  addl   $-0x2, %r11d        ; r11d counts DOWN by 2
   *   0x3766b6  addl   %ecx, %r14d
   *   0x3766b9  addl   $-0x2, %r14d
   *   0x3766bd  cmpl   $0x1, %r14d
   *   0x3766c1  jg     0x376540            ; continue while
   *                                        ;   (oldR11 + width - 2) > 1
   *   0x3766c7  negl   %r11d               ; r11d = pixels already done
   *   0x3766ca  cmpl   %ecx, %r11d
   *   0x3766cd  jge    0x376510            ; nothing left -> next row
   *   0x3766d3  movl   %r11d, %r11d        ; zero-extend the pixel index
   *   0x3766d6  shlq   $0x4, %r11          ; -> byte offset
   *   ... 4-lane body ...
   *   0x376803  jmp    0x376510
   *
   * The pair loop's exit test is worth spelling out because it is not a plain
   * `i < width`: after k iterations r11d is -2k, and the branch continues while
   * `-2k + width - 2 > 1`, i.e. while at least two pixels remain AFTER the two
   * just written. So the loop leaves 0 or 1 pixels, and the tail below handles
   * exactly one — which is why there is no tail LOOP in the binary.
   *
   * RETURN VALUE: 0 on every path (`xorl %eax, %eax` @0x37680f is shared by the
   * empty-tile early-out and the normal completion).
   *
   * DEPENDENCIES: none in-scope; no extern; no call of any kind in the body.
   *
   * ORACLE — raw-port/re/oracle/HgcToneParamCurve2_oracle.py (+ _driver.mts;
   *   arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HgcToneParamCurve2_oracle.py)
   *
   * AVX EXECUTES UNDER ROSETTA 2 ON THIS BOX — measured, not inferred. The
   * first review of this file recorded the opposite and signed the kernel on
   * reading alone for that reason; the harness runs the real x86_64 body, some
   * 150 AVX instructions of it, and the process returns normally. That is what
   * makes the numbers below possible at all.
   *
   * The kernel is a leaf whose only state is the pool at +0x198 and the tile,
   * so it is driven directly: the REAL ctor @0x376bf0 fills the pool from
   * Helium's own rodata, the REAL SetParameter @0x376f30 writes P0..P4, and the
   * 184 live floats are handed to the TS side as bit patterns — so both sides
   * run on the same constants and the comparison tests this transcription
   * rather than the constant table. Source pixels are a bit-pattern corpus
   * (both zeros, a denormal, huge and tiny magnitudes, negatives, both
   * infinities, a quiet NaN); outputs are compared as raw u32, with
   * NaN-on-both-sides classified separately rather than hidden.
   *
   * MEASURED over five tile shapes — 8x2, 7x1, 1x1, 2x1, 3x2, which between
   * them exercise the pair loop, the single-pixel tail and the width < 2 path
   * that skips the pair loop @0x37652b — 128 lanes, 128 bit-exact,
   * 0 divergences, and rc == 0 on both sides everywhere.
   *
   * NEGATIVE CONTROL, and it is the reason this oracle exists: the pre-fix
   * model of this very file — component 0 of P0 for every lane at @0x37660d
   * and @0x376788 instead of component (lane & 3) — is written out as a mutant
   * module and run through the same harness. It disagrees with the live kernel
   * on 22 of the 128 lanes. The lane index below is therefore proven by
   * execution, not argued.
   */
  RenderTile_AVX(tile: HGTile): number {
    const p = this.pool;

    // @0x3764d0..@0x3764d3  eax = tile->bottom - tile->top
    const height: number = (tile.bottom | 0) - (tile.top | 0);
    // @0x3764d6  jle 0x37680c
    if (height <= 0) {
      // @0x37680c..@0x376811  vzeroupper ; xorl %eax,%eax ; retq
      return 0;
    }

    // @0x3764e3..@0x3764e6  ecx = tile->right - tile->left
    const width: number = (tile.right | 0) - (tile.left | 0);
    // @0x3764e8/@0x3764f8  movslq tile->outStride ; shlq $0x4
    //   Kept in PIXELS here (the <<4 is the byte scaling of a float4 pixel, and
    //   a Float32Array is indexed in f32 units), so a row step is
    //   stride*4 f32 = stride*16 bytes.
    const outStride: number = tile.outStride | 0;
    // @0x3764ec  movq 0x10(%rsi), %r8
    const dst: Float32Array | null = tile.outSlot;
    // @0x3764f0  movq 0x50(%rsi), %r9
    const src: Float32Array | null = tile.texPlanes[0]?.pixels ?? null;
    // @0x3764f4/@0x3764fc  movslq texPlanes[0].stride ; shlq $0x4
    const srcStride: number = tile.texPlanes[0]?.stride ?? 0;

    if (dst === null || src === null) {
      // The machine dereferences %r8 and %r9 unconditionally once height > 0;
      // a null plane is a fault in FCP, not a value.
      throw new Error(
        "HgcToneParamCurve2::RenderTile_AVX @Helium 0x3764ec/0x3764f0 loads " +
          "tile->outSlot (+0x10) and tile->texPlanes[0].pixels (+0x50) and " +
          "writes/reads through them without a null test — one of them is null",
      );
    }

    // Row base cursors, in f32 units. @0x376510/@0x376513 advance them.
    let srcRow = 0;
    let dstRow = 0;

    // @0x376500  xorl %r10d,%r10d ; the row counter, tested @0x376519.
    for (let y = 0; y < height; y++) {
      // @0x376522  movl $0x0, %r11d
      let done = 0;

      // @0x376528..@0x37652b  cmpl $0x2, %ecx ; jl 0x3766ca
      if (width >= 2) {
        // @0x376531  movl $0x10, %ebx — the +0x10-biased byte cursor. In f32
        // units the pair being processed starts at `done` pixels into the row.
        let k = 0; // iteration count; r11d == -2k
        for (;;) {
          const pairPixel = 2 * k; // == (rbx - 0x10) / 0x10
          const sBase = srcRow + pairPixel * 4;
          const dBase = dstRow + pairPixel * 4;

          // @0x376540  vmovups -0x10(%r9,%rbx), %ymm0   ; 8 f32 = 2 pixels
          // @0x376547  movq 0x198(%rdi), %r14           ; re-load the pool
          //            pointer every iteration (the machine does; harmless)
          for (let lane = 0; lane < 8; lane++) {
            // Constants are float4s broadcast into both halves of each
            // 0x20-byte slot (the ctor stores each value twice), so lane L
            // reads constant lane L & 3.
            const c: 0 | 1 | 2 | 3 = (lane & 3) as 0 | 1 | 2 | 3;
            const x = src[sBase + lane] as number;

            // @0x37654e  vmulps 0x20(%r14), %ymm0, %ymm1   ; x * P1
            const m1 = Math.fround(x * (p[0x20 / 4 + c] as number));
            // @0x376554  vaddps 0x40(%r14), %ymm1, %ymm2   ; t = x*P1 + P2
            const t = Math.fround(m1 + (p[0x40 / 4 + c] as number));

            // @0x37655a  vandps 0xa0(%r14), %ymm2, %ymm3   ; sign+mantissa
            let mant = __fromBits(
              __bitsOf(t) & HgcToneParamCurve2_POOL_A0_MANTISSA_MASK_BITS[c],
            );
            // @0x376563  vmovups 0xc0(%r14), %ymm1         ; ONE (held to the end)
            const one = p[0xc0 / 4 + c] as number;
            // @0x37656c  vmovups 0x140(%r14), %ymm4        ; sqrt2
            const sqrt2 = p[0x140 / 4 + c] as number;
            // @0x376575  vcmpltps 0xe0(%r14), %ymm2, %ymm5 ; t < FLT_MIN
            const isDenorm = __cmpltps(t, p[0xe0 / 4 + c] as number);
            // @0x37657f  vorps %ymm1, %ymm3, %ymm3         ; mantissa | 1.0
            mant = __fromBits(__bitsOf(mant) | __bitsOf(one));
            // @0x376583  vandps 0x100(%r14), %ymm5, %ymm5  ; denorm ? +inf : 0
            const denormAdj = isDenorm ? (p[0x100 / 4 + c] as number) : 0;

            // @0x37658c..@0x37659c  vpsrld $0x17 on each 128-bit half, then
            // reassemble — a logical shift of the WHOLE 32-bit lane, so a
            // negative `t` carries its sign bit into bit 8 of the result.
            const expBits = __bitsOf(t) >>> 0x17;
            // @0x3765a2  vcvtdq2ps %ymm2, %ymm2            ; signed int -> f32
            let e = Math.fround(expBits | 0);
            // @0x3765a6  vsubps %ymm5, %ymm2, %ymm2        ; e - denormAdj
            e = Math.fround(e - denormAdj);
            // @0x3765aa  vsubps 0x120(%r14), %ymm2, %ymm2  ; e - 127
            e = Math.fround(e - (p[0x120 / 4 + c] as number));

            // @0x3765b3  vcmpltps %ymm3, %ymm4, %ymm4      ; sqrt2 < mantissa
            // @0x3765b8  vandps %ymm1, %ymm4, %ymm4        ; -> 1.0 or 0
            const split = __cmpltps(sqrt2, mant) ? one : 0;
            // @0x3765bc  vaddps %ymm4, %ymm2, %ymm2        ; e += split
            e = Math.fround(e + split);
            // @0x3765c0  vmulps 0x160(%r14), %ymm4, %ymm4  ; split * 0.5
            let half = Math.fround(split * (p[0x160 / 4 + c] as number));
            // @0x3765c9  vmulps %ymm3, %ymm4, %ymm4        ; * mantissa
            half = Math.fround(half * mant);
            // @0x3765cd  vsubps %ymm1, %ymm3, %ymm3        ; mantissa - 1
            let f = Math.fround(mant - one);
            // @0x3765d1  vsubps %ymm4, %ymm3, %ymm3        ; f -= half
            f = Math.fround(f - half);

            // @0x3765d5  vmulps %ymm3, %ymm3, %ymm4        ; f2 = f*f
            const f2 = Math.fround(f * f);
            // @0x3765d9  vmulps 0x180(%r14), %ymm3, %ymm5
            // @0x3765e2  vaddps 0x1a0(%r14), %ymm5, %ymm5  ; f*A + B
            const ab = Math.fround(
              Math.fround(f * (p[0x180 / 4 + c] as number)) + (p[0x1a0 / 4 + c] as number),
            );
            // @0x3765eb  vmulps 0x1c0(%r14), %ymm3, %ymm6
            // @0x3765f4  vaddps 0x1e0(%r14), %ymm6, %ymm6  ; f*C + D
            const cd = Math.fround(
              Math.fround(f * (p[0x1c0 / 4 + c] as number)) + (p[0x1e0 / 4 + c] as number),
            );
            // @0x3765fd  vmulps %ymm5, %ymm4, %ymm4        ; f2*(fA+B)
            // @0x376601  vaddps %ymm4, %ymm6, %ymm4        ; (fC+D) + f2*(fA+B)
            const poly = Math.fround(cd + Math.fround(f2 * ab));
            // @0x376605  vmulps %ymm4, %ymm3, %ymm3        ; f * poly
            // @0x376609  vaddps %ymm3, %ymm2, %ymm2        ; log2 = e + f*poly
            let v = Math.fround(e + Math.fround(f * poly));

            // @0x37660d  vmulps (%r14), %ymm2, %ymm2       ; * P0
            // ELEMENTWISE against the 32-byte memory operand at p+0x00: lane L
            // takes component (L & 3) of the float4, exactly as every other
            // parameter read in this file does. It is not a broadcast — the
            // slot holds four INDEPENDENT floats, assembled by SetParameter
            // @0x376f30 with insertps $0x10/$0x20/$0x30 @0x376f7f..@0x376f8b
            // and stored to BOTH 16-byte halves @0x376f91/@0x376f95, which is
            // what makes a ymm load see the same float4 twice.
            v = Math.fround(v * (p[0 + c] as number));
            // @0x376612  vmaxps 0x200(%r14), %ymm2, %ymm2  ; max(v, -127)
            v = __maxps(v, p[0x200 / 4 + c] as number);
            // @0x37661b  vroundps $0x9, %ymm2, %ymm3       ; floorV
            const floorV = __roundDown(v);
            // @0x376621  vsubps %ymm3, %ymm2, %ymm2        ; frac
            const frac = Math.fround(v - floorV);

            // @0x376625  vmulps 0x220(%r14), %ymm2, %ymm4
            // @0x376634  vaddps 0x240(%r14), %ymm4, %ymm4  ; frac*A + B
            let ep = Math.fround(
              Math.fround(frac * (p[0x220 / 4 + c] as number)) + (p[0x240 / 4 + c] as number),
            );
            // @0x37662e  vmovups 0x60(%r14), %ymm5         ; P3 (loaded here)
            const p3 = p[0x60 / 4 + c] as number;
            // @0x37663d  vmulps %ymm4, %ymm2, %ymm4        ; * frac
            // @0x376641  vaddps 0x260(%r14), %ymm4, %ymm4  ; + C
            ep = Math.fround(Math.fround(ep * frac) + (p[0x260 / 4 + c] as number));
            // @0x37664a  vmulps %ymm4, %ymm2, %ymm2        ; * frac
            ep = Math.fround(ep * frac);
            // @0x37664e  vaddps %ymm2, %ymm1, %ymm1        ; 1.0 + poly
            let mantOut = Math.fround(one + ep);

            // @0x376652  vcvttps2dq %ymm3, %ymm2           ; (int)floorV
            // @0x376656..@0x376669  vpaddd 0x280(%r14) per 128-bit half
            // @0x37666d/@0x376672  vpslld $0x17            ; build 2^floorV
            const scaleBits =
              (((HgcToneParamCurve2_POOL_280_INT_127[c] + __cvttps2dq(floorV)) | 0) << 0x17) >>> 0;
            const scale = __fromBits(scaleBits);
            // @0x37667d  vmulps %ymm2, %ymm1, %ymm1
            mantOut = Math.fround(mantOut * scale);
            // @0x376681  vaddps %ymm1, %ymm5, %ymm1        ; P3 + exp2
            let outv = Math.fround(p3 + mantOut);

            // @0x376685  vsubps 0x80(%r14), %ymm0, %ymm2   ; x - P4
            const below = Math.fround(x - (p[0x80 / 4 + c] as number));
            // @0x37668e  vcmpltps 0x2a0(%r14), %ymm2, %ymm2 ; (x-P4) < 0
            // @0x376698  vblendvps %ymm2, %ymm5, %ymm1, %ymm1 ; mask ? P3 : v
            if (__cmpltps(below, p[0x2a0 / 4 + c] as number)) {
              outv = p3;
            }

            // @0x37669e  vblendps $0x88, %ymm0, %ymm1, %ymm0
            //   lanes 3 and 7 (the two alphas) come from the SOURCE.
            const stored = (lane & 3) === 3 ? x : outv;
            // @0x3766a4  vmovups %ymm0, -0x10(%r8,%rbx)
            dst[dBase + lane] = stored;
          }

          // @0x3766ab..@0x3766c1 — advance and re-test.
          const oldR11 = -2 * k;
          k++;
          if (!(oldR11 + width - 2 > 1)) {
            // @0x3766c7  negl %r11d
            done = 2 * k;
            break;
          }
        }
      }

      // @0x3766ca..@0x3766cd  cmpl %ecx, %r11d ; jge 0x376510
      if (done < width) {
        // @0x3766d3..@0x3766d6  zero-extend the index and scale to bytes.
        const sBase = srcRow + done * 4;
        const dBase = dstRow + done * 4;

        // @0x3766da  vmovaps (%r9,%r11), %xmm0        ; ONE pixel, 4 lanes
        // @0x3766e0  movq 0x198(%rdi), %rbx           ; re-load the pool ptr
        //
        // Second copy of the same pipeline, 4 lanes wide. The instruction
        // ORDER differs slightly from the 8-lane copy (the compiler scheduled
        // the `vorps` after the exponent extraction, and the two `vaddps` of
        // the log2 polynomial in the other order) but the dataflow is
        // identical, so the transcription below follows this copy's own
        // addresses.
        for (let lane = 0; lane < 4; lane++) {
          const c: 0 | 1 | 2 | 3 = lane as 0 | 1 | 2 | 3;
          const x = src[sBase + lane] as number;

          // @0x3766e7  vmulps 0x20(%rbx), %xmm0, %xmm1
          const m1 = Math.fround(x * (p[0x20 / 4 + c] as number));
          // @0x3766ec  vaddps 0x40(%rbx), %xmm1, %xmm2
          const t = Math.fround(m1 + (p[0x40 / 4 + c] as number));

          // @0x3766f1  vandps 0xa0(%rbx), %xmm2, %xmm3
          let mant = __fromBits(
            __bitsOf(t) & HgcToneParamCurve2_POOL_A0_MANTISSA_MASK_BITS[c],
          );
          // @0x3766f9  vmovaps 0xc0(%rbx), %xmm1
          const one = p[0xc0 / 4 + c] as number;
          // @0x376701  vcmpltps 0xe0(%rbx), %xmm2, %xmm4
          const isDenorm = __cmpltps(t, p[0xe0 / 4 + c] as number);
          // @0x37670a  vmovaps 0x140(%rbx), %xmm5
          const sqrt2 = p[0x140 / 4 + c] as number;
          // @0x376712  vandps 0x100(%rbx), %xmm4, %xmm4
          const denormAdj = isDenorm ? (p[0x100 / 4 + c] as number) : 0;
          // @0x37671a  vpsrld $0x17, %xmm2, %xmm2  (no half-split needed here)
          const expBits = __bitsOf(t) >>> 0x17;
          // @0x37671f  vcvtdq2ps %xmm2, %xmm2
          let e = Math.fround(expBits | 0);
          // @0x376723  vsubps %xmm4, %xmm2, %xmm2
          e = Math.fround(e - denormAdj);
          // @0x376727  vsubps 0x120(%rbx), %xmm2, %xmm2
          e = Math.fround(e - (p[0x120 / 4 + c] as number));
          // @0x37672f  vorps %xmm1, %xmm3, %xmm3
          mant = __fromBits(__bitsOf(mant) | __bitsOf(one));
          // @0x376733  vcmpltps %xmm3, %xmm5, %xmm4
          // @0x376738  vandps %xmm1, %xmm4, %xmm4
          const split = __cmpltps(sqrt2, mant) ? one : 0;
          // @0x37673c  vaddps %xmm4, %xmm2, %xmm2
          e = Math.fround(e + split);
          // @0x376740  vmulps 0x160(%rbx), %xmm4, %xmm4
          let half = Math.fround(split * (p[0x160 / 4 + c] as number));
          // @0x376748  vmulps %xmm3, %xmm4, %xmm4
          half = Math.fround(half * mant);
          // @0x37674c  vsubps %xmm1, %xmm3, %xmm3
          let f = Math.fround(mant - one);
          // @0x376750  vsubps %xmm4, %xmm3, %xmm3
          f = Math.fround(f - half);

          // @0x376754  vmulps %xmm3, %xmm3, %xmm4
          const f2 = Math.fround(f * f);
          // @0x376758  vmulps 0x180(%rbx), %xmm3, %xmm5
          // @0x376760  vaddps 0x1a0(%rbx), %xmm5, %xmm5
          const ab = Math.fround(
            Math.fround(f * (p[0x180 / 4 + c] as number)) + (p[0x1a0 / 4 + c] as number),
          );
          // @0x376768  vmulps 0x1c0(%rbx), %xmm3, %xmm6
          // @0x376774  vaddps 0x1e0(%rbx), %xmm6, %xmm5
          const cd = Math.fround(
            Math.fround(f * (p[0x1c0 / 4 + c] as number)) + (p[0x1e0 / 4 + c] as number),
          );
          // @0x376770  vmulps %xmm5, %xmm4, %xmm4
          // @0x37677c  vaddps %xmm4, %xmm5, %xmm4
          const poly = Math.fround(cd + Math.fround(f2 * ab));
          // @0x376780  vmulps %xmm4, %xmm3, %xmm3
          // @0x376784  vaddps %xmm3, %xmm2, %xmm2
          let v = Math.fround(e + Math.fround(f * poly));

          // @0x376788  vmulps (%rbx), %xmm2, %xmm2
          // Elementwise against the 16-byte operand at p+0x00 — component
          // (lane & 3) of the float4, as at @0x37660d in the 8-lane path.
          v = Math.fround(v * (p[0 + c] as number));
          // @0x37678c  vmaxps 0x200(%rbx), %xmm2, %xmm2
          v = __maxps(v, p[0x200 / 4 + c] as number);
          // @0x376794  vroundps $0x9, %xmm2, %xmm3
          const floorV = __roundDown(v);
          // @0x37679a  vsubps %xmm3, %xmm2, %xmm2
          const frac = Math.fround(v - floorV);

          // @0x37679e  vmulps 0x220(%rbx), %xmm2, %xmm4
          // @0x3767a6  vaddps 0x240(%rbx), %xmm4, %xmm4
          let ep = Math.fround(
            Math.fround(frac * (p[0x220 / 4 + c] as number)) + (p[0x240 / 4 + c] as number),
          );
          // @0x3767ae  vmovaps 0x60(%rbx), %xmm5
          const p3 = p[0x60 / 4 + c] as number;
          // @0x3767b3  vmulps %xmm4, %xmm2, %xmm4
          // @0x3767b7  vaddps 0x260(%rbx), %xmm4, %xmm4
          ep = Math.fround(Math.fround(ep * frac) + (p[0x260 / 4 + c] as number));
          // @0x3767bf  vmulps %xmm4, %xmm2, %xmm2
          ep = Math.fround(ep * frac);
          // @0x3767cf  vaddps %xmm2, %xmm1, %xmm1
          let mantOut = Math.fround(one + ep);

          // @0x3767c3  vcvttps2dq %xmm3, %xmm3
          // @0x3767c7  vpaddd 0x280(%rbx), %xmm3, %xmm3
          // @0x3767d3  vpslld $0x17, %xmm3, %xmm2
          const scaleBits =
            (((HgcToneParamCurve2_POOL_280_INT_127[c] + __cvttps2dq(floorV)) | 0) << 0x17) >>> 0;
          const scale = __fromBits(scaleBits);
          // @0x3767d8  vmulps %xmm2, %xmm1, %xmm1
          mantOut = Math.fround(mantOut * scale);
          // @0x3767dc  vaddps %xmm1, %xmm5, %xmm1
          let outv = Math.fround(p3 + mantOut);

          // @0x3767e0  vsubps 0x80(%rbx), %xmm0, %xmm2
          const below = Math.fround(x - (p[0x80 / 4 + c] as number));
          // @0x3767e8  vcmpltps 0x2a0(%rbx), %xmm2, %xmm2
          // @0x3767f1  vblendvps %xmm2, %xmm5, %xmm1, %xmm1
          if (__cmpltps(below, p[0x2a0 / 4 + c] as number)) {
            outv = p3;
          }

          // @0x3767f7  vblendps $0x8, %xmm0, %xmm1, %xmm0  ; lane 3 = source
          const stored = lane === 3 ? x : outv;
          // @0x3767fd  vmovaps %xmm0, (%r8,%r11)
          dst[dBase + lane] = stored;
        }
      }

      // @0x376510..@0x376513  src += srcStride ; dst += outStride (in f32 units)
      srcRow += srcStride * 4;
      dstRow += outStride * 4;
    }

    // @0x37680f  xorl %eax, %eax
    return 0;
  }
}
