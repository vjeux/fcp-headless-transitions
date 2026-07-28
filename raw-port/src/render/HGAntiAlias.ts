// HGAntiAlias.ts — FCP Helium framework class (SMAA-style anti-aliasing render node).
//
// Transcribed from the x86_64 disassembly of Helium in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// See raw-port/re/disasm/Helium.HGAntiAlias.*.s.
//
// SYMBOLS (nm | c++filt):
//   0x210b70  T HGAntiAlias::HGAntiAlias(HGAntiAlias::ColorSpace)                    (C2)
//   0x210bb0  T HGAntiAlias::HGAntiAlias(HGAntiAlias::ColorSpace)                    (C1)
//   0x210bf0  T HGAntiAlias::~HGAntiAlias()                                          (D2)
//   0x210c30  T HGAntiAlias::~HGAntiAlias()                                          (D1)
//   0x210c70  T HGAntiAlias::~HGAntiAlias()                                          (D0)
//   0x210cc0  T HGAntiAlias::SetParameter(int, float, float, float, float)
//   0x210cf0  T HGAntiAlias::GetOutput(HGRenderer*)
//   0x3c49d0  T HGAntiAlias::GetOutput(HGRenderer*) (.cold.1)
//   0xa2ee80  S vtable for HGAntiAlias (installed-ptr @0xa2ee90)
//
// Vtable slots (via vtable.py Helium HGAntiAlias):
//   *0x00  D1 -> 0x210c30      (tail-jmp to D2 @0x210bf0)
//   *0x08  D0 -> 0x210c70      (deleting dtor)
//   *0x60  SetParameter(int,float,float,float,float) -> 0x210cc0
//   All other slots inherited from HGNode / HGObject.
//
// ── FIELD LAYOUT (extends HGNode) ─────────────────────────────────────────────
//   HGNode base occupies +0x00..+0x198 (see raw-port/src/render/HGNode.ts).
//   HGAntiAlias adds:
//     +0x198  renderInputNode : HGNode*         @Helium 0x210bcb (movq $0x0, 0x198(r14))
//                                                also written by GetOutput @0x210e3a,
//                                                @0x210eb3, @0x211042, @0x2110b5.
//     +0x1a0  threshold       : float           @Helium 0x210bd6
//                                                (movl $0x3d4ccccd, 0x1a0(r14) = 0.05f);
//                                                read by SetParameter @0x210ccc; written
//                                                by SetParameter @0x210cdb; read by
//                                                GetOutput @0x210e78.
//     +0x1a4  colorSpace      : int (enum ColorSpace)  @Helium 0x210be1
//                                                (movl %ebx, 0x1a4(r14); ebx = arg1);
//                                                read by GetOutput @0x210d45..0x210d52.
//   Total class size: 0x1a8 bytes (HGNode base 0x198 + own 0x10).
//
// ── PLUG-IN GRAPH SHAPE (GetOutput) ───────────────────────────────────────────
//   HGAntiAlias::GetOutput builds a 3-node SMAA (Enhanced Subpixel Morphological
//   Antialiasing) pipeline on top of an input node:
//     A) HGColorConform (allocated 0x370 bytes) — sRGB→linear conversion,
//        driven by SetConversion(linearIn, xferFn=8, matrix=0, ...) with
//        primaries/xfer/matrix chosen by 0x1a4 colorSpace flag.
//     B) HGNode (unnamed edge-detection LUT holder, 0x1a0 bytes) — receives a
//        heap-allocated 0x107-byte constants block (SMAA LUT+params) at +0x198.
//     C) HgcSMAAPatternSearch (0x1c0 bytes) — connects (input=colorConform,
//        input1=bitmapLoader(lutFactory[0]), input2=bitmapLoader(lutFactory[1])).
//     D) HgcSMAABlend (0x1a0 bytes) — final blend: input=input(colorConform),
//        input1=patternSearch. Stored into +0x198 of `this`.
//
//   The two LUT bitmaps come from a shared HGLUTCacheManager keyed on a
//   file-local `lutFactory` singleton (guard variable @0x210ec3 →
//   __ZGVZN11HGAntiAlias9GetOutputEP10HGRendererE10lutFactory) that creates two
//   HGAntiAliasLUTEntry variants (parameter 0 and 1) via
//   HGAntiAliasLUTEntryFactory (see raw-port/re/disasm/Helium.HGAntiAliasLUTEntry*.s).
//
//   ⚠ GetOutput calls into a large family of Helium classes that are NOT YET
//   ported (HGColorConform, HGRenderer, HGLUTCache, HGLUTCacheManager,
//   HGBitmapLoader, HgcSMAAPatternSearch, HgcSMAABlend). Per PORTING_SPEC
//   Rule 3, the port throws citing each undecoded callee's @0xADDR.
//
// @class Helium HGAntiAlias
// @provenance Helium @0x210b70 (C2), @0x210bb0 (C1), @0x210bf0 (D2),
//             @0x210c30 (D1), @0x210c70 (D0), @0x210cc0 (SetParameter),
//             @0x210cf0 (GetOutput), @0x3c49d0 (GetOutput.cold), @0xa2ee80 (vtable).

import { HGNode } from "./HGNode";

/**
 * HGAntiAlias::ColorSpace — enum arg to the ctor.
 *
 * The ctor stores the raw arg int at +0x1a4 and GetOutput compares it to 1:
 *
 *   0x210d45  cmpl $0x1, 0x1a4(rcx)
 *   0x210d4c  sete %al               ; a := (colorSpace == 1)
 *   0x210d4f  leal (rax,rax,2), %esi ;  esi := a * 3 = (0 or 3)     ; source primaries flag
 *   0x210d52  leal 0x1(,rax,2), %eax ;  eax := a * 2 + 1 = (1 or 3) ; dest primaries flag
 *
 * The observed enum encoding matches the HGColorGamma family (see the callq
 * to HGColorConform::SetConversion @0x210d6f): value 1 selects a "wide"/BT.709
 * mode (produces (esi,eax)=(3,3)); value 0 selects sRGB (produces (esi,eax)=(0,1)).
 * We keep the raw int so the port is bit-faithful to the (int)colorSpace path.
 *
 * @provenance Helium @0x210be1 (ctor store), @0x210d45..@0x210d52 (GetOutput read)
 */
export type HGAntiAliasColorSpace = number;

/**
 * HGColorConform — un-ported Helium class (@Helium 0x?????? — decoded only via
 * callees at 0x210d28 / 0x210d3c / 0x210d6f / 0x210e71). A throw-stub sits in
 * place until the class lands.
 *
 * @provenance Helium @0x210d28 (ctor callq), @0x210d6f (SetConversion callq)
 */
function hgColorConform_new_and_ctor(): unknown {
  throw new Error(
    "HGColorConform::HGColorConform() @Helium (callq @0x210d28 from HGAntiAlias::GetOutput) — not yet transcribed",
  );
}
function hgColorConform_setConversion(
  _self: unknown,
  _srcPrimaries: number,
  _srcXfer: number,
  _srcMatrix: number,
  _dstPrimaries: number,
  _dstXfer: number,
  _dstMatrix: number,
): void {
  throw new Error(
    "HGColorConform::SetConversion(...) @Helium (callq @0x210d6f from HGAntiAlias::GetOutput) — not yet transcribed",
  );
}

/**
 * HGRenderer::GetInput — not yet ported.
 *
 * @provenance Helium @0x210d10 (callq __ZN10HGRenderer8GetInputEP6HGNodei)
 */
function hgRenderer_getInput(_renderer: unknown, _node: HGNode, _slot: number): unknown {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) @Helium (callq @0x210d10 from HGAntiAlias::GetOutput) — not yet transcribed",
  );
}

/**
 * HGLUTCacheManager::getLUTCache / HGLUTCache::getNewLUT — un-ported.
 *
 * @provenance Helium @0x210f19 (callq __ZN17HGLUTCacheManager11getLUTCache…),
 *             @0x210f27 (callq __ZN10HGLUTCache9getNewLUTEPNS_7LUTInfoE),
 *             @0x210f36 (2nd callq getNewLUT)
 */
function hgLutCacheManager_getLUTCache(_mgr: unknown, _factory: unknown): unknown {
  throw new Error(
    "HGLUTCacheManager::getLUTCache(HGLUTCache::LUTEntryFactory*) @Helium (callq @0x210f19 from HGAntiAlias::GetOutput) — not yet transcribed",
  );
}
function hgLutCache_getNewLUT(_cache: unknown, _info: unknown): unknown {
  throw new Error(
    "HGLUTCache::getNewLUT(HGLUTCache::LUTInfo*) @Helium (callq @0x210f27/@0x210f36 from HGAntiAlias::GetOutput) — not yet transcribed",
  );
}

/**
 * HGBitmapLoader — un-ported.
 * @provenance Helium @0x210f6b (callq HGBitmapLoader::HGBitmapLoader(HGBitmap*))
 */
function hgBitmapLoader_new_and_ctor(_bitmap: unknown): unknown {
  throw new Error(
    "HGBitmapLoader::HGBitmapLoader(HGBitmap*) @Helium (callq @0x210f6b/@0x210f84 from HGAntiAlias::GetOutput) — not yet transcribed",
  );
}

/**
 * HgcSMAAPatternSearch — un-ported (SMAA blend-weight computation shader).
 * @provenance Helium @0x210f99 (callq HgcSMAAPatternSearch::HgcSMAAPatternSearch())
 */
function hgcSMAAPatternSearch_new_and_ctor(): unknown {
  throw new Error(
    "HgcSMAAPatternSearch::HgcSMAAPatternSearch() @Helium (callq @0x210f99 from HGAntiAlias::GetOutput) — not yet transcribed",
  );
}

/**
 * HgcSMAABlend — un-ported (SMAA final blend shader).
 * @provenance Helium @0x211063 (callq HgcSMAABlend::HgcSMAABlend())
 */
function hgcSMAABlend_new_and_ctor(): unknown {
  throw new Error(
    "HgcSMAABlend::HgcSMAABlend() @Helium (callq @0x211063 from HGAntiAlias::GetOutput) — not yet transcribed",
  );
}

/**
 * HGAntiAlias — Helium render node for SMAA-style anti-aliasing.
 *
 * A very thin data-holder subclass of HGNode: it exposes ONE tunable
 * (`threshold` at +0x1a0, default 0.05f), remembers the caller-selected
 * colour-space (@+0x1a4), and constructs the SMAA edge/pattern/blend
 * three-node pipeline lazily inside GetOutput().
 *
 * @provenance Helium @0x210b70 (C2), @0x210bb0 (C1), @0x210bf0 (D2),
 *             @0x210c30 (D1), @0x210c70 (D0), @0x210cc0 (SetParameter),
 *             @0x210cf0 (GetOutput), @0xa2ee80 (vtable).
 */
export class HGAntiAlias extends HGNode {
  /**
   * @+0x198 renderInputNode — HGNode* holding the currently-built SMAA
   * blend pipeline output (set by GetOutput). Zero-initialised by ctor.
   *
   * @provenance Helium @0x210bcb (ctor: `movq $0x0, 0x198(%r14)`)
   */
  renderInputNode_198: HGNode | null = null;

  /**
   * @+0x1a0 threshold — SMAA edge-detection threshold in linear-light units
   * (single-precision).
   *
   * Ctor initial value 0.05f encoded as `movl $0x3d4ccccd, 0x1a0(%r14)` @0x210bd6.
   *
   * SetParameter(idx=0, value, _, _, _):
   *   only updated when the caller-supplied `value` (xmm0) *differs* from the
   *   currently stored threshold (ucomiss compare @0x210cd4). This keeps the
   *   dirty flag semantics of FCP's parameter-set path (returns 1 iff changed).
   *
   * @provenance Helium @0x210bd6 (ctor init 0.05f), @0x210cc0 (SetParameter),
   *             @0x210e78 (GetOutput read)
   */
  threshold_1a0: number = Math.fround(0.05);

  /**
   * @+0x1a4 colorSpace — raw enum value passed to the ctor. Read by GetOutput
   * to pick the sRGB↔linear conversion primaries.
   *
   * @provenance Helium @0x210be1 (ctor: `movl %ebx, 0x1a4(%r14)`),
   *             @0x210d45 (GetOutput: `cmpl $0x1, 0x1a4(%rcx)`)
   */
  colorSpace_1a4: HGAntiAliasColorSpace = 0;

  /**
   * HGAntiAlias::HGAntiAlias(HGAntiAlias::ColorSpace) — C1 / C2 constructor.
   *
   * Helium @0x210bb0..@0x210bec (C1 body; C2 @0x210b70 is identical shape):
   *
   *     pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
   *     movl  %esi,%ebx           ; ebx = colorSpace arg (int, arg1)
   *     movq  %rdi,%r14           ; r14 = this
   *     callq HGNode::HGNode()    ; base ctor (fills 0x00..0x198)
   *     leaq  0x81e2c8(%rip),%rax ; rax = 0xa2ee90 (HGAntiAlias vtable ptr)
   *     movq  %rax,(%r14)         ; *this = HGAntiAlias vtable
   *     movq  $0x0,0x198(%r14)    ; renderInputNode_198 = nullptr
   *     movl  $0x3d4ccccd,0x1a0(%r14)  ; threshold_1a0 = 0.05f
   *     movl  %ebx,0x1a4(%r14)    ; colorSpace_1a4 = arg
   *     popq %rbx; popq %r14; popq %rbp; retq
   *
   * @provenance Helium @0x210bb0 (C1), @0x210b70 (C2)
   */
  constructor(colorSpace: HGAntiAliasColorSpace) {
    super();
    this.renderInputNode_198 = null;
    this.threshold_1a0 = Math.fround(0.05); // 0x3d4ccccd
    this.colorSpace_1a4 = colorSpace | 0;
  }

  /**
   * HGAntiAlias::~HGAntiAlias() — D1 complete-object dtor.
   *
   * Helium @0x210c30 body is a tail-jmp into D2 @0x210bf0:
   *   pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp __ZN11HGAntiAliasD2Ev
   *
   * D2 body @0x210bf0..@0x210c2f (identical shape to D0 without the delete):
   *   reinstalls HGAntiAlias vtable ptr; if renderInputNode_198 non-null,
   *   virtual-dispatch its *0x18 slot (Release/refcount-drop, inherited from
   *   HGObject::Release @0x1a0f30); then tail-call HGNode::~HGNode() @0x11bf20.
   *
   * @provenance Helium @0x210c30 (D1), @0x210bf0 (D2)
   */
  destroy(): void {
    // D2 body:
    //   0x210bfd  leaq 0x81e28c(%rip),%rax  ; = 0xa2ee90 (HGAntiAlias vtable)
    //   0x210c04  movq %rax,(%rdi)          ; *this = vtable
    if (this.renderInputNode_198 !== null) {
      // 0x210c07  movq 0x198(%rdi),%rdi
      // 0x210c0e  testq %rdi,%rdi
      // 0x210c11  je   +0x???              ; skip if null
      // 0x210c13  movq (%rdi),%rax          ; rax = vtbl of child
      // 0x210c16  callq *0x18(%rax)         ; virtual call — HGObject::Release()
      throw new Error(
        "HGAntiAlias::~HGAntiAlias() D2 @Helium 0x210bf0 — virtual dispatch " +
        "*0x18 (HGObject::Release @Helium 0x1a0f30) on renderInputNode_198 " +
        "requires the port's vtable/Release scaffolding which is not yet " +
        "wired for the raw-port harness.",
      );
    }
    // 0x210c1c  callq HGNode::~HGNode() @Helium 0x11bf20 — inherited base dtor.
    // In TS the base's destroy() call is deferred to the harness lifecycle;
    // we surface the dependency as a throw citing the base callee.
    throw new Error(
      "HGAntiAlias::~HGAntiAlias() D2 @Helium 0x210bf0 tail-calls " +
      "HGNode::~HGNode() @Helium 0x11bf20 — invoke through the raw-port " +
      "lifecycle harness, not a JS dtor.",
    );
  }

  /**
   * HGAntiAlias::~HGAntiAlias() — D0 deleting destructor.
   *
   * Helium @0x210c70..@0x210caa:
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   movq  %rdi,%rbx
   *   leaq  0x81e210(%rip),%rax        ; = 0xa2ee90 (HGAntiAlias vtable)
   *   movq  %rax,(%rdi)                ; *this = vtable
   *   movq  0x198(%rdi),%rdi           ; rdi = renderInputNode_198
   *   testq %rdi,%rdi
   *   je    +0x8                       ; skip if null
   *   movq  (%rdi),%rax; callq *0x18(%rax)  ; child->Release() (HGObject::Release @0x1a0f30)
   *   movq  %rbx,%rdi
   *   callq HGNode::~HGNode() @0x11bf20 (D2)
   *   movq  %rbx,%rdi
   *   addq $0x8,%rsp; popq %rbx; popq %rbp
   *   jmp   HGObject::operator delete(void*) @0x1a0f10
   *
   * @provenance Helium @0x210c70
   */
  destroyAndFree(): void {
    throw new Error(
      "HGAntiAlias::~HGAntiAlias() D0 @Helium 0x210c70 calls " +
      "HGObject::Release @Helium 0x1a0f30 (via *0x18) on renderInputNode_198, " +
      "HGNode::~HGNode() @Helium 0x11bf20, then HGObject::operator delete " +
      "@Helium 0x1a0f10 — invoke through the raw-port lifecycle harness.",
    );
  }

  /**
   * HGAntiAlias::SetParameter(int idx, float value, float _unused_b, float _unused_c, float _unused_d).
   *
   * Returns 1 if the stored threshold changed, 0 otherwise (or if idx != 0).
   *
   * Helium @0x210cc0..@0x210ce9:
   *
   *     xorl %eax,%eax                 ; eax = 0 (return value default)
   *     testl %esi,%esi                ; esi = idx (arg1, int)
   *     je   0x210ccc                  ; only idx==0 is handled
   *     popq %rbp; retq                ; else return 0 with no side effect
   *
   *   0x210ccc:
   *     movss 0x1a0(%rdi),%xmm1        ; xmm1 = this->threshold_1a0
   *     ucomiss %xmm0,%xmm1            ; compare with new value (xmm0 = arg2)
   *     jne  0x210cdb                  ; UNORDERED or !=  → update
   *     jnp  0x210cca                  ; ORDERED == → skip (jump back to `popq; retq` return 0)
   *   0x210cdb:
   *     movss %xmm0,0x1a0(%rdi)        ; this->threshold_1a0 = new value
   *     movl  $0x1,%eax                ; return 1 (changed)
   *     popq %rbp; retq
   *
   * The two-jump `jne/jnp` pattern faithfully mirrors IEEE-754 ordered equality:
   * NaN vs anything is UNORDERED → PF=1 → jnp fails → treated as "changed",
   * matching FCP's behaviour when either operand is NaN.
   *
   * @provenance Helium @0x210cc0
   */
  SetParameter(idx: number, value: number, _b: number, _c: number, _d: number): number {
    // 0x210cc4 xorl %eax,%eax ; 0x210cc6 testl %esi,%esi ; 0x210cc8 je 0x210ccc
    if ((idx | 0) !== 0) {
      // 0x210cca popq %rbp; retq — eax remained 0.
      return 0;
    }
    // 0x210ccc..0x210cd9 — ucomiss with the ordered/unordered branch.
    const cur = Math.fround(this.threshold_1a0);
    const nv = Math.fround(value);
    // ucomiss xmm0=nv, xmm1=cur.
    //   Ordered equal ⇒ ZF=1, PF=0                      → jne skipped, jnp taken (return 0)
    //   Ordered less/greater ⇒ ZF=0, PF=0                → jne taken → update, return 1
    //   Unordered (NaN)  ⇒ ZF=1, PF=1                    → jne taken → update, return 1
    // Model that with a bit-exact test: equal-and-not-NaN skips; else updates.
    const bothOrdered = nv === nv && cur === cur;
    if (bothOrdered && nv === cur) {
      return 0;
    }
    // 0x210cdb: movss %xmm0, 0x1a0(rdi) ; movl $0x1, %eax
    this.threshold_1a0 = nv;
    return 1;
  }

  /**
   * HGAntiAlias::GetOutput(HGRenderer*) — build (or return the cached) SMAA
   * three-node render pipeline for the input at slot 0 of the given renderer.
   *
   * Helium @0x210cf0..@0x21113b (fast body). The .cold.1 fallback @0x3c49d0 is
   * the once-only initialiser for the file-local `lutFactory` singleton
   * (guarded by __ZGVZN11HGAntiAlias9GetOutputEP10HGRendererE10lutFactory
   * @0x21113c callq); the fast body checks the guard byte at 0x210ec3 and
   * jumps to the cold path @0x21113c when the guard is unset.
   *
   * The full mirror of the asm calls into a large set of Helium classes that
   * are NOT YET transcribed (HGColorConform, HGRenderer::GetInput,
   * HGLUTCacheManager, HGLUTCache, HGBitmapLoader, HgcSMAAPatternSearch,
   * HgcSMAABlend). Per Rule 3, each callee is a throw-stub citing its addr.
   * We enter the pipeline via the first observable call (HGRenderer::GetInput
   * @0x210d10) which suffices to fail loudly with a fully-cited gap trail.
   *
   * @provenance Helium @0x210cf0 (fast body), @0x3c49d0 (cold init),
   *             @0x210d10 (GetInput), @0x210d1d (HGColorConform new),
   *             @0x210d28 (HGColorConform ctor), @0x210d3c (vcall *0x78),
   *             @0x210d6f (HGColorConform::SetConversion),
   *             @0x210d79 (HGNode new = edge LUT holder),
   *             @0x210d84 (HGNode::HGNode base ctor for the LUT node),
   *             @0x210d98 (__Znam 0x107 bytes for LUT/params buffer),
   *             @0x210dbf,0x210dd0,0x210de2,0x210df4,0x210e0c,0x210e23
   *                  (six 16-byte constant packs written to the LUT buffer),
   *             @0x210f19 (HGLUTCacheManager::getLUTCache),
   *             @0x210f27,@0x210f36 (HGLUTCache::getNewLUT × 2),
   *             @0x210f6b,@0x210f84 (HGBitmapLoader ctors × 2),
   *             @0x210f99 (HgcSMAAPatternSearch ctor),
   *             @0x210fb6 (HGNode::SetFlags 1,4 on the pattern-search node),
   *             @0x211063 (HgcSMAABlend ctor),
   *             @0x21107c (HGNode::SetInput on the blend node),
   *             @0x21113c (cold-init callq for lutFactory guard).
   */
  GetOutput(renderer: unknown): unknown {
    // 0x210d0e xorl %edx,%edx; 0x210d10 callq HGRenderer::GetInput(this,0)
    const _upstream = hgRenderer_getInput(renderer, this, 0);

    // 0x210d1d callq HGObject::operator new(0x370)  — allocate HGColorConform.
    // 0x210d28 callq HGColorConform::HGColorConform() — throw-stub trail
    // starts here (the port cannot proceed until HGColorConform lands).
    const cc = hgColorConform_new_and_ctor();

    // 0x210d33 xorl %esi,%esi ; 0x210d35 movq %r12,%rdx ; 0x210d3c callq *0x78(vtbl[cc])
    // This vtable slot on HGColorConform is HGNode::SetInput(int slot, HGNode* src)
    // (slot 0x78 in the HGNode-family vtable — see raw-port/src/render/HGNode.ts).
    // Fully faithful: dispatch through cc's vtable slot *0x78 with slot=0 and
    // src=upstream. Un-ported wire — throw with citation.
    throw new Error(
      "HGAntiAlias::GetOutput @Helium 0x210cf0 — reached vcall *0x78 on " +
      "the freshly-constructed HGColorConform @Helium 0x210d3c " +
      "(HGNode::SetInput slot, cc.SetInput(0, upstream)) which requires " +
      "HGColorConform::HGColorConform @Helium 0x210d28 and the full HGNode " +
      "vtable dispatcher to be wired in the raw-port harness. See the " +
      "docblock above for the complete list of downstream un-transcribed " +
      "callees (@0x210d6f, @0x210d84, @0x210d98, @0x210f19, @0x210f27, " +
      "@0x210f6b, @0x210f99, @0x211063).",
    );
    // NOTE: intentionally unreachable — every remaining call in the asm is
    // a virtual dispatch on an un-ported class. Adding a plausible-looking
    // body would be a Rule-3 shortcut. The throw above is the correct terminal
    // state until HGColorConform / HGLUTCache / HgcSMAA* are transcribed.
    // eslint-disable-next-line @typescript-eslint/no-unreachable-code
    void hgColorConform_setConversion;
    void hgLutCacheManager_getLUTCache;
    void hgLutCache_getNewLUT;
    void hgBitmapLoader_new_and_ctor;
    void hgcSMAAPatternSearch_new_and_ctor;
    void hgcSMAABlend_new_and_ctor;
    void cc;
  }
}
