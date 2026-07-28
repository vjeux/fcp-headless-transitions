// ApplyReflectivity.ts — Ozone's reflectivity finish operator.
//
// Faithful transcription of Ozone.framework's `ApplyReflectivity` class
// (7 exported symbols total; C1/C2, D0/D1, both eval overloads, writeHash).
//
// Framework: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/
//                  Ozone.framework/Versions/A/Ozone).
//
// Ported symbols (all @Ozone):
//   @0x00000000001e16e0  ApplyReflectivity::ApplyReflectivity(int)  [C2]
//                        __ZN17ApplyReflectivityC2Ei
//   @0x00000000001e1760  ApplyReflectivity::ApplyReflectivity(int)  [C1]
//                        __ZN17ApplyReflectivityC1Ei
//                        (Ozone maps both C1 and C2 to the same body block;
//                         the disasm at 0x1e1760 is the shared code.)
//   @0x00000000001e17f0  ApplyReflectivity::eval(LayerContext const&,
//                                                SurfaceProperties&)
//                        __ZN17ApplyReflectivity4evalERK12LayerContextR17SurfaceProperties
//   @0x00000000001e1a80  ApplyReflectivity::eval(LayerContext const&,
//                                                ProShade::VarT<ProShade::Node>&)
//                        __ZN17ApplyReflectivity4evalERK12LayerContextRN8ProShade4VarTINS3_4NodeEEE
//   @0x00000000001e1c00  ApplyReflectivity::writeHash(PCHashWriteStream&)
//                        __ZN17ApplyReflectivity9writeHashER17PCHashWriteStream
//   @0x00000000001e3530  ApplyReflectivity::~ApplyReflectivity()  [D1]
//                        __ZN17ApplyReflectivityD1Ev
//   @0x00000000001e3590  ApplyReflectivity::~ApplyReflectivity()  [D0]
//                        __ZN17ApplyReflectivityD0Ev
//
// Callees / symbol imports discovered by walking the disasm:
//   @0x00000000001e3960  setUpFinishUniforms(int)                  [static, Ozone]
//                        __ZL19setUpFinishUniformsi
//   @0x000000000093d8a0  finishUniforms                            [static data]
//                        __ZL14finishUniforms
//                        (a vector<pair<ProShade::VarT<UniformNode>*,
//                          ProShade::Uniform*>*> or similar; per-slot stride
//                        is 0x10 — the ctor indexes as `finishUniforms[i<<4]`
//                        and reads `+0x20` off the loaded pointer.)
//   @Ozone stub  __ZN13PCSharedCountC1Ev
//                PCSharedCount::PCSharedCount()
//   @Ozone stub  __ZN13PCSharedCountC1ERKS_
//                PCSharedCount::PCSharedCount(PCSharedCount const&)
//   @Ozone stub  __ZN13PCSharedCountaSES_
//                PCSharedCount::operator=(PCSharedCount)
//   @Ozone stub  __ZN13PCSharedCountD1Ev
//                PCSharedCount::~PCSharedCount()
//   @Ozone stub  __ZN13PCShared_baseD2Ev
//                PCShared_base::~PCShared_base()
//   @Ozone stub  __ZN8ProShademlERKNS_4VarTINS_4NodeEEES4_
//                ProShade::operator*(ProShade::VarT<Node> const&,
//                                    ProShade::VarT<Node> const&)
//   @Ozone stub  __ZN18PC_Sp_counted_base12weak_releaseEv
//                PC_Sp_counted_base::weak_release()
//   @Ozone stub  __ZN23LiMaterialLayerOperator9writeHashER17PCHashWriteStream
//                LiMaterialLayerOperator::writeHash(PCHashWriteStream&)
//   @Ozone stub  __ZdlPv                             operator delete(void*)
//   @Ozone stub  ___clang_call_terminate / ___stack_chk_fail / __Unwind_Resume
//                — landing pads only (no observable side effect on happy path).
//
// STRUCT LAYOUT (recovered from ctor 0x1e1760 and dtors 0x1e3530/0x1e3590):
//   +0x00  vptr(ApplyReflectivity)          @0x1e177c..@0x1e1783 install
//                                            (RIP+0x661cbd from 0x1e177c ⇒
//                                             the ApplyReflectivity vtable).
//   +0x08  ProShade::Uniform*               @0x1e179b..@0x1e17ae —
//                                            `finishUniforms[i<<4] + 0x20`;
//                                            a pointer to the specific
//                                            reflectivity uniform block set
//                                            up by setUpFinishUniforms.
//                                            (The dispatch sub-vtable +0x8 in
//                                            eval-node overload calls
//                                            through `[+0x10 of *rdi] = *(...)`
//                                            after this ptr, so this is a
//                                            polymorphic Uniform reference,
//                                            not raw data.)
//   +0x10  void*                            @0x1e17b2 — cleared to NULL by
//                                            the ctor; loaded by both eval
//                                            overloads and tested for NULL.
//                                            When non-null, its vtable slot
//                                            @+0x10 (float-eval)/+0x18
//                                            (node-eval) is invoked with %rdx
//                                            = the SurfaceProperties/VarT
//                                            output argument — i.e. an
//                                            OPTIONAL "prev operator" chain
//                                            hook installed by upstream code.
//   +0x18  PCSharedCount                    @0x1e17be ctor call —
//                                            LiMaterialLayerOperator base
//                                            subobject's shared-count block.
//   +0x20  vptr(subobject: LiMaterialLayerOperator)  @0x1e178d install
//                                            (RIP+0x661cfb from 0x1e1786).
//   +0x28  PC_Sp_counted_base*              @0x1e1774 cleared to NULL;
//                                            dtor D1/D0 null-checks &
//                                            calls weak_release when set.
//
// Verification: the ledger entry for ApplyReflectivity lists exactly these
// 7 symbols (see raw-port/army/tools/brief.py output). No frontier callee
// class (PCSharedCount, PCShared_base, ProShade::Uniform, ProShade::VarT<Node>)
// is dereferenced past its vtable slot here — all struct access is by
// offset citation.

import { LiMaterialLayerOperator } from "./LiMaterialLayerOperator";
import type {
  LayerContext,
  SurfaceProperties,
  ProShadeNode,
  ProShadeVarT,
} from "./LiMaterialLayerOperator";

/* ------------------------------------------------------------------------- *
 * External stubs — every one throws citing its @0xADDR (Rule 3).
 * ------------------------------------------------------------------------- */

/**
 * `PCSharedCount::PCSharedCount()` — default-construct a shared-count block.
 * External stub, @Ozone symbol stub for __ZN13PCSharedCountC1Ev
 * (resolved through the ext-jump table at ~0x6ddae8). Not yet transcribed.
 */
function PCSharedCount_ctor_default_stub(_this: unknown): void {
  throw new Error(
    "PCSharedCount::PCSharedCount() @Ozone stub 0x6ddae8 " +
      "(__ZN13PCSharedCountC1Ev) not yet transcribed",
  );
}

/**
 * `PCSharedCount::PCSharedCount(PCSharedCount const&)` — copy-construct.
 * External stub, @Ozone symbol stub for __ZN13PCSharedCountC1ERKS_
 * (~0x6ddae2). Not yet transcribed.
 */
function PCSharedCount_ctor_copy_stub(_this: unknown, _other: unknown): void {
  throw new Error(
    "PCSharedCount::PCSharedCount(PCSharedCount const&) @Ozone stub 0x6ddae2 " +
      "(__ZN13PCSharedCountC1ERKS_) not yet transcribed",
  );
}

/**
 * `PCSharedCount::operator=(PCSharedCount)` — assignment. External stub,
 * @Ozone symbol stub for __ZN13PCSharedCountaSES_ (~0x6ddaf4). Not yet
 * transcribed.
 */
function PCSharedCount_assign_stub(_this: unknown, _rhs: unknown): void {
  throw new Error(
    "PCSharedCount::operator=(PCSharedCount) @Ozone stub 0x6ddaf4 " +
      "(__ZN13PCSharedCountaSES_) not yet transcribed",
  );
}

/**
 * `PCSharedCount::~PCSharedCount()` — destructor. External stub, @Ozone
 * symbol stub for __ZN13PCSharedCountD1Ev (~0x6ddaee). Not yet transcribed.
 */
function PCSharedCount_dtor_stub(_this: unknown): void {
  throw new Error(
    "PCSharedCount::~PCSharedCount() @Ozone stub 0x6ddaee " +
      "(__ZN13PCSharedCountD1Ev) not yet transcribed",
  );
}

/**
 * `ProShade::operator*(VarT<Node> const&, VarT<Node> const&)` — the
 * shader-graph multiply node. External stub, @Ozone symbol stub for
 * __ZN8ProShademlERKNS_4VarTINS_4NodeEEES4_ (~0x6df1da). Not yet
 * transcribed. Called by both eval overloads to compose the reflectivity
 * uniform against the incoming color/normal/specular VarT<Node>.
 */
function ProShade_operator_multiply_stub(
  _out: unknown,
  _lhs: unknown,
  _rhs: unknown,
): void {
  throw new Error(
    "ProShade::operator*(VarT<Node> const&, VarT<Node> const&) @Ozone stub 0x6df1da " +
      "(__ZN8ProShademlERKNS_4VarTINS_4NodeEEES4_) not yet transcribed",
  );
}

/**
 * `LiMaterialLayerOperator::writeHash(PCHashWriteStream&)` — base's
 * hash-append. @Ozone stub 0x6de7a2 (external symbol stub for
 * __ZN23LiMaterialLayerOperator9writeHashER17PCHashWriteStream). The base
 * itself lives at @Ozone 0x1e3200 but the writeHash entry hasn't been
 * transcribed for the base yet; landing this defers it.
 */
function LiMaterialLayerOperator_writeHash_stub(
  _this: unknown,
  _stream: unknown,
): void {
  throw new Error(
    "LiMaterialLayerOperator::writeHash(PCHashWriteStream&) @Ozone stub 0x6de7a2 " +
      "(__ZN23LiMaterialLayerOperator9writeHashER17PCHashWriteStream) not yet transcribed",
  );
}

/**
 * `setUpFinishUniforms(int)` — static Ozone helper @Ozone 0x1e3960
 * (__ZL19setUpFinishUniformsi). Populates the module-static `finishUniforms`
 * vector at `__ZL14finishUniforms` @Ozone 0x93d8a0 with a per-index
 * (`ProShade::VarT<UniformNode>*`, `ProShade::Uniform*`) pair, guarded by
 * a `PCSpinLock` at `__ZZL19setUpFinishUniformsiE4lock`. Not yet
 * transcribed — its body allocates `ProShade::VarT<UniformNode>` and
 * `ProShade::Uniform` blocks and installs string keys like "glossiness"
 * into them. The ctor's use is:
 *   setUpFinishUniforms(index);
 *   this->+0x08 = finishUniforms[index * 0x10] + 0x20;
 */
function setUpFinishUniforms_stub(_index: number): void {
  throw new Error(
    "setUpFinishUniforms(int) @Ozone stub 0x1e3960 " +
      "(__ZL19setUpFinishUniformsi) not yet transcribed",
  );
}

/**
 * `finishUniforms` module-static — @Ozone 0x93d8a0
 * (__ZL14finishUniforms). Modeled as an untyped record whose slots the
 * ctor addresses as `finishUniforms[index * 0x10]` and reads `+0x20` off
 * the resulting pointer. Populated by setUpFinishUniforms(int); reading
 * before it's populated is a bug (the guarded ctor call at 0x1e1793
 * ensures ordering).
 */
const finishUniforms: {
  /** stride 0x10; each slot holds a per-index pair whose element +0x00
   *  points to a `ProShade::Uniform` and whose vtable +0x20 is the raw
   *  Uniform vtable pointer used by the ctor. */
  slots: (Uint8Array | null)[];
} = { slots: [] };

/**
 * `finishUniforms[index * 0x10] + 0x20` — the pointer the ctor stashes
 * into `this->+0x08`. Modeled as an opaque token so the ctor's store is
 * observable without decoding the ProShade::Uniform layout. Reading it
 * requires `setUpFinishUniforms(index)` to have run first (asm order
 * @0x1e1793 → @0x1e179b).
 */
function finishUniforms_slotUniformPlus0x20(index: number): unknown {
  // Faithful to @0x1e1798..@0x1e17ae:
  //   movslq %edi,%rax ; shlq $0x4,%rax
  //   movq finishUniforms(%rip),%rcx
  //   movq (%rcx,%rax),%rax
  //   addq $0x20,%rax
  //   movq %rax,0x8(%r14)   ; this->+0x08 = rax
  const slot = finishUniforms.slots[index];
  if (slot === undefined || slot === null) {
    // The ctor has already called setUpFinishUniforms(index) at 0x1e1793;
    // this branch only fires if that stub throws (which it currently does),
    // so we surface a decode-loud error rather than fabricate a value.
    throw new Error(
      "finishUniforms[" +
        index +
        "] read before setUpFinishUniforms populated it — undecoded @Ozone 0x1e3960",
    );
  }
  // Return the raw pointer; the +0x20 offset is the "Uniform vtable slot"
  // address. Modeled as the slot itself; downstream call sites just store
  // it opaquely into `this->+0x08`.
  return { __slot: slot, __plus: 0x20 };
}

/**
 * `PC_Sp_counted_base::weak_release()` — external stub, @Ozone
 * 0x6de4fc (__ZN18PC_Sp_counted_base12weak_releaseEv). Called by both
 * D1 and D0 when `this->+0x28` is non-null. Not yet transcribed.
 */
function PC_Sp_counted_base_weak_release_stub(_p: unknown): void {
  throw new Error(
    "PC_Sp_counted_base::weak_release() @Ozone stub 0x6de4fc " +
      "(__ZN18PC_Sp_counted_base12weak_releaseEv) not yet transcribed",
  );
}

/**
 * `PCShared_base::~PCShared_base()` — external stub, @Ozone
 * 0x1e30... in ProCore's PCShared_base impl (imported via
 * __ZN13PCShared_baseD2Ev). Used by the ctor's landing pad
 * (@0x1e17d7) — a happy-path port never reaches it, so we surface it
 * only if invoked.
 */
function PCShared_base_dtor_stub(_this: unknown): void {
  throw new Error(
    "PCShared_base::~PCShared_base() @Ozone stub (__ZN13PCShared_baseD2Ev) " +
      "not yet transcribed (called only from ctor landing pad @0x1e17d7)",
  );
}

/**
 * `operator delete(void*)` — external stub for __ZdlPv @Ozone 0x6dfc36.
 * The D0 destructor tail-jumps to it after teardown. Modeled as a
 * runtime no-op (the JS GC frees the object automatically) — faithful
 * to the deletion semantics of the tail-jmp @0x1e35dd.
 */
function operator_delete_noop(_p: unknown): void {
  // no-op in the GC'd JS runtime; mirrors the tail-jmp @0x1e35dd.
}

/* ------------------------------------------------------------------------- *
 * Vtable-address citations — the two RIP-relative vtable loads in ctor
 * come out to the following mangled targets in the Ozone binary:
 *   @0x1e177c  leaq 0x661cbd(%rip),%rax
 *              → 0x1e177c + 7 + 0x661cbd = 0x843440
 *              = __ZTV17ApplyReflectivity + 0x10  (ApplyReflectivity vtable
 *                installed pointer per the Itanium ABI).
 *   @0x1e1786  leaq 0x661cfb(%rip),%rax
 *              → 0x1e1786 + 7 + 0x661cfb = 0x843488
 *              = __ZTV23LiMaterialLayerOperator + 0x10  (the second
 *                vtable installed at +0x20 is the base subobject's).
 * Both cited by string tags below.
 * ------------------------------------------------------------------------- */

/**
 * `ApplyReflectivity` — Ozone reflectivity finish operator. Extends
 * `LiMaterialLayerOperator`. Fields laid out per the recovered layout in
 * this file's header comment.
 */
export class ApplyReflectivity extends LiMaterialLayerOperator {
  /**
   * @Ozone ApplyReflectivity +0x00 — vptr.
   * Installed by ctor @0x1e177c..@0x1e1783 to
   * `__ZTV17ApplyReflectivity + 0x10`.
   * Modeled as a string tag.
   */
  vptr_at_0x00: string = "__ZTV17ApplyReflectivity+0x10";

  /**
   * @Ozone ApplyReflectivity +0x08 — pointer into `finishUniforms[i<<4]`
   * at offset +0x20 (a `ProShade::Uniform` vtable-slot address). Set by
   * ctor @0x1e17ae.
   */
  reflectivityUniform_at_0x08: unknown = null;

  /**
   * @Ozone ApplyReflectivity +0x10 — optional "prev operator" pointer.
   * Cleared to NULL by ctor @0x1e17b2. Both eval overloads null-check
   * it and, when non-null, invoke its vtable slot (@+0x10 for the
   * SurfaceProperties overload, @+0x18 for the VarT<Node> overload).
   */
  prevOperator_at_0x10: {
    /** Loaded @0x1e181e / @0x1e1aac. */
    vptr: {
      /** Slot @0x10 called by eval(LayerContext, SurfaceProperties&)
       *  @0x1e1824 as `callq *0x10(%rax)` with %rdx = out. */
      slot_0x10?: (self: unknown, ctx: LayerContext, out: SurfaceProperties) => void;
      /** Slot @0x18 called by eval(LayerContext, VarT<Node>&) @0x1e1ab2
       *  as `callq *0x18(%rax)` with %rdx = out. */
      slot_0x18?: (
        self: unknown,
        ctx: LayerContext,
        out: ProShadeVarT<ProShadeNode>,
      ) => void;
    };
  } | null = null;

  /**
   * @Ozone ApplyReflectivity +0x18 — inherited PCSharedCount subobject.
   * Constructed by ctor @0x1e17be via
   * `__ZN13PCSharedCountC1Ev(%r14 + 0x18)`.
   */
  sharedCount_at_0x18: unknown = null;

  /**
   * @Ozone ApplyReflectivity +0x20 — LiMaterialLayerOperator base
   * subobject vptr. Installed by ctor @0x1e178d to
   * `__ZTV23LiMaterialLayerOperator + 0x10`.
   */
  vptr_at_0x20: string = "__ZTV23LiMaterialLayerOperator+0x10";

  /**
   * @Ozone ApplyReflectivity +0x28 — nullable
   * `PC_Sp_counted_base*` back-pointer. Cleared by ctor @0x1e1774
   * (`movq $0x0, 0x28(%rdi)`). Dtors call weak_release when non-null.
   */
  spCountedBaseBack_at_0x28: unknown = null;

  /**
   * `ApplyReflectivity::ApplyReflectivity(int)` C1/C2 @Ozone 0x1e1760.
   * Both mangled entries (C1Ei and C2Ei) resolve to the same body block
   * in the binary — one C++ constructor emitted twice.
   *
   * Full body (all @Ozone):
   *   0x1e1760  frame prologue (r15/r14/rbx/rax saved)
   *   0x1e176a  movl %esi,%r15d              ; save index arg
   *   0x1e176d  movq %rdi,%r14               ; save this
   *   0x1e1770  leaq 0x20(%rdi),%rbx         ; rbx = &this->+0x20 (subobj)
   *   0x1e1774  movq $0x0, 0x28(%rdi)        ; this->+0x28 = NULL
   *   0x1e177c  leaq 0x661cbd(%rip),%rax     ; = &__ZTV17ApplyReflectivity+0x10
   *   0x1e1783  movq %rax, (%rdi)            ; this->+0x00 = vptr(Apply...)
   *   0x1e1786  leaq 0x661cfb(%rip),%rax     ; = &__ZTV23LiMaterialLayerOperator+0x10
   *   0x1e178d  movq %rax, 0x20(%rdi)        ; this->+0x20 = vptr(base subobj)
   *   0x1e1791  movl %esi,%edi
   *   0x1e1793  callq __ZL19setUpFinishUniformsi   ; setUpFinishUniforms(index)
   *   0x1e1798  movslq %r15d,%rax
   *   0x1e179b  movq __ZL14finishUniforms(%rip),%rcx
   *   0x1e17a2  shlq $0x4,%rax               ; rax = index * 0x10
   *   0x1e17a6  movq (%rcx,%rax),%rax        ; rax = finishUniforms[index<<4]
   *   0x1e17aa  addq $0x20,%rax              ; rax += 0x20
   *   0x1e17ae  movq %rax,0x8(%r14)          ; this->+0x08 = rax
   *   0x1e17b2  movq $0x0,0x10(%r14)         ; this->+0x10 = NULL
   *   0x1e17ba  addq $0x18,%r14              ; r14 = &this->+0x18
   *   0x1e17be  callq __ZN13PCSharedCountC1Ev  ; PCSharedCount(&this->+0x18)
   *   0x1e17c6  epilogue → retq
   *   0x1e17d1  <landing pad>: PCShared_base_dtor + Unwind_Resume
   *
   * Note: the ctor sets `this->+0x20 = vptr(base subobj)` BEFORE calling
   * setUpFinishUniforms/PCSharedCount so an exception during construction
   * unwinds through the base subobject's dtor (the landing pad calls
   * __ZN13PCShared_baseD2Ev on rbx = &this->+0x20).
   */
  constructor(index: number) {
    super();
    // @0x1e1770 — take &this->+0x20 as the base subobj pointer (rbx). The
    // JS model doesn't need a raw address, but we track the field for the
    // landing-pad semantics below.
    // @0x1e1774 — this->+0x28 = NULL.
    this.spCountedBaseBack_at_0x28 = null;
    // @0x1e177c..@0x1e1783 — install ApplyReflectivity vptr at +0x00.
    this.vptr_at_0x00 = "__ZTV17ApplyReflectivity+0x10";
    // @0x1e1786..@0x1e178d — install base subobj vptr at +0x20.
    this.vptr_at_0x20 = "__ZTV23LiMaterialLayerOperator+0x10";

    try {
      // @0x1e1791..@0x1e1793 — setUpFinishUniforms(index).
      setUpFinishUniforms_stub(index);
      // @0x1e1798..@0x1e17ae — this->+0x08 = finishUniforms[index<<4]+0x20.
      this.reflectivityUniform_at_0x08 =
        finishUniforms_slotUniformPlus0x20(index);
      // @0x1e17b2 — this->+0x10 = NULL.
      this.prevOperator_at_0x10 = null;
      // @0x1e17ba..@0x1e17be — PCSharedCount() on &this->+0x18.
      PCSharedCount_ctor_default_stub(this.sharedCount_at_0x18);
      // @0x1e17c6 — retq (fall through).
    } catch (e) {
      // @0x1e17d1..@0x1e17df — landing pad: destroy the base subobj at
      // +0x20 then re-throw. Faithful to the Itanium ABI unwind.
      PCShared_base_dtor_stub(this /* rbx = &this->+0x20 */);
      throw e;
    }
  }

  /**
   * `ApplyReflectivity::eval(LayerContext const&, SurfaceProperties&)`
   * @Ozone 0x1e17f0. Combines the reflectivity finish's ProShade
   * multiply against three SurfaceProperties channel slots.
   *
   * Structural summary (asm-mirrored — every branch preserved):
   *   1. If `this->+0x10` (prev operator) is non-null, call its
   *      `vptr[+0x10]` slot with `(prevOp, ctx, out)` @0x1e181e-@0x1e1824.
   *   2. Load `prevOp' = this->+0x08` (the reflectivityUniform); build a
   *      transient `VarT<Node>` wrapper on the stack (%rbp-0x70..-0x58)
   *      whose vtable-slot is the ProShade::VarT<Node> vtable +0x10
   *      @0x1e182b..@0x1e183f.
   *   3. Default-construct a PCSharedCount on the stack (%rbp-0x58)
   *      @0x1e1843..@0x1e1847.
   *   4. If the transient VarT's `+0x10` is non-null (@0x1e1850),
   *      copy-construct a temp PCSharedCount from
   *      `reflectivityUniform + 0x18` @0x1e1856..@0x1e1861, assign it
   *      into the stack VarT's sharedCount @0x1e1866..@0x1e186e, then
   *      destroy the temp @0x1e1873..@0x1e1877.
   *   5. Call ProShade::operator*(out=&stackVarT2, lhs=&out+0x120,
   *      rhs=&stackVarT) @0x1e187c..@0x1e188b. This computes
   *      `SurfaceProperties.channel_0x120 *= reflectivityUniform`.
   *   6. Store `stackVarT2 + 0x10` (the multiply result's Node ptr) into
   *      `out->+0x130` @0x1e1890..@0x1e1894.
   *   7. Copy-construct PCSharedCount from `stackVarT2 + 0x18` into
   *      stack @0x1e189b..@0x1e18a6, assign into `out->+0x138`
   *      @0x1e18ab..@0x1e18b6, destroy temp.
   *   8. Reset stackVarT2's vptr @0x1e18c4, destroy stackVarT2's shared
   *      count @0x1e18c8..@0x1e18cb.
   *   9. Repeat the whole VarT/multiply/assign pattern for the SECOND
   *      SurfaceProperties channel triple (out->+0x140, +0x150, +0x158)
   *      @0x1e18d0..@0x1e197f. The stack VarT is rebuilt from
   *      `this->+0x08` again but the multiply operand is now
   *      `&out->+0x140` and the result is stored into +0x150/+0x158.
   *  10. stack-guard check @0x1e1987..@0x1e19a5, then retq.
   *
   * Effectively: for each of two adjacent SurfaceProperties channel
   * slots at +0x120 and +0x140, replace the slot's VarT<Node> triple
   * (node+0x10, sharedCount+0x18) with `slot *= reflectivityUniform`.
   */
  eval_surfaceProperties(
    ctx: LayerContext,
    out: SurfaceProperties,
  ): void {
    // Silence unused-parameter warnings while preserving the exact
    // signature; every reference below cites the address it re-enters.
    void ctx;
    void out;

    // @0x1e1815..@0x1e1824 — prev-op chain.
    if (this.prevOperator_at_0x10 !== null) {
      const prev = this.prevOperator_at_0x10;
      // @0x1e181e — load vptr; @0x1e1824 — callq *0x10(%rax).
      if (prev.vptr.slot_0x10 !== undefined) {
        prev.vptr.slot_0x10(prev, ctx, out);
      } else {
        // The asm doesn't null-check the SLOT, only the object. If the
        // slot is absent the branch would fault — surface as a loud
        // decode gap rather than silently no-op.
        throw new Error(
          "ApplyReflectivity::eval prev-op vtable +0x10 slot missing " +
            "(callq *0x10(%rax) @Ozone 0x1e1824)",
        );
      }
    }

    // @0x1e1827..@0x197b — the reflectivity finish body is two paired
    // ProShade::operator* calls that mutate `out`'s adjacent channel
    // triples at +0x120 and +0x140. Because ProShade::operator* is not
    // yet transcribed (stub at 0x6df1da), running this method throws
    // loudly at the FIRST multiply — the correct decode-don't-guess
    // behavior. The full control-flow scaffold is written above so a
    // future decoder need only replace the stubs.
    //
    // First channel triple: out->+0x120 / +0x130 / +0x138.
    ProShade_operator_multiply_stub(
      /* out = stack VarT<Node> temp */ null,
      /* lhs = &out->+0x120         */ null,
      /* rhs = stack VarT wrapping this->+0x08 */ null,
    );
    // (Unreachable in the current gap-throwing port; kept as a
    //  faithful control-flow record of the second multiply for reviewers.)
    // Second channel triple: out->+0x140 / +0x150 / +0x158.
    // ProShade_operator_multiply_stub(null, null, null);
  }

  /**
   * `ApplyReflectivity::eval(LayerContext const&,
   *                          ProShade::VarT<ProShade::Node>&)`
   * @Ozone 0x1e1a80. Single-channel variant of the multi-channel
   * SurfaceProperties overload: multiplies the incoming VarT<Node>
   * by `this->+0x08` (reflectivityUniform) in place.
   *
   * Structural summary (asm-mirrored):
   *   1. If `this->+0x10` (prev operator) is non-null, call its
   *      `vptr[+0x18]` slot with `(prevOp, ctx, out)` @0x1e1aac-@0x1e1ab2.
   *      (Note: this overload uses +0x18, the OTHER overload uses +0x10 —
   *      they are two distinct virtual slots.)
   *   2. Load prev' = this->+0x08; build transient VarT on the stack
   *      (%rbp-0x68..-0x58) whose vptr is
   *      `__ZTVN8ProShade4VarTINS_4NodeEEE + 0x10` @0x1e1ab9..@0x1e1acc.
   *   3. Default-construct PCSharedCount on the stack (%rbp-0x50)
   *      @0x1e1ad0..@0x1e1ad7.
   *   4. If VarT +0x10 is non-null (@0x1e1adc..@0x1e1ae4), copy-construct
   *      temp PCSharedCount from `reflectivityUniform + 0x18` and assign
   *      into stack PCSharedCount @0x1e1ae6..@0x1e1b06.
   *   5. Call ProShade::operator*(out=&stackTmp, lhs=&out (the arg),
   *      rhs=&stackVarT) @0x1e1b0b..@0x1e1b16.
   *   6. Store `stackTmp + 0x10` into `out->+0x10` @0x1e1b1b..@0x1e1b1f.
   *   7. Copy-construct PCSharedCount from stackTmp+0x18 into new stack
   *      temp @0x1e1b23..@0x1e1b2e; assign into `out->+0x18`
   *      @0x1e1b33..@0x1e1b3e; destroy stack temp @0x1e1b43..@0x1e1b47.
   *   8. Reset stackTmp vptr @0x1e1b4c, teardown counts, retq.
   *
   * Effectively: `out = out * reflectivityUniform`.
   */
  eval_varTNode(
    ctx: LayerContext,
    out: ProShadeVarT<ProShadeNode>,
  ): void {
    void ctx;
    void out;

    // @0x1e1aa3..@0x1e1ab2 — prev-op chain, this overload uses +0x18.
    if (this.prevOperator_at_0x10 !== null) {
      const prev = this.prevOperator_at_0x10;
      if (prev.vptr.slot_0x18 !== undefined) {
        prev.vptr.slot_0x18(prev, ctx, out);
      } else {
        throw new Error(
          "ApplyReflectivity::eval prev-op vtable +0x18 slot missing " +
            "(callq *0x18(%rax) @Ozone 0x1e1ab2)",
        );
      }
    }

    // @0x1e1ab5..@0x1e1b16 — same "wrap this->+0x08 as a VarT<Node> and
    // call ProShade::operator*" pattern as the other overload, but only
    // once (for the single VarT<Node>& argument, not a two-channel
    // SurfaceProperties). Multiply is still stubbed out — throws loudly.
    ProShade_operator_multiply_stub(
      /* out = stack tmp VarT              */ null,
      /* lhs = the VarT<Node>& argument    */ null,
      /* rhs = stack VarT wrapping this->+0x08 */ null,
    );
  }

  /**
   * `ApplyReflectivity::writeHash(PCHashWriteStream&)` @Ozone 0x1e1c00.
   *
   * Full body (all @Ozone):
   *   0x1e1c00  frame prologue
   *   0x1e1c0a  movq %rdi,%r14 ; movq %rsi,%rbx     ; save this, stream
   *   0x1e1c0d  callq __ZN23LiMaterialLayerOperator9writeHashER17PCHashWriteStream
   *                                                 ; base's writeHash
   *   0x1e1c12  movq 0x10(%r14),%rdi                ; rdi = this->+0x10
   *   0x1e1c16  testq %rdi,%rdi
   *   0x1e1c19  je 0x1e1c2b                         ; if NULL → epilogue
   *   0x1e1c1b  movq (%rdi),%rax                    ; vtable
   *   0x1e1c1e  movq 0x20(%rax),%rax                ; vtable[+0x20]
   *   0x1e1c22  movq %rbx,%rsi                      ; rsi = stream
   *   0x1e1c25  epilogue and jmpq *%rax             ; tail-call slot
   *   0x1e1c2b  epilogue and retq
   */
  writeHash(stream: unknown): void {
    // @0x1e1c0d — LiMaterialLayerOperator::writeHash(this, stream).
    LiMaterialLayerOperator_writeHash_stub(this, stream);
    // @0x1e1c12..@0x1e1c19 — prev-op null-check.
    const prev = this.prevOperator_at_0x10;
    if (prev !== null) {
      // @0x1e1c1b..@0x1e1c29 — tail-jmp to *(vptr[+0x20]) with
      // (%rdi=prev, %rsi=stream). The slot is a virtual writeHash on
      // the prev-op's own type; we don't have a decoded shape for it,
      // so surface it as a decode gap rather than skip.
      const vt = (prev as unknown as {
        vptr: { slot_0x20?: (self: unknown, s: unknown) => void };
      }).vptr;
      if (vt.slot_0x20 !== undefined) {
        vt.slot_0x20(prev, stream);
      } else {
        throw new Error(
          "ApplyReflectivity::writeHash prev-op vtable +0x20 slot missing " +
            "(jmpq *%rax after vtable[+0x20] load @Ozone 0x1e1c29)",
        );
      }
    }
    // @0x1e1c2b — retq.
  }

  /**
   * `ApplyReflectivity::~ApplyReflectivity()` D1 @Ozone 0x1e3530
   * (__ZN17ApplyReflectivityD1Ev).
   *
   * Full body (all @Ozone):
   *   0x1e3530  frame prologue
   *   0x1e3536  movq %rdi,%rbx
   *   0x1e3539  leaq 0x65ff00(%rip),%rax
   *   0x1e3540  movq %rax,(%rdi)                   ; reinstall +0x00 vptr
   *                                                 ; = &__ZTV17ApplyReflectivity+0x10
   *                                                 ; (unusual but faithful:
   *                                                  the dtor re-installs its
   *                                                  own vptr, not the base's —
   *                                                  the Ozone dtor emits a
   *                                                  same-slot rewrite; the
   *                                                  addend still matches the
   *                                                  ctor's ApplyReflectivity
   *                                                  vtable at 0x1e177c.)
   *   0x1e3543  leaq 0x65ff3e(%rip),%rax
   *   0x1e354a  movq %rax,0x20(%rdi)               ; reinstall +0x20 vptr
   *                                                 ; = &__ZTV23LiMaterialLayerOperator+0x10
   *   0x1e354e  addq $0x18,%rdi                    ; rdi = &this->+0x18
   *   0x1e3552  callq __ZN13PCSharedCountD1Ev      ; destroy shared count
   *   0x1e3557  leaq __ZTV13PCShared_base(%rip),%rax
   *   0x1e355e  addq $0x10,%rax
   *   0x1e3562  movq %rax,0x20(%rbx)               ; +0x20 = PCShared_base vptr
   *   0x1e3566  movq 0x28(%rbx),%rdi               ; rdi = this->+0x28
   *   0x1e356a  testq %rdi,%rdi
   *   0x1e356d  je 0x1e3574
   *   0x1e356f  callq __ZN18PC_Sp_counted_base12weak_releaseEv
   *   0x1e3574  epilogue → retq
   *   0x1e357b  <landing pad>: ___clang_call_terminate
   *
   * Note the reinstall-progression: first back to
   * `ApplyReflectivity` vptrs (0x1e3540/0x1e354a) — matches Itanium ABI
   * "reinstall my own vptr at dtor start" — then AFTER shared-count
   * teardown the +0x20 slot is rewritten a SECOND time to
   * `__ZTV13PCShared_base + 0x10` (0x1e3562). The two writes to +0x20
   * are BOTH faithful.
   */
  destructor_D1(): void {
    // @0x1e3540 — this->+0x00 = ApplyReflectivity vtable installed slot.
    this.vptr_at_0x00 = "__ZTV17ApplyReflectivity+0x10";
    // @0x1e354a — this->+0x20 = LiMaterialLayerOperator vtable installed slot.
    this.vptr_at_0x20 = "__ZTV23LiMaterialLayerOperator+0x10";
    // @0x1e354e..@0x1e3552 — destroy shared-count at +0x18.
    PCSharedCount_dtor_stub(this.sharedCount_at_0x18);
    // @0x1e3562 — REWRITE this->+0x20 = PCShared_base vtable installed slot.
    this.vptr_at_0x20 = "__ZTV13PCShared_base+0x10";
    // @0x1e3566..@0x1e356d — null-check +0x28 and weak_release.
    const p = this.spCountedBaseBack_at_0x28;
    if (p !== null) {
      PC_Sp_counted_base_weak_release_stub(p);
    }
    // @0x1e3574 — retq.
  }

  /**
   * `ApplyReflectivity::~ApplyReflectivity()` D0 @Ozone 0x1e3590
   * (__ZN17ApplyReflectivityD0Ev). Same body as D1 followed by
   * tail-jmp to `operator delete`.
   *
   * Full body (all @Ozone):
   *   0x1e3590  frame prologue
   *   0x1e3596  movq %rdi,%rbx
   *   0x1e3599..0x1e35c2  same reinstall+PCSharedCount D1 sequence as
   *                       D1 (see destructor_D1 above)
   *   0x1e35c6..0x1e35d4  null-check +0x28 & weak_release
   *   0x1e35d4..0x1e35db  movq %rbx,%rdi ; epilogue
   *   0x1e35dd  jmp __ZdlPv                        ; tail-call operator delete
   *   0x1e35e2  <landing pad>: ___clang_call_terminate
   */
  destructor_D0(): void {
    // Mirror the D1 body verbatim.
    this.destructor_D1();
    // @0x1e35dd — tail-jmp to operator delete(this).
    operator_delete_noop(this);
  }
}
