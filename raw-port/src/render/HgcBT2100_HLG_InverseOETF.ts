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

// ── SIMD lane primitives for the AVX tile kernel below ──────────────────────────────────────
// The machine's `vandps`/`vpslld`/`vpsrld` operate on the BITS of the same register file, and JS
// has no other way to express that. Not FCP functions; pure plumbing, mirroring the landed
// raw-port/src/render/Gettype1_half_unpremultTile_AVX.ts.
const bitScratch = new DataView(new ArrayBuffer(4));

function bitsOf(x: number): number {
  bitScratch.setFloat32(0, x, true);
  return bitScratch.getUint32(0, true);
}

function floatOf(bits: number): number {
  bitScratch.setUint32(0, bits >>> 0, true);
  return bitScratch.getFloat32(0, true);
}

/** The "QNaN floating-point indefinite" an x86 SSE/AVX arithmetic op produces when the operation
 *  itself is INVALID (Inf-Inf, 0*Inf, …). Intel SDM vol 1 4.8.3.7: it is 0xffc00000 — the sign bit
 *  is SET. JavaScript has exactly one NaN and writing it into a Float32Array yields 0x7fc00000, so
 *  a port that just lets JS produce the NaN differs from the machine in that one bit. This is not
 *  theoretical: the differential for this kernel reported 420 divergent lanes, every one of them
 *  `native=ffc00000 ts=7fc00000`, before this rule was modelled. */
const QNAN_INDEFINITE = floatOf(0xffc00000);

/** x86's NaN-propagation rule for a two-source arithmetic op (SDM: SRC1 wins, then SRC2, then the
 *  indefinite). An SNaN operand is QUIETED (bit 22 set) on the way out, which `| 0x00400000` does
 *  and which leaves a QNaN untouched. `src1` is the FIRST Intel source, i.e. the SECOND operand
 *  written in AT&T order. */
function nanResult(src1: number, src2: number): number {
  if (Number.isNaN(src1)) return floatOf(bitsOf(src1) | 0x00400000);
  if (Number.isNaN(src2)) return floatOf(bitsOf(src2) | 0x00400000);
  return QNAN_INDEFINITE;
}

/** ADDPS lane, with the NaN rule. Arguments in INTEL order (src1, src2). */
function addps(src1: number, src2: number): number {
  const r = Math.fround(src1 + src2);
  return Number.isNaN(r) ? nanResult(src1, src2) : r;
}

/** SUBPS lane (src1 - src2), with the NaN rule. */
function subps(src1: number, src2: number): number {
  const r = Math.fround(src1 - src2);
  return Number.isNaN(r) ? nanResult(src1, src2) : r;
}

/** MULPS lane, with the NaN rule. */
function mulps(src1: number, src2: number): number {
  const r = Math.fround(src1 * src2);
  return Number.isNaN(r) ? nanResult(src1, src2) : r;
}

/** MAXPS lane rule: `(src1 > src2) ? src1 : src2` — src2 wins on equal AND on unordered. */
function maxps(src1: number, src2: number): number {
  return src1 > src2 ? src1 : src2;
}

/** CMPPS(LT): all-ones when `a < b` ORDERED, all-zero otherwise (NaN gives false). */
function cmpltps(a: number, b: number): number {
  return a < b ? 0xffffffff : 0x00000000;
}

/** CMPPS(LE): all-ones when `a <= b` ORDERED, all-zero otherwise (NaN gives false). */
function cmpleps(a: number, b: number): number {
  return a <= b ? 0xffffffff : 0x00000000;
}

/** CMPPS(NLE): all-ones when NOT(a <= b) — which INCLUDES the unordered case, so a NaN operand
 *  yields all-ones. The 4-wide tail's predicate where the 8-wide body uses CMPLT. */
function cmpnleps(a: number, b: number): number {
  return !(a <= b) ? 0xffffffff : 0x00000000;
}

/** `vroundps $0x9` — round toward -inf with the precision exception suppressed; on an f32 lane
 *  that is exactly `floor`, and the floor of a finite f32 is always representable. */
function roundps_floor(x: number): number {
  return Math.fround(Math.floor(x));
}

/** `vcvttps2dq` — f32 to i32, truncating toward zero. Out-of-range and NaN give the "integer
 *  indefinite" 0x80000000 (Intel SDM), which the exponent arithmetic then shifts like any other
 *  bit pattern; the `vmaxps` against exp2LowClamp bounds the input from below but not from
 *  above, so that path is reachable and is modelled. */
function cvttps2dq(x: number): number {
  if (!(x > -2147483649 && x < 2147483648)) return -2147483648 | 0;
  return Math.trunc(x) | 0;
}

/**
 * `HgcBT2100_HLG_InverseOETF::RenderTile_AVX(HGTile*)` @Helium 0x3b1660
 * (`__ZN25HgcBT2100_HLG_InverseOETF14RenderTile_AVXEP6HGTile`).
 *
 * TRANSCRIBED IN FULL. This method used to raise instead of computing; the body below is the
 * transcription of all 150
 * instructions at 0x3b1660..0x3b1936. `grep -c callq` = 0: a LEAF with no vtable slot and no
 * RIP-relative constant. Every number comes out of the param buffer at `this+0x198`, at the
 * offsets `PARAM_OFFSETS` above already documents, so this port reads that buffer rather than
 * inventing values. Regenerate the decode with
 *   bash raw-port/tools/disasm.sh --sym \
 *     __ZN25HgcBT2100_HLG_InverseOETF14RenderTile_AVXEP6HGTile Helium
 *
 * AT&T operand order: `vop src2, src1, dst` is Intel `vop dst, src1, src2`. So
 * `vmaxps %ymm1,%ymm0,%ymm6` is MAXPS(src1=ymm0, src2=ymm1) — which returns src2 on equal AND on
 * unordered — and `vblendvps mask, src2, src1, dst` sets dst = mask ? src2 : src1.
 *
 * WHAT IT COMPUTES, per RGBA texel (`P0` = hgParams0 @+0x00, `P1` = hgParams1 @+0x20):
 *
 *   c    = max(texel, alphaThresh)                        // (0,0,0,0.005): RGB floor 0, alpha 0.005
 *   u    = (c*P1.x + P1.y) with the ALPHA lane put back from the raw texel
 *   lo   = P0.y * c²                                      // the quadratic segment
 *   hi   = exp2(max(u, exp2LowClamp)) * P1.z + P1.w       // the exponential segment
 *   gate = (P0.x < blend(c, sel)) ? … the select below
 *   out  = gate ? hi : lo
 *   out.a = texel.a * sel                                 // sel is 0 or exp2LowClamp per lane
 *
 * where `sel` = `(alphaThresh <= u) & exp2LowClamp` @0x3b1715/@0x3b171a — a 0-or-constant value
 * that is used THREE times: as the alpha multiplier @0x3b17e6, and spliced into lane 3/7 of both
 * gate operands @0x3b175a and @0x3b17d5. The alpha lane is therefore NOT a passthrough: it is the
 * raw texel times a per-lane 0-or-`exp2LowClamp.w` (= 1.0, slot 3's alpha lane), i.e. alpha
 * survives only where the comparison holds and is zeroed otherwise. That is transcribed as it
 * stands rather than simplified.
 *
 * There is no log2 here — only exp2 — which is why the buffer holds exp2 coefficients and no
 * mantissa mask, and why the port is short.
 *
 * EXACTNESS: load/store, max, add/sub/mul, and, the integer exponent ops, `vroundps`,
 * `vcvttps2dq`. No `vrcpps`, `vrsqrtps`, `vdivps` or `vsqrtps` — every operation is exactly
 * specified, so this port is bit-exact and its oracle demands 0 divergences. (Its `HLG_OETF`
 * counterpart @0x3b04b0 is NOT in that position: it carries six `vrsqrtps`, and is still a stub.)
 *
 * THE TWO PATHS. An 8-wide body @0x3b16d0..0x3b180d entered only when the tile is at least 2
 * texels wide, then a 4-wide tail @0x3b1826..0x3b1928 for the odd texel, which runs at most once
 * per row (it ends in `jmp 0x3b16a0`, the row advance). They differ: the tail uses `vcmpnleps`
 * @0x3b190d where the body uses `vcmpltps` @0x3b17db (they disagree on NaN), loads the buffer
 * with `vmovaps` instead of `vmovups`, adds the exponent bias straight from memory
 * (`vpaddd 0x140(%rbx)` @0x3b18d4), and splices `sel` into a different register.
 *
 * DEGENERATE TILES: rows <= 0 returns before the frame is built (`jle 0x3b1931` @0x3b1666);
 * cols <= 0 falls through the `cmpl $0x2` @0x3b16b8 into the tail guard `jge` @0x3b1819 with
 * r11d = 0 and writes nothing for that row. The function always returns 0 (`xorl %eax,%eax`
 * @0x3b1934) — the stub this replaces declared `void`; the widened return type is what the
 * machine actually leaves in %eax, and `RenderTile` @0x3b196c tail-jumps here, so its caller sees
 * it.
 * @0x3b1660
 */
export function RenderTile_AVX(
  self: HgcBT2100_HLG_InverseOETFInstance,
  tile: HGTile,
): number {
  const f32 = self.paramBuf;
  const i32 = self.paramBufI32;
  /** lane `l` of the 32-byte (ymm) buffer vector at byte offset `off` */
  const kv = (off: number, l: number): number => f32[off / 4 + l] as number;
  /** the `vbroadcastss` scalar at byte offset `off` */
  const ks = (off: number): number => f32[off / 4] as number;
  /** lane `l` of the 16-byte integer vector at byte offset `off` (the `vpaddd` operand) */
  const ki = (off: number, l: number): number => i32[off / 4 + l] as number;

  // @0x3b1660/@0x3b1663: eax = tile[+0x0c] - tile[+0x04]
  const rows = (tile.y1 - tile.y0) | 0;
  // @0x3b1666: jle 0x3b1931
  if (rows <= 0) return 0;
  // @0x3b1673/@0x3b1676: ecx = tile[+0x08] - tile[+0x00]
  const cols = (tile.x1 - tile.x0) | 0;
  // @0x3b1678/@0x3b1688 and @0x3b1684/@0x3b168c: strides <<4 bytes == 4 f32 == 1 texel
  const outRowStride = (tile.dstStride16 | 0) * 4;
  const inRowStride = (tile.srcStride16 | 0) * 4;
  const outArr = tile.dst; // @0x3b167c
  const inArr = tile.src; // @0x3b1680
  let outBase = 0; // r8, advanced @0x3b16a3
  let inBase = 0; // r9, advanced @0x3b16a0

  // Register file; the 4-wide tail uses lanes 0..3 of the same arrays, as an xmm is the low half
  // of its ymm. This kernel spills nothing — there is no `subq %rsp` at all.
  const ymm0 = new Float32Array(8);
  const ymm1 = new Float32Array(8);
  const ymm2 = new Float32Array(8);
  const ymm3 = new Float32Array(8);
  const ymm4 = new Float32Array(8);
  const ymm5 = new Float32Array(8);
  const ymm6 = new Float32Array(8);
  const ymm7 = new Float32Array(8);
  const ymm8 = new Float32Array(8);
  const ymm9 = new Float32Array(8);
  const mk = new Uint32Array(8); // a compare writes all-ones / all-zero into the same file
  const iA = new Int32Array(8);
  const iB = new Int32Array(8);

  // @0x3b1690: r10d = 0; @0x3b16a6..@0x3b16ac: exactly `rows` iterations.
  for (let row = 0; row < rows; row++) {
    // @0x3b16b2: movl $0x0,%r11d
    let r11 = 0;
    // @0x3b16b8/@0x3b16bb: cmpl $0x2,%ecx ; jl 0x3b1816 — narrower than 2 texels: tail only.
    if (cols >= 2) {
      // @0x3b16c1: ebx = 0x10, so every access is at byte offset 32*k.
      let k = 0;
      for (;;) {
        const p = inBase + 8 * k;
        const q = outBase + 8 * k;
        // @0x3b16d0: vmovups -0x10(%r9,%rbx),%ymm0 — two RGBA texels
        for (let l = 0; l < 8; l++) ymm0[l] = inArr[p + l] as number;
        // @0x3b16d7: movq 0x198(%rdi),%r14 — the param buffer (reloaded every iteration)
        // @0x3b16de/@0x3b16e4/@0x3b16ea
        for (let l = 0; l < 8; l++) ymm1[l] = kv(PARAM_OFFSETS.alphaThresh_A, l);
        for (let l = 0; l < 8; l++) ymm5[l] = kv(PARAM_OFFSETS.exp2LowClamp_A, l);
        for (let l = 0; l < 8; l++) ymm2[l] = kv(PARAM_OFFSETS.exp2OneThresh_A, l);
        // @0x3b16f3: vmaxps %ymm1,%ymm0,%ymm6 — c = max(texel, alphaThresh)
        for (let l = 0; l < 8; l++) ymm6[l] = maxps(ymm0[l] as number, ymm1[l] as number);
        // @0x3b16f7/@0x3b16fd: vbroadcastss 0x20 / 0x24
        for (let l = 0; l < 8; l++) ymm3[l] = ks(PARAM_OFFSETS.hgParams1_A);
        for (let l = 0; l < 8; l++) ymm4[l] = ks(PARAM_OFFSETS.hgParams1_A + 4);
        // @0x3b1703: vmulps %ymm3,%ymm6,%ymm3 ; @0x3b1707: vaddps %ymm3,%ymm4,%ymm3
        for (let l = 0; l < 8; l++) ymm3[l] = mulps(ymm6[l] as number, ymm3[l] as number);
        for (let l = 0; l < 8; l++) ymm3[l] = addps(ymm4[l] as number, ymm3[l] as number);
        // @0x3b170b: vblendps $0x88,%ymm0,%ymm3,%ymm7 — lanes 3,7 from the RAW texel
        for (let l = 0; l < 8; l++) ymm7[l] = ymm3[l] as number;
        ymm7[3] = ymm0[3] as number;
        ymm7[7] = ymm0[7] as number;
        // @0x3b1711: vmulps %ymm6,%ymm6,%ymm4 — c²
        for (let l = 0; l < 8; l++) ymm4[l] = mulps(ymm6[l] as number, ymm6[l] as number);
        // @0x3b1715: vcmpleps %ymm7,%ymm1,%ymm3 — (alphaThresh <= u)
        for (let l = 0; l < 8; l++) mk[l] = cmpleps(ymm1[l] as number, ymm7[l] as number);
        // @0x3b171a: vandps %ymm5,%ymm3,%ymm3 — sel = mask & exp2LowClamp
        for (let l = 0; l < 8; l++) {
          ymm3[l] = floatOf((mk[l] as number) & bitsOf(ymm5[l] as number));
        }
        // @0x3b171e/@0x3b1724: vbroadcastss 0x4 ; vmulps %ymm4,%ymm8,%ymm4 — lo = P0.y · c²
        for (let l = 0; l < 8; l++) ymm8[l] = ks(PARAM_OFFSETS.hgParams0_A + 4);
        for (let l = 0; l < 8; l++) ymm4[l] = mulps(ymm8[l] as number, ymm4[l] as number);
        // @0x3b1728: vmaxps %ymm5,%ymm7,%ymm5 — clamp the exp2 input from below
        for (let l = 0; l < 8; l++) ymm5[l] = maxps(ymm7[l] as number, ymm5[l] as number);
        // @0x3b172c/@0x3b1732: vroundps $0x9 ; vsubps — integer and fractional parts
        for (let l = 0; l < 8; l++) ymm7[l] = roundps_floor(ymm5[l] as number);
        for (let l = 0; l < 8; l++) ymm5[l] = subps(ymm5[l] as number, ymm7[l] as number);
        // @0x3b1736/@0x3b173f
        for (let l = 0; l < 8; l++) {
          ymm8[l] = mulps(ymm5[l] as number, kv(PARAM_OFFSETS.exp2C5_A, l));
        }
        for (let l = 0; l < 8; l++) {
          ymm8[l] = addps(ymm8[l] as number, kv(PARAM_OFFSETS.exp2C4_A, l));
        }
        // @0x3b1748: vmulps %ymm5,%ymm5,%ymm9 — f²
        for (let l = 0; l < 8; l++) ymm9[l] = mulps(ymm5[l] as number, ymm5[l] as number);
        // @0x3b174c: vmulps %ymm8,%ymm9,%ymm8
        for (let l = 0; l < 8; l++) ymm8[l] = mulps(ymm9[l] as number, ymm8[l] as number);
        // @0x3b1751: vmulps 0xc0(%r14),%ymm5,%ymm9
        for (let l = 0; l < 8; l++) {
          ymm9[l] = mulps(ymm5[l] as number, kv(PARAM_OFFSETS.exp2C3_A, l));
        }
        // @0x3b175a: vblendps $0x88,%ymm3,%ymm6,%ymm6 — lanes 3,7 of `c` replaced by `sel`
        ymm6[3] = ymm3[3] as number;
        ymm6[7] = ymm3[7] as number;
        // @0x3b1760/@0x3b1769/@0x3b176e/@0x3b1772/@0x3b177b/@0x3b177f
        for (let l = 0; l < 8; l++) {
          ymm9[l] = addps(ymm9[l] as number, kv(PARAM_OFFSETS.exp2C2_A, l));
        }
        for (let l = 0; l < 8; l++) ymm8[l] = addps(ymm8[l] as number, ymm9[l] as number);
        for (let l = 0; l < 8; l++) ymm8[l] = mulps(ymm8[l] as number, ymm5[l] as number);
        for (let l = 0; l < 8; l++) {
          ymm8[l] = addps(ymm8[l] as number, kv(PARAM_OFFSETS.exp2Ln2_A, l));
        }
        for (let l = 0; l < 8; l++) ymm5[l] = mulps(ymm8[l] as number, ymm5[l] as number);
        for (let l = 0; l < 8; l++) ymm5[l] = addps(ymm2[l] as number, ymm5[l] as number);
        // @0x3b1783: vcvttps2dq %ymm7,%ymm7
        for (let l = 0; l < 8; l++) iA[l] = cvttps2dq(ymm7[l] as number);
        // @0x3b1787: vmovdqa 0x140(%r14),%xmm8 — the i32 bias, ONE 16-byte group
        for (let l = 0; l < 4; l++) iB[l] = ki(PARAM_OFFSETS.exp2Bias_A, l);
        // @0x3b1790/@0x3b1794/@0x3b179a: vpaddd both halves against the SAME xmm8
        for (let l = 0; l < 8; l++) iA[l] = ((iB[l & 3] as number) + (iA[l] as number)) | 0;
        // @0x3b179e/@0x3b17a4/@0x3b17a9: vpslld $0x17 on each half, recombined
        for (let l = 0; l < 8; l++) ymm7[l] = floatOf(((iA[l] as number) << 23) >>> 0);
        // @0x3b17af: vmulps %ymm7,%ymm5,%ymm5 — · 2^int
        for (let l = 0; l < 8; l++) ymm5[l] = mulps(ymm5[l] as number, ymm7[l] as number);
        // @0x3b17b3/@0x3b17b9/@0x3b17bd/@0x3b17c3: hi = exp2 · P1.z + P1.w
        for (let l = 0; l < 8; l++) ymm7[l] = ks(PARAM_OFFSETS.hgParams1_A + 8);
        for (let l = 0; l < 8; l++) ymm5[l] = mulps(ymm7[l] as number, ymm5[l] as number);
        for (let l = 0; l < 8; l++) ymm7[l] = ks(PARAM_OFFSETS.hgParams1_A + 12);
        for (let l = 0; l < 8; l++) ymm5[l] = addps(ymm7[l] as number, ymm5[l] as number);
        // @0x3b17c7/@0x3b17cc: vbroadcastss (%r14) ; vcmpltps %ymm6,%ymm7,%ymm6 — (P0.x < ymm6)
        for (let l = 0; l < 8; l++) ymm7[l] = ks(PARAM_OFFSETS.hgParams0_A);
        for (let l = 0; l < 8; l++) mk[l] = cmpltps(ymm7[l] as number, ymm6[l] as number);
        // @0x3b17d1: vandps %ymm2,%ymm6,%ymm2
        for (let l = 0; l < 8; l++) {
          ymm2[l] = floatOf((mk[l] as number) & bitsOf(ymm2[l] as number));
        }
        // @0x3b17d5: vblendps $0x88,%ymm3,%ymm2,%ymm2 — lanes 3,7 from `sel`
        ymm2[3] = ymm3[3] as number;
        ymm2[7] = ymm3[7] as number;
        // @0x3b17db: vcmpltps %ymm2,%ymm1,%ymm1 — (alphaThresh < that)
        for (let l = 0; l < 8; l++) mk[l] = cmpltps(ymm1[l] as number, ymm2[l] as number);
        // @0x3b17e0: vblendvps %ymm1,%ymm5,%ymm4,%ymm1 — the exponential or the quadratic segment
        for (let l = 0; l < 8; l++) {
          ymm1[l] = ((mk[l] as number) & 0x80000000) !== 0 ? (ymm5[l] as number) : (ymm4[l] as number);
        }
        // @0x3b17e6: vmulps %ymm0,%ymm3,%ymm0 — the alpha lane is texel · sel, not a passthrough
        for (let l = 0; l < 8; l++) ymm0[l] = mulps(ymm3[l] as number, ymm0[l] as number);
        // @0x3b17ea: vblendps $0x88,%ymm0,%ymm1,%ymm0
        for (let l = 0; l < 8; l++) {
          if (l !== 3 && l !== 7) ymm0[l] = ymm1[l] as number;
        }
        // @0x3b17f0: vmovups %ymm0,-0x10(%r8,%rbx)
        for (let l = 0; l < 8; l++) outArr[q + l] = ymm0[l] as number;

        // @0x3b17f7: addq $0x20,%rbx
        k++;
        // @0x3b17fb/@0x3b1802/@0x3b1805: r14d = r11d + ecx - 2 (r11d BEFORE the decrement)
        const r14 = (((r11 + cols) | 0) - 2) | 0;
        // @0x3b17fe: addl $-0x2,%r11d
        r11 = (r11 - 2) | 0;
        // @0x3b1809/@0x3b180d: cmpl $0x1,%r14d ; jg 0x3b16d0
        if (!(r14 > 1)) break;
      }
      // @0x3b1813: negl %r11d
      r11 = -r11 | 0;
    }

    // @0x3b1816/@0x3b1819: cmpl %ecx,%r11d ; jge 0x3b16a0 — also the cols <= 0 exit, which
    // writes nothing at all for the row.
    if (r11 < cols) {
      // @0x3b181f/@0x3b1822: movl %r11d,%r11d ; shlq $0x4,%r11
      const p = inBase + 4 * r11;
      const q = outBase + 4 * r11;
      // ── 4-wide tail: exactly ONE texel, then `jmp 0x3b16a0` ─────────────────────────────
      // @0x3b1826: vmovaps (%r9,%r11),%xmm0
      for (let l = 0; l < 4; l++) ymm0[l] = inArr[p + l] as number;
      // @0x3b182c: movq 0x198(%rdi),%rbx
      // @0x3b1833/@0x3b1838/@0x3b183d — `vmovaps`, and note %xmm4 holds what %ymm5 held above
      for (let l = 0; l < 4; l++) ymm1[l] = kv(PARAM_OFFSETS.alphaThresh_A, l);
      for (let l = 0; l < 4; l++) ymm4[l] = kv(PARAM_OFFSETS.exp2LowClamp_A, l);
      for (let l = 0; l < 4; l++) ymm2[l] = kv(PARAM_OFFSETS.exp2OneThresh_A, l);
      // @0x3b1845: vmaxps %xmm1,%xmm0,%xmm5 — c
      for (let l = 0; l < 4; l++) ymm5[l] = maxps(ymm0[l] as number, ymm1[l] as number);
      // @0x3b1849/@0x3b184f/@0x3b1853/@0x3b1859: u = c·P1.x + P1.y
      for (let l = 0; l < 4; l++) ymm3[l] = ks(PARAM_OFFSETS.hgParams1_A);
      for (let l = 0; l < 4; l++) ymm3[l] = mulps(ymm5[l] as number, ymm3[l] as number);
      for (let l = 0; l < 4; l++) ymm6[l] = ks(PARAM_OFFSETS.hgParams1_A + 4);
      for (let l = 0; l < 4; l++) ymm3[l] = addps(ymm6[l] as number, ymm3[l] as number);
      // @0x3b185d: vblendps $0x8,%xmm0,%xmm3,%xmm6 — lane 3 from the RAW texel
      for (let l = 0; l < 4; l++) ymm6[l] = ymm3[l] as number;
      ymm6[3] = ymm0[3] as number;
      // @0x3b1863: vmulps %xmm5,%xmm5,%xmm7 — c²
      for (let l = 0; l < 4; l++) ymm7[l] = mulps(ymm5[l] as number, ymm5[l] as number);
      // @0x3b1867/@0x3b186c: sel = (alphaThresh <= u) & exp2LowClamp
      for (let l = 0; l < 4; l++) mk[l] = cmpleps(ymm1[l] as number, ymm6[l] as number);
      for (let l = 0; l < 4; l++) {
        ymm3[l] = floatOf((mk[l] as number) & bitsOf(ymm4[l] as number));
      }
      // @0x3b1870: vblendps $0x8,%xmm3,%xmm5,%xmm5 — lane 3 of `c` replaced by `sel`. The 8-wide
      //   path does this into %ymm6 @0x3b175a and later than the c² above; same value either way.
      ymm5[3] = ymm3[3] as number;
      // @0x3b1876/@0x3b187c: lo = P0.y · c²
      for (let l = 0; l < 4; l++) ymm8[l] = ks(PARAM_OFFSETS.hgParams0_A + 4);
      for (let l = 0; l < 4; l++) ymm7[l] = mulps(ymm8[l] as number, ymm7[l] as number);
      // @0x3b1880/@0x3b1884/@0x3b188a
      for (let l = 0; l < 4; l++) ymm4[l] = maxps(ymm6[l] as number, ymm4[l] as number);
      for (let l = 0; l < 4; l++) ymm6[l] = roundps_floor(ymm4[l] as number);
      for (let l = 0; l < 4; l++) ymm4[l] = subps(ymm4[l] as number, ymm6[l] as number);
      // @0x3b188e..@0x3b18cc — the same exp2 polynomial, same order
      for (let l = 0; l < 4; l++) {
        ymm8[l] = mulps(ymm4[l] as number, kv(PARAM_OFFSETS.exp2C5_A, l));
      }
      for (let l = 0; l < 4; l++) {
        ymm8[l] = addps(ymm8[l] as number, kv(PARAM_OFFSETS.exp2C4_A, l));
      }
      for (let l = 0; l < 4; l++) ymm9[l] = mulps(ymm4[l] as number, ymm4[l] as number);
      for (let l = 0; l < 4; l++) ymm8[l] = mulps(ymm9[l] as number, ymm8[l] as number);
      for (let l = 0; l < 4; l++) {
        ymm9[l] = mulps(ymm4[l] as number, kv(PARAM_OFFSETS.exp2C3_A, l));
      }
      for (let l = 0; l < 4; l++) {
        ymm9[l] = addps(ymm9[l] as number, kv(PARAM_OFFSETS.exp2C2_A, l));
      }
      for (let l = 0; l < 4; l++) ymm8[l] = addps(ymm8[l] as number, ymm9[l] as number);
      for (let l = 0; l < 4; l++) ymm8[l] = mulps(ymm8[l] as number, ymm4[l] as number);
      for (let l = 0; l < 4; l++) {
        ymm8[l] = addps(ymm8[l] as number, kv(PARAM_OFFSETS.exp2Ln2_A, l));
      }
      for (let l = 0; l < 4; l++) ymm4[l] = mulps(ymm8[l] as number, ymm4[l] as number);
      for (let l = 0; l < 4; l++) ymm4[l] = addps(ymm2[l] as number, ymm4[l] as number);
      // @0x3b18d0/@0x3b18d4/@0x3b18dc — the bias comes straight out of memory here
      for (let l = 0; l < 4; l++) iA[l] = cvttps2dq(ymm6[l] as number);
      for (let l = 0; l < 4; l++) {
        iA[l] = ((iA[l] as number) + ki(PARAM_OFFSETS.exp2Bias_A, l)) | 0;
      }
      for (let l = 0; l < 4; l++) ymm6[l] = floatOf(((iA[l] as number) << 23) >>> 0);
      // @0x3b18e1/@0x3b18e5/@0x3b18eb/@0x3b18ef/@0x3b18f5: hi = exp2 · P1.z + P1.w
      for (let l = 0; l < 4; l++) ymm4[l] = mulps(ymm4[l] as number, ymm6[l] as number);
      for (let l = 0; l < 4; l++) ymm6[l] = ks(PARAM_OFFSETS.hgParams1_A + 8);
      for (let l = 0; l < 4; l++) ymm4[l] = mulps(ymm6[l] as number, ymm4[l] as number);
      for (let l = 0; l < 4; l++) ymm6[l] = ks(PARAM_OFFSETS.hgParams1_A + 12);
      for (let l = 0; l < 4; l++) ymm4[l] = addps(ymm6[l] as number, ymm4[l] as number);
      // @0x3b18f9/@0x3b18fe/@0x3b1903
      for (let l = 0; l < 4; l++) ymm6[l] = ks(PARAM_OFFSETS.hgParams0_A);
      for (let l = 0; l < 4; l++) mk[l] = cmpltps(ymm6[l] as number, ymm5[l] as number);
      for (let l = 0; l < 4; l++) {
        ymm2[l] = floatOf((mk[l] as number) & bitsOf(ymm2[l] as number));
      }
      // @0x3b1907: vblendps $0x8,%xmm3,%xmm2,%xmm2
      ymm2[3] = ymm3[3] as number;
      // @0x3b190d: vcmpnleps %xmm1,%xmm2,%xmm1 — NOT(that <= alphaThresh); the 8-wide path uses
      //   CMPLT with the operands the other way round, and the two differ on NaN.
      for (let l = 0; l < 4; l++) mk[l] = cmpnleps(ymm2[l] as number, ymm1[l] as number);
      // @0x3b1912: vblendvps %xmm1,%xmm4,%xmm7,%xmm1
      for (let l = 0; l < 4; l++) {
        ymm1[l] = ((mk[l] as number) & 0x80000000) !== 0 ? (ymm4[l] as number) : (ymm7[l] as number);
      }
      // @0x3b1918: vmulps %xmm0,%xmm3,%xmm0 — alpha = texel · sel
      for (let l = 0; l < 4; l++) ymm0[l] = mulps(ymm3[l] as number, ymm0[l] as number);
      // @0x3b191c: vblendps $0x8,%xmm0,%xmm1,%xmm0
      for (let l = 0; l < 3; l++) ymm0[l] = ymm1[l] as number;
      // @0x3b1922: vmovaps %xmm0,(%r8,%r11)
      for (let l = 0; l < 4; l++) outArr[q + l] = ymm0[l] as number;
      // @0x3b1928: jmp 0x3b16a0 — the row advance; the tail never iterates.
    }

    // @0x3b16a0/@0x3b16a3: addq %rsi,%r9 ; addq %rdx,%r8
    inBase += inRowStride;
    outBase += outRowStride;
  }

  // @0x3b192d..@0x3b1936: popq %rbx ; popq %r14 ; popq %rbp ; vzeroupper ; xorl %eax,%eax ; retq
  return 0;
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
