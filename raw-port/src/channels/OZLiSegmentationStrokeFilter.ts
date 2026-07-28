// OZLiSegmentationStrokeFilter.ts — Ozone segmentation-with-strokes filter
//   (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice)
//
// This class is the SIBLING of OZLiSegmentationFeatherFilter (see
// OZLiSegmentationFeatherFilter.ts): identical object layout (0x600 bytes,
// LiImageFilter + LiImageSource MI subobject at +0x5f0), identical C1/C2/
// clone/D1/D0 shape — the ONLY substantive difference is the getHelium(...)
// dataflow, which here composes a variable-length graph of `HgcMaskStrokeAdd`/
// `HgcMaskStrokeSubtract` nodes fed through per-stroke `HGXForm` transforms
// (i.e. the "user drew edit strokes on the segmentation mask" flow), rather
// than a fixed rgb-alpha-feather-alpha-rgb pipeline.
//
// Symbols ported (mangled → address):
//   * __ZN28OZLiSegmentationStrokeFilterC2EP11OZImageMaskRK14OZRenderParams
//       OZLiSegmentationStrokeFilter::OZLiSegmentationStrokeFilter(
//           OZImageMask*, OZRenderParams const&) [C2 base ctor]    @0x424380
//   * __ZN28OZLiSegmentationStrokeFilterC1EP11OZImageMaskRK14OZRenderParams
//       OZLiSegmentationStrokeFilter::OZLiSegmentationStrokeFilter(
//           OZImageMask*, OZRenderParams const&) [C1 complete ctor] @0x424450
//   * __ZNK28OZLiSegmentationStrokeFilter5cloneEv
//       OZLiSegmentationStrokeFilter::clone() const                  @0x424550
//   * __ZN28OZLiSegmentationStrokeFilter9getHeliumER7LiAgent
//       OZLiSegmentationStrokeFilter::getHelium(LiAgent&)             @0x4246a0
//   * __ZN28OZLiSegmentationStrokeFilterD1Ev                          @0x425310
//   * __ZN28OZLiSegmentationStrokeFilterD0Ev                          @0x4253a0
//
// -----------------------------------------------------------------------------
// SHAPE (identical to OZLiSegmentationFeatherFilter — see that file's header
// for the full breakdown)
// -----------------------------------------------------------------------------
//   0x000  vptr_primary            — LiImageFilter subobject
//   0x010  someRefPtr = 0
//   0x018  PCSharedCount
//   0x020  smallField (u32) = 0
//   0x028  OZImageMask*  mask
//   0x030  OZRenderParams          — copy of caller's params
//   0x5f0  vptr_secondary          — LiImageSource / PCShared_base subobject
//   0x5f8  weakRefTarget = 0
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all unported)
// -----------------------------------------------------------------------------
// (Everything OZLiSegmentationFeatherFilter cited — plus:)
//   * OZImageMask::hasSegmentationStrokes(CMTime const&)
//       @0x42470d (in-binary, non-stub)
//   * OZImageMask::getSegmentationStrokeNodes(OZRenderParams const&)
//       @0x42475c (in-binary; returns a std::vector<{HGNode*, u32-op-type}[16-byte-stride]>
//                 at the -0x58/-0x50(%rbp) begin/end pair)
//   * OZImageMask::getSegmentationResultSequencePixelAspectRatio()
//       @0x424765 (in-binary; returns a double in xmm0)
//   * OZImageMask::vtable slot 0x4e0 — "getStrokeTransformState(...)"-ish;
//     writes something into a 32-byte stack area @0x424748 (see
//     "TRANSFORM ACCUMULATOR" note below).
//   * PGHelium::convertPCMatrix44(PCMatrix44Tmpl<double> const&)
//       @stub Ozone 0x6df102 — packs a 4x4 double matrix into the HG-agent's
//       PGHelium representation (likely PCMatrix44Tmpl<float>).
//   * HGXForm::HGXForm()                       @stub Ozone 0x6deb4a
//     (size = 0x210).
//   * HgcMaskStrokeAdd::HgcMaskStrokeAdd()     @0x4249ed (in-binary; ctor
//                                              @0x4249ed, size = 0x1a0).
//   * HgcMaskStrokeSubtract::HgcMaskStrokeSubtract() @0x424a10 (in-binary;
//                                              size = 0x1a0).
//   * vtable for HMaskSimpleStrokeAdd          @0x42478d (RIP-lea; the vptr
//                                              is used to re-bind the freshly
//                                              constructed Hgc*StrokeAdd's
//                                              primary vptr — an "override
//                                              vptr with subclass" pattern
//                                              also seen in Feather.)
//   * vtable for HMaskSimpleStrokeSubtract     @0x42479f (same pattern).
// (All HGObject::operator new/delete, HGNode SetInput / vtable[0x10,0x18,0x78,
//  0x230] slot ops are unported — see Feather for signatures.)
//
// -----------------------------------------------------------------------------
// getHelium(LiAgent&) HIGH-LEVEL SHAPE — @0x4246a0
// -----------------------------------------------------------------------------
// Body (351 asm lines; matches re/disasm/…getHelium.s):
//
//   1. result = LiAgent::getHelium(agent, srcImage=rdx, agent+0x10)  @0x4246cf
//      — outparam at -0x40(%rbp), stashed into `*rbx` (the SRet-result
//      pointer at rdi) @0x4246d8; addref via vtable[0x10] if non-null.
//   2. Read `CMTime{u64@mask+0x40, 16 bytes @mask+0x30}`  @0x4246ea-@0x4246fa.
//   3. Query `mask.hasSegmentationStrokes(CMTime)` @0x42470d.
//      If false → skip to cleanup @0x424ae7.
//   4. Build a 32-byte transform accumulator on the stack:
//         -0x120(%rbp) = {0.0, 0.0}                 @0x42471e (xorpd)
//         -0x110(%rbp) = {-1.0, -1.0}               @0x42472a (movapd from
//                        RIP-const 0x2e0c8e → 0x7053c0; both doubles = -1.0)
//   5. Call `mask->vtable[0x4e0](accumulator, &mask.params)` @0x42474b
//      — writes something (probably a scale/offset pair) into the 32-byte
//      area at -0x120..-0x100(%rbp).
//   6. `strokeVec = mask.getSegmentationStrokeNodes(params)` @0x42475c
//      — returns a `std::vector`-like pair (begin, end) at -0x58/-0x50(%rbp),
//      element stride 16 bytes: `{ HGNode* node @+0, u32 opType @+8 }`.
//   7. `pixelAspect = mask.getSegmentationResultSequencePixelAspectRatio()`
//      @0x424765 — a double, stashed at -0x60(%rbp).
//   8. If `strokeVec.begin == strokeVec.end` (no strokes): jump to cleanup
//      @0x424a9d.
//   9. Load the HMaskSimpleStrokeAdd vtable ptr @0x42478d and the
//      HMaskSimpleStrokeSubtract vtable ptr @0x42479f — cached on the stack
//      at -0xf0(%rbp) / -0xe8(%rbp) for the per-iteration rebind.
//
//   10. LOOP (index r13 = 1; r15 = 0; while r13 <= (end-begin)/16 iters):
//       a. Read 8 doubles (dp[i][0..3] for i=0..3, i.e. a 4x4 double matrix)
//          from `agent->something(+0xa0) + 0..0x70` @0x4247c7-@0x424804
//          into stack slots -0xe0..-0x70(%rbp).  This is the render agent's
//          current world matrix.
//       b. `alpha = accumulator[-0x110].first  * strokeParamA  * -0x60(pixelAspect)`
//          @0x424821-@0x424836.  If alpha != 0.0 (ucomisd + jne/jnp), fuse
//          alpha into 4 successive rows of the matrix (m[i][0] += alpha *
//          m[i][k]  for i=0..3, with matched offsets).  @0x424842-@0x4248a0.
//          The multiply constant `mulsd 0x2e2eef(%rip)` at @0x424829 targets
//          const 0x707720 (double `-0.5`) — used as a fixed premultiplier.
//       c. `beta = accumulator[-0x108].second * -0.5` (same const 0x707720,
//          via RIP+0x2e2e6b @0x4248ad).  If beta != 0.0, fuse similarly
//          @0x4248c1-@0x42491f.
//       d. If pixelAspect != 1.0 (`ucomisd 0x2e0aaf(%rip)` @0x424929 vs const
//          0x7053e0 = 1.0), scale 4 matrix columns by pixelAspect
//          @0x424935-@0x42497a.
//       e. Convert accumulated PCMatrix44Tmpl<double> to PGHelium form via
//          PGHelium::convertPCMatrix44(&result, &mat)  @0x42498a — stashes
//          a helium handle at -0x38(%rbp).
//       f. `xform = new HGObject(0x210); HGXForm::HGXForm(xform)` @0x424994.
//       g. Set xform.input(0) = strokeVec[r13-1].node   @0x4249bb (vtbl[0x78]).
//       h. Call xform.<vtbl 0x230>(&helium-matrix) — likely "SetTransform".
//          @0x4249cb.
//       i. If `strokeVec[r13-1].opType (u32 @+8) == 1`:
//              op = new HGObject(0x1a0); HgcMaskStrokeAdd::HgcMaskStrokeAdd(op)
//              vptr-rebind to HMaskSimpleStrokeAdd_vtable @0x4249f2/0x424a1c.
//          Else:
//              op = new HGObject(0x1a0); HgcMaskStrokeSubtract::HgcMaskStrokeSubtract(op)
//              vptr-rebind to HMaskSimpleStrokeSubtract_vtable @0x424a15/0x424a1c.
//       j. op.SetInput(0, xform)    @0x424a27 (vtbl[0x78]).
//       k. op.SetInput(1, current)  @0x424a38 (vtbl[0x78]).
//       l. Refcount ceremony: if current != op, release current via
//          vtable[0x18] @0x424a4c, addref op via vtable[0x10] @0x424a58,
//          current = op.
//       m. Release xform via vtable[0x18] @0x424a61.  Release helium at
//          -0x38(%rbp) via vtable[0x18] @0x424a70.  Release op via
//          vtable[0x18] @0x424a79.
//       n. r15 = r13; r13++.  Loop while r13 <= number-of-strokes.
//   11. Store current graph tip into `*result` @0x424aa1.
//   12. Walk backward over the strokeVec releasing each `node` via
//       vtable[0x18] (destructor loop) @0x424ac0-@0x424ad8; then
//       `operator delete(strokeVec.begin)` @0x424ae2 to free the vector's
//       heap block.
//   13. Release the initial LiAgent::getHelium output (-0x40(%rbp)) via
//       vtable[0x18] @0x424af3 if non-null.
//   14. Return `*result` (rax = r15=this=outparam).
//
// TRANSFORM ACCUMULATOR: the pair of doubles at [-0x110, -0x108] is a
// {x-strength, y-strength} pair; the code applies each to matrix rows
// scaled by `-0.5` and multiplied by pixelAspect (only in the y case).
// This is what turns a screen-space stroke offset into a world-space
// contribution to the transform matrix.  All exact math is decoded above
// — but implementing the loop requires HGXForm/HgcMaskStrokeAdd/Subtract/
// PGHelium::convertPCMatrix44 (none ported).
//
// -----------------------------------------------------------------------------
// pixelTransformSupport / estimateRenderMemory
// -----------------------------------------------------------------------------
// Not listed in this class's own mangled-symbol set — inherited from
// LiImageFilter (not our port responsibility here).

/** Opaque OZImageMask handle — see OZLiSegmentationFilter.ts / OZImageMask
 *  (not yet transcribed). */
export type OZImageMask = object;

/** Opaque OZRenderParams handle. */
export type OZRenderParams = object;

/** Opaque LiAgent handle. */
export type LiAgent = object;

/** Opaque HGNode handle. */
export type HGNode = object;

/** clone() outparam handle: {raw*, PCSharedCount} pair. */
export interface LiImageFilterHandle {
  raw: OZLiSegmentationStrokeFilter | null;
  sharedCount: unknown;
}

export class OZLiSegmentationStrokeFilter {
  /** Primary vptr @+0x000 — set multiple times during ctor. */
  vptrPrimary: unknown = null;

  /** @+0x010 — nominally a raw shared-count target; zeroed @0x4244a4 (C1)
   *  / @0x4243b9 (C2). */
  someRefPtr: unknown = null;

  /** @+0x018 — PCSharedCount, default-constructed @0x4244b0 (C1) /
   *  @0x4243c5 (C2). */
  sharedCount: unknown = null;

  /** @+0x020 — u32 status flag, zeroed @0x4244b5 (C1) / @0x4243ce (C2). */
  smallField: number = 0;

  /** @+0x028 — mask pointer, raw-stored @0x4244d4 & @0x4244fc (C1) /
   *  @0x4243e8 & @0x42440a (C2). */
  mask: OZImageMask | null = null;

  /** @+0x030 — copy of the caller's OZRenderParams, in-place ctor'd
   *  @0x4244df (C1) / @0x4243f3 (C2). */
  params: OZRenderParams | null = null;

  /** @+0x5f0 — secondary vptr; initially PCShared_base_vtable+0x10
   *  @0x42446e (C1). */
  vptrSecondary: unknown = null;

  /** @+0x5f8 — weakRefTarget; zeroed @0x424475 (C1). */
  weakRefTarget: unknown = null;

  /**
   * OZLiSegmentationStrokeFilter::OZLiSegmentationStrokeFilter(
   *     OZImageMask*, OZRenderParams const&)   [C1 complete-object ctor]
   *                                                              — @0x424450
   *
   * Body (per re/disasm/…OZLiSegmentationStrokeFilter.s):
   *   @0x424463  this[+0x5f0] = &PCShared_base_vtable + 0x10       (u64)
   *   @0x424475  this[+0x5f8] = 0                                   (u64)
   *   @0x424487  LiImageSource::LiImageSource(this)  — stub Ozone 0x6dd83c
   *   @0x424493  this[+0x000] = <vtbl_A>                            (primary vptr install #1)
   *   @0x42449d  this[+0x5f0] = <vtbl_B>                            (secondary vptr install #1)
   *   @0x4244a4  this[+0x010] = 0
   *   @0x4244b0  PCSharedCount::PCSharedCount(&this[+0x018])  — stub 0x6ddae8
   *   @0x4244b5  this[+0x020] = 0                                   (u32)
   *   @0x4244c3  this[+0x000] = <vtbl_C>                            (primary vptr install #2)
   *   @0x4244cd  this[+0x5f0] = <vtbl_D>                            (secondary vptr install #2)
   *   @0x4244d4  this[+0x028] = mask   (r14 = rsi at entry)
   *   @0x4244df  OZRenderParams::OZRenderParams(&this[+0x030], params)
   *   @0x4244eb  this[+0x000] = <vtbl_E>                            (primary vptr install #3)
   *   @0x4244f5  this[+0x5f0] = <vtbl_F>                            (secondary vptr install #3)
   *   @0x4244fc  this[+0x028] = mask   (redundant re-store)
   *   ret.
   *
   * Exception paths @0x42450b→@0x424548 unwind LiImageFilter::~LiImageFilter()
   * / LiImageSource::~LiImageSource() / PCShared_base::~PCShared_base() then
   * __Unwind_Resume.
   *
   * Structurally IDENTICAL to OZLiSegmentationFeatherFilter's C1 @0x424d20;
   * every base-ctor callee is unported so we raise.
   */
  constructor(_mask: OZImageMask | null, _params: OZRenderParams) {
    // Base-class ctors + copy-ctor unresolved — raise. @0x424450
    throw new Error(
      "OZLiSegmentationStrokeFilter::OZLiSegmentationStrokeFilter(C1): " +
        "requires LiImageSource::LiImageSource() + PCSharedCount::PCSharedCount() + " +
        "OZRenderParams::OZRenderParams(const&) + PCShared_base MI vtable installs — " +
        "none ported. @0x424450",
    );
  }

  /**
   * OZLiSegmentationStrokeFilter::OZLiSegmentationStrokeFilter(
   *     OZImageMask*, OZRenderParams const&)   [C2 base-object ctor]
   *                                                              — @0x424380
   *
   * Body (per /tmp/Ozone_tV.txt at the C2 label):
   *   @0x4243a1  LiImageSource::LiImageSource(this, mask+0x18)  — stub Ozone 0x6dd83c
   *   @0x4243aa  this[+0x000] = mask[+0x010]                       (primary vptr from mask MI)
   *   @0x4243b5  this[vtbl_A_MI_offset] = mask[+0x038]             (Itanium MI thunk: `-0x18(vtbl)`)
   *   @0x4243b9  this[+0x010] = 0
   *   @0x4243c5  PCSharedCount::PCSharedCount(&this[+0x018])  — stub 0x6ddae8
   *   @0x4243ce  this[+0x020] = 0                                   (u32)
   *   @0x4243d9  this[+0x000] = mask[+0x008]                       (primary vptr install #2 from mask MI)
   *   @0x4243e4  this[vtbl_B_MI_offset] = mask[+0x040]             (Itanium MI thunk)
   *   @0x4243e8  this[+0x028] = extraTag  (r14 = rdx at entry)
   *   @0x4243f3  OZRenderParams::OZRenderParams(&this[+0x030], params=r12=rcx)
   *   @0x4243fb  this[+0x000] = mask[+0x000]                       (primary vptr install #3 from mask MI)
   *   @0x424406  this[vtbl_C_MI_offset] = mask[+0x048]             (Itanium MI thunk)
   *   @0x42440a  this[+0x028] = extraTag  (redundant re-store)
   *   ret.
   *
   * See OZLiSegmentationFeatherFilter.ts / this file's header ARG-MAPPING
   * NOTE — C2 has an extra shifted `void* extraTag` arg vs the mangled sig.
   */
  static OZLiSegmentationStrokeFilterC2(
    _self: OZLiSegmentationStrokeFilter,
    _mask: OZImageMask | null,
    _extraTag: unknown,
    _params: OZRenderParams,
  ): void {
    // Base-class ctors + copy-ctor + MI thunks unresolved — raise. @0x424380
    throw new Error(
      "OZLiSegmentationStrokeFilter::OZLiSegmentationStrokeFilter(C2): " +
        "requires LiImageSource::LiImageSource() + PCSharedCount::PCSharedCount() + " +
        "OZRenderParams::OZRenderParams(const&) + 3-tier MI vtable installs from mask — " +
        "none ported. @0x424380",
    );
  }

  /**
   * OZLiSegmentationStrokeFilter::clone() const  — @0x424550
   *
   * Body (structurally IDENTICAL to OZLiSegmentationFeatherFilter::clone
   * @0x424e20 — see that file's header for the annotated flow):
   *   1. `new(0x600)` @0x42456a  →  rbx.
   *   2. C1 ctor(rbx, src.mask=+0x28, &src.params=+0x30) @0x42457d.
   *   3. PCSharedCount(PCShared_base*) into -0x30(%rbp) via `-0x18(vtbl)`
   *      MI-thunk offset @0x424597.
   *   4. If `rbx == null`: throw_PCNullPointerException(true) @0x4245aa.
   *   5. dst.someRefPtr(+0x10) = src.someRefPtr(+0x10) @0x4245b7.
   *   6. Copy/assign/destroy PCSharedCount for dst.sharedCount @0x4245c4-@0x4245db.
   *   7. dst.smallField(+0x20) = src.smallField(+0x20) @0x4245e4.
   *   8. result[+0x00] = dst @0x4245ed.
   *   9. PCSharedCount::PCSharedCount(&result[+0x08]) @0x4245f7.
   *  10. If result[+0x00] != null: copy/assign/destroy PCSharedCount into
   *      result[+0x08] @0x424609-@0x42461e.
   *  11. ~(local -0x30 count) @0x424626.
   *  12. return rax = r14=outparam.
   *
   * All PCSharedCount / operator-new / throw callees are unported — raise.
   */
  clone(): LiImageFilterHandle {
    // Every step depends on PCSharedCount / operator-new / throw frontier — raise.
    // @0x424550
    throw new Error(
      "OZLiSegmentationStrokeFilter::clone: requires operator new(0x600) + " +
        "C1 ctor + PCSharedCount(PCShared_base*/const&/= /~) + " +
        "throw_PCNullPointerException — none ported. @0x424550",
    );
  }

  /**
   * OZLiSegmentationStrokeFilter::getHelium(LiAgent&)  — @0x4246a0
   *
   * See the massive HIGH-LEVEL SHAPE block in the file header for the full
   * decoded per-stroke graph-construction dataflow.
   *
   * Summary:
   *
   *   result = LiAgent::getHelium(agent, srcImage, agent+0x10)
   *   if (mask.hasSegmentationStrokes(CMTime{mask+0x30..0x40, +0x40})) {
   *     acc = { {0,0}, {-1,-1} }                                        // -0x120..-0x100
   *     mask.<vtbl 0x4e0>(&acc, &mask.params)                           // fills acc
   *     strokes = mask.getSegmentationStrokeNodes(params)               // std::vector<{node,opType}>
   *     px = mask.getSegmentationResultSequencePixelAspectRatio()
   *     if (strokes.size == 0) → skip loop, return result.
   *     current = result;
   *     for (i=0; i < strokes.size; i++) {
   *       // build a PCMatrix44Tmpl<double>-shaped accumulator from agent's world matrix
   *       mat = agent.<...+0xa0>.rows[0..3];  // 4x4 doubles
   *       alpha = acc.first.x  * (-0.5) * px;
   *       if (alpha != 0) fuse-into-column-1(mat, alpha, m[i][0]);
   *       beta  = acc.first.y  * (-0.5);
   *       if (beta  != 0) fuse-into-column-1(mat, beta,  m[i][1]);
   *       if (px != 1.0) scale-columns(mat, px);
   *       helium = PGHelium::convertPCMatrix44(&mat);
   *       xform = new HGXForm(0x210);
   *       xform.SetInput(0, strokes[i].node);
   *       xform.<vtbl 0x230>(helium);                                    // SetTransform
   *       if (strokes[i].opType == 1) {
   *         op = new HgcMaskStrokeAdd(0x1a0);
   *         op.vptr = HMaskSimpleStrokeAdd_vtable + 0x10;
   *       } else {
   *         op = new HgcMaskStrokeSubtract(0x1a0);
   *         op.vptr = HMaskSimpleStrokeSubtract_vtable + 0x10;
   *       }
   *       op.SetInput(0, xform);
   *       op.SetInput(1, current);
   *       release(current); addref(op); current = op;
   *       release(xform); release(helium); release(op);
   *     }
   *     *out = current;
   *     for each stroke: release(stroke.node);
   *     operator delete(strokes.begin);
   *   }
   *   release(result if non-null);
   *   return *out;
   *
   * Every frontier is unported (LiAgent::getHelium, OZImageMask predicates
   * + getSegmentationStrokeNodes + getSegmentationResultSequencePixelAspectRatio,
   * PGHelium::convertPCMatrix44, HGXForm, HgcMaskStrokeAdd/Subtract, HGObject
   * new/delete, HGNode vtable[0x10,0x18,0x78,0x230]) — raise citing @0x4246a0.
   *
   * Decoded RIP-relative math constants:
   *   @0x42472a  movapd RIP+0x2e0c8e (=0x7053c0)  →  {double,-1.0}×2  pair.
   *   @0x424829  mulsd  RIP+0x2e2eef (=0x707720)  →  double -0.5     (alpha premul).
   *   @0x4248ad  mulsd  RIP+0x2e2e6b (=0x707720)  →  double -0.5     (beta premul).
   *   @0x424929  ucomisd RIP+0x2e0aaf (=0x7053e0) →  double  1.0     (pixel aspect gate).
   */
  getHelium(_agent: LiAgent, _srcImage: HGNode | null): HGNode | null {
    // Whole flow depends on frontier ops — raise. @0x4246a0
    throw new Error(
      "OZLiSegmentationStrokeFilter::getHelium: requires LiAgent::getHelium + " +
        "OZImageMask::hasSegmentationStrokes/getSegmentationStrokeNodes/" +
        "getSegmentationResultSequencePixelAspectRatio + OZImageMask vtable[0x4e0] + " +
        "PGHelium::convertPCMatrix44 + HGXForm + HgcMaskStrokeAdd + " +
        "HgcMaskStrokeSubtract + HGObject new/delete + HGNode vtable[0x10,0x18,0x78,0x230] — " +
        "none ported. @0x4246a0",
    );
  }

  /**
   * OZLiSegmentationStrokeFilter::~OZLiSegmentationStrokeFilter()
   *   [D1 base dtor]                                              — @0x425310
   *
   * Body (per /tmp/Ozone_tV.txt at the D1 label):
   *   @0x425319  this[+0x000] = <vtbl-dtor-mid-primary>
   *   @0x425323  this[+0x5f0] = <vtbl-dtor-mid-secondary>
   *   @0x425335  OZRenderParams::~OZRenderParams(this+0x30)  — in-binary
   *   @0x42533a  this[+0x000] = <vtbl-late-primary>
   *   @0x425344  this[+0x5f0] = <vtbl-late-secondary>
   *   @0x425356  PCSharedCount::~PCSharedCount(this+0x18)    — stub 0x6ddaee
   *   @0x425365  LiImageSource::~LiImageSource(this)         — stub 0x6dd842
   *   @0x42536a  this[+0x5f0] = &PCShared_base_vtable + 0x10
   *   @0x42537c  if (this[+0x5f8] != null) PC_Sp_counted_base::weak_release() — stub 0x6de4fc
   *   ret.
   *
   * IDENTICAL shape to OZLiSegmentationFeatherFilter::~[D1] @0x4255b0.
   */
  static destroy_D1(_self: OZLiSegmentationStrokeFilter): void {
    // Cascading base dtors + PC_Sp_counted_base::weak_release unported — raise.
    // @0x425310
    throw new Error(
      "OZLiSegmentationStrokeFilter::~OZLiSegmentationStrokeFilter [D1]: " +
        "requires OZRenderParams::~OZRenderParams + PCSharedCount::~PCSharedCount + " +
        "LiImageSource::~LiImageSource + PC_Sp_counted_base::weak_release — " +
        "none ported. @0x425310",
    );
  }

  /**
   * OZLiSegmentationStrokeFilter::~OZLiSegmentationStrokeFilter()
   *   [D0 deleting dtor]                                          — @0x4253a0
   *
   * Same body as D1 through step 8; then tail-calls `operator delete(this)`
   * (stub Ozone 0x6dfc36) to free the heap allocation.
   */
  static destroy_D0(_self: OZLiSegmentationStrokeFilter): void {
    // D1 chain + operator delete — none ported. Raise. @0x4253a0
    throw new Error(
      "OZLiSegmentationStrokeFilter::~OZLiSegmentationStrokeFilter [D0]: " +
        "same as D1 plus operator delete(this) — none ported. @0x4253a0",
    );
  }
}
