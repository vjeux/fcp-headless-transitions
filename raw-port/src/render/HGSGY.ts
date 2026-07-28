// raw-port/src/render/HGSGY.ts
//
// FCP `HGSGY` — Helium sub-graph/render-node with an ARBfp1.0 fragment program
// and a horizontal-derivative 3-tap tile kernel. Subclass of HGNode.
//
// Symbols decoded here (Helium, x86_64 slice; VAs from `otool -tV`):
//   0x1c2650  HGSGY::HGSGY()                      [C2 base ctor;   C1 is ICF-folded onto C2]
//   0x1c2670  HGSGY::GetProgram(HGRenderer*)      [returns &HGSGY_fragmentString @0x85e070]
//   0x1c2680  HGSGY::GetROI(HGRenderer*,int,HGRect)
//   0x1c26d0  HGSGY::GetFilterMode(int,HGFilterMode)   [returns 0 unconditionally]
//   0x1c26e0  HGSGY::RenderTile(HGTile*)
//   0x1c3bc0  HGSGY::~HGSGY()                     [D1; tail-jmp -> HGNode::~HGNode() @0x11bf20]
//   0x1c3bd0  HGSGY::~HGSGY()                     [D0 deleting: D2 body then HGObject::operator delete]
//
// Vtable @Helium 0xa28230  (installed-ptr 0xa28240 written into (this+0x0) by ctor @0x1c265e):
//   *0x00 -> 0x1c3bc0  HGSGY::~HGSGY()      [D1]
//   *0x08 -> 0x1c3bd0  HGSGY::~HGSGY()      [D0]
//   *0xb0 -> 0x1c26e0  HGSGY::RenderTile(HGTile*)
//   *0xb8 -> 0x1c2670  HGSGY::GetProgram(HGRenderer*)
//   (slots 0x10..0xa8 inherited from HGNode — see HGNode.ts. GetROI + GetFilterMode
//    are non-vtable direct-call overrides in this class, called by the renderer via
//    static dispatch — they don't get their own HGNode slot.)
//
// The class carries no fields of its own (ctor writes only the vtable pointer,
// after chaining to HGNode::HGNode). sizeof(HGSGY) == sizeof(HGNode).
//
// ─────────────────────────────────────────────────────────────────────────────
// GetProgram — returns the ARBfp1.0 fragment program text at &HGSGY_fragmentString
// (private symbol __ZL20HGSGY_fragmentString @Helium 0x85e070, file offset 0x3cbce0).
// The full shader body (verbatim from the binary — LEN=254 as declared in header):
//
//   !!ARBfp1.0
//   OUTPUT $o0=result.color;
//   ATTRIB $f1=fragment.texcoord[1];
//   ATTRIB $f2=fragment.texcoord[2];
//   PARAM  $c0={.5,.5,.5,0.};
//   TEMP r0,r1;
//   MOV r0,$c0;
//   TEX r0.x,$f1,texture[1],RECT;
//   MUL r0.x,r0,$f2;
//   SUB r1.x,$f2,$c0;
//   MAX r0.x,r0,$c0;
//   MIN r0.x,r0,r1;
//   TEX $o0,r0,texture[0],RECT;
//   END
//   ##MD5=477cff65:da917a44:8c5626e7:8263fa68
//   ##SIG=00000000:00000002:00000002:00000000:0001:0000:0002:0000:0000:0000:0000:0000:0003:02:0:1:0
//
// ─────────────────────────────────────────────────────────────────────────────
// GetROI @0x1c2680 (arg convention: rdi=this, rsi=renderer, edx=inputIdx,
//   rcx/r8 = HGRect roiOut, r9? = HGRect roi -- 4 int32s per rect passed via
//   __rect calling convention where rcx=lo64, rdx=hi64, r8=... etc.):
//
//   if inputIdx == 0:
//       // Grow input ROI by (-1,-1,+1,+1)  (a 1-pixel border on all sides)
//       g = HGRectMake4i(-1,-1, 1, 1)        // @Helium 0x107710
//       return HGRectGrow(roi, g)            // @Helium 0x107960
//   else:
//       return HGRectNull                    // @Helium 0x3d2284
//
// The 4-instruction fast-return branch @0x1c2684 loads the 16 bytes of
// _HGRectNull as {rax=lo64, rdx=hi64} — the SysV rectangle-return convention.
// The (-1,-1,+1,+1) constants come from the `movl $0xffffffff, %edi/%esi;
// movl $0x1, %edx/%ecx` sequence @0x1c26a0..0x1c26af.
//
// ─────────────────────────────────────────────────────────────────────────────
// GetFilterMode @0x1c26d0 — 4-instruction stub: `xorl %eax,%eax; ret`.
// Returns 0 (== HGFilterMode::Nearest / whatever the 0-th HGFilterMode enum
// value is; we don't invent a name). Not overridden per-input; no branches.
//
// ─────────────────────────────────────────────────────────────────────────────
// RenderTile @0x1c26e0 — a HORIZONTAL-DERIVATIVE 3-TAP TILE KERNEL over pixel
// blocks of size (tileWidth × tileHeight), reading a single input plane and
// writing a single output plane. The disassembly is 178 lines of SSE-unrolled
// stencil work with two branches for tileWidth==1 vs tileWidth>=2, both using
// the SAME kernel coefficients (loaded from a single rodata pair):
//
//   HGTile layout (partial, recovered from the reads in RenderTile — first 16
//   bytes match HGRect exactly per raw-port/src/render/HGTile.ts):
//     +0x00 : int32   left       (rsi+0)
//     +0x04 : int32   top        (rsi+4)
//     +0x08 : int32   right      (rsi+8)
//     +0x0c : int32   bottom     (rsi+0xc)
//     +0x10 : void*   outBuffer  (rsi+0x10 -> r8; f32×4 pixel writes via movaps)
//     +0x18 : int32   outStride  (rsi+0x18 -> r13; << 4 for f32×4 pixel steps)
//     +0x50 : void*   inBuffer   (rsi+0x50 -> rdi; f32×4 pixel reads)
//     +0x58 : int32   inStride   (rsi+0x58 -> r12; << 4 for f32×4 pixel steps)
//
//   height = bottom - top   (0xc - 0x4 fields; if 0, return 0 immediately)
//   width  = right  - left  (0x8 - 0x0)
//
//   Kernel constants (recovered from Helium rodata; single-precision f32):
//     KC0 @Helium 0x85dc50 = 0x41a5af77 = 20.7106762f   (four f32 lanes, all equal)
//     KC1 @Helium 0x85dc60 = 0x416a5089 = 14.6446619f   (four f32 lanes, all equal)
//   These two values also appear at 0x85dc30 (0x3f2cacc3 = 0.6759884f) and
//   0x85dc40 (0x3fb23292 = 1.3921356f) in an adjacent constant table — likely
//   the same operator at a different amplitude. HGSGY uses ONLY 0x85dc50 and
//   0x85dc60 (each broadcast to four f32 lanes) — verified by RIP-relative
//   loads at 0x1c273c, 0x1c2743, 0x1c28d1, 0x1c28d8.
//
//   Per-scanline body (width >= 2 branch @0x1c2721..0x1c28b3, pixels are f32×4
//   RGBA groups iterated column-by-column with `movaps` aligned loads):
//     For each output pixel column i in row y:
//       centerRow   = inBuffer + y*inStride                (rbx path)
//       oppositeRow = inBuffer - y*inStride  ... adjusted   (r14 path, `rdi - r12`)
//       out[i] = KC0 * (in[y,i-1] + in[y,i+1])
//              + KC1 * (in[y,i-2] + in[y,i+2])
//              - KC0 * (in[y_opp,i-1] + in[y_opp,i+1])
//              - KC1 * (in[y_opp,i-2] + in[y_opp,i+2])
//     (i.e. the SAME 5-tap horizontal filter applied to two rows separated by
//     2*inStride, then subtracted — a vertical difference of two
//     horizontally-smoothed rows.)
//
//   The 178-line body has TWO parallel pipelines (pairs of pixels processed
//   per iteration for pipelining; unrolled decrement `addq $-0x2, %r10`) and a
//   width==1 special-case branch @0x1c28b8. Both pipelines use the SAME KC0/KC1
//   coefficients and the SAME row-pair addressing (rdi vs r9 = rdi - 2*inStride
//   at the outer setup, then walked forward each output row).
//
// This is a full-precision pixel kernel with two decoded rodata constants and
// a well-defined algebraic form — it is a candidate for the dlsym oracle once
// the HGTile setup can be constructed by a test harness. Until the surrounding
// HGNode render-graph wiring (Init/Render/GetImage) lands to feed HGTile*
// through, RenderTile is a throw-stub citing @0x1c26e0 so downstream code
// can't silently render zeros.
//
// ─────────────────────────────────────────────────────────────────────────────

import { HGNode } from "./HGNode";
import type { HGRect } from "./HGRect";
import { HGRectMake4i, HGRectGrow, HGRectNull } from "./HGRect";
import type { HGTile } from "./HGTile";

/** HGRenderer forward-declared — its decode is a separate class port. */
export type HGRenderer = object;

/** HGFilterMode is an int enum; the shipped GetFilterMode returns 0 regardless
 *  of the (int inputIdx, HGFilterMode hint) args — so the return type is the
 *  integer value 0 with no invented name. */
export type HGFilterMode = number;

/** The verbatim ARBfp1.0 fragment program stored at Helium __ZL20HGSGY_fragmentString
 *  @0x85e070 (file offset 0x3cbce0). Read byte-for-byte from the binary; not
 *  paraphrased. Consumers pass this to the renderer's ARB fragment-program
 *  compilation entry point. */
export const HGSGY_fragmentString: string =
  "!!ARBfp1.0     \n" +
  "##LEN=0000000254\n" +
  "##                          \n" +
  "##                            \n" +
  "##                                \n" +
  "##                                     \n" +
  "##$\n" +
  "OUTPUT $o0=result.color;\n" +
  "ATTRIB $f1=fragment.texcoord[1];\n" +
  "ATTRIB $f2=fragment.texcoord[2];\n" +
  "PARAM $c0={.5,.5,.5,0.};\n" +
  "##%\n" +
  "TEMP r0,r1;\n" +
  "##@\n" +
  "MOV r0,$c0;\n" +
  "##1\n" +
  "TEX r0.x,$f1,texture[1],RECT;\n" +
  "MUL r0.x,r0,$f2;\n" +
  "SUB r1.x,$f2,$c0;\n" +
  "MAX r0.x,r0,$c0;\n" +
  "MIN r0.x,r0,r1;\n" +
  "##0\n" +
  "TEX $o0,r0,texture[0],RECT;\n" +
  "END\n" +
  "##MD5=477cff65:da917a44:8c5626e7:8263fa68\n" +
  "##SIG=00000000:00000002:00000002:00000000:0001:0000:0002:0000:0000:0000:0000:0000:0003:02:0:1:0\n";

/** Kernel coefficient KC0 @Helium 0x85dc50 — packed f32×4, all lanes equal to
 *  the SAME value 0x41a5af77 == 20.7106762f. Used by RenderTile as the
 *  center-tap coefficient on 5-tap horizontal filter of two rows. */
export const HGSGY_KC0: number = 20.7106761932373; // f32 0x41a5af77

/** Kernel coefficient KC1 @Helium 0x85dc60 — packed f32×4, all lanes equal to
 *  the SAME value 0x416a5089 == 14.6446619f. Used by RenderTile as the
 *  outer-tap coefficient. */
export const HGSGY_KC1: number = 14.6446619033813; // f32 0x416a5089

/**
 * HGSGY — Helium render-graph node.
 *
 * The class is a leaf subclass of HGNode with no data members of its own; its
 * ctor writes only the vtable pointer, chaining to HGNode::HGNode() for all
 * base initialization. See @0x1c2650 disassembly.
 */
export class HGSGY extends HGNode {
  /** ctor @Helium 0x1c2650 (C1 ICF-folded onto C2 body):
   *    pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax;
   *    movq %rdi,%rbx;
   *    callq HGNode::HGNode()             ## @0x11baf0 -> chain-init HGNode fields
   *    leaq  0x865bdb(%rip),%rax          ## rax = 0xa28240  (HGSGY vtable installed-ptr)
   *    movq  %rax,(%rbx)                  ## (this+0)  = vtable
   *    addq  $0x8,%rsp; popq %rbx; popq %rbp; retq
   */
  constructor() {
    // @Helium 0x1c2659: callq HGNode::HGNode() — chains base ctor.
    super();
    // @Helium 0x1c265e-0x1c2665: leaq HGSGY vtable @0xa28240; movq to (this).
    // The TS port doesn't model raw vtable pointers directly — HGNode.ts writes
    // its own vtable field @0xa1d7c8, and virtual dispatch happens via method
    // override. We record the vtable installed-ptr here purely for provenance.
    this.vtable = 0xa28240;
  }

  /**
   * @Helium 0x1c2670  HGSGY::GetProgram(HGRenderer*) — returns the ARBfp1.0
   * fragment-program text pointer. Verbatim body (5 instructions):
   *   pushq %rbp; movq %rsp,%rbp;
   *   leaq  HGSGY_fragmentString(%rip),%rax   ## rax = &@0x85e070
   *   popq  %rbp; retq
   * The `HGRenderer*` argument is unused (not touched by the body).
   */
  GetProgram(_renderer: HGRenderer): string {
    return HGSGY_fragmentString;
  }

  /**
   * @Helium 0x1c2680  HGSGY::GetROI(HGRenderer*, int inputIdx, HGRect roi)
   *
   *   0x1c2680  testl %edx,%edx
   *   0x1c2682  je    0x1c2693              ; if inputIdx == 0 -> compute grow
   *   0x1c2684  leaq  _HGRectNull(%rip),%rcx
   *   0x1c268b  movq  (%rcx),%rax
   *   0x1c268e  movq  0x8(%rcx),%rdx        ; return HGRectNull  (fast path)
   *   0x1c2692  retq
   *   0x1c2693..0x1c26c9 :
   *      HGRectMake4i(-1,-1,+1,+1)  ->  HGRectGrow(roi, result)  (tail-jmp)
   *
   * The (-1,-1,+1,+1) constants come from movl $0xFFFFFFFF (== -1 as i32) into
   * edi/esi and movl $0x1 into edx/ecx  (@0x1c26a0..0x1c26af).
   */
  GetROI(_renderer: HGRenderer, inputIdx: number, roi: HGRect): HGRect {
    if (inputIdx !== 0) {
      // je 0x1c2693 branch NOT taken -> load _HGRectNull  @Helium 0x3d2284
      return HGRectNull;
    }
    // je branch taken -> compute HGRectGrow(roi, {-1,-1,1,1})
    const g = HGRectMake4i(-1, -1, 1, 1); // @Helium 0x107710
    return HGRectGrow(roi, g);            // @Helium 0x107960 (tail-jmp)
  }

  /**
   * @Helium 0x1c26d0  HGSGY::GetFilterMode(int inputIdx, HGFilterMode hint)
   *   pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq
   * Returns 0 unconditionally. Both arguments are unused. The concrete
   * meaning of "0" here is the 0-valued HGFilterMode enumerator — its
   * name is NOT decoded (this class doesn't reveal the enum). Do not
   * invent a name.
   */
  GetFilterMode(_inputIdx: number, _hint: HGFilterMode): HGFilterMode {
    return 0;
  }

  /**
   * @Helium 0x1c26e0  HGSGY::RenderTile(HGTile*)
   *
   * A 5-tap horizontal filter applied to two rows offset by 2*inStride and
   * subtracted (vertical difference of horizontally-smoothed rows), using the
   * decoded kernel coefficients HGSGY_KC0/HGSGY_KC1 (@0x85dc50/0x85dc60). See
   * the class doc-comment for the full pseudo-algebra and struct-layout
   * recovery. 178 asm lines with three code paths:
   *   - early return when height == 0                (@0x1c26e6, ret 0)
   *   - width >= 2 SSE-unrolled pipeline             (@0x1c2721..0x1c28b3)
   *   - width == 1 special case                      (@0x1c28b8..0x1c294d)
   *
   * PORT STATUS (per PORTING_SPEC Rule 3 — throw on undecoded):
   * The kernel numerics are decoded (both KC0 and KC1 constants and the row-
   * pair addressing are recovered), but the OUTER call-site plumbing that
   * feeds HGTile* through — the renderer's tile scheduler, inBuffer/outBuffer
   * lifetime, and the HGTile field layout beyond +0x18 — is not yet ported.
   * Rather than silently render zeros (which would silently corrupt any
   * downstream pixel path that composits this node), we throw with the
   * @0x1c26e0 provenance so callers see a loud gap.
   */
  RenderTile(tile: HGTile): number {
    // Deliberate throw-stub @Helium 0x1c26e0: outer render-graph wiring for
    // HGTile* is not yet transcribed. The kernel numerics (HGSGY_KC0/HGSGY_KC1)
    // are exported for future re-use once HGTile plumbing lands.
    void tile;
    throw new Error(
      "HGSGY::RenderTile @Helium 0x1c26e0 not yet transcribed " +
        "(kernel coeffs decoded @0x85dc50=KC0 20.7106762, @0x85dc60=KC1 14.6446619; " +
        "5-tap horizontal filter on two rows offset by 2*inStride, subtracted; " +
        "requires HGTile field layout past +0x18 + renderer tile scheduler to port faithfully)",
    );
  }

  /**
   * @Helium 0x1c3bc0  HGSGY::~HGSGY() [D1 complete dtor]
   *   pushq %rbp; movq %rsp,%rbp; popq %rbp;
   *   jmp   HGNode::~HGNode()     ## @0x11bf20  (D2 base dtor; tail-jmp)
   * No HGSGY-specific fields exist; dtor is a pure forwarding stub.
   *
   * (D0 deleting dtor @0x1c3bd0 also decoded: calls HGNode::~HGNode() then
   * HGObject::operator delete(void*). The TS runtime has GC; both D0 and D1
   * collapse to a no-op that simply runs the base dtor.)
   */
  destructor(): void {
    // @Helium 0x1c3bc0: pure tail-jmp to HGNode::~HGNode() @0x11bf20 — no
    // HGSGY-specific fields to release. In TS with GC, nothing to do beyond
    // letting the base's own destructor logic run (see HGNode.ts). We keep
    // this method for symmetric-with-C++ provenance only.
  }
}
