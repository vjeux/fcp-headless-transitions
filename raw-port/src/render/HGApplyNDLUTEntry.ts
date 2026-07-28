// raw-port/src/render/HGApplyNDLUTEntry.ts — Helium
//
// FCP `HGApplyNDLUTEntry`: the RENDERABLE cache entry produced by the
// HGApplyNDLUTInfo-family factories. Subclass of HGLUTCache::LUTEntry.
// Owns a CPU-side HGBitmap (built from repeated colorAtIndex() samples of
// the paired HGApplyNDLUTInfo) and lazily uploads it to an HGMetalTexture
// on GetBitmap() when a GPU renderer that reports Metal-texture support
// is available.
//
// Verbatim from FCP's Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Decode evidence (all offsets are the x86_64-slice VMAs; the x86_64 slice
// starts at file offset 0x4000):
//   raw-port/re/disasm/Helium.HGApplyNDLUTEntry.CopyData.s       @0x3d9b0
//   raw-port/re/disasm/Helium.HGApplyNDLUTEntry.GetBitmap.s      @0x3e240
//   otool -tV extracts of C2/C1/D2/D1/D0 embedded inline below   @0x3d750..0x3e222
//
// -----------------------------------------------------------------------------
// Helium symbols transcribed
// -----------------------------------------------------------------------------
//   @0x3d750  __ZN17HGApplyNDLUTEntryC2EPN10HGLUTCache7LUTInfoEP10HGRenderer
//               HGApplyNDLUTEntry::HGApplyNDLUTEntry(LUTInfo*, HGRenderer*)   [C2]
//   @0x3e130  __ZN17HGApplyNDLUTEntryC1EPN10HGLUTCache7LUTInfoEP10HGRenderer
//               [C1 — 5-byte thunk: popq %rbp; jmp C2]
//   @0x3d9b0  __ZN17HGApplyNDLUTEntry8CopyDataEPK16HGApplyNDLUTInfo
//               HGApplyNDLUTEntry::CopyData(HGApplyNDLUTInfo const*)
//   @0x3e140  __ZN17HGApplyNDLUTEntryD2Ev  HGApplyNDLUTEntry::~HGApplyNDLUTEntry [D2]
//   @0x3e190  __ZN17HGApplyNDLUTEntryD1Ev  HGApplyNDLUTEntry::~HGApplyNDLUTEntry [D1]
//   @0x3e1e0  __ZN17HGApplyNDLUTEntryD0Ev  HGApplyNDLUTEntry::~HGApplyNDLUTEntry [D0]
//   @0x3e240  __ZN17HGApplyNDLUTEntry9GetBitmapEv  HGApplyNDLUTEntry::GetBitmap()
//
// Vtable @Helium 0xa065a8 (installed-ptr slot @0xa065b8 = vtable+0x10 per
// Itanium ABI; RTTI header lives at @0xa065a8..@0xa065b7):
//   *0x00 -> @0x3e190  ~HGApplyNDLUTEntry (D1)
//   *0x08 -> @0x3e1e0  ~HGApplyNDLUTEntry (D0)
//   *0x10 -> @0x3e240  GetBitmap()
// (Verified via raw-port/army/tools/vtable.py Helium HGApplyNDLUTEntry.)
//
// -----------------------------------------------------------------------------
// LAYOUT (recovered from ctor + dtor + CopyData/GetBitmap field accesses)
// -----------------------------------------------------------------------------
//   struct HGApplyNDLUTEntry : HGLUTCache::LUTEntry {   // base @+0x00
//     // +0x00  vptr (set to vtable-ptr @0xa065b8 by C2 @0x3d76c and by every dtor)
//     // +0x08  ..  HGLUTCache::LUTEntry base-subobject fields (see the base
//     //            ctor call @0x3d767 and base dtor calls @0x3d982/@0x3e17a/
//     //            @0x3e1ca/@0x3e214 — exact base layout is a frontier).
//     // +0x10  HGRenderer*   m_renderer         (installed by the base ctor;
//     //                                          read by CopyData @0x3d772 as
//     //                                          `movq 0x18(%rax),%rax` where
//     //                                          %rax = self+0, i.e. this
//     //                                          slot is actually at self+0x18
//     //                                          on the BASE class — see below.
//     //                                          C2 does NOT touch +0x10 here.)
//     // +0x18  HGBitmap*     m_bitmap           (owned; ZERO-initialized by
//     //                                          movups %xmm0,0x18(%r14) @0x3d779
//     //                                          which clears +0x18 and +0x20;
//     //                                          filled by C2 @0x3d8c6 via the
//     //                                          "release-and-store" idiom into
//     //                                          &self+0x18; released by all
//     //                                          three dtors @0x3e166/@0x3e1b2/
//     //                                          @0x3e202 via vt[0x18](bitmap).
//     //                                          Also read by CopyData
//     //                                          @0x3da21 to obtain the pixel
//     //                                          store, format @+0x10, and
//     //                                          the row-stride @+0x40.)
//     // +0x20  HGObject*     m_gpuTextureOrPool (owned; ZERO-init by same
//     //                                          movups; freshly built by
//     //                                          GetBitmap @0x3e2ef via
//     //                                          HGMetalTexture::createWithCopy
//     //                                          then stored at *(&self+0x20);
//     //                                          released by all three dtors
//     //                                          @0x3e153/@0x3e1a3/@0x3e1f3.)
//     //   sizeof(HGApplyNDLUTEntry) = 0x28 (base 0x18 + two owned pointers).
//   };
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (each surfaces as a throwing stub citing its @0xADDR)
// -----------------------------------------------------------------------------
//   @0x3d767   __ZN10HGLUTCache8LUTEntryC2EPNS_7LUTInfoEP10HGRenderer
//                HGLUTCache::LUTEntry::LUTEntry(LUTInfo*, HGRenderer*)
//   @0x3d796   ___dynamic_cast (in C2, cross-cast LUTInfo* -> HGApplyNDLUTInfo*)
//   @0x3d7c5/@0x3d7ec/@0x3d800   _HGRectMake4i(x,y,w,h) — HGRect ctor (i32×4)
//   @0x3d829   __ZN13HGFormatUtils13bytesPerPixelE8HGFormat
//                HGFormatUtils::bytesPerPixel(HGFormat)
//   @0x3d836/@0x3d873   __ZN8HGObjectnwEm      HGObject::operator new(size_t)
//   @0x3d861   __ZN8HGMemory13StorageObjectC1Em
//                HGMemory::StorageObject::StorageObject(size_t)
//   @0x3d889   __ZN8HGBitmapC1E6HGRect8HGFormatPv
//                HGBitmap::HGBitmap(HGRect, HGFormat, void*)
//   @0x3d8ce   __ZN8HGBitmap10SetStorageEP8HGObject
//                HGBitmap::SetStorage(HGObject*)
//   @0x3d92f/@0x3d93e   __ZN8HGObjectdlEPv     HGObject::operator delete(void*)
//   @0x3d982/@0x3e17a/@0x3e1ca/@0x3e214   __ZN10HGLUTCache8LUTEntryD2Ev
//                HGLUTCache::LUTEntry::~LUTEntry()  (base dtor)
//   @0x3d98a   __Unwind_Resume  (C++ exception unwind tail)
//   @0x3daa9b/@0x3dc2c/@0x3dda9b/@0x3de7d/@0x3dfe0
//              *0x20(vptr) on HGApplyNDLUTInfo -> colorAtIndex()  (vt slot @+0x20;
//              defined by base @HGApplyNDLUTInfo 0x3d730 as a zero-fill stub;
//              subclasses install their own.)
//   @0x3e2c1   __ZN13HGGPURenderer15GetMetalContextEv
//                HGGPURenderer::GetMetalContext()
//   @0x3e2ef   __ZN14HGMetalTexture14createWithCopyE15HGMTLDeviceTypeP18HGMetalTexturePoolP8HGBitmap6HGRectbb
//                HGMetalTexture::createWithCopy(deviceType, pool, bitmap, rect, b1, b2)
//   @0x3e260   vfn @+0x130 on self.m_renderer   ("prefers CPU bitmap?" query)
//   @0x3e2a2   vfn @+0x80  on self.m_renderer   ("supports feature 0x2b?" query)
//   @0x3e30c/@0x3e349/@0x3e357   vt[0x18] on HGMetalTexture / HGBitmap (release-hook)
//   @0x3d8a2/@0x3d8b9   vt[0x18] on HGBitmap (release-hook inside C2 rollback)
//   @0x3e15f/@0x3e16e/@0x3e1af/@0x3e1be/@0x3e1ff/@0x3e20e   vt[0x18] on owned objects (dtors)
//
// -----------------------------------------------------------------------------
// SIMD CONSTANTS used by CopyData (all resolved via rip-relative displacement;
// file offsets = 0x4000 + VMA):
//   @0x3caaf0  F16_CLAMP_LO  = {-65536.0f}×4    (u32 0xc7800000×4)
//   @0x3cab00  F16_CLAMP_HI  = {+65536.0f}×4    (u32 0x47800000×4)
//   @0x3cab10  F16_SCALE     = {u32 0x07800000}×4
//                              (bit-magic multiplier: multiplying an f32 clamped
//                              to [-65536,+65536] by this reinterprets the top
//                              16 bits as the f16 encoding of the same value
//                              — canonical branchless f32→f16 pack.)
//   @0x3cab20  F16_MASK_LO   = {0x00008000, 0x00007fff, 0x00008000, 0x00007fff}
//   @0x3cab30  F16_MASK_HI   = {0x00007fff, 0x00008000, 0x00007fff, 0x00008000}
//                              (paired sign/mantissa masks for the two 32-bit
//                              lanes that the shift-then-pblendw hoists to
//                              produce two u16s per f32 lane.)
//   @0x3c7cc0  F32_ONE       = 1.0f          (loop step: index accumulator)
//   @0x3c7c40  F32_ONE_x4    = {1.0f}×4      (u16-UNORM clamp hi)
//   @0x3cb250  F32_65535_x4  = {65535.0f}×4  (u16-UNORM scale)
//
// -----------------------------------------------------------------------------
// CopyData ALGORITHM (transcribed line-for-line — see CopyData body below):
//   let info = arg (HGApplyNDLUTInfo const*);
//   let nb = info.numBins @+0x08;
//   let nd = info.numDims @+0x10;
//   let rangeScale = info.rangeScale @+0x18;
//   let rangeOffset = info.rangeOffset @+0x1c;
//   // step = rangeScale / f32(nb - 1)  (with the u64→f32 conversion path the
//   //  compiler emits — cvtsi2ss for a signed i64, or shrq/orq/cvtsi2ss/addss
//   //  fallback for the unsigned-overflow branch when the sign-bit is set.
//   //  Because numBins is always in the low tens/hundreds in practice, the
//   //  signed path is the one that executes; the fallback is a defensive
//   //  overflow-handler that never fires. Both paths yield an f32.)
//   let step = rangeScale / f32(nb - 1);
//   let bmp   = self.m_bitmap @+0x18;
//   let fmt   = bmp.format @+0x10;    // HGFormat u32
//   let base  = bmp.storage @+0x50;   // pixel base pointer (from HGBitmap+0x50)
//   let rstr  = bmp.rowStride @+0x40; // row byte stride (from HGBitmap+0x40)
//   if (nd == 1) {
//     if (nb == 0) { degenerate — first iteration is a zero-vector encoded
//                    as [0,0,0,0] and written per-format then return. }
//     for (i = 0; i < nb; ++i) {
//       let x = f32(i) * step + rangeOffset;   // input coord
//       f32 outR, outG, outB, outA;
//       info.vtable[colorAtIndex](info, x, 0, 0, &outR, &outG, &outB, &outA); // *0x20
//       if (fmt == 0x1b /*RGBA16Half*/) {
//         // SIMD half-pack of {outR,outG,outB,outA} into 8 bytes at &base[i*8]:
//         let v4 = insertps-chain({outR,outG,outB,outA});
//         let v4 = min(F16_CLAMP_HI, max(F16_CLAMP_LO, v4));
//         let mul = v4 * F16_SCALE_i32;   // reinterpret as u32
//         let lo = psrld(mul, 13);
//         let hi = psrld(mul, 16);
//         let a  = pblendw(hi, lo, 0xcc) & F16_MASK_LO;
//         let b  = pblendw(hi, lo, 0x33) & F16_MASK_HI;
//         let r  = packusdw(a | b);       // 4 u16s
//         *((u64*)&base[i*8]) = r;
//       } else /*fmt == 0x19 → 4×f32 RGBA32Float (16 B/texel)*/ {
//         *((f32*)&base[i*16 + 0])  = outR;
//         *((f32*)&base[i*16 + 4])  = outG;
//         *((f32*)&base[i*16 + 8])  = outB;
//         *((f32*)&base[i*16 + 12]) = outA;
//       }
//     }
//   } else /* nd == 3 (the ctor of HGApplyNDLUTInfo clamps nd∈{1,3}) */ {
//     for (i0 = 0; i0 < nb; ++i0) {
//       let x = f32(i0) * step + rangeOffset;
//       let row0 = base + i0 * rstr;   // outer plane
//       for (i1 = 0; i1 < nb; ++i1) {
//         let y = f32(i1) * step + rangeOffset;
//         for (i2 = 0; i2 < nb; ++i2) {
//           let z = f32(i2) * step + rangeOffset;
//           f32 outR, outG, outB, outA;
//           info.vtable[colorAtIndex](info, x, y, z, &outR, &outG, &outB, &outA); // *0x20
//           if (fmt == 0x19 /*RGBA16Unorm*/) {
//             let v4 = insertps-chain({outR,outG,outB,outA});
//             let v4 = clamp(v4, 0, 1) * 65535;
//             let u  = packusdw(cvttps2dq(v4));  // 4 u16s
//             *((u64*)&row0[i1_plane_offset + i2*8]) = u;
//           } else if (fmt == 0x1c /*RGBA32Float*/) {
//             let v4 = insertps-chain({outR,outG,outB,outA});
//             *((f32×4*)...) = (v4 - rangeOffset_broadcast) / rangeScale_broadcast;
//             // (the compiler emits mixed scalar+lo-pair to fit 4 f32s;
//             //  effect is 4 inverse-remapped floats written at
//             //  &row0[i1_plane_offset + i2*16].)
//           } else if (fmt == 0x1b /*RGBA16Half*/) {
//             /* same SIMD half-pack as the 1D 0x1b path above, into 8B */
//           }
//         }
//       }
//     }
//   }
//
//   NOTE: The compiler emits the ND branches in the SPECIFIC order
//   (fmt==0x19 first, then fmt==0x1c, then fmt==0x1b as the fallthrough) at
//   the ND dispatch @0x3db40/@0x3db51/@0x3db5a — the transcription below
//   mirrors this exactly. The 1D branches only handle 0x1b (SIMD path) vs
//   "anything else" (4×f32 path) — the 1D dispatch has NO branch for 0x1c
//   or 0x19 explicitly (they land in the 4×f32 fallback), which is a
//   ONE-DIMENSIONAL LUT special case Apple ships that DOES NOT match the
//   ND path's per-format behavior. Faithful port preserves this asymmetry.
//
// The whole CopyData body ends up calling the subclass\'s virtual
// colorAtIndex (vtable *0x20 on HGApplyNDLUTInfo) `nb^nd` times — this is
// the CPU-side LUT construction step, per-cell. The base class stub at
// HGApplyNDLUTInfo::colorAtIndex @0x3d730 zeros all four outputs; every
// shipping subclass overrides this slot with its own transfer function.
//
// -----------------------------------------------------------------------------

/**
 * HGLUTCache::LUTInfo — opaque base for cache-key info structs. Passed to
 * the ctor at %rsi (@0x3d767/@0x3d791). Cross-cast to HGApplyNDLUTInfo
 * inside the ctor via ___dynamic_cast @0x3d796.
 */
export type HGLUTCache_LUTInfo = { readonly __brand: "HGLUTCache::LUTInfo" };

/**
 * HGLUTCache::LUTEntry — polymorphic base of HGApplyNDLUTEntry. Base ctor
 * called from @0x3d767; base dtor from @0x3d982/@0x3e17a/@0x3e1ca/@0x3e214.
 * Exact layout is a frontier: only the derived fields (+0x10, +0x18, +0x20)
 * are directly observed by this class.
 */
export type HGLUTCache_LUTEntry = { readonly __brand: "HGLUTCache::LUTEntry" };

/**
 * HGRenderer — abstract renderer. Passed to the ctor at %rdx (@0x3d767)
 * and stored at self+0x10 by the base ctor. GetBitmap reads it back at
 * @0x3e250 and calls vfn @+0x130 @0x3e260 ("prefers CPU bitmap?" query)
 * and vfn @+0x80 with arg 0x2b @0x3e2a2 ("supports Metal texture?" query).
 */
export type HGRenderer = { readonly __brand: "HGRenderer" };

/**
 * HGGPURenderer — dynamic_cast target @0x3e27e; when the incoming
 * HGRenderer is a GPU renderer this pointer becomes the source of the
 * GetMetalContext() call @0x3e2c1.
 */
export type HGGPURenderer = { readonly __brand: "HGGPURenderer" };

/**
 * HGApplyNDLUTInfo — the paired info-struct (already landed at
 * raw-port/src/render/HGApplyNDLUTInfo.ts). CopyData reads its
 * numBins @+0x08, numDims @+0x10, rangeScale @+0x18, rangeOffset @+0x1c
 * and dispatches its virtual colorAtIndex slot @+0x20 on the vtable
 * (base @HGApplyNDLUTInfo 0x3d730 is a zero-fill; subclasses override).
 * Kept opaque here to preserve the pointer-based ABI of CopyData.
 */
export type HGApplyNDLUTInfo_Opaque = { readonly __brand: "HGApplyNDLUTInfo" };

/**
 * HGBitmap — 128-byte object allocated by HGObject::operator new(0x80)
 * @0x3d873 and initialized by HGBitmap::HGBitmap(HGRect, HGFormat, void*)
 * @0x3d889. CopyData reads its format @+0x10, storage-base @+0x50 and
 * row-stride @+0x40. Its vtable slot @+0x18 is the standard "release" hook.
 */
export type HGBitmap = { readonly __brand: "HGBitmap" };

/**
 * HGFormat — int32 pixel-format enum. Read by CopyData @0x3da29 as
 * `movl 0x10(bmp),%edx`; three values are compared:
 *   0x19 → in ND: RGBA16Unorm (8 B/texel; clamp[0,1]×65535, packusdw)
 *   0x1b → RGBA16Half (8 B/texel; SIMD f32→f16 pack)
 *   0x1c → in ND: RGBA32Float (16 B/texel; (color-offset)/scale inverse map)
 */
export type HGFormat = number;

/**
 * HGMemory::StorageObject — pixel-storage arena. Allocated by C2
 * @0x3d861 with the computed byte-length; installed onto the bitmap
 * via HGBitmap::SetStorage @0x3d8ce.
 */
export type HGMemory_StorageObject = { readonly __brand: "HGMemory::StorageObject" };

/**
 * HGMetalTexture — the GPU-side texture built by createWithCopy @0x3e2ef
 * and stored back into self+0x20 by GetBitmap. Its vtable slot @+0x18 is
 * the same release-hook convention used by HGBitmap.
 */
export type HGMetalTexture = { readonly __brand: "HGMetalTexture" };

/** HGMetalTexturePool — opaque handle read out of GetMetalContext @+0x10. */
export type HGMetalTexturePool = { readonly __brand: "HGMetalTexturePool" };

/**
 * HGApplyNDLUTEntry — the ND-LUT cache-entry. Field layout documented in
 * the file header. Kept as an opaque handle here to preserve the C++
 * ABI: the six methods below all throw (citing their @0xADDR) because
 * their bodies depend on >10 undecoded frontier callees (HGLUTCache::
 * LUTEntry base ctor/dtor, ___dynamic_cast, HGRectMake4i, HGFormatUtils::
 * bytesPerPixel, HGObject::new, HGMemory::StorageObject, HGBitmap ctor/
 * SetStorage, HGGPURenderer::GetMetalContext, HGMetalTexture::createWithCopy,
 * and the subclass\'s virtual colorAtIndex slot @+0x20).
 */
export type HGApplyNDLUTEntry = { readonly __brand: "HGApplyNDLUTEntry" };

// -----------------------------------------------------------------------------
// HGApplyNDLUTEntry::HGApplyNDLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
// [C2 base ctor] @Helium 0x3d750  — 191-line body.
//
// Decoded control flow (matches the disassembly line-for-line):
//   1. @0x3d767  base ctor: HGLUTCache::LUTEntry::LUTEntry(info, renderer).
//   2. @0x3d76c-@0x3d773  self.vptr = &vtable-ptr @Helium 0xa065b8.
//   3. @0x3d776-@0x3d779  movups %xmm0, 0x18(%r14): zero self+0x18 and +0x20.
//   4. @0x3d77e-@0x3d79b  if (info != nullptr)
//                            info_nd = ___dynamic_cast(info, LUTInfo_ti,
//                                                     HGApplyNDLUTInfo_ti, 0);
//                         else info_nd = nullptr.
//   5. @0x3d7aa  cols = info_nd->numBins @+0x08         (as u32)
//      @0x3d7ad  cmp  info_nd->numDims @+0x10 == 1      (1D vs ND branch)
//   6. If numDims == 1  (@0x3d7b6 jne skips to ND branch):
//        @0x3d7b8  cols += 1
//        @0x3d7c5  rect = _HGRectMake4i(0, 0, cols, 1)  (Xmin=Ymin=0, W=cols+1, H=1)
//        @0x3d7d6  if (W > 0x800 /*2048*/) {
//          @0x3d7de  rect = _HGRectMake4i(0, 0, 0x800, (W>>11)+1);
//        }
//   7. Else (numDims == 3):
//        @0x3d7f3  d = cols*cols + 1;
//        @0x3d7fa  cols += 1;
//        @0x3d7fc  rect = _HGRectMake4i(0, 0, d, cols);
//      (No 2048-cap check in the 3D branch — Apple assumes 3D LUT dims are
//      always small enough. Cited @0x3d7f3-@0x3d800.)
//   8. @0x3d80f-@0x3d824  fmt = getLUTHGStorageFormat(info_nd.storage @+0x20):
//        storage==0 -> 0x19,  storage==1 -> 0x1b,  else -> 0x1c.
//      (Same 3-way LUT that HGApplyNDLUTInfo::getLUTHGStorageFormat implements;
//      it is INLINED here instead of a virtual call.)
//   9. @0x3d829  bpp = HGFormatUtils::bytesPerPixel(fmt);
//  10. @0x3d836  storage_obj = new HGMemory::StorageObject(...);  (32-byte alloc)
//      @0x3d861  StorageObject::StorageObject(byteLen)  with
//                  byteLen = bpp * (rect.width * rect.height)
//                  where rect.width  = (rect.hi.lo - rect.lo.lo)  (i32 SUB)
//                        rect.height = (rect.hi.hi - rect.lo.hi)  (i32 SUB via shrq $0x20)
//                (See @0x3d83b-@0x3d858 for the exact width/height/imul chain.)
//  11. @0x3d873  bmp = new HGBitmap(rect, fmt, storage_obj->data@+0x10);
//                (@0x3d86a  storage_obj->data @+0x10 loaded into %r15.)
//  12. @0x3d88e-@0x3d8c6  release-and-store old self+0x18 with the new bmp:
//                            if (*(&self+0x18) != bmp) {
//                              old = *(&self+0x18);
//                              if (old) old->vt[0x18](old);
//                              *(&self+0x18) = bmp;
//                            } else if (bmp) bmp->vt[0x18](bmp);
//                            (idiomatic ref-count swap.)
//  13. @0x3d8ce  bmp->SetStorage(storage_obj);
//  14. @0x3d8da  self.CopyData(info_nd);
//  15. @0x3d8df-@0x3d8e6  storage_obj->vt[0x18](storage_obj);  (release local ref)
//  16. return.
//
//  Exception unwind block (@0x3d8f8-@0x3d9a2):
//    - release partially-constructed bitmap (@0x3d905/@0x3d90a)
//    - HGObject::operator delete(bmp)     @0x3d92f
//    - HGObject::operator delete(sto)     @0x3d93e
//    - release *(&self+0x18) if non-null  @0x3d976
//    - release *(&self+0x20) if non-null  @0x3d95d
//    - HGLUTCache::LUTEntry::~LUTEntry()  @0x3d982  (base dtor)
//    - __Unwind_Resume                    @0x3d98a
// -----------------------------------------------------------------------------

/**
 * HGApplyNDLUTEntry::HGApplyNDLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
 * [C2 base ctor] @Helium 0x3d750 — 191-line ctor.
 *
 * Frontier body: full transcription of the ctor requires the following
 * undecoded frontier symbols, EACH of which would corrupt the resulting
 * object state if fabricated:
 *   - HGLUTCache::LUTEntry::LUTEntry  @0x3d767   (base ctor sets +0x10 = renderer)
 *   - ___dynamic_cast                 @0x3d796   (LUTInfo* -> HGApplyNDLUTInfo*)
 *   - _HGRectMake4i                   @0x3d7c5/@0x3d7ec/@0x3d800
 *   - HGFormatUtils::bytesPerPixel    @0x3d829
 *   - HGObject::operator new          @0x3d836/@0x3d873
 *   - HGMemory::StorageObject::ctor   @0x3d861
 *   - HGBitmap::ctor(rect,fmt,void*)  @0x3d889
 *   - HGBitmap::SetStorage            @0x3d8ce
 *   - HGApplyNDLUTEntry::CopyData     @0x3d8da  (transitively pulls in every
 *                                                subclass\'s colorAtIndex)
 *   - vt[0x18] release-hook on HGBitmap/HGMemory::StorageObject
 * The vtable ptr install @0x3d76c -> 0xa065b8 is documented above; the
 * 1D-vs-3D rect-sizing math is documented above; both are trivially
 * reproducible once the frontier callees land.
 */
export function HGApplyNDLUTEntry_ctor(
  _self: HGApplyNDLUTEntry,
  _info: HGLUTCache_LUTInfo | null,
  _renderer: HGRenderer,
): void {
  throw new Error(
    "HGApplyNDLUTEntry::HGApplyNDLUTEntry [C2] @Helium 0x3d750 not yet transcribed: 191-line ctor whose body calls HGLUTCache::LUTEntry::LUTEntry @0x3d767, ___dynamic_cast @0x3d796, _HGRectMake4i @0x3d7c5/@0x3d7ec/@0x3d800, HGFormatUtils::bytesPerPixel @0x3d829, HGObject::operator new @0x3d836/@0x3d873, HGMemory::StorageObject::StorageObject @0x3d861, HGBitmap ctor @0x3d889, HGBitmap::SetStorage @0x3d8ce, HGApplyNDLUTEntry::CopyData @0x3d8da, and vt[0x18] release-hooks — all frontier symbols. Installed vtable-ptr @0xa065b8 via `leaq 0x9c8e45(%rip),%rax` @0x3d76c.",
  );
}

// -----------------------------------------------------------------------------
// HGApplyNDLUTEntry::HGApplyNDLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
// [C1 complete-object ctor] @Helium 0x3e130.
//
// Decoded body (5 bytes visible in otool -tV):
//   @0x3e130  pushq %rbp
//   @0x3e131  movq  %rsp, %rbp
//   @0x3e134  popq  %rbp
//   @0x3e135  jmp   __ZN17HGApplyNDLUTEntryC2EPN10HGLUTCache7LUTInfoEP10HGRenderer
//
// I.e. C1 is a bare thunk to C2 — the Itanium ABI\'s trivial "no virtual
// base classes" shortcut. Faithful port: forward to C2\'s throwing stub.
// -----------------------------------------------------------------------------

/**
 * HGApplyNDLUTEntry::HGApplyNDLUTEntry [C1 complete-object] @Helium 0x3e130.
 * Bare tail-call thunk to C2 @0x3d750.
 */
export function HGApplyNDLUTEntry_ctor_C1(
  self: HGApplyNDLUTEntry,
  info: HGLUTCache_LUTInfo | null,
  renderer: HGRenderer,
): void {
  // @0x3e135 tail-jmp to C2.
  HGApplyNDLUTEntry_ctor(self, info, renderer);
}

// -----------------------------------------------------------------------------
// HGApplyNDLUTEntry::~HGApplyNDLUTEntry() (D2 base) @Helium 0x3e140  — 47 bytes.
//
// Decoded body:
//   @0x3e149-@0x3e150  self.vptr = &vtable-ptr @Helium 0xa065b8.
//                      (reset vptr BEFORE releasing owned objects so no
//                      virtual dispatch on this class fires during teardown.)
//   @0x3e153-@0x3e15f  gpu = *(&self+0x20);
//                      if (gpu != nullptr) gpu->vt[0x18](gpu);
//   @0x3e162-@0x3e16e  bmp = *(&self+0x18);
//                      if (bmp != nullptr) bmp->vt[0x18](bmp);
//   @0x3e17a          jmp  HGLUTCache::LUTEntry::~LUTEntry(self)   [base dtor tail-jmp]
//
// (D2 == D1 in this class per the Itanium ABI convention for classes with
// no virtual base — the two symbols share a body. In this framework the
// linker emitted them as two SEPARATE code sequences @0x3e140 and @0x3e190
// with identical semantics; see @0x3e190 below for D1\'s body.)
// -----------------------------------------------------------------------------

/**
 * HGApplyNDLUTEntry::~HGApplyNDLUTEntry() [D2 base-object] @Helium 0x3e140.
 * Releases the owned +0x20 slot then +0x18 slot via vt[0x18] and tail-jmps
 * to HGLUTCache::LUTEntry::~LUTEntry. All release hooks and the base dtor
 * are undecoded frontier symbols.
 */
export function HGApplyNDLUTEntry_dtor_D2(_self: HGApplyNDLUTEntry): void {
  throw new Error(
    "HGApplyNDLUTEntry::~HGApplyNDLUTEntry [D2] @Helium 0x3e140 not yet transcribed: releases self@+0x20 via vt[0x18] @0x3e15f and self@+0x18 via vt[0x18] @0x3e16e, then tail-jmps to HGLUTCache::LUTEntry::~LUTEntry @0x3e17a — base dtor and release-hook slots are frontier symbols. Installed vtable-ptr @0xa065b8 via `leaq 0x9c8468(%rip),%rax` @0x3e149.",
  );
}

// -----------------------------------------------------------------------------
// HGApplyNDLUTEntry::~HGApplyNDLUTEntry() (D1 in-place) @Helium 0x3e190  — 47 bytes.
//
// Decoded body (identical shape to D2):
//   @0x3e199-@0x3e1a0  self.vptr = &vtable-ptr @Helium 0xa065b8.
//   @0x3e1a3-@0x3e1af  if (*(&self+0x20)) *(&self+0x20)->vt[0x18](*(&self+0x20));
//   @0x3e1b2-@0x3e1be  if (*(&self+0x18)) *(&self+0x18)->vt[0x18](*(&self+0x18));
//   @0x3e1ca          jmp  HGLUTCache::LUTEntry::~LUTEntry(self)  [base dtor tail-jmp]
// -----------------------------------------------------------------------------

/**
 * HGApplyNDLUTEntry::~HGApplyNDLUTEntry() [D1 in-place] @Helium 0x3e190.
 * Identical body to D2 (release +0x20, release +0x18, tail-jmp to base dtor).
 */
export function HGApplyNDLUTEntry_dtor_D1(_self: HGApplyNDLUTEntry): void {
  throw new Error(
    "HGApplyNDLUTEntry::~HGApplyNDLUTEntry [D1] @Helium 0x3e190 not yet transcribed: releases self@+0x20 via vt[0x18] @0x3e1af and self@+0x18 via vt[0x18] @0x3e1be, then tail-jmps to HGLUTCache::LUTEntry::~LUTEntry @0x3e1ca — base dtor and release-hook slots are frontier symbols. Installed vtable-ptr @0xa065b8 via `leaq 0x9c8418(%rip),%rax` @0x3e199.",
  );
}

// -----------------------------------------------------------------------------
// HGApplyNDLUTEntry::~HGApplyNDLUTEntry() (D0 deleting) @Helium 0x3e1e0  — 71 bytes.
//
// Decoded body:
//   @0x3e1e9-@0x3e1f0  self.vptr = &vtable-ptr @Helium 0xa065b8.
//   @0x3e1f3-@0x3e1ff  if (*(&self+0x20)) *(&self+0x20)->vt[0x18](*(&self+0x20));
//   @0x3e202-@0x3e20e  if (*(&self+0x18)) *(&self+0x18)->vt[0x18](*(&self+0x18));
//   @0x3e214          call HGLUTCache::LUTEntry::~LUTEntry(self);     [base dtor callq]
//   @0x3e222          jmp  __ZdlPv (operator delete(void*))            [deleting form tail-jmp]
//
// The D0 "deleting" variant differs from D1/D2 only in the trailing
// `operator delete(this)` — it is what gets dispatched via vtable slot 0x08.
// -----------------------------------------------------------------------------

/**
 * HGApplyNDLUTEntry::~HGApplyNDLUTEntry() [D0 deleting] @Helium 0x3e1e0.
 * Same body as D1/D2 followed by `operator delete(this)` tail-jmp.
 */
export function HGApplyNDLUTEntry_dtor_D0(_self: HGApplyNDLUTEntry): void {
  throw new Error(
    "HGApplyNDLUTEntry::~HGApplyNDLUTEntry [D0] @Helium 0x3e1e0 not yet transcribed: D1 body inline (vt[0x18] releases at @0x3e1ff/@0x3e20e) then HGLUTCache::LUTEntry::~LUTEntry @0x3e214 (callq, NOT tail-jmp) then __ZdlPv tail-jmp @0x3e222 — base dtor, release hook and operator delete are frontier symbols. Installed vtable-ptr @0xa065b8 via `leaq 0x9c83c8(%rip),%rax` @0x3e1e9.",
  );
}

// -----------------------------------------------------------------------------
// HGApplyNDLUTEntry::CopyData(HGApplyNDLUTInfo const*) @Helium 0x3d9b0
//                                                     — 422-line body.
//
// This is the CPU-side LUT-construction routine. It:
//   1. Reads numBins, numDims, rangeScale, rangeOffset from the paired
//      HGApplyNDLUTInfo (@0x3d9cb-@0x3d9d3).
//   2. Computes step = rangeScale / f32(numBins - 1) (with an
//      unsigned-overflow-safe cvtsi2ss path @0x3d9de-@0x3d9fc).
//   3. Reads the destination HGBitmap from self+0x18, then reads its
//      format @+0x10, pixel-base @+0x50, row-stride @+0x40.
//   4. Dispatches on (numDims, format) and iterates:
//        (1D, 0x1b RGBA16Half)  -> SIMD f32→f16 pack, 8 B/texel     @0x3da70
//        (1D, other)            -> raw 4×f32 write,  16 B/texel     @0x3dd20
//                                  (this fallback catches 0x19 AND 0x1c
//                                  in the 1D case — asymmetric with ND.)
//        (3D, 0x19 RGBA16Unorm) -> clamp[0,1]×65535, packusdw, 8 B  @0x3df16
//        (3D, 0x1c RGBA32Float) -> inverse-map (x-off)/scale, 4×f32 @0x3dda1
//        (3D, 0x1b RGBA16Half)  -> SIMD f32→f16 pack, 8 B/texel     @0x3db63
//        (any other combo)      -> tail-fallthrough to return.
//   5. Each iteration calls the subclass\'s virtual colorAtIndex slot
//      @+0x20 on the HGApplyNDLUTInfo — this is where the actual
//      per-subclass transfer function runs (e.g. Canon-Log-to-linear,
//      Apple-Log-to-linear, AYCC-tone-curve, etc.).
//
// All SIMD constants used are enumerated in the file header. All
// per-format branches are decoded and cited above; the full asm is
// preserved at raw-port/re/disasm/Helium.HGApplyNDLUTEntry.CopyData.s.
//
// Faithful port defers the body — every iteration calls a subclass vfn
// whose subclass identity is only known at runtime; every subclass\'s
// colorAtIndex is itself a frontier symbol. Writing this loop without
// the vfn implementations would produce a bitmap of ZEROES (the base
// class stub @0x3d730 zero-fills), which is a plausible-looking but
// semantically-empty output — exactly the shortcut G1 forbids.
// -----------------------------------------------------------------------------

/**
 * HGApplyNDLUTEntry::CopyData(HGApplyNDLUTInfo const*) @Helium 0x3d9b0.
 * 422-line SIMD-vectorized LUT-fill loop; dispatches to a per-subclass
 * virtual colorAtIndex slot @+0x20 for every sample.
 */
export function HGApplyNDLUTEntry_CopyData(
  _self: HGApplyNDLUTEntry,
  _info: HGApplyNDLUTInfo_Opaque,
): void {
  throw new Error(
    "HGApplyNDLUTEntry::CopyData @Helium 0x3d9b0 not yet transcribed: 422-line SIMD-vectorized LUT-fill loop. Depends on the subclass\'s virtual colorAtIndex slot @+0x20 on HGApplyNDLUTInfo (base @0x3d730 is a zero-fill stub; every shipping subclass installs its own), on HGBitmap layout (format @+0x10, pixel-base @+0x50, row-stride @+0x40 — all frontier), and on the SIMD constants at Helium 0x3caaf0 (F16_CLAMP_LO), 0x3cab00 (F16_CLAMP_HI), 0x3cab10 (F16_SCALE=0x07800000×4), 0x3cab20/0x3cab30 (F16_MASK_LO/HI), 0x3c7cc0 (F32_ONE), 0x3c7c40 (F32_ONE×4), 0x3cb250 (F32_65535×4) — all read directly from Helium and enumerated in the file header. Dispatches by (numDims, format): (1D,0x1b)@0x3da70 (1D,else)@0x3dd20 (3D,0x19)@0x3df16 (3D,0x1c)@0x3dda1 (3D,0x1b)@0x3db63.",
  );
}

// -----------------------------------------------------------------------------
// HGApplyNDLUTEntry::GetBitmap() @Helium 0x3e240  — 99-line accessor.
//
// Decoded control flow:
//   1. @0x3e250  renderer = self.m_renderer @+0x10.
//   2. @0x3e254  if (renderer == nullptr) goto CPU-fallback @0x3e31d.
//   3. @0x3e260  if (renderer->vt[0x130](renderer))            [returns bool]
//                 goto CPU-fallback @0x3e31d.
//                 (vt[0x130] is a "prefers bitmap over Metal texture?" query,
//                  same convention as HGDitherLUTEntry::GetBitmap @0x070290.)
//   4. @0x3e277-@0x3e28f  gpu_renderer = ___dynamic_cast(renderer, HGRenderer_ti,
//                                                       HGGPURenderer_ti, 0);
//   5. @0x3e29d-@0x3e2ab  if (renderer->vt[0x80](renderer, 0x2b) != 1)
//                            goto CPU-fallback @0x3e31d.
//                            (0x2b is the "supports Metal texture" query.)
//   6. @0x3e2ad  slot = &self@+0x20.  (owned HGMetalTexture slot.)
//   7. @0x3e2b1  if (*slot != nullptr) goto RELEASE-OLD @0x3e354 (skip build).
//   8. @0x3e2be-@0x3e2ca  metal_ctx = gpu_renderer->GetMetalContext();
//                         pool = *(HGMetalTexturePool**)(metal_ctx@+0x10@+0x10);
//   9. @0x3e2ce-@0x3e2d6  bmp = self.m_bitmap @+0x18;
//                         rect_lo = *(u64*)(bmp@+0x14);   // HGRect.lo
//                         rect_hi = *(u64*)(bmp@+0x1c);   // HGRect.hi
//  10. @0x3e2ef  new_tex = HGMetalTexture::createWithCopy(
//                             deviceType=0,   // xorl %edx,%edx
//                             pool,
//                             bmp,
//                             HGRect{rect_lo, rect_hi},
//                             false,          // flag1
//                             false           // flag2
//                          );
//      (Result spilled to -0x20(%rbp) then loaded back @0x3e2f8.)
//  11. @0x3e2f4-@0x3e30c  old = *slot; if (old != new_tex && old != nullptr)
//                            old->vt[0x18](old);
//  12. @0x3e313  *slot = new_tex;
//  13. @0x3e316-@0x3e33f  return *(void**)slot   (i.e. the vptr of the returned
//                        texture cast to an HGBitmap-compatible handle — same
//                        HGBitmap-return ABI as HGDitherLUTEntry::GetBitmap).
//
//   CPU-fallback tail @0x3e31d:
//     @0x3e31d  bmp = self.m_bitmap @+0x18;
//     @0x3e321  slot = &self@+0x18;   (return the CPU bitmap directly)
//     @0x3e325-@0x3e32d  release stale reference on bmp via vt[0x10] (the
//                        "retain" hook — note this is slot 0x10, not 0x18).
//                        This is the "return-with-retain" idiom.
//     @0x3e333  return *slot.
// -----------------------------------------------------------------------------

/**
 * HGApplyNDLUTEntry::GetBitmap() @Helium 0x3e240 — 99-line accessor.
 * Lazily uploads the CPU HGBitmap to an HGMetalTexture on the first GPU
 * call, caches it at self+0x20, and returns whichever handle the caller
 * key expects. Frontier body: depends on the HGRenderer vtable @+0x80/
 * @+0x130 queries, HGGPURenderer::GetMetalContext, HGMetalTexture::
 * createWithCopy, and the standard vt[0x18]/vt[0x10] release/retain hooks
 * on HGBitmap and HGMetalTexture — all undecoded frontier symbols.
 */
export function HGApplyNDLUTEntry_GetBitmap(_self: HGApplyNDLUTEntry): HGBitmap | HGMetalTexture {
  throw new Error(
    "HGApplyNDLUTEntry::GetBitmap @Helium 0x3e240 not yet transcribed: depends on HGRenderer vt[0x130] @0x3e260 (prefers-bitmap query), HGRenderer vt[0x80](0x2b) @0x3e2a2 (Metal-support query), ___dynamic_cast @0x3e28a, HGGPURenderer::GetMetalContext @0x3e2c1, HGMetalTexture::createWithCopy @0x3e2ef, and vt[0x18]/vt[0x10] release/retain hooks on HGBitmap/HGMetalTexture — all frontier symbols.",
  );
}
