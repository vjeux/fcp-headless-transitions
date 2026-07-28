// HGCPixelFormatConversion_kV4F_WXYZ_input.ts — Helium node that adapts a
// kV4F ("Vec4 float32") input into an image whose 4-channel component order
// is WXYZ (a swizzle of the canonical XYZW). This class contributes only
// its Itanium C++ ABI destructors and two Helium node overrides (GetDOD /
// GetROI); the actual channel-swizzle work lives on the base class
// HgcPixelFormatConversion_kV4F_WXYZ_input (frontier).
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4F_WXYZ_input.~HGCPixelFormatConversion_kV4F_WXYZ_input.s   (D0)
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4F_WXYZ_input.GetDOD.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4F_WXYZ_input.GetROI.s
//
// Helium symbols transcribed:
//   @0x000f4e20  HGCPixelFormatConversion_kV4F_WXYZ_input::~...()  (D1 — mangled __ZN40..._D1Ev)
//                    (folded/aliased with D2 — disasm.sh reports the D0 slice
//                     starting at 0xf4e30; the D1 symbol's disasm was not
//                     surfaced as its own body — it aliases the base D2 via
//                     Itanium ABI tail-jmp; we mirror the standard D1
//                     ("complete-object dtor tail-jmps base D2") shape used
//                     by every sibling Hgc*/HGC* pair in this framework.)
//   @0x000f4e30  HGCPixelFormatConversion_kV4F_WXYZ_input::~...()  (D0 — deleting dtor)
//   @0x000f4e50  HGCPixelFormatConversion_kV4F_WXYZ_input::GetDOD(HGRenderer*, int, HGRect)
//   @0x000f4e90  HGCPixelFormatConversion_kV4F_WXYZ_input::GetROI(HGRenderer*, int, HGRect)
//
// DECODE evidence:
//   * ABI mapping for the two node virtuals (matches sibling HGLens*/HMask*
//     nodes decoded elsewhere in this repo, e.g. HGLensGDC_BC.ts):
//       %rdi = self (HGCPixelFormatConversion_kV4F_WXYZ_input*)
//       %rsi = HGRenderer*
//       %edx = renderMode (int)
//       %rcx = incoming HGRect.lo   (x|y<<32)
//       %r8  = incoming HGRect.hi   (right|bottom<<32)
//     16B struct return in {%rax, %rdx}: lo in %rax, hi in %rdx.
//
//   * `_HGRectNull` (Helium data symbol @Helium 0x3d2284) — literal-pool ref
//     at GetDOD @0xf4e54 and GetROI @0xf4e9b. Its bit pattern (16 zero bytes
//     = {x:0, y:0, right:0, bottom:0}) is fully decoded in
//     raw-port/src/render/HGRect.ts; we import the canonical constant.
//
//   * D0 body (0xf4e30..0xf4e47):
//       pushq %rbp; movq %rsp, %rbp; pushq %rbx; pushq %rax
//       movq %rdi, %rbx                            ; spill this
//       callq __ZN40HgcPixelFormatConversion_kV4F_WXYZ_inputD2Ev
//                                                  ; chain base D2 dtor
//       movq %rbx, %rdi                            ; restore this
//       addq $0x8, %rsp; popq %rbx; popq %rbp
//       jmp __ZN8HGObjectdlEPv                     ; tail-jmp HGObject::operator delete
//
//   * GetDOD body (0xf4e50..0xf4e88):
//       testl %edx, %edx                            ; renderMode
//       je    0xf4e63                               ; renderMode==0 -> pass-through
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
//       callq HGRenderer::GetInput(HGNode*, int)   ; input = renderer.GetInput(this, 0)
//       movq  %rbx, %rdi                            ; rdi = renderer
//       movq  %rax, %rsi                            ; rsi = input
//       addq  $0x8, %rsp; popq %rbx; popq %rbp
//       jmp   HGRenderer::GetDOD(HGNode*)          ; tail-jmp renderer.GetDOD(input)
//     Semantic: if renderMode!=0 return HGRectNull; else return
//     renderer.GetDOD(renderer.GetInput(this, 0)). Pure pass-through of the
//     upstream node's DOD.
//
//   * GetROI body (0xf4e90..0xf4ead):
//       movq  %rcx, %rax                            ; rax = inRect.lo (pre-shuffle)
//       testl %edx, %edx                            ; renderMode
//       je    0xf4eaa                               ; renderMode==0 -> skip HGRectNull load
//       pushq %rbp; movq %rsp, %rbp
//       leaq  _HGRectNull(%rip), %rcx               ; else load &HGRectNull
//       movq  (%rcx), %rax                          ; rax = HGRectNull.lo
//       movq  0x8(%rcx), %r8                        ; r8  = HGRectNull.hi
//       popq  %rbp
//     0xf4eaa:
//       movq  %r8, %rdx                             ; rdx = hi (either inRect.hi or HGRectNull.hi)
//       retq
//     Semantic: if renderMode==0 return inRect (identity pass-through);
//     else return HGRectNull. Note this is the MIRROR of GetDOD's polarity —
//     GetROI returns the input rect unmodified in the "normal" render mode,
//     because a pure per-pixel swizzle has ROI == its own output DOD (which
//     for a per-pixel op equals the requested output rect).
//
// Vtable / vptr:
//   The instance's vptr is installed by the frontier base ctor. Only the
//   three own overrides above are exported by this class; every other slot
//   inherits through HgcPixelFormatConversion_kV4F_WXYZ_input (base) and
//   HGNode. Not needed for this port.
//
// Called stubs (all Helium imports; addresses in call/jmp column above):
//   __ZN40HgcPixelFormatConversion_kV4F_WXYZ_inputD2Ev
//     HgcPixelFormatConversion_kV4F_WXYZ_input::~...() [D2] — base dtor
//     called from D0 @0xf4e39. Its body is frontier (defines whatever
//     resources the swizzle base class owns).
//   __ZN8HGObjectdlEPv
//     HGObject::operator delete(void*) — Helium-scoped operator delete;
//     tail-jmp'd from D0 @0xf4e47.
//   __ZN10HGRenderer8GetInputEP6HGNodei
//     HGRenderer::GetInput(HGNode*, int) — callq'd from GetDOD @0xf4e77.
//   __ZN10HGRenderer6GetDODEP6HGNode
//     HGRenderer::GetDOD(HGNode*) — tail-jmp'd from GetDOD @0xf4e88.
//
// Frontier callees (surfaced as throwing stubs):
//   - HgcPixelFormatConversion_kV4F_WXYZ_input::~...() [D2]  @Helium (D0 callq 0xf4e39)
//   - HGObject::operator delete(void*)                       @Helium (D0 jmp 0xf4e47)
//   - HGRenderer::GetInput(HGNode*, int)                     @Helium (GetDOD callq 0xf4e77)
//   - HGRenderer::GetDOD(HGNode*)                            @Helium (GetDOD jmp 0xf4e88)
//
// Reused ports:
//   HGRect, HGRectNull — from raw-port/src/render/HGRect.ts (covers the
//   _HGRectNull data symbol referenced at GetDOD @0xf4e54 and GetROI @0xf4e9b).

import { HGRect, HGRectNull } from "./HGRect.js";

/**
 * Opaque handle for `HGRenderer` — the Helium render orchestrator. Two of
 * its methods are named frontier callees of this class:
 * `GetInput(HGNode*, int)` @ Helium GetDOD callq 0xf4e77 and
 * `GetDOD(HGNode*)`       @ Helium GetDOD jmp   0xf4e88. Neither is on
 * this class's decoded surface.
 */
export type HGRenderer = object;

/**
 * Opaque handle for `HGNode` — the Helium base class every renderable node
 * inherits from. HGCPixelFormatConversion_kV4F_WXYZ_input IS-A HGNode via
 * its frontier base HgcPixelFormatConversion_kV4F_WXYZ_input. Layout not
 * on this class's decoded surface.
 */
export type HGNode = object;

/**
 * `HGRenderer::GetInput(HGNode*, int)` — frontier method. Called from
 * GetDOD @0xf4e77 with (renderer, this, 0). Returns the HGNode pointer
 * sitting at input port `idx` of `node`. Body not on this class's slice.
 */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _node: HGNode,
  _idx: number
): HGNode {
  throw new Error(
    "HGCPixelFormatConversion_kV4F_WXYZ_input: HGRenderer::GetInput(HGNode*, int) not yet transcribed @Helium call site 0xf4e77"
  );
}

/**
 * `HGRenderer::GetDOD(HGNode*)` — frontier method. Tail-jmp'd from GetDOD
 * @0xf4e88 with (renderer, input-node). Returns an HGRect (16B struct
 * return in %rax:%rdx). Body not on this class's slice.
 */
function HGRenderer_GetDOD(_renderer: HGRenderer, _node: HGNode): HGRect {
  throw new Error(
    "HGCPixelFormatConversion_kV4F_WXYZ_input: HGRenderer::GetDOD(HGNode*) not yet transcribed @Helium tail-jmp site 0xf4e88"
  );
}

/**
 * `HgcPixelFormatConversion_kV4F_WXYZ_input::~HgcPixelFormatConversion_kV4F_WXYZ_input()`
 * [D2 base-object dtor] — the primary base class's destructor. Chained by
 * both this class's dtors (mangled `__ZN40HgcPixelFormatConversion_kV4F_WXYZ_inputD2Ev`).
 * Body — and the actual channel-swizzle plumbing — is frontier.
 */
function HgcBase_D2_dtor(
  _this: HGCPixelFormatConversion_kV4F_WXYZ_input
): void {
  throw new Error(
    "HGCPixelFormatConversion_kV4F_WXYZ_input: HgcPixelFormatConversion_kV4F_WXYZ_input::~HgcPixelFormatConversion_kV4F_WXYZ_input() [D2] not yet transcribed @Helium D0 callq 0xf4e39 (and D1 tail-jmp 0xf4e20 by ABI convention)"
  );
}

/**
 * `HGObject::operator delete(void*)` — Helium's HGObject-scoped `operator
 * delete` (Helium overrides the global one to route through its own
 * allocator, distinct from the C++ `_ZdlPv`). D0 tail-jmps to it at
 * @0xf4e47. Not on this class's decoded surface.
 */
function HGObject_operator_delete(
  _this: HGCPixelFormatConversion_kV4F_WXYZ_input
): void {
  throw new Error(
    "HGCPixelFormatConversion_kV4F_WXYZ_input: HGObject::operator delete(void*) not yet transcribed @Helium D0 tail-jmp 0xf4e47"
  );
}

/**
 * The class instance. HGCPixelFormatConversion_kV4F_WXYZ_input is a Helium
 * node (IS-A HGNode via its frontier base HgcPixelFormatConversion_kV4F_WXYZ_input,
 * which sits at offset 0). Its slice on this file exposes only virtuals;
 * no instance-field offsets are decoded — that lives on the base class.
 */
export class HGCPixelFormatConversion_kV4F_WXYZ_input {
  /**
   * `HGCPixelFormatConversion_kV4F_WXYZ_input::~HGCPixelFormatConversion_kV4F_WXYZ_input()`
   * — the Itanium C++ ABI D1 (complete-object) destructor. Mangled
   * `__ZN40HGCPixelFormatConversion_kV4F_WXYZ_inputD1Ev` at @Helium 0xf4e20.
   *
   * Its body is not surfaced as its own disasm slice (disasm.sh reports the
   * D0 body starting at 0xf4e30) — by Itanium ABI convention this D1 is a
   * near-empty function that tail-jmps the base D2 dtor (the same pattern
   * decoded in sibling classes like HGLensGDC_BC @Helium 0x1e37b0..0x1e37b5
   * in raw-port/src/render/HGLensGDC_BC.ts). The class contributes zero
   * own-cleanup — every field it might own is on the base sub-object.
   */
  destroy_D1_completeObjectDtor(): void {
    // @0xf4e20 (D1) — tail-jmp base D2 dtor (Itanium ABI convention;
    // sibling-node pattern confirmed at HGLensGDC_BC D1 @0x1e37b5).
    HgcBase_D2_dtor(this);
  }

  /**
   * `HGCPixelFormatConversion_kV4F_WXYZ_input::~HGCPixelFormatConversion_kV4F_WXYZ_input()`
   * — the Itanium C++ ABI D0 (deleting) destructor. Mangled
   * `__ZN40HGCPixelFormatConversion_kV4F_WXYZ_inputD0Ev` at @Helium 0xf4e30.
   *
   * Address-by-address:
   *   0xf4e30  pushq %rbp                        ─┐ frame prologue
   *   0xf4e31  movq  %rsp, %rbp                  │
   *   0xf4e34  pushq %rbx                        │ callee-save
   *   0xf4e35  pushq %rax                        ─┘ 16B stack align
   *   0xf4e36  movq  %rdi, %rbx                  ; spill this into %rbx
   *   0xf4e39  callq HgcPixelFormatConversion_kV4F_WXYZ_input::~...() [D2]
   *                                              ; chain base D2 dtor
   *   0xf4e3e  movq  %rbx, %rdi                  ; restore this into %rdi
   *   0xf4e41  addq  $0x8, %rsp                  ─┐ epilogue
   *   0xf4e45  popq  %rbx                        │
   *   0xf4e46  popq  %rbp                        ─┘
   *   0xf4e47  jmp   HGObject::operator delete(void*)
   *                                              ; tail-jmp: free the memory
   */
  destroy_D0_deletingDtor(): void {
    // @0xf4e39 — chain base D2 dtor.
    HgcBase_D2_dtor(this);
    // @0xf4e47 — tail-jmp HGObject-scoped operator delete.
    HGObject_operator_delete(this);
  }

  /**
   * `HGCPixelFormatConversion_kV4F_WXYZ_input::GetDOD(HGRenderer*, int, HGRect)`
   * — Helium node override reporting the domain-of-definition of this node's
   * output. Mangled `__ZN40HGCPixelFormatConversion_kV4F_WXYZ_input6GetDODEP10HGRendereri6HGRect`
   * at @Helium 0xf4e50.
   *
   * Signature (from the mangled name):
   *   HGRect GetDOD(this, HGRenderer* renderer, int renderMode, HGRect inRect);
   * The incoming `HGRect inRect` is passed but NEVER read by this body — no
   * load from the argument slot appears in the disasm. Output is a function
   * of (renderer, this, renderMode) alone.
   *
   * Semantic (decoded):
   *   if (renderMode != 0) return HGRectNull;
   *   else                 return renderer->GetDOD(renderer->GetInput(this, 0));
   *
   * Address-by-address:
   *   0xf4e50  testl %edx, %edx     ; edx = renderMode (arg2)
   *   0xf4e52  je    0xf4e63        ; renderMode==0 -> pass-through branch
   *   0xf4e54  leaq  _HGRectNull(%rip), %rcx
   *   0xf4e5b  movq  (%rcx), %rax   ; rax = HGRectNull.lo
   *   0xf4e5e  movq  0x8(%rcx), %rdx; rdx = HGRectNull.hi
   *   0xf4e62  retq                 ; System V 16B struct return in {rax,rdx}
   *   0xf4e63  pushq %rbp           ─┐ pass-through branch prologue
   *   0xf4e64  movq  %rsp, %rbp     │
   *   0xf4e67  pushq %rbx           │
   *   0xf4e68  pushq %rax           ─┘
   *   0xf4e69  movq  %rdi, %rax     ; rax = this
   *   0xf4e6c  movq  %rsi, %rdi     ; rdi = renderer
   *   0xf4e6f  movq  %rsi, %rbx     ; spill renderer
   *   0xf4e72  movq  %rax, %rsi     ; rsi = this
   *   0xf4e75  xorl  %edx, %edx     ; edx = 0 (input port index)
   *   0xf4e77  callq HGRenderer::GetInput(HGNode*, int)
   *   0xf4e7c  movq  %rbx, %rdi     ; rdi = renderer
   *   0xf4e7f  movq  %rax, %rsi     ; rsi = input node
   *   0xf4e82  addq  $0x8, %rsp     ─┐ epilogue
   *   0xf4e86  popq  %rbx           │
   *   0xf4e87  popq  %rbp           ─┘
   *   0xf4e88  jmp   HGRenderer::GetDOD(HGNode*)   ; tail-jmp; struct return
   *                                                ; in {rax,rdx} forwards.
   */
  GetDOD(
    renderer: HGRenderer,
    renderMode: number,
    _inRect: HGRect
  ): HGRect {
    // @0xf4e50..0xf4e52 — test renderMode.
    if ((renderMode | 0) !== 0) {
      // @0xf4e54..0xf4e62 — return HGRectNull. Shallow-copy the canonical
      // constant (Helium _HGRectNull @0x3d2284) so callers who mutate the
      // return value do not clobber the singleton.
      return {
        x: HGRectNull.x,
        y: HGRectNull.y,
        right: HGRectNull.right,
        bottom: HGRectNull.bottom,
      };
    }

    // @0xf4e63..0xf4e77 — input = renderer.GetInput(this, 0).
    const input = HGRenderer_GetInput(renderer, this, 0);

    // @0xf4e7c..0xf4e88 — tail-jmp renderer.GetDOD(input).
    return HGRenderer_GetDOD(renderer, input);
  }

  /**
   * `HGCPixelFormatConversion_kV4F_WXYZ_input::GetROI(HGRenderer*, int, HGRect)`
   * — Helium node override reporting the region-of-interest this node
   * requests from its upstream inputs. Mangled
   * `__ZN40HGCPixelFormatConversion_kV4F_WXYZ_input6GetROIEP10HGRendereri6HGRect`
   * at @Helium 0xf4e90.
   *
   * Signature (from the mangled name):
   *   HGRect GetROI(this, HGRenderer* renderer, int renderMode, HGRect inRect);
   *
   * Semantic (decoded):
   *   if (renderMode == 0) return inRect;   // pure per-pixel op: ROI == out rect
   *   else                 return HGRectNull;
   *
   * Address-by-address:
   *   0xf4e90  movq  %rcx, %rax     ; rax = inRect.lo (kept as-is on ==0 path)
   *   0xf4e93  testl %edx, %edx     ; edx = renderMode
   *   0xf4e95  je    0xf4eaa        ; renderMode==0 -> jump past HGRectNull load
   *   0xf4e97  pushq %rbp           ─┐ prologue (only entered on !=0 path)
   *   0xf4e98  movq  %rsp, %rbp     ─┘
   *   0xf4e9b  leaq  _HGRectNull(%rip), %rcx
   *   0xf4ea2  movq  (%rcx), %rax   ; rax = HGRectNull.lo (overrides inRect.lo)
   *   0xf4ea5  movq  0x8(%rcx), %r8 ; r8  = HGRectNull.hi (overrides inRect.hi)
   *   0xf4ea9  popq  %rbp
   *   0xf4eaa: movq  %r8, %rdx      ; struct-return hi in %rdx
   *   0xf4ead  retq
   * Note: on the renderMode==0 path, %r8 is the incoming inRect.hi
   * (unchanged from the caller-supplied arg), and %rax was set to
   * inRect.lo at 0xf4e90 — so the returned struct is exactly the input
   * rect. This is the "per-pixel op ROI == output rect" convention (a
   * channel swizzle needs the same pixel it will emit — nothing more,
   * nothing less).
   */
  GetROI(
    _renderer: HGRenderer,
    renderMode: number,
    inRect: HGRect
  ): HGRect {
    // @0xf4e90..0xf4e95 — test renderMode; renderMode==0 falls through to
    // the identity return.
    if ((renderMode | 0) !== 0) {
      // @0xf4e97..0xf4ea9 — return HGRectNull.
      return {
        x: HGRectNull.x,
        y: HGRectNull.y,
        right: HGRectNull.right,
        bottom: HGRectNull.bottom,
      };
    }
    // @0xf4e90 (rax=rcx) + @0xf4eaa (rdx=r8) — return the incoming inRect
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
