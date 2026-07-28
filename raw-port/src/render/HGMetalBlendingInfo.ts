// HGMetalBlendingInfo.ts — FCP Helium framework class.
//
// Transcribed from the x86_64 disassembly of Helium in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// (see raw-port/re/disasm/Helium.HGMetalBlendingInfo.*.s).
//
// SYMBOLS (nm | c++filt):
//   0x8fa70  T HGMetalBlendingInfo::HGMetalBlendingInfo(HGBlendingInfo const&)   (C2)
//   0x8fb00  T HGMetalBlendingInfo::HGMetalBlendingInfo(HGBlendingInfo const&)   (C1)
//   0x8fb10  T HGMetalBlendingInfo::GetSrcRGBFactor()   const
//   0x8fb20  T HGMetalBlendingInfo::GetDstRGBFactor()   const
//   0x8fb30  T HGMetalBlendingInfo::GetSrcAlphaFactor() const
//   0x8fb40  T HGMetalBlendingInfo::GetDstAlphaFactor() const
//   0x8fb50  T HGMetalBlendingInfo::GetRGBOperation()   const
//   0x8fb60  T HGMetalBlendingInfo::GetAlphaOperation() const
//
// DECODE REFERENCES:
//   raw-port/re/disasm/Helium.HGMetalBlendingInfo.HGMetalBlendingInfo.s (C1 body)
//   raw-port/re/disasm/Helium.HGMetalBlendingInfo.GetSrcRGBFactor.s   (all six getters)
//   raw port session: `xcrun llvm-objdump --disassemble-symbols` for the C2 body
//   (otool -tV does not emit a label at 0x8fa70; llvm-objdump extracts the exact
//   32-byte SSE4.1 body used here).
//   Const-table dumps (32B-aligned mach-o __TEXT,__const):
//     Helium @0x3cd060 = { 0x0d, 0x0d, 0, 0 }   ; unsigned upper-bound for factor enums
//     Helium @0x3cd070 = { 0x01, 0x01, 0, 0 }   ; fallback value when factor out-of-range
//     Helium @0x3cd080 = { 0x04, 0x04, 0, 0 }   ; unsigned upper-bound for operation enum
//   (These are decoded from the x86_64 slice of the Mach-O fat binary; the RIP-
//   relative displacements at 0x8fa79, 0x8fa92 and 0x8fad1 all resolve into the
//   __TEXT,__const section at those three addresses.)
//
// ── FIELD LAYOUT (24 bytes, all u64) ──────────────────────────────────────────
//   +0x00  srcRgbFactor    : u64  (getSrcRGBFactor:   movq (rdi),%rax)
//   +0x08  dstRgbFactor    : u64  (getDstRGBFactor:   movq 0x8(rdi),%rax)
//   +0x10  srcAlphaFactor  : u64  (getSrcAlphaFactor: movq 0x10(rdi),%rax)
//   +0x18  dstAlphaFactor  : u64  (getDstAlphaFactor: movq 0x18(rdi),%rax)
//   +0x20  rgbOperation    : u64  (getRGBOperation:   movq 0x20(rdi),%rax)
//   +0x28  alphaOperation  : u64  (getAlphaOperation: movq 0x28(rdi),%rax)
//
//   The C2 ctor reads 24 bytes (three quadwords) from the source HGBlendingInfo
//   at (src+0x8), (src+0x10), (src+0x18) — each quadword is a *packed pair* of
//   u32 fields. The ctor VALIDATES/CLAMPS each 4-byte field using per-i32 SSE4
//   ops, then zero-extends each u32 to a u64 field in `this`.
//
// ── SOURCE HGBlendingInfo LAYOUT (recovered from ctor field reads) ────────────
//   +0x08 : u32 srcRgbFactor       (movq @0x8fa74 -> low 32 of xmm2, block A)
//   +0x0c : u32 dstRgbFactor       (high 32 of the same quadword)
//   +0x10 : u32 srcAlphaFactor     (movq @0x8faa7, block B)
//   +0x14 : u32 dstAlphaFactor
//   +0x18 : u32 rgbOperation       (movq @0x8fac8, block C)
//   +0x1c : u32 alphaOperation
//
// @class Helium HGMetalBlendingInfo
// @provenance Helium @0x8fa70 (C2), @0x8fb00 (C1), @0x8fb10..@0x8fb60 (getters),
//             @0x3cd060 (RGB/alpha factor ceiling), @0x3cd070 (factor fallback),
//             @0x3cd080 (operation ceiling)

/**
 * Constant table @Helium 0x3cd060 — RIP-relative movdqa target at @0x8fa79.
 * Per-i32 unsigned upper-bound used by the "factor" clamp branch: any factor
 * field whose value is >= 0x0d falls back to the value at 0x3cd070 (=1).
 * The upper two u32s are 0 (unused; only the low two u32s participate in the
 * pmaxud/pcmpeqd pipeline before pmovzxdq).
 *
 * @provenance Helium @0x3cd060 (mach-o __TEXT,__const, x86_64 slice)
 */
const K_FACTOR_UPPER_BOUND: number = 0x0d;

/**
 * Constant table @Helium 0x3cd070 — RIP-relative movaps target at @0x8fa92.
 * Per-i32 fallback used by `blendvps` when a factor is out-of-range.
 *
 * @provenance Helium @0x3cd070 (mach-o __TEXT,__const, x86_64 slice)
 */
const K_FACTOR_FALLBACK: number = 0x01;

/**
 * Constant table @Helium 0x3cd080 — RIP-relative movdqa target at @0x8fad1.
 * Per-i32 unsigned upper-bound used by the "operation" clamp branch. The
 * operation encoding uses a 1-based scheme (see the `paddd xmm3` pre-subtract
 * of 1 at @0x8facd), so this bounds the *decremented* value: max valid value
 * after `-1` is `< 4`, meaning original operation must lie in [1..4].
 *
 * @provenance Helium @0x3cd080 (mach-o __TEXT,__const, x86_64 slice)
 */
const K_OPERATION_UPPER_BOUND: number = 0x04;

/**
 * Shape of the source `HGBlendingInfo` struct as observed by the ctor.
 * All six fields are read as u32 quadwords at +0x8..+0x1c.
 * (Bytes 0..7 are consumed by the caller's HGBlendingInfo vtable/refcount
 * header — the ctor never touches them.)
 *
 * @provenance Helium @0x8fa74, @0x8faa7, @0x8fac8 (three `movq` reads from rsi)
 */
export interface HGBlendingInfoFieldsLite {
  /** +0x08 (u32) */
  srcRgbFactor: number;
  /** +0x0c (u32) */
  dstRgbFactor: number;
  /** +0x10 (u32) */
  srcAlphaFactor: number;
  /** +0x14 (u32) */
  dstAlphaFactor: number;
  /** +0x18 (u32) */
  rgbOperation: number;
  /** +0x1c (u32) */
  alphaOperation: number;
}

/**
 * `clampFactor` — bit-faithful port of the block A / block B SIMD lane.
 *
 * The SSE4 body at Helium @0x8fa79..@0x8faa3 for block A is:
 *
 *     movq    0x8(%rsi), %xmm2              ; xmm2.lo = { srcRgb, dstRgb } (two u32s)
 *     movdqa  K_FACTOR_UPPER_BOUND, %xmm1   ; xmm1 = { 0x0d, 0x0d, 0, 0 }
 *     movdqa  %xmm2, %xmm0                  ; xmm0 = xmm2
 *     pmaxud  %xmm1, %xmm0                  ; xmm0[i] = max(xmm0[i], xmm1[i])
 *     pcmpeqd %xmm2, %xmm0                  ; xmm0[i] = (xmm0[i]==xmm2[i]) ? -1 : 0
 *                                             i.e. mask = (val >= K_UB)
 *     pcmpeqd %xmm3, %xmm3                  ; xmm3 = all-ones (used later)
 *     movaps  K_FACTOR_FALLBACK, %xmm4      ; xmm4 = { 0x01, 0x01, 0, 0 }
 *     blendvps %xmm0, %xmm4, %xmm2          ; xmm2[i] = mask[i]&sign ? xmm4[i] : xmm2[i]
 *     pmovzxdq %xmm2, %xmm0                 ; zero-extend low 2×i32 to 2×i64
 *     movdqu  %xmm0, (%rdi)                 ; store u64,u64 into this+0x00
 *
 * The block B lane at @0x8faa7 is identical shape (reads (src+0x10), stores
 * at this+0x10) with xmm1 already loaded and xmm4 reused.
 *
 * Semantics: `val < 0x0d ? val : 1` per i32, zero-extended to u64.
 *
 * @provenance Helium @0x8fa79..@0x8faa3 (block A), @0x8faa7..@0x8fac3 (block B)
 */
function clampFactor(val: number): number {
  // `pmaxud xmm1, xmm0` + `pcmpeqd xmm2, xmm0` → mask := (val >= K_UB) as unsigned.
  // JS numbers are safe here: val is a u32 (>>> 0 forces the interpretation).
  const v = val >>> 0;
  const outOfRange = v >= (K_FACTOR_UPPER_BOUND >>> 0);
  // `blendvps xmm4, xmm2` with mask xmm0 sign — dst becomes xmm4 iff mask.
  // pmovzxdq zero-extends the i32 into a u64 (JS number range covers 0..0xd
  // and 1 trivially, so no BigInt is needed).
  return outOfRange ? K_FACTOR_FALLBACK : v;
}

/**
 * `clampOperation` — bit-faithful port of the block C SIMD lane.
 *
 * The SSE4 body at Helium @0x8fac8..@0x8faf8 is:
 *
 *     movq    0x18(%rsi), %xmm0             ; xmm0.lo = { rgbOp, alphaOp } (two u32s)
 *     paddd   %xmm3, %xmm0                  ; xmm3 = -1 per i32 → xmm0[i] = val - 1  (u32 wrap)
 *     movdqa  K_OPERATION_UPPER_BOUND,%xmm1 ; xmm1 = { 4, 4, 0, 0 }
 *     pmaxud  %xmm0, %xmm1                  ; xmm1[i] = max(xmm1[i], xmm0[i])
 *     pcmpeqd %xmm0, %xmm1                  ; xmm1[i] = (max==(val-1)) ? -1 : 0
 *                                             i.e. mask = (val-1 >= 4)      (out-of-range)
 *     pxor    %xmm3, %xmm1                  ; INVERT mask → in-range      (val-1 < 4)
 *     pmovsxdq %xmm1, %xmm1                 ; sign-ext the mask to 2×i64  (0/-1 → 0/-1)
 *     pmovzxdq %xmm0, %xmm0                 ; zero-ext (val-1) to 2×u64
 *     psubq   %xmm3, %xmm0                  ; xmm0 -= -1 → xmm0 += 1  → restore val
 *     pand    %xmm1, %xmm0                  ; keep val iff mask (in-range); else 0
 *     movdqu  %xmm0, 0x20(%rdi)             ; store u64,u64 to this+0x20
 *
 * Semantics per i32: `(val - 1) < 4 ? val : 0` in UNSIGNED arithmetic. Note the
 * subtract wraps: if val == 0 then val-1 == 0xFFFFFFFF ≥ 4 → mask off → 0. So
 * only original values in [1..4] pass through; every other value becomes 0.
 *
 * @provenance Helium @0x8fac8..@0x8faf8
 */
function clampOperation(val: number): number {
  const v = val >>> 0;
  const dec = (v - 1) >>> 0; // u32 wrap
  const inRange = dec < (K_OPERATION_UPPER_BOUND >>> 0);
  return inRange ? v : 0;
}

/**
 * HGMetalBlendingInfo — precomputed Metal-blend-state view of an HGBlendingInfo.
 *
 * The class exists to translate the higher-level HG blend enum values into
 * bit-clean Metal enum values by clamping out-of-range factor entries to `1`
 * (a safe passthrough choice for MTLBlendFactor) and forcing out-of-range
 * blend-operation entries to `0` (MTLBlendOperationAdd), which is FCP's default
 * fallback when a caller supplies an unknown operation.
 *
 * @provenance Helium @0x8fa70 (C2), @0x8fb00 (C1)
 */
export class HGMetalBlendingInfo {
  /**
   * `HGMetalBlendingInfo::HGMetalBlendingInfo(HGBlendingInfo const&)` — C2 body.
   * See the full SIMD transcription in the block A/B/C helpers above.
   *
   * The C1 entry @0x8fb00 is a tail-jmp:
   *
   *     0x8fb00  pushq %rbp; movq %rsp,%rbp
   *     0x8fb04  popq  %rbp
   *     0x8fb05  jmp   __ZN19HGMetalBlendingInfoC2ERK14HGBlendingInfo
   *
   * so both signatures share this body.
   *
   * @provenance Helium @0x8fa70 (C2), @0x8fb00 (C1)
   */
  srcRgbFactor: number;    // +0x00
  dstRgbFactor: number;    // +0x08
  srcAlphaFactor: number;  // +0x10
  dstAlphaFactor: number;  // +0x18
  rgbOperation: number;    // +0x20
  alphaOperation: number;  // +0x28

  constructor(src: HGBlendingInfoFieldsLite) {
    // Block A @0x8fa74..@0x8faa3: (src+0x8..+0x10) → this+0x00..+0x10
    this.srcRgbFactor = clampFactor(src.srcRgbFactor);
    this.dstRgbFactor = clampFactor(src.dstRgbFactor);
    // Block B @0x8faa7..@0x8fac3: (src+0x10..+0x18) → this+0x10..+0x20
    this.srcAlphaFactor = clampFactor(src.srcAlphaFactor);
    this.dstAlphaFactor = clampFactor(src.dstAlphaFactor);
    // Block C @0x8fac8..@0x8faf8: (src+0x18..+0x20) → this+0x20..+0x30
    this.rgbOperation = clampOperation(src.rgbOperation);
    this.alphaOperation = clampOperation(src.alphaOperation);
  }

  /**
   * @provenance Helium @0x8fb10  (movq (%rdi),%rax)
   */
  GetSrcRGBFactor(): number {
    return this.srcRgbFactor;
  }

  /**
   * @provenance Helium @0x8fb20  (movq 0x8(%rdi),%rax)
   */
  GetDstRGBFactor(): number {
    return this.dstRgbFactor;
  }

  /**
   * @provenance Helium @0x8fb30  (movq 0x10(%rdi),%rax)
   */
  GetSrcAlphaFactor(): number {
    return this.srcAlphaFactor;
  }

  /**
   * @provenance Helium @0x8fb40  (movq 0x18(%rdi),%rax)
   */
  GetDstAlphaFactor(): number {
    return this.dstAlphaFactor;
  }

  /**
   * @provenance Helium @0x8fb50  (movq 0x20(%rdi),%rax)
   */
  GetRGBOperation(): number {
    return this.rgbOperation;
  }

  /**
   * @provenance Helium @0x8fb60  (movq 0x28(%rdi),%rax)
   */
  GetAlphaOperation(): number {
    return this.alphaOperation;
  }
}
