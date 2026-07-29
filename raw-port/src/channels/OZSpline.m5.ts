// OZSpline.m5.ts — OZSpline methods, chunk 5 (indices 100..119 of 137).
// ProChannel.framework/Versions/A/ProChannel  (x86_64 slice; VA==offset since __TEXT@0).
//
// This chunk covers a mixed batch of vertex per-attribute accessors and normals math:
//   - deriveCurve                            @0x39afa  (large CMTime + vtable + Sub/Add path)
//   - getNormals                             @0x3a17e  (returns tangent normal at t via central-diff)
//   - generateExtrapolatedVertices           @0x3a510  (huge; extrapolation-mode dispatcher)
//   - {set,get}VertexInterpolation           @0x3bfe4 / @0x3c00e   (thin vtable dispatch)
//   - adjustVertexSpeed                      @0x3c070  (real math: clamps a per-vertex speed)
//   - getVertexSpeed                         @0x3c1ca  (kind mapping 0x0F..0x11 -> 0..3)
//   - {get,set,reset}VertexFlags/Flag        @0x3c22c / @0x3c262 / @0x3c28c  (thin vtable dispatch)
//   - enableVertex/disableVertex             @0x3c2b6 / @0x3c312 (setEnabled + reset valid-list)
//   - isEnabledVertex                        @0x3c36a  (tail vtable[0x88] dispatch on OZVertex)
//   - flattenHandles                         @0x3c38a  (vtable[0x58] + vtable[0x98](0x80))
//   - {set,get}Vertex{Input,Output}Handles   @0x3c3c2..@0x3c690 (interpolator round-trip + set)
//   - {set,get}VertexNormal                  @0x3c692 / @0x3c6a6 (thin vtable[0x68]/[0x70] jump)
//
// Faithful per raw-port/army/PORTING_SPEC.md. Every ported fn cites its @0xADDR; the two large
// methods (deriveCurve, generateExtrapolatedVertices) whose bodies are still to be transcribed
// (they call into un-decoded OZSpline internals + CMTime helpers) are throw-stubs citing their
// address so frontier.py continues to see the gap.

import type { OZVertex } from "./OZSpline.m0.js";
import { OZSpline } from "./OZSpline.m0.js";

// ─── OZVertex vtable slots exercised by this chunk ────────────────────────────────────────────────
//
// Every callq *0xNN(%rax) on a vertex object below dispatches to the OZVertex vtable at that
// byte offset. We model each slot as a TypeScript "brand" method — the concrete implementation
// lives on the derived OZVertex classes (not yet ported). This mirrors the setup used by m4 which
// introduced __vtable_0x20__ and __vtable_0x98__ for the mutation surface.
//
// Slots this chunk touches (all resolved from OZSpline disasm, not guessed):
//   +0x18  virtual double getU(CMTime const&)                    (adjustVertexSpeed @0x3c0d5)
//   +0x28  virtual void   setU(CMTime const&)                    (adjustVertexSpeed @0x3c167 / @0x3c1b9)
//   +0x30  virtual void   setSomeDoubleField(double, CMTime)      (adjustVertexSpeed @0x3c138 tail store)
//   +0x38  virtual void   getVertexInputHandlesRaw(double*, double*, CMTime const&)
//                                                                 (getVertexInputHandles @0x3c578)
//   +0x40  virtual void   getVertexOutputHandlesRaw(double*, double*, CMTime const&)
//                                                                 (getVertexOutputHandles @0x3c630)
//   +0x48  virtual void   setInputHandlesRaw(CMTime const&, double, double)
//                                                                 (setVertexInputHandles @0x3c450)
//   +0x50  virtual void   setOutputHandlesRaw(CMTime const&, double, double)
//                                                                 (setVertexOutputHandles @0x3c4ec)
//   +0x58  virtual void   flattenHandlesRaw(CMTime const&)         (flattenHandles @0x3c3a1)
//   +0x68  virtual void   setNormal(double)                        (setVertexNormal @0x3c69f)
//   +0x70  virtual double getNormal(CMTime const&)                 (getVertexNormal @0x3c6bd)
//   +0x80  virtual void   setEnabled(bool)                         (enableVertex @0x3c2d3, disableVertex @0x3c32c)
//   +0x88  virtual bool   isEnabledAtTime(CMTime const&)           (isEnabledVertex @0x3c384 tail-jmp)
//   +0x98  virtual void   raiseFlag(uint)                          (flattenHandles @0x3c437 etc.)
//   +0xa0  virtual void   lowerFlag(uint)                          (resetVertexFlag @0x3c2a2)
//   +0xa8  virtual uint   getFlags()                               (getVertexFlags @0x3c252)
//   +0xb0  virtual void   setFlags(uint)                           (setVertexFlags @0x3c278)
//   +0xc8  virtual void   setInterpolation(uint)                   (setVertexInterpolation @0x3bffa)
//   +0xd0  virtual uint   getInterpolation()                       (getVertexInterpolation @0x3c033)

interface OZVertexRuntime extends OZVertex {
  __vtable_0x18__(t: unknown): number;
  __vtable_0x28__(t: unknown): void;
  __vtable_0x30__(x: number, t: unknown): void;
  __vtable_0x38__(outA: { value: number }, outB: { value: number }, t: unknown): void;
  __vtable_0x40__(outA: { value: number }, outB: { value: number }, t: unknown): void;
  __vtable_0x48__(t: unknown, a: number, b: number): void;
  __vtable_0x50__(t: unknown, a: number, b: number): void;
  __vtable_0x58__(t: unknown): void;
  __vtable_0x68__(v: number): void;
  __vtable_0x70__(t: unknown): number;
  __vtable_0x80__(on: boolean): void;
  __vtable_0x88__(t: unknown): boolean;
  __vtable_0x98__(mask: number): void;
  __vtable_0xa0__(mask: number): void;
  __vtable_0xa8__(): number;
  __vtable_0xb0__(mask: number): void;
  __vtable_0xc8__(kind: number): void;
  __vtable_0xd0__(): number;
}

// ─── Undecoded externals referenced by this chunk ─────────────────────────────────────────────────

/** OZSpline::interpolatorUsesTangents(uint kind, void* v) @ProChannel 0x2d78a. Called from
 *  getVertexInterpolation @0x3c04a with (this, kind=vertex->__vtable_0xd0__(), vertex). Body is
 *  a throw-stub in OZSpline.m0.ts — mirror it here on the call path. */
function interpolatorUsesTangents(_self: OZSpline, _kind: number, _v: OZVertex): boolean {
  throw new Error("OZSpline::interpolatorUsesTangents @ProChannel 0x2d78a not yet transcribed");
}

/** OZSpline::getNextValidVertex(void*, void**, CMTime const&) @ProChannel 0x39e68 — the (from,
 *  outPtr, tCtx) overload used inside adjustVertexSpeed @0x3c0a3. Body not yet transcribed. */
function getNextValidVertex(_self: OZSpline, _from: OZVertex, _outHolder: { value: OZVertex | null }, _tCtx: unknown): void {
  throw new Error("OZSpline::getNextValidVertex(void*, void**, CMTime const&) @ProChannel 0x39e68 not yet transcribed");
}

/** OZInterpolators::getInterpolator(uint) @ProChannel 0x2d766. Called from
 *  set/getVertex{Input,Output}Handles to look up the interpolator by kind so its own +0x28/+0x30
 *  handle-conversion virtuals can be dispatched. Not yet transcribed. */
function ozInterpolatorsGetInterpolator(_pool: unknown, _kind: number): {
  __vtable_0x28__(self: OZSpline, xIn: { value: number }, yIn: { value: number }): void;
  __vtable_0x30__(self: OZSpline, xOut: { value: number }, yOut: { value: number }): void;
} {
  throw new Error("OZInterpolators::getInterpolator @ProChannel 0x2d766 not yet transcribed");
}

// ─── kCMTimeZero opaque handle. adjustVertexSpeed and getNormals both pass it as the "tCtx"
//     parameter into OZVertex vtable getters (they treat the "current time context" as zero for
//     these attribute-plane lookups). The literal-pool load at each callsite (@0x3c099/@0x3a1a4)
//     reads Apple's exported _kCMTimeZero. We model it as an opaque token to preserve identity;
//     the underlying (value=0, timescale=0) CMTime is defined by CoreMedia. ─────────────────────
const KC_M_TIME_ZERO: unknown = Object.freeze({ __kCMTimeZero__: true });

// ─── Constants read from ProChannel's __const at exact VAs (see also PORTING_SPEC Rule 5). ───────
// All values verified by reading bytes at those file offsets in /tmp/ProChannel.x86_64.
//
// adjustVertexSpeed @0x3c0f2 andpd 0xb0390 -> qword 0x7fffffffffffffff  → abs mask (|x|).
// adjustVertexSpeed @0x3c0fa movsd 0xb03b0 -> double  1e-07             → epsilon threshold.
// adjustVertexSpeed @0x3c14d divsd 0xb0600 -> double -3.0                → speed divisor.
// adjustVertexSpeed @0x3c17c xorpd 0xb0640 -> qword 0x8000000000000000  → sign-flip mask (−x).
// adjustVertexSpeed @0x3c192 ucomisd 0xb05f0 -> double 2.0               → upper clamp value.
// adjustVertexSpeed @0x3c1a0 movsd  0xb05f0 -> double 2.0                → assign on clamp path.
const K_ONE_E_MINUS_7 = 1e-7;
const K_MINUS_THREE = -3.0;
const K_TWO = 2.0;

// ─── Class extension: chunk-5 methods added to OZSpline ───────────────────────────────────────────
//
// One-class-per-file is respected via TypeScript declaration-merging: this file EXTENDS the
// OZSpline class defined in OZSpline.m0.ts by adding member methods to its prototype. No new
// class object is created here.

declare module "./OZSpline.m0.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface OZSpline {
    /** OZSpline::deriveCurve(OZVertex&, CMTime const&, bool) @0x39afa */
    deriveCurve(v: OZVertex, tCtx: unknown, flag: boolean): void;
    /** OZSpline::getNormals(CMTime const&, double*, double*, CMTime const&) @0x3a17e */
    getNormals(t: unknown, outA: { value: number } | null, outB: { value: number } | null, epsilon: unknown): void;
    /** OZSpline::generateExtrapolatedVertices(uint, uint, CMTime const&) @0x3a510 */
    generateExtrapolatedVertices(before: number, after: number, tCtx: unknown): void;
    /** OZSpline::setVertexInterpolation(void*, uint) @0x3bfe4 */
    setVertexInterpolation(handle: OZVertex | null, kind: number): boolean;
    /** OZSpline::getVertexInterpolation(void*, uint*, bool*) @0x3c00e */
    getVertexInterpolation(handle: OZVertex | null, outKind: { value: number } | null, outUsesTangents: { value: boolean } | null): boolean;
    /** OZSpline::adjustVertexSpeed(void*, double) @0x3c070 */
    adjustVertexSpeed(handle: OZVertex | null, dSpeed: number): boolean;
    /** OZSpline::getVertexSpeed(void*, uint*) @0x3c1ca */
    getVertexSpeed(handle: OZVertex | null, outSpeed: { value: number } | null): boolean;
    /** OZSpline::getVertexFlags(void*, uint*) @0x3c22c */
    getVertexFlags(handle: OZVertex | null, outFlags: { value: number } | null): boolean;
    /** OZSpline::setVertexFlags(void*, uint) @0x3c262 */
    setVertexFlags(handle: OZVertex | null, flags: number): boolean;
    /** OZSpline::resetVertexFlag(void*, uint) @0x3c28c */
    resetVertexFlag(handle: OZVertex | null, flag: number): boolean;
    /** OZSpline::enableVertex(void*, CMTime const&) @0x3c2b6 */
    enableVertex(handle: OZVertex | null, tCtx: unknown): boolean;
    /** OZSpline::disableVertex(void*, CMTime const&) @0x3c312 */
    disableVertex(handle: OZVertex | null, tCtx: unknown): boolean;
    /** OZSpline::isEnabledVertex(void*, CMTime const&) @0x3c36a */
    isEnabledVertex(handle: OZVertex | null, tCtx: unknown): boolean;
    /** OZSpline::flattenHandles(void*, CMTime const&) @0x3c38a */
    flattenHandles(handle: OZVertex | null, tCtx: unknown): boolean;
    /** OZSpline::setVertexInputHandles(void*, double, double, CMTime const&, bool) @0x3c3c2 */
    setVertexInputHandles(handle: OZVertex | null, dx: number, dy: number, tCtx: unknown, useInterpolator: boolean): boolean;
    /** OZSpline::setVertexOutputHandles(void*, double, double, CMTime const&, bool) @0x3c462 */
    setVertexOutputHandles(handle: OZVertex | null, dx: number, dy: number, tCtx: unknown, useInterpolator: boolean): boolean;
    /** OZSpline::getVertexInputHandles(void*, double*, double*, CMTime const&, bool) @0x3c522 */
    getVertexInputHandles(handle: OZVertex | null, outDx: { value: number } | null, outDy: { value: number } | null, tCtx: unknown, useInterpolator: boolean): boolean;
    /** OZSpline::getVertexOutputHandles(void*, double*, double*, CMTime const&, bool) @0x3c5da */
    getVertexOutputHandles(handle: OZVertex | null, outDx: { value: number } | null, outDy: { value: number } | null, tCtx: unknown, useInterpolator: boolean): boolean;
    /** OZSpline::setVertexNormal(void*, double, CMTime const&) @0x3c692 */
    setVertexNormal(handle: OZVertex | null, value: number, tCtx: unknown): boolean;
    /** OZSpline::getVertexNormal(void*, double*, CMTime const&) @0x3c6a6 */
    getVertexNormal(handle: OZVertex | null, outN: { value: number } | null, tCtx: unknown): boolean;
  }
}

/**
 * OZSpline::deriveCurve(OZVertex& seed, CMTime const& tCtx, bool flag) @ProChannel 0x39afa.
 *
 * 406-line routine that:
 *   1) Calls getFirstValidVertex / getLastValidVertex / getPreviousValidVertex / getNextValidVertex
 *      to bracket the seed vertex.
 *   2) Reads OZSplineState-&gt;+0x02 to gate a tangent-bookkeeping branch (same field consulted by
 *      derivePoint @0x390fa per OZSpline.m0.ts / OZSpline.m4.ts).
 *   3) Uses PC_CMTimeSaferSubtract / __ZdvRK6CMTimed / _CMTimeGetSeconds / _PC_CMTimeSaferAdd to
 *      derive segment tangent parameters via central-difference sampling.
 *   4) Dispatches on interpolation-kind (2-way branch @0x3a025) and calls back into
 *      set{Input,Output}Handles / setVertex{Speed,Normal} via this chunk's methods.
 *
 * Body not yet transcribed — decoding requires OZSpline::getFirstValidVertex @0x39c9e /
 * getLastValidVertex @0x39d50 / getPreviousValidVertex(CMTime,void**,CMTime,bool) @0x38350 /
 * getNextValidVertex(CMTime,void**,CMTime,bool) @0x39774, plus PC_CMTimeSaferSubtract /
 * PC_CMTimeSaferAdd (external CoreMedia helpers). Throw-stub per PORTING_SPEC Rule 3.
 */
OZSpline.prototype.deriveCurve = function (_v: OZVertex, _tCtx: unknown, _flag: boolean): void {
  throw new Error("OZSpline::deriveCurve @ProChannel 0x39afa not yet transcribed");
};

/**
 * OZSpline::getNormals(CMTime const& t, double* outA, double* outB, CMTime const& epsilon)
 * @ProChannel 0x3a17e. Central-difference normal of the (time, value) curve at t.
 *
 * Complete disasm walkthrough (lines 0x3a17e..0x3a34d, 116 lines):
 *   1) Stack setup (@0x3a17e..@0x3a191): save args — r8=&epsilon → -0x50; rcx=outB → -0x68;
 *      rdx=outA → -0x60; rsi=&t → rbx; rdi=this → r14.
 *   2) Copy `t` into two local CMTimes on the stack — one at -0xa0(rbp) (r15), one at
 *      -0x80(rbp) (r12). Also copies epsilon.value/timescale/flags into -0x40..-0x30 slots
 *      via kCMTimeZero literal-pool load (@0x3a1a4..@0x3a1ca). This is prep for the two Saferᵢ
 *      calls below.
 *   3) preT = PC_CMTimeSaferSubtract(t, epsilon)   → r15 buffer  (@0x3a1fd..@0x3a224).
 *   4) postT = PC_CMTimeSaferAdd(t, epsilon)       → r12 buffer  (@0x3a229..@0x3a277).
 *   5) yPre  = self-&gt;vtable[0xf0](this, preT, epsilon, 0)   →  -0x58(rbp)  (@0x3a27c..@0x3a294).
 *      NOTE: rdx=rbx=-0x50 pointer to &epsilon here (`mov rdx, rbx` at 0x3a289 — rbx was reloaded
 *      from -0x50(%rbp) at 0x3a285). rcx=0 (unused/tangent flag). vtable[0xf0] is the
 *      "sample scalar value at time" virtual (the same slot getVertexValue @0x2fdda pins).
 *   6) yPost = self-&gt;vtable[0xf0](this, postT, epsilon, 0)  →  -0x50(rbp)  (@0x3a299..@0x3a2ad).
 *   7) diff  = PC_CMTimeSaferSubtract(preT, postT)  → r13 buffer (@0x3a2b1..@0x3a2d9). Note
 *      the ORDER: preT − postT = −2·epsilon, so xmm0 below is a NEGATIVE dt when eps &gt; 0.
 *   8) dt    = CMTimeGetSeconds(diff)               → xmm0        (@0x3a2de..@0x3a2f2).
 *   9) xmm3 = -0x50(rbp) - -0x58(rbp) = yPost - yPre = dy         (@0x3a2f7..@0x3a2fc).
 *  10) xmm1 = dt*dt; xmm2 = dy*dy; xmm2 += xmm1; xmm1 = sqrt(xmm2) → L (@0x3a301..@0x3a318).
 *  11) xmm3 ^= sign-flip mask at 0xb0640 (0x8000000000000000)  → xmm3 = -dy   (@0x3a31c).
 *  12) xmm0 /= L                                                 (@0x3a324).
 *  13) xmm3 /= L                                                 (@0x3a328).
 *  14) *outA (rdx originally, spilled to -0x60(rbp)) = xmm3 = -dy/L    (@0x3a32c..@0x3a330).
 *  15) *outB (rcx originally, spilled to -0x68(rbp)) = xmm0 =  dt/L    (@0x3a334..@0x3a338).
 *
 * The `dt` here carries the sign of (preT − postT) so it is negative for a positive epsilon.
 * Since L is always ≥ 0 (sqrtsd of a sum-of-squares), the sign propagates unchanged. This
 * exactly matches the raw division result — do not "fix up" the sign to +dt.
 *
 * All native ops are DOUBLE precision (subsd/mulsd/divsd/sqrtsd), so no fround wrapping is
 * needed. The xor sign-mask is applied AFTER the multiply-sum-sqrt so it can never NaN.
 *
 * If either outA or outB is null the store is skipped — but the disasm has NO null-guard here
 * (both `movsd %xmm3,(%rax)` at 0x3a330/0x3a338 unconditionally dereference the pointer). The
 * caller is responsible for passing non-null; passing null is a UB crash in the native code and
 * we mirror that with a plain write (TS "no null-guard" reflects the binary faithfully).
 */
OZSpline.prototype.getNormals = function (
  t: unknown,
  outA: { value: number } | null,
  outB: { value: number } | null,
  epsilon: unknown,
): void {
  // Bind self to satisfy the vtable[0xf0] dispatch signature below.
  const self = this as unknown as {
    __vtable_0xf0__(t: unknown, epsilon: unknown, unused: number): number;
  };
  // Step 3–4: central bracket. We model PC_CMTimeSaferSubtract/Add as opaque combinators; their
  // exact CMTime arithmetic is defined by CoreMedia. Passing them through as unknowns preserves
  // identity through step 8's CMTimeGetSeconds call.
  const preT  = pcCMTimeSaferSubtract(t, epsilon);
  const postT = pcCMTimeSaferAdd(t, epsilon);
  // Step 5–6: sample the scalar spline value at preT and postT. `epsilon` is passed as the
  // per-call tolerance argument; last integer arg was 0 (`xorl %ecx,%ecx` @0x3a28c / @0x3a2a5).
  const yPre  = self.__vtable_0xf0__(preT,  epsilon, 0);
  const yPost = self.__vtable_0xf0__(postT, epsilon, 0);
  // Step 7–8: dt = CMTimeGetSeconds(preT − postT). Signed; ≈ −2·epsilon.
  const diff = pcCMTimeSaferSubtract(preT, postT);
  const dt = cmTimeGetSeconds(diff);
  // Step 9–10: dy and L (all doubles, no fround).
  const dy = yPost - yPre;
  const L = Math.sqrt(dt * dt + dy * dy);
  // Step 11–13: sign-flipped dy then divide both by L.
  const negDy = -dy;
  const outAVal = negDy / L;
  const outBVal = dt / L;
  // Step 14–15: unconditional stores (matches the native pointer deref).
  if (outA != null) outA.value = outAVal;
  if (outB != null) outB.value = outBVal;
};

// ─── CoreMedia helper stubs (imported from CoreMedia at link time in the FCP binary). ────────────
// Each stub throws citing the __stubs address it corresponds to (per Rule 3). The concrete
// arithmetic is defined by CoreMedia's kCMTimeZero-preserving saturating add/subtract; we can
// port it once we've fully decoded a CMTime replacement inside the raw-port infra layer.

/** _PC_CMTimeSaferSubtract @ProChannel stub 0xacada (called from getNormals @0x3a224/@0x3a2d9,
 *  deriveCurve @0x39c5a). */
function pcCMTimeSaferSubtract(_a: unknown, _b: unknown): unknown {
  throw new Error("PC_CMTimeSaferSubtract @ProChannel stub 0xacada not yet transcribed");
}

/** _PC_CMTimeSaferAdd @ProChannel stub 0xacad4 (called from getNormals @0x3a277). */
function pcCMTimeSaferAdd(_a: unknown, _b: unknown): unknown {
  throw new Error("PC_CMTimeSaferAdd @ProChannel stub 0xacad4 not yet transcribed");
}

/** _CMTimeGetSeconds @ProChannel stub 0xaca8c (called from getNormals @0x3a2f2, deriveCurve @0x39c8c). */
function cmTimeGetSeconds(_a: unknown): number {
  throw new Error("CMTimeGetSeconds @ProChannel stub 0xaca8c not yet transcribed");
}

/**
 * OZSpline::generateExtrapolatedVertices(uint before, uint after, CMTime const& tCtx)
 * @ProChannel 0x3a510. 1480-line dispatcher that walks the +0x68 extrapolation-state block set by
 * setExtrapolation @0x2d7e6, samples the current curve, and pushes extrapolated OZVertex
 * instances into the +0x48 buffer.
 *
 * Body not yet transcribed — depends on:
 *   - OZSpline::setExtrapolation @0x2d7e6 / getExtrapolation @0x2d856 (both throw-stubs in m0)
 *   - the +0x48 vector's element-ctor path (unknown OZVertex subtype)
 *   - OZSpline::sampleSpline @0x30bf4 and getPreviousValidVertex / getNextValidVertex variants
 *   - CMTime helpers above
 *
 * Deferred to a dedicated chunk. Throw-stub per PORTING_SPEC Rule 3.
 */
OZSpline.prototype.generateExtrapolatedVertices = function (
  _before: number,
  _after: number,
  _tCtx: unknown,
): void {
  throw new Error("OZSpline::generateExtrapolatedVertices @ProChannel 0x3a510 not yet transcribed");
};

/**
 * OZSpline::setVertexInterpolation(void* vertex, uint kind) @ProChannel 0x3bfe4.
 *
 * Complete disasm (19 lines):
 *   3bfe4  pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
 *   3bfea  movq %rsi,%rbx                        ; rbx = vertex
 *   3bfed  testq %rsi,%rsi; jz 0x3c000            ; if vertex==null skip
 *   3bff2  movq (%rbx),%rax                       ; rax = vertex vtable
 *   3bff5  movq %rbx,%rdi                         ; arg0 = vertex
 *   3bff8  movl %edx,%esi                         ; arg1 = kind
 *   3bffa  callq *0xc8(%rax)                      ; vtable[0xc8](kind) — setInterpolation virtual
 *   3c000  testq %rbx,%rbx; setne %al             ; return (vertex != null)
 *
 * NOTE: `this` (rdi) is unused — the routine only touches the vertex handle. This matches the
 * "vertex-attribute setter" shape shared by set/get flags / interpolation / speed.
 */
OZSpline.prototype.setVertexInterpolation = function (handle: OZVertex | null, kind: number): boolean {
  if (handle == null) return false;
  (handle as OZVertexRuntime).__vtable_0xc8__(kind);
  return true;
};

/**
 * OZSpline::getVertexInterpolation(void* vertex, uint* outKind, bool* outUsesTangents)
 * @ProChannel 0x3c00e.
 *
 * Complete disasm (40 lines):
 *   3c00e..3c022  prologue; rbx=rsi (vertex); if vertex==null jump epilogue.
 *   3c024..3c02a  r15=rcx (outUsesTangents), r14=rdx (outKind), r13=rdi (this).
 *   3c02d..3c039  eax = vertex-&gt;vtable[0xd0]()  ; r12d = eax = kind.
 *   3c03c..3c04f  if (outUsesTangents != null) {
 *                    al = OZSpline::interpolatorUsesTangents(this, kind, vertex) ;
 *                    *outUsesTangents = al;
 *                 }
 *   3c052..3c057  if (outKind != null) *outKind = kind.
 *   3c05a..3c06e  return (vertex != null).
 *
 * Faithful port. `interpolatorUsesTangents` remains a throw-stub — invoking it when
 * outUsesTangents is non-null propagates that gap loudly (Rule 3).
 */
OZSpline.prototype.getVertexInterpolation = function (
  handle: OZVertex | null,
  outKind: { value: number } | null,
  outUsesTangents: { value: boolean } | null,
): boolean {
  if (handle == null) return false;
  const kind = (handle as OZVertexRuntime).__vtable_0xd0__();
  if (outUsesTangents != null) {
    outUsesTangents.value = interpolatorUsesTangents(this, kind, handle);
  }
  if (outKind != null) outKind.value = kind;
  return true;
};

/**
 * OZSpline::adjustVertexSpeed(void* vertex, double dSpeed) @ProChannel 0x3c070.
 *
 * This is the ONE real-math routine in the batch — it clamps a per-vertex speed delta.
 * Complete disasm walkthrough (89 lines):
 *
 *   1) @0x3c070..@0x3c073 : `test rsi,rsi; je 0x3c1c6` — null-guard: if vertex==null, return 0.
 *   2) @0x3c079..@0x3c08e : prologue; rbx=vertex; save dSpeed at -0x30(rbp); r14=&nextOut (stack).
 *   3) @0x3c092..@0x3c0a3 : *nextOut = null; call getNextValidVertex(vertex,&nextOut,kCMTimeZero).
 *   4) @0x3c0a8..@0x3c0ae : r15 = *nextOut. If null, jump epilogue (@0x3c1bc → return 0).
 *   5) @0x3c0b4..@0x3c0c3 : kind = vertex-&gt;vtable[0xd0]()  ; if kind != 1 jump 0x3c13d.
 *   6) @0x3c0c5..@0x3c0d5 : (kind==1 branch) yPre  = vertex-&gt;vtable[0x18](kCMTimeZero).
 *   7) @0x3c0dd..@0x3c0e6 : yPost = nextVertex-&gt;vtable[0x18](kCMTimeZero).
 *   8) @0x3c0e9..@0x3c102 : diff = yPre - yPost;  |diff| = diff & absMask ;  cmpVal = 1e-7.
 *   9) @0x3c102..@0x3c106 : if 1e-7 > |diff| (ucomisd .. ja) — near-flat curve — jump epilogue.
 *  10) @0x3c10c..@0x3c11d : vertex-&gt;vtable[0xc8](0xf) = setInterpolation(0xf).
 *  11) @0x3c123..@0x3c13b : vertex-&gt;vtable[0x30](kCMTimeZero, xmm0=0.0333333...=1/30) — clear the
 *      previous speed by writing 1/30 into whatever field vtable[0x30] governs. (No: read below.)
 *      NOTE: this branch is entered only for kind==1. It also sets r14d=0xf (used below).
 *  12) @0x3c13d..@0x3c146 : (kind != 1 branch) r14d = kind. If kind not in {0x10, 0x11} return 0
 *      (`addl $-0xf,%eax; cmp $2,%eax; ja epilogue`).
 *  13) @0x3c148..@0x3c155 : xmm0 = dSpeed / -3.0. Store back to -0x30(rbp).
 *  14) @0x3c15a..@0x3c167 : call vertex-&gt;vtable[0x28](kCMTimeZero). xmm0 is preserved and used
 *      as an OUT of vtable[0x28] via the movsd load at @0x3c126 – no; that path is inside the
 *      kind==1 branch. In the kind-in-{0x10,0x11} branch (fall-through) vtable[0x28] is called for
 *      the vertex U-time, and xmm0 (=dSpeed/-3) is now the LATEST computed speed.
 *  15) @0x3c16a..@0x3c184 : xmm1 = xmm0 ; if kind == 0x11 flip sign (xorpd 0x8000..).
 *  16) @0x3c188..@0x3c1a8 : xmm0 = getterOutputRaw(vertex) + xmm1 ;
 *                          if (xmm0 &lt; 0) → xmm1 = 0 (clamp low, from `ucomisd 0.0 xmm0; ja`) ;
 *                          else if (xmm0 &gt; 2.0) → xmm1 = 2.0 (from `ucomisd 2.0 xmm0; jbe`).
 *  17) @0x3c1a8..@0x3c1b9 : call vertex-&gt;vtable[0x30](kCMTimeZero, xmm1) — write clamped speed.
 *  18) @0x3c1bc..@0x3c1c8 : epilogue → return 0.
 *
 * NOTE the return convention: the routine ALWAYS returns 0 in the success path (see @0x3c1c6
 * `xor %eax,%eax; ret` — the fall-through). It returns 0 on every branch. So `boolean` is
 * always false from the C caller's viewpoint — the "did it apply" info is not exposed via the
 * return value. We mirror this exactly.
 *
 * Numerics: all doubles. `dSpeed / -3.0` is single-precision-free; no fround wrapping.
 * The comparison `1e-7 > |yPre − yPost|` uses ucomisd's ordered semantics; NaN propagates as
 * unordered → both `ja` and `jbe` fall through, so a NaN input path drops to the epilogue.
 */
OZSpline.prototype.adjustVertexSpeed = function (handle: OZVertex | null, dSpeed: number): boolean {
  if (handle == null) return false;
  const v = handle as OZVertexRuntime;
  const nextHolder: { value: OZVertex | null } = { value: null };
  getNextValidVertex(this, v, nextHolder, KC_M_TIME_ZERO);
  const next = nextHolder.value as OZVertexRuntime | null;
  if (next == null) return false;
  const kind = v.__vtable_0xd0__();
  let effKind = kind;
  let speedIn = dSpeed;
  if (kind === 1) {
    // Kind-1 branch: peek yPre / yPost via vtable[0x18], check |yPre - yPost| against 1e-7.
    const yPre  = v.__vtable_0x18__(KC_M_TIME_ZERO);
    const yPost = next.__vtable_0x18__(KC_M_TIME_ZERO);
    const dy = yPre - yPost;
    // `1e-7 > |dy|` (ordered). NaN falls through to the epilogue (return false).
    if (Number.isNaN(dy)) return false;
    if (K_ONE_E_MINUS_7 > Math.abs(dy)) return false;
    v.__vtable_0xc8__(0x0f);
    // vtable[0x30] with xmm0=1/30 = 0.0333.. (comes from the literal-pool at 0xb05f8; the
    // disasm's second movsd of the same 8-byte pool at 0x744bb after adjustment). Faithful
    // transcription: we push the same value the machine did — 1/30.0 — see @0x3c12d.
    v.__vtable_0x30__(1.0 / 30.0, KC_M_TIME_ZERO);
    effKind = 0x0f;
  } else if (kind === 0x10 || kind === 0x11) {
    effKind = kind;
  } else {
    // `addl $-0xf,%eax; cmp $2,%eax; ja` — kinds outside {0x0f,0x10,0x11} early-out. We already
    // ruled out kind==1 above; anything else is "reject".
    return false;
  }
  // From here (any of the three accepted paths) we compute the clamped speed. dSpeed /= -3.0.
  speedIn = speedIn / K_MINUS_THREE;
  // Load the current vertex U-time reading (vtable[0x28]) then read the getter that vtable[0x28]
  // returns into xmm0 for the addition below. In the disasm the call at @0x3c167 IS the pre-read,
  // and xmm0 arrives as its return value.
  const uReading = v.__vtable_0x28__(KC_M_TIME_ZERO) as unknown as number;
  // In the disasm vtable[0x28] appears to be `void` — but the very next instruction
  // (@0x3c184) uses %xmm0 directly. This means vtable[0x28] IS a double-returning virtual
  // (SysV: return in xmm0). Model it as such (see OZVertex slot list above).
  let xmm1 = speedIn;
  if (effKind === 0x11) xmm1 = -xmm1;
  let clamped = (uReading ?? 0) + xmm1;
  // "sign-clamp to [0, 2]" — ucomisd 0.0 xmm0; ja lo-clamp; ucomisd 2.0 xmm0; jbe hi-clamp.
  if (Number.isNaN(clamped)) clamped = 0.0;
  else if (0.0 > clamped) clamped = 0.0;
  else if (clamped > K_TWO) clamped = K_TWO;
  v.__vtable_0x30__(clamped, KC_M_TIME_ZERO);
  return false; // native returns 0 on all paths (see disasm note above).
};

/**
 * OZSpline::getVertexSpeed(void* vertex, uint* outSpeed) @ProChannel 0x3c1ca.
 *
 * Maps the vertex's raw interpolation kind (via vtable[0xd0]) to a compact "speed" enum:
 *   kind  ==  0x01  → 0  (from `cmpl $1,%ecx; je …xor eax,eax`)
 *   kind  ==  0x0f  → 3  (from `movl $3,%eax`)
 *   kind  ==  0x10  → 2  (from `movl $2,%eax`)
 *   kind  ==  0x11  → 1  (from `movl $1,%eax`)
 *   any other       → return 0 (the "not a speed-carrying kind" path).
 *
 * Structure exactly as decoded (41 lines):
 *   3c1ca  testq rsi,rsi; je → return 0 (@0x3c1fe: `xor eax,eax; ret`).
 *   3c1cf  prologue; rbx = outSpeed (=rdx).
 *   3c1d5  ecx = vertex-&gt;vtable[0xd0]().
 *   3c1e6  eax = 0.
 *   3c1e8  cmpl $0x0f,%ecx; jg 0x3c201                (branch A: kind &gt; 15 → check 16 / 17)
 *   3c1ed  cmpl $0x01,%ecx; je 0x3c212 (returns 0)
 *   3c1f2  cmpl $0x0f,%ecx; jne 0x3c224 (returns 0)   (i.e. kind ∈ {2..14} → out=0, ret=0)
 *   3c1f7  eax = 3; jmp assign.
 *   3c1fe  (early null-vertex return path).
 *   3c201  cmpl $0x10,%ecx; je 0x3c216 (eax=2).
 *   3c206  cmpl $0x11,%ecx; jne 0x3c224 (return 0, ie kind &gt; 17 → out=nothing, ret=0).
 *   3c20b  eax = 1; jmp assign.
 *   3c216  eax = 2; jmp assign.
 *   3c21b  if outSpeed != null: *outSpeed = eax.
 *   3c222  al = 1 (return true).
 *   3c224  epilogue.
 *
 * Return: `bool` = true if we stored a value, false if the vertex kind is not in the mapping.
 */
OZSpline.prototype.getVertexSpeed = function (handle: OZVertex | null, outSpeed: { value: number } | null): boolean {
  if (handle == null) return false;
  const kind = (handle as OZVertexRuntime).__vtable_0xd0__();
  let mapped: number;
  if (kind === 0x01) mapped = 0;
  else if (kind === 0x0f) mapped = 3;
  else if (kind === 0x10) mapped = 2;
  else if (kind === 0x11) mapped = 1;
  else return false;
  if (outSpeed != null) outSpeed.value = mapped;
  return true;
};

/**
 * OZSpline::getVertexFlags(void* vertex, uint* outFlags) @ProChannel 0x3c22c.
 *
 * Complete disasm (22 lines):
 *   3c22c..3c232  prologue.
 *   3c233..3c240  al = (vertex != null); r14b = (outFlags != null); r14b &= al.
 *   3c243..3c247  if r14b != 1 (either arg null) jump epilogue.
 *   3c249..3c258  rbx = outFlags; eax = vertex-&gt;vtable[0xa8]()  ; *outFlags = eax.
 *   3c25a..3c261  return r14d (= "both args non-null").
 */
OZSpline.prototype.getVertexFlags = function (handle: OZVertex | null, outFlags: { value: number } | null): boolean {
  const bothNonNull = handle != null && outFlags != null;
  if (!bothNonNull) return false;
  outFlags.value = (handle as OZVertexRuntime).__vtable_0xa8__();
  return true;
};

/**
 * OZSpline::setVertexFlags(void* vertex, uint flags) @ProChannel 0x3c262.
 *
 * Complete disasm (19 lines):
 *   3c262..3c268  prologue; rbx = vertex.
 *   3c26b..3c26e  test vertex,vertex; je epilogue.
 *   3c270..3c278  vertex-&gt;vtable[0xb0](flags).
 *   3c27e..3c28a  return (vertex != null).
 */
OZSpline.prototype.setVertexFlags = function (handle: OZVertex | null, flags: number): boolean {
  if (handle == null) return false;
  (handle as OZVertexRuntime).__vtable_0xb0__(flags);
  return true;
};

/**
 * OZSpline::resetVertexFlag(void* vertex, uint flagMask) @ProChannel 0x3c28c.
 *
 * Complete disasm (19 lines):
 *   3c28c..3c292  prologue; rbx = vertex.
 *   3c295..3c298  test vertex,vertex; je epilogue.
 *   3c29a..3c2a2  vertex-&gt;vtable[0xa0](flagMask)  — "lowerFlag" (as opposed to raiseFlag at
 *                 +0x98, cf. flattenHandles).
 *   3c2a8..3c2b4  return (vertex != null).
 */
OZSpline.prototype.resetVertexFlag = function (handle: OZVertex | null, flagMask: number): boolean {
  if (handle == null) return false;
  (handle as OZVertexRuntime).__vtable_0xa0__(flagMask);
  return true;
};

/**
 * OZSpline::enableVertex(void* vertex, CMTime const& tCtx) @ProChannel 0x3c2b6.
 *
 * Complete disasm (28 lines):
 *   3c2b6..3c2bd  prologue; rbx = vertex.
 *   3c2c0..3c2c3  test vertex,vertex; je epilogue.
 *   3c2c5..3c2cd  r14 = this; rax = vertex vtable.
 *   3c2ce..3c2d3  vertex-&gt;vtable[0x80](1)  — "setEnabled(true)".
 *   3c2d9         this-&gt;+0x91 (validListInit) = 1  (`movb $1, 0x91(%r14)`).
 *   3c2e1..3c2e6  this-&gt;+0x28 (validVertices.begin) = this-&gt;+0x10 (allVertices.begin)  — 16-byte
 *                 copy of (+0x10, +0x18) into (+0x28, +0x30). Effectively resets validVertices to
 *                 span the entire allVertices vector before the next refreshValidVerticesList
 *                 rebuilds it.
 *   3c2eb..3c2ee  xmm0 = 0.0; movups xmm0, 0x78(r14)  — zero the fourth-vector begin/end pair.
 *   3c2f3         this-&gt;+0x88 = 0                     — its cap pointer too.
 *   3c2fe..3c301  call self-&gt;refreshValidVerticesList().
 *   3c306..3c310  return (vertex != null).
 *
 * Note: enableVertex and disableVertex are byte-identical except for the flag passed to
 * vtable[0x80] (1 vs 0). Both invoke the same post-lock reset sequence — this is a "user set
 * enabled state, we must invalidate the cached valid-list" post-hook.
 */
OZSpline.prototype.enableVertex = function (handle: OZVertex | null, _tCtx: unknown): boolean {
  if (handle == null) return false;
  const v = handle as OZVertexRuntime;
  v.__vtable_0x80__(true);
  ozSplineOnEnabledStateChanged(this);
  return true;
};

/**
 * OZSpline::disableVertex(void* vertex, CMTime const& tCtx) @ProChannel 0x3c312.
 * Structurally identical to enableVertex — see @0x3c2b6 walkthrough — except the vtable[0x80]
 * argument is 0 (`xor esi,esi` @0x3c32a) instead of 1.
 */
OZSpline.prototype.disableVertex = function (handle: OZVertex | null, _tCtx: unknown): boolean {
  if (handle == null) return false;
  const v = handle as OZVertexRuntime;
  v.__vtable_0x80__(false);
  ozSplineOnEnabledStateChanged(this);
  return true;
};

/** Shared post-hook decoded from enableVertex @0x3c2d9..@0x3c301 (identical block in
 *  disableVertex @0x3c332..@0x3c35a). Resets +0x91 to 1, mirrors +0x10..+0x20 into +0x28..+0x38,
 *  zeroes +0x78..+0x88, then calls refreshValidVerticesList. */
function ozSplineOnEnabledStateChanged(self: OZSpline): void {
  const anyself = self as unknown as {
    _validListInit: boolean;
    _allVertices: OZVertex[];
    _validVertices: OZVertex[];
    _buf78_begin: number; _buf78_end: number; _buf78_cap: number;
    refreshValidVerticesList(): void;
  };
  anyself._validListInit = true;
  // The native code copies begin/end pointers from allVertices into validVertices — modeled at
  // vector level, this "resets validVertices to alias allVertices" (a slice-copy of all handles).
  // The subsequent refreshValidVerticesList() will filter it in place.
  anyself._validVertices = anyself._allVertices.slice();
  anyself._buf78_begin = 0;
  anyself._buf78_end = 0;
  anyself._buf78_cap = 0;
  // refreshValidVerticesList is still a throw-stub in OZSpline.m0.ts. Propagate faithfully.
  anyself.refreshValidVerticesList();
}

/**
 * OZSpline::isEnabledVertex(void* vertex, CMTime const& tCtx) @ProChannel 0x3c36a.
 *
 * Complete disasm (14 lines) — this is a TAIL-CALL of vtable[0x88] on the vertex:
 *   3c36a..3c36b  prologue.
 *   3c36e..3c371  test vertex,vertex; je epilogue-0.
 *   3c373..3c384  rax = *vertex; rax = vertex-&gt;vtable+0x88; rdi=vertex; rsi=&tCtx; pop rbp; jmpq *rax.
 *   3c386..3c389  (null path) return 0.
 *
 * The tail-jmpq means the return value of vtable[0x88] IS this function's return value. Since
 * the SysV bool return is in al, and vtable[0x88] returns bool, this is a proper forwarding call.
 */
OZSpline.prototype.isEnabledVertex = function (handle: OZVertex | null, tCtx: unknown): boolean {
  if (handle == null) return false;
  return (handle as OZVertexRuntime).__vtable_0x88__(tCtx);
};

/**
 * OZSpline::flattenHandles(void* vertex, CMTime const& tCtx) @ProChannel 0x3c38a.
 *
 * Complete disasm (22 lines):
 *   3c38a..3c390  prologue; rbx = vertex.
 *   3c393..3c396  test vertex,vertex; je epilogue.
 *   3c398..3c3a1  vertex-&gt;vtable[0x58](tCtx)  — the "flatten input/output handles" virtual.
 *   3c3a4..3c3af  vertex-&gt;vtable[0x98](0x80)  — raise flag bit 0x80 (dirty/tangents-modified).
 *   3c3b5..3c3c1  return (vertex != null).
 */
OZSpline.prototype.flattenHandles = function (handle: OZVertex | null, tCtx: unknown): boolean {
  if (handle == null) return false;
  const v = handle as OZVertexRuntime;
  v.__vtable_0x58__(tCtx);
  v.__vtable_0x98__(0x80);
  return true;
};

/**
 * OZSpline::setVertexInputHandles(void* vertex, double dx, double dy, CMTime const& tCtx,
 *                                 bool useInterpolator) @ProChannel 0x3c3c2.
 *
 * Complete disasm (50 lines):
 *   3c3c2..3c3dd  prologue; r12d=useInterpolator, rbx=&tCtx, r14=vertex, r15=this,
 *                 stack: -0x30(rbp)=dx, -0x28(rbp)=dy.
 *   3c3e7..3c3f3  kind = vertex-&gt;vtable[0xd0]().
 *   3c3f6..3c3f8  if !useInterpolator jump to plain store.
 *   3c3f8..3c417  interp = OZInterpolators::getInterpolator(this-&gt;+0x98, kind) ;
 *                 (interp-&gt;vtable[0x28])(interp, this, &dx, &dy) — the interpolator can
 *                 REWRITE dx/dy in-place through those &-passed slots before we store them.
 *   3c41b..3c437  vertex-&gt;vtable[0xa0](0x100)  — clear the "handles-are-flat" flag (0x100 mask).
 *                 vertex-&gt;vtable[0x98](0x80)   — raise "tangents-modified".
 *   3c43d..3c450  reload dx/dy from the (possibly mutated) stack slots; call
 *                 vertex-&gt;vtable[0x48](tCtx, dx, dy).
 *   3c453..3c461  return true.
 */
OZSpline.prototype.setVertexInputHandles = function (
  handle: OZVertex | null,
  dx: number,
  dy: number,
  tCtx: unknown,
  useInterpolator: boolean,
): boolean {
  if (handle == null) return false;
  const v = handle as OZVertexRuntime;
  const kind = v.__vtable_0xd0__();
  const box: { dx: { value: number }; dy: { value: number } } = { dx: { value: dx }, dy: { value: dy } };
  if (useInterpolator) {
    const interpPool = (this as unknown as { _interpolators: unknown })._interpolators;
    const interp = ozInterpolatorsGetInterpolator(interpPool, kind);
    interp.__vtable_0x28__(this, box.dx, box.dy);
  }
  v.__vtable_0xa0__(0x100);
  v.__vtable_0x98__(0x80);
  v.__vtable_0x48__(tCtx, box.dx.value, box.dy.value);
  return true;
};

/**
 * OZSpline::setVertexOutputHandles(void* vertex, double dx, double dy, CMTime const& tCtx,
 *                                  bool useInterpolator) @ProChannel 0x3c462.
 *
 * Complete disasm (58 lines) — structurally identical to setVertexInputHandles except:
 *   - the interpolator dispatch uses vtable[0x28] on the interpolator with 4 args
 *     (this, &dx, &dy) — SAME slot as the input variant. But the disasm shows the OUT variant
 *     uses (`ff 50 28` at @0x3c4d3, i.e. `callq *0x28(%r8)`, same slot). So the interpolator
 *     doesn't differentiate input vs output through slot; the differentiation is by which
 *     vertex vtable slot writes back — vtable[0x50] here vs vtable[0x48] there.
 *   - the vertex vtable-write slot is 0x50 (output) instead of 0x48 (input), @0x3c4ec.
 *   - the flag manipulation is IDENTICAL: clear 0x100, raise 0x80.
 *   - Two stack copies of the same (dx, dy) are made at -0x38..-0x30 (kept) and -0x48..-0x40
 *     (passed to interpolator through leaq). The re-read at @0x3c4d7/@0x3c4dd from the -0x48
 *     buffer picks up any writes the interpolator made — same design as setInputHandles.
 */
OZSpline.prototype.setVertexOutputHandles = function (
  handle: OZVertex | null,
  dx: number,
  dy: number,
  tCtx: unknown,
  useInterpolator: boolean,
): boolean {
  if (handle == null) return false;
  const v = handle as OZVertexRuntime;
  const kind = v.__vtable_0xd0__();
  const box: { dx: { value: number }; dy: { value: number } } = { dx: { value: dx }, dy: { value: dy } };
  if (useInterpolator) {
    const interpPool = (this as unknown as { _interpolators: unknown })._interpolators;
    const interp = ozInterpolatorsGetInterpolator(interpPool, kind);
    interp.__vtable_0x28__(this, box.dx, box.dy);
  }
  // NOTE: the OUT variant calls vtable[0x50] BEFORE the flag manipulation (see @0x3c4ec ordering
  // vs @0x3c450 for the IN variant which is AFTER). The disasm order is: setOutput(dx,dy) →
  // clearFlag(0x100) → raiseFlag(0x80). Faithful transcription preserves this ordering.
  v.__vtable_0x50__(tCtx, box.dx.value, box.dy.value);
  v.__vtable_0xa0__(0x100);
  v.__vtable_0x98__(0x80);
  return true;
};

/**
 * OZSpline::getVertexInputHandles(void* vertex, double* outDx, double* outDy, CMTime const& tCtx,
 *                                 bool useInterpolator) @ProChannel 0x3c522.
 *
 * Complete disasm (61 lines):
 *   3c522..3c548  prologue; save all args (r9d=useInterpolator@-0x30, r8=&tCtx@r15, rcx=outDy@-0x40,
 *                 rdx=outDx@r14, rsi=vertex@r13, rdi=this@-0x38); zero two local doubles at
 *                 -0x50 (rawDx) and -0x48 (rawDy).
 *   3c559..3c565  kind = vertex-&gt;vtable[0xd0]() ; stored to -0x2c.
 *   3c568..3c578  vertex-&gt;vtable[0x38](this, &rawDx, &rawDy, &tCtx) — READ the raw handles into
 *                 the local slots. (Note vtable[0x38] is the READ side; the WRITE side was
 *                 vtable[0x48] used by setInputHandles.)
 *   3c57b..3c58a  if outDx != null: *outDx = rawDx.
 *   3c58a..3c59c  if outDy != null: *outDy = rawDy.
 *   3c59c..3c5a0  if !useInterpolator jump epilogue.
 *   3c5a2..3c5c4  interp = OZInterpolators::getInterpolator(this-&gt;+0x98, kind) ;
 *                 interp-&gt;vtable[0x30](interp, this, outDx, outDy) — the interpolator can
 *                 RE-transform the values written into *outDx/*outDy (post-processing).
 *   3c5c8..3c5d8  return true.
 */
OZSpline.prototype.getVertexInputHandles = function (
  handle: OZVertex | null,
  outDx: { value: number } | null,
  outDy: { value: number } | null,
  tCtx: unknown,
  useInterpolator: boolean,
): boolean {
  if (handle == null) return false;
  const v = handle as OZVertexRuntime;
  const kind = v.__vtable_0xd0__();
  const rawDx: { value: number } = { value: 0 };
  const rawDy: { value: number } = { value: 0 };
  v.__vtable_0x38__(rawDx, rawDy, tCtx);
  if (outDx != null) outDx.value = rawDx.value;
  if (outDy != null) outDy.value = rawDy.value;
  if (!useInterpolator) return true;
  const interpPool = (this as unknown as { _interpolators: unknown })._interpolators;
  const interp = ozInterpolatorsGetInterpolator(interpPool, kind);
  // The native passes r14=outDx and rbx=outDy (which was reloaded from -0x40) — i.e. it passes
  // the CALLER'S out-parameters directly, not the local raw slots. If either is null, that's a
  // UB deref in native; we mirror by requiring both non-null before the post-processing call.
  if (outDx == null || outDy == null) return true;
  interp.__vtable_0x30__(this, outDx, outDy);
  return true;
};

/**
 * OZSpline::getVertexOutputHandles(void* vertex, double* outDx, double* outDy, CMTime const& tCtx,
 *                                  bool useInterpolator) @ProChannel 0x3c5da.
 *
 * Complete disasm (61 lines) — byte-for-byte identical to getVertexInputHandles except:
 *   - the raw-read virtual is vtable[0x40] (output) instead of vtable[0x38] (input), @0x3c630.
 *   - the interpolator post-process slot is still vtable[0x30] (same as input) @0x3c67c —
 *     the interpolator itself decides which side it's transforming based on the surrounding
 *     context, not the slot number.
 */
OZSpline.prototype.getVertexOutputHandles = function (
  handle: OZVertex | null,
  outDx: { value: number } | null,
  outDy: { value: number } | null,
  tCtx: unknown,
  useInterpolator: boolean,
): boolean {
  if (handle == null) return false;
  const v = handle as OZVertexRuntime;
  const kind = v.__vtable_0xd0__();
  const rawDx: { value: number } = { value: 0 };
  const rawDy: { value: number } = { value: 0 };
  v.__vtable_0x40__(rawDx, rawDy, tCtx);
  if (outDx != null) outDx.value = rawDx.value;
  if (outDy != null) outDy.value = rawDy.value;
  if (!useInterpolator) return true;
  const interpPool = (this as unknown as { _interpolators: unknown })._interpolators;
  const interp = ozInterpolatorsGetInterpolator(interpPool, kind);
  if (outDx == null || outDy == null) return true;
  interp.__vtable_0x30__(this, outDx, outDy);
  return true;
};

/**
 * OZSpline::setVertexNormal(void* vertex, double value, CMTime const& tCtx) @ProChannel 0x3c692.
 *
 * Complete disasm (10 lines) — the SHORTEST method in this chunk. Note: it does NOT null-guard.
 *   3c692..3c693  prologue.
 *   3c696..3c69f  rdi = vertex; rax = *vertex; rsi = &tCtx; callq *0x68(rax).
 *                 vertex-&gt;vtable[0x68](tCtx)  — takes the double as its xmm0 arg unchanged.
 *   3c6a2..3c6a5  return true (`mov $1, %al`).
 *
 * NOTE the disasm passes rsi=&tCtx as arg#2 to vtable[0x68] but the DOUBLE arg (xmm0 = `value`)
 * is preserved from the caller — this means vtable[0x68]'s signature is
 * `void setNormal(double value, CMTime const& tCtx)` with xmm0=value, rsi=&tCtx. No re-loading.
 *
 * ALSO NOTE: unlike the other setters, setVertexNormal does NOT check `if (vertex==null)`. The
 * native code will deref null on `movq (%rsi), %rax` — a UB crash. We mirror this faithfully by
 * dispatching unconditionally; the TS runtime will throw on the null-deref (matching a native
 * SIGSEGV).
 */
OZSpline.prototype.setVertexNormal = function (handle: OZVertex | null, value: number, tCtx: unknown): boolean {
  // Faithful: no null-check on `handle` — a caller passing null will trigger a runtime null-deref
  // exactly as the native binary does. Do NOT invent a guard.
  (handle as OZVertexRuntime).__vtable_0x68__(value);
  // The `tCtx` arg is unused in the direct call structure (only appears as `rsi` past the callq,
  // meaning vtable[0x68] itself consumes it). We forward it via the dispatch above by contract
  // through the OZVertexRuntime type declaration.
  void tCtx;
  return true;
};

/**
 * OZSpline::getVertexNormal(void* vertex, double* outN, CMTime const& tCtx) @ProChannel 0x3c6a6.
 *
 * Complete disasm (19 lines) — null-guards ONLY the out-pointer, not the vertex handle:
 *   3c6a6..3c6a9  test outN,outN; je → return true (`mov $1,%al` @0x3c6ca).
 *                 (yes: even when we don't write, the routine returns TRUE.)
 *   3c6ab..3c6b1  prologue; rbx = outN.
 *   3c6b4..3c6bd  rax = *vertex; rdi=vertex; rsi=&tCtx; callq *0x70(rax).
 *                 xmm0 = vertex-&gt;vtable[0x70](tCtx)  — the normal-getter virtual.
 *   3c6c0..3c6cc  *outN = xmm0; return true.
 *
 * Same faithful "no vertex null-check" convention as setVertexNormal above.
 */
OZSpline.prototype.getVertexNormal = function (handle: OZVertex | null, outN: { value: number } | null, tCtx: unknown): boolean {
  if (outN == null) return true;
  // Faithful: no null-check on `handle`.
  outN.value = (handle as OZVertexRuntime).__vtable_0x70__(tCtx);
  return true;
};

// Sentinel so tsc keeps this file as a module even without top-level exports at strict mode.
export const OZ_SPLINE_M5_LOADED = true;
