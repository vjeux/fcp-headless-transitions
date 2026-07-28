// raw-port/src/render/HgcBlendBlur_3.ts
//
// FCP `HgcBlendBlur_3` — Helium render-graph node that composites 3 blurred
// upstream textures (plus a mask) using two per-pixel opacity ramps.  The
// shader source (see `HGCBLENDBLUR3_METAL_SHADER` below) does:
//
//   r0.x = tex0[texCoord0].x                       (mask input)
//   r0.x = max(r0.x, 0)                            (clamp negative)
//   r0.x = r0.x * hg_Params[0].x                   (gain0)
//   r4.x = clamp((r0.x + params[1].x) * params[2].x, 0, 1)
//   r4   = mix(tex1_sample, tex2_sample, r4.xxxx)
//   r0.x = clamp((r0.x + params[3].x) * params[4].x, 0, 1)
//   output = mix(r4, tex3_sample, r0.xxxx)
//
// I.e. two piecewise-linear windows over the mask produce two blend weights,
// which composite (tex1 → tex2) and then that result → tex3.  A "3-way
// blur-blend" — hence the class name.
//
// The class exposes 5 user-visible parameters (idx 0..4), each a single
// float scalar (the shader only reads .x of each).  SetParameter / GetParameter
// mirror-store to two 16-byte slots at buf+idx*0x20 (base + high, both @+0x00
// and @+0x10 within the 0x20 stride).
//
// FRAMEWORK: Helium.framework (Final Cut Pro), x86_64 slice.
// DECODE: raw-port/re/disasm/Helium.HgcBlendBlur_3.*.s
//
// -----------------------------------------------------------------------------
// SYMBOLS TRANSCRIBED
// -----------------------------------------------------------------------------
//   @0x236470  __ZN14HgcBlendBlur_3C2Ev   HgcBlendBlur_3::HgcBlendBlur_3() [C2]
//   @0x236540  __ZN14HgcBlendBlur_3C1Ev   HgcBlendBlur_3::HgcBlendBlur_3() [C1 — ICF-shared with C2]
//   @0x236610  __ZN14HgcBlendBlur_3D2Ev   HgcBlendBlur_3::~HgcBlendBlur_3() [D2]
//   @0x236660  __ZN14HgcBlendBlur_3D1Ev   HgcBlendBlur_3::~HgcBlendBlur_3() [D1 — full free path]
//   @0x2366b0  __ZN14HgcBlendBlur_3D0Ev   HgcBlendBlur_3::~HgcBlendBlur_3() [D0]
//   @0x236700  __ZN14HgcBlendBlur_312SetParameterEiffff   SetParameter (idx 0..4, offset idx*0x20)
//   @0x236780  __ZN14HgcBlendBlur_312GetParameterEiPf     GetParameter (idx 0..4)
//   @0x2367d0  __ZN14HgcBlendBlur_39GetOutputEP10HGRenderer   GetOutput (returns this)
//   @0x236430  __ZN14HgcBlendBlur_36GetDODEP10HGRendereri6HGRect   GetDOD (identity for idx<4, else HGRectNull)
//   @0x236450  __ZN14HgcBlendBlur_36GetROIEP10HGRendereri6HGRect   GetROI (identity for idx<4, else HGRectNull)
//   @0x235f30  __ZN14HgcBlendBlur_34BindEP9HGHandler   Bind [FRONTIER — real body, extracted via raw bytes; 5 vcalls to handler->vt[0x90]]
//   @0x235e10  __ZN14HgcBlendBlur_311BindTextureEP9HGHandleri   BindTexture [FRONTIER — 149 lines]
//   @0x2359f0  __ZN14HgcBlendBlur_310GetProgramEP10HGRenderer   GetProgram (Metal shader iff target == 0x60b10)
//   @0x235a20  __ZNK14HgcBlendBlur_321InitProgramDescriptorEP19HGProgramDescriptor   InitProgramDescriptor [FRONTIER — 222 lines]
//   @0x235de0  __ZNK14HgcBlendBlur_317shaderDescriptionEv   shaderDescription ('HgcBlendBlur_3 [hgc1]')
//   @0x2362c0  __ZN14HgcBlendBlur_310RenderTileEP6HGTile   RenderTile [FRONTIER — 99-line scalar CPU kernel]
//   @0x236000  __ZN14HgcBlendBlur_314RenderTile_AVXEP6HGTile   RenderTile_AVX [FRONTIER — 164-line AVX kernel]
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from C2 ctor @0x236470).
// HGNode-base is 0x198 bytes wide.
// -----------------------------------------------------------------------------
//   ---- inherited from HGNode (size 0x198) ----
//     0x000..0x197 : HGNode fields.
//   ---- HgcBlendBlur_3-specific fields ----
//     0x198 : ptr to aligned coefficient buffer (0x107 bytes allocated raw via
//             __Znam @0x23648e; aligned to 32-byte boundary via
//                 rawPtr    = new byte[0x107]
//                 alignPad  = (-(rawPtr+8)) & 0x1f
//                 alignedBase = rawPtr + alignPad
//                 *alignedBase = rawPtr           // 8-byte stash for free()
//                 buf       = alignedBase + 8     // stored @0x198
//             See @0x236493..0x23650b.
//
//   From `*(self+0x198)`, i.e. the buf-relative view:
//     buf[+0x00..+0x9f]  5 param slots × 0x20 stride, each holding two mirror
//                        copies of the same float4:
//                          buf[+idx*0x20 +0x00..+0x0f] = (a,b,c,d)
//                          buf[+idx*0x20 +0x10..+0x1f] = (a,b,c,d)   (mirror)
//                        idx ∈ {0, 1, 2, 3, 4} — 5 params.  Ctor zero-inits
//                        all 10 slots via `xorps xmm0; movaps 8..0xb8`.
//     buf[+0xa0..+0xbf]  extra zero slots (idx=5 accessible via GetParameter
//                        but not SetParameter — SetParameter caps idx<=4).
//                        Actually: ctor writes zeros at +0xa8/+0xb8 too.
//     buf[+0xc0..+0xcf]  ctor writes (1.0f, 0, 0, 0)  ← @Helium 0x3c7cc0 (decoded)
//     buf[+0xd0..+0xdf]  ctor writes (1.0f, 0, 0, 0)  ← same const, second slot
//                        Neither slot is externally accessible; internal state.
//
//   Ctor tail: `renderPageStrategy = (renderPageStrategy & 0xFFFFF9FF) | 0x400`.
//   Starting from HGNode's init 0x200:
//     0x200 & 0xFFFFF9FF = 0x200 & ~0x600 = 0x0  (bits 9,10 cleared → bit 9 was set)
//     | 0x400 = 0x400.
//   Effective final `renderPageStrategy` = 0x400.
//
// -----------------------------------------------------------------------------
// GetProgram RESOURCE: single embedded Metal fragment shader (no GLSL
// fallback path). Literal-pool string @Helium (RIP-relative from @0x235a08 + 7
// = @0x235a0f, disp 0x6e8649 → data addr 0x91e058).
// MD5 in the source: `1a704606:298fad20:53f42e0b:42d4cdc2`.
// -----------------------------------------------------------------------------

import { HGNode } from "./HGNode.js";
import { HGRect, HGRectNull } from "./HGRect.js";

// ---------------------------------------------------------------------------
// Frontier stubs.
// ---------------------------------------------------------------------------

/**
 * `HGRenderer` — same interface as other HGNode subclasses.  HgcBlendBlur_3
 * reads only `GetTarget(unsigned int)`.
 */
export interface HGRendererStub {
  /** @Helium __ZN10HGRenderer9GetTargetEj — called from GetProgram @0x2359fc. */
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
 * `HGHandler` — GPU driver surface.  HgcBlendBlur_3::Bind and ::BindTexture
 * call into it heavily (frontier decode).
 */
export interface HGHandlerStub {
  readonly __brand: "HGHandler";
}

/**
 * `HGProgramDescriptor` — argument to InitProgramDescriptor (frontier
 * decode).
 */
export interface HGProgramDescriptorStub {
  readonly __brand: "HGProgramDescriptor";
}

/**
 * Vtable installed pointer, cited for provenance.  RIP-relative from
 * @0x23647f + 7 = @0x236486, disp 0x7fe912 → 0xa34d98.
 */
export const _HGCBLENDBLUR_3_VTABLE_ADDR = 0xa34d98;

// ---------------------------------------------------------------------------
// Decoded ctor constants
// ---------------------------------------------------------------------------

/**
 * @Helium 0x3c7cc0 (RIP-relative from @0x2364f3 + 8 = 0x2364fb, disp 0x1917c5).
 * A single 4-byte f32 = 1.0.  The ctor loads it via `movss` (not `movaps`),
 * so xmm0 = (1.0, 0, 0, 0) with the upper 3 lanes zeroed. It's then
 * stored twice via `movaps` (16-byte writes) at buf+0xc0 and buf+0xd0.
 */
const CTOR_CONST_ONE_ZERO_ZERO_ZERO: readonly [number, number, number, number] = [
  1.0, 0, 0, 0,
];

// ---------------------------------------------------------------------------
// Embedded Metal shader source (verbatim from GetProgram's literal pool)
// ---------------------------------------------------------------------------

/**
 * Metal fragment shader — returned by GetProgram when the renderer's active
 * target equals 0x60b10.  Literal-pool string @Helium (RIP-relative from
 * @0x235a08 + 7 = @0x235a0f, disp 0x6e8649 → data addr 0x91e058).
 * MD5 in the source: `1a704606:298fad20:53f42e0b:42d4cdc2`.
 */
export const HGCBLENDBLUR3_METAL_SHADER: string =
  "//Metal1.0     \n//LEN=0000000586\nfragment FragmentOut fragmentFunc(VertexInOut" +
  " frag [[ stage_in ]], \n    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n    sampler hg_Sampler0 [[" +
  " sampler(0) ]], \n    texture2d< float > hg_Texture1 [[ texture(1) ]], \n    sampler" +
  " hg_Sampler1 [[ sampler(1) ]], \n    texture2d< float > hg_Texture2 [[ texture(2)" +
  " ]], \n    sampler hg_Sampler2 [[ sampler(2) ]], \n    texture2d< float > hg_Texture3" +
  " [[ texture(3) ]], \n    sampler hg_Sampler3 [[ sampler(3) ]])\n{\n    const float4" +
  " c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n    float4 r0," +
  " r1, r2, r3, r4;\n    FragmentOut output;\n\n    r0.x = hg_Texture0.sample(hg_Sampler0," +
  " frag._texCoord0.xy).x;\n    r1 = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy);" +
  "\n    r2 = hg_Texture2.sample(hg_Sampler2, frag._texCoord2.xy);\n    r3 =" +
  " hg_Texture3.sample(hg_Sampler3, frag._texCoord3.xy);\n    r0.x = fmax(r0.x, c0.x);\n" +
  "    r0.x = r0.x*hg_Params[0].x;\n    r4.x = r0.x + hg_Params[1].x;\n    r4.x =" +
  " clamp(r4.x*hg_Params[2].x, 0.00000f, 1.00000f);\n    r4 = mix(r1, r2, r4.xxxx);\n" +
  "    r0.x = r0.x + hg_Params[3].x;\n    r0.x = clamp(r0.x*hg_Params[4].x, 0.00000f," +
  " 1.00000f);\n    output.color0 = mix(r4, r3, r0.xxxx);\n    return output;\n}\n" +
  "//MD5=1a704606:298fad20:53f42e0b:42d4cdc2\n//SIG=00000000:0000000f:0000000f:00000000" +
  ":0001:0005:0005:0000:0000:0000:001e:0000:0004:04:0:1:0\n";

/**
 * shaderDescription() output — verbatim 21-byte C string composed by the
 * disassembled body @0x235de0.  The body writes:
 *   *(out+0x00) = 0x2a                (encoded long-form size = 21<<1|0)
 *   *(out+0x01..0x10) = "HgcBlendBlur_3 [" (16-byte movups @0x235df8, RIP-relative
 *                       literal pool @Helium — the string starts at data addr
 *                       0x91e608 based on disp 0x6e880a from @0x235e00)
 *   *(out+0x0e..0x15) = "3 [hgc1]"     (8-byte movabsq immediate 0x5D316367685B2033
 *                       = little-endian bytes 33 20 5B 68 67 63 31 5D = "3 [hgc1]")
 *   *(out+0x16) = 0                    (null terminator)
 * Final string: "HgcBlendBlur_3 [hgc1]" (21 chars).
 */
export const HGCBLENDBLUR_3_SHADER_DESCRIPTION: string =
  "HgcBlendBlur_3 [hgc1]";

// ---------------------------------------------------------------------------
// HgcBlendBlur_3
// ---------------------------------------------------------------------------

/**
 * `HgcBlendBlur_3` — Helium HGNode subclass performing a 3-way blend-blur
 * composite.  Owns a heap-allocated 32-byte-aligned coefficient buffer at
 * field @0x198.
 *
 * @Helium ctors @0x236470 (C2) / 0x236540 (C1);
 *         dtors  @0x236610 (D2) / 0x236660 (D1) / 0x2366b0 (D0);
 *         methods @0x236700 SetParameter, @0x236780 GetParameter,
 *                 @0x2367d0 GetOutput, @0x236430 GetDOD, @0x236450 GetROI,
 *                 @0x235f30 Bind, @0x235e10 BindTexture, @0x2359f0 GetProgram,
 *                 @0x235a20 InitProgramDescriptor, @0x235de0 shaderDescription,
 *                 @0x2362c0 RenderTile, @0x236000 RenderTile_AVX.
 */
export class HgcBlendBlur_3 extends HGNode {
  /**
   * Heap-allocated aligned coefficient buffer.  Field @0x198 in the C++
   * layout.  We model as a Float32Array covering the live-data range
   * (0xe0 bytes = 56 f32s).  See the class-level comment for the exact
   * byte-offset semantics.
   */
  coefficientBuf: Float32Array;

  /**
   * `HgcBlendBlur_3::HgcBlendBlur_3()` — Helium @0x236470 (C2).  C1 body
   * @0x236540 is an ICF-folded copy.  Full transcription:
   *
   *   @0x23647a: HGNode::HGNode()                       [base init]
   *   @0x23647f: vtable install (leaq → 0xa34d98)
   *   @0x23648e: rawPtr = operator new[](0x107)          [__Znam]
   *   @0x236493: alignedBase = rawPtr + ((-(rawPtr+8)) & 0x1f)
   *   @0x2364a0: buf = alignedBase + 8
   *   @0x2364a4: *(alignedBase) = rawPtr                 [8-byte stash]
   *   @0x2364a8..@0x2364eb: xorps + 12x movaps → zero buf[+0x00..+0xbf]
   *                          (buf-relative offsets 0x00, 0x10, 0x20, ..., 0xb0
   *                           — 12 slots covering the 5 mirrored param pairs
   *                           plus extra zero slots).
   *   @0x2364f3: movss @Helium 0x3c7cc0 → xmm0           [xmm0 = (1.0, 0, 0, 0)]
   *   @0x2364fb: buf[+0xd0] = xmm0                       [via movaps: writes 16 bytes]
   *   @0x236503: buf[+0xc0] = xmm0
   *   @0x23650b: this->coefficientBuf (@0x198) = buf
   *   @0x236512: renderPageStrategy = (rps & 0xFFFFF9FF) | 0x400
   */
  constructor() {
    // @0x23647a: HGNode::HGNode() initializes base fields.
    super();
    // @0x23647f..0x236486: vtable install (implicit).

    // @0x23648e..0x2364a4: allocate + align coefficient buffer.  In TS the
    // alignment/stash dance is a no-op.
    // 0x107 bytes raw → after 32-byte alignment + 8-byte stash we have
    //   0x107 - 32 - 8 = 219 bytes MIN usable.
    // The live-data range accessed by SetParameter/GetParameter is 5×0x20 =
    // 0xa0 bytes.  Ctor also writes to +0xc0/+0xd0 (internal state), so we
    // budget 0xe0 = 224 bytes = 56 f32s.
    this.coefficientBuf = new Float32Array(56);

    // @0x2364a8..0x2364eb: zero-fill buf[+0x00..+0xbf] via 12x movaps of
    // xorps-cleared xmm0.  Float32Array is already zero-initialized.

    // @0x2364f3..0x236503: buf[+0xc0..+0xdf] = (1.0, 0, 0, 0) TWICE.
    // The Float32Array indices for buf+0xc0 are 0xc0/4 = 48, for buf+0xd0 = 52.
    for (let i = 0; i < 4; i++) {
      this.coefficientBuf[48 + i] = CTOR_CONST_ONE_ZERO_ZERO_ZERO[i];
      this.coefficientBuf[52 + i] = CTOR_CONST_ONE_ZERO_ZERO_ZERO[i];
    }

    // @0x236512..0x23651f: renderPageStrategy = (rps & 0xFFFFF9FF) | 0x400.
    //   0x200 & 0xFFFFF9FF = 0x200 & ~0x600 = 0x0 (bit 9 preserved by 0xFF9FF?
    //   wait: 0x9FF = 1001 1111 1111 which clears bit 9 & 10 → 0x200 loses bit 9 → 0x0).
    //   Then | 0x400 → 0x400.
    this.renderPageStrategy = (this.renderPageStrategy & 0xfffff9ff) | 0x400;
  }

  /**
   * `HgcBlendBlur_3::SetParameter(int idx, float a, float b, float c, float d)` —
   * Helium @0x236700.  Stores the 4 floats as (a,b,c,d) at buf+idx*0x20
   * (both the +0x00 and +0x10 slots — mirrored).  Returns 1 if any lane
   * changed, 0 if identical (no store), -1 if idx > 4.  If it stored,
   * additionally calls HGNode::ClearBits() @0x236768.
   *
   * Full asm:
   *   0x236700: movl  $0xffffffff, %eax             ; default = -1
   *   0x236705: cmpl  $0x4, %esi                    ; idx
   *   0x236708: ja    0x236773                      ; idx > 4 → return -1
   *   0x23670a: movq  0x198(%rdi), %rcx             ; rcx = buf
   *   0x236711: movl  %esi, %edx                    ; edx = idx (zext)
   *   0x236713: shlq  $0x5, %rdx                    ; rdx = idx << 5 = idx*32
   *   0x236717: leaq  (%rcx,%rdx), %rax             ; rax = &buf[idx*32]
   *   0x23671b: movss (%rcx,%rdx), %xmm4            ; xmm4 = buf[idx*32 + 0x00].x
   *   0x236720: ucomiss %xmm0, %xmm4                ; compare with a
   *   0x236723: jne   0x23674b                      ; differ → STORE
   *   0x236725: jp    0x23674b                      ; NaN → STORE
   *   0x236727..0x236749: same compare for +0x04/xmm1, +0x08/xmm2, +0x0c/xmm3
   *                       — if ALL four lanes match, jump to RET_ZERO @0x236774.
   *   0x23674b: pushq %rbp; movq %rsp, %rbp
   *   0x23674f: insertps ...  → xmm0 = (a, b, c, d)
   *   0x236761: movups %xmm0, 0x10(%rax)            ; buf[idx*32 + 0x10] = (a,b,c,d) (mirror)
   *   0x236765: movups %xmm0, (%rax)                 ; buf[idx*32 + 0x00] = (a,b,c,d) (base)
   *   0x236768: callq HGNode::ClearBits()            ; invalidate cached bits
   *   0x23676d: movl  $0x1, %eax                    ; return 1
   *   0x236772: popq  %rbp
   *   0x236773: retq
   *   0x236774: xorl  %eax, %eax                    ; RET_ZERO: return 0
   *   0x236776: retq
   */
  SetParameter(
    idx: number,
    a: number,
    b: number,
    c: number,
    d: number,
  ): number {
    // @0x236705..0x236708: idx > 4 (unsigned) → return -1.
    if ((idx >>> 0) > 4) return -1;

    // @0x23670a..0x236717: rax = &buf[idx*0x20].
    const base = idx << 3; // f32 index = (idx << 5) / 4 = idx*8

    // @0x23671b..0x236749: bit-exact-equal check across all 4 lanes.
    // ucomiss + jne + jp implements "==" with NaN-inequality — identical
    // to JS strict-equal semantics on finite floats.
    if (
      this.coefficientBuf[base + 0] === a &&
      this.coefficientBuf[base + 1] === b &&
      this.coefficientBuf[base + 2] === c &&
      this.coefficientBuf[base + 3] === d
    ) {
      // @0x236774..0x236776: return 0 without storing / calling ClearBits.
      return 0;
    }

    // @0x23674b..0x236765: store (a,b,c,d) at buf[idx*32 + 0x00] and
    // buf[idx*32 + 0x10] (mirror).
    // Base slot @+0x00..+0x0c:
    this.coefficientBuf[base + 0] = Math.fround(a);
    this.coefficientBuf[base + 1] = Math.fround(b);
    this.coefficientBuf[base + 2] = Math.fround(c);
    this.coefficientBuf[base + 3] = Math.fround(d);
    // Mirror slot @+0x10..+0x1c (4 f32s later = base+4):
    this.coefficientBuf[base + 4] = Math.fround(a);
    this.coefficientBuf[base + 5] = Math.fround(b);
    this.coefficientBuf[base + 6] = Math.fround(c);
    this.coefficientBuf[base + 7] = Math.fround(d);

    // @0x236768: HGNode::ClearBits() @Helium 0x11f6b0 — invalidates cached
    // render-graph bits.  Not yet ported to HGNode.ts (see the HGComicEdges
    // frontier stub).  Delegate through a local frontier stub.
    HGNode_ClearBits_frontier(this);

    // @0x23676d: return 1.
    return 1;
  }

  /**
   * `HgcBlendBlur_3::GetParameter(int idx, float* out)` — Helium @0x236780.
   * Reads back the 4-lane value stored at buf[idx*0x20 + 0x00] and writes to
   * *out.  Returns 0 on success, -1 if idx > 4.
   *
   * Full asm:
   *   0x236780: movl  $0xffffffff, %eax             ; default = -1
   *   0x236785: cmpl  $0x4, %esi
   *   0x236788: ja    0x2367c8                      ; idx > 4 → return -1
   *   0x23678a: pushq %rbp; movq %rsp, %rbp
   *   0x23678e: movq  0x198(%rdi), %rax             ; rax = buf
   *   0x236795: movl  %esi, %ecx
   *   0x236797: shlq  $0x5, %rcx                    ; rcx = idx*32
   *   0x23679b: movss (%rax,%rcx), %xmm0            ; xmm0 = buf[idx*32 + 0]
   *   0x2367a0: movss %xmm0, (%rdx)                  ; *out = xmm0
   *   0x2367a4: movss 0x4(%rax,%rcx), %xmm0
   *   0x2367aa: movss %xmm0, 0x4(%rdx)
   *   0x2367af: movss 0x8(%rax,%rcx), %xmm0
   *   0x2367b5: movss %xmm0, 0x8(%rdx)
   *   0x2367ba: movss 0xc(%rax,%rcx), %xmm0
   *   0x2367c0: movss %xmm0, 0xc(%rdx)
   *   0x2367c5: xorl  %eax, %eax                    ; return 0
   *   0x2367c7: popq  %rbp
   *   0x2367c8: retq
   */
  GetParameter(idx: number, out: Float32Array | null): number {
    // @0x236785..0x236788: idx > 4 → return -1.
    if ((idx >>> 0) > 4) return -1;
    // @0x23678e..0x236797: base index = idx*8 (f32 lanes).
    if (out === null) return 0; // Original C code doesn't null-check %rdx; but a
    // caller passing null would crash.  In TS, guard so we don't throw
    // on the write.
    const base = idx << 3;
    // @0x23679b..0x2367c0: copy 4 f32s from buf[base..base+3] into out[0..3].
    out[0] = this.coefficientBuf[base + 0];
    out[1] = this.coefficientBuf[base + 1];
    out[2] = this.coefficientBuf[base + 2];
    out[3] = this.coefficientBuf[base + 3];
    // @0x2367c5: return 0.
    return 0;
  }

  /**
   * `HgcBlendBlur_3::GetOutput(HGRenderer*)` — Helium @0x2367d0.  Returns
   * `this` unmodified.  Full asm (5 instructions):
   *
   *   0x2367d0: pushq %rbp
   *   0x2367d1: movq  %rsp, %rbp
   *   0x2367d4: movq  %rdi, %rax        ; return this
   *   0x2367d7: popq  %rbp
   *   0x2367d8: retq
   */
  GetOutput(_renderer: HGRendererStub): HgcBlendBlur_3 {
    // @0x2367d4: return this.
    return this;
  }

  /**
   * `HgcBlendBlur_3::GetDOD(HGRenderer*, int inputIdx, HGRect callerRect)` —
   * Helium @0x236430.  Identity return for inputIdx < 4 (the 4 texture
   * inputs), else HGRectNull.
   *
   * Full asm:
   *   0x236430: movq  %rcx, %rax
   *   0x236433: cmpl  $0x4, %edx
   *   0x236436: jb    0x23644b                     ; idx < 4 → identity
   *   0x236438: pushq %rbp; movq %rsp, %rbp
   *   0x23643c: leaq  _HGRectNull(%rip),%rcx
   *   0x236443: movq  (%rcx), %rax
   *   0x236446: movq  0x8(%rcx), %r8
   *   0x23644a: popq  %rbp
   *   0x23644b: movq  %r8, %rdx
   *   0x23644e: retq
   */
  GetDOD(
    _renderer: HGRendererStub,
    inputIdx: number,
    callerRect: HGRect,
  ): HGRect {
    // @0x236433..0x236436: idx < 4 (unsigned) → identity.
    if ((inputIdx >>> 0) < 4) return callerRect;
    // Else → HGRectNull.
    return HGRectNull;
  }

  /**
   * `HgcBlendBlur_3::GetROI(HGRenderer*, int inputIdx, HGRect callerRect)` —
   * Helium @0x236450.  Byte-for-byte identical structure to GetDOD:
   * identity for idx < 4, else HGRectNull.
   *
   * Full asm:
   *   0x236450: movq  %rcx, %rax
   *   0x236453: cmpl  $0x4, %edx
   *   0x236456: jb    0x23646b
   *   0x236458..0x23646a: (else path — load HGRectNull)
   *   0x23646b: movq  %r8, %rdx
   *   0x23646e: retq
   */
  GetROI(
    _renderer: HGRendererStub,
    inputIdx: number,
    callerRect: HGRect,
  ): HGRect {
    // @0x236453..0x236456: idx < 4 (unsigned) → identity.
    if ((inputIdx >>> 0) < 4) return callerRect;
    return HGRectNull;
  }

  /**
   * `HgcBlendBlur_3::Bind(HGHandler*)` — Helium @0x235f30.  The symbol is
   * ICF-related and otool -tV emits no distinct label; the body was recovered
   * from the raw bytes at file-offset 0x235f30 (see the class-level comment).
   * The routine issues 5 vtable calls on `handler->vt[0x90]`, one per
   * parameter slot in the coefficient buffer:
   *
   *   for idx in 0..=4:
   *     handler->vt[0x90](handler, idx, &this->coefficientBuf[idx*0x20], 1)
   *
   * Slot *0x90 on HGHandler is a frontier decode (probably a "bind uniform
   * buffer region" call).  Kept as a throwing stub citing @Helium 0x235f30.
   */
  Bind(_handler: HGHandlerStub): number {
    throw new Error(
      "HgcBlendBlur_3::Bind @Helium 0x235f30 not yet ported — 5 vcalls to " +
        "HGHandler::vt[0x90] to publish coefficient-buffer slots 0..4; " +
        "HGHandler vtable is a frontier decode.",
    );
  }

  /**
   * `HgcBlendBlur_3::BindTexture(HGHandler*, int)` — Helium @0x235e10.
   * 149-line vtable-heavy setup of texture-coord uniforms.  Depends on
   * decoded HGHandler vtable layout (frontier decode).  Throws citing
   * @Helium 0x235e10.
   */
  BindTexture(_handler: HGHandlerStub, _textureIndex: number): number {
    throw new Error(
      "HgcBlendBlur_3::BindTexture @Helium 0x235e10 not yet ported — " +
        "149-line HGHandler-vtable setup for 4 texCoord uniforms " +
        "(_texCoord0.._texCoord3); HGHandler vtable is a frontier decode.",
    );
  }

  /**
   * `HgcBlendBlur_3::GetProgram(HGRenderer*)` — Helium @0x2359f0.  Returns
   * the Metal shader source IFF the renderer's active target is EXACTLY
   * 0x60b10, else null.  No GLSL fallback.
   *
   * Full asm:
   *   0x2359f4: movq  %rsi, %rdi
   *   0x2359f7: movl  $0x60000, %esi                ; kind = 0x60000
   *   0x2359fc: callq HGRenderer::GetTarget(0x60000)
   *   0x235a01: xorl  %ecx, %ecx                     ; default = null
   *   0x235a03: cmpl  $0x60b10, %eax
   *   0x235a08: leaq  0x6e8649(%rip), %rax          ; = HGCBLENDBLUR3_METAL_SHADER
   *   0x235a0f: cmoveq %rax, %rcx                    ; if target == 0x60b10, rcx = shader
   *   0x235a13: movq  %rcx, %rax                     ; return rcx
   */
  GetProgram(renderer: HGRendererStub): string | null {
    // @0x2359f7..0x2359fc: kind = 0x60000.
    const target = renderer.GetTarget(0x60000);
    // @0x235a03..0x235a0f: cmove — return shader source iff target == 0x60b10.
    if (target === 0x60b10) {
      return HGCBLENDBLUR3_METAL_SHADER;
    }
    return null;
  }

  /**
   * `HgcBlendBlur_3::InitProgramDescriptor(HGProgramDescriptor*) const` —
   * Helium @0x235a20.  A 222-line pipeline-state emitter that populates
   * the descriptor with 4-texture bindings, 4 texCoord uniforms, sampler
   * states, and program-parameter layout.  Depends on the HGProgramDescriptor
   * field layout (frontier decode).  Throws citing @Helium 0x235a20.
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorStub): void {
    throw new Error(
      "HgcBlendBlur_3::InitProgramDescriptor @Helium 0x235a20 not yet " +
        "ported — 222-line pipeline-state emitter; HGProgramDescriptor field " +
        "layout is a frontier decode.",
    );
  }

  /**
   * `HgcBlendBlur_3::shaderDescription() const` — Helium @0x235de0.
   * Returns the C-string `"HgcBlendBlur_3 [hgc1]"` (21 bytes, null-terminated).
   * The disassembled body constructs a `std::string` in the caller's sret
   * buffer via:
   *
   *   0x235de7: movb  $0x2a, (%rdi)                  ; long-form size flag/size = 21<<1 = 0x2a
   *   0x235dea: movabsq $0x5D316367685B2033, %rcx   ; 8-byte immediate = "3 [hgc1]" LE
   *   0x235df4: movq  %rcx, 0xe(%rdi)                ; write bytes 14..21 of the string
   *   0x235df8: movups 0x6e880a(%rip), %xmm0         ; 16-byte load: "HgcBlendBlur_3 [" @Helium
   *   0x235dff: movups %xmm0, 0x1(%rdi)              ; write bytes 1..16 of the string
   *   0x235e03: movb  $0x0, 0x16(%rdi)               ; null terminator @byte 22
   */
  shaderDescription(): string {
    // @0x235df8 + @0x235dea compose the 21-byte C string.
    return HGCBLENDBLUR_3_SHADER_DESCRIPTION;
  }

  /**
   * `HgcBlendBlur_3::RenderTile(HGTile*)` — Helium @0x2362c0.  A 99-line
   * scalar CPU kernel evaluating the shader math per-pixel across 4 input
   * bitmaps.  Depends on decoded HGTile field layout (source-bitmap ptr per
   * input, dest-bitmap ptr, tile rect, stride) — a frontier decode.
   * Throws citing @Helium 0x2362c0.
   */
  RenderTile(_tile: HGTileStub): void {
    throw new Error(
      "HgcBlendBlur_3::RenderTile @Helium 0x2362c0 not yet ported — " +
        "99-line scalar CPU kernel evaluating the 4-texture blend-blur shader " +
        "math (see HGCBLENDBLUR3_METAL_SHADER above); HGTile field layout is " +
        "a frontier decode.",
    );
  }

  /**
   * `HgcBlendBlur_3::RenderTile_AVX(HGTile*)` — Helium @0x236000.  AVX-
   * vectorized twin of RenderTile.  164 lines; same frontier dependencies +
   * AVX intrinsics.  Throws citing @Helium 0x236000.
   */
  RenderTile_AVX(_tile: HGTileStub): void {
    throw new Error(
      "HgcBlendBlur_3::RenderTile_AVX @Helium 0x236000 not yet ported — " +
        "AVX-vectorized twin of RenderTile @Helium 0x2362c0.",
    );
  }
}

// ---------------------------------------------------------------------------
// Frontier-stub helpers used above.
// ---------------------------------------------------------------------------

/**
 * `HGNode::ClearBits()` — Helium @0x11f6b0.  Base-class virtual invoked from
 * HgcBlendBlur_3::SetParameter @0x236768 (post-store bookkeeping).  Not yet
 * ported to HGNode.ts (see the HGComicEdges/HGAnaglyph frontier stubs which
 * reference the same address).  Throws citing @Helium 0x11f6b0 until decoded.
 */
function HGNode_ClearBits_frontier(_self: HGNode): void {
  throw new Error(
    "HGNode::ClearBits @Helium 0x11f6b0 not yet ported — invoked from " +
      "HgcBlendBlur_3::SetParameter @Helium 0x236768 (post-store " +
      "invalidation of cached render-graph bits).",
  );
}

// ---------------------------------------------------------------------------
// Dtor notes (D2/D1/D0 @0x236610/0x236660/0x2366b0):
//   D1 dtor (structurally identical to HgcAVAMotionDilation::D1):
//     - reset vptr
//     - buf = this->coefficientBuf @0x198
//     - if buf == null → tail-jmp HGNode::~HGNode
//     - rawPtr = *(buf - 8)     [pre-align stash]
//     - if rawPtr == null → tail-jmp HGNode::~HGNode
//     - operator delete(rawPtr)  [__ZdlPv]
//     - tail-jmp HGNode::~HGNode
//   In TypeScript the GC handles this — no explicit dtor needed.
// ---------------------------------------------------------------------------
