// HGRasterizerTextureUnit.ts — Helium.
//   HGRasterizerTextureUnit()                    [C1] @0x1954e0 (and dup C2 @0x1a0020)
//   ~HGRasterizerTextureUnit()                   [D1] @0x1959b0 (and dup D2 @0x1a00b0)
//   operator=(HGRasterizerTextureUnit&)               @0x1a0100
//   Copy(HGRasterizerTextureUnit*)                    @0x1a01c0
//
// Object layout (recovered from the ctor at 0x1954e0):
//   +0x00  HGTransform*  — heap-allocated HGTransform via HGObject::operator new,
//                          then HGTransform::HGTransform() (@0x1954ef/0x1954fa).
//                          Ref-counted: retained via vtable+0x10, released via
//                          vtable+0x18 (see operator= @0x1a0113/0x1a011f, dtor
//                          @0x1959bf, Copy @0x1a01d6 uses vtable+0x60).
//   +0x08  HGTransform   — 0x90-byte embedded HGTransform (ctor @0x195506,
//                          dtor tail-jmp @0x1959e1).
//   +0x98  void*         — optional secondary object pointer (default null
//                          @0x19550b; dtor virtual-releases via vtable+0x18
//                          when non-null @0x1959c9-0x1959d1). Frontier type.
//   +0xa0  uint64        — sentinel = 0xFFFFFFFFFFFFFFFFull (movsd from const
//                          @Helium 0x3caa80 @0x195516; movups zeros upper 8
//                          bytes so the qword at +0xa8 is set to 0 too).
//   +0xa8  uint64        — 0 (upper half of the movups).
//   +0xb0  HGRect        — 16-byte HGRect initialized to HGRectNull
//                          (leaq _HGRectNull(%rip) @0x195525-0x19552f).
//   +0xc0  uint8         — 0 (movw $0x0, 0xc0 covers +0xc0..+0xc1).
//   +0xc1  uint8         — 0 (upper half of the movw).
//   +0xc2  uint8         — 0 (movb $0x0, 0xc2 @0x19553f).
//   +0xc4..+0xd4 4 x f32 — 0 (xorps + movups @0x195546-0x195549).
//
// The heap HGTransform (+0x00) and the +0x98 pointer are both undecoded
// frontier smart-pointer surfaces; every retain/release call site is cited
// @0xADDR and raises rather than silently no-op'ing.

import { HGRect, HGRectNull } from "./HGRect";

/**
 * HGTransform — undecoded frontier (0x90-byte ref-counted object). Only two
 * surfaces are touched here (each cited at its sole use site):
 *   • vtable[+0x10]  retain-like   (used @0x1a011f)
 *   • vtable[+0x18]  release-like  (used @0x1959bf, @0x1959d1, @0x1a0113)
 *   • vtable[+0x60]  copy-into     (used @0x1a01d6 as HGTransform*::CopyFrom)
 *   • ctor __ZN11HGTransformC1Ev   (used @0x1954fa embedded, @0x195506 pointer target)
 *   • dtor __ZN11HGTransformD1Ev   (used @0x1959e1 tail-jmp)
 */
export interface HGTransform {
  readonly __tag: "HGTransform";
}

/**
 * HGRasterizerTextureUnit — a rasterizer's per-texture-unit state (a
 * heap-owned HGTransform, an embedded HGTransform, a per-unit sampler
 * pointer, a sentinel qword, an HGRect ROI, three bytes of flags, and
 * four floats).
 */
export class HGRasterizerTextureUnit {
  /** +0x00 — heap HGTransform pointer (owned; retain/release ref-counted). */
  public transformPtr: HGTransform | null = null;
  /** +0x08 — embedded HGTransform (0x90 bytes). */
  public transformInline: HGTransform | null = null;
  /** +0x98 — optional secondary object (undecoded frontier smart pointer). */
  public secondaryPtr: unknown = null;
  /** +0xa0 — sentinel u64 (initialized to 0xFFFFFFFFFFFFFFFFull @Helium 0x195516). */
  public sentinelLo: bigint = 0xFFFFFFFFFFFFFFFFn;
  /** +0xa8 — u64 (upper half of the movups, initialized to 0 @Helium 0x19551e). */
  public sentinelHi: bigint = 0n;
  /** +0xb0 — HGRect ROI (initialized to HGRectNull @Helium 0x195525-0x19552f). */
  public roi: HGRect = HGRectNull;
  /** +0xc0 — uint8 (movw $0 covers +0xc0..+0xc1 @Helium 0x195536). */
  public flag0: number = 0;
  /** +0xc1 — uint8 (upper half of same movw). */
  public flag1: number = 0;
  /** +0xc2 — uint8 (movb $0 @Helium 0x19553f). */
  public flag2: number = 0;
  /** +0xc4 — f32 (xorps+movups @Helium 0x195546-0x195549). */
  public f0: number = 0;
  /** +0xc8 — f32 (same movups). */
  public f1: number = 0;
  /** +0xcc — f32 (same movups). */
  public f2: number = 0;
  /** +0xd0 — f32 (same movups). */
  public f3: number = 0;

  /**
   * HGRasterizerTextureUnit::HGRasterizerTextureUnit() — Helium @0x1954e0 (C1).
   * The C2 body at 0x1a0020 is identical; both are dispatched to this ctor.
   *
   *   movl  $0x90, %edi
   *   callq __ZN8HGObjectnwEm            ; ptr = HGObject::operator new(0x90)  @0x1954ef
   *   movq  %rax, %rdi
   *   callq __ZN11HGTransformC1Ev        ; HGTransform::HGTransform() on ptr    @0x1954fa
   *   movq  %r14, (%rbx)                 ; this->transformPtr = ptr             @0x1954ff
   *   leaq  0x8(%rbx), %rdi
   *   callq __ZN11HGTransformC1Ev        ; HGTransform::HGTransform() on this+8  @0x195506
   *   movq  $0x0, 0x98(%rbx)             ; this->secondaryPtr = null            @0x19550b
   *   movsd 0x235562(%rip), %xmm0        ; xmm0[63:0] = *(0x3caa80) = 0xffffffff_ffffffff
   *   movups %xmm0, 0xa0(%rbx)           ; +0xa0 = sentinelLo, +0xa8 = 0        @0x195516-0x19551e
   *   leaq  _HGRectNull(%rip), %rax
   *   movups (%rax), %xmm0
   *   movups %xmm0, 0xb0(%rbx)           ; this->roi = _HGRectNull              @0x195525-0x19552f
   *   movw  $0x0, 0xc0(%rbx)             ; flag0 = flag1 = 0                    @0x195536
   *   movb  $0x0, 0xc2(%rbx)             ; flag2 = 0                            @0x19553f
   *   xorps %xmm0, %xmm0
   *   movups %xmm0, 0xc4(%rbx)           ; f0..f3 = 0                            @0x195546-0x195549
   */
  public constructor() { // @Helium 0x1954e0
    // @Helium 0x1954ef-0x1954fa — allocate + construct the owned HGTransform.
    // HGObject::operator new and HGTransform::HGTransform() are both
    // undecoded frontier callees, so any use of the pointer must raise.
    // We install a "not-yet-constructed" sentinel here and defer the raise
    // to the actual dereference sites (dtor, operator=, Copy).
    this.transformPtr = null;
    // @Helium 0x195506 — embedded HGTransform ctor.
    this.transformInline = null;
    // @Helium 0x19550b — secondaryPtr = null.
    this.secondaryPtr = null;
    // @Helium 0x195516-0x19551e — sentinel initialisation (already default).
    // @Helium 0x195525-0x19552f — roi = HGRectNull (already default).
    // Remaining scalar fields already default to 0.
  }

  /**
   * HGRasterizerTextureUnit::~HGRasterizerTextureUnit() — Helium @0x1959b0 (D1).
   * D2 at 0x1a00b0 is the identical body.
   *
   *   movq  (%rdi), %rdi                 ; rdi = this->transformPtr
   *   movq  (%rdi), %rax                 ; rax = HGTransform vtable
   *   callq *0x18(%rax)                  ; HGTransform release             @0x1959bf
   *   movq  0x98(%rbx), %rdi             ; rdi = this->secondaryPtr
   *   testq %rdi, %rdi; je 0x1959d4
   *   movq  (%rdi), %rax
   *   callq *0x18(%rax)                  ; secondary release               @0x1959d1
   *   addq  $0x8, %rbx                   ; embedded HGTransform is at this+0x8
   *   jmp   __ZN11HGTransformD1Ev        ; HGTransform::~HGTransform()     @0x1959e1
   */
  public destroy(): void { // @Helium 0x1959b0
    // @Helium 0x1959bf — HGTransform release-slot (vtable+0x18).
    throw new Error(
      "HGRasterizerTextureUnit::~HGRasterizerTextureUnit: HGTransform release via " +
      "vtable+0x18 not yet transcribed (@Helium 0x1959bf; " +
      "and if secondary != null, @Helium 0x1959d1; and HGTransform::~HGTransform " +
      "@Helium 0x1959e1)",
    );
  }

  /**
   * HGRasterizerTextureUnit::operator=(HGRasterizerTextureUnit&) — Helium @0x1a0100.
   *
   *   movq  (%rdi), %rdi                 ; rdi = this->transformPtr
   *   movq  (%rdi), %rax
   *   callq *0x18(%rax)                  ; release old transformPtr         @0x1a0113
   *   movq  (%r14), %rdi                 ; rdi = rhs.transformPtr
   *   movq  %rdi, (%rbx)                 ; this->transformPtr = rhs.transformPtr
   *   movq  (%rdi), %rax
   *   callq *0x10(%rax)                  ; retain new transformPtr          @0x1a011f
   *   movups 0xa0(%r14), %xmm0
   *   movups %xmm0, 0xa0(%rbx)           ; copy sentinelLo/Hi              @0x1a0122-0x1a012a
   *   movups 0xb0(%r14), %xmm0
   *   movups %xmm0, 0xb0(%rbx)           ; copy roi                          @0x1a0131-0x1a0139
   *   movzbl 0xc0(%r14),%eax; movb %al,0xc0(%rbx)   ; copy flag0             @0x1a0140-0x1a0148
   *   movzbl 0xc1(%r14),%eax; movb %al,0xc1(%rbx)   ; copy flag1             @0x1a014e-0x1a0156
   *   movzbl 0xc2(%r14),%eax; movb %al,0xc2(%rbx)   ; copy flag2             @0x1a015c-0x1a0164
   *   movss  0xc4(%r14),%xmm0; movss %xmm0,0xc4(%rbx)  ; copy f0             @0x1a016a-0x1a0173
   *   movss  0xc8(%r14),%xmm0; movss %xmm0,0xc8(%rbx)  ; copy f1             @0x1a017b-0x1a0184
   *   movss  0xcc(%r14),%xmm0; movss %xmm0,0xcc(%rbx)  ; copy f2             @0x1a018c-0x1a0195
   *   movss  0xd0(%r14),%xmm0; movss %xmm0,0xd0(%rbx)  ; copy f3             @0x1a019d-0x1a01a6
   *
   * Notably: the embedded HGTransform at +0x08 is NOT copied by operator= —
   * only the pointer at +0x00 is release/reassign/retain'd. The secondaryPtr
   * at +0x98 is also NOT touched. This is faithful to the disasm.
   */
  public assign(rhs: HGRasterizerTextureUnit): void { // @Helium 0x1a0100
    // @Helium 0x1a0113 — release old transformPtr via vtable+0x18.
    throw new Error(
      "HGRasterizerTextureUnit::operator=: HGTransform release via vtable+0x18 " +
      "(@Helium 0x1a0113) and retain via vtable+0x10 (@Helium 0x1a011f) not yet transcribed",
    );
    // What would follow, once the transform release/retain frontier is decoded:
    //   this.transformPtr = rhs.transformPtr;
    //   // retain rhs.transformPtr via vtable+0x10
    //   this.sentinelLo = rhs.sentinelLo;    // @0x1a0122
    //   this.sentinelHi = rhs.sentinelHi;    // @0x1a0122
    //   this.roi = rhs.roi;                  // @0x1a0131
    //   this.flag0 = rhs.flag0;              // @0x1a0140
    //   this.flag1 = rhs.flag1;              // @0x1a014e
    //   this.flag2 = rhs.flag2;              // @0x1a015c
    //   this.f0 = Math.fround(rhs.f0);       // @0x1a016a
    //   this.f1 = Math.fround(rhs.f1);       // @0x1a017b
    //   this.f2 = Math.fround(rhs.f2);       // @0x1a018c
    //   this.f3 = Math.fround(rhs.f3);       // @0x1a019d
    //   void rhs;
  }

  /**
   * HGRasterizerTextureUnit::Copy(HGRasterizerTextureUnit*) — Helium @0x1a01c0.
   * Unlike operator=, Copy uses vtable slot +0x60 of the HGTransform pointer
   * (a deep-copy / CopyFrom method) rather than retain/release, and it does
   * NOT reassign the pointer:
   *
   *   movq  (%rdi), %rdi                 ; rdi = this->transformPtr
   *   movq  (%rsi), %rsi                 ; rsi = src->transformPtr
   *   movq  (%rdi), %rax
   *   callq *0x60(%rax)                  ; transformPtr->CopyFrom(src.transformPtr) @0x1a01d6
   *   [same +0xa0..+0xd0 copy as operator= — see disasm citations]
   */
  public Copy(src: HGRasterizerTextureUnit): void { // @Helium 0x1a01c0
    // @Helium 0x1a01d6 — HGTransform::vtable[+0x60] CopyFrom-slot.
    throw new Error(
      "HGRasterizerTextureUnit::Copy: HGTransform::CopyFrom via vtable+0x60 " +
      "(@Helium 0x1a01d6) not yet transcribed",
    );
    // What would follow, once the CopyFrom frontier is decoded (identical to
    // operator= for the scalar-tail block, minus the pointer reassignment):
    //   this.sentinelLo = src.sentinelLo;    // @0x1a01d9
    //   this.sentinelHi = src.sentinelHi;    // @0x1a01d9
    //   this.roi = src.roi;                  // @0x1a01e8
    //   this.flag0 = src.flag0;              // @0x1a01f7
    //   this.flag1 = src.flag1;              // @0x1a0205
    //   this.flag2 = src.flag2;              // @0x1a0213
    //   this.f0 = Math.fround(src.f0);       // @0x1a0221
    //   this.f1 = Math.fround(src.f1);       // @0x1a0232
    //   this.f2 = Math.fround(src.f2);       // @0x1a0243
    //   this.f3 = Math.fround(src.f3);       // @0x1a0254
    //   void src;
  }
}
