// HGCRetimeWithFlowInterpVariableRez.ts — Helium render node
//   "Retime With Flow Interp, Variable Rez": a retiming node that samples an
//   input clip's time axis via optical-flow interpolation while allowing the
//   rendered rez (resolution) to differ from the input rez. Only the class's
//   DOD/ROI vfns + dtors are exported at this symbol range; the actual retime
//   sampling lives in the (as-yet-undecoded) HgcRetimeWithFlowInterpVariableRez
//   base class (D2 dtor cited below).
//
// Faithful transcription of x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGCRetimeWithFlowInterpVariableRez.~HGCRetimeWithFlowInterpVariableRez.s
//   raw-port/re/disasm/Helium.HGCRetimeWithFlowInterpVariableRez.GetDOD.s
//   raw-port/re/disasm/Helium.HGCRetimeWithFlowInterpVariableRez.GetROI.s
//
// Helium symbols transcribed:
//   @0x00000000000e1460  HGCRetimeWithFlowInterpVariableRez::~HGCRetimeWithFlowInterpVariableRez() [D1]
//   @0x00000000000e1470  HGCRetimeWithFlowInterpVariableRez::~HGCRetimeWithFlowInterpVariableRez() [D0]
//   @0x00000000000e1490  HGCRetimeWithFlowInterpVariableRez::GetDOD(HGRenderer*, int, HGRect)
//   @0x00000000000e1500  HGCRetimeWithFlowInterpVariableRez::GetROI(HGRenderer*, int, HGRect)
//
// DECODE evidence — ABI mapping for the DOD/ROI virtuals (matches every other
// HGC*/HMask* Helium node):
//   %rdi = self (HGCRetimeWithFlowInterpVariableRez*)
//   %rsi = HGRenderer* (unused by GetDOD/GetROI — nothing reads it)
//   %edx = which  (input index / "which")
//   %rcx = incoming HGRect.lo = x1 | (y1 << 32) — int32 corners
//   %r8  = incoming HGRect.hi = x2 | (y2 << 32) — int32 corners
//   return: rax = out.lo, rdx = out.hi
//
// Instance layout recovered from GetDOD/GetROI:
//   struct HGCRetimeWithFlowInterpVariableRez {
//     ... (parent HgcRetimeWithFlowInterpVariableRez fields, undecoded) ...
//     float  paramA_at_0x1a0;   // @0xe153a movss 0x1a0(%rdi), %xmm2
//     float  paramB_at_0x1a4;   // @0xe1542 movss 0x1a4(%rdi), %xmm3
//     float  scaleX_at_0x1a8;   // @0xe14a2 divss 0x1a8(%rdi), %xmm0
//                               //   and @0xe1593 mulss 0x1a8(%rdi), %xmm0
//     float  scaleY_at_0x1ac;   // @0xe14b7 movss 0x1ac(%rdi), %xmm4
//                               //   and @0xe15ab movss 0x1ac(%rdi), %xmm4
//   };
//
//   NB: GetDOD's edx==2 branch divides x1 by scaleX_at_0x1a8 but divides
//   y1, x2, y2 all by scaleY_at_0x1ac (single %xmm4 reload). GetROI's edx==2
//   branch is symmetric (multiply): x1 * scaleX, y1/x2/y2 * scaleY. This
//   asymmetry is present in the shipping FCP binary and is faithfully mirrored
//   here per Rule 1 (transcribe, do NOT reimplement).
//
// RIP-relative f32 constants (single-precision, low 32 bits of the qword read
// by resolve.py `const`; movss reads exactly 4 bytes):
//   @Helium 0x3ced10  low32=0xc0000000 f32 = -2.0  (@0xe154a movss into xmm1)
//   @Helium 0x3caf8c  low32=0x40000000 f32 = +2.0  (@0xe155d movss into xmm4)
//   @Helium 0x3ca110  low32=0xbf800000 f32 = -1.0  (@0xe159f movss into xmm2)
//   @Helium 0x3c7cc0  low32=0x3f800000 f32 = +1.0  (@0xe15cb movss into xmm5)
//   Verification: RIP-target = insn-end-offset + disp. E.g. @0xe154a is an
//   8-byte insn -> RIP after = 0xe1552, +0x2ed7be = 0x3ced10. Ditto for the
//   other three (all 8-byte movss with 4B disp).
//
// External Helium call targets (all cited by name+addr; body lives elsewhere
// and is a THROWing frontier stub in this file where not-yet-transcribed):
//   _HGRectfMake4f                              @Helium 0x107e30
//     (takes 4 f32s as (x0,y0,x1,y1) — packs into HGRectf with per-lane
//      min/max/NaN-collapse normalisation; returns two-lane packed via
//      xmm0=(minX,minY), xmm1=(maxX,maxY). Transcribed inline as a local
//      helper below, faithful to the 0x107e30 body.)
//   _HGRectIntegral                             @Helium 0x107be0
//     -> imported from ./HGRect.ts (HGRectIntegral).
//   _HGRectNull                                 @Helium 0x3d2284 (data)
//     -> imported from ./HGRect.ts (HGRectNull constant).
//   __ZN34HgcRetimeWithFlowInterpVariableRezD2Ev
//     HgcRetimeWithFlowInterpVariableRez::~HgcRetimeWithFlowInterpVariableRez()
//     -- Helium base-class dtor; NOT YET TRANSCRIBED (frontier).
//   __ZN8HGObjectdlEPv
//     HGObject::operator delete(void*) -- NOT YET TRANSCRIBED (frontier).
//
// Frontier callees / types (not yet transcribed):
//   - HgcRetimeWithFlowInterpVariableRez (Helium base class + its D2 dtor)
//   - HGObject::operator delete(void*)  (Helium free-list allocator)

import { HGRect, HGRectf, HGRectIntegral, HGRectNull } from './HGRect';

// ---------------------------------------------------------------------------
// f32 helper — single-precision rounding for every SS/PS op we transcribe.
// ---------------------------------------------------------------------------
const f32 = Math.fround;
function isNaN32(x: number): boolean { return Number.isNaN(x); }

/** HGRenderer* — opaque handle. GetDOD/GetROI do not read %rsi anywhere;
 *  documented for parity with the C++ signature. */
export interface HGRenderer {}

/** HgcRetimeWithFlowInterpVariableRez — Helium base class of
 *  HGCRetimeWithFlowInterpVariableRez. Only its D2 destructor is referenced
 *  by this file (called from both D1 tail-jmp @0xe1465 and D0 callq @0xe1479).
 *  The rest of the base body is not yet transcribed. */
export interface HgcRetimeWithFlowInterpVariableRez {
  /** HgcRetimeWithFlowInterpVariableRez::~HgcRetimeWithFlowInterpVariableRez()
   *  @Helium __ZN34HgcRetimeWithFlowInterpVariableRezD2Ev — base destructor
   *  called from D1 @0xe1465 and D0 @0xe1479. Not yet transcribed. */
  __dtor_base(): void;
}

/** HGCRetimeWithFlowInterpVariableRez — the class this file transcribes.
 *  Struct layout recovered from GetDOD/GetROI (see file header). */
export interface HGCRetimeWithFlowInterpVariableRez extends HgcRetimeWithFlowInterpVariableRez {
  /** f32 @ offset 0x1a0 — first term of GetROI's edx<=1 "grow by 2 - param"
   *  contraction. Populated by upstream code (not this class). */
  readonly paramA_at_0x1a0: number;
  /** f32 @ offset 0x1a4 — second term (paired with paramA). */
  readonly paramB_at_0x1a4: number;
  /** f32 @ offset 0x1a8 — first scale factor (applied ONLY to x1 in
   *  GetDOD@edx==2 and GetROI@edx==2). */
  readonly scaleX_at_0x1a8: number;
  /** f32 @ offset 0x1ac — second scale factor (applied to y1, x2, y2 in
   *  GetDOD@edx==2 and GetROI@edx==2). See file header note on the asymmetry
   *  which is faithful to the shipping binary. */
  readonly scaleY_at_0x1ac: number;
}

// ---------------------------------------------------------------------------
// HGRectfMake4f — inlined transcription of _HGRectfMake4f @Helium 0x107e30.
//
//   0x107e34  insertps $0x10, xmm1, xmm0    ; xmm0 = (x0, y0, _, _)
//   0x107e3a  insertps $0x10, xmm3, xmm2    ; xmm2 = (x1, y1, _, _)
//   0x107e40  movaps  %xmm2, %xmm3           ; xmm3 = P1
//   0x107e43  minps   %xmm0, %xmm3           ; xmm3 = per-lane min(P1, P0)
//   0x107e46  movaps  %xmm2, %xmm1           ; xmm1 = P1
//   0x107e49  maxps   %xmm0, %xmm1           ; xmm1 = per-lane max(P1, P0)
//   0x107e4c  cmpunordps %xmm0, %xmm0        ; NaN mask over lanes of P0
//   0x107e50  blendvps %xmm0, %xmm2, %xmm3   ; NaN(P0 lane) -> take P1 lane in min
//   0x107e55  blendvps %xmm0, %xmm2, %xmm1   ; ...same for max
//   0x107e5a  movaps  %xmm3, %xmm0           ; return (xmm0=min lane, xmm1=max lane)
//   0x107e5d  popq  %rbp ; retq
//
// Semantics: normalise the two corners (x0,y0) and (x1,y1) into (min, max).
// If P0 (the first corner) has a NaN component that lane collapses to P1's
// lane. NaN in P1 propagates through min/max naturally per SSE.
// ---------------------------------------------------------------------------
function HGRectfMake4f(x0: number, y0: number, x1: number, y1: number): HGRectf {
  const fx0 = f32(x0), fy0 = f32(y0), fx1 = f32(x1), fy1 = f32(y1);

  // NaN in P0 (x0,y0) collapses BOTH the min AND the max of that lane to P1
  // (blendvps @0x107e50 / @0x107e55). NaN in P1 propagates naturally through
  // minps/maxps (the second operand wins for unordered operands).
  let minX: number, maxX: number;
  if (isNaN32(fx0)) {
    minX = fx1;
    maxX = fx1;
  } else {
    minX = isNaN32(fx1) ? fx0 : f32(Math.min(fx1, fx0));
    maxX = isNaN32(fx1) ? fx0 : f32(Math.max(fx1, fx0));
  }
  let minY: number, maxY: number;
  if (isNaN32(fy0)) {
    minY = fy1;
    maxY = fy1;
  } else {
    minY = isNaN32(fy1) ? fy0 : f32(Math.min(fy1, fy0));
    maxY = isNaN32(fy1) ? fy0 : f32(Math.max(fy1, fy0));
  }
  return { x: minX, y: minY, right: maxX, bottom: maxY };
}

// ---------------------------------------------------------------------------
// HGCRetimeWithFlowInterpVariableRez::~HGCRetimeWithFlowInterpVariableRez()
//   D1 (base-object dtor) @Helium 0x00000000000e1460
//
//   @0xe1460  pushq %rbp ; movq %rsp, %rbp ; popq %rbp
//   @0xe1465  jmp   __ZN34HgcRetimeWithFlowInterpVariableRezD2Ev
//             (tail-call to HgcRetimeWithFlowInterpVariableRez::~HgcRetime...())
// ---------------------------------------------------------------------------

/** HGCRetimeWithFlowInterpVariableRez::~HGCRetimeWithFlowInterpVariableRez()
 *  (D1 base-object dtor) @Helium 0x00000000000e1460.
 *  Tail-jumps to the base HgcRetimeWithFlowInterpVariableRez destructor. */
export function HGCRetimeWithFlowInterpVariableRez_dtor_D1(
  self: HGCRetimeWithFlowInterpVariableRez,
): void {
  // @0xe1465 jmp __ZN34HgcRetimeWithFlowInterpVariableRezD2Ev
  self.__dtor_base();
}

// ---------------------------------------------------------------------------
// HGCRetimeWithFlowInterpVariableRez::~HGCRetimeWithFlowInterpVariableRez()
//   D0 (deleting dtor) @Helium 0x00000000000e1470
//
//   @0xe1470  pushq %rbp ; movq %rsp, %rbp
//   @0xe1474  pushq %rbx ; pushq %rax
//   @0xe1476  movq  %rdi, %rbx                 ; save self
//   @0xe1479  callq __ZN34HgcRetimeWithFlowInterpVariableRezD2Ev  (base dtor)
//   @0xe147e  movq  %rbx, %rdi                 ; restore self as arg
//   @0xe1481  addq  $0x8, %rsp
//   @0xe1485  popq  %rbx ; popq %rbp
//   @0xe1487  jmp   __ZN8HGObjectdlEPv         ; tail-call HGObject::operator delete
// ---------------------------------------------------------------------------

/** HGCRetimeWithFlowInterpVariableRez::~HGCRetimeWithFlowInterpVariableRez()
 *  (D0 deleting dtor) @Helium 0x00000000000e1470.
 *  Calls the base HgcRetimeWithFlowInterpVariableRez destructor, then
 *  tail-calls HGObject::operator delete(void*) on the object pointer. In TS
 *  there is no manual free (JS GC handles it); the base-dtor call is
 *  surfaced so callers can chain cleanup semantics. */
export function HGCRetimeWithFlowInterpVariableRez_dtor_D0(
  self: HGCRetimeWithFlowInterpVariableRez,
): void {
  // @0xe1479 callq __ZN34HgcRetimeWithFlowInterpVariableRezD2Ev
  self.__dtor_base();
  // @0xe1487 jmp __ZN8HGObjectdlEPv -- HGObject::operator delete(void*).
  // TS has no manual free; the JS runtime GC reclaims. Documented for parity.
}

// ---------------------------------------------------------------------------
// HGCRetimeWithFlowInterpVariableRez::GetDOD(HGRenderer*, int, HGRect)
//   @Helium 0x00000000000e1490
//
//   ABI: %rdi=self, %rsi=renderer(unused), %edx=which,
//        %rcx=inRect.lo (x1|y1<<32), %r8=inRect.hi (x2|y2<<32).
//
//   @0xe1490  cmpl $0x1, %edx                 ; compare which vs 1 (unsigned)
//   @0xe1493  jbe  0xe14ed                    ; if (which <= 1u) -> tail:
//                                                return (inRect.lo, inRect.hi)
//                                                unchanged (rax=rcx, rdx=r8).
//   @0xe1495  cmpl $0x2, %edx
//   @0xe1498  jne  0xe14df                    ; if (which != 2) -> return HGRectNull
//   ---  edx == 2  branch  ---
//   @0xe149a  pushq %rbp ; movq %rsp, %rbp
//   @0xe149e  cvtsi2ss %ecx, %xmm0            ; xmm0 = (f32)inRect.x1
//   @0xe14a2  divss  0x1a8(%rdi), %xmm0       ; xmm0 = x1 / self.scaleX_at_0x1a8
//   @0xe14aa  shrq $0x20, %rcx                ; rcx  = inRect.y1  (upper 32)
//   @0xe14ae  cvtsi2ss %ecx, %xmm1            ; xmm1 = (f32)y1
//   @0xe14b2  cvtsi2ss %r8d, %xmm2            ; xmm2 = (f32)inRect.x2
//   @0xe14b7  movss  0x1ac(%rdi), %xmm4       ; xmm4 = self.scaleY_at_0x1ac
//   @0xe14bf  divss  %xmm4, %xmm1             ; xmm1 = y1 / scaleY
//   @0xe14c3  divss  %xmm4, %xmm2             ; xmm2 = x2 / scaleY   (SIC — see hdr)
//   @0xe14c7  shrq $0x20, %r8                 ; r8   = inRect.y2 (upper 32)
//   @0xe14cb  cvtsi2ss %r8d, %xmm3            ; xmm3 = (f32)y2
//   @0xe14d0  divss  %xmm4, %xmm3             ; xmm3 = y2 / scaleY
//   @0xe14d4  callq _HGRectfMake4f            ; HGRectfMake4f(x1/SX, y1/SY, x2/SY, y2/SY)
//   @0xe14d9  popq  %rbp
//   @0xe14da  jmp   _HGRectIntegral           ; tail-call HGRectIntegral(above)
//   ---  edx != 2 && edx > 1 branch (0xe14df)  ---
//   @0xe14df  leaq  _HGRectNull(%rip), %rax   ; rax = &HGRectNull
//   @0xe14e6  movq  (%rax), %rcx              ; rcx = HGRectNull.lo
//   @0xe14e9  movq  0x8(%rax), %r8            ; r8  = HGRectNull.hi
//   @0xe14ed  movq  %rcx, %rax                ; return.lo = rcx
//   @0xe14f0  movq  %r8, %rdx                 ; return.hi = r8
//   @0xe14f3  retq
//
//   Semantics (unsigned edx from `cmpl` at @0xe1490):
//     which <= 1u   -> return incoming inRect unchanged
//                      (fall-through @0xe14ed reads (rcx, r8) which still hold
//                       the incoming inRect args from the ABI).
//     which == 2u   -> return HGRectIntegral( HGRectfMake4f( x1/SX,
//                                                            y1/SY,
//                                                            x2/SY,
//                                                            y2/SY ) )
//     otherwise     -> return HGRectNull
// ---------------------------------------------------------------------------

/** HGCRetimeWithFlowInterpVariableRez::GetDOD(renderer, which, rect)
 *  @Helium 0x00000000000e1490.
 *
 *  which <= 1 -> passes the incoming rect through unchanged
 *                (retiming with input rez matching output rez).
 *  which == 2 -> scales the input rect by (scaleX, scaleY) and integralises
 *                — with the shipping-binary asymmetry that only x1 uses
 *                scaleX, while y1/x2/y2 use scaleY (see file header).
 *  which >  2 -> HGRectNull. */
export function HGCRetimeWithFlowInterpVariableRez_GetDOD(
  self: HGCRetimeWithFlowInterpVariableRez,
  _renderer: HGRenderer | null,
  which: number,
  rect: HGRect,
): HGRect {
  // @0xe1490 cmpl $0x1, %edx ; @0xe1493 jbe 0xe14ed  (unsigned compare)
  const uwhich = which >>> 0;
  if (uwhich <= 1) {
    // @0xe14ed movq %rcx, %rax ; movq %r8, %rdx ; retq -- return incoming rect.
    // ABI: (rcx, r8) hold (inRect.lo, inRect.hi) throughout — no re-materialise.
    return { x: rect.x | 0, y: rect.y | 0, right: rect.right | 0, bottom: rect.bottom | 0 };
  }
  // @0xe1495 cmpl $0x2, %edx ; @0xe1498 jne 0xe14df
  if (uwhich !== 2) {
    // @0xe14df leaq _HGRectNull(%rip), %rax ; @0xe14e6/@0xe14e9 load into rcx/r8
    return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
  }
  // edx == 2 branch  @0xe149a..@0xe14da
  //
  // Faithful to the disasm: read the four int32 corners of `rect`, convert
  // each to f32, and apply the divsions AS WRITTEN (see hdr note on the
  // scaleX/scaleY asymmetry).
  const x1_f = f32(rect.x       | 0);   // @0xe149e cvtsi2ss %ecx (=inRect.x1)
  const y1_f = f32(rect.y       | 0);   // @0xe14ae cvtsi2ss %ecx (=inRect.y1 after shr)
  const x2_f = f32(rect.right   | 0);   // @0xe14b2 cvtsi2ss %r8d (=inRect.x2)
  const y2_f = f32(rect.bottom  | 0);   // @0xe14cb cvtsi2ss %r8d (=inRect.y2 after shr)

  const sX = f32(self.scaleX_at_0x1a8); // @0xe14a2 divss 0x1a8(%rdi), %xmm0
  const sY = f32(self.scaleY_at_0x1ac); // @0xe14b7 movss 0x1ac(%rdi), %xmm4

  const x = f32(x1_f / sX);             // @0xe14a2 divss ...
  const y = f32(y1_f / sY);             // @0xe14bf divss %xmm4, %xmm1
  const r = f32(x2_f / sY);             // @0xe14c3 divss %xmm4, %xmm2  (SIC — scaleY)
  const b = f32(y2_f / sY);             // @0xe14d0 divss %xmm4, %xmm3

  // @0xe14d4 callq _HGRectfMake4f
  const rf = HGRectfMake4f(x, y, r, b);
  // @0xe14da jmp _HGRectIntegral
  return HGRectIntegral(rf);
}

// ---------------------------------------------------------------------------
// HGCRetimeWithFlowInterpVariableRez::GetROI(HGRenderer*, int, HGRect)
//   @Helium 0x00000000000e1500
//
//   ABI: %rdi=self, %rsi=renderer(unused), %edx=which,
//        %rcx=inRect.lo (x1|y1<<32), %r8=inRect.hi (x2|y2<<32).
//   Frame: subq $0x20, %rsp @0xe1504 — 32 bytes of stack for (inRect.lo,
//          inRect.hi) held as packed int32 pairs for cvtdq2ps below.
//
//   @0xe1500  pushq %rbp ; movq %rsp, %rbp ; subq $0x20, %rsp
//   @0xe1508  movq  %rcx, %rsi ; shrq $0x20, %rsi   ; rsi = inRect.y1
//   @0xe150f  movq  %r8, %rax  ; shrq $0x20, %rax   ; rax = inRect.y2
//   @0xe1516  cmpl  $0x1, %edx
//   @0xe1519  ja    0xe158a                        ; if (which > 1u) -> edx==2 test
//   --- which <= 1 branch (a.k.a. the "grow by (2 - paramA)/(2 - paramB)" case) ---
//   @0xe151b  movd  %r8d, %xmm0                    ; xmm0.lo = inRect.x2 (int32)
//   @0xe1520  pinsrd $0x1, %eax, %xmm0             ; xmm0[1] = inRect.y2 (int32)
//   @0xe1526  movdqa %xmm0, -0x20(%rbp)            ; store (x2, y2) as two int32
//   @0xe152b  movd  %ecx, %xmm0                    ; xmm0.lo = inRect.x1
//   @0xe152f  pinsrd $0x1, %esi, %xmm0             ; xmm0[1] = inRect.y1
//   @0xe1535  movdqa %xmm0, -0x10(%rbp)            ; store (x1, y1) as two int32
//   @0xe153a  movss  0x1a0(%rdi), %xmm2            ; xmm2 = self.paramA_at_0x1a0
//   @0xe1542  movss  0x1a4(%rdi), %xmm3            ; xmm3 = self.paramB_at_0x1a4
//   @0xe154a  movss  0x2ed7be(%rip), %xmm1         ; xmm1 = f32 @0x3ced10 = +2.0
//   @0xe1552  movaps %xmm1, %xmm0                  ; xmm0 = 2.0
//   @0xe1555  subss  %xmm2, %xmm0                  ; xmm0 = 2.0 - paramA
//   @0xe1559  subss  %xmm3, %xmm1                  ; xmm1 = 2.0 - paramB
//   @0xe155d  movss  0x2e9a27(%rip), %xmm4         ; xmm4 = f32 @0x3caf8c = -2.0
//   @0xe1565  addss  %xmm4, %xmm2                  ; xmm2 = paramA + (-2.0) = paramA - 2
//   @0xe1569  addss  %xmm4, %xmm3                  ; xmm3 = paramB - 2
//   @0xe156d  callq _HGRectfMake4f                  ; makes rectf from
//                                                    (2-A, 2-B, A-2, B-2) — after
//                                                    normalisation this is the
//                                                    "grow by (A-2, B-2)" pad.
//   @0xe1572  cvtdq2ps -0x10(%rbp), %xmm2           ; xmm2 = (float)(x1, y1, ..)
//   @0xe1576  addps  %xmm2, %xmm0                   ; xmm0 (min lane) += (x1, y1)
//   @0xe1579  cvtdq2ps -0x20(%rbp), %xmm2           ; xmm2 = (float)(x2, y2, ..)
//   @0xe157d  addps  %xmm2, %xmm1                   ; xmm1 (max lane) += (x2, y2)
//   @0xe1585  jmp   _HGRectIntegral                 ; tail: integralise the padded rect
//   --- which > 1 branch (@0xe158a) ---
//   @0xe158a  cmpl  $0x2, %edx
//   @0xe158d  jne   0xe15ee                         ; if (which != 2) -> HGRectNull
//   @0xe158f  cvtsi2ss %ecx, %xmm0                  ; xmm0 = (f32)inRect.x1
//   @0xe1593  mulss  0x1a8(%rdi), %xmm0             ; xmm0 = x1 * scaleX_at_0x1a8
//   @0xe159b  cvtsi2ss %esi, %xmm1                  ; xmm1 = (f32)inRect.y1
//   @0xe159f  movss  0x2e8b69(%rip), %xmm2          ; xmm2 = f32 @0x3ca110 = -1.0
//   @0xe15a7  addss  %xmm2, %xmm0                   ; xmm0 = x1*sX + (-1.0)
//   @0xe15ab  movss  0x1ac(%rdi), %xmm4             ; xmm4 = scaleY_at_0x1ac
//   @0xe15b3  mulss  %xmm4, %xmm1                   ; xmm1 = y1 * scaleY
//   @0xe15b7  addss  %xmm2, %xmm1                   ; xmm1 = y1*sY - 1
//   @0xe15bb  xorps  %xmm2, %xmm2                   ; (clear before conv)
//   @0xe15be  cvtsi2ss %r8d, %xmm2                  ; xmm2 = (f32)inRect.x2
//   @0xe15c3  mulss  %xmm4, %xmm2                   ; xmm2 = x2 * scaleY   (SIC)
//   @0xe15c7  cvtsi2ss %eax, %xmm3                  ; xmm3 = (f32)inRect.y2
//   @0xe15cb  movss  0x2e66ed(%rip), %xmm5          ; xmm5 = f32 @0x3c7cc0 = +1.0
//   @0xe15d3  addss  %xmm5, %xmm2                   ; xmm2 = x2*sY + 1.0
//   @0xe15d7  mulss  %xmm4, %xmm3                   ; xmm3 = y2 * scaleY
//   @0xe15db  addss  %xmm5, %xmm3                   ; xmm3 = y2*sY + 1.0
//   @0xe15df  callq _HGRectfMake4f                   ; (x1*sX-1, y1*sY-1, x2*sY+1, y2*sY+1)
//   @0xe15e9  jmp   _HGRectIntegral
//   --- else (which != 2 AND which > 1) branch (@0xe15ee) ---
//   @0xe15ee  leaq  _HGRectNull(%rip), %rcx
//   @0xe15f5  movq  (%rcx), %rax
//   @0xe15f8  movq  0x8(%rcx), %rdx
//   @0xe1601  retq
//
//   Semantics summary (unsigned edx from `cmpl` at @0xe1516):
//     which <= 1u  -> HGRectIntegral( HGRectfMake4f(
//                        inRect.x1 + (2 - paramA),
//                        inRect.y1 + (2 - paramB),
//                        inRect.x2 + (paramA - 2),
//                        inRect.y2 + (paramB - 2) ) )
//                    -- i.e. grow the rect by ±(paramA-2, paramB-2) around
//                    both corners; when paramA,paramB < 2 the rect SHRINKS by
//                    (2 - paramA, 2 - paramB) on each side.
//     which == 2u  -> HGRectIntegral( HGRectfMake4f(
//                        inRect.x1 * scaleX  -  1,
//                        inRect.y1 * scaleY  -  1,
//                        inRect.x2 * scaleY  +  1,   (SIC — scaleY on x2)
//                        inRect.y2 * scaleY  +  1 ) )
//     otherwise    -> HGRectNull
// ---------------------------------------------------------------------------

/** HGCRetimeWithFlowInterpVariableRez::GetROI(renderer, which, rect)
 *  @Helium 0x00000000000e1500. See file header for full formula. */
export function HGCRetimeWithFlowInterpVariableRez_GetROI(
  self: HGCRetimeWithFlowInterpVariableRez,
  _renderer: HGRenderer | null,
  which: number,
  rect: HGRect,
): HGRect {
  // @0xe1516 cmpl $0x1, %edx ; @0xe1519 ja 0xe158a  (unsigned compare)
  const uwhich = which >>> 0;

  if (uwhich <= 1) {
    // "grow/shrink by (2 - paramA, 2 - paramB)" branch.
    const A = f32(self.paramA_at_0x1a0);   // @0xe153a movss 0x1a0(%rdi), %xmm2
    const B = f32(self.paramB_at_0x1a4);   // @0xe1542 movss 0x1a4(%rdi), %xmm3

    // @0xe154a xmm1 = 2.0 (f32 @0x3ced10); @0xe1552 xmm0 = 2.0
    // @0xe1555 xmm0 = 2.0 - A ; @0xe1559 xmm1 = 2.0 - B
    const twoMinusA = f32(f32(2.0) - A);   // @0xe1555 subss %xmm2, %xmm0
    const twoMinusB = f32(f32(2.0) - B);   // @0xe1559 subss %xmm3, %xmm1
    // @0xe155d xmm4 = -2.0 (f32 @0x3caf8c) ; @0xe1565 xmm2 = A + (-2.0)
    const aMinus2   = f32(A + f32(-2.0));  // @0xe1565 addss %xmm4, %xmm2
    const bMinus2   = f32(B + f32(-2.0));  // @0xe1569 addss %xmm4, %xmm3

    // @0xe156d callq _HGRectfMake4f(x0=2-A, y0=2-B, x1=A-2, y1=B-2)
    const rf = HGRectfMake4f(twoMinusA, twoMinusB, aMinus2, bMinus2);

    // @0xe1572-@0xe157d: cvtdq2ps of (x1, y1) into xmm2 lane pair, add to
    // xmm0 (=min lane of rf); cvtdq2ps of (x2, y2) into xmm2, add to xmm1
    // (=max lane). Only the first two lanes of the packed add feed
    // HGRectIntegral (the upper two lanes are undefined padding on the stack
    // -0x20(%rbp)/-0x10(%rbp) — HGRectIntegral only reads (x, y, right,
    // bottom) = (rf.x+x1, rf.y+y1, rf.right+x2, rf.bottom+y2)).
    const outX      = f32(rf.x      + f32(rect.x      | 0));   // @0xe1576 addps (x1)
    const outY      = f32(rf.y      + f32(rect.y      | 0));   // @0xe1576 addps (y1)
    const outRight  = f32(rf.right  + f32(rect.right  | 0));   // @0xe157d addps (x2)
    const outBottom = f32(rf.bottom + f32(rect.bottom | 0));   // @0xe157d addps (y2)

    // @0xe1585 jmp _HGRectIntegral
    return HGRectIntegral({
      x: outX, y: outY, right: outRight, bottom: outBottom,
    });
  }

  // @0xe158a cmpl $0x2, %edx ; @0xe158d jne 0xe15ee
  if (uwhich !== 2) {
    // @0xe15ee leaq _HGRectNull(%rip), %rcx  -- return HGRectNull.
    return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
  }

  // edx == 2 branch @0xe158f..@0xe15e9
  const x1_f = f32(rect.x       | 0);      // @0xe158f cvtsi2ss %ecx
  const y1_f = f32(rect.y       | 0);      // @0xe159b cvtsi2ss %esi
  const x2_f = f32(rect.right   | 0);      // @0xe15be cvtsi2ss %r8d
  const y2_f = f32(rect.bottom  | 0);      // @0xe15c7 cvtsi2ss %eax

  const sX = f32(self.scaleX_at_0x1a8);    // @0xe1593 mulss 0x1a8(%rdi), %xmm0
  const sY = f32(self.scaleY_at_0x1ac);    // @0xe15ab movss 0x1ac(%rdi), %xmm4

  const ONE_NEG = f32(-1.0);               // @0xe159f movss 0x2e8b69(%rip) = @0x3ca110 = -1.0
  const ONE_POS = f32( 1.0);               // @0xe15cb movss 0x2e66ed(%rip) = @0x3c7cc0 = +1.0

  const x = f32(f32(x1_f * sX) + ONE_NEG); // @0xe1593 mul ; @0xe15a7 add(-1)
  const y = f32(f32(y1_f * sY) + ONE_NEG); // @0xe15b3 mul ; @0xe15b7 add(-1)
  const r = f32(f32(x2_f * sY) + ONE_POS); // @0xe15c3 mul(SIC scaleY) ; @0xe15d3 add(+1)
  const b = f32(f32(y2_f * sY) + ONE_POS); // @0xe15d7 mul ; @0xe15db add(+1)

  // @0xe15df callq _HGRectfMake4f(x, y, r, b)
  const rf = HGRectfMake4f(x, y, r, b);
  // @0xe15e9 jmp _HGRectIntegral
  return HGRectIntegral(rf);
}
