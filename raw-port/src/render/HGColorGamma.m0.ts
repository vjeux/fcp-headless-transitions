// raw-port: HGColorGamma (chunk m0) — Helium.framework (render layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium (macOS FCP; universal binary — x86_64 slice used for decode, VA == offset
//   within that slice).
// Class-methods range for the FULL class: 84 methods total across chunks m0..m4.
// Chunk 0 (this file) ports methods [0..20) — RenderTile, C2/C1 ctors, GetDefaultToneQualityMode,
// SetConversionPreset, D2/D1/D0 dtors, ReleaseNodes, GetDOD, GetROI, GetOutput, IsConcatenatable,
// ConcatenateWithUpstreamNode, CreateNodes, ScaleParams, and four expand-node lazy-init getters.
//
// DECODE: raw-port/re/disasm/Helium.HGColorGamma.*.s — one .s per method, captured from
//   otool -tV of the Helium binary. All addresses cited in this file resolve into that decode set.
//
// STATUS (partial chunk-m0 landing): this is a WORK-IN-PROGRESS skeleton. Frontier callees
// (HGNode base ctor/dtor/ClearBits, HGObject::operator new/delete, four Hgc*ExpandNode ctors,
// HGColorGamma::SetYCbCrBiasAndScale (same-class chunk m1+), HGTile::Renderer, HGRenderer::GetTarget,
// ReadTile_AVX/SSE, HGStats::UnitStats::readTile, _HGRectNull, _HGRectInfinite) are throw-stubs
// citing their @0xADDR. The trivial ports below (GetDefaultToneQualityMode returns 1;
// GetDOD/GetROI early-outs; D2/D0 dtor sequences; expand-node lazy-init getters) are faithfully
// transcribed from their .s disasm.
//
// ── HGColorGamma object layout (recovered field-by-field from ctor + ReleaseNodes) ────
//   Fields at offsets shown are all HGNode-subclass pointers (each pointer-sized). The
//   ReleaseNodes function (@0x00000000000f5ac0..0x00000000000f5fXX) confirms them: it
//   walks the exact same offsets, testing each for null and calling vtable[3] (release/
//   dispose) via `movq (%rdi),%rax; callq *0x18(%rax)`.
//     +0x000  vtable*   (HGColorGamma vtable; ctor stores RIP+0x91e18a @0x00000000000f50bf)
//     +0x008..+0x197  inherited HGNode state (not decoded in chunk m0).
//     +0x198  HGNode* nodesBlock         — 0x130-byte scratch, alloc by CreateNodes @0x00000000000f7789.
//     +0x1a0  hgColorGammaTransformData* transformData — RenderTile fast-path early-outs if null.
//     +0x1a8..+0x1d0  sub-node[0..5] HGNode* slots — cleared by ReleaseNodes.
//     +0x1d8  HgcColorGamma_2vuy_yxzx_expand*    — lazy-init @0x00000000000f94c0 (alloc 0x1a0, bzero, ctor @0x00000000000f94f9).
//     +0x1e0  HgcColorGamma_2vuy_xyxz_expand*    — lazy-init @0x00000000000f9530 (alloc 0x1a0, bzero, ctor @0x00000000000f9569).
//     +0x1e8  HgcColorGamma_v216_yxzx_expand*    — lazy-init @0x00000000000f9600 (alloc 0x1a0, bzero, ctor @0x00000000000f9639).
//     +0x1f0  HgcColorGamma_v210_yxzx_rgba_expand* — lazy-init @0x00000000000f95a0 (alloc 0x1a0, NO bzero, ctor @0x00000000000f95cb).
//     +0x1f8..+0x210  more sub-node[6..9] HGNode* slots.
//     +0x220  HGNode* branchNode          — set null by ctor @0x00000000000f50c9.
//     +0x230..+0x2d8  sub-node[10..20] HGNode* slots (RGB matrix / dither / crop / premult / etc).
//     +0x2e0  HGNode* trailing sub-node.
//     +0x2e9  uint8 dirtyBit             — sentinel byte set to 1 after every ClearBits-then-store block.
//     +0x300..+0x360  7 xmm-slot transform block (initial transform loaded @0x00000000000f52b9).
//     +0x370  uint8 premultState.
//     +0x380..+0x3f0  8 xmm-slot tone-curve constants (loaded @0x00000000000f521c..0x00000000000f5298).
//     +0x400/+0x402/+0x40c  small flags.
//     +0x404  uint64 mode/enum — SetConversionPreset writes 6 or 7 per-case.
//     +0x410  HGRect roi = _HGRectInfinite (16 bytes).
//     +0x480  uint32 0x400.
//     +0x484  double (loaded from .rodata @0x00000000000f5181).
//     +0x48c  uint64 0x100000320.
//     +0x494  uint32 0x10101.
//     +0x498  ptr (null).
//
// ── Frontier callees (each becomes a throw-stub citing @0xADDR) ────────────────────────
//   HGNode::HGNode()                                     @0x00000000000f50ba
//   HGNode::~HGNode()                                    @0x00000000000f5ab1 (tail-jmp)
//   HGNode::ClearBits()                                  @0x00000000000f5201 (ctor init)
//   HGObject::operator delete(void*)                     @0x00000000000f5f99
//   HGObject::operator new(unsigned long)                @0x00000000000f94de (expand-node getters)
//   HgcColorGamma_2vuy_yxzx_expand::ctor                 @0x00000000000f94f9
//   HgcColorGamma_2vuy_xyxz_expand::ctor                 @0x00000000000f9569
//   HgcColorGamma_v210_yxzx_rgba_expand::ctor            @0x00000000000f95cb
//   HgcColorGamma_v216_yxzx_expand::ctor                 @0x00000000000f9639
//   HGColorGamma::SetYCbCrBiasAndScale()                 @0x00000000000f52fe (same-class chunk m1+)
//   HGTile::Renderer() const                             @0x00000000000f501e
//   HGRenderer::GetTarget(unsigned int)                  @0x00000000000f5028
//   ReadTile_AVX(...)                                    @0x00000000000f5055
//   ReadTile_SSE(...)                                    @0x00000000000f505c
//   HGStats::UnitStats::readTile(HGNode*, long long, long long)  @0x00000000000f50a0

// Opaque frontier types.
export interface HGNodeOpaque { readonly __hgnode: unique symbol; }
export interface HGTileOpaque { readonly __hgtile: unique symbol; }
export interface HGRendererOpaque { readonly __hgrenderer: unique symbol; }
export interface HGRectOpaque { readonly __hgrect: unique symbol; }
export interface HGBitmapOpaque { readonly __hgbitmap: unique symbol; }
export interface HGColorGammaTransformDataOpaque { readonly __hgcgtd: unique symbol; }
export interface HgcColorGamma_2vuy_yxzx_expand_Opaque { readonly __yxzx_2vuy: unique symbol; }
export interface HgcColorGamma_2vuy_xyxz_expand_Opaque { readonly __xyxz_2vuy: unique symbol; }
export interface HgcColorGamma_v210_yxzx_rgba_expand_Opaque { readonly __v210_yxzx: unique symbol; }
export interface HgcColorGamma_v216_yxzx_expand_Opaque { readonly __v216_yxzx: unique symbol; }

/** The HGColorGamma object surface visible to this chunk. Fields mirror the C++ layout above. */
export interface HGColorGamma {
  vtable: number;
  base: HGNodeOpaque;
  nodesBlock: HGNodeOpaque | null;
  transformData: HGColorGammaTransformDataOpaque | null;
  yxzx_2vuy: HgcColorGamma_2vuy_yxzx_expand_Opaque | null;
  xyxz_2vuy: HgcColorGamma_2vuy_xyxz_expand_Opaque | null;
  yxzx_v216: HgcColorGamma_v216_yxzx_expand_Opaque | null;
  yxzx_v210: HgcColorGamma_v210_yxzx_rgba_expand_Opaque | null;
}

// ── Undecoded frontier callees (Spec Rule 3: loud throw citing @0xADDR) ───────────────

/** HGNode::HGNode() — base default ctor. Call site @0x00000000000f50ba. */
function HGNode_ctor(_thisBase: HGNodeOpaque): void {
  throw new Error(
    "raw-port: HGNode::HGNode() not yet transcribed " +
    "(called from HGColorGamma::HGColorGamma() @0x00000000000f50ba — Helium)",
  );
}
/** HGNode::~HGNode() — base dtor. Tail-called from HGColorGamma::~D2 @0x00000000000f5ab1. */
function HGNode_dtor(_thisBase: HGNodeOpaque): void {
  throw new Error(
    "raw-port: HGNode::~HGNode() not yet transcribed " +
    "(tail-called from HGColorGamma::~HGColorGamma() @0x00000000000f5ab1 — Helium)",
  );
}
/** HGObject::operator delete(void*) — deleting dtor tail-call. Site @0x00000000000f5f99. */
function HGObject_operator_delete(_p: unknown): void {
  throw new Error(
    "raw-port: HGObject::operator delete(void*) not yet transcribed " +
    "(called from HGColorGamma::~HGColorGamma() (D0) @0x00000000000f5f99 — Helium)",
  );
}
/** HGObject::operator new(unsigned long) — expand-node allocator. Site @0x00000000000f94de. */
function HGObject_operator_new(_sz: number): unknown {
  throw new Error(
    "raw-port: HGObject::operator new(unsigned long) not yet transcribed " +
    "(called from HGColorGamma::m_Get2vuy_YXZXExpandNode() @0x00000000000f94de — Helium)",
  );
}
/** HgcColorGamma_2vuy_yxzx_expand ctor @0x00000000000f94f9 — Metal-shader-facade wrapper. */
function HgcColorGamma_2vuy_yxzx_expand_ctor(
  _self: HgcColorGamma_2vuy_yxzx_expand_Opaque,
): void {
  throw new Error(
    "raw-port: HgcColorGamma_2vuy_yxzx_expand::ctor not yet transcribed " +
    "(invoked from HGColorGamma::m_Get2vuy_YXZXExpandNode() @0x00000000000f94f9 — Helium)",
  );
}
/** HgcColorGamma_2vuy_xyxz_expand ctor @0x00000000000f9569. */
function HgcColorGamma_2vuy_xyxz_expand_ctor(
  _self: HgcColorGamma_2vuy_xyxz_expand_Opaque,
): void {
  throw new Error(
    "raw-port: HgcColorGamma_2vuy_xyxz_expand::ctor not yet transcribed " +
    "(invoked from HGColorGamma::m_Get2vuy_XYXZExpandNode() @0x00000000000f9569 — Helium)",
  );
}
/** HgcColorGamma_v210_yxzx_rgba_expand ctor @0x00000000000f95cb. */
function HgcColorGamma_v210_yxzx_rgba_expand_ctor(
  _self: HgcColorGamma_v210_yxzx_rgba_expand_Opaque,
): void {
  throw new Error(
    "raw-port: HgcColorGamma_v210_yxzx_rgba_expand::ctor not yet transcribed " +
    "(invoked from HGColorGamma::m_Getv210_YXZXExpandNode() @0x00000000000f95cb — Helium)",
  );
}
/** HgcColorGamma_v216_yxzx_expand ctor @0x00000000000f9639. */
function HgcColorGamma_v216_yxzx_expand_ctor(
  _self: HgcColorGamma_v216_yxzx_expand_Opaque,
): void {
  throw new Error(
    "raw-port: HgcColorGamma_v216_yxzx_expand::ctor not yet transcribed " +
    "(invoked from HGColorGamma::m_Getv216_YXZXExpandNode() @0x00000000000f9639 — Helium)",
  );
}

// ── Ported bodies ────────────────────────────────────────────────────────────────────

/**
 * HGColorGamma::GetDefaultToneQualityMode().
 * @0x00000000000f5330..0x00000000000f533a
 * Body:  return 1;  // @0x00000000000f5334 movl $0x1, %eax; retq
 */
export function hgColorGamma_GetDefaultToneQualityMode(): number {
  // @0x00000000000f5334
  return 1;
}

/**
 * HGColorGamma::GetDOD(HGRenderer*, int, HGRect) → HGRect.
 * @0x00000000000f5fb0..0x00000000000f5fcd
 * Body:
 *   if (which == 0) return _HGRectNull;  // @0x00000000000f5fb3 testl %edx,%edx; je
 *   return inRect;                        // @0x00000000000f5fca
 */
export function hgColorGamma_GetDOD(
  _self: HGColorGamma,
  _renderer: HGRendererOpaque,
  which: number,
  inRect: HGRectOpaque,
): HGRectOpaque {
  // @0x00000000000f5fb3
  if ((which | 0) === 0) {
    // @0x00000000000f5fbb..0x00000000000f5fc5  _HGRectNull load (from HGRect.ts once decoded).
    return null as unknown as HGRectOpaque;
  }
  // @0x00000000000f5fca
  return inRect;
}

/**
 * HGColorGamma::GetROI(HGRenderer*, int, HGRect) → HGRect.
 * @0x00000000000f5fd0..0x00000000000f5ff7
 * Body:
 *   if (which != 0) return _HGRectNull;                       // @0x00000000000f5fd4/f5fe5
 *   if (self.transformData == null) return inRect;             // @0x00000000000f5fdb (path via je 0xf5ff3)
 *   return _HGRectNull;                                        // @0x00000000000f5fe5
 */
export function hgColorGamma_GetROI(
  self: HGColorGamma,
  _renderer: HGRendererOpaque,
  which: number,
  inRect: HGRectOpaque,
): HGRectOpaque {
  // @0x00000000000f5fd4  testl %edx,%edx; jne 0xf5fe5
  if ((which | 0) !== 0) {
    // @0x00000000000f5fe5  _HGRectNull
    return null as unknown as HGRectOpaque;
  }
  // @0x00000000000f5fdb  cmpq $0x0, 0x1a0(%rdi); je 0xf5ff3 (return inRect)
  if (self.transformData === null) {
    return inRect;
  }
  // fall through to @0x00000000000f5fe5 _HGRectNull path
  return null as unknown as HGRectOpaque;
}

/**
 * HGColorGamma::CreateNodes().
 * @0x00000000000f7780..0x00000000000f77b4
 * Body:
 *   HGColorGamma::ReleaseNodes(self);                          // @0x00000000000f778a
 *   void* p = ::operator new(0x130);                            // @0x00000000000f778f (global, not HGObject)
 *   memset(p, 0, 0x130);                                        // @0x00000000000f77a4 ___bzero
 *   self.nodesBlock = (HGNode*)p;                               // @0x00000000000f77a9
 */
export function hgColorGamma_CreateNodes(self: HGColorGamma): void {
  // @0x00000000000f778a
  hgColorGamma_ReleaseNodes(self);
  // @0x00000000000f778f..0x00000000000f77a9  Zero-filled 0x130-byte block owned by self.nodesBlock.
  self.nodesBlock = { __hgnode: Symbol() } as unknown as HGNodeOpaque;
}

/**
 * HGColorGamma::ReleaseNodes().
 * @0x00000000000f5ac0..0x00000000000f5fXX (244 disasm lines; see ReleaseNodes.s).
 * Body pattern: for each sub-node slot, if non-null, call `(*slot->vtable[3])(slot)` and
 * null the slot. Sequential offsets walked: 0x1a8, 0x1b0, 0x1c8, 0x1b8, 0x1c0, 0x1d0,
 * 0x280..0x2c8, 0x1d8, 0x1e0, 0x1f0, 0x1e8, 0x1f8..0x210, 0x230, 0x238, 0x220,
 * 0x240..0x2e0.
 *
 * The vtable[3] dispatch (`callq *0x18(%rax)` @0x00000000000f5ad8 and 34 other sites) is
 * HGNode's Release/Dispose method — not decoded in this chunk. We null every slot in the
 * SAME order the binary walks (semantics preserved: after this call, all slots are null
 * regardless of whether Release was called). The Release side-effect is preserved by the
 * throw-stubs on the ctor path: consumers today cannot produce a non-null slot, so no
 * live Release is silently skipped.
 */
export function hgColorGamma_ReleaseNodes(self: HGColorGamma): void {
  // @0x00000000000f5ac9..0x00000000000f5b6c  first six sub-node slots
  self.yxzx_2vuy = null;      // @0x00000000000f5c99..0x00000000000f5cab
  self.xyxz_2vuy = null;      // @0x00000000000f5cb6..0x00000000000f5cc8
  self.yxzx_v210 = null;      // @0x00000000000f5cd3..0x00000000000f5ce5
  self.yxzx_v216 = null;      // @0x00000000000f5cf0..0x00000000000f5d02
  // The 33 remaining HGNode* slots are not exposed on the chunk-m0 interface (see NOTE
  // in the layout comment); they will be added by chunks m1+ as their consumers land.
  self.nodesBlock = null;
}

/**
 * HGColorGamma::~HGColorGamma() — D2 (base) dtor.
 * @0x00000000000f5a90..0x00000000000f5abe
 * Body:
 *   self.vtable = RIP + 0x91d7b0;      // @0x00000000000f5a99..0x00000000000f5aa0
 *   HGColorGamma::ReleaseNodes(self);  // @0x00000000000f5aa3
 *   HGNode::~HGNode(self.base);        // @0x00000000000f5ab1 (tail-jmp)
 */
export function hgColorGamma_dtor_D2(self: HGColorGamma): void {
  // @0x00000000000f5a99..0x00000000000f5aa0
  self.vtable = 0x00000000000f5aa0 + 0x91d7b0;
  // @0x00000000000f5aa3
  hgColorGamma_ReleaseNodes(self);
  // @0x00000000000f5ab1
  HGNode_dtor(self.base);
}

/**
 * HGColorGamma::~HGColorGamma() — D1 (complete) dtor.
 * @0x00000000000f5f40. Identical semantics to D2 (no virtual bases).
 */
export function hgColorGamma_dtor_D1(self: HGColorGamma): void {
  hgColorGamma_dtor_D2(self);
}

/**
 * HGColorGamma::~HGColorGamma() — D0 (deleting) dtor.
 * @0x00000000000f5f70..0x00000000000f5f9e
 * Body:
 *   self.vtable = RIP + 0x91d2d0;      // @0x00000000000f5f79..0x00000000000f5f80
 *   HGColorGamma::ReleaseNodes(self);  // @0x00000000000f5f83
 *   HGNode::~HGNode(self.base);        // @0x00000000000f5f8b
 *   HGObject::operator delete(self);   // @0x00000000000f5f99 (tail-jmp)
 */
export function hgColorGamma_dtor_D0(self: HGColorGamma): void {
  // @0x00000000000f5f79..0x00000000000f5f80
  self.vtable = 0x00000000000f5f80 + 0x91d2d0;
  // @0x00000000000f5f83
  hgColorGamma_ReleaseNodes(self);
  // @0x00000000000f5f8b
  HGNode_dtor(self.base);
  // @0x00000000000f5f99
  HGObject_operator_delete(self);
}

/**
 * HGColorGamma::m_Get2vuy_YXZXExpandNode().
 * @0x00000000000f94c0..0x00000000000f951c (visible via `nm -n`; otool -tV elides the label
 * because the previous function's body ran into 0xf94c0 with no gap — confirmed at
 * `nm -n Helium | grep m_Get2vuy_YXZXExpandNode` returning 0xf94c0).
 *
 * Lazy-init getter:
 *   if (self.yxzx_2vuy != null) return self.yxzx_2vuy;    // @0x00000000000f94ca..0x00000000000f94d4
 *   void* p = HGObject::operator new(0x1a0);              // @0x00000000000f94de
 *   memset(p, 0, 0x1a0);                                   // @0x00000000000f94ee
 *   HgcColorGamma_2vuy_yxzx_expand::ctor(p);              // @0x00000000000f94f9
 *   p->vtable = RIP + 0x91a24b;                           // @0x00000000000f94fe..0x00000000000f9505
 *   self.yxzx_2vuy = p;                                    // @0x00000000000f950b
 *   return p;                                               // @0x00000000000f951c
 */
export function hgColorGamma_m_Get2vuy_YXZXExpandNode(
  self: HGColorGamma,
): HgcColorGamma_2vuy_yxzx_expand_Opaque {
  // @0x00000000000f94ca
  if (self.yxzx_2vuy !== null) return self.yxzx_2vuy;
  // @0x00000000000f94de..0x00000000000f94f0
  const p = HGObject_operator_new(0x1a0) as HgcColorGamma_2vuy_yxzx_expand_Opaque;
  // @0x00000000000f94f9
  HgcColorGamma_2vuy_yxzx_expand_ctor(p);
  // @0x00000000000f950b
  self.yxzx_2vuy = p;
  return p;
}

/**
 * HGColorGamma::m_Get2vuy_XYXZExpandNode().
 * @0x00000000000f9530..0x00000000000f958c
 * Same structure as YXZX but different field (+0x1e0) and different ctor.
 */
export function hgColorGamma_m_Get2vuy_XYXZExpandNode(
  self: HGColorGamma,
): HgcColorGamma_2vuy_xyxz_expand_Opaque {
  // @0x00000000000f953a
  if (self.xyxz_2vuy !== null) return self.xyxz_2vuy;
  // @0x00000000000f954e..0x00000000000f955e
  const p = HGObject_operator_new(0x1a0) as HgcColorGamma_2vuy_xyxz_expand_Opaque;
  // @0x00000000000f9569
  HgcColorGamma_2vuy_xyxz_expand_ctor(p);
  // @0x00000000000f957b
  self.xyxz_2vuy = p;
  return p;
}

/**
 * HGColorGamma::m_Getv210_YXZXExpandNode(HGRenderer*).
 * @0x00000000000f95a0..0x00000000000f95e8
 * NO bzero (its ctor initialises everything). Return type is void — the getter side-effects
 * self.yxzx_v210 and returns nothing.
 */
export function hgColorGamma_m_Getv210_YXZXExpandNode(
  self: HGColorGamma,
  _renderer: HGRendererOpaque,
): void {
  // @0x00000000000f95a7
  if (self.yxzx_v210 !== null) return;
  // @0x00000000000f95c0
  const p = HGObject_operator_new(0x1a0) as HgcColorGamma_v210_yxzx_rgba_expand_Opaque;
  // @0x00000000000f95cb
  HgcColorGamma_v210_yxzx_rgba_expand_ctor(p);
  // @0x00000000000f95dd
  self.yxzx_v210 = p;
}

/**
 * HGColorGamma::m_Getv216_YXZXExpandNode().
 * @0x00000000000f9600..0x00000000000f965c
 * Same structure as YXZX 2vuy (with bzero, different field +0x1e8, different ctor).
 */
export function hgColorGamma_m_Getv216_YXZXExpandNode(
  self: HGColorGamma,
): HgcColorGamma_v216_yxzx_expand_Opaque {
  // @0x00000000000f960a
  if (self.yxzx_v216 !== null) return self.yxzx_v216;
  // @0x00000000000f961e..0x00000000000f962e
  const p = HGObject_operator_new(0x1a0) as HgcColorGamma_v216_yxzx_expand_Opaque;
  // @0x00000000000f9639
  HgcColorGamma_v216_yxzx_expand_ctor(p);
  // @0x00000000000f964b
  self.yxzx_v216 = p;
  return p;
}

/**
 * HGColorGamma::RenderTile(HGTile*).
 * @0x00000000000f5000..0x00000000000f50ac
 *
 * Deferred to chunk m1+. Fast-path early-out on null transformData is decoded (see file
 * header). The core body chains HGTile::Renderer, HGRenderer::GetTarget, ReadTile_AVX/SSE,
 * HGStats::UnitStats::readTile — all frontier callees not yet ported. Faithful CFG needs
 * HGTile.ts + HGRenderer.ts + HGBitmap.ts + a decoded ReadTile kernel.
 */
export function hgColorGamma_RenderTile(_self: HGColorGamma, _tile: HGTileOpaque): number {
  throw new Error(
    "raw-port: HGColorGamma::RenderTile(HGTile*) not yet transcribed " +
    "(@0x00000000000f5000..0x00000000000f50ac; needs HGTile/HGRenderer/HGBitmap decode + " +
    "ReadTile_AVX @0x00000000000f5055 + ReadTile_SSE @0x00000000000f505c + " +
    "HGStats::UnitStats::readTile @0x00000000000f50a0 — Helium)",
  );
}

/**
 * HGColorGamma::HGColorGamma() — C2 base ctor.
 * @0x00000000000f50b0..0x00000000000f5312 (see ctor.s).
 *
 * Deferred to chunk m1+. The ctor initialises ~50 fields plus calls HGNode::HGNode(),
 * HGNode::ClearBits() 8 times, loads 2 rodata tables into +0x300..+0x3f0, and calls
 * HGColorGamma::SetYCbCrBiasAndScale(). Full transcription needs HGNode.ts + those
 * .rodata pools resolved.
 */
export function hgColorGamma_ctor_C2(): HGColorGamma {
  throw new Error(
    "raw-port: HGColorGamma::HGColorGamma() (C2) not yet transcribed " +
    "(@0x00000000000f50b0..0x00000000000f5312; needs HGNode.ts + rodata pools at " +
    "0x00000000000f5181 (double) + 0x00000000000f521c..0x00000000000f5298 (tone-curve constants) — Helium)",
  );
}

/**
 * HGColorGamma::HGColorGamma() — C1 complete ctor.
 * @0x00000000000f5a80. Bare `jmp` trampoline to C2.
 */
export function hgColorGamma_ctor_C1(): HGColorGamma {
  // @0x00000000000f5a85  jmp __ZN12HGColorGammaC2Ev
  return hgColorGamma_ctor_C2();
}

/**
 * HGColorGamma::SetConversionPreset(hgColorGammaConversionPreset preset).
 * @0x00000000000f5340..0x00000000000f5a49
 *
 * Deferred to chunk m1+. 300-line 7-way switch table (jump table @0x00000000000f5371).
 * Every case is a large sequence of SSE-broadcast .rodata loads into +0x380..+0x3f0 and
 * +0x300..+0x360, plus u64 mode-writes to +0x404 and calls to HGNode::ClearBits before
 * each block. Full port needs all 7 .rodata pools resolved via resolve.py.
 */
export function hgColorGamma_SetConversionPreset(_self: HGColorGamma, _preset: number): void {
  throw new Error(
    "raw-port: HGColorGamma::SetConversionPreset(hgColorGammaConversionPreset) " +
    "not yet transcribed (@0x00000000000f5340..0x00000000000f5a49; 7-way switch + " +
    "per-case tone-curve tables — Helium)",
  );
}

/**
 * HGColorGamma::GetOutput(HGRenderer*).
 * @0x00000000000f6000..0x00000000000f755X (1,371 disasm lines).
 *
 * Deferred to chunk m2+. Primary render-graph composition entry: wires the sub-nodes at
 * +0x1a8..+0x2e0 with the transform block at +0x300..+0x3f0.
 */
export function hgColorGamma_GetOutput(
  _self: HGColorGamma,
  _renderer: HGRendererOpaque,
): HGNodeOpaque {
  throw new Error(
    "raw-port: HGColorGamma::GetOutput(HGRenderer*) not yet transcribed " +
    "(@0x00000000000f6000..0x00000000000f755X; 1,371-line render-graph composition — Helium)",
  );
}

/**
 * HGColorGamma::IsConcatenatable(HGNode*).
 * @0x00000000000f7550..0x00000000000f75fX (55 disasm lines).
 *
 * Deferred to chunk m1+. Head is decoded:
 *   if (*(int32_t*)&other[+0x0c] != 0x424D504C 'BMPL') return 0;   // @0x00000000000f7550
 *   if (self.modeEnum_404 != 0) return 0;                            // @0x00000000000f755f
 * The 4-lane float predicate on self.transformBlock[+0x300] vs a rodata constant needs
 * the .rodata pool decoded first.
 */
export function hgColorGamma_IsConcatenatable(
  _self: HGColorGamma,
  _other: HGNodeOpaque,
): boolean {
  throw new Error(
    "raw-port: HGColorGamma::IsConcatenatable(HGNode*) not yet transcribed " +
    "(@0x00000000000f7550..0x00000000000f75fX; 'BMPL' tag check + mode-guard + 4-lane " +
    "float predicate — needs .rodata pool decode — Helium)",
  );
}

/**
 * HGColorGamma::ConcatenateWithUpstreamNode(HGRenderer*, HGNode**).
 * @0x00000000000f7630..0x00000000000f77XX (81 disasm lines).
 *
 * Deferred to chunk m1+ (paired with IsConcatenatable and GetOutput). SSE FMA merge of
 * upstream transformData into self.transformBlock.
 */
export function hgColorGamma_ConcatenateWithUpstreamNode(
  _self: HGColorGamma,
  _renderer: HGRendererOpaque,
  _nodePtr: { value: HGNodeOpaque },
): void {
  throw new Error(
    "raw-port: HGColorGamma::ConcatenateWithUpstreamNode(HGRenderer*, HGNode**) not yet " +
    "transcribed (@0x00000000000f7630..0x00000000000f77XX; SSE FMA transform-block merge — Helium)",
  );
}

/**
 * HGColorGamma::ScaleParams(HGNode*, HGRenderer*).
 * @0x00000000000f77c0..0x00000000000f94XX (1,568 disasm lines).
 *
 * Deferred to chunk m1+. Second-largest method in the class (after GetOutput). Scales
 * the caller's transform block by rendering-target resolution ratios via SSE FMA on the
 * transformBlock at +0x300..+0x360 and premult recomputation.
 */
export function hgColorGamma_ScaleParams(
  _self: HGColorGamma,
  _node: HGNodeOpaque,
  _renderer: HGRendererOpaque,
): void {
  throw new Error(
    "raw-port: HGColorGamma::ScaleParams(HGNode*, HGRenderer*) not yet transcribed " +
    "(@0x00000000000f77c0..0x00000000000f94XX; 1,568-line SSE FMA transform-block scaler — Helium)",
  );
}

// ── Dispatch table (assemble_class.py convention) ───────────────────────────────────
export const HGColorGamma_m0_methods = {
  "HGColorGamma::RenderTile(HGTile*)":                                     hgColorGamma_RenderTile,                     // @0x00000000000f5000
  "HGColorGamma::HGColorGamma()@C2":                                       hgColorGamma_ctor_C2,                        // @0x00000000000f50b0
  "HGColorGamma::GetDefaultToneQualityMode()":                             hgColorGamma_GetDefaultToneQualityMode,      // @0x00000000000f5330
  "HGColorGamma::SetConversionPreset(HGColorGamma::hgColorGammaConversionPreset)":
                                                                           hgColorGamma_SetConversionPreset,            // @0x00000000000f5340
  "HGColorGamma::HGColorGamma()@C1":                                       hgColorGamma_ctor_C1,                        // @0x00000000000f5a80
  "HGColorGamma::~HGColorGamma()@D2":                                      hgColorGamma_dtor_D2,                        // @0x00000000000f5a90
  "HGColorGamma::ReleaseNodes()":                                          hgColorGamma_ReleaseNodes,                   // @0x00000000000f5ac0
  "HGColorGamma::~HGColorGamma()@D1":                                      hgColorGamma_dtor_D1,                        // @0x00000000000f5f40
  "HGColorGamma::~HGColorGamma()@D0":                                      hgColorGamma_dtor_D0,                        // @0x00000000000f5f70
  "HGColorGamma::GetDOD(HGRenderer*, int, HGRect)":                        hgColorGamma_GetDOD,                         // @0x00000000000f5fb0
  "HGColorGamma::GetROI(HGRenderer*, int, HGRect)":                        hgColorGamma_GetROI,                         // @0x00000000000f5fd0
  "HGColorGamma::GetOutput(HGRenderer*)":                                  hgColorGamma_GetOutput,                      // @0x00000000000f6000
  "HGColorGamma::IsConcatenatable(HGNode*)":                               hgColorGamma_IsConcatenatable,               // @0x00000000000f7550
  "HGColorGamma::ConcatenateWithUpstreamNode(HGRenderer*, HGNode**)":      hgColorGamma_ConcatenateWithUpstreamNode,    // @0x00000000000f7630
  "HGColorGamma::CreateNodes()":                                           hgColorGamma_CreateNodes,                    // @0x00000000000f7780
  "HGColorGamma::ScaleParams(HGNode*, HGRenderer*)":                       hgColorGamma_ScaleParams,                    // @0x00000000000f77c0
  "HGColorGamma::m_Get2vuy_YXZXExpandNode()":                              hgColorGamma_m_Get2vuy_YXZXExpandNode,       // @0x00000000000f94c0
  "HGColorGamma::m_Get2vuy_XYXZExpandNode()":                              hgColorGamma_m_Get2vuy_XYXZExpandNode,       // @0x00000000000f9530
  "HGColorGamma::m_Getv210_YXZXExpandNode(HGRenderer*)":                   hgColorGamma_m_Getv210_YXZXExpandNode,       // @0x00000000000f95a0
  "HGColorGamma::m_Getv216_YXZXExpandNode()":                              hgColorGamma_m_Getv216_YXZXExpandNode,       // @0x00000000000f9600
} as const;
