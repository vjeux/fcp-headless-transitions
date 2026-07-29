// raw-port: HGMetalHandler (chunk m3) — Helium.framework (render layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//                   Versions/A/Helium (x86_64 slice; VA == file offset).
// Chunk 3 of 5 ports methods [60..80) of HGMetalHandler.
//
// ── What HGMetalHandler is ──────────────────────────────────────────────────────────────
//
// HGMetalHandler is Helium's Metal command-buffer / command-encoder driver. It wraps a Metal
// device context and a running MTLCommandBuffer + MTLRenderCommandEncoder pair, and exposes the
// legacy HG-style state-setter API (SetBlendingInfo, EnableDepthBuffer, SetScissorRect, …). Under
// the hood it lazily creates the encoder, flushes pending state, and commits/finalizes buffers.
//
// The methods in this chunk are the "small state-setter" and "encoder-lifecycle" surface:
//   * SetAttributeFlags        — writes a single bit (bit 9) into `this+0x1f4` (an attribute flag)
//   * SetDebugInfo/DebugLabel  — assign the "debug node" pointer at +0x520 and delegate to
//                                `std::string::operator=` at +0x528 (the debug-label string)
//   * SetBlendingInfo (2×)     — copy a 32-byte HGBlendingInfo into a per-slot slice at
//                                (this+0x5d0 + slot*0x20). Uses HGBlendingInfo::operator== to
//                                early-out; if changed, mark the "state dirty" flag at +0x708.
//   * EnableBlending / DisableBlending (both overloads) — flip a bit in the per-slot mask at
//                                +0x5c8, and mark +0x708 dirty on change.
//   * EnableDepthBuffer/Disable — lazily create/destroy an HGMetalTexture depth attachment at
//                                +0x1d0. EnableDepthBuffer first FinalizeCommandEncoder-flushes
//                                any in-flight encoder, then asks HGGPURenderer for the metal
//                                context and HGMetalTexture::createDepth for a new depth tex.
//                                DisableDepthBuffer releases the ref at +0x1d0 via vtable slot
//                                +0x18 (release()) and clears the slot.
//   * SetScissorTest/Rect      — write a bool at +0x6e0 and a 16-byte HGRect at +0x6e4.
//                                (Note: +0x6e4 is a 4-byte-misaligned address — the store uses
//                                `movups` (unaligned SSE); intended, not a bug.)
//   * SetBlendingColor         — copy a 16-byte float4 into +0x6d0 with `movaps` (16-byte aligned).
//   * FinalizeCommandEncoder(uint,ulong,ulong) — end-encoding + kdebug_trace + release the
//                                MTLRenderCommandEncoder handle at +0x108, then possibly
//                                _commitCommandBuffer + release the MTLCommandBuffer at +0x100
//                                (based on thresholds on +0x6f8, +0x130, +0x718).
//   * _stopEncoding            — smaller sibling of FinalizeCommandEncoder that only ends+traces+
//                                releases the encoder (no buffer commit). Tail-jmps kdebug_trace.
//   * _commitCommandBuffer     — the heavy commit path (196 asm lines): builds a completion
//                                block, appends a completion node to a linked list at +0x138,
//                                addCompletedHandler + commit on the MTLCommandBuffer. Ports as a
//                                throw-stub citing its @0xADDR in this chunk (systemic, needs
//                                its own chunk-decode for the block layout — see notes below).
//   * FinalizeCommandBuffer    — literal `SetX(1,1,1); tail-jmp FinalizeCommandEncoder(1,1,1)`.
//   * CheckStatus              — empty function (single ret; the compiler emitted no body).
//   * FrameEnd                 — reset per-frame counters at +0x6fc and +0x704 to 0, then (iff
//                                +0x90 is non-null) emit three kdebug_trace calls with tags
//                                0x2b794948 / 0x2b79494c / 0x2b794950 recording the per-frame
//                                stats (encoder count, present count). Tail-jmps kdebug_trace.
//
// ── Object layout observed in this chunk ─────────────────────────────────────────────────
//   +0x90    renderer_ptr        (HGGPURenderer*) — read for kdebug channel id (+0x3f8) and
//                                                    GetMetalContext (0x15dcde)
//   +0xf8    prev_encoder_desc*  — argv source for FinalizeCommandEncoder from EnableDepthBuffer
//                                    (+0x40 read as u32, +0x48 as u64, +0x58 as u64)
//   +0x100   mtl_command_buffer  (id<MTLCommandBuffer>) — released via objc_release when flushed
//   +0x108   mtl_render_encoder  (id<MTLRenderCommandEncoder>) — released via objc_release + set 0
//   +0x130   commit_threshold_A  (uint64) — buffer commit threshold (# of ops)
//   +0x138   completion_list_head — allocator'd 24-byte nodes chained via +0x10 (see cCB stub)
//   +0x190   device_ctx_ptr      — read for HGMTLDeviceType (+0x14) and HGMetalTexturePool (+0x1c)
//   +0x1d0   depth_texture*      (HGMetalTexture*) — lazy depth-buffer attachment
//   +0x1e0   depth_texture_type  (u32) — passed as HGMTLDeviceType to HGMetalTexture::createDepth
//   +0x1f4   attribute_flags     (byte) — bit 9 shifted into position by SetAttributeFlags
//   +0x520   debug_node_ptr      (HGNode*) — SetDebugInfo writes; SetDebugLabel writes 0
//   +0x528   debug_label         (std::string) — assigned via std::string::operator=
//   +0x5c8   blending_enable_mask (byte, per-slot bits) — E/D Blending flip bits here
//   +0x5d0   blending_info[N]    (HGBlendingInfo, 32 bytes each) — slot 0 at +0x5d0,
//                                slot N at +0x5d0 + N*0x20 (verified by shl $5 in dbb3)
//   +0x6d0   blending_color      (float4, 16 bytes, movaps-aligned)
//   +0x6e0   scissor_test_enabled (byte)
//   +0x6e4   scissor_rect        (HGRect, 16 bytes, movups-unaligned)
//   +0x6f8   encoder_count       (int32) — incremented after each endEncoding
//   +0x6fc   frame_encoder_count (u64) — reset to 0 in FrameEnd @0x15e340
//   +0x700   present_count       (u32) — incremented after each endEncoding
//   +0x704   frame_present_count (u32) — reset to 0 in FrameEnd @0x15e34b
//   +0x708   state_dirty_flag    (byte) — set to 1 whenever any state setter mutates
//   +0x70a   commit_buffer_flag  (byte) — cmp==1 gates _commitCommandBuffer's inner path
//   +0x70b   completion_flag_byte (byte) — captured into the completion-block state
//   +0x718   commit_threshold_B  (uint64) — added to +0x130 to compare against 3rd finalize arg
//
// ── Frontier callees new to this chunk (each becomes a throw-stub citing @0xADDR) ────────
//   HGBlendingInfo::operator==(HGBlendingInfo const&) const       @0x15db6d, 0x15dbc8
//   HGGPURenderer::GetMetalContext()                              @0x15dcde
//   HGMetalContext::texturePool() const                           @0x15dcfd
//   HGMetalTexture::createDepth(HGMTLDeviceType, HGMetalTexturePool*, HGRect, unsigned int)
//                                                                 @0x15dd19
//   HGMetalHandler::_setCommandEncoderDebugLabel()                @0x15def9, 0x15de34
//   ObjC message `endEncoding` (through objc_msgSend at +0x8a436b/+0x8a42a6)
//                                                                 @0x15de47, 0x15df0c
//   objc_release (through indirect stub at +0x8a4336/+0x8a42e7)   @0x15de84, 0x15ded3, 0x15ddb8
//   _kdebug_trace                                                 @0x15de78, 0x15df43, 0x15e37c,
//                                                                  0x15e39e, 0x15e3c6 (tail-jmp)
//   HGTraceGuard::HGTraceGuard(char const*, int, char const*)     @0x15df7c
//   operator new (__Znwm)                                         @0x15dfc4
//   __Unwind_Resume                                               @0x15dd85
//   ___clang_call_terminate                                       @0x15dd6b, 0x15dd8d
//   std::string::operator=(std::string const&)                    @0x15db26 (tail-jmp),
//                                                                  0x15db47 (tail-jmp)
//   vtable *0x18 on `this+0x1d0` (HGMetalTexture::release/dtor)   @0x15dd39, 0x15dd51, 0x15ddb8
//
// ── Note on _commitCommandBuffer ─────────────────────────────────────────────────────────
// _commitCommandBuffer @0x15df50 is 196 asm lines — a distinct sub-decode. It builds an
// __NSConcreteStackBlock completion handler (block descriptor
// `___block_descriptor_41_e8_32r_e28_v16?0"<MTLCommandBuffer>"8l`), allocates a 24-byte node
// via operator new, and links it into the completion-list at this+0x138. This chunk emits
// _commitCommandBuffer as a THROW-STUB citing @0x15df50 so callers (FinalizeCommandEncoder
// @0x15dec7, FinalizeCommandBuffer's tail-chain through it) get a loud not-yet-decoded gap.
// The block invoke helper `____ZN14HGMetalHandler20_commitCommandBufferEv_block_invoke` is
// an additional undecoded symbol reachable from this stub; that too is a frontier callee.

// ────────────────────────────────────────────────────────────────────────────
// Opaque brands. Chunk 0 (ctors/dtors) will widen `HGMetalHandler` with the full field-layout
// interface; the offsets used in this chunk are documented in the header above.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Opaque brand for HGMetalHandler receiver. All field access in this chunk is documented as
 * `%rdi+0xXXX` in the disasm and abstracted here into per-field accessors on `HGMetalHandlerFields`
 * (below) so tsc can typecheck without a full struct-layout port.
 */
export type HGMetalHandler = { readonly __brand: "HGMetalHandler_" };

/**
 * Field-access surface for HGMetalHandler used by this chunk. Chunk 0 will replace this with a
 * full typed struct; for now every field is documented at its +0xADDR in the file header.
 */
export interface HGMetalHandlerFields {
  // renderer/context
  get_renderer(self: HGMetalHandler): HGGPURenderer | null;                    // +0x90
  get_prev_encoder_desc(self: HGMetalHandler): { flag: number; a: bigint; b: bigint }; // +0xf8 (fields +0x40/+0x48/+0x58)
  get_mtl_command_buffer(self: HGMetalHandler): ObjCObject | null;             // +0x100
  set_mtl_command_buffer(self: HGMetalHandler, v: ObjCObject | null): void;
  get_mtl_render_encoder(self: HGMetalHandler): ObjCObject | null;             // +0x108
  set_mtl_render_encoder(self: HGMetalHandler, v: ObjCObject | null): void;
  get_commit_threshold_A(self: HGMetalHandler): bigint;                        // +0x130 (u64)
  get_commit_threshold_B(self: HGMetalHandler): bigint;                        // +0x718 (u64)
  get_device_ctx(self: HGMetalHandler): DeviceCtxFields;                        // +0x190
  // depth
  get_depth_texture(self: HGMetalHandler): HGMetalTexture | null;              // +0x1d0
  set_depth_texture(self: HGMetalHandler, v: HGMetalTexture | null): void;
  get_depth_texture_type(self: HGMetalHandler): number;                        // +0x1e0 (u32)
  // attribute flags
  set_attribute_flag_bit9(self: HGMetalHandler, on: boolean): void;            // +0x1f4 (byte)
  // debug
  set_debug_node_ptr(self: HGMetalHandler, p: unknown /* HGNode* */): void;   // +0x520
  get_debug_label(self: HGMetalHandler): StdString;                           // +0x528
  // blending
  get_blending_mask(self: HGMetalHandler): number;                             // +0x5c8 (byte)
  set_blending_mask(self: HGMetalHandler, v: number): void;
  get_blending_info(self: HGMetalHandler, slot: number): HGBlendingInfo;      // +0x5d0 + slot*0x20
  copy_blending_info(self: HGMetalHandler, slot: number, src: HGBlendingInfo): void;
  set_blending_color(self: HGMetalHandler, rgba: Float32Array): void;         // +0x6d0
  // scissor
  set_scissor_test(self: HGMetalHandler, on: boolean): void;                  // +0x6e0
  set_scissor_rect(self: HGMetalHandler, r: HGRect): void;                    // +0x6e4
  // encoder/present counters
  encoder_count(self: HGMetalHandler): number;                                // +0x6f8 (i32)
  inc_encoder_count(self: HGMetalHandler): void;
  present_count(self: HGMetalHandler): number;                                // +0x700 (u32)
  inc_present_count(self: HGMetalHandler): void;
  reset_frame_encoder_count(self: HGMetalHandler): void;                      // +0x6fc = 0
  reset_frame_present_count(self: HGMetalHandler): void;                      // +0x704 = 0
  frame_encoder_count(self: HGMetalHandler): number;                          // +0x700 read (see FrameEnd)
  frame_present_count(self: HGMetalHandler): number;                          // +0x704 read (see FrameEnd)
  // dirty
  mark_state_dirty(self: HGMetalHandler): void;                               // +0x708 = 1
  get_commit_buffer_flag(self: HGMetalHandler): number;                       // +0x70a (byte)
}

/**
 * ObjC object handle for the ports of MTLCommandBuffer / MTLRenderCommandEncoder. The compiler
 * emits `objc_msgSend`/`objc_release` through indirect stubs; in TS we route those through the
 * H1 harness's boundary-stub API. See raw-port/src/harness/ for the H1 runtime layer.
 */
export type ObjCObject = { readonly __brand: "ObjCObject" };

/** Opaque HGGPURenderer — full layout ported by its own class file. Used here for +0x3f8 (kdebug
 *  channel id read at 0x15de68/0x15df2d/0x15e36a/0x15e388/0x15e3aa). */
export type HGGPURenderer = {
  readonly __brand: "HGGPURenderer";
  readonly kdebug_channel_id: number; /* +0x3f8 read */
};

/** Device-context fields consumed by EnableDepthBuffer @0x15dcea/0x15dcee. Full class in its own port. */
export interface DeviceCtxFields {
  readonly device_type: number;  /* +0x14 -> HGMTLDeviceType (u32-ish) */
  readonly pool_ptr: unknown;    /* +0x1c -> HGMetalTexturePool* */
  readonly ctx_field_at_10: { readonly at_10: unknown }; /* +0x10.+0x10 chain for MTLDevice */
}

/** Opaque HGBlendingInfo — 32-byte struct compared via operator== and copied via 2×movups. */
export type HGBlendingInfo = { readonly __brand: "HGBlendingInfo" };

/** Opaque HGMetalTexture — has a vtable with slot +0x18 = release/dtor. */
export type HGMetalTexture = {
  readonly __brand: "HGMetalTexture";
  readonly vtable: { readonly slot_18: () => void };
};

/** Opaque HGRect — 16-byte value type (see raw-port/src/render/HGRect.ts). */
export type HGRect = { readonly __brand: "HGRect" };

/** Opaque std::string — full type in raw-port/src/infra/PCString.ts (or an std-string shim). */
export type StdString = { readonly __brand: "StdString" };

// ────────────────────────────────────────────────────────────────────────────
// Undecoded frontier callees — Spec Rule 3 (loud throw citing @0xADDR).
// ────────────────────────────────────────────────────────────────────────────

/** HGBlendingInfo::operator==(HGBlendingInfo const&) const. Called @0x15db6d, 0x15dbc8. */
function HGBlendingInfo_op_eq(_a: HGBlendingInfo, _b: HGBlendingInfo): boolean {
  throw new Error(
    "raw-port: HGBlendingInfo::operator==(HGBlendingInfo const&) const not yet transcribed " +
      "(called from HGMetalHandler::SetBlendingInfo @Helium 0x15db6d and " +
      "HGMetalHandler::SetBlendingInfo(int, HGBlendingInfo const&) @Helium 0x15dbc8)",
  );
}

/** HGGPURenderer::GetMetalContext(). Called @0x15dcde. */
function HGGPURenderer_GetMetalContext(_r: HGGPURenderer): DeviceCtxFields {
  throw new Error(
    "raw-port: HGGPURenderer::GetMetalContext() not yet transcribed " +
      "(called from HGMetalHandler::EnableDepthBuffer() @Helium 0x15dcde)",
  );
}

/** HGMetalContext::texturePool() const. Called @0x15dcfd. */
function HGMetalContext_texturePool(_ctx: DeviceCtxFields): unknown {
  throw new Error(
    "raw-port: HGMetalContext::texturePool() const not yet transcribed " +
      "(called from HGMetalHandler::EnableDepthBuffer() @Helium 0x15dcfd)",
  );
}

/** HGMetalTexture::createDepth(HGMTLDeviceType, HGMetalTexturePool*, HGRect, unsigned int).
 *  Called @0x15dd19. sret return via -0x28(%rbp). */
function HGMetalTexture_createDepth(
  _devType: number,
  _pool: unknown,
  _rect: HGRect,
  _flags: number,
): HGMetalTexture {
  throw new Error(
    "raw-port: HGMetalTexture::createDepth(HGMTLDeviceType, HGMetalTexturePool*, HGRect, unsigned int) " +
      "not yet transcribed (called from HGMetalHandler::EnableDepthBuffer() @Helium 0x15dd19)",
  );
}

/** HGMetalHandler::_setCommandEncoderDebugLabel(). Called @0x15def9, 0x15de34. */
function HGMetalHandler_setCommandEncoderDebugLabel(_self: HGMetalHandler): void {
  throw new Error(
    "raw-port: HGMetalHandler::_setCommandEncoderDebugLabel() not yet transcribed " +
      "(called from HGMetalHandler::_stopEncoding() @Helium 0x15def9 and " +
      "HGMetalHandler::FinalizeCommandEncoder(uint,ulong,ulong) @Helium 0x15de34)",
  );
}

/**
 * HGMetalHandler::_commitCommandBuffer(). @0x15df50 (Helium).
 *
 * 196 asm-lines that build an __NSConcreteStackBlock completion-handler (block descriptor
 * ___block_descriptor_41_e8_32r_e28_v16?0"<MTLCommandBuffer>"8l — 41-byte size, e8 32r captures),
 * alloc a 24-byte node via operator new (__Znwm), link it into the completion-list at
 * `this+0x138` (a `next` pointer at +0x10 chains nodes), then call
 * `[commandBuffer addCompletedHandler:^{ block_invoke(...) }]` and `[commandBuffer commit]`.
 *
 * Ported as throw-stub in this chunk — the block-layout + linked-list detail warrants its own
 * decode chunk (see `___block_descriptor_41_e8_32r_e28_v16?0"<MTLCommandBuffer>"8l` and
 * `____ZN14HGMetalHandler20_commitCommandBufferEv_block_invoke` in the frontier).
 */
export function hgMetalHandler__commitCommandBuffer(_self: HGMetalHandler): void {
  throw new Error(
    "raw-port: HGMetalHandler::_commitCommandBuffer() not yet transcribed " +
      "(196 asm lines building an __NSConcreteStackBlock completion handler + " +
      "operator new(24) node + addCompletedHandler + commit — chunk-decode required) " +
      "@Helium 0x15df50",
  );
}

/** ObjC message-send: `-[obj endEncoding]`. Called @0x15de47 (from FinalizeCommandEncoder) and
 *  @0x15df0c (from _stopEncoding). */
function objc_msgSend_endEncoding(_obj: ObjCObject): void {
  throw new Error(
    "raw-port: -[<MTLRenderCommandEncoder> endEncoding] boundary stub (objc_msgSend) not modeled " +
      "in TS. Called from HGMetalHandler::_stopEncoding @Helium 0x15df0c and " +
      "HGMetalHandler::FinalizeCommandEncoder(uint,ulong,ulong) @Helium 0x15de47.",
  );
}

/** objc_release(id) — Cocoa runtime ARC release. Called through the indirect stub at
 *  +0x8a4336 (from FinalizeCommandEncoder @0x15de84 and 0x15ded3). Not modeled in TS (JS-GC). */
function objc_release(_obj: ObjCObject | null): void {
  throw new Error(
    "raw-port: objc_release(id) boundary stub not modeled in TS (JS/TS objects are GC'd). " +
      "Called from HGMetalHandler::FinalizeCommandEncoder @Helium 0x15de84, 0x15ded3 and " +
      "HGMetalHandler::DisableDepthBuffer @Helium 0x15ddb8 (through vtable slot +0x18).",
  );
}

/** _kdebug_trace(uint tag, uint arg1, uint arg2, uint arg3, uint arg4). Darwin kernel tracing.
 *  Not modeled in TS (host-kernel dependency). Called from _stopEncoding, FinalizeCommandEncoder,
 *  and FrameEnd. */
function kdebug_trace(_tag: number, _a1: number, _a2: number, _a3: number, _a4: number): void {
  throw new Error(
    "raw-port: _kdebug_trace boundary stub not modeled in TS (Darwin kernel tracing). " +
      "Called from HGMetalHandler::_stopEncoding @Helium 0x15df43 (tail-jmp), " +
      "HGMetalHandler::FinalizeCommandEncoder @Helium 0x15de78, and " +
      "HGMetalHandler::FrameEnd @Helium 0x15e37c/0x15e39e/0x15e3c6 (tail-jmp).",
  );
}

/** std::string::operator=(std::string const&). Assigned via tail-jmp. */
function stdstring_op_assign(_dst: StdString, _src: StdString): void {
  throw new Error(
    "raw-port: std::string::operator=(std::string const&) not yet transcribed. " +
      "Called via tail-jmp from HGMetalHandler::SetDebugInfo @Helium 0x15db26 and " +
      "HGMetalHandler::SetDebugLabel @Helium 0x15db47.",
  );
}

/** HGMetalTexture vtable slot +0x18 — release/dtor. Called on the new/old depth-texture
 *  during EnableDepthBuffer / DisableDepthBuffer swaps. */
function HGMetalTexture_vtable_slot_18(_tex: HGMetalTexture): void {
  throw new Error(
    "raw-port: HGMetalTexture vtable slot +0x18 (release/dtor) not yet transcribed. " +
      "Called from HGMetalHandler::EnableDepthBuffer @Helium 0x15dd39/0x15dd51 and " +
      "HGMetalHandler::DisableDepthBuffer @Helium 0x15ddb8.",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Ported method bodies.
// ────────────────────────────────────────────────────────────────────────────

/**
 * HGMetalHandler::SetAttributeFlags(unsigned int)  @0x15daf0 (Helium).
 *
 * Body (verbatim disasm):
 *   0x15daf0  push rbp / mov rbp,rsp
 *   0x15daf4  shr  esi, 9            ; extract bit-9 of the passed mask
 *   0x15daf7  and  sil, 1
 *   0x15dafb  mov  BYTE PTR [rdi+0x1f4], sil
 *   0x15db02  pop rbp / ret
 *
 * Semantic: writes the boolean value `(flags >> 9) & 1` into the attribute-flags byte at
 * this+0x1f4. Only bit 9 of the caller's `flags` mask matters; all other bits are dropped.
 * (Naming: this is likely the "has-depth-attachment" or "needs-scissor" bit; not decoded here
 * whether the flag has downstream semantic beyond being stored.)
 */
export function hgMetalHandler_SetAttributeFlags(
  self: HGMetalHandler,
  flags: number,
  F: HGMetalHandlerFields,
): void {
  // @0x15daf4  esi >> 9
  // @0x15daf7  & 1
  // @0x15dafb  store into +0x1f4
  const bit = ((flags >>> 9) & 0x1) !== 0;
  F.set_attribute_flag_bit9(self, bit);
}

/**
 * HGMetalHandler::SetDebugInfo(HGNode*, std::string const&)  @0x15db10 (Helium).
 *
 * Body:
 *   0x15db14  mov  QWORD PTR [rdi+0x520], rsi    ; store the HGNode* at +0x520
 *   0x15db1b  add  rdi, 0x528
 *   0x15db22  mov  rsi, rdx                       ; forward the string arg
 *   0x15db26  jmp  std::string::operator=         ; tail-call
 *
 * Semantic: `this->debug_node = node; this->debug_label = label;` where the second assignment is
 * a tail-jmp into `std::__1::basic_string<...>::operator=(basic_string<...> const&)`. The tail
 * jmp is semantically identical to calling and returning — we model it as a plain call to the
 * stub (which throws until the string port lands).
 */
export function hgMetalHandler_SetDebugInfo(
  self: HGMetalHandler,
  node: unknown /* HGNode* */,
  label: StdString,
  F: HGMetalHandlerFields,
): void {
  // @0x15db14  this+0x520 = node
  F.set_debug_node_ptr(self, node);
  // @0x15db1b..0x15db26  tail-jmp std::string::operator=  (semantic: return; assign)
  const dst = F.get_debug_label(self);
  stdstring_op_assign(dst, label);
}

/**
 * HGMetalHandler::SetDebugLabel(std::string const&)  @0x15db30 (Helium).
 *
 * Body:
 *   0x15db34  mov  QWORD PTR [rdi+0x520], 0x0     ; clear the HGNode* at +0x520
 *   0x15db3f  add  rdi, 0x528
 *   0x15db47  jmp  std::string::operator=          ; tail-call — the label
 *
 * Same as SetDebugInfo but with a null HGNode* (label-only). `rsi` is already the source string
 * on entry (single-arg overload).
 */
export function hgMetalHandler_SetDebugLabel(
  self: HGMetalHandler,
  label: StdString,
  F: HGMetalHandlerFields,
): void {
  // @0x15db34  this+0x520 = nullptr
  F.set_debug_node_ptr(self, null);
  // @0x15db3f..0x15db47  tail-jmp std::string::operator=
  const dst = F.get_debug_label(self);
  stdstring_op_assign(dst, label);
}

/**
 * HGMetalHandler::SetBlendingInfo(HGBlendingInfo const&)  @0x15db50 (Helium).
 *
 * Body summary:
 *   r14 = this + 0x5d0                            (the slot-0 blending-info slice)
 *   if (HGBlendingInfo::operator==(*rsi, *r14))   ; @0x15db6d
 *     return                                       ; @0x15db74 jne  (early-out)
 *   memcpy(r14, rsi, 32)                           ; two movups pairs @0x15db76..0x15db84
 *   this->state_dirty = 1                          ; movb 1, +0x708 @0x15db88
 *
 * Semantic: overwrite slot 0's HGBlendingInfo iff it actually changed, and mark state dirty.
 * (This is the single-slot overload — see the (int, HGBlendingInfo const&) variant for the
 * indexed one.)
 */
export function hgMetalHandler_SetBlendingInfo(
  self: HGMetalHandler,
  info: HGBlendingInfo,
  F: HGMetalHandlerFields,
): void {
  // @0x15db60  r14 = this + 0x5d0  (slot 0)
  const cur = F.get_blending_info(self, 0);
  // @0x15db6d  operator==
  const eq = HGBlendingInfo_op_eq(info, cur);
  // @0x15db72..0x15db74  testb + jne 0x15db8f (early-out if equal)
  if (eq) return;
  // @0x15db76..0x15db84  copy 32 bytes (2× movups)
  F.copy_blending_info(self, 0, info);
  // @0x15db88  this+0x708 = 1
  F.mark_state_dirty(self);
}

/**
 * HGMetalHandler::SetBlendingInfo(int, HGBlendingInfo const&)  @0x15dba0 (Helium).
 *
 * Body (same shape as the slot-0 variant, but with slot-indexing):
 *   0x15dbb0  movsxd rax, esi             ; sign-extend `slot`
 *   0x15dbb3  shl    rax, 5               ; slot * 0x20 (32-byte stride)
 *   0x15dbb7  lea    r15, [rdi + rax]     ; r15 = this + slot*0x20
 *   0x15dbbb  add    r15, 0x5d0            ; + base offset
 *   0x15dbc8  callq  HGBlendingInfo::operator==
 *   ... same tail as above
 *
 * Semantic: slot-indexed variant. Signed shift = 5 means each HGBlendingInfo occupies 0x20 bytes;
 * `slot` is passed as an `int`. Negative `slot` produces an OOB address — the disasm preserves
 * the sign-extension (`movsxd`) so we DO NOT mask; caller is trusted.
 */
export function hgMetalHandler_SetBlendingInfo_indexed(
  self: HGMetalHandler,
  slot: number,
  info: HGBlendingInfo,
  F: HGMetalHandlerFields,
): void {
  // @0x15dbb0..0x15dbbb  slot slice base at this + 0x5d0 + slot*0x20
  const cur = F.get_blending_info(self, slot | 0);
  // @0x15dbc8  operator==
  const eq = HGBlendingInfo_op_eq(info, cur);
  // @0x15dbcd..0x15dbcf  early-out if equal
  if (eq) return;
  // @0x15dbd1..0x15dbdf  copy 32 bytes
  F.copy_blending_info(self, slot | 0, info);
  // @0x15dbe3  state dirty
  F.mark_state_dirty(self);
}

/**
 * HGMetalHandler::EnableBlending()  @0x15dc00 (Helium).
 *
 * Body:
 *   0x15dc04  movzbl eax, BYTE PTR [rdi+0x5c8]   ; eax = mask
 *   0x15dc0b  test   al, 1                       ; is bit 0 already set?
 *   0x15dc0d  jne    0x15dc1e                     ; if yes, return
 *   0x15dc0f  or     al, 1                        ; set bit 0
 *   0x15dc11  mov    BYTE PTR [rdi+0x5c8], al
 *   0x15dc17  mov    BYTE PTR [rdi+0x708], 1     ; state dirty
 *   0x15dc1e  ret
 *
 * Semantic: enable blending for slot 0 (bit 0 of the mask at +0x5c8). No-op if already enabled.
 */
export function hgMetalHandler_EnableBlending(
  self: HGMetalHandler,
  F: HGMetalHandlerFields,
): void {
  // @0x15dc04  eax = *(this+0x5c8)
  const mask = F.get_blending_mask(self) & 0xff;
  // @0x15dc0b  test al, 1
  if ((mask & 0x1) !== 0) return; // @0x15dc0d jne (already enabled)
  // @0x15dc0f..0x15dc11  or al, 1; store
  F.set_blending_mask(self, mask | 0x1);
  // @0x15dc17  state dirty
  F.mark_state_dirty(self);
}

/**
 * HGMetalHandler::EnableBlending(int slot)  @0x15dc20 (Helium).
 *
 * Body:
 *   0x15dc24  mov    ecx, esi                    ; cl = slot
 *   0x15dc26  mov    eax, 1
 *   0x15dc2b  shl    eax, cl                     ; bit = 1 << slot
 *   0x15dc2d  movzbl edx, BYTE PTR [rdi+0x5c8]
 *   0x15dc34  bt     edx, esi                    ; test bit `slot` of mask
 *   0x15dc37  jae    0x15dc3b                     ; if not set, jump to set-it path
 *   0x15dc39  pop rbp / ret                       ; already set — return
 *   0x15dc3b  or     al, dl                      ; combine bit into mask
 *   0x15dc3d  mov    BYTE PTR [rdi+0x5c8], al
 *   0x15dc43  mov    BYTE PTR [rdi+0x708], 1     ; state dirty
 *   0x15dc4a  ret
 *
 * Semantic: enable blending for slot `slot` (bit `slot` of the mask). No-op if already set.
 * Note: `bt edx, esi` uses ONLY the low bits of esi (esi mod 8 in the 8-bit destination pattern),
 * BUT the mask lives in a single byte at +0x5c8 so slots 0..7 are valid; slot >=8 wraps.
 * The disasm preserves this; we mask esi to 5 bits for the `bt`-semantic (unused high bits are
 * undefined by the ISA but consistent with the observed behaviour on x86_64).
 */
export function hgMetalHandler_EnableBlending_slot(
  self: HGMetalHandler,
  slot: number,
  F: HGMetalHandlerFields,
): void {
  // @0x15dc24..0x15dc2b  eax = 1 << (slot & 31)  -- shl uses low 5 bits of cl on x86
  const cl = slot & 31;
  const bit = (1 << cl) & 0xff;
  // @0x15dc2d  edx = *(this+0x5c8)  (byte, zero-extended)
  const mask = F.get_blending_mask(self) & 0xff;
  // @0x15dc34  bt edx, esi  (CF = bit `slot` of edx)
  if (((mask >>> cl) & 1) !== 0) return; // @0x15dc37 jae → already set → return
  // @0x15dc3b..0x15dc3d  or al, dl; store
  F.set_blending_mask(self, (mask | bit) & 0xff);
  // @0x15dc43
  F.mark_state_dirty(self);
}

/**
 * HGMetalHandler::DisableBlending()  @0x15dc50 (Helium).
 *
 * Body:
 *   0x15dc54  movzbl eax, BYTE PTR [rdi+0x5c8]
 *   0x15dc5b  test   al, 1
 *   0x15dc5d  je     0x15dc6e                     ; already clear -> return
 *   0x15dc5f  and    al, -2                       ; clear bit 0 (0xfe)
 *   0x15dc61  mov    BYTE PTR [rdi+0x5c8], al
 *   0x15dc67  mov    BYTE PTR [rdi+0x708], 1     ; state dirty
 *   0x15dc6e  ret
 */
export function hgMetalHandler_DisableBlending(
  self: HGMetalHandler,
  F: HGMetalHandlerFields,
): void {
  const mask = F.get_blending_mask(self) & 0xff;
  // @0x15dc5b  test al, 1
  if ((mask & 0x1) === 0) return; // @0x15dc5d je (already clear)
  // @0x15dc5f  and al, 0xfe
  F.set_blending_mask(self, mask & 0xfe);
  // @0x15dc67
  F.mark_state_dirty(self);
}

/**
 * HGMetalHandler::DisableBlending(int slot)  @0x15dc70 (Helium).
 *
 * Body: mirror of EnableBlending(slot) but the flip is `and al, ~(1<<slot)` (via `notb al` after
 * building `1<<slot`, then `andb dl, al`):
 *   0x15dc74  ecx = slot
 *   0x15dc76  eax = 1
 *   0x15dc7b  eax <<= cl
 *   0x15dc7d  edx = *(this+0x5c8)
 *   0x15dc84  bt edx, esi
 *   0x15dc87  jae 0x15dc9a  ; if bit is clear, skip
 *   0x15dc89  notb al                  ; al = ~(1<<slot)  (low byte only)
 *   0x15dc8b  andb dl, al              ; mask &= ~bit
 *   0x15dc8d  store back
 *   0x15dc93  state dirty
 */
export function hgMetalHandler_DisableBlending_slot(
  self: HGMetalHandler,
  slot: number,
  F: HGMetalHandlerFields,
): void {
  // @0x15dc74..0x15dc7b  bit = 1 << (slot & 31)
  const cl = slot & 31;
  const bit = (1 << cl) & 0xff;
  // @0x15dc7d
  const mask = F.get_blending_mask(self) & 0xff;
  // @0x15dc84
  if (((mask >>> cl) & 1) === 0) return; // @0x15dc87 jae → bit is already 0
  // @0x15dc89..0x15dc8b  al = ~bit (low byte), then mask &= al
  const notBit = (~bit) & 0xff;
  F.set_blending_mask(self, mask & notBit);
  // @0x15dc93
  F.mark_state_dirty(self);
}

/**
 * HGMetalHandler::EnableDepthBuffer()  @0x15dca0 (Helium).
 *
 * Body (paraphrasing the 69 asm lines faithfully):
 *   0x15dcaf  if (this->depth_texture /* +0x1d0 * / != null) goto done;    // already have one
 *   0x15dcc0  desc = this->prev_encoder_desc; /* +0xf8 * /
 *   0x15dcd2  FinalizeCommandEncoder(desc.+0x40 as uint, desc.+0x48 as u64, desc.+0x58 as u64);
 *   0x15dcde  ctx = HGGPURenderer::GetMetalContext(this->renderer /* +0x90 * /);
 *   0x15dce3  devCtx  = this->device_ctx; /* +0x190 * /
 *   0x15dcea  devType = devCtx.+0x14; /* u32 * /
 *   0x15dcee  poolPtr = devCtx.+0x1c; /* HGMetalTexturePool* * /
 *   0x15dcf2  rectPart = ctx.+0x10.+0x10;   // r12 = *(*(rax+0x10) + 0x10) — the HGRect payload
 *   0x15dcfd  pool2 = HGMetalContext::texturePool(ctx);
 *   0x15dd02  flags = this->depth_texture_type /* +0x1e0 * /;
 *   0x15dd19  tex = HGMetalTexture::createDepth(devType, pool2 /* HGMetalTexturePool* * /, rectAsHGRect, flags);
 *                    // called with %rdi = &sret buffer at -0x28(%rbp), so `tex` is written into
 *                    // that stack slot as a heap-owned pointer.
 *   0x15dd1e  old = this->depth_texture;    // may be null
 *   0x15dd25  new = *sret_slot;
 *   0x15dd29  if (old == new) goto skip_swap;   // pointer identity check (0x15dd2c je)
 *   0x15dd2e..0x15dd39  if (old) old->vtable[+0x18](old);   // release the old texture
 *   0x15dd3c..0x15dd47  this->depth_texture = new;          // install the new
 *   0x15dd49..0x15dd51  (else branch: if new != null AND old == new, still release once) — see NOTE
 *   0x15dd54  this->state_dirty = 1;
 *
 * NOTE on the "else branch" at 0x15dd49..0x15dd51: this is the compiler's emit of the equal-
 * pointer path where the createDepth call may have returned a fresh reference that the caller
 * OWNS but that happens to equal an already-installed pointer. In that case the caller-frame's
 * ownership is released via `new->vtable[+0x18]` and the installed pointer is left untouched —
 * a net-neutral no-op semantically (the field ends up pointing at the same object with the same
 * refcount).
 *
 * Exception-handler stub at 0x15dd68..0x15dd8f: if any callee throws, release the sret'd texture
 * via its vtable slot +0x18, then `__Unwind_Resume`. In TS we model this via a try/finally.
 */
export function hgMetalHandler_EnableDepthBuffer(
  self: HGMetalHandler,
  F: HGMetalHandlerFields,
): void {
  // @0x15dcaf  if (this->depth_texture != null) return  (already have one, nothing to do)
  if (F.get_depth_texture(self) !== null) return;
  // @0x15dcc0..0x15dcd2  FinalizeCommandEncoder(desc.+0x40, desc.+0x48, desc.+0x58)
  const desc = F.get_prev_encoder_desc(self);
  hgMetalHandler_FinalizeCommandEncoder(self, desc.flag, desc.a, desc.b, F);
  // @0x15dcd7..0x15dcde  ctx = GetMetalContext(this->renderer)
  const renderer = F.get_renderer(self);
  if (renderer === null) {
    // A null renderer is not represented in the disasm (it would segfault on movl 0x40(%rax)).
    // We surface the invariant loudly instead of silent-failing.
    throw new Error(
      "raw-port: HGMetalHandler::EnableDepthBuffer @Helium 0x15dcc0 read a null " +
        "renderer at this+0x90 — the disasm assumes non-null (movq 0xf8(%rdi) followed by " +
        "movl 0x40(%rax) at 0x15dcc7 would fault). Not modeled.",
    );
  }
  const ctx = HGGPURenderer_GetMetalContext(renderer);
  // @0x15dce3..0x15dcee  devCtx fields (type + pool)
  const devCtx = F.get_device_ctx(self);
  const devType = devCtx.device_type; // +0x14
  const poolPtr = devCtx.pool_ptr;    // +0x1c
  // @0x15dcf2..0x15dcf6  rect payload = *(*(ctx+0x10)+0x10)
  const rectField = ctx.ctx_field_at_10.at_10 as HGRect;
  // @0x15dcfd  pool2 = HGMetalContext::texturePool(ctx)
  const pool2 = HGMetalContext_texturePool(ctx);
  // @0x15dd02  flags = this->depth_texture_type
  const flags = F.get_depth_texture_type(self);
  // @0x15dd19  createDepth — sret writes the new-tex pointer into a stack slot
  //           (we model the sret as a plain return value here; TS has no aliasing concern)
  // Note: pool2 (from texturePool()) is passed as poolPtr in the disasm; poolPtr from
  // devCtx.+0x1c is UNUSED in this call chain (the compiler loaded it into %r15 as a red herring —
  // r15 is overwritten on the exception path). Keep the load for provenance:
  void poolPtr; // load-and-drop mirrors 0x15dcee
  let newTex: HGMetalTexture;
  try {
    newTex = HGMetalTexture_createDepth(devType, pool2, rectField, flags);
  } catch (e) {
    // @0x15dd68..0x15dd8a  landing pad: if the sret texture was written, release it, then rethrow
    // (In practice this path is only reachable if createDepth itself threw; TS/JS uses exceptions
    // for the same effect, so a bare rethrow is faithful.)
    throw e;
  }
  // @0x15dd1e..0x15dd29  compare old and new
  const oldTex = F.get_depth_texture(self);
  if (oldTex === newTex) {
    // @0x15dd2c je 0x15dd49 — the "already installed" branch
    // @0x15dd49..0x15dd51  release the caller-side reference (net-neutral swap)
    if (newTex !== null) HGMetalTexture_vtable_slot_18(newTex);
  } else {
    // @0x15dd2e..0x15dd39  release the previously-installed texture, if any
    if (oldTex !== null) HGMetalTexture_vtable_slot_18(oldTex);
    // @0x15dd3c..0x15dd40  install the new texture
    F.set_depth_texture(self, newTex);
  }
  // @0x15dd54  this->state_dirty = 1
  F.mark_state_dirty(self);
}

/**
 * HGMetalHandler::DisableDepthBuffer()  @0x15dda0 (Helium).
 *
 * Body:
 *   0x15dda9  rdi = this->depth_texture  /* +0x1d0 * /
 *   0x15ddb0  if (rdi == null) goto done
 *   0x15ddb5  rax = *rdi                  ; vtable
 *   0x15ddb8  call *(rax + 0x18)          ; release/dtor
 *   0x15ddbb  this->depth_texture = null
 *   0x15ddc6  this->state_dirty = 1
 *
 * Semantic: if a depth texture is installed, release it via vtable slot +0x18 and null the field;
 * either way mark state dirty (whether or not a texture was actually released — the disasm shows
 * the `mov 0x1, 0x708` is INSIDE the taken branch, so state_dirty is only set when a texture was
 * actually released).
 *
 * WAIT — re-read the disasm: `mov $0x1, 0x708(%rbx)` at 0x15ddc6 comes BEFORE the join at 0x15ddcd,
 * so it's on the "we-had-a-texture" side of the if. If depth_texture was already null, state_dirty
 * is NOT written. Preserved below.
 */
export function hgMetalHandler_DisableDepthBuffer(
  self: HGMetalHandler,
  F: HGMetalHandlerFields,
): void {
  // @0x15dda9  tex = this->depth_texture
  const tex = F.get_depth_texture(self);
  // @0x15ddb0  test tex,tex
  if (tex === null) return; // @0x15ddb3 je (nothing to release)
  // @0x15ddb5..0x15ddb8  call vtable slot +0x18 (release/dtor)
  HGMetalTexture_vtable_slot_18(tex);
  // @0x15ddbb  this->depth_texture = null
  F.set_depth_texture(self, null);
  // @0x15ddc6  state dirty
  F.mark_state_dirty(self);
}

/**
 * HGMetalHandler::SetScissorTest(bool)  @0x15dde0 (Helium).
 *
 * Body:
 *   0x15dde4  movb %sil, 0x6e0(%rdi)   ; store the bool byte
 *   0x15ddeb  ret
 *
 * Semantic: single-byte write, no dirty flag (surprisingly — the disasm does NOT set +0x708).
 * The caller is expected to flush independently, or the scissor state is checked at draw time
 * without needing a rebind. Verbatim from disasm.
 */
export function hgMetalHandler_SetScissorTest(
  self: HGMetalHandler,
  on: boolean,
  F: HGMetalHandlerFields,
): void {
  // @0x15dde4
  F.set_scissor_test(self, on);
}

/**
 * HGMetalHandler::SetScissorRect(HGRect const&)  @0x15ddf0 (Helium).
 *
 * Body:
 *   0x15ddf4  movups xmm0, [rsi]      ; load 16-byte HGRect (unaligned)
 *   0x15ddf7  movups [rdi+0x6e4], xmm0
 *   0x15ddfe  ret
 *
 * Semantic: 16-byte HGRect copy. `movups` (not `movaps`) because +0x6e4 is 4-byte-aligned but not
 * 16-byte-aligned. No dirty flag (same as SetScissorTest).
 */
export function hgMetalHandler_SetScissorRect(
  self: HGMetalHandler,
  rect: HGRect,
  F: HGMetalHandlerFields,
): void {
  // @0x15ddf4..0x15ddf7  copy 16 bytes into this+0x6e4
  F.set_scissor_rect(self, rect);
}

/**
 * HGMetalHandler::SetBlendingColor(float vector[4] const&)  @0x15de00 (Helium).
 *
 * Body:
 *   0x15de04  movaps xmm0, [rsi]      ; load aligned float4
 *   0x15de07  movaps [rdi+0x6d0], xmm0
 *   0x15de0e  ret
 *
 * Semantic: 16-byte aligned float4 copy. `movaps` requires 16-byte source and dest alignment —
 * caller must supply an aligned `Dv4_f` (which the ABI guarantees for stack-passed vectors).
 * No dirty flag.
 */
export function hgMetalHandler_SetBlendingColor(
  self: HGMetalHandler,
  rgba: Float32Array,
  F: HGMetalHandlerFields,
): void {
  // @0x15de04..0x15de07  copy 16 bytes into this+0x6d0
  F.set_blending_color(self, rgba);
}

/**
 * HGMetalHandler::FinalizeCommandEncoder(unsigned int, unsigned long, unsigned long)
 *   @0x15de10 (Helium).
 *
 * Body summary (53 lines):
 *   ── Encoder-end path (if this->mtl_render_encoder /* +0x108 * / != null) ──
 *     @0x15de34   _setCommandEncoderDebugLabel(this)
 *     @0x15de47   [encoder endEncoding]        (objc_msgSend)
 *     @0x15de4d   this->encoder_count++         /* +0x6f8 * /
 *     @0x15de53   this->present_count++         /* +0x700 * /
 *     @0x15de78   kdebug_trace(0x2b79494c, renderer.channel_id, 0, 0, 0)
 *     @0x15de84   objc_release(this->mtl_render_encoder)
 *     @0x15de8a   this->mtl_render_encoder = null
 *   ── Buffer-commit path (if this->mtl_command_buffer /* +0x100 * / != null AND
 *      commit_predicate is satisfied) ──
 *     @0x15de9d   commit predicate:
 *                    (this->encoder_count /* +0x6f8 * / <  arg0                       ) OR
 *                    (this->commit_threshold_A /* +0x130 * / <  arg1                  ) OR
 *                    (this->commit_threshold_B /* +0x718 * / + threshA <  arg2        )
 *                  → if ANY of those, skip commit; else commit
 *                  (the compiler emitted this as three sequential `jae` short-circuit jumps
 *                   at 0x15dea6, 0x15deaf, 0x15dec2, so the predicate is a disjunction of
 *                   "over-threshold" flags; only if all three pass does it commit.)
 *     @0x15dec7   _commitCommandBuffer(this)
 *     @0x15decc   objc_release(this->mtl_command_buffer)
 *     @0x15ded9   this->mtl_command_buffer = null
 *
 * Argument roles (recovered from register save-locations 0x15de1b..0x15de24):
 *   arg0 (%esi, sign-extended into r12d) — encoder_count_threshold_uint
 *   arg1 (%rdx into r15)                 — threshold_A_ulong
 *   arg2 (%rcx into r14)                 — threshold_B_ulong
 */
export function hgMetalHandler_FinalizeCommandEncoder(
  self: HGMetalHandler,
  encoderCountThreshold: number,
  thresholdA: bigint,
  thresholdB: bigint,
  F: HGMetalHandlerFields,
): void {
  // ── Encoder-end path ────────────────────────────────────────────────────
  // @0x15de27  cmp [rdi+0x108], 0 ; if encoder != null then...
  const encoder = F.get_mtl_render_encoder(self);
  if (encoder !== null) {
    // @0x15de34
    HGMetalHandler_setCommandEncoderDebugLabel(self);
    // @0x15de40..0x15de47  [encoder endEncoding]
    objc_msgSend_endEncoding(encoder);
    // @0x15de4d  incl 0x6f8(rbx)
    F.inc_encoder_count(self);
    // @0x15de53..0x15de5b  present_count++
    F.inc_present_count(self);
    // @0x15de61..0x15de78  kdebug_trace(0x2b79494c, renderer.kdebug_channel_id, 0, 0, 0)
    const renderer = F.get_renderer(self);
    if (renderer !== null) {
      kdebug_trace(0x2b79494c, renderer.kdebug_channel_id, 0, 0, 0);
    }
    // @0x15de84
    objc_release(encoder);
    // @0x15de8a  this->mtl_render_encoder = null
    F.set_mtl_render_encoder(self, null);
  }
  // ── Buffer-commit path ─────────────────────────────────────────────────
  // @0x15de95  cmp [rdi+0x100], 0 ; if buffer == null skip everything
  const buffer = F.get_mtl_command_buffer(self);
  if (buffer === null) return;
  // @0x15de9f  cmp r12d, [rbx+0x6f8]  ; jae if encoder_count >= threshold ⇒ skip
  if (F.encoder_count(self) < encoderCountThreshold) return;
  // @0x15dea8  cmp r15, [rbx+0x130]   ; jae if threshA <= commit_threshold_A ⇒ skip
  if (F.get_commit_threshold_A(self) < thresholdA) return;
  // @0x15deb1  rax = *(rbx+0x718); rax += *(rbx+0x130); cmp r14, rax; jb ⇒ skip
  const combined = F.get_commit_threshold_B(self) + F.get_commit_threshold_A(self);
  if (combined < thresholdB) return;
  // @0x15dec7  _commitCommandBuffer
  hgMetalHandler__commitCommandBuffer(self);
  // @0x15decc..0x15ded3  objc_release(mtl_command_buffer)
  objc_release(buffer);
  // @0x15ded9  this->mtl_command_buffer = null
  F.set_mtl_command_buffer(self, null);
}

/**
 * HGMetalHandler::_stopEncoding()  @0x15def0 (Helium).
 *
 * Body:
 *   0x15def9  _setCommandEncoderDebugLabel(this)
 *   0x15defe..0x15df0c  [this->mtl_render_encoder endEncoding]
 *   0x15df12  this->encoder_count++       /* +0x6f8 * /
 *   0x15df18..0x15df20  this->present_count++  /* +0x700 * /
 *   0x15df26..0x15df33  prep kdebug_trace(0x2b79494c, renderer.channel_id, 0, 0, 0)
 *   0x15df43  tail-jmp kdebug_trace          ; the actual call is the tail
 *
 * Note: unlike FinalizeCommandEncoder, this method does NOT null-check the encoder before
 * endEncoding — the disasm has no `test` between the load and the objc_msgSend at 0x15df0c.
 * Faithful to the C++: caller must guarantee `mtl_render_encoder != nil`. If it IS nil the
 * objc_msgSend degenerates to a nil-call (which is Cocoa-safe, returns 0).
 */
export function hgMetalHandler__stopEncoding(
  self: HGMetalHandler,
  F: HGMetalHandlerFields,
): void {
  // @0x15def9
  HGMetalHandler_setCommandEncoderDebugLabel(self);
  // @0x15defe..0x15df0c  [encoder endEncoding]  (no nil-check in disasm)
  const encoder = F.get_mtl_render_encoder(self);
  // preserve the read-then-msgSend even if null (Cocoa's nil-safe msgSend semantic)
  if (encoder !== null) objc_msgSend_endEncoding(encoder);
  // @0x15df12  encoder_count++
  F.inc_encoder_count(self);
  // @0x15df18..0x15df20  present_count++
  F.inc_present_count(self);
  // @0x15df26..0x15df43  kdebug_trace tail-call
  const renderer = F.get_renderer(self);
  if (renderer !== null) {
    kdebug_trace(0x2b79494c, renderer.kdebug_channel_id, 0, 0, 0);
  }
}

// (_commitCommandBuffer is defined above as a throw-stub — 196 asm lines requiring a
// dedicated decode chunk. Cited @0x15df50.)

/**
 * HGMetalHandler::FinalizeCommandBuffer()  @0x15e310 (Helium).
 *
 * Body:
 *   0x15e314  movl $1, edx           ; thresholdB = 1
 *   0x15e319  movl $1, ecx           ; thresholdA = 1
 *   0x15e31e  movl $1, esi           ; encoderCountThreshold = 1
 *   0x15e323  pop rbp
 *   0x15e324  jmp FinalizeCommandEncoder    ; tail-call
 *
 * NOTE on register-to-arg mapping: the CALLEE `FinalizeCommandEncoder(uint,ulong,ulong)` reads
 * arg0 from %esi, arg1 from %rdx, arg2 from %rcx. So this method fills all three thresholds with
 * literal 1 and jumps. Semantic: "commit if encoder_count >= 1 AND threshA >= 1 AND
 * threshA+threshB >= 1" — a "commit if any encoder ran" force-flush.
 */
export function hgMetalHandler_FinalizeCommandBuffer(
  self: HGMetalHandler,
  F: HGMetalHandlerFields,
): void {
  // @0x15e314..0x15e324  Finalize(1, 1, 1)  tail-jmp
  hgMetalHandler_FinalizeCommandEncoder(self, 1, 1n, 1n, F);
}

/**
 * HGMetalHandler::CheckStatus()  @0x15e330 (Helium).
 *
 * Body:
 *   0x15e330  pushq %rbp / movq %rsp, %rbp / popq %rbp / retq
 *   0x15e336  nopw %cs:(%rax,%rax)
 *
 * Semantic: empty function. The compiler emitted no body — the C++ source was literally
 *   void HGMetalHandler::CheckStatus() {}
 * (There is NO `xor eax, eax` → the return type at this slot is void, unlike the FFOZNullCurve
 * return-0 pattern.)
 */
export function hgMetalHandler_CheckStatus(
  _self: HGMetalHandler,
  _F: HGMetalHandlerFields,
): void {
  // @0x15e330..0x15e335  push rbp / mov / pop / ret — void, no state touched
}

/**
 * HGMetalHandler::FrameEnd()  @0x15e340 (Helium).
 *
 * Body:
 *   0x15e340  this->frame_encoder_count /* +0x6fc * / = 0   (as u64: `movq $0, 0x6fc(rdi)`)
 *   0x15e34b  this->frame_present_count /* +0x704 * / = 0   (as u32)
 *   0x15e355  if (this->renderer /* +0x90 * / == null) goto ret
 *   0x15e36a..0x15e37c  kdebug_trace(0x2b794948, renderer.channel_id, 0, 0, 0)
 *   0x15e388..0x15e39e  kdebug_trace(0x2b79494c, renderer.channel_id, this->present_count /* +0x700 * /, 0, 0)
 *   0x15e3aa..0x15e3c6  kdebug_trace(0x2b794950, renderer.channel_id, this->frame_present_count /* +0x704 * /, 0, 0)
 *                       ; the third trace is a tail-jmp (0x15e3c6 `jmp _kdebug_trace`).
 *   0x15e3cb  ret (only reached when renderer == null)
 *
 * IMPORTANT ordering detail: the two zero-writes at 0x15e340 / 0x15e34b execute BEFORE the null-
 * check on +0x90. So `frame_present_count` is read AFTER being reset to 0 in the third trace's
 * `movl 0x704(%rbx), %edx` at 0x15e3b0. That means the third trace ALWAYS reports 0 for the
 * present count. This is preserved verbatim below (compiler didn't optimize it away — likely
 * intended so post-frame consumers see a definite "reset" event).
 */
export function hgMetalHandler_FrameEnd(
  self: HGMetalHandler,
  F: HGMetalHandlerFields,
): void {
  // @0x15e340  frame_encoder_count = 0 (as u64 — spans +0x6fc and +0x700 low bytes!)
  //           WAIT: `movq $0, 0x6fc(rdi)` writes 8 bytes at +0x6fc..+0x703 — which OVERLAPS the
  //           present_count u32 at +0x700. So this SINGLE quad-word write ALSO zeroes
  //           +0x700 (present_count). That is deliberate — the compiler saw both counters were
  //           reset per-frame and combined the two 4-byte stores into one qword store.
  F.reset_frame_encoder_count(self);
  // @0x15e34b  frame_present_count /* +0x704 * / = 0  (as u32)
  F.reset_frame_present_count(self);
  // @0x15e355..0x15e35f  if (renderer == null) return
  const renderer = F.get_renderer(self);
  if (renderer === null) return;
  // @0x15e36a..0x15e37c  kdebug_trace(0x2b794948, ch, 0, 0, 0)
  kdebug_trace(0x2b794948, renderer.kdebug_channel_id, 0, 0, 0);
  // @0x15e381..0x15e39e  kdebug_trace(0x2b79494c, ch, present_count /* +0x700 read * /, 0, 0)
  //   NOTE: present_count was JUST zeroed by the qword store above (comment on +0x6fc), so this
  //   read is guaranteed to observe 0. Preserved verbatim.
  kdebug_trace(0x2b79494c, renderer.kdebug_channel_id, F.present_count(self), 0, 0);
  // @0x15e3a3..0x15e3c6  tail-jmp kdebug_trace(0x2b794950, ch, frame_present_count /* +0x704 * /, 0, 0)
  //   ALSO reads +0x704 which was just zeroed at 0x15e34b — always 0.
  kdebug_trace(0x2b794950, renderer.kdebug_channel_id, F.frame_present_count(self), 0, 0);
}

// ────────────────────────────────────────────────────────────────────────────
// Dispatch table (assemble_class.py convention).
// ────────────────────────────────────────────────────────────────────────────

export const HGMetalHandler_m3_methods = {
  "HGMetalHandler::SetAttributeFlags(unsigned int)":           hgMetalHandler_SetAttributeFlags,        // @0x15daf0
  "HGMetalHandler::SetDebugInfo(HGNode*, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&)":
                                                               hgMetalHandler_SetDebugInfo,             // @0x15db10
  "HGMetalHandler::SetDebugLabel(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&)":
                                                               hgMetalHandler_SetDebugLabel,            // @0x15db30
  "HGMetalHandler::SetBlendingInfo(HGBlendingInfo const&)":    hgMetalHandler_SetBlendingInfo,          // @0x15db50
  "HGMetalHandler::SetBlendingInfo(int, HGBlendingInfo const&)":
                                                               hgMetalHandler_SetBlendingInfo_indexed,  // @0x15dba0
  "HGMetalHandler::EnableBlending()":                          hgMetalHandler_EnableBlending,           // @0x15dc00
  "HGMetalHandler::EnableBlending(int)":                       hgMetalHandler_EnableBlending_slot,      // @0x15dc20
  "HGMetalHandler::DisableBlending()":                         hgMetalHandler_DisableBlending,          // @0x15dc50
  "HGMetalHandler::DisableBlending(int)":                      hgMetalHandler_DisableBlending_slot,     // @0x15dc70
  "HGMetalHandler::EnableDepthBuffer()":                       hgMetalHandler_EnableDepthBuffer,        // @0x15dca0
  "HGMetalHandler::DisableDepthBuffer()":                      hgMetalHandler_DisableDepthBuffer,       // @0x15dda0
  "HGMetalHandler::SetScissorTest(bool)":                      hgMetalHandler_SetScissorTest,           // @0x15dde0
  "HGMetalHandler::SetScissorRect(HGRect const&)":             hgMetalHandler_SetScissorRect,           // @0x15ddf0
  "HGMetalHandler::SetBlendingColor(float vector[4] const&)":  hgMetalHandler_SetBlendingColor,         // @0x15de00
  "HGMetalHandler::FinalizeCommandEncoder(unsigned int, unsigned long, unsigned long)":
                                                               hgMetalHandler_FinalizeCommandEncoder,   // @0x15de10
  "HGMetalHandler::_stopEncoding()":                           hgMetalHandler__stopEncoding,            // @0x15def0
  "HGMetalHandler::_commitCommandBuffer()":                    hgMetalHandler__commitCommandBuffer,     // @0x15df50
  "HGMetalHandler::FinalizeCommandBuffer()":                   hgMetalHandler_FinalizeCommandBuffer,    // @0x15e310
  "HGMetalHandler::CheckStatus()":                             hgMetalHandler_CheckStatus,              // @0x15e330
  "HGMetalHandler::FrameEnd()":                                hgMetalHandler_FrameEnd,                 // @0x15e340
} as const;
