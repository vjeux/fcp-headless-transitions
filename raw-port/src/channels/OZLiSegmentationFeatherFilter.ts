// OZLiSegmentationFeatherFilter.ts — Ozone segmentation-with-feather filter
//   (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice)
//
// Symbols ported (mangled → address):
//   * __ZN29OZLiSegmentationFeatherFilterC2EP11OZImageMaskRK14OZRenderParams
//       OZLiSegmentationFeatherFilter::OZLiSegmentationFeatherFilter(
//           OZImageMask*, OZRenderParams const&)  [C2 base ctor]   @0x424c50
//   * __ZN29OZLiSegmentationFeatherFilterC1EP11OZImageMaskRK14OZRenderParams
//       OZLiSegmentationFeatherFilter::OZLiSegmentationFeatherFilter(
//           OZImageMask*, OZRenderParams const&)  [C1 complete ctor] @0x424d20
//   * __ZNK29OZLiSegmentationFeatherFilter5cloneEv
//       OZLiSegmentationFeatherFilter::clone() const                 @0x424e20
//   * __ZN29OZLiSegmentationFeatherFilter9getHeliumER7LiAgent
//       OZLiSegmentationFeatherFilter::getHelium(LiAgent&)            @0x424f70
//   * __ZN29OZLiSegmentationFeatherFilterD1Ev                         @0x4255b0
//   * __ZN29OZLiSegmentationFeatherFilterD0Ev                         @0x425640
//
// -----------------------------------------------------------------------------
// SHAPE — object layout (derived from ctor/dtor bodies)
// -----------------------------------------------------------------------------
//   0x000  vptr_primary            — installed multiple times during ctor
//                                    (see C1 body @0x424d63/0x424d93/0x424dbb).
//   0x008  ...                     — LiImageFilter subobject state.
//   0x010  u64  someRefPtr = 0     — zeroed @0x424d74 (C1) / @0x424c89 (C2).
//   0x018  PCSharedCount           — default-constructed @0x424d80 (C1) /
//                                    @0x424c95 (C2).
//   0x020  u32  smallField = 0     — zeroed @0x424d85 (C1) / @0x424c9e (C2).
//   0x028  OZImageMask*  mask      — stored raw @0x424da4 & @0x424dcc (C1) /
//                                    @0x424cb8 & @0x424cda (C2).  In C1 the
//                                    `mask` is what the demangled sig calls
//                                    OZRenderParams* — see ARG-MAPPING NOTE.
//   0x030  OZRenderParams          — copy-ctor'd @0x424daf (C1) / @0x424cc3
//                                    (C2), via OZRenderParams::OZRenderParams(
//                                    OZRenderParams const&).
//   0x5f0  vptr_secondary          — LiImageSource / PCShared_base subobject
//                                    vptr, installed multiple times during
//                                    ctor.  In C1 @0x424d3e it is
//                                    initially set to the raw PCShared_base
//                                    vtable + 0x10 (i.e. the "no MI thunk"
//                                    fallback).
//   0x5f8  u64  weakRefTarget = 0  — @0x424d45 (C1); dtor releases via
//                                    PC_Sp_counted_base::weak_release()
//                                    @0x4255bc (D1) / @0x42565c (D0).
//
// The class layout matches OZLiSegmentationFilter conceptually but is
// SIGNIFICANTLY LARGER — allocation size is 0x600 bytes (compare `movl
// $0x600, %edi` @0x424e35 in clone() with OZLiSegmentationFilter's smaller
// footprint).  The extra bytes hold the LiImageSource+PCShared_base
// secondary subobject at +0x5f0.
//
// -----------------------------------------------------------------------------
// ARG-MAPPING NOTE (C1 @0x424d20)
// -----------------------------------------------------------------------------
// The mangled name declares (this, OZImageMask*, OZRenderParams const&).  The
// C1 body actually reads:
//     r15 = rdx    (used as `OZRenderParams const&` for the copy-ctor @0x424daf)
//     r14 = rsi    (stored raw at this+0x28 @0x424da4 / @0x424dcc)
//     rbx = rdi    (this)
// so `rsi` (nominally the OZImageMask*) is what gets planted at this+0x28 and
// `rdx` is what gets copy-ctor'd into this+0x30 as an OZRenderParams.  This
// matches the mangled sig 1:1 in C1 (unlike C2, which has an extra shifted
// arg — see below).
//
// -----------------------------------------------------------------------------
// ARG-MAPPING NOTE (C2 @0x424c50)
// -----------------------------------------------------------------------------
// C2's body reads 4 arg slots (rdi/rsi/rdx/rcx):
//     r12 = rcx    (used as `OZRenderParams const&` @0x424cc3)
//     r14 = rdx    (raw-stored at this+0x28 @0x424cb8 / @0x424cda)
//     r15 = rsi    (used as the MI base pointer — its +0x08/+0x10/+0x40 slots
//                   supply this class's vptr installs via Itanium-ABI
//                   RTTI-offset thunks (`-0x18(vtbl)` biasing @0x424c81 etc.))
//     rbx = rdi    (this)
// So C2 has one MORE argument than the mangled sig (an extra `void*` slot
// jammed in as `rsi`), and the "OZImageMask*" is treated as an MI-thunk base
// providing vtable slots.  Identical mirror-image to the drift documented in
// OZLiSegmentationFilter.ts.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all unported)
// -----------------------------------------------------------------------------
//   * LiImageSource::LiImageSource()          @stub Ozone 0x6dd83c
//   * PCSharedCount::PCSharedCount()          @stub Ozone 0x6ddae8
//   * PCSharedCount::PCSharedCount(
//         PCShared_base*)                     @stub Ozone 0x6ddadc
//   * PCSharedCount::PCSharedCount(
//         PCSharedCount const&)               @stub Ozone 0x6ddae2
//   * PCSharedCount::operator=(PCSharedCount) @stub Ozone 0x6ddaf4
//   * PCSharedCount::~PCSharedCount()         @stub Ozone 0x6ddaee
//   * PC_Sp_counted_base::weak_release()      @stub Ozone 0x6de4fc
//   * PCShared_base::~PCShared_base()         @0x424e10 (in-binary, non-stub)
//   * OZRenderParams::OZRenderParams(
//         OZRenderParams const&)              @0x424daf (in-binary)
//   * OZRenderParams::~OZRenderParams()       @0x4255d5 (in-binary)
//   * OZRenderParams::getResolution() const   @0x42506f (in-binary)
//   * OZChannel::getValueAsDouble(
//         CMTime const&) const                @0x42505b (in-binary)
//   * OZImageMask::isUsingSegmentation() const     @0x424fc7 (in-binary)
//   * OZImageMask::hasSegmentationResult()          @0x424fd9 (in-binary)
//   * LiAgent::getHelium(LiImageSource*)       @stub Ozone 0x6debb0
//   * LiImageFilter::~LiImageFilter()          @0x424de8 (in-binary)
//   * LiImageSource::~LiImageSource()          @stub Ozone 0x6dd842
//   * HGObject::operator new(size_t)           @stub Ozone 0x6def70
//   * HGObject::operator delete(void*)         @stub Ozone 0x6def6a
//   * HgcCopyMaskRGBToMaskAlpha::HgcCopyMaskRGBToMaskAlpha() @0x424ff6
//   * HgcCopyMaskAlphaToMaskRGB::HgcCopyMaskAlphaToMaskRGB() @0x425129
//   * HFeather::HFeather()                     @stub Ozone 0x6def40
//   * HGNode::SetInput(int, HGNode*)           @stub Ozone 0x6de9f4
//   * operator new(size_t) — heap allocator    @stub Ozone 0x6dfca2
//   * operator delete(void*)                   @stub Ozone 0x6dfc36
//   * throw_PCNullPointerException(bool)       @stub Ozone 0x6dd290
//   * __clang_call_terminate                   @0x4251e5 (terminate handler)
//   * __Unwind_Resume                          @stub Ozone 0x6dd07a
//
// -----------------------------------------------------------------------------
// getHelium(LiAgent&) — @0x424f70 — HIGH-LEVEL SHAPE
// -----------------------------------------------------------------------------
// (rdi=this=result-outparam, rsi=agent, rdx=???srcImageArg — see below).
//
//   1. Call LiAgent::getHelium(LiImageSource*) with (this, rdx, agent+0x10)
//      @0x424f95.  Writes the resulting HGNode* into a stack slot at
//      -0x30(%rbp).  Store into *rbx (the result outparam) @0x424f9e.
//   2. If the returned node is non-null, call its vtable slot 0x10 (an
//      addref of some sort) @0x424fac.
//   3. Load two doubles from `this+0x40` (r12+0x40 — u64) and `this+0x30..0x40`
//      (16 bytes read as movups, stashed on stack).  These form the CMTime
//      argument for the OZChannel::getValueAsDouble() call below.
//   4. Query `this->mask->isUsingSegmentation()` @0x424fc7 and
//      `this->mask->hasSegmentationResult()` @0x424fd9.  Both must be true —
//      if either returns 0, jump straight to cleanup @0x4251b2.
//   5. If both true:
//      a. `new HGObject(size=0x200)` @0x424feb  →  r14.
//      b. Ctor `HgcCopyMaskRGBToMaskAlpha` @0x424ff6.
//      c. Rebind r14's vptr to a class-local slot at RIP+0x43cafe (=0x86 1b00)
//         @0x424ffb.
//      d. r14.SetInput(0, r15=the earlier-obtained HGNode*)  @0x42500d.
//      e. call vtable slot 0x88(*r14) with (1, 0x2000) — probably a
//         "SetOutputFormat(mask-alpha)" @0x425022.
//      f. Refcount ceremony: if r15 != r14, release r15 via vtable[0x18]
//         @0x425038, then store r14 into *rbx and addref via vtable[0x10]
//         @0x425044, then r15 = r14.
//      g. Compute `alpha = mask->OZChannel@+0x1908.getValueAsDouble(CMTime)`
//         @0x42505b.  Read `resolution = renderParams.getResolution()`
//         @0x42506f.  (resolution is a 16-byte double pair; stored at
//         -0x80(%rbp).)
//      h. GATE: `if (fabs(alpha) <= 1e-07) skip-feather-path` — implemented
//         via `andpd 0x7fffffffffffffff` (fabs mask, RIP+0x2e1d94 → 0x706e10)
//         and `ucomisd 1e-07` (RIP+0x2e1e47 → 0x706ed0) @0x425074-0x42508d.
//         On skip, r12 (HFeather pointer) stays null (`xorl %r12d, %r12d`)
//         and jump to @0x425119.
//      i. If NOT skipped: `new HGObject(size=0x1b0)` @0x4250a6  →  r12.
//         Ctor `HFeather` @0x4250b1.  Convert `alpha` and `resolution.x` to
//         float and stash:
//             HFeather+0x198 = float(resolution.x)        @0x4250c7
//             HFeather+0x19c = 0 (u64 wipe of +0x19c..0x1a3)  @0x4250d1
//             HFeather+0x1a4 = float(alpha)               @0x4250dd
//         (Note the 0x1a4 offset — the wipe zeros +0x19c..+0x1a3 which is 8
//         bytes, i.e. leaves a 4-byte gap between +0x198 and +0x1a4.  Layout
//         is: [0x198]=res.x/float, [0x19c]=0/f32, [0x1a0]=0/f32, [0x1a4]=alpha/f32.)
//         Call vtable slot 0x78(*r12) with (0, r15) — SetInput(0, alpha-node)
//         @0x4250f3.
//         Refcount: if r15 != r12, release r15 via vtable[0x18], store r12
//         into *rbx, addref via vtable[0x10], r15 = r12.
//      j. `new HGObject(size=0x1a0)` @0x42511e  →  r13.  Ctor
//         `HgcCopyMaskAlphaToMaskRGB` @0x425129.  Rebind vptr to RIP+0x43c773
//         (=0x8618b0) @0x42512e.  SetInput(0, -0x30(%rbp)=agent-node)
//         @0x425142.  Call vtable slot 0x78(*r13) with (1, r15)  — SetInput
//         alt @0x425156.  Call vtable slot 0x88(*r13) with (1, 0x2000)
//         @0x42516a.  Refcount r13-vs-r15 same pattern.  Then release r13
//         via vtable[0x18] @0x425197 and r14 via vtable[0x18] @0x4251a0.
//         Release r12 if non-null via vtable[0x18] @0x4251af.
//   6. Cleanup: release the initial LiAgent::getHelium output at
//      -0x30(%rbp) via vtable[0x18] if non-null @0x4251be.  Return rbx.
//
// The whole flow constructs a small HG-node graph:
//
//     LiAgent::getHelium(agent, srcImage, agent+0x10)
//                    ↓
//     HgcCopyMaskRGBToMaskAlpha (SetOutputFmt 0x2000)
//                    ↓
//     HFeather (radius = float(resolution.x), amount = float(alpha))       [only if |alpha|>1e-7]
//                    ↓
//     HgcCopyMaskAlphaToMaskRGB (SetOutputFmt 0x2000)
//                    ↓
//     *result  (returned via this=rdi outparam)
//
// The `1e-7` gate is a "no-op alpha ⇒ skip feather, just RGB→A→RGB round-trip"
// early-out.  This is BOTH the entire dataflow of the filter AND the reason
// this class exists: it's the segmentation filter WITH a feather-radius
// modulation.
//
// FRONTIERS are numerous (HGObject alloc, HGNode vtable, HgcCopyMask*, HFeather,
// OZChannel::getValueAsDouble, LiAgent::getHelium — all unported), so we
// raise a specific error citing the entry address.
//
// -----------------------------------------------------------------------------
// clone() const — @0x424e20
// -----------------------------------------------------------------------------
// Body:
//   1. r14 = this=rdi (the result-outparam, or rather the LiImageFilterHandle
//      being written into), r15 = this=rsi (the actual source object — the
//      demangled signature is `clone(this)` but on x86_64 with SRet the
//      out-param becomes rdi and `this` becomes rsi).
//   2. `new(0x600)` @0x424e3a via operator new (stub 0x6dfca2)   →  rbx.
//   3. Call C1 ctor @0x424e4d with (rbx, src->mask=r15+0x28,
//      &src->params=r15+0x30) — building the new instance from the source's
//      mask and params.
//   4. Refcount ceremony: `-0x38(%rbp) = rbx`; grab
//      `rbx->vptr[-0x18]` (Itanium MI RTTI offset) @0x424e59 and add rbx to
//      get the PCShared_base subobject pointer in rsi; construct a
//      `PCSharedCount(PCShared_base*)` @0x424e67 into -0x30(%rbp).  If the
//      new object is null, `throw_PCNullPointerException(true)` @0x424e7a.
//   5. Copy `src->someRefPtr(+0x10)` into `dst->someRefPtr(+0x10)` @0x424e87.
//   6. Copy-construct a temp PCSharedCount from `&src->sharedCount(+0x18)`
//      into -0x28(%rbp) @0x424e94; assign it to `dst->sharedCount(+0x18)`
//      via `PCSharedCount::operator=` @0x424ea2; destroy the temp @0x424eab.
//   7. Copy `src->smallField(+0x20)` into `dst->smallField(+0x20)` @0x424eb4.
//   8. Write `dst` into `*result=r14` @0x424ebd.  Default-construct a
//      PCSharedCount into `result+0x8` @0x424ec7.
//   9. If `*result != null` (which is always true here) copy-construct a
//      PCSharedCount from the local -0x30(%rbp) one (built in step 4) into
//      -0x28(%rbp) @0x424ed9; assign it to `result+0x8` @0x424ee5; destroy
//      the temp @0x424eee.
//  10. Destroy the -0x30(%rbp) PCSharedCount @0x424ef6.
//  11. Return the outparam handle (rax = r14).
//
// The clone() outparam-handle is a std::shared_ptr-like tuple:
//   {  raw* @+0x00 ,  PCSharedCount @+0x08 }.
//
// -----------------------------------------------------------------------------
// D1/D0 dtors — @0x4255b0 / @0x425640
// -----------------------------------------------------------------------------
// Both do:
//   1. Overwrite `this->vptr(+0x00)` with a "dtor-mid" vtable @0x4255c0/@0x425650.
//   2. Overwrite `this->vptr_secondary(+0x5f0)` with a "dtor-mid" secondary
//      vtable @0x4255ca/@0x42565a.
//   3. `~OZRenderParams()` on `this+0x30`  @0x4255d5/@0x425665.
//   4. Overwrite `this->vptr(+0x00)` again @0x4255e1/@0x42566a and
//      `this->vptr_secondary(+0x5f0)` again @0x4255eb/@0x425674 — walking
//      the vtable down the base-class chain (Itanium ABI).
//   5. `~PCSharedCount(&this+0x18)`  @0x4255f6/@0x425686.
//   6. `~LiImageSource(this)`  @0x425605/@0x425695.
//   7. Reset `this+0x5f0` to PCShared_base vtable+0x10 @0x425615/@0x4256a5.
//   8. If `this+0x5f8` != null, call `PC_Sp_counted_base::weak_release()`
//      @0x425628/@0x4256b8.
//   9. D1 returns; D0 additionally tail-calls `operator delete(this)`
//      @0x4256c6 (i.e. deletes the heap allocation).
//
// All of these callees are unported; the dtors raise citing the entry addr.
//
// -----------------------------------------------------------------------------
// pixelTransformSupport / estimateRenderMemory
// -----------------------------------------------------------------------------
// The brief only lists 6 methods (ctors×2, clone, getHelium, dtors×2).  If
// the LiImageFilter base implementations of pixelTransformSupport() /
// estimateRenderMemory() are used here, they live on the base class (not on
// this class's mangled symbol set) and are not our responsibility to port —
// the sibling OZLiSegmentationFilter DOES emit its own overrides of those,
// but this Feather class inherits.

/** Opaque OZImageMask handle — not yet transcribed.  See sibling
 *  OZLiSegmentationFilter.ts. */
export type OZImageMask = object;

/** Opaque OZRenderParams handle — copy-ctor'd at ctor time; the class
 *  isn't yet transcribed. */
export type OZRenderParams = object;

/** Opaque LiAgent handle — passed to getHelium().  Not yet transcribed. */
export type LiAgent = object;

/** Opaque HGNode handle — the returned/result graph-node type from
 *  LiAgent::getHelium and the intermediate Hgc* ops.  Not yet transcribed. */
export type HGNode = object;

/** clone() outparam handle: a std::shared_ptr-like { raw*, PCSharedCount }
 *  pair.  We surface it as a plain object.  Not fully transcribed. */
export interface LiImageFilterHandle {
  raw: OZLiSegmentationFeatherFilter | null;
  sharedCount: unknown;
}

export class OZLiSegmentationFeatherFilter {
  /** Primary vptr @+0x000 — set multiple times in ctor (see file header
   *  ARG-MAPPING NOTE).  Modeled as opaque. */
  vptrPrimary: unknown = null;

  /** @+0x010 — nominally a raw shared-count target; zeroed @0x424d74 (C1)
   *  / @0x424c89 (C2). */
  someRefPtr: unknown = null;

  /** @+0x018 — PCSharedCount, default-constructed @0x424d80 (C1) /
   *  @0x424c95 (C2). */
  sharedCount: unknown = null;

  /** @+0x020 — u32 status flag, zeroed @0x424d85 (C1) / @0x424c9e (C2). */
  smallField: number = 0;

  /** @+0x028 — mask pointer, raw-stored @0x424da4 & @0x424dcc (C1) /
   *  @0x424cb8 & @0x424cda (C2). */
  mask: OZImageMask | null = null;

  /** @+0x030 — copy of the caller's OZRenderParams, in-place ctor'd
   *  @0x424daf (C1) / @0x424cc3 (C2). */
  params: OZRenderParams | null = null;

  /** @+0x5f0 — secondary vptr (LiImageSource / PCShared_base subobject).
   *  In C1 set initially to PCShared_base_vtable + 0x10 @0x424d3e. */
  vptrSecondary: unknown = null;

  /** @+0x5f8 — weak-ref target for PC_Sp_counted_base::weak_release() in
   *  the dtors.  Zeroed @0x424d45 (C1).  Modeled as opaque. */
  weakRefTarget: unknown = null;

  /**
   * OZLiSegmentationFeatherFilter::OZLiSegmentationFeatherFilter(
   *     OZImageMask*, OZRenderParams const&)   [C1 complete-object ctor]
   *                                                              — @0x424d20
   *
   * Body (per re/disasm/…OZLiSegmentationFeatherFilter.s):
   *   @0x424d33  this[+0x5f0] = &PCShared_base_vtable + 0x10       (u64)
   *   @0x424d45  this[+0x5f8] = 0                                   (u64)
   *   @0x424d57  LiImageSource::LiImageSource(this)  — stub Ozone 0x6dd83c
   *   @0x424d63  this[+0x000] = <vtbl_A @0x862608>                  (primary vptr install #1)
   *   @0x424d6d  this[+0x5f0] = <vtbl_B @0x8626f0>                  (secondary vptr install #1)
   *   @0x424d74  this[+0x010] = 0
   *   @0x424d80  PCSharedCount::PCSharedCount(&this[+0x018])  — stub 0x6ddae8
   *   @0x424d85  this[+0x020] = 0                                   (u32)
   *   @0x424d93  this[+0x000] = <vtbl_C @0x8624f0>                  (primary vptr install #2)
   *   @0x424d9d  this[+0x5f0] = <vtbl_D @0x8625d8>                  (secondary vptr install #2)
   *   @0x424da4  this[+0x028] = mask   (r14 = rsi at entry)
   *   @0x424daf  OZRenderParams::OZRenderParams(&this[+0x030], params)
   *   @0x424dbb  this[+0x000] = <vtbl_E @0x861748>                  (primary vptr install #3)
   *   @0x424dc5  this[+0x5f0] = <vtbl_F @0x861830>                  (secondary vptr install #3)
   *   @0x424dcc  this[+0x028] = mask   (redundant re-store)
   *   ret.
   *
   * Exception paths @0x424ddb→@0x424e18 unwind LiImageFilter::~LiImageFilter()
   * / LiImageSource::~LiImageSource() / PCShared_base::~PCShared_base() then
   * __Unwind_Resume.
   *
   * Every base-ctor callee is unported; the whole body raises.
   */
  constructor(_mask: OZImageMask | null, _params: OZRenderParams) {
    // @0x424d33-0x424d45 install PCShared_base vptr + zero weakRefTarget
    // @0x424d57 LiImageSource::LiImageSource() — unported
    // @0x424d63/0x424d93/0x424dbb three successive primary-vptr installs
    // @0x424d6d/0x424d9d/0x424dc5 three successive secondary-vptr installs
    // @0x424d74 this[+0x10] = 0
    // @0x424d80 PCSharedCount::PCSharedCount() — unported
    // @0x424d85 this[+0x20] = 0 (u32)
    // @0x424da4/0x424dcc this[+0x28] = mask
    // @0x424daf OZRenderParams::OZRenderParams(&this[+0x30], params) — unported
    // Base-class ctors + copy-ctor unresolved — raise. @0x424d20
    throw new Error(
      "OZLiSegmentationFeatherFilter::OZLiSegmentationFeatherFilter(C1): " +
        "requires LiImageSource::LiImageSource() + PCSharedCount::PCSharedCount() + " +
        "OZRenderParams::OZRenderParams(const&) + PCShared_base MI vtable installs — " +
        "none ported. @0x424d20",
    );
  }

  /**
   * OZLiSegmentationFeatherFilter::OZLiSegmentationFeatherFilter(
   *     OZImageMask*, OZRenderParams const&)   [C2 base-object ctor]
   *                                                              — @0x424c50
   *
   * Body (per re/disasm/…OZLiSegmentationFeatherFilter.OZLiSegmentationFeatherFilter.s):
   *   @0x424c6a  r13 = rsi+0x18   (LiImageSource subobject inside `mask`)
   *   @0x424c71  LiImageSource::LiImageSource(this, r13)  — stub Ozone 0x6dd83c
   *   @0x424c7a  this[+0x000] = mask[+0x010]                       (primary vptr from mask MI)
   *   @0x424c85  this[vtbl_A_MI_offset] = mask[+0x038]             (Itanium MI thunk: `-0x18(vtbl)` bias)
   *   @0x424c89  this[+0x010] = 0
   *   @0x424c95  PCSharedCount::PCSharedCount(&this[+0x018])  — stub 0x6ddae8
   *   @0x424c9e  this[+0x020] = 0                                   (u32)
   *   @0x424ca9  this[+0x000] = mask[+0x008]                       (primary vptr install #2 from mask MI)
   *   @0x424cb4  this[vtbl_B_MI_offset] = mask[+0x040]             (Itanium MI thunk)
   *   @0x424cb8  this[+0x028] = extraTag  (r14 = rdx at entry)
   *   @0x424cc3  OZRenderParams::OZRenderParams(&this[+0x030], params=r12=rcx)
   *   @0x424ccb  this[+0x000] = mask[+0x000]                       (primary vptr install #3 from mask MI)
   *   @0x424cd6  this[vtbl_C_MI_offset] = mask[+0x048]             (Itanium MI thunk)
   *   @0x424cda  this[+0x028] = extraTag  (redundant re-store)
   *   ret.
   *
   * See file-header ARG-MAPPING NOTE for the extra `extraTag` slot.
   */
  static OZLiSegmentationFeatherFilterC2(
    _self: OZLiSegmentationFeatherFilter,
    _mask: OZImageMask | null,
    _extraTag: unknown,
    _params: OZRenderParams,
  ): void {
    // @0x424c71 LiImageSource::LiImageSource() with the +0x18 subobject — unported
    // @0x424c7a/0x424ca9/0x424ccb three primary-vptr installs via mask-MI reads
    // @0x424c85/0x424cb4/0x424cd6 three secondary-vptr installs via mask-MI reads (Itanium `-0x18(vtbl)` thunks)
    // @0x424c89 this[+0x10] = 0
    // @0x424c95 PCSharedCount::PCSharedCount() — unported
    // @0x424c9e this[+0x20] = 0 (u32)
    // @0x424cb8/0x424cda this[+0x28] = extraTag
    // @0x424cc3 OZRenderParams::OZRenderParams(&this[+0x30], params) — unported
    // Base-class ctors + copy-ctor unresolved — raise. @0x424c50
    throw new Error(
      "OZLiSegmentationFeatherFilter::OZLiSegmentationFeatherFilter(C2): " +
        "requires LiImageSource::LiImageSource() + PCSharedCount::PCSharedCount() + " +
        "OZRenderParams::OZRenderParams(const&) + 3-tier MI vtable installs from mask — " +
        "none ported. @0x424c50",
    );
  }

  /**
   * OZLiSegmentationFeatherFilter::clone() const  — @0x424e20
   *
   * Body:
   *   1. `new(0x600)` @0x424e3a  →  rbx.
   *   2. C1 ctor(rbx, src.mask=+0x28, &src.params=+0x30) @0x424e4d.
   *   3. Build a PCSharedCount(PCShared_base*) into -0x30(%rbp) via the
   *      MI-thunk RTTI offset `-0x18(vtbl)`  @0x424e67.
   *   4. If `rbx` is null (impossible on a successful `new`, but the compiler
   *      still emits the check):
   *          throw_PCNullPointerException(true) @0x424e7a.
   *   5. dst.someRefPtr(+0x10) = src.someRefPtr(+0x10) @0x424e87.
   *   6. Copy-ctor a temp PCSharedCount from src.sharedCount, assign it into
   *      dst.sharedCount, destroy the temp  @0x424e94-@0x424eab.
   *   7. dst.smallField(+0x20) = src.smallField(+0x20)  @0x424eb4.
   *   8. result[+0x00] = dst  @0x424ebd.
   *   9. PCSharedCount::PCSharedCount(&result[+0x08])  @0x424ec7  (default).
   *  10. if (result[+0x00] != null) {
   *          temp = PCSharedCount(local -0x30 count)  @0x424ed9
   *          result[+0x08] = temp                     @0x424ee5
   *          ~temp                                    @0x424eee
   *      }
   *  11. ~(local -0x30 count)                          @0x424ef6
   *  12. return result (rax = r14=outparam pointer).
   *
   * All PCSharedCount / operator-new / throw callees are unported — raise.
   */
  clone(): LiImageFilterHandle {
    // @0x424e35 __Znwm(0x600) — operator new
    // @0x424e4d C1 ctor  (this class's own ctor)
    // @0x424e67 PCSharedCount::PCSharedCount(PCShared_base*) — unported
    // @0x424e7a throw_PCNullPointerException(true) — unported
    // @0x424e87 dst[+0x10] = src[+0x10]
    // @0x424e94/0x424ea2/0x424eab PCSharedCount copy/assign/dtor — unported
    // @0x424eb4 dst[+0x20] = src[+0x20]
    // @0x424ebd result.raw = dst
    // @0x424ec7 PCSharedCount::PCSharedCount() into result[+0x08] — unported
    // @0x424ed9/0x424ee5/0x424eee copy/assign/dtor the count into result[+0x08]
    // @0x424ef6 dtor of the -0x30(%rbp) local count
    // Whole flow depends on PCSharedCount frontier — raise. @0x424e20
    throw new Error(
      "OZLiSegmentationFeatherFilter::clone: requires operator new(0x600) + " +
        "C1 ctor + PCSharedCount(PCShared_base*/const&/= /~) + " +
        "throw_PCNullPointerException — none ported. @0x424e20",
    );
  }

  /**
   * OZLiSegmentationFeatherFilter::getHelium(LiAgent&)  — @0x424f70
   *
   * See the massive HIGH-LEVEL SHAPE block in the file header for the full
   * decoded dataflow.  Summary:
   *
   *   result = LiAgent::getHelium(agent, srcImage=rdx, agent+0x10)  @0x424f95
   *   if (mask.isUsingSegmentation() && mask.hasSegmentationResult()) {
   *     rgb2a = new HgcCopyMaskRGBToMaskAlpha();  rgb2a.SetInput(0,result);
   *     rgb2a.<slot 0x88>(1, 0x2000);                                   [SetOutputFmt]
   *     current = rgb2a;
   *
   *     alpha = mask.channel(+0x1908).getValueAsDouble(CMTime{u64@+0x40, 16 bytes@+0x30});
   *     res   = renderParams.getResolution();   // 2 doubles
   *     if (Math.abs(alpha) > 1e-7) {
   *       feather = new HFeather();
   *       feather.f32@+0x198 = float(res.x);
   *       feather.u64@+0x19c = 0;               // wipes +0x19c..+0x1a3 (f32 gap + f32 zero)
   *       feather.f32@+0x1a4 = float(alpha);
   *       feather.<slot 0x78>(0, current);                              [SetInput(0,current)]
   *       current = feather;
   *     } else {
   *       feather = null;
   *     }
   *
   *     a2rgb = new HgcCopyMaskAlphaToMaskRGB();
   *     a2rgb.SetInput(0, result_original);                             [-0x30(%rbp) node]
   *     a2rgb.<slot 0x78>(1, current);                                  [SetInput alt]
   *     a2rgb.<slot 0x88>(1, 0x2000);                                   [SetOutputFmt]
   *     *out = a2rgb;
   *     // then release a2rgb, rgb2a, feather?, and result_original.
   *   }
   *   return *out.
   *
   * Every graph-node op (HGObject new/delete, HGNode SetInput, vtable slots
   * 0x10/0x18/0x78/0x88, HgcCopyMask*, HFeather, LiAgent::getHelium,
   * OZImageMask predicates, OZChannel::getValueAsDouble, OZRenderParams::
   * getResolution) is unported.  We faithfully surface the whole call as a
   * raise.
   *
   * The 1e-7 gate constant is direct: `andpd $0x7fffffffffffffff` (RIP →
   * 0x706e10, fabs sign-mask on double) + `ucomisd 1e-07` (RIP → 0x706ed0,
   * u64 = 0x3e7ad7f29abcaf48).  This gate is `Math.abs(alpha) > 1e-7`
   * (`jbe` is `<=`, and takes the skip branch → so "no skip" means `>`).
   */
  getHelium(_agent: LiAgent, _srcImage: HGNode | null): HGNode | null {
    // @0x424f95 LiAgent::getHelium(agent, srcImage, agent+0x10) — unported
    // @0x424fac / @0x425038 / @0x425044 / @0x4251af — HGNode vtable[0x10]/[0x18] refcount ops
    // @0x424fc7 OZImageMask::isUsingSegmentation() — in-binary but unported
    // @0x424fd9 OZImageMask::hasSegmentationResult() — in-binary but unported
    // @0x424feb HGObject::operator new(0x200) — unported
    // @0x424ff6 HgcCopyMaskRGBToMaskAlpha::HgcCopyMaskRGBToMaskAlpha() — unported
    // @0x42500d HGNode::SetInput(0, r15) — unported
    // @0x425022 vtable slot 0x88 (SetOutputFormat) — unported
    // @0x42505b OZChannel::getValueAsDouble(CMTime) — unported (const at mask[+0x1908])
    // @0x42506f OZRenderParams::getResolution() — unported
    // @0x425074-@0x42508d fabs+ucomisd gate: `if (Math.abs(alpha) > 1e-7)` — pure math, transcribed.
    //     fabs mask = 0x7fffffffffffffff @const 0x706e10;  threshold = 1e-7 @const 0x706ed0.
    // @0x4250a6 HGObject::operator new(0x1b0) — unported
    // @0x4250b1 HFeather::HFeather() — unported
    // @0x4250c7 HFeather+0x198 = float(res.x)
    // @0x4250d1 HFeather+0x19c = 0 (u64 clear of 8 bytes)
    // @0x4250dd HFeather+0x1a4 = float(alpha)
    // @0x4250f3 vtable slot 0x78 SetInput(0, current) — unported
    // @0x42511e HGObject::operator new(0x1a0) — unported
    // @0x425129 HgcCopyMaskAlphaToMaskRGB::HgcCopyMaskAlphaToMaskRGB() — unported
    // @0x425142 HGNode::SetInput(0, agent-node) — unported
    // @0x425156 vtable slot 0x78 SetInput(1, current) — unported
    // @0x42516a vtable slot 0x88 SetOutputFormat(1, 0x2000) — unported
    // @0x425197 / @0x4251a0 / @0x4251af / @0x4251be vtable[0x18] releases
    // Every HG-node graph op is unported — raise. @0x424f70
    throw new Error(
      "OZLiSegmentationFeatherFilter::getHelium: requires LiAgent::getHelium + " +
        "HGObject new/delete + HGNode SetInput / vtable[0x10,0x18,0x78,0x88] + " +
        "HgcCopyMaskRGBToMaskAlpha + HgcCopyMaskAlphaToMaskRGB + HFeather + " +
        "OZImageMask::isUsingSegmentation/hasSegmentationResult + " +
        "OZChannel::getValueAsDouble + OZRenderParams::getResolution — " +
        "none ported. @0x424f70",
    );
  }

  /**
   * OZLiSegmentationFeatherFilter::~OZLiSegmentationFeatherFilter()
   *   [D1 base dtor]                                              — @0x4255b0
   *
   * Body (per re/disasm/…):
   *   @0x4255b9  this[+0x000] = <vtbl-dtor-mid-primary>
   *   @0x4255c3  this[+0x5f0] = <vtbl-dtor-mid-secondary>
   *   @0x4255d5  OZRenderParams::~OZRenderParams(this+0x30)  — in-binary
   *   @0x4255da  this[+0x000] = <vtbl-late-primary>
   *   @0x4255e4  this[+0x5f0] = <vtbl-late-secondary>
   *   @0x4255f6  PCSharedCount::~PCSharedCount(this+0x18)    — stub 0x6ddaee
   *   @0x425605  LiImageSource::~LiImageSource(this)         — stub 0x6dd842
   *   @0x42560a  this[+0x5f0] = &PCShared_base_vtable + 0x10
   *   @0x42561c  if (this[+0x5f8] != null) PC_Sp_counted_base::weak_release() — stub 0x6de4fc
   *   ret.
   */
  static destroy_D1(_self: OZLiSegmentationFeatherFilter): void {
    // Cascading base-class dtors + PCSharedCount + PC_Sp_counted_base::weak_release
    // are all unported — raise. @0x4255b0
    throw new Error(
      "OZLiSegmentationFeatherFilter::~OZLiSegmentationFeatherFilter [D1]: " +
        "requires OZRenderParams::~OZRenderParams + PCSharedCount::~PCSharedCount + " +
        "LiImageSource::~LiImageSource + PC_Sp_counted_base::weak_release — " +
        "none ported. @0x4255b0",
    );
  }

  /**
   * OZLiSegmentationFeatherFilter::~OZLiSegmentationFeatherFilter()
   *   [D0 deleting dtor]                                          — @0x425640
   *
   * Same body as D1 through step 8; then tail-calls `operator delete(this)`
   * @0x4256c6 (stub Ozone 0x6dfc36) to free the heap allocation.
   */
  static destroy_D0(_self: OZLiSegmentationFeatherFilter): void {
    // D1 chain + operator delete — none ported. Raise. @0x425640
    throw new Error(
      "OZLiSegmentationFeatherFilter::~OZLiSegmentationFeatherFilter [D0]: " +
        "same as D1 plus operator delete(this) — none ported. @0x425640",
    );
  }
}
