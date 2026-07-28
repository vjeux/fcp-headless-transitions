// HGCPixelFormatConversion_kV4B10Bit_BE_output.ts — Helium
// HGCPixelFormatConversion_kV4B10Bit_BE_output: the "output" side of the
// V4B 10-bit big-endian pixel-format-conversion render-node pair. Its
// GetOutput() returns `this` (identity — the node IS its own output),
// GetDOD() forwards input-0's DOD through the renderer when the requested
// slot is 0 and returns HGRectNull otherwise, and GetROI() reflects the
// caller's requested rect for slot 0 and returns HGRectNull for anything
// else. Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_output.GetOutput.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_output.GetDOD.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_output.GetROI.s
//   plus the D1/D0 destructor pair read directly from /tmp/Helium_tV.txt
//   (lines 270904..270921 — otool -tV output; disasm.sh could not find the
//   symbol under a "D1"/"D0" method name because they are C++ ABI dtors).
//
// Helium symbols transcribed:
//   @0x000fd440  HGCPixelFormatConversion_kV4B10Bit_BE_output::~HGCPixelFormatConversion_kV4B10Bit_BE_output()  (D1)
//   @0x000fd450  HGCPixelFormatConversion_kV4B10Bit_BE_output::~HGCPixelFormatConversion_kV4B10Bit_BE_output()  (D0)
//   @0x000fd470  HGCPixelFormatConversion_kV4B10Bit_BE_output::GetOutput(HGRenderer*)
//   @0x000fd480  HGCPixelFormatConversion_kV4B10Bit_BE_output::GetDOD(HGRenderer*, int, HGRect)
//   @0x000fd4c0  HGCPixelFormatConversion_kV4B10Bit_BE_output::GetROI(HGRenderer*, int, HGRect)
//
// ABI mapping for the two rect virtuals (System V x86_64, HGRect returned as
// two qwords {rax, rdx}; the trailing 16-byte HGRect arg is passed in
// {rcx, r8}):
//   %rdi = self (HGCPixelFormatConversion_kV4B10Bit_BE_output*)
//   %rsi = HGRenderer*
//   %edx = index ("which" input slot)
//   %rcx = incoming HGRect.lo   (x  | y<<32)
//   %r8  = incoming HGRect.hi   (right | bottom<<32)
//
// HGRect layout: 16 bytes packed as two int64 qwords; lo = x|y<<32,
// hi = right|bottom<<32 (Helium canonical form; see HGRect.ts).
//
// Called stubs / data (resolved via otool -tV comments in the disasm):
//   __ZN10HGRenderer8GetInputEP6HGNodei   HGRenderer::GetInput(HGNode*, int)
//                                         callq @0x000fd4a7
//   __ZN10HGRenderer6GetDODEP6HGNode      HGRenderer::GetDOD(HGNode*)
//                                         tail-jmp @0x000fd4b8
//   __ZN44HgcPixelFormatConversion_kV4B10Bit_BE_outputD2Ev
//     HgcPixelFormatConversion_kV4B10Bit_BE_output::~HgcPixelFormatConversion_kV4B10Bit_BE_output()
//                                         tail-jmp @0x000fd445 (from D1)
//                                         callq    @0x000fd459 (from D0)
//   __ZN8HGObjectdlEPv                    HGObject::operator delete(void*)
//                                         tail-jmp @0x000fd467 (from D0)
//   _HGRectNull                           Helium data symbol; RIP-loaded at
//                                         @0x000fd484 (GetDOD) and
//                                         @0x000fd4cb (GetROI).
//
// Frontier callees (not-yet-transcribed):
//   HGRenderer::GetInput(HGNode*, int)                                   — throw-stub
//   HGRenderer::GetDOD(HGNode*)                                          — throw-stub
//   HgcPixelFormatConversion_kV4B10Bit_BE_output::~HgcPixelFormatConversion_kV4B10Bit_BE_output()  — base dtor, throw-stub
//   HGObject::operator delete(void*)                                     — JS GC; documented only

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

/** HgcPixelFormatConversion_kV4B10Bit_BE_output — the Helium base class of
 *  HGCPixelFormatConversion_kV4B10Bit_BE_output (note capitalization: Hgc*
 *  vs HGC*). Only its destructor is referenced from this file
 *  (@0x000fd445 tail-jmp from D1, @0x000fd459 callq from D0). */
export interface HgcPixelFormatConversion_kV4B10Bit_BE_output {
  /** HgcPixelFormatConversion_kV4B10Bit_BE_output::~HgcPixelFormatConversion_kV4B10Bit_BE_output()
   *  @Helium — base destructor. Not yet transcribed. */
  __dtor_base(): void;
}

/** HGCPixelFormatConversion_kV4B10Bit_BE_output — the class this file
 *  transcribes. Inherits from HgcPixelFormatConversion_kV4B10Bit_BE_output;
 *  no instance state is read by any of the four methods below. */
export interface HGCPixelFormatConversion_kV4B10Bit_BE_output extends HgcPixelFormatConversion_kV4B10Bit_BE_output {}

// ---------------------------------------------------------------------------
// Undecoded external helpers — throwing stubs cite their @0xADDR call sites.
// ---------------------------------------------------------------------------

/** HGRenderer::GetInput(HGNode*, int) @Helium — call site
 *  @0x000fd4a7 in HGCPixelFormatConversion_kV4B10Bit_BE_output::GetDOD.
 *  Returns the input HGNode at slot `slot`, or nullptr if none. */
export function HGRenderer_GetInput(_r: HGRenderer, _self: HGNode, _slot: number): HGNode | null {
  throw new Error("HGRenderer::GetInput @Helium (callq @0x000fd4a7) not yet transcribed");
}

/** HGRenderer::GetDOD(HGNode*) @Helium — tail-jmp site @0x000fd4b8 in
 *  HGCPixelFormatConversion_kV4B10Bit_BE_output::GetDOD. Returns the child
 *  node's domain-of-definition rectangle. */
export function HGRenderer_GetDOD(_r: HGRenderer, _node: HGNode | null): HGRect {
  throw new Error("HGRenderer::GetDOD @Helium (jmp @0x000fd4b8) not yet transcribed");
}

// ---------------------------------------------------------------------------
// HGCPixelFormatConversion_kV4B10Bit_BE_output::~ ...  D1 @Helium 0x000fd440
//   Faithful to otool -tV output (Helium_tV.txt lines 270904..270908):
//     @0x000fd440  pushq %rbp ; movq %rsp, %rbp
//     @0x000fd444  popq  %rbp
//     @0x000fd445  jmp   __ZN44HgcPixelFormatConversion_kV4B10Bit_BE_outputD2Ev
//                       (base-class destructor, tail-call)
//
//   The D1 (complete-object destructor) is a thin trampoline: it enters,
//   restores the frame pointer, and tail-calls the base D2. In TS we do
//   not manage raw memory (JS GC), so we only surface the base-dtor call.
// ---------------------------------------------------------------------------

/** HGCPixelFormatConversion_kV4B10Bit_BE_output::~HGCPixelFormatConversion_kV4B10Bit_BE_output()
 *  (D1) @Helium 0x000fd440. Tail-calls the base
 *  HgcPixelFormatConversion_kV4B10Bit_BE_output destructor. */
export function HGCPixelFormatConversion_kV4B10Bit_BE_output_dtor_D1(
  self: HGCPixelFormatConversion_kV4B10Bit_BE_output,
): void {
  // @0x000fd445 jmp __ZN44HgcPixelFormatConversion_kV4B10Bit_BE_outputD2Ev
  self.__dtor_base();
}

// ---------------------------------------------------------------------------
// HGCPixelFormatConversion_kV4B10Bit_BE_output::~ ...  D0 @Helium 0x000fd450
//   Faithful to otool -tV output (Helium_tV.txt lines 270910..270919):
//     @0x000fd450  pushq %rbp ; movq %rsp, %rbp
//     @0x000fd454  pushq %rbx ; pushq %rax
//     @0x000fd456  movq  %rdi, %rbx              ; rbx = self (survives call)
//     @0x000fd459  callq __ZN44HgcPixelFormatConversion_kV4B10Bit_BE_outputD2Ev
//     @0x000fd45e  movq  %rbx, %rdi              ; rdi = self (arg to delete)
//     @0x000fd461  addq  $0x8, %rsp ; popq %rbx ; popq %rbp
//     @0x000fd467  jmp   __ZN8HGObjectdlEPv      ; HGObject::operator delete(void*)
//
//   D0 = D2 (base-object dtor) then HGObject::operator delete(self). JS GC
//   handles the free; we only surface the base-dtor call here.
// ---------------------------------------------------------------------------

/** HGCPixelFormatConversion_kV4B10Bit_BE_output::~HGCPixelFormatConversion_kV4B10Bit_BE_output()
 *  (D0) @Helium 0x000fd450. Calls the base
 *  HgcPixelFormatConversion_kV4B10Bit_BE_output destructor, then tail-calls
 *  HGObject::operator delete(void*). In TS we don't manage raw memory
 *  (JS GC), so only the base-dtor call is surfaced for parity with the
 *  disassembly. */
export function HGCPixelFormatConversion_kV4B10Bit_BE_output_dtor_D0(
  self: HGCPixelFormatConversion_kV4B10Bit_BE_output,
): void {
  // @0x000fd459 callq __ZN44HgcPixelFormatConversion_kV4B10Bit_BE_outputD2Ev
  self.__dtor_base();
  // @0x000fd467 jmp __ZN8HGObjectdlEPv (HGObject::operator delete(void*)).
  // No-op in TypeScript; JS GC reclaims the object.
}

// ---------------------------------------------------------------------------
// HGCPixelFormatConversion_kV4B10Bit_BE_output::GetOutput(HGRenderer*) @Helium 0x000fd470
//   Faithful to raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_output.GetOutput.s:
//     @0x000fd470  pushq %rbp ; movq %rsp, %rbp
//     @0x000fd474  movq  %rdi, %rax   ; rax = self
//     @0x000fd477  popq  %rbp
//     @0x000fd478  retq                ; return self
//
//   Plain English: return `this` (the output node IS its own output).
//   The HGRenderer* argument (%rsi) is not read.
// ---------------------------------------------------------------------------

/** HGCPixelFormatConversion_kV4B10Bit_BE_output::GetOutput(renderer)
 *  @Helium 0x000fd470. Returns `self` — this node is its own output. */
export function HGCPixelFormatConversion_kV4B10Bit_BE_output_GetOutput(
  self: HGCPixelFormatConversion_kV4B10Bit_BE_output,
  _renderer: HGRenderer,
): HGCPixelFormatConversion_kV4B10Bit_BE_output {
  // @0x000fd474 movq %rdi, %rax  ;  @0x000fd478 retq
  return self;
}

// ---------------------------------------------------------------------------
// HGCPixelFormatConversion_kV4B10Bit_BE_output::GetDOD(HGRenderer*, int, HGRect) @Helium 0x000fd480
//   Faithful to raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_output.GetDOD.s:
//
//   @0x000fd480  testl %edx, %edx
//   @0x000fd482  je    0x000fd493          ; if (which == 0) go to input-forward path
//   @0x000fd484  leaq  _HGRectNull(%rip), %rcx
//   @0x000fd48b  movq  (%rcx), %rax        ; rax = HGRectNull.lo
//   @0x000fd48e  movq  0x8(%rcx), %rdx     ; rdx = HGRectNull.hi
//   @0x000fd492  retq                       ; return HGRectNull
//   ---
//   @0x000fd493  pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; pushq %rax
//   @0x000fd499  movq  %rdi, %rax           ; rax = self
//   @0x000fd49c  movq  %rsi, %rdi           ; rdi = renderer   (arg1 of GetInput)
//   @0x000fd49f  movq  %rsi, %rbx           ; rbx = renderer   (save for GetDOD arg1)
//   @0x000fd4a2  movq  %rax, %rsi           ; rsi = self       (arg2 of GetInput = HGNode*)
//   @0x000fd4a5  xorl  %edx, %edx           ; edx = 0          (arg3 slot)
//   @0x000fd4a7  callq __ZN10HGRenderer8GetInputEP6HGNodei      ; rax = renderer.GetInput(self, 0)
//   @0x000fd4ac  movq  %rbx, %rdi           ; rdi = renderer   (arg1 of GetDOD)
//   @0x000fd4af  movq  %rax, %rsi           ; rsi = HGNode*    (arg2 of GetDOD = child input)
//   @0x000fd4b2  addq  $0x8, %rsp ; popq %rbx ; popq %rbp
//   @0x000fd4b8  jmp   __ZN10HGRenderer6GetDODEP6HGNode         ; tail-return renderer.GetDOD(input0)
//
//   Plain English:
//     if (which != 0) return HGRectNull;
//     input0 = renderer.GetInput(self, 0);
//     return renderer.GetDOD(input0);
//
//   The incoming HGRect (rcx, r8) is IGNORED — this node does not clip its
//   DOD to the caller's rect; it just forwards input-0's DOD wholesale.
//   Structurally identical to the sibling _input class's GetDOD @0x000f4f70.
// ---------------------------------------------------------------------------

/** HGCPixelFormatConversion_kV4B10Bit_BE_output::GetDOD(renderer, which, rect)
 *  @Helium 0x000fd480. Forwards input-0's DOD when `which == 0`; returns
 *  HGRectNull for any other input index. */
export function HGCPixelFormatConversion_kV4B10Bit_BE_output_GetDOD(
  self: HGCPixelFormatConversion_kV4B10Bit_BE_output,
  renderer: HGRenderer,
  which: number,
  _rect: HGRect,
): HGRect {
  // @0x000fd480 testl %edx, %edx ; @0x000fd482 je 0x000fd493
  // "je" is jump-if-EQUAL(zero): the (which == 0) branch forwards input 0;
  // the fall-through (which != 0) returns HGRectNull.
  if (which !== 0) {
    // @0x000fd484-@0x000fd492: load _HGRectNull, return it.
    return HGRectNullConst;
  }
  // @0x000fd4a7 callq HGRenderer::GetInput(self, 0)
  const input0 = HGRenderer_GetInput(renderer, self as unknown as HGNode, 0);
  // @0x000fd4b8 jmp HGRenderer::GetDOD(input0)  (tail-call)
  return HGRenderer_GetDOD(renderer, input0);
}

// ---------------------------------------------------------------------------
// HGCPixelFormatConversion_kV4B10Bit_BE_output::GetROI(HGRenderer*, int, HGRect) @Helium 0x000fd4c0
//   Faithful to raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B10Bit_BE_output.GetROI.s:
//
//   @0x000fd4c0  movq  %rcx, %rax           ; rax = inRect.lo (default return.lo)
//   @0x000fd4c3  testl %edx, %edx
//   @0x000fd4c5  je    0x000fd4da           ; if (which == 0) skip to return inRect
//   @0x000fd4c7  pushq %rbp ; movq %rsp, %rbp
//   @0x000fd4cb  leaq  _HGRectNull(%rip), %rcx
//   @0x000fd4d2  movq  (%rcx), %rax         ; rax = HGRectNull.lo
//   @0x000fd4d5  movq  0x8(%rcx), %r8       ; r8  = HGRectNull.hi
//   @0x000fd4d9  popq  %rbp
//   @0x000fd4da  movq  %r8, %rdx            ; return.hi = r8
//   @0x000fd4dd  retq
//
//   Plain English:
//     if (which == 0) return incoming rect;
//     else            return HGRectNull;
//
//   Note the register discipline: on the (which == 0) fall-through, rax was
//   already set to rcx (=inRect.lo) at 0x000fd4c0 and r8 already holds
//   inRect.hi from the caller — the shared "movq %r8, %rdx" at 0x000fd4da
//   builds the {rax=lo, rdx=hi} return without a branch.
//
//   Structurally identical to the sibling _input class's GetROI @0x000f4fb0.
// ---------------------------------------------------------------------------

/** HGCPixelFormatConversion_kV4B10Bit_BE_output::GetROI(renderer, which, rect)
 *  @Helium 0x000fd4c0. ROI for input 0 is the caller's requested rect;
 *  every other input index -> HGRectNull. `renderer` and `self` are unused
 *  (no reads of %rdi/%rsi anywhere in the disasm). */
export function HGCPixelFormatConversion_kV4B10Bit_BE_output_GetROI(
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x000fd4c3 testl %edx, %edx ; @0x000fd4c5 je 0x000fd4da
  if (which !== 0) {
    // @0x000fd4cb-@0x000fd4d5: load _HGRectNull as return value.
    return HGRectNullConst;
  }
  // @0x000fd4c0 movq %rcx, %rax  (rax already = inRect.lo)
  // @0x000fd4da movq %r8,  %rdx  (rdx = inRect.hi)
  // @0x000fd4dd retq              -> {rax=lo, rdx=hi} = incoming rect
  return rect;
}
