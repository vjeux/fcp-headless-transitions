// HMDTexture.ts — Ozone's HMDTexture wrapper around a Helium HGBitmap.
// Faithful transcription of BOTH externally-visible HMDTexture methods from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//     Versions/A/Ozone
//
// Source disassembly:
//   raw-port/re/disasm/HMDTexture.isValid.s     @0x5305b0
//   raw-port/re/disasm/HMDTexture.getSurface.s  @0x5305c0
//
// nm confirms these are the ONLY externally-visible HMDTexture methods:
//   00000000005305b0 T HMDTexture::isValid() const
//   00000000005305c0 T HMDTexture::getSurface() const
//
// ---------------------------------------------------------------------------
// Struct layout (recovered from the ONLY field read by these two methods):
//
//   struct HMDTexture {
//     HGBitmap* bitmap;    // +0x00  — the underlying Helium bitmap.
//                          //         isValid() @0x5305b4 tests it against nullptr;
//                          //         getSurface() @0x5305c4 loads it as the first arg to
//                          //         HGCVBitmap::getCVBitmapStorage(HGBitmap*).
//   };
//
// The layout beyond +0x00 is NOT observable from these two methods.
//
// ---------------------------------------------------------------------------
// Cited callees / __stubs:
//   HGCVBitmap::getCVBitmapStorage(HGBitmap*)   @Ozone __stubs 0x6dd34a
//                                               (__ZN10HGCVBitmap18getCVBitmapStorageEP8HGBitmap)
//                                               called @0x5305c7. Returns a pointer to some
//                                               HGCVBitmapStorage-like object; the caller
//                                               then reads its +0x80 field.
//   _CVPixelBufferGetIOSurface                  @Ozone __stubs 0x6dcb4c
//                                               tail-jumped @0x5305d8. This is the public
//                                               CoreVideo function
//                                               `IOSurfaceRef CVPixelBufferGetIOSurface(CVPixelBufferRef)`.
//                                               Called with the value at storage->+0x80->+0x18,
//                                               which must therefore be a CVPixelBufferRef.
//
// Field offsets read in getSurface:
//   HGCVBitmapStorage.+0x80  — some inner struct pointer.       @0x5305cc
//                              Loaded as `movq 0x80(%rax),%rax`.
//   (inner)+0x18             — the CVPixelBufferRef.            @0x5305d3
//                              Loaded as `movq 0x18(%rax),%rdi`.
//
// Neither HGCVBitmap nor the nested storage/pixel-buffer struct is ported yet.
// The concrete field types (i.e. what +0x80 points to and what +0x18 exactly
// holds) are not observable from HMDTexture's two methods — they'll be
// pinned down when HGCVBitmap is transcribed. Until then, they're carried
// through as opaque handles.

// ---------------------------------------------------------------------------
// Forward-declared opaques (not ported yet — the vtable/layout of HGBitmap,
// HGCVBitmap, and the CoreVideo pixel buffer/storage are all upstream).
// ---------------------------------------------------------------------------

/** HGBitmap — Helium's bitmap. Held by HMDTexture at +0x00. Not ported yet. */
export interface HGBitmap {
  readonly __hgBitmap: true;
}

/** HGCVBitmapStorage — object returned by HGCVBitmap::getCVBitmapStorage.
 *  Field +0x80 (read @0x5305cc) points to some inner object whose +0x18
 *  (read @0x5305d3) is a CVPixelBufferRef. Layout not decoded here. */
export interface HGCVBitmapStorage {
  /** +0x80 — inner struct pointer (its own +0x18 is a CVPixelBufferRef). */
  readonly inner_at_0x80: HGCVBitmapStorageInner;
}

/** The inner struct at HGCVBitmapStorage.+0x80. Only field observed here
 *  is `+0x18 : CVPixelBufferRef` (read @0x5305d3). */
export interface HGCVBitmapStorageInner {
  /** +0x18 — CVPixelBufferRef, passed to CVPixelBufferGetIOSurface @0x5305d8. */
  readonly pixelBuffer_at_0x18: CVPixelBufferRef;
}

/** Apple CoreVideo `CVPixelBufferRef` — opaque handle. */
export interface CVPixelBufferRef {
  readonly __cvPixelBuffer: true;
}

/** Apple CoreVideo `IOSurfaceRef` — opaque handle. Return type of
 *  CVPixelBufferGetIOSurface (@Ozone __stubs 0x6dcb4c). */
export interface IOSurfaceRef {
  readonly __ioSurface: true;
}

// ---------------------------------------------------------------------------
// __stubs — undecoded external callees. Each throws citing its exact call site.
// ---------------------------------------------------------------------------

/**
 * HGCVBitmap::getCVBitmapStorage(HGBitmap*)                     @Ozone __stubs 0x6dd34a
 * @stub — called from HMDTexture::getSurface @0x5305c7.
 * Ozone symbol __ZN10HGCVBitmap18getCVBitmapStorageEP8HGBitmap. Not ported yet.
 */
export function HGCVBitmap_getCVBitmapStorage(_bitmap: HGBitmap): HGCVBitmapStorage {
  throw new Error(
    "HGCVBitmap::getCVBitmapStorage(HGBitmap*) not ported — called from " +
      "HMDTexture::getSurface @0x5305c7 (Ozone __stubs 0x6dd34a " +
      "__ZN10HGCVBitmap18getCVBitmapStorageEP8HGBitmap)",
  );
}

/**
 * CVPixelBufferGetIOSurface(CVPixelBufferRef)                   @Ozone __stubs 0x6dcb4c
 * @stub — tail-jumped from HMDTexture::getSurface @0x5305d8.
 * This is the public CoreVideo function
 *   `IOSurfaceRef CVPixelBufferGetIOSurface(CVPixelBufferRef pixelBuffer)`
 * (Apple CoreVideo framework — CVPixelBuffer.h). Not ported here; surfaced
 * as a throwing stub so callers see the demand signal for a CoreVideo shim.
 */
export function CVPixelBufferGetIOSurface(_pb: CVPixelBufferRef): IOSurfaceRef {
  throw new Error(
    "CVPixelBufferGetIOSurface() not ported — tail-called from " +
      "HMDTexture::getSurface @0x5305d8 (Ozone __stubs 0x6dcb4c). " +
      "This is the public CoreVideo function (CVPixelBuffer.h).",
  );
}

// ---------------------------------------------------------------------------
// HMDTexture
// ---------------------------------------------------------------------------

/**
 * HMDTexture — Ozone's texture wrapper around a Helium HGBitmap. Only field
 * observable from the two ported methods is the HGBitmap pointer at +0x00.
 */
export interface HMDTexture {
  /** +0x00 — the underlying Helium bitmap. May be null (see isValid()). */
  bitmap: HGBitmap | null;
}

/**
 * HMDTexture::isValid() const                                   @Ozone 0x5305b0
 *
 * Returns whether this texture holds a non-null HGBitmap. Two-instruction body:
 *
 *   @0x5305b0 pushq %rbp
 *   @0x5305b1 movq  %rsp, %rbp
 *   @0x5305b4 cmpq  $0x0, (%rdi)          ; test (this)+0x00 (HGBitmap*) against null
 *   @0x5305b8 setne %al                   ; al = (bitmap != null)
 *   @0x5305bb popq  %rbp
 *   @0x5305bc retq                        ; return al (bool)
 */
export function HMDTexture_isValid(self: HMDTexture): boolean {
  // @0x5305b4-@0x5305b8: return (this->bitmap != nullptr)
  return self.bitmap !== null;
}

/**
 * HMDTexture::getSurface() const                                @Ozone 0x5305c0
 *
 * Extracts the IOSurfaceRef backing this texture's HGBitmap. Chain:
 *
 *   IOSurfaceRef = CVPixelBufferGetIOSurface(
 *       HGCVBitmap::getCVBitmapStorage(this->bitmap)->[+0x80]->[+0x18]
 *   );
 *
 * Faithful asm mirror:
 *
 *   @0x5305c0 pushq %rbp / movq %rsp,%rbp
 *   @0x5305c4 movq  (%rdi), %rdi          ; rdi = this->bitmap  (HGBitmap*)
 *   @0x5305c7 callq __ZN10HGCVBitmap18getCVBitmapStorageEP8HGBitmap
 *                                          ; rax = HGCVBitmapStorage*
 *   @0x5305cc movq  0x80(%rax), %rax       ; rax = storage->+0x80  (inner*)
 *   @0x5305d3 movq  0x18(%rax), %rdi       ; rdi = inner->+0x18   (CVPixelBufferRef)
 *   @0x5305d7 popq  %rbp
 *   @0x5305d8 jmp   _CVPixelBufferGetIOSurface
 *                                          ; tail-call — return its result.
 *
 * IMPORTANT: If this->bitmap is null, the very first `movq (%rdi),%rdi` still
 * loads (as `null`) and is then dereferenced by getCVBitmapStorage in the
 * callee — meaning this function assumes `isValid() == true`. That's the
 * pre-condition every caller is expected to have satisfied by first calling
 * isValid(). The asm has no null-check; we preserve that exact contract.
 */
export function HMDTexture_getSurface(self: HMDTexture): IOSurfaceRef {
  // @0x5305c4 — rdi = this->bitmap. The C++ code passes it verbatim to the
  // callee without a null-check; we mirror that (the callee will fault/throw
  // on null, per the original binary's semantics).
  const bitmap = self.bitmap as HGBitmap;
  // @0x5305c7 — call HGCVBitmap::getCVBitmapStorage(HGBitmap*).
  const storage = HGCVBitmap_getCVBitmapStorage(bitmap);
  // @0x5305cc — rax = storage->+0x80.
  const inner = storage.inner_at_0x80;
  // @0x5305d3 — rdi = inner->+0x18.
  const pb = inner.pixelBuffer_at_0x18;
  // @0x5305d8 — tail-jmp CVPixelBufferGetIOSurface(pb); return its result.
  return CVPixelBufferGetIOSurface(pb);
}
