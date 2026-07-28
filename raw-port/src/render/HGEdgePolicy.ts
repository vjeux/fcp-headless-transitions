/**
 * HGEdgePolicy — direct TS transcription of Helium `HGEdgePolicy` (FCP Helium slice).
 *
 * Struct layout (20 bytes, size = 0x14) — recovered from the ctors below:
 *   offset 0x00  uint32   `wrapMode`  (enum HGEdgePolicy::WrapMode)
 *   offset 0x04  float32  `pad0`      (unknown float — cleared to 0.0f in both ctors)
 *   offset 0x08  float32  `pad1`      (unknown float — cleared to 0.0f in both ctors)
 *   offset 0x0c  float32  `pad2`      (unknown float — cleared to 0.0f in both ctors)
 *   offset 0x10  float32  `pad3`      (unknown float — cleared to 0.0f in both ctors)
 *
 * Evidence for the four trailing float32 fields (all four compared with
 * `ucomiss` / `movss` — single-precision):
 *   - HGEdgePolicy::operator==            @0x1e5270
 *       movss  0x4(%rdi) ; ucomiss 0x4(%rsi)
 *       movss  0x8(%rdi) ; ucomiss 0x8(%rsi)
 *       movss  0xc(%rdi) ; ucomiss 0xc(%rsi)
 *       movss  0x10(%rdi); ucomiss 0x10(%rsi)
 *   - HGEdgePolicy::isDefault             @0x1e52c0
 *       ucomiss 0x00 float against 0     at 0x4/0x8/0xc/0x10.
 *
 * The FCP header for these four floats is not in the disassembly stream we
 * decoded here; the concrete semantic names remain undecoded. We keep them
 * as `pad0..pad3` to preserve bit-exact layout and comparison semantics.
 *
 * @Helium 0x1e5210..0x1e5303
 */

/**
 * HGEdgePolicy::WrapMode — passed as `esi` (32-bit int) to the WrapMode ctor
 * (`movl %esi, (%rdi)` @0x1e5254 / @0x1e5264). The default ctor stores 0
 * (`xorps`+`movups` @0x1e5217 clears offset 0..0xf, so the enum value at 0
 * is 0). The enum values beyond `Default = 0` are not decoded from the
 * ctor disassembly — treat other values as opaque uint32 payloads.
 *
 * @Helium 0x1e5254 (WrapMode ctor stores esi at offset 0)
 */
export type HGEdgePolicyWrapMode = number;

/**
 * HGEdgePolicy — transcribed struct.
 *
 * Fields are mutable-by-C++ (the ctors write directly at offsets 0/4/8/c/10).
 * TS-side we expose them as writable properties for callers that mimic the
 * FCP setup path (e.g. `HGBitmap::SetEdgePolicy`).
 */
export class HGEdgePolicy {
  /** offset 0x00 — HGEdgePolicy::WrapMode (uint32). @Helium 0x1e5254 */
  wrapMode: HGEdgePolicyWrapMode;
  /** offset 0x04 — float32 (undecoded name). @Helium 0x1e527a operator== / 0x1e52cd isDefault */
  pad0: number;
  /** offset 0x08 — float32 (undecoded name). @Helium 0x1e5287 operator== / 0x1e52dc isDefault */
  pad1: number;
  /** offset 0x0c — float32 (undecoded name). @Helium 0x1e5294 operator== / 0x1e52e8 isDefault */
  pad2: number;
  /** offset 0x10 — float32 (undecoded name). @Helium 0x1e52a1 operator== / 0x1e52f4 isDefault */
  pad3: number;

  /**
   * HGEdgePolicy::HGEdgePolicy() — default ctor (both C1 and C2 are identical).
   * @Helium __ZN12HGEdgePolicyC2Ev @0x1e5210
   * @Helium __ZN12HGEdgePolicyC1Ev @0x1e5230
   *
   *   pushq %rbp                 @0x1e5210
   *   movq  %rsp, %rbp           @0x1e5211
   *   xorps %xmm0, %xmm0         @0x1e5214  ; zero 128-bit xmm0
   *   movups %xmm0, (%rdi)       @0x1e5217  ; store 16 zero bytes at offset 0x00..0x0f
   *                                            → wrapMode=0, pad0=0.0f, pad1=0.0f, pad2=0.0f
   *   movl  $0x0, 0x10(%rdi)     @0x1e521a  ; store 4 zero bytes at offset 0x10..0x13
   *                                            → pad3=0.0f
   *   popq  %rbp / retq          @0x1e5221
   */
  constructor();
  /**
   * HGEdgePolicy::HGEdgePolicy(HGEdgePolicy::WrapMode) — WrapMode ctor (C1 and C2 identical).
   * @Helium __ZN12HGEdgePolicyC2ENS_8WrapModeE @0x1e5250
   * @Helium __ZN12HGEdgePolicyC1ENS_8WrapModeE @0x1e5260
   *
   *   pushq %rbp                 @0x1e5250
   *   movq  %rsp, %rbp           @0x1e5251
   *   movl  %esi, (%rdi)         @0x1e5254  ; store WrapMode arg (esi) at offset 0x00
   *   xorps %xmm0, %xmm0         @0x1e5256  ; zero 128-bit xmm0
   *   movups %xmm0, 0x4(%rdi)    @0x1e5259  ; store 16 zero bytes at offset 0x04..0x13
   *                                            → pad0=pad1=pad2=pad3=0.0f
   *   popq  %rbp / retq          @0x1e525d
   */
  constructor(wrapMode: HGEdgePolicyWrapMode);
  constructor(wrapMode?: HGEdgePolicyWrapMode) {
    // Both entry points end up here. The default ctor path stores 0 at offset 0
    // via the leading xorps+movups; the WrapMode ctor stores esi at offset 0
    // then zeroes 0x4..0x13. Either way the four float pads are 0.0f.
    this.wrapMode = wrapMode === undefined ? 0 : (wrapMode | 0);
    this.pad0 = Math.fround(0);
    this.pad1 = Math.fround(0);
    this.pad2 = Math.fround(0);
    this.pad3 = Math.fround(0);
  }

  /**
   * HGEdgePolicy::operator==(HGEdgePolicy const&) const
   * @Helium __ZNK12HGEdgePolicyeqERKS_ @0x1e5270
   *
   * Compares the 20-byte layout as (uint32 wrapMode, float32 pad0..pad3).
   * Uses `ucomiss` (single-precision UNORDERED compare) for each float —
   * so NaN on either side yields `false` (jne OR jp both jump to the
   * "return 0" tail at @0x1e52b2). We mirror that with `!(a === b)` on
   * the fround'd values; JS `===` returns false for NaN which matches
   * the ucomiss+jp path.
   *
   *   movl  (%rdi), %eax         @0x1e5274
   *   cmpl  (%rsi), %eax         @0x1e5276
   *   jne   0x1e52b2             @0x1e5278  ; wrapMode differ → return 0
   *   movss 0x4(%rdi), %xmm0     @0x1e527a
   *   ucomiss 0x4(%rsi), %xmm0   @0x1e527f
   *   jne / jp 0x1e52b2          @0x1e5283  ; pad0 differ → return 0
   *   movss 0x8(%rdi), %xmm0     @0x1e5287
   *   ucomiss 0x8(%rsi), %xmm0   @0x1e528c
   *   jne / jp 0x1e52b2          @0x1e5290
   *   movss 0xc(%rdi), %xmm0     @0x1e5294
   *   ucomiss 0xc(%rsi), %xmm0   @0x1e5299
   *   jne / jp 0x1e52b2          @0x1e529d
   *   movss 0x10(%rdi), %xmm0    @0x1e52a1
   *   movb  $0x1, %al            @0x1e52a6  ; presume-equal
   *   ucomiss 0x10(%rsi), %xmm0  @0x1e52a8
   *   jne / jp 0x1e52b2          @0x1e52ac
   *   popq %rbp / retq           @0x1e52b0  ; return 1
   *   xorl %eax, %eax / popq / retq @0x1e52b2 ; return 0
   */
  equals(other: HGEdgePolicy): boolean {
    // wrapMode: 32-bit int compare.
    if ((this.wrapMode | 0) !== (other.wrapMode | 0)) return false;
    // pad0..pad3: single-precision compare; NaN → not equal (matches ucomiss+jp path).
    const a0 = Math.fround(this.pad0), b0 = Math.fround(other.pad0);
    if (!(a0 === b0)) return false;
    const a1 = Math.fround(this.pad1), b1 = Math.fround(other.pad1);
    if (!(a1 === b1)) return false;
    const a2 = Math.fround(this.pad2), b2 = Math.fround(other.pad2);
    if (!(a2 === b2)) return false;
    const a3 = Math.fround(this.pad3), b3 = Math.fround(other.pad3);
    if (!(a3 === b3)) return false;
    return true;
  }

  /**
   * HGEdgePolicy::isDefault() const
   * @Helium __ZNK12HGEdgePolicy9isDefaultEv @0x1e52c0
   *
   *   cmpl $0x0, (%rdi)          @0x1e52c4  ; wrapMode == 0 ?
   *   je   0x1e52cd              @0x1e52c7  ; if yes, fall through to float checks
   *   xorl %eax, %eax / popq / retq @0x1e52c9 ; else → return 0
   *   ; wrapMode == 0 branch:
   *   movss 0x4(%rdi), %xmm1     @0x1e52cd
   *   xorps %xmm0, %xmm0         @0x1e52d2
   *   ucomiss %xmm0, %xmm1       @0x1e52d5
   *   jne / jp 0x1e52c9          @0x1e52d8  ; pad0 != 0.0f (or NaN) → return 0
   *   movss 0x8(%rdi), %xmm1     @0x1e52dc
   *   ucomiss %xmm0, %xmm1       @0x1e52e1
   *   jne / jp 0x1e52c9          @0x1e52e4
   *   movss 0xc(%rdi), %xmm1     @0x1e52e8
   *   ucomiss %xmm0, %xmm1       @0x1e52ed
   *   jne / jp 0x1e52c9          @0x1e52f0
   *   ; last check is cmpeqss (ordered EQ, sets all-1s or 0 into xmm0)
   *   cmpeqss 0x10(%rdi), %xmm0  @0x1e52f4  ; xmm0 was 0.0f; result = (0.0f == pad3) ? -1 : 0
   *   movd %xmm0, %eax           @0x1e52fa
   *   andl $0x1, %eax            @0x1e52fe  ; low bit of the mask → 1 or 0
   *   popq %rbp / retq           @0x1e5301
   *
   * NB: cmpeqss (predicate=0, ORDERED EQ) returns FALSE for NaN, so the tail
   * NaN case also returns 0. `(0.0 === Math.fround(pad3))` matches: NaN is
   * never `===` to 0.0.
   */
  isDefault(): boolean {
    if ((this.wrapMode | 0) !== 0) return false;
    const zero = Math.fround(0);
    if (!(Math.fround(this.pad0) === zero)) return false;
    if (!(Math.fround(this.pad1) === zero)) return false;
    if (!(Math.fround(this.pad2) === zero)) return false;
    if (!(Math.fround(this.pad3) === zero)) return false;
    return true;
  }
}
