// raw-port/src/render/HgcGradientRadialPerspective.ts
//
// FCP `HgcGradientRadialPerspective` — Helium compositor leaf that renders
// a radial gradient sampled through a FULL 3x3 PERSPECTIVE transform. This
// is the general-case sibling of HgcGradientRadialIdentity (identity form,
// see HgcGradientRadialIdentity.ts): its Metal shader performs three dot
// products (rows 3/4/5) followed by a homogeneous w-divide before the
// standard radial-gradient math. `HGGradientRadial::GetOutput` picks THIS
// leaf when the classified transform kind is 3 (kXFormPerspective).
//
// The leaf owns a 32-byte-aligned scratch parameter block of 0x218 bytes
// (11 constant quads + 6 user-writable Param slots at 32-byte stride).
// SetParameter/GetParameter accept idx in [0..5] (`cmpl $0x5, %esi ; ja
// bail` at @0x310875 / @0x3108f5) — six 4-float slots for row0..row6 in
// the shader.
//
// Symbols decoded here (Helium, x86_64 slice; file_offset = VA + 0x4000):
//   0x30f4b0  HgcGradientRadialPerspective::GetProgram(HGRenderer*)
//   0x30f4e0  HgcGradientRadialPerspective::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x30f810  HgcGradientRadialPerspective::shaderDescription() const
//   0x30f860  HgcGradientRadialPerspective::BindTexture(HGHandler*, int)
//   0x30f8f0  HgcGradientRadialPerspective::Bind(HGHandler*)
//   0x30f9f0  HgcGradientRadialPerspective::RenderTile_AVX(HGTile*)
//   0x30ff60  HgcGradientRadialPerspective::RenderTile(HGTile*)
//   0x310540  HgcGradientRadialPerspective::GetDOD(HGRenderer*, int, HGRect)
//   0x310570  HgcGradientRadialPerspective::GetROI(HGRenderer*, int, HGRect)
//   0x3105b0  HgcGradientRadialPerspective::HgcGradientRadialPerspective()   [C2 base ctor]
//   0x310770  HgcGradientRadialPerspective::HgcGradientRadialPerspective()   [C1 complete ctor; tail-jmp C2]
//   0x310780  HgcGradientRadialPerspective::~HgcGradientRadialPerspective()  [D2 base dtor]
//   0x3107d0  HgcGradientRadialPerspective::~HgcGradientRadialPerspective()  [D1 complete dtor]
//   0x310820  HgcGradientRadialPerspective::~HgcGradientRadialPerspective()  [D0 deleting dtor]
//   0x310870  HgcGradientRadialPerspective::SetParameter(int, float, float, float, float)
//   0x3108f0  HgcGradientRadialPerspective::GetParameter(int, float*)
//   0x310940  HgcGradientRadialPerspective::GetOutput(HGRenderer*)
//
// Vtable installed-ptr — from C2 ctor @0x3105bf (`leaq 0x7307d2(%rip),%rax`
// with next-instr 0x3105c6): target = 0x3105c6 + 0x7307d2 = 0xa40d98.
//
// STRUCT LAYOUT (extends HGNode; HGNode base @+0x00..+0x197 opaque):
//   +0x198  uint8_t*  scratchAligned — 32-byte-aligned parameter block.
//                     Raw allocation = 0x247 bytes (`operator new[](0x247)`
//                     @0x3105c9). Manual-alignment idiom stashes the raw
//                     malloc pointer at (aligned - 8) for D0 to free.
//                     Layout in the aligned region, by 32-byte stride:
//                       stride 0 (0x00..0x1f)  Param[0]  — user-writable (SetParameter idx=0)
//                       stride 1 (0x20..0x3f)  Param[1]
//                       stride 2 (0x40..0x5f)  Param[2]
//                       stride 3 (0x60..0x7f)  Param[3]
//                       stride 4 (0x80..0x9f)  Param[4]
//                       stride 5 (0xa0..0xbf)  Param[5]
//                     Beyond the 6-slot user region the ctor pre-fills
//                     11 more 16-byte quads with SHADER CONSTANTS (see
//                     below).
//   Total scratch alignment layout:
//     raw = operator new[](0x247)
//     aligned = raw + 8 + ((-raw - 8) & 0x1f)     ; aligned >= raw+8, %32==0
//     *(aligned - 8) = raw                         ; back-pointer for delete[]
//     scratchAligned = aligned  (stored at this+0x198)
//   The 0x247 = 0x218 (used, last write at +0x218 = 16 bytes at +0x208/+0x218)
//              + 8 (back-ptr slot) + up to 31 (alignment slack).
//
// SHADER CONSTANTS pre-loaded by C2 ctor (const-pool -> aligned scratch;
// verified via struct.unpack '<IIII' on /tmp/Helium.x86_64):
//   scratch[+0x08..+0xbf]        = xorps 0 (user Param slots 0..5 zero-init).
//   scratch[+0xc8], scratch[+0xd8] = movaps @Helium 0x85fed0
//     u32x4 = 4 x 0x3f800801 = 4 x 1.0002442598342896f
//     (fmin ceiling for `r1.xy = fmin(r1.xy, c0.xx)` with c0.x = 1.0).
//   scratch[+0xe8], scratch[+0xf8] = movsd @Helium 0x890f50
//     u32x2 = 2 x 0x7f7fffff = 2 x FLT_MAX (3.4028234663852886e+38)
//     — the "positive infinity substitute" for saturating fmin clamps.
//   scratch[+0x108], scratch[+0x118] = movsd @Helium 0x890f60
//     u32x2 = 2 x 0xff7fffff = 2 x -FLT_MAX
//     — the "negative infinity substitute" for saturating fmax clamps.
//   scratch[+0x128], scratch[+0x138] = movsd @Helium 0x3d2340
//     u32x2 = 2 x 0x40000000 = 2 x 2.0f (row-select scaling for perspective divide).
//   scratch[+0x148], scratch[+0x158] = movaps @Helium 0x3cb0d0
//     u32x4 = 4 x 0x00800000 = 4 x FLT_MIN (reciprocal safety floor).
//   scratch[+0x168], scratch[+0x178] = movsd @Helium 0x3c9ff0
//     u32x2 = 2 x 0x3f000000 = 2 x 0.5f (hg_Params[6].xy gradient-repeat pivot).
//   scratch[+0x188], scratch[+0x198] = movsd @Helium 0x891190
//     u32x2 = 2 x 0x40400000 = 2 x 3.0f (hg_Params[6].xy 3-band LUT scale).
//   scratch[+0x1a8], scratch[+0x1b8] = movaps @Helium 0x3c7c40
//     u32x4 = 4 x 0x3f800000 = 4 x 1.0f (c0.x = 1.0 broadcast).
//   scratch[+0x1c8], scratch[+0x1d8] = xorps 0 (runtime state slots).
//   scratch[+0x1e8], scratch[+0x1f8] = movaps @Helium 0x85fc40
//     u32x4 = {0, 0, 0, 0xffffffff} — Alpha-only mask (RGB lanes zeroed).
//   scratch[+0x208], scratch[+0x218] = movaps @Helium 0x88c7f0
//     u32x4 = {~0, ~0, ~0, 0} — RGB-only mask (alpha lane un-premultiplied).
//
// VTABLE-CALLED FRONTIER METHODS (throw-stubbed; same set as
// HgcGradientRadialIdentity — see that file for the shared decode
// requirements on HGHandler / HGRenderer / HGTile / HGProgramDescriptor):
//   HGNode::SetFlags(int, int) via *0x88 — ctor @0x310742 (this->SetFlags(0, 5)).
//   HGHandler::TexCoord + vtable *0x38/*0x48/*0x80/*0x88/*0x90/*0xc0 — Bind/BindTexture.
//   HGRenderer::GetTarget / GetInput / GetDOD — GetProgram/GetROI/RenderTile.
//   HGTile::Renderer const — RenderTile.
//   HGProgramDescriptor::{SetVisibleShaderWithSource,SetFragmentFunctionName,
//                          SetReturnBinding,SetArgumentBindings} — InitProgramDescriptor.
//   HGBinding struct + std::vector<HGBinding>::__emplace_back_slow_path — InitProgramDescriptor.
//   HGNode::ClearBits() void thunk (@0x11c890) — SetParameter @0x3108d8.
//   operator new[](size_t) / operator delete[](void*) — libc++ symbol stubs.
//   HGObject::operator delete(void*) — D0 dtor tail-jmp @0x31085e.

import { HGNode } from "./HGNode.js";
import { HGRect, HGRectInfinite, HGRectNull } from "./HGRect.js";

/**
 * Vtable installed-pointer address for HgcGradientRadialPerspective.
 * Recovered from C2 ctor @0x3105bf (`leaq 0x7307d2(%rip),%rax`) with
 * next-instr 0x3105c6: target = 0x3105c6 + 0x7307d2 = 0xa40d98.
 */
export const HgcGradientRadialPerspective_VTABLE_INSTALLED_PTR = 0xa40d98 as const;

/**
 * Total byte size of the raw allocation for the SIMD scratch block, from
 * `operator new[](0x247)` @0x3105c9. 0x247 = 0x218 (used, quads at +0x08
 * through +0x218) + 8 (back-pointer slot at aligned-8) + up to 31 bytes
 * of alignment slack for the 32-byte alignment idiom.
 */
export const HgcGradientRadialPerspective_SCRATCH_RAW_SIZE = 0x247 as const;

/**
 * Number of user-writable Param slots exposed by SetParameter/GetParameter.
 * Both fns bail with -1 when idx > 5 (`cmpl $0x5, %esi ; ja bail` at
 * @0x310875 / @0x3108f5). Each slot is a 4-float vector stored duplicated
 * at both the low and high 16-byte halves of its 32-byte stride.
 */
export const HgcGradientRadialPerspective_PARAM_COUNT = 6 as const;

/**
 * Shader description literal returned by `shaderDescription()` — the exact
 * string built by @0x30f836/@0x30f841/@0x30f84b (two movups + one movl):
 *   size = 0x29 (long-string sentinel), capacity = 0x23,
 *   data ptr = malloc(0x28); bytes [0..0x0f] = "HgcGradientRadial"
 *   (first 16 chars, via movups @0x681e61 -> Helium 0x9911a8);
 *   bytes [0x10..0x1f] = "lPerspective [hg" (next 16 chars, via movups
 *   @0x681e7c -> Helium 0x9911c0);
 *   bytes [0x1f..0x22] = 0x5d316367 = 'c1]\0'... wait, movl writes 4 bytes
 *   at offset 0x1f: bytes are 0x67, 0x63, 0x31, 0x5d = 'g', 'c', '1', ']'.
 *   byte [0x23] = '\0'.
 *   Assembled content = "HgcGradientRadialPerspective [hgc1]" (35 chars +
 *   NUL, matching the 0x23-capacity long-string form).
 */
export const HgcGradientRadialPerspective_SHADER_DESC =
  "HgcGradientRadialPerspective [hgc1]" as const;

/**
 * Metal fragment shader source string embedded in Helium .rodata and
 * returned by GetProgram() iff the renderer target reports kind == 0x60b10.
 * Read verbatim from the literal pool at @0x30f4c8 (RIP-rel 0x681c4a from
 * next-instr 0x30f4cf -> Helium 0x991119). The 'LEN=0000000549' prefix and
 * MD5 line lock the program-cache identity: MD5=5122a7df:2cdb5da5:cb8625a9:cbdcfae0.
 * Note this shader consumes SEVEN uniform-params (hg_Params[0..6]): rows
 * 3/4/5 are the perspective matrix rows (dot products), row 6 is the
 * gradient-repeat pivot/scale pair.
 */
export const HgcGradientRadialPerspective_METAL_FRAGMENT_SRC: string =
  "//Metal1.0     \n//LEN=0000000549\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n" +
  "    const float4 c0 = float4(1.000000000, 0.5000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1, r2;\n    FragmentOut output;\n\n" +
  "    r0.z = c0.z;\n" +
  "    r0.x = dot(hg_Params[3], frag._texCoord0);\n" +
  "    r0.y = dot(hg_Params[4], frag._texCoord0);\n" +
  "    r0.w = dot(hg_Params[5], frag._texCoord0);\n" +
  "    r0.xy = r0.xy/r0.ww;\n" +
  "    r0.xyz = r0.xyz - hg_Params[1].xyz;\n" +
  "    r0.x = r0.x*hg_Params[0].x;\n" +
  "    r0.xy = float2(dot(r0.xyz, r0.xyz));\n" +
  "    r0.xy = sqrt(r0.xy);\n" +
  "    r1.xy = r0.xy*hg_Params[2].ww;\n" +
  "    r1.xy = fmin(r1.xy, c0.xx);\n" +
  "    r1.xy = r1.xy*hg_Params[6].xy;\n" +
  "    r1.xy = fmax(r1.xy, c0.yy);\n" +
  "    r2.xy = hg_Params[6].xy - c0.yy;\n" +
  "    r1.xy = fmin(r1.xy, r2.xy);\n" +
  "    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);\n" +
  "    r1.xyz = r1.xyz*r1.www;\n" +
  "    r2.x = hg_Params[2].x - c0.y;\n" +
  "    r2.x = fmax(r2.x, c0.z);\n" +
  "    r2.x = clamp(r0.x - r2.x, 0.00000f, 1.00000f);\n" +
  "    r2 = r1*-r2.xxxx + r1;\n" +
  "    output.color0 = select(r2, r1, hg_Params[2].yyyy == 0.00000f);\n" +
  "    return output;\n}\n" +
  "//MD5=5122a7df:2cdb5da5:cb8625a9:cbdcfae0\n" +
  "//SIG=00000000:00000000:00000000:00000000:0001:0007:0003:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/** Scratch block (aligned, no back-pointer needed at the JS layer). */
export type HgcGradientRadialPerspective_Scratch = {
  readonly bytes: Uint8Array;
  readonly f32: Float32Array;
};

/**
 * Build a fresh scratch block, mimicking the C2 ctor's aligned-allocation
 * + pre-fill sequence. Same 32-byte-alignment idiom as the sibling Identity
 * class; the pre-fill covers 11 constant quads at offsets +0xc8..+0x218 and
 * leaves the 6 user Param slots (+0x00..+0xbf) zero-initialised (matches
 * the 12 xorps writes at @0x3105eb..@0x31062b).
 *
 * All @Helium addresses cited in-line have been verified by reading the
 * corresponding 16- or 8-byte block out of /tmp/Helium.x86_64.
 */
function HgcGradientRadialPerspective_buildScratch(): HgcGradientRadialPerspective_Scratch {
  // 0x218 + 0x10 = 0x228 bytes to cover the last write at +0x218 (16 bytes).
  const bytes = new Uint8Array(0x228);
  const f32 = new Float32Array(bytes.buffer);
  const u32 = new Uint32Array(bytes.buffer);

  const writeQuad = (byteOff: number, a: number, b: number, c: number, d: number): void => {
    const i = byteOff >>> 2;
    u32[i]     = a >>> 0;
    u32[i + 1] = b >>> 0;
    u32[i + 2] = c >>> 0;
    u32[i + 3] = d >>> 0;
  };

  // The 12 xorps-zeroed slots at +0x08..+0xb8 are already 0 (Uint8Array
  // default); ctor writes them explicitly at @0x3105eb..@0x31062b — cited
  // for provenance but a no-op here.

  // @0x85fed0 : 4 x 0x3f800801 (1+eps) -> +0xc8, +0xd8   (@0x310633)
  writeQuad(0xc8, 0x3f800801, 0x3f800801, 0x3f800801, 0x3f800801);
  writeQuad(0xd8, 0x3f800801, 0x3f800801, 0x3f800801, 0x3f800801);

  // @0x890f50 : 2 x 0x7f7fffff (FLT_MAX), zwzero -> +0xe8, +0xf8  (@0x31064a movsd)
  writeQuad(0xe8, 0x7f7fffff, 0x7f7fffff, 0x00000000, 0x00000000);
  writeQuad(0xf8, 0x7f7fffff, 0x7f7fffff, 0x00000000, 0x00000000);

  // @0x890f60 : 2 x 0xff7fffff (-FLT_MAX), zwzero -> +0x108, +0x118  (@0x310662)
  writeQuad(0x108, 0xff7fffff, 0xff7fffff, 0x00000000, 0x00000000);
  writeQuad(0x118, 0xff7fffff, 0xff7fffff, 0x00000000, 0x00000000);

  // @0x3d2340 : 2 x 0x40000000 (2.0f), zwzero -> +0x128, +0x138  (@0x31067a)
  writeQuad(0x128, 0x40000000, 0x40000000, 0x00000000, 0x00000000);
  writeQuad(0x138, 0x40000000, 0x40000000, 0x00000000, 0x00000000);

  // @0x3cb0d0 : 4 x FLT_MIN -> +0x148, +0x158  (@0x310692 movaps)
  writeQuad(0x148, 0x00800000, 0x00800000, 0x00800000, 0x00800000);
  writeQuad(0x158, 0x00800000, 0x00800000, 0x00800000, 0x00800000);

  // @0x3c9ff0 : 2 x 0.5f, zwzero -> +0x168, +0x178  (@0x3106a9 movsd)
  writeQuad(0x168, 0x3f000000, 0x3f000000, 0x00000000, 0x00000000);
  writeQuad(0x178, 0x3f000000, 0x3f000000, 0x00000000, 0x00000000);

  // @0x891190 : 2 x 3.0f, zwzero -> +0x188, +0x198  (@0x3106c1 movsd)
  writeQuad(0x188, 0x40400000, 0x40400000, 0x00000000, 0x00000000);
  writeQuad(0x198, 0x40400000, 0x40400000, 0x00000000, 0x00000000);

  // @0x3c7c40 : 4 x 1.0f -> +0x1a8, +0x1b8  (@0x3106d9 movaps)
  writeQuad(0x1a8, 0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000);
  writeQuad(0x1b8, 0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000);

  // xorps 0 at +0x1c8, +0x1d8 (@0x3106f0/@0x3106f8) — Uint8Array default.

  // @0x85fc40 : {0, 0, 0, ~0} — alpha-only mask -> +0x1e8, +0x1f8  (@0x310700 movaps)
  writeQuad(0x1e8, 0x00000000, 0x00000000, 0x00000000, 0xffffffff);
  writeQuad(0x1f8, 0x00000000, 0x00000000, 0x00000000, 0xffffffff);

  // @0x88c7f0 : {~0, ~0, ~0, 0} — RGB-only mask -> +0x208, +0x218  (@0x310717 movaps)
  writeQuad(0x208, 0xffffffff, 0xffffffff, 0xffffffff, 0x00000000);
  writeQuad(0x218, 0xffffffff, 0xffffffff, 0xffffffff, 0x00000000);

  return { bytes, f32 };
}

/**
 * `HgcGradientRadialPerspective` — compositor leaf for a perspective-warped
 * radial gradient. See file header for full symbol map, layout, and shader
 * source. Virtual-slot bodies that cross into HGRenderer/HGHandler/
 * HGProgramDescriptor/HGTile throw with `@0xADDR` per Rule 3.
 */
export class HgcGradientRadialPerspective extends HGNode {
  /**
   * @0x198 scratchAligned — 32-byte-aligned 0x218-byte parameter block.
   * In FCP the raw malloc pointer is stashed at (this[0x198] - 8) for D0
   * to free. At the JS layer we store the aligned region directly.
   */
  private _scratch: HgcGradientRadialPerspective_Scratch;

  /**
   * HgcGradientRadialPerspective::HgcGradientRadialPerspective() @0x3105b0
   * (C2 base ctor). The C1 complete ctor @0x310770 immediately tail-jmps
   * to C2 (`push %rbp ; mov %rsp,%rbp ; pop %rbp ; jmp C2`).
   *
   * Body walked below:
   *   @0x3105ba callq HGNode::HGNode()            — chain to base ctor.
   *   @0x3105bf leaq  0x7307d2(%rip), %rax
   *   @0x3105c6 movq  %rax, (%rbx)                — install vtable+0x10 ptr @0xa40d98.
   *   @0x3105c9 movl  $0x247, %edi
   *   @0x3105ce callq operator new[](0x247)       — 0x247-byte scratch alloc.
   *   @0x3105d3..0x3105e4                         — 32-byte manual-alignment idiom
   *                                                  (see file header for the
   *                                                   algebra + back-pointer stash).
   *   @0x3105e8..0x310726                         — pre-fill scratch (see buildScratch).
   *   @0x31072e movq  %rdx, 0x198(%rbx)           — this+0x198 = aligned pointer.
   *   @0x310735..0x310742 callq *0x88(%rax)       — this->SetFlags(0, 5) via vtable *0x88.
   *   @0x310748..0x310755                         — this+0x10 = (this+0x10 & 0xFFFFF9FE) | 0x401
   *                                                  (identical RMW to Identity — clear bits
   *                                                   {0,9,10}, then set {0,10}).
   *   @0x310758..retq                              — standard epilogue.
   *
   * Landing pad @0x31075d..0x310768 unwinds through HGNode::~HGNode() +
   * _Unwind_Resume; not modeled at the JS layer.
   */
  constructor() {
    super();                                                          // @0x3105ba callq HGNode::HGNode()
    // @0x3105bf-3105c6 install vtable+0x10 (@0xa40d98) — JS prototype chain.
    // @0x3105c9-31072e allocate scratch and pre-fill 11 shader-const quads.
    this._scratch = HgcGradientRadialPerspective_buildScratch();
    // @0x310742 callq *0x88(%rax) — HGNode::SetFlags(0, 5) via vtable slot *0x88.
    HgcGradientRadialPerspective_HGNode_SetFlags(this, 0, 5);
    // @0x310748-310755  renderPageStrategy = (renderPageStrategy & 0xFFFFF9FE) | 0x401.
    this.renderPageStrategy = ((this.renderPageStrategy & 0xfffff9fe) | 0x401) >>> 0;
  }

  /**
   * HgcGradientRadialPerspective::~HgcGradientRadialPerspective() @0x310820
   * (D0 deleting dtor). D1 @0x3107d0 and D2 @0x310780 share the "free
   * scratch + chain HGNode dtor" body but skip the final HGObject::operator
   * delete tail-jmp @0x31085e.
   *
   * Body walked:
   *   @0x310829 leaq  0x730568(%rip), %rax        — re-install vtable+0x10 = 0xa40d98
   *   @0x310830 movq  %rax, (%rdi)                  (defensive vptr for base-dtor chain).
   *   @0x310833 movq  0x198(%rdi), %rax           — load this+0x198 = scratchAligned.
   *   @0x31083a testq %rax, %rax ; je 0x31084d   — skip free if null.
   *   @0x31083f movq  -0x8(%rax), %rdi            — rdi = *(aligned - 8) = raw ptr.
   *   @0x310843 testq %rdi, %rdi ; je 0x31084d   — skip free if raw null.
   *   @0x310848 callq operator delete(void*)      — free the raw block.
   *   @0x31084d-310850 callq HGNode::~HGNode()    — chain to base dtor.
   *   @0x31085e jmp   HGObject::operator delete   — free this object.
   */
  destroy(): void {
    // Same JS-layer no-op as the Identity variant — GC handles the buffer.
    // Recorded for structural fidelity to the disasm.
  }

  /**
   * HgcGradientRadialPerspective::GetParameter(int idx, float* out) @0x3108f0
   *
   *   @0x3108f0 movl  $0xffffffff, %eax           — default return = -1.
   *   @0x3108f5 cmpl  $0x5, %esi
   *   @0x3108f8 ja    0x310938                    — if idx > 5 (unsigned) -> return -1.
   *   @0x3108fe movq  0x198(%rdi), %rax           — rax = scratchAligned.
   *   @0x310907 shlq  $0x5, %rcx                  — rcx = idx * 32.
   *   @0x31090b..310930                            — 4x movss lane copy scratch[idx*32..+12] -> *out.
   *   @0x310935 xorl  %eax, %eax                  — success return 0.
   *
   * Same shape as the Identity variant except the bounds check is idx > 5
   * (six writable slots — the perspective form takes matrix rows 3/4/5
   * plus three "user" uniforms 0/1/2).
   */
  GetParameter(idx: number, out: Float32Array, outOff: number = 0): number {
    // @0x3108f5..3108f8 unsigned bounds check on idx > 5.
    if ((idx >>> 0) > 5) return -1 | 0;               // @0x3108f0 default eax = -1
    const base = (idx >>> 0) * 32;                     // @0x310907 shlq $5, %rcx
    const f = this._scratch.f32;
    const bi = base >>> 2;
    out[outOff]     = f[bi]!;
    out[outOff + 1] = f[bi + 1]!;
    out[outOff + 2] = f[bi + 2]!;
    out[outOff + 3] = f[bi + 3]!;
    return 0;                                          // @0x310935 xorl %eax, %eax
  }

  /**
   * HgcGradientRadialPerspective::SetParameter(int idx, float a, float b,
   *                                             float c, float d) @0x310870
   *
   * Identical structure to HgcGradientRadialIdentity::SetParameter except
   * the bounds check is idx > 5 (@0x310875). Same ucomiss-based
   * "no-op if unchanged" early-exit (@0x310890..@0x3108b9), same
   * insertps-pack + double-store at +0x00 and +0x10 (@0x3108bf..@0x3108d5),
   * same ClearBits() tail-call (@0x3108d8), same {-1, 0, 1} return
   * semantics.
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): number {
    // @0x310875..310878 unsigned bounds check on idx > 5.
    if ((idx >>> 0) > 5) return -1 | 0;               // @0x310870 default eax = -1
    const base = (idx >>> 0) * 32;                     // @0x310883 shlq $5, %rdx
    const f = this._scratch.f32;
    const bi = base >>> 2;
    // @0x310890..3108b9 : ucomiss NaN-ordered lane compare; skip write if all equal.
    // Match the ucomiss "any-NaN forces mismatch" semantics via Math.fround
    // + strict-equality (=== treats NaN !== NaN, matching ucomiss branch shape).
    const fa = Math.fround(a);
    const fb = Math.fround(b);
    const fc = Math.fround(c);
    const fd = Math.fround(d);
    if (f[bi] === fa && f[bi + 1] === fb && f[bi + 2] === fc && f[bi + 3] === fd) {
      return 0;                                        // @0x3108e4 xorl %eax, %eax
    }
    // @0x3108bf..3108d5 insertps chain — pack {a,b,c,d} into xmm0 and store
    // TWICE at rax+0x00 and rax+0x10 (both halves of 32-byte stride).
    f[bi]     = fa;
    f[bi + 1] = fb;
    f[bi + 2] = fc;
    f[bi + 3] = fd;
    f[bi + 4] = fa;
    f[bi + 5] = fb;
    f[bi + 6] = fc;
    f[bi + 7] = fd;
    // @0x3108d8 callq HGNode::ClearBits() (void thunk, tail-jmps ClearBits(0xffff)).
    this.ClearBits(0xffff);
    return 1;                                          // @0x3108dd movl $0x1, %eax
  }

  /**
   * HgcGradientRadialPerspective::GetOutput(HGRenderer*) @0x310940
   *
   *   @0x310944 movq  %rdi, %rax ; popq %rbp ; retq
   *
   * Identity function — returns `this`. Same base-case behavior as
   * HgcGradientRadialIdentity::GetOutput (the leaf IS the graph output).
   */
  GetOutput(_renderer: unknown): HgcGradientRadialPerspective {
    return this;                                       // @0x310944 movq %rdi, %rax
  }

  /**
   * HgcGradientRadialPerspective::GetDOD(HGRenderer* r, int idx, HGRect r)
   * @0x310540
   *
   * Identical shape to HgcGradientRadialIdentity::GetDOD — cmov-selects
   * between _HGRectInfinite (idx==0) and _HGRectNull (idx!=0). Both
   * globals decoded in HGRect.ts.
   */
  GetDOD(_renderer: unknown, idx: number, _inRect: HGRect): HGRect {
    // @0x31055a testl %edx, %edx ; cmoveq — cmov tests the EDX zero-flag.
    if ((idx | 0) === 0) return HGRectInfinite;                              // @0x310544
    return HGRectNull;                                                        // @0x31054f
  }

  /**
   * HgcGradientRadialPerspective::GetROI(HGRenderer* r, int idx, HGRect r)
   * @0x310570
   *
   * Same shape as HgcGradientRadialIdentity::GetROI: idx!=0 returns
   * _HGRectNull; idx==0 tail-chains HGRenderer::GetDOD on the upstream
   * input @0x310597 (throw-stub — needs HGRenderer::GetInput/GetDOD).
   */
  GetROI(renderer: unknown, idx: number, inRect: HGRect): HGRect {
    // @0x310570..310572 test/jne fast path for idx != 0.
    if ((idx | 0) !== 0) return HGRectNull;                                   // @0x310574
    throw new Error(
      "HgcGradientRadialPerspective::GetROI @0x310583 (idx=0 branch) not yet transcribed " +
        "— requires HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei " +
        "and HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode.",
    );
    void renderer; void inRect;
  }

  /**
   * HgcGradientRadialPerspective::shaderDescription() const @0x30f810
   *
   *   @0x30f819..30f81e operator new(0x28) — 40-byte heap block.
   *   @0x30f823 sret->data = heap.
   *   @0x30f827 sret->flags = 0x29 (long-string sentinel).
   *   @0x30f82e sret->size = 0x23 (35 chars).
   *   @0x30f836 movups @Helium 0x9911c0 -> heap[16..32] = "lPerspective [hg".
   *   @0x30f841 movups @Helium 0x9911a8 -> heap[0..16] = "HgcGradientRadial".
   *   @0x30f84b movl  $0x5d316367, 0x1f(%rax)   — bytes @1f..22 = 'g','c','1',']'.
   *   @0x30f852 movb  $0, 0x23(%rax)             — trailing NUL.
   *
   * Assembled content = "HgcGradientRadialPerspective [hgc1]" (35 chars).
   * The three-write pattern (two 16-byte movups + one 4-byte movl) is a
   * clang optimisation for the 35-byte literal (35 = 16 + 16 + 3, where
   * the 4-byte movl at +0x1f overlaps one byte with the second movups
   * and writes 3 new bytes + NUL slot).
   */
  shaderDescription(): string {
    return HgcGradientRadialPerspective_SHADER_DESC;   // @0x30f836..30f852
  }

  /**
   * HgcGradientRadialPerspective::GetProgram(HGRenderer*) @0x30f4b0
   *
   * Identical shape to HgcGradientRadialIdentity::GetProgram: query
   * HGRenderer::GetTarget(0x60000); if result == 0x60b10 return the Metal
   * 1.0 shader source (@0x30f4c8), else return null.
   */
  GetProgram(renderer: unknown): string | null {
    const target = HgcGradientRadialPerspective_HGRenderer_GetTarget(renderer, 0x60000);
    if (target === 0x60b10) return HgcGradientRadialPerspective_METAL_FRAGMENT_SRC;
    return null;
  }

  /**
   * HgcGradientRadialPerspective::InitProgramDescriptor(HGProgramDescriptor* pd) const
   * @0x30f4e0
   *
   * ~300-line body — same shape as Identity's but larger because the
   * perspective shader has more uniform arguments (hg_Params[0..6] instead
   * of [0..3]). Builds a std::vector<HGBinding> with 7 entries via
   * __emplace_back_slow_path, calls SetVisibleShaderWithSource /
   * SetFragmentFunctionName / SetReturnBinding / SetArgumentBindings.
   *
   * Per Rule 3 this stays a throw stub — the HGProgramDescriptor +
   * HGBinding + libc++ std::vector<HGBinding> ABI is not yet decoded.
   */
  InitProgramDescriptor(_pd: unknown): void {
    throw new Error(
      "HgcGradientRadialPerspective::InitProgramDescriptor @0x30f4e0 not yet transcribed " +
        "— requires HGProgramDescriptor::{SetVisibleShaderWithSource,SetFragmentFunctionName," +
        "SetReturnBinding,SetArgumentBindings} @Helium, HGBinding struct layout, and " +
        "libc++ std::vector<HGBinding>::__emplace_back_slow_path @Helium.",
    );
  }

  /**
   * HgcGradientRadialPerspective::BindTexture(HGHandler* h, int idx) @0x30f860
   *
   * Same shape as HgcGradientRadialIdentity::BindTexture: idx!=0 fast-return
   * -1; primary path calls handler PixelFormatQuery(0x2b), conditional
   * reset via vtable *0x48 + *0x38, then uploads the tile-size uniform via
   * vtable *0x88 (SetParameter(3, w, h, 0, 0)).
   */
  BindTexture(_handler: unknown, idx: number): number {
    if ((idx | 0) !== 0) return -1 | 0;                // @0x30f860 (parallel to Identity @0x30e595)
    throw new Error(
      "HgcGradientRadialPerspective::BindTexture @0x30f860 (idx=0 path) not yet transcribed " +
        "— same HGHandler vtable *0x38 / *0x48 / *0x80 (PixelFormatQuery(0x2b)) / *0x88 (SetParameter) " +
        "@Helium requirements as HgcGradientRadialIdentity::BindTexture @0x30e590.",
    );
  }

  /**
   * HgcGradientRadialPerspective::Bind(HGHandler* h) @0x30f8f0
   *
   * 64-line body — SAME family of vtable-*0x90 uniform uploads as
   * HgcGradientRadialIdentity::Bind, but with 6 slots (Param[0..5] at
   * strides 0x00, 0x20, 0x40, 0x60, 0x80, 0xa0) instead of 3.
   *
   * Per Rule 3 this stays a throw stub — same HGHandler vtable *0x90 +
   * *0xc0 decode requirements as the Identity variant.
   */
  Bind(_handler: unknown): number {
    throw new Error(
      "HgcGradientRadialPerspective::Bind @0x30f8f0 not yet transcribed — " +
        "same HGHandler::TexCoord + vtable *0x90/*0xc0 requirements as " +
        "HgcGradientRadialIdentity::Bind @0x30e620, with 6 uniform slots (Param[0..5]) " +
        "instead of 3.",
    );
  }

  /**
   * HgcGradientRadialPerspective::RenderTile(HGTile* tile) @0x30ff60
   *
   * Two-branch dispatch (same shape as Identity's RenderTile): AVX-tier
   * check cmpl $0x4700000, then tail-call RenderTile_AVX or fall through
   * to the ~600-line legacy-SSE rasterizer (which INCLUDES the perspective
   * dot-product + w-divide steps not present in the Identity variant).
   */
  RenderTile(_tile: unknown): number {
    throw new Error(
      "HgcGradientRadialPerspective::RenderTile @0x30ff60 not yet transcribed — " +
        "same HGTile::Renderer + HGRenderer::GetTarget requirements as " +
        "HgcGradientRadialIdentity::RenderTile @0x30eb50, plus the perspective " +
        "dot-product / w-divide fragment prologue.",
    );
  }

  /**
   * HgcGradientRadialPerspective::RenderTile_AVX(HGTile* tile) @0x30f9f0
   *
   * ~450-line AVX2 body — vectorized version of the perspective-warped
   * radial gradient rasterizer. Same core algorithm as Identity's AVX
   * loop with three extra dot-product + w-divide passes for the transform.
   */
  RenderTile_AVX(_tile: unknown): number {
    throw new Error(
      "HgcGradientRadialPerspective::RenderTile_AVX @0x30f9f0 not yet transcribed — " +
        "~450-line AVX2 rasterizer requiring HGTile field layout, HGRenderer vtable, " +
        "gradient-LUT texture, and perspective dot/w-divide (all not yet decoded).",
    );
  }
}

// ---------------------------------------------------------------------------
// Frontier / boundary stubs — external symbols cited by this class's disasm.
// HGRect / HGRectInfinite / HGRectNull are imported from HGRect.ts (fully
// decoded); the rest remain throw-stubs with their exact call-site @0xADDR.
// ---------------------------------------------------------------------------

/**
 * `HGRenderer::GetTarget(unsigned int kind)` — Helium
 * `__ZN10HGRenderer9GetTargetEj`. Called from GetProgram @0x30f4bc with
 * kind=0x60000 and from RenderTile @0x30ff??/RenderTile_AVX with kind=0.
 * Duplicated here (not deduped with the Identity variant) so each per-class
 * .ts file has a self-contained frontier trail per Rule 6.
 */
export function HgcGradientRadialPerspective_HGRenderer_GetTarget(
  _renderer: unknown,
  _kind: number,
): number {
  throw new Error(
    "HGRenderer::GetTarget @Helium __ZN10HGRenderer9GetTargetEj (called from " +
      "HgcGradientRadialPerspective::GetProgram @0x30f4bc) not yet transcribed",
  );
}

/**
 * `HGNode::SetFlags(int, int)` (vtable slot *0x88 on HGNode). Called from
 * this class's ctor @0x310742 as `this->SetFlags(0, 5)`.
 */
export function HgcGradientRadialPerspective_HGNode_SetFlags(
  _self: unknown,
  _which: number,
  _flags: number,
): void {
  throw new Error(
    "HGNode::SetFlags @Helium (vtable slot *0x88, called from " +
      "HgcGradientRadialPerspective::HgcGradientRadialPerspective ctor @0x310742 " +
      "as this->SetFlags(0, 5)) not yet transcribed",
  );
}
