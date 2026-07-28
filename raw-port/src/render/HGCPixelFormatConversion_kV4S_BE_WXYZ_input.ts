/**
 * HGCPixelFormatConversion_kV4S_BE_WXYZ_input — Helium framework (render layer)
 *
 * A Helium render-graph node that represents the INPUT side of the pixel-format
 * conversion "kV4S_BE_WXYZ" (Video 4-Sample Big-Endian, WXYZ channel-order). It
 * is the counterpart returned by `HGBitmapLoader::m_GetPixelFormatConversion_
 * kV4S_BE_WXYZ_InputNode()` (see nm entry at @Helium 0xea514). The class holds
 * no state of its own — it defers all its work to the sibling implementation
 * class `HgcPixelFormatConversion_kV4S_BE_WXYZ_input` (lowercase `gc`, seen in
 * D0's tail-called D2 dtor and in nm's separate symbol set @0x2ff57c..0x2ffe9c).
 *
 * FOUR SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
 *   @Helium 0xf4eb0  HGCPixelFormatConversion_kV4S_BE_WXYZ_input::~...()  [D1 base dtor]
 *                    ICF-folded with other trivial no-op dtors — decodes as an
 *                    empty destructor that just returns (nm: __ZN..D1Ev @0xea968).
 *   @Helium 0xf4ec0  HGCPixelFormatConversion_kV4S_BE_WXYZ_input::~...()  [D0 deleting dtor]
 *   @Helium 0xf4ee0  HGCPixelFormatConversion_kV4S_BE_WXYZ_input::GetDOD(HGRenderer*, int, HGRect)
 *   @Helium 0xf4f20  HGCPixelFormatConversion_kV4S_BE_WXYZ_input::GetROI(HGRenderer*, int, HGRect)
 *
 * Callees / RIP-relative constants cited:
 *   __ZN10HGRenderer8GetInputEP6HGNodei          — HGRenderer::GetInput(HGNode*, int)   @0xf4f07
 *   __ZN10HGRenderer6GetDODEP6HGNode             — HGRenderer::GetDOD(HGNode*)          @0xf4f18 (tail)
 *   __ZN43HgcPixelFormatConversion_kV4S_BE_WXYZ_inputD2Ev  — sibling-class D2 dtor      @0xf4ec9
 *   __ZN8HGObjectdlEPv                            — HGObject::operator delete(void*)    @0xf4ed7 (tail)
 *   _HGRectNull                                   — the 16 zero bytes read RIP-relative  @0xf4ee4 & @0xf4f2b
 *
 * All four methods except GetDOD are trivial thunks; GetDOD does a single conditional
 * "if plane index != 0 -> return HGRectNull; else -> forward to renderer->GetDOD(
 * renderer->GetInput(this, 0))" (fp32-narrowed integer semantics on `int` arg).
 */

import { HGRect, HGRectNull } from "./HGRect";

/** Forward decl — HGRenderer isn't ported yet; keep as opaque handle with the two
 *  methods this file relies on. Each returns/consumes plain values transcribed
 *  from the ABI. */
export interface HGRenderer {
  /** @Helium __ZN10HGRenderer8GetInputEP6HGNodei — returns the source HGNode for
   *  the given plane index of `node`. External Helium method; contract only. */
  GetInput(node: HGCPixelFormatConversion_kV4S_BE_WXYZ_input | null, planeIdx: number): unknown;
  /** @Helium __ZN10HGRenderer6GetDODEP6HGNode — returns the domain-of-definition of
   *  the given `HGNode` (by value in (rax, rdx) per ABI). External Helium method. */
  GetDOD(node: unknown): HGRect;
}

/** Sibling implementation class — its D2 dtor is called by our D0. Not yet ported.
 *  Throwing stub cites its symbol. */
function HgcPixelFormatConversion_kV4S_BE_WXYZ_input_D2(_this: unknown): void {
  // @Helium 0xf4ec9 callq __ZN43HgcPixelFormatConversion_kV4S_BE_WXYZ_inputD2Ev — not yet transcribed at @0x2ffdd8
  throw new Error("HgcPixelFormatConversion_kV4S_BE_WXYZ_input::~...() D2 dtor not yet transcribed @Helium 0x2ffdd8");
}

/** External free-list — HGObject's global operator delete. Not yet ported.
 *  Throwing stub cites its symbol. */
function HGObject_operator_delete(_p: unknown): void {
  // @Helium 0xf4ed7 jmp __ZN8HGObjectdlEPv — not yet transcribed at @Helium (external)
  throw new Error("HGObject::operator delete(void*) callee @Helium 0xf4ed7 (external __ZN8HGObjectdlEPv)");
}

export class HGCPixelFormatConversion_kV4S_BE_WXYZ_input {
  /**
   * @Helium 0xf4eb0  __ZN43HGCPixelFormatConversion_kV4S_BE_WXYZ_inputD1Ev
   *
   * Base (non-deleting) destructor. ICF-folded with other trivial no-op dtors
   * in the binary (nm exposes it at 0xea968 with size <= 4 bytes, sitting
   * immediately before D0 at 0xea96c). Faithfully modelled as an empty
   * destructor — nothing to release on this object; the sibling
   * `HgcPixelFormatConversion_kV4S_BE_WXYZ_input` (invoked in D0 below) owns
   * the real resources. This class carries no fields of its own that require
   * cleanup here.
   */
  destroy_base(): void {
    // no body (ICF-folded to a trivial return)
    return;
  }

  /**
   * @Helium 0xf4ec0  __ZN43HGCPixelFormatConversion_kV4S_BE_WXYZ_inputD0Ev
   *
   * Deleting destructor. Faithful transcription of:
   *   0xf4ec0 pushq %rbp / movq %rsp,%rbp
   *   0xf4ec4 pushq %rbx
   *   0xf4ec5 pushq %rax                    ; align
   *   0xf4ec6 movq  %rdi, %rbx              ; save this
   *   0xf4ec9 callq __ZN43HgcPixelFormatConversion_kV4S_BE_WXYZ_inputD2Ev(this)
   *   0xf4ece movq  %rbx, %rdi              ; restore this arg for op delete
   *   0xf4ed1 addq  $0x8, %rsp
   *   0xf4ed5 popq  %rbx
   *   0xf4ed6 popq  %rbp
   *   0xf4ed7 jmp   __ZN8HGObjectdlEPv       ; tail-call HGObject::operator delete
   *
   * Note: the D0 invokes the D2 (complete-object) dtor of the LOWERCASE-gc
   * sibling class — not of itself. This is unusual but matches the raw asm
   * bytes: the object pointer `this` is passed directly to
   * `HgcPixelFormatConversion_kV4S_BE_WXYZ_input::~...()` (D2). This suggests
   * the two classes share a compatible object layout (likely one derives from
   * the other, or they're multi-typed views of the same allocation).
   */
  destroy_deleting(): void {
    HgcPixelFormatConversion_kV4S_BE_WXYZ_input_D2(this); // @0xf4ec9
    HGObject_operator_delete(this);                       // @0xf4ed7 (tail-call)
  }

  /**
   * @Helium 0xf4ee0  __ZN43HGCPixelFormatConversion_kV4S_BE_WXYZ_input6GetDODEP10HGRendereri6HGRect
   *
   * Faithful transcription of the 24-line asm:
   *   0xf4ee0 testl %edx, %edx              ; test plane-index (int arg)
   *   0xf4ee2 je    0xf4ef3                 ; if planeIdx == 0 → forward path
   *   0xf4ee4 leaq  _HGRectNull(%rip), %rcx ; else load &HGRectNull
   *   0xf4eeb movq  (%rcx), %rax            ;   rax = low  8B of HGRectNull
   *   0xf4eee movq  0x8(%rcx), %rdx         ;   rdx = high 8B of HGRectNull
   *   0xf4ef2 retq                          ;   return HGRectNull
   *   -- planeIdx == 0 branch (@0xf4ef3) --
   *   0xf4ef3 pushq %rbp / movq %rsp,%rbp   ; frame
   *   0xf4ef7 pushq %rbx / pushq %rax       ; save + align
   *   0xf4ef9 movq  %rdi, %rax              ; rax = this  (arg1)
   *   0xf4efc movq  %rsi, %rdi              ; rdi = renderer (arg2)  → becomes GetInput's `this`
   *   0xf4eff movq  %rsi, %rbx              ; rbx = renderer (saved)
   *   0xf4f02 movq  %rax, %rsi              ; rsi = original this  → becomes GetInput's `node`
   *   0xf4f05 xorl  %edx, %edx              ; edx = 0     → planeIdx=0 for GetInput
   *   0xf4f07 callq HGRenderer::GetInput(node=this, planeIdx=0)  → returns HGNode* in rax
   *   0xf4f0c movq  %rbx, %rdi              ; rdi = renderer  → GetDOD's `this`
   *   0xf4f0f movq  %rax, %rsi              ; rsi = returned input node
   *   0xf4f12 addq  $0x8,%rsp / popq %rbx / popq %rbp
   *   0xf4f18 jmp   HGRenderer::GetDOD(node)  ; tail — returns HGRect in (rax, rdx)
   *
   * Reduced semantics:
   *   if (planeIdx != 0) return HGRectNull;
   *   return renderer.GetDOD(renderer.GetInput(this, 0));
   *
   * The by-value HGRect argument (last arg) is passed but never referenced —
   * it lives in stack-tail regs the compiler chose to ignore.
   */
  GetDOD(renderer: HGRenderer | null, planeIdx: number, _r: HGRect): HGRect {
    // Force int32 semantics on planeIdx (asm: testl %edx,%edx).
    const edx = planeIdx | 0;
    if (edx !== 0) {
      // @0xf4ee4-0xf4ef2 — return HGRectNull by value
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }
    if (renderer === null) {
      // The asm unconditionally dereferences the renderer pointer here — a NULL
      // renderer would fault; mirror that as a throw.
      throw new Error("HGCPixelFormatConversion_kV4S_BE_WXYZ_input::GetDOD null renderer @Helium 0xf4f07");
    }
    // @0xf4f07 renderer->GetInput(this, 0)
    const inputNode = renderer.GetInput(this, 0);
    // @0xf4f18 tail-call renderer->GetDOD(inputNode)
    return renderer.GetDOD(inputNode);
  }

  /**
   * @Helium 0xf4f20  __ZN43HGCPixelFormatConversion_kV4S_BE_WXYZ_input6GetROIEP10HGRendereri6HGRect
   *
   * Faithful transcription of the 13-line asm:
   *   0xf4f20 movq  %rcx, %rax              ; rax = incoming HGRect low  8B (arg4 lo)
   *   0xf4f23 testl %edx, %edx              ; test plane-index (int arg)
   *   0xf4f25 je    0xf4f3a                 ; if planeIdx == 0 → skip override
   *   0xf4f27 pushq %rbp / movq %rsp,%rbp   ; else frame
   *   0xf4f2b leaq  _HGRectNull(%rip), %rcx ; load &HGRectNull
   *   0xf4f32 movq  (%rcx), %rax            ; rax = HGRectNull.lo   (overrides rax)
   *   0xf4f35 movq  0x8(%rcx), %r8          ; r8  = HGRectNull.hi
   *   0xf4f39 popq  %rbp                    ; restore
   *   0xf4f3a movq  %r8, %rdx               ; move HGRect hi into rdx (return-hi register)
   *   0xf4f3d retq                          ; return HGRect in (rax, rdx)
   *
   * NOTE: the second branch is subtle — when planeIdx == 0 there is NO frame
   * push, and neither `rax` nor `r8` are touched. That means:
   *   - `rax` still holds `rcx` (from 0xf4f20 movq %rcx,%rax), which is the
   *     LOW 8 bytes of the incoming HGRect argument (arg4-lo per SysV ABI).
   *   - `r8` still holds the HIGH 8 bytes of the incoming HGRect (arg4-hi).
   * So planeIdx==0 → return the incoming HGRect *unchanged* (ROI pass-through).
   *
   * Reduced semantics:
   *   if (planeIdx != 0) return HGRectNull;
   *   return incomingRect;
   *
   * The `renderer` arg is completely unused here.
   */
  GetROI(_renderer: HGRenderer | null, planeIdx: number, r: HGRect): HGRect {
    // Force int32 semantics on planeIdx (asm: testl %edx,%edx).
    const edx = planeIdx | 0;
    if (edx !== 0) {
      // @0xf4f2b-0xf4f39 — return HGRectNull by value
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }
    // @0xf4f20 / @0xf4f3a — return incoming HGRect unchanged
    return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
  }
}
