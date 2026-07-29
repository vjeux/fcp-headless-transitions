// raw-port: OZSpline (chunk m2) — ProChannel.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//   Versions/A/ProChannel  (x86_64 slice at /tmp/ProChannel.x86_64; VA == file offset).
// Class-methods range for the FULL class: 0x2cd78 .. 0x03c9c4 (137 methods total, chunked 7 ways).
// Chunk 2 (this file) ports methods [40..60) of 137 — the "WithLock" wrappers, the extra
// getPreviousValidVertex / getNextValidVertex overloads, the small `getFirstVertex` /
// `getLastVertex` / `getNextVertex` / `getPreviousVertex` accessors, `getSmallDeltaU`,
// `getValidVertexIter`, `findVertex`, `isValidHandle`, and `lockSpline`:
//
//   getLastValidVertexWithLock(void**, CMTime const&)                      @0x2f6ca
//   getNextValidVertexWithLock(void*, void**, CMTime const&)               @0x2f73c
//   getPreviousValidVertexWithLock(void*, void**, CMTime const&)           @0x2f7b2
//   getPreviousValidVertex(void*, void**, CMTime const&)                   @0x2f828
//   getNextValidVertexWithLock(wrap_iter const&, void**, CMTime const&)    @0x2f89a
//   getNextValidVertex(wrap_iter const&, void**, CMTime const&)            @0x2f910
//   getPreviousValidVertexWithLock(wrap_iter const&, void**, CMTime const&)@0x2fa10
//   getPreviousValidVertex(wrap_iter const&, void**, CMTime const&)        @0x2fa86
//   getNextValidVertexWithLock(CMTime const&, void**, CMTime const&, bool) @0x2fca0
//   getPreviousValidVertexWithLock(CMTime const&, void**, CMTime const&, bool)@0x2fd26
//   getValidVertexIter(void*)                                              @0x2fdac
//   getSmallDeltaU() const                                                 @0x2fe52
//   getFirstVertex()                                                       @0x2fe86
//   getLastVertex()                                                        @0x2fe9c
//   getPreviousVertex(void*)                                               @0x2feb4
//   getNextVertex(void*)                                                   @0x2fed8
//   getNextVertex(CMTime const&)                                           @0x2ff06
//   findVertex(long, long, void*)                                          @0x2fff8
//   isValidHandle(void*)                                                   @0x3026c
//   lockSpline(bool)                                                       @0x302e6
//
// ── Additional OZSpline layout observations from this chunk ────────────────────────────
//   +0x10..+0x30  std::vector<OZVertex*> allVertices (getFirstVertex reads +0x10, cmpq +0x18;
//                                                    getLastVertex uses same range)
//   +0x28..+0x30  std::vector<OZVertex*> validVertices tail  (walked by lockSpline @0x302f0..@0x30324)
//   +0x48..+0x50  secondary "valid vertex" range              (used by getValidVertexIter linear
//                                                              scan @0x2fdfa..@0x2fe15)
//   +0x50  end sentinel for validVertexIter                  (@0x2fdfa `mov 0x50(%rdi),%rdx`)
//   +0x58  base ptr for validVertexIter primary scan          (@0x2fdb4 `mov 0x58(%rdi),%rdx`)
//   +0x60  ordering-anchor ptr for validVertexIter            (@0x2fdbf `mov 0x60(%rdi),%r8`)
//   +0x70  uint8 cachedListValid                              (getPreviousValidVertex @0x2f838
//                                                              `cmpb $0x1, 0x70(%rdi)`)
//   +0x80  int64  cached index into validVertexIter primary   (@0x2fdb8 `mov 0x80(%rdi),%rax`;
//                                                              @0x2fdb1 `mov ...,0x80(%rdi)` on hit)
//   +0xa0  externalLockManager* (spinlock delegate — same "if a && a->0x30 != null use
//          a->0x30 else lock own +0x8" pattern used by every WithLock wrapper in this chunk).
//   +0xa8  OZSplineState* — getSmallDeltaU reads state->b0 to select CMTimeMake(1,1) vs
//          CMTimeMake(1,0x64) (delta_u = 1/100 when b0==0, else 1/1).                       @0x2fe62
//
// ── Vertex vtable slots consumed ───────────────────────────────────────────────────────
//   [+0x88]  bool isValidAtTime(CMTime const&)   — @0x2f995 (getNextValidVertex iter overload),
//                                                  @0x2fb5e / @0x2fc14 (getPreviousValidVertex).
//
// ── External symbol stubs and GOT literals ─────────────────────────────────────────────
//   PCSpinLock::lock                                                 @stub 0xacb16
//   PCSpinLock::unlock                                               @stub 0xacb1c
//   CMTimeCompare                                                    @stub 0xaca80
//   CMTimeMake                                                       @stub 0xaca92
//   PCMath::equal(CMTime const&, CMTime const&, CMTime const&)       @stub 0xacc6c
//   _kCMTimeZero                                                     @GOT 0xca4c0
//   _kCMTimeNegativeInfinity                                         @GOT 0xca4b0
//   literal 0.5 (binary-search midpoint bias)                         @const 0xb03c0
//
// Faithful transcription per PORTING_SPEC (Rule 1/2/3). Every function cites its @0xADDR;
// vtable calls and undecoded callees resolve via loud-throw stubs that cite their address.

import { CMTime, CMTimeMake } from "../infra/CMTime.js";

// ── Shared minimal shape for the fields this chunk reads ───────────────────────────────

/**
 * OZSpline handle from the perspective of chunk m2. Field offsets cite the byte offset in the
 * on-disk struct and the disasm line that exposes it. Only the fields this chunk actually reads
 * or writes are declared here — the full struct lives in OZSpline.m0.ts / OZSpline.ts.
 */
export interface OZSplineFieldsM2 {
  /** +0x10..+0x30 std::vector<OZVertex*> — the ALL-vertices vector. getFirstVertex reads
   *  begin @+0x10, cmpq end @+0x18; getLastVertex uses the same range. */
  vertices: OZVertexHandleM2[];
  /** +0x28..+0x30 secondary "valid-vertex" end sentinels — this chunk only walks
   *  [validBegin, validEnd) in lockSpline @0x302f0. Modeled as the same array; the isolation
   *  of "valid" vs "all" is a runtime-refresh detail handled by OZSpline_setDirty (m1). */
  validVerticesBegin: OZVertexHandleM2[];
  /** +0x48..+0x50 secondary iterator range — used by getValidVertexIter's linear scan. */
  validIterBegin: unknown;
  validIterEnd: unknown;
  /** +0x58 base ptr, +0x60 anchor ptr, +0x80 cached index for the getValidVertexIter primary
   *  vector-random-access path. Opaque here; only findable via the actual disasm-mirrored
   *  scan below (which the port stubs — see loud-throw). */
  cachedListValid: number;              // +0x70 (u8)
  /** +0xa0 externalLockManager* — if non-null and its +0x30 is non-null, that pointer is
   *  passed as the `this` to PCSpinLock::lock/unlock; else the spinlock at +0x08 of this
   *  OZSpline is used. Modeled as an opaque handle; the JS port makes all locking a no-op
   *  (single-threaded), matching OZSpline.m3's `_lockOZSpline`. */
  externalLockManager: { spinLockRef: unknown } | null;
  /** +0xa8 OZSplineState* — getSmallDeltaU reads state->b0. */
  state: { b0: number } | null;
}

/** Opaque vertex handle. Matches OZSpline.m1/m3's model. */
export type OZVertexHandleM2 = {
  readonly __brand: "OZVertexHandleM2";
  /** +0x10..+0x20 CMTime valueU — read by findVertex (via 0x10..+0x20 movups) and by
   *  getPreviousValidVertex(wrap_iter) (via same movups sequence). */
  valueU?: CMTime;
};

// ── Symbol-stub bridges ────────────────────────────────────────────────────────────────

/** PCSpinLock::lock — @ProChannel stub 0xacb16. Single-threaded JS port: no-op. */
function _spinLock_lock(_who: unknown): void { void _who; }
/** PCSpinLock::unlock — @ProChannel stub 0xacb1c. Single-threaded JS port: no-op. */
function _spinLock_unlock(_who: unknown): void { void _who; }

/**
 * Reproduces the spinlock-target selection every WithLock wrapper in this chunk emits:
 *   rax = sp->externalLockManager                                            (+0xa0)
 *   if (rax == null || rax->spinLockRef == null) rdi = sp+0x8   (internal spinlock)
 *   else                                          rdi = rax->spinLockRef
 * Then callq PCSpinLock::lock (or unlock).  Every wrapper in this chunk emits this exact
 * sequence twice (before + after the inner call). See @0x2f6dd..@0x2f6f6 and @0x2f70c..@0x2f728.
 */
function _acquireSpinLock(sp: OZSplineFieldsM2): void {
  const mgr = sp.externalLockManager;
  if (mgr !== null && mgr.spinLockRef !== null && mgr.spinLockRef !== undefined) {
    _spinLock_lock(mgr.spinLockRef);
  } else {
    _spinLock_lock(sp);
  }
}
function _releaseSpinLock(sp: OZSplineFieldsM2): void {
  const mgr = sp.externalLockManager;
  if (mgr !== null && mgr.spinLockRef !== null && mgr.spinLockRef !== undefined) {
    _spinLock_unlock(mgr.spinLockRef);
  } else {
    _spinLock_unlock(sp);
  }
}

/**
 * CMTimeCompare(a, b) — @ProChannel stub 0xaca80 (system CoreMedia _CMTimeCompare).
 * Faithful semantics: cross-multiply (a.value * b.timescale) vs (b.value * a.timescale) in
 * int64. Ported here as BigInt to preserve exact ordering (Rule 4).
 */
function _CMTimeCompare(a: CMTime, b: CMTime): number {
  const lhs = a.value * BigInt(b.timescale);
  const rhs = b.value * BigInt(a.timescale);
  if (lhs < rhs) return -1;
  if (lhs > rhs) return 1;
  return 0;
}
void _CMTimeCompare; // documented; used by loud-throws that reference the disasm

/**
 * OZSpline::getVertexIter(void*) — @ProChannel 0x2d49c (frontier; owned by an earlier chunk).
 * Called by getPreviousVertex @0x2febd and getNextVertex(void*) @0x2fee1.
 */
function _OZSpline_getVertexIter(_sp: OZSplineFieldsM2, _cur: OZVertexHandleM2): number {
  void _sp; void _cur;
  throw new Error(
    "OZSpline::getVertexIter(void*) @ProChannel 0x2d49c not yet transcribed (owned by " +
      "an earlier OZSpline chunk)",
  );
}

// ── ported methods ─────────────────────────────────────────────────────────────────────

/**
 * OZSpline::getLastValidVertexWithLock(void** out, CMTime const& t) -> bool.
 *   @ProChannel 0x2f6ca
 *
 * Disasm (verbatim — 40 lines):
 *   push %rbp / mov %rsp,%rbp / push %r15,%r14,%rbx,%rax  (frame + save)
 *   %r14 = %rdx (t), %r15 = %rsi (out), %rbx = %rdi (this)
 *   rax = *(this+0xa0)                              (externalLockManager)
 *   if (rax != 0 and rax->0x30 != 0) rdi = rax->0x30
 *   else                              rdi = this + 0x8
 *   callq PCSpinLock::lock                          @0x2f6f6 (stub 0xacb16)
 *   rdi=this, rsi=out, rdx=t
 *   callq OZSpline::getLastValidVertex              @0x2f704 (see m1 @0x2dd5a)
 *   %r14d = %eax                                    (save result byte-narrow)
 *   [same lock-target select]
 *   callq PCSpinLock::unlock                        @0x2f728 (stub 0xacb1c)
 *   eax = r14d
 *   epilogue
 *
 * Structure: RAII-style lock-wrap over getLastValidVertex.
 */
export function OZSpline_getLastValidVertexWithLock(
  sp: OZSplineFieldsM2,
  out: { v: OZVertexHandleM2 | null },
  t: CMTime,
): boolean {
  _acquireSpinLock(sp);
  const r = _OZSpline_getLastValidVertex(sp, out, t);
  _releaseSpinLock(sp);
  return r;
}

/**
 * OZSpline::getLastValidVertex(void** out, CMTime const& t) — @ProChannel 0x2dd5a.
 * Owned by OZSpline.m1 — imported through this stub so the WithLock wrapper above can call
 * it. The m1 chunk exports `OZSpline_getLastValidVertex`. Cross-file wiring is deferred to
 * a later chunk that unifies OZSplineFieldsM1 / M2 / M3.
 */
function _OZSpline_getLastValidVertex(
  _sp: OZSplineFieldsM2,
  _out: { v: OZVertexHandleM2 | null },
  _t: CMTime,
): boolean {
  void _sp; void _out; void _t;
  throw new Error(
    "OZSpline::getLastValidVertex(void**, CMTime const&) @ProChannel 0x2dd5a — real port " +
      "lives in OZSpline.m1; call through the m1 export (OZSpline_getLastValidVertex) instead",
  );
}

/**
 * OZSpline::getNextValidVertexWithLock(void* cur, void** out, CMTime const& t) -> bool.
 *   @ProChannel 0x2f73c
 *
 * Disasm (verbatim — 41 lines): same "acquire spinlock, delegate, release" pattern as
 * getLastValidVertexWithLock @0x2f6ca. Delegate is
 *   OZSpline::getNextValidVertex(void*, void**, CMTime const&)   @0x2df68 (owned by m1).
 */
export function OZSpline_getNextValidVertexWithLock_byHandle(
  sp: OZSplineFieldsM2,
  cur: OZVertexHandleM2 | null,
  out: { v: OZVertexHandleM2 | null },
  t: CMTime,
): boolean {
  _acquireSpinLock(sp);
  const r = _OZSpline_getNextValidVertex_byHandle(sp, cur, out, t);
  _releaseSpinLock(sp);
  return r;
}
function _OZSpline_getNextValidVertex_byHandle(
  _sp: OZSplineFieldsM2,
  _cur: OZVertexHandleM2 | null,
  _out: { v: OZVertexHandleM2 | null },
  _t: CMTime,
): boolean {
  void _sp; void _cur; void _out; void _t;
  throw new Error(
    "OZSpline::getNextValidVertex(void*, void**, CMTime const&) @ProChannel 0x2df68 — real " +
      "port lives in OZSpline.m1 (OZSpline_getNextValidVertex)",
  );
}

/**
 * OZSpline::getPreviousValidVertexWithLock(void* cur, void** out, CMTime const& t) -> bool.
 *   @ProChannel 0x2f7b2
 *
 * Disasm (verbatim — 41 lines): identical "acquire spinlock, delegate, release" shape.
 * Delegate: OZSpline::getPreviousValidVertex(void*, void**, CMTime const&)  @0x2f828 (below).
 */
export function OZSpline_getPreviousValidVertexWithLock_byHandle(
  sp: OZSplineFieldsM2,
  cur: OZVertexHandleM2 | null,
  out: { v: OZVertexHandleM2 | null },
  t: CMTime,
): boolean {
  _acquireSpinLock(sp);
  const r = OZSpline_getPreviousValidVertex_byHandle(sp, cur, out, t);
  _releaseSpinLock(sp);
  return r;
}

/**
 * OZSpline::getPreviousValidVertex(void* cur, void** out, CMTime const& t) -> bool.
 *   @ProChannel 0x2f828
 *
 * Disasm (verbatim — 42 lines):
 *   mov %rdx,%rbx (out), mov %rdi,%r14 (this)
 *   cmpb $0x1, 0x70(%rdi)     (cachedListValid?)
 *   jne .slow                                                    @0x2f83c
 *   .cached:
 *     rdi=this
 *     callq OZSpline::getValidVertexIter(void*)                   @0x2f841 (below)
 *     cmpq 0x48(%r14),%rax     (rax == validIterBegin?)          @0x2f846
 *     je   .none                                                  @0x2f84a
 *     mov %rax,%rcx
 *     mov $1,%al               (return true)
 *     testq %rbx,%rbx          (out != null?)                    @0x2f851
 *     je   .ret
 *     movq -0x8(%rcx),%rcx     (rcx = *(iter-1))                 @0x2f856
 *     mov %rcx,(%rbx)          (*out = predecessor)
 *     jmp .ret
 *   .slow:
 *     %r15 = %rcx (t)
 *     rdi=this
 *     callq OZSpline::getVertexIter(void*)                        @0x2f865 (frontier)
 *     mov %rax,-0x20(%rbp)     (stash iter on stack as wrap_iter)
 *     rdi=this, rsi=&stackIter, rdx=out, rcx=t
 *     callq OZSpline::getPreviousValidVertex(wrap_iter, ..., t)   @0x2f87a (@0x2fa86 below)
 *     jmp .ret
 *   .none:
 *     testq %rbx,%rbx / je .none2
 *     movq $0,(%rbx)           (*out = null)
 *   .none2:
 *     xorl %eax,%eax
 *   .ret: epilogue
 *
 * The "cached" branch takes `cur` as the vertex handle whose predecessor in the valid list is
 * wanted; getValidVertexIter returns the iter INTO the primary valid vector. `-0x8(%rcx)` is
 * the pointer 8 bytes before the iter (the previous OZVertex*).
 */
export function OZSpline_getPreviousValidVertex_byHandle(
  _sp: OZSplineFieldsM2,
  _cur: OZVertexHandleM2 | null,
  _out: { v: OZVertexHandleM2 | null },
  _t: CMTime,
): boolean {
  void _sp; void _cur; void _out; void _t;
  throw new Error(
    "OZSpline::getPreviousValidVertex(void*, void**, CMTime const&) @ProChannel 0x2f828 not " +
      "yet transcribed — .cached branch depends on OZSpline_getValidVertexIter @0x2fdac and " +
      ".slow branch delegates to getPreviousValidVertex(wrap_iter) @0x2fa86; both are " +
      "frontier stubs in this chunk",
  );
}

/**
 * OZSpline::getValidVertexIter(void* cur) — @ProChannel 0x2fdac.
 *
 * Disasm (verbatim — 52 lines):
 *   rcx = *(this+0x48)     (validIterBegin ptr)
 *   rdx = *(this+0x58)     (primary vector base ptr)
 *   rax = *(this+0x80)     (cached index — int64)
 *   r8  = *(this+0x60)     (primary vector "anchor" — one past last of primary)
 *   r8 -= rdx; r8 >>= 3    (r8 = (0x60 - 0x58)/8 = size of primary in elements)
 *   cmp rax, r8            (is cached index in bounds?)
 *   jae .checkNeg1
 *   cmp cur, *(rdx + rax*8)   (primary[cached] == cur?)
 *   je  .hitCached                                                @0x2fdcf
 * .checkNeg1:
 *   test rax, rax / jle .checkPlus1
 *   r9 = rax - 1
 *   cmp r9, r8 / jae .checkPlus1
 *   cmp cur, *(rdx + rax*8 - 8)   (primary[cached-1] == cur?)      @0x2fde3
 *   je  .hitMinus1                                                 @0x2fde8 -> 0x2fe3f
 * .checkPlus1:
 *   r9 = rax + 1
 *   cmp r9, r8 / jae .linearScan
 *   cmp cur, *(rdx + rax*8 + 8)   (primary[cached+1] == cur?)      @0x2fdf3
 *   je  .hitPlus1                                                  @0x2fdf8 -> 0x2fe3f
 * .linearScan:
 *   rdx = *(this+0x50)     (primary end sentinel)
 *   r8  = rdx; rax = rcx   (start from validIterBegin)
 *   r8 -= rcx              (span in bytes)
 *   je  .end                                                       @0x2fe07 -> 0x2fe24
 *   .loop:
 *     cmp cur, *(rax) / je .foundLinear
 *     rax += 8
 *     cmp rdx, rax / jne .loop
 *   .fellOff:
 *     r8 >>= 3
 *     *(this+0x80) = r8    (cache miss: cached index = size)
 *     jmp .retLinearMiss                                           @0x2fe17 -> 0x2fe3a
 *   .foundLinear:
 *     rsi = rax - rcx; rsi >>= 3
 *     *(this+0x80) = rsi   (cache hit: cached index = found-offset)
 *     if rax != rdx { ...; jmp .retFound }   (@0x2fe35)
 *   .retLinearMiss:
 *     rax = rcx
 *     jmp .ret
 *   .foundLinear2:                                                 @0x2fe50
 *     rax = rax
 *     jmp .ret
 *   .hitMinus1:                                                    @0x2fe3f
 *     rax = rcx + r9*8;  *(this+0x80) = r9;  jmp .ret
 *   .hitCached:                                                    @0x2fe4c
 *     rax = rcx + rax*8;  jmp .ret
 *   .ret: pop rbp / retq
 *
 * Returns an OZVertex** — the iter position in the "valid" list at +0x48. The +0x80 cache is
 * mutated on every call (both hit and miss). The primary vector (base @+0x58, anchor @+0x60,
 * end @+0x50) is a SEPARATE vector from the valid range at +0x48; the cache index refers to
 * the primary vector and is used to short-circuit lookups.
 *
 * NOTE: this port CANNOT be usefully modeled without the full primary-vector layout, which
 * is opaque to this chunk (fields at +0x50/+0x58/+0x60/+0x80 aren't materialized in
 * OZSplineFieldsM2 as concrete typed arrays — no earlier chunk documented them either). The
 * function is loud-thrown; a future chunk that owns the primary vector must materialize it and
 * complete this port.
 */
export function OZSpline_getValidVertexIter(
  _sp: OZSplineFieldsM2,
  _cur: OZVertexHandleM2 | null,
): number {
  void _sp; void _cur;
  throw new Error(
    "OZSpline::getValidVertexIter(void*) @ProChannel 0x2fdac not yet transcribed — depends on " +
      "primary-vector fields at +0x50/+0x58/+0x60/+0x80 not yet materialized by an owning chunk",
  );
}

/**
 * OZSpline::getNextValidVertex(wrap_iter const& it, void** out, CMTime const& t) -> bool.
 *   @ProChannel 0x2f910
 *
 * Disasm (verbatim — 90 lines): iter-based next-valid lookup. The wrap_iter argument (rsi) is
 * a wrap_iter<OZVertex**> — a single pointer packed at *(rsi). The routine:
 *   1. r13 = *(rsi)                                                  (starting iter)
 *   2. if (out != null) *out = null; r13 = *(r12)                    (reset out; reload iter)
 *   3. rcx = *(this + 0x30)                                          (end of all-vertex vec)
 *      if (r13 == rcx) return 0                                       (nothing left)
 *   4. if (this->cachedListValid at +0x70 == 0) goto .linearScan
 *   5. .cached: rsi = *r13; call getValidVertexIter(rsi)              @0x2f95d
 *      rcx = this->0x50 (end sentinel of valid range)
 *      if (rax == rcx) goto .none                                     @0x2f966
 *      rax += 8
 *      if (rax == rcx) goto .none                                     @0x2f96f
 *      if (out == null) return 1
 *      rcx = *rax
 *      *out = rcx; return 1                                           @0x2f9f8
 *   6. .linearScan: r13 += 8
 *      loop while (r13 != rcx):
 *        rdi = *r13
 *        rax = *rdi (vtable)
 *        call rax at slot +0x88 (isValidAtTime(t))                    @0x2f995
 *        if (not al) { r13+=8; continue; }
 *        // Compare current valid's valueU vs the iter's valueU via CMTimeCompare @0x2f9cd
 *        //   a = *(r13)->valueU  (movups 0x10(rax) etc)
 *        //   b = (*r12)->valueU
 *        if (CMTimeCompare(a,b) != 0) goto .foundLinear
 *        r13 += 8
 *      return 0
 *   7. .foundLinear: if (out) { rcx = *r13; *out = rcx; } return 1
 *
 * The disasm has a subtle "de-duplication" property: it skips vertices whose valueU equals the
 * starting iter's valueU (multiple valid vertices at exactly the same time collapse into one).
 * Precise ordering matters — porting requires an oracle harness against the real symbol.
 */
export function OZSpline_getNextValidVertex_iter(
  _sp: OZSplineFieldsM2,
  _it: { v: OZVertexHandleM2 | null },
  _out: { v: OZVertexHandleM2 | null } | null,
  _t: CMTime,
): boolean {
  void _sp; void _it; void _out; void _t;
  throw new Error(
    "OZSpline::getNextValidVertex(wrap_iter<OZVertex**> const&, void**, CMTime const&) " +
      "@ProChannel 0x2f910 not yet transcribed — depends on OZSpline_getValidVertexIter @0x2fdac " +
      "and OZVertex::isValidAtTime (vtable slot +0x88); both are frontier stubs in this chunk",
  );
}

/**
 * OZSpline::getNextValidVertexWithLock(wrap_iter const& it, void** out, CMTime const& t) -> bool.
 *   @ProChannel 0x2f89a
 *
 * Disasm (verbatim — 46 lines): identical spinlock-wrap over getNextValidVertex_iter @0x2f910.
 */
export function OZSpline_getNextValidVertexWithLock_iter(
  sp: OZSplineFieldsM2,
  it: { v: OZVertexHandleM2 | null },
  out: { v: OZVertexHandleM2 | null } | null,
  t: CMTime,
): boolean {
  _acquireSpinLock(sp);
  const r = OZSpline_getNextValidVertex_iter(sp, it, out, t);
  _releaseSpinLock(sp);
  return r;
}

/**
 * OZSpline::getPreviousValidVertex(wrap_iter const& it, void** out, CMTime const& t) -> bool.
 *   @ProChannel 0x2fa86
 *
 * Disasm (verbatim — 160 lines): more elaborate than the "next" variant because it maintains a
 * "best-so-far" fallback (%rbx = best-vertex-so-far, [-0x50..-0x30] = its valueU) that gets
 * upgraded whenever a valid vertex whose valueU is NEGATIVE (compared against kCMTimeZero via
 * PCMath::equal @0x2fbf9) is encountered, before the loop terminates. This "best-so-far" is
 * used to satisfy the caller when no exact valid predecessor exists in the range. See
 * @0x2fafd (movups (%rcx),%xmm0 loads kCMTimeNegativeInfinity from GOT 0xca4b0 into the
 * fallback slot) and @0x2fb9e..@0x2fbae (upgrading %rbx to a better candidate).
 */
export function OZSpline_getPreviousValidVertex_iter(
  _sp: OZSplineFieldsM2,
  _it: { v: OZVertexHandleM2 | null },
  _out: { v: OZVertexHandleM2 | null } | null,
  _t: CMTime,
): boolean {
  void _sp; void _it; void _out; void _t;
  throw new Error(
    "OZSpline::getPreviousValidVertex(wrap_iter<OZVertex**> const&, void**, CMTime const&) " +
      "@ProChannel 0x2fa86 not yet transcribed — 160-line body with kCMTimeNegativeInfinity " +
      "seeded fallback tracking + PCMath::equal @stub 0xacc6c; both are frontier stubs",
  );
}

/**
 * OZSpline::getPreviousValidVertexWithLock(wrap_iter const& it, void** out, CMTime const& t) -> bool.
 *   @ProChannel 0x2fa10
 *
 * Disasm (verbatim — 46 lines): spinlock-wrap over getPreviousValidVertex_iter @0x2fa86.
 */
export function OZSpline_getPreviousValidVertexWithLock_iter(
  sp: OZSplineFieldsM2,
  it: { v: OZVertexHandleM2 | null },
  out: { v: OZVertexHandleM2 | null } | null,
  t: CMTime,
): boolean {
  _acquireSpinLock(sp);
  const r = OZSpline_getPreviousValidVertex_iter(sp, it, out, t);
  _releaseSpinLock(sp);
  return r;
}

/**
 * OZSpline::getNextValidVertexWithLock(CMTime const& t, void** out, CMTime const& tRef, bool b)
 *   -> bool.  @ProChannel 0x2fca0
 *
 * Disasm (verbatim — 52 lines): spinlock-wrap over OZSpline::getNextValidVertex(CMTime, void**,
 * CMTime, bool) @0x2eb76 (owned by m1). The 5th arg (bool b) is zero-extended via
 * `movzbl %r12b,%r8d` before the delegate call — the bool is preserved verbatim.
 */
export function OZSpline_getNextValidVertexWithLock_atTime(
  sp: OZSplineFieldsM2,
  t: CMTime,
  out: { v: OZVertexHandleM2 | null } | null,
  tRef: CMTime,
  b: boolean,
): boolean {
  _acquireSpinLock(sp);
  const r = _OZSpline_getNextValidVertex_atTime(sp, t, out, tRef, b);
  _releaseSpinLock(sp);
  return r;
}
function _OZSpline_getNextValidVertex_atTime(
  _sp: OZSplineFieldsM2,
  _t: CMTime,
  _out: { v: OZVertexHandleM2 | null } | null,
  _tRef: CMTime,
  _b: boolean,
): boolean {
  void _sp; void _t; void _out; void _tRef; void _b;
  throw new Error(
    "OZSpline::getNextValidVertex(CMTime const&, void**, CMTime const&, bool) @ProChannel " +
      "0x2eb76 — real port lives in OZSpline.m1 (OZSpline_getNextValidVertex_atTime)",
  );
}

/**
 * OZSpline::getPreviousValidVertexWithLock(CMTime const& t, void** out, CMTime const& tRef, bool b)
 *   -> bool.  @ProChannel 0x2fd26
 *
 * Disasm (verbatim — 52 lines): spinlock-wrap over OZSpline::getPreviousValidVertex(CMTime, ...)
 * @0x2e94c (owned by m1).
 */
export function OZSpline_getPreviousValidVertexWithLock_atTime(
  sp: OZSplineFieldsM2,
  t: CMTime,
  out: { v: OZVertexHandleM2 | null } | null,
  tRef: CMTime,
  b: boolean,
): boolean {
  _acquireSpinLock(sp);
  const r = _OZSpline_getPreviousValidVertex_atTime(sp, t, out, tRef, b);
  _releaseSpinLock(sp);
  return r;
}
function _OZSpline_getPreviousValidVertex_atTime(
  _sp: OZSplineFieldsM2,
  _t: CMTime,
  _out: { v: OZVertexHandleM2 | null } | null,
  _tRef: CMTime,
  _b: boolean,
): boolean {
  void _sp; void _t; void _out; void _tRef; void _b;
  throw new Error(
    "OZSpline::getPreviousValidVertex(CMTime const&, void**, CMTime const&, bool) @ProChannel " +
      "0x2e94c — real port lives in OZSpline.m1 (OZSpline_getPreviousValidVertex_atTime)",
  );
}

/**
 * OZSpline::getSmallDeltaU() const -> CMTime.  @ProChannel 0x2fe52
 *
 * Disasm (verbatim — 18 lines):
 *   push %rbp / mov %rsp,%rbp / push %rbx / push %rax
 *   %rbx = %rdi                          (hidden return CMTime* — sret in rdi)
 *   rax = *(this+0xa8)                   (state ptr)                @0x2fe5b
 *   cmpb $0x0, (%rax)                    (state->b0 == 0?)          @0x2fe62
 *   mov $1, %eax                         (eax = 1)
 *   mov $0x64, %edx                      (edx = 100)
 *   cmovnel %eax, %edx                   (if state->b0 != 0 => edx = 1, else edx = 0x64)
 *   mov $1, %esi                         (value = 1)
 *   callq _CMTimeMake(value=1, timescale=edx)   @0x2fe77 (stub 0xaca92)
 *   %rax = %rbx                          (return the sret ptr — CoreMedia CMTimeMake writes
 *                                          the CMTime through %rdi)
 *
 * So: delta_u = CMTimeMake(1, state->b0 != 0 ? 1 : 100). When state->b0 == 0 -> 1/100
 * seconds; when set -> 1/1 = 1 second. This is the "epsilon" used by findVertex and by
 * the reparam path to detect near-coincident vertices.
 */
export function OZSpline_getSmallDeltaU(sp: OZSplineFieldsM2): CMTime {
  if (sp.state === null) {
    // Disasm unconditionally dereferences (%rax) — if state is null, deref would crash. We
    // preserve that behaviour with a loud throw rather than a silent fallback (Rule 3).
    throw new Error(
      "OZSpline::getSmallDeltaU @ProChannel 0x2fe52 — state (+0xa8) is null; disasm at " +
        "@0x2fe62 unconditionally reads state->b0",
    );
  }
  const denom = sp.state.b0 !== 0 ? 1 : 0x64;
  return CMTimeMake(1n, denom);
}

/**
 * OZSpline::getFirstVertex() -> OZVertex*.  @ProChannel 0x2fe86
 *
 * Disasm (verbatim — 11 lines):
 *   rax = *(this+0x10)     (begin ptr of allVertices vector)         @0x2fe86
 *   cmp rax, *(this+0x18)  (== end?)                                 @0x2fe8a
 *   je .empty                                                        @0x2fe8e
 *   push %rbp / mov %rsp,%rbp
 *   rax = *rax             (first element: OZVertex*)                @0x2fe94
 *   pop %rbp / ret
 *   .empty: xor %eax,%eax / ret                                       @0x2fe99
 */
export function OZSpline_getFirstVertex(sp: OZSplineFieldsM2): OZVertexHandleM2 | null {
  if (sp.vertices.length === 0) return null;
  return sp.vertices[0] ?? null;
}

/**
 * OZSpline::getLastVertex() -> OZVertex*.  @ProChannel 0x2fe9c
 *
 * Disasm (verbatim — 12 lines):
 *   rax = *(this+0x18)      (end ptr)
 *   cmp rax, *(this+0x10)   (begin == end?)
 *   je .empty
 *   push %rbp / mov %rsp,%rbp
 *   rax = *(rax-0x8)        (last element: OZVertex*)                @0x2feaa
 *   pop %rbp / ret
 *   .empty: xor %eax,%eax / ret                                       @0x2feb0
 */
export function OZSpline_getLastVertex(sp: OZSplineFieldsM2): OZVertexHandleM2 | null {
  const n = sp.vertices.length;
  if (n === 0) return null;
  return sp.vertices[n - 1] ?? null;
}

/**
 * OZSpline::getPreviousVertex(void* cur) -> OZVertex*.  @ProChannel 0x2feb4
 *
 * Disasm (verbatim — 17 lines):
 *   push %rbp / mov %rsp,%rbp / push %rbx / push %rax
 *   %rbx = %rdi
 *   callq OZSpline::getVertexIter(void*)                              @0x2febd (0x2d49c)
 *   cmp %rax, *(this+0x28)   (iter == validVerticesBegin?)            @0x2fec2
 *   je   .none
 *   rax = *(rax - 0x8)       (predecessor)                            @0x2fec8
 *   jmp .ret
 *   .none: xor %eax,%eax
 *   .ret: pop %rax / pop %rbx / pop %rbp / ret
 *
 * NOTE: the compare is against `*(this+0x28)` (validVerticesBegin), NOT `*(this+0x10)`
 * (allVerticesBegin). getVertexIter walks the ALL range but the "beginning-of-range" comparison
 * is against +0x28 — a subtle bug-or-feature of the vendor code that we mirror verbatim.
 */
export function OZSpline_getPreviousVertex(
  sp: OZSplineFieldsM2,
  cur: OZVertexHandleM2 | null,
): OZVertexHandleM2 | null {
  if (cur === null) {
    throw new Error(
      "OZSpline::getPreviousVertex @ProChannel 0x2feb4 — null cur; disasm at @0x2febd " +
        "unconditionally forwards cur to OZSpline::getVertexIter (which dereferences it)",
    );
  }
  const iterIdx = _OZSpline_getVertexIter(sp, cur);
  // The disasm compares against +0x28 = validVerticesBegin. In our index-based model that's
  // "iterIdx corresponds to the first valid entry", i.e. iterIdx === 0 for this shape.
  if (iterIdx === 0) return null;
  return sp.vertices[iterIdx - 1] ?? null;
}

/**
 * OZSpline::getNextVertex(void* cur) -> OZVertex*.  @ProChannel 0x2fed8
 *
 * Disasm (verbatim — 20 lines):
 *   push rbp / mov rsp,rbp / push rbx / push rax
 *   rbx = rdi (this)
 *   callq OZSpline::getVertexIter(void*)                              @0x2fee1
 *   rcx = *(this+0x30)                                                (end of validVertices)
 *   cmp %rax, %rcx / je .none                                          @0x2feed
 *   rax += 0x8    (advance by one OZVertex*)                           @0x2feef
 *   cmp %rax, %rcx / je .none                                          @0x2fef3
 *   rax = *rax    (successor OZVertex*)                                @0x2fef8
 *   jmp .ret
 *   .none: xor %eax,%eax
 *   .ret: epilogue
 *
 * Same +0x30 == validVerticesEnd asymmetry as getPreviousVertex: comparison is against
 * validVerticesEnd (+0x30), not allVerticesEnd (+0x18). Mirrored verbatim.
 */
export function OZSpline_getNextVertex_byHandle(
  sp: OZSplineFieldsM2,
  cur: OZVertexHandleM2 | null,
): OZVertexHandleM2 | null {
  if (cur === null) {
    throw new Error(
      "OZSpline::getNextVertex(void*) @ProChannel 0x2fed8 — null cur; disasm at @0x2fee1 " +
        "unconditionally forwards cur to OZSpline::getVertexIter",
    );
  }
  const iterIdx = _OZSpline_getVertexIter(sp, cur);
  const validEnd = sp.validVerticesBegin.length;
  if (iterIdx === validEnd) return null;
  if (iterIdx + 1 === validEnd) return null;
  return sp.vertices[iterIdx + 1] ?? null;
}

/**
 * OZSpline::getNextVertex(CMTime const& t) -> OZVertex*.  @ProChannel 0x2ff06
 *
 * Disasm (verbatim — 78 lines):
 *   rax = *(this+0x10)
 *   cmp rax, *(this+0x18) / je .empty                                 @0x2ff0a
 *   [frame prologue]
 *   %r15 = this
 *   %r12 = *(this+0x28)   (validVerticesBegin)                        @0x2ff28
 *   cmp %r12, *(this+0x30) / je .empty                                 @0x2ff2c
 *   %r14 = %rsi (t)
 *   %r13 = GOT[_kCMTimeNegativeInfinity]                              @0x2ff39 (0xca4b0)
 *   %rbx = 0    (a "found a match at previous-time" latch)
 *   .loop:
 *     rax = *(r12)                       (current OZVertex*)
 *     [copy t to stack args, copy *(rax)->valueU too]
 *     call CMTimeCompare(t, vertex->valueU)                            @0x2ff79
 *     if (eax > 0) goto .foundFwd                                     @0x2ff80  -> 0x2ffe4
 *     [copy negInf to stack args, copy *(rax)->valueU]
 *     call CMTimeCompare(_kCMTimeNegativeInfinity, vertex->valueU)     @0x2ffba
 *     cl = (eax == 0) ? 1 : 0     (sete)
 *     if (bl AND cl) goto .foundLatched                                @0x2ffc6 -> 0x2ffe4
 *     al = (eax == 0) ? 1 : 0
 *     bl |= al                    (latch: bl = 1 once we've seen negInf-equal)
 *     r12 += 8                    (advance)
 *     if (r12 != this->0x30) goto .loop                                 @0x2ffd7
 *   .end:
 *   xor eax, eax / jmp .ret
 *   .foundFwd/.foundLatched:
 *   rax = *(r12)
 *   .ret: pop / ret
 *
 * Behaviour has a subtle CMTimeCompare(t, valueU) > 0 branch combined with a "==negInf" latch
 * (%rbx = 1 once a vertex whose valueU equals kCMTimeNegativeInfinity is seen). Precise
 * semantics need an oracle harness to lock down; the port is loud-thrown to avoid a
 * plausible-but-wrong transcription (Rule 3). The disasm is faithfully documented above so
 * a future oracle-driven reconciliation can seal it.
 */
export function OZSpline_getNextVertex_atTime(
  _sp: OZSplineFieldsM2,
  _t: CMTime,
): OZVertexHandleM2 | null {
  void _sp; void _t;
  throw new Error(
    "OZSpline::getNextVertex(CMTime const&) @ProChannel 0x2ff06 not yet transcribed — the " +
      "semantics of the `jg` branch @0x2ff80 combined with the kCMTimeNegativeInfinity latch " +
      "@0x2ff39 need oracle-driven fuzzing; the disasm is fully documented in the doc-comment " +
      "so a follow-up chunk can seal it",
  );
}

/**
 * OZSpline::findVertex(long lo, long hi, void* target) -> bool.  @ProChannel 0x2fff8
 *
 * Disasm (verbatim — 172 lines): recursive binary-search-with-linear-fallback lookup for
 * `target` in the all-vertex vector, using CMTime-based ordering and time-equality fallback.
 * The core structure:
 *   1. if (target == 0) return 0.                                      @0x2fff8
 *   2. dx = hi - lo; rcx = allVertices.begin; %rsi = *(begin + lo*8)   (first candidate)
 *   3. if (dx <= 1) {                                                  @0x30025
 *        if (first == target) return 1;
 *        return begin[hi] == target;
 *      }
 *   4. Compute midpoint: mid = lo + (dx * 0.5)
 *      (via cvtsi2sd + cvttsd2si @0x30058..@0x3006e; constant 0.5 loaded from @const 0xb03c0
 *       u64 0x3FE0000000000000).
 *   5. if (allVertices[mid] == target) return 1
 *   6. Compare target.valueU vs allVertices[mid].valueU via CMTimeCompare @stub 0xaca80
 *   7. if (compare < 0) recurse findVertex(lo, mid, target).            @0x300ff
 *      else compare against allVertices[lo].valueU too, and if allVertices[mid].valueU >
 *        allVertices[lo].valueU, recurse findVertex(mid, hi, target).   @0x300f4
 *      else: fall through to a PCMath::equal-based scan of the middle
 *        section (allVertices[mid], [lo], [hi] each compared against target via
 *        PCMath::equal(a, b, kCMTimeZero)), followed by two linear walks outward from the
 *        "matched-index" (backward @0x301b2..@0x30201 and forward @0x30204..@0x30254) that
 *        return `true` iff any vertex in the equal-time cluster equals `target` by pointer.
 *
 * This is the exact recursive interval search FCP uses to look up a vertex by pointer when
 * multiple vertices share the same valueU — Rule 3 says to loud-throw undecoded branches
 * rather than guess them. The port is stubbed with a full disasm doc; the address
 * ledger will keep it "todo" until the recursion + linear-cluster-walk is transcribed under an
 * oracle harness.
 */
export function OZSpline_findVertex(
  _sp: OZSplineFieldsM2,
  _lo: number,
  _hi: number,
  _target: OZVertexHandleM2 | null,
): boolean {
  void _sp; void _lo; void _hi; void _target;
  throw new Error(
    "OZSpline::findVertex(long, long, void*) @ProChannel 0x2fff8 not yet transcribed — " +
      "recursive binary search with linear-cluster fallback; depends on PCMath::equal " +
      "@stub 0xacc6c (frontier)",
  );
}

/**
 * OZSpline::isValidHandle(void* handle) -> bool.  @ProChannel 0x3026c
 *
 * Disasm (verbatim — 41 lines):
 *   [prologue + save handle in r14, this in rbx]
 *   [acquire spinlock — standard sequence]
 *   rdx = *(this+0x18) - *(this+0x10)   (allVertices span in bytes)   @0x30297
 *   if (rdx == 0) { r14 = 0; goto .rel; }
 *   rdx >>= 3                            (span in elements)           @0x302a1
 *   rdx -= 1                             (hi = n-1)                   @0x302a5
 *   rdi = this, rsi = 0 (lo), rdx = n-1, rcx = handle
 *   call OZSpline::findVertex(lo, hi, handle)                          @0x302b0
 *   r14d = eax
 *   .rel: [release spinlock]
 *   eax = r14d
 *   epilogue
 *
 * i.e. a spinlock-guarded delegate to findVertex over the full allVertices range.
 */
export function OZSpline_isValidHandle(
  sp: OZSplineFieldsM2,
  handle: OZVertexHandleM2 | null,
): boolean {
  _acquireSpinLock(sp);
  let result = false;
  const n = sp.vertices.length;
  if (n !== 0) {
    // Delegate to findVertex — currently loud-thrown; the wrap here is faithful to the disasm.
    result = OZSpline_findVertex(sp, 0, n - 1, handle);
  }
  _releaseSpinLock(sp);
  return result;
}

/**
 * OZSpline::lockSpline(bool releaseInstead) -> void.  @ProChannel 0x302e6
 *
 * Disasm (verbatim — 28 lines):
 *   push rbp / mov rsp,rbp / push r15,r14,rbx,rax
 *   r14 = *(this+0x28)             (validVerticesBegin)                 @0x302f0
 *   cmp r14, *(this+0x30) / je .empty                                    @0x302f4
 *   %rbx = this
 *   sil ^= 1                        (invert bool: 0->1, 1->0)             @0x302fd
 *   eax = zext(sil)
 *   r15 = 0x98 + rax*8              (vtable-slot address selector)        @0x30305
 *                                    // when releaseInstead == 0 -> slot 0x98+8 = 0xA0
 *                                    // when releaseInstead == 1 -> slot 0x98+0 = 0x98
 *   .loop:                                                                @0x3030d
 *     rdi = *(r14)                   (current OZVertex*)
 *     rax = *rdi                     (vtable ptr)
 *     esi = 2                        (constant arg 2)
 *     callq *(rax + r15)             (virtual call at slot 0x98 or 0xA0 with arg=2)
 *     r14 += 8
 *     cmp r14, *(rbx+0x30) / jne .loop
 *   .empty: epilogue
 *
 * i.e. for each valid vertex in [+0x28, +0x30), invoke vtable[0x98] (when releaseInstead==1) or
 * vtable[0xA0] (when releaseInstead==0), passing arg=2. The two vtable slots are OZVertex
 * virtuals (opaque here — they're the "lock/unlock" side of the vertex). This is NOT a spinlock
 * on OZSpline itself; it's a broadcast to every valid vertex to enter/leave a locked mode.
 */
export function OZSpline_lockSpline(sp: OZSplineFieldsM2, releaseInstead: boolean): void {
  // sil ^= 1 means: releaseInstead==0 -> selects "engage-lock" (slot 0xA0);
  //                releaseInstead==1 -> "release" (slot 0x98).
  const invertedBit = releaseInstead ? 0 : 1;
  const slotOffset = 0x98 + invertedBit * 8; // 0x98 (release) or 0xA0 (engage)
  for (const v of sp.validVerticesBegin) {
    _OZVertex_lockSlot(v, slotOffset, 2);
  }
}

/** OZVertex vtable slots 0x98 / 0xA0 — virtual "engage-lock" / "release-lock" with u32 mode arg.
 *  Called by OZSpline::lockSpline @0x30318. The concrete slot targets are OZVertex-subclass
 *  specific and undecoded here. */
function _OZVertex_lockSlot(_v: OZVertexHandleM2, slotOffset: number, mode: number): void {
  void _v; void mode;
  throw new Error(
    `OZVertex vtable slot 0x${slotOffset.toString(16)} (virtual lock/release with u32 arg) not ` +
      "yet transcribed — called by OZSpline::lockSpline @0x30318",
  );
}

/** Marker so tsc-style dead-import checks confirm the chunk is wired. */
export const OZ_SPLINE_M2_LOADED = true;
