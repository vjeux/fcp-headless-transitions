// HGCColorGamma_chroma_downsample_f1 — Helium HGNode wrapper for a chroma
// horizontal-downsample filter that runs in the "float32-1-channel" (f1)
// color-gamma path. Named "HGC" (capital G, capital C) is Helium's HGNode
// wrapper convention over a lowercase-"Hgc" base class that carries the
// actual per-tile shader machinery.
//
// FROM this class's decoded surface we only see FOUR own exported symbols
// (nm evidence from Helium `_symmap.tsv` for the FCP-shipped x86_64 slice):
//   00000000000fd570 t __ZN34HGCColorGamma_chroma_downsample_f1D1Ev
//   00000000000fd580 t __ZN34HGCColorGamma_chroma_downsample_f1D0Ev
//   00000000000fd5a0 t __ZN34HGCColorGamma_chroma_downsample_f16GetDODEP10HGRendereri6HGRect
//   00000000000fd5e0 t __ZN34HGCColorGamma_chroma_downsample_f16GetROIEP10HGRendereri6HGRect
//
// The class inherits (single inheritance — the D1 dtor's body is a plain
// tail-jmp to `HgcColorGamma_chroma_downsample_f1::~HgcColorGamma_chroma_downsample_f1()`
// [D2], confirming the primary base is at offset 0) from a lowercase-"Hgc"
// sibling that owns all the actual render infrastructure exports:
//   HgcColorGamma_chroma_downsample_f1::GetProgram, RenderTile, BindTexture,
//   GetParameter, SetParameter, Bind, GetOutput, plus C1/C2/D0/D1/D2 slots
// (nm evidence: `grep HgcColorGamma_chroma_downsample_f1 Helium_symmap.tsv`
//  returns those 8 methods + a full ctor/dtor set — none of them are on
//  THIS class's own surface). The lowercase base is itself an HGNode
//  subclass — same Helium pattern already documented on HGLensGDC_BC where
//  the capital wrapper only exports {D0, D1, GetDOD (and here also GetROI)}
//  and everything else lives on the lowercase base.
//
// Faithful transcription of exactly FOUR exported symbols. Source disasm
// dumped via raw-port/tools/disasm.sh under raw-port/re/disasm/:
//   Helium.HGCColorGamma_chroma_downsample_f1.GetDOD.s   (GetDOD  @0xfd5a0)
//   Helium.HGCColorGamma_chroma_downsample_f1.GetROI.s   (GetROI  @0xfd5e0)
// The two dtors were recovered via an awk pull on the Helium `_tV.txt`
// (`__ZN34HGCColorGamma_chroma_downsample_f1D1Ev:` and D0Ev). Framework:
// Final Cut Pro / Helium.framework.
//
// Source disassembly:
//
// (D1 — complete-object dtor)
//   __ZN34HGCColorGamma_chroma_downsample_f1D1Ev:
//     0xfd570 pushq %rbp
//     0xfd571 movq  %rsp, %rbp
//     0xfd574 popq  %rbp
//     0xfd575 jmp   __ZN34HgcColorGamma_chroma_downsample_f1D2Ev
//                                                        ; HgcColorGamma_chroma_downsample_f1::~Hgc...()
//     0xfd57a nopw  (%rax,%rax)                          ; alignment padding
//
// (D0 — deleting dtor)
//   __ZN34HGCColorGamma_chroma_downsample_f1D0Ev:
//     0xfd580 pushq %rbp
//     0xfd581 movq  %rsp, %rbp
//     0xfd584 pushq %rbx
//     0xfd585 pushq %rax                                 ; 16B stack align
//     0xfd586 movq  %rdi, %rbx                           ; spill this
//     0xfd589 callq __ZN34HgcColorGamma_chroma_downsample_f1D2Ev
//                                                        ; chain base dtor
//     0xfd58e movq  %rbx, %rdi                           ; this again
//     0xfd591 addq  $0x8, %rsp
//     0xfd595 popq  %rbx
//     0xfd596 popq  %rbp
//     0xfd597 jmp   __ZN8HGObjectdlEPv                   ; tail-jmp HGObject::operator delete
//     0xfd59c nopl  (%rax)                               ; alignment
//
// (GetDOD)
//   __ZN34HGCColorGamma_chroma_downsample_f16GetDODEP10HGRendereri6HGRect:
//     0xfd5a0 testl %edx, %edx                           ; arg2 int (render-mode enum)
//     0xfd5a2 je    0xfd5b3                              ; edx==0 -> normal
//     0xfd5a4 leaq  _HGRectNull(%rip), %rcx              ; else return HGRectNull
//     0xfd5ab movq  (%rcx), %rax                         ; return.lo = HGRectNull.lo
//     0xfd5ae movq  0x8(%rcx), %rdx                      ; return.hi = HGRectNull.hi
//     0xfd5b2 retq                                       ; 16B struct return in {rax,rdx}
//     0xfd5b3 pushq %rbp                                 ; NORMAL branch — set up frame
//     0xfd5b4 movq  %rsp, %rbp
//     0xfd5b7 pushq %rbx
//     0xfd5b8 pushq %rax                                 ; 16B align
//     0xfd5b9 movq  %rdi, %rax                           ; rax = this
//     0xfd5bc movq  %rsi, %rdi                           ; rdi = renderer
//     0xfd5bf movq  %rsi, %rbx                           ; rbx = renderer (spill)
//     0xfd5c2 movq  %rax, %rsi                           ; rsi = this
//     0xfd5c5 xorl  %edx, %edx                           ; edx = 0 (input index)
//     0xfd5c7 callq __ZN10HGRenderer8GetInputEP6HGNodei  ; HGRenderer::GetInput(this,0)
//     0xfd5cc movq  %rbx, %rdi                           ; rdi = renderer
//     0xfd5cf movq  %rax, %rsi                           ; rsi = input
//     0xfd5d2 addq  $0x8, %rsp
//     0xfd5d6 popq  %rbx
//     0xfd5d7 popq  %rbp
//     0xfd5d8 jmp   __ZN10HGRenderer6GetDODEP6HGNode     ; tail-jmp GetDOD(input)
//     0xfd5dd nopl  (%rax)                               ; padding
//
// (GetROI)
//   __ZN34HGCColorGamma_chroma_downsample_f16GetROIEP10HGRendereri6HGRect:
//     0xfd5e0 pushq %rbp
//     0xfd5e1 movq  %rsp, %rbp
//     0xfd5e4 testl %edx, %edx                           ; arg2 int (render-mode enum)
//     0xfd5e6 je    0xfd601                              ; edx==0 -> normal branch
//     0xfd5e8 leaq  _HGRectNull(%rip), %rax              ; else return HGRectNull
//     0xfd5ef movdqu (%rax), %xmm0
//     0xfd5f3 movq  %xmm0, %rax                          ; return.lo = HGRectNull.lo
//     0xfd5f8 pextrq $0x1, %xmm0, %rdx                   ; return.hi = HGRectNull.hi
//     0xfd5ff popq  %rbp
//     0xfd600 retq
//     0xfd601 movq  %r8, %xmm0                           ; xmm0[63:0] = arg.hi qword ({right,bottom})
//     0xfd606 movq  %rcx, %xmm1                          ; xmm1[63:0] = arg.lo qword ({x,y})
//     0xfd60b punpcklqdq %xmm0, %xmm1                    ; xmm1 = {x,y,right,bottom} as 4x i32
//     0xfd60f movdqa 0x2d24b9(%rip), %xmm0               ; @0xfd617+0x2d24b9 = @0x3cfad0
//                                                          ; = 4x i32 [-1, 0, +1, 0]
//                                                          ; = 2x i64 [0x00000000_ffffffff,
//                                                          ;           0x00000000_00000001]
//     0xfd617 paddq  %xmm1, %xmm0                        ; per-qword add (2x i64)
//                                                          ; low  qword += 0x00000000_ffffffff
//                                                          ; high qword += 0x00000000_00000001
//                                                          ; net effect on the low 32 of each qword:
//                                                          ;   x     -> x - 1   (with carry into y lane)
//                                                          ;   right -> right+1 (with carry into bottom lane)
//                                                          ; -- the corrupted y/bottom lanes are
//                                                          ; immediately discarded by the pblendw
//                                                          ; below, which restores them from xmm1.
//     0xfd61b pblendw $0xcc, %xmm1, %xmm0                ; imm8=0b11001100 -> for each 16-bit lane
//                                                          ;   lanes 0,1 (x low32)       kept from xmm0 (= x-1)
//                                                          ;   lanes 2,3 (y low32)       taken from xmm1 (= y   , restored)
//                                                          ;   lanes 4,5 (right low32)   kept from xmm0 (= right+1)
//                                                          ;   lanes 6,7 (bottom low32)  taken from xmm1 (= bottom, restored)
//                                                          ; final xmm0 = {x-1, y, right+1, bottom}
//     0xfd621 movq   %xmm0, %rax                         ; return.lo = {x-1, y}
//     0xfd626 pextrq $0x1, %xmm0, %rdx                   ; return.hi = {right+1, bottom}
//     0xfd62d popq   %rbp
//     0xfd62e retq
//     0xfd62f nop                                        ; padding, next symbol at 0xfd630
//
// RIP-relative data constant read directly from the Helium binary:
//   @0x3cfad0  16 bytes = ff ff ff ff 00 00 00 00 01 00 00 00 00 00 00 00
//              = 4x int32 [ -1, 0, +1, 0 ]
//              = 2x int64 [ 0x00000000_ffffffff, 0x00000000_00000001 ]
//   (bytes verified by xxd/dd of the x86_64 slice at file-offset 0x3cfad0+0x4000)
//
// Semantics decoded:
//
//   GetDOD is a pure pass-through: this node has ONE input (index 0), and
//   its output DOD is exactly its input's DOD — chroma downsampling neither
//   adds nor removes writable pixels from the frame's domain-of-definition.
//   (Downsampling does REDUCE the resolution of the chroma plane, but this
//   node still outputs at the SAME rect as its input — the chroma channel
//   is just filtered horizontally.)
//
//   GetROI expands the requested output rect by +1 pixel LEFT and +1 pixel
//   RIGHT (i.e. it needs a 3-pixel horizontal window in the input to
//   produce each output pixel). Vertical extent is unchanged — this is a
//   HORIZONTAL-only chroma downsample. This is the classic 1D chroma
//   siting/subsampling filter: for MPEG-style 4:2:2 -> 4:2:0 horizontal
//   subsampling you need the target column's left and right neighbours to
//   evaluate a 3-tap kernel; the ROI grow reflects exactly that support.
//
//   Both methods short-circuit to HGRectNull when the mode-enum arg (%edx)
//   is non-zero. This is Helium's convention for "estimate/thumbnail/
//   wireframe" render modes — the node declines to declare a DOD or an
//   ROI, forcing the renderer to skip it.
//
// Vtable — installed vptr for this class is at Helium's __ZTV34HGCColorGamma_chroma_downsample_f1
// (typeinfo at __ZTI34HGCColorGamma_chroma_downsample_f1). This class
// overrides only the four own slots; every other slot inherits through the
// lowercase `HgcColorGamma_chroma_downsample_f1` base and, ultimately, HGNode.
//
// Frontier callees (each becomes a throwing stub — call sites cited):
//   HgcColorGamma_chroma_downsample_f1::~HgcColorGamma_chroma_downsample_f1() [D2]
//                                          @Helium D1 tail-jmp 0xfd575 / D0 callq 0xfd589
//   HGObject::operator delete(void*)       @Helium D0 tail-jmp 0xfd597
//   HGRenderer::GetInput(HGNode*, int)     @Helium GetDOD callq  0xfd5c7
//   HGRenderer::GetDOD(HGNode*)            @Helium GetDOD tail-jmp 0xfd5d8
//
// Reused ports:
//   HGRect, HGRectNull — from raw-port/src/render/HGRect.ts (covers the
//   _HGRectNull data symbol referenced at GetDOD @0xfd5a4 and GetROI @0xfd5e8).

import { HGRect, HGRectNull } from "./HGRect.js";

/**
 * Opaque handle for `HGRenderer` — the Helium render orchestrator. Its own
 * methods are frontier from this class's slice: only two, `GetInput(HGNode*,
 * int)` and `GetDOD(HGNode*)`, are referenced by name here.
 */
export type HGRenderer = object;

/**
 * Opaque handle for `HGNode` — the Helium base class every renderable node
 * (including this one, via its lowercase-`Hgc` base) inherits from. Its
 * layout is not on this class's decoded surface.
 */
export type HGNode = object;

/**
 * `HGRenderer::GetInput(HGNode*, int)` — frontier method. Called from
 * `GetDOD` @0xfd5c7 with (`renderer`, `node` = the HGCColorGamma_... `this`,
 * `idx` = 0). Returns the HGNode pointer sitting at input port `idx` of
 * `node`. Not on this class's decoded surface.
 */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _node: HGNode,
  _idx: number,
): HGNode {
  throw new Error(
    "HGCColorGamma_chroma_downsample_f1: HGRenderer::GetInput(HGNode*, int) " +
      "not yet transcribed @Helium call site 0xfd5c7",
  );
}

/**
 * `HGRenderer::GetDOD(HGNode*)` — frontier method. Tail-jmp'd from `GetDOD`
 * @0xfd5d8 with (`renderer`, `node` = the input port 0 result). Returns an
 * HGRect (16B struct return in %rax:%rdx). Not on this class's decoded
 * surface.
 */
function HGRenderer_GetDOD(_renderer: HGRenderer, _node: HGNode): HGRect {
  throw new Error(
    "HGCColorGamma_chroma_downsample_f1: HGRenderer::GetDOD(HGNode*) not yet " +
      "transcribed @Helium tail-jmp site 0xfd5d8",
  );
}

/**
 * `HgcColorGamma_chroma_downsample_f1::~HgcColorGamma_chroma_downsample_f1()`
 * [D2 base-object dtor] — the primary base class's destructor. Chained by
 * both this class's dtors. Its body — and the actual chroma-downsample
 * shader machinery (GetProgram / RenderTile / BindTexture / GetParameter
 * / SetParameter / Bind / GetOutput) that lives on the lowercase base — is
 * frontier from this slice.
 */
function HgcColorGamma_chroma_downsample_f1_D2_dtor(
  _this: HGCColorGamma_chroma_downsample_f1,
): void {
  throw new Error(
    "HGCColorGamma_chroma_downsample_f1: " +
      "HgcColorGamma_chroma_downsample_f1::~HgcColorGamma_chroma_downsample_f1() " +
      "[D2] not yet transcribed @Helium D1 tail-jmp 0xfd575 / D0 callq 0xfd589",
  );
}

/**
 * `HGObject::operator delete(void*)` — Helium's HGObject-scoped operator
 * delete (NOT the global one). Tail-jmp'd from D0 @0xfd597 with (`this`).
 * Not on this class's decoded surface.
 */
function HGObject_operator_delete(_p: HGCColorGamma_chroma_downsample_f1): void {
  throw new Error(
    "HGCColorGamma_chroma_downsample_f1: HGObject::operator delete(void*) not " +
      "yet transcribed @Helium D0 tail-jmp 0xfd597",
  );
}

/**
 * `HGCColorGamma_chroma_downsample_f1` — HGNode wrapper for a horizontal
 * chroma-downsample filter in the float32-1-channel color-gamma pipeline.
 *
 * This class's own slice exports only the dtor pair and the two override
 * methods `GetDOD` / `GetROI`. All render machinery (program binding,
 * texture binding, per-tile execution) lives on the lowercase-`Hgc` base.
 */
export class HGCColorGamma_chroma_downsample_f1 {
  /**
   * `HGCColorGamma_chroma_downsample_f1::~HGCColorGamma_chroma_downsample_f1()`
   * [D1 — complete-object dtor] @Helium 0xfd570.
   *
   * Body is a single tail-jmp into the lowercase base's D2 dtor — this
   * class has NO own instance state to tear down at this offset.
   *
   *   0xfd570 pushq %rbp
   *   0xfd571 movq  %rsp, %rbp
   *   0xfd574 popq  %rbp
   *   0xfd575 jmp   HgcColorGamma_chroma_downsample_f1::~Hgc...() [D2]
   */
  D1_dtor(): void {
    // @0xfd575
    HgcColorGamma_chroma_downsample_f1_D2_dtor(this);
  }

  /**
   * `HGCColorGamma_chroma_downsample_f1::~HGCColorGamma_chroma_downsample_f1()`
   * [D0 — deleting dtor] @Helium 0xfd580.
   *
   * Chains the base D2 dtor, then tail-jmps HGObject::operator delete on
   * the same pointer. Same structural pattern as HGLensGDC_BC's D0.
   *
   *   0xfd580 pushq %rbp
   *   0xfd581 movq  %rsp, %rbp
   *   0xfd584 pushq %rbx
   *   0xfd585 pushq %rax
   *   0xfd586 movq  %rdi, %rbx        ; spill this
   *   0xfd589 callq HgcColorGamma_chroma_downsample_f1::~Hgc...() [D2]
   *   0xfd58e movq  %rbx, %rdi        ; restore this
   *   0xfd591 addq  $0x8, %rsp
   *   0xfd595 popq  %rbx
   *   0xfd596 popq  %rbp
   *   0xfd597 jmp   HGObject::operator delete(void*)
   */
  D0_dtor(): void {
    // @0xfd589
    HgcColorGamma_chroma_downsample_f1_D2_dtor(this);
    // @0xfd597
    HGObject_operator_delete(this);
  }

  /**
   * `HGCColorGamma_chroma_downsample_f1::GetDOD(HGRenderer*, int, HGRect)`
   * @Helium 0xfd5a0.
   *
   * Pure pass-through of the input at port 0. `mode == 0` -> forward to
   * `renderer.GetDOD(renderer.GetInput(this, 0))`; `mode != 0` -> return
   * HGRectNull.
   *
   * The `rect` argument (`%rcx`:`%r8`) is DEAD in this method — the DOD is
   * a property of the node/input, not of the caller's rect.
   *
   *   0xfd5a0 testl %edx, %edx           ; mode
   *   0xfd5a2 je    0xfd5b3              ; mode==0 -> normal
   *   0xfd5a4 leaq  _HGRectNull(%rip), %rcx
   *   0xfd5ab movq  (%rcx), %rax         ; { HGRectNull.x, HGRectNull.y }
   *   0xfd5ae movq  0x8(%rcx), %rdx      ; { HGRectNull.right, HGRectNull.bottom }
   *   0xfd5b2 retq
   *   0xfd5b3 ...                        ; normal branch, see disasm above
   *   0xfd5c7 callq HGRenderer::GetInput(this, 0)
   *   0xfd5d8 jmp   HGRenderer::GetDOD(input)
   */
  GetDOD(renderer: HGRenderer, mode: number, _rect: HGRect): HGRect {
    // @0xfd5a0 — testl %edx, %edx / je 0xfd5b3
    if ((mode | 0) !== 0) {
      // @0xfd5a4..0xfd5b2 — return HGRectNull
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }
    // @0xfd5c7 — input = renderer.GetInput(this, 0)
    const input = HGRenderer_GetInput(renderer, this, 0);
    // @0xfd5d8 — tail-jmp: return renderer.GetDOD(input)
    return HGRenderer_GetDOD(renderer, input);
  }

  /**
   * `HGCColorGamma_chroma_downsample_f1::GetROI(HGRenderer*, int, HGRect)`
   * @Helium 0xfd5e0.
   *
   * Grow the requested output rect by +1 pixel horizontally on each side:
   *   { x, y, right, bottom }  ->  { x-1, y, right+1, bottom }
   *
   * i.e. this filter's input support is a 3-pixel horizontal window per
   * output pixel — the vertical extent is unchanged (chroma downsample is
   * horizontal-only).
   *
   * `mode != 0` -> return HGRectNull (the estimate/thumbnail early-out).
   * The `renderer` argument is DEAD in this method — the ROI depends only
   * on the requested output rect.
   *
   *   0xfd5e0..0xfd600  ; mode!=0 -> HGRectNull early-out
   *   0xfd601 movq   %r8, %xmm0                ; xmm0.lo = {right,bottom}
   *   0xfd606 movq   %rcx, %xmm1               ; xmm1.lo = {x,y}
   *   0xfd60b punpcklqdq %xmm0, %xmm1          ; xmm1 = {x,y,right,bottom}
   *   0xfd60f movdqa 0x2d24b9(%rip), %xmm0     ; @0x3cfad0 = [-1,0,+1,0] i32
   *   0xfd617 paddq  %xmm1, %xmm0              ; per-qword add
   *   0xfd61b pblendw $0xcc, %xmm1, %xmm0      ; keep {x-1, y, right+1, bottom}
   *   0xfd621 movq   %xmm0, %rax
   *   0xfd626 pextrq $0x1, %xmm0, %rdx
   *   0xfd62d popq   %rbp
   *   0xfd62e retq
   */
  GetROI(_renderer: HGRenderer, mode: number, rect: HGRect): HGRect {
    // @0xfd5e4 — testl %edx, %edx / je 0xfd601
    if ((mode | 0) !== 0) {
      // @0xfd5e8..0xfd600 — return HGRectNull
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }
    // @0xfd601..0xfd62e — 4x i32 lane operation with SSE:
    //   punpcklqdq builds  {x,y,right,bottom}
    //   paddq of the constant [-1,0,+1,0] followed by pblendw $0xcc
    //   (which restores the y,bottom lanes from the pre-add value) is
    //   equivalent to the pure-i32 operation:
    //     x'      = x     + (-1) = x - 1
    //     y'      = y     +  0   = y
    //     right'  = right + (+1) = right + 1
    //     bottom' = bottom+  0   = bottom
    //   Wraparound: on 32-bit signed overflow the SSE ops wrap
    //   modulo 2^32; the pblendw ensures the y/bottom carries from the
    //   64-bit paddq NEVER escape into the return value. TS int32 wrap
    //   is emulated via `| 0`.
    const xMinus1 = (rect.x - 1) | 0;
    const rightPlus1 = (rect.right + 1) | 0;
    return { x: xMinus1, y: rect.y, right: rightPlus1, bottom: rect.bottom };
  }
}
