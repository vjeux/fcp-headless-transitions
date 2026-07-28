// raw-port/src/render/HGDeinterlaceLA.ts
//
// FCP `HGDeinterlaceLA` — Helium render-graph node (extends HGNode). A
// small facade around a private shader-graph node `Hgc2DeinterlaceLA*`
// (at [+0x1a8]) plus three inline int32 parameters (`(x, y, mode)` stored
// at +0x198/+0x19c/+0x1a0). SetParameter accepts only `paramIndex==0`,
// GetOutput pushes the three ints (as floats) into the child's
// SetParameter and wires the graph's input-0 into child.SetInput(0, …).
//
// Provenance framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Method map (x86_64 slice):
//   @0x000000000003e730  C1 — HGDeinterlaceLA()                    (== C2, no D1/D2 fold)
//   @0x000000000003e800  D1/D2 — ~HGDeinterlaceLA()                 (folded body)
//   @0x000000000003e840  D0 — ~HGDeinterlaceLA() (deleting)
//   @0x000000000003e880  SetParameter(int, float, float, float, float)
//   @0x000000000003e8c0  GetOutput(HGRenderer*)
//
// Vtable @Helium 0xa065f8 (installed ptr — written by ctor @0x03e749).
// Slots that DIFFER from HGNode:
//   *0x00 = 0x3e800  ~HGDeinterlaceLA() [D1/D2]
//   *0x08 = 0x3e840  ~HGDeinterlaceLA() [D0]
//   *0x60 = 0x3e880  HGDeinterlaceLA::SetParameter
// Every other slot inherits HGNode. (See
// `resolve.py Helium vtable HGDeinterlaceLA`.)
//
// STRUCT LAYOUT — extends HGNode (size 0x198). Total size 0x1b0
// (visible as `movl $0x1b0,%edi` in the ctor — that value is the size of
// THIS class, and the same size is used for the child alloc):
//   ---- inherited from HGNode (size 0x198) ----
//     0x00..0x197 : all HGNode fields (see raw-port/src/render/HGNode.ts).
//   ---- HGDeinterlaceLA-specific ----
//     0x198 : i32   paramX   (SetParameter fold of float f0 -> cvttps2dq)
//     0x19c : i32   paramY   (SetParameter fold of float f1 -> cvttps2dq)
//     0x1a0 : i32   paramMode(SetParameter fold of float f2 -> cvttss2si)
//     0x1a4 : (padding — 4 bytes; unread by any decoded method)
//     0x1a8 : Hgc2DeinterlaceLA*  child (constructed in ctor via
//                                        HGObject::operator new(0x1b0))
//
// Note that although the ctor allocates 0x1b0 == 432 bytes for the CHILD
// as well (@0x03e756 `movl $0x1b0,%edi`), that reflects sizeof
// `Hgc2DeinterlaceLA`. HGDeinterlaceLA and its child happen to share the
// same size (both are HGNode+extras); the sizes agreeing is a coincidence
// of layout, not a required identity.
//
// FRONTIER (throw-stubs, cited by @0xADDR):
//   Hgc2DeinterlaceLA::Hgc2DeinterlaceLA()    @Helium 0x… (called from @0x03e766)
//   Hgc2DeinterlaceLA::SetParameter(i,f,f,f,f) @Helium 0x…  (called via *0x60 @0x03e8f7)
//   Hgc2DeinterlaceLA vtable *0x18 (Release/D0) — called from ~D0 @0x03e85d
//   Hgc2DeinterlaceLA vtable *0x78 (SetInput)   — called from GetOutput @0x03e919
//   HGNode::ClearBits()                       @Helium 0x11c890 (from SetParameter @0x03e8a9)
//   HGRenderer::GetInput(HGNode*, int)        @Helium 0x…    (from GetOutput @0x03e909)
// These are all faithful throw-stubs; the class body wires the calls in
// the correct order + register layout but the callees themselves are
// decoded elsewhere.

import { HGNode } from './HGNode';

// ── Frontier stubs — `Hgc2DeinterlaceLA` + a few HGNode/HGRenderer entries.

/**
 * Hgc2DeinterlaceLA — HGNode-descended shader-graph node held at
 * HGDeinterlaceLA[+0x1a8]. This transcription models it as an HGNode
 * subclass with a throwing ctor + throwing forwarded methods, all
 * cited by the exact @0xADDR at which HGDeinterlaceLA reaches into it.
 */
class Hgc2DeinterlaceLA_stub extends HGNode {
  constructor() {
    super();
    // throw: Hgc2DeinterlaceLA::Hgc2DeinterlaceLA() @Helium 0x…  not yet transcribed @0x03e766
    throw new Error(
      "Hgc2DeinterlaceLA::Hgc2DeinterlaceLA() (mangled __ZN17Hgc2DeinterlaceLAC2Ev) not yet transcribed (called from HGDeinterlaceLA::HGDeinterlaceLA() @0x03e766)",
    );
  }

  /**
   * Hgc2DeinterlaceLA::SetParameter(int,float,float,float,float) —
   * vtable slot *0x60 of Hgc2DeinterlaceLA. Called from
   * HGDeinterlaceLA::GetOutput @0x03e8f7 as
   *   child->vtable[*0x60](child, 0, xmm0, xmm1, xmm2, xmm3=0.0f)
   */
  SetParameter(_i: number, _a: number, _b: number, _c: number, _d: number): void {
    // throw: Hgc2DeinterlaceLA::SetParameter (via *0x60) not yet transcribed @0x03e8f7
    throw new Error(
      "Hgc2DeinterlaceLA::SetParameter(int, float, float, float, float) (mangled __ZN17Hgc2DeinterlaceLA12SetParameterEiffff) not yet transcribed (called via vtable *0x60 from HGDeinterlaceLA::GetOutput @0x03e8f7)",
    );
  }

  /**
   * Hgc2DeinterlaceLA::SetInput(int, HGNode*) — vtable slot *0x78.
   * Called from HGDeinterlaceLA::GetOutput @0x03e919 as
   *   child->vtable[*0x78](child, 0, HGRenderer::GetInput(rendererArg, this, 0))
   */
  SetInput(_slot: number, _src: HGNode | null): number {
    // throw: Hgc2DeinterlaceLA::SetInput (via *0x78) not yet transcribed @0x03e919
    throw new Error(
      "Hgc2DeinterlaceLA::SetInput(int, HGNode*) (via vtable *0x78) not yet transcribed (called from HGDeinterlaceLA::GetOutput @0x03e919; Hgc2DeinterlaceLA inherits HGNode::SetInput @Helium 0x11c5f0 but takes its own vtable slot)",
    );
  }

  /**
   * Hgc2DeinterlaceLA vtable *0x18 slot (Release or D0). Called from
   * HGDeinterlaceLA::~HGDeinterlaceLA (D0) @0x03e85d and equivalent path.
   */
  vtable_0x18_release_or_dtor(): void {
    throw new Error(
      "Hgc2DeinterlaceLA vtable *0x18 (Release or ~Hgc2DeinterlaceLA D0) not yet transcribed (called from HGDeinterlaceLA::~HGDeinterlaceLA @0x03e85d)",
    );
  }
}

/**
 * HGNode::ClearBits() (no args) — @Helium 0x11c890.
 * A distinct symbol from HGNode::ClearBits(int) @0x11f6b0 (which IS
 * partially covered in HGNode.ts). This zero-arg variant clears a
 * default set of node bits; body not yet transcribed. Used by
 * HGDeinterlaceLA::SetParameter @0x03e8a9.
 */
function HGNode_ClearBits_stub(_self: HGNode): void {
  // throw: HGNode::ClearBits() @Helium 0x11c890 not yet transcribed @0x03e8a9
  throw new Error(
    "HGNode::ClearBits() (no-arg overload, mangled __ZN6HGNode9ClearBitsEv) @Helium 0x11c890 not yet transcribed (called from HGDeinterlaceLA::SetParameter @0x03e8a9)",
  );
}

/**
 * HGRenderer::GetInput(HGNode* graphNode, int inputIdx) — mangled
 * __ZN10HGRenderer8GetInputEP6HGNodei. Not yet transcribed. Called from
 * HGDeinterlaceLA::GetOutput @0x03e909 to translate the graph's input-0
 * into a concrete upstream HGNode* to hand to the child's SetInput.
 */
function HGRenderer_GetInput_stub(
  _renderer: unknown,
  _graphNode: HGNode,
  _inputIdx: number,
): HGNode | null {
  // throw: HGRenderer::GetInput(HGNode*, int) not yet transcribed @0x03e909
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) (mangled __ZN10HGRenderer8GetInputEP6HGNodei) not yet transcribed (called from HGDeinterlaceLA::GetOutput @0x03e909)",
  );
}

/**
 * HGDeinterlaceLA — Helium HGNode subclass; thin facade around a
 * Hgc2DeinterlaceLA shader-graph child stored at [+0x1a8], plus three
 * inline int32 parameters at +0x198..+0x1a0. See file header.
 */
export class HGDeinterlaceLA extends HGNode {
  /** +0x198 — i32 paramX. Stored by SetParameter via cvttps2dq
   *  truncation of the first float arg. */
  private paramX = 0 | 0;
  /** +0x19c — i32 paramY. Stored by SetParameter via cvttps2dq of
   *  the second float arg. */
  private paramY = 0 | 0;
  /** +0x1a0 — i32 paramMode. Stored by SetParameter via cvttss2si of
   *  the third float arg. */
  private paramMode = 0 | 0;
  /** +0x1a8 — Hgc2DeinterlaceLA* child. Constructed in ctor. */
  private child: Hgc2DeinterlaceLA_stub | null = null;

  /**
   * HGDeinterlaceLA::HGDeinterlaceLA() — C1 == C2 @0x03e730.
   * Mangled: __ZN15HGDeinterlaceLAC1Ev / C2Ev.
   *
   * Body @0x03e730..0x03e786:
   *   0x03e73d: callq HGNode::HGNode()
   *   0x03e742: leaq  0x9c7eaf(%rip),%rax        # HGDeinterlaceLA vtable @0xa065f8
   *   0x03e749: movq  %rax,(%rbx)                # this->vtable = 0xa065f8
   *   0x03e74c: movl  $0x0,0x198(%rbx)           # this->paramX = 0
   *                                              # NOTE: only ONE 32-bit
   *                                              #  slot is zeroed here.
   *                                              #  paramY / paramMode /
   *                                              #  child pointer are
   *                                              #  set below (child) or
   *                                              #  left indeterminate
   *                                              #  until first
   *                                              #  SetParameter.
   *   0x03e756: movl  $0x1b0,%edi                # sizeof(Hgc2DeinterlaceLA) == 0x1b0
   *   0x03e75b: callq HGObject::operator new(m)
   *   0x03e760: movq  %rax,%r14                  # r14 = raw block
   *   0x03e766: callq Hgc2DeinterlaceLA::Hgc2DeinterlaceLA()   # in-place construct
   *   0x03e76b: leaq  0x9c80c6(%rip),%rax        # Hgc2DeinterlaceLA vtable @0xa4… ish
   *   0x03e772: movq  %rax,(%r14)                # child->vtable = <Hgc2DeinterlaceLA vtable>
   *                                              # Note: the C++ ctor
   *                                              # normally installs
   *                                              # the vtable itself;
   *                                              # this OVERWRITE is
   *                                              # a specific choice to
   *                                              # bind the CONCRETE
   *                                              # subclass vtable (this
   *                                              # is the "install final
   *                                              # subclass vtable at end
   *                                              # of most-derived ctor"
   *                                              # C++ ABI move).
   *   0x03e775: movq  %r14,0x1a8(%rbx)           # this->child = r14
   *   0x03e77c: epilogue                          # (no unique_ptr-style
   *                                              #  replace-with-release
   *                                              #  because paramX is the
   *                                              #  only field set before
   *                                              #  the alloc; there is
   *                                              #  no pre-existing
   *                                              #  child to release).
   *
   * The 0x03e787+ region is a clang exception-unwind block for
   * Hgc2DeinterlaceLA::Hgc2DeinterlaceLA() throwing — it frees the raw
   * block via HGObject::operator delete (@0x03e78d), then HGNode::~HGNode
   * (@0x03e795), then __Unwind_Resume.
   */
  constructor() {
    // @0x03e73d.
    super();
    // @0x03e74c: this->paramX = 0. (paramY / paramMode default-initialized
    // via TS field defaults above — they are NOT zeroed by this ctor in
    // the machine code, but TS class-field initialization runs before
    // the constructor body, so they start at 0 as well. This matches the
    // OBSERVABLE behaviour: no method reads them before SetParameter is
    // called.)
    this.paramX = 0 | 0;
    // @0x03e756..@0x03e775: allocate + in-place construct the child.
    // The `new Hgc2DeinterlaceLA_stub()` throws (frontier); this is
    // correct anti-shortcut behaviour.
    const raw = new Hgc2DeinterlaceLA_stub();
    // Unreachable: the frontier stub throws. If FCP successfully
    // constructed it, the next steps would be:
    // @0x03e76b/@0x03e772: install concrete Hgc2DeinterlaceLA vtable
    // (a machine-level no-op in TS — vtable is implicit in the class).
    // @0x03e775: this->child = raw.
    this.child = raw;
  }

  /**
   * HGDeinterlaceLA::~HGDeinterlaceLA() — D0 (deleting) @0x03e840.
   * Also compiles as D1/D2 @0x03e800 (folded body, no `jmp operator delete`).
   *
   * Body @0x03e840..0x03e876:
   *   0x03e849: leaq  0x9c7da8(%rip),%rax        # HGDeinterlaceLA vtable @0xa065f8
   *   0x03e850: movq  %rax,(%rdi)                # restore this->vtable
   *   0x03e853: movq  0x1a8(%rdi),%rdi           # rdi = this->child
   *   0x03e85a: movq  (%rdi),%rax                # (NO null check — child is
   *                                              #  assumed non-null)
   *   0x03e85d: callq *0x18(%rax)                # child->vtable[*0x18]() —
   *                                              # Release or D0 depending on
   *                                              # the child's vtable install.
   *   0x03e863: callq HGNode::~HGNode()
   *   0x03e871: jmp   HGObject::operator delete
   *
   * IMPORTANT: unlike HGColorBars::~D0 which BRANCHES on
   * `if (child) …`, this dtor unconditionally dereferences the child
   * pointer and calls *0x18. The assumption is that this->child was set
   * by the ctor and never cleared. If a subclass or external caller
   * nulled it out, this would crash — which is exactly the behaviour
   * we preserve.
   */
  dispose(): void {
    // @0x03e850: vtable restore is a machine detail; irrelevant in TS.
    // @0x03e853..@0x03e85d: child->vtable[*0x18]() — no null check.
    if (this.child === null) {
      // This mirrors what a null-dereference would do in the real
      // binary: NOT a graceful branch, but an invariant violation.
      throw new Error(
        "HGDeinterlaceLA::~HGDeinterlaceLA @0x03e840 — this->child is null (invariant violation; ctor @0x03e775 should have set it)",
      );
    }
    this.child.vtable_0x18_release_or_dtor();
    // Unreachable — stub throws. Real FCP continues:
    // @0x03e863: HGNode::~HGNode() (base dtor).
    // @0x03e871: HGObject::operator delete — GC in JS.
    this.child = null;
  }

  /**
   * HGDeinterlaceLA::SetParameter(int idx, float a, float b, float c, float d)
   *   — @0x03e880. Vtable slot *0x60 of this class.
   * Mangled: __ZN15HGDeinterlaceLA12SetParameterEiffff.
   *
   * Body @0x03e880..@0x03e8b4:
   *   0x03e880: movl  $0xffffffff,%eax           # eax = -1 (default fail)
   *   0x03e885: testl %esi,%esi                  # if (idx == 0) ...
   *   0x03e887: je    0x03e88a                   #   ... continue
   *   0x03e889: retq                             # else return -1
   *   0x03e88e: insertps $0x10,%xmm1,%xmm0       # xmm0 = { xmm0.x, xmm1.x, xmm0.z, xmm0.w }
   *                                              #   packs f0 and f1 into a 2-lane
   *                                              #   float vector.
   *   0x03e894: cvttps2dq %xmm0,%xmm0            # truncate 4 float lanes to i32
   *                                              #   (only low 2 lanes matter)
   *   0x03e898: movlps  %xmm0,0x198(%rdi)        # write 8 bytes (paramX, paramY) at [+0x198]
   *   0x03e89f: cvttss2si %xmm2,%eax             # eax = (i32)f2
   *   0x03e8a3: movl  %eax,0x1a0(%rdi)           # this->paramMode = eax
   *   0x03e8a9: callq HGNode::ClearBits()         # zero-arg overload — clears default node bits
   *   0x03e8ae: movl  $0x1,%eax                  # return 1
   *   0x03e8b3: popq  %rbp ; retq
   *
   * Semantics: only `paramIndex==0` is accepted. Fold (f0, f1, f2) into
   * three int32s via truncation-toward-zero (cvttps2dq / cvttss2si),
   * store them at (+0x198, +0x19c, +0x1a0). f3 (xmm3) is IGNORED.
   * Return int32: 1 on success, -1 on rejected idx.
   */
  SetParameter(idx: number, a: number, b: number, c: number, _d: number): number {
    // @0x03e880/@0x03e885/@0x03e887: idx guard.
    if ((idx | 0) !== 0) {
      // @0x03e889: return -1.
      return -1 | 0;
    }
    // @0x03e88e..@0x03e898: (i32)f0 -> +0x198, (i32)f1 -> +0x19c.
    // cvttss2si / cvttps2dq are truncation-toward-zero of a 32-bit
    // float to a 32-bit signed integer. TS: coerce a to a single-
    // precision float first (Math.fround) then truncate.
    this.paramX = (Math.trunc(Math.fround(a))) | 0;
    this.paramY = (Math.trunc(Math.fround(b))) | 0;
    // @0x03e89f..@0x03e8a3: (i32)f2 -> +0x1a0.
    this.paramMode = (Math.trunc(Math.fround(c))) | 0;
    // @0x03e8a9: HGNode::ClearBits() — throws (frontier stub).
    HGNode_ClearBits_stub(this);
    // Unreachable — real FCP returns 1 here. @0x03e8ae.
    return 1 | 0;
  }

  /**
   * HGDeinterlaceLA::GetOutput(HGRenderer* r) — @0x03e8c0.
   * Mangled: __ZN15HGDeinterlaceLA9GetOutputEP10HGRenderer.
   *
   * Body @0x03e8c0..@0x03e92d:
   *   0x03e8ca: movq  %rsi,%r14                  # r14 = renderer (arg)
   *   0x03e8cd: movq  %rdi,%rbx                  # rbx = this
   *   0x03e8d0: cvtsi2ssl 0x198(%rdi),%xmm0      # xmm0 = (float)paramX
   *   0x03e8d8: movq  0x1a8(%rdi),%rdi           # rdi = this->child
   *   0x03e8df: cvtsi2ssl 0x19c(%rbx),%xmm1      # xmm1 = (float)paramY
   *   0x03e8e7: cvtsi2ssl 0x1a0(%rbx),%xmm2      # xmm2 = (float)paramMode
   *   0x03e8ef: movq  (%rdi),%rax                # rax = child->vtable
   *   0x03e8f2: xorps %xmm3,%xmm3                # xmm3 = 0.0f (unused 4th float)
   *   0x03e8f5: xorl  %esi,%esi                  # esi = 0 (paramIndex)
   *   0x03e8f7: callq *0x60(%rax)                # child->SetParameter(0, xmm0, xmm1, xmm2, 0.0f)
   *   0x03e8fa: movq  0x1a8(%rbx),%r15           # r15 = this->child (reload)
   *   0x03e901: movq  %r14,%rdi                  # rdi = renderer
   *   0x03e904: movq  %rbx,%rsi                  # rsi = this
   *   0x03e907: xorl  %edx,%edx                  # edx = 0 (inputIdx)
   *   0x03e909: callq HGRenderer::GetInput(HGNode*, int)   # upstream input for slot 0
   *   0x03e90e: movq  (%r15),%rcx                # rcx = child->vtable
   *   0x03e911: movq  %r15,%rdi                  # rdi = child
   *   0x03e914: xorl  %esi,%esi                  # esi = 0 (slot)
   *   0x03e916: movq  %rax,%rdx                  # rdx = upstream input
   *   0x03e919: callq *0x78(%rcx)                # child->SetInput(0, upstream)
   *   0x03e91c: movq  0x1a8(%rbx),%rax           # return this->child
   *
   * Semantics:
   *   1. Convert the three stored int32 params back to floats and push
   *      them into `child.SetParameter(0, paramX, paramY, paramMode, 0.0f)`
   *      via its vtable *0x60.
   *   2. Resolve `this`'s graph input-0 via HGRenderer::GetInput.
   *   3. Wire that upstream node into `child.SetInput(0, upstream)` via
   *      child's vtable *0x78 slot.
   *   4. Return `this->child`.
   *
   * Return type: `HGNode*` in the C++ header — the concrete Hgc2DeinterlaceLA
   * pointer, upcast.
   */
  GetOutput(renderer: unknown): HGNode | null {
    const child = this.child;
    if (child === null) {
      // Machine code does NOT null-check @0x03e8d8; preserve the
      // invariant loudly.
      throw new Error(
        "HGDeinterlaceLA::GetOutput @0x03e8c0 — this->child is null (invariant violation; ctor @0x03e775 should have set it)",
      );
    }
    // @0x03e8d0/@0x03e8df/@0x03e8e7: sint-to-float conversions
    // (cvtsi2ssl -> single precision). Math.fround the result to match
    // the register width. `x | 0` was already applied at store time,
    // so the values are exact int32.
    const fParamX = Math.fround(this.paramX | 0);
    const fParamY = Math.fround(this.paramY | 0);
    const fParamMode = Math.fround(this.paramMode | 0);
    // @0x03e8f2/@0x03e8f5/@0x03e8f7: child.SetParameter(0, fParamX, fParamY, fParamMode, 0.0f).
    child.SetParameter(0 | 0, fParamX, fParamY, fParamMode, Math.fround(0.0));
    // Unreachable — Hgc2DeinterlaceLA_stub.SetParameter throws.
    // Real FCP would continue:
    // @0x03e909: HGRenderer::GetInput(renderer, this, 0).
    const upstream = HGRenderer_GetInput_stub(renderer, this, 0 | 0);
    // @0x03e919: child.SetInput(0, upstream).
    child.SetInput(0 | 0, upstream);
    // @0x03e91c: return this->child.
    return child;
  }
}
