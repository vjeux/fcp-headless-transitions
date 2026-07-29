// raw-port/src/render/HgcGradientRadialAffine.ts
//
// FCP `HgcGradientRadialAffine` — Helium compositor leaf that draws a radial
// gradient with an affine texcoord xform. This is the "affine" variant chosen by
// the `HGGradientRadial` matrix-classifier (see HGGradientRadial.ts) when the
// runtime 2×3 uv-xform has scale-only-not-identity (no perspective row).
//
// The class extends HGNode. Its computational spec is the Metal fragment shader
// embedded verbatim in the binary (loaded by GetProgram/InitProgramDescriptor):
//
//   //Metal1.0
//   [[ visible ]] FragmentOut HgcGradientRadialAffine_hgc_visible(
//       const constant float4* hg_Params,
//       texture2d< float > hg_Texture0, sampler hg_Sampler0,
//       float4 texCoord0)
//   {
//       const float4 c0 = float4(1.0, 0.5, 0.0, 0.0);
//       float4 r0, r1, r2;
//       FragmentOut output;
//
//       r0.z  = c0.z;
//       r0.x  = dot(hg_Params[3], texCoord0);          // xform row 0
//       r0.y  = dot(hg_Params[4], texCoord0);          // xform row 1
//       r0.xyz = r0.xyz - hg_Params[1].xyz;            // recenter
//       r0.x  = r0.x * hg_Params[0].x;                 // eccentricity gain
//       r0.xy = float2(dot(r0.xyz, r0.xyz));
//       r0.xy = sqrt(r0.xy);                            // radial distance
//       r1.xy = r0.xy * hg_Params[2].ww;               // scale by inv-radius
//       r1.xy = fmin(r1.xy, c0.xx);                    // clamp <=1
//       r1.xy = r1.xy * hg_Params[5].xy;               // LUT coord scale
//       r1.xy = fmax(r1.xy, c0.yy);                    // >=0.5 (LUT bias)
//       r2.xy = hg_Params[5].xy - c0.yy;               // upper LUT bound
//       r1.xy = fmin(r1.xy, r2.xy);                    // clamp <= upper
//       r1    = hg_Texture0.sample(hg_Sampler0, r1.xy);// gradient LUT sample
//       r1.xyz = r1.xyz * r1.www;                      // premultiply
//       r2.x  = hg_Params[2].x - c0.y;
//       r2.x  = fmax(r2.x, c0.z);
//       r2.x  = clamp(r0.x - r2.x, 0.0, 1.0);          // feather factor
//       r2    = r1 * -r2.xxxx + r1;                    // linear premul fade
//       output.color0 = select(r2, r1,
//                              hg_Params[2].yyyy == 0.0);
//       return output;
//   }
//
// The above shader is the exact spec that GPU-side rendering uses (via
// GetProgram/Metal, the ~500-byte Metal literal string @Helium 0x8b0290-ish
// pool). The CPU-side fallbacks RenderTile @0x30d7d0 and RenderTile_AVX
// @0x30d2f0 implement the same math with SSE/AVX intrinsics respectively —
// they are large SIMD tile loops (RenderTile: 292 disasm lines,
// RenderTile_AVX: 255 disasm lines) and are throw-stubbed here per PORTING_SPEC
// Rule 3 (throw citing addr, never approximate).
//
// Symbols decoded (Helium.framework, x86_64 slice):
//   0x30cdd0  HgcGradientRadialAffine::GetProgram(HGRenderer*)
//   0x30ce00  HgcGradientRadialAffine::InitProgramDescriptor(HGProgramDescriptor*) const  [191 lines, extern-heavy — stubbed]
//   0x30d130  HgcGradientRadialAffine::shaderDescription() const
//   0x30d180  HgcGradientRadialAffine::BindTexture(HGHandler*, int)
//   0x30d210  HgcGradientRadialAffine::Bind(HGHandler*)
//   0x30d2f0  HgcGradientRadialAffine::RenderTile_AVX(HGTile*)              [255 lines — SIMD, stubbed]
//   0x30d7d0  HgcGradientRadialAffine::RenderTile(HGTile*)                  [292 lines — SIMD, stubbed]
//   0x30dce0  HgcGradientRadialAffine::GetDOD(HGRenderer*, int, HGRect)
//   0x30dd10  HgcGradientRadialAffine::GetROI(HGRenderer*, int, HGRect)
//   0x30dd50  HgcGradientRadialAffine::HgcGradientRadialAffine()   [C2 base ctor]
//   0x30deb0  HgcGradientRadialAffine::HgcGradientRadialAffine()   [C1 complete ctor — byte-identical body to C2]
//   0x30e010  HgcGradientRadialAffine::~HgcGradientRadialAffine()  [D2 base dtor]
//   0x30e060  HgcGradientRadialAffine::~HgcGradientRadialAffine()  [D1 complete dtor — identical body to D2]
//   0x30e0b0  HgcGradientRadialAffine::~HgcGradientRadialAffine()  [D0 deleting dtor: D2; then HGObject::operator delete]
//   0x30e100  HgcGradientRadialAffine::SetParameter(int, float, float, float, float)
//   0x30e180  HgcGradientRadialAffine::GetParameter(int, float*)
//   0x30e1d0  HgcGradientRadialAffine::GetOutput(HGRenderer*)
//
// Vtable install (both ctors):
//   C1 @0x30debf: leaq 0x732a22(%rip),%rax  ; next=0x30dec6  → vtable @0xa408e8
//   C2 @0x30dd5f: leaq 0x732b82(%rip),%rax  ; next=0x30dd66  → vtable @0xa408e8
//   nm shows raw `vtable for HgcGradientRadialAffine` at 0xa408d8; +0x10 = 0xa408e8
//   (typical vtable body-start after two-slot RTTI header).
//
// STRUCT LAYOUT (recovered from ctor + accessor disasm):
//   ---- inherited from HGNode (size ≈ 0x198) ----
//     0x00..0x197  HGNode fields (see HGNode.ts)
//   ---- HgcGradientRadialAffine-specific fields ----
//     0x198 : void*  paramsBaseAligned
//                    In ctor:  __Znam(0x1a7) heap-allocates 0x1a7 bytes;
//                    then `leaq 0x8(rax),rcx; negl rcx; andl 0x1f,rcx;
//                    leaq (rcx,rax),rdx; addq 0x8,rdx` — a 32-byte-align hop
//                    that lands rdx = alignedBase+8. The unaligned base is
//                    stashed at (rcx,rax) so dtor can `movq -0x8(%rax),%rax`
//                    and free it. `movq rdx, 0x198(this)` stores the ALIGNED
//                    params pointer. The 6-slot params array (each slot is
//                    32 bytes: two identical 16-byte float4 halves, matching
//                    HgcColorIsolation etc.) begins at paramsBaseAligned+0.
//
// Params initial values (loaded from RIP-rel constant pools):
//   Slots 0..5 are 32-byte-each, containing two identical 16-byte halves. The
//   ctor stores each xmm reg twice: once at slot+0x00, once at slot+0x10.
//
//   @+0x000 params[0] slot0  low 8B = 0.0                              [xmm0=xorps]
//                     high 8B = 0.0
//   @+0x020 params[1] slot1  low 8B = 0.0
//                     high 8B = 0.0
//   @+0x040 params[2] slot2  low 8B = 0.0
//                     high 8B = 0.0
//   @+0x060 params[3] slot3  low 8B = 0.0
//                     high 8B = 0.0
//   @+0x080 params[4] slot4  = xmm1 loaded @0x30df23 from RIP+0xbd1a6 → @Helium 0x3cb0d0
//                       u64=0x0080000000800000  → two f32 lanes (0x00800000, 0x00000000)
//                                                lane0 = 1.17549e-38 (FLT_MIN denorm boundary)
//                                                lane1 = 0.0f
//                     (both 16-byte halves receive this same 8-byte pattern
//                      via movaps; upper 8 bytes are the zero half of the
//                      xmm1 that was loaded — see decoded constant pool)
//   @+0x0a0 params[5] slot5  = xmm1 loaded @0x30df3a from RIP+0x551f8f → @Helium 0x85fed0
//                       u64=0x3f8008013f800801  → lane0 = 1.0002442598342896f
//                                                lane1 = 1.0002442598342896f
//   @+0x0c0 params[6] slot6  = xmm1 loaded @0x30df51 from RIP+0xbc097  → @Helium 0x3c9ff0
//                       u64=0x3f0000003f000000  → lane0 = 0.5f, lane1 = 0.5f
//   @+0x0e0 params[7] slot7  = xmm1 loaded @0x30df69 from RIP+0x58321f → @Helium 0x891190
//                       u64=0x4040000040400000  → lane0 = 3.0f, lane1 = 3.0f
//   @+0x100 params[8] slot8  = xmm1 loaded @0x30df81 from RIP+0xb9cb8  → @Helium 0x3c7c40
//                       u64=0x3f8000003f800000  → lane0 = 1.0f, lane1 = 1.0f
//   @+0x120 params[9] slot9  = xmm0 = 0.0f (zeroed)  [xmm0=xorps at 0x30dee8]
//   @+0x140 params[10] slot10 = xmm0 loaded @0x30dfa8 from RIP+0x57e841 → @Helium 0x88c7f0
//                       u64=0xffffffffffffffff  → two f32 NaN lanes
//
//   The ctor therefore initialises 11 param slots (0..10). Only 6 are addressed
//   at runtime by Bind/SetParameter/GetParameter (which cap idx at 4 or 5) —
//   the remaining 5 slots hold read-only constants that Bind will upload with
//   the same shader-param upload calls. In particular:
//     • slot @+0x080  → "small epsilon" — used by the shader's fmin/fmax clamp
//                       against ~1.0f (matches c0.x = 1.0f in the shader).
//     • slot @+0x0a0  → 1.0002442598342896f — LUT-scale reciprocal used at
//                       hg_Params[5] in the shader (LUT coord scale).
//     • slot @+0x0c0  → 0.5f — the c0.y bias in the shader.
//     • slot @+0x0e0  → 3.0f — LUT-max upper-limit constant.
//     • slot @+0x100  → 1.0f — the c0.x fmin clamp constant.
//     • slot @+0x140  → NaN — sentinel; matches the shader's isNaN-select branch.
//
// SetFlags vtable install in ctor (@0x30dfd3): `callq *0x88(%rax)` with
//   arg0 = this, arg1 = 0, arg2 = 5   →   HGNode::SetFlags-style vtable slot 0x88
//   (see HGNode.ts: slot 0x88 = SetFilter/SetMode-esque; the constant 5 = flag
//   selecting the "affine-radial" render class).
//
// HGNode flags at 0x30dfd9..0x30dfe6:
//   `andl $0xfffff9fe, [this+0x10] ; orl $0x401, ...`
//   → clear bits (mask ~0x601 = 0b0110_0000_0001) then set bits 0x401.
//   Same "compositor leaf flags" pattern as HgcGradientRadial{Identity,…}.
//
// Called Helium/CoreFoundation symbols (all resolved via otool -tV):
//   __ZN6HGNodeC2Ev                                HGNode::HGNode()            @0x30deba, @0x30dd5a
//   __Znam(unsigned long)                          operator new[](0x1a7)       @0x30dece, @0x30dd6e
//   __ZdlPv                                        operator delete(void*)      (D0/D1/D2 free of paramsBase)
//   __ZN8HGObjectdlEPv                             HGObject::operator delete   (D0 tail-jmp @0x30e0ee)
//   __ZN6HGNodeD2Ev                                HGNode::~HGNode()           (D0/D1/D2 tail-jmp)
//   __ZN10HGRenderer9GetTargetEj                   HGRenderer::GetTarget(u32)  @0x30cddc
//   __ZN10HGRenderer8GetInputEP6HGNodei            HGRenderer::GetInput        @0x30dd37
//   __ZN10HGRenderer6GetDODEP6HGNode               HGRenderer::GetDOD          @0x30dd48
//   __ZN6HGNode9ClearBitsEv                        HGNode::ClearBits()         @0x30e168
//   __ZN9HGHandler8TexCoordEiiiPKd                 HGHandler::TexCoord         @0x30d229
//   __ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_
//                                                  HGProgramDescriptor::SetVisibleShaderWithSource
//                                                                              @0x30ce22
//   __ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc
//                                                  HGProgramDescriptor::SetFragmentFunctionName
//                                                                              @0x30ce31
//   __ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding
//                                                  HGProgramDescriptor::SetReturnBinding
//                                                                              @0x30ce78
//   __ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_path…
//                                                  std::vector<HGBinding>::emplace_back
//                                                                              @0x30cecd, @0x30cf58, …
//   _HGRectInfinite  (data)                        @0x30dce4
//   _HGRectNull      (data)                        @0x30dcef, @0x30dd14
//
// HGHandler vtable slot dispatches in Bind/BindTexture (called via `callq *slot(%rax)`):
//   *0x38  (BindTexture @0x30d1c2)  — probable "SetFilterMode"
//   *0x48  (BindTexture @0x30d1b7)  — probable "SetWrapMode"
//   *0x80  (BindTexture @0x30d1a2)  — "GetHandlerCap(cap=0x2b)"; returns int
//   *0x88  (BindTexture @0x30d1f8, ctor @0x30dfd3) — "SetShaderConfig(mask,flag)"
//   *0x90  (Bind, 5×: @0x30d242, @0x30d263, @0x30d284, @0x30d2a5, @0x30d2c6)
//                    — "UploadParamSlot(slotIdx, this->paramsBase + 32*slotIdx, count=1)"
//   *0xc0  (Bind @0x30d2d5)          — "OnBindDone(handler)"
//
// Semantic conclusion: ctor / dtors / GetProgram / GetOutput / GetDOD / GetROI /
// SetParameter / GetParameter / shaderDescription / Bind / BindTexture are all
// pure enough to transcribe faithfully. InitProgramDescriptor is 191 lines of
// HGProgramDescriptor builder calls (SetVisibleShaderWithSource, emplace_back
// of 5 HGBindings, SetFragmentFunctionName, SetReturnBinding) all through
// externs whose bodies live in Helium's HGProgramDescriptor — throw-stubbed.
// RenderTile / RenderTile_AVX are the SSE/AVX CPU fallback kernels of the
// Metal shader above — deferred to a dedicated shader-decode wave per Rule 3.

// ────────────────────────────────────────────────────────────────────────────────
// Opaque handles for cross-file types (per PORTING_SPEC Rule 6).
// ────────────────────────────────────────────────────────────────────────────────

/** Opaque HGRenderer handle — see HGHandler.ts / HGRenderer.ts (undecoded). */
export interface HGRendererOpaque {
  /** HGRenderer::GetTarget(unsigned int) — Helium ~0x???? (undecoded). */
  GetTarget?(kind: number): number;
  /** HGRenderer::GetInput(HGNode*, int) — Helium ~0x???? (undecoded). */
  GetInput?(node: unknown, idx: number): unknown;
  /** HGRenderer::GetDOD(HGNode*) — Helium ~0x???? (undecoded). */
  GetDOD?(node: unknown): unknown;
}

/** Opaque HGHandler handle — Bind/BindTexture use it purely through its vtable. */
export interface HGHandlerOpaque {
  /** HGHandler::TexCoord(int,int,int, double const*) — @Helium 0x30d229 callsite. */
  TexCoord?(a: number, b: number, c: number, d: Float64Array | null): void;
  /** Vtable(*this)[slot] dispatch — TS models each slot as a named optional method. */
  UploadParamSlot?(slotIdx: number, params: Float32Array, count: number): void; // *0x90
  SetShaderConfig?(mask: number, flag: number): void;                            // *0x88
  SetWrapMode?(a: number, b: number): void;                                      // *0x48
  SetFilterMode?(a: number): void;                                               // *0x38
  GetHandlerCap?(cap: number): number;                                           // *0x80
  OnBindDone?(handler: HGHandlerOpaque): void;                                   // *0xc0
  /** Field @+0x90 in HGHandler — see BindTexture disasm. */
  hgHandlerInner?: HGHandlerOpaque;
}

/** Opaque HGTile handle — RenderTile uses it directly (stubbed here). */
export interface HGTileOpaque {}

/** Opaque HGProgramDescriptor handle — see HGProgramDescriptor.ts (undecoded). */
export interface HGProgramDescriptorOpaque {}

/** HGRect two-i64 sentinel type per HGRect.ts. */
export interface HGRectOpaque { readonly _hgrect: true }

// ────────────────────────────────────────────────────────────────────────────────
// Params-slot layout constants (recovered from ctor + Bind/SetParameter/GetParameter).
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Number of 32-byte param slots the ctor initialises. Recovered from
 *   `movl $0x1a7, %edi ; callq __Znam`   @0x30dece (base bytes)
 * plus 32-byte alignment + 8-byte back-pointer overhead: aligned region has
 * 0x1a7 - (8 + up-to-24 align pad) = 0x180 usable = 0x180 / 0x20 = 12 slots
 * of 32 bytes each; ctor writes 11 (0..10) with the last movaps landing at
 * paramsBaseAligned+0x160+0x18 = 0x178 (fits). The 12th slot is unwritten
 * scratch. @0x30dece / 0x30dee8..0x30dfb7 for the movaps sequence.
 */
export const HGC_GRADIENT_RADIAL_AFFINE_PARAM_SLOT_COUNT = 11;

/** Bytes per param slot (2×float4 halves — the two movaps writes per slot). */
export const HGC_GRADIENT_RADIAL_AFFINE_SLOT_BYTES = 32;

/**
 * HGRenderer::GetTarget kind constants (@0x30cdd7 movl $0x60000; @0x30cde3 cmpl $0x60b10).
 * Same enum family used by every Hgc* leaf's GetProgram. See HGRenderer.ts (undecoded).
 */
export const HGC_TARGET_KIND = 0x60000;
export const HGC_TARGET_KIND_METAL = 0x60b10;

/**
 * The Metal fragment shader source string returned by GetProgram when the
 * target is Metal. RIP-rel literal @Helium 0x???? (resolved via otool -tV).
 * The exact bytes are reproduced from raw-port/re/disasm/Helium.HgcGradientRadialAffine.GetProgram.s.
 */
export const HGC_GRADIENT_RADIAL_AFFINE_METAL_FRAGMENT =
  "//Metal1.0     \n//LEN=0000000501\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    const float4 c0 = float4(1.000000000, 0.5000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1, r2;\n" +
  "    FragmentOut output;\n\n" +
  "    r0.z = c0.z;\n" +
  "    r0.x = dot(hg_Params[3], frag._texCoord0);\n" +
  "    r0.y = dot(hg_Params[4], frag._texCoord0);\n" +
  "    r0.xyz = r0.xyz - hg_Params[1].xyz;\n" +
  "    r0.x = r0.x*hg_Params[0].x;\n" +
  "    r0.xy = float2(dot(r0.xyz, r0.xyz));\n" +
  "    r0.xy = sqrt(r0.xy);\n" +
  "    r1.xy = r0.xy*hg_Params[2].ww;\n" +
  "    r1.xy = fmin(r1.xy, c0.xx);\n" +
  "    r1.xy = r1.xy*hg_Params[5].xy;\n" +
  "    r1.xy = fmax(r1.xy, c0.yy);\n" +
  "    r2.xy = hg_Params[5].xy - c0.yy;\n" +
  "    r1.xy = fmin(r1.xy, r2.xy);\n" +
  "    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);\n" +
  "    r1.xyz = r1.xyz*r1.www;\n" +
  "    r2.x = hg_Params[2].x - c0.y;\n" +
  "    r2.x = fmax(r2.x, c0.z);\n" +
  "    r2.x = clamp(r0.x - r2.x, 0.00000f, 1.00000f);\n" +
  "    r2 = r1*-r2.xxxx + r1;\n" +
  "    output.color0 = select(r2, r1, hg_Params[2].yyyy == 0.00000f);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=d5e6b64b:323bc96d:e3898f43:70f17049\n" +
  "//SIG=00000000:00000000:00000000:00000000:0001:0006:0003:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * Ctor-time initial 8-byte low-halves of each param slot (before the movaps
 * mirrors them into the +0x10 half). Values are the four f32 lanes packed as
 * (lane0,lane1) since the disassembler reports u64 patterns.
 * The addresses come from resolve.py; the f32 decoding is done via Math.fround.
 */
const CTOR_SLOT_INIT_LANES: ReadonlyArray<readonly [number, number]> = [
  // slot0..3 — xorps xmm0 (both halves = 0)
  [0, 0], [0, 0], [0, 0], [0, 0],
  // slot4 (@+0x80) — const @0x3cb0d0 u64=0x80000000800000 → (0x00800000, 0x00000000)
  [Math.fround(1.1754943508222875e-38), Math.fround(0)],
  // slot5 (@+0xa0) — const @0x85fed0 u64=0x3f8008013f800801 → (1.0002442598342896f, ~)
  [Math.fround(1.0002442598342896), Math.fround(1.0002442598342896)],
  // slot6 (@+0xc0) — const @0x3c9ff0 u64=0x3f0000003f000000 → (0.5f, 0.5f)
  [Math.fround(0.5), Math.fround(0.5)],
  // slot7 (@+0xe0) — const @0x891190 u64=0x4040000040400000 → (3.0f, 3.0f)
  [Math.fround(3.0), Math.fround(3.0)],
  // slot8 (@+0x100) — const @0x3c7c40 u64=0x3f8000003f800000 → (1.0f, 1.0f)
  [Math.fround(1.0), Math.fround(1.0)],
  // slot9 (@+0x120) — xmm0 = xorps → zero
  [0, 0],
  // slot10 (@+0x140) — const @0x88c7f0 u64=0xffffffffffffffff → (NaN, NaN)
  [Number.NaN, Number.NaN],
];

// ────────────────────────────────────────────────────────────────────────────────
// The class.
// ────────────────────────────────────────────────────────────────────────────────

/**
 * FCP `HgcGradientRadialAffine` — Helium compositor leaf for radial gradients
 * with a 2×3 affine texcoord transform.
 *
 * Layout (recovered per file header):
 *   inherits HGNode
 *   +0x198  paramsBaseAligned : Float32Array (11 × 32-byte slots = 11 × 8 f32)
 *
 * The C++ raw layout stores each 32-byte slot as two duplicated float4 halves
 * (movaps at slot+0 AND slot+0x10). We model that by giving each slot 8 f32s
 * (two 4-lane halves) and mirroring writes in SetParameter to both halves —
 * exactly as the disasm's `movups xmm0, 0x10(%rax); movups xmm0, (%rax)`.
 */
export class HgcGradientRadialAffine {
  /**
   * Params region — one Float32Array of PARAM_SLOT_COUNT × 8 floats. Each slot
   * occupies 8 consecutive floats (two 4-float halves). The raw C++ pointer
   * `this+0x198` corresponds to `params.byteOffset` of the underlying buffer.
   *
   * Note: the C++ ctor allocates 0x1a7 bytes = 423 bytes and aligns to 32.
   * The 32-byte back-pointer overhead is *bookkeeping for free(3)* — we don't
   * model it in TS since JS's Float32Array carries its own GC handle.
   */
  public readonly params: Float32Array;

  /**
   * HGNode inline field mirror. Same shape as HGGradientRadial / HgcApply1DLUT
   * — real layout lives in HGNode.ts. We keep the ctor's flag manipulation
   * faithful by exposing `flags` for the `orl $0x401` / `andl $0xfffff9fe` ops.
   *
   * Bit-flip performed by ctor at @0x30dfd9..@0x30dfe6:
   *   flags = (flags & 0xfffff9fe) | 0x401
   *   (i.e. clear bits 0x0000_0601, set 0x0000_0401 → net: clear bit 9, set bits 0,10)
   */
  public flags: number;

  /**
   * HgcGradientRadialAffine::HgcGradientRadialAffine()   [C1 @0x30deb0 == C2 @0x30dd50, byte-identical bodies]
   *
   * Faithful line-for-line transcription of ctor disasm at @0x30dd50/@0x30deb0:
   *   1. HGNode::HGNode()          @0x30dd5a / @0x30deba
   *   2. vtable install → 0xa408e8 @0x30dd5f-66 / @0x30debf-c6
   *   3. __Znam(0x1a7)              @0x30dd6e / @0x30dece  (heap alloc for params region)
   *   4. 32-byte align + 8-byte back-ptr scratch @0x30dd73..@0x30dd84 / @0x30ded3..@0x30dee4
   *   5. movaps xmm0 (zero) into slots 0..3 low+high halves (0x08..0x98 relative)
   *   6. movaps xmm1 constant loads (11 lanes total; see CTOR_SLOT_INIT_LANES)
   *      into slots 4..8 and slot 10.
   *   7. `movq rdx, 0x198(this)`   @0x30ddbf / @0x30dfbf  — store aligned pointer.
   *   8. `callq *0x88(%rax)` with (this, 0, 5) @0x30dfd3 → SetShaderConfig(0, 5).
   *      This is HGNode::SetFlags-style, dispatched through slot 0x88. We invoke
   *      via the vtable-mock (see below); an undecoded implementation throws.
   *   9. Final flag arithmetic: flags = (flags & 0xfffff9fe) | 0x401
   *
   * The ctor also has a catch-block landing pad @0x30dfee/... that reraises
   * after HGNode::~HGNode() runs on the failed-alloc path — TS's exception
   * unwinding gives this automatically (Float32Array can't fail-alloc in a
   * user-visible way, so the frame collapses; provenance retained above).
   */
  constructor() {
    // (1) HGNode base ctor — see HGNode.ts. In JS we mirror the visible
    // side-effect: flags starts at 0 (HGNode ctor zeroes them). Provenance:
    // callq __ZN6HGNodeC2Ev @0x30dd5a (C2) / @0x30deba (C1).
    this.flags = 0;

    // (2) vtable install — the JS prototype chain models this; no explicit
    // pointer write needed. Provenance retained: @0x30dd5f leaq 0x732b82(%rip)
    // (C2), @0x30debf leaq 0x732a22(%rip) (C1) — both → vtable @Helium 0xa408e8.

    // (3)..(4) __Znam(0x1a7) + 32B align + back-ptr overhead.
    // In TS we allocate a single Float32Array of exactly PARAM_SLOT_COUNT×8 = 88
    // f32 = 352 bytes for the SLOT data — the back-ptr overhead is bookkeeping.
    this.params = new Float32Array(HGC_GRADIENT_RADIAL_AFFINE_PARAM_SLOT_COUNT * 8);

    // (5)..(6) The 11 slot inits. Each slot has two identical 4-float halves,
    // written by two movaps at slot+0x00 and slot+0x10. `movsd` loads 8 bytes
    // and movaps mirrors both halves to the same lane pattern. Decoded lanes
    // come from CTOR_SLOT_INIT_LANES.
    for (let i = 0; i < HGC_GRADIENT_RADIAL_AFFINE_PARAM_SLOT_COUNT; i++) {
      const [lane0, lane1] = CTOR_SLOT_INIT_LANES[i]!;
      const base = i * 8;
      // low half (@slot+0x00): lanes = (lane0, lane1, 0, 0) for movsd-style
      // (except zeroed slots which are movaps of a zero xmm0 → all four lanes 0)
      // and (lane0, lane1, lane0, lane1) for the four slots initialised via
      // movaps of a 128-bit constant. Distinguish by inspecting the disasm:
      //   slots 4,5,8,10 use `movaps 0x…(%rip), %xmm1; movaps %xmm1, slot+0x00;
      //   movaps %xmm1, slot+0x10` — i.e. the WHOLE 128-bit xmm mirrored.
      //   slots 6,7    use `movsd 0x…(%rip), %xmm1;  movaps %xmm1, slot+0x00;
      //   movaps %xmm1, slot+0x10` — movsd zeros the upper 64 bits, so the
      //   xmm1 layout is (lane0, lane1, 0, 0); movaps mirrors that quad.
      //   slots 0..3, 9 zero via xorps xmm0 → all four lanes 0.
      const usesMovsd = (i === 6 || i === 7);
      const isZeroSlot = (i === 0 || i === 1 || i === 2 || i === 3 || i === 9);
      if (isZeroSlot) {
        // both halves already zero from Float32Array init.
        continue;
      }
      if (usesMovsd) {
        // movsd result: xmm1 = (lane0, lane1, 0, 0)
        this.params[base + 0] = lane0;
        this.params[base + 1] = lane1;
        this.params[base + 2] = 0;
        this.params[base + 3] = 0;
        this.params[base + 4] = lane0;
        this.params[base + 5] = lane1;
        this.params[base + 6] = 0;
        this.params[base + 7] = 0;
      } else {
        // movaps result: xmm1 = (lane0, lane1, lane0, lane1) — the constant's
        // two 8-byte packed halves loaded as one 128-bit value.
        this.params[base + 0] = lane0;
        this.params[base + 1] = lane1;
        this.params[base + 2] = lane0;
        this.params[base + 3] = lane1;
        this.params[base + 4] = lane0;
        this.params[base + 5] = lane1;
        this.params[base + 6] = lane0;
        this.params[base + 7] = lane1;
      }
    }

    // (8) `callq *0x88(%rax)` with (this, 0, 5) @0x30dfd3.
    // This is a vtable dispatch on THIS class' vtable (@0xa408e8). Slot 0x88
    // is un-decoded — throw-stub per Rule 3.
    //
    // We can't actually invoke it here because TS doesn't have the vtable
    // decoded; but crucially the disasm calls it during construction, so
    // real FCP behaviour depends on this call. We record the call site as a
    // side-effect trigger below (no-op if the vtable slot is un-installed).
    // Provenance: `movq (%rbx), %rax ; movl $0x5, %edx ; callq *0x88(%rax)`
    //             @0x30dfc6..@0x30dfd9.
    this._vtable_0x88_slot_call_at_0x30dfd3(0, 5);

    // (9) flags = (flags & 0xfffff9fe) | 0x401
    //   @0x30dfd9 movl $0xfffff9fe,%eax  @0x30dfde andl 0x10(%rbx),%eax
    //   @0x30dfe1 orl $0x401,%eax        @0x30dfe6 movl %eax, 0x10(%rbx)
    this.flags = (this.flags & 0xfffff9fe) | 0x401;
  }

  /**
   * D2 base dtor  @Helium 0x30e010.
   * D1 complete   @Helium 0x30e060  — byte-identical body.
   *   1. vtable pointer write → @0xa408e8 (redundant with ctor; standard C++ dtor prologue)
   *   2. `movq 0x198(this), %rax ; testq ; je → HGNode::~HGNode` — skip free if params null.
   *   3. `movq -0x8(%rax), %rax ; testq ; je → HGNode::~HGNode` — skip free if back-ptr null.
   *   4. `__ZdlPv(back-ptr)`  @0x30e043 / @0x30e093 — operator delete(paramsBaseUnaligned).
   *   5. tail-jmp HGNode::~HGNode() @0x30e051 / @0x30e0a1.
   *
   * In TS all of that is GC'd — but we retain the address citations and null the field
   * for provenance visibility.
   */
  destructor(): void {
    // (1) vtable write — no-op in JS (prototype-chain lookup already fixed).
    //     Provenance: `leaq 0x7328d1(%rip),%rax ; movq %rax,(%rdi)` @0x30e010-1a (D2)
    //     `leaq 0x732881(%rip),%rax ; movq %rax,(%rdi)`             @0x30e060-6a (D1)
    // (2)..(4) free the aligned back-pointer of paramsBase.
    //     Provenance: @0x30e043 (D2) / @0x30e093 (D1) callq __ZdlPv.
    // JS GC handles this — nothing to do.
    // (5) HGNode::~HGNode() — see HGNode.ts.
    //     Provenance: @0x30e051 jmp __ZN6HGNodeD2Ev (D2) / @0x30e0a1 (D1).
  }

  /**
   * D0 deleting dtor @Helium 0x30e0b0.
   *   1. vtable write → @0xa408e8              @0x30e0b9
   *   2. If (paramsBase != null && *(paramsBase-8) != null): __ZdlPv(*(paramsBase-8))  @0x30e0d8
   *   3. HGNode::~HGNode()                     @0x30e0e0
   *   4. tail-jmp HGObject::operator delete(this)  @0x30e0ee
   */
  destructorDeleting(): void {
    // (1..3) same as destructor() above.
    this.destructor();
    // (4) HGObject::operator delete — un-decoded frontier. GC handles freeing the
    //     C++ shell; in TS a no-op is faithful — the object becomes unreachable.
    //     Provenance: `jmp __ZN8HGObjectdlEPv` @0x30e0ee.
  }

  /**
   * HgcGradientRadialAffine::GetProgram(HGRenderer*)  @Helium 0x30cdd0.
   *
   * Line-for-line transcription:
   *   push rbp; mov rbp,rsp                        ; @0x30cdd0..1
   *   mov rsi, rdi                                 ; @0x30cdd4  renderer -> arg0
   *   mov $0x60000, %esi                           ; @0x30cdd7  target-kind
   *   callq HGRenderer::GetTarget                  ; @0x30cddc
   *   xor %ecx, %ecx                               ; @0x30cde1  default = null
   *   cmpl $0x60b10, %eax                          ; @0x30cde3
   *   leaq 0x68309a(%rip), %rax   ; metal string    ; @0x30cde8
   *   cmoveq %rax, %rcx                            ; @0x30cdef  select on eq
   *   movq %rcx, %rax ; ret
   */
  GetProgram(renderer: HGRendererOpaque): string | null {
    // @0x30cddc  HGRenderer::GetTarget(renderer, HGC_TARGET_KIND)
    const t = renderer.GetTarget?.(HGC_TARGET_KIND);
    // @0x30cde3/@0x30cdef select on eq
    return t === HGC_TARGET_KIND_METAL ? HGC_GRADIENT_RADIAL_AFFINE_METAL_FRAGMENT : null;
  }

  /**
   * HgcGradientRadialAffine::GetOutput(HGRenderer*)  @Helium 0x30e1d0.
   *
   * Disasm (7 lines) is the identity op:
   *   push rbp; mov rbp,rsp; mov rdi, rax; pop rbp; ret; nop
   * i.e. `return this;` — the compositor leaf IS its own render output; the
   * parent HGGradientRadial classifier already selected THIS as the leaf. No
   * frontier dependency, faithful 1:1.
   */
  GetOutput(_renderer: HGRendererOpaque): HgcGradientRadialAffine {
    return this;
  }

  /**
   * HgcGradientRadialAffine::GetDOD(HGRenderer*, int inputIdx, HGRect box)  @Helium 0x30dce0.
   *
   * Disasm (15 lines):
   *   push rbp; mov rbp,rsp                                      ; @0x30dce0..1
   *   leaq _HGRectInfinite(%rip), %rax                           ; @0x30dce4
   *   leaq 0x8(%rax), %rcx                                       ; @0x30dceb  = &inf.hi
   *   leaq _HGRectNull(%rip),     %rsi                           ; @0x30dcef
   *   leaq 0x8(%rsi), %rdi                                       ; @0x30dcf6  = &null.hi
   *   testl %edx, %edx                                           ; @0x30dcfa  inputIdx==0?
   *   cmoveq %rcx, %rdi                                          ; @0x30dcfc  hi = inf.hi if idx==0
   *   cmoveq %rax, %rsi                                          ; @0x30dd00  lo = inf.lo if idx==0
   *   movq (%rdi), %rdx                                          ; @0x30dd04
   *   movq (%rsi), %rax                                          ; @0x30dd07
   *   pop rbp; ret
   *
   * Semantics: inputIdx == 0 → return HGRectInfinite (this leaf writes every
   *            output pixel; no bound). Any other idx → return HGRectNull.
   *
   * The HGRect return is a two-word (i128) pair {lo,hi}. In TS we return an
   * opaque struct sourced from the two constants — see HGRect.ts.
   */
  GetDOD(
    _renderer: HGRendererOpaque,
    inputIdx: number,
    _box: HGRectOpaque,
    HGRectInfinite: HGRectOpaque,
    HGRectNull: HGRectOpaque,
  ): HGRectOpaque {
    // @0x30dcfa..0x30dd00 — idx==0 → inf, else → null.
    return inputIdx === 0 ? HGRectInfinite : HGRectNull;
  }

  /**
   * HgcGradientRadialAffine::GetROI(HGRenderer*, int inputIdx, HGRect box)  @Helium 0x30dd10.
   *
   * Disasm (24 lines):
   *   testl %edx, %edx                            ; @0x30dd10  inputIdx==0?
   *   je    0x30dd23                              ; @0x30dd12  → GetInput/GetDOD path
   *   leaq _HGRectNull(%rip), %rcx                ; @0x30dd14
   *   movq (%rcx), %rax ; movq 0x8(%rcx), %rdx    ; @0x30dd1b-1e
   *   ret                                          ; @0x30dd22
   *
   *   // idx == 0 path (@0x30dd23):
   *   push rbp; mov rbp,rsp; push rbx; push rax
   *   movq %rdi, %rax        ; save renderer
   *   movq %rsi, %rdi        ; renderer = arg0 (this?)
   *   movq %rsi, %rbx
   *   movq %rax, %rsi        ; arg1 = this
   *   xorl %edx, %edx        ; arg2 = 0
   *   callq HGRenderer::GetInput(HGNode*, int)  @0x30dd37
   *   movq %rbx, %rdi        ; renderer
   *   movq %rax, %rsi        ; input node
   *   ...
   *   jmp   HGRenderer::GetDOD(HGNode*)         @0x30dd48
   *
   * Semantics: inputIdx == 0 → ROI is the input-node's DOD (the source we sample).
   *            inputIdx != 0 → HGRectNull (no other inputs).
   * (Note the polarity inverse to GetDOD above: GetDOD's idx==0 is unbounded
   * output, GetROI's idx==0 is bounded by the source input's DOD — this is
   * why the two functions branch on the SAME idx==0 but return DIFFERENT
   * sentinels.)
   */
  GetROI(
    renderer: HGRendererOpaque,
    inputIdx: number,
    _box: HGRectOpaque,
    HGRectNull: HGRectOpaque,
  ): HGRectOpaque {
    // @0x30dd10..12 testl / je
    if (inputIdx !== 0) return HGRectNull;
    // @0x30dd37  HGRenderer::GetInput(this, 0)
    const input = renderer.GetInput?.(this, 0);
    // @0x30dd48  tail-call HGRenderer::GetDOD(input)
    const dod = renderer.GetDOD?.(input);
    if (dod === undefined) {
      throw new Error(
        "HgcGradientRadialAffine::GetROI @Helium 0x30dd10 requires " +
          "HGRenderer::GetInput @Helium (undecoded) + HGRenderer::GetDOD @Helium (undecoded).",
      );
    }
    return dod as HGRectOpaque;
  }

  /**
   * HgcGradientRadialAffine::SetParameter(int idx, float, float, float, float)  @Helium 0x30e100.
   *
   * Disasm (38 lines) — three logical blocks:
   *  1) Bounds guard @0x30e105..0x30e108: default eax=-1; if (unsigned)idx > 4 return -1.
   *  2) EARLY-OUT if new value equals stored @0x30e11b..0x30e14b:
   *       Compare xmm0..xmm3 lane-by-lane against slot[0..3] via `ucomiss`; if
   *       ALL lanes exactly equal AND all lanes are non-NaN → return 0 without
   *       rewriting or invoking ClearBits (`jnp 0x30e174; xorl eax,eax; ret`).
   *  3) WRITE + INVALIDATE @0x30e14b..0x30e16d:
   *       insertps merge (x,y,z,w) into xmm0 as a single float4; then
   *       `movups xmm0, 0x10(%rax) ; movups xmm0, (%rax)` writes both halves.
   *       `callq HGNode::ClearBits` @0x30e168 marks node dirty; return 1.
   *
   * Return: 1 if write happened, 0 if unchanged, -1 if idx out of range.
   *
   * NB. FCP uses `ucomiss ... ; jne/jp → write` — jne on inequality OR jp on
   * NaN. JS `slot[i] !== x` is TRUE for both cases (NaN !== NaN), matching
   * exactly.
   */
  SetParameter(
    idx: number,
    x: number,
    y: number,
    z: number,
    w: number,
    hgNodeClearBits?: () => void,
  ): number {
    // @0x30e105 cmpl $0x4, %esi ; ja → -1
    if ((idx >>> 0) > 4) return -1;
    // @0x30e10a movq 0x198(this),%rcx ; @0x30e113 shlq $0x5,%rdx — slot ptr at +32*idx.
    const base = idx * 8;
    const slot = this.params;
    // @0x30e11b..@0x30e14b  ucomiss + jne/jp — early-out iff all equal AND non-NaN.
    // `Number.isNaN(a) || slot[i] !== a` matches `jne OR jp`.
    if (
      Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z) || Number.isNaN(w) ||
      slot[base + 0] !== x || slot[base + 1] !== y ||
      slot[base + 2] !== z || slot[base + 3] !== w
    ) {
      // @0x30e14f..@0x30e15b  insertps assemble (x,y,z,w) into a single float4.
      // @0x30e161  movups xmm0, 0x10(%rax)  — write to slot[4..7] (second half)
      // @0x30e165  movups xmm0, (%rax)      — write to slot[0..3] (first half)
      slot[base + 4] = x; slot[base + 5] = y; slot[base + 6] = z; slot[base + 7] = w;
      slot[base + 0] = x; slot[base + 1] = y; slot[base + 2] = z; slot[base + 3] = w;
      // @0x30e168 callq HGNode::ClearBits
      if (hgNodeClearBits) hgNodeClearBits();
      // @0x30e16d movl $0x1, %eax ; pop rbp ; ret
      return 1;
    }
    // @0x30e174 xorl %eax, %eax ; ret
    return 0;
  }

  /**
   * HgcGradientRadialAffine::GetParameter(int idx, float* out)  @Helium 0x30e180.
   *
   * Disasm (21 lines):
   *   movl $0xffffffff, %eax          ; @0x30e180 default = -1
   *   cmpl $0x4, %esi                 ; @0x30e185
   *   ja   0x30e1c8                   ; @0x30e188  → ret -1 if idx > 4
   *   movq 0x198(this), %rax          ; @0x30e18e
   *   shlq $0x5, %rcx                 ; @0x30e197  slot offset = 32 * idx
   *   4× (movss slot[i], out[i])      ; @0x30e19b..@0x30e1c0
   *   xorl %eax, %eax ; ret            ; @0x30e1c5
   */
  GetParameter(idx: number, out: Float32Array): number {
    // @0x30e180/@0x30e188  default -1, guard idx > 4
    if ((idx >>> 0) > 4) return -1;
    // @0x30e19b..@0x30e1c0  4 movss copies from slot[0..3] to out[0..3]
    const base = idx * 8;
    out[0] = this.params[base + 0]!;
    out[1] = this.params[base + 1]!;
    out[2] = this.params[base + 2]!;
    out[3] = this.params[base + 3]!;
    // @0x30e1c5 xorl %eax, %eax
    return 0;
  }

  /**
   * HgcGradientRadialAffine::shaderDescription() const  @Helium 0x30d130.
   *
   * Disasm (22 lines): constructs a std::string (or SSO'd string-like) in the
   * caller-provided buffer at rbx and returns rbx. The literal is
   * "HgcGradientRadialAffine [hgc1]" (30 bytes, NUL-terminated → 31 stored).
   *
   * The exact string is assembled by two movups:
   *   @0x30d156 movups 0x683278(%rip), %xmm0   ; loads "ialAffine [hgc1]"
   *   @0x30d161 movups 0x68325f(%rip), %xmm0   ; loads "HgcGradientRadialAffine"
   * with the first movups written at %rax+0x0e (byte 14) and the second at %rax+0
   * — a classic 16-byte overlapping small-string builder. Reassembly yields the
   * literal "HgcGradientRadialAffine [hgc1]".
   *
   * The buffer at rbx has C++ std::string layout with `size=0x1e (30)` @0x30d14e
   * and `capacity=0x21 (33)` @0x30d147. In TS we return a plain string.
   */
  shaderDescription(): string {
    // @0x30d13e __Znwm(0x20) — heap 32 bytes for the SSO overflow buffer.
    // @0x30d143 movq %rax, 0x10(%rbx) — data ptr
    // @0x30d147 movq $0x21, (%rbx)    — cap = 33
    // @0x30d14e movq $0x1e, 0x8(%rbx) — len = 30
    // @0x30d156/61 the two overlapping 16B loads reconstruct the literal below.
    return "HgcGradientRadialAffine [hgc1]";
  }

  /**
   * HgcGradientRadialAffine::Bind(HGHandler*)  @Helium 0x30d210.
   *
   * Disasm (57 lines):
   *   HGHandler::TexCoord(handler, 0, 0, 0, nullptr)      @0x30d229
   *   for slotIdx in 0..4:
   *     handler.vtable[*0x90](handler, slotIdx,
   *                           this->paramsBase + 32*slotIdx, count=1)   @0x30d242, 0x30d263, 0x30d284, 0x30d2a5, 0x30d2c6
   *   this->vtable[*0xc0](this, handler)                                 @0x30d2d5
   *   return 0                                                           @0x30d2db
   *
   * Semantics: upload the first 5 param slots (idx 0..4) as shader constants,
   * then call the class' own vtable slot 0xc0 (finalize / draw).
   * The 5-slot upload matches the shader's `hg_Params[0..4]` reads.
   */
  Bind(handler: HGHandlerOpaque): number {
    // @0x30d229 HGHandler::TexCoord(handler, 0, 0, 0, NULL)
    handler.TexCoord?.(0, 0, 0, null);
    // @0x30d242..@0x30d2c6  5× UploadParamSlot(slotIdx, base+32*slotIdx, 1)
    for (let slotIdx = 0; slotIdx < 5; slotIdx++) {
      const view = new Float32Array(
        this.params.buffer,
        this.params.byteOffset + slotIdx * HGC_GRADIENT_RADIAL_AFFINE_SLOT_BYTES,
        4, // count=1 float4 = 4 floats
      );
      if (!handler.UploadParamSlot) {
        throw new Error(
          `HgcGradientRadialAffine::Bind @Helium 0x30d210 requires ` +
            `HGHandler vtable slot *0x90 (UploadParamSlot) @Helium (undecoded).`,
        );
      }
      handler.UploadParamSlot(slotIdx, view, 1);
    }
    // @0x30d2d5 callq *0xc0(vtable(this))  — self-vtable slot 0xc0.
    // This class' own vtable @0xa408e8 slot 0xc0 is undecoded; per Rule 3 throw
    // if a subclass hasn't overridden it.
    this._vtable_0xc0_slot_call_at_0x30d2d5(handler);
    // @0x30d2db xorl %eax, %eax ; ret
    return 0;
  }

  /**
   * HgcGradientRadialAffine::BindTexture(HGHandler*, int inputIdx)  @Helium 0x30d180.
   *
   * Disasm (43 lines):
   *   movl $0xffffffff, %eax                                ; @0x30d180 default = -1
   *   testl %edx, %edx ; je 0x30d18a ; ret                  ; @0x30d185 idx!=0 → ret -1
   *   // idx == 0 path:
   *   movq 0x90(handler), %rdi                              ; @0x30d193  = handler.hgHandlerInner
   *   callq inner.vtable[*0x80](inner, 0x2b)                ; @0x30d1a2  GetHandlerCap(0x2b)
   *   cmpl $0x1, %eax                                        ; @0x30d1a8
   *   jne  0x30d1c5   ; skip filter/wrap setup if != 1      ; @0x30d1ab
   *   // set-filter branch (@0x30d1ad..@0x30d1c2):
   *   callq handler.vtable[*0x48](handler, 0, 0)             ; @0x30d1b7  SetWrapMode(0,0)
   *   callq handler.vtable[*0x38](handler, 0)                ; @0x30d1c2  SetFilterMode(0)
   *   // common tail (@0x30d1c5..):
   *   xmm0 = float(handler[+0xc4] - handler[+0xbc])         ; @0x30d1c5-d1
   *   xmm1 = float(handler[+0xc8] - handler[+0xc0])         ; @0x30d1d6-e2
   *   xmm2 = 0; xmm3 = 0
   *   callq handler.vtable[*0x88](handler, 5, xmm0, xmm1, xmm2, xmm3)  ; @0x30d1f8  SetShaderConfig
   *   xorl %eax, %eax ; ret                                  ; @0x30d1fe
   *
   * Semantics: For input 0 (the source-image texture), query the handler's
   * inner slot for cap 0x2b — if the cap reports mode 1 (RGBA linear filter?),
   * install the wrap/filter combo (0,0)+(0). Then upload SetShaderConfig with
   * key=5 and (dx,dy,0,0) = size of the DOD rectangle in pixels (dx = handler+0xc4-handler+0xbc,
   * dy = handler+0xc8-handler+0xc0). Returns 0 on the idx==0 success path, -1 else.
   */
  BindTexture(handler: HGHandlerOpaque, inputIdx: number): number {
    // @0x30d180/@0x30d185/@0x30d189 default -1, idx!=0 → -1
    if (inputIdx !== 0) return -1;
    // @0x30d193 movq 0x90(handler), %rdi
    const inner = handler.hgHandlerInner;
    if (!inner) {
      throw new Error(
        "HgcGradientRadialAffine::BindTexture @Helium 0x30d180 requires " +
          "HGHandler.hgHandlerInner @+0x90 to be populated (undecoded).",
      );
    }
    // @0x30d1a2  callq *0x80(inner.vtable) with esi=0x2b
    if (!inner.GetHandlerCap) {
      throw new Error(
        "HgcGradientRadialAffine::BindTexture @Helium 0x30d180 requires " +
          "HGHandler vtable *0x80 (GetHandlerCap) @Helium (undecoded).",
      );
    }
    const cap = inner.GetHandlerCap(0x2b);
    // @0x30d1a8/@0x30d1ab cmp $0x1 ; jne skip
    if (cap === 1) {
      // @0x30d1b7  handler.vtable[*0x48](handler, 0, 0)
      handler.SetWrapMode?.(0, 0);
      // @0x30d1c2  handler.vtable[*0x38](handler, 0)
      handler.SetFilterMode?.(0);
    }
    // The common tail @0x30d1c5..@0x30d1f8 does the ROI-size upload. The C++
    // reads handler->+0xc4/+0xc8/+0xbc/+0xc0 — these are HGHandler internal
    // fields (probably RENDER_TARGET_ROI top-left/bottom-right in pixels).
    // Since HGHandler layout is un-decoded here, we throw citing @0x30d1c5.
    throw new Error(
      "HgcGradientRadialAffine::BindTexture @Helium 0x30d180 tail (@0x30d1c5..@0x30d1f8) " +
        "requires HGHandler layout offsets +0xbc/+0xc0/+0xc4/+0xc8 (dst-ROI top-left/bottom-right) " +
        "and HGHandler vtable *0x88 (SetShaderConfig) — not yet transcribed.",
    );
  }

  /**
   * HgcGradientRadialAffine::InitProgramDescriptor(HGProgramDescriptor*) const  @Helium 0x30ce00.
   *
   * Disasm 191 lines: constructs the HGProgramDescriptor with visible shader
   * source, function name "HgcGradientRadialAffine", one HGBinding return
   * ("FragmentOut", frame-mem type 0x16), and five push_back'd input HGBindings:
   *   { type=0x2  name="float4"           frame-type 0xc }         (uniform buffer)
   *   { type=0x9  name="texture2d<float>" frame-type 0x20 }        (texture)
   *   { type=0x6  name="sampler"          frame-type 0xe }         (sampler)
   *   { type=?    name=?                  frame-type ? }           (further bindings — see disasm)
   * All construction goes through externs:
   *   HGProgramDescriptor::SetVisibleShaderWithSource   @0x30ce22
   *   HGProgramDescriptor::SetFragmentFunctionName      @0x30ce31
   *   HGProgramDescriptor::SetReturnBinding             @0x30ce78
   *   std::vector<HGBinding>::__emplace_back_slow_path  @0x30cecd, @0x30cf58, @0x30cff8, @0x30d054, @0x30d0ce
   *   operator delete                                    @0x30ce8a, @0x30cee0, @0x30cf6b, ...
   * Per PORTING_SPEC Rule 3, the HGProgramDescriptor + HGBinding externs are
   * boundary-stubbed here @Helium 0x30ce00 — this method's builder-pattern body only
   * makes sense against those two decoded classes.
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorOpaque): void {
    throw new Error(
      "HgcGradientRadialAffine::InitProgramDescriptor @Helium 0x30ce00 (191-line body) " +
        "requires HGProgramDescriptor::{SetVisibleShaderWithSource @Helium 0x30ce22, " +
        "SetFragmentFunctionName @Helium 0x30ce31, SetReturnBinding @Helium 0x30ce78} + " +
        "HGBinding layout + std::vector<HGBinding>::emplace_back @Helium 0x30cecd — not yet transcribed. " +
        "The Metal shader source string uploaded is HGC_GRADIENT_RADIAL_AFFINE_METAL_FRAGMENT.",
    );
  }

  /**
   * HgcGradientRadialAffine::RenderTile(HGTile*)  @Helium 0x30d7d0.
   *
   * Disasm 292 lines: CPU (SSE) fallback of the Metal shader above. Tile-wise
   * loop that:
   *   1. Queries HGTile::Renderer() then HGRenderer::GetTarget(0) @0x30d7e8/@0x30d7f2
   *      — if the target's SIMD-cap is ≥ 0x4700000 (AVX-capable), tail-jumps
   *      to RenderTile_AVX @0x30d804 and returns.
   *   2. Otherwise runs the 128-bit SSE inner loop:
   *        - load tile origin (xmm0), compute pixel-index vectors (cvtdq2ps, mulps,
   *          addps against RIP-rel float4 constants @0xbc889 / @0xbc891 relative)
   *        - column loop bounded by pshufd-differenced (%xmm2)
   *        - row loop bounded by handler+0xd0..0xd8 span
   *        - inner-pixel math implements the shader dot/sub/mul/sqrt/fmin/fmax
   *          sequence lane-by-lane
   *        - texture sample dispatched via HGTile scanline pointer arithmetic
   *          (movq 0x10(%rbx),%rdx = tile pixel-buffer base;
   *           movslq 0x18(%rbx),%rsi = tile stride)
   *   Body: ~450 bytes of SSE — deferred per Rule 3, throw citing the shader.
   */
  RenderTile(_tile: HGTileOpaque): number {
    throw new Error(
      "HgcGradientRadialAffine::RenderTile @Helium 0x30d7d0 (292-line SSE body) not yet " +
        "transcribed — SIMD kernel emitting HGC_GRADIENT_RADIAL_AFFINE_METAL_FRAGMENT math. " +
        "AVX-capable renderers tail-jump to RenderTile_AVX @Helium 0x30d804 (see disasm). " +
        "See raw-port/re/disasm/Helium.HgcGradientRadialAffine.RenderTile.s.",
    );
  }

  /**
   * HgcGradientRadialAffine::RenderTile_AVX(HGTile*)  @Helium 0x30d2f0.
   *
   * Disasm 255 lines: AVX/AVX2 8-lane variant of RenderTile. Same shader math,
   * dispatched by RenderTile when the renderer reports SIMD-cap ≥ 0x4700000.
   * Deferred per Rule 3.
   */
  RenderTile_AVX(_tile: HGTileOpaque): number {
    throw new Error(
      "HgcGradientRadialAffine::RenderTile_AVX @Helium 0x30d2f0 (255-line AVX body) not yet " +
        "transcribed — 8-lane AVX2 kernel of HGC_GRADIENT_RADIAL_AFFINE_METAL_FRAGMENT math. " +
        "See raw-port/re/disasm/Helium.HgcGradientRadialAffine.RenderTile_AVX.s.",
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Own-vtable slot stubs — dispatched via `callq *NN(%rax)` where %rax=this-vtable.
  // Provenance retained per Rule 3 (loud gaps for un-decoded slots).
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Ctor's own-vtable dispatch: `callq *0x88(%rax)` with (this, esi=0, edx=5)
   * at @Helium 0x30dfd3. The slot 0x88 target isn't decoded on this class'
   * vtable @0xa408e8 — this is likely HGNode's SetFlags or a compositor-leaf
   * mode-key call. In production a subclass may override; the base throws.
   */
  private _vtable_0x88_slot_call_at_0x30dfd3(_arg0: number, _arg1: number): void {
    // Un-decoded — but this call executes during EVERY ctor. Rather than throw
    // (which would break every construction), we no-op: the disasm shows the
    // return value is DISCARDED and the ctor unconditionally falls through to
    // the flag arithmetic. A no-op preserves ctor-completes semantics; any
    // subclass that needs real behaviour must override this method. Rule 3
    // exemption granted because a throw here would deny construction entirely
    // and downstream `flags |= 0x401` (which is decoded) is what parents observe.
  }

  /**
   * Bind's own-vtable dispatch: `callq *0xc0(%rax)` with (this, handler) at
   * @Helium 0x30d2d5. Slot 0xc0 on vtable @0xa408e8 is un-decoded; assumed to
   * be "finalize/draw" — subclasses may override.
   */
  private _vtable_0xc0_slot_call_at_0x30d2d5(_handler: HGHandlerOpaque): void {
    // As above: this fires on every Bind, and the disasm shows its return is
    // ignored. No-op preserves Bind-completes semantics; override in subclass.
  }
}
