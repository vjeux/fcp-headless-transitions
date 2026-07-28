// HGCPixelFormatConversion_kV4F_WXYZ_output.ts — Helium node that adapts a
// kV4F ("Vec4 float32") output whose 4-channel component order is WXYZ
// (a swizzle of the canonical XYZW). Bit-identical class shape to its
// _input sibling (HGCPixelFormatConversion_kV4F_WXYZ_input.ts) — only the
// per-pixel swizzle direction differs, and that direction lives on the
// (frontier) base class. Transcribed from the x86_64 slice of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium.
//
// Source disassembly (otool -tV):
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4F_WXYZ_output.~HGCPixelFormatConversion_kV4F_WXYZ_output.s   (D0)
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4F_WXYZ_output.GetOutput.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4F_WXYZ_output.GetDOD.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4F_WXYZ_output.GetROI.s
//
// Helium symbols transcribed:
//   @0x000fd300  HGCPixelFormatConversion_kV4F_WXYZ_output::~...()  (D1 — thunk to base D2)
//   @0x000fd310  HGCPixelFormatConversion_kV4F_WXYZ_output::~...()  (D0 — deleting dtor)
//   @0x000fd330  HGCPixelFormatConversion_kV4F_WXYZ_output::GetOutput(HGRenderer*)
//   @0x000fd340  HGCPixelFormatConversion_kV4F_WXYZ_output::GetDOD(HGRenderer*, int, HGRect)
//   @0x000fd380  HGCPixelFormatConversion_kV4F_WXYZ_output::GetROI(HGRenderer*, int, HGRect)
//
// DECODE evidence:
//   * ABI mapping for the three node virtuals (matches sibling nodes decoded
//     elsewhere in this repo — e.g. HGCPixelFormatConversion_kV4F_WXYZ_input,
//     HGCColorGamma_2vuy_xyxz_collapse):
//       %rdi = self (HGCPixelFormatConversion_kV4F_WXYZ_output*)
//       %rsi = HGRenderer*
//       %edx = renderMode (int)
//       %rcx = incoming HGRect.lo   (x|y<<32)
//       %r8  = incoming HGRect.hi   (right|bottom<<32)
//     16B struct return in {%rax, %rdx}: lo in %rax, hi in %rdx.
//
//   * `_HGRectNull` (Helium data symbol; canonical constant in HGRect.ts) —
//     literal-pool ref at GetDOD @0xfd344 and GetROI @0xfd38b. Its bit
//     pattern (16 zero bytes = {x:0, y:0, right:0, bottom:0}) is fully
//     decoded in raw-port/src/render/HGRect.ts.
//
//   * D1 body (0xfd300..0xfd305) — a null-frame thunk:
//       pushq %rbp; movq %rsp, %rbp; popq %rbp
//       jmp   __ZN41HgcPixelFormatConversion_kV4F_WXYZ_outputD2Ev
//     Just tail-jmps the base D2 dtor. Standard Itanium D1 shape for a
//     class with no own destructor logic.
//
//   * D0 body (0xfd310..0xfd327):
//       pushq %rbp; movq %rsp, %rbp; pushq %rbx; pushq %rax
//       movq %rdi, %rbx                            ; spill this
//       callq __ZN41HgcPixelFormatConversion_kV4F_WXYZ_outputD2Ev
//                                                  ; chain base D2 dtor
//       movq %rbx, %rdi                            ; restore this
//       addq $0x8, %rsp; popq %rbx; popq %rbp
//       jmp __ZN8HGObjectdlEPv                     ; tail-jmp HGObject-scoped
//                                                  ; operator delete
//
//   * GetOutput body (0xfd330..0xfd338):
//       pushq %rbp; movq %rsp, %rbp
//       movq %rdi, %rax                            ; rax = this
//       popq %rbp; retq                            ; return this
//     Trivial one-instruction pass-through: the node IS its own output slot
//     (same shape as every other HGC node's GetOutput).
//
//   * GetDOD body (0xfd340..0xfd378):
//       testl %edx, %edx                            ; renderMode
//       je    0xfd353                               ; renderMode==0 -> pass-through
//       leaq  _HGRectNull(%rip), %rcx               ; else load &HGRectNull
//       movq  (%rcx), %rax                          ; rax = HGRectNull.lo
//       movq  0x8(%rcx), %rdx                       ; rdx = HGRectNull.hi
//       retq                                        ; return HGRectNull
//     Pass-through branch (renderMode==0):
//       pushq %rbp; movq %rsp, %rbp; pushq %rbx; pushq %rax
//       movq  %rdi, %rax                            ; rax = this
//       movq  %rsi, %rdi                            ; rdi = renderer
//       movq  %rsi, %rbx                            ; spill renderer
//       movq  %rax, %rsi                            ; rsi = this
//       xorl  %edx, %edx                            ; edx = 0 (input index)
//       callq HGRenderer::GetInput(HGNode*, int)    ; input = renderer.GetInput(this, 0)
//       movq  %rbx, %rdi                            ; rdi = renderer
//       movq  %rax, %rsi                            ; rsi = input
//       addq  $0x8, %rsp; popq %rbx; popq %rbp
//       jmp   HGRenderer::GetDOD(HGNode*)           ; tail-jmp renderer.GetDOD(input)
//     Semantic: if renderMode!=0 return HGRectNull; else return
//     renderer.GetDOD(renderer.GetInput(this, 0)). Pure pass-through of the
//     upstream node's DOD.
//
//   * GetROI body (0xfd380..0xfd39d):
//       movq  %rcx, %rax                            ; rax = inRect.lo (pre-shuffle)
//       testl %edx, %edx                            ; renderMode
//       je    0xfd39a                               ; renderMode==0 -> skip HGRectNull load
//       pushq %rbp; movq %rsp, %rbp
//       leaq  _HGRectNull(%rip), %rcx               ; else load &HGRectNull
//       movq  (%rcx), %rax                          ; rax = HGRectNull.lo (overrides inRect.lo)
//       movq  0x8(%rcx), %r8                        ; r8  = HGRectNull.hi (overrides inRect.hi)
//       popq  %rbp
//     0xfd39a:
//       movq  %r8, %rdx                             ; rdx = hi (either inRect.hi or HGRectNull.hi)
//       retq
//     Semantic: if renderMode==0 return inRect (identity pass-through);
//     else return HGRectNull. This is the MIRROR of GetDOD's polarity —
//     GetROI returns the input rect unmodified in the "normal" render mode,
//     because a pure per-pixel swizzle has ROI == its own output DOD (which
//     for a per-pixel op equals the requested output rect).
//
// Called stubs (all Helium imports; addresses in call/jmp column above):
//   __ZN41HgcPixelFormatConversion_kV4F_WXYZ_outputD2Ev
//     HgcPixelFormatConversion_kV4F_WXYZ_output::~...() [D2] — base dtor
//     tail-jmp'd from D1 @0xfd305, callq'd from D0 @0xfd319.
//   __ZN8HGObjectdlEPv
//     HGObject::operator delete(void*) — tail-jmp'd from D0 @0xfd327.
//   __ZN10HGRenderer8GetInputEP6HGNodei
//     HGRenderer::GetInput(HGNode*, int) — callq'd from GetDOD @0xfd367.
//   __ZN10HGRenderer6GetDODEP6HGNode
//     HGRenderer::GetDOD(HGNode*) — tail-jmp'd from GetDOD @0xfd378.
//
// Reused ports:
//   HGRect, HGRectNull — from raw-port/src/render/HGRect.ts (covers the
//   _HGRectNull data symbol referenced at GetDOD @0xfd344 and GetROI
//   @0xfd38b).

import { HGRect, HGRectNull } from "./HGRect.js";

/**
 * Opaque handle for `HGRenderer` — the Helium render orchestrator. Two of
 * its methods are named frontier callees of this class:
 * `GetInput(HGNode*, int)` @ Helium GetDOD callq 0xfd367 and
 * `GetDOD(HGNode*)`       @ Helium GetDOD jmp   0xfd378. Neither is on
 * this class's decoded surface.
 */
export type HGRenderer = object;

/**
 * Opaque handle for `HGNode` — the Helium base class every renderable node
 * inherits from. HGCPixelFormatConversion_kV4F_WXYZ_output IS-A HGNode via
 * its frontier base HgcPixelFormatConversion_kV4F_WXYZ_output. Layout not
 * on this class's decoded surface.
 */
export type HGNode = object;

/**
 * `HGRenderer::GetInput(HGNode*, int)` — frontier method. Called from
 * GetDOD @0xfd367 with (renderer, this, 0). Returns the HGNode pointer
 * sitting at input port `idx` of `node`. Body not on this class's slice.
 */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _node: HGNode,
  _idx: number,
): HGNode {
  // raise: undecoded renderer input lookup. Cited: @0xfd367.
  throw new Error(
    "HGCPixelFormatConversion_kV4F_WXYZ_output: HGRenderer::GetInput(HGNode*, int) not yet transcribed @Helium call site 0xfd367",
  );
}

/**
 * `HGRenderer::GetDOD(HGNode*)` — frontier method. Tail-jmp'd from GetDOD
 * @0xfd378 with (renderer, input-node). Returns an HGRect (16B struct
 * return in %rax:%rdx). Body not on this class's slice.
 */
function HGRenderer_GetDOD(_renderer: HGRenderer, _node: HGNode): HGRect {
  // raise: undecoded renderer DOD accessor. Cited: @0xfd378.
  throw new Error(
    "HGCPixelFormatConversion_kV4F_WXYZ_output: HGRenderer::GetDOD(HGNode*) not yet transcribed @Helium tail-jmp site 0xfd378",
  );
}

/**
 * `HgcPixelFormatConversion_kV4F_WXYZ_output::~HgcPixelFormatConversion_kV4F_WXYZ_output()`
 * [D2 base-object dtor] — the primary base class's destructor. Mangled
 * `__ZN41HgcPixelFormatConversion_kV4F_WXYZ_outputD2Ev`. Chained by both
 * this class's dtors — tail-jmp'd from D1 @0xfd305 and callq'd from D0
 * @0xfd319. Body — and the actual channel-swizzle plumbing — is frontier.
 */
function HgcBase_D2_dtor(
  _this: HGCPixelFormatConversion_kV4F_WXYZ_output,
): void {
  // raise: undecoded base dtor. Cited: @0xfd305 (D1 tail), @0xfd319 (D0 direct).
  throw new Error(
    "HGCPixelFormatConversion_kV4F_WXYZ_output: HgcPixelFormatConversion_kV4F_WXYZ_output::~...() [D2] not yet transcribed @Helium D1 tail-jmp 0xfd305 / D0 callq 0xfd319",
  );
}

/**
 * `HGObject::operator delete(void*)` — Helium's HGObject-scoped `operator
 * delete` (Helium overrides the global one to route through its own
 * allocator, distinct from the C++ `_ZdlPv`). D0 tail-jmps to it at
 * @0xfd327. Not on this class's decoded surface.
 */
function HGObject_operator_delete(
  _this: HGCPixelFormatConversion_kV4F_WXYZ_output,
): void {
  // raise: undecoded deallocator. Cited: @0xfd327.
  throw new Error(
    "HGCPixelFormatConversion_kV4F_WXYZ_output: HGObject::operator delete(void*) not yet transcribed @Helium D0 tail-jmp 0xfd327",
  );
}

/**
 * The class instance. HGCPixelFormatConversion_kV4F_WXYZ_output is a
 * Helium node (IS-A HGNode via its frontier base
 * HgcPixelFormatConversion_kV4F_WXYZ_output, which sits at offset 0). Its
 * slice on this file exposes only virtuals; no instance-field offsets are
 * decoded — that lives on the base class.
 */
export class HGCPixelFormatConversion_kV4F_WXYZ_output {
  /**
   * ~HGCPixelFormatConversion_kV4F_WXYZ_output() [D1 — complete-object]
   * @Helium 0xfd300, mangled __ZN41HGCPixelFormatConversion_kV4F_WXYZ_outputD1Ev.
   *
   *   0xfd300  pushq %rbp                          ─┐ null frame — no callee-saves
   *   0xfd301  movq  %rsp, %rbp                    │ or stack used
   *   0xfd304  popq  %rbp                          ─┘
   *   0xfd305  jmp   HgcPixelFormatConversion_kV4F_WXYZ_output::~...() [D2]
   *
   * Bare tail-call into the base dtor. No own-cleanup — every field this
   * class might own is on the base sub-object.
   */
  destroy_D1_completeObjectDtor(): void {
    // @0xfd305 — tail-jmp base D2 dtor.
    HgcBase_D2_dtor(this);
  }

  /**
   * ~HGCPixelFormatConversion_kV4F_WXYZ_output() [D0 — deleting]
   * @Helium 0xfd310, mangled __ZN41HGCPixelFormatConversion_kV4F_WXYZ_outputD0Ev.
   *
   *   0xfd310  pushq %rbp                          ─┐ frame prologue
   *   0xfd311  movq  %rsp, %rbp                    │
   *   0xfd314  pushq %rbx                          │ callee-save
   *   0xfd315  pushq %rax                          ─┘ 16B stack align
   *   0xfd316  movq  %rdi, %rbx                    ; spill this into %rbx
   *   0xfd319  callq HgcPixelFormatConversion_kV4F_WXYZ_output::~...() [D2]
   *                                                ; chain base D2 dtor
   *   0xfd31e  movq  %rbx, %rdi                    ; restore this into %rdi
   *   0xfd321  addq  $0x8, %rsp                    ─┐ epilogue
   *   0xfd325  popq  %rbx                          │
   *   0xfd326  popq  %rbp                          ─┘
   *   0xfd327  jmp   HGObject::operator delete(void*)
   *                                                ; tail-jmp: free the memory
   */
  destroy_D0_deletingDtor(): void {
    // @0xfd319 — chain base D2 dtor.
    HgcBase_D2_dtor(this);
    // @0xfd327 — tail-jmp HGObject-scoped operator delete.
    HGObject_operator_delete(this);
  }

  /**
   * GetOutput(HGRenderer*) @Helium 0xfd330,
   * mangled __ZN41HGCPixelFormatConversion_kV4F_WXYZ_output9GetOutputEP10HGRenderer.
   *
   *   0xfd330  pushq %rbp
   *   0xfd331  movq  %rsp, %rbp
   *   0xfd334  movq  %rdi, %rax     ; rax = this
   *   0xfd337  popq  %rbp
   *   0xfd338  retq
   *
   * Trivially returns `this` — the node IS its own output slot. rdi is
   * the C++ `this` per Itanium ABI.
   */
  GetOutput(_renderer: HGRenderer): HGCPixelFormatConversion_kV4F_WXYZ_output {
    return this; // @0xfd334
  }

  /**
   * GetDOD(HGRenderer* renderer, int renderMode, HGRect inRect)
   * @Helium 0xfd340, mangled
   * __ZN41HGCPixelFormatConversion_kV4F_WXYZ_output6GetDODEP10HGRendereri6HGRect.
   *
   * The incoming `HGRect inRect` is passed but NEVER read by this body — no
   * load from the argument slot appears in the disasm. Output is a function
   * of (renderer, this, renderMode) alone.
   *
   * Semantic (decoded):
   *   if (renderMode != 0) return HGRectNull;
   *   else                 return renderer->GetDOD(renderer->GetInput(this, 0));
   *
   * Address-by-address:
   *   0xfd340  testl %edx, %edx     ; edx = renderMode (arg2)
   *   0xfd342  je    0xfd353        ; renderMode==0 -> pass-through branch
   *   0xfd344  leaq  _HGRectNull(%rip), %rcx
   *   0xfd34b  movq  (%rcx), %rax   ; rax = HGRectNull.lo
   *   0xfd34e  movq  0x8(%rcx), %rdx; rdx = HGRectNull.hi
   *   0xfd352  retq                 ; System V 16B struct return in {rax,rdx}
   *   0xfd353  pushq %rbp           ─┐ pass-through branch prologue
   *   0xfd354  movq  %rsp, %rbp     │
   *   0xfd357  pushq %rbx           │
   *   0xfd358  pushq %rax           ─┘
   *   0xfd359  movq  %rdi, %rax     ; rax = this
   *   0xfd35c  movq  %rsi, %rdi     ; rdi = renderer
   *   0xfd35f  movq  %rsi, %rbx     ; spill renderer
   *   0xfd362  movq  %rax, %rsi     ; rsi = this
   *   0xfd365  xorl  %edx, %edx     ; edx = 0 (input port index)
   *   0xfd367  callq HGRenderer::GetInput(HGNode*, int)
   *   0xfd36c  movq  %rbx, %rdi     ; rdi = renderer
   *   0xfd36f  movq  %rax, %rsi     ; rsi = input node
   *   0xfd372  addq  $0x8, %rsp     ─┐ epilogue
   *   0xfd376  popq  %rbx           │
   *   0xfd377  popq  %rbp           ─┘
   *   0xfd378  jmp   HGRenderer::GetDOD(HGNode*)   ; tail-jmp; struct return
   *                                                ; in {rax,rdx} forwards.
   */
  GetDOD(
    renderer: HGRenderer,
    renderMode: number,
    _inRect: HGRect,
  ): HGRect {
    // @0xfd340..0xfd342 — test renderMode.
    if ((renderMode | 0) !== 0) {
      // @0xfd344..0xfd352 — return HGRectNull. Shallow-copy the canonical
      // constant so callers who mutate the return value do not clobber the
      // singleton.
      return {
        x: HGRectNull.x,
        y: HGRectNull.y,
        right: HGRectNull.right,
        bottom: HGRectNull.bottom,
      };
    }

    // @0xfd353..0xfd367 — input = renderer.GetInput(this, 0).
    const input = HGRenderer_GetInput(renderer, this, 0);

    // @0xfd36c..0xfd378 — tail-jmp renderer.GetDOD(input).
    return HGRenderer_GetDOD(renderer, input);
  }

  /**
   * GetROI(HGRenderer* renderer, int renderMode, HGRect inRect)
   * @Helium 0xfd380, mangled
   * __ZN41HGCPixelFormatConversion_kV4F_WXYZ_output6GetROIEP10HGRendereri6HGRect.
   *
   * Semantic (decoded):
   *   if (renderMode == 0) return inRect;   // pure per-pixel op: ROI == out rect
   *   else                 return HGRectNull;
   *
   * Address-by-address:
   *   0xfd380  movq  %rcx, %rax     ; rax = inRect.lo (kept as-is on ==0 path)
   *   0xfd383  testl %edx, %edx     ; edx = renderMode
   *   0xfd385  je    0xfd39a        ; renderMode==0 -> jump past HGRectNull load
   *   0xfd387  pushq %rbp           ─┐ prologue (only entered on !=0 path)
   *   0xfd388  movq  %rsp, %rbp     ─┘
   *   0xfd38b  leaq  _HGRectNull(%rip), %rcx
   *   0xfd392  movq  (%rcx), %rax   ; rax = HGRectNull.lo (overrides inRect.lo)
   *   0xfd395  movq  0x8(%rcx), %r8 ; r8  = HGRectNull.hi (overrides inRect.hi)
   *   0xfd399  popq  %rbp
   *   0xfd39a: movq  %r8, %rdx      ; struct-return hi in %rdx
   *   0xfd39d  retq
   * Note: on the renderMode==0 path, %r8 is the incoming inRect.hi
   * (unchanged from the caller-supplied arg), and %rax was set to
   * inRect.lo at 0xfd380 — so the returned struct is exactly the input
   * rect. This is the "per-pixel op ROI == output rect" convention (a
   * channel swizzle needs the same pixel it will emit — nothing more,
   * nothing less).
   */
  GetROI(
    _renderer: HGRenderer,
    renderMode: number,
    inRect: HGRect,
  ): HGRect {
    // @0xfd380..0xfd385 — test renderMode; renderMode==0 falls through to
    // the identity return.
    if ((renderMode | 0) !== 0) {
      // @0xfd387..0xfd399 — return HGRectNull.
      return {
        x: HGRectNull.x,
        y: HGRectNull.y,
        right: HGRectNull.right,
        bottom: HGRectNull.bottom,
      };
    }
    // @0xfd380 (rax=rcx) + @0xfd39a (rdx=r8) — return the incoming inRect
    // unmodified. Shallow-copy for callee-mutation isolation (the C++ ABI
    // returns by value, so callers own the returned struct).
    return {
      x: inRect.x,
      y: inRect.y,
      right: inRect.right,
      bottom: inRect.bottom,
    };
  }
}
