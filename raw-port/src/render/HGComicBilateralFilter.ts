// raw-port/src/render/HGComicBilateralFilter.ts
//
// FCP `HGComicBilateralFilter` — Helium render-graph node for the
// "Comic — Bilateral" 1D directional edge-preserving blur used by the
// Comic looks family. It is a leaf HGNode subclass (no owned compositor)
// whose GetProgram returns a Metal or GLfs shader source hard-coded in
// the Helium binary, and whose RenderTile implements the same algorithm
// on the CPU with SSE.
//
// Symbols decoded (Helium framework, x86_64 slice; VAs are otool -tV VMAs):
//   0x1b20f0  HGComicBilateralFilter::HGComicBilateralFilter()   [C1 complete ctor — pushq/popq trampoline to C2]
//   0x1b2130  HGComicBilateralFilter::HGComicBilateralFilter()   [C2 base ctor]
//   0x1b2170  HGComicBilateralFilter::~HGComicBilateralFilter()  [D2 base dtor: pushq/popq only]
//   0x1b2180  HGComicBilateralFilter::~HGComicBilateralFilter()  [D1 complete dtor — identical]
//   0x1b2190  HGComicBilateralFilter::~HGComicBilateralFilter()  [D0 deleting dtor: HGObject::operator delete]
//   0x1b21b0  HGComicBilateralFilter::SetParameter(int, float, float, float, float)
//   0x1b2270  HGComicBilateralFilter::IntermediateFormat(HGFormat) const
//   0x1b2280  HGComicBilateralFilter::GetDOD(HGRenderer*, int, HGRect)
//   0x1b2370  HGComicBilateralFilter::GetROI(HGRenderer*, int, HGRect)
//   0x1b24f0  HGComicBilateralFilter::RenderTile(HGTile*)
//   0x1b2c70  HGComicBilateralFilter::GetOutput(HGRenderer*)
//   0x1b2cd0  HGComicBilateralFilter::GetProgram(HGRenderer*)
//   0x1b2d30  HGComicBilateralFilter::BindTexture(HGHandler*, int)
//   0x1b2de0  HGComicBilateralFilter::InitProgramDescriptor(HGProgramDescriptor*) const  [pushq/popq only]
//
// ── STRUCT LAYOUT (recovered from C2 ctor @0x1b2130 + SetParameter @0x1b21b0
// + GetDOD @0x1b2280 + GetROI @0x1b2370 + RenderTile @0x1b24f0) ────────────
// Extends HGNode (size 0x198). Own fields:
//     0x198 : f32   sigma        — inited from constant pool @Helium 0x3ca9c0 (first  lane = 0x3f800000 = 1.0f)
//     0x19c : f32   sigmacolor   — inited from constant pool @Helium 0x3ca9c0 (second lane = 0x3f800000 = 1.0f)
//     0x1a0 : f32   xAxis        — inited from constant pool @Helium 0x3ca9c0 (third  lane = 0x3f800000 = 1.0f)
//     0x1a4 : f32   yAxis        — inited from constant pool @Helium 0x3ca9c0 (fourth lane = 0x00000000 = 0.0f)
//     0x1a8 : f32   scale        — inited to 0x3f800000 = 1.0f
//                                 @Helium 0x1b2156 (`movl $0x3f800000, 0x1a8(%rbx)`).
//                                 Used as (1/scale) in GetROI/BindTexture (pixel-scale reciprocal).
// Semantics: matches the Metal shader source embedded in GetProgram
//   (hg_Params[0].xy = {sigma, sigmacolor}, hg_Params[1].xy = {xAxis, yAxis}).
// SetParameter idx=0 stores (sigma, sigmacolor). SetParameter idx=1 stores
// (xAxis, yAxis). SetParameter idx=2 stores scale (single float).
//
// ── DECODED RIP-RELATIVE CONSTANTS ────────────────────────────────────────
//   @Helium 0x3ca9c0 (16B, movaps): { 1.0f, 1.0f, 1.0f, 0.0f } — ctor's initial
//                                    (sigma, sigmacolor, xAxis, yAxis).
//   @Helium 0x3ca260 (8B,  movsd):  double 1.0                  — GetDOD/GetROI's Scale-Z arg = 1.0.
//   @Helium 0x3c7cc8 (4B,  movss):  0.5f (float @ +0 of 0xbf0000003f000000 word)
//                                    — GetDOD's third arg to HGTransformUtils::GetDOD (halving).
//                                    — GetROI's third arg to HGTransformUtils::GetROI (halving).
//   @Helium 0x3c7cc0 (4B,  movss):  1.0f — RenderTile compares to +xAxis/+yAxis and i-loop step.
//   @Helium 0x3c7c40 (16B, movaps): {1,1,1,1}f — RenderTile clamp-max (before minps).
//   @Helium 0x3c7c70 (16B, movaps): {0.5,0.5,0.5,0.5}f — RenderTile "add 0.5 for round-to-nearest".
//   @Helium 0x3c7cb0 (8B,  movsd):  {0.0f, 1.0f} (packed) — RenderTile axis y increment lane.
//   @Helium 0x3ca0b0 (8B,  movsd):  {1.0f, 1.0f}          — RenderTile packing.
//   @Helium 0x3ca0c0 (16B, movaps): {0.5,0.5,0.0,1.0}f — RenderTile init xmm2 (unused lanes = 0,1).
//   @Helium 0x3ca0d0 (16B, movaps): {0x80000000,x4}     — RenderTile sign-mask xor (negate lanes).
//   @Helium 0x3ca110 (4B,  movss):  -1.0f (0xbf800000)   — RenderTile gradient "* 2 - 1" bias.
//   @Helium 0x3c7cc8 (4B,  movss @1b23ef): 0.5f — GetROI's third arg to HGTransformUtils::GetROI.
//   @Helium 0x1b2d7d references 0x3ca260 (double 1.0) — BindTexture second-arg for tex-coord scale.
//
// ── VTABLE @Helium 0xa26c81 (installed pointer, from `leaq 0x874b53(%rip)` @0x1b213e) ──
// The class overrides HGNode slots by installing this pointer at *this in the
// ctor; individual slot resolution has not been separately dumped here (see
// resolve.py Helium vtable HGComicBilateralFilter). Slots known from asm:
//   *0x138 = HGNode::IsSomething(HGRenderer*)   — vcalled from RenderTile @0x1b2572
//                                                (name inferred from vtable slot only;
//                                                 not yet transcribed).
//
// ── FRAMEWORK CALLS ───────────────────────────────────────────────────────
//   HGNode::HGNode()                             @Helium 0x11baf0 (real, imported)
//   HGNode::SetParameter(int,f,f,f,f)            @Helium — vcall — see GetOutput
//   HGRect::IsInfinite() const                   @Helium — see HGRect.ts (IsInfinite ported)
//   HGTransform::HGTransform()                   @Helium — not yet transcribed
//   HGTransform::Scale(double,double,double)     @Helium — not yet transcribed
//   HGTransform::~HGTransform()                  @Helium — not yet transcribed
//   HGTransformUtils::MinW()                     @Helium — not yet transcribed
//   HGTransformUtils::GetDOD(...)                @Helium — not yet transcribed
//   HGTransformUtils::GetROI(...)                @Helium — not yet transcribed
//   HGRect::Grow(HGRect)                         @Helium — see HGRect.ts (Grow ported as HGRectGrow)
//   HGRectMake4i(int,int,int,int)                @Helium — see HGRect.ts (ported)
//   HGRenderer::GetTarget(unsigned int)          @Helium — not yet transcribed
//   HGTile::Renderer() const                     @Helium — not yet transcribed
//   HGHandler::TexCoord(int,int,int,double*)     @Helium — not yet transcribed
//   HGObject::operator delete(void*)             @Helium — real, imported
//   expf(x)                                      libSystem stub @0x3c50fc — Math.exp
//
// The following are STUB throws (their addresses are cited) so the frontier
// tracker sees them as remaining decode work.
//
// ── SEMANTICS: GetProgram @0x1b2cd0 ──────────────────────────────────────
// Dispatch:
//   1) target = HGRenderer::GetTarget(renderer, 0x60000)      @0x1b2ce1
//   2) if (target <= 0x60b0f) → return the Metal source string (@Helium literal
//      pool @0x9a05fa, RIP-based, containing the exact bilateral shader below).
//   3) else vcall *0x80 = HGNode::shaderDescription(0x2e); if it returns
//      non-zero, return the GLfs 1.0 shader source (@Helium literal pool @0x9ae02b);
//      else return null.
// The two shaders implement the SAME algorithm — the Metal source is
// literally the specification for RenderTile.  Reproduced verbatim below
// in a JS template string so it can be recovered at runtime.
//
// ── SEMANTICS: RenderTile @0x1b24f0 ──────────────────────────────────────
// CPU tile renderer. Skips work if BOTH (xAxis, yAxis) equal 1.0 (there is
// no direction) via the ucomiss ladder @0x1b251b..0x1b2549 which reads
// 1.0f from @Helium 0x3c7cc0. Otherwise it:
//   1) queries the target's Renderer,
//   2) vcalls *0x138 to obtain an `initial-fill` mode flag (r15d),
//   3) computes derived scalars sigma22 = 1/(2*sigma*sigma),
//      sigmacolor22 = 1/(2*sigmacolor*sigmacolor),
//      sigmax2 = 2*sigma via SSE (@0x1b25cf..0x1b2610),
//   4) iterates a tile's pixel grid (@0x1b262a..0x1b2c49),
//      calls expf three times per interior step to compute the
//      spatial/color weights, and writes the clamped [0,1] premultiplied
//      RGBA into the tile-out slot with `minps` @Helium 0x3c7c40 (max 1.0f)
//      followed by `maxps xorps xmm0,xmm0` (min 0.0f) at 0x1b26a4..0x1b26a7.
//
// This is a 441-line function with two nested loops, texture bilinear
// sampling (4x movaps + subps + mulps at 0x1b273d/40/43), a fast-path for
// r15d != 0 (bilinear) vs r15d == 0 (nearest with add-0.5 rounding via
// constant @0x3c7c70 = {0.5,0.5,0.5,0.5}f), and NaN patching via
// `ucomiss %xmm1,%xmm1 ; jnp` + `blendps` at 0x1b276d/0x1b2782.
// A faithful bit-for-bit CPU port is DEFERRED (per PORTING_SPEC.md rule 3:
// a THROW is correct while a paraphrase is a defect). The Metal shader in
// GetProgram is the specification and is preserved verbatim below; when
// this class is scheduled for CPU-tile parity, the SSE control flow
// documented above tells the porter exactly which lanes/constants to use.
//
// ── PROVENANCE-CITED CONSTANTS DEFINITIONS ────────────────────────────────

import { HGNode } from './HGNode.js';
import {
  HGRect,
  HGRectNull,
  HGRectIsInfinite,
  HGRectGrow,
  HGRectMake4i,
} from './HGRect.js';

// ---------------------------------------------------------------------------
// Frontier stubs: FCP classes referenced but not yet transcribed. Each
// throws citing its @0xADDR per PORTING_SPEC.md rule 3.
// ---------------------------------------------------------------------------

/**
 * `HGTransform` — 4x4 affine transform accumulator used by GetDOD/GetROI.
 * Not yet decoded as a class. Referenced via three C symbols:
 *   HGTransform::HGTransform()          @Helium __ZN11HGTransformC1Ev
 *   HGTransform::Scale(double,double,double)  @Helium __ZN11HGTransform5ScaleEddd
 *   HGTransform::~HGTransform()         @Helium __ZN11HGTransformD1Ev
 * Ctor call sites: @0x1b22e2 (GetDOD), @0x1b23c3 (GetROI). Dtor: 0x1b2336/0x1b246b/0x1b24d5/0x1b2359.
 */
export interface HGTransform {
  /** @Helium __ZN11HGTransform5ScaleEddd — @0x1b22fa (GetDOD), @0x1b23db (GetROI) */
  Scale(sx: number, sy: number, sz: number): void;
  /** @Helium __ZN11HGTransformD1Ev — dtor */
  destruct(): void;
}

/**
 * `HGTransform::HGTransform()` — @Helium __ZN11HGTransformC1Ev (not yet transcribed).
 * Call sites: @0x1b22e2 (GetDOD), @0x1b23c3 (GetROI).
 */
function newHGTransform(): HGTransform {
  throw new Error(
    'HGTransform::HGTransform not yet transcribed @Helium __ZN11HGTransformC1Ev ' +
      '(called from HGComicBilateralFilter::GetDOD @0x1b22e2 and ::GetROI @0x1b23c3)',
  );
}

/**
 * `HGTransformUtils` static helpers. Not yet transcribed.
 *   MinW()                                         @Helium __ZN16HGTransformUtils4MinWEv
 *   GetDOD(HGTransform*, HGRect, float, float)     @Helium __ZN16HGTransformUtils6GetDODEPK11HGTransform6HGRectff
 *   GetROI(HGTransform*, HGRect, float, float)     @Helium __ZN16HGTransformUtils6GetROIEPK11HGTransform6HGRectff
 * Call sites:
 *   MinW    @0x1b2307 (GetDOD), @0x1b23e0 (GetROI).
 *   GetDOD  @0x1b2324 (GetDOD).
 *   GetROI  @0x1b23fd (GetROI).
 */
function HGTransformUtils_MinW(): number {
  throw new Error(
    'HGTransformUtils::MinW not yet transcribed @Helium __ZN16HGTransformUtils4MinWEv ' +
      '(called from HGComicBilateralFilter::GetDOD @0x1b2307 and ::GetROI @0x1b23e0)',
  );
}
function HGTransformUtils_GetDOD(
  _t: HGTransform,
  _r: HGRect,
  _a: number,
  _b: number,
): HGRect {
  throw new Error(
    'HGTransformUtils::GetDOD not yet transcribed @Helium ' +
      '__ZN16HGTransformUtils6GetDODEPK11HGTransform6HGRectff ' +
      '(called from HGComicBilateralFilter::GetDOD @0x1b2324)',
  );
}
function HGTransformUtils_GetROI(
  _t: HGTransform,
  _r: HGRect,
  _a: number,
  _b: number,
): HGRect {
  throw new Error(
    'HGTransformUtils::GetROI not yet transcribed @Helium ' +
      '__ZN16HGTransformUtils6GetROIEPK11HGTransform6HGRectff ' +
      '(called from HGComicBilateralFilter::GetROI @0x1b23fd)',
  );
}

/**
 * `HGRenderer` — Helium render driver. Not yet transcribed.
 *   GetTarget(unsigned int) -> u32   @Helium __ZN10HGRenderer9GetTargetEj
 *   Call site: @0x1b2ce1 (GetProgram).
 */
export interface HGRendererStub {
  GetTarget(bits: number): number;
}

/**
 * `HGTile` — GPU tile abstraction handed to RenderTile.
 *   Renderer() const  @Helium __ZNK6HGTile8RendererEv    — call @0x1b2564.
 * The tile layout accessed by RenderTile (verbatim from the SSE code):
 *   0x00 : HGRect  bounds                 (movdqa (%rbx),%xmm0 @0x1b257b)
 *   0x10 : void*   outSlot (rgba tile ptr, +16 stride per pixel)  @0x1b2617
 *   0x18 : i32     outStride (pixels per row)      @0x1b264e (`movslq 0x18`)
 *   0x50 : void*   inTex0Pixels (rgba tile ptr)    @0x1b279a
 *   0x58 : i32     inTex0Stride (pixels per row)   @0x1b279e (`movslq 0x58`)
 *   0x60 : void*   inTex1Pixels (gradient tile ptr) @0x1b26e4
 *   0x68 : i32     inTex1Stride (pixels per row)   @0x1b26e8 (`movslq 0x68`)
 * Not yet transcribed here; declared as an interface so the RenderTile
 * stub can cite the specific slots.
 */
export interface HGTile {
  Renderer(): HGRendererStub;
}

/** `HGHandler` — the Metal/GL binding handler (BindTexture target). */
export interface HGHandler {
  /** @Helium __ZN9HGHandler8TexCoordEiiiPKd — @0x1b2d6c, @0x1b2d9f */
  TexCoord(a: number, b: number, c: number, d: Float64Array | null): void;
  /** vtable — see BindTexture disasm. */
  vtable: {
    /** *0x30 — @0x1b2dcd */
    fn0x30(self: HGHandler, a: number, b: number): void;
    /** *0x38 — @0x1b2bba */
    fn0x38(self: HGHandler, a: number): void;
    /** *0x48 — @0x1b2daf */
    fn0x48(self: HGHandler, texUnit: number, b: number): void;
    /** *0x68 — @0x1b2d8b — (double a, double b) */
    fn0x68(self: HGHandler, a: number, b: number): void;
  };
}

/** `HGProgramDescriptor` — GPU program descriptor. Only referenced as an opaque `*`. */
export interface HGProgramDescriptor {}

/** `HGRenderer::GetTarget` throw stub used from GetProgram. */
function HGRenderer_GetTarget(_r: HGRendererStub, _bits: number): number {
  throw new Error(
    'HGRenderer::GetTarget not yet transcribed @Helium __ZN10HGRenderer9GetTargetEj ' +
      '(called from HGComicBilateralFilter::GetProgram @0x1b2ce1)',
  );
}

/**
 * `HGNode::SetParameter(int, float, float, float, float)` — @Helium 0x11cab0
 * (vtable slot *0x60 on HGNode). Not yet transcribed in HGNode.ts.
 * Called non-virtually from HGComicBilateralFilter::GetOutput @0x1b2c91 and @0x1b2cb4.
 */
function HGNode_SetParameter(
  _self: HGNode,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): number {
  throw new Error(
    'HGNode::SetParameter not yet transcribed @Helium 0x11cab0 ' +
      '(called non-virtually from HGComicBilateralFilter::GetOutput @0x1b2c91 and @0x1b2cb4)',
  );
}

// ---------------------------------------------------------------------------
// Decoded constants used at multiple sites
// ---------------------------------------------------------------------------

/** Ctor packed init  @Helium 0x3ca9c0 (movaps, 16B) = {1.0f, 1.0f, 1.0f, 0.0f}. */
const K_CTOR_INIT_198: readonly [number, number, number, number] = [
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(0.0),
];

/** Ctor scale init   @Helium 0x1b2156 (`movl $0x3f800000, 0x1a8`) = 1.0f. */
const K_CTOR_INIT_1a8: number = Math.fround(1.0);

/** GetDOD/GetROI Scale-Z double literal  @Helium 0x3ca260 = 1.0. */
const K_SCALE_Z_1_0: number = 1.0;

/** GetDOD/GetROI third arg to HGTransformUtils::GetDOD/GetROI  @Helium 0x3c7cc8 = 0.5f. */
const K_HALF_F: number = Math.fround(0.5);

// ---------------------------------------------------------------------------
// Metal shader source (exact literal @Helium 0x9a05fa, referenced from
// GetProgram @0x1b2ced via `leaq 0x73d8fd(%rip),%rax`). This is the
// authoritative algorithmic specification of the filter.
// ---------------------------------------------------------------------------

/** Metal 1.0 fragment shader — @Helium literal pool @0x9a05fa. */
export const HGComicBilateralFilter_MetalSource: string =
  '//Metal1.0     \n' +
  '//LEN=0000000a5f\n' +
  'fragment FragmentOut fragmentFunc(VertexInOut            frag        [[ stage_in ]],\n' +
  '                                  const constant float4* hg_Params   [[ buffer(0) ]],\n' +
  '                                  texture2d< float >     hg_Texture0 [[ texture(0) ]],\n' +
  '                                  texture2d< float >     hg_Texture1 [[ texture(1) ]],\n' +
  '                                  sampler                hg_Sampler0 [[ sampler(0) ]],\n' +
  '                                  sampler                hg_Sampler1 [[ sampler(1) ]])\n' +
  '{\n' +
  '    const float sigma {static_cast<float>(hg_Params[0].x)};\n' +
  '    const float sigmacolor {static_cast<float>(hg_Params[0].y)};\n' +
  '    const float xAxis {static_cast<float>(hg_Params[1].x)};\n' +
  '    const float yAxis {static_cast<float>(hg_Params[1].y)};\n' +
  '    \n' +
  '    const float sigma22 {1.0f / (2.0f * sigma * sigma)};\n' +
  '    const float sigmacolor22 {1.0f / (2.0f * sigmacolor * sigmacolor)};\n' +
  '    const float sigmax2 {2.0f * sigma};\n' +
  '    \n' +
  '    float2 gradient = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).yz;\n' +
  '    gradient =\n' +
  '    float2( (gradient.y * xAxis + gradient.x * yAxis) * 2.0f - 1.0f,\n' +
  '          ((gradient.x * xAxis + gradient.y * yAxis) * 2.0f - 1.0f) *\n' +
  '          (-1.0f * xAxis + 1.0f * yAxis) );\n' +
  '    \n' +
  '    const float alpha = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).a;\n' +
  '    const float3 current = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).rgb;\n' +
  '    float3 acc = current;\n' +
  '    float norm {1.0f};\n' +
  '    \n' +
  '    for (float i {1.0f}; i <= sigmax2; i += 1.0f)\n' +
  '    {\n' +
  '        const float2 uPos = frag._texCoord0.xy + float2(i * gradient);\n' +
  '        const float2 uNeg = frag._texCoord0.xy - float2(i * gradient);\n' +
  '        \n' +
  '        const float3 right = hg_Texture0.sample(hg_Sampler0, uPos).rgb;\n' +
  '        const float3 left = hg_Texture0.sample(hg_Sampler0, uNeg).rgb;\n' +
  '        \n' +
  '        const float coeff = exp(-i * i * sigma22);\n' +
  '        const float coeffr = exp(-dot((right - current), (right - current)) * sigmacolor22);\n' +
  '        const float coeffl = exp(-dot((left - current), (left - current)) * sigmacolor22);\n' +
  '        \n' +
  '        norm += coeff * (coeffr + coeffl);\n' +
  '        acc += coeff * (coeffr * right+coeffl * left);\n' +
  '    }\n' +
  '    \n' +
  '    acc = acc / norm;\n' +
  '    \n' +
  '    FragmentOut out {float4(float3(acc), alpha)};\n' +
  '    \n' +
  '    // Ensure the result is clamped [0..1]; this is the default behavior of the original\n' +
  '    // comic effect - this was implicit due to non-float, 8-bit, intermediate buffers.\n' +
  '    out.color0 = clamp(out.color0, 0.0f, 1.0f);\n' +
  '    \n' +
  '    return out;\n' +
  '}\n' +
  '//MD5=4537914b:047c029e:4368bd3f:b46404e9\n' +
  '//SIG=00000000:00000000:00000000:00000000:0010:0002:0000:0000:0000:0000:0006:0000:0002:02:0:1:0\n';

/** GLSL fragment shader — @Helium literal pool @0x9ae02b (referenced @0x1b2d15 `leaq 0x73e338(%rip)`). */
export const HGComicBilateralFilter_GLfsSource: string =
  '//GLfs1.0      \n' +
  '//LEN=0000000898\n' +
  '#ifndef GL_ES\n' +
  '#define lowp\n' +
  '#define mediump\n' +
  '#define highp\n' +
  '#define precision\n' +
  '#define defaultp mediump\n' +
  '#endif\n' +
  '\n' +
  'precision highp float;\n' +
  'precision highp int;\n' +
  '\n' +
  'uniform defaultp sampler2DRect hg_Texture0;\n' +
  'uniform defaultp sampler2DRect hg_Texture1;\n' +
  '\n' +
  'uniform highp vec4 hg_ProgramLocal0; // {.x == sigma, .y == sigmacolor}\n' +
  'uniform highp vec4 hg_ProgramLocal1; // {.x == xAxis coefficient, .y == yAxis coefficient}\n' +
  '\n' +
  'void main (void) \n' +
  '{\n' +
  '    float sigma = hg_ProgramLocal0.x;\n' +
  '    float sigmacolor = hg_ProgramLocal0.y;\n' +
  '    float xAxis = hg_ProgramLocal1.x;\n' +
  '    float yAxis = hg_ProgramLocal1.y;\n' +
  '    \n' +
  '    float sigma22 = 1.0 / (2.0 * sigma  * sigma);\n' +
  '    float sigmacolor22 = 1.0 / (2.0 * sigmacolor * sigmacolor);\n' +
  '    float sigmax2 = 2.0 * sigma;\n' +
  '    \n' +
  '    float alpha = texture2DRect(hg_Texture0, gl_TexCoord[0].xy).a;\n' +
  '    vec3 current = texture2DRect(hg_Texture0, gl_TexCoord[0].xy).rgb;\n' +
  '    vec3 acc = current;\n' +
  '    float norm = 1.0;\n' +
  '    \n' +
  '    vec2 gradient = texture2DRect(hg_Texture1, gl_TexCoord[1].xy).yz;\n' +
  '    gradient = \n' +
  '        vec2( (gradient.y * xAxis + gradient.x * yAxis)*2.0 - 1.0,\n' +
  '             ((gradient.x * xAxis + gradient.y * yAxis)*2.0 - 1.0) * \n' +
  '             (-1.0 * xAxis + 1.0 * yAxis));\n' +
  '\n' +
  '    for (float i = 1.0; i <= sigmax2; i += 1.0) \n' +
  '    {\n' +
  '        vec2 uPos = gl_TexCoord[0].xy + i * gradient;\n' +
  '        vec2 uNeg = gl_TexCoord[0].xy - i * gradient;\n' +
  '        \n' +
  '        vec3 right = texture2DRect(hg_Texture0, uPos).rgb;\n' +
  '        vec3 left = texture2DRect(hg_Texture0, uNeg).rgb;\n' +
  '\n' +
  '        float coeff = exp( -i * i * sigma22 );\n' +
  '        float coeffr = exp( -dot((right - current), (right - current)) * sigmacolor22); //(ri-cun).r*(rig-cu).r + (ri-cu).g*(ri-cur).g ... = dist*dist\n' +
  '        float coeffl = exp( -dot((left - current), (left - current)) * sigmacolor22);\n' +
  '\n' +
  '        norm += coeff * (coeffr + coeffl);\n' +
  '        acc += coeff * (coeffr * right+coeffl * left);\n' +
  '    }\n' +
  '    \n' +
  '    acc = acc / norm;\n' +
  '    \n' +
  '    // Ensure the result is clamped [0..1]; this is the default behavior of the original\n' +
  '    // comic effect - this was implicit due to non-float, 8-bit, intermediate buffers.\n' +
  '    gl_FragColor = clamp(vec4(acc, alpha), 0.0, 1.0);\n' +
  ' }\n' +
  '//MD5=26dc515d:0940174b:2c779b1c:584e541e\n' +
  '//SIG=00000000:00000000:00000000:00000000:0020:0002:0000:0000:0000:0000:0000:0000:0002:02:0:1:0\n';

// ---------------------------------------------------------------------------
// HGComicBilateralFilter class
// ---------------------------------------------------------------------------

/**
 * `HGComicBilateralFilter` — Helium leaf node for the Comic looks
 * 1D directional bilateral blur.
 *
 * @Helium ctors @0x1b20f0 (C1) / 0x1b2130 (C2);
 *         dtors  @0x1b2170 (D2) / 0x1b2180 (D1) / 0x1b2190 (D0);
 *         methods:
 *           SetParameter          @0x1b21b0
 *           IntermediateFormat    @0x1b2270
 *           GetDOD                @0x1b2280
 *           GetROI                @0x1b2370
 *           RenderTile            @0x1b24f0
 *           GetOutput             @0x1b2c70
 *           GetProgram            @0x1b2cd0
 *           BindTexture           @0x1b2d30
 *           InitProgramDescriptor @0x1b2de0
 */
export class HGComicBilateralFilter extends HGNode {
  /** float @0x198 — sigma (spatial). Ctor-init 1.0f from @Helium 0x3ca9c0 lane 0. */
  sigma: number;
  /** float @0x19c — sigmacolor. Ctor-init 1.0f from @Helium 0x3ca9c0 lane 1. */
  sigmacolor: number;
  /** float @0x1a0 — xAxis coefficient. Ctor-init 1.0f from @Helium 0x3ca9c0 lane 2. */
  xAxis: number;
  /** float @0x1a4 — yAxis coefficient. Ctor-init 0.0f from @Helium 0x3ca9c0 lane 3. */
  yAxis: number;
  /**
   * float @0x1a8 — output/input pixel scale. Ctor-init 1.0f
   * (`movl $0x3f800000, 0x1a8` @0x1b2156). Used as pixel-scale reciprocal
   * in GetROI (`1.0 / scale`) and BindTexture (`1.0 / scale`).
   */
  scale: number;

  /**
   * `HGComicBilateralFilter::HGComicBilateralFilter()` — @Helium 0x1b2130 (C2).
   * The C1 @0x1b20f0 is a pushq/popq trampoline; both share this body.
   *
   * Asm (C2 @0x1b2130, verbatim):
   *   0x1b2139  callq __ZN6HGNodeC2Ev              ; base ctor
   *   0x1b213e  leaq  0x874b53(%rip), %rax         ; = 0xa26c91 (own vtable installed ptr — RTTI+16)
   *   0x1b2145  movq  %rax, (%rbx)                 ; *this = vtable
   *   0x1b2148  movaps 0x218871(%rip), %xmm0       ; = @Helium 0x3ca9c0 = {1,1,1,0}f
   *   0x1b214f  movups %xmm0, 0x198(%rbx)          ; sigma/sigmacolor/xAxis/yAxis
   *   0x1b2156  movl  $0x3f800000, 0x1a8(%rbx)     ; scale = 1.0f
   *   0x1b2160  orl   $0x620, 0x10(%rbx)           ; set HGNode flag bits 0x620 (bits 5,9,10)
   *   0x1b216d  ret
   */
  constructor() {
    // @Helium 0x1b2139: HGNode base ctor
    super();
    // @Helium 0x1b2145: install this class's vtable (documented; not modeled functionally)
    // vtable installed pointer = @Helium 0xa26c91 (@0x1b213e leaq target).
    // @Helium 0x1b2148: 16-byte movaps of {1,1,1,0}f into (sigma,sigmacolor,xAxis,yAxis)
    this.sigma = K_CTOR_INIT_198[0];
    this.sigmacolor = K_CTOR_INIT_198[1];
    this.xAxis = K_CTOR_INIT_198[2];
    this.yAxis = K_CTOR_INIT_198[3];
    // @Helium 0x1b2156: `movl $0x3f800000, 0x1a8(%rbx)` — scale = 1.0f
    this.scale = K_CTOR_INIT_1a8;
    // @Helium 0x1b2160: `orl $0x620, 0x10(%rbx)` — set HGNode flag bits.
    // HGNode.flags is not yet a first-class field in HGNode.ts; this OR is
    // documented and left as data on the base class if/when it is modeled.
    // (See HGNode @Helium 0x1baf0..0x1bad0 for the layout of 0x10.)
  }

  /**
   * `HGComicBilateralFilter::~HGComicBilateralFilter()` — @Helium 0x1b2170 (D2),
   * @0x1b2180 (D1). Body is only `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; ret`.
   * There is no owned resource to release; HGNode dtor is NOT tail-called here
   * (D1/D2 return immediately). @0x1b2190 (D0) additionally invokes
   * `HGObject::operator delete` on `this`.
   */
  destruct(): void {
    // @Helium 0x1b2170..0x1b217d: no-op body.
    // (Base HGNode dtor is not called here — the C++ D2 was empty.)
  }

  /**
   * `HGComicBilateralFilter::SetParameter(int idx, float a, float b, float c, float d)`
   * — @Helium 0x1b21b0. Vtable slot *0x60 (overrides HGNode::SetParameter).
   *
   * Returns:
   *   1  if any stored field was changed (early-out via ucomiss ladder if all
   *      target-idx fields already equal their new values — ret 0);
   *   0  if idx is in {0,1,2} but the incoming values are all equal to stored;
   *   0xFFFFFFFF for any other idx.
   *
   * Dispatch (@0x1b21b4..0x1b21c5):
   *   idx==2 -> scale-store path @0x1b2201
   *   idx==1 -> (xAxis, yAxis) path @0x1b21e4
   *   idx==0 -> (sigma, sigmacolor) path @0x1b21c7
   *   else   -> return -1 @0x1b21be `movl $0xffffffff, %eax` -> ret @0x1b2219.
   *
   * Note: the asm returns UNSIGNED 0xFFFFFFFF; in TS we return -1 as a
   * plain number since the caller compares with 0 / non-zero.
   *
   * ucomiss semantics: `jne <NEQ>; jnp <EQ>` == "equal iff ZF=1 AND PF=0"
   * i.e. bit-exact equal, both non-NaN. In JS, `Math.fround(x) === Math.fround(y)`
   * gives the identical result (NaN !== NaN in JS).
   *
   * Asm (verbatim):
   *   0x1b21b0  pushq %rbp; movq %rsp,%rbp
   *   0x1b21b4  cmpl $2, %esi; je 0x1b2201       ; idx==2 -> scale path
   *   0x1b21b9  cmpl $1, %esi; je 0x1b21e4       ; idx==1 -> xAxis/yAxis path
   *   0x1b21be  movl $0xffffffff, %eax           ; default retval = -1
   *   0x1b21c3  testl %esi, %esi; jne 0x1b2219   ; if idx != 0, ret -1
   *   ; ---- idx == 0 path (sigma at 0x198, sigmacolor at 0x19c) ----
   *   0x1b21c7  ucomiss 0x198(%rdi), %xmm0        ; cmp new sigma vs stored
   *   0x1b21ce  jne 0x1b21d2                      ;  \_ if !equal, go store
   *   0x1b21d0  jnp 0x1b2240                      ; if equal(non-NaN), skip sigma store, check sigmacolor
   *   0x1b21d2  movss %xmm0, 0x198(%rdi)          ; sigma = new
   *   0x1b21da  movss 0x19c(%rdi), %xmm0          ; xmm0 = stored sigmacolor
   *   0x1b21e2  jmp 0x1b224f                      ; ret=1 tail
   *   ; ---- idx == 1 path (xAxis at 0x1a0, yAxis at 0x1a4) ----
   *   0x1b21e4  ucomiss 0x1a0(%rdi), %xmm0        ; cmp new xAxis vs stored
   *   0x1b21eb  jne 0x1b21ef; jnp 0x1b221b
   *   0x1b21ef  movss %xmm0, 0x1a0(%rdi)          ; xAxis = new
   *   0x1b21f7  movss 0x1a4(%rdi), %xmm0          ; xmm0 = stored yAxis
   *   0x1b21ff  jmp 0x1b222a                      ; ret=1 tail
   *   ; ---- idx == 2 path (scale at 0x1a8) ----
   *   0x1b2201  ucomiss 0x1a8(%rdi), %xmm0        ; cmp new scale vs stored
   *   0x1b2208  jne 0x1b220c; jnp 0x1b2265        ; if equal, ret 0
   *   0x1b220c  movss %xmm0, 0x1a8(%rdi)          ; scale = new
   *   0x1b2214  movl $1, %eax; ret                ; ret 1
   *   ; ---- shared "check second field then possibly store b, ret 1/0" tails ----
   *   0x1b221b  movss 0x1a4(%rdi), %xmm0          ; (idx=1 skipped-first path) load yAxis
   *   0x1b2223  ucomiss %xmm0, %xmm1              ; cmp new yAxis vs stored
   *   0x1b2226  jne 0x1b222a; jnp 0x1b2265        ;   if equal, ret 0
   *   0x1b222a  movl $1, %eax; ucomiss %xmm0, %xmm1
   *                                               ; ret 1 (already), also loaded eq flags
   *   0x1b222f  jne 0x1b2236; jnp 0x1b2219        ;   if equal, skip second store, ret 1
   *   0x1b2236  movss %xmm1, 0x1a4(%rdi)          ; yAxis = new b
   *   0x1b223e  ret                               ; ret 1
   *   0x1b2240  movss 0x19c(%rdi), %xmm0          ; (idx=0 skipped-first path) load sigmacolor
   *   0x1b2248  ucomiss %xmm0, %xmm1              ; cmp new sigmacolor vs stored
   *   0x1b224b  jne 0x1b224f; jnp 0x1b2265        ;   if equal, ret 0
   *   0x1b224f  movl $1, %eax; ucomiss %xmm0, %xmm1; ret 1 tail with maybe-store below
   *   0x1b2254  jne 0x1b225b; jnp 0x1b2219        ;   equal -> skip store, ret 1
   *   0x1b225b  movss %xmm1, 0x19c(%rdi)          ; sigmacolor = new b
   *   0x1b2263  ret                               ; ret 1
   *   0x1b2265  xorl %eax, %eax; ret              ; ret 0 (both fields unchanged)
   */
  SetParameter(
    idx: number,
    a: number,
    b: number,
    _c: number,
    _d: number,
  ): number {
    // @Helium 0x1b21b4..0x1b21c5: dispatch.
    if (idx === 2) {
      // @Helium 0x1b2201..0x1b2219: scale path (single-float compare-and-store).
      const na = Math.fround(a);
      if (this.scale === na) {
        // @Helium 0x1b220a `jnp 0x1b2265`: equal -> xorl eax,eax; ret.
        return 0;
      }
      // @Helium 0x1b220c: movss %xmm0,0x1a8; movl $1,%eax; ret.
      this.scale = na;
      return 1;
    }
    if (idx === 1) {
      // @Helium 0x1b21e4..0x1b223f: xAxis/yAxis path.
      const na = Math.fround(a);
      const nb = Math.fround(b);
      const equalA = this.xAxis === na;
      const equalB = this.yAxis === nb;
      if (equalA && equalB) {
        // @Helium 0x1b21eb-jnp -> 0x1b221b -> jne/jnp to 0x1b2265: ret 0.
        return 0;
      }
      // @Helium 0x1b21ef: if !equalA, store xAxis.
      if (!equalA) {
        this.xAxis = na;
      }
      // @Helium 0x1b2236: if !equalB, store yAxis.
      if (!equalB) {
        this.yAxis = nb;
      }
      // @Helium 0x1b222a: ret 1.
      return 1;
    }
    if (idx === 0) {
      // @Helium 0x1b21c7..0x1b2264: sigma/sigmacolor path.
      const na = Math.fround(a);
      const nb = Math.fround(b);
      const equalA = this.sigma === na;
      const equalB = this.sigmacolor === nb;
      if (equalA && equalB) {
        return 0;
      }
      if (!equalA) {
        this.sigma = na;
      }
      if (!equalB) {
        this.sigmacolor = nb;
      }
      return 1;
    }
    // @Helium 0x1b21be..0x1b2219: default path — ret -1 (0xFFFFFFFF).
    return -1;
  }

  /**
   * `HGComicBilateralFilter::IntermediateFormat(HGFormat) const` — @Helium 0x1b2270.
   * Body:
   *   0x1b2274  movl $0x18, %eax   ; return 0x18 unconditionally
   *   0x1b2279  ret
   *
   * The input HGFormat argument is UNUSED. 0x18 is Helium's HGFormat enum
   * value for a specific RGBA-float intermediate — the exact enum symbol
   * has not been separately dumped here.
   */
  IntermediateFormat(_fmt: number): number {
    // @Helium 0x1b2274: movl $0x18, %eax; ret.
    return 0x18;
  }

  /**
   * `HGComicBilateralFilter::GetDOD(HGRenderer* r, int inputIdx, HGRect rect)`
   * — @Helium 0x1b2280. Vtable slot (override in HGNode DOD chain).
   *
   * Asm (verbatim):
   *   0x1b2280  pushq %rbp ; ... ; subq $0xb0, %rsp
   *   0x1b228e  movq %rcx, -0x20(%rbp)          ; stash rect on the stack
   *   0x1b2292  movq %r8,  -0x18(%rbp)          ;  (rect is passed in rcx/r8)
   *   0x1b2296  testl %edx, %edx
   *   0x1b2298  je    0x1b22ad                  ; if inputIdx != 0 -> return HGRectNull
   *   0x1b229a  leaq  _HGRectNull(%rip), %rcx
   *   0x1b22a1  movq  (%rcx), %rax
   *   0x1b22a4  movq  0x8(%rcx), %rdx
   *   0x1b22a8  jmp   0x1b2341                  ; ret HGRectNull
   *   ; ---- inputIdx == 0 branch ----
   *   0x1b22ad  movq  %rdi, %rbx
   *   0x1b22b0  leaq  -0x20(%rbp), %rdi
   *   0x1b22b4  callq __ZNK6HGRect10IsInfiniteEv ; IsInfinite(rect)
   *   0x1b22b9  testb %al, %al
   *   0x1b22bb  je    0x1b22c7
   *   0x1b22bd  movq  -0x20(%rbp), %rax          ; if infinite, return rect unchanged
   *   0x1b22c1  movq  -0x18(%rbp), %rdx
   *   0x1b22c5  jmp   0x1b2341
   *   ; ---- finite rect: build transform and delegate ----
   *   0x1b22c7  movss 0x1a8(%rbx), %xmm0        ; xmm0 = scale (f32)
   *   0x1b22cf  cvtss2sd %xmm0, %xmm0            ; xmm0 = (double)scale
   *   0x1b22d3  movsd %xmm0, -0x28(%rbp)         ; stash on the stack
   *   0x1b22d8  leaq  -0xb8(%rbp), %rbx          ; rbx = &tx (HGTransform*)
   *   0x1b22df  movq  %rbx, %rdi
   *   0x1b22e2  callq __ZN11HGTransformC1Ev       ; tx.HGTransform()
   *   0x1b22e7  movsd 0x217f71(%rip), %xmm2       ; xmm2 = @Helium 0x3ca260 = 1.0 (double)
   *   0x1b22ef  movq  %rbx, %rdi
   *   0x1b22f2  movsd -0x28(%rbp), %xmm0          ; xmm0 = (double)scale
   *   0x1b22f7  movaps %xmm0, %xmm1               ; xmm1 = (double)scale
   *   0x1b22fa  callq __ZN11HGTransform5ScaleEddd ; tx.Scale(scale, scale, 1.0)
   *   0x1b22ff  movq  -0x20(%rbp), %rbx          ; rbx = rect.lo
   *   0x1b2303  movq  -0x18(%rbp), %r14          ; r14 = rect.hi
   *   0x1b2307  callq __ZN16HGTransformUtils4MinWEv ; xmm0 = MinW()  (float)
   *   0x1b230c  movaps %xmm0, %xmm1               ; xmm1 = MinW()
   *   0x1b230f  leaq  -0xb8(%rbp), %rdi           ; rdi = &tx
   *   0x1b2316  movss 0x2159aa(%rip), %xmm0       ; xmm0 = @Helium 0x3c7cc8 = 0.5f
   *   0x1b231e  movq  %rbx, %rsi                  ; rsi/rdx = rect.lo/hi
   *   0x1b2321  movq  %r14, %rdx
   *   0x1b2324  callq __ZN16HGTransformUtils6GetDODEPK11HGTransform6HGRectff
   *                                               ; result = HGTransformUtils::GetDOD(&tx, rect, 0.5f, MinW())
   *   0x1b2329  movq  %rax, %rbx                  ; return in (rax, rdx)
   *   0x1b232c  movq  %rdx, %r14
   *   0x1b2336  callq __ZN11HGTransformD1Ev       ; ~HGTransform()
   *   0x1b233b..0x1b234c  epilogue; ret (rax, rdx)
   */
  GetDOD(r: HGRendererStub, inputIdx: number, rect: HGRect): HGRect {
    // @Helium 0x1b2296..0x1b22a8: inputIdx != 0 -> return HGRectNull.
    if (inputIdx !== 0) {
      return HGRectNull;
    }
    // @Helium 0x1b22b4..0x1b22c5: if rect is infinite, return it unchanged.
    if (HGRectIsInfinite(rect)) {
      return rect;
    }
    // @Helium 0x1b22c7..0x1b22d3: xmm0 = (double)this.scale.
    const scaleD: number = this.scale; // JS number IS double; cvtss2sd is exact for f32→f64.
    // @Helium 0x1b22e2: HGTransform tx;  — throws (frontier stub).
    const tx = newHGTransform();
    // @Helium 0x1b22fa: tx.Scale(scale, scale, 1.0)  — third arg from @Helium 0x3ca260 = 1.0.
    tx.Scale(scaleD, scaleD, K_SCALE_Z_1_0);
    // @Helium 0x1b2307: MinW() — throws (frontier stub).
    const minW = HGTransformUtils_MinW();
    // @Helium 0x1b2324: HGTransformUtils::GetDOD(&tx, rect, 0.5f, MinW()) — throws (frontier stub).
    // @Helium 0x1b2316 loads 0.5f from @Helium 0x3c7cc8.
    try {
      const result = HGTransformUtils_GetDOD(tx, rect, K_HALF_F, minW);
      // @Helium 0x1b2336: tx.~HGTransform() (throws — frontier stub) — best-effort dtor call.
      tx.destruct();
      return result;
    } finally {
      // Note: the C++ has an exception cleanup at 0x1b234f-0x1b2361 that unwinds
      // by calling ~HGTransform then Unwind_Resume. In the transcribed JS we do
      // not model that (Unwind_Resume is a C++-only frame-unwinder); the try/finally
      // here approximates the RAII dtor path. No `throw` is swallowed.
    }
    // (unreachable; the try above always returns or rethrows)
  }

  /**
   * `HGComicBilateralFilter::GetROI(HGRenderer* r, int inputIdx, HGRect rect)`
   * — @Helium 0x1b2370. Same shape as GetDOD but with an ADDITIONAL two Grow()
   * calls that expand the ROI outward by ceil(2*sigma) pixels in x/y and then
   * by 1 pixel in x/y.
   *
   * Asm (verbatim, control flow):
   *   0x1b2388  cmpl $1, %edx; je 0x1b2472         ; inputIdx==1 path -> Grow-only
   *   0x1b2391  testl %edx, %edx; jne 0x1b24a1     ; inputIdx>=2 -> HGRectNull
   *   ; ---- inputIdx == 0 branch (the "sigma+1 padding") ----
   *   0x1b239c  movss 0x1a8(%rdi), %xmm0            ; xmm0 = f32 scale
   *   0x1b23a4  cvtss2sd %xmm0, %xmm0                ; xmm0 = (double)scale
   *   0x1b23a8  movsd 0x217eb0(%rip), %xmm1          ; xmm1 = @Helium 0x3ca260 = 1.0
   *   0x1b23b0  divsd %xmm0, %xmm1                   ; xmm1 = 1.0 / scale
   *   0x1b23b4  movsd %xmm1, -0x38(%rbp)             ; stash
   *   0x1b23c3  callq __ZN11HGTransformC1Ev          ; HGTransform tx;
   *   0x1b23cb  movsd -0x38(%rbp), %xmm0             ; xmm0 = 1/scale
   *   0x1b23d0  movaps %xmm0, %xmm1                  ; xmm1 = 1/scale
   *   0x1b23d3  movsd 0x217e85(%rip), %xmm2          ; xmm2 = @Helium 0x3ca260 = 1.0
   *   0x1b23db  callq __ZN11HGTransform5ScaleEddd     ; tx.Scale(1/scale, 1/scale, 1.0)
   *   0x1b23e0  callq __ZN16HGTransformUtils4MinWEv   ; MinW()
   *   0x1b23e5  movaps %xmm0, %xmm1
   *   0x1b23ef  movss 0x2158d1(%rip), %xmm0          ; xmm0 = @Helium 0x3c7cc8 = 0.5f
   *   0x1b23fd  callq __ZN16HGTransformUtils6GetROIEPK11HGTransform6HGRectff
   *   0x1b2402  movq  %rax, -0x30(%rbp)              ; roi = result
   *   0x1b2406  movq  %rdx, -0x28(%rbp)
   *   0x1b240a  movss 0x198(%rbx), %xmm0             ; xmm0 = sigma (f32)
   *   0x1b2412  addss %xmm0, %xmm0                   ; xmm0 = 2*sigma
   *   0x1b2416  roundss $0xa, %xmm0, %xmm0           ; ceil(2*sigma) (round toward +inf)
   *   0x1b241c  cvttss2si %xmm0, %eax                ; eax = (int)ceil(2*sigma)
   *   0x1b2420..0x1b2434  build padding rect: (-p,-p,p,p) via HGRectMake4i style shift/neg
   *   0x1b243a  callq __ZN6HGRect4GrowES_             ; roi = HGRectGrow(roi, padRect)
   *   0x1b243f..0x1b2453  HGRectMake4i(-1,-1,1,1)     ; one-pixel padding rect
   *   0x1b245f  callq __ZN6HGRect4GrowES_             ; roi = HGRectGrow(roi, [-1,-1,1,1])
   *   0x1b246b  callq __ZN11HGTransformD1Ev           ; ~HGTransform()
   *   0x1b2470  jmp 0x1b24af                         ; return roi
   *   ; ---- inputIdx == 1 branch: no transform, just one-pixel Grow ----
   *   0x1b2472  movq %r15, -0x30(%rbp); movq %r14, -0x28(%rbp)   ; roi = rect
   *   0x1b247a..0x1b248e  HGRectMake4i(-1,-1,1,1)
   *   0x1b249a  callq __ZN6HGRect4GrowES_             ; roi = HGRectGrow(rect, [-1,-1,1,1])
   *   0x1b249f  jmp 0x1b24af
   *   ; ---- inputIdx >= 2 branch: HGRectNull ----
   *   0x1b24a1  leaq _HGRectNull(%rip), %rax; movups (%rax), %xmm0; movaps %xmm0, -0x30(%rbp)
   *   ; ---- epilogue ----
   *   0x1b24af  movq -0x30(%rbp), %rax; movq -0x28(%rbp), %rdx; ...; ret
   *
   * Note the roundss immediate 0xA = ROUND_TOWARD_+INF (i.e. ceil) with
   * "suppress inexact" (bit 3 = 8 | mode = 2). cvttss2si truncates toward zero;
   * for a non-negative ceil'd value this is bit-exact `Math.ceil` cast to i32.
   */
  GetROI(r: HGRendererStub, inputIdx: number, rect: HGRect): HGRect {
    // @Helium 0x1b2388: inputIdx == 1 -> Grow-by-1 only.
    if (inputIdx === 1) {
      // @Helium 0x1b2472..0x1b249f
      const pad1 = HGRectMake4i(-1, -1, 1, 1);
      return HGRectGrow(rect, pad1);
    }
    // @Helium 0x1b2391: inputIdx != 0 (and != 1) -> HGRectNull.
    if (inputIdx !== 0) {
      // @Helium 0x1b24a1
      return HGRectNull;
    }
    // @Helium 0x1b239c..0x1b23b4: 1.0 / scale.
    const invScaleD = K_SCALE_Z_1_0 / this.scale;
    // @Helium 0x1b23c3: HGTransform tx (throws — frontier).
    const tx = newHGTransform();
    // @Helium 0x1b23db: tx.Scale(1/scale, 1/scale, 1.0).
    tx.Scale(invScaleD, invScaleD, K_SCALE_Z_1_0);
    // @Helium 0x1b23e0: MinW() (throws — frontier).
    const minW = HGTransformUtils_MinW();
    // @Helium 0x1b23fd: HGTransformUtils::GetROI(&tx, rect, 0.5f, MinW()) (throws — frontier).
    let roi = HGTransformUtils_GetROI(tx, rect, K_HALF_F, minW);
    // @Helium 0x1b240a..0x1b241c: p = (int)ceil(2 * sigma) via roundss imm=0xA + cvttss2si.
    const twoSigma = Math.fround(Math.fround(this.sigma) + Math.fround(this.sigma));
    const p = (Math.ceil(twoSigma) | 0);
    // @Helium 0x1b2420..0x1b243a: HGRectGrow(roi, (-p, -p, p, p)).
    roi = HGRectGrow(roi, { x: -p, y: -p, right: p, bottom: p });
    // @Helium 0x1b243f..0x1b245f: HGRectGrow(roi, HGRectMake4i(-1, -1, 1, 1)).
    roi = HGRectGrow(roi, HGRectMake4i(-1, -1, 1, 1));
    // @Helium 0x1b246b: ~HGTransform()
    tx.destruct();
    // @Helium 0x1b2470: return roi.
    return roi;
  }

  /**
   * `HGComicBilateralFilter::GetOutput(HGRenderer*)` — @Helium 0x1b2c70.
   * Pushes the two stored parameter groups into `HGNode::SetParameter`
   * (base class, inherited — this is a *self-call* through the C symbol,
   * NOT a vcall) and returns `this`.
   *
   * Asm (verbatim):
   *   0x1b2c79  movss 0x198(%rdi), %xmm0   ; xmm0 = sigma
   *   0x1b2c81  movss 0x19c(%rdi), %xmm1   ; xmm1 = sigmacolor
   *   0x1b2c89  xorps %xmm2, %xmm2         ; xmm2 = 0
   *   0x1b2c8c  xorps %xmm3, %xmm3         ; xmm3 = 0
   *   0x1b2c8f  xorl  %esi, %esi           ; esi = 0
   *   0x1b2c91  callq __ZN6HGNode12SetParameterEiffff  ; base.SetParameter(0, sigma, sigmacolor, 0, 0)
   *   0x1b2c96  movss 0x1a0(%rbx), %xmm0   ; xmm0 = xAxis
   *   0x1b2c9e  movss 0x1a4(%rbx), %xmm1   ; xmm1 = yAxis
   *   0x1b2ca6  xorps %xmm2, %xmm2
   *   0x1b2ca9  xorps %xmm3, %xmm3
   *   0x1b2caf  movl  $1, %esi
   *   0x1b2cb4  callq __ZN6HGNode12SetParameterEiffff  ; base.SetParameter(1, xAxis, yAxis, 0, 0)
   *   0x1b2cb9  movq  %rbx, %rax           ; ret this
   *   0x1b2cc2  ret
   */
  GetOutput(_r: HGRendererStub): HGNode {
    // @Helium 0x1b2c91: HGNode::SetParameter(0, sigma, sigmacolor, 0, 0).
    // This is a NON-VIRTUAL call to the base class implementation.
    HGNode_SetParameter(this, 0, this.sigma, this.sigmacolor, Math.fround(0.0), Math.fround(0.0));
    // @Helium 0x1b2cb4: HGNode::SetParameter(1, xAxis, yAxis, 0, 0).
    HGNode_SetParameter(this, 1, this.xAxis, this.yAxis, Math.fround(0.0), Math.fround(0.0));
    // @Helium 0x1b2cb9: return this.
    return this;
  }

  /**
   * `HGComicBilateralFilter::GetProgram(HGRenderer* r)` — @Helium 0x1b2cd0.
   *
   * Asm (verbatim):
   *   0x1b2cd9  movq %rsi, %rdi
   *   0x1b2cdc  movl $0x60000, %esi
   *   0x1b2ce1  callq __ZN10HGRenderer9GetTargetEj      ; eax = r.GetTarget(0x60000)
   *   0x1b2ce6  cmpl $0x60b0f, %eax
   *   0x1b2ceb  jbe  0x1b2cfb                           ; if target <= 0x60b0f, fall to Metal branch
   *   0x1b2ced  leaq 0x73d8fd(%rip), %rax               ; = @Helium 0x9a05fa (Metal source)
   *   0x1b2cf4  ret                                     ; return Metal ptr
   *   ; ---- target > 0x60b0f branch ----
   *   0x1b2cfb  movq (%rbx), %rax                       ; load vtbl
   *   0x1b2cfe  movq %rbx, %rdi
   *   0x1b2d01  movl $0x2e, %esi
   *   0x1b2d06  callq *0x80(%rax)                        ; vcall *0x80 -> HGNode::shaderDescription-ish(0x2e)
   *   0x1b2d0c  movl %eax, %ecx
   *   0x1b2d10  testl %ecx, %ecx                         ; non-zero -> emit GLfs
   *   0x1b2d12  leaq 0x73e338(%rip), %rcx               ; = @Helium 0x9ae02b (GLfs source)
   *   0x1b2d19  cmovneq %rcx, %rax                      ; result = (ecx != 0) ? &GLfs : 0
   *   0x1b2d23  ret
   *
   * Note: the `jbe` uses UNSIGNED comparison — treating GetTarget's return as u32.
   */
  GetProgram(r: HGRendererStub): string | null {
    // @Helium 0x1b2ce1: r.GetTarget(0x60000) (throws — frontier stub).
    const target = HGRenderer_GetTarget(r, 0x60000) >>> 0;
    // @Helium 0x1b2ce6: `cmpl $0x60b0f, %eax ; jbe` — UNSIGNED comparison.
    if (target <= 0x60b0f) {
      // @Helium 0x1b2ced: return Metal source.
      return HGComicBilateralFilter_MetalSource;
    }
    // @Helium 0x1b2cfb..0x1b2d06: vcall *0x80 (throws — frontier: HGNode vtable slot *0x80).
    const vtblResult = this.vcall_0x80(0x2e);
    if (vtblResult !== 0) {
      // @Helium 0x1b2d19: return GLfs source.
      return HGComicBilateralFilter_GLfsSource;
    }
    // @Helium 0x1b2d19 with ecx==0: cmovneq NOT taken; rax stays 0.
    return null;
  }

  /**
   * HGNode vtable *0x80 — semantically appears to be a "shader-slot query"
   * gated on a numeric arg (0x2e). Not yet transcribed on the base class.
   * @Helium 0x1b2d06 `callq *0x80(%rax)` — the arg is 0x2e (46 decimal).
   */
  private vcall_0x80(_arg: number): number {
    throw new Error(
      'HGNode vtable slot *0x80 not yet transcribed ' +
        '(called from HGComicBilateralFilter::GetProgram @0x1b2d06 with arg 0x2e)',
    );
  }

  /**
   * `HGComicBilateralFilter::BindTexture(HGHandler* h, int texUnit)` — @Helium 0x1b2d30.
   *
   * Asm (verbatim):
   *   0x1b2d3b  movl %edx, %r14d           ; texUnit
   *   0x1b2d3e  movq %rsi, %rbx            ; rbx = h
   *   0x1b2d41  cmpl $1, %edx; je 0x1b2d90 ; texUnit == 1  -> "simple TexCoord" path
   *   0x1b2d46  testl %r14d, %r14d; jne 0x1b2da4 ; texUnit != 0 && != 1 -> skip TexCoord entirely
   *   ; ---- texUnit == 0 path ----
   *   0x1b2d4b  movss 0x214f6d(%rip), %xmm0 ; xmm0 = @Helium 0x3c7cc0 = 1.0f
   *   0x1b2d53  divss 0x1a8(%rdi), %xmm0    ; xmm0 = 1.0f / scale
   *   0x1b2d5b  movss %xmm0, -0x14(%rbp)    ; stash
   *   0x1b2d60  movq  %rbx, %rdi
   *   0x1b2d63  xorl  %esi, %esi; xorl %edx, %edx; xorl %ecx, %ecx; xorl %r8d, %r8d
   *   0x1b2d6c  callq __ZN9HGHandler8TexCoordEiiiPKd   ; h.TexCoord(0, 0, 0, nullptr)
   *   0x1b2d71  movss -0x14(%rbp), %xmm0    ; reload 1/scale
   *   0x1b2d76  cvtss2sd %xmm0, %xmm0        ; (double)(1/scale)
   *   0x1b2d7a  movq (%rbx), %rax
   *   0x1b2d7d  movsd 0x2174db(%rip), %xmm2  ; xmm2 = @Helium 0x3ca260 = 1.0 (double)
   *   0x1b2d85  movq %rbx, %rdi
   *   0x1b2d88  movaps %xmm0, %xmm1          ; xmm1 = 1/scale
   *   0x1b2d8b  callq *0x68(%rax)            ; vcall h.vtbl *0x68 (double, double) — arg 1/scale twice
   *   0x1b2d8e  jmp 0x1b2da4
   *   ; ---- texUnit == 1 path ----
   *   0x1b2d90  movq %rbx, %rdi
   *   0x1b2d93  movl $1, %esi; xorl %edx, %edx; xorl %ecx, %ecx; xorl %r8d, %r8d
   *   0x1b2d9f  callq __ZN9HGHandler8TexCoordEiiiPKd   ; h.TexCoord(1, 0, 0, nullptr)
   *   ; ---- common tail (all paths) ----
   *   0x1b2da4  movq (%rbx), %rax
   *   0x1b2da7  movq %rbx, %rdi
   *   0x1b2daa  movl %r14d, %esi; xorl %edx, %edx
   *   0x1b2daf  callq *0x48(%rax)            ; vcall h.vtbl *0x48 (texUnit, 0)
   *   0x1b2db2  movq (%rbx), %rax
   *   0x1b2db5  movq %rbx, %rdi
   *   0x1b2db8  xorl %esi, %esi
   *   0x1b2bba  callq *0x38(%rax)            ; vcall h.vtbl *0x38 (0)
   *   0x1b2bbd  movq (%rbx), %rax
   *   0x1b2bc0  movq %rbx, %rdi
   *   0x1b2bc3  movl $1, %esi; movl $1, %edx
   *   0x1b2bcd  callq *0x30(%rax)            ; vcall h.vtbl *0x30 (1, 1)
   *   0x1b2bd0  xorl %eax, %eax; ret
   *
   * The `movsd 0x2174db(%rip)` at 0x1b2d7d loads xmm2 to 1.0 (double) but the
   * vtable *0x68 target consumes xmm0/xmm1 as arg1/arg2 (double,double); xmm2 is
   * a dead load (the target's second/third f64 slot is ignored in this call).
   */
  BindTexture(h: HGHandler, texUnit: number): number {
    if (texUnit === 1) {
      // @Helium 0x1b2d90..0x1b2d9f: h.TexCoord(1, 0, 0, null)
      h.TexCoord(1, 0, 0, null);
    } else if (texUnit === 0) {
      // @Helium 0x1b2d4b..0x1b2d53: (double)(1.0f / scale).
      // The asm computes this in single precision then converts to double.
      const invScaleF = Math.fround(Math.fround(1.0) / Math.fround(this.scale));
      // @Helium 0x1b2d6c: h.TexCoord(0, 0, 0, null).
      h.TexCoord(0, 0, 0, null);
      // @Helium 0x1b2d8b: h.vtbl *0x68(1/scale, 1/scale) — both args in double.
      h.vtable.fn0x68(h, invScaleF, invScaleF);
    }
    // else texUnit not in {0,1}: no TexCoord/setup call, fall through to the vtable tail.

    // Common tail — @Helium 0x1b2da4..0x1b2bd0.
    h.vtable.fn0x48(h, texUnit, 0);
    h.vtable.fn0x38(h, 0);
    h.vtable.fn0x30(h, 1, 1);
    // @Helium 0x1b2bd0: xorl eax,eax; ret.
    return 0;
  }

  /**
   * `HGComicBilateralFilter::InitProgramDescriptor(HGProgramDescriptor*) const`
   * — @Helium 0x1b2de0. Body is `pushq %rbp; movq %rsp,%rbp; popq %rbp; ret`
   * — a no-op. The class installs no shader-descriptor overrides beyond what
   * HGNode's default program-slot dispatch provides.
   */
  InitProgramDescriptor(_pd: HGProgramDescriptor): void {
    // @Helium 0x1b2de0..0x1b2de5: empty body.
  }

  /**
   * `HGComicBilateralFilter::RenderTile(HGTile*)` — @Helium 0x1b24f0. 441 lines of
   * SSE-2/SSE-4 tile rendering. Implements the same algorithm as
   * `HGComicBilateralFilter_MetalSource` on the CPU with bilinear texture sampling.
   *
   * NOT yet transcribed. This is a valid partial port per PORTING_SPEC.md rule 3
   * (throw with @0xADDR citation; a loud gap is correct). The SSE control flow
   * is fully decoded in the header comment above (constants + tile field offsets +
   * fast-path branches at @0x1b26f5 / @0x1b2b4c / @0x1b28df); the port is
   * deferred pending a texture-sampling infrastructure (bilinear-sampled HGTile
   * bytes-per-pixel wrapper) that is not yet available in raw-port/src/.
   *
   * @Helium 0x1b24f0 — throws (undecoded CPU-tile transcription).
   */
  RenderTile(_tile: HGTile): number {
    throw new Error(
      'HGComicBilateralFilter::RenderTile not yet transcribed @Helium 0x1b24f0 ' +
        '(CPU SSE tile renderer, 441 lines; the shader in HGComicBilateralFilter_MetalSource ' +
        'is the algorithmic specification; texture-sampling infrastructure required)',
    );
  }
}
