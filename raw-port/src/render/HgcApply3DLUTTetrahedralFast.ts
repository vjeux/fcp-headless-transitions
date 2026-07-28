// HgcApply3DLUTTetrahedralFast.ts — Helium HgcApply3DLUTTetrahedralFast:
// the "fast tetrahedral 3D-LUT apply" render node. This class derives from
// HgcApply3DLUTTetrahedralFast_basekernel (base kernel with the actual
// per-pixel tetrahedral-lookup math — undecoded at this layer). At THIS
// derived class only the four exported symbols are transcribed:
//
//   @0x73fa0  HgcApply3DLUTTetrahedralFast::~HgcApply3DLUTTetrahedralFast() [D1]
//   @0x73fb0  HgcApply3DLUTTetrahedralFast::~HgcApply3DLUTTetrahedralFast() [D0]
//   @0x73fd0  HgcApply3DLUTTetrahedralFast::GetDOD(HGRenderer*, int, HGRect)
//   @0x73ff0  HgcApply3DLUTTetrahedralFast::GetROI(HGRenderer*, int, HGRect)
//
// GetDOD:
//   The domain-of-definition depends on the OUTPUT selector `edx`:
//     edx == 0  → return the CALLER's requested rect UNCHANGED (a straight
//                 passthrough — the LUT-apply node doesn't grow the pixel
//                 domain of its input; its DOD is the caller's).
//     edx != 0  → HGRectNull.
//   Unlike the more common GetDOD which delegates through
//   HGRenderer::GetDOD(input(0)), this class trusts the CALLER's request as
//   its DOD for the primary output — the by-value HGRect passed as arg
//   (in %rcx:%r8) is echoed back in the return regs (%rax:%rdx).
//
// GetROI:
//   Three input-slot cases keyed on inputIdx `edx` (into r15d):
//     inputIdx == 0 → passthrough the caller's requested rect.
//     inputIdx == 1 → HGRectMake4i(0, 0, n*n + 1, n + 1) where n is the
//                     3D-LUT-per-axis size read from `this->f_1a0` (i32).
//                     This is the LUT's own texture ROI — a rectangle
//                     whose width is n*n+1 (a common "unrolled 3D LUT into
//                     a 2D texture" convention: n^2 columns for one slice
//                     of the cube per column-strip, plus an extra column
//                     for edge-clamp / linear-sampling guard) and whose
//                     height is n+1 (n rows plus one row of guard).
//                     HGRectMake4i normalises (a<c ? a : c, …).
//     inputIdx >= 2 (or any other non-{0,1} value) → HGRectNull.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice).
// Disasm saved: raw-port/re/disasm/Helium.HgcApply3DLUTTetrahedralFast.*.s.
//
// Undecoded frontier (each is a THROWing stub citing its callee addr):
//   HgcApply3DLUTTetrahedralFast_basekernel::~*_basekernel() @Helium
//     __ZN39HgcApply3DLUTTetrahedralFast_basekernelD2Ev
//     (tail-called from D1 @0x73fa5, direct-called from D0 @0x73fb9)
//   HGObject::operator delete(void*) @Helium __ZN8HGObjectdlEPv
//     (tail-called from D0 @0x73fc7)
//
// Numerics: pure int32 field access + int32 arithmetic on the LUT size.
// `n * n` uses imull → same as JS Math.imul (32-bit signed multiplication
// with modular wraparound). No floats.

import {
  HGRect,
  HGRectNull as HGRectNullConst,
  HGRectMake4i as HGRectMake4iCanonical,
} from "./HGRect";

/** HGNode — opaque render-graph node handle. */
export interface HGNode {}
/** HGRenderer — opaque render context. Unread by every method in this file. */
export interface HGRenderer {}

/** _HGRectNull sentinel from Helium __DATA_CONST @0x3d2284 = {0,0,0,0}.
 *  Loaded in GetDOD @0x73fdb and GetROI @0x7402e via rip-relative leaq. */
const HGRectNull: HGRect = HGRectNullConst;

/** HGRectMake4i(x0, y0, x1, y1) — canonical Helium constructor with min/max
 *  normalisation. Called from GetROI @0x74016 with (0, 0, n*n+1, n+1). */
function HGRectMake4i(x0: number, y0: number, x1: number, y1: number): HGRect {
  return HGRectMake4iCanonical(x0, y0, x1, y1);
}

/** HgcApply3DLUTTetrahedralFast_basekernel::~HgcApply3DLUTTetrahedralFast_basekernel()
 *  — base kernel destructor at Helium
 *  __ZN39HgcApply3DLUTTetrahedralFast_basekernelD2Ev. Called from D1 @0x73fa5
 *  (jmp) and D0 @0x73fb9 (callq). Not yet transcribed. */
function HgcApply3DLUTTetrahedralFast_basekernel_dtor(_self: HgcApply3DLUTTetrahedralFast): void {
  throw new Error(
    "HgcApply3DLUTTetrahedralFast_basekernel::~HgcApply3DLUTTetrahedralFast_basekernel @Helium __ZN39HgcApply3DLUTTetrahedralFast_basekernelD2Ev @0x73fa5/@0x73fb9 not yet transcribed",
  );
}

/** HGObject::operator delete(void*) — Helium __ZN8HGObjectdlEPv, tail-called
 *  from D0 @0x73fc7. Not yet transcribed. */
function HGObject_operatorDelete(_p: HgcApply3DLUTTetrahedralFast): void {
  throw new Error("HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0x73fc7 not yet transcribed");
}

/**
 * HgcApply3DLUTTetrahedralFast — the "fast tetrahedral 3D LUT apply" node.
 *
 * Instance layout observed from GetROI's `movl 0x1a0(%rdi), %ecx`:
 *   +0x1a0  int32  f_1a0  — the 3D-LUT-per-axis size (n). All other fields
 *                            are contributed by the base class family and
 *                            are undecoded at this layer.
 */
export class HgcApply3DLUTTetrahedralFast {
  /** +0x1a0 int32 3D LUT dimension `n` (per-axis grid resolution).
   *  Uninitialised here — assumed to be written by the base class or a
   *  parameter-setter path not visible in the four decoded symbols. */
  f_1a0: number = 0;

  /**
   * HgcApply3DLUTTetrahedralFast::~HgcApply3DLUTTetrahedralFast() [D1] @0x73fa0.
   *   @0x73fa0 pushq %rbp ; movq %rsp, %rbp ; popq %rbp
   *   @0x73fa5 jmp   HgcApply3DLUTTetrahedralFast_basekernel::~*_basekernel
   */
  destroy(): void {
    // @0x73fa5 tail-jmp base D2.
    HgcApply3DLUTTetrahedralFast_basekernel_dtor(this);
  }

  /**
   * HgcApply3DLUTTetrahedralFast::~HgcApply3DLUTTetrahedralFast() [D0] @0x73fb0.
   *   @0x73fb0 pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; pushq %rax
   *   @0x73fb6 movq  %rdi, %rbx
   *   @0x73fb9 callq HgcApply3DLUTTetrahedralFast_basekernel::~*_basekernel
   *   @0x73fbe movq  %rbx, %rdi
   *   @0x73fc1 addq  $0x8, %rsp ; popq %rbx ; popq %rbp
   *   @0x73fc7 jmp   HGObject::operator delete
   */
  destroyAndDelete(): void {
    // @0x73fb9 callq base D2
    HgcApply3DLUTTetrahedralFast_basekernel_dtor(this);
    // @0x73fc7 tail-jmp HGObject::operator delete(this)
    HGObject_operatorDelete(this);
  }

  /**
   * HgcApply3DLUTTetrahedralFast::GetDOD(HGRenderer*, int, HGRect) @0x73fd0.
   *
   * ABI: %rdi=this, %rsi=renderer (unread), %edx=outputIdx, %rcx:%r8 = the
   * 16-byte requested HGRect passed by value (lo half in rcx, hi in r8).
   * Return: HGRect in %rax:%rdx.
   *
   *   @0x73fd0 movq  %rcx, %rax                    ; rax = requested lo
   *   @0x73fd3 testl %edx, %edx
   *   @0x73fd5 je    0x73fea                      ; if outputIdx == 0 → skip HGRectNull load
   *   @0x73fd7 pushq %rbp ; movq %rsp, %rbp
   *   @0x73fdb leaq  _HGRectNull(%rip), %rcx
   *   @0x73fe2 movq  (%rcx), %rax                 ; rax = HGRectNull.lo
   *   @0x73fe5 movq  0x8(%rcx), %r8               ; r8  = HGRectNull.hi
   *   @0x73fe9 popq  %rbp
   *   @0x73fea movq  %r8, %rdx                    ; rdx = high half of return
   *   @0x73fed retq
   *
   * Semantics: outputIdx == 0 → passthrough the caller's rect (rax stays
   * = rcx and rdx becomes = r8 in the join). Any other outputIdx →
   * HGRectNull. NOTE this INVERTS the usual "0 → real / non-zero → null"
   * convention shape at the source level: here the "0" branch is the
   * short-path (skips the null-load).
   */
  GetDOD(_renderer: HGRenderer, outputIdx: number, requested: HGRect): HGRect {
    const edx = outputIdx | 0;
    if (edx !== 0) {
      // @0x73fdb..@0x73fe9 load HGRectNull.
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0x73fd0 rax=rcx (lo), @0x73fea rdx=r8 (hi): passthrough.
    return {
      x: requested.x | 0,
      y: requested.y | 0,
      right: requested.right | 0,
      bottom: requested.bottom | 0,
    };
  }

  /**
   * HgcApply3DLUTTetrahedralFast::GetROI(HGRenderer*, int, HGRect) @0x73ff0.
   *
   * ABI: %rdi=this, %rsi=renderer (unread), %edx=inputIdx (into r15d),
   * %rcx:%r8 = requested HGRect (saved into r14:rbx). Return in %rax:%rdx.
   *
   *   @0x73ff0..@0x73ff9 prologue + save rcx/r8/edx to r14/rbx/r15d.
   *   @0x74003 movl 0x1a0(%rdi), %ecx    ; ecx = this->f_1a0  (LUT dim n)
   *   @0x74009 movl %ecx, %edx           ; edx = n
   *   @0x7400b imull %ecx, %edx          ; edx = n * n         (i32 mul)
   *   @0x7400e incl %edx                 ; edx = n*n + 1
   *   @0x74010 incl %ecx                 ; ecx = n + 1
   *   @0x74012 xorl %edi, %edi           ; edi = 0             (x0)
   *   @0x74014 xorl %esi, %esi           ; esi = 0             (y0)
   *   @0x74016 callq _HGRectMake4i       ; → rax:rdx = rect(0,0, n*n+1, n+1)
   *   @0x7401b cmpl $0x1, %r15d
   *   @0x7401f je   0x7403c              ; inputIdx == 1 → return LUT rect
   *   @0x74021 testl %r15d, %r15d
   *   @0x74024 jne  0x7402e              ; inputIdx != 0 → HGRectNull
   *   @0x74026 movq %r14, %rax           ; rax = requested lo
   *   @0x74029 movq %rbx, %rdx           ; rdx = requested hi   (passthrough)
   *   @0x7402c jmp  0x7403c              ; return
   *   @0x7402e leaq _HGRectNull(%rip), %rcx
   *   @0x74035 movq (%rcx), %rax
   *   @0x74038 movq 0x8(%rcx), %rdx      ; HGRectNull
   *   @0x7403c epilogue + retq
   *
   * Semantics summary:
   *   inputIdx == 0 → passthrough caller's rect (LUT-apply reads the same
   *                   pixel domain from input 0).
   *   inputIdx == 1 → HGRectMake4i(0, 0, n*n + 1, n + 1) — the 3D-LUT
   *                   texture's own domain (unrolled cube layout).
   *   else          → HGRectNull.
   */
  GetROI(_renderer: HGRenderer, inputIdx: number, requested: HGRect): HGRect {
    const idx = inputIdx | 0;
    // @0x74003..@0x74010: compute (n, n*n+1, n+1) even though only the
    // inputIdx==1 branch actually uses them. HGRectMake4i IS called
    // unconditionally in the asm (the compiler didn't hoist the cmp out).
    // Faithful transcription keeps the call ordering — but the result is
    // only bound in the inputIdx==1 branch below; the (0/other) branches
    // overwrite (rax:rdx) with the caller's rect or HGRectNull.
    const n = this.f_1a0 | 0;
    // Math.imul is the JS equivalent of imull (i32 signed multiply with
    // low-32 truncation).
    const nn_plus_1 = (Math.imul(n, n) + 1) | 0;
    const n_plus_1 = (n + 1) | 0;
    // @0x74016 callq _HGRectMake4i — the (rax:rdx) values it produces are
    // ONLY reached in the inputIdx==1 branch; for provenance we still
    // call it to preserve any side-effects (there are none for the pure
    // rect constructor, but the call sequence is faithful).
    const lutRect = HGRectMake4i(0, 0, nn_plus_1, n_plus_1);

    // @0x7401b cmpl $1, r15d ; je → inputIdx == 1 branch.
    if (idx === 1) {
      return lutRect;
    }
    // @0x74021 testl r15d, r15d ; jne 0x7402e → inputIdx != 0 → HGRectNull.
    if (idx !== 0) {
      // @0x7402e..@0x74038 load HGRectNull.
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0x74026..@0x7402c inputIdx == 0 → passthrough caller's rect.
    return {
      x: requested.x | 0,
      y: requested.y | 0,
      right: requested.right | 0,
      bottom: requested.bottom | 0,
    };
  }
}
