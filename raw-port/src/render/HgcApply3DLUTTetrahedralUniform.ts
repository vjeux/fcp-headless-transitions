// HgcApply3DLUTTetrahedralUniform.ts — Helium
//
// HgcApply3DLUTTetrahedralUniform: the two GetDOD/GetROI virtuals + the two
// destructors of the "apply 3D LUT via tetrahedral interpolation on a
// uniform grid" node. The node has TWO inputs (numbered 0 and 1): input 0
// is the source image and input 1 is a compact 3D-LUT-as-2D-image whose
// rect is derived from the LUT resolution stored on the instance at
// self@+0x1a0 (an int32 "N" — the per-axis LUT edge length, typically 17
// or 33 for FCP's built-in LUTs).
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HgcApply3DLUTTetrahedralUniform.GetDOD.s                          (@0x073f20)
//   raw-port/re/disasm/Helium.HgcApply3DLUTTetrahedralUniform.GetROI.s                          (@0x073f40)
//   raw-port/re/disasm/Helium.HgcApply3DLUTTetrahedralUniform.~HgcApply3DLUTTetrahedralUniform.s (D0 @0x073f00)
//   (D1 @0x073ef0 read directly via `otool -tV`; body inlined in the doc-comment below.)
//
// Helium symbols transcribed:
//   @Helium 0x073ef0  HgcApply3DLUTTetrahedralUniform::~HgcApply3DLUTTetrahedralUniform()  [D1]
//   @Helium 0x073f00  HgcApply3DLUTTetrahedralUniform::~HgcApply3DLUTTetrahedralUniform()  [D0]
//   @Helium 0x073f20  HgcApply3DLUTTetrahedralUniform::GetDOD(HGRenderer*, int, HGRect)
//   @Helium 0x073f40  HgcApply3DLUTTetrahedralUniform::GetROI(HGRenderer*, int, HGRect)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from GetROI's `movl 0x1a0(%rdi), %ecx` @0x073f53)
// -----------------------------------------------------------------------------
//   struct HgcApply3DLUTTetrahedralUniform : HgcApply3DLUTTetrahedralUniform_basekernel {
//     // ... base fields (undecoded; base dtor called from both D1 @0x073ef5
//     //     and D0 @0x073f09 — the base has its own layout).
//     // +0x1a0  int32_t  lutN;       // per-axis LUT resolution (edge length).
//     //                              // For a standard 17^3 LUT: N=17.
//     //                              // For a 33^3 LUT: N=33.
//     //                              // The LUT is stored as a 2D image of
//     //                              // width (N*N+1) x height (N+1) — see
//     //                              // GetROI(1)'s HGRectMake4i(0,0,N*N+1,N+1).
//     //                              // (The +1 padding on each dimension
//     //                              //  gives room for the tetrahedral
//     //                              //  interpolator's "one past the top
//     //                              //  cell" clamp.)
//   };
//
// -----------------------------------------------------------------------------
// External callees cited (all Helium; addresses are __stubs / RIP-relative):
//
//   GetDOD @0x073f20:
//     @0x073f2b  _HGRectNull (Helium data symbol; same 16 zero bytes as the
//                             HGRectNull const in raw-port/src/render/HGRect.ts
//                             @0x3d2284).
//
//   GetROI @0x073f40:
//     @0x073f66  _HGRectMake4i (Helium; ported as HGRectMake4i in HGRect.ts
//                               @0x107710).
//     @0x073f7e  _HGRectNull (same as GetDOD).
//
//   D1 dtor @0x073ef0:
//     @0x073ef5  __ZN42HgcApply3DLUTTetrahedralUniform_basekernelD2Ev
//                 HgcApply3DLUTTetrahedralUniform_basekernel::~HgcApply3DLUTTetrahedralUniform_basekernel()
//                 (undecoded frontier base dtor; tail-jmp).
//
//   D0 dtor @0x073f00:
//     @0x073f09  __ZN42HgcApply3DLUTTetrahedralUniform_basekernelD2Ev  (same base dtor as D1; callq form)
//     @0x073f17  __ZN8HGObjectdlEPv  HGObject::operator delete(void*)  (undecoded frontier)
//
// -----------------------------------------------------------------------------

import {
  HGRect,
  HGRectNull,
  HGRectMake4i,
} from "./HGRect";

// -----------------------------------------------------------------------------
// Frontier types.
// -----------------------------------------------------------------------------

/** HGRenderer* — opaque handle. GetDOD/GetROI ignore it entirely (nothing
 *  reads %rsi after entry in either function). */
export type HGRenderer = { readonly __brand: "HGRenderer" };

/** HgcApply3DLUTTetrahedralUniform instance handle. GetDOD does not read any
 *  field of self; GetROI reads only self@+0x1a0 (int32, the LUT edge
 *  length N — see the STRUCT LAYOUT comment above). We surface it as a
 *  minimal typed shape here (only the one decoded field) rather than an
 *  opaque brand so GetROI's math has a place to bind. */
export interface HgcApply3DLUTTetrahedralUniform {
  /** self@+0x1a0 — int32 LUT edge length. Loaded as `movl 0x1a0(%rdi), %ecx`
   *  at @Helium 0x073f53. */
  readonly lutN_at_0x1a0: number;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform::GetDOD(HGRenderer*, int, HGRect) @Helium 0x073f20
//
//   @0x073f20  movq  %rcx, %rax           ; rax = incoming.lo (default return.lo)
//   @0x073f23  testl %edx, %edx           ; which
//   @0x073f25  je    0x73f3a              ; if (which == 0) skip to return incoming
//   @0x073f27  pushq %rbp ; movq %rsp, %rbp
//   @0x073f2b  leaq  _HGRectNull(%rip), %rcx
//   @0x073f32  movq  (%rcx), %rax         ; rax = HGRectNull.lo
//   @0x073f35  movq  0x8(%rcx), %r8       ; r8  = HGRectNull.hi
//   @0x073f39  popq  %rbp
//   @0x073f3a  movq  %r8, %rdx            ; return.hi = r8
//   @0x073f3d  retq
//
//   In plain English:
//     if (which == 0)  return incoming rect;  // input 0 = source image: DOD == source rect
//     else             return HGRectNull;     // input 1 (the LUT) has no defined DOD here
// -----------------------------------------------------------------------------

/** HgcApply3DLUTTetrahedralUniform::GetDOD(renderer, which, rect) @Helium 0x073f20.
 *  Returns the incoming rect for input 0 (the source image) and HGRectNull
 *  for any other input index. `renderer` and `self` are unused. */
export function HgcApply3DLUTTetrahedralUniform_GetDOD(
  _self: HgcApply3DLUTTetrahedralUniform,
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x073f23 testl %edx, %edx ; @0x073f25 je 0x73f3a
  //   je-if-equal-to-zero fast-path: `which == 0` returns incoming rect
  //   with rax=%rcx=incoming.lo and r8=%r8=incoming.hi (both unchanged from
  //   entry — the epilogue at @0x073f3a `movq %r8, %rdx ; retq` packs them
  //   into the return regs).
  if ((which | 0) === 0) {
    return rect;
  }
  // @0x073f27-@0x073f39: load _HGRectNull into (rax, r8) and fall to return.
  return HGRectNull;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform::GetROI(HGRenderer*, int, HGRect) @Helium 0x073f40
//
//   @0x073f40-@0x073f49  pushq %rbp ; movq %rsp,%rbp ; pushq r15/r14/rbx ; pushq %rax
//                        (16-byte re-align via the pushq %rax that never gets read)
//   @0x073f4a  movq  %r8, %rbx            ; rbx  = incoming.hi   (saved for later)
//   @0x073f4d  movq  %rcx, %r14           ; r14  = incoming.lo   (saved for later)
//   @0x073f50  movl  %edx, %r15d          ; r15d = which         (saved for later)
//   @0x073f53  movl  0x1a0(%rdi), %ecx    ; ecx  = self.lutN     (int32)
//   @0x073f59  movl  %ecx, %edx
//   @0x073f5b  imull %ecx, %edx           ; edx  = N * N        (int32 wrap on overflow)
//   @0x073f5e  incl  %edx                 ; edx  = N*N + 1
//   @0x073f60  incl  %ecx                 ; ecx  = N + 1
//   @0x073f62  xorl  %edi, %edi           ; arg1 = 0
//   @0x073f64  xorl  %esi, %esi           ; arg2 = 0
//   @0x073f66  callq _HGRectMake4i        ; HGRectMake4i(0, 0, N*N+1, N+1)
//                                          ; result in (rax, rdx)
//   @0x073f6b  cmpl  $0x1, %r15d
//   @0x073f6f  je    0x73f8c              ; if (which == 1) return HGRectMake4i result
//   @0x073f71  testl %r15d, %r15d
//   @0x073f74  jne   0x73f7e              ; if (which != 0) -> load HGRectNull
//   @0x073f76  movq  %r14, %rax           ; (which == 0) rax = incoming.lo
//   @0x073f79  movq  %rbx, %rdx           ;              rdx = incoming.hi
//   @0x073f7c  jmp   0x73f8c
//   @0x073f7e  leaq  _HGRectNull(%rip), %rcx
//   @0x073f85  movq  (%rcx), %rax         ; rax = HGRectNull.lo
//   @0x073f88  movq  0x8(%rcx), %rdx      ; rdx = HGRectNull.hi
//   @0x073f8c  addq  $0x8, %rsp ; popq r15/r14/rbx ; popq %rbp ; retq
//
//   In plain English (three-way dispatch on `which`):
//     which == 0  ->  return incoming rect   (source image ROI passes through)
//     which == 1  ->  return HGRectMake4i(0, 0, N*N+1, N+1)  // the LUT image's ROI
//                                                            // (LUT stored as an
//                                                            //  (N*N+1) x (N+1)
//                                                            //  2D image)
//     otherwise   ->  return HGRectNull
// -----------------------------------------------------------------------------

/** HgcApply3DLUTTetrahedralUniform::GetROI(renderer, which, rect) @Helium 0x073f40.
 *
 *  Three-way dispatch on `which`:
 *    - `which == 0` (source image input): returns the incoming rect unchanged.
 *    - `which == 1` (3D LUT image input): returns the fixed-size rect
 *      `HGRectMake4i(0, 0, lutN*lutN + 1, lutN + 1)` — the compact 2D layout
 *      the tetrahedral kernel expects for a uniform 3D LUT of edge N (the
 *      per-axis resolution stored at self@+0x1a0).
 *    - any other index: returns HGRectNull.
 *
 *  `renderer` is unused. `int32` arithmetic on `lutN*lutN+1` uses two's
 *  complement wrap on overflow, mirroring the disassembly's `imull` + `incl`. */
export function HgcApply3DLUTTetrahedralUniform_GetROI(
  self: HgcApply3DLUTTetrahedralUniform,
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x073f53 movl 0x1a0(%rdi), %ecx  ; load lutN as int32.
  const N = (self.lutN_at_0x1a0 | 0);
  // @0x073f5b imull %ecx, %edx ; @0x073f5e incl %edx  ; edx = N*N + 1
  //   `imull` is signed 32-bit multiply; the low 32 bits are kept. We match
  //   that via `Math.imul` (int32 * int32 -> int32, wrap on overflow), then
  //   `| 0` for the `incl` narrow.
  const wPlusOne = (Math.imul(N, N) + 1) | 0;
  // @0x073f60 incl %ecx  ; ecx = N + 1
  const hPlusOne = (N + 1) | 0;

  // @0x073f66 callq _HGRectMake4i(0, 0, N*N+1, N+1)
  //   (Called unconditionally regardless of `which`; the result is only
  //    RETURNED on the which==1 path, but the call itself always happens —
  //    match the disasm faithfully.)
  const lutRect = HGRectMake4i(0, 0, wPlusOne, hPlusOne);

  // @0x073f6b cmpl $0x1, %r15d ; @0x073f6f je 0x73f8c
  if ((which | 0) === 1) {
    return lutRect;
  }
  // @0x073f71 testl %r15d, %r15d ; @0x073f74 jne 0x73f7e
  if ((which | 0) !== 0) {
    // @0x073f7e-@0x073f88: load HGRectNull.
    return HGRectNull;
  }
  // @0x073f76-@0x073f7c: rax=incoming.lo, rdx=incoming.hi (return incoming rect).
  return rect;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform::~HgcApply3DLUTTetrahedralUniform() (D1) @Helium 0x073ef0
//   @0x073ef0  pushq %rbp ; movq %rsp,%rbp ; popq %rbp
//   @0x073ef5  jmp   __ZN42HgcApply3DLUTTetrahedralUniform_basekernelD2Ev
//
// In plain English: pass `self` to the base kernel's D2 destructor by
// tail-jmp — the derived class owns nothing beyond what the base owns.
// -----------------------------------------------------------------------------

/** HgcApply3DLUTTetrahedralUniform::~HgcApply3DLUTTetrahedralUniform() (D1) @Helium 0x073ef0.
 *  Trivial forwarding dtor — tail-jmps into the base kernel's D2 dtor. Kept
 *  as a throwing stub because the base
 *  `HgcApply3DLUTTetrahedralUniform_basekernel::~HgcApply3DLUTTetrahedralUniform_basekernel()`
 *  @0x073ef5 is an undecoded frontier symbol. */
export function HgcApply3DLUTTetrahedralUniform_dtor_D1(
  _self: HgcApply3DLUTTetrahedralUniform,
): void {
  throw new Error(
    "HgcApply3DLUTTetrahedralUniform::~HgcApply3DLUTTetrahedralUniform (D1) @Helium 0x073ef0 not yet transcribed: tail-jmps to HgcApply3DLUTTetrahedralUniform_basekernel::~HgcApply3DLUTTetrahedralUniform_basekernel @0x073ef5 which is an undecoded frontier symbol.",
  );
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform::~HgcApply3DLUTTetrahedralUniform() (D0) @Helium 0x073f00
//   @0x073f00  pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
//   @0x073f06  movq  %rdi, %rbx
//   @0x073f09  callq __ZN42HgcApply3DLUTTetrahedralUniform_basekernelD2Ev  ; base dtor
//   @0x073f0e  movq  %rbx, %rdi
//   @0x073f11  addq  $0x8, %rsp ; popq %rbx ; popq %rbp
//   @0x073f17  jmp   __ZN8HGObjectdlEPv          ; HGObject::operator delete(void*)
//
// In plain English: call the base kernel's D2 destructor on `self`, then
// tail-jmp to HGObject::operator delete.
// -----------------------------------------------------------------------------

/** HgcApply3DLUTTetrahedralUniform::~HgcApply3DLUTTetrahedralUniform() (D0) @Helium 0x073f00.
 *  Deleting-destructor wrapper: base dtor + operator delete. Kept as a
 *  throwing stub because both callees
 *  (`HgcApply3DLUTTetrahedralUniform_basekernel::~HgcApply3DLUTTetrahedralUniform_basekernel`
 *  @0x073f09 and `HGObject::operator delete(void*)` @0x073f17) are undecoded
 *  frontier symbols. */
export function HgcApply3DLUTTetrahedralUniform_dtor_D0(
  _self: HgcApply3DLUTTetrahedralUniform,
): void {
  throw new Error(
    "HgcApply3DLUTTetrahedralUniform::~HgcApply3DLUTTetrahedralUniform (D0) @Helium 0x073f00 not yet transcribed: base dtor HgcApply3DLUTTetrahedralUniform_basekernel::~HgcApply3DLUTTetrahedralUniform_basekernel @0x073f09 and HGObject::operator delete(void*) @0x073f17 are undecoded frontier symbols.",
  );
}
