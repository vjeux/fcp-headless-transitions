// raw-port/src/render/HEquirectReorientImpl.ts
//
// FCP `HEquirectReorientImpl` — Helium subclass of `HgcEquirectReorient`
// (the 360°/equirectangular reorientation compositor leaf). This class
// owns three overrides that specialise the base leaf's behaviour:
//
//   1. `SetUpDefaultPixelTransform()`  — @0x3a40 (Helium x86_64 thin
//      slice; VA==file offset). Reads the source width (param 0) and
//      height (param 1) via `HGNode::GetParameter` (vtable *0x68), then
//      writes four 4-component pixel-transform basis vectors into
//      params 5/6/7/8 via `HGNode::SetParameter` (vtable *0x60).
//      This is the pure-math method in the class — a fixed-point
//      "centre the source in a WxH box" pixel transform.
//   2. `GetDOD(HGRenderer*, int, HGRect)`  — @0x3b50 — the domain-of-
//      definition rewriter for output rects. SIMD-heavy (movaps / mulps /
//      insertps / shufps against 16-byte f32 vec constants in the __const
//      pool). Throw-stubbed pending decode of the vec constants.
//   3. `GetROI(HGRenderer*, int, HGRect)`  — @0x3d30 — the region-of-
//      interest rewriter for input rects (inverse of GetDOD). Same SIMD
//      shape as GetDOD, also throw-stubbed.
//
// Plus the dtors:
//   0x4830  HEquirectReorientImpl::~HEquirectReorientImpl()  [D1 complete dtor — tail-jmp to HgcEquirectReorient::~HgcEquirectReorient()]
//   0x4840  HEquirectReorientImpl::~HEquirectReorientImpl()  [D0 deleting dtor: HgcEquirectReorient::~HgcEquirectReorient(); then HGObject::operator delete]
// (D2 is ICF-folded into HgcEquirectReorient's own D2 — no separate
// symbol emitted, per `nm -n | c++filt` output.)
//
// STRUCT LAYOUT: HEquirectReorientImpl has NO fields of its own beyond
// the inherited HgcEquirectReorient base — D1 is just `pushq %rbp ; movq
// %rsp, %rbp ; popq %rbp ; jmp HgcEquirectReorient::~HgcEquirectReorient`
// (@0x4830..0x4835), which means there are no member destructors between
// the top of the object and the base's dtor. Any per-instance state used
// by the three overrides is stored in the base's shader-uniform buffer,
// accessed via the *0x68 (GetParameter) / *0x60 (SetParameter) vtable
// slots — the same ABI HGNode uses.

import { HGNode } from "./HGNode.js";

/**
 * Opaque HGRenderer handle (owned by the compositor at render time).
 * Held opaquely at the port level; the two rect-rewriter overrides that
 * receive one (GetDOD @0x3b50 and GetROI @0x3d30) throw with an @0xADDR
 * citation.
 */
export interface HGRendererLike { readonly __hgRenderer: true; }

/**
 * Opaque HGRect (rax:rdx 128-bit rect, i.e. two i64 halves each packing
 * two i32s for left/top and right/bottom). Modeled as an opaque struct
 * here — the two rect-rewriter overrides that consume one are throw-
 * stubbed pending decode of `HGRect::IsNull()`, `_HGRectNull`, and the
 * SIMD vec4 constants used by GetDOD / GetROI.
 */
export interface HGRectLike { readonly __hgRect: true; }

/**
 * Address of the FCP `HgcEquirectReorient` base type. This class extends
 * that type but the base isn't ported yet (parent's decoded methods live
 * at Helium @0x3627b0/0x3627e0/0x362b10/0x362b60/0x362c10 — GetProgram,
 * InitProgramDescriptor, shaderDescription, BindTexture, Bind — plus its
 * own dtor @HgcEquirectReoriment::~HgcEquirectReorient tail-called from
 * this class's D1 @0x4835 and D0 @0x4849). At the port level we express
 * the "is-a compositor node" relation by structural inheritance from
 * `HGNode`, and stub out the parent methods that this class doesn't
 * override.
 */
export abstract class HgcEquirectReorientLike extends HGNode {
  /**
   * @HgcEquirectReorient::~HgcEquirectReorient  — invoked by our D0/D1
   * @0x4835 / @0x4849. Placeholder here; the parent isn't ported yet so
   * we only need to know the tail-call exists.
   */
  destroyBase(): void {
    // Base HgcEquirectReorient::~HgcEquirectReorient() @Helium — undecoded.
    // No observable state on this JS layer, so this is a no-op at the port level;
    // the address is preserved in the doc so `frontier.py` sees the gap.
  }
}

/**
 * HEquirectReorientImpl — reorientation of 360° equirectangular imagery,
 * with a specialised default pixel-transform and a matching DOD/ROI pair.
 *
 * All four overrides here call through the HGNode vtable *0x60 / *0x68
 * (SetParameter / GetParameter). Those slots are undecoded at the port
 * level, so the pure-math method exposes them as `_get_param(i)` /
 * `_set_param(i, x, y, z, w)` stubs whose bodies throw with an @0xADDR
 * citation — a Rule-3 loud gap. The class contains no fields of its
 * own (see LAYOUT note above), so there is no per-instance state to
 * initialise or tear down beyond what the base owns.
 */
export class HEquirectReorientImpl extends HgcEquirectReorientLike {
  /**
   * HEquirectReorientImpl::~HEquirectReorientImpl() — three-address
   * dispatch. Only D1 and D0 have distinct symbols (D2 is ICF-folded
   * into `HgcEquirectReorient::~HgcEquirectReorient`, which is what the
   * two variants below tail-call anyway):
   *
   *   D1 @0x4830 (complete dtor):
   *     @0x4830 pushq %rbp
   *     @0x4831 movq  %rsp, %rbp
   *     @0x4834 popq  %rbp
   *     @0x4835 jmp   HgcEquirectReorient::~HgcEquirectReorient()
   *
   *   D0 @0x4840 (deleting dtor):
   *     @0x4840 pushq %rbp
   *     @0x4841 movq  %rsp, %rbp
   *     @0x4844 pushq %rbx
   *     @0x4845 pushq %rax
   *     @0x4846 movq  %rdi, %rbx                    — save this.
   *     @0x4849 callq HgcEquirectReorient::~HgcEquirectReorient()
   *     @0x484e movq  %rbx, %rdi                    — restore this.
   *     @0x4851 addq  $0x8, %rsp
   *     @0x4855 popq  %rbx
   *     @0x4856 popq  %rbp
   *     @0x4857 jmp   HGObject::operator delete(void*)
   *
   * Body of both is "hand off to base dtor" — no member cleanup because
   * the class has no members. Modeled here as a JS `destroy()` that
   * delegates to `destroyBase()` (see HgcEquirectReorientLike).
   */
  destroy(): void {
    // @0x4835 (D1) / @0x4849 (D0) callq HgcEquirectReorient::~HgcEquirectReorient
    this.destroyBase();
    // @0x4857 (D0 only) jmp HGObject::operator delete — handled by the
    // higher-level release chain / GC. Not modeled at this layer.
  }

  /**
   * HEquirectReorientImpl::SetUpDefaultPixelTransform() @0x3a40
   *
   * Configures the default 4-vec pixel-transform basis + centre offsets
   * on this node. Reads the source width (param 0) and height (param 1)
   * and writes four 4-float vectors into params 5, 6, 7, 8 encoding a
   * centred axis-aligned identity transform of size (width × height).
   *
   * Straight-line body (rdi/rbx = this throughout):
   *
   *   Prologue @0x3a40..0x3a56:
   *     pushq %rbp / movq %rsp,%rbp / pushq %rbx / subq $0x28,%rsp
   *     movq rdi,%rbx ; save the __stack_chk_guard cookie at -0x10.
   *
   *   Read `width` = param 0 into stack slot -0x24:
   *     @0x3a5a movq (%rdi), %rax
   *     @0x3a5d leaq -0x20(%rbp), %rdx
   *     @0x3a61 xorl %esi, %esi                    — idx = 0
   *     @0x3a63 callq *0x68(%rax)                  — GetParameter(0, &tmp[-0x20])
   *     @0x3a66 movss -0x20(%rbp), %xmm0           — first f32 of the 8-byte return.
   *     @0x3a6b movss %xmm0, -0x24(%rbp)           — width = xmm0
   *
   *   Read `height` = param 1 into stack slot -0x28:
   *     @0x3a70 movq (%rbx), %rax
   *     @0x3a73 leaq -0x20(%rbp), %rdx
   *     @0x3a77 movq %rbx, %rdi
   *     @0x3a7a movl $0x1, %esi                    — idx = 1
   *     @0x3a7f callq *0x68(%rax)                  — GetParameter(1, &tmp[-0x20])
   *     @0x3a82 movss -0x20(%rbp), %xmm0
   *     @0x3a87 movss %xmm0, -0x28(%rbp)           — height = xmm0
   *
   *   SetParameter(7, x=1.0f, y=0.0f, z=0.0f, w=width*0.5f):
   *     @0x3a8c movss -0x24(%rbp), %xmm3           — xmm3 = width
   *     @0x3a91 mulss 0x3c422f(%rip), %xmm3        — xmm3 *= @0x3c7cc8 = 0.5f
   *     @0x3a99 movq  (%rbx), %rax
   *     @0x3a9c movss 0x3c421c(%rip), %xmm0        — xmm0 = @0x3c7cc0 = 1.0f
   *     @0x3aa4 xorps %xmm1, %xmm1                 — xmm1 = 0.0f
   *     @0x3aa7 xorps %xmm2, %xmm2                 — xmm2 = 0.0f
   *     @0x3aaa movq  %rbx, %rdi
   *     @0x3aad movl  $0x7, %esi                   — idx = 7
   *     @0x3ab2 callq *0x60(%rax)                  — SetParameter(7, 1, 0, 0, w*0.5f)
   *
   *   SetParameter(8, x=0.0f, y=1.0f, z=0.0f, w=height*0.5f):
   *     @0x3ab5 movss 0x3c420b(%rip), %xmm3        — xmm3 = @0x3c7cc8 = 0.5f
   *     @0x3abd mulss -0x28(%rbp), %xmm3           — xmm3 *= height
   *     @0x3ac2 movq  (%rbx), %rax
   *     @0x3ac5 xorps %xmm0, %xmm0                 — xmm0 = 0.0f
   *     @0x3ac8 xorps %xmm2, %xmm2                 — xmm2 = 0.0f
   *     @0x3acb movq  %rbx, %rdi
   *     @0x3ace movl  $0x8, %esi                   — idx = 8
   *     @0x3ad3 movss 0x3c41e5(%rip), %xmm1        — xmm1 = @0x3c7cc0 = 1.0f
   *     @0x3adb callq *0x60(%rax)                  — SetParameter(8, 0, 1, 0, h*0.5f)
   *
   *   SetParameter(5, x=1.0f, y=0.0f, z=0.0f, w=width*-0.5f):
   *     @0x3ade movss -0x24(%rbp), %xmm3           — xmm3 = width
   *     @0x3ae3 mulss 0x3c41e1(%rip), %xmm3        — xmm3 *= @0x3c7ccc = -0.5f
   *     @0x3aeb movq  (%rbx), %rax
   *     @0x3aee xorps %xmm1, %xmm1                 — xmm1 = 0.0f
   *     @0x3af1 xorps %xmm2, %xmm2                 — xmm2 = 0.0f
   *     @0x3af4 movq  %rbx, %rdi
   *     @0x3af7 movl  $0x5, %esi                   — idx = 5
   *     @0x3afc movss 0x3c41bc(%rip), %xmm0        — xmm0 = @0x3c7cc0 = 1.0f
   *     @0x3b04 callq *0x60(%rax)                  — SetParameter(5, 1, 0, 0, w*-0.5f)
   *
   *   SetParameter(6, x=0.0f, y=1.0f, z=0.0f, w=height*-0.5f):
   *     @0x3b07 movss -0x28(%rbp), %xmm3           — xmm3 = height
   *     @0x3b0c mulss 0x3c41b8(%rip), %xmm3        — xmm3 *= @0x3c7ccc = -0.5f
   *     @0x3b14 movq  (%rbx), %rax
   *     @0x3b17 xorps %xmm0, %xmm0                 — xmm0 = 0.0f
   *     @0x3b1a xorps %xmm2, %xmm2                 — xmm2 = 0.0f
   *     @0x3b1d movq  %rbx, %rdi
   *     @0x3b20 movl  $0x6, %esi                   — idx = 6
   *     @0x3b25 movss 0x3c4193(%rip), %xmm1        — xmm1 = @0x3c7cc0 = 1.0f
   *     @0x3b2d callq *0x60(%rax)                  — SetParameter(6, 0, 1, 0, h*-0.5f)
   *
   *   Epilogue @0x3b30..0x3b46: __stack_chk_guard verify + return; @0x3b47
   *   tail-calls ___stack_chk_fail on mismatch. Not modeled — TS has no
   *   equivalent stack-canary check.
   *
   * Constants (decoded from /tmp/Helium.x86_64 at file offset == VA):
   *   @0x3c7cc0  u32=0x3f800000  f32= 1.0f
   *   @0x3c7cc8  u32=0x3f000000  f32= 0.5f
   *   @0x3c7ccc  u32=0xbf000000  f32=-0.5f
   *
   * Numerical shape of the four writes:
   *   Params 7/8 hold the "output half-extent" basis:
   *       p7 = (1, 0, 0, +w/2)   — +X axis with +width/2 offset
   *       p8 = (0, 1, 0, +h/2)   — +Y axis with +height/2 offset
   *   Params 5/6 hold the mirrored (negative) half-extent basis:
   *       p5 = (1, 0, 0, -w/2)   — +X axis with -width/2 offset
   *       p6 = (0, 1, 0, -h/2)   — +Y axis with -height/2 offset
   *
   * These four vec4s together specify the corners of an axis-aligned
   * (w × h) rectangle centred on the origin — the "identity" reorientation
   * output when no equirect rotation has been applied. All f32 sub-
   * expressions are single-precision (mulss); ports are guarded with
   * `Math.fround` at every arithmetic boundary per Rule 4.
   */
  SetUpDefaultPixelTransform(): void {
    // @0x3a5a-0x3a6b GetParameter(0, ...) -> width (first f32 of return slot).
    const width = Math.fround(this._get_param_f32_0());
    // @0x3a70-0x3a87 GetParameter(1, ...) -> height.
    const height = Math.fround(this._get_param_f32_0_at(1));

    // @0x3a8c-0x3ab2 SetParameter(7, 1, 0, 0, w * 0.5f).
    //   NOTE: mulss @0x3a91 uses xmm3 (already loaded with width) *= 0.5f.
    //   Faithful single-precision transcription: fround the product.
    this._set_param(
      7,
      1.0,                                        // @0x3a9c @0x3c7cc0
      0.0,                                        // @0x3aa4 xorps
      0.0,                                        // @0x3aa7 xorps
      Math.fround(width * Math.fround(0.5)),      // @0x3a91 mulss @0x3c7cc8
    );

    // @0x3ab5-0x3adb SetParameter(8, 0, 1, 0, h * 0.5f).
    //   xmm3 = 0.5f (loaded from const first @0x3ab5) then mulss with -0x28 (height) @0x3abd.
    this._set_param(
      8,
      0.0,                                        // @0x3ac5 xorps
      1.0,                                        // @0x3ad3 @0x3c7cc0
      0.0,                                        // @0x3ac8 xorps
      Math.fround(Math.fround(0.5) * height),     // @0x3ab5 movss @0x3c7cc8 ; @0x3abd mulss -0x28
    );

    // @0x3ade-0x3b04 SetParameter(5, 1, 0, 0, w * -0.5f).
    //   xmm3 = width (from -0x24) then mulss with @0x3c7ccc = -0.5f @0x3ae3.
    this._set_param(
      5,
      1.0,                                        // @0x3afc @0x3c7cc0
      0.0,                                        // @0x3aee xorps
      0.0,                                        // @0x3af1 xorps
      Math.fround(width * Math.fround(-0.5)),     // @0x3ae3 mulss @0x3c7ccc
    );

    // @0x3b07-0x3b2d SetParameter(6, 0, 1, 0, h * -0.5f).
    //   xmm3 = height (from -0x28) then mulss with @0x3c7ccc = -0.5f @0x3b0c.
    this._set_param(
      6,
      0.0,                                        // @0x3b17 xorps
      1.0,                                        // @0x3b25 @0x3c7cc0
      0.0,                                        // @0x3b1a xorps
      Math.fround(height * Math.fround(-0.5)),    // @0x3b0c mulss @0x3c7ccc
    );
  }

  /**
   * HEquirectReorientImpl::GetDOD(HGRenderer*, int, HGRect) @0x3b50
   *
   * Domain-of-definition rewriter. 117-line disasm; body reads params
   * 0/1/7/8 via GetParameter (*0x68), then runs a SIMD sequence over the
   * incoming rect that includes:
   *   - `insertps` at @0x3c0e (blend f32 lane 0 into lane 1 of xmm10).
   *   - `mulps`   against 16-byte f32 vec constants at @0x3c1d / @0x3c21
   *     (RIP-rel loads from the __const pool at Helium @0x3c65f0 / @0x3c6600
   *     — file offset == VA on the thin slice).
   *   - `movshdup` and `shufps` selectors to move f32 lanes between vecs.
   *   - Early-return path @0x3b83 if `HGRect::IsNull()` returns true on
   *     the caller-supplied rect (idx==0 case), returning `_HGRectNull`
   *     verbatim at @0x3b83..0x3b91.
   *
   * Per Rule 3, throw-stubbed until:
   *   (a) `HGRect::IsNull()` and `_HGRectNull` symbols land,
   *   (b) the two 16-byte SIMD constants at Helium @0x3c65f0 and @0x3c6600
   *       are decoded (each is a 4-lane f32 vector — likely {0.5, 0.5,
   *       0.5, 0.5} and {-0.5, -0.5, -0.5, -0.5} by analogy with
   *       SetUpDefaultPixelTransform above, but that guess is NOT confirmed
   *       and shipping it would violate Rule 3),
   *   (c) `HGNode::GetParameter` vtable *0x68 ABI is transcribed.
   */
  GetDOD(_r: HGRendererLike, _i: number, _rect: HGRectLike): HGRectLike {
    throw new Error(
      "HEquirectReorientImpl::GetDOD @0x3b50 not yet transcribed — requires " +
        "HGRect::IsNull() @Helium, _HGRectNull @Helium data symbol, " +
        "HGNode::GetParameter vtable *0x68 ABI @Helium, and decode of two " +
        "SIMD f32-vec4 constants at Helium __const @0x3c65f0 and @0x3c6600.",
    );
  }

  /**
   * HEquirectReorientImpl::GetROI(HGRenderer*, int, HGRect) @0x3d30
   *
   * Region-of-interest rewriter — the inverse of GetDOD. 120-line disasm;
   * same SIMD shape (movaps / insertps / mulps / shufps against __const
   * f32-vec4 loads at Helium __const), same GetParameter reads on params
   * 0/1/7/8. Throw-stubbed for the same reasons as GetDOD.
   */
  GetROI(_r: HGRendererLike, _i: number, _rect: HGRectLike): HGRectLike {
    throw new Error(
      "HEquirectReorientImpl::GetROI @0x3d30 not yet transcribed — requires " +
        "HGRect::IsNull() @Helium, _HGRectNull @Helium data symbol, " +
        "HGNode::GetParameter vtable *0x68 ABI @Helium, and decode of the " +
        "SIMD f32-vec4 constants used by the inverse-transform path.",
    );
  }

  // -------------------------------------------------------------------------
  // Undecoded vtable-slot stubs — the HGNode ABI these route through is not
  // yet ported. Rule 3: cite the addr and throw. Rule 6: keep them as owned
  // helpers of this class file (no cross-class utility grab-bag).
  // -------------------------------------------------------------------------

  /**
   * HGNode::GetParameter(idx=0) via vtable *0x68 — invoked by
   * SetUpDefaultPixelTransform @0x3a63 with idx=0. The return-slot layout
   * is 8 bytes at rdx pointing to a struct whose first f32 field (offset
   * +0x00 in the return slot at -0x20(%rbp)) is what SetUpDefaultPixelTransform
   * consumes as `width`. Until the ABI + return-struct layout for this
   * vtable slot is decoded, throw loudly.
   */
  protected _get_param_f32_0(): number {
    throw new Error(
      "HGNode::GetParameter(0) via vtable *0x68 @Helium call @0x3a63 " +
        "(from HEquirectReorientImpl::SetUpDefaultPixelTransform) not yet transcribed",
    );
  }

  /**
   * HGNode::GetParameter(idx=1) via vtable *0x68 — invoked by
   * SetUpDefaultPixelTransform @0x3a7f. Same shape as `_get_param_f32_0`
   * but with idx=1 (returns height in the first f32 of the return slot).
   */
  protected _get_param_f32_0_at(idx: number): number {
    throw new Error(
      "HGNode::GetParameter(" +
        String(idx) +
        ") via vtable *0x68 @Helium call @0x3a7f " +
        "(from HEquirectReorientImpl::SetUpDefaultPixelTransform) not yet transcribed",
    );
  }

  /**
   * HGNode::SetParameter(idx, x, y, z, w) via vtable *0x60 — invoked by
   * SetUpDefaultPixelTransform four times (@0x3ab2, 0x3adb, 0x3b04, 0x3b2d).
   * The four float args are passed in xmm0/xmm1/xmm2/xmm3 (System V AMD64
   * ABI). Modeled here as a stub so `frontier.py` sees the outstanding
   * decode; a "silently swallow" implementation would fail the render.
   */
  protected _set_param(
    _idx: number,
    _x: number,
    _y: number,
    _z: number,
    _w: number,
  ): void {
    throw new Error(
      "HGNode::SetParameter via vtable *0x60 @Helium calls @0x3ab2/0x3adb/0x3b04/0x3b2d " +
        "(from HEquirectReorientImpl::SetUpDefaultPixelTransform) not yet transcribed",
    );
  }
}
