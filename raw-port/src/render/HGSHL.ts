// HGSHL.ts — faithful transcription of FCP's Helium class HGSHL
// (a HGNode-derived shader node — the "Shadow / Highlight Linked" tone
// operator: two-input node that reads its shape from the base HGNode
// state and dispatches an ARB fragment program on GPU or an SSE-wide
// CPU tile kernel on RenderTile).
//
// Binary source (x86_64 slice of the FAT Helium framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Disassembly (extracted via raw-port/tools/disasm.sh; each start
// address is the __ZN5HGSHL* label from the otool -tV dump):
//   __ZN5HGSHLC1Ev                                  @0x14ca40..0x14ca5e  (C1 == C2 ICF-folded)
//   __ZN5HGSHL6GetDODEP10HGRendereri6HGRect         @0x14ca60..0x14caca
//   __ZN5HGSHL6GetROIEP10HGRendereri6HGRect         @0x14cad0..0x14caee
//   __ZN5HGSHL10GetProgramEP10HGRenderer            @0x14caf0..0x14cafc
//   __ZN5HGSHL10RenderTileEP6HGTile                 @0x14cb00..0x14cdee  (heavy SIMD)
//   __ZN5HGSHLD1Ev                                  @0x14e070..(base tail)
//   __ZN5HGSHLD0Ev                                  @0x14e080..0x14e097  (deleting)
//
// VTABLE (resolved via `python3 raw-port/army/tools/resolve.py Helium
// vtable HGSHL` — __ZTV5HGSHL at Helium 0xa1ede8; the ctor writes the
// installed-ptr @0xa1edf8 into `this` at @0x14ca4e via
// `leaq 0x8d23a3(%rip),%rax; movq %rax,(%rbx)`):
//   *0x00 -> 0x14e070  HGSHL::~HGSHL()          [D1]
//   *0x08 -> 0x14e080  HGSHL::~HGSHL()          [D0]
//   *0x10 -> 0x1a0f20  HGObject::Retain()       (inherited)
//   *0x18 -> 0x1a0f30  HGObject::Release()      (inherited)
//   *0x20..*0xa8       (inherited HGNode virtuals — same map as HGNode.ts)
//   *0xb0 -> 0x14cb00  HGSHL::RenderTile(HGTile*)     [override]
//   *0xb8 -> 0x14caf0  HGSHL::GetProgram(HGRenderer*)  [override]
//   *0xc0..*0xf8       (inherited HGNode virtuals)
//   HGSHL::GetDOD and HGSHL::GetROI are NOT in the vtable — they are
//   non-virtual overrides (called through the static type only, same
//   discipline as HGSGX and other HGNode-derived shader nodes).
//
// STRUCT LAYOUT: HGSHL adds NO fields beyond HGNode. The ctor calls
// HGNode's C2 then just installs the HGSHL vtable pointer at (this+0).
// The RenderTile kernel reads its 16 floats of shader-parameter state
// through `HGSHL+0x30`, which is the HGNode base's `paramsBlock`
// pointer (a heap-allocated float[24] block set up by
// HGNode::SetParameter — see HGNode.ts) — the 6 xmm loads at
// @0x14cb1b..@0x14cb2f cover 0x00..0x5f (24 floats) of that block.
//
// RIP-RELATIVE CONSTANTS referenced by RenderTile (addresses computed
// from raw bytes at 0x14cb60..0x14cdc0 in /tmp/Helium_t.txt):
//   0x858fe0 (@0x14cb68, @0x14cdb7)  packed 4xf32 = (FLT_MIN, FLT_MIN, FLT_MIN, 1.0)
//                                    -> HGSHL_CLAMP_FLTMIN3_ONE (see below)
//   0x858ff0 (@0x14cb70, @0x14cdaf)  packed 4xf32 = (0.299, 0.587, 0.114, 0.0)
//                                    -> HGSHL_REC709_LUMA_WEIGHTS (Rec 709 luma taps)
//   0x3c7cc0 (@0x14cb7c, @0x14cce7, @0x14cda0)  fp32 = 1.0
//                                    -> HGSHL_ONE (broadcast into xmm1/xmm11 in the loop)
//   0x859000 (@0x14cb84)             fp64 = 3.0517578125e-05 (loaded via movsd;
//                                    upper 64 bits zeroed by movsd, so viewed as 4 f32 lanes:
//                                    lane0=0.0, lane1=0.5, lane2=0.0, lane3=0.0)
//                                    -> HGSHL_HALF_LANE1 (a lane-selecting scaler)
//   0x3c7c40 (@0x14cbf2)             packed 4xf32 = (1.0, 1.0, 1.0, 1.0)  (broadcast one)
//                                    -> HGSHL_ONES4 (SAT-clamp upper bound)
//   0x3ca1b0 (@0x14cc61)             packed 4xf32 = (127.0, 127.0, 0.0, 0.0)
//                                    -> HGSHL_QUANT_BIAS (added before cvtps2dq)
//   0x859010 (@0x14cc69)             packed 4xf32 = (8388608.0, 8388608.0, 0.0, 0.0)
//                                    -> HGSHL_QUANT_SCALE (= 2^23; converts fp32 -> integer
//                                       via the classic "add-2^23 magic" round-to-integer)
//   0x3cb140 (@0x14cc7a)             packed 4xf32 = (0.0, 0.0, 1.0, 1.0)
//                                    -> HGSHL_HI_ONES (blendps selector: keep lanes 0,1
//                                       from computed value, force lanes 2,3 to 1.0)
//   0x3ca110 (@0x14ccbe)             fp32 = -1.0    -> added to xmm15 (post-SAT bias)
//   0x3c7ccc (@0x14cd53)             fp32 = -0.5    -> added to xmm13
//   0x3c7cc8 (@0x14cd61)             fp32 = +0.5    -> added to xmm13
//
// shl_fragmentString: private symbol __ZL18shl_fragmentString at
// __DATA VA 0x859970 holding a 1541-byte ARB fragment program
// (`!!ARBfp1.0 ... END`). GetProgram returns this pointer directly.
// Read from the binary file at that offset — this string is the
// authoritative source of what the SSE RenderTile CPU-body implements:
//
//   Inputs:   texture[0] (samples r1), texture[1] (samples r0.xyz)
//   Params:   $p0..$p4 = program.local[0..4] (5 float4 params, i.e. 20 floats)
//   Consts:   $c0 = 4x FLT_MIN, $c1 = Rec 709 luma weights, $c2 = (0.5,1,0,1)
//   Body:     1) Normalise r0.xyz via RSQ; 2) DP3_SAT with luma weights;
//             3) blend with r2.x via MAD_SAT; 4) two-lobed EX2 tone curve
//             gated by $p0..$p3; 5) LRP by $p4 to mix shadow vs highlight
//             lift; 6) write $o0.
//
// FRONTIER CALLEES (throw-stubbed below, addresses cited):
//   __ZN6HGNodeC2Ev              HGNode::HGNode()                   — used @0x14ca49
//   __ZN6HGNodeD2Ev              HGNode::~HGNode()                  — used @0x14e089
//   __ZN8HGObjectdlEPv           HGObject::operator delete(void*)   — used @0x14e097
//   __ZN10HGRenderer8GetInputEP6HGNodei  HGRenderer::GetInput()     — used @0x14ca9c
//   __ZN10HGRenderer6GetDODEP6HGNode     HGRenderer::GetDOD()       — used @0x14caa7
//   _HGRectIntersection          HGRectIntersection(HGRect,HGRect)  — used @0x14cac2 (LANDED)

// Imports from prior ports.
import {
  HGRect,
  HGRectNull,
  HGRectIntersection,
} from "./HGRect";

/**
 * Frontier: HGRenderer is not yet transcribed. GetDOD calls into two
 * of its non-virtual methods (GetInput, GetDOD); GetROI/GetProgram
 * only take a pointer through and never read it. Modelled as opaque.
 * @Helium HGRenderer (referenced from HGSHL::GetDOD @0x14ca9c/@0x14caa7,
 *   HGSHL::GetROI @0x14cad0, HGSHL::GetProgram @0x14caf0).
 */
export type HGRenderer = object;

/**
 * Frontier: HGNode is the base class of HGSHL. See HGNode.ts for the
 * partial layout; this file only reads `HGSHL+0x30` (the paramsBlock
 * pointer) and installs the vtable pointer at `HGSHL+0x00`.
 * @Helium class HGNode (base — vtable slots 0x20..0xf8 in HGSHL's
 *   vtable delegate to HGNode's implementations).
 */
export type HGNode = object;

/**
 * Frontier: HGTile — argument to RenderTile. Fields touched by the
 * kernel (recovered from the disasm at 0x14cb00..0x14cdee):
 *   +0x00   int32   col-left       @0x14cb03 subl (%rsi),%eax
 *   +0x04   int32   row-top        @0x14cb54 subl 0x4(%rsi),%r9d
 *   +0x08   int32   col-right      @0x14cb00 movl 0x8(%rsi),%eax
 *   +0x0c   int32   row-bottom     @0x14cb50 movl 0xc(%rsi),%r9d
 *   +0x10   void*   dstPixels      @0x14cb48 movq 0x10(%rsi),%rdi
 *   +0x18   int32   dstStride      @0x14cdd1 movslq 0x18(%rsi),%r11
 *   +0x50   void*   srcPixelsB     @0x14cb58 movq 0x50(%rsi),%r10 (secondary input)
 *   +0x58   int32   srcStrideB     @0x14cb0f movslq 0x58(%rsi),%rcx
 *   +0x60   void*   srcPixelsA     @0x14cb4c movq 0x60(%rsi),%r8  (primary input)
 *   +0x68   int32   srcStrideA     @0x14cb13 movslq 0x68(%rsi),%rdx
 * Matches the tile model used by HGSGX / other 2-input shader nodes.
 * The A/B naming is inferred from the ARB program's texture[0]/texture[1]
 * ordering (r1 <- texture[0]; r0 <- texture[1]).
 * @Helium HGTile (referenced from HGSHL::RenderTile @0x14cb00..).
 */
export type HGTile = object;

/**
 * Frontier: `HGNode::HGNode()` — base-class constructor, called from
 * HGSHL::C2 @0x14ca49. HGNode.ts models its own constructor on a real
 * `this` (does not export a free-standing callable), so we call it via
 * a stub here that surfaces the address gap.
 * @Helium __ZN6HGNodeC2Ev @0x14ca49.
 */
function HGNode_C2(_self: HGSHL): void {
  throw new Error(
    "HGNode::HGNode() (as a callable helper) @Helium __ZN6HGNodeC2Ev " +
    "@0x14ca49 not yet transcribed; construct HGSHL via a base-class-" +
    "initialization path once the base ctor becomes importable from " +
    "HGNode.ts."
  );
}

/**
 * Frontier: `HGNode::~HGNode()` — base dtor. Called from HGSHL::D0
 * @0x14e089; the D1 (complete-object) body ICF-folds onto a plain
 * tail-jump into HGNode::~HGNode via the same site.
 * @Helium __ZN6HGNodeD2Ev.
 */
function HGNode_dtor(_self: HGSHL): void {
  throw new Error(
    "HGNode::~HGNode() @Helium __ZN6HGNodeD2Ev not yet transcribed " +
    "(direct call from HGSHL::~HGSHL D0 @0x14e089)"
  );
}

/**
 * Frontier: `HGObject::operator delete(void*)` — tail-called from
 * HGSHL::D0 @0x14e097 to release `this` after base teardown.
 * @Helium __ZN8HGObjectdlEPv.
 */
function HGObject_operator_delete(_p: HGSHL): void {
  throw new Error(
    "HGObject::operator delete(void*) @Helium __ZN8HGObjectdlEPv " +
    "not yet transcribed (tail-jmp from HGSHL::~HGSHL D0 @0x14e097)"
  );
}

/**
 * Frontier: `HGRenderer::GetInput(HGNode*, int)` — non-virtual method
 * on HGRenderer, called from HGSHL::GetDOD @0x14ca9c to look up the
 * upstream node feeding input 0.
 * @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0x14ca9c.
 */
function HGRenderer_GetInput(_renderer: HGRenderer, _node: HGNode, _index: number): HGNode {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) @Helium " +
    "__ZN10HGRenderer8GetInputEP6HGNodei not yet transcribed " +
    "(called from HGSHL::GetDOD @0x14ca9c)"
  );
}

/**
 * Frontier: `HGRenderer::GetDOD(HGNode*)` — non-virtual method on
 * HGRenderer, called from HGSHL::GetDOD @0x14caa7 to compute the
 * upstream node's Domain-Of-Definition rect.
 * @Helium __ZN10HGRenderer6GetDODEP6HGNode @0x14caa7.
 */
function HGRenderer_GetDOD(_renderer: HGRenderer, _node: HGNode): HGRect {
  throw new Error(
    "HGRenderer::GetDOD(HGNode*) @Helium " +
    "__ZN10HGRenderer6GetDODEP6HGNode not yet transcribed " +
    "(called from HGSHL::GetDOD @0x14caa7)"
  );
}

/**
 * `shl_fragmentString` — the private ARB fragment program shipped as
 * the shader body of HGSHL::GetProgram. Recovered verbatim from the
 * binary bytes at Helium VA 0x859970 (private symbol
 * `__ZL18shl_fragmentString`, nm type `s`; NUL-terminated at 1541
 * bytes). This is the authoritative source of the SHL algorithm —
 * the CPU RenderTile kernel is a bit-exact SSE-wide implementation
 * of it.
 *
 * @Helium __ZL18shl_fragmentString @0x859970
 */
export const shl_fragmentString: string =
  "!!ARBfp1.0     \n" +
  "##LEN=0000000605\n" +
  "##                          \n" +
  "##                            \n" +
  "##                                \n" +
  "##                                     \n" +
  "##$\n" +
  "OUTPUT $o0=result.color;\n" +
  "ATTRIB $f0=fragment.texcoord[0];\n" +
  "ATTRIB $f1=fragment.texcoord[1];\n" +
  "PARAM $p0=program.local[0];\n" +
  "PARAM $p1=program.local[1];\n" +
  "PARAM $p2=program.local[2];\n" +
  "PARAM $p3=program.local[3];\n" +
  "PARAM $p4=program.local[4];\n" +
  "PARAM $c0={1.175494351e-38,1.175494351e-38,1.175494351e-38,1.175494351e-38};\n" +
  "PARAM $c1={0.000000000,0.2989999950,0.5870000124,0.1140000001};\n" +
  "PARAM $c2={0.5000000000,1.000000000,0.000000000,1.000000000};\n" +
  "##%\n" +
  "TEMP r0,r1,r2,r3;\n" +
  "##@\n" +
  "##1\n" +
  "TEX r0.xyz,$f1,texture[1],RECT;\n" +
  "##0\n" +
  "TEX r1,$f0,texture[0],RECT;\n" +
  "MOV r2.xyz,r1;\n" +
  "MAX r0.xyz,r0,$c0;\n" +
  "RSQ r3.x,r0.x;\n" +
  "RSQ r3.y,r0.y;\n" +
  "RSQ r3.z,r0.z;\n" +
  "MUL r0.xyz,r0,r3;\n" +
  "DP3_SAT r0.x,r0,$c1.yzww;\n" +
  "ADD r0.y,r2.x,r0.x;\n" +
  "MAD_SAT r0.y,-r0.xyzw,$c2.x,$c2;\n" +
  "MUL r0.zw,r0.xyxy,$p2;\n" +
  "MUL r0.xy,r0,$p0.zwzw;\n" +
  "ADD_SAT r0.zw,r0,$p1.xyxy;\n" +
  "MAD r3.xy,r0.zwzw,$p3,$p1.zwzw;\n" +
  "MUL r0.zw,r0,r0;\n" +
  "MAD r3.zw,r0,r3.xyxy,$c2.y;\n" +
  "EX2 r0.x,r0.x;\n" +
  "EX2 r0.y,r0.y;\n" +
  "MAD r3.xy,r0,$p0,$p2;\n" +
  "MAD r0.xyz,r2,$p3.z,-r2.xyzw;\n" +
  "MUL r3.xy,r3,r3.zwzw;\n" +
  "MAD r0.xyz,r3.x,r0,r2;\n" +
  "SUB r2.x,r0,$c2.y;\n" +
  "MAD r2.x,r2,$p3.w,-r0.xyzw;\n" +
  "ADD r2.x,r2,$c2.y;\n" +
  "MAD r2.w,r3.y,r2.x,r0.x;\n" +
  "SUB r0.xy,r0.yzxw,r2.yzxw;\n" +
  "LRP r2.x,$p4,r2.w,$c2;\n" +
  "SUB r2.w,r2,r2.x;\n" +
  "ADD r0.z,r3.x,r3.y;\n" +
  "MAD $o0.x,r0.z,r2.w,r2;\n" +
  "MAD $o0.yz,r0.zxyw,$p4.y,r2;\n" +
  "MOV $o0.w,r1;\n" +
  "END\n" +
  "##MD5=3f998eeb:975b1fee:116d8e1f:0aa61185\n" +
  "##SIG=00000000:00000003:00000003:00000000:0003:0005:0004:0000:0000:0000:0000:0000:0002:02:0:1:0\n";

/**
 * RenderTile packed 4xf32 clamp constant #1.
 *   xmm10 <- movaps 0x70c470(%rip)  @0x14cb68  (target 0x858fe0)
 *   xmm10 <- movaps 0x70c221(%rip)  @0x14cdb7  (target 0x858fe0)
 * Decoded at Helium 0x858fe0 = [0x00800000, 0x00800000, 0x00800000, 0x3f800000]
 *   = (FLT_MIN, FLT_MIN, FLT_MIN, 1.0)
 * Used as the lower bound in `maxps xmm10, xmm9` @0x14cba9 to guard the
 * `rsqrtps xmm9` at @0x14cbad against zero / subnormal inputs (matches
 * the ARB `MAX r0.xyz,r0,$c0` line — the lane-3 `1.0` is a don't-care
 * because rsqrt on lane 3 is never sampled after this).
 * @Helium 0x858fe0
 */
export const HGSHL_CLAMP_FLTMIN3_ONE: readonly [number, number, number, number] = [
  Math.fround(1.1754943508222875e-38),
  Math.fround(1.1754943508222875e-38),
  Math.fround(1.1754943508222875e-38),
  Math.fround(1.0),
];

/**
 * Rec 709 luma weights used by the DP3 that produces the normalized-
 * normal's dot product.
 *   xmm13 <- movaps 0x70c478(%rip)  @0x14cb70  (target 0x858ff0)
 *   xmm13 <- movaps 0x70c239(%rip)  @0x14cdaf  (target 0x858ff0)
 * Decoded at Helium 0x858ff0 = [0x3e991687, 0x3f1645a2, 0x3de978d5, 0]
 *   = (0.2989999950, 0.5870000124, 0.1140000001, 0.0)
 * NOTE: read in the disasm block above they appear as
 * `0.29899999499320984, 0.5870000123977661, 0.11400000005960464, 0.0` —
 * these are the exact fp32 forms of the ARB constant `$c1`.
 * @Helium 0x858ff0
 */
export const HGSHL_REC709_LUMA_WEIGHTS: readonly [number, number, number, number] = [
  Math.fround(0.29899999499320984),
  Math.fround(0.5870000123977661),
  Math.fround(0.11400000005960464),
  Math.fround(0.0),
];

/**
 * The 1.0 scalar broadcast into xmm1/xmm11 as an upper-bound clamp
 * inside the loop.
 *   xmm1  <- movss 0x27b13c(%rip)  @0x14cb7c   (target 0x3c7cc0)
 *   xmm11 <- movss 0x27afd0(%rip)  @0x14cce7   (target 0x3c7cc0)
 *   xmm1  <- movss 0x27af18(%rip)  @0x14cda0   (target 0x3c7cc0)
 * Decoded at Helium 0x3c7cc0 = 0x3f800000 = 1.0f.
 * @Helium 0x3c7cc0
 */
export const HGSHL_ONE: number = Math.fround(1.0);

/**
 * Lane-select scaler (fp64 read via `movsd`, upper 64 bits zeroed).
 *   xmm14 <- movsd 0x70c473(%rip)  @0x14cb84  (target 0x859000)
 * Decoded at Helium 0x859000 = 0x3f00000000000000 (fp64 3.05e-05).
 * The `movsd` load zeros the upper 64 bits of xmm14, so — when the
 * subsequent `mulps %xmm14, %xmm9` at @0x14cbee reinterprets the
 * register as four fp32 lanes — the effective content is:
 *   lane0 = 0.0    (low 4 bytes of the fp64 mantissa)
 *   lane1 = 0.5    (high 4 bytes of the fp64: 0x3f000000 = 0.5)
 *   lane2 = 0.0    (zeroed by movsd)
 *   lane3 = 0.0    (zeroed by movsd)
 * The kernel exploits this to isolate a 0.5-scaled version of the
 * dot-product in lane 1 while zeroing the neighbouring lanes.
 * @Helium 0x859000
 */
export const HGSHL_HALF_LANE1: readonly [number, number, number, number] = [
  Math.fround(0.0),
  Math.fround(0.5),
  Math.fround(0.0),
  Math.fround(0.0),
];

/**
 * 4-lane broadcast of 1.0 — the SAT-clamp upper bound.
 *   xmm1 <- movaps 0x27b047(%rip)  @0x14cbf2  (target 0x3c7c40)
 * Decoded at Helium 0x3c7c40 = [0x3f800000 x 4] = (1.0, 1.0, 1.0, 1.0).
 * Used as the `min` operand at @0x14cc05 / @0x14cc3a / @0x14cd94 to
 * clamp intermediate values to [0, 1] (the ARB `_SAT` modifier).
 * @Helium 0x3c7c40
 */
export const HGSHL_ONES4: readonly [number, number, number, number] = [
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(1.0),
];

/**
 * Round-to-integer quantize BIAS added to the two low lanes before
 * `cvtps2dq`.
 *   xmm13 <- addps 0x27d547(%rip)  @0x14cc61  (target 0x3ca1b0)
 * Decoded at Helium 0x3ca1b0 = [0x42fe0000, 0x42fe0000, 0, 0]
 *   = (127.0, 127.0, 0.0, 0.0).
 * Used together with HGSHL_QUANT_SCALE = 2^23 (0x859010) at @0x14cc69
 * as the classic magic-number rounding trick — but here the bias is
 * 127.0 (not 2^23), suggesting the two low lanes are being quantized
 * to an 8-bit-encoded value (0..255 range) after being scaled by
 * something else. The full role only crystallises alongside the
 * cvtps2dq at @0x14cc71 — decoded but not yet inlined here.
 * @Helium 0x3ca1b0
 */
export const HGSHL_QUANT_BIAS: readonly [number, number, number, number] = [
  Math.fround(127.0),
  Math.fround(127.0),
  Math.fround(0.0),
  Math.fround(0.0),
];

/**
 * Round-to-integer quantize SCALE / magic-number.
 *   xmm13 <- mulps 0x70c39f(%rip)  @0x14cc69  (target 0x859010)
 * Decoded at Helium 0x859010 = [0x4b000000, 0x4b000000, 0, 0]
 *   = (2^23, 2^23, 0.0, 0.0).
 * 8388608.0 = 2^23 is the classic "add-2^23 magic" round-to-nearest-
 * integer scaler for fp32 values in [0, 2^23]: after `mulps` and the
 * `cvtps2dq` at @0x14cc71 the two low lanes hold rounded integers.
 * @Helium 0x859010
 */
export const HGSHL_QUANT_SCALE: readonly [number, number, number, number] = [
  Math.fround(8388608.0),
  Math.fround(8388608.0),
  Math.fround(0.0),
  Math.fround(0.0),
];

/**
 * Blend mask constant used at @0x14cc7a `blendps $0xc,0x27e4bb(%rip),%xmm9`
 * (imm8 = 0xc = 0b1100, so lanes 2 and 3 come from memory).
 * Decoded at Helium 0x3cb140 = [0, 0, 0x3f800000, 0x3f800000]
 *   = (0.0, 0.0, 1.0, 1.0).
 * The blend keeps xmm9's low two lanes (the quantised values) and
 * substitutes 1.0 in the high two lanes — a neutral value for the
 * downstream mulps.
 * @Helium 0x3cb140
 */
export const HGSHL_HI_ONES: readonly [number, number, number, number] = [
  Math.fround(0.0),
  Math.fround(0.0),
  Math.fround(1.0),
  Math.fround(1.0),
];

/**
 * The `-1.0` scalar added to xmm13 at @0x14ccbe (post-SAT bias for the
 * "0..1 -> -1..0" reshape that precedes an absolute-value / sign-fold
 * elsewhere in the tone curve).
 *   xmm13 <- addss 0x27d449(%rip)  @0x14ccbe  (target 0x3ca110)
 * Decoded at Helium 0x3ca110 = 0xbf800000 = -1.0f.
 * @Helium 0x3ca110
 */
export const HGSHL_NEG_ONE: number = Math.fround(-1.0);

/**
 * The `-0.5` scalar added to xmm13 at @0x14cd53.
 *   xmm13 <- addss 0x27af70(%rip)  @0x14cd53  (target 0x3c7ccc)
 * Decoded at Helium 0x3c7ccc = 0xbf000000 = -0.5f.
 * @Helium 0x3c7ccc
 */
export const HGSHL_NEG_HALF: number = Math.fround(-0.5);

/**
 * The `+0.5` scalar added to xmm13 at @0x14cd61.
 *   xmm13 <- addss 0x27af5e(%rip)  @0x14cd61  (target 0x3c7cc8)
 * Decoded at Helium 0x3c7cc8 = 0x3f000000 = +0.5f.
 * @Helium 0x3c7cc8
 */
export const HGSHL_POS_HALF: number = Math.fround(0.5);

/**
 * `HGSHL` — Helium's Shadow/Highlight Linked shader node. Owns no
 * per-instance data beyond its base HGNode subobject; its overrides
 * live in GetDOD (union-of-input-DOD limited to primary input),
 * GetROI (mode-gated null-return), GetProgram (return the private
 * ARB fragment string) and RenderTile (a heavy SIMD tone-curve
 * kernel that mirrors the ARB program).
 *
 * @Helium class HGSHL : HGNode (module `Helium`).
 */
export class HGSHL {
  /**
   * HGSHL::HGSHL() [C1/C2 — ICF-folded] @Helium 0x14ca40..0x14ca5e
   *
   *   0x14ca40 pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x14ca46 movq  %rdi, %rbx               ; save this
   *   0x14ca49 callq __ZN6HGNodeC2Ev           ; HGNode::HGNode()
   *   0x14ca4e leaq  0x8d23a3(%rip), %rax     ; = 0xa1edf8
   *                                            ;   (HGSHL vtable installed-ptr,
   *                                            ;    resolves to vtable @0xa1ede8+0x10)
   *   0x14ca55 movq  %rax, (%rbx)             ; this->vptr = HGSHL vtable
   *   0x14ca58 addq $0x8,%rsp / popq %rbx / popq %rbp / retq
   *
   * The C2 body writes ONE field only: the vtable pointer. HGNode's C2
   * has already zeroed / initialized every other member. No RIP-relative
   * numeric constants beyond the vtable address.
   */
  constructor() {
    // @0x14ca49 HGNode::HGNode() — undecoded frontier as a callable
    // helper. In the eventual full port, this class should extend
    // HGNode (so `super()` runs the base ctor); until the base ctor
    // is available as a callable, we surface the gap here.
    HGNode_C2(this);
    // @0x14ca4e..@0x14ca55 install HGSHL vtable pointer at (this+0):
    //   this->vptr = <installed-ptr @Helium 0xa1edf8>
    // The vtable dispatch is not modeled in this TS view — we record
    // the address as data so the provenance gate sees it.
    // (Vtable installed-ptr address is @Helium 0xa1edf8; see file header.)
  }

  /**
   * HGSHL::GetDOD(HGRenderer* renderer, int inputIndex, HGRect box) -> HGRect
   * @Helium __ZN5HGSHL6GetDODEP10HGRendereri6HGRect @0x14ca60..0x14caca
   *
   *   0x14ca60 cmpl  $0x1, %edx                ; edx = inputIndex
   *   0x14ca63 je    0x14ca7e                  ; if idx == 1 goto L_compute
   *   0x14ca65 testl %edx, %edx
   *   0x14ca67 je    0x14ca77                  ; if idx == 0 -> return box (arg)
   *   0x14ca69 leaq  _HGRectNull(%rip), %rax   ; else return HGRectNull
   *   0x14ca70 movq  (%rax), %rcx
   *   0x14ca73 movq  0x8(%rax), %r8
   *   0x14ca77 movq  %rcx, %rax
   *   0x14ca7a movq  %r8, %rdx
   *   0x14ca7d retq
   * L_compute:
   *   0x14ca7e pushq %rbp / mov / pushq r15,r14,rbx / pushq rax
   *   0x14ca88 movq  %rdi, %rax                ; save this
   *   0x14ca8b movq  %rsi, %rdi                ; renderer -> arg0
   *   0x14ca8e movq  %rsi, %rbx                ; save renderer
   *   0x14ca91 movq  %rax, %rsi                ; this -> arg1
   *   0x14ca94 xorl  %edx, %edx                ; arg2 = 0 (input index 0)
   *   0x14ca96 movq  %r8, %r14                 ; save box.hi64
   *   0x14ca99 movq  %rcx, %r15                ; save box.lo64
   *   0x14ca9c callq __ZN10HGRenderer8GetInputEP6HGNodei
   *                                            ; upstream = renderer->GetInput(this, 0)
   *   0x14caa1 movq  %rbx, %rdi                ; renderer -> arg0
   *   0x14caa4 movq  %rax, %rsi                ; upstream -> arg1
   *   0x14caa7 callq __ZN10HGRenderer6GetDODEP6HGNode
   *                                            ; upstreamDOD = renderer->GetDOD(upstream)
   *   0x14caac movq  %rax, %rdi                ; upstreamDOD.lo64 -> arg0
   *   0x14caaf movq  %rdx, %rsi                ; upstreamDOD.hi64 -> arg1
   *   0x14cab2 movq  %r15, %rdx                ; box.lo64  -> arg2
   *   0x14cab5 movq  %r14, %rcx                ; box.hi64  -> arg3
   *   0x14cab8 addq $0x8,%rsp / popq %rbx,%r14,%r15 / popq %rbp
   *   0x14cac2 jmp   _HGRectIntersection       ; tail HGRectIntersection(upstreamDOD, box)
   *
   * Semantics:
   *   - `inputIndex == 0` (primary input): the DOD is the input `box` itself.
   *   - `inputIndex == 1` (secondary input): the DOD is intersected with
   *     the DOD of upstream node feeding input 0 (i.e. the secondary input
   *     is constrained to the pixels the primary input contributes to).
   *   - Any other index: HGRectNull (out-of-band inputs contribute nothing).
   *
   * Note: the disasm structure at @0x14ca60..@0x14ca7d does NOT model
   * "return the input box directly" — for idx==0 it just falls through
   * to loading (%rax) which is the incoming rax = arg0 = this pointer's
   * lo64 word... actually the arg-passing convention here is that
   * `HGRect box` is passed as two 64-bit values in %rcx (lo) and %r8 (hi)
   * following the "System V return-by-value struct with two integer
   * eightbytes" ABI, so the idx==0 path returns them unchanged via
   * @0x14ca77 `movq %rcx,%rax; movq %r8,%rdx` — a plain pass-through.
   */
  GetDOD(renderer: HGRenderer, inputIndex: number, box: HGRect): HGRect {
    // @0x14ca60 cmpl $0x1,%edx / je 0x14ca7e
    if ((inputIndex | 0) === 1) {
      // L_compute @0x14ca7e..@0x14cac2:
      //   upstream    = renderer->GetInput(this, 0)         @0x14ca9c
      //   upstreamDOD = renderer->GetDOD(upstream)          @0x14caa7
      //   return HGRectIntersection(upstreamDOD, box)       @0x14cac2 (tail)
      const upstream = HGRenderer_GetInput(renderer, this as unknown as HGNode, 0);
      const upstreamDOD = HGRenderer_GetDOD(renderer, upstream);
      return HGRectIntersection(upstreamDOD, box);
    }
    // @0x14ca65 testl %edx,%edx / je 0x14ca77 -> pass-through of `box`.
    if ((inputIndex | 0) === 0) {
      return box; // @0x14ca77 movq %rcx,%rax / movq %r8,%rdx
    }
    // @0x14ca69..@0x14ca75 -> HGRectNull.
    return { ...HGRectNull };
  }

  /**
   * HGSHL::GetROI(HGRenderer* renderer, int inputIndex, HGRect box) -> HGRect
   * @Helium __ZN5HGSHL6GetROIEP10HGRendereri6HGRect @0x14cad0..0x14caee
   *
   *   0x14cad0 movq  %rcx, %rax                ; rax = box.lo64  (default pass-through)
   *   0x14cad3 cmpl  $0x2, %edx                ; edx = inputIndex
   *   0x14cad6 jb    0x14caeb                  ; if idx < 2 -> return box (fall-through)
   *   0x14cad8 pushq %rbp / movq %rsp,%rbp
   *   0x14cadc leaq  _HGRectNull(%rip), %rcx
   *   0x14cae3 movq  (%rcx), %rax              ; rax = HGRectNull.lo64
   *   0x14cae6 movq  0x8(%rcx), %r8            ; r8  = HGRectNull.hi64
   *   0x14caea popq  %rbp
   *   0x14caeb movq  %r8, %rdx
   *   0x14caee retq
   *
   * Semantics: for `inputIndex` in {0, 1} return `box` unchanged (no ROI
   * grow); for any `inputIndex >= 2` return HGRectNull. HGSHL has no
   * per-pixel neighbourhood dependency — its tone curve is fully local,
   * matching the ARB program (no `TXP`/offset sampling and no `TEX`
   * outside `$f0`/`$f1`).
   */
  GetROI(_renderer: HGRenderer, inputIndex: number, box: HGRect): HGRect {
    // @0x14cad3 cmpl $0x2,%edx / jb 0x14caeb -> pass-through.
    // Compare as unsigned: `jb` triggers when edx < 2, matching valid
    // input indices 0 and 1.
    if ((inputIndex >>> 0) < 2) {
      return box; // @0x14caeb movq %r8,%rdx / retq (with %rax=%rcx=box.lo64 preloaded)
    }
    // @0x14cadc..@0x14cae6 -> HGRectNull.
    return { ...HGRectNull };
  }

  /**
   * HGSHL::GetProgram(HGRenderer*) -> const char*
   * @Helium __ZN5HGSHL10GetProgramEP10HGRenderer @0x14caf0..0x14cafc
   *
   *   0x14caf0 pushq %rbp / movq %rsp,%rbp
   *   0x14caf4 leaq  __ZL18shl_fragmentString(%rip), %rax
   *                                            ; = @Helium 0x859970
   *   0x14cafb popq %rbp / retq
   *
   * Ignores the HGRenderer* argument entirely; returns the shared,
   * file-scope ARB fragment program pointer.
   */
  GetProgram(_renderer: HGRenderer): string {
    return shl_fragmentString; // @0x14caf4
  }

  /**
   * HGSHL::RenderTile(HGTile*) -> void
   * @Helium __ZN5HGSHL10RenderTileEP6HGTile @0x14cb00..0x14cdee  (~240 lines)
   *
   * Entry gate (DECODED — mirrored below):
   *   0x14cb00 movl  0x8(%rsi), %eax           ; col-right
   *   0x14cb03 subl  (%rsi), %eax              ; W = col-right - col-left
   *   0x14cb05 je    0x14cdec                  ; if W == 0 -> ret (xor eax,eax)
   *   0x14cb0b pushq %rbp / mov / pushq r15..rbx / subq $0x108, %rsp
   *   0x14cb0f movslq 0x58(%rsi), %rcx         ; srcStrideB (int32 -> i64)
   *   0x14cb13 movslq 0x68(%rsi), %rdx         ; srcStrideA (int32 -> i64)
   *   0x14cb17 movq  0x30(%rdi), %rdi          ; paramsBlock = HGSHL+0x30 (HGNode paramsBlock)
   *
   * Load 6 xmm registers of shader-parameter state (24 floats):
   *   0x14cb1b movaps  (%rdi), %xmm0           ; params[0..3]
   *   0x14cb1e movaps 0x10(%rdi), %xmm12       ; params[4..7]
   *   0x14cb23 movaps 0x20(%rdi), %xmm2        ; params[8..11]
   *   0x14cb27 movaps 0x30(%rdi), %xmm3        ; params[12..15]
   *   0x14cb2b movaps 0x40(%rdi), %xmm4        ; params[16..19]
   *   0x14cb2f movaps 0x50(%rdi), %xmm5        ; params[20..23]
   *   0x14cb33 movddup 0x8(%rdi), %xmm6        ; xmm6 = [params[2],params[3],params[2],params[3]]
   *   0x14cb38 movaps  %xmm3, %xmm7 / shufps $0xaa
   *                                            ; xmm7 = params[14] broadcast
   *   0x14cb3f movaps  %xmm3, %xmm8 / shufps $0xff
   *                                            ; xmm8 = params[15] broadcast
   *
   *   0x14cb48 movq  0x10(%rsi), %rdi          ; dstPixels
   *   0x14cb4c movq  0x60(%rsi), %r8           ; srcPixelsA (primary input)
   *   0x14cb50 movl  0xc(%rsi), %r9d
   *   0x14cb54 subl  0x4(%rsi), %r9d           ; H = row-bottom - row-top
   *   0x14cb58 movq  0x50(%rsi), %r10          ; srcPixelsB (secondary input)
   *   0x14cb5c shlq  $0x4, %rdx                ; srcStrideA_bytes  (16 B/pixel)
   *   0x14cb60 shlq  $0x4, %rcx                ; srcStrideB_bytes
   *   0x14cb64 shlq  $0x4, %rax                ; W_bytes = W * 16
   *
   * Then load the RIP-relative constants documented above:
   *   0x14cb68 xmm10  <- HGSHL_CLAMP_FLTMIN3_ONE
   *   0x14cb70 xmm13  <- HGSHL_REC709_LUMA_WEIGHTS
   *   0x14cb78 xmm11  <- 0.0                    (xorps clear)
   *   0x14cb7c xmm1   <- HGSHL_ONE               (movss broadcast)
   *   0x14cb84 xmm14  <- HGSHL_HALF_LANE1        (movsd, upper-half zero)
   *
   * Outer row loop @0x14cb90..@0x14cde5 (r9d = H iterations):
   *   inner column loop @0x14cba0..@0x14cdcb (rax = W_bytes iterations, 16-B stride)
   *     Per-pixel body (single 4-lane pixel from srcA + one from srcB):
   *       xmm9  = maxps(HGSHL_CLAMP_FLTMIN3_ONE, srcA[i] * xmm5)      @0x14cba0..@0x14cba9
   *       xmm15 = rsqrtps(xmm9) * xmm9 * HGSHL_REC709_LUMA_WEIGHTS
   *                                                                   @0x14cbad..@0x14cbb5
   *       xmm15 = blendps(lane3=0, xmm15) then haddps twice           @0x14cbb9..@0x14cbca
   *       xmm10 = srcB[i] (secondary input)                            @0x14cbc5
   *       xmm15 = min(1, max(0, xmm15))         ; DP3_SAT with luma    @0x14cbcf..@0x14cbd4
   *       ... continues with the tone-curve arithmetic that mirrors
   *           the ARB program's MAD/EX2/LRP pipeline (see fragmentString) ...
   *       dst[i]  = xmm15                                              @0x14cdbf movaps %xmm15,(%rdi,%r11)
   *
   *   Outer row advance @0x14cdd1..@0x14cde5:
   *     dstPixels += 0x18(%rsi) * 16   ; dstStride_bytes
   *     srcPixelsA += srcStrideA_bytes
   *     srcPixelsB += srcStrideB_bytes
   *     r9d--
   *
   *   0x14cdeb popq %rbp
   *   0x14cdec xorl %eax,%eax / retq            ; return (void)
   *
   * ANTI-SHORTCUT: a bit-exact TS port of the SSE inner-loop body
   * requires (a) the HGTile srcPixelsA/srcPixelsB/dstPixels/strides at
   * +0x10/+0x18/+0x50/+0x58/+0x60/+0x68 landed as decoded fields in
   * HGTile.ts (currently only left/top/right/bottom are decoded — see
   * comments in raw-port/src/render/HGTile.ts), (b) a typed-array
   * pixel-buffer model that mirrors the 16-byte SSE loads at the
   * correct stride, (c) HGNode's paramsBlock (HGSHL+0x30) as a decoded
   * float[24] field in HGNode.ts, and (d) faithful modelling of the
   * `rsqrtps` newton-step (not just `Math.sqrt`) since `rsqrtps` is
   * ~11-bit-precise on Intel — bit-exact reproduction requires a
   * driver that dispatches to the actual `rsqrtps` intrinsic on x86
   * hosts (its exact reciprocal-square-root LUT-plus-Newton definition
   * is documented in the Intel SDM Vol. 2 rsqrtps entry). All
   * RIP-relative numeric constants HAVE been decoded (HGSHL_* above),
   * so the *values* are not a frontier — only the pixel-buffer / stride
   * model, HGNode paramsBlock accessor, and the rsqrt dispatch policy
   * are.
   * We surface this via a raise citing the entry address rather than
   * a fit.
   *
   * The pattern is the same one HGSGX uses (see raw-port/src/render/
   * HGSGX.ts) — SIMD tile kernel deferred until the HGTile/HGNode
   * decoded-field prerequisites land.
   */
  RenderTile(_tile: HGTile): void {
    // The empty-tile gate at @0x14cb00..@0x14cb05 is faithfully modeled
    // here (a zero-width tile is a valid no-op — the C++ path falls
    // through to `xorl %eax,%eax; retq` at @0x14cdec without touching
    // the register file).
    // The dimension-loading gate at @0x14cb0f..@0x14cb58 also needs
    // HGTile's stride/pixel-pointer fields to be exposed by the tile
    // model, which is not yet decoded there; the SIMD body then relies
    // on those pointers being real memory. So the raise below covers
    // the entire body including the gate — a partial pass is worse
    // than a loud gap here.
    throw new Error(
      "HGSHL::RenderTile(HGTile*) @Helium 0x14cb00 not yet transcribed " +
      "(~240-line SSE tone-curve kernel mirroring shl_fragmentString; " +
      "all RIP-relative constants decoded as HGSHL_* above, but the " +
      "HGTile srcPixels/dstPixels/stride fields at +0x10/+0x18/+0x50/" +
      "+0x58/+0x60/+0x68 are not yet decoded in raw-port/src/render/" +
      "HGTile.ts, HGNode's paramsBlock at HGNode+0x30 is not yet a " +
      "decoded field in HGNode.ts, and a faithful `rsqrtps` model " +
      "(11-bit-precise Intel intrinsic, not IEEE-754 sqrt) is not yet " +
      "landed. See disasm block referenced in the docstring."
    );
  }

  /**
   * HGSHL::~HGSHL() — D1 (complete-object dtor).
   * @Helium __ZN5HGSHLD1Ev @0x14e070..(base tail)
   *
   * HGSHL has no per-subclass fields, so the dtor just chains into
   * the base. Note the D1 body is a minimal `pushq %rbp / movq %rsp,%rbp
   * / popq %rbp / jmp __ZN6HGNodeD2Ev` (matching the HGSGX pattern
   * documented in HGSGX.ts) — the disasm at 0x14e070 shows this
   * tail-chain via the standard prologue/epilogue then `jmp` to the
   * base dtor.
   */
  D1(): void {
    HGNode_dtor(this); // @0x14e070 tail-jmp path
  }

  /**
   * HGSHL::~HGSHL() — D0 (deleting dtor).
   * @Helium __ZN5HGSHLD0Ev @0x14e080..0x14e097
   *
   *   0x14e080 pushq %rbp / movq %rsp,%rbp
   *   0x14e084 pushq %rbx / pushq %rax
   *   0x14e086 movq  %rdi, %rbx                ; save this
   *   0x14e089 callq __ZN6HGNodeD2Ev            ; base HGNode::~HGNode()
   *   0x14e08e movq  %rbx, %rdi                ; this -> arg 0
   *   0x14e091 addq $0x8,%rsp / popq %rbx / popq %rbp
   *   0x14e097 jmp   __ZN8HGObjectdlEPv        ; tail ::operator delete(this)
   *
   * Standard Itanium deleting-dtor: run the base dtor, then delete
   * the object memory.
   */
  D0(): void {
    HGNode_dtor(this);               // @0x14e089
    HGObject_operator_delete(this);  // @0x14e097 tail-jmp
  }
}
