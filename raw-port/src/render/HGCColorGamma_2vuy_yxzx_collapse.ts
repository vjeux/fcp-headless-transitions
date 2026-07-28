// HGCColorGamma_2vuy_yxzx_collapse.ts — Helium HGCColorGamma_2vuy_yxzx_collapse:
// render-graph node for the "color gamma over 2vuy (4:2:2 YCbCr packed)
// with y/x/z/x channel collapse" per-pixel op. Sibling of the xyxz variant
// (HGCColorGamma_2vuy_xyxz_collapse) — differs only in the shader's
// per-macropixel channel-collapse order, which lives on the (frontier)
// base "Hgc"-prefixed class. Transcribed from the x86_64 slice of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium.
//
// Method addresses (otool -tV):
//   @0x0fd750  HGCColorGamma_2vuy_yxzx_collapse::~HGCColorGamma_2vuy_yxzx_collapse() [D1 thunk to base D2]
//   @0x0fd760  HGCColorGamma_2vuy_yxzx_collapse::~HGCColorGamma_2vuy_yxzx_collapse() [D0 body]
//   @0x0fd780  HGCColorGamma_2vuy_yxzx_collapse::GetOutput(HGRenderer*)
//   @0x0fd790  HGCColorGamma_2vuy_yxzx_collapse::GetDOD(HGRenderer*, int, HGRect)
//   @0x0fd7d0  HGCColorGamma_2vuy_yxzx_collapse::GetROI(HGRenderer*, int, HGRect)
//
// Notes on the operation: 2vuy is Apple's 4:2:2 packed YCbCr (byte order
// Cb, Y0, Cr, Y1 for a 2-pixel macropixel). The "yxzx collapse" refers to
// the per-macropixel channel layout the shader emits; the consequence for
// the render graph is that this node MUST operate on even x-aligned,
// even-width rects — captured directly by GetROI below (bit-identical
// body to the v216 and xyxz siblings — every 4:2:2 packed variant shares
// the same 2-pixel horizontal alignment constraint).
//
// Undecoded frontier (throwing stubs cite their callee addr):
//   HgcColorGamma_2vuy_yxzx_collapse::~HgcColorGamma_2vuy_yxzx_collapse [base D2] @Helium
//     tail-jumped from D1 @0xfd755, direct-called from D0 @0xfd769
//   HGRenderer::GetInput(HGNode*, int)                                   @Helium
//     called from GetDOD @0xfd7b7 with slot=0
//   HGRenderer::GetDOD(HGNode*)                                          @Helium
//     tail-jumped from GetDOD @0xfd7c8
//   HGObject::operator delete(void*)                                     @Helium
//     tail-jumped from D0 @0xfd777
//
// The tail-call chain out of D0 (base dtor then HGObject::operator delete)
// matches the pattern already used by HGCColorGamma_bias.ts,
// HGCColorGamma_2vuy_xyxz_collapse.ts, and HGCColorGamma_v216_yxzx_collapse.ts.

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph node handle; layout not decoded here. */
export interface HGNode {}
/** HGRenderer — the render context passed to every vfn; layout undecoded. */
export interface HGRenderer {}

/** `_HGRectNull` — Helium __DATA_CONST sentinel; imported from HGRect.ts. */
const HGRectNull: HGRect = HGRectNullConst;

/**
 * HgcColorGamma_2vuy_yxzx_collapse base dtor — hit from both D1 and D0:
 *   @0xfd755  jmp   __ZN32HgcColorGamma_2vuy_yxzx_collapseD2Ev   (from D1)
 *   @0xfd769  callq __ZN32HgcColorGamma_2vuy_yxzx_collapseD2Ev   (from D0)
 * The base compute-kernel class ("Hgc..." lowercase-c prefix) has not yet
 * been transcribed.
 */
function HgcColorGamma_2vuy_yxzx_collapse_dtor(
  _self: HGCColorGamma_2vuy_yxzx_collapse,
): void {
  // raise: undecoded base dtor. Cited: @0xfd755 (D1 tail), @0xfd769 (D0 direct).
  throw new Error(
    "HgcColorGamma_2vuy_yxzx_collapse base dtor @Helium __ZN32HgcColorGamma_2vuy_yxzx_collapseD2Ev @0xfd755 not yet transcribed",
  );
}

/** HGObject::operator delete — tail-called from D0 @0xfd777 (jmp
 *  __ZN8HGObjectdlEPv). Not decoded here. */
function HGObject_operatorDelete(_p: HGCColorGamma_2vuy_yxzx_collapse): void {
  // raise: undecoded deallocator. Cited: @0xfd777.
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xfd777 not yet transcribed",
  );
}

/** HGRenderer::GetInput(HGNode* self, int slot) — called from GetDOD
 *  @0xfd7b7 with slot=0. Not yet transcribed. */
function HGRenderer_GetInput(
  _r: HGRenderer,
  _self: HGCColorGamma_2vuy_yxzx_collapse,
  _slot: number,
): HGNode | null {
  // raise: undecoded renderer input lookup. Cited: @0xfd7b7.
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0xfd7b7 not yet transcribed",
  );
}

/** HGRenderer::GetDOD(HGNode*) — tail-called from GetDOD @0xfd7c8. Not
 *  yet transcribed. */
function HGRenderer_GetDOD(_r: HGRenderer, _n: HGNode | null): HGRect {
  // raise: undecoded renderer DOD accessor. Cited: @0xfd7c8.
  throw new Error(
    "HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode @0xfd7c8 not yet transcribed",
  );
}

export class HGCColorGamma_2vuy_yxzx_collapse {
  /**
   * ~HGCColorGamma_2vuy_yxzx_collapse() [D1 thunk] @0xfd750
   *
   *   @0xfd750 pushq %rbp
   *   @0xfd751 movq  %rsp, %rbp
   *   @0xfd754 popq  %rbp
   *   @0xfd755 jmp   HgcColorGamma_2vuy_yxzx_collapse::~... (base D2)
   *
   * D1 is a bare tail-call into the base dtor — no delete step, no field
   * teardown, no vtable rewrite. In TS this is identical to calling the
   * base dtor helper.
   */
  destroyD1(): void {
    HgcColorGamma_2vuy_yxzx_collapse_dtor(this); // @0xfd755 tail
  }

  /**
   * ~HGCColorGamma_2vuy_yxzx_collapse() [D0 body] @0xfd760
   *
   *   @0xfd760 pushq %rbp
   *   @0xfd764 pushq %rbx
   *   @0xfd766 movq  %rdi, %rbx           ; save `this`
   *   @0xfd769 callq HgcColorGamma_2vuy_yxzx_collapse::~... (base D2)
   *   @0xfd76e movq  %rbx, %rdi           ; restore this for the tail
   *   @0xfd777 jmp   HGObject::operator delete(void*)
   *
   * Standard "base-dtor + operator-delete" deleting dtor.
   */
  destroy(): void {
    HgcColorGamma_2vuy_yxzx_collapse_dtor(this); // @0xfd769
    HGObject_operatorDelete(this); // @0xfd777 (tail)
  }

  /**
   * GetOutput(HGRenderer*) @0xfd780
   *
   *   @0xfd784 movq %rdi, %rax   ; rax = this
   *   @0xfd787 popq %rbp
   *   @0xfd788 retq
   *
   * Trivially returns `this` — the node IS its own output slot. Same
   * one-instruction body as every other HGC node's GetOutput. rdi is
   * the C++ `this` per Itanium ABI.
   */
  GetOutput(_r: HGRenderer): HGCColorGamma_2vuy_yxzx_collapse {
    return this; // @0xfd784
  }

  /**
   * GetDOD(HGRenderer* r, int slot, HGRect rect) @0xfd790
   *
   *   @0xfd790 testl %edx, %edx
   *   @0xfd792 je    0xfd7a3            ; slot == 0 → real body
   *   @0xfd794 leaq  _HGRectNull(%rip), %rcx
   *   @0xfd79b rax = *(rcx)             ; low half  = HGRectNull.x, HGRectNull.y
   *   @0xfd79e rdx = *(rcx+8)           ; high half = HGRectNull.right, HGRectNull.bottom
   *   @0xfd7a2 retq                     ; return HGRectNull for any slot != 0
   *
   *   slot == 0 body (@0xfd7a3):
   *   @0xfd7a9 rax = rdi (this)         ; save this
   *   @0xfd7ac rdi = rsi (renderer)     ; caller HGRenderer
   *   @0xfd7af rbx = rsi                ; keep renderer for tail call
   *   @0xfd7b2 rsi = rax (this)         ; HGRenderer::GetInput(this, 0)
   *   @0xfd7b5 edx = 0                  ; slot 0 (input index)
   *   @0xfd7b7 callq HGRenderer::GetInput
   *   @0xfd7bc rdi = rbx (renderer)
   *   @0xfd7bf rsi = rax  (input node)
   *   @0xfd7c8 jmp  HGRenderer::GetDOD(input)
   *
   * Delegates DOD to the sole input's DOD for slot 0; returns null for all
   * other slots — same shape as every HGC per-pixel node.
   */
  GetDOD(r: HGRenderer, slot: number, _rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull; // @0xfd794..@0xfd7a2
    }
    const input = HGRenderer_GetInput(r, this, 0); // @0xfd7b7 (edx=0)
    return HGRenderer_GetDOD(r, input); // @0xfd7c8 tail call
  }

  /**
   * GetROI(HGRenderer* r, int slot, HGRect rect) @0xfd7d0
   *
   *   @0xfd7d0 testl %edx, %edx
   *   @0xfd7d2 je    0xfd7e8            ; slot == 0 → real body
   *   @0xfd7d4 pushq %rbp
   *   @0xfd7d8 leaq  _HGRectNull(%rip), %rcx
   *   @0xfd7df rax = *(rcx)             ; low half of HGRectNull
   *   @0xfd7e2 rdx = *(rcx+8)           ; high half of HGRectNull
   *   @0xfd7e6 popq  %rbp
   *   @0xfd7e7 retq                     ; slot != 0 → HGRectNull
   *
   *   slot == 0 body (@0xfd7e8) — even-align the horizontal edges of the
   *   input rect for 2:1 chroma-subsampled 2vuy output:
   *   @0xfd7e8 rax = rcx                 ; rax = (x, y) as packed 64-bit
   *                                        [low 32 = x, high 32 = y]
   *   @0xfd7eb edx = r8d                 ; edx = right (low 32 of r8)
   *   @0xfd7ee edx &= 1                  ; edx = right & 1
   *   @0xfd7f1 edx += r8d                ; edx = right + (right & 1)
   *                                       (round `right` UP to the next
   *                                        even integer; if already even,
   *                                        no change)
   *   @0xfd7f4 rcx = 0xFFFFFFFF00000000  ; movabsq high-32 mask
   *   @0xfd7fe rcx &= r8                 ; rcx = bottom << 32 (isolate high half of r8)
   *   @0xfd801 rax &= -2                 ; clear bit 0 of x
   *                                       (round `x` DOWN to the next even int;
   *                                        y in high 32 untouched: -2 =
   *                                        0xFFFFFFFFFFFFFFFE zeroes only bit 0)
   *   @0xfd805 rdx = rcx | rdx           ; rdx = (bottom << 32) | new_right
   *   @0xfd808 retq
   *
   * Net effect: rect.x snapped down to the nearest even integer, rect.right
   * snapped up to the nearest even integer; y and bottom pass through.
   * Bit-identical body to HGCColorGamma_2vuy_xyxz_collapse::GetROI and
   * HGCColorGamma_v216_yxzx_collapse::GetROI — all three are packed 4:2:2
   * variants sharing the same 2-pixel alignment constraint.
   */
  GetROI(_r: HGRenderer, slot: number, rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull; // @0xfd7d4..@0xfd7e7
    }
    // 32-bit `int` semantics — treat x/right as signed int32. JS bitwise
    // ops are int32-safe. Snap x down (clear bit 0), snap right up (add
    // its low bit), pass y/bottom through unchanged.
    const newX = rect.x & ~1; // @0xfd801 andq $-0x2, %rax
    const newRight = (rect.right + (rect.right & 1)) | 0; // @0xfd7ee..@0xfd7f1
    return {
      x: newX,
      y: rect.y, // @0xfd7e8 y flows through rax's high half untouched
      right: newRight,
      bottom: rect.bottom, // @0xfd7fe rcx isolates bottom
    };
  }
}
