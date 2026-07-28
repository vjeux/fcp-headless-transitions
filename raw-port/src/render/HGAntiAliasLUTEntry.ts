// HGAntiAliasLUTEntry.ts — Helium's cache-entry class that produces the two
// hard-coded lookup textures used by FCP's anti-aliased curve rasterizer
// (a signed-distance-field style AA lookup). One cache entry owns a CPU
// HGBitmap and (lazily, on GPU renderers) a matching HGMetalTexture uploaded
// via HGRenderUtils::BufferCopier / HGMetalTexture::createWithCopy.
//
// Verbatim from FCP's Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// FOUR EXPORTED SYMBOLS (nm -arch x86_64):
//   @Helium 0x0000000000211d80  HGAntiAliasLUTEntry::HGAntiAliasLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)  (C2)
//   @Helium 0x0000000000211fd0  HGAntiAliasLUTEntry::~HGAntiAliasLUTEntry()  (D1, in-place)
//   @Helium 0x0000000000212020  HGAntiAliasLUTEntry::~HGAntiAliasLUTEntry()  (D0, deleting)
//   @Helium 0x0000000000212080  HGAntiAliasLUTEntry::GetBitmap()
//
// Source disassembly (this worktree, raw-port/re/disasm/):
//   Helium.HGAntiAliasLUTEntry.HGAntiAliasLUTEntry.s
//   Helium.HGAntiAliasLUTEntry.~HGAntiAliasLUTEntry.s     (D0 body @0x212020)
//   Helium.HGAntiAliasLUTEntry.GetBitmap.s
// (D1 body @0x211fd0 was extracted directly from /tmp/Helium_tV.txt on this
//  worktree — a routine field-teardown+tail-call-to-parent-dtor pattern.)
//
// Symbol facts from HGAntiAliasLUTEntryFactory's already-ported analysis
// (raw-port/src/render/HGAntiAliasLUTEntryFactory.ts): the factory allocates
// exactly 0x28 = 40 bytes then hands the block to the C2 ctor here — so
// sizeof(HGAntiAliasLUTEntry) == 40 bytes total, of which the LUTCache::
// LUTEntry base occupies the first 0x18 bytes (vptr + two owned pointers).
//
// -- STRUCT LAYOUT (recovered from all four bodies) ------------------------
//   offset  size  field           comments
//   ------  ----  --------------  -------------------------------------------
//   +0x00   0x08  vptr : void*    Installed by C2 ctor as
//                                  &(__ZTV19HGAntiAliasLUTEntry + 0x10) at
//                                  0x211d9c/0x211da3 (leaq 0x81d8c5(%rip),%rax
//                                  ; movq %rax,(%rbx)). Overwrites the vptr
//                                  that HGLUTCache::LUTEntry's ctor put there.
//   +0x08   0x08  <LUTEntry base> HGLUTCache::LUTEntry data, opaque to us
//                                  (owned+released by LUTEntry ctor/dtor).
//   +0x10   0x08  <LUTEntry base> HGLUTCache::LUTEntry data — HGRenderer*
//                                  slot: GetBitmap does `movq 0x10(%rdi),%rdi`
//                                  and treats the loaded pointer as an
//                                  HGRenderer* on which it calls a virtual
//                                  method and then dynamic_cast<HGGPURenderer*>.
//   +0x18   0x08  cpuBitmap : HGBitmap*
//                                  The CPU-side LUT bitmap constructed in the
//                                  C2 ctor from `areaTexBytes`/`searchTexBytes`
//                                  via BufferCopier. `movups %xmm0,0x18(%rbx)`
//                                  at 0x211da9 zero-initialises this slot AND
//                                  +0x20 before the actual assignment happens.
//   +0x20   0x08  gpuTexture : HGMetalTexture* (may be null)
//                                  Lazily populated by GetBitmap when the
//                                  owning renderer is an HGGPURenderer.
//   sizeof                = 0x28 = 40 bytes (matches factory's `movl $0x28,%edi`).
//
// -- HARD-CODED LUT DATA SYMBOLS (Helium __DATA_CONST) ---------------------
//   __ZL12areaTexBytes    @Helium 0x7b2bc4  size = 0x7de7c4 - 0x7b2bc4
//                                            = 179200 bytes = 160 * 560 * 2
//                         -> 160x560 pixels @ 2 bytes/pixel (HGFormat code 0xa).
//   __ZL14searchTexBytes  @Helium 0x7de7c4  bytes = 66 * 33 (fits well before
//                                            the next symbol @0x7df188).
//                         ->  66x33 pixels @ 1 byte/pixel (HGFormat code 0x1).
// (Symbol locations from `nm -arch x86_64 Helium`.)
//
// -- SHAPE-KIND CONSTANTS (float32 literals in Helium __TEXT/__cstring pool)
//   @Helium 0x8600a4  0x43200000 = 160.0f     — areaBitmap.width  (kind==0)
//   @Helium 0x8600a8  0x440c0000 = 560.0f     — areaBitmap.height (kind==0)
//   @Helium 0x8600a0  0x42840000 =  66.0f     — searchBitmap.width  (kind==1)
//   @Helium 0x860098  0x42040000 =  33.0f     — searchBitmap.height (kind==1)
// These are loaded by RIP-relative `movss` at 0x211dee/0x211df6 (area) and
// 0x211e22/0x211e2a (search), then handed to `_HGRectMake4f(0,0,w,h)`.
//
// -- FRONTIER CALLEES (all decode-don't-fit-throw stubs) -------------------
//   @Helium 0x211d97  __ZN10HGLUTCache8LUTEntryC2EPNS_7LUTInfoEP10HGRenderer
//                     HGLUTCache::LUTEntry::LUTEntry(LUTInfo*, HGRenderer*)
//   @Helium 0x211dcc  ___dynamic_cast                    (Itanium ABI runtime)
//   @Helium 0x211e04  _HGRectMake4f                       (ported — HGRect.ts)
//   @Helium 0x211e38  _HGRectMake4f                       (ported — HGRect.ts)
//   @Helium 0x211e56  _HGRectNull                         (ported — HGRect.ts)
//   @Helium 0x211e71  __ZN8HGObjectnwEm                   HGObject::operator new(size_t)
//   @Helium 0x211e85  __ZN8HGBitmapC1E6HGRect8HGFormat    HGBitmap::HGBitmap(HGRect, HGFormat)
//   @Helium 0x211ed6  __ZN8HGBitmapC1E6HGRect8HGFormatPv  HGBitmap::HGBitmap(HGRect, HGFormat, void*)
//   @Helium 0x211edf  __ZN13HGRenderUtils12BufferCopierC1Ev   BufferCopier ctor
//   @Helium 0x211ef2  __ZN13HGRenderUtils12BufferCopier7executeEP8HGBitmapS2_
//                     HGRenderUtils::BufferCopier::execute(HGBitmap* dst, HGBitmap* src)
//   @Helium 0x211efb  __ZN13HGRenderUtils12BufferCopierD1Ev   BufferCopier dtor
//   @Helium 0x211fb0  __ZN10HGLUTCache8LUTEntryD2Ev       HGLUTCache::LUTEntry::~LUTEntry() (base D2)
//   @Helium 0x21200a  __ZN10HGLUTCache8LUTEntryD2Ev       (D1 tail-call to base D2)
//   @Helium 0x212062  __ZdlPv                              operator delete(void*)
//   @Helium 0x2120a0  vtable slot *0x130 on HGRenderer     (kind/gpu-availability query)
//   @Helium 0x2120ca  ___dynamic_cast   HGRenderer -> HGGPURenderer
//   @Helium 0x2120e2  vtable slot *0x80 on HGRenderer with esi=0x2b (backend-id query;
//                                                    "== 1" means Metal GPU path)
//   @Helium 0x212101  __ZN13HGGPURenderer15GetMetalContextEv  HGGPURenderer::GetMetalContext()
//   @Helium 0x21212f  __ZN14HGMetalTexture14createWithCopyE15HGMTLDeviceTypeP18HGMetalTexturePoolP8HGBitmap6HGRectbb
//                     HGMetalTexture::createWithCopy(HGMTLDeviceType, HGMetalTexturePool*,
//                                                    HGBitmap*, HGRect, bool, bool)
//   vtable *0x10 (add-ref) and *0x18 (release) on HGBitmap/HGMetalTexture — used all over
//     GetBitmap and both destructors to refcount the returned/owned image resources.
//
// Reused ports:
//   HGRect / HGRectMake4f / HGRectNull  — raw-port/src/render/HGRect.ts
//
// EVERY frontier callee is un-ported. This class's bodies unavoidably route
// through them. Per PORTING_SPEC.md we transcribe the *structure* faithfully
// and throw at each undecoded frontier — the throws are the demand signal
// naming the next work items.

import { HGRect, HGRectMake4f, HGRectNull } from "./HGRect";

// -- OPAQUE FORWARD-DECLARATIONS -------------------------------------------
// The five Helium classes touched here are each their own future task-queue
// entry. We surface them as nominally-branded opaque handles so signatures
// are legible without pulling their (still-un-decoded) machinery into scope.

/** Opaque handle to Helium's HGLUTCache::LUTInfo (nested inside HGLUTCache).
 *  Ported separately. */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

/** Opaque handle to Helium's HGRenderer. Ported separately. */
export interface HGRenderer {
  readonly __brand_HGRenderer: unique symbol;
}

/** Opaque handle to Helium's HGBitmap. Ported separately. */
export interface HGBitmap {
  readonly __brand_HGBitmap: unique symbol;
}

/** Opaque handle to Helium's HGMetalTexture. Ported separately. Some GetBitmap
 *  callers store this back into +0x20 as an HGBitmap-shaped resource; the
 *  underlying refcount interface (vtable *0x10 add-ref / *0x18 release) is
 *  common between HGBitmap and HGMetalTexture, which is why FCP casts freely
 *  between them at this layer. */
export interface HGMetalTexture {
  readonly __brand_HGMetalTexture: unique symbol;
}

/** Opaque handle to HGAntiAliasLUTInfo — the concrete LUTInfo subclass that
 *  carries the "shape kind" byte at +0x08 (0 = area LUT, 1 = search LUT).
 *  The ctor `dynamic_cast<HGAntiAliasLUTInfo*>(info)` at 0x211dcc is the only
 *  way this class is observed. Ported separately. */
export interface HGAntiAliasLUTInfo {
  readonly __brand_HGAntiAliasLUTInfo: unique symbol;
  /** @Helium 0x211de2 `movl 0x8(%rax),%eax` — the u32 field at offset +0x08
   *  is compared against 1 (search) and 0 (area); everything else yields the
   *  degenerate `HGRectNull`+no-data path. */
  readonly shapeKind: number;
}

// -- FRONTIER STUBS --------------------------------------------------------

/** @Helium 0x211d97 __ZN10HGLUTCache8LUTEntryC2EPNS_7LUTInfoEP10HGRenderer —
 *  HGLUTCache::LUTEntry::LUTEntry(LUTInfo*, HGRenderer*). Base-class ctor
 *  that populates the first 0x18 bytes of the object (vptr + two owned
 *  pointers). Not yet ported. */
function HGLUTCache_LUTEntry_C2_stub(
  _self: HGAntiAliasLUTEntry,
  _info: HGLUTCache_LUTInfo,
  _renderer: HGRenderer,
): void {
  throw new Error(
    "HGLUTCache::LUTEntry::LUTEntry(LUTInfo*, HGRenderer*) @Helium 0x211d97 " +
      "is not yet ported — port the HGLUTCache::LUTEntry base class in its " +
      "own task entry to lift this frontier.",
  );
}

/** @Helium 0x211fb0 / 0x21200a __ZN10HGLUTCache8LUTEntryD2Ev —
 *  HGLUTCache::LUTEntry::~LUTEntry(). Base-class destructor tail-called by
 *  our D1. Not yet ported. */
function HGLUTCache_LUTEntry_D2_stub(_self: HGAntiAliasLUTEntry): void {
  throw new Error(
    "HGLUTCache::LUTEntry::~LUTEntry() @Helium 0x211fb0 is not yet ported.",
  );
}

/** @Helium 0x211dcc / 0x2120ca ___dynamic_cast (Itanium ABI RTTI runtime).
 *  We can't reimplement Itanium RTTI in JS; consumers should refactor to
 *  pass the already-typed subclass instead. Throwing is the demand signal
 *  that whoever calls this class needs to be redesigned to avoid RTTI. */
function itanium_dynamic_cast_stub<T>(
  _obj: unknown,
  _srcTypeInfo: string,
  _dstTypeInfo: string,
): T | null {
  throw new Error(
    "___dynamic_cast @Helium 0x211dcc/0x2120ca is not yet ported — Itanium " +
      "RTTI is not reimplemented in the TS port. Refactor call sites to pass " +
      "the already-typed HGAntiAliasLUTInfo / HGGPURenderer directly.",
  );
}

/** @Helium 0x211e71 __ZN8HGObjectnwEm — HGObject::operator new(size_t).
 *  Custom heap allocator for the HGObject family. Not yet ported. */
function HGObject_operator_new_stub(_size: number): HGBitmap {
  throw new Error(
    "HGObject::operator new(size_t) @Helium 0x211e71 is not yet ported.",
  );
}

/** @Helium 0x211e85 __ZN8HGBitmapC1E6HGRect8HGFormat —
 *  HGBitmap::HGBitmap(HGRect, HGFormat). Not yet ported. */
function HGBitmap_C1_rect_fmt_stub(
  _self: HGBitmap,
  _rect: HGRect,
  _fmt: number,
): void {
  throw new Error(
    "HGBitmap::HGBitmap(HGRect, HGFormat) @Helium 0x211e85 is not yet ported.",
  );
}

/** @Helium 0x211ed6 __ZN8HGBitmapC1E6HGRect8HGFormatPv —
 *  HGBitmap::HGBitmap(HGRect, HGFormat, void* data). Wraps external pixel
 *  data without copying. Not yet ported. */
function HGBitmap_C1_rect_fmt_data_stub(
  _self: HGBitmap,
  _rect: HGRect,
  _fmt: number,
  _data: Uint8Array,
): void {
  throw new Error(
    "HGBitmap::HGBitmap(HGRect, HGFormat, void*) @Helium 0x211ed6 is not yet ported.",
  );
}

/** @Helium 0x211edf / 0x211ef2 / 0x211efb — HGRenderUtils::BufferCopier
 *  {C1, execute, D1}. Ports the "copy pixels between two HGBitmaps" utility.
 *  Not yet ported. */
function HGRenderUtils_BufferCopier_run_stub(
  _dst: HGBitmap,
  _src: HGBitmap,
): void {
  throw new Error(
    "HGRenderUtils::BufferCopier::{C1,execute,D1} @Helium 0x211edf..0x211efb " +
      "are not yet ported.",
  );
}

/** @Helium 0x2120a0 vtable slot *0x130 on HGRenderer — returns a bool. The
 *  early-out on `testb %al; jne end` means "true" ⇒ take the CPU-only path
 *  (return self+0x18 directly without touching +0x20). Semantic name from
 *  context is `IsCPUOnly()` / `PrefersCPUOutput()`. Not yet ported. */
function HGRenderer_vtable_0x130_prefersCPU_stub(_r: HGRenderer): boolean {
  throw new Error(
    "HGRenderer::<vtable *0x130 (CPU-preferred query)> @Helium 0x2120a0 is not yet ported.",
  );
}

/** @Helium 0x2120e2 vtable slot *0x80 on HGRenderer with `esi = 0x2b`. Returns
 *  an integer backend-kind; the GPU path proceeds only when it equals 1
 *  (`cmpl $0x1,%eax; jne end`). Semantically `QueryBackendKind(query=0x2b)`
 *  where 0x2b (43) is the "Metal GPU backend" query id. Not yet ported. */
function HGRenderer_vtable_0x80_backendKind_stub(
  _r: HGRenderer,
  _queryId: number,
): number {
  throw new Error(
    "HGRenderer::<vtable *0x80 (backend-kind query id=0x2b)> @Helium 0x2120e2 " +
      "is not yet ported.",
  );
}

/** @Helium 0x212101 __ZN13HGGPURenderer15GetMetalContextEv —
 *  HGGPURenderer::GetMetalContext(). Returns an opaque MetalContext pointer
 *  whose +0x10 field is a MetalDevice pointer, whose +0x10 field is the
 *  HGMetalTexturePool*. Not yet ported. */
function HGGPURenderer_GetMetalContext_stub(_r: HGRenderer): {
  readonly texturePool: unknown;
} {
  throw new Error(
    "HGGPURenderer::GetMetalContext() @Helium 0x212101 is not yet ported.",
  );
}

/** @Helium 0x21212f __ZN14HGMetalTexture14createWithCopyE15HGMTLDeviceTypeP18HGMetalTexturePoolP8HGBitmap6HGRectbb —
 *  HGMetalTexture::createWithCopy(HGMTLDeviceType, HGMetalTexturePool*,
 *  HGBitmap*, HGRect, bool, bool). Uploads the CPU HGBitmap to a fresh
 *  HGMetalTexture. Not yet ported. */
function HGMetalTexture_createWithCopy_stub(
  _deviceType: number,
  _pool: unknown,
  _src: HGBitmap,
  _rect: HGRect,
  _flag1: boolean,
  _flag2: boolean,
): HGMetalTexture {
  throw new Error(
    "HGMetalTexture::createWithCopy(...) @Helium 0x21212f is not yet ported.",
  );
}

/** vtable *0x10 (add-ref/retain) on the HGBitmap/HGMetalTexture family.
 *  Called at 0x21216a and 0x212197 in GetBitmap to retain the returned image
 *  before handing it back to the caller. Not yet ported. */
function HGImage_vtable_0x10_addRef_stub(_img: HGBitmap | HGMetalTexture): void {
  throw new Error(
    "HGBitmap/HGMetalTexture::<vtable *0x10 (retain)> is not yet ported.",
  );
}

/** vtable *0x18 (release) on the HGBitmap/HGMetalTexture family. Called from
 *  every teardown path (D0/D1 field-teardown, GetBitmap's temporary bitmap
 *  cleanup, and the ctor's exception-cleanup path). Not yet ported. */
function HGImage_vtable_0x18_release_stub(
  _img: HGBitmap | HGMetalTexture,
): void {
  throw new Error(
    "HGBitmap/HGMetalTexture::<vtable *0x18 (release)> is not yet ported.",
  );
}

/** @Helium 0x212062 __ZdlPv — operator delete(void*). Frees the heap block.
 *  In JS there is no explicit free; we mark the object as unusable. */
function operator_delete_stub(_ptr: HGAntiAliasLUTEntry): void {
  // No TS-side action possible; matches the ABI's `jmp __ZdlPv` tail-call.
}

// -- HARD-CODED LUT DATA (Helium __DATA_CONST) -----------------------------
// These are the actual bytes shipped inside the Helium framework binary. We
// don't yet copy the raw 179200-byte area LUT and 2178-byte search LUT into
// the port — that would inline megabytes of proprietary FCP content into the
// repo. When a caller triggers `new HGAntiAliasLUTEntry(...)` with a decoded
// backend that can consume the data, load the tables from the Helium binary
// at these offsets. See PORTING_SPEC.md — data-table extraction is a separate
// task from method transcription.

/** @Helium 0x7b2bc4 __ZL12areaTexBytes — 160x560 pixels, 2 bytes/pixel
 *  (HGFormat code 0xa), 179200 bytes total. Not yet extracted from binary. */
function loadAreaTexBytes_stub(): Uint8Array {
  throw new Error(
    "areaTexBytes @Helium 0x7b2bc4 (160x560x2 = 179200 bytes) is not yet " +
      "extracted from the Helium binary. Table lives in Helium __DATA_CONST; " +
      "extract with `xxd -s $((0x7b2bc4+0x4000)) -l 179200 Helium`.",
  );
}

/** @Helium 0x7de7c4 __ZL14searchTexBytes — 66x33 pixels, 1 byte/pixel
 *  (HGFormat code 0x1), 2178 bytes total. Not yet extracted from binary. */
function loadSearchTexBytes_stub(): Uint8Array {
  throw new Error(
    "searchTexBytes @Helium 0x7de7c4 (66x33x1 = 2178 bytes) is not yet " +
      "extracted from the Helium binary. Table lives in Helium __DATA_CONST.",
  );
}

// -- HGAntiAliasLUTEntry ---------------------------------------------------

/**
 * HGAntiAliasLUTEntry — an HGLUTCache-owned cache entry that holds the CPU
 * bitmap (and optionally its GPU upload) for one of Helium's anti-alias LUTs.
 * The concrete kind (0 = 160x560 "area" LUT, 1 = 66x33 "search" LUT,
 * anything-else = degenerate null-rect entry) is selected at construction
 * time by dynamic-casting the passed-in LUTInfo to HGAntiAliasLUTInfo and
 * reading its `shapeKind` field (u32 @ +0x08 of the LUTInfo).
 *
 * Layout (see file header for the recovery trace):
 *   +0x00 vptr
 *   +0x08 <LUTEntry base slot 0>
 *   +0x10 <LUTEntry base slot 1 — HGRenderer*>
 *   +0x18 cpuBitmap : HGBitmap*
 *   +0x20 gpuTexture : HGMetalTexture* (lazy, from GetBitmap)
 *   sizeof = 40 bytes
 */
export class HGAntiAliasLUTEntry {
  /** Nominal brand — makes this class type-distinct from unrelated opaque
   *  handles that happen to share its shape. Not written to at runtime; the
   *  `declare` keyword ensures TS emits no field initialisation. */
  declare readonly __brand_HGAntiAliasLUTEntry: "HGAntiAliasLUTEntry";

  /** +0x08 — opaque base-class slot 0 (owned by HGLUTCache::LUTEntry). */
  private _baseSlot0: unknown = null;
  /** +0x10 — HGRenderer* owned by the LUTEntry base. GetBitmap reads this. */
  private _renderer: HGRenderer | null = null;
  /** +0x18 — the CPU HGBitmap for this LUT (may be null on the degenerate
   *  path when the LUTInfo doesn't dynamic_cast to HGAntiAliasLUTInfo). */
  private _cpuBitmap: HGBitmap | null = null;
  /** +0x20 — lazily-uploaded HGMetalTexture cache. Populated by GetBitmap
   *  the first time it is called on a GPU renderer that reports backend-kind
   *  1 for query 0x2b. */
  private _gpuTexture: HGMetalTexture | null = null;

  /**
   * C2 constructor — HGAntiAliasLUTEntry::HGAntiAliasLUTEntry(LUTInfo*, HGRenderer*)
   *   @Helium 0x0000000000211d80 .. 0x0000000000211f1d
   *
   * Faithful decode of the x86_64 disassembly. Structure:
   *
   *   0x211d80: prologue, %rbx = this, %r15 = info
   *   0x211d97: callq HGLUTCache::LUTEntry::LUTEntry(this, info, renderer)
   *             — base-class ctor populates +0x00..+0x17.
   *   0x211d9c: leaq 0x81d8c5(%rip),%rax; movq %rax,(%rbx)
   *             — overwrite +0x00 vptr with our own vtable
   *               (__ZTV19HGAntiAliasLUTEntry + 0x10).
   *   0x211da6: xorps %xmm0,%xmm0; movups %xmm0,0x18(%rbx)
   *             — zero the 16 bytes at [+0x18..+0x28), i.e. both bitmap slots.
   *   0x211dad: testq %r15,%r15 ; je 0x211f0f
   *             — if the passed-in LUTInfo is null, skip everything, drop
   *               through to the epilogue with both slots still zero.
   *   0x211db6: dynamic_cast<HGAntiAliasLUTInfo*>(info); je 0x211f0f
   *             — if the cast fails (different concrete LUTInfo kind), also
   *               skip. `%rax` is the successful cast result on the taken
   *               fallthrough.
   *   0x211de2: movl 0x8(%rax),%eax — read `shapeKind` (u32 at +0x08 of the
   *             cast-result HGAntiAliasLUTInfo).
   *   0x211de5: cmpl $0x1,%eax ; je 0x211e22   — kind==1 => search LUT branch.
   *   0x211dea: testl %eax,%eax ; jne 0x211e56 — kind!=0 (and !=1) => null-rect.
   *             — falls through to kind==0 area-LUT branch.
   *
   *   AREA LUT branch (kind == 0), @0x211dee..0x211e20:
   *     xmm2 = 160.0f (@Helium 0x8600a4)
   *     xmm3 = 560.0f (@Helium 0x8600a8)
   *     rect = HGRectMake4f(0, 0, 160, 560)   [call at 0x211e04]
   *     saved: r15 = rect.lo,  r12 = rect.hi
   *     rax = areaTexBytes ptr   [@0x211e0f leaq __ZL12areaTexBytes(%rip),%rax]
   *     r14 = 0xa  (HGFormat code)
   *     jmp common tail @0x211e6c
   *
   *   SEARCH LUT branch (kind == 1), @0x211e22..0x211e54:
   *     xmm2 = 66.0f  (@Helium 0x8600a0)
   *     xmm3 = 33.0f  (@Helium 0x860098)
   *     rect = HGRectMake4f(0, 0, 66, 33)     [call at 0x211e38]
   *     rax = searchTexBytes ptr [@0x211e43 leaq __ZL14searchTexBytes(%rip),%rax]
   *     r14 = 0x1  (HGFormat code)
   *     jmp common tail @0x211e6c
   *
   *   NULL branch (kind other than 0 or 1), @0x211e56..0x211e6b:
   *     rect = HGRectNull       [leaq _HGRectNull; movq (%rax),%r15; movq 0x8(%rax),%r12]
   *     data ptr = null
   *     r14 = 0  (HGFormat code — passed onward, meaning "no format")
   *     fall through to common tail @0x211e6c
   *
   *   COMMON TAIL @0x211e6c..0x211f0e — allocate two HGBitmaps and copy:
   *     0x211e6c: __ZN8HGObjectnwEm(0x80)          — allocate 128 bytes.
   *     0x211e85: HGBitmap::HGBitmap(this, rect, format=r14)
   *               — constructs a fresh, empty destination bitmap. Placed
   *               into self+0x18 with refcount-aware assignment:
   *                 old = self[+0x18]
   *                 if (old != new_dst and old != null) old->release()
   *                 self[+0x18] = new_dst
   *     0x211eb9: __ZN8HGObjectnwEm(0x80)          — allocate another 128 bytes.
   *     0x211ed6: HGBitmap::HGBitmap(this, rect, format=r14, data=(area|search|null))
   *               — a "wrapper" bitmap over the read-only ROM bytes.
   *     0x211edf: HGRenderUtils::BufferCopier bc;
   *     0x211ef2: bc.execute(dst = self[+0x18], src = wrapper);
   *     0x211efb: bc.~BufferCopier();               — RAII teardown
   *     0x211f00: wrapper->release()                — free the source bitmap
   *
   *   Epilogue @0x211f0f..0x211f1d: standard multi-callee-saved teardown.
   *
   *   Exception-cleanup landing pads @0x211f1e..0x211fcd:
   *     Wire up all the RAII releases (dst-bitmap ptr, wrapper-bitmap ptr,
   *     BufferCopier), then invoke the base-class D2 on `this`, then
   *     __Unwind_Resume. TS's throw propagation handles this automatically.
   *
   * Because every callee here is an un-decoded frontier (HGLUTCache::LUTEntry
   * base ctor, HGBitmap ctors, HGObject::operator new, BufferCopier, dynamic_cast),
   * we transcribe the *decisions* faithfully — the ctor never even gets to the
   * common-tail work because the very first call (base ctor at 0x211d97) throws
   * with its own frontier signal. That throw IS the demand signal, per
   * decode-don't-fit.
   */
  constructor(info: HGLUTCache_LUTInfo | null, renderer: HGRenderer | null) {
    // @Helium 0x211d97 — HGLUTCache::LUTEntry::LUTEntry(this, info, renderer).
    // The base ctor populates +0x00..+0x17. In the port, we can't invent its
    // body, so we throw here to surface the frontier. Every subsequent
    // decision below is documented so a later worker can pick this up cheaply
    // once the base class lands.
    HGLUTCache_LUTEntry_C2_stub(
      this,
      info as HGLUTCache_LUTInfo,
      renderer as HGRenderer,
    );

    // The remaining ctor body is transcribed faithfully but is currently
    // unreachable in the port (the base-ctor stub above always throws). We
    // keep the code so the decode-don't-fit citations survive gate P4 and the
    // structure is trivially finishable once the base ctor lands. Removing
    // these lines would lose the address citations for the branch logic.

    // @Helium 0x211d9c — install our own vtable at +0x00. Not modelled in TS.

    // @Helium 0x211da6/0x211da9 — zero the two bitmap slots.
    this._cpuBitmap = null;
    this._gpuTexture = null;

    // @Helium 0x211dad — if `info` is null, skip everything.
    if (info === null) {
      return;
    }

    // @Helium 0x211dcc — dynamic_cast<HGAntiAliasLUTInfo*>(info).
    // The cast is Itanium RTTI; not reimplementable in JS from asm alone.
    const asAALUTInfo = itanium_dynamic_cast_stub<HGAntiAliasLUTInfo>(
      info,
      "N10HGLUTCache7LUTInfoE",
      "18HGAntiAliasLUTInfo",
    );
    if (asAALUTInfo === null) {
      return;
    }

    // @Helium 0x211de2 — read shapeKind (u32 @ +0x08).
    const kind: number = asAALUTInfo.shapeKind;

    let rect: HGRect;
    let format: number;
    let data: Uint8Array | null;

    if (kind === 1) {
      // @Helium 0x211e22..0x211e54 — search LUT branch.
      rect = HGRectMake4f(0, 0, Math.fround(66.0), Math.fround(33.0));
      format = 0x1;
      data = loadSearchTexBytes_stub();
    } else if (kind === 0) {
      // @Helium 0x211dee..0x211e20 — area LUT branch.
      rect = HGRectMake4f(0, 0, Math.fround(160.0), Math.fround(560.0));
      format = 0xa;
      data = loadAreaTexBytes_stub();
    } else {
      // @Helium 0x211e56..0x211e6b — null-rect degenerate branch.
      rect = HGRectNull;
      format = 0x0;
      data = null;
    }

    // @Helium 0x211e6c — allocate destination bitmap (empty, format-only).
    const dstBitmap = HGObject_operator_new_stub(0x80);
    // @Helium 0x211e85 — HGBitmap::HGBitmap(dst, rect, format).
    HGBitmap_C1_rect_fmt_stub(dstBitmap, rect, format);

    // @Helium 0x211e8a..0x211eb8 — assign dstBitmap into self[+0x18] with
    // refcount-aware overwrite semantics (release the old occupant if it's
    // non-null and distinct).
    const oldCpu = this._cpuBitmap as HGBitmap | null;
    if (oldCpu !== null && oldCpu !== dstBitmap) {
      HGImage_vtable_0x18_release_stub(oldCpu);
    }
    this._cpuBitmap = dstBitmap;

    // @Helium 0x211eb9 — allocate wrapper bitmap over the ROM data.
    const wrapper = HGObject_operator_new_stub(0x80);
    // @Helium 0x211ed6 — HGBitmap::HGBitmap(wrapper, rect, format, data).
    HGBitmap_C1_rect_fmt_data_stub(
      wrapper,
      rect,
      format,
      data ?? new Uint8Array(0),
    );

    // @Helium 0x211edf/0x211ef2/0x211efb — BufferCopier ctor / execute / dtor.
    // The RAII sequence collapses to a single "copy from src to dst" call.
    HGRenderUtils_BufferCopier_run_stub(dstBitmap, wrapper);

    // @Helium 0x211f00..0x211f0e — release the wrapper source bitmap.
    HGImage_vtable_0x18_release_stub(wrapper);

    // Silence unused-var lint for the baseSlot0 field we track for layout.
    void this._baseSlot0;
  }

  /**
   * D1 in-place destructor — HGAntiAliasLUTEntry::~HGAntiAliasLUTEntry()
   *   @Helium 0x0000000000211fd0 .. 0x000000000021200f
   *
   * Disassembly:
   *   0x211fd0 pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x211fd6 movq %rdi,%rbx
   *   0x211fd9 leaq 0x81d688(%rip),%rax ; movq %rax,(%rdi)   ; reinstall our vtable
   *   0x211fe3 movq 0x20(%rdi),%rdi       ; rdi = gpuTexture
   *   0x211fe7 testq %rdi,%rdi
   *   0x211fea je   0x211ff2
   *   0x211fec movq (%rdi),%rax ; callq *0x18(%rax)          ; release()
   *   0x211ff2 movq 0x18(%rbx),%rdi       ; rdi = cpuBitmap
   *   0x211ff6 testq %rdi,%rdi
   *   0x211ff9 je   0x212001
   *   0x211ffb movq (%rdi),%rax ; callq *0x18(%rax)          ; release()
   *   0x212001 movq %rbx,%rdi ; epilogue
   *   0x21200a jmp  __ZN10HGLUTCache8LUTEntryD2Ev            ; tail-call base D2
   */
  D1_destructor(): void {
    // @Helium 0x211fd9 — reinstall vtable. No TS effect.

    // @Helium 0x211fe3..0x211ff1 — release gpuTexture if non-null.
    const gpu = this._gpuTexture;
    if (gpu !== null) {
      HGImage_vtable_0x18_release_stub(gpu);
    }

    // @Helium 0x211ff2..0x212000 — release cpuBitmap if non-null.
    const cpu = this._cpuBitmap;
    if (cpu !== null) {
      HGImage_vtable_0x18_release_stub(cpu);
    }

    // @Helium 0x21200a — tail-call HGLUTCache::LUTEntry::~LUTEntry().
    HGLUTCache_LUTEntry_D2_stub(this);
  }

  /**
   * D0 deleting destructor — HGAntiAliasLUTEntry::~HGAntiAliasLUTEntry()
   *   @Helium 0x0000000000212020 .. 0x0000000000212066
   *
   * Body is byte-for-byte identical to D1 except the epilogue tail-jumps to
   * `__ZdlPv` (operator delete) *after* the base D2 has completed — i.e. it
   * is the collapsed "D1 then delete this" pair.
   */
  D0_deleting_destructor(): void {
    // @Helium 0x212029 — reinstall vtable. No TS effect.

    // @Helium 0x212033..0x212041 — release gpuTexture.
    const gpu = this._gpuTexture;
    if (gpu !== null) {
      HGImage_vtable_0x18_release_stub(gpu);
    }

    // @Helium 0x212042..0x212050 — release cpuBitmap.
    const cpu = this._cpuBitmap;
    if (cpu !== null) {
      HGImage_vtable_0x18_release_stub(cpu);
    }

    // @Helium 0x212054 — call base D2.
    HGLUTCache_LUTEntry_D2_stub(this);
    // @Helium 0x212062 — operator delete(this).
    operator_delete_stub(this);
  }

  /**
   * GetBitmap — HGAntiAliasLUTEntry::GetBitmap()
   *   @Helium 0x0000000000212080 .. 0x0000000000212180
   *
   * Returns an already-retained HGBitmap or HGMetalTexture (caller owns the
   * new reference). Decision tree, straight off the disasm:
   *
   *   0x212090: rdi = self[+0x10]  (the base-class HGRenderer*)
   *   0x212094: testq ; je 0x21215d
   *             if renderer == null => return retain(self[+0x18]).
   *   0x2120a0: callq *0x130(%rax) with `this = renderer`
   *             tmp = renderer->PrefersCPU()   (bool at vt+0x130)
   *   0x2120a6: testb %al ; jne 0x21215d
   *             if tmp == true (CPU-only) => return retain(self[+0x18]).
   *
   *   0x2120ae..0x2120d7: r14 = dynamic_cast<HGGPURenderer*>(self[+0x10])
   *             (r14 may be null if the renderer isn't a GPU renderer, but
   *              the *0x80 query below is still made through the ORIGINAL
   *              renderer at r15 — see 0x2120d7 movq (%r15),%rax).
   *
   *   0x2120dd: esi = 0x2b  (query id 43)
   *   0x2120e2: callq *0x80(%rax) with this=r15, esi=0x2b
   *             backendKind = renderer->QueryBackendKind(0x2b)
   *   0x2120eb: cmpl $0x1,%eax ; jne 0x21215d
   *             if backendKind != 1 => return retain(self[+0x18]).
   *
   *   0x2120ed..0x212158: GPU path.
   *     0x2120ed r15 = &self[+0x20]
   *     0x2120f1 rdi = self[+0x20]  (existing gpuTexture)
   *     0x2120f8 testq ; jne 0x212194
   *              if gpuTexture non-null => jump to "retain existing" @0x212194.
   *     ELSE — create a new one:
   *     0x212101 rax = HGGPURenderer::GetMetalContext()
   *     0x212106 rax = *(rax + 0x10)   (MetalDevice*)
   *     0x21210a rsi = *(rax + 0x10)   (HGMetalTexturePool*)
   *     0x21210e rcx = self[+0x18]     (cpuBitmap*)
   *     0x212112 r8  = *(rcx + 0x14)   (HGRect.lo of cpuBitmap)
   *     0x212116 r9  = *(rcx + 0x1c)   (HGRect.hi of cpuBitmap)
   *     0x21211a stack[8] = 0 (bool flag2)
   *     0x212122 stack[0] = 0 (bool flag1)
   *     0x212129 rdi = &tmpOut         (locals[-0x20])
   *     0x21212d rdx = 0               (HGMTLDeviceType = 0)
   *     0x21212f callq HGMetalTexture::createWithCopy(0, pool, cpuBitmap,
   *                       rect, false, false)
   *              — writes the fresh HGMetalTexture into tmpOut, retained.
   *     0x212134 rax = self[+0x20]     (old gpuTexture)
   *     0x212138 rdi = tmpOut
   *     0x21213c cmpq rdi,rax ; je 0x212181   ; identity guard
   *     0x212141 testq rax ; je 0x212153
   *     0x212146 callq *0x18(%rax)     ; release old gpuTexture
   *     0x21214f rdi = tmpOut          ; reload after the call
   *     0x212153 *r15 = rdi            ; self[+0x20] = tmpOut
   *     0x212156 testq rdi ; jne 0x212194
   *     0x21215b jmp 0x212173          ; if new is null, return null (rax=0)
   *
   *   0x21215d..0x212180: CPU-return path (label reached from all early
   *                       exits).
   *     0x21215d rdi = self[+0x18]      (cpuBitmap*)
   *     0x212161 rbx += 0x18            ; rbx now points at &self[+0x18]
   *     0x212165 testq ; je 0x212170
   *     0x21216a callq *0x10(%rax)     ; addRef() on cpuBitmap
   *     0x212170 r15 = rbx             ; r15 = &self[+0x18]
   *     0x212173 rax = *r15            ; rax = self[+0x18]
   *     epilogue ; retq
   *
   *   0x212181..0x21219a: "identity" tail (new == old).
   *     0x212181 testq rax ; je 0x212173  ; if both null, just return
   *     0x212186 callq *0x18(%rdi)         ; release tmpOut (drop the extra ref)
   *     0x21218c rdi = *r15                ; rdi = self[+0x20] (== old == new)
   *     0x21218f testq ; je 0x212173
   *     0x212194 callq *0x10(%rax)         ; addRef the final ptr for the caller
   *     jmp 0x212173
   *
   * Semantic summary: "If the owning renderer isn't a Metal-GPU renderer,
   * return an addRef'd cpuBitmap. Otherwise lazily upload the cpuBitmap to a
   * HGMetalTexture (creating it once, caching in +0x20), and return that
   * addRef'd." The identity guard at 0x21213c handles the (unusual) case
   * where createWithCopy re-emits the same pool object.
   */
  GetBitmap(): HGBitmap | HGMetalTexture | null {
    // @Helium 0x212090..0x212097 — null-renderer early-out.
    const renderer = this._renderer;
    if (renderer === null) {
      return this._addRefCpuAndReturn();
    }

    // @Helium 0x2120a0..0x2120a8 — PrefersCPU early-out.
    if (HGRenderer_vtable_0x130_prefersCPU_stub(renderer)) {
      return this._addRefCpuAndReturn();
    }

    // @Helium 0x2120ae..0x2120d2 — dynamic_cast<HGGPURenderer*>. Result feeds
    // GetMetalContext later; but the QueryBackendKind call below still runs
    // on the original renderer at r15.
    const asGPU = itanium_dynamic_cast_stub<HGRenderer /*HGGPURenderer*/>(
      renderer,
      "10HGRenderer",
      "13HGGPURenderer",
    );

    // @Helium 0x2120dd..0x2120eb — QueryBackendKind(0x2b) != 1 => CPU return.
    const backendKind = HGRenderer_vtable_0x80_backendKind_stub(renderer, 0x2b);
    if (backendKind !== 1) {
      return this._addRefCpuAndReturn();
    }

    // GPU path @0x2120ed..0x21219a.
    if (this._gpuTexture !== null) {
      // @Helium 0x2120f8 jne 0x212194 — retain-and-return existing.
      HGImage_vtable_0x10_addRef_stub(this._gpuTexture);
      return this._gpuTexture;
    }

    // @Helium 0x212101..0x21212f — create a new HGMetalTexture from cpuBitmap.
    // In the port, `asGPU` may be null when the dynamic_cast stub returned null
    // (impossible today because the stub throws); the surrounding null-guard
    // matches the asm's implicit trust that r14 is a valid HGGPURenderer.
    const ctx = HGGPURenderer_GetMetalContext_stub(
      (asGPU ?? renderer) as HGRenderer,
    );
    const pool = ctx.texturePool;

    if (this._cpuBitmap === null) {
      // The asm dereferences self[+0x18] unconditionally at 0x21210e — a
      // null cpuBitmap here would be a use-after-null in FCP too. Surface
      // the invariant.
      throw new Error(
        "HGAntiAliasLUTEntry::GetBitmap: cpuBitmap slot @+0x18 is null on GPU " +
          "path. @Helium 0x21210e reads it unconditionally, so this indicates a " +
          "constructor that never populated the CPU bitmap (info==null or " +
          "dynamic_cast<HGAntiAliasLUTInfo*> returned null in the ctor).",
      );
    }

    // rect = { lo: cpuBitmap[+0x14], hi: cpuBitmap[+0x1c] } — HGBitmap embeds
    // its HGRect at +0x14 (this offset is decoded from GetBitmap and is
    // future context for the HGBitmap porter).
    const rectFromBitmap: HGRect = _readBitmapRect_stub(this._cpuBitmap);

    const newTex = HGMetalTexture_createWithCopy_stub(
      /* HGMTLDeviceType */ 0,
      pool,
      this._cpuBitmap,
      rectFromBitmap,
      /* flag1 */ false,
      /* flag2 */ false,
    );

    // @Helium 0x212134..0x21215b — swap into self[+0x20] with identity guard.
    const oldGpu = this._gpuTexture as HGMetalTexture | null;
    if (oldGpu === newTex) {
      // @Helium 0x212181..0x212197 — new == old identity path.
      if (newTex === null) {
        return null;
      }
      HGImage_vtable_0x18_release_stub(newTex); // drop the extra ref
      const finalPtr = this._gpuTexture; // reload
      if (finalPtr === null) {
        return null;
      }
      HGImage_vtable_0x10_addRef_stub(finalPtr);
      return finalPtr;
    }

    // @Helium 0x212141..0x21214f — release old if it exists and differs.
    if (oldGpu !== null) {
      HGImage_vtable_0x18_release_stub(oldGpu);
    }
    // @Helium 0x212153 — store new pointer.
    this._gpuTexture = newTex;
    if (newTex === null) {
      return null;
    }
    // @Helium 0x212194 — final addRef before return.
    HGImage_vtable_0x10_addRef_stub(newTex);
    return newTex;
  }

  /** @Helium 0x21215d..0x212180 — addRef the cpuBitmap (if non-null) and
   *  return it. Shared exit path for every CPU-return early-out in
   *  GetBitmap. */
  private _addRefCpuAndReturn(): HGBitmap | null {
    const cpu = this._cpuBitmap;
    if (cpu !== null) {
      HGImage_vtable_0x10_addRef_stub(cpu);
    }
    return cpu;
  }
}

/** @Helium 0x21210e / 0x212112 / 0x212116 — read the HGRect embedded in an
 *  HGBitmap at offset +0x14 (two qwords). Not yet ported. */
function _readBitmapRect_stub(_b: HGBitmap): HGRect {
  throw new Error(
    "HGBitmap embedded HGRect read @+0x14 (see HGAntiAliasLUTEntry::GetBitmap " +
      "@Helium 0x21210e) is not yet ported — port HGBitmap in its own task.",
  );
}
