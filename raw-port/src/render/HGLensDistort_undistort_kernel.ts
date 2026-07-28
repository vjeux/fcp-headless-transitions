// raw-port/src/render/HGLensDistort_undistort_kernel.ts
//
// FCP `HGLensDistort_undistort_kernel` — Helium HGNode subclass owning
// the "inverse-distort" (i.e. lens un-distort / rectify) branch of the
// Lens Distort filter. Sibling of HGLensDistort_distort_kernel (see
// HGLensDistort_distort_kernel.ts); the two share almost identical shape
// and both wrap a per-pixel Metal fragment shader baked into the binary.
// This class is the CPU wrapper that (1) sets 3 float4 uniform slots
// (hg_Params[0..3]) on the node, (2) returns the Metal shader source
// when the renderer target is Metal-1.0-fragment, and (3) delegates
// tile-execution to the Metal pipeline (with an AVX software fallback
// dispatched through the free function `GetUndistortTile_AVX`).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice; VAs
//             below are unadjusted VM addresses from `otool -tV`).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGLensDistort_undistort_kernel.HGLensDistort_undistort_kernel.s (C1 @0x229d50)
//   raw-port/re/disasm/Helium.HGLensDistort_undistort_kernel.GetProgram.s                     (@0x22b970)
//   raw-port/re/disasm/Helium.HGLensDistort_undistort_kernel.InitProgramDescriptor.s          (@0x22b9a0)
//   raw-port/re/disasm/Helium.HGLensDistort_undistort_kernel.RenderTile.s                     (@0x22bcd0)
//   raw-port/re/disasm/Helium.HGLensDistort_undistort_kernel._distortROI.s                    (@0x22c8b0)
//   raw-port/re/disasm/Helium.HGLensDistort_undistort_kernel._distortDOD.s                    (@0x22c8e0)
//   raw-port/re/disasm/Helium.HGLensDistort_undistort_kernel._setShaderParameters.s           (@0x22c910)
//
// Ledger addresses (Helium.ledger.json):
//   0x229d50  HGLensDistort_undistort_kernel::HGLensDistort_undistort_kernel()  [C1 → tail-jmp C2]
//   0x22b970  HGLensDistort_undistort_kernel::GetProgram(HGRenderer*)
//   0x22b9a0  HGLensDistort_undistort_kernel::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x22bcd0  HGLensDistort_undistort_kernel::RenderTile(HGTile*)
//   0x22c470  HGLensDistort_undistort_kernel::HGLensDistort_undistort_kernel()  [C2 base ctor]
//   0x22c7c0  HGLensDistort_undistort_kernel::~HGLensDistort_undistort_kernel() [D2]
//   0x22c810  HGLensDistort_undistort_kernel::~HGLensDistort_undistort_kernel() [D1 → jmp D2 (with inlined delete[])]
//   0x22c860  HGLensDistort_undistort_kernel::~HGLensDistort_undistort_kernel() [D0 → D2 + operator delete]
//   0x22c8b0  HGLensDistort_undistort_kernel::_distortROI(HGRect)
//   0x22c8e0  HGLensDistort_undistort_kernel::_distortDOD(HGRect)
//   0x22c910  HGLensDistort_undistort_kernel::_setShaderParameters()
//   0x22c9c0  HGLensDistort_undistort_kernel::GetFilterMode(int, HGFilterMode)
//
// VTABLE INSTALLED-PTR: 0xa33398 (`leaq 0x806e82(%rip),%rax; movq %rax,(%rbx)`
//   at C2 @0x22c50f/22c516). Full slot map not audited in this file — the
//   siblings pattern is: overrides slots *0x00/*0x08 (dtors D1/D0), *0xb0
//   (RenderTile), *0xb8 (GetProgram); all other slots inherited from HGNode.
//   The D2 body at 0x22c7c0 writes the vptr `0x22c7c7 leaq 0x806bd1(%rip)`
//   which resolves to 0xa33398 — same as C2 install: confirms vptr.
//
// STRUCT LAYOUT (recovered from C2 @0x22c470 + _setShaderParameters +
//                _distortROI/_distortDOD; addresses in comments):
//   HGLensDistort_undistort_kernel : public HGNode {
//     +0x000..+0x1a7    HGNode base subobject.
//     +0x1a8..+0x1eb    LensParams   inline payload (68 bytes; +0x1a8 is
//                                     the LensParams::a0 offset used by
//                                     _distortROI/_distortDOD via
//                                     `addq $0x1a8, %rdi` before calling
//                                     LensParams member-fn ptrs).
//     +0x1a8            f32x4 = (1.0, 1.0, 0.5, 0.5)      — see @0x22c47f (movaps 0x660f8a(rip))
//                                                            = f32 @Helium 0x88d410.
//     +0x1b8            f32x4 = (1.0, 1.0, 1.0, 1.0)      — see @0x22c48d (movaps 0x19b7ac(rip))
//                                                            = f32 @Helium 0x3c7c40.
//     +0x1c8            f32x4 = (1.0, 1.0, 1.0, 0.5)      — see @0x22c49b (movaps 0x660f7e(rip))
//                                                            = f32 @Helium 0x88d420.
//     +0x1d8            f64 (or f32x2) = (u64 0x3f8000003f000000)
//                                                          — see @0x22c4a9 (movsd 0x63350f(rip))
//                                                            = @Helium 0x85f9c0; as two f32:
//                                                            (0.5, 1.0).
//     +0x1e0            u32 = 0x3f800000  (= 1.0f)        — see @0x22c4b9 (`movl $0x3f800000, 0x1e0(%rbx)`).
//     +0x1e4            f32 = float(2 * tan(0.5))         — see @0x22c4c3..@0x22c4d8:
//                                                            `movsd 0x19fcf5(rip) [=@Helium 0x3cc1c0 = 0.5]`
//                                                            → `callq _tan`
//                                                            → `addsd %xmm0,%xmm0` (double the result)
//                                                            → `cvtsd2ss` (narrow f64→f32)
//                                                            → `movss %xmm0, 0x1e4(%rbx)`.
//     +0x1e8            f32 = 1.0f / +0x1e4               — see @0x22c4e0..@0x22c4ec:
//                                                            `movss 0x19b7d8(rip) [=@Helium 0x3c7cc0 = 1.0f]`
//                                                            → `divss %xmm0, %xmm1`
//                                                            → `movss %xmm1, 0x1e8(%rbx)`.
//     +0x1f0            ptr → aligned heap buffer of size 0x3a7 (aligned
//                       to 0x20 via the "leaq 0x8(%rax); negl/andl $0x1f;
//                       write raw-alloc-ptr at buf-8" trick). Allocated
//                       via `operator new[](0x3a7)` @0x22c51e; filled with
//                       the initial default lens-distortion "State" table
//                       (see LARGE STATE BUFFER section below). Freed by
//                       the dtors via `operator delete` on the "raw-alloc-
//                       ptr" stored at `*(buf - 8)`.
//   }
//
// LARGE STATE BUFFER at +0x1f0 (935 bytes, 32B-aligned; contents written
// by C2 @0x22c534..@0x22c797). The buffer is the "argument data" blob
// passed to the Metal shader via `hg_Params [[ buffer(0) ]]`; it holds
// the initial-default lens-distortion state (radial coeffs, principal
// point, extents, plus a compressed profile table). The C2 writes:
//   * a leading zero-padded region (8 × movaps xmm0=0, from +0x08 to +0x88
//     of the buffer) — the header of the "State" struct is zero-inited.
//   * then a run of movaps/movsd stores of RIP-relative constants,
//     interleaved between paired offsets (each constant is stored twice
//     at neighbouring offsets — the pattern `movaps %xmm1, +0x98; movaps
//     %xmm1, +0x88`, then `movaps %xmm1, +0xb8; movaps %xmm1, +0xa8`
//     etc. — i.e. filling a table of paired columns).
//
// The RIP-relative constants written into the buffer, in the exact order
// the ctor writes them (each is a movaps xmm1 = 16B, or a movsd xmm1 =
// 8B then a movaps xmm1 that broadcasts the 8B to both halves of the
// 16B slot, then two paired stores into buf+A and buf+B):
//
//   (all addresses below are decoded VM addresses in the Helium x86_64
//    slice; f32/f64 payloads recovered via `struct.unpack` at that VA)
//
//   @0x22c563  movaps  @Helium 0x85fed0  = f32×4 { 1.0002442598342896 × 4 }
//                                          (= u32 0x3F802000 × 4)
//   @0x22c57a  movaps  @Helium 0x88d470  = f32×4 { 3.4028234663852886e+38 × 4 }
//                                          (= FLT_MAX × 4)
//   @0x22c591  movsd   @Helium 0x88d480  = f32×2 { 0.5, -71.12108612060547 }
//                                          (only low 8B loaded then movaps'd)
//   @0x22c5a9  movsd   @Helium 0x88d490  = f32×2 { 3.0, 0.5 }
//   @0x22c5c1  movsd   @Helium 0x88d4a0  = f32×2 { -FLT_MAX, -0.25 }
//   @0x22c5d9  movsd   @Helium 0x88d4b0  = f32×2 { 2.0, 0.15915493667125702 }   (0.15915... = 1/(2π))
//   @0x22c5f1  movsd   @Helium 0x3d2250  = f32×2 { NaN, NaN }
//   @0x22c609  movsd   @Helium 0x88d4c0  = f32×2 { 1.0, 81.3651123046875 }
//   @0x22c621  movsd   @Helium 0x88d4d0  = f32×2 { 2.0, -41.33846664428711 }
//   @0x22c639  movsd   @Helium 0x88d4e0  = f32×2 { -FLT_MAX, 6.2831854820251465 }   (6.2831... = 2π)
//   @0x22c651  movsd   @Helium 0x88d4f0  = f32×2 { FLT_MAX, 0.25 }
//   @0x22c669  movsd   @Helium 0x88d500  = f32×2 { 3.0, -FLT_MAX }
//   @0x22c681  movsd   @Helium 0x88d510  = f32×2 { 0.5, 2.0 }
//   @0x22c699  movaps  @Helium 0x88d520  = f32×4 { 0.0, 0.0, -0.0, -0.0 }
//   @0x22c6b0  movaps  @Helium 0x3c7c20  = f32×4 { -1.0, -1.0, -1.0, -1.0 }
//   @0x22c6d7  movss   @Helium 0x88d53c  = f32 -0.013480469584465027   (broadcast to xmm[0..3])
//   @0x22c6ef  movss   @Helium 0x88d540  = f32  0.05747731402516365    (broadcast)
//   @0x22c707  movss   @Helium 0x88d544  = f32  0.121239073574543      (broadcast)
//   @0x22c71f  movss   @Helium 0x88d548  = f32  0.19563592970371246    (broadcast)
//   @0x22c737  movss   @Helium 0x88d54c  = f32  0.33299461007118225    (broadcast)
//   @0x22c74f  movss   @Helium 0x88d550  = f32  0.9999956488609314     (broadcast)
//   @0x22c767  movss   @Helium 0x88d554  = f32  1.5707963705062866     (broadcast; = π/2)
//   @0x22c77f  movss   @Helium 0x3d8870  = f32 -0.0                    (broadcast)
//
// Full transcription of the ctor requires deciding WHICH byte offsets
// inside the 935-byte buffer each of the above constants writes to
// (each `movaps %xmm1, +A(%rcx,%rax); movaps %xmm1, +B(%rcx,%rax)` pair
// touches TWO 16B slots, and there are ~15 such pairs, so ~30 stores
// into a table whose semantic layout is HGLensDistort::State — that
// State struct is NOT yet decoded in this project). The constants are
// all recovered above (bit-exact); mapping them to State fields is left
// for a follow-up worker with a decoded State layout. We throw from the
// ctor with the full addr trail so nothing downstream can silently
// consume half-initialized state.
//
// GetProgram: returns a pointer to a Metal shader source string when
// `HGRenderer::GetTarget(0x60000)` == 0x60B10. Otherwise NULL.
//
// The shader source itself (transcribed verbatim from the __TEXT,__cstring
// literal at rip+0x6ead47 in GetProgram, byte-for-byte identical to the
// InitProgramDescriptor "Undistort_hgc_visible" variant @rip+0x6eb0cf):
//     r0.xy = frag._texCoord0.xy - hg_Params[1].xy;
//     r0.xy = r0.xy*hg_Params[0].zw;                 // scale into normalized-space
//     r1.x = dot(r0.xy, r0.xy);                       // squared radius
//     r1.x = rsqrt(r1.x);                             // 1/r
//     r2.x = hg_Params[2].y / r1.x;                   // fov * r
//     r2.x = atan(r2.x);                              // atan(fov * r)
//     r1.x = r1.x*hg_Params[2].x;                     // (1/r) * screenExtent2
//     r1.x = r1.x*r2.x;                               // radial-inverse scale = atan(fov·r)/r · screenExtent2
//     r0.xy = r0.xy*r1.xx;
//     r0.xy = r0.xy*hg_Params[0].xy + hg_Params[1].xy;   // renormalize + recenter
//     r0.xy = r0.xy + hg_Params[4].xy;                    // texture-space offset
//     r0.xy = r0.xy*hg_Params[4].zw;                      // texture-space scale
//     output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
// This is the INVERSE of the forward-distort shader (see sibling
// HGLensDistort_distort_kernel.ts): where forward computes
// `tan(r*fov)/r * screenExtent2`, this one computes
// `atan(fov*r) / r * screenExtent2`, mapping distorted-space back to
// normalized-space (i.e. lens rectification / undistort). hg_Params
// slot semantics (same as the sibling):
//     [0].xy = image half-extent
//     [0].zw = image inv-extent
//     [1].xy = principal point (center)
//     [2].x  = 1 / (2 * tan(fov/2))       (screenExtent2 reciprocal)
//     [2].y  = tan(fov/2) · 2             (screenExtent2 itself)
//     [4].xy/[4].zw = texture crop transform
// (These are consistent with the C2's +0x1e4 = 2·tan(0.5)  and  +0x1e8
// = 1/(2·tan(0.5)) initial defaults — the ctor pre-fills the two
// slot [2] scalars with default-fov=0.5 values that get pushed to the
// shader by _setShaderParameters at slot=2.)
//
// _setShaderParameters wires slots [0], [1], [2] from members at +0x1c4,
// +0x1b0, +0x1e0/+0x1e4/+0x1e8; slot [3] is set from two rip-relative
// float constants (see the method body below).

import { HGNode } from "./HGNode";

/**
 * Enum of HGRenderer target types. Only the value used by GetProgram is
 * decoded here — everything else is opaque.
 *
 * `HGRenderer::GetTarget(0x60000)` is the "which shading language does
 * this renderer speak" query; the returned enum 0x60B10 identifies the
 * Metal-1.0-fragment target that this kernel can service.
 * Cited at GetProgram @0x22b977 (esi=0x60000) and @0x22b983 (cmp eax, 0x60b10).
 */
export const HGRendererTargetKind_MetalFragment_1_0 = 0x60b10;
export const HGRendererTargetQuery_ShaderLanguage = 0x60000;

/**
 * The verbatim `Undistort_hgc_visible` variant of the shader source
 * (embedded at rip+0x6eb0cf inside InitProgramDescriptor). Passed to
 * `HGProgramDescriptor::SetVisibleShaderWithSource("Undistort_hgc_visible", <src>)`.
 *
 * KEEP THIS STRING AS-IS. It is the exact byte sequence in the binary.
 */
// eslint-disable-next-line @typescript-eslint/quotes
export const UNDISTORT_HGC_VISIBLE_SHADER_SRC =
  "//Metal1.0     \n//LEN=00000002d3\n[[ visible ]] FragmentOut Undistort_hgc_visible(const constant float4* hg_Params, \n    texture2d< float > hg_Texture0, \n    sampler hg_Sampler0,\n    float4 texCoord0)\n{\n    float4 r0, r1, r2;\n    FragmentOut output;\n\n    r0.xy = texCoord0.xy - hg_Params[1].xy;\n    r0.xy = r0.xy*hg_Params[0].zw;\n    r1.x = dot(r0.xy, r0.xy);\n    r1.x = rsqrt(r1.x);\n    r2.x = hg_Params[2].y/r1.x;\n    r2.x = atan(r2.x);\n    r1.x = r1.x*hg_Params[2].x;\n    r1.x = r1.x*r2.x;\n    r0.xy = r0.xy*r1.xx;\n    r0.xy = r0.xy*hg_Params[0].xy + hg_Params[1].xy;\n    r0.xy = r0.xy + hg_Params[4].xy;\n    r0.xy = r0.xy*hg_Params[4].zw;\n    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);\n    return output;\n}\n";

/**
 * The verbatim fragment-function variant of the Undistort shader source
 * (embedded at rip+0x6ead47 inside GetProgram — the "fragmentFunc"
 * wrapper). Returned by GetProgram when the renderer target matches
 * Metal 1.0.
 */
// eslint-disable-next-line @typescript-eslint/quotes
export const UNDISTORT_FRAGMENT_FUNC_SHADER_SRC =
  "//Metal1.0     \n//LEN=0000000397\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n    float4 r0, r1, r2;\n    FragmentOut output;\n\n    r0.xy = frag._texCoord0.xy - hg_Params[1].xy;\n    r0.xy = r0.xy*hg_Params[0].zw;\n    r1.x = dot(r0.xy, r0.xy);\n    r1.x = rsqrt(r1.x);\n    r2.x = hg_Params[2].y/r1.x;\n    r2.x = atan(r2.x);\n    r1.x = r1.x*hg_Params[2].x;\n    r1.x = r1.x*r2.x;\n    r0.xy = r0.xy*r1.xx;\n    r0.xy = r0.xy*hg_Params[0].xy + hg_Params[1].xy;\n    r0.xy = r0.xy + hg_Params[4].xy;\n    r0.xy = r0.xy*hg_Params[4].zw;\n    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);\n    return output;\n}\n//MD5=c9cd4bc4:909bbd39:6f129146:25873351\n//SIG=00000000:00000000:00000000:00000000:0000:0005:0003:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * Opaque HGRenderer type — GetProgram only needs the `GetTarget(u32)`
 * signature. Cited at Helium 0x22b97c (`callq __ZN10HGRenderer9GetTargetEj`,
 * `HGRenderer::GetTarget(unsigned int)`). Full class not transcribed here.
 */
export interface HGRendererLite {
  GetTarget(query: number): number;
}

/**
 * Opaque HGProgramDescriptor — InitProgramDescriptor calls four decoded
 * members on it. Same shape as the sibling
 * HGLensDistort_distort_kernel.HGProgramDescriptorLite.
 */
export interface HGProgramDescriptorLite {
  /** `HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)`.
   *  Called at Helium 0x22b9c2 in InitProgramDescriptor. */
  SetVisibleShaderWithSource(name: string, source: string): void;
  /** `HGProgramDescriptor::SetFragmentFunctionName(char const*)`.
   *  Called at Helium 0x22b9d1 with "Undistort". */
  SetFragmentFunctionName(name: string): void;
  /** `HGProgramDescriptor::SetReturnBinding(HGBinding)`.
   *  Called at Helium 0x22ba18 with a stack-constructed HGBinding
   *  `{kind:0x4, small-string:"FragmentOut", extras@rip-relative}`. */
  SetReturnBinding(binding: HGBinding): void;
  /** `HGProgramDescriptor::SetArgumentBindings(std::vector<HGBinding> const&)`.
   *  Called at Helium 0x22bc2a with a 3-element bindings vector built
   *  in-place on the stack. */
  SetArgumentBindings(bindings: readonly HGBinding[]): void;
}

/**
 * Opaque HGBinding — same shape as the sibling's. InitProgramDescriptor
 * builds four HGBinding values with these `kind` codes:
 *   kind=0x4  "FragmentOut"      (return binding)
 *   kind=0x2  "float4"           (arg 0)
 *   kind=0x9  "texture2d<float>" (arg 1)
 *   kind=0x6  "sampler"          (arg 2)
 *   kind=0x8  "float4"           (arg 3 — texcoord)
 * Full HGBinding class not yet transcribed.
 */
export interface HGBinding {
  kind: number;
  typeName: string;
  extrasRipAddr?: number;
}

/** HGRect — passed by value to _distortROI/_distortDOD (16-byte struct). */
export interface HGRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** `HGTile*` argument to RenderTile. Opaque — RenderTile is a throw-stub. */
export type HGTile = unknown;

/** HGFilterMode enum value returned by GetFilterMode. Kernel returns 0
 *  (`GetFilterMode` @Helium 0x22c9c0: `xorl %eax,%eax; ret`). */
export type HGFilterMode = number;

/**
 * `HGLensDistort_undistort_kernel` — HGNode subclass wrapping the
 * inverse-distort Metal shader + AVX software fallback.
 */
export class HGLensDistort_undistort_kernel extends HGNode {
  // +0x1a8 .. +0x1eb  — LensParams inline payload (see LensParams.ts).
  //                     _distortROI/_distortDOD reach into this via
  //                     `addq $0x1a8, %rdi`. Kept as an opaque Uint8Array
  //                     because the ctor's fill of this region uses raw
  //                     .rodata bit patterns (see file header).
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private lensParamsBlock: Uint8Array = new Uint8Array(0x44);

  // +0x1b0..+0x1b8 — pair of f32 slots read by _setShaderParameters as
  //                  the hg_Params[1].xy uniform (principal point).
  //                  See @0x22c941/22c949 (`movss 0x1b0(%rbx),%xmm0;
  //                  movss 0x1b4(%rbx),%xmm1`).
  private uniform_param1_xy: [number, number] = [0, 0];

  // +0x1c4..+0x1d0 — 4 f32 slots read as hg_Params[0].xyzw. See
  //                  @0x22c919..22c931 (`movss 0x1c4..0x1d0`).
  private uniform_param0_xyzw: [number, number, number, number] = [0, 0, 0, 0];

  // +0x1e0 — f32 with initial value 1.0f from ctor @0x22c4b9
  //          (`movl $0x3f800000, 0x1e0(%rbx)` = bit-pattern for 1.0f).
  //          Read by _setShaderParameters @0x22c965 as hg_Params[2].x's
  //          FIRST scalar? Actually not — trace: _setShaderParameters
  //          slot=2 reads +0x1e0 and +0x1e4 (`movss 0x1e0(%rbx),%xmm0;
  //          movss 0x1e4(%rbx),%xmm1`). See body below.
  private field_1e0: number = 1.0;

  // +0x1e4 — f32 = float(2 * tan(0.5)). Written at @0x22c4d8.
  //          `_tan(0.5)` @0x3cc1c0 → double result; `addsd %xmm0,%xmm0`
  //          doubles it; `cvtsd2ss` narrows to f32; `movss %xmm0,0x1e4`.
  //          Numerically: 2·tan(0.5) ≈ 1.09262 f32.
  private field_1e4: number = 0;

  // +0x1e8 — f32 = 1.0f / +0x1e4. Written at @0x22c4ec.
  //          `movss 0x19b7d8(rip),%xmm1` = 1.0f @Helium 0x3c7cc0; then
  //          `divss %xmm0,%xmm1`; then `movss %xmm1,0x1e8(%rbx)`.
  //          Numerically: 1/(2·tan(0.5)) ≈ 0.91525 f32. Not directly
  //          read by _setShaderParameters (which reads +0x1e0/+0x1e4);
  //          used by the AVX fallback / State prep elsewhere.
  private field_1e8: number = 0;

  // +0x1f0 — ptr → 0x3a7-byte (32B-aligned) heap buffer holding the
  //          initial State / uniform-buffer payload. Allocated via
  //          `__Znam(0x3a7)` @0x22c51e; filled with the constants
  //          enumerated in the file header. Kept opaque; see ctor
  //          throw-stub for the full addr trail.
  private uniformBuffer: Uint8Array | null = null;

  /**
   * `HGLensDistort_undistort_kernel::HGLensDistort_undistort_kernel()`
   * @Helium 0x22c470 (C2 base ctor). C1 @0x229d50 is a bare tail-jmp
   * to this body (`jmp __ZN30HGLensDistort_undistort_kernelC2Ev`).
   *
   * Structural work performed (from the disasm at
   *   raw-port/re/disasm/Helium.HGLensDistort_undistort_kernel.HGLensDistort_undistort_kernel.s):
   *   1. Chains to HGNode base ctor via `callq __ZN6HGNodeC2Ev` @0x22c47a.
   *   2. Writes packed constants from the .rodata pool at RIP offsets
   *      into offsets +0x1a8 (16B), +0x1b8 (16B), +0x1c8 (16B), +0x1d8
   *      (8B), +0x1e0 (u32 = 0x3f800000 = 1.0f).
   *   3. Calls `_tan(<double @Helium 0x3cc1c0 = 0.5>)` @0x22c4cb and
   *      writes 2·tan(0.5) narrowed to f32 into +0x1e4; writes
   *      1.0f/+0x1e4 into +0x1e8.
   *   4. Clears +0x1f0 (u64=0), then allocates a 0x3a7-byte buffer via
   *      `operator new[]` @0x22c51e, aligns to 32B via the "leaq +0x8;
   *      negl; andl $0x1f; leaq (%rcx,%rax); addq $0x8" trick @0x22c523..
   *      @0x22c530, stores the raw-alloc-ptr at `buf-8` (for the dtor
   *      to recover), zeros +0x08..+0x88 of payload with `xorps xmm0`
   *      (8 × 16B slots), writes ~30 f32/f64 constants from the RIP-
   *      relative .rodata pool (see file header for the exact values
   *      and their VAs), and stores the aligned ptr to +0x1f0.
   *   5. Sets +0x10 packed-flag field
   *      (`andl 0xfffff9fe, orl 0x401` @0x22c4ff..@0x22c50c — clears
   *      bits 1..9 except bit 10; sets bit 0 and bit 10). This is the
   *      HGNode-level render-page-strategy flag word; the exact bit
   *      meanings are documented in HGNode.ts.
   *   6. Installs vptr = `leaq 0x806e82(%rip),%rax; movq %rax,(%rbx)`
   *      @0x22c50f/22c516 → 0xa33398.
   *
   * The ~30 constants at step 4 have all been recovered (see file
   * header for their exact f32/f64 values and VAs), but mapping each
   * to its byte-offset within the State buffer requires walking the
   * paired `movaps + movaps` store sequence and knowing the
   * HGLensDistort::State struct layout. State is not yet decoded
   * here; hand-writing the 30 offsets without the struct layout risks
   * silently mis-packing them into wrong shader-uniform slots.
   * Throw with the full addr trail so a follow-up worker with a
   * decoded State can complete this without guessing.
   */
  constructor() {
    super();
    throw new Error(
      "HGLensDistort_undistort_kernel::HGLensDistort_undistort_kernel() @Helium 0x22c470 not yet transcribed — " +
        "body writes 4 packed vec4 constants to +0x1a8/+0x1b8/+0x1c8/+0x1d8 (@0x22c47f..0x22c4b1), " +
        "sets +0x1e0=1.0f (@0x22c4b9), computes +0x1e4=float(2*tan(0.5)) via _tan(@Helium 0x3cc1c0=0.5) " +
        "@0x22c4cb, +0x1e8=1.0f/(+0x1e4) @0x22c4ec, allocates 0x3a7-byte 32B-aligned State buffer via " +
        "__Znam @0x22c51e, and fills it with ~30 RIP-relative f32/f64 constants @0x22c534..0x22c797 " +
        "(all values decoded — see file header). HGLensDistort::State struct layout not yet decoded, " +
        "so mapping constants→field offsets is deferred. Chains HGNode::HGNode() @0x11baf0. " +
        "vptr installed @0x22c50f (0xa33398).",
    );
  }

  /**
   * `HGLensDistort_undistort_kernel::~HGLensDistort_undistort_kernel()`
   * @Helium 0x22c7c0 (D2 base dtor).
   *
   * Line-for-line disasm:
   *   0x22c7c0  leaq  0x806bd1(%rip), %rax    ; = 0xa33398 (vptr)
   *   0x22c7c7  movq  %rax, (%rdi)            ; reinstall vptr (standard C++)
   *   0x22c7ca  movq  0x1f0(%rdi), %rax       ; buf = this->uniformBuffer
   *   0x22c7d1  testq %rax, %rax
   *   0x22c7d4  je    HGNode::~HGNode()       ; buf == NULL -> straight to base dtor
   *   0x22c7da  movq  -0x8(%rax), %rax        ; raw-alloc-ptr = buf[-8]
   *   0x22c7de  testq %rax, %rax
   *   0x22c7e1  je    HGNode::~HGNode()       ; raw-alloc-ptr == NULL -> base dtor
   *   ... prologue (push rbp, rbx, rax; save rdi in rbx) ...
   *   0x22c7f0  movq  %rax, %rdi
   *   0x22c7f3  callq __ZdlPv                 ; operator delete(raw-alloc-ptr)
   *   0x22c7f8  movq  %rbx, %rdi
   *   ... epilogue ...
   *   0x22c801  jmp   __ZN6HGNodeD2Ev         ; tail-call HGNode::~HGNode()
   *
   * D1 @0x22c810 is the SAME body (leaq 0x806b81(rip)=0xa33398 → same
   * vptr; identical dealloc + base-dtor tail-call). D0 @0x22c860 wraps
   * D2's body then jmp's to `__ZN8HGObjectdlEPv` (HGObject::operator
   * delete(void*)).
   */
  destruct(): void {
    throw new Error(
      "HGLensDistort_undistort_kernel::~HGLensDistort_undistort_kernel() @Helium 0x22c7c0 not yet transcribed — " +
        "reinstalls vptr 0xa33398, reads raw-alloc-ptr from `*(this->uniformBuffer - 8)`, calls " +
        "__ZdlPv (operator delete) @0x22c7f3, then tail-calls HGNode::~HGNode() @0x11bf20. " +
        "D1 @0x22c810 same body; D0 @0x22c860 adds HGObject::operator delete(void*) tail.",
    );
  }

  /**
   * `HGLensDistort_undistort_kernel::GetProgram(HGRenderer* r)`
   * @Helium 0x22b970.
   *
   * Line-for-line disasm:
   *   0x22b974  movq  %rsi, %rdi                     ; renderer → rdi (rsi is 1st formal)
   *   0x22b977  movl  $0x60000, %esi                 ; query = 0x60000
   *   0x22b97c  callq HGRenderer::GetTarget(u32)
   *   0x22b981  xorl  %ecx, %ecx                     ; result = NULL
   *   0x22b983  cmpl  $0x60b10, %eax
   *   0x22b988  leaq  0x6ead47(%rip), %rax           ; shader-source ptr candidate
   *   0x22b98f  cmoveq %rax, %rcx                    ; if equal, result = ptr
   *   0x22b993  movq  %rcx, %rax
   *   0x22b996  retq
   *
   * Identical structure to the sibling `HGLensDistort_distort_kernel`'s
   * GetProgram, just returning the UNDISTORT fragmentFunc source instead
   * of the DISTORT one.
   */
  GetProgram(renderer: HGRendererLite): string | null {
    // @Helium 0x22b97c — HGRenderer::GetTarget(0x60000).
    const target = renderer.GetTarget(HGRendererTargetQuery_ShaderLanguage);
    // @Helium 0x22b983/22b98f — cmp + cmove.
    if (target === HGRendererTargetKind_MetalFragment_1_0) {
      // @Helium 0x22b988 — literal pool for the fragmentFunc source.
      return UNDISTORT_FRAGMENT_FUNC_SHADER_SRC;
    }
    // @Helium 0x22b981 — xor ecx,ecx : NULL default.
    return null;
  }

  /**
   * `HGLensDistort_undistort_kernel::GetFilterMode(int, HGFilterMode)`
   * @Helium 0x22c9c0. Body is `xorl %eax,%eax; ret` — always returns 0.
   *
   * The two args (int index, HGFilterMode default) are ignored. Kernel
   * declares "I want the default filter mode 0 regardless of what index
   * you ask about". Identical to the sibling's GetFilterMode.
   */
  GetFilterMode(_index: number, _defaultMode: HGFilterMode): HGFilterMode {
    // @Helium 0x22c9c4 xorl %eax, %eax
    return 0;
  }

  /**
   * `HGLensDistort_undistort_kernel::_distortROI(HGRect r)` @Helium 0x22c8b0.
   *
   * Line-for-line disasm:
   *   0x22c8b8  movq  %rsi, -0x10(%rbp)                      ; spill HGRect halves onto stack
   *   0x22c8bc  movq  %rdx, -0x8(%rbp)
   *   0x22c8c0  addq  $0x1a8, %rdi                           ; self = this + 0x1a8 (LensParams*)
   *   0x22c8c7  leaq  __ZN10LensParams9undistortERK3Pt2(%rip), %rsi   ; = &LensParams::undistort(Pt2 const&)
   *   0x22c8ce  leaq  -0x10(%rbp), %rcx                      ; &HGRect (spilled)
   *   0x22c8d2  xorl  %edx, %edx                             ; second member-fn-ptr slot = 0
   *   0x22c8d4  callq __ZN10LensParams12_processRectEMS_F3Pt2RKS0_ERK6HGRect
   *   0x22c8dd  ret
   *
   * i.e. this kernel's `_distortROI` uses `LensParams::UNDISTORT` as
   * the per-corner sampler (NB: this is the OPPOSITE of the sibling
   * `HGLensDistort_distort_kernel::_distortROI`, which uses
   * `LensParams::distort`). The naming is not a typo — for an
   * un-distortion kernel, the "ROI" (input region needed to fill an
   * output rect) is found by UN-distorting the output-rect corners,
   * because the shader's per-pixel map from output-space to sample-space
   * is `undistort` (see the shader source above).
   *
   * `LensParams::_processRect` is currently a throw-stub in LensParams.ts
   * (cite Helium 0x229800). Forwarding to `undistortRect` here would
   * double-nest identical throws; throw directly with the addr trail.
   */
  _distortROI(_r: HGRect): HGRect {
    throw new Error(
      "HGLensDistort_undistort_kernel::_distortROI @Helium 0x22c8b0 — forwards to " +
        "LensParams::_processRect(&LensParams::undistort, r) @Helium 0x229800, currently a throw-stub " +
        "(LensParams::_processRect body @0x229800 not yet transcribed).",
    );
  }

  /**
   * `HGLensDistort_undistort_kernel::_distortDOD(HGRect r)` @Helium 0x22c8e0.
   *
   * Line-for-line disasm mirrors _distortROI with the ONE difference
   * that the member-fn-ptr passed is `&LensParams::distort(Pt2)`:
   *   0x22c8f7  leaq  __ZN10LensParams7distortERK3Pt2(%rip), %rsi
   *
   * i.e. the DOD (domain of definition — the output rect covered when
   * you feed a given source rect) is found by DISTORTing the source-rect
   * corners. This is the inverse pairing of _distortROI (which
   * undistorts), and again the OPPOSITE of the sibling
   * HGLensDistort_distort_kernel::_distortDOD (which uses `undistort`).
   */
  _distortDOD(_r: HGRect): HGRect {
    throw new Error(
      "HGLensDistort_undistort_kernel::_distortDOD @Helium 0x22c8e0 — forwards to " +
        "LensParams::_processRect(&LensParams::distort, r) @Helium 0x229800, currently a throw-stub " +
        "(LensParams::_processRect body @0x229800 not yet transcribed).",
    );
  }

  /**
   * `HGLensDistort_undistort_kernel::_setShaderParameters()` @Helium 0x22c910.
   *
   * Reads four float4 uniform vectors out of our instance fields and
   * pushes them into slots 0..3 of the shader's uniform buffer via the
   * vtable slot *0x60 (= HGNode::SetParameter(int, f32, f32, f32, f32),
   * inherited from HGNode). The vtable indirection is:
   *   `movq (%rdi), %rax` — load vptr
   *   `callq *0x60(%rax)` — call slot *0x60
   *
   * The 4 slot values, from the disasm:
   *   slot=0 (`xor esi,esi` @0x22c93c):
   *      xmm0..xmm3 = f32 @+0x1c4, @+0x1c8, @+0x1cc, @+0x1d0
   *      (`movss 0x1c4/0x1c8/0x1cc/0x1d0(%rdi)` @0x22c919..22c931).
   *   slot=1 (`mov esi,$1` @0x22c95d):
   *      xmm0 = f32 @+0x1b0, xmm1 = f32 @+0x1b4, xmm2 = xmm3 = 0
   *      (`movss 0x1b0/0x1b4(%rbx); xorps %xmm2,%xmm2; xorps %xmm3,%xmm3`
   *       @0x22c941..22c957).
   *   slot=2 (`mov esi,$2` @0x22c981):
   *      xmm0 = f32 @+0x1e0, xmm1 = f32 @+0x1e4, xmm2 = xmm3 = 0
   *      (`movss 0x1e0/0x1e4(%rbx); xorps %xmm2,%xmm2; xorps %xmm3,%xmm3`
   *       @0x22c965..22c97b).
   *   slot=3 (`mov esi,$3` @0x22c9a3):
   *      xmm0 = xmm1 = f32 @rip+0x19d778 = @Helium 0x3ca110 (const)
   *      xmm2 = xmm3 = f32 @rip+0x19b320 = @Helium 0x3c7cc0 (const)
   *      (`movss 0x19d778(%rip),%xmm0; movss 0x19b320(%rip),%xmm2;
   *       movaps %xmm0,%xmm1; movaps %xmm2,%xmm3` @0x22c990..0x22c9ab).
   *      Then tail-`jmpq *%rax` @0x22c9b4 (i.e. the last SetParameter
   *      call is a tail call — the epilogue restores rbx/rbp/rsp and
   *      jumps into the vtable slot instead of `callq`ing).
   *
   * The two RIP-relative constants read at slot=3 come from Helium's
   * __TEXT,__const at rip+0x19d778 and rip+0x19b320. The rip base for
   * the first movss is 0x22c990+7 = 0x22c997, so target = 0x22c997 +
   * 0x19d778 = 0x3ca10f rounded to the next f32 boundary — but that's a
   * misalignment; recomputing: after `movss 0x19d778(%rip),%xmm0` (7B
   * instruction starting at 0x22c990, next-instr = 0x22c997), target =
   * 0x22c997 + 0x19d778 = 0x3ca10f. That's a byte-misaligned addr —
   * suggesting the instruction is actually 8B (with a REX+opcode prefix
   * pattern that pushes the RIP-rel disp field to 0x22c994), so target
   * = 0x22c998 + 0x19d778 = 0x3ca110. Similarly rip+0x19b320 resolves
   * to @Helium 0x3c7cc0 (which we ALREADY know from the ctor — the same
   * 16B block `(1.0, 6.0, 0.5, -0.5)`, whose FIRST f32 is 1.0). Reading
   * both as their first-f32:
   *   @Helium 0x3ca110 = ? (not yet resolved in this file)
   *   @Helium 0x3c7cc0 = 1.0f  (already decoded in file header)
   * So slot=3 pushes (X, X, 1.0, 1.0) where X is the const at
   * @Helium 0x3ca110 (not yet resolved).
   *
   * Because ONE of the two RIP-relative constants at slot=3 is
   * unresolved (@Helium 0x3ca110), and this method's ONLY output is the
   * shader's uniform buffer (i.e. any wrong value silently produces
   * wrong pixels downstream), we throw with the full addr trail rather
   * than ship a partial transcription. All @0xADDR citations for the
   * slot=0/1/2 stores + the resolved @Helium 0x3c7cc0=1.0f for slot=3
   * channels 2+3 are in-line above so a follow-up worker can complete
   * this method by resolving just the ONE remaining constant.
   */
  _setShaderParameters(): void {
    throw new Error(
      "HGLensDistort_undistort_kernel::_setShaderParameters @Helium 0x22c910 not yet transcribed — " +
        "sets shader uniform slots 0..3 via vtable *0x60 (HGNode::SetParameter). Slots 0,1,2 read " +
        "from decoded member offsets +0x1c4/+0x1b0/+0x1e0 (see body doc). Slot 3 reads two " +
        "RIP-relative f32 consts: rip@0x22c990+0x19d778=@Helium 0x3ca110 (NOT YET RESOLVED) " +
        "and rip@0x22c998+0x19b320=@Helium 0x3c7cc0=1.0f (resolved). Const-pool decode of " +
        "@Helium 0x3ca110 required before body can be transcribed without guessing.",
    );
  }

  /**
   * `HGLensDistort_undistort_kernel::InitProgramDescriptor(HGProgramDescriptor* desc) const`
   * @Helium 0x22b9a0.
   *
   * Structural work (mirrors the sibling
   * HGLensDistort_distort_kernel::InitProgramDescriptor @0x22a860):
   *   1. `desc->SetVisibleShaderWithSource("Undistort_hgc_visible", <visible shader src>)`
   *      @0x22b9c2 — visible variant, passed verbatim from rip+0x6eb0cf
   *      (= @Helium ~0x91700f) — the source is UNDISTORT_HGC_VISIBLE_SHADER_SRC.
   *   2. `desc->SetFragmentFunctionName("Undistort")` @0x22b9d1.
   *   3. Constructs an HGBinding on the stack:
   *        {kind=0x4, small-string="FragmentOut", extras@rip+0x19f686}
   *      via a sequence of `movl $4; movb $0x16; movabsq
   *      $0x746e656d67617246,-0x87(%rbp); movl $0x74754f74,-0x80(%rbp);
   *      movb $0,-0x7c(%rbp); movaps 0x19f686(%rip),%xmm0; movups
   *      %xmm0,-0x70(%rbp)` @0x22b9d6..@0x22ba14. The literal
   *      0x746e656d67617246 spells "FragmentO" LE + a following
   *      0x74754f74 = "tOut" LE, then null terminator — i.e. the C
   *      string "FragmentOut" packed into the HGBinding's small-string
   *      buffer. Then `SetReturnBinding` @0x22ba18.
   *   4. Builds a std::vector<HGBinding> in-place (empty backing
   *      @-0x30..-0x20 @0x22ba2f..@0x22ba3e), emplace_backs FOUR
   *      bindings (each with a fast-path capacity check + slow-path
   *      `__emplace_back_slow_path` at addresses shown):
   *        {kind=0x2, small-string="float4",           extras@rip+0x6619ff} @0x22ba3e..@0x22ba7a
   *        {kind=0x9, small-string="texture2d<float>", extras@rip+0x19f5e2} @0x22ba89..@0x22bafd
   *        {kind=0x6, small-string="sampler",          extras@rip+0x19f558} @0x22bb14..@0x22bb87
   *        {kind=0x8, small-string="float4",           extras@rip+0x19f4cf} @0x22bb9e..@0x22bc10
   *      The `float4` small-string is built with `movl $0x616f6c66,
   *      -0x57(%rbp); movw $0x3474, -0x53(%rbp); movb $0,-0x51(%rbp)`
   *      = LE bytes "floa" + "t4" + "\0". The `texture2d<float>` uses
   *      `movups 0x6cfc72(%rip),%xmm0; movups %xmm0,-0x57(%rbp); movb
   *      $0,-0x47(%rbp)` — a 16-char string from the .rodata. Similar
   *      for "sampler" (`movl $0x706d6173, -0x57; movl $0x72656c70,
   *      -0x54`).
   *   5. `desc->SetArgumentBindings(bindings)` @0x22bc2a.
   *   6. Destroys the local vector (walks backwards, frees any SSO-
   *      overflow strings, then `__ZdlPv` on the vector backing).
   *
   * Deferred because HGBinding class + small-string SSO mechanics +
   * the four `extras` .rodata payloads are not modeled. Throw-stub
   * cites the full addr trail.
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorLite): void {
    throw new Error(
      "HGLensDistort_undistort_kernel::InitProgramDescriptor @Helium 0x22b9a0 not yet transcribed — " +
        "chains SetVisibleShaderWithSource(\"Undistort_hgc_visible\", UNDISTORT_HGC_VISIBLE_SHADER_SRC) @0x22b9c2 + " +
        "SetFragmentFunctionName(\"Undistort\") @0x22b9d1 + " +
        "SetReturnBinding(HGBinding{kind=4,\"FragmentOut\",extras@rip+0x19f686}) @0x22ba18 + " +
        "SetArgumentBindings(std::vector<HGBinding>{{2,\"float4\",@rip+0x6619ff}, " +
        "{9,\"texture2d<float>\",@rip+0x19f5e2}, {6,\"sampler\",@rip+0x19f558}, " +
        "{8,\"float4\",@rip+0x19f4cf}}) @0x22bc2a. HGBinding + string SSO not yet landed.",
    );
  }

  /**
   * `HGLensDistort_undistort_kernel::RenderTile(HGTile* tile)`
   * @Helium 0x22bcd0. 437-line body.
   *
   * Structural walk of the disasm:
   *
   *   Entry (@0x22bce1..@0x22bd11) reads HGTile fields:
   *     %rsi+0x00  int   x0            (base+0)
   *     %rsi+0x04  int   y0            (r8d)
   *     %rsi+0x08  int   y1            (eax)
   *     %rsi+0x0c  int   x1            (edi, movslq into rdi)
   *     %rsi+0x10  ptr   tileData      (r12)
   *     %rsi+0x18  int   rowStride     (r13, movslq into r13)
   *   Early-outs (@0x22bcef..@0x22bd00) if:
   *     x1 == y0        (`cmpl %r8d, %edi; sete %cl`)     - degenerate width
   *     y1 - x0 == 0    (`subl (%rsi), %eax; sete %dl`)   - degenerate height
   *   (These two zero-checks OR together (`orb %cl, %dl; jne exit`).)
   *
   *   Then (@0x22bd06..@0x22bd66): an unrolled `___bzero` prologue
   *   clears the destination tile before dispatch. The clear loop is
   *   dimensioned by:
   *     r15 = (y1 - x0)     ; row size in bytes-of-something (later `shlq $0x4, %r15` → *16)
   *     r14 = (x1 - y0)     ; row count (later masked with 0x7 for the tail-alignment prologue)
   *     r13 = rowStride     ; scaled by 16 later (`shlq $0x4, %r13`)
   *   Under-8-row tail: if `(r14 & 0x7) != 0`, walk (r14 mod 8) rows,
   *   each calling `___bzero(tileData, r15)` and advancing tileData by
   *   r13*16 per row. Then the main 8-row-per-iter unrolled bzero loop
   *   (@0x22bd88..@0x22bdf8) processes the remainder in blocks of 8.
   *
   *   After the clear (@0x22be06): early-return if the degenerate
   *   width/height check tripped, else proceed to dispatch:
   *     @0x22be14  callq HGTile::Renderer() const     ; get renderer* from tile
   *     @0x22be1e  callq HGRenderer::GetTarget(u32)    ; ask renderer what it is
   *     @0x22be30  callq GetUndistortTile_AVX(HGTile*, HGLensDistort::State*, HGNode*)
   *                                                    ; software AVX fallback dispatch
   *
   *   So RenderTile:
   *     (a) zero-clears the destination tile with an unrolled bzero
   *         loop (fast path when target is Metal — the Metal shader
   *         will then overwrite every pixel; the pre-clear is defensive
   *         for OOB samples and RGBA correctness);
   *     (b) checks the renderer target;
   *     (c) if the target is the AVX software path, dispatches to
   *         `GetUndistortTile_AVX(tile, this->state @+0x1f0, this-as-HGNode)`
   *         which walks every pixel of the tile in software using the
   *         State buffer built by the ctor.
   *
   *   The Metal path does NOT return through here — HGKernel/HGRenderer
   *   picks up the shader from GetProgram + the uniforms from
   *   _setShaderParameters and dispatches on the GPU directly.
   *
   * The 400-line unrolled bzero is a pure memory clear, no math. The
   * AVX fallback (`GetUndistortTile_AVX`) is a large free function
   * (private static in this TU — `__ZL20GetUndistortTile_AVXP6HGTilePN13HGLensDistort5StateEP6HGNode`)
   * that has NOT been decoded here; it consumes the State buffer built
   * by the ctor and produces the same pixel output as the shader.
   * Faithful transcription is deferred until (a) HGTile struct is
   * modeled and (b) GetUndistortTile_AVX is decoded.
   */
  RenderTile(_tile: HGTile): void {
    throw new Error(
      "HGLensDistort_undistort_kernel::RenderTile @Helium 0x22bcd0 not yet transcribed — 437-line " +
        "body: (1) reads HGTile.{x0@+0x00,y0@+0x04,y1@+0x08,x1@+0x0c,tileData@+0x10,rowStride@+0x18} " +
        "@0x22bce4..0x22bd11, (2) early-outs on degenerate width/height @0x22bcef/22bcfb, " +
        "(3) unrolled ___bzero clear of tileData rows (8-row-per-iter + tail-mod-8 prologue) " +
        "@0x22bd88..0x22bdf8, (4) HGTile::Renderer() @0x22be14, (5) HGRenderer::GetTarget @0x22be1e, " +
        "(6) tail-calls GetUndistortTile_AVX(tile, this->state@+0x1f0, this) @Helium 0x22be30 " +
        "(free fn __ZL20GetUndistortTile_AVXP6HGTilePN13HGLensDistort5StateEP6HGNode, not yet transcribed). " +
        "Metal path bypasses this fn — HGKernel dispatches shader from GetProgram + uniforms from " +
        "_setShaderParameters directly on GPU.",
    );
  }
}
