// raw-port/src/render/HGLensDistort_distort_kernel.ts
//
// FCP `HGLensDistort_distort_kernel` — Helium HGNode subclass that owns
// the "forward-distort" branch of the Lens Distort filter. Ships a
// per-pixel Metal fragment shader baked into the binary; this class is
// the CPU wrapper that (1) sets 4 float4 uniform slots (hg_Params[0..4])
// on the node, (2) returns the Metal shader source when the renderer
// target is Metal, and (3) delegates tile-execution to the Metal
// pipeline.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice; file
//             offset 0x4000; VAs unadjusted from `otool -tV`).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel.HGLensDistort_distort_kernel.s (C1 @0x229d40)
//   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel.C2.s                            (C2 @0x22b400)
//   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel.GetProgram.s                    (@0x22a830)
//   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel.InitProgramDescriptor.s         (@0x22a860)
//   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel.RenderTile.s                    (@0x22ab90)
//   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel._distortROI.s                   (@0x22b840)
//   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel._distortDOD.s                   (@0x22b870)
//   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel._setShaderParameters.s          (@0x22b8a0)
//   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel.GetFilterMode.s                 (@0x22b960)
//   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel.D2.s                            (D2 @0x22b750)
//
// Ledger addresses (Helium.ledger.json):
//   0x229d40  HGLensDistort_distort_kernel::HGLensDistort_distort_kernel()   [C1 → tail-jmp C2]
//   0x22a830  HGLensDistort_distort_kernel::GetProgram(HGRenderer*)
//   0x22a860  HGLensDistort_distort_kernel::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x22ab90  HGLensDistort_distort_kernel::RenderTile(HGTile*)
//   0x22b400  HGLensDistort_distort_kernel::HGLensDistort_distort_kernel()   [C2]
//   0x22b750  HGLensDistort_distort_kernel::~HGLensDistort_distort_kernel()  [D2]
//   0x22b7a0  HGLensDistort_distort_kernel::~HGLensDistort_distort_kernel()  [D1 → jmp D2]
//   0x22b7f0  HGLensDistort_distort_kernel::~HGLensDistort_distort_kernel()  [D0 → jmp D2 + delete]
//   0x22b840  HGLensDistort_distort_kernel::_distortROI(HGRect)
//   0x22b870  HGLensDistort_distort_kernel::_distortDOD(HGRect)
//   0x22b8a0  HGLensDistort_distort_kernel::_setShaderParameters()
//   0x22b960  HGLensDistort_distort_kernel::GetFilterMode(int, HGFilterMode)
//
// VTABLE (from `resolve.py Helium vtable HGLensDistort_distort_kernel`):
//   Helium 0xa33128 (installed-ptr 0xa33138). Overrides:
//     *0x00 -> 0x22b7a0   ~HGLensDistort_distort_kernel()   [D1]
//     *0x08 -> 0x22b7f0   ~HGLensDistort_distort_kernel()   [D0]
//     *0xb0 -> 0x22ab90   RenderTile(HGTile*)
//     *0xb8 -> 0x22a830   GetProgram(HGRenderer*)
//   All other slots (Retain/Release, debugDescription, SetParameter@*0x60,
//   GetParameter@*0x68, GetNumInputs, SetInput, GetInput, ...) INHERITED
//   from HGNode. `_setShaderParameters` below calls slot *0x60 on `this`,
//   which resolves to HGNode::SetParameter(int, float, float, float, float).
//
// STRUCT LAYOUT (recovered from C2 @0x22b400 + _setShaderParameters +
//                _distortROI/_distortDOD):
//   HGLensDistort_distort_kernel : public HGNode {
//     +0x000..+0x1a7    HGNode base subobject (landed).
//     +0x1a8..+0x1a8+0x44   LensParams   inline (68 bytes; +0x1a8 is the
//                                          LensParams::a0 offset used by
//                                          _distortROI/_distortDOD via `addq $0x1a8, %rdi`).
//     +0x1a8 .. +0x1eb  = LensParams::{a0..invScreenExtent2}. Wire-compat
//                         with the LensParams::_processRect callback expected by
//                         _distort{ROI,DOD} which pass `this + 0x1a8` as the
//                         LensParams* self-pointer.
//                         Verified: C2 @0x22b40f `movaps 0x661ffa(%rip),%xmm0;
//                         movups %xmm0, 0x1a8(%rbx)` matches LensParams::C2
//                         (LensParams.ts a0..a3 default init "1,1,0.5,0.5" @0x88d410).
//     +0x1c4..+0x1cc    LensParams field_1c..field_2c   (see LensParams.ts).
//     +0x1d8            LensParams field_30 (double)   — cf @0x22b439 movsd 0x63457f(rip).
//     +0x1e0            u32 = 0x3f800000  (=1.0f).
//     +0x1e4            f32 = 2 * tan(<const-double @rip 0x22b453>)   (see @0x22b45b:
//                         calls _tan on a rip-relative double, doubles the result,
//                         narrows to float, stores at +0x1e4).
//     +0x1e8            f32 = <const-float>/xmm0  (@0x22b470/478; movss/divss).
//     +0x1f0            u64  = 0     (@0x22b484 movq $0).
//     +0x1f0 (again)    reused as pointer to an aligned heap buffer of size
//                         0x3a7 (aligned to 0x20; allocated via
//                         operator new[](0x3a7) @0x22b4ae, then aligned by
//                         `leaq 0x8(%rax),%rcx; negl %ecx; andl $0x1f,%ecx;
//                          leaq (%rcx,%rax),%rdx; addq $0x8,%rdx`,
//                         a classic "reserve 8 bytes for backing ptr,
//                         then 32-byte aligned payload" trick).
//                         The buffer is filled with a mix of `xorps xmm0`
//                         (zeroing 8 × 16-byte slots) and 30 packed/scalar
//                         float/double consts from the .rodata pool @rip
//                         (@0x22b4f3..@0x22b71f). Buffer contents = the
//                         initial ARGUMENT DATA blob for the Metal shader's
//                         uniform buffer (see the shader source in GetProgram:
//                         `hg_Params [[ buffer(0) ]]` is a `const constant float4*`).
//   }
//
// The full ctor is a giant list of raw byte writes at unnamed offsets
// with unresolved .rodata bit patterns. Transcribing every constant would
// require decoding ~30 RIP-relative float/double literals against the
// `Helium __TEXT,__const` segment, none of which have been indexed yet.
// We keep the FIELDS declared (with offsets) so subclasses/consumers see
// the layout, and throw from the ctor with a full addr-trail so a future
// worker can complete the constant table decode without guessing.
//
// GetProgram: returns a pointer to a Metal shader source string when
// `HGRenderer::GetTarget(0x60000)` == 0x60B10 (the "Metal 1.0 fragment"
// renderer target enum). Otherwise NULL — signalling this kernel has
// no CPU fallback and the renderer must skip / try another kernel.
//
// The shader source itself (transcribed verbatim from the __TEXT,__cstring
// literal at rip+0x6eb679 in GetProgram, verified byte-for-byte identical
// to the InitProgramDescriptor "visible" variant @rip+0x6ebac1):
//     r0.xy = frag._texCoord0.xy - hg_Params[1].xy;
//     r0.xy = r0.xy*hg_Params[0].zw;                 // scale into "distortion-space"
//     r1.x = dot(r0.xy, r0.xy);                       // squared radius
//     r1.x = rsqrt(r1.x);                             // 1/r
//     r2.x = 1.00000f / r1.x;                         // r
//     r3.x = r2.x*hg_Params[2].x;                     // r * fov
//     r3.y = tan(r3.x);                               // tan(r * fov)
//     r3.z = hg_Params[2].z*r1.x;                     // (invScreenExtent2 or similar) / r
//     r3.x = r3.y*r3.z;                               // = tan(r*fov)/(r*screenExtent2) — radial scale
//     r0.xy = r0.xy*r3.xx;                            // apply scale
//     r0.xy = r0.xy*hg_Params[0].xy + hg_Params[1].xy;  // unscale + recenter
//     r2 = r2.xxxx - hg_Params[2].yyyy;               // r - clip-radius (per-channel bcast)
//     r0.xy = r0.xy + hg_Params[4].xy;                // texture-space offset
//     r0.xy = r0.xy*hg_Params[4].zw;                  // texture-space scale
//     r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
//     output.color0 = select(0, r0, r2 < 0);          // outside-circle -> transparent
// This is Helium's fisheye-forward-distort mapping. hg_Params slots:
//     [0].xy = image half-extent   (used to renormalize output)
//     [0].zw = image inv-extent    (used to enter distortion space)
//     [1].xy = principal point (center)
//     [2].x  = fov (radians)
//     [2].y  = clip radius (fov/π-normalized)
//     [2].z  = 1 / (2 * tan(fov/2))       (screenExtent2 reciprocal)
//     [4].xy/[4].zw = texture crop transform (offset + scale)
// _setShaderParameters wires slots [0], [1], [2] from members at +0x1c4,
// +0x1b0, +0x1dc/+0x1e0/+0x1e8 (see below); slot [4] appears to be set
// elsewhere (parent HGLensDistort passes it through SetParameter(4, ...)).

import { HGNode } from "./HGNode";

/**
 * Enum of HGRenderer target types. Only the value used by GetProgram is
 * decoded here — everything else is opaque.
 *
 * `HGRenderer::GetTarget(0x60000)` is the "which shading language does
 * this renderer speak" query; the returned enum 0x60B10 identifies the
 * Metal-1.0-fragment target that this kernel can service.
 * Cited at GetProgram @0x22a837 (esi=0x60000) and @0x22a843 (cmp eax, 0x60b10).
 */
export const HGRendererTargetKind_MetalFragment_1_0 = 0x60b10;
export const HGRendererTargetQuery_ShaderLanguage = 0x60000;

/**
 * The verbatim `hg_visible` variant of the Distort shader source (as
 * embedded at rip+0x6ebac1 inside InitProgramDescriptor). Passed to
 * `HGProgramDescriptor::SetVisibleShaderWithSource("Distort_hgc_visible", <src>)`.
 *
 * KEEP THIS STRING AS-IS. It is the exact byte sequence in the binary
 * (including the leading "//Metal1.0" comment and the LEN= header). Any
 * paraphrase would break byte-level equivalence with FCP's own shader
 * compilation cache.
 */
// eslint-disable-next-line @typescript-eslint/quotes
export const DISTORT_HGC_VISIBLE_SHADER_SRC =
  "//Metal1.0     \n//LEN=0000000395\n[[ visible ]] FragmentOut Distort_hgc_visible(const constant float4* hg_Params, \n    texture2d< float > hg_Texture0, \n    sampler hg_Sampler0,\n    float4 texCoord0)\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2, r3;\n    FragmentOut output;\n\n    r0.xy = texCoord0.xy - hg_Params[1].xy;\n    r0.xy = r0.xy*hg_Params[0].zw;\n    r1.x = dot(r0.xy, r0.xy);\n    r1.x = rsqrt(r1.x);\n    r2.x = 1.00000f / r1.x;\n    r3.x = r2.x*hg_Params[2].x;\n    r3.y = tan(r3.x);\n    r3.z = hg_Params[2].z*r1.x;\n    r3.x = r3.y*r3.z;\n    r0.xy = r0.xy*r3.xx;\n    r0.xy = r0.xy*hg_Params[0].xy + hg_Params[1].xy;\n    r2 = r2.xxxx - hg_Params[2].yyyy;\n    r0.xy = r0.xy + hg_Params[4].xy;\n    r0.xy = r0.xy*hg_Params[4].zw;\n    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);\n    output.color0 = select(c0.xxxx, r0, r2 < 0.00000f);\n    return output;\n}\n";

/**
 * The verbatim fragment-function variant of the Distort shader source
 * (embedded at rip+0x6eb679 in GetProgram — the "fragmentFunc" wrapper).
 * Returned by GetProgram when the renderer target matches Metal 1.0.
 */
// eslint-disable-next-line @typescript-eslint/quotes
export const DISTORT_FRAGMENT_FUNC_SHADER_SRC =
  "//Metal1.0     \n//LEN=000000045b\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2, r3;\n    FragmentOut output;\n\n    r0.xy = frag._texCoord0.xy - hg_Params[1].xy;\n    r0.xy = r0.xy*hg_Params[0].zw;\n    r1.x = dot(r0.xy, r0.xy);\n    r1.x = rsqrt(r1.x);\n    r2.x = 1.00000f / r1.x;\n    r3.x = r2.x*hg_Params[2].x;\n    r3.y = tan(r3.x);\n    r3.z = hg_Params[2].z*r1.x;\n    r3.x = r3.y*r3.z;\n    r0.xy = r0.xy*r3.xx;\n    r0.xy = r0.xy*hg_Params[0].xy + hg_Params[1].xy;\n    r2 = r2.xxxx - hg_Params[2].yyyy;\n    r0.xy = r0.xy + hg_Params[4].xy;\n    r0.xy = r0.xy*hg_Params[4].zw;\n    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);\n    output.color0 = select(c0.xxxx, r0, r2 < 0.00000f);\n    return output;\n}\n//MD5=4d322dfd:2a8a7e67:eec40bc0:42abbacd\n//SIG=00000000:00000000:00000000:00000000:0001:0005:0004:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * Opaque HGRenderer type — we only need the `GetTarget(u32)` method
 * signature for GetProgram. Cited at Helium 0x22a83c (callq
 * `__ZN10HGRenderer9GetTargetEj`, `HGRenderer::GetTarget(unsigned int)`).
 * Full class not yet transcribed.
 */
export interface HGRendererLite {
  GetTarget(query: number): number;
}

/**
 * Opaque HGProgramDescriptor — InitProgramDescriptor calls three
 * decoded members on it. Kept as an interface with the exact callee
 * names + mangled symbols cited on each method so a future landing of
 * the class can drop-in-replace this. Method addresses are external
 * (not decoded in this file — they live in HGProgramDescriptor
 * elsewhere in the Helium binary and are called via `callq
 * __ZN19HGProgramDescriptor*`).
 */
export interface HGProgramDescriptorLite {
  /** `HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)`.
   *  Called at Helium 0x22a882 in InitProgramDescriptor. */
  SetVisibleShaderWithSource(name: string, source: string): void;
  /** `HGProgramDescriptor::SetFragmentFunctionName(char const*)`.
   *  Called at Helium 0x22a891 in InitProgramDescriptor with "Distort". */
  SetFragmentFunctionName(name: string): void;
  /** `HGProgramDescriptor::SetReturnBinding(HGBinding)`.
   *  Called at Helium 0x22a8d8 with a stack-constructed HGBinding
   *  `{kind:0x4, small-string:"FragmentOut", extras:@rip+0x1a07c6}`. */
  SetReturnBinding(binding: HGBinding): void;
  /** `HGProgramDescriptor::SetArgumentBindings(std::vector<HGBinding> const&)`.
   *  Called at Helium 0x22aaea with the 3-element bindings vector built
   *  in-place on the stack (see InitProgramDescriptor below). */
  SetArgumentBindings(bindings: readonly HGBinding[]): void;
}

/**
 * Opaque HGBinding — the shader-argument descriptor. InitProgramDescriptor
 * builds four HGBinding values with these `kind` codes and small-string
 * type names:
 *   kind=0x4  "FragmentOut"      (return binding)          @rip+0x1a07c6 extras
 *   kind=0x2  "float4"           (frag-in arg 0)           @rip+0x1a06c2 extras
 *   kind=0x9  "texture2d<float>" (arg 1)                   @rip+0x1a0722 extras
 *   kind=0x6  "sampler"          (arg 2)                   @rip+0x1a0698 extras
 *   kind=0x8  "float4"           (arg 3 — texcoord)        @rip+0x1a060f extras
 * The `.extras` pointer targets 16-byte packed structs of unknown layout
 * (not decoded here) that are unconditionally copied by the argument
 * emplace loop. Full HGBinding class is not yet transcribed.
 */
export interface HGBinding {
  kind: number;
  typeName: string;
  // extras: opaque 16-byte payload copied verbatim from .rodata (RIP addr
  // cited in the ctor logic). Not modeled here.
  extrasRipAddr?: number;
}

/**
 * The 68-byte LensParams payload embedded at `this+0x1a8`. Not modeled
 * as its own field (would require refactoring LensParams to have a "view
 * over foreign backing storage" constructor). See LensParams.ts for the
 * decoded field layout; _distortROI/_distortDOD compute a pointer to
 * `this + 0x1a8` and pass it to LensParams::_processRect as the
 * LensParams-self pointer.
 */
export interface HGRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** `HGTile*` argument to RenderTile. Opaque — RenderTile is a throw-stub. */
export type HGTile = unknown;

/** HGFilterMode enum value returned by GetFilterMode. Kernel returns 0
 *  (`GetFilterMode` @Helium 0x22b960: `xorl %eax,%eax; ret`). */
export type HGFilterMode = number;

/**
 * `HGLensDistort_distort_kernel` — HGNode subclass wrapping the forward-
 * distort Metal shader.
 *
 * Field layout — as decoded from the ctor @0x22b400 (see file header for
 * the full byte-write trail). Only the offsets referenced by the ported
 * methods are named; the rest of the ctor's initialization sequence is
 * captured as a throw citing @0x22b400.
 */
export class HGLensDistort_distort_kernel extends HGNode {
  // +0x1a8 .. +0x1eb  — LensParams inline payload (see LensParams.ts).
  //                     _distortROI/_distortDOD reach into this via
  //                     `addq $0x1a8, %rdi` before calling LensParams
  //                     methods. We KEEP THIS AS AN OPAQUE Uint8Array
  //                     rather than declaring a LensParams instance
  //                     because the ctor initializes each byte range
  //                     from a mix of raw .rodata bit patterns which
  //                     have not been resolved yet — declaring a typed
  //                     LensParams here would force us to synthesize its
  //                     fields from those unresolved constants.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private lensParamsBlock: Uint8Array = new Uint8Array(0x44);

  // +0x1b0..+0x1b8 — pair of f32 slots read by _setShaderParameters as
  //                  the hg_Params[1].xy uniform (principal point).
  //                  See @0x22b8d1/22b8d9 (`movss 0x1b0(%rbx), %xmm0;
  //                  movss 0x1b4(%rbx), %xmm1`).
  private uniform_param1_xy: [number, number] = [0, 0];

  // +0x1c4..+0x1d4 — 4 f32 slots read as hg_Params[0].xyzw. See
  //                  @0x22b8a9..22b8c1 (`movss 0x1c4..0x1d0`).
  private uniform_param0_xyzw: [number, number, number, number] = [0, 0, 0, 0];

  // +0x1dc — f32 read as hg_Params[2].x (fov). See @0x22b8f5.
  private uniform_param2_x: number = 0;

  // +0x1e0 — f32 with initial value 1.0f from ctor @0x22b449 (movl
  //          $0x3f800000, 0x1e0(%rbx) = bit-pattern for 1.0). Read by
  //          _setShaderParameters @0x22b8fd, then multiplied by a
  //          RIP-relative double constant @0x22b909 (`mulsd rip+0x661c1f`;
  //          the value is not decoded here — see throw-stub).
  private field_1e0: number = 1.0;

  // +0x1e4 — f32 = float(2 * tan(<const-double @rip+? in ctor>)). Written
  //          at @0x22b468. Not read by _setShaderParameters (that method
  //          reads +0x1e8, +0x1dc, +0x1e0 as slot [2] components).
  private field_1e4: number = 0;

  // +0x1e8 — f32 = 1.0f / field_1e4 (i.e. reciprocal of 2*tan(...)).
  //          Written at @0x22b47c (`divss %xmm0,%xmm1; movss %xmm1,0x1e8`).
  //          Read as hg_Params[2].z. See @0x22b915 in _setShaderParameters.
  private field_1e8: number = 0;

  // +0x1f0 — pointer to a 0x3a7-byte (32-byte-aligned) heap buffer that
  //          holds the shader's initial uniform-buffer payload. Allocated
  //          via `__Znam(0x3a7)` @0x22b4ae and filled with ~30 constants
  //          from the .rodata pool. Kept opaque; see ctor throw-stub.
  private uniformBuffer: Uint8Array | null = null;

  /**
   * `HGLensDistort_distort_kernel::HGLensDistort_distort_kernel()`
   * @Helium 0x22b400 (C2 base ctor). C1 @0x229d40 is a bare tail-jmp to
   * this body (`jmp __ZN28HGLensDistort_distort_kernelC2Ev`).
   *
   * Structural work performed (from the disasm at
   *   raw-port/re/disasm/Helium.HGLensDistort_distort_kernel.C2.s):
   *   1. Chains to HGNode base ctor via `callq __ZN6HGNodeC2Ev` @0x22b40a.
   *   2. Writes packed constants from the .rodata pool at RIP offsets
   *      into offsets +0x1a8 (16B), +0x1b8 (16B), +0x1c8 (16B), +0x1d8
   *      (8B double), +0x1e0 (u32 = 0x3f800000 = 1.0f).
   *   3. Calls `_tan(<double @rip>)` and writes 2·tan(·) to +0x1e4;
   *      writes 1.0f/·+0x1e4 to +0x1e8.
   *   4. Clears +0x1f0 (u64=0), then allocates a 0x3a7-byte heap buffer
   *      via `operator new[]`, aligns to 32B (with 8B header), zeros the
   *      first 8×16B of payload, writes ~30 f32/f64 constants from the
   *      RIP-relative .rodata pool, and stores the aligned pointer to
   *      +0x1f0.
   *   5. Sets +0x10 packed-flag field (`andl 0xfffff9fe, orl 0x401` —
   *      i.e. `packedField_20 & ~0x601 | 0x401`; low bit + bit 10 set,
   *      bits 1..9 cleared — HGNode-specific render-page-strategy state).
   *   6. Installs vptr = 0xa33128 (`leaq 0x807c92(%rip), %rax; movq %rax,(%rbx)`).
   *
   * The ~30 constants at step 4 are all RIP-relative loads that we would
   * need to resolve against the Helium `__TEXT,__const` segment. That
   * segment has NOT been indexed for this file; hand-decoding each of the
   * 30 targets would exceed the ANTI_SHORTCUT / "decode-don't-fit" bar.
   * A future worker with a resolved const-pool can complete this ctor;
   * for now we throw with the full addr trail so nothing downstream can
   * silently produce wrong uniform-buffer values.
   */
  constructor() {
    super();
    throw new Error(
      "HGLensDistort_distort_kernel::HGLensDistort_distort_kernel() @Helium 0x22b400 not yet transcribed — " +
        "body writes ~30 RIP-relative .rodata float/double constants into the +0x1f0 uniform buffer " +
        "(allocated via __Znam(0x3a7) @0x22b4ae, aligned to 32B via the `leaq +0x8; negl/andl $0x1f` " +
        "trick @0x22b4b3-@0x22b4c0). Const-pool entries at Helium rip@0x22b4f3..0x22b71f not yet resolved. " +
        "vptr installed @0x22b49f (leaq 0x807c92(%rip) = 0xa33128). Chains HGNode::HGNode() @0x11baf0.",
    );
  }

  /**
   * `HGLensDistort_distort_kernel::~HGLensDistort_distort_kernel()`
   * @Helium 0x22b750 (D2). D1 @0x22b7a0 and D0 @0x22b7f0 are thin wrappers
   * (D1 tail-jumps to D2; D0 tail-jumps to D2 then `operator delete`).
   *
   * The body deallocates the +0x1f0 aligned heap buffer (following the
   * "8-byte header holds raw ptr" convention set up by the ctor), then
   * calls `HGNode::~HGNode()` @0x11bf20. Body not transcribed yet.
   */
  destruct(): void {
    throw new Error(
      "HGLensDistort_distort_kernel::~HGLensDistort_distort_kernel() @Helium 0x22b750 not yet transcribed — " +
        "reads raw ptr from `*(this->uniformBuffer - 8)`, calls __ZdaPv (operator delete[]), then HGNode::~HGNode() @0x11bf20.",
    );
  }

  /**
   * `HGLensDistort_distort_kernel::GetProgram(HGRenderer* r)`
   * @Helium 0x22a830. Vtable slot *0xb8 on 0xa33128.
   *
   * Line-for-line disasm:
   *   0x22a834  movq  %rsi, %rdi                          ; this-slot unused, arg → rdi
   *   0x22a837  movl  $0x60000, %esi                      ; query = 0x60000
   *   0x22a83c  callq HGRenderer::GetTarget(u32)
   *   0x22a841  xorl  %ecx, %ecx                          ; result = NULL
   *   0x22a843  cmpl  $0x60b10, %eax
   *   0x22a848  leaq  0x6eb679(%rip), %rax                ; shader-source ptr candidate
   *   0x22a84f  cmoveq %rax, %rcx                         ; if equal, result = ptr
   *   0x22a853  movq  %rcx, %rax
   *   0x22a856  retq
   *
   * So: query the renderer for its shader-language target; if it reports
   * `0x60B10` (Metal 1.0 fragment), return the fragmentFunc shader source
   * pointer, otherwise NULL.
   *
   * NOTE: the disasm shows `movq %rsi, %rdi` at entry — meaning the
   * `HGRenderer*` is in `%rsi` (the FIRST FORMAL ARG, since `%rdi` is the
   * hidden `this` pointer). This is the standard SysV calling convention;
   * we just call `renderer.GetTarget(...)` in the TS port.
   */
  GetProgram(renderer: HGRendererLite): string | null {
    // @Helium 0x22a83c — HGRenderer::GetTarget(0x60000).
    const target = renderer.GetTarget(HGRendererTargetQuery_ShaderLanguage);
    // @Helium 0x22a843/22a84f — cmp + cmove.
    if (target === HGRendererTargetKind_MetalFragment_1_0) {
      // @Helium 0x22a848 — literal pool for the fragmentFunc source.
      return DISTORT_FRAGMENT_FUNC_SHADER_SRC;
    }
    // @Helium 0x22a841 — xor rcx,rcx : NULL default.
    return null;
  }

  /**
   * `HGLensDistort_distort_kernel::GetFilterMode(int, HGFilterMode)`
   * @Helium 0x22b960. Body is `xorl %eax,%eax; ret` — always returns 0.
   *
   * The two args (int index, HGFilterMode default) are ignored. Kernel
   * declares "I want the default filter mode 0 (nearest?) regardless of
   * what index you ask about". This overrides an HGNode/HGKernel base
   * that presumably returns the passed-in default; the concrete filter-
   * mode enum value 0 is emitted verbatim.
   */
  GetFilterMode(_index: number, _defaultMode: HGFilterMode): HGFilterMode {
    // @Helium 0x22b964 xorl %eax, %eax
    return 0;
  }

  /**
   * `HGLensDistort_distort_kernel::_distortROI(HGRect r)` @Helium 0x22b840.
   *
   * Line-for-line disasm:
   *   0x22b850  addq  $0x1a8, %rdi                          ; self = this + 0x1a8 (LensParams*)
   *   0x22b857  leaq  __ZN10LensParams7distortERK3Pt2(%rip), %rsi ; = &LensParams::distort(Pt2 const&)
   *   0x22b862  xorl  %edx, %edx                            ; second member-fn-ptr slot = 0
   *   0x22b864  callq __ZN10LensParams12_processRectEMS_F3Pt2RKS0_ERK6HGRect
   *   0x22b869  ret
   *
   * So we forward to `LensParams::_processRect(&LensParams::distort, r)`,
   * with the LensParams-self pointer being `this + 0x1a8` (i.e. the
   * embedded LensParams payload inside our object).
   *
   * Currently `LensParams._processRect` and `LensParams.distortRect` are
   * throw-stubs in LensParams.ts (both cite Helium 0x229800/0x2297e0).
   * Forwarding to `distortRect` here would double-nest identical throws;
   * we call it directly so the trail on the exception is short and clear.
   */
  _distortROI(_r: HGRect): HGRect {
    throw new Error(
      "HGLensDistort_distort_kernel::_distortROI @Helium 0x22b840 — forwards to " +
        "LensParams::_processRect(&LensParams::distort, r) @Helium 0x229800, currently a throw-stub " +
        "(LensParams::_processRect body @0x229800 not yet transcribed — 311-line member-fn-ptr sampler).",
    );
  }

  /**
   * `HGLensDistort_distort_kernel::_distortDOD(HGRect r)` @Helium 0x22b870.
   *
   * Line-for-line disasm mirrors _distortROI with the ONE difference that
   * the member-fn-ptr passed is `&LensParams::undistort(Pt2)` @0x229750
   * (@0x22b887: `leaq __ZN10LensParams9undistortERK3Pt2(%rip), %rsi`).
   * i.e. the "domain-of-definition" (DOD) is the INVERSE of the ROI:
   * a source pixel at rect corner R gets undistorted to find which
   * source-rect area feeds into R.
   *
   * Same deferral rationale as _distortROI above.
   */
  _distortDOD(_r: HGRect): HGRect {
    throw new Error(
      "HGLensDistort_distort_kernel::_distortDOD @Helium 0x22b870 — forwards to " +
        "LensParams::_processRect(&LensParams::undistort, r) @Helium 0x229800, currently a throw-stub " +
        "(LensParams::_processRect body @0x229800 not yet transcribed).",
    );
  }

  /**
   * `HGLensDistort_distort_kernel::_setShaderParameters()` @Helium 0x22b8a0.
   *
   * Reads four float4 uniform vectors out of our own instance fields and
   * pushes them into slots 0, 1, 2, 3 of the shader's uniform buffer via
   * the vtable slot *0x60 (= HGNode::SetParameter(int, f32, f32, f32, f32),
   * inherited unchanged from HGNode). The vtable indirection is:
   *   `movq (%rdi), %rax` — load vptr
   *   `callq *0x60(%rax)` — call slot *0x60
   *
   * The 4 slot values, from the disasm:
   *   slot=0 (`xor esi,esi` @0x22b8cc): xmm0..xmm3 = f32 @+0x1c4, @+0x1c8, @+0x1cc, @+0x1d0
   *   slot=1 (`mov esi,$1` @0x22b8ed):  xmm0..xmm3 = f32 @+0x1b0, @+0x1b4, 0, 0
   *   slot=2 (`mov esi,$2` @0x22b926):  xmm0 = f32 @+0x1dc,
   *                                     xmm1 = float(f32 @+0x1e0 * <double @rip+0x661c1f>),
   *                                     xmm2 = f32 @+0x1e8,
   *                                     xmm3 = 0
   *   slot=3 (`mov esi,$3` @0x22b94d):  xmm0 = xmm1 = f32 @rip+0x19e7d3 (const),
   *                                     xmm2 = xmm3 = f32 @rip+0x19c37b (const),
   *                                     tail-`jmp *rax` (skips restoring rsp/rbp because the
   *                                     final vtable call is a tail call).
   *
   * The two RIP-relative constants at slot=3 (@rip+0x19e7d3, @rip+0x19c37b)
   * live in Helium's __TEXT,__const and have not been resolved for this
   * file; likewise the double @rip+0x661c1f at slot=2 (used as a fov→radian
   * or fov→normalized scaling factor — see @0x22b909 `mulsd`) is not
   * resolved here.
   *
   * Since three .rodata addresses need to be decoded to correctly express
   * this method's output values, and this method's ONLY purpose is to
   * feed those values into the GPU shader (i.e. any wrong value silently
   * produces wrong pixels), we throw with the full addr trail rather than
   * ship a partial transcription.
   */
  _setShaderParameters(): void {
    throw new Error(
      "HGLensDistort_distort_kernel::_setShaderParameters @Helium 0x22b8a0 not yet transcribed — " +
        "sets shader uniform slots 0..3 via vtable *0x60 (HGNode::SetParameter). Slot 2 multiplies " +
        "field_1e0 by an unresolved double @Helium rip+0x661c1f (@call site 0x22b909). Slot 3 pushes " +
        "two unresolved f32 consts @Helium rip+0x19e7d3 and rip+0x19c37b (@call site 0x22b935/22b93d). " +
        "Const-pool decode required before body can be transcribed without guessing.",
    );
  }

  /**
   * `HGLensDistort_distort_kernel::InitProgramDescriptor(HGProgramDescriptor* desc) const`
   * @Helium 0x22a860.
   *
   * Structural work performed:
   *   1. `desc->SetVisibleShaderWithSource("Distort_hgc_visible", <visible shader source>)`
   *      — the visible variant is the `[[ visible ]] FragmentOut ...`
   *      block (see DISTORT_HGC_VISIBLE_SHADER_SRC above), passed
   *      verbatim from rip+0x6ebac1.
   *   2. `desc->SetFragmentFunctionName("Distort")`.
   *   3. Constructs an HGBinding on the stack {kind=0x4,
   *      small-string="FragmentOut", extras=@rip+0x1a07c6} and calls
   *      `desc->SetReturnBinding(binding)`. Frees the small-string
   *      only if its small-string-flag bit (low bit of the size byte)
   *      is 0x1 (i.e. it heap-allocated — for a static "FragmentOut"
   *      it always fits in SSO).
   *   4. Builds a std::vector<HGBinding> in-place (initially empty
   *      backing @-0x30..-0x20), emplace_backs three bindings in
   *      order:
   *        {kind=0x2, small-string="float4",           extras=@rip+0x1a06c2}
   *        {kind=0x9, small-string="texture2d<float>", extras=@rip+0x1a0722}
   *        {kind=0x6, small-string="sampler",          extras=@rip+0x1a0698}
   *        {kind=0x8, small-string="float4",           extras=@rip+0x1a060f}
   *      Each emplace_back is inlined with a fast-path (cap check) +
   *      slow-path (calls `__emplace_back_slow_path`).
   *   5. `desc->SetArgumentBindings(bindings)`.
   *   6. Destroys the local vector (walking backwards and freeing any
   *      SSO-overflow strings).
   *
   * The four `extras` payloads at @rip+0x1a07c6, +0x1a06c2, +0x1a0722,
   * +0x1a0698, +0x1a060f are 16-byte packed data (loaded via `movaps
   * 0x1a0XXX(%rip), %xmm0; movups %xmm0, -0x40(%rbp)`) whose layout
   * inside HGBinding is not decoded here. Because HGBinding is not
   * transcribed and the four `extras` payloads are opaque, this method
   * needs its dependencies (HGBinding + HGProgramDescriptor + string SSO
   * mechanics) landed before it can be faithfully ported. Throw-stub
   * cites the full addr trail.
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorLite): void {
    throw new Error(
      "HGLensDistort_distort_kernel::InitProgramDescriptor @Helium 0x22a860 not yet transcribed — " +
        "chains SetVisibleShaderWithSource @0x22a882 + SetFragmentFunctionName(\"Distort\") @0x22a891 + " +
        "SetReturnBinding(HGBinding{kind=4,\"FragmentOut\",extras@rip+0x1a07c6}) @0x22a8d8 + " +
        "SetArgumentBindings(std::vector<HGBinding>{{2,\"float4\",@rip+0x1a06c2}, " +
        "{9,\"texture2d<float>\",@rip+0x1a0722}, {6,\"sampler\",@rip+0x1a0698}, " +
        "{8,\"float4\",@rip+0x1a060f}}) @0x22aaea. HGBinding class + string SSO not yet landed.",
    );
  }

  /**
   * `HGLensDistort_distort_kernel::RenderTile(HGTile* tile)` @Helium 0x22ab90.
   *
   * 499-line body. Structurally the entry (@0x22aba7..@0x22abc6) reads
   * HGTile fields:
   *   %rsi+0x00  int   x0
   *   %rsi+0x04  int   y0        (r8d)
   *   %rsi+0x08  int   y1        (eax)
   *   %rsi+0xc   int   x1        (edi)
   *   %rsi+0x10  ptr   tileData  (r12)
   *   %rsi+0x18  int   rowStride (r13)
   * then early-outs if `y0==y1 || (y1-x0)==0` (@0x22abc6).
   * The subsequent 400+ lines are an unrolled bzero loop (32-byte-slot
   * per row × N rows) that clears the tile's memory before writing —
   * classic "prep destination" prologue before the Metal kernel writes.
   * There are NO calls into HGRenderer / HGKernel / no vtable dispatches
   * to a shader-execute function visible in the body — RenderTile appears
   * to be a pure memory-clearing stub for the GPU-backed path (the Metal
   * dispatch itself is done elsewhere, by HGKernel/HGRenderer, using the
   * shader returned by GetProgram + the uniforms set by _setShaderParameters).
   *
   * Transcribing the unrolled bzero loop faithfully would require decoding
   * the 8-way unroll + 6-way row loop + tail alignment; not landed yet.
   */
  RenderTile(_tile: HGTile): void {
    throw new Error(
      "HGLensDistort_distort_kernel::RenderTile @Helium 0x22ab90 not yet transcribed — 499-line " +
        "body is an unrolled `___bzero` prologue that clears the destination tile before GPU dispatch. " +
        "Reads HGTile.{x0@+0x00,y0@+0x04,y1@+0x08,x1@+0xc,tileData@+0x10,rowStride@+0x18}. Actual Metal " +
        "dispatch happens outside this method (HGKernel/HGRenderer uses the shader from GetProgram).",
    );
  }
}
