// HGCColorGamma_v216_yxzx_collapse.ts — Helium HGCColorGamma_v216_yxzx_collapse:
// render-graph node for the "color gamma over v216 (10-bit 4:2:2 YCbCr
// packed, big-endian) with y/x/z/x channel collapse" per-pixel op.
// Transcribed from the x86_64 slice of /Applications/Final Cut Pro.app/
// Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Method addresses (otool -tV):
//   @0x0fd9f0  HGCColorGamma_v216_yxzx_collapse::~HGCColorGamma_v216_yxzx_collapse() [D1 thunk to base D2]
//   @0x0fda00  HGCColorGamma_v216_yxzx_collapse::~HGCColorGamma_v216_yxzx_collapse() [D0 body]
//   @0x0fda20  HGCColorGamma_v216_yxzx_collapse::GetOutput(HGRenderer*)
//   @0x0fda30  HGCColorGamma_v216_yxzx_collapse::GetDOD(HGRenderer*, int, HGRect)
//   @0x0fda70  HGCColorGamma_v216_yxzx_collapse::GetROI(HGRenderer*, int, HGRect)
//
// Notes on the operation: v216 is Apple's 10-bit big-endian 4:2:2 YCbCr
// (6 samples per macropixel across 4 bytes each — Cb0 Y0 Cr0 Y1 in 10 bits
// stored in 16). The "yxzx collapse" refers to the shader's per-macropixel
// output channel layout, which — like every 4:2:2 packed variant — forces
// this node to snap ROI horizontal edges to an even pixel boundary. That
// alignment is exactly what GetROI does below (identical bit-pattern to
// HGCColorGamma_2vuy_xyxz_collapse, since both share the same 2-pixel
// macropixel constraint).
//
// Undecoded frontier (throwing stubs cite their callee addr):
//   HgcColorGamma_v216_yxzx_collapse::~HgcColorGamma_v216_yxzx_collapse [base D2] @Helium
//     tail-jumped from D1 @0xfd9f5, direct-called from D0 @0xfda09
//   HGRenderer::GetInput(HGNode*, int)                                   @Helium
//     called from GetDOD @0xfda57 with slot=0
//   HGRenderer::GetDOD(HGNode*)                                          @Helium
//     tail-jumped from GetDOD @0xfda68
//   HGObject::operator delete(void*)                                     @Helium
//     tail-jumped from D0 @0xfda17
//
// The tail-call chain out of D0 (base dtor then HGObject::operator delete)
// matches the pattern already used by HGCColorGamma_bias.ts and
// HGCColorGamma_2vuy_xyxz_collapse.ts.

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph node handle; layout not decoded here. */
export interface HGNode {}
/** HGRenderer — the render context passed to every vfn; layout undecoded. */
export interface HGRenderer {}

/** `_HGRectNull` — Helium __DATA_CONST sentinel; imported from HGRect.ts. */
const HGRectNull: HGRect = HGRectNullConst;

/**
 * HgcColorGamma_v216_yxzx_collapse base dtor — hit from both D1 and D0:
 *   @0xfd9f5  jmp   __ZN32HgcColorGamma_v216_yxzx_collapseD2Ev   (from D1)
 *   @0xfda09  callq __ZN32HgcColorGamma_v216_yxzx_collapseD2Ev   (from D0)
 * The base compute-kernel class ("Hgc..." lowercase-c prefix) has not yet
 * been transcribed.
 */
function HgcColorGamma_v216_yxzx_collapse_dtor(
  _self: HGCColorGamma_v216_yxzx_collapse,
): void {
  // raise: undecoded base dtor. Cited: @0xfd9f5 (D1 tail), @0xfda09 (D0 direct).
  throw new Error(
    "HgcColorGamma_v216_yxzx_collapse base dtor @Helium __ZN32HgcColorGamma_v216_yxzx_collapseD2Ev @0xfd9f5 not yet transcribed",
  );
}

/** HGObject::operator delete — tail-called from D0 @0xfda17 (jmp
 *  __ZN8HGObjectdlEPv). Not decoded here. */
function HGObject_operatorDelete(
  _p: HGCColorGamma_v216_yxzx_collapse,
): void {
  // raise: undecoded deallocator. Cited: @0xfda17.
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xfda17 not yet transcribed",
  );
}

/** HGRenderer::GetInput(HGNode* self, int slot) — called from GetDOD
 *  @0xfda57 with slot=0. Not yet transcribed. */
function HGRenderer_GetInput(
  _r: HGRenderer,
  _self: HGCColorGamma_v216_yxzx_collapse,
  _slot: number,
): HGNode | null {
  // raise: undecoded renderer input lookup. Cited: @0xfda57.
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0xfda57 not yet transcribed",
  );
}

/** HGRenderer::GetDOD(HGNode*) — tail-called from GetDOD @0xfda68. Not
 *  yet transcribed. */
function HGRenderer_GetDOD(_r: HGRenderer, _n: HGNode | null): HGRect {
  // raise: undecoded renderer DOD accessor. Cited: @0xfda68.
  throw new Error(
    "HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode @0xfda68 not yet transcribed",
  );
}

export class HGCColorGamma_v216_yxzx_collapse {
  /**
   * ~HGCColorGamma_v216_yxzx_collapse() [D1 thunk] @0xfd9f0
   *
   *   @0xfd9f0 pushq %rbp
   *   @0xfd9f1 movq  %rsp, %rbp
   *   @0xfd9f4 popq  %rbp
   *   @0xfd9f5 jmp   HgcColorGamma_v216_yxzx_collapse::~HgcColorGamma_v216_yxzx_collapse (base D2)
   *
   * D1 is a bare tail-call into the base dtor — no delete step, no field
   * teardown, no vtable rewrite. In TS this is identical to calling the
   * base dtor helper.
   */
  destroyD1(): void {
    HgcColorGamma_v216_yxzx_collapse_dtor(this); // @0xfd9f5 tail
  }

  /**
   * ~HGCColorGamma_v216_yxzx_collapse() [D0 body] @0xfda00
   *
   *   @0xfda00 pushq %rbp
   *   @0xfda04 pushq %rbx
   *   @0xfda06 movq  %rdi, %rbx           ; save `this`
   *   @0xfda09 callq HgcColorGamma_v216_yxzx_collapse::~... (base D2)
   *   @0xfda0e movq  %rbx, %rdi           ; restore this for the tail
   *   @0xfda17 jmp   HGObject::operator delete(void*)
   *
   * Standard "base-dtor + operator-delete" deleting dtor. The extra
   * pushq/pushq/subq/popq shuffle around the call is a 16-byte stack
   * alignment adjustment; no observable state.
   */
  destroy(): void {
    HgcColorGamma_v216_yxzx_collapse_dtor(this); // @0xfda09
    HGObject_operatorDelete(this); // @0xfda17 (tail)
  }

  /**
   * GetOutput(HGRenderer*) @0xfda20
   *
   *   @0xfda24 movq %rdi, %rax   ; rax = this
   *   @0xfda27 popq %rbp
   *   @0xfda28 retq
   *
   * Trivially returns `this` — the node IS its own output slot. Same
   * one-instruction body as HGCColorGamma_2vuy_xyxz_collapse::GetOutput
   * (@0xfd844). rdi is the C++ `this` per Itanium ABI.
   */
  GetOutput(_r: HGRenderer): HGCColorGamma_v216_yxzx_collapse {
    return this; // @0xfda24
  }

  /**
   * GetDOD(HGRenderer* r, int slot, HGRect rect) @0xfda30
   *
   *   @0xfda30 testl %edx, %edx
   *   @0xfda32 je    0xfda43            ; slot == 0 → real body
   *   @0xfda34 leaq  _HGRectNull(%rip), %rcx
   *   @0xfda3b rax = *(rcx)             ; low half  = HGRectNull.x, HGRectNull.y
   *   @0xfda3e rdx = *(rcx+8)           ; high half = HGRectNull.right, HGRectNull.bottom
   *   @0xfda42 retq                     ; return HGRectNull for any slot != 0
   *
   *   slot == 0 body (@0xfda43):
   *   @0xfda49 rax = rdi (this)
   *   @0xfda4c rdi = rsi (renderer)
   *   @0xfda4f rbx = rsi                ; keep renderer for tail call
   *   @0xfda52 rsi = rax (this)         ; HGRenderer::GetInput(this, 0)
   *   @0xfda55 edx = 0                  ; slot 0
   *   @0xfda57 callq HGRenderer::GetInput
   *   @0xfda5c rdi = rbx (renderer)
   *   @0xfda5f rsi = rax  (input node)
   *   @0xfda68 jmp   HGRenderer::GetDOD(input)
   *
   * Same shape as the 2vuy sibling: DOD = input's DOD for slot 0, null for
   * any other slot.
   */
  GetDOD(r: HGRenderer, slot: number, _rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull; // @0xfda34..@0xfda42
    }
    const input = HGRenderer_GetInput(r, this, 0); // @0xfda57 (edx=0)
    return HGRenderer_GetDOD(r, input); // @0xfda68 tail call
  }

  /**
   * GetROI(HGRenderer* r, int slot, HGRect rect) @0xfda70
   *
   *   @0xfda70 testl %edx, %edx
   *   @0xfda72 je    0xfda88            ; slot == 0 → real body
   *   @0xfda74 pushq %rbp
   *   @0xfda78 leaq  _HGRectNull(%rip), %rcx
   *   @0xfda7f rax = *(rcx)             ; low half of HGRectNull
   *   @0xfda82 rdx = *(rcx+8)           ; high half of HGRectNull
   *   @0xfda86 popq  %rbp
   *   @0xfda87 retq                     ; slot != 0 → HGRectNull
   *
   *   slot == 0 body (@0xfda88) — even-align the horizontal edges of the
   *   input rect for 2:1 chroma-subsampled v216 output:
   *   @0xfda88 rax = rcx                 ; rax = (x, y) as packed 64-bit
   *                                        [low 32 = x, high 32 = y]
   *   @0xfda8b edx = r8d                 ; edx = right (low 32 of r8)
   *   @0xfda8e edx &= 1                  ; edx = right & 1
   *   @0xfda91 edx += r8d                ; edx = right + (right & 1)
   *                                       (round `right` UP to the next
   *                                        even integer; if already even,
   *                                        no change)
   *   @0xfda94 rcx = 0xFFFFFFFF00000000  ; movabsq high-32 mask
   *   @0xfda9e rcx &= r8                 ; rcx = bottom << 32 (high half of r8)
   *   @0xfda a1 rax &= -2                ; clear bit 0 of x
   *                                       (round `x` DOWN to the next even int;
   *                                        y in high 32 untouched: -2 =
   *                                        0xFFFFFFFFFFFFFFFE zeroes only bit 0)
   *   @0xfdaa5 rdx = rcx | rdx           ; rdx = (bottom << 32) | new_right
   *   @0xfdaa8 retq
   *
   * Net effect: rect.x snapped down to the nearest even integer, rect.right
   * snapped up to the nearest even integer; y and bottom pass through.
   * Bit-identical body to HGCColorGamma_2vuy_xyxz_collapse::GetROI — both
   * are 4:2:2 packed formats and share the same 2-pixel alignment.
   */
  GetROI(_r: HGRenderer, slot: number, rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull; // @0xfda74..@0xfda87
    }
    // 32-bit `int` semantics — treat x/right as signed int32. JS bitwise
    // ops are int32-safe. Snap x down (clear bit 0), snap right up (add
    // its low bit), pass y/bottom through unchanged.
    const newX = rect.x & ~1; // @0xfdaa1 andq $-0x2, %rax
    const newRight = (rect.right + (rect.right & 1)) | 0; // @0xfda8e..@0xfda91
    return {
      x: newX,
      y: rect.y, // @0xfda88 y flows through rax's high half untouched
      right: newRight,
      bottom: rect.bottom, // @0xfda9e rcx isolates bottom
    };
  }
}
