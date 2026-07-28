// raw-port/src/render/HGFujifilmFLogLinearizationLUTInfo.ts
//
// FCP `HGFujifilmFLogLinearizationLUTInfo` — Helium subclass of
// HGApplyNDLUTInfo modelling the Fujifilm **F-Log (v1)** encoded → linear-
// light 1-D LUT descriptor. Scalar `colorAtIndex()` inverts Fujifilm's
// piecewise F-Log transfer function so the encoded 10-bit code value
// (normalized to [0,1]) becomes scene-linear light. No exposure-index
// parametrization (unlike HGArriLogCLinearizationLUTInfo) — F-Log has a
// single fixed parameter set.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGFujifilmFLogLinearizationLUTInfo.*.s
//
// SYMBOLS (all VAs are x86_64 slice virtual addresses; file offset = VA + 0x4000):
//   @Helium 0x114d80  ctor (C1)   HGFujifilmFLogLinearizationLUTInfo(unsigned long numBins,
//                                     float rangeScale, float rangeOffset,
//                                     HGApplyNDLUTInfo::LUTStorageFormat storage)
//   @Helium 0x114db0  isEqual(HGLUTCache::LUTInfo*) const     [override]
//   @Helium 0x114e00  colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const [override]
//   @Helium 0x115bd0  ~HGFujifilmFLogLinearizationLUTInfo()  (D1 — trivial ret; no members to destroy)
//   @Helium 0x115be0  ~HGFujifilmFLogLinearizationLUTInfo()  (D0 — deleting; tail calls __ZdlPv)
//   @Helium 0x115bf0  duplicate() const
//   @Helium 0x3c4300  .cold.1 — one-shot init of static-local `cut2` (double)
//   @Helium 0x3c4340  .cold.2 — one-shot init of static-local `cc`   (double)
//   (No D2 base dtor is exported — the D1 body IS the base dtor as this class
//   has no non-trivial member state to tear down.)
//
// VTABLE @Helium 0xa1cfb8 (installed ptr; ctor writes at (this) from PC-relative
// leaq at 0x114d95 with next-PC 0x114d9c + disp 0x90821c = 0xa1cfb8; duplicate()
// writes the exact same address via 0x115c1a + 0x90739e).
//   *0x00 = 0x115bd0  ~HGFujifilmFLogLinearizationLUTInfo (D1)
//   *0x08 = 0x115be0  ~HGFujifilmFLogLinearizationLUTInfo (D0)
//   *0x10 = 0x115bf0  duplicate() const                   [NEW virtual for this family]
//   *0x18 = 0x114db0  isEqual(HGLUTCache::LUTInfo*) const  [override]
//   *0x20 = 0x114e00  colorAtIndex(...) const              [override]
//   (typeinfo @0xa1cfb8+0x40 references HGApplyNDLUTInfo's typeinfo — base
//    chain confirmed by the __dynamic_cast in isEqual@0x114dc5.)
//
// STRUCT LAYOUT (recovered from ctor + duplicate; sizeof = 0x28 bytes):
//   0x00 : void*             vtable          (installed = 0xa1cfb8)
//   0x08 .. 0x23 : inherited HGApplyNDLUTInfo base sub-object (28 bytes):
//                         numBins(u64)@+0x08, numDims(u64)@+0x10,
//                         rangeScale(f32)@+0x18, rangeOffset(f32)@+0x1c,
//                         storage(LUTStorageFormat u32)@+0x20.
//                       Base ctor is invoked with numDims hardcoded to 1
//                       via `movl $0x1, %edx` @0x114d8b (this is a 1-D LUT
//                       — no per-band parameters, unlike ArriLogC).
//   0x24 .. 0x27       : 4 bytes of alignment padding — NEVER touched by ctor
//                       or duplicate (`duplicate` copies bytes 0x08..0x23 in
//                       two 16-byte overlapping movups at 0x115c03/0x115c07,
//                       then stops).
//   sizeof = 0x28 (40 bytes; the `movl $0x28, %edi; callq __Znwm` in duplicate
//   @0x115bf9 confirms).
//
// FUJIFILM F-LOG (v1) INVERSE PARAMETERS (all doubles, verified byte-identical
// to the Helium x86_64 __TEXT image at the addresses cited):
//   f (linear-region offset) = -0.092864   @Helium 0x3d4c60
//   e (linear-region slope)  =  8.735631   @Helium 0x3d4c68
//   d (log offset)           = -0.790453   @Helium 0x3d4c48
//   b (log inner offset)     = -0.009468   @Helium 0x3d4c50
//   a (log slope divisor)    =  5/9  = 0.5555555555555556  @Helium 0x3d4c58
//   scale (final divisor)    =  9/10 = 0.9                  @Helium 0x3d0e50
//
//   cut2 (static-local, initialized on-first-call in .cold.1)
//                            = 0x3fb9c026a3080d26 = 0.10058824043521905
//                              @Helium 0x3c4314 (movabsq imm64) → written to
//                              the `cut2` static double (guarded by ___cxa_guard_*).
//                            (Above this encoded-value threshold, use the log branch;
//                            below, use the linear branch.)
//
//   cc   (static-local, initialized on-first-call in .cold.2)
//                            = 0x401ab8c38e6c7294 = 6.680433488244166
//                              @Helium 0x3c4354 (movabsq imm64) → written to
//                              the `cc` static double.
//                            = ln(10) / 0.344676  — precomputed so the log
//                              branch can use `exp(cc*(v-d))` instead of `10^`.
//
//   +1.0f (upper clamp)      = 0x3F800000 f32     @Helium 0x3c7cc0 (referenced
//                              by ucomiss @0x114e8f, next-PC 0x114e96 + 0x2b2e2a
//                              = 0x3c7cc0).
//   +1.0  (upper clamp d64)  = 1.0                @Helium 0x3ca260 (referenced
//                              by movsd @0x114e98, next-PC 0x114ea0 + 0x2b53c0).
//
// CONTROL FLOW OF colorAtIndex(f32 v, f32 _g, f32 _b, f32* rOut, f32* gOut, f32* bOut, f32* aOut) const
// (all disasm addrs in the Helium x86_64 slice):
//
//   0x114e1b: xmm2 = v (the first float channel — the other two f32 args are
//                       IGNORED entirely; F-Log is applied as a scalar and the
//                       same result is broadcast to R, G, B outputs).
//
//   guard(cut2), guard(cc): the two static-local doubles are lazily initialized
//   under Itanium ___cxa_guard_acquire/release once per process. .cold.1 stores
//   0x3fb9c026a3080d26 into `cut2`; .cold.2 stores 0x401ab8c38e6c7294 into `cc`.
//   TS doesn't need runtime guards — the constants are pure literals.
//
//   0x114e3a: ucomiss %xmm2, %xmm1   ; compare xmm1=0 with xmm2=v  →  flags of 0-v
//   0x114e3d: jbe 0x114e8f            ; if v >= 0 → clamp/branch selector
//   ; else (v < 0):
//   0x114e3f: ucomisd 0(xmm0), cut2   ; cut2 > 0, so jae fires
//   0x114e47: jae 0x114eaa            ; → LOG branch with xmm0 = 0.0
//
//   0x114e8f: ucomiss v, 1.0f         ; compare
//   0x114e96: jbe 0x114efe            ; if v <= 1 → real branch selection
//   ; else (v > 1):
//   0x114e98: xmm0 = 1.0 (double)
//   0x114ea0: ucomisd cut2, xmm0(=1.0)
//   0x114ea8: jb 0x114e49             ; 1.0 < cut2 is FALSE → jb NOT taken
//                                     ; fallthrough to 0x114eaa (LOG branch) with xmm0 = 1.0
//
//   0x114efe: xmm0 = (double)v
//   0x114f05: ucomisd cut2, xmm0
//   0x114f0d: jb 0x114e49             ; xmm0 < cut2 → LINEAR branch
//                                     ; else fallthrough / jmp to 0x114eaa (LOG)
//
//   LINEAR branch (0x114e49):
//     xmm0 = v_as_double
//     xmm0 = xmm0 + f       ; = v - 0.092864
//     xmm0 = xmm0 / e       ; = (v - 0.092864) / 8.735631
//     jmp 0x114ecf (final /0.9)
//
//   LOG branch (0x114eaa):
//     xmm0 = xmm0 + d       ; xmm0 was set to v (or 0 or 1) above
//     xmm0 = xmm0 * cc      ; = (v - 0.790453) * ln(10)/0.344676
//     xmm0 = exp(xmm0)      ; = 10 ** ((v - 0.790453) / 0.344676)
//     xmm0 = xmm0 + b       ; = pow10 - 0.009468
//     xmm0 = xmm0 / a       ; = (pow10 - 0.009468) / (5/9)
//     jmp 0x114ecf
//
//   0x114ecf (COMMON tail):
//     xmm0 = xmm0 / 0.9     ; final scaling
//     xmm0 = (float)xmm0    ; cvtsd2ss → single precision
//     *rOut = xmm0
//     *gOut = xmm0
//     *bOut = xmm0
//     *aOut = 1.0f (0x3f800000 immediate — literally movl at 0x114eeb)
//
// This is the standard Fujifilm F-Log v1 EOTF inverse — with the notable
// property that the same scalar is written to R, G, B (chroma-independent
// 1-D linearization), and alpha is fully opaque.
//
// isEqual @0x114db0 mirrors HGArriLogCLinearizationLUTInfo::isEqual: it
// dynamic_casts the incoming HGLUTCache::LUTInfo* to
// HGFujifilmFLogLinearizationLUTInfo* and, on success, tail-calls the base
// class's isEqual for the actual field-comparison. On dynamic_cast failure
// (unrelated type) or nullptr, returns false.
//
// isEqual comparison contract (delegated to HGApplyNDLUTInfo::isEqual @Helium
// 0x3d690): equal iff numBins, numDims, rangeScale, rangeOffset, and storage
// all match. This subclass adds no fields, so no additional comparison is
// needed — the base equality is sufficient.

import { HGApplyNDLUTInfo, type LUTStorageFormat } from "./HGApplyNDLUTInfo.js";

// NOTE ON isEqual TYPING: the FCP signature is `isEqual(HGLUTCache::LUTInfo*)`
// — a base-class pointer under the HGLUTCache::LUTInfo RTTI hierarchy.
// HGLUTCache and its inner LUTInfo type are not yet transcribed anywhere in
// raw-port/, so we cannot express that literal signature; the closest landed
// supertype is `HGApplyNDLUTInfo`, which is the class this file overrides. The
// disasm's __dynamic_cast at 0x114dc5 gates on the exact-subclass match, so
// widening the parameter to any HGLUTCache::LUTInfo* only expands the reject
// set — which we implement by the `instanceof HGFujifilmFLogLinearizationLUTInfo`
// check below.

/**
 * HGFujifilmFLogLinearizationLUTInfo — F-Log (v1) → linear 1-D LUT descriptor.
 *
 * @ctor @Helium 0x114d80  Faithful transcription:
 *   * calls the base ctor `HGApplyNDLUTInfo::HGApplyNDLUTInfo(numBins,
 *     numDims=1, rangeScale, rangeOffset, storage)` — the numDims
 *     argument is hardcoded to 1 by `movl $0x1, %edx` @0x114d8b before the
 *     call, so callers cannot override it.
 *   * installs vtable = 0xa1cfb8 at `this+0x00`
 *     (leaq @0x114d95 + PC-next 0x114d9c + disp 0x90821c).
 *
 * @dtor D1 @0x115bd0 is a trivial ret — this class introduces no owned members.
 *       D0 @0x115be0 tail-jumps to `operator delete` (deleting-dtor path).
 */
export class HGFujifilmFLogLinearizationLUTInfo extends HGApplyNDLUTInfo {
  /**
   * @param numBins      forwarded to the HGApplyNDLUTInfo base ctor as `numBins`.
   *                     (LUT resolution — number of table entries.)
   * @param rangeScale   forwarded to base ctor as `rangeScale`  (f32).
   * @param rangeOffset  forwarded to base ctor as `rangeOffset` (f32).
   * @param storage      forwarded to base ctor as `storage` (LUTStorageFormat).
   *
   * numDims is fixed at 1 by the FCP binary — F-Log is a 1-D scalar transfer
   * function. The base ctor's second `unsigned long` argument is hardcoded to
   * 1 via `movl $0x1, %edx` at 0x114d8b in the binary, so we pass 1 here as
   * well — this is not caller-configurable.
   */
  constructor(
    numBins: number,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat,
  ) {
    // @Helium 0x114d80..0x114d95: base ctor call with numDims hardcoded to 1.
    super(numBins, 1, rangeScale, rangeOffset, storage);
    // The vtable install at 0x114d9c is implicit in JS class semantics — the
    // `isEqual`, `colorAtIndex`, and `duplicate` methods below override the
    // base methods, matching the FCP vtable layout at 0xa1cfb8.
  }

  /**
   * isEqual @Helium 0x114db0. Faithful transcription:
   *
   *   0x114db6: testq %rsi,%rsi         ; nullptr check on `other`
   *   0x114db9: je    0x114def          ; -> return false
   *   0x114dc5: __dynamic_cast(other, &typeinfo_HGLUTCache_LUTInfo,
   *                             &typeinfo_HGFujifilmFLogLinearizationLUTInfo, 0)
   *   0x114dd9: testq %rax,%rax
   *   0x114ddc: je    0x114def          ; unrelated subclass -> return false
   *   0x114dea: jmp   HGApplyNDLUTInfo::isEqual(this, casted)  ; tail-delegate
   *   0x114def: xorl %eax,%eax; ret     ; return false
   *
   * @param other  another HGLUTCache::LUTInfo* (or null / unrelated subclass).
   * @returns      true iff `other` is another HGFujifilmFLogLinearizationLUTInfo
   *               AND all base fields match (numBins, numDims, rangeScale,
   *               rangeOffset, storage).
   */
  isEqual(other: HGApplyNDLUTInfo | null): boolean {
    // 0x114db6: nullptr guard.
    if (other == null) return false;
    // 0x114dc5..0x114dd9: type-check via `instanceof` — the TS analogue of
    // __dynamic_cast to this exact subclass. A base-class-only pointer or
    // a sibling subclass returns null from __dynamic_cast → we return false.
    if (!(other instanceof HGFujifilmFLogLinearizationLUTInfo)) return false;
    // 0x114dea: tail-jmp to base isEqual for the actual field comparison.
    // (This subclass adds no fields — base equality is the whole answer.)
    return super.isEqual(other);
  }

  /**
   * colorAtIndex @Helium 0x114e00. Fujifilm F-Log (v1) → linear inverse EOTF.
   *
   * The two other input channels (`_gIn`, `_bIn`) are read into %xmm registers
   * but NEVER USED — the function operates on `rIn` (== xmm2 after 0x114e1b)
   * and broadcasts the single scalar result to all three RGB outputs. The
   * alpha output is set to 1.0f as an immediate.
   *
   * @param rIn    encoded F-Log (v1) code value, normalized [0,1] range
   *               (extrapolated for out-of-range values — see branches below).
   * @param _gIn   ignored (present only to match the FCP signature).
   * @param _bIn   ignored (present only to match the FCP signature).
   * @returns      { r, g, b, a } where r = g = b = linearized(rIn), a = 1.
   *
   * The FCP signature takes four `float*` out-pointers; we return a struct
   * so the TS side can stay pure. If a downstream caller needs pointer-out
   * semantics, they can spread the result into their own storage.
   */
  colorAtIndex(
    rIn: number,
    _gIn: number,
    _bIn: number,
  ): { r: number; g: number; b: number; a: number } {
    // ── static-local constants (initialized once in .cold.1 / .cold.2) ──
    //   cut2 @Helium 0x3c4314 (movabsq $0x3fb9c026a3080d26)
    //   cc   @Helium 0x3c4354 (movabsq $0x401ab8c38e6c7294)
    // In TS these are just literals; the guard-variable dance is a C++-runtime
    // artifact with no observable effect on the returned value.
    const cut2 = 0.10058824043521905; // = 0x3fb9c026a3080d26
    const cc = 6.680433488244166;     // = 0x401ab8c38e6c7294 = ln(10)/0.344676

    // ── other RIP-relative constants (byte-identical to Helium __TEXT) ──
    const F_LOG_D = -0.790453;              // @Helium 0x3d4c48
    const F_LOG_B = -0.009468;              // @Helium 0x3d4c50
    const F_LOG_A = 0.5555555555555556;     // @Helium 0x3d4c58  (= 5/9)
    const F_LOG_F = -0.092864;              // @Helium 0x3d4c60
    const F_LOG_E = 8.735631;               // @Helium 0x3d4c68
    const F_LOG_SCALE = 0.9;                // @Helium 0x3d0e50

    // xmm2 = v as float; the disasm treats it as f32 through the first
    // ucomiss, and promotes to f64 via cvtss2sd in the LINEAR branch entry
    // (0x114efe or the fallback at 0x114f01). Everything else is in f64.
    // Math.fround here matches the single-precision entry value the FCP
    // code sees on the ucomiss compares.
    const v_f32 = Math.fround(rIn);

    // ── branch selection ─────────────────────────────────────────────────
    // xmm0 gets initialized in the LOG branch entry as either 0.0 (v<0
    // path) or 1.0 (v>1 clamp path) or (double)v (v in [0,1] path).
    let xmm0: number;

    if (!(v_f32 >= 0)) {
      // v < 0 (or NaN) path — 0x114e3d jbe FAILS, fallthrough to 0x114e3f.
      // ucomisd 0.0, cut2 → jae fires (cut2 >= 0) → 0x114eaa (LOG) with xmm0=0.
      xmm0 = 0.0;
      // fall through to LOG branch below.
    } else if (v_f32 > 1) {
      // v > 1 path — 0x114e96 jbe FAILS. xmm0 = 1.0, cut2 < 1 → jb fails,
      // fall to LOG branch with xmm0 = 1.0.
      xmm0 = 1.0;
    } else {
      // v in [0,1] path — 0x114efe:
      xmm0 = v_f32; // cvtss2sd — TS numbers are already double.
      if (xmm0 < cut2) {
        // LINEAR branch @0x114e49:
        xmm0 = xmm0 + F_LOG_F;          // xmm0 - 0.092864
        xmm0 = xmm0 / F_LOG_E;          // / 8.735631
        // jmp 0x114ecf (COMMON tail below).
        xmm0 = xmm0 / F_LOG_SCALE;      // /0.9
        const out_f32 = Math.fround(xmm0);
        return { r: out_f32, g: out_f32, b: out_f32, a: 1.0 };
      }
      // else fall to LOG branch with xmm0 = v_as_double.
    }

    // LOG branch @0x114eaa:
    xmm0 = xmm0 + F_LOG_D;              // + (-0.790453)  = v - 0.790453
    xmm0 = xmm0 * cc;                   // * (ln(10)/0.344676)
    xmm0 = Math.exp(xmm0);              // exp() @0x114eba → symbol stub _exp
    xmm0 = xmm0 + F_LOG_B;              // + (-0.009468)
    xmm0 = xmm0 / F_LOG_A;              // / (5/9)

    // COMMON tail @0x114ecf:
    xmm0 = xmm0 / F_LOG_SCALE;          // /0.9
    const out_f32 = Math.fround(xmm0);  // cvtsd2ss @0x114ed7

    // 0x114edb..114ee6: broadcast to R, G, B.
    // 0x114eeb: alpha = movl $0x3f800000 = 1.0f.
    return { r: out_f32, g: out_f32, b: out_f32, a: 1.0 };
  }

  /**
   * duplicate @Helium 0x115bf0.
   *
   * Faithful transcription:
   *   0x115bf9: rax = operator new(0x28)            ; 40 bytes
   *   0x115c03: xmm0 = *(this + 0x08)               ; 16 bytes (numBins,numDims)
   *   0x115c07: xmm1 = *(this + 0x14)               ; 16 bytes (rangeScale..storage)
   *                                                  (note the +0x14 read
   *                                                   overlaps by 4 bytes
   *                                                   with the prior read —
   *                                                   the compiler used two
   *                                                   16-byte loads to
   *                                                   cover the 28-byte
   *                                                   payload.)
   *   0x115c0b: *(new + 0x08) = xmm0
   *   0x115c0f: *(new + 0x14) = xmm1                ; overlapping store back
   *   0x115c13: *(new + 0x00) = vtable(0xa1cfb8)    ; via 0x115c1a + 0x90739e
   *   ret
   *
   * The 4 bytes at +0x24..+0x27 are UNINITIALIZED — the ctor never writes
   * them and `duplicate` doesn't copy them. They are alignment padding.
   *
   * @returns a fresh instance with identical base-class state.
   */
  duplicate(): HGFujifilmFLogLinearizationLUTInfo {
    // The 16-byte copies at 0x115c03..0x115c0f copy exactly bytes 0x08..0x23,
    // which is (numBins u64)+(numDims u64)+(rangeScale f32)+(rangeOffset f32)+
    // (storage u32) = 28 bytes. All of these fields live in the base class;
    // we just re-invoke the ctor with them.
    return new HGFujifilmFLogLinearizationLUTInfo(
      this.getNumBins(),
      this.getRangeScale(),
      this.getRangeOffset(),
      this.getLUTStorageFormat(),
    );
  }
}
