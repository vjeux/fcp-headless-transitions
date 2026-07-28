// raw-port/src/render/HgcBilateralFilterInterp_Divide.ts
//
// FCP `HgcBilateralFilterInterp_Divide` — Helium framework (Hgc* compute kernel).
// Transcribed from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// (fat slice x86_64 at file offset 0x4000; VAs below are unadjusted VM addresses
//  from `otool -tV`).
//
// Purpose: implements a "divide" step of a bilateral filter interpolator —
// per-texel   out = mulIn * (rcp_clamped(in) * one_plus_half_ulp)   using
// SSE `rcpps` (approximate reciprocal, ~12-bit mantissa precision) and
// bracketing clamps to ±0x5f800000 (±1.844674407e19, i.e. ±2^63 as f32) to
// avoid ±Inf / NaN propagation. The Metal shader source (in GetProgram)
// makes the shape explicit:
//   r1 = fmin(color1, +c0.xxxx);
//   r1 = fmax(r1,     -c0.xxxx);
//   r1 = 1.00000f / r1;
//   r1 = fmin(r1, +c0.xxxx); r1 = fmax(r1, -c0.xxxx);
//   output.color0 = color0 * r1;
// where c0.x = 1.844674407e+19f.
//
// The CPU RenderTile paths INTRODUCE an extra multiplication by params[+0x40]
// = <1.000244..., 1.000244..., 1.000244..., 1.000244...> = 1 + 2^-12 after the
// rcpps (which is a well-known Newton-refinement seed correction — same
// constant used by HgcVibrancy and HgcBilateralFilterInterpSC_InterpolatorLastY).
// This constant is HARD-CODED at construction (uniform buffer slot 2, +0x40) —
// SetParameter is a no-op that returns -1, so the CPU-side math is
// deterministic per-instance.
//
// Disassembly files (in raw-port/re/disasm/):
//   Helium.HgcBilateralFilterInterp_Divide.GetProgram.s                    (14 lines)
//   Helium.HgcBilateralFilterInterp_Divide.InitProgramDescriptor.s        (159 lines) [throw-stub]
//   Helium.HgcBilateralFilterInterp_Divide.shaderDescription.s             (24 lines)
//   Helium.HgcBilateralFilterInterp_Divide.BindTexture.s                   (58 lines) [throw-stub]
//   Helium.HgcBilateralFilterInterp_Divide.Bind.s                           (9 lines)
//   Helium.HgcBilateralFilterInterp_Divide.RenderTile_AVX.s               (158 lines) [throw-stub]
//   Helium.HgcBilateralFilterInterp_Divide.RenderTile.s                    (71 lines)
//   Helium.HgcBilateralFilterInterp_Divide.GetDOD.s                        (13 lines)
//   Helium.HgcBilateralFilterInterp_Divide.GetROI.s                        (13 lines)
//   Helium.HgcBilateralFilterInterp_Divide.HgcBilateralFilterInterp_Divide.s (41 lines)  (C1)
//   Helium.HgcBilateralFilterInterp_Divide.~HgcBilateralFilterInterp_Divide.s (23 lines) (D0)
//   Helium.HgcBilateralFilterInterp_Divide.SetParameter.s                   (7 lines)
//   Helium.HgcBilateralFilterInterp_Divide.GetParameter.s                   (7 lines)
//   Helium.HgcBilateralFilterInterp_Divide.GetOutput.s                      (7 lines)
//   (C2 @0x31ab00 body identical to C1; D2 @0x31ac40 and D1 @0x31ac90 identical
//    bodies to each other and shape-identical to D0 modulo the trailing
//    `HGObject::operator delete`; captured inline from /tmp/Helium_tV.txt.)
//
// SEVENTEEN exported symbols (Helium ledger):
//   @Helium 0x31a330  GetProgram(HGRenderer*)
//   @Helium 0x31a360  InitProgramDescriptor(HGProgramDescriptor*) const     [throw-stub]
//   @Helium 0x31a600  shaderDescription() const                             (long-string std::string)
//   @Helium 0x31a660  BindTexture(HGHandler*, int)                          [throw-stub]
//   @Helium 0x31a710  Bind(HGHandler*)
//   @Helium 0x31a730  RenderTile_AVX(HGTile*)                               [throw-stub]
//   @Helium 0x31a9c0  RenderTile(HGTile*)
//   @Helium 0x31aac0  GetDOD(HGRenderer*, int, HGRect)
//   @Helium 0x31aae0  GetROI(HGRenderer*, int, HGRect)
//   @Helium 0x31ab00  C2 HgcBilateralFilterInterp_Divide()                  (base ctor)
//   @Helium 0x31aba0  C1 HgcBilateralFilterInterp_Divide()                  (complete ctor — body identical to C2)
//   @Helium 0x31ac40  D2 ~HgcBilateralFilterInterp_Divide()                 (base dtor)
//   @Helium 0x31ac90  D1 ~HgcBilateralFilterInterp_Divide()                 (complete dtor — body identical to D2)
//   @Helium 0x31ace0  D0 ~HgcBilateralFilterInterp_Divide()                 (deleting dtor)
//   @Helium 0x31ad30  SetParameter(int, float, float, float, float)         (constant -1)
//   @Helium 0x31ad40  GetParameter(int, float*)                             (constant -1)
//   @Helium 0x31ad50  GetOutput(HGRenderer*)                                (returns this)
//
// VTABLE INSTALLED PTR:
//   C1 @0x31abaf  leaq 0x727e02(%rip),%rax => next_rip 0x31abb6 + 0x727e02 = 0xa429b8
//   C2 @0x31ab0f  leaq 0x727ea2(%rip),%rax => next_rip 0x31ab16 + 0x727ea2 = 0xa429b8
//   D0 @0x31ace9  leaq 0x727cc8(%rip),%rax => next_rip 0x31acf0 + 0x727cc8 = 0xa429b8
//   D2 @0x31ac40  leaq 0x727d71(%rip),%rax => next_rip 0x31ac47 + 0x727d71 = 0xa429b8
//   D1 @0x31ac90  leaq 0x727d21(%rip),%rax => next_rip 0x31ac97 + 0x727d21 = 0xa429b8
//   All five sites install the SAME vtable @ Helium file offset 0xa429b8 =
//   __ZTV31HgcBilateralFilterInterp_Divide (`nm` reports it at 0xa429a8 with the
//   canonical Itanium-ABI +0x10 offset applied by the ctor, matching the +0x10
//   "vtable base + sizeof(headers)" convention).
//
// STRUCT LAYOUT (recovered from C1/D0/RenderTile/RenderTile_AVX asm):
//   HgcBilateralFilterInterp_Divide {
//     +0x000  vptr                                             (set = 0xa429b8)
//     +0x008..+0x197  HGNode base subobject                    (from HGNode::HGNode())
//     +0x010  int flags                                        (RMW: (flags & ~0x600) | 0x400)
//     +0x198  void*  alignedUniformBufferPtr                   (32-byte-aligned+8 view
//                                                                into a 0x87-byte alloc;
//                                                                raw ptr stashed at [aligned-8])
//   }
//
// UNIFORM BUFFER LAYOUT (offsets relative to `alignedUniformBufferPtr` = rdx at ctor end,
//                        = *(this + 0x198)):
//   +0x00  4×f32  V_MAX_POSITIVE_2P63    (movaps @0x891930 → +0x08 in raw)
//   +0x10  4×f32  V_MAX_POSITIVE_2P63    (duplicate; movaps @0x891930 → +0x18 in raw)
//   +0x20  4×f32  V_MAX_NEGATIVE_2P63    (movaps @0x891940 → +0x28 in raw)
//   +0x30  4×f32  V_MAX_NEGATIVE_2P63    (duplicate; movaps @0x891940 → +0x38 in raw)
//   +0x40  4×f32  V_ONE_PLUS_HALF_ULP    (movaps @0x85fed0 → +0x48 in raw)
//   +0x50  4×f32  V_ONE_PLUS_HALF_ULP    (duplicate; movaps @0x85fed0 → +0x58 in raw)
//
// Reasoning for the +0x N vs (rcx,rax)+0x M mapping: at C1 @0x31abd0 the ctor sets
// `rdx = raw + rcx + 8 = ALIGNED`, so a store at (rcx+rax)+0x08 corresponds to
// (rdx+0) i.e. UB[+0x00]; (rcx+rax)+0x18 → UB[+0x10]; etc.
//
// DECODED CONSTANT ADDRESSES (via resolve.py Helium const):
//   @Helium 0x891930  u64=0x5f8000005f800000  -> pair of f32 0x5f800000 = +1.844674407e+19  (= 2^63)
//   @Helium 0x891940  u64=0xdf800000df800000  -> pair of f32 0xdf800000 = -1.844674407e+19
//   @Helium 0x85fed0  u64=0x3f8008013f800801  -> pair of f32 0x3f800801 = 1.0002442598342896  (= 1 + 2^-12)
//   All three slots are broadcast <v, v, v, v> (both 8-byte halves identical in u64),
//   consistent with `movaps` loading 16 aligned bytes.
//
// FRONTIER CALLEES (each stub throws with the exact call-site @0xADDR):
//   HGNode::HGNode()                                   @Helium 0x31abaa (C1) / 0x31ab0a (C2)
//   HGNode::~HGNode()                                  @Helium 0x31ac81 (D2 tail-jmp), 0x31acd1 (D1 tail-jmp), 0x31ad10 (D0 mid-body call)
//   operator new[](unsigned long)                      @Helium 0x31abbe (C1) / 0x31ab1e (C2)
//   operator delete(void*)                             @Helium 0x31ac73 (D2), 0x31acc3 (D1), 0x31ad08 (D0)
//   HGObject::operator delete(void*) [deleting-dtor]   @Helium 0x31ad1e (D0 tail-jmp)
//   HGRenderer::GetTarget(unsigned int)                @Helium 0x31a33c (GetProgram), 0x31a9dd (RenderTile)
//   HGTile::Renderer() const                           @Helium 0x31a9d3 (RenderTile)
//   HGHandler vfn *0xc0                                @Helium 0x31a717 (Bind)
//   HGHandler vfn *0x30 / *0x48 / *0xa8                @Helium 0x31a697/0x31a68a/0x31a6f4 (BindTexture)
//   HGHandler::TexCoord(int,int,int,double const*)     @Helium 0x31a6d0 (BindTexture)
//   this->+0x90 sub-object vtable[*0x80]               @Helium 0x31a6e4 (BindTexture)
//   HGProgramDescriptor::Set*/std::vector<HGBinding>*  @Helium 0x31a382..0x31a5d3 (InitProgramDescriptor)

import type { HGRect } from "./HGRect.js";
import { HGRectNull } from "./HGRect.js";

/** Opaque handles for undecoded Helium object types. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };
export type HGTilePtr = { readonly __brand: "HGTile" };
export type HGHandlerPtr = { readonly __brand: "HGHandler" };
export type HGProgramDescriptorPtr = { readonly __brand: "HGProgramDescriptor" };

// ---------------------------------------------------------------------------
// DECODED uniform-buffer constants (byte-verified via resolve.py Helium const).
// ---------------------------------------------------------------------------

/** @Helium __const @0x891930 — <+1.844674407e+19, +1.844674407e+19, +1.844674407e+19, +1.844674407e+19>.
 *  Loaded via `movaps 0x576d51(%rip),%xmm0` @0x31abd8 (RIP-after 0x31abdf + 0x576d51 = 0x891930).
 *  Bits 0x5f800000 = 2^63 as float32; broadcast to all 4 lanes.
 *  Used as the +Inf-safe UPPER clamp in the Metal shader (c0.xxxx) and in
 *  RenderTile / RenderTile_AVX as the `minps` operand `params[+0x00]`. */
const V_MAX_POSITIVE_2P63: readonly [number, number, number, number] = [
  Math.fround(1.844674407e19),
  Math.fround(1.844674407e19),
  Math.fround(1.844674407e19),
  Math.fround(1.844674407e19),
];

/** @Helium __const @0x891940 — <-1.844674407e+19, -1.844674407e+19, -1.844674407e+19, -1.844674407e+19>.
 *  Loaded via `movaps 0x576d50(%rip),%xmm0` @0x31abe9 (RIP-after 0x31abf0 + 0x576d50 = 0x891940).
 *  Bits 0xdf800000 = -2^63 as float32; broadcast to all 4 lanes.
 *  LOWER clamp (`-c0.xxxx` in the shader; `maxps` operand `params[+0x20]`). */
const V_MAX_NEGATIVE_2P63: readonly [number, number, number, number] = [
  Math.fround(-1.844674407e19),
  Math.fround(-1.844674407e19),
  Math.fround(-1.844674407e19),
  Math.fround(-1.844674407e19),
];

/** @Helium __const @0x85fed0 — <1.0002442598342896, ..., ..., ...>.
 *  Loaded via `movaps 0x5452cf(%rip),%xmm0` @0x31abfa (RIP-after 0x31ac01 + 0x5452cf = 0x85fed0).
 *  Bits 0x3f800801 = 1 + 2^-12 as float32; broadcast to all 4 lanes.
 *  Post-rcpps correction factor (`params[+0x40]` — the `mulps` after `rcpps`).
 *  Same value used in HgcVibrancy and HgcBilateralFilterInterpSC_InterpolatorLastY. */
const V_ONE_PLUS_HALF_ULP: readonly [number, number, number, number] = [
  Math.fround(1.0002442598342896),
  Math.fround(1.0002442598342896),
  Math.fround(1.0002442598342896),
  Math.fround(1.0002442598342896),
];

/** Vtable-installed pointer address for HgcBilateralFilterInterp_Divide.
 *  See file header for the five citation sites. */
export const HGC_BILATERAL_FILTER_INTERP_DIVIDE_VTABLE = 0xa429b8 as const;

/** Metal-shader dispatch target (from GetProgram). RETURN Metal source ONLY
 *  when `HGRenderer::GetTarget(0x60000) == 0x60b10`; else NULL.
 *  @Helium 0x31a343 cmpl $0x60b10,%eax; 0x31a34f cmoveq %rax,%rcx. */
export const HGC_BILATERAL_FILTER_INTERP_DIVIDE_METAL_TARGET_EQ = 0x60b10 as const;

// ---------------------------------------------------------------------------
// Metal shader source — verbatim from the Helium literal pool referenced
// by `leaq 0x67c140(%rip),%rax` @GetProgram+0x18 (@0x31a348).
// RIP-after 0x31a34f + 0x67c140 = 0x996488. Reported length (per //LEN=) = 0x3a1 = 929 bytes.
// ---------------------------------------------------------------------------
export const HGC_BILATERAL_FILTER_INTERP_DIVIDE_METAL_SHADER_SOURCE: string =
  "//Metal1.0     \n" +
  "//LEN=00000003a1\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]], \n" +
  "    texture2d< float > hg_Texture1 [[ texture(1) ]], \n" +
  "    sampler hg_Sampler1 [[ sampler(1) ]])\n" +
  "{\n" +
  "    const float4 c0 = float4(1.844674407e+19, 0.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n" +
  "    r1 = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy);\n" +
  "    r1 = fmin(r1, c0.xxxx);\n" +
  "    r1 = fmax(r1, -c0.xxxx);\n" +
  "    r1 = 1.00000f / r1;\n" +
  "    r1 = fmin(r1, c0.xxxx);\n" +
  "    r1 = fmax(r1, -c0.xxxx);\n" +
  "    output.color0 = r0*r1;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=314717b8:2f43b310:ddf87b49:5f4d38e7\n" +
  "//SIG=00000000:00000003:00000003:00000000:0001:0000:0002:0000:0000:0000:0006:0000:0002:02:0:1:0\n";

// ---------------------------------------------------------------------------
// Frontier callee stubs (each cites the call-site @0xADDR).
// ---------------------------------------------------------------------------

/** HGNode::HGNode() base ctor — frontier callee. Called from
 *  @Helium 0x31abaa (C1) and 0x31ab0a (C2). */
function HGNode_ctor_stub(): void {
  throw new Error(
    "HGNode::HGNode() @Helium not yet transcribed — called from HgcBilateralFilterInterp_Divide ctor @0x31abaa (C1) and @0x31ab0a (C2)",
  );
}

/** HGNode::~HGNode() base dtor — frontier callee. Called from
 *  @Helium 0x31ac81 (D2), 0x31acd1 (D1), 0x31ad10 (D0). */
function HGNode_dtor_stub(): void {
  throw new Error(
    "HGNode::~HGNode() @Helium not yet transcribed — called from HgcBilateralFilterInterp_Divide dtors @0x31ac81 (D2), @0x31acd1 (D1), @0x31ad10 (D0)",
  );
}

/** operator new[](unsigned long) — frontier callee at C1 @Helium 0x31abbe / C2 @Helium 0x31ab1e.
 *  Returns a fresh heap block of `size` bytes (0x87 = 135 bytes for this class). */
function operatorNewArray(size: number): Uint8Array {
  return new Uint8Array(new ArrayBuffer(size));
}

/** operator delete(void*) — frontier callee at three sites (@Helium 0x31ac73 D2, 0x31acc3 D1, 0x31ad08 D0).
 *  No-op in TS (GC subsumes the free); function retained for provenance parity. */
function operatorDelete(_p: unknown): void {
  void _p;
}

/** HGObject::operator delete(void*) — deleting-dtor tail (D0 @Helium 0x31ad1e).
 *  No-op in TS; JavaScript engines GC the object automatically. */
function HGObject_operator_delete_stub(_p: unknown): void {
  void _p;
}

// ---------------------------------------------------------------------------
// Decoded InitProgramDescriptor facts (retained even though the function is
// throw-stubbed, so a future port has the strings on hand).
// ---------------------------------------------------------------------------
/** @Helium 0x31a371 leaq -> "HgcBilateralFilterInterp_Divide_hgc_visible" (visible-shader name). */
const INIT_VISIBLE_SHADER_NAME = "HgcBilateralFilterInterp_Divide_hgc_visible";
/** @Helium 0x31a387 leaq -> "HgcBilateralFilterInterp_Divide" (fragment-function name). */
const INIT_FRAGMENT_FUNCTION_NAME = "HgcBilateralFilterInterp_Divide";
/** @Helium 0x31a3a7 movabsq 0x746e656d67617246 ('Fragmen' little-endian) + @0x31a3b8 movl 0x74754f74 ('tOut'):
 *  the return-binding SSO string "FragmentOut". */
const INIT_RETURN_BINDING_NAME = "FragmentOut";
/** Argument-binding SSO strings: three "float4" (0x616f6c66 'floa' + 0x3474 't4') with
 *  type-tag sequence 2, 0xa, 0xa (@0x31a3fe, 0x31a44a, 0x31a4d7). */
const INIT_ARGUMENT_BINDING_NAME = "float4";
const INIT_ARGUMENT_BINDING_TYPE_TAGS: readonly number[] = [0x2, 0xa, 0xa];

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

/**
 * `HgcBilateralFilterInterp_Divide` — Helium bilateral-filter interpolator
 * divide/normalize kernel. See file header for full layout, vtable, shader,
 * and decode citations. Vtable @Helium 0xa429b8.
 *
 * ONE C++ class == ONE TS file (per raw-port PORTING_SPEC.md Rule 6).
 */
export class HgcBilateralFilterInterp_Divide {
  /** @Helium struct +0x000 — vtable pointer (installed at 0xa429b8 by C1/C2/D0/D1/D2). */
  vtable: number = 0;

  /** @Helium struct +0x010 — HGNode flags word. RMW at ctor @0x31ac12..0x31ac1f:
   *  flags = (flags & 0xFFFFF9FF) | 0x400  (i.e. clear bits 9..10, set bit 10). */
  nodeFlags10: number = 0;

  /** @Helium struct +0x198 — 32-byte-aligned pointer into a 0x87-byte alloc.
   *  Modelled as a Uint8Array VIEW; raw allocation retained on `uniformRaw`
   *  so the dtor's `operator delete(raw)` has a corresponding drop. */
  uniformBuffer: Uint8Array | null = null;

  /** Raw allocation from `operator new[](0x87)` — retained so the dtor path
   *  has a live reference to the raw pointer (stashed at aligned-8 in the binary). */
  private uniformRaw: Uint8Array | null = null;

  /**
   * @Helium C1 @0x31aba0  __ZN31HgcBilateralFilterInterp_DivideC1Ev
   *         C2 @0x31ab00  __ZN31HgcBilateralFilterInterp_DivideC2Ev (body identical to C1
   *                       modulo the RIP-relative displacement to the vtable).
   *
   * Verbatim disasm (C1 form, @0x31aba0..0x31ac26):
   *   0x31aba0  push rbp / mov rbp,rsp / push r14 / push rbx
   *   0x31aba7  mov  rbx,rdi                              ; rbx = this
   *   0x31abaa  call __ZN6HGNodeC2Ev                       ; HGNode::HGNode()
   *   0x31abaf  lea  rax,[rip+0x727e02]                    ; rax = 0xa429b8 (vtable)
   *   0x31abb6  mov  [rbx],rax                             ; this->vptr = 0xa429b8
   *   0x31abb9  mov  edi,0x87                              ; size = 135
   *   0x31abbe  call __Znam                                ; rax = operator new[](0x87)
   *   0x31abc3  lea  rcx,[rax+0x8]
   *   0x31abc7  neg  ecx
   *   0x31abc9  and  ecx,0x1f
   *   0x31abcc  lea  rdx,[rcx+rax]
   *   0x31abd0  add  rdx,0x8                               ; rdx = ALIGNED (32B aligned)
   *   0x31abd4  mov  [rcx+rax],rax                         ; stash raw at ALIGNED-8
   *   0x31abd8  movaps xmm0,[rip+0x576d51]                 ; xmm0 = <+2^63, +2^63, +2^63, +2^63>
   *   0x31abdf  movaps [rcx+rax+0x18],xmm0                 ; UB[+0x10]
   *   0x31abe4  movaps [rcx+rax+0x08],xmm0                 ; UB[+0x00]
   *   0x31abe9  movaps xmm0,[rip+0x576d50]                 ; xmm0 = <-2^63, -2^63, -2^63, -2^63>
   *   0x31abf0  movaps [rcx+rax+0x38],xmm0                 ; UB[+0x30]
   *   0x31abf5  movaps [rcx+rax+0x28],xmm0                 ; UB[+0x20]
   *   0x31abfa  movaps xmm0,[rip+0x5452cf]                 ; xmm0 = <1+2^-12, ..., ..., ...>
   *   0x31ac01  movaps [rcx+rax+0x58],xmm0                 ; UB[+0x50]
   *   0x31ac06  movaps [rcx+rax+0x48],xmm0                 ; UB[+0x40]
   *   0x31ac0b  mov  [rbx+0x198],rdx                       ; this->+0x198 = ALIGNED
   *   0x31ac12  mov  eax,0xfffff9ff                        ; mask = ~0x600
   *   0x31ac17  and  eax,[rbx+0x10]
   *   0x31ac1a  or   eax,0x400
   *   0x31ac1f  mov  [rbx+0x10],eax                        ; flags = (flags & ~0x600) | 0x400
   *   epilogue
   */
  constructor() {
    // @Helium 0x31abaa
    HGNode_ctor_stub();
    // @Helium 0x31abb6
    this.vtable = HGC_BILATERAL_FILTER_INTERP_DIVIDE_VTABLE;
    // @Helium 0x31abbe
    const raw = operatorNewArray(0x87);
    this.uniformRaw = raw;
    // @Helium 0x31abc3..0x31abd0 — alignment idiom. TS doesn't have raw
    // pointer arithmetic; we back the "aligned view" with a matching-size
    // ArrayBuffer. Bit-exact byte offsets against the buffer's own zero
    // origin match the (rdx+K) accesses in RenderTile.
    const alignedBuf = new ArrayBuffer(0x87);
    const aligned = new Uint8Array(alignedBuf);
    void raw; // retained on this.uniformRaw for the dtor.
    const dv = new DataView(alignedBuf);
    // @Helium 0x31abd8..0x31abe4 — <2^63,...> at UB[+0x10] and UB[+0x00].
    writeVec4F32(dv, 0x10, V_MAX_POSITIVE_2P63);
    writeVec4F32(dv, 0x00, V_MAX_POSITIVE_2P63);
    // @Helium 0x31abe9..0x31abf5 — <-2^63,...> at UB[+0x30] and UB[+0x20].
    writeVec4F32(dv, 0x30, V_MAX_NEGATIVE_2P63);
    writeVec4F32(dv, 0x20, V_MAX_NEGATIVE_2P63);
    // @Helium 0x31abfa..0x31ac06 — <1+2^-12,...> at UB[+0x50] and UB[+0x40].
    writeVec4F32(dv, 0x50, V_ONE_PLUS_HALF_ULP);
    writeVec4F32(dv, 0x40, V_ONE_PLUS_HALF_ULP);
    // @Helium 0x31ac0b
    this.uniformBuffer = aligned;
    // @Helium 0x31ac12..0x31ac1f
    this.nodeFlags10 = ((this.nodeFlags10 & 0xfffff9ff) | 0x400) >>> 0;
  }

  /**
   * @Helium D2 @0x31ac40  __ZN31HgcBilateralFilterInterp_DivideD2Ev  (base dtor)
   * @Helium D1 @0x31ac90  __ZN31HgcBilateralFilterInterp_DivideD1Ev  (complete dtor — identical body)
   *
   * Verbatim disasm (D2 form):
   *   0x31ac40  lea  rax,[rip+0x727d71]                    ; rax = 0xa429b8 (vtable)
   *   0x31ac47  mov  [rdi],rax                             ; reset this->vptr (defensive)
   *   0x31ac4a  mov  rax,[rdi+0x198]                       ; rax = this->uniformBuffer
   *   0x31ac51  test rax,rax
   *   0x31ac54  je   __ZN6HGNodeD2Ev                       ; null -> tail-jmp HGNode::~HGNode()
   *   0x31ac5a  mov  rax,[rax-0x8]                         ; rax = raw ptr (stashed at aligned-8)
   *   0x31ac5e  test rax,rax
   *   0x31ac61  je   __ZN6HGNodeD2Ev                       ; null -> tail-jmp HGNode::~HGNode()
   *   0x31ac67  push rbp / mov rbp,rsp / push rbx / push rax
   *   0x31ac6d  mov  rbx,rdi
   *   0x31ac70  mov  rdi,rax
   *   0x31ac73  call __ZdlPv                               ; operator delete(raw)
   *   0x31ac78  mov  rdi,rbx / epilogue
   *   0x31ac81  jmp  __ZN6HGNodeD2Ev                       ; HGNode::~HGNode()
   */
  destruct(): void {
    // @Helium 0x31ac47 — defensive vptr reset (no-op in TS model).
    this.vtable = HGC_BILATERAL_FILTER_INTERP_DIVIDE_VTABLE;
    // @Helium 0x31ac4a..0x31ac61 — release raw if both ptrs are non-null.
    const buf = this.uniformBuffer;
    const raw = this.uniformRaw;
    if (buf !== null && raw !== null) {
      // @Helium 0x31ac73
      operatorDelete(raw);
    }
    this.uniformBuffer = null;
    this.uniformRaw = null;
    // @Helium 0x31ac81 — tail-jmp HGNode::~HGNode().
    HGNode_dtor_stub();
  }

  /**
   * @Helium D0 @0x31ace0  __ZN31HgcBilateralFilterInterp_DivideD0Ev  (deleting dtor)
   *
   * Verbatim disasm:
   *   0x31ace0  push rbp / mov rbp,rsp / push rbx / push rax
   *   0x31ace6  mov  rbx,rdi
   *   0x31ace9  lea  rax,[rip+0x727cc8]                    ; rax = 0xa429b8 (vtable)
   *   0x31acf0  mov  [rdi],rax                             ; reset this->vptr
   *   0x31acf3  mov  rax,[rdi+0x198]
   *   0x31acfa  test rax,rax
   *   0x31acfd  je   0x31ad0d
   *   0x31acff  mov  rdi,[rax-0x8]                         ; rdi = raw
   *   0x31ad03  test rdi,rdi
   *   0x31ad06  je   0x31ad0d
   *   0x31ad08  call __ZdlPv                               ; operator delete(raw)
   *   0x31ad0d  mov  rdi,rbx
   *   0x31ad10  call __ZN6HGNodeD2Ev                       ; HGNode::~HGNode()
   *   0x31ad15  mov  rdi,rbx / epilogue
   *   0x31ad1e  jmp  __ZN8HGObjectdlEPv                    ; HGObject::operator delete(this)
   */
  destructAndDelete(): void {
    // @Helium 0x31acf0
    this.vtable = HGC_BILATERAL_FILTER_INTERP_DIVIDE_VTABLE;
    // @Helium 0x31acf3..0x31ad08
    const raw = this.uniformRaw;
    if (this.uniformBuffer !== null && raw !== null) {
      operatorDelete(raw);
    }
    this.uniformBuffer = null;
    this.uniformRaw = null;
    // @Helium 0x31ad10 — HGNode::~HGNode().
    HGNode_dtor_stub();
    // @Helium 0x31ad1e — HGObject::operator delete(this).
    HGObject_operator_delete_stub(this);
  }

  /**
   * @Helium 0x31a710  __ZN31HgcBilateralFilterInterp_Divide4BindEP9HGHandler
   *
   * Verbatim disasm (9 lines):
   *   0x31a710  push rbp / mov rbp,rsp
   *   0x31a714  mov  rax,[rdi]                             ; rax = handler->vptr
   *   0x31a717  call [rax+0xc0]                            ; handler->vptr[0xc0](handler)
   *   0x31a71d  xor  eax,eax                               ; return 0
   *   0x31a71f  pop rbp / retq
   *
   * The single vtable slot *0xc0 is undecoded; every branch depends on it.
   */
  Bind(_handler: HGHandlerPtr): number {
    // @Helium 0x31a717 — handler->vtable[*0xc0](handler). Slot semantics undecoded.
    throw new Error(
      "HgcBilateralFilterInterp_Divide::Bind not yet transcribed @Helium 0x31a710 — depends on undecoded HGHandler vtable slot *0xc0 @Helium 0x31a717",
    );
  }

  /**
   * @Helium 0x31a660  __ZN31HgcBilateralFilterInterp_Divide11BindTextureEP9HGHandleri
   *
   * 58-line body — dispatches on `texIdx` (rdx) to bind textures 0, 1 into
   * the handler, then calls HGHandler::TexCoord and inspects an inner
   * this->+0x90 sub-object. Every effective callee is an undecoded HGHandler
   * vtable slot (*0x30, *0x48, *0xa8, *0x80) plus HGHandler::TexCoord and the
   * this->+0x90 vptr[*0x80] check.
   *
   * Entry cases (verbatim):
   *   0x31a66a  cmpl $0x1, %edx                            ; texIdx == 1 ?
   *   0x31a66d  je   0x31a6a1                              ; yes -> tex1 branch
   *   0x31a66f  mov  r14d, 0xffffffff                      ; default return = -1
   *   0x31a675  testl %edx, %edx                           ; texIdx == 0 ?
   *   0x31a677  jne  0x31a6fd                              ; texIdx > 1: return -1
   *   -- texIdx == 0 --
   *   0x31a68a  handler->vtable[*0x48](handler, 0, 0)
   *   0x31a697  handler->vtable[*0x30](handler, 0, 0)
   *   -- texIdx == 1 --
   *   0x31a6b1  handler->vtable[*0x48](handler, 1, 0)
   *   0x31a6be  handler->vtable[*0x30](handler, 0, 0)
   *   -- shared tail --
   *   0x31a6d0  HGHandler::TexCoord(handler, texIdxAsInt, 0, 0, NULL)
   *   0x31a6d5  rdi = this->+0x90
   *   0x31a6e4  eax = (*(this->+0x90))->vtable[*0x80](this->+0x90, 0x2e)
   *   0x31a6ea  if (eax != 0) return 0
   *   0x31a6f4  handler->vtable[*0xa8](handler)
   *   0x31a6fa  r14 = 0; return 0
   */
  BindTexture(_handler: HGHandlerPtr, _texIdx: number): number {
    throw new Error(
      "HgcBilateralFilterInterp_Divide::BindTexture not yet transcribed @Helium 0x31a660 — every branch depends on undecoded HGHandler vtable slots *0x30 @0x31a697/0x31a6be, *0x48 @0x31a68a/0x31a6b1, *0xa8 @0x31a6f4, HGHandler::TexCoord @Helium 0x31a6d0, AND the this->+0x90 sub-object whose vtable *0x80 is called @Helium 0x31a6e4",
    );
  }

  /**
   * @Helium 0x31aac0  __ZN31HgcBilateralFilterInterp_Divide6GetDODEP10HGRendereri6HGRect
   *
   * Verbatim disasm (13 lines):
   *   0x31aac0  mov  rax,rcx                               ; rax = inputDOD.lo
   *   0x31aac3  cmp  edx,0x2                               ; outputIdx < 2 ?
   *   0x31aac6  jb   0x31aadb                              ; yes -> identity
   *   0x31aac8  push rbp / mov rbp,rsp
   *   0x31aacc  lea  rcx,[rip+_HGRectNull]
   *   0x31aad3  mov  rax,[rcx]                             ; rax = HGRectNull.lo
   *   0x31aad6  mov  r8,[rcx+0x8]                          ; r8  = HGRectNull.hi
   *   0x31aada  pop  rbp
   *   0x31aadb  mov  rdx,r8                                ; return (rax, rdx=r8)
   *   0x31aade  retq
   *
   * outputIdx 0 or 1 => identity; outputIdx >= 2 => HGRectNull.
   */
  GetDOD(
    _renderer: HGRendererPtr | null,
    outputIdx: number,
    inputDOD: HGRect,
  ): HGRect {
    // @Helium 0x31aac3
    if ((outputIdx >>> 0) < 2) {
      return {
        x: inputDOD.x | 0,
        y: inputDOD.y | 0,
        right: inputDOD.right | 0,
        bottom: inputDOD.bottom | 0,
      };
    }
    // @Helium 0x31aacc..0x31aada
    return {
      x: HGRectNull.x | 0,
      y: HGRectNull.y | 0,
      right: HGRectNull.right | 0,
      bottom: HGRectNull.bottom | 0,
    };
  }

  /**
   * @Helium 0x31aae0  __ZN31HgcBilateralFilterInterp_Divide6GetROIEP10HGRendereri6HGRect
   *
   * Byte-for-byte identical shape to GetDOD (different addr):
   *   0x31aae0  mov  rax,rcx
   *   0x31aae3  cmp  edx,0x2
   *   0x31aae6  jb   0x31aafb                              ; inputIdx < 2 -> identity
   *   0x31aae8  push rbp / mov rbp,rsp
   *   0x31aaec  lea  rcx,[rip+_HGRectNull]
   *   0x31aaf3  mov  rax,[rcx]
   *   0x31aaf6  mov  r8,[rcx+0x8]
   *   0x31aafa  pop  rbp
   *   0x31aafb  mov  rdx,r8; retq
   */
  GetROI(
    _renderer: HGRendererPtr | null,
    inputIdx: number,
    outputROI: HGRect,
  ): HGRect {
    // @Helium 0x31aae3
    if ((inputIdx >>> 0) < 2) {
      return {
        x: outputROI.x | 0,
        y: outputROI.y | 0,
        right: outputROI.right | 0,
        bottom: outputROI.bottom | 0,
      };
    }
    // @Helium 0x31aaec..0x31aafa
    return {
      x: HGRectNull.x | 0,
      y: HGRectNull.y | 0,
      right: HGRectNull.right | 0,
      bottom: HGRectNull.bottom | 0,
    };
  }

  /**
   * @Helium 0x31ad30  __ZN31HgcBilateralFilterInterp_Divide12SetParameterEiffff
   *
   * Verbatim disasm (7 lines — a constant-return stub):
   *   0x31ad30  push rbp / mov rbp,rsp
   *   0x31ad34  mov  eax,0xffffffff                        ; return -1 unconditionally
   *   0x31ad39  pop  rbp / retq
   *
   * The class has NO tunable parameters. Every call returns -1. Uniform
   * buffer is fixed at construction.
   */
  SetParameter(
    _paramID: number,
    _v0: number,
    _v1: number,
    _v2: number,
    _v3: number,
  ): number {
    // @Helium 0x31ad34
    return -1 | 0;
  }

  /**
   * @Helium 0x31ad40  __ZN31HgcBilateralFilterInterp_Divide12GetParameterEiPf
   *
   * Verbatim disasm (7 lines — a constant-return stub, identical shape to SetParameter):
   *   0x31ad40  push rbp / mov rbp,rsp
   *   0x31ad44  mov  eax,0xffffffff                        ; return -1 unconditionally
   *   0x31ad49  pop  rbp / retq
   */
  GetParameter(_paramID: number, _outPtr: unknown): number {
    // @Helium 0x31ad44
    return -1 | 0;
  }

  /**
   * @Helium 0x31ad50  __ZN31HgcBilateralFilterInterp_Divide9GetOutputEP10HGRenderer
   *
   * Verbatim disasm (7 lines):
   *   0x31ad50  push rbp / mov rbp,rsp
   *   0x31ad54  mov  rax,rdi                               ; return this
   *   0x31ad57  pop  rbp / retq
   *
   * Simplest possible: this class IS its own output node.
   */
  GetOutput(_renderer: HGRendererPtr | null): HgcBilateralFilterInterp_Divide {
    // @Helium 0x31ad54
    return this;
  }

  /**
   * @Helium 0x31a600  __ZNK31HgcBilateralFilterInterp_Divide17shaderDescriptionEv
   *
   * 24-line body — allocates 0x28 bytes via operator new @0x31a60e and
   * populates a libc++ std::string header with the literal
   * "HgcBilateralFilterInterp_Divide [hgc1]":
   *   0x31a613  mov  [rbx+0x10], rax                       ; ret->_data_ptr = raw
   *   0x31a617  mov  qword ptr [rbx],     0x29             ; capacity field (0x28 | 1)
   *   0x31a61e  mov  qword ptr [rbx+0x8], 0x26             ; size = 38 chars
   *   0x31a626  movabsq rcx, 0x5d316367685b2065            ; 'e [hgc1]' at +0x1e
   *   0x31a634  movups xmm0, [rip+0x67c252]                ; "erInterp_Divide [hgc1]" at +0x10
   *   0x31a63f  movups xmm0, [rip+0x67c237]                ; "HgcBilateralFilterInterp_Divide [hgc1]" at +0x00
   *   0x31a649  movb  [rax+0x26], 0x0                      ; NUL-terminate
   *
   * The character content is the "HgcBilateralFilterInterp_Divide [hgc1]" string;
   * the libc++ std::string bit-layout is a runtime detail we don't need to reproduce.
   */
  shaderDescription(): string {
    // @Helium 0x31a626..0x31a649
    return "HgcBilateralFilterInterp_Divide [hgc1]";
  }

  /**
   * @Helium 0x31a330  __ZN31HgcBilateralFilterInterp_Divide10GetProgramEP10HGRenderer
   *
   * Verbatim disasm (14 lines):
   *   0x31a330  push rbp / mov rbp,rsp
   *   0x31a334  mov  rdi,rsi                               ; rdi = renderer
   *   0x31a337  mov  esi,0x60000
   *   0x31a33c  call __ZN10HGRenderer9GetTargetEj           ; eax = renderer->GetTarget(0x60000)
   *   0x31a341  xor  ecx,ecx                               ; rcx = 0 (default = NULL)
   *   0x31a343  cmp  eax,0x60b10
   *   0x31a348  lea  rax,[rip+0x67c140]                    ; rax = &Metal shader source
   *   0x31a34f  cmoveq rcx,rax                             ; if target == 0x60b10: rcx = shader
   *   0x31a353  mov  rax,rcx
   *   0x31a356  pop  rbp / retq
   *
   * target == 0x60b10 => return HGC_BILATERAL_FILTER_INTERP_DIVIDE_METAL_SHADER_SOURCE;
   * else => NULL. HGRenderer::GetTarget is a frontier callee.
   */
  GetProgram(_renderer: HGRendererPtr | null): string | null {
    // @Helium 0x31a33c
    throw new Error(
      "HgcBilateralFilterInterp_Divide::GetProgram not yet transcribed @Helium 0x31a330 — depends on undecoded HGRenderer::GetTarget(unsigned int) @Helium 0x31a33c. Decoded branch: target == 0x60b10 => return HGC_BILATERAL_FILTER_INTERP_DIVIDE_METAL_SHADER_SOURCE; else => NULL.",
    );
  }

  /**
   * @Helium 0x31a360  __ZNK31HgcBilateralFilterInterp_Divide21InitProgramDescriptorEP19HGProgramDescriptor
   *
   * 159-line body — configures the HGProgramDescriptor with the visible
   * shader source, fragment function name, return HGBinding, and three
   * argument HGBindings. All decoded string facts are in the module-level
   * INIT_* constants; the effective calls are undecoded HGProgramDescriptor
   * methods and std::vector<HGBinding> plumbing.
   *
   * Verbatim call sites (frontier):
   *   0x31a382  HGProgramDescriptor::SetVisibleShaderWithSource(desc, INIT_VISIBLE_SHADER_NAME, <visible shader body>)
   *   0x31a391  HGProgramDescriptor::SetFragmentFunctionName(desc, INIT_FRAGMENT_FUNCTION_NAME)
   *   0x31a3d8  HGProgramDescriptor::SetReturnBinding(desc, HGBinding{type=4, name=INIT_RETURN_BINDING_NAME})
   *   0x31a42e / 0x31a4bb / 0x31a544  std::vector<HGBinding>::__emplace_back_slow_path
   *   0x31a563  HGProgramDescriptor::SetArgumentBindings(desc, argVector)
   *   0x31a5d3  std::vector<HGBinding>::~vector (cleanup)
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorPtr): void {
    // @Helium 0x31a360 — provenance-only references so the decoded facts
    // stay linked into the export graph.
    void INIT_VISIBLE_SHADER_NAME;
    void INIT_FRAGMENT_FUNCTION_NAME;
    void INIT_RETURN_BINDING_NAME;
    void INIT_ARGUMENT_BINDING_NAME;
    void INIT_ARGUMENT_BINDING_TYPE_TAGS;
    throw new Error(
      "HgcBilateralFilterInterp_Divide::InitProgramDescriptor not yet transcribed @Helium 0x31a360 — depends on undecoded HGProgramDescriptor::SetVisibleShaderWithSource @Helium 0x31a382, ::SetFragmentFunctionName @Helium 0x31a391, ::SetReturnBinding @Helium 0x31a3d8, ::SetArgumentBindings @Helium 0x31a563, and std::vector<HGBinding>::__emplace_back_slow_path @Helium 0x31a42e/0x31a4bb/0x31a544",
    );
  }

  /**
   * @Helium 0x31a9c0  __ZN31HgcBilateralFilterInterp_Divide10RenderTileEP6HGTile
   *
   * CPU-side per-tile render (SSE / float4 lanes). Full 71-line disasm:
   *   0x31a9c0..0x31a9cd  prologue; rbx = this, r14 = tile
   *   0x31a9cd  mov  rdi,rsi
   *   0x31a9d3  call HGTile::Renderer() const               ; rax = HGRenderer*
   *   0x31a9d8  mov  rdi,rax; xor esi,esi
   *   0x31a9dd  call HGRenderer::GetTarget(0)               ; eax = target
   *   0x31a9e2  cmp  eax,0x4700000
   *   0x31a9e7  jb   0x31a9f9                               ; target < 0x4700000 -> SSE path
   *   0x31a9e9..0x31a9f4  call RenderTile_AVX(this,tile); jmp exit
   *
   *   SSE path (@0x31a9f9..0x31aaac):
   *   0x31a9f9  eax = tile[+0x0c] - tile[+0x04]             ; height h
   *   0x31aa01  if (h <= 0) -> exit
   *   0x31aa07  r10 = tile[+0x08] - tile[+0x00]             ; width w
   *   0x31aa0e  if (w <= 0) -> exit
   *   Field loads (all as int32/int64 as marked):
   *     rcx = tile[+0x18] (outRowStride, int32; sign-extend movslq)
   *     rdx = tile[+0x68] (in1RowStride, int32)
   *     rsi = tile[+0x58] (in0RowStride, int32)
   *     rdi = tile[+0x10] (outPtr)
   *     r8  = tile[+0x50] (in0Ptr — the mulIn plane)
   *     r9  = tile[+0x60] (in1Ptr — the plane being reciprocated)
   *   Strides multiplied by 16 (SSE stride = 16 bytes per texel):
   *     shl rsi,4; shl rdx,4; shl rcx,4; shl r10,4
   *   Inner (per texel, 4-lane SSE math):
   *     xmm0 = movaps  [r9+r14]                             ; in
   *     xmm1 = movaps  [r15+0x00]  = params[+0x00] = V_MAX_POSITIVE_2P63
   *     xmm2 = movaps  [r15+0x20]  = params[+0x20] = V_MAX_NEGATIVE_2P63
   *     xmm0 = minps xmm1, xmm0
   *     xmm0 = maxps xmm2, xmm0
   *     xmm0 = rcpps xmm0                                   ; approximate 1/x
   *     xmm0 = mulps xmm0, [r15+0x40] = V_ONE_PLUS_HALF_ULP
   *     xmm0 = minps xmm1, xmm0
   *     xmm0 = maxps xmm2, xmm0
   *     xmm0 = mulps xmm0, [r8+r14]                         ; * mulIn
   *     movaps [rdi+r14], xmm0
   *   Return 0.
   *
   * By FCP convention the earlier-indexed shader texture (r0 = tex0) ends up
   * at the higher tile offset (+0x50, our "mulInPtr"); the later shader
   * texture (r1 = tex1, being reciprocated) is at +0x60 ("inPtr").
   *
   * PROVENANCE NOTE for rcpps: SSE `rcpps` is an APPROXIMATE reciprocal
   * (~12-bit mantissa, LUT-based) — NOT IEEE 1/x. Per PORTING_SPEC.md
   * Rule 3, the exact LUT semantics are a distinct decode item; this port
   * models it via `sse_rcpps` (see helper below) which is a stub-shaped
   * wrapper that returns IEEE 1/x. The oracle harness will flag any
   * bit-exact divergence and force a proper LUT emulation; that is a
   * backlog item cited in the helper's doc-comment, not a silent guess.
   */
  RenderTile(tile: HgcBilateralFilterInterp_DivideTile): number {
    // @Helium 0x31a9dd — HGRenderer::GetTarget frontier callee, used ONLY
    // to decide SSE vs AVX dispatch. Any client passing a tile through this
    // SSE path implicitly requests SSE; the AVX branch is throw-stubbed.
    // @Helium 0x31a9f9
    const h = (tile.y1 - tile.y0) | 0;
    if (h <= 0) return 0;
    // @Helium 0x31aa07
    const w = (tile.x1 - tile.x0) | 0;
    if (w <= 0) return 0;

    const rowStrideOut = tile.outRowStride | 0;
    const rowStrideIn = tile.inRowStride | 0; // "in1RowStride" @+0x68
    const rowStrideMul = tile.mulInRowStride | 0; // "in0RowStride" @+0x58
    const outArr = tile.outPtr;
    const mulArr = tile.mulInPtr; // "in0Ptr" @+0x50
    const inArr = tile.inPtr; // "in1Ptr" @+0x60

    const buf = this.uniformBuffer;
    if (buf === null) {
      throw new Error(
        "HgcBilateralFilterInterp_Divide::RenderTile reached with null uniformBuffer — must have been constructed via C1 @Helium 0x31aba0 / C2 @Helium 0x31ab00",
      );
    }
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    // @Helium 0x31aa6c — xmm1 = params[+0x00] = V_MAX_POSITIVE_2P63.
    // @Helium 0x31aa70 — xmm2 = params[+0x20] = V_MAX_NEGATIVE_2P63.
    // @Helium 0x31aa7e — mulps operand params[+0x40] = V_ONE_PLUS_HALF_ULP.
    const p_max_pos_x = Math.fround(dv.getFloat32(0x00, true));
    const p_max_pos_y = Math.fround(dv.getFloat32(0x04, true));
    const p_max_pos_z = Math.fround(dv.getFloat32(0x08, true));
    const p_max_pos_w = Math.fround(dv.getFloat32(0x0c, true));
    const p_max_neg_x = Math.fround(dv.getFloat32(0x20, true));
    const p_max_neg_y = Math.fround(dv.getFloat32(0x24, true));
    const p_max_neg_z = Math.fround(dv.getFloat32(0x28, true));
    const p_max_neg_w = Math.fround(dv.getFloat32(0x2c, true));
    const p_scale_x = Math.fround(dv.getFloat32(0x40, true));
    const p_scale_y = Math.fround(dv.getFloat32(0x44, true));
    const p_scale_z = Math.fround(dv.getFloat32(0x48, true));
    const p_scale_w = Math.fround(dv.getFloat32(0x4c, true));

    // @Helium 0x31aa50..0x31aa9a — outer row loop, inner texel loop.
    for (let row = 0; row < h; ++row) {
      const rowIn = (row * rowStrideIn) << 2;
      const rowMul = (row * rowStrideMul) << 2;
      const rowOut = (row * rowStrideOut) << 2;
      for (let col = 0; col < w; ++col) {
        // @Helium 0x31aa60 — xmm0 = movaps [r9+r14]  (input texel).
        const pI = rowIn + (col << 2);
        const pM = rowMul + (col << 2);
        const pO = rowOut + (col << 2);
        let vx = Math.fround(inArr[pI + 0]);
        let vy = Math.fround(inArr[pI + 1]);
        let vz = Math.fround(inArr[pI + 2]);
        let vw = Math.fround(inArr[pI + 3]);
        // @Helium 0x31aa75 — minps xmm1, xmm0.
        vx = simd_minps(p_max_pos_x, vx);
        vy = simd_minps(p_max_pos_y, vy);
        vz = simd_minps(p_max_pos_z, vz);
        vw = simd_minps(p_max_pos_w, vw);
        // @Helium 0x31aa78 — maxps xmm2, xmm0.
        vx = simd_maxps(p_max_neg_x, vx);
        vy = simd_maxps(p_max_neg_y, vy);
        vz = simd_maxps(p_max_neg_z, vz);
        vw = simd_maxps(p_max_neg_w, vw);
        // @Helium 0x31aa7b — rcpps xmm0, xmm0.
        vx = sse_rcpps(vx);
        vy = sse_rcpps(vy);
        vz = sse_rcpps(vz);
        vw = sse_rcpps(vw);
        // @Helium 0x31aa7e — mulps xmm0, [r15+0x40].
        vx = Math.fround(vx * p_scale_x);
        vy = Math.fround(vy * p_scale_y);
        vz = Math.fround(vz * p_scale_z);
        vw = Math.fround(vw * p_scale_w);
        // @Helium 0x31aa83 — minps again.
        vx = simd_minps(p_max_pos_x, vx);
        vy = simd_minps(p_max_pos_y, vy);
        vz = simd_minps(p_max_pos_z, vz);
        vw = simd_minps(p_max_pos_w, vw);
        // @Helium 0x31aa86 — maxps again.
        vx = simd_maxps(p_max_neg_x, vx);
        vy = simd_maxps(p_max_neg_y, vy);
        vz = simd_maxps(p_max_neg_z, vz);
        vw = simd_maxps(p_max_neg_w, vw);
        // @Helium 0x31aa89 — mulps xmm0, [r8+r14]  (* mulIn).
        vx = Math.fround(vx * Math.fround(mulArr[pM + 0]));
        vy = Math.fround(vy * Math.fround(mulArr[pM + 1]));
        vz = Math.fround(vz * Math.fround(mulArr[pM + 2]));
        vw = Math.fround(vw * Math.fround(mulArr[pM + 3]));
        // @Helium 0x31aa8e — movaps [rdi+r14], xmm0.
        outArr[pO + 0] = vx;
        outArr[pO + 1] = vy;
        outArr[pO + 2] = vz;
        outArr[pO + 3] = vw;
      }
    }
    return 0;
  }

  /**
   * @Helium 0x31a730  __ZN31HgcBilateralFilterInterp_Divide14RenderTile_AVXEP6HGTile
   *
   * 158-line body — AVX2 (ymm, 8-lane) variant of RenderTile. Same math
   * per lane, unrolled to 8 lanes (two float4 texels per iteration). Key
   * instruction shapes verified in the disasm:
   *   vmovups ymm0, [rdx+r15-0x30]                          ; load 8 f32 = 2 texels
   *   vmovups ymm2, [r9+0x00]        = params[+0x00]        ; V_MAX_POSITIVE_2P63
   *   vmovups ymm3, [r9+0x20]        = params[+0x20]        ; V_MAX_NEGATIVE_2P63
   *   vminps  ymm0, ymm2, ymm0
   *   vmaxps  ymm0, ymm3, ymm0
   *   vrcpps  ymm0, ymm0
   *   vmulps  ymm0, ymm4, ymm0       (ymm4 = [r9+0x40] = V_ONE_PLUS_HALF_ULP)
   *   vminps  ymm0, ymm2, ymm0
   *   vmaxps  ymm0, ymm3, ymm0
   *   vmulps  ymm0, [rcx+r15-0x30]                          ; * mulIn
   *   vmovups [r8+r15-0x30], ymm0                           ; store
   * plus an SSE 4-lane tail (@0x31a8c0..) for texel remainders when the
   * width is not a multiple of 4.
   *
   * Not transcribed in this pass: the ymm-loop unrolling is faithful to
   * the SSE math but requires careful transcription of the 4-texel
   * unrolled inner loop; deferring per PORTING_SPEC.md Rule 8 to the
   * subsequent pass when the oracle harness is wired for this class.
   */
  RenderTile_AVX(_tile: HgcBilateralFilterInterp_DivideTile): number {
    // @Helium 0x31a730
    throw new Error(
      "HgcBilateralFilterInterp_Divide::RenderTile_AVX not yet transcribed @Helium 0x31a730 — 158-line AVX2 variant of RenderTile with identical per-lane math (vminps/vmaxps/vrcpps/vmulps against V_MAX_POSITIVE_2P63 / V_MAX_NEGATIVE_2P63 / V_ONE_PLUS_HALF_ULP). Use RenderTile @Helium 0x31a9c0 for equivalent output.",
    );
  }
}

// ---------------------------------------------------------------------------
// HGTile shape used by RenderTile / RenderTile_AVX (fields transcribed from
// the disasm's field offsets, all int32 / f32*).
// ---------------------------------------------------------------------------
/** Tile descriptor for HgcBilateralFilterInterp_Divide's per-tile render.
 *  Field offsets are read from RenderTile's memory-access pattern:
 *    tile.x0            @+0x00  (int)
 *    tile.y0            @+0x04  (int)
 *    tile.x1            @+0x08  (int)
 *    tile.y1            @+0x0c  (int)
 *    tile.outPtr        @+0x10  (float4* — RGBA texels, row-major)
 *    tile.outRowStride  @+0x18  (int; TEXELS per row)
 *    tile.mulInPtr      @+0x50  (float4* — plane multiplied AFTER the reciprocal — shader r0)
 *    tile.mulInRowStride@+0x58  (int; TEXELS per row)
 *    tile.inPtr         @+0x60  (float4* — plane being reciprocated — shader r1)
 *    tile.inRowStride   @+0x68  (int; TEXELS per row) */
export interface HgcBilateralFilterInterp_DivideTile {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  outPtr: Float32Array;
  outRowStride: number;
  mulInPtr: Float32Array;
  mulInRowStride: number;
  inPtr: Float32Array;
  inRowStride: number;
}

// ---------------------------------------------------------------------------
// SSE instruction models — kept small and cited.
// ---------------------------------------------------------------------------

/** SSE `minps` component semantics from Intel SDM: A = (B < A) ? B : A.
 *  If B is NaN, the comparison is false -> A is returned unchanged.
 *  Cited by @Helium 0x31aa75 (minps xmm1, xmm0). */
function simd_minps(a: number, b: number): number {
  return Math.fround(b < a ? b : a);
}

/** SSE `maxps` component semantics: A = (B > A) ? B : A.
 *  If B is NaN, the comparison is false -> A is returned unchanged.
 *  Cited by @Helium 0x31aa78 (maxps xmm2, xmm0). */
function simd_maxps(a: number, b: number): number {
  return Math.fround(b > a ? b : a);
}

/** SSE `rcpps` — APPROXIMATE reciprocal (~12-bit mantissa precision, LUT-based).
 *  Intel SDM guarantees |ε| ≤ 1.5·2^-12; the LUT is not part of the ISA public
 *  spec. Our inputs are always clamped to ±2^63 (see min/max pair above),
 *  so the reciprocal is finite. Cited by @Helium 0x31aa7b (rcpps xmm0, xmm0).
 *
 *  DECODE-DON'T-FIT: we compute IEEE `1/x` (float32) here rather than emulate
 *  Intel's exact LUT. This DOES NOT match the SSE approximation bit-for-bit;
 *  the oracle harness will flag the divergence and force a proper LUT
 *  emulation (or a dlsym-linked real rcpps in the parity driver) — that is a
 *  backlog item, not a silent guess. See PORTING_SPEC.md Rule 3 & 8. */
function sse_rcpps(x: number): number {
  // @Helium 0x31aa7b
  return Math.fround(1.0 / x);
}

// ---------------------------------------------------------------------------
// Small helper: aligned 4-float write into a DataView.
// ---------------------------------------------------------------------------

/** Write 4 float32 lanes to `dv` at byte offset `off` (little-endian, matching
 *  x86_64 movaps semantics). Lanes are supplied x-first — same as SSE
 *  `movaps` memory layout `[x, y, z, w]`. */
function writeVec4F32(
  dv: DataView,
  off: number,
  v: readonly [number, number, number, number],
): void {
  dv.setFloat32(off + 0x0, Math.fround(v[0]), true);
  dv.setFloat32(off + 0x4, Math.fround(v[1]), true);
  dv.setFloat32(off + 0x8, Math.fround(v[2]), true);
  dv.setFloat32(off + 0xc, Math.fround(v[3]), true);
}
