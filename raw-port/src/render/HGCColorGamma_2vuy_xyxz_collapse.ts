// HGCColorGamma_2vuy_xyxz_collapse.ts — Helium HGCColorGamma_2vuy_xyxz_collapse:
// render-graph node for the "color gamma over 2vuy (4:2:2 YCbCr packed)
// with x/y/x/z channel collapse" per-pixel op. Transcribed from the x86_64
// slice of /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium.
//
// Method addresses (otool -tV):
//   @0x0fd810  HGCColorGamma_2vuy_xyxz_collapse::~HGCColorGamma_2vuy_xyxz_collapse() [D1 thunk to D0]
//   @0x0fd820  HGCColorGamma_2vuy_xyxz_collapse::~HGCColorGamma_2vuy_xyxz_collapse() [D0 body]
//   @0x0fd840  HGCColorGamma_2vuy_xyxz_collapse::GetOutput(HGRenderer*)
//   @0x0fd850  HGCColorGamma_2vuy_xyxz_collapse::GetDOD(HGRenderer*, int, HGRect)
//   @0x0fd890  HGCColorGamma_2vuy_xyxz_collapse::GetROI(HGRenderer*, int, HGRect)
//
// Notes on the operation: 2vuy is Apple's 4:2:2 packed YCbCr (byte order
// Cb, Y0, Cr, Y1 for a 2-pixel macropixel). The "xyxz collapse" refers to
// the per-macropixel channel layout the shader emits: two luma samples
// (x/y then x/z) collapse to one chroma pair per pair of horizontal pixels.
// The consequence for the render graph is that this node MUST operate on
// even x-aligned, even-width rects — captured directly by GetROI below.
//
// Undecoded frontier (throwing stubs cite their callee addr):
//   HgcColorGamma_2vuy_xyxz_collapse::~HgcColorGamma_2vuy_xyxz_collapse [base D2] @Helium (called from D0 @0xfd829)
//   HGRenderer::GetInput(HGNode*, int)                                   @Helium (called from GetDOD @0xfd877)
//   HGRenderer::GetDOD(HGNode*)                                          @Helium (tail from GetDOD @0xfd888)
//   HGObject::operator delete(void*)                                     @Helium (tail from D0 @0xfd837)
//
// The tail-call chain out of D0 (base dtor then HGObject::operator delete)
// matches the pattern already used by HGCColorGamma_bias.ts.

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph node handle; layout not decoded here. */
export interface HGNode {}
/** HGRenderer — the render context passed to every vfn; layout undecoded. */
export interface HGRenderer {}

/** `_HGRectNull` — Helium __DATA_CONST sentinel; imported from HGRect.ts. */
const HGRectNull: HGRect = HGRectNullConst;

/**
 * HgcColorGamma_2vuy_xyxz_collapse base dtor — called from D0 @0xfd829
 * (callq __ZN32HgcColorGamma_2vuy_xyxz_collapseD2Ev). Base compute-kernel
 * class not yet transcribed.
 */
function HgcColorGamma_2vuy_xyxz_collapse_dtor(_self: HGCColorGamma_2vuy_xyxz_collapse): void {
  throw new Error(
    "HgcColorGamma_2vuy_xyxz_collapse base dtor @Helium __ZN32HgcColorGamma_2vuy_xyxz_collapseD2Ev @0xfd829 not yet transcribed",
  );
}

/** HGObject::operator delete — tail-called from D0 @0xfd837 (jmp
 *  __ZN8HGObjectdlEPv). Not decoded here. */
function HGObject_operatorDelete(_p: HGCColorGamma_2vuy_xyxz_collapse): void {
  throw new Error("HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xfd837 not yet transcribed");
}

/** HGRenderer::GetInput(HGNode* self, int slot) — called from GetDOD
 *  @0xfd877 with slot=0. Not yet transcribed. */
function HGRenderer_GetInput(_r: HGRenderer, _self: HGCColorGamma_2vuy_xyxz_collapse, _slot: number): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0xfd877 not yet transcribed",
  );
}

/** HGRenderer::GetDOD(HGNode*) — tail-called from GetDOD @0xfd888. Not
 *  yet transcribed. */
function HGRenderer_GetDOD(_r: HGRenderer, _n: HGNode | null): HGRect {
  throw new Error(
    "HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode @0xfd888 not yet transcribed",
  );
}

export class HGCColorGamma_2vuy_xyxz_collapse {
  /**
   * ~HGCColorGamma_2vuy_xyxz_collapse() [D0 body] @0xfd820
   *
   *   @0xfd820 pushq %rbp
   *   @0xfd824 pushq %rbx
   *   @0xfd826 rbx = this
   *   @0xfd829 callq HgcColorGamma_2vuy_xyxz_collapse::~HgcColorGamma_2vuy_xyxz_collapse (base D2)
   *   @0xfd82e rdi  = rbx (this)
   *   @0xfd837 jmp   HGObject::operator delete(void*)
   *
   * D1 @0xfd810 is a 6-byte thunk landing here (verified by otool: same
   * epilogue immediately follows the D1 label).
   */
  destroy(): void {
    HgcColorGamma_2vuy_xyxz_collapse_dtor(this);   // @0xfd829
    HGObject_operatorDelete(this);                 // @0xfd837 (tail)
  }

  /**
   * GetOutput(HGRenderer*) @0xfd840
   *
   *   @0xfd844 movq %rdi, %rax   ; rax = this
   *   @0xfd847 popq %rbp
   *   @0xfd848 retq
   *
   * Trivially returns `this` — the node IS its own output slot. Signature
   * uses the standard convention: rdi is the C++ `this` even though the
   * declared prototype only names an HGRenderer* argument (this comes in
   * before the explicit arg per Itanium ABI).
   */
  GetOutput(_r: HGRenderer): HGCColorGamma_2vuy_xyxz_collapse {
    return this;                                    // @0xfd844
  }

  /**
   * GetDOD(HGRenderer* r, int slot, HGRect rect) @0xfd850
   *
   *   @0xfd850 testl %edx, %edx
   *   @0xfd852 je    0xfd863            ; slot == 0 → real body
   *   @0xfd854 rcx = &_HGRectNull       ; RIP-rel load of the __DATA_CONST sentinel
   *   @0xfd85b rax = *(rcx)             ; low half  = HGRectNull.x, HGRectNull.y
   *   @0xfd85e rdx = *(rcx+8)           ; high half = HGRectNull.right, HGRectNull.bottom
   *   @0xfd862 retq                     ; return HGRectNull for any slot != 0
   *
   *   slot == 0 body (@0xfd863):
   *   @0xfd869 rax = rdi (this)         ; save this
   *   @0xfd86c rdi = rsi (renderer)     ; caller HGRenderer
   *   @0xfd86f rbx = rsi                ; keep renderer for tail call
   *   @0xfd872 rsi = rax (this)         ; HGRenderer::GetInput(this, 0)
   *   @0xfd875 edx = 0                  ; slot 0 (input index)
   *   @0xfd877 callq HGRenderer::GetInput
   *   @0xfd87c rdi = rbx (renderer)
   *   @0xfd87f rsi = rax  (input node)
   *   @0xfd888 jmp  HGRenderer::GetDOD(input)
   *
   * Delegates DOD to the sole input's DOD for slot 0; returns null for all
   * other slots — same shape as HGCColorGamma_bias.
   */
  GetDOD(r: HGRenderer, slot: number, _rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull;                            // @0xfd854..@0xfd862
    }
    const input = HGRenderer_GetInput(r, this, 0);  // @0xfd877 (edx=0)
    return HGRenderer_GetDOD(r, input);             // @0xfd888 tail call
  }

  /**
   * GetROI(HGRenderer* r, int slot, HGRect rect) @0xfd890
   *
   *   @0xfd890 testl %edx, %edx
   *   @0xfd892 je    0xfd8a8            ; slot == 0 → real body
   *   @0xfd898 rcx = &_HGRectNull
   *   @0xfd89f rax = *(rcx)             ; low half of HGRectNull
   *   @0xfd8a2 rdx = *(rcx+8)           ; high half of HGRectNull
   *   @0xfd8a6 retq                     ; slot != 0 → HGRectNull
   *
   *   slot == 0 body (@0xfd8a8) — even-align the horizontal edges of the
   *   input rect for 2:1 chroma-subsampled 2vuy output:
   *   @0xfd8a8 rax = rcx                 ; rax = (x, y) as packed 64-bit
   *                                        [low 32 = x, high 32 = y]
   *   @0xfd8ab edx = r8d                 ; edx = right (low 32 of r8)
   *   @0xfd8ae edx &= 1                  ; edx = right mod 2
   *   @0xfd8b1 edx += r8d                ; edx = right + (right & 1)
   *                                       (round `right` UP to the next
   *                                        even integer; if already even,
   *                                        no change)
   *   @0xfd8b4 rcx = 0xFFFFFFFF00000000  ; high-32 mask
   *   @0xfd8be rcx &= r8                 ; rcx = bottom << 32 (isolate high half of r8)
   *   @0xfd8c1 rax &= -2                 ; clear bit 0 of x
   *                                       (round `x` DOWN to the next even integer;
   *                                        y (in high 32) untouched because -2
   *                                        = 0xFFFFFFFFFFFFFFFE zeroes only bit 0)
   *   @0xfd8c5 rdx = rcx | rdx           ; rdx = (bottom << 32) | new_right
   *   @0xfd8c8 retq
   *
   * Net result: rect.x is snapped down to the nearest even integer, rect.right
   * is snapped up to the nearest even integer; y and bottom pass through.
   * This is the horizontal 2-pixel alignment required for 2vuy chroma pairs.
   */
  GetROI(_r: HGRenderer, slot: number, rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull;                            // @0xfd894..@0xfd8a7
    }
    // Convert 32-bit `int` semantics — treat x/right as signed int32. JS
    // bitwise ops are int32-safe. Snap x down (clear bit 0), snap right up
    // (add its low bit), pass y/bottom through unchanged.
    const newX = rect.x & ~1;                       // @0xfd8c1 andq $-0x2, %rax
    const newRight = (rect.right + (rect.right & 1)) | 0; // @0xfd8ae..@0xfd8b1
    return {
      x: newX,
      y: rect.y,                                    // @0xfd8a8 y flows through rax's high half untouched
      right: newRight,
      bottom: rect.bottom,                          // @0xfd8be rcx isolates bottom
    };
  }
}
