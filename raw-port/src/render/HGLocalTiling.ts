// HGLocalTiling — Helium framework, x86_64 slice @0x178f10..@0x179283
//
// An HGNode that renders a rectangular region-of-interest by DECOMPOSING it into a grid of
// sub-tiles and driving them through the standard HGRenderer::RenderInput dispatch, with an
// atomic counter (`0x1c8`) so multiple worker threads can claim sub-tiles concurrently.
//
// The class stores ONE user parameter: a 4-tuple `(x, y, w, h)` at index 0 that HGRectMake4f
// packs into an HGRect kept at `+0x198..+0x1a7`. Slot 0 of GetROI returns that rect; every other
// ROI slot returns HGRectNull. RenderTile itself contains the decodable arithmetic:
//   - Read four integer tile-corner fields (+0x1a8..+0x1b4) — the actual pixel-space bounds.
//   - Query the renderer's execution-unit for tile-width (slot 1), tile-height (slot 2), and
//     a "worker count" (slot 5) via vtable +0x80.
//   - Compute `nTilesX = ceil((maxX - minX) / tileW)` and `nTilesY = ceil((maxY - minY) / tileH)`
//     using SSE cvtsi2ss + divss + roundss $0xa (round-up-then-truncate = ceil).
//   - Loop: atomically `xadd 0x1c8(%rbx), 1` to claim a linear tile index; convert (idx / nTilesX,
//     idx % nTilesX) back to a sub-rect; clamp against the parent bounds; call HGRenderer::
//     RenderInput on it; call HGRenderer::RenderCheckPoint(); exit when index ≥ total or
//     check-point returns non-zero.
//   - After the loop, walk `-0x2c` mutexes at offsets `0x1bc*stride + 0x1c0` and pthread_mutex_lock
//     each one (a serialization prologue for shared buffers).
//
// Source symbols (Helium.framework, x86_64, FAT slice at file offset 0x4000):
//   __ZN13HGLocalTiling12SetParameterEiffff    ::SetParameter(i,f,f,f,f)   @0x178f10  (33 lines)
//   __ZN13HGLocalTiling10RenderTileEP6HGTile   ::RenderTile(HGTile*)       @0x179090  (129 lines)
//   __ZN13HGLocalTiling6GetROIEP10HGRendereri6HGRect ::GetROI(...)         @0x179060  (15 lines)
//   (GetDOD / GetOutput / SetState / ctor / dtor  — not decoded here)

// -------------------------------------------------------------------------------------------------
// Struct layout (recovered from SetParameter + RenderTile + GetROI):
//
//   +0x000  HGNode base (vtable at (this))
//   +0x198  HGRect  paramRect0   (SetParameter idx=0 stores here via HGRectMake4f)
//                                First 16 bytes: (rax, rdx) returned pair — probably (x,y,w,h) as
//                                two 8-byte halves of the HGRect struct.
//   +0x1a8  int32   minX         (RenderTile @0x1790f4 movl 0x1a8, %ecx)
//   +0x1ac  int32   minY         (RenderTile @0x1790fa movl 0x1ac, %edx)
//   +0x1b0  int32   maxX         (RenderTile @0x179100 movl 0x1b0, %r13d)
//   +0x1b4  int32   maxY         (RenderTile @0x179107 movl 0x1b4, %r14d)
//   +0x1bc  int32   mutexStride  (RenderTile @0x179158 movslq 0x1bc; scaled by 0xa0 execUnit field)
//   +0x1c0  void*   mutexBase    (RenderTile @0x179167 addq 0x1c0; base ptr for mutex array)
//   +0x1c8  int32   tileCounter  (RenderTile @0x1791a6 lock xadd — atomic claim index)
//
// HGTile layout (from RenderTile arg):
//   +0x150  HGExecutionUnit* execUnit    (RenderTile @0x1790a4 movq 0x150(%rsi), %r15)
// HGExecutionUnit layout:
//   +0x098  HGSomeSlotProvider* slotProv (RenderTile @0x1790ab movq 0x98(%r15), %rdi)
//   +0x0a0  int32              stride    (RenderTile @0x179151 movslq 0xa0(%r15), %rdi)
//   Its vtable +0x80: query(int slot) -> int32 (tile width/height/worker count etc.)
// -------------------------------------------------------------------------------------------------

interface HGExecUnitSlotProvider {
  // vtable +0x80: __ZN?::querySlot(int idx) -> int32  (used with idx=1,2,5)
  querySlot(idx: number): number;
}
interface HGRendererLike {
  // HGRenderer::RenderInput(HGExecutionUnit*, HGNode*, int slot, HGTBuffer*, HGRect, int flag)
  renderInput(execUnit: unknown, node: unknown, slot: number, buffer: unknown, rect: {x0: number; y0: number; x1: number; y1: number;}, flag: number): void;
  // HGRenderer::RenderCheckPoint() -> int  (nonzero → abort tile loop)
  renderCheckPoint(): number;
}
interface HGTileLike {
  execUnit: {
    slotProv: HGExecUnitSlotProvider;   // +0x98
    stride: number;                     // +0xa0 (int32, used to scale mutexStride)
    renderer: HGRendererLike;           // where RenderInput/RenderCheckPoint dispatch
  };
}

/** Packed HGRect representation. The C++ struct occupies 16 bytes returned in (rax, rdx). */
export interface HGRect {
  x: number; y: number; w: number; h: number;
}

/** HGRectNull @VA=(0x179072+7)+0x?? — the "no ROI" sentinel returned by GetROI for idx≠0. */
export const HGRectNull: HGRect = { x: 0, y: 0, w: 0, h: 0 };

/**
 * HGRectMake4f(x, y, w, h) — a helper stubbed as a call target at @0x178f50.
 * The x86 return convention packs 16 bytes into (rax, rdx). Ported as the obvious struct build.
 *
 * NOTE: HGRectMake4f is its own function symbol not yet decoded; if its behavior turns out to be
 * anything OTHER than "pack (x,y,w,h) as a 16-byte record" — e.g. it clamps or reorders — this
 * port is wrong and must be revisited.
 */
export function hgRectMake4f(x: number, y: number, w: number, h: number): HGRect {
  return { x: Math.fround(x), y: Math.fround(y), w: Math.fround(w), h: Math.fround(h) };
}

export class HGLocalTiling {
  // +0x198: user-set ROI parameter (via SetParameter idx=0)
  paramRect0: HGRect = { x: 0, y: 0, w: 0, h: 0 };

  // +0x1a8..+0x1b4: integer sub-render bounds (set elsewhere, likely by SetState / render setup)
  minX = 0;   // +0x1a8
  minY = 0;   // +0x1ac
  maxX = 0;   // +0x1b0
  maxY = 0;   // +0x1b4

  // +0x1bc: mutex slot stride (int32; scaled by execUnit.stride from +0xa0)
  mutexStride = 0;
  // +0x1c0: base pointer of the mutex array (opaque to TS — treat as index for a mutex handle map)
  mutexBase: unknown = null;
  // +0x1c8: atomic counter for tile-index claiming (per RenderTile invocation)
  tileCounter = 0;

  /**
   * HGLocalTiling::SetParameter(int idx, float x, float y, float w, float h)   @0x178f10
   *
   * If idx != 0, tail-jumps to HGNode::SetParameter (the base handles all other indices).
   * If idx == 0, calls HGRectMake4f(x, y, w, h), stores the returned pair (rax → +0x198,
   * rdx → +0x1a0), then STILL tail-jumps to HGNode::SetParameter with the original args (so the
   * base class also gets to record the change). The base call is a real jmp, so its return value
   * is returned to the caller.
   */
  setParameter(idx: number, x: number, y: number, w: number, h: number): number {
    if (idx !== 0) {
      // @0x178f10 testl esi,esi ; jne HGNode::SetParameter
      throw new Error("HGLocalTiling.setParameter @0x178f12: HGNode::SetParameter base delegation not yet transcribed");
    }
    // @0x178f50 callq _HGRectMake4f(x, y, w, h)
    const rect = hgRectMake4f(x, y, w, h);
    // @0x178f6e movq %rax, 0x198(%r14) ; @0x178f75 movq %rdx, 0x1a0(%r14)
    this.paramRect0 = rect;
    // @0x178f84 jmp HGNode::SetParameter(idx, x, y, w, h)
    throw new Error("HGLocalTiling.setParameter @0x178f84: HGNode::SetParameter base delegation not yet transcribed");
  }

  /**
   * HGLocalTiling::GetROI(HGRenderer* r, int slot, HGRect inRect)   @0x179060
   *
   * Slot 0 → return this.paramRect0 (loaded from +0x1a8..).  ⚠️ WAIT — re-reading the disasm:
   *   leaq  0x1a8(%rdi), %rax          ; rax = &this[+0x1a8]  (points at minX/minY/maxX/maxY!)
   *   addq  $0x1b0, %rdi               ; rdi = &this[+0x1b0]  (points at maxX/maxY block)
   *   leaq  _HGRectNull(%rip), %rcx
   *   leaq  0x8(%rcx), %rsi            ; rsi = &HGRectNull + 8  (high half of null)
   *   testl %edx, %edx
   *   cmovneq %rcx, %rax               ; if slot != 0: rax = &HGRectNull       (low half)
   *   cmoveq  %rdi, %rsi               ; if slot == 0: rsi = &this[+0x1b0]     (high half)
   *   movq  (%rsi), %rdx               ; rdx = high 8 bytes of returned rect
   *   movq  (%rax), %rax               ; rax = low  8 bytes of returned rect
   *   ret
   *
   * So GetROI slot 0 returns the 16 bytes at [+0x1a8..+0x1b7], NOT paramRect0 at +0x198.
   * i.e. it returns (minX, minY, maxX, maxY) as an HGRect (interpreted as x0,y0,x1,y1). Slot != 0
   * returns the 16-byte HGRectNull constant.
   */
  getROI(_renderer: unknown, slot: number, _inRect: HGRect): HGRect {
    if (slot === 0) {
      // Return the 16 bytes at [+0x1a8..+0x1b7] as an HGRect. Field mapping (from RenderTile
      // reading these same offsets as int32 minX/minY/maxX/maxY):
      return { x: this.minX, y: this.minY, w: this.maxX, h: this.maxY };
      // (n.b. the exact interpretation "w,h" vs "x1,y1" depends on HGRect's own convention —
      //  RenderTile treats +0x1b0/+0x1b4 as maxX/maxY not width/height, since it computes
      //  `maxX - minX` and then `imull ... , esi ; cmovgel maxX, eax` clamps against maxX.)
    }
    return { ...HGRectNull };
  }

  /**
   * HGLocalTiling::RenderTile(HGTile* tile)   @0x179090   (129 lines)
   *
   * Threaded worker: repeatedly claims a sub-tile index via `lock xadd 0x1c8(%rbx)`, converts it
   * to (col, row) inside the parent bounds, clamps the far edge, and delegates to
   * HGRenderer::RenderInput. After the loop, walks a mutex table and locks each entry.
   *
   * PROLOGUE @0x1790a4..@0x179107 — read tile dimensions from execUnit + own state:
   *   r15         = tile->execUnit                                 (tile+0x150)
   *   slotProv    = r15->slotProv                                  (execUnit+0x98)
   *   tileW       = slotProv->querySlot(1)                          @0x1790ba (call *0x80(rax))
   *   tileH       = slotProv->querySlot(2)                          @0x1790d3
   *   workerCnt   = slotProv->querySlot(5)                          @0x1790eb  (used post-loop)
   *   minX        = this[+0x1a8] (ecx)                              @0x1790f4
   *   minY        = this[+0x1ac] (edx)                              @0x1790fa
   *   maxX        = this[+0x1b0] (r13d)                             @0x179100
   *   maxY        = this[+0x1b4] (r14d)                             @0x179107
   *
   * TILE-COUNT SETUP @0x17910e..@0x179189:
   *   nTilesX = ceil((maxX - minX) / tileW)   (roundss $0xa = round-toward-+Inf → cvttss2si = ceil)
   *   nTilesY = ceil((maxY - minY) / tileH)
   *   stride  = tile->execUnit->stride         (execUnit+0xa0 sign-extended)
   *   mutexOff = i64(this[+0x1bc]) * stride                          @0x179163 imulq
   *   mutexPtr = this[+0x1c0] + mutexOff                             @0x179167 addq (stored -0x58)
   *   total    = nTilesX * nTilesY                                   @0x179175 imull, stored -0x38
   *
   * MAIN LOOP @0x1791a0..@0x179221:
   *   loop:
   *     idx = lock xadd this[+0x1c8], 1                              @0x1791a6
   *     if idx >= total: break                                       @0x1791b0
   *     (col, row) = (idx % nTilesX, idx / nTilesX)                  @0x1791b2 idiv
   *     x0 = minX + col * tileW                                      @0x1791b6/be
   *     y0 = minY + row * tileH                                      @0x1791c0/d2
   *     x1 = min(maxX, x0 + tileW)                                   @0x1791dd cmovgel maxX
   *     y1 = min(maxY, y0 + tileH)                                   @0x1791e4 cmovgel maxY
   *     packed_rect = (x0, y0, x1, y1) as int32 quad → xmm0 → stack
   *     renderer.RenderInput(execUnit, this, 1, tbuf, {x0,y0,x1,y1}, 1)  @0x17920e
   *     if renderer.RenderCheckPoint() != 0: break                    @0x17921f
   *
   * EPILOGUE @0x179227..@0x179282 — post-loop mutex handshake:
   *   pthread_mutex_unlock(mutexPtr)                                 @0x17922b
   *   if stride == 0 && workerCnt >= 2:                              @0x179230..@0x179247
   *     for r14 = 1; r14 < workerCnt; ++r14:
   *       ptr = this[+0x1c0] + i64(this[+0x1bc]) * i64(r14)          @0x179250..@0x17925a
   *       pthread_mutex_lock(ptr)                                     @0x179265
   *
   *   return 0 (rax = 0)
   *
   * This function requires HGRenderer::RenderInput + RenderCheckPoint + pthread_mutex_{lock,unlock}
   * to be wired, none of which are ported yet. Per PORTING_SPEC rule 3, surface as a throwing
   * frontier — the shape and math are documented here for the follow-up worker.
   */
  renderTile(_tile: HGTileLike): number {
    throw new Error(
      "HGLocalTiling.renderTile @0x179090 not yet transcribed: pthread_mutex_lock/unlock + " +
        "HGRenderer::{RenderInput,RenderCheckPoint} vtable dispatches not ported"
    );
  }
}

/**
 * Ceil-divide via SSE round-toward-+Inf + truncate (mimics the exact x86 idiom used by the
 * tile-count setup at @0x179113..@0x17912a):
 *
 *   xmm0 = cvtsi2ss(numer)
 *   xmm1 = cvtsi2ss(denom)
 *   xmm0 = xmm0 / xmm1
 *   xmm0 = roundss $0xa, xmm0     ; 0x0a = round toward +∞ (nearest not-less-than)
 *   result = cvttss2si(xmm0)
 *
 * For non-negative integer numer/denom (as in RenderTile's `maxX - minX >= 0` and `tileW > 0`)
 * this equals `Math.ceil(numer / denom)` bit-exactly, since divss produces the correctly-rounded
 * single-precision quotient and cvttss2si truncates the rounded-up float.
 *
 * @param n numerator (int32, expected ≥ 0)
 * @param d denominator (int32, expected > 0)
 */
export function hgTiling_ceilDivSSE(n: number, d: number): number {
  const f = Math.fround;
  const q = f(f(n | 0) / f(d | 0));
  // roundss $0xa (round toward +∞) then cvttss2si (truncate). For positive q, ceil(q).
  // For q that happens to be an exact integer, both roundss and truncate leave it unchanged.
  const ceiled = Math.ceil(q);
  return ceiled | 0;
}
