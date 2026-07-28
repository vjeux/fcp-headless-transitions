// HGCPixelFormatConversion_kV4B_WXYZ_output.ts — Helium
// HGCPixelFormatConversion_kV4B_WXYZ_output: the render-graph node class
// for the kV4B → WXYZ pixel-format-conversion output stage. Same
// shim-over-`Hgc*` shape as HGCColorGamma_bias (see
// raw-port/src/render/HGCColorGamma_bias.ts); the only difference from
// bias at this outer wrapper is that this class ALSO exports GetOutput
// (as an identity `return this`, mirroring HGCColorGamma_2vuy_xyxz_expand).
// GetROI is a plain slot-0 identity pass-through with no alignment
// arithmetic (unlike the 2vuy/v216 chroma-expand siblings) — pixel-format
// conversion is 1:1 per pixel and doesn't need to snap to any chroma
// boundary.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice).
// Disassembly:
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B_WXYZ_output.~HGCPixelFormatConversion_kV4B_WXYZ_output.s (D0)
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B_WXYZ_output.D1.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B_WXYZ_output.GetOutput.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B_WXYZ_output.GetDOD.s
//   raw-port/re/disasm/Helium.HGCPixelFormatConversion_kV4B_WXYZ_output.GetROI.s
//
// Method addresses:
//   @0x000000000000fd1c0  HGCPixelFormatConversion_kV4B_WXYZ_output::~HGCPixelFormatConversion_kV4B_WXYZ_output() [D1]
//   @0x000000000000fd1d0  HGCPixelFormatConversion_kV4B_WXYZ_output::~HGCPixelFormatConversion_kV4B_WXYZ_output() [D0]
//   @0x000000000000fd1f0  HGCPixelFormatConversion_kV4B_WXYZ_output::GetOutput(HGRenderer*)
//   @0x000000000000fd200  HGCPixelFormatConversion_kV4B_WXYZ_output::GetDOD(HGRenderer*, int, HGRect)
//   @0x000000000000fd240  HGCPixelFormatConversion_kV4B_WXYZ_output::GetROI(HGRenderer*, int, HGRect)
//
// Undecoded frontier callees:
//   HgcPixelFormatConversion_kV4B_WXYZ_output::~HgcPixelFormatConversion_kV4B_WXYZ_output()
//                                                       @Helium (jmp @0xfd1c5, callq @0xfd1d9)
//   HGRenderer::GetInput(HGNode*, int)                  @Helium (call @0xfd227)
//   HGRenderer::GetDOD(HGNode*)                         @Helium (tail-jmp @0xfd238)
//   HGObject::operator delete(void*)                    @Helium (tail-jmp @0xfd1e7)

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph node handle (mirrors HGCColorGamma_bias). */
export interface HGNode {}

/** HGRenderer — render context / dependency tracker. Layout undecoded. */
export interface HGRenderer {}

/** _HGRectNull @Helium __DATA_CONST 0x3d2284 — all-zero {0,0,0,0}. Loaded
 *  via `leaq _HGRectNull(%rip), %rcx` in GetDOD @0xfd204 and GetROI @0xfd24b. */
const HGRectNull: HGRect = HGRectNullConst;

/** HgcPixelFormatConversion_kV4B_WXYZ_output::~HgcPixelFormatConversion_kV4B_WXYZ_output()
 *  — the base compute-kernel destructor. Called from D1 @0xfd1c5 (jmp) and
 *  D0 @0xfd1d9 (callq). Not yet transcribed. */
function HgcPixelFormatConversion_kV4B_WXYZ_output_dtor(_self: HGCPixelFormatConversion_kV4B_WXYZ_output): void {
  throw new Error("HgcPixelFormatConversion_kV4B_WXYZ_output::~HgcPixelFormatConversion_kV4B_WXYZ_output @Helium __ZN41HgcPixelFormatConversion_kV4B_WXYZ_outputD2Ev — reached from @0xfd1c5 (D1 jmp) and @0xfd1d9 (D0 callq); base-class dtor not yet transcribed"); // @0xfd1c5 / @0xfd1d9
}

/** HGObject::operator delete(void*) — tail-jmp target from D0 @0xfd1e7.
 *  Shared across every Helium render-node deleting-dtor. Not decoded. */
function HGObject_operatorDelete(_p: HGCPixelFormatConversion_kV4B_WXYZ_output): void {
  throw new Error("HGObject::operator delete @Helium __ZN8HGObjectdlEPv — reached from D0 @0xfd1e7; not yet transcribed"); // @0xfd1e7
}

/** HGRenderer::GetInput(HGNode*, int) — called from GetDOD @0xfd227 with
 *  slot=0. Not yet transcribed. */
function HGRenderer_GetInput(_r: HGRenderer, _self: HGCPixelFormatConversion_kV4B_WXYZ_output, _slot: number): HGNode | null {
  throw new Error("HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei — reached from GetDOD @0xfd227; not yet transcribed"); // @0xfd227
}

/** HGRenderer::GetDOD(HGNode*) — tail-jmp target from GetDOD @0xfd238. */
function HGRenderer_GetDOD(_r: HGRenderer, _node: HGNode | null): HGRect {
  throw new Error("HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode — reached from GetDOD tail @0xfd238; not yet transcribed"); // @0xfd238
}

/**
 * `HGCPixelFormatConversion_kV4B_WXYZ_output` — the Helium render-graph
 * node that reads a kV4B-packed source buffer and produces a WXYZ-ordered
 * output at the pipeline exit. Derives from
 * `HgcPixelFormatConversion_kV4B_WXYZ_output` (base compute-kernel,
 * undecoded). No own instance state is visible in the five methods; `this`
 * is passed opaquely to the base D2 and to HGRenderer::GetInput.
 */
export class HGCPixelFormatConversion_kV4B_WXYZ_output {
  /**
   * `HGCPixelFormatConversion_kV4B_WXYZ_output::~HGCPixelFormatConversion_kV4B_WXYZ_output()`
   * (D1 — complete-object dtor) @Helium 0xfd1c0.
   *
   *   @0xfd1c0 pushq %rbp
   *   @0xfd1c1 movq  %rsp, %rbp
   *   @0xfd1c4 popq  %rbp
   *   @0xfd1c5 jmp   __ZN41HgcPixelFormatConversion_kV4B_WXYZ_outputD2Ev
   *
   * Pure tail-call to base D2 — single-inheritance, no field teardown at
   * this layer.
   */
  destroy(): void {
    // @0xfd1c5 jmp base D2
    HgcPixelFormatConversion_kV4B_WXYZ_output_dtor(this);
  }

  /**
   * `HGCPixelFormatConversion_kV4B_WXYZ_output::~HGCPixelFormatConversion_kV4B_WXYZ_output()`
   * (D0 — deleting dtor) @Helium 0xfd1d0.
   *
   *   @0xfd1d0 pushq %rbp
   *   @0xfd1d1 movq  %rsp, %rbp
   *   @0xfd1d4 pushq %rbx
   *   @0xfd1d5 pushq %rax                     ; align
   *   @0xfd1d6 movq  %rdi, %rbx               ; rbx = this
   *   @0xfd1d9 callq base D2
   *   @0xfd1de movq  %rbx, %rdi               ; rdi = this
   *   @0xfd1e1 addq  $0x8, %rsp
   *   @0xfd1e5 popq  %rbx
   *   @0xfd1e6 popq  %rbp
   *   @0xfd1e7 jmp   HGObject::operator delete
   */
  destroyAndDelete(): void {
    // @0xfd1d9 callq base D2
    HgcPixelFormatConversion_kV4B_WXYZ_output_dtor(this);
    // @0xfd1e7 jmp HGObject::operator delete
    HGObject_operatorDelete(this);
  }

  /**
   * `HGCPixelFormatConversion_kV4B_WXYZ_output::GetOutput(HGRenderer*)`
   * @Helium 0xfd1f0.
   *
   *   @0xfd1f0 pushq %rbp
   *   @0xfd1f1 movq  %rsp, %rbp
   *   @0xfd1f4 movq  %rdi, %rax          ; rax = this
   *   @0xfd1f7 popq  %rbp
   *   @0xfd1f8 retq
   *
   * Identity `return this`; renderer arg unread. Same shape as
   * HGCColorGamma_2vuy_xyxz_expand::GetOutput @Helium 0xfcf50.
   */
  GetOutput(_renderer: HGRenderer): HGCPixelFormatConversion_kV4B_WXYZ_output {
    // @0xfd1f4 movq %rdi, %rax — identity return.
    return this;
  }

  /**
   * `HGCPixelFormatConversion_kV4B_WXYZ_output::GetDOD(HGRenderer*, int, HGRect)`
   * @Helium 0xfd200.
   *
   *   @0xfd200 testl %edx, %edx
   *   @0xfd202 je    0xfd213                 ; outputIdx==0 → delegate path
   *   @0xfd204 leaq  _HGRectNull(%rip), %rcx
   *   @0xfd20b movq  (%rcx), %rax
   *   @0xfd20e movq  0x8(%rcx), %rdx
   *   @0xfd212 retq                          ; return HGRectNull
   *   ; outputIdx == 0:
   *   @0xfd213 pushq %rbp
   *   @0xfd214 movq  %rsp, %rbp
   *   @0xfd217 pushq %rbx
   *   @0xfd218 pushq %rax
   *   @0xfd219 movq  %rdi, %rax              ; rax = this
   *   @0xfd21c movq  %rsi, %rdi              ; rdi = renderer
   *   @0xfd21f movq  %rsi, %rbx              ; save renderer
   *   @0xfd222 movq  %rax, %rsi              ; rsi = this
   *   @0xfd225 xorl  %edx, %edx              ; edx = 0
   *   @0xfd227 callq HGRenderer::GetInput
   *   @0xfd22c movq  %rbx, %rdi              ; rdi = renderer
   *   @0xfd22f movq  %rax, %rsi              ; rsi = returned HGNode*
   *   @0xfd232 addq  $0x8, %rsp
   *   @0xfd236 popq  %rbx
   *   @0xfd237 popq  %rbp
   *   @0xfd238 jmp   HGRenderer::GetDOD
   *
   * Semantics: pixel-format conversion is a per-pixel op — DOD passes
   * straight through from input slot 0. outputIdx != 0 → HGRectNull.
   */
  GetDOD(renderer: HGRenderer, outputIdx: number, _requested: HGRect): HGRect {
    // @0xfd200 testl %edx,%edx ; @0xfd202 je → outputIdx==0 delegates.
    const edx = outputIdx | 0;
    if (edx !== 0) {
      // @0xfd204 leaq _HGRectNull ; @0xfd212 retq
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xfd227 GetInput(renderer, this, 0)
    const inputNode = HGRenderer_GetInput(renderer, this, 0);
    // @0xfd238 jmp GetDOD(renderer, inputNode) — tail-call.
    return HGRenderer_GetDOD(renderer, inputNode);
  }

  /**
   * `HGCPixelFormatConversion_kV4B_WXYZ_output::GetROI(HGRenderer*, int, HGRect)`
   * @Helium 0xfd240.
   *
   * ABI: %rdi=this, %rsi=renderer (unread), %edx=inputIdx, (%rcx,%r8)=requested.
   * Return: rax:rdx.
   *
   *   @0xfd240 movq  %rcx, %rax                ; rax = requested.lo
   *   @0xfd243 testl %edx, %edx
   *   @0xfd245 je    0xfd25a                   ; inputIdx==0 → passthrough
   *   @0xfd247 pushq %rbp
   *   @0xfd248 movq  %rsp, %rbp
   *   @0xfd24b leaq  _HGRectNull(%rip), %rcx
   *   @0xfd252 movq  (%rcx), %rax              ; rax = null.lo
   *   @0xfd255 movq  0x8(%rcx), %r8            ; r8  = null.hi
   *   @0xfd259 popq  %rbp
   *   @0xfd25a movq  %r8, %rdx                 ; rdx = high half of return
   *   @0xfd25d retq
   *
   * Semantics: for input slot 0 the requested rect passes through
   * unchanged (a pure per-pixel format conversion has ROI == requested).
   * Any other input slot → HGRectNull. Same shape as HGCColorGamma_bias
   * @Helium 0xfd550.
   */
  GetROI(_renderer: HGRenderer, inputIdx: number, requested: HGRect): HGRect {
    // @0xfd243 testl %edx,%edx ; @0xfd245 je 0xfd25a — inputIdx==0 passes
    // requested straight through; anything else short-circuits to HGRectNull.
    const edx = inputIdx | 0;
    if (edx !== 0) {
      // @0xfd24b leaq _HGRectNull ; @0xfd25d retq
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xfd240 mov rax,rcx ; @0xfd25a mov rdx,r8 — 16B struct flows straight
    // through to the return regs.
    return {
      x: requested.x | 0,
      y: requested.y | 0,
      right: requested.right | 0,
      bottom: requested.bottom | 0,
    };
  }
}
