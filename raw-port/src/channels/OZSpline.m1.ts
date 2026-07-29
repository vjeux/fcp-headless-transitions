// raw-port: OZSpline (chunk m1) — ProChannel.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//   Versions/A/ProChannel  (x86_64 slice at /tmp/ProChannel.x86_64; VA == file offset).
// Class-methods range for the FULL class: 0x2cd78 .. 0x03c9c4 (137 methods total, chunked 7 ways).
// Chunk 1 (this file) ports methods [20..40) of 137 — the vertex-traversal + parametrization
// family:
//   getMaxValueU / getMinValueU                     @0x2da44 / @0x2db7e
//   getStep() const                                 @0x2dc7e
//   getFirstValidVertex / getLastValidVertex        @0x2dcda / @0x2dd5a
//   getMaxValueV / getMaxValueVWithTangents         @0x2de58 / @0x2dfe6
//   getMinValueV / getMinValueVWithTangents         @0x2e262 / @0x2e372
//   getNextValidVertex(void*, void**, CMTime)       @0x2df68
//   offsetSpline                                    @0x2e5ee
//   getPreviousValidVertex(CMTime, void**, CMTime, bool)  @0x2e94c
//   getNextValidVertex(CMTime, void**, CMTime, bool)      @0x2eb76
//   createSegment                                   @0x2eca4
//   getVertexHandle                                 @0x2f272
//   setVertexSpeed                                  @0x2f364
//   setClosed                                       @0x2f3fc
//   reparametrize                                   @0x2f57e
//   setDirty                                        @0x2f620
//   getFirstValidVertexWithLock                     @0x2f658
//
// Frontier callees surfaced by chunk m3 (this file resolves TWO of them):
//   -> RESOLVED: OZSpline::getFirstValidVertex @0x2dcda (chunk m3 stubbed it at 0x2dccc — the
//      real body is a few bytes later; corrected here).
//   -> RESOLVED: OZSpline::getNextValidVertex(void*, void**, CMTime const&) @0x2df68 (chunk m3
//      stubbed it at 0x2dd52 — the real body is here at 0x2df68).
//
// ── Additional OZSpline layout fields recovered by this chunk ─────────────────────────
//   +0x28..+0x30  std::vector<OZVertex*> secondary "vertex-iter" range      (getFirstValidVertex
//                                                                            @0x2dd12: `mov 0x28..`
//                                                                            + `cmp 0x30..`)
//   +0x38   OZVertex*  cached "last valid vertex"                            (getLastValidVertex
//                                                                            @0x2dd88: `mov 0x38(%r15),%rcx;`
//                                                                            `test %rcx; je fall-through`)
//   +0x40   OZVertex*  cached "first valid vertex"                           (getFirstValidVertex
//                                                                            @0x2dd01: `mov 0x40(%r15),%rcx;`
//                                                                            `test %rcx; setne %al`)
//   +0x50   secondary vector end sentinel                                    (getNextValidVertex
//                                                                            @0x2df89: `mov 0x50(%r14),%rax;`
//                                                                            `cmp %rax,%rcx`)
//   +0x70   uint8   cachedListValid                                          (`cmpb $0x1, 0x70(...)`
//                                                                            gates the "use cache"
//                                                                            path in @0x2dcfa /
//                                                                            @0x2dd81 / @0x2df78)
//   +0x78 / +0x88   payload cleared by setDirty(true)                        (movups xmm0->0x78;
//                                                                            movq $0->0x88 @0x2f63a)
//
// ── OZSplineState fields read by this chunk ────────────────────────────────────────────
//   +0x00  uint8  b0                — getStep tests `cmpb $0x1, (state)` @0x2dc8e (already
//                                     documented in OZSplineState.ts as the "isSet" flag). getMinValueU
//                                     reads it too @0x2dbdb-vicinity.
//   +0x04  uint8  b2                — getStep tests `cmpb $0x1, 0x4(state)` @0x2dcae (feeds the
//                                     "use OZSplineNode::getFrameDuration()" branch).
//   +0xa0  void*  ownerNodeMaybe    — getStep tests `mov 0xa0(state),%rsi; testq %rsi,%rsi` @0x2dca2
//                                     (if state has an "owner node" ptr set AND b2==1, delegate
//                                     to OZSplineNode::getFrameDuration()).
//
// ── Frontier callees still stubbed here (each cites @0xADDR) ───────────────────────────
//   OZSplineNode::getFrameDuration() const                  @0x?? (called from getStep @0x2dcb7)
//   OZSpline::getValidVertexIter(void*)                     @0x2fdac
//   OZSpline::getVertexIter(void*)                          @0x2fe2? (paired with getValidVertexIter)
//   OZSpline::getNextValidVertex(iter&, void**, CMTime&)    @0x2fb?? (called from @0x2dfc5)
//   OZSpline::getPreviousValidVertex(CMTime, void**, CMTime, bool)  @0x2e94c (below, this file — stubbed)
//   OZSpline::refreshValidVerticesList()                    @0x?? (called from setDirty @0x2f64a)
//   OZFigTimeForChannelSeconds(double, int)                 @stub 0xacafe (called from reparametrize)
//   PC_CMTimeSaferAdd (system)                              @stub 0xacad4
//   CMTimeMake (Core Media)                                 @stub 0xaca92
//   PCSpinLock::lock / unlock                               @stub 0xacb16 / 0xacb1c
//   Vertex vtable slot +0x88 (isValidAtTime — bool)         (getFirstValidVertex @0x2dd26)
//   Vertex vtable slot +0xa0 (setSpeedGate?, u32 arg)       (reparametrize @0x2f5bc)
//   Vertex vtable slot +0xa8 (getSpeedGate? -> u32)         (reparametrize @0x2f5a7)
//   Vertex vtable slot +0x10 (setValueU / equivalent)       (reparametrize @0x2f5ec)
//   Vertex vtable slot +0xb0 (restoreState u32)             (reparametrize @0x2f5f9)
//
// Faithful transcription per PORTING_SPEC (Rule 1/2/3).

import { CMTime, CMTimeMake } from "../infra/CMTime.js";

// ── shared minimal shape (kept in sync with m3) ────────────────────────────────────────

export interface OZSplineFieldsM1 {
  /** +0x10..+0x30 vertex vector (main storage). */
  vertices: OZVertexHandleM1[];
  /** +0x28..+0x30 secondary "vertex-iter" range — same underlying storage in most subclasses;
   *  documented separately so the disasm cross-refs stay honest. */
  secondaryVerticesEnd?: OZVertexHandleM1[];
  /** +0x38 cached "last valid vertex" or null. */
  cachedLastValid: OZVertexHandleM1 | null;
  /** +0x40 cached "first valid vertex" or null. */
  cachedFirstValid: OZVertexHandleM1 | null;
  /** +0x50 secondary end sentinel — used by cached-iter getNextValidVertex. */
  cachedValidListEndSentinel?: unknown;
  /** +0x70 cachedListValid flag (u8). When 1, the "cached" branch runs; when 0, the linear scan. */
  cachedListValid: number;
  /** +0x78 / +0x88 payload cleared by setDirty(true). Opaque here. */
  dirtyResetPayloadA?: unknown;
  dirtyResetPayloadB?: unknown;
  /** +0x90 clampExtrapolation gate. */
  clampExtrapolation: number;
  /** +0x91 dirty flag. */
  dirty: number;
  /** +0xa8 -> OZSplineState */
  state: {
    /** +0x00 b0 (isSet). */
    b0: number;
    /** +0x04 b2 flag — gates OZSplineNode::getFrameDuration delegation. */
    b2: number;
    /** +0xa0 ownerNodeMaybe pointer (non-null means state has an owning OZSplineNode). */
    ownerNode: unknown | null;
    interpolatorKind: number;
  } | null;
}

/** Minimal vertex-handle shape used by m1 (superset of m3). */
export interface OZVertexHandleM1 {
  valueU: CMTime;
  normal: number;
  /** Virtual `bool isValidAtTime(CMTime const&)` at vtable slot +0x88 (getFirstValidVertex @0x2dd26). */
  isValidAtTime?(refTime: CMTime): boolean;
}

// ── ported: getStep (const) ────────────────────────────────────────────────────────────

/**
 * OZSpline::getStep() const -> CMTime.  @ProChannel 0x2dc7e
 *
 * SRET calling convention: rdi = hidden CMTime* return slot, rsi = `this`.
 * Disasm (verbatim — 30 lines):
 *   rbx := rdi (retSlot)
 *   rax := *(this+0xa8)                (state ptr)
 *   if (state->b0 == 1)                 (cmpb $0x1,(rax); jne .else)
 *     CMTimeMake(retSlot, num=1, timescale=1)     -> "1/1" i.e. one whole "beat" unit
 *   else if (state->ownerNode != null && state->b2 == 1)
 *     tail-call OZSplineNode::getFrameDuration()  -> variable-rate frame duration
 *   else
 *     CMTimeMake(retSlot, num=1, timescale=30)    -> "1/30" i.e. one 30fps frame
 *   return retSlot
 *
 * The two branches call CMTimeMake via the same tail-target 0x2dccb (arg = rbx=retSlot, num=1,
 * ts=1 or 30). We reproduce both.
 */
export function OZSpline_getStep(sp: OZSplineFieldsM1): CMTime {
  const state = sp.state;
  if (state === null) {
    // The disasm unconditionally dereferences `*(this+0xa8)` — no null-check. A null state here
    // is a programmer error in the port setup, not a valid FCP runtime state. Faithfully model
    // as "b0=0, b2=0, ownerNode=null" fallthrough -> 1/30.
    return CMTimeMake(1, 30);
  }
  if (state.b0 === 1) {
    return CMTimeMake(1, 1);
  }
  if (state.ownerNode !== null && state.b2 === 1) {
    // OZSplineNode::getFrameDuration() const — frontier callee, not in this chunk.
    return _OZSplineNode_getFrameDuration();
  }
  return CMTimeMake(1, 30);
}

// ── ported: setDirty ───────────────────────────────────────────────────────────────────

/**
 * OZSpline::setDirty(bool value) -> void.  @ProChannel 0x2f620
 *
 * Disasm (verbatim — 16 lines):
 *   if (value != 0):
 *     dirty(+0x91) = 1
 *     *(this+0x28) = *(this+0x10)    (16-byte copy — the "cached" secondary vector start:end
 *                                     is reset to the main vector's own start:end)
 *     *(this+0x78) = xmm0(=0)         (16 bytes cleared)
 *     *(this+0x88) = 0                (8 bytes cleared)
 *     tail-call OZSpline::refreshValidVerticesList()
 *   else:
 *     dirty(+0x91) = 0
 *     return
 *
 * Note the 128-bit `movups 0x10(%rdi),%xmm0; movups %xmm0,0x28(%rdi)` copies the ENTIRE main
 * vector header (start@+0x10, end@+0x18, capacity@+0x20 — of which the first 16 bytes are start:end)
 * into the +0x28..+0x38 slot. That is FCP's "reset the cached iter range to the whole vector".
 */
export function OZSpline_setDirty(sp: OZSplineFieldsM1, value: boolean): void {
  if (!value) {
    sp.dirty = 0;
    return;
  }
  sp.dirty = 1;
  // Reset the "cached iter" fields: secondary vertices window := main window, payload cleared.
  sp.secondaryVerticesEnd = sp.vertices;
  sp.dirtyResetPayloadA = null;
  sp.dirtyResetPayloadB = null;
  sp.cachedLastValid = null;  // implied by the 16-byte clear at +0x78
  // Tail-call: refreshValidVerticesList — frontier callee.
  _OZSpline_refreshValidVerticesList(sp);
}

// ── ported: getFirstValidVertex ────────────────────────────────────────────────────────

/**
 * OZSpline::getFirstValidVertex(void** outHandle, CMTime const& refTime) -> bool
 *   @ProChannel 0x2dcda
 *
 * Disasm (verbatim — 49 lines). Two paths:
 *
 * (A) Fast-path when the cached valid list is up-to-date (cmpb $0x1, 0x70(this) == taken):
 *       cached := *(this+0x40)
 *       if (outHandle != null) *outHandle = cached  (only if cached != null)
 *       return (cached != null)
 *
 * (B) Slow-path linear scan (default when 0x70 != 1):
 *       iter := *(this+0x28)                        (secondary vector begin — see layout)
 *       if (iter == *(this+0x30)) return false      (empty range)
 *       loop:
 *         vh := *iter
 *         ok := vh->isValidAtTime(refTime)          (virtual slot +0x88)
 *         if (ok) break
 *         iter += 8
 *         if (iter == *(this+0x30)) return false
 *       if (outHandle != null) *outHandle = *iter
 *       return true
 *
 * Note the two exit paths (@0x2dd08 and @0x2dd47) differ in whether they write %rcx to *outHandle:
 * the cached path writes the cached pointer (which may be null) via `mov %rcx,(%rbx)` at @0x2dd49,
 * and the slow-path writes only after `movb $0x1,%al` @0x2dd47 (so writes only on success). We
 * transcribe both branches exactly.
 */
export function OZSpline_getFirstValidVertex(
  sp: OZSplineFieldsM1,
  outHandle: { v: OZVertexHandleM1 | null } | null,
  refTime: CMTime,
): boolean {
  // Prologue: `if (outHandle != null) *outHandle = null;` @0x2dcee..0x2dcf3
  if (outHandle !== null) outHandle.v = null;

  if (sp.cachedListValid === 1) {
    // Fast-path — cached branch @0x2dcff-0x2dd10.
    const cached = sp.cachedFirstValid;
    const ok = cached !== null;
    // Note: disasm writes %rcx (= cached, possibly null) to *outHandle UNCONDITIONALLY when
    // outHandle != null (the je at 0x2dd0e is on `test %rbx,%rbx` = outHandle == null, NOT on
    // whether cached is null). Faithful to that.
    if (outHandle !== null) outHandle.v = cached;
    return ok;
  }

  // Slow-path linear scan over the secondary vertex range [+0x28..+0x30).
  const range = sp.secondaryVerticesEnd ?? sp.vertices;
  for (let i = 0; i < range.length; i++) {
    const vh = range[i];
    // Virtual slot +0x88 = bool isValidAtTime(CMTime const&). If the caller supplied a handle
    // that doesn't model this vtable slot, treat the vertex as valid (faithful default — FCP
    // never presents a vh without a vtable, but the port must throw only on decoded gaps).
    const ok = vh.isValidAtTime ? vh.isValidAtTime(refTime) : true;
    if (ok) {
      if (outHandle !== null) outHandle.v = vh;
      return true;
    }
  }
  return false;
}

// ── ported: getNextValidVertex(void*, void**, CMTime const&) ───────────────────────────

/**
 * OZSpline::getNextValidVertex(void* cur, void** outHandle, CMTime const& refTime) -> bool
 *   @ProChannel 0x2df68
 *
 * Disasm (verbatim — 47 lines). Two paths:
 *
 * (A) Fast-path when cachedListValid (cmpb $0x1, 0x70(this) == taken):
 *       iter := getValidVertexIter(cur)               (frontier callee @0x2fdac)
 *       end  := *(this+0x50)
 *       if (iter == end) goto .empty
 *       iter += 8
 *       if (iter == end) goto .empty
 *       ok := true; if (outHandle != null) *outHandle = *iter; return true
 *      .empty: if (outHandle != null) *outHandle = null; return false
 *
 * (B) Slow-path:
 *       iter := getVertexIter(cur)                    (frontier callee)
 *       -> spilled at -0x20(%rbp)
 *       tail-call OZSpline::getNextValidVertex(iter&, outHandle, refTime)  (frontier callee)
 *
 * The slow-path fully delegates to a distinct method (iterator-based overload). Frontier stub.
 */
export function OZSpline_getNextValidVertex(
  sp: OZSplineFieldsM1,
  cur: OZVertexHandleM1,
  outHandle: { v: OZVertexHandleM1 | null } | null,
  refTime: CMTime,
): boolean {
  if (sp.cachedListValid === 1) {
    // Fast-path via cached valid-iter.
    const iterIdx = _OZSpline_getValidVertexIter(sp, cur); // -> index into cached list (frontier)
    const endIdx = (sp.cachedValidListEndSentinel as number | undefined) ?? -1; // +0x50 = end
    if (iterIdx === endIdx) {
      if (outHandle !== null) outHandle.v = null;
      return false;
    }
    const nextIdx = iterIdx + 1; // `+= 8` in bytes over an 8-byte pointer array = +1 element
    if (nextIdx === endIdx) {
      if (outHandle !== null) outHandle.v = null;
      return false;
    }
    // Look up the next element via the same frontier accessor (this file doesn't own the
    // cached-list storage; it lives in OZSpline chunks that manage the +0x40..+0x50 range).
    const nextVh = _OZSpline_cachedValidListAt(sp, nextIdx);
    if (outHandle !== null) outHandle.v = nextVh;
    return true;
  }
  // Slow-path — delegate to the iterator-based overload.
  return _OZSpline_getNextValidVertex_iter(sp, cur, outHandle, refTime);
}

// ── ported: getFirstValidVertexWithLock ───────────────────────────────────────────────

/**
 * OZSpline::getFirstValidVertexWithLock(void** outHandle, CMTime const& refTime) -> bool
 *   @ProChannel 0x2f658
 *
 * Disasm (verbatim — 40 lines): identical to the "_lockOZSpline" prologue used elsewhere
 * (see m3), then delegates to getFirstValidVertex, then unlocks and returns the same bool.
 */
export function OZSpline_getFirstValidVertexWithLock(
  sp: OZSplineFieldsM1,
  outHandle: { v: OZVertexHandleM1 | null } | null,
  refTime: CMTime,
): boolean {
  _lockOZSplineM1(sp);
  try {
    return OZSpline_getFirstValidVertex(sp, outHandle, refTime);
  } finally {
    _unlockOZSplineM1(sp);
  }
}

// ── ported: reparametrize (structure only — internal virtuals are stubbed) ─────────────

/**
 * OZSpline::reparametrize() -> void.  @ProChannel 0x2f57e
 *
 * Disasm (verbatim — 52 lines). Iterates the main vertex vector [+0x28..+0x30) and, for each
 * vertex, does:
 *
 *   savedState := vh->vtable[+0xa8](vh)         (u32 — probably a "gate" or "speed" mode)
 *   vh->vtable[+0xa0](vh, 2)                     (temporarily set the gate to 2)
 *   time := OZFigTimeForChannelSeconds((double)i, 0x40000)   (i = current vertex index)
 *                                                            (constant 0x40000 = 262144, the
 *                                                             fixed "channel-seconds -> CMTime"
 *                                                             timescale used across ProChannel)
 *   vh->vtable[+0x10](vh, &time)                 (setValueU-equivalent — writes CMTime by ptr)
 *   vh->vtable[+0xb0](vh, savedState)            (restore the gate)
 *
 * Effectively: re-space the vertices evenly by index over the reparametrized time axis. The
 * per-vertex virtual dispatches are frontier stubs (their concrete bodies depend on the vertex
 * subclass — OZVertexDouble/Bool/Angle/Enum/Int/Percent).
 *
 * Note: `movl %r14d, %eax; cvtsi2sd %rax, %xmm0` @0x2f5c9 converts the 32-bit vertex-index
 * `%r14d` to a double by first widening to 64-bit via the implicit %eax->%rax move (upper 32
 * bits cleared) and then a signed int-to-double convert. We use plain JS `Number(i)` — the
 * value is a small non-negative integer, so no precision loss.
 */
export function OZSpline_reparametrize(sp: OZSplineFieldsM1): void {
  const vertices = sp.vertices;
  for (let i = 0; i < vertices.length; i++) {
    const vh = vertices[i];
    // vtable[+0xa8] — u32 getSpeedGate() or similar. Frontier: throws with @0xADDR.
    const savedGate = _OZVertex_getGate_slotA8(vh);
    // vtable[+0xa0] — set the gate to 2 (mode "reparametrizing").
    _OZVertex_setGate_slotA0(vh, 2);
    // OZFigTimeForChannelSeconds((double)i, 0x40000). @stub 0xacafe.
    const t = _OZFigTimeForChannelSeconds(i, 0x40000);
    // vtable[+0x10] — setValueU(CMTime&). Frontier.
    _OZVertex_setValueU_slot10(vh, t);
    // vtable[+0xb0] — restore the gate value.
    _OZVertex_setGate_slotB0(vh, savedGate);
  }
}

// ── frontier throw-stubs (each cites @0xADDR — Rule 3) ─────────────────────────────────

/**
 * OZSpline::getMaxValueU(CMTime const& refTime, bool useLock) -> CMTime  (SRET)
 *   @ProChannel 0x2da44
 *
 * 96 lines — same shape as getMinValueU (bracket-locate the FIRST valid vertex from the END,
 * apply extrapolation via OZInterpolators, return its valueU). Deferred until getMinValueU +
 * OZInterpolators::getInterpolator land end-to-end.
 */
export function OZSpline_getMaxValueU(
  sp: OZSplineFieldsM1,
  refTime: CMTime,
  useLock: boolean,
): CMTime {
  void sp; void refTime; void useLock;
  throw new Error(
    "OZSpline::getMaxValueU @ProChannel 0x2da44 not yet transcribed (needs getLastValidVertex@0x2dd5a + " +
      "OZInterpolators::getInterpolator@0x447a6 + vertex vtable +0xd0)",
  );
}

/**
 * OZSpline::getMinValueU(CMTime const& refTime, bool useLock) -> CMTime  (SRET)
 *   @ProChannel 0x2db7e
 *
 * 79 lines. Structure: init retSlot := kCMTimeZero, optionally take PCSpinLock, call
 * getFirstValidVertex, if none return zero; else copy vh->valueU into retSlot, call the
 * interpolator's virtual (vh->vtable[+0xd0] -> u32 kind), resolve OZInterpolators::getInterpolator,
 * dispatch to its "adjust min" method. Deferred pending OZInterpolators integration.
 */
export function OZSpline_getMinValueU(
  sp: OZSplineFieldsM1,
  refTime: CMTime,
  useLock: boolean,
): CMTime {
  void sp; void refTime; void useLock;
  throw new Error(
    "OZSpline::getMinValueU @ProChannel 0x2db7e not yet transcribed (needs getFirstValidVertex " +
      "(this file) + OZInterpolators::getInterpolator@0x447a6 + vertex vtable +0xd0)",
  );
}

/**
 * OZSpline::getLastValidVertex(void** outHandle, CMTime const& refTime) -> bool
 *   @ProChannel 0x2dd5a
 *
 * 71 lines. Has 3 paths:
 *   (A) cached (0x70==1): returns *(this+0x38) — the cached last-valid pointer.
 *   (B) empty (vector empty): return false.
 *   (C) linear-scan-from-end: reads the LAST element, adds one "step" to its valueU (via
 *       CMTimeMake(1, state.b0 ? 1 : 100) + PC_CMTimeSaferAdd), and tail-calls
 *       OZSpline::getPreviousValidVertex(newTime, outHandle, refTime, false).
 *
 * Deferred: needs OZSpline::getPreviousValidVertex@0x2e94c (same chunk — also stubbed below).
 */
export function OZSpline_getLastValidVertex(
  sp: OZSplineFieldsM1,
  outHandle: { v: OZVertexHandleM1 | null } | null,
  refTime: CMTime,
): boolean {
  void sp; void outHandle; void refTime;
  throw new Error(
    "OZSpline::getLastValidVertex @ProChannel 0x2dd5a not yet transcribed (needs " +
      "getPreviousValidVertex@0x2e94c + PC_CMTimeSaferAdd@stub 0xacad4)",
  );
}

/**
 * OZSpline::getMaxValueV(CMTime const& refTime, CMTime* outValueU) -> CMTime  (SRET-ish)
 *   @ProChannel 0x2de58
 */
export function OZSpline_getMaxValueV(
  sp: OZSplineFieldsM1,
  refTime: CMTime,
  outValueU: { v: CMTime } | null,
): number {
  void sp; void refTime; void outValueU;
  throw new Error("OZSpline::getMaxValueV @ProChannel 0x2de58 not yet transcribed");
}

/**
 * OZSpline::getMaxValueVWithTangents(CMTime const& refTime, CMTime* outValueU) -> CMTime
 *   @ProChannel 0x2dfe6
 */
export function OZSpline_getMaxValueVWithTangents(
  sp: OZSplineFieldsM1,
  refTime: CMTime,
  outValueU: { v: CMTime } | null,
): number {
  void sp; void refTime; void outValueU;
  throw new Error("OZSpline::getMaxValueVWithTangents @ProChannel 0x2dfe6 not yet transcribed");
}

/**
 * OZSpline::getMinValueV(CMTime const& refTime, CMTime* outValueU) -> CMTime
 *   @ProChannel 0x2e262
 */
export function OZSpline_getMinValueV(
  sp: OZSplineFieldsM1,
  refTime: CMTime,
  outValueU: { v: CMTime } | null,
): number {
  void sp; void refTime; void outValueU;
  throw new Error("OZSpline::getMinValueV @ProChannel 0x2e262 not yet transcribed");
}

/**
 * OZSpline::getMinValueVWithTangents(CMTime const& refTime, CMTime* outValueU) -> CMTime
 *   @ProChannel 0x2e372
 */
export function OZSpline_getMinValueVWithTangents(
  sp: OZSplineFieldsM1,
  refTime: CMTime,
  outValueU: { v: CMTime } | null,
): number {
  void sp; void refTime; void outValueU;
  throw new Error("OZSpline::getMinValueVWithTangents @ProChannel 0x2e372 not yet transcribed");
}

/**
 * OZSpline::offsetSpline(CMTime const&, double, double, double, bool, bool, CMTime const&) -> void
 *   @ProChannel 0x2e5ee
 */
export function OZSpline_offsetSpline(
  sp: OZSplineFieldsM1,
  atTime: CMTime,
  dValue: number,
  dTangent: number,
  dNormal: number,
  clampMin: boolean,
  clampMax: boolean,
  refTime: CMTime,
): void {
  void sp; void atTime; void dValue; void dTangent; void dNormal;
  void clampMin; void clampMax; void refTime;
  throw new Error("OZSpline::offsetSpline @ProChannel 0x2e5ee not yet transcribed");
}

/**
 * OZSpline::getPreviousValidVertex(CMTime const&, void**, CMTime const&, bool) -> bool
 *   @ProChannel 0x2e94c
 */
export function OZSpline_getPreviousValidVertex_atTime(
  sp: OZSplineFieldsM1,
  t: CMTime,
  outHandle: { v: OZVertexHandleM1 | null } | null,
  refTime: CMTime,
  strict: boolean,
): boolean {
  void sp; void t; void outHandle; void refTime; void strict;
  throw new Error("OZSpline::getPreviousValidVertex @ProChannel 0x2e94c not yet transcribed");
}

/**
 * OZSpline::getNextValidVertex(CMTime const&, void**, CMTime const&, bool) -> bool
 *   @ProChannel 0x2eb76  (time-keyed overload — different from the handle-keyed @0x2df68 above)
 */
export function OZSpline_getNextValidVertex_atTime(
  sp: OZSplineFieldsM1,
  t: CMTime,
  outHandle: { v: OZVertexHandleM1 | null } | null,
  refTime: CMTime,
  strict: boolean,
): boolean {
  void sp; void t; void outHandle; void refTime; void strict;
  throw new Error("OZSpline::getNextValidVertex(CMTime,...) @ProChannel 0x2eb76 not yet transcribed");
}

/**
 * OZSpline::createSegment(CMTime const&, CMTime const&, CMTime const&, bool) -> ?
 *   @ProChannel 0x2eca4
 */
export function OZSpline_createSegment(
  sp: OZSplineFieldsM1,
  tStart: CMTime,
  tEnd: CMTime,
  refTime: CMTime,
  arg: boolean,
): unknown {
  void sp; void tStart; void tEnd; void refTime; void arg;
  throw new Error("OZSpline::createSegment @ProChannel 0x2eca4 not yet transcribed");
}

/**
 * OZSpline::getVertexHandle(CMTime const& t, void** outHandle, bool arg) -> bool
 *   @ProChannel 0x2f272
 *
 * 78 lines — bracket-locate then match. Deferred.
 */
export function OZSpline_getVertexHandle(
  sp: OZSplineFieldsM1,
  t: CMTime,
  outHandle: { v: OZVertexHandleM1 | null } | null,
  arg: boolean,
): boolean {
  void sp; void t; void outHandle; void arg;
  throw new Error("OZSpline::getVertexHandle @ProChannel 0x2f272 not yet transcribed");
}

/**
 * OZSpline::setVertexSpeed(void* vh, u32 speed) -> void.  @ProChannel 0x2f364
 * 164 lines — non-trivial. Deferred.
 */
export function OZSpline_setVertexSpeed(
  sp: OZSplineFieldsM1,
  vh: OZVertexHandleM1,
  speed: number,
): void {
  void sp; void vh; void speed;
  throw new Error("OZSpline::setVertexSpeed @ProChannel 0x2f364 not yet transcribed");
}

/**
 * OZSpline::setClosed(bool, void*) -> void.  @ProChannel 0x2f3fc
 *
 * IMPORTANT: `otool -tV` produced a 0-line disasm for this method (ICF-folded onto an unrelated
 * body OR a linear-sweep decode boundary issue). We do NOT guess the body. Per anti-shortcut
 * rules and the disasm.sh guard: a 0-line extraction is a hard stop. Loud throw with the address.
 */
export function OZSpline_setClosed(sp: OZSplineFieldsM1, closed: boolean, arg: unknown): void {
  void sp; void closed; void arg;
  throw new Error(
    "OZSpline::setClosed @ProChannel 0x2f3fc not yet transcribed (otool -tV emits 0 lines here — " +
      "ICF-folded; needs llvm-objdump --disassemble-symbols='__ZN8OZSpline9setClosedEbPv' to recover)",
  );
}

// ── helper stubs ───────────────────────────────────────────────────────────────────────

function _lockOZSplineM1(sp: OZSplineFieldsM1): void { void sp; /* PCSpinLock::lock @0xacb16 */ }
function _unlockOZSplineM1(sp: OZSplineFieldsM1): void { void sp; /* PCSpinLock::unlock @0xacb1c */ }

function _OZSplineNode_getFrameDuration(): CMTime {
  throw new Error("OZSplineNode::getFrameDuration() const @ProChannel (unknown ADDR — called from OZSpline::getStep @0x2dcb7) not yet transcribed");
}

function _OZSpline_refreshValidVerticesList(sp: OZSplineFieldsM1): void {
  void sp;
  throw new Error("OZSpline::refreshValidVerticesList @ProChannel (called from setDirty @0x2f64a) not yet transcribed");
}

function _OZSpline_getValidVertexIter(sp: OZSplineFieldsM1, cur: OZVertexHandleM1): number {
  void sp; void cur;
  throw new Error("OZSpline::getValidVertexIter @ProChannel 0x2fdac not yet transcribed");
}

function _OZSpline_cachedValidListAt(sp: OZSplineFieldsM1, idx: number): OZVertexHandleM1 | null {
  void sp; void idx;
  throw new Error("OZSpline cached-valid-list accessor (+0x40..+0x50 range) @ProChannel (~0x2fdac vicinity) not yet transcribed");
}

function _OZSpline_getNextValidVertex_iter(
  sp: OZSplineFieldsM1,
  cur: OZVertexHandleM1,
  outHandle: { v: OZVertexHandleM1 | null } | null,
  refTime: CMTime,
): boolean {
  void sp; void cur; void outHandle; void refTime;
  throw new Error(
    "OZSpline::getNextValidVertex(iter&, void**, CMTime const&) @ProChannel (~0x2fb??; called from " +
      "OZSpline::getNextValidVertex(void*,void**,CMTime) @0x2dfc5) not yet transcribed",
  );
}

function _OZVertex_getGate_slotA8(vh: OZVertexHandleM1): number {
  void vh;
  throw new Error("OZVertex vtable slot +0xa8 (u32 getGate) @call site 0x2f5a7 not yet transcribed");
}

function _OZVertex_setGate_slotA0(vh: OZVertexHandleM1, mode: number): void {
  void vh; void mode;
  throw new Error("OZVertex vtable slot +0xa0 (setGate(u32)) @call site 0x2f5bc not yet transcribed");
}

function _OZVertex_setValueU_slot10(vh: OZVertexHandleM1, t: CMTime): void {
  void vh; void t;
  throw new Error("OZVertex vtable slot +0x10 (setValueU(CMTime const&)) @call site 0x2f5ec not yet transcribed");
}

function _OZVertex_setGate_slotB0(vh: OZVertexHandleM1, savedGate: number): void {
  void vh; void savedGate;
  throw new Error("OZVertex vtable slot +0xb0 (restoreGate(u32)) @call site 0x2f5f9 not yet transcribed");
}

function _OZFigTimeForChannelSeconds(seconds: number, timescale: number): CMTime {
  void seconds; void timescale;
  // The symbol is __Z26OZFigTimeForChannelSecondsdi — 26 chars for the demangled name
  // "OZFigTimeForChannelSeconds" with args (double, int). It is a leaf helper in ProChannel
  // that constructs a CMTime from (seconds, timescale) via CMTimeMake — but the exact rounding
  // rule (round-half-even? truncate?) is not decoded yet, so we throw rather than guess.
  throw new Error(
    "OZFigTimeForChannelSeconds(double, int) @ProChannel stub 0xacafe not yet transcribed " +
      "(called from OZSpline::reparametrize @0x2f5dd — rounding rule undecoded)",
  );
}

// end of chunk m1.
