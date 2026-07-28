// HGCPixelFormatConversion_kV4B_WXYZ_input.ts — Helium's runtime node for a
// V4B → WXYZ pixel-format INPUT-side conversion.
//
// "HGC" (Helium Graphics Component) classes follow the standard Helium filter
// node vtable: they override GetDOD (domain of definition), GetROI (region of
// interest), and two destructors (D1 base-object / D0 deleting). The heavy
// per-pixel conversion math lives in the base HgcPixelFormatConversion_kV4B_
// WXYZ_input class — this HGC subclass only supplies the render-graph
// bookkeeping (rectangle math).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice).
// Disassembly saved in raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B_WXYZ_input.*.s
//
// nm's four externally-visible entry points at addresses assigned by the
// build:
//   0x00000000000f4d00 T HGCPixelFormatConversion_kV4B_WXYZ_input::~HGCPixelFormatConversion_kV4B_WXYZ_input() (D1)
//   0x00000000000f4d10 T HGCPixelFormatConversion_kV4B_WXYZ_input::~HGCPixelFormatConversion_kV4B_WXYZ_input() (D0)
//   0x00000000000f4d30 T HGCPixelFormatConversion_kV4B_WXYZ_input::GetDOD(HGRenderer*, int, HGRect)
//   0x00000000000f4d70 T HGCPixelFormatConversion_kV4B_WXYZ_input::GetROI(HGRenderer*, int, HGRect)
//
// The D1 (@0xf4d00) entry point is not separately disassembled by objdump in
// this build slice — it is co-located/aliased with the D0 body's initial
// bytes (Itanium ABI dtor thunk pattern where D1 tail-calls the base D2).
// That address is documented but no separate body is transcribed for it here;
// the D0 (@0xf4d10) body IS transcribed and IS the observable behaviour.
//
// ---------------------------------------------------------------------------
// Cited callees / RIP constants:
//   HgcPixelFormatConversion_kV4B_WXYZ_input::~HgcPixelFormatConversion_kV4B_WXYZ_input()
//                                    @Helium __ZN40HgcPixelFormatConversion_kV4B_WXYZ_inputD2Ev
//                                    (base-object dtor) — called from D0 @0xf4d19.
//   HGObject::operator delete(void*) @Helium __ZN8HGObjectdlEPv
//                                    — tail-jumped from D0 @0xf4d27.
//   HGRenderer::GetInput(HGNode*, int) @Helium __ZN10HGRenderer8GetInputEP6HGNodei
//                                    — called from GetDOD @0xf4d57.
//   HGRenderer::GetDOD(HGNode*)       @Helium __ZN10HGRenderer6GetDODEP6HGNode
//                                    — tail-jumped from GetDOD @0xf4d68.
//   _HGRectNull                       @Helium literal-pool (canonical
//                                    Helium _HGRectNull @0x3d2284 = {0,0,0,0}).
//                                    Loaded @0xf4d34 (GetDOD) and @0xf4d7b (GetROI).
//
// ---------------------------------------------------------------------------
// Method semantics (both are pure rectangle bookkeeping; NO floats):
//
// GetDOD(renderer, which, r):
//   which == 0 → return HGRenderer::GetDOD( HGRenderer::GetInput(renderer, this, 0) )
//                i.e. the DOD of the sole input slot 0.
//   which != 0 → return HGRectNull.
//
// GetROI(renderer, which, requested):
//   which == 0 → return `requested` unchanged (this filter needs the exact
//                requested region on its single input).
//   which != 0 → return HGRectNull.
//
// The two branches in GetDOD/GetROI mirror each other with OPPOSITE test-
// direction: GetDOD uses `je delegate` (jump when equal → pass-through path
// is the ZERO branch), while GetROI uses `je return_input` (jump when equal
// → pass-through path is the ZERO branch), and both use the fall-through as
// the "HGRectNull" branch. Reading the disasm carefully:
//
//   GetDOD @0xf4d30: `testl %edx,%edx ; je 0xf4d43`  — which==0 jumps to
//   the delegation path at 0xf4d43. The fall-through @0xf4d34-@0xf4d42 loads
//   HGRectNull and returns.
//
//   GetROI @0xf4d70: `testl %edx,%edx ; je 0xf4d8a`  — which==0 jumps to
//   the final movq/retq @0xf4d8a-@0xf4d8d that returns rax:rdx unchanged
//   (rax=requested.lo from entry `movq %rcx,%rax`, rdx=r8=requested.hi).
//   The fall-through @0xf4d77-@0xf4d89 loads HGRectNull into rax:r8 first.

import {
  HGRect,
  HGRectNull as HGRectNullConst,
} from "./HGRect.js";
export { HGRect };

// ---------------------------------------------------------------------------
// Structural types (opaque — real layouts live in base frameworks).
// ---------------------------------------------------------------------------

/** HGNode — an opaque render-graph node handle. `this` is an HGNode subclass. */
export interface HGNode {}

/** HGRenderer — the render context / dependency-tracker passed to every
 * vfn on a render node. Layout undecoded. */
export interface HGRenderer {}

// ---------------------------------------------------------------------------
// Constants read from Helium's literal pool.
// ---------------------------------------------------------------------------

/** _HGRectNull — the global sentinel HGRect (canonical Helium _HGRectNull
 * @0x3d2284 = {0,0,0,0}). Loaded via `leaq _HGRectNull(%rip),%rcx` at
 * @0xf4d34 (GetDOD) and @0xf4d7b (GetROI). */
export const HGRectNull: HGRect = HGRectNullConst;

// ---------------------------------------------------------------------------
// Undecoded external helpers — each throws with its Helium address so
// frontier.py can list them as gaps.
// ---------------------------------------------------------------------------

/** HGRenderer::GetInput(HGNode*, int) — @Helium __ZN10HGRenderer8GetInputEP6HGNodei
 * (call site @0xf4d57 in GetDOD, with edx=0). Returns the input HGNode at
 * the given slot, or nullptr if none. Not yet transcribed. */
export function HGRenderer_GetInput(_r: HGRenderer, _self: HGCPixelFormatConversion_kV4B_WXYZ_input, _slot: number): HGNode | null {
  throw new Error("HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei not yet transcribed @0xf4d57");
}

/** HGRenderer::GetDOD(HGNode*) — @Helium __ZN10HGRenderer6GetDODEP6HGNode
 * (tail-jumped from GetDOD @0xf4d68). Returns the child node's
 * domain-of-definition rectangle. Not yet transcribed. */
export function HGRenderer_GetDOD(_r: HGRenderer, _node: HGNode | null): HGRect {
  throw new Error("HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode not yet transcribed @0xf4d68");
}

/** HgcPixelFormatConversion_kV4B_WXYZ_input::~HgcPixelFormatConversion_kV4B_WXYZ_input()
 * — base-class destructor (D2). Called from D0 @0xf4d19. Not yet transcribed. */
export function HgcPixelFormatConversion_kV4B_WXYZ_input_dtor(_self: HGCPixelFormatConversion_kV4B_WXYZ_input): void {
  throw new Error("HgcPixelFormatConversion_kV4B_WXYZ_input::~HgcPixelFormatConversion_kV4B_WXYZ_input @Helium __ZN40HgcPixelFormatConversion_kV4B_WXYZ_inputD2Ev not yet transcribed @0xf4d19");
}

/** HGObject::operator delete(void*) — @Helium __ZN8HGObjectdlEPv
 * (tail-jumped from D0 @0xf4d27). Not yet transcribed. */
export function HGObject_operatorDelete(_p: HGCPixelFormatConversion_kV4B_WXYZ_input): void {
  throw new Error("HGObject::operator delete @Helium __ZN8HGObjectdlEPv not yet transcribed @0xf4d27");
}

// ---------------------------------------------------------------------------
// HGCPixelFormatConversion_kV4B_WXYZ_input — the class itself.
// Inherits from HgcPixelFormatConversion_kV4B_WXYZ_input (base layout undecoded here).
// ---------------------------------------------------------------------------

export class HGCPixelFormatConversion_kV4B_WXYZ_input {
  /**
   * HGCPixelFormatConversion_kV4B_WXYZ_input::~HGCPixelFormatConversion_kV4B_WXYZ_input()
   * (D0, deleting) @0xf4d10 — __ZN40HGCPixelFormatConversion_kV4B_WXYZ_inputD0Ev.
   *
   * Faithful transcription:
   *   @0xf4d10  pushq %rbp
   *   @0xf4d11  movq  %rsp, %rbp
   *   @0xf4d14  pushq %rbx
   *   @0xf4d15  pushq %rax
   *   @0xf4d16  movq  %rdi, %rbx                ; save this
   *   @0xf4d19  callq HgcPixelFormatConversion_kV4B_WXYZ_input::~HgcPixelFormatConversion_kV4B_WXYZ_input()   ; base dtor(this)
   *   @0xf4d1e  movq  %rbx, %rdi                ; restore this into rdi
   *   @0xf4d21  addq  $0x8, %rsp
   *   @0xf4d25  popq  %rbx
   *   @0xf4d26  popq  %rbp
   *   @0xf4d27  jmp   HGObject::operator delete ; tail-call, deletes `this`
   *
   * The corresponding D1 (base-object dtor) at @0xf4d00 is not separately
   * disassembled by objdump in this build slice (ICF/alias with the D2 base
   * dtor path); its address is documented here but no separate body is
   * transcribed. In JS this destructor sequence is only meaningful as
   * documentation of the C++ call chain — the JS runtime owns storage.
   */
  destroyAndDelete(): void {
    // @0xf4d19  callq HgcPixelFormatConversion_kV4B_WXYZ_input::~HgcPixelFormatConversion_kV4B_WXYZ_input()
    HgcPixelFormatConversion_kV4B_WXYZ_input_dtor(this);
    // @0xf4d27  jmp HGObject::operator delete
    HGObject_operatorDelete(this);
  }

  /**
   * HGCPixelFormatConversion_kV4B_WXYZ_input::GetDOD(HGRenderer*, int, HGRect)
   * @0xf4d30 — __ZN40HGCPixelFormatConversion_kV4B_WXYZ_input6GetDODEP10HGRendereri6HGRect
   *
   * Faithful transcription:
   *   @0xf4d30  testl %edx, %edx                  ; test `which`
   *   @0xf4d32  je    0xf4d43                     ; which == 0 → delegation
   *   @0xf4d34  leaq  _HGRectNull(%rip), %rcx     ; else: rcx = &HGRectNull
   *   @0xf4d3b  movq  (%rcx), %rax                ; rax = HGRectNull.lo (=0)
   *   @0xf4d3e  movq  0x8(%rcx), %rdx             ; rdx = HGRectNull.hi (=0)
   *   @0xf4d42  retq                              ; return HGRectNull
   *
   * 0xf4d43 (which == 0, delegation path):
   *   @0xf4d43  pushq %rbp
   *   @0xf4d44  movq  %rsp, %rbp
   *   @0xf4d47  pushq %rbx
   *   @0xf4d48  pushq %rax
   *   @0xf4d49  movq  %rdi, %rax                  ; rax = this
   *   @0xf4d4c  movq  %rsi, %rdi                  ; rdi = renderer  (arg0 of GetInput)
   *   @0xf4d4f  movq  %rsi, %rbx                  ; rbx = renderer  (saved for after call)
   *   @0xf4d52  movq  %rax, %rsi                  ; rsi = this      (arg1 of GetInput)
   *   @0xf4d55  xorl  %edx, %edx                  ; edx = 0         (arg2 slot=0)
   *   @0xf4d57  callq HGRenderer::GetInput(HGNode*, int)   ; rax = input node
   *   @0xf4d5c  movq  %rbx, %rdi                  ; rdi = renderer  (arg0 of GetDOD)
   *   @0xf4d5f  movq  %rax, %rsi                  ; rsi = input     (arg1 of GetDOD)
   *   @0xf4d62  addq  $0x8, %rsp
   *   @0xf4d66  popq  %rbx
   *   @0xf4d67  popq  %rbp
   *   @0xf4d68  jmp   HGRenderer::GetDOD(HGNode*)  ; tail-call; return its rect
   *
   * Semantics:
   *   which == 0 → return renderer.GetDOD( renderer.GetInput(this, 0) )
   *   which != 0 → return HGRectNull
   *
   * The register-shuffle at @0xf4d49-@0xf4d55 rebinds the C++ call args:
   * this-method's (this=rdi, renderer=rsi) become GetInput's (renderer=rdi,
   * self=rsi, slot=edx=0). Then after the call, the saved renderer (rbx) is
   * re-loaded for the outer GetDOD tail-call whose args are (renderer=rdi,
   * inputNode=rsi).
   *
   * @param renderer  HGRenderer* (rsi) — the render context.
   * @param which     int         (edx) — which output; only 0 is meaningful.
   * @param _r        HGRect      (rdx:rcx by value) — UNREAD by this method
   *                                                   (edx is used as the int
   *                                                   arg BEFORE any HGRect
   *                                                   lo/hi is touched — the
   *                                                   int and the by-value
   *                                                   struct simply don't
   *                                                   overlap in the SysV ABI
   *                                                   for this signature).
   */
  GetDOD(renderer: HGRenderer, which: number, _r: HGRect): HGRect {
    // Force i32 semantics on the `which` selector (asm: testl %edx,%edx).
    const edx = which | 0;
    // @0xf4d30-0xf4d32  testl %edx,%edx ; je 0xf4d43
    if (edx !== 0) {
      // @0xf4d34-@0xf4d42: fall-through → return HGRectNull.
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xf4d43-@0xf4d68: delegation path (which == 0).
    // @0xf4d57  callq HGRenderer::GetInput(renderer, this, 0)
    const inputNode = HGRenderer_GetInput(renderer, this, 0);
    // @0xf4d68  jmp   HGRenderer::GetDOD(renderer, inputNode)
    return HGRenderer_GetDOD(renderer, inputNode);
  }

  /**
   * HGCPixelFormatConversion_kV4B_WXYZ_input::GetROI(HGRenderer*, int, HGRect)
   * @0xf4d70 — __ZN40HGCPixelFormatConversion_kV4B_WXYZ_input6GetROIEP10HGRendereri6HGRect
   *
   * Faithful transcription:
   *   @0xf4d70  movq  %rcx, %rax                  ; rax = requested.lo
   *   @0xf4d73  testl %edx, %edx                  ; test `which`
   *   @0xf4d75  je    0xf4d8a                     ; which == 0 → passthrough
   *   @0xf4d77  pushq %rbp
   *   @0xf4d78  movq  %rsp, %rbp
   *   @0xf4d7b  leaq  _HGRectNull(%rip), %rcx     ; rcx = &HGRectNull
   *   @0xf4d82  movq  (%rcx), %rax                ; rax = HGRectNull.lo
   *   @0xf4d85  movq  0x8(%rcx), %r8              ; r8  = HGRectNull.hi
   *   @0xf4d89  popq  %rbp
   *   @0xf4d8a  movq  %r8, %rdx                   ; rdx = r8
   *   @0xf4d8d  retq
   *
   * Semantics:
   *   which == 0 → r8 already holds requested.hi (SysV ABI, HGRect by-value in
   *                rcx:r8), and rax was set to requested.lo at entry.
   *                Return {rax=requested.lo, rdx=r8=requested.hi} = requested.
   *   which != 0 → HGRectNull is loaded into rax:r8, then r8→rdx and return.
   *
   * @param _renderer  HGRenderer* (rsi) — UNREAD by this method.
   * @param which      int         (edx) — the input slot.
   * @param requested  HGRect      (rcx:r8 by value) — the caller's requested
   *                                                  ROI, returned as-is when
   *                                                  which == 0.
   */
  GetROI(_renderer: HGRenderer, which: number, requested: HGRect): HGRect {
    // Force i32 semantics on `which` (asm: testl %edx,%edx).
    const edx = which | 0;
    // @0xf4d73-@0xf4d75  testl %edx,%edx ; je 0xf4d8a
    if (edx !== 0) {
      // @0xf4d77-@0xf4d89: load HGRectNull into rax:r8 → return HGRectNull.
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xf4d8a-@0xf4d8d: passthrough — return the caller's requested rect
    // (rax=rcx=requested.lo from entry, rdx=r8=requested.hi).
    return {
      x: requested.x | 0,
      y: requested.y | 0,
      right: requested.right | 0,
      bottom: requested.bottom | 0,
    };
  }
}
