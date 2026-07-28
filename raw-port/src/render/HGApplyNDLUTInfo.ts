// raw-port/src/render/HGApplyNDLUTInfo.ts
//
// FCP `HGApplyNDLUTInfo` — Helium base class for N-dimensional lookup-
// table descriptors (bin count, dim count, range scale/offset, storage
// format). Sits under `HGLUTCache::LUTInfo` (per vtable typeinfo) and
// is the polymorphic head of a family of 8+ landed subclasses:
// HGAYCCToneCurveToLinearLUTInfo, HGCanonLog2LinearizationLUTInfo,
// HGLinearToAYCCToneCurveLUTInfo, HG_ERsRGBToneCurveToLinearLUTInfo,
// HGColorGammaLUTInfo, HGColorConformLUTInfo, HGBMDFilmLinearizationLUTInfo,
// HGDJIDLogLinearizationLUTInfo, HGAppleLogLinearizationLUTInfo,
// HGArriLogCLinearizationLUTInfo, HGCanonLogToneCurveLUTInfo. All of
// them chain their C2 ctors through this class's C2 body.
//
// Symbols (Helium x86_64; file offset 0x4000; VAs are unadjusted VM addrs):
//   0x3d5e0  HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long numBins,
//                                              unsigned long numDims,
//                                              float rangeScale,
//                                              float rangeOffset,
//                                              LUTStorageFormat storage)
//   0x3d620  HGApplyNDLUTInfo::getNumBins() const           [return u64 @0x8]
//   0x3d630  HGApplyNDLUTInfo::getNumDims() const           [return u64 @0x10]
//   0x3d640  HGApplyNDLUTInfo::getRangeScale() const        [return f32 @0x18]
//   0x3d650  HGApplyNDLUTInfo::getRangeOffset() const       [return f32 @0x1c]
//   0x3d660  HGApplyNDLUTInfo::getLUTStorageFormat() const  [return i32 @0x20]
//   0x3d670  HGApplyNDLUTInfo::getLUTHGStorageFormat() const
//   0x3d690  HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
//   0x3d730  HGApplyNDLUTInfo::colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const
//   0x3c1670 HGApplyNDLUTInfo::~HGApplyNDLUTInfo()          [D1 — body is `ud2`]
//   0x3c1680 HGApplyNDLUTInfo::~HGApplyNDLUTInfo()          [D0 — body is `ud2`]
//
// Vtable @Helium 0xa06558 (RTTI header @0xa06548; typeinfo name @0x3cb264):
//   *0x00 = 0x3c1670  ~HGApplyNDLUTInfo (D1) — traps via `ud2`
//   *0x08 = 0x3c1680  ~HGApplyNDLUTInfo (D0) — traps via `ud2`
//   *0x18 = 0x3d690   isEqual(HGLUTCache::LUTInfo*) const
//   *0x20 = 0x3d730   colorAtIndex(...) const
//   (Slot 0x10 is 0/pad; higher slots reference HGApplyNDLUTEntry vtable.)
//
// LAYOUT (recovered field-by-field from the C2 asm):
//   0x00 : void*                     vtable          (installed = 0xa06558)
//   0x08 : u64                       numBins
//   0x10 : u64                       numDims         (see ctor clamp below)
//   0x18 : f32                       rangeScale
//   0x1c : f32                       rangeOffset
//   0x20 : i32/LUTStorageFormat      storage
//   sizeof(HGApplyNDLUTInfo) = 0x24 bytes (u32 field ends at 0x24;
//   subclasses extend from 0x28 onward).
//
// CRITICAL PROPERTIES:
//   * D1/D0 bodies are `ud2` — the base class is NEVER destroyed on its
//     own; subclasses must override both slots (they always do in FCP).
//   * The ctor clamps numDims into {1,2,3}: if numDims > 3 → 3, if
//     numDims == 3 → keep 3, if numDims != 3 && numDims <= 3 → 1.
//     Concretely: only numDims == 3 preserves 3; any other value is
//     forced to 1 unless it's strictly greater than 3, in which case
//     it saturates at 3. See the exact clamp trace in the ctor doc.
//   * `isEqual` performs a `dynamic_cast<HGApplyNDLUTInfo*>` on the
//     LUTInfo* argument, then structural equality: numBins, numDims,
//     |rangeScale - other.rangeScale| < 1e-4, |rangeOffset - other.rangeOffset|
//     < 1e-4, storage == other.storage. Epsilon constant lives at
//     Helium 0x3cb260 = 0x38d1b717 f32 (verified ≈ 9.999999747378752e-05).
//     Abs-value bitmask lives at Helium 0x3c7c30 = four u32 0x7fffffff.
//   * `colorAtIndex` is a **pure zero-fill stub in the base class** —
//     it just writes 0.0f to *rsi, *rdx, *rcx, *r8 and returns.
//     Subclasses override this on the vtable.
//   * `getLUTHGStorageFormat()` maps `storage` (u32) through a small LUT:
//        storage == 0  → 0x19
//        storage == 1  → 0x1b
//        storage != 0,1 → 0x1c
//     Derivation: `xorl %ecx,%ecx; cmpl $1, %eax; setne %cl; addl $0x1b, %ecx`
//     produces ecx = (storage==1 ? 0x1b : 0x1c); then `movl $0x19, %eax;
//     cmovnel %ecx, %eax` overrides to 0x19 only when storage==0. So this
//     is the format-code table for the underlying HGFormat enum.

/**
 * `HGApplyNDLUTInfo::LUTStorageFormat` — u32 enum, storage layout for the
 * LUT data. Values decoded from getLUTHGStorageFormat mapping:
 *   0 → HGFormat 0x19 (default)
 *   1 → HGFormat 0x1b
 *   any other → HGFormat 0x1c
 */
export type LUTStorageFormat = number;

/**
 * `HGApplyNDLUTInfo` — Helium base class for ND-LUT descriptors.
 *
 * Ctor arguments (from mangling `EmmffNS_16LUTStorageFormatE`):
 *   numBins      : unsigned long
 *   numDims      : unsigned long   (clamped to {1, 2, 3, or 3-if-> 3, else 1})
 *   rangeScale   : float
 *   rangeOffset  : float
 *   storage      : LUTStorageFormat (u32)
 */
export class HGApplyNDLUTInfo {
  /** vtable pointer @0x00 — installed = 0xa06558 (HGApplyNDLUTInfo vtable). */
  vtable: number;
  /** numBins @0x08 (u64). */
  numBins: number;
  /** numDims @0x10 (u64) — clamped by ctor to {1, 3}, capped at 3. */
  numDims: number;
  /** rangeScale @0x18 (f32). */
  rangeScale: number;
  /** rangeOffset @0x1c (f32). */
  rangeOffset: number;
  /** storage @0x20 (u32 / LUTStorageFormat). */
  storage: LUTStorageFormat;

  /**
   * `HGApplyNDLUTInfo::HGApplyNDLUTInfo(u64,u64,f32,f32,LUTStorageFormat)`
   * — Helium @0x3d5e0.
   *
   *   0x3d5e4: leaq  0x9c8f6d(%rip), %rax   ; = 0xa06558 (HGApplyNDLUTInfo vtable)
   *   0x3d5eb: movq  %rax, (%rdi)           ; *this = vtable
   *   0x3d5ee: movq  %rsi, 0x8(%rdi)        ; this->numBins  = numBins
   *   0x3d5f2: movq  %rdx, 0x10(%rdi)       ; this->numDims  = numDims
   *   0x3d5f6: movss %xmm0, 0x18(%rdi)      ; this->rangeScale  = rangeScale
   *   0x3d5fb: movss %xmm1, 0x1c(%rdi)      ; this->rangeOffset = rangeOffset
   *   0x3d600: movl  %ecx, 0x20(%rdi)       ; this->storage = storage
   *   ; --- clamp numDims into {1, 3} (capped at 3) ---
   *   0x3d603: movl  $0x3, %eax              ; rax = 3
   *   0x3d608: cmpq  $0x3, %rdx              ; numDims cmp 3
   *   0x3d60c: ja    0x3d615                 ;   if numDims  > 3 → jump (keep rax=3, write)
   *   0x3d60e: movl  $0x1, %eax              ; else rax = 1
   *   0x3d613: je    0x3d619                 ;   if numDims == 3 → jump-over write (leave 3)
   *   0x3d615: movq  %rax, 0x10(%rdi)        ; this->numDims = rax  (either 3 or 1)
   *   0x3d619: retq
   *
   * Clamp semantics (verified from the branch structure):
   *   numDims  > 3 : store 3
   *   numDims == 3 : store 3 (no write — value already there)
   *   numDims  < 3 : store 1
   * i.e. only 3 is preserved as-is; any other value collapses to 1 or 3.
   */
  constructor(
    numBins: number,
    numDims: number,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat
  ) {
    // @Helium 0x3d5eb: vtable install (target 0xa06558)
    this.vtable = 0xa06558;
    // @Helium 0x3d5ee..0x3d600: store all five fields as passed
    this.numBins = numBins;
    this.numDims = numDims;
    this.rangeScale = Math.fround(rangeScale);
    this.rangeOffset = Math.fround(rangeOffset);
    this.storage = storage | 0;
    // @Helium 0x3d603..0x3d615: numDims clamp — matches ja/je control flow.
    if (numDims > 3) {
      // @Helium 0x3d60c ja → 0x3d615 branch: numDims > 3 → force to 3
      this.numDims = 3;
    } else if (numDims !== 3) {
      // @Helium 0x3d613 je-fall-through path: numDims < 3 → force to 1
      this.numDims = 1;
    }
    // else numDims == 3 → leave as-is (the earlier store already set it).
  }

  /**
   * `HGApplyNDLUTInfo::getNumBins() const` — Helium @0x3d620.
   *   movq 0x8(%rdi), %rax; ret   → returns u64 field @0x8.
   */
  getNumBins(): number {
    // @Helium 0x3d624
    return this.numBins;
  }

  /**
   * `HGApplyNDLUTInfo::getNumDims() const` — Helium @0x3d630.
   *   movq 0x10(%rdi), %rax; ret  → returns u64 field @0x10.
   */
  getNumDims(): number {
    // @Helium 0x3d634
    return this.numDims;
  }

  /**
   * `HGApplyNDLUTInfo::getRangeScale() const` — Helium @0x3d640.
   *   movss 0x18(%rdi), %xmm0; ret  → returns f32 field @0x18.
   */
  getRangeScale(): number {
    // @Helium 0x3d644
    return this.rangeScale;
  }

  /**
   * `HGApplyNDLUTInfo::getRangeOffset() const` — Helium @0x3d650.
   * Body (raw bytes at file offset 0x4000+0x3d650 = 55 48 89 e5 f3 0f 10 47 1c 5d c3):
   *   pushq %rbp; movq %rsp,%rbp; movss 0x1c(%rdi),%xmm0; popq %rbp; retq.
   * (Not visible under `otool -tV` due to ICF-adjacent labeling; recovered
   *  by direct file read.)
   */
  getRangeOffset(): number {
    // @Helium 0x3d654 (movss 0x1c(%rdi),%xmm0)
    return this.rangeOffset;
  }

  /**
   * `HGApplyNDLUTInfo::getLUTStorageFormat() const` — Helium @0x3d660.
   *   movl 0x20(%rdi), %eax; ret  → returns u32 field @0x20.
   */
  getLUTStorageFormat(): LUTStorageFormat {
    // @Helium 0x3d664
    return this.storage;
  }

  /**
   * `HGApplyNDLUTInfo::getLUTHGStorageFormat() const` — Helium @0x3d670.
   *
   *   0x3d674: movl  0x20(%rdi), %eax          ; eax = storage
   *   0x3d677: xorl  %ecx, %ecx
   *   0x3d679: cmpl  $0x1, %eax                 ; storage == 1?
   *   0x3d67c: setne %cl                        ; cl = (storage != 1)
   *   0x3d67f: addl  $0x1b, %ecx                ; ecx = 0x1b + (storage != 1)
   *                                              ;      = 0x1b if storage==1 else 0x1c
   *   0x3d682: testl %eax, %eax                 ; storage == 0?
   *   0x3d684: movl  $0x19, %eax                ; eax = 0x19 (default: storage==0 case)
   *   0x3d689: cmovnel %ecx, %eax              ; if storage != 0 → eax = ecx
   *   0x3d68d: retq
   *
   * Truth table:
   *   storage == 0  → 0x19
   *   storage == 1  → 0x1b
   *   otherwise     → 0x1c
   */
  getLUTHGStorageFormat(): number {
    // @Helium 0x3d674..0x3d68d — exact three-way mapping.
    if (this.storage === 0) return 0x19;
    if (this.storage === 1) return 0x1b;
    return 0x1c;
  }

  /**
   * `HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo* other) const` — Helium @0x3d690.
   *
   *   0x3d697: testq  %rsi, %rsi                ; if other == null
   *   0x3d69a: je     0x3d716                    ;   → return 0
   *   0x3d69f: movq   0x9c4c3a(%rip), %rax       ; = &__ZTIN10HGLUTCache7LUTInfoE  (typeinfo for LUTInfo)
   *   0x3d6a6: leaq   __ZTI16HGApplyNDLUTInfo(%rip), %rdx  ; typeinfo for HGApplyNDLUTInfo
   *   0x3d6ad: xorl   %r14d, %r14d               ; result = 0
   *   0x3d6b8: callq  0x3c5018                   ; ___dynamic_cast(other, LUTInfo_ti,
   *                                              ;                 HGApplyNDLUTInfo_ti, 0)
   *   0x3d6bd: testq  %rax, %rax                 ; if dynamic_cast returned null
   *   0x3d6c0: je     0x3d719                    ;   → return 0
   *   0x3d6c2: movq   0x8(%rbx), %rcx            ; this->numBins
   *   0x3d6c6: cmpq   0x8(%rax), %rcx            ; == other->numBins?
   *   0x3d6ca: jne    0x3d716                    ;   no → return 0
   *   0x3d6cc: movq   0x10(%rbx), %rcx           ; this->numDims
   *   0x3d6d0: cmpq   0x10(%rax), %rcx           ; == other->numDims?
   *   0x3d6d4: jne    0x3d716                    ;   no → return 0
   *   0x3d6d6: movss  0x18(%rbx), %xmm1
   *   0x3d6db: subss  0x18(%rax), %xmm1          ; diff = this->rangeScale - other->rangeScale
   *   0x3d6e0: andps  0x38a549(%rip), %xmm1      ; diff = |diff|  (mask @0x3c7c30 = 0x7fffffff x4)
   *   0x3d6e7: movss  0x38db71(%rip), %xmm0      ; xmm0 = epsilon (const @0x3cb260 = 1e-4f)
   *   0x3d6ef: ucomiss %xmm1, %xmm0              ; compare eps vs diff
   *   0x3d6f2: jbe    0x3d716                    ; if eps <= diff → return 0
   *   0x3d6f4: movss  0x1c(%rbx), %xmm1
   *   0x3d6f9: subss  0x1c(%rax), %xmm1          ; diff = this->rangeOffset - other->rangeOffset
   *   0x3d6fe: andps  0x38a52b(%rip), %xmm1      ; diff = |diff|
   *   0x3d705: ucomiss %xmm1, %xmm0
   *   0x3d708: jbe    0x3d716                    ; if eps <= diff → return 0
   *   0x3d70a: movl   0x20(%rbx), %ecx           ; this->storage
   *   0x3d70d: cmpl   0x20(%rax), %ecx           ; == other->storage?
   *   0x3d710: sete   %r14b                      ; r14 = (storage equal ? 1 : 0)
   *   0x3d714: jmp    0x3d719
   *   0x3d716: xorl   %r14d, %r14d               ; return 0
   *   0x3d719: movl   %r14d, %eax
   *   ; return r14 (bool)
   *
   * Epsilon constant @Helium 0x3cb260 verified from file: bytes 17 b7 d1 38
   * = f32 0x38d1b717 = ~9.999999747378752e-05 (Apple's canonical "float eps").
   * Abs-value mask @Helium 0x3c7c30 verified from file: 0x7fffffff repeated.
   */
  isEqual(other: HGApplyNDLUTInfo | null): boolean {
    // @Helium 0x3d697
    if (other == null) return false;
    // @Helium 0x3d6b8: dynamic_cast<HGApplyNDLUTInfo*>(other). In the TS
    // port we express this as an instanceof check — the class hierarchy
    // is our source of truth.
    if (!(other instanceof HGApplyNDLUTInfo)) return false;
    // @Helium 0x3d6c2..0x3d6ca
    if (this.numBins !== other.numBins) return false;
    // @Helium 0x3d6cc..0x3d6d4
    if (this.numDims !== other.numDims) return false;
    // @Helium 0x3d6d6..0x3d6f2: |this.rangeScale - other.rangeScale| < eps
    const eps = Math.fround(9.999999747378752e-05); // const @Helium 0x3cb260
    const dScale = Math.fround(Math.abs(Math.fround(this.rangeScale - other.rangeScale)));
    if (!(eps > dScale)) return false;
    // @Helium 0x3d6f4..0x3d708: |this.rangeOffset - other.rangeOffset| < eps
    const dOffset = Math.fround(Math.abs(Math.fround(this.rangeOffset - other.rangeOffset)));
    if (!(eps > dOffset)) return false;
    // @Helium 0x3d70a..0x3d710
    return this.storage === other.storage;
  }

  /**
   * `HGApplyNDLUTInfo::colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const`
   * — Helium @0x3d730.
   *
   *   0x3d734: movl $0x0, (%rsi)   ; *outR = 0.0f
   *   0x3d73a: movl $0x0, (%rdx)   ; *outG = 0.0f
   *   0x3d740: movl $0x0, (%rcx)   ; *outB = 0.0f
   *   0x3d746: movl $0x0, (%r8)    ; *outA = 0.0f
   *   0x3d74d: retq
   *
   * Base-class stub: zeroes all four outputs. Subclasses override on
   * vtable slot *0x20. The three f32 index inputs (xmm0..xmm2) are
   * intentionally not read here.
   */
  colorAtIndex(
    _r: number, _g: number, _b: number,
    outR: [number], outG: [number], outB: [number], outA: [number]
  ): void {
    // @Helium 0x3d734..0x3d746: all four outputs = 0.0f
    outR[0] = 0;
    outG[0] = 0;
    outB[0] = 0;
    outA[0] = 0;
  }

  /**
   * `HGApplyNDLUTInfo::~HGApplyNDLUTInfo()` — Helium @0x3c1670 (D1) / @0x3c1680 (D0).
   *
   * BOTH bodies are literally:
   *   pushq %rbp; movq %rsp, %rbp; ud2
   * i.e. an intentional trap (`ud2` = "undefined instruction, always #UD").
   * This class is never destroyed as a pure `HGApplyNDLUTInfo` — every
   * shipping usage is through a subclass that overrides both dtor slots.
   * The compiler emits `ud2` as a safety net so any accidental direct
   * delete crashes deterministically.
   *
   * Faithful port: raise. A subclass override is required.
   */
  destruct(): void {
    // @Helium 0x3c1670 / 0x3c1684: ud2 (trap).
    throw new Error(
      "HGApplyNDLUTInfo::~HGApplyNDLUTInfo() is a `ud2` trap in Helium " +
      "@0x3c1670 / D0 @0x3c1680 — subclasses must override both dtor slots."
    );
  }
}
