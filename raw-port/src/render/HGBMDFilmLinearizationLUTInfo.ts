// raw-port/src/render/HGBMDFilmLinearizationLUTInfo.ts
//
// FCP `HGBMDFilmLinearizationLUTInfo` — Blackmagic Design "Film" (pre-Gen5)
// log → linear-light 1-D LUT descriptor. Extends the already-landed base
// `HGApplyNDLUTInfo`. This is the pre-Gen5 sibling of `HGBMDFilmGen5LinearizationLUTInfo`;
// both share the base layout, both are 1-D LUTs (base ctor's dim1 forced to 1), and both
// broadcast a single-channel result to R, G, B with A=1.0f. The distinguishing state is a
// single bool `is4K` @+0x24 that selects between two parameter sets (the original BMD
// Film curve for 2K/HD and a re-scaled variant for 4K assets).
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// DECODE:    raw-port/re/disasm/Helium.HGBMDFilmLinearizationLUTInfo.*.s
//            plus manual `awk` extraction of the .cold.1..cold.4 tails for the
//            guard-variable initialisers of the four fp64 static locals `d`, `gg`, `d_4K`, `gg_4K`.
//
// STRUCT LAYOUT (recovered from ctor + duplicate — sizeof = 0x28 / 40 bytes):
//   +0x00  vtable ptr             installed by ctor @0x114676-0x11467d
//                                   `leaq 0x9087fb(%rip),%rax ; movq %rax,(%r14)`
//                                   → VA 0x114676+7+0x9087fb = 0xa0ce78 (class vtable).
//   +0x08 .. +0x23  inherited HGApplyNDLUTInfo state (28 bytes; the base's
//                                     `(u64 numBins, u64 numDims, f32 rangeScale,
//                                       f32 rangeOffset, u32 storage)`).
//   +0x24  bool is4K              stored as byte @0x114680: `movb %bl, 0x24(%r14)`.
//
// EXPORTED SYMBOLS:
//   @Helium 0x0000000000114660   ctor (u64, f32, f32, bool, LUTStorageFormat)   [C1]
//   @Helium 0x0000000000114660   same body   [C2 — Itanium ABI dual-emit; aliased in symbol map]
//   @Helium 0x0000000000114690   isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x0000000000114700   colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const
//   @Helium 0x0000000000115a70   duplicate() const  →  new heap-allocated shallow copy
//   @Helium 0x00000000003c40c0   colorAtIndex.cold.1  (guard-init for static double d)
//   @Helium 0x00000000003c4100   colorAtIndex.cold.2  (guard-init for static double gg)
//   @Helium 0x00000000003c4140   colorAtIndex.cold.3  (guard-init for static double d_4K)
//   @Helium 0x00000000003c4180   colorAtIndex.cold.4  (guard-init for static double gg_4K)
//   (D0/D1 dtors — trivial base-chain + operator-delete; not required in TS.)
//
// RUNTIME STATIC LOCALS (fp64, initialised exactly once by .cold.[1..4] via
// __cxa_guard_acquire/__cxa_guard_release):
//   @Helium 0xade1c0  __ZZNK...colorAtIndex...E1d       = 0.11414044016376337   (u64 0x3fbd384ed1a78752)
//   @Helium 0xade1d0  __ZZNK...colorAtIndex...E2gg      = 6.26365260684552      (u64 0x40190dfaf2efa06a)
//   @Helium 0xade1e0  __ZZNK...colorAtIndex...E4d_4K    = 0.10778340475604478   (u64 0x3fbb97b1767a8eea)
//   @Helium 0xade1f0  __ZZNK...colorAtIndex...E5gg_4K   = 3.954676518546612     (u64 0x400fa32d714b55ae)
//
// SEMANTICS (from colorAtIndex disasm @0x114700-0x1148bf):
//   The BMD Film → linear transfer function is a piecewise curve applied to the *first*
//   input channel only; the result is broadcast to R, G, B; A is 1.0f.
//
//   Let t = double(r).
//     xmm2 = 0                                             @0x11471b
//     xmm1 = 0                                             @0x11471e
//     if 0 > r (i.e. r < 0):                                @0x114721 ucomiss %xmm0,%xmm1; ja …0x114737
//       t = 0                                               (xmm2 keeps 0)
//     elif r > 1.0f:                                        @0x114726 ucomiss 1.0f,%xmm0; jbe …0x11477e
//       t = 1.0                                             @0x11472f movsd 1.0,%xmm2
//     else:
//       t = double(r)                                       @0x114781 cvtss2sd %xmm0,%xmm2
//
//     is4K = *(u8*)(this + 0x24)                            @0x114737 cmpb $0,0x24(%rdi)
//     if is4K:
//       if t < d_4K:   y = (t + K_lin_add) / K5_4K_div      @0x114769..0x114779
//       else:          y = exp((t + K6_4K_add) * gg_4K) + K8_4K_post   @0x114807..0x114824
//     else:
//       if t < d:      y = (t + K_lin_add) / K5_div         @0x1147b7..0x1147c7
//       else:          y = exp((t + K6_add) * gg) + K8_post @0x114869..0x114886
//
//     y = y * K_final_mul                                   @0x11488e mulsd 0.20022...,%xmm2
//     out_f32 = float(y)                                    @0x114896-0x114899 cvtsd2ss
//     *outR = *outG = *outB = out_f32                       @0x11489d-0x1148a8
//     *outA = 1.0f                                          @0x1148ad `movl $0x3f800000, (%rbx)`
//     return
//
//   K_lin_add, K5_div, K5_4K_div, K6_add, K6_4K_add, K8_post, K8_4K_post, K_final_mul are
//   all fp64 literal-pool reads recovered by resolve.py Helium const <addr>:
//     @Helium 0x3d4a58 → -0.09286412512218964   (shared: linear-branch add in both is4K paths)
//     @Helium 0x3d4bb0 →  0.7659482             (K5_div — non-4K linear divisor)
//     @Helium 0x3d4bc8 →  0.5370933             (K5_4K_div — 4K linear divisor)
//     @Helium 0x3d4ba0 → -0.3644932             (K6_add   — non-4K exp shift)
//     @Helium 0x3d4bb8 → -0.2982706             (K6_4K_add — 4K exp shift)
//     @Helium 0x3d4ba8 → -0.1806583             (K8_post   — non-4K post-exp add)
//     @Helium 0x3d4bc0 → -0.4430254             (K8_4K_post — 4K post-exp add)
//     @Helium 0x3d4bd0 →  0.20022246941045604   (K_final_mul — shared final scale)
//
// FRONTIER STUBS (referenced only in doc — the base is landed, so we import it):
//   • `___dynamic_cast` @0x1146bb — libc++abi RTTI helper. Modeled via TS `instanceof`.
//   • `__Znwm` / `__ZdlPv` — operator new / delete. `duplicate` uses `new` on the class.
//   • `_exp` — libm double natural exponential. Faithful port uses `Math.exp` (IEEE-754 fp64).

import { HGApplyNDLUTInfo, type LUTStorageFormat } from "./HGApplyNDLUTInfo";

// ── Recovered fp64 constants ──────────────────────────────────────────────────────────────
// Every constant is a bit-identical read from the Helium x86_64 slice.

// Static locals initialised by the four .cold guarded blocks. In TS the runtime handles
// module-level init, so we hard-code the exact fp64 bit-patterns the guards write.

/** `d` — non-4K threshold @Helium 0xade1c0, init @0x3c40d4  (u64 0x3fbd384ed1a78752). */
const D_NON4K = 0.11414044016376337;
/** `gg` — non-4K exp gain @Helium 0xade1d0, init @0x3c4114  (u64 0x40190dfaf2efa06a). */
const GG_NON4K = 6.26365260684552;
/** `d_4K` — 4K threshold @Helium 0xade1e0, init @0x3c4154  (u64 0x3fbb97b1767a8eea). */
const D_4K = 0.10778340475604478;
/** `gg_4K` — 4K exp gain @Helium 0xade1f0, init @0x3c4194  (u64 0x400fa32d714b55ae). */
const GG_4K = 3.954676518546612;

/** Linear-branch numerator add (shared by both is4K paths). @Helium 0x3d4a58 (u64 0xbfb7c5f17c5f17c6). */
const K_LIN_ADD = -0.09286412512218964;

/** Non-4K linear divisor. @Helium 0x3d4bb0 (u64 0x3fe882a5ccadc31c). */
const K5_DIV = 0.7659482;
/** 4K linear divisor. @Helium 0x3d4bc8 (u64 0x3fe12fde49ccd2ac). */
const K5_4K_DIV = 0.5370933;

/** Non-4K exp branch pre-shift. @Helium 0x3d4ba0 (u64 0xbfd753db4967521f). */
const K6_ADD = -0.3644932;
/** 4K exp branch pre-shift. @Helium 0x3d4bb8 (u64 0xbfd316dd9216ee59). */
const K6_4K_ADD = -0.2982706;

/** Non-4K post-exp add. @Helium 0x3d4ba8 (u64 0xbfc71fcfa9201f5a). */
const K8_POST = -0.1806583;
/** 4K post-exp add. @Helium 0x3d4bc0 (u64 0xbfdc5a8735130744). */
const K8_4K_POST = -0.4430254;

/** Final linear-output scale (shared). @Helium 0x3d4bd0 (u64 0x3fc9a0e3cf056913). */
const K_FINAL_MUL = 0.20022246941045604;

/** Class vtable install target — installed at +0x00 in ctor. @Helium 0x114676 leaq → 0xa0ce78. */
const CLASS_VTABLE_VA = 0xa0ce78;

/** Alpha channel write: `movl $0x3f800000, (%rbx)` @0x1148ad → reinterpret to f32 = 1.0f. */
const ALPHA_ONE = Math.fround(1.0);

// ── The class ────────────────────────────────────────────────────────────────────────────

/**
 * `HGBMDFilmLinearizationLUTInfo` — HGApplyNDLUTInfo subclass for the Blackmagic Design
 * pre-Gen5 "Film" log-to-linear transfer function. Sizeof = 0x28.
 */
export class HGBMDFilmLinearizationLUTInfo extends HGApplyNDLUTInfo {
  /** Overwritten vtable value for this class. @Helium ctor @0x114676 → VA 0xa0ce78. */
  declare vtable: number;

  /** +0x24 — bool is4K (u8). Stored @Helium ctor 0x114680 `movb %bl, 0x24(%r14)`. */
  is4K: boolean;

  /**
   * ctor(u64 size, f32 minVal, f32 maxVal, bool is4K, LUTStorageFormat storage)
   * @Helium 0x0000000000114660  (__ZN29HGBMDFilmLinearizationLUTInfoC1EmffbN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE (register semantics per SysV x86_64):
   *   entry: rdi=this, rsi=size, xmm0=min, xmm1=max, edx=is4K(bool→int), ecx=storage
   *   0x114667  movl %edx, %ebx        → save is4K in ebx (bl)
   *   0x114669  movq %rdi, %r14        → save `this` in r14
   *   0x11466c  movl $0x1, %edx        → base ctor's numDims = 1 (this LUT is 1-D)
   *   0x114671  callq HGApplyNDLUTInfo::C2(u64 numBins=rsi, u64 numDims=1,
   *                                        f32 rangeScale=xmm0, f32 rangeOffset=xmm1,
   *                                        LUTStorageFormat storage=ecx)
   *   0x114676  leaq 0x9087fb(%rip),%rax → class vtable ptr (VA 0xa0ce78)
   *   0x11467d  movq %rax,(%r14)       → install class vtable
   *   0x114680  movb %bl, 0x24(%r14)   → this->is4K = arg (byte)
   *   0x114684  epilogue
   *
   * NOTE: base ctor clamps numDims via its own `ja/je` chain; we pass 1 exactly, which the
   * base preserves as-is (the special "== 3 preserves" clamp only forces non-3 non-clamped
   * values; passing 1 goes down the "else 1" fallthrough and stays at 1).
   */
  constructor(
    size: number,
    minVal: number,
    maxVal: number,
    is4K: boolean,
    storage: LUTStorageFormat,
  ) {
    // @Helium 0x114671: base ctor with dim1 forced to 1.
    super(size, 1, minVal, maxVal, storage);
    // @Helium 0x11467d: install child vtable (overrides base's install @0x3d5eb).
    this.vtable = CLASS_VTABLE_VA;
    // @Helium 0x114680: store is4K byte at +0x24.
    this.is4K = is4K;
  }

  /**
   * `isEqual(HGLUTCache::LUTInfo* other) const`
   * @Helium 0x0000000000114690
   *
   * DECODE:
   *   0x11469a  testq %rsi,%rsi       ; if other == null
   *   0x11469d  je    0x1146e5        ;   → return 0
   *   0x1146a2  movq  <typeinfo LUTInfo>,%rax     ; src type info
   *   0x1146a9  leaq  <typeinfo HGBMDFilmLinearizationLUTInfo>,%rdx  ; dst type info
   *   0x1146bb  callq __dynamic_cast(other, LUTInfo_ti, HGBMD...LUTInfo_ti, 0)
   *   0x1146c0  testq %rax,%rax        ; if cast failed → return 0
   *   0x1146c3  je    0x1146e8
   *   0x1146ce  callq HGApplyNDLUTInfo::isEqual(this, casted)  ; base structural equality
   *   0x1146d3  testb %al,%al          ; if base isEqual returned 0 → return 0
   *   0x1146d5  je    0x1146e5
   *   0x1146d7  movzbl 0x24(%rbx),%eax ; this->is4K
   *   0x1146db  cmpb  0x24(%r15),%al   ; == casted->is4K?
   *   0x1146df  sete  %r14b            ; r14 = (is4K equal ? 1 : 0)
   *   0x1146e5  return r14
   *
   * We express `dynamic_cast<HGBMDFilmLinearizationLUTInfo*>` as an `instanceof` check —
   * the class hierarchy is our source of truth (same convention as the base's isEqual and
   * every sibling ...LinearizationLUTInfo already ported).
   */
  isEqual(other: HGApplyNDLUTInfo | null): boolean {
    // @Helium 0x11469a
    if (other == null) return false;
    // @Helium 0x1146bb: dynamic_cast → we require the concrete subclass.
    if (!(other instanceof HGBMDFilmLinearizationLUTInfo)) return false;
    // @Helium 0x1146ce: chain to base isEqual (structural: numBins, numDims,
    // |rangeScale-delta|<eps, |rangeOffset-delta|<eps, storage).
    if (!super.isEqual(other)) return false;
    // @Helium 0x1146d7..0x1146df: is4K byte equality.
    return this.is4K === other.is4K;
  }

  /**
   * `duplicate() const`
   * @Helium 0x0000000000115a70
   *
   * DECODE:
   *   0x115a79  movl $0x28, %edi            ; sizeof = 40
   *   0x115a7e  callq __Znwm                 ; rax = operator new(0x28)
   *   0x115a83  movups 0x8(%rbx),%xmm0       ; copy bytes 0x08..0x17 of *this
   *   0x115a87  movups 0x14(%rbx),%xmm1      ; copy bytes 0x14..0x23 of *this (overlaps by 4 bytes)
   *   0x115a8b  movups %xmm0, 0x8(%rax)      ; …into the new object
   *   0x115a8f  movups %xmm1, 0x14(%rax)     ; combined effect: bytes 0x08..0x23 copied
   *   0x115a93  leaq 0x9073de(%rip),%rcx     ; class vtable ptr @VA 0xa0ce78
   *   0x115a9a  movq %rcx, (%rax)            ; install vtable
   *   0x115a9d  movzbl 0x24(%rbx),%ecx       ; is4K byte
   *   0x115aa1  movb %cl, 0x24(%rax)         ; copy is4K
   *   0x115aa4  return rax
   *
   * The base state @+0x08..+0x23 is (numBins u64, numDims u64, rangeScale f32,
   * rangeOffset f32, storage u32). We call the child ctor with the base's own values
   * to reproduce the exact copy (base ctor's numDims clamp is idempotent for our 1-D
   * numDims=1 case).
   */
  duplicate(): HGBMDFilmLinearizationLUTInfo {
    // @Helium 0x115a79-0x115aa1: shallow byte-for-byte copy through the ctor.
    return new HGBMDFilmLinearizationLUTInfo(
      // numBins → size (child ctor's first param becomes base's numBins).
      this.numBins,
      // rangeScale → minVal (child param name; base stores as rangeScale).
      this.rangeScale,
      // rangeOffset → maxVal (child param name; base stores as rangeOffset).
      this.rangeOffset,
      // is4K.
      this.is4K,
      // storage.
      this.storage,
    );
  }

  /**
   * `colorAtIndex(f32 r, f32 g, f32 b, f32* outR, f32* outG, f32* outB, f32* outA) const`
   * @Helium 0x0000000000114700
   *
   * Piecewise BMD Film log→linear on the first channel only; result broadcast to R/G/B;
   * A = 1.0f. The `g` and `b` inputs are read-and-immediately-zeroed by the disasm
   * (xorps xmm1/xmm2 @0x11471b/0x11471e); they are unused.
   *
   * The four fp64 statics (`d`, `gg`, `d_4K`, `gg_4K`) are runtime-initialised via
   * `__cxa_guard_acquire`/`__cxa_guard_release` around single `movabsq/movq` stores in the
   * .cold.1..cold.4 blocks; we bake the values in as module-level `const`s (see above).
   *
   * See file header for the full mapping of every RIP-relative fp64 constant.
   */
  colorAtIndex(
    r: number,
    _g: number,
    _b: number,
    outR: [number],
    outG: [number],
    outB: [number],
    outA: [number],
  ): void {
    // ── clamp input `r` to [0, 1]; convert to fp64 in `t`. ────────────────────────────
    // @Helium 0x114721 (ja if 0.0f > r)
    // @Helium 0x114726 (jbe if r <= 1.0f)  → equivalently `if r > 1.0f then t = 1.0`
    // @Helium 0x114781 cvtss2sd r → t   (widen the un-clamped path to fp64).
    let t: number;
    if (0 > Math.fround(r)) {
      // @Helium 0x114721 ja path: xmm2 kept as 0.
      t = 0;
    } else if (Math.fround(r) > Math.fround(1.0)) {
      // @Helium 0x11472f movsd 1.0(fp64) into xmm2.
      t = 1.0;
    } else {
      // @Helium 0x114781: cvtss2sd. This widens the f32 to f64; JS numbers are already f64,
      // but we route through Math.fround(r) first to match the exact bit-pattern that
      // cvtss2sd would produce for a value that entered as f32.
      t = Math.fround(r);
    }

    // ── select branch: 4K vs non-4K ────────────────────────────────────────────────────
    // @Helium 0x114737 cmpb $0,0x24(%rdi); je → non-4K path @0x11478b.
    let y: number;
    if (this.is4K) {
      // ── 4K ────────────────────────────────────────────────────────────────────────
      // @Helium 0x11475b ucomisd t, d_4K
      // @Helium 0x114763 jae → exp-branch @0x114807
      if (t < D_4K) {
        // linear branch @0x114769..0x114779
        //   addsd t, K_LIN_ADD  ; divsd t, K5_4K_DIV  ; jmp join
        y = (t + K_LIN_ADD) / K5_4K_DIV;
      } else {
        // exp branch @0x114807..0x114824
        //   addsd t, K6_4K_ADD  ; mulsd t, GG_4K  ; movapd xmm0,xmm2 ; callq exp
        //   addsd result, K8_4K_POST ; jmp join
        y = Math.exp((t + K6_4K_ADD) * GG_4K) + K8_4K_POST;
      }
    } else {
      // ── non-4K ────────────────────────────────────────────────────────────────────
      // @Helium 0x1147a9 ucomisd t, d
      // @Helium 0x1147b1 jae → exp-branch @0x114869
      if (t < D_NON4K) {
        // linear branch @0x1147b7..0x1147c7
        y = (t + K_LIN_ADD) / K5_DIV;
      } else {
        // exp branch @0x114869..0x114886
        y = Math.exp((t + K6_ADD) * GG_NON4K) + K8_POST;
      }
    }

    // ── final scale + narrow to f32 + broadcast + alpha ────────────────────────────────
    // @Helium 0x11488e mulsd y, K_FINAL_MUL
    y = y * K_FINAL_MUL;
    // @Helium 0x114896-0x114899 cvtsd2ss y → out_f32
    const out = Math.fround(y);
    // @Helium 0x11489d-0x1148a8 movss out_f32 to outR/outG/outB
    outR[0] = out;
    outG[0] = out;
    outB[0] = out;
    // @Helium 0x1148ad movl $0x3f800000 → outA = 1.0f
    outA[0] = ALPHA_ONE;
  }
}
