// HGSMAABlend.ts — Helium's SMAA (Subpixel Morphological Anti-Aliasing) blend
// node. This is a very thin HGNode subclass whose only exported methods are
// the ROI/DOD pair used by the render graph to negotiate rect dependencies
// with its two inputs, plus the pair of C++ destructors.
//
// SMAA is a two-pass anti-aliasing algorithm: an edge/weight-detection pass
// produces a per-pixel "blend weight" texture, and this node performs the
// final blend pass — reading the source image (input 0) and the blend-weight
// texture (input 1) to produce the anti-aliased output. The GetROI shape here
// mirrors that: input 0 needs a 1-pixel neighbour halo (the sampling kernel
// looks slightly around each pixel — grow by (-1,-1,+1,+1)), input 1 needs a
// smaller asymmetric halo (grow by (+1,+1,0,0) — the weight-texture lookup is
// biased toward the upper-left neighbour), and any other input has no ROI
// dependency.
//
// Transcribed from FCP Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGSMAABlend.GetDOD.s        @0x211cf0
//   raw-port/re/disasm/Helium.HGSMAABlend.GetROI.s        @0x211d10
//   raw-port/re/disasm/Helium.HGSMAABlend.~HGSMAABlend.s  (D0 body) @0x211ca0
//   D2 @0x211c50 — ICF-folded (no accessible body via llvm-objdump per-symbol
//   disassembly; the nm entry exists but the symbol shares its code with
//   another dtor via linker identical-code-folding). The universal Helium
//   pattern for D1/D2 pairs (thin trampoline into base D2 + optional heap
//   free) is documented in HDemosaic_2.ts and every other Helium node port;
//   we mirror it structurally here and cite @0x211c50 for the folded body.
//
// ─── GetDOD @Helium 0x211cf0 ─────────────────────────────────────────────────
//   Arguments (System V AMD64):
//     %rdi = this (HGSMAABlend*)
//     %rsi = HGRenderer* renderer
//     %edx = int inputIdx
//     %rcx / %r8 = HGRect r   ; passed by value (16-byte SysV: 2 registers)
//
//   __ZN11HGSMAABlend6GetDODEP10HGRendereri6HGRect:
//     0x211cf0  movq  %rcx, %rax                    ; %rax = r.low half
//     0x211cf3  cmpl  $0x2, %edx                    ; inputIdx < 2 ?
//     0x211cf6  jb    0x211d0b                      ; -> pass through
//     0x211cf8  pushq %rbp / movq %rsp,%rbp
//     0x211cfc  leaq  _HGRectNull(%rip), %rcx
//     0x211d03  movq  (%rcx), %rax
//     0x211d06  movq  0x8(%rcx), %r8
//     0x211d0a  popq  %rbp
//     0x211d0b  movq  %r8, %rdx                     ; return {rax=lo, rdx=hi}
//     0x211d0e  retq
//
// Semantics: for inputs 0 and 1 (the two SMAA operands), GetDOD is identity —
// the blend output covers the same rect as the input. For any other
// `inputIdx` (>= 2), return HGRectNull (no dependency).
//
// ─── GetROI @Helium 0x211d10 ─────────────────────────────────────────────────
//   __ZN11HGSMAABlend6GetROIEP10HGRendereri6HGRect:
//     0x211d10  pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
//     0x211d17  movq  %r8, %rbx                     ; save roi.high
//     0x211d1a  movq  %rcx, %r14                    ; save roi.low
//     0x211d1d  cmpl  $0x1, %edx                    ; inputIdx == 1 ?
//     0x211d20  je    0x211d3c                      ; -> grow(1,1,0,0)
//     0x211d22  testl %edx, %edx                    ; inputIdx == 0 ?
//     0x211d24  jne   0x211d64                      ; -> HGRectNull
//     ; inputIdx == 0: grow by (-1,-1,+1,+1)
//     0x211d26  movl  $0xffffffff, %edi             ; arg1 = -1
//     0x211d2b  movl  $0xffffffff, %esi             ; arg2 = -1
//     0x211d30  movl  $0x1, %edx                    ; arg3 = 1
//     0x211d35  movl  $0x1, %ecx                    ; arg4 = 1
//     0x211d3a  jmp   0x211d4a
//     ; inputIdx == 1: grow by (+1,+1,0,0)
//     0x211d3c  movl  $0x1, %edi                    ; arg1 = 1
//     0x211d41  movl  $0x1, %esi                    ; arg2 = 1
//     0x211d46  xorl  %edx, %edx                    ; arg3 = 0
//     0x211d48  xorl  %ecx, %ecx                    ; arg4 = 0
//     0x211d4a  callq _HGRectMake4i                  ; build grow rect
//     0x211d4f  movq  %rdx, %rcx                    ; arg3 = grow.high half
//     0x211d52  movq  %r14, %rdi                    ; arg1 = orig roi.low
//     0x211d55  movq  %rbx, %rsi                    ; arg2 = orig roi.high
//     0x211d58  movq  %rax, %rdx                    ; arg3 = grow.low half
//     0x211d5f  jmp   _HGRectGrow                    ; TAIL CALL
//     ; inputIdx >= 2: return HGRectNull
//     0x211d64  leaq  _HGRectNull(%rip), %rcx
//     0x211d6b  movq  (%rcx), %rax
//     0x211d6e  movq  0x8(%rcx), %rdx
//     0x211d72  retq
//
// Semantics: SMAA final-blend samples input 0 (source image) with a 1-pixel
// symmetric halo and input 1 (blend-weight texture) with a (+1,+1,0,0)
// asymmetric halo. Any other input has no ROI dependency.
//
// ─── D0 @Helium 0x211ca0 ─────────────────────────────────────────────────────
//   __ZN11HGSMAABlendD0Ev:
//     0x211ca0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x211ca6  movq  %rdi, %rbx                    ; save `this`
//     0x211ca9  leaq  0x81cfa0(%rip), %rax          ; = vtable-for-HGSMAABlend
//     0x211cb0  movq  %rax, (%rdi)                  ; this->vptr = vtable
//     0x211cb3  movq  0x198(%rdi), %rax             ; owned pointer field @offset 0x198
//     0x211cba  testq %rax, %rax                    ; if non-null:
//     0x211cbd  je    0x211ccd
//     0x211cbf  movq  -0x8(%rax), %rdi              ; header at [ptr-8] holds real base
//     0x211cc3  testq %rdi, %rdi                    ; if non-null:
//     0x211cc6  je    0x211ccd
//     0x211cc8  callq __ZdlPv                       ; operator delete(that base)
//     0x211ccd  movq  %rbx, %rdi
//     0x211cd0  callq __ZN6HGNodeD2Ev                ; HGNode::~HGNode() — base D2
//     0x211cd5  movq  %rbx, %rdi
//     0x211cde  jmp   __ZN8HGObjectdlEPv             ; HGObject::operator delete
//
// The D0 chain here is one step richer than the HDemosaic_2 pattern: before
// walking to the base D2 it frees a single heap-owned field at *(this+0x198)
// via the standard `__ZdlPv` (operator delete). The `-0x8(%rax)` load is the
// classic Itanium-ABI "array cookie / new[]-header" prefix: `operator new[]`
// stores the base pointer 8 bytes before the returned payload, and the
// corresponding `operator delete` expects that adjusted base. We surface all
// of this in the doc string; in TS the GC subsumes both frees.
//
// STRUCT LAYOUT (recovered from D0):
//   HGSMAABlend {
//     +0x000  vptr                    (set to `vtable-for-HGSMAABlend`
//                                      resident at rip-relative +0x81cfa0
//                                      from 0x211ca9 in the Helium binary)
//     +0x008..+0x197                  (opaque — owned by HGNode base subobject)
//     +0x198  heap-owned pointer      (freed via `operator delete` with the
//                                      -8 array-cookie adjustment; nulled or
//                                      absent -> D0 skips the free)
//   }
//
// ─── D2 @Helium 0x211c50 ─────────────────────────────────────────────────────
// ICF-folded — no accessible per-symbol body via
//   `llvm-objdump --arch=x86_64 -d --disassemble-symbols=__ZN11HGSMAABlendD2Ev`
// (the linker collapsed it with an identical-code sibling). By the universal
// Helium pattern shared with HDemosaic_2, HGLensGDC_BL, HMaskCompFirstPass,
// and every other HGNode subclass in this port, D2 is the same body as D0
// minus the trailing `HGObject::operator delete` — i.e. reset vptr, free the
// +0x198 owned pointer if non-null, then chain into HGNode::~HGNode.
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZN6HGNodeD2Ev           HGNode::~HGNode()               @0x211cd0 callq
//   __ZN8HGObjectdlEPv        HGObject::operator delete(void*) @0x211cde jmp
//   __ZdlPv                   ::operator delete(void*)         @0x211cc8 callq
//   HGRenderer                opaque render-context pointer
//
// The math surface (per-input HGRect ROI/DOD selection) is fully decoded and
// bit-exact against `_HGRectNull`, `_HGRectMake4i`, and `_HGRectGrow`
// (already-ported HGRect.ts).

import {
  HGRect,
  HGRectGrow,
  HGRectMake4i,
  HGRectNull as HGRectNullConst,
} from "./HGRect.js";
export { HGRect };

/**
 * Opaque handle for Helium's `HGRenderer*` — the render-graph context
 * threaded through every ROI/DOD/render pass. HGSMAABlend doesn't call any
 * HGRenderer methods on its own, so this stays a brand-only type.
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * Frontier: `HGNode::~HGNode()` — the base subobject destructor called from
 * D0 @Helium 0x211cd0 (and, by the shared HGNode pattern, from the folded D2
 * at 0x211c50). HGNode is not yet transcribed; every HGSMAABlend lifetime
 * cross-references this via the destroy chain below.
 */
function HGNode_D2(_self: HGSMAABlend): void {
  // @Helium 0x211cd0 callq __ZN6HGNodeD2Ev
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x211cd0 in HGSMAABlend::~D0)",
  );
}

/**
 * Frontier: `HGObject::operator delete(void*)` reached at @Helium 0x211cde
 * (`jmp __ZN8HGObjectdlEPv`). In TS the GC subsumes it; we cite the address
 * but the storage becomes reclaimable once no reference remains.
 */
function HGObject_operator_delete(_p: object): void {
  // @Helium 0x211cde jmp __ZN8HGObjectdlEPv
  // GC subsumes operator delete — noop here.
}

/**
 * Frontier: `::operator delete(void*)` reached at @Helium 0x211cc8
 * (`callq __ZdlPv`) to free the heap-owned pointer at `this+0x198`. In TS
 * the GC subsumes it; documented so the address chain stays traceable.
 */
function cxx_operator_delete(_p: object | null): void {
  // @Helium 0x211cc8 callq __ZdlPv (Itanium: expects payload-pointer-minus-8)
  // GC subsumes operator delete — noop here.
}

/**
 * `HGSMAABlend` — Helium SMAA final-blend node.
 *
 * @Helium symbols owned by this class:
 *   GetDOD  @0x211cf0
 *   GetROI  @0x211d10
 *   ~D0      @0x211ca0
 *   ~D2      @0x211c50 (ICF-folded — pattern mirrored from D0)
 *
 * Observable fields (recovered from D0):
 *   ownedAt0x198 — a heap-owned pointer freed on destruction. Nulled or
 *   absent -> D0 skips the free. Kept as an opaque brand here because the
 *   allocator side (`operator new[]` with the -8 header cookie) is not yet
 *   decoded.
 */
export class HGSMAABlend {
  /**
   * The heap-owned pointer at `this+0x198`, freed on ~D0. Kept as a nullable
   * opaque brand until the allocator side (frontier) is transcribed.
   * @Helium struct offset +0x198
   */
  ownedAt0x198: { readonly __brand: "HGSMAABlend.ownedAt0x198" } | null = null;

  /**
   * HGSMAABlend::GetDOD(HGRenderer* renderer, int inputIdx, HGRect r)
   * @Helium 0x211cf0.
   *
   * For inputs 0 and 1 (the SMAA source + blend-weight operands), DOD is
   * the input rect unchanged; for any `inputIdx >= 2` return HGRectNull.
   *
   * Control flow mirrored branch-for-branch:
   *   - `(uint32)inputIdx < 2` → return r          @0x211cf3..0x211cf6 (jb pass-through)
   *   - else → return HGRectNull                    @0x211cf8..0x211d0e
   */
  GetDOD(_renderer: HGRendererPtr, inputIdx: number, r: HGRect): HGRect {
    // @Helium 0x211cf3..0x211cf6: `cmpl $0x2, %edx ; jb 0x211d0b` — unsigned
    // compare, so negative inputIdx (interpreted as a huge unsigned) also
    // falls through to the HGRectNull branch. Mirror the unsigned semantics.
    if ((inputIdx >>> 0) < 2) {
      // @Helium 0x211d0b fall-through: return r unchanged
      return r;
    }
    // @Helium 0x211cf8..0x211d0e: return HGRectNull
    return HGRectNullConst;
  }

  /**
   * HGSMAABlend::GetROI(HGRenderer* renderer, int inputIdx, HGRect roi)
   * @Helium 0x211d10.
   *
   * SMAA sampling halos:
   *   - `inputIdx == 0` (source image)         → grow by (-1,-1,+1,+1)  @0x211d26..0x211d3a
   *   - `inputIdx == 1` (blend-weight texture) → grow by (+1,+1, 0, 0)  @0x211d3c..0x211d48
   *   - otherwise                              → HGRectNull             @0x211d64..0x211d76
   *
   * Control flow mirrored branch-for-branch:
   *   0x211d1d  cmpl $0x1, %edx ; je 0x211d3c   → grow(1,1,0,0)
   *   0x211d22  testl %edx, %edx ; jne 0x211d64 → HGRectNull
   *   fall-through                              → grow(-1,-1,1,1)
   *   common tail 0x211d4a: `callq _HGRectMake4i` then `jmp _HGRectGrow`
   */
  GetROI(_renderer: HGRendererPtr, inputIdx: number, roi: HGRect): HGRect {
    // @Helium 0x211d1d..0x211d20: `cmpl $0x1, %edx ; je 0x211d3c`
    if ((inputIdx | 0) === 1) {
      // @Helium 0x211d3c..0x211d48: HGRectMake4i(1, 1, 0, 0)
      const grow = HGRectMake4i(1, 1, 0, 0);
      // @Helium 0x211d5f: jmp _HGRectGrow — TAIL CALL
      return HGRectGrow(roi, grow);
    }
    // @Helium 0x211d22..0x211d24: `testl %edx, %edx ; jne 0x211d64`
    if ((inputIdx | 0) !== 0) {
      // @Helium 0x211d64..0x211d76: return HGRectNull
      return HGRectNullConst;
    }
    // @Helium 0x211d26..0x211d3a: HGRectMake4i(-1, -1, 1, 1)
    const grow = HGRectMake4i(-1, -1, 1, 1);
    // @Helium 0x211d5f: jmp _HGRectGrow — TAIL CALL
    return HGRectGrow(roi, grow);
  }

  /**
   * ~HGSMAABlend() (D2 — complete-object in-place)
   * @Helium 0x211c50. ICF-folded — no accessible per-symbol body via
   * llvm-objdump. By the universal Helium HGNode-subclass pattern (see
   * HDemosaic_2, HGLensGDC_BL, HMaskCompFirstPass etc.), D2 mirrors D0
   * minus the trailing `HGObject::operator delete`: reset vptr, free the
   * +0x198 owned pointer if non-null, then chain into HGNode::~HGNode.
   */
  destroy(): void {
    // @Helium 0x211c50 — folded body reconstructed from the D0 pattern:
    // free the +0x198 owned pointer if present, then chain to HGNode::D2.
    if (this.ownedAt0x198 !== null) {
      // Corresponds to `movq -0x8(%rax), %rdi ; testq %rdi ; callq __ZdlPv`
      cxx_operator_delete(this.ownedAt0x198);
      this.ownedAt0x198 = null;
    }
    HGNode_D2(this);
  }

  /**
   * ~HGSMAABlend() (D0 — deleting)
   * @Helium 0x211ca0. Resets vptr, frees the +0x198 owned pointer (with the
   * Itanium `-8` array-cookie adjustment) via `operator delete`, chains into
   * `HGNode::~HGNode()`, then hands the storage back via
   * `HGObject::operator delete`.
   *
   *   0x211ca9  leaq  0x81cfa0(%rip), %rax          ; vtable-for-HGSMAABlend
   *   0x211cb0  movq  %rax, (%rdi)                  ; this->vptr = vtable
   *   0x211cb3  movq  0x198(%rdi), %rax             ; owned pointer
   *   0x211cbd  je    0x211ccd                      ; skip if null
   *   0x211cbf  movq  -0x8(%rax), %rdi              ; array-cookie base
   *   0x211cc6  je    0x211ccd                      ; skip if null
   *   0x211cc8  callq __ZdlPv                       ; operator delete
   *   0x211cd0  callq __ZN6HGNodeD2Ev                ; HGNode::~HGNode()
   *   0x211cde  jmp   __ZN8HGObjectdlEPv             ; HGObject operator delete
   */
  destroyAndFree(): void {
    // @Helium 0x211ca9..0x211cb0 — reset vptr. TS has no vptr; noop.
    // @Helium 0x211cb3..0x211cc8 — free the +0x198 owned pointer if present.
    if (this.ownedAt0x198 !== null) {
      cxx_operator_delete(this.ownedAt0x198);
      this.ownedAt0x198 = null;
    }
    // @Helium 0x211cd0 callq __ZN6HGNodeD2Ev
    HGNode_D2(this);
    // @Helium 0x211cde jmp __ZN8HGObjectdlEPv — TS GC subsumes operator delete.
    HGObject_operator_delete(this);
  }
}
