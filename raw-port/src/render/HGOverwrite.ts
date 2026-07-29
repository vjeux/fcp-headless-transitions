// HGOverwrite.ts — Helium's HGOverwrite render node.
//
// Faithful transcription of every externally-visible HGOverwrite method
// (excluding the two heavy pixel paths, which throw citing their addrs)
// from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Semantic summary (from the four decoded bodies below):
//   HGOverwrite is a multi-input compositor node with the "overwrite"
//   semantic: each input is layered in slot order, and each new input
//   OPAQUELY OVERWRITES the pixels of its region (no alpha blend). Its
//   ROI/DOD/RenderTile machinery does NOTHING for mode >= 8 (returns
//   _HGRectNull as DOD, i.e. "no output"), and for mode < 8 propagates
//   coverage through the input list. There are NO tunable parameters:
//   SetParameter is a 7-instruction NOOP that always returns 0.
//
// ---------------------------------------------------------------------------
// Source disassembly (bundled):
//   raw-port/re/disasm/Helium.HGOverwrite.HGOverwrite.s      (C1 @0xd9980)
//   raw-port/re/disasm/Helium.HGOverwrite.SetParameter.s     (@0xda030)
//   raw-port/re/disasm/Helium.HGOverwrite.GetDOD.s           (@0xd9f30)
//   raw-port/re/disasm/Helium.HGOverwrite.GetROI.s           (@0xd9f50)
//   raw-port/re/disasm/Helium.HGOverwrite.RenderTile.s       (@0xd9be0, 220 lines — throw-stub)
//   raw-port/re/disasm/Helium.HGOverwrite.RenderPageMetal.s  (@0xd9a10, 131 lines — throw-stub)
//
// nm entries owned by this class (Helium, x86_64 slice):
//   0xd9980  T HGOverwrite::HGOverwrite()               [C1, and C2 by ICF]
//   0xd99f0  T HGOverwrite::~HGOverwrite()              [D1]
//   0xd9a00  T HGOverwrite::~HGOverwrite()              [D0]
//   0xd9a10  T HGOverwrite::RenderPageMetal(HGPage*)
//   0xd9be0  T HGOverwrite::RenderTile(HGTile*)
//   0xd9f30  T HGOverwrite::GetDOD(HGRenderer*, int, HGRect)
//   0xd9f50  T HGOverwrite::GetROI(HGRenderer*, int, HGRect)
//   0xda030  T HGOverwrite::SetParameter(int, float, float, float, float)
//
// ---------------------------------------------------------------------------
// Class shape recovered from the ctor:
//
//   HGOverwrite  is-a  HGNode                (C1 opens with
//                                              callq __ZN6HGNodeC2Ev @0xd998a)
//
//   HGOverwrite {
//     +0x000  vptr                            (set in C1 @0xd9996 to
//                                              vtable-for-HGOverwrite
//                                              @Helium 0xa0c6b8; leaq @0xd998f
//                                              of 0x932d22 + next-instr
//                                              @0xd9996 = 0xa0c6b8. Verified
//                                              against `resolve.py Helium
//                                              vtable HGOverwrite`.)
//     +0x008..                                (HGNode base subobject)
//     +0x010  u32 renderPageStrategy          (bit-flag word inherited from
//                                              HGNode. C1 rewrites it @0xd99b0:
//                                                new = (old & ~0x600) | 0x400
//                                              HGNode's C2 sets it to 0x200
//                                              default; HGOverwrite masks
//                                              the 0x200 bit off and sets the
//                                              0x400 bit — meaning "use the
//                                              per-page-strategy that lives
//                                              at code point 0x400" (opaque
//                                              enum: caller-inspected only).)
//   }
//
//   No HGOverwrite-specific data slots beyond the base. Its only owned
//   behaviour is the vtable overrides (RenderTile/RenderPageMetal/GetDOD/
//   GetROI/SetParameter). Everything else is inherited from HGNode.
//
// vtable-for-HGOverwrite (Helium @0xa0c6b8 — resolved via
// `raw-port/army/tools/resolve.py Helium vtable HGOverwrite`; only slots that
// diverge from HGNode's own vtable are listed):
//   *0x60 -> HGOverwrite::SetParameter(int, f,f,f,f) @0xda030 (this class)
//   *0xb0 -> HGOverwrite::RenderTile(HGTile*)         @0xd9be0 (this class,
//                                                              throw-stub)
//   (RenderPageMetal @0xd9a10 is another slot — inspected further below.)
//   All other slots (Retain/Release, debugDescription, ..., SetInput/GetInput,
//   SetFlags/ClearFlags/GetFlags, SetFilter, GetProperty, GetProgram, Bind,
//   BindTexture, UnBind, ...) point at the base HGNode implementations.
//
// ---------------------------------------------------------------------------
// HGOverwrite::HGOverwrite()  [C1 — ICF-folded onto C2]           @0xd9980
//
//   __ZN11HGOverwriteC1Ev:
//     0xd9980  pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
//     0xd9987  movq  %rdi, %rbx                       ; save this
//     0xd998a  callq __ZN6HGNodeC2Ev                   ; HGNode base ctor
//     0xd998f  leaq  0x932d22(%rip), %rax              ; = vtable-for-HGOverwrite
//                                                        (@0xa0c6b8; 0xd9996 +
//                                                         0x932d22)
//     0xd9996  movq  %rax, (%rbx)                      ; this->vptr = vtable
//     0xd9999  movq  %rbx, %rdi
//     0xd999c  movl  $0xffffffff, %esi                 ; arg1 = -1 (all-bits)
//     0xd99a1  movl  $0x1, %edx                        ; arg2 = 1
//     0xd99a6  callq __ZN6HGNode8SetFlagsEii           ; HGNode::SetFlags(-1, 1)
//     0xd99ab  movl  $0xfffff9ff, %eax                 ; imm = ~0x600
//     0xd99b0  andl  0x10(%rbx), %eax                  ; eax = old & ~0x600
//     0xd99b3  orl   $0x400, %eax                      ; eax |= 0x400
//     0xd99b8  movl  %eax, 0x10(%rbx)                  ; renderPageStrategy =
//                                                        (old & ~0x600) | 0x400
//     0xd99bb  pop/ret
//
//   Exception-unwind stanza @0xd99c0..0xd99ce: on any callq throwing, run
//   HGNode::~HGNode() on this then rethrow. In TS the frontier stubs throw
//   before completing, so this stanza collapses into the surface throw.
//
// Semantics: standard HGNode subclass ctor. SetFlags(-1, 1) is the base's
// "set flag-1 bit across all 32 lanes" (per HGNode::SetFlags @0x11c8e0);
// its effect on this class is opaque (frontier). The +0x10 renderPageStrategy
// rewrite is the ONE self-modification — clear the 0x600 mask bits and set
// 0x400. HGNode's C2 initialises +0x10 to 0x200, so after HGOverwrite::C1
// its value is:
//   ((0x200 & 0xfffff9ff) | 0x400)  =  (0x000 | 0x400)  =  0x400
// (numerically verified: 0x200 & ~0x600 = 0. Then |0x400 = 0x400.)
//
// ---------------------------------------------------------------------------
// HGOverwrite::SetParameter(int, float, float, float, float) -> int
//                                                                  @0xda030
//
//   __ZN11HGOverwrite12SetParameterEiffff:
//     0xda030  pushq %rbp / movq %rsp,%rbp
//     0xda034  xorl  %eax, %eax                        ; %eax = 0
//     0xda036  popq  %rbp
//     0xda037  retq
//
// Semantics: HGOverwrite exposes NO tunable parameters. Any (paramIdx,
// values) call is discarded and returns 0 (the "no change" code — matching
// the -1/0/1 return-code convention used across the Helium family). This is
// NOT `-1` (invalid param), it's `0`; the class quietly accepts any index.
//
// ---------------------------------------------------------------------------
// HGOverwrite::GetDOD(HGRenderer* renderer, int mode, HGRect box) -> HGRect
//                                                                  @0xd9f30
//
//   __ZN11HGOverwrite6GetDODEP10HGRendereri6HGRect:
//     0xd9f30  movq  %rcx, %rax                        ; ret.lo = box.lo
//     0xd9f33  cmpl  $0x8, %edx                        ; if mode < 8
//     0xd9f36  jb    0xd9f4b                           ;   -> skip _HGRectNull load
//     0xd9f38  pushq %rbp / movq %rsp,%rbp
//     0xd9f3c  leaq  _HGRectNull(%rip), %rcx           ; else: read _HGRectNull
//                                                        (@Helium 0x3d2284,
//                                                         16 zero bytes)
//     0xd9f43  movq  (%rcx), %rax                      ; ret.lo = null.lo (= 0)
//     0xd9f46  movq  0x8(%rcx), %r8                    ; r8    = null.hi (= 0)
//     0xd9f4a  popq  %rbp
//     0xd9f4b  movq  %r8, %rdx                        ; ret.hi = r8
//                                                        (r8 was preserved
//                                                         from the mode<8 fall-
//                                                         through, or overwritten
//                                                         by the null load; in
//                                                         either case the pair
//                                                         (%rax,%rdx) is the
//                                                         returned HGRect.)
//     0xd9f4e  retq
//
// Semantics: pass-through for mode < 8; return _HGRectNull (16 zero bytes)
// for mode >= 8. The `mode` argument is the input-slot index the caller is
// asking about; slot indices 0..7 propagate the caller's `box` verbatim,
// and slot indices >=8 declare "no coverage" — HGOverwrite has a hard cap
// of 8 supported input slots (regardless of what HGNode::GetNumInputs()
// reports).
//
// ---------------------------------------------------------------------------
// HGOverwrite::GetROI(HGRenderer* renderer, int mode, HGRect box) -> HGRect
//                                                                  @0xd9f50
//
//   __ZN11HGOverwrite6GetROIEP10HGRendereri6HGRect:
//     0xd9f50  pushq %rbp / movq %rsp,%rbp
//              pushq %r15..%rbx / pushq %rax (32-byte stack)
//     0xd9f5e  movq  %r8, %r13                         ; r13 = box.hi
//     0xd9f61  movq  %rcx, %r12                        ; r12 = box.lo
//     0xd9f64  movl  %edx, %ebx                        ; ebx = mode (i)
//     0xd9f66  movq  %rsi, %r14                        ; r14 = renderer
//     0xd9f69  movq  %rdi, %r15                        ; r15 = this
//     0xd9f6c  movq  %rsi, %rdi                        ; arg1 = renderer
//     0xd9f6f  movq  %r15, %rsi                        ; arg2 = this
//     0xd9f72  callq __ZN10HGRenderer8GetInputEP6HGNodei
//                                                       ; input0 = renderer->
//                                                        GetInput(this, mode)
//                                                        NB: uses `edx = mode`
//                                                        implicit-argN — the
//                                                        third integer arg is
//                                                        %edx from the caller's
//                                                        frame (i.e. `mode`
//                                                        again). Verify: yes,
//                                                        no `mov ??, %edx`
//                                                        happens between
//                                                        0xd9f64 and 0xd9f72,
//                                                        so %edx is preserved
//                                                        from the entry `mov
//                                                        %edx, %ebx`.
//     0xd9f77  movq  %r14, %rdi                        ; arg1 = renderer
//     0xd9f7a  movq  %rax, %rsi                        ; arg2 = input0
//     0xd9f7d  callq __ZN10HGRenderer6GetDODEP6HGNode  ; dod0 = renderer->
//                                                        GetDOD(input0)
//     0xd9f82  movq  %rax, %rdi                        ; arg1 = dod0.lo
//     0xd9f85  movq  %rdx, %rsi                        ; arg2 = dod0.hi
//     0xd9f88  movq  %r12, %rdx                        ; arg3 = box.lo
//     0xd9f8b  movq  %r13, %rcx                        ; arg4 = box.hi
//     0xd9f8e  callq _HGRectIntersection               ; roi = HGRectIntersection(
//                                                                dod0, box)
//     0xd9f93  movq  %rax, %r12                        ; r12 = roi.lo
//     0xd9f96  movq  %rdx, %r13                        ; r13 = roi.hi
//     0xd9f99  movq  (%r15), %rax                      ; this->vptr
//     0xd9f9c  movq  %r15, -0x30(%rbp)                 ; spill this to stack
//     0xd9fa0  movq  %r15, %rdi                        ; arg1 = this
//     0xd9fa3  callq *0x70(%rax)                       ; numInputs = this->
//                                                        vtable[0x70]()
//                                                        = HGNode::GetNumInputs()
//                                                        @Helium 0x11c8a0
//     0xd9fa6  incl  %ebx                              ; i = mode + 1
//     0xd9fa8  cmpl  %eax, %ebx                        ; if i >= numInputs
//     0xd9faa  jge   0xda019                           ;   -> return roi
//     0xd9fac  movl  %eax, %r15d                       ; r15d = numInputs
//     0xd9faf  jmp   0xd9fc7                           ; enter loop body
//     ; --- loop body @ 0xd9fc7 ---
//     0xd9fc7  movq  %r12, %rdi                        ; arg1 = roi.lo
//     0xd9fca  movq  %r13, %rsi                        ; arg2 = roi.hi
//     0xd9fcd  callq _HGRectIsNull                     ; -> eax = 1 if roi is null
//     0xd9fd2  testl %eax, %eax
//     0xd9fd4  jne   0xda019                           ; if roi is null -> return
//     0xd9fd6  movq  %r14, %rdi                        ; arg1 = renderer
//     0xd9fd9  movq  -0x30(%rbp), %rsi                 ; arg2 = this
//     0xd9fdd  movl  %ebx, %edx                        ; arg3 = i
//     0xd9fdf  callq __ZN10HGRenderer8GetInputEP6HGNodei
//                                                       ; inputi = renderer->
//                                                        GetInput(this, i)
//     0xd9fe4  testq %rax, %rax
//     0xd9fe7  je    0xd9fc0                           ; if inputi == null
//                                                        -> continue (skip this
//                                                         slot)
//     0xd9fe9  movq  %r14, %rdi                        ; arg1 = renderer
//     0xd9fec  movq  %rax, %rsi                        ; arg2 = inputi
//     0xd9fef  callq __ZN10HGRenderer6GetDODEP6HGNode  ; dodi = renderer->
//                                                        GetDOD(inputi)
//     0xd9ff4  movq  %rax, %rdi                        ; arg1 = dodi.lo
//     0xd9ff7  movq  %rdx, %rsi                        ; arg2 = dodi.hi
//     0xd9ffa  movq  %r12, %rdx                        ; arg3 = roi.lo
//     0xd9ffd  movq  %r13, %rcx                        ; arg4 = roi.hi
//     0xda000  callq _HGRectContainsRect               ; -> eax = 1 if
//                                                        dodi ⊇ roi
//     0xda005  testl %eax, %eax
//     0xda007  je    0xd9fc0                           ; if !contains
//                                                        -> continue (this
//                                                        input does not fully
//                                                        cover the ROI — keep
//                                                        going)
//     0xda009  leaq  _HGRectNull(%rip), %rax           ; else: NULL the roi
//     0xda010  movq  (%rax), %r12                      ; roi.lo = 0
//     0xda013  movq  0x8(%rax), %r13                   ; roi.hi = 0
//     0xda017  jmp   0xd9fc0                           ; -> continue
//     ; --- continue block @0xd9fc0 ---
//     0xd9fc0  incl  %ebx                              ; i++
//     0xd9fc2  cmpl  %ebx, %r15d                       ; if numInputs == i
//     0xd9fc5  je    0xda019                           ;   -> return roi
//                                                        (compare r15d, ebx
//                                                         then je = "if equal"
//                                                         = i has reached
//                                                         numInputs. NB: this
//                                                         doesn't handle the
//                                                         i > numInputs case,
//                                                         but i is monotone
//                                                         and starts < r15d,
//                                                         so JE fires exactly
//                                                         when it's reached.)
//     0xd9fc7  ...  loop back to top
//     ; --- return @0xda019 ---
//     0xda019  movq  %r12, %rax                        ; ret.lo = roi.lo
//     0xda01c  movq  %r13, %rdx                        ; ret.hi = roi.hi
//     0xda01f..0xda02d  add/pop/ret
//
// Semantics (in terms of what the render graph asks for):
//   The upstream is queried for slot `mode` first (input0), intersected with
//   the caller's `box` to form the initial ROI. Then for every subsequent
//   input slot i in [mode+1, numInputs):
//     - if ROI has collapsed to null, stop.
//     - fetch input i.
//     - if slot i is unwired, skip.
//     - if input i's DOD FULLY CONTAINS the current ROI, NULL the ROI
//       (semantic: input i will opaquely OVERWRITE the ROI, so the caller's
//       demand from slot `mode` is fully occluded — nothing needs to be
//       rendered for this frame at this rect from slot `mode`).
//     - otherwise keep the ROI as-is.
//   Return the (possibly-nulled) ROI.
//
// This is the ROI-elision behaviour that gives HGOverwrite its name: an
// opaque later input overwrites earlier ones, so the ROI collapses to null
// whenever a later input's DOD fully covers the demand.
//
// NB: the loop does NOT SHRINK the ROI for partial-cover cases — it only
// NULLS the ROI on full-cover. That's a deliberate simplification (per the
// asm: no HGRectSubtract call). Partial-cover means the earlier input still
// needs to render its full ROI.
//
// ---------------------------------------------------------------------------
// HGOverwrite::RenderTile(HGTile*) — throw-stub, addr @0xd9be0, 220 lines
// HGOverwrite::RenderPageMetal(HGPage*) — throw-stub, addr @0xd9a10,
//   131 lines.
// These are the per-pixel paths (CPU + Metal per-page) — they deserve their
// own decode pass. Both are cited below via throwing frontier stubs so any
// caller that reaches them surfaces the exact addr.
//
// ---------------------------------------------------------------------------
// HGOverwrite::~HGOverwrite()  [D0/D1] — @0xd9a00 / @0xd99f0
// Both dtors: reset vptr to vtable-for-HGOverwrite, tail-jmp HGNode::~HGNode
// (D0 additionally calls HGObject::operator delete via jmp). In TS the GC
// subsumes the trailing delete; the D1/D0 bodies are behavior-equivalent
// modulo the trailing free. Cited via throw-stub below.
//
// ---------------------------------------------------------------------------

import type { HGRect } from "./HGRect";
import { HGRectNull, HGRectIntersection, HGRectIsNull, HGRectContainsRect } from "./HGRect";
import type { HGRenderer } from "./HGSmDecN_Shader";

/**
 * Opaque brand for the parent HGNode identity — the render-graph node
 * base class that HGOverwrite extends. This wrapper's type surface is
 * limited to the fields C1 initialises (+0x10 renderPageStrategy), so
 * we don't need HGNode.ts's full class here; just the identity.
 */
export type HGNode = { readonly __brand: "HGNode" };

// ---------------------------------------------------------------------------
// Frontier callee stubs (undecoded at this class layer). Each cites the
// exact call site so downstream porters can pull the right symbol next.
// ---------------------------------------------------------------------------

/**
 * Frontier: `HGNode::HGNode()` — base ctor invoked from HGOverwrite::C1
 * @Helium 0xd998a.
 */
function HGNode_C2(_self: HGOverwrite): void {
  // @Helium 0xd998a callq __ZN6HGNodeC2Ev
  throw new Error(
    "HGNode::HGNode() not yet transcribed " +
      "(frontier callee @Helium 0xd998a in HGOverwrite::C1)",
  );
}

/**
 * Frontier: `HGNode::SetFlags(int mask, int flag)` — invoked ONCE from
 * HGOverwrite::C1 @Helium 0xd99a6 with (mask=-1, flag=1). Sets bit-1 of
 * the flag word across all 32 lanes (semantics: opaque; HGNode::SetFlags
 * @Helium 0x11c8e0 is a frontier).
 */
function HGNode_SetFlags(_self: HGOverwrite, _mask: number, _flag: number): void {
  // @Helium 0xd99a6 callq __ZN6HGNode8SetFlagsEii
  throw new Error(
    "HGNode::SetFlags(int, int) not yet transcribed " +
      "(frontier callee @Helium 0xd99a6 with args (-1, 1) in HGOverwrite::C1)",
  );
}

/**
 * Frontier: `HGRenderer::GetInput(HGNode* node, int slot) -> HGNode*` —
 * invoked from HGOverwrite::GetROI at @Helium 0xd9f72 (slot=mode) and
 * @Helium 0xd9fdf (slot=i inside the elision loop). Plain non-virtual call.
 */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _self: HGOverwrite,
  _slot: number,
): HGNode | null {
  // @Helium 0xd9f72 / 0xd9fdf callq __ZN10HGRenderer8GetInputEP6HGNodei
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed " +
      "(frontier callee @Helium 0xd9f72 and 0xd9fdf in HGOverwrite::GetROI)",
  );
}

/**
 * Frontier: `HGRenderer::GetDOD(HGNode*) -> HGRect` — invoked from
 * HGOverwrite::GetROI at @Helium 0xd9f7d (initial DOD of input0) and
 * @Helium 0xd9fef (DOD of each slot inside the elision loop). Plain
 * non-virtual call.
 */
function HGRenderer_GetDOD(_renderer: HGRenderer, _node: HGNode): HGRect {
  // @Helium 0xd9f7d / 0xd9fef callq __ZN10HGRenderer6GetDODEP6HGNode
  throw new Error(
    "HGRenderer::GetDOD(HGNode*) not yet transcribed " +
      "(frontier callee @Helium 0xd9f7d and 0xd9fef in HGOverwrite::GetROI)",
  );
}

/**
 * Frontier: `HGNode::GetNumInputs() -> int` — invoked from
 * HGOverwrite::GetROI @Helium 0xd9fa3 via `this->vtable[0x70]()`. Slot 0x70
 * of vtable-for-HGOverwrite @0xa0c6b8 resolves to HGNode::GetNumInputs
 * @Helium 0x11c8a0 (not overridden by HGOverwrite).
 */
function HGNode_GetNumInputs(_self: HGOverwrite): number {
  // @Helium 0xd9fa3 callq *0x70(%rax) -> HGNode::GetNumInputs @0x11c8a0
  throw new Error(
    "HGNode::GetNumInputs() not yet transcribed " +
      "(frontier callee @Helium 0xd9fa3 in HGOverwrite::GetROI)",
  );
}

/**
 * Frontier: `HGOverwrite::RenderTile(HGTile*)` — the CPU pixel path
 * @Helium 0xd9be0 (220 lines). Defers to a separate decode pass.
 */
function HGOverwrite_RenderTile_body(_self: HGOverwrite, _tile: object): void {
  // @Helium 0xd9be0 __ZN11HGOverwrite10RenderTileEP6HGTile
  throw new Error(
    "HGOverwrite::RenderTile(HGTile*) not yet transcribed " +
      "(220-line CPU pixel path @Helium 0xd9be0 — deferred to a dedicated pass)",
  );
}

/**
 * Frontier: `HGOverwrite::RenderPageMetal(HGPage*)` — the Metal per-page
 * pixel path @Helium 0xd9a10 (131 lines). Defers to a separate decode pass.
 */
function HGOverwrite_RenderPageMetal_body(_self: HGOverwrite, _page: object): void {
  // @Helium 0xd9a10 __ZN11HGOverwrite15RenderPageMetalEP6HGPage
  throw new Error(
    "HGOverwrite::RenderPageMetal(HGPage*) not yet transcribed " +
      "(131-line Metal per-page path @Helium 0xd9a10 — deferred to a dedicated pass)",
  );
}

/**
 * Frontier: `HGNode::~HGNode()` — reached from every HGOverwrite dtor:
 *   D1 @Helium 0xd99f0 (tail-jmp)
 *   D0 @Helium 0xd9a00 (callq, then op-delete tail-jmp)
 *   Unwind edge @Helium 0xd99c6 (C1 exception path)
 */
function HGNode_D2(_self: HGOverwrite): void {
  // @Helium 0xd99f0 / 0xd9a00 / 0xd99c6 → __ZN6HGNodeD2Ev
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
      "(frontier callee @Helium 0xd99f0/0xd9a00/0xd99c6 in HGOverwrite dtors)",
  );
}

/**
 * `HGOverwrite` — Helium's opaque-overwrite compositor node.
 *
 * Renders each of its (up to 8) inputs in slot order, with each new input
 * OPAQUELY covering the pixels of its own region. The compositing semantic
 * is implicit in the render paths (RenderTile / RenderPageMetal — both
 * deferred), but the ROI/DOD machinery exposed here already implements the
 * "occlusion elision" optimisation:
 *   - GetDOD says "no output" (returns _HGRectNull) for any input slot ≥ 8
 *     regardless of what HGNode::GetNumInputs() says. Slots 0..7 report the
 *     caller's `box` as their DOD (transparent forwarding).
 *   - GetROI initially clips the ROI to input0's DOD ∩ box, then for each
 *     subsequent input i: if input i's DOD FULLY CONTAINS the ROI, collapse
 *     the ROI to null (input i will overwrite everything, so the caller's
 *     slot-`mode` doesn't need to render anything).
 *
 * @Helium symbols owned by this class:
 *   C1/C2 @0xd9980 (single body — C2 is ICF-folded onto C1)
 *   D1    @0xd99f0
 *   D0    @0xd9a00
 *   SetParameter    @0xda030 (7-instruction noop returning 0)
 *   GetDOD          @0xd9f30
 *   GetROI          @0xd9f50
 *   RenderTile      @0xd9be0 (throw-stub — 220 lines)
 *   RenderPageMetal @0xd9a10 (throw-stub — 131 lines)
 */
export class HGOverwrite {
  /**
   * `this->renderPageStrategy` at struct offset +0x10 (u32; inherited from
   * HGNode). Written by C1 @Helium 0xd99b0 as
   *   (old & ~0x600) | 0x400
   * Since HGNode's own C2 initialises this to 0x200, the numerically-
   * verified post-ctor value is 0x400.
   *
   * The exact meaning of the flag is opaque (frontier: HGNode.ts documents
   * the field but the enum table isn't yet decoded). Its role in this class
   * is that C1 rewrites it to 0x400 unconditionally.
   */
  renderPageStrategy: number = 0x200;

  /**
   * HGOverwrite::HGOverwrite()  [C1 — ICF-folded onto C2]  @Helium 0xd9980
   *
   * Mirrored control flow:
   *   @0xd998a  HGNode::HGNode()                       (base ctor on this)
   *   @0xd9996  this->vptr = vtable-for-HGOverwrite    (@0xa0c6b8; TS: noop)
   *   @0xd99a6  HGNode::SetFlags(-1, 1)                (frontier)
   *   @0xd99b0..0xd99b8  renderPageStrategy =
   *                          (renderPageStrategy & ~0x600) | 0x400
   *   @0xd99bf  ret
   */
  constructor() {
    // @0xd998a — base ctor. Frontier throws below.
    HGNode_C2(this);
    // @0xd9996 — this->vptr = vtable-for-HGOverwrite @0xa0c6b8.
    // TS: identity is the class itself.
    // @0xd99a6 — HGNode::SetFlags(-1, 1). Frontier throws.
    HGNode_SetFlags(this, -1, 1);
    // @0xd99ab..0xd99b8 — self-modify renderPageStrategy.
    //   The mask literal 0xfffff9ff = ~0x600 = clear bits 9 and 10.
    //   Then set bit 10 (0x400). Net effect: bit 9 (0x200) is cleared,
    //   bit 10 (0x400) is set, everything else preserved.
    this.renderPageStrategy =
      ((this.renderPageStrategy & 0xfffff9ff) | 0x400) >>> 0;
  }

  /**
   * HGOverwrite::SetParameter(int, float, float, float, float) -> int
   * @Helium 0xda030
   *
   * Full body: `xorl %eax,%eax ; retq`. Discards every argument and
   * returns 0. HGOverwrite has NO tunable parameters — any (idx, values)
   * call is a silent noop reporting "no change".
   *
   * @returns 0 always (the "no change" code — matches the Helium
   *          -1/0/1 return-code convention used across the family).
   */
  SetParameter(
    _paramIdx: number,
    _a: number,
    _b: number,
    _c: number,
    _d: number,
  ): number {
    // @0xda030..0xda037 xorl %eax,%eax ; retq
    return 0;
  }

  /**
   * HGOverwrite::GetDOD(HGRenderer* renderer, int mode, HGRect box) -> HGRect
   * @Helium 0xd9f30
   *
   * Mirrored control flow:
   *   @0xd9f30  ret.lo = box.lo                        (copy box's low 64b)
   *   @0xd9f33  if mode < 8:                           (unsigned compare @jb)
   *     @0xd9f4b  ret.hi = box.hi                      (r8 preserved)
   *     retq -> return `box`.
   *   else (mode >= 8):
   *     @0xd9f38..0xd9f4a  load _HGRectNull -> {ret.lo, ret.hi} = {0, 0}
   *     retq -> return _HGRectNull.
   *
   * The `mode` argument here is a slot-index (u32 in ABI). Unsigned compare:
   * negative values wrap to huge positives and take the >=8 branch — so
   * only mode in [0, 7] returns the input box.
   */
  GetDOD(_renderer: HGRenderer, mode: number, box: HGRect): HGRect {
    // @0xd9f33 cmpl $0x8, %edx ; jb 0xd9f4b
    //   The `cmpl $0x8, %edx` sets flags for (edx - 8). `jb` fires when
    //   CF=1, i.e. edx < 8 as UNSIGNED. This matches Helium's slot-index
    //   convention (u32).
    if ((mode >>> 0) < 8) {
      // @0xd9f4b return box unchanged.
      return box;
    }
    // @0xd9f38..0xd9f4a return _HGRectNull.
    return HGRectNull;
  }

  /**
   * HGOverwrite::GetROI(HGRenderer* renderer, int mode, HGRect box) -> HGRect
   * @Helium 0xd9f50
   *
   * See the block-level annotation above the class for the full asm
   * transcription. Algorithm (in TS-terms):
   *
   *   input0 = renderer.GetInput(this, mode)     // @0xd9f72
   *   dod0   = renderer.GetDOD(input0)           // @0xd9f7d
   *   roi    = HGRectIntersection(dod0, box)     // @0xd9f8e
   *   n      = HGNode::GetNumInputs()            // @0xd9fa3 vtable[0x70]
   *   for i = mode + 1 ; i < n ; i++:
   *     if HGRectIsNull(roi): break              // @0xd9fcd..d9fd4
   *     inputi = renderer.GetInput(this, i)      // @0xd9fdf
   *     if inputi is null: continue              // @0xd9fe4..d9fe7
   *     dodi = renderer.GetDOD(inputi)           // @0xd9fef
   *     if HGRectContainsRect(dodi, roi):        // @0xda000..da007
   *       roi = _HGRectNull                      // @0xda009..da017
   *     // else: keep roi unchanged
   *   return roi                                 // @0xda019
   *
   * The elision-only-on-FULL-COVER (never on partial cover) is intentional:
   * subtracting a partial cover from a rectangle produces a non-rectangular
   * region — Helium's HGRect can only express axis-aligned single rects, so
   * it drops the elision unless the cover is complete.
   */
  GetROI(renderer: HGRenderer, mode: number, box: HGRect): HGRect {
    // @0xd9f72 input0 = renderer.GetInput(this, mode)
    //   (uses the caller's %edx = mode implicitly — verified above)
    const input0 = HGRenderer_GetInput(renderer, this, mode);
    // @0xd9f7d dod0 = renderer.GetDOD(input0)
    //   The asm passes input0 straight in — even if it's null. On a real
    //   FCP render graph mode-0 is provably wired, so input0 is non-null;
    //   we mirror the asm and pass through. If some caller hits null here,
    //   the frontier GetDOD throws and surfaces the exact addr.
    if (input0 === null) {
      // Not in the asm — the asm dereferences unconditionally. We surface
      // the invariant so TS's type system stays sound.
      throw new Error(
        "HGOverwrite::GetROI @Helium 0xd9f7d: renderer.GetInput(this, mode) " +
          "returned null; the C++ contract assumes slot `mode` is wired.",
      );
    }
    const dod0 = HGRenderer_GetDOD(renderer, input0);
    // @0xd9f8e roi = HGRectIntersection(dod0, box)
    let roi = HGRectIntersection(dod0, box);
    // @0xd9fa3 n = HGNode::GetNumInputs() via vtable[0x70]
    const n = HGNode_GetNumInputs(this);
    // @0xd9fa6..0xd9faa loop: for i = mode+1 ; i < n ; ... but the asm does
    // an EARLY exit on i>=n BEFORE the first iteration. Preserve exactly.
    let i = (mode + 1) | 0;
    if (i >= n) {
      // @0xd9faa jge 0xda019 -> return roi
      return roi;
    }
    // @0xd9fc7 loop body top
    while (i < n) {
      // @0xd9fcd..0xd9fd4  if HGRectIsNull(roi) -> return
      if (HGRectIsNull(roi)) {
        return roi;
      }
      // @0xd9fdf inputi = renderer.GetInput(this, i)
      const inputi = HGRenderer_GetInput(renderer, this, i);
      // @0xd9fe4 testq %rax,%rax ; je 0xd9fc0 (continue)
      if (inputi !== null) {
        // @0xd9fef dodi = renderer.GetDOD(inputi)
        const dodi = HGRenderer_GetDOD(renderer, inputi);
        // @0xda000 HGRectContainsRect(dodi, roi)
        if (HGRectContainsRect(dodi, roi)) {
          // @0xda009..0xda017 roi = _HGRectNull ; continue
          roi = HGRectNull;
        }
        // else: keep roi as-is
      }
      // @0xd9fc0 i++
      i = (i + 1) | 0;
      // @0xd9fc2 cmpl %ebx, %r15d ; je 0xda019
      //   This is `if (n == i) return`. In the TS while-condition below,
      //   we check `i < n` — same result (i is monotonically incremented
      //   by 1, and starts at mode+1 which was already checked < n above).
    }
    // @0xda019 return roi
    return roi;
  }

  /**
   * HGOverwrite::RenderTile(HGTile* tile) — @Helium 0xd9be0 (220 lines).
   * The CPU pixel path. Defers to a dedicated decode pass (throwing frontier).
   */
  RenderTile(tile: object): void {
    HGOverwrite_RenderTile_body(this, tile);
  }

  /**
   * HGOverwrite::RenderPageMetal(HGPage* page) — @Helium 0xd9a10 (131 lines).
   * The Metal per-page path. Defers to a dedicated decode pass.
   */
  RenderPageMetal(page: object): void {
    HGOverwrite_RenderPageMetal_body(this, page);
  }
}

/**
 * Frontier-marker at module scope: exercising HGOverwrite's dtor path
 * reaches HGNode::~HGNode() @Helium 0xd99f0 (D1) / 0xd9a00 (D0). GC
 * subsumes ref-counting in TS; the throw-stub below is unreferenced but
 * documents the call site so a future dtor-decode pass finds it.
 */
export function __HGOverwrite_dtor_frontier(self: HGOverwrite): void {
  HGNode_D2(self);
}
