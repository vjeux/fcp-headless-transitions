// raw-port/src/render/HGComicGaussianBlurAndGradientGeneration.ts
//
// FCP `HGComicGaussianBlurAndGradientGeneration` — Helium render-graph
// node. A single-axis separable Gaussian blur that additionally emits
// two gradient channels (cos(alfa), sin(alfa)) from the blurred image's
// blue/green/red deltas. Used inside the "Comic" stylize pipeline as
// one leg of the two-pass horizontal/vertical blur that feeds the edge/
// stroke generator.
//
// One instance renders ONE axis (horizontal OR vertical, selected by the
// `axis` parameter). The class holds four f32 parameters at +0x198:
//
//     +0x198  sigma            — Gaussian sigma (loop runs i in [1..2*sigma])
//     +0x19c  axis             — 1.0 => horizontal, else => vertical
//     +0x1a0  paramSideB       — second scalar; feeds SetParameter(1,a,b,...)
//     +0x1a4  alphaPassthrough — 0.0 or 1.0 (mask-compared through cmpeqss)
//
// GetProgram inspects +0x19c only; +0x1a0 is written by SetParameter(1,...)
// as the second float and forwarded to HGNode::SetParameter(1, +0x19c,
// +0x1a0, 0, 0) inside GetOutput. The shader itself declares three
// uniforms:
//     hg_ProgramLocal0.x = sigma
//     hg_ProgramLocal1.x = axis
//     hg_ProgramLocal2.x = alphaPassthrough
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// (fat slice x86_64 at file offset 0x4000; disassembly captured via
//  raw-port/tools/disasm.sh):
//
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.HGComicGaussianBlurAndGradientGeneration.s (17 lines)
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.~HGComicGaussianBlurAndGradientGeneration.s (13 lines)
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.SetParameter.s        (49 lines)
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.GetDOD.s              (13 lines)
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.GetROI.s              (67 lines)
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.IntermediateFormat.s  (7 lines)
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.RenderTile.s          (409 lines) [large SSE CPU impl — stubbed]
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.GetOutput.s           (32 lines)
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.GetProgram.s          (39 lines)
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.BindTexture.s         (33 lines)
//   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.InitProgramDescriptor.s (6 lines)
//
// FOURTEEN exported symbols owned by this class (Helium.ledger.json):
//   @Helium 0x1b2df0  C2 (base-subobject ctor)
//   @Helium 0x1b2e30  C1 (complete-object ctor — identical body to C2)
//   @Helium 0x1b2e70  D2 (base-subobject dtor)
//   @Helium 0x1b2e80  D1 (complete-object dtor — identical body to D2)
//   @Helium 0x1b2e90  D0 (deleting dtor — D2 + tail-jmp HGObject::operator delete)
//   @Helium 0x1b2eb0  SetParameter(int, float, float, float, float)
//   @Helium 0x1b2f60  GetDOD(HGRenderer*, int, HGRect)
//   @Helium 0x1b2f80  GetROI(HGRenderer*, int, HGRect)
//   @Helium 0x1b3070  IntermediateFormat(HGFormat) const  -> returns 0x18
//   @Helium 0x1b3080  RenderTile(HGTile*)       [SSE CPU impl — large; stubbed with @0xADDR]
//   @Helium 0x1b37a0  GetOutput(HGRenderer*)
//   @Helium 0x1b3810  GetProgram(HGRenderer*)
//   @Helium 0x1b38a0  BindTexture(HGHandler*, int)
//   @Helium 0x1b38f0  InitProgramDescriptor(HGProgramDescriptor*) const  -> empty body
//
// Vtable @Helium 0xa26ef0 (RTTI header @0xa26ee0). Overrides vs HGNode:
//   *0x00, *0x08  ~C1/D0  (0x1b2e80 / 0x1b2e90)
//   *0x60         SetParameter                      -> 0x1b2eb0
//   *0xb0         RenderTile                        -> 0x1b3080
//   *0xb8         GetProgram                        -> 0x1b3810
//   *0xd0         BindTexture                       -> 0x1b38a0
// All other slots inherit HGNode's implementations (see HGNode.ts).
//
// STRUCT LAYOUT (recovered from C1 @0x1b2e30 + SetParameter @0x1b2eb0 field-by-field):
//   ---- HGObject (0x00..0x10) ----                inherited
//   ---- HGNode   (0x10..0x198) ----               inherited (see HGNode.ts)
//     +0x11        u8 flags-byte — ctor `orb $0x6, 0x11(%rbx)` @C1+0x27 sets bits 1|2.
//   ---- HGComicGaussianBlurAndGradientGeneration fields ----
//     +0x198 : f32  sigma            (init 1.0f — from movsd @C1+0x18 loading <1.0,1.0> to +0x198/+0x19c)
//     +0x19c : f32  axis             (init 1.0f — upper half of same movsd)
//     +0x1a0 : f32  paramSideB       (init 0.0f — from movsd zeroing upper 64b, movups writes it to +0x1a0)
//     +0x1a4 : f32  alphaPassthrough (init 0.0f — from same movups)
//
// DECODE: `movsd 0x217260(%rip), %xmm0` @C1+0x18 (@0x1b2e48) targets VA
//   0x3ca0b0 (recomputed from raw instruction bytes: F2 0F 10 05 60 72 21 00,
//   next_rip 0x1b2e50 + 0x217260 = 0x3ca0b0). Section __TEXT/__const.
//   File offset = 0x4000 (fat x86_64 slice) + 0x3ca0b0 = 0x3ce0b0. Bytes:
//     00 00 80 3f  00 00 80 3f  00 00 00 00  00 00 00 00
//   = <1.0f, 1.0f, 0.0f, 0.0f>. movsd loads low 8 bytes = <1.0, 1.0>
//   and zeroes upper 8 bytes of xmm0, so the movups to +0x198 stores
//   <1.0, 1.0, 0.0, 0.0>. Verified by direct binary read.
//
// DECODE: every ucomiss/cmpeqss in this class (SetParameter, GetROI,
//   GetProgram, RenderTile) targets the shared @Helium 0x3c7cc0 __const
//   block. First 16 bytes: 00 00 80 3f  00 00 c0 40  00 00 00 3f  00 00 00 bf
//   = <1.0f, 6.0f, 0.5f, -0.5f>. Every 4-byte load in these methods reads
//   `1.0f` (the first slot). Verified by direct binary read.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (each stub throws with the exact call-site @0xADDR):
//   HGNode::HGNode()                                 @Helium 0x1b2e39 (C1)
//   HGNode::~HGNode()                                @Helium 0x1b2e75 (D2 tail-jmp),
//                                                     0x1b2e99 (D0)
//   HGObject::operator delete(void*)                 @Helium 0x1b2ea7 (D0 tail-jmp)
//   HGRect::Init(int, int, int, int)                 @Helium 0x1b300a (GetROI)
//   HGNode::SetParameter(int,float,float,float,float) @Helium 0x1b37bc / 0x1b37df / 0x1b37fd (GetOutput)
//   HGTile::Renderer() const                         @Helium 0x1b30e6 (RenderTile)
//   this->vtable[*0x138] GetFilter(HGRenderer*)      @Helium 0x1b30f4 (RenderTile)
//   HGRenderer::GetTarget(unsigned int)              @Helium 0x1b3825 (GetProgram)
//   HGRenderer.vtable[*0x80] (arg=0x2e)              @Helium 0x1b385b (GetProgram)
//   HGHandler::TexCoord(int,int,int,double const*)   @Helium 0x1b38b8 (BindTexture)
//   HGHandler.vtable[*0x48] (arg=slot, 0)            @Helium 0x1b38c7 (BindTexture)
//   HGHandler.vtable[*0x38] (arg=0)                  @Helium 0x1b38d2 (BindTexture)
//   HGHandler.vtable[*0x30] (arg=1, 1)               @Helium 0x1b38e5 (BindTexture)

import { HGObject } from "./HGObject.js";
import { HGNode } from "./HGNode.js";
import { HGRect, HGRectNull, HGRectGrow, HGRectMake4i } from "./HGRect.js";

/** Opaque handle for Helium's `HGRenderer*` render-graph context. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };
/** Opaque handle for Helium's `HGTile*` (the tile being rendered). */
export type HGTilePtr = { readonly __brand: "HGTile" };
/** Opaque handle for Helium's `HGHandler*` (render-state binder). */
export type HGHandlerPtr = { readonly __brand: "HGHandler" };
/** Opaque handle for Helium's `HGProgramDescriptor*`. */
export type HGProgramDescriptorPtr = { readonly __brand: "HGProgramDescriptor" };
/** HGFormat enum value (unsigned char, see HGFormat.h). Passed by value. */
export type HGFormat = number;

// ---------------------------------------------------------------------------
// DECODED __const constants (byte-verified against Helium x86_64 slice).
// ---------------------------------------------------------------------------

/** @Helium __const @0x3c7cc0 — the shared "gaussian blur" constants block.
 *  First 16 bytes: `<1.0f, 6.0f, 0.5f, -0.5f>`. Every RIP-relative
 *  ucomiss/cmpeqss/movss in this class loads its LOW 4 bytes = 1.0f. */
const ONE_F32_AT_0x3c7cc0: number = Math.fround(1.0);

/** @Helium __const @0x3ca0b0 — ctor initializer block.
 *  Bytes: 00 00 80 3f  00 00 80 3f  00 00 00 00  00 00 00 00
 *  = <1.0f, 1.0f, 0.0f, 0.0f>. Loaded via `movsd` (low 8 bytes only)
 *  then stored to `this+0x198` via `movups %xmm0` (writes full 16
 *  bytes, upper half is the zeroed upper-half of the movsd result). */
const CTOR_INIT_AT_0x3ca0b0: readonly [number, number, number, number] = [
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(0.0),
  Math.fround(0.0),
];

// ---------------------------------------------------------------------------
// Frontier callees (each stub throws citing its call-site @0xADDR).
// ---------------------------------------------------------------------------

/** HGRect::Init(int,int,int,int) — frontier callee @Helium 0x1b300a
 *  (GetROI). Fills a stack-allocated HGRect(x,y,right,bottom). */
function HGRect_Init(_x: number, _y: number, _right: number, _bottom: number): HGRect {
  throw new Error(
    "HGRect::Init(int,int,int,int) not yet transcribed " +
      "(frontier callee @Helium 0x1b300a in HGComicGaussianBlurAndGradientGeneration::GetROI)",
  );
}

/** HGNode::SetParameter(int, float, float, float, float) — frontier
 *  callee at three call-sites in GetOutput:
 *    @Helium 0x1b37bc  (i=0)
 *    @Helium 0x1b37df  (i=1)
 *    @Helium 0x1b37fd  (i=2)
 *  GetOutput forwards this class's stored params to the base HGNode via
 *  three direct callq's; the base implementation lives at HGNode+0x11cab0. */
function HGNode_SetParameter(
  _self: HGComicGaussianBlurAndGradientGeneration,
  _i: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  throw new Error(
    "HGNode::SetParameter(int,float,float,float,float) not yet transcribed " +
      "(frontier callees @Helium 0x1b37bc / 0x1b37df / 0x1b37fd in " +
      "HGComicGaussianBlurAndGradientGeneration::GetOutput)",
  );
}

/** HGTile::Renderer() const — frontier callee @Helium 0x1b30e6 (RenderTile). */
function HGTile_Renderer(_tile: HGTilePtr): HGRendererPtr {
  throw new Error(
    "HGTile::Renderer() const not yet transcribed " +
      "(frontier callee @Helium 0x1b30e6 in HGComicGaussianBlurAndGradientGeneration::RenderTile)",
  );
}

/** this->vtable[*0x138] GetFilter(HGRenderer*) — dispatched off `this`.
 *  Per resolve.py the slot resolves to HGNode::GetFilter(HGRenderer*) @0x121f20.
 *  Frontier callee @Helium 0x1b30f4 (RenderTile). */
function this_vtable_0x138_GetFilter(
  _self: HGComicGaussianBlurAndGradientGeneration,
  _renderer: HGRendererPtr,
): number {
  throw new Error(
    "HGNode::GetFilter(HGRenderer*) (this-vtable slot *0x138) not yet transcribed " +
      "(frontier callee @Helium 0x1b30f4 in HGComicGaussianBlurAndGradientGeneration::RenderTile)",
  );
}

/** HGRenderer::GetTarget(unsigned int) — frontier callee @Helium 0x1b3825
 *  (GetProgram). Called with arg=0x60000. */
function HGRenderer_GetTarget(_renderer: HGRendererPtr, _arg: number): number {
  throw new Error(
    "HGRenderer::GetTarget(unsigned int) not yet transcribed " +
      "(frontier callee @Helium 0x1b3825 in HGComicGaussianBlurAndGradientGeneration::GetProgram)",
  );
}

/** renderer->vtable[*0x80](0x2e) — probe called when GetTarget returned
 *  >= 0x60b10. Frontier callee @Helium 0x1b385b. */
function renderer_vtable_0x80(_renderer: HGRendererPtr, _arg: number): number {
  throw new Error(
    "HGRenderer::vtable[*0x80] not yet transcribed " +
      "(frontier callee @Helium 0x1b385b in HGComicGaussianBlurAndGradientGeneration::GetProgram)",
  );
}

/** HGHandler::TexCoord(int, int, int, double const*) — frontier callee
 *  @Helium 0x1b38b8 (BindTexture). Called with (slot, 0, 0, NULL). */
function HGHandler_TexCoord(
  _h: HGHandlerPtr,
  _slot: number,
  _b: number,
  _c: number,
  _d: unknown,
): void {
  throw new Error(
    "HGHandler::TexCoord(int,int,int,double const*) not yet transcribed " +
      "(frontier callee @Helium 0x1b38b8 in HGComicGaussianBlurAndGradientGeneration::BindTexture)",
  );
}

/** HGHandler->vtable[*0x48] — frontier callee @Helium 0x1b38c7 (BindTexture). */
function HGHandler_vtable_0x48(_h: HGHandlerPtr, _slot: number, _b: number): void {
  throw new Error(
    "HGHandler->vtable[*0x48] not yet transcribed " +
      "(frontier callee @Helium 0x1b38c7 in HGComicGaussianBlurAndGradientGeneration::BindTexture)",
  );
}

/** HGHandler->vtable[*0x38] — frontier callee @Helium 0x1b38d2 (BindTexture). */
function HGHandler_vtable_0x38(_h: HGHandlerPtr, _a: number): void {
  throw new Error(
    "HGHandler->vtable[*0x38] not yet transcribed " +
      "(frontier callee @Helium 0x1b38d2 in HGComicGaussianBlurAndGradientGeneration::BindTexture)",
  );
}

/** HGHandler->vtable[*0x30] — frontier callee @Helium 0x1b38e5 (BindTexture). */
function HGHandler_vtable_0x30(_h: HGHandlerPtr, _a: number, _b: number): void {
  throw new Error(
    "HGHandler->vtable[*0x30] not yet transcribed " +
      "(frontier callee @Helium 0x1b38e5 in HGComicGaussianBlurAndGradientGeneration::BindTexture)",
  );
}

// ---------------------------------------------------------------------------
// Fragment-shader source strings — literal pools embedded in GetProgram.
// The pool addresses come from the two pairs of `leaq <disp>(%rip)` in
// GetProgram (Metal 1.0 pair @Helium 0x1b3840/0x1b3847; GLfs 1.0 pair
// @0x1b3874/0x1b387b).
// ---------------------------------------------------------------------------

/** @Helium __cstring literal pool referenced by `leaq 0x73e7c6(%rip)`
 *  @GetProgram+0x30 (@0x1b3840). Vertical Gaussian (Metal 1.0):
 *  loops i in [1..sigmax2], samples (u, y+i) and (u, y-i). Also generates
 *  gradient channels from acc.z, acc.y, acc.x via atan2. */
export const METAL_VERTICAL_SHADER: string =
  "//Metal1.0     \n//LEN=0000000792\n" +
  "// vertical Gaussian blur + gradient generation (from Helium __cstring pool\n" +
  "// referenced by leaq 0x73e7c6(%rip) @Helium 0x1b3840; full body preserved\n" +
  "// in the binary's __cstring section)\n";

/** @Helium __cstring literal pool referenced by `leaq 0x73e10b(%rip)`
 *  @GetProgram+0x37 (@0x1b3847). Horizontal Gaussian (Metal 1.0):
 *  loops i in [1..sigmax2], samples (x+i, v) and (x-i, v). Does NOT
 *  generate gradient channels — only blurs. */
export const METAL_HORIZONTAL_SHADER: string =
  "//Metal1.0     \n//LEN=00000006b3\n" +
  "// horizontal Gaussian blur (from Helium __cstring pool\n" +
  "// referenced by leaq 0x73e10b(%rip) @Helium 0x1b3847)\n";

/** @Helium __cstring literal pool referenced by `leaq 0x73f570(%rip)`
 *  @GetProgram+0x64 (@0x1b3874). GLfs 1.0 vertical Gaussian variant. */
export const GL_VERTICAL_SHADER: string =
  "//GLfs1.0      \n//LEN=0000000743\n" +
  "// (vertical-gaussian-with-gradients GLfs shader — full source in\n" +
  "//  Helium __cstring pool referenced by leaq 0x73f570(%rip) @Helium 0x1b3874)\n";

/** @Helium __cstring literal pool referenced by `leaq 0x73ef1e(%rip)`
 *  @GetProgram+0x6b (@0x1b387b). GLfs 1.0 horizontal Gaussian variant. */
export const GL_HORIZONTAL_SHADER: string =
  "//GLfs1.0      \n//LEN=0000000632\n" +
  "// (horizontal-gaussian GLfs shader — full source in\n" +
  "//  Helium __cstring pool referenced by leaq 0x73ef1e(%rip) @Helium 0x1b387b)\n";

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

/**
 * `HGComicGaussianBlurAndGradientGeneration` — Helium separable Gaussian
 * blur + gradient-generation node.
 *
 * See file header for full layout, vtable, and decode citations.
 * Vtable @Helium 0xa26ef0.
 */
export class HGComicGaussianBlurAndGradientGeneration extends HGNode {
  /** +0x198 — Gaussian sigma. Init 1.0f @C1+0x18. */
  sigma: number;

  /** +0x19c — axis selector. Init 1.0f. Read by GetProgram (`ucomiss` vs
   *  1.0) to choose horizontal (== 1.0) vs vertical (!= 1.0) shader; also
   *  read by GetROI to choose which axis to Grow along. */
  axis: number;

  /** +0x1a0 — second-side scalar. Init 0.0f. Written by SetParameter(1,...)
   *  as the SECOND float arg (xmm1). Forwarded to HGNode::SetParameter with
   *  the shape `(1, +0x19c, +0x1a0, 0, 0)` in GetOutput. */
  paramSideB: number;

  /** +0x1a4 — alphaPassthrough (masked through `cmpeqss 1.0` in
   *  SetParameter i==2 branch). Init 0.0f. */
  alphaPassthrough: number;

  /**
   * @Helium C2 @0x1b2df0 / C1 @0x1b2e30 (both bodies byte-identical).
   *
   *   0x1b2e39  callq HGNode::HGNode()                     ; base ctor
   *   0x1b2e3e  leaq  0x8740ab(%rip), %rax                 ; RIP-> 0xa26ef0
   *   0x1b2e45  movq  %rax, (%rbx)                         ; install vtable
   *   0x1b2e48  movsd 0x217260(%rip), %xmm0                ; xmm0 = <1.0,1.0,0,0>
   *   0x1b2e50  movups %xmm0, 0x198(%rbx)                  ; store 4x f32 to +0x198
   *   0x1b2e57  orb   $0x6, 0x11(%rbx)                     ; flags |= 0x6
   */
  constructor() {
    // @Helium 0x1b2e39 — HGNode base ctor.
    super();
    // @Helium 0x1b2e45 — install "vtable for HGComicGaussianBlurAndGradientGeneration"
    //   at Helium __const 0xa26ef0.
    this.vtable = 0xa26ef0;
    // @Helium 0x1b2e48..0x1b2e50 — 16-byte store initialized from a
    //   movsd(8-byte-load-and-zero-upper).
    this.sigma = CTOR_INIT_AT_0x3ca0b0[0];
    this.axis = CTOR_INIT_AT_0x3ca0b0[1];
    this.paramSideB = CTOR_INIT_AT_0x3ca0b0[2];
    this.alphaPassthrough = CTOR_INIT_AT_0x3ca0b0[3];
    // @Helium 0x1b2e57 — HGNode+0x11 flags-byte |= 0x6. Modelled as a
    //   documented no-op — see HGNode.ts for the flags-byte layout;
    //   this write is recorded here for provenance.
  }

  /**
   * `HGComicGaussianBlurAndGradientGeneration::SetParameter(int i,
   *   float a, float b, float c, float d)` — @Helium 0x1b2eb0.
   *
   * Three real branches: i==0, i==1, i==2. All other i => return -1.
   *
   *   0x1b2eb0  cmpl $0x2, %esi
   *   0x1b2eb3  je   0x1b2efd            ; i == 2 => path C
   *   0x1b2eb5  cmpl $0x1, %esi
   *   0x1b2eb8  je   0x1b2ee0            ; i == 1 => path B
   *   0x1b2eba  movl $0xffffffff, %eax   ; default return = -1
   *   0x1b2ebf  testl %esi, %esi
   *   0x1b2ec1  jne  0x1b2edf            ; i != 0 => return -1
   *   -- path A (i == 0) --
   *   0x1b2ec3  ucomiss 0x198(%rdi), %xmm0
   *   0x1b2eca  jne  0x1b2ed2            ; if a != sigma => write
   *   0x1b2ecc  jnp  0x1b2f53            ; ordered & equal => return 0 (no change)
   *   0x1b2ed2  movss %xmm0, 0x198(%rdi)
   *   0x1b2eda  movl  $0x1, %eax
   *   0x1b2edf  retq
   *
   *   -- path B (i == 1) --
   *   0x1b2ee0  ucomiss 0x19c(%rdi), %xmm0
   *   0x1b2ee7  jne  0x1b2eeb            ; a != axis => write
   *   0x1b2ee9  jnp  0x1b2f2f            ; ordered & equal => go recheck b vs paramSideB
   *   0x1b2eeb  movss %xmm0, 0x19c(%rdi)  ; axis = a
   *   0x1b2ef3  movss 0x1a0(%rdi), %xmm0  ; xmm0 = paramSideB
   *   0x1b2efb  jmp   0x1b2f3e            ; enter write-paramSideB-if-changed tail
   *
   *   -- path C (i == 2) --
   *   0x1b2f01  movss  0x214db7(%rip), %xmm1   ; xmm1 = 1.0f (RIP -> 0x3c7cc0)
   *   0x1b2f09  cmpeqss %xmm1, %xmm0           ; xmm0 = (a == 1.0f) ? all-ones : 0
   *   0x1b2f0e  andps   %xmm1, %xmm0           ; xmm0 = (a == 1.0f) ? 1.0f : 0.0f
   *   0x1b2f11  movss   0x1a4(%rdi), %xmm1     ; xmm1 = alphaPassthrough
   *   0x1b2f19  ucomiss %xmm0, %xmm1
   *   0x1b2f1c  jne  0x1b2f20                  ; different => write
   *   0x1b2f1e  jnp  0x1b2f56                  ; ordered & equal => return 0
   *   0x1b2f20  movss %xmm0, 0x1a4(%rdi)
   *   0x1b2f28  movl  $0x1, %eax
   *   0x1b2f2e  retq
   *
   *   -- fallthrough for path B "b vs paramSideB" (0x1b2f2f..0x1b2f52) --
   *   0x1b2f2f  movss 0x1a0(%rdi), %xmm0   ; xmm0 = paramSideB
   *   0x1b2f37  ucomiss %xmm0, %xmm1       ; compare vs b (which is in xmm1 on entry)
   *   0x1b2f3a  jne  0x1b2f3e
   *   0x1b2f3c  jnp  0x1b2f53              ; ordered & equal => return 0
   *   0x1b2f3e  movl  $0x1, %eax
   *   0x1b2f43  ucomiss %xmm0, %xmm1
   *   0x1b2f46  jne  0x1b2f4a
   *   0x1b2f48  jnp  0x1b2edf              ; ordered & equal => return 1 (no write)
   *   0x1b2f4a  movss %xmm1, 0x1a0(%rdi)   ; paramSideB = b
   *   0x1b2f52  retq
   *
   * The return value encodes whether ANY field changed: 1 if written,
   * 0 if input matched the stored value, -1 (0xFFFFFFFF) if i is out
   * of the {0,1,2} set.
   */
  SetParameter(
    i: number,
    a: number,
    b: number,
    _c: number,
    _d: number,
  ): number {
    // Single-precision inputs — round to f32 to match ucomiss semantics.
    const aF = Math.fround(a);
    const bF = Math.fround(b);
    // @Helium 0x1b2eb0..0x1b2ec1 — dispatch on i.
    if ((i | 0) === 2) {
      // ---- path C (i == 2): alphaPassthrough = (a == 1.0f) ? 1.0f : 0.0f ----
      // @Helium 0x1b2f01..0x1b2f0e — cmpeqss+andps produces 0.0 or 1.0.
      //   NaN inputs never compare equal, so the result is 0.0f in that
      //   case (matches cmpeqss unordered => zero-mask semantics).
      const masked = aF === ONE_F32_AT_0x3c7cc0 ? Math.fround(1.0) : Math.fround(0.0);
      // @Helium 0x1b2f11..0x1b2f1e — if alphaPassthrough already matches, return 0.
      const cur = Math.fround(this.alphaPassthrough);
      if (cur === masked && !Number.isNaN(cur) && !Number.isNaN(masked)) {
        return 0;
      }
      // @Helium 0x1b2f20..0x1b2f28 — write and return 1.
      this.alphaPassthrough = masked;
      return 1;
    }
    if ((i | 0) === 1) {
      // ---- path B (i == 1): sets axis (via a) and paramSideB (via b). ----
      // @Helium 0x1b2ee0..0x1b2ee9 — if aF != current axis, write axis.
      const curAxis = Math.fround(this.axis);
      let wroteAxis = false;
      if (aF !== curAxis || Number.isNaN(aF) || Number.isNaN(curAxis)) {
        // @Helium 0x1b2eeb — axis = a.
        this.axis = aF;
        wroteAxis = true;
      }
      // Regardless of axis-write, fall through into the "b vs paramSideB" tail:
      // @Helium 0x1b2f2f..0x1b2f52 — if bF != current paramSideB, write it.
      const curPB = Math.fround(this.paramSideB);
      if (bF !== curPB || Number.isNaN(bF) || Number.isNaN(curPB)) {
        // @Helium 0x1b2f4a — paramSideB = b.
        this.paramSideB = bF;
        return 1;
      }
      // paramSideB unchanged. Return 1 if we wrote axis (path B tail loops
      // back through movl-$1 @0x1b2f3e when axis was written), else 0.
      return wroteAxis ? 1 : 0;
    }
    // @Helium 0x1b2eba..0x1b2ec1 — default: eax = -1, jne 0x1b2edf if i != 0.
    if ((i | 0) !== 0) {
      // @Helium 0x1b2edf — return -1 (as int32 stored in eax = 0xFFFFFFFF).
      return -1;
    }
    // ---- path A (i == 0): sigma = a ----
    // @Helium 0x1b2ec3..0x1b2ecc — if aF == current sigma (ordered), return 0.
    const curSigma = Math.fround(this.sigma);
    if (aF === curSigma && !Number.isNaN(aF) && !Number.isNaN(curSigma)) {
      // @Helium 0x1b2f53 — xor eax,eax; retq.
      return 0;
    }
    // @Helium 0x1b2ed2..0x1b2eda — write sigma, return 1.
    this.sigma = aF;
    return 1;
  }

  /**
   * `HGComicGaussianBlurAndGradientGeneration::GetDOD(HGRenderer*, int inputIdx, HGRect r)`
   * — @Helium 0x1b2f60. Returns HGRectNull for any inputIdx != 0, else
   * returns the input rect unchanged.
   *
   *   0x1b2f60  movq  %rcx, %rax                ; return.lo = r.lo
   *   0x1b2f63  testl %edx, %edx                ; inputIdx == 0?
   *   0x1b2f65  je    0x1b2f7a                  ; yes => tail
   *   0x1b2f6b  leaq  _HGRectNull(%rip), %rcx
   *   0x1b2f72  movq  (%rcx), %rax              ; return.lo = HGRectNull.lo
   *   0x1b2f75  movq  0x8(%rcx), %r8            ; return.hi = HGRectNull.hi
   *   0x1b2f7a  movq  %r8, %rdx                 ; return.hi = r.hi
   *   0x1b2f7d  retq
   */
  GetDOD(_renderer: HGRendererPtr, inputIdx: number, r: HGRect): HGRect {
    // @Helium 0x1b2f63..0x1b2f65 — inputIdx != 0 => HGRectNull.
    if ((inputIdx | 0) !== 0) {
      return HGRectNull;
    }
    // @Helium 0x1b2f60/0x1b2f7a — pass-through.
    return r;
  }

  /**
   * `HGComicGaussianBlurAndGradientGeneration::GetROI(HGRenderer*, int inputIdx, HGRect r)`
   * — @Helium 0x1b2f80.
   *
   *   0x1b2f8b  testl %edx, %edx                    ; inputIdx == 0?
   *   0x1b2f8d  je    0x1b2fa2                      ; yes => real path
   *   0x1b2f8f  leaq  _HGRectNull(%rip), %rax       ; else return HGRectNull
   *   0x1b2fa2  movss  0x198(%rdi), %xmm0           ; xmm0 = sigma
   *   0x1b2faa  addss  %xmm0, %xmm0                 ; xmm0 = 2*sigma
   *   0x1b2fae  roundss $0xa, %xmm0, %xmm0          ; ceil (imm8=0xa)
   *   0x1b2fb4  cvttss2si %xmm0, %eax               ; n = int(ceil(2*sigma))
   *   0x1b2fb8  movss  0x19c(%rdi), %xmm0           ; xmm0 = axis
   *   0x1b2fc0  ucomiss 0x214cf9(%rip), %xmm0       ; xmm0 vs 1.0f (@0x3c7cc0)
   *   0x1b2fc7  jne  0x1b2fe2                       ; axis != 1.0? => try +0x1a0 branch
   *   0x1b2fc9  jp   0x1b2fe2                       ; NaN? => try +0x1a0 branch
   *   0x1b2fcb..0x1b3007  growRect setup for one of two branches
   *   0x1b300a  callq HGRect::Init(int, int, int, int)   ; @0x1b300a
   *   0x1b3015  result_rect = r  (before any Grow)
   *   0x1b3029  callq HGRect::Grow(&result_rect, growRect)
   *   0x1b3045  callq _HGRectMake4i(-1, -1, 1, 1)
   *   0x1b3050  callq HGRect::Grow(&result_rect, that)
   *   0x1b3055  return result_rect
   *
   * For input 0, the ROI is `r` grown by `[-n,0,n,0]` (if axis==1.0) OR
   * `[0,-n,0,n]` (if paramSideB==1.0) OR unchanged, and then always
   * grown by `[-1,-1,1,1]` (edge-padding to keep bilinear taps in-bounds).
   */
  GetROI(_renderer: HGRendererPtr, inputIdx: number, r: HGRect): HGRect {
    // @Helium 0x1b2f8b..0x1b2f9d — non-zero input slot returns HGRectNull.
    if ((inputIdx | 0) !== 0) {
      return HGRectNull;
    }
    // @Helium 0x1b2fa2..0x1b2fb4 — n = (int)ceil(2*sigma).
    const twoSigma = Math.fround(Math.fround(this.sigma) + Math.fround(this.sigma));
    //   roundss imm=0xa is "round toward +inf, suppress exceptions" =
    //   equivalent to Math.ceil for finite inputs. cvttss2si truncates
    //   toward zero — for a value already rounded up to an integer, both
    //   are identical; for NaN, cvttss2si returns 0x80000000 (INT_MIN).
    const ceiled = Math.fround(Math.ceil(twoSigma));
    const n = Number.isFinite(ceiled) ? Math.trunc(ceiled) | 0 : -0x80000000;

    // @Helium 0x1b2fb8..0x1b2fe0 — axis == 1.0f? => growRect = (-n, 0, n, 0)
    const axisF = Math.fround(this.axis);
    let result: HGRect = { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    if (axisF === ONE_F32_AT_0x3c7cc0) {
      const growA = HGRect_Init(-n | 0, 0, n | 0, 0);
      // @Helium 0x1b3029 — Grow r by growA.
      result = HGRectGrow(result, growA);
    } else {
      // @Helium 0x1b2fe2..0x1b3007 — try paramSideB == 1.0f branch:
      //   growRect = (0, -n, 0, n)
      const pbF = Math.fround(this.paramSideB);
      if (pbF === ONE_F32_AT_0x3c7cc0) {
        const growB = HGRect_Init(0, -n | 0, 0, n | 0);
        result = HGRectGrow(result, growB);
      }
      // else: skip the first Grow entirely.
    }

    // @Helium 0x1b3031..0x1b3050 — always Grow by HGRectMake4i(-1,-1,1,1).
    const pad1 = HGRectMake4i(-1, -1, 1, 1);
    return HGRectGrow(result, pad1);
  }

  /**
   * `HGComicGaussianBlurAndGradientGeneration::IntermediateFormat(HGFormat) const`
   * — @Helium 0x1b3070. Returns the constant 0x18.
   *
   *   0x1b3074  movl $0x18, %eax
   *   0x1b307a  retq
   *
   * The argument (an HGFormat) is completely ignored. 0x18 (decimal 24) is
   * the HGFormat enumerant for the intermediate blur-buffer format used by
   * this pass.
   */
  IntermediateFormat(_fmt: HGFormat): number {
    // @Helium 0x1b3074 — return 0x18.
    return 0x18;
  }

  /**
   * `HGComicGaussianBlurAndGradientGeneration::RenderTile(HGTile*)` —
   * @Helium 0x1b3080. A 409-line SSE-vectorized CPU implementation of
   * the same shader body encoded in METAL_VERTICAL/HORIZONTAL_SHADER
   * (single-axis Gaussian blur + gradient-generation). Full disasm at
   *   raw-port/re/disasm/Helium.HGComicGaussianBlurAndGradientGeneration.RenderTile.s
   *
   * The function structure (recovered from disasm; NOT transcribed — a
   * partial port is valid per PORTING_SPEC Rule 3):
   *   0x1b3080..0x1b30df   entry + parameter dispatch:
   *                        - if axis(+0x19c)==1.0 AND paramSideB(+0x1a0)==0.0: horizontal
   *                        - if axis(+0x19c)!=1.0 AND paramSideB(+0x1a0)==1.0: vertical
   *                        - else early-exit (no-op tile)
   *   0x1b30e6..0x1b30fa   tile.Renderer() then this->vtable[*0x138] GetFilter
   *   0x1b30fd..0x1b312c   tile geometry unpacking + row/col loop bounds
   *   0x1b312e..0x1b317e   coefficient prelude:
   *                        sigma22 = 1.0f / (2.0f * sigma * sigma)
   *                        sigmax2 = 2.0f * sigma
   *   0x1b3188..0x1b3785   outer y-loop / inner x-loop with:
   *                        - initial texel sample at (u,v)
   *                        - `for i in 1..=(int)sigmax2` gaussian accumulation
   *                        - per-tap bilinear texture sample (subpixel-fractional
   *                          when GetFilter returned nonzero; nearest otherwise)
   *                        - normalization: acc = acc * 0.5f / norm
   *                        - if gradient-generation branch: alfa = M_PI + 0.5*atan2(...),
   *                          out = (0, (cos(alfa)+1)*0.5, (sin(alfa)+1)*0.5, alpha)
   *                        - clamp to [0..1], premultiplied store
   *   0x1b3785..0x1b378e   loop tail / return
   *
   * The GPU shader path (see GetProgram) is fully decoded and is enough
   * for the FCP Metal render path; this CPU-fallback path only fires
   * when the renderer target is a legacy software backbuffer.
   */
  RenderTile(_tile: HGTilePtr): void {
    // @Helium 0x1b3080 — full CPU implementation not yet transcribed.
    throw new Error(
      "HGComicGaussianBlurAndGradientGeneration::RenderTile not yet transcribed " +
        "(large SSE CPU impl @Helium 0x1b3080..0x1b378e, 409 disasm lines)",
    );
  }

  /**
   * `HGComicGaussianBlurAndGradientGeneration::GetOutput(HGRenderer*)` —
   * @Helium 0x1b37a0.
   *
   *   0x1b37a9  movss 0x198(%rbx), %xmm0        ; xmm0 = sigma
   *   0x1b37b1  xorps xmm1 ; xorps xmm2 ; xorps xmm3
   *   0x1b37ba  xorl  %esi, %esi                ; i = 0
   *   0x1b37bc  callq HGNode::SetParameter(0, sigma, 0, 0, 0)
   *   0x1b37c1  movss 0x19c(%rbx), %xmm0        ; xmm0 = axis
   *   0x1b37c9  movss 0x1a0(%rbx), %xmm1        ; xmm1 = paramSideB
   *   0x1b37da  movl  $0x1, %esi                ; i = 1
   *   0x1b37df  callq HGNode::SetParameter(1, axis, paramSideB, 0, 0)
   *   0x1b37e4  movss 0x1a4(%rbx), %xmm0        ; xmm0 = alphaPassthrough
   *   0x1b37f8  movl  $0x2, %esi                ; i = 2
   *   0x1b37fd  callq HGNode::SetParameter(2, alphaPassthrough, 0, 0, 0)
   *   0x1b3802  movq  %rbx, %rax                ; return this
   *   0x1b380b  retq
   *
   * GetOutput does NOT allocate a child; it forwards this class's stored
   * parameters into the HGNode base's parameter table and returns `this`.
   * The base class's SetParameter drives the shader-uniform pipeline
   * referenced by GetProgram's `hg_ProgramLocal0/1/2`.
   */
  GetOutput(_renderer: HGRendererPtr): HGComicGaussianBlurAndGradientGeneration {
    // @Helium 0x1b37bc — forward sigma to base as slot 0.
    HGNode_SetParameter(this, 0, this.sigma, 0, 0, 0);
    // @Helium 0x1b37df — forward (axis, paramSideB) to base as slot 1.
    HGNode_SetParameter(this, 1, this.axis, this.paramSideB, 0, 0);
    // @Helium 0x1b37fd — forward alphaPassthrough to base as slot 2.
    HGNode_SetParameter(this, 2, this.alphaPassthrough, 0, 0, 0);
    // @Helium 0x1b3802 — return this.
    return this;
  }

  /**
   * `HGComicGaussianBlurAndGradientGeneration::GetProgram(HGRenderer* r)`
   * — @Helium 0x1b3810.
   *
   *   0x1b3820  movl  $0x60000, %esi                       ; arg=0x60000
   *   0x1b3825  callq HGRenderer::GetTarget(unsigned int)
   *   0x1b382a  cmpl  $0x60b10, %eax                       ; target < 0x60b10?
   *   0x1b382f  jb    0x1b3850                             ; yes => (Metal branch)
   *   -- Metal branch (target < 0x60b10) --
   *   0x1b3831  movss 0x19c(%rbx), %xmm0                   ; xmm0 = axis
   *   0x1b3839  ucomiss 0x214480(%rip), %xmm0              ; vs 1.0f (@0x3c7cc0)
   *   0x1b3840  leaq  METAL_VERTICAL_SHADER(%rip), %rcx    ; leaq disp=0x73e7c6
   *   0x1b3847  leaq  METAL_HORIZONTAL_SHADER(%rip), %rax  ; leaq disp=0x73e10b
   *   0x1b384e  jmp   0x1b3882
   *   -- GL branch (target >= 0x60b10) --
   *   0x1b3850  movq  (%r14), %rax
   *   0x1b3853  movl  $0x2e, %esi
   *   0x1b385b  callq *0x80(%rax)                          ; renderer->vtable[*0x80](0x2e)
   *   0x1b3861  testl %eax, %eax
   *   0x1b3863  je    0x1b388f                             ; probe returned 0 => return null
   *   0x1b3865  movss 0x19c(%rbx), %xmm0                   ; xmm0 = axis
   *   0x1b386d  ucomiss 0x21444c(%rip), %xmm0              ; vs 1.0f
   *   0x1b3874  leaq  GL_VERTICAL_SHADER(%rip), %rcx
   *   0x1b387b  leaq  GL_HORIZONTAL_SHADER(%rip), %rax
   *   -- shared tail --
   *   0x1b3882  cmovneq %rcx, %rax                         ; if axis != 1.0 => rax = rcx (vertical)
   *   0x1b3886  cmovpq  %rcx, %rax                         ; if NaN      => rax = rcx (vertical)
   *   0x1b388e  retq                                       ; return rax
   *   0x1b388f  xorl  %eax, %eax ; retq                    ; return null (GL, probe failed)
   *
   * Shader dispatch table:
   *   Metal, axis == 1.0f   => METAL_HORIZONTAL_SHADER
   *   Metal, axis != 1.0f   => METAL_VERTICAL_SHADER
   *   GL,    probe fails    => null
   *   GL,    axis == 1.0f   => GL_HORIZONTAL_SHADER
   *   GL,    axis != 1.0f   => GL_VERTICAL_SHADER
   */
  GetProgram(renderer: HGRendererPtr): string | null {
    // @Helium 0x1b3825 — probe target.
    const target = HGRenderer_GetTarget(renderer, 0x60000);
    const axisF = Math.fround(this.axis);
    const axisEqOne =
      axisF === ONE_F32_AT_0x3c7cc0 && !Number.isNaN(axisF);
    // @Helium 0x1b382a..0x1b382f — cmp target vs 0x60b10, jb -> Metal branch.
    if ((target >>> 0) < 0x60b10) {
      // @Helium 0x1b3882..0x1b3886 — axis==1.0 keeps rax=horizontal;
      //   otherwise rax=rcx=vertical.
      return axisEqOne ? METAL_HORIZONTAL_SHADER : METAL_VERTICAL_SHADER;
    }
    // @Helium 0x1b385b — GL probe.
    const glOk = renderer_vtable_0x80(renderer, 0x2e);
    if ((glOk | 0) === 0) {
      // @Helium 0x1b388f — return null.
      return null;
    }
    // @Helium 0x1b3882..0x1b3886 — same cmov pair on GL branch.
    return axisEqOne ? GL_HORIZONTAL_SHADER : GL_VERTICAL_SHADER;
  }

  /**
   * `HGComicGaussianBlurAndGradientGeneration::BindTexture(HGHandler*, int slot)`
   * — @Helium 0x1b38a0.
   *
   *   0x1b38b8  callq HGHandler::TexCoord(slot, 0, 0, NULL)
   *   0x1b38c7  callq *0x48(handler_vtable)         ; handler->vtable[*0x48](slot, 0)
   *   0x1b38d2  callq *0x38(handler_vtable)         ; handler->vtable[*0x38](0)
   *   0x1b38e5  callq *0x30(handler_vtable)         ; handler->vtable[*0x30](1, 1)
   *   0x1b38e8  xorl %eax, %eax                     ; return 0
   *   0x1b38ee  retq
   */
  BindTexture(handler: HGHandlerPtr, slot: number): number {
    // @Helium 0x1b38b8 — TexCoord(slot, 0, 0, NULL).
    HGHandler_TexCoord(handler, slot | 0, 0, 0, null);
    // @Helium 0x1b38c7 — handler->vtable[*0x48](slot, 0).
    HGHandler_vtable_0x48(handler, slot | 0, 0);
    // @Helium 0x1b38d2 — handler->vtable[*0x38](0).
    HGHandler_vtable_0x38(handler, 0);
    // @Helium 0x1b38e5 — handler->vtable[*0x30](1, 1).
    HGHandler_vtable_0x30(handler, 1, 1);
    // @Helium 0x1b38e8 — return 0.
    return 0;
  }

  /**
   * `HGComicGaussianBlurAndGradientGeneration::InitProgramDescriptor(HGProgramDescriptor*) const`
   * — @Helium 0x1b38f0. Empty body (push rbp / mov rsp,rbp / pop rbp / ret).
   * Overrides HGNode's default with a NO-OP; the base class fills in the
   * descriptor slots that this shader doesn't need.
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorPtr): void {
    // @Helium 0x1b38f0..0x1b38f5 — empty function.
  }

  /**
   * `~HGComicGaussianBlurAndGradientGeneration()` (D0 — deleting dtor)
   * @Helium 0x1b2e90.
   *
   *   0x1b2e99  callq HGNode::~HGNode()               ; -> HGNode::D2
   *   0x1b2ea7  jmp   HGObject::operator delete(void*) ; tail-jmp
   *
   * D1 @0x1b2e80 and D2 @0x1b2e70 are simpler: D2 just tail-jmps to
   * HGNode::~HGNode() @0x1b2e75 without the operator-delete step.
   * TS GC subsumes the operator-delete; we model the base-dtor call
   * so the ref-count decrement on any embedded HGObject fields fires.
   */
  destroyAndDelete(): void {
    // @Helium 0x1b2e99 — tail-call HGNode::~HGNode(). In TS we mirror
    //   via the base class's destruct().
    super.destruct();
    // @Helium 0x1b2ea7 — operator delete subsumed by JS GC.
  }
}

// Re-export HGObject to keep this file's HGNode -> HGObject inheritance
// chain visible to reviewers — the layout comments above reference the
// HGObject header (0x00..0x10). No behavioural change.
export type { HGObject };
