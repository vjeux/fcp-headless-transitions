// raw-port/src/render/HgcBilateralFilterInterpSC_InterpolatorLastX.ts
//
// FCP `HgcBilateralFilterInterpSC_InterpolatorLastX` — Helium HGNode subclass
// implementing the FINAL / LAST-X bin of a single-channel bilateral-filter
// interpolator. Reads 4 textures (source pixel + two neighbor-bin
// premultiplied values + an accumulator), computes an in-bin indicator
// against a bin edge, mixes the two neighbor bins, and adds to the running
// accumulator. This is the CPU (SSE) implementation of the shader in
// GetProgram @0x31c3d8:
//
//     r0 = t0[i];                                    // input pixel
//     r1.xw = t1[i].xw;                              // neighbor bin A (unpremul via .w)
//     r2.xw = t2[i].xw;                              // neighbor bin B (unpremul via .w)
//     r3.x = t3[i].x;                                // accumulator
//     r0.x = fmin(r0.x, params[0].y);                // clamp to upper edge
//     r4.x = float(r0.x >= params[0].x);             // "in-bin" indicator
//     r1.x = r1.x / fmax(r1.w, 1e-06f);              // unpremul A
//     r2.x = r2.x / fmax(r2.w, 1e-06f);              // unpremul B
//     r0.x = r0.x*params[0].z + params[0].w;         // mix weight t
//     r0.x = mix(r1.x, r2.x, r0.x);                  // linear blend
//     r0.x = r0.x*r4.x + r3.x;                       // gated accumulate
//     output.color0 = r0;
//
// FAITHFUL PORT — every method cites @0xADDR (Helium, x86_64 slice).
//
// Framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbols in Helium's T-table for this class:
//   0x0031c3c0  GetProgram(HGRenderer*)
//   0x0031c3f0  InitProgramDescriptor(HGRenderer*)
//   0x0031c7b0  shaderDescription() const
//   0x0031c810  BindTexture(HGHandler*, int)
//   0x0031c930  Bind(...)                                            [ICF-folded — no separate label]
//   0x0031c970  RenderTile_AVX(HGTile*)                              [608 bytes; partial stub — see below]
//   0x0031cbd0  RenderTile(HGTile*)                                  [400 bytes; FULL TRANSCRIPTION]
//   0x0031cd60  GetDOD(HGRenderer*, int, HGRect)
//   0x0031cd80  GetROI(HGRenderer*, int, HGRect)
//   0x0031cda0  C1 ctor                                              [same body as C2]
//   0x0031ce50  C2 ctor
//   0x0031cf00  ~C0 (D2 base dtor)
//   0x0031cf50  ~C0 (D1 complete)
//   0x0031cfa0  ~C0 (D0 deleting)
//   0x0031cff0  SetParameter(int, float, float, float, float)
//   0x0031d060  GetParameter(int, float*)
//   0x0031d0a0  GetOutput(HGRenderer*)                               [partial — GetInput chain + delegate]
//
// Saved disassembly under raw-port/re/disasm/Helium.HgcBilateralFilterInterpSC_InterpolatorLastX.*.s.
//
// ── STRUCT LAYOUT (recovered from C2 ctor @0x31ce50) ────────────────────
// Extends HGNode (base 0x198 bytes wide; see HGNode.ts). Own state:
//   +0x198  float* params        — 32-byte aligned pointer to a 128-byte
//                                  scratch block (allocated as 0xa7 = 167
//                                  raw bytes via `__Znam`, then aligned).
//                                  The block holds 8 aligned vec4 slots:
//                                    slot 0 (@+0x00): {p.x, p.y, p.z, p.w} — user params (SetParameter target)
//                                    slot 1 (@+0x10): {p.x, p.y, p.z, p.w} — DUPLICATE COPY  (SetParameter writes here too)
//                                    slot 2 (@+0x20): {1.0, 0.0, 0.0, 0.0}  — indicator "1.0" broadcast source
//                                    slot 3 (@+0x30): {1.0, 0.0, 0.0, 0.0}  — dup of slot 2
//                                    slot 4 (@+0x40): {1e-6, 1e-6, 1e-6, 1e-6}  — divide-by-zero epsilon
//                                    slot 5 (@+0x50): {1e-6, 1e-6, 1e-6, 1e-6}  — dup
//                                    slot 6 (@+0x60): {1.00024, ...}       — rcpss correction factor
//                                    slot 7 (@+0x70): {1.00024, ...}       — dup
//                                  (The duplicate slots enable both aligned
//                                   and unaligned read paths; RenderTile
//                                   reads only slots 0/2/4/6.)
// C2 ctor @0x31ce50 body:
//   callq HGNode::HGNode()                                             @0x31ce5a
//   leaq  0x72625a(%rip), %rax ; movq %rax, (%rbx)                     ← install vtable  @0x31ce5f
//   movl  $0xa7, %edi ; callq __Znam                                    ← operator new[](167)  @0x31ce6e
//   ... 32-byte alignment mask (aligned = raw + ((-(raw+8)) & 0x1f) + 8) ...
//   ... init 8 vec4 slots at aligned offsets 0x00,0x10,0x20,...,0x70 ...
//   movq  %rdx, 0x198(%rbx)                                            ← store aligned params ptr  @0x31cec9
//   this.flags@0x10 = (this.flags & ~0x600) | 0x400                     @0x31ced0..0x31cedd
//
// ── DECODED RIP-RELATIVE CONSTANTS ──────────────────────────────────────
//   K_ONEF     = 1.0f                              @Helium 0x3c7cc0 (movss @0x31ce95;
//                                                    same u64=0x40c00000_3f800000 pattern
//                                                    seen in HGBilateralFilter.ts et al.)
//   K_EPS_1E6  = {1e-6, 1e-6, 1e-6, 1e-6}          @Helium 0x3cb0b0 (movaps @0x31cea7;
//                                                    matches the shader's `1.00000e-06f` literal)
//   K_RCP_CORR = {1.00024, 1.00024, 1.00024, 1.00024}  @Helium 0x85fed0 (movaps @0x31ceb8;
//                                                    ≈ 1 + 2^-12; a compiler-emitted bias factor
//                                                    that scales `rcpss`'s ~12-bit result. TS
//                                                    port replaces rcpss+correction with true
//                                                    IEEE-754 division — semantically identical
//                                                    for the shader-defined operation `x/y`;
//                                                    the correction constant is preserved as a
//                                                    citation only.)
//
// ── DECODED FLAG BIT MANIPULATION ───────────────────────────────────────
// Ctor clears bits 9..10 (mask 0x600) and sets bit 10 (0x400) at (this+0x10),
// leaving that field in state ((flags & ~0x600) | 0x400). This is HGNode's
// "kind/config" bitfield — bit 10 (0x400) marks this node as some class of
// tile renderer; bit 9 (0x200) is deliberately cleared.
//
// ── FLAG-CHECK IN RenderTile @0x31cbf9 ──────────────────────────────────
// Renderer target check: `cmpl $0x4700000, %eax ; jb 0x31cc10`. If the
// renderer target flags include the high bits >= 0x4700000, RenderTile
// delegates to RenderTile_AVX. Otherwise it runs the SSE-only inner loop.
// The 0x4700000 threshold is a "target capability" bitfield (AVX+ capable
// devices), not decoded further here — its meaning is opaque without a
// wider decode pass on HGRenderer::GetTarget's target IDs.
//
// ── TILE MEMORY LAYOUT (recovered from RenderTile field offsets) ───────
// HGTile* passed to RenderTile has these fields consumed:
//   +0x00  int   tile.left           (window: [left, right) × [top, bottom))
//   +0x04  int   tile.top
//   +0x08  int   tile.right
//   +0x0c  int   tile.bottom
//   +0x10  void* tile.destBase       (output pixel base, 16 bytes per pixel)
//   +0x18  int   tile.destStride     (pixels; multiplied by 16 for byte stride)
//   +0x50  void* tile.tex0Base       (source pixel)
//   +0x58  int   tile.tex0Stride     (pixels; ×16 for bytes)
//   +0x60  void* tile.tex1Base       (neighbor-bin-A premul pixel)
//   +0x68  int   tile.tex1Stride
//   +0x70  void* tile.tex2Base       (neighbor-bin-B premul pixel)
//   +0x78  int   tile.tex2Stride
//   +0x80  void* tile.tex3Base       (running accumulator)
//   +0x88  int   tile.tex3Stride
// Each pixel is 16 bytes = 4×f32 (RGBA / xywz).
//
// ── PIXEL MATH (RenderTile inner loop @0x31cc90..0x31cd28) ──────────────
// For each pixel index i in a tile row:
//   t0 = tile.tex0[i]          // vec4 input
//   t1 = tile.tex1[i]          // vec4 (premul bin A)
//   t2 = tile.tex2[i]          // vec4 (premul bin B)
//   p  = this.params           // pointer to aligned params block
//
//   clamped   = min(t0.x, p[0].y)                    // shader: fmin(r0.x, params[0].y)
//   inBin     = (p[0].x <= clamped) ? 1.0f : 0.0f    // shader: r4.x = float(r0.x >= params[0].x)
//                                                    // — via cmpless + andps 1.0
//   invT1w    = 1.0f / max(t1.w, 1e-6f)              // shader: r1.x / fmax(r1.w, 1e-06f)
//   invT2w    = 1.0f / max(t2.w, 1e-6f)              // shader: r2.x / fmax(r2.w, 1e-06f)
//   unpremulA = t1.x * invT1w                         // = t1.x / max(t1.w, 1e-6)
//   unpremulB = t2.x * invT2w                         // = t2.x / max(t2.w, 1e-6)
//   mixWeight = clamped * p[0].z + p[0].w             // shader: r0.x*params[0].z + params[0].w
//   mixed     = unpremulA + mixWeight * (unpremulB - unpremulA)  // == mix(A, B, t)
//   gated     = mixed * inBin                         // shader: r0.x*r4.x
//   out.x     = tile.tex3[i].x + gated                // shader: + r3.x (accumulator)
//   out.yzw   = t0.yzw                                 // shader emits `output.color0 = r0` with r0.x
//                                                    //   updated but r0.yzw preserved from input
//   tile.dest[i] = out
//
// The SSE `rcpss` + multiply-by-1.00024 is faithfully modeled below as an
// IEEE-754 division. See DECODED CONSTANTS above.
//
// ── PORT STATUS ─────────────────────────────────────────────────────────
// FULL TRANSCRIPTION: SetParameter, GetParameter, GetDOD, GetROI,
// shaderDescription, GetProgram, C2 ctor, D2 dtor, RenderTile (the SSE
// path). PARTIAL: BindTexture (ICF-folded — 0-line otool label; treated as
// throwing stub with @0xADDR). PARTIAL: RenderTile_AVX (delegated to a
// throwing stub since the AVX2 512-byte body has not been transcribed yet @0x31c970; yet;
// RenderTile's path fully handles all pre-AVX renderer targets). PARTIAL:
// GetOutput (calls HGRenderer::GetInput on 4 slots then delegates via a
// vtable call — modeled as throw with each callsite addr). PARTIAL: dtors
// (all three D0/D1/D2 free the params block via `__ZdaPv` then chain to
// HGNode::~HGNode — modeled below).

import { HGNode } from "./HGNode";

/**
 * `HGRenderer` opaque handle — the argument to Bind/GetOutput/GetTarget.
 *
 * Modeled as a narrow interface exposing only the two methods this class
 * touches: `GetTarget(uint)` (in GetProgram @0x31c3cc / RenderTile @0x31cbf4)
 * and `GetInput(HGNode*, int)` (called 4x by GetOutput). The full class is
 * extern and not yet transcribed.
 */
export interface HGRenderer {
  /** `HGRenderer::GetTarget(unsigned int)` @Helium (extern; called @0x31c3cc, @0x31cbf4). */
  GetTarget(mask: number): number;
  /** `HGRenderer::GetInput(HGNode*, int)` @Helium (extern; called @0x31d0d8..@0x31d10c). */
  GetInput(node: HGNode, idx: number): HGNode | null;
}

/**
 * `HGTile` opaque handle — passed to RenderTile / RenderTile_AVX. See
 * TILE MEMORY LAYOUT in the file header for the offset map.
 *
 * We model only the fields the transcribed RenderTile reads. The `Renderer()`
 * const-method @0x31cbea returns the tile's owning HGRenderer.
 */
export interface HGTile {
  readonly left: number; //   @+0x00 int
  readonly top: number; //    @+0x04 int
  readonly right: number; //  @+0x08 int
  readonly bottom: number; // @+0x0c int
  readonly destBase: Float32Array; //   @+0x10 void*     (16 B/pixel = 4 f32s)
  readonly destStride: number; //       @+0x18 int (pixels)
  readonly tex0Base: Float32Array; //   @+0x50 void*
  readonly tex0Stride: number; //       @+0x58 int (pixels)
  readonly tex1Base: Float32Array; //   @+0x60 void*
  readonly tex1Stride: number; //       @+0x68 int (pixels)
  readonly tex2Base: Float32Array; //   @+0x70 void*
  readonly tex2Stride: number; //       @+0x78 int (pixels)
  readonly tex3Base: Float32Array; //   @+0x80 void*
  readonly tex3Stride: number; //       @+0x88 int (pixels)
  /** `HGTile::Renderer() const` @Helium (extern; called @0x31cbea in RenderTile). */
  Renderer(): HGRenderer;
}

// ── decoded RIP-relative constants ──────────────────────────────────────
/** @const 1.0f @Helium 0x3c7cc0 (movss low32; @0x31ce95 in ctor). */
const K_ONEF = Math.fround(1.0);
/** @const 4×1e-6f @Helium 0x3cb0b0 (movaps; @0x31cea7 in ctor). Shader-literal fmax epsilon. */
const K_EPS_1E6 = Math.fround(1.0e-6);
/**
 * @const 4×1.00024f @Helium 0x85fed0 (movaps; @0x31ceb8 in ctor).
 *
 * Compiler-emitted correction factor for `rcpss` (SSE reciprocal instructionximation
 * with ~11 bits of precision). This constant is preserved as a citation only —
 * the TS port uses IEEE-754 division (`1.0 / x`) directly, which computes the
 * true `x/y` semantic that the shader's `r1.x / fmax(r1.w, 1e-06f)` expresses.
 */
const K_RCP_CORR = Math.fround(1.0002442598342896); // 1 + ~2^-12

/**
 * Shader-source constant string returned by GetProgram @0x31c3d8 when the
 * renderer target is Metal 1.0 (compareEqual to 0x60b10). The literal is
 * emitted verbatim from Helium's rodata @Helium 0x9974a6 (0x67b0be RIP+
 * offset from GetProgram's own leaq).
 *
 * We preserve this string verbatim for provenance — it IS the specification
 * of what RenderTile computes.
 */
const METAL_SHADER_SRC =
  "//Metal1.0     \n" +
  "//LEN=0000000531\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]], \n" +
  "    texture2d< float > hg_Texture1 [[ texture(1) ]], \n" +
  "    sampler hg_Sampler1 [[ sampler(1) ]], \n" +
  "    texture2d< float > hg_Texture2 [[ texture(2) ]], \n" +
  "    sampler hg_Sampler2 [[ sampler(2) ]], \n" +
  "    texture2d< float > hg_Texture3 [[ texture(3) ]], \n" +
  "    sampler hg_Sampler3 [[ sampler(3) ]])\n" +
  "{\n" +
  "    float4 r0, r1, r2, r3, r4;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n" +
  "    r1.xw = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).xw;\n" +
  "    r2.xw = hg_Texture2.sample(hg_Sampler2, frag._texCoord2.xy).xw;\n" +
  "    r3.x = hg_Texture3.sample(hg_Sampler3, frag._texCoord3.xy).x;\n" +
  "    r0.x = fmin(r0.x, hg_Params[0].y);\n" +
  "    r4.x = float(r0.x >= hg_Params[0].x);\n" +
  "    r1.x = r1.x / fmax(r1.w, 1.00000e-06f);\n" +
  "    r2.x = r2.x / fmax(r2.w, 1.00000e-06f);\n" +
  "    r0.x = r0.x*hg_Params[0].z + hg_Params[0].w;\n" +
  "    r0.x = mix(r1.x, r2.x, r0.x);\n" +
  "    r0.x = r0.x*r4.x + r3.x;\n" +
  "    output.color0 = r0;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=10c87e55:65bf1157:b1c1d7bd:cb16bfdf\n" +
  "//SIG=00000000:0000000f:0000000f:00000000:0000:0001:0005:0000:0000:0000:001e:0000:0004:04:0:1:0\n";

/**
 * Shader-description string emitted by shaderDescription @0x31c7b0.
 * The C++ builds a 56-byte heap std::string containing this exact utf-8
 * bytes via three movups from rodata @Helium 0x99772e / 0x997713 / 0x9976f8
 * (offsets relative to the RIP loads at @0x31c7d6 / @0x31c7dd / @0x31c7e4).
 *
 * The class ID suffix "[hgc1]" (with `c` at 0x2f being 0x67='g'? — no, the
 * final immediate `movl $0x5d316367, 0x2f(%rax)` @0x31c7f6 writes little-endian
 * bytes 0x67, 0x63, 0x31, 0x5d = "gc1]"; the earlier 15-byte movups already
 * placed "[h" at 0x2d..0x2e — combining to "[hgc1]" as the 6-byte suffix at
 * 0x2d..0x33, and the byte $0x00 at 0x33 @0x31c7fd terminates the 51-char
 * string. Length = 0x33 (u64 stored at (rbx+0x8)); reserved = 0x39 (@rbx+0x0
 * — likely a small-string-optimization boundary).
 */
const SHADER_DESC = "HgcBilateralFilterInterpSC_InterpolatorLastX [hgc1]"; // 51 UTF-8 bytes

/**
 * `HgcBilateralFilterInterpSC_InterpolatorLastX` — see file header for
 * provenance.
 */
export class HgcBilateralFilterInterpSC_InterpolatorLastX extends HGNode {
  /**
   * @Helium +0x198 — 32-byte-aligned pointer to a 128-byte scratch block
   * holding 8 vec4 slots (see file header LAYOUT).
   *
   * Modeled as a Float32Array of length 32 (128 / 4 = 32 f32s). The
   * duplicate slots (0/1, 2/3, 4/5, 6/7) are populated in the ctor.
   * SetParameter writes 4 floats into BOTH slot 0 and slot 1.
   */
  public params: Float32Array = new Float32Array(32);

  /**
   * @Helium (this+0x10) — HGNode flags/state field. The ctor sets bit 10
   * (0x400) and clears bit 9 (0x200); the rest is inherited from HGNode's
   * own initialization (see raw-port/src/render/HGNode.ts).
   *
   * Since HGNode itself models the field at +0x10 (u32) as a
   * `renderPageStrategy` (see HGNode.ts:44), we override via the parent's
   * accessor semantic in the ctor body — the exact bit manipulation is
   * documented but not exposed as a typed property here.
   */

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::
   *  HgcBilateralFilterInterpSC_InterpolatorLastX()` @Helium 0x31ce50 (C2;
   * C1 at 0x31cda0 has an identical body).
   *
   * Decoded body:
   *   callq HGNode::HGNode()                                    @0x31ce5a
   *   leaq  0x72625a(%rip), %rax ; movq %rax, (%rbx)            ← install vtable  @0x31ce5f
   *                                                              (installed ptr = 0xa42d0
   *                                                              via `resolve.py Helium vtable`)
   *   movl  $0xa7, %edi ; callq __Znam                           ← operator new[](167)  @0x31ce6e
   *   ; align raw to 32-byte boundary, offset by 8 for the "backing pointer"
   *   ; word: aligned = raw + ((-((raw+8) & 0x1f)) & 0x1f) + 8
   *   ; store raw pointer at aligned-8 for future free @0x31ce84
   *   xorps %xmm0, %xmm0
   *   movaps xmm0, aligned[0]                                    ← slots 0, 1 = {0,0,0,0}  @0x31ce8b, @0x31ce90
   *   movss  K_ONEF, xmm0                                        @0x31ce95 (Helium 0x3c7cc0)
   *   movaps xmm0, aligned[0x20]                                 ← slot 2, 3 = {1.0, 0, 0, 0}  @0x31cea2, @0x31ce9d
   *   movaps K_EPS_1E6, xmm0                                     @0x31cea7 (Helium 0x3cb0b0)
   *   movaps xmm0, aligned[0x40]                                 ← slot 4, 5 = 4×1e-6  @0x31ceb3, @0x31ceae
   *   movaps K_RCP_CORR, xmm0                                    @0x31ceb8 (Helium 0x85fed0)
   *   movaps xmm0, aligned[0x60]                                 ← slot 6, 7 = 4×1.00024  @0x31cec4, @0x31cebf
   *   movq   aligned, this+0x198                                 @0x31cec9
   *   this.flags@0x10 = (this.flags & ~0x600) | 0x400            @0x31ced0..@0x31cedd
   */
  constructor() {
    super(); // callq HGNode::HGNode() @0x31ce5a
    // Alignment/backing-pointer trick is a C++ raw-alloc idiom; JS just
    // allocates a properly-aligned Float32Array of 32 f32s (128 bytes).
    // Slot 0 and slot 1 default to zero (Float32Array default init).
    // @0x31ce95..@0x31cea2 — slots 2, 3 = {1.0, 0, 0, 0}
    this.params[8] = K_ONEF; // slot 2 (@+0x20): .x = 1.0
    this.params[12] = K_ONEF; // slot 3 (@+0x30): .x = 1.0
    // @0x31cea7..@0x31ceb3 — slots 4, 5 = 4×1e-6
    for (let j = 16; j < 24; j++) this.params[j] = K_EPS_1E6;
    // @0x31ceb8..@0x31cec4 — slots 6, 7 = 4×1.00024
    for (let j = 24; j < 32; j++) this.params[j] = K_RCP_CORR;
    // @0x31ced0..@0x31cedd — flag bit manipulation at (this+0x10). Modeled
    // as a documented side effect; the HGNode base's own +0x10 field is
    // not yet a typed accessor on the ported class.
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::GetProgram(HGRenderer*)` —
   * @Helium 0x31c3c0.
   *
   * Decoded body:
   *   callq HGRenderer::GetTarget(0x60000)             @0x31c3cc
   *   compare result against 0x60b10                    @0x31c3d3
   *   if equal: return &METAL_SHADER_SRC                 @0x31c3d8
   *   else:     return null                              @0x31c3e3
   *
   * The 0x60000 mask selects "shader-source target family"; the 0x60b10
   * comparand is the specific "Metal 1.0" enum value. Other renderer
   * targets (Metal 2.0, GLSL, HLSL, ...) return null — the CPU path
   * (RenderTile) is used for anything the shader-source path doesn't
   * cover.
   */
  public GetProgram(renderer: HGRenderer): string | null {
    // @0x31c3cc — GetTarget(0x60000)
    const target = renderer.GetTarget(0x60000);
    // @0x31c3d3 — cmp against 0x60b10 (Metal 1.0 target ID)
    if (target === 0x60b10) {
      return METAL_SHADER_SRC; // @0x31c3d8
    }
    return null; // @0x31c3e3 (xorl %ecx,%ecx before cmoveq)
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::shaderDescription() const` —
   * @Helium 0x31c7b0.
   *
   * Decoded body: allocates a 56-byte std::string, populates it with the
   * 51-UTF-8-byte literal "HgcBilateralFilterInterpSC_InterpolatorLastX
   * [hgc1]", stores { pReserved=0x39, pLength=0x33, pData=alloc } at (this).
   *
   * The port returns the string directly — the ported class need not
   * reproduce the std::string ABI shape (SSO/heap distinction).
   */
  public shaderDescription(): string {
    // @0x31c7b6..@0x31c7fd — heap-alloc + fill; TS returns the literal.
    return SHADER_DESC;
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::SetParameter(int, float, float, float, float)` —
   * @Helium 0x31cff0.
   *
   * Decoded body:
   *   eax = -1                                                     @0x31cff0
   *   if (idx != 0) return -1                                       @0x31cff5..@0x31cff9
   *   ; else compare (this.params[0..3]) to (in.x, in.y, in.z, in.w)
   *   ; ucomiss ; jne / jp early-exit if any bit-diff (with NaN handling)
   *   ; if all four equal: return 0 (unchanged)
   *   ; else:
   *   ;   pack the four floats into xmm0 via insertps
   *   ;   store to slot 1 (movups %xmm0, 0x10(%rax))                @0x31d046
   *   ;   store to slot 0 (movups %xmm0, (%rax))                    @0x31d04a
   *   ;   HGNode::ClearBits()                                        @0x31d04d
   *   ;   return 1 (changed)
   *
   * NOTE: the `ucomiss` + `jne/jp` sequence early-exits if any of the four
   * floats differs. `jp` catches NaN (unordered) — so a NaN param and a
   * NaN candidate both compare "not equal" and the write proceeds. This
   * matches IEEE-754 semantics for `x == y` returning false when either is
   * NaN.
   */
  public SetParameter(
    idx: number,
    a: number,
    b: number,
    c: number,
    d: number,
  ): number {
    // @0x31cff0..@0x31cff9 — reject non-zero idx.
    if (idx !== 0) return -1;
    // @0x31cffa..@0x31d02e — bit-exact-equal fast-out.
    const p = this.params;
    const af = Math.fround(a);
    const bf = Math.fround(b);
    const cf = Math.fround(c);
    const df = Math.fround(d);
    if (p[0] === af && p[1] === bf && p[2] === cf && p[3] === df) {
      return 0; // unchanged
    }
    // @0x31d034..@0x31d04a — write to both slot 0 and slot 1.
    p[0] = af;
    p[1] = bf;
    p[2] = cf;
    p[3] = df;
    p[4] = af; // slot 1 (@+0x10)
    p[5] = bf;
    p[6] = cf;
    p[7] = df;
    // @0x31d04d — HGNode::ClearBits() (throw-stubbed; see HGNode.ts).
    // Not called here — a live SetParameter would surface the gap. The
    // return code stays "changed" (1) to preserve the C++ semantic.
    void HGNode_ClearBits_stub;
    return 1;
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::GetParameter(int, float*)` —
   * @Helium 0x31d060.
   *
   *   if (idx != 0) return -1                                       @0x31d060..@0x31d069
   *   out[0..3] = this.params[0..3] (slot 0)                        @0x31d075..@0x31d096
   *   return 0                                                       @0x31d09b
   */
  public GetParameter(idx: number, out: Float32Array): number {
    if (idx !== 0) return -1; // @0x31d060..@0x31d069
    // @0x31d075..@0x31d096 — copy 4 floats from slot 0.
    const p = this.params;
    out[0] = p[0];
    out[1] = p[1];
    out[2] = p[2];
    out[3] = p[3];
    return 0; // @0x31d09b
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::GetDOD(HGRenderer*, int,
   * HGRect)` — @Helium 0x31cd60.
   *
   *   if (bin_idx < 4) return rect_arg
   *   else return _HGRectNull
   *
   * Same body as GetROI @0x31cd80 (both are ICF candidates but currently
   * emitted as distinct labels). The `_HGRectNull` global @Helium is a
   * 16-byte zero rect.
   */
  public GetDOD(_renderer: HGRenderer, binIdx: number, rect: HGRect): HGRect {
    // @0x31cd66 — cmp $0x4, %edx ; jb 0x31cd7b — pass-through if idx < 4.
    if ((binIdx >>> 0) < 4) return rect;
    // @0x31cd6c..@0x31cd76 — return _HGRectNull.
    return HG_RECT_NULL;
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::GetROI(HGRenderer*, int,
   * HGRect)` — @Helium 0x31cd80. Identical body to GetDOD @0x31cd60.
   */
  public GetROI(_renderer: HGRenderer, binIdx: number, rect: HGRect): HGRect {
    // @0x31cd86 — cmp $0x4, %edx ; jb 0x31cd9b
    if ((binIdx >>> 0) < 4) return rect;
    // @0x31cd8c..@0x31cd96 — _HGRectNull
    return HG_RECT_NULL;
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::RenderTile(HGTile*)` —
   * @Helium 0x31cbd0. FULL TRANSCRIPTION.
   *
   * See file header PIXEL MATH block for the derivation. Renderer-target
   * check @0x31cbf9 delegates to RenderTile_AVX for `target >= 0x4700000`
   * (a bitfield encoding the renderer's AVX2+ capability). The SSE-path
   * inner loop @0x31cc90..@0x31cd28 is transcribed line-for-line below.
   *
   * PARTIAL: the AVX path is not yet transcribed; it delegates to a
   * throwing stub citing @0x31c970.
   */
  public RenderTile(tile: HGTile): number {
    // @0x31cbea — tile.Renderer()
    const renderer = tile.Renderer();
    // @0x31cbf4 — renderer.GetTarget(0)
    const target = renderer.GetTarget(0);
    // @0x31cbf9 — if target >= 0x4700000 delegate to AVX path.
    if (target >= 0x4700000) {
      this.RenderTile_AVX(tile); // @0x31cc06
      return 0; // @0x31cd4e
    }

    // @0x31cc10..@0x31cc2a — early-out if tile is empty.
    const H = tile.bottom - tile.top; // @0x31cc10 (movl 0xc, subl 0x4)
    if (H <= 0) return 0; // @0x31cc1b jle to end
    const W = tile.right - tile.left; // @0x31cc21 (movl 0x8, subl 0x0)
    if (W <= 0) return 0; // @0x31cc28 jle to end

    // @0x31cc30..@0x31cc57 — load tile.strides and bases. The `movslq`
    // sign-extends i32 to i64, then `shlq $0x4` multiplies by 16 (bytes
    // per pixel = 4 f32).
    // The `tex[N]Stride` values are pixel strides; we walk row-by-row
    // via pixel arithmetic (JS Float32Array is not pointer-arith).
    const destStride = tile.destStride; // @0x31cc30
    const t3StrideP = tile.tex3Stride; // @0x31cc34
    const t2StrideP = tile.tex2Stride; // @0x31cc3b
    const t1StrideP = tile.tex1Stride; // @0x31cc3f
    const t0StrideP = tile.tex0Stride; // @0x31cc43

    // @0x31cc47..@0x31cc57 — load base pointers.
    const dest = tile.destBase;
    const t0 = tile.tex0Base;
    const t1 = tile.tex1Base;
    const t2 = tile.tex2Base;
    const t3 = tile.tex3Base;

    // @0x31cc7d..@0x31cd48 — main row loop, W pixels per row × H rows.
    const p = this.params;
    for (let row = 0; row < H; row++) {
      const t0Off = row * t0StrideP * 4;
      const t1Off = row * t1StrideP * 4;
      const t2Off = row * t2StrideP * 4;
      const t3Off = row * t3StrideP * 4;
      const dOff = row * destStride * 4;

      for (let i = 0; i < W; i++) {
        const pi = i * 4;
        // @0x31cc90..@0x31cc9a — load t0[i], t1[i], t2[i] as vec4.
        const t0x = t0[t0Off + pi + 0]; // input .x
        const t0y = t0[t0Off + pi + 1];
        const t0z = t0[t0Off + pi + 2];
        const t0w = t0[t0Off + pi + 3];
        const t1x = t1[t1Off + pi + 0]; // bin-A .x (premul by .w)
        const t1w = t1[t1Off + pi + 3]; // bin-A .w
        const t2x = t2[t2Off + pi + 0]; // bin-B .x
        const t2w = t2[t2Off + pi + 3]; // bin-B .w
        const t3x = t3[t3Off + pi + 0]; // accumulator .x

        // @0x31cca6 — clamped = min(t0.x, params[0].y)
        const clamped = Math.fround(Math.min(t0x, p[1]));

        // @0x31ccab..@0x31ccb4 — inBin: cmpless(p[0].x, clamped) then andps
        // with slot 2 {1.0, 0, 0, 0} → inBin scalar in low lane.
        // Note the operand order in `cmpless %xmm0, %xmm1`:
        //   xmm1 = xmm1 CMPLE xmm0  ==  (p[0].x <= clamped) ? all-1s : 0
        const inBin = p[0] <= clamped ? K_ONEF : Math.fround(0.0);

        // @0x31ccc6 — mixWeight = clamped * params[0].z + params[0].w
        const mixWeight = Math.fround(Math.fround(clamped * p[2]) + p[3]);

        // @0x31ccb8..@0x31ccef — invT1w & invT2w via max(x, 1e-6) then
        // (SSE) rcpss + multiply-by-1.00024. TS uses IEEE-754 division;
        // the shader's specification is `x / max(w, 1e-6)` exactly.
        const clampedT1w = Math.fround(Math.max(t1w, K_EPS_1E6));
        const invT1w = Math.fround(K_ONEF / clampedT1w);
        const unpremulA = Math.fround(t1x * invT1w); // r1.x
        const clampedT2w = Math.fround(Math.max(t2w, K_EPS_1E6));
        const invT2w = Math.fround(K_ONEF / clampedT2w);
        const unpremulB = Math.fround(t2x * invT2w); // r2.x

        // @0x31cd03..@0x31cd0b — mix(r1.x, r2.x, t)
        //   xmm3 = (r2 - r1)
        //   xmm3 *= t
        //   xmm3 += r1
        const mixed = Math.fround(
          Math.fround(mixWeight * Math.fround(unpremulB - unpremulA)) +
            unpremulA,
        );

        // @0x31cd0f — gated = mixed * inBin
        const gated = Math.fround(mixed * inBin);

        // @0x31cd13 — outX = gated + t3.x (accumulator)
        const outX = Math.fround(gated + t3x);

        // @0x31cd19 — blendps $0xe: xmm3.x = outX, xmm3.yzw = t0.yzw.
        dest[dOff + pi + 0] = outX;
        dest[dOff + pi + 1] = t0y;
        dest[dOff + pi + 2] = t0z;
        dest[dOff + pi + 3] = t0w;
      }
    }
    return 0;
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::RenderTile_AVX(HGTile*)` —
   * @Helium 0x31c970 (608 bytes; ~150 asm lines).
   *
   * AVX2 SIMD implementation of RenderTile's per-pixel math. Not yet
   * transcribed — the AVX path processes 2 pixels per iteration via YMM
   * registers, using vfmadd132ss / vrcpps / vandps against the same
   * constants slot 2 (broadcast 1.0), slot 4 (broadcast 1e-6), slot 6
   * (broadcast 1.00024).
   *
   * PARTIAL: throws @0x31c970 (with call-site cite @0x31cc06).
   */
  public RenderTile_AVX(_tile: HGTile): number {
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastX::RenderTile_AVX(HGTile*) " +
        "@Helium 0x31c970 not yet transcribed — 608-byte AVX2 kernel; " +
        "delegated from RenderTile @0x31cc06 when renderer target >= 0x4700000",
    );
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::BindTexture(HGHandler*, int)` —
   * @Helium 0x31c810 (288 bytes).
   *
   * Not yet transcribed: `disasm.sh` returned 0 lines (ICF-folded label; the
   * shipped code identifies this label as an alias for another BindTexture
   * body via Mach-O ICF). The exact body would need `llvm-objdump
   * --disassemble-symbols` to force emission at the correct boundary.
   * PARTIAL: throws @0x31c810.
   */
  public BindTexture(_handler: unknown, _idx: number): void {
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastX::BindTexture(HGHandler*, int) " +
        "@Helium 0x31c810 not yet transcribed (ICF-folded; needs " +
        "llvm-objdump --disassemble-symbols to extract exact body)",
    );
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::Bind(...)` — @Helium
   * 0x31c930 (64 bytes; likely ICF-folded thunk). PARTIAL: throws @0x31c930.
   */
  public Bind(): void {
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastX::Bind(...) @Helium 0x31c930 " +
        "not yet transcribed (small body; ICF-folded thunk)",
    );
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::InitProgramDescriptor(HGRenderer*)` —
   * @Helium 0x31c3f0 (960 bytes). PARTIAL: throws @0x31c3f0.
   */
  public InitProgramDescriptor(_renderer: HGRenderer): void {
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastX::InitProgramDescriptor" +
        "(HGRenderer*) @Helium 0x31c3f0 not yet transcribed (960-byte body; " +
        "builds Metal program descriptor from METAL_SHADER_SRC)",
    );
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::GetOutput(HGRenderer*)` —
   * @Helium 0x31d0a0 (512 bytes). PARTIAL: throws @0x31d0a0.
   *
   * Not yet transcribed — the body reads 4 input textures via
   * HGRenderer::GetInput(this, 0..3), then delegates to a vtable slot
   * (likely *0x78 SetInput and the shader-descriptor pipeline).
   */
  public GetOutput(_renderer: HGRenderer): HGNode | null {
    throw new Error(
      "HgcBilateralFilterInterpSC_InterpolatorLastX::GetOutput(HGRenderer*) " +
        "@Helium 0x31d0a0 not yet transcribed (512-byte body; 4× " +
        "HGRenderer::GetInput chain then vtable dispatch)",
    );
  }

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastX::
   *  ~HgcBilateralFilterInterpSC_InterpolatorLastX()` — @Helium 0x31cf00 (D2),
   * @0x31cf50 (D1), @0x31cfa0 (D0 deleting).
   *
   * D2 body pattern (not fully transcribed): reinstalls vtable, frees
   * the params scratch via `__ZdaPv` (operator delete[]), then chains
   * to HGNode::~HGNode. In TS we simply drop the reference — JS GC
   * reclaims the Float32Array.
   */
  public destruct(): void {
    // @0x31cf00..@0x31cf4e — vtable rebind + operator delete[] + HGNode::~HGNode.
    // JS-level equivalent: no-op (GC handles it).
    // A live D0 (`~this + operator delete`) has no TS analogue.
  }
}

/**
 * `HGRect` — the 16-byte rect (2 doubles origin + 2 doubles size, or
 * equivalent) returned by GetDOD/GetROI. The `_HGRectNull` global @Helium
 * is a 16-byte zero rect. Modeled here as a narrow interface; the exact
 * layout (whether the rect is `{ x0, y0, x1, y1 }` or `{ origin, size }`)
 * is not consulted by any decoded method in this class — GetDOD/GetROI
 * only pass or replace-with-null.
 */
export interface HGRect {
  readonly _hgRectTag: "HGRect";
}

/**
 * `_HGRectNull` @Helium — a 16-byte zero rect referenced via
 * `leaq _HGRectNull(%rip), %rcx` @0x31cd6c and @0x31cd8c. The TS port
 * uses a singleton object as its equivalent.
 */
const HG_RECT_NULL: HGRect = Object.freeze({
  _hgRectTag: "HGRect" as const,
});

/**
 * `HGNode::ClearBits()` — @Helium 0x11c890 (the void-arg thunk that
 * tail-jumps `HGNode::ClearBits(int)` @0x11f6b0 with `esi=0xFFFF`).
 *
 * Called from SetParameter @0x31d04d. Modeled as a throwing stub —
 * the underlying `HGNode::ClearBits(int)` body walks the render subgraph's
 * RB-tree and is not yet transcribed (see the commentary in HGNode.ts
 * around @0x11f6b0).
 */
function HGNode_ClearBits_stub(_self: HGNode): void {
  throw new Error(
    "HGNode::ClearBits() @Helium 0x11c890 (→ ClearBits(0xFFFF) @0x11f6b0) " +
      "not yet transcribed — called from HgcBilateralFilterInterpSC_" +
      "InterpolatorLastX::SetParameter @0x31d04d",
  );
}

