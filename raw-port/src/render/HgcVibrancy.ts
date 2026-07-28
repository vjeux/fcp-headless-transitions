// raw-port/src/render/HgcVibrancy.ts
//
// FCP `HgcVibrancy` — Flexo/Helium GPU compute-kernel node implementing
// the "Vibrancy" color adjustment. `Hgc*` classes are HGNode subclasses
// that own a uniform buffer at +0x198 and a Metal/GL shader whose source
// is the literal-pool string returned by GetProgram/InitProgramDescriptor.
//
// The Vibrancy shader is a saturation-boost variant that:
//   1. Computes YUV(-like) coefficients from RGB via three dot products
//      with constant vectors c0 (luma), c1 (Cb-like), c2 (Cr-like).
//   2. Detects skin-tone chroma range via 4 half-plane comparisons and a
//      fmin cascade; combines this with a chroma-magnitude term.
//   3. Blends the input saturation factor toward c3.z = 1.0 using the
//      skin/magnitude mask, then converts the boosted chroma back to RGB
//      via three more dot products with constant matrix c3/c4.
//
// One instance owns:
//   +0x198  aligned uniform buffer (32-byte aligned; raw ptr stashed 8
//           bytes before the aligned view; total alloc = 0x227 = 551 bytes).
//   +0x1a0..+0x1a3   inherited HGNode fields
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (fat slice x86_64 at file offset 0x4000):
//
//   raw-port/re/disasm/Flexo.HgcVibrancy.HgcVibrancy.s               (C1 tail-jmp; C2 body)
//   raw-port/re/disasm/Flexo.HgcVibrancy.~HgcVibrancy.s              (D0)
//   raw-port/re/disasm/Flexo.HgcVibrancy.SetParameter.s              (36 lines)
//   raw-port/re/disasm/Flexo.HgcVibrancy.GetDOD.s                    (13 lines)
//   raw-port/re/disasm/Flexo.HgcVibrancy.GetROI.s                    (13 lines)
//   raw-port/re/disasm/Flexo.HgcVibrancy.GetOutput.s                 (9 lines)
//   raw-port/re/disasm/Flexo.HgcVibrancy.GetProgram.s                (14 lines)
//   raw-port/re/disasm/Flexo.HgcVibrancy.BindTexture.s               (41 lines)
//   raw-port/re/disasm/Flexo.HgcVibrancy.Bind.s                      (23 lines)
//   raw-port/re/disasm/Flexo.HgcVibrancy.shaderDescription.s         (12 lines)
//   raw-port/re/disasm/Flexo.HgcVibrancy.InitProgramDescriptor.s     (127 lines) [large — stubbed]
//   raw-port/re/disasm/Flexo.HgcVibrancy.RenderTile.s                (295 lines) [SSE CPU impl — stubbed]
//   raw-port/re/disasm/Flexo.HgcVibrancy.RenderTile_AVX.s            (227 lines) [AVX CPU impl — stubbed]
//
// SEVENTEEN exported symbols in Flexo.ledger.json (all under HgcVibrancy):
//   @Flexo 0x146f760  C2  HgcVibrancy() base ctor (allocates + inits uniform buffer)
//   @Flexo 0x146f920  C1  HgcVibrancy() complete ctor — 5-byte push/pop/jmp tail into C2
//   @Flexo 0x146f930  D2  ~HgcVibrancy() base dtor  (frees buffer if raw-ptr non-null; tail-jmp HGNode::D2)
//   @Flexo 0x146f980  D1  ~HgcVibrancy() complete dtor — body identical to D2
//   @Flexo 0x146f9d0  D0  ~HgcVibrancy() deleting dtor — D2 body + tail-jmp HGObject::operator delete
//   @Flexo 0x146ea40  GetProgram(HGRenderer*)
//   @Flexo 0x146ea70  InitProgramDescriptor(HGProgramDescriptor*) const
//   @Flexo 0x146ec90  shaderDescription() const
//   @Flexo 0x146ecc0  BindTexture(HGHandler*, int)
//   @Flexo 0x146ed30  Bind(HGHandler*)
//   @Flexo 0x146ed70  RenderTile_AVX(HGTile*)                       [stubbed — 227 lines]
//   @Flexo 0x146f1e0  RenderTile(HGTile*)                           [stubbed — 295 lines]
//   @Flexo 0x146f720  GetDOD(HGRenderer*, int, HGRect)
//   @Flexo 0x146f740  GetROI(HGRenderer*, int, HGRect)
//   @Flexo 0x146fa20  SetParameter(int, float, float, float, float)
//   @Flexo 0x146fa90  GetParameter(int, float*)                     [not disassembled — stubbed]
//   @Flexo 0x146fad0  GetOutput(HGRenderer*)
//
// Vtable installed by C2: @Flexo `leaq 0x4bf612(%rip), %rax` @0x146f76f =>
//   next_rip 0x146f776 + 0x4bf612 = 0x192ed88. (Full slot map not required
//   for this port — vtable overrides are captured per-method by class
//   membership. See resolve.py Flexo vtable HgcVibrancy for the full dump.)
//
// STRUCT LAYOUT:
//   ---- HGObject (0x00..0x10) inherited ----
//   ---- HGNode   (0x10..0x198) inherited ----
//   +0x198 : void*    alignedUniformBufferPtr    (points into a 0x227-byte alloc,
//                                                  raw ptr stashed at [buf-8])
// (No new instance fields; all state lives in the aligned uniform buffer.)
//
// UNIFORM BUFFER LAYOUT (offsets relative to `alignedUniformBufferPtr` which
// is the +8-past-32-byte-alignment view of the raw allocation):
//
//   +0x00, +0x10  4xf32  vibrancyParams  (written by SetParameter — the ONLY
//                                          field the app tweaks at runtime;
//                                          replicated in both slots so the
//                                          shader can pick either)
//   +0x08, +0x18  4xf32  ZERO                    (movaps xorps 0)
//   +0x28, +0x38  4xf32  RGB2Y                   (@0x15895c0 : <0.2126, 0.7152, 0.0722, 0.0>)
//                                                 = ITU-R BT.709 luma coefficients (plus 0 alpha)
//   +0x48, +0x58  4xf32  RGB2Cb                  (@0x15897d0 : <-0.11457, -0.38543, 0.5, 0.0>)
//   +0x68, +0x78  4xf32  RGB2Cr                  (@0x15897e0 : <0.5, -0.45415, -0.04585, 0.0>)
//   +0x88, +0x98  4xf32  SKIN_LO_HI              (@0x1589b20 : <-0.425, 1.0, 1.0, 0.0>)
//   +0xa8, +0xb8  4xf32  SKIN_STEP               (@0x1589b30 : <1.0, 0.025, 0.025, 0.0>)
//   +0xc8, +0xd8  4xf32  0.385 broadcast         (@0x1589b70, movss + movaps broadcast)
//   +0xe8, +0xf8  4xf32  ABS_MASK_LANE0          (@0x1589b40 : <0x7FFFFFFF, 0xFF..FF, 0xFF..FF, 0xFF..FF>)
//                                                 fabs bitmask on lane 0 (clear sign bit);
//                                                 keep-as-is on lanes 1..3.
//   +0x108,+0x118  4xf32  20.0 broadcast         (@0x1570120, movss + movaps broadcast — c3.x)
//   +0x128,+0x138  4xf32  RGB_TAIL_A              (@0x1589b50 : <0.025, 1.0, 1.0, 0.0>)
//   +0x148,+0x158  4xf32  ONE_PLUS_EPS_BROADCAST  (@0x15890d0 : <1.000244, 1.000244, 1.000244, 1.000244>
//                                                  = 2^0 * (1 + 2^-12); a 16-bit half-precision
//                                                  "1.0 + one-ulp-half" — used in a mix() term)
//   +0x168,+0x178  4xf32  RGB_TAIL_B              (@0x1589b60 : <2.5, 0.025, 0.025, 0.0>  = c3.y-ish)
//   +0x188,+0x198  4xf32  YUV2RGB_ROW0            (@0x1589800 : <1.0, 1.8556, 1.5748, 0.0>  = c4.xyw)
//   +0x1a8,+0x1b8  4xf32  YUV2RGB_ROW1            (@0x1589810 : <1.0, -0.18732, -0.46812, 0.0> = c4.xyz)
//   +0x1c8,+0x1d8  4xf32  YUV2RGB_ROW2_STUB       (@0x1589820 : movsd loads <1.0, 1.5748>; upper
//                                                  bytes zeroed by movsd => final f32 = <1.0, 1.5748, 0, 0>)
//   +0x1e8,+0x1f8  4xf32  ALPHA_LANE_MASK         (@0x1589170 : <0, 0, 0, 0xFFFFFFFF>)
//                                                  "isolate alpha" bitmask (keep only lane 3)
//
// All 15 constant addresses above are decoded byte-for-byte from the Flexo
// x86_64 slice (see DECODE dumps in the ipython session that produced this
// file — every value corroborated by direct binary read at file offset
// 0x4000 + <VA> using struct.unpack('<ffff', ...) or '<IIII' for masks).
//
// The Metal shader source declares:
//   c0 = float4(0.2125999928, 0.7152000070, 0.07220000029, 0.3849999905)
//   c1 = float4(-0.1145720035, -0.3854280114, 0.5000000000, 0.02500000037)
//   c2 = float4(0.5000000000, -0.4541530013, -0.04584699869, -0.4250000119)
//   c3 = float4(20.00000000, 2.500000000, 1.000000000, 1.574800014)
//   c4 = float4(1.000000000, -0.1873240024, -0.4681240022, 1.855599999)
// The scalar 0.385 and 0.025, and the masks, live in the uniform buffer
// slots so the runtime can swap them (or the CPU RenderTile_AVX can index
// them uniformly). This is consistent with the shader `hg_Params[0].x`
// input being the runtime-tunable saturation strength — the only slot that
// SetParameter writes.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (each stub throws with the exact call-site @0xADDR):
//   HGNode::HGNode()                                 @Flexo 0x146f76a (C2)
//   operator new[](unsigned long)                    @Flexo 0x146f77e (C2)
//   operator delete(void*) via __ZdlPv               @Flexo 0x146f963 (D2), 0x146f9b3 (D1),
//                                                     0x146f9f8 (D0)
//   HGNode::~HGNode()                                @Flexo 0x146f944, 0x146f951 (D2),
//                                                     0x146f971 (D2 tail-jmp),
//                                                     0x146f994, 0x146f9a1 (D1),
//                                                     0x146f9c1 (D1 tail-jmp), 0x146fa00 (D0)
//   HGObject::operator delete(void*)                 @Flexo 0x146fa0e (D0 tail-jmp)
//   HGNode::ClearBits()                              @Flexo 0x146fa7d (SetParameter)
//   HGRenderer::GetTarget(unsigned int)              @Flexo 0x146ea4c (GetProgram)
//   HGHandler.vtable[*0x48] (0, 0)                   @Flexo 0x146ecdf (BindTexture)
//   HGHandler.vtable[*0x30] (0, 0)                   @Flexo 0x146ecec (BindTexture)
//   HGHandler::TexCoord(0, 0, 0, NULL)               @Flexo 0x146ecfb (BindTexture)
//   handler[+0x90]->vtable[*0x80] (0x2e)             @Flexo 0x146ed0f (BindTexture) — GL probe
//   this->vtable[*0xa8]                              @Flexo 0x146ed1f (BindTexture) — GL fallback
//   HGHandler.vtable[*0x90] (0, ..., 1)              @Flexo 0x146ed51 (Bind)
//   this->vtable[*0xc0] (handler)                    @Flexo 0x146ed60 (Bind)

import { HGObject } from "./HGObject.js";
import { HGNode } from "./HGNode.js";
import { HGRect, HGRectNull } from "./HGRect.js";

/** Opaque handle for Helium's `HGRenderer*` render-graph context. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };
/** Opaque handle for Helium's `HGTile*` (the tile being rendered). */
export type HGTilePtr = { readonly __brand: "HGTile" };
/** Opaque handle for Helium's `HGHandler*` (render-state binder). */
export type HGHandlerPtr = { readonly __brand: "HGHandler" };
/** Opaque handle for Helium's `HGProgramDescriptor*`. */
export type HGProgramDescriptorPtr = { readonly __brand: "HGProgramDescriptor" };

// ---------------------------------------------------------------------------
// DECODED uniform-buffer constants (verified byte-for-byte against
// Flexo x86_64 slice at file offset 0x4000 + VA).
// ---------------------------------------------------------------------------

/** @Flexo __const @0x15895c0 — ITU-R BT.709 RGB->Y coefficients (c0.xyz).
 *  <0.2125999928, 0.7152000070, 0.0722000003, 0.0>. Also mentioned in the
 *  Metal shader source as `c0`. */
const RGB2Y_AT_0x15895c0: readonly [number, number, number, number] = [
  Math.fround(0.2125999928),
  Math.fround(0.7152000070),
  Math.fround(0.0722000003),
  Math.fround(0.0),
];

/** @Flexo __const @0x15897d0 — RGB->Cb-like coefficients (c1.xyz + c1.w = 0.025).
 *  <-0.1145720035, -0.3854280114, 0.5, 0.0>. */
const RGB2CB_AT_0x15897d0: readonly [number, number, number, number] = [
  Math.fround(-0.1145720035),
  Math.fround(-0.3854280114),
  Math.fround(0.5),
  Math.fround(0.0),
];

/** @Flexo __const @0x15897e0 — RGB->Cr-like coefficients (c2.xyz).
 *  <0.5, -0.4541530013, -0.0458469987, 0.0>. */
const RGB2CR_AT_0x15897e0: readonly [number, number, number, number] = [
  Math.fround(0.5),
  Math.fround(-0.4541530013),
  Math.fround(-0.0458469987),
  Math.fround(0.0),
];

/** @Flexo __const @0x1589b20 — skin-tone lo/hi thresholds:
 *  <-0.425, 1.0, 1.0, 0.0>. */
const SKIN_LO_HI_AT_0x1589b20: readonly [number, number, number, number] = [
  Math.fround(-0.425),
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(0.0),
];

/** @Flexo __const @0x1589b30 — skin-step scalars: <1.0, 0.025, 0.025, 0.0>. */
const SKIN_STEP_AT_0x1589b30: readonly [number, number, number, number] = [
  Math.fround(1.0),
  Math.fround(0.025),
  Math.fround(0.025),
  Math.fround(0.0),
];

/** @Flexo __const @0x1589b70 — scalar 0.385 (broadcasted to all lanes
 *  via movss + subsequent movaps stores). Matches c0.w in the shader. */
const F_0x385_AT_0x1589b70: number = Math.fround(0.3849999905);

/** @Flexo __const @0x1589b40 — <0x7FFFFFFF, 0xFF..FF, 0xFF..FF, 0xFF..FF>.
 *  Lane 0 = fabs bitmask (clear sign bit); lanes 1..3 = all-ones (no-op
 *  on a subsequent `andps`). Used for `fabs` on the chroma delta. */
const ABS_MASK_LANE0_AT_0x1589b40_U32: readonly [number, number, number, number] = [
  0x7fffffff,
  0xffffffff,
  0xffffffff,
  0xffffffff,
];

/** @Flexo __const @0x1570120 — scalar 20.0 (broadcast). Matches c3.x. */
const F_20_AT_0x1570120: number = Math.fround(20.0);

/** @Flexo __const @0x1589b50 — <0.025, 1.0, 1.0, 0.0>. */
const RGB_TAIL_A_AT_0x1589b50: readonly [number, number, number, number] = [
  Math.fround(0.025),
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(0.0),
];

/** @Flexo __const @0x15890d0 — <1.000244, 1.000244, 1.000244, 1.000244>.
 *  = 1 + 2^-12; a "one plus half-precision ulp" broadcast used by the
 *  gain-clip term in the shader tail. */
const ONE_PLUS_HALF_ULP_AT_0x15890d0: readonly [number, number, number, number] = [
  Math.fround(1.0002442598342896),
  Math.fround(1.0002442598342896),
  Math.fround(1.0002442598342896),
  Math.fround(1.0002442598342896),
];

/** @Flexo __const @0x1589b60 — <2.5, 0.025, 0.025, 0.0>. Matches c3.yz mix. */
const RGB_TAIL_B_AT_0x1589b60: readonly [number, number, number, number] = [
  Math.fround(2.5),
  Math.fround(0.025),
  Math.fround(0.025),
  Math.fround(0.0),
];

/** @Flexo __const @0x1589800 — YUV->RGB row 0: <1.0, 1.8556, 1.5748, 0.0>.
 *  This is `(c4.x, c4.w, c3.w, 0)` from the shader source. */
const YUV2RGB_ROW0_AT_0x1589800: readonly [number, number, number, number] = [
  Math.fround(1.0),
  Math.fround(1.8555999994),
  Math.fround(1.5748000145),
  Math.fround(0.0),
];

/** @Flexo __const @0x1589810 — YUV->RGB row 1: <1.0, -0.18732, -0.46812, 0.0>.
 *  = `c4.xyz` from the shader source. */
const YUV2RGB_ROW1_AT_0x1589810: readonly [number, number, number, number] = [
  Math.fround(1.0),
  Math.fround(-0.1873240024),
  Math.fround(-0.4681240022),
  Math.fround(0.0),
];

/** @Flexo __const @0x1589820 — YUV->RGB row 2 pair (movsd; upper zeroed):
 *  `<1.0, 1.5748, 0, 0>`. */
const YUV2RGB_ROW2_AT_0x1589820: readonly [number, number, number, number] = [
  Math.fround(1.0),
  Math.fround(1.5748000145),
  Math.fround(0.0),
  Math.fround(0.0),
];

/** @Flexo __const @0x1589170 — "isolate alpha" bitmask:
 *  `<0, 0, 0, 0xFFFFFFFF>`. */
const ALPHA_LANE_MASK_AT_0x1589170_U32: readonly [number, number, number, number] = [
  0x00000000,
  0x00000000,
  0x00000000,
  0xffffffff,
];

// ---------------------------------------------------------------------------
// Frontier callees (each stub throws citing its call-site @0xADDR).
// ---------------------------------------------------------------------------

/** operator new[](0x227) — frontier callee @Flexo 0x146f77e (C2). Allocates
 *  551 bytes for the aligned uniform buffer + 8-byte raw-pointer stash. */
function operatorNewArray(_size: number): Uint8Array {
  throw new Error(
    "operator new[](unsigned long) not yet transcribed " +
      "(frontier callee @Flexo 0x146f77e in HgcVibrancy::HgcVibrancy [C2])",
  );
}

/** operator delete(void*) via __ZdlPv — frontier callee at three sites:
 *    @Flexo 0x146f963 (D2)
 *    @Flexo 0x146f9b3 (D1)
 *    @Flexo 0x146f9f8 (D0)
 *  Frees the raw buffer stashed 8 bytes before the aligned view. */
function operatorDelete(_p: unknown): void {
  throw new Error(
    "operator delete(void*) not yet transcribed " +
      "(frontier callee @Flexo 0x146f963 / 0x146f9b3 / 0x146f9f8 in HgcVibrancy dtors)",
  );
}

/** HGNode::ClearBits() — frontier callee @Flexo 0x146fa7d (SetParameter).
 *  Called after a real parameter write to invalidate cached render output. */
function HGNode_ClearBits(_self: HgcVibrancy): void {
  throw new Error(
    "HGNode::ClearBits() not yet transcribed " +
      "(frontier callee @Flexo 0x146fa7d in HgcVibrancy::SetParameter)",
  );
}

/** HGRenderer::GetTarget(unsigned int) — frontier callee @Flexo 0x146ea4c
 *  (GetProgram). Called with arg=0x60000. Return < 0x60b10 => shader; else null. */
function HGRenderer_GetTarget(_renderer: HGRendererPtr, _arg: number): number {
  throw new Error(
    "HGRenderer::GetTarget(unsigned int) not yet transcribed " +
      "(frontier callee @Flexo 0x146ea4c in HgcVibrancy::GetProgram)",
  );
}

/** handler->vtable[*0x48](0, 0) — frontier callee @Flexo 0x146ecdf (BindTexture). */
function HGHandler_vtable_0x48(_h: HGHandlerPtr, _a: number, _b: number): void {
  throw new Error(
    "HGHandler->vtable[*0x48] not yet transcribed " +
      "(frontier callee @Flexo 0x146ecdf in HgcVibrancy::BindTexture)",
  );
}

/** handler->vtable[*0x30](0, 0) — frontier callee @Flexo 0x146ecec (BindTexture). */
function HGHandler_vtable_0x30(_h: HGHandlerPtr, _a: number, _b: number): void {
  throw new Error(
    "HGHandler->vtable[*0x30] not yet transcribed " +
      "(frontier callee @Flexo 0x146ecec in HgcVibrancy::BindTexture)",
  );
}

/** HGHandler::TexCoord(0, 0, 0, NULL) — frontier callee @Flexo 0x146ecfb
 *  (BindTexture). */
function HGHandler_TexCoord(
  _h: HGHandlerPtr,
  _a: number,
  _b: number,
  _c: number,
  _d: unknown,
): void {
  throw new Error(
    "HGHandler::TexCoord(int,int,int,double const*) not yet transcribed " +
      "(frontier callee @Flexo 0x146ecfb in HgcVibrancy::BindTexture)",
  );
}

/** handler[+0x90]->vtable[*0x80](0x2e) — GL probe. Frontier callee
 *  @Flexo 0x146ed0f (BindTexture). Nonzero => skip this->vtable[*0xa8]. */
function handler_field0x90_vtable_0x80(_h: HGHandlerPtr, _a: number): number {
  throw new Error(
    "handler[+0x90]->vtable[*0x80] not yet transcribed " +
      "(frontier callee @Flexo 0x146ed0f in HgcVibrancy::BindTexture)",
  );
}

/** this->vtable[*0xa8](handler) — GL-fallback bind. Frontier callee
 *  @Flexo 0x146ed1f (BindTexture). Only fires when GL probe returned 0. */
function this_vtable_0xa8(_self: HgcVibrancy, _h: HGHandlerPtr): void {
  throw new Error(
    "this->vtable[*0xa8] not yet transcribed " +
      "(frontier callee @Flexo 0x146ed1f in HgcVibrancy::BindTexture)",
  );
}

/** handler->vtable[*0x90](0, uniformBufferPtr, 1) — frontier callee
 *  @Flexo 0x146ed51 (Bind). Uploads the uniform buffer to the shader. */
function HGHandler_vtable_0x90(
  _h: HGHandlerPtr,
  _a: number,
  _buf: unknown,
  _b: number,
): void {
  throw new Error(
    "HGHandler->vtable[*0x90] not yet transcribed " +
      "(frontier callee @Flexo 0x146ed51 in HgcVibrancy::Bind)",
  );
}

/** this->vtable[*0xc0](handler) — frontier callee @Flexo 0x146ed60 (Bind).
 *  Per resolve.py this typically resolves to HGNode::BindParamBufferDesc. */
function this_vtable_0xc0(_self: HgcVibrancy, _h: HGHandlerPtr): void {
  throw new Error(
    "this->vtable[*0xc0] not yet transcribed " +
      "(frontier callee @Flexo 0x146ed60 in HgcVibrancy::Bind)",
  );
}

// ---------------------------------------------------------------------------
// Metal shader source string — literal pool referenced by GetProgram.
// ---------------------------------------------------------------------------

/** @Flexo __cstring literal pool referenced by `leaq 0x2412d0(%rip)`
 *  @GetProgram+0x18 (@0x146ea58). The full Metal 1.0 fragment source
 *  computed inline in GetProgram; the values c0..c4 in the source match
 *  the uniform buffer constants exactly (RGB2Y/RGB2CB/RGB2CR/etc.). */
export const HGC_VIBRANCY_METAL_SHADER: string =
  "//Metal1.0     \n//LEN=000000084a\n" +
  "// HgcVibrancy fragment (from Flexo __cstring pool referenced by\n" +
  "// leaq 0x2412d0(%rip) @Flexo 0x146ea58; ~2 KB body preserved in\n" +
  "// the binary — see raw-port/re/disasm/Flexo.HgcVibrancy.GetProgram.s\n" +
  "// for the exact source with c0..c4 constants matching this file's\n" +
  "// RGB2Y/RGB2CB/RGB2CR/etc. uniform-buffer constants.)\n";

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

/**
 * `HgcVibrancy` — Flexo compute-kernel HGNode. Applies a chroma-aware
 * saturation boost with skin-tone protection.
 *
 * See file header for full layout, vtable, and decode citations.
 */
export class HgcVibrancy extends HGNode {
  /** +0x198 — aligned uniform-buffer view (32-byte aligned + 8, exactly
   *  as produced by the alignment dance in C2). The raw allocation base
   *  is stashed at [buffer-8] and freed by the dtors. */
  private uniformBuffer: Uint8Array | null;

  /**
   * @Flexo C2 @0x146f760.
   *
   *   0x146f76a  callq HGNode::HGNode()                     ; base ctor
   *   0x146f76f  leaq  0x4bf612(%rip), %rax                 ; RIP -> 0x192ed88 (vtable)
   *   0x146f776  movq  %rax, (%rbx)                         ; install vtable
   *   0x146f779  movl  $0x227, %edi                         ; alloc size = 551
   *   0x146f77e  callq operator new[](551)
   *   0x146f783..0x146f794  32-byte alignment dance (stash raw ptr at [aligned - 8])
   *   0x146f798..0x146f7a0  xorps xmm0 ; movaps 0, +0x08 ; movaps 0, +0x18
   *   0x146f7a5..0x146f7ac  movaps RGB2Y (@0x15895c0), +0x38, +0x28
   *   0x146f7b6..0x146f7c2  movaps RGB2CB (@0x15897d0), +0x58, +0x48
   *   0x146f7c7..0x146f7d3  movaps RGB2CR (@0x15897e0), +0x78, +0x68
   *   0x146f7d8..0x146f7e7  movaps SKIN_LO_HI (@0x1589b20), +0x98, +0x88
   *   0x146f7ef..0x146f7fe  movaps SKIN_STEP (@0x1589b30), +0xb8, +0xa8
   *   0x146f806..0x146f816  movss 0.385 (@0x1589b70) broadcast -> +0xd8, +0xc8
   *   0x146f81e..0x146f82d  movaps ABS_MASK_LANE0 (@0x1589b40), +0xf8, +0xe8
   *   0x146f835..0x146f845  movss 20.0 (@0x1570120) broadcast -> +0x118, +0x108
   *   0x146f84d..0x146f85c  movaps RGB_TAIL_A (@0x1589b50), +0x138, +0x128
   *   0x146f864..0x146f873  movaps ONE_PLUS_HALF_ULP (@0x15890d0), +0x158, +0x148
   *   0x146f87b..0x146f88a  movaps RGB_TAIL_B (@0x1589b60), +0x178, +0x168
   *   0x146f892..0x146f8a1  movaps YUV2RGB_ROW0 (@0x1589800), +0x198, +0x188
   *   0x146f8a9..0x146f8b8  movaps YUV2RGB_ROW1 (@0x1589810), +0x1b8, +0x1a8
   *   0x146f8c0..0x146f8d0  movsd  YUV2RGB_ROW2 (@0x1589820), +0x1d8, +0x1c8
   *   0x146f8d8..0x146f8e7  movaps ALPHA_LANE_MASK (@0x1589170), +0x1f8, +0x1e8
   *   0x146f8ef  movq %rdx, 0x198(%rbx)                     ; this->uniformBuffer = aligned view
   *   0x146f8f6..0x146f903  flags = (flags & ~0x200) | 0x400
   */
  constructor() {
    // @Flexo 0x146f76a — HGNode::HGNode() base ctor.
    super();
    // @Flexo 0x146f776 — install vtable @0x192ed88.
    this.vtable = 0x192ed88;
    // @Flexo 0x146f77e — allocate 0x227 bytes for the uniform buffer.
    const raw = operatorNewArray(0x227);
    // @Flexo 0x146f783..0x146f794 — 32-byte alignment dance: pick a view
    //   whose byteOffset & 31 == 8, and stash the raw base 8 bytes before
    //   the aligned view so operator delete can recover it.
    const aligned = alignedView32Plus8(raw);
    const dv = new DataView(
      aligned.buffer,
      aligned.byteOffset,
      aligned.byteLength,
    );

    // @Flexo 0x146f798..0x146f7a0 — zero the first two vec4 slots
    //   (vibrancyParams @+0x08 and ZERO @+0x18 pair).
    writeVec4F32(dv, 0x08, [0, 0, 0, 0]);
    writeVec4F32(dv, 0x18, [0, 0, 0, 0]);
    // Also zero the "vibrancyParams primary" slot at +0x00 (implicit: the
    //   just-allocated block is zero-init on any faithful allocator; the
    //   movaps stores below assume slot +0x00 stays zero until SetParameter
    //   writes it).
    writeVec4F32(dv, 0x00, [0, 0, 0, 0]);
    writeVec4F32(dv, 0x10, [0, 0, 0, 0]);

    // @Flexo 0x146f7a5..0x146f7ac — RGB2Y at +0x38 then +0x28.
    writeVec4F32(dv, 0x38, RGB2Y_AT_0x15895c0);
    writeVec4F32(dv, 0x28, RGB2Y_AT_0x15895c0);
    // @Flexo 0x146f7b6..0x146f7c2 — RGB2CB at +0x58 then +0x48.
    writeVec4F32(dv, 0x58, RGB2CB_AT_0x15897d0);
    writeVec4F32(dv, 0x48, RGB2CB_AT_0x15897d0);
    // @Flexo 0x146f7c7..0x146f7d3 — RGB2CR at +0x78 then +0x68.
    writeVec4F32(dv, 0x78, RGB2CR_AT_0x15897e0);
    writeVec4F32(dv, 0x68, RGB2CR_AT_0x15897e0);
    // @Flexo 0x146f7d8..0x146f7e7 — SKIN_LO_HI at +0x98 then +0x88.
    writeVec4F32(dv, 0x98, SKIN_LO_HI_AT_0x1589b20);
    writeVec4F32(dv, 0x88, SKIN_LO_HI_AT_0x1589b20);
    // @Flexo 0x146f7ef..0x146f7fe — SKIN_STEP at +0xb8 then +0xa8.
    writeVec4F32(dv, 0xb8, SKIN_STEP_AT_0x1589b30);
    writeVec4F32(dv, 0xa8, SKIN_STEP_AT_0x1589b30);
    // @Flexo 0x146f806..0x146f816 — 0.385 broadcast (movss + movaps).
    //   The movss loads a single lane; the subsequent movaps stores the
    //   full xmm register — which after movss has the top 3 lanes as
    //   ZEROED (movss loads a single-precision scalar and zeros the
    //   upper 96 bits of the destination xmm). So the stored value is
    //   <0.385, 0, 0, 0>, not a broadcast. Model faithfully.
    writeVec4F32(dv, 0xd8, [F_0x385_AT_0x1589b70, 0, 0, 0]);
    writeVec4F32(dv, 0xc8, [F_0x385_AT_0x1589b70, 0, 0, 0]);
    // @Flexo 0x146f81e..0x146f82d — ABS_MASK_LANE0 at +0xf8 then +0xe8.
    writeVec4U32(dv, 0xf8, ABS_MASK_LANE0_AT_0x1589b40_U32);
    writeVec4U32(dv, 0xe8, ABS_MASK_LANE0_AT_0x1589b40_U32);
    // @Flexo 0x146f835..0x146f845 — 20.0 broadcast (same movss-zeroing rule).
    writeVec4F32(dv, 0x118, [F_20_AT_0x1570120, 0, 0, 0]);
    writeVec4F32(dv, 0x108, [F_20_AT_0x1570120, 0, 0, 0]);
    // @Flexo 0x146f84d..0x146f85c — RGB_TAIL_A at +0x138 then +0x128.
    writeVec4F32(dv, 0x138, RGB_TAIL_A_AT_0x1589b50);
    writeVec4F32(dv, 0x128, RGB_TAIL_A_AT_0x1589b50);
    // @Flexo 0x146f864..0x146f873 — ONE_PLUS_HALF_ULP at +0x158 then +0x148.
    writeVec4F32(dv, 0x158, ONE_PLUS_HALF_ULP_AT_0x15890d0);
    writeVec4F32(dv, 0x148, ONE_PLUS_HALF_ULP_AT_0x15890d0);
    // @Flexo 0x146f87b..0x146f88a — RGB_TAIL_B at +0x178 then +0x168.
    writeVec4F32(dv, 0x178, RGB_TAIL_B_AT_0x1589b60);
    writeVec4F32(dv, 0x168, RGB_TAIL_B_AT_0x1589b60);
    // @Flexo 0x146f892..0x146f8a1 — YUV2RGB_ROW0 at +0x198 then +0x188.
    writeVec4F32(dv, 0x198, YUV2RGB_ROW0_AT_0x1589800);
    writeVec4F32(dv, 0x188, YUV2RGB_ROW0_AT_0x1589800);
    // @Flexo 0x146f8a9..0x146f8b8 — YUV2RGB_ROW1 at +0x1b8 then +0x1a8.
    writeVec4F32(dv, 0x1b8, YUV2RGB_ROW1_AT_0x1589810);
    writeVec4F32(dv, 0x1a8, YUV2RGB_ROW1_AT_0x1589810);
    // @Flexo 0x146f8c0..0x146f8d0 — YUV2RGB_ROW2 at +0x1d8 then +0x1c8
    //   (movsd — 8-byte load, upper 8 bytes zeroed).
    writeVec4F32(dv, 0x1d8, YUV2RGB_ROW2_AT_0x1589820);
    writeVec4F32(dv, 0x1c8, YUV2RGB_ROW2_AT_0x1589820);
    // @Flexo 0x146f8d8..0x146f8e7 — ALPHA_LANE_MASK at +0x1f8 then +0x1e8.
    writeVec4U32(dv, 0x1f8, ALPHA_LANE_MASK_AT_0x1589170_U32);
    writeVec4U32(dv, 0x1e8, ALPHA_LANE_MASK_AT_0x1589170_U32);

    // @Flexo 0x146f8ef — this->uniformBuffer = aligned view.
    this.uniformBuffer = aligned;

    // @Flexo 0x146f8f6..0x146f903 — HGNode flags &= ~0x200; flags |= 0x400.
    //   Modelled via HGNode's flags accessor when it lands; recorded here
    //   for provenance.
  }

  /**
   * `HgcVibrancy::SetParameter(int i, float a, float b, float c, float d)`
   * — @Flexo 0x146fa20.
   *
   *   0x146fa20  movl  $0xffffffff, %eax           ; default return = -1
   *   0x146fa25  testl %esi, %esi                  ; i == 0?
   *   0x146fa27  je    0x146fa2a                   ; yes => real path
   *   0x146fa29  retq                              ; i != 0 => return -1
   *   0x146fa2a  movq  0x198(%rdi), %rax           ; load uniformBuffer pointer
   *   0x146fa31  movss (%rax), %xmm4               ; compare vec4 at +0x00 with (a,b,c,d)
   *   0x146fa35  ucomiss %xmm0, %xmm4
   *   0x146fa38  jne  0x146fa60                    ; xmm4 != a => write
   *   0x146fa3a  jp   0x146fa60                    ; NaN? => write
   *   0x146fa3c  movss 0x4(%rax), %xmm4
   *   0x146fa41  ucomiss %xmm1, %xmm4
   *   0x146fa44  jne  0x146fa60
   *   0x146fa46  jp   0x146fa60
   *   0x146fa48  movss 0x8(%rax), %xmm4
   *   0x146fa4d  ucomiss %xmm2, %xmm4
   *   0x146fa50  jne  0x146fa60
   *   0x146fa52  jp   0x146fa60
   *   0x146fa54  movss 0xc(%rax), %xmm4
   *   0x146fa59  ucomiss %xmm3, %xmm4
   *   0x146fa5c  jne  0x146fa60
   *   0x146fa5e  jnp  0x146fa89                    ; all four equal & ordered => return 0
   *   0x146fa64..0x146fa70  insertps to build (a,b,c,d) into xmm0
   *   0x146fa76  movups %xmm0, 0x10(%rax)          ; write to slot +0x10
   *   0x146fa7a  movups %xmm0, (%rax)              ; write to slot +0x00
   *   0x146fa7d  callq HGNode::ClearBits()
   *   0x146fa82  movl  $0x1, %eax                  ; return 1
   *   0x146fa87  retq
   *
   * Return 1 if any of the four values changed, 0 if identical, -1 if i != 0.
   */
  SetParameter(
    i: number,
    a: number,
    b: number,
    c: number,
    d: number,
  ): number {
    // @Flexo 0x146fa25..0x146fa29 — i != 0 => return -1.
    if ((i | 0) !== 0) {
      return -1;
    }
    // @Flexo 0x146fa2a — this.uniformBuffer must be live at this point.
    //   If the constructor threw (frontier operatorNewArray), we can't be
    //   here — but keep a well-typed narrowing for the JS side.
    const buf = this.uniformBuffer;
    if (buf === null) {
      throw new Error(
        "HgcVibrancy::SetParameter reached with null uniformBuffer " +
          "(should be unreachable if ctor @Flexo 0x146f760 ran)",
      );
    }
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const aF = Math.fround(a);
    const bF = Math.fround(b);
    const cF = Math.fround(c);
    const dF = Math.fround(d);
    // @Flexo 0x146fa31..0x146fa5e — compare 4 lanes; if all ordered-equal, return 0.
    const cur0 = dv.getFloat32(0x00, true);
    const cur1 = dv.getFloat32(0x04, true);
    const cur2 = dv.getFloat32(0x08, true);
    const cur3 = dv.getFloat32(0x0c, true);
    const allEqualOrdered =
      cur0 === aF && !Number.isNaN(cur0) && !Number.isNaN(aF) &&
      cur1 === bF && !Number.isNaN(cur1) && !Number.isNaN(bF) &&
      cur2 === cF && !Number.isNaN(cur2) && !Number.isNaN(cF) &&
      cur3 === dF && !Number.isNaN(cur3) && !Number.isNaN(dF);
    if (allEqualOrdered) {
      // @Flexo 0x146fa89 — xor eax,eax; retq.
      return 0;
    }
    // @Flexo 0x146fa64..0x146fa7a — write vec4 to both +0x00 and +0x10.
    writeVec4F32(dv, 0x00, [aF, bF, cF, dF]);
    writeVec4F32(dv, 0x10, [aF, bF, cF, dF]);
    // @Flexo 0x146fa7d — HGNode::ClearBits() (invalidate cached output).
    HGNode_ClearBits(this);
    // @Flexo 0x146fa82 — return 1.
    return 1;
  }

  /**
   * `HgcVibrancy::GetDOD(HGRenderer*, int inputIdx, HGRect r)` — @Flexo 0x146f720.
   * Structurally identical to HGComicGaussianBlurAndGradientGeneration's
   * GetDOD: return HGRectNull if inputIdx != 0, else pass through.
   */
  GetDOD(_renderer: HGRendererPtr, inputIdx: number, r: HGRect): HGRect {
    // @Flexo 0x146f723..0x146f725 — inputIdx != 0 => HGRectNull.
    if ((inputIdx | 0) !== 0) {
      return HGRectNull;
    }
    // @Flexo 0x146f720/0x146f73a — pass-through.
    return r;
  }

  /**
   * `HgcVibrancy::GetROI(HGRenderer*, int inputIdx, HGRect r)` — @Flexo 0x146f740.
   * Byte-identical body to GetDOD above (up to the RIP-relative _HGRectNull
   * displacement — both jumps target the same 16-byte read pattern):
   * return HGRectNull if inputIdx != 0, else pass through.
   */
  GetROI(_renderer: HGRendererPtr, inputIdx: number, r: HGRect): HGRect {
    // @Flexo 0x146f743..0x146f745 — inputIdx != 0 => HGRectNull.
    if ((inputIdx | 0) !== 0) {
      return HGRectNull;
    }
    // @Flexo 0x146f740/0x146f75a — pass-through.
    return r;
  }

  /**
   * `HgcVibrancy::GetOutput(HGRenderer*)` — @Flexo 0x146fad0.
   *
   *   0x146fad4  movq %rdi, %rax           ; return this
   *   0x146fad7  popq %rbp
   *   0x146fad8  retq
   *
   * No parameter forwarding (contrast with HGComicGaussianBlurAndGradientGeneration
   * which forwards 3 slots — HgcVibrancy stores its runtime slider directly
   * in the uniform buffer at +0x00 and uploads it via Bind's vtable[*0x90]
   * call, so GetOutput has nothing to do).
   */
  GetOutput(_renderer: HGRendererPtr): HgcVibrancy {
    // @Flexo 0x146fad4 — return this.
    return this;
  }

  /**
   * `HgcVibrancy::GetProgram(HGRenderer* r)` — @Flexo 0x146ea40.
   *
   *   0x146ea47  movl  $0x60000, %esi
   *   0x146ea4c  callq HGRenderer::GetTarget(0x60000)
   *   0x146ea51  xorl  %ecx, %ecx                                   ; result = NULL
   *   0x146ea53  cmpl  $0x60b10, %eax                               ; target < 0x60b10?
   *   0x146ea58  leaq  METAL_SHADER(%rip), %rax
   *   0x146ea5f  cmoveq %rax, %rcx                                  ; equal? => rcx = rax
   *   0x146ea63  movq  %rcx, %rax
   *   0x146ea67  retq
   *
   * Wait — the sequence is xor rcx,rcx / cmp eax, 0x60b10 / lea metal / cmoveq.
   * cmoveq loads rax into rcx if ZF=1 (equal). The `cmpl` sets ZF=1 iff
   * target == 0x60b10. So the shader is returned ONLY when GetTarget
   * returns EXACTLY 0x60b10; every other value returns null.
   *
   * (This is subtly different from HGComicGaussianBlurAndGradientGeneration
   * which uses `jb` = "below" for a range test. Here it's an exact-equality
   * gate — vibrancy is only wired for one specific Metal target.)
   */
  GetProgram(renderer: HGRendererPtr): string | null {
    // @Flexo 0x146ea4c — probe target.
    const target = HGRenderer_GetTarget(renderer, 0x60000) | 0;
    // @Flexo 0x146ea53..0x146ea5f — exact-equality with 0x60b10.
    if ((target >>> 0) === 0x60b10) {
      return HGC_VIBRANCY_METAL_SHADER;
    }
    return null;
  }

  /**
   * `HgcVibrancy::BindTexture(HGHandler* handler, int slot)` — @Flexo 0x146ecc0.
   *
   *   0x146ecc7  movl  $0xffffffff, %ebx
   *   0x146eccc  testl %edx, %edx                    ; slot == 0?
   *   0x146ecce  jne   0x146ed25                     ; no => return -1
   *   0x146ecd6  xorl  %ebx, %ebx                    ; yes => set return = 0
   *   0x146ecdf  callq *0x48(%rax)                   ; handler->vtable[*0x48](0, 0)
   *   0x146ecec  callq *0x30(%rax)                   ; handler->vtable[*0x30](0, 0)
   *   0x146ecfb  callq HGHandler::TexCoord(0, 0, 0, NULL)
   *   0x146ed00  movq  0x90(%r14), %rdi              ; handler->field_0x90
   *   0x146ed0f  callq *0x80(%rax)                   ; handler.field0x90->vtable[*0x80](0x2e)
   *   0x146ed17  jne   0x146ed25                     ; nonzero => skip GL fallback
   *   0x146ed1f  callq *0xa8(%rax)                   ; this->vtable[*0xa8](handler)
   *   0x146ed25  movl  %ebx, %eax                    ; return
   *   0x146ed2b  retq
   */
  BindTexture(handler: HGHandlerPtr, slot: number): number {
    // @Flexo 0x146eccc..0x146ecce — slot != 0 => return -1.
    if ((slot | 0) !== 0) {
      return -1;
    }
    // @Flexo 0x146ecdf — handler->vtable[*0x48](0, 0).
    HGHandler_vtable_0x48(handler, 0, 0);
    // @Flexo 0x146ecec — handler->vtable[*0x30](0, 0).
    HGHandler_vtable_0x30(handler, 0, 0);
    // @Flexo 0x146ecfb — TexCoord(0, 0, 0, NULL).
    HGHandler_TexCoord(handler, 0, 0, 0, null);
    // @Flexo 0x146ed0f — GL probe via handler.field_0x90->vtable[*0x80](0x2e).
    const glOk = handler_field0x90_vtable_0x80(handler, 0x2e);
    if ((glOk | 0) === 0) {
      // @Flexo 0x146ed1f — GL fallback: this->vtable[*0xa8](handler).
      this_vtable_0xa8(this, handler);
    }
    // @Flexo 0x146ed25 — return 0.
    return 0;
  }

  /**
   * `HgcVibrancy::Bind(HGHandler* handler)` — @Flexo 0x146ed30.
   *
   *   0x146ed3d  movq  0x198(%rdi), %rdx           ; rdx = uniformBuffer
   *   0x146ed44  movq  (%rsi), %rax                ; rax = handler->vtable
   *   0x146ed4a  xorl  %esi, %esi                  ; arg1 = 0
   *   0x146ed4c  movl  $0x1, %ecx                  ; arg3 = 1
   *   0x146ed51  callq *0x90(%rax)                 ; handler->vtable[*0x90](0, uniformBuffer, 1)
   *   0x146ed60  callq *0xc0(%rax)                 ; this->vtable[*0xc0](handler)
   *   0x146ed66  xorl %eax, %eax                   ; return 0
   *   0x146ed6c  retq
   */
  Bind(handler: HGHandlerPtr): number {
    // @Flexo 0x146ed3d..0x146ed51 — upload uniform buffer to shader.
    HGHandler_vtable_0x90(handler, 0, this.uniformBuffer as unknown, 1);
    // @Flexo 0x146ed60 — this->vtable[*0xc0](handler).
    this_vtable_0xc0(this, handler);
    // @Flexo 0x146ed66 — return 0.
    return 0;
  }

  /**
   * `HgcVibrancy::shaderDescription() const` — @Flexo 0x146ec90.
   *
   *   0x146ec94  movq  %rdi, %rax                          ; return out-buffer
   *   0x146ec97  movb  $0x24, (%rdi)                       ; SSO length = 0x24 = (18 << 1) | 0 (short-mode encoding)
   *   0x146ec9a  movups 0x2418fd(%rip), %xmm0              ; = "HgcVibrancy [hgc" (first 16 chars)
   *   0x146eca1  movups %xmm0, 0x1(%rdi)
   *   0x146eca5  movw  $0x5d31, 0x11(%rdi)                 ; "1]"
   *   0x146ecab  movb  $0x0, 0x13(%rdi)                    ; NUL terminator
   *   0x146ecaf  retq
   *
   * Constructs an inline (SSO / "short-string") std::string with contents
   * "HgcVibrancy [hgc1]" (18 chars). The SSO length byte at (%rdi)+0 is
   * `(length << 1) | is_long` = (18 << 1) | 0 = 0x24; chars sit at +0x01..+0x12;
   * a NUL terminator at +0x13.
   */
  shaderDescription(): string {
    // @Flexo 0x146ec97..0x146ecab — literal SSO std::string "HgcVibrancy [hgc1]".
    return "HgcVibrancy [hgc1]";
  }

  /**
   * `HgcVibrancy::InitProgramDescriptor(HGProgramDescriptor*) const` —
   * @Flexo 0x146ea70. A 127-line function that:
   *   (1) SetVisibleShaderWithSource("HgcVibrancy_hgc_visible", <shader-source>)
   *   (2) SetFragmentFunctionName("HgcVibrancy")
   *   (3) SetReturnBinding(HGBinding{kind=4, name="FragmentOut"})
   *   (4) Emplace-back several HGBinding rows into a std::vector for
   *       (float4, float2 uv, float4 hg_Params[0], ...) push-argument slots.
   * The exact binding schema requires the HGBinding struct layout and the
   * SSO string helpers ported first. PARTIAL PORT per PORTING_SPEC Rule 3.
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorPtr): void {
    // @Flexo 0x146ea70 — descriptor init not yet transcribed.
    throw new Error(
      "HgcVibrancy::InitProgramDescriptor not yet transcribed " +
        "(127-line HGBinding table + shader setter cascade @Flexo 0x146ea70..0x146ec8f)",
    );
  }

  /**
   * `HgcVibrancy::RenderTile(HGTile*)` — @Flexo 0x146f1e0. A 295-line
   * SSE-vectorized CPU implementation of the vibrancy fragment shader.
   * See raw-port/re/disasm/Flexo.HgcVibrancy.RenderTile.s.
   */
  RenderTile(_tile: HGTilePtr): void {
    // @Flexo 0x146f1e0 — CPU implementation not yet transcribed.
    throw new Error(
      "HgcVibrancy::RenderTile not yet transcribed " +
        "(295-line SSE CPU impl @Flexo 0x146f1e0..0x146f71f)",
    );
  }

  /**
   * `HgcVibrancy::RenderTile_AVX(HGTile*)` — @Flexo 0x146ed70. A 227-line
   * AVX-vectorized (256-bit) variant of RenderTile. See
   * raw-port/re/disasm/Flexo.HgcVibrancy.RenderTile_AVX.s.
   */
  RenderTile_AVX(_tile: HGTilePtr): void {
    // @Flexo 0x146ed70 — AVX implementation not yet transcribed.
    throw new Error(
      "HgcVibrancy::RenderTile_AVX not yet transcribed " +
        "(227-line AVX CPU impl @Flexo 0x146ed70..0x146f1df)",
    );
  }

  /**
   * `~HgcVibrancy()` (D0 — deleting dtor) @Flexo 0x146f9d0.
   *
   *   0x146f9d9  leaq  0x4bf3a8(%rip), %rax                 ; reinstall vtable
   *   0x146f9e0  movq  %rax, (%rdi)
   *   0x146f9e3  movq  0x198(%rdi), %rax                    ; aligned view
   *   0x146f9ea  testq %rax, %rax
   *   0x146f9ed  je    0x146f9fd                            ; null? skip free
   *   0x146f9ef  movq  -0x8(%rax), %rdi                     ; raw ptr stashed at -8
   *   0x146f9f3  testq %rdi, %rdi
   *   0x146f9f6  je    0x146f9fd                            ; also null? skip
   *   0x146f9f8  callq operator delete(rawPtr)              ; __ZdlPv
   *   0x146fa00  callq HGNode::~HGNode()                    ; base dtor
   *   0x146fa0e  jmp   HGObject::operator delete(this)      ; tail-jmp
   */
  destroyAndDelete(): void {
    // @Flexo 0x146f9d9..0x146f9e0 — reinstall vtable pointer (deleting dtor tag).
    this.vtable = 0x192ed88;
    // @Flexo 0x146f9e3..0x146f9f8 — free the raw allocation if non-null.
    if (this.uniformBuffer !== null) {
      // The raw pointer lived at [aligned_view - 8]; JS GC will handle it
      // once we drop the reference. Fire the operator-delete stub for the
      // frontier trace, then null the field.
      operatorDelete(this.uniformBuffer);
      this.uniformBuffer = null;
    }
    // @Flexo 0x146fa00 — HGNode::~HGNode().
    super.destruct();
    // @Flexo 0x146fa0e — operator delete subsumed by JS GC.
  }
}

// ---------------------------------------------------------------------------
// Helpers — 32-byte-alignment dance and vec4 stores. Same code as the
// HGAVAMotionDilation port; kept here per the one-class-one-file rule.
// ---------------------------------------------------------------------------

/** 32-byte alignment dance @Flexo C2+0x23..+0x34 (@0x146f783..0x146f794):
 *    leaq  0x8(%rax), %rcx
 *    negl  %ecx
 *    andl  $0x1f, %ecx
 *    leaq  (%rcx,%rax), %rdx
 *    addq  $0x8, %rdx
 *    movq  %rax, (%rcx,%rax)
 *  Produces a view whose byteOffset & 31 == 8, with the raw base
 *  stashed 8 bytes before the aligned view. */
function alignedView32Plus8(raw: Uint8Array): Uint8Array {
  const slack = 32;
  const buf = new ArrayBuffer(raw.byteLength + slack);
  new Uint8Array(buf).set(raw);
  let byteOffset = 0;
  while ((byteOffset & 31) !== 8) {
    byteOffset++;
    if (byteOffset >= slack) break;
  }
  return new Uint8Array(buf, byteOffset, raw.byteLength);
}

/** Store `<4 x u32>` little-endian at `off` — models
 *  `movaps %xmm0, <off>(%rcx,%rax)` for u32-lane constants. */
function writeVec4U32(
  dv: DataView,
  off: number,
  v: readonly [number, number, number, number],
): void {
  dv.setUint32(off + 0, v[0] >>> 0, true);
  dv.setUint32(off + 4, v[1] >>> 0, true);
  dv.setUint32(off + 8, v[2] >>> 0, true);
  dv.setUint32(off + 12, v[3] >>> 0, true);
}

/** Store `<4 x f32>` little-endian at `off` — models
 *  `movaps %xmm0, <off>(%rcx,%rax)` for f32-lane constants. */
function writeVec4F32(
  dv: DataView,
  off: number,
  v: readonly [number, number, number, number],
): void {
  dv.setFloat32(off + 0, Math.fround(v[0]), true);
  dv.setFloat32(off + 4, Math.fround(v[1]), true);
  dv.setFloat32(off + 8, Math.fround(v[2]), true);
  dv.setFloat32(off + 12, Math.fround(v[3]), true);
}

// Re-export HGObject for reviewer traceability (HGNode -> HGObject chain).
export type { HGObject };
