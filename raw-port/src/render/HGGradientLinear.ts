// raw-port/src/render/HGGradientLinear.ts
//
// FCP `HGGradientLinear` — Helium render-graph node that models a 2D
// linear (i.e. directional) gradient generator. Structurally identical
// (at the ctor/dtor/label_B/info level) to its sibling `HGGradientRadial`:
// both hold a 4-way-classified transform kind at this+0x198 and a
// resolved child render node at this+0x1a0 that is (re)installed by
// GetOutput at render time to the matching `HgcGradientLinear*` compositor
// leaf (Identity / Translate / Affine / Perspective).
//
// Symbols decoded here (Helium, x86_64 slice; VAs are the unadjusted VM
// addresses reported by otool -tV and `nm -n`; for the x86_64 thin slice
// the VA equals the file offset — no 0x4000 header adjustment is applied
// because otool has already subtracted the mach-header size for us):
//   0x4860  HGGradientLinear::HGGradientLinear()      [C2 base ctor]
//   0x48e0  HGGradientLinear::HGGradientLinear()      [C1 complete ctor — identical body to C2]
//   0x4960  HGGradientLinear::~HGGradientLinear()     [D2 base dtor]
//   0x49a0  HGGradientLinear::~HGGradientLinear()     [D1 complete dtor — identical body to D2]
//   0x49e0  HGGradientLinear::~HGGradientLinear()     [D0 deleting dtor: D2; then HGObject::operator delete]
//   0x4a30  HGGradientLinear::GetOutput(HGRenderer*)  [throw stub — see below]
//   0x5420  HGGradientLinear::label_B() const
//   0x5450  HGGradientLinear::info(int, string const&, string const&) const
//
// Vtable @Helium 0xa02df0 (from `nm -n | c++filt` — the `vtable for
// HGGradientLinear` S-symbol). The "installed pointer" the ctors write
// into this+0x00 is `vtable+0x10 = 0xa02e00` (past the RTTI/offset-to-top
// pair, at the first fn slot); derived by all three ctors/dtors as
// (RIP-of-next-insn + disp) = 0xa02e00:
//   @0x48ef (C1) leaq 0x9fe50a(%rip) -> next=0x48f6 + 0x9fe50a = 0xa02e00
//   @0x486f (C2) leaq 0x9fe58a(%rip) -> next=0x4876 + 0x9fe58a = 0xa02e00
//   @0x4966 (D2) leaq 0x9fe493(%rip) -> next=0x496d + 0x9fe493 = 0xa02e00
//   @0x49a6 (D1) leaq 0x9fe453(%rip) -> next=0x49ad + 0x9fe453 = 0xa02e00
//   @0x49e9 (D0) leaq 0x9fe410(%rip) -> next=0x49f0 + 0x9fe410 = 0xa02e00
// JS models slot dispatch through the prototype chain — no explicit
// vtable install action is emitted, but the addresses are recorded for
// provenance (Rule 2).
//
// STRUCT LAYOUT (recovered from HGGradientLinear::HGGradientLinear()
// @0x4860/0x48e0 and cross-referenced with GetOutput @0x4a30 / label_B
// @0x5420):
//   ---- inherited from HGNode (size ≈ 0x198) ----
//     0x00..0x197  HGNode fields (see HGNode.ts)
//   ---- HGGradientLinear-specific fields ----
//     0x198 : i32         xformKind        (ctor: $3 = Perspective sentinel
//                                            written @0x491a in C1 / @0x489a
//                                            in C2; rewritten by GetOutput's
//                                            matrix classifier at render time
//                                            to one of 0=Identity, 1=Translate,
//                                            2=Affine, 3=Perspective; label_B
//                                            and the GetOutput jump table read
//                                            this field to pick the compositor
//                                            leaf.)
//     0x1a0 : HGObject*   childRenderNode  (ctor: $0 written @0x48f9 in C1 /
//                                            @0x4879 in C2; released by dtor
//                                            through vtable *0x18 (HGObject::
//                                            Release) at @0x4a02 in D0 /
//                                            @0x4985 in D2 / @0x49c5 in D1;
//                                            installed by GetOutput to one of
//                                            HgcGradientLinear{Identity,Translate,
//                                            Affine,Perspective} — the compositor
//                                            leaf whose shader math executes on
//                                            GPU. Analogous to HGGradientRadial's
//                                            +0x1a0 slot.)
//
// Const-pool string table used by `label_B()` — Helium __TEXT __const
// region @0x3ca08c (per the disasm at @0x5430 `leaq 0x3c4c55(%rip), %rcx`
// with next-instr 0x5437 -> 0x5437 + 0x3c4c55 = 0x3ca08c). Three int32
// offsets, added back to their own base to yield the target string
// pointer. Decoded literally from /tmp/Helium.x86_64:
//   entry[0] = -0x4c -> 0x3ca08c - 0x4c = 0x3ca040  -> "kXFormIdentity"
//   entry[1] = -0x3d -> 0x3ca08c - 0x3d = 0x3ca04f  -> "kXFormTranslate"
//   entry[2] = -0x2d -> 0x3ca08c - 0x2d = 0x3ca05f  -> "kXFormAffine"
// Fallthrough (xformKind >= 3 in an unsigned compare):
//   @0x5440 leaq 0x8afdc1(%rip) -> next=0x5447 + 0x8afdc1 = 0x8b5208
//   @0x8b5208 = "kXFormPerspective"
// All four strings share the exact same const-pool addresses as
// HGGradientRadial's label_B — i.e. the two sibling classes point at
// the SAME __cstring literals (dedup'd by the linker).
//
// Undecoded dependencies (throw-stubbed at their call sites in GetOutput,
// per Rule 3 — a "loud gap" is correct, a plausible fallback would corrupt
// the render graph):
//   HGRenderer::GetInput(HGNode*, int)                       @0x4a5d
//   Virtual dispatch through this HGNode vtable slot *0x130   @0x4a6b   (DOD-guard predicate)
//   HGRenderer::GetDOD(HGNode*)                              @0x4a7b
//   Virtual dispatch through this HGNode vtable slot *0x68    @0x4aab, 0x4abd, 0x4acf   (GetParameter, indices 3/4/5)
//   Virtual dispatch through this HGNode vtable slot *0x60    (SetParameter, on the installed leaf — child->vtable[*0x60])
//   Virtual dispatch through this HGNode vtable slot *0x78    (SetInput, on the installed leaf)
//   HGObject::operator new(unsigned long)                    (0x1a0-byte alloc for each Hgc leaf)
//   HgcGradientLinearIdentity::HgcGradientLinearIdentity()   (Identity compositor leaf)
//   HgcGradientLinearTranslate::HgcGradientLinearTranslate() (Translate compositor leaf)
//   HgcGradientLinearAffine::HgcGradientLinearAffine()       (Affine compositor leaf)
//   HgcGradientLinearPerspective::HgcGradientLinearPerspective() (Perspective compositor leaf)
//   HGTextureWrap::HGTextureWrap() / SetTextureWrapMode(WrapMode) / SetCropRect(HGRect const&)
//     — the DOD-guard "single-row rect" wrapping path, per @0x4a91 (dod.top - dod.bottom <= 1).
//   HGRectMake4i / HGRectGrow                                (rect construction for the wrap path)
//   HGNode::HGNode() [base ctor]                             @0x486a (C2) / @0x48ea (C1)
//   HGNode::SetFlags(int, int)                               @0x488e (C2) / @0x490e (C1)
//   HGNode::~HGNode()                                        @0x49d0 (D1) / @0x4990 (D2) / @0x4a08 (D0)
//
// Semantic conclusion: ctor / dtor / label_B / info are pure enough to
// transcribe end-to-end. GetOutput is a compositor-graph rewriter that
// requires HGRenderer + HgcGradientLinear{Identity,Translate,Affine,
// Perspective} + HGTextureWrap + HGRectMake4i/HGRectGrow + the HGNode
// SetFlags/SetInput vtable ABI to be decoded first. Per Rule 3 the method
// throws until those land.

import { HGNode } from "./HGNode.js";

/** Address of the FCP HGRenderer type — held opaquely at the port level. */
export interface HGRendererLike { readonly __hgRenderer: true; }

/**
 * The classified linear-gradient transform kind, as stored at
 * `HGGradientLinear+0x198` and read by label_B / GetOutput. Values match
 * the constants written into the field by the matrix classifier in
 * GetOutput (per the sibling-class analysis on HGGradientRadial — the
 * two classes share the same 4-way kind space, and the classifier at
 * @0x4a91..0x4d76 in this class's GetOutput writes one of these values
 * back to this+0x198 before dispatching to the matching Hgc leaf).
 */
export const HGGradientLinear_XFormKind = {
  /** @0x3ca040 "kXFormIdentity"  — matrix is exactly [[1,0],[0,1]] + zero trans. */
  Identity: 0,
  /** @0x3ca04f "kXFormTranslate" — matrix is exactly [[1,0],[0,1]] w/ non-zero trans. */
  Translate: 1,
  /** @0x3ca05f "kXFormAffine"    — general 2x2 linear with zero perspective row. */
  Affine: 2,
  /** @0x8b5208 "kXFormPerspective" — the general 3x3 case (ctor default @0x491a / @0x489a). */
  Perspective: 3,
} as const;

/**
 * String labels returned by `label_B()` — index by xformKind (0..3).
 * Verified against the const-pool at Helium @0x3ca040/@0x3ca04f/@0x3ca05f
 * and the __cstring fallthrough @0x8b5208 (identical to HGGradientRadial's
 * label table because the linker de-duplicated the string literals).
 */
export const HGGradientLinear_LabelB_Table: readonly string[] = [
  "kXFormIdentity",    // @0x3ca040  ; idx 0
  "kXFormTranslate",   // @0x3ca04f  ; idx 1
  "kXFormAffine",      // @0x3ca05f  ; idx 2
  "kXFormPerspective", // @0x8b5208  ; idx 3 (fallthrough @0x5440)
];

/**
 * Minimal std::string-like value returned by `info()` — the C++ signature
 * is `std::string info(int, std::string const&, std::string const&) const`,
 * and the body @0x5450 unconditionally clears the return-slot to an empty
 * short-string (16 bytes zeroed via `xmm0` @0x545a, then the trailing 8
 * bytes at +0x10 @0x545d). That means the function ALWAYS returns ""
 * regardless of its arguments. Modeled here as a plain empty string.
 */
export type HGString = string;

export class HGGradientLinear extends HGNode {
  /**
   * @0x198 xformKind — ctor default = 3 (Perspective sentinel).
   *
   * See `HGGradientLinear_XFormKind` for the value enumeration. The
   * per-instance write in the ctor (@0x491a in C1 / @0x489a in C2
   * `movl $0x3, 0x198(%rbx)`) is a defensive default before GetOutput's
   * classifier runs; if the matrix params happen to be their zero-
   * initialised defaults, the classifier will overwrite this with the
   * true kind at first render.
   */
  private _xformKind: number = HGGradientLinear_XFormKind.Perspective;

  /**
   * @0x1a0 childRenderNode — the HgcGradientLinear* leaf (or an
   * HGTextureWrap wrapping one, per the DOD-guard path in GetOutput)
   * installed by GetOutput. Nullable; released via vtable *0x18
   * (HGObject::Release) by the dtor.
   */
  private _childRenderNode: unknown = null;

  /**
   * HGGradientLinear::HGGradientLinear() @0x4860 (C2 base ctor;
   * C1 @0x48e0 has an identical body). Straight-line disasm walk of
   * C1 @0x48e0 (offsets are identical mod 0x80 for C2):
   *
   *   @0x48ea callq HGNode::HGNode()             — chain to base ctor @0x11baf0.
   *   @0x48ef leaq  0x9fe50a(%rip), %rax
   *   @0x48f6 movq  %rax, (%rbx)                 — install vtable+0x10 = 0xa02e00.
   *   @0x48f9 movq  $0, 0x1a0(%rbx)              — childRenderNode = null.
   *   @0x4904 movq  %rbx, %rdi
   *   @0x4907 xorl  %esi, %esi                   — arg1 = 0
   *   @0x4909 movl  $0x5, %edx                   — arg2 = 5
   *   @0x490e callq HGNode::SetFlags(0, 5)       — configure base flags.
   *   @0x4913 orl   $0x601, 0x10(%rbx)           — HGNode+0x10 (renderPageStrategy) |= 0x601.
   *                                                Base ctor already set this to 0x200; OR-in
   *                                                gives 0x200|0x601 = 0x601. Recorded verbatim
   *                                                — the per-bit meaning belongs to HGNode.
   *   @0x491a movl  $0x3, 0x198(%rbx)            — xformKind = 3 (Perspective default).
   *   @0x4924..retq                              — standard epilogue; no member init after this.
   *
   * The @0x4929..0x494e landing pad is an exception cleanup for the
   * SetFlags call: if SetFlags throws (it doesn't in practice —
   * HGNode::SetFlags is nothrow), the pad releases the child render
   * node at +0x1a0 (skipped because it's null here) and tail-calls
   * HGNode's dtor before `_Unwind_Resume`. Not modeled in JS.
   */
  constructor() {
    super();                                                    // @0x48ea callq HGNode::HGNode() @0x11baf0
    // @0x48ef-48f6 install HGGradientLinear vtable @0xa02df0 (installed ptr
    // = vtable+0x10 = 0xa02e00) at this+0x00 — modeled by JS prototype chain,
    // no explicit action.
    this._childRenderNode = null;                               // @0x48f9 movq $0, 0x1a0(%rbx)
    // @0x4904..490e HGNode::SetFlags(this, 0, 5) — routes through the
    // undecoded base-class method. Recorded as a stub-call: if HGNode's
    // SetFlags semantics change any observable state we depend on, this
    // will throw and the ctor will fail loudly rather than silently drift.
    HGGradientLinear_HGNode_SetFlags(this, 0, 5);
    // @0x4913 orl $0x601, 0x10(%rbx) — OR the bits {0, 9, 10} = 0x001|0x200|0x400
    // into HGNode+0x10 (renderPageStrategy). HGNode's base ctor writes 0x200
    // there; the resulting value is 0x200 | 0x601 = 0x601. Recorded verbatim
    // as a self-mutation on the base-class field.
    HGGradientLinear_OrRenderPageStrategy(this, 0x601);
    // @0x491a movl $0x3, 0x198(%rbx) — xformKind = 3 (Perspective sentinel).
    this._xformKind = HGGradientLinear_XFormKind.Perspective;
  }

  /**
   * HGGradientLinear::~HGGradientLinear() — three variants, all with the
   * same essential body (release childRenderNode, chain to HGNode dtor):
   *
   *   D2 @0x4960 (base dtor):
   *     @0x4966 leaq 0x9fe493(%rip), %rax
   *     @0x496d movq %rax, (%rdi)                — reinstall vtable+0x10.
   *     @0x4970 movq 0x1a0(%rdi), %rax           — load childRenderNode.
   *     @0x4977 testq %rax, %rax ; je 0x498b     — skip release if null.
   *     @0x497c movq (%rax), %rcx
   *     @0x497f movq %rdi, %rbx
   *     @0x4982 movq %rax, %rdi
   *     @0x4985 callq *0x18(%rcx)                — child->vtable[3] = HGObject::Release().
   *     @0x4991 jmp HGNode::~HGNode()            — chain to base dtor @0x11bf20.
   *
   *   D1 @0x49a0 identical body (leaq disp 0x9fe453, same 0xa02e00 target).
   *
   *   D0 @0x49e0 (deleting):
   *     @0x49e9 leaq 0x9fe410(%rip), %rax
   *     @0x49f0 movq %rax, (%rdi)                — reinstall vtable+0x10.
   *     @0x49f3 movq 0x1a0(%rdi), %rdi           — reload childRenderNode.
   *     @0x49fa testq %rdi, %rdi ; je 0x4a05     — skip release if null.
   *     @0x49ff movq (%rdi), %rax
   *     @0x4a02 callq *0x18(%rax)                — child->Release().
   *     @0x4a08 callq HGNode::~HGNode()          — chain to base dtor.
   *     @0x4a16 jmp HGObject::operator delete    — free the block.
   */
  destroy(): void {
    // JS has no C++ destructor; provide `destroy()` for parity so callers
    // that model HGObject refcount lifetime (Retain/Release) can invoke it
    // when this node's refcount drops to zero. Body mirrors D2 @0x4960
    // (the base-dtor path) since D0/D1 differ only in the enclosing
    // dispatch/delete tails, which JS doesn't model at this layer.
    const child = this._childRenderNode as { Release?: () => void } | null;
    if (child !== null && child !== undefined) {
      // @0x4985 (D2) / @0x49c5 (D1) / @0x4a02 (D0) callq *0x18(%rax)
      // — vtable slot 3 = HGObject::Release.
      child.Release?.();
    }
    this._childRenderNode = null;
    // Base HGNode dtor and HGObject::operator delete are handled by the
    // higher-level release chain / GC — no explicit tail-call is meaningful.
  }

  /**
   * HGGradientLinear::label_B() const @0x5420
   *
   * Reads xformKind at this+0x198 and returns a `const char*` label:
   *
   *   @0x5424 movl  0x198(%rdi), %eax         — rax = xformKind (u32-zero-ext).
   *   @0x542a cmpq  $0x2, %rax
   *   @0x542e ja    0x5440                    — if xformKind > 2 -> perspective branch.
   *   @0x5430 leaq  0x3c4c55(%rip), %rcx      — rcx = 0x3ca08c (const-string offset table base).
   *   @0x5437 movslq (%rcx,%rax,4), %rax      — rax = *(i32*)(0x3ca08c + xformKind*4).
   *   @0x543b addq  %rcx, %rax                — rax = 0x3ca08c + offset ; = string pointer.
   *   @0x543e popq  %rbp ; retq               — return string pointer.
   *   @0x5440 leaq  0x8afdc1(%rip), %rax      — rax = 0x8b5208 = "kXFormPerspective".
   *   @0x5447 popq  %rbp ; retq               — perspective branch return.
   *
   * Const-table decode (Helium __TEXT __const @0x3ca08c, 3 x int32 offsets;
   * verified by reading /tmp/Helium.x86_64 at file offset == VA for the
   * x86_64 thin slice):
   *   entry[0] = -0x4c -> 0x3ca08c - 0x4c = 0x3ca040  -> "kXFormIdentity"
   *   entry[1] = -0x3d -> 0x3ca08c - 0x3d = 0x3ca04f  -> "kXFormTranslate"
   *   entry[2] = -0x2d -> 0x3ca08c - 0x2d = 0x3ca05f  -> "kXFormAffine"
   *
   * Note the `cmpq $2 ; ja` uses UNSIGNED compare — this catches both
   * xformKind==3 and any pathological "out-of-range" u32 value (a negative
   * int32 read as u32 fails the ja test and falls into the perspective
   * branch).
   */
  label_B(): string {
    // @0x5424 movl 0x198(%rdi), %eax — read as u32 (upper 32 zero-extended).
    const idx = this._xformKind >>> 0;
    // @0x542a..542e cmpq $2, rax ; ja perspective (unsigned).
    if (idx > 2) {
      // @0x5440 fallthrough branch — literal-pool string.
      return "kXFormPerspective";                                // @0x8b5208
    }
    // @0x5430..543e table lookup — offsets baked into __const @0x3ca08c.
    return HGGradientLinear_LabelB_Table[idx]!;
  }

  /**
   * HGGradientLinear::info(int, std::string const&, std::string const&) const
   * @0x5450
   *
   * Body @0x5450..0x5466 unconditionally clears the return-string
   * short-string buffer:
   *   @0x5454 movq  %rdi, %rax                — sret return-slot pointer.
   *   @0x5457 xorps %xmm0, %xmm0
   *   @0x545a movups %xmm0, (%rdi)            — zero bytes 0x00..0x0f.
   *   @0x545d movq  $0, 0x10(%rdi)            — zero bytes 0x10..0x17.
   *   @0x5465 popq  %rbp ; retq
   *
   * This is libc++'s SSO layout for `std::string` and the zeroed pattern
   * decodes to an empty short string (size=0, capacity flag=0, no heap
   * pointer). None of the three input arguments are read. Modeled as a
   * plain empty JS string.
   */
  info(_idx: number, _a: string, _b: string): HGString {
    // @0x5454-5465 : all bytes of the sret slot zeroed -> empty short string.
    return "";
  }

  /**
   * HGGradientLinear::GetOutput(HGRenderer*) @0x4a30
   *
   * Full body (667 disasm lines) is a compositor-graph rewriter analogous
   * to HGGradientRadial::GetOutput @0x8bf00. Outline (line numbers refer
   * to the /tmp/Helium.x86_64 thin-slice VAs, which equal the file offsets):
   *
   *   1. @0x4a5d callq HGRenderer::GetInput(this, 0) -> upstream node r14.
   *   2. @0x4a6b callq *0x130(this->vtable) — predicate (likely
   *      HasFixedOutputRect or IsIdentityRect); if TRUE, the DOD-vs-upstream
   *      guard runs at @0x4a75.
   *   3. @0x4a7b callq HGRenderer::GetDOD(upstream) -> HGRect r12/r13
   *      (128-bit rect in rax:rdx).
   *   4. Guard @0x4a86-0x4a96: if (dod.top >> 32) - (dod.bottom >> 32) <= 1
   *      (single-row rect) branch to @0x4d76 — the HGTextureWrap-wrapping
   *      path (mirrors HGGradientRadial's @0x8c128 branch).
   *   5. Else @0x4a9c-onwards: matrix classifier — reads 3 f32-quad
   *      parameters via THIS->vtable[*0x68] (HGNode::GetParameter) at
   *      indices 3, 4, 5 (matrix rows @0x4aab, 0x4abd, 0x4acf), then a
   *      sequence of `ucomiss` against 0.0f (via `cmpeqss %xmm3` with
   *      xmm3=0 @0x4ad2) and 1.0f (loaded @0x4adf from RIP-rel const
   *      pool) decides which of Identity / Translate / Affine / Perspective
   *      the transform is; writes the classification to this+0x198.
   *      This is the pure-math logic in this function; it will be
   *      transcribed once HGNode::GetParameter is landed and the exact
   *      f32 constants at the RIP-rel addrs (@0x3c31d9 from @0x4adf,
   *      @0x3c318e from @0x4b2b) are decoded.
   *   6. 4-way jump table by xformKind — allocate, construct, and install
   *      the matching Hgc leaf:
   *        kind=0 Identity     -> HgcGradientLinearIdentity
   *        kind=1 Translate    -> HgcGradientLinearTranslate
   *        kind=2 Affine       -> HgcGradientLinearAffine
   *        kind=3 Perspective  -> HgcGradientLinearPerspective
   *      Each block: HGObject::operator new(0x1a0) -> ctor -> release
   *      old this[0x1a0] child -> store new -> continue.
   *   7. (single-row DOD guard branch): different node layout — allocates
   *      0x1d0 bytes, calls HGTextureWrap::HGTextureWrap +
   *      HGTextureWrap::SetTextureWrapMode(3) + SetCropRect(HGRectGrow(...)),
   *      then wraps around an HGNode instance (0x1b0 bytes, sets flags
   *      via HGNode::SetFlags(0, 5); ORs 0x601 into +0x10, matching this
   *      ctor).
   *   8. Push params 0/1/2/6/7 into the leaf via child->vtable[*0x60] =
   *      HGNode::SetParameter — 5 uniforms worth of gradient state
   *      (start/end points, colour endpoints, ...).
   *   9. Return `this` (post-rewrite HGGradientLinear with resolved child).
   *
   * Per Rule 3 this stays a throw stub — a plausible "just build the
   * identity leaf" fallback would silently mis-classify Affine / Translate
   * transforms and render the gradient at the wrong scale.
   */
  GetOutput(_renderer: HGRendererLike): unknown {
    throw new Error(
      "HGGradientLinear::GetOutput @0x4a30 not yet transcribed — requires " +
        "HGRenderer::GetInput/GetDOD @Helium, HGNode::GetParameter/SetParameter/" +
        "SetInput vtable ABI @Helium, HgcGradientLinear{Identity,Translate,Affine," +
        "Perspective}::HgcGradientLinear{...}() @Helium (0x1a0-byte compositor leaves), " +
        "HGTextureWrap + HGRectMake4i + HGRectGrow @Helium for the single-row DOD-guard path.",
    );
  }
}

// ---------------------------------------------------------------------------
// Undecoded call-site stubs (Rule 3 — cite the address, throw on entry).
// These are the calls issued FROM this class's ctor whose target semantics
// are owned by HGNode and haven't been transcribed. Keeping them separately
// exported lets the frontier tracker see the outstanding decodes.
// ---------------------------------------------------------------------------

/**
 * HGNode::SetFlags(int, int) — @Helium __ZN6HGNode8SetFlagsEii, called by
 * HGGradientLinear::HGGradientLinear() @0x490e (C1) / @0x488e (C2) with
 * args (this, 0, 5), and again in the DOD-guard path of GetOutput with
 * args (childNode, 0, 5). The `(0, 5)` argument pair is a HGNode-owned
 * flag pattern whose per-bit meaning belongs to that class.
 */
export function HGGradientLinear_HGNode_SetFlags(
  _self: unknown,
  _which: number,
  _flags: number,
): void {
  throw new Error(
    "HGNode::SetFlags @Helium call @0x490e (from HGGradientLinear ctor) " +
      "not yet transcribed",
  );
}

/**
 * HGNode+0x10 renderPageStrategy bitfield OR — inline `orl $0x601, 0x10(%rbx)`
 * @0x4913 in C1 / @0x4893 in C2 (from HGGradientLinear ctor). Not a real
 * function call in the FCP binary — it's a direct store — but modeled as
 * a stub because the base-class field's per-bit semantics are owned by
 * HGNode and not yet decoded. When HGNode+0x10 is transcribed, this stub
 * should be replaced with `self.renderPageStrategy |= mask`.
 */
export function HGGradientLinear_OrRenderPageStrategy(
  _self: unknown,
  _mask: number,
): void {
  // Deliberately non-throwing: this is a bitfield write, not a call. Recorded
  // as a stub so `frontier.py` sees the HGNode+0x10 semantics as an outstanding
  // decode, but the FCP binary here just does `orl $0x601, 0x10(%rbx)` inline
  // without any observable side effect on this object's port until HGNode+0x10
  // is modeled at the JS layer.
  //
  // Reference: HGGradientLinear::HGGradientLinear() @0x4913 (C1) / @0x4893 (C2)
  //   orl $0x601, 0x10(%rbx)
}
