// raw-port: OZSpline (chunk m3) — ProChannel.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//   Versions/A/ProChannel  (x86_64 slice at /tmp/ProChannel.x86_64; VA == file offset).
// Class-methods range for the FULL class: 0x2cd78 .. 0x03c9c4 (137 methods total, chunked 7 ways).
// Chunk 3 (this file) ports methods [60..80) of 137 — the CORE vertex-math family:
//   getNumberOfValidVertices / *WithMultiplicity                @0x30332 / @0x3039c
//   getVertexValue(CMTime, CMTime, bool)                        @0x303a6
//   extrapolate / interpolate                                   @0x30a2c / @0x31ec8
//   getDerivativeValue                                          @0x31f9a
//   isDirty / reserveMemoryForKeypoints                         @0x3227c / @0x32288
//   sampleSpline family (4 overloads) + sampleSplineDerivatives (2)
//                                                               @0x322a0 / @0x32e72 / @0x33010
//                                                               @0x33198 / @0x33b5a
//   sampleSplineSegment                                         @0x345b6
//   getVertex (by time)                                         @0x348fc
//   getAllVerticesHandles / getAllValidVerticesHandles          @0x3499a / @0x34a92
//   getVerticesTimeAndValue                                     @0x34bb2
//   getVertex (by handle)                                       @0x34f82
//   setVertexValue                                              @0x34fca
//
// ── OZSpline object layout (partial, recovered from method offsets used in this chunk) ──
//   +0x00  vptr
//   +0x08  PCSpinLock                   — inline lock (lockable at +0x8 when 0xa0/+0x30 owner is null)
//   +0x10  std::vector<OZVertex*>       — start ptr (element size 8 = void* handle)
//   +0x18  std::vector<OZVertex*>       — end ptr (@0x30349? actually end at +0x30 — see below)
//   +0x30  std::vector<OZVertex*>       — end (the "one-past-last" ptr — getAllVerticesHandles
//                                         iterates from *+0x10 to *+0x30). NOTE: earlier work in
//                                         OZDynamicCurve.m0.ts placed the OZSpline base at +0x08
//                                         of OZDynamicCurve, seeing "vector header at +0x18..+0x30".
//                                         Within OZSpline itself (this file's `this`), start is at
//                                         +0x10 (getAllVerticesHandles @0x349cf: `mov 0x10(%rbx),%r12`)
//                                         and end at +0x30 (cmp 0x30(%rbx) @0x349e9).
//   +0x90  uint8  clampExtrapolation    — cmp $0, 0x90(%rbx) at getVertexValue @0x30498 / @0x304ff;
//                                         gate for the "return first/last" clamp path.
//   +0x91  uint8  dirty                 — isDirty returns 0x91(%rdi)  @0x32280.
//   +0x98  void*  interpolatorTable?    — read at getVertexValue @0x30413 (`mov 0x98(%rbx),%rdi`);
//                                         passed to OZInterpolators::getInterpolator with a u32 key
//                                         from 0xa8-offset field. Also the isClosed flag in the
//                                         OZDynamicCurve subclass — DIFFERENT USE at the same
//                                         offset because that path only reads it as a bool.
//   +0xa0  PCSpinLock*  ownedLock?      — indirect lock pointer (checked before falling back to
//                                         inline +0x8 lock). Read pattern: `mov 0xa0(%rdi),%rax;
//                                         test %rax,%rax; je fallback; mov 0x30(%rax),%rdi;
//                                         test %rdi,%rdi; jne callLock; fallback: lea 0x8(%rdi),%rdi`
//                                         appears at 0x303d4, 0x349b1, 0x34fe7, 0x35016 — an
//                                         identical prologue we call `_lockOZSpline(sp)`.
//   +0xa8  OZSplineState*                — pointer to state; getVertexValue @0x3041a reads
//                                         `mov 0xa8(%rbx),%rax; mov 0x20(%rax),%esi` — the u32 at
//                                         OZSplineState+0x20 is the interpolator id.
//
// ── Frontier callees (throw-stubs cite @0xADDR — Rule 3: loud gap) ─────────────────────
//   OZSpline::getFirstValidVertex(void**, CMTime const&)   @0x2dccc (used by @0x30355)
//   OZSpline::getNextValidVertex(void*, void**, CMTime&)   @0x2dd52 (used by @0x3037b)
//   OZSpline::getLastValidVertex(void**, CMTime const&)    @0x2dd5a (used by @0x3051a)
//   OZSpline::getMinValueU(CMTime, bool)                   @0x2db7e (used by @0x30454)
//   OZSpline::getMaxValueU(CMTime, bool)                   @0x2da44 (used by @0x304b4)
//   OZInterpolators::getInterpolator(u32)                  @0x447a6 (used by @0x30424)
//   PCSpinLock::lock / unlock                              @0xacb16 / @0xacb1c (via stubs)
//   CMTimeCompare (Core Media)                             @0xaca80 (via stub)
//   std::vector<...>::push_back / reserve                  (STL — thrown, not ported)
//
// Faithful transcription per PORTING_SPEC:
//   Rule 1: each function mirrors the disasm control flow.
//   Rule 2: every function has @0xADDR provenance.
//   Rule 3: any undecoded branch / callee is a `throw` citing its @0xADDR.
//   Rule 4: single-precision ops wrapped in Math.fround (n/a here — this chunk is CMTime + doubles).
//   Rule 6: one class per file — this is a chunk file that ONLY adds methods to OZSpline.
//   Rule 8: the vertex-math is oracle-linkable via dlsym once the base handles/state layout is
//           fully modelled; that harness is out of scope for this chunk.

import { CMTime, kCMTimeZero } from "../infra/CMTime.js";

// ── Types ──────────────────────────────────────────────────────────────────────────────

/**
 * Opaque vertex handle. In the binary this is a `void*` that points to an OZVertex (48 B).
 * The vertex-math methods in this chunk manipulate the handles via inline offsets:
 *   +0x00  vptr             (v-table; the interpolator id at vtable slot 0x40 is a `bool valid()`
 *                            check called via `(*(*vh))(0x40)`, e.g. getVertexValue @0x3042f.)
 *   +0x10  CMTime valueU    (24 B — copied as a 128-bit movups + trailing 64-bit movq)
 *   +0x20  double  normal   (per-vertex tangent slope)
 * This matches OZVertex.ts (which puts flags:0x08, interp:0x0c, valueU:0x10, normal:0x28 within
 * the FULL 48-byte object). The +0x20-vs-+0x28 shift is because this chunk's `getVertex` reads a
 * `movq 0x20(%rbx),%rax` INTO the caller's CMTime.epoch slot (offset 0x28 = epoch high half),
 * i.e. the SAME OZVertex fields — see disasm @0x34f99..@0x34fa5 (three writes: 16 B `movups`
 * of `+0x10(vh)` -> `(dst)`; then `movq +0x20(vh)` -> `+0x10(dst)`; then `(*(vh))(+0x18)` ->
 * `*normalOut`). "20" is the epoch-hi half of valueU, not a separate field.
 */
export type OZVertexHandle = {
  valueU: CMTime;
  normal: number;
  // The vertex vtable slot at +0x18 is a virtual `getNormal(CMTime const&) -> double`. In JS we
  // represent it directly as the `normal` field; the CMTime argument is ignored by
  // OZVertex::getNormal @ProChannel 0x40402. Callers of the throwing methods below don't rely on
  // this being anything other than a plain object with these two fields.
  // The vtable slot at +0x40 is a virtual `bool valid()`; represented as `valid?: boolean`.
  valid?: boolean;
  // The virtual `u32 getInterpolation()` @0x40 or wherever — we don't use it in this chunk.
};

/**
 * OZSpline shape referenced by this chunk. The full class is defined across OZSpline.ts +
 * OZSpline.m0..m6.ts. Only the fields this chunk reads/writes are captured here (as documented
 * offsets — see the layout block at the top of this file).
 */
export interface OZSplineFields {
  /** +0x10..+0x30 std::vector<OZVertexHandle> (start..end). We use a JS array. */
  vertices: OZVertexHandle[];
  /** +0x90 clamp-extrapolation gate (0 = allow extrapolate; !=0 = clamp to first/last). */
  clampExtrapolation: number;
  /** +0x91 dirty flag. isDirty() @0x3227c returns this byte. */
  dirty: number;
  /** +0xa8 -> OZSplineState pointer. Only field read in this chunk is `state.u32AtOffset20` (the
   *  interpolator-kind id used by getVertexValue @0x30421). */
  state: { interpolatorKind: number } | null;
}

// ── ported methods ─────────────────────────────────────────────────────────────────────

/**
 * OZSpline::isDirty() -> bool.  @ProChannel 0x3227c
 *
 * Disasm (verbatim — 6 lines):
 *   pushq %rbp / movq %rsp,%rbp / movb 0x91(%rdi),%al / popq %rbp / retq
 * Returns the byte at OZSpline+0x91 zero-extended into a bool. In C++ the return is `bool`; the
 * disassembly reads a single byte and returns it via %al (the low byte of %rax), so a non-zero
 * value maps to `true`.
 */
export function OZSpline_isDirty(sp: OZSplineFields): boolean {
  return sp.dirty !== 0;
}

/**
 * OZSpline::reserveMemoryForKeypoints(int n).  @ProChannel 0x32288
 *
 * Disasm (verbatim — 12 lines):
 *   pushq %rbp / movq %rsp,%rbp
 *   testl %esi,%esi
 *   je .ret                               (n == 0 -> return)
 *   addq $0x10,%rdi                        (advance to vector<OZVertex*> header at +0x10)
 *   movslq %esi,%rsi                       (sign-extend int -> long)
 *   popq %rbp
 *   jmp std::vector<OZVertex*>::reserve    (tail-call)
 *  .ret: popq %rbp / retq
 * TS: reserve is a no-op on JS arrays (they auto-grow); we match the guard on n==0 (early
 * return) so the FCP-observable side effects agree (no exception on zero).
 */
export function OZSpline_reserveMemoryForKeypoints(sp: OZSplineFields, n: number): void {
  if (n === 0) return;
  // std::vector<OZVertex*>::reserve(n) — pre-allocates capacity for at least n handles.
  // A JS array has no equivalent (capacity is opaque); the call is observationally a no-op
  // (allocation is not user-visible), so we transcribe it as such. If a future oracle harness
  // needs to detect that reserve was called, this is where the hook goes.
  void n;
  void sp;
}

/**
 * OZSpline::getNumberOfValidVertices(CMTime const& t) -> u32.  @ProChannel 0x30332
 *
 * Disasm control flow (verbatim — 37 lines):
 *   scratch := nullptr  (movq $0,-0x28(%rbp))
 *   getFirstValidVertex(&scratch, t)                          @0x30355
 *   if (scratch == nullptr) return 0                          @0x3035a..0x30389
 *   count := 0
 *   loop:
 *     ok := getNextValidVertex(scratch, &scratch, kCMTimeZero) @0x3037b (rcx=kCMTimeZero @0x30363)
 *     ++count                                                   @0x30380
 *     if (ok != 0) goto loop                                    @0x30383 (testb %al; jne .loop)
 *   return count
 *
 * NOTE: rcx=kCMTimeZero is loaded ONCE outside the loop via a RIP-relative literal-pool ref
 * (`movq 0x9a156(%rip),%r15` @0x30363 -> _kCMTimeZero). The `t` argument (rdx) is ONLY consumed
 * by getFirstValidVertex; the loop passes kCMTimeZero (not `t`) as the reference-time.
 * That is the exact FCP behaviour and must not be "cleaned up".
 *
 * Callees stubbed via loud throws (each cites its @0xADDR at its declaration below):
 *   getFirstValidVertex @ProChannel 0x2dccc  (see OZSpline.m0/m2 range)
 *   getNextValidVertex  @ProChannel 0x2dd52
 */
export function OZSpline_getNumberOfValidVertices(sp: OZSplineFields, t: CMTime): number {
  // Faithful transcription of the disasm. We call through frontier stubs so the "gap" is loud.
  const firstBox: { v: OZVertexHandle | null } = { v: null };
  OZSpline_getFirstValidVertex(sp, firstBox, t);
  if (firstBox.v === null) return 0;
  let count = 0;
  // rcx=kCMTimeZero constant, hoisted out of the loop — @0x30363.
  const zero: CMTime = kCMTimeZero;
  let cur = firstBox.v;
  const nextBox: { v: OZVertexHandle | null } = { v: null };
  // do-while: the disasm increments count BEFORE the branch (`incl %r14d` @0x30380 then
  // `testb %al; jne .loop` @0x30383) — so a successful call increments and re-enters; the
  // final failing call still increments once. Match that exactly.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ok = OZSpline_getNextValidVertex(sp, cur, nextBox, zero);
    count++;
    if (!ok) break;
    // The next iteration reads scratch (=&scratch) again — nextBox.v was written by the stub.
    if (nextBox.v === null) break;
    cur = nextBox.v;
  }
  return count >>> 0;
}

/**
 * OZSpline::getNumberOfValidVerticesWithMultiplicity(CMTime const&) -> u32.  @ProChannel 0x3039c
 *
 * Disasm (verbatim — 5 lines):
 *   pushq %rbp / movq %rsp,%rbp / popq %rbp
 *   jmp OZSpline::getNumberOfValidVertices     (tail-call)
 * Straight tail-call to the sibling above. Same semantics.
 */
export function OZSpline_getNumberOfValidVerticesWithMultiplicity(sp: OZSplineFields, t: CMTime): number {
  return OZSpline_getNumberOfValidVertices(sp, t);
}

/**
 * OZSpline::getVertex(void* vh, CMTime* outTime, double* outNormal, CMTime const& refTime) -> bool
 *   @ProChannel 0x34f82
 *
 * Disasm (verbatim — 29 lines) — reads two fields off the vertex and (if outNormal != null) calls
 * the vertex's virtual getNormal(refTime) via vtable +0x18. Returns (vh != nullptr).
 *
 *   mov  %rsi,%rbx                          (%rbx = vh)
 *   test %rsi,%rsi; je .end                  (vh == null -> skip everything, return 0)
 *   mov  %rcx,%r14                          (%r14 = outNormal — 4th arg)
 *   test %rdx,%rdx; je .skipTime            (outTime == null -> skip time write)
 *     movups 0x10(%rbx),%xmm0               (16 B from vh+0x10 -> xmm0)
 *     movq   0x20(%rbx),%rax                (8 B  from vh+0x20 -> rax)
 *     movq   %rax,0x10(%rdx)                (write 8 B  to outTime+0x10)
 *     movups %xmm0,(%rdx)                    (write 16 B to outTime+0x00)
 *   .skipTime:
 *   test %r14,%r14; je .end
 *     mov  (%rbx),%rax                       (rax = *vh   — vtable ptr)
 *     mov  %rbx,%rdi
 *     mov  %r8,%rsi                          (%rsi = refTime — 5th arg)
 *     callq *0x18(%rax)                       (virtual getNormal(refTime) -> xmm0 (double))
 *     movsd %xmm0,(%r14)                      (*outNormal = returned double)
 *   .end:
 *   test %rbx,%rbx; setne %al                 (return vh != null)
 *
 * The 24-byte time payload is a plain CMTime copy (value @ +0x10, timescale/flags @ +0x18,
 * epoch @ +0x20 within OZVertex → written to the same slots of outTime). This matches
 * OZVertex.ts's stated layout for its 24-B valueU at OZVertex+0x10.
 */
export function OZSpline_getVertex_byTime(
  vh: OZVertexHandle | null,
  outTime: { v: CMTime } | null,
  outNormal: { v: number } | null,
  refTime: CMTime,
): boolean {
  if (vh === null) return false;
  if (outTime !== null) {
    // Copy the 24-byte CMTime (valueU) from vh into outTime.
    outTime.v = { ...vh.valueU };
  }
  if (outNormal !== null) {
    // Virtual dispatch via vh->vtable[+0x18] = OZVertex::getNormal(CMTime const&) @0x40402.
    // That method ignores its CMTime arg and returns the vertex's `normal` field directly.
    // We reproduce that behaviour rather than pretend to call a stub — this IS the decoded body.
    void refTime;
    outNormal.v = vh.normal;
  }
  return true;
}

/**
 * OZSpline::setVertexValue(void* vh, double value, CMTime const& refTime) -> bool
 *   @ProChannel 0x34fca
 *
 * Disasm (verbatim — 43 lines):
 *   %rbx := vh; if (vh == null) goto .end
 *   %r15 := refTime; %r14 := this
 *   spill value (xmm0) to -0x20(%rbp)
 *   _lockOZSpline(this)                        (identical prologue — see layout notes @0xa0)
 *   %rax := *vh                                 (vtable)
 *   %rdi := vh; xmm0 := spilled value; %rsi := refTime
 *   callq *0x20(%rax)                            (virtual setValue(value, refTime) - slot +0x20)
 *   _unlockOZSpline(this)
 *  .end:
 *   test %rbx,%rbx; setne %al                    (return vh != null)
 *
 * The virtual is OZVertex::setValue-like — its exact address depends on the concrete vertex
 * subclass (OZVertexDouble, OZVertexBool, ...); we call through a virtual-dispatch stub that
 * throws citing the vtable slot so the frontier surfaces.
 */
export function OZSpline_setVertexValue(
  sp: OZSplineFields,
  vh: OZVertexHandle | null,
  value: number,
  refTime: CMTime,
): boolean {
  if (vh === null) return false;
  _lockOZSpline(sp);
  try {
    // Virtual slot +0x20 on the vertex vtable.
    _OZVertex_setValue_virtualSlot20(vh, value, refTime);
  } finally {
    _unlockOZSpline(sp);
  }
  return true;
}

/**
 * OZSpline::getAllVerticesHandles(std::vector<void*>& out) -> bool.  @ProChannel 0x3499a
 *
 * Disasm (verbatim — 75 lines) — iterates the internal vector `[+0x10..+0x30)` (8-byte OZVertex*
 * entries) under the OZSpline lock. For each entry it does a CMTimeCompare of the entry's
 * `valueU` (at OZVertex+0x10..+0x20) against a "last-time" tracker seeded from `kCMTimeZero`.
 * If (i == 0) OR (CMTimeCompare(entry.valueU, lastTime) != 0), it appends the OZVertex* to `out`
 * and rolls `lastTime := entry.valueU`. Always returns true.
 *
 * Effectively: emit each vertex once, dropping duplicates that share the same valueU as the
 * previous emitted vertex (a de-dup pass by monotonic time). The first entry is unconditionally
 * emitted (`test %r13,%r13; je .emit` at index 0). Returns `true` (`movb $0x1,%al` @0x34a81).
 */
export function OZSpline_getAllVerticesHandles(sp: OZSplineFields, out: OZVertexHandle[]): boolean {
  _lockOZSpline(sp);
  try {
    let lastTime: CMTime = kCMTimeZero;
    for (let i = 0; i < sp.vertices.length; i++) {
      const v = sp.vertices[i];
      // First entry: always emit. Subsequent: emit only if CMTimeCompare(v.valueU, lastTime) != 0.
      if (i === 0 || _CMTimeCompare(v.valueU, lastTime) !== 0) {
        out.push(v);
        lastTime = { ...v.valueU };
      }
    }
  } finally {
    _unlockOZSpline(sp);
  }
  return true;
}

// ── frontier throw-stubs (Rule 3: LOUD gap, never approximate) ─────────────────────────

/**
 * OZSpline::getVertexValue(CMTime const& t, CMTime const& refTime, bool retimed) -> double
 *   @ProChannel 0x303a6  (115 lines of disasm — the full curve-evaluation core)
 *
 * Deferred: the function requires the following decoded callees, all listed at @ProChannel 0x303a6
 * as loud-throw dependencies. The user-facing hand-curated `sampleCurveValue` in OZSpline.ts
 * implements a SEPARATE (simpler) API surface; this method here is the true FCP entrypoint that
 * the ledger enumerates.
 *
 * Callees:
 *   OZSpline::getMinValueU                      @ProChannel 0x2db7e
 *   OZSpline::getMaxValueU                      @ProChannel 0x2da44
 *   OZSpline::getLastValidVertex                @ProChannel 0x2dd5a
 *   OZSpline::getFirstValidVertex               @ProChannel 0x2dccc
 *   OZSpline::extrapolate                       @ProChannel 0x30a2c  (this chunk — stubbed below)
 *   OZSpline::interpolate                       @ProChannel 0x31ec8  (this chunk — stubbed below)
 *   OZInterpolators::getInterpolator(u32)       @ProChannel 0x447a6
 *   Vertex vtable slot +0x40 (bool valid())
 *   Vertex vtable slot +0x48 (called after (*+0x40)==true — an "isSet"-style predicate)
 *   CMTimeCompare (system)                      @0xaca80 stub
 */
export function OZSpline_getVertexValue(
  sp: OZSplineFields,
  t: CMTime,
  refTime: CMTime,
  retimed: boolean,
): number {
  void sp; void t; void refTime; void retimed;
  throw new Error(
    "OZSpline::getVertexValue @ProChannel 0x303a6 not yet transcribed (needs " +
      "getMinValueU@0x2db7e + getMaxValueU@0x2da44 + getLastValidVertex@0x2dd5a + " +
      "OZSpline::extrapolate@0x30a2c + OZSpline::interpolate@0x31ec8 + " +
      "OZInterpolators::getInterpolator@0x447a6 + vertex vtable slots +0x40/+0x48)",
  );
}

/**
 * OZSpline::extrapolate(void* vh, CMTime const& t, CMTime const& refTime, double* out, u32 dir)
 *   @ProChannel 0x30a2c
 *
 * The extrapolation branch out of getVertexValue when `t` falls outside [firstEnabled.U,
 * lastEnabled.U]. Uses the vertex's `getInterpolation()` type and the spline's
 * clampExtrapolation gate (+0x90) to decide between hold-endpoint and linear-extend.
 */
export function OZSpline_extrapolate(
  sp: OZSplineFields,
  vh: OZVertexHandle,
  t: CMTime,
  refTime: CMTime,
  out: { v: number },
  dir: number,
): void {
  void sp; void vh; void t; void refTime; void out; void dir;
  throw new Error("OZSpline::extrapolate @ProChannel 0x30a2c not yet transcribed");
}

/**
 * OZSpline::interpolate(CMTime const& t, void* vhLeft, void* vhRight, CMTime const& refTime,
 *   double* out, bool retimed).  @ProChannel 0x31ec8
 *
 * The inner interpolation call inside getVertexValue's bracket path. Resolves the interpolator
 * for the LEFT vertex (via OZInterpolators::getInterpolator(u32)) and calls its virtual
 * `interpolate` slot. This is the natural pair of the wrapper `sampleCurveValue` in OZSpline.ts,
 * but the raw entrypoint is stubbed until each concrete OZInterpolator subclass is decoded
 * end-to-end.
 */
export function OZSpline_interpolate(
  sp: OZSplineFields,
  t: CMTime,
  vhLeft: OZVertexHandle,
  vhRight: OZVertexHandle,
  refTime: CMTime,
  out: { v: number },
  retimed: boolean,
): void {
  void sp; void t; void vhLeft; void vhRight; void refTime; void out; void retimed;
  throw new Error(
    "OZSpline::interpolate @ProChannel 0x31ec8 not yet transcribed (needs " +
      "OZInterpolators::getInterpolator@0x447a6 dispatch)",
  );
}

/**
 * OZSpline::getDerivativeValue(CMTime const&, CMTime const&, bool) -> double
 *   @ProChannel 0x31f9a
 *
 * The first-derivative sibling of getVertexValue — samples dY/dU at time t. Same overall
 * structure (clamp+bracket) but calls the interpolator's `derivative` vtable slot rather than
 * `interpolate`. Deferred until getVertexValue+interpolate land.
 */
export function OZSpline_getDerivativeValue(
  sp: OZSplineFields,
  t: CMTime,
  refTime: CMTime,
  retimed: boolean,
): number {
  void sp; void t; void refTime; void retimed;
  throw new Error("OZSpline::getDerivativeValue @ProChannel 0x31f9a not yet transcribed");
}

/**
 * OZSpline::sampleSpline(CMTime const& tStart, CMTime const& tEnd, u32& count, CMTime* outT,
 *   double* outV, CMTime const& refTime, bool retimed).  @ProChannel 0x322a0
 *
 * Raw-buffer sampler — writes up to `count` (t,value) samples over [tStart..tEnd]. Uses
 * getVertexValue internally.
 */
export function OZSpline_sampleSpline_raw(
  sp: OZSplineFields,
  tStart: CMTime,
  tEnd: CMTime,
  count: { v: number },
  outT: CMTime[],
  outV: number[],
  refTime: CMTime,
  retimed: boolean,
): void {
  void sp; void tStart; void tEnd; void count; void outT; void outV; void refTime; void retimed;
  throw new Error(
    "OZSpline::sampleSpline(*raw,*raw) @ProChannel 0x322a0 not yet transcribed (needs getVertexValue@0x303a6)",
  );
}

/**
 * OZSpline::sampleSplineDerivatives(CMTime const&, CMTime const&, u32&, CMTime*, double*,
 *   CMTime const&).  @ProChannel 0x32e72
 */
export function OZSpline_sampleSplineDerivatives_raw(
  sp: OZSplineFields,
  tStart: CMTime,
  tEnd: CMTime,
  count: { v: number },
  outT: CMTime[],
  outV: number[],
  refTime: CMTime,
): void {
  void sp; void tStart; void tEnd; void count; void outT; void outV; void refTime;
  throw new Error(
    "OZSpline::sampleSplineDerivatives(*raw,*raw) @ProChannel 0x32e72 not yet transcribed " +
      "(needs getDerivativeValue@0x31f9a)",
  );
}

/**
 * OZSpline::sampleSplineDerivatives(CMTime, CMTime, u32&, vector<CMTime>*, vector<double>*, CMTime&)
 *   @ProChannel 0x33010
 */
export function OZSpline_sampleSplineDerivatives_vec(
  sp: OZSplineFields,
  tStart: CMTime,
  tEnd: CMTime,
  count: { v: number },
  outT: CMTime[],
  outV: number[],
  refTime: CMTime,
): void {
  void sp; void tStart; void tEnd; void count; void outT; void outV; void refTime;
  throw new Error(
    "OZSpline::sampleSplineDerivatives(*vec,*vec) @ProChannel 0x33010 not yet transcribed",
  );
}

/**
 * OZSpline::sampleSplineSegments(CMTime const&, CMTime const&, CMTime const&, vector<CMTime>*,
 *   vector<double>*).  @ProChannel 0x33198
 *
 * Segment-aware sampler — emits (t,value) pairs at each vertex boundary within [tStart..tEnd]
 * plus intermediate samples at a fixed cadence. Used by the display refresh path.
 */
export function OZSpline_sampleSplineSegments(
  sp: OZSplineFields,
  tStart: CMTime,
  tEnd: CMTime,
  refTime: CMTime,
  outT: CMTime[],
  outV: number[],
): void {
  void sp; void tStart; void tEnd; void refTime; void outT; void outV;
  throw new Error("OZSpline::sampleSplineSegments @ProChannel 0x33198 not yet transcribed");
}

/**
 * OZSpline::sampleSpline(CMTime, CMTime, u32&, vector<CMTime>*, vector<double>*, CMTime const&, bool)
 *   @ProChannel 0x33b5a
 *
 * The vector-flavoured overload of sampleSpline. Push-back based; grows the output vectors.
 */
export function OZSpline_sampleSpline_vec(
  sp: OZSplineFields,
  tStart: CMTime,
  tEnd: CMTime,
  count: { v: number },
  outT: CMTime[],
  outV: number[],
  refTime: CMTime,
  retimed: boolean,
): void {
  void sp; void tStart; void tEnd; void count; void outT; void outV; void refTime; void retimed;
  throw new Error("OZSpline::sampleSpline(*vec,*vec) @ProChannel 0x33b5a not yet transcribed");
}

/**
 * OZSpline::sampleSplineSegment(CMTime const&, CMTime const&, u32&, CMTime*, double*,
 *   CMTime const&, bool).  @ProChannel 0x345b6
 */
export function OZSpline_sampleSplineSegment(
  sp: OZSplineFields,
  tStart: CMTime,
  tEnd: CMTime,
  count: { v: number },
  outT: CMTime[],
  outV: number[],
  refTime: CMTime,
  retimed: boolean,
): void {
  void sp; void tStart; void tEnd; void count; void outT; void outV; void refTime; void retimed;
  throw new Error("OZSpline::sampleSplineSegment @ProChannel 0x345b6 not yet transcribed");
}

/**
 * OZSpline::getVertex(CMTime const& t, double* outNormal, CMTime const& refTime) -> bool
 *   @ProChannel 0x348fc
 *
 * Time-keyed lookup — finds the vertex at time t (or the nearest bracket) and (if found)
 * writes its normal into *outNormal. Different from the `getVertex(void*, ...)` handle-keyed
 * overload above (`OZSpline_getVertex_byTime` — that one takes a HANDLE, not a time). Naming
 * is FCP's, not ours.
 */
export function OZSpline_getVertex_byTimeQuery(
  sp: OZSplineFields,
  t: CMTime,
  outNormal: { v: number } | null,
  refTime: CMTime,
): boolean {
  void sp; void t; void outNormal; void refTime;
  throw new Error("OZSpline::getVertex(CMTime,double*,CMTime) @ProChannel 0x348fc not yet transcribed");
}

/**
 * OZSpline::getAllValidVerticesHandles(std::vector<void*>&, CMTime const&) -> bool
 *   @ProChannel 0x34a92
 *
 * Filtered variant of getAllVerticesHandles — only emits vertices whose virtual `valid()`
 * (vtable slot ~0x40) returns true against the reference time. 84 lines of disasm; deferred.
 */
export function OZSpline_getAllValidVerticesHandles(
  sp: OZSplineFields,
  out: OZVertexHandle[],
  refTime: CMTime,
): boolean {
  void sp; void out; void refTime;
  throw new Error(
    "OZSpline::getAllValidVerticesHandles @ProChannel 0x34a92 not yet transcribed " +
      "(needs OZVertex vtable slot +0x40 = bool valid(CMTime const&))",
  );
}

/**
 * OZSpline::getVerticesTimeAndValue(CMTimeRange, vector<pair<CMTime, pair<double,u32>>>&,
 *   CMTime* firstOut, CMTime* lastOut).  @ProChannel 0x34bb2
 *
 * 184 lines of disasm — emits (time, (value, flags)) tuples over a range and back-fills the
 * first/last emitted CMTimes into out params. Deferred pending pair<...>-layout modelling.
 */
export function OZSpline_getVerticesTimeAndValue(
  sp: OZSplineFields,
  range: { start: CMTime; duration: CMTime },
  out: Array<{ time: CMTime; value: number; flags: number }>,
  firstOut: { v: CMTime } | null,
  lastOut: { v: CMTime } | null,
): void {
  void sp; void range; void out; void firstOut; void lastOut;
  throw new Error("OZSpline::getVerticesTimeAndValue @ProChannel 0x34bb2 not yet transcribed");
}

// ── low-level helper stubs (each cites its @0xADDR) ────────────────────────────────────

/**
 * The identical lock prologue used at OZSpline+0x8 / +0xa0:
 *   %rax := *(sp+0xa0);
 *   if (%rax != 0 && *(%rax+0x30) != 0) call PCSpinLock::lock(*(%rax+0x30));
 *   else                                 call PCSpinLock::lock(sp+0x8);
 * See disasm ranges 0x303d4..0x30412, 0x349b1..0x349ce, 0x34fe7..0x35004, 0x35016..0x35035.
 * We model as a mutation-free stub — the JS port is single-threaded and PCSpinLock is a
 * classical test-and-set with no observable state at this layer.
 */
function _lockOZSpline(sp: OZSplineFields): void {
  void sp;
  // PCSpinLock::lock @ProChannel 0xacb16 (symbol stub). No-op in JS.
}

function _unlockOZSpline(sp: OZSplineFields): void {
  void sp;
  // PCSpinLock::unlock @ProChannel 0xacb1c. No-op in JS.
}

/**
 * CMTimeCompare(a, b) -> int (system Core Media, @stub 0xaca80). Returns negative if a<b, 0 if
 * equal, positive if a>b. Straight passthrough to the infra port when it lands; here we compute
 * the (value/timescale) comparison directly since kCMTimeZero has timescale 1 and every valueU
 * has an integer numerator — safe for the getAllVerticesHandles de-dup path only.
 */
function _CMTimeCompare(a: CMTime, b: CMTime): number {
  // Faithful to CoreMedia: compare (a.value*b.timescale) vs (b.value*a.timescale). Both sides
  // are int64 in the C API; here we use BigInt to preserve exact ordering (Rule 4: match the
  // machine's numerics — no float slop).
  const lhs = a.value * BigInt(b.timescale);
  const rhs = b.value * BigInt(a.timescale);
  if (lhs < rhs) return -1;
  if (lhs > rhs) return 1;
  return 0;
}

/**
 * OZSpline::getFirstValidVertex(void** out, CMTime const& refTime) -> void
 *   @ProChannel 0x2dccc
 * Called by getNumberOfValidVertices @0x30355. Frontier — the m0/m2 chunk owns it.
 */
function OZSpline_getFirstValidVertex(
  sp: OZSplineFields,
  out: { v: OZVertexHandle | null },
  refTime: CMTime,
): void {
  void sp; void refTime;
  out.v = null;
  throw new Error(
    "OZSpline::getFirstValidVertex @ProChannel 0x2dccc not yet transcribed (owned by OZSpline chunk m0/m2)",
  );
}

/**
 * OZSpline::getNextValidVertex(void* cur, void** out, CMTime const& refTime) -> bool
 *   @ProChannel 0x2dd52
 */
function OZSpline_getNextValidVertex(
  sp: OZSplineFields,
  cur: OZVertexHandle,
  out: { v: OZVertexHandle | null },
  refTime: CMTime,
): boolean {
  void sp; void cur; void out; void refTime;
  throw new Error(
    "OZSpline::getNextValidVertex @ProChannel 0x2dd52 not yet transcribed (owned by OZSpline chunk m0/m2)",
  );
}

/**
 * OZVertex vtable slot +0x20 — virtual `setValue(double, CMTime const&)`. The concrete slot
 * depends on the OZVertex subclass at runtime; port surfaces the throw so the frontier scanner
 * can see it. See setVertexValue disasm @0x35013 (`callq *0x20(%rax)`).
 */
function _OZVertex_setValue_virtualSlot20(
  vh: OZVertexHandle,
  value: number,
  refTime: CMTime,
): void {
  void vh; void value; void refTime;
  throw new Error(
    "OZVertex-subclass vtable slot +0x20 (virtual setValue(double, CMTime const&)) not yet " +
      "transcribed — called from OZSpline::setVertexValue @ProChannel 0x35013",
  );
}
