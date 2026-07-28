// HGLensGDC_BC — Helium node subclass that runs a broadcast-quality ("BC")
// lens geometric-distortion-correction (GDC) shader over a single input node.
// From this class's decoded surface we only see (a) its two-slot destructor
// pair chaining into a base class named `Hgc2LensGDC_BC` (the actual per-pixel
// shader implementation lives there, not on this class's slice), and (b) its
// `GetDOD` override which reports "what pixels do I potentially write?" back
// to the HGRenderer.
//
// The class inherits (single inheritance — the D1 dtor's ONLY body is a
// tail-jmp to `Hgc2LensGDC_BC::~Hgc2LensGDC_BC()`, confirming the primary
// base is Hgc2LensGDC_BC at offset 0) from an unknown-depth chain that
// ultimately roots at HGNode (evidence: the ICF-adjacent
// `HGRetimeWithFrameBlend::HGRetimeWithFrameBlend()` at Helium 0x1e3820,
// starting immediately after this class's methods, itself calls
// `HGNode::HGNode()` — a common Helium-node ctor pattern; and this class's
// vtable is at Helium 0xa2b360 with its typeinfo at 0xa2b5a0 which pins it
// as an HGNode-lineage class).
//
// nm evidence (`nm -arch x86_64 -n Helium | grep HGLensGDC_BC`):
//   00000000001e37b0 t __ZN12HGLensGDC_BCD1Ev
//   00000000001e37c0 t __ZN12HGLensGDC_BCD0Ev
//   00000000001e37e0 t __ZN12HGLensGDC_BC6GetDODEP10HGRendereri6HGRect
//   000000000085f77e s __ZTS12HGLensGDC_BC        (typeinfo name)
//   0000000000a2b360 s __ZTV12HGLensGDC_BC        (vtable)
//   0000000000a2b5a0 s __ZTI12HGLensGDC_BC        (typeinfo)
//
// Faithful transcription of exactly THREE exported symbols. Source disasm
// dumped via raw-port/tools/disasm.sh under raw-port/re/disasm/:
//   Helium.HGLensGDC_BC.~HGLensGDC_BC.s      (D0 dtor @0x1e37c0)
//   Helium.HGLensGDC_BC.GetDOD.s             (GetDOD @0x1e37e0)
// The D1 dtor at 0x1e37b0 was recovered via an awk pull on Helium_tV.txt
// (`__ZN12HGLensGDC_BCD1Ev:`) — 5 instructions total.
// Framework: Final Cut Pro / Helium.framework.
//
// Source disassembly:
//
// (D1 — complete-object dtor)
//   __ZN12HGLensGDC_BCD1Ev:
//     0x1e37b0 pushq %rbp
//     0x1e37b1 movq  %rsp, %rbp
//     0x1e37b4 popq  %rbp
//     0x1e37b5 jmp   __ZN14Hgc2LensGDC_BCD2Ev  ## Hgc2LensGDC_BC::~Hgc2LensGDC_BC()
//     0x1e37ba nopw  (%rax,%rax)              ; alignment
//
// (D0 — deleting dtor)
//   __ZN12HGLensGDC_BCD0Ev:
//     0x1e37c0 pushq %rbp
//     0x1e37c1 movq  %rsp, %rbp
//     0x1e37c4 pushq %rbx
//     0x1e37c5 pushq %rax                     ; 16B stack align
//     0x1e37c6 movq  %rdi, %rbx               ; spill this
//     0x1e37c9 callq Hgc2LensGDC_BC::~Hgc2LensGDC_BC()  ; chain base dtor
//     0x1e37ce movq  %rbx, %rdi               ; %rdi = this again
//     0x1e37d1 addq  $0x8, %rsp
//     0x1e37d5 popq  %rbx
//     0x1e37d6 popq  %rbp
//     0x1e37d7 jmp   HGObject::operator delete(void*)  ; tail-jmp Helium's
//                                                       ; HGObject-scoped
//                                                       ; operator delete
//                                                       ; (not the global one)
//     0x1e37dc nopl  (%rax)                   ; alignment
//
// (GetDOD)
//   __ZN12HGLensGDC_BC6GetDODEP10HGRendereri6HGRect:
//     0x1e37e0 testl %edx, %edx                ; arg2 `int` (probably a
//                                                ; render-mode enum: 0 =
//                                                ; normal / non-zero = some
//                                                ; degenerate mode like
//                                                ; "wireframe/thumbnail" that
//                                                ; wants HGRectNull).
//     0x1e37e2 je    0x1e37f3                  ; edx==0 -> normal branch
//     0x1e37e4 leaq  _HGRectNull(%rip), %rcx   ; else load &HGRectNull (16B)
//     0x1e37eb movq  (%rcx), %rax              ; return low 8B in %rax
//     0x1e37ee movq  0x8(%rcx), %rdx           ; return high 8B in %rdx
//     0x1e37f2 retq                            ; System V ABI: 16B struct
//                                                ; return in {%rax, %rdx}
//     0x1e37f3 pushq %rbp                      ; NORMAL branch — set up frame
//     0x1e37f4 movq  %rsp, %rbp                ;   for the two tail calls.
//     0x1e37f7 pushq %rbx
//     0x1e37f8 pushq %rax                      ; 16B align
//     0x1e37f9 movq  %rdi, %rax                ; %rax = this
//     0x1e37fc movq  %rsi, %rdi                ; %rdi = renderer
//     0x1e37ff movq  %rsi, %rbx                ; %rbx = renderer (spill)
//     0x1e3802 movq  %rax, %rsi                ; %rsi = this
//     0x1e3805 xorl  %edx, %edx                ; %edx = 0 (input index)
//     0x1e3807 callq HGRenderer::GetInput(HGNode*, int)
//                                              ; input = renderer.GetInput(this, 0)
//     0x1e380c movq  %rbx, %rdi                ; %rdi = renderer
//     0x1e380f movq  %rax, %rsi                ; %rsi = input
//     0x1e3812 addq  $0x8, %rsp
//     0x1e3816 popq  %rbx
//     0x1e3817 popq  %rbp
//     0x1e3818 jmp   HGRenderer::GetDOD(HGNode*)  ; tail-jmp GetDOD(input)
//     0x1e381d…       ; padding + start of the next symbol
//                       (nm shows __ZN22HGRetimeWithFrameBlendC2Ev at 0x1e3820
//                        — a completely different class, so anything at or
//                        beyond 0x1e381d is NOT part of this class's slice).
//
// Semantics decoded: GetDOD is a pure pass-through. HGLensGDC_BC has ONE
// input (index 0), and its output DOD is exactly its input's DOD — i.e. the
// GDC filter neither adds nor removes pixels from the domain-of-definition.
// The `edx != 0` short-circuit to HGRectNull is Helium's convention for
// certain render modes (probably "estimate" or "thumbnail") in which the
// node declines to declare any DOD, forcing the renderer to skip it.
//
// Vtable slots (installed vptr @Helium 0xa2b360 — resolve.py output not
// needed for this port since the three symbols above are the only OWN slots
// the class exports — all other slots inherit through Hgc2LensGDC_BC and
// HGNode).
//
// Frontier callees (all become throwing stubs):
//   Hgc2LensGDC_BC::~Hgc2LensGDC_BC() [D2]        @Helium tail-jmp D1 0x1e37b5 / callq D0 0x1e37c9
//   HGObject::operator delete(void*)              @Helium tail-jmp D0 0x1e37d7
//   HGRenderer::GetInput(HGNode*, int)            @Helium callq GetDOD 0x1e3807
//   HGRenderer::GetDOD(HGNode*)                   @Helium tail-jmp GetDOD 0x1e3818
//
// Reused ports:
//   HGRect, HGRectNull — from raw-port/src/render/HGRect.ts (already covers
//   the _HGRectNull data symbol referenced at GetDOD @0x1e37e4).

import { HGRect, HGRectNull } from "./HGRect.js";

/**
 * Opaque handle for `HGRenderer` — the Helium render orchestrator. Its own
 * methods are frontier from this class's slice: only two, `GetInput(HGNode*,
 * int)` and `GetDOD(HGNode*)`, are referenced by name here.
 */
export type HGRenderer = object;

/**
 * Opaque handle for `HGNode` — the Helium base class every renderable node
 * inherits from. HGLensGDC_BC IS-A HGNode (via Hgc2LensGDC_BC). Its layout is
 * not on this class's decoded surface.
 */
export type HGNode = object;

/**
 * `HGRenderer::GetInput(HGNode*, int)` — frontier method. Called from
 * GetDOD @0x1e3807 with (`this` = renderer, `node` = the HGLensGDC_BC, `idx`
 * = 0). Returns the HGNode pointer sitting at input port `idx` of `node`.
 * Not on this class's decoded surface.
 */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _node: HGNode,
  _idx: number
): HGNode {
  throw new Error(
    "HGLensGDC_BC: HGRenderer::GetInput(HGNode*, int) not yet transcribed " +
      "@Helium call site 0x1e3807"
  );
}

/**
 * `HGRenderer::GetDOD(HGNode*)` — frontier method. Tail-jmp'd from GetDOD
 * @0x1e3818 with (`this` = renderer, `node` = the input port 0 result).
 * Returns an HGRect (16B struct return in %rax:%rdx). Not on this class's
 * decoded surface.
 */
function HGRenderer_GetDOD(_renderer: HGRenderer, _node: HGNode): HGRect {
  throw new Error(
    "HGLensGDC_BC: HGRenderer::GetDOD(HGNode*) not yet transcribed " +
      "@Helium tail-jmp site 0x1e3818"
  );
}

/**
 * `Hgc2LensGDC_BC::~Hgc2LensGDC_BC()` [D2 base-object dtor] — the primary
 * base class's destructor. Chained by both this class's dtors. Its body — and
 * the actual per-pixel GDC shader math that lives on Hgc2LensGDC_BC — is
 * frontier from this slice.
 */
function Hgc2LensGDC_BC_D2_dtor(_this: HGLensGDC_BC): void {
  throw new Error(
    "HGLensGDC_BC: Hgc2LensGDC_BC::~Hgc2LensGDC_BC() [D2] not yet transcribed " +
      "@Helium tail-jmp D1 0x1e37b5 / callq D0 0x1e37c9"
  );
}

/**
 * `HGObject::operator delete(void*)` — Helium's HGObject-scoped `operator
 * delete` (Helium overrides the global one to route through its own
 * allocator, distinct from the C++ `_ZdlPv`). D0 tail-jmps to it at
 * @0x1e37d7. Not on this class's decoded surface.
 */
function HGObject_operator_delete(_this: HGLensGDC_BC): void {
  throw new Error(
    "HGLensGDC_BC: HGObject::operator delete(void*) not yet transcribed " +
      "@Helium tail-jmp D0 0x1e37d7"
  );
}

/**
 * The class instance. Non-decodable-from-this-slice layout — we only mirror
 * that it is-a Helium node whose base sub-object (Hgc2LensGDC_BC) starts at
 * offset 0.
 */
export class HGLensGDC_BC {
  /**
   * `HGLensGDC_BC::~HGLensGDC_BC()` — the Itanium C++ ABI D1 (complete-object)
   * destructor. Mangled `__ZN12HGLensGDC_BCD1Ev` at @Helium 0x1e37b0.
   *
   * Address-by-address:
   *   0x1e37b0  pushq %rbp             ─┐ empty frame
   *   0x1e37b1  movq  %rsp, %rbp       │
   *   0x1e37b4  popq  %rbp             ─┘
   *   0x1e37b5  jmp   Hgc2LensGDC_BC::~Hgc2LensGDC_BC()   ; tail-jmp base D2
   *
   * The tail-jmp semantic guarantees %rdi (= this) is unchanged; the base D2
   * receives this class's `this` because the primary base sits at offset 0.
   * This class contributes zero cleanup — every field it might own is on the
   * base sub-object.
   */
  destroy_D1_completeObjectDtor(): void {
    // @0x1e37b5 — tail-jmp Hgc2LensGDC_BC's D2 dtor.
    Hgc2LensGDC_BC_D2_dtor(this);
  }

  /**
   * `HGLensGDC_BC::~HGLensGDC_BC()` — the Itanium C++ ABI D0 (deleting)
   * destructor. Mangled `__ZN12HGLensGDC_BCD0Ev` at @Helium 0x1e37c0.
   *
   * Address-by-address:
   *   0x1e37c0..0x1e37c6  prologue + spill this into %rbx.
   *   0x1e37c9            callq Hgc2LensGDC_BC::~Hgc2LensGDC_BC() [D2].
   *   0x1e37ce..0x1e37d6  restore this in %rdi + epilogue.
   *   0x1e37d7            tail-jmp HGObject::operator delete(void*).
   */
  destroy_D0_deletingDtor(): void {
    // @0x1e37c9 — chain base dtor.
    Hgc2LensGDC_BC_D2_dtor(this);
    // @0x1e37d7 — tail-jmp HGObject-scoped operator delete.
    HGObject_operator_delete(this);
  }

  /**
   * `HGLensGDC_BC::GetDOD(HGRenderer*, int, HGRect)` — Helium node override
   * reporting the domain-of-definition of this node's output. Mangled
   * `__ZN12HGLensGDC_BC6GetDODEP10HGRendereri6HGRect` at @Helium 0x1e37e0.
   *
   * Signature (from the mangled name):
   *   HGRect GetDOD(this, HGRenderer* renderer, int renderMode, HGRect inRect);
   * Note the incoming `HGRect inRect` argument is passed but NEVER read by
   * this body (no load from the argument slot appears in the disasm) — the
   * output is purely a function of `(renderer, this, renderMode)`.
   *
   * Semantic (decoded):
   *   if (renderMode != 0) return HGRectNull;
   *   else                 return renderer->GetDOD(renderer->GetInput(this, 0));
   *
   * Address-by-address:
   *   0x1e37e0  testl %edx, %edx     ; edx = renderMode (arg2, int)
   *   0x1e37e2  je    0x1e37f3       ; renderMode==0 -> pass-through branch
   *   0x1e37e4..0x1e37f2 short branch: load HGRectNull's two 8B halves into
   *                     {%rax, %rdx} and retq — System V "16B struct in
   *                     %rax:%rdx" return.
   *   0x1e37f3..0x1e37f8  prologue for the pass-through branch.
   *   0x1e37f9..0x1e3805  set up args for GetInput: %rdi=renderer, %rsi=this,
   *                        %edx=0.
   *   0x1e3807            callq HGRenderer::GetInput(HGNode*, int).
   *   0x1e380c..0x1e3817  set up tail-jmp args: %rdi=renderer, %rsi=input,
   *                        then epilogue.
   *   0x1e3818            jmp HGRenderer::GetDOD(HGNode*). The tail-jmp
   *                        forwards the 16B struct return in {%rax, %rdx}
   *                        directly to our caller.
   */
  GetDOD(
    renderer: HGRenderer,
    renderMode: number,
    _inRect: HGRect
  ): HGRect {
    // @0x1e37e0..0x1e37e2 — if renderMode != 0 return HGRectNull.
    // Note: `_inRect` is intentionally unread — it is passed to us on the
    // stack per the mangled ABI but the disasm never accesses its slot.
    // Preserving the parameter keeps the JS signature faithful to the C++.
    if ((renderMode | 0) !== 0) {
      // @0x1e37e4..0x1e37f2 — return &HGRectNull's contents.
      // We shallow-copy the canonical HGRectNull from HGRect.ts (which is
      // the same _HGRectNull data symbol at Helium 0x3d2284) so that
      // callers who mutate the returned struct do not clobber the singleton.
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }

    // @0x1e37f3..0x1e3807 — input = renderer.GetInput(this, 0).
    const input = HGRenderer_GetInput(renderer, this, 0);

    // @0x1e380c..0x1e3818 — tail-jmp renderer.GetDOD(input).
    return HGRenderer_GetDOD(renderer, input);
  }
}
