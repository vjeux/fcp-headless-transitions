// OZLiSegmentationFilter.ts — Ozone segmentation filter (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice)
//
// Symbols ported:
//   * OZLiSegmentationFilter::OZLiSegmentationFilter(
//         OZImageMask*, OZRenderParams const&)                 @0x4242a0
//   * OZLiSegmentationFilter::pixelTransformSupport(
//         LiRenderParameters const&)                            @0x424360
//   * OZLiSegmentationFilter::estimateRenderMemory(
//         std::set<PCHash128,std::less<PCHash128>,std::allocator<PCHash128>>&)
//                                                               @0x424370
//   * OZLiSegmentationFilter::~OZLiSegmentationFilter() [D1]   @0x6dbae0
//   * OZLiSegmentationFilter::~OZLiSegmentationFilter() [D0]   @0x6dbaf0
//
// -----------------------------------------------------------------------------
// SHAPE — object layout (derived from the C2 body @0x4242a0)
// -----------------------------------------------------------------------------
//   0x00  vptr_primary        — LiImageFilter subobject vtable (installed
//                               finally @0x4242fc from mask[+0x00]).
//   0x08  vptr_secondary      — LiImageSource subobject vtable, installed
//                               via RTTI-offset (Itanium MI thunk) from
//                               mask[+0x08], with offset from -0x18(vtbl).
//                               This class multi-inherits: LiImageFilter
//                               primary + LiImageSource secondary.
//   0x10  u64  someRefPtr = 0 (stored @0x4242db).  Nominally a `void*`
//                               shared-count target; matches LiImageSource
//                               layout convention (see LiImageSource.ts).
//   0x18  PCSharedCount       — 8 bytes, constructed via PCSharedCount::C1
//                               (default) @0x4242e7.
//   0x20  u32  smallField = 0 (stored @0x4242f1, 32-bit `$0x0`).  Likely a
//                               state/status flag; unused in the ctor body.
//   0x28  u64  ozImageMaskRefOrTag  = r15 (rdx at entry) @0x42430c.  See note
//                               below re: arg mapping.
//   0x30  OZRenderParams      — copy-constructed in-place @0x424317 from the
//                               `OZRenderParams const&` reference in %r14.
//
// -----------------------------------------------------------------------------
// ARG-MAPPING NOTE
// -----------------------------------------------------------------------------
// The mangled name declares the signature as
//     (OZLiSegmentationFilter*, OZImageMask*, OZRenderParams const&)
// i.e. rdi=this, rsi=mask, rdx=params.  But the compiled body at 0x4242a0
// stashes the incoming registers as
//     r14 = rcx    (used as `OZRenderParams&` for the copy ctor call @0x424317)
//     r15 = rdx    (stored raw at this+0x28 @0x42430c)
//     r12 = rsi    (the OZImageMask*)
//     rbx = rdi    (this)
// so an extra hidden 4th argument (rcx) is the OZRenderParams reference, and
// the mangled-name rdx slot instead holds some `void*`-sized tag / secondary
// pointer stashed at this+0x28.  This is either:
//   (a) a build-time signature drift from a private overload the demangler
//       can't see (extra param inserted before the params reference), or
//   (b) an ABI thunk that shifted args by one.
// Either way, the OZRenderParams copy-ctor DOES consume %r14 (rcx), not %rdx.
// We faithfully replicate that mapping and expose 3 args in TS (mask, extraTag,
// params) to match the actual register usage — call sites will need updating
// once we see one.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all unported)
// -----------------------------------------------------------------------------
//   * LiImageSource::LiImageSource()          @stub Ozone 0x6dd83c
//   * PCSharedCount::PCSharedCount()          @stub Ozone 0x6ddae8
//   * OZRenderParams::OZRenderParams(
//         OZRenderParams const&)              @0x4243 (in-binary call target)
//   * LiImageFilter::~LiImageFilter()         cleanup only @0x424334
//   * LiImageSource::~LiImageSource()         cleanup only @0x42434a
//   * __Unwind_Resume                          @stub Ozone 0x6dd07a
//
// -----------------------------------------------------------------------------
// pixelTransformSupport(...) @0x424360
// -----------------------------------------------------------------------------
// Body (4 insns): `movl $0x5, %eax; retq`.  Returns the constant `5` regardless
// of its LiRenderParameters& argument.  The `5` is the enum value in the
// LiImageFilter::PixelTransformSupport hierarchy — its meaning is fixed by the
// unported enum but the return here is a hard, verbatim `5`.
//
// -----------------------------------------------------------------------------
// estimateRenderMemory(std::set<PCHash128>&) @0x424370
// -----------------------------------------------------------------------------
// Body (3 insns): `xorl %eax, %eax; retq`.  Returns 0 (size_t / uint64_t)
// unconditionally.  The set argument is untouched.
//
// -----------------------------------------------------------------------------
// ~OZLiSegmentationFilter (D1 @0x6dbae0, D0 @0x6dbaf0)
// -----------------------------------------------------------------------------
// Both bodies are `pushq %rbp; movq %rsp, %rbp; ud2` — the compiler emitted
// unreachable traps rather than real destructor code.  The `ud2` instruction
// crashes with SIGILL when executed.  Two thunk variants also exist
// (`__ZTv0_n24_N22OZLiSegmentationFilterD1Ev` @0x6dbb00 and
//  `...D0Ev` @0x6dbb10) — same shape.  This class is presumably never actually
// deleted through its vtable in shipping FCP paths, so the compiler LTO'd the
// dtor to a trap.

/** Opaque OZImageMask handle — the class isn't yet transcribed. */
export type OZImageMask = object;

/** Opaque OZRenderParams handle — copy-constructed at ctor time; the class
 *  isn't yet transcribed. */
export type OZRenderParams = object;

/** Opaque LiRenderParameters handle — the pixelTransformSupport() arg is
 *  never read, so the shape doesn't matter here. */
export type LiRenderParameters = object;

/** Opaque std::set<PCHash128> handle — estimateRenderMemory's arg is never
 *  read either. */
export type PCHash128Set = object;

export class OZLiSegmentationFilter {
  /** Primary vtable pointer @+0x00 (LiImageFilter subobject).
   *  Installed at @0x4242fc from `mask[+0x00]`. */
  vptrPrimary: unknown = null;

  /** Secondary vtable pointer @+0x08 (LiImageSource subobject).
   *  Installed at @0x4242cb / @0x4242d7 with the standard Itanium-ABI
   *  MI RTTI-offset thunk read from `mask[+0x30]` biased by `-0x18(vtbl)`. */
  vptrSecondary: unknown = null;

  /** @+0x10 — nominally a raw shared-count target; zeroed at @0x4242db. */
  someRefPtr: unknown = null;

  /** @+0x18 — PCSharedCount, default-constructed @0x4242e7.
   *  Modeled as an opaque tag object; the real PCSharedCount ctor is unported. */
  sharedCount: unknown = null;

  /** @+0x20 — u32 status flag, zeroed at @0x4242f1. */
  smallField: number = 0;

  /** @+0x28 — extraTag / secondary handle, raw-stored at @0x42430c
   *  (see ARG-MAPPING NOTE). */
  extraTag: unknown = null;

  /** @+0x30 — copy of the caller's OZRenderParams, in-place ctor'd @0x424317. */
  params: OZRenderParams | null = null;

  /**
   * OZLiSegmentationFilter::OZLiSegmentationFilter(
   *     OZImageMask*, OZRenderParams const&)   — @0x4242a0
   *
   * See ARG-MAPPING NOTE — the actual body reads 4 arg slots (rdi/rsi/rdx/rcx)
   * even though the demangled signature only lists 3, so we surface the extra
   * `extraTag` (rdx) here.  `params` is what winds up as `OZRenderParams const&`
   * inside the copy-constructor call.
   *
   * Body reconstruction:
   *   @0x4242c1  LiImageSource::LiImageSource()   [rdi=this]  — unported stub
   *   @0x4242cb  this[+0x00]  = mask[+0x08]                    (secondary vptr)
   *   @0x4242d7  this[+off]   = mask[+0x30]  (off = -0x18(vtbl))(MI-thunk RTTI)
   *   @0x4242db  this[+0x10]  = 0
   *   @0x4242e7  PCSharedCount::PCSharedCount(&this[+0x18])    — unported stub
   *   @0x4242f1  this[+0x20]  = 0    (u32)
   *   @0x4242fc  this[+0x00]  = mask[+0x00]                    (primary vptr)
   *   @0x424308  this[+off]   = mask[+0x38]  (off = -0x18(vtbl))(2nd MI thunk)
   *   @0x42430c  this[+0x28]  = extraTag  (rdx at entry)
   *   @0x424317  OZRenderParams::OZRenderParams(&this[+0x30], params) — unported
   *
   * Exception paths (@0x42432b, @0x424341) run LiImageFilter::~LiImageFilter()
   * / LiImageSource::~LiImageSource() then __Unwind_Resume.
   *
   * Every callee is unported; the whole body raises until they land.
   */
  constructor(
    _mask: OZImageMask | null,
    _extraTag: unknown,
    _params: OZRenderParams,
  ) {
    // @0x4242c1 LiImageSource::LiImageSource() — unported
    // @0x4242cb-0x4242d7 install secondary vptr + MI-thunk RTTI offset
    // @0x4242db this[+0x10] = 0
    // @0x4242e7 PCSharedCount::PCSharedCount() — unported
    // @0x4242f1 this[+0x20] = 0 (u32)
    // @0x4242fc-0x424308 install primary vptr + second MI-thunk
    // @0x42430c this[+0x28] = extraTag
    // @0x424317 OZRenderParams::OZRenderParams(OZRenderParams const&) — unported
    // Base-class ctors + copy-ctor unresolved — raise. @0x4242a0
    throw new Error(
      "OZLiSegmentationFilter::OZLiSegmentationFilter: requires " +
        "LiImageSource::LiImageSource() + PCSharedCount::PCSharedCount() + " +
        "OZRenderParams::OZRenderParams(const&) + MI vtable installs — none " +
        "ported. @0x4242a0",
    );
  }

  /**
   * OZLiSegmentationFilter::pixelTransformSupport(LiRenderParameters const&)
   *   — @0x424360.
   *
   * Body verbatim (4 insns):
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   movl  $0x5, %eax          @0x424364
   *   popq  %rbp
   *   retq
   *
   * Returns the constant `5` regardless of the LiRenderParameters& arg.
   */
  static pixelTransformSupport(_params: LiRenderParameters): number {
    // @0x424364: movl $0x5, %eax
    return 5;
  }

  /**
   * OZLiSegmentationFilter::estimateRenderMemory(std::set<PCHash128>&)
   *   — @0x424370.
   *
   * Body verbatim (3 insns):
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   xorl  %eax, %eax          @0x424374
   *   popq  %rbp
   *   retq
   *
   * Returns 0 unconditionally; the set argument is untouched (not iterated,
   * not inserted-into).
   */
  static estimateRenderMemory(_hashes: PCHash128Set): number {
    // @0x424374: xorl %eax, %eax
    return 0;
  }

  /**
   * OZLiSegmentationFilter::~OZLiSegmentationFilter()  [D1 base dtor]
   *   — @0x6dbae0.
   *
   * Body verbatim (2 insns before the trap):
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   ud2                       @0x6dbae4
   *
   * The compiler emitted an UNREACHABLE trap — this class is never destroyed
   * through the normal dtor path in shipping code (likely because it always
   * lives inside a smart-pointer whose deleter LTO'd out to the trap variant
   * @0x6dbaf0).  Any actual call to this dtor SIGILLs in the original binary.
   */
  static destroy_D1(_self: OZLiSegmentationFilter): void {
    // @0x6dbae4: ud2 — hardware-raised SIGILL in the original binary.
    // We surface the same fatal signal in TS: this dtor is unreachable.
    // @0x6dbae0
    throw new Error(
      "OZLiSegmentationFilter::~OZLiSegmentationFilter [D1]: ud2 trap in " +
        "the original binary — this dtor is compiled unreachable. @0x6dbae0",
    );
  }

  /**
   * OZLiSegmentationFilter::~OZLiSegmentationFilter()  [D0 deleting dtor]
   *   — @0x6dbaf0.
   *
   * Same body as D1 — an unconditional `ud2` trap.  D0 is the deleting-dtor
   * variant (calls `operator delete` after the base dtor), but it too was
   * folded into an unreachable trap by the compiler.
   */
  static destroy_D0(_self: OZLiSegmentationFilter): void {
    // @0x6dbaf4: ud2 — hardware SIGILL.
    // @0x6dbaf0
    throw new Error(
      "OZLiSegmentationFilter::~OZLiSegmentationFilter [D0]: ud2 trap in " +
        "the original binary — this dtor is compiled unreachable. @0x6dbaf0",
    );
  }
}
