// raw-port/src/render/HgcAVAMotionDilation.ts
//
// FCP `HgcAVAMotionDilation` — Helium render-graph node that dilates the
// AVA (Anti-Video-Artifacts) motion mask across a spatial neighborhood.
// Takes 3 texture inputs; produces a per-pixel {max, sum, self-max, sample}
// float4 (see the Metal shader source below).  The class has NO user-
// visible parameters (SetParameter / GetParameter both return -1
// unconditionally), so it is purely a "wire 3 upstream textures → run a
// small max/sum kernel" node.  On the CPU path, RenderTile & RenderTile_AVX
// evaluate the same math per-pixel (frontier decodes).
//
// FRAMEWORK: Helium.framework (Final Cut Pro), x86_64 slice.
// DECODE: raw-port/re/disasm/Helium.HgcAVAMotionDilation.*.s
//
// -----------------------------------------------------------------------------
// SYMBOLS TRANSCRIBED (Helium x86_64 slice; VAs from `nm -n` / `otool -tV`)
// -----------------------------------------------------------------------------
//   @0x216620  __ZN20HgcAVAMotionDilationC2Ev   HgcAVAMotionDilation::HgcAVAMotionDilation() [C2]
//   @0x216700  __ZN20HgcAVAMotionDilationC1Ev   HgcAVAMotionDilation::HgcAVAMotionDilation() [C1 — same body as C2]
//   @0x2167e0  __ZN20HgcAVAMotionDilationD2Ev   HgcAVAMotionDilation::~HgcAVAMotionDilation() [D2]
//   @0x216830  __ZN20HgcAVAMotionDilationD1Ev   HgcAVAMotionDilation::~HgcAVAMotionDilation() [D1 — full free path]
//   @0x216880  __ZN20HgcAVAMotionDilationD0Ev   HgcAVAMotionDilation::~HgcAVAMotionDilation() [D0 — deleting]
//   @0x2168d0  __ZN20HgcAVAMotionDilation12SetParameterEiffff   SetParameter — returns -1 (no params)
//   @0x2168e0  __ZN20HgcAVAMotionDilation12GetParameterEiPf    GetParameter — returns -1 (no params)
//   @0x2168f0  __ZN20HgcAVAMotionDilation9GetOutputEP10HGRenderer   GetOutput — returns this
//   @0x216520  __ZN20HgcAVAMotionDilation6GetDODEP10HGRendereri6HGRect   GetDOD
//   @0x2165a0  __ZN20HgcAVAMotionDilation6GetROIEP10HGRendereri6HGRect   GetROI
//   @0x215e80  __ZN20HgcAVAMotionDilation4BindEP9HGHandler   Bind — tail-jmp HGNode::BindParamBufferDesc
//   @0x215c30  __ZN20HgcAVAMotionDilation11BindTextureEP9HGHandleri   BindTexture [FRONTIER — 168 lines]
//   @0x215390  __ZN20HgcAVAMotionDilation10GetProgramEP10HGRenderer   GetProgram
//   @0x2153c0  __ZNK20HgcAVAMotionDilation21InitProgramDescriptorEP19HGProgramDescriptor   InitProgramDescriptor [FRONTIER — 479 lines]
//   @0x215be0  __ZNK20HgcAVAMotionDilation17shaderDescriptionEv   shaderDescription — builds std::string "HgcAVAMotionDilation [hgc1]"
//   @0x215ea0  __ZN20HgcAVAMotionDilation14RenderTile_AVXEP6HGTile   RenderTile_AVX [FRONTIER — AVX CPU kernel]
//   @0x2161e0  __ZN20HgcAVAMotionDilation10RenderTileEP6HGTile   RenderTile [FRONTIER — scalar CPU kernel]
//
// -----------------------------------------------------------------------------
// VTABLE @Helium 0xa301e8 (installed pointer; verified by
// `resolve.py Helium vtable HgcAVAMotionDilation`).
// Slots this class overrides (all others inherit HGNode's):
//   *0x00 = 0x216830  ~HgcAVAMotionDilation() [D1]
//   *0x08 = 0x216880  ~HgcAVAMotionDilation() [D0]
//   *0x48 = 0x215be0  shaderDescription() const
//   *0x60 = 0x2168d0  SetParameter
//   *0x68 = 0x2168e0  GetParameter
//   *0xb0 = 0x2161e0  RenderTile
//   *0xb8 = 0x215390  GetProgram
//   *0xc8 = 0x215e80  Bind
//   *0xd0 = 0x215c30  BindTexture
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from C2 ctor @0x216700 + D1 dtor @0x216830).
// HGNode-base is 0x198 bytes wide.
// -----------------------------------------------------------------------------
//   ---- inherited from HGNode (size 0x198) ----
//     0x000..0x197 : HGNode fields (see HGNode.ts). C2 tail-calls
//                    HGNode::HGNode() (@0x21670a) before any own writes.
//   ---- HGcAVAMotionDilation-specific fields (start at 0x198) ----
//     0x198 : ptr to aligned coefficient buffer (0x87 bytes allocated raw via
//             __Znam @0x21671e; aligned to 32-byte boundary via
//                 rawPtr = new byte[0x87]
//                 alignPad = (-(rawPtr+8)) & 0x1f       // 0..31 pad
//                 alignedBase = rawPtr + alignPad
//                 store rawPtr @ alignedBase[0..7]     // 8-byte stash for free()
//                 buf = alignedBase + 8                 // the value stored @0x198
//             The pre-align raw pointer is stashed at buf-8 so D1 dtor can
//             `operator delete` it. See @0x216723..0x216767.
//
//   Aligned-buffer contents (all four 16-byte slots have movaps writes @ctor):
//     buf[+0x00..+0x0f]  xmm0 = (1.0f, 1.0f, 1.0f, 1.0f)    ← @Helium 0x3c7c40 (see decoded constant)
//     buf[+0x10..+0x1f]  xmm0 = (1.0f, 1.0f, 1.0f, 1.0f)    ← same const, second write
//     buf[+0x20..+0x2f]  xmm0 = xorps  = (0, 0, 0, 0)
//     buf[+0x30..+0x3f]  xmm0 = xorps  = (0, 0, 0, 0)
//     buf[+0x40..+0x4f]  xmm0 = (0.0f, 0.0f, 0.0f, <NaN 0xFFFFFFFF>)  ← @Helium 0x85fc40
//     buf[+0x50..+0x5f]  xmm0 = same 16-byte pattern
//
//   Ctor tail @0x216774..0x21679a: three vcalls to `this->SetFlags(idx, 1)`
//   via slot *0x88:  SetFlags(0,1), SetFlags(1,1), SetFlags(2,1).  Slot *0x88
//   on the HGComicEdges/HgcAVAMotionDilation vtable = HGNode::SetFlags(int,int)
//   @Helium 0x11c8e0 — mark flag-bits 0,1,2 as "on".
//
//   Ctor tail @0x2167ad..0x2167ba: `renderPageStrategy` (u32 @0x10) is
//     masked and OR-ed:   x = (x & 0xFFFFF9FE) | 0x401.
//   Starting from HGNode's init 0x200:
//     0x200 & 0xFFFFF9FE = 0x200 (bit 9 preserved; bit 0 cleared; bits 9,10 cleared? — 0xFFFFF9FE
//     preserves bits 0=0, 1..8=all, 9=0, 10=0, 11..31=all. Wait: 0x9FE = 1001 1111 1110 =
//     bits 1..8,11 set; bits 0,9,10 cleared. So mask clears bits 0,9,10 → 0x200 → 0x000).
//   Then OR 0x401 = bits 0 and 10.  Effective final value = 0x401.
//
// -----------------------------------------------------------------------------
// GetProgram RESOURCE: single embedded Metal fragment shader (no GLSL
// fallback path). Literal-pool string @Helium (RIP-relative from @0x2153a8,
// disp 0x6f207c → data addr 0x907424).
// MD5 in the source: `5d9ce490:ce0288d4:2a2c5d1d:5c45678e`.
// The math (as read from the shader) computes:
//   r0 = tex0[texCoord0].w                 // self-frame motion mask
//   r1.x/y/z = 3 neighbor motion samples   // tex0[texCoord3].w, tex1[texCoord4].w, tex1[texCoord1].w
//   r2.xz = (r1.yy >= r1.xz) ? 1 : 0        // horizontal dominance flags
//   r3.yz = (r1.xx >= r1.yz) ? 1 : 0        // reversed
//   r3.x = fmin(r3.y, r3.z)                 // consensus in x direction
//   r2.y = fmin(r2.x, r2.z)                 // consensus in y direction
//   r3.y = mix(r2.y, 1.0, r3.x)             // combine
//   r3.z = fmax(r3.x, r3.y)                 // final "at-a-corner" flag
//   r3.z = 1.0 - r3.z
//   r3.x = dot(r1.xyz, r3.xyz)              // weighted mask
//   out.x = fmax(self, weighted)            // dilated mask
//   Then include two extra `tex2` samples for temporal accumulation:
//     out.x = fmax(out.x, tex2[texCoord5].z)
//     out.x = fmax(out.x, tex2[texCoord2].z)
//     out.y = self + tex2[texCoord5].z + tex2[texCoord2].z    // running sum
//     out.z = self-frame max
//     out.w = second .w-channel of tex2[texCoord2]
// This is the CPU work RenderTile / RenderTile_AVX perform — kept as
// throwing stubs (they need HGTile field layout + AVX intrinsics).
// -----------------------------------------------------------------------------

import { HGNode } from "./HGNode.js";
import { HGRect, HGRectNull } from "./HGRect.js";

// ---------------------------------------------------------------------------
// Frontier stubs.
// ---------------------------------------------------------------------------

/**
 * `HGRenderer` — same interface as used by other HGNode subclasses (see
 * HGAnaglyph.ts / HGComicEdges.ts). HgcAVAMotionDilation reads only
 * `GetTarget(unsigned int)` @Helium __ZN10HGRenderer9GetTargetEj.
 */
export interface HGRendererStub {
  /** @Helium __ZN10HGRenderer9GetTargetEj — called from GetProgram @0x21539c. */
  GetTarget(kind: number): number;
}

/**
 * `HGTile` — per-tile render unit passed to RenderTile / RenderTile_AVX
 * (frontier decodes).
 */
export interface HGTileStub {
  readonly __brand: "HGTile";
}

/**
 * `HGHandler` — GPU driver surface. HgcAVAMotionDilation::BindTexture calls
 * back into it heavily (168-line body; frontier decode).
 */
export interface HGHandlerStub {
  readonly __brand: "HGHandler";
}

/**
 * `HGProgramDescriptor` — argument to InitProgramDescriptor (479 lines of
 * pipeline-state emission; frontier decode).
 */
export interface HGProgramDescriptorStub {
  readonly __brand: "HGProgramDescriptor";
}

// ---------------------------------------------------------------------------
// Decoded ctor constants (verified by reading __TEXT __const at their VAs).
// ---------------------------------------------------------------------------

/**
 * @Helium 0x3c7c40 (RIP-relative from @0x216738 + 7 = 0x21673f, disp 0x1b1501).
 * A 16-byte block that is `(1.0f, 1.0f, 1.0f, 1.0f)` — the "identity"
 * multiplier lane. Read as a Float32Array snapshot; verified byte-for-byte
 * against the framework's __TEXT __const section:
 *   raw bytes = 00 00 80 3f  00 00 80 3f  00 00 80 3f  00 00 80 3f
 */
const CTOR_CONST_ONES: readonly [number, number, number, number] = [
  1.0, 1.0, 1.0, 1.0,
];

/**
 * @Helium 0x85fc40 (RIP-relative from @0x216756 + 7 = 0x21675d, disp 0x6494e3).
 * A 16-byte block whose exact bytes are:
 *   raw bytes = 00 00 00 00  00 00 00 00  00 00 00 00  ff ff ff ff
 * Interpreted as 4×f32 the last lane is a NaN (`0xFFFFFFFF` is a signaling
 * NaN bit-pattern). Interpreted as 4×i32 it would be `(0,0,0,-1)`. The
 * `movaps` load doesn't commit to either interpretation, so we transcribe
 * the raw bytes and let downstream code re-cast as needed.
 */
const CTOR_CONST_ZEROS_MASK_BYTES: readonly number[] = [
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0xff, 0xff, 0xff, 0xff,
];

/**
 * Vtable installed pointer, cited for provenance.
 * @Helium 0xa301e8 — see vtable dump above.
 */
export const _HGCAVAMOTIONDILATION_VTABLE_ADDR = 0xa301e8;

// ---------------------------------------------------------------------------
// Embedded Metal shader source (verbatim from GetProgram's literal pool)
// ---------------------------------------------------------------------------

/**
 * Metal fragment shader — returned by GetProgram when the renderer's active
 * target equals 0x60b10 (not > , specifically ==).  Literal-pool string
 * @Helium 0x907424 (RIP-relative from @0x2153a8 + 7 = @0x2153af, disp 0x6f207c).
 * MD5 in the source: `5d9ce490:ce0288d4:2a2c5d1d:5c45678e`.
 */
export const HGCAVAMOTIONDILATION_METAL_SHADER: string =
  "//Metal1.0     \n//LEN=00000006f5\nfragment FragmentOut fragmentFunc(VertexInOut" +
  " frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[" +
  " sampler(0) ]], \n    texture2d< float > hg_Texture1 [[ texture(1) ]], \n    sampler" +
  " hg_Sampler1 [[ sampler(1) ]], \n    texture2d< float > hg_Texture2 [[ texture(2)" +
  " ]], \n    sampler hg_Sampler2 [[ sampler(2) ]])\n{\n    const float4 c0 =" +
  " float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0, r1, r2," +
  " r3;\n    FragmentOut output;\n\n    r0.w = hg_Texture0.sample(hg_Sampler0," +
  " frag._texCoord0.xy).w;\n    r0.x = r0.w;\n    r1.w = hg_Texture0.sample(hg_Sampler0," +
  " frag._texCoord3.xy).w;\n    r1.x = r1.w;\n    r2.w = hg_Texture1.sample(hg_Sampler1," +
  " frag._texCoord4.xy).w;\n    r1.y = r2.w;\n    r2.w = hg_Texture1.sample(hg_Sampler1," +
  " frag._texCoord1.xy).w;\n    r1.z = r2.w;\n    r2.xz = float2(r1.yy >= r1.xz);\n" +
  "    r3.yz = float2(r1.xx >= r1.yz);\n    r3.x = fmin(r3.y, r3.z);\n    r2.y =" +
  " fmin(r2.x, r2.z);\n    r3.y = mix(r2.y, c0.y, r3.x);\n    r3.z = fmax(r3.x, r3.y);\n" +
  "    r3.z = c0.x - r3.z;\n    r3.x = dot(r1.xyz, r3.xyz);\n    r0.x = fmax(r0.x," +
  " r3.x);\n    r2.z = hg_Texture2.sample(hg_Sampler2, frag._texCoord5.xy).z;\n    r1.x" +
  " = fmax(r0.x, r2.z);\n    r2.x = r0.x + r2.z;\n    r3.z = hg_Texture2.sample(hg_Sampler2," +
  " frag._texCoord2.xy).z;\n    r1.x = fmax(r1.x, r3.z);\n    r2.x = r2.x + r3.z;\n" +
  "    r3.zw = hg_Texture2.sample(hg_Sampler2, frag._texCoord2.xy).zw;\n    output.color0.x" +
  " = fmax(r1.x, r3.w);\n    output.color0.y = r2.x;\n    output.color0.z = r0.x;\n" +
  "    output.color0.w = r3.z;\n    return output;\n}\n//MD5=5d9ce490:ce0288d4:2a2c5d1d" +
  ":5c45678e\n//SIG=00000000:00000000:00000000:00000000:0001:0000:0004:0000:0000:0000" +
  ":007e:0000:0006:03:0:1:0\n";

/**
 * shaderDescription() output — verbatim 27-byte C string from the literal
 * pool @Helium (composed from two 16-byte movups loads at 0x215c06 disp
 * 0x6f1f55 and 0x215c11 disp 0x6f1f3f, followed by a terminating null @0x1b).
 * The disassembly builds a `std::string` in the caller-provided out-buffer
 * with size=0x1b, capacity=0x21 (long-form SSO on darwin libc++), pointing
 * at a heap-allocated 32-byte buffer.  The string itself is:
 */
export const HGCAVAMOTIONDILATION_SHADER_DESCRIPTION: string =
  "HgcAVAMotionDilation [hgc1]";

// ---------------------------------------------------------------------------
// HgcAVAMotionDilation
// ---------------------------------------------------------------------------

/**
 * `HgcAVAMotionDilation` — Helium HGNode subclass that dilates the AVA
 * motion mask.  Owns a small heap-allocated aligned coefficient buffer at
 * `this.coefficientBuf` (field @0x198 in the C++ layout).
 *
 * @Helium ctors @0x216620 (C2) / 0x216700 (C1);
 *         dtors  @0x2167e0 (D2) / 0x216830 (D1) / 0x216880 (D0);
 *         methods @0x2168d0 SetParameter, @0x2168e0 GetParameter,
 *                 @0x2168f0 GetOutput, @0x216520 GetDOD, @0x2165a0 GetROI,
 *                 @0x215e80 Bind, @0x215c30 BindTexture, @0x215390 GetProgram,
 *                 @0x2153c0 InitProgramDescriptor, @0x215be0 shaderDescription,
 *                 @0x2161e0 RenderTile, @0x215ea0 RenderTile_AVX.
 */
export class HgcAVAMotionDilation extends HGNode {
  /**
   * Heap-allocated aligned coefficient buffer (32-byte aligned, 96 bytes wide
   * of live data starting at offset 0 of the aligned region).  Field @0x198.
   *
   * We model it as a Float32Array covering the 96-byte payload; the
   * "pre-align pointer stash" that C++ uses to `delete` the raw allocation
   * is unnecessary in TS (the GC owns the underlying buffer).
   *
   * Layout inside the buffer (all offsets are from the buffer's own start,
   * i.e. what C++ calls `buf` = `this+0x198`):
   *   0x00..0x0f  4×f32 = (1.0, 1.0, 1.0, 1.0)   ← @Helium 0x3c7c40
   *   0x10..0x1f  4×f32 = (1.0, 1.0, 1.0, 1.0)   ← same const, second slot
   *   0x20..0x2f  4×f32 = (0, 0, 0, 0)           ← xorps
   *   0x30..0x3f  4×f32 = (0, 0, 0, 0)           ← xorps
   *   0x40..0x4f  raw bytes {00×12, ff×4}        ← @Helium 0x85fc40 (NaN-tail)
   *   0x50..0x5f  raw bytes {00×12, ff×4}        ← same const, second slot
   */
  coefficientBuf: Float32Array;

  /**
   * `HgcAVAMotionDilation::HgcAVAMotionDilation()` — Helium @0x216700 (C1).
   * The C2 body @0x216620 is an ICF-folded copy of the same 56-instruction
   * body; both signatures share this behavior.  Full transcription:
   *
   *   @0x21670a: HGNode::HGNode()                        [base init]
   *   @0x21670f: vtable install (leaq 0xa301e8 → *(this))
   *   @0x21671e: rawPtr = operator new[](0x87)           [__Znam]
   *   @0x216723: align: alignedBase = rawPtr + ((-(rawPtr+8)) & 0x1f)
   *   @0x216730: buf = alignedBase + 8
   *   @0x216734: *(alignedBase) = rawPtr                 [8-byte stash for free()]
   *   @0x216738: movaps @Helium 0x3c7c40 → xmm0          [= (1,1,1,1)]
   *   @0x21673f: buf[+0x10] = xmm0
   *   @0x216744: buf[+0x00] = xmm0
   *   @0x216749: xorps xmm0
   *   @0x21674c: buf[+0x20] = xmm0                       [= (0,0,0,0)]
   *   @0x216751: buf[+0x30] = xmm0
   *   @0x216756: movaps @Helium 0x85fc40 → xmm0          [= {0×12, ff×4}]
   *   @0x21675d: buf[+0x50] = xmm0
   *   @0x216762: buf[+0x40] = xmm0
   *   @0x216767: this->coefficientBuf(@0x198) = buf
   *   @0x21677b: this->vtbl[0x88](0, 1)  ≡ HGNode::SetFlags(this, 0, 1)
   *   @0x216791: this->vtbl[0x88](1, 1)  ≡ HGNode::SetFlags(this, 1, 1)
   *   @0x2167a7: this->vtbl[0x88](2, 1)  ≡ HGNode::SetFlags(this, 2, 1)
   *   @0x2167ad: renderPageStrategy = (renderPageStrategy & 0xFFFFF9FE) | 0x401
   */
  constructor() {
    // @0x21670a: HGNode::HGNode() initializes base fields.
    super();
    // @0x21670f..0x216716: vtable install — implicit in TS class semantics.

    // @0x21671e..0x216767: allocate and populate the aligned coefficient
    // buffer. In TS we model this as a 24-float (96-byte) Float32Array;
    // the alignment/stash dance is a no-op for GC-managed memory.
    this.coefficientBuf = new Float32Array(24);

    // @0x216738..0x216744: buf[+0x00..+0x1f] = CTOR_CONST_ONES twice.
    for (let i = 0; i < 4; i++) this.coefficientBuf[i] = CTOR_CONST_ONES[i];
    for (let i = 0; i < 4; i++) this.coefficientBuf[4 + i] = CTOR_CONST_ONES[i];

    // @0x216749..0x216751: buf[+0x20..+0x3f] left as zero (xorps zero-init).
    // (Float32Array is already zero-initialized by default; no writes needed.)

    // @0x216756..0x216762: buf[+0x40..+0x5f] = CTOR_CONST_ZEROS_MASK_BYTES twice.
    // Copy the raw byte pattern by reading through a Uint8 view of the same
    // underlying buffer — this preserves the last-lane NaN (0xFFFFFFFF).
    {
      const bytes = new Uint8Array(
        this.coefficientBuf.buffer,
        this.coefficientBuf.byteOffset,
        this.coefficientBuf.byteLength,
      );
      // buf byte-offset 0x40 = float index 16 -> byte 0x40 = 64.
      for (let i = 0; i < 16; i++) {
        bytes[0x40 + i] = CTOR_CONST_ZEROS_MASK_BYTES[i];
        bytes[0x50 + i] = CTOR_CONST_ZEROS_MASK_BYTES[i];
      }
    }

    // @0x216774..0x2167a7: three self-vcalls to HGNode::SetFlags @Helium
    // 0x11c8e0 (slot *0x88).  Because HGNode::SetFlags is not yet ported
    // as a method on HGNode.ts, delegate to the frontier stub which throws
    // citing its @0xADDR at first invocation.  All three calls have the
    // same shape (idx, 1) for idx ∈ {0, 1, 2}.
    HGNode_SetFlags_frontier(this, 0, 1);
    HGNode_SetFlags_frontier(this, 1, 1);
    HGNode_SetFlags_frontier(this, 2, 1);

    // @0x2167ad..0x2167ba: renderPageStrategy = (rps & 0xFFFFF9FE) | 0x401.
    // Starting from HGNode's init 0x200:
    //   0x200 & 0xFFFFF9FE = 0x200 & ~0x601 = 0x200 (bit 9 preserved by mask,
    //      wait: 0xFFFFF9FE's low 12 bits are 0x9FE = 1001 1111 1110 which
    //      clears bits 0, 9, 10 → 0x200 has bit 9 set which gets cleared →
    //      result = 0).
    //   Then OR 0x401 (bits 0 and 10) → 0x401.
    this.renderPageStrategy = (this.renderPageStrategy & 0xfffff9fe) | 0x401;
  }

  /**
   * `HgcAVAMotionDilation::SetParameter(int, float, float, float, float)` —
   * Helium @0x2168d0.  UNCONDITIONALLY returns -1 (0xffffffff) — this class
   * has no user-visible parameters.  Full asm (5 instructions):
   *
   *   0x2168d0: pushq %rbp
   *   0x2168d1: movq  %rsp, %rbp
   *   0x2168d4: movl  $0xffffffff, %eax
   *   0x2168d9: popq  %rbp
   *   0x2168da: retq
   */
  SetParameter(
    _idx: number,
    _a: number,
    _b: number,
    _c: number,
    _d: number,
  ): number {
    // @0x2168d4: return -1.
    return -1;
  }

  /**
   * `HgcAVAMotionDilation::GetParameter(int, float*)` — Helium @0x2168e0.
   * UNCONDITIONALLY returns -1 (0xffffffff) — no params to fetch.  Full
   * asm (5 instructions):
   *
   *   0x2168e0: pushq %rbp
   *   0x2168e1: movq  %rsp, %rbp
   *   0x2168e4: movl  $0xffffffff, %eax
   *   0x2168e9: popq  %rbp
   *   0x2168ea: retq
   */
  GetParameter(_idx: number, _out: Float32Array | null): number {
    // @0x2168e4: return -1.
    return -1;
  }

  /**
   * `HgcAVAMotionDilation::GetOutput(HGRenderer*)` — Helium @0x2168f0.
   * Returns `this` unmodified — no compositor / re-parenting is needed.
   * Full asm (5 instructions):
   *
   *   0x2168f0: pushq %rbp
   *   0x2168f1: movq  %rsp, %rbp
   *   0x2168f4: movq  %rdi, %rax        ; return this
   *   0x2168f7: popq  %rbp
   *   0x2168f8: retq
   */
  GetOutput(_renderer: HGRendererStub): HgcAVAMotionDilation {
    // @0x2168f4: return this.
    return this;
  }

  /**
   * `HgcAVAMotionDilation::GetDOD(HGRenderer*, int inputIdx, HGRect callerRect)` —
   * Helium @0x216520.  Same shape as HGComicEdges::GetDOD: identity return
   * for inputIdx == 0, else HGRectNull.
   *
   * Full asm:
   *   0x216520: movq  %rcx, %rax              ; return-hi = callerRect.lo (default)
   *   0x216523: testl %edx, %edx              ; inputIdx
   *   0x216525: je    0x21653a                ; if idx == 0, jump to identity path
   *   0x21652b: leaq  _HGRectNull(%rip),%rcx
   *   0x216532: movq  (%rcx), %rax
   *   0x216535: movq  0x8(%rcx), %r8
   *   0x216539: popq  %rbp
   *   0x21653a: movq  %r8, %rdx
   *   0x21653d: retq
   */
  GetDOD(
    _renderer: HGRendererStub,
    inputIdx: number,
    callerRect: HGRect,
  ): HGRect {
    // @0x216523: idx == 0 → identity.
    if (inputIdx === 0) return callerRect;
    // Else → HGRectNull (@0x21652b RIP-relative load of the C symbol `_HGRectNull`).
    return HGRectNull;
  }

  /**
   * `HgcAVAMotionDilation::GetROI(HGRenderer*, int inputIdx, HGRect callerRect)` —
   * Helium @0x2165a0.  Byte-for-byte identical structure to GetDOD @0x216520:
   * identity for idx == 0, else HGRectNull.  No sigma-scaled expansion
   * (unlike HGComicEdges::GetROI) — the shader's neighborhood samples are
   * within 1-2 pixels but this ROI dispatch trusts the caller.
   *
   * Full asm:
   *   0x2165a0: movq  %rcx, %rax
   *   0x2165a3: testl %edx, %edx
   *   0x2165a5: je    0x2165ba
   *   0x2165ab: leaq  _HGRectNull(%rip),%rcx
   *   0x2165b2: movq  (%rcx), %rax
   *   0x2165b5: movq  0x8(%rcx), %r8
   *   0x2165b9: popq  %rbp
   *   0x2165ba: movq  %r8, %rdx
   *   0x2165bd: retq
   */
  GetROI(
    _renderer: HGRendererStub,
    inputIdx: number,
    callerRect: HGRect,
  ): HGRect {
    // @0x2165a3: idx == 0 → identity.
    if (inputIdx === 0) return callerRect;
    // Else → HGRectNull.
    return HGRectNull;
  }

  /**
   * `HgcAVAMotionDilation::Bind(HGHandler*)` — Helium @0x215e80.
   * Tail-jumps `handler->vtbl[0xc0](handler)` and returns 0.  Slot *0xc0
   * on `HGHandler` is a frontier decode; on THIS class's own vtable *0xc0
   * = HGNode::BindParamBufferDesc(HGHandler*) @Helium 0x122000, but the
   * `%rdi` at the callq is the HANDLER, not `this`, so the dispatch is
   * through `handler->vt[0xc0]`, not our own.  Kept as a frontier vcall.
   *
   * Full asm (7 instructions):
   *   0x215e80: pushq %rbp
   *   0x215e81: movq  %rsp, %rbp
   *   0x215e84: movq  (%rdi), %rax          ; handler->vtbl
   *   0x215e87: callq *0xc0(%rax)           ; handler->vt[0xc0](handler)
   *   0x215e8d: xorl  %eax, %eax             ; return 0
   *   0x215e8f: popq  %rbp
   *   0x215e90: retq
   */
  Bind(handler: HGHandlerStub): number {
    // @0x215e87: dispatch through the handler's own vtable slot *0xc0.
    // This is a frontier virtual call (HGHandler vtable not yet decoded).
    HGHandler_vt_0xc0_frontier(handler);
    // @0x215e8d: return 0.
    return 0;
  }

  /**
   * `HgcAVAMotionDilation::BindTexture(HGHandler*, int)` — Helium @0x215c30.
   * 168-line vtable-heavy setup of texture coordinate arrays.  Depends on
   * decoded HGHandler vtable layout (slots *0x30/*0x38/*0x48/... — see
   * HGComicEdges.ts for the beginning of the frontier interface) plus at
   * least 6 texture-coord uploads (frag has _texCoord0..5).  Kept as a
   * throwing stub citing @Helium 0x215c30.
   */
  BindTexture(_handler: HGHandlerStub, _textureIndex: number): number {
    throw new Error(
      "HgcAVAMotionDilation::BindTexture @Helium 0x215c30 not yet ported — " +
        "168-line HGHandler-vtable-heavy setup of 6 texCoord uniforms " +
        "(_texCoord0.._texCoord5 in the shader); HGHandler vtable is " +
        "a frontier decode.",
    );
  }

  /**
   * `HgcAVAMotionDilation::GetProgram(HGRenderer*)` — Helium @0x215390.
   * Returns the Metal shader source IFF the renderer's active target is
   * EXACTLY 0x60b10, else null.  No GLSL fallback.
   *
   * Full asm:
   *   0x215394: movq  %rsi, %rdi
   *   0x215397: movl  $0x60000, %esi          ; kind = 0x60000
   *   0x21539c: callq HGRenderer::GetTarget(kind=0x60000)
   *   0x2153a1: xorl  %ecx, %ecx               ; default = null
   *   0x2153a3: cmpl  $0x60b10, %eax
   *   0x2153a8: leaq  0x6f207c(%rip), %rax    ; = HGCAVAMOTIONDILATION_METAL_SHADER
   *   0x2153af: cmoveq %rax, %rcx              ; if target == 0x60b10, rcx = shader
   *   0x2153b3: movq  %rcx, %rax               ; return rcx
   */
  GetProgram(renderer: HGRendererStub): string | null {
    // @0x215397..0x21539c: kind = 0x60000.
    const target = renderer.GetTarget(0x60000);
    // @0x2153a3..0x2153af: cmove — return shader source iff target == 0x60b10.
    // NOTE: `cmoveq` is EQ-cmove, so the test is `== 0x60b10` (not `>` as in
    // HGComicEdges::GetProgram which uses `jbe` for a `>` test).
    if (target === 0x60b10) {
      return HGCAVAMOTIONDILATION_METAL_SHADER;
    }
    return null;
  }

  /**
   * `HgcAVAMotionDilation::InitProgramDescriptor(HGProgramDescriptor*) const` —
   * Helium @0x2153c0.  A 479-line pipeline-state emitter that populates
   * the descriptor with the shader's texture bindings (6 texCoord uniforms,
   * 3 texture bindings, sampler states) and program constants.  Depends on
   * the HGProgramDescriptor field layout (a frontier decode) — kept as a
   * throwing stub citing @Helium 0x2153c0.
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorStub): void {
    throw new Error(
      "HgcAVAMotionDilation::InitProgramDescriptor @Helium 0x2153c0 not yet " +
        "ported — 479-line pipeline-state emitter; HGProgramDescriptor field " +
        "layout is a frontier decode.",
    );
  }

  /**
   * `HgcAVAMotionDilation::shaderDescription() const` — Helium @0x215be0.
   * Builds a `std::string` in the caller-provided sret buffer (%rdi) with
   * value `"HgcAVAMotionDilation [hgc1]"` — a 27-byte C string terminated
   * by a null.
   *
   * Full asm (recovered verbatim):
   *   0x215be6: movq  %rdi, %rbx                  ; out-buffer
   *   0x215be9: movl  $0x20, %edi                 ; alloc-size = 32 bytes
   *   0x215bee: callq operator new(32)            ; heap for the string body
   *   0x215bf3: this->m_data (@0x10) = new-ptr
   *   0x215bf7: this->m_size (@0x00) = 0x21       ; encoded long-form size
   *   0x215bfe: this->m_capacity (@0x08) = 0x1b   ; capacity = 27 chars
   *   0x215c06: movups @Helium 0x907390 → xmm0    ; = "nDilation [hgc1]"  (16B tail)
   *   0x215c0d: *(new-ptr + 0xb) = xmm0
   *   0x215c11: movups @Helium 0x907380 → xmm0    ; = "HgcAVAMotionDil"   (16B head)
   *              (actually 15 chars + terminating byte the pool has)
   *   0x215c18: *(new-ptr + 0x00) = xmm0
   *   0x215c1b: *(new-ptr + 0x1b) = 0             ; null terminator
   *
   * Faithful port: allocate the JS string once and return it. libc++'s SSO
   * bookkeeping is a runtime-representation concern that has no analog in
   * JS.
   */
  shaderDescription(): string {
    // @0x215c11 + @0x215c06 + @0x215c1b compose the 27-byte C string.
    return HGCAVAMOTIONDILATION_SHADER_DESCRIPTION;
  }

  /**
   * `HgcAVAMotionDilation::RenderTile(HGTile*)` — Helium @0x2161e0.  A
   * 340-line scalar CPU implementation of the same math as the Metal
   * shader above (max/sum dilation across 3 texture inputs).  Depends on
   * decoded HGTile field layout (source-bitmap ptr, dest-bitmap ptr, tile
   * rect, stride) and multiple RIP-relative float constants — all
   * frontier decodes.  Per PORTING_SPEC.md rule 3, this method throws
   * citing @Helium 0x2161e0.
   */
  RenderTile(_tile: HGTileStub): void {
    throw new Error(
      "HgcAVAMotionDilation::RenderTile @Helium 0x2161e0 not yet ported — " +
        "340-line scalar CPU kernel; depends on HGTile field layout " +
        "(frontier decode) and the math documented in " +
        "HGCAVAMOTIONDILATION_METAL_SHADER above.",
    );
  }

  /**
   * `HgcAVAMotionDilation::RenderTile_AVX(HGTile*)` — Helium @0x215ea0.
   * AVX-vectorized twin of RenderTile.  Same math + same frontier
   * dependencies + AVX intrinsics.  Per PORTING_SPEC.md rule 3, throws
   * citing @Helium 0x215ea0.
   */
  RenderTile_AVX(_tile: HGTileStub): void {
    throw new Error(
      "HgcAVAMotionDilation::RenderTile_AVX @Helium 0x215ea0 not yet ported — " +
        "AVX-vectorized twin of RenderTile @Helium 0x2161e0; same frontier " +
        "decodes plus AVX intrinsics.",
    );
  }
}

// ---------------------------------------------------------------------------
// Frontier-stub helpers used above.
// ---------------------------------------------------------------------------

/**
 * `HGNode::SetFlags(int idx, int value)` — Helium @0x11c8e0 (mangled
 * `__ZN6HGNode8SetFlagsEii`).  Base-class virtual invoked from
 * HgcAVAMotionDilation::HgcAVAMotionDilation @0x21677b/0x216791/0x2167a7
 * with (0,1), (1,1), (2,1).  Not yet ported to HGNode.ts (see the
 * vtable citation there at *0x88 = 0x11c8e0).  Frontier stub throwing
 * citing @Helium 0x11c8e0 until decoded.
 */
function HGNode_SetFlags_frontier(
  _self: HGNode,
  _idx: number,
  _value: number,
): number {
  throw new Error(
    "HGNode::SetFlags @Helium 0x11c8e0 not yet ported — invoked from " +
      "HgcAVAMotionDilation::HgcAVAMotionDilation @Helium " +
      "0x21677b / 0x216791 / 0x2167a7 with (idx∈{0,1,2}, value=1).",
  );
}

/**
 * `HGHandler::vt[0xc0](handler)` — the handler's own vtable slot @0xc0,
 * invoked from HgcAVAMotionDilation::Bind @Helium 0x215e87.  HGHandler is
 * a frontier decode; slot semantics are unknown.  Frontier stub throwing
 * citing @Helium 0x215e87 until decoded.
 */
function HGHandler_vt_0xc0_frontier(_handler: HGHandlerStub): void {
  throw new Error(
    "HGHandler::vt[0xc0] not yet ported — invoked from " +
      "HgcAVAMotionDilation::Bind @Helium 0x215e87; HGHandler vtable is a " +
      "frontier decode.",
  );
}

// ---------------------------------------------------------------------------
// Dtor notes (D2/D1/D0 @0x2167e0/0x216830/0x216880):
//   D1 dtor @0x216830 (recovered verbatim):
//     - reset vptr @0x216830..0x216837
//     - buf = this->coefficientBuf @0x198
//     - if buf == null → tail-jmp HGNode::~HGNode
//     - rawPtr = *(buf - 8)     [pre-align stash]
//     - if rawPtr == null → tail-jmp HGNode::~HGNode
//     - operator delete(rawPtr)  @0x216863 (__ZdlPv)
//     - tail-jmp HGNode::~HGNode
//   D2 has identical body (22 lines).
//   D0 (deleting) is D2 + operator delete(this).
//   In TypeScript the GC handles all of this — no explicit dtor needed.
// ---------------------------------------------------------------------------
