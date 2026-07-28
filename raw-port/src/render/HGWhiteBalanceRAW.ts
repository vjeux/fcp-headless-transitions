// raw-port: HGWhiteBalanceRAW — Helium framework (render layer)
//
// HGNode subclass implementing a RAW-image white-balance stage. Only the
// four "shell" methods are exposed in the class — the four ported here are
// the two dtors plus the two rect-derivation gates (GetDOD/GetROI). The
// actual white-balance math is implemented in a separate `HgcWhiteBalanceRAW`
// peer (lowercase-c namespace — same ICF-folding trick seen in
// HGCRetimeVariableRez) which is not part of this class's four-symbol batch.
//
// SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
//   @Helium 0x1d2b90  HGWhiteBalanceRAW::~HGWhiteBalanceRAW()   (D2 base dtor thunk)
//   @Helium 0x1d2ba0  HGWhiteBalanceRAW::~HGWhiteBalanceRAW()   (D0 deleting dtor)
//   @Helium 0x1d2bc0  HGWhiteBalanceRAW::GetDOD(HGRenderer*, int, HGRect) -> HGRect
//   @Helium 0x1d2be0  HGWhiteBalanceRAW::GetROI(HGRenderer*, int, HGRect) -> HGRect
//
// re/disasm:
//   raw-port/re/disasm/Helium.HGWhiteBalanceRAW.~HGWhiteBalanceRAW.s
//   raw-port/re/disasm/Helium.HGWhiteBalanceRAW.GetDOD.s
//   raw-port/re/disasm/Helium.HGWhiteBalanceRAW.GetROI.s
//   (D2 body at 0x1d2b90: pushq %rbp; movq %rsp,%rbp; popq %rbp;
//    jmp HgcWhiteBalanceRAW::~HgcWhiteBalanceRAW — sibling peer dtor.)
//
// SEMANTICS SUMMARY:
//   GetDOD(_r, retimingType, rect):
//     retimingType == 0 -> return rect unchanged (identity DOD)
//     retimingType != 0 -> HGRectNull
//   GetROI(_r, retimingType, rect):
//     retimingType == 0 -> HGRectGrow(rect, HGRectMake4i(-1,-1,1,1))
//                          (grow by one pixel on each side — the standard
//                          "sample one-pixel neighborhood" bilinear halo).
//     retimingType != 0 -> HGRectNull
//
// FRONTIER CALLEES (external symbols; not transcribed here):
//   HgcWhiteBalanceRAW::~HgcWhiteBalanceRAW()  @0x1d2b95 tail-jmp / @0x1d2ba9 call
//   HGObject::operator delete(void*)           @0x1d2bb7 tail-jmp
//   _HGRectNull                                @0x1d2bcb (DOD) / @0x1d2be4 (ROI) — ported: HGRect.ts
//   _HGRectMake4i                              @0x1d2c14 — ported: HGRect.ts
//   _HGRectGrow                                @0x1d2c29 tail-jmp — ported: HGRect.ts

import type { HGRect } from "./HGRect";
import { HGRectGrow, HGRectMake4i, HGRectNull } from "./HGRect";

// ---------------------------------------------------------------------------
// Frontier stubs (external symbols not yet transcribed).
// ---------------------------------------------------------------------------

/** HgcWhiteBalanceRAW::~HgcWhiteBalanceRAW() — lowercase-c peer base dtor
 *  delegated to by both HGWhiteBalanceRAW dtors. Not yet transcribed
 *  (belongs to the HgcWhiteBalanceRAW class).
 *  @Helium 0x1d2b95 (D2 tail-jmp) and @0x1d2ba9 (D0 call) */
function HgcWhiteBalanceRAW_D2(_this: HGWhiteBalanceRAW): void {
  throw new Error(
    "HgcWhiteBalanceRAW::~HgcWhiteBalanceRAW() not yet transcribed — peer base dtor (see @0x1d2b95 tail-jmp)",
  );
}

/** HGObject::operator delete(void*) — allocator hook. Not yet transcribed. */
function HGObject_operator_delete(_p: HGWhiteBalanceRAW): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed — external allocator (see @0x1d2bb7 tail-jmp)",
  );
}

/**
 * HGRenderer* — opaque frontier type. Neither method dereferences it.
 */
export type HGRenderer = unknown;

export class HGWhiteBalanceRAW {
  // -------------------------------------------------------------------------
  // ~HGWhiteBalanceRAW (D2 base) @Helium 0x1d2b90
  //   pushq %rbp; movq %rsp,%rbp; popq %rbp;                    @0x1d2b90
  //   jmp __ZN18HgcWhiteBalanceRAWD2Ev                          @0x1d2b95
  //
  //   Trivial frame-set + tail-jmp into the sibling peer's base dtor.
  // -------------------------------------------------------------------------
  destroyBase(): void {
    // @0x1d2b95: jmp HgcWhiteBalanceRAW::~HgcWhiteBalanceRAW()
    HgcWhiteBalanceRAW_D2(this);
  }

  // -------------------------------------------------------------------------
  // ~HGWhiteBalanceRAW (D0 deleting) @Helium 0x1d2ba0
  //   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax        @0x1d2ba0
  //   movq %rdi,%rbx                                            @0x1d2ba6
  //   callq HgcWhiteBalanceRAW::~HgcWhiteBalanceRAW()           @0x1d2ba9
  //   movq %rbx,%rdi                                            @0x1d2bae
  //   ...
  //   jmp HGObject::operator delete(void*)                      @0x1d2bb7
  // -------------------------------------------------------------------------
  destroyAndDelete(): void {
    // @0x1d2ba9
    HgcWhiteBalanceRAW_D2(this);
    // @0x1d2bb7
    HGObject_operator_delete(this);
  }

  /**
   * HGWhiteBalanceRAW::GetDOD(HGRenderer*, int retimingType, HGRect r) -> HGRect
   * @Helium 0x1d2bc0
   *
   *   movq %rcx,%rax                                             @0x1d2bc0  ; rax = r.lo (x|y<<32)
   *   testl %edx,%edx; je .Lpassthru                             @0x1d2bc3
   *   pushq %rbp; movq %rsp,%rbp                                 @0x1d2bc7
   *   leaq _HGRectNull(%rip),%rcx                                @0x1d2bcb
   *   movq (%rcx),%rax                                          @0x1d2bd2  ; rax = HGRectNull.lo
   *   movq 0x8(%rcx),%r8                                        @0x1d2bd5  ; r8  = HGRectNull.hi
   *   popq %rbp                                                 @0x1d2bd9
   *   .Lpassthru: movq %r8,%rdx; retq                            @0x1d2bda
   *
   *   Semantics: if retimingType == 0, return input rect UNCHANGED (the .Lpassthru
   *   label is reached from the je without rebinding %rax or %r8, so the input
   *   packed pair flows through). Otherwise, rebind (%rax,%r8) to HGRectNull
   *   and take the same tail. This is the mirror-image of the DOD idiom used
   *   by HGCRetimeVariableRez (there edx<=1 passes through; here edx==0 does).
   */
  GetDOD(_renderer: HGRenderer, retimingType: number, r: HGRect): HGRect {
    // @0x1d2bc3: testl %edx,%edx; je .Lpassthru
    if ((retimingType | 0) === 0) {
      // Input passes through unchanged.
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }
    // @0x1d2bcb..0x1d2bd5: rebind to HGRectNull, then fall to .Lpassthru
    return { ...HGRectNull };
  }

  /**
   * HGWhiteBalanceRAW::GetROI(HGRenderer*, int retimingType, HGRect r) -> HGRect
   * @Helium 0x1d2be0
   *
   *   testl %edx,%edx; je 0x1d2bf3                              @0x1d2be0
   *   leaq _HGRectNull(%rip),%rcx                               @0x1d2be4
   *   movq (%rcx),%rax; movq 0x8(%rcx),%rdx                     @0x1d2beb
   *   retq                                                       @0x1d2bf2
   *   ; --- retimingType == 0 branch (real ROI computation) ---
   *   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx         @0x1d2bf3
   *   movq %r8,%rbx                                              @0x1d2bfa  ; rbx = r.hi (right|bottom<<32)
   *   movq %rcx,%r14                                             @0x1d2bfd  ; r14 = r.lo (x|y<<32)
   *   movl $0xffffffff,%edi                                      @0x1d2c00  ; -1 (x0)
   *   movl $0xffffffff,%esi                                      @0x1d2c05  ; -1 (y0)
   *   movl $0x1,%edx                                             @0x1d2c0a  ;  1 (x1)
   *   movl $0x1,%ecx                                             @0x1d2c0f  ;  1 (y1)
   *   callq _HGRectMake4i                                        @0x1d2c14
   *     ; returns HGRect packed in (rax=lo, rdx=hi)
   *   movq %rdx,%rcx                                             @0x1d2c19  ; rcx = grow.hi -> new r8-arg
   *   movq %r14,%rdi                                             @0x1d2c1c  ; rdi = r.lo -> new rcx-arg? WAIT
   *   movq %rbx,%rsi                                             @0x1d2c1f
   *   movq %rax,%rdx                                             @0x1d2c22  ; rdx = grow.lo
   *   ...
   *   jmp _HGRectGrow                                            @0x1d2c29
   *
   *   HGRectGrow ABI (per HGRect.ts): _HGRectGrow(HGRect a, HGRect g) where
   *   the packed pairs go in (rdi=a.lo, rsi=a.hi, rdx=g.lo, rcx=g.hi). The
   *   register moves at 0x1d2c19..0x1d2c22 rearrange:
   *     rdi = r14 = r.lo
   *     rsi = rbx = r.hi
   *     rdx = rax = HGRectMake4i result.lo
   *     rcx = rdx = HGRectMake4i result.hi
   *   which matches HGRectGrow(a=r, g=HGRectMake4i(-1,-1,1,1)) — grow by one
   *   pixel on each side (bilinear-sample halo).
   */
  GetROI(_renderer: HGRenderer, retimingType: number, r: HGRect): HGRect {
    // @0x1d2be0: testl %edx,%edx; je .Lreal
    if ((retimingType | 0) !== 0) {
      // @0x1d2be4: return HGRectNull
      return { ...HGRectNull };
    }
    // @0x1d2c14: HGRectMake4i(-1, -1, 1, 1)
    const grow = HGRectMake4i(-1, -1, 1, 1);
    // @0x1d2c29: tail-jmp HGRectGrow(r, grow)
    return HGRectGrow(r, grow);
  }
}
