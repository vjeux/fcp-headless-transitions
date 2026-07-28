// HDemosaic_2.ts — Helium's second-generation demosaicing node, the raw-Bayer
// -> RGB converter used at the head of the RAW pipeline. This wrapper subclass
// lives on top of the base `HgcDemosaic_2` implementation (whose real work
// happens on the compositor side); the exported surface here is a very thin
// shim of four methods:
//
//   HDemosaic_2::GetROI(HGRenderer*, int inputIdx, HGRect roi)      @Helium 0xdd7c0
//   HDemosaic_2::GetDOD(HGRenderer*, int inputIdx, HGRect renderer) @Helium 0xdd810
//   HDemosaic_2::~HDemosaic_2()  (D1 complete-object)               @Helium 0xddbf0
//   HDemosaic_2::~HDemosaic_2()  (D0 deleting)                      @Helium 0xddc00
//
// Transcribed from FCP Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HDemosaic_2.GetROI.s      (27 lines)
//   raw-port/re/disasm/Helium.HDemosaic_2.GetDOD.s      (13 lines)
//   raw-port/re/disasm/Helium.HDemosaic_2.~HDemosaic_2.s  (D0 body, 13 lines)
//
// The subclass adds no own fields observable through these methods (D0 calls
// the base D2 in place and hands the storage back to HGObject's allocator).
//
// ─── GetROI @Helium 0xdd7c0 ────────────────────────────────────────────────────
//   Arguments (System V AMD64):
//     %rdi = this (HDemosaic_2*)
//     %rsi = HGRenderer* renderer
//     %edx = int inputIdx        ; 0 = raw Bayer input, non-zero = auxiliary
//     %rcx / %r8 = HGRect roi    ; passed by value (16-byte SysV: 2 registers)
//
//   __ZN11HDemosaic_26GetROIEP10HGRendereri6HGRect:
//     0xdd7c0  testl %edx, %edx                    ; inputIdx == 0?
//     0xdd7c2  je    0xdd7d3                       ; -> real path
//     0xdd7c4  leaq  _HGRectNull(%rip), %rcx       ; else return HGRectNull
//     0xdd7cb  movq  (%rcx), %rax                  ; low half of HGRect (x,y)
//     0xdd7ce  movq  0x8(%rcx), %rdx               ; high half (right,bottom)
//     0xdd7d2  retq
//     0xdd7d3  (frame set-up: save r14, rbx)
//     0xdd7da  movq  %r8, %rbx                     ; save roi.high
//     0xdd7dd  movq  %rcx, %r14                    ; save roi.low
//     0xdd7e0  movl  $0xffffffff, %edi             ; arg1 = -1
//     0xdd7e5  movl  $0xffffffff, %esi             ; arg2 = -1
//     0xdd7ea  movl  $0x1, %edx                    ; arg3 = 1
//     0xdd7ef  movl  $0x1, %ecx                    ; arg4 = 1
//     0xdd7f4  callq _HGRectMake4i                 ; build (-1,-1,1,1) rect
//     0xdd7f9  movq  %rdx, %rcx                    ; arg3 = grow.high half
//     0xdd7fc  movq  %r14, %rdi                    ; arg1 = orig roi.low
//     0xdd7ff  movq  %rbx, %rsi                    ; arg2 = orig roi.high
//     0xdd802  movq  %rax, %rdx                    ; arg3 wait — arg3 is (%rdx),
//                                                  ; the grow-rect's low half
//     0xdd805  popq  %rbx / popq %r14 / popq %rbp
//     0xdd809  jmp   _HGRectGrow                    ; TAIL CALL
//
// Semantics: for input 0 (the Bayer plane), the ROI grows by 1 pixel on all
// sides — a demosaicing kernel needs one neighbour pixel around every output
// pixel. For any other input (auxiliary planes not consumed by demosaic),
// return HGRectNull to signal "no ROI dependency".
//
// ─── GetDOD @Helium 0xdd810 ────────────────────────────────────────────────────
//   Arguments (same shape as GetROI).
//
//   __ZN11HDemosaic_26GetDODEP10HGRendereri6HGRect:
//     0xdd810  movq  %rcx, %rax                    ; %rax = renderer-rect.low
//     0xdd813  testl %edx, %edx                    ; inputIdx == 0?
//     0xdd815  je    0xdd82a                       ; -> pass through
//     0xdd817  pushq %rbp / movq %rsp,%rbp
//     0xdd81b  leaq  _HGRectNull(%rip), %rcx       ; else return HGRectNull
//     0xdd822  movq  (%rcx), %rax
//     0xdd825  movq  0x8(%rcx), %r8
//     0xdd829  popq  %rbp
//     0xdd82a  movq  %r8, %rdx                     ; return {rax=lo, rdx=hi}
//     0xdd82d  retq
//
// Semantics: for input 0, GetDOD is identity — the demosaicing output covers
// the same rect as the input (no dilation on the DOD side; the ROI already
// captured the 1-pixel halo). For any other input, HGRectNull (again "no
// dependency").
//
// ─── D0 @Helium 0xddc00 ───────────────────────────────────────────────────────
//   __ZN11HDemosaic_2D0Ev:
//     0xddc00  pushq %rbp / movq %rsp,%rbp
//     0xddc04  pushq %rbx / pushq %rax
//     0xddc06  movq  %rdi, %rbx                    ; save `this`
//     0xddc09  callq __ZN13HgcDemosaic_2D2Ev       ; base D2 in place
//     0xddc0e  movq  %rbx, %rdi                    ; arg1 = this
//     0xddc11  addq  $0x8, %rsp / popq %rbx / popq %rbp
//     0xddc17  jmp   __ZN8HGObjectdlEPv            ; HGObject::operator delete
//
// Standard "run base D2, then delete via allocator" deleting dtor. D1
// (@0xddbf0) is the 5-byte thin trampoline just before this in the __text
// section — same pattern as every other Helium node class in this repo. We
// mirror the two entry points for fidelity.
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZN13HgcDemosaic_2D2Ev       HgcDemosaic_2::~HgcDemosaic_2()  base D2
//   __ZN8HGObjectdlEPv            HGObject::operator delete(void*)
//   HGRenderer                    opaque render-context pointer
//
// The math surface (HGRect grow-by-1, identity DOD, null-for-aux-inputs) is
// fully decoded and correctly typed. The destructor chain is frontier as
// with every other Helium node so far.

import {
  HGRect,
  HGRectGrow,
  HGRectMake4i,
  HGRectNull as HGRectNullConst,
} from "./HGRect.js";
export { HGRect };

/**
 * Opaque handle for Helium's `HGRenderer*` — the render-graph context
 * threaded through every ROI/DOD/render pass. HDemosaic_2 doesn't call
 * any HGRenderer methods on its own, so this stays a brand-only type.
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * Frontier: `HgcDemosaic_2::~HgcDemosaic_2()` — the base subobject destructor
 * called from D0 @Helium 0xddc09. Not yet transcribed; every real HDemosaic_2
 * lifetime cross-references this via the destroy chain below.
 */
function HgcDemosaic_2_D2(_self: HDemosaic_2): void {
  // @Helium 0xddc09 callq __ZN13HgcDemosaic_2D2Ev
  throw new Error(
    "HgcDemosaic_2::~HgcDemosaic_2() not yet transcribed " +
      "(frontier callee @Helium 0xddc09 in HDemosaic_2::~D0)",
  );
}

/**
 * Frontier: `HGObject::operator delete(void*)` reached at @Helium 0xddc17
 * (`jmp __ZN8HGObjectdlEPv`). In TS the GC subsumes it; we cite the address
 * but the stored ref becomes reclaimable once no reference remains.
 */
function HGObject_operator_delete(_p: object): void {
  // @Helium 0xddc17 jmp __ZN8HGObjectdlEPv
  // GC subsumes operator delete — noop here. The disasm is documented above
  // so a future decoder can slot in the real allocator if needed.
}

/**
 * `HDemosaic_2` — Helium demosaicing node.
 *
 * @Helium symbols owned by this class:
 *   GetROI  @0xdd7c0
 *   GetDOD  @0xdd810
 *   ~D1      @0xddbf0
 *   ~D0      @0xddc00
 *
 * No own fields observable through the emitted methods; state lives entirely
 * on the `HgcDemosaic_2` base subobject.
 */
export class HDemosaic_2 {
  /**
   * HDemosaic_2::GetROI(HGRenderer* renderer, int inputIdx, HGRect roi)
   * @Helium 0xdd7c0.
   *
   * For input 0 (the Bayer plane) grow `roi` by 1 pixel on every side to give
   * the demosaicing kernel its neighbour halo; for any other `inputIdx`
   * return HGRectNull (no ROI dependency).
   *
   * Control flow mirrored branch-for-branch:
   *   - `inputIdx != 0` → return HGRectNull                    @0xdd7c2..0xdd7d2
   *   - else  → return HGRectGrow(roi, HGRectMake4i(-1,-1,1,1))  @0xdd7d3..0xdd809
   */
  GetROI(_renderer: HGRendererPtr, inputIdx: number, roi: HGRect): HGRect {
    // @Helium 0xdd7c0..0xdd7c2: `testl %edx, %edx ; je 0xdd7d3`
    if ((inputIdx | 0) !== 0) {
      // @Helium 0xdd7c4..0xdd7d2: return HGRectNull
      return HGRectNullConst;
    }
    // @Helium 0xdd7e0..0xdd7f4: HGRectMake4i(-1, -1, 1, 1)
    const grow = HGRectMake4i(-1, -1, 1, 1);
    // @Helium 0xdd809: jmp _HGRectGrow — TAIL CALL
    return HGRectGrow(roi, grow);
  }

  /**
   * HDemosaic_2::GetDOD(HGRenderer* renderer, int inputIdx, HGRect r)
   * @Helium 0xdd810.
   *
   * For input 0, DOD is the input rect unchanged (identity); for any other
   * `inputIdx` return HGRectNull.
   *
   * Control flow:
   *   - `inputIdx != 0` → return r                             @0xdd813..0xdd815 fall-through
   *   - else → return HGRectNull                               @0xdd817..0xdd829
   *
   * Note the disasm's frame-pointer setup at 0xdd817 for only the HGRectNull
   * branch: that's a Helium-typical "cheap identity return without a frame,
   * heavy path gets its own frame" split.
   */
  GetDOD(_renderer: HGRendererPtr, inputIdx: number, r: HGRect): HGRect {
    // @Helium 0xdd810..0xdd815: `movq %rcx, %rax ; testl %edx, %edx ; je 0xdd82a`
    if ((inputIdx | 0) === 0) {
      // @Helium fall-through @0xdd82a: return r unchanged
      return r;
    }
    // @Helium 0xdd81b..0xdd829: return HGRectNull
    return HGRectNullConst;
  }

  /**
   * ~HDemosaic_2() (D1 — complete-object in-place)
   * @Helium 0xddbf0. Not extracted separately (the disasm tool captures only
   * D0), but by the pattern universal to every other Helium node class in
   * this port (HGLensGDC_BL, HGCSolidColor, HGDemosaic_1, HMask*, etc.) D1
   * is the 5-byte thin trampoline `pushq/movq/popq/jmp __ZN13HgcDemosaic_2D2Ev`.
   */
  destroy(): void {
    // @Helium 0xddbf0 → jmp __ZN13HgcDemosaic_2D2Ev (base D2)
    HgcDemosaic_2_D2(this);
  }

  /**
   * ~HDemosaic_2() (D0 — deleting)
   * @Helium 0xddc00. Runs base D2 in place, then hands storage back via
   * `HGObject::operator delete`.
   *
   *   0xddc09  callq __ZN13HgcDemosaic_2D2Ev
   *   0xddc17  jmp   __ZN8HGObjectdlEPv
   */
  destroyAndFree(): void {
    // @Helium 0xddc09
    HgcDemosaic_2_D2(this);
    // @Helium 0xddc17 — TS GC subsumes operator delete.
    HGObject_operator_delete(this);
  }
}

