// HGBMDFilmGen5LinearizationLUTInfo.ts — FCP Helium HGBMDFilmGen5LinearizationLUTInfo:
// Blackmagic Design "Film Gen 5" log → linear-light 1-D LUT descriptor.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// DECODE:    raw-port/re/disasm/Helium.HGBMDFilmGen5LinearizationLUTInfo.*.s
//            plus manual `awk` extraction of the .cold.1 tail (guard-variable initialiser).
//
// STRUCT LAYOUT (same shape as its sibling HGCanonLog2LinearizationLUTInfo, byte-for-byte):
//   sizeof = 0x28 (40 bytes). Allocated via `__Znwm(0x28)` in duplicate @0x115ade;
//   released via `__ZdlPv` in D0 (tail-jmp to operator delete, standard pattern).
//     +0x00  vtable ptr  (installed by ctor @0x1148d5-0x1148dc:
//                          `leaq 0x9085ec(%rip),%rax ; movq %rax,(%rbx)`)
//     +0x08 .. +0x27  inherited HGApplyNDLUTInfo state (32 bytes; ctor arguments
//                     `(unsigned long, unsigned long=1, float, float, LUTStorageFormat)`.
//                     The wrapper ctor forces the second `unsigned long` to 1 via
//                     `movl $0x1, %edx` @0x1148cb — 1-D LUT.)
//
// EXPORTED SYMBOLS:
//   @Helium 0x00000000001148c0  ctor  (unsigned long, float, float, LUTStorageFormat)  [C2]
//   @Helium 0x0000000000114 (C1 is the mangled __ZN33...C1 — same body, tail-jumps to C2 in the
//                            standard Itanium-ABI dual-emit; extracted by symbol map above.)
//   @Helium 0x00000000001148f0  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x0000000000114940  colorAtIndex(float, float, float, float*, float*, float*, float*) const
//   @Helium 0x00000000003c41c0  colorAtIndex.cold.1 (guard-variable initialiser for `tl`)
//   @Helium 0x0000000000115ad0  duplicate() const  →  new heap-allocated shallow copy
//   D0/D1 dtors — trivial (in-place + operator-delete tail); no derived-class state.
//
// RUNTIME STATIC LOCAL:
//   @Helium 0x0000000000ade200  __ZZNK33HGBMDFilmGen5LinearizationLUTInfo12colorAtIndex...E2tl
//     the `double tl` used as the linear/exp branch threshold. Initialised exactly once by
//     `.cold.1` @0x3c41c4-0x3c41ed (guarded by __cxa_guard_acquire/release at
//     __ZGVZ...E2tl @0xade208):
//         movabsq $0x3fc1231a92e93780, %rax   ; tl = 0.13388378308667015
//         movq    %rax, tl(%rip)
//   The hot path checks the guard byte with `movzbl guard(%rip),%eax; testb %al,%al; je cold`
//   (@0x11495b-0x114964) — on cold path the initialiser runs, then the same computation is
//   re-entered @0x114a04. In TS the JS runtime handles module-level `const` init, so we don't
//   need the guard shim; we hard-code the initialiser's exact fp64 value below.
//
// SEMANTICS (from colorAtIndex disasm):
//   The BMD Film Gen 5 → linear transfer function is a piecewise curve applied identically to
//   every input channel — only the first argument (r) matters, and the result is broadcast to
//   R, G, B; alpha is set to 1.0f.
//
//   Let x = (double)r.
//     u  = x                                          (canonical value entering the pw branch)
//     if x < kMinLogGamma:  u = kMinLogGamma          (lower clamp)  @0x11496e..@0x11497a
//     elif x > kMaxLogGamma: u = kMaxLogGamma         (upper clamp)  @0x11497c..@0x11498a
//
//     if u < tl:              # linear (below-threshold) branch     @0x11499a..@0x1149ac
//       y = (u + K4) / K5
//     else:                   # exp (above-threshold) branch        @0x1149ae..@0x1149c3
//       y = exp( (u + K6) / K7 ) + K8
//
//     y = y / K9                                                    @0x1149cb
//     store y (as fp32) to *R, *G, *B; store 1.0f to *A             @0x1149d3..@0x1149e7
//
//   With the recovered constants this is exactly Blackmagic Design's published Film Gen 5
//   log-to-linear formula: a linear segment for values near 0 and a natural-exp segment for
//   values above ~0.134 (the crossover point `tl`), with the segments continuous at the
//   threshold. All constants are IEEE-754 fp64 bit-patterns read directly from the binary.
//
// FRONTIER (deferred — cited as throwing stubs below):
//   • HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, LUTStorageFormat)
//     — base ctor called @0x1148d0.
//   • HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const — tail-called @0x11492a.
//   • __dynamic_cast — libc++abi RTTI helper called @0x114914 inside isEqual.
//   • __Znwm / __ZdlPv — operator new / delete.
//   • _exp — libm scalar fp64 natural exponential — called @0x1149be inside colorAtIndex.
//
// The vtable slot at @0x9085ec(%rip) (from @0x1148d5) is the class's own vtable — its member
// pointers (D0, D1, isEqual, colorAtIndex, duplicate, plus base's virtual slots) are installed
// by the linker; the class-specific ctor only stamps this pointer at +0x00.

/**
 * HGApplyNDLUTInfo — opaque handle to the (undecoded) base class. Shared with the sibling
 * HGCanonLog2LinearizationLUTInfo.ts (see there for the same pattern's rationale).
 *
 * @Helium 0x1148d0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 */
export interface HGApplyNDLUTInfo_base {
  readonly __brand_HGApplyNDLUTInfo: unique symbol;
}

/**
 * HGApplyNDLUTInfo::LUTStorageFormat — a small enum passed as `int32` (%ecx in the base
 * ctor call). Not decoded here; passed through as opaque number.
 */
export type LUTStorageFormat = number;

/**
 * HGLUTCache::LUTInfo — opaque base-class handle. Only observed via `__dynamic_cast` in
 * `isEqual` @0x114914.
 *
 * @Helium __ZTIN10HGLUTCache7LUTInfoE  (literal-pool ref @0x1148fe).
 */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

// ── Recovered fp64 constants ──────────────────────────────────────────────────────────────
// Every constant is a bit-identical read from the Helium x86_64 slice via
// `resolve.py Helium const 0x<va>`. Values are IEEE-754 fp64 and are used as fp64 in the
// disasm (the input `r` is widened via cvtss2sd before any arithmetic).
//
// clang-format off
const kMinLogGamma = -0.0730593607305936;                    // @Helium __literal8 0x3d4aa8  (u64 0xbfb2b404ad012b40)
const kMaxLogGamma =  1.0947488584474885;                    // @Helium __literal8 0x3d4a98  (u64 0x3ff184176105d841)

/**
 * `tl` — the branch threshold between the linear and exp segments. Initialised exactly once
 * at runtime by `colorAtIndex.cold.1` @0x3c41d4:
 *   `movabsq $0x3fc1231a92e93780, %rax ; movq %rax, tl(%rip)`.
 * Bit-pattern u64 0x3fc1231a92e93780 → fp64 0.13388378308667015 (verified via python struct).
 */
const tl_threshold = 0.13388378308667015;                    // @Helium bss 0xade200; init @0x3c41d4

// Linear branch (u < tl):  y = (u + K4) / K5
const K4_lin_add   = -0.09246575342465753;                   // @Helium __literal8 0x3d4bf0  (u64 0xbfb7abd5eaf57abd)
const K5_lin_div   =  8.283605932402494;                     // @Helium __literal8 0x3d4bf8  (u64 0x40209134cbf93d98)

// Exp branch (u >= tl):    y = exp((u + K6) / K7) + K8
const K6_exp_add   = -0.5300133392291939;                    // @Helium __literal8 0x3d4bd8  (u64 0xbfe0f5de88cddc4c)
const K7_exp_div   =  0.08692876065491224;                   // @Helium __literal8 0x3d4be0  (u64 0x3fb640f698183b9d)
const K8_post_exp  = -0.005494072432257808;                  // @Helium __literal8 0x3d4be8  (u64 0xbf7680f3d6b1c6c7)

// Final divisor for both branches.
const K9_final_div =  0.9;                                   // @Helium __literal8 0x3d0e50  (u64 0x3feccccccccccccd)
// clang-format on

// Bit-pattern for 1.0f — the alpha write @0x1149e7 (`movl $0x3f800000, (%rbx)`).
const ALPHA_ONE = Math.fround(1.0);   // == reinterpret_cast<float>(0x3f800000)

// ── Frontier stubs ───────────────────────────────────────────────────────────────────────

/**
 * `HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, LUTStorageFormat)`
 * @Helium 0x1148d0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *
 * The wrapper ctor forces `unsigned long #2 = 1` via `movl $0x1, %edx` @0x1148cb before this
 * call (this LUT is 1-D).
 */
function HGApplyNDLUTInfo_base_ctor_stub(
  _self: HGApplyNDLUTInfo_base,
  _dim0: bigint,
  _dim1_forced_to_1: bigint,
  _min: number,
  _max: number,
  _storage: LUTStorageFormat,
): void {
  throw new Error(
    "raise: HGApplyNDLUTInfo::HGApplyNDLUTInfo(m,m,f,f,LUTStorageFormat) base ctor " +
      "@Helium 0x1148d0 is not yet decoded — see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * `HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const`
 * @Helium 0x11492a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
 */
function HGApplyNDLUTInfo_base_isEqual_stub(
  _self: HGApplyNDLUTInfo_base,
  _other: HGApplyNDLUTInfo_base,
): boolean {
  throw new Error(
    "raise: HGApplyNDLUTInfo::isEqual @Helium 0x11492a is not yet decoded — the shared " +
      "HGApplyNDLUTInfo base layout hasn't been transcribed.",
  );
}

/**
 * `__dynamic_cast` — libc++abi Itanium-ABI RTTI helper called @0x114914 inside isEqual.
 *
 * The port cannot faithfully re-implement Itanium RTTI without the full HGLUTCache class
 * hierarchy in hand. Raises — mirroring the sibling HGCanonLog2LinearizationLUTInfo.ts.
 */
function dynamicCast_stub(
  _src: HGLUTCache_LUTInfo,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): HGApplyNDLUTInfo_base | null {
  throw new Error(
    "___dynamic_cast @Helium 0x114914 is not yet ported — the HGLUTCache::LUTInfo class " +
      "hierarchy has no JS-side RTTI shim yet.",
  );
}

/**
 * `exp(x)` — libm scalar fp64 natural exponential. Called @0x1149be inside colorAtIndex.
 * Faithful to libm's fp64 semantics: JS `Math.exp` is IEEE-754 double natural exponential.
 */
function exp_libm(x: number): number {
  return Math.exp(x);
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class HGBMDFilmGen5LinearizationLUTInfo {
  /** +0x00 — vtable ptr @Helium 0x9085ec(%rip) — represented as a class-level tag. */
  readonly __vtable = "HGBMDFilmGen5LinearizationLUTInfo::vtable @Helium 0x9085ec";

  /** +0x08..+0x27 — inherited HGApplyNDLUTInfo state (opaque, owned by the base sub-object). */
  readonly base: HGApplyNDLUTInfo_base;

  /**
   * ctor(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
   * @Helium 0x00000000001148c0  (__ZN33HGBMDFilmGen5LinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE:
   *   0x1148c6  movl %edx, %ecx        → LUTStorageFormat (arg4, edx) into ecx (arg5 to base)
   *   0x1148c8  movq %rdi, %rbx        → save `this`
   *   0x1148cb  movl $0x1, %edx        → base's dim1 = 1 (1-D LUT)
   *   0x1148d0  callq base C2         → HGApplyNDLUTInfo(this, dim0=arg1(rsi), dim1=1,
   *                                                       min=arg2(xmm0), max=arg3(xmm1),
   *                                                       storage=arg4(ecx))
   *   0x1148d5  leaq 0x9085ec(%rip),%rax → load class vtable pointer
   *   0x1148dc  movq %rax, (%rbx)      → install vtable
   *   0x1148df  addq $0x8, %rsp ; popq %rbx ; popq %rbp ; retq
   */
  constructor(
    dim0: bigint,
    minF: number,
    maxF: number,
    storage: LUTStorageFormat,
  ) {
    const base = { __brand_HGApplyNDLUTInfo: Symbol("HGApplyNDLUTInfo") } as unknown as HGApplyNDLUTInfo_base;
    // @0x1148d0 — base ctor with dim1 forced to 1.
    HGApplyNDLUTInfo_base_ctor_stub(base, dim0, 1n, minF, maxF, storage);
    this.base = base;
  }

  /**
   * isEqual(HGLUTCache::LUTInfo*) const → bool
   * @Helium 0x00000000001148f0  (__ZNK33HGBMDFilmGen5LinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE)
   *
   * DECODE (identical structural shape to HGCanonLog2LinearizationLUTInfo::isEqual):
   *   0x1148f6  testq %rsi,%rsi ; je   → null-check `other` → false
   *   0x1148fe  movq &HGLUTCache::LUTInfo::typeinfo(%rip),%rax   → srcType
   *   0x114905  leaq &HGBMDFilmGen5LinearizationLUTInfo::typeinfo(%rip),%rdx → dstType
   *   0x114914  callq ___dynamic_cast(other, srcTI, dstTI, hint=0)
   *   0x114919  testq %rax,%rax ; je   → if cast failed → false
   *   0x11492a  jmp   HGApplyNDLUTInfo::isEqual(this, cast_other)   (tail call)
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    // 0x1148f6-0x1148f9 — null → false
    if (other === null) return false;
    // 0x114914 — ___dynamic_cast(other, HGLUTCache::LUTInfo, HGBMDFilmGen5LinearizationLUTInfo, 0)
    const cast = dynamicCast_stub(
      other,
      "HGLUTCache::LUTInfo",                              // srcTypeInfo @0x1148fe
      "HGBMDFilmGen5LinearizationLUTInfo",                // dstTypeInfo @0x114905
    );
    // 0x114919-0x11491c — if cast failed → false
    if (cast === null) return false;
    // 0x11492a — jmp base isEqual(this, cast)
    return HGApplyNDLUTInfo_base_isEqual_stub(this.base, cast);
  }

  /**
   * colorAtIndex(float, float, float, float*, float*, float*, float*) const
   * @Helium 0x0000000000114940  (__ZNK33HGBMDFilmGen5LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_)
   *
   * DECODE (see file header for full semantic derivation):
   *
   * ── Guard-variable gate for the static local `tl` ──
   *   0x11495b  movzbl __ZGV…E2tl(%rip), %eax
   *   0x114962  testb %al, %al
   *   0x114964  je   cold_init                             ; first-time init at 0x1149fa
   *
   * ── Main body @0x11496a ──
   *   0x11496a  cvtss2sd %xmm0, %xmm1                      ; xmm1 = (double)r
   *   0x11496e  movsd K0=kMin(-0.0731), %xmm0              ; xmm0 = kMin
   *   0x114976  ucomisd %xmm1, %xmm0                        ; cmp kMin vs x
   *   0x11497a  ja 0x114992                                 ; if kMin > x → clamp low, jump to tl-check
   *                                                          ;   (fall-through leaves xmm0=kMin
   *                                                          ;    which is what we want)
   *   0x11497c  ucomisd K1=kMax(1.0947), %xmm1              ; cmp x vs kMax
   *   0x114984  movapd %xmm1, %xmm0                         ; xmm0 = x  (unclamped)
   *   0x114988  jbe 0x114992                                ; if x <= kMax → tl-check with xmm0=x
   *   0x11498a  movsd K2=kMax(1.0947), %xmm0                ; else (x > kMax): xmm0 = kMax (upper clamp)
   *
   *   ── tl-branch dispatch @0x114992 ──
   *   0x114992  ucomisd tl(0.1339), %xmm0                   ; cmp xmm0 vs tl
   *   0x11499a  jae 0x1149ae                                ; if xmm0 >= tl → exp branch
   *                                                          ; else fall-through to linear branch
   *
   *   ── Linear branch (u < tl) @0x11499c ──
   *   0x11499c  addsd K4(-0.09247), %xmm0                   ; xmm0 = u - 0.09247
   *   0x1149a4  divsd K5(8.2836), %xmm0                     ; xmm0 /= 8.2836
   *   0x1149ac  jmp 0x1149cb                                ; skip exp branch, go to final divide
   *
   *   ── Exp branch (u >= tl) @0x1149ae ──
   *   0x1149ae  addsd K6(-0.5300), %xmm0                    ; xmm0 = u - 0.5300
   *   0x1149b6  divsd K7(0.08693), %xmm0                    ; xmm0 /= 0.08693
   *   0x1149be  callq _exp                                  ; xmm0 = exp(xmm0)
   *   0x1149c3  addsd K8(-0.005494), %xmm0                  ; xmm0 -= 0.005494
   *
   *   ── Final divide + fp32 narrow + broadcast + alpha=1 ──
   *   0x1149cb  divsd K9(0.9), %xmm0                        ; xmm0 /= 0.9
   *   0x1149d3  cvtsd2ss %xmm0, %xmm0                       ; narrow fp64 → fp32
   *   0x1149d7  movss %xmm0, (%r12)                          ; *R = y
   *   0x1149dd  movss %xmm0, (%r15)                          ; *G = y
   *   0x1149e2  movss %xmm0, (%r14)                          ; *B = y
   *   0x1149e7  movl $0x3f800000, (%rbx)                     ; *A = 1.0f
   *
   * Comparison-flag decoding:
   *   `ucomisd %xmm1, %xmm0` sets flags as "compare xmm0 to xmm1": CF=(xmm0<xmm1), ZF=(xmm0==xmm1).
   *   `ja` fires on CF=0 & ZF=0 → xmm0 > xmm1. So `ja` @0x11497a → "kMin > x", i.e. x < kMin.
   *   `ucomisd mem, %xmm1` @0x11497c sets flags as "xmm1 vs mem": CF=(xmm1<mem).
   *   `jbe` fires on CF=1|ZF=1 → xmm1 ≤ mem, i.e. x ≤ kMax.
   *   `ucomisd mem, %xmm0` @0x114992: CF=(xmm0<mem). `jae` fires on CF=0 → xmm0 ≥ mem, i.e. u ≥ tl.
   *
   * The `.cold.1` path at @0x1149fa..@0x114a1f re-enters the body after guard init. It reloads
   * `r` from stack, re-widens to double, and:
   *   - if kMin ≤ x (i.e. `jbe 0x11497c`)   → re-enter at @0x11497c (the kMax bounds check)
   *   - else                                  → jmp @0x114992 with xmm0=kMin (lower-clamp path)
   * i.e. the same branch structure — the guard just gates first-run initialisation of `tl`. In
   * JS the runtime handles module-init, so we drop the guard shim entirely; `tl_threshold` is
   * a const module-level fp64.
   *
   * @param r      the input scalar (fp32 arg, widened to fp64 on entry).
   * @param _g     ignored (unused by the disasm — only `r` matters).
   * @param _b     ignored.
   * @param rOut   *R output slot — receives y.
   * @param gOut   *G output slot — receives y.
   * @param bOut   *B output slot — receives y.
   * @param aOut  *A output slot — receives 1.0f.
   */
  colorAtIndex(
    r: number,
    _g: number,
    _b: number,
    rOut: { value: number },
    gOut: { value: number },
    bOut: { value: number },
    aOut: { value: number },
  ): void {
    // @0x11496a — cvtss2sd on the fp32 input. Math.fround captures the fp32-argument width.
    const x = Math.fround(r);   // fp32 exactly representable in fp64

    // ── Compute clamped `u` ──
    // @0x11496e..@0x11497a  if x < kMin → u = kMin (lower clamp).
    // @0x11497c..@0x11498a  if x > kMax → u = kMax (upper clamp).
    // Faithful `ucomisd` NaN-handling: `ja` and `jbe` are unordered-behaviour opposites.
    // On NaN both `ja` and `jbe` DO NOT fire → the code falls through both branches, leaving
    // xmm0 = kMax (from @0x11498a). We mirror by using a chained conditional that also lands
    // in the upper-clamp case for NaN (JS `<`, `>` return `false` on NaN, matching the CPU
    // "unordered" fall-through).
    let u: number;
    if (!(x >= kMinLogGamma)) {
      // `ja` @0x11497a fires when kMin > x. If x is NaN, ja does NOT fire (CF=1, ZF=1 on
      // unordered → jbe would fire, ja would not) — the disasm's fall-through then takes
      // the "else" path at @0x11497c which loads xmm0 = x (NaN). We surface NaN in `u`.
      // Faithful branch: strict `x < kMin` → clamp; otherwise → keep `x`.
      // In JS: `!(x >= kMin)` is true for x<kMin AND for NaN. But at the CPU level, NaN
      // falls through to the `movapd xmm1,xmm0; jbe 0x114992` where jbe does fire on NaN
      // (unordered → CF=1, jbe fires) → xmm0 = NaN carries into the tl-check. So for NaN
      // we want u = NaN. Split explicitly:
      if (x < kMinLogGamma) {
        u = kMinLogGamma;
      } else {
        // NaN path: `ja` doesn't fire, `jbe` fires with xmm0=x=NaN → u=NaN.
        u = x;
      }
    } else if (x > kMaxLogGamma) {
      // @0x11497c..@0x11498a — upper clamp.
      u = kMaxLogGamma;
    } else {
      // kMin ≤ x ≤ kMax — unclamped.
      u = x;
    }

    // ── @0x114992: tl-branch dispatch ──
    let y: number;
    if (u >= tl_threshold) {
      // ── Exp branch @0x1149ae..@0x1149c3 ──
      // @0x1149ae  addsd K6 (−0.5300) → u + K6
      // @0x1149b6  divsd K7 (0.08693) → (u + K6) / K7
      // @0x1149be  callq _exp         → exp((u + K6) / K7)
      // @0x1149c3  addsd K8 (−0.005494) → exp(...) + K8
      y = exp_libm((u + K6_exp_add) / K7_exp_div) + K8_post_exp;
    } else {
      // ── Linear branch (u < tl OR u == NaN falls into the linear branch too via CF=1
      //     on `jae` unordered — but we already surfaced NaN through `u = NaN` above, and
      //     `NaN >= tl` is `false` in JS, matching `jae` NOT firing on unordered) ──
      // @0x11499c  addsd K4 (−0.09247) → u + K4
      // @0x1149a4  divsd K5 (8.2836)   → (u + K4) / K5
      y = (u + K4_lin_add) / K5_lin_div;
    }

    // @0x1149cb  divsd K9 (0.9) → y /= 0.9  (shared final divide for both branches)
    const y_scaled = y / K9_final_div;
    // @0x1149d3  cvtsd2ss — narrow fp64 → fp32.
    const y_f32 = Math.fround(y_scaled);

    // @0x1149d7..@0x1149e7 — broadcast y to R/G/B; alpha = 1.0f.
    rOut.value = y_f32;
    gOut.value = y_f32;
    bOut.value = y_f32;
    aOut.value = ALPHA_ONE;
  }

  /**
   * ~HGBMDFilmGen5LinearizationLUTInfo()  — D1 (in-place) destructor.
   *   @Helium 0x115ab0 (__ZN33HGBMDFilmGen5LinearizationLUTInfoD1Ev)
   *
   * The address is now RESOLVED (it was "per symbol map" here before) and the
   * body re-derived from the binary — it is genuinely EMPTY:
   *
   *   0x115ab0  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x115ab1  movq  %rsp, %rbp
   *   0x115ab4  popq  %rbp
   *   0x115ab5  retq
   *   0x115ab6  nopw  %cs:(%rax,%rax)      ; padding, not executed
   *
   * No member teardown, no callee, no store — the class owns nothing that needs
   * releasing. Verified on the live function: called on 64 poisoned heap blocks
   * it modified ZERO bytes (64/64). In TS with GC this is a no-op, and that is
   * the faithful reading rather than an assumption.
   */
  destruct_D1(): void {
    // @0x115ab4/@0x115ab5 — popq %rbp ; retq. The whole body: nothing happens.
  }

  /**
   * ~HGBMDFilmGen5LinearizationLUTInfo()  — D0 (deleting) destructor.
   *   @Helium 0x115ac0 (__ZN33HGBMDFilmGen5LinearizationLUTInfoD0Ev)
   *
   * The address is now RESOLVED and the body re-derived:
   *
   *   0x115ac0  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x115ac1  movq  %rsp, %rbp
   *   0x115ac4  popq  %rbp                 ; frame torn down BEFORE the jump —
   *                                        ; the mark of a tail call
   *   0x115ac5  jmp   0x3c4fa0             ## symbol stub for: __ZdlPv
   *                                        ; = operator delete(void*), %rdi
   *                                        ; still holding `this`
   *   0x115aca  nopw  (%rax,%rax)          ; padding, not executed
   *
   * Per the Itanium C++ ABI a D0 is "run D1, then operator delete the storage".
   * Here the D1 half has been optimised away entirely — not omitted by the
   * disassembler — because D1 @0x115ab0 is empty (see above), so the entire
   * observable effect is the deallocation. `operator delete` is a libc++ runtime
   * extern, OUTSIDE the five in-scope frameworks, so per DEP_WORKER_BRIEF it is
   * modelled as the boundary stub `_operator_delete` below rather than
   * transcribed.
   *
   * ORACLE (raw-port/re/oracle/HGBMDFilmGen5LinearizationLUTInfo_D0_oracle.py):
   * both symbols are LOCAL (`nm` type `t`), unreachable by dlsym, so they are
   * called at `dyld slide + vmaddr` through ozone_loader.py under
   * `arch -x86_64`. Over 64 malloc'd 0xA5-poisoned blocks: D1 changed no byte
   * (64/64), and after D0 `malloc_size(p)` was 0 in 64/64 while a control block
   * never passed to D0 still reported a non-zero size. (Allocator address REUSE
   * is measured by no verdict anywhere in this repo — it is run-dependent; see
   * OPS_LOG.)
   */
  destruct_D0(): void {
    // @0x115ac4/@0x115ac5 — popq %rbp ; jmp __ZdlPv : tail-call
    //   operator delete(this). No member teardown precedes it (D1 @0x115ab0 is
    //   empty), and the argument is the unmodified `this` from %rdi.
    _operator_delete(this);
  }

  /**
   * duplicate() const → HGBMDFilmGen5LinearizationLUTInfo*
   * @Helium 0x0000000000115ad0  (__ZNK33HGBMDFilmGen5LinearizationLUTInfo9duplicateEv)
   *
   * DECODE:
   *   0x115ad6  movq %rdi, %rbx           ; save `this`
   *   0x115ad9  movl $0x28, %edi          ; sizeof = 40 bytes
   *   0x115ade  callq __Znwm              ; operator new(0x28) → rax
   *   0x115ae3  movups 0x8(%rbx), %xmm0   ; 16B from this+0x08
   *   0x115ae7  movups 0x14(%rbx), %xmm1  ; 16B from this+0x14 (overlaps xmm0's tail — see
   *                                          HGCanonLog2… twin for identical pattern)
   *   0x115aeb  movups %xmm0, 0x8(%rax)   ; write to new+0x08
   *   0x115aef  movups %xmm1, 0x14(%rax)  ; write to new+0x14 (together they cover 0x08..0x27)
   *   0x115af3  leaq 0x9073ce(%rip),%rcx  ; class vtable ptr
   *   0x115afa  movq %rcx, (%rax)         ; write vtable at new+0x00
   *   0x115afd  retq
   *
   * Semantics: heap-allocated shallow byte-copy of `this` — the base sub-object's 32 bytes are
   * duplicated verbatim, then the derived vtable pointer is stamped.
   *
   * In TS with GC-managed objects: allocate a new instance via `Object.create(prototype)` and
   * share the same `base` handle reference (the base state is opaque to us — until
   * HGApplyNDLUTInfo is transcribed we can't do a true byte-copy).
   */
  duplicate(): HGBMDFilmGen5LinearizationLUTInfo {
    // Can't call the ctor here (raises through the base stub). Mirror the disasm's
    // "allocate + byte-copy + stamp vtable" via Object.create + reference-copy.
    const copy = Object.create(HGBMDFilmGen5LinearizationLUTInfo.prototype) as HGBMDFilmGen5LinearizationLUTInfo;
    // @0x115ae3..@0x115aef — shallow-copy the base sub-object (opaque; modeled as ref-share).
    (copy as unknown as { base: HGApplyNDLUTInfo_base }).base = this.base;
    // @0x115af3..@0x115afa — vtable install, implicit via `Object.create(prototype)`.
    return copy;
  }
}

/**
 * Vtable address (used as an identity marker only — the concrete slot layout follows
 * HGApplyNDLUTInfo's ABI and is inherited).
 *
 * @Helium 0x9085ec  (ctor `leaq 0x9085ec(%rip), %rax`)
 */
export const HGBMDFilmGen5LinearizationLUTInfo_vtable_addr = "@Helium 0x9085ec" as const;

/**
 * libc++ `void operator delete(void *ptr)` — reached through the mach-o symbol
 * stub at @Helium 0x3c4fa0; the call site is the tail `jmp` @0x115ac5 in the D0
 * destructor. A C++ runtime extern, outside the five in-scope frameworks, so it
 * is modelled as a boundary stub: JS objects are garbage-collected, and the
 * machine's only guarantee is that the storage is released and must not be
 * dereferenced again. Kept as a named function so the call site's provenance
 * survives in the port.
 */
function _operator_delete(_ptr: HGBMDFilmGen5LinearizationLUTInfo): void {
  // @Helium 0x3c4fa0 (symbol stub for: __ZdlPv) — libc++ extern, no-op in JS.
  void _ptr;
}
