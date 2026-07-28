// HGDitherLUTEntry.ts — Helium
// HGDitherLUTEntry: the RENDERABLE cache entry produced by
// HGDitherLUTEntryFactory::createLUTEntry. This is a subclass of
// HGLUTCache::LUTEntry that lazily builds two HGBitmaps (a plain corner-
// aligned bitmap + a noise-filled bitmap of the same rect/format) and, on
// GetBitmap(), uploads/copies them into an HGMetalTexture for GPU dispatch.
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGDitherLUTEntry.HGDitherLUTEntry.s       (ctor  @0x06ff70)
//   raw-port/re/disasm/Helium.HGDitherLUTEntry.~HGDitherLUTEntry.s      (D0    @0x070210)
//   raw-port/re/disasm/Helium.HGDitherLUTEntry.GetBitmap.s              (       @0x070270)
//   (D1 dtor @0x0701c0 read directly via `otool -tV`; body decoded inline below.)
//
// Helium symbols transcribed:
//   @0x06ff70  HGDitherLUTEntry::HGDitherLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)   [C2 base ctor]
//   @0x0701c0  HGDitherLUTEntry::~HGDitherLUTEntry()   [D1 in-place dtor]
//   @0x070210  HGDitherLUTEntry::~HGDitherLUTEntry()   [D0 deleting dtor]
//   @0x070270  HGDitherLUTEntry::GetBitmap()
//
// vtable installed ptr @Helium 0xa08c18 (leaq 0x9989f8(%rip),%rax at D0
// @0x070219 sets `*this = vtable`, i.e. the vptr slot 0). Sibling class
// HGDitherLUTEntryFactory (raw-port/src/render/HGDitherLUTEntryFactory.ts)
// documents the sibling vtable @0xa08b68.
//
// -----------------------------------------------------------------------------
// LAYOUT (recovered from ctor + dtor + GetBitmap field accesses)
// -----------------------------------------------------------------------------
//   struct HGDitherLUTEntry : HGLUTCache::LUTEntry {   // base @+0x00
//     // +0x00  vptr (set to vtable @0xa08c18)
//     // +0x08  ...   HGLUTCache::LUTEntry base fields (see D2 @0x07024e /
//     //              @0x0701fa — the base dtor is called on the same `self`;
//     //              exact base layout undecoded, but the derived class only
//     //              touches offsets 0x10, 0x18, 0x20 below).
//     // +0x10  HGRenderer*  m_renderer         (const-init at base ctor, read
//     //                                         by GetBitmap @0x070280 / @0x07029e)
//     // +0x18  HGBitmap*    m_bitmap_plain     (owned; +0x18 in both dtors —
//     //                                         released via `(*vt)+0x18(this)`
//     //                                         at D0 @0x07023e / D1 @0x0701ee;
//     //                                         written by ctor @0x07001e)
//     // +0x20  HGBitmap*    m_bitmap_noise     (owned; +0x20 in both dtors —
//     //                                         released via `(*vt)+0x18(this)`
//     //                                         at D0 @0x07022f / D1 @0x0701df;
//     //                                         written by ctor at the tail
//     //                                         @0x070082 branch. In GetBitmap
//     //                                         @0x0702dd this same slot 0x20
//     //                                         is later repurposed to hold
//     //                                         the constructed HGMetalTexture.)
//   };
//
// (The base HGLUTCache::LUTEntry layout is a frontier — see
// raw-port/src/render/HGLUTCache_stub.ts once introduced; for now the base
// ctor/dtor is a citation-only stub.)
//
// -----------------------------------------------------------------------------
// Called symbols (all Helium; addresses are __stubs / RIP-relative loads):
//
//   Ctor @0x06ff70 callees:
//     @0x06ff87  __ZN10HGLUTCache8LUTEntryC2EPNS_7LUTInfoEP10HGRenderer
//                  HGLUTCache::LUTEntry::LUTEntry(LUTInfo*, HGRenderer*)      [base ctor]
//     @0x06ff8c  leaq 0x998c85(%rip),%rax   -> installed vtable ptr @Helium 0xa08c18
//                                              (movq %rax,(%rbx) @0x06ff93 sets vptr)
//     @0x06ffa6  literal-pool load: __ZTIN10HGLUTCache7LUTInfoE  (base typeinfo)
//     @0x06ffad  leaq __ZTI15HGDitherLUTInfo(%rip),%rdx          (target typeinfo)
//     @0x06ffb9  ___dynamic_cast(info, base_ti, HGDitherLUTInfo_ti, 0)  — cross-cast
//                the incoming HGLUTCache::LUTInfo* down to HGDitherLUTInfo*.
//     @0x06ffcf  __ZN13HGDitherNoise10getNumColsEv   HGDitherNoise::getNumCols()
//     @0x06ffd7  __ZN13HGDitherNoise10getNumColsEv   (called TWICE — separate rows/cols)
//     @0x06ffdc/@0x06ffe1  cvtsi2ss  -> f32(rows), f32(cols)
//     @0x06ffeb  _HGRectMake4f(0, 0, cols_f, rows_f)  — rect for both bitmaps
//     @0x06fff6  __ZN13HGDitherNoise9getFormatEv   HGDitherNoise::getFormat()  -> HGFormat
//     @0x06fffe/@0x070003 HGObject::operator new(0x80)  — allocate 128-byte bitmap
//     @0x070019  __ZN8HGBitmapC1E6HGRect8HGFormat   HGBitmap(rect, format)   [1st bitmap]
//     @0x070022-@0x070032   compare-and-release existing self.m_bitmap_plain,
//                           store new one via *(base+0x18) = new_bitmap
//                           (release via `(*vt)+0x18(old)` if non-null and !=new)
//     @0x070051  __ZN13HGDitherNoise8getNoiseENS_7PDFModeE   HGDitherNoise::getNoise(3)
//                  (arg 3 = PDFMode value; identity of the enum member is a
//                   frontier — cited only, not re-invented)
//     @0x07005e  HGObject::operator new(0x80)  — allocate 128-byte 2nd bitmap
//     @0x070079  __ZN8HGBitmapC1E6HGRect8HGFormatPv   HGBitmap(rect, fmt, void* noise_ptr)  [2nd bitmap w/ noise data]
//     @0x070085  cmpl 0x10(%rax), %r12d   — compare LUTInfo format field @+0x10 vs saved format
//     @0x07008f  __ZN13HGRenderUtils12BufferCopierC1Ev    HGRenderUtils::BufferCopier::BufferCopier()
//     @0x0700a2  __ZN13HGRenderUtils12BufferCopier7executeEP8HGBitmapS2_    BufferCopier::execute(dst, src)
//     @0x0700ab  __ZN13HGRenderUtils12BufferCopierD1Ev    ~BufferCopier()
//     @0x0700bb  __ZN13HGRenderUtils17BufferReformatterC1Ev BufferReformatter()
//     @0x0700ce  __ZN13HGRenderUtils17BufferReformatter7executeEP8HGBitmapS2_ ::execute(dst, src)
//     @0x0700d7  __ZN13HGRenderUtils17BufferReformatterD1Ev ~BufferReformatter()
//     @0x070169  __ZN8HGObjectdlEPv   HGObject::operator delete(void*)   [exception cleanup]
//     @0x07019b  __ZN10HGLUTCache8LUTEntryD2Ev    HGLUTCache::LUTEntry::~LUTEntry()  [exception unwind]
//     @0x0701a3  __Unwind_Resume  (exception unwind tail)
//     @0x070042/@0x0700e4/@0x0700ef/@0x070109/@0x070142/@0x070180/@0x070192/
//     @0x070032:  *0x18(vptr)(bitmap)  — the standard "release" slot on
//                                        HGBitmap's vtable (slot @+0x18).
//
//   D1 dtor @0x0701c0 callees:
//     @0x0701c9  leaq 0x998a48(%rip),%rax  -> vtable ptr @Helium 0xa08c18 (reset vptr)
//     @0x0701df  *0x18(vptr)(self.m_bitmap_noise)  release noise-bitmap if non-null
//     @0x0701ee  *0x18(vptr)(self.m_bitmap_plain)  release plain-bitmap if non-null
//     @0x0701fa  __ZN10HGLUTCache8LUTEntryD2Ev  base dtor tail-jmp
//
//   D0 dtor @0x070210 callees:
//     @0x070219  leaq 0x9989f8(%rip),%rax  -> vtable ptr @Helium 0xa08c18 (reset vptr)
//     @0x07022f  *0x18(vptr)(self.m_bitmap_noise)  release noise-bitmap
//     @0x07023e  *0x18(vptr)(self.m_bitmap_plain)  release plain-bitmap
//     @0x070244  __ZN10HGLUTCache8LUTEntryD2Ev  base dtor callq
//     @0x070252  __ZdlPv                       operator delete tail-jmp (deleting form)
//
//   GetBitmap @0x070270 callees:
//     @0x070290  vfn @+0x130 on self.m_renderer  — returns a bool (testb %al,%al):
//                                                  "renderer is CPU-only / bitmap-preferred".
//                                                  If TRUE -> fall to @0x7034d (return
//                                                  self.m_bitmap_plain as an HGBitmap*).
//     @0x0702a7  __ZTI10HGRenderer     typeinfo for HGRenderer     (dynamic_cast source)
//     @0x0702ae  __ZTI13HGGPURenderer  typeinfo for HGGPURenderer  (dynamic_cast target)
//     @0x0702ba  ___dynamic_cast(self.m_renderer, HGRenderer_ti, HGGPURenderer_ti, 0)
//     @0x0702d2  vfn @+0x80 on self.m_renderer, arg=0x2b  — HGRenderer feature-query
//                                                            (returns int; ==1 means
//                                                            "supports Metal textures").
//     @0x0702f1  __ZN13HGGPURenderer15GetMetalContextEv  HGGPURenderer::GetMetalContext()
//                    Returns a struct at self.m_metalCtx; loads @+0x10 twice
//                    (@0x0702f6/@0x0702fa) to get an HGMetalTexturePool*.
//     @0x0702fe/@0x070302/@0x070306   load `m_bitmap_plain` (+0x18) and read its
//                                     @+0x14 (u64) and @+0x1c (u64) fields —
//                                     `HGBitmap` sub-fields ("bounds hi/lo",
//                                     as packed by HGBitmap ctor). These are
//                                     passed as the HGRect arg to createWithCopy
//                                     (r8, r9 = HGRect.lo/HGRect.hi).
//     @0x07031f  __ZN14HGMetalTexture14createWithCopyE15HGMTLDeviceTypeP18HGMetalTexturePoolP8HGBitmap6HGRectbb
//                    HGMetalTexture::createWithCopy(deviceType=0,
//                                                   pool=m_metalCtx->pool,
//                                                   bitmap=self.m_bitmap_plain,
//                                                   rect={m_bitmap_plain@+0x14, @+0x1c},
//                                                   flag1=false,
//                                                   flag2=false)
//                    Returns a fresh HGMetalTexture* (or the same slot if unchanged).
//     @0x07033c/@0x070379/@0x070387   *0x18(vptr)(old_texture) release-slot on the
//                                     previous HGMetalTexture (same vtable convention).
//     @0x070343   store the new texture into self@+0x20 (m_bitmap_noise slot is
//                 REPURPOSED to hold the constructed HGMetalTexture — this is how
//                 the cache-entry becomes GPU-ready after the first GetBitmap).
//     @0x070363-@0x070370   return `*(void**)(&self@+0x20 or &self@+0x18)`
//                           (whichever slot the code path picked as `%r15`).
//
// FRONTIER TYPES (surfaced as opaque handles here; each cited by @0xADDR):
//   HGLUTCache::LUTInfo, HGLUTCache::LUTEntry, HGDitherLUTInfo, HGDitherNoise,
//   HGDitherNoise::PDFMode, HGRenderer, HGGPURenderer, HGBitmap, HGFormat,
//   HGMetalContext, HGMetalTexture, HGMetalTexturePool, HGMTLDeviceType,
//   HGRenderUtils::BufferCopier, HGRenderUtils::BufferReformatter, HGRect.
//
// -----------------------------------------------------------------------------

import { HGRect } from "./HGRect";

// -----------------------------------------------------------------------------
// Frontier types.
// -----------------------------------------------------------------------------

/** HGLUTCache::LUTInfo — opaque base for cache-key info structs. Passed to
 *  the ctor at %rsi (@0x06ff81/@0x06ffa6). Cross-cast to HGDitherLUTInfo
 *  inside the ctor via ___dynamic_cast @0x06ffb9. */
export type HGLUTCache_LUTInfo = { readonly __brand: "HGLUTCache::LUTInfo" };

/** HGDitherLUTInfo — the dynamic_cast target @0x06ffad. Its +0x10 int32 is
 *  read by ctor @0x070085 (cmpl 0x10(%rax), %r12d) as an HGFormat field. */
export type HGDitherLUTInfo = { readonly __brand: "HGDitherLUTInfo" };

/** HGRenderer — abstract renderer. Passed to the ctor at %rdx (@0x06ff81)
 *  and stored at self+0x10 by the base ctor; GetBitmap reads it back at
 *  @0x070280 / @0x07029e and calls vfn @+0x130 (bitmap-preferred?) @0x070290
 *  and vfn @+0x80 (feature-query 0x2b) @0x0702d2. */
export type HGRenderer = { readonly __brand: "HGRenderer" };

/** HGGPURenderer — dynamic_cast target @0x0702ae; when the incoming
 *  HGRenderer is a GPU renderer this pointer becomes the source of the
 *  GetMetalContext() call @0x0702f1. */
export type HGGPURenderer = { readonly __brand: "HGGPURenderer" };

/** HGBitmap — 128-byte object allocated by HGObject::operator new(0x80)
 *  @0x06fffe/@0x07005e and initialized by the two overloaded HGBitmap
 *  constructors @0x070019 / @0x070079. Its vtable slot @+0x18 is the
 *  standard "release" hook used by both dtors. */
export type HGBitmap = { readonly __brand: "HGBitmap" };

/** HGFormat — int32 pixel-format enum. Returned by HGDitherNoise::getFormat()
 *  @0x06fff6 and passed as arg3 to both HGBitmap ctors. Also used at
 *  @0x070014 as the literal 0x1b (== 27), passed to HGBitmap(rect, HGFormat)
 *  in the plain-bitmap ctor call — a specific pixel-format value the
 *  Helium format registry defines (undecoded here; cited @0x070014). */
export type HGFormat = number;

/** HGDitherNoise — namespace-level static functions producing noise tables.
 *  ctor calls three static methods: getNumCols @0x06ffcf/@0x06ffd7,
 *  getFormat @0x06fff6, getNoise(PDFMode) @0x070051 (arg=3). */
export type HGDitherNoise_PDFMode = number;

/** HGMetalTexture — the GPU-side texture built by createWithCopy @0x07031f
 *  and stored back into self+0x20 by GetBitmap. Its vtable slot @+0x18 is
 *  the same release-hook convention used by HGBitmap. */
export type HGMetalTexture = { readonly __brand: "HGMetalTexture" };

/** HGMetalTexturePool — opaque handle read out of the GetMetalContext
 *  return-struct at +0x10 twice (@0x0702f6/@0x0702fa). */
export type HGMetalTexturePool = { readonly __brand: "HGMetalTexturePool" };

/** HGLUTCache::LUTEntry — the polymorphic base of HGDitherLUTEntry. Base
 *  ctor called from @0x06ff87; base dtor from @0x07019b/@0x070244/@0x0701fa. */
export type HGLUTCache_LUTEntry = { readonly __brand: "HGLUTCache::LUTEntry" };

/** HGDitherLUTEntry instance. Field layout is documented in the file
 *  header comment (base +0x00, m_renderer +0x10, m_bitmap_plain +0x18,
 *  m_bitmap_noise/m_gpuTexture +0x20). We surface it as an opaque struct
 *  handle here to keep the C++ method signatures faithful without
 *  fabricating the accessors — the four methods below all throw citing
 *  their @0xADDR since their bodies span >10 undecoded frontier callees
 *  (HGDitherNoise, HGBitmap, HGRenderUtils::BufferCopier / Reformatter,
 *  HGMetalTexture::createWithCopy, HGGPURenderer::GetMetalContext, etc.). */
export type HGDitherLUTEntry = { readonly __brand: "HGDitherLUTEntry" };

// -----------------------------------------------------------------------------
// HGDitherLUTEntry::HGDitherLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
// @Helium 0x06ff70  — 175-line ctor.
//
// Decoded control flow (matches the disassembly line-for-line):
//   1. @0x06ff87  base ctor: HGLUTCache::LUTEntry::LUTEntry(info, renderer).
//   2. @0x06ff8c-@0x06ff93  self.vptr = &vtable @Helium 0xa08c18.
//   3. @0x06ff96-@0x06ff99  zero-init self@+0x18 and self@+0x20 (both bitmap slots).
//   4. @0x06ff9d  if (info == nullptr) goto cleanup @0x700ea (nothing else to do).
//   5. @0x06ffb9  info_as_dither = ___dynamic_cast(info, base_ti, HGDitherLUTInfo_ti, 0).
//   6. @0x06ffbe  if (info_as_dither == nullptr) goto cleanup @0x700ea.
//   7. @0x06ffcf  cols = HGDitherNoise::getNumCols();
//   8. @0x06ffd7  rows = HGDitherNoise::getNumCols();   [called twice, distinct callsites]
//   9. @0x06ffeb  rect = _HGRectMake4f(0.0f, 0.0f, f32(cols), f32(rows));  [args in xmm0..xmm3]
//  10. @0x06fff6  fmt  = HGDitherNoise::getFormat();
//  11. @0x06fffe/@0x070019  bmp_plain = new HGBitmap(rect, HGFormat(0x1b));    [128-byte object]
//  12. @0x070022-@0x070049  self@+0x18 = release-and-store(bmp_plain).
//  13. @0x07004c/@0x070051  noise = HGDitherNoise::getNoise(PDFMode(3));
//  14. @0x070059/@0x070079  bmp_noise = new HGBitmap(rect, fmt, noise);        [128-byte object]
//  15. @0x070085  if (info_as_dither@+0x10 == fmt)  goto Copier branch (@0x07008b),
//                 else                              goto Reformatter branch (@0x0700b7).
//         Copier branch (matching format):
//           @0x07008f  HGRenderUtils::BufferCopier bc;
//           @0x0700a2  bc.execute(dst=info_as_dither@+0x0, src=bmp_noise);
//           @0x0700ab  bc.~BufferCopier();
//         Reformatter branch (mismatched format):
//           @0x0700bb  HGRenderUtils::BufferReformatter br;
//           @0x0700ce  br.execute(dst=info_as_dither@+0x0, src=bmp_noise);
//           @0x0700d7  br.~BufferReformatter();
//  16. @0x0700e1  release(bmp_noise).   [via *0x18(vptr)(bmp_noise) if non-null]
//         NOTE: self@+0x20 (the noise-bitmap slot) is NOT populated by the
//         normal path — the ctor releases bmp_noise after using it as a
//         staging buffer for BufferCopier/Reformatter. GetBitmap later
//         REPURPOSES self@+0x20 to hold the constructed HGMetalTexture
//         (see GetBitmap decode notes above). The +0x20 dtor slot is a
//         type-erased "release via vptr@+0x18" pointer that works for both
//         HGBitmap and HGMetalTexture — Helium's runtime uses the same
//         "operator delete on virtual slot 0x18" ABI for both classes.
//  17. @0x0700ea  cleanup path: return.
// -----------------------------------------------------------------------------

/** HGDitherLUTEntry::HGDitherLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*) @Helium 0x06ff70.
 *  Frontier body: 175 lines of x86_64 that instantiate 4+ undecoded C++
 *  classes (HGBitmap ctor x2 @0x070019/@0x070079, HGRenderUtils::BufferCopier
 *  or BufferReformatter @0x07008f/@0x0700bb, HGDitherNoise:: static calls
 *  @0x06ffcf/@0x06ffd7/@0x06fff6/@0x070051, HGObject::operator new @0x06fffe/
 *  @0x07005e, HGLUTCache::LUTEntry base ctor @0x06ff87, ___dynamic_cast
 *  @0x06ffb9) plus a C++ exception cleanup graph (@0x0700f9-@0x0701a8). Each
 *  callee is an undecoded frontier symbol; a body written here without those
 *  callees would fabricate the object state. */
export function HGDitherLUTEntry_ctor(
  _self: HGDitherLUTEntry,
  _info: HGLUTCache_LUTInfo | null,
  _renderer: HGRenderer,
): void {
  throw new Error(
    "HGDitherLUTEntry::HGDitherLUTEntry @Helium 0x06ff70 not yet transcribed: 175-line ctor whose body depends on undecoded frontier symbols HGLUTCache::LUTEntry::LUTEntry @0x06ff87, ___dynamic_cast @0x06ffb9, HGDitherNoise::getNumCols @0x06ffcf, HGDitherNoise::getFormat @0x06fff6, HGDitherNoise::getNoise @0x070051, HGObject::operator new @0x06fffe, HGBitmap ctors @0x070019/@0x070079, HGRenderUtils::BufferCopier @0x07008f/@0x0700a2/@0x0700ab, HGRenderUtils::BufferReformatter @0x0700bb/@0x0700ce/@0x0700d7, and vtable slot *0x18 on HGBitmap; installed vtable ptr @0xa08c18 @0x06ff8c.",
  );
}

// -----------------------------------------------------------------------------
// HGDitherLUTEntry::~HGDitherLUTEntry() (D1 in-place) @Helium 0x0701c0
// Decoded body (read directly via otool -tV):
//   @0x0701c9-@0x0701d0  self.vptr = &vtable @Helium 0xa08c18.  (idiomatic
//                        "reset vptr to derived-class-table before base
//                        dtor runs so no derived vfn dispatches happen").
//   @0x0701d3-@0x0701df  if (self.m_bitmap_noise != nullptr)
//                          call self.m_bitmap_noise->vt[0x18](self.m_bitmap_noise);
//                        (release-slot on HGBitmap's vtable; same convention
//                         used by GetBitmap for HGMetalTexture.)
//   @0x0701e2-@0x0701ee  if (self.m_bitmap_plain != nullptr)
//                          call self.m_bitmap_plain->vt[0x18](self.m_bitmap_plain);
//   @0x0701fa            jmp HGLUTCache::LUTEntry::~LUTEntry(self)   [base dtor tail-jmp]
// -----------------------------------------------------------------------------

/** HGDitherLUTEntry::~HGDitherLUTEntry() (D1 in-place) @Helium 0x0701c0.
 *  Releases the two owned bitmap-shaped slots (+0x18, +0x20) via their
 *  virtual release-hook @+0x18, then tail-jmps to HGLUTCache::LUTEntry's
 *  base dtor. HGBitmap's release-hook and the base dtor are both undecoded
 *  frontier symbols, so this dtor is a citation-only stub. */
export function HGDitherLUTEntry_dtor_D1(_self: HGDitherLUTEntry): void {
  throw new Error(
    "HGDitherLUTEntry::~HGDitherLUTEntry (D1) @Helium 0x0701c0 not yet transcribed: releases self@+0x20 via vt[0x18] @0x0701df and self@+0x18 via vt[0x18] @0x0701ee, then tail-jmps to HGLUTCache::LUTEntry::~LUTEntry @0x0701fa — the base dtor and the HGBitmap release-slot are undecoded frontier symbols.",
  );
}

// -----------------------------------------------------------------------------
// HGDitherLUTEntry::~HGDitherLUTEntry() (D0 deleting) @Helium 0x070210
//   @0x070219-@0x070220  self.vptr = &vtable @Helium 0xa08c18.
//   @0x070223-@0x07022f  if (self.m_bitmap_noise != nullptr)  vt[0x18](self.m_bitmap_noise);
//   @0x070232-@0x07023e  if (self.m_bitmap_plain != nullptr)  vt[0x18](self.m_bitmap_plain);
//   @0x070244            call HGLUTCache::LUTEntry::~LUTEntry(self);  [base dtor callq — NOT tail]
//   @0x070252            jmp __ZdlPv (operator delete(void*))         [deleting form tail-jmp]
// -----------------------------------------------------------------------------

/** HGDitherLUTEntry::~HGDitherLUTEntry() (D0 deleting) @Helium 0x070210.
 *  Same body as D1 followed by operator delete(this). Kept as a citation-
 *  only stub because both the base dtor @0x070244 and the HGBitmap release
 *  slot @0x07022f/@0x07023e are undecoded frontier symbols. */
export function HGDitherLUTEntry_dtor_D0(_self: HGDitherLUTEntry): void {
  throw new Error(
    "HGDitherLUTEntry::~HGDitherLUTEntry (D0) @Helium 0x070210 not yet transcribed: D1 body inline (vt[0x18] releases at @0x07022f/@0x07023e) then HGLUTCache::LUTEntry::~LUTEntry @0x070244 then operator delete tail-jmp @0x070252 — all callees are undecoded frontier symbols.",
  );
}

// -----------------------------------------------------------------------------
// HGDitherLUTEntry::GetBitmap() @Helium 0x070270  — 99-line accessor.
//
// Decoded control flow:
//   1. @0x070280  renderer = self.m_renderer @+0x10.
//   2. @0x070284  if (renderer == nullptr) goto CPU-fallback @0x7034d.
//   3. @0x070290  if (renderer->vt[0x130](renderer))            [returns bool]
//                 goto CPU-fallback @0x7034d.
//                 (vt[0x130] is a "prefers bitmap over Metal texture?" query.)
//   4. @0x0702a7-@0x0702bf  gpu_renderer = ___dynamic_cast(renderer, HGRenderer_ti,
//                                                          HGGPURenderer_ti, 0);
//                          (nullptr on failure — kept in %r14.)
//   5. @0x0702c7-@0x0702d8  if (renderer->vt[0x80](renderer, 0x2b) != 1)
//                              goto CPU-fallback @0x7034d.
//                              (0x2b is the "supports Metal texture" query.)
//   6. @0x0702dd  slot = &self@+0x20.  (repurposed HGMetalTexture slot.)
//   7. @0x0702e1  if (*slot != nullptr) goto RELEASE-OLD @0x070384 (skip build).
//   8. @0x0702ee-@0x0702fa  metal_ctx  = gpu_renderer->GetMetalContext();
//                          pool        = *(HGMetalTexturePool**)(metal_ctx@+0x10@+0x10);
//   9. @0x0702fe-@0x070306  plain      = self.m_bitmap_plain @+0x18;
//                          rect_lo    = *(u64*)(plain @+0x14);   // HGRect.lo (x|y<<32)
//                          rect_hi    = *(u64*)(plain @+0x1c);   // HGRect.hi (right|bottom<<32)
//  10. @0x07031f            new_tex = HGMetalTexture::createWithCopy(
//                                        deviceType=0, pool, plain,
//                                        HGRect{rect_lo, rect_hi}, false, false);
//                          (returned as 16-byte struct in (rax, rdx); the
//                           call also spills the result via &-0x20(%rbp).)
//  11. @0x070324-@0x07033f  old = *slot; if (old != new_tex && old != nullptr)
//                              old->vt[0x18](old);
//  12. @0x070343            *slot = new_tex;
//  13. @0x070363-@0x070370  return **slot   (i.e. `*(void**)slot`, the vptr of
//                          the returned texture — this is the "HGBitmap*" the
//                          caller keys the cache on: it's actually the
//                          HGMetalTexture cast through an HGBitmap-compatible
//                          release-slot ABI; see the +0x20 note in the layout
//                          comment above).
//
//   CPU-fallback @0x7034d: %r15 = &self@+0x18; if (*r15 != nullptr)
//                          call (*r15)->vt[0x10](*r15) (an "acquire"/AddRef-style
//                          hook @+0x10, not the release hook @+0x18); return **r15.
//                          (Reads self.m_bitmap_plain and returns the raw HGBitmap*
//                           after nudging its refcount via vt[0x10].)
//
//   RELEASE-OLD path @0x070384: like step 11 but reached when *slot was
//                          already non-null on entry (a stale HGMetalTexture from
//                          a previous invocation).
// -----------------------------------------------------------------------------

/** HGDitherLUTEntry::GetBitmap() @Helium 0x070270.
 *  Returns the HGBitmap* (or HGMetalTexture* posing as one, via the shared
 *  vt[0x18] ABI) that this cache entry surfaces to the render pipeline.
 *  On a GPU renderer that supports Metal (renderer->vt[0x80](0x2b)==1 and
 *  renderer->vt[0x130]()==0), lazily builds an HGMetalTexture via
 *  createWithCopy @0x07031f and caches it in self@+0x20. On a CPU / bitmap-
 *  preferred renderer, returns self.m_bitmap_plain after nudging its
 *  vt[0x10] hook.
 *
 *  Kept as a citation-only stub: the body depends on undecoded frontier
 *  symbols HGGPURenderer::GetMetalContext @0x0702f1, HGMetalTexture::
 *  createWithCopy @0x07031f, ___dynamic_cast @0x0702ba, HGRenderer vtable
 *  slots @+0x80 / @+0x130, and HGBitmap/HGMetalTexture vtable slots @+0x10
 *  and @+0x18. */
export function HGDitherLUTEntry_GetBitmap(_self: HGDitherLUTEntry): HGBitmap {
  throw new Error(
    "HGDitherLUTEntry::GetBitmap @Helium 0x070270 not yet transcribed: 99-line accessor whose body depends on undecoded frontier symbols HGRenderer vtable slots @+0x130 @0x070290 and @+0x80 @0x0702d2, ___dynamic_cast @0x0702ba, HGGPURenderer::GetMetalContext @0x0702f1, HGMetalTexture::createWithCopy @0x07031f, and HGBitmap/HGMetalTexture vtable release-slot @+0x18 @0x07033c/@0x070379/@0x070387 and acquire-slot @+0x10 @0x07035d/@0x070387.",
  );
}

// -----------------------------------------------------------------------------
// Helper — unused HGRect import shim (keeps the HGRect type referenced from
// this file so future transcriptions of the createWithCopy call can bind to
// the same corner-form int32 struct used by HGRectMake4f @0x06ffeb).
// -----------------------------------------------------------------------------
export type HGDitherLUTEntry_HGRect = HGRect;
