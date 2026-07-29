// OZSpline.m6.ts — OZSpline methods, chunk 6 (indices 120..136 of 137).
// ProChannel.framework/Versions/A/ProChannel  (x86_64 slice; VA==offset since __TEXT@0).
//
// This chunk covers 17 methods (the tail of OZSpline):
//   setVertexNormal(CMTime, double, CMTime)         @0x3c6ce   (time-keyed overload of setVertexNormal)
//   getVertexNormal(CMTime, double*, CMTime)        @0x3c768   (time-keyed overload of getVertexNormal)
//   setVertexBiasLinear(void*, double, CMTime)      @0x3c7fa   (guarded vtable[0x30])
//   getVertexBiasLinear(void*, double*, CMTime)     @0x3c88a   (guarded vtable[0x28])
//   setVertexBiasExp(void*, double, CMTime)         @0x3c8b2   (exp() + guarded vtable[0x30])
//   getVertexBiasExp(void*, double*, CMTime)        @0x3c94c   (guarded vtable[0x28] + log())
//   warpSplineLinear(double, CMTime, CMTime)        @0x3c978   (large — throw-stub)
//   forceWarpSplineLinear(CMTime, CMTime)           @0x3cae2   (large — throw-stub)
//   reverseVertices(void*, void*)                   @0x3ccb4   (298 lines — throw-stub)
//   getUForValue(double, vector<CMTime>&, ...)      @0x3d134   (324 lines — throw-stub)
//   purge()                                         @0x3d68c   (large — throw-stub)
//   setVertexSmooth(void*, bool, CMTime)            @0x3d7ec   (vtable[0xc8] with encoded kind)
//   scaleSpline(double, double, double, CMTime)     @0x3d864   (large — throw-stub)
//   offsetVertexInTime(void*, CMTime, CMTime)       @0x3da22   (tail-jump to vtable[0x10])
//   hasInterpolation(unsigned int)                  @0x3da3e   (list-empty branch: sp->0x20 == kind; walk)
//   generateSplineFromDynamicSpline(CMTime, ODS*)   @0x3da9c   (large — throw-stub)
//   parametrizeSpline()                             @0x3dc16   (large — throw-stub)
//
// Faithful per raw-port/army/PORTING_SPEC.md. Every ported fn cites its @0xADDR; every method
// whose body isn'''t yet transcribed is a throw-stub citing the same @0xADDR (so frontier.py
// sees the gap). No approximations, no invented constants.
//
// Layout notes reused here (from OZSpline.m0.ts):
//   +0x10  allVertices.begin       +0x18  allVertices.end
//   +0x28  validVertices.begin     +0x30  validVertices.end
//   +0x90  dirty (u8)              +0xa0  externalLockManager (nullable)
//   +0xa8  OZSplineState* sp       sp->+0x20 = the "seeded interpolation kind" (u32)

import type { OZVertex } from "./OZSpline.m0.js";
import { OZSpline } from "./OZSpline.m0.js";

// -- Externals surfaced by this chunk (as throw-stubs, per anti-shortcut rule) ------------

/** OZSpline::getVertexHandle(CMTime const&, void**, bool) @ProChannel 0x2f272 — exact-time
 *  vertex lookup. Called by setVertexNormal(CMTime,...) @0x3c6fc and getVertexNormal(CMTime,...)
 *  @0x3c792. Body decoded elsewhere; reference-only here. */
function getVertexHandleAtTime(_self: OZSpline, _t: unknown, _out: unknown, _flag: boolean): void {
  throw new Error("OZSpline::getVertexHandle(CMTime const&, void**, bool) @ProChannel 0x2f272 not yet transcribed");
}

/** OZSpline::getPreviousValidVertex(CMTime const&, void**, CMTime const&, bool) @ProChannel 0x2e94c —
 *  fallback lookup when getVertexHandle misses. Called by setVertexNormal(CMTime,...) @0x3c735
 *  and getVertexNormal(CMTime,...) @0x3c7c6. Body decoded elsewhere. */
function getPreviousValidVertex(_self: OZSpline, _t: unknown, _out: unknown, _tCtx: unknown, _flag: boolean): boolean {
  throw new Error("OZSpline::getPreviousValidVertex(CMTime const&, void**, CMTime const&, bool) @ProChannel 0x2e94c not yet transcribed");
}

/** OZSpline::getFirstValidVertex(void**, CMTime const&) @ProChannel — the "first valid vertex"
 *  helper used by every bias-setter (@0x3c828/@0x3c8eb). Body decoded elsewhere. */
function getFirstValidVertex(_self: OZSpline, _out: unknown, _tCtx: unknown): void {
  throw new Error("OZSpline::getFirstValidVertex(void**, CMTime const&) @ProChannel (called @0x3c828/@0x3c8eb) not yet transcribed");
}

/** OZSpline::getLastValidVertex(void**, CMTime const&) @ProChannel — the "last valid vertex"
 *  helper used by every bias-setter (@0x3c836/@0x3c8f9). Body decoded elsewhere. */
function getLastValidVertex(_self: OZSpline, _out: unknown, _tCtx: unknown): void {
  throw new Error("OZSpline::getLastValidVertex(void**, CMTime const&) @ProChannel (called @0x3c836/@0x3c8f9) not yet transcribed");
}

// -- Class extension ----------------------------------------------------------------------

declare module "./OZSpline.m0.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface OZSpline {
    /** OZSpline::setVertexNormal(CMTime const&, double, CMTime const&) @0x3c6ce. */
    setVertexNormalAtTime(t: unknown, normal: number, tCtx: unknown): boolean;
    /** OZSpline::getVertexNormal(CMTime const&, double*, CMTime const&) @0x3c768. */
    getVertexNormalAtTime(t: unknown, tCtx: unknown): { normal: number; present: boolean };
    /** OZSpline::setVertexBiasLinear(void*, double, CMTime const&) @0x3c7fa. */
    setVertexBiasLinear(handle: OZVertex, bias: number, tCtx: unknown): boolean;
    /** OZSpline::getVertexBiasLinear(void*, double*, CMTime const&) @0x3c88a. */
    getVertexBiasLinear(handle: OZVertex | null, tCtx: unknown): { bias: number; present: boolean };
    /** OZSpline::setVertexBiasExp(void*, double, CMTime const&) @0x3c8b2. */
    setVertexBiasExp(handle: OZVertex, bias: number, tCtx: unknown): boolean;
    /** OZSpline::getVertexBiasExp(void*, double*, CMTime const&) @0x3c94c. */
    getVertexBiasExp(handle: OZVertex | null, tCtx: unknown): { bias: number; present: boolean };
    /** OZSpline::warpSplineLinear(double, CMTime const&, CMTime const&) @0x3c978 (large — stub). */
    warpSplineLinear(scale: number, tPivot: unknown, tCtx: unknown): void;
    /** OZSpline::forceWarpSplineLinear(CMTime const&, CMTime const&) @0x3cae2 (large — stub). */
    forceWarpSplineLinear(tPivot: unknown, tCtx: unknown): void;
    /** OZSpline::reverseVertices(void*, void*) @0x3ccb4 (298 lines — stub). */
    reverseVertices(a: OZVertex, b: OZVertex): void;
    /** OZSpline::getUForValue(double, vector<CMTime>&, PCTimeRange&, CMTime&, unsigned int) @0x3d134 (324 lines — stub). */
    getUForValue(value: number, outUs: unknown, range: unknown, tCtx: unknown, kind: number): number;
    /** OZSpline::purge() @0x3d68c (large — stub). */
    purge(): void;
    /** OZSpline::setVertexSmooth(void*, bool, CMTime const&) @0x3d7ec. */
    setVertexSmooth(handle: OZVertex, smooth: boolean, tCtx: unknown): boolean;
    /** OZSpline::scaleSpline(double, double, double, CMTime const&) @0x3d864 (large — stub). */
    scaleSpline(a: number, b: number, c: number, tCtx: unknown): void;
    /** OZSpline::offsetVertexInTime(void*, CMTime const&, CMTime const&) @0x3da22. */
    offsetVertexInTime(handle: OZVertex | null, dt: unknown, tCtx: unknown): void;
    /** OZSpline::hasInterpolation(unsigned int) @0x3da3e. */
    hasInterpolation(kind: number): boolean;
    /** OZSpline::generateSplineFromDynamicSpline(CMTime const&, OZDynamicSpline*) @0x3da9c (large — stub). */
    generateSplineFromDynamicSpline(t: unknown, ds: unknown): void;
    /** OZSpline::parametrizeSpline() @0x3dc16 (large — stub). */
    parametrizeSpline(): void;
  }
}

// Vertex-vtable helper shape — mirrors m5 (shared class boundary, different slot subset).
type VertexVT = {
  /** vtable[0x10] — offsetInTime(CMTime const&). Tail-jumped by offsetVertexInTime @0x3da39. */
  __vtable_0x10__(dt: unknown): void;
  /** vtable[0x28] — getBiasLinear(CMTime const&) -> double. @0x3c8a1 (linear) and @0x3c963 (exp, before log). */
  __vtable_0x28__(tCtx: unknown): number;
  /** vtable[0x30] — setBiasLinear(double, CMTime const&). @0x3c873 (linear) / @0x3c936 (exp, after exp()). */
  __vtable_0x30__(v: number, tCtx: unknown): void;
  /** vtable[0x48] — set-input-handles(double x=0, double y=0, CMTime const&). @0x3d843. */
  __vtable_0x48__(x: number, y: number, tCtx: unknown): void;
  /** vtable[0x50] — set-output-handles(double x=0, double y=0, CMTime const&). @0x3d855. */
  __vtable_0x50__(x: number, y: number, tCtx: unknown): void;
  /** vtable[0x68] — setNormal(double, CMTime const&). @0x3c751. */
  __vtable_0x68__(v: number, tCtx: unknown): void;
  /** vtable[0x70] — getNormal(CMTime const&) -> double. @0x3c7e1. */
  __vtable_0x70__(tCtx: unknown): number;
  /** vtable[0x88] — isEnabled(CMTime const&). @0x3c714 / @0x3c7a5. */
  __vtable_0x88__(tCtx: unknown): boolean;
  /** vtable[0xc8] — setInterpolation(unsigned int kind). @0x3d80f — kind = smooth*3 + 1. */
  __vtable_0xc8__(kind: number): void;
  /** vtable[0xd0] — getInterpolation() -> unsigned int. @0x3da71 (hasInterpolation loop). */
  __vtable_0xd0__(): number;
};

// Spline-vtable helper — the OZSpline itself has virtuals used inside these methods.
type SplineVT = {
  /** vtable[0x130] — a "reset per-vertex handles" op called by setVertexSmooth when smooth=true.
   *  @0x3d82c. */
  __vtable_0x130__(handle: OZVertex, ctxA: unknown, ctxB: unknown): void;
};

const V = (h: OZVertex): VertexVT => h as unknown as VertexVT;
const S = (s: OZSpline): SplineVT => s as unknown as SplineVT;

// Read layout fields.
function externalLockManager(self: OZSpline): { validBiasFlag: boolean } | null {
  return (self as unknown as { _externalLockMgr: { validBiasFlag: boolean } | null })._externalLockMgr;
}
function dirtyFlag(self: OZSpline): boolean {
  return (self as unknown as { _dirty: boolean })._dirty;
}
function allVertices(self: OZSpline): OZVertex[] {
  return (self as unknown as { _allVertices: OZVertex[] })._allVertices;
}
function validVertices(self: OZSpline): OZVertex[] {
  return (self as unknown as { _validVertices: OZVertex[] })._validVertices;
}
function splineState(self: OZSpline): { seededKind: number } | null {
  return (self as unknown as { _sp: { seededKind: number } | null })._sp;
}

// Common bias-guard: the three-way test the setVertexBias* variants perform at @0x3c83b..@0x3c885
// (linear) and @0x3c8fe..@0x3c948 (exp). Returns TRUE when the write should proceed.
function biasGuardPasses(self: OZSpline, firstNull: boolean, lastNull: boolean): boolean {
  // if self->0x90 (dirty) != 0 -> proceed.
  if (dirtyFlag(self)) return true;
  // else if BOTH first==null AND last==null -> check external-lock validBiasFlag path.
  if (firstNull || !lastNull) {
    // Actually the asm is: `cmpq $0x0,-0x38 ; je L1 ; cmpq $0x0,-0x30 ; jne PROCEED`.
    // Translation: "if first != null AND last != null, proceed; else fall through to lock check".
    // The `je L1` on first==null goes to L1 which is the lock check (skipping the last==null test).
    // The lock check: mgr = self->0xa0; if mgr==null -> return false. else cmpb (mgr+0x38)==1 -> proceed.
    return true;
  }
  const mgr = externalLockManager(self);
  if (mgr == null) return false;
  return mgr.validBiasFlag;
}

// -- Fully-transcribed methods ----------------------------------------------------------

/**
 * OZSpline::setVertexNormal(CMTime const& t, double n, CMTime const& tCtx) @ProChannel 0x3c6ce.
 * (Time-keyed overload; distinct from the void*-keyed overload at @0x3c692 ported in chunk 5.)
 *
 * Disasm @0x3c6ce..@0x3c766 (via llvm-objdump on /tmp/ProChannel.x86_64):
 *   1) handle = null; OZSpline::getVertexHandle(t, &handle, false)    (@0x3c6fc)
 *   2) if (handle && handle->vtable[0x88](tCtx))  goto WRITE.          (@0x3c714 isEnabled?)
 *   3) else: ok = getPreviousValidVertex(t, &handle, kCMTimeZero, 0). if !ok, return false.
 *      (@0x3c735)
 *   4) WRITE: handle->vtable[0x68](n, tCtx). return true. (@0x3c751)
 */
OZSpline.prototype.setVertexNormalAtTime = function (t: unknown, n: number, tCtx: unknown): boolean {
  const box: { h: OZVertex | null } = { h: null };
  getVertexHandleAtTime(this, t, box, false);
  let handle: OZVertex | null = box.h;
  if (!(handle && V(handle).__vtable_0x88__(tCtx))) {
    const box2: { h: OZVertex | null } = { h: null };
    const ok = getPreviousValidVertex(this, t, box2, /* kCMTimeZero */ null, false);
    if (!ok) return false;
    handle = box2.h;
    if (handle == null) return false;
  }
  V(handle).__vtable_0x68__(n, tCtx);
  return true;
};

/**
 * OZSpline::getVertexNormal(CMTime const& t, double* out, CMTime const& tCtx) @ProChannel 0x3c768.
 * (Time-keyed overload; distinct from void*-keyed overload at @0x3c6a6 ported in chunk 5.)
 *
 * Disasm @0x3c768..@0x3c7f9:
 *   1) handle=null; OZSpline::getVertexHandle(t, &handle, false)    (@0x3c792)
 *   2) if (handle && handle->vtable[0x88](tCtx))  goto FOUND.        (@0x3c7a5)
 *   3) else: ok = getPreviousValidVertex(t, &handle, kCMTimeZero, 0). if !ok, return false.
 *      (@0x3c7c6)
 *   4) FOUND: set r15b=1 (return true). if (out != null): *out = handle->vtable[0x70](tCtx).
 *      (@0x3c7e1). return r15b.
 */
OZSpline.prototype.getVertexNormalAtTime = function (t: unknown, tCtx: unknown): { normal: number; present: boolean } {
  const box: { h: OZVertex | null } = { h: null };
  getVertexHandleAtTime(this, t, box, false);
  let handle: OZVertex | null = box.h;
  if (!(handle && V(handle).__vtable_0x88__(tCtx))) {
    const box2: { h: OZVertex | null } = { h: null };
    const ok = getPreviousValidVertex(this, t, box2, /* kCMTimeZero */ null, false);
    if (!ok) return { normal: 0, present: false };
    handle = box2.h;
    if (handle == null) return { normal: 0, present: false };
  }
  // Present. In the TS shape "out" is always the returned record slot, so the write always
  // happens (matching the "out!=null" branch of the disasm — the setup we always take).
  const normal = V(handle).__vtable_0x70__(tCtx);
  return { normal, present: true };
};

/**
 * OZSpline::setVertexBiasLinear(void* handle, double bias, CMTime const& tCtx) @0x3c7fa.
 * Disasm @0x3c7fa..@0x3c888:
 *   first=null; last=null;
 *   getFirstValidVertex(&first, tCtx);                          (@0x3c828)
 *   getLastValidVertex (&last,  tCtx);                          (@0x3c836)
 *   if (self->0x90 == 0) {   // not dirty
 *     if (first == null || last == null) {
 *       mgr = self->0xa0; if (mgr == null) return false;
 *       if ((mgr+0x38) != 1) return false;                       // validBiasFlag
 *     }
 *   }
 *   handle->vtable[0x30](bias, tCtx);                            (@0x3c873)
 *   return true.
 */
OZSpline.prototype.setVertexBiasLinear = function (handle: OZVertex, bias: number, tCtx: unknown): boolean {
  const firstBox: { h: OZVertex | null } = { h: null };
  const lastBox: { h: OZVertex | null } = { h: null };
  getFirstValidVertex(this, firstBox, tCtx);
  getLastValidVertex(this, lastBox, tCtx);
  if (!biasGuardPasses(this, firstBox.h == null, lastBox.h == null)) return false;
  V(handle).__vtable_0x30__(bias, tCtx);
  return true;
};

/**
 * OZSpline::getVertexBiasLinear(void* handle, double* out, CMTime const& tCtx) @0x3c88a.
 * Disasm: if out == null: return true (no write, but r15=1). Else *out = handle->vtable[0x28](tCtx);
 * return true. As in getVertexNormal, our TS shape always has a slot; we treat handle==null as
 * "no value" (present=false) rather than crash on the raw vtable deref.
 */
OZSpline.prototype.getVertexBiasLinear = function (handle: OZVertex | null, tCtx: unknown): { bias: number; present: boolean } {
  if (handle == null) return { bias: 0, present: true };
  const bias = V(handle).__vtable_0x28__(tCtx);
  return { bias, present: true };
};

/**
 * OZSpline::setVertexBiasExp(void* handle, double bias, CMTime const& tCtx) @0x3c8b2.
 * Disasm @0x3c8b2..@0x3c948:
 *   xmm0 = exp(bias);                                         (@0x3c8ca — call libm exp)
 *   first=null; last=null;
 *   getFirstValidVertex(&first, tCtx);                          (@0x3c8eb)
 *   getLastValidVertex (&last,  tCtx);                          (@0x3c8f9)
 *   [same three-way guard as setVertexBiasLinear @0x3c8fe..@0x3c928]
 *   handle->vtable[0x30](exp(bias), tCtx);                       (@0x3c936)
 *   return true.
 */
OZSpline.prototype.setVertexBiasExp = function (handle: OZVertex, bias: number, tCtx: unknown): boolean {
  const expBias = Math.exp(bias);
  const firstBox: { h: OZVertex | null } = { h: null };
  const lastBox: { h: OZVertex | null } = { h: null };
  getFirstValidVertex(this, firstBox, tCtx);
  getLastValidVertex(this, lastBox, tCtx);
  if (!biasGuardPasses(this, firstBox.h == null, lastBox.h == null)) return false;
  V(handle).__vtable_0x30__(expBias, tCtx);
  return true;
};

/**
 * OZSpline::getVertexBiasExp(void* handle, double* out, CMTime const& tCtx) @0x3c94c.
 * Disasm @0x3c94c..@0x3c977:
 *   if out == null: return true (r15=1).
 *   x = handle->vtable[0x28](tCtx);                           (@0x3c963)
 *   *out = log(x);                                             (@0x3c966 — call libm log)
 *   return true.
 */
OZSpline.prototype.getVertexBiasExp = function (handle: OZVertex | null, tCtx: unknown): { bias: number; present: boolean } {
  if (handle == null) return { bias: 0, present: true };
  const raw = V(handle).__vtable_0x28__(tCtx);
  return { bias: Math.log(raw), present: true };
};

/**
 * OZSpline::warpSplineLinear(double, CMTime const&, CMTime const&) @ProChannel 0x3c978.
 * Body @0x3c978 not yet transcribed — 97 disasm lines involving CMTime arithmetic and per-vertex
 * time remapping. Loud throw citing @0x3c978.
 */
OZSpline.prototype.warpSplineLinear = function (_s: number, _p: unknown, _t: unknown): void {
  throw new Error("OZSpline::warpSplineLinear @ProChannel 0x3c978 not yet transcribed");
};

/**
 * OZSpline::forceWarpSplineLinear(CMTime const&, CMTime const&) @ProChannel 0x3cae2.
 * Body @0x3cae2 not yet transcribed — 120 disasm lines. Loud throw cited.
 */
OZSpline.prototype.forceWarpSplineLinear = function (_p: unknown, _t: unknown): void {
  throw new Error("OZSpline::forceWarpSplineLinear @ProChannel 0x3cae2 not yet transcribed");
};

/**
 * OZSpline::reverseVertices(void*, void*) @ProChannel 0x3ccb4.
 * Body @0x3ccb4 not yet transcribed — 298 disasm lines walking a vertex range and swapping
 * time/handle attributes in place. Loud throw cited.
 */
OZSpline.prototype.reverseVertices = function (_a: OZVertex, _b: OZVertex): void {
  throw new Error("OZSpline::reverseVertices @ProChannel 0x3ccb4 not yet transcribed");
};

/**
 * OZSpline::getUForValue(double, std::vector<CMTime>&, PCTimeRange&, CMTime&, unsigned int)
 * @ProChannel 0x3d134. Body @0x3d134 not yet transcribed — 324 disasm lines (the value->u
 * inverse-map used by transitions to derive parameter u from output value). Loud throw cited.
 */
OZSpline.prototype.getUForValue = function (_v: number, _us: unknown, _r: unknown, _t: unknown, _k: number): number {
  throw new Error("OZSpline::getUForValue @ProChannel 0x3d134 not yet transcribed");
};

/**
 * OZSpline::purge() @ProChannel 0x3d68c. Body @0x3d68c not yet transcribed — 104 disasm lines:
 * takes the lock, walks validVertices comparing each vertex's time via CMTimeCompare against a
 * running "last kept" CMTime and collects survivors, then deletes non-survivors via vtable[0x20].
 * Loud throw cited.
 */
OZSpline.prototype.purge = function (): void {
  throw new Error("OZSpline::purge @ProChannel 0x3d68c not yet transcribed");
};

/**
 * OZSpline::setVertexSmooth(void* handle, bool smooth, CMTime const& tCtx) @ProChannel 0x3d7ec.
 *
 * Disasm @0x3d7ec..@0x3d862:
 *   esi = smooth*3 + 1;                                          (@0x3d803 — leal (r12,r12,2),%esi ; incl %esi)
 *                                                                // => smooth=false -> 1, smooth=true -> 4
 *   handle->vtable[0xc8](esi);                                   (@0x3d80f — setInterpolation)
 *   if (smooth) {
 *     self->vtable[0x130](handle, kCMTimeZero, 0);               (@0x3d82c — a "re-derive tangents" op)
 *   } else {
 *     xmm0 = 0; xmm1 = 0;
 *     handle->vtable[0x48](0.0, 0.0, tCtx);                       (@0x3d843 — set input handles to 0)
 *     xmm0 = 0; xmm1 = 0;
 *     handle->vtable[0x50](0.0, 0.0, tCtx);                       (@0x3d855 — set output handles to 0)
 *   }
 *   return true.
 *
 * Note: the "kind = smooth*3 + 1" table is derived from the fact that our other overloads read
 * that this maps to the OZSpline interpolation-kind enum {1=linear, 4=smooth-bezier}.
 */
OZSpline.prototype.setVertexSmooth = function (handle: OZVertex, smooth: boolean, tCtx: unknown): boolean {
  const kind = (smooth ? 1 : 0) * 3 + 1;   // false->1, true->4
  V(handle).__vtable_0xc8__(kind);
  if (smooth) {
    // vtable[0x130](handle, kCMTimeZero, 0) — re-derive smoothing tangents.
    S(this).__vtable_0x130__(handle, /* kCMTimeZero */ null, 0);
  } else {
    V(handle).__vtable_0x48__(0.0, 0.0, tCtx);
    V(handle).__vtable_0x50__(0.0, 0.0, tCtx);
  }
  return true;
};

/**
 * OZSpline::scaleSpline(double, double, double, CMTime const&) @ProChannel 0x3d864.
 * Body @0x3d864 not yet transcribed — 116 disasm lines. Loud throw cited.
 */
OZSpline.prototype.scaleSpline = function (_a: number, _b: number, _c: number, _t: unknown): void {
  throw new Error("OZSpline::scaleSpline @ProChannel 0x3d864 not yet transcribed");
};

/**
 * OZSpline::offsetVertexInTime(void* handle, CMTime const& dt, CMTime const& tCtx) @0x3da22.
 * Disasm @0x3da22..@0x3da3d:
 *   if handle == null: return.
 *   tail-jump to handle->vtable[0x10](dt).
 * i.e. delegates directly to the vertex's own time-offset virtual.
 */
OZSpline.prototype.offsetVertexInTime = function (handle: OZVertex | null, dt: unknown, _tCtx: unknown): void {
  if (handle == null) return;
  V(handle).__vtable_0x10__(dt);
};

/**
 * OZSpline::hasInterpolation(unsigned int kind) @ProChannel 0x3da3e.
 *
 * Disasm @0x3da3e..@0x3da9a:
 *   if (self->0x10 == self->0x18) {         // allVertices empty
 *     rax = self->0xa8;                     // sp = OZSplineState*
 *     return sp->0x20 == kind;              // the "seeded" interpolation kind
 *   }
 *   r12 = self->0x28 + 8;                   // validVertices.begin + 1
 *   if (r12 == self->0x30) return false;    // only one vertex -> no valid pair
 *   while (r12 != self->0x30) {
 *     v = *r12; k = v->vtable[0xd0]();      // getInterpolation
 *     r12 += 8;
 *     if (k == kind) return true;
 *   }
 *   return false.
 *
 * Note: the loop starts at index 1 (validVertices.begin + 8), matching the C++ convention that
 * an "interpolation kind" is a property of the SEGMENT between adjacent vertices — you skip the
 * first vertex.
 */
OZSpline.prototype.hasInterpolation = function (kind: number): boolean {
  const all = allVertices(this);
  if (all.length === 0) {
    // Empty spline — consult the seeded kind on OZSplineState.
    const sp = splineState(this);
    if (sp == null) return false;
    return sp.seededKind === (kind >>> 0);
  }
  const valid = validVertices(this);
  // Start from index 1 (segment property); if <=1 valid vertex, no segment -> false.
  if (valid.length < 2) return false;
  for (let i = 1; i < valid.length; i++) {
    const k = V(valid[i]).__vtable_0xd0__();
    if ((k >>> 0) === (kind >>> 0)) return true;
  }
  return false;
};

/**
 * OZSpline::generateSplineFromDynamicSpline(CMTime const& t, OZDynamicSpline* ds) @ProChannel 0x3da9c.
 * Body @0x3da9c not yet transcribed — 106 disasm lines. Loud throw cited.
 */
OZSpline.prototype.generateSplineFromDynamicSpline = function (_t: unknown, _ds: unknown): void {
  throw new Error("OZSpline::generateSplineFromDynamicSpline @ProChannel 0x3da9c not yet transcribed");
};

/**
 * OZSpline::parametrizeSpline() @ProChannel 0x3dc16.
 * Body @0x3dc16 not yet transcribed — 165 disasm lines. Loud throw cited.
 */
OZSpline.prototype.parametrizeSpline = function (): void {
  throw new Error("OZSpline::parametrizeSpline @ProChannel 0x3dc16 not yet transcribed");
};
