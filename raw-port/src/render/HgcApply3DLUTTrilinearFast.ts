/**
 * HgcApply3DLUTTrilinearFast — Helium node that applies a 3D LUT with fast
 * trilinear interpolation. This port covers the four outer-class methods:
 *
 *   - D1 destructor  @ Helium 0x0000000000073d60
 *   - D0 destructor  @ Helium 0x0000000000073d70   (deleting variant)
 *   - GetDOD         @ Helium 0x0000000000073d90
 *   - GetROI         @ Helium 0x0000000000073db0
 *
 * The class inherits from `HgcApply3DLUTTrilinearFast_basekernel` (see
 * Helium symbol `__ZN37HgcApply3DLUTTrilinearFast_basekernel*`) which owns
 * all the render-time logic (RenderTile, GetProgram, InitProgramDescriptor,
 * SetParameter, GetParameter, BindTexture, GetOutput, Bind). The four
 * methods here are the ones that survived to the outer class — the D1 is
 * a pure tail-call to the base's D2, and GetDOD/GetROI implement the
 * LUT-specific domain and region logic.
 *
 * @classAddr Helium 0x0000000000073d60 (D1), 0x0000000000073d70 (D0),
 *            0x0000000000073d90 (GetDOD), 0x0000000000073db0 (GetROI).
 */

import type { HGRect } from "./HGRect";
import { HGRectNull, HGRectMake4i } from "./HGRect";

/**
 * Forward declaration — see note in ./HGCRetimeFullRez.ts. GetDOD/GetROI
 * never dereference the renderer, so this is opaque here.
 */
export interface HGRenderer {
  readonly __brand: "HGRenderer";
}

/**
 * Base-class destructor stub — the native
 * `HgcApply3DLUTTrilinearFast_basekernel::~HgcApply3DLUTTrilinearFast_basekernel`
 * at Helium @0x2ed00c (D2) belongs to a different class and hasn't been
 * transcribed yet. The D1 here @0x073d60 is a pure tail-call to that D2.
 */
function baseKernel_D2(_self: HgcApply3DLUTTrilinearFast): void {
  // Not yet transcribed: HgcApply3DLUTTrilinearFast_basekernel::~D2 @0x00000000002ed00c
  throw new Error(
    "HgcApply3DLUTTrilinearFast::~HgcApply3DLUTTrilinearFast — base class " +
      "HgcApply3DLUTTrilinearFast_basekernel::D2 not yet transcribed " +
      "(Helium @0x00000000002ed00c)"
  );
}

/**
 * HGObject::operator delete(void*) stub — Helium symbol __ZN8HGObjectdlEPv.
 * The deleting dtor (D0) tail-calls it.
 */
function hgObject_operatorDelete(_self: unknown): void {
  // Not yet transcribed: HGObject::operator delete(void*)
  throw new Error(
    "HgcApply3DLUTTrilinearFast::~HgcApply3DLUTTrilinearFast (deleting) — " +
      "HGObject::operator delete not yet transcribed " +
      "(Helium symbol __ZN8HGObjectdlEPv, called from D0 @0x0000000000073d87)"
  );
}

/**
 * HgcApply3DLUTTrilinearFast.
 *
 * Instance layout (only the field touched by GetROI is decoded here):
 *   this[0x1a0] : int32 lutDim  (aka N; the per-axis dimension of the 3D LUT)
 *
 * GetROI packs the LUT as a 2D texture of extent
 *   (right = N*N + 1, bottom = N + 1)
 * which is the classic layout for a 3D LUT stored in a 2D tile: one slice
 * per column of width N+1 (edge duplicated for hardware bilinear filtering),
 * with N slices tiled horizontally giving a total width of N*(N+1) + 1
 * ≈ N*N + 1 — the `imull %ecx, %ecx ; incl %edx` @0x073dcb-0x073dce.
 */
export class HgcApply3DLUTTrilinearFast {
  /**
   * `this[0x1a0]` — int32 LUT edge length (N). Referenced by
   * `movl 0x1a0(%rdi), %ecx` @0x073dc3.
   */
  lutDim: number = 0;

  /**
   * D1 destructor — @0x0000000000073d60.
   *
   *   0000000000073d60  pushq %rbp
   *   0000000000073d61  movq  %rsp, %rbp
   *   0000000000073d64  popq  %rbp
   *   0000000000073d65  jmp   __ZN37HgcApply3DLUTTrilinearFast_basekernelD2Ev
   *
   * Pure tail-call to the base class D2.
   */
  destroy(): void {
    baseKernel_D2(this);
  }

  /**
   * D0 destructor — @0x0000000000073d70 — the "deleting" variant.
   *
   *   0000000000073d70  pushq %rbp
   *   0000000000073d71  movq  %rsp, %rbp
   *   0000000000073d74  pushq %rbx / (align)
   *   0000000000073d76  movq  %rdi, %rbx                     ; save this
   *   0000000000073d79  callq __ZN37HgcApply3DLUTTrilinearFast_basekernelD2Ev
   *   0000000000073d7e  movq  %rbx, %rdi
   *   0000000000073d87  jmp   __ZN8HGObjectdlEPv             ; HGObject::operator delete(this)
   */
  destroyAndDelete(): void {
    baseKernel_D2(this);
    hgObject_operatorDelete(this);
  }

  /**
   * GetDOD — Domain-Of-Definition query.
   *
   *   0000000000073d90  movq  %rcx, %rax                     ; rax = inRect.lo
   *   0000000000073d93  testl %edx, %edx                     ; index == 0?
   *   0000000000073d95  je    0x73daa                        ; yes → skip, return inRect
   *   0000000000073d97  pushq %rbp
   *   0000000000073d98  movq  %rsp, %rbp
   *   0000000000073d9b  leaq  _HGRectNull(%rip), %rcx        ; else load HGRectNull
   *   0000000000073da2  movq  (%rcx), %rax
   *   0000000000073da5  movq  0x8(%rcx), %r8
   *   0000000000073da9  popq  %rbp
   *   0000000000073daa  movq  %r8, %rdx                      ; result.hi = r8
   *   0000000000073dad  retq
   *
   * Behavior:
   *   - index == 0 → return inRect unchanged
   *   - index != 0 → return HGRectNull
   *
   * @method Helium 0x0000000000073d90
   */
  GetDOD(_renderer: HGRenderer | null, index: number, inRect: HGRect): HGRect {
    // testl %edx, %edx ; je 0x73daa  — branch taken when edx == 0.
    // We invert: if edx != 0, load HGRectNull; else fall through to the
    // passthrough tail (rcx→rax; r8→rdx at 0x73daa).
    if ((index | 0) !== 0) {
      return { ...HGRectNull };
    }
    return inRect;
  }

  /**
   * GetROI — Region-Of-Interest query.
   *
   *   0000000000073db0  pushq %rbp
   *   0000000000073db1  movq  %rsp, %rbp
   *   0000000000073db4  pushq %r15 / %r14 / %rbx / (align)
   *   0000000000073dba  movq  %r8, %rbx                      ; rbx = inRect.hi
   *   0000000000073dbd  movq  %rcx, %r14                     ; r14 = inRect.lo
   *   0000000000073dc0  movl  %edx, %r15d                    ; r15 = index
   *   0000000000073dc3  movl  0x1a0(%rdi), %ecx              ; ecx = this.lutDim (N)
   *   0000000000073dc9  movl  %ecx, %edx                     ; edx = N
   *   0000000000073dcb  imull %ecx, %edx                     ; edx = N*N
   *   0000000000073dce  incl  %edx                           ; edx = N*N + 1
   *   0000000000073dd0  incl  %ecx                           ; ecx = N + 1
   *   0000000000073dd2  xorl  %edi, %edi                     ; edi = 0
   *   0000000000073dd4  xorl  %esi, %esi                     ; esi = 0
   *   0000000000073dd6  callq _HGRectMake4i                  ; -> HGRect(0, 0, N*N+1, N+1) in rax:rdx
   *   0000000000073ddb  cmpl  $0x1, %r15d
   *   0000000000073ddf  je    0x73dfc                        ; index == 1 → return LUT rect
   *   0000000000073de1  testl %r15d, %r15d
   *   0000000000073de4  jne   0x73dee                        ; index != 0 → HGRectNull
   *   0000000000073de6  movq  %r14, %rax                     ; index == 0 → return inRect
   *   0000000000073de9  movq  %rbx, %rdx
   *   0000000000073dec  jmp   0x73dfc
   *   0000000000073dee  leaq  _HGRectNull(%rip), %rcx        ; index >= 2 → HGRectNull
   *   0000000000073df5  movq  (%rcx), %rax
   *   0000000000073df8  movq  0x8(%rcx), %rdx
   *   0000000000073dfc  ...epilogue... retq
   *
   * Behavior:
   *   - index == 0  → return inRect unchanged (the color input)
   *   - index == 1  → return HGRect(0, 0, N*N+1, N+1) — the 3D-LUT texture
   *                    extent, packed as a 2D atlas of N slices side-by-side
   *                    with one edge-duplicated column each.
   *   - index >= 2  → return HGRectNull
   *
   * Note: HGRectMake4i is called unconditionally, even on paths that
   * discard the result. We mirror that (the call has no side effects,
   * so this is a pure semantics-preserving no-op observationally).
   *
   * @method Helium 0x0000000000073db0
   */
  GetROI(_renderer: HGRenderer | null, index: number, inRect: HGRect): HGRect {
    const idx = index | 0;

    // Pre-call arithmetic (always executed by native):
    //   movl this[0x1a0], ecx   → N
    //   edx = N; imul edx, ecx  → N*N
    //   inc edx                 → N*N + 1
    //   inc ecx                 → N + 1
    //   edi=0, esi=0
    //   HGRectMake4i(0, 0, N*N+1, N+1)
    const N = this.lutDim | 0;                              // this[0x1a0] @0x073dc3
    const nsq_plus_1 = ((Math.imul(N, N)) + 1) | 0;         // imull+incl @0x073dcb-0x073dce
    const n_plus_1   = (N + 1) | 0;                         //           incl @0x073dd0
    const lutRect: HGRect = HGRectMake4i(0, 0, nsq_plus_1, n_plus_1); // @0x073dd6

    // Dispatch mirroring @0x073ddb onward:
    //   cmpl $1, r15d ; je 0x73dfc  → index == 1 returns lutRect
    //   testl r15d    ; jne 0x73dee → index != 0 returns HGRectNull
    //   fallthrough                 → index == 0 returns inRect
    if (idx === 1) {
      return lutRect;
    }
    if (idx !== 0) {
      // leaq _HGRectNull(%rip), %rcx @0x073dee
      return { ...HGRectNull };
    }
    return inRect;
  }
}
