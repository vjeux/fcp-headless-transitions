/**
 * HRasterizerGenerator — Helium framework (channels layer)
 *
 * Trivial wrapper class that layers on top of `HgcRasterizerGenerator` (lowercase
 * `gc` — the actual implementation class): its constructor delegates to the base
 * ctor, patches in its own vtable, initialises a 4-float parameter slot at
 * +0x1a0..+0x1b0 to `[1.0, 1.0, 1.0, 1.0]`, then calls the base
 * `SetParameter(0, 1.0, 1.0, 1.0, 1.0)` — the classic "start with an identity /
 * white / unit rasterizer parameter" pattern. Both destructors just tail-call
 * the base D2 and (for the deleting variant) `HGObject::operator delete`.
 *
 * FOUR SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
 *   @Helium 0x30e00  HRasterizerGenerator::HRasterizerGenerator()   [C2]
 *   @Helium 0x30e60  HRasterizerGenerator::HRasterizerGenerator()   [C1]
 *                     (C1 and C2 differ ONLY in the RIP-relative displacements
 *                      of the vtable pointer / 4-float const / SetParameter
 *                      float const — the compiler emitted two verbatim copies
 *                      whose targets are the same absolute VAs.)
 *   @Helium 0x30ec0  HRasterizerGenerator::~HRasterizerGenerator()  [D1 base dtor]
 *   @Helium 0x30ed0  HRasterizerGenerator::~HRasterizerGenerator()  [D0 deleting dtor]
 *
 * RIP-relative constants (bytes read directly from the __TEXT slice, offset 0x4000):
 *   @0x30e0f leaq 0x9d49ea(%rip)  → VA 0xa05800  — _ZTV20HRasterizerGenerator vtable pointer
 *                                                  (nm exposes _ZTV20HRasterizerGenerator @ a
 *                                                   different symbol-table VA 0x957a58; the
 *                                                   RIP form here targets the vtable image
 *                                                   plus the +0x10 RTTI-header skip.)
 *   @0x30e19 movaps 0x396e20(%rip) → VA 0x3c7c40 — 16 bytes = { 1.0f, 1.0f, 1.0f, 1.0f }
 *                                                  (raw bytes: 00 00 80 3f × 4 — verified.)
 *   @0x30e27 movss  0x396e91(%rip) → VA 0x3c7cc0 — 4 bytes  = 1.0f
 *                                                  (raw bytes: 00 00 80 3f — verified.)
 *
 * External callees (all sibling / base class methods — not yet ported):
 *   __ZN22HgcRasterizerGeneratorC2Ev            HgcRasterizerGenerator::HgcRasterizerGenerator()   @0x30e0a / @0x30e6a / (dtor cleanup: @0x30e4d / @0x30ead / @0x30ec5 / @0x30ed9)
 *   __ZN22HgcRasterizerGenerator12SetParameterEiffff  HgcRasterizerGenerator::SetParameter(int, float, float, float, float)  @0x30e3d / @0x30e9d
 *   __ZN22HgcRasterizerGeneratorD2Ev            HgcRasterizerGenerator::~HgcRasterizerGenerator()  @0x30e4d / @0x30ead / @0x30ec5 / @0x30ed9
 *   __ZN8HGObjectdlEPv                          HGObject::operator delete(void*)                    @0x30ee7 (tail)
 *   __Unwind_Resume (via 0x3c4e02 stub)        Itanium exception unwinder                          @0x30e55 / @0x30eb5 (cold)
 *
 * STRUCT LAYOUT (partial, recovered from stores):
 *   +0x000  vtable ptr                (patched by this class to VA 0xa05800; base leaves its
 *                                       own vtable there, and we overwrite at @0x30e16)
 *   +0x000..+0x1a0  base HgcRasterizerGenerator fields (opaque here)
 *   +0x1a0  float rasterizerParams[4] (initialised to {1.0f, 1.0f, 1.0f, 1.0f} at @0x30e20)
 *
 * The base class name suggests `Rasterizer` in the Helium graphics pipeline — the "generator"
 * suffix and `SetParameter(int, float×4)` API match the Helium "Hgc*Generator" family (e.g.
 * `HgcRasterizerGenerator` alongside sibling `HgcQuadPlanarReader`, `HgcCrop`, etc.).
 */

/** Opaque base class — HgcRasterizerGenerator. Real class is not ported yet.
 *  Every entry point is a throwing stub citing its Helium @0xADDR. */
export interface HgcRasterizerGeneratorBase {
  /** @Helium 0x1a0-byte struct — the base + this-class layout. Base fields opaque. */
  rasterizerParams: [number, number, number, number]; // +0x1a0..+0x1b0 (fp32 lanes)
  /** @Helium __ZN22HgcRasterizerGenerator12SetParameterEiffff — base method.
   *  Contract only; unported callee. */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** @Helium __ZN22HgcRasterizerGeneratorD2Ev — base D2 dtor. Contract only. */
  D2destroy(): void;
}

/** Throwing default for the base ctor — @Helium 0x30e0a external
 *  __ZN22HgcRasterizerGeneratorC2Ev (unported callee). */
export function HgcRasterizerGenerator_C2_notLinked(): HgcRasterizerGeneratorBase {
  throw new Error("HgcRasterizerGenerator::HgcRasterizerGenerator() unported base ctor @Helium 0x30e0a");
}

/** Throwing default for the base D2 dtor — @Helium 0x30e4d/0x30ec5/0x30ed9 external
 *  __ZN22HgcRasterizerGeneratorD2Ev (unported callee). */
export function HgcRasterizerGenerator_D2_notLinked(_this: HgcRasterizerGeneratorBase): void {
  throw new Error("HgcRasterizerGenerator::~HgcRasterizerGenerator() unported base D2 dtor @Helium 0x30ec5");
}

/** Throwing default for HGObject::operator delete — @Helium 0x30ee7 external
 *  __ZN8HGObjectdlEPv (unported callee). */
export function HGObject_operator_delete_notLinked(_p: unknown): void {
  throw new Error("HGObject::operator delete(void*) unported callee @Helium 0x30ee7");
}

/** Injected base-class shim so this class stays honest without pulling in the full base port. */
export interface HRasterizerGeneratorBaseOps {
  construct(): HgcRasterizerGeneratorBase;
  destroy(base: HgcRasterizerGeneratorBase): void;
  operatorDelete(p: unknown): void;
}

export const HRasterizerGenerator_defaultBaseOps: HRasterizerGeneratorBaseOps = {
  construct: HgcRasterizerGenerator_C2_notLinked,
  destroy: HgcRasterizerGenerator_D2_notLinked,
  operatorDelete: HGObject_operator_delete_notLinked,
};

export class HRasterizerGenerator {
  /** +0x000 in the C++ struct — vtable pointer. Set by this class's ctor to VA
   *  0xa05800 (= _ZTV20HRasterizerGenerator + 0x10, skipping RTTI header). */
  vtable_va: number = 0;
  /** The base subobject — the C++ code composes HRasterizerGenerator on top of
   *  HgcRasterizerGenerator, whose fields fill +0x000..+0x1a0 of the object.
   *  We embed it as a nested field to keep offset semantics visible. */
  base: HgcRasterizerGeneratorBase;

  /**
   * @Helium 0x30e00  __ZN20HRasterizerGeneratorC2Ev
   * @Helium 0x30e60  __ZN20HRasterizerGeneratorC1Ev  (semantically identical)
   *
   * Faithful transcription of C2 (28 lines):
   *   0x30e00 pushq %rbp / movq %rsp,%rbp
   *   0x30e04 pushq %r14 / pushq %rbx                  ; frame + spill
   *   0x30e07 movq  %rdi, %rbx                         ; rbx = this
   *   0x30e0a callq HgcRasterizerGenerator::HgcRasterizerGenerator()   ; base ctor
   *   0x30e0f leaq  0x9d49ea(%rip), %rax               ; rax = VA 0xa05800 (this-class vtable + 0x10)
   *   0x30e16 movq  %rax, (%rbx)                       ; this->vtable = 0xa05800  (patch over base)
   *   0x30e19 movaps 0x396e20(%rip), %xmm0             ; xmm0 = 16B at VA 0x3c7c40 = {1.0,1.0,1.0,1.0}
   *   0x30e20 movups %xmm0, 0x1a0(%rbx)                ; this->rasterizerParams[0..3] = {1,1,1,1}
   *   0x30e27 movss  0x396e91(%rip), %xmm0             ; xmm0 = 4B at VA 0x3c7cc0 = 1.0f
   *   0x30e2f movq   %rbx, %rdi                        ; arg1 = this
   *   0x30e32 xorl   %esi, %esi                        ; arg2 = 0 (int idx)
   *   0x30e34 movaps %xmm0, %xmm1 / %xmm2 / %xmm3      ; arg3..arg6 = 1.0f, 1.0f, 1.0f (broadcast)
   *   0x30e3d callq  HgcRasterizerGenerator::SetParameter(this, 0, 1.0f, 1.0f, 1.0f, 1.0f)
   *   0x30e42 popq %rbx / popq %r14 / popq %rbp / retq
   *   -- exception path (@0x30e47..0x30e55) --
   *   If SetParameter (or, less likely, the vtable/param stores) throws:
   *     tail-call HgcRasterizerGenerator::~HgcRasterizerGenerator() to unwind,
   *     then __Unwind_Resume. Not modelled in TS body — JS exceptions bubble
   *     naturally without needing manual unwinders.
   *
   * Reduced semantics:
   *   HgcRasterizerGenerator::HgcRasterizerGenerator(this);
   *   this->vtable = 0xa05800;
   *   this->rasterizerParams = [1.0f, 1.0f, 1.0f, 1.0f];
   *   HgcRasterizerGenerator::SetParameter(this, 0, 1.0f, 1.0f, 1.0f, 1.0f);
   *
   * fp32-narrowed via Math.fround on the four 1.0f writes (they are single-precision
   * lanes coming from a 16-byte aligned constant pool).
   */
  constructor(baseOps: HRasterizerGeneratorBaseOps = HRasterizerGenerator_defaultBaseOps) {
    // @0x30e0a — HgcRasterizerGenerator::HgcRasterizerGenerator(this)
    this.base = baseOps.construct();
    // @0x30e16 — this->vtable = 0xa05800  (patch over base's vtable pointer)
    this.vtable_va = 0xa05800;
    // @0x30e20 — this->rasterizerParams[0..3] = {1.0f, 1.0f, 1.0f, 1.0f}  (fp32-narrowed lanes)
    this.base.rasterizerParams = [
      Math.fround(1.0),
      Math.fround(1.0),
      Math.fround(1.0),
      Math.fround(1.0),
    ];
    // @0x30e3d — base.SetParameter(0, 1.0f, 1.0f, 1.0f, 1.0f)
    this.base.SetParameter(
      0,
      Math.fround(1.0),
      Math.fround(1.0),
      Math.fround(1.0),
      Math.fround(1.0),
    );
    // @0x30e46 — ret
  }

  /**
   * @Helium 0x30ec0  __ZN20HRasterizerGeneratorD1Ev
   *
   * Faithful transcription (6 lines):
   *   0x30ec0 pushq %rbp / movq %rsp,%rbp
   *   0x30ec4 popq  %rbp
   *   0x30ec5 jmp   HgcRasterizerGenerator::~HgcRasterizerGenerator()  ; tail
   *
   * Reduced semantics: tail-call base D2. That's it.
   */
  destroy_base(baseOps: HRasterizerGeneratorBaseOps = HRasterizerGenerator_defaultBaseOps): void {
    // @0x30ec5 — tail-call HgcRasterizerGenerator::~HgcRasterizerGenerator(this)
    baseOps.destroy(this.base);
  }

  /**
   * @Helium 0x30ed0  __ZN20HRasterizerGeneratorD0Ev
   *
   * Faithful transcription (12 lines):
   *   0x30ed0 pushq %rbp / movq %rsp,%rbp
   *   0x30ed4 pushq %rbx / pushq %rax
   *   0x30ed6 movq  %rdi, %rbx                       ; rbx = this
   *   0x30ed9 callq HgcRasterizerGenerator::~HgcRasterizerGenerator(this)
   *   0x30ede movq  %rbx, %rdi                       ; restore this for op delete
   *   0x30ee1 addq  $0x8,%rsp / popq %rbx / popq %rbp
   *   0x30ee7 jmp   HGObject::operator delete(void*) ; tail
   *
   * Reduced semantics:
   *   HgcRasterizerGenerator::~HgcRasterizerGenerator(this);
   *   HGObject::operator delete(this);
   */
  destroy_deleting(baseOps: HRasterizerGeneratorBaseOps = HRasterizerGenerator_defaultBaseOps): void {
    // @0x30ed9 — base D2
    baseOps.destroy(this.base);
    // @0x30ee7 — HGObject::operator delete(this)  (tail-call)
    baseOps.operatorDelete(this);
  }
}
