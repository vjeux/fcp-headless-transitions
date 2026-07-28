// HGCSimpleSpatialDenoise.ts — Helium HGCSimpleSpatialDenoise: a spatial
// denoise render node. The two rectangle virtuals decoded here are pure
// bookkeeping: GetDOD passes the caller's rect through for input 0 (else
// HGRectNull), and GetROI grows the caller's rect by 1 pixel on each side
// (a 3x3 spatial-filter kernel footprint) for input 0. Faithful
// transcription of the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HGCSimpleSpatialDenoise.GetDOD.s
//   raw-port/re/disasm/Helium.HGCSimpleSpatialDenoise.GetROI.s
//   raw-port/re/disasm/Helium.HGCSimpleSpatialDenoise.~HGCSimpleSpatialDenoise.s
//
// Helium symbols transcribed:
//   @0x001c86e0  HGCSimpleSpatialDenoise::~HGCSimpleSpatialDenoise()  (D1)
//                (not directly disassembled; see D0 for the base-dtor call)
//   @0x001c86f0  HGCSimpleSpatialDenoise::~HGCSimpleSpatialDenoise()  (D0)
//   @0x001c8710  HGCSimpleSpatialDenoise::GetDOD(HGRenderer*, int, HGRect)
//   @0x001c8730  HGCSimpleSpatialDenoise::GetROI(HGRenderer*, int, HGRect)
//
// ABI mapping (SysV x86_64, HGRect is 16 bytes returned in {rax, rdx}; the
// trailing HGRect arg is passed in {rcx, r8}):
//   %rdi = self (HGCSimpleSpatialDenoise*)
//   %rsi = HGRenderer*  (unread by GetDOD/GetROI here)
//   %edx = index ("which" input slot)
//   %rcx = incoming HGRect.lo  (x | y<<32)
//   %r8  = incoming HGRect.hi  (right | bottom<<32)
//
// HGRect layout: 16 bytes packed as two int64 qwords; lo = x|y<<32,
// hi = right|bottom<<32 (Helium canonical form; see HGRect.ts).
//
// Called stubs / data (from otool -tV comments in the disasm):
//   _HGRectMake4i               HGRectMake4i(int,int,int,int)
//                               callq @0x001c8764  (used to build the growth
//                               vector {-1,-1,+1,+1})
//   _HGRectGrow                 HGRectGrow(HGRect, HGRect)
//                               tail-jmp @0x001c8779
//   __ZN23HgcSimpleSpatialDenoiseD2Ev
//     HgcSimpleSpatialDenoise::~HgcSimpleSpatialDenoise()
//                               callq @0x001c86f9  (from D0)
//   __ZN8HGObjectdlEPv          HGObject::operator delete(void*)
//                               tail-jmp @0x001c8707  (from D0)
//   _HGRectNull                 Helium data symbol; RIP-loaded at
//                               @0x001c871b (GetDOD) and @0x001c8734 (GetROI).
//
// Frontier callees (not-yet-transcribed):
//   HgcSimpleSpatialDenoise::~HgcSimpleSpatialDenoise()  — base dtor, throw-stub
//   HGObject::operator delete(void*)                     — JS GC; documented only

import {
  HGRect,
  HGRectNull as HGRectNullConst,
  HGRectMake4i,
  HGRectGrow,
} from "./HGRect.js";
export { HGRect };

// ---------------------------------------------------------------------------
// Frontier types
// ---------------------------------------------------------------------------

/** HGRenderer — opaque render context; not read by either virtual here. */
export interface HGRenderer {}

/** HgcSimpleSpatialDenoise — the Helium base class of HGCSimpleSpatialDenoise
 *  (note capitalization: Hgc* vs HGC*). Only its destructor is referenced
 *  from this file (@0x001c86f9 callq from D0). */
export interface HgcSimpleSpatialDenoise {
  /** HgcSimpleSpatialDenoise::~HgcSimpleSpatialDenoise() @Helium — base
   *  destructor. Not yet transcribed. */
  __dtor_base(): void;
}

/** HGCSimpleSpatialDenoise — the class this file transcribes. Inherits from
 *  HgcSimpleSpatialDenoise; no instance state is read by either GetDOD or
 *  GetROI (both fully ignore %rdi/self). */
export interface HGCSimpleSpatialDenoise extends HgcSimpleSpatialDenoise {}

// ---------------------------------------------------------------------------
// HGCSimpleSpatialDenoise::~HGCSimpleSpatialDenoise() (D0) @Helium 0x001c86f0
//   Faithful to raw-port/re/disasm/Helium.HGCSimpleSpatialDenoise.~HGCSimpleSpatialDenoise.s:
//     @0x001c86f0  pushq %rbp ; movq %rsp, %rbp
//     @0x001c86f4  pushq %rbx ; pushq %rax
//     @0x001c86f6  movq  %rdi, %rbx
//     @0x001c86f9  callq __ZN23HgcSimpleSpatialDenoiseD2Ev   (base dtor)
//     @0x001c86fe  movq  %rbx, %rdi
//     @0x001c8701  addq $0x8, %rsp ; popq %rbx ; popq %rbp
//     @0x001c8707  jmp   __ZN8HGObjectdlEPv                  (operator delete)
// ---------------------------------------------------------------------------

/** HGCSimpleSpatialDenoise::~HGCSimpleSpatialDenoise() (D0) @Helium 0x001c86f0.
 *  Calls the base destructor, then tail-calls HGObject::operator delete. In
 *  TS, only the base-dtor call is surfaced (JS GC replaces `operator delete`). */
export function HGCSimpleSpatialDenoise_dtor_D0(self: HGCSimpleSpatialDenoise): void {
  // @0x001c86f9 callq __ZN23HgcSimpleSpatialDenoiseD2Ev
  self.__dtor_base();
  // @0x001c8707 jmp __ZN8HGObjectdlEPv (HGObject::operator delete(void*)).
  // No-op in TypeScript; JS GC reclaims the object.
}

// ---------------------------------------------------------------------------
// HGCSimpleSpatialDenoise::GetDOD(HGRenderer*, int, HGRect) @Helium 0x001c8710
//   Faithful to raw-port/re/disasm/Helium.HGCSimpleSpatialDenoise.GetDOD.s:
//
//   @0x001c8710  movq  %rcx, %rax           ; rax = inRect.lo (default return.lo)
//   @0x001c8713  testl %edx, %edx
//   @0x001c8715  je    0x001c872a           ; if (which == 0) skip to return inRect
//   @0x001c8717  pushq %rbp ; movq %rsp, %rbp
//   @0x001c871b  leaq  _HGRectNull(%rip), %rcx
//   @0x001c8722  movq  (%rcx), %rax         ; rax = HGRectNull.lo
//   @0x001c8725  movq  0x8(%rcx), %r8       ; r8  = HGRectNull.hi
//   @0x001c8729  popq  %rbp
//   @0x001c872a  movq  %r8, %rdx            ; return.hi = r8
//   @0x001c872d  retq
//
//   Plain English:
//     if (which == 0) return incoming rect;
//     else            return HGRectNull;
//
//   Note: this is the SAME instruction-for-instruction shape as
//   HGCPixelFormatConversion_kV4B10Bit_BE_input::GetROI @0x000f4fb0. The
//   register discipline (rax preset to inRect.lo before the branch; shared
//   "movq %r8, %rdx" epilogue) means the (which == 0) fall-through returns
//   the caller's rect verbatim.
// ---------------------------------------------------------------------------

/** HGCSimpleSpatialDenoise::GetDOD(renderer, which, rect) @Helium 0x001c8710.
 *  DOD for input 0 is the caller's requested rect (this node is size-
 *  preserving); every other input index -> HGRectNull. */
export function HGCSimpleSpatialDenoise_GetDOD(
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x001c8713 testl %edx, %edx ; @0x001c8715 je 0x001c872a
  if (which !== 0) {
    // @0x001c871b-@0x001c8725: load _HGRectNull as return value.
    return HGRectNullConst;
  }
  // @0x001c8710 movq %rcx, %rax ; @0x001c872a movq %r8, %rdx ; @0x001c872d retq
  return rect;
}

// ---------------------------------------------------------------------------
// HGCSimpleSpatialDenoise::GetROI(HGRenderer*, int, HGRect) @Helium 0x001c8730
//   Faithful to raw-port/re/disasm/Helium.HGCSimpleSpatialDenoise.GetROI.s:
//
//   @0x001c8730  testl %edx, %edx
//   @0x001c8732  je    0x001c8743           ; if (which == 0) go to grow path
//   @0x001c8734  leaq  _HGRectNull(%rip), %rcx
//   @0x001c873b  movq  (%rcx), %rax         ; rax = HGRectNull.lo
//   @0x001c873e  movq  0x8(%rcx), %rdx      ; rdx = HGRectNull.hi
//   @0x001c8742  retq                       ; return HGRectNull
//   ---
//   @0x001c8743  pushq %rbp ; movq %rsp, %rbp ; pushq %r14 ; pushq %rbx
//   @0x001c874a  movq  %r8, %rbx            ; rbx = incoming rect.hi (save)
//   @0x001c874d  movq  %rcx, %r14           ; r14 = incoming rect.lo (save)
//   @0x001c8750  movl  $0xffffffff, %edi    ; arg1 (int32) = -1     ; growVec.x
//   @0x001c8755  movl  $0xffffffff, %esi    ; arg2 (int32) = -1     ; growVec.y
//   @0x001c875a  movl  $0x1, %edx           ; arg3 (int32) = +1     ; growVec.right
//   @0x001c875f  movl  $0x1, %ecx           ; arg4 (int32) = +1     ; growVec.bottom
//   @0x001c8764  callq _HGRectMake4i        ; rax = growVec.lo, rdx = growVec.hi
//   @0x001c8769  movq  %rdx, %rcx           ; rcx = growVec.hi   (arg4 of HGRectGrow)
//   @0x001c876c  movq  %r14, %rdi           ; rdi = rect.lo      (arg1 of HGRectGrow)
//   @0x001c876f  movq  %rbx, %rsi           ; rsi = rect.hi      (arg2 of HGRectGrow)
//   @0x001c8772  movq  %rax, %rdx           ; rdx = growVec.lo   (arg3 of HGRectGrow)
//   @0x001c8775  popq  %rbx ; popq %r14 ; popq %rbp
//   @0x001c8779  jmp   _HGRectGrow          ; tail-return HGRectGrow(rect, growVec)
//
//   Plain English:
//     if (which != 0) return HGRectNull;
//     growVec = HGRectMake4i(-1, -1, +1, +1);   // {x:-1, y:-1, right:+1, bottom:+1}
//     return HGRectGrow(incomingRect, growVec); // widen by 1 pixel on each side
//
//   The (-1, -1, +1, +1) growth vector corresponds to a 3x3 spatial-filter
//   kernel footprint: to produce output at pixel (x, y) the denoise reads
//   pixels (x-1..x+1, y-1..y+1), so the required input region is the caller's
//   requested output region expanded by 1 pixel on each side.
//
//   Per HGRect.ts @0x107710 HGRectMake4i normalises (swaps corners if
//   x0>x1/y0>y1); with (-1,-1,+1,+1) no swap happens, so growVec is exactly
//   {x:-1, y:-1, right:+1, bottom:+1}. Per HGRectGrow @Helium 0x107960 the
//   growth is componentwise-saturating int32 add, matching this file's
//   satAddI32 semantics.
// ---------------------------------------------------------------------------

/** HGCSimpleSpatialDenoise::GetROI(renderer, which, rect) @Helium 0x001c8730.
 *  ROI for input 0 is the caller's requested rect expanded by 1 pixel on
 *  each side (a 3x3 spatial-filter kernel footprint). Every other input
 *  index -> HGRectNull. `renderer` and `self` are unused. */
export function HGCSimpleSpatialDenoise_GetROI(
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x001c8730 testl %edx, %edx ; @0x001c8732 je 0x001c8743
  if (which !== 0) {
    // @0x001c8734-@0x001c873e: load _HGRectNull, return it.
    return HGRectNullConst;
  }
  // @0x001c8750-@0x001c8764: growVec = HGRectMake4i(-1, -1, +1, +1)
  const growVec = HGRectMake4i(-1, -1, 1, 1);
  // @0x001c8779 jmp _HGRectGrow(rect, growVec)  (tail-call)
  return HGRectGrow(rect, growVec);
}
