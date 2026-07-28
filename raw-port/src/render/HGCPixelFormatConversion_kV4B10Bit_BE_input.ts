// HGCPixelFormatConversion_kV4B10Bit_BE_input.ts — Helium
// HGCPixelFormatConversion_kV4B10Bit_BE_input: a pixel-format-conversion
// render node for the "V4B 10-bit BE input" format variant. This class
// forwards its DOD to the renderer's input-0 DOD and treats index != 0 as
// "no such input" -> HGRectNull. Faithful transcription of the x86_64
// disassembly of /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_input.GetDOD.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_input.GetROI.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_input.~HGCPixelFormatConversion_kV4B10Bit_BE_input.s
//
// Helium symbols transcribed:
//   @0x000f4f40  HGCPixelFormatConversion_kV4B10Bit_BE_input::~HGCPixelFormatConversion_kV4B10Bit_BE_input()  (D1)
//                (not directly disassembled by disasm.sh — see D0 for the
//                 base-dtor call it also tail-jumps to)
//   @0x000f4f50  HGCPixelFormatConversion_kV4B10Bit_BE_input::~HGCPixelFormatConversion_kV4B10Bit_BE_input()  (D0)
//   @0x000f4f70  HGCPixelFormatConversion_kV4B10Bit_BE_input::GetDOD(HGRenderer*, int, HGRect)
//   @0x000f4fb0  HGCPixelFormatConversion_kV4B10Bit_BE_input::GetROI(HGRenderer*, int, HGRect)
//
// ABI mapping for the two rect virtuals (System V x86_64, HGRect returned as
// two qwords {rax, rdx}; the trailing 16-byte HGRect arg is passed in
// {rcx, r8}, sibling of HMaskCompFirstPass at Flexo 0x602010):
//   %rdi = self (HGCPixelFormatConversion_kV4B10Bit_BE_input*)
//   %rsi = HGRenderer*
//   %edx = index ("which" input slot)
//   %rcx = incoming HGRect.lo   (x  | y<<32)
//   %r8  = incoming HGRect.hi   (right | bottom<<32)
//
// HGRect layout: 16 bytes packed as two int64 qwords; lo = x|y<<32,
// hi = right|bottom<<32 (Helium canonical form; see HGRect.ts).
//
// Called stubs / data (resolved via otool -tV comments in the disasm):
//   __ZN10HGRenderer8GetInputEP6HGNodei  HGRenderer::GetInput(HGNode*, int)
//                                        callq @0x000f4f97
//   __ZN10HGRenderer6GetDODEP6HGNode     HGRenderer::GetDOD(HGNode*)
//                                        tail-jmp @0x000f4fa8
//   __ZN43HgcPixelFormatConversion_kV4B10Bit_BE_inputD2Ev
//     HgcPixelFormatConversion_kV4B10Bit_BE_input::~HgcPixelFormatConversion_kV4B10Bit_BE_input()
//                                        callq @0x000f4f59 (from D0)
//   __ZN8HGObjectdlEPv                   HGObject::operator delete(void*)
//                                        tail-jmp @0x000f4f67 (from D0)
//   _HGRectNull                          Helium data symbol; RIP-loaded at
//                                        @0x000f4f74 (GetDOD) and
//                                        @0x000f4fbb (GetROI).
//
// Frontier callees (not-yet-transcribed):
//   HGRenderer::GetInput(HGNode*, int)                — throw-stub
//   HGRenderer::GetDOD(HGNode*)                       — throw-stub
//   HgcPixelFormatConversion_kV4B10Bit_BE_input::~HgcPixelFormatConversion_kV4B10Bit_BE_input()  — base dtor, throw-stub
//   HGObject::operator delete(void*)                  — JS GC; documented only

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect.js";
export { HGRect };

// ---------------------------------------------------------------------------
// Frontier types
// ---------------------------------------------------------------------------

/** HGNode — opaque render-graph node handle. `self` is an HGNode subclass
 *  pointer at the HGRenderer::GetInput ABI boundary. */
export interface HGNode {}

/** HGRenderer — the render context passed to every node vfn. Layout
 *  undecoded here. `HGRenderer::GetInput` and `HGRenderer::GetDOD` are the
 *  only two members reached from this class. */
export interface HGRenderer {}

/** HgcPixelFormatConversion_kV4B10Bit_BE_input — the Helium base class of
 *  HGCPixelFormatConversion_kV4B10Bit_BE_input (note capitalization: Hgc*
 *  vs HGC*). Only its destructor is referenced from this file
 *  (@0x000f4f59 callq from D0). */
export interface HgcPixelFormatConversion_kV4B10Bit_BE_input {
  /** HgcPixelFormatConversion_kV4B10Bit_BE_input::~HgcPixelFormatConversion_kV4B10Bit_BE_input()
   *  @Helium — base destructor. Not yet transcribed. */
  __dtor_base(): void;
}

/** HGCPixelFormatConversion_kV4B10Bit_BE_input — the class this file
 *  transcribes. Inherits from HgcPixelFormatConversion_kV4B10Bit_BE_input;
 *  no instance state is read by either GetDOD or GetROI. */
export interface HGCPixelFormatConversion_kV4B10Bit_BE_input extends HgcPixelFormatConversion_kV4B10Bit_BE_input {}

// ---------------------------------------------------------------------------
// Undecoded external helpers — throwing stubs cite their @0xADDR call sites.
// ---------------------------------------------------------------------------

/** HGRenderer::GetInput(HGNode*, int) @Helium — call site
 *  @0x000f4f97 in HGCPixelFormatConversion_kV4B10Bit_BE_input::GetDOD.
 *  Returns the input HGNode at slot `slot`, or nullptr if none. */
export function HGRenderer_GetInput(_r: HGRenderer, _self: HGNode, _slot: number): HGNode | null {
  throw new Error("HGRenderer::GetInput @Helium (callq @0x000f4f97) not yet transcribed");
}

/** HGRenderer::GetDOD(HGNode*) @Helium — tail-jmp site @0x000f4fa8 in
 *  HGCPixelFormatConversion_kV4B10Bit_BE_input::GetDOD. Returns the child
 *  node's domain-of-definition rectangle. */
export function HGRenderer_GetDOD(_r: HGRenderer, _node: HGNode | null): HGRect {
  throw new Error("HGRenderer::GetDOD @Helium (jmp @0x000f4fa8) not yet transcribed");
}

// ---------------------------------------------------------------------------
// HGCPixelFormatConversion_kV4B10Bit_BE_input::~ ...  D0 @Helium 0x000f4f50
//   Faithful to raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_input.~HGCPixelFormatConversion_kV4B10Bit_BE_input.s:
//     @0x000f4f50  pushq %rbp ; movq %rsp, %rbp
//     @0x000f4f54  pushq %rbx ; pushq %rax
//     @0x000f4f56  movq  %rdi, %rbx
//     @0x000f4f59  callq __ZN43HgcPixelFormatConversion_kV4B10Bit_BE_inputD2Ev   (base dtor)
//     @0x000f4f5e  movq  %rbx, %rdi
//     @0x000f4f61  addq $0x8, %rsp ; popq %rbx ; popq %rbp
//     @0x000f4f67  jmp   __ZN8HGObjectdlEPv                    (HGObject::operator delete(void*))
// ---------------------------------------------------------------------------

/** HGCPixelFormatConversion_kV4B10Bit_BE_input::~HGCPixelFormatConversion_kV4B10Bit_BE_input()
 *  (D0) @Helium 0x000f4f50. Calls the base HgcPixelFormatConversion_kV4B10Bit_BE_input
 *  destructor, then tail-calls HGObject::operator delete(void*). In TS
 *  we don't manage raw memory (JS GC), so only the base-dtor call is
 *  surfaced for parity with the disassembly. */
export function HGCPixelFormatConversion_kV4B10Bit_BE_input_dtor_D0(
  self: HGCPixelFormatConversion_kV4B10Bit_BE_input,
): void {
  // @0x000f4f59 callq __ZN43HgcPixelFormatConversion_kV4B10Bit_BE_inputD2Ev
  self.__dtor_base();
  // @0x000f4f67 jmp __ZN8HGObjectdlEPv (HGObject::operator delete(void*)).
  // No-op in TypeScript; JS GC reclaims the object.
}

// ---------------------------------------------------------------------------
// HGCPixelFormatConversion_kV4B10Bit_BE_input::GetDOD(HGRenderer*, int, HGRect) @Helium 0x000f4f70
//   Faithful to raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_input.GetDOD.s:
//
//   @0x000f4f70  testl %edx, %edx
//   @0x000f4f72  je    0x000f4f83          ; if (which == 0) go to input-forward path
//   @0x000f4f74  leaq  _HGRectNull(%rip), %rcx
//   @0x000f4f7b  movq  (%rcx), %rax        ; rax = HGRectNull.lo
//   @0x000f4f7e  movq  0x8(%rcx), %rdx     ; rdx = HGRectNull.hi
//   @0x000f4f82  retq                       ; return HGRectNull
//   ---
//   @0x000f4f83  pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; pushq %rax
//   @0x000f4f89  movq  %rdi, %rax           ; rax = self
//   @0x000f4f8c  movq  %rsi, %rdi           ; rdi = renderer   (arg1 of GetInput)
//   @0x000f4f8f  movq  %rsi, %rbx           ; rbx = renderer   (save for GetDOD arg1)
//   @0x000f4f92  movq  %rax, %rsi           ; rsi = self       (arg2 of GetInput = HGNode*)
//   @0x000f4f95  xorl  %edx, %edx           ; edx = 0          (arg3 slot)
//   @0x000f4f97  callq __ZN10HGRenderer8GetInputEP6HGNodei      ; rax = renderer.GetInput(self, 0)
//   @0x000f4f9c  movq  %rbx, %rdi           ; rdi = renderer   (arg1 of GetDOD)
//   @0x000f4f9f  movq  %rax, %rsi           ; rsi = HGNode*    (arg2 of GetDOD = child input)
//   @0x000f4fa2  addq  $0x8, %rsp ; popq %rbx ; popq %rbp
//   @0x000f4fa8  jmp   __ZN10HGRenderer6GetDODEP6HGNode         ; tail-return renderer.GetDOD(input0)
//
//   Plain English:
//     if (which != 0) return HGRectNull;
//     input0 = renderer.GetInput(self, 0);
//     return renderer.GetDOD(input0);
//
//   The incoming HGRect (rcx, r8) is IGNORED — this node does not clip its
//   DOD to the caller's rect; it just forwards input-0's DOD wholesale.
// ---------------------------------------------------------------------------

/** HGCPixelFormatConversion_kV4B10Bit_BE_input::GetDOD(renderer, which, rect)
 *  @Helium 0x000f4f70. Forwards input-0's DOD when `which == 0`; returns
 *  HGRectNull for any other input index. */
export function HGCPixelFormatConversion_kV4B10Bit_BE_input_GetDOD(
  self: HGCPixelFormatConversion_kV4B10Bit_BE_input,
  renderer: HGRenderer,
  which: number,
  _rect: HGRect,
): HGRect {
  // @0x000f4f70 testl %edx, %edx ; @0x000f4f72 je 0x000f4f83
  // "je" is jump-if-EQUAL(zero): the (which == 0) branch forwards input 0;
  // the fall-through (which != 0) returns HGRectNull.
  if (which !== 0) {
    // @0x000f4f74-@0x000f4f82: load _HGRectNull, return it.
    return HGRectNullConst;
  }
  // @0x000f4f97 callq HGRenderer::GetInput(self, 0)
  const input0 = HGRenderer_GetInput(renderer, self as unknown as HGNode, 0);
  // @0x000f4fa8 jmp HGRenderer::GetDOD(input0)  (tail-call)
  return HGRenderer_GetDOD(renderer, input0);
}

// ---------------------------------------------------------------------------
// HGCPixelFormatConversion_kV4B10Bit_BE_input::GetROI(HGRenderer*, int, HGRect) @Helium 0x000f4fb0
//   Faithful to raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_input.GetROI.s:
//
//   @0x000f4fb0  movq  %rcx, %rax           ; rax = inRect.lo (default return.lo)
//   @0x000f4fb3  testl %edx, %edx
//   @0x000f4fb5  je    0x000f4fca           ; if (which == 0) skip to return inRect
//   @0x000f4fb7  pushq %rbp ; movq %rsp, %rbp
//   @0x000f4fbb  leaq  _HGRectNull(%rip), %rcx
//   @0x000f4fc2  movq  (%rcx), %rax         ; rax = HGRectNull.lo
//   @0x000f4fc5  movq  0x8(%rcx), %r8       ; r8  = HGRectNull.hi
//   @0x000f4fc9  popq  %rbp
//   @0x000f4fca  movq  %r8, %rdx            ; return.hi = r8
//   @0x000f4fcd  retq
//
//   Plain English:
//     if (which == 0) return incoming rect;
//     else            return HGRectNull;
//
//   Note the register discipline: on the (which == 0) fall-through, rax was
//   already set to rcx (=inRect.lo) at 0x000f4fb0 and r8 already holds
//   inRect.hi from the caller — the shared "movq %r8, %rdx" at 0x000f4fca
//   builds the {rax=lo, rdx=hi} return without a branch.
// ---------------------------------------------------------------------------

/** HGCPixelFormatConversion_kV4B10Bit_BE_input::GetROI(renderer, which, rect)
 *  @Helium 0x000f4fb0. ROI for input 0 is the caller's requested rect;
 *  every other input index -> HGRectNull. `renderer` and `self` are unused
 *  (no reads of %rdi/%rsi anywhere in the disasm). */
export function HGCPixelFormatConversion_kV4B10Bit_BE_input_GetROI(
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x000f4fb3 testl %edx, %edx ; @0x000f4fb5 je 0x000f4fca
  if (which !== 0) {
    // @0x000f4fbb-@0x000f4fc5: load _HGRectNull as return value.
    return HGRectNullConst;
  }
  // @0x000f4fb0 movq %rcx, %rax ; @0x000f4fca movq %r8, %rdx ; @0x000f4fcd retq
  //   -> return the incoming rect argument unchanged.
  return rect;
}
