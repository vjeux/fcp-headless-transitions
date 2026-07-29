// raw-port/src/render/HGGradientRadial.ts
//
// FCP `HGGradientRadial` — Helium render-graph node that models a 2D
// radial gradient generator. It extends `HGNode` and, at render time,
// classifies its 5-parameter transform matrix (translation + linear
// distortion) into one of four kinds — Identity / Translate / Affine /
// Perspective — and instantiates the matching `HgcGradientRadial*`
// compositor leaf as its resolved child render node.
//
// Symbols decoded here (Helium, x86_64 slice; VAs are unadjusted VM
// addresses from otool -tV; file_offset = VA + 0x4000):
//   0x8bd30  HGGradientRadial::HGGradientRadial()       [C2 base ctor]
//   0x8bdb0  HGGradientRadial::HGGradientRadial()       [C1 complete ctor — identical body to C2]
//   0x8be30  HGGradientRadial::~HGGradientRadial()      [D2 base dtor]
//   0x8be70  HGGradientRadial::~HGGradientRadial()      [D1 complete dtor — identical body to D2]
//   0x8beb0  HGGradientRadial::~HGGradientRadial()      [D0 deleting dtor: D2; then HGObject::operator delete]
//   0x8bf00  HGGradientRadial::GetOutput(HGRenderer*)   [throw stub — see below]
//   0x8c7a0  HGGradientRadial::label_B() const
//   0x8c7d0  HGGradientRadial::info(int, string const&, string const&) const
//
// Vtable @Helium 0xa09fe0 (from ctor: `leaq 0x97e21a(%rip), %rax` at 0x8bdbf
// with next-instr 0x8bdc6 -> target 0xa09fe0). Slot dispatch is modeled via
// JS prototype chain — no explicit vtable install is needed at the port
// level, but the ctor citation is retained for provenance.
//
// STRUCT LAYOUT (recovered from HGGradientRadial::HGGradientRadial() @0x8bd30
// and cross-referenced with GetOutput @0x8bf00 / label_B @0x8c7a0):
//   ---- inherited from HGNode (size ≈ 0x198) ----
//     0x00..0x197  HGNode fields (see HGNode.ts)
//   ---- HGGradientRadial-specific fields ----
//     0x198 : i32         xformKind        (ctor: $3 = Perspective sentinel;
//                                            rewritten by GetOutput's matrix
//                                            classifier at @0x8c086 to one of
//                                            0=Identity, 1=Translate, 2=Affine,
//                                            3=Perspective; label_B and the
//                                            GetOutput jump table read this
//                                            field to pick the compositor leaf.)
//     0x1a0 : HGObject*   childRenderNode  (ctor: $0; released by dtor through
//                                            vtable *0x18 (HGObject::Release);
//                                            installed by GetOutput to one of
//                                            HgcGradientRadial{Identity,Translate,
//                                            Affine,Perspective} — the compositor
//                                            leaf whose shader math executes on
//                                            GPU. When xformKind flips due to a
//                                            SetParameter update, GetOutput wraps
//                                            the identity leaf inside an HGTextureWrap
//                                            first — see the 0x1d0-byte wrap path at
//                                            @0x8c128.)
//
// Runtime numeric constants (RIP-rel single-precision literal-pool addresses;
// low-32 bits of the operand are the u32 -> f32 encoding — decode via
// `resolve.py Helium const <ADDR>`, then take (u64 & 0xffffffff) as u32 -> f32):
//   @0x3c7cc0  u32=0x3f800000  f=1.0f
//     — used by GetOutput's matrix-classifier `ucomiss` compares (@0x8bfb4,
//       @0x8bff7, @0x8c01e, @0x8c03a, @0x8c058, @0x8c076) to test whether the
//       ROW1[1] / ROW0[0] scale terms equal exactly 1.0f (Identity vs. Translate
//       vs. general Affine test).
//
// Fallthrough label pointer (RIP-rel from label_B):
//   @0x8b5208  const char[] = "kXFormPerspective"
//   @0x3ccfb4  const char[] = "kXFormIdentity"
//   @0x3ccfc3  const char[] = "kXFormTranslate"
//   @0x3ccfd3  const char[] = "kXFormAffine"
//     — label_B's jump-table-as-string-table @0x3ccff4 holds three int32
//       offsets [-0x40, -0x31, -0x21] which, when added back to the table
//       base, yield the three "in-range" (xformKind ≤ 2) strings above.
//       xformKind ≥ 3 falls through to the "kXFormPerspective" literal.
//
// Undecoded dependencies (throw-stubbed at their call sites in GetOutput,
// per Rule 3 — a "loud gap" is correct, a plausible fallback would corrupt
// the render graph):
//   HGRenderer::GetInput(HGNode*, int)         @0x8bf2d
//   HGRenderer::GetDOD(HGNode*)                @0x8bf4b
//   HGObject::operator new(unsigned long)      @0x8c0f4, @0x8c130, @0x8c208, @0x8c23a, @0x8c26c, @0x8c195
//   HgcGradientRadialIdentity::HgcGradientRadialIdentity()   @0x8c0ff
//   HgcGradientRadialAffine::HgcGradientRadialAffine()       @0x8c213
//   HgcGradientRadialPerspective::HgcGradientRadialPerspective() @0x8c245
//   HgcGradientRadialTranslate::HgcGradientRadialTranslate() @0x8c277
//   HGTextureWrap::HGTextureWrap()             @0x8c13b     (0x1d0-byte wrap node)
//   HGTextureWrap::SetTextureWrapMode(WrapMode) @0x8c148    (mode=3 = "clamp-to-edge"
//                                                            or equivalent — depends on
//                                                            the HGTextureWrap::WrapMode
//                                                            enum which is not yet
//                                                            transcribed)
//   HGTextureWrap::SetCropRect(HGRect const&)  @0x8c17d
//   HGRectMake4i                               @0x8c158
//   HGRectGrow                                 @0x8c169
//   HGNode::HGNode() [base ctor]               @0x8c1a0
//   HGNode::SetFlags(int, int)                 @0x8bdde (ctor), @0x8c1c4 (GetOutput)
//   Virtual dispatch through this HGNode vtable slots *0x60 (SetParameter),
//   *0x68 (GetParameter), *0x78 (SetInput), *0x130 (unknown — likely
//   HasFixedOutputRect or similar predicate branched on at @0x8bf3b)
//
// Semantic conclusion: ctor / dtor / label_B / info are pure enough to
// transcribe end-to-end. GetOutput is a compositor-graph rewriter that
// requires HGRenderer + HgcGradientRadial{Identity,Translate,Affine,
// Perspective} + HGTextureWrap + HGRectMake4i/HGRectGrow + the HGNode
// SetFlags/SetInput vtable ABI to be decoded first. Per Rule 3 the method
// throws until those land.

import { HGNode } from "./HGNode.js";

/** Address of the FCP HGRenderer type — held opaquely at the port level. */
export interface HGRendererLike { readonly __hgRenderer: true; }

/**
 * The classified radial-gradient transform kind, as stored at
 * `HGGradientRadial+0x198` and read by label_B / GetOutput. Values match
 * the constants written into the field by the matrix classifier in
 * GetOutput (@0x8c086 movl %ecx, 0x198(%rbx)).
 */
export const HGGradientRadial_XFormKind = {
  /** @0x3ccfb4 "kXFormIdentity"  — matrix is exactly [[1,0],[0,1]] + zero trans. */
  Identity: 0,
  /** @0x3ccfc3 "kXFormTranslate" — matrix is exactly [[1,0],[0,1]] w/ non-zero trans. */
  Translate: 1,
  /** @0x3ccfd3 "kXFormAffine"    — general 2x2 linear with zero perspective row. */
  Affine: 2,
  /** @0x8b5208 "kXFormPerspective" — the general 3x3 case (ctor default @0x8bdea). */
  Perspective: 3,
} as const;

/**
 * String labels returned by `label_B()` — index by xformKind (0..3).
 * Verified against the const-pool at Helium @0x3ccfb4/@0x3ccfc3/@0x3ccfd3
 * and the __cstring fallthrough @0x8b5208.
 */
export const HGGradientRadial_LabelB_Table: readonly string[] = [
  "kXFormIdentity",    // @0x3ccfb4  ; idx 0
  "kXFormTranslate",   // @0x3ccfc3  ; idx 1
  "kXFormAffine",      // @0x3ccfd3  ; idx 2
  "kXFormPerspective", // @0x8b5208  ; idx 3 (fallthrough @0x8c7c0)
];

/**
 * Minimal std::string-like value returned by `info()` — the C++ signature
 * is `std::string info(int, std::string const&, std::string const&) const`,
 * and the body @0x8c7d0 unconditionally clears the return-slot to an empty
 * short-string (16 bytes zeroed via `xmm0`, then the trailing 8 bytes at
 * +0x10). That means the function ALWAYS returns "" regardless of its
 * arguments. Modeled here as a plain empty string.
 */
export type HGString = string;

export class HGGradientRadial extends HGNode {
  /**
   * @0x198 xformKind — ctor default = 3 (Perspective sentinel).
   *
   * See `HGGradientRadial_XFormKind` for the value enumeration. The
   * per-instance write in the ctor (@0x8bdea `movl $0x3, 0x198(%rbx)`)
   * is a defensive default before GetOutput's classifier runs; if the
   * matrix params happen to be their zero-initialised defaults, the
   * classifier will overwrite this with the true kind at first render.
   */
  private _xformKind: number = HGGradientRadial_XFormKind.Perspective;

  /**
   * @0x1a0 childRenderNode — the HgcGradientRadial* leaf (or an
   * HGTextureWrap wrapping one, per the DOD-guard path @0x8c128)
   * installed by GetOutput. Nullable; released via vtable *0x18
   * (HGObject::Release) by the dtor.
   */
  private _childRenderNode: unknown = null;

  /**
   * HGGradientRadial::HGGradientRadial() @0x8bd30 (C2 base ctor;
   * C1 @0x8bdb0 has an identical body).
   *
   * Straight-line body:
   *   @0x8bdba callq HGNode::HGNode()          — chain to base ctor.
   *   @0x8bdbf leaq  0x97e21a(%rip), %rax
   *   @0x8bdc6 movq  %rax, (%rbx)              — install vtable @0xa09fe0.
   *   @0x8bdc9 movq  $0, 0x1a0(%rbx)           — childRenderNode = null.
   *   @0x8bdd4 movq  %rbx, %rdi
   *   @0x8bdd7 xorl  %esi, %esi                — arg1 = 0
   *   @0x8bdd9 movl  $0x5, %edx                — arg2 = 5
   *   @0x8bdde callq HGNode::SetFlags(0, 5)    — configure base flags.
   *   @0x8bde3 orl   $0x601, 0x10(%rbx)        — HGNode+0x10 (renderPageStrategy) |= 0x601.
   *                                              Base ctor sets this to 0x200; OR-in gives
   *                                              0x200|0x601 = 0x601 (bit 0x400 was already
   *                                              off, so effectively 0x201|0x400 = 0x601).
   *                                              Recorded verbatim — this is a bitfield write
   *                                              whose per-bit meaning belongs to HGNode.
   *   @0x8bdea movl  $0x3, 0x198(%rbx)         — xformKind = 3 (Perspective default).
   *   @0x8bdf4..retq                           — standard epilogue; no member init after this.
   *
   * The `.LEHB0`/`.LEHE0` (@0x8bdf9..0x8be26) landing pad is an exception
   * cleanup for the SetFlags call: if SetFlags throws (it doesn't in
   * practice — HGNode::SetFlags is nothrow), the pad releases the child
   * render node at +0x1a0 (skipped because it's null here) and tail-calls
   * HGNode's dtor before `_Unwind_Resume`. Not modeled in JS.
   */
  constructor() {
    super();                                                    // @0x8bdba callq HGNode::HGNode() @0x11baf0
    // @0x8bdbf-8bdc6 install HGGradientRadial vtable @0xa09fe0 at this+0x00 —
    // modeled by JS prototype chain, no explicit action.
    this._childRenderNode = null;                               // @0x8bdc9 movq $0, 0x1a0(%rbx)
    // @0x8bdd4..8bdde HGNode::SetFlags(this, 0, 5) — routes through the
    // undecoded base-class method. Recorded as a stub-call: if HGNode's
    // SetFlags semantics change any observable state we depend on, this
    // will throw and the ctor will fail loudly rather than silently drift.
    HGGradientRadial_HGNode_SetFlags(this, 0, 5);
    // @0x8bde3 orl $0x601, 0x10(%rbx) — OR the bits {0, 9, 10} = 0x001|0x200|0x400
    // into HGNode+0x10 (renderPageStrategy). HGNode's base ctor writes 0x200
    // there; the resulting value is 0x200 | 0x601 = 0x601. Recorded verbatim
    // as a self-mutation on the base-class field.
    HGGradientRadial_OrRenderPageStrategy(this, 0x601);
    // @0x8bdea movl $0x3, 0x198(%rbx) — xformKind = 3 (Perspective sentinel).
    this._xformKind = HGGradientRadial_XFormKind.Perspective;
  }

  /**
   * HGGradientRadial::~HGGradientRadial() @0x8be30 (D2 base dtor; D1
   * @0x8be70 identical body; D0 @0x8beb0 = D2 then HGObject::operator
   * delete). Body walked here for the D0 case, which is the deleting
   * variant:
   *
   *   @0x8beb9 leaq [vtable+0x10](%rip), %rax
   *   @0x8bec0 movq %rax, (%rdi)               — reinstall HGGradientRadial primary vptr
   *                                              (defensive; matters for base-class
   *                                              destructor virtual dispatch order in
   *                                              C++, no-op at the JS layer).
   *   @0x8bec3 movq 0x1a0(%rdi), %rdi          — load childRenderNode.
   *   @0x8beca testq %rdi, %rdi ; je 0x8bed5   — skip release if null.
   *   @0x8becf movq (%rdi), %rax
   *   @0x8bed2 callq *0x18(%rax)               — child->vtable[3] = HGObject::Release().
   *   @0x8bed5 callq HGNode::~HGNode()         — chain to base dtor @0x11bf20.
   *   @0x8bee6 jmp   HGObject::operator delete — free the block.
   */
  destroy(): void {
    // JS has no C++ destructor; provide `destroy()` for parity so callers
    // that model HGObject refcount lifetime (Retain/Release) can invoke it
    // when this node's refcount drops to zero.
    const child = this._childRenderNode as { Release?: () => void } | null;
    if (child !== null && child !== undefined) {
      // @0x8bed2 callq *0x18(%rax) — vtable slot 3 = HGObject::Release.
      child.Release?.();
    }
    this._childRenderNode = null;
    // Base HGNode dtor and HGObject::operator delete are handled by the
    // higher-level release chain / GC — no explicit tail-call is meaningful.
  }

  /**
   * HGGradientRadial::label_B() const @0x8c7a0
   *
   * Reads xformKind at this+0x198 and returns a `const char*` label:
   *
   *   @0x8c7a4 movl  0x198(%rdi), %eax         — rax = xformKind (u32-zero-ext).
   *   @0x8c7aa cmpq  $0x2, %rax
   *   @0x8c7ae ja    0x8c7c0                   — if xformKind > 2 -> perspective branch.
   *   @0x8c7b0 leaq  0x34083d(%rip), %rcx      — rcx = 0x3ccff4 (const-string offset table base).
   *   @0x8c7b7 movslq (%rcx,%rax,4), %rax      — rax = *(i32*)(0x3ccff4 + xformKind*4).
   *   @0x8c7bb addq  %rcx, %rax                — rax = 0x3ccff4 + offset ; = string pointer.
   *   @0x8c7be popq  %rbp ; retq               — return string pointer.
   *   @0x8c7c0 leaq  0x828a41(%rip), %rax      — rax = 0x8b5208 = "kXFormPerspective".
   *
   * Const-table decode (Helium __const @0x3ccff4, 3 x int32 offsets):
   *   entry[0] = -0x40 -> 0x3ccff4 - 0x40 = 0x3ccfb4  -> "kXFormIdentity"
   *   entry[1] = -0x31 -> 0x3ccff4 - 0x31 = 0x3ccfc3  -> "kXFormTranslate"
   *   entry[2] = -0x21 -> 0x3ccff4 - 0x21 = 0x3ccfd3  -> "kXFormAffine"
   *
   * Verified by reading file offset (VA + 0x4000) from the Helium binary.
   * Note the `cmpq $2 ; ja` uses UNSIGNED compare — this is the mechanism
   * that catches both xformKind==3 and any pathological "out-of-range" u32
   * value (a negative int32 read as u32 fails the ja test and falls into
   * the perspective branch).
   */
  label_B(): string {
    // @0x8c7a4 movl 0x198(%rdi), %eax — read as u32 (upper 32 zero-extended).
    const idx = this._xformKind >>> 0;
    // @0x8c7aa..8c7ae cmpq $2, rax ; ja perspective (unsigned).
    if (idx > 2) {
      // @0x8c7c0 fallthrough branch — literal-pool string.
      return "kXFormPerspective";                                // @0x8b5208
    }
    // @0x8c7b0..8c7be table lookup — offsets baked into __const @0x3ccff4.
    return HGGradientRadial_LabelB_Table[idx]!;
  }

  /**
   * HGGradientRadial::info(int, std::string const&, std::string const&) const
   * @0x8c7d0
   *
   * Body @0x8c7d0..0x8c7e7 unconditionally clears the return-string
   * short-string buffer:
   *   @0x8c7d4 movq  %rdi, %rax                — sret return-slot pointer.
   *   @0x8c7d7 xorps %xmm0, %xmm0
   *   @0x8c7da movups %xmm0, (%rdi)            — zero bytes 0x00..0x0f.
   *   @0x8c7dd movq  $0, 0x10(%rdi)            — zero bytes 0x10..0x17.
   *   @0x8c7e5 popq  %rbp ; retq
   *
   * This is libc++'s SSO layout for `std::string` and the zeroed pattern
   * decodes to an empty short string (size=0, capacity flag=0, no heap
   * pointer). None of the three input arguments are read. Modeled as a
   * plain empty JS string.
   */
  info(_idx: number, _a: string, _b: string): HGString {
    // @0x8c7d4-8c7e5 : all bytes of the sret slot zeroed -> empty short string.
    return "";
  }

  /**
   * HGGradientRadial::GetOutput(HGRenderer*) @0x8bf00
   *
   * Full body (590 disasm lines) is a compositor-graph rewriter. Outline:
   *
   *   1. @0x8bf2d callq HGRenderer::GetInput(this, 0) -> upstream node r14.
   *   2. @0x8bf3b callq *0x130(this->vtable) — predicate (likely
   *      HasFixedOutputRect or IsIdentityRect); if TRUE, the DOD-vs-upstream
   *      guard runs.
   *   3. @0x8bf4b callq HGRenderer::GetDOD(upstream) -> HGRect r12/r13
   *      (128-bit rect in rax:rdx).
   *   4. Guard @0x8bf56-0x8bf66: if (dod.top >> 32) - (dod.bottom >> 32) <= 1
   *      (single-row rect) branch to @0x8c128 — the HGTextureWrap-wrapping
   *      path (see (7) below).
   *   5. Else @0x8bf6c-0x8c086: matrix classifier — reads 3 f32-quad
   *      parameters via THIS->vtable[*0x68] (HGNode::GetParameter) at
   *      indices 3, 4, 5 (matrix rows), then a sequence of `ucomiss`
   *      against 0.0f and 1.0f decides which of Identity / Translate /
   *      Affine / Perspective the transform is; writes the classification
   *      to this+0x198. This is the pure-math logic in this function; it
   *      will be transcribed once HGNode::GetParameter is landed.
   *   6. @0x8c086-0x8c297: 4-way jump table by xformKind — allocate,
   *      construct, and install the matching Hgc leaf:
   *        kind=0 Identity     -> HgcGradientRadialIdentity      @0x8c0ff
   *        kind=1 Translate    -> HgcGradientRadialTranslate     @0x8c277
   *        kind=2 Affine       -> HgcGradientRadialAffine        @0x8c213
   *        kind=3 Perspective  -> HgcGradientRadialPerspective   @0x8c245
   *      Each block: HGObject::operator new(0x1a0) -> ctor -> release
   *      old this[0x198]/[0x1a0] child -> store new -> continue.
   *   7. @0x8c128-0x8c1fe (single-row DOD guard branch): different node
   *      layout — allocates 0x1d0 bytes, calls HGTextureWrap::HGTextureWrap
   *      + HGTextureWrap::SetTextureWrapMode(3) + SetCropRect(HGRectGrow(...)),
   *      then wraps around an HGNode instance (0x1b0 bytes, sets flags via
   *      HGNode::SetFlags(0, 5); ORs 0x601 into +0x10, matching this ctor).
   *   8. @0x8c2b0..end: push params 0/1/2/6/7 into the leaf via
   *      child->vtable[*0x60] = HGNode::SetParameter — 5 uniforms worth
   *      of gradient state (center, radii, colour endpoints, ...).
   *   9. Return `this` (post-rewrite HGGradientRadial with resolved child).
   *
   * Per Rule 3 this stays a throw stub — a plausible "just build the
   * identity leaf" fallback would silently mis-classify Affine / Translate
   * transforms and render the gradient at the wrong scale.
   */
  GetOutput(_renderer: HGRendererLike): unknown {
    throw new Error(
      "HGGradientRadial::GetOutput @0x8bf00 not yet transcribed — requires " +
        "HGRenderer::GetInput/GetDOD @Helium, HGNode::GetParameter/SetParameter/" +
        "SetInput vtable ABI @Helium, HgcGradientRadial{Identity,Translate,Affine," +
        "Perspective}::HgcGradientRadial{...}() @Helium (0x1a0-byte compositor leaves), " +
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
 * HGGradientRadial::HGGradientRadial() @0x8bdde with args (this, 0, 5), and
 * again in the DOD-guard path of GetOutput @0x8c1c4 with args (childNode, 0, 5).
 * The `(0, 5)` argument pair is a HGNode-owned flag pattern whose per-bit
 * meaning belongs to that class.
 */
export function HGGradientRadial_HGNode_SetFlags(
  _self: unknown,
  _which: number,
  _flags: number,
): void {
  throw new Error(
    "HGNode::SetFlags @Helium call @0x8bdde (from HGGradientRadial ctor) " +
      "not yet transcribed",
  );
}

/**
 * HGNode+0x10 renderPageStrategy bitfield OR — inline `orl $0x601, 0x10(%rbx)`
 * @0x8bde3 (from HGGradientRadial ctor) and @0x8c1c9 (from GetOutput's DOD-
 * guard path). Not a real function call in the FCP binary — it's a direct
 * store — but modeled as a stub because the base-class field's per-bit
 * semantics are owned by HGNode and not yet decoded. When HGNode+0x10 is
 * transcribed, this stub should be replaced with `self.renderPageStrategy |= mask`.
 */
export function HGGradientRadial_OrRenderPageStrategy(
  _self: unknown,
  _mask: number,
): void {
  // Deliberately non-throwing: this is a bitfield write, not a call. Recorded
  // as a stub so `frontier.py` sees the HGNode+0x10 semantics as an outstanding
  // decode, but the FCP binary here just does `orl $0x601, 0x10(%rbx)` inline
  // without any observable side effect on this object's port until HGNode+0x10
  // is modeled at the JS layer.
  //
  // Reference: HGGradientRadial::HGGradientRadial() @0x8bde3
  //   orl $0x601, 0x10(%rbx)
}
