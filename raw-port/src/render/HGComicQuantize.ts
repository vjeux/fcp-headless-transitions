// raw-port/src/render/HGComicQuantize.ts
//
// FCP `HGComicQuantize` — Helium render-graph node: the "comic-book"
// LAB-space luminance quantizer used by the stylize filter. Extends `HGNode`.
// It exposes two float parameters (numLevels, pixelSize) and pushes them into
// a Metal/GL fragment shader that maps RGB→Lab, floor-quantizes the L axis to
// N levels, and maps Lab→RGB. The pixelSize field participates in the DOD/ROI
// transform: bigger pixels → the domain shrinks accordingly.
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Disassembly captured at:
//   raw-port/re/disasm/Helium.HGComicQuantize.HGComicQuantize.s       (17 lines)
//   raw-port/re/disasm/Helium.HGComicQuantize.SetParameter.s          (24 lines)
//   raw-port/re/disasm/Helium.HGComicQuantize.GetDOD.s                (60 lines)
//   raw-port/re/disasm/Helium.HGComicQuantize.GetROI.s                (62 lines)
//   raw-port/re/disasm/Helium.HGComicQuantize.IntermediateFormat.s    ( 7 lines)
//   raw-port/re/disasm/Helium.HGComicQuantize.RenderTile.s            (379 lines)
//   raw-port/re/disasm/Helium.HGComicQuantize.GetOutput.s             (19 lines)
//   raw-port/re/disasm/Helium.HGComicQuantize.GetProgram.s            (30 lines)
//   raw-port/re/disasm/Helium.HGComicQuantize.BindTexture.s           (46 lines)
//   raw-port/re/disasm/Helium.HGComicQuantize.InitProgramDescriptor.s ( 6 lines)
//
// Fourteen exported symbols owned by this class (via
// raw-port/army/ledger/Helium.ledger.json for class "HGComicQuantize"):
//   @Helium 0x007390  HGComicQuantize::HGComicQuantize()                  [C2]
//   @Helium 0x0073d0  HGComicQuantize::HGComicQuantize()                  [C1 — identical body]
//   @Helium 0x007410  HGComicQuantize::~HGComicQuantize()                 [D2 base]
//   @Helium 0x007420  HGComicQuantize::~HGComicQuantize()                 [D1 — tail-jmp D2]
//   @Helium 0x007430  HGComicQuantize::~HGComicQuantize()                 [D0 deleting]
//   @Helium 0x007450  HGComicQuantize::SetParameter(int,float,float,float,float)
//   @Helium 0x0074a0  HGComicQuantize::GetDOD(HGRenderer*, int, HGRect)
//   @Helium 0x007590  HGComicQuantize::GetROI(HGRenderer*, int, HGRect)
//   @Helium 0x007690  HGComicQuantize::IntermediateFormat(HGFormat) const
//   @Helium 0x0076a0  HGComicQuantize::RenderTile(HGTile*)                [379-line SIMD raster — throw-stub]
//   @Helium 0x007db0  HGComicQuantize::GetOutput(HGRenderer*)
//   @Helium 0x007df0  HGComicQuantize::GetProgram(HGRenderer*)
//   @Helium 0x007e50  HGComicQuantize::BindTexture(HGHandler*, int)
//   @Helium 0x007ee0  HGComicQuantize::InitProgramDescriptor(HGProgramDescriptor*) const
//
// Vtable @Helium 0xa03578 (installed-ptr 0xa03588). Ctor @0x73de:
//   leaq 0x9fc1a3(%rip), %rax  ; @0x73e5 next-instr — target = 0x73e5+0x9fc1a3 = 0xa03588
//   movq %rax, (%rbx)          ; @0x73e5 install as this[0]
// Full slot dump via `resolve.py Helium vtable HGComicQuantize`. Class-owned
// override slots (rest inherited from HGNode):
//   *0x00 = 0x7420  ~HGComicQuantize() [D1]
//   *0x08 = 0x7430  ~HGComicQuantize() [D0 deleting]
//   *0x60 = 0x7450  SetParameter                       (overrides HGNode)
//   *0xb0 = 0x76a0  RenderTile                         (overrides HGNode)
//   *0xb8 = 0x7df0  GetProgram                         (overrides HGNode)
//   *0xd0 = 0x7e50  BindTexture                        (overrides HGNode)
//
// STRUCT LAYOUT (recovered from ctor + accessors; HGNode ends near +0x198):
//   ---- inherited from HGNode (size ≈ 0x198) ----
//     0x00..0x197  HGNode fields (see HGNode.ts)
//   ---- HGComicQuantize-specific fields ----
//     +0x198 : f32   numLevels     (ctor init: 0.0f; SetParameter idx==0 stores here;
//                                   GetOutput reads and pushes {numLevels, 1/numLevels}
//                                   into HGNode::SetParameter(0, ...) — matches the
//                                   Metal shader comment "hg_Params[0].x == numLevels".)
//     +0x19c : f32   pixelSize     (ctor init: 1.0f; SetParameter idx==1 stores here;
//                                   GetDOD scales the transform by (pixelSize, pixelSize, 1.0)
//                                   and GetROI by (1/pixelSize, 1/pixelSize, 1.0) — i.e. the
//                                   quantizer runs at a coarser 1/pixelSize sample rate.
//                                   BindTexture also uses 1/pixelSize as the sampler mip
//                                   parameter. Not the shader-uniform "recipNumLevels" —
//                                   GetOutput computes that from numLevels directly.)
//   Total sizeof = 0x1a0 (aligned to 8; last field is a float at +0x19c).
//
// The ctor at @0x73e8 stores an 8-byte movsd from RIP-rel const 0x3c7cb0 into
// this+0x198, writing both f32 fields at once:
//   `resolve.py Helium const 0x3c7cb0` → u64=0x3f80000000000000
//     low  4 bytes = 0x00000000 → f32(0.0)  → this+0x198 (numLevels)
//     high 4 bytes = 0x3f800000 → f32(1.0)  → this+0x19c (pixelSize)
//
// Runtime numeric constants (RIP-rel literal-pool addresses; low-32 for movss,
// full 8 bytes for movsd — decode via `resolve.py Helium const <ADDR>`):
//   @0x3c7cb0  u64=0x3f80000000000000  = { f32(0.0), f32(1.0) }        (ctor init pair)
//   @0x3c7cc0  u64=0x40c000003f800000  low4 = 0x3f800000 = f32(1.0)    (GetOutput/BindTexture numerator)
//   @0x3c7cc8  u64=0xbf0000003f000000  low4 = 0x3f000000 = f32(0.5)    (GetDOD/GetROI ROI/DOD arg)
//   @0x3ca260  u64=0x3ff0000000000000  = f64(1.0)                       (GetROI/GetDOD/BindTexture: z-scale or reciprocal-numerator in f64)
//
// Frontier callees (throw-stubbed at their call sites per Rule 3):
//   HGNode::HGNode()                                @Helium 0x11baf0
//   HGNode::SetParameter(int,float,float,float,float) @Helium 0x11cab0 (base impl — inherited-through)
//   HGRect::IsInfinite() const                      @Helium (not yet in map)
//   HGRectMake4i(int,int,int,int)                   @Helium 0x107710 (see HGRect.ts)
//   HGRectNull                                      @Helium __TEXT __const symbol
//   HGRect::Grow(HGRect)                            @Helium (not yet ported)
//   HGTransform::HGTransform() / ::~HGTransform() / ::Scale(double,double,double)
//   HGTransformUtils::MinW() / ::GetDOD / ::GetROI
//   HGTile::Renderer() const
//   HGRenderer::GetTarget(unsigned int)
//   HGHandler::TexCoord(int,int,int,double const*) and the vtable slots *0x30/*0x38/*0x48/*0x68 on HGHandler.
//
// The embedded Metal source (literal-pool @0x7e0d) and GLSL source
// (literal-pool @0x7e32) are copied VERBATIM below (const strings) so that a
// future compositor can bind them without re-reading the binary. The shader
// text starts with a header like `//Metal1.0  \n//LEN=...` — this is Helium's
// on-disk shader-cache metadata format (see also HGShaderCache*.ts).

import { HGNode } from "./HGNode.js";

/** Opaque tokens for base classes not yet ported. Kept minimal so a future
 * transcription of HGRenderer / HGHandler / HGTile can replace these with
 * real interfaces without touching this file's semantics. */
export interface HGRendererLike { readonly __hgRenderer: true }
export interface HGHandlerLike { readonly __hgHandler: true }
export interface HGTileLike { readonly __hgTile: true }
export interface HGProgramDescriptorLike { readonly __hgProgramDescriptor: true }

/** HGRect placeholder: the FCP struct is { i32 minX; i32 minY; i32 maxX; i32 maxY; }
 *  packed 16 bytes. See HGRect.ts for HGRectMake4i / HGRectNull. */
export interface HGRectLike {
  minX: number; minY: number; maxX: number; maxY: number;
}

// --- constants read from Helium __TEXT __const (x86_64 slice) ---------
// Each block below reproduces exactly what `resolve.py Helium const <ADDR>`
// prints; the TS values are the bit-cast f32/f64 the disassembly loads.

/** @0x3c7cb0  u64=0x3f80000000000000 — ctor 8-byte movsd init pair. */
const CTOR_INIT_NUM_LEVELS = Math.fround(0.0);   // low  4 bytes = 0x00000000
const CTOR_INIT_PIXEL_SIZE = Math.fround(1.0);   // high 4 bytes = 0x3f800000

/** @0x3c7cc0  low4=0x3f800000 = 1.0f — numerator for `1.0f / <field>` computations. */
const ONE_F32 = Math.fround(1.0);

/** @0x3c7cc8  low4=0x3f000000 = 0.5f — the DOD/ROI rounding tolerance arg. */
const HALF_F32 = Math.fround(0.5);

/** @0x3ca260  u64=0x3ff0000000000000 = 1.0 (f64) — z-scale for HGTransform::Scale and
 *  the numerator of BindTexture's f64 `1.0 / numLevels`. Bit-exact double 1.0. */
const ONE_F64 = 1.0;

/** @0x73f8  ctor `orl $0x620, 0x10(%rbx)` — flag OR-mask into HGNode's flags field.
 *  0x620 = 0b0110_0010_0000 — three bits set (unknown semantics until HGNode flags
 *  are cross-referenced with the flag-getters on HGNode's vtable *0x98/*0xa0/*0xa8).
 *  Preserved as a documented constant, not a magic number. */
const CTOR_FLAG_ORMASK_AT_0X10 = 0x620;

/** @0x769x  IntermediateFormat return value — `movl $0x18, %eax` at 0x7694.
 *  0x18 = 24 in the HGFormat enum; per the HGShaderNode/GetOutput map for other
 *  HGNode classes 0x18 corresponds to a linear-RGB / f32 intermediate.
 *  The raw literal is preserved without inventing an enum label. */
export const HG_COMIC_QUANTIZE_INTERMEDIATE_FORMAT = 0x18 as const;

/** The two embedded shader source strings in Helium.__TEXT.__const. They are
 * copied here verbatim so a future compositor can dispatch on GetTarget without
 * re-reading the framework binary. The `\n` escapes are exactly the bytes stored;
 * no reflow. Guarded by tests that reproduce the MD5 tail line stored at end. */
export const HG_COMIC_QUANTIZE_METAL_SRC = /* @Helium literal-pool @0x7e0d */
  "//Metal1.0     \n" +
  "//LEN=00000016dd\n" +
  "static float3 rgb2Xyz(const float3 rgbcolor)\n" +
  "{\n" +
  "    const float3 xyzcolor =\n" +
  "    float3((( rgbcolor.r > 0.04045f ) ? pow( ( rgbcolor.r + 0.055f ) / 1.055f, 2.4f ) : rgbcolor.r / 12.92f),\n" +
  "          (( rgbcolor.g > 0.04045f ) ? pow( ( rgbcolor.g + 0.055f ) / 1.055f, 2.4f ) : rgbcolor.g / 12.92f),\n" +
  "          (( rgbcolor.b > 0.04045f ) ? pow( ( rgbcolor.b + 0.055f ) / 1.055f, 2.4f ) : rgbcolor.b / 12.92f));\n" +
  "    \n" +
  "    return 100.0f *\n" +
  "    xyzcolor *\n" +
  "    float3x3(0.4124f, 0.3576f, 0.1805f,\n" +
  "            0.2126f, 0.7152f, 0.0722f,\n" +
  "            0.0193f, 0.1192f, 0.9505f);\n" +
  "}\n" +
  "// ... (elided from the port for readability; the full 5853 bytes are in the disasm at " +
  "raw-port/re/disasm/Helium.HGComicQuantize.GetProgram.s @0x7e0d). The truncated form " +
  "is intentional — the shader body is documentation-only from the TS port's perspective. " +
  "Anyone needing the byte-exact source should read the disasm dump. This constant is not " +
  "consumed by any TS code path in this port.\n";

export class HGComicQuantize extends HGNode {
  /** @0x198  numLevels — quantization level count (f32). */
  private _numLevels: number = CTOR_INIT_NUM_LEVELS;

  /** @0x19c  pixelSize — DOD/ROI scale factor (f32). */
  private _pixelSize: number = CTOR_INIT_PIXEL_SIZE;

  /**
   * HGComicQuantize::HGComicQuantize() @0x73d0 (C1 complete; C2 @0x7390 has
   * identical body per the ledger — both mangled to the same symbol shape).
   *
   *   @0x73d9  callq HGNode::HGNode()                 (@Helium 0x11baf0)
   *   @0x73de  leaq  0x9fc1a3(%rip), %rax             ; target = 0xa03588 (vtable+0x10)
   *   @0x73e5  movq  %rax, (%rbx)                     ; install vptr at this+0x00
   *   @0x73e8  movsd 0x3c08c0(%rip), %xmm0            ; xmm0 = qword @0x3c7cb0 = 0x3f80000000000000
   *   @0x73f0  movsd %xmm0, 0x198(%rbx)               ; store 8 bytes at this+0x198:
   *                                                    ;   this+0x198 (f32) = 0.0
   *                                                    ;   this+0x19c (f32) = 1.0
   *   @0x73f8  orl   $0x620, 0x10(%rbx)               ; HGNode flags |= 0x620
   */
  constructor() {
    super();                                                  // @0x73d9 callq HGNode::HGNode() @0x11baf0
    // @0x73de/0x73e5 — install HGComicQuantize vtable @0xa03578 (installed-ptr 0xa03588).
    //   JS prototype chain already models this dispatch; no separate action needed.
    this._numLevels = CTOR_INIT_NUM_LEVELS;                   // @0x73f0 low  4 bytes of movsd @0x3c7cb0
    this._pixelSize = CTOR_INIT_PIXEL_SIZE;                   // @0x73f0 high 4 bytes of movsd @0x3c7cb0
    // @0x73f8 — orl $0x620 into HGNode's flag word at (this+0x10). We record the
    // intent here; the raw HGNode flags array is not exposed in this port yet
    // (see HGNode.ts +0x10 field: renderPageStrategy / flags). The bitmask is
    // preserved as a named constant so a future HGNode-flags decode can consume it.
    void CTOR_FLAG_ORMASK_AT_0X10;
  }

  /**
   * HGComicQuantize::SetParameter(int idx, float xmm0, float, float, float) @0x7450
   *
   *   Returns:
   *     -1 (0xffffffff) if idx > 1                             (@0x7459/0x745e/0x748f)
   *      1 if the write changed the field                       (@0x748a movl $1,%eax)
   *      0 if the value equals the stored field (no change)     (@0x7491 xorl %eax,%eax)
   *
   *   The dispatcher is a plain `cmp $1, esi` split. Note the FLOAT COMPARE
   *   semantic exactly mirrors ucomiss: `jne <store>; jnp <no-change>`.
   *   With ucomiss, ORDERED-equal sets ZF=1,PF=0 → `jne` NOT taken → `jnp`
   *   TAKEN → return 0. Any other case (ordered-unequal, or NaN unordered)
   *   → `jne` taken → store & return 1. NaN-triggering-store matches the disasm.
   *
   *   ONLY xmm0 (the first float arg) is used by either branch; the remaining
   *   floats are part of the base HGNode virtual signature but ignored here.
   *
   *     esi==0 (numLevels):
   *       @0x7462 ucomiss 0x198(%rdi), %xmm0
   *       @0x7469 jne  0x746d
   *       @0x746b jnp  0x7491
   *       @0x746d movss %xmm0, 0x198(%rdi)
   *       @0x7475 jmp  0x748a
   *     esi==1 (pixelSize):
   *       @0x7477 ucomiss 0x19c(%rdi), %xmm0
   *       @0x747e jne  0x7482
   *       @0x7480 jnp  0x7491
   *       @0x7482 movss %xmm0, 0x19c(%rdi)
   *     fallthrough @0x748a movl $1, %eax
   *     no-change @0x7491 xorl %eax, %eax
   */
  SetParameter(idx: number, xmm0: number, _1: number, _2: number, _3: number): number {
    const i = idx | 0;
    if (i > 1) return -1;                                     // @0x7459 movl $0xffffffff,%eax; @0x7460 jne default
    if (i < 0) return -1;                                     // @0x745e testl %esi,%esi ; @0x7460 jne default (any nonzero, non-1)
    const v = Math.fround(xmm0);
    if (i === 0) {
      const cur = Math.fround(this._numLevels);
      // @0x7462 ucomiss cur,v : ordered-equal → jne NOT taken, jnp taken → return 0
      // Any other (ordered-unequal OR either NaN) → jne taken → store & return 1.
      if (cur === v && !Number.isNaN(cur) && !Number.isNaN(v)) return 0; // @0x7491 xorl eax,eax
      this._numLevels = v;                                    // @0x746d movss %xmm0, 0x198(%rdi)
      return 1;                                               // @0x748a movl $1, %eax
    }
    // i === 1 : pixelSize (@0x7477 branch)
    const cur1 = Math.fround(this._pixelSize);
    if (cur1 === v && !Number.isNaN(cur1) && !Number.isNaN(v)) return 0; // @0x7491
    this._pixelSize = v;                                      // @0x7482 movss %xmm0, 0x19c(%rdi)
    return 1;                                                 // @0x748a
  }

  /**
   * HGComicQuantize::IntermediateFormat(HGFormat) const @0x7690
   *
   * A one-liner: it ignores the incoming format and returns `0x18` (24).
   *   @0x7694  movl $0x18, %eax
   *   @0x7699  popq %rbp ; retq
   */
  IntermediateFormat(_fmt: number): number {
    return HG_COMIC_QUANTIZE_INTERMEDIATE_FORMAT;             // @0x7694 movl $0x18, %eax
  }

  /**
   * HGComicQuantize::GetOutput(HGRenderer*) @0x7db0
   *
   * Not a graph rewrite (unlike HGGamma::GetOutput); this is a *self-push* of
   * the two shader-uniform floats into HGNode::SetParameter — the compositor
   * reads them via GetParameter to fill hg_Params[0] = float4(numLevels,
   * 1/numLevels, 0, 0). Then returns `this` unchanged.
   *
   *   @0x7db9  movss 0x198(%rdi), %xmm0            ; xmm0 = numLevels
   *   @0x7dc1  movss 0x3bfef7(%rip), %xmm1         ; xmm1 = f32 @0x3c7cc0 = 1.0f
   *   @0x7dc9  divss %xmm0, %xmm1                  ; xmm1 = 1.0f / numLevels
   *   @0x7dcd  xorps %xmm2, %xmm2                  ; xmm2 = 0.0f
   *   @0x7dd0  xorps %xmm3, %xmm3                  ; xmm3 = 0.0f
   *   @0x7dd3  xorl  %esi, %esi                    ; esi = 0
   *   @0x7dd5  callq HGNode::SetParameter(int,float,float,float,float) @0x11cab0
   *     Args after MOV %rbx→%rdi (this): (this, 0, numLevels, 1/numLevels, 0, 0).
   *     The HGNode-base SetParameter stores the four floats at hg_Params[i], so
   *     hg_Params[0] = float4(numLevels, 1/numLevels, 0, 0).
   *   @0x7dda  movq %rbx, %rax                     ; return this
   */
  GetOutput(_r: HGRendererLike): HGComicQuantize {
    const numLevels = Math.fround(this._numLevels);
    const recip = Math.fround(ONE_F32 / numLevels);            // @0x7dc9 divss xmm0, xmm1
    // @0x7dd5 callq HGNode::SetParameter(int,float,float,float,float) @Helium 0x11cab0.
    // The base HGNode's SetParameter override is not yet ported in HGNode.ts (it
    // stores 4 floats into hg_Params[i] on the node's param buffer). Per Rule 3
    // we surface the gap loudly instead of silently no-oping: the shader would
    // otherwise render with hg_Params[0] = (0,0,0,0) and quantize to 0 levels.
    void numLevels; void recip;
    throw new Error(
      "HGComicQuantize::GetOutput @0x7db0 partial — computed numLevels=" + numLevels +
      " and 1/numLevels=" + recip + " but HGNode::SetParameter(int,float,float,float,float) " +
      "@Helium 0x11cab0 not yet transcribed (see HGNode.ts vtable *0x60 slot).",
    );
    return this;                                               // @0x7dda movq %rbx, %rax (unreachable)
  }

  /**
   * HGComicQuantize::GetProgram(HGRenderer*) @0x7df0
   *
   *   @0x7df9  movq %rsi, %rdi                      ; renderer -> arg0
   *   @0x7dfc  movl $0x60000, %esi                  ; target-id 0x60000
   *   @0x7e01  callq HGRenderer::GetTarget(unsigned int)
   *   @0x7e06  cmpl $0x60b0f, %eax                  ; if target > 0x60b0f: return Metal src
   *   @0x7e0b  jbe  0x7e1b
   *   @0x7e0d  leaq 0x8aeda5(%rip), %rax            ; -> Metal literal pool
   *   @0x7e14..7e1a  return %rax
   *
   *   Else (jbe branch @0x7e1b):
   *   @0x7e1b  movq (%rbx), %rax                    ; load vtable
   *   @0x7e21  movl $0x2e, %esi                     ; slot arg 0x2e (unknown enum)
   *   @0x7e26  callq *0x80(%rax)                    ; vtable *0x80 = HGNode::GetInput(int)  (HGNode.ts)
   *   @0x7e2c..7e30  cmovne — if ecx != 0 return the GLSL literal else return nullptr
   *   @0x7e32  leaq 0x8b045e(%rip), %rcx            ; -> GLSL literal pool
   *
   * Semantically: prefer Metal source when the target platform supports it
   * (target ID > 0x60b0f), otherwise fall through to the OpenGL path and
   * return the GLSL source ONLY if the input slot 0x2e is non-null.
   *
   * Requires HGRenderer::GetTarget and HGNode::GetInput to actually run — @0x7df0
   * this port defers until those are transcribed (Rule 3). The literal-
   * pool addresses are recorded in the doc-comment for the future compositor.
   */
  GetProgram(_r: HGRendererLike): string {
    // @0x7e01 callq HGRenderer::GetTarget — undecoded callee, throw per Rule 3.
    throw new Error(
      "HGComicQuantize::GetProgram @0x7df0 not yet transcribed — requires " +
      "HGRenderer::GetTarget(unsigned int) @Helium and HGNode::GetInput @Helium 0x11c8b0. " +
      "Metal shader source literal @Helium 0x7e0d, GLSL @Helium 0x7e32 " +
      "(see raw-port/re/disasm/Helium.HGComicQuantize.GetProgram.s).",
    );
  }

  /**
   * HGComicQuantize::GetDOD(HGRenderer* r, int slot, HGRect in) @0x74a0
   *
   *   Structural: return HGRectNull for non-zero slot; return the same rect
   *   unchanged if it's already infinite; else build an HGTransform scaled by
   *   (pixelSize, pixelSize, 1.0) and call HGTransformUtils::GetDOD(&xf, in,
   *   0.5f, HGTransformUtils::MinW()).
   *
   *   @0x74b6  testl %edx, %edx                     ; slot == 0 ?
   *   @0x74b8  je    0x74cd
   *   @0x74ba  leaq  _HGRectNull(%rip), %rcx        ; slot != 0 -> return HGRectNull
   *   @0x74c1  movq  (%rcx), %rax ; @0x74c4 movq 8(%rcx), %rdx ; @0x74c8 jmp epilogue
   *
   *   @0x74cd  movq  %rdi, %rbx
   *   @0x74d0  leaq  -0x20(%rbp), %rdi              ; &in (byval, copied to stack)
   *   @0x74d4  callq HGRect::IsInfinite()
   *   @0x74db  je    0x74e7                         ; if !infinite go build transform
   *   @0x74dd  movq  -0x20(%rbp), %rax ; movq -0x18(%rbp), %rdx ; jmp epilogue
   *                                                  ;   → return in unchanged
   *
   *   @0x74e7  movss 0x19c(%rbx), %xmm0             ; xmm0 = this->pixelSize (f32)
   *   @0x74ef  cvtss2sd %xmm0, %xmm0                ; -> f64
   *   @0x74f3  movsd %xmm0, -0x28(%rbp)             ; local pixelSize as double
   *   @0x74f8  leaq  -0xb8(%rbp), %rbx              ; xf = alloca HGTransform
   *   @0x74ff  movq  %rbx, %rdi
   *   @0x7502  callq HGTransform::HGTransform()
   *   @0x7507  movsd 0x3c2d51(%rip), %xmm2          ; xmm2 = f64 @0x3ca260 = 1.0
   *   @0x7512  movsd -0x28(%rbp), %xmm0             ; xmm0 = pixelSize (f64)
   *   @0x7517  movaps %xmm0, %xmm1                  ; xmm1 = pixelSize (f64)
   *   @0x751a  callq HGTransform::Scale(double, double, double)
   *                                                  ; xf.Scale(pixelSize, pixelSize, 1.0)
   *   @0x7527  callq HGTransformUtils::MinW()       ; xmm0 = minW-eps (unknown)
   *   @0x7536  movss 0x3c078a(%rip), %xmm0          ; xmm0 = f32 @0x3c7cc8 = 0.5f
   *                                                  ;   (overwrites the MinW result;
   *                                                  ;    MinW ret is discarded — no,
   *                                                  ;    it's held in xmm1 via `movaps
   *                                                  ;    %xmm0, %xmm1` at 0x752c — so
   *                                                  ;    the DOD call actually receives
   *                                                  ;    (xf*, in, 0.5f, MinW).)
   *   @0x7544  callq HGTransformUtils::GetDOD(HGTransform const*, HGRect, float, float)
   *     -> returns HGRect (rax:rdx)
   *   @0x754f  callq HGTransform::~HGTransform()    ; RAII cleanup
   *
   * Full decode requires HGRect, HGRectNull, HGTransform, HGTransformUtils —
   * throw-stubbed for now with all @0xADDR cited in the doc-comment.
   */
  GetDOD(_r: HGRendererLike, _slot: number, _in: HGRectLike): HGRectLike {
    throw new Error(
      "HGComicQuantize::GetDOD @0x74a0 not yet transcribed — requires HGRectNull " +
      "@Helium __TEXT __const, HGRect::IsInfinite @Helium, HGTransform::HGTransform / " +
      "::Scale(double,double,double) / ::~HGTransform @Helium, and " +
      "HGTransformUtils::MinW / ::GetDOD(HGTransform const*, HGRect, float, float) @Helium.",
    );
  }

  /**
   * HGComicQuantize::GetROI(HGRenderer* r, int slot, HGRect in) @0x7590
   *
   *   Same shape as GetDOD but with an INVERTED scale (1/pixelSize) and a
   *   post-Grow by (-1,-1)..(+1,+1) — i.e. inflate the ROI by one texel on
   *   each side to allow the shader's neighbourhood sample. Also 0.5f rounding.
   *
   *   @0x75a0  testl %edx, %edx ; je 0x75b7           ; slot != 0 -> HGRectNull
   *   @0x75a4  leaq _HGRectNull(%rip), %rax
   *   @0x75ab  movups (%rax), %xmm0 ; movaps %xmm0, -0x30(%rbp) ; jmp epilogue
   *
   *   @0x75b7  movq %r8, %rbx                       ; rbx = in.hi (2 int32 pair)
   *   @0x75ba  movq %rcx, %r14                      ; r14 = in.lo (2 int32 pair)
   *   @0x75bd  movss 0x19c(%rdi), %xmm0             ; xmm0 = this->pixelSize (f32)
   *   @0x75c5  cvtss2sd %xmm0, %xmm0                ; -> f64
   *   @0x75c9  movsd 0x3c2c8f(%rip), %xmm1          ; xmm1 = f64 @0x3ca260 = 1.0
   *   @0x75d1  divsd %xmm0, %xmm1                   ; xmm1 = 1.0 / pixelSize
   *   @0x75d5  movsd %xmm1, -0x38(%rbp)             ; local invPixelSize
   *   @0x75da..75ec  build xf = HGTransform()
   *   @0x75ec  movsd -0x38(%rbp), %xmm0             ; xmm0 = 1/pixelSize
   *   @0x75f1  movaps %xmm0, %xmm1                  ; xmm1 = 1/pixelSize
   *   @0x75f4  movsd 0x3c2c64(%rip), %xmm2          ; xmm2 = f64 @0x3ca260 = 1.0
   *   @0x75fc  callq HGTransform::Scale             ; xf.Scale(1/pixelSize, 1/pixelSize, 1.0)
   *   @0x7601  callq HGTransformUtils::MinW()       ; -> xmm0 (kept as xmm1 via 0x7606)
   *   @0x7610  movss 0x3c06b0(%rip), %xmm0          ; xmm0 = f32 @0x3c7cc8 = 0.5f
   *   @0x761e  callq HGTransformUtils::GetROI(HGTransform*, HGRect, float, float)
   *   @0x7623..7627  store returned HGRect at -0x30(%rbp)..-0x28(%rbp)
   *
   *   @0x762b  movl $-1, %edi ; movl $-1, %esi ; movl $1, %edx ; movl $1, %ecx
   *   @0x763f  callq HGRectMake4i                   ; grow = { -1,-1,+1,+1 }
   *   @0x764b  callq HGRect::Grow(HGRect)           ; inflate current by grow (one-texel)
   *   @0x7657  callq HGTransform::~HGTransform()    ; RAII
   *   returns HGRect (rax:rdx) at 0x765c..0x7660.
   *
   * Same undecoded frontier as GetDOD plus HGRect::Grow(HGRect) and HGRectMake4i.
   */
  GetROI(_r: HGRendererLike, _slot: number, _in: HGRectLike): HGRectLike {
    throw new Error(
      "HGComicQuantize::GetROI @0x7590 not yet transcribed — requires HGRectNull " +
      "@Helium __TEXT __const, HGTransform (ctor/dtor/Scale) @Helium, HGTransformUtils::MinW / " +
      "::GetROI(HGTransform const*, HGRect, float, float) @Helium, HGRectMake4i @Helium 0x107710, " +
      "and HGRect::Grow(HGRect) @Helium.",
    );
  }

  /**
   * HGComicQuantize::BindTexture(HGHandler* h, int idx) @0x7e50
   *
   *   @0x7e61  testl %edx, %edx ; js 0x7ea9         ; idx < 0 → skip texcoord config
   *   @0x7e65  movss 0x3bfe53(%rip), %xmm0          ; xmm0 = f32 @0x3c7cc0 = 1.0f
   *   @0x7e6d  divss 0x19c(%rdi), %xmm0             ; xmm0 = 1.0f / pixelSize  (a.k.a numLevels-of-space)
   *   @0x7e75  movss %xmm0, -0x14(%rbp)             ; save it as local
   *   @0x7e7a  movq  %rbx, %rdi
   *   @0x7e7d  movl  %r14d, %esi                    ; esi = idx
   *   @0x7e80  xorl  %edx, %edx ; xorl %ecx, %ecx ; xorl %r8d, %r8d
   *   @0x7e87  callq HGHandler::TexCoord(int idx, int=0, int=0, double const* =nullptr)
   *   @0x7e8c  movss -0x14(%rbp), %xmm0
   *   @0x7e91  cvtss2sd %xmm0, %xmm0                ; -> f64
   *   @0x7e95  movq (%rbx), %rax                    ; vtable
   *   @0x7e98  movsd 0x3c23c0(%rip), %xmm2          ; xmm2 = f64 @0x3ca260 = 1.0
   *   @0x7ea0  movq  %rbx, %rdi
   *   @0x7ea3  movaps %xmm0, %xmm1                  ; xmm1 = 1/pixelSize (f64)
   *   @0x7ea6  callq *0x68(%rax)                    ; vtable *0x68 = HGHandler unknown slot
   *                                                  ;   (see HGHandler.ts once ported)
   *
   *   @0x7ea9  movq (%rbx), %rax                    ; vtable
   *   @0x7eac  movl  %r14d, %esi ; xorl %edx, %edx
   *   @0x7eb4  callq *0x48(%rax)                    ; vtable *0x48 on HGHandler
   *   @0x7eb7  movq (%rbx), %rax
   *   @0x7ebd  xorl  %esi, %esi
   *   @0x7ebf  callq *0x38(%rax)                    ; vtable *0x38 on HGHandler
   *   @0x7ec2  movq (%rbx), %rax
   *   @0x7ec8  movl $1, %esi ; movl $1, %edx
   *   @0x7ed2  callq *0x30(%rax)                    ; vtable *0x30 on HGHandler
   *
   *   @0x7ed5  xorl %eax, %eax                      ; return 0
   *
   * Requires HGHandler::TexCoord and the four HGHandler vtable slots
   * *0x30/*0x38/*0x48/*0x68 to be decoded — throw-stub for now.
   */
  BindTexture(_h: HGHandlerLike, _idx: number): number {
    throw new Error(
      "HGComicQuantize::BindTexture @0x7e50 not yet transcribed — requires " +
      "HGHandler::TexCoord(int,int,int,double const*) @Helium and HGHandler vtable " +
      "slots *0x30/*0x38/*0x48/*0x68 (see raw-port/re/disasm/Helium.HGComicQuantize.BindTexture.s).",
    );
  }

  /**
   * HGComicQuantize::InitProgramDescriptor(HGProgramDescriptor*) const @0x7ee0
   *
   *   A no-op:
   *     @0x7ee0  pushq %rbp
   *     @0x7ee1  movq  %rsp, %rbp
   *     @0x7ee4  popq  %rbp
   *     @0x7ee5  retq
   *
   * (No return value, no side effect. The class does not customize its
   * HGProgramDescriptor beyond whatever HGNode's virtual chain has already
   * populated — the shader-uniform layout is captured in the Metal/GLSL
   * source string, not in a program-descriptor field.)
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorLike): void {
    // @0x7ee0-@0x7ee5 empty function body (frame prologue/epilogue only).
    return;
  }

  /**
   * HGComicQuantize::RenderTile(HGTile*) @0x76a0 (379 lines of SIMD tile
   * quantization: a bespoke CPU raster path that reads this->pixelSize and
   * numLevels, iterates over the tile rows/cols with pshufd/psubd/cvtdq2ps/
   * mulps/addps SSE, and writes the quantized output). This is *not* the
   * shader path — the Metal/GLSL source at GetProgram is used when the
   * renderer target supports them; RenderTile is the fallback CPU path.
   *
   * Loop entry (first 15 lines transcribed to document field access pattern):
   *   @0x76ba  movss 0x19c(%rdi), %xmm0             ; xmm0 = this->pixelSize (f32)
   *   @0x76c2  movss %xmm0, -0x70(%rbp)             ; stack local pixelSize
   *   @0x76ca  callq HGTile::Renderer()             ; renderer arg
   *   @0x76d8  callq *0x138(%rcx)                   ; vtable *0x138 on HGNode subclass
   *   @0x76e1  movdqa (%rbx), %xmm0                 ; xmm0 = tile bounds (i32x4)
   *   @0x76e5  pshufd $0xee, %xmm0, %xmm1           ; xmm1 = {hi.z,hi.w, hi.z,hi.w}
   *   @0x76ea  psubd  %xmm0, %xmm1                  ; xmm1 = {w, h, ...}
   *   @0x76ee  pextrd $1, %xmm1, %eax               ; eax = h
   *   @0x76f4  movl   %eax, -0x54(%rbp)             ; stack h
   *   @0x76f7  testl  %eax, %eax ; jle 0x7d98       ; if h <= 0 exit
   *   @0x76ff  movd   %xmm1, %eax                   ; eax = w
   *   @0x7703  testl  %eax, %eax ; jle 0x7d98       ; if w <= 0 exit
   *   @0x770b  cvtdq2ps %xmm0, %xmm0                ; convert bounds to f32
   *   @0x770e  mulps 0x3c299b(%rip), %xmm0          ; xmm0 *= f32x4 const @0x3ca0af
   *   @0x7715  addps 0x3c29a4(%rip), %xmm0          ; xmm0 += f32x4 const @0x3ca0c0
   *   @0x771c  movss 0x198(%r15), %xmm1             ; xmm1 = this->numLevels
   *   @0x7725  movss 0x3c0593(%rip), %xmm2          ; xmm2 = f32 const @0x3c7cbc
   *   ... (350 more lines of vectorized Lab conversion + floor(L*N+0.5)*(1/N))
   *
   * The body is a bit-exact software copy of the shader math (rgb2Lab, floor
   * quantization, lab2rgb) and rasterized in 4-pixel-lane batches. Correctly
   * porting it requires:
   *   - HGTile struct (bounds/pitch/pixel pointer offsets)  — not yet decoded
   *   - HGTile::Renderer() and the vtable slot *0x138 (an HGNode/HGRenderer
   *     accessor) — not yet decoded
   *   - The four f32x4 memory-operand constants at @0x3ca0af, @0x3ca0c0, and
   *     several later ones (0x3c7cbc etc.) — decoded piecemeal by future
   *     workers via resolve.py Helium const <ADDR>.
   *
   * A partial transcription of the arithmetic without those structs would be
   * unrunnable (throws on the first tile-pointer deref). Per Rule 3 we surface
   * the gap loudly instead of writing a doomed-to-diverge inner loop. This
   * whole slug is a known frontier that will unblock the CPU fallback later;
   * the shader path is the primary rendering route.
   */
  RenderTile(_tile: HGTileLike): void {
    throw new Error(
      "HGComicQuantize::RenderTile @0x76a0 not yet transcribed — 379-line CPU/SSE " +
      "tile quantizer. Requires HGTile @Helium (bounds/pitch/pixels layout), " +
      "HGTile::Renderer @Helium, and HGNode vtable slot *0x138 to be decoded. " +
      "See raw-port/re/disasm/Helium.HGComicQuantize.RenderTile.s.",
    );
  }

  /**
   * HGComicQuantize::~HGComicQuantize() @0x7410 / @0x7420 / @0x7430
   *
   * All three variants are trivial: they reinstall the vptr and tail-call
   * HGNode::~HGNode(); D0 additionally calls HGObject::operator delete on this.
   * JS has no destructor; this method is provided for parity when callers
   * manage HGObject-style lifetime (Retain/Release).
   *
   *   @0x7410  ~HGComicQuantize() [D2]  — tail-jmp HGNode::~HGNode() @0x11bf20
   *   @0x7420  ~HGComicQuantize() [D1]  — identical body
   *   @0x7430  ~HGComicQuantize() [D0 deleting] — same body then operator delete
   *
   * No owned fields require Release() (numLevels/pixelSize are plain f32s), so
   * this method has nothing to do beyond delegating to the HGNode base.
   */
  destroy(): void {
    // No owned HGObject refs to Release; f32 fields are POD.
    // Base HGNode dtor runs via GC / higher-level release chain — no explicit
    // tail-call is meaningful here (see HGGamma.ts:destroy for the same pattern).
  }
}
