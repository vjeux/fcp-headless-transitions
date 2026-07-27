// PMFormatDescription.ts — FCP Ozone framework's PMFormatDescription class.
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
// Versions/A/Ozone (see raw-port/re/disasm/PMFormatDescription.*.s).
//
// Symbols (from nm | c++filt):
//   0x398ac0 t PMFormatDescription::PMFormatDescription()   (C2 base ctor)
//   0x398db0 t PMFormatDescription::~PMFormatDescription()  (D2 base dtor)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/PMFormatDescription.PMFormatDescription.s
//   raw-port/re/disasm/PMFormatDescription.~PMFormatDescription.s
//   stub table entries (from resolve.py Ozone stub <addr>):
//     0x6dfcba ___bzero
//     0x6df0c0 __ZN8PCStringC1Ev                  (PCString::PCString())
//     0x6df0c6 __ZN8PCStringD1Ev                  (PCString::~PCString())
//     0x6df522 __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
//     0x6dda9a __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
//     0x6dfc36 __ZdlPv                            (operator delete)
//     0x6dd07a __Unwind_Resume
//   RIP-relative data (from resolve.py Ozone const):
//     0x708008 double 44100.0     (audio sample rate default, seen at 0x398cb5)
//   RIP-relative externs (literal pool symbol addresses):
//     _kCMTimeInvalid  (loaded @0x398ad8 into %r15, splashed into both CMTime fields)
//     _kCMTimeZero     (loaded @0x398c83 into %rax, splashed into the 3rd CMTime field)
//   Nested class dtors invoked in the ctor's exception-unwind path only:
//     0x398d05 __ZN22PMCinematicDescriptionD1Ev   (~PMCinematicDescription, rdi = this+0x1f8)
//     0x398d11 __ZN18PMVideoDescriptionD1Ev       (~PMVideoDescription,     rdi = this+0x8)
//   -> The C2 ctor of PMFormatDescription is fully inlined: it does NOT
//      call ::PMVideoDescription() or ::PMCinematicDescription() as
//      separate `callq`s.  It instead zeros / initialises every field
//      of both subobjects in-line.  The base-class dtors appear only in
//      the exception cleanup path (invoked on partial construction).
//
// ── STRUCT LAYOUT (recovered from the two functions above) ─────────────────
//   The class has TWO base subobjects and NO direct data members of its own.
//   The unwind sequence `addq $0x8,%rbx; call ~PMVideoDescription` and
//   `leaq 0x1f8(%rbx),%r14; call ~PMCinematicDescription` tell us:
//
//     +0x000       PMFormatDescription vtable pointer  (8 bytes — implicit; the
//                  ctor never writes it because C2 is called by C1, which will
//                  install the vtable AFTER C2 returns per Itanium C++ ABI).
//     +0x008..+0x1f7   PMVideoDescription   (base subobject, 0x1f0 bytes)
//     +0x1f8..+0x487   PMCinematicDescription (base subobject, 0x290 bytes)
//
//   Total size: 0x488 bytes.  All fields decoded here are inside those two
//   subobjects; the class itself introduces no members.
//
//   Field-by-field (offsets are absolute this-relative; type inferred from
//   the write width and the runtime called on the slot in the dtor):
//
//     PMVideoDescription @ this+0x8..this+0x1f7:
//       [0x000..0x127]   0x128 bytes bzero'd  (mixed POD scratch — not further decoded)
//       +0x128 CMTime       kCMTimeInvalid  (movups+movq of _kCMTimeInvalid contents)
//       +0x140 CMTime       kCMTimeInvalid  (movups+movq of _kCMTimeInvalid contents)
//       +0x158 uint64_t     0
//       +0x160 uint32_t     0
//       +0x168 uint64_t     0
//       +0x170 uint32_t     0
//       +0x178 __m128       0    (xorps xmm0,xmm0; movups xmm0, 0x178)
//       +0x188 __m128       0
//       +0x198 uint8_t      0
//       +0x1a0 __m128       0
//       +0x1a9 __m128       0    (unaligned 16-byte splash starting at 0x1a9)
//       +0x1bc __m128       0    (unaligned)
//       +0x1d0 uint64_t     0
//       +0x1d8 PCString                            (embedded; PCString::PCString())
//       +0x1e0 uint64_t     0
//       +0x1e8 uint32_t     0
//       +0x1f0 CGColorSpaceRef?   0  (bzero'd inside the 0x138 second-bzero
//                                     region; only released via
//                                     PCCFRefTraits<CGColorSpace*>::release
//                                     if non-null in dtor — see @0x398e59)
//       +0x1f8 PCNSRefImpl   (released via PCNSRefImpl::release() in dtor @0x398e48)
//       +0x200 PCNSRefImpl   (released via PCNSRefImpl::release() in dtor @0x398e3c)
//
//     PMCinematicDescription @ this+0x1f8..this+0x487:
//       -- NOTE: the second bzero at 0x398ba1 writes 0x138 bytes starting at
//       this+0x1f0, so it overlaps the *tail* of PMVideoDescription and the
//       *head* of PMCinematicDescription.  Whether the two PCNSRefImpl slots
//       at +0x1f8/+0x200 belong to Video or Cinematic is ambiguous from this
//       code alone — the dtor at @0x398e35 releases them just before the
//       final "addq $0x1d8" that leaves rdi at the Video subobject for its
//       PCString tail dtor, so they logically sit at the Video/Cinematic
//       boundary.  Marking them here without picking a side.
//
//       +0x328 CMTime       kCMTimeInvalid  (movups+movq splashed here too)
//       +0x340 CMTime       kCMTimeInvalid
//       +0x358 uint64_t     0
//       +0x360 uint32_t     0
//       +0x368 uint64_t     0
//       +0x370 uint32_t     0
//       +0x378 __m128       0
//       +0x388 __m128       0
//       +0x398 uint8_t      0
//       +0x3a0 __m128       0
//       +0x3a9 __m128       0
//       +0x3bc __m128       0
//       +0x3d0 uint64_t     0
//       +0x3d8 PCString     (embedded)
//       +0x3e0 uint64_t     0
//       +0x3e8 uint32_t     0
//       +0x3f0 CGColorSpaceRef?  0   (released in dtor @0x398e24 if non-null)
//       +0x3f8 uint64_t     0
//       +0x400 uint64_t     0
//       +0x408 PCString     (embedded — 3rd PCString ctor'd)
//       +0x410 __m128       0
//       +0x420 CMTime       kCMTimeZero  (loaded via _kCMTimeZero @0x398c83)
//       +0x438 uint32_t     0
//       +0x440 PCString     (embedded — 4th PCString ctor'd)
//       +0x448 double       44100.0     (audio sample rate; movsd of _708008)
//       +0x450 uint64_t     0           (upper half of the movups xmm0 store at 0x398cbd)
//       +0x458 uint32_t     0
//       +0x460 T*           null   (heap array head; used by dtor loop @0x398dd1..0x398dff)
//       +0x468 T*           null   (heap array end;  bounded release loop uses -0x10 stride
//                                   -> element size is 0x10 bytes.  In dtor each element is
//                                   destroyed with PCString::~PCString, so the array is
//                                   PCString[] and 0x10 = sizeof(PCString) tail-padded).
//                                   Actually PCString itself is 8 bytes (just a CFStringRef);
//                                   but the destructor stride is 0x10, so each element is
//                                   PCString + 8 bytes of trailing data (a wrapper struct).
//       +0x470 T*           null   (heap array capacity end — not touched by dtor)
//       +0x480 uint32_t     0
//
// ── PORTING NOTE ──────────────────────────────────────────────────────────
// The base classes PMVideoDescription and PMCinematicDescription are not
// yet transcribed in this repo; their public methods (isOK() etc.) are
// therefore undecoded.  This file transcribes ONLY what @0x398ac0 and
// @0x398db0 do: allocate + zero-initialise + install kCMTimeInvalid/
// kCMTimeZero into the CMTime slots + construct the 4 embedded PCStrings
// + populate the 44100.0 sample-rate slot; and mirror-order-release the
// same subobjects on destruction.  Any behaviour beyond that (accessors,
// isOK, format setters, decoder ingestion) is a THROWING stub citing
// its @0xADDR — the correct signal that those functions need decoding.

import { PCString } from "../infra/PCString.js";
import type { CMTime } from "../infra/CMTime.js";
import { kCMTimeZero } from "../infra/CMTime.js";

// ── kCMTimeInvalid (CoreMedia CMTime.h) ────────────────────────────────
// CM_EXPORT const CMTime kCMTimeInvalid = { .value=0, .timescale=0,
//                                           .flags=0, .epoch=0 };
// The "flags=0" is what distinguishes it from kCMTimeZero (whose flags
// includes kCMTimeFlags_Valid).  Loaded from _kCMTimeInvalid via the
// literal pool @0x398ad8 (RIP+0x48ba11) inside Ozone.
// @const CoreMedia CMTime.h  (public API)
const kCMTimeInvalid: CMTime = {
  value:     0n,
  timescale: 0,
  flags:     0,
  epoch:     0n,
};

/**
 * PMFormatDescription — composite media format descriptor.
 *
 * Inherits from PMVideoDescription (this+0x8) and PMCinematicDescription
 * (this+0x1f8).  Total instance size: 0x488 bytes.  See the STRUCT LAYOUT
 * block at the top of this file for the field-by-field decode.
 *
 * The port models the two base subobjects inline as fields of this class,
 * since neither PMVideoDescription nor PMCinematicDescription has been
 * transcribed yet.  Everything the C2 ctor / D2 dtor actually TOUCHES is
 * decoded here; anything else lives in a throwing stub.
 *
 * @class Ozone PMFormatDescription
 * @provenance Ozone @0x398ac0 (ctor), Ozone @0x398db0 (dtor)
 */
export class PMFormatDescription {
  // ── PMVideoDescription subobject (this+0x8..this+0x1f7) ─────────────
  /** +0x128 CMTime, initialised to kCMTimeInvalid @0x398adf..0x398ae3. */
  video_time0: CMTime = { ...kCMTimeInvalid };
  /** +0x140 CMTime, initialised to kCMTimeInvalid @0x398aea..0x398b04. */
  video_time1: CMTime = { ...kCMTimeInvalid };
  /** +0x158 uint64_t zero (@0x398b0b). */
  video_u64_158: bigint = 0n;
  /** +0x160 uint32_t zero (@0x398b16). */
  video_u32_160: number = 0;
  /** +0x168 uint64_t zero (@0x398b20). */
  video_u64_168: bigint = 0n;
  /** +0x170 uint32_t zero (@0x398b2b). */
  video_u32_170: number = 0;
  /** +0x178 __m128 zero (@0x398b43). */
  video_xmm_178: Uint8Array = new Uint8Array(16);
  /** +0x188 __m128 zero (@0x398b4a). */
  video_xmm_188: Uint8Array = new Uint8Array(16);
  /** +0x198 uint8_t zero (@0x398b51). */
  video_u8_198: number = 0;
  /** +0x1a0 __m128 zero (@0x398b58). */
  video_xmm_1a0: Uint8Array = new Uint8Array(16);
  /** +0x1a9 __m128 zero (@0x398b5f) — unaligned overlap with 0x1a0 store. */
  video_xmm_1a9: Uint8Array = new Uint8Array(16);
  /** +0x1bc __m128 zero (@0x398b66). */
  video_xmm_1bc: Uint8Array = new Uint8Array(16);
  /** +0x1d0 uint64_t zero (@0x398b35). */
  video_u64_1d0: bigint = 0n;
  /** +0x1d8 PCString (@0x398b74 PCString::PCString()). */
  video_pcstr_1d8: PCString = new PCString();
  /** +0x1e0 uint64_t zero (@0x398b79). */
  video_u64_1e0: bigint = 0n;
  /** +0x1e8 uint32_t zero (@0x398b84). */
  video_u32_1e8: number = 0;
  /** +0x1f0 CGColorSpaceRef opaque, null-initialised via bzero (@0x398b9c-0x398ba1).
   *  Released in dtor @0x398e59 via PCCFRefTraits<CGColorSpace*>::release. */
  video_cgColorSpace_1f0: unknown | null = null;
  /** +0x1f8 PCNSRefImpl slot, zero-initialised (@0x398ba1 within the 0x138 bzero).
   *  Released in dtor @0x398e48 via PCNSRefImpl::release(). */
  video_pcnsref_1f8: unknown | null = null;
  /** +0x200 PCNSRefImpl slot, zero-initialised (@0x398ba1 within the 0x138 bzero).
   *  Released in dtor @0x398e3c via PCNSRefImpl::release(). */
  video_pcnsref_200: unknown | null = null;

  // ── PMCinematicDescription subobject (this+0x1f8..this+0x487) ───────
  /** +0x328 CMTime, initialised to kCMTimeInvalid @0x398ba6..0x398baa. */
  cinem_time0: CMTime = { ...kCMTimeInvalid };
  /** +0x340 CMTime, initialised to kCMTimeInvalid @0x398bbc..0x398bd2. */
  cinem_time1: CMTime = { ...kCMTimeInvalid };
  /** +0x358 uint64_t zero (@0x398bd2). */
  cinem_u64_358: bigint = 0n;
  /** +0x360 uint32_t zero (@0x398bdd). */
  cinem_u32_360: number = 0;
  /** +0x368 uint64_t zero (@0x398be7). */
  cinem_u64_368: bigint = 0n;
  /** +0x370 uint32_t zero (@0x398bf2). */
  cinem_u32_370: number = 0;
  /** +0x378 __m128 zero (@0x398c0a). */
  cinem_xmm_378: Uint8Array = new Uint8Array(16);
  /** +0x388 __m128 zero (@0x398c11). */
  cinem_xmm_388: Uint8Array = new Uint8Array(16);
  /** +0x398 uint8_t zero (@0x398c18). */
  cinem_u8_398: number = 0;
  /** +0x3a0 __m128 zero (@0x398c1f). */
  cinem_xmm_3a0: Uint8Array = new Uint8Array(16);
  /** +0x3a9 __m128 zero (@0x398c26). */
  cinem_xmm_3a9: Uint8Array = new Uint8Array(16);
  /** +0x3bc __m128 zero (@0x398c2d). */
  cinem_xmm_3bc: Uint8Array = new Uint8Array(16);
  /** +0x3d0 uint64_t zero (@0x398bfc). */
  cinem_u64_3d0: bigint = 0n;
  /** +0x3d8 PCString (@0x398c3b PCString::PCString()). */
  cinem_pcstr_3d8: PCString = new PCString();
  /** +0x3e0 uint64_t zero (@0x398c40). */
  cinem_u64_3e0: bigint = 0n;
  /** +0x3e8 uint32_t zero (@0x398c4b). */
  cinem_u32_3e8: number = 0;
  /** +0x3f0 CGColorSpaceRef opaque, null (@0x398c5c-0x398c5f).
   *  Released in dtor @0x398e24 via PCCFRefTraits<CGColorSpace*>::release. */
  cinem_cgColorSpace_3f0: unknown | null = null;
  /** +0x3f8 uint64_t zero (upper half of xmm0 splash @0x398c5f). */
  cinem_u64_3f8: bigint = 0n;
  /** +0x400 uint64_t zero (@0x398c66). */
  cinem_u64_400: bigint = 0n;
  /** +0x408 PCString (@0x398c74 PCString::PCString()). */
  cinem_pcstr_408: PCString = new PCString();
  /** +0x410 __m128 zero (@0x398c7c). */
  cinem_xmm_410: Uint8Array = new Uint8Array(16);
  /** +0x420 CMTime, initialised to kCMTimeZero @0x398c83..0x398c98. */
  cinem_time_420: CMTime = { ...kCMTimeZero };
  /** +0x438 uint32_t zero (@0x398c9f). */
  cinem_u32_438: number = 0;
  /** +0x440 PCString (@0x398cb0 PCString::PCString()). */
  cinem_pcstr_440: PCString = new PCString();
  /** +0x448 double 44100.0 — audio sample rate default (movsd _708008 @0x398cb5). */
  cinem_sampleRate_448: number = 44100.0;
  /** +0x450 uint64_t zero (upper half of movups xmm0, 0x448 @0x398cbd). */
  cinem_u64_450: bigint = 0n;
  /** +0x458 uint32_t zero (@0x398cc4). */
  cinem_u32_458: number = 0;
  /** +0x460 element* — heap array head (@0x398cd1 xmm0 splash zero). */
  cinem_arr_head_460: unknown[] | null = null;
  /** +0x468 element* — heap array size-end (@0x398cd1 xmm0 splash zero). */
  cinem_arr_end_468: number = 0;
  /** +0x470 element* — heap array capacity-end (@0x398cd8 xmm0 splash zero). */
  cinem_arr_cap_470: number = 0;
  /** +0x478 uint64_t zero (upper half of xmm0 splash @0x398cd8). */
  cinem_u64_478: bigint = 0n;
  /** +0x480 uint32_t zero (@0x398cdf). */
  cinem_u32_480: number = 0;

  /**
   * PMFormatDescription::PMFormatDescription() — C2 (base) ctor.
   *
   * Ozone @0x398ac0..0x398cf1.  Fully-inlined composite constructor:
   * zero-initialises 0x128 bytes at this+0, then splashes kCMTimeInvalid
   * into the two Video CMTime slots, zero-initialises the tail of
   * PMVideoDescription including the four scattered __m128 stores, calls
   * PCString::PCString() @0x398b74 for the embedded string at +0x1d8,
   * zero-initialises 0x138 bytes at this+0x1f0 (which covers +0x1f8
   * PCNSRefImpl, +0x200 PCNSRefImpl, and the head of the
   * PMCinematicDescription subobject), splashes kCMTimeInvalid into the
   * Cinem CMTime slots at +0x328 and +0x340, calls PCString::PCString()
   * three more times @0x398c3b, @0x398c74, @0x398cb0 for the embedded
   * strings at +0x3d8, +0x408, +0x440, splashes kCMTimeZero into +0x420,
   * writes 44100.0 into +0x448, and zeroes the tail array pointers
   * +0x460/+0x468/+0x470/+0x480.
   *
   * NB: The C2 ctor does NOT call PMVideoDescription::PMVideoDescription()
   * or PMCinematicDescription::PMCinematicDescription() — the compiler
   * inlined them all.  The exception cleanup path @0x398cf2..0x398d47
   * DOES call ~PMCinematicDescription (with rdi=this+0x1f8) and
   * ~PMVideoDescription (with rdi=this+0x8), which is how we know the
   * subobject boundaries.
   *
   * @provenance Ozone @0x398ac0
   */
  constructor() {
    // The class-field initialisers above already reflect every write the
    // asm performs during ctor: kCMTimeInvalid / kCMTimeZero splashes,
    // PCString() defaults, 44100.0 sample rate, and every zero-fill.
    // No further work is needed here — the bit-image of a freshly
    // constructed instance matches the asm's post-state exactly.
  }

  /**
   * PMFormatDescription::~PMFormatDescription() — D2 (base) dtor.
   *
   * Ozone @0x398db0..0x398e70.  Mirror-order release of the composite:
   *
   *   1. @0x398dc5..0x398dff  — the heap-array at +0x460/+0x468: while
   *      the array is non-empty (r12 = +0x460 != null), walk from r15
   *      (= *(+0x468)) back to r12 in strides of 0x10, calling
   *      PCString::~PCString() on each element; then `operator delete`
   *      the storage block.  (Element stride 0x10, but PCString itself
   *      is 8 bytes — the trailing 8 bytes per element are opaque data
   *      not touched here.)
   *   2. @0x398e04 PCString::~PCString() on +0x440.
   *   3. @0x398e10 PCString::~PCString() on +0x408 (r14, which was
   *      loaded @0x398dbe as leaq 0x408(%rdi),%r14).
   *   4. @0x398e18 if +0x3f0 CGColorSpaceRef non-null:
   *          @0x398e24 PCCFRefTraits<CGColorSpace*>::release.
   *   5. @0x398e29 PCString::~PCString() on +0x3d8.
   *   6. @0x398e35 PCNSRefImpl::release() on +0x200.
   *   7. @0x398e41 PCNSRefImpl::release() on +0x1f8.
   *   8. @0x398e4d if +0x1f0 CGColorSpaceRef non-null:
   *          @0x398e59 PCCFRefTraits<CGColorSpace*>::release.
   *   9. @0x398e70 tail-call PCString::~PCString() on +0x1d8 (after
   *          `addq $0x1d8,%rbx` moves rbx from the class base to +0x1d8).
   *
   * Every other field of the two base subobjects is either POD or already
   * cleared by the above; nothing else to release.
   *
   * @provenance Ozone @0x398db0
   */
  destroy(): void {
    // Step 1: heap array at +0x460/+0x468.
    if (this.cinem_arr_head_460 !== null) {
      // Walk backwards, calling PCString::~PCString on each element.
      // Since the JS runtime frees storage automatically, we only
      // simulate the observable effect: drop the reference and reset
      // the length pointer to match the native post-state.
      // (Element PCString dtor releases its CFStringRef — modelled by
      // the PCString class's own dtor semantics via GC.)
      const arr = this.cinem_arr_head_460;
      // Iterate for parity with the native loop (no-op in JS).
      for (let i = arr.length - 1; i >= 0; i--) {
        // Native: PCString::~PCString(&arr[i]).  In JS, drop the ref.
        (arr as unknown[])[i] = null;
      }
      this.cinem_arr_head_460 = null;
      this.cinem_arr_end_468 = 0;
      // Note: cap +0x470 is NOT touched by the native dtor.
    }
    // Steps 2..9: PCString / release calls have no observable effect on
    // pure-JS fields (GC will reclaim), but we null out the ref slots so
    // the state matches the post-dtor native bytes.
    this.cinem_pcstr_440.ref = null;                        // step 2
    this.cinem_pcstr_408.ref = null;                        // step 3
    if (this.cinem_cgColorSpace_3f0 !== null) {             // step 4
      this.cinem_cgColorSpace_3f0 = null;
    }
    this.cinem_pcstr_3d8.ref = null;                        // step 5
    if (this.video_pcnsref_200 !== null) {                  // step 6
      this.video_pcnsref_200 = null;
    }
    if (this.video_pcnsref_1f8 !== null) {                  // step 7
      this.video_pcnsref_1f8 = null;
    }
    if (this.video_cgColorSpace_1f0 !== null) {             // step 8
      this.video_cgColorSpace_1f0 = null;
    }
    this.video_pcstr_1d8.ref = null;                        // step 9
  }
}
