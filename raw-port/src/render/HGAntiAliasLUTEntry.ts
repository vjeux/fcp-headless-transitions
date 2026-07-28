// HGAntiAliasLUTEntry.ts -- Helium framework LUT-cache entry that owns the
// anti-alias distance-field textures used by HGRenderer's SDF text path.
//
// Verbatim from FCP's Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Decode evidence:
//   re/disasm/Helium.HGAntiAliasLUTEntry.HGAntiAliasLUTEntry.s      @0x211d80  C2 ctor
//   re/disasm/Helium.HGAntiAliasLUTEntry.GetBitmap.s                @0x212080  GetBitmap()
//   re/disasm/Helium.HGAntiAliasLUTEntry.~HGAntiAliasLUTEntry.s     @0x212020  D0
//   + otool -tV extract of __ZN19HGAntiAliasLUTEntryD1Ev at 0x212000..0x21201f
//
// Faithful transcription: every hex literal below is either an @0xADDR of a
// decoded symbol, an alloc size (0x80 = sizeof(HGBitmap), 0x18/0x20 =
// field offsets read verbatim from mov displacements), or an enum value
// pulled directly from the disasm's `movl $imm, ...` operands. Frontier
// callees are surfaced as throwing stubs citing their @0xADDR -- the
// demand signal for the next porter.
//
// -- STRUCT LAYOUT --------------------------------------------------------
// Fields (total size 0x28 = 40 bytes, matched by the factory's `movl $0x28,%edi`
// at HGAntiAliasLUTEntryFactory::createLUTEntry @Helium 0x211330):
//
//   offset  size  field           source
//   ------  ----  --------------  --------------------------------------------------
//   +0x00   0x08  vptr            written by C2 @0x211d9c  leaq 0x81d8c5(%rip),%rax
//                                                            ## vtable for HGAntiAliasLUTEntry
//                                          @0x211da3  movq %rax,(%rbx)
//   +0x08   0x10  base            HGLUTCache::LUTEntry base subobject; init'd by
//                                          @0x211d97  callq __ZN10HGLUTCache8LUTEntryC2EPNS_7LUTInfoEP10HGRenderer
//   +0x18   0x08  cpuBitmap : HGBitmap*   written by @0x211ea5 / cleared @0x211da9
//                                          movups %xmm0,0x18(%rbx)  (16 bytes zero'd)
//   +0x20   0x08  gpuTexture : HGObject*  same movups also zeros +0x20
//                                          filled later by GetBitmap() @0x212153
//
// -- FRONTIER CALLEES (each surfaces as a throwing stub citing @0xADDR) --
//   __ZN10HGLUTCache8LUTEntryC2EPNS_7LUTInfoEP10HGRenderer  @0x211d97
//       HGLUTCache::LUTEntry::LUTEntry(LUTInfo*, HGRenderer*)  -- base ctor.
//   ___dynamic_cast                                         @0x211dcc / @0x2120ca
//       libcxxabi dynamic_cast used to sniff the runtime type of the LUTInfo
//       (HGAntiAliasLUTInfo?) and the renderer (HGGPURenderer?).
//   _HGRectMake4f                                           @0x211e04 / @0x211e38
//       Helium's HGRect ctor. The port has `raw-port/src/render/HGRect.ts` --
//       we call into that when the wiring lands; for now the throw-stub is
//       the demand signal.
//   __ZN8HGObjectnwEm                                       @0x211e71 / @0x211ebe
//       HGObject::operator new(size_t) -- Helium's arena allocator.
//   __ZN8HGBitmapC1E6HGRect8HGFormat                        @0x211e85
//       HGBitmap::HGBitmap(HGRect, HGFormat) -- empty bitmap ctor.
//   __ZN8HGBitmapC1E6HGRect8HGFormatPv                      @0x211ed6
//       HGBitmap::HGBitmap(HGRect, HGFormat, void*) -- bitmap-from-bytes.
//   __ZN13HGRenderUtils12BufferCopierC1Ev                   @0x211edf
//   __ZN13HGRenderUtils12BufferCopier7executeEP8HGBitmapS2_ @0x211ef2
//   __ZN13HGRenderUtils12BufferCopierD1Ev                   @0x211efb
//       Stack-scoped RAII helper that memcpy's src bitmap into dst bitmap.
//   __ZN13HGGPURenderer15GetMetalContextEv                  @0x212101
//       HGGPURenderer::GetMetalContext() -- unwraps the Metal device pool.
//   __ZN14HGMetalTexture14createWithCopyE15HGMTLDeviceTypeP18HGMetalTexturePoolP8HGBitmap6HGRectbb
//                                                          @0x21212f
//       HGMetalTexture::createWithCopy(...) -- CPU->GPU texture upload.
//   __ZL12areaTexBytes / __ZL14searchTexBytes                @0x211e0f / @0x211e43
//       Two static arrays of pre-baked distance-field bytes embedded in the
//       framework. Their contents are file-scope RIP-relative constants; we
//       expose them as opaque Uint8Array handles the host can populate from
//       the on-disk asset (extract with `otool -s __TEXT __const`).
//   __ZTIN10HGLUTCache7LUTInfoE      @0x211db6  (RTTI for source type)
//   __ZTI18HGAntiAliasLUTInfo        @0x211dbd  (RTTI for target type)
//   __ZTI10HGRenderer                @0x2120b7  (RTTI for source type)
//   __ZTI13HGGPURenderer             @0x2120be  (RTTI for target type)
//   __ZN10HGLUTCache8LUTEntryD2Ev    @0x212054  parent D2 dtor (also @0x211fb0)
//   __ZN8HGObjectdlEPv               @0x211f82  HGObject::operator delete(void*)
//   __ZdlPv                          @0x212062  libc++ operator delete (tail-call in D0)
//
// -- REUSED PORTS --------------------------------------------------------
//   HGAntiAliasLUTEntryFactory.ts already exports opaque brands for
//   HGLUTCache_LUTInfo, HGRenderer, HGAntiAliasLUTEntry -- we import those
//   nominal brands here so both files agree on the type identity.
import type {
  HGLUTCache_LUTInfo,
  HGRenderer,
} from "./HGAntiAliasLUTEntryFactory.js";

// -- OPAQUE FORWARD-DECLARATIONS -----------------------------------------

/** Opaque handle to Helium's HGBitmap. Ported separately. */
export interface HGBitmap {
  readonly __brand_HGBitmap: unique symbol;
}
/** Opaque handle to Helium's HGGPURenderer (subclass of HGRenderer). */
export interface HGGPURenderer {
  readonly __brand_HGGPURenderer: unique symbol;
}
/** Opaque handle to Helium's HGMetalTexture. Ported separately. */
export interface HGMetalTexture {
  readonly __brand_HGMetalTexture: unique symbol;
}
/** Opaque handle to Helium's HGAntiAliasLUTInfo. A concrete .ts already
 *  exists (`src/render/HGAntiAliasLUTInfo.ts`) but is a stub -- we take
 *  the reference by brand so this file stays decoupled. */
export interface HGAntiAliasLUTInfo {
  readonly __brand_HGAntiAliasLUTInfo: unique symbol;
  /** kind: int32 at +0x08 -- read by C2 @0x211de2 movl 0x8(%rax),%eax */
  readonly kind: number;
}

// -- FRONTIER CALLEE STUBS -----------------------------------------------

/** @0x211d97 __ZN10HGLUTCache8LUTEntryC2EPNS_7LUTInfoEP10HGRenderer */
function HGLUTCache_LUTEntry_C2_stub(
  _self: HGAntiAliasLUTEntry,
  _info: HGLUTCache_LUTInfo | null,
  _renderer: HGRenderer | null,
): void {
  throw new Error(
    "HGLUTCache::LUTEntry::LUTEntry(LUTInfo*, HGRenderer*) @Helium 0x211d97 is not yet transcribed. This throw is the demand signal.",
  );
}
/** @0x211dcc / @0x2120ca ___dynamic_cast (libcxxabi) */
function dynamic_cast_stub<T>(_p: unknown, _srcTI: string, _dstTI: string): T | null {
  throw new Error(
    "___dynamic_cast @Helium 0x211dcc is not yet transcribed. Requires runtime typeinfo tables.",
  );
}
/** @0x211e04 / @0x211e38 _HGRectMake4f(x,y,w,h) -> HGRect (rax:rdx pair) */
function HGRectMake4f_stub(
  _x: number,
  _y: number,
  _w: number,
  _h: number,
): { lo: bigint; hi: bigint } {
  throw new Error(
    "HGRectMake4f @Helium 0x211e04 is not yet transcribed. See raw-port/src/render/HGRect.ts.",
  );
}
/** @0x211e56 _HGRectNull -- the two-quadword RIP-const at RIP+0x0. */
function HGRectNull_stub(): { lo: bigint; hi: bigint } {
  throw new Error(
    "_HGRectNull @Helium 0x211e56 constant is not yet transcribed. Two-quadword RIP-relative constant; extract via otool -X.",
  );
}
/** @0x211e71 / @0x211ebe __ZN8HGObjectnwEm -- HGObject::operator new(size_t) */
function HGObject_operator_new_stub(_bytes: number): HGBitmap {
  throw new Error(
    "HGObject::operator new(size_t) @Helium 0x211e71 is not yet transcribed. Helium's arena allocator.",
  );
}
/** @0x211e85 __ZN8HGBitmapC1E6HGRect8HGFormat -- empty ctor */
function HGBitmap_C1_empty_stub(
  _self: HGBitmap,
  _rect: { lo: bigint; hi: bigint },
  _format: number,
): void {
  throw new Error(
    "HGBitmap::HGBitmap(HGRect, HGFormat) @Helium 0x211e85 is not yet transcribed.",
  );
}
/** @0x211ed6 __ZN8HGBitmapC1E6HGRect8HGFormatPv -- ctor with backing bytes */
function HGBitmap_C1_bytes_stub(
  _self: HGBitmap,
  _rect: { lo: bigint; hi: bigint },
  _format: number,
  _data: Uint8Array | null,
): void {
  throw new Error(
    "HGBitmap::HGBitmap(HGRect, HGFormat, void*) @Helium 0x211ed6 is not yet transcribed.",
  );
}
/**
 * BufferCopier: stack-scoped RAII helper.
 *  @0x211edf ctor    __ZN13HGRenderUtils12BufferCopierC1Ev
 *  @0x211ef2 execute __ZN13HGRenderUtils12BufferCopier7executeEP8HGBitmapS2_
 *  @0x211efb dtor    __ZN13HGRenderUtils12BufferCopierD1Ev
 */
function BufferCopier_C1_stub(): { execute: (dst: HGBitmap, src: HGBitmap) => void } {
  throw new Error(
    "HGRenderUtils::BufferCopier::BufferCopier() @Helium 0x211edf is not yet transcribed.",
  );
}
/** @0x212101 __ZN13HGGPURenderer15GetMetalContextEv */
function HGGPURenderer_GetMetalContext_stub(_self: HGGPURenderer): unknown {
  throw new Error(
    "HGGPURenderer::GetMetalContext() @Helium 0x212101 is not yet transcribed.",
  );
}
/** @0x21212f __ZN14HGMetalTexture14createWithCopyE... */
function HGMetalTexture_createWithCopy_stub(
  _out: { texture: HGMetalTexture | null },
  _deviceType: number,
  _pool: unknown,
  _bitmap: HGBitmap,
  _rect: { lo: bigint; hi: bigint },
  _flag1: boolean,
  _flag2: boolean,
): void {
  throw new Error(
    "HGMetalTexture::createWithCopy @Helium 0x21212f is not yet transcribed.",
  );
}
/**
 * Distance-field byte tables. Both are file-scope static arrays living in
 * Helium's __TEXT __const section.
 *   @0x211e0f  __ZL12areaTexBytes    -- format=10 texture data
 *   @0x211e43  __ZL14searchTexBytes  -- format=1  texture data
 */
function loadAreaTexBytes_stub(): Uint8Array {
  throw new Error(
    "__ZL12areaTexBytes @Helium 0x211e0f is not yet transcribed; extract via otool -X -s __TEXT __const.",
  );
}
function loadSearchTexBytes_stub(): Uint8Array {
  throw new Error(
    "__ZL14searchTexBytes @Helium 0x211e43 is not yet transcribed; extract via otool -X -s __TEXT __const.",
  );
}
/** @0x2120a0 renderer->vtable[0x130] -- "wants CPU-only?" boolean. */
function HGRenderer_vtable_0x130_stub(_r: HGRenderer): boolean {
  throw new Error(
    "HGRenderer::vtable[0x130] (\"wantsCPUOnly\") @Helium 0x2120a0 is not yet transcribed.",
  );
}
/** @0x2120e2 renderer->vtable[0x80](arg: int32) -> int32 capability query. */
function HGRenderer_vtable_0x80_stub(_r: HGRenderer, _cap: number): number {
  throw new Error(
    "HGRenderer::vtable[0x80] (capability query, arg 0x2b) @Helium 0x2120e2 is not yet transcribed.",
  );
}
/** @0x212106..@0x21210a -- two-hop pointer chase inside a MetalContext. */
function HGMetalContext_getTexturePool_stub(_ctx: unknown): unknown {
  throw new Error(
    "HGMetalContext->texturePool (*(*(ctx+0x10))+0x10) @Helium 0x212106 is not yet transcribed.",
  );
}
/** @0x21210e/@0x212116 -- read the embedded HGRect from an HGBitmap (+0x14/+0x1c). */
function HGBitmap_getRect_stub(_b: HGBitmap): { lo: bigint; hi: bigint } {
  throw new Error(
    "HGBitmap::getRect (fields at +0x14/+0x1c) @Helium 0x21210e is not yet transcribed.",
  );
}
/** @0x212054 / @0x211fb0 __ZN10HGLUTCache8LUTEntryD2Ev -- parent D2 dtor. */
function HGLUTCache_LUTEntry_D2_stub(_self: HGAntiAliasLUTEntry): void {
  throw new Error(
    "HGLUTCache::LUTEntry::~LUTEntry() @Helium 0x212054 is not yet transcribed.",
  );
}

// -- CLASS BODY ----------------------------------------------------------

/**
 * HGAntiAliasLUTEntry -- LUT-cache entry that owns a CPU HGBitmap (and a
 * lazily materialised GPU Metal texture) filled with signed-distance-field
 * data used by HGRenderer's anti-aliased text path.
 *
 * The FCP object is 40 bytes (0x28), of which 24 bytes belong to the
 * HGLUTCache::LUTEntry base and 16 bytes are this class's own two owning
 * pointers (`cpuBitmap` at +0x18 and `gpuTexture` at +0x20). Both pointers
 * are HGObject-refcounted -- release goes through `vtable[0x18 / 8 = 3]`
 * (the `release()` virtual slot at *0x18(vptr)).
 */
export class HGAntiAliasLUTEntry {
  /** vtable pointer at +0x00. Written by @0x211da3 movq %rax,(%rbx). */
  readonly __vptr: string = "vtable for HGAntiAliasLUTEntry @Helium 0x211d9c";
  /** Base HGLUTCache::LUTEntry subobject (16 bytes at +0x08..+0x17). */
  base: unknown = null;
  /** cpuBitmap at +0x18 -- HGObject-refcounted HGBitmap*. */
  cpuBitmap: HGBitmap | null = null;
  /** gpuTexture at +0x20 -- HGMetalTexture*. Filled lazily by GetBitmap(). */
  gpuTexture: HGMetalTexture | null = null;

  /**
   * C2 -- base-object constructor.
   * @0x211d80 __ZN19HGAntiAliasLUTEntryC2EPN10HGLUTCache7LUTInfoEP10HGRenderer
   *
   * Faithful transcription of the disasm (@0x211d80..0x211f1d main body):
   *   @0x211d97 callq base C2 (HGLUTCache::LUTEntry) on `this`, info, renderer
   *   @0x211d9c leaq  vtable for HGAntiAliasLUTEntry; @0x211da3 movq to (this)
   *   @0x211da6 xorps + @0x211da9 movups -- zeros +0x18 and +0x20 (16 bytes)
   *   @0x211dad testq %r15,%r15 ; je 0x211f0f -- if info == null, skip body
   *   @0x211dcc callq ___dynamic_cast(info, LUTInfo TI, HGAntiAliasLUTInfo TI, 0)
   *   @0x211dd1 testq/je 0x211f0f -- if cast fails, skip body
   *   @0x211de2 movl 0x8(%rax),%eax -- read casted->kind (int32 at +0x08)
   *   @0x211de5 cmpl $0x1 / @0x211dea testl -- 3-way switch on kind:
   *     kind == 0 : @0x211dee ... @0x211e20
   *       xmm2,xmm3 <- 2 f32 constants from RIP tables (widths/heights);
   *       xmm0,xmm1 <- 0,0; HGRectMake4f(0,0,w,h) -> rax:rdx
   *       areaTexBytes tag; format r14d = 10 (0xA)
   *     kind == 1 : @0x211e22 ... @0x211e54
   *       different f32 constants; searchTexBytes tag; format r14d = 1
   *     else      : @0x211e56 ... @0x211e64
   *       load HGRectNull two-qword constant; data ptr = 0; r14d untouched
   *   @0x211e71 callq HGObject::operator new(0x80) -- 128-byte HGBitmap block
   *   @0x211e85 callq HGBitmap::HGBitmap(rect, format) -- empty ctor
   *   @0x211e8a..@0x211eb9 -- refcount-safe swap of *(+0x18) with the new
   *       bitmap; if the old pointer differs from the new one:
   *         release_old (vtable[0x18]); store new; else release_new.
   *   @0x211ebe callq HGObject::operator new(0x80) -- second HGBitmap
   *   @0x211ed6 callq HGBitmap::HGBitmap(rect, format, data) -- with bytes
   *   @0x211edf callq BufferCopier() ctor (stack-scoped)
   *   @0x211ef2 callq BufferCopier::execute(&+0x18, tmp2)
   *   @0x211efb callq BufferCopier::~BufferCopier()
   *   @0x211f00 release tmp2 through vtable[0x18]
   *   @0x211f0f epilogue + retq
   */
  constructor(info: HGLUTCache_LUTInfo | null, renderer: HGRenderer | null) {
    // @0x211d97 base C2
    HGLUTCache_LUTEntry_C2_stub(this, info, renderer);
    // @0x211d9c/@0x211da3 vtable install (already set as field init above).
    // @0x211da6/@0x211da9 zero cpuBitmap + gpuTexture (already null).

    // @0x211dad if (info == nullptr) goto epilogue
    if (info === null) return;

    // @0x211db6..@0x211dcc  info' = dynamic_cast<HGAntiAliasLUTInfo*>(info)
    const aaInfo = dynamic_cast_stub<HGAntiAliasLUTInfo>(
      info,
      "HGLUTCache::LUTInfo",
      "HGAntiAliasLUTInfo",
    );
    // @0x211dd1/@0x211dd4  if (info' == nullptr) goto epilogue
    if (aaInfo === null) return;

    // @0x211de2 int kind = info'->kind  (i32 at +0x08 of HGAntiAliasLUTInfo)
    const kind = aaInfo.kind | 0;

    let rect: { lo: bigint; hi: bigint };
    let bytes: Uint8Array | null;
    let format: number;
    if (kind === 0) {
      // @0x211dee ... @0x211e20 -- area LUT branch.
      // xmm2,xmm3 from RIP+0x64e2ae and RIP+0x64e2aa (two f32 constants:
      // width, height of the area distance-field texture). Their exact
      // bytes live in Helium's __TEXT __const at those VAs; the constants
      // are the demand signal for the RIP-const extractor.
      rect = HGRectMake4f_stub(0, 0, Math.fround(0), Math.fround(0));
      bytes = loadAreaTexBytes_stub();
      format = 10; // r14d = 0xA
    } else if (kind === 1) {
      // @0x211e22 ... @0x211e54 -- search LUT branch (analogous to kind 0
      // but with different f32 constants at RIP+0x64e276 / RIP+0x64e266).
      rect = HGRectMake4f_stub(0, 0, Math.fround(0), Math.fround(0));
      bytes = loadSearchTexBytes_stub();
      format = 1; // r14d = 0x1
    } else {
      // @0x211e56 ... @0x211e64 -- fall-through branch.
      rect = HGRectNull_stub();
      bytes = null;
      format = 0; // r14d untouched from prior xorl at @0x211dc4
    }

    // @0x211e6c..@0x211e85 -- allocate + construct EMPTY dst bitmap.
    const dstBitmap = HGObject_operator_new_stub(0x80);
    HGBitmap_C1_empty_stub(dstBitmap, rect, format);

    // @0x211e8a..@0x211eb9 -- refcount-safe swap into +0x18. The asm
    // guards the identity case (new == old) and the null-new case to
    // avoid double-release; for the initial ctor the field is null so
    // this reduces to a plain store, but we model it faithfully.
    const oldCpu = this.cpuBitmap;
    if (oldCpu !== dstBitmap) {
      // @0x211e99/@0x211e9e release_old via vtable[0x18] (release()).
      this.cpuBitmap = dstBitmap;
    } else {
      // @0x211eaa..@0x211eb6 -- new == old branch: release new instead.
    }

    // @0x211ebe..@0x211ed6 -- second HGBitmap, this time with backing bytes.
    const srcBitmap = HGObject_operator_new_stub(0x80);
    HGBitmap_C1_bytes_stub(srcBitmap, rect, format, bytes);

    // @0x211edf..@0x211efb -- stack-scoped BufferCopier: memcpy src -> dst.
    const copier = BufferCopier_C1_stub();
    copier.execute(this.cpuBitmap!, srcBitmap);
    // @0x211efb dtor: no observable side effect (destructor is trivial).

    // @0x211f00..@0x211f0c release the temporary src bitmap via vtable[0x18].
    void srcBitmap;

    // @0x211f0f..@0x211f1d epilogue -- nothing more to do.
  }

  /**
   * GetBitmap() -- returns the cached bitmap (as a Metal texture if the
   * renderer supports it, else the CPU bitmap).
   * @0x212080 __ZNK19HGAntiAliasLUTEntry9GetBitmapEv
   *
   * Control flow:
   *   @0x212090..@0x2120a8  if (renderer && renderer->vtable[0x130]() == true)
   *     -- early-out for renderers that flag "no GPU upload needed".
   *   @0x2120ae..@0x2120d7  gpu = dynamic_cast<HGGPURenderer*>(renderer)
   *   @0x2120d7..@0x2120eb  cap = renderer->vtable[0x80](renderer, 0x2b)
   *     -- capability query. Only proceed if cap == 1.
   *   @0x2120ed..@0x2120f8  if (gpuTexture at +0x20 is not null) return CPU.
   *   @0x2120fe..@0x21212f  else: metalCtx = gpu.GetMetalContext();
   *                              texturePool = *(*(+0x10(ctx)) + 0x10);
   *                              rect = cpuBitmap fields at +0x14, +0x1c;
   *                              HGMetalTexture::createWithCopy(
   *                                  0, texturePool, cpuBitmap, rect, false, false)
   *   @0x212134..@0x212156  refcount-safe swap tmp into +0x20.
   *   @0x212173  return *(this+0x18) -- always the CPU bitmap pointer.
   */
  GetBitmap(renderer: HGRenderer | null): HGBitmap | null {
    // @0x212090..@0x2120a8 -- early-out via renderer->vtable[0x130]().
    if (renderer === null) return this.cpuBitmap;
    const wantsCPUOnly = HGRenderer_vtable_0x130_stub(renderer);
    if (wantsCPUOnly) return this.cpuBitmap;

    // @0x2120ae..@0x2120d7 -- gpu = dynamic_cast<HGGPURenderer*>(renderer)
    const gpu = dynamic_cast_stub<HGGPURenderer>(
      renderer,
      "HGRenderer",
      "HGGPURenderer",
    );

    // @0x2120d7..@0x2120eb -- if (renderer->vtable[0x80](renderer, 0x2b) != 1) return CPU.
    const cap = HGRenderer_vtable_0x80_stub(renderer, 0x2b);
    if (cap !== 1) return this.cpuBitmap;

    // @0x2120ed..@0x2120f8 -- if (gpuTexture already cached) skip upload.
    if (this.gpuTexture === null) {
      if (gpu === null) return this.cpuBitmap;
      // @0x212101 metalCtx = gpu.GetMetalContext();
      const metalCtx = HGGPURenderer_GetMetalContext_stub(gpu);
      // @0x212106..@0x21210a  texturePool = *((*(metalCtx+0x10))+0x10).
      const texturePool = HGMetalContext_getTexturePool_stub(metalCtx);
      // @0x21210e..@0x212116  rect = HGRect { u64 lo = cpuBitmap+0x14, hi = cpuBitmap+0x1c }
      const rect = HGBitmap_getRect_stub(this.cpuBitmap!);
      // @0x21212f createWithCopy(deviceType=0, texturePool, cpuBitmap, rect, false, false)
      const outSlot: { texture: HGMetalTexture | null } = { texture: null };
      HGMetalTexture_createWithCopy_stub(
        outSlot,
        0,
        texturePool,
        this.cpuBitmap!,
        rect,
        false,
        false,
      );
      // @0x212134..@0x212156 -- refcount-safe swap tmp into +0x20.
      this.gpuTexture = outSlot.texture;
    }
    // @0x212173  return *(this+0x18) -- always the CPU bitmap pointer.
    return this.cpuBitmap;
  }

  /**
   * D0 -- deleting destructor (virtual-delete thunk).
   * @0x212020 __ZN19HGAntiAliasLUTEntryD0Ev
   *
   * Disassembly:
   *   @0x212029 leaq  vtable+0x10(%rip),%rax
   *   @0x212030 movq  %rax,(%rdi)              ; reinstall vptr for ABI
   *   @0x212033 movq  0x20(%rdi),%rdi          ; gpuTexture
   *   @0x212037 testq %rdi,%rdi ; je 0x212042
   *   @0x21203c movq  (%rdi),%rax ; @0x21203f callq *0x18(%rax)   ; release
   *   @0x212042 movq  0x18(%rbx),%rdi          ; cpuBitmap
   *   @0x212046 testq %rdi,%rdi ; je 0x212051
   *   @0x21204b movq  (%rdi),%rax ; @0x21204e callq *0x18(%rax)   ; release
   *   @0x212054 callq HGLUTCache::LUTEntry::~LUTEntry() (parent D2)
   *   @0x212062 jmp   __ZdlPv                  ; tail-call operator delete(this)
   */
  destroy(): void {
    // @0x212029/@0x212030 -- reinstall vptr; TS has no vtable to touch.
    // @0x212033..@0x212042 -- release gpuTexture via vtable[0x18].
    if (this.gpuTexture !== null) {
      this.gpuTexture = null;
    }
    // @0x212042..@0x212051 -- release cpuBitmap via vtable[0x18].
    if (this.cpuBitmap !== null) {
      this.cpuBitmap = null;
    }
    // @0x212054 -- parent D2 (HGLUTCache::LUTEntry). Frontier stub.
    HGLUTCache_LUTEntry_D2_stub(this);
    // @0x212062 -- tail-call __ZdlPv (operator delete). No TS equivalent.
  }
}
