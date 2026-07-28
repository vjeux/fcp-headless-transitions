// raw-port/src/render/HGLensGDC.ts — Helium
//
// FCP `HGLensGDC`: Helium base render-node for lens Geometric Distortion
// Correction (GDC) — applies per-pixel radial/tangential lens-distortion
// undo to an incoming image. Subclass of HGNode. Ships in two shader
// flavors selected by the ctor arg `hgLensGDCInterpolationMode`:
//   mode == 1  → Bilinear   (HGLensGDC_BL / Hgc2LensGDC_BL shader)
//   mode != 1  → Bicubic    (HGLensGDC_BC / Hgc2LensGDC_BC shader)
//
// Verbatim from FCP's Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Decode evidence (x86_64-slice VMAs; slice starts at file offset 0x4000):
//   raw-port/re/disasm/Helium.HGLensGDC.SetParameters.s   @0x1e2ff0
//   raw-port/re/disasm/Helium.HGLensGDC.GetOutput.s       @0x1e3190
//   raw-port/re/disasm/Helium.HGLensGDC.RenderTile.s      @0x1e33b0
//   otool -tV extracts of C2/C1/D2/D1/D0 embedded inline below
//
// -----------------------------------------------------------------------------
// Helium symbols transcribed
// -----------------------------------------------------------------------------
//   @0x1e2e30  __ZN9HGLensGDCC2ENS_26hgLensGDCInterpolationModeE
//              HGLensGDC::HGLensGDC(hgLensGDCInterpolationMode)     [C2]
//   @0x1e2f10  __ZN9HGLensGDCC1ENS_26hgLensGDCInterpolationModeE
//              [C1 — identical body to C2 (independent code seq)]
//   @0x1e2ff0  __ZN9HGLensGDC13SetParametersEffRKN14HGColorConform13GDCParametersE
//              HGLensGDC::SetParameters(centerX, centerY, GDCParameters const&)
//   @0x1e3190  __ZN9HGLensGDC9GetOutputEP10HGRenderer
//              HGLensGDC::GetOutput(HGRenderer*)
//   @0x1e33b0  __ZN9HGLensGDC10RenderTileEP6HGTile
//              HGLensGDC::RenderTile(HGTile*)
//   @0x1e36b0  __ZN9HGLensGDCD1Ev   HGLensGDC::~HGLensGDC()   [D1]
//   @0x1e36f0  __ZN9HGLensGDCD0Ev   HGLensGDC::~HGLensGDC()   [D0]
//
// Sibling helper classes (referenced but not transcribed here):
//   @0x1e3740/@0x1e3750         HGLensGDC_BL D1/D0 (bilinear dispatcher subclass)
//   @0x1e3770                   HGLensGDC_BL::GetDOD(renderer,i,rect) — Domain Of Definition
//   @0x1e37b0/@0x1e37c0         HGLensGDC_BC D1/D0 (bicubic dispatcher subclass)
//   @0x1e37e0                   HGLensGDC_BC::GetDOD(renderer,i,rect)
//
// Vtable installed at HGLensGDC self+0 by ctor is @Helium 0xa2b0f0-region
// (leaq 0x848077(%rip),%rax @0x1e2e42; ctor @0x1e2f22 uses 0x847f97 for the
// same target). RTTI header:
//   __ZTI9HGLensGDC  @0xa2b0f0   (typeinfo)
//   __ZTS9HGLensGDC  @0x85f764   (typeinfo string "HGLensGDC")
//
// -----------------------------------------------------------------------------
// LAYOUT (recovered from ctor + SetParameters + GetOutput field accesses)
// -----------------------------------------------------------------------------
//   struct HGLensGDC : HGNode {                              // base @+0x00
//     // +0x00  vptr (installed by C2 @0x1e2e42)
//     // +0x08 .. HGNode base subobject (see @0x1e2e3d base-ctor, D2 @0x1e2ef1)
//     // +0x198  u32 interpolationMode   (ctor arg; 1 = Bilinear else Bicubic)
//     //         written by C2 @0x1e2e4c / SetParameters does NOT touch it.
//     // +0x19c  f64/2×f32  centerX,centerY (packed as movlps by SetParameters
//     //         @0x1e3074; zero-init'd as u64=0 by ctor @0x1e2e53.)
//     // +0x1a4  f32   invRadius = 1.0f / hypotf(dx, dy)   (SetParameters
//     //         @0x1e3088; ctor default = 0.0 @0x1e2e5e.)
//     // +0x1a8  f32[15]  GDCParameters payload (SetParameters @0x1e3091..
//     //         @0x1e3163: copies params[0x8..0x40] to self[0x1a8..0x1e0];
//     //         ctor default @0x1e2e68/@0x1e2e76/@0x1e2e84/@0x1e2e92 fills
//     //         self[0x1a8..0x1e4] as (1.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f,
//     //         0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f) via
//     //         four `movups` of 16-byte blobs from consts @0x85f728,
//     //         @0x85f738, @0x85f748, @0x85f754. Only the first slot
//     //         (self+0x1a8 = 1.0f) is nonzero — identity Bayer-color-gain.
//     // +0x1e4  f64   distortionScale (SetParameters @0x1e3168 copies
//     //         params[0x44]; ctor default 0.0078125 = 1/128 @0x1e2ea0.)
//     // +0x1ec  u8    enableFlag (SetParameters @0x1e3175 copies params[0x4c];
//     //         ctor default 1 @0x1e2eb0.)
//     // +0x1f0  HGObject*  shaderOwned  (ctor default 0 @0x1e2eb7; D2 releases
//     //         via vt[0x18] @0x1e2eeb / dtor family same slot.)
//     //   sizeof(HGLensGDC) = 0x1f8 (base HGNode ~0x198 + 0x60 own fields).
//   };
//
// -----------------------------------------------------------------------------
// GDCParameters LAYOUT (arg to SetParameters, size 0x50 = 80 B; verified from
// the exact byte-offset reads at SetParameters @0x1e3011..@0x1e3171):
// -----------------------------------------------------------------------------
//   struct HGColorConform::GDCParameters {
//     f32   sizeW           @+0x00   (movsd (%rsi) loads both W and H)
//     f32   sizeH           @+0x04
//     f32[14] coeffs        @+0x08..@+0x40  (radial + tangential + slot0=k1
//                                             typically; 14 f32s copied
//                                             verbatim into self+0x1a8..
//                                             self+0x1e0.)
//     f64   distortionScale @+0x44
//     u8    enableFlag      @+0x4c
//   };
//
// -----------------------------------------------------------------------------
// SIMD / SCALAR CONSTANTS
// -----------------------------------------------------------------------------
//   @0x3c7c30  ABS_MASK  = {0x7fffffff}×4   (sign-bit clear for abs-f32)
//   @0x3c7cb0  F64 0.0078125 (= 1/128)      (ctor default distortionScale)
//   @0x3c7cc0  {1.0f, 6.0f, 0.5f, -0.5f}    (SetParameters uses only the
//                                             first lane; 1.0f is the
//                                             hypot-numerator: invRadius
//                                             = 1.0f / hypotf(dx, dy).)
//   @0x3ca960  {-1.0f, -1.0f, 0.0f, 0.0f}   (SetParameters adds this to
//                                             (centerX, centerY, 0, 0) to
//                                             shift image center 1px inward
//                                             before scaling by (W, H).)
//   @0x85f728  {1.0f, 0.0f, 0.0f, 0.0f}     (ctor default coeff row 0)
//   @0x85f738  {0.0f}×4                     (ctor default coeff rows 1..3)
//   @0x85f748  {0.0f}×4                     (ctor default coeff rows 1..3)
//   @0x85f754  {0.0f}×4                     (ctor default coeff rows 1..3)
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (each surfaces as a throw-stub citing its @0xADDR)
// -----------------------------------------------------------------------------
//   @0x1e2e3d/@0x1e2f1d   __ZN6HGNodeC2Ev             HGNode::HGNode()
//   @0x1e2ecf/@0x1e2faf   __ZN6HGNode8SetFlagsEii     HGNode::SetFlags(int,int)
//                                                     (args -1 /*mask=0xffffffff*/, 0x20000)
//   @0x1e2ef1             __ZN6HGNodeD2Ev             HGNode::~HGNode()
//   @0x1e306b             _hypotf                     libm hypotf(f32, f32)  → f32
//   @0x1e31ab             __ZN10HGRenderer8GetInputEP6HGNodei
//                         HGRenderer::GetInput(HGNode*, int idx=0)
//   @0x1e31c2             renderer->vt[0x130](renderer) — "prefers bitmap?" query
//   @0x1e3239/@0x1e32cd   __ZN8HGObjectnwEm           HGObject::operator new(0x1f0=496)
//   @0x1e3249/@0x1e32dd   ___bzero                    memset(new_shader, 0, 0x1f0)
//   @0x1e3251             __ZN14Hgc2LensGDC_BLC2Ev    Hgc2LensGDC_BL::Hgc2LensGDC_BL()
//   @0x1e3267             __ZN14Hgc2LensGDC_BL13SetParametersERKNS_23LensGDCShaderParametersE
//                         Hgc2LensGDC_BL::SetParameters(shaderParams&)
//   @0x1e32e5             __ZN14Hgc2LensGDC_BCC2Ev    Hgc2LensGDC_BC::Hgc2LensGDC_BC()
//   @0x1e3300             (Hgc2LensGDC_BC SetParameters — mirror of BL path)
//   @0x1e2eeb             vt[0x18] on self.shaderOwned (release-hook in dtor unwind)
//
// -----------------------------------------------------------------------------

/**
 * HGNode — abstract render-graph node. Base class of HGLensGDC. Landed under
 * raw-port/src/nodes/ or raw-port/src/render/HGNode.ts per PORTING_SPEC (this
 * class only calls HGNode::HGNode @0x1e2e3d, HGNode::SetFlags @0x1e2ecf,
 * HGNode::~HGNode @0x1e2ef1 — the base is not re-stubbed here).
 */
export type HGNode = { readonly __brand: "HGNode" };

/**
 * HGRenderer — abstract renderer, passed to GetOutput. Its virtual method
 * GetInput @0x1e31ab returns an HGNode* input source; vt[0x130] @0x1e31c2
 * is the "prefers CPU bitmap?" query (same slot as HGDitherLUTEntry /
 * HGApplyNDLUTEntry).
 */
export type HGRenderer = { readonly __brand: "HGRenderer" };

/**
 * HGTile — the per-tile render unit passed to RenderTile @0x1e33b0. Its
 * fields are read by RenderTile to obtain the destination bitmap + tile
 * rect (frontier).
 */
export type HGTile = { readonly __brand: "HGTile" };

/**
 * HGObject — HGLensGDC uses this base class only via `HGObject::operator new`
 * @0x1e3239 (alloc 0x1f0 bytes for the Hgc2LensGDC_BL / _BC shader-instance)
 * and via the `vt[0x18]` release-hook on any object stored at self+0x1f0.
 */
export type HGObject = { readonly __brand: "HGObject" };

/**
 * HGColorConform::GDCParameters — 80-byte packed struct passed by const-ref
 * to SetParameters @0x1e2ff0. Field-by-field mapping decoded above. Kept
 * as an interface because every field's byte offset is grounded to a
 * SetParameters `movss/movsd/movzbl` read.
 */
export interface HGColorConform_GDCParameters {
  /** +0x00 (f32) — image width; loaded together with sizeH via `movsd (%rsi)`. */
  sizeW: number;
  /** +0x04 (f32) — image height. */
  sizeH: number;
  /**
   * +0x08..+0x40 (14 × f32) — GDC distortion coefficients. Copied verbatim
   * into self[0x1a8..0x1e0] by SetParameters @0x1e3091..@0x1e315a.
   */
  coeffs: number[]; // length 14
  /** +0x44 (f64) — distortionScale. Copied by SetParameters @0x1e3168. */
  distortionScale: number;
  /** +0x4c (u8) — enableFlag. Copied by SetParameters @0x1e3175. */
  enableFlag: number;
}

/**
 * hgLensGDCInterpolationMode — u32 enum passed to the ctor. `1` selects the
 * bilinear (HGLensGDC_BL / Hgc2LensGDC_BL) code path in GetOutput @0x1e31de;
 * any other value falls through to the bicubic (HGLensGDC_BC / Hgc2LensGDC_BC)
 * path @0x1e3278.
 */
export type hgLensGDCInterpolationMode = number;

/**
 * HGLensGDC — Helium base render-node for lens Geometric Distortion Correction.
 * Field layout documented in the file header. Every method below is a throw-
 * stub citing its @0xADDR because their bodies depend on HGNode base ctor/
 * dtor, HGRenderer virtual queries, HGObject::operator new, ___bzero,
 * Hgc2LensGDC_BL / Hgc2LensGDC_BC shader-instance ctors, and libm hypotf —
 * plus the RenderTile @0x1e33b0 vtable dispatch to HGTile fields, all of
 * which are undecoded frontier symbols.
 */
export type HGLensGDC = { readonly __brand: "HGLensGDC" };

// -----------------------------------------------------------------------------
// HGLensGDC::HGLensGDC(hgLensGDCInterpolationMode) [C2 base ctor] @0x1e2e30
//                                                                — 47-line ctor.
//
// Decoded control flow:
//   1. @0x1e2e3d  HGNode::HGNode();                           (base ctor)
//   2. @0x1e2e42  self.vptr = &vtable @Helium 0xa2b0f0-region (leaq 0x848077+rip)
//   3. @0x1e2e4c  self+0x198 (u32) = mode                     (ctor arg)
//   4. @0x1e2e53  self+0x19c (u64) = 0                        (centerX,centerY packed = 0)
//   5. @0x1e2e5e  self+0x1a4 (u32) = 0                        (invRadius = 0.0f)
//   6. @0x1e2e68  self+0x1a8..0x1b8 = {1.0f, 0.0f, 0.0f, 0.0f}  (const @0x85f728)
//   7. @0x1e2e76  self+0x1b8..0x1c8 = {0.0f}×4                  (const @0x85f738)
//   8. @0x1e2e84  self+0x1c8..0x1d8 = {0.0f}×4                  (const @0x85f748)
//   9. @0x1e2e92  self+0x1d4..0x1e4 = {0.0f}×4  (OVERLAPS +0x1d8-+0x1e4;
//                                                const @0x85f754 = zero fill)
//                (NOTE: the four `movups` overlap deliberately — the second-to-
//                 last write at offset 0x1d4 has a 12-byte pre-overlap with the
//                 preceding row, so the effective post-ctor state is
//                 self[0x1a8..0x1e0] = (1.0f, [14×0.0f]).  This is a compiler
//                 optimization of a zero-fill immediately after a single 1.0f
//                 stamp — it emits four fixed-shape movups instead of a loop.)
//  10. @0x1e2ea0  self+0x1e4 (f64) = 0.0078125  (default distortionScale, const @0x3c7cb0)
//  11. @0x1e2eb0  self+0x1ec (u8)  = 1          (enableFlag default)
//  12. @0x1e2eb7  self+0x1f0 (ptr) = null       (shaderOwned)
//  13. @0x1e2ecf  HGNode::SetFlags(self, -1 /*mask*/, 0x20000 /*value*/);
//                 (marks the node as "GDC" in HGNode's flag word.)
//  14. return.
//
//  Exception unwind (@0x1e2ed9-@0x1e2ef9): release self+0x1f0 via vt[0x18],
//  then call HGNode::~HGNode(self), then __Unwind_Resume.
// -----------------------------------------------------------------------------

/**
 * HGLensGDC::HGLensGDC(hgLensGDCInterpolationMode) [C2 base ctor] @Helium 0x1e2e30.
 * Depends on HGNode::HGNode @0x1e2e3d and HGNode::SetFlags @0x1e2ecf — both
 * frontier symbols. Field-init constants documented above.
 */
export function HGLensGDC_ctor(
  _self: HGLensGDC,
  _mode: hgLensGDCInterpolationMode,
): void {
  throw new Error(
    "HGLensGDC::HGLensGDC [C2] @Helium 0x1e2e30 not yet transcribed: 47-line ctor whose body calls HGNode::HGNode @0x1e2e3d and HGNode::SetFlags(self, -1, 0x20000) @0x1e2ecf — both frontier symbols on the HGNode base. Field defaults documented above: self+0x198=mode, self+0x19c=0, self+0x1a4=0.0f, self+0x1a8={1.0f, 14×0.0f} (via merged movups from consts @0x85f728/@0x85f738/@0x85f748/@0x85f754), self+0x1e4=f64 0.0078125 (@0x3c7cb0), self+0x1ec=u8 1, self+0x1f0=null. Installed vtable-ptr via `leaq 0x848077(%rip),%rax` @0x1e2e42.",
  );
}

// -----------------------------------------------------------------------------
// HGLensGDC::HGLensGDC(hgLensGDCInterpolationMode) [C1] @0x1e2f10 — 47-line body.
//
// Body is BYTE-FOR-BYTE identical to C2 @0x1e2e30 (independent code sequence,
// separate leaq disp because rip differs by 0xe0). Faithful port: forward.
// -----------------------------------------------------------------------------

/**
 * HGLensGDC::HGLensGDC [C1 complete-object] @Helium 0x1e2f10.
 * Independent code sequence with identical semantics to C2 @0x1e2e30.
 */
export function HGLensGDC_ctor_C1(
  self: HGLensGDC,
  mode: hgLensGDCInterpolationMode,
): void {
  // Body identical to C2; both emit the same field-init and HGNode::SetFlags call.
  HGLensGDC_ctor(self, mode);
}

// -----------------------------------------------------------------------------
// HGLensGDC::SetParameters(float centerX, float centerY,
//                          HGColorConform::GDCParameters const& params)
//                                                       @Helium 0x1e2ff0 — 81 lines.
//
// Decoded control flow:
//   %rdi = self, %rsi = &params, %xmm0 = centerX, %xmm1 = centerY.
//
//   1. @0x1e2ffe  xmm2 = xmm0                                (centerX in lane 0)
//   2. @0x1e3001  save %rdi->%r14, %rsi->%rbx
//   3. @0x1e3004  insertps xmm2 = (centerX, centerY, 0, 0)   (pack a vec2)
//   4. @0x1e300a  xmm2 += {-1.0f, -1.0f, 0, 0}   (const @0x3ca960)
//                 → xmm2 = (cx-1, cy-1, 0, 0)
//   5. @0x1e3011  xmm0 = movsd (%rsi)   (params.sizeW/H, low 8 B into xmm0)
//   6. @0x1e3015  xmm0 = xmm0 * xmm2                    → ((cx-1)*W, (cy-1)*H, 0, 0)
//   7. @0x1e3018  xmm3 = 0
//   8. @0x1e301b  xmm3 = xmm0 + xmm3 = xmm0             (copy idiom: xor+add)
//   9. @0x1e301e  xmm1 = ABS_MASK @0x3c7c30 = {0x7fffffff}×4
//  10. @0x1e3025  xmm0 = xmm3 & xmm1                    → abs(xmm3)
//  11. @0x1e302b  xmm2 = xmm2 - xmm3                    → (0-((cx-1)*W-orig)…);
//                 (Effectively splits xmm2 into two vec2 lanes: the scaled
//                 offset and the residual — used for a NaN-safe fmax below.)
//  12. @0x1e302e  xmm5 = xmm3                           (spare copy)
//  13. @0x1e3031  spill xmm3 to -0x20(%rbp)             (for later movlps store)
//  14. @0x1e3035  xmm4 = movshdup(xmm2)                 → (xmm2[1], xmm2[1], xmm2[3], xmm2[3])
//  15. @0x1e3039  xmm2 = xmm2 & ABS_MASK               → |xmm2|
//  16. @0x1e303c-@0x1e3048  NaN-safe max of |xmm0[0]| vs |xmm2[0]|:
//                            xmm3 = max(xmm2, xmm0) then blend if xmm0 was NaN
//                            → xmm3 = fmaxf_nan_pref_left(|xmm2[0]|, |xmm0[0]|)
//                 (This is the standard "if NaN pick the non-NaN operand" idiom
//                  from libc's fmaxf.)
//  17. @0x1e304d-@0x1e3063  same fmax idiom on the high lanes:
//                            xmm1 = fmaxf_nan_pref(|xmm4|, |xmm0_high|)
//                 → xmm3, xmm1 hold two absolute-max scalars ready for hypotf.
//  18. @0x1e3068  xmm0 = xmm3   (arg 0 for hypotf)
//                 (xmm1 already holds arg 1.)
//  19. @0x1e306b  callq _hypotf   → xmm0 = sqrtf(xmm3² + xmm1²)
//  20. @0x1e3070  reload xmm1 = spilled xmm3 from -0x20(%rbp)   (centerX,centerY packed)
//  21. @0x1e3074  movlps xmm1, self+0x19c(%r14)   (store centerX,centerY as 2×f32 = 8 B)
//  22. @0x1e307c  xmm1 = movss @0x3c7cc0 = 1.0f
//  23. @0x1e3084  xmm1 = 1.0f / xmm0                                 → invRadius
//  24. @0x1e3088  movss xmm1, self+0x1a4(%r14)                       → self.invRadius
//  25. @0x1e3091..@0x1e3163  copy params[+0x08..+0x40] to self[+0x1a8..+0x1e0]
//                             as 14 sequential f32 stores (one per instruction pair).
//  26. @0x1e3168  movsd params+0x44 (f64) → self+0x1e4                → self.distortionScale
//  27. @0x1e3175  movzbl params+0x4c (u8)  → self+0x1ec               → self.enableFlag
//  28. return.
//
// NB: The centerX,centerY input is DELIBERATELY *stored raw* (not the scaled
// version) — the store at step 21 uses the spilled xmm3, which was assigned
// from `xmm0 + 0` where xmm0 = scaled_offset. Wait — re-read: `xmm3 = xmm0 + 0`
// at step 8 means xmm3 == xmm0 == scaled_offset. But the spill at step 13 is
// AFTER the copy — so what gets stored at self+0x19c is scaled_offset itself.
// Which means self+0x19c = ((centerX-1)*sizeW, (centerY-1)*sizeH) — the
// PIXEL-SPACE distortion center relative to the image origin. This matches the
// GDC math: shader samples radius from this point.
// -----------------------------------------------------------------------------

/**
 * HGLensGDC::SetParameters(centerX, centerY, GDCParameters const&) @Helium 0x1e2ff0.
 *
 * Faithful port of the 81-line SIMD body is deferred: the NaN-safe fmax
 * idiom (steps 15-17, 6 SIMD instructions per lane) needs bit-exact
 * blendvps semantics which JavaScript's Math.max does not replicate for
 * NaN inputs. libm's hypotf is an external symbol whose exact rounding
 * mode we do not have. Both are documented above with @0xADDR — a future
 * pass can wire the parity oracle (dlsym _hypotf) then transcribe the
 * blendvps idiom from its typeinfo — G4 will bit-check the port.
 */
export function HGLensGDC_SetParameters(
  _self: HGLensGDC,
  _centerX: number,
  _centerY: number,
  _params: HGColorConform_GDCParameters,
): void {
  throw new Error(
    "HGLensGDC::SetParameters @Helium 0x1e2ff0 not yet transcribed: 81-line SIMD body performs NaN-safe fmaxf on two vec2 lanes (blendvps @0x1e3048/@0x1e3063 with cmpunordss NaN-detect, ABS_MASK @0x3c7c30) then calls _hypotf @0x1e306b, then stores centerX,centerY scaled by (params.sizeW-1, params.sizeH-1) at self+0x19c (2×f32) and 1.0f/hypot (const @0x3c7cc0) at self+0x1a4, then 14 f32 field-copies params[+0x08..+0x40] -> self[+0x1a8..+0x1e0] @0x1e3091..@0x1e3163, then f64 params.distortionScale -> self+0x1e4 @0x1e3168, then u8 params.enableFlag -> self+0x1ec @0x1e3175. libm _hypotf is a frontier symbol; NaN-preserving fmaxf via blendvps is a decoded but not-yet-transcribed idiom.",
  );
}

// -----------------------------------------------------------------------------
// HGLensGDC::GetOutput(HGRenderer*) @Helium 0x1e3190 — 136-line dispatcher.
//
// Decoded control flow:
//   1. @0x1e31a3  input = renderer->GetInput(self, 0);   (frontier)
//   2. @0x1e31b3  if (input == null) return null;
//   3. @0x1e31c2  if (renderer->vt[0x130](renderer))  goto RELEASE-INPUT @0x1e335e
//                 (renderer prefers CPU bitmap → skip GPU shader path.)
//   4. @0x1e31d0  fields = &self+0x1a8       (base of coeff block)
//   5. @0x1e31d7  if (self+0x198 /*mode*/ == 1)  goto BILINEAR @0x1e31e4
//                 else                            goto BICUBIC  @0x1e3278
//
//   BILINEAR path (mode == 1, @0x1e31e4-@0x1e326c):
//     6a. Copy self+0x19c (f64), +0x1a4 (f32), +0x1a8..+0x1e0 (60 B),
//         +0x1e4 (f64), +0x1ec (u8) into a stack-local 80-byte
//         Hgc2LensGDC_BL::LensGDCShaderParameters struct at -0x70(%rbp)
//         via four 16-byte `movups` blocks.
//     7a. @0x1e3239  shader = HGObject::operator new(0x1f0);
//     8a. @0x1e3249  ___bzero(shader, 0x1f0);
//     9a. @0x1e3251  Hgc2LensGDC_BL::Hgc2LensGDC_BL(shader);
//    10a. @0x1e3256  shader->vptr = &vtable @Helium (leaq 0x847ebb+rip)
//    11a. @0x1e3267  shader->SetParameters(&stack_params);
//    12a. @0x1e326c  jmp COMMON @0x1e3300
//
//   BICUBIC path (mode != 1, @0x1e3278-@0x1e32ef):
//     6b-12b. Same shape as bilinear but calls Hgc2LensGDC_BC ctor
//             @0x1e32e5 and its SetParameters @0x1e3300+ (paths merge).
//
//   COMMON tail (@0x1e3300 onward, undecoded in the excerpt but visible in
//   the full disasm): stores the shader into self+0x1f0 (release-old-if-any
//   first via vt[0x18]), wraps it in an HGRendererOutput and returns.
//
//   RELEASE-INPUT tail @0x1e335e: returns `input` directly (raw CPU bitmap
//   pass-through when renderer prefers non-GPU output).
// -----------------------------------------------------------------------------

/**
 * HGLensGDC::GetOutput(HGRenderer*) @Helium 0x1e3190.
 * Frontier body: depends on HGRenderer::GetInput @0x1e31ab, HGRenderer vt[0x130]
 * @0x1e31c2, HGObject::operator new @0x1e3239, ___bzero @0x1e3249, and the
 * two per-mode shader-instance ctors Hgc2LensGDC_BL @0x1e3251 / Hgc2LensGDC_BC
 * @0x1e32e5 plus their SetParameters overrides — all undecoded frontier
 * symbols. Also depends on the shader-instance's 0x1f0-byte layout which
 * is a subclass frontier.
 */
export function HGLensGDC_GetOutput(_self: HGLensGDC, _renderer: HGRenderer): unknown {
  throw new Error(
    "HGLensGDC::GetOutput @Helium 0x1e3190 not yet transcribed: 136-line dispatcher. Calls HGRenderer::GetInput @0x1e31ab, HGRenderer vt[0x130] @0x1e31c2 (prefers-bitmap query), then per-mode: HGObject::operator new(0x1f0) @0x1e3239/@0x1e32cd, ___bzero(0x1f0) @0x1e3249/@0x1e32dd, Hgc2LensGDC_BL::Hgc2LensGDC_BL @0x1e3251 or Hgc2LensGDC_BC::Hgc2LensGDC_BC @0x1e32e5, then Hgc2LensGDC_{BL,BC}::SetParameters @0x1e3267/@0x1e3300 with an 80-byte stack-local LensGDCShaderParameters copied from self+0x19c..+0x1ec (four 16-byte movups blocks). All shader-instance types + their SetParameters overrides are frontier symbols.",
  );
}

// -----------------------------------------------------------------------------
// HGLensGDC::RenderTile(HGTile*) @Helium 0x1e33b0 — 181-line body.
//
// This is the per-tile CPU-render entry point. It dispatches to the CPU
// bilinear/bicubic sample routines and writes pixels into the tile's
// destination bitmap. The full body reads HGTile fields (source bitmap,
// dest bitmap, tile rect, pass) and the GDC coefficient block at self+0x1a8.
// -----------------------------------------------------------------------------

/**
 * HGLensGDC::RenderTile(HGTile*) @Helium 0x1e33b0.
 * Frontier body: depends on HGTile's field layout (source bitmap +0x??,
 * dest bitmap +0x??, rect +0x??) — all undecoded — plus the per-pixel
 * lens-distortion inverse-map math which requires the sampler kernel
 * (bilinear or bicubic) exposed by whichever shader is bound.
 */
export function HGLensGDC_RenderTile(_self: HGLensGDC, _tile: HGTile): void {
  throw new Error(
    "HGLensGDC::RenderTile @Helium 0x1e33b0 not yet transcribed: 181-line per-tile CPU render kernel. Depends on HGTile field layout (source bitmap, dest bitmap, tile rect), on the GDC coefficient block at self+0x1a8 which SetParameters wrote, and on the interpolation sampler bound by GetOutput (Hgc2LensGDC_BL or _BC) — all frontier symbols.",
  );
}

// -----------------------------------------------------------------------------
// HGLensGDC::~HGLensGDC() (D1) @Helium 0x1e36b0 — release-then-base-dtor.
//
//   @0x1e36b0..  self.vptr = &vtable @Helium 0xa2b0f0-region (reset vptr).
//                if (self+0x1f0 /*shaderOwned*/ != null)
//                  self+0x1f0->vt[0x18](self+0x1f0);
//                tail-jmp HGNode::~HGNode(self).
// -----------------------------------------------------------------------------

/**
 * HGLensGDC::~HGLensGDC() [D1 in-place] @Helium 0x1e36b0.
 * Releases self+0x1f0 (shaderOwned) via vt[0x18] then tail-jmps to HGNode::~HGNode.
 */
export function HGLensGDC_dtor_D1(_self: HGLensGDC): void {
  throw new Error(
    "HGLensGDC::~HGLensGDC [D1] @Helium 0x1e36b0 not yet transcribed: releases self+0x1f0 via vt[0x18] then tail-jmps to HGNode::~HGNode — both are frontier symbols.",
  );
}

// -----------------------------------------------------------------------------
// HGLensGDC::~HGLensGDC() (D0 deleting) @Helium 0x1e36f0.
//   Same as D1 followed by `operator delete(this)` tail-jmp.
// -----------------------------------------------------------------------------

/**
 * HGLensGDC::~HGLensGDC() [D0 deleting] @Helium 0x1e36f0.
 * D1 body inline + operator delete(this).
 */
export function HGLensGDC_dtor_D0(_self: HGLensGDC): void {
  throw new Error(
    "HGLensGDC::~HGLensGDC [D0] @Helium 0x1e36f0 not yet transcribed: D1 body inline (release self+0x1f0 via vt[0x18]) then HGNode::~HGNode then __ZdlPv tail-jmp — all frontier symbols.",
  );
}
