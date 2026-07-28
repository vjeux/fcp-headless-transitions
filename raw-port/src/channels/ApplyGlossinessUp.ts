// ApplyGlossinessUp.ts — Ozone's glossiness "up" finish operator.
//
// Faithful transcription of Ozone.framework's `ApplyGlossinessUp` class
// (7 exported symbols total; C1/C2, D0/D1, both eval overloads, writeHash).
//
// Framework: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/
//                  Ozone.framework/Versions/A/Ozone).
//
// Ported symbols (all @Ozone):
//   @0x00000000001e0500  ApplyGlossinessUp::ApplyGlossinessUp(int)  [C2]
//                        __ZN17ApplyGlossinessUpC2Ei
//   @0x00000000001e0580  ApplyGlossinessUp::ApplyGlossinessUp(int)  [C1]
//                        __ZN17ApplyGlossinessUpC1Ei
//                        (Ozone maps both C1 and C2 to the same body block;
//                         the disasm at 0x1e0580 is the shared code.)
//   @0x00000000001e0600  ApplyGlossinessUp::eval(LayerContext const&,
//                                                 SurfaceProperties&)
//                        __ZN17ApplyGlossinessUp4evalERK12LayerContextR17SurfaceProperties
//   @0x00000000001e0e60  ApplyGlossinessUp::eval(LayerContext const&,
//                                                 ProShade::VarT<ProShade::Node>&)
//                        __ZN17ApplyGlossinessUp4evalERK12LayerContextRN8ProShade4VarTINS3_4NodeEEE
//   @0x00000000001e0fe0  ApplyGlossinessUp::writeHash(PCHashWriteStream&)
//                        __ZN17ApplyGlossinessUp9writeHashER17PCHashWriteStream
//   @0x00000000001e3210  ApplyGlossinessUp::~ApplyGlossinessUp()  [D1]
//                        __ZN17ApplyGlossinessUpD1Ev
//   @0x00000000001e3270  ApplyGlossinessUp::~ApplyGlossinessUp()  [D0]
//                        __ZN17ApplyGlossinessUpD0Ev
//
// Callees / symbol imports discovered by walking the disasm:
//   @0x00000000001e0890  adjustShininessUp(ProShade::VarT<ProShade::Node> const&,
//                                          ProShade::VarT<ProShade::Node> const&)
//                        __ZL17adjustShininessUpRKN8ProShade4VarTINS_4NodeEEES4_
//                        (static, Ozone-internal; the DISTINCT feature of the
//                         "up" glossiness operator vs. the "down" variant at
//                         @0x1e13a0. Not yet transcribed.)
//   @0x00000000001e3960  setUpFinishUniforms(int)                  [static, Ozone]
//                        __ZL19setUpFinishUniformsi
//   @0x000000000093d8a0  finishUniforms                            [static data]
//                        __ZL14finishUniforms
//                        (a vector<pair<ProShade::VarT<UniformNode>*,
//                          ProShade::Uniform*>*> or similar; per-slot stride
//                        is 0x10 — the ctor indexes as `finishUniforms[i<<4]`
//                        and reads +0x20 off the loaded pointer. Shared static
//                        with the sibling ApplyReflectivity / ApplyShininess...
//                        operators; each finish operator picks a different
//                        slot index at construction.)
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
//   @Ozone stub  __ZN18PC_Sp_counted_base12weak_releaseEv
//                PC_Sp_counted_base::weak_release()
//   @Ozone stub  __ZN23LiMaterialLayerOperator9writeHashER17PCHashWriteStream
//                LiMaterialLayerOperator::writeHash(PCHashWriteStream&)
//   @Ozone stub  __ZdlPv                             operator delete(void*)
//   @Ozone stub  ___clang_call_terminate / ___stack_chk_fail / __Unwind_Resume
//                — landing pads only (no observable side effect on happy path).
//
// STRUCT LAYOUT (recovered from ctor @0x1e0580 and dtors @0x1e3210/@0x1e3270):
//   +0x00  vptr(ApplyGlossinessUp)          @0x1e059c..@0x1e05a3 install
//                                            (RIP+0x662d4d from 0x1e059c =>
//                                             0x1e059c+7+0x662d4d = 0x8432f0
//                                             = __ZTV17ApplyGlossinessUp + 0x10;
//                                             re-installed by dtor @0x1e3220
//                                             via RIP+0x6600d0 from 0x1e3219
//                                             = 0x1e3219+7+0x6600d0 = 0x8432f0
//                                             — same target, confirming the
//                                             recovered vtable address).
//   +0x08  ProShade::Uniform*               @0x1e05bb..@0x1e05ca —
//                                            `finishUniforms[i<<4]`; a pointer
//                                            into the specific glossiness
//                                            uniform slot set up by
//                                            setUpFinishUniforms.
//                                            (Both eval overloads reload from
//                                            this slot at @0x1e0637 and
//                                            @0x1e0e95 respectively; the
//                                            structural pattern is identical
//                                            to the sibling ApplyReflectivity
//                                            operator at +0x08.)
//   +0x10  void*                            @0x1e05ce — cleared to NULL by
//                                            the ctor; loaded by both eval
//                                            overloads and tested for NULL.
//                                            When non-null, its vtable slot
//                                            @+0x10 (SurfaceProperties overload,
//                                            @0x1e0634) / @+0x18 (VarT<Node>
//                                            overload, @0x1e0e92) is invoked
//                                            with %rdx = the output argument —
//                                            i.e. an OPTIONAL "prev operator"
//                                            chain hook installed by upstream
//                                            code (same pattern as
//                                            ApplyReflectivity +0x10).
//   +0x18  PCSharedCount                    @0x1e05dd ctor call —
//                                            LiMaterialLayerOperator base
//                                            subobject's shared-count block.
//   +0x20  vptr(subobject: LiMaterialLayerOperator)  @0x1e05a6..@0x1e05ad
//                                            install (RIP+0x662d8b from
//                                            0x1e05a6 => 0x1e05a6+7+0x662d8b
//                                            = 0x843338 = __ZTV23LiMaterialLayerOperator
//                                            + 0x10; re-installed by dtor
//                                            @0x1e322a via RIP+0x66010e from
//                                            0x1e3223 = 0x1e3223+7+0x66010e
//                                            = 0x843338 — same target).
//   +0x28  PC_Sp_counted_base*              @0x1e0594 cleared to NULL;
//                                            dtor D1/D0 null-checks &
//                                            calls weak_release when set
//                                            (@0x1e3246..@0x1e324f).
//
// Structural note: the SurfaceProperties channel triples touched by the
// "glossiness up" eval overload live at +0xe0/+0xf0/+0xf8 (first pair) and
// +0x100/+0x110/+0x118 (second pair) — a distinct pair of adjacent VarT<Node>
// triples from the ApplyReflectivity operator's +0x120/+0x140 slots. This is
// how each finish operator addresses its own two channel components in the
// SurfaceProperties layout.
//
// Verification: the ledger entry for ApplyGlossinessUp lists exactly these
// 7 symbols (see raw-port/army/ledger/Ozone.ledger.json). No frontier callee
// class (PCSharedCount, PCShared_base, ProShade::Uniform, ProShade::VarT<Node>)
// is dereferenced past its vtable slot here — all struct access is by offset
// citation. The math body itself is not observable here: it is entirely
// contained in the un-transcribed static helper `adjustShininessUp` @0x1e0890.

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
 * `adjustShininessUp(ProShade::VarT<Node> const&, ProShade::VarT<Node> const&)`
 * — the static Ozone helper @Ozone 0x1e0890
 * (__ZL17adjustShininessUpRKN8ProShade4VarTINS_4NodeEEES4_). This is the
 * feature-defining kernel of ApplyGlossinessUp: given the incoming channel
 * VarT<Node> (`lhs`) and a VarT<Node> wrapping the glossiness uniform
 * (`rhs`), it computes the "glossiness-up" adjustment as an out-VarT<Node>
 * (`out`). Not yet transcribed @0x1e0890 — its body walks the ProShade node
 * graph and is beyond the scope of a single leaf port. The sibling "down"
 * variant lives at @0x1e13a0 (adjustShininessDown) and is invoked by
 * ApplyGlossinessDown in the same shape.
 */
function adjustShininessUp_stub(
  _out: unknown,
  _lhs: unknown,
  _rhs: unknown,
): void {
  throw new Error(
    "adjustShininessUp(ProShade::VarT<Node> const&, ProShade::VarT<Node> const&) " +
      "@Ozone 0x1e0890 (__ZL17adjustShininessUpRKN8ProShade4VarTINS_4NodeEEES4_) " +
      "not yet transcribed",
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
 * transcribed @0x1e3960 — its body allocates `ProShade::VarT<UniformNode>`
 * and `ProShade::Uniform` blocks and installs string keys like "glossiness"
 * into them. The ctor's use is:
 *   setUpFinishUniforms(index);
 *   this->+0x08 = finishUniforms[index * 0x10];
 */
function setUpFinishUniforms_stub(_index: number): void {
  throw new Error(
    "setUpFinishUniforms(int) @Ozone 0x1e3960 " +
      "(__ZL19setUpFinishUniformsi) not yet transcribed",
  );
}

/**
 * `finishUniforms` module-static — @Ozone 0x93d8a0
 * (__ZL14finishUniforms). Modeled as an untyped record whose slots the
 * ctor addresses as `finishUniforms[index * 0x10]`. Populated by
 * setUpFinishUniforms(int); reading before it's populated is a bug (the
 * guarded ctor call at 0x1e05b3 ensures ordering).
 */
const finishUniforms: {
  /** stride 0x10; each slot holds a per-index pair whose element +0x00
   *  points to a `ProShade::Uniform`. */
  slots: (Uint8Array | null)[];
} = { slots: [] };

/**
 * `finishUniforms[index * 0x10]` — the pointer the ctor stashes into
 * `this->+0x08`. Modeled as an opaque token so the ctor's store is
 * observable without decoding the ProShade::Uniform layout. Reading it
 * requires `setUpFinishUniforms(index)` to have run first (asm order
 * @0x1e05b3 -> @0x1e05bb).
 */
function finishUniforms_slot(index: number): unknown {
  // Faithful to @0x1e05b8..@0x1e05ca:
  //   movslq %r15d,%rax
  //   movq __ZL14finishUniforms(%rip),%rcx
  //   shlq $0x4,%rax
  //   movq (%rcx,%rax),%rax
  //   movq %rax,0x8(%r14)   ; this->+0x08 = rax
  // NOTE: unlike the sibling ApplyReflectivity ctor (which adds +0x20 to
  // %rax between the vector-load and the store), THIS ctor stores the
  // vector-load result WITHOUT any post-fixup — preserved faithfully.
  const slot = finishUniforms.slots[index];
  if (slot === undefined || slot === null) {
    // The ctor has already called setUpFinishUniforms(index) at 0x1e05b3;
    // this branch only fires if that stub throws (which it currently does),
    // so we surface a decode-loud error rather than fabricate a value.
    throw new Error(
      "finishUniforms[" +
        index +
        "] read before setUpFinishUniforms populated it — undecoded @Ozone 0x1e3960",
    );
  }
  return { __slot: slot };
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
 * (imported via __ZN13PCShared_baseD2Ev). Used by the ctor's landing pad
 * (@0x1e05f3) — a happy-path port never reaches it, so we surface it
 * only if invoked.
 */
function PCShared_base_dtor_stub(_this: unknown): void {
  throw new Error(
    "PCShared_base::~PCShared_base() @Ozone stub (__ZN13PCShared_baseD2Ev) " +
      "not yet transcribed (called only from ctor landing pad @0x1e05f3)",
  );
}

/**
 * `operator delete(void*)` — external stub for __ZdlPv @Ozone 0x6dfc36.
 * The D0 destructor tail-jumps to it after teardown. Modeled as a
 * runtime no-op (the JS GC frees the object automatically) — faithful
 * to the deletion semantics of the tail-jmp @0x1e32bd.
 */
function operator_delete_noop(_p: unknown): void {
  // no-op in the GC'd JS runtime; mirrors the tail-jmp @0x1e32bd.
}

/* ------------------------------------------------------------------------- *
 * Vtable-address citations — the two RIP-relative vtable loads in ctor
 * resolve to the following mangled targets in the Ozone binary:
 *   @0x1e059c  leaq 0x662d4d(%rip),%rax
 *              -> 0x1e059c + 7 + 0x662d4d = 0x8432f0
 *              = __ZTV17ApplyGlossinessUp + 0x10  (ApplyGlossinessUp vtable
 *                installed pointer per the Itanium ABI).
 *   @0x1e05a6  leaq 0x662d8b(%rip),%rax
 *              -> 0x1e05a6 + 7 + 0x662d8b = 0x843338
 *              = __ZTV23LiMaterialLayerOperator + 0x10  (the second
 *                vtable installed at +0x20 is the base subobject's).
 * The D1 dtor re-derives the same two addresses via different-magnitude
 * PC-relative displacements:
 *   @0x1e3219  leaq 0x6600d0(%rip),%rax  -> 0x1e3219+7+0x6600d0 = 0x8432f0 OK
 *   @0x1e3223  leaq 0x66010e(%rip),%rax  -> 0x1e3223+7+0x66010e = 0x843338 OK
 * The D0 dtor mirrors D1 at fresh sites:
 *   @0x1e3279  leaq 0x660070(%rip),%rax  -> 0x1e3279+7+0x660070 = 0x8432f0 OK
 *   @0x1e3283  leaq 0x6600ae(%rip),%rax  -> 0x1e3283+7+0x6600ae = 0x843338 OK
 * ------------------------------------------------------------------------- */

/**
 * `ApplyGlossinessUp` — Ozone glossiness-up finish operator. Extends
 * `LiMaterialLayerOperator`. Fields laid out per the recovered layout in
 * this file's header comment.
 */
export class ApplyGlossinessUp extends LiMaterialLayerOperator {
  /**
   * @Ozone ApplyGlossinessUp +0x00 — vptr.
   * Installed by ctor @0x1e059c..@0x1e05a3 to
   * `__ZTV17ApplyGlossinessUp + 0x10` (= 0x8432f0).
   * Modeled as a string tag.
   */
  vptr_at_0x00: string = "__ZTV17ApplyGlossinessUp+0x10";

  /**
   * @Ozone ApplyGlossinessUp +0x08 — pointer into `finishUniforms[i<<4]`
   * (a `ProShade::Uniform`-slot address). Set by ctor @0x1e05ca.
   */
  glossinessUniform_at_0x08: unknown = null;

  /**
   * @Ozone ApplyGlossinessUp +0x10 — optional "prev operator" pointer.
   * Cleared to NULL by ctor @0x1e05ce. Both eval overloads null-check
   * it and, when non-null, invoke its vtable slot (@+0x10 for the
   * SurfaceProperties overload @0x1e0634, @+0x18 for the VarT<Node>
   * overload @0x1e0e92, @+0x20 for writeHash tail-jmp @0x1e1009).
   */
  prevOperator_at_0x10: {
    /** Loaded @0x1e062e / @0x1e0e8c / @0x1e0ffb. */
    vptr: {
      /** Slot @0x10 called by eval(LayerContext, SurfaceProperties&)
       *  @0x1e0634 as `callq *0x10(%rax)` with %rdx = out. */
      slot_0x10?: (self: unknown, ctx: LayerContext, out: SurfaceProperties) => void;
      /** Slot @0x18 called by eval(LayerContext, VarT<Node>&) @0x1e0e92
       *  as `callq *0x18(%rax)` with %rdx = out. */
      slot_0x18?: (
        self: unknown,
        ctx: LayerContext,
        out: ProShadeVarT<ProShadeNode>,
      ) => void;
      /** Slot @0x20 tail-jmp'd from writeHash @0x1e1009. */
      slot_0x20?: (self: unknown, stream: unknown) => void;
    };
  } | null = null;

  /**
   * @Ozone ApplyGlossinessUp +0x18 — inherited PCSharedCount subobject.
   * Constructed by ctor @0x1e05dd via
   * `__ZN13PCSharedCountC1Ev(%r14 + 0x18)`.
   */
  sharedCount_at_0x18: unknown = null;

  /**
   * @Ozone ApplyGlossinessUp +0x20 — LiMaterialLayerOperator base
   * subobject vptr. Installed by ctor @0x1e05a6..@0x1e05ad to
   * `__ZTV23LiMaterialLayerOperator + 0x10` (= 0x843338).
   */
  vptr_at_0x20: string = "__ZTV23LiMaterialLayerOperator+0x10";

  /**
   * @Ozone ApplyGlossinessUp +0x28 — nullable
   * `PC_Sp_counted_base*` back-pointer. Cleared by ctor @0x1e0594
   * (`movq $0x0, 0x28(%rdi)`). Dtors call weak_release when non-null.
   */
  spCountedBaseBack_at_0x28: unknown = null;

  /**
   * `ApplyGlossinessUp::ApplyGlossinessUp(int)` C1/C2 @Ozone 0x1e0580.
   * Both mangled entries (C1Ei and C2Ei) resolve to the same body block
   * in the binary — one C++ constructor emitted twice (C2 alias
   * @0x1e0500 falls through to C1 @0x1e0580).
   *
   * Full body (all @Ozone):
   *   0x1e0580  frame prologue (r15/r14/rbx/rax saved)
   *   0x1e058a  movl %esi,%r15d              ; save index arg
   *   0x1e058d  movq %rdi,%r14               ; save this
   *   0x1e0590  leaq 0x20(%rdi),%rbx         ; rbx = &this->+0x20 (subobj)
   *   0x1e0594  movq $0x0, 0x28(%rdi)        ; this->+0x28 = NULL
   *   0x1e059c  leaq 0x662d4d(%rip),%rax     ; = &__ZTV17ApplyGlossinessUp+0x10
   *   0x1e05a3  movq %rax, (%rdi)            ; this->+0x00 = vptr(Apply...)
   *   0x1e05a6  leaq 0x662d8b(%rip),%rax     ; = &__ZTV23LiMaterialLayerOperator+0x10
   *   0x1e05ad  movq %rax, 0x20(%rdi)        ; this->+0x20 = vptr(base subobj)
   *   0x1e05b1  movl %esi,%edi
   *   0x1e05b3  callq __ZL19setUpFinishUniformsi   ; setUpFinishUniforms(index)
   *   0x1e05b8  movslq %r15d,%rax
   *   0x1e05bb  movq __ZL14finishUniforms(%rip),%rcx
   *   0x1e05c2  shlq $0x4,%rax               ; rax = index * 0x10
   *   0x1e05c6  movq (%rcx,%rax),%rax        ; rax = finishUniforms[index<<4]
   *   0x1e05ca  movq %rax,0x8(%r14)          ; (NOTE: unlike ApplyReflectivity,
   *                                             which does `addq $0x20, %rax`
   *                                             BEFORE the store, the "up"
   *                                             ctor here stores the raw slot
   *                                             pointer WITHOUT the +0x20
   *                                             fixup. Preserved faithfully.)
   *   0x1e05ce  movq $0x0,0x10(%r14)         ; this->+0x10 = NULL
   *   0x1e05d6  addq $0x18,%r14              ; r14 = &this->+0x18
   *   0x1e05da  movq %r14,%rdi
   *   0x1e05dd  callq __ZN13PCSharedCountC1Ev  ; PCSharedCount(&this->+0x18)
   *   0x1e05e2  epilogue -> retq
   *   0x1e05ed  <landing pad>: PCShared_base_dtor + Unwind_Resume
   *
   * Note: the ctor sets `this->+0x20 = vptr(base subobj)` BEFORE calling
   * setUpFinishUniforms/PCSharedCount so an exception during construction
   * unwinds through the base subobject's dtor (the landing pad calls
   * __ZN13PCShared_baseD2Ev on rbx = &this->+0x20).
   */
  constructor(index: number) {
    super();
    // @0x1e0590 — take &this->+0x20 as the base subobj pointer (rbx). The
    // JS model doesn't need a raw address, but we track the field for the
    // landing-pad semantics below.
    // @0x1e0594 — this->+0x28 = NULL.
    this.spCountedBaseBack_at_0x28 = null;
    // @0x1e059c..@0x1e05a3 — install ApplyGlossinessUp vptr at +0x00.
    this.vptr_at_0x00 = "__ZTV17ApplyGlossinessUp+0x10";
    // @0x1e05a6..@0x1e05ad — install base subobj vptr at +0x20.
    this.vptr_at_0x20 = "__ZTV23LiMaterialLayerOperator+0x10";

    try {
      // @0x1e05b1..@0x1e05b3 — setUpFinishUniforms(index).
      setUpFinishUniforms_stub(index);
      // @0x1e05b8..@0x1e05ca — this->+0x08 = finishUniforms[index<<4].
      this.glossinessUniform_at_0x08 = finishUniforms_slot(index);
      // @0x1e05ce — this->+0x10 = NULL.
      this.prevOperator_at_0x10 = null;
      // @0x1e05d6..@0x1e05dd — PCSharedCount() on &this->+0x18.
      PCSharedCount_ctor_default_stub(this.sharedCount_at_0x18);
      // @0x1e05e2 — retq (fall through).
    } catch (e) {
      // @0x1e05ed..@0x1e05fb — landing pad: destroy the base subobj at
      // +0x20 then re-throw. Faithful to the Itanium ABI unwind.
      PCShared_base_dtor_stub(this /* rbx = &this->+0x20 */);
      throw e;
    }
  }

  /**
   * `ApplyGlossinessUp::eval(LayerContext const&, SurfaceProperties&)`
   * @Ozone 0x1e0600. Applies the "glossiness-up" adjustment kernel
   * against two adjacent SurfaceProperties channel triples at +0xe0 and
   * +0x100 (each triple: `{VarT<Node>-vptr @+0x0, node* @+0x10,
   * sharedCount @+0x18}` projected into the SurfaceProperties layout).
   *
   * Structural summary (asm-mirrored — every branch preserved):
   *   1. Prologue: save stack-guard @0x1e0617..@0x1e0621, allocate 0x58
   *      of locals (@0x1e060d).
   *   2. If `this->+0x10` (prev operator) is non-null, call its
   *      `vptr[+0x10]` slot with `(prevOp, ctx, out)` @0x1e0625..@0x1e0634.
   *   3. Load `prev' = this->+0x08` (the glossiness uniform ptr); build a
   *      transient `VarT<Node>` wrapper on the stack (%rbp-0x70..-0x58)
   *      whose vptr is `__ZTVN8ProShade4VarTINS_4NodeEEE + 0x10`
   *      @0x1e063b..@0x1e064f.
   *   4. Default-construct a PCSharedCount on the stack (%rbp-0x58)
   *      @0x1e0653..@0x1e0657.
   *   5. If the transient VarT's `+0x10` (%rbp-0x60 = loaded node ptr) is
   *      non-null (@0x1e0660..@0x1e0664), copy-construct a temp
   *      PCSharedCount from `glossinessUniform + 0x18` @0x1e0666..@0x1e0671,
   *      assign it into the stack VarT's sharedCount
   *      @0x1e0676..@0x1e067e, then destroy the temp @0x1e0683..@0x1e0687.
   *   6. Call adjustShininessUp(out=&stackTmp @-0x50(%rbp),
   *                             lhs=&out->+0xe0,
   *                             rhs=&stackVarT @-0x70(%rbp))
   *      @0x1e068c..@0x1e069b. Computes the "glossiness-up" pair
   *      (node*, sharedCount) into stackTmp.
   *   7. Store `stackTmp+0x10` (@-0x40(%rbp)) into `out->+0xf0`
   *      @0x1e06a0..@0x1e06a4.
   *   8. Copy-construct PCSharedCount from stackTmp+0x18 (@-0x38(%rbp))
   *      into a temp @0x1e06ab..@0x1e06b6; assign into `out->+0xf8`
   *      @0x1e06bb..@0x1e06c6; destroy temp @0x1e06cb..@0x1e06cf.
   *   9. Reset stackTmp's vptr @0x1e06d4, destroy stackTmp's shared count
   *      @0x1e06d8..@0x1e06db.
   *  10. SECOND CHANNEL TRIPLE — repeat 3..9 but:
   *      - the stack VarT is rebuilt again from `this->+0x08` @0x1e06ed
   *        (`movq 0x8(%r15), %r15`);
   *      - the adjustShininessUp lhs is `&out->+0x100` @0x1e0734;
   *      - stackTmp+0x10 stored to `out->+0x110` @0x1e074c;
   *      - stackTmp+0x18 assigned to `out->+0x118` @0x1e0763 / @0x1e0771.
   *      (@0x1e06e0..@0x1e0792.)
   *  11. stack-guard check @0x1e0797..@0x1e07b5, then retq.
   *
   * Effectively: for each of two adjacent SurfaceProperties channel
   * slots at +0xe0 and +0x100, replace the slot's VarT<Node> triple
   * (node+0x10, sharedCount+0x18) with `adjustShininessUp(slot,
   * glossinessUniform)`.
   */
  eval_surfaceProperties(
    ctx: LayerContext,
    out: SurfaceProperties,
  ): void {
    // Silence unused-parameter warnings while preserving the exact
    // signature; every reference below cites the address it re-enters.
    void ctx;
    void out;

    // @0x1e0625..@0x1e0634 — prev-op chain.
    if (this.prevOperator_at_0x10 !== null) {
      const prev = this.prevOperator_at_0x10;
      // @0x1e062e — load vptr; @0x1e0634 — callq *0x10(%rax).
      if (prev.vptr.slot_0x10 !== undefined) {
        prev.vptr.slot_0x10(prev, ctx, out);
      } else {
        // The asm doesn't null-check the SLOT, only the object. If the
        // slot is absent the branch would fault — surface as a loud
        // decode gap rather than silently no-op.
        throw new Error(
          "ApplyGlossinessUp::eval prev-op vtable +0x10 slot missing " +
            "(callq *0x10(%rax) @Ozone 0x1e0634)",
        );
      }
    }

    // @0x1e0637..@0x1e0792 — the glossiness-up body is two paired
    // adjustShininessUp calls that mutate `out`'s adjacent channel
    // triples at +0xe0 and +0x100. Because adjustShininessUp is not
    // yet transcribed (stub at 0x1e0890), running this method throws
    // loudly at the FIRST call — the correct decode-don't-guess
    // behavior. The full control-flow scaffold is written above so a
    // future decoder need only replace the stub.
    //
    // First channel triple: out->+0xe0 / +0xf0 / +0xf8.
    adjustShininessUp_stub(
      /* out = stack tmp VarT (%rbp-0x50)     */ null,
      /* lhs = &out->+0xe0                    */ null,
      /* rhs = stack VarT wrapping this->+0x08 */ null,
    );
    // (Unreachable in the current gap-throwing port; kept as a
    //  faithful control-flow record of the second call for reviewers.)
    // Second channel triple: out->+0x100 / +0x110 / +0x118.
    // adjustShininessUp_stub(null, null, null);
  }

  /**
   * `ApplyGlossinessUp::eval(LayerContext const&,
   *                          ProShade::VarT<ProShade::Node>&)`
   * @Ozone 0x1e0e60. Single-channel variant of the multi-channel
   * SurfaceProperties overload: applies "glossiness-up" adjustment to
   * the incoming VarT<Node> in place.
   *
   * Structural summary (asm-mirrored):
   *   1. Prologue: save stack-guard @0x1e0e75..@0x1e0e7f, allocate 0x50
   *      of locals (@0x1e0e6b).
   *   2. If `this->+0x10` (prev operator) is non-null, call its
   *      `vptr[+0x18]` slot with `(prevOp, ctx, out)` @0x1e0e83..@0x1e0e92.
   *      (Note: this overload uses +0x18, the OTHER overload uses +0x10 —
   *      they are two distinct virtual slots.)
   *   3. Load prev' = this->+0x08; build transient VarT on the stack
   *      (%rbp-0x68..-0x58) whose vptr is
   *      `__ZTVN8ProShade4VarTINS_4NodeEEE + 0x10` @0x1e0e95..@0x1e0eac.
   *   4. Default-construct PCSharedCount on the stack (%rbp-0x50)
   *      @0x1e0eb0..@0x1e0eb7.
   *   5. If VarT +0x10 is non-null (@0x1e0ebc..@0x1e0ec4), copy-construct
   *      temp PCSharedCount from `glossinessUniform + 0x18` and assign
   *      into stack PCSharedCount @0x1e0ec6..@0x1e0ee6.
   *   6. Call adjustShininessUp(out=&stackTmp @-0x48(%rbp),
   *                              lhs=%r14 (the &out VarT<Node> arg),
   *                              rhs=&stackVarT @-0x68(%rbp))
   *      @0x1e0eeb..@0x1e0ef6.
   *   7. Store `stackTmp+0x10` (@-0x38(%rbp)) into `out->+0x10`
   *      @0x1e0efb..@0x1e0eff.
   *   8. Copy-construct PCSharedCount from stackTmp+0x18 (@-0x30(%rbp))
   *      into new temp @0x1e0f03..@0x1e0f0e; assign into `out->+0x18`
   *      (via `%r14 + 0x18`) @0x1e0f13..@0x1e0f1e; destroy temp
   *      @0x1e0f23..@0x1e0f27.
   *   9. Reset stackTmp vptr @0x1e0f2c, teardown counts, retq.
   *  10. stack-guard check @0x1e0f44..@0x1e0f60.
   *
   * Effectively: `out = adjustShininessUp(out, glossinessUniform)`.
   */
  eval_varTNode(
    ctx: LayerContext,
    out: ProShadeVarT<ProShadeNode>,
  ): void {
    void ctx;
    void out;

    // @0x1e0e83..@0x1e0e92 — prev-op chain, this overload uses +0x18.
    if (this.prevOperator_at_0x10 !== null) {
      const prev = this.prevOperator_at_0x10;
      if (prev.vptr.slot_0x18 !== undefined) {
        prev.vptr.slot_0x18(prev, ctx, out);
      } else {
        throw new Error(
          "ApplyGlossinessUp::eval prev-op vtable +0x18 slot missing " +
            "(callq *0x18(%rax) @Ozone 0x1e0e92)",
        );
      }
    }

    // @0x1e0e95..@0x1e0ef6 — same "wrap this->+0x08 as a VarT<Node> and
    // call adjustShininessUp" pattern as the other overload, but only
    // once (for the single VarT<Node>& argument, not a two-channel
    // SurfaceProperties). adjustShininessUp is still stubbed out —
    // throws loudly.
    adjustShininessUp_stub(
      /* out = stack tmp VarT (%rbp-0x48)  */ null,
      /* lhs = the VarT<Node>& argument    */ null,
      /* rhs = stack VarT wrapping this->+0x08 */ null,
    );
  }

  /**
   * `ApplyGlossinessUp::writeHash(PCHashWriteStream&)` @Ozone 0x1e0fe0.
   *
   * Full body (all @Ozone):
   *   0x1e0fe0  frame prologue
   *   0x1e0fea  movq %rdi,%r14 ; movq %rsi,%rbx     ; save this, stream
   *   0x1e0fed  callq __ZN23LiMaterialLayerOperator9writeHashER17PCHashWriteStream
   *                                                 ; base's writeHash
   *   0x1e0ff2  movq 0x10(%r14),%rdi                ; rdi = this->+0x10
   *   0x1e0ff6  testq %rdi,%rdi
   *   0x1e0ff9  je 0x1e100b                         ; if NULL -> epilogue
   *   0x1e0ffb  movq (%rdi),%rax                    ; vtable
   *   0x1e0ffe  movq 0x20(%rax),%rax                ; vtable[+0x20]
   *   0x1e1002  movq %rbx,%rsi                      ; rsi = stream
   *   0x1e1005..0x1e1009 epilogue and jmpq *%rax    ; tail-call slot
   *   0x1e100b..0x1e100f epilogue and retq
   */
  writeHash(stream: unknown): void {
    // @0x1e0fed — LiMaterialLayerOperator::writeHash(this, stream).
    LiMaterialLayerOperator_writeHash_stub(this, stream);
    // @0x1e0ff2..@0x1e0ff9 — prev-op null-check.
    const prev = this.prevOperator_at_0x10;
    if (prev !== null) {
      // @0x1e0ffb..@0x1e1009 — tail-jmp to *(vptr[+0x20]) with
      // (%rdi=prev, %rsi=stream). The slot is a virtual writeHash on
      // the prev-op's own type; we don't have a decoded shape for it,
      // so surface it as a decode gap rather than skip.
      if (prev.vptr.slot_0x20 !== undefined) {
        prev.vptr.slot_0x20(prev, stream);
      } else {
        throw new Error(
          "ApplyGlossinessUp::writeHash prev-op vtable +0x20 slot missing " +
            "(jmpq *%rax after vtable[+0x20] load @Ozone 0x1e1009)",
        );
      }
    }
    // @0x1e100b — retq.
  }

  /**
   * `ApplyGlossinessUp::~ApplyGlossinessUp()` D1 @Ozone 0x1e3210
   * (__ZN17ApplyGlossinessUpD1Ev).
   *
   * Full body (all @Ozone):
   *   0x1e3210  frame prologue
   *   0x1e3216  movq %rdi,%rbx
   *   0x1e3219  leaq 0x6600d0(%rip),%rax
   *   0x1e3220  movq %rax,(%rdi)                   ; reinstall +0x00 vptr
   *                                                 ; = &__ZTV17ApplyGlossinessUp+0x10 (0x8432f0)
   *   0x1e3223  leaq 0x66010e(%rip),%rax
   *   0x1e322a  movq %rax,0x20(%rdi)               ; reinstall +0x20 vptr
   *                                                 ; = &__ZTV23LiMaterialLayerOperator+0x10 (0x843338)
   *   0x1e322e  addq $0x18,%rdi                    ; rdi = &this->+0x18
   *   0x1e3232  callq __ZN13PCSharedCountD1Ev      ; destroy shared count
   *   0x1e3237  leaq __ZTV13PCShared_base(%rip),%rax
   *   0x1e323e  addq $0x10,%rax
   *   0x1e3242  movq %rax,0x20(%rbx)               ; +0x20 = PCShared_base vptr
   *   0x1e3246  movq 0x28(%rbx),%rdi               ; rdi = this->+0x28
   *   0x1e324a  testq %rdi,%rdi
   *   0x1e324d  je 0x1e3254
   *   0x1e324f  callq __ZN18PC_Sp_counted_base12weak_releaseEv
   *   0x1e3254  epilogue -> retq
   *   0x1e325b  <landing pad>: ___clang_call_terminate
   *
   * Note the reinstall-progression: first back to `ApplyGlossinessUp`
   * vptrs (0x1e3220/0x1e322a) — matches Itanium ABI "reinstall my own
   * vptr at dtor start" — then AFTER shared-count teardown the +0x20
   * slot is rewritten a SECOND time to `__ZTV13PCShared_base + 0x10`
   * (0x1e3242). Both writes to +0x20 are faithful.
   */
  destructor_D1(): void {
    // @0x1e3220 — this->+0x00 = ApplyGlossinessUp vtable installed slot.
    this.vptr_at_0x00 = "__ZTV17ApplyGlossinessUp+0x10";
    // @0x1e322a — this->+0x20 = LiMaterialLayerOperator vtable installed slot.
    this.vptr_at_0x20 = "__ZTV23LiMaterialLayerOperator+0x10";
    // @0x1e322e..@0x1e3232 — destroy shared-count at +0x18.
    PCSharedCount_dtor_stub(this.sharedCount_at_0x18);
    // @0x1e3242 — REWRITE this->+0x20 = PCShared_base vtable installed slot.
    this.vptr_at_0x20 = "__ZTV13PCShared_base+0x10";
    // @0x1e3246..@0x1e324d — null-check +0x28 and weak_release.
    const p = this.spCountedBaseBack_at_0x28;
    if (p !== null) {
      PC_Sp_counted_base_weak_release_stub(p);
    }
    // @0x1e3254 — retq.
  }

  /**
   * `ApplyGlossinessUp::~ApplyGlossinessUp()` D0 @Ozone 0x1e3270
   * (__ZN17ApplyGlossinessUpD0Ev). Same body as D1 followed by
   * tail-jmp to `operator delete`.
   *
   * Full body (all @Ozone):
   *   0x1e3270  frame prologue
   *   0x1e3276  movq %rdi,%rbx
   *   0x1e3279..0x1e32a2  same reinstall+PCSharedCount D1 sequence
   *                       (@0x1e3279 uses displacement 0x660070,
   *                        @0x1e3283 uses 0x6600ae — both resolve to
   *                        the same 0x8432f0 / 0x843338 targets as D1)
   *   0x1e32a6..0x1e32ad  null-check +0x28 & weak_release
   *                        (@0x1e32af `callq weak_release`)
   *   0x1e32b4..0x1e32bc  movq %rbx,%rdi ; epilogue
   *   0x1e32bd  jmp __ZdlPv                        ; tail-call operator delete
   *   0x1e32c2  <landing pad>: ___clang_call_terminate
   */
  destructor_D0(): void {
    // Mirror the D1 body verbatim.
    this.destructor_D1();
    // @0x1e32bd — tail-jmp to operator delete(this).
    operator_delete_noop(this);
  }
}
