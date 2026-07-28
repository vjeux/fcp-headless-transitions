// HGCColorGamma_v216_yxzx_expand.ts — Helium HGCColorGamma_v216_yxzx_expand:
// the render-graph node class for the v216 → yxzx chroma-expand path of the
// color-gamma pipeline. Same shim-over-`Hgc*` shape as HGCColorGamma_bias
// (see raw-port/src/render/HGCColorGamma_bias.ts) with the twist that
// GetROI performs a 2-pixel horizontal alignment on the requested rect
// (v216 packs one 16-bit chroma pair per two 16-bit luma samples, so any ROI must snap to
// even x and even width — that is the only decoded arithmetic in this class).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice).
// Disassembly:
//   raw-port/re/disasm/Helium.HGCColorGamma_v216_yxzx_expand.~HGCColorGamma_v216_yxzx_expand.s
//                                                (D0 body — D1 pulled from /tmp/Helium_tV.txt)
//   raw-port/re/disasm/Helium.HGCColorGamma_v216_yxzx_expand.GetOutput.s
//   raw-port/re/disasm/Helium.HGCColorGamma_v216_yxzx_expand.GetDOD.s
//   raw-port/re/disasm/Helium.HGCColorGamma_v216_yxzx_expand.GetROI.s
//
// Method addresses:
//   @0x000000000000fd100  HGCColorGamma_v216_yxzx_expand::~HGCColorGamma_v216_yxzx_expand() [D1]
//   @0x000000000000fd110  HGCColorGamma_v216_yxzx_expand::~HGCColorGamma_v216_yxzx_expand() [D0]
//   @0x000000000000fd130  HGCColorGamma_v216_yxzx_expand::GetOutput(HGRenderer*)
//   @0x000000000000fd140  HGCColorGamma_v216_yxzx_expand::GetDOD(HGRenderer*, int, HGRect)
//   @0x000000000000fd180  HGCColorGamma_v216_yxzx_expand::GetROI(HGRenderer*, int, HGRect)
//
// Undecoded frontier callees:
//   HgcColorGamma_v216_yxzx_expand::~HgcColorGamma_v216_yxzx_expand() [base D2]
//                                                       @Helium (jmp @0xfd105, callq @0xfd119)
//   HGRenderer::GetInput(HGNode*, int)                  @Helium (call @0xfd167)
//   HGRenderer::GetDOD(HGNode*)                         @Helium (tail-jmp @0xfd178)
//   HGObject::operator delete(void*)                    @Helium (tail-jmp @0xfd127)

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph node handle (mirrors HGCColorGamma_bias). */
export interface HGNode {}

/** HGRenderer — render context / dependency tracker. Layout undecoded. */
export interface HGRenderer {}

/** _HGRectNull @Helium __DATA_CONST 0x3d2284 — all-zero {0,0,0,0}. Loaded
 *  via `leaq _HGRectNull(%rip), %rcx` in GetDOD @0xfd144 and GetROI @0xfd188. */
const HGRectNull: HGRect = HGRectNullConst;

/** HgcColorGamma_v216_yxzx_expand::~HgcColorGamma_v216_yxzx_expand() — the
 *  base compute-kernel destructor. Called from D1 @0xfd105 (jmp) and D0
 *  @0xfd119 (callq). Not yet transcribed. */
function HgcColorGamma_v216_yxzx_expand_dtor(_self: HGCColorGamma_v216_yxzx_expand): void {
  throw new Error("HgcColorGamma_v216_yxzx_expand::~HgcColorGamma_v216_yxzx_expand @Helium __ZN30HgcColorGamma_v216_yxzx_expandD2Ev — reached from @0xfd105 (D1 jmp) and @0xfd119 (D0 callq); base-class dtor not yet transcribed"); // @0xfd105 / @0xfd119
}

/** HGObject::operator delete(void*) — tail-jmp target from D0 @0xfd127.
 *  Shared across every Helium render-node deleting-dtor (see also
 *  HGCColorGamma_bias.ts). Not decoded here. */
function HGObject_operatorDelete(_p: HGCColorGamma_v216_yxzx_expand): void {
  throw new Error("HGObject::operator delete @Helium __ZN8HGObjectdlEPv — reached from D0 @0xfd127; not yet transcribed"); // @0xfd127
}

/** HGRenderer::GetInput(HGNode*, int) — called from GetDOD @0xfd167 with
 *  slot=0 to fetch this node's sole input. Not yet transcribed. */
function HGRenderer_GetInput(_r: HGRenderer, _self: HGCColorGamma_v216_yxzx_expand, _slot: number): HGNode | null {
  throw new Error("HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei — reached from GetDOD @0xfd167; not yet transcribed"); // @0xfd167
}

/** HGRenderer::GetDOD(HGNode*) — tail-jmp target from GetDOD @0xfd178,
 *  invoked on the HGNode returned by GetInput. Not yet transcribed. */
function HGRenderer_GetDOD(_r: HGRenderer, _node: HGNode | null): HGRect {
  throw new Error("HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode — reached from GetDOD tail @0xfd178; not yet transcribed"); // @0xfd178
}

/**
 * `HGCColorGamma_v216_yxzx_expand` — the Helium render-graph node for
 * expanding a v216 chroma-subsampled buffer into an xyxz layout as part
 * of the color-gamma pipeline. No own instance state is visible in any of
 * the five transcribed methods — `this` is passed opaquely to the base D2
 * and to HGRenderer::GetInput; there are no field reads or writes.
 * Derives (single-inheritance, no offset adjust seen in the D1 thunk at
 * @0xfd100) from the base compute-kernel class
 * `HgcColorGamma_v216_yxzx_expand` (lowercase 'g''c' — undecoded).
 */
export class HGCColorGamma_v216_yxzx_expand {
  /**
   * `HGCColorGamma_v216_yxzx_expand::~HGCColorGamma_v216_yxzx_expand()`
   * (D1 — complete-object dtor) @Helium 0xfd100.
   *
   *   @0xfd100 pushq %rbp
   *   @0xfd101 movq  %rsp, %rbp
   *   @0xfd104 popq  %rbp
   *   @0xfd105 jmp   __ZN30HgcColorGamma_v216_yxzx_expandD2Ev
   *
   * Pure tail-call to the base D2 — no vtable install, no field teardown
   * at this layer. Single-inheritance (no this-adjust byte moves).
   */
  destroy(): void {
    // @0xfd105 jmp HgcColorGamma_v216_yxzx_expand::~HgcColorGamma_v216_yxzx_expand
    HgcColorGamma_v216_yxzx_expand_dtor(this);
  }

  /**
   * `HGCColorGamma_v216_yxzx_expand::~HGCColorGamma_v216_yxzx_expand()`
   * (D0 — deleting dtor) @Helium 0xfd110.
   *
   *   @0xfd110 pushq %rbp
   *   @0xfd111 movq  %rsp, %rbp
   *   @0xfd114 pushq %rbx
   *   @0xfd115 pushq %rax                      ; align stack
   *   @0xfd116 movq  %rdi, %rbx                ; rbx = this
   *   @0xfd119 callq __ZN30HgcColorGamma_v216_yxzx_expandD2Ev
   *   @0xfd11e movq  %rbx, %rdi                ; rdi = this
   *   @0xfd121 addq  $0x8, %rsp
   *   @0xfd125 popq  %rbx
   *   @0xfd126 popq  %rbp
   *   @0xfd127 jmp   __ZN8HGObjectdlEPv
   */
  destroyAndDelete(): void {
    // @0xfd119 callq HgcColorGamma_v216_yxzx_expand::~HgcColorGamma_v216_yxzx_expand
    HgcColorGamma_v216_yxzx_expand_dtor(this);
    // @0xfd127 jmp HGObject::operator delete
    HGObject_operatorDelete(this);
  }

  /**
   * `HGCColorGamma_v216_yxzx_expand::GetOutput(HGRenderer*)` @Helium 0xfd130.
   *
   *   @0xfd130 pushq %rbp
   *   @0xfd131 movq  %rsp, %rbp
   *   @0xfd134 movq  %rdi, %rax            ; rax = this  (the return value)
   *   @0xfd137 popq  %rbp
   *   @0xfd138 retq
   *
   * Pure identity: `return this`. The node is its own output handle — no
   * child HGNode is spun up for this stage of the pipeline. The renderer
   * argument (%rsi) is unread.
   */
  GetOutput(_renderer: HGRenderer): HGCColorGamma_v216_yxzx_expand {
    // @0xfd134 movq %rdi, %rax — identity return.
    return this;
  }

  /**
   * `HGCColorGamma_v216_yxzx_expand::GetDOD(HGRenderer*, int, HGRect)`
   * @Helium 0xfd140.
   *
   * ABI (SysV x86_64, same convention as HGCColorGamma_bias::GetDOD):
   *   %rdi = this          %rsi = renderer          %edx = outputIdx
   *   HGRect argument is on the stack / in call-preserved regs but unread.
   *
   *   @0xfd140 testl %edx, %edx
   *   @0xfd142 je    0xfd153                 ; outputIdx==0 → delegate path
   *   @0xfd144 leaq  _HGRectNull(%rip), %rcx
   *   @0xfd14b movq  (%rcx), %rax            ; rax = low  qword of null
   *   @0xfd14e movq  0x8(%rcx), %rdx         ; rdx = high qword of null
   *   @0xfd152 retq                          ; return HGRectNull
   *
   *   ; outputIdx == 0 path:
   *   @0xfd153 pushq %rbp
   *   @0xfd154 movq  %rsp, %rbp
   *   @0xfd157 pushq %rbx
   *   @0xfd158 pushq %rax                    ; align stack
   *   @0xfd159 movq  %rdi, %rax              ; rax = this
   *   @0xfd15c movq  %rsi, %rdi              ; rdi = renderer   (arg1 to GetInput)
   *   @0xfd15f movq  %rsi, %rbx              ; rbx = renderer   (saved for GetDOD)
   *   @0xfd162 movq  %rax, %rsi              ; rsi = this       (arg2 to GetInput)
   *   @0xfd165 xorl  %edx, %edx              ; edx = 0          (arg3 = slot 0)
   *   @0xfd167 callq HGRenderer::GetInput(HGNode*, int)
   *   @0xfd16c movq  %rbx, %rdi              ; rdi = renderer  (arg1 to GetDOD)
   *   @0xfd16f movq  %rax, %rsi              ; rsi = returned HGNode*
   *   @0xfd172 addq  $0x8, %rsp
   *   @0xfd176 popq  %rbx
   *   @0xfd177 popq  %rbp
   *   @0xfd178 jmp   HGRenderer::GetDOD(HGNode*)
   *
   * Semantics: for output 0, DOD is the DOD of input slot 0 — the 2vuy
   * chroma expand step doesn't grow the pixel-domain vertically or
   * horizontally at the DOD level (any horizontal alignment happens in
   * GetROI, which reshapes the *requested* subrect, not the DOD).
   */
  GetDOD(renderer: HGRenderer, outputIdx: number, _requested: HGRect): HGRect {
    // @0xfd140 testl %edx,%edx ; @0xfd142 je → outputIdx == 0 takes the
    // delegate path; anything else short-circuits to HGRectNull.
    const edx = outputIdx | 0;
    if (edx !== 0) {
      // @0xfd144 leaq _HGRectNull(%rip),%rcx ; @0xfd152 retq
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xfd167 GetInput(renderer, this, 0)
    const inputNode = HGRenderer_GetInput(renderer, this, 0);
    // @0xfd178 jmp GetDOD(renderer, inputNode) — tail-call.
    return HGRenderer_GetDOD(renderer, inputNode);
  }

  /**
   * `HGCColorGamma_v216_yxzx_expand::GetROI(HGRenderer*, int, HGRect)`
   * @Helium 0xfd180.
   *
   * ABI mapping (same 16B-struct-by-value convention as HGCColorGamma_bias):
   *   %rdi = this           %rsi = renderer (UNREAD)   %edx = inputIdx
   *   %rcx = requested.lo  = requested.x       | (requested.y      << 32)
   *   %r8  = requested.hi  = requested.right   | (requested.bottom << 32)
   * Return: rax = out.lo, rdx = out.hi.
   *
   *   @0xfd180 testl %edx, %edx
   *   @0xfd182 je    0xfd198                     ; inputIdx==0 → align path
   *   @0xfd184 pushq %rbp                        ; the != 0 path
   *   @0xfd185 movq  %rsp, %rbp
   *   @0xfd188 leaq  _HGRectNull(%rip), %rcx
   *   @0xfd18f movq  (%rcx), %rax                ; rax = null.lo
   *   @0xfd192 movq  0x8(%rcx), %rdx             ; rdx = null.hi
   *   @0xfd196 popq  %rbp
   *   @0xfd197 retq                              ; return HGRectNull
   *
   *   ; inputIdx == 0 path — the 2-pixel horizontal alignment:
   *   @0xfd198 movq  %rcx, %rax                  ; rax = requested.lo
   *                                              ;      = x | (y << 32)
   *   @0xfd19b movl  %r8d, %edx                  ; edx = low 32 of r8 = requested.right
   *   @0xfd19e andl  $0x1, %edx                  ; edx = right & 1
   *                                              ;      (1 if right is odd, else 0)
   *   @0xfd1a1 addl  %r8d, %edx                  ; edx = right + (right & 1)
   *                                              ;      (round right UP to next even)
   *   @0xfd1a4 movabsq $-0x100000000, %rcx       ; rcx = 0xFFFFFFFF00000000 (mask upper 32)
   *   @0xfd1ae andq  %r8, %rcx                   ; rcx = bottom << 32 (preserve high half)
   *   @0xfd1b1 andq  $-0x2, %rax                 ; rax = (x & ~1) | (y << 32)
   *                                              ;      (-2 = 0xFFFF..FFFE clears bit 0 of
   *                                              ;      low32; upper 32 bits of rax = y
   *                                              ;      are unchanged since ~1 keeps them.
   *                                              ;      → round x DOWN to previous even)
   *   @0xfd1b5 orq   %rcx, %rdx                  ; rdx = (bottom << 32)
   *                                              ;     | (right + (right & 1))
   *   @0xfd1b8 retq
   *
   * Semantics: for input slot 0 the returned ROI is the caller's requested
   * rect with x rounded DOWN to the nearest even integer and right rounded
   * UP to the nearest even integer. y and bottom pass through untouched.
   * This is exactly the alignment v216 chroma expansion needs: 2vuy packs
   * two consecutive luma samples per (U, V) pair horizontally, so any
   * horizontal read region must include both members of every chroma pair
   * — i.e. x must land on the even boundary, and right must reach the next
   * even boundary. Vertical geometry is untouched (the chroma-expand step
   * is 1-D horizontal-only). Any inputIdx != 0 → HGRectNull, because the
   * node has exactly one input.
   */
  GetROI(_renderer: HGRenderer, inputIdx: number, requested: HGRect): HGRect {
    // @0xfd180 testl %edx,%edx ; @0xfd182 je 0xfd198 — inputIdx==0 takes
    // the alignment path; anything else short-circuits to HGRectNull.
    const edx = inputIdx | 0;
    if (edx !== 0) {
      // @0xfd188 leaq _HGRectNull ; @0xfd197 retq
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xfd198 mov rax,rcx ; ... — the 2-pixel horizontal-alignment path.
    // Force int32 semantics on every lane so the & ~1 / + (r & 1) matches
    // the x86 32-bit register width used by the disasm.
    const x = requested.x | 0;
    const y = requested.y | 0;
    const right = requested.right | 0;
    const bottom = requested.bottom | 0;

    // @0xfd1b1 andq $-0x2, %rax — clear bit 0 of x (round x DOWN to even).
    const xAligned = (x & ~1) | 0;
    // @0xfd19e andl $0x1, %edx ; @0xfd1a1 addl %r8d, %edx —
    //   right + (right & 1) rounds right UP to the next even integer.
    const rightAligned = ((right & 1) + right) | 0;

    return {
      x: xAligned,
      y: y,          // @0xfd1b1 andq $-0x2 keeps upper 32 (y) intact.
      right: rightAligned,
      bottom: bottom, // @0xfd1ae andq %r8,%rcx preserves upper 32 (bottom).
    };
  }
}
