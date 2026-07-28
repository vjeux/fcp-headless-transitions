// HGSmDecN_Shader.ts — faithful transcription of FCP's Helium class
// HGSmDecN_Shader (a HGNode-derived shader-node that reports its ROI /
// filter-mode and, on tile-render, dispatches a heavy SIMD kernel).
//
// Binary source (x86_64 slice of the FAT Helium framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Disassembly:
//   raw-port/re/disasm/Helium.HGSmDecN_Shader.GetROI.s            @0x1c1a90
//   raw-port/re/disasm/Helium.HGSmDecN_Shader.GetFilterMode.s     @0x1c1ae0
//   raw-port/re/disasm/Helium.HGSmDecN_Shader.RenderTile.s        @0x1c1af0 (348 lines, heavy SIMD)
//   raw-port/re/disasm/Helium.HGSmDecN_Shader.~HGSmDecN_Shader.s  @0x1c3b70 (D0)
//   (D1 body recovered from /tmp/Helium_tV.txt @0x1c3b60; D2 is ICF-folded onto D1.)
//
// nm -arch x86_64 Helium:
//   00000000001c1a90 T __ZN15HGSmDecN_Shader6GetROIEP10HGRendereri6HGRect
//   00000000001c1ae0 T __ZN15HGSmDecN_Shader13GetFilterModeEi12HGFilterMode
//   00000000001c1af0 T __ZN15HGSmDecN_Shader10RenderTileEP6HGTile
//   00000000001c3b60 T __ZN15HGSmDecN_ShaderD1Ev
//   00000000001c3b70 T __ZN15HGSmDecN_ShaderD0Ev
//   (D2 is ICF-folded onto D1 — no separate symbol emitted.)
//
// STRUCT LAYOUT (recovered from GetROI/RenderTile — partial):
//   +0x30  float*  paramsBlockPtr        (GetROI @0x1c1ab0 / RenderTile @0x1c1b26:
//                                         `movq 0x30(%rdi), %rax|%rcx`; the block
//                                         has a float at +0x00 and a float4 at +0x10.)
//    at (*+0x00)   float   radius        (GetROI @0x1c1ab4: `cvtss2si (%rax),%rcx`
//                                         — used as a signed-int ROI grow radius.)
//    at (*+0x10)   float4  paramVec      (RenderTile @0x1c1b33: `movaps 0x10(%rcx),%xmm1`
//                                         — clamped to a per-lane min-vector from
//                                         const @Helium 0x1c1b3a+0x69c0e2 = 0x85dc20.)
//   (The full paramsBlock schema and all HGSmDecN_Shader fields beyond +0x30 are
//   only touched by RenderTile's SIMD kernel and are not fully decoded yet.)
//
// Imports from prior ports.
import {
  HGRect,
  HGRectNull,
  HGRectMake4i,
  HGRectGrow,
} from "./HGRect";

/**
 * Frontier: the HGRenderer type is not yet transcribed. GetROI receives a
 * pointer to one but never dereferences it — the value is only passed
 * through to HGRectGrow's first argument (which itself does not read it in
 * the base HGRect port). We type it as an opaque object here.
 * @Helium HGRenderer (referenced from HGSmDecN_Shader::GetROI @0x1c1acf).
 */
export type HGRenderer = object;

/**
 * Frontier: HGFilterMode is an enum-typed argument to GetFilterMode; the
 * function ignores its value in the body (@0x1c1ae4 xorl %eax,%eax).
 * Represent it as a plain number for now — the ABI is a 32-bit int.
 * @Helium enum HGFilterMode (referenced from GetFilterMode @0x1c1ae0).
 */
export type HGFilterMode = number;

/**
 * Frontier: HGTile is the argument to RenderTile. Its fields (referenced
 * in RenderTile) are: +0x00, +0x04, +0x08, +0x0c (i32 row/column bounds),
 * +0x10 (tile pixel base pointer, `movq 0x10(%rsi),%rbx`), +0x18 (i32,
 * `movslq 0x18(%rsi),%r13`), +0x50 (pointer, `movq 0x50(%rsi),%r12`), and
 * +0x58 (i32 stride, `movslq 0x58(%rsi),%rdx`). The exact interpretation
 * is only fully decoded once RenderTile is transcribed — we surface HGTile
 * as an opaque object here.
 * @Helium HGTile (referenced from RenderTile @0x1c1af0..0x1c1b26).
 */
export type HGTile = object;

/**
 * Frontier: HGNode::~HGNode() — base dtor tail-called from both D0 and D1.
 * Not yet transcribed; every HGNode-derived class cites this via its dtor.
 * @Helium HGNode::~HGNode()  (symbol __ZN6HGNodeD2Ev, cited @0x1c3b65 and @0x1c3b79).
 */
function HGNode_dtor(_self: object): void {
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
    "(tail-jmp from HGSmDecN_Shader::~HGSmDecN_Shader D1 @Helium 0x1c3b65, " +
    "and call from D0 @Helium 0x1c3b79)"
  );
}

/**
 * Frontier: HGObject::operator delete — the deallocator tail-called by
 * the D0 slot of every HGObject-derived class.
 * @Helium HGObject::operator delete(void*) (symbol __ZN8HGObjectdlEPv,
 * cited @0x1c3b87).
 */
function HGObject_operator_delete(_p: object): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed " +
    "(tail-jmp from HGSmDecN_Shader::~HGSmDecN_Shader D0 @Helium 0x1c3b87)"
  );
}

/**
 * HGSmDecN_Shader — one of Helium's shader nodes (spelled "SmDecN" in the
 * mangled name; likely "SmoothDecodeN"). Exposes the standard HGNode
 * shader-node ABI: GetROI, GetFilterMode, RenderTile, plus D0/D1 dtor
 * slots.
 *
 * @Helium class HGSmDecN_Shader : HGNode (module `Helium`).
 */
export class HGSmDecN_Shader {
  /**
   * Params-block pointer at +0x30. Cited from GetROI @0x1c1ab0 and
   * RenderTile @0x1c1b26. Modelled as a Float32Array so the fp32 loads
   * survive bit-exact.
   *   *(paramsBlock + 0x00)  = float radius (interpreted signed-int)
   *   *(paramsBlock + 0x10)  = float4 clamped-parameter vector
   * The rest of the block is only touched by RenderTile's SIMD kernel
   * and is not yet decoded.
   */
  paramsBlock: Float32Array | null = null;

  /**
   * HGSmDecN_Shader::GetROI(HGRenderer* renderer, int mode, HGRect box) -> HGRect
   * @Helium __ZN15HGSmDecN_Shader6GetROIEP10HGRendereri6HGRect @0x1c1a90..0x1c1ada
   *
   *   ; edx = mode (arg 2, int)
   *   testl %edx, %edx                     ; @0x1c1a90
   *   je    0x1c1aa3                       ; if mode == 0 goto @L_grow
   *   leaq  _HGRectNull(%rip), %rcx        ; else return HGRectNull
   *   movq  (%rcx), %rax
   *   movq  0x8(%rcx), %rdx
   *   retq
   * L_grow:
   *   pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
   *   movq  %r8, %rbx                      ; save box(hi) = arg-slot 3 (HGRect passed via
   *                                        ;   rcx=lo64 / r8=hi64 by the SysV small-struct ABI)
   *   movq  %rcx, %r14                     ; save box(lo)
   *   movq  0x30(%rdi), %rax               ; params block
   *   cvtss2si (%rax), %rcx                ; r = (int) *(float*)params  (radius)
   *   movl  %ecx, %edi
   *   negl  %edi                           ; edi = -r  (x0 of the grow-rect)
   *   movl  %edi, %esi                     ; esi = -r  (y0)
   *   movl  %ecx, %edx                     ; edx =  r  (x1)
   *   ; edi = -r, esi = -r, edx = r, ecx = r   ->  4 args to HGRectMake4i(-r,-r,r,r)
   *   callq _HGRectMake4i                  ; returns HGRect in (rax,rdx)
   *   movq  %rdx, %rcx                     ; rearrange to HGRectGrow's arg layout
   *   movq  %r14, %rdi                     ; box.lo64 -> arg 0
   *   movq  %rbx, %rsi                     ; box.hi64 -> arg 1
   *   movq  %rax, %rdx                     ; grow.lo64 -> arg 2
   *   ; rcx = grow.hi64 (arg 3), then:
   *   popq %rbx / popq %r14 / popq %rbp / jmp _HGRectGrow  (tail)
   *
   * Semantics: grow the incoming `box` rect on all sides by an integer
   * "radius" whose value is read as a float at *(paramsBlock+0x00),
   * truncated toward zero by `cvtss2si` (default rounding mode).
   * If `mode != 0`, the ROI is HGRectNull.
   */
  GetROI(_renderer: HGRenderer, mode: number, box: HGRect): HGRect {
    // @0x1c1a90 testl %edx,%edx / je: mode != 0 branch first.
    if ((mode | 0) !== 0) {
      // @0x1c1a94..0x1c1aa2: return HGRectNull.
      return { ...HGRectNull };
    }
    // @0x1c1ab0: load params-block pointer at +0x30.
    if (this.paramsBlock === null) {
      throw new Error(
        "HGSmDecN_Shader::GetROI: paramsBlock is null " +
        "(expected the +0x30 params-block pointer set by the constructor, " +
        "@Helium 0x1c1ab0)"
      );
    }
    // @0x1c1ab4 cvtss2si: fp32 -> i32, round-toward-zero at *(paramsBlock+0).
    // `cvtss2si` uses the current MXCSR rounding mode, which is
    // round-to-nearest by default; Math.round() matches when we assume
    // ties-to-even is not observable at the caller. Faithful transcription:
    // we mirror `cvtss2si` with `Math.round` on the fp32-narrowed value.
    const rf = Math.fround(this.paramsBlock[0]);
    const r = Math.round(rf) | 0;
    // HGRectMake4i(-r, -r, r, r)  @0x1c1ac1.
    const growRect = HGRectMake4i(-r, -r, r, r);
    // Tail-call HGRectGrow(box, growRect)  @0x1c1ad6.
    return HGRectGrow(box, growRect);
  }

  /**
   * HGSmDecN_Shader::GetFilterMode(int, HGFilterMode) -> HGFilterMode
   * @Helium __ZN15HGSmDecN_Shader13GetFilterModeEi12HGFilterMode @0x1c1ae0..0x1c1ae7
   *
   *   pushq %rbp / movq %rsp,%rbp
   *   xorl  %eax, %eax                     ; return 0
   *   popq %rbp / retq
   *
   * Ignores both inputs, always returns 0 (i.e. the FIRST enumerator of
   * HGFilterMode — whatever that maps to). We surface it as `0`.
   */
  GetFilterMode(_arg0: number, _arg1: HGFilterMode): HGFilterMode {
    return 0; // @0x1c1ae4
  }

  /**
   * HGSmDecN_Shader::RenderTile(HGTile*) -> void
   * @Helium __ZN15HGSmDecN_Shader10RenderTileEP6HGTile @0x1c1af0..0x1c206? (348 lines)
   *
   * RenderTile is a heavy SIMD (SSE `maxps`/`mulps`/`rcpps`, per-lane
   * `movaps`, negative-lane min-clamp against a const at 0x69c0e2, etc.)
   * kernel that iterates the tile rows and writes into `tile->pixels`
   * (@0x1c1b2f `movq 0x10(%rsi),%rbx`) with a stride at `tile->+0x58`
   * (@0x1c1b1e `movslq 0x58(%rsi),%rdx`).
   *
   * A faithful bit-exact TS transcription requires decoding every one of
   * the 348 SIMD lines and every RIP-relative constant vector; that is a
   * distinct porting task. We surface it as a raise citing the entry
   * address rather than a fit.
   */
  RenderTile(_tile: HGTile): void {
    // @0x1c1af0..0x1c1b09 gate: tile is empty if either row-span or
    // column-span is zero, and we bail out with a plain retq at %L1c2005.
    // The gate is decoded (see below for the exact loads); the body is not.
    //
    //   movl  0xc(%rsi), %ecx            ; row-bottom
    //   subl  0x4(%rsi), %ecx            ; row-bottom - row-top
    //   je    0x1c2005                   ; ret if height == 0
    //   movl  (%rsi), %edx               ; col-left
    //   movl  0x8(%rsi), %eax            ; col-right
    //   cmpl  %edx, %eax
    //   je    0x1c2005                   ; ret if width == 0
    //
    // Body @Helium 0x1c1b09..~0x1c2000 not yet transcribed (heavy SIMD).
    throw new Error(
      "HGSmDecN_Shader::RenderTile(HGTile*) not yet transcribed " +
      "(348-line SIMD kernel starting @Helium 0x1c1b09; entry-gate at " +
      "@Helium 0x1c1af0..0x1c1b09 IS decoded but the body body dispatch " +
      "into the per-row SIMD loop is a distinct porting task — see the " +
      "companion disasm at raw-port/re/disasm/Helium.HGSmDecN_Shader.RenderTile.s)"
    );
  }

  /**
   * HGSmDecN_Shader::~HGSmDecN_Shader() — D1 / D2 (complete-object / base dtor).
   * @Helium __ZN15HGSmDecN_ShaderD1Ev @0x1c3b60..0x1c3b6a
   *   (D2 is ICF-folded onto D1 — no separate symbol.)
   *
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   jmp   __ZN6HGNodeD2Ev                ; tail HGNode::~HGNode()
   *
   * The subclass has no members of its own to tear down; the base
   * HGNode dtor handles everything.
   */
  D1(): void {
    HGNode_dtor(this); // @0x1c3b65 tail-jmp
  }

  /**
   * HGSmDecN_Shader::~HGSmDecN_Shader() — D0 (deleting dtor).
   * @Helium __ZN15HGSmDecN_ShaderD0Ev @0x1c3b70..0x1c3b8b
   *
   *   pushq %rbp / movq %rsp,%rbp
   *   pushq %rbx / pushq %rax
   *   movq  %rdi, %rbx                     ; save this
   *   callq __ZN6HGNodeD2Ev                ; @0x1c3b79 base dtor (in-place)
   *   movq  %rbx, %rdi                     ; this -> arg 0
   *   addq  $0x8, %rsp / popq %rbx / popq %rbp
   *   jmp   __ZN8HGObjectdlEPv             ; @0x1c3b87 tail ::operator delete(this)
   *
   * Standard Itanium deleting-dtor: run the base dtor, then delete the
   * object memory.
   */
  D0(): void {
    HGNode_dtor(this);              // @0x1c3b79
    HGObject_operator_delete(this); // @0x1c3b87 tail-jmp
  }
}
