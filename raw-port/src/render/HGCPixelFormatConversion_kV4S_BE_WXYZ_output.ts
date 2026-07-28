// HGCPixelFormatConversion_kV4S_BE_WXYZ_output.ts — Helium node for a
// "kV4S big-endian, WXYZ-channel-swizzled output" pixel-format conversion.
// Transcribed from the x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Method addresses (otool -tV):
//   @0x0fd3a0  ~HGCPixelFormatConversion_kV4S_BE_WXYZ_output() [D1: tail-jmp to D2]
//   @0x0fd3b0  ~HGCPixelFormatConversion_kV4S_BE_WXYZ_output() [D0: call D2, jmp HGObject::operator delete]
//   @0x0fd3d0  GetOutput(HGRenderer*)
//   @0x0fd3e0  GetDOD(HGRenderer*, int, HGRect)
//   @0x0fd420  GetROI(HGRenderer*, int, HGRect)
//
// Notes on the operation: "kV4S" is Helium's 4-single-precision-float
// pixel packet ("Vector 4 Singles"); "BE" here is a Helium internal
// endianness tag on the output side; "WXYZ" is the channel swizzle
// applied at the store (input R,G,B,A → output W,X,Y,Z ≡ A,R,G,B — a
// left-rotation of the RGBA lane order). All of this only affects the
// per-pixel compute in the base HgcPixelFormatConversion_kV4S_BE_WXYZ_output
// (D2 dtor / kernel) which is NOT in this file's method surface. From the
// render-graph POV — the four decoded methods below — the operation is a
// pass-through: same DOD as its input, same ROI as the requested rect
// (no spatial alignment or growth is imposed by the swizzle).
//
// Undecoded frontier (throwing stubs cite their callee addr):
//   HgcPixelFormatConversion_kV4S_BE_WXYZ_output::~D2   @Helium
//       (tail-jmped by D1 @0xfd3a5; called by D0 @0xfd3b9)
//   HGRenderer::GetInput(HGNode*, int)                  @Helium (@0xfd407)
//   HGRenderer::GetDOD(HGNode*)                         @Helium (@0xfd418 tail-jmp)
//   HGObject::operator delete(void*)                    @Helium (@0xfd3c7 tail-jmp)

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph node handle; layout not decoded here. */
export interface HGNode {}
/** HGRenderer — the render context passed to every vfn; layout undecoded. */
export interface HGRenderer {}

/** `_HGRectNull` — Helium __DATA_CONST sentinel; imported from HGRect.ts. */
const HGRectNull: HGRect = HGRectNullConst;

/**
 * HgcPixelFormatConversion_kV4S_BE_WXYZ_output base D2 dtor.
 * @frontier Helium __ZN44HgcPixelFormatConversion_kV4S_BE_WXYZ_outputD2Ev
 *   (cited: D1 @0xfd3a5 jmp; D0 @0xfd3b9 call)
 */
function HgcPixelFormatConversion_kV4S_BE_WXYZ_output_D2(
  _self: HGCPixelFormatConversion_kV4S_BE_WXYZ_output,
): void {
  throw new Error(
    "HgcPixelFormatConversion_kV4S_BE_WXYZ_output base D2 dtor @Helium " +
    "__ZN44HgcPixelFormatConversion_kV4S_BE_WXYZ_outputD2Ev not yet " +
    "transcribed (cited: D1 @0xfd3a5, D0 @0xfd3b9)",
  );
}

/** HGObject::operator delete — tail-jmp target @0xfd3c7.
 *  @frontier Helium __ZN8HGObjectdlEPv */
function HGObject_operatorDelete(
  _p: HGCPixelFormatConversion_kV4S_BE_WXYZ_output,
): void {
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xfd3c7 " +
    "not yet transcribed",
  );
}

/** HGRenderer::GetInput(this, slot) — called from GetDOD @0xfd407 (slot=0).
 *  @frontier Helium __ZN10HGRenderer8GetInputEP6HGNodei */
function HGRenderer_GetInput(
  _r: HGRenderer,
  _self: HGCPixelFormatConversion_kV4S_BE_WXYZ_output,
  _slot: number,
): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei " +
    "@0xfd407 not yet transcribed",
  );
}

/** HGRenderer::GetDOD(input) — tail-jmped from GetDOD @0xfd418.
 *  @frontier Helium __ZN10HGRenderer6GetDODEP6HGNode */
function HGRenderer_GetDOD(_r: HGRenderer, _n: HGNode | null): HGRect {
  throw new Error(
    "HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode " +
    "@0xfd418 not yet transcribed",
  );
}

export class HGCPixelFormatConversion_kV4S_BE_WXYZ_output {
  /**
   * ~HGCPixelFormatConversion_kV4S_BE_WXYZ_output() [D1 complete-object dtor] @0xfd3a0
   *
   *   @0xfd3a0  pushq %rbp
   *   @0xfd3a1  movq  %rsp, %rbp
   *   @0xfd3a4  popq  %rbp
   *   @0xfd3a5  jmp   HgcPixelFormatConversion_kV4S_BE_WXYZ_output::~D2  ; TAIL-JMP
   *
   * D1 is a naked tail-jmp into the base D2 — the derived layer has no
   * fields of its own to release. Same shape as the v210_yxzx_rgba_expand
   * D1 above.
   */
  destroy_D1(): void {
    // @0xfd3a5  jmp base D2
    HgcPixelFormatConversion_kV4S_BE_WXYZ_output_D2(this);
  }

  /**
   * ~HGCPixelFormatConversion_kV4S_BE_WXYZ_output() [D0 deleting dtor] @0xfd3b0
   *
   *   @0xfd3b0  pushq %rbp
   *   @0xfd3b1  movq  %rsp, %rbp
   *   @0xfd3b4  pushq %rbx
   *   @0xfd3b5  pushq %rax                                 ; align
   *   @0xfd3b6  movq  %rdi, %rbx                           ; save this
   *   @0xfd3b9  callq HgcPixelFormatConversion_kV4S_BE_WXYZ_output::~D2
   *   @0xfd3be  movq  %rbx, %rdi                           ; rdi = this
   *   @0xfd3c1  addq  $0x8, %rsp
   *   @0xfd3c5  popq  %rbx
   *   @0xfd3c6  popq  %rbp
   *   @0xfd3c7  jmp   HGObject::operator delete(void*)     ; TAIL-JMP
   */
  destroy_D0(): void {
    HgcPixelFormatConversion_kV4S_BE_WXYZ_output_D2(this); // @0xfd3b9
    HGObject_operatorDelete(this);                          // @0xfd3c7 (tail)
  }

  /**
   * GetOutput(HGRenderer*) @0xfd3d0
   *
   *   @0xfd3d0  pushq %rbp
   *   @0xfd3d1  movq  %rsp, %rbp
   *   @0xfd3d4  movq  %rdi, %rax    ; return this
   *   @0xfd3d7  popq  %rbp
   *   @0xfd3d8  retq
   */
  GetOutput(
    _r: HGRenderer,
  ): HGCPixelFormatConversion_kV4S_BE_WXYZ_output {
    return this;                                           // @0xfd3d4
  }

  /**
   * GetDOD(HGRenderer* r, int slot, HGRect rect) @0xfd3e0
   *
   * Same shape as HGCColorGamma_v210_yxzx_rgba_expand::GetDOD — slot!=0
   * returns HGRectNull, slot==0 delegates to input's DOD.
   *
   *   @0xfd3e0  testl %edx, %edx
   *   @0xfd3e2  je    0xfd3f3
   *   @0xfd3e4  leaq  _HGRectNull(%rip), %rcx
   *   @0xfd3eb  movq  (%rcx), %rax
   *   @0xfd3ee  movq  0x8(%rcx), %rdx
   *   @0xfd3f2  retq                                       ; slot!=0 → HGRectNull
   *
   *   slot == 0 body (@0xfd3f3):
   *   @0xfd3f3  pushq %rbp / movq %rsp,%rbp
   *   @0xfd3f7  pushq %rbx / pushq %rax (align)
   *   @0xfd3f9  rax = rdi (this) ; rdi = rsi (renderer)
   *   @0xfd3ff  rbx = renderer (kept)
   *   @0xfd402  rsi = this
   *   @0xfd405  edx = 0 (slot 0)
   *   @0xfd407  callq HGRenderer::GetInput(this, 0)
   *   @0xfd40c  rdi = renderer ; rsi = input
   *   @0xfd412  restore frame
   *   @0xfd418  jmp HGRenderer::GetDOD(input)              ; TAIL-JMP
   */
  GetDOD(r: HGRenderer, slot: number, _rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull;                                    // @0xfd3e4-fd3f2
    }
    const input = HGRenderer_GetInput(r, this, 0);          // @0xfd407
    return HGRenderer_GetDOD(r, input);                     // @0xfd418 (tail)
  }

  /**
   * GetROI(HGRenderer* r, int slot, HGRect rect) @0xfd420
   *
   * Frameless — no push %rbp on the slot==0 path. The subtlety here is
   * that rax is set FIRST to rcx (the input rect's low half {x,y}) BEFORE
   * the slot test, then the slot!=0 path OVERWRITES rax and r8 with
   * HGRectNull's two halves and FALLS THROUGH into the shared epilogue
   * that reassembles rdx from r8. Both paths converge on the same last
   * two instructions:
   *
   *   @0xfd420  movq  %rcx, %rax                    ; rax = input {x,y}
   *   @0xfd423  testl %edx, %edx
   *   @0xfd425  je    0xfd43a                       ; slot == 0 → skip null-load
   *
   *   slot != 0 branch:
   *   @0xfd427  pushq %rbp / movq %rsp,%rbp
   *   @0xfd42b  leaq  _HGRectNull(%rip), %rcx
   *   @0xfd432  movq  (%rcx), %rax                  ; rax = HGRectNull.{x,y}
   *   @0xfd435  movq  0x8(%rcx), %r8                ; r8  = HGRectNull.{right,bottom}
   *   @0xfd439  popq  %rbp
   *   ; fall through
   *
   *   Shared epilogue (@0xfd43a):
   *   @0xfd43a  movq  %r8, %rdx                     ; rdx = {right,bottom}
   *   @0xfd43d  retq
   *
   * Net semantic: for slot 0 → return `rect` untouched; for any other
   * slot → return HGRectNull. Unlike the v210 or 2vuy variants, THIS
   * node imposes NO horizontal-alignment on its ROI — kV4S packs one
   * pixel per 16-byte vector so any x/right is naturally aligned to a
   * pixel boundary.
   */
  GetROI(_r: HGRenderer, slot: number, rect: HGRect): HGRect {
    if (slot !== 0) {
      // @0xfd427-fd439  load HGRectNull's two 64-bit halves.
      return HGRectNull;
    }
    // @0xfd420 + @0xfd43a: rax stayed = rcx (low half {x,y}), rdx = r8
    // (high half {right,bottom}) — i.e. the input rect is returned
    // unchanged bit-for-bit.
    return {
      x: rect.x,
      y: rect.y,
      right: rect.right,
      bottom: rect.bottom,
    };
  }
}
