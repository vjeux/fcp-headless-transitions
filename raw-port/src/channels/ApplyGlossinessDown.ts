// ApplyGlossinessDown.ts — Ozone's glossiness "down" finish operator.
//
// Faithful transcription of Ozone.framework's `ApplyGlossinessDown` class
// (7 exported symbols total; C1/C2, D0/D1, both eval overloads, writeHash).
// This is the sibling of `ApplyGlossinessUp` — same structural pattern with a
// DIFFERENT feature-defining helper (`adjustShininessDown` @0x1e13a0 vs
// `adjustShininessUp` @0x1e0890) and TWO DISTINCT ctor bodies (C1 primary +
// C2 base-subobject with VTT parameter) — Up compiled both to the same body
// but Down did not; the C2 disasm at 0x1e1010 pulls the vtable pointers from
// its VTT argument (%rsi at offsets 0x00/0x08/0x10) using the standard
// Itanium `top-offset at vtable[-0x18]` idiom.
//
// Framework: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/
//                  Ozone.framework/Versions/A/Ozone).
//
// Ported symbols (all @Ozone):
//   @0x00000000001e1010  ApplyGlossinessDown::ApplyGlossinessDown(int)  [C2 base subobj]
//                        __ZN19ApplyGlossinessDownC2Ei
//   @0x00000000001e1090  ApplyGlossinessDown::ApplyGlossinessDown(int)  [C1 complete obj]
//                        __ZN19ApplyGlossinessDownC1Ei
//                        (Unlike ApplyGlossinessUp, Down emits C1 and C2 to
//                         DISTINCT bodies — C2 reads vtable pointers from a
//                         VTT `%rsi` argument via the Itanium negative-top
//                         `(%rax-0x18)` idiom, while C1 leaq-installs them
//                         directly. Both share the setUpFinishUniforms/
//                         finishUniforms[i<<4]/+0x08 tail, and both call
//                         PCSharedCount() on `this + 0x18`.)
//   @0x00000000001e1110  ApplyGlossinessDown::eval(LayerContext const&,
//                                                   SurfaceProperties&)
//                        __ZN19ApplyGlossinessDown4evalERK12LayerContextR17SurfaceProperties
//   @0x00000000001e1530  ApplyGlossinessDown::eval(LayerContext const&,
//                                                   ProShade::VarT<ProShade::Node>&)
//                        __ZN19ApplyGlossinessDown4evalERK12LayerContextRN8ProShade4VarTINS3_4NodeEEE
//   @0x00000000001e16b0  ApplyGlossinessDown::writeHash(PCHashWriteStream&)
//                        __ZN19ApplyGlossinessDown9writeHashER17PCHashWriteStream
//   @0x00000000001e33a0  ApplyGlossinessDown::~ApplyGlossinessDown()  [D1]
//                        __ZN19ApplyGlossinessDownD1Ev
//   @0x00000000001e3400  ApplyGlossinessDown::~ApplyGlossinessDown()  [D0]
//                        __ZN19ApplyGlossinessDownD0Ev
//
// Callees / symbol imports discovered by walking the disasm:
//   @0x00000000001e13a0  adjustShininessDown(ProShade::VarT<ProShade::Node> const&,
//                                            ProShade::VarT<ProShade::Node> const&)
//                        __ZL19adjustShininessDownRKN8ProShade4VarTINS_4NodeEEES4_
//                        (static, Ozone-internal; the DISTINCT feature of the
//                         "down" glossiness operator vs. the "up" variant at
//                         @0x1e0890. Not yet transcribed.)
//   @0x00000000001e3960  setUpFinishUniforms(int)                  [static, Ozone]
//                        __ZL19setUpFinishUniformsi
//                        (SHARED with ApplyGlossinessUp — the finishUniforms
//                         vector is a module-static whose per-index slot each
//                         finish operator picks a distinct slot from.)
//   @0x000000000093d8a0  finishUniforms                            [static data]
//                        __ZL14finishUniforms
//                        (SHARED module-static; per-slot stride is 0x10;
//                         ctors index as `finishUniforms[i<<4]`. See the
//                         extended ApplyGlossinessUp header for the recovered
//                         semantics — nothing about it is different in Down.)
//   @Ozone vtable        __ZTV19ApplyGlossinessDown @0x843380 (base)
//                        installed vptr = base+0x10 = 0x843390 (per
//                        resolve.py); ctor writes 0x843398 (installed+0x8)
//                        into this->+0x00 — same shape as Up which writes
//                        installed+0x8 = 0x8432f0. The two dtors D1/D0 are
//                        at vtable *0x08/*0x10, then eval(SurfaceProps) at
//                        *0x18, eval(VarT<Node>) at *0x20, writeHash at
//                        *0x28 — SAME dispatch order as Up.
//                        (Down's vtable is 0xa8 bytes larger because
//                         ApplyReflectivity is bundled as a secondary
//                         vtable at *0xa8+ — not our concern here since
//                         ApplyReflectivity is a separate class.)
//   @Ozone vtable        __ZTV23LiMaterialLayerOperator base subobj
//                        installed slot at ctor-store 0x8433d8 (C1) — a
//                        DIFFERENT offset from Up (which stored 0x843338).
//                        Down's LayerOperator subobj vptr lives further into
//                        the vtable because Down's primary vtable is bigger.
//   @Ozone stub          __ZN13PCSharedCountC1Ev, ...C1ERKS_, ...aSES_, ...D1Ev
//                        (same 4 PCSharedCount stubs as Up)
//   @Ozone stub          __ZN23LiMaterialLayerOperator9writeHashER17PCHashWriteStream
//                        (used by writeHash @0x1e16bd; same stub as Up)
//   @Ozone stub          __ZN13PCShared_baseD2Ev
//                        (called by C1's landing pad @0x1e1103; C2 has no
//                         landing pad because it tail-calls PCSharedCount
//                         @0x1e1085.)
//   @Ozone stub          __ZN18PC_Sp_counted_base12weak_releaseEv @0x6de4fc
//                        (D1 @0x1e33df / D0 @0x1e343f; same as Up.)
//   @Ozone stub          __ZdlPv @0x6dfc36
//                        (D0 @0x1e344d tail-jmp; same as Up.)
//   @Ozone stub          ___clang_call_terminate / ___stack_chk_fail /
//                        __Unwind_Resume — landing pads only.
//
// STRUCT LAYOUT (recovered from ctor @0x1e1090 and dtors @0x1e33a0/@0x1e3400):
//   +0x00  vptr(ApplyGlossinessDown)          @0x1e10ac..@0x1e10b3 install
//                                              (RIP+0x6622e5 from 0x1e10ac =>
//                                               0x1e10ac+7+0x6622e5 = 0x843398
//                                               = __ZTV19ApplyGlossinessDown +
//                                               0x18 per resolve.py;
//                                               re-installed by D1 @0x1e33b0
//                                               via RIP+0x65ffe8 from 0x1e33a9
//                                               = 0x1e33a9+7+0x65ffe8 = 0x843398
//                                               — same target, confirming.
//                                               D0 mirrors at @0x1e3409 with
//                                               displacement 0x65ff88 =>
//                                               0x1e3409+7+0x65ff88 = 0x843398.)
//   +0x08  ProShade::Uniform*                 @0x1e10d6..@0x1e10da —
//                                              `finishUniforms[i<<4]`;
//                                              raw slot pointer stored
//                                              WITHOUT any +0x20 fixup.
//                                              (Identical to Up ctor
//                                              @0x1e05c6..@0x1e05ca —
//                                              only ApplyReflectivity's
//                                              ctor adds +0x20 before
//                                              storing.)
//   +0x10  void*                              @0x1e10de — cleared to NULL
//                                              by C1; loaded by both eval
//                                              overloads and tested for
//                                              NULL. When non-null:
//                                                eval(SurfaceProperties)
//                                                  @0x1e1144 calls
//                                                  vptr[+0x10] with
//                                                  %rdx = the out arg.
//                                                eval(VarT<Node>)
//                                                  @0x1e1562 calls
//                                                  vptr[+0x18] with
//                                                  %rdx = the out arg.
//                                                writeHash @0x1e16d9
//                                                  tail-jmps vptr[+0x20]
//                                                  with %rsi = stream.
//                                              (Same OPTIONAL prev-op
//                                              chain hook as Up.)
//   +0x18  PCSharedCount                      @0x1e10ed C1 ctor call —
//                                              LiMaterialLayerOperator
//                                              base subobject's shared-count
//                                              block. C2 tail-jmps to the
//                                              same ctor at @0x1e1085
//                                              (`jmp 0x6ddae8`).
//   +0x28  vptr(subobject: LiMaterialLayerOperator)
//                                              @0x1e10b6..@0x1e10bd install
//                                              (RIP+0x662323 from 0x1e10b6 =>
//                                               0x1e10b6+7+0x662323 = 0x8433e0
//                                               — the LiMaterialLayerOperator
//                                               construction-vtable slot at
//                                               vtable+0x60. This differs
//                                               from Up (which places the
//                                               base subobj vptr at +0x20)
//                                               because Down's own vtable is
//                                               larger — the class layout
//                                               has an additional 0x08 pad
//                                               ahead of the base subobj.
//                                               D1 re-installs @0x1e33ba via
//                                               RIP+0x660026 from 0x1e33b3 =>
//                                               0x1e33b3+7+0x660026 = 0x8433e0
//                                               — same target, confirming.)
//   +0x30  PC_Sp_counted_base*                @0x1e10a4 cleared to NULL;
//                                              D1 @0x1e33d6 / D0 @0x1e3436
//                                              null-check & call
//                                              weak_release when non-null.
//                                              (Up put this at +0x28 —
//                                              Down's larger primary vtable
//                                              pushed the layout by 0x08.)
//
// The eval-overload channel-triple offsets in SurfaceProperties (+0xe0/+0xf0/
// +0xf8 first pair; +0x100/+0x110/+0x118 second pair) are IDENTICAL to Up —
// both operators write into the SAME two adjacent channel triples on the
// SurfaceProperties layout, differing only by which helper computes the
// replacement pair (adjustShininessUp vs adjustShininessDown).
//
// Verification: the ledger entry for ApplyGlossinessDown lists exactly these
// 7 symbols (see raw-port/army/ledger/Ozone.ledger.json). No frontier callee
// class is dereferenced past its vtable slot here — all struct access is by
// offset citation. The math body itself is not observable here: it is entirely
// contained in the un-transcribed static helper `adjustShininessDown`
// @0x1e13a0. This mirrors ApplyGlossinessUp's decode gap.

import { LiMaterialLayerOperator } from "./LiMaterialLayerOperator";
import type {
  LayerContext,
  SurfaceProperties,
  ProShadeNode,
  ProShadeVarT,
} from "./LiMaterialLayerOperator";

/* ------------------------------------------------------------------------- *
 * External stubs — every one throws citing its @0xADDR (Rule 3).
 * Structurally identical to the stubs in ApplyGlossinessUp; the only
 * feature-defining stub is `adjustShininessDown` @0x1e13a0 (vs Up's
 * `adjustShininessUp` @0x1e0890).
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
 * `adjustShininessDown(ProShade::VarT<Node> const&, ProShade::VarT<Node> const&)`
 * — the static Ozone helper @Ozone 0x1e13a0
 * (__ZL19adjustShininessDownRKN8ProShade4VarTINS_4NodeEEES4_). This is the
 * feature-defining kernel of ApplyGlossinessDown: given the incoming channel
 * VarT<Node> (`lhs`) and a VarT<Node> wrapping the glossiness uniform
 * (`rhs`), it computes the "glossiness-down" adjustment as an out-VarT<Node>
 * (`out`). Not yet transcribed @0x1e13a0 — its body walks the ProShade node
 * graph and is beyond the scope of a single leaf port. The sibling "up"
 * variant lives at @0x1e0890 (adjustShininessUp) and is invoked by
 * ApplyGlossinessUp in the same shape.
 */
function adjustShininessDown_stub(
  _out: unknown,
  _lhs: unknown,
  _rhs: unknown,
): void {
  throw new Error(
    "adjustShininessDown(ProShade::VarT<Node> const&, ProShade::VarT<Node> const&) " +
      "@Ozone 0x1e13a0 (__ZL19adjustShininessDownRKN8ProShade4VarTINS_4NodeEEES4_) " +
      "not yet transcribed",
  );
}

/**
 * `LiMaterialLayerOperator::writeHash(PCHashWriteStream&)` — base's
 * hash-append. @Ozone stub 0x6de7a2 (external symbol stub for
 * __ZN23LiMaterialLayerOperator9writeHashER17PCHashWriteStream). Same stub
 * cited from ApplyGlossinessUp.writeHash.
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
 * (__ZL19setUpFinishUniformsi). Shared with ApplyGlossinessUp; populates
 * the module-static `finishUniforms` vector. Not yet transcribed.
 */
function setUpFinishUniforms_stub(_index: number): void {
  throw new Error(
    "setUpFinishUniforms(int) @Ozone 0x1e3960 " +
      "(__ZL19setUpFinishUniformsi) not yet transcribed",
  );
}

/**
 * `finishUniforms` module-static — @Ozone 0x93d8a0
 * (__ZL14finishUniforms). Shared with ApplyGlossinessUp; slot i is at
 * `finishUniforms[i << 4]`. Reading before setUpFinishUniforms has
 * populated it is a bug (guarded by the ctor's ordered call at
 * @0x1e10c3 / @0x1e1057).
 */
const finishUniforms: {
  /** stride 0x10; each slot holds a per-index pair whose element +0x00
   *  points to a `ProShade::Uniform`. */
  slots: (Uint8Array | null)[];
} = { slots: [] };

/**
 * `finishUniforms[index * 0x10]` — the pointer the ctor stashes into
 * `this->+0x08`. Modeled as an opaque token so the ctor's store is
 * observable without decoding the ProShade::Uniform layout.
 */
function finishUniforms_slot(index: number): unknown {
  // Faithful to @0x1e10c8..@0x1e10da (C1):
  //   movslq %r15d,%rax
  //   movq __ZL14finishUniforms(%rip),%rcx
  //   shlq $0x4,%rax
  //   movq (%rcx,%rax),%rax
  //   movq %rax,0x8(%r14)   ; this->+0x08 = rax
  // Same shape as C2 @0x1e105c..@0x1e106e (with %rbx instead of %r14 —
  // C2 tail-calls PCSharedCount rather than returning). Neither ctor
  // adds a +0x20 fixup to %rax before storing (unlike ApplyReflectivity's
  // sibling ctor which does add +0x20).
  const slot = finishUniforms.slots[index];
  if (slot === undefined || slot === null) {
    // The ctor has already called setUpFinishUniforms(index); this branch
    // only fires if that stub throws (which it currently does), so we
    // surface a decode-loud error rather than fabricate a value.
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
 * D1 and D0 when `this->+0x30` is non-null. Not yet transcribed.
 * (Note: on Down the back-pointer lives at +0x30, one qword later than
 *  Up's +0x28 — the class layout is shifted by 0x08 because Down's
 *  primary vtable is larger and pushes the base subobj to +0x28.)
 */
function PC_Sp_counted_base_weak_release_stub(_p: unknown): void {
  throw new Error(
    "PC_Sp_counted_base::weak_release() @Ozone stub 0x6de4fc " +
      "(__ZN18PC_Sp_counted_base12weak_releaseEv) not yet transcribed",
  );
}

/**
 * `PCShared_base::~PCShared_base()` — external stub, @Ozone
 * (imported via __ZN13PCShared_baseD2Ev). Used by the C1 ctor's landing
 * pad @0x1e1103 — a happy-path port never reaches it. C2 (@0x1e1010) has
 * NO landing pad because it tail-calls PCSharedCount at @0x1e1085
 * (unwinding is delegated to PCSharedCount's own frame).
 */
function PCShared_base_dtor_stub(_this: unknown): void {
  throw new Error(
    "PCShared_base::~PCShared_base() @Ozone stub (__ZN13PCShared_baseD2Ev) " +
      "not yet transcribed (called only from C1 landing pad @0x1e1103)",
  );
}

/**
 * `operator delete(void*)` — external stub for __ZdlPv @Ozone 0x6dfc36.
 * The D0 destructor tail-jumps to it at @0x1e344d after teardown.
 * Modeled as a runtime no-op (the JS GC frees the object automatically).
 */
function operator_delete_noop(_p: unknown): void {
  // no-op in the GC'd JS runtime; mirrors the tail-jmp @0x1e344d.
}

/* ------------------------------------------------------------------------- *
 * Vtable-address citations — the two RIP-relative vtable loads in C1 ctor
 * resolve to the following mangled targets in the Ozone binary (per
 * `python3 raw-port/army/tools/resolve.py Ozone vtable ApplyGlossinessDown`):
 *   @0x1e10ac  leaq 0x6622e5(%rip),%rax
 *              -> 0x1e10ac + 7 + 0x6622e5 = 0x843398
 *              = __ZTV19ApplyGlossinessDown + 0x18  (installed-vptr + 0x08).
 *   @0x1e10b6  leaq 0x662323(%rip),%rax
 *              -> 0x1e10b6 + 7 + 0x662323 = 0x8433e0
 *              = __ZTV19ApplyGlossinessDown + 0x60  (the base subobject
 *                LiMaterialLayerOperator installed slot — Down bundles the
 *                base subobj's vptr into the primary vtable because the
 *                class has a secondary ApplyReflectivity vtable further on).
 *
 * The D1 dtor re-derives the same two addresses via different-magnitude
 * PC-relative displacements:
 *   @0x1e33a9  leaq 0x65ffe8(%rip),%rax  -> 0x1e33a9+7+0x65ffe8 = 0x843398 OK
 *   @0x1e33b3  leaq 0x660026(%rip),%rax  -> 0x1e33b3+7+0x660026 = 0x8433e0 OK
 * The D0 dtor mirrors D1 at fresh sites:
 *   @0x1e3409  leaq 0x65ff88(%rip),%rax  -> 0x1e3409+7+0x65ff88 = 0x843398 OK
 *   @0x1e3413  leaq 0x65ffc6(%rip),%rax  -> 0x1e3413+7+0x65ffc6 = 0x8433e0 OK
 *
 * Primary vtable dispatch slots (from resolve.py output, base = 0x843380):
 *   *0x08  -> 0x1e33a0  ApplyGlossinessDown::~ApplyGlossinessDown() (D1)
 *   *0x10  -> 0x1e3400  ApplyGlossinessDown::~ApplyGlossinessDown() (D0)
 *   *0x18  -> 0x1e1110  eval(LayerContext const&, SurfaceProperties&)
 *   *0x20  -> 0x1e1530  eval(LayerContext const&, ProShade::VarT<ProShade::Node>&)
 *   *0x28  -> 0x1e16b0  writeHash(PCHashWriteStream&)
 * ------------------------------------------------------------------------- */

/**
 * `ApplyGlossinessDown` — Ozone glossiness-down finish operator. Extends
 * `LiMaterialLayerOperator`. Fields laid out per the recovered layout in
 * this file's header comment. NOTE: Down's layout is 0x08 wider than Up's
 * because Down's primary vtable is larger and pushes the base-subobj vptr
 * from +0x20 (Up) to +0x28 (Down); the back-pointer follows at +0x30
 * instead of +0x28.
 */
export class ApplyGlossinessDown extends LiMaterialLayerOperator {
  /**
   * @Ozone ApplyGlossinessDown +0x00 — vptr.
   * Installed by C1 ctor @0x1e10ac..@0x1e10b3 to
   * `__ZTV19ApplyGlossinessDown + 0x18` (= 0x843398). C2 mirrors via the
   * VTT-load at @0x1e101d..@0x1e1046 (three vptrs pulled from %rsi).
   * Modeled as a string tag.
   */
  vptr_at_0x00: string = "__ZTV19ApplyGlossinessDown+0x18";

  /**
   * @Ozone ApplyGlossinessDown +0x08 — pointer into `finishUniforms[i<<4]`
   * (a `ProShade::Uniform`-slot address). Set by C1 ctor @0x1e10da and
   * C2 ctor @0x1e106e. NO +0x20 fixup applied (same as Up).
   */
  glossinessUniform_at_0x08: unknown = null;

  /**
   * @Ozone ApplyGlossinessDown +0x10 — optional "prev operator" pointer.
   * Cleared to NULL by C1 ctor @0x1e10de and C2 ctor @0x1e1072. Both eval
   * overloads null-check it and, when non-null, invoke its vtable slot
   * (@+0x10 for eval(SurfaceProps) @0x1e1144, @+0x18 for eval(VarT<Node>)
   * @0x1e1562, @+0x20 for writeHash tail-jmp @0x1e16d9).
   */
  prevOperator_at_0x10: {
    /** Loaded @0x1e1135 (eval SurfaceProps), @0x1e155c (eval VarT<Node>),
     *  @0x1e16cb (writeHash). */
    vptr: {
      /** Slot @0x10 called by eval(LayerContext, SurfaceProperties&)
       *  @0x1e1144 as `callq *0x10(%rax)` with %rdx = out. */
      slot_0x10?: (self: unknown, ctx: LayerContext, out: SurfaceProperties) => void;
      /** Slot @0x18 called by eval(LayerContext, VarT<Node>&) @0x1e1562
       *  as `callq *0x18(%rax)` with %rdx = out. */
      slot_0x18?: (
        self: unknown,
        ctx: LayerContext,
        out: ProShadeVarT<ProShadeNode>,
      ) => void;
      /** Slot @0x20 tail-jmp'd from writeHash @0x1e16d9. */
      slot_0x20?: (self: unknown, stream: unknown) => void;
    };
  } | null = null;

  /**
   * @Ozone ApplyGlossinessDown +0x18 — inherited PCSharedCount subobject.
   * C1 constructs @0x1e10ed via `__ZN13PCSharedCountC1Ev(%r14 + 0x18)`;
   * C2 tail-jmps to the same ctor @0x1e1085 with `%rdi = %rbx + 0x18`.
   */
  sharedCount_at_0x18: unknown = null;

  /**
   * @Ozone ApplyGlossinessDown +0x28 — LiMaterialLayerOperator base
   * subobject vptr. Installed by C1 ctor @0x1e10b6..@0x1e10bd to
   * `__ZTV19ApplyGlossinessDown + 0x60` (= 0x8433e0 — the base-in-Down
   * construction-vtable slot). Down's layout puts this at +0x28 rather
   * than Up's +0x20 because Down's primary vtable includes secondary
   * dispatch tables that occupy the intervening qwords.
   */
  vptr_at_0x28: string = "__ZTV19ApplyGlossinessDown+0x60";

  /**
   * @Ozone ApplyGlossinessDown +0x30 — nullable
   * `PC_Sp_counted_base*` back-pointer. Cleared by C1 ctor @0x1e10a4
   * (`movq $0x0, 0x30(%rdi)`). D1 @0x1e33d6 and D0 @0x1e3436 null-check
   * & call weak_release when non-null. (Up puts this at +0x28; Down's
   * larger primary vtable shifts everything by 0x08.)
   */
  spCountedBaseBack_at_0x30: unknown = null;

  /**
   * `ApplyGlossinessDown::ApplyGlossinessDown(int)` C1 complete-object
   * ctor @Ozone 0x1e1090 (__ZN19ApplyGlossinessDownC1Ei).
   *
   * Full body (all @Ozone):
   *   0x1e1090  frame prologue (r15/r14/rbx/rax saved)
   *   0x1e109a  movl %esi,%r15d              ; save index arg
   *   0x1e109d  movq %rdi,%r14               ; save this
   *   0x1e10a0  leaq 0x28(%rdi),%rbx         ; rbx = &this->+0x28 (subobj)
   *   0x1e10a4  movq $0x0, 0x30(%rdi)        ; this->+0x30 = NULL
   *   0x1e10ac  leaq 0x6622e5(%rip),%rax     ; = &__ZTV19ApplyGlossinessDown+0x18 (0x843398)
   *   0x1e10b3  movq %rax, (%rdi)            ; this->+0x00 = vptr(Down)
   *   0x1e10b6  leaq 0x662323(%rip),%rax     ; = &__ZTV19ApplyGlossinessDown+0x60 (0x8433e0)
   *   0x1e10bd  movq %rax, 0x28(%rdi)        ; this->+0x28 = vptr(base subobj)
   *   0x1e10c1  movl %esi,%edi
   *   0x1e10c3  callq __ZL19setUpFinishUniformsi   ; setUpFinishUniforms(index)
   *   0x1e10c8  movslq %r15d,%rax
   *   0x1e10cb  movq __ZL14finishUniforms(%rip),%rcx
   *   0x1e10d2  shlq $0x4,%rax               ; rax = index * 0x10
   *   0x1e10d6  movq (%rcx,%rax),%rax        ; rax = finishUniforms[index<<4]
   *   0x1e10da  movq %rax,0x8(%r14)          ; this->+0x08 = raw slot ptr
   *                                            (NO +0x20 fixup — same as Up).
   *   0x1e10de  movq $0x0,0x10(%r14)         ; this->+0x10 = NULL
   *   0x1e10e6  addq $0x18,%r14              ; r14 = &this->+0x18
   *   0x1e10ea  movq %r14,%rdi
   *   0x1e10ed  callq __ZN13PCSharedCountC1Ev  ; PCSharedCount(&this->+0x18)
   *   0x1e10f2..0x1e10fc epilogue -> retq
   *   0x1e10fd..0x1e110b  <landing pad>: PCShared_base_dtor(&this->+0x28)
   *                                     + __Unwind_Resume
   *
   * Note: the ctor sets `this->+0x28 = vptr(base subobj)` BEFORE calling
   * setUpFinishUniforms/PCSharedCount so an exception during construction
   * unwinds through the base subobject's dtor (the landing pad calls
   * __ZN13PCShared_baseD2Ev on rbx = &this->+0x28).
   */
  constructor(index: number) {
    super();
    // @0x1e10a0 — take &this->+0x28 as the base subobj pointer (rbx). The
    // JS model doesn't need a raw address, but we track the field for the
    // landing-pad semantics below.
    // @0x1e10a4 — this->+0x30 = NULL.
    this.spCountedBaseBack_at_0x30 = null;
    // @0x1e10ac..@0x1e10b3 — install ApplyGlossinessDown vptr at +0x00.
    this.vptr_at_0x00 = "__ZTV19ApplyGlossinessDown+0x18";
    // @0x1e10b6..@0x1e10bd — install base subobj vptr at +0x28.
    this.vptr_at_0x28 = "__ZTV19ApplyGlossinessDown+0x60";

    try {
      // @0x1e10c1..@0x1e10c3 — setUpFinishUniforms(index).
      setUpFinishUniforms_stub(index);
      // @0x1e10c8..@0x1e10da — this->+0x08 = finishUniforms[index<<4].
      this.glossinessUniform_at_0x08 = finishUniforms_slot(index);
      // @0x1e10de — this->+0x10 = NULL.
      this.prevOperator_at_0x10 = null;
      // @0x1e10e6..@0x1e10ed — PCSharedCount() on &this->+0x18.
      PCSharedCount_ctor_default_stub(this.sharedCount_at_0x18);
      // @0x1e10f2..@0x1e10fc — retq (fall through).
    } catch (e) {
      // @0x1e10fd..@0x1e110b — landing pad: destroy the base subobj at
      // +0x28 then re-throw. Faithful to the Itanium ABI unwind. The
      // C1 landing pad differs from Up (which lives at @0x1e05ed) only
      // by address; the semantics are identical.
      PCShared_base_dtor_stub(this /* rbx = &this->+0x28 */);
      throw e;
    }
  }

  /**
   * `ApplyGlossinessDown::ApplyGlossinessDown(int)` C2 base-subobject
   * ctor @Ozone 0x1e1010 (__ZN19ApplyGlossinessDownC2Ei).
   *
   * UNLIKE ApplyGlossinessUp (which emits C1 and C2 to the same body),
   * Down's C2 is a distinct body that receives a `VTT*` (via %rsi) and
   * pulls THREE vtable pointers from it using the Itanium negative-top
   * `(%rax - 0x18)` idiom. This is the standard shape for a ctor called
   * as a base-subobject of a most-derived class that has virtual bases.
   *
   * Full body (all @Ozone):
   *   0x1e1010  frame prologue (r14/rbx saved)
   *   0x1e1017  movl %edx,%r14d              ; save index (arg 3 %edx —
   *                                             C2's signature is really
   *                                             `(this, VTT*, int)`)
   *   0x1e101a  movq %rdi,%rbx               ; save this
   *   0x1e101d  movq 0x10(%rsi),%rax         ; rax = VTT[+0x10]
   *   0x1e1021  movq %rax,(%rdi)             ; this->+0x00 = *(VTT+0x10)
   *   0x1e1024  movq 0x18(%rsi),%rcx         ; rcx = VTT[+0x18]  (top-off)
   *   0x1e1028  movq -0x18(%rax),%rax        ; rax = *(vtable-0x18)  (offset)
   *   0x1e102c  movq %rcx,(%rdi,%rax)        ; *(this + rax) = rcx
   *                                             (Itanium: install a
   *                                              secondary vptr at the
   *                                              offset indicated by
   *                                              *(vtable-0x18).)
   *   0x1e1030  movq 0x8(%rsi),%rax          ; rax = VTT[+0x08]
   *   0x1e1034  movq %rax,(%rdi)             ; this->+0x00 = *(VTT+0x08)
   *   0x1e1037  movq 0x20(%rsi),%rcx         ; rcx = VTT[+0x20]
   *   0x1e103b  movq -0x18(%rax),%rax
   *   0x1e103f  movq %rcx,(%rdi,%rax)        ; same idiom
   *   0x1e1043  movq (%rsi),%rax             ; rax = VTT[0]
   *   0x1e1046  movq %rax,(%rdi)             ; this->+0x00 = *(VTT+0x00)
   *   0x1e1049  movq 0x28(%rsi),%rcx         ; rcx = VTT[+0x28]
   *   0x1e104d  movq -0x18(%rax),%rax
   *   0x1e1051  movq %rcx,(%rdi,%rax)        ; same idiom (third install)
   *   0x1e1055  movl %edx,%edi
   *   0x1e1057  callq __ZL19setUpFinishUniformsi   ; setUpFinishUniforms(index)
   *   0x1e105c..0x1e106e   finishUniforms[i<<4] -> this->+0x08
   *   0x1e1072  movq $0x0, 0x10(%rbx)        ; this->+0x10 = NULL
   *   0x1e107a  addq $0x18,%rbx              ; rbx = &this->+0x18
   *   0x1e107e  movq %rbx,%rdi
   *   0x1e1081..0x1e1085  epilogue then jmp __ZN13PCSharedCountC1Ev
   *                                             (TAIL-CALL — C2 has no
   *                                              retq of its own, and no
   *                                              landing pad either.)
   *
   * The three VTT-driven vptr installs (@0x1e101d..@0x1e1051) walk the
   * class's virtual-base vtable table. In JS we can't model raw memory
   * offsets from a `%rax - 0x18` load — the recovered *observable*
   * effect is: (1) `this->+0x00 = <primary vptr from VTT>`; and (2) at
   * two other offsets identified by the vtable's own top-offset words,
   * two secondary vptrs get installed. Since our JS model only exposes
   * the named fields (+0x00 and +0x28), we record the effect symbolically.
   */
  static construct_C2_baseSubobject(
    thisRef: ApplyGlossinessDown,
    vtt: {
      /** @Ozone C2 @0x1e101d — VTT[+0x10] loaded into this->+0x00. */
      slot_0x10: string;
      /** @Ozone C2 @0x1e1024 — VTT[+0x18] installed at
       *  `this + *(slot_0x10.vtable - 0x18)`. */
      slot_0x18: string;
      /** @Ozone C2 @0x1e1030 — VTT[+0x08] overwrites this->+0x00
       *  (second install; classic Itanium construction-vtable step). */
      slot_0x08: string;
      /** @Ozone C2 @0x1e1037 — VTT[+0x20] installed at
       *  `this + *(slot_0x08.vtable - 0x18)`. */
      slot_0x20: string;
      /** @Ozone C2 @0x1e1043 — VTT[+0x00] overwrites this->+0x00
       *  (third install; final primary vtable). */
      slot_0x00: string;
      /** @Ozone C2 @0x1e1049 — VTT[+0x28] installed at
       *  `this + *(slot_0x00.vtable - 0x18)`. */
      slot_0x28: string;
    },
    index: number,
  ): void {
    // @0x1e101d..@0x1e1051 — three-step VTT install (Itanium ABI base-in-
    // most-derived ctor). We record the FINAL primary vptr (VTT[0]) as
    // the observable effect on +0x00. The two secondary installs happen
    // at compiler-computed offsets (via *(vtable-0x18)) that this JS
    // model doesn't expose; we surface a decode gap for them.
    thisRef.vptr_at_0x00 = vtt.slot_0x00;
    // The two secondary vptr installs (at *(vtable[slot_0x10]-0x18) and
    // *(vtable[slot_0x08]-0x18)) are structurally observable but the
    // target offsets are DATA in the vtable header we haven't decoded.
    // Faithful behavior: throw so a reviewer sees the gap.
    void vtt.slot_0x18;
    void vtt.slot_0x20;
    void vtt.slot_0x28;
    throw new Error(
      "ApplyGlossinessDown::C2 base-subobject ctor: secondary vptr installs " +
        "at *(vtable-0x18)-computed offsets @Ozone 0x1e102c/@0x1e103f/@0x1e1051 " +
        "not yet transcribed (VTT walk requires decoded __ZTT19ApplyGlossinessDown)",
    );

    // (Unreachable in the current gap-throwing port; kept as a faithful
    //  control-flow record for reviewers.)
    // @0x1e1057 — setUpFinishUniforms(index).
    // setUpFinishUniforms_stub(index);
    // @0x1e105c..@0x1e106e — this->+0x08 = finishUniforms[index<<4].
    // thisRef.glossinessUniform_at_0x08 = finishUniforms_slot(index);
    // @0x1e1072 — this->+0x10 = NULL.
    // thisRef.prevOperator_at_0x10 = null;
    // @0x1e107a..@0x1e1085 — tail-jmp PCSharedCount() on &this->+0x18.
    // PCSharedCount_ctor_default_stub(thisRef.sharedCount_at_0x18);
  }

  /**
   * `ApplyGlossinessDown::eval(LayerContext const&, SurfaceProperties&)`
   * @Ozone 0x1e1110. Applies the "glossiness-down" adjustment kernel
   * against two adjacent SurfaceProperties channel triples at +0xe0 and
   * +0x100 — SAME channel triples as the Up variant, only the helper
   * differs.
   *
   * Structural summary (asm-mirrored — every branch preserved):
   *   1. Prologue: save stack-guard @0x1e1127..@0x1e1131, allocate 0x58
   *      of locals (@0x1e111d).
   *   2. If `this->+0x10` (prev operator) is non-null, call its
   *      `vptr[+0x10]` slot with `(prevOp, ctx, out)` @0x1e1135..@0x1e1144.
   *   3. Load `prev' = this->+0x08` (the glossiness uniform ptr); build a
   *      transient `VarT<Node>` wrapper on the stack (%rbp-0x70..-0x58)
   *      whose vptr is `__ZTVN8ProShade4VarTINS_4NodeEEE + 0x10`
   *      @0x1e1147..@0x1e115f.
   *   4. Default-construct a PCSharedCount on the stack (%rbp-0x58)
   *      @0x1e1163..@0x1e1167.
   *   5. If the transient VarT's `+0x10` (%rbp-0x60) is non-null
   *      (@0x1e1170..@0x1e1174), copy-construct a temp PCSharedCount
   *      from `glossinessUniform + 0x18` @0x1e1176..@0x1e1181, assign
   *      it into the stack VarT's sharedCount @0x1e1186..@0x1e118e,
   *      then destroy the temp @0x1e1193..@0x1e1197.
   *   6. Call adjustShininessDown(out=&stackTmp @-0x50(%rbp),
   *                                lhs=&out->+0xe0,
   *                                rhs=&stackVarT @-0x70(%rbp))
   *      @0x1e119c..@0x1e11ab. Computes the "glossiness-down" pair
   *      (node*, sharedCount) into stackTmp.
   *   7. Store `stackTmp+0x10` (@-0x40(%rbp)) into `out->+0xf0`
   *      @0x1e11b0..@0x1e11b4.
   *   8. Copy-construct PCSharedCount from stackTmp+0x18 (@-0x38(%rbp))
   *      into a temp @0x1e11bb..@0x1e11c6; assign into `out->+0xf8`
   *      @0x1e11cb..@0x1e11d6; destroy temp @0x1e11db..@0x1e11df.
   *   9. Reset stackTmp vptr @0x1e11e4, destroy stackTmp's shared count
   *      @0x1e11e8..@0x1e11f8.
   *  10. SECOND CHANNEL TRIPLE — repeat 3..9 but:
   *      - the stack VarT is rebuilt from `this->+0x08` @0x1e11fd
   *        (`movq 0x8(%r15), %r15`);
   *      - the adjustShininessDown lhs is `&out->+0x100` @0x1e1244;
   *      - stackTmp+0x10 stored to `out->+0x110` @0x1e125c;
   *      - stackTmp+0x18 assigned to `out->+0x118` @0x1e1273 / @0x1e1281.
   *      (@0x1e11fd..@0x1e12a7.)
   *  11. stack-guard check @0x1e12a7..@0x1e12c5, then retq.
   *
   * Effectively: for each of two adjacent SurfaceProperties channel
   * slots at +0xe0 and +0x100, replace the slot's VarT<Node> triple
   * (node+0x10, sharedCount+0x18) with `adjustShininessDown(slot,
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

    // @0x1e1135..@0x1e1144 — prev-op chain.
    if (this.prevOperator_at_0x10 !== null) {
      const prev = this.prevOperator_at_0x10;
      // @0x1e113e — load vptr; @0x1e1144 — callq *0x10(%rax).
      if (prev.vptr.slot_0x10 !== undefined) {
        prev.vptr.slot_0x10(prev, ctx, out);
      } else {
        // The asm doesn't null-check the SLOT, only the object. If the
        // slot is absent the branch would fault — surface as a loud
        // decode gap rather than silently no-op.
        throw new Error(
          "ApplyGlossinessDown::eval prev-op vtable +0x10 slot missing " +
            "(callq *0x10(%rax) @Ozone 0x1e1144)",
        );
      }
    }

    // @0x1e1147..@0x1e12a7 — the glossiness-down body is two paired
    // adjustShininessDown calls that mutate `out`'s adjacent channel
    // triples at +0xe0 and +0x100. Because adjustShininessDown is not
    // yet transcribed (stub at 0x1e13a0), running this method throws
    // loudly at the FIRST call — the correct decode-don't-guess
    // behavior. The full control-flow scaffold is written above so a
    // future decoder need only replace the stub.
    //
    // First channel triple: out->+0xe0 / +0xf0 / +0xf8.
    adjustShininessDown_stub(
      /* out = stack tmp VarT (%rbp-0x50)     */ null,
      /* lhs = &out->+0xe0                    */ null,
      /* rhs = stack VarT wrapping this->+0x08 */ null,
    );
    // (Unreachable in the current gap-throwing port; kept as a faithful
    //  control-flow record of the second call for reviewers.)
    // Second channel triple: out->+0x100 / +0x110 / +0x118.
    // adjustShininessDown_stub(null, null, null);
  }

  /**
   * `ApplyGlossinessDown::eval(LayerContext const&,
   *                            ProShade::VarT<ProShade::Node>&)`
   * @Ozone 0x1e1530. Single-channel variant of the multi-channel
   * SurfaceProperties overload: applies "glossiness-down" adjustment
   * to the incoming VarT<Node> in place.
   *
   * Structural summary (asm-mirrored):
   *   1. Prologue: save stack-guard @0x1e1545..@0x1e154f, allocate 0x50
   *      of locals (@0x1e153b).
   *   2. If `this->+0x10` (prev operator) is non-null, call its
   *      `vptr[+0x18]` slot with `(prevOp, ctx, out)` @0x1e1553..@0x1e1562.
   *      (Note: this overload uses +0x18, the OTHER overload uses +0x10 —
   *      two distinct virtual slots, same layout as Up's.)
   *   3. Load prev' = this->+0x08; build transient VarT on the stack
   *      (%rbp-0x68..-0x58) whose vptr is
   *      `__ZTVN8ProShade4VarTINS_4NodeEEE + 0x10` @0x1e1565..@0x1e157c.
   *   4. Default-construct PCSharedCount on the stack (%rbp-0x50)
   *      @0x1e1580..@0x1e1587.
   *   5. If VarT +0x10 is non-null (@0x1e158c..@0x1e1594), copy-construct
   *      temp PCSharedCount from `glossinessUniform + 0x18` and assign
   *      into stack PCSharedCount @0x1e1596..@0x1e15b6.
   *   6. Call adjustShininessDown(out=&stackTmp @-0x48(%rbp),
   *                                lhs=%r14 (the &out VarT<Node> arg),
   *                                rhs=&stackVarT @-0x68(%rbp))
   *      @0x1e15bb..@0x1e15c6.
   *   7. Store `stackTmp+0x10` (@-0x38(%rbp)) into `out->+0x10`
   *      @0x1e15cb..@0x1e15cf.
   *   8. Copy-construct PCSharedCount from stackTmp+0x18 (@-0x30(%rbp))
   *      into new temp @0x1e15d3..@0x1e15de; assign into `out->+0x18`
   *      (via `%r14 + 0x18`) @0x1e15e3..@0x1e15ee; destroy temp
   *      @0x1e15f3..@0x1e15f7.
   *   9. Reset stackTmp vptr @0x1e15fc, teardown counts, retq.
   *  10. stack-guard check @0x1e1614..@0x1e1630.
   *
   * Effectively: `out = adjustShininessDown(out, glossinessUniform)`.
   */
  eval_varTNode(
    ctx: LayerContext,
    out: ProShadeVarT<ProShadeNode>,
  ): void {
    void ctx;
    void out;

    // @0x1e1553..@0x1e1562 — prev-op chain, this overload uses +0x18.
    if (this.prevOperator_at_0x10 !== null) {
      const prev = this.prevOperator_at_0x10;
      if (prev.vptr.slot_0x18 !== undefined) {
        prev.vptr.slot_0x18(prev, ctx, out);
      } else {
        throw new Error(
          "ApplyGlossinessDown::eval prev-op vtable +0x18 slot missing " +
            "(callq *0x18(%rax) @Ozone 0x1e1562)",
        );
      }
    }

    // @0x1e1565..@0x1e15c6 — same "wrap this->+0x08 as a VarT<Node> and
    // call adjustShininessDown" pattern as the other overload, but only
    // once (for the single VarT<Node>& argument, not a two-channel
    // SurfaceProperties). adjustShininessDown is still stubbed out —
    // throws loudly.
    adjustShininessDown_stub(
      /* out = stack tmp VarT (%rbp-0x48)  */ null,
      /* lhs = the VarT<Node>& argument    */ null,
      /* rhs = stack VarT wrapping this->+0x08 */ null,
    );
  }

  /**
   * `ApplyGlossinessDown::writeHash(PCHashWriteStream&)` @Ozone 0x1e16b0.
   *
   * Full body (all @Ozone):
   *   0x1e16b0  frame prologue
   *   0x1e16ba  movq %rsi,%rbx ; movq %rdi,%r14   ; save stream, this
   *   0x1e16bd  callq __ZN23LiMaterialLayerOperator9writeHashER17PCHashWriteStream
   *                                              ; base's writeHash
   *   0x1e16c2  movq 0x10(%r14),%rdi              ; rdi = this->+0x10
   *   0x1e16c6  testq %rdi,%rdi
   *   0x1e16c9  je 0x1e16db                       ; if NULL -> epilogue
   *   0x1e16cb  movq (%rdi),%rax                  ; vtable
   *   0x1e16ce  movq 0x20(%rax),%rax              ; vtable[+0x20]
   *   0x1e16d2  movq %rbx,%rsi                    ; rsi = stream
   *   0x1e16d5..0x1e16d9 epilogue and jmpq *%rax  ; tail-call slot
   *   0x1e16db..0x1e16df epilogue and retq
   *
   * BYTE-FOR-BYTE identical to `ApplyGlossinessUp::writeHash` @0x1e0fe0 —
   * both writeHash bodies live under ICF-adjacent addresses and share
   * the exact same disassembly (same stub call, same offset accesses,
   * same tail-jmp shape). This is expected: writeHash doesn't touch the
   * feature-defining glossiness helper, so Up and Down emit identical
   * code.
   */
  writeHash(stream: unknown): void {
    // @0x1e16bd — LiMaterialLayerOperator::writeHash(this, stream).
    LiMaterialLayerOperator_writeHash_stub(this, stream);
    // @0x1e16c2..@0x1e16c9 — prev-op null-check.
    const prev = this.prevOperator_at_0x10;
    if (prev !== null) {
      // @0x1e16cb..@0x1e16d9 — tail-jmp to *(vptr[+0x20]) with
      // (%rdi=prev, %rsi=stream). The slot is a virtual writeHash on
      // the prev-op's own type; we don't have a decoded shape for it,
      // so surface it as a decode gap rather than skip.
      if (prev.vptr.slot_0x20 !== undefined) {
        prev.vptr.slot_0x20(prev, stream);
      } else {
        throw new Error(
          "ApplyGlossinessDown::writeHash prev-op vtable +0x20 slot missing " +
            "(jmpq *%rax after vtable[+0x20] load @Ozone 0x1e16d9)",
        );
      }
    }
    // @0x1e16db — retq.
  }

  /**
   * `ApplyGlossinessDown::~ApplyGlossinessDown()` D1 @Ozone 0x1e33a0
   * (__ZN19ApplyGlossinessDownD1Ev).
   *
   * Full body (all @Ozone):
   *   0x1e33a0  frame prologue
   *   0x1e33a6  movq %rdi,%rbx
   *   0x1e33a9  leaq 0x65ffe8(%rip),%rax
   *   0x1e33b0  movq %rax,(%rdi)                  ; reinstall +0x00 vptr
   *                                                 ; = &__ZTV19ApplyGlossinessDown+0x18 (0x843398)
   *   0x1e33b3  leaq 0x660026(%rip),%rax
   *   0x1e33ba  movq %rax,0x28(%rdi)              ; reinstall +0x28 vptr
   *                                                 ; = &__ZTV19ApplyGlossinessDown+0x60 (0x8433e0)
   *   0x1e33be  addq $0x18,%rdi                   ; rdi = &this->+0x18
   *   0x1e33c2  callq __ZN13PCSharedCountD1Ev     ; destroy shared count
   *   0x1e33c7  leaq __ZTV13PCShared_base(%rip),%rax
   *   0x1e33ce  addq $0x10,%rax
   *   0x1e33d2  movq %rax,0x28(%rbx)              ; +0x28 = PCShared_base vptr
   *   0x1e33d6  movq 0x30(%rbx),%rdi              ; rdi = this->+0x30
   *   0x1e33da  testq %rdi,%rdi
   *   0x1e33dd  je 0x1e33e4
   *   0x1e33df  callq __ZN18PC_Sp_counted_base12weak_releaseEv
   *   0x1e33e4  epilogue -> retq
   *   0x1e33eb  <landing pad>: ___clang_call_terminate
   *
   * Structural note: the +0x28 slot is written TWICE — first to Down's
   * own base-subobj construction slot (@0x1e33ba), then AFTER shared-count
   * teardown to `__ZTV13PCShared_base + 0x10` (@0x1e33d2). Both writes
   * are faithful.
   */
  destructor_D1(): void {
    // @0x1e33b0 — this->+0x00 = ApplyGlossinessDown vtable installed slot.
    this.vptr_at_0x00 = "__ZTV19ApplyGlossinessDown+0x18";
    // @0x1e33ba — this->+0x28 = ApplyGlossinessDown base-subobj slot.
    this.vptr_at_0x28 = "__ZTV19ApplyGlossinessDown+0x60";
    // @0x1e33be..@0x1e33c2 — destroy shared-count at +0x18.
    PCSharedCount_dtor_stub(this.sharedCount_at_0x18);
    // @0x1e33d2 — REWRITE this->+0x28 = PCShared_base vtable installed slot.
    this.vptr_at_0x28 = "__ZTV13PCShared_base+0x10";
    // @0x1e33d6..@0x1e33dd — null-check +0x30 and weak_release.
    const p = this.spCountedBaseBack_at_0x30;
    if (p !== null) {
      PC_Sp_counted_base_weak_release_stub(p);
    }
    // @0x1e33e4 — retq.
  }

  /**
   * `ApplyGlossinessDown::~ApplyGlossinessDown()` D0 @Ozone 0x1e3400
   * (__ZN19ApplyGlossinessDownD0Ev). Same body as D1 followed by
   * tail-jmp to `operator delete`.
   *
   * Full body (all @Ozone):
   *   0x1e3400  frame prologue
   *   0x1e3406  movq %rdi,%rbx
   *   0x1e3409..0x1e3432  same reinstall+PCSharedCount D1 sequence
   *                       (@0x1e3409 uses displacement 0x65ff88,
   *                        @0x1e3413 uses 0x65ffc6 — both resolve to
   *                        the same 0x843398 / 0x8433e0 targets as D1)
   *   0x1e3436..0x1e343d  null-check +0x30 & weak_release
   *                        (@0x1e343f `callq weak_release`)
   *   0x1e3444..0x1e344b  movq %rbx,%rdi ; epilogue
   *   0x1e344d  jmp __ZdlPv                       ; tail-call operator delete
   *   0x1e3452  <landing pad>: ___clang_call_terminate
   */
  destructor_D0(): void {
    // Mirror the D1 body verbatim.
    this.destructor_D1();
    // @0x1e344d — tail-jmp to operator delete(this).
    operator_delete_noop(this);
  }
}
