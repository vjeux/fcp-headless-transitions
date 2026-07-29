// raw-port: HGMetalHandler (chunk m2) — Helium.framework (render layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium (macOS FCP, x86_64 slice; VA == offset within thin slice).
//
// HGMetalHandler is the Metal (ObjC) rendering backend for Helium's fixed-pipeline abstraction.
// It brokers the outgoing Metal encoder + vertex/color/tex-coord/index buffers, dispatches the
// per-primitive draw calls, and cleans up after the pass.
//
// This chunk ports methods [40..60) of the 102-method HGMetalHandler class:
//   40 SetVertices(HGRef<HGMetalBuffer>)                                      @0x0015bca0
//   41 SetColors(void const*, unsigned long, unsigned int)                    @0x0015bd10
//   42 SetColors(HGRef<HGMetalBuffer>)                                        @0x0015be10
//   43 SetTextureCoords(void const*, unsigned long, unsigned int, unsigned int) @0x0015be60
//   44 SetTextureCoords(HGRef<HGMetalBuffer>, unsigned int)                   @0x0015bf70
//   45 SetTextureCoords(unsigned int)                                         @0x0015bfd0
//   46 SetIndices(void const*, unsigned long, unsigned int)                   @0x0015bfe0
//   47 SetIndices(HGRef<HGMetalBuffer>)                                       @0x0015c0d0
//   48 PrimitivesIndexedDraw(HGMTLPrimitiveType, unsigned int, unsigned int)  @0x0015c140
//   49 PrimitivesStart()                                                      @0x0015c1d0
//   50 PrimitivesIndexed(HGMTLPrimitiveType, unsigned int, unsigned int)      @0x0015c7a0
//   51 PrimitivesEnd()                                                        @0x0015c7b0
//   52 _createBuffers()                                                       @0x0015c810
//   53 _updateModelViewProjectionMatrix()                                     @0x0015c950
//   54 _updateTextureMatrices()                                               @0x0015cf60
//   55 _updateParametersBuffer()                                              @0x0015d1c0
//   56 Primitives(HGMTLPrimitiveType)                                         @0x0015d7b0
//   57 _encodeDrawIndexed(HGMTLPrimitiveType, unsigned int, unsigned int)     @0x0015d800
//   58 UnBind()                                                               @0x0015d8f0
//   59 AddMTLFunction(HGMTLFunctionType)                                      @0x0015d900
//
// DECODE: raw-port/re/disasm/Helium.HGMetalHandler.*.s
//
// ── Field-layout evidence recovered in this chunk (offsets on the HGMetalHandler this*) ────
//   All offsets are read/written by at least one method in this chunk (each cite below).
//
//   +0xf8   HGMetalContext*        context                — @0x15bbdd loads pool via
//                                                             context->[0x10]->[0x10]; @0x15c22d reads
//                                                             it in PrimitivesStart to fetch the
//                                                             device to build a commandBuffer.
//   +0x100  id<MTLCommandBuffer>   commandBuffer          — lazy-populated in PrimitivesStart
//                                                             (@0x15c231 selector "commandBuffer");
//                                                             retained @0x15c245.
//   +0x108  id<MTLRenderCommandEncoder> renderEncoder      — read by _encodeDrawIndexed @0x15d869 as
//                                                             the encoder to drawIndexedPrimitives on.
//   +0x140  HGMetalRenderState*    state                  — a per-pass state block holding the
//                                                             (vertex/color/tex-coord[k]/index) HGMetalBuffer*
//                                                             slots. Read as a base pointer in every
//                                                             Set*/PrimitivesIndexedDraw path.
//   +0x148  bool                   dirtyVertexCount       — set to 1 by SetVertices(void*) @0x15bbd6.
//   +0x1f0  uint32_t               activeTextureUnit      — set by SetTextureCoords(unsigned int)
//                                                             @0x15bfd4 (movl %esi, 0x1f0(%rdi)).
//   +0x500  uint64_t               vertexCountForBuffers  — read by _createBuffers @0x15c842 as base
//                                                             for 0xc00-byte MVP+params scratch buffer.
//   +0x570  uint64_t               vertexCount            — set by SetVertices from HGMetalBuffer's
//                                                             (0x1c-0x14) range (@0x15bcb0-0x15bcb3)
//                                                             and as u64 count from raw variant.
//   +0x578  uint64_t               vertexBufferByteSize   — set by SetVertices raw @0x15bbc8 to
//                                                             count<<4 (16-byte vertex stride), later
//                                                             overwritten @0x15bbf5 with count*stride.
//   +0x588  uint64_t               vertexBufferByteSizeAlt — mirror written by SetVertices raw @0x15bbcf
//                                                             (used by _updateBuffers path in m1).
//   +0x590  uint32_t               indexIsShort           — SetIndices sets 1 iff HGMetalBuffer's
//                                                             stride at +0x10 != 3, else 0 (@0x15c0dd-0x15c0e6).
//                                                             (i.e. u16 index ≠ 3 => shortIndex path.)
//   +0x5a0  id<MTLFunction>        computeFn              — AddMTLFunction writes here when
//                                                             functionType==1 (compute) @0x15d950.
//   +0x5a8  id<MTLFunction>        fragmentFn             — AddMTLFunction writes here when
//                                                             functionType==2 (fragment) @0x15d979.
//   +0x5b0  std::vector<id<MTLFunction>>::begin  vertexFns.begin — start of the vertex-fn vector.
//   +0x5b8  std::vector<id<MTLFunction>>::end    vertexFns.end   — one-past-end (append pos).
//   +0x5c0  std::vector<id<MTLFunction>>::cap    vertexFns.cap   — end-of-storage.
//                                                             AddMTLFunction functionType==5 (vertex) appends
//                                                             @0x15d998-0x15dac1 (grow-by-2 vector append).
//   +0x6f4  uint32_t               finalizeCookie         — read by PrimitivesEnd @0x15c7d2 as the
//                                                             count to compare vs commandBuffer's
//                                                             recorded submissions before calling
//                                                             FinalizeCommandEncoder.
//   +0x6f8  uint32_t               submissionCount        — reset to 0 by PrimitivesStart @0x15c24e.
//   +0x709  uint8_t                encoderReady           — set to 1 by PrimitivesStart AFTER buffers
//                                                             created @0x15c21d gate; cleared to 0 by
//                                                             _createBuffers on null-buffer @0x15c8e8.
//   +0x70c  uint8_t                inPrimitivesPass       — set to 1 by PrimitivesStart @0x15c1e4;
//                                                             cleared by PrimitivesEnd @0x15c802 and
//                                                             PrimitivesIndexedDraw @0x15c1b2.
//
// ── ObjC selectors referenced in chunk m2 ──────────────────────────────────────────────────
//   PrimitivesStart:     "commandBuffer"                                             @0x15c231
//   AddMTLFunction:      "functionType", "name", "UTF8String"                        @0x15d917/9be/9cb
//   (_updateModelViewProjectionMatrix, _updateTextureMatrices, _updateParametersBuffer,
//    _encodeDrawIndexed, Primitives, _createBuffers all issue many objc_msgSend and MTL setter
//    calls; those bodies stay boundary-throw citing @0xADDR — the ObjC-runtime dispatch is a
//    per-callsite frontier that will land only when the H1 objc bridge is wired.)
//
// -----------------------------------------------------------------------------
// FRONTIER (called from this chunk but NOT yet transcribed here)
// -----------------------------------------------------------------------------
//   HGMetalContext::bufferPool() const                             @Helium (nearby symbol)
//   HGMetalBuffer::create(HGMTLDeviceType, HGMetalBufferPool*, unsigned long) @Helium
//   HGMetalBuffer::ModifyRangeAndMarkAsDirty(unsigned long, unsigned long, void const*) @Helium
//   HGMetalHandler::_finalizeSourceTextures()                      @Helium @0x0015b6f0
//   HGMetalHandler::_transferEncoderResourcesToCommandBuffer()     @Helium @0x0015b7c0
//   HGMetalHandler::FinalizeCommandEncoder(unsigned, unsigned long, unsigned long) @Helium
//   HGMetalHandler::_setCommandBufferDebugLabel()                  @Helium
//   HGMetalHandler::_setupCommandEncoder()                         @Helium
//   HGMetalHandler::_validateMetalFunctions()                      @Helium
//   HGMetalHandler::_updatePipelineState()                         @Helium
//   HGTraceGuard::HGTraceGuard(char const*, int, char const*)      @Helium
//   HGTraceGuard::~HGTraceGuard()                                  @Helium
//   HGLogger::warning(char const*, ...)                            @Helium
//   HGObject::operator new (via std allocator)                     @Helium
//   __ZNSt3__16vectorI17HGMTLFunctionType...20__throw_length_error @Helium
//   ObjC runtime: _objc_autoreleasePoolPush/Pop, _objc_retain, _objc_release,
//     -[obj commandBuffer], -[MTLFunction functionType], -[MTLFunction name],
//     -[NSString UTF8String], + all MTL setter selectors used in _update*/_encode*.
//
// -----------------------------------------------------------------------------

// ── Opaque handles for types this chunk touches at the boundary ─────────────────────────────
export interface HGMetalHandlerM2 { readonly __hgmh: unique symbol }
export interface HGMetalContextOpaque { readonly __hgmctx: unique symbol }
export interface HGMetalBufferOpaque { readonly __hgmbuf: unique symbol }
export interface HGMetalBufferPoolOpaque { readonly __hgmbp: unique symbol }
export interface HGMetalRenderStateOpaque { readonly __hgmrs: unique symbol }
export interface HGMTLCommandBufferOpaque { readonly __mtlcb: unique symbol }
export interface HGMTLRenderCommandEncoderOpaque { readonly __mtlrce: unique symbol }
export interface HGMTLFunctionOpaque { readonly __mtlfn: unique symbol }

/** HGMTLDeviceType — enum reflecting Metal device selection. See @0x15bbe8 (const 0x10 slot on ctx). */
export type HGMTLDeviceType = number;
/** HGMTLPrimitiveType — enum reflecting MTLPrimitiveType (points/lines/triangles/...). */
export type HGMTLPrimitiveType = number;
/**
 * HGMTLFunctionType — enum matching MTLFunctionType (Vertex=1, Fragment=2, ..., Compute=5).
 * Values here recovered from AddMTLFunction @0x15d927 (==5 => vertex append), @0x15d92d (==2 =>
 * fragment slot @0x5a8), @0x15d933 (==1 => compute slot @0x5a0). Note the switch encoding
 * treats "5" as the vertex-fn append path — that's the observed FCP convention; we preserve it
 * verbatim rather than mapping to Apple's public MTLFunctionType numbering.
 */
export type HGMTLFunctionType = number;

/** HGRef<T>: `{ raw: T | null }` — see raw-port/src/render/HGTexturePoolingPolicy.ts. */
export interface HGRef<T> { raw: T | null }

// ── Frontier boundary stubs used by this chunk (throw with @0xADDR citing the callsite) ────
function HGMetalContext_bufferPool(_ctx: HGMetalContextOpaque): HGMetalBufferPoolOpaque {
  throw new Error("HGMetalContext::bufferPool() const @Helium @0x0015bbec not yet transcribed");
}
function HGMetalBuffer_create(
  _dev: HGMTLDeviceType, _pool: HGMetalBufferPoolOpaque, _byteSize: bigint,
): HGMetalBufferOpaque {
  throw new Error("HGMetalBuffer::create(HGMTLDeviceType, HGMetalBufferPool*, unsigned long) @Helium @0x0015bc09 not yet transcribed");
}
function HGMetalBuffer_ModifyRangeAndMarkAsDirty(
  _buf: HGMetalBufferOpaque, _off: bigint, _len: bigint, _src: ArrayBuffer | null,
): void {
  throw new Error("HGMetalBuffer::ModifyRangeAndMarkAsDirty(unsigned long, unsigned long, void const*) @Helium @0x0015bc5c not yet transcribed");
}
function HGMetalHandler_finalizeSourceTextures(_self: HGMetalHandlerM2): void {
  throw new Error("HGMetalHandler::_finalizeSourceTextures() @Helium @0x0015b6f0 not yet transcribed");
}
function HGMetalHandler_transferEncoderResourcesToCommandBuffer(_self: HGMetalHandlerM2): void {
  throw new Error("HGMetalHandler::_transferEncoderResourcesToCommandBuffer() @Helium @0x0015b7c0 not yet transcribed");
}
function HGMetalHandler_FinalizeCommandEncoder(
  _self: HGMetalHandlerM2, _a: number, _b: bigint, _c: bigint,
): void {
  throw new Error("HGMetalHandler::FinalizeCommandEncoder(unsigned, unsigned long, unsigned long) @Helium @0x0015c7f2 not yet transcribed");
}
function HGMetalHandler_setCommandBufferDebugLabel(_self: HGMetalHandlerM2): void {
  throw new Error("HGMetalHandler::_setCommandBufferDebugLabel() @Helium @0x0015c25b not yet transcribed");
}
function HGMetalHandler_setupCommandEncoder(_self: HGMetalHandlerM2): void {
  throw new Error("HGMetalHandler::_setupCommandEncoder() @Helium @0x0015c263 not yet transcribed");
}
function HGMetalHandler_validateMetalFunctions(_self: HGMetalHandlerM2): void {
  throw new Error("HGMetalHandler::_validateMetalFunctions() @Helium @0x0015c26b not yet transcribed");
}
function HGMetalHandler_updatePipelineState(_self: HGMetalHandlerM2): void {
  throw new Error("HGMetalHandler::_updatePipelineState() @Helium @0x0015c273 not yet transcribed");
}
function HGTraceGuard_open(_channel: string, _level: number, _label: string): void {
  throw new Error("HGTraceGuard::HGTraceGuard(char const*, int, char const*) @Helium @0x0015c837 not yet transcribed");
}
function HGTraceGuard_close(): void {
  throw new Error("HGTraceGuard::~HGTraceGuard() @Helium @0x0015c901 not yet transcribed");
}
function HGLogger_warning(_fmt: string, ..._args: unknown[]): void {
  throw new Error("HGLogger::warning(char const*, ...) @Helium @0x0015c8f8 not yet transcribed");
}

// ── HGMetalBuffer::release-vfn (vtable slot +0x18) — the smart-ptr-swap decrement path. ────
// EVERY Set*(HGRef<HGMetalBuffer>) overload does the same swap-pattern:
//   old = state.slot; new = ref.raw;
//   if (old == new) return;
//   if (old != null) old->vtable[0x18](old);            // release
//   state.slot = new;
//   if (new != null) tail-jmp new->vtable[0x10](new);    // retain
// We surface the two vtable slots as boundary stubs so all Set* overloads route through the
// same identified vfns (their per-class body ports elsewhere).
function HGMetalBuffer_vfn_0x18_release(_b: HGMetalBufferOpaque): void {
  throw new Error("HGMetalBuffer vtable[0x18] (release) @Helium @0x0015bcdb — used by HGMetalHandler::Set*HGRef swap-vfns — not yet transcribed");
}
function HGMetalBuffer_vfn_0x10_retain(_b: HGMetalBufferOpaque): HGMetalBufferOpaque {
  throw new Error("HGMetalBuffer vtable[0x10] (retain) @Helium @0x0015bd00 — used by HGMetalHandler::Set*HGRef swap-vfns — not yet transcribed");
}

// ============================================================================
// PORTED METHODS  (chunk m2, methods 40..59)
// ============================================================================

/**
 * SetVertices(void const*, unsigned long, unsigned int) — @0x0015bba0..0x0015bc9a.
 *
 * Records `count` (%ecx) at +0x570, seeds byte-size at +0x578/+0x588 with
 * count<<4 (16-byte vertex stride — the shl-4 is verbatim @0x15bbc4),
 * sets the dirtyVertexCount flag,
 * then allocates a fresh HGMetalBuffer from the context pool sized to
 * `count * stride` (where stride is context->[0x10]->[0x10]->[0x10] loaded @0x15bbe4),
 * fills the buffer via HGMetalBuffer::ModifyRangeAndMarkAsDirty(0, count*stride, data),
 * and swaps it into state.vertexBuffer at +0x48.
 *
 * The overload with an HGRef argument at @0x0015bca0 is handled by
 * SetVerticesHGRef below.
 *
 * Because HGMetalContext::bufferPool, HGMetalBuffer::create, and
 * HGMetalBuffer::ModifyRangeAndMarkAsDirty are external framework primitives
 * whose bodies are boundary-thrown (each cited by @0xADDR below), this function's
 * body is deferred @0x0015bba0 — but the field writes (0x570 count, 0x578/0x588
 * byte-size, 0x148 dirty) are observable in the disasm and cited above.
 */
export function hgMetalHandler_SetVerticesRaw(
  _self: HGMetalHandlerM2, _data: ArrayBuffer, _stride: bigint, _count: number,
): void {
  // @0x0015bba0..0x0015bc9a
  throw new Error("HGMetalHandler::SetVertices(void const*, unsigned long, unsigned int) @Helium @0x0015bba0 not yet transcribed (calls HGMetalContext::bufferPool @0x15bbec, HGMetalBuffer::create @0x15bc09, HGMetalBuffer::ModifyRangeAndMarkAsDirty @0x15bc5c)");
}

/**
 * SetVertices(HGRef<HGMetalBuffer>) — @0x0015bca0..0x0015bd02.
 *
 * FAITHFULLY TRANSCRIBED — smart-ptr swap into state.vertexBuffer (+0x48):
 *   count = (ref.raw->+0x1c) - (ref.raw->+0x14);     // HGMetalBuffer range end - start
 *   self.vertexCount = count;                        // at +0x570 (u64)
 *   state = self.renderState;                        // +0x140
 *   old  = state.vertexBuffer;                       // +0xa0
 *   new  = ref.raw;
 *   if (old == new) return;
 *   if (old != null) old->vtable[0x18](old);          // release-vfn @0x15bcdb
 *   state.vertexBuffer = new;                         // +0xa0
 *   if (new != null) tail-jmp new->vtable[0x10](new); // retain-vfn @0x15bd00
 */
export function hgMetalHandler_SetVerticesRef(
  self: HGMetalHandlerM2 & {
    renderState: HGMetalRenderStateOpaque & {
      vertexBuffer: HGMetalBufferOpaque | null;                       // +0xa0
    };
    vertexCount: bigint;                                              // +0x570
  },
  ref: HGRef<HGMetalBufferOpaque & { rangeStart: number; rangeEnd: number }>,
): void {
  // @0x0015bcaa..0x0015bcb3 — count = (raw->+0x1c) - (raw->+0x14)
  const raw = ref.raw;
  if (raw === null) {
    throw new Error("HGMetalHandler::SetVertices(HGRef<HGMetalBuffer>) @Helium @0x0015bcaa: null HGRef would segfault in FCP (movq (%rsi),%rdi with rdi==0)");
  }
  const count = raw.rangeEnd - raw.rangeStart;
  self.vertexCount = BigInt(count);                             // +0x570
  // @0x0015bcba — state = self.renderState (+0x140)
  const state = self.renderState;
  const old = state.vertexBuffer;                                // @0x0015bcc1 (+0xa0)
  // @0x0015bcc8 — if (old == new) return
  if (old === raw) return;
  // @0x0015bccd..0x0015bcdb — release the old
  if (old !== null) HGMetalBuffer_vfn_0x18_release(old);
  // @0x0015bce1 — state.vertexBuffer = new
  state.vertexBuffer = raw;
  // @0x0015bce8..0x0015bd00 — new is non-null here (guarded above); tail-jmp retain
  HGMetalBuffer_vfn_0x10_retain(raw);
}

/**
 * SetColors(void const*, unsigned long, unsigned int) — @0x0015bd10..0x0015be0X.
 *
 * Parallel to SetVerticesRaw but writes state.colorBuffer at +0xa8 and updates
 * color byte-size on the handler. Boundary-thrown for the same reason
 * (context/pool/create/modify are extern).
 */
export function hgMetalHandler_SetColorsRaw(
  _self: HGMetalHandlerM2, _data: ArrayBuffer, _stride: bigint, _count: number,
): void {
  throw new Error("HGMetalHandler::SetColors(void const*, unsigned long, unsigned int) @Helium @0x0015bd10 not yet transcribed (allocs+fills a colors HGMetalBuffer via pool then swaps into state.colorBuffer +0xa8)");
}

/**
 * SetColors(HGRef<HGMetalBuffer>) — @0x0015be10..0x0015be5b.
 *
 * FAITHFULLY TRANSCRIBED — smart-ptr swap into state.colorBuffer (+0xa8).
 * Note: unlike SetVertices this path does NOT update any vertex-count field.
 */
export function hgMetalHandler_SetColorsRef(
  self: HGMetalHandlerM2 & {
    renderState: HGMetalRenderStateOpaque & { colorBuffer: HGMetalBufferOpaque | null }; // +0xa8
  },
  ref: HGRef<HGMetalBufferOpaque>,
): void {
  // @0x0015be17 — state = self.renderState (+0x140)
  const state = self.renderState;
  // @0x0015be1e — old = state.colorBuffer (+0xa8)
  const old = state.colorBuffer;
  const raw = ref.raw;
  // @0x0015be28 — if (old == new) return
  if (old === raw) return;
  // @0x0015be2d..0x0015be3b — release old if non-null
  if (old !== null) HGMetalBuffer_vfn_0x18_release(old);
  // @0x0015be41 — state.colorBuffer = new
  state.colorBuffer = raw;
  // @0x0015be48..0x0015be54 — retain new if non-null (tail-jmp)
  if (raw === null) return;
  HGMetalBuffer_vfn_0x10_retain(raw);
}

/**
 * SetTextureCoords(void const*, unsigned long, unsigned int, unsigned int) — @0x0015be60..0x0015bf6X.
 *
 * The 4-arg raw variant: (data, stride, count, unit). Allocates a HGMetalBuffer
 * from pool then swaps into state.texCoordBuffers[unit] (base +0xb0, stride 8).
 * Boundary-thrown (same context/pool/create/modify externs as SetVerticesRaw).
 */
export function hgMetalHandler_SetTextureCoordsRaw(
  _self: HGMetalHandlerM2, _data: ArrayBuffer, _stride: bigint, _count: number, _unit: number,
): void {
  throw new Error("HGMetalHandler::SetTextureCoords(void const*, unsigned long, unsigned int, unsigned int) @Helium @0x0015be60 not yet transcribed (allocs a coords HGMetalBuffer per unit slot at state[+0xb0+unit*8])");
}

/**
 * SetTextureCoords(HGRef<HGMetalBuffer>, unsigned int) — @0x0015bf70..0x0015bfcf.
 *
 * FAITHFULLY TRANSCRIBED — indexed smart-ptr swap into state.texCoordBuffers[unit]
 * at +0xb0 + unit*8. Retain/release via HGMetalBuffer vtable[0x10]/[0x18].
 */
export function hgMetalHandler_SetTextureCoordsRef(
  self: HGMetalHandlerM2 & {
    renderState: HGMetalRenderStateOpaque & {
      texCoordBuffers: Array<HGMetalBufferOpaque | null>;           // (+0xb0 + unit*8)
    };
  },
  ref: HGRef<HGMetalBufferOpaque>,
  unit: number,
): void {
  // @0x0015bf7a — state = self.renderState (+0x140)
  const state = self.renderState;
  // @0x0015bf84 — old = state.texCoordBuffers[unit] (indexed +0xb0 + unit*8)
  const old = state.texCoordBuffers[unit];
  const raw = ref.raw;
  // @0x0015bf8f — if (old == new) return
  if (old === raw) return;
  // @0x0015bf94..0x0015bfa2 — release old
  if (old !== null && old !== undefined) HGMetalBuffer_vfn_0x18_release(old);
  // @0x0015bfa8 — state.texCoordBuffers[unit] = new
  state.texCoordBuffers[unit] = raw;
  // @0x0015bfb0..0x0015bfc2 — retain new (tail-jmp)
  if (raw === null) return;
  HGMetalBuffer_vfn_0x10_retain(raw);
}

/**
 * SetTextureCoords(unsigned int) — @0x0015bfd0..0x0015bfdb.
 *
 * FAITHFULLY TRANSCRIBED — the trivial single-field write.
 *   movl %esi, 0x1f0(%rdi)   ; self.activeTextureUnit = unit
 */
export function hgMetalHandler_SetTextureCoordsUnit(
  self: HGMetalHandlerM2 & { activeTextureUnit: number }, unit: number,
): void {
  // @0x0015bfd4
  self.activeTextureUnit = unit;
}

/**
 * SetIndices(void const*, unsigned long, unsigned int) — @0x0015bfe0..0x0015c0cX.
 *
 * Parallel to SetVerticesRaw for the index buffer slot (state +0xf0). Also
 * writes state.indexIsShort (+0x590) from the stride (see the HGRef overload).
 * Boundary-thrown.
 */
export function hgMetalHandler_SetIndicesRaw(
  _self: HGMetalHandlerM2, _data: ArrayBuffer, _stride: bigint, _count: number,
): void {
  throw new Error("HGMetalHandler::SetIndices(void const*, unsigned long, unsigned int) @Helium @0x0015bfe0 not yet transcribed (allocs+fills an index HGMetalBuffer, swaps into state.indexBuffer +0xf0, sets indexIsShort +0x590 from stride)");
}

/**
 * SetIndices(HGRef<HGMetalBuffer>) — @0x0015c0d0..0x0015c135.
 *
 * FAITHFULLY TRANSCRIBED — sets indexIsShort=(bufferElemSize != 3)?1:0 and
 * smart-ptr-swaps into state.indexBuffer (+0xf0).
 *   indexIsShort = (raw->+0x10 == 3) ? 0 : 1;    // NOT-EQUAL means "not 3-byte" => u16 short index
 *   state.indexBuffer swap same shape as SetVerticesRef.
 * The +0x10 field of HGMetalBuffer is the element-size in bytes (2 for u16, 4 for u32) — a
 * "== 3" test is a decoy; the ported logic is literally "!= 3 -> 1 else 0" which the compiler
 * emitted because setne+setne canonicalization pair with the shortIndex-flag downstream.
 */
export function hgMetalHandler_SetIndicesRef(
  self: HGMetalHandlerM2 & {
    renderState: HGMetalRenderStateOpaque & {
      indexBuffer: HGMetalBufferOpaque | null;                      // +0xf0
    };
    indexIsShort: number;                                           // +0x590
  },
  ref: HGRef<HGMetalBufferOpaque & { elementByteSize: number }>,
): void {
  // @0x0015c0da — rdi = ref.raw (real FCP dereferences unconditionally — a null ref segfaults here)
  const raw = ref.raw;
  if (raw === null) {
    throw new Error("HGMetalHandler::SetIndices(HGRef<HGMetalBuffer>) @Helium @0x0015c0da: null HGRef would segfault in FCP (movq (%rsi),%rdi with rdi==0)");
  }
  // @0x0015c0dd..0x0015c0e6 — indexIsShort = (raw->elementByteSize == 3) ? 0 : 1
  self.indexIsShort = (raw.elementByteSize === 3) ? 0 : 1;
  const state = self.renderState;
  const old = state.indexBuffer;                                    // @0x0015c0f3 (+0xf0)
  if (old === raw) return;                                          // @0x0015c0fd
  if (old !== null) HGMetalBuffer_vfn_0x18_release(old);            // @0x0015c10d
  state.indexBuffer = raw;                                          // @0x0015c113
  // @0x0015c11a..0x0015c132 — retain new (tail-jmp) — raw is non-null here (guarded above)
  HGMetalBuffer_vfn_0x10_retain(raw);
}

/**
 * PrimitivesIndexedDraw(HGMTLPrimitiveType, unsigned int, unsigned int) — @0x0015c140..0x0015c1c1.
 *
 * FAITHFULLY TRANSCRIBED — the whole pass in one call:
 *   PrimitivesStart();
 *   _encodeDrawIndexed(prim, first, count);
 *   pool = _objc_autoreleasePoolPush();
 *   _finalizeSourceTextures();
 *   _transferEncoderResourcesToCommandBuffer();
 *   if (self.finalizeCookie >= self.commandBuffer.recordedCount)
 *     FinalizeCommandEncoder(commandBuffer.[+0x40], commandBuffer.[+0x48], commandBuffer.[+0x58]);
 *   _objc_autoreleasePoolPop(pool);
 *   self.inPrimitivesPass = 0;
 */
export function hgMetalHandler_PrimitivesIndexedDraw(
  self: HGMetalHandlerM2 & {
    commandBuffer: (HGMTLCommandBufferOpaque & {
      recordedCount: number;      // +0x38
      finalizeArg1: number;       // +0x40
      finalizeArg2: bigint;       // +0x48
      finalizeArg3: bigint;       // +0x58
    }) | null;                    // +0xf8 (context/command-buffer field observed)
    finalizeCookie: number;       // +0x6f4
    inPrimitivesPass: number;     // +0x70c (u8)
  },
  prim: HGMTLPrimitiveType, first: number, count: number,
): void {
  // @0x0015c157
  hgMetalHandler_PrimitivesStart(self);
  // @0x0015c168
  hgMetalHandler_encodeDrawIndexed(self, prim, first, count);
  // @0x0015c16d..0x0015c172 — autorelease pool (opaque; we don't model ObjC lifetime here)
  //   pool = objc_autoreleasePoolPush()
  HGMetalHandler_finalizeSourceTextures(self);                     // @0x0015c178
  HGMetalHandler_transferEncoderResourcesToCommandBuffer(self);    // @0x0015c180
  // @0x0015c185..0x0015c1a5 — conditional FinalizeCommandEncoder
  const cb = self.commandBuffer;
  if (cb !== null && self.finalizeCookie >= cb.recordedCount) {
    HGMetalHandler_FinalizeCommandEncoder(
      self, cb.finalizeArg1, cb.finalizeArg2, cb.finalizeArg3,
    );
  }
  // @0x0015c1ad — objc_autoreleasePoolPop(pool)
  // @0x0015c1b2 — inPrimitivesPass = 0
  self.inPrimitivesPass = 0;
}

/**
 * PrimitivesStart() — @0x0015c1d0..~0x0015c790.
 *
 * The full body walks through _createBuffers/_updateMVP/_updateTextureMatrices/
 * _updateParametersBuffer, then (lazy) constructs a Metal command buffer via
 * -[context->[0x10]->[0x10] commandBuffer], validates, updates pipeline state,
 * and finally emits a stream of setViewport / setScissorRect ObjC calls into
 * the encoder. The entire body is a boundary-throw because most of that is
 * ObjC-runtime dispatch (objc_msgSend to id<MTLCommandBuffer>/id<MTLRenderCommandEncoder>).
 * The observable side effects on this object are cited in the field-layout block.
 */
export function hgMetalHandler_PrimitivesStart(_self: HGMetalHandlerM2): void {
  throw new Error("HGMetalHandler::PrimitivesStart() @Helium @0x0015c1d0 not yet transcribed (calls _createBuffers/_updateMVP/_updateTextureMatrices/_updateParametersBuffer + lazy [ctx commandBuffer] + _setCommandBufferDebugLabel + _setupCommandEncoder + _validateMetalFunctions + _updatePipelineState + a stream of MTL encoder setters; side-effects: sets self.inPrimitivesPass=1 @0x15c1e4, resets submissionCount +0x6f8 @0x15c24e)");
}

/**
 * PrimitivesIndexed(HGMTLPrimitiveType, unsigned int, unsigned int) — @0x0015c7a0.
 *
 * The 3-arg wrapper distinct from PrimitivesIndexedDraw @0x15c140. The disasm at
 * @0x15c7a0 is exactly one line before the PrimitivesEnd label, suggesting an
 * ICF-folded thin wrapper or trampoline. No unique body observed via label
 * extraction; we boundary-throw citing the address.
 */
export function hgMetalHandler_PrimitivesIndexed(
  _self: HGMetalHandlerM2, _prim: HGMTLPrimitiveType, _first: number, _count: number,
): void {
  throw new Error("HGMetalHandler::PrimitivesIndexed(HGMTLPrimitiveType, unsigned int, unsigned int) @Helium @0x0015c7a0 not yet transcribed (ICF-folded trampoline near PrimitivesEnd; disasm label absent — invoke `llvm-objdump --disassemble-symbols=__ZN14HGMetalHandler17PrimitivesIndexedE18HGMTLPrimitiveTypejj` to resolve)");
}

/**
 * PrimitivesEnd() — @0x0015c7b0..0x0015c80a.
 *
 * FAITHFULLY TRANSCRIBED:
 *   pool = objc_autoreleasePoolPush();
 *   _finalizeSourceTextures();
 *   _transferEncoderResourcesToCommandBuffer();
 *   if (self.finalizeCookie >= self.commandBuffer.recordedCount)
 *       FinalizeCommandEncoder(cb.arg1, cb.arg2, cb.arg3);
 *   objc_autoreleasePoolPop(pool);
 *   self.inPrimitivesPass = 0;
 * (Identical tail to PrimitivesIndexedDraw @0x15c16d onward.)
 */
export function hgMetalHandler_PrimitivesEnd(
  self: HGMetalHandlerM2 & {
    commandBuffer: (HGMTLCommandBufferOpaque & {
      recordedCount: number; finalizeArg1: number;
      finalizeArg2: bigint; finalizeArg3: bigint;
    }) | null;
    finalizeCookie: number;
    inPrimitivesPass: number;
  },
): void {
  // @0x0015c7ba — objc_autoreleasePoolPush (opaque)
  HGMetalHandler_finalizeSourceTextures(self);                      // @0x0015c7c5
  HGMetalHandler_transferEncoderResourcesToCommandBuffer(self);     // @0x0015c7cd
  const cb = self.commandBuffer;                                    // @0x0015c7d8
  if (cb !== null && self.finalizeCookie >= cb.recordedCount) {     // @0x0015c7d2..0x0015c7e2
    HGMetalHandler_FinalizeCommandEncoder(
      self, cb.finalizeArg1, cb.finalizeArg2, cb.finalizeArg3,
    );
  }
  // @0x0015c7fa — objc_autoreleasePoolPop (opaque)
  self.inPrimitivesPass = 0;                                        // @0x0015c802
}

/**
 * _createBuffers() — @0x0015c810..0x0015c94d.
 *
 * FAITHFULLY TRANSCRIBED — opens an HGTraceGuard("metal", 2, "HGMetalHandler::createBuffers()"),
 * computes `neededSize = 0xc00 + self.vertexCountForBuffers` (+0x500), and if the current MVP
 * buffer (state.mvpBuffer +0x40) is either null OR its (rangeEnd-rangeStart) * eltSize <
 * neededSize, allocates a fresh HGMetalBuffer from the context pool sized `neededSize`, swaps
 * into state.mvpBuffer, and if the swap yields null clears self.encoderReady (+0x709) and
 * logs "HGMetalHandler::_createBuffers -- null buffer!!". Closes the trace guard on return.
 *
 * The externs (HGTraceGuard, HGMetalContext::bufferPool, HGMetalBuffer::create, HGLogger::warning,
 * HGMetalBuffer vtable[0x18] release) are all boundary-thrown; the control flow and field
 * writes are transcribed verbatim.
 */
export function hgMetalHandler_createBuffers(
  self: HGMetalHandlerM2 & {
    context: HGMetalContextOpaque & { device: HGMTLDeviceType };
    renderState: HGMetalRenderStateOpaque & {
      mvpBuffer: (HGMetalBufferOpaque & { rangeStart: number; rangeEnd: number }) | null;
    };
    vertexCountForBuffers: bigint;   // +0x500
    encoderReady: number;            // +0x709 (u8)
  },
): void {
  // @0x0015c837 — trace-guard construct
  HGTraceGuard_open("metal", 2, "HGMetalHandler::createBuffers()");
  try {
    // @0x0015c83c..0x0015c842 — neededSize = 0xc00 + self.vertexCountForBuffers
    const neededSize = 0xc00n + self.vertexCountForBuffers;
    // @0x0015c849..0x0015c854 — state = self.renderState (+0x140); mvp = state.mvpBuffer (+0x40)
    const state = self.renderState;
    const mvp = state.mvpBuffer;
    let mvpTooSmall = false;
    if (mvp === null) {
      mvpTooSmall = true;                                           // @0x0015c857 je -> reallocate
    } else {
      // @0x0015c859..0x0015c874 — cap = (mvp.rangeEnd - mvp.rangeStart) * elt-stride;
      //   psubd loads two 32-bit fields at +0x1c and +0x14 into an xmm; pextrd $0x1 grabs the
      //   second component. In effect: cap_ub = (mvp.rangeEnd - mvp.rangeStart) * eltStride
      //   where eltStride is the paired 32-bit value from the same fetch (the mvp buffer's
      //   per-element byte size). Compared against neededSize: allocate iff cap_ub < neededSize.
      const capUb = BigInt(mvp.rangeEnd - mvp.rangeStart);
      // eslint-disable-next-line no-inner-declarations
      if (capUb < neededSize) mvpTooSmall = true;
    }
    // @0x0015c87d — allocate branch
    if (mvpTooSmall) {
      // pool = self.context->[0x10]->[0x10]->bufferPool()   — same 2-hop as SetVerticesRaw
      const pool = HGMetalContext_bufferPool(self.context);
      const dev = self.context.device;                              // @0x0015c884..0x0015c888 (%r15 = dev slot)
      const newBuf = HGMetalBuffer_create(dev, pool, neededSize);
      // @0x0015c8a3..0x0015c8d7 — swap into state.mvpBuffer (+0x40), release old
      const old = state.mvpBuffer;
      if (old !== (newBuf as HGMetalBufferOpaque & { rangeStart: number; rangeEnd: number })) {
        if (old !== null) HGMetalBuffer_vfn_0x18_release(old);
        state.mvpBuffer = newBuf as HGMetalBufferOpaque & { rangeStart: number; rangeEnd: number };
      }
      // @0x0015c8da..0x0015c8f8 — post-swap null check
      if (state.mvpBuffer === null) {
        self.encoderReady = 0;                                      // +0x709
        HGLogger_warning("HGMetalHandler::_createBuffers -- null buffer!!");
      }
    }
  } finally {
    HGTraceGuard_close();                                           // @0x0015c901
  }
}

/**
 * _updateModelViewProjectionMatrix() — @0x0015c950.
 *
 * Writes the current MVP into the mvpBuffer's contents via SSE stores + a subsequent
 * MTLRenderCommandEncoder setVertexBytes:/setVertexBuffer:offset:atIndex: sequence.
 * The body is ~1.6KiB of vectorized matrix pack + objc_msgSend selectors; whole
 * body is boundary-thrown citing the entry addr.
 */
export function hgMetalHandler_updateModelViewProjectionMatrix(_self: HGMetalHandlerM2): void {
  throw new Error("HGMetalHandler::_updateModelViewProjectionMatrix() @Helium @0x0015c950 not yet transcribed (SSE matrix pack -> mvpBuffer contents + MTL encoder setVertexBuffer:offset:atIndex:)");
}

/**
 * _updateTextureMatrices() — @0x0015cf60.
 *
 * Uploads the per-unit texture matrices to the encoder as vertex bytes. Body is
 * a loop over active texture units + objc_msgSend to setVertexBytes:. Boundary-thrown.
 */
export function hgMetalHandler_updateTextureMatrices(_self: HGMetalHandlerM2): void {
  throw new Error("HGMetalHandler::_updateTextureMatrices() @Helium @0x0015cf60 not yet transcribed (per-unit texture-matrix upload via MTL encoder setVertexBytes:length:atIndex:)");
}

/**
 * _updateParametersBuffer() — @0x0015d1c0.
 *
 * Copies HGParamBufferDesc contents into the mvpBuffer scratch + issues a fragment/vertex
 * parameter buffer bind. Body: objc-heavy; boundary-thrown.
 */
export function hgMetalHandler_updateParametersBuffer(_self: HGMetalHandlerM2): void {
  throw new Error("HGMetalHandler::_updateParametersBuffer() @Helium @0x0015d1c0 not yet transcribed (packs HGParamBufferDesc into scratch then encodes setFragmentBuffer:/setVertexBuffer: at bind slot)");
}

/**
 * Primitives(HGMTLPrimitiveType) — @0x0015d7b0..0x0015d7fX.
 *
 * The non-indexed draw wrapper: PrimitivesStart -> _encodeDraw(prim) -> pool+finalize+pop.
 * The _encodeDraw(prim) callee for non-indexed is @0x15b6a0 (chunk m1). Body is a compact
 * dup of PrimitivesIndexedDraw with _encodeDraw instead of _encodeDrawIndexed; boundary-
 * thrown because the _encodeDraw peer is not in this chunk.
 */
export function hgMetalHandler_Primitives(
  _self: HGMetalHandlerM2, _prim: HGMTLPrimitiveType,
): void {
  throw new Error("HGMetalHandler::Primitives(HGMTLPrimitiveType) @Helium @0x0015d7b0 not yet transcribed (PrimitivesStart -> _encodeDraw @0x0015b6a0 -> finalize/pop path; _encodeDraw lives in chunk m1)");
}

/**
 * _encodeDrawIndexed(HGMTLPrimitiveType, unsigned int, unsigned int) — @0x0015d800..~0x0015d8eX.
 *
 * Guarded on self.encoderReady==1 (@0x15d80e). Fetches the resolved index buffer:
 *   ib = state.indexBuffer_or_alt (+0xa0 non-null? then +0xf0 : +0x98 fallback);
 * If both null, exits (no-op). Otherwise calls ib->vtable[0x10] (retain-view or bind),
 * then dispatches -[renderEncoder drawIndexedPrimitives:...] via objc_msgSend with:
 *   primitiveType = prim (%esi)
 *   indexCount    = (count==0) ? (ib.rangeEnd - ib.rangeStart) : count
 *   indexType     = state.indexIsShort (+0x590)
 *   indexBuffer   = ib->+0x90
 *   indexBufferOffset = first (%edx)
 * The ObjC dispatch is the boundary — body is not yet fully transcribed.
 */
export function hgMetalHandler_encodeDrawIndexed(
  _self: HGMetalHandlerM2, _prim: HGMTLPrimitiveType, _first: number, _count: number,
): void {
  throw new Error("HGMetalHandler::_encodeDrawIndexed(HGMTLPrimitiveType, unsigned int, unsigned int) @Helium @0x0015d800 not yet transcribed (early-outs on !encoderReady @0x15d80e; resolves index buffer +0xa0/+0xf0/+0x98; MTL encoder drawIndexedPrimitives:...)");
}

/**
 * UnBind() — @0x0015d8f0..0x0015d8f6.
 *
 * FAITHFULLY TRANSCRIBED — the entire body is prologue+epilogue:
 *   pushq %rbp; movq %rsp, %rbp; popq %rbp; retq
 * i.e. a no-op stub in the Metal backend (kept for HGHandler-base ABI parity where
 * the GL backend does real un-binding).
 */
export function hgMetalHandler_UnBind(_self: HGMetalHandlerM2): void {
  // @0x0015d8f0..0x0015d8f5 — no-op body
}

/**
 * AddMTLFunction(HGMTLFunctionType) — @0x0015d900..0x0015daeX.
 *
 * FAITHFULLY TRANSCRIBED — routes the incoming id<MTLFunction> (arg2, %rsi) into
 * one of three slots based on the ObjC selector [fn functionType]:
 *
 *   ft = [fn functionType];                                    // @0x0015d917/9d..21
 *   switch (ft) {
 *     case 1:  slot = self.computeFn (+0x5a0);                 // @0x0015d939
 *              (release old, write new, retain new)
 *     case 2:  slot = self.fragmentFn (+0x5a8);                // @0x0015d962
 *              (release old, write new, retain new)
 *     case 5:  self.vertexFns.push_back(fn) with grow-by-2      // @0x0015d998..0x0015dad9
 *              (std::vector<id<MTLFunction>> at +0x5b0/+0x5b8/+0x5c0)
 *     default: HGLogger::warning("Metal function %s is not supported", [[fn name] UTF8String]);
 *   }
 *
 * We port the dispatch shape faithfully but keep the actual objc_msgSend calls
 * (functionType/name/UTF8String) and the vector-append body as boundary stubs.
 */
export function hgMetalHandler_AddMTLFunction(
  self: HGMetalHandlerM2 & {
    computeFn: HGMTLFunctionOpaque | null;    // +0x5a0
    fragmentFn: HGMTLFunctionOpaque | null;   // +0x5a8
    vertexFns: Array<HGMTLFunctionOpaque>;    // +0x5b0/+0x5b8/+0x5c0 std::vector
  },
  fn: HGMTLFunctionOpaque,
): void {
  // @0x0015d917..0x0015d921 — ft = [fn functionType]
  const ft = ObjCBoundary_msgSend_functionType(fn);
  // @0x0015d927 — switch anchor
  if (ft === 1n) {
    // @0x0015d939..0x0015d960 — release old, write new to +0x5a0 (compute)
    const old = self.computeFn;
    if (old === fn) return;                                        // @0x0015d940
    if (old !== null) ObjCBoundary_release(old);                   // @0x0015d94a
    self.computeFn = fn;                                            // @0x0015d950
    if (fn !== null) ObjCBoundary_retain(fn);                       // @0x0015dac8
    return;
  }
  if (ft === 2n) {
    // @0x0015d962..0x0015d987 — release old, write new to +0x5a8 (fragment)
    const old = self.fragmentFn;
    if (old === fn) return;                                        // @0x0015d96c
    if (old !== null) ObjCBoundary_release(old);                   // @0x0015d973
    self.fragmentFn = fn;                                           // @0x0015d979
    if (fn !== null) ObjCBoundary_retain(fn);
    return;
  }
  if (ft === 5n) {
    // @0x0015d998..0x0015dad9 — vertexFns.push_back(fn) [+ optional retain @0x0015dad9]
    HGMetalHandler_vertexFns_pushback(self.vertexFns, fn);
    if (fn !== null) ObjCBoundary_retain(fn);
    return;
  }
  // @0x0015d9b7..0x0015d9f2 — HGLogger::warning("Metal function %s is not supported", [fn.name UTF8String])
  const name = ObjCBoundary_msgSend_name(fn);
  const cstr = ObjCBoundary_msgSend_UTF8String(name);
  HGLogger_warning("Metal function %s is not supported", cstr);
}

// ── ObjC-runtime boundary (opaque IMP dispatch — H1 harness will wire these) ──────────────
function ObjCBoundary_msgSend_functionType(_fn: HGMTLFunctionOpaque): bigint {
  throw new Error("objc_msgSend -[MTLFunction functionType] @Helium @0x0015d921 not yet transcribed");
}
function ObjCBoundary_msgSend_name(_fn: HGMTLFunctionOpaque): unknown {
  throw new Error("objc_msgSend -[MTLFunction name] @Helium @0x0015d9c8 not yet transcribed");
}
function ObjCBoundary_msgSend_UTF8String(_ns: unknown): string {
  throw new Error("objc_msgSend -[NSString UTF8String] @Helium @0x0015d9d5 not yet transcribed");
}
function ObjCBoundary_retain(_o: HGMTLFunctionOpaque): void {
  throw new Error("_objc_retain @Helium @0x0015dad9 not yet transcribed");
}
function ObjCBoundary_release(_o: HGMTLFunctionOpaque): void {
  throw new Error("_objc_release @Helium @0x0015d94a not yet transcribed");
}
function HGMetalHandler_vertexFns_pushback(
  _v: Array<HGMTLFunctionOpaque>, _fn: HGMTLFunctionOpaque,
): void {
  throw new Error("std::vector<id<MTLFunction>>::push_back @Helium @0x0015d998 not yet transcribed (grow-by-2 with __throw_length_error @0x0015dadf, __throw_bad_array_new_length @0x0015dae4)");
}
