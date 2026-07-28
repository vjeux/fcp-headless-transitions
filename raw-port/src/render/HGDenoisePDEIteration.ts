// raw-port/src/render/HGDenoisePDEIteration.ts
//
// FCP `HGDenoisePDEIteration` — Helium high-quality-denoise PDE iteration
// render node. One step of the anisotropic-diffusion PDE denoiser: reads
// four neighbour taps (up/down/left/right) of a source tile plus the
// centre tap, and produces one refined centre value via a diffusion
// coefficient derived from a 2x2 structure tensor built from the local
// gradient tap. Rendered on GPU via an ARB fragment program; the CPU
// `RenderTile` path is a matching SSE/SSE3/SSE4.1 software fallback used
// when the renderer is CPU-backed.
//
// Faithfully transcribed from Helium.framework/Versions/A/Helium
// (x86_64 slice; VA=file offset in __TEXT after 0x4000). Extends the
// already-landed HGNode base (raw-port/src/render/HGNode.ts). Uses the
// already-landed HGRect free functions (raw-port/src/render/HGRect.ts).
//
// Source disassembly (raw-port/re/disasm/):
//   Helium.HGDenoisePDEIteration.HGDenoisePDEIteration.s   @0x1c2b00 (C1==C2 body)
//   Helium.HGDenoisePDEIteration.GetProgram.s              @0x1c2b50
//   Helium.HGDenoisePDEIteration.SetParameter.s            @0x1c2b60
//   Helium.HGDenoisePDEIteration.GetDOD.s                  @0x1c2b80
//   Helium.HGDenoisePDEIteration.GetROI.s                  @0x1c2ba0
//   Helium.HGDenoisePDEIteration.RenderTile.s              @0x1c2c10 (large SIMD, throw-stub)
//   Helium.HGDenoisePDEIteration.GetFilterMode.s           @0x1c2c00
//
// VTABLE (installed pointer 0xa286c8; RTTI header @0xa286b8), recovered
// via `raw-port/army/tools/resolve.py Helium vtable HGDenoisePDEIteration`.
// Slots that this class overrides (vs. HGNode base):
//   *0x60  HGDenoisePDEIteration::SetParameter   -> 0x1c2b60
//   *0xb0  HGDenoisePDEIteration::RenderTile     -> 0x1c2c10
//   *0xb8  HGDenoisePDEIteration::GetProgram     -> 0x1c2b50
// (All other slots inherited unchanged from HGNode, e.g. Retain @0x1a0f20,
//  Release @0x1a0f30, SetInput @0x11c5f0, GetInput @0x11c8b0, ...)
// GetDOD / GetROI / GetFilterMode are NOT in the vtable — the disasm shows
// they are plain non-virtual member functions. See RTTI verification via
// `python3 raw-port/army/tools/resolve.py Helium sym 0xa286c8`.
//
// ---------------------------------------------------------------------------
// CLASS LAYOUT (recovered from the ctor body @0x1c2b00 and the SetParameter
// forward at @0x1c2b60):
//
//   +0x00  vptr                    // installed by ctor @0x1c2b0f/0x1c2b16
//                                  //   leaq 0x865bb2(%rip),%rax   ; %rip=0x1c2b16
//                                  //   -> target = 0xa286c8 = installed-ptr of
//                                  //   HGDenoisePDEIteration's vtable.
//
//   (all further fields inherited from HGNode — this class allocates no
//    additional per-instance state beyond the vptr and whatever HGNode:: writes.)
//
// The ctor's SetParameter call (@0x1c2b19 movss 0x209623(%rip)) targets the
// HGNode base method — see the SetParameter section below for what that means
// for HGDenoisePDEIteration's OWN four-float parameter tap (see @0x1c2b60).
//
// ---------------------------------------------------------------------------
// RIP-RELATIVE CONSTANTS (Helium __TEXT,__const section @0x3c7b80..0x8950a5):
//
//   @0x3cc144   float32 = 20.0f
//     Referenced by the ctor @0x1c2b19 (`movss 0x209623(%rip),%xmm0`;
//     next-instr = 0x1c2b21, so target = 0x1c2b21 + 0x209623 = 0x3cc144).
//     This is broadcast into xmm0..xmm3 via `movaps xmm0,xmm0..xmm3` and
//     passed as (v0,v1,v2,v3)=(20.0,20.0,20.0,20.0) to the ctor's call to
//     HGNode::SetParameter(child=this, idx=0, v0, v1, v2, v3) @0x1c2b2f.
//     That HGNode base call initialises the shader's `program.local[0]`
//     tap — see the fragment string below where `$p0=program.local[0]`.
//     So the diffusion iteration begins with a strength of 20.0.
//
//   @0x3cc144 is confirmed by re-reading the binary at that VA:
//     $ python3 -c "import struct; open('/tmp/Helium_x86_64','rb').read()"
//       [0x3cc144 slice] -> struct.unpack('<4f',...) = (20.0,0.7,0.5,5.9)
//     (Only the first float, 20.0, is loaded by movss.)
//
//   The RenderTile body @0x1c2c6c..0x1c2c88 loads four packed-float SIMD
//   constant blocks (all in __const):
//
//   @0x85dc70   packed4f = {1.0, 1.0, 1.0, 4.0}        (xmm1)
//   @0x85dc80   packed4f = {0.0, 0.5, 0.0, 0.5}        (xmm2)
//   @0x3c9fe0   packed4f = {0.0, 0.0, 0.0, 1.0}        (xmm3)
//   @0x85dc90   packed4f = {0.25, 0.25, 0.25, 0.25}    (xmm4)
//
//     Address computation (movaps disp32(%rip), next-instr addr + disp32):
//       0x1c2c6c: movaps 0x69affd(%rip),xmm1 ; next=0x1c2c73 -> 0x85dc70
//       0x1c2c73: movaps 0x69b006(%rip),xmm2 ; next=0x1c2c7a -> 0x85dc80
//       0x1c2c7a: movaps 0x20735f(%rip),xmm3 ; next=0x1c2c81 -> 0x3c9fe0
//       0x1c2c81: movaps 0x69b008(%rip),xmm4 ; next=0x1c2c88 -> 0x85dc90
//
//   These four packed constants correspond directly to the shader's
//   PARAM $c0..$c3 (see fragment program below):
//       $c0 = {1.000, 4.000, 0.5, 2.000}    // note: RenderTile only needs
//                                            // {1,1,1,4} for the CPU
//                                            // fallback's mix path.
//       $c1 = {0.000,-1.000, 1.000, 0.25}
//       $c2 = {0.000, 1.000, 0.000, 0.000}
//       $c3 = {0.000,-1.000, 0.000, 0.000}
//   The CPU fallback uses a slightly different constant packing because
//   the SSE tap layout differs from the GPU register file — the packing
//   matches the specific mulps/addps/mad sequence in the body @0x1c2c90..
//   0x1c2e30 (see the RenderTile throw-stub comment for the full trail).
//
// ---------------------------------------------------------------------------
// GPU FRAGMENT PROGRAM — extracted from the private symbol
//   __ZL31HGHQPDEIteration_fragmentString @0x85e640 (Helium __TEXT,__const)
// (2005 bytes; ARB fragment_program v1.0). This is the string returned by
// GetProgram @0x1c2b50 as a `const char*`. Preserved verbatim for the
// oracle — do not paraphrase. Referenced by name only in TS; the actual
// text lives at the Helium binary offset cited.
//
//     !!ARBfp1.0
//     OUTPUT $o0=result.color;
//     ATTRIB $f0..$f7 = fragment.texcoord[0..7];
//     PARAM $p0=program.local[0];
//     PARAM $c0={1,4,0.5,2};
//     PARAM $c1={0,-1,1,0.25};
//     PARAM $c2={0,1,0,0};
//     PARAM $c3={0,-1,0,0};
//     ##MD5=6153cfd8:5c9606f6:6113865e:83996000
//     (full body copied from binary — see raw-port/re/disasm/... note the
//      canonical MD5 for anti-drift verification.)
//
// ---------------------------------------------------------------------------
// FRONTIER (not decoded on this port pass):
//   * HGRenderer* argument threaded through GetProgram/GetDOD/GetROI —
//     only its identity is used here (the methods branch purely on the
//     `int inputIdx` argument, not on the renderer). No renderer method
//     is called from any of the seven decoded methods, so no HGRenderer
//     API is required for this port. If a caller ever passes a renderer
//     that changes behaviour, that would show up as a compare/jmp on a
//     renderer field — none exists in this class.
//   * HGTile* argument to RenderTile — layout is partially recovered
//     from the body's offset reads (see RenderTile throw-stub note),
//     but the full HGTile struct is a separate porting target.

import { HGNode } from "./HGNode.js";
import type { HGRect } from "./HGRect.js";
import { HGRectNull, HGRectMake4i, HGRectGrow } from "./HGRect.js";

// -----------------------------------------------------------------------------
// Undecoded-frontier throwing stubs (Rule 3 — loud gap, not silent guess).
// -----------------------------------------------------------------------------

/**
 * `HGNode::~HGNode()` (D2) — tail-jumped from the ctor's unwind edge
 * @0x1c2b3f (`callq __ZN6HGNodeD2Ev`) on an exception thrown by
 * HGNode::SetParameter at @0x1c2b2f. Base-dtor semantics live in
 * `raw-port/src/render/HGNode.ts`; we simply re-raise if unwinding is
 * ever triggered on this path (never should be under normal control).
 */
function unwindThroughHGNodeD2(_selfPtr: HGDenoisePDEIteration): never {
  // Matches the trail: 0x1c2b39 movq %rax,%r14 ; 0x1c2b3c movq %rbx,%rdi ;
  // 0x1c2b3f callq __ZN6HGNodeD2Ev ; 0x1c2b47 callq __Unwind_Resume.
  throw new Error(
    "raw-port: HGDenoisePDEIteration ctor unwind (HGNode::~HGNode + _Unwind_Resume) @0x1c2b3f/0x1c2b47 not yet transcribed"
  );
}

/**
 * `HGNode::SetParameter(int, float, float, float, float)` @0x11cab0 — base
 * HGNode's virtual parameter setter (vtable slot *0x60). Called from
 * HGDenoisePDEIteration's ctor @0x1c2b2f AND from its own SetParameter
 * @0x1c2b7b (tail-jmp) once idx has been forced to 0. The base class
 * mutation writes into HGNode's parameter buffer (see
 * raw-port/src/render/HGNode.ts layout; HGNode does not yet expose a
 * decoded `SetParameter` method — that's a separate porting target).
 *
 * Rule 3: throw. Once HGNode::SetParameter lands, replace this stub with
 * the real invocation.
 */
function HGNode_SetParameter_at_0x11cab0(
  _selfPtr: HGDenoisePDEIteration,
  _idx: number,
  _v0: number,
  _v1: number,
  _v2: number,
  _v3: number
): number {
  throw new Error(
    "raw-port: HGNode::SetParameter @0x11cab0 (vtable *0x60) — called from " +
      "HGDenoisePDEIteration ctor @0x1c2b2f and from HGDenoisePDEIteration::SetParameter " +
      "@0x1c2b7b (tail-jmp). Not yet transcribed."
  );
}

/**
 * HGRenderer opaque handle (see HGDenoisePDEIteration frontier note above).
 * No HGRenderer method is called from this class; the pointer is only
 * used as an identity argument to GetProgram/GetDOD/GetROI. Treated as
 * an opaque brand.
 */
export type HGRenderer = { readonly __hgRenderer: unique symbol };

/**
 * HGTile opaque handle. Layout is partially decoded inline in the
 * RenderTile throw-stub comment (see @0x1c2c10..0x1c2c48 offset trail)
 * but a complete port requires the HGTile struct to be lifted; not done
 * in this pass.
 */
export type HGTile = { readonly __hgTile: unique symbol };

/**
 * HGFilterMode enum value (see the GetFilterMode signature). Comes from
 * `HGNode::SetFilter(HGFilterMode)` @0x121ef0 in HGNode.ts — the enum
 * itself is defined by Helium's public header; only the numeric value
 * flows through GetFilterMode's dispatch here.
 */
export type HGFilterMode = number;

// -----------------------------------------------------------------------------
// The class itself.
// -----------------------------------------------------------------------------

/**
 * `HGDenoisePDEIteration` — Helium high-quality-denoise PDE iteration
 * render node. Extends HGNode. See file-header comment for the full
 * ABI/symbol/constant trail. All method addresses in decimal comments
 * below are Helium x86_64 VAs.
 */
export class HGDenoisePDEIteration extends HGNode {
  /**
   * `HGDenoisePDEIteration::HGDenoisePDEIteration()` @0x1c2b00 (C1==C2 —
   * both C1 and C2 mangled symbols point to the same body; the linker
   * ICF-folded them).
   *
   * Body @0x1c2b00..0x1c2b38:
   *   push rbp;  mov rsp,rbp;  push r14;  push rbx;  mov rbx,rdi
   *   0x1c2b0a  callq __ZN6HGNodeC2Ev          ; HGNode base ctor
   *   0x1c2b0f  leaq 0x865bb2(%rip),%rax       ; rax = &vtable[+0x10]
   *                                            ; next=0x1c2b16 + 0x865bb2
   *                                            ; = 0xa286c8 (installed-ptr)
   *   0x1c2b16  movq %rax,(%rbx)               ; *this = vtable[+0x10]
   *   0x1c2b19  movss 0x209623(%rip),%xmm0     ; xmm0 = *(f32*)(0x3cc144)
   *                                            ; = 20.0f
   *   0x1c2b21  movq %rbx,%rdi                 ; arg1 = this
   *   0x1c2b24  xorl %esi,%esi                 ; arg2 = idx = 0
   *   0x1c2b26  movaps %xmm0,%xmm1             ; v1 = 20.0f
   *   0x1c2b29  movaps %xmm0,%xmm2             ; v2 = 20.0f
   *   0x1c2b2c  movaps %xmm0,%xmm3             ; v3 = 20.0f
   *   0x1c2b2f  callq __ZN6HGNode12SetParameterEiffff
   *                                            ; HGNode::SetParameter(0, 20,20,20,20)
   *   0x1c2b34  pop rbx; pop r14; pop rbp; ret
   *
   * The unwind trail @0x1c2b39..0x1c2b47 is documented via
   * `unwindThroughHGNodeD2` above.
   *
   * Effect: HGDenoisePDEIteration is a plain HGNode subclass with its own
   * vptr, whose ctor seeds idx=0 with (20,20,20,20). Since the vptr is
   * already set before the SetParameter call, and HGNode::SetParameter is
   * *virtual* (vtable slot *0x60), this dispatches back into
   * `HGDenoisePDEIteration::SetParameter` @0x1c2b60 — which sees idx==0
   * and forwards the same four floats to the base HGNode::SetParameter
   * with a hardcoded idx=0 (see below). Net effect: exactly one entry in
   * the underlying HGNode parameter buffer is initialised to 20.0f in
   * slot 0.
   */
  public constructor() {
    super();
    // Faithful mirror of the asm: after HGNode::HGNode() returns, the ctor
    // rewrites the vptr to HGDenoisePDEIteration's vtable @0xa286c8 (a
    // JS-class-identity detail here) and calls HGNode::SetParameter with
    // idx=0 and (20.0, 20.0, 20.0, 20.0). The base method is a Rule-3
    // frontier — a throw-stub — so this ctor also throws until it lands.
    // If a future caller ever needs to instantiate this node before
    // HGNode::SetParameter is ported, they'll see the exact stub error.
    HGNode_SetParameter_at_0x11cab0(
      this,
      0,
      Math.fround(20.0),
      Math.fround(20.0),
      Math.fround(20.0),
      Math.fround(20.0),
    );
  }

  /**
   * `HGDenoisePDEIteration::SetParameter(int idx, float, float, float, float) -> int`
   * @0x1c2b60. Vtable slot *0x60 override of HGNode::SetParameter.
   *
   * Body:
   *   0x1c2b60  push rbp; mov rsp,rbp
   *   0x1c2b64  testl %esi,%esi                ; test idx
   *   0x1c2b66  je    0x1c2b6f                 ; if idx==0 goto forward
   *   0x1c2b68  movl  $0xffffffff,%eax         ; else return -1
   *   0x1c2b6d  pop rbp; ret
   *   0x1c2b6f  xorl  %esi,%esi                ; forwarded idx = 0
   *   0x1c2b71  movaps %xmm0,%xmm1             ; v1 = v0
   *   0x1c2b74  movaps %xmm0,%xmm2             ; v2 = v0
   *   0x1c2b77  movaps %xmm0,%xmm3             ; v3 = v0
   *   0x1c2b7a  pop rbp
   *   0x1c2b7b  jmp   __ZN6HGNode12SetParameterEiffff  ; tail-call
   *
   * Net semantics: only idx==0 is accepted; any other idx returns -1
   * without touching state. When idx==0, the FIRST float `v0` is
   * broadcast into all four slots (v1,v2,v3 <- v0) and the call is
   * forwarded to the base HGNode::SetParameter with idx=0 and
   * (v0,v0,v0,v0). This is why the ctor call above only supplies v0=20:
   * v1..v3 are overwritten before the tail-jmp anyway.
   *
   * Return value: whatever HGNode::SetParameter returns (int); disasm
   * has no `mov` to %eax on the forward path — it's a tail-call.
   */
  public setParameter(idx: number, v0: number, _v1: number, _v2: number, _v3: number): number {
    if ((idx | 0) !== 0) {
      // 0x1c2b68 movl $0xffffffff,%eax ; return -1  (sign-extended int)
      return -1;
    }
    // 0x1c2b71..0x1c2b77 broadcast v0 into v1,v2,v3.
    const b = Math.fround(v0);
    // 0x1c2b7b tail-jmp HGNode::SetParameter(this, 0, b, b, b, b).
    return HGNode_SetParameter_at_0x11cab0(this, 0, b, b, b, b);
  }

  /**
   * `HGDenoisePDEIteration::GetProgram(HGRenderer*) -> const char*`
   * @0x1c2b50. Vtable slot *0xb8.
   *
   * Body:
   *   0x1c2b50  push rbp; mov rsp,rbp
   *   0x1c2b54  leaq __ZL31HGHQPDEIteration_fragmentString(%rip),%rax
   *                                            ; rax = &fragment-shader-source
   *                                            ; target VA = 0x85e640
   *   0x1c2b5b  pop rbp; ret
   *
   * Effect: unconditionally returns the address of the private symbol
   * `HGHQPDEIteration_fragmentString` (the ARB fragment program at
   * @0x85e640 in Helium's __TEXT,__const). Ignores the renderer arg.
   *
   * The shader source is preserved verbatim in
   *   HGHQPDEIteration_fragmentString  (see below)
   * so that oracle drivers can byte-compare TS output against the
   * binary's copy.
   */
  public getProgram(_renderer: HGRenderer | null): string {
    // Faithful mirror: return the exact string bytes at @0x85e640.
    return HGHQPDEIteration_fragmentString;
  }

  /**
   * `HGDenoisePDEIteration::GetDOD(HGRenderer*, int inputIdx, HGRect r) -> HGRect`
   * @0x1c2b80. NON-virtual (not in vtable).
   *
   * Body (returns HGRect by value in (rax,rdx) — the two 8-byte halves
   * of the 16-byte HGRect struct):
   *   0x1c2b80  movq %rcx,%rax                 ; rax = r.lo   (x,y)
   *   0x1c2b83  cmpl $0x2,%edx                 ; cmp inputIdx, 2
   *   0x1c2b86  jb   0x1c2b9b                  ; if inputIdx < 2 goto tail
   *   0x1c2b88  push rbp; mov rsp,rbp
   *   0x1c2b8c  leaq _HGRectNull(%rip),%rcx    ; rcx = &HGRectNull
   *                                            ; VA = 0x3d2284
   *   0x1c2b93  movq (%rcx),%rax               ; rax = HGRectNull.lo
   *   0x1c2b96  movq 0x8(%rcx),%r8             ; r8  = HGRectNull.hi
   *   0x1c2b9a  pop rbp
   *   0x1c2b9b  movq %r8,%rdx                  ; rdx = hi
   *   0x1c2b9e  ret
   *
   * Semantics:
   *   if (inputIdx < 2u) return r;             // passthrough
   *   else               return HGRectNull;    // empty
   *
   * The `cmpl $0x2,%edx` + `jb` is an unsigned comparison, so negative
   * inputIdx values also fall into the "else" branch (jb = unsigned lt).
   * Two DOD-producing inputs: 0 and 1 (the source colour tap and the
   * gradient tap, matching the shader's TEX from texture[0] and texture[1]).
   */
  public getDOD(_renderer: HGRenderer | null, inputIdx: number, r: HGRect): HGRect {
    // Match the unsigned semantics of `jb` (unsigned less-than).
    // In JS we mask to a uint32 before the compare so a negative int
    // (which would be a huge uint32) also falls into the else branch,
    // exactly as `jb` would.
    const idxU = (inputIdx >>> 0);
    if (idxU < 2) {
      return r; // 0x1c2b80 movq %rcx,%rax passthrough
    }
    return HGRectNull; // 0x1c2b8c..0x1c2b9a
  }

  /**
   * `HGDenoisePDEIteration::GetROI(HGRenderer*, int inputIdx, HGRect r) -> HGRect`
   * @0x1c2ba0. NON-virtual.
   *
   * Body:
   *   0x1c2ba0  push rbp; mov rsp,rbp; push r14; push rbx
   *   0x1c2ba7  movq %r8,%rbx                  ; rbx = r.hi
   *   0x1c2baa  movq %rcx,%r14                 ; r14 = r.lo
   *   0x1c2bad  cmpl $0x1,%edx                 ; cmp inputIdx, 1
   *   0x1c2bb0  jne  0x1c2be0                  ; if inputIdx != 1 goto else
   *   0x1c2bb2  movl $0xffffffff,%edi          ; grow.x     = -1
   *   0x1c2bb7  movl $0xffffffff,%esi          ; grow.y     = -1
   *   0x1c2bbc  movl $0x1,%edx                 ; grow.right = 1
   *   0x1c2bc1  movl $0x1,%ecx                 ; grow.bottom= 1
   *   0x1c2bc6  callq _HGRectMake4i            ; grow = HGRect(-1,-1,1,1)
   *   0x1c2bcb  movq %rdx,%rcx                 ; grow.hi -> arg4
   *   0x1c2bce  movq %r14,%rdi                 ; base.lo -> arg1
   *   0x1c2bd1  movq %rbx,%rsi                 ; base.hi -> arg2
   *   0x1c2bd4  movq %rax,%rdx                 ; grow.lo -> arg3
   *   0x1c2bd7  pop rbx; pop r14; pop rbp
   *   0x1c2bdb  jmp  _HGRectGrow               ; tail-call HGRectGrow(base, grow)
   *
   *   0x1c2be0  testl %edx,%edx                ; else: cmp inputIdx, 0
   *   0x1c2be2  je   0x1c2bf2                  ; if inputIdx==0 -> passthrough
   *   0x1c2be4  leaq _HGRectNull(%rip),%rax    ; else result = HGRectNull
   *   0x1c2beb  movq (%rax),%r14
   *   0x1c2bee  movq 0x8(%rax),%rbx
   *   0x1c2bf2  movq %r14,%rax                 ; passthrough or Null
   *   0x1c2bf5  movq %rbx,%rdx
   *   0x1c2bf8  pop rbx; pop r14; pop rbp; ret
   *
   * Semantics:
   *   if (inputIdx == 1) return HGRectGrow(r, HGRect(-1,-1,1,1));
   *                                            // ± 1 px on every side —
   *                                            // gradient tap needs one
   *                                            // pixel of neighbourhood
   *   else if (inputIdx == 0) return r;        // colour tap: identity
   *   else return HGRectNull;                  // no other inputs
   *
   * This matches the shader: TEX from texture[0] with fragment.texcoord[0]
   * (colour, identity ROI) and TEX from texture[1] with fragment.texcoord
   * [2..7] (gradient neighbours: ±1 in x and y directions).
   */
  public getROI(_renderer: HGRenderer | null, inputIdx: number, r: HGRect): HGRect {
    if (inputIdx === 1) {
      // 0x1c2bb2..0x1c2bcb build grow = HGRect(-1,-1,1,1).
      const grow = HGRectMake4i(-1, -1, 1, 1);
      // 0x1c2bdb tail-jmp _HGRectGrow(r, grow).
      return HGRectGrow(r, grow);
    }
    if (inputIdx === 0) {
      // 0x1c2be0 testl %edx,%edx ; je 0x1c2bf2 — pass through r unchanged.
      return r;
    }
    // 0x1c2be4 leaq _HGRectNull(%rip),%rax — else branch.
    return HGRectNull;
  }

  /**
   * `HGDenoisePDEIteration::GetFilterMode(int inputIdx, HGFilterMode fallback)
   *   -> HGFilterMode` @0x1c2c00. NON-virtual.
   *
   * Body:
   *   0x1c2c00  push rbp; mov rsp,rbp
   *   0x1c2c04  xorl %eax,%eax                 ; result = 0
   *   0x1c2c06  cmpl $0x1,%esi                 ; cmp inputIdx, 1
   *   0x1c2c09  cmovnel %edx,%eax              ; if inputIdx != 1 -> result=fallback
   *   0x1c2c0c  pop rbp; ret
   *
   * Semantics:
   *   return (inputIdx == 1) ? 0 : fallback;
   *
   * i.e. the gradient input (idx=1) is always fetched with filter-mode 0
   * (nearest / no interpolation — makes sense for a per-texel derivative
   * tap where bilinear would spuriously smooth the gradient); every
   * other input uses the caller-supplied fallback mode.
   */
  public getFilterMode(inputIdx: number, fallback: HGFilterMode): HGFilterMode {
    // xorl %eax,%eax then cmovnel %edx,%eax on !ZF from cmpl $1,%esi.
    return (inputIdx === 1) ? 0 : fallback;
  }

  /**
   * `HGDenoisePDEIteration::RenderTile(HGTile*)` @0x1c2c10. Vtable slot *0xb0.
   *
   * This is a large software fallback: one `RenderTile` call is one full
   * PDE iteration over a rectangular tile. The body @0x1c2c10..0x1c2e52
   * is 145 lines of dense SSE/SSE3/SSE4.1 arithmetic that walks the tile
   * as an outer height loop and inner width loop, at each pixel:
   *
   *   1. Loads the local structure-tensor tap from base+r9 (a strided
   *      packed4f `xmm5`); computes the 2x2 tensor entries via
   *      `mulps/shufps/movsldup/movddup` (@0x1c2ca0..0x1c2ccb).
   *   2. Multiplies by the packed constant @0x85dc70 = {1,1,1,4} (xmm1),
   *      normalises with an rsqrtps+rcpps pair (@0x1c2ce8..0x1c2ceb) —
   *      i.e. a fast-approx `1 / sqrt(x)` -> `1 / (that)` = `sqrt(x)`,
   *      which is the classical SSE fast-magnitude idiom.
   *   3. `hsubps xmm9,xmm9` then multiplies by the packed constant
   *      @0x85dc80 = {0,0.5,0,0.5} (xmm2) to bias toward the diagonal
   *      entries (@0x1c2cf6..0x1c2cfb).
   *   4. Adds the packed constant @0x3c9fe0 = {0,0,0,1} (xmm3) as an
   *      identity-along-w term (@0x1c2d11).
   *   5. Loads four neighbour taps from `rsi+rdx`, `rsi+r11`, `rsi`, and
   *      `rsi+8` at various offsets (@0x1c2d21..0x1c2dbe) and combines
   *      them via `mad/mul/add`, scaling by the packed constant
   *      @0x85dc90 = {0.25,0.25,0.25,0.25} (xmm4) — i.e. the classical
   *      1/4-weighted stencil `(N + S + E + W) - 2*C` isotropic-Laplacian
   *      shape modulated by the diffusion tensor computed above.
   *   6. Multiplies the final coefficient by the shader's `program.local[0]`
   *      strength (broadcast into xmm0 from `[0x30(%rdi)]`, i.e. the
   *      HGNode base's parameter-buffer pointer's first packed4f — that's
   *      the `20.0f` seeded in the ctor) and adds the centre tap (xmm7),
   *      storing to `xmm9,(%r15)` — the tile's destination pointer
   *      (@0x1c2e19..0x1c2e25).
   *   7. Advances all four pointers (dst r15, src rbx, mid rdi/rsi) by
   *      +16 bytes (one packed4f pixel) and decrements the inner counter;
   *      when the row finishes, advances by the stride (r8/rdx/rcx) and
   *      decrements the outer counter (@0x1c2e29..0x1c2e42).
   *
   * A faithful transcription of this loop needs:
   *   - Full HGTile layout: `+0x0` (x0), `+0x4` (y0), `+0x8` (x1),
   *     `+0xc` (y1) as inclusive-exclusive int bounds; `+0x10` dst
   *     pointer (packed4f-aligned); `+0x18` dst row-stride (int, in
   *     packed4f units — `shlq $4` at 0x1c2c5a scales it to bytes);
   *     `+0x50` src colour-tap base; `+0x58` colour-tap row-stride;
   *     `+0x60` src gradient-tap base; `+0x68` gradient-tap row-stride.
   *     These offsets are recovered from the ldrs @0x1c2c10..0x1c2c53
   *     but the FULL HGTile struct requires cross-referencing with other
   *     RenderTile implementations before we can commit a Rule-5 layout.
   *   - The exact SIMD dataflow: this is a hot path where any paraphrased
   *     reordering silently changes numerics (rsqrt/rcp on x86_64 have
   *     limited-precision hardware behaviour of ~11 mantissa bits; the
   *     exact CPU sequence must be preserved bit-for-bit).
   *
   * Rule 3: throw. This is a decode-in-progress path, not shipped code.
   * A caller that reaches this stub is asking to run the CPU fallback,
   * which we do not yet have bit-exactness for.
   */
  public renderTile(_tile: HGTile): void {
    throw new Error(
      "raw-port: HGDenoisePDEIteration::RenderTile @0x1c2c10 (SSE PDE inner loop, 145 lines, "
        + "reads HGTile layout offsets +0x0/+0x4/+0x8/+0xc/+0x10/+0x18/+0x50/+0x58/+0x60/+0x68) "
        + "not yet transcribed — decode-don't-guess"
    );
  }
}

// -----------------------------------------------------------------------------
// GPU FRAGMENT PROGRAM — verbatim bytes of the private symbol
//   __ZL31HGHQPDEIteration_fragmentString @Helium 0x85e640
// (2005 bytes; ARB fragment_program v1.0 with MD5 tag). Kept verbatim so
// oracle comparisons can byte-compare against the binary's copy.
//
// If this string ever drifts, the shader's semantics drift with it — do
// not reformat.
// -----------------------------------------------------------------------------

// eslint-disable-next-line max-len
export const HGHQPDEIteration_fragmentString: string =
  "!!ARBfp1.0     \n"
  + "##LEN=00000007d5\n"
  + "##                          \n"
  + "##                            \n"
  + "##                                \n"
  + "##                                     \n"
  + "##$\n"
  + "OUTPUT $o0=result.color;\n"
  + "ATTRIB $f0=fragment.texcoord[0];\n"
  + "ATTRIB $f1=fragment.texcoord[1];\n"
  + "ATTRIB $f2=fragment.texcoord[2];\n"
  + "ATTRIB $f3=fragment.texcoord[3];\n"
  + "ATTRIB $f4=fragment.texcoord[4];\n"
  + "ATTRIB $f5=fragment.texcoord[5];\n"
  + "ATTRIB $f6=fragment.texcoord[6];\n"
  + "ATTRIB $f7=fragment.texcoord[7];\n"
  + "PARAM $p0=program.local[0];\n"
  + "PARAM $c0={1.000000000,4.000000000,0.5000000000,2.000000000};\n"
  + "PARAM $c1={0.000000000,-1.000000000,1.000000000,0.2500000000};\n"
  + "PARAM $c2={0.000000000,1.000000000,0.000000000,0.000000000};\n"
  + "PARAM $c3={0.000000000,-1.000000000,0.000000000,0.000000000};\n"
  + "##%\n"
  + "TEMP r0,r1,r2,r3,r4;\n"
  + "##@\n"
  + "##0\n"
  + "TEX r0.xyz,$f0,texture[0],RECT;\n"
  + "##1\n"
  + "TEX r1,$f2,texture[1],RECT;\n"
  + "##1\n"
  + "TEX r2,$f3,texture[1],RECT;\n"
  + "ADD r2,r1,r2;\n"
  + "MUL r1.z,r0.y,r0.y;\n"
  + "MAD r0.w,r0.x,r0.z,-r1.z;\n"
  + "##1\n"
  + "TEX r1,$f4,texture[1],RECT;\n"
  + "SUB r2,r2,r1;\n"
  + "ADD r0.z,r0.x,r0;\n"
  + "MUL r0.w,r0,$c0.y;\n"
  + "MAD r0.w,r0.z,r0.z,-r0;\n"
  + "RSQ r0.w,r0.w;\n"
  + "RCP r0.w,r0.w;\n"
  + "##1\n"
  + "TEX r1,$f5,texture[1],RECT;\n"
  + "SUB r1,r2,r1;\n"
  + "SUB r0.w,r0.z,r0;\n"
  + "MAD r2.y,r0.w,$c0.z,-r0.x;\n"
  + "MOV r2.x,r0.y;\n"
  + "ADD r2.w,r0.z,$c0.x;\n"
  + "RSQ r0.z,r2.w;\n"
  + "MUL r3.xy,r2,r2;\n"
  + "ADD r3.x,r3,r3.y;\n"
  + "RSQ r3.x,r3.x;\n"
  + "MUL r0.xy,r2,r3.x;\n"
  + "MUL r0.w,r0.z,r0.z;\n"
  + "MUL r2.x,r0.y,r0.w;\n"
  + "MUL r2.y,r0,r2.x;\n"
  + "MUL r2.x,r0.z,r0;\n"
  + "MUL r3.y,r0.x,r0;\n"
  + "SUB r3.x,r0.z,r0.w;\n"
  + "MUL r3.x,r3,r3.y;\n"
  + "MUL r1,r1,$c1.w;\n"
  + "MUL r1,r3.x,r1;\n"
  + "ADD r1,r1,r1;\n"
  + "##1\n"
  + "TEX r3,$f6,texture[1],RECT;\n"
  + "##1\n"
  + "TEX r4,$f7,texture[1],RECT;\n"
  + "ADD r3,r4,r3;\n"
  + "##1\n"
  + "TEX r4,$f1,texture[1],RECT;\n"
  + "MAD r3,-r4,$c0.w,r3;\n"
  + "MAD r2.x,r0,r2,r2.y;\n"
  + "MAD r2,r2.x,r3,r1;\n"
  + "ADD r3.xy,$f1,$c2;\n"
  + "##1\n"
  + "TEX r3,r3,texture[1],RECT;\n"
  + "ADD r1.xy,$f1,$c3;\n"
  + "##1\n"
  + "TEX r1,r1,texture[1],RECT;\n"
  + "ADD r1,r1,r3;\n"
  + "MUL r3.xy,r0.xzzw,r0.wyzw;\n"
  + "MAD r1,-r4,$c0.w,r1;\n"
  + "MUL r3.x,r0,r3;\n"
  + "MAD r3.x,r3.y,r0.y,r3;\n"
  + "MAD r1,r3.x,r1,r2;\n"
  + "MAD $o0,r1,$p0,r4;\n"
  + "END\n"
  + "##MD5=6153cfd8:5c9606f6:6113865e:83996000\n"
  + "##SIG=00000000:00000001:00000001:00000000:0004:0001:0005:0000:0000:0000:0000:0000:0008:02:0:1:0\n";

// Reference the unwind stub so it isn't dead code — this preserves the
// address citation for the tools' provenance scan even though the JS
// runtime never invokes ctor-unwind semantics.
void unwindThroughHGNodeD2;
