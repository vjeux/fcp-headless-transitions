// HGSMixer.ts — Helium HGSMixer: DOD / ROI for the "S-Mixer" node (a mixer
// node whose ONLY interesting inputs are index 0 and 1). Faithful transcription
// of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassembly:  raw-port/re/disasm/Helium.HGSMixer.~HGSMixer.s          (D0 @0x400f0)
//                      raw-port/re/disasm/Helium.HGSMixer.GetDOD.s             (@0x40110)
//                      raw-port/re/disasm/Helium.HGSMixer.GetROI.s             (@0x401a0)
//   D1 @0x400e0 body extracted directly from /tmp/Helium_tV.txt (see comment
//   on HGSMixer_dtor_D1 below — llvm-objdump not installed on this host, so
//   we quote the raw otool -tV region 0x400e0..0x400ea instead).
//
// Helium symbols transcribed:
//   @0x400e0  HGSMixer::~HGSMixer()  (D1 — tail-jmp to HgcSMixer::~HgcSMixer())
//   @0x400f0  HGSMixer::~HGSMixer()  (D0 — HgcSMixer base dtor + HGObject::operator delete)
//   @0x40110  HGSMixer::GetDOD(HGRenderer*, int, HGRect)
//   @0x401a0  HGSMixer::GetROI(HGRenderer*, int, HGRect)
//
// DECODE evidence:
//   * ABI mapping for these virtuals (matches sibling Helium HG*::GetDOD/GetROI):
//       %rdi = self (HGSMixer*)
//       %rsi = HGRenderer*
//       %edx = "which" (the int index arg)
//       %rcx = incoming HGRect.lo   (x1 | y1<<32)
//       %r8  = incoming HGRect.hi   (x2 | y2<<32)
//   * `HGRect` is a 16-byte struct stored as (x1, y1, x2, y2) int32 corners
//     packed into two qwords: lo = x1|y1<<32, hi = x2|y2<<32. Canonical
//     port in raw-port/src/render/HGRect.ts (fields {x,y,right,bottom} map
//     1:1 to {x1,y1,x2,y2}).
//   * Return convention: HGRect is a 16-byte trivially-copyable — returned in
//     (rax=lo, rdx=hi). Seen in the two-qword return path at the end of both
//     GetDOD and GetROI.
//   * _HGRectNull — Helium data symbol, RIP-loaded at @0x40125 (in GetDOD)
//     and @0x401ac (in GetROI). Same 16-zero-byte sentinel decoded in
//     raw-port/src/render/HGRect.ts (Helium _HGRectNull @0x3d2284 = {0,0,0,0}).
//   * Called imports / peer methods (all Helium; addresses shown are the
//     callq targets per otool -tV "##" comments):
//       HGRenderer::GetInput(HGNode*, int)    called @0x40153
//       HGRenderer::GetDOD(HGNode*)           called @0x40169
//       _HGRectIntersection                   called @0x4017a (canonical Helium 0x107ca0)
//       HgcSMixer::~HgcSMixer()               called @0x400f9 / tail-jmp @0x400e5 (Helium base dtor, frontier)
//       HGObject::operator delete(void*)      tail-jmp @0x40107 (Helium, frontier)
//
// Frontier callees / classes (surfaced as throwing stubs / opaque handles):
//   - HGRenderer::GetInput(HGNode*, int)   -> HGNode* (peer, not transcribed yet)
//   - HGRenderer::GetDOD(HGNode*)          -> HGRect  (peer, not transcribed yet)
//   - HgcSMixer::~HgcSMixer()              Helium base dtor
//   - HGObject::operator delete(void*)     Helium global operator delete

import {
  HGRect,
  HGRectNull as HGRectNullConst,
  HGRectIntersection,
} from "./HGRect.js";
export { HGRect };

// ---------------------------------------------------------------------------
// Frontier types (undecoded C++ types surfaced as opaque handles).
// ---------------------------------------------------------------------------

/** HGNode — opaque handle to a Helium render-graph node. Not transcribed here;
 *  HGSMixer treats it purely as an identity token passed to HGRenderer. */
export interface HGNode {}

/** HGRenderer — the render-graph traversal context. HGSMixer::GetDOD calls
 *  two of its methods (GetInput, GetDOD). Both are surfaced as frontier
 *  virtuals: their bodies are not transcribed here.
 *
 *  Signatures recovered from Helium mangled names (see @0x40153 / @0x40169):
 *    HGRenderer::GetInput(HGNode*, int)  -> HGNode*
 *    HGRenderer::GetDOD(HGNode*)         -> HGRect     (returned in rax:rdx)
 */
export interface HGRenderer {
  /** HGRenderer::GetInput(HGNode*, int) @Helium — frontier, not yet transcribed.
   *  Called from HGSMixer::GetDOD @0x40153. Returns the upstream HGNode* for
   *  input index `i`, or null. */
  GetInput(node: HGNode, i: number): HGNode | null;

  /** HGRenderer::GetDOD(HGNode*) @Helium — frontier, not yet transcribed.
   *  Called from HGSMixer::GetDOD @0x40169. Returns the "domain of
   *  definition" HGRect of the given upstream HGNode. */
  GetDOD(node: HGNode): HGRect;
}

/** HgcSMixer — the Helium base class of HGSMixer; only its destructor is
 *  referenced from this file. */
export interface HgcSMixer {
  /** HgcSMixer::~HgcSMixer() @Helium — base destructor called from both D1
   *  (@0x400e5 tail-jmp) and D0 (@0x400f9 callq). Not yet transcribed. */
  __dtor_base(): void;
}

/** HGSMixer — the class this file transcribes. It inherits from HgcSMixer.
 *  Neither GetDOD nor GetROI reads any instance data — self (%rdi) is only
 *  forwarded to HGRenderer::GetInput / HGRenderer::GetDOD as a node identity
 *  (%rsi <-> %rdi swap at @0x40142 / @0x40145 / @0x40148). */
export interface HGSMixer extends HgcSMixer {}

// ---------------------------------------------------------------------------
// HGSMixer::~HGSMixer()  D1 @Helium 0x400e0
//   Recovered directly from otool -tV (region 0x400e0..0x400ea in
//   /tmp/Helium_tV.txt — no dedicated `HGSMixer::~HGSMixer(D1)` label exists
//   in the -tV output because llvm's disassembler only emitted a label for
//   the D0 body @0x400f0):
//     @0x400e0  pushq %rbp
//     @0x400e1  movq  %rsp, %rbp
//     @0x400e4  popq  %rbp
//     @0x400e5  jmp   __ZN9HgcSMixerD2Ev   ## HgcSMixer::~HgcSMixer()
//     @0x400ea  nopw  (%rax,%rax)
//   Pure tail-jump to the base destructor; no `operator delete`.
// ---------------------------------------------------------------------------

/** HGSMixer::~HGSMixer() (D1) @Helium 0x400e0.
 *  Tail-jumps to HgcSMixer::~HgcSMixer(). */
export function HGSMixer_dtor_D1(self: HGSMixer): void {
  // @0x400e5 jmp __ZN9HgcSMixerD2Ev
  self.__dtor_base();
}

// ---------------------------------------------------------------------------
// HGSMixer::~HGSMixer()  D0 @Helium 0x400f0
//   Faithful to raw-port/re/disasm/Helium.HGSMixer.~HGSMixer.s:
//     @0x400f0  pushq %rbp
//     @0x400f1  movq  %rsp, %rbp
//     @0x400f4  pushq %rbx
//     @0x400f5  pushq %rax
//     @0x400f6  movq  %rdi, %rbx                                ; save self
//     @0x400f9  callq __ZN9HgcSMixerD2Ev  ## HgcSMixer::~HgcSMixer()
//     @0x400fe  movq  %rbx, %rdi                                ; restore self
//     @0x40101  addq  $0x8, %rsp
//     @0x40105  popq  %rbx
//     @0x40106  popq  %rbp
//     @0x40107  jmp   __ZN8HGObjectdlEPv ## HGObject::operator delete(void*)
// ---------------------------------------------------------------------------

/** HGSMixer::~HGSMixer() (D0) @Helium 0x400f0.
 *  Calls the base HgcSMixer destructor, then tail-calls
 *  HGObject::operator delete(void*) on the object pointer. In TS we don't
 *  manage raw memory; we surface the base-dtor call so callers can chain
 *  cleanup. */
export function HGSMixer_dtor_D0(self: HGSMixer): void {
  // @0x400f9 callq __ZN9HgcSMixerD2Ev
  self.__dtor_base();
  // @0x40107 jmp __ZN8HGObjectdlEPv  - HGObject::operator delete(void*).
  // In TypeScript there is no manual free; the JS GC handles it. Documented
  // for parity with the disassembly.
}

// ---------------------------------------------------------------------------
// HGSMixer::GetDOD(HGRenderer*, int, HGRect) @Helium 0x40110
//   Signature (ABI): %rdi=self, %rsi=renderer, %edx=which,
//                    %rcx=inRect.lo, %r8=inRect.hi.
//
//   @0x40110  testl %edx, %edx
//   @0x40112  je    0x4018e                     ; if (which == 0) -> return incoming rect
//   @0x40114  pushq %rbp / movq %rsp, %rbp / pushq r15..rbx / pushq %rax  (frame)
//   @0x40122  movl  %edx, %r9d                  ; r9d = which
//   @0x40125  leaq  _HGRectNull(%rip), %rdx     ; rdx = &_HGRectNull
//   @0x4012c  movq  (%rdx), %rax                ; rax = HGRectNull.lo   (=0)
//   @0x4012f  movq  0x8(%rdx), %rdx             ; rdx = HGRectNull.hi   (=0)
//   @0x40133  cmpl  $0x1, %r9d
//   @0x40137  jne   0x4017f                     ; if (which != 1) -> return HGRectNull
//   ; --- which == 1 path ---
//   @0x40139  movq  %rcx, %r14                  ; r14 = inRect.lo   (saved)
//   @0x4013c  movq  %r8,  %rbx                  ; rbx = inRect.hi   (saved)
//   @0x4013f  movq  %rsi, %r15                  ; r15 = renderer    (saved)
//   @0x40142  movq  %rdi, %rcx                  ; rcx = self (saved for later)
//   @0x40145  movq  %rsi, %rdi                  ; rdi = renderer    (arg0)
//   @0x40148  movq  %rcx, %rsi                  ; rsi = self        (arg1 = HGNode*)
//   @0x4014b  movq  %rdx, %r13                  ; r13 = HGRectNull.hi (=0, saved for fallthrough)
//   @0x4014e  xorl  %edx, %edx                  ; edx = 0           (arg2 = i=0)
//   @0x40150  movq  %rax, %r12                  ; r12 = HGRectNull.lo (=0, saved for fallthrough)
//   @0x40153  callq __ZN10HGRenderer8GetInputEP6HGNodei   ; HGRenderer::GetInput(self,0) -> HGNode*
//   @0x40158  movq  %r13, %rdx                  ; rdx = HGRectNull.hi (restore for potential
//                                                       null-return fallthrough)
//   @0x4015b  movq  %rax, %rsi                  ; rsi = returned HGNode*
//   @0x4015e  movq  %r12, %rax                  ; rax = HGRectNull.lo (restore for potential
//                                                       null-return fallthrough)
//   @0x40161  testq %rsi, %rsi
//   @0x40164  je    0x4017f                     ; if (input == NULL) -> return HGRectNull
//   @0x40166  movq  %r15, %rdi                  ; rdi = renderer   (arg0)
//   @0x40169  callq __ZN10HGRenderer6GetDODEP6HGNode  ; HGRenderer::GetDOD(input) -> HGRect
//   @0x4016e  movq  %rdx, %rcx                  ; rcx = returnedDOD.hi  (arg for HGRectIntersection)
//   @0x40171  movq  %r14, %rdi                  ; rdi = savedInRect.lo  (arg for HGRectIntersection)
//   @0x40174  movq  %rbx, %rsi                  ; rsi = savedInRect.hi  (arg for HGRectIntersection)
//   @0x40177  movq  %rax, %rdx                  ; rdx = returnedDOD.lo  (arg for HGRectIntersection)
//   @0x4017a  callq _HGRectIntersection         ; rax:rdx = intersection(inRect, dod)
//   @0x4017f  <epilogue>  popq %rax..%r15 / popq %rbp / retq
//   ---
//   @0x4018e  movq  %rcx, %rax  / movq %r8, %rdx / retq  ; which==0 path: return incoming rect
//
//   NOTE on the HGRectIntersection ABI at @0x4017a:
//     The four qword regs passed are: rdi=inRect.lo, rsi=inRect.hi,
//     rdx=dod.lo, rcx=dod.hi. That matches HGRectIntersection's
//     two-HGRect-arg calling convention (each HGRect passed as (lo,hi) qword
//     pair, in {rdi,rsi} then {rdx,rcx}). See raw-port/src/render/HGRect.ts
//     for the fully-decoded HGRectIntersection @Helium 0x107ca0.
//
//   In plain English:
//     GetDOD(renderer, which, inRect):
//       - which == 0:  return inRect                             (@0x4018e path)
//       - which == 1:  input = renderer.GetInput(self, 0);
//                      if (!input) return HGRectNull;            (@0x40164)
//                      return HGRectIntersection(inRect, renderer.GetDOD(input));
//       - which >= 2 (or < 0): return HGRectNull                 (@0x40137)
//     So the mixer has TWO logical inputs:
//       - index 0's DOD equals the incoming rect (the "background" pass-through)
//       - index 1's DOD is (background ∩ actual upstream input 0's DOD)
//     Any other index is a null DOD.
// ---------------------------------------------------------------------------

/** HGSMixer::GetDOD(HGRenderer*, int, HGRect) @Helium 0x40110.
 *  Returns the "domain of definition" HGRect for input `which` of an S-Mixer.
 *  See the top-of-block comment for the full asm mapping. */
export function HGSMixer_GetDOD(
  self: HGSMixer,
  renderer: HGRenderer,
  which: number,
  inRect: HGRect,
): HGRect {
  // @0x40110 testl %edx, %edx / @0x40112 je 0x4018e — which == 0 returns incoming rect.
  if (which === 0) {
    // @0x4018e movq %rcx, %rax / movq %r8, %rdx / retq
    return inRect;
  }

  // @0x40125..@0x40137: preload _HGRectNull; if which != 1, jump to return-null path (@0x4017f).
  if (which !== 1) {
    // @0x40137 jne 0x4017f  -> return HGRectNull
    return HGRectNullConst;
  }

  // --- which == 1 path (@0x40139..@0x40153) ---
  // @0x40145 rdi = renderer / @0x40148 rsi = self (as HGNode*) / @0x4014e edx = 0
  // @0x40153 callq HGRenderer::GetInput(self, 0)
  const input = renderer.GetInput(self as unknown as HGNode, 0);

  // @0x40161 testq %rsi, %rsi / @0x40164 je 0x4017f  -> return HGRectNull if input is NULL.
  if (input === null) {
    return HGRectNullConst;
  }

  // @0x40166 rdi = renderer / @0x40169 callq HGRenderer::GetDOD(input)
  const dod = renderer.GetDOD(input);

  // @0x4017a callq _HGRectIntersection with (inRect, dod).
  //   rdi=inRect.lo, rsi=inRect.hi, rdx=dod.lo, rcx=dod.hi
  //   -> HGRectIntersection(inRect, dod)
  return HGRectIntersection(inRect, dod);
}

// ---------------------------------------------------------------------------
// HGSMixer::GetROI(HGRenderer*, int, HGRect) @Helium 0x401a0
//   Signature (ABI): %rdi=self(unused), %rsi=renderer(unused), %edx=which,
//                    %rcx=inRect.lo, %r8=inRect.hi.
//
//   @0x401a0  movq  %rcx, %rax                  ; rax = inRect.lo   (default return.lo)
//   @0x401a3  cmpl  $0x2, %edx
//   @0x401a6  jb    0x401bb                     ; if (which < 2)    -> return inRect
//   ; --- which >= 2 path ---
//   @0x401a8  pushq %rbp / movq %rsp, %rbp      ; (frame, then load HGRectNull)
//   @0x401ac  leaq  _HGRectNull(%rip), %rcx
//   @0x401b3  movq  (%rcx), %rax                ; rax = HGRectNull.lo (=0)
//   @0x401b6  movq  0x8(%rcx), %r8              ; r8  = HGRectNull.hi (=0)
//   @0x401ba  popq  %rbp
//   @0x401bb  movq  %r8, %rdx                   ; rdx = return.hi (either inRect.hi or HGRectNull.hi)
//   @0x401be  retq
//
//   The function body ends at 0x401be. The bytes @0x401bf..0x40272 in the
//   raw disasm belong to an adjacent function (HGImmersiveVideoPreview's
//   constructor — confirmed via resolve.py Helium sym 0x401ca ->
//   "HGImmersiveVideoPreview::HGImmersiveVideoPreview() (+0xa)"); they are
//   NOT part of HGSMixer::GetROI and are ignored here.
//
//   In plain English:
//     GetROI(renderer, which, inRect):
//       - which  < 2: return inRect                (@0x401a6 jb 0x401bb)
//       - which >= 2: return HGRectNull            (@0x401ac.._HGRectNull path)
//     So the mixer's requested-ROI is the incoming rect for BOTH real inputs
//     (indices 0 and 1) and null for any out-of-range index.
// ---------------------------------------------------------------------------

/** HGSMixer::GetROI(HGRenderer*, int, HGRect) @Helium 0x401a0.
 *  Returns the requested "region of interest" for input `which` of an
 *  S-Mixer. See the top-of-block comment for the full asm mapping. */
export function HGSMixer_GetROI(
  _self: HGSMixer,
  _renderer: HGRenderer,
  which: number,
  inRect: HGRect,
): HGRect {
  // @0x401a0 movq %rcx, %rax  — rax preseeded with inRect.lo.
  // @0x401a3 cmpl $0x2, %edx / @0x401a6 jb 0x401bb  — which < 2 returns inRect unchanged.
  //   NB: `jb` is UNSIGNED-below. `which` is passed as edx (32-bit int); reads
  //   of edx zero-extend, but `jb $2` with a negative `which` treats it as a
  //   huge unsigned -> falls through to the HGRectNull path. We mirror that
  //   here with an unsigned compare via `>>> 0`.
  if ((which >>> 0) < 2) {
    return inRect;
  }

  // @0x401ac..@0x401b6 load _HGRectNull;  @0x401bb-@0x401be return it.
  return HGRectNullConst;
}
