// OZCrop.ts — Ozone image-crop filter (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice)
//
// Symbols ported (mangled -> demangled -> address):
//   * __ZN6OZCrop11getBoundaryER7LiAgentP6PCRectIdE
//       OZCrop::getBoundary(LiAgent&, PCRect<double>*)         @0x41e820
//   * __ZN6OZCrop9getHeliumER7LiAgent
//       OZCrop::getHelium(LiAgent&)                             @0x41e8b0
//   * __ZN6OZCrop20estimateRenderMemoryERNSt3__13setI9PCHash128NS0_4lessIS2_EENS0_9allocatorIS2_EEEE
//       OZCrop::estimateRenderMemory(std::set<PCHash128,...>&)  @0x41ebd0
//   * __ZN6OZCropD1Ev  OZCrop::~OZCrop() [D1 non-deleting]     @0x41ebe0
//   * __ZN6OZCropD0Ev  OZCrop::~OZCrop() [D0 deleting]         @0x41ec50
//   * __ZN6OZCrop21pixelTransformSupportERK18LiRenderParameters
//       OZCrop::pixelTransformSupport(LiRenderParameters const&)@0x41ecc0
//
// -----------------------------------------------------------------------------
// SHAPE — object layout (derived from D1 @0x41ebe0 + getBoundary @0x41e820 +
// getHelium @0x41e8b0). OZCrop multi-inherits LiImageFilter (primary) and
// PCShared_base (secondary), same MI pattern as OZLiHePixelTransformFixer.
// -----------------------------------------------------------------------------
//   0x00  vptr_primary        — LiImageFilter subobject vtable
//                               (D1 reinstalls it @0x41ebe9 from
//                                Ozone `0x442768(%rip)` const-ptr slot).
//   0x08  ...                  LiImageFilter subobject fields (unmodeled;
//                               inherited, none read here).
//   0x10  u64 source           — LiImageSource*.  Read in getBoundary
//                               @0x41e830 as `this[+0x10]`; NULL-checked
//                               (throw PCNullPointerException) then
//                               dereferenced for vtable slot +0x18 call
//                               @0x41e850–0x41e853 (source->getBoundary).
//   0x18  PCSharedCount        — 8 bytes; D1 calls
//                               `PCSharedCount::~PCSharedCount()` on
//                               `this+0x18` @0x41ec02.
//   0x20  u32                  — flag/status, u32-sized (unmodeled;
//                               getHelium writes an unrelated agent+0x20,
//                               not this+0x20).
//   0x28  double  crop.x       PCRect<double> origin.x
//   0x30  double  crop.y       PCRect<double> origin.y
//   0x38  double  crop.w       PCRect<double> size.w  — >0 gate @0x41e8c3
//   0x40  double  crop.h       PCRect<double> size.h  — >0 gate @0x41e8d9
//                               Read by getBoundary @0x41e878–0x41e87e
//                               (`0x28(%r14)`,`0x38(%r14)`) as 2×2 doubles.
//   0x48  vptr_secondary       — PCShared_base subobject vtable+0x10.
//                               D1 reinstalls it @0x41ec16 from
//                               __ZTV13PCShared_base + 0x10.
//   0x50  PC_Sp_counted_base*  — weak-released in D1 @0x41ec25–0x41ec2e
//                               (only if non-null).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (unported — kept as opaque handles / raising stubs)
// -----------------------------------------------------------------------------
//   * throw_PCNullPointerException(bool)          @stub Ozone 0x6dd290
//   * LiImageSource::vtable[+0x18](PCRect<double>*)  — chained getBoundary
//     via `*0x18(%rax)` @0x41e853; the callee is virtual on this+0x10's
//     concrete class (unknown at port time).
//   * PCMatrix44Tmpl<double>::transformRect<double>(
//         PCRect<double> const&, PCRect<double>&) const
//                                                @Ozone (Ozone-local)
//                                                call site 0x41e97d
//   * LiAgent::haveROI() const                    @stub Ozone 0x6df960
//   * LiAgent::getROI() const                     @stub Ozone 0x6df954
//   * LiAgent::setInputROI(PCRect<int> const&)    @stub Ozone 0x6deb62
//   * LiAgent::getHelium(LiImageSource*)          @stub Ozone 0x6debb0
//   * LiAgent::getBoundary()                      @stub Ozone 0x6deb5c
//   * LiAgent::getCrop() const                    @stub Ozone 0x6df95a
//   * LiImagePolygon::LiImagePolygon(LiImagePolygon const&)
//                                                @stub Ozone 0x6ddc26
//   * LiImagePolygon::~LiImagePolygon()           @stub Ozone 0x6ddc32
//   * LiImagePolygon::set(PCRect<double> const&, EdgeType)
//                                                @stub Ozone 0x6ddc1a
//   * LiAgent::getInversePixelTransform(double) const
//                                                @stub Ozone 0x6df924
//   * liTransformAndClip(PCRect<double> const&,
//                        PCMatrix44Tmpl<double> const&,
//                        LiImagePolygon&)
//                                                @stub Ozone 0x6dd170
//   * LiAgent::projectAndClipPolygon(LiImagePolygon&, double)
//                                                @stub Ozone 0x6deb86
//   * LiAgent::outCrop(LiImagePolygon const&)     @stub Ozone 0x6deba4
//   * LiImageFilter::estimateRenderMemory(std::set<PCHash128,...>&)
//                                                @stub Ozone 0x6dd824
//   * PCSharedCount::~PCSharedCount()             @stub Ozone 0x6ddaee
//   * LiImageSource::~LiImageSource() [D2]        @stub Ozone 0x6dd842
//   * PC_Sp_counted_base::weak_release()          @stub Ozone 0x6de4fc
//   * operator delete(void*)                      @stub Ozone 0x6dfc36
//   * __Unwind_Resume                             @stub Ozone 0x6dd07a

/** Opaque LiAgent — a rendering-agent context object (~≥0xa8 bytes). */
export type LiAgent = unknown;

/** Opaque LiImageSource — this+0x10 in OZCrop; only the virtual
 *  `getBoundary(PCRect<double>*) -> bool` slot (+0x18) is invoked. */
export type LiImageSource = { vptr: { getBoundary(rect: PCRectD): boolean } };

/** Opaque LiRenderParameters — pixelTransformSupport() reads nothing off it. */
export type LiRenderParameters = object;

/** Opaque std::set<PCHash128,...> — estimateRenderMemory forwards it. */
export type PCHash128Set = object;

/** PCRect<double> — the exact 32-byte layout used by getBoundary:
 *  offset 0x00 = x, 0x08 = y, 0x10 = w, 0x18 = h.  Fields are mutable here
 *  because getBoundary rewrites `*rect` in place (@0x41e89c–0x41e8a0). */
export interface PCRectD {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * throw_PCNullPointerException(bool) — @stub Ozone 0x6dd290.  Called by
 * getBoundary @0x41e841 when `this+0x10` is null.  The argument passed is
 * `edi=1` (i.e. `throw_PCNullPointerException(true)`).  Real body unported;
 * we raise a JS Error whose message documents both the trap and the call site.
 */
function throw_PCNullPointerException(_flag: boolean): never {
  // Ozone 0x6dd290 @__stubs; the real routine unwinds via C++ EH.
  throw new Error(
    "OZCrop: PCNullPointerException — source (this+0x10) is null " +
      "@0x41e841 (throw_PCNullPointerException(true))",
  );
}

export class OZCrop {
  /** @+0x00 — LiImageFilter primary vptr (frontier vtable). */
  vptrPrimary: unknown = null;

  /** @+0x10 — LiImageSource* source pointer.  Getter-facing type is nullable
   *  so getBoundary's null check @0x41e837 is faithful. */
  source: LiImageSource | null = null;

  /** @+0x18 — PCSharedCount subobject (opaque; frontier ctor/dtor). */
  sharedCount: unknown = null;

  /** @+0x20 — u32 status flag; unread by any ported method on `this`. */
  smallField: number = 0;

  /** @+0x28..0x40 — PCRect<double> crop.  Members held inline (see SHAPE). */
  crop: PCRectD = { x: 0, y: 0, w: 0, h: 0 };

  /** @+0x48 — PCShared_base secondary vptr (frontier). */
  vptrSecondary: unknown = null;

  /** @+0x50 — PC_Sp_counted_base* weak-owned; D1 releases it if non-null. */
  pcSpCountedBase: unknown = null;

  /**
   * OZCrop::getBoundary(LiAgent& rsi-arg, PCRect<double>* rect rdx-arg)
   *   — @0x41e820.
   *
   * Body reconstruction (register mapping: rdi=this=r14, rsi=agent=r15,
   * rdx=rect=rbx):
   *
   *   @0x41e830  rdi := this[+0x10]              (LiImageSource* source)
   *   @0x41e834–0x41e837  if (source == 0) …
   *   @0x41e839–0x41e841    edi=1;
   *                         throw_PCNullPointerException(true) @stub 0x6dd290
   *   @0x41e846–0x41e849  rdi = this[+0x10]      (reload after nothrow reload)
   *   @0x41e84d–0x41e853  rax = *(void**)rdi;
   *                       ok  = (*(fn)(rax+0x18))(source, agent, rect)
   *                             — chained virtual getBoundary(rect)
   *   @0x41e856–0x41e858  if (!ok) return;       (no writes)
   *   @0x41e85a–0x41e867  if (rect->w <= 0.0) return;     (`0x10(%rbx)` = w)
   *   @0x41e869–0x41e872  if (rect->h <= 0.0) return;     (`0x18(%rbx)` = h)
   *
   *   Then the clip-into-crop path (@0x41e874–0x41e8a0):
   *     xmm2 = (rect->x, rect->y)                 // movupd (%rbx)
   *     xmm3 = (crop.x , crop.y )                 // movupd 0x28(%r14)
   *     xmm4 = (crop.w , crop.h )                 // movupd 0x38(%r14)
   *     xmm4 = xmm4 + xmm3                        // crop.br = crop.origin+size
   *     xmm3 = maxpd(xmm3, xmm2)                  // clipped origin = max(rect.o,crop.o)
   *     xmm0 = (rect->w, rect->h)                 // unpcklpd rect_w,rect_h
   *     xmm0 = xmm0 + xmm2                        // rect.br  = rect.origin + size
   *     xmm4 = minpd(xmm4, xmm0)                  // clipped br     = min(crop.br,rect.br)
   *     xmm4 = xmm4 - xmm3                        // clipped size   = clip_br - clip_o
   *     *rect         = xmm3                      // movupd rect+0x00
   *     *(rect+0x10)  = xmm4                      // movupd rect+0x10
   *
   * The chained-source call's `%al` is treated as a boolean by `testb %al, %al`,
   * so we surface the SOURCE vtable-slot as `boolean`.  All doubles are IEEE
   * 754 f64 by the movsd/ucomisd/pd operands — TypeScript's Number is exactly
   * that; no `Math.fround` narrowing here.
   *
   * NaN semantics: `ja` (unordered-and-above) branch after `ucomisd` treats
   * `NaN`s as taking the fall-through (early-return path).  This is because
   * `0 ja rect.w` is FALSE for NaN, so a NaN w/h passes the >0 gate and would
   * feed into the max/min clip.  We mirror that literally (`0.0 > rect.w`).
   */
  getBoundary(agent: LiAgent, rect: PCRectD): void {
    // @0x41e830 rdi = this[+0x10]
    let src = this.source;
    // @0x41e834–0x41e837 testq/jne
    if (src === null) {
      // @0x41e839–0x41e841 throw_PCNullPointerException(true)
      throw_PCNullPointerException(true);
      // (never returns; reload path @0x41e846–0x41e849 is dead code after
      // the C++ exception unwinds — but the compiled body models it as an
      // EH-safe reload of this[+0x10].)
      src = this.source; // pro-forma; unreachable
    }
    // @0x41e84d–0x41e853 rax = *(void**)src; ok = (*(rax+0x18))(src, agent, rect)
    const ok: boolean = (src as LiImageSource).vptr.getBoundary(rect);
    // @0x41e856–0x41e858 if (!ok) return;
    if (!ok) return;

    // @0x41e85a–0x41e867 `xorpd %xmm2,%xmm2 ; ucomisd %xmm0,%xmm2 ; ja …`
    // xmm0 = rect->w (from 0x10(%rbx)).  `ja` on `ucomisd 0, w` = "0 > w unordered",
    // so we early-return when 0.0 > w (which for NaN is FALSE — NaNs continue).
    if (0.0 > rect.w) return;
    // @0x41e869–0x41e872 same for rect->h @0x18(%rbx).
    if (0.0 > rect.h) return;

    // @0x41e874–0x41e8a0 clip: rect := intersect(rect, crop)
    const rx = rect.x;
    const ry = rect.y;
    const rw = rect.w;
    const rh = rect.h;
    const cx = this.crop.x;
    const cy = this.crop.y;
    const cw = this.crop.w;
    const ch = this.crop.h;
    // xmm4 = crop.br  (crop.origin + crop.size)
    const cbrx = cx + cw;
    const cbry = cy + ch;
    // xmm3 = maxpd(crop.origin, rect.origin)
    const clipOx = cx > rx ? cx : rx;
    const clipOy = cy > ry ? cy : ry;
    // xmm0 = rect.br  (rect.origin + rect.size)
    const rbrx = rx + rw;
    const rbry = ry + rh;
    // xmm4 = minpd(crop.br, rect.br)
    const clipBrX = cbrx < rbrx ? cbrx : rbrx;
    const clipBrY = cbry < rbry ? cbry : rbry;
    // xmm4 = xmm4 - xmm3
    const clipW = clipBrX - clipOx;
    const clipH = clipBrY - clipOy;
    // *rect        = xmm3    (new origin)
    // *(rect+0x10) = xmm4    (new size)
    rect.x = clipOx;
    rect.y = clipOy;
    rect.w = clipW;
    rect.h = clipH;
  }

  /**
   * OZCrop::getHelium(LiAgent&) — @0x41e8b0.
   *
   * Sret-returning function: rdi = sret (Helium handle storage, ≥ 8 bytes),
   * rsi = this, rdx = &agent.  The body is ~180 asm lines and mixes:
   *   - a >0 gate on `agent[+0x38]`/`agent[+0x40]` (source dimensions)
   *     @0x41e8c3–0x41e8e2 — early-return writes `*sret = 0` @0x41ea48
   *   - construction of a PCRect<double> from an 8×16-byte PCMatrix44Tmpl<d>
   *     dumped at `agent[+0xa0]` (@0x41e90c–0x41e972)
   *   - a call to `PCMatrix44Tmpl<double>::transformRect<double>(rect, out) const`
   *     @0x41e97d  — Ozone-local; unported
   *   - `roundpd $0x9` (floor toward -∞) and `roundpd $0xa` (ceil toward +∞)
   *     @0x41e99b / @0x41e9aa, followed by `cvttpd2dq` to produce a PCRect<i32>
   *     origin/size pair on the stack @-0x90/-0x80/-0x30(%rbp).
   *   - the two RIP-relative xmm constants (both `(1e-7, 1e-7)`) at Ozone
   *     0x706e60 and Ozone 0x7053c0 — added before the round/trunc to widen
   *     the destination rect by 1e-7 (numerical-slop guard) — verified via
   *     `resolve.py Ozone const 0x706e20 → 1e-7`, `0x7053c0 → -1.0` (wait: the
   *     -0x60(%rbp) init reads a full xmm which is 2 doubles — the pair at
   *     0x7053c0/0x7053c8 is (-1.0, 1e-7)); the two ROI-branch adds use these.
   *   - if `agent.haveROI()` → `agent.getROI()` yields an sret PCRect<int>
   *     intersected with the destination rect (pmaxsd/pminsd/paddd/psubd
   *     @0x41ea1e–0x41ea39) then written back to `-0x30(%rbp)`.
   *   - `agent[+0x20] = 1` @0x41ea78 — flip an agent-side flag.
   *   - `agent.setInputROI(&rect)` @0x41ea73, then
   *     `LiAgent::getHelium(this[+0x10])` @0x41ea8a which stores its result
   *     into `*sret` (via rbx = rdi from entry).
   *   - a second clip pass on `-0x50(%rbp)` (LiAgent::getBoundary() sret)
   *     against `this[+0x28..+0x40]` — same maxpd/minpd/subpd pattern as
   *     getBoundary above (@0x41eab5–0x41eae3).
   *   - LiImagePolygon copy from `LiAgent::getCrop()` @0x41eaeb–0x41eafa,
   *     then either `liTransformAndClip(rect, invPixelTransform, poly)` or
   *     `LiImagePolygon::set(rect, EdgeType::0)` + `agent.projectAndClipPolygon(
   *     poly, 1e-7)` depending on whether the polygon's vertex list is
   *     empty (frame count from `(-0xc8(%rbp) - -0xd0(%rbp)) >> 5`).
   *   - `agent.outCrop(poly)` @0x41eb74, then `poly.~LiImagePolygon()`.
   *
   * Every step above depends on unported frontier callees on LiAgent /
   * PCMatrix44Tmpl / LiImagePolygon.  The visible sret behavior when
   * dims<=0 is `*sret = nullptr` @0x41ea48 — a "no Helium available"
   * outcome.  Any other path requires unported code to run, so we surface
   * the dim-gate literally and raise on the frontier path.
   *
   * We return `{ pointer: null }` for the dim<=0 path (matches
   * OZLiHePixelTransformFixer::getHelium's shape) and throw for the main
   * body until the frontier lands.
   */
  getHelium(agent: LiAgent): { pointer: null } {
    // @0x41e8c3 xmm1 = *(double*)(agent + 0x38)  (source width)
    // @0x41e8c8 xmm0 = 0.0                       (xorpd)
    // @0x41e8cc–0x41e8d0 ucomisd + jbe → early-return if !(w > 0)
    const w = (agent as { [k: string]: unknown })["_38"] as number | undefined;
    // @0x41e8d9 xmm1 = *(double*)(agent + 0x40)  (source height)
    // @0x41e8de–0x41e8e2 same gate on h
    const h = (agent as { [k: string]: unknown })["_40"] as number | undefined;
    if (
      typeof w !== "number" ||
      typeof h !== "number" ||
      !(w > 0.0) ||
      !(h > 0.0)
    ) {
      // @0x41ea48 *sret = 0
      return { pointer: null };
    }
    // @0x41e8e8–0x41eb85 — the full main body requires the frontier callees
    // enumerated in the header.  We raise until PCMatrix44Tmpl::transformRect,
    // LiAgent::{haveROI,getROI,setInputROI,getHelium,getBoundary,getCrop,
    // getInversePixelTransform,projectAndClipPolygon,outCrop},
    // LiImagePolygon::{ctor,dtor,set}, liTransformAndClip land.
    throw new Error(
      "OZCrop::getHelium: main path requires unported frontier callees " +
        "(PCMatrix44Tmpl::transformRect @0x41e97d, LiAgent::* stubs @0x6df960/" +
        "0x6df954/0x6deb62/0x6debb0/0x6deb5c/0x6df95a/0x6df924/0x6deb86/" +
        "0x6deba4, LiImagePolygon::* stubs @0x6ddc26/0x6ddc32/0x6ddc1a, " +
        "liTransformAndClip @0x6dd170). @0x41e8b0",
    );
  }

  /**
   * OZCrop::estimateRenderMemory(std::set<PCHash128,...>&) — @0x41ebd0.
   *
   * Full body (5 insns):
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp   __ZN13LiImageFilter20estimateRenderMemoryE… @0x6dd824
   *
   * i.e. a plain tail-call to `LiImageFilter::estimateRenderMemory(set&)` on
   * the same `this` — no override behavior at all.  The base version is
   * unported, so we raise; the visible contract on `set` is opaque.
   */
  estimateRenderMemory(_set: PCHash128Set): number {
    // @0x41ebd5 tail-call to LiImageFilter::estimateRenderMemory @stub 0x6dd824
    throw new Error(
      "OZCrop::estimateRenderMemory: tail-calls LiImageFilter::" +
        "estimateRenderMemory @stub Ozone 0x6dd824 (unported). @0x41ebd0",
    );
  }

  /**
   * OZCrop::pixelTransformSupport(LiRenderParameters const&) — @0x41ecc0.
   *
   * Full body verbatim (4 insns):
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   movl  $0x6, %eax          @0x41ecc4
   *   popq  %rbp
   *   retq
   *
   * Returns the constant `6` regardless of its LiRenderParameters& argument.
   * (Cf. OZLiHePixelTransformFixer whose analogous method returns a runtime
   * u32 read from this+0x0c, and OZLiSegmentationFilter which hard-codes 5.)
   * The `6` is the enum tag in the LiImageFilter::PixelTransformSupport
   * hierarchy specific to a crop-style filter — its symbolic meaning is
   * fixed by the unported enum but the return here is a hard, verbatim 6.
   */
  static pixelTransformSupport(_params: LiRenderParameters): number {
    // @0x41ecc4 movl $0x6, %eax
    return 6;
  }

  /**
   * OZCrop::~OZCrop() [D1 non-deleting] — @0x41ebe0.
   *
   * Body reconstruction (raw x86_64 lines):
   *   @0x41ebe9  this[+0x00] = Ozone `0x442768(%rip)`          (primary vptr)
   *   @0x41ebf3  this[+0x48] = Ozone `0x442846(%rip)`          (secondary vptr)
   *   @0x41ec02  PCSharedCount::~PCSharedCount(this+0x18)     @stub 0x6ddaee
   *   @0x41ec11  LiImageSource::~LiImageSource() [D2](this)   @stub 0x6dd842
   *   @0x41ec16  this[+0x48] = &__ZTV13PCShared_base + 0x10
   *   @0x41ec25–0x41ec2e  if (this[+0x50]) PC_Sp_counted_base::weak_release
   *                                                          @stub 0x6de4fc
   *
   * Two vptr installs before running the base dtor: the compiler emits this
   * pattern so that virtual dispatch from within base dtors resolves to the
   * derived-class slots (Itanium ABI 5.1.4).  We surface it as vptr
   * reassignments through opaque handles, and forward to the frontier stubs.
   */
  dtorD1(): void {
    // @0x41ebe9 vptr_primary   := Ozone::__ZTV6OZCrop + 0x10  (const-load slot)
    // @0x41ebf3 vptr_secondary := Ozone::__ZTV6OZCrop + <MI-secondary offset>
    // (Both are Ozone-local vtable-pointer const-loads; unported.)
    // @0x41ec02 PCSharedCount::~PCSharedCount(this+0x18) — unported
    // @0x41ec11 LiImageSource::~LiImageSource() (this) — unported
    // @0x41ec16 vptr_secondary := &__ZTV13PCShared_base + 0x10
    // @0x41ec25-@0x41ec2e weak_release on this+0x50 if non-null — unported
    throw new Error(
      "OZCrop::~OZCrop [D1]: PCSharedCount::~PCSharedCount @stub 0x6ddaee, " +
        "LiImageSource::~LiImageSource @stub 0x6dd842, and " +
        "PC_Sp_counted_base::weak_release @stub 0x6de4fc are unported. " +
        "@0x41ebe0",
    );
  }

  /**
   * OZCrop::~OZCrop() [D0 deleting] — @0x41ec50.
   *
   * Identical to D1 (same vptr installs, same PCSharedCount + LiImageSource
   * dtor calls, same weak_release path) followed by:
   *   @0x41ecac  jmp `operator delete(void*)` @stub 0x6dfc36
   * so the tail-call frees the allocation.  All frontier callees unported.
   */
  dtorD0(): void {
    // @0x41ec59 vptr_primary  install (Ozone::__ZTV6OZCrop + 0x10)
    // @0x41ec63 vptr_secondary install
    // @0x41ec72 PCSharedCount::~PCSharedCount(this+0x18) — @stub 0x6ddaee
    // @0x41ec81 LiImageSource::~LiImageSource(this)      — @stub 0x6dd842
    // @0x41ec86 vptr_secondary := &__ZTV13PCShared_base + 0x10
    // @0x41ec95-@0x41ec9e weak_release on this+0x50 if non-null — @stub 0x6de4fc
    // @0x41ecac jmp operator delete(this)                — @stub 0x6dfc36
    throw new Error(
      "OZCrop::~OZCrop [D0]: same as D1 plus tail-call to operator delete " +
        "@stub 0x6dfc36; all frontier callees unported. @0x41ec50",
    );
  }
}
