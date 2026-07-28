// raw-port: HGCRetimeVariableRez — Helium framework (render layer)
//
// HGNode subclass that adjusts an incoming rectangle to compensate for a
// variable-resolution retiming step. Owns:
//   - two float32 fields at +0x1a0/+0x1a4 = a symmetric edge-expansion pair
//     used only by GetROI (branch edx<=1), added to xy and hw of the result
//   - two float32 fields at +0x1a8/+0x1ac = a scale factor pair used by both
//     GetDOD and GetROI (branch edx==2) to divide/multiply xy and hw.
// The `int` parameter (edx) is a retiming-type selector: 0/1 -> ROI-only edge
// expansion (DOD returns HGRectNull for that path — see cmpl $1/jbe below in
// GetDOD), 2 -> variable-rez rescale, else -> HGRectNull.
//
// SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
//   @Helium 0x194370  HGCRetimeVariableRez::~HGCRetimeVariableRez()   (D2 base dtor thunk)
//   @Helium 0x194380  HGCRetimeVariableRez::~HGCRetimeVariableRez()   (D0 deleting dtor)
//   @Helium 0x1943a0  HGCRetimeVariableRez::GetDOD(HGRenderer*, int, HGRect) -> HGRect
//   @Helium 0x194410  HGCRetimeVariableRez::GetROI(HGRenderer*, int, HGRect) -> HGRect
//
// re/disasm:
//   raw-port/re/disasm/Helium.HGCRetimeVariableRez.~HGCRetimeVariableRez.s
//   raw-port/re/disasm/Helium.HGCRetimeVariableRez.GetDOD.s
//   raw-port/re/disasm/Helium.HGCRetimeVariableRez.GetROI.s
//   (D2 body at 0x194370: pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp _HgcRetimeVariableRezD2Ev
//    — a case-different sibling name; see FRONTIER CALLEES below.)
//
// RIP-RELATIVE FLOAT32 CONSTANTS (decoded from FCP Helium slice, file-offset+0x4000):
//   @0x3ced10 = -2.0     (loaded by movss 0x23a8ae(%rip) @0x19445a in GetROI)
//   @0x3caf8c = +2.0     (loaded by movss 0x236b17(%rip) @0x19446d in GetROI)
//   @0x3ca110 = -1.0     (loaded by movss 0x235c51(%rip) @0x1944b7 in GetROI)
//   @0x3c7cc0 = +1.0     (loaded by movss 0x2337d6(%rip) @0x1944e2 in GetROI)
// These four are the standard  +/- unit values used to (a) build the edge-
// expansion  (-2,-2, 2,2) rectangle for the ROI edx<=1 branch and (b) offset
// the scaled rect by (-1,-1, 1,1) in the ROI edx==2 branch (bias to fully
// cover the sample footprint after upsampling).
//
// FRONTIER CALLEES (external symbols; not yet transcribed here):
//   _HGRectfMake4f    @0x1943ee call site — free C fn returning HGRectf packed
//                    across (xmm0,xmm1). NOT the same as HGRectMake4f (which
//                    is already ported in raw-port/src/render/HGRect.ts and
//                    returns an integer HGRect). HGRectfMake4f is not yet
//                    ported; the closest existing peer is HGRectfInit.
//   _HGRectIntegral  @0x1943f4 tail-jmp (already ported: see HGRect.ts).
//   _HGRectNull      @0x1943f9 rip-const (already ported: HGRect.ts).
//   _HgcRetimeVariableRezD2Ev  @0x194375 tail-jmp — the C++-namespaced
//                    ("Hgc" lowercase-c) peer base dtor. Distinct class /
//                    ODR-merged with something in HGC*; not yet transcribed.
//   _HGObject_operator_delete  @0x194397 tail-jmp (external allocator).
//
// GetROI/GetDOD both use HGRect (i32 corners) with the packed calling
// convention seen in HGRect.ts: (rcx = low 8 bytes = x|y<<32,
// r8 = high 8 bytes = right|bottom<<32). We mirror that layout by taking a
// tuple (x, y, right, bottom) — matching HGRect fields — and returning the
// same shape.

import type { HGRect, HGRectf } from "./HGRect";
import { HGRectIntegral, HGRectNull } from "./HGRect";

// ---------------------------------------------------------------------------
// Frontier stubs (external symbols not yet transcribed).
// ---------------------------------------------------------------------------

/** _HGRectfMake4f — packed-float rectangle constructor.
 *  Signature inferred from call sites: (x0, y0, x1, y1) -> HGRectf.
 *  NOT yet transcribed — a peer of HGRectfInit at a different callable ABI.
 *  @Helium 0x1943ee call site
 */
function HGRectfMake4f(
  _x0: number,
  _y0: number,
  _x1: number,
  _y1: number,
): HGRectf {
  throw new Error(
    "_HGRectfMake4f not yet transcribed — packed-float HGRectf ctor (see @0x1943ee call site)",
  );
}

/** HgcRetimeVariableRez::~HgcRetimeVariableRez() — case-different peer base
 *  dtor delegated to by D2 at @Helium 0x194370. Not yet transcribed. */
function HgcRetimeVariableRez_D2(_this: HGCRetimeVariableRez): void {
  throw new Error(
    "HgcRetimeVariableRez::~HgcRetimeVariableRez() not yet transcribed — peer base dtor (see @0x194375 tail-jmp)",
  );
}

/** HGObject::operator delete(void*) — allocator hook. Not yet transcribed. */
function HGObject_operator_delete(_p: HGCRetimeVariableRez): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed — external allocator (see @0x194397 tail-jmp)",
  );
}

// ---------------------------------------------------------------------------
// Class layout (recovered from field offsets used in GetDOD/GetROI):
//   struct HGCRetimeVariableRez : HGNode /* or HGCNode / HGRenderNode */ {
//     ...                    // vtable + base fields (not touched by these methods)
//     float edgeExpandX;     // +0x1a0  used by GetROI edx<=1 branch
//     float edgeExpandY;     // +0x1a4
//     float scaleX;          // +0x1a8  used by GetDOD edx==2 and GetROI edx==2
//     float scaleY;          // +0x1ac
//   };
// The size of the base portion is opaque here (>=0x1a0). Any subclass field
// accessed by the two functions is documented above.
// ---------------------------------------------------------------------------

/**
 * HGRenderer* — opaque frontier type. Consumed by GetDOD/GetROI signature but
 * NEVER dereferenced within either body (only int retimingType + HGRect are
 * used). Left as `unknown` to keep the port faithful without pulling in an
 * unrelated class.
 */
export type HGRenderer = unknown;

export class HGCRetimeVariableRez {
  edgeExpandX = Math.fround(0);
  edgeExpandY = Math.fround(0);
  scaleX = Math.fround(1);
  scaleY = Math.fround(1);

  // -------------------------------------------------------------------------
  // ~HGCRetimeVariableRez (D2 base) @Helium 0x194370
  //   pushq %rbp; movq %rsp,%rbp; popq %rbp;
  //   jmp   __ZN20HgcRetimeVariableRezD2Ev
  // A trivial frame-set/pop then tail-jump into the lowercase-c peer dtor.
  // In the port, we make this a method that delegates to the frontier stub.
  // -------------------------------------------------------------------------
  destroyBase(): void {
    // @0x194375: jmp HgcRetimeVariableRez::~HgcRetimeVariableRez()
    HgcRetimeVariableRez_D2(this);
  }

  // -------------------------------------------------------------------------
  // ~HGCRetimeVariableRez (D0 deleting) @Helium 0x194380
  //   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax          @0x194380
  //   movq %rdi,%rbx                                              @0x194386
  //   callq HgcRetimeVariableRez::~HgcRetimeVariableRez()         @0x194389
  //   movq %rbx,%rdi                                              @0x19438e
  //   ...
  //   jmp HGObject::operator delete(void*)                        @0x194397
  // -------------------------------------------------------------------------
  destroyAndDelete(): void {
    // @0x194389: base dtor
    HgcRetimeVariableRez_D2(this);
    // @0x194397: HGObject::operator delete(this)
    HGObject_operator_delete(this);
  }

  /**
   * HGCRetimeVariableRez::GetDOD(HGRenderer*, int retimingType, HGRect r) -> HGRect
   * @Helium 0x1943a0
   *
   *   cmpl $0x1,%edx; jbe 0x194407                                  @0x1943a0
   *     ; if retimingType in {0,1}: fall through to return HGRectNull path
   *   cmpl $0x2,%edx; jne 0x1943f9                                  @0x1943a5
   *     ; if retimingType != 2: also HGRectNull path
   *   ; --- retimingType == 2 --- (variable-rez rescale case)
   *   pushq %rbp; movq %rsp,%rbp                                    @0x1943aa
   *   movq %rcx,%rax; shrq $0x20,%rax                               @0x1943ae  ; rax = r.y
   *   cvtsi2ss %ecx,%xmm0                                           @0x1943b5  ; xmm0 = float(r.x)
   *   movss 0x1a8(%rdi),%xmm3                                       @0x1943b9  ; xmm3 = scaleX
   *   cvtsi2ss %eax,%xmm1                                           @0x1943c1  ; xmm1 = float(r.y)
   *   movss 0x1ac(%rdi),%xmm4                                       @0x1943c5  ; xmm4 = scaleY
   *   cvtsi2ss %r8d,%xmm2                                           @0x1943cd  ; xmm2 = float(r.right)
   *   divss %xmm3,%xmm0                                             @0x1943d2  ; xmm0 = r.x / scaleX
   *   divss %xmm4,%xmm1                                             @0x1943d6  ; xmm1 = r.y / scaleY
   *   divss %xmm3,%xmm2                                             @0x1943da  ; xmm2 = r.right / scaleX
   *   shrq $0x20,%r8                                                @0x1943de  ; r8 = r.bottom
   *   xorps %xmm3,%xmm3; cvtsi2ss %r8d,%xmm3                        @0x1943e2  ; xmm3 = float(r.bottom)
   *   divss %xmm4,%xmm3                                             @0x1943ea  ; xmm3 = r.bottom / scaleY
   *   callq _HGRectfMake4f                                          @0x1943ee
   *   popq %rbp; jmp _HGRectIntegral                                @0x1943f3
   *   ; --- HGRectNull path (edx in {0,1} OR edx > 2) ---
   *   leaq _HGRectNull(%rip),%rax; movq (%rax),%rcx; movq 8(%rax),%r8  @0x1943f9
   *   movq %rcx,%rax; movq %r8,%rdx; retq                           @0x194407
   *
   *   NOTE: The `jbe 0x194407` at @0x1943a3 jumps DIRECTLY to the load of
   *   rcx/r8 into the return regs — this is a subtle asm shortcut. It relies
   *   on rcx/r8 already holding the input rect for the edx<=1 case (they do,
   *   as ABI-passed params), so returning them unchanged. But wait — the
   *   HGRectNull load at 0x1943f9 REBINDS rcx and r8 to the NULL rect, then
   *   flows into 0x194407 where movq %rcx,%rax and movq %r8,%rdx run. And
   *   the jbe branch skips the rebind — so THE jbe (edx<=1) PATH RETURNS THE
   *   INPUT RECT UNCHANGED. Only the "edx > 2" case (jne 0x1943f9 fall-through
   *   after the cmp) rebinds to HGRectNull.
   *
   *   Summary of the three DOD paths:
   *     edx <= 1   -> return input rect unchanged   (jbe at @0x1943a3)
   *     edx == 2   -> HGRectIntegral(HGRectfMake4f(x/sx, y/sy, r/sx, b/sy))
   *     edx >  2   -> return HGRectNull
   */
  GetDOD(_renderer: HGRenderer, retimingType: number, r: HGRect): HGRect {
    const edx = retimingType | 0;
    // @0x1943a0..0x1943a3: cmpl $1,edx; jbe .Lpassthru
    if (edx <= 1 && edx >= 0) {
      // The jbe interprets edx as unsigned; but retimingType is a signed
      // enum-shaped int, and the fall-through at @0x1943a5 also gates edx==2
      // separately, so this path is entered for edx in {0,1}.
      // @0x194407: movq %rcx,%rax; movq %r8,%rdx; retq — returns input rect
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }
    // @0x1943a5..0x1943a8: cmpl $2,edx; jne .LnullPath
    if (edx !== 2) {
      // @0x1943f9: rebind (rcx,r8) to HGRectNull, then @0x194407 return
      return { ...HGRectNull };
    }
    // @0x1943aa..0x1943ea: variable-rez rescale
    // Widen input i32 corners to f32
    const rx = Math.fround(r.x | 0);
    const ry = Math.fround(r.y | 0);
    const rR = Math.fround(r.right | 0);
    const rB = Math.fround(r.bottom | 0);
    // @0x1943b9 / 0x1943c5: load scaleX,scaleY
    const sx = Math.fround(this.scaleX);
    const sy = Math.fround(this.scaleY);
    // @0x1943d2..0x1943ea: divss
    const x0 = Math.fround(rx / sx);
    const y0 = Math.fround(ry / sy);
    const x1 = Math.fround(rR / sx);
    const y1 = Math.fround(rB / sy);
    // @0x1943ee: HGRectfMake4f -> HGRectf
    const rf: HGRectf = HGRectfMake4f(x0, y0, x1, y1);
    // @0x1943f4: tail-jmp HGRectIntegral
    return HGRectIntegral(rf);
  }

  /**
   * HGCRetimeVariableRez::GetROI(HGRenderer*, int retimingType, HGRect r) -> HGRect
   * @Helium 0x194410
   *
   *   ; --- prologue + unpack HGRect into (r.x=%ecx, r.y=%esi, r.right=%r8d, r.bottom=%eax) ---
   *   pushq %rbp; movq %rsp,%rbp; subq $0x20,%rsp                    @0x194410
   *   movq %rcx,%rsi; shrq $0x20,%rsi                                @0x194418  ; rsi = r.y
   *   movq %r8, %rax; shrq $0x20,%rax                                @0x19441f  ; rax = r.bottom
   *   cmpl $0x1,%edx; ja 0x19449a                                    @0x194426
   *   ; --- edx in {0,1} : edge-expansion path ---
   *   movd %r8d,%xmm0; pinsrd $1,%eax,%xmm0                          @0x19442b  ; xmm0 lanes = [r.right, r.bottom, _, _]
   *   movdqa %xmm0,-0x20(%rbp)                                        @0x194436
   *   movd %ecx,%xmm0; pinsrd $1,%esi,%xmm0                          @0x19443b  ; xmm0 lanes = [r.x, r.y, _, _]
   *   movdqa %xmm0,-0x10(%rbp)                                        @0x194445
   *   movss 0x1a0(%rdi),%xmm2                                        @0x19444a  ; xmm2 = edgeExpandX
   *   movss 0x1a4(%rdi),%xmm3                                        @0x194452  ; xmm3 = edgeExpandY
   *   movss 0x23a8ae(%rip),%xmm1                                     @0x19445a  ; xmm1 = -2.0 (@0x3ced10)
   *   movaps %xmm1,%xmm0; subss %xmm2,%xmm0                          @0x194462  ; xmm0 = -2.0 - edgeExpandX
   *   subss %xmm3,%xmm1                                              @0x194469  ; xmm1 = -2.0 - edgeExpandY
   *   movss 0x236b17(%rip),%xmm4                                     @0x19446d  ; xmm4 = +2.0 (@0x3caf8c)
   *   addss %xmm4,%xmm2                                              @0x194475  ; xmm2 = edgeExpandX + 2.0
   *   addss %xmm4,%xmm3                                              @0x194479  ; xmm3 = edgeExpandY + 2.0
   *   callq _HGRectfMake4f                                           @0x19447d
   *     ; HGRectfMake4f(-2-eX, -2-eY, eX+2, eY+2) -> HGRectf into (xmm0,xmm1)
   *     ; NOTE: the packed calling convention is not obvious — the loads/stores
   *     ; at 0x194482..0x19448d show that HGRectfMake4f returns TWO ps values
   *     ; in (xmm0, xmm1), each holding two float32 lanes (xy in xmm0, hw in xmm1).
   *   cvtdq2ps -0x10(%rbp),%xmm2                                     @0x194482  ; xmm2 = float(r.x, r.y, _, _)
   *   addps %xmm2,%xmm0                                              @0x194486  ; xmm0.xy += (r.x, r.y)
   *   cvtdq2ps -0x20(%rbp),%xmm2                                     @0x194489  ; xmm2 = float(r.right, r.bottom, _, _)
   *   addps %xmm2,%xmm1                                              @0x19448d  ; xmm1.xy += (r.right, r.bottom)
   *   ; tail-jmp HGRectIntegral                                      @0x194495
   *
   *   ; --- edx == 2 : variable-rez rescale path (same shape as GetDOD's edx==2) ---
   *   cmpl $0x2,%edx; jne 0x194505                                   @0x19449a
   *   cvtsi2ss %ecx,%xmm0                                            @0x19449f  ; xmm0 = float(r.x)
   *   movss 0x1a8(%rdi),%xmm3                                        @0x1944a3  ; scaleX
   *   movss 0x1ac(%rdi),%xmm4                                        @0x1944ab  ; scaleY
   *   mulss %xmm3,%xmm0                                              @0x1944b3  ; xmm0 = r.x * scaleX
   *   movss 0x235c51(%rip),%xmm2                                     @0x1944b7  ; xmm2 = -1.0 (@0x3ca110)
   *   addss %xmm2,%xmm0                                              @0x1944bf  ; xmm0 = r.x * scaleX + (-1.0)
   *   cvtsi2ss %esi,%xmm1                                            @0x1944c3
   *   mulss %xmm4,%xmm1; addss %xmm2,%xmm1                           @0x1944c7  ; xmm1 = r.y * scaleY - 1.0
   *   xorps %xmm2,%xmm2; cvtsi2ss %r8d,%xmm2                         @0x1944cf
   *   mulss %xmm3,%xmm2                                              @0x1944d7  ; xmm2 = r.right * scaleX
   *   xorps %xmm3,%xmm3; cvtsi2ss %eax,%xmm3                         @0x1944db
   *   movss 0x2337d6(%rip),%xmm5                                     @0x1944e2  ; xmm5 = +1.0 (@0x3c7cc0)
   *   addss %xmm5,%xmm2                                              @0x1944ea  ; xmm2 = r.right * scaleX + 1.0
   *   mulss %xmm4,%xmm3                                              @0x1944ee
   *   addss %xmm5,%xmm3                                              @0x1944f2  ; xmm3 = r.bottom * scaleY + 1.0
   *   callq _HGRectfMake4f                                           @0x1944f6
   *   ; tail-jmp HGRectIntegral                                      @0x194500
   *
   *   ; --- else : HGRectNull path ---
   *   leaq _HGRectNull(%rip),%rcx; movq (%rcx),%rax; movq 8(%rcx),%rdx  @0x194505
   *   ; retq                                                          @0x194518
   *
   *   Summary of the three ROI paths:
   *     edx in {0,1}: HGRectIntegral( HGRectfMake4f( r.x - 2 - eX,
   *                                                  r.y - 2 - eY,
   *                                                  r.right  + 2 + eX,
   *                                                  r.bottom + 2 + eY ) )
   *                   (the packed-add via cvtdq2ps+addps fuses input-int-to-
   *                    float widening with the outer +r.xy / +r.rightBottom.)
   *     edx == 2:     HGRectIntegral( HGRectfMake4f( r.x*sx - 1,
   *                                                  r.y*sy - 1,
   *                                                  r.right*sx + 1,
   *                                                  r.bottom*sy + 1 ) )
   *     else:         HGRectNull
   */
  GetROI(_renderer: HGRenderer, retimingType: number, r: HGRect): HGRect {
    const edx = retimingType | 0;
    // @0x194418..0x19441f: unpack r (already in HGRect fields for us)
    const rx = r.x | 0;
    const ry = r.y | 0;
    const rR = r.right | 0;
    const rB = r.bottom | 0;
    // @0x194426: cmpl $1,edx; ja .LtwoOrElse
    if (edx <= 1 && edx >= 0) {
      // Edge-expansion path.
      const eX = Math.fround(this.edgeExpandX);
      const eY = Math.fround(this.edgeExpandY);
      // @0x194462..0x194479
      const negX = Math.fround(Math.fround(-2.0) - eX); // -2 - eX
      const negY = Math.fround(Math.fround(-2.0) - eY); // -2 - eY
      const posX = Math.fround(eX + Math.fround(2.0)); // eX + 2
      const posY = Math.fround(eY + Math.fround(2.0)); // eY + 2
      // @0x19447d: HGRectfMake4f(negX, negY, posX, posY)
      const rf: HGRectf = HGRectfMake4f(negX, negY, posX, posY);
      // @0x194482..0x19448d: fuse input-int widen + packed add
      const fx = Math.fround(rx);
      const fy = Math.fround(ry);
      const fR = Math.fround(rR);
      const fB = Math.fround(rB);
      const outX = Math.fround(rf.x + fx);
      const outY = Math.fround(rf.y + fy);
      const outR = Math.fround(rf.right + fR);
      const outB = Math.fround(rf.bottom + fB);
      // @0x194495: tail-jmp HGRectIntegral
      return HGRectIntegral({ x: outX, y: outY, right: outR, bottom: outB });
    }
    // @0x19449a..0x19449d: cmpl $2,edx; jne .Lnull
    if (edx !== 2) {
      // @0x194505: HGRectNull
      return { ...HGRectNull };
    }
    // Variable-rez rescale path.
    const sx = Math.fround(this.scaleX);
    const sy = Math.fround(this.scaleY);
    const fx = Math.fround(rx);
    const fy = Math.fround(ry);
    const fR = Math.fround(rR);
    const fB = Math.fround(rB);
    // @0x1944b3..0x1944f2
    const x0 = Math.fround(Math.fround(fx * sx) + Math.fround(-1.0));
    const y0 = Math.fround(Math.fround(fy * sy) + Math.fround(-1.0));
    const x1 = Math.fround(Math.fround(fR * sx) + Math.fround(1.0));
    const y1 = Math.fround(Math.fround(fB * sy) + Math.fround(1.0));
    // @0x1944f6: HGRectfMake4f
    const rf: HGRectf = HGRectfMake4f(x0, y0, x1, y1);
    // @0x194500: tail-jmp HGRectIntegral
    return HGRectIntegral(rf);
  }
}
