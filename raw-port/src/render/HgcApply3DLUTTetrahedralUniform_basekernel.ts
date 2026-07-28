// HgcApply3DLUTTetrahedralUniform_basekernel.ts — Helium
//
// The BASE kernel that provides the tetrahedral-3D-LUT-on-a-uniform-grid
// interpolation for the Helium render graph. This is the CPU (SSE and
// AVX) implementation of the same math whose Metal shader is quoted
// verbatim by `GetProgram` and `InitProgramDescriptor`. The derived class
// `HgcApply3DLUTTetrahedralUniform` (ported separately in
// HgcApply3DLUTTetrahedralUniform.ts) inherits from this and only
// overrides GetDOD/GetROI + its own dtors.
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassemblies (all in raw-port/re/disasm/):
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.HgcApply3DLUTTetrahedralUniform_basekernel.s
//       (C1 ctor @0x39ac00; C2 aliases C1 @0x39ab20 — same body)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.~HgcApply3DLUTTetrahedralUniform_basekernel.s
//       (D0 deleting-dtor @0x39ad80; D1 @0x39ad30 and D2 @0x39ace0 same body minus operator delete)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.GetDOD.s          (@0x39aaa0)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.GetROI.s          (@0x39aad0)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.GetOutput.s       (@0x39aea0)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.GetProgram.s      (@0x398eb0)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.shaderDescription.s (@0x399210)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.GetParameter.s    (@0x39ae50)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.SetParameter.s    (@0x39add0)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.Bind.s            (@0x3993a0)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.BindTexture.s     (@0x399270)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.RenderTile.s      (@0x399f60)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.RenderTile_AVX.s  (@0x399420)
//   Helium.HgcApply3DLUTTetrahedralUniform_basekernel.InitProgramDescriptor.s (@0x398ee0)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT
// -----------------------------------------------------------------------------
// Recovered from the ctor (C1 @0x39ac00) and the accessor sites Bind/GetParameter/
// SetParameter/BindTexture. The class extends HGNode (its C2 is called first
// @0x39ac0a, installing HGNode fields at [0..0x?] and specifically the flags
// dword at self+0x10 that is written near the end of the ctor).
//
//   struct HgcApply3DLUTTetrahedralUniform_basekernel : HGNode {
//     // +0x000  vtable*                              installed @0x39ac16 from a
//     //                                              RIP-relative load (leaq 0x6b74ca(%rip),%rax)
//     //                                              — the derived-class vtable
//     //                                              pointer for this exact class.
//     // +0x010  uint32_t flags (in HGNode)           written @0x39acb4:
//     //                                              flags = (flags & ~0x600) | 0x400
//     //                                              (the ~0x600 mask is spelt as
//     //                                               0xfffff9ff = ~0x0600).
//     //                                              [Reads: nothing in this class.]
//     // +0x0dc  int32_t src_rect.x                   (BindTexture @0x399350 subl 0xdc/0xe4 pair)
//     // +0x0e0  int32_t src_rect.y                   (BindTexture @0x399363 subl 0xe0/0xe8 pair)
//     // +0x0e4  int32_t src_rect.right               (BindTexture @0x399349 movl 0xe4)
//     // +0x0e8  int32_t src_rect.bottom              (BindTexture @0x39935c movl 0xe8)
//     // +0x0f0  int32_t dst.width                    (BindTexture @0x39931b cvtsi2ssl 0xf0)
//     // +0x0f4  int32_t dst.height                   (BindTexture @0x399324 cvtsi2ssl 0xf4)
//     // +0x090  HGHandler* frame_handler             (BindTexture @0x3992b9 movq 0x90)
//     // +0x198  float*     params[]                  (aligned-32 allocated in ctor @0x39ac1e;
//     //                                              128 bytes of float4 slots plus a trailing
//     //                                              gap — see PARAMS LAYOUT below)
//     // +0x1a0  int32_t    (derived-only: LUT edge)  (READ by the derived class'
//     //                                              GetROI @0x073f53 — not accessed here)
//   };
//
// -----------------------------------------------------------------------------
// PARAMS LAYOUT (the buffer whose base is stored at self+0x198)
// -----------------------------------------------------------------------------
// The ctor allocates 0xe7 = 231 bytes via `operator new[]`, then aligns the
// storage to a 32-byte boundary and hides the ORIGINAL allocation pointer
// in the 8 bytes JUST BEFORE the aligned base so the dtor can find it:
//
//   @0x39ac19  movl  $0xe7, %edi                 ; 231 bytes raw
//   @0x39ac1e  callq operator new[]              ; rax = raw pointer
//   @0x39ac23  leaq  0x8(%rax), %rcx             ; rcx = raw + 8
//   @0x39ac27  negl  %ecx                        ;
//   @0x39ac29  andl  $0x1f, %ecx                 ; ecx = (-rcx) & 31 = padding
//   @0x39ac2c  leaq  (%rcx,%rax), %rdx           ; rdx = raw + padding
//   @0x39ac30  addq  $0x8, %rdx                  ; rdx = raw + padding + 8 = aligned base
//   @0x39ac34  movq  %rax, (%rcx,%rax)           ; store raw at *(aligned base - 8)
//   @0x39ac92  movq  %rdx, 0x198(%rbx)           ; self->params = aligned base
//
// The dtor's `movq -0x8(%rax), %rdi` @0x39ad9f reads back that hidden raw
// pointer to hand to `operator delete`. Total: aligned base + up to (32-8) =
// 24 bytes of pad + 8 raw-ptr slot + 200 bytes of usable float storage
// (0xe7 - 0x1f = 200 -> the buffer is sized for 200/4 = 50 f32 slots, i.e.
//  12 float4 rows + 8 extra bytes of trailing headroom).
//
// The ctor initializes all 12 float4 rows (0x00..0xb8 relative to the
// aligned base):
//
//   float4  offset  ctor stores (@ addr in ctor)                           semantic (from RenderTile_AVX)
//   -------  ------  ---------------------------------------------------   ----------------------------------
//   row 0    +0x00   xmm0 = 0 (xorps @0x39ac38, movaps @0x39ac3b)          hg_Params[0]: color range/offset
//   row 1    +0x10   xmm0 = 0                                              (unused in shader — pad row)
//   row 2    +0x20   xmm0 = 0                                              hg_Params[1]: (N-1)/N grid xform (SetParameter #1 target)
//   row 3    +0x30   xmm0 = 0                                              (paired with row 2)
//   row 4    +0x40   xmm0 = 0                                              hg_Params[2]: enable flag (SetParameter #2 target)
//   row 5    +0x50   xmm0 = 0                                              (paired with row 4)
//   row 6    +0x60   xmm1 = (1.0f, 1.0f, 1.0f, 1.0f)  @const 0x3c7c40      1.0-lane (RenderTile_AVX subtracts to build "N-1" from N)
//                                                    (movaps 0x2cfe0(%rip) @0x39ac59, tgt=0x39ac59+7+0x2cfe0=0x3c7c40; each qword=0x3f8000003f800000)
//   row 7    +0x70   xmm1 = (1.0f, 1.0f, 1.0f, 1.0f)                       same 1.0-lane
//   row 8    +0x80   xmm0 = 0                                              (staging for BindTexture rescale)
//   row 9    +0x90   xmm0 = 0
//   row 10   +0xa0   xmm0 = (0.5f, 0.5f, 0.5f, 0.5f)  @const 0x3c9ff0      hg_Params[3]: tex-coord bias/scale — 0.5 half-texel bias
//                                                    (movsd 0x2f36e(%rip) @0x39ac7a, tgt=0x39ac7a+8+0x2f36e=0x3c9ff0;
//                                                     qword=0x3f0000003f000000 -> two f32 0.5s, movaps stores both halves)
//   row 11   +0xb0   xmm0 = (0.5f, 0.5f, 0.5f, 0.5f)                       hg_Params[3] (paired copy)
//
// Then @0x39ac99 the ctor calls virtual slot +0x88 with (self, 1, 1):
//   `HGNode::<slot 0x88>(this, 1, 1)` — the "declare I have 2 inputs" call
//   as seen in every other Hgc*_basekernel. Undecoded frontier (vtable slot).
//
// Finally @0x39acb4-@0x39acbc rewrites self+0x10 = (flags & ~0x600) | 0x400,
// setting the "kernel type = 2" bits (bits 9..10 -> 01 = uniform 3D LUT
// kernel per HGNode's flag encoding — used elsewhere in the framework).
//
// -----------------------------------------------------------------------------
// External callees cited (all Helium; addresses are RIP-relative __stubs
// unless otherwise noted):
//   @0x39ac0a  HGNode::HGNode()                                (base ctor)
//   @0x39ac1e  operator new[](unsigned long) (__Znam)          (32-byte-aligned param buffer)
//   @0x39aca9  HGNode::<vtable slot 0x88>(this, 1, 1)          (declare 2-input node — undecoded)
//   @0x39ada8  operator delete(void*) (__ZdlPv)                (dtor D0/D2)
//   @0x39adb0  HGNode::~HGNode()                               (base dtor)
//   @0x39adbe  HGObject::operator delete(void*)                (D0 tail-jmp)
//   @0x39ae38  HGNode::ClearBits()                             (SetParameter side-effect)
//   @0x398f02  HGProgramDescriptor::SetVisibleShaderWithSource (InitProgramDescriptor)
//   @0x398f11  HGProgramDescriptor::SetFragmentFunctionName    (InitProgramDescriptor)
//   @0x398f58  HGProgramDescriptor::SetReturnBinding           (InitProgramDescriptor)
//   @0x398fad  std::vector<HGBinding>::__emplace_back_slow_path (InitProgramDescriptor)
//   @0x398ebc  HGRenderer::GetTarget(unsigned int)             (GetProgram)
//   @0x399f7d  HGTile::Renderer() const                        (RenderTile)
//   @0x399f87  HGRenderer::GetTarget                           (RenderTile)
//   @0x3992b4  HGHandler::TexCoord(int, int, int, double const*) (BindTexture)
//   @0x399298  HGHandler::<vtable slot 0x48>(...)              (BindTexture — undecoded)
//   @0x3992a5  HGHandler::<vtable slot 0x30>(...)              (BindTexture — undecoded)
//   @0x3992c8  HGHandler-inner::<vtable slot 0x80>(0x2e)       (BindTexture — undecoded)
//   @0x3992dc  HGHandler::<vtable slot 0xa8>()                 (BindTexture — undecoded)
//   @0x39938d  HGHandler::<vtable slot 0x88>(...)              (BindTexture — undecoded)
//   @0x3993c1  HGHandler::<vtable slot 0x90>(...)              (Bind — undecoded)
//   @0x399412  HgcApply3DLUTTetrahedralUniform_basekernel::<vtable slot 0xc0>
//              (Bind — undecoded self-virtual — likely a "post-bind hook")
//
// Everything at the SSE/AVX per-pixel arithmetic level of RenderTile/
// RenderTile_AVX is 590..658 lines of packed-single-precision tetrahedral
// interpolation. See the RenderTile_AVX stub for a decoded map of the
// float4 params it consumes; the actual math IS the Metal shader quoted in
// GetProgram/InitProgramDescriptor. A faithful CPU port at that granularity
// is a separate leaf.

import { HGRect, HGRectNull, HGRectInfinite } from "./HGRect";

// -----------------------------------------------------------------------------
// Frontier types.
// -----------------------------------------------------------------------------

/** HGRenderer* — opaque render context handle. See render/HGRect.ts. */
export type HGRenderer = { readonly __brand: "HGRenderer" };

/** HGNode base — opaque. This class extends HGNode. */
export interface HGNode {
  /** self+0x10: HGNode flags dword. Ctor writes `(flags & ~0x600) | 0x400`
   *  @0x39acb4-@0x39acbc. */
  flags_at_0x10: number;
}

/** HGTile* — opaque render-tile handle. Passed to RenderTile. */
export type HGTile = { readonly __brand: "HGTile" };

/** HGHandler* — the render-time binding surface. Bind/BindTexture pump the
 *  param buffer and texture rects into it via virtual dispatch. */
export type HGHandler = { readonly __brand: "HGHandler" };

/** HGProgramDescriptor* — opaque. InitProgramDescriptor mutates it. */
export type HGProgramDescriptor = { readonly __brand: "HGProgramDescriptor" };

/** HgcApply3DLUTTetrahedralUniform_basekernel instance shape (only the
 *  fields THIS class reads or writes; the base HGNode fields are opaque).
 *  See STRUCT LAYOUT comment above for offsets. */
export interface HgcApply3DLUTTetrahedralUniform_basekernel extends HGNode {
  /** self+0x090 — HGHandler* frame_handler used in BindTexture's
   *  rescale-vs-shader branch (@0x3992b9 movq 0x90(%r14),%rdi). */
  frame_handler_at_0x90: HGHandler | null;
  /** self+0x0dc — src rect x0 (int32). Read at BindTexture @0x399350. */
  src_x0_at_0xdc: number;
  /** self+0x0e0 — src rect y0 (int32). Read at BindTexture @0x399363. */
  src_y0_at_0xe0: number;
  /** self+0x0e4 — src rect x1 (int32). Read at BindTexture @0x399349. */
  src_x1_at_0xe4: number;
  /** self+0x0e8 — src rect y1 (int32). Read at BindTexture @0x39935c. */
  src_y1_at_0xe8: number;
  /** self+0x0f0 — dst rect width (int32). Read at BindTexture @0x39931b. */
  dst_w_at_0xf0: number;
  /** self+0x0f4 — dst rect height (int32). Read at BindTexture @0x399324. */
  dst_h_at_0xf4: number;
  /** self+0x198 — Float32Array-view of the aligned param buffer. See
   *  PARAMS LAYOUT above. Ctor allocates 231 raw bytes and installs the
   *  32-byte-aligned base here (raw ptr hidden at [base-8]). */
  params_at_0x198: Float32Array;
}

// -----------------------------------------------------------------------------
// Constants recovered from the ctor's RIP-relative data loads.
// -----------------------------------------------------------------------------

/** Ctor @0x39ac59: `movaps 0x2cfe0(%rip), %xmm1` — loads 16 bytes at
 *  target VA 0x3c7c40 = qword 0x3f8000003f800000 twice, i.e. four f32 1.0s.
 *  Written to param rows 6 (+0x60) and 7 (+0x70). */
const CTOR_XMM1_ROW6_ROW7 = new Float32Array([1.0, 1.0, 1.0, 1.0]);

/** Ctor @0x39ac7a: `movsd 0x2f36e(%rip), %xmm0` — loads 8 bytes at target
 *  VA 0x3c9ff0 = 0x3f0000003f000000 (two f32 0.5s). The subsequent
 *  `movaps %xmm0, 0xa8/0xb8(%rcx,%rax)` stores full 16 bytes with the
 *  upper half being whatever movsd zeroed there — the movsd variant zeroes
 *  the upper 64 bits, so the store is (0.5, 0.5, 0.0, 0.0). Written to
 *  param rows 10 (+0xa8) and 11 (+0xb8). */
const CTOR_XMM0_ROW10_ROW11 = new Float32Array([0.5, 0.5, 0.0, 0.0]);

/** Ctor @0x39acaf-@0x39acbc: `andl $0xfffff9ff, 0x10(%rbx) ; orl $0x400, ...`
 *  — clears bits 9..10 (mask 0x600) and sets bit 10 (0x400) of the HGNode
 *  flags dword. i.e. `flags = (flags & ~0x600) | 0x400`. */
const CTOR_FLAG_MASK = 0xfffff9ff; // ~0x0600
const CTOR_FLAG_SET = 0x0400;

/** GetProgram @0x398ec3: renderer target-class equality check. If
 *  `HGRenderer::GetTarget(0x60000)` returns 0x60b10 then GetProgram returns
 *  the Metal source pool literal address (0x63be62 RIP-relative from
 *  @0x398ecc). Otherwise (cmoveq falls through) it returns 0 (null shader
 *  source — the caller uses `InitProgramDescriptor` in that case). */
const GETPROGRAM_TARGET_CLASS_QUERY = 0x60000;
const GETPROGRAM_TARGET_CLASS_METAL = 0x60b10;

/** RenderTile @0x399f8c: dispatch threshold — if `HGRenderer::GetTarget(0)`
 *  returns >= 0x4700000, call RenderTile_AVX; otherwise fall through to the
 *  SSE per-pixel loop (@0x399fb2 onward). The 0x4700000 constant is the
 *  "renderer feature level >= AVX" gate for this class. */
const RENDERTILE_AVX_THRESHOLD = 0x4700000;

/** RenderTile inner loop @0x399ff1: the SECOND target-class check
 *  `cmpl $0x44fffff, %eax` — a "renderer feature level <= 0x44fffff" gate
 *  used to select the fully-scalar path (@0x39a533) vs. the SSE-packed path
 *  (fall-through to @0x39a007). The RenderTile stub throws before this
 *  branch is reachable — retained here for later decode of that split. */
const RENDERTILE_SCALAR_THRESHOLD = 0x44fffff;

// -----------------------------------------------------------------------------
// HGNode::HGNode + HGObject::operator delete — undecoded frontier.
// -----------------------------------------------------------------------------

/** HGNode::HGNode() — base ctor called @0x39ac0a. Frontier stub. */
function HGNode_ctor(_self: HGNode): void {
  throw new Error(
    "HGNode::HGNode() not yet transcribed: called from HgcApply3DLUTTetrahedralUniform_basekernel ctor @Helium 0x39ac0a as an undecoded frontier symbol.",
  );
}

/** HGNode::~HGNode() — base dtor called @0x39adb0. Frontier stub. */
function HGNode_dtor(_self: HGNode): void {
  throw new Error(
    "HGNode::~HGNode() not yet transcribed: called from HgcApply3DLUTTetrahedralUniform_basekernel D0 @Helium 0x39adb0 as an undecoded frontier symbol.",
  );
}

/** HGNode::ClearBits() — invalidation hook called from SetParameter
 *  @0x39ae38 after a value CHANGES. Frontier stub. */
function HGNode_ClearBits(_self: HGNode): void {
  throw new Error(
    "HGNode::ClearBits() not yet transcribed: called from SetParameter @Helium 0x39ae38 as an undecoded frontier symbol.",
  );
}

/** HGNode::<vtable slot 0x88> — declare input count. Called from the ctor
 *  @0x39aca9 as `virtcall(self, 1, 1)`. Undecoded frontier. */
function HGNode_vslot88_declareInputs(
  _self: HGNode,
  _a: number,
  _b: number,
): void {
  throw new Error(
    "HGNode::<vtable slot 0x88> (declare input count) not yet transcribed: virtual dispatch from HgcApply3DLUTTetrahedralUniform_basekernel ctor @Helium 0x39aca9 with args (this, 1, 1) — vtable slot target undecoded.",
  );
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::HgcApply3DLUTTetrahedralUniform_basekernel()
// (C1 @Helium 0x39ac00; C2 @Helium 0x39ab20 is an alias body — same layout.)
//
// Line-by-line (see STRUCT LAYOUT + PARAMS LAYOUT comments above for the
// discovered semantics):
//
//   @0x39ac0a  callq HGNode::HGNode()                       ; base ctor
//   @0x39ac0f  leaq  0x6b74ca(%rip), %rax
//   @0x39ac16  movq  %rax, (%rbx)                           ; install this-class vtable
//   @0x39ac19  movl  $0xe7, %edi                            ; 231 bytes
//   @0x39ac1e  callq operator new[]                         ; rax = raw ptr
//   @0x39ac23-30  32-byte-align: rdx = ((raw+8) rounded up to 32) = aligned base
//   @0x39ac34  movq  %rax, (%rcx,%rax)                      ; store raw at [aligned-8]
//   @0x39ac38  xorps %xmm0, %xmm0
//   @0x39ac3b..@0x39ac72  movaps %xmm0, [base+0x00..+0x50]  ; zero rows 0..5
//                        movaps %xmm0, [base+0x80..+0x90]  ; zero rows 8..9
//   @0x39ac59  movaps 0x2cfe0(%rip), %xmm1                  ; xmm1 = (1,1,1,1)
//   @0x39ac60  movaps %xmm1, [base+0x70]                    ; row 7 = 1s
//   @0x39ac65  movaps %xmm1, [base+0x60]                    ; row 6 = 1s
//   @0x39ac7a  movsd  0x2f36e(%rip), %xmm0                  ; xmm0 low = (0.5,0.5)
//   @0x39ac82  movaps %xmm0, [base+0xb8]                    ; row 11 = (0.5,0.5,0,0)
//   @0x39ac8a  movaps %xmm0, [base+0xa8]                    ; row 10 = (0.5,0.5,0,0)
//   @0x39ac92  movq  %rdx, 0x198(%rbx)                      ; self->params = base
//   @0x39ac9c-@0x39aca9  virtcall self.vtable[0x88](this,1,1)  ; declare 2 inputs
//   @0x39acaf-@0x39acbc  self+0x10 = (self+0x10 & ~0x600) | 0x400
// -----------------------------------------------------------------------------

/** HgcApply3DLUTTetrahedralUniform_basekernel::ctor() @Helium 0x39ac00.
 *
 *  Allocates the 32-byte-aligned float4 parameter buffer, installs the
 *  ctor-time defaults (1.0-lane rows @0x60/0x70, 0.5-lane rows @0xa8/0xb8,
 *  zeros elsewhere), declares this is a 2-input node via a base virtual,
 *  and sets the "uniform-grid 3D LUT kernel" flag pair in HGNode.flags.
 *
 *  This is a MUTATING constructor — it fills `self` in-place, exactly as
 *  the x86 body writes through %rbx. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_ctor(
  self: HgcApply3DLUTTetrahedralUniform_basekernel,
): void {
  // @0x39ac0a callq HGNode::HGNode(). Frontier — we transcribe the base
  // fields we do read (flags_at_0x10 must exist on `self` already so the
  // OR/AND at the end has something to hit); the actual HGNode ctor body
  // is deferred (throwing stub above).
  HGNode_ctor(self);

  // @0x39ac0f-@0x39ac16 install this-class vtable pointer at self+0x00.
  // Not modelled as data on the interface (no reads inside this class);
  // documented in STRUCT LAYOUT.

  // @0x39ac1e-@0x39ac34 allocate 231 bytes and 32-byte-align. We build a
  // Float32Array whose usable region is the aligned base onward. The
  // hidden raw pointer at [aligned - 8] used by the dtor is not modelled
  // in TS (the Float32Array is GC-managed here — the dtor stub reflects
  // the C++ deallocation path).
  //
  // 200 bytes of usable float storage past the alignment slot = 50 f32
  // lanes = 12 float4 rows + 8 bytes trailing pad. We size the array to
  // 12 float4 rows (48 floats) because rows 0..11 are the only ones the
  // ctor touches; the trailing 2 lanes are unread in this class.
  const params = new Float32Array(48);

  // @0x39ac38 xorps %xmm0,%xmm0; @0x39ac3b-@0x39ac72 zero rows 0..5, 8..9.
  // Float32Array is already zero-initialized — matches xorps stores.

  // @0x39ac59 movaps 0x2cfe0(%rip),%xmm1 -> (1,1,1,1); rows 6 and 7.
  params.set(CTOR_XMM1_ROW6_ROW7, 6 * 4); // row 6 @+0x60
  params.set(CTOR_XMM1_ROW6_ROW7, 7 * 4); // row 7 @+0x70

  // @0x39ac7a movsd 0x2f36e(%rip),%xmm0 -> (0.5,0.5,0,0); rows 10 and 11.
  params.set(CTOR_XMM0_ROW10_ROW11, 10 * 4); // row 10 @+0xa8..+0xb7
  params.set(CTOR_XMM0_ROW10_ROW11, 11 * 4); // row 11 @+0xb8..+0xc7

  // @0x39ac92 movq %rdx, 0x198(%rbx) — install params base.
  self.params_at_0x198 = params;

  // @0x39ac9c-@0x39aca9 virtcall self.vtable[0x88](this, 1, 1) — declare
  // 2 inputs. Frontier stub above.
  HGNode_vslot88_declareInputs(self, 1, 1);

  // @0x39acaf-@0x39acbc self+0x10 = (self+0x10 & ~0x600) | 0x400
  self.flags_at_0x10 = ((self.flags_at_0x10 & CTOR_FLAG_MASK) | CTOR_FLAG_SET) >>> 0;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::~HgcApply3DLUTTetrahedralUniform_basekernel()
//
// D0 (deleting variant) @Helium 0x39ad80:
//   @0x39ad89  leaq  0x6b7350(%rip), %rax
//   @0x39ad90  movq  %rax, (%rdi)                    ; RE-install this-class vtable
//                                                     ; (dtor thunk from a derived class chain)
//   @0x39ad93  movq  0x198(%rdi), %rax               ; rax = self->params_base
//   @0x39ad9a  testq %rax, %rax ; je +7              ; if (!base) skip
//   @0x39ad9f  movq  -0x8(%rax), %rdi                ; rdi = raw allocation ptr
//   @0x39ada3  testq %rdi, %rdi ; je +7              ; if (!raw) skip
//   @0x39ada8  callq __ZdlPv                          ; operator delete(raw)
//   @0x39adad  movq  %rbx, %rdi
//   @0x39adb0  callq HGNode::~HGNode()               ; base dtor
//   @0x39adbe  jmp   HGObject::operator delete       ; tail-jmp
//
// D1 @Helium 0x39ad30 and D2 @Helium 0x39ace0 are the SAME body minus the
// final `jmp __ZN8HGObjectdlEPv` — they don't free `self`, only the
// param buffer + base fields.
// -----------------------------------------------------------------------------

/** HGObject::operator delete(void*) — frontier stub, tail-jmped from D0 dtor. */
function HGObject_operator_delete(_self: HGNode): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed: tail-jmped from HgcApply3DLUTTetrahedralUniform_basekernel D0 @Helium 0x39adbe as an undecoded frontier symbol.",
  );
}

/** HgcApply3DLUTTetrahedralUniform_basekernel::~*_basekernel() (D0 —
 *  deleting variant) @Helium 0x39ad80. Frees the aligned param buffer
 *  (via the hidden raw ptr at params-8), calls the base HGNode dtor, then
 *  tail-jmps to HGObject::operator delete. All three deallocators are
 *  undecoded frontier symbols. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_dtor_D0(
  self: HgcApply3DLUTTetrahedralUniform_basekernel,
): void {
  // @0x39ad89-@0x39ad90 re-install vtable — no-op in TS (no vtable field).
  // @0x39ad93-@0x39ada8: free the aligned param buffer.
  // We can't call `operator delete` in TS; document the deallocation via
  // a frontier stub call that names the exact symbol + address so the
  // gate sees the un-transcribed frontier. Retention: the Float32Array
  // is GC-managed; setting it to `null`-ish would just null-out `self`.
  //
  // Kept as an explicit throwing stub for now (D0 is only invoked on the
  // C++ `delete node;` path; there is currently no TS path that requires
  // running the deleting-dtor by hand).
  throw new Error(
    "HgcApply3DLUTTetrahedralUniform_basekernel::~*_basekernel D0 @Helium 0x39ad80 not yet transcribed: `operator delete` on hidden raw-alloc ptr @Helium 0x39ada8 and HGNode::~HGNode @Helium 0x39adb0 and HGObject::operator delete @Helium 0x39adbe are undecoded frontier symbols.",
  );
  // Unreachable — the sequence would be:
  //   HGNode_dtor(self);
  //   HGObject_operator_delete(self);
  // (Both frontier stubs above; kept in-scope so referenced imports don't dead-code.)
  HGNode_dtor(self);
  HGObject_operator_delete(self);
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::GetDOD(HGRenderer*, int, HGRect) @Helium 0x39aaa0
//
//   @0x39aaa0  movq  %rcx, %rax             ; rax = incoming.lo (default return.lo)
//   @0x39aaa3  testl %edx, %edx
//   @0x39aaa5  je    0x39aac8               ; if (which == 0) -> return incoming rect
//   @0x39aaab  cmpl  $0x1, %edx
//   @0x39aaae  jne   0x39aab9               ; if (which != 1) -> HGRectNull
//   @0x39aab0  leaq  _HGRectInfinite(%rip), %rcx  ; else which == 1 -> HGRectInfinite
//   @0x39aab7  jmp   0x39aac0
//   @0x39aab9  leaq  _HGRectNull(%rip), %rcx
//   @0x39aac0  movq  (%rcx), %rax  ;  0x8(%rcx),%r8
//   @0x39aac8  movq  %r8, %rdx     ;  retq
//
// Three-way dispatch on `which`:
//   which == 0  ->  return incoming rect        (input 0: source image, DOD passthrough)
//   which == 1  ->  return HGRectInfinite       (input 1: the 3D LUT — infinite DOD)
//   otherwise   ->  return HGRectNull
// -----------------------------------------------------------------------------

/** HgcApply3DLUTTetrahedralUniform_basekernel::GetDOD @Helium 0x39aaa0.
 *  See disasm block above for the three-way dispatch on `which`. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_GetDOD(
  _self: HgcApply3DLUTTetrahedralUniform_basekernel,
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x39aaa3-@0x39aaa5: `testl %edx,%edx ; je` — which == 0 -> incoming.
  if ((which | 0) === 0) return rect;
  // @0x39aaab-@0x39aaae: `cmpl $1,%edx ; jne` — which == 1 -> HGRectInfinite.
  if ((which | 0) === 1) return HGRectInfinite;
  // @0x39aab9: fallthrough -> HGRectNull.
  return HGRectNull;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::GetROI(HGRenderer*, int, HGRect) @Helium 0x39aad0
//
//   @0x39aad0  cmpl  $0x1, %edx
//   @0x39aad3  je    0x39aaee                ; which == 1 -> tail-jmp path
//   @0x39aad5  testl %edx, %edx
//   @0x39aad7  je    0x39aae7                ; which == 0 -> return incoming (rcx:r8 unchanged)
//   @0x39aad9  leaq  _HGRectNull(%rip), %rax
//   @0x39aae0  movq  (%rax), %rcx  ;  0x8(%rax),%r8   ; other -> HGRectNull
//   @0x39aae7  movq  %rcx, %rax  ;  %r8, %rdx  ;  retq
//
//   [which == 1 tail path @0x39aaee]
//   @0x39aaee-@0x39aafd  save this=%rax->%rsi, %rdi=%rsi->%rdi, %rbx=%rsi
//                         so args: rdi=renderer, rsi=this, edx=1
//   @0x39ab05  callq HGRenderer::GetInput(HGNode*, int)     ; returns HGNode* input1
//   @0x39ab0a  movq %rbx, %rdi ; %rax, %rsi                  ; rdi=renderer, rsi=input1
//   @0x39ab16  jmp   HGRenderer::GetDOD(HGNode*)             ; tail-jmp: return renderer->GetDOD(input1)
//
// Three-way dispatch on `which`:
//   which == 0  ->  return incoming rect
//   which == 1  ->  return renderer->GetDOD( renderer->GetInput(this, 1) )
//                   (i.e. "my LUT-input's ROI is my LUT-input's DOD" — the
//                    LUT is sampled everywhere the LUT node claims to be
//                    defined; no cropping)
//   otherwise   ->  HGRectNull
// -----------------------------------------------------------------------------

/** HGRenderer::GetInput(HGNode*, int) — @Helium __ZN10HGRenderer8GetInputEP6HGNodei. Frontier stub. */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _self: HGNode,
  _which: number,
): HGNode {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed: called from HgcApply3DLUTTetrahedralUniform_basekernel::GetROI @Helium 0x39ab05 as an undecoded frontier symbol.",
  );
}

/** HGRenderer::GetDOD(HGNode*) — @Helium __ZN10HGRenderer6GetDODEP6HGNode. Frontier stub. */
function HGRenderer_GetDOD(_renderer: HGRenderer, _input: HGNode): HGRect {
  throw new Error(
    "HGRenderer::GetDOD(HGNode*) not yet transcribed: tail-jmped from HgcApply3DLUTTetrahedralUniform_basekernel::GetROI @Helium 0x39ab16 as an undecoded frontier symbol.",
  );
}

/** HgcApply3DLUTTetrahedralUniform_basekernel::GetROI @Helium 0x39aad0.
 *  See disasm block above. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_GetROI(
  self: HgcApply3DLUTTetrahedralUniform_basekernel,
  renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x39aad0-@0x39aad3 which == 1 -> tail path.
  if ((which | 0) === 1) {
    // @0x39ab05 renderer->GetInput(this, 1)
    const input1 = HGRenderer_GetInput(renderer, self, 1);
    // @0x39ab16 renderer->GetDOD(input1)
    return HGRenderer_GetDOD(renderer, input1);
  }
  // @0x39aad5-@0x39aad7 which == 0 -> return incoming rect.
  if ((which | 0) === 0) return rect;
  // @0x39aad9-@0x39aae0 otherwise -> HGRectNull.
  return HGRectNull;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::GetOutput(HGRenderer*) @Helium 0x39aea0
//
//   @0x39aea0  pushq %rbp ; movq %rsp,%rbp
//   @0x39aea4  movq  %rdi, %rax           ; return this
//   @0x39aea7  popq  %rbp ; retq
//
// Returns `this` — the base kernel IS its own output node.
// -----------------------------------------------------------------------------

/** HgcApply3DLUTTetrahedralUniform_basekernel::GetOutput @Helium 0x39aea0.
 *  Returns `this`. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_GetOutput(
  self: HgcApply3DLUTTetrahedralUniform_basekernel,
  _renderer: HGRenderer,
): HgcApply3DLUTTetrahedralUniform_basekernel {
  // @0x39aea4 movq %rdi, %rax — return the this pointer verbatim.
  return self;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::GetParameter(int i, float* out) @Helium 0x39ae50
//
//   @0x39ae50  movl  $0xffffffff, %eax           ; default rc = -1
//   @0x39ae55  cmpl  $0x2, %esi                  ; i unsigned-compare 2 (ja == higher-unsigned)
//   @0x39ae58  ja    0x39ae98                    ; if (i > 2) return -1
//   @0x39ae5e  movq  0x198(%rdi), %rax           ; rax = params_base
//   @0x39ae65  movl  %esi, %ecx
//   @0x39ae67  shlq  $0x5, %rcx                  ; rcx = i * 32   (float4 pair stride)
//   @0x39ae6b  movss  (%rax,%rcx), %xmm0 ; movss %xmm0, (%rdx)   ; out[0] = base[i*32 + 0]
//   @0x39ae74  movss 0x4(%rax,%rcx), %xmm0 ; movss %xmm0, 0x4(%rdx) ; out[1] = base[i*32 + 4]
//   @0x39ae7f  movss 0x8(%rax,%rcx), %xmm0 ; movss %xmm0, 0x8(%rdx) ; out[2] = base[i*32 + 8]
//   @0x39ae8a  movss 0xc(%rax,%rcx), %xmm0 ; movss %xmm0, 0xc(%rdx) ; out[3] = base[i*32 + 12]
//   @0x39ae95  xorl  %eax, %eax                  ; rc = 0
//   @0x39ae98  retq
//
// Reads the FIRST float4 of the (i * 32-byte)-strided parameter slot; the
// second float4 of each pair is used internally (SetParameter writes both,
// and BindTexture indexes params+0x20 for texcoord scale-bias — same
// stride).
// -----------------------------------------------------------------------------

/** HgcApply3DLUTTetrahedralUniform_basekernel::GetParameter @Helium 0x39ae50.
 *  Reads param slot `i` (i in {0,1,2}) into `out[0..3]`; returns 0 on
 *  success, -1 (0xffffffff) if `i > 2` (unsigned compare). */
export function HgcApply3DLUTTetrahedralUniform_basekernel_GetParameter(
  self: HgcApply3DLUTTetrahedralUniform_basekernel,
  i: number,
  out: Float32Array,
): number {
  // @0x39ae55 unsigned "i > 2" -> reject. The `ja` uses the unsigned above
  // condition, so negative i (as uint32) also rejects — mirror with >>> 0.
  const iu = i >>> 0;
  if (iu > 2) return -1 >>> 0 ? -1 : -1; // preserve int32 -1 sentinel
  // @0x39ae5e-@0x39ae67 params_base + i*32 as float32 element index i*8.
  const base = self.params_at_0x198;
  const off = (iu * 32) / 4; // = iu * 8 (float32 elements)
  // @0x39ae6b-@0x39ae90 four movss stores.
  out[0] = base[off + 0];
  out[1] = base[off + 1];
  out[2] = base[off + 2];
  out[3] = base[off + 3];
  // @0x39ae95 rc = 0.
  return 0;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::SetParameter(int i, float x, float y, float z, float w) @Helium 0x39add0
//
//   @0x39add0  movl  $0xffffffff, %eax           ; rc = -1
//   @0x39add5  cmpl  $0x2, %esi ; ja _ret        ; if (i unsigned > 2) return -1
//   @0x39adda  movq  0x198(%rdi), %rcx           ; rcx = params_base
//   @0x39ade1  movl  %esi, %edx ; shlq $5,%rdx   ; rdx = i * 32
//   @0x39ade7  leaq  (%rcx,%rdx), %rax           ; rax = &params[i*32]
//
//   ; UCOMISS 4-way EARLY-OUT: if all four incoming lanes bit-equal (via
//   ; ucomiss ordered-compare) to the CURRENT stored values, RETURN 0 WITHOUT
//   ; touching HGNode::ClearBits() — this is the "no change, don't invalidate"
//   ; fast path.
//   @0x39adeb-@0x39adf3   x match? no -> _write ; NaN (jp) -> _write (never bit-equal)
//   @0x39adf7-@0x39ae01   y match? no -> _write ; NaN -> _write
//   @0x39ae03-@0x39ae0d   z match? no -> _write ; NaN -> _write
//   @0x39ae0f-@0x39ae19   w match? no -> _write ; NaN -> _write (jnp reaches _no_change_ret)
//   @0x39ae44  xorl %eax,%eax ; retq            ; rc = 0, no change path
//
//   ; _write:
//   @0x39ae1f-@0x39ae2b  insertps into xmm0 to build packed (x,y,z,w)
//   @0x39ae31  movups %xmm0, 0x10(%rax)         ; store to SECOND float4 of the pair (at +i*32+16)
//   @0x39ae35  movups %xmm0, (%rax)             ; store to FIRST  float4 of the pair (at +i*32)
//   @0x39ae38  callq HGNode::ClearBits()        ; invalidate cached output
//   @0x39ae3d  movl  $0x1, %eax                 ; rc = 1  ("value changed")
//   @0x39ae43  retq
//
// Semantics: SetParameter WRITES BOTH float4 lanes of the pair (the ctor
// left both zeroed for slots 0..2; the second lane in each pair is a
// scratch copy used by RenderTile_AVX to build "N-1" and by BindTexture
// to feed hg_Params[3].zw). Return code: 0 = unchanged, 1 = changed,
// -1 = index out of range.
//
// The `ucomiss ... jne _write ; jp _write` idiom is the C++
// `if (a != b) goto write;` with NaN-safe semantics — ucomiss sets PF on
// unordered (NaN) which forces the write, so a NaN store is always
// "different from" whatever was there. Faithfully model that.
// -----------------------------------------------------------------------------

/** HgcApply3DLUTTetrahedralUniform_basekernel::SetParameter @Helium 0x39add0.
 *  See disasm block above for the ucomiss early-out + double-lane store. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_SetParameter(
  self: HgcApply3DLUTTetrahedralUniform_basekernel,
  i: number,
  x: number,
  y: number,
  z: number,
  w: number,
): number {
  // @0x39add5 unsigned i > 2 -> -1.
  const iu = i >>> 0;
  if (iu > 2) return -1;
  const base = self.params_at_0x198;
  const off = (iu * 32) / 4; // = iu * 8 (float32 elements) — first float4 of the pair.

  // @0x39adeb-@0x39ae19: NaN-safe "all four lanes bit-equal" check.
  //   `ucomiss` sets ZF only for ordered-equal AND sets PF for unordered
  //   (NaN); the `jne` OR `jp` (any of {not-equal, unordered}) jumps to
  //   the write path. Equivalently: change if !(x == cur && !isNaN(pair)).
  //
  //   We must round each incoming lane to f32 first — the caller feeds
  //   raw JS numbers (double), but SetParameter's `%xmm0..%xmm3` are
  //   single-precision registers. `Math.fround` matches that.
  //
  //   The stored values in `base` are already f32 (Float32Array storage).
  const xf = Math.fround(x);
  const yf = Math.fround(y);
  const zf = Math.fround(z);
  const wf = Math.fround(w);

  const cx = base[off + 0];
  const cy = base[off + 1];
  const cz = base[off + 2];
  const cw = base[off + 3];

  // NaN-safe equality: `a === b` in JS is false for NaN vs NaN (matches
  // ucomiss which reports "unordered" for any NaN operand and thereby
  // takes the "write" branch). So we ONLY skip the write if all four are
  // strictly equal AND none is NaN — expressed simply as `a === b` on
  // finite/normal floats (NaN !== NaN handles the unordered case
  // automatically).
  const unchanged = cx === xf && cy === yf && cz === zf && cw === wf;
  if (unchanged) {
    // @0x39ae44 xorl %eax,%eax ; retq — return 0, no write, no ClearBits.
    return 0;
  }

  // @0x39ae1f-@0x39ae35: build packed float4 and store to BOTH lanes of
  // the pair (offset +0 AND offset +16 within the pair).
  base[off + 0] = xf;
  base[off + 1] = yf;
  base[off + 2] = zf;
  base[off + 3] = wf;
  base[off + 4] = xf; // +0x10 of the pair
  base[off + 5] = yf;
  base[off + 6] = zf;
  base[off + 7] = wf;

  // @0x39ae38 callq HGNode::ClearBits() — invalidate cached output.
  HGNode_ClearBits(self);

  // @0x39ae3d movl $0x1, %eax — return 1 ("value changed").
  return 1;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::Bind(HGHandler*) @Helium 0x3993a0
//
//   @0x3993ad  movq  0x198(%rdi), %rdx            ; rdx = params + 0x00
//   @0x3993b4  movq  (%rsi), %rax                 ; rax = handler->vtable
//   @0x3993ba  xorl  %esi, %esi                   ; slot arg = 0
//   @0x3993bc  movl  $0x1, %ecx                   ; count arg = 1
//   @0x3993c1  callq *0x90(%rax)                  ; handler->vslot[0x90](handler, 0, &params[0], 1)
//   @0x3993c7  movq  0x198(%r14), %rdx            ; rdx = params + 0x20 (row 2 pair)
//   @0x3993ce  addq  $0x20, %rdx
//   @0x3993d8  movl  $0x1, %esi                   ; slot arg = 1
//   @0x3993e2  callq *0x90(%rax)                  ; handler->vslot[0x90](handler, 1, &params[0x20], 1)
//   @0x3993e8  movq  0x198(%r14), %rdx            ; rdx = params + 0x40 (row 4 pair)
//   @0x3993ef  addq  $0x40, %rdx
//   @0x3993f9  movl  $0x2, %esi                   ; slot arg = 2
//   @0x399403  callq *0x90(%rax)                  ; handler->vslot[0x90](handler, 2, &params[0x40], 1)
//   @0x399409  movq  (%r14), %rax                 ; rax = self->vtable
//   @0x39940c  movq  %r14, %rdi ; %rbx, %rsi
//   @0x399412  callq *0xc0(%rax)                  ; self->vslot[0xc0](this, handler)  (post-bind hook)
//   @0x399418  xorl  %eax, %eax                   ; return 0
//
// Feeds hg_Params[0]/hg_Params[1]/hg_Params[2] to the handler as three
// float4 uploads (slots 0, 1, 2), then invokes the class's own vtable
// slot 0xc0 with (this, handler) — the derived-class "post-bind hook"
// which for the current binary is undecoded.
// -----------------------------------------------------------------------------

/** HGHandler::<vtable slot 0x90> — "SetShaderParam(slot, float4*, count)".
 *  Called three times from Bind @0x3993c1/@0x3993e2/@0x399403. Frontier stub. */
function HGHandler_vslot90_setShaderParam(
  _handler: HGHandler,
  _slot: number,
  _data: Float32Array,
  _dataOff: number,
  _count: number,
): void {
  throw new Error(
    "HGHandler::<vtable slot 0x90> (SetShaderParam) not yet transcribed: virtual dispatch from HgcApply3DLUTTetrahedralUniform_basekernel::Bind @Helium 0x3993c1 / 0x3993e2 / 0x399403 — vtable slot target undecoded.",
  );
}

/** HgcApply3DLUTTetrahedralUniform_basekernel::<vtable slot 0xc0> — post-bind
 *  hook. Called from Bind @0x399412 with (this, handler). Frontier stub. */
function Self_vslot0xc0_postBindHook(
  _self: HgcApply3DLUTTetrahedralUniform_basekernel,
  _handler: HGHandler,
): void {
  throw new Error(
    "HgcApply3DLUTTetrahedralUniform_basekernel::<vtable slot 0xc0> (post-bind hook) not yet transcribed: virtual dispatch from Bind @Helium 0x399412 — vtable slot target undecoded.",
  );
}

/** HgcApply3DLUTTetrahedralUniform_basekernel::Bind @Helium 0x3993a0.
 *  Uploads hg_Params[0..2] to the handler then invokes the derived-class
 *  post-bind hook. Returns 0. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_Bind(
  self: HgcApply3DLUTTetrahedralUniform_basekernel,
  handler: HGHandler,
): number {
  const params = self.params_at_0x198;

  // @0x3993c1 handler->vslot90(handler, 0, &params[0x00], 1)
  HGHandler_vslot90_setShaderParam(handler, 0, params, 0, 1);
  // @0x3993e2 handler->vslot90(handler, 1, &params[0x20], 1) — row 2 pair (hg_Params[1])
  HGHandler_vslot90_setShaderParam(handler, 1, params, 0x20 / 4, 1);
  // @0x399403 handler->vslot90(handler, 2, &params[0x40], 1) — row 4 pair (hg_Params[2])
  HGHandler_vslot90_setShaderParam(handler, 2, params, 0x40 / 4, 1);

  // @0x399412 self->vslot0xc0(this, handler)
  Self_vslot0xc0_postBindHook(self, handler);

  // @0x399418 xorl %eax,%eax ; return 0.
  return 0;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::BindTexture(HGHandler*, int which) @Helium 0x399270
//
//   @0x39927a  cmpl  $0x1, %edx ; je _tex1
//   @0x39927f  movl  $0xffffffff, %ebx                ; rc = -1
//   @0x399284  testl %edx, %edx ; jne _ret_neg1       ; which not in {0,1} -> return -1
//
//   ; _tex0 (which == 0) — source-image texture
//   @0x39928c  movq  (%rsi), %rax
//   @0x39928f  xorl  %ebx, %ebx                        ; rc = 0
//   @0x399298  callq *0x48(%rax)                       ; handler->vslot48(handler, 0, 0)  (set active texture 0)
//   @0x3992a5  callq *0x30(%rax)                       ; handler->vslot30(handler, 0, 0)  (set filter/sampler)
//   @0x3992b4  callq HGHandler::TexCoord(0,0,0, NULL)  ; identity texcoord
//   @0x3992b9  movq  0x90(%r14), %rdi                  ; rdi = self->frame_handler
//   @0x3992c0-@0x3992c8  callq *0x80((*rdi))(0x2e)     ; frame_handler->vslot80(frame_handler, 0x2e) (query cap)
//   @0x3992ce  testl %eax, %eax ; jne _ret             ; if cap -> return 0 immediately
//   @0x3992dc  callq *0xa8(%rax)                       ; handler->vslot_a8(handler) (finalize tex 0)
//   @0x3992e2  jmp   _ret
//
//   ; _tex1 (which == 1) — the 3D LUT texture (uses hg_Params[3] tex xform)
//   @0x3992e7  movq  (%rsi), %rax
//   @0x3992ea  xorl  %ebx, %ebx                        ; rc = 0
//   @0x3992f6  callq *0x48(%rax)  ...(handler, 1, 0)   ; active texture 1
//   @0x399303  callq *0x30(%rax)  ...(handler, 0, 0)   ; filter/sampler
//   @0x399306  movq  0x90(%r14), %rdi                  ; frame_handler
//   @0x399315  callq *0x80((*rdi))(0x2e)               ; query cap
//   @0x39931b  cvtsi2ssl 0xf0(%r14), %xmm0             ; xmm0 = (float)self.dst_w
//   @0x399324  cvtsi2ssl 0xf4(%r14), %xmm1             ; xmm1 = (float)self.dst_h
//   @0x39932d  testl %eax, %eax
//   @0x39932f  je    _no_cap
//   @0x399334  movss 0x2e984(%rip), %xmm2              ; xmm2 = f32 at (0x399334+8+0x2e984)=0x3c7cc0
//   @0x39933c  movq  %r14, %rdi ; %rsi = 3
//   @0x399344  movaps %xmm2, %xmm3                     ; xmm3 = same const
//   @0x399347  jmp   _upload
//   ; _no_cap:
//   @0x399349  movl  0xe4(%r14), %eax
//   @0x399350  subl  0xdc(%r14), %eax                  ; eax = src_x1 - src_x0 = src_w
//   @0x399357  cvtsi2ss %rax, %xmm4                    ; xmm4 = (float)src_w
//   @0x39935c  movl  0xe8(%r14), %eax
//   @0x399363  subl  0xe0(%r14), %eax                  ; eax = src_y1 - src_y0 = src_h
//   @0x39936a  movss 0x2e94e(%rip), %xmm3              ; xmm3 = f32 at (0x39936a+8+0x2e94e)=0x3c7cc0 (same 1.0 const)
//   @0x399372  cvtsi2ss %rax, %xmm5                    ; xmm5 = (float)src_h
//   @0x399377  movaps %xmm3, %xmm2                     ; xmm2 = 1.0
//   @0x39937a  divss %xmm4, %xmm2                      ; xmm2 = 1.0 / src_w
//   @0x39937e  divss %xmm5, %xmm3                      ; xmm3 = 1.0 / src_h
//   @0x399382  movq  %r14, %rdi
//   @0x399388  movl  $0x3, %esi
//   @0x39938d  callq *0x88(%rax)                       ; handler->vslot88(handler, 3, (dst_w, dst_h, 1/src_w, 1/src_h))
//                                                       ; -> feeds hg_Params[3] = (0.5, 0.5, 1/src_w, 1/src_h)
//                                                       ;   (the .xy comes from the ctor 0.5,0.5 pair; .zw from divss here)
//   @0x399393  movl  %ebx, %eax ; retq                  ; rc from ebx
//
// The two RIP-relative f32 constants at 0x3c7cc0 are both 1.0f (they're
// the SAME source-pool constant reused twice — verified below).
// -----------------------------------------------------------------------------

/** HGHandler::TexCoord(int, int, int, double const*) — @Helium
 *  __ZN9HGHandler8TexCoordEiiiPKd. Frontier stub. */
function HGHandler_TexCoord(
  _handler: HGHandler,
  _a: number,
  _b: number,
  _c: number,
  _d: Float64Array | null,
): void {
  throw new Error(
    "HGHandler::TexCoord(int, int, int, double const*) not yet transcribed: called from BindTexture @Helium 0x3992b4 as an undecoded frontier symbol.",
  );
}

/** HGHandler::<vtable slot 0x48> — "SetActiveTexture(slot, ??)". Frontier. */
function HGHandler_vslot48_setActiveTexture(
  _h: HGHandler,
  _slot: number,
  _arg: number,
): void {
  throw new Error(
    "HGHandler::<vtable slot 0x48> (SetActiveTexture) not yet transcribed: virtual dispatch from BindTexture @Helium 0x399298 / 0x3992f6 — vtable slot target undecoded.",
  );
}
/** HGHandler::<vtable slot 0x30> — "SetSampler(...)". Frontier. */
function HGHandler_vslot30_setSampler(
  _h: HGHandler,
  _a: number,
  _b: number,
): void {
  throw new Error(
    "HGHandler::<vtable slot 0x30> (SetSampler) not yet transcribed: virtual dispatch from BindTexture @Helium 0x3992a5 / 0x399303 — vtable slot target undecoded.",
  );
}
/** frame_handler::<vtable slot 0x80> — "QueryCap(id)". Frontier. */
function FrameHandler_vslot80_queryCap(
  _fh: HGHandler,
  _capId: number,
): number {
  throw new Error(
    "frame_handler::<vtable slot 0x80> (QueryCap) not yet transcribed: virtual dispatch from BindTexture @Helium 0x3992c8 / 0x399315 with capId=0x2e — vtable slot target undecoded.",
  );
}
/** HGHandler::<vtable slot 0xa8> — "FinalizeTexture()". Frontier. */
function HGHandler_vslot_a8_finalizeTexture(_h: HGHandler): void {
  throw new Error(
    "HGHandler::<vtable slot 0xa8> (FinalizeTexture) not yet transcribed: virtual dispatch from BindTexture @Helium 0x3992dc — vtable slot target undecoded.",
  );
}
/** HGHandler::<vtable slot 0x88> — "SetShaderParam4f(slot, x, y, z, w)". Frontier. */
function HGHandler_vslot88_setShaderParam4f(
  _h: HGHandler,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void {
  throw new Error(
    "HGHandler::<vtable slot 0x88> (SetShaderParam4f) not yet transcribed: virtual dispatch from BindTexture @Helium 0x39938d — vtable slot target undecoded.",
  );
}

/** HgcApply3DLUTTetrahedralUniform_basekernel::BindTexture @Helium 0x399270.
 *  Handles which=0 (source image) and which=1 (3D LUT + hg_Params[3] tex
 *  xform). Returns 0 on success, -1 on invalid `which`. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_BindTexture(
  self: HgcApply3DLUTTetrahedralUniform_basekernel,
  handler: HGHandler,
  which: number,
): number {
  // @0x39927a-@0x399286 which not in {0,1} -> -1.
  const w = which | 0;
  if (w !== 0 && w !== 1) return -1;

  if (w === 0) {
    // _tex0: source-image texture path.
    HGHandler_vslot48_setActiveTexture(handler, 0, 0); // @0x399298
    HGHandler_vslot30_setSampler(handler, 0, 0); // @0x3992a5
    HGHandler_TexCoord(handler, 0, 0, 0, null); // @0x3992b4

    // @0x3992b9-@0x3992c8 query cap 0x2e on frame_handler.
    const fh = self.frame_handler_at_0x90;
    if (fh === null) {
      throw new Error(
        "HgcApply3DLUTTetrahedralUniform_basekernel::BindTexture @Helium 0x3992b9: self.frame_handler_at_0x90 is null but disasm dereferences it unconditionally as `movq 0x90(%r14),%rdi` — caller invariant violated.",
      );
    }
    const cap = FrameHandler_vslot80_queryCap(fh, 0x2e); // @0x3992c8
    // @0x3992ce testl %eax,%eax ; jne _ret — cap != 0 short-circuits to return 0.
    if ((cap | 0) !== 0) return 0;
    // @0x3992dc handler->vslot_a8(handler) — finalize.
    HGHandler_vslot_a8_finalizeTexture(handler); // @0x3992dc
    return 0;
  }

  // _tex1: 3D LUT texture path.
  HGHandler_vslot48_setActiveTexture(handler, 1, 0); // @0x3992f6
  HGHandler_vslot30_setSampler(handler, 0, 0); // @0x399303
  const fh = self.frame_handler_at_0x90;
  if (fh === null) {
    throw new Error(
      "HgcApply3DLUTTetrahedralUniform_basekernel::BindTexture @Helium 0x399306: self.frame_handler_at_0x90 is null but disasm dereferences it unconditionally as `movq 0x90(%r14),%rdi` — caller invariant violated.",
    );
  }
  const cap = FrameHandler_vslot80_queryCap(fh, 0x2e); // @0x399315

  // @0x39931b-@0x399324 load dst_w, dst_h as f32 unconditionally (both
  // branches will consume them: the "cap != 0" branch overwrites xmm2/xmm3
  // with a constant 1.0 but still passes xmm0/xmm1 = (dst_w, dst_h).
  const dstW = Math.fround(self.dst_w_at_0xf0 | 0);
  const dstH = Math.fround(self.dst_h_at_0xf4 | 0);

  let scaleU: number;
  let scaleV: number;
  if ((cap | 0) !== 0) {
    // @0x399334 xmm2 = f32 const at VA 0x3c7cc0 (= 1.0f — a shared 1.0 in
    // Helium's f32 const pool; verified below). Both xmm2 and xmm3 become
    // 1.0, meaning: with the framebuffer-cap on, the shader is fed
    // hg_Params[3].zw = (1.0, 1.0) — full-texture-normalized coordinates.
    scaleU = 1.0;
    scaleV = 1.0;
  } else {
    // @0x399349-@0x399372: xmm4 = src_w, xmm5 = src_h.
    // @0x39936a xmm3 = f32 const at VA 0x3c7cc0 (same 1.0f as above).
    // @0x39937a xmm2 = 1.0 / src_w ; @0x39937e xmm3 = 1.0 / src_h.
    const srcW = ((self.src_x1_at_0xe4 | 0) - (self.src_x0_at_0xdc | 0)) | 0;
    const srcH = ((self.src_y1_at_0xe8 | 0) - (self.src_y0_at_0xe0 | 0)) | 0;
    scaleU = Math.fround(1.0 / Math.fround(srcW));
    scaleV = Math.fround(1.0 / Math.fround(srcH));
  }

  // @0x39938d handler->vslot88(handler, 3, dstW, dstH, scaleU, scaleV) —
  // uploads hg_Params[3] = (dstW, dstH, scaleU, scaleV). NOTE: the ctor
  // rows 10/11 preload hg_Params[3].xy = (0.5, 0.5) — that's the shader-
  // side "half-texel offset"; the (dstW, dstH, scaleU, scaleV) uploaded
  // HERE will end up in float4 slot 3 via whatever the handler's slot-88
  // API maps to. Faithfully match the arg tuple the disasm passes.
  HGHandler_vslot88_setShaderParam4f(handler, 3, dstW, dstH, scaleU, scaleV);
  return 0;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::GetProgram(HGRenderer*) @Helium 0x398eb0
//
//   @0x398eb4  movq  %rsi, %rdi
//   @0x398eb7  movl  $0x60000, %esi
//   @0x398ebc  callq HGRenderer::GetTarget(unsigned int)
//   @0x398ec1  xorl  %ecx, %ecx
//   @0x398ec3  cmpl  $0x60b10, %eax
//   @0x398ec8  leaq  0x63be62(%rip), %rax             ; rax = &metal_source_pool_string
//   @0x398ecf  cmoveq %rax, %rcx                       ; if (eax == 0x60b10) rcx = string ptr
//   @0x398ed3  movq  %rcx, %rax ; retq
//
// If HGRenderer::GetTarget(0x60000) reports the renderer supports Metal 1.0
// (id 0x60b10), return the Metal-1.0 fragment shader source string. Otherwise
// return NULL (the caller then uses InitProgramDescriptor's compiled path).
//
// The Metal source string @VA (0x398ecc+7)+0x63be62 = 0x3d4d35 is 3721
// characters (LEN=0x0e89) and is the tetrahedral 3D-LUT fragment shader
// quoted verbatim in raw-port/re/disasm/Helium.HgcApply3DLUTTetrahedralUniform_basekernel.GetProgram.s.
// Its md5 (from the trailing comment) is a220cc55:c2718b3d:efb1f626:1df26c2c.
// -----------------------------------------------------------------------------

/** The pointer returned from GetProgram — a C string (immutable Metal
 *  shader source) or null. We surface it as a plain string handle for TS
 *  callers (no need to model the C-string bytes). */
export type MetalShaderSourcePtr = string | null;

/** HGRenderer::GetTarget(unsigned int) — @Helium
 *  __ZN10HGRenderer9GetTargetEj. Frontier stub. */
function HGRenderer_GetTarget(
  _renderer: HGRenderer,
  _queryId: number,
): number {
  throw new Error(
    "HGRenderer::GetTarget(unsigned int) not yet transcribed: called from GetProgram @Helium 0x398ebc and RenderTile @Helium 0x399f87 as an undecoded frontier symbol.",
  );
}

/** HgcApply3DLUTTetrahedralUniform_basekernel::GetProgram @Helium 0x398eb0.
 *  Returns the Metal-1.0 fragment shader source string when the renderer
 *  reports Metal 1.0 target id 0x60b10, else null. The actual string is
 *  stored in the framework's cstring section — we surface it via the
 *  METAL_1_0_FRAGMENT_SHADER_SRC constant below (byte-for-byte the source
 *  quoted in the disasm at VA 0x3d4d35, len 0x0e89). */
export function HgcApply3DLUTTetrahedralUniform_basekernel_GetProgram(
  _self: HgcApply3DLUTTetrahedralUniform_basekernel,
  renderer: HGRenderer,
): MetalShaderSourcePtr {
  // @0x398eb7 movl $0x60000, %esi ; @0x398ebc callq HGRenderer::GetTarget
  const target = HGRenderer_GetTarget(renderer, GETPROGRAM_TARGET_CLASS_QUERY);
  // @0x398ec3 cmpl $0x60b10, %eax ; @0x398ecf cmoveq — return pointer only
  // when target == 0x60b10.
  if ((target | 0) === GETPROGRAM_TARGET_CLASS_METAL) {
    return METAL_1_0_FRAGMENT_SHADER_SRC;
  }
  return null;
}

/** The Metal-1.0 fragment shader source returned by GetProgram. Byte-for-byte
 *  the literal-pool string quoted in the GetProgram disasm at VA 0x3d4d35
 *  (framework RIP-relative from @0x398ecc + 0x63be62). LEN=0x0e89 (=3721)
 *  as declared by the string's own "//LEN=" preamble. This IS the ground
 *  truth of the tetrahedral-uniform 3D-LUT-apply math — the CPU RenderTile
 *  paths mirror it in SSE/AVX. md5=a220cc55:c2718b3d:efb1f626:1df26c2c. */
export const METAL_1_0_FRAGMENT_SHADER_SRC =
  '//Metal1.0     \n' +
  '//LEN=0000000e89\n' +
  'fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n' +
  '    const constant float4* hg_Params [[ buffer(0) ]], \n' +
  '    texture2d< float > hg_Texture0 [[ texture(0) ]], \n' +
  '    sampler hg_Sampler0 [[ sampler(0) ]], \n' +
  '    texture2d< float > hg_Texture1 [[ texture(1) ]], \n' +
  '    sampler hg_Sampler1 [[ sampler(1) ]])\n' +
  '{\n' +
  '    const float4 c0 = float4(1.000000000, 0.000000000, 0.5000000000, 0.000000000);\n' +
  '    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18, r19;\n' +
  '    FragmentOut output;\n' +
  '\n' +
  '    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n' +
  '    r1.xyz = r0.xyz*hg_Params[0].xxx + hg_Params[0].yyy;\n' +
  '    r2.xyz = hg_Params[1].yyy - c0.xxx;\n' +
  '    r1.xyz = r1.xyz*r2.xyz;\n' +
  '    r1.xyz = fmax(r1.xyz, c0.yyy);\n' +
  '    r1.xyz = fmin(r1.xyz, r2.xyz);\n' +
  '    r3.xyz = fract(r1.xyz);\n' +
  '    r1.xyz = floor(r1.xyz);\n' +
  '    r4.xyz = r1.xyz + c0.xxx;\n' +
  '    r4.xyz = fmin(r4.xyz, r2.xyz);\n' +
  '    r4.xyz = r4.xyz - r1.xyz;\n' +
  '    r4.xyz = r4.xyz*hg_Params[1].xyz;\n' +
  '    r2.x = dot(r1.xy, hg_Params[1].xy);\n' +
  '    r2.y = r1.z;\n' +
  '    r2.xy = r2.xy + c0.zz;\n' +
  '    r1.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r1.xy = r1.xy*hg_Params[3].zw;\n' +
  '    r1 = hg_Texture1.sample(hg_Sampler1, r1.xy);\n' +
  '    r2.x = r2.x + r4.x;\n' +
  '    r5.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r5.xy = r5.xy*hg_Params[3].zw;\n' +
  '    r5 = hg_Texture1.sample(hg_Sampler1, r5.xy);\n' +
  '    r2.x = r2.x + r4.y;\n' +
  '    r6.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r6.xy = r6.xy*hg_Params[3].zw;\n' +
  '    r6 = hg_Texture1.sample(hg_Sampler1, r6.xy);\n' +
  '    r2.x = r2.x - r4.x;\n' +
  '    r7.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r7.xy = r7.xy*hg_Params[3].zw;\n' +
  '    r7 = hg_Texture1.sample(hg_Sampler1, r7.xy);\n' +
  '    r2.y = r2.y + r4.z;\n' +
  '    r8.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r8.xy = r8.xy*hg_Params[3].zw;\n' +
  '    r8 = hg_Texture1.sample(hg_Sampler1, r8.xy);\n' +
  '    r2.x = r2.x - r4.y;\n' +
  '    r9.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r9.xy = r9.xy*hg_Params[3].zw;\n' +
  '    r9 = hg_Texture1.sample(hg_Sampler1, r9.xy);\n' +
  '    r2.x = r2.x + r4.x;\n' +
  '    r10.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r10.xy = r10.xy*hg_Params[3].zw;\n' +
  '    r10 = hg_Texture1.sample(hg_Sampler1, r10.xy);\n' +
  '    r2.x = r2.x + r4.y;\n' +
  '    r2.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r2.xy = r2.xy*hg_Params[3].zw;\n' +
  '    r2 = hg_Texture1.sample(hg_Sampler1, r2.xy);\n' +
  '    r4 = float4(r3.xzzy > r3.yxyz);\n' +
  '    r11.x = float(r3.y > r3.x);\n' +
  '    r12 = float4(r3.yxxz >= r3.xyzy);\n' +
  '    r13 = r2 - r8;\n' +
  '    r14 = r7 - r1;\n' +
  '    r15 = r8 - r7;\n' +
  '    r16 = r13*r3.xxxx;\n' +
  '    r16 = r14*r3.yyyy + r16;\n' +
  '    r15 = r15*r3.zzzz + r16;\n' +
  '    r16 = r10 - r9;\n' +
  '    r17 = r2 - r10;\n' +
  '    r18 = r9 - r1;\n' +
  '    r16 = r16*r3.xxxx;\n' +
  '    r16 = r17*r3.yyyy + r16;\n' +
  '    r16 = r18*r3.zzzz + r16;\n' +
  '    r19 = fmin(r4.xxxx, r4.yyyy);\n' +
  '    r15 = select(r15, r16, r19 > 0.00000f);\n' +
  '    r8 = r8 - r9;\n' +
  '    r13 = r13*r3.xxxx;\n' +
  '    r13 = r8*r3.yyyy + r13;\n' +
  '    r13 = r18*r3.zzzz + r13;\n' +
  '    r19 = fmin(r12.xxxx, r4.zzzz);\n' +
  '    r15 = select(r15, r13, r19 > 0.00000f);\n' +
  '    r16 = r5 - r1;\n' +
  '    r9 = r6 - r5;\n' +
  '    r2 = r2 - r6;\n' +
  '    r8 = r16*r3.xxxx;\n' +
  '    r8 = r9*r3.yyyy + r8;\n' +
  '    r8 = r2*r3.zzzz + r8;\n' +
  '    r4 = fmin(r4.wwww, r12.yyyy);\n' +
  '    r15 = select(r15, r8, r4 > 0.00000f);\n' +
  '    r6 = r6 - r7;\n' +
  '    r6 = r6*r3.xxxx;\n' +
  '    r6 = r14*r3.yyyy + r6;\n' +
  '    r6 = r2*r3.zzzz + r6;\n' +
  '    r11 = fmin(r12.zzzz, r11.xxxx);\n' +
  '    r15 = select(r15, r6, r11 > 0.00000f);\n' +
  '    r10 = r10 - r5;\n' +
  '    r16 = r16*r3.xxxx;\n' +
  '    r16 = r17*r3.yyyy + r16;\n' +
  '    r16 = r10*r3.zzzz + r16;\n' +
  '    r12 = fmin(r12.wwww, r12.zzzz);\n' +
  '    r12 = select(r15, r16, r12 > 0.00000f);\n' +
  '    r12 = r12 + r1;\n' +
  '    r12 = r12*hg_Params[0].zzzz + hg_Params[0].wwww;\n' +
  '    output.color0 = select(r12, r0, hg_Params[2] < 0.00000f);\n' +
  '    return output;\n' +
  '}\n' +
  '//MD5=a220cc55:c2718b3d:efb1f626:1df26c2c\n' +
  '//SIG=00000000:00000001:00000001:00000000:0001:0004:0014:0000:0000:0000:0002:0000:0001:02:0:1:0\n';

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::shaderDescription() @Helium 0x399210
//
//   @0x399216  movq  %rdi, %rbx
//   @0x399219  movl  $0x38, %edi ; @0x39921e callq operator new(0x38)
//   @0x399223  movq  %rax, 0x10(%rbx)                ; result.data_ptr = new_ptr
//   @0x399227  movq  $0x39, (%rbx)                   ; result.length = 0x39 = 57 (includes NUL slot?)
//   @0x39922e  movq  $0x31, 0x8(%rbx)                ; result.capacity_shift-or-similar = 0x31 = 49? see below
//   ; The three movups at 0x39ac36/0x39ac41/0x39ac4c write "HgcApply3DLUTTetrahedralUniform_basekernel [hgc1]"
//   ; (48 chars + NUL + padding to fit 0x38 bytes) into new_ptr, in three
//   ; 16-byte tail-first slices from the class's cstring pool:
//   ;   [+0x20]  "basekernel [hgc1]"                          (17 bytes @0x63ca00)
//   ;   [+0x10]  "rahedralUniform_basekernel [hgc1]"          (33 bytes @0x63c9e5 — overlaps tail)
//   ;   [+0x00]  "HgcApply3DLUTTetrahedralUniform_basekernel [hgc1]" (49 bytes @0x63c9ca — overlaps tail)
//   ; The literal at 0x63c9ca is the FULL string and the two others are
//   ; suffixes at overlapping addresses — the three movups paint the
//   ; storage in overlapping 16-byte slices ending with 0x63c9ca's tail.
//   @0x399256  movw  $0x5d, 0x30(%rax)               ; new_ptr[0x30] = 0x5d = ']'  (LAST byte)
//   @0x39925c  movq  %rbx, %rax ; return &result
//
// Returns an `HGString*`-like small-string header packed into whatever the
// caller allocated at %rbx. The header layout at %rbx:
//   [+0x00] uint64  length = 0x39
//   [+0x08] uint64  capacity or flag = 0x31
//   [+0x10] char*   data (heap-allocated, 0x38 bytes owned)
// -----------------------------------------------------------------------------

/** operator new(size_t) — @Helium __Znwm. Frontier stub. */
function operator_new(_size: number): unknown {
  throw new Error(
    "operator new(unsigned long) not yet transcribed: called from HgcApply3DLUTTetrahedralUniform_basekernel::shaderDescription @Helium 0x39921e as an undecoded frontier symbol.",
  );
}

/** An HGString-shaped struct (48-byte header + owned char* buffer). */
export interface HGStringHeader {
  length_at_0x00: number;
  capOrFlag_at_0x08: number;
  data_at_0x10: string;
}

/** HgcApply3DLUTTetrahedralUniform_basekernel::shaderDescription @Helium 0x399210.
 *  Fills the caller-allocated `result` with the class name+"[hgc1]" tag.
 *  See disasm block above for the header shape and the 3-slice cstring
 *  paint. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_shaderDescription(
  result: HGStringHeader,
): HGStringHeader {
  // @0x399219 operator new(0x38) — frontier. We can't invoke the raw
  // allocator, but the SEMANTIC of this function (produce a string owning
  // this exact 48-char + ']' tail = "HgcApply3DLUTTetrahedralUniform_basekernel [hgc1]") IS decoded:
  //
  //   - The three cstring source addresses at 0x63c9ca / 0x63c9e5 / 0x63ca00
  //     are OVERLAPPING pointers into the SAME cstring literal, chosen to
  //     write the string in reverse 16-byte slices ending at the same
  //     terminator. The final visible content is the full string.
  //   - Then @0x399256 writes ']' at [+0x30]. Given the string ends with
  //     "[hgc1]" (whose ']' would land at position 47), writing ']' at
  //     +0x30 = position 48 places the terminator AFTER the visible string.
  //     length_at_0x00 = 0x39 = 57 — larger than the 49-char visible string
  //     because the disasm's length field seems to include additional
  //     header/tag bytes.
  //
  // We ALSO can't allocate on the caller's exact struct, so we mutate the
  // passed-in `result` in place — matching the ABI at the interface level
  // rather than at the heap level.
  operator_new(0x38); // documents the allocation; frontier throws.
  result.length_at_0x00 = 0x39;
  result.capOrFlag_at_0x08 = 0x31;
  result.data_at_0x10 = 'HgcApply3DLUTTetrahedralUniform_basekernel [hgc1]';
  return result;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::InitProgramDescriptor(HGProgramDescriptor*) @Helium 0x398ee0
//
// 191 lines of shader-descriptor plumbing:
//   @0x398efb-@0x398f02  desc->SetVisibleShaderWithSource("HgcApply3DLUTTetrahedralUniform_basekernel_hgc_visible",
//                                                        <Metal 1.0 [[visible]] fragment shader source, LEN=0x0d5b>)
//   @0x398f07-@0x398f11  desc->SetFragmentFunctionName("HgcApply3DLUTTetrahedralUniform_basekernel")
//   @0x398f16-@0x398f58  build a stack HGBinding("FragmentOut", type=0x4, ...) and pass to desc->SetReturnBinding
//   @0x398f5d-@0x398f6a  destroy inline HGBinding storage if flagged
//   @0x398f6f-...         two std::vector<HGBinding>::emplace_back calls to declare the two "float4" inputs
//                        (matching the shader's `color0` param and its "hg_Texture1/hg_Sampler1" binding)
//   ...191 lines total, ending in the vector destruction cleanup.
//
// The BUSINESS content of this function is entirely the string constants
// it writes into the HGProgramDescriptor. The Metal [[visible]] source
// (a 3419-byte second copy of the tetrahedral math, LEN=0x0d5b) is
// present verbatim in the disasm and semantically equivalent to
// METAL_1_0_FRAGMENT_SHADER_SRC (both implement the SAME tetrahedral
// interpolator — the [[visible]] one takes `color0` as an argument
// instead of sampling hg_Texture0).
//
// A faithful line-by-line port of this method needs decoded stubs for
// HGProgramDescriptor::SetVisibleShaderWithSource / SetFragmentFunctionName /
// SetReturnBinding, and the std::vector<HGBinding>::__emplace_back_slow_path
// interface — all of which are frontier symbols today. Rather than paint
// over them, this method is kept as an explicit throwing stub citing
// every callee's @Helium address; the two shader source strings ARE
// decoded and exposed below as named constants so downstream ports can
// reuse them without re-decoding the disasm.
// -----------------------------------------------------------------------------

/** HGProgramDescriptor::SetVisibleShaderWithSource — @Helium
 *  __ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_. Frontier stub. */
function HGProgramDescriptor_SetVisibleShaderWithSource(
  _desc: HGProgramDescriptor,
  _name: string,
  _source: string,
): void {
  throw new Error(
    "HGProgramDescriptor::SetVisibleShaderWithSource not yet transcribed: called from InitProgramDescriptor @Helium 0x398f02 as an undecoded frontier symbol.",
  );
}

/** HGProgramDescriptor::SetFragmentFunctionName — @Helium
 *  __ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc. Frontier stub. */
function HGProgramDescriptor_SetFragmentFunctionName(
  _desc: HGProgramDescriptor,
  _name: string,
): void {
  throw new Error(
    "HGProgramDescriptor::SetFragmentFunctionName not yet transcribed: called from InitProgramDescriptor @Helium 0x398f11 as an undecoded frontier symbol.",
  );
}

/** HGProgramDescriptor::SetReturnBinding(HGBinding) — @Helium
 *  __ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding. Frontier stub. */
function HGProgramDescriptor_SetReturnBinding(
  _desc: HGProgramDescriptor,
  _binding: HGBinding,
): void {
  throw new Error(
    "HGProgramDescriptor::SetReturnBinding not yet transcribed: called from InitProgramDescriptor @Helium 0x398f58 as an undecoded frontier symbol.",
  );
}

/** std::vector<HGBinding>::__emplace_back_slow_path — the STL out-of-line
 *  reserve+move path. Frontier stub. */
function vectorHGBinding_emplace_back_slow_path(
  _vec: HGBinding[],
  _val: HGBinding,
): HGBinding {
  throw new Error(
    "std::vector<HGBinding>::__emplace_back_slow_path not yet transcribed: called from InitProgramDescriptor @Helium 0x398fad and downstream emplace sites as an undecoded frontier symbol.",
  );
}

/** HGBinding — a small tagged binding struct populated by
 *  InitProgramDescriptor's stack builders. Fields recovered from the
 *  offsets read/written in the disasm: */
export interface HGBinding {
  /** @-0x60(%rbp) written @0x398f7e as $0x2 (a "float4" type code)
   *  and @0x398fc9 as $0xa (a different type code, likely "texture2d"). */
  type_at_0x00: number;
  /** @-0x58(%rbp) written @0x398f85 as $0xc (the C-string small-string
   *  tag = 12 chars inline). */
  smallStringTag_at_0x08: number;
  /** @-0x57(%rbp) inline C-string "float4\0" packed as three imm-writes
   *  ($0x616f6c66, $0x3474, $0x00). */
  inlineName_at_0x09: string;
  /** @-0x40(%rbp) 16-byte payload copied from a source-pool xmm0 load
   *  (movaps 0x4f38af(%rip) @0x398f9a and its siblings). */
  payload_at_0x18: Float32Array;
}

/** The [[visible]] Metal 1.0 fragment shader source string emitted by
 *  InitProgramDescriptor at @0x398ef8 (RIP-target VA (0x398f01)+0x63cd50
 *  = 0x9d5c51). LEN=0x0d5b (=3419) as declared by its own "//LEN=".
 *
 *  Same tetrahedral interpolation math as
 *  METAL_1_0_FRAGMENT_SHADER_SRC, but declared as a `[[ visible ]]`
 *  function taking `color0` as a parameter (instead of sampling
 *  hg_Texture0 from stage-in texcoords) — this is the "callable" variant
 *  used when this kernel is inlined into a bigger fragment program. */
export const METAL_1_0_VISIBLE_SHADER_SRC =
  '//Metal1.0     \n' +
  '//LEN=0000000d5b\n' +
  '[[ visible ]] FragmentOut HgcApply3DLUTTetrahedralUniform_basekernel_hgc_visible(const constant float4* hg_Params,\n' +
  '    float4 color0, \n' +
  '    texture2d< float > hg_Texture1, \n' +
  '    sampler hg_Sampler1)\n' +
  '{\n' +
  '    const float4 c0 = float4(1.000000000, 0.000000000, 0.5000000000, 0.000000000);\n' +
  '    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18, r19;\n' +
  '    FragmentOut output;\n' +
  '\n' +
  '    r0 = color0;\n' +
  '    r1.xyz = r0.xyz*hg_Params[0].xxx + hg_Params[0].yyy;\n' +
  '    r2.xyz = hg_Params[1].yyy - c0.xxx;\n' +
  '    r1.xyz = r1.xyz*r2.xyz;\n' +
  '    r1.xyz = fmax(r1.xyz, c0.yyy);\n' +
  '    r1.xyz = fmin(r1.xyz, r2.xyz);\n' +
  '    r3.xyz = fract(r1.xyz);\n' +
  '    r1.xyz = floor(r1.xyz);\n' +
  '    r4.xyz = r1.xyz + c0.xxx;\n' +
  '    r4.xyz = fmin(r4.xyz, r2.xyz);\n' +
  '    r4.xyz = r4.xyz - r1.xyz;\n' +
  '    r4.xyz = r4.xyz*hg_Params[1].xyz;\n' +
  '    r2.x = dot(r1.xy, hg_Params[1].xy);\n' +
  '    r2.y = r1.z;\n' +
  '    r2.xy = r2.xy + c0.zz;\n' +
  '    r1.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r1.xy = r1.xy*hg_Params[3].zw;\n' +
  '    r1 = hg_Texture1.sample(hg_Sampler1, r1.xy);\n' +
  '    r2.x = r2.x + r4.x;\n' +
  '    r5.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r5.xy = r5.xy*hg_Params[3].zw;\n' +
  '    r5 = hg_Texture1.sample(hg_Sampler1, r5.xy);\n' +
  '    r2.x = r2.x + r4.y;\n' +
  '    r6.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r6.xy = r6.xy*hg_Params[3].zw;\n' +
  '    r6 = hg_Texture1.sample(hg_Sampler1, r6.xy);\n' +
  '    r2.x = r2.x - r4.x;\n' +
  '    r7.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r7.xy = r7.xy*hg_Params[3].zw;\n' +
  '    r7 = hg_Texture1.sample(hg_Sampler1, r7.xy);\n' +
  '    r2.y = r2.y + r4.z;\n' +
  '    r8.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r8.xy = r8.xy*hg_Params[3].zw;\n' +
  '    r8 = hg_Texture1.sample(hg_Sampler1, r8.xy);\n' +
  '    r2.x = r2.x - r4.y;\n' +
  '    r9.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r9.xy = r9.xy*hg_Params[3].zw;\n' +
  '    r9 = hg_Texture1.sample(hg_Sampler1, r9.xy);\n' +
  '    r2.x = r2.x + r4.x;\n' +
  '    r10.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r10.xy = r10.xy*hg_Params[3].zw;\n' +
  '    r10 = hg_Texture1.sample(hg_Sampler1, r10.xy);\n' +
  '    r2.x = r2.x + r4.y;\n' +
  '    r2.xy = r2.xy + hg_Params[3].xy;\n' +
  '    r2.xy = r2.xy*hg_Params[3].zw;\n' +
  '    r2 = hg_Texture1.sample(hg_Sampler1, r2.xy);\n' +
  '    r4 = float4(r3.xzzy > r3.yxyz);\n' +
  '    r11.x = float(r3.y > r3.x);\n' +
  '    r12 = float4(r3.yxxz >= r3.xyzy);\n' +
  '    r13 = r2 - r8;\n' +
  '    r14 = r7 - r1;\n' +
  '    r15 = r8 - r7;\n' +
  '    r16 = r13*r3.xxxx;\n' +
  '    r16 = r14*r3.yyyy + r16;\n' +
  '    r15 = r15*r3.zzzz + r16;\n' +
  '    r16 = r10 - r9;\n' +
  '    r17 = r2 - r10;\n' +
  '    r18 = r9 - r1;\n' +
  '    r16 = r16*r3.xxxx;\n' +
  '    r16 = r17*r3.yyyy + r16;\n' +
  '    r16 = r18*r3.zzzz + r16;\n' +
  '    r19 = fmin(r4.xxxx, r4.yyyy);\n' +
  '    r15 = select(r15, r16, r19 > 0.00000f);\n' +
  '    r8 = r8 - r9;\n' +
  '    r13 = r13*r3.xxxx;\n' +
  '    r13 = r8*r3.yyyy + r13;\n' +
  '    r13 = r18*r3.zzzz + r13;\n' +
  '    r19 = fmin(r12.xxxx, r4.zzzz);\n' +
  '    r15 = select(r15, r13, r19 > 0.00000f);\n' +
  '    r16 = r5 - r1;\n' +
  '    r9 = r6 - r5;\n' +
  '    r2 = r2 - r6;\n' +
  '    r8 = r16*r3.xxxx;\n' +
  '    r8 = r9*r3.yyyy + r8;\n' +
  '    r8 = r2*r3.zzzz + r8;\n' +
  '    r4 = fmin(r4.wwww, r12.yyyy);\n' +
  '    r15 = select(r15, r8, r4 > 0.00000f);\n' +
  '    r6 = r6 - r7;\n' +
  '    r6 = r6*r3.xxxx;\n' +
  '    r6 = r14*r3.yyyy + r6;\n' +
  '    r6 = r2*r3.zzzz + r6;\n' +
  '    r11 = fmin(r12.zzzz, r11.xxxx);\n' +
  '    r15 = select(r15, r6, r11 > 0.00000f);\n' +
  '    r10 = r10 - r5;\n' +
  '    r16 = r16*r3.xxxx;\n' +
  '    r16 = r17*r3.yyyy + r16;\n' +
  '    r16 = r10*r3.zzzz + r16;\n' +
  '    r12 = fmin(r12.wwww, r12.zzzz);\n' +
  '    r12 = select(r15, r16, r12 > 0.00000f);\n' +
  '    r12 = r12 + r1;\n' +
  '    r12 = r12*hg_Params[0].zzzz + hg_Params[0].wwww;\n' +
  '    output.color0 = select(r12, r0, hg_Params[2] < 0.00000f);\n' +
  '    return output;\n' +
  '}\n';

/** InitProgramDescriptor @Helium 0x398ee0. Fills the HGProgramDescriptor
 *  with the [[visible]] Metal-1.0 tetrahedral 3D-LUT shader source, the
 *  fragment function name "HgcApply3DLUTTetrahedralUniform_basekernel",
 *  a FragmentOut return binding, and two "float4" input bindings via
 *  std::vector<HGBinding> emplace_back calls.
 *
 *  Kept as a throwing stub: the four callee interfaces
 *  (SetVisibleShaderWithSource, SetFragmentFunctionName, SetReturnBinding,
 *  vector<HGBinding>::__emplace_back_slow_path) are undecoded frontier
 *  symbols; the two Metal shader sources ARE decoded (see
 *  METAL_1_0_FRAGMENT_SHADER_SRC and METAL_1_0_VISIBLE_SHADER_SRC). */
export function HgcApply3DLUTTetrahedralUniform_basekernel_InitProgramDescriptor(
  _self: HgcApply3DLUTTetrahedralUniform_basekernel,
  _desc: HGProgramDescriptor,
): void {
  throw new Error(
    "HgcApply3DLUTTetrahedralUniform_basekernel::InitProgramDescriptor @Helium 0x398ee0 not yet transcribed: 191-line STL-vector + HGProgramDescriptor plumbing whose callees HGProgramDescriptor::SetVisibleShaderWithSource @Helium 0x398f02, HGProgramDescriptor::SetFragmentFunctionName @Helium 0x398f11, HGProgramDescriptor::SetReturnBinding @Helium 0x398f58, and std::vector<HGBinding>::__emplace_back_slow_path @Helium 0x398fad are all undecoded frontier symbols (Metal shader source strings ARE decoded — see METAL_1_0_FRAGMENT_SHADER_SRC and METAL_1_0_VISIBLE_SHADER_SRC).",
  );
  // Unreachable — retained so imports/refs stay live in the type graph.
  HGProgramDescriptor_SetVisibleShaderWithSource(
    _desc,
    'HgcApply3DLUTTetrahedralUniform_basekernel_hgc_visible',
    METAL_1_0_VISIBLE_SHADER_SRC,
  );
  HGProgramDescriptor_SetFragmentFunctionName(
    _desc,
    'HgcApply3DLUTTetrahedralUniform_basekernel',
  );
  const returnBinding: HGBinding = {
    type_at_0x00: 0x4,
    smallStringTag_at_0x08: 0x16,
    inlineName_at_0x09: 'FragmentOut',
    payload_at_0x18: new Float32Array(4),
  };
  HGProgramDescriptor_SetReturnBinding(_desc, returnBinding);
  const inputs: HGBinding[] = [];
  vectorHGBinding_emplace_back_slow_path(inputs, {
    type_at_0x00: 0x2,
    smallStringTag_at_0x08: 0xc,
    inlineName_at_0x09: 'float4',
    payload_at_0x18: new Float32Array(4),
  });
  vectorHGBinding_emplace_back_slow_path(inputs, {
    type_at_0x00: 0xa,
    smallStringTag_at_0x08: 0xc,
    inlineName_at_0x09: 'float4',
    payload_at_0x18: new Float32Array(4),
  });
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::RenderTile(HGTile*) @Helium 0x399f60
//
// 658 lines of x86 that:
//   1. Reads HGTile::Renderer() (@0x399f7d) and HGRenderer::GetTarget(0)
//      (@0x399f87).
//   2. If renderer >= 0x4700000 -> tail-call RenderTile_AVX (@0x399f99).
//   3. Otherwise reads tile.rect (16 bytes @[rbx+0x00]), tile.dst_stride
//      (0x58), tile.src_ptr (0x50), tile.dst_ptr (0x10), tile.src_stride
//      (0x18), then runs one of two SSE inner loops selected on
//      renderer <= 0x44fffff (@0x399ff1) — the "fully-scalar" fallback
//      (@0x39a533) or the SSE-packed tetrahedral evaluator (@0x39a007
//      onward). The packed loop consumes hg_Params[0..3] from
//      self.params_at_0x198 and does the SAME tetrahedral interpolation
//      whose textual form is in METAL_1_0_FRAGMENT_SHADER_SRC above.
//
// A faithful per-instruction port of RenderTile / RenderTile_AVX is
// approximately 1200 lines of SSE/AVX pseudocode. This file transcribes
// the class's WRAPPER surface (ctor, dtor, param buffer, virtuals, and
// the Metal shader constants that ARE the ground-truth math); the two
// packed CPU render paths are kept as decoded-frontier stubs so the
// gate can see the gap.
// -----------------------------------------------------------------------------

/** HGTile::Renderer() const — @Helium __ZNK6HGTile8RendererEv. Frontier. */
function HGTile_Renderer(_tile: HGTile): HGRenderer {
  throw new Error(
    "HGTile::Renderer() const not yet transcribed: called from HgcApply3DLUTTetrahedralUniform_basekernel::RenderTile @Helium 0x399f7d as an undecoded frontier symbol.",
  );
}

/** HgcApply3DLUTTetrahedralUniform_basekernel::RenderTile @Helium 0x399f60.
 *
 *  Dispatches to RenderTile_AVX for renderer feature-levels >= 0x4700000
 *  (@0x399f8c-@0x399f99); otherwise runs one of two SSE-packed inner
 *  loops depending on renderer <= 0x44fffff (@0x399ff1). The SSE math
 *  matches METAL_1_0_FRAGMENT_SHADER_SRC.
 *
 *  Kept as a decoded-frontier stub — the 658-line SSE tetrahedral
 *  evaluator is a separate leaf. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_RenderTile(
  _self: HgcApply3DLUTTetrahedralUniform_basekernel,
  _tile: HGTile,
): number {
  throw new Error(
    "HgcApply3DLUTTetrahedralUniform_basekernel::RenderTile @Helium 0x399f60 not yet transcribed: 658-line SSE-packed tetrahedral 3D-LUT evaluator (dispatches to RenderTile_AVX @Helium 0x399f99 for renderer>=0x4700000; SSE inner loop begins @Helium 0x39a007 for renderer>0x44fffff; scalar fallback @Helium 0x39a533 for renderer<=0x44fffff). Callee HGTile::Renderer @Helium 0x399f7d and HGRenderer::GetTarget @Helium 0x399f87 also frontier. Math IS the Metal shader (see METAL_1_0_FRAGMENT_SHADER_SRC).",
  );
  // Unreachable — kept live so RenderTile_AVX referenced.
  HGTile_Renderer(_tile);
  HgcApply3DLUTTetrahedralUniform_basekernel_RenderTile_AVX(_self, _tile);
  const _thresholds = RENDERTILE_AVX_THRESHOLD + RENDERTILE_SCALAR_THRESHOLD;
  return _thresholds & 0;
}

// -----------------------------------------------------------------------------
// HgcApply3DLUTTetrahedralUniform_basekernel::RenderTile_AVX(HGTile*) @Helium 0x399420
//
// 590 lines of AVX packed-single-precision tetrahedral 3D-LUT
// interpolation. Consumes hg_Params[0..3] from self.params_at_0x198 (via
// the offsets baked into the ctor: rows 0/1 at +0x00 = hg_Params[0]
// scale/bias/enable/postscale, rows 2/3 at +0x20 = hg_Params[1] grid
// xform, rows 4/5 at +0x40 = hg_Params[2] enable flag, rows 10/11 at
// +0xa0 = hg_Params[3] tex-coord bias/scale). Math IS
// METAL_1_0_FRAGMENT_SHADER_SRC.
// -----------------------------------------------------------------------------

/** HgcApply3DLUTTetrahedralUniform_basekernel::RenderTile_AVX @Helium 0x399420.
 *  590-line AVX packed-float tetrahedral 3D-LUT evaluator. Frontier stub. */
export function HgcApply3DLUTTetrahedralUniform_basekernel_RenderTile_AVX(
  _self: HgcApply3DLUTTetrahedralUniform_basekernel,
  _tile: HGTile,
): number {
  throw new Error(
    "HgcApply3DLUTTetrahedralUniform_basekernel::RenderTile_AVX @Helium 0x399420 not yet transcribed: 590-line AVX-packed tetrahedral 3D-LUT evaluator whose math mirrors METAL_1_0_FRAGMENT_SHADER_SRC (parameter buffer layout at self+0x198 is decoded — see PARAMS LAYOUT).",
  );
}
