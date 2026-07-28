// HGCColorGamma_2vuy_xyxz_expand.ts — Helium HGCColorGamma_2vuy_xyxz_expand:
// the render-graph node class for the 2vuy → xyxz chroma-expand path of the
// color-gamma pipeline. Same shim-over-`Hgc*` shape as HGCColorGamma_bias
// (see raw-port/src/render/HGCColorGamma_bias.ts) with the twist that
// GetROI performs a 2-pixel horizontal alignment on the requested rect
// (2vuy packs two luma samples per chroma sample, so any ROI must snap to
// even x and even width — that is the only decoded arithmetic in this class).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice).
// Disassembly:
//   raw-port/re/disasm/Helium.HGCColorGamma_2vuy_xyxz_expand.~HGCColorGamma_2vuy_xyxz_expand.s
//                                                (D0 body — D1 pulled from /tmp/Helium_tV.txt)
//   raw-port/re/disasm/Helium.HGCColorGamma_2vuy_xyxz_expand.GetOutput.s
//   raw-port/re/disasm/Helium.HGCColorGamma_2vuy_xyxz_expand.GetDOD.s
//   raw-port/re/disasm/Helium.HGCColorGamma_2vuy_xyxz_expand.GetROI.s
//
// Method addresses:
//   @0x000000000000fcf20  HGCColorGamma_2vuy_xyxz_expand::~HGCColorGamma_2vuy_xyxz_expand() [D1]
//   @0x000000000000fcf30  HGCColorGamma_2vuy_xyxz_expand::~HGCColorGamma_2vuy_xyxz_expand() [D0]
//   @0x000000000000fcf50  HGCColorGamma_2vuy_xyxz_expand::GetOutput(HGRenderer*)
//   @0x000000000000fcf60  HGCColorGamma_2vuy_xyxz_expand::GetDOD(HGRenderer*, int, HGRect)
//   @0x000000000000fcfa0  HGCColorGamma_2vuy_xyxz_expand::GetROI(HGRenderer*, int, HGRect)
//
// Undecoded frontier callees:
//   HgcColorGamma_2vuy_xyxz_expand::~HgcColorGamma_2vuy_xyxz_expand() [base D2]
//                                                       @Helium (jmp @0xfcf25, callq @0xfcf39)
//   HGRenderer::GetInput(HGNode*, int)                  @Helium (call @0xfcf87)
//   HGRenderer::GetDOD(HGNode*)                         @Helium (tail-jmp @0xfcf98)
//   HGObject::operator delete(void*)                    @Helium (tail-jmp @0xfcf47)

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph node handle (mirrors HGCColorGamma_bias). */
export interface HGNode {}

/** HGRenderer — render context / dependency tracker. Layout undecoded. */
export interface HGRenderer {}

/** _HGRectNull @Helium __DATA_CONST 0x3d2284 — all-zero {0,0,0,0}. Loaded
 *  via `leaq _HGRectNull(%rip), %rcx` in GetDOD @0xfcf64 and GetROI @0xfcfa8. */
const HGRectNull: HGRect = HGRectNullConst;

/** HgcColorGamma_2vuy_xyxz_expand::~HgcColorGamma_2vuy_xyxz_expand() — the
 *  base compute-kernel destructor. Called from D1 @0xfcf25 (jmp) and D0
 *  @0xfcf39 (callq). Not yet transcribed. */
function HgcColorGamma_2vuy_xyxz_expand_dtor(_self: HGCColorGamma_2vuy_xyxz_expand): void {
  throw new Error("HgcColorGamma_2vuy_xyxz_expand::~HgcColorGamma_2vuy_xyxz_expand @Helium __ZN30HgcColorGamma_2vuy_xyxz_expandD2Ev — reached from @0xfcf25 (D1 jmp) and @0xfcf39 (D0 callq); base-class dtor not yet transcribed"); // @0xfcf25 / @0xfcf39
}

/** HGObject::operator delete(void*) — tail-jmp target from D0 @0xfcf47.
 *  Shared across every Helium render-node deleting-dtor (see also
 *  HGCColorGamma_bias.ts). Not decoded here. */
function HGObject_operatorDelete(_p: HGCColorGamma_2vuy_xyxz_expand): void {
  throw new Error("HGObject::operator delete @Helium __ZN8HGObjectdlEPv — reached from D0 @0xfcf47; not yet transcribed"); // @0xfcf47
}

/** HGRenderer::GetInput(HGNode*, int) — called from GetDOD @0xfcf87 with
 *  slot=0 to fetch this node's sole input. Not yet transcribed. */
function HGRenderer_GetInput(_r: HGRenderer, _self: HGCColorGamma_2vuy_xyxz_expand, _slot: number): HGNode | null {
  throw new Error("HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei — reached from GetDOD @0xfcf87; not yet transcribed"); // @0xfcf87
}

/** HGRenderer::GetDOD(HGNode*) — tail-jmp target from GetDOD @0xfcf98,
 *  invoked on the HGNode returned by GetInput. Not yet transcribed. */
function HGRenderer_GetDOD(_r: HGRenderer, _node: HGNode | null): HGRect {
  throw new Error("HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode — reached from GetDOD tail @0xfcf98; not yet transcribed"); // @0xfcf98
}

/**
 * `HGCColorGamma_2vuy_xyxz_expand` — the Helium render-graph node for
 * expanding a 2vuy chroma-subsampled buffer into an xyxz layout as part
 * of the color-gamma pipeline. No own instance state is visible in any of
 * the five transcribed methods — `this` is passed opaquely to the base D2
 * and to HGRenderer::GetInput; there are no field reads or writes.
 * Derives (single-inheritance, no offset adjust seen in the D1 thunk at
 * @0xfcf20) from the base compute-kernel class
 * `HgcColorGamma_2vuy_xyxz_expand` (lowercase 'g''c' — undecoded).
 */
export class HGCColorGamma_2vuy_xyxz_expand {
  /**
   * `HGCColorGamma_2vuy_xyxz_expand::~HGCColorGamma_2vuy_xyxz_expand()`
   * (D1 — complete-object dtor) @Helium 0xfcf20.
   *
   *   @0xfcf20 pushq %rbp
   *   @0xfcf21 movq  %rsp, %rbp
   *   @0xfcf24 popq  %rbp
   *   @0xfcf25 jmp   __ZN30HgcColorGamma_2vuy_xyxz_expandD2Ev
   *
   * Pure tail-call to the base D2 — no vtable install, no field teardown
   * at this layer. Single-inheritance (no this-adjust byte moves).
   */
  destroy(): void {
    // @0xfcf25 jmp HgcColorGamma_2vuy_xyxz_expand::~HgcColorGamma_2vuy_xyxz_expand
    HgcColorGamma_2vuy_xyxz_expand_dtor(this);
  }

  /**
   * `HGCColorGamma_2vuy_xyxz_expand::~HGCColorGamma_2vuy_xyxz_expand()`
   * (D0 — deleting dtor) @Helium 0xfcf30.
   *
   *   @0xfcf30 pushq %rbp
   *   @0xfcf31 movq  %rsp, %rbp
   *   @0xfcf34 pushq %rbx
   *   @0xfcf35 pushq %rax                      ; align stack
   *   @0xfcf36 movq  %rdi, %rbx                ; rbx = this
   *   @0xfcf39 callq __ZN30HgcColorGamma_2vuy_xyxz_expandD2Ev
   *   @0xfcf3e movq  %rbx, %rdi                ; rdi = this
   *   @0xfcf41 addq  $0x8, %rsp
   *   @0xfcf45 popq  %rbx
   *   @0xfcf46 popq  %rbp
   *   @0xfcf47 jmp   __ZN8HGObjectdlEPv
   */
  destroyAndDelete(): void {
    // @0xfcf39 callq HgcColorGamma_2vuy_xyxz_expand::~HgcColorGamma_2vuy_xyxz_expand
    HgcColorGamma_2vuy_xyxz_expand_dtor(this);
    // @0xfcf47 jmp HGObject::operator delete
    HGObject_operatorDelete(this);
  }

  /**
   * `HGCColorGamma_2vuy_xyxz_expand::GetOutput(HGRenderer*)` @Helium 0xfcf50.
   *
   *   @0xfcf50 pushq %rbp
   *   @0xfcf51 movq  %rsp, %rbp
   *   @0xfcf54 movq  %rdi, %rax            ; rax = this  (the return value)
   *   @0xfcf57 popq  %rbp
   *   @0xfcf58 retq
   *
   * Pure identity: `return this`. The node is its own output handle — no
   * child HGNode is spun up for this stage of the pipeline. The renderer
   * argument (%rsi) is unread.
   */
  GetOutput(_renderer: HGRenderer): HGCColorGamma_2vuy_xyxz_expand {
    // @0xfcf54 movq %rdi, %rax — identity return.
    return this;
  }

  /**
   * `HGCColorGamma_2vuy_xyxz_expand::GetDOD(HGRenderer*, int, HGRect)`
   * @Helium 0xfcf60.
   *
   * ABI (SysV x86_64, same convention as HGCColorGamma_bias::GetDOD):
   *   %rdi = this          %rsi = renderer          %edx = outputIdx
   *   HGRect argument is on the stack / in call-preserved regs but unread.
   *
   *   @0xfcf60 testl %edx, %edx
   *   @0xfcf62 je    0xfcf73                 ; outputIdx==0 → delegate path
   *   @0xfcf64 leaq  _HGRectNull(%rip), %rcx
   *   @0xfcf6b movq  (%rcx), %rax            ; rax = low  qword of null
   *   @0xfcf6e movq  0x8(%rcx), %rdx         ; rdx = high qword of null
   *   @0xfcf72 retq                          ; return HGRectNull
   *
   *   ; outputIdx == 0 path:
   *   @0xfcf73 pushq %rbp
   *   @0xfcf74 movq  %rsp, %rbp
   *   @0xfcf77 pushq %rbx
   *   @0xfcf78 pushq %rax                    ; align stack
   *   @0xfcf79 movq  %rdi, %rax              ; rax = this
   *   @0xfcf7c movq  %rsi, %rdi              ; rdi = renderer   (arg1 to GetInput)
   *   @0xfcf7f movq  %rsi, %rbx              ; rbx = renderer   (saved for GetDOD)
   *   @0xfcf82 movq  %rax, %rsi              ; rsi = this       (arg2 to GetInput)
   *   @0xfcf85 xorl  %edx, %edx              ; edx = 0          (arg3 = slot 0)
   *   @0xfcf87 callq HGRenderer::GetInput(HGNode*, int)
   *   @0xfcf8c movq  %rbx, %rdi              ; rdi = renderer  (arg1 to GetDOD)
   *   @0xfcf8f movq  %rax, %rsi              ; rsi = returned HGNode*
   *   @0xfcf92 addq  $0x8, %rsp
   *   @0xfcf96 popq  %rbx
   *   @0xfcf97 popq  %rbp
   *   @0xfcf98 jmp   HGRenderer::GetDOD(HGNode*)
   *
   * Semantics: for output 0, DOD is the DOD of input slot 0 — the 2vuy
   * chroma expand step doesn't grow the pixel-domain vertically or
   * horizontally at the DOD level (any horizontal alignment happens in
   * GetROI, which reshapes the *requested* subrect, not the DOD).
   */
  GetDOD(renderer: HGRenderer, outputIdx: number, _requested: HGRect): HGRect {
    // @0xfcf60 testl %edx,%edx ; @0xfcf62 je → outputIdx == 0 takes the
    // delegate path; anything else short-circuits to HGRectNull.
    const edx = outputIdx | 0;
    if (edx !== 0) {
      // @0xfcf64 leaq _HGRectNull(%rip),%rcx ; @0xfcf72 retq
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xfcf87 GetInput(renderer, this, 0)
    const inputNode = HGRenderer_GetInput(renderer, this, 0);
    // @0xfcf98 jmp GetDOD(renderer, inputNode) — tail-call.
    return HGRenderer_GetDOD(renderer, inputNode);
  }

  /**
   * `HGCColorGamma_2vuy_xyxz_expand::GetROI(HGRenderer*, int, HGRect)`
   * @Helium 0xfcfa0.
   *
   * ABI mapping (same 16B-struct-by-value convention as HGCColorGamma_bias):
   *   %rdi = this           %rsi = renderer (UNREAD)   %edx = inputIdx
   *   %rcx = requested.lo  = requested.x       | (requested.y      << 32)
   *   %r8  = requested.hi  = requested.right   | (requested.bottom << 32)
   * Return: rax = out.lo, rdx = out.hi.
   *
   *   @0xfcfa0 testl %edx, %edx
   *   @0xfcfa2 je    0xfcfb8                     ; inputIdx==0 → align path
   *   @0xfcfa4 pushq %rbp                        ; the != 0 path
   *   @0xfcfa5 movq  %rsp, %rbp
   *   @0xfcfa8 leaq  _HGRectNull(%rip), %rcx
   *   @0xfcfaf movq  (%rcx), %rax                ; rax = null.lo
   *   @0xfcfb2 movq  0x8(%rcx), %rdx             ; rdx = null.hi
   *   @0xfcfb6 popq  %rbp
   *   @0xfcfb7 retq                              ; return HGRectNull
   *
   *   ; inputIdx == 0 path — the 2-pixel horizontal alignment:
   *   @0xfcfb8 movq  %rcx, %rax                  ; rax = requested.lo
   *                                              ;      = x | (y << 32)
   *   @0xfcfbb movl  %r8d, %edx                  ; edx = low 32 of r8 = requested.right
   *   @0xfcfbe andl  $0x1, %edx                  ; edx = right & 1
   *                                              ;      (1 if right is odd, else 0)
   *   @0xfcfc1 addl  %r8d, %edx                  ; edx = right + (right & 1)
   *                                              ;      (round right UP to next even)
   *   @0xfcfc4 movabsq $-0x100000000, %rcx       ; rcx = 0xFFFFFFFF00000000 (mask upper 32)
   *   @0xfcfce andq  %r8, %rcx                   ; rcx = bottom << 32 (preserve high half)
   *   @0xfcfd1 andq  $-0x2, %rax                 ; rax = (x & ~1) | (y << 32)
   *                                              ;      (-2 = 0xFFFF..FFFE clears bit 0 of
   *                                              ;      low32; upper 32 bits of rax = y
   *                                              ;      are unchanged since ~1 keeps them.
   *                                              ;      → round x DOWN to previous even)
   *   @0xfcfd5 orq   %rcx, %rdx                  ; rdx = (bottom << 32)
   *                                              ;     | (right + (right & 1))
   *   @0xfcfd8 retq
   *
   * Semantics: for input slot 0 the returned ROI is the caller's requested
   * rect with x rounded DOWN to the nearest even integer and right rounded
   * UP to the nearest even integer. y and bottom pass through untouched.
   * This is exactly the alignment 2vuy chroma expansion needs: 2vuy packs
   * two consecutive luma samples per (U, V) pair horizontally, so any
   * horizontal read region must include both members of every chroma pair
   * — i.e. x must land on the even boundary, and right must reach the next
   * even boundary. Vertical geometry is untouched (the chroma-expand step
   * is 1-D horizontal-only). Any inputIdx != 0 → HGRectNull, because the
   * node has exactly one input.
   */
  GetROI(_renderer: HGRenderer, inputIdx: number, requested: HGRect): HGRect {
    // @0xfcfa0 testl %edx,%edx ; @0xfcfa2 je 0xfcfb8 — inputIdx==0 takes
    // the alignment path; anything else short-circuits to HGRectNull.
    const edx = inputIdx | 0;
    if (edx !== 0) {
      // @0xfcfa8 leaq _HGRectNull ; @0xfcfb7 retq
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xfcfb8 mov rax,rcx ; ... — the 2-pixel horizontal-alignment path.
    // Force int32 semantics on every lane so the & ~1 / + (r & 1) matches
    // the x86 32-bit register width used by the disasm.
    const x = requested.x | 0;
    const y = requested.y | 0;
    const right = requested.right | 0;
    const bottom = requested.bottom | 0;

    // @0xfcfd1 andq $-0x2, %rax — clear bit 0 of x (round x DOWN to even).
    const xAligned = (x & ~1) | 0;
    // @0xfcfbe andl $0x1, %edx ; @0xfcfc1 addl %r8d, %edx —
    //   right + (right & 1) rounds right UP to the next even integer.
    const rightAligned = ((right & 1) + right) | 0;

    return {
      x: xAligned,
      y: y,          // @0xfcfd1 andq $-0x2 keeps upper 32 (y) intact.
      right: rightAligned,
      bottom: bottom, // @0xfcfce andq %r8,%rcx preserves upper 32 (bottom).
    };
  }
}
