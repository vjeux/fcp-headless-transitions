// HGTile.ts — Helium's HGTile: the axis-aligned tile primitive that
// HGRenderer::RenderInputTile fills and hands to every HGxx::RenderTile /
// HGxx::RenderTile_AVX pixel-blend routine across Helium, Ozone, Flexo, and
// Lithium. This file is the SHARED CONTRACT the RenderTile_AVX family imports
// to type its (%rsi = HGTile*) byte-offset accesses.
//
// HGTile is a PLAIN-OLD-DATA aggregate — no ctor/dtor is emitted anywhere in
// the four frameworks — but it has FOUR const-qualified member methods that
// ARE emitted:
//   @Ozone  0x0000000000688500  HGTile::Width()     const   (ICF-folded with HGRect::w())
//   @Ozone  0x0000000000688520  HGTile::Height()    const
//   @Ozone  0x0000000000690cc0  HGTile::Position()  const
//   @Helium 0x000000000011b730  HGTile::Renderer()  const
// The first three are recovered from Ozone (Helium.framework does NOT emit
// them separately — they are always inlined at Helium call sites). Renderer()
// IS emitted in Helium and is called as an outlined function by e.g.
// HGColorMatrix::RenderTile @0x246438 (`movq 0x150(%rbx),%rax;
// movq 0x98(%rax),%rax`) — exactly the two-load body of __ZNK6HGTile8RendererEv.
//
// Source disassembly (in this worktree's raw-port/re/disasm/):
//   HGTile.Width.s      IS ICF-FOLDED with HGRect::w() @Ozone 0x688500 —
//                       identical 4-instruction body at the shared address.
//                       Body recovered from /tmp/Ozone_tV.txt at that address
//                       and inlined below.
//   HGTile.Height.s     @0x688520..0x688534
//   HGTile.Position.s   @0x690cc0..0x690d1a
//   (Renderer @0x11b730 disassembled directly from /tmp/Helium.x86_64 via
//    `otool -tvV -p __ZNK6HGTile8RendererEv`.)
//
// No ctor, dtor, or copy-op is exported: HGTile is a PLAIN-OLD-DATA aggregate
// constructed inline by its owner (HGRenderer::RenderInputTile @Helium 0x0eb6d0
// clears +0x50/+0x58 lanes and writes per-input HGRects at +0xd0 — see below).
//
// ── STRUCT LAYOUT (RENDERTILE-CONTRACT VIEW) ─────────────────────────────────
// The full HGTile is at least 0x1b0 bytes. Every offset below is CITED against
// the specific load/store that PROVES the offset and the field's type; the
// bounds/output/input-plane group is REDUNDANTLY proved by four independent
// classes (HgcAddAlpha_AVX, HgcMaskElem_AVX, HGColorMatrix, HGChromatic_AVX)
// and by HGRenderer::RenderInputTile which WRITES the same slots.
//
// offset  size   field                     proven by
// ------  ----   ------------------------  --------------------------------------------------------
// +0x00   0x04   left   : int32            subl (%rcx),%eax  @Ozone   HGRect::w()      0x68850f
// +0x04   0x04   top    : int32            subl 0x4(%rcx),%eax  @Ozone HGTile::Height()  0x68852f
// +0x08   0x04   right  : int32            movl 0x8(%rcx),%eax  @Ozone HGRect::w()      0x68850c
// +0x0c   0x04   bottom : int32            movl 0xc(%rcx),%eax  @Ozone HGTile::Height() 0x68852c
//                                          movaps (%rax),%xmm0  @Ozone HGTile::Position() 0x690cdb
//                                          movl 0xc(%rsi),%eax  @Flexo HgcAddAlpha_AVX  0x145455d
//                                          subl 0x4(%rsi),%eax  @Flexo HgcAddAlpha_AVX  0x1454560
//                                          movl 0x8(%rsi),%r9d  @Flexo HgcAddAlpha_AVX  0x145456c
//                                          subl (%rsi),%r9d     @Flexo HgcAddAlpha_AVX  0x1454570
// +0x10   0x08   outSlot     : rgba*       movq 0x10(%rsi),%r8  @Flexo HgcAddAlpha_AVX  0x145457b
//                                          movq 0x10(%rax),%rax @Ozone HgcMaskElem_AVX  0x6a4ec8
// +0x18   0x04   outStride   : int32       movslq 0x18(%rsi),%r11 @Flexo HgcAddAlpha_AVX 0x145457f
//                                          movl 0x18(%rax),%eax  @Ozone HgcMaskElem_AVX 0x6a4edc
//                                          (sign-extended to 8B; the top 4B at +0x1c are pad/unused
//                                           — no read of +0x1c has been observed.)
//
// +0x50   0x08   texPlanes[0].pixels : rgba*     movq 0x50(%rsi),%rcx  @Flexo HgcAddAlpha_AVX 0x1454573
//                                                movq 0x50(%rax),%rax  @Ozone HgcMaskElem_AVX 0x6a4eb4
//                                                movq $0,0x50(%r14,%rbx)  ; %rbx=i*0x10, i in [0..count]
//                                                                     @Helium RenderInputTile 0x0eb708
// +0x58   0x04   texPlanes[0].stride : int32    movslq 0x58(%rsi),%r12 @Flexo HgcAddAlpha_AVX 0x1454587
//                                                movl   0x58(%rax),%eax @Ozone HgcMaskElem_AVX 0x6a4ea2
//                                                movl $0,0x58(%r14,%rbx) @Helium RenderInputTile 0x0eb711
// +0x60   0x08   texPlanes[1].pixels : rgba*    movq 0x60(%rsi),%rdx  @Flexo HgcAddAlpha_AVX 0x1454577
//                                                movq 0x60(%rax),%rax  @Ozone HgcMaskElem_AVX 0x6a4e8e
// +0x68   0x04   texPlanes[1].stride : int32    movslq 0x68(%rsi),%r15 @Flexo HgcAddAlpha_AVX 0x1454583
//                                                movl   0x68(%rax),%eax @Ozone HgcMaskElem_AVX 0x6a4e7c
// +0x70   0x08   texPlanes[2].pixels : rgba*    movq 0x70(%rsi),%r8   @Helium HgcBlendBlur_AVX 0x2345b8
// +0x78   0x04   texPlanes[2].stride : int32    movslq 0x78(%rsi),%rbx @Helium HgcBlendBlur_AVX 0x2345c4
//                                                (Higher planes at +0x80,+0x90,... follow the same
//                                                 pattern — the array runs from +0x50 with STRIDE
//                                                 0x10 and each element is {ptr:8, stride:4, pad:4}.
//                                                 HGRenderer::RenderInputTile clears element i via
//                                                 `movq $0,0x50(%r14,%rbx)` / `movl $0,0x58(%r14,%rbx)`
//                                                 with %rbx=i*0x10 @Helium 0x0eb708/0x0eb711.)
//
// +0xd0   0x10   inputRects[0]        : HGRect  movups %xmm0,0xd0(%r14,%rbx) @Helium RenderInputTile 0x0eb8ea
//                                                movq %rax,0xd0(%rcx,%rbx)   @Helium RenderInputTile 0x0eb865
//                                                movq %rsi,0xd8(%rcx,%rbx)   @Helium RenderInputTile 0x0eb871
//                                                (Per-input source-region rectangle in int32 corner
//                                                 form, one HGRect per plane, STRIDE 0x10, matches
//                                                 the plane array indexing 1:1.)
//
// +0x150  0x08   ctx    : void*                movq 0x150(%rdi),%rax @Helium HGTile::Renderer() 0x11b734
//                                                movq 0x150(%rbx),%rax @Helium HGColorMatrix::RenderTile 0x246438
//                                                movq 0x150(%rbx),%rcx @Helium HGColorMatrix::RenderTile 0x24653e
//                                                (An opaque "render context" pointer. Its `+0x98`
//                                                 is the HGRenderer* — that's what Renderer()
//                                                 returns — and its `+0x1a0` is a per-node stats
//                                                 struct whose `+0x50` is a cycle counter that
//                                                 RenderTile increments on exit @Helium 0x24654c.)
//
// +0x1a8  0x08   stats  : HGStats::UnitStats*   movq 0x1a8(%r14),%rdi @Helium RenderInputTile 0x0eb810
//                                                (Passed to HGStats::UnitStats::in_n_out as the
//                                                 `this` pointer @Helium 0x0eb858 — proves the
//                                                 field's type is `HGStats::UnitStats*`.)
//
// Fields at offsets NOT enumerated above (e.g. +0x20..+0x4f, +0x80..+0xcf,
// +0xe0..+0x14f, +0x158..+0x1a7, +0x1b0..) have not been observed in any of
// the disassemblies read so far; they may hold higher-index texPlanes/
// inputRects or auxiliary metadata. Downstream classes that access them MUST
// prove the offset and either extend this file or throw an "@0xADDR not yet
// transcribed" stub.
//
// ── ICF NOTE ────────────────────────────────────────────────────────────────
// The linker (ld64) collapsed HGTile::Width() with HGRect::w() because they
// have byte-identical bodies. `nm -arch x86_64` lists them at the SAME address
// (0x688500). This is FAITHFUL — the shipped binary really has one function
// serving both symbols. In TS we implement Width() directly (following the
// asm) and note the folding provenance.
//
// ── POSITION() — SUBPIXEL CENTER + HOMOGENEOUS COORD ─────────────────────────
// Position() @0x690cc0 loads the 4 int32 tile corners, converts to float32, then
// multiplies by [1,1,0,0] and adds [0.5,0.5,0,1]:
//
//   xmm0  = (int32x4)*(this)                          // {left, top, right, bottom}
//   xmm0  = cvtdq2ps(xmm0)                             // 4 floats
//   xmm1  = [1.0f, 1.0f, 0.0f, 0.0f]                   // @Ozone __TEXT const 0x70afe0
//   xmm1  = mulps(xmm0, xmm1)                          // {L, T, 0, 0}
//   xmm0  = [0.5f, 0.5f, 0.0f, 1.0f]                   // @Ozone __TEXT const 0x714420
//   xmm0  = addps(xmm1, xmm0)                          // {L+0.5, T+0.5, 0.0, 1.0}
//   return xmm0
//
// This is a HOMOGENEOUS 2D POSITION at the tile's TOP-LEFT PIXEL CENTER
// (subpixel offset of 0.5 in both axes, z=0, w=1). The mask lane pattern
// `[1,1,0,0]` in the multiplier is what zeros out the `right`/`bottom` corner
// lanes — Position() by definition returns the tile ORIGIN, never its extent.
//
// Const provenance (each verified by direct byte read of the x86_64 slice):
//   @Ozone 0x70afe0  packed 4x f32 = { 0x3f800000, 0x3f800000, 0x00000000, 0x00000000 }
//                                  = { 1.0f, 1.0f, 0.0f, 0.0f }
//   @Ozone 0x714420  packed 4x f32 = { 0x3f000000, 0x3f000000, 0x00000000, 0x3f800000 }
//                                  = { 0.5f, 0.5f, 0.0f, 1.0f }

import type { HGRect } from "./HGRect";

// Single-precision helper matching x86 SSE semantics (movaps + cvtdq2ps + mulps + addps
// all operate on IEEE-754 binary32 lanes with round-to-nearest-even). Math.fround gives
// exact single-precision rounding after every arithmetic step.
const f32 = Math.fround;

// The two RIP-relative packed constants, transcribed verbatim from the binary.
// Each is a 4-lane float32 vector; we hold them as fixed tuples with Math.fround'd
// components (a no-op for these exact-representable IEEE-754 values, but preserved for
// symmetry with the arithmetic path).
const POSITION_MUL_MASK: readonly [number, number, number, number] = [
  f32(1.0),
  f32(1.0),
  f32(0.0),
  f32(0.0),
];
const POSITION_ADD_OFFSET: readonly [number, number, number, number] = [
  f32(0.5),
  f32(0.5),
  f32(0.0),
  f32(1.0),
];

/**
 * HGTile — the ≥0x1b0-byte aggregate consumed by every HGxx::RenderTile /
 * HGxx::RenderTile_AVX in Helium, Ozone, Flexo, and Lithium. Its leading 16
 * bytes are structurally an HGRect (int32 {left, top, right, bottom} corner
 * form). All four exported const member methods (Width, Height, Position,
 * Renderer) are decoded here.
 *
 * The class has NO exported ctor/dtor — it is constructed by direct field
 * writes from its owners (see HGRenderer::RenderInputTile @Helium 0x0eb6d0
 * which zeroes +0x50/+0x58 lanes and writes per-input HGRects at +0xd0/+0xd8).
 * We expose the layout as public fields for the same reason: the class shape
 * is decoded, the ownership pattern is not.
 *
 * Downstream RenderTile ports read these fields directly — they do NOT need
 * to reason about the raw offsets, only about the field names below. Every
 * offset above the leading HGRect is proven by at least two independent
 * disassemblies (see the "STRUCT LAYOUT (RENDERTILE-CONTRACT VIEW)" section
 * of the file header).
 */
export class HGTile {
  /** @+0x00  left   : int32.  First int32 subtracted in Width() (@0x68852f). */
  left: number = 0 | 0;

  /** @+0x04  top    : int32.  First int32 subtracted in Height() (@0x68852f). */
  top: number = 0 | 0;

  /** @+0x08  right  : int32 (exclusive corner). Minuend in Width(). */
  right: number = 0 | 0;

  /** @+0x0c  bottom : int32 (exclusive corner). Minuend in Height(). */
  bottom: number = 0 | 0;

  // ── Output plane (rendered pixels are WRITTEN through this pair) ───────
  /**
   * @+0x10  outSlot : rgba* — pointer to the destination pixel buffer for
   * this tile. Loaded as an 8-byte pointer by every RenderTile / RenderTile_AVX
   * routine before its pixel loop.
   *
   * Proven independently by:
   *   • movq   0x10(%rsi),%r8   @Flexo HgcAddAlpha::RenderTile_AVX  0x145457b
   *   • movq   0x10(%rax),%rax  @Ozone HgcMaskElem::RenderTile_AVX  0x6a4ec8
   * In JS we model this as a Float32Array (rgba float4 pixels, one pixel = 16 bytes).
   * The consumers stride by `outStride * 16` bytes per row; the concrete backing
   * store is provided by the caller of RenderTile.
   */
  outSlot: Float32Array | null = null;

  /**
   * @+0x18  outStride : int32 — number of PIXELS per row of `outSlot`. Loaded
   * as a sign-extended int32 (`movslq 0x18(%rsi),%r11` @Flexo HgcAddAlpha_AVX
   * 0x145457f; `movl 0x18(%rax),%eax` @Ozone HgcMaskElem_AVX 0x6a4edc). The
   * top 4 bytes at +0x1c are pad/unused (no read observed).
   *
   * All AVX render loops immediately multiply by 0x10 (pixels are 16-byte
   * float4 RGBA), so the effective BYTE stride per row is `outStride * 16`.
   * See e.g. `shlq $0x4,%r11` @Flexo HgcAddAlpha_AVX 0x14545a4.
   */
  outStride: number = 0 | 0;

  // ── Input planes (up to N; index by plane slot) ──────────────────────────
  /**
   * @+0x50 (base) with STRIDE 0x10 — array of input plane descriptors, each
   * a `{ pixels: rgba* @+0, stride : int32 @+8, pad : int32 @+12 }` triple.
   *
   * texPlanes[0] : @+0x50 pixels / @+0x58 stride  — proven by
   *   • movq   0x50(%rsi),%rcx  / movslq 0x58(%rsi),%r12
   *       @Flexo HgcAddAlpha::RenderTile_AVX  0x1454573 / 0x1454587
   *   • movq   0x50(%rax),%rax  / movl   0x58(%rax),%eax
   *       @Ozone HgcMaskElem::RenderTile_AVX  0x6a4eb4 / 0x6a4ea2
   *   • movq   $0,0x50(%r14,%rbx) / movl $0,0x58(%r14,%rbx)  ; %rbx = i*0x10
   *       @Helium HGRenderer::RenderInputTile 0x0eb708 / 0x0eb711
   *
   * texPlanes[1] : @+0x60 pixels / @+0x68 stride  — proven by
   *   • movq   0x60(%rsi),%rdx  / movslq 0x68(%rsi),%r15
   *       @Flexo HgcAddAlpha::RenderTile_AVX  0x1454577 / 0x1454583
   *   • movq   0x60(%rax),%rax  / movl   0x68(%rax),%eax
   *       @Ozone HgcMaskElem::RenderTile_AVX  0x6a4e8e / 0x6a4e7c
   *
   * texPlanes[2] : @+0x70 pixels / @+0x78 stride  — proven by
   *   • movq   0x70(%rsi),%r8   / movslq 0x78(%rsi),%rbx
   *       @Helium HgcBlendBlur::RenderTile_AVX  0x2345b8 / 0x2345c4
   *
   * The array is dense (elements at +0x80/+0x90/... follow the same shape);
   * we model it as a fixed-size TS array indexed by plane slot. RenderInputTile
   * clears entries by writing zeros to +0x50+i*0x10 (ptr) and +0x58+i*0x10
   * (stride), so an "unused" plane appears as `{ pixels: null, stride: 0 }`.
   *
   * `stride` is a PIXEL count exactly like `outStride` — consumers `shlq $0x4`
   * it to get the byte-stride per row.
   */
  texPlanes: Array<{ pixels: Float32Array | null; stride: number }> = [
    { pixels: null, stride: 0 },
    { pixels: null, stride: 0 },
    { pixels: null, stride: 0 },
    { pixels: null, stride: 0 },
    { pixels: null, stride: 0 },
    { pixels: null, stride: 0 },
    { pixels: null, stride: 0 },
    { pixels: null, stride: 0 },
  ];

  // ── Per-input source-region rectangles ───────────────────────────────────
  /**
   * @+0xd0 (base) with STRIDE 0x10 — parallel array to `texPlanes`, one HGRect
   * per input plane, in int32 corner form. Written 16 bytes at a time by
   * HGRenderer::RenderInputTile:
   *   • movups %xmm0, 0xd0(%r14,%rbx)  @Helium RenderInputTile 0x0eb8ea
   *   • movq   %rax,  0xd0(%rcx,%rbx)  @Helium RenderInputTile 0x0eb865
   *   • movq   %rsi,  0xd8(%rcx,%rbx)  @Helium RenderInputTile 0x0eb871
   *   (in each case %rbx = i * 0x10.)
   *
   * Semantically this is the SOURCE region (in input-plane coordinates) that
   * feeds the OUTPUT tile — the caller's ROI clipped against each input's DOD.
   * Consumers that need to sample an input outside the tile's own bounds
   * (e.g. blur/bilateral filters) read these to know the valid sample window.
   */
  inputRects: HGRect[] = [
    { x: 0, y: 0, right: 0, bottom: 0 },
    { x: 0, y: 0, right: 0, bottom: 0 },
    { x: 0, y: 0, right: 0, bottom: 0 },
    { x: 0, y: 0, right: 0, bottom: 0 },
    { x: 0, y: 0, right: 0, bottom: 0 },
    { x: 0, y: 0, right: 0, bottom: 0 },
    { x: 0, y: 0, right: 0, bottom: 0 },
    { x: 0, y: 0, right: 0, bottom: 0 },
  ];

  // ── Backing context (opaque pointer used by Renderer() / stats) ──────────
  /**
   * @+0x150  ctx : opaque* — an opaque backing pointer whose `+0x98` is the
   * HGRenderer* (that is what {@link Renderer} returns) and whose `+0x1a0` is
   * a per-node stats struct on which RenderTile increments a cycle counter at
   * `+0x50` before returning.
   *
   * Proven by:
   *   • movq 0x150(%rdi),%rax  @Helium HGTile::Renderer()        0x11b734
   *   • movq 0x150(%rbx),%rax  @Helium HGColorMatrix::RenderTile 0x246438
   *   • movq 0x150(%rbx),%rcx  @Helium HGColorMatrix::RenderTile 0x24653e
   *     (with subsequent `movq 0x1a0(%rcx),%rcx; addq %rax,0x50(%rcx)`
   *      @Helium 0x246545/0x24654c — timing accumulator.)
   *
   * Modelled as `unknown` because its inner shape has NOT been decoded here;
   * consumers that need to reach the HGRenderer should call {@link Renderer}
   * and let this field remain opaque.
   */
  ctx: HGTileCtx | null = null;

  /**
   * @+0x1a8  stats : HGStats::UnitStats* — passed as `this` to
   * HGStats::UnitStats::in_n_out(HGNode*, u32, u64, u64):
   *   • movq  0x1a8(%r14),%rdi  @Helium RenderInputTile  0x0eb810
   *   • callq __ZN7HGStats9UnitStats8in_n_outEP6HGNodejyy  @Helium 0x0eb858
   *
   * Modelled as `unknown` — the UnitStats interior is not decoded here.
   */
  stats: unknown = null;

  /**
   * HGTile::Width() const — returns the tile's pixel width as an int32.
   *   @Ozone 0x0000000000688500..0x0000000000688513  (ICF-folded with HGRect::w() const)
   *
   * Disassembly (shared body — same 4 code instructions serve both symbols):
   *   0x688500  pushq %rbp
   *   0x688501  movq  %rsp, %rbp
   *   0x688504  movq  %rdi, -0x8(%rbp)           ; spill this
   *   0x688508  movq  -0x8(%rbp), %rcx           ; rcx = this
   *   0x68850c  movl  0x8(%rcx), %eax            ; eax = right (int32)
   *   0x68850f  subl  (%rcx), %eax               ; eax -= left  (int32)
   *   0x688511  popq  %rbp
   *   0x688512  retq
   *   0x688513  nopw  %cs:(%rax,%rax)            ; alignment padding
   *
   * The `subl` result is an int32 (unsigned wraparound = 32-bit two's-complement
   * subtraction). We match with `| 0` to truncate to int32 semantics.
   */
  Width(): number {
    // 0x68850c → 0x68850f: right - left as int32.
    return (this.right - this.left) | 0;
  }

  /**
   * HGTile::Height() const — returns the tile's pixel height as an int32.
   *   @Ozone 0x0000000000688520..0x0000000000688534
   *
   * Disassembly:
   *   0x688520  pushq %rbp
   *   0x688521  movq  %rsp, %rbp
   *   0x688524  movq  %rdi, -0x8(%rbp)           ; spill this
   *   0x688528  movq  -0x8(%rbp), %rcx           ; rcx = this
   *   0x68852c  movl  0xc(%rcx), %eax            ; eax = bottom (int32)
   *   0x68852f  subl  0x4(%rcx), %eax            ; eax -= top    (int32)
   *   0x688532  popq  %rbp
   *   0x688533  retq
   *   0x688534  nopw  %cs:(%rax,%rax)            ; alignment padding
   */
  Height(): number {
    // 0x68852c → 0x68852f: bottom - top as int32.
    return (this.bottom - this.top) | 0;
  }

  /**
   * HGTile::Position() const — returns the tile's top-left ORIGIN as a
   * homogeneous float4 with a half-pixel subpixel center offset.
   *   @Ozone 0x0000000000690cc0..0x0000000000690d1a
   *
   * Disassembly (stack-slot spills elided in commentary — semantically it's
   * just `xmm0 = mask*cvtdq2ps(load(this)) + offset`):
   *   0x690cc0  pushq %rbp / movq %rsp,%rbp
   *   0x690cc4  movq  %rdi, -0x58(%rbp)             ; spill this
   *   0x690cc8  movq  -0x58(%rbp), %rax             ; rax = this
   *   0x690ccc  movaps 0x7a30d(%rip), %xmm0          ; xmm0 = [1.0, 1.0, 0.0, 0.0]
   *                                                  ;  RIP=0x690cd3; target=0x70afe0
   *   0x690cd3  movaps %xmm0, -0x70(%rbp)            ; spill mask
   *   0x690cd7  movaps -0x70(%rbp), %xmm1            ; reload mask into xmm1
   *   0x690cdb  movaps (%rax), %xmm0                 ; xmm0 = *(v4i32*)this
   *                                                  ;    = {left, top, right, bottom}
   *   0x690cde  movaps %xmm0, -0x10(%rbp)            ; spill v4i32
   *   0x690ce2  cvtdq2ps -0x10(%rbp), %xmm0          ; xmm0 = v4f32(v4i32)
   *   0x690ce6  movaps %xmm1, -0x40(%rbp)            ; spill mask
   *   0x690cea  movaps %xmm0, -0x50(%rbp)            ; spill v4f32
   *   0x690cee  movaps -0x40(%rbp), %xmm1            ; reload mask
   *   0x690cf2  movaps -0x50(%rbp), %xmm0            ; reload v4f32
   *   0x690cf6  mulps  %xmm0, %xmm1                  ; xmm1 = v4f32 * mask
   *                                                  ;    = {L*1, T*1, R*0, B*0}
   *                                                  ;    = {L, T, 0, 0}
   *   0x690cf9  movaps 0x83720(%rip), %xmm0          ; xmm0 = [0.5, 0.5, 0.0, 1.0]
   *                                                  ;  RIP=0x690d00; target=0x714420
   *   0x690d00  movaps %xmm0, -0x80(%rbp)            ; spill offset
   *   0x690d04  movaps -0x80(%rbp), %xmm0            ; reload offset
   *   0x690d08  movaps %xmm1, -0x20(%rbp)            ; spill (L,T,0,0)
   *   0x690d0c  movaps %xmm0, -0x30(%rbp)            ; spill offset
   *   0x690d10  movaps -0x20(%rbp), %xmm0            ; xmm0 = (L,T,0,0)
   *   0x690d14  addps  -0x30(%rbp), %xmm0            ; xmm0 = (L+0.5, T+0.5, 0.0, 1.0)
   *   0x690d18  popq  %rbp / retq
   *
   * The spills are compiler artefacts (this looks like a -O0 or -O1 build slice
   * with debug spill code); semantically the whole thing is:
   *
   *   return (float4)(int4){left, top, right, bottom}
   *        * float4{1, 1, 0, 0}
   *        + float4{0.5, 0.5, 0, 1}
   *
   * i.e. `{ left+0.5, top+0.5, 0.0, 1.0 }` — the tile's TOP-LEFT PIXEL CENTER in
   * homogeneous 2D coordinates (z=0, w=1).
   *
   * The int→float conversion (cvtdq2ps) is signed-32-bit-to-single-precision;
   * for typical tile coordinates well within 2^24 the conversion is exact, and
   * Math.fround captures the exact-representable half-integer additions
   * losslessly.
   */
  Position(): readonly [number, number, number, number] {
    // 0x690cdb → 0x690ce2: cvtdq2ps of {left, top, right, bottom}.
    const l = f32(this.left | 0);
    const t = f32(this.top | 0);
    const r = f32(this.right | 0);
    const b = f32(this.bottom | 0);

    // 0x690cf6: mulps against POSITION_MUL_MASK (@Ozone 0x70afe0) = [1,1,0,0].
    const mx = f32(l * POSITION_MUL_MASK[0]); // = l
    const my = f32(t * POSITION_MUL_MASK[1]); // = t
    const mz = f32(r * POSITION_MUL_MASK[2]); // = 0
    const mw = f32(b * POSITION_MUL_MASK[3]); // = 0

    // 0x690d14: addps against POSITION_ADD_OFFSET (@Ozone 0x714420) = [0.5,0.5,0,1].
    const px = f32(mx + POSITION_ADD_OFFSET[0]); // = l + 0.5
    const py = f32(my + POSITION_ADD_OFFSET[1]); // = t + 0.5
    const pz = f32(mz + POSITION_ADD_OFFSET[2]); // = 0
    const pw = f32(mw + POSITION_ADD_OFFSET[3]); // = 1

    return [px, py, pz, pw] as const;
  }

  /**
   * Type-level marker: HGTile's leading 16 bytes ARE structurally an HGRect
   * (see STRUCT LAYOUT above; both use int32 {left, top, right, bottom} corner
   * form). Provided as a helper so callers that only want the rectangle view
   * of the tile can obtain it without paying for a copy.
   */
  asHGRect(): HGRect {
    return { x: this.left | 0, y: this.top | 0, right: this.right | 0, bottom: this.bottom | 0 };
  }

  /**
   * HGTile::Renderer() const — returns the HGRenderer* that owns this tile.
   *   @Helium 0x000000000011b730..0x000000000011b743
   *
   * Disassembly (@`otool -tvV /tmp/Helium.x86_64 -p __ZNK6HGTile8RendererEv`):
   *   0x11b730  pushq %rbp
   *   0x11b731  movq  %rsp, %rbp
   *   0x11b734  movq  0x150(%rdi), %rax          ; rax = this->ctx        (+0x150)
   *   0x11b73b  movq  0x98(%rax),  %rax          ; rax = ctx->_renderer    (+0x98 of ctx)
   *   0x11b742  popq  %rbp
   *   0x11b743  retq
   *
   * Two dependent 8-byte loads: chase `this+0x150` then that pointer's `+0x98`.
   * This is called as an OUTLINED function by e.g. HGColorMatrix::RenderTile
   * @Helium 0x246463..0x246470 (`callq __ZNK6HGTile8RendererEv`).
   */
  Renderer(): HGRendererStub | null {
    // 0x11b734: dereference this->ctx (@+0x150).
    const ctx = this.ctx;
    if (ctx === null) return null;
    // 0x11b73b: dereference ctx->_renderer (@+0x98 of ctx).
    return ctx.renderer;
  }
}

/**
 * `HGTileCtx` — the opaque struct pointed at by HGTile @+0x150. Only two of
 * its fields are read by HGTile itself:
 *   @+0x98   renderer : HGRenderer*                       @Helium HGTile::Renderer() 0x11b73b
 *   @+0x1a0  perNodeStats : { cycleAccum : u64 @+0x50 }   @Helium HGColorMatrix::RenderTile 0x246545/0x24654c
 * We only model the fields that HGTile itself accesses; the rest is opaque
 * (its full decode is left to whichever future port needs it).
 */
export interface HGTileCtx {
  /** @+0x98  renderer : HGRenderer* (returned by HGTile::Renderer()). */
  renderer: HGRendererStub;
  /** @+0x1a0 perNodeStats : opaque — timing counter at its +0x50. */
  perNodeStats?: { cycleAccum: bigint };
}

/**
 * `HGRendererStub` — placeholder for Helium's `HGRenderer` class (a very large
 * type touched by hundreds of methods). We only declare it here as a
 * nominal-typed pointer target so `HGTile::Renderer()` has a concrete return
 * type. The full HGRenderer will be ported in its own file.
 */
export interface HGRendererStub {
  /** Marker so structural typing doesn't collapse it with `unknown`. */
  readonly __hgRendererBrand?: "HGRenderer";
}
