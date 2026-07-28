// HGCPixelFormatConversion_kV4S_WXYZ_input.ts — Helium HGC node that wraps the base
// HgcPixelFormatConversion_kV4S_WXYZ_input (lowercase-`g`) as its C++ subobject and forwards
// bounds queries verbatim, contributing only the standard HGCNode-style stateless behavior:
// input-index guard (only channel 0 has valid ROI/DOD; all others return HGRectNull) and the
// classical two-step DOD resolution (fetch the input node, then ask HGRenderer for its DOD).
// Transcribed from FCP Helium framework (Final Cut Pro.app/.../Helium).
//
// DECODE:
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4S_WXYZ_input.GetROI.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4S_WXYZ_input.GetDOD.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4S_WXYZ_input.D0.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4S_WXYZ_input.D1.s
//
// Struct layout (from field reads across the four methods):
//   +0x00  vtable*      (implied — the class is a virtual override of a base class; the
//                        specific vtable install site is in the ctor, which is NOT exported at
//                        this symbol prefix — only D0/D1/GetDOD/GetROI live here. The ctor is
//                        emitted inline at every construction site (typical for stateless HGC
//                        nodes) and is not listed in this port's frontier.)
//   base HgcPixelFormatConversion_kV4S_WXYZ_input fields inherited (owned by base D2 dtor at
//        Helium 0x0f4d95).
// No derived owning members: the D1 body is a bare tail-jmp to the base D2 dtor, and D0 is
// base-D2 + operator delete — the same shape as every other HGCNode leaf in Helium.
//
// Frontier callees (un-decoded in this file; ports live elsewhere):
//   __ZN40HgcPixelFormatConversion_kV4S_WXYZ_inputD2Ev  (base D2 — un-decoded here)
//   __ZN8HGObjectdlEPv     (HGObject::operator delete — Helium's typed operator delete)
//   __ZN10HGRenderer8GetInputEP6HGNodei   (HGRenderer::GetInput(HGNode*, int))
//   __ZN10HGRenderer6GetDODEP6HGNode      (HGRenderer::GetDOD(HGNode*))
// _HGRectNull is a Helium data-const, already exported from raw-port/src/render/HGRect.ts.

import { type HGRect, HGRectNull } from "./HGRect";

/** HGRenderer* / HGNode* placeholders — the concrete classes live elsewhere. Both are ObjC-
 *  agnostic Helium C++ objects; ports of them are separate tasks. */
export type HGRendererLike = {
  /** @frontier __ZN10HGRenderer8GetInputEP6HGNodei — HGRenderer::GetInput(HGNode*, int). */
  GetInput(node: HGNodeLike, index: number): HGNodeLike;
  /** @frontier __ZN10HGRenderer6GetDODEP6HGNode — HGRenderer::GetDOD(HGNode*). */
  GetDOD(node: HGNodeLike): HGRect;
};
export type HGNodeLike = unknown;

/** Base class placeholder. The four exported symbols on this derived class ALL delegate at
 *  least once into an "un-decoded" base surface (D2 dtor) — we model the base as an empty
 *  class so the derived transcription can land without waiting on the base port.
 *  @frontier __ZN40HgcPixelFormatConversion_kV4S_WXYZ_input… (base ctor/vtable/D2 — un-decoded). */
export class HgcPixelFormatConversion_kV4S_WXYZ_input {
  /** @Helium 0x0f4d95 target of the tail-jmp in the derived D1 dtor at 0x0f4d95, and of the
   *  regular call in D0 at 0x0f4da9. Body not decoded here — this class has no observable
   *  fields at this port level, so the empty dtor is a safe stub. */
  destroy_base(): void {
    // 0x0f4d95 / 0x0f4da9 — target address. Actual body un-decoded (frontier).
  }
}

export class HGCPixelFormatConversion_kV4S_WXYZ_input extends HgcPixelFormatConversion_kV4S_WXYZ_input {
  /**
   * HGCPixelFormatConversion_kV4S_WXYZ_input::GetROI(HGRenderer* r, int inputIdx, HGRect roi) → HGRect
   * @Helium 0x00000000000f4e00
   *   (__ZN40HGCPixelFormatConversion_kV4S_WXYZ_input6GetROIEP10HGRendereri6HGRect)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4S_WXYZ_input.GetROI.s):
   *   0x0f4e00   movq %rcx, %rax                — the CMTime-style rvalue-return path: rcx holds
   *                                               the upper 8 bytes of the incoming HGRect struct
   *                                               (passed by value across two 64-bit regs — rdx
   *                                               = low half {x,y}, r8 = high half {right,bottom}
   *                                               after the movq at 0x0f4e1a); rax will hold the
   *                                               same low half for return.
   *                                               NOTE: Itanium ABI passes HGRect (16 bytes) as
   *                                               two 64-bit regs; the calling convention here
   *                                               shuffles them.
   *   0x0f4e03-0x0f4e05  testl %edx, %edx ; je 0x0f4e1a
   *                                              — actually %edx is the INTEGER `inputIdx` arg
   *                                                (arg2 = %esi, arg3 = %edx). Wait — this is a
   *                                                CONST-`this` method with signature
   *                                                (HGRenderer*, int, HGRect) — Itanium says:
   *                                                  rdi = this
   *                                                  rsi = HGRenderer*
   *                                                  edx = int inputIdx
   *                                                  rcx / r8 = HGRect roi (16 bytes in 2 regs)
   *                                                So testl %edx,%edx = "if inputIdx != 0 fall
   *                                                through into HGRectNull load; else jump to
   *                                                the return-roi-verbatim path".
   *   0x0f4e05   je 0x0f4e1a                    — if inputIdx == 0: `movq %r8, %rdx ; retq` —
   *                                               return `roi` unchanged (identity ROI for the
   *                                               single valid input channel).
   *   0x0f4e07-0x0f4e15  Otherwise: load _HGRectNull (16 bytes: rax=low, r8=high) via
   *                      `leaq _HGRectNull(%rip), %rcx ; movq (%rcx), %rax ; movq 0x8(%rcx),%r8`
   *   0x0f4e1a           movq %r8, %rdx ; retq  — return the loaded HGRectNull as {rax, rdx}.
   *
   * Semantics: for inputIdx == 0 the ROI is the caller's `roi` verbatim (this node doesn't
   * mutate the region of interest for its one real input); for any other inputIdx (the node
   * has no other real inputs) return HGRectNull to signal "no data needed".
   */
  GetROI(_renderer: HGRendererLike, inputIdx: number, roi: HGRect): HGRect {
    // 0x0f4e03-0x0f4e05 — the identity path.
    if (inputIdx === 0) {
      // 0x0f4e1a — return roi unchanged.
      return roi;
    }
    // 0x0f4e07-0x0f4e15 — non-real input: HGRectNull.
    return HGRectNull;
  }

  /**
   * HGCPixelFormatConversion_kV4S_WXYZ_input::GetDOD(HGRenderer* r, int inputIdx, HGRect dod) → HGRect
   * @Helium 0x00000000000f4dc0
   *   (__ZN40HGCPixelFormatConversion_kV4S_WXYZ_input6GetDODEP10HGRendereri6HGRect)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4S_WXYZ_input.GetDOD.s):
   *   0x0f4dc0   testl %edx, %edx ; je 0x0f4dd3  — if inputIdx == 0, jump to the "ask the input
   *                                                node" path; else fall through into HGRectNull.
   *   0x0f4dc4-0x0f4dd2  leaq _HGRectNull(%rip),%rcx ; movq (%rcx),%rax ; movq 0x8(%rcx),%rdx ;
   *                      retq — return HGRectNull as {rax, rdx}.
   *   0x0f4dd3-0x0f4df8  The "GetInput -> GetDOD" chain for inputIdx == 0:
   *     - Save (rdi=this) into rax; rdi = rsi (HGRenderer*); rsi = original this (as HGNode*);
   *       edx = 0 (input index).
   *     - callq HGRenderer::GetInput(this-as-HGNode, 0). Result rax = HGNode* upstream node.
   *     - rdi = rsi (HGRenderer*, restored from rbx); rsi = rax (upstream node).
   *     - jmp HGRenderer::GetDOD(upstream_node) — tail-call, its return becomes ours.
   *
   * Semantics: our DOD for input 0 is our upstream input's DOD (this class doesn't affect the
   * domain of definition); any other input is HGRectNull.
   */
  GetDOD(renderer: HGRendererLike, inputIdx: number, _dod: HGRect): HGRect {
    // 0x0f4dc0-0x0f4dc2 — guard.
    if (inputIdx !== 0) {
      // 0x0f4dc4-0x0f4dd2 — HGRectNull.
      return HGRectNull;
    }
    // 0x0f4dd3-0x0f4de7 — GetInput(this-as-HGNode, 0).
    const upstream = renderer.GetInput(this as unknown as HGNodeLike, 0);
    // 0x0f4df8 — tail-call GetDOD(upstream).
    return renderer.GetDOD(upstream);
  }

  /**
   * HGCPixelFormatConversion_kV4S_WXYZ_input::~()  [D1 — complete-object dtor, no delete]
   * @Helium 0x00000000000f4d90  (__ZN40HGCPixelFormatConversion_kV4S_WXYZ_inputD1Ev)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4S_WXYZ_input.D1.s):
   *   0x0f4d95   jmp __ZN40HgcPixelFormatConversion_kV4S_WXYZ_inputD2Ev  — tail-call base D2.
   *              No derived owning members; the class contributes zero cleanup.
   */
  destroy_D1(): void {
    // 0x0f4d95 — tail-call base D2.
    this.destroy_base();
  }

  /**
   * HGCPixelFormatConversion_kV4S_WXYZ_input::~()  [D0 — deleting dtor]
   * @Helium 0x00000000000f4da0  (__ZN40HGCPixelFormatConversion_kV4S_WXYZ_inputD0Ev)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4S_WXYZ_input.D0.s):
   *   0x0f4da9   callq __ZN40HgcPixelFormatConversion_kV4S_WXYZ_inputD2Ev  — base D2.
   *   0x0f4db7   jmp   __ZN8HGObjectdlEPv                               — HGObject::operator delete.
   *   Equivalent to D1 + HGObject-typed operator delete.
   */
  destroy_D0(): void {
    // 0x0f4da9 — base D2.
    this.destroy_D1();
    // 0x0f4db7 — HGObject::operator delete: no analogue in TS/GC. Frontier __ZN8HGObjectdlEPv.
  }
}
