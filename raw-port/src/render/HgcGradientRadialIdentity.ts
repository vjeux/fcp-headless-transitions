// raw-port/src/render/HgcGradientRadialIdentity.ts
//
// FCP `HgcGradientRadialIdentity` — Helium compositor leaf that renders a
// radial gradient sampled through an IDENTITY transform (i.e., no rotation,
// scale, or perspective on the gradient's local coordinate system). This is
// one of the four leaves that `HGGradientRadial::GetOutput` (see
// HGGradientRadial.ts) instantiates after classifying the incoming 3x3
// transform matrix (Identity / Translate / Affine / Perspective).
//
// The leaf owns a 32-byte-aligned "scratch" parameter block (0x148 bytes of
// SIMD-lane-replicated uniforms + tail padding). SetParameter/GetParameter
// index this block in 32-byte strides (`shlq $5, %rcx` @0x30f3e3 / @0x30f467).
// The class is a `HGNode` subclass; renderers dispatch through the standard
// Hgc protocol: `GetProgram / InitProgramDescriptor / shaderDescription /
// BindTexture / Bind / RenderTile[_AVX] / GetDOD / GetROI / GetOutput`.
//
// Symbols decoded here (Helium, x86_64 slice; VAs are unadjusted VM
// addresses from otool -tV; file_offset = VA + 0x4000):
//   0x30e1e0  HgcGradientRadialIdentity::GetProgram(HGRenderer*)
//   0x30e210  HgcGradientRadialIdentity::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x30e540  HgcGradientRadialIdentity::shaderDescription() const
//   0x30e590  HgcGradientRadialIdentity::BindTexture(HGHandler*, int)
//   0x30e620  HgcGradientRadialIdentity::Bind(HGHandler*)
//   0x30e6b0  HgcGradientRadialIdentity::RenderTile_AVX(HGTile*)
//   0x30eb50  HgcGradientRadialIdentity::RenderTile(HGTile*)
//   0x30eff0  HgcGradientRadialIdentity::GetDOD(HGRenderer*, int, HGRect)
//   0x30f020  HgcGradientRadialIdentity::GetROI(HGRenderer*, int, HGRect)
//   0x30f060  HgcGradientRadialIdentity::HgcGradientRadialIdentity()   [C2 base ctor]
//   0x30f1a0  HgcGradientRadialIdentity::HgcGradientRadialIdentity()   [C1 complete ctor]
//   0x30f2e0  HgcGradientRadialIdentity::~HgcGradientRadialIdentity()  [D2 base dtor]
//   0x30f330  HgcGradientRadialIdentity::~HgcGradientRadialIdentity()  [D1 complete dtor]
//   0x30f380  HgcGradientRadialIdentity::~HgcGradientRadialIdentity()  [D0 deleting dtor]
//   0x30f3d0  HgcGradientRadialIdentity::SetParameter(int, float, float, float, float)
//   0x30f450  HgcGradientRadialIdentity::GetParameter(int, float*)
//   0x30f4a0  HgcGradientRadialIdentity::GetOutput(HGRenderer*)
//
// Vtable installed pointer — from C1 ctor @0x30f1af (`leaq 0x73198a(%rip),%rax`
// with next-instr 0x30f1b6): target = 0x30f1b6 + 0x73198a = 0xa40b40. That
// is the vtable+0x10 slot (installed-ptr) for this class's Helium vtable.
//
// STRUCT LAYOUT (extends HGNode; HGNode base @+0x00..+0x197 is opaque here):
//   +0x00..+0x197  HGNode subobject (see HGNode.ts).
//   +0x198  uint8_t*  scratchRawPtr — actually a POINTER into an aligned
//                     buffer; the raw malloc'd base is stashed at
//                     (scratchAligned - 8) so D0 can `delete[]` it.
//                     Layout in the aligned region, index by 32-byte stride:
//                       stride 0 (0x00..0x1f)  Param[0]  — 4-float slot; ctor
//                                              fills lo/hi 16-byte halves = zero
//                                              at +0x08 (movaps %xmm0, ...) and
//                                              +0x18. Written by SetParameter(0,..).
//                       stride 1 (0x20..0x3f)  Param[1]  — ditto zero-init at
//                                              +0x28 and +0x38. Written by
//                                              SetParameter(1,..).
//                       stride 2 (0x40..0x5f)  Param[2]  — ditto zero-init at
//                                              +0x48 and +0x58. Written by
//                                              SetParameter(2,..).
//                     Beyond the 3-slot user-writable region the ctor pre-fills
//                     6 more 16-byte quads with SHADER CONSTANTS (see below).
//   Total scratch alignment layout:
//     raw = operator new[](0x167)
//     aligned = raw + 8 + ((-raw - 8) & 0x1f)     ; aligned >= raw+8, %32==0
//     *(aligned - 8) = raw                         ; back-pointer for delete[]
//     scratchRawPtr = aligned  (stored at this+0x198)
//   The 0x167 = 0x148 (used) + 8 (back-ptr slot) + up to 31 (alignment slack).
//
// SHADER CONSTANTS pre-loaded by C1 ctor (const-pool -> aligned scratch):
//   scratch[+0x08], scratch[+0x18], scratch[+0x28], scratch[+0x38],
//   scratch[+0x48], scratch[+0x58]  = xorps %xmm0 (all zero f32x4) —
//     these are the "user Param" slot upper halves and are reserved for
//     runtime writes by SetParameter.
//   scratch[+0x68], scratch[+0x78] = movaps @Helium 0x3cb0d0
//     u32x4 = {0x00800000, 0x00800000, 0x00800000, 0x00800000}
//           = 4 x FLT_MIN (smallest positive normal f32, 1.1754943508e-38)
//     — a "reciprocal safety floor" used later by the SIMD gradient loop to
//       avoid a divide-by-zero on a zero-length radius.
//   scratch[+0x88], scratch[+0x98] = movaps @Helium 0x85fed0
//     u32x4 = {0x3f800801, 0x3f800801, 0x3f800801, 0x3f800801}
//           = 4 x 1.0002442598342896f — the "1.0 + epsilon" clamp ceiling
//     used by fmin at shader op `r1.xy = fmin(r1.xy, c0.xx)` (with c0.x=1.0)
//     to guarantee open-interval sampling on the LUT texture edge.
//   scratch[+0xa8], scratch[+0xb8] = movsd @Helium 0x3c9ff0
//     u32x2 = {0x3f000000, 0x3f000000}, upper-half preserved as {0,0} by
//     movsd = xmm4 = {0.5f, 0.5f, 0.0f, 0.0f}. Two of these back-to-back store
//     0.5f into lane [0,1] of Param[5,6] which the shader uses as its
//     "hg_Params[3].xy = 0.5" gradient-repeat pivot.
//   scratch[+0xc8], scratch[+0xd8] = movsd @Helium 0x891190
//     u32x2 = {0x40400000, 0x40400000} = {3.0f, 3.0f, 0.0f, 0.0f} — the
//     shader's `hg_Params[3].xy` scale factor pre-loaded (a ×3 for the
//     3-band LUT indexing scheme; note lane [2,3] left zero by movsd).
//   scratch[+0xe8], scratch[+0xf8] = movaps @Helium 0x3c7c40
//     u32x4 = {0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000} = 4 x 1.0f
//     — the `c0.x = 1.0` broadcast constant (fmin ceiling for r1.xy).
//   scratch[+0x108], scratch[+0x118] = xorps %xmm0 = {0,0,0,0} — reserved
//     runtime state slots (zeroed at ctor, written by later per-tile setup).
//   scratch[+0x128], scratch[+0x138] = movaps @Helium 0x88c7f0
//     u32x4 = {0xffffffff, 0xffffffff, 0xffffffff, 0x00000000} — an RGB-only
//     mask (all bits set on lanes 0..2, alpha-lane zeroed). Used by the SIMD
//     loop's `r1.xyz = r1.xyz * r1.www` premultiplication mask to keep the
//     alpha lane un-scaled. Verified against the FCP shader source at
//     0x30e1f8 which reads: "r1.xyz = r1.xyz*r1.www;".
//
// VTABLE-CALLED FRONTIER METHODS (throw-stubbed; targets belong to HGHandler,
// HGProgramDescriptor, HGRenderer, HGTile, HGNode — decoded elsewhere):
//   HGNode::SetFlags(int, int)                    @Helium *0x88 vtable slot
//                                                  (this class inherits; called
//                                                   from C1 ctor @0x30f2a3 as
//                                                   this->SetFlags(0, 5))
//   HGHandler::TexCoord(int,int,int,double const*) @Helium __ZN9HGHandler8TexCoordEiiiPKd
//                                                  (Bind @0x30e639)
//   HGHandler.vtable *0x80 (some int-returning query — BindTexture @0x30e5b2
//                          returns 1 to trigger the fresh-tile setup path)
//   HGHandler.vtable *0x48 (some no-arg method — BindTexture @0x30e5c7)
//   HGHandler.vtable *0x38 (some no-arg method — BindTexture @0x30e5d2)
//   HGHandler.vtable *0x88 SetParameter(int, xmm0..xmm3) (called from Bind
//                          @0x30e652 / @0x30e673 / @0x30e694 with 3 rows of
//                          param0..2 and from BindTexture @0x30e608 with a
//                          "row 3" (float tile-size, tile-size, 0, 0))
//   HGHandler.vtable *0x90 (bind-uniform 4-float — @0x30e652/@0x30e673/@0x30e694)
//   HGHandler.vtable *0xc0 (some finalize call — @0x30e6a3)
//   HGRenderer::GetTarget(unsigned int)             @Helium __ZN10HGRenderer9GetTargetEj
//   HGRenderer::GetInput(HGNode*, int)              @Helium __ZN10HGRenderer8GetInputEP6HGNodei
//   HGRenderer::GetDOD(HGNode*)                     @Helium __ZN10HGRenderer6GetDODEP6HGNode
//   HGTile::Renderer() const                        @Helium __ZNK6HGTile8RendererEv
//   HGProgramDescriptor::SetVisibleShaderWithSource / SetFragmentFunctionName /
//     SetReturnBinding / SetArgumentBindings         @Helium
//   HGRectInfinite / HGRectNull                     @Helium global rect symbols
//   HGNode::ClearBits() [void thunk]                @Helium __ZN6HGNode9ClearBitsEv
//   operator new[](size_t) / operator delete[](void*) — libc++ symbol stubs
//   HGObject::operator delete(void*)                @Helium __ZN8HGObjectdlEPv
//   HGNode::HGNode() / HGNode::~HGNode()            @Helium (imported)

import { HGNode } from "./HGNode.js";
import { HGRect, HGRectInfinite, HGRectNull } from "./HGRect.js";

/**
 * Vtable installed-pointer address for HgcGradientRadialIdentity.
 *
 * Recovered from C1 ctor @0x30f1af (`leaq 0x73198a(%rip),%rax`) with
 * next-instr 0x30f1b6: target = 0x30f1b6 + 0x73198a = 0xa40b40.
 * That is the primary-vptr slot (vtable+0x10) of the class's Helium
 * vtable and identifies this class at runtime. Recorded for provenance;
 * dispatch is via JS prototype chain at the port level.
 */
export const HgcGradientRadialIdentity_VTABLE_INSTALLED_PTR = 0xa40b40 as const;

/**
 * Total byte size of the raw allocation for the SIMD scratch block, from
 * `operator new[](0x167)` @0x30f1be. 0x167 = 0x148 (used, 20 16-byte quads
 * starting at +0x08 through +0x148) + 8 (back-pointer slot at aligned-8)
 * + up to 31 bytes of alignment slack for the 32-byte alignment idiom.
 */
export const HgcGradientRadialIdentity_SCRATCH_RAW_SIZE = 0x167 as const;

/**
 * Number of user-writable Param slots exposed by SetParameter/GetParameter.
 * Both fns bail with -1 when the incoming index is > 2 (`cmpl $0x2, %esi ;
 * ja bail` at @0x30f3d5 / @0x30f455). Each slot is a 4-float vector
 * (16 bytes payload, stored at both the low and high halves of a 32-byte
 * stride via `movups %xmm0, 0x10(%rax)` + `movups %xmm0, (%rax)` — the
 * duplication makes AVX-256 packed loads read the same value from either
 * half of a 256-bit lane pair).
 */
export const HgcGradientRadialIdentity_PARAM_COUNT = 3 as const;

/**
 * Shader description literal returned by `shaderDescription()` — the exact
 * string built by @0x30e566/@0x30e571 (two `movups` loads of a
 * 16-byte-aligned literal pool at @Helium 0x991d24 + 0x991d38 assembled
 * into a heap block of 0x28 bytes). The runtime lays it out as:
 *   size = 0x29 (byte 0x00..0x08 = short-string-size sentinel = 0x29|0x1)
 *   capacity = 0x20 (byte 0x08..0x10)
 *   data ptr = malloc(0x28)
 *     bytes [0..0x0f] = "HgcGradientRadial"     (via movups from lit pool)
 *     bytes [0x10..0x1f] = "lIdentity [hgc1]"   (via movups from lit pool)
 *     byte  [0x20] = '\0'
 *   total content = "HgcGradientRadialIdentity [hgc1]"
 * That is 32 bytes of payload + trailing NUL, matching the 0x20-capacity
 * long-string form. JS-side we model this as the resolved plain string.
 */
export const HgcGradientRadialIdentity_SHADER_DESC =
  "HgcGradientRadialIdentity [hgc1]" as const;

/**
 * Metal fragment shader source string embedded in the .rodata section of
 * Helium and returned by `GetProgram()` iff the renderer target reports
 * kind == 0x60b10. Read verbatim from the literal pool at @0x30e1f8
 * (RIP-rel 0x68262d from next-instr 0x30e1ff -> Helium 0x99082c). The
 * shader header records SIG=00000000:...:0001:0004:0003:0000:0000:0000:0002:0000:0001:01:0:1:0
 * which is HG's fragment-attribute descriptor (declared elsewhere by
 * InitProgramDescriptor). The MD5 line locks its identity for the
 * program-cache: MD5=fbc4a517:d5b8985a:eb4412b3:5f5c023b.
 */
export const HgcGradientRadialIdentity_METAL_FRAGMENT_SRC: string =
  "//Metal1.0     \n//LEN=000000049f\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n" +
  "    const float4 c0 = float4(1.000000000, 0.5000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1, r2;\n    FragmentOut output;\n\n" +
  "    r0.xyz = frag._texCoord0.xyz - hg_Params[1].xyz;\n" +
  "    r0.x = r0.x*hg_Params[0].x;\n" +
  "    r0.xy = float2(dot(r0.xyz, r0.xyz));\n" +
  "    r0.xy = sqrt(r0.xy);\n" +
  "    r1.xy = r0.xy*hg_Params[2].ww;\n" +
  "    r1.xy = fmin(r1.xy, c0.xx);\n" +
  "    r1.xy = r1.xy*hg_Params[3].xy;\n" +
  "    r1.xy = fmax(r1.xy, c0.yy);\n" +
  "    r2.xy = hg_Params[3].xy - c0.yy;\n" +
  "    r1.xy = fmin(r1.xy, r2.xy);\n" +
  "    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);\n" +
  "    r1.xyz = r1.xyz*r1.www;\n" +
  "    r2.x = hg_Params[2].x - c0.y;\n" +
  "    r2.x = fmax(r2.x, c0.z);\n" +
  "    r2.x = clamp(r0.x - r2.x, 0.00000f, 1.00000f);\n" +
  "    r2 = r1*-r2.xxxx + r1;\n" +
  "    output.color0 = select(r2, r1, hg_Params[2].yyyy == 0.00000f);\n" +
  "    return output;\n}\n" +
  "//MD5=fbc4a517:d5b8985a:eb4412b3:5f5c023b\n" +
  "//SIG=00000000:00000000:00000000:00000000:0001:0004:0003:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * The scratch block, sized for the exact byte-offset range the ctor writes
 * to (0x08..0x148). Slots are addressed by BYTE offset; SetParameter uses
 * a 32-byte stride (idx=0 -> +0x00, idx=1 -> +0x20, idx=2 -> +0x40), which
 * means the writable region is (0x00..0x5f) and the fixed shader-const
 * region is (0x60..0x148). We store it as a Uint8Array so the SIMD
 * layout is preserved verbatim; a Float32Array view is used for the
 * f32-value accesses.
 */
export type HgcGradientRadialIdentity_Scratch = {
  readonly bytes: Uint8Array;
  readonly f32: Float32Array;
};

/**
 * Build a fresh scratch block, mimicking the C1 ctor's aligned-allocation
 * + pre-fill sequence. In C++ this is `operator new[](0x167)` followed by
 * the standard clang manual 32-byte-alignment idiom (@0x30f1c3..0x30f1d0):
 *     leaq   0x8(%rax), %rcx    ; rcx = raw + 8
 *     negl   %ecx               ; rcx = -(raw+8)  (32-bit trunc — see below)
 *     andl   $0x1f, %ecx        ; rcx = (-(raw+8)) & 0x1f  (slack in [0..31])
 *     leaq   (%rcx,%rax), %rdx  ; rdx = raw + slack
 *     addq   $0x8, %rdx         ; rdx = raw + slack + 8      = aligned pointer
 *     movq   %rax, (%rcx,%rax)  ; (aligned - 8) = raw        = back-ptr
 *
 * At the JS layer allocation is intrinsically aligned (we don't need the
 * back-pointer to free it), so the aligned region is a plain 0x148-byte
 * buffer starting at offset 0. All internal byte offsets in this class
 * are relative to that aligned base.
 *
 * Ctor fills (byte-for-byte, from disasm @0x30f1d8..0x30f287):
 *   +0x08, +0x18, +0x28, +0x38, +0x48, +0x58, +0x108, +0x118  = xorps 0 (16 bytes)
 *   +0x68, +0x78            = movaps @Helium 0x3cb0d0 (4xFLT_MIN)
 *   +0x88, +0x98            = movaps @Helium 0x85fed0 (4x 1.0002442598342896f)
 *   +0xa8, +0xb8            = movaps <xmm1 from movsd @Helium 0x3c9ff0> = {0.5, 0.5, 0, 0}
 *   +0xc8, +0xd8            = movaps <xmm1 from movsd @Helium 0x891190> = {3.0, 3.0, 0, 0}
 *   +0xe8, +0xf8            = movaps @Helium 0x3c7c40 (4x 1.0f)
 *   +0x128, +0x138          = movaps @Helium 0x88c7f0 (RGB-mask: {~0,~0,~0,0})
 */
function HgcGradientRadialIdentity_buildScratch(): HgcGradientRadialIdentity_Scratch {
  // 0x148 bytes of aligned region (last written byte is +0x138 + 16 = 0x148).
  const bytes = new Uint8Array(0x148);
  const f32 = new Float32Array(bytes.buffer);

  // @0x3cb0d0 : 4x FLT_MIN = 0x00800000 as u32
  const FLT_MIN = new Uint32Array([0x00800000, 0x00800000, 0x00800000, 0x00800000]);
  // @0x85fed0 : 4x u32=0x3f800801 = 1.0002442598342896f
  const ONE_PLUS_EPS = new Uint32Array([0x3f800801, 0x3f800801, 0x3f800801, 0x3f800801]);
  // @0x3c9ff0 (movsd -> xmm1 zero-extended): xmm1 = {0.5f, 0.5f, 0f, 0f}
  const HALF_XY_ZERO_ZW = new Uint32Array([0x3f000000, 0x3f000000, 0x00000000, 0x00000000]);
  // @0x891190 (movsd -> xmm1 zero-extended): xmm1 = {3.0f, 3.0f, 0f, 0f}
  const THREE_XY_ZERO_ZW = new Uint32Array([0x40400000, 0x40400000, 0x00000000, 0x00000000]);
  // @0x3c7c40 : 4x 1.0f
  const ONE = new Uint32Array([0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000]);
  // @0x88c7f0 : RGB-lane all-ones mask, alpha-lane zero
  const RGB_MASK = new Uint32Array([0xffffffff, 0xffffffff, 0xffffffff, 0x00000000]);

  const u32 = new Uint32Array(bytes.buffer);
  const writeQuad = (byteOff: number, src: Uint32Array): void => {
    const i = byteOff >>> 2;
    u32[i]     = src[0]!;
    u32[i + 1] = src[1]!;
    u32[i + 2] = src[2]!;
    u32[i + 3] = src[3]!;
  };

  // xorps-zeroed slots (@0x30f1d8..0x30f1ef, @0x30f268/0x30f270).
  // f32 already zero-initialized by TypedArray semantics — the ctor's
  // explicit `xorps %xmm0, %xmm0 ; movaps %xmm0, ...` writes are no-ops
  // here. Recorded for provenance.

  writeQuad(0x68, FLT_MIN);           // @0x30f200 movaps %xmm1, 0x78(%rcx,%rax) — actually stores to 0x78 first
  writeQuad(0x78, FLT_MIN);           // @0x30f200 the pair is +0x78 then +0x68 in disasm order

  writeQuad(0x88, ONE_PLUS_EPS);      // @0x30f211 %xmm1 -> 0x98
  writeQuad(0x98, ONE_PLUS_EPS);      // @0x30f219

  writeQuad(0xa8, HALF_XY_ZERO_ZW);   // @0x30f229 %xmm1 -> 0xb8
  writeQuad(0xb8, HALF_XY_ZERO_ZW);   // @0x30f231

  writeQuad(0xc8, THREE_XY_ZERO_ZW);  // @0x30f241 %xmm1 -> 0xd8
  writeQuad(0xd8, THREE_XY_ZERO_ZW);  // @0x30f249

  writeQuad(0xe8, ONE);               // @0x30f258 %xmm1 -> 0xf8
  writeQuad(0xf8, ONE);               // @0x30f260

  writeQuad(0x128, RGB_MASK);         // @0x30f27f %xmm0 -> 0x138
  writeQuad(0x138, RGB_MASK);         // @0x30f287

  // f32 view used by SetParameter/GetParameter/Bind (they read/write floats).
  return { bytes, f32 };
}

/**
 * `HgcGradientRadialIdentity` — the compositor leaf for a radial gradient
 * sampled through an identity coordinate transform. See file header for
 * the full symbol map and shader source. All virtual-slot bodies that
 * cross into HGRenderer/HGHandler/HGProgramDescriptor/HGTile throw with
 * their `@0xADDR` per Rule 3 until those classes are decoded.
 */
export class HgcGradientRadialIdentity extends HGNode {
  /**
   * @0x198 scratchAligned — 32-byte-aligned parameter block. In FCP the
   * pointer stored here is `raw + 8 + ((-raw - 8) & 0x1f)`; the raw
   * malloc'd pointer is stashed at (this[0x198] - 8) so D0 can free it.
   *
   * At the JS layer we model just the aligned region as a typed-buffer
   * pair (see `HgcGradientRadialIdentity_buildScratch`). The 3-slot
   * user-writable region occupies bytes 0x00..0x5f in 32-byte strides;
   * bytes 0x60..0x148 hold shader constants pre-loaded by the ctor.
   */
  private _scratch: HgcGradientRadialIdentity_Scratch;

  /**
   * HgcGradientRadialIdentity::HgcGradientRadialIdentity() @0x30f1a0 (C1
   * complete ctor; the C2 base variant @0x30f060 shares an identical
   * body). Body walked below:
   *
   *   @0x30f1aa callq HGNode::HGNode()            — chain to base ctor.
   *   @0x30f1af leaq  0x73198a(%rip), %rax
   *   @0x30f1b6 movq  %rax, (%rbx)                — install vtable+0x10 ptr @0xa40b40.
   *   @0x30f1b9 movl  $0x167, %edi
   *   @0x30f1be callq operator new[](0x167)       — 0x167-byte scratch alloc.
   *   @0x30f1c3..0x30f1d4                         — 32-byte manual-alignment idiom;
   *                                                  aligned = raw + 8 + ((-raw-8) & 0x1f);
   *                                                  *(aligned - 8) = raw (back-ptr).
   *   @0x30f1d8..0x30f287                         — pre-fill scratch (see buildScratch).
   *   @0x30f28f movq  %rdx, 0x198(%rbx)           — this+0x198 = aligned pointer.
   *   @0x30f296 movq  (%rbx), %rax
   *   @0x30f299 movq  %rbx, %rdi
   *   @0x30f29c xorl  %esi, %esi
   *   @0x30f29e movl  $0x5, %edx
   *   @0x30f2a3 callq *0x88(%rax)                 — vtable slot *0x88 = HGNode::SetFlags(0, 5).
   *   @0x30f2a9..0x30f2b6                         — this+0x10 = (this+0x10 & 0xFFFFF9FE) | 0x401
   *                                                  (RMW on the base-class renderPageStrategy
   *                                                   bitfield — clears bits {0,9,10}, sets
   *                                                   bits {0,10}. Net: clear bit 9, force bit 0
   *                                                   and bit 10.)
   *   @0x30f2b9..retq                             — standard epilogue.
   *
   * Landing pad @0x30f2be..0x30f2cc unwinds through HGNode::~HGNode() +
   * _Unwind_Resume; not modeled at the JS layer.
   */
  constructor() {
    super();                                                          // @0x30f1aa callq HGNode::HGNode()
    // @0x30f1af-30f1b6 install vtable+0x10 (@0xa40b40) — JS prototype chain models this.
    // @0x30f1be-30f28f allocate scratch and pre-fill shader constants.
    this._scratch = HgcGradientRadialIdentity_buildScratch();
    // @0x30f2a3 callq *0x88(%rax) — vtable slot *0x88 = HGNode::SetFlags(0, 5).
    // Modeled as a stub call so `frontier.py` sees the HGNode vtable
    // slot *0x88 semantics as an outstanding decode.
    HgcGradientRadialIdentity_HGNode_SetFlags(this, 0, 5);
    // @0x30f2a9-30f2b6  this+0x10 (renderPageStrategy) = (this+0x10 & 0xFFFFF9FE) | 0x401.
    //   mask ~0x601 clears bits 0, 9, 10 (0x001|0x200|0x400);
    //   then OR 0x401 sets bits 0, 10 (0x001|0x400). Net: clear bit 9 (0x200),
    //   force bit 0 (0x001) and bit 10 (0x400).
    this.renderPageStrategy = ((this.renderPageStrategy & 0xfffff9fe) | 0x401) >>> 0;
  }

  /**
   * HgcGradientRadialIdentity::~HgcGradientRadialIdentity() @0x30f380 (D0
   * deleting dtor). Body walked:
   *
   *   @0x30f389 leaq  0x7317b0(%rip), %rax        — re-install vtable+0x10 = 0xa40b40
   *   @0x30f390 movq  %rax, (%rdi)                  (defensive vptr reinstall for base-dtor chain).
   *   @0x30f393 movq  0x198(%rdi), %rax           — load this+0x198 = scratchAligned.
   *   @0x30f39a testq %rax, %rax ; je 0x30f3ad   — skip free if null.
   *   @0x30f39f movq  -0x8(%rax), %rdi            — rdi = *(aligned - 8) = raw ptr.
   *   @0x30f3a3 testq %rdi, %rdi ; je 0x30f3ad   — skip free if raw is null.
   *   @0x30f3a8 callq operator delete(void*)      — free the raw block.
   *   @0x30f3ad-30f3b0 callq HGNode::~HGNode()    — chain to base dtor.
   *   @0x30f3be jmp   HGObject::operator delete   — free this object.
   *
   * The D1 (@0x30f330) and D2 (@0x30f2e0) variants share the "free scratch
   * + chain base dtor" body but skip the final ::operator delete tail-jmp.
   */
  destroy(): void {
    // JS has no C++ destructors; provide `destroy()` for parity so the
    // HGObject Retain/Release path can invoke it when refcount hits zero.
    // The raw-ptr free (@0x30f3a8) has no observable effect at the JS
    // layer — GC handles the scratch buffer once the reference is dropped.
    // Recorded here for structural fidelity to the disasm.
    // (No `_scratch = null` — TypeScript's field type doesn't permit it,
    //  and holding a stale reference until GC matches C++ dtor semantics
    //  once operator delete has run.)
  }

  /**
   * HgcGradientRadialIdentity::GetParameter(int idx, float* out) @0x30f450
   *
   *   @0x30f450 movl  $0xffffffff, %eax           — default return = -1.
   *   @0x30f455 cmpl  $0x2, %esi
   *   @0x30f458 ja    0x30f498                    — if idx > 2 (unsigned) -> return -1.
   *   @0x30f45a-30f45b pushq %rbp ; movq %rsp,%rbp
   *   @0x30f45e movq  0x198(%rdi), %rax           — rax = scratchAligned.
   *   @0x30f465 movl  %esi, %ecx
   *   @0x30f467 shlq  $0x5, %rcx                  — rcx = idx * 32.
   *   @0x30f46b movss (%rax,%rcx), %xmm0          — load 4 lanes one-at-a-time
   *   @0x30f470 movss %xmm0, (%rdx)                 (16 bytes = 4 x movss).
   *   @0x30f474-30f490 ...                        — copy lanes [1], [2], [3].
   *   @0x30f495 xorl  %eax, %eax                  — success return 0.
   *   @0x30f497-30f498 popq %rbp ; retq
   *
   * Reads the 16-byte payload at scratch[idx*32 + 0..15] into the caller's
   * 4-float output buffer. Returns 0 on success, -1 for out-of-range idx.
   */
  GetParameter(idx: number, out: Float32Array, outOff: number = 0): number {
    // @0x30f455..30f458 unsigned bounds check.
    if ((idx >>> 0) > 2) return -1 | 0;               // @0x30f450 default eax = -1
    const base = (idx >>> 0) * 32;                     // @0x30f467 shlq $5, %rcx
    const f = this._scratch.f32;
    const bi = base >>> 2;
    // @0x30f46b..30f490  four movss loads/stores from scratch[base..base+12].
    out[outOff]     = f[bi]!;
    out[outOff + 1] = f[bi + 1]!;
    out[outOff + 2] = f[bi + 2]!;
    out[outOff + 3] = f[bi + 3]!;
    return 0;                                          // @0x30f495 xorl %eax, %eax
  }

  /**
   * HgcGradientRadialIdentity::SetParameter(int idx, float a, float b,
   *                                          float c, float d) @0x30f3d0
   *
   *   @0x30f3d0 movl  $0xffffffff, %eax           — default return = -1.
   *   @0x30f3d5 cmpl  $0x2, %esi
   *   @0x30f3d8 ja    0x30f443                    — if idx > 2 (unsigned) -> return -1.
   *   @0x30f3da movq  0x198(%rdi), %rcx           — rcx = scratchAligned.
   *   @0x30f3e1 movl  %esi, %edx
   *   @0x30f3e3 shlq  $0x5, %rdx                  — rdx = idx * 32.
   *   @0x30f3e7 leaq  (%rcx,%rdx), %rax           — rax = &scratch[idx*32].
   *   @0x30f3eb-30f419 : early-exit test — compare each of xmm0..xmm3 (a..d)
   *                     with the existing scratch f32 lanes at rax+0..+12
   *                     via `ucomiss`. If all four match (jne/jp fall-through
   *                     to `jnp 0x30f444` at @0x30f419), skip the write and
   *                     return 0 (@0x30f444 xorl %eax, %eax ; retq) — this is
   *                     the "no-op if unchanged" fast-path.
   *   @0x30f41b-30f435 : insertps chain packs {a,b,c,d} into xmm0 and stores
   *                     it TWICE (at rax+0x10 and rax+0x00) — the
   *                     "duplicate to both halves of 32-byte stride" pattern.
   *   @0x30f438 callq HGNode::ClearBits()          — Helium 0x11c890 (void thunk,
   *                                                  tail-jmps to ClearBits(0xffff)).
   *   @0x30f43d movl  $0x1, %eax                   — return 1 (changed).
   *   @0x30f443 retq
   *   @0x30f444 xorl  %eax, %eax ; retq            — return 0 (unchanged).
   *
   * Returns 1 if the params changed (bookkeeping bits cleared), 0 if the
   * new params match the existing ones, -1 if idx is out of range.
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): number {
    // @0x30f3d5..30f3d8 unsigned bounds check.
    if ((idx >>> 0) > 2) return -1 | 0;               // @0x30f3d0 default eax = -1
    const base = (idx >>> 0) * 32;                     // @0x30f3e3 shlq $5, %rdx
    const f = this._scratch.f32;
    const bi = base >>> 2;
    // @0x30f3eb..30f419  ucomiss lane-wise compare; skip write if all equal.
    // ucomiss is NaN-ORDERED: it sets ZF=PF=1 for NaN operands, and the
    // `jne/jp` sequence takes the write-branch on NaN mismatch. We model
    // the identical semantics via Math.fround to normalize to f32, then
    // strict-equality (which is NaN-unordered — a bare `===` treats NaN
    // as !== NaN, matching ucomiss's "any-NaN forces mismatch" branch).
    const fa = Math.fround(a);
    const fb = Math.fround(b);
    const fc = Math.fround(c);
    const fd = Math.fround(d);
    if (f[bi] === fa && f[bi + 1] === fb && f[bi + 2] === fc && f[bi + 3] === fd) {
      return 0;                                        // @0x30f444 xorl %eax, %eax
    }
    // @0x30f41f..30f435 insertps chain — pack {a,b,c,d} into a 128-bit
    // register, then movups store to rax+0x10 (upper half of 32-byte
    // stride) AND rax+0x00 (lower half). Both halves get identical bits.
    const u32 = new Uint32Array(this._scratch.bytes.buffer);
    const scratchF32 = this._scratch.f32;
    // Write to base+0 (low half of 32-byte stride).
    scratchF32[bi]     = fa;
    scratchF32[bi + 1] = fb;
    scratchF32[bi + 2] = fc;
    scratchF32[bi + 3] = fd;
    // Write to base+16 (high half). @0x30f431 movups %xmm0, 0x10(%rax).
    scratchF32[bi + 4] = fa;
    scratchF32[bi + 5] = fb;
    scratchF32[bi + 6] = fc;
    scratchF32[bi + 7] = fd;
    // (u32 view retained for symmetry with the ctor-fill path — no separate
    //  bit-level write needed since Float32Array preserves the exact IEEE-754
    //  encoding of `Math.fround`ed inputs.)
    void u32;
    // @0x30f438 callq HGNode::ClearBits() — clear dirty-bits mask (0xffff).
    this.ClearBits(0xffff);
    return 1;                                          // @0x30f43d movl $0x1, %eax
  }

  /**
   * HgcGradientRadialIdentity::GetOutput(HGRenderer*) @0x30f4a0
   *
   *   @0x30f4a0-30f4a1 pushq %rbp ; movq %rsp,%rbp
   *   @0x30f4a4 movq  %rdi, %rax                   — rax = this.
   *   @0x30f4a7-30f4a8 popq %rbp ; retq
   *
   * Identity function — returns `this` unchanged. This is the base-case
   * override for the four-way Hgc leaf family: `HGGradientRadial::GetOutput`
   * has already picked THIS class as the compositor node, and there is no
   * further graph rewriting to do (the leaf IS the output).
   */
  GetOutput(_renderer: unknown): HgcGradientRadialIdentity {
    return this;                                       // @0x30f4a4 movq %rdi, %rax
  }

  /**
   * HgcGradientRadialIdentity::GetDOD(HGRenderer* r, int idx, HGRect r)
   * @0x30eff0
   *
   *   @0x30eff4 leaq  _HGRectInfinite(%rip), %rax
   *   @0x30effb leaq  0x8(%rax), %rcx              — (rax, rcx) = (Inf.lo, Inf.hi).
   *   @0x30efff leaq  _HGRectNull(%rip), %rsi
   *   @0x30f006 leaq  0x8(%rsi), %rdi              — (rsi, rdi) = (Null.lo, Null.hi).
   *   @0x30f00a testl %edx, %edx
   *   @0x30f00c cmoveq %rcx, %rdi                  — if idx==0 rdi = Inf.hi else Null.hi.
   *   @0x30f010 cmoveq %rax, %rsi                  — if idx==0 rsi = Inf.lo else Null.lo.
   *   @0x30f014 movq  (%rdi), %rdx                 — rdx = hi 8 bytes.
   *   @0x30f017 movq  (%rsi), %rax                 — rax = lo 8 bytes.
   *   @0x30f01a-30f01b popq %rbp ; retq             — return {rax=lo, rdx=hi} in {rax,rdx}.
   *
   * Returns `HGRectInfinite` for the primary output (idx==0), else
   * `HGRectNull`. Matches the "generator" contract — a radial gradient has
   * no natural input rect, so its domain-of-definition is unbounded when
   * asked for the primary output, and empty for any auxiliary output.
   */
  GetDOD(_renderer: unknown, idx: number, _inRect: HGRect): HGRect {
    // @0x30f00a testl %edx, %edx ; cmoveq — cmove tests the EDX zero-flag.
    if ((idx | 0) === 0) return HGRectInfinite;                              // @0x30eff4
    return HGRectNull;                                                        // @0x30efff
  }

  /**
   * HgcGradientRadialIdentity::GetROI(HGRenderer* r, int idx, HGRect r)
   * @0x30f020
   *
   *   @0x30f020 testl %edx, %edx
   *   @0x30f022 je    0x30f033                     — idx==0 path -> forward.
   *   @0x30f024 leaq  _HGRectNull(%rip), %rcx      — else return HGRectNull.
   *   @0x30f02b movq  (%rcx), %rax
   *   @0x30f02e movq  0x8(%rcx), %rdx
   *   @0x30f032 retq
   *   @0x30f033-30f058 : idx==0 path — tail-chain to HGRenderer::GetDOD
   *     on the upstream input node found via HGRenderer::GetInput(this, 0).
   *     I.e., the primary output's ROI is the DOD of the input feeding it.
   *
   * The `idx != 0` branch (empty rect) is transcribed exactly; the primary
   * path is throw-stubbed until HGRenderer::GetInput / GetDOD are decoded.
   */
  GetROI(renderer: unknown, idx: number, inRect: HGRect): HGRect {
    // @0x30f020..30f022 test/jne fast path for idx != 0.
    if ((idx | 0) !== 0) return HGRectNull;                                   // @0x30f024
    // idx == 0: tail-jmp HGRenderer::GetDOD(HGRenderer::GetInput(this, 0)).
    throw new Error(
      "HgcGradientRadialIdentity::GetROI @0x30f033 (idx=0 branch) not yet transcribed " +
        "— requires HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei " +
        "and HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode.",
    );
    void renderer; void inRect;
  }

  /**
   * HgcGradientRadialIdentity::shaderDescription() const @0x30e540
   *
   *   @0x30e549 movl  $0x28, %edi
   *   @0x30e54e callq operator new(0x28)           — 40-byte heap block for string data.
   *   @0x30e553 movq  %rax, 0x10(%rbx)             — sret->data = heap ptr.
   *   @0x30e557 movq  $0x29, (%rbx)                — sret->flags = 0x29 (long-string sentinel).
   *   @0x30e55e movq  $0x20, 0x8(%rbx)             — sret->size = 0x20.
   *   @0x30e566 movups 0x6827af(%rip), %xmm0       — lit-pool "lIdentity [hgc1]" (16 bytes).
   *   @0x30e56d movups %xmm0, 0x10(%rax)           — heap[16..32].
   *   @0x30e571 movups 0x682794(%rip), %xmm0       — lit-pool "HgcGradientRadialIdentity [hgc1]".
   *                                                  (Actually only the first 16 bytes:
   *                                                   "HgcGradientRadial" = 17 bytes + one wrap.)
   *   @0x30e578 movups %xmm0, (%rax)               — heap[0..16].
   *   @0x30e57b movb  $0x0, 0x20(%rax)             — trailing NUL @ heap[0x20].
   *   @0x30e57f movq  %rbx, %rax ; retq            — return sret ptr.
   *
   * Returns the C++ `std::string` "HgcGradientRadialIdentity [hgc1]"
   * (32 chars). Modeled at the JS layer as the plain string constant.
   */
  shaderDescription(): string {
    // @0x30e566..30e57b : builds "HgcGradientRadialIdentity [hgc1]" (32-char std::string).
    return HgcGradientRadialIdentity_SHADER_DESC;
  }

  /**
   * HgcGradientRadialIdentity::GetProgram(HGRenderer*) @0x30e1e0
   *
   *   @0x30e1e4 movq  %rsi, %rdi                   — rdi = renderer.
   *   @0x30e1e7 movl  $0x60000, %esi               — arg1 = 0x60000 (target-kind query).
   *   @0x30e1ec callq HGRenderer::GetTarget(0x60000)
   *   @0x30e1f1 xorl  %ecx, %ecx                   — result default = null.
   *   @0x30e1f3 cmpl  $0x60b10, %eax               — if renderer target == 0x60b10 (Metal 1.0)
   *   @0x30e1f8 leaq  0x68262d(%rip), %rax         —   then rax = @Helium 0x99082c
   *                                                     = Metal fragment source string.
   *   @0x30e1ff cmoveq %rax, %rcx                  — cmov on ZF from cmpl above.
   *   @0x30e203 movq  %rcx, %rax ; retq            — return string ptr or null.
   *
   * The 0x60000 target-kind query asks HGRenderer "what shader-target flavor
   * is this?" and 0x60b10 is the specific value for Metal 1.0 (matches the
   * "//Metal1.0" prologue of the returned string). Any other target flavour
   * yields null (the renderer will look elsewhere in the shader-cache).
   */
  GetProgram(renderer: unknown): string | null {
    // @0x30e1ec callq HGRenderer::GetTarget(renderer, 0x60000).
    const target = HgcGradientRadialIdentity_HGRenderer_GetTarget(renderer, 0x60000);
    // @0x30e1f3..30e1ff cmpl $0x60b10 ; cmoveq lit-pool -> null selector.
    if (target === 0x60b10) return HgcGradientRadialIdentity_METAL_FRAGMENT_SRC;
    return null;
  }

  /**
   * HgcGradientRadialIdentity::InitProgramDescriptor(HGProgramDescriptor* pd) const
   * @0x30e210
   *
   * 191-line body. Structure:
   *   1. @0x30e232 SetVisibleShaderWithSource("HgcGradientRadialIdentity_hgc_visible",
   *                                            "[[ visible ]] FragmentOut ...")  ; the
   *                'visible' variant of the shader source (subset of GetProgram's).
   *   2. @0x30e241 SetFragmentFunctionName("HgcGradientRadialIdentity").
   *   3. @0x30e246-30e288 SetReturnBinding(HGBinding{ id=0x4, name="FragmentOut", ... }).
   *   4. @0x30e2a2..end   Build a std::vector<HGBinding> with 5 entries via
   *      __emplace_back_slow_path (visible-shader args: float4* / texture2d<float>
   *      / sampler / float4 texCoord / ...), then hand it to
   *      HGProgramDescriptor::SetArgumentBindings(pd, &vec).
   *
   * Per Rule 3 this stays a throw stub — the HGProgramDescriptor +
   * HGBinding + libc++ std::vector<HGBinding> ABI is not yet decoded.
   */
  InitProgramDescriptor(_pd: unknown): void {
    throw new Error(
      "HgcGradientRadialIdentity::InitProgramDescriptor @0x30e210 not yet transcribed " +
        "— requires HGProgramDescriptor::{SetVisibleShaderWithSource,SetFragmentFunctionName," +
        "SetReturnBinding,SetArgumentBindings} @Helium, HGBinding struct layout, and " +
        "libc++ std::vector<HGBinding>::__emplace_back_slow_path @Helium.",
    );
  }

  /**
   * HgcGradientRadialIdentity::BindTexture(HGHandler* h, int idx) @0x30e590
   *
   *   @0x30e590 movl  $0xffffffff, %eax
   *   @0x30e595 testl %edx, %edx
   *   @0x30e597 je    0x30e59a                     — idx==0 path -> continue.
   *   @0x30e599 retq                                — idx!=0 -> return -1.
   *   @0x30e59a..30e5b8 : call h->PixelFormatQuery(0x2b) (vtable *0x80).
   *                       If it returns 1, call two zero-arg vtable slots
   *                       *0x48 and *0x38 on the handler (some reset/prep).
   *   @0x30e5d5..30e603 : compute (tile.right - tile.left, tile.bottom - tile.top)
   *                       as float32 (cvtsi2ss); load handler vtable *0x88 and
   *                       call SetParameter(3, w, h, 0, 0) — the "tile-size
   *                       uniform" for the shader's texture coordinates.
   *   @0x30e60e-30e616 : return 0 (success).
   *
   * Per Rule 3 this stays a throw stub — HGHandler's vtable slots
   * *0x38/*0x48/*0x80/*0x88 and the tile-rect field offsets (0xbc/0xc0/
   * 0xc4/0xc8 on HGHandler) are not yet decoded.
   */
  BindTexture(_handler: unknown, idx: number): number {
    // @0x30e595 : fast-return -1 for non-primary texture unit.
    if ((idx | 0) !== 0) return -1 | 0;
    throw new Error(
      "HgcGradientRadialIdentity::BindTexture @0x30e590 (idx=0 path) not yet transcribed " +
        "— requires HGHandler vtable slots *0x38 / *0x48 / *0x80 (PixelFormatQuery(0x2b)) / " +
        "*0x88 (SetParameter) @Helium and HGHandler tile-rect field offsets +0xbc/+0xc0/+0xc4/+0xc8.",
    );
  }

  /**
   * HgcGradientRadialIdentity::Bind(HGHandler* h) @0x30e620
   *
   *   @0x30e639 callq HGHandler::TexCoord(0, 0, 0, NULL)           — clear tex-coord state.
   *   @0x30e63e..30e652 : SetParameter(handler, 0, scratch[+0x00], 1)
   *                       — vtable *0x90 call, uploads Param[0] as uniform 0.
   *   @0x30e658..30e673 : SetParameter(handler, 1, scratch[+0x20], 1)
   *                       — Param[1] as uniform 1.
   *   @0x30e679..30e694 : SetParameter(handler, 2, scratch[+0x40], 1)
   *                       — Param[2] as uniform 2.
   *   @0x30e69a..30e6a3 : callq this->vtable[*0xc0] (some HGNode-level finalize).
   *   @0x30e6a9-30e6af  : return 0.
   *
   * Per Rule 3 this stays a throw stub — HGHandler vtable slots *0x90 and
   * *0xc0, and HGHandler::TexCoord's 4-arg semantics, are not yet decoded.
   */
  Bind(_handler: unknown): number {
    throw new Error(
      "HgcGradientRadialIdentity::Bind @0x30e620 not yet transcribed — " +
        "requires HGHandler::TexCoord @Helium __ZN9HGHandler8TexCoordEiiiPKd, " +
        "HGHandler vtable *0x90 (SetParameter uniform upload), and this-vtable *0xc0 finalize slot.",
    );
  }

  /**
   * HgcGradientRadialIdentity::RenderTile(HGTile* tile) @0x30eb50
   *
   * Two-branch dispatch:
   *   1. @0x30eb68 HGTile::Renderer() -> renderer
   *   2. @0x30eb72 HGRenderer::GetTarget(0) -> targetKind
   *   3. @0x30eb77 cmpl $0x4700000, targetKind
   *      @0x30eb7c jb 0x30eb98                     — modern hardware (>= 0x4700000) uses AVX.
   *   4. Modern path (@0x30eb7e-30eb96): tail-call RenderTile_AVX(tile) and return 0.
   *   5. Legacy SSE path (@0x30eb98..end, 220+ lines): full software gradient
   *      rasterizer — 4x4 pixel-block loop with fmin/fmax clamps mirroring
   *      the Metal shader source: subtract Param[1] center, dot-product for
   *      squared distance, sqrt, scale by Param[2].w, clamp to [0, 1], look
   *      up gradient LUT, premultiply alpha, blend with Param[2].y=0 select.
   *
   * Per Rule 3 both paths stay throw stubs — the SSE body depends on
   * HGTile field layout (buffer pointers, stride, width, height), the
   * HGRenderer vtable, the gradient-LUT texture data marshalled by Bind,
   * and the exact fmin/fmax NaN semantics per SSE lane.
   */
  RenderTile(_tile: unknown): number {
    throw new Error(
      "HgcGradientRadialIdentity::RenderTile @0x30eb50 not yet transcribed — " +
        "requires HGTile::Renderer() @Helium __ZNK6HGTile8RendererEv, " +
        "HGRenderer::GetTarget @Helium __ZN10HGRenderer9GetTargetEj, HGTile field " +
        "layout (buffer/stride/dims), and the 220-line legacy-SSE gradient rasterizer.",
    );
  }

  /**
   * HgcGradientRadialIdentity::RenderTile_AVX(HGTile* tile) @0x30e6b0
   *
   * 247-line body — the AVX2 version of the software gradient rasterizer.
   * Same algorithm as RenderTile's fallback (subtract-center, dot, sqrt,
   * scale, LUT lookup, premul, select), but vectorized to 8 pixels per
   * iteration using ymm0..ymm15 (see the `vsubps ymm..`, `vmulps ymm..`,
   * `vsqrtps ymm..`, `vminps ymm..`, `vmaxps ymm..` instructions).
   *
   * Per Rule 3 this stays a throw stub — the AVX body depends on the same
   * HGTile / HGRenderer / gradient-LUT context as RenderTile.
   */
  RenderTile_AVX(_tile: unknown): number {
    throw new Error(
      "HgcGradientRadialIdentity::RenderTile_AVX @0x30e6b0 not yet transcribed — " +
        "247-line AVX2 gradient rasterizer requiring HGTile field layout, HGRenderer " +
        "vtable, and the gradient-LUT texture marshalled by Bind (all not yet decoded).",
    );
  }
}

// ---------------------------------------------------------------------------
// Frontier / boundary stubs — external symbols cited by this class's disasm
// that belong to other Helium units (or platform libs) and haven't been
// transcribed yet. Each throws with the exact call-site @0xADDR so the
// frontier tracker can see the outstanding decode. HGRect / HGRectInfinite /
// HGRectNull are imported from HGRect.ts (fully decoded); everything else
// remains a boundary stub with the exact @0xADDR call site.
// ---------------------------------------------------------------------------

/**
 * `HGRenderer::GetTarget(unsigned int kind)` — Helium
 * `__ZN10HGRenderer9GetTargetEj`. Called from GetProgram @0x30e1ec with
 * kind=0x60000 (asks the renderer to report its shader-target family).
 * Also referenced by RenderTile @0x30eb72 with kind=0 (target-tier query).
 */
export function HgcGradientRadialIdentity_HGRenderer_GetTarget(
  _renderer: unknown,
  _kind: number,
): number {
  throw new Error(
    "HGRenderer::GetTarget @Helium __ZN10HGRenderer9GetTargetEj (called from " +
      "HgcGradientRadialIdentity::GetProgram @0x30e1ec and ::RenderTile @0x30eb72) " +
      "not yet transcribed",
  );
}

/**
 * `HGNode::SetFlags(int, int)` (vtable slot *0x88 on HGNode). Called from
 * this class's ctor @0x30f2a3 as `this->SetFlags(0, 5)` via the base-class
 * vtable slot. Recorded as a stub so `frontier.py` sees the HGNode +0x88
 * decode as outstanding.
 */
export function HgcGradientRadialIdentity_HGNode_SetFlags(
  _self: unknown,
  _which: number,
  _flags: number,
): void {
  throw new Error(
    "HGNode::SetFlags @Helium (vtable slot *0x88, called from " +
      "HgcGradientRadialIdentity::HgcGradientRadialIdentity ctor @0x30f2a3 " +
      "as this->SetFlags(0, 5)) not yet transcribed",
  );
}
