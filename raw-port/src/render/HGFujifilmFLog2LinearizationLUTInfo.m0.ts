// raw-port: HGFujifilmFLog2LinearizationLUTInfo (chunk m0) — Helium.framework (render layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework
//                   /Versions/A/Helium  (x86_64 slice).
//
// Class-methods reference range (from ledger + assemble_class chunk map):
//   @Helium 0x00114f20  ctor (unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
//   @Helium 0x00114f50  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x00114fa0  colorAtIndex(float, float, float, float*, float*, float*, float*) const
//   @Helium 0x00115c30  D1  (~HGFujifilmFLog2LinearizationLUTInfo — in-place, trivial)
//   @Helium 0x00115c40  D0  (deleting, tail-calls operator delete)
//   @Helium 0x00115c50  duplicate() const
//   @Helium 0x003c4380  colorAtIndex(...).cold.1   (lazy-init: static `cut2`)
//   @Helium 0x003c43c0  colorAtIndex(...).cold.2   (lazy-init: static `cc`)
//
// See HGCanonLog2LinearizationLUTInfo.ts for the identical struct-layout pattern.

/** Opaque base class handle. @Helium 0x114f30 base C2 ctor. */
export interface HGApplyNDLUTInfo_base {
  readonly __brand_HGApplyNDLUTInfo: unique symbol;
}
export type LUTStorageFormat = number;
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

// Function-local static doubles (Itanium lazy-init in cold.1/cold.2):
//   @Helium 0x3c4394 movabsq $0x3fb9c69a8fa91ff2 → cut2
//   @Helium 0x3c43d4 movabsq $0x4022c66b961c7a0c → cc
export const HGFujifilmFLog2LinearizationLUTInfo_cut2 = 0.10068670279827055;  // @Helium 0x3c4394
export const HGFujifilmFLog2LinearizationLUTInfo_cc   = 9.387539568878331;    // @Helium 0x3c43d4

// RIP-relative fp64 constants (resolved via resolve.py Helium const):
const K_neg_a       = -0.092864;                    // @Helium 0x3d4c60
const K_b           =  8.799461;                    // @Helium 0x3d4c80
const K_one_f32     =  Math.fround(1.0);            // @Helium 0x3c7cc0
const K_one_f64     =  1.0;                         // @Helium 0x3ca260
const K_neg_d       = -0.384316;                    // @Helium 0x3d4c70
const K_neg_e       = -0.064829;                    // @Helium 0x3d4c78
const K_inv_gain_num = 5.555555555555555;           // @Helium 0x3d0e58
const K_gain_den    =  0.9;                         // @Helium 0x3d0e50
const ALPHA_ONE = Math.fround(1.0);                 // @Helium 0x11508b movl $0x3f800000

// Frontier stubs (Rule 3):
function HGApplyNDLUTInfo_base_ctor_stub(
  _self: HGApplyNDLUTInfo_base, _dim0: bigint, _dim1_forced_to_1: bigint,
  _min: number, _max: number, _storage: LUTStorageFormat,
): void {
  throw new Error(
    "raise: HGApplyNDLUTInfo::HGApplyNDLUTInfo base ctor @Helium 0x114f30 not yet decoded",
  );
}
function HGApplyNDLUTInfo_base_isEqual_stub(
  _self: HGApplyNDLUTInfo_base, _other: HGApplyNDLUTInfo_base,
): boolean {
  throw new Error(
    "raise: HGApplyNDLUTInfo::isEqual @Helium 0x114f8a not yet decoded",
  );
}
function dynamicCast_stub(
  _src: HGLUTCache_LUTInfo, _srcTI: string, _dstTI: string,
): HGApplyNDLUTInfo_base | null {
  throw new Error(
    "___dynamic_cast @Helium 0x114f74 not yet ported; do NOT weaken this stub",
  );
}
function exp_libm(x: number): number { return Math.exp(x); }

export class HGFujifilmFLog2LinearizationLUTInfo {
  readonly __vtable = "HGFujifilmFLog2LinearizationLUTInfo::vtable @Helium 0x9080cc";
  readonly base: HGApplyNDLUTInfo_base;

  /**
   * ctor @Helium 0x00114f20. Body:
   *   0x114f26 movl %edx,%ecx     (storage→ecx)
   *   0x114f28 movq %rdi,%rbx     (this→rbx)
   *   0x114f2b movl $0x1,%edx     (force dim1=1 → 1D LUT)
   *   0x114f30 callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *   0x114f35 leaq 0x9080cc(%rip),%rax  (class vtable)
   *   0x114f3c movq %rax,(%rbx)   (install vtable)
   */
  constructor(dim0: bigint, minF: number, maxF: number, storage: LUTStorageFormat) {
    const base = { __brand_HGApplyNDLUTInfo: Symbol("HGApplyNDLUTInfo") } as unknown as HGApplyNDLUTInfo_base;
    HGApplyNDLUTInfo_base_ctor_stub(base, dim0, 1n, minF, maxF, storage);
    this.base = base;
  }

  /**
   * isEqual @Helium 0x00114f50. Body:
   *   0x114f56 testq %rsi,%rsi ; je → false
   *   0x114f5e movq srcTI ; 0x114f65 leaq dstTI
   *   0x114f74 callq ___dynamic_cast
   *   0x114f79 testq %rax,%rax ; je → false
   *   0x114f8a jmp HGApplyNDLUTInfo::isEqual (tail-call)
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    if (other === null) return false;                                     // @0x114f56
    const cast = dynamicCast_stub(
      other, "HGLUTCache::LUTInfo",                                       // @0x114f5e
      "HGFujifilmFLog2LinearizationLUTInfo",                              // @0x114f65
    );                                                                    // @0x114f74
    if (cast === null) return false;                                      // @0x114f79
    return HGApplyNDLUTInfo_base_isEqual_stub(this.base, cast);           // @0x114f8a
  }

  /**
   * colorAtIndex @Helium 0x00114fa0. Full disasm in re/disasm/. Semantics: Fujifilm F-Log2 →
   * linear decode. Only the first color channel `r` is used; result broadcast to R/G/B; A=1.0f.
   *
   * Branch tree (r is fp32 arg xmm0, moved to xmm2 @0x114fbb):
   *   r < 0 (or NaN)   → y = (0 + K_neg_a) / K_b / K_gain_den            (constant lower clamp)
   *   r > 1            → y = (exp((1.0 + K_neg_d)*cc) + K_neg_e)/5.5555/0.9  (upper clamp)
   *   0 <= r < cut2    → y = (r + K_neg_a) / K_b / K_gain_den              (LINEAR branch)
   *   cut2 <= r <= 1   → y = (exp((r + K_neg_d)*cc) + K_neg_e)/5.5555/0.9  (LOG branch)
   * All /5.5555 = *0.18 (5.5555 = 100/18).
   *
   * Full addr trail:
   *   @0x114fbb  movaps %xmm0,%xmm2 (xmm2=r)
   *   @0x114fbe..0x114fd2  lazy-init cut2/cc via cold.1/cold.2 (guard-variable protocol)
   *   @0x114fd4  xorps %xmm0,%xmm0
   *   @0x114fd7  xorps %xmm1,%xmm1
   *   @0x114fda  ucomiss %xmm2,%xmm1
   *   @0x114fdd  jbe 0x11502f       (jump if 0 <= r)
   *   [r < 0 branch:]
   *     @0x114fdf ucomisd cut2,xmm0 ; @0x114fe7 jae → skipped
   *     @0x114fe9 addsd -0.092864 ; @0x114ff1 divsd 8.799461 ; @0x114ff9 jmp 0x11506f
   *   [r >= 0:]
   *     @0x11502f ucomiss 1.0f,xmm2 ; @0x115036 jbe → to 0x11509e (in-range)
   *     [r > 1 branch:]
   *       @0x115038 movsd 1.0(dbl),xmm0
   *       @0x115040 ucomisd cut2,xmm0 ; @0x115048 jb → NOT taken
   *       @0x11504a addsd -0.384316 ; @0x115052 mulsd cc
   *       @0x11505a call _exp
   *       @0x11505f addsd -0.064829 ; @0x115067 divsd 5.5555 ; @0x11506f divsd 0.9
   *     [in-range 0<=r<=1 @0x11509e:]
   *       @0x1150a1 cvtss2sd xmm2,xmm0 (r64 = r)
   *       @0x1150a5 ucomisd cut2,xmm0
   *       @0x1150ad jb 0x114fe9 (LINEAR: r < cut2)
   *       @0x1150b3 jmp 0x11504a (LOG: cut2 <= r <= 1)
   *   [common tail after all branches:]
   *     @0x115077 cvtsd2ss (narrow fp64→fp32)
   *     @0x11507b/81/86 movss %xmm0 → R/G/B
   *     @0x11508b movl $0x3f800000,(%rbx)  (alpha = 1.0f)
   */
  colorAtIndex(
    r: number, _g: number, _b: number,
    rOut: { value: number }, gOut: { value: number }, bOut: { value: number }, aOut: { value: number },
  ): void {
    const r_f32 = Math.fround(r);                    // fp32 arg semantics

    let y64: number;

    // @0x114fda ucomiss xmm2,xmm1 ; jbe @0x114fdd fires when 0 <= r → r < 0 falls through.
    if (!(r_f32 >= 0.0)) {
      // r < 0 (or NaN): xmm0 stays 0. Tail: (0 + K_neg_a) / K_b / K_gain_den.
      const num = 0.0 + K_neg_a;                     // @0x114fe9
      const linPre = num / K_b;                      // @0x114ff1
      y64 = linPre / K_gain_den;                     // @0x11506f
    } else if (r_f32 > K_one_f32) {
      // @0x11502f ucomiss 1.0f,xmm2 ; @0x115036 jbe fires on r <= 1.0 → fall-through iff r > 1.
      // xmm0 = 1.0 (double) @0x115038; log-branch with xmm0=1.0.
      const arg = (K_one_f64 + K_neg_d) * HGFujifilmFLog2LinearizationLUTInfo_cc; // @0x11504a-0x115052
      const e = exp_libm(arg);                       // @0x11505a
      const emk = e + K_neg_e;                       // @0x11505f
      const gainPre = emk / K_inv_gain_num;          // @0x115067  (÷5.5555 = ×0.18)
      y64 = gainPre / K_gain_den;                    // @0x11506f
    } else {
      // 0 <= r <= 1: @0x11509e in-range.
      // @0x1150a1 cvtss2sd → r64 = r (fp32→fp64 exact since r_f32 came from Math.fround).
      const r64 = r_f32;
      // @0x1150a5 ucomisd cut2,xmm0 ; @0x1150ad jb → linear if r < cut2.
      if (r64 < HGFujifilmFLog2LinearizationLUTInfo_cut2) {
        const num = r64 + K_neg_a;                   // @0x114fe9
        const linPre = num / K_b;                    // @0x114ff1
        y64 = linPre / K_gain_den;                   // @0x11506f
      } else {
        const arg = (r64 + K_neg_d) * HGFujifilmFLog2LinearizationLUTInfo_cc;
        const e = exp_libm(arg);                     // @0x11505a
        const emk = e + K_neg_e;                     // @0x11505f
        const gainPre = emk / K_inv_gain_num;        // @0x115067
        y64 = gainPre / K_gain_den;                  // @0x11506f
      }
    }

    // @0x115077 cvtsd2ss ; @0x11507b-@0x11508b stores.
    const y = Math.fround(y64);
    rOut.value = y;                                  // @0x11507b
    gOut.value = y;                                  // @0x115081
    bOut.value = y;                                  // @0x115086
    aOut.value = ALPHA_ONE;                          // @0x11508b
  }

  /** ~D1 @Helium 0x00115c30: push/mov/pop/ret — trivial no-op. */
  destruct_D1(): void { /* no-op @0x115c30 */ }

  /** ~D0 @Helium 0x00115c40: push/mov/pop ; jmp __ZdlPv → tail-call operator delete. */
  destruct_D0(): void { /* no-op under GC @0x115c45 */ }

  /**
   * duplicate @Helium 0x00115c50. Body:
   *   0x115c56 movq %rdi,%rbx ; 0x115c59 movl $0x28,%edi ; 0x115c5e callq __Znwm(0x28)
   *   0x115c63/67 two overlapping 16B movups from this+0x08/+0x14 → cover 32 bytes 0x08..0x27
   *   0x115c6b/6f store into new+0x08/+0x14 ; 0x115c73 leaq 0x90738e(%rip),%rcx (vtable)
   *   0x115c7a movq %rcx,(%rax) ; ret
   * Semantics: shallow byte-copy of base sub-object + derived vtable install.
   */
  duplicate(): HGFujifilmFLog2LinearizationLUTInfo {
    const copy = Object.create(HGFujifilmFLog2LinearizationLUTInfo.prototype) as HGFujifilmFLog2LinearizationLUTInfo;
    (copy as unknown as { base: HGApplyNDLUTInfo_base }).base = this.base;
    return copy;
  }
}

/**
 * Chunk dispatch table (assemble_class.py convention). The two .cold.N subroutines are lazy-init
 * of function-local statics; in TS the constants are baked at module scope so both are no-ops
 * from the observable POV (their post-init effect equals the initial state).
 */
export const HGFujifilmFLog2LinearizationLUTInfo_m0_methods = {
  "HGFujifilmFLog2LinearizationLUTInfo::HGFujifilmFLog2LinearizationLUTInfo(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)":
    (dim0: bigint, minF: number, maxF: number, storage: LUTStorageFormat) =>
      new HGFujifilmFLog2LinearizationLUTInfo(dim0, minF, maxF, storage),
  "HGFujifilmFLog2LinearizationLUTInfo::isEqual(HGLUTCache::LUTInfo*) const":
    (self: HGFujifilmFLog2LinearizationLUTInfo, other: HGLUTCache_LUTInfo | null) =>
      self.isEqual(other),
  "HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const":
    (self: HGFujifilmFLog2LinearizationLUTInfo, ...args: Parameters<HGFujifilmFLog2LinearizationLUTInfo["colorAtIndex"]>) =>
      self.colorAtIndex(...args),
  "HGFujifilmFLog2LinearizationLUTInfo::~HGFujifilmFLog2LinearizationLUTInfo()":
    (self: HGFujifilmFLog2LinearizationLUTInfo) => self.destruct_D1(),
  "HGFujifilmFLog2LinearizationLUTInfo::~HGFujifilmFLog2LinearizationLUTInfo()#D0":
    (self: HGFujifilmFLog2LinearizationLUTInfo) => self.destruct_D0(),
  "HGFujifilmFLog2LinearizationLUTInfo::duplicate() const":
    (self: HGFujifilmFLog2LinearizationLUTInfo) => self.duplicate(),
  "HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(...).cold.1":
    () => { /* @Helium 0x3c4380: static cut2 init — baked at module scope */ },
  "HGFujifilmFLog2LinearizationLUTInfo::colorAtIndex(...).cold.2":
    () => { /* @Helium 0x3c43c0: static cc   init — baked at module scope */ },
};

export const HGFujifilmFLog2LinearizationLUTInfo_vtable_addr = "@Helium 0x9080cc" as const;
