// HgcApply3DLUTTetrahedral.ts - Helium's tetrahedral-interpolation 3D-LUT
// render node's tile-geometry surface (GetDOD/GetROI + destructor). Faithful
// transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HgcApply3DLUTTetrahedral.GetDOD.s                     @0x74080
//   raw-port/re/disasm/Helium.HgcApply3DLUTTetrahedral.GetROI.s                     @0x740a0
//   raw-port/re/disasm/Helium.HgcApply3DLUTTetrahedral.~HgcApply3DLUTTetrahedral.s  @0x74060  (D0)
//   (D1 @Helium 0x74050 shares the mangled `D1Ev` symbol; typical
//    complete-destructor shape - not further probed here because it
//    tail-calls the same base-destructor chain the D0 body shows.)
//
// nm -arch x86_64 Helium (destructor pair):
//   0000000000074050 t __ZN24HgcApply3DLUTTetrahedralD1Ev
//   0000000000074060 t __ZN24HgcApply3DLUTTetrahedralD0Ev
//
// CLASS ROLE (recovered from GetROI's structure + the destructor's
// base-class callee): this is the "channel" front-end of the tetrahedral
// 3D-LUT applier. It sits on top of the render-kernel class
// `HgcApply3DLUTTetrahedral_basekernel` (D0 tail-calls its D2 destructor,
// then HGObject::operator delete). The channel exposes three input slots
// - the source image (slot 0), the LUT unrolled as a 2D texture (slot 1),
// and a 1D "domain" curve (slot 2) - and provides DOD/ROI mappers for
// each of those slots.
//
// STRUCT LAYOUT observation: only one field is read here.
//   +0x1a0  int32  `n`  (`movl 0x1a0(%rdi),%ecx` at both @0x740bb and
//                        @0x740d9). This is the 3D-LUT grid resolution
//                        (side length): the tetrahedral applier stores
//                        the LUT unrolled into a (n*n + 1) x (n + 1)
//                        2D texture, so `n` is the count of grid nodes
//                        along one cube axis. Non-obvious detail: the
//                        `+1` on both dimensions (via `incl %edx` and
//                        `incl %ecx`) leaves a one-sample guard band
//                        for the linear-in-cell edge case. NOT yet
//                        transcribed the ctor that sets +0x1a0 -
//                        @Helium (the class's C1/C2, not in the four
//                        methods listed for this port). Named
//                        `_field1a0_lutGridN` so it can be renamed in
//                        place when a downstream port pins the
//                        semantic.
//
// GetDOD @0x74080 - DOMAIN-OF-DEFINITION dispatcher:
//   Faithfully:
//     movq  %rcx,%rax                       ; rax = input.lo
//     testl %edx,%edx                       ; if fieldSlot == 0 ...
//     je    0x7409a                         ;   ... return input unchanged (rax/r8)
//     pushq %rbp ; movq %rsp,%rbp
//     leaq  _HGRectNull(%rip),%rcx
//     movq  (%rcx),%rax                     ; rax = HGRectNull.lo
//     movq  0x8(%rcx),%r8                   ; r8  = HGRectNull.hi
//     popq  %rbp
//   0x7409a: movq %r8,%rdx ; retq           ; rdx = hi half
//
//   Semantics: slot 0 (source image) => full inputRect passes through.
//   Any other slot (1 = LUT texture, 2 = domain curve, or anything
//   else) => HGRectNull. That matches an applier whose LUT and domain
//   inputs are consumed as whole textures (no partial-tile fetching
//   from those slots), so their DOD is "unbounded" - which Helium
//   models as HGRectNull for these particular non-image inputs.
//   Non-obvious: the input rect is passed as (%rcx, %r8) = 16-byte
//   value split across two regs; the "return input unchanged" path
//   only rewrites %rdx from %r8 at the tail, which is subtle but
//   correct because the ABI returns 16-byte structs in (rax, rdx).
//
// GetROI @0x740a0 - REGION-OF-INTEREST dispatcher:
//   Faithfully (control flow paraphrased for readability, exact asm
//   preserved in comments per branch):
//     ; save inputRect: r14 = inputRect.lo, -0x30(%rbp) = inputRect.hi
//     ; r15 = fieldSlot, rbx = this
//     n = this[0x1a0]                       ; movl 0x1a0(%rdi),%ecx
//     r1 = HGRectMake4i(0, 0, n*n + 1, n + 1)   ; @0x740ce (kept in r12/r13)
//     r2 = HGRectMake4i(0, 0, 1, n)             ; @0x740e8 (kept in rax/rdx)
//     switch (fieldSlot) {
//       case 2: return r2;                  ; cmpl $0x2,r15d ; je 0x7411d
//       case 1: return r1;                  ; cmpl $0x1,r15d ; je 0x74107
//       case 0: return inputRect;           ; testl r15d,r15d ; je -> rax=r14, rdx=-0x30(%rbp)
//       default: return HGRectNull;         ; else path @0x7410f loads _HGRectNull
//     }
//
//   Semantics per slot:
//     slot 0 (source image)     -> passthrough (image is sampled tile-
//                                    aligned, same rect the caller wants).
//     slot 1 (LUT unrolled 2D)  -> full LUT texture rect
//                                    (n*n + 1) x (n + 1) - the +1 in
//                                    each axis is the guard sample.
//     slot 2 (domain 1D)        -> full curve rect 1 x n (one column,
//                                    n rows) - the domain curve is
//                                    stored as an n-tall single-column
//                                    2D texture with no guard.
//     anything else             -> HGRectNull (safe empty).
//
//   Non-obvious details:
//     * n*n + 1 is computed with `imull %ecx,%edx ; incl %edx` which
//       is signed 32-bit multiplication with wrap on overflow. A
//       pathologically large `n` (~46341+) would wrap; the caller is
//       responsible for keeping n <= a 3D-LUT-reasonable value
//       (typical Helium LUT sizes are 17, 33, 64). We mirror this
//       faithfully with `Math.imul` + `| 0`.
//     * n + 1 uses `incl %ecx` (32-bit +1, wrap allowed) - same story.
//     * Case 2's rect is computed BEFORE the switch discriminator is
//       tested (both HGRectMake4i calls happen unconditionally). We
//       preserve that eager evaluation order.
//     * The default (fieldSlot > 2) path uses HGRectNull, NOT
//       inputRect. This differs from GetDOD, whose default is
//       HGRectNull only for fieldSlot != 0. GetROI's default coincides
//       (both return HGRectNull for unknown slots), but the "return
//       inputRect" branch on slot 0 is present in BOTH functions.
//
// DESTRUCTOR D0 @0x74060 - not exposed as a JS method. It saves
// `this` in %rbx, calls the base-kernel destructor, then tail-calls
// HGObject::operator delete. The base-kernel destructor
// HgcApply3DLUTTetrahedral_basekernel::~HgcApply3DLUTTetrahedral_basekernel
// is not yet transcribed @Helium 0x74069. HGObject::operator delete
// not yet transcribed @Helium 0x74077.

import { HGRect, HGRectNull, HGRectMake4i } from "./HGRect";

/** Opaque forward reference for HGRenderer - the DOD/ROI paths spill
 *  the %rsi renderer arg to callee-saved registers but never dereference
 *  it, so we accept it as an opaque token. */
export type HGRenderer = unknown;

/** HgcApply3DLUTTetrahedral - tetrahedral 3D-LUT applier channel node.
 *  Only the +0x1a0 int32 field is observably read by the four methods
 *  ported here; the rest of the object's state lives on the base kernel
 *  and is exercised by the not-yet-ported base-kernel class. */
export class HgcApply3DLUTTetrahedral {
  /** +0x1a0 - int32 LUT grid resolution `n` (side length in samples).
   *  Read at @0x740bb and @0x740d9 as `movl 0x1a0(%rdi),%ecx`. The
   *  ctor that INITIALIZES +0x1a0 is not part of this port's four
   *  methods; not yet transcribed @Helium (HgcApply3DLUTTetrahedral::C1/C2).
   *  Renamable placeholder name. */
  _field1a0_lutGridN: number = 0;

  /**
   * GetDOD - @Helium 0x74080. Domain-Of-Definition mapper.
   *
   *   movq  %rcx,%rax                       ; @0x74080  rax = input.lo
   *   testl %edx,%edx                       ; @0x74083  if fieldSlot == 0
   *   je    0x7409a                         ; @0x74085    -> return input
   *   pushq %rbp ; movq %rsp,%rbp
   *   leaq  _HGRectNull(%rip),%rcx          ; @0x7408b
   *   movq  (%rcx),%rax                     ; @0x74092  rax = HGRectNull.lo
   *   movq  0x8(%rcx),%r8                   ; @0x74095  r8  = HGRectNull.hi
   *   popq  %rbp
   * 0x7409a:
   *   movq  %r8,%rdx                        ; hi -> rdx (ABI struct-return)
   *   retq
   *
   * @param renderer  HGRenderer* - unused (never dereferenced).
   * @param fieldSlot int - 0 = source image; anything else = LUT/domain/
   *                        unknown, returns HGRectNull.
   * @param inputRect HGRect - the caller's requested rect on slot 0.
   */
  GetDOD(renderer: HGRenderer, fieldSlot: number, inputRect: HGRect): HGRect {
    void renderer;
    // @0x74083  testl %edx,%edx  ; je 0x7409a  -> fieldSlot == 0 ? pass-through
    if ((fieldSlot | 0) === 0) {
      // Slot 0: return the input rect unchanged (16-byte value copy).
      return {
        x: inputRect.x | 0,
        y: inputRect.y | 0,
        right: inputRect.right | 0,
        bottom: inputRect.bottom | 0,
      };
    }
    // Anything non-zero (slot 1, 2, ... or negative) -> HGRectNull.
    return {
      x: HGRectNull.x,
      y: HGRectNull.y,
      right: HGRectNull.right,
      bottom: HGRectNull.bottom,
    };
  }

  /**
   * GetROI - @Helium 0x740a0. Region-Of-Interest mapper.
   *
   * Faithful control-flow (exact asm cited by branch):
   *
   *   ; @0x740b2-0x740b8  save r14 = inputRect.lo, r15 = fieldSlot, rbx = this
   *   ; @0x740ae         save inputRect.hi at -0x30(%rbp)
   *   ; @0x740bb-0x740c8  ecx = this[0x1a0] ; edx = n*n + 1 ; ecx = n + 1
   *   ; @0x740ca-0x740ce  r12/r13 = HGRectMake4i(0, 0, n*n + 1, n + 1)
   *   ; @0x740d9-0x740e8  rax/rdx = HGRectMake4i(0, 0, 1, n)  -- ecx set to 1 first
   *   ; @0x740ed-0x740f1  if fieldSlot == 2 -> keep rax/rdx (the r2 rect), jump to ret
   *   ; @0x740f3-0x740f7  if fieldSlot == 1 -> rax/rdx = r12/r13 (the r1 rect)
   *   ; @0x740f9-0x740fc  if fieldSlot != 0 -> jump to HGRectNull loader
   *   ; @0x740fe-0x74105  fieldSlot == 0 -> rax/rdx = inputRect
   *   ; @0x7410f-0x74119  default: rax/rdx = HGRectNull
   *
   * Semantics:
   *   slot 0 -> inputRect
   *   slot 1 -> HGRectMake4i(0, 0, n*n + 1, n + 1)
   *   slot 2 -> HGRectMake4i(0, 0, 1, n)
   *   else   -> HGRectNull
   *
   * Multiply/increment are 32-bit signed with wrap-on-overflow; mirrored
   * via `Math.imul` and `| 0`. All HGRectMake4i calls go through the
   * ported HGRect helper so the rect layout stays exact.
   *
   * @param renderer  HGRenderer* - unused (never dereferenced).
   * @param fieldSlot int - 0/1/2 or "other" (default fall-through to null).
   * @param inputRect HGRect - the caller's requested rect.
   */
  GetROI(renderer: HGRenderer, fieldSlot: number, inputRect: HGRect): HGRect {
    void renderer;
    // @0x740bb  movl 0x1a0(%rdi),%ecx  -> n = this[+0x1a0]
    const n = this._field1a0_lutGridN | 0;
    // @0x740c1-0x740c8  edx = n*n + 1  ;  ecx = n + 1
    // Signed 32-bit wrap semantics mirrored via Math.imul and | 0.
    const nn_plus_1 = (Math.imul(n, n) + 1) | 0; // @0x740c3 imull ; @0x740c6 incl
    const n_plus_1 = (n + 1) | 0;                // @0x740c8 incl
    // @0x740ca-0x740ce  r12/r13 = HGRectMake4i(0, 0, n*n + 1, n + 1)
    const rSlot1: HGRect = HGRectMake4i(0, 0, nn_plus_1, n_plus_1);
    // @0x740d9-0x740e8  rax/rdx = HGRectMake4i(0, 0, 1, n)
    // (edx reloaded from 0x1a0 for the width, ecx set to 1 for the height axis)
    const rSlot2: HGRect = HGRectMake4i(0, 0, 1, n);
    // @0x740ed-0x740f1  case 2
    const fs = fieldSlot | 0;
    if (fs === 2) {
      return rSlot2;
    }
    // @0x740f3-0x740f7  case 1
    if (fs === 1) {
      return rSlot1;
    }
    // @0x740f9-0x740fc  testl r15d,r15d ; jne default
    if (fs === 0) {
      // @0x740fe-0x74105  return inputRect
      return {
        x: inputRect.x | 0,
        y: inputRect.y | 0,
        right: inputRect.right | 0,
        bottom: inputRect.bottom | 0,
      };
    }
    // @0x7410f-0x74119  default -> HGRectNull
    return {
      x: HGRectNull.x,
      y: HGRectNull.y,
      right: HGRectNull.right,
      bottom: HGRectNull.bottom,
    };
  }

  /**
   * Destructor D0 @Helium 0x74060 - not exposed as a JS method.
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   movq  %rdi,%rbx                                      ; save this
   *   callq HgcApply3DLUTTetrahedral_basekernel::~HgcApply3DLUTTetrahedral_basekernel()  ; not yet transcribed @Helium 0x74069
   *   movq  %rbx,%rdi
   *   addq  $0x8,%rsp ; popq %rbx ; popq %rbp
   *   jmp   HGObject::operator delete(void*)               ; not yet transcribed @Helium 0x74077
   */
}
