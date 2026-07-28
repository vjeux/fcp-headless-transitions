/**
 * HGCRetimeFullRez — Helium retime node (full-resolution variant).
 *
 * Ported class exposes the two decoded pure-geometry virtual overrides:
 *   - GetDOD (Domain-Of-Definition query)  @ Helium 0x00000000001942b0
 *   - GetROI (Region-Of-Interest query)    @ Helium 0x00000000001942d0
 * Plus the trivial C1/C0 destructor thunks (which delegate to the ported
 * base-class HgcRetimeFullRez::~HgcRetimeFullRez, not yet transcribed —
 * throwing stub below).
 *
 * NOTE ON THE NAME: the destructor at 0x194280 (D1) is `jmp HgcRetimeFullRezD2`
 * (note lowercase middle: Hgc vs HGC). Both classes co-exist in the binary —
 * HGCRetimeFullRez is the outward-facing C++ vtable class and HgcRetimeFullRez
 * is (from all indications) the internal implementation base whose constructor
 * installs the vtable of the outer class. This port models only the outer
 * class; the base-class dtor + operator delete are called through stubs.
 *
 * @classAddr Helium 0x00000000001942b0 (GetDOD), 0x00000000001942d0 (GetROI),
 *            0x0000000000194280 (D1), 0x0000000000194290 (D0/deleting).
 */

import type { HGRect, HGRectf } from "./HGRect";
import {
  HGRectNull,
  HGRectIntegral,
  HGRectFloat,
} from "./HGRect";
import { HGRectfInit } from "./HGRectf";

const f32 = Math.fround;

/**
 * Forward declaration. Retime nodes receive a pointer to the active renderer;
 * GetDOD and GetROI ignore it (only edx/index and the passed rect matter), so
 * the type is opaque here. See the disassembly: rsi is loaded but never dereferenced.
 */
export interface HGRenderer {
  readonly __brand: "HGRenderer";
}

/**
 * Base-class destructor stub — the native `HgcRetimeFullRez::~HgcRetimeFullRez` at
 * Helium @0x2bd754 (D2) is a separate class that hasn't been transcribed yet.
 * The C1 dtor of HGCRetimeFullRez @0x194280 is nothing but `pushq %rbp; movq %rsp,%rbp;
 * popq %rbp; jmp _ZN16HgcRetimeFullRezD2Ev` — a pure tail-call.
 * The C0 (deleting) dtor @0x194290 additionally calls `HGObject::operator delete(this)`
 * after the base dtor returns.
 */
function hgcRetimeFullRez_baseDtor(_self: HGCRetimeFullRez): void {
  // Not yet transcribed: HgcRetimeFullRez::~HgcRetimeFullRez @0x00000000002bd754 (D2)
  throw new Error(
    "HGCRetimeFullRez::~HGCRetimeFullRez — base class HgcRetimeFullRez::D2 " +
      "not yet transcribed (Helium @0x00000000002bd754)"
  );
}

/**
 * HGObject::operator delete(void*) stub — @0x??? in Helium. The deleting dtor
 * (D0) tail-calls it. In TS we have GC, so a deleting dtor is meaningless; we
 * still surface it as a distinct method so callers that observably relied on
 * `delete` semantics fail loudly rather than silently no-op.
 */
function hgObject_operatorDelete(_self: unknown): void {
  // Not yet transcribed: HGObject::operator delete(void*) — Helium symbol __ZN8HGObjectdlEPv
  throw new Error(
    "HGCRetimeFullRez::~HGCRetimeFullRez (deleting) — HGObject::operator delete " +
      "not yet transcribed (Helium symbol __ZN8HGObjectdlEPv, called from D0 @0x000000000019429e)"
  );
}

/**
 * HGCRetimeFullRez — a retime kernel node.
 *
 * Instance layout observed:
 *   this[0x000] ...                            (base HGObject / HgcRetimeFullRez fields)
 *   this[0x1a0] : float32 horizontalKernelSize (used only by GetROI @0x1942e3)
 *   this[0x1a4] : float32 verticalKernelSize   (used only by GetROI @0x1942eb)
 *
 * Only these two field offsets are decoded by this port; the remainder of the
 * struct comes from base-class construction (not yet transcribed).
 */
export class HGCRetimeFullRez {
  /**
   * `this[0x1a0]` — horizontal half-kernel size in pixels (float32). Referenced
   * by `movss 0x1a0(%rdi), %xmm2` @0x1942e3.
   */
  horizontalKernelSize: number = f32(0);

  /**
   * `this[0x1a4]` — vertical half-kernel size in pixels (float32). Referenced
   * by `movss 0x1a4(%rdi), %xmm3` @0x1942eb.
   */
  verticalKernelSize: number = f32(0);

  /**
   * D1 destructor — @0x0000000000194280.
   *
   *   0000000000194280  pushq  %rbp
   *   0000000000194281  movq   %rsp, %rbp
   *   0000000000194284  popq   %rbp
   *   0000000000194285  jmp    __ZN16HgcRetimeFullRezD2Ev
   *
   * Pure tail-call to the base-class D2. Nothing else.
   *
   * @dtorAddr Helium 0x0000000000194280 (D1)
   */
  destroy(): void {
    hgcRetimeFullRez_baseDtor(this);
  }

  /**
   * D0 destructor — @0x0000000000194290 — the "deleting" variant. Runs the
   * base dtor, then `HGObject::operator delete(this)`.
   *
   *   0000000000194290  pushq  %rbp
   *   0000000000194291  movq   %rsp, %rbp
   *   0000000000194294  pushq  %rbx
   *   0000000000194295  pushq  %rax
   *   0000000000194296  movq   %rdi, %rbx                     ; save this
   *   0000000000194299  callq  __ZN16HgcRetimeFullRezD2Ev     ; base dtor
   *   000000000019429e  movq   %rbx, %rdi                     ; arg = this
   *   00000000001942a7  jmp    __ZN8HGObjectdlEPv             ; operator delete
   *
   * @dtorAddr Helium 0x0000000000194290 (D0)
   */
  destroyAndDelete(): void {
    hgcRetimeFullRez_baseDtor(this);
    hgObject_operatorDelete(this);
  }

  /**
   * GetDOD — Domain-Of-Definition query. Signature (from mangled name):
   *   HGRect GetDOD(HGRenderer* renderer, int index, HGRect inRect);
   *
   * The x86_64 ABI packs the 16-byte HGRect return into rax:rdx and the input
   * HGRect argument into rcx:r8.
   *
   *   00000000001942b0  movq  %rcx, %rax                       ; rax = inRect.lo
   *   00000000001942b3  cmpl  $0x3, %edx                       ; index vs 3
   *   00000000001942b6  jb    0x1942cb                         ; if index < 3, skip
   *   00000000001942b8  pushq %rbp
   *   00000000001942b9  movq  %rsp, %rbp
   *   00000000001942bc  leaq  _HGRectNull(%rip), %rcx          ; &HGRectNull
   *   00000000001942c3  movq  (%rcx), %rax                     ; rax = HGRectNull.lo
   *   00000000001942c6  movq  0x8(%rcx), %r8                   ; r8  = HGRectNull.hi
   *   00000000001942ca  popq  %rbp
   *   00000000001942cb  movq  %r8, %rdx                        ; rdx = (rax/rdx = result)
   *   00000000001942ce  retq
   *
   * Observable behavior:
   *   - index >= 3  → return HGRectNull
   *   - index <  3  → return inRect unchanged
   * (Note: the renderer pointer in rsi is never touched.)
   *
   * @method Helium 0x00000000001942b0
   */
  GetDOD(_renderer: HGRenderer | null, index: number, inRect: HGRect): HGRect {
    // cmpl $0x3, %edx ; jb 0x1942cb  — unsigned compare; jb == "below" = <
    // So the guard is "if (index >= 3)" the branch is NOT taken and we go into HGRectNull load.
    if ((index >>> 0) >= 3) {
      // leaq _HGRectNull(%rip), %rcx  — @0x1942bc
      return { ...HGRectNull };
    }
    // Fall-through: return the input rect unchanged.
    return inRect;
  }

  /**
   * GetROI — Region-Of-Interest query. Signature:
   *   HGRect GetROI(HGRenderer* renderer, int index, HGRect inRect);
   *
   * Same ABI packing as GetDOD (inRect in rcx:r8, result in rax:rdx). This
   * function is the meat of the retime kernel — it inflates the input rect by
   * `(horizontalKernelSize + 2, verticalKernelSize + 2)` in both directions,
   * then integralises. The `+ 2` and `- 2` come from RIP-relative float32
   * constants:
   *
   *   0x0000000000194280 + 0x0023aa15 + 8 = 0x00000000003ced10
   *      bytes: 00 00 00 c0  →  float32 = -2.0f
   *   0x0000000000194306 + 0x00236c7e + 8 = 0x00000000003caf8c
   *      bytes: 00 00 00 40  →  float32 = +2.0f
   *
   * Disassembly:
   *
   *   00000000001942d0  pushq %rbp
   *   00000000001942d1  movq  %rsp, %rbp
   *   00000000001942d4  pushq %r15 / %r14 / %rbx / (align)
   *   00000000001942da  movq  %r8, %r14                        ; r14 = inRect.hi
   *   00000000001942dd  movq  %rcx, %rbx                       ; rbx = inRect.lo
   *   00000000001942e0  movl  %edx, %r15d                      ; r15 = index
   *   00000000001942e3  movss 0x1a0(%rdi), %xmm2               ; xmm2 = this.hKernel
   *   00000000001942eb  movss 0x1a4(%rdi), %xmm3               ; xmm3 = this.vKernel
   *   00000000001942f3  movss 0x23aa15(%rip), %xmm1            ; xmm1 = -2.0f (const @0x3ced10)
   *   00000000001942fb  movaps %xmm1, %xmm0                    ; xmm0 = -2.0f
   *   00000000001942fe  subss %xmm2, %xmm0                     ; xmm0 = -2 - hKernel
   *   0000000000194302  subss %xmm3, %xmm1                     ; xmm1 = -2 - vKernel
   *   0000000000194306  movss 0x236c7e(%rip), %xmm4            ; xmm4 = +2.0f (const @0x3caf8c)
   *   000000000019430e  addss %xmm4, %xmm2                     ; xmm2 = hKernel + 2
   *   0000000000194312  addss %xmm4, %xmm3                     ; xmm3 = vKernel + 2
   *   0000000000194316  callq _HGRectfMake4f                   ; xmm0..3 -> HGRectf packed in xmm0+xmm1
   *   000000000019431b  cmpl  $0x1, %r15d
   *   000000000019431f  ja    0x194346                          ; if index > 1, take tail path
   *
   *   ; --- index in {0,1}: add inRect (as packed i32→f32) and integralise ---
   *   0000000000194321  movq  %r14, %xmm2                      ; xmm2 = inRect.hi as 2×i32
   *   0000000000194326  movq  %rbx, %xmm3                      ; xmm3 = inRect.lo as 2×i32
   *   000000000019432b  cvtdq2ps %xmm2, %xmm2                  ; xmm2 = float(inRect.hi lanes)
   *   000000000019432e  addps %xmm2, %xmm1                     ; xmm1 = (right/bottom side of kernel-rect) + (right/bottom of inRect)
   *   0000000000194331  cvtdq2ps %xmm3, %xmm2                  ; xmm2 = float(inRect.lo lanes)
   *   0000000000194334  addps %xmm2, %xmm0                     ; xmm0 = (left/top side of kernel-rect) + (left/top of inRect)
   *   0000000000194341  jmp   _HGRectIntegral                   ; tail-call, packs xmm0/xmm1 -> HGRect
   *
   *   ; --- index > 1: NO inflation applied; the HGRectfMake4f result is discarded ---
   *   0000000000194346  cmpl  $0x2, %r15d
   *   000000000019434a  je    0x19435a                          ; index == 2 → passthrough inRect
   *   ; index > 2 → return HGRectNull
   *   000000000019434c  leaq  _HGRectNull(%rip), %rax
   *   0000000000194353  movq  (%rax), %rbx
   *   0000000000194356  movq  0x8(%rax), %r14
   *   000000000019435a  movq  %rbx, %rax                       ; result.lo = rbx
   *   000000000019435d  movq  %r14, %rdx                       ; result.hi = r14
   *   000000000019436a  retq
   *
   * Observable behavior:
   *   - index == 0 or 1 → inflated integral rect around inRect
   *   - index == 2      → return inRect unchanged
   *   - index >= 3      → return HGRectNull
   *
   * @method Helium 0x00000000001942d0
   */
  GetROI(_renderer: HGRenderer | null, index: number, inRect: HGRect): HGRect {
    const idx = index >>> 0;

    // -----------------------------------------------------------------
    // Pre-call phase (always executed by the native code, even when its
    // result is discarded on the index>1 paths). We faithfully reproduce
    // the math even though it's semantically dead on those paths — the
    // native binary has no branch guarding it.
    // -----------------------------------------------------------------
    const hKernel = f32(this.horizontalKernelSize); // this[0x1a0] — @0x1942e3
    const vKernel = f32(this.verticalKernelSize);   // this[0x1a4] — @0x1942eb

    // xmm1 = -2.0f, then xmm0 = -2 - hKernel, xmm1 = -2 - vKernel.
    // Constants: -2.0f @ Helium data @0x3ced10, +2.0f @ Helium data @0x3caf8c.
    const NEG_TWO = f32(-2.0); // @0x00000000003ced10
    const POS_TWO = f32(+2.0); // @0x00000000003caf8c
    const kernelLeft   = f32(NEG_TWO - hKernel);           // subss %xmm2, %xmm0  @0x1942fe
    const kernelTop    = f32(NEG_TWO - vKernel);           // subss %xmm3, %xmm1  @0x194302
    const kernelRight  = f32(hKernel + POS_TWO);           // addss %xmm4, %xmm2  @0x19430e
    const kernelBottom = f32(vKernel + POS_TWO);           // addss %xmm4, %xmm3  @0x194312

    // _HGRectfMake4f is the C entry point at Helium @0x00000000000fd4a0.
    // Its body is a min/max normaliser with NaN-collapse — identical to the
    // TS `HGRectfInit(x0,y0,x1,y1)` port (which decodes the same insertps/
    // minps/maxps/cmpunordps/blendvps sequence).
    const kernelRect: HGRectf = HGRectfInit(
      kernelLeft,
      kernelTop,
      kernelRight,
      kernelBottom,
    );

    // -----------------------------------------------------------------
    // Index dispatch, mirroring @0x19431b/0x194346 exactly.
    // -----------------------------------------------------------------
    if (idx > 1) {
      // ja 0x194346  ("above" = unsigned strict >).
      // cmpl $0x2, %r15d ; je 0x19435a  — @0x194346/0x19434a.
      if (idx === 2) {
        // Passthrough: return original inRect (rbx/r14 unchanged from function entry).
        return inRect;
      }
      // idx >= 3: return HGRectNull.
      return { ...HGRectNull };
    }

    // -----------------------------------------------------------------
    // idx in {0,1}: fold inRect (int32 lanes) into the kernel rect, then
    // integralise. The native code interprets `inRect` as 4 packed i32s
    // via `movq r14/rbx, xmmN` + `cvtdq2ps` — i.e. the HGRect fields are
    // treated as i32, converted to f32, then added as packed floats.
    // -----------------------------------------------------------------
    // In our HGRect representation (x, y, right, bottom : int32), the two
    // 64-bit halves are: lo = {x, y}  hi = {right, bottom}. So:
    //   xmm0 += (float(x),      float(y))       → kernel-left/top   + in-left/top
    //   xmm1 += (float(right),  float(bottom))  → kernel-right/bot  + in-right/bot
    // Both are integer-to-float lane-wise conversions; Math.fround captures
    // the SSE cvtdq2ps rounding (round-to-nearest-even to f32).
    const inRectAsF: HGRectf = HGRectFloat(inRect);
    const finalRect: HGRectf = {
      x:      f32(kernelRect.x      + inRectAsF.x),      // addps @0x194334 (low lane of xmm0)
      y:      f32(kernelRect.y      + inRectAsF.y),      // addps @0x194334 (high lane of xmm0)
      right:  f32(kernelRect.right  + inRectAsF.right),  // addps @0x19432e (low lane of xmm1)
      bottom: f32(kernelRect.bottom + inRectAsF.bottom), // addps @0x19432e (high lane of xmm1)
    };

    // jmp _HGRectIntegral — packs xmm0/xmm1 (HGRectf) into a returned HGRect.
    // @0x0000000000194341 → HGRectIntegral() port in ./HGRect.ts.
    return HGRectIntegral(finalRect);
  }
}
