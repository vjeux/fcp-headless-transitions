// HGCPixelFormatConversion_kV4S_WXYZ_output.ts — Helium node for a
// "kV4S with WXYZ-channel-swizzled output" pixel-format conversion (the
// little-endian sibling of HGCPixelFormatConversion_kV4S_BE_WXYZ_output).
// Transcribed from the x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Method addresses (otool -tV):
//   @0x0fd260  ~HGCPixelFormatConversion_kV4S_WXYZ_output() [D1: tail-jmp to D2]
//   @0x0fd270  ~HGCPixelFormatConversion_kV4S_WXYZ_output() [D0: call D2, jmp HGObject::operator delete]
//   @0x0fd290  GetOutput(HGRenderer*)
//   @0x0fd2a0  GetDOD(HGRenderer*, int, HGRect)
//   @0x0fd2e0  GetROI(HGRenderer*, int, HGRect)
//
// Notes on the operation: "kV4S" is Helium's 4-single-precision-float
// pixel packet ("Vector 4 Singles"); "WXYZ" is the channel swizzle
// applied at the store (RGBA → WXYZ ≡ ARGB — left-rotation of the RGBA
// lane order). Same shape as the "BE_WXYZ" sibling — see that file for
// the shared per-pixel semantics discussion. From the render-graph
// perspective, this node is a pass-through: same DOD as its input, same
// ROI as the requested rect.
//
// Undecoded frontier (throwing stubs cite their callee addr):
//   HgcPixelFormatConversion_kV4S_WXYZ_output::~D2   @Helium
//       (tail-jmped by D1 @0xfd265; called by D0 @0xfd279)
//   HGRenderer::GetInput(HGNode*, int)               @Helium (@0xfd2c7)
//   HGRenderer::GetDOD(HGNode*)                      @Helium (@0xfd2d8 tail-jmp)
//   HGObject::operator delete(void*)                 @Helium (@0xfd287 tail-jmp)

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph node handle; layout not decoded here. */
export interface HGNode {}
/** HGRenderer — the render context passed to every vfn; layout undecoded. */
export interface HGRenderer {}

/** `_HGRectNull` — Helium __DATA_CONST sentinel; imported from HGRect.ts. */
const HGRectNull: HGRect = HGRectNullConst;

/**
 * HgcPixelFormatConversion_kV4S_WXYZ_output base D2 dtor.
 * @frontier Helium __ZN41HgcPixelFormatConversion_kV4S_WXYZ_outputD2Ev
 *   (cited: D1 @0xfd265 jmp; D0 @0xfd279 call)
 */
function HgcPixelFormatConversion_kV4S_WXYZ_output_D2(
  _self: HGCPixelFormatConversion_kV4S_WXYZ_output,
): void {
  throw new Error(
    "HgcPixelFormatConversion_kV4S_WXYZ_output base D2 dtor @Helium " +
    "__ZN41HgcPixelFormatConversion_kV4S_WXYZ_outputD2Ev not yet " +
    "transcribed (cited: D1 @0xfd265, D0 @0xfd279)",
  );
}

/** HGObject::operator delete — tail-jmp target @0xfd287.
 *  @frontier Helium __ZN8HGObjectdlEPv */
function HGObject_operatorDelete(
  _p: HGCPixelFormatConversion_kV4S_WXYZ_output,
): void {
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xfd287 " +
    "not yet transcribed",
  );
}

/** HGRenderer::GetInput(this, slot) — called from GetDOD @0xfd2c7 (slot=0).
 *  @frontier Helium __ZN10HGRenderer8GetInputEP6HGNodei */
function HGRenderer_GetInput(
  _r: HGRenderer,
  _self: HGCPixelFormatConversion_kV4S_WXYZ_output,
  _slot: number,
): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei " +
    "@0xfd2c7 not yet transcribed",
  );
}

/** HGRenderer::GetDOD(input) — tail-jmped from GetDOD @0xfd2d8.
 *  @frontier Helium __ZN10HGRenderer6GetDODEP6HGNode */
function HGRenderer_GetDOD(_r: HGRenderer, _n: HGNode | null): HGRect {
  throw new Error(
    "HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode " +
    "@0xfd2d8 not yet transcribed",
  );
}

export class HGCPixelFormatConversion_kV4S_WXYZ_output {
  /**
   * ~HGCPixelFormatConversion_kV4S_WXYZ_output() [D1 complete-object dtor] @0xfd260
   *
   *   @0xfd260  pushq %rbp
   *   @0xfd261  movq  %rsp, %rbp
   *   @0xfd264  popq  %rbp
   *   @0xfd265  jmp   HgcPixelFormatConversion_kV4S_WXYZ_output::~D2  ; TAIL-JMP
   */
  destroy_D1(): void {
    HgcPixelFormatConversion_kV4S_WXYZ_output_D2(this); // @0xfd265
  }

  /**
   * ~HGCPixelFormatConversion_kV4S_WXYZ_output() [D0 deleting dtor] @0xfd270
   *
   *   @0xfd270  pushq %rbp
   *   @0xfd271  movq  %rsp, %rbp
   *   @0xfd274  pushq %rbx
   *   @0xfd275  pushq %rax                                ; align
   *   @0xfd276  movq  %rdi, %rbx                          ; save this
   *   @0xfd279  callq HgcPixelFormatConversion_kV4S_WXYZ_output::~D2
   *   @0xfd27e  movq  %rbx, %rdi                          ; rdi = this
   *   @0xfd281  addq  $0x8, %rsp
   *   @0xfd285  popq  %rbx
   *   @0xfd286  popq  %rbp
   *   @0xfd287  jmp   HGObject::operator delete(void*)    ; TAIL-JMP
   */
  destroy_D0(): void {
    HgcPixelFormatConversion_kV4S_WXYZ_output_D2(this); // @0xfd279
    HGObject_operatorDelete(this);                       // @0xfd287 (tail)
  }

  /**
   * GetOutput(HGRenderer*) @0xfd290
   *
   *   @0xfd290  pushq %rbp
   *   @0xfd291  movq  %rsp, %rbp
   *   @0xfd294  movq  %rdi, %rax   ; return this
   *   @0xfd297  popq  %rbp
   *   @0xfd298  retq
   */
  GetOutput(
    _r: HGRenderer,
  ): HGCPixelFormatConversion_kV4S_WXYZ_output {
    return this; // @0xfd294
  }

  /**
   * GetDOD(HGRenderer* r, int slot, HGRect rect) @0xfd2a0
   *
   * Same shape as the BE sibling — slot!=0 → HGRectNull; slot==0 →
   * HGRenderer::GetDOD(GetInput(this, 0)).
   *
   *   @0xfd2a0  testl %edx, %edx
   *   @0xfd2a2  je    0xfd2b3
   *   @0xfd2a4  leaq  _HGRectNull(%rip), %rcx
   *   @0xfd2ab  movq  (%rcx), %rax
   *   @0xfd2ae  movq  0x8(%rcx), %rdx
   *   @0xfd2b2  retq                                        ; slot!=0 → HGRectNull
   *
   *   slot == 0 body (@0xfd2b3):
   *   @0xfd2b3-fd2c5  set up args: rdi=renderer, rsi=this, edx=0; save renderer in rbx
   *   @0xfd2c7  callq HGRenderer::GetInput
   *   @0xfd2cc  rdi = renderer ; rsi = input
   *   @0xfd2d2-fd2d7  restore frame
   *   @0xfd2d8  jmp HGRenderer::GetDOD(input)               ; TAIL-JMP
   */
  GetDOD(r: HGRenderer, slot: number, _rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull; // @0xfd2a4-fd2b2
    }
    const input = HGRenderer_GetInput(r, this, 0); // @0xfd2c7
    return HGRenderer_GetDOD(r, input); // @0xfd2d8 (tail)
  }

  /**
   * GetROI(HGRenderer* r, int slot, HGRect rect) @0xfd2e0
   *
   * Frameless pass-through — same trick as the BE sibling: rax is set to
   * rcx (input {x,y}) BEFORE the slot test, slot!=0 falls into the
   * HGRectNull load then converges on the shared epilogue that copies r8
   * → rdx.
   *
   *   @0xfd2e0  movq  %rcx, %rax                     ; rax = input {x,y}
   *   @0xfd2e3  testl %edx, %edx
   *   @0xfd2e5  je    0xfd2fa                        ; slot == 0 → skip null-load
   *
   *   slot != 0 branch:
   *   @0xfd2e7  pushq %rbp / movq %rsp,%rbp
   *   @0xfd2eb  leaq  _HGRectNull(%rip), %rcx
   *   @0xfd2f2  movq  (%rcx), %rax                   ; rax = HGRectNull.{x,y}
   *   @0xfd2f5  movq  0x8(%rcx), %r8                 ; r8  = HGRectNull.{right,bottom}
   *   @0xfd2f9  popq  %rbp
   *   ; fall through
   *
   *   Shared epilogue (@0xfd2fa):
   *   @0xfd2fa  movq  %r8, %rdx                      ; rdx = {right,bottom}
   *   @0xfd2fd  retq
   *
   * Net semantic: slot 0 → return `rect` unchanged; other slots →
   * HGRectNull. No spatial alignment imposed.
   */
  GetROI(_r: HGRenderer, slot: number, rect: HGRect): HGRect {
    if (slot !== 0) {
      // @0xfd2e7-fd2f9  load HGRectNull's two 64-bit halves.
      return HGRectNull;
    }
    // @0xfd2e0 + @0xfd2fa: rax = rcx (input {x,y}), rdx = r8 (input
    // {right,bottom}). Input rect returned bit-for-bit.
    return {
      x: rect.x,
      y: rect.y,
      right: rect.right,
      bottom: rect.bottom,
    };
  }
}
