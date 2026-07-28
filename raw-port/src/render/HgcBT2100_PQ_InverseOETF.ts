// raw-port/src/render/HgcBT2100_PQ_InverseOETF.ts
//
// FCP `HgcBT2100_PQ_InverseOETF` — a Helium render-graph node that applies
// the ITU-R BT.2100 Perceptual Quantizer (PQ) *Inverse OETF* to a texture
// tile (i.e. maps 0..1 PQ-encoded signal to linear light). It ships two
// pixel paths (SSE fallback in `RenderTile`, AVX-optimised in
// `RenderTile_AVX`) that both compute a `pow()`-based formula matching the
// Metal fragment shader stored in the literal pool at
// @Helium 0x3ac7e8..0x3ac8xx (see `GetProgram` @0x3ac7d0).
//
// FRAMEWORK: Helium.framework
// DECODES (all under raw-port/re/disasm/):
//   Helium.HgcBT2100_PQ_InverseOETF.HgcBT2100_PQ_InverseOETF.s   (C1 @0x3ae610)
//   Helium.HgcBT2100_PQ_InverseOETF.~HgcBT2100_PQ_InverseOETF.s  (D0 @0x3ae6c0)
//   Helium.HgcBT2100_PQ_InverseOETF.GetProgram.s                 (@0x3ac7d0)
//   Helium.HgcBT2100_PQ_InverseOETF.InitProgramDescriptor.s      (@0x3ac800)
//   Helium.HgcBT2100_PQ_InverseOETF.shaderDescription.s          (@0x3aca20)
//   Helium.HgcBT2100_PQ_InverseOETF.BindTexture.s                (@0x3aca70)
//   Helium.HgcBT2100_PQ_InverseOETF.Bind.s                       (@0x3acae0)
//   Helium.HgcBT2100_PQ_InverseOETF.RenderTile_AVX.s             (@0x3acb60)
//   Helium.HgcBT2100_PQ_InverseOETF.RenderTile.s                 (@0x3ad780)
//   Helium.HgcBT2100_PQ_InverseOETF.GetDOD.s                     (@0x3ae2c0)
//   Helium.HgcBT2100_PQ_InverseOETF.GetROI.s                     (@0x3ae2e0)
//   Helium.HgcBT2100_PQ_InverseOETF.SetParameter.s               (@0x3ae710)
//   Helium.HgcBT2100_PQ_InverseOETF.GetParameter.s               (@0x3ae790)
//   Helium.HgcBT2100_PQ_InverseOETF.GetOutput.s                  (@0x3ae7e0)
//
// SYMBOLS (all Helium x86_64):
//   0x3ac7d0  HgcBT2100_PQ_InverseOETF::GetProgram(HGRenderer*)
//   0x3ac800  HgcBT2100_PQ_InverseOETF::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x3aca20  HgcBT2100_PQ_InverseOETF::shaderDescription() const
//   0x3aca70  HgcBT2100_PQ_InverseOETF::BindTexture(HGHandler*, int)
//   0x3acae0  HgcBT2100_PQ_InverseOETF::Bind(HGHandler*)
//   0x3acb60  HgcBT2100_PQ_InverseOETF::RenderTile_AVX(HGTile*)
//   0x3ad780  HgcBT2100_PQ_InverseOETF::RenderTile(HGTile*)
//   0x3ae2c0  HgcBT2100_PQ_InverseOETF::GetDOD(HGRenderer*, int, HGRect)
//   0x3ae2e0  HgcBT2100_PQ_InverseOETF::GetROI(HGRenderer*, int, HGRect)
//   0x3ae300  HgcBT2100_PQ_InverseOETF::HgcBT2100_PQ_InverseOETF()  [C2]
//   0x3ae610  HgcBT2100_PQ_InverseOETF::HgcBT2100_PQ_InverseOETF()  [C1 -> tail-calls C2]
//   0x3ae620  ~HgcBT2100_PQ_InverseOETF()                            [D2]
//   0x3ae670  ~HgcBT2100_PQ_InverseOETF()                            [D1]
//   0x3ae6c0  ~HgcBT2100_PQ_InverseOETF()                            [D0 — deleting]
//   0x3ae710  HgcBT2100_PQ_InverseOETF::SetParameter(int, float, float, float, float)
//   0x3ae790  HgcBT2100_PQ_InverseOETF::GetParameter(int, float*)
//   0x3ae7e0  HgcBT2100_PQ_InverseOETF::GetOutput(HGRenderer*)
//
// LAYOUT (inherits HGNode, sizeof HGNode >= 0x1a0):
//   +0x000  vtable ptr                  (leaq 0x6a6102(%rip) @0x3ae30f -> data section)
//   +0x010  HGNode bit-flags word       (SetParameter clears bit 0x600 via
//                                        ClearBits(); ctor sets flag 0x400 while
//                                        preserving all bits except 0x600 —
//                                        `andl $0xfffff9ff; orl $0x400` @0x3ae5de..0x3ae5eb)
//   +0x018  int field read by RenderTile @0x3ad7e1 (movslq 0x18) — HGNode-owned
//                                        source-tile stride (see BindTexture below).
//   +0x090  HGHandler-ish pointer read by BindTexture @0x3acab0 for a virtual
//           slot-0x80 dispatch (`callq *0x80(%rax)` with %esi=0x2e). HGNode-owned.
//   +0x198  aligned pointer to the 32-byte-aligned parameter bank (see below).
//   +0x1a0..0x358  unused HGNode tail bytes accessed by RenderTile as tile
//                  metadata (HGTile fields — see the RenderTile decode below).
//
// PARAMETER BANK (allocated at ctor @0x3ae319..0x3ae5d7):
//   `__Znam(0x407)` allocates 0x407 = 1031 bytes (see @0x3ae319 movl $0x407,%edi
//    then callq __Znam). This is 0x400 (1024) usable + 7 bytes align slack + an
//    8-byte back-pointer stash. The ctor then aligns the pointer up by 32:
//      %rcx = 8 - ((%rax + 8) & 0x1f) (via negl+andl@0x3ae327/0x3ae329)
//      base = %rax + %rcx + 8  (@0x3ae330)
//      *(base - 8) = %rax        (@0x3ae334 movq %rax, (%rcx,%rax))
//      base is stored at this+0x198 @0x3ae5d7 (movq %rdx, 0x198(%rbx))
//    That leaves 0x400 bytes of aligned param storage — exactly 32 slots of
//    32 bytes each; each slot is a doubled float4 (movaps xmm0 to +0 AND +0x10)
//    so shaders can load `hg_Params[i]` as a broadcast-ready constant.
//
// PARAMETER CONSTANTS (verified byte-for-byte in Helium.x86_64 with VA==file
// offset). All addresses resolved by `next_ip(=ip+7) + disp32`:
//   slot 0..2 : zeroed         (xorps xmm0 then 6× movaps @0x3ae338..0x3ae354)
//   slot 3    : ( 0,           0,           0,          -Inf)      @0x892950
//   slot 4    : ( 1,           1,           1,          +Inf)      @0x88ec10
//   slot 5    : (-FLT_MIN,    -FLT_MIN,    -FLT_MIN,     0)         @0x892090
//   slot 6    : (+FLT_MIN,    +FLT_MIN,    +FLT_MIN,     0)         @0x858f70
//   slot 7    : (+Inf,        +Inf,        +Inf,         0)         @0x88f440
//   slot 8    : ( 127,         127,         127,          0)         @0x88ded0
//   slot 9    : ( sqrt(2),     sqrt(2),     sqrt(2),      0)         @0x88dee0
//   slot10    : ( 0.5,         0.5,         0.5,          0)         @0x85da90
//   slot11    : ( 0.29608911,  0.29608911,  0.29608911,   0)         @0x88dfa0
//   slot12    : (-0.35917339, -0.35917339, -0.35917339,   0)         @0x88dfb0
//   slot13    : ( 0.17290929,  0.17290929,  0.17290929,   0)         @0x88dfc0
//   slot14    : (-0.27149275, -0.27149275, -0.27149275,   0)         @0x88dfd0
//   slot15    : ( 0.48059392,  0.48059392,  0.48059392,   0)         @0x88dfe0
//   slot16    : (-0.72136724, -0.72136724, -0.72136724,   0)         @0x88dff0
//   slot17    : ( 1.44269669,  1.44269669,  1.44269669,   0)         @0x88e000
//   slot18    : (-127,        -127,        -127,           0)         @0x88df30
//   slot19    : ( 0.00179523,  0.00179523,  0.00179523,   0)         @0x88e010
//   slot20    : ( 0.00918918,  0.00918918,  0.00918918,   0)         @0x88e020
//   slot21    : ( 0.05566124,  0.05566124,  0.05566124,   0)         @0x88e030
//   slot22    : ( 0.24020679,  0.24020679,  0.24020679,   0)         @0x88e040
//   slot23    : ( 0.69314754,  0.69314754,  0.69314754,   0)         @0x88e050
//   slot24    : ( 1.78e-43,    1.78e-43,    1.78e-43,     0)         @0x88df70  (0x7f raw bits ≡ subnormal mask)
//   slot25    : ( 1.00024426,  1.00024426,  1.00024426, 1.00024426)   @0x85fed0
//   slot26    : (+FLT_MAX,    +FLT_MAX,    +FLT_MAX,     0)         @0x88e1d0
//   slot27    : (-FLT_MAX,    -FLT_MAX,    -FLT_MAX,     0)         @0x88ec20
//   slot28    : ( 2,           2,           2,            0)         @0x88df90
//   slot29    : ( NaN,         NaN,         NaN,          0)         @0x88c7f0
//   slot30    : ( 0,           0,           0,            NaN)       @0x85fc40
//   slot31    : (unused; end of 0x400-byte bank)
//
// The log2/exp2 polynomial coefficients (slots 11..17 and 19..23) are the same
// vectorized `powf` primitive used across every HgcBT2100_* transfer-function
// node in Helium — this is Apple's internal SIMD power-function decomposition,
// not the PQ formula itself. The PQ-specific inputs (c1, c2, c3, m1, m2)
// enter through `SetParameter` (see below), not through the ctor.
//
// FRAGMENT SHADER (from `GetProgram` @0x3ac7d0 literal pool; used when the
// render target is Metal, i.e. HGRenderer::GetTarget(0x60000) == 0x60B10):
//
//   r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);
//   r0.xyz = clamp(r0.xyz, 0.0, 1.0);
//   r0.xyz = pow(r0.xyz, hg_Params[1].yyy);              // = signal^(1/m2)
//   r1.xyz = r0.xyz - hg_Params[0].xxx;                  // - c1
//   r0.xyz = r0.xyz*hg_Params[0].zzz + hg_Params[0].yyy; // * c3 + c2
//   r1.xyz = fmax(r1.xyz, 0);
//   r0.xyz = r1.xyz/r0.xyz;                              // (E^(1/m2) - c1) / (c2 + c3*E^(1/m2))
//   r1.xyz = pow(r0.xyz, hg_Params[1].xxx);              // ^ (1/m1)  -> Y (linear light in normalised form)
//   r0.xyz = r1.xyz*hg_Params[2].xxx + hg_Params[2].yyy;
//   r2.xyz = r1.xyz*hg_Params[2].zzz;
//   r0.xyz = pow(r0.xyz, hg_Params[1].zzz);
//   r1.xyz = float3(hg_Params[2].www < r1.xyz);
//   output.color0.xyz = select(r2.xyz, r0.xyz, -r1.xyz < 0.0);
//   output.color0.w   = r0.w;
//
// So the shader binds three float4 constant slots:
//   hg_Params[0] = (c1, c2, c3, _)      // PQ EOTF constants
//   hg_Params[1] = (1/m1, 1/m2, gamma_hi, _)
//   hg_Params[2] = (mulLow_scaleA, mulLow_offsetB, mulLow_scaleC, breakpoint)
// but the API `SetParameter(i, x,y,z,w)` treats slot i as an opaque float4 —
// callers supply the exact standard PQ constants (BT.2100 Table 4:
//   c1 = 3424/4096, c2 = 2413/4096 * 32, c3 = 2392/4096 * 32,
//   m1 = 2610/16384, m2 = 128*2523/4096).
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()               ctor base   @Helium 0x3ae30a
//   HGNode::ClearBits()            SetParameter@Helium 0x3ae778
//   HGNode::~HGNode()              dtor base   @Helium 0x3ae6f0
//   HGObject::operator delete(void*) D0        @Helium 0x3ae6fe
//   operator delete (__ZdlPv)      D0/SetParam @Helium 0x3ae6e8 / 0x3acbd7
//   operator new[]  (__Znam)       ctor buf    @Helium 0x3ae31e
//   HGRenderer::GetTarget(unsigned)  GetProgram/RenderTile @Helium 0x3ac7dc / 0x3ad7a1
//   HGProgramDescriptor::SetVisibleShaderWithSource
//                                  InitProgramDescriptor @Helium 0x3ac822
//   HGProgramDescriptor::SetFragmentFunctionName
//                                  InitProgramDescriptor @Helium 0x3ac831
//   HGProgramDescriptor::SetReturnBinding(HGBinding)
//                                  InitProgramDescriptor @Helium 0x3ac878
//   HGHandler::TexCoord(int,int,int,double const*)
//                                  BindTexture @Helium 0x3acaab
//   HGTile::Renderer() const       RenderTile  @Helium 0x3ad797
//   HGProgramDescriptor's std::vector<HGBinding>::emplace_back_slow_path
//                                  InitProgramDescriptor @Helium 0x3ac8cd, 0x3ac957
//   virtual dispatch *(vtable+0x90) on HGHandler
//                                  Bind        @Helium 0x3acb01, 0x3acb22, 0x3acb43
//   virtual dispatch *(vtable+0xc0) on this
//                                  Bind        @Helium 0x3acb52
//   virtual dispatch *(vtable+0x30/0x48/0x80/0xa8) on HGHandler
//                                  BindTexture @Helium 0x3aca8f, 0x3aca9c, 0x3acabf, 0x3acacf
//
// The actual per-pixel SIMD kernel bodies (`RenderTile` and `RenderTile_AVX`)
// are large (658 and 568 lines of decoded x86_64) and depend on HGTile struct
// offsets (0x00 x0, 0x04 y0, 0x08 x1, 0x0c y1, 0x10 dst-ptr, 0x18 dst-stride,
// 0x50 src-ptr, 0x58 src-stride — read by the RenderTile prologue @0x3ad7c6..
// 0x3ad7e1) whose layout is decoded elsewhere. Faithful transcription requires
// a companion HGTile port; until then, the pixel dispatch is a throw-stub.

/**
 * Undecoded frontier: `HGNode::HGNode()`. Base-class ctor tail-called by this
 * class at @Helium 0x3ae30a. Every Helium render-node port raises this at
 * construction; when a real HGNode port lands, wire it here.
 */
function HGNode_ctor(_self: object): void { // @Helium 0x3ae30a
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0x3ae30a — HgcBT2100_PQ_InverseOETF C2 base call)",
  );
}

/**
 * Undecoded frontier: `HGNode::~HGNode()`. Base-class dtor called at
 * @Helium 0x3ae6f0 from the deleting-dtor D0.
 */
function HGNode_dtor(_self: object): void { // @Helium 0x3ae6f0
  throw new Error(
    "HGNode::~HGNode() not yet transcribed (@Helium 0x3ae6f0 — HgcBT2100_PQ_InverseOETF D0 base call)",
  );
}

/**
 * Undecoded frontier: `HGNode::ClearBits()`. Called from
 * `SetParameter` @Helium 0x3ae778 after a slot's contents changed.
 */
function HGNode_ClearBits(_self: object): void { // @Helium 0x3ae778
  throw new Error(
    "HGNode::ClearBits() not yet transcribed (@Helium 0x3ae778 — HgcBT2100_PQ_InverseOETF::SetParameter dirty-mark)",
  );
}

/** Opaque frontier types — resolved by companion ports. */
export interface HGRenderer {}
export interface HGHandler {}
export interface HGTile {}
export interface HGRect {}
export interface HGProgramDescriptor {}

/**
 * A single 32-byte parameter slot as the shader sees it. Both halves
 * (the low-16 and high-16 stores in `SetParameter` @0x3ae771/0x3ae775)
 * hold the same float4 — the double-write is Metal's broadcast trick so
 * `hg_Params[i].xxx` can be loaded as an SSE-aligned constant.
 */
export interface ParamSlot {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * `HgcBT2100_PQ_InverseOETF` — BT.2100 PQ Inverse OETF render node.
 *
 * ctor @Helium 0x3ae300 (C2) / 0x3ae610 (C1 tail-jmp).
 * dtor @Helium 0x3ae620 (D2), 0x3ae670 (D1), 0x3ae6c0 (D0 deleting).
 */
export class HgcBT2100_PQ_InverseOETF {
  /**
   * +0x198 — 32-slot × 16-byte-aligned parameter bank. Ctor zeroes slots
   * 0..2 (@Helium 0x3ae338..0x3ae354) and then seeds slots 3..30 from a
   * shared literal-pool table (see PARAMETER CONSTANTS above). The bank
   * is where `SetParameter(i,...)` writes and `GetParameter(i,...)` reads.
   */
  public params: ParamSlot[];

  /** +0x010 — HGNode bit-flags word; ctor mutates via `andl 0xfffff9ff; orl 0x400`. */
  public flags: number;

  /**
   * HgcBT2100_PQ_InverseOETF::HgcBT2100_PQ_InverseOETF() — Helium
   * @0x3ae300 (C2). Transcription (only observable side-effects):
   *
   *   callq HGNode::HGNode()                @0x3ae30a
   *   this->vtable = &_ZTV24HgcBT2100_PQ_InverseOETF   @0x3ae30f/@0x3ae316
   *   %rax = __Znam(0x407)                  @0x3ae319..0x3ae323
   *   base = align_up(%rax + 8, 32); *(base - 8) = %rax  @0x3ae323..0x3ae334
   *   *(u128*)(base + 0x08..0x58)  = 0                    @0x3ae338..0x3ae354  (slots 0..2 zeroed)
   *   for each of 28 literal-pool consts C_i:
   *     *(u128*)(base + slot_i * 0x20 + 0x00) = C_i
   *     *(u128*)(base + slot_i * 0x20 + 0x10) = C_i        @0x3ae359..0x3ae5cf
   *   this->0x198 = base                                   @0x3ae5d7
   *   this->0x10  = (this->0x10 & 0xfffff9ff) | 0x400      @0x3ae5de..0x3ae5eb
   *
   * The 28-const table is verified in Helium.x86_64 at the addresses listed
   * in the file header (each `movaps disp32(%rip), %xmm0` is decoded as
   * `next_ip + disp32`, with `next_ip == ip + 7` for the 7-byte SSE form).
   */
  public constructor() { // @Helium 0x3ae300 (C2) / 0x3ae610 (C1)
    HGNode_ctor(this);
    // vtable install @0x3ae30f/0x3ae316 — modelled as a no-op here; the
    // vtable resolves through explicit method calls on this object.
    this.params = new Array<ParamSlot>(32);
    // Slots 0..2 zeroed by the ctor @0x3ae338..0x3ae354.
    for (let i = 0; i < 3; i++) {
      this.params[i] = { x: 0, y: 0, z: 0, w: 0 };
    }
    // Slots 3..30 from the literal-pool table (see file header for @-addresses).
    // The `w` component intentionally differs from x/y/z for a few slots
    // (the ±Inf/±FLT_MAX/NaN mask registers used by the SIMD powf primitive).
    const NEG_INF = -Infinity;
    const POS_INF = Infinity;
    const NEG_MIN_NORM = -Math.fround(1.17549421e-38); // slot 5 @0x892090
    const POS_MIN_NORM = Math.fround(1.17549435e-38); // slot 6 @0x858f70
    const RAW_7F = Math.fround(1.77964905e-43);       // slot 24 @0x88df70 (raw bit-pattern 0x0000007f)
    const NEG_FLT_MAX = -3.40282347e38;                // slot 27 @0x88ec20
    const POS_FLT_MAX =  3.40282347e38;                // slot 26 @0x88e1d0
    const NAN = Math.fround(NaN);
    const c: [number, number, number, number][] = [
      [ 0,              0,              0,              NEG_INF ],       // slot 3  @0x892950
      [ 1,              1,              1,              POS_INF ],       // slot 4  @0x88ec10
      [ NEG_MIN_NORM,   NEG_MIN_NORM,   NEG_MIN_NORM,   0 ],             // slot 5  @0x892090
      [ POS_MIN_NORM,   POS_MIN_NORM,   POS_MIN_NORM,   0 ],             // slot 6  @0x858f70
      [ POS_INF,        POS_INF,        POS_INF,        0 ],             // slot 7  @0x88f440
      [ 127,            127,            127,            0 ],             // slot 8  @0x88ded0
      [ Math.fround(1.41421354), Math.fround(1.41421354), Math.fround(1.41421354), 0 ], // slot 9  @0x88dee0  (sqrt(2))
      [ 0.5,            0.5,            0.5,            0 ],             // slot 10 @0x85da90
      [ Math.fround(0.296089113),  Math.fround(0.296089113),  Math.fround(0.296089113),  0 ], // slot 11 @0x88dfa0
      [ Math.fround(-0.359173387), Math.fround(-0.359173387), Math.fround(-0.359173387), 0 ], // slot 12 @0x88dfb0
      [ Math.fround(0.17290929),   Math.fround(0.17290929),   Math.fround(0.17290929),   0 ], // slot 13 @0x88dfc0
      [ Math.fround(-0.271492749), Math.fround(-0.271492749), Math.fround(-0.271492749), 0 ], // slot 14 @0x88dfd0
      [ Math.fround(0.48059392),   Math.fround(0.48059392),   Math.fround(0.48059392),   0 ], // slot 15 @0x88dfe0
      [ Math.fround(-0.72136724),  Math.fround(-0.72136724),  Math.fround(-0.72136724),  0 ], // slot 16 @0x88dff0
      [ Math.fround(1.44269669),   Math.fround(1.44269669),   Math.fround(1.44269669),   0 ], // slot 17 @0x88e000
      [ -127,           -127,           -127,           0 ],             // slot 18 @0x88df30
      [ Math.fround(0.00179522554), Math.fround(0.00179522554), Math.fround(0.00179522554), 0 ], // slot 19 @0x88e010
      [ Math.fround(0.0091891773),  Math.fround(0.0091891773),  Math.fround(0.0091891773),  0 ], // slot 20 @0x88e020
      [ Math.fround(0.0556612387),  Math.fround(0.0556612387),  Math.fround(0.0556612387),  0 ], // slot 21 @0x88e030
      [ Math.fround(0.240206793),   Math.fround(0.240206793),   Math.fround(0.240206793),   0 ], // slot 22 @0x88e040
      [ Math.fround(0.69314754),    Math.fround(0.69314754),    Math.fround(0.69314754),    0 ], // slot 23 @0x88e050
      [ RAW_7F,         RAW_7F,         RAW_7F,         0 ],             // slot 24 @0x88df70
      [ Math.fround(1.00024426), Math.fround(1.00024426), Math.fround(1.00024426), Math.fround(1.00024426) ], // slot 25 @0x85fed0
      [ POS_FLT_MAX,    POS_FLT_MAX,    POS_FLT_MAX,    0 ],             // slot 26 @0x88e1d0
      [ NEG_FLT_MAX,    NEG_FLT_MAX,    NEG_FLT_MAX,    0 ],             // slot 27 @0x88ec20
      [ 2,              2,              2,              0 ],             // slot 28 @0x88df90
      [ NAN,            NAN,            NAN,            0 ],             // slot 29 @0x88c7f0
      [ 0,              0,              0,              NAN ],           // slot 30 @0x85fc40
    ];
    for (let i = 0; i < c.length; i++) {
      const v = c[i];
      this.params[3 + i] = { x: v[0], y: v[1], z: v[2], w: v[3] };
    }
    // slot 31 is never written by the ctor — leave undefined-but-typed as zeros.
    this.params[31] = { x: 0, y: 0, z: 0, w: 0 };

    // this->0x10 = (this->0x10 & 0xfffff9ff) | 0x400  @0x3ae5de..0x3ae5eb
    // We seed flags to zero and then apply the ctor's bit ops verbatim.
    this.flags = (0 & 0xfffff9ff) | 0x400;
  }

  /**
   * ~HgcBT2100_PQ_InverseOETF() — Helium @0x3ae6c0 (D0 deleting dtor).
   * Transcription (@0x3ae6c9..0x3ae6fe):
   *
   *   this->vtable = &_ZTV...                          @0x3ae6c9/0x3ae6d0
   *   if (this->0x198) {                               @0x3ae6d3..0x3ae6dd
   *     void* raw = *(void**)(this->0x198 - 8);        @0x3ae6df
   *     if (raw) operator delete(raw);                 @0x3ae6e3..0x3ae6e8
   *   }
   *   HGNode::~HGNode(this);                           @0x3ae6f0
   *   HGObject::operator delete(this);                 @0x3ae6fe (tail-jmp)
   */
  public destroy(): void { // @Helium 0x3ae6c0
    // params bank goes out of scope with the object in TS; the raw-pointer
    // free at @0x3ae6e8 is a manual-memory concern that JS's GC subsumes.
    HGNode_dtor(this);
    // HGObject::operator delete tail-jmp @0x3ae6fe:
    //   deferred to the runtime — no-op in the TS port because we never
    //   fabricate an HGObject allocator; instantiating a real full-object
    //   free would require an HGObject::operator delete port.
  }

  /**
   * SetParameter(int i, float x, float y, float z, float w) — Helium @0x3ae710.
   *
   *   if ((unsigned)i > 2) return -1;                      @0x3ae715..0x3ae718
   *   ParamSlot* p = base + i*32;                          @0x3ae71a..0x3ae727
   *   if (p->x==x && p->y==y && p->z==z && p->w==w)        @0x3ae72b..0x3ae757
   *       return 0;                                        @0x3ae784 (xorl %eax,%eax; ret)
   *   pack (x,y,z,w) into a single float4                  @0x3ae75f..0x3ae76b
   *   *(u128*)(p+0)  = packed                              @0x3ae775
   *   *(u128*)(p+16) = packed                              @0x3ae771 (mirror for shader broadcast)
   *   HGNode::ClearBits(this);                             @0x3ae778
   *   return 1;                                            @0x3ae77d
   *
   * The bounds check `cmpl $0x2, %esi ; ja` means only slots 0/1/2 are
   * settable from the outside — matching the three float4 constants
   * `hg_Params[0..2]` referenced by the fragment shader.
   */
  public SetParameter(i: number, x: number, y: number, z: number, w: number): number { // @Helium 0x3ae710
    // `movl $0xffffffff, %eax` then `cmpl $0x2, %esi ; ja` @0x3ae710..0x3ae718
    if ((i >>> 0) > 2) {
      return -1 | 0; // 0xffffffff sign-extended -> -1 as JS int32
    }
    const p = this.params[i];
    // ucomiss + jne/jp chains @0x3ae72b..0x3ae757:
    //   returns 0 (no-op) iff all four components already equal.
    // Note the raw asm uses ucomiss which is IEEE-quiet — NaN
    // components force a "not equal" branch, so a slot containing NaN
    // is always overwritten. We emulate this by relying on `===` which
    // is `false` for NaN vs NaN just like ucomiss's jne/jp path.
    const xf = Math.fround(x);
    const yf = Math.fround(y);
    const zf = Math.fround(z);
    const wf = Math.fround(w);
    if (p.x === xf && p.y === yf && p.z === zf && p.w === wf) {
      return 0; // @0x3ae784 xorl %eax,%eax
    }
    // insertps chain @0x3ae75f..0x3ae76b packs {x,y,z,w} into one float4;
    // the double movups (@0x3ae771 and @0x3ae775) writes it to +0x10 AND +0x00.
    p.x = xf;
    p.y = yf;
    p.z = zf;
    p.w = wf;
    HGNode_ClearBits(this); // @0x3ae778
    return 1; // @0x3ae77d movl $0x1, %eax
  }

  /**
   * GetParameter(int i, float* out) — Helium @0x3ae790.
   *
   *   if ((unsigned)i > 2) return -1;         @0x3ae795..0x3ae798
   *   ParamSlot* p = base + i*32;             @0x3ae79e..0x3ae7a7
   *   out[0]=p->x; out[1]=p->y;
   *   out[2]=p->z; out[3]=p->w;               @0x3ae7ab..0x3ae7d0
   *   return 0;                               @0x3ae7d5 (xorl %eax,%eax)
   */
  public GetParameter(i: number, out: [number, number, number, number]): number { // @Helium 0x3ae790
    if ((i >>> 0) > 2) {
      return -1 | 0;
    }
    const p = this.params[i];
    out[0] = p.x;
    out[1] = p.y;
    out[2] = p.z;
    out[3] = p.w;
    return 0;
  }

  /**
   * GetOutput(HGRenderer*) — Helium @0x3ae7e0. Trivial identity:
   *
   *   pushq %rbp; movq %rsp,%rbp; movq %rdi,%rax; popq %rbp; retq
   *
   * i.e. returns `this` as the output HGNode (no wrapping node built).
   */
  public GetOutput(_r: HGRenderer): HgcBT2100_PQ_InverseOETF { // @Helium 0x3ae7e0
    return this;
  }

  /**
   * GetDOD(HGRenderer*, int index, HGRect out) — Helium @0x3ae2c0.
   *
   *   if (index != 0) *out = HGRectNull;      @0x3ae2c3..0x3ae2d5
   *   return *out (i.e. leave untouched for index==0);
   *
   * `HGRectNull` is a static 16-byte struct at symbol `_HGRectNull`
   * loaded via `leaq _HGRectNull(%rip), %rcx ; movq (%rcx),%rax ;
   * movq 0x8(%rcx),%r8` @0x3ae2cb..0x3ae2d5. The `out` HGRect is passed
   * by value in registers (rax:r8 in the sysv-abi return-in-regs form).
   */
  public GetDOD(_r: HGRenderer, index: number, out: HGRect): HGRect { // @Helium 0x3ae2c0
    if (index !== 0) {
      // *out = HGRectNull — deferred to HGRect port. Faithful behaviour
      // requires the concrete HGRectNull constant; until that lands, the
      // non-zero-index branch throws to make the frontier visible.
      throw new Error(
        "HGRectNull not yet transcribed (@Helium 0x3ae2cb — HgcBT2100_PQ_InverseOETF::GetDOD non-primary output)",
      );
    }
    return out;
  }

  /**
   * GetROI(HGRenderer*, int index, HGRect out) — Helium @0x3ae2e0.
   * Structurally identical to `GetDOD` above (same HGRectNull path).
   */
  public GetROI(_r: HGRenderer, index: number, out: HGRect): HGRect { // @Helium 0x3ae2e0
    if (index !== 0) {
      throw new Error(
        "HGRectNull not yet transcribed (@Helium 0x3ae2eb — HgcBT2100_PQ_InverseOETF::GetROI non-primary output)",
      );
    }
    return out;
  }

  /**
   * shaderDescription() const — Helium @0x3aca20. Constructs a 32-byte
   * `std::string` (Apple libc++ layout: {size, capacity, ptr} for long
   * strings) containing "HgcBT2100_PQ_InverseOETF [hgc1]" (0x1f = 31 chars
   * plus a NUL terminator). Ctor sequence:
   *
   *   dst->0x00 = 0x21             // size flag (0x21 = "long" mode)
   *   dst->0x08 = 0x1f             // length (31)
   *   dst->0x10 = new char[32]
   *   memcpy(dst->0x10, "HgcBT2100_PQ_InverseOETF [hgc1]", 32)
   *
   * The two `movups` at @0x3aca4d and @0x3aca58 write the 31-char string
   * (plus the trailing NUL at @0x3aca5b) split across offsets 0..0xf and
   * 0xf..0x1e of the freshly-`operator new`'d buffer.
   */
  public shaderDescription(): string { // @Helium 0x3aca20
    return "HgcBT2100_PQ_InverseOETF [hgc1]";
  }

  /**
   * GetProgram(HGRenderer*) — Helium @0x3ac7d0. Returns a pointer to a
   * Metal shader source string iff the renderer's target flag has
   * bit 0x60000 set to the value 0x60B10 (i.e. Metal 1.0). Otherwise
   * returns nullptr.
   *
   *   %eax = HGRenderer::GetTarget(0x60000)                @0x3ac7dc
   *   %rcx = 0;                                            @0x3ac7e1
   *   cmpl 0x60B10, %eax                                   @0x3ac7e3
   *   %rax = &"//Metal1.0 …" literal                       @0x3ac7e8
   *   cmoveq %rax, %rcx                                    @0x3ac7ef
   *   return %rcx;
   *
   * The literal-pool string starts with "//Metal1.0     \n//LEN=00000004a0"
   * and contains the fragment-func source shown in the file header.
   */
  public GetProgram(_r: HGRenderer): string | null { // @Helium 0x3ac7d0
    // HGRenderer::GetTarget is a frontier — until wired we cannot report
    // a Metal/OpenGL discriminator, so declining the fetch is faithful to
    // the cmoveq semantics (nullptr when the target != 0x60B10).
    throw new Error(
      "HGRenderer::GetTarget(unsigned) not yet transcribed (@Helium 0x3ac7dc — HgcBT2100_PQ_InverseOETF::GetProgram target-discriminator)",
    );
  }

  /**
   * InitProgramDescriptor(HGProgramDescriptor*) const — Helium @0x3ac800.
   * Wires a `HGProgramDescriptor` with:
   *
   *   desc->SetVisibleShaderWithSource(
   *     "HgcBT2100_PQ_InverseOETF_hgc_visible",
   *     "//Metal1.0 \\n//LEN=0000000382\\n[[ visible ]] FragmentOut …"
   *                                                        @0x3ac811..0x3ac822
   *   desc->SetFragmentFunctionName("HgcBT2100_PQ_InverseOETF")
   *                                                        @0x3ac827..0x3ac831
   *   desc->SetReturnBinding( HGBinding{
   *       kind = 0x4,              // 4-component
   *       name = "FragmentOut",    // packed into the sso-inline buffer
   *       type = <default 16-byte constant @0x3cb0>
   *   })                                                    @0x3ac836..0x3ac878
   *   desc->AddInputBinding(HGBinding{kind=0x2, name="float4"})  @0x3ac8a5..0x3ac8cd
   *   desc->AddInputBinding(HGBinding{kind=0xa, name="float4"})  @0x3ac8f4..0x3ac957
   *
   * The full trace continues past line 100 of the disasm; the transcription
   * requires HGProgramDescriptor + HGBinding ports (both frontier). Until
   * they land, the entire method throws with the head @0xADDR.
   */
  public InitProgramDescriptor(_desc: HGProgramDescriptor): void { // @Helium 0x3ac800
    throw new Error(
      "HGProgramDescriptor + HGBinding not yet transcribed (@Helium 0x3ac800 — HgcBT2100_PQ_InverseOETF::InitProgramDescriptor)",
    );
  }

  /**
   * Bind(HGHandler*) — Helium @0x3acae0. Uploads the three shader-visible
   * parameter slots to the handler at slots 0, 1, 2:
   *
   *   handler->vtable[0x90](handler, 0, base+0x00, 1);       @0x3acaed..0x3acb01
   *   handler->vtable[0x90](handler, 1, base+0x20, 1);       @0x3acb07..0x3acb22
   *   handler->vtable[0x90](handler, 2, base+0x40, 1);       @0x3acb28..0x3acb43
   *   this->vtable[0xc0](this, handler);                     @0x3acb49..0x3acb52
   *   return 0;                                              @0x3acb58
   *
   * i.e. it pushes `hg_Params[0..2]` from the aligned param bank into the
   * handler's constant-buffer slots and then defers to the base-class
   * `Bind` virtual (this->vtable+0xc0). Both HGHandler's slot-0x90
   * uploader and this class's slot-0xc0 override are frontier symbols.
   */
  public Bind(_h: HGHandler): number { // @Helium 0x3acae0
    throw new Error(
      "HGHandler vtable +0x90 + HGNode-derived vtable +0xc0 not yet transcribed (@Helium 0x3acae0 — HgcBT2100_PQ_InverseOETF::Bind)",
    );
  }

  /**
   * BindTexture(HGHandler* handler, int index) — Helium @0x3aca70.
   *
   *   if (index != 0) return -1;                               @0x3aca7c..0x3aca7e
   *   handler->vtable[0x48](handler, 0, 0);                    @0x3aca83..0x3aca8f
   *   handler->vtable[0x30](handler, 0, 0);                    @0x3aca92..0x3aca9c
   *   HGHandler::TexCoord(handler, 0, 0, 0, nullptr);          @0x3aca9f..0x3acaab
   *   int rc = *(*(this->0x90))(this->0x90, 0x2e);             @0x3acab0..0x3acabf
   *   if (rc != 0) return 0;                                   @0x3acac5..0x3acac7
   *   handler->vtable[0xa8](handler);                          @0x3acac9..0x3acacf
   *   return 0;
   *
   * The path threads through four HGHandler virtual slots and one
   * `HGHandler::TexCoord` free function — all frontier.
   */
  public BindTexture(_h: HGHandler, index: number): number { // @Helium 0x3aca70
    if (index !== 0) {
      return -1 | 0;
    }
    throw new Error(
      "HGHandler vtable slots +0x30/+0x48/+0x80/+0xa8 + HGHandler::TexCoord not yet transcribed (@Helium 0x3aca70 — HgcBT2100_PQ_InverseOETF::BindTexture)",
    );
  }

  /**
   * RenderTile(HGTile*) — Helium @0x3ad780. High-level dispatch:
   *
   *   HGRenderer* r = tile->Renderer();                       @0x3ad797
   *   unsigned tgt  = r->GetTarget(0);                        @0x3ad7a1
   *   if (tgt >= 0x4700000) return RenderTile_AVX(tile);      @0x3ad7a6..0x3ad7b3
   *   // else run the SSE fallback body starting @0x3ad7c6
   *   //   x0 = tile[0], x1 = tile[8], y0 = tile[4], y1 = tile[c]
   *   //   dst = tile[0x10], dst_stride = tile[0x18]
   *   //   src = tile[0x50], src_stride = tile[0x58]
   *   //   (see decoded prologue @0x3ad7c6..0x3ad7e5)
   *   //   for each row: for each pixel-block: apply the fragment-shader
   *   //     formula using slots 0..2 (PQ params) and the SIMD powf
   *   //     primitive constants in slots 3..30.
   *
   * The SSE body is 470+ lines of vectorised x86_64 whose faithful
   * transcription requires (a) an HGTile struct port, (b) an HGRenderer
   * target-flag decode, and (c) the shared SIMD powf primitive as a
   * standalone unit (it appears verbatim in every Hgc*_InverseOETF /
   * Hgc*_OETF class in Helium). Until those land, `RenderTile` throws
   * with the dispatch @0xADDR so downstream callers know the pixel path
   * is missing.
   */
  public RenderTile(_tile: HGTile): number { // @Helium 0x3ad780
    throw new Error(
      "HGTile pixel dispatch + shared SIMD powf primitive not yet transcribed (@Helium 0x3ad780 — HgcBT2100_PQ_InverseOETF::RenderTile SSE fallback body @0x3ad7c6..0x3ae2bb)",
    );
  }

  /**
   * RenderTile_AVX(HGTile*) — Helium @0x3acb60. Same pixel formula as
   * `RenderTile` but built on 256-bit AVX / vfmadd / vgatherdps ops; the
   * 568-line decoded body reads the same tile layout (0x00 x0 … 0x58
   * src_stride) and the same param bank (this+0x198) as the SSE fallback.
   * Throw until the AVX-SIMD companion port lands.
   */
  public RenderTile_AVX(_tile: HGTile): number { // @Helium 0x3acb60
    throw new Error(
      "HGTile pixel dispatch + shared AVX powf primitive not yet transcribed (@Helium 0x3acb60 — HgcBT2100_PQ_InverseOETF::RenderTile_AVX)",
    );
  }
}
