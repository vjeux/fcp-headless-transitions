// raw-port: HgcApply3DLUTTrilinearUniform — Helium framework (render layer)
//
// HGNode "shell" class for the trilinear-sampled 3D-LUT apply kernel. Only
// four externally visible members exist on the derived shell (as with the
// other Hgc*/HGC* pairs in this codebase): two dtors, GetDOD, GetROI. The
// actual kernel is implemented by the parent `HgcApply3DLUTTrilinearUniform_basekernel`
// (D2 delegated to via 0x73cb5 jmp / 0x73cc9 call — see FRONTIER below).
//
// SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
//   @Helium 0x73cb0  HgcApply3DLUTTrilinearUniform::~HgcApply3DLUTTrilinearUniform()   (D2 base thunk)
//   @Helium 0x73cc0  HgcApply3DLUTTrilinearUniform::~HgcApply3DLUTTrilinearUniform()   (D0 deleting)
//   @Helium 0x73ce0  HgcApply3DLUTTrilinearUniform::GetDOD(HGRenderer*, int, HGRect) -> HGRect
//   @Helium 0x73d00  HgcApply3DLUTTrilinearUniform::GetROI(HGRenderer*, int, HGRect) -> HGRect
//
// re/disasm:
//   raw-port/re/disasm/Helium.HgcApply3DLUTTrilinearUniform.~HgcApply3DLUTTrilinearUniform.s
//   raw-port/re/disasm/Helium.HgcApply3DLUTTrilinearUniform.GetDOD.s
//   raw-port/re/disasm/Helium.HgcApply3DLUTTrilinearUniform.GetROI.s
//
// SEMANTICS SUMMARY:
//   GetDOD(_r, retimingType, rect):
//     retimingType == 0 -> return rect unchanged (identity DOD; same idiom as
//                          HGWhiteBalanceRAW::GetDOD — see @0x1d2bc0).
//     retimingType != 0 -> HGRectNull
//   GetROI(_r, retimingType, rect):
//     retimingType == 0 -> return rect unchanged (input pass-through)
//     retimingType == 1 -> HGRectMake4i(0, 0, lutSize*lutSize + 1, lutSize + 1)
//                          i.e. the 2D-tiled 3D-LUT texture footprint used
//                          when this node's downstream sampler is fetching
//                          from a lutSize-cubed table stored as a
//                          (lutSize² + 1) x (lutSize + 1) 2D image (the +1
//                          margins are the standard "edge-clamp guard" strip
//                          for trilinear interpolation).
//     retimingType == other -> HGRectNull
//
// LAYOUT (recovered from field offsets used in GetROI):
//   struct HgcApply3DLUTTrilinearUniform : HgcApply3DLUTTrilinearUniform_basekernel {
//     ...
//     int32 lutSize;   // +0x1a0  cube edge (loaded @0x73d13 as movl 0x1a0(%rdi),%ecx)
//   };
//
// FRONTIER CALLEES (external symbols; not transcribed here):
//   HgcApply3DLUTTrilinearUniform_basekernel::~HgcApply3DLUTTrilinearUniform_basekernel()
//                            @0x73cb5 tail-jmp / @0x73cc9 call — base dtor.
//   HGObject::operator delete(void*)              @0x73cd7 tail-jmp — allocator hook.
//   _HGRectNull                                   @0x73ceb (DOD) / @0x73d3e (ROI) — ported: HGRect.ts
//   _HGRectMake4i                                 @0x73d26 — ported: HGRect.ts

import type { HGRect } from "./HGRect";
import { HGRectMake4i, HGRectNull } from "./HGRect";

// ---------------------------------------------------------------------------
// Frontier stubs (external symbols not yet transcribed).
// ---------------------------------------------------------------------------

/** HgcApply3DLUTTrilinearUniform_basekernel::~HgcApply3DLUTTrilinearUniform_basekernel()
 *  — parent kernel's base dtor. Not yet transcribed.
 *  @Helium 0x73cb5 (D2 tail-jmp) and @0x73cc9 (D0 call) */
function HgcApply3DLUTTrilinearUniform_basekernel_D2(
  _this: HgcApply3DLUTTrilinearUniform,
): void {
  throw new Error(
    "HgcApply3DLUTTrilinearUniform_basekernel::~HgcApply3DLUTTrilinearUniform_basekernel() not yet transcribed — parent base dtor (see @0x73cb5 tail-jmp)",
  );
}

/** HGObject::operator delete(void*) — allocator hook. Not yet transcribed. */
function HGObject_operator_delete(
  _p: HgcApply3DLUTTrilinearUniform,
): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed — external allocator (see @0x73cd7 tail-jmp)",
  );
}

/** HGRenderer* — opaque frontier type; neither method dereferences it. */
export type HGRenderer = unknown;

export class HgcApply3DLUTTrilinearUniform {
  /** 3D-LUT cube edge (loaded @0x73d13 as movl 0x1a0(%rdi),%ecx in GetROI). */
  lutSize = 0;

  // -------------------------------------------------------------------------
  // ~HgcApply3DLUTTrilinearUniform (D2 base) @Helium 0x73cb0
  //   pushq %rbp; movq %rsp,%rbp; popq %rbp;                     @0x73cb0
  //   jmp __ZN40HgcApply3DLUTTrilinearUniform_basekernelD2Ev      @0x73cb5
  // -------------------------------------------------------------------------
  destroyBase(): void {
    // @0x73cb5
    HgcApply3DLUTTrilinearUniform_basekernel_D2(this);
  }

  // -------------------------------------------------------------------------
  // ~HgcApply3DLUTTrilinearUniform (D0 deleting) @Helium 0x73cc0
  //   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax        @0x73cc0
  //   movq %rdi,%rbx                                            @0x73cc6
  //   callq HgcApply3DLUTTrilinearUniform_basekernel::~...      @0x73cc9
  //   movq %rbx,%rdi                                            @0x73cce
  //   ...
  //   jmp HGObject::operator delete(void*)                      @0x73cd7
  // -------------------------------------------------------------------------
  destroyAndDelete(): void {
    // @0x73cc9
    HgcApply3DLUTTrilinearUniform_basekernel_D2(this);
    // @0x73cd7
    HGObject_operator_delete(this);
  }

  /**
   * HgcApply3DLUTTrilinearUniform::GetDOD(HGRenderer*, int retimingType, HGRect r) -> HGRect
   * @Helium 0x73ce0
   *
   *   movq %rcx,%rax                                             @0x73ce0
   *   testl %edx,%edx; je .Lpassthru                             @0x73ce3
   *   pushq %rbp; movq %rsp,%rbp                                 @0x73ce7
   *   leaq _HGRectNull(%rip),%rcx                                @0x73ceb
   *   movq (%rcx),%rax; movq 8(%rcx),%r8                         @0x73cf2
   *   popq %rbp                                                  @0x73cf9
   *   .Lpassthru: movq %r8,%rdx; retq                            @0x73cfa
   *
   *   Bit-for-bit identical shape to HGWhiteBalanceRAW::GetDOD @0x1d2bc0.
   */
  GetDOD(_renderer: HGRenderer, retimingType: number, r: HGRect): HGRect {
    // @0x73ce3
    if ((retimingType | 0) === 0) {
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }
    // @0x73ceb..0x73cf2
    return { ...HGRectNull };
  }

  /**
   * HgcApply3DLUTTrilinearUniform::GetROI(HGRenderer*, int retimingType, HGRect r) -> HGRect
   * @Helium 0x73d00
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %r15; pushq %r14; pushq %rbx; pushq %rax  @0x73d00
   *   movq %r8,%rbx                                              @0x73d0a   ; rbx = r.hi
   *   movq %rcx,%r14                                             @0x73d0d   ; r14 = r.lo
   *   movl %edx,%r15d                                            @0x73d10   ; r15d = retimingType
   *   movl 0x1a0(%rdi),%ecx                                      @0x73d13   ; ecx = this->lutSize
   *   movl %ecx,%edx                                             @0x73d19
   *   imull %ecx,%edx                                            @0x73d1b   ; edx = lutSize * lutSize (i32 wrap)
   *   incl %edx                                                  @0x73d1e   ; edx = lutSize^2 + 1
   *   incl %ecx                                                  @0x73d20   ; ecx = lutSize + 1
   *   xorl %edi,%edi                                             @0x73d22
   *   xorl %esi,%esi                                             @0x73d24
   *   callq _HGRectMake4i                                        @0x73d26   ; HGRectMake4i(0, 0, lutSize^2+1, lutSize+1)
   *   cmpl $0x1,%r15d; je .LreturnRes                            @0x73d2b   ; retimingType==1 -> return HGRectMake4i result
   *   testl %r15d,%r15d; jne .Lnull                              @0x73d31   ; retimingType!=0 -> HGRectNull
   *   ; retimingType == 0: rebind (rax,rdx) to input rect (r14,rbx)
   *   movq %r14,%rax; movq %rbx,%rdx; jmp .LreturnRes            @0x73d36
   *   .Lnull:
   *     leaq _HGRectNull(%rip),%rcx                              @0x73d3e
   *     movq (%rcx),%rax; movq 8(%rcx),%rdx                      @0x73d45
   *   .LreturnRes: epilogue; retq                                @0x73d4c
   */
  GetROI(_renderer: HGRenderer, retimingType: number, r: HGRect): HGRect {
    const r15 = retimingType | 0;
    // @0x73d13..0x73d20: compute LUT footprint (lutSize^2+1, lutSize+1).
    // NOTE: imull is signed 32-bit multiply — mirror with Math.imul.
    const lutSize = this.lutSize | 0;
    const w = ((Math.imul(lutSize, lutSize) | 0) + 1) | 0;
    const h = ((lutSize + 1) | 0);
    // @0x73d26: HGRectMake4i(0, 0, w, h) — the result is computed unconditionally
    // (asm calls it before the branch on retimingType) but only used on the
    // retimingType==1 path. Preserving the eager call to match FCP's timing:
    const lutRect = HGRectMake4i(0, 0, w, h);
    // @0x73d2b: if retimingType == 1 -> return lutRect
    if (r15 === 1) {
      return lutRect;
    }
    // @0x73d31: if retimingType != 0 -> HGRectNull
    if (r15 !== 0) {
      // @0x73d3e..0x73d48
      return { ...HGRectNull };
    }
    // @0x73d36: retimingType == 0 -> return input rect (r14/rbx)
    return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
  }
}
