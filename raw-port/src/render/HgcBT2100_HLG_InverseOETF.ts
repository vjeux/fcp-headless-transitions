// raw-port/src/render/HgcBT2100_HLG_InverseOETF.ts
//
// FCP `HgcBT2100_HLG_InverseOETF` — Helium HGC-shader compute node implementing
// the BT.2100 HLG **inverse OETF** as a piecewise per-channel function
// gated by a runtime threshold parameter.  The class is an HGNode subclass
// carrying a 32-byte-aligned parameter buffer (`hg_Params[]`) at instance
// offset +0x198, allocated in the ctor with pre-baked exp2-poly
// coefficients + fixed alpha threshold constants and populated by
// SetParameter() for the two user-tunable slots (`hg_Params[0]` and
// `hg_Params[1]`) that hold the HLG piecewise-branch parameters.
//
// Metal shader (verbatim from `GetProgram` @0x3b12f0 literal pool at
// disp32=0x62ce0c after the leaq at 0x3b1308):
//
//    const float4 c0 = float4(0.000000000, 0.004999999888, 0.000000000, 0.000000000);
//    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);
//    r1.xyz = fmax(r0.xyz, c0.xxx);                              // clamp negative RGB to 0
//    r0.xyz = r1.xyz*hg_Params[1].xxx + hg_Params[1].yyy;         // log-branch pre-arg
//    r2.xyz = r1.xyz*r1.xyz;                                     // linear-branch: r^2
//    r1.w  = float(r0.w >= c0.y);                                // alpha threshold (0.005)
//    r2.xyz = r2.xyz*hg_Params[0].yyy;                           //             * (1/3)
//    r0.xyz = exp2(r0.xyz);                                      // nonlinear:  exp2(a*r+b)
//    r0.xyz = r0.xyz*hg_Params[1].zzz + hg_Params[1].www;         //           * c + d
//    r1.xyz = float3(hg_Params[0].xxx < r1.xyz);                 // branch mask
//    output.color0.xyz = select(r2.xyz, r0.xyz, -r1.xyz < 0.0f); // pick per-lane
//    output.color0.w   = r1.w*r0.w;                              // alpha *= threshold
//
// Numerically that is BT.2100 HLG inverse OETF:
//    if r <= T:   E = (1/3) · r²                                 // linear low branch
//    if r >  T:   E = c · 2^(a·r + b) + d                        // exponential high branch
// with (a, b, c, d) = hg_Params[1].{x,y,z,w}, and T = hg_Params[0].x.
// Neither T nor (a,b,c,d) are baked into this class — they are runtime
// uniforms set by the caller via SetParameter() (@0x3b20f0).
//
// Symbols (Helium x86_64 slice; VAs are file offsets since the thin
// slice has __TEXT vmaddr=0):
//   @0x3b12f0  HgcBT2100_HLG_InverseOETF::GetProgram(HGRenderer*)
//   @0x3b1320  HgcBT2100_HLG_InverseOETF::InitProgramDescriptor(HGProgramDescriptor*) const
//   @0x3b1540  HgcBT2100_HLG_InverseOETF::shaderDescription() const
//   @0x3b1590  HgcBT2100_HLG_InverseOETF::BindTexture(HGHandler*, int)
//   @0x3b1600  HgcBT2100_HLG_InverseOETF::Bind(HGHandler*)
//   @0x3b1660  HgcBT2100_HLG_InverseOETF::RenderTile_AVX(HGTile*)
//   @0x3b1940  HgcBT2100_HLG_InverseOETF::RenderTile(HGTile*)
//   @0x3b1ce0  HgcBT2100_HLG_InverseOETF::GetDOD(HGRenderer*, int, HGRect)
//   @0x3b1d00  HgcBT2100_HLG_InverseOETF::GetROI(HGRenderer*, int, HGRect)
//   @0x3b1d20  HgcBT2100_HLG_InverseOETF::HgcBT2100_HLG_InverseOETF()   [C2]
//   @0x3b1e90  HgcBT2100_HLG_InverseOETF::HgcBT2100_HLG_InverseOETF()   [C1]
//   @0x3b2000  HgcBT2100_HLG_InverseOETF::~HgcBT2100_HLG_InverseOETF()  [D2]
//   @0x3b2050  HgcBT2100_HLG_InverseOETF::~HgcBT2100_HLG_InverseOETF()  [D1]
//   @0x3b20a0  HgcBT2100_HLG_InverseOETF::~HgcBT2100_HLG_InverseOETF()  [D0 deleting]
//   @0x3b20f0  HgcBT2100_HLG_InverseOETF::SetParameter(int, float, float, float, float)
//   @0x3b2170  HgcBT2100_HLG_InverseOETF::GetParameter(int, float*)
//   @0x3b21c0  HgcBT2100_HLG_InverseOETF::GetOutput(HGRenderer*)
//
// Instance layout (recovered from ctor @0x3b1e90 stores, dtors @0x3b2000/@0x3b20a0
// which deref `paramBuf[-1]` to free the original alloc, and the [rdi+0x198]
// param-buffer accesses in Bind/RenderTile/SetParameter/GetParameter):
//   +0x00..+0x197  HGNode base (built at 0x3b1e9a via HGNode::HGNode())
//   +0x00          vtable ptr installed at 0x3b1ea6 (RIP-loaded from disp32 0x6a2c7a)
//   +0x10          uint32 flags — masked with 0xfffff9ff then ORed with 0x400 at 0x3b1fdc/0x3b1fdf
//   +0x198         float* paramBuf — 32-byte-aligned pointer inside a
//                                    0x1c7-byte allocation.  Layout below.
//
// paramBuf layout (rdx = alignedBase + 8, stored at [self+0x198]):
//    slot #  bytes     content                       written at ctor addr
//    [0]   [0x00..0x0f]  hg_Params[0] mirror A (zeroed)     0x3b1ecb  (xmm0=0)
//    [1]   [0x10..0x1f]  hg_Params[0] mirror B (zeroed)     0x3b1ed0  (xmm0=0)
//    [2]   [0x20..0x2f]  hg_Params[1] mirror A (zeroed)     0x3b1ed5  (xmm0=0)
//    [3]   [0x30..0x3f]  hg_Params[1] mirror B (zeroed)     0x3b1eda  (xmm0=0)
//    [4]   [0x40..0x4f]  ALPHA_THRESH_VEC = (0,0,0,0.005)   0x3b1eeb  from @0x894e00
//    [5]   [0x50..0x5f]  ALPHA_THRESH_VEC (mirror)          0x3b1ee6  from @0x894e00
//    [6]   [0x60..0x6f]  EXP2_LOW_CLAMP = (-127,-127,-127,1) 0x3b1efc  from @0x894e10
//    [7]   [0x70..0x7f]  EXP2_LOW_CLAMP (mirror)            0x3b1ef7  from @0x894e10
//    [8]   [0x80..0x8f]  EXP2_C5 = (c5, c5, c5, 0),  c5=0.001795225543901324f  from @0x88e010
//    [9]   [0x90..0x9f]  EXP2_C5 (mirror)                                        from @0x88e010
//    [10]  [0xa0..0xaf]  EXP2_C4 = (c4, c4, c4, 0),  c4=0.009189177304506302f  from @0x88e020
//    [11]  [0xb0..0xbf]  EXP2_C4 (mirror)                                        from @0x88e020
//    [12]  [0xc0..0xcf]  EXP2_C3 = (c3, c3, c3, 0),  c3=0.05566123872995377f   from @0x88e030
//    [13]  [0xd0..0xdf]  EXP2_C3 (mirror)                                        from @0x88e030
//    [14]  [0xe0..0xef]  EXP2_C2 = (c2, c2, c2, 0),  c2=0.24020679295063019f   from @0x88e040
//    [15]  [0xf0..0xff]  EXP2_C2 (mirror)                                        from @0x88e040
//    [16]  [0x100..0x10f] EXP2_LN2 = (ln2, ln2, ln2, 1), ln2=0.6931475400924683f from @0x894e20
//    [17]  [0x110..0x11f] EXP2_LN2 (mirror)                                       from @0x894e20
//    [18]  [0x120..0x12f] EXP2_ONE_AND_THRESH = (1, 1, 1, 0.005f)               from @0x894e30
//    [19]  [0x130..0x13f] EXP2_ONE_AND_THRESH (mirror)                          from @0x894e30
//    [20]  [0x140..0x14f] EXP2_BIAS = i32(127, 127, 127, 0)                     from @0x88df70
//    [21]  [0x150..0x15f] EXP2_BIAS (mirror)                                    from @0x88df70
//    [22]  [0x160..0x16f] RGB_MASK  = (0xffffffff, 0xffffffff, 0xffffffff, 0)   from @0x88c7f0
//    [23]  [0x170..0x17f] RGB_MASK (mirror)                                     from @0x88c7f0
//    [24]  [0x180..0x18f] ALPHA_MASK = (0, 0, 0, 0xffffffff)                    from @0x85fc40
//    [25]  [0x190..0x19f] ALPHA_MASK (mirror)                                   from @0x85fc40
//
// The 5-term poly `1 + ln2·f + c2·f² + c3·f³ + c4·f⁴ + c5·f⁵` is the standard
// Cephes/Sleef-style min-max fit for exp2 on the fractional part f ∈ [0,1);
// combined with `2^floor(x)` reconstructed via `((int)floor(x)+127) << 23`
// this gives a single-precision `exp2f` finite-poly evaluator, matching what the
// `exp2(x)` intrinsic in the Metal shader compiles down to.
//
// This file transcribes:
//   * GetOutput, GetDOD, GetROI, shaderDescription, GetProgram,
//     InitProgramDescriptor, SetParameter, GetParameter — each cited @0xADDR.
//   * The parameter-buffer layout and its ctor initialisation.
//   * A scalar per-pixel port of the RenderTile hot loop's inverse-OETF math
//     that reproduces the four-lane SSE ops at 0x3b19d0..0x3b1aeb.
// Every FCP-object surface (HGTile, HGRenderer, HGHandler, HGProgramDescriptor,
// HGNode::ClearBits, HGNode::HGNode/~HGNode, HGObject::operator delete/new)
// and every yet-undecoded ctor callee is a THROWing stub carrying its @0xADDR.

import { HGRect, HGRectNull } from './HGRect';

// ---------------------------------------------------------------------------
// Undecoded FCP surface — every stub throws with its @0xADDR so
// `raw-port/army/frontier.py` can enumerate the gap.
// ---------------------------------------------------------------------------

/** HGTile — Helium's per-tile struct. Field offsets used in RenderTile:
 *  +0x00 int32 x0, +0x04 int32 y0, +0x08 int32 x1, +0x0c int32 y1,
 *  +0x10 void*  dst, +0x18 int32 dstStride16, +0x50 void* src,
 *  +0x58 int32 srcStride16 — recovered from RenderTile @0x3b197c/@0x3b1983/@0x3b1987.
 *  Full layout not yet transcribed here — the render loop is stubbed. */
export interface HGTile {
  x0: number; y0: number; x1: number; y1: number;
  dst: Float32Array; dstStride16: number;
  src: Float32Array; srcStride16: number;
}

/** HGRenderer — Helium's per-frame render context. Only method used is
 *  GetTarget(unsigned) — undecoded here. */
export interface HGRenderer {
  /** @Helium HGRenderer::GetTarget(unsigned) called from RenderTile @0x3b195a
   *  and GetProgram @0x3b12fc — returns the pixel-format tag compared to
   *  0x60b10 (in GetProgram) or 0x4700000/0x44fffff (in RenderTile). */
  GetTarget(index: number): number;
}

/** HGHandler — Helium's binding recorder. Only vfns at slots +0x30/+0x48/
 *  +0x80/+0x90/+0xa8/+0xc0 are called in Bind/BindTexture. Undecoded. */
export interface HGHandler {}

/** HGProgramDescriptor — Metal program-descriptor builder. Methods
 *  SetVisibleShaderWithSource, SetFragmentFunctionName, SetReturnBinding,
 *  SetArgumentBindings are called from InitProgramDescriptor. Undecoded. */
export interface HGProgramDescriptor {}

/** HGNode::HGNode() @Helium (called at ctor 0x3b1e9a) — not yet transcribed. */
function HGNode_ctor_placeholder(): never {
  throw new Error(
    "HGNode::HGNode @Helium __ZN6HGNodeC2Ev called at 0x3b1e9a not yet transcribed"
  );
}

/** HGNode::~HGNode() @Helium (tail-jmp target of D1/D2 dtors 0x3b2041/0x3b20d0)
 *  — not yet transcribed. */
function HGNode_dtor_placeholder(): never {
  throw new Error(
    "HGNode::~HGNode @Helium __ZN6HGNodeD2Ev called at 0x3b2041/0x3b20d0 not yet transcribed"
  );
}

/** HGNode::ClearBits() @Helium (called from SetParameter @0x3b2158) — not yet
 *  transcribed.  Marks the node's cached-output flag dirty. */
function HGNode_ClearBits_placeholder(): never {
  throw new Error(
    "HGNode::ClearBits @Helium __ZN6HGNode9ClearBitsEv called at 0x3b2158 not yet transcribed"
  );
}

/** HGObject::operator delete(void*) @Helium (tail-jmp of D0 @0x3b20de) —
 *  not yet transcribed. */
function HGObject_operatorDelete_placeholder(_p: unknown): never {
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv called at 0x3b20de not yet transcribed"
  );
}

/** ::operator delete(void*) @Helium (dtor free of paramBuf's raw alloc pointer
 *  @0x3b2033 in D2, @0x3b20c8 in D0) — not yet transcribed. */
function operator_delete_placeholder(_p: unknown): never {
  throw new Error(
    "operator delete @Helium __ZdlPv called at 0x3b2033/0x3b20c8 not yet transcribed"
  );
}

/** HGProgramDescriptor::SetVisibleShaderWithSource(const char*, const char*)
 *  @Helium (called from InitProgramDescriptor @0x3b1342) — not decoded. */
function HGProgramDescriptor_SetVisibleShaderWithSource(
  _d: HGProgramDescriptor, _name: string, _src: string
): never {
  throw new Error(
    "HGProgramDescriptor::SetVisibleShaderWithSource @Helium called at 0x3b1342 not yet transcribed"
  );
}

/** HGProgramDescriptor::SetFragmentFunctionName(const char*)
 *  @Helium (called from InitProgramDescriptor @0x3b1351) — not decoded. */
function HGProgramDescriptor_SetFragmentFunctionName(
  _d: HGProgramDescriptor, _name: string
): never {
  throw new Error(
    "HGProgramDescriptor::SetFragmentFunctionName @Helium called at 0x3b1351 not yet transcribed"
  );
}

/** HGProgramDescriptor::SetReturnBinding(HGBinding) @Helium
 *  (called from InitProgramDescriptor @0x3b1398) — not decoded. */
function HGProgramDescriptor_SetReturnBinding(
  _d: HGProgramDescriptor, _binding: unknown
): never {
  throw new Error(
    "HGProgramDescriptor::SetReturnBinding @Helium called at 0x3b1398 not yet transcribed"
  );
}

/** HGProgramDescriptor::SetArgumentBindings(vector<HGBinding> const&)
 *  @Helium (called from InitProgramDescriptor @0x3b1496) — not decoded. */
function HGProgramDescriptor_SetArgumentBindings(
  _d: HGProgramDescriptor, _bindings: unknown[]
): never {
  throw new Error(
    "HGProgramDescriptor::SetArgumentBindings @Helium called at 0x3b1496 not yet transcribed"
  );
}

/** HGHandler::TexCoord(int, int, int, const double*) @Helium (called from
 *  BindTexture @0x3b15cb) — not yet transcribed. */
function HGHandler_TexCoord_placeholder(
  _h: HGHandler, _a: number, _b: number, _c: number, _d: number[] | null
): never {
  throw new Error(
    "HGHandler::TexCoord @Helium __ZN9HGHandler8TexCoordEiiiPKd called at 0x3b15cb not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// Baked-in float constants read from the Helium __DATA_CONST section by the
// C2 ctor.  These are the values recovered by opening the framework at the
// listed file offsets (VA == file offset in the x86_64 thin slice).
// ---------------------------------------------------------------------------

/** float @0x894e00 — 4×f32 (0.0f, 0.0f, 0.0f, 0.004999999888241291f).
 *  Loaded twice (mirror at [buf+0x40] and [buf+0x50]) by ctor at 0x3b1eeb/@0x3b1ee6. */
const K_ALPHA_THRESH_VEC = new Float32Array([0.0, 0.0, 0.0, 0.004999999888241291]);

/** float @0x894e10 — 4×f32 (-127.0f, -127.0f, -127.0f, 1.0f).  Ctor 0x3b1efc/0x3b1ef7. */
const K_EXP2_LOW_CLAMP = new Float32Array([-127.0, -127.0, -127.0, 1.0]);

/** float @0x88e010 — 4×f32 (c5, c5, c5, 0), c5 = 0x3aeb4dc6 = 0.0017952255439013243f.  Ctor 0x3b1f08. */
const K_EXP2_C5 = new Float32Array([
  0.0017952255439013243, 0.0017952255439013243, 0.0017952255439013243, 0.0,
]);

/** float @0x88e020 — 4×f32 (c4, c4, c4, 0), c4 = 0x3c168e34 = 0.009189177304506302f.  Ctor 0x3b1f1f. */
const K_EXP2_C4 = new Float32Array([
  0.009189177304506302, 0.009189177304506302, 0.009189177304506302, 0.0,
]);

/** float @0x88e030 — 4×f32 (c3, c3, c3, 0), c3 = 0x3d63fd0a = 0.05566123872995377f.  Ctor 0x3b1f36. */
const K_EXP2_C3 = new Float32Array([
  0.05566123872995377, 0.05566123872995377, 0.05566123872995377, 0.0,
]);

/** float @0x88e040 — 4×f32 (c2, c2, c2, 0), c2 = 0x3e75f8c5 = 0.24020679295063019f.  Ctor 0x3b1f4d. */
const K_EXP2_C2 = new Float32Array([
  0.24020679295063019, 0.24020679295063019, 0.24020679295063019, 0.0,
]);

/** float @0x894e20 — 4×f32 (ln2, ln2, ln2, 1), ln2 = 0x3f31721e = 0.6931475400924683f.  Ctor 0x3b1f64. */
const K_EXP2_LN2_AND_ONE = new Float32Array([
  0.6931475400924683, 0.6931475400924683, 0.6931475400924683, 1.0,
]);

/** float @0x894e30 — 4×f32 (1, 1, 1, 0.005f).  Ctor 0x3b1f7b. */
const K_EXP2_ONE_AND_THRESH = new Float32Array([1.0, 1.0, 1.0, 0.004999999888241291]);

/** int32 @0x88df70 — 4×i32 (127, 127, 127, 0) — the exp2 exponent bias. Ctor 0x3b1f92. */
const K_EXP2_BIAS_I32 = new Int32Array([127, 127, 127, 0]);

/** i32 @0x88c7f0 — 4×i32 (0xffffffff, 0xffffffff, 0xffffffff, 0) — RGB AND-mask. Ctor 0x3b1fa9. */
const K_RGB_MASK_I32 = new Int32Array([-1, -1, -1, 0]);

/** i32 @0x85fc40 — 4×i32 (0, 0, 0, 0xffffffff) — alpha AND-mask. Ctor 0x3b1fc0/0x3b1fb2. */
const K_ALPHA_MASK_I32 = new Int32Array([0, 0, 0, -1]);

// ---------------------------------------------------------------------------
// Instance layout: the class carries a `paramBuf` shadowing what the Metal
// shader sees as `const constant float4* hg_Params`.  On the CPU side the
// buffer is 26 float4 slots (416 bytes) plus a 4-byte tail pad; a duplicate
// mirror of every 16-byte block is stored so that the SSE tile loop can load
// both `.xxx` broadcasts and the raw vector without a shufps chain.
// ---------------------------------------------------------------------------

/** Byte offset (relative to `paramBuf`) of each named 16-byte slot. */
export const PARAM_OFFSETS = {
  /** slot [0]  — @0x3b1ecb   hg_Params[0] mirror A */
  hgParams0_A: 0x00,
  /** slot [1]  — @0x3b1ed0   hg_Params[0] mirror B */
  hgParams0_B: 0x10,
  /** slot [2]  — @0x3b1ed5   hg_Params[1] mirror A */
  hgParams1_A: 0x20,
  /** slot [3]  — @0x3b1eda   hg_Params[1] mirror B */
  hgParams1_B: 0x30,
  /** slot [4]  — @0x3b1eeb   ALPHA_THRESH_VEC */
  alphaThresh_A: 0x40,
  /** slot [5]  — @0x3b1ee6   ALPHA_THRESH_VEC mirror */
  alphaThresh_B: 0x50,
  /** slot [6]  — @0x3b1efc   EXP2_LOW_CLAMP */
  exp2LowClamp_A: 0x60,
  /** slot [7]  — @0x3b1ef7   mirror */
  exp2LowClamp_B: 0x70,
  /** slot [8]  — @0x3b1f10   EXP2_C5 */
  exp2C5_A: 0x80,
  /** slot [9]  — @0x3b1f08   mirror */
  exp2C5_B: 0x90,
  /** slot [10] — @0x3b1f27   EXP2_C4 */
  exp2C4_A: 0xa0,
  /** slot [11] — @0x3b1f1f   mirror */
  exp2C4_B: 0xb0,
  /** slot [12] — @0x3b1f3e   EXP2_C3 */
  exp2C3_A: 0xc0,
  /** slot [13] — @0x3b1f36   mirror */
  exp2C3_B: 0xd0,
  /** slot [14] — @0x3b1f55   EXP2_C2 */
  exp2C2_A: 0xe0,
  /** slot [15] — @0x3b1f4d   mirror */
  exp2C2_B: 0xf0,
  /** slot [16] — @0x3b1f6c   EXP2_LN2_AND_ONE */
  exp2Ln2_A: 0x100,
  /** slot [17] — @0x3b1f64   mirror */
  exp2Ln2_B: 0x110,
  /** slot [18] — @0x3b1f83   EXP2_ONE_AND_THRESH */
  exp2OneThresh_A: 0x120,
  /** slot [19] — @0x3b1f7b   mirror */
  exp2OneThresh_B: 0x130,
  /** slot [20] — @0x3b1f9a   EXP2_BIAS (i32) */
  exp2Bias_A: 0x140,
  /** slot [21] — @0x3b1f92   mirror */
  exp2Bias_B: 0x150,
  /** slot [22] — @0x3b1fb1   RGB_MASK (i32) */
  rgbMask_A: 0x160,
  /** slot [23] — @0x3b1fa9   mirror */
  rgbMask_B: 0x170,
  /** slot [24] — @0x3b1fc8   ALPHA_MASK (i32) */
  alphaMask_A: 0x180,
  /** slot [25] — @0x3b1fc0   mirror */
  alphaMask_B: 0x190,
} as const;

/** Total size of the CPU-side parameter buffer.  In the binary the ctor
 *  allocates `0x1c7 = 455 bytes` (RIP-relative call to `operator new[]` at
 *  @0x3b1eae) — 32-byte-aligned this yields the same 26 × 16 = 0x1a0 span
 *  of live data, followed by an alignment tail. */
export const PARAM_BUF_LIVE_BYTES = 0x1a0;

/** HgcBT2100_HLG_InverseOETF instance shape.  In C++ this is `class ... :
 *  public HGNode { ... float* paramBuf; };` with the HGNode base occupying
 *  [+0x00..+0x197]. */
export interface HgcBT2100_HLG_InverseOETFInstance {
  /** HGNode base @+0x00..+0x197 — vtable slot @+0x00, flags @+0x10. */
  _base: unknown;
  /** flag word at instance offset +0x10 (masked with 0xfffff9ff | 0x400 in
   *  the ctor @0x3b1fd7..@0x3b1fe4).  Semantics live in HGNode. */
  flags: number;
  /** @+0x198  32-byte-aligned pointer inside the raw allocation.  Byte view
   *  used for the mixed f32/i32 lanes of the SSE tile path. */
  paramBuf: Float32Array;
  /** byte-aliased i32 view of the same allocation (0x140/0x150/0x160/0x170/
   *  0x180/0x190 slots are integer masks / exponent bias). */
  paramBufI32: Int32Array;
  /** For faithful dtor semantics: the allocator's raw base pointer (offset
   *  −8 from paramBuf).  Ctor stores this at `aligned+0` @0x3b1ec4;
   *  D0 @0x3b20bf and D2 @0x3b201a re-read it before calling operator delete. */
  paramBufRawBase: Float32Array | null;
}

/** Build a fresh param buffer preloaded with the baked-in constants, exactly
 *  matching what the C2 ctor writes between 0x3b1ec8 and 0x3b1fc8.
 *  The two runtime slots (hgParams0/1) are left zeroed. */
export function initParamBuffer(): { f32: Float32Array; i32: Int32Array } {
  const bytes = new ArrayBuffer(PARAM_BUF_LIVE_BYTES);
  const f32 = new Float32Array(bytes);
  const i32 = new Int32Array(bytes);

  // Slots [0..3] left at zero (ctor writes xmm0=0 into offsets 0x8..0x38 of
  // the raw alloc, which are our offsets 0x00..0x30). — @0x3b1ecb..@0x3b1eda

  // Slot [4]/[5] @0x3b1eeb/@0x3b1ee6 — ALPHA_THRESH_VEC
  f32.set(K_ALPHA_THRESH_VEC, PARAM_OFFSETS.alphaThresh_A / 4);
  f32.set(K_ALPHA_THRESH_VEC, PARAM_OFFSETS.alphaThresh_B / 4);

  // Slot [6]/[7] @0x3b1efc/@0x3b1ef7 — EXP2_LOW_CLAMP
  f32.set(K_EXP2_LOW_CLAMP, PARAM_OFFSETS.exp2LowClamp_A / 4);
  f32.set(K_EXP2_LOW_CLAMP, PARAM_OFFSETS.exp2LowClamp_B / 4);

  // Slot [8]/[9] @0x3b1f10/@0x3b1f08 — EXP2_C5
  f32.set(K_EXP2_C5, PARAM_OFFSETS.exp2C5_A / 4);
  f32.set(K_EXP2_C5, PARAM_OFFSETS.exp2C5_B / 4);

  // Slot [10]/[11] @0x3b1f27/@0x3b1f1f — EXP2_C4
  f32.set(K_EXP2_C4, PARAM_OFFSETS.exp2C4_A / 4);
  f32.set(K_EXP2_C4, PARAM_OFFSETS.exp2C4_B / 4);

  // Slot [12]/[13] @0x3b1f3e/@0x3b1f36 — EXP2_C3
  f32.set(K_EXP2_C3, PARAM_OFFSETS.exp2C3_A / 4);
  f32.set(K_EXP2_C3, PARAM_OFFSETS.exp2C3_B / 4);

  // Slot [14]/[15] @0x3b1f55/@0x3b1f4d — EXP2_C2
  f32.set(K_EXP2_C2, PARAM_OFFSETS.exp2C2_A / 4);
  f32.set(K_EXP2_C2, PARAM_OFFSETS.exp2C2_B / 4);

  // Slot [16]/[17] @0x3b1f6c/@0x3b1f64 — EXP2_LN2_AND_ONE
  f32.set(K_EXP2_LN2_AND_ONE, PARAM_OFFSETS.exp2Ln2_A / 4);
  f32.set(K_EXP2_LN2_AND_ONE, PARAM_OFFSETS.exp2Ln2_B / 4);

  // Slot [18]/[19] @0x3b1f83/@0x3b1f7b — EXP2_ONE_AND_THRESH
  f32.set(K_EXP2_ONE_AND_THRESH, PARAM_OFFSETS.exp2OneThresh_A / 4);
  f32.set(K_EXP2_ONE_AND_THRESH, PARAM_OFFSETS.exp2OneThresh_B / 4);

  // Slot [20]/[21] @0x3b1f9a/@0x3b1f92 — EXP2_BIAS_I32
  i32.set(K_EXP2_BIAS_I32, PARAM_OFFSETS.exp2Bias_A / 4);
  i32.set(K_EXP2_BIAS_I32, PARAM_OFFSETS.exp2Bias_B / 4);

  // Slot [22]/[23] @0x3b1fb1/@0x3b1fa9 — RGB_MASK
  i32.set(K_RGB_MASK_I32, PARAM_OFFSETS.rgbMask_A / 4);
  i32.set(K_RGB_MASK_I32, PARAM_OFFSETS.rgbMask_B / 4);

  // Slot [24]/[25] @0x3b1fc8/@0x3b1fc0 — ALPHA_MASK
  i32.set(K_ALPHA_MASK_I32, PARAM_OFFSETS.alphaMask_A / 4);
  i32.set(K_ALPHA_MASK_I32, PARAM_OFFSETS.alphaMask_B / 4);

  return { f32, i32 };
}

// ---------------------------------------------------------------------------
// Ctors and dtors.  The C1 complete-object ctor at 0x3b1e90 tail-jmps into
// C2 (via HGNode::HGNode + the paramBuf init above); we expose it as
// ctor_C1.  The C2 base-ctor at 0x3b1d20 is symbolically identical for the
// leaf part after HGNode init, and is not separately transcribed here — its
// disasm would repeat the same buffer writes.
// ---------------------------------------------------------------------------

/** HgcBT2100_HLG_InverseOETF::HgcBT2100_HLG_InverseOETF() @0x3b1e90 (C1
 *  complete-object ctor).  Steps recovered from disasm:
 *   0x3b1e9a  callq HGNode::HGNode()                — base init
 *   0x3b1ea6  movq  %rax,(%rbx)                    — install vtable @0x6a2c7a+PC
 *   0x3b1eae  callq operator new[](0x1c7)           — 455 bytes
 *   0x3b1eb3-0x3b1ec4  align rax+8 to 32B; store raw ptr at aligned+0
 *   0x3b1ec8-0x3b1fc8  populate 26 mirrored slots (see initParamBuffer)
 *   0x3b1fd0  movq  %rdx, 0x198(%rbx)              — install paramBuf pointer
 *   0x3b1fd7-0x3b1fe4  self->flags = (self->flags & 0xfffff9ff) | 0x400 */
export function ctor_C1_HgcBT2100_HLG_InverseOETF(): HgcBT2100_HLG_InverseOETFInstance {
  // Step 1: HGNode::HGNode() @0x3b1e9a — undecoded.
  HGNode_ctor_placeholder();
}

/** HgcBT2100_HLG_InverseOETF::~HgcBT2100_HLG_InverseOETF() @0x3b2000 (D2
 *  base dtor).  Steps recovered from disasm:
 *   0x3b2000  leaq  vtable(%rip), %rax; movq %rax,(%rdi) — re-install base vtbl
 *   0x3b200a  movq  0x198(%rdi), %rax                    — load paramBuf
 *   0x3b2011  testq %rax, %rax; je HGNode::~HGNode        — nothing to free
 *   0x3b201a  movq  -0x8(%rax), %rax                     — load raw alloc base
 *   0x3b201e  testq %rax, %rax; je HGNode::~HGNode        — nothing to free
 *   0x3b2033  callq operator delete(rawBase)
 *   0x3b2041  jmp   HGNode::~HGNode()                    — tail to base */
export function dtor_D2_HgcBT2100_HLG_InverseOETF(
  self: HgcBT2100_HLG_InverseOETFInstance
): void {
  if (self.paramBuf !== null && (self.paramBuf as unknown) !== undefined) {
    const raw = self.paramBufRawBase;
    if (raw !== null && raw !== undefined) {
      operator_delete_placeholder(raw); // @0x3b2033 — not yet transcribed
    }
  }
  // 0x3b2041: tail to HGNode::~HGNode() — not yet transcribed
  HGNode_dtor_placeholder();
}

/** HgcBT2100_HLG_InverseOETF::~HgcBT2100_HLG_InverseOETF() @0x3b2050 (D1
 *  complete-object dtor).  Byte-for-byte identical body to D2 @0x3b2000
 *  because there are no virtual bases; only the RIP-relative vtable disp
 *  differs.  Delegates to the D2 body. */
export function dtor_D1_HgcBT2100_HLG_InverseOETF(
  self: HgcBT2100_HLG_InverseOETFInstance
): void {
  dtor_D2_HgcBT2100_HLG_InverseOETF(self);
}

/** HgcBT2100_HLG_InverseOETF::~HgcBT2100_HLG_InverseOETF() @0x3b20a0 (D0
 *  deleting dtor).  Same free sequence as D1/D2, then tail-jmp to
 *  HGObject::operator delete(this) @0x3b20de. */
export function dtor_D0_HgcBT2100_HLG_InverseOETF(
  self: HgcBT2100_HLG_InverseOETFInstance
): void {
  if (self.paramBuf !== null && (self.paramBuf as unknown) !== undefined) {
    const raw = self.paramBufRawBase;
    if (raw !== null && raw !== undefined) {
      operator_delete_placeholder(raw); // @0x3b20c8 — not yet transcribed
    }
  }
  HGNode_dtor_placeholder();            // @0x3b20d0 — not yet transcribed
  HGObject_operatorDelete_placeholder(self); // @0x3b20de — not yet transcribed
}

// ---------------------------------------------------------------------------
// SetParameter / GetParameter — the only class-owned public API for tuning
// hg_Params[0..1].  Faithful transcription of the disasm; equivalence check
// short-circuits the write.
// ---------------------------------------------------------------------------

/** HgcBT2100_HLG_InverseOETF::SetParameter(int, float, float, float, float)
 *  @0x3b20f0.  Returns 0xffffffff for out-of-range index (`index > 1` treated
 *  as unsigned via `cmpl $1, %esi; ja ...`), 0 if the incoming vec exactly
 *  matches (no write, no ClearBits), 1 if it wrote the vec and called
 *  HGNode::ClearBits.
 *
 *  Layout: writes both mirrors — `[paramBuf + index*32 + 0]` and
 *  `[paramBuf + index*32 + 0x10]`.  This matches the shl $5 in the disasm
 *  and the two `movups %xmm0, ...` stores at 0x3b2151/@0x3b2155. */
export function SetParameter(
  self: HgcBT2100_HLG_InverseOETFInstance,
  index: number,
  x: number, y: number, z: number, w: number,
): number {
  // @0x3b20f5-@0x3b20f8: `cmpl $1, %esi; ja ret_ffffffff`
  if ((index >>> 0) > 1) return 0xffffffff | 0;

  const buf = self.paramBuf;
  // @0x3b2103: `shlq $5, %rdx` — index*32
  const off = ((index >>> 0) * 32) / 4;   // in float32 words

  // @0x3b210b-@0x3b2137: ucomiss/jne/jp chain — bit-identical equality using
  // fround (single-precision).  If all four match, return 0 and skip both
  // the store and the ClearBits call.
  const xf = Math.fround(x), yf = Math.fround(y), zf = Math.fround(z), wf = Math.fround(w);
  if (
    buf[off + 0] === xf &&
    buf[off + 1] === yf &&
    buf[off + 2] === zf &&
    buf[off + 3] === wf
  ) {
    return 0;
  }

  // @0x3b213f-@0x3b214b: insertps builds xmm0 = (x,y,z,w) as f32.
  // @0x3b2151/@0x3b2155: two `movups %xmm0` stores to `[rax+0x10]` then `[rax]`.
  buf[off + 0] = xf; buf[off + 1] = yf; buf[off + 2] = zf; buf[off + 3] = wf;
  buf[off + 4] = xf; buf[off + 5] = yf; buf[off + 6] = zf; buf[off + 7] = wf;

  // @0x3b2158: callq HGNode::ClearBits() — not yet transcribed.
  HGNode_ClearBits_placeholder(); // @0x3b2158

  return 1;
}

/** HgcBT2100_HLG_InverseOETF::GetParameter(int, float*) @0x3b2170.
 *  Reads slot A (`[paramBuf + index*32 + 0..0xc]`) into a caller-supplied
 *  4-element out array.  Returns 0xffffffff for OOB, 0 on success.
 *  Layout: 4 × movss from `[rax + rcx]` with rcx = index*32. */
export function GetParameter(
  self: HgcBT2100_HLG_InverseOETFInstance,
  index: number,
  out: Float32Array | number[],
): number {
  if ((index >>> 0) > 1) return 0xffffffff | 0;
  const buf = self.paramBuf;
  const off = ((index >>> 0) * 32) / 4;
  out[0] = buf[off + 0]; // @0x3b218b
  out[1] = buf[off + 1]; // @0x3b2194
  out[2] = buf[off + 2]; // @0x3b219f
  out[3] = buf[off + 3]; // @0x3b21aa
  return 0;
}

// ---------------------------------------------------------------------------
// GetOutput / GetDOD / GetROI / shaderDescription / GetProgram — the
// small "descriptor" vfns.
// ---------------------------------------------------------------------------

/** HgcBT2100_HLG_InverseOETF::GetOutput(HGRenderer*) @0x3b21c0.
 *  Disasm: pushq %rbp; movq %rsp,%rbp; movq %rdi,%rax; popq %rbp; retq.
 *  I.e. this node's output IS the node itself; returns `this`. */
export function GetOutput(
  self: HgcBT2100_HLG_InverseOETFInstance,
  _renderer: HGRenderer,
): HgcBT2100_HLG_InverseOETFInstance {
  return self;
}

/** HgcBT2100_HLG_InverseOETF::GetDOD(HGRenderer*, int, HGRect) @0x3b1ce0.
 *  For output index 0 it returns the passed-in HGRect verbatim; for any
 *  other index it loads _HGRectNull and returns {0,0,0,0}. */
export function GetDOD(
  _self: HgcBT2100_HLG_InverseOETFInstance,
  _renderer: HGRenderer,
  index: number,
  rect: HGRect,
): HGRect {
  // @0x3b1ce3-@0x3b1ce5: testl %edx, %edx; je passthrough
  if (index !== 0) return HGRectNull; // @0x3b1ceb: leaq _HGRectNull(%rip), %rcx
  return rect;
}

/** HgcBT2100_HLG_InverseOETF::GetROI(HGRenderer*, int, HGRect) @0x3b1d00.
 *  Symbol-identical body to GetDOD. */
export function GetROI(
  _self: HgcBT2100_HLG_InverseOETFInstance,
  _renderer: HGRenderer,
  index: number,
  rect: HGRect,
): HGRect {
  if (index !== 0) return HGRectNull; // @0x3b1d0b: leaq _HGRectNull(%rip)
  return rect;
}

/** HgcBT2100_HLG_InverseOETF::shaderDescription() const @0x3b1540.
 *  Allocates 0x28 bytes for a std::string, sets size=0x29 and capacity=0x20
 *  (small-string form flags on the string ABI), then movups-copies the
 *  literal `"HgcBT2100_HLG_InverseOETF [hgc1]"` (32 bytes incl. NUL) into the
 *  string body.  For the port we simply return the literal. */
export function shaderDescription(_self: HgcBT2100_HLG_InverseOETFInstance): string {
  // @0x3b1571-@0x3b157b: two movups load the 32-byte string literal
  // `"HgcBT2100_HLG_InverseOETF [hgc1]"` from the literal pool + a trailing
  // NUL byte at offset +0x20.
  return "HgcBT2100_HLG_InverseOETF [hgc1]";
}

/** The Metal fragment-function source returned by `GetProgram` for pixel
 *  targets whose HGRenderer::GetTarget(0)==0x60b10 (the sole comparison at
 *  @0x3b1303).  Verbatim from the literal pool at RIP-relative disp 0x62ce0c
 *  loaded at @0x3b1308.  Non-matching target returns nullptr. */
export const HgcBT2100_HLG_InverseOETF_MetalShaderSource: string =
  "//Metal1.0     \n" +
  "//LEN=0000000407\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    const float4 c0 = float4(0.000000000, 0.004999999888, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1, r2;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n" +
  "    r1.xyz = fmax(r0.xyz, c0.xxx);\n" +
  "    r0.xyz = r1.xyz*hg_Params[1].xxx + hg_Params[1].yyy;\n" +
  "    r2.xyz = r1.xyz*r1.xyz;\n" +
  "    r1.w = float(r0.w >= c0.y);\n" +
  "    r2.xyz = r2.xyz*hg_Params[0].yyy;\n" +
  "    r0.xyz = exp2(r0.xyz);\n" +
  "    r0.xyz = r0.xyz*hg_Params[1].zzz + hg_Params[1].www;\n" +
  "    r1.xyz = float3(hg_Params[0].xxx < r1.xyz);\n" +
  "    output.color0.xyz = select(r2.xyz, r0.xyz, -r1.xyz < 0.00000f);\n" +
  "    output.color0.w = r1.w*r0.w;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=9d3926b3:95147086:aed26591:6ed500f8\n" +
  "//SIG=00000000:00000001:00000001:00000000:0001:0002:0003:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/** The "visible" shader source used by InitProgramDescriptor (RIP-relative
 *  disp32 0x62d245 loaded at @0x3b1338). */
export const HgcBT2100_HLG_InverseOETF_MetalVisibleSource: string =
  "//Metal1.0     \n" +
  "//LEN=00000002ea\n" +
  "[[ visible ]] FragmentOut HgcBT2100_HLG_InverseOETF_hgc_visible(const constant float4* hg_Params,\n" +
  "    float4 color0)\n" +
  "{\n" +
  "    const float4 c0 = float4(0.000000000, 0.004999999888, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1, r2;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = color0;\n" +
  "    r1.xyz = fmax(r0.xyz, c0.xxx);\n" +
  "    r0.xyz = r1.xyz*hg_Params[1].xxx + hg_Params[1].yyy;\n" +
  "    r2.xyz = r1.xyz*r1.xyz;\n" +
  "    r1.w = float(r0.w >= c0.y);\n" +
  "    r2.xyz = r2.xyz*hg_Params[0].yyy;\n" +
  "    r0.xyz = exp2(r0.xyz);\n" +
  "    r0.xyz = r0.xyz*hg_Params[1].zzz + hg_Params[1].www;\n" +
  "    r1.xyz = float3(hg_Params[0].xxx < r1.xyz);\n" +
  "    output.color0.xyz = select(r2.xyz, r0.xyz, -r1.xyz < 0.00000f);\n" +
  "    output.color0.w = r1.w*r0.w;\n" +
  "    return output;\n" +
  "}\n";

/** HgcBT2100_HLG_InverseOETF::GetProgram(HGRenderer*) @0x3b12f0.
 *  The renderer's target format is compared to 0x60b10 (@0x3b1303: `cmpl
 *  $0x60b10, %eax`); on match it returns the Metal source pointer, otherwise
 *  nullptr (`cmoveq` @0x3b130f). */
export function GetProgram(
  _self: HgcBT2100_HLG_InverseOETFInstance,
  renderer: HGRenderer,
): string | null {
  // @0x3b12f7-@0x3b12fc: GetTarget(0x60000) — returns the target format tag.
  const target = renderer.GetTarget(0x60000);
  // @0x3b1303: cmp $0x60b10 — the sole supported Metal target.
  if (target === 0x60b10) return HgcBT2100_HLG_InverseOETF_MetalShaderSource;
  return null;
}

/** HgcBT2100_HLG_InverseOETF::InitProgramDescriptor(HGProgramDescriptor*) const
 *  @0x3b1320. */
export function InitProgramDescriptor(
  _self: HgcBT2100_HLG_InverseOETFInstance,
  descriptor: HGProgramDescriptor,
): void {
  // @0x3b1342: SetVisibleShaderWithSource("HgcBT2100_HLG_InverseOETF_hgc_visible", source)
  HGProgramDescriptor_SetVisibleShaderWithSource(
    descriptor,
    "HgcBT2100_HLG_InverseOETF_hgc_visible",
    HgcBT2100_HLG_InverseOETF_MetalVisibleSource,
  );
  // @0x3b1351: SetFragmentFunctionName("HgcBT2100_HLG_InverseOETF")
  HGProgramDescriptor_SetFragmentFunctionName(descriptor, "HgcBT2100_HLG_InverseOETF");
  // @0x3b1398: SetReturnBinding({ tag=4, kind=0x16, name="FragmentOut" })
  HGProgramDescriptor_SetReturnBinding(descriptor, { tag: 4, kind: 0x16, name: "FragmentOut" });
  // @0x3b1496: SetArgumentBindings(vector of two HGBinding — tag=2 "float4", tag=0xa "float4").
  HGProgramDescriptor_SetArgumentBindings(descriptor, [
    { tag: 2, kind: 0x0c, name: "float4" },   // @0x3b13be-@0x3b13e5: first emplace_back
    { tag: 0xa, kind: 0x0c, name: "float4" }, // @0x3b1409-@0x3b1461: second emplace_back
  ]);
}

/** HgcBT2100_HLG_InverseOETF::BindTexture(HGHandler*, int) @0x3b1590.
 *  For index==0 it: calls handler-vfn @+0x48 with (0, 0), then vfn @+0x30
 *  with (0, 0), then HGHandler::TexCoord(0, 0, 0, nullptr), then reads
 *  self+0x90 (an unnamed member — beyond the parameter buffer, not decoded
 *  here) and dispatches vfn @+0x80 with esi=0x2e; if that returns 0 it
 *  finally calls vfn @+0xa8 on the handler.  For any other index it just
 *  returns 0xffffffff without touching the handler. */
export function BindTexture(
  _self: HgcBT2100_HLG_InverseOETFInstance,
  _handler: HGHandler,
  index: number,
): number {
  if (index !== 0) return 0xffffffff | 0; // @0x3b1597-@0x3b159e
  // @0x3b15a3-@0x3b15af: handler->vfn[0x48/8](0, 0)
  // @0x3b15b2-@0x3b15bc: handler->vfn[0x30/8](0, 0)
  // @0x3b15c6-@0x3b15cb: HGHandler::TexCoord(0, 0, 0, nullptr)
  HGHandler_TexCoord_placeholder(_handler, 0, 0, 0, null);
  // @0x3b15d0-@0x3b15f5: (self+0x90)->vfn[0x80/8](0x2e); if returns 0, call
  //  self.vfn[0xa8/8]().  Full path not yet transcribed.
  throw new Error(
    "HgcBT2100_HLG_InverseOETF::BindTexture @Helium @0x3b1590 handler-vtable slots +0x30/+0x48/+0x80/+0xa8 not yet transcribed"
  );
}

/** HgcBT2100_HLG_InverseOETF::Bind(HGHandler*) @0x3b1600.
 *  Loads paramBuf pointer from self+0x198, calls handler->vfn[0x90/8]
 *  (paramBuf, 0, 1) — the "first parameter" binding — then reads
 *  paramBuf+0x20 and calls handler->vfn[0x90/8](paramBuf+0x20, 1, 1) —
 *  the "second parameter" binding.  Then dispatches self.vfn[0xc0/8] with
 *  the handler.  Full body stubbed because vfns are undecoded. */
export function Bind(
  _self: HgcBT2100_HLG_InverseOETFInstance,
  _handler: HGHandler,
): number {
  // @0x3b160d: rdx = paramBuf; @0x3b1621: handler->vfn[0x90/8](paramBuf, 0, 1)
  // @0x3b162e: rdx = paramBuf + 0x20; @0x3b1642: handler->vfn[0x90/8](paramBuf+0x20, 1, 1)
  // @0x3b1651: self->vfn[0xc0/8](handler)
  throw new Error(
    "HgcBT2100_HLG_InverseOETF::Bind @Helium @0x3b1600 handler-vtable slots +0x90 / self-vtable slot +0xc0 not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// Per-pixel scalar port of the RenderTile hot loop.  Faithful transcription
// of the SSE ops at 0x3b19d0..0x3b1aeb.
// ---------------------------------------------------------------------------

/** exp2f five-term Horner poly baked into paramBuf.  Matches the SSE ops at
 *  0x3b1a43..@0x3b1aaf bit-for-bit modulo Math.fround rounding.
 *
 *  Steps mirror @0x3b1a43..@0x3b1aaf in the SSE loop:
 *    1. clamp x to [-127, +inf)                    @0x3b1a43 (maxps with LOW_CLAMP)
 *    2. n = floor(x)                              @0x3b1a48 (roundps mode 9 = round-to-neg-inf)
 *    3. f = x - n                                 @0x3b1a4f (subps)
 *    4. Horner poly:                              @0x3b1a5b..@0x3b1a97
 *         t = ((c5*f + c4)*f² + (c3*f + c2))*f + ln2)*f + 1
 *    5. 2^n via `((int)n + 127) << 23`             @0x3b1a9b..@0x3b1aaf
 *    6. result = 2^n * t                          @0x3b1aaf (mulps)
 *
 *  All arithmetic uses Math.fround to reproduce single-precision rounding. */
export function exp2f_hgc(x: number): number {
  // @0x3b1a43: clamp to LOW_CLAMP.x = -127.
  const xc = Math.fround(Math.max(x, -127.0));
  // @0x3b1a48: floor via roundps mode 9.
  const n = Math.fround(Math.floor(xc));
  // @0x3b1a4f: fractional part.
  const f = Math.fround(xc - n);
  // @0x3b1a57: f²
  const f2 = Math.fround(f * f);

  // c5 from @0x88e010, c4 from @0x88e020, c3 from @0x88e030, c2 from @0x88e040.
  const c5 = 0.0017952255439013243;
  const c4 = 0.009189177304506302;
  const c3 = 0.05566123872995377;
  const c2 = 0.24020679295063019;
  // ln2 from @0x894e20.
  const ln2 = 0.6931475400924683;

  // @0x3b1a5b-@0x3b1a6f: xmm12 = (c5*f + c4) * f²
  const t12 = Math.fround(Math.fround(Math.fround(c5 * f) + c4) * f2);
  // @0x3b1a73-@0x3b1a87: xmm11 = (c3*f + c2) + t12
  const t11 = Math.fround(Math.fround(Math.fround(c3 * f) + c2) + t12);
  // @0x3b1a8b: * f
  const t11a = Math.fround(t11 * f);
  // @0x3b1a8f: + ln2
  const t11b = Math.fround(t11a + ln2);
  // @0x3b1a93: * f
  const t11c = Math.fround(t11b * f);
  // @0x3b1a97: + 1  (from EXP2_ONE_AND_THRESH.x = 1)
  const poly = Math.fround(t11c + 1.0);

  // @0x3b1a9b: cvttps2dq → n as i32.
  const ni = n | 0;
  // @0x3b1aa0: + 127 (K_EXP2_BIAS_I32).
  const biasedInt = (ni + 127) | 0;
  // @0x3b1aa9: << 23 into the float32 exponent field → 2^n.  Use
  // ArrayBuffer aliasing to reinterpret i32→f32 bit pattern.
  const _scratch = new ArrayBuffer(4);
  const _sf = new Float32Array(_scratch);
  const _si = new Int32Array(_scratch);
  _si[0] = (biasedInt << 23) | 0;
  const twoToN = _sf[0];

  // @0x3b1aaf: 2^n * poly.
  return Math.fround(twoToN * poly);
}

/** Per-lane RGB port of the inverse-OETF math at RenderTile @0x3b19d0..@0x3b1aeb.
 *
 *  Given a single float32 RGB channel `r` and the runtime `hg_Params[0..1]`
 *  (each a 4-float vec — .x=threshold/scale, .y=linScale/logOffset, etc.)
 *  returns the transformed value:
 *      if r <= T:  E = (1/3) * r²
 *      if r >  T:  E = c * 2^(a*r + b) + d
 *  with T = hgParams0.x, linScale = hgParams0.y (should be 1/3 for HLG),
 *       (a,b,c,d) = hgParams1.{x,y,z,w}. */
export function renderChannel_HLG_InverseOETF(
  r: number,
  hgParams0: Float32Array,
  hgParams1: Float32Array,
): number {
  // @0x3b19f5: max(r, 0)  — RGB lanes of ALPHA_THRESH_VEC are 0.
  const rClamped = Math.fround(Math.max(Math.fround(r), 0.0));

  // @0x3b19ff-@0x3b1a0b: xmm9 = a*r + b   (log-branch pre-arg)
  const a = Math.fround(hgParams1[0]);
  const b = Math.fround(hgParams1[1]);
  const logArg = Math.fround(Math.fround(a * rClamped) + b);

  // @0x3b1a1a: xmm10 = r²   (linear branch base)
  const r2 = Math.fround(rClamped * rClamped);

  // @0x3b1a3b-@0x3b1a3f: xmm6 = hg_Params[0].y * r²   → linear branch result
  const linScale = Math.fround(hgParams0[1]);
  const linear = Math.fround(linScale * r2);

  // @0x3b1a43-@0x3b1aaf: xmm8 = exp2(logArg)
  const expArg = exp2f_hgc(logArg);

  // @0x3b1ab3-@0x3b1ac4: xmm2 = c * exp2(a*r+b) + d
  const c = Math.fround(hgParams1[2]);
  const d = Math.fround(hgParams1[3]);
  const nonlinear = Math.fround(Math.fround(c * expArg) + d);

  // @0x3b1ac8-@0x3b1add: mask = (threshold < r); result = mask ? nonlinear : linear
  const threshold = Math.fround(hgParams0[0]);
  return threshold < rClamped ? nonlinear : linear;
}

/** Alpha-lane port of the same loop.  The SSE ops @0x3b1a2e..@0x3b1ae5 do a
 *  mask lattice (andps/andnps/blendps) whose exact reduction I have not
 *  finished walking; deferred as a throwing stub with its @0xADDR so a later
 *  worker can decode it without guessing. */
export function renderAlpha_HLG_InverseOETF(
  _alphaIn: number,
  _hgParams0: Float32Array,
  _hgParams1: Float32Array,
): number {
  throw new Error(
    "HgcBT2100_HLG_InverseOETF::renderTile alpha-lane mask lattice @Helium @0x3b1a2e..@0x3b1ae5 not yet transcribed"
  );
}

/** HgcBT2100_HLG_InverseOETF::RenderTile_AVX(HGTile*) @0x3b1660.
 *  8-wide AVX2 port of the same inverse-OETF math.  Full body is not
 *  separately transcribed here — the pure math is covered by
 *  `renderChannel_HLG_InverseOETF` above.  This method throws so the
 *  frontier tool sees the AVX-scaffolding as an open node. */
export function RenderTile_AVX(
  _self: HgcBT2100_HLG_InverseOETFInstance,
  _tile: HGTile,
): void {
  throw new Error(
    "HgcBT2100_HLG_InverseOETF::RenderTile_AVX @Helium @0x3b1660 tile-loop scaffolding (HGTile field access, AVX2 dispatch) not yet transcribed"
  );
}

/** HgcBT2100_HLG_InverseOETF::RenderTile(HGTile*) @0x3b1940.
 *  Dispatch: if `HGRenderer::GetTarget(0) >= 0x4700000` tail-call
 *  RenderTile_AVX (@0x3b196c).  Else, iterate pixels in the tile via one of
 *  two SSE loops keyed on the same target tag.  The pure math per pixel
 *  is captured in `renderChannel_HLG_InverseOETF`. */
export function RenderTile(
  _self: HgcBT2100_HLG_InverseOETFInstance,
  _tile: HGTile,
): void {
  throw new Error(
    "HgcBT2100_HLG_InverseOETF::RenderTile @Helium @0x3b1940 tile-loop scaffolding (HGRenderer::GetTarget dispatch, HGTile stride/pointer access) not yet transcribed"
  );
}
