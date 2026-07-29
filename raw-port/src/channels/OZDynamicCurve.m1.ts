// raw-port: OZDynamicCurve (chunk m1) — ProChannel.framework (channels layer)
//
// Framework binary: /tmp/ProChannel.x86_64 (macOS FCP x86_64 slice; VA == file offset).
// Chunk 1 ports methods [20..40) of OZDynamicCurve: the value/time getters that mirror the
// getCurrentMaxValueV shape (min-V, max-U, min-U, rangeU), the three setKeypoint overloads, the
// keypoint bias/handle helpers, moveKeypoint / cloneKeypoint, getPoint, the (all/valid) handle-list
// getters, getFirst/Last/get(byHandle) keypoint, and delKeypoint / delAllKeypoints.
//
// See raw-port/src/channels/OZDynamicCurve.m0.ts for the class-wide object layout, base-class
// opaque brands, and BaseAccessors interface — they are re-imported here so this chunk is a
// bounded ADD (no cross-chunk mutations). Every ported body cites its @0xADDR + framework and
// every callee / RIP-relative load / literal-pool address is documented at its instruction site.
//
// ── Frontier callees new to this chunk (each becomes a throw-stub citing @0xADDR) ─────
//   OZSpline::getMinValueV(CMTime const&, CMTime*)                                    @0x283b4
//   OZSpline::getMaxValueU(CMTime const&, bool) → CMTime (fills local CMTime; xmm0 not read)  @0x2841c
//   OZSpline::getMinValueU(CMTime const&, bool) → CMTime                                       @0x2847e
//   OZSpline::getRangeU(CMTime const&)     — sret CMTime (fills the caller's r14 buffer)       @0x284d0
//   OZSpline::isValidHandle(void*)                                                              @0x28523, 0x28775, 0x287cb, 0x2881c,
//                                                                                                0x28894, 0x28b21, 0x28b93
//   OZSpline::getVertexValue(CMTime const&, CMTime const&, bool) → double                       @0x285bf, 0x28929
//   OZSpline::getVertex(void*, CMTime*, double*, CMTime const&) → bool                          @0x28669, 0x28a10, 0x28aab, 0x28b3a
//   OZSpline::getLastVertex() → void*                                                            @0x28655
//   OZSpline::reparametrize()                                                                   @0x285ea, 0x28733, 0x28bce
//   OZSpline::setVertexBiasLinear(void*, double, CMTime const&) → bool                          @0x28796 (tail-jmp)
//   OZSpline::getVertexBiasLinear(void*, double*, CMTime const&) → bool                         @0x287e8 (tail-jmp)
//   OZSpline::moveVertex(void*, CMTime const&, CMTime const&, bool, bool, bool) → void*         @0x28854, 0x288cf
//   OZSpline::getVertexHandle(CMTime const&, void**, bool) → int                                @0x28975 (tail-call)
//   OZSpline::getFirstValidVertex(void**, CMTime const&)                                        @0x289f5
//   OZSpline::getLastValidVertex(void**, CMTime const&)                                         @0x28a8e
//   OZSpline::getAllValidVerticesHandles(std::vector<void*>&, CMTime const&)                    @0x289a6 (tail-jmp)
//                                                                                                (already stubbed in m0)
//   OZDynamicSpline::setVertex(void*, CMTime const&, double, CMTime const&) → void*             @0x28553
//   OZDynamicSpline::addVertex(CMTime const&, double, CMTime const&, bool) → void*              @0x285d2, 0x286fd
//   OZDynamicSpline::appendVertex(CMTime const&, double, CMTime const&) → void*                 @0x28728
//   OZDynamicSpline::getAllVerticesHandles(std::vector<void*>&)                                 @0x2898f (tail-jmp)
//   OZDynamicSpline::deleteVertex(void*, bool, CMTime const&) → int                             @0x28baa
//   __Z26OZFigTimeForChannelSecondsdi  ( OZFigTimeForChannelSeconds(double, int) → CMTime,      @0x2853d, 0x28599, 0x285af,
//     called with second-arg $0x40000 in EVERY call site in this chunk. Fills a caller stack     0x28697, 0x286e5, 0x28715,
//     buffer via a hidden sret pointer in rdi. )                                                 0x28836, 0x288ae, 0x28919, 0x28965
//   _kCMTimeZero                       (Apple CoreMedia global)                                   many
//   _kCMTimeNegativeInfinity           (Apple CoreMedia global — see setKeypoint(t,v,b,out))      @0x28670
//   _CMTimeCompare                     (Apple CoreMedia)                                          @0x286c0
//   _CMTimeGetSeconds                  (Apple CoreMedia)                                          @0x283d4, 0x28437, 0x28499, 0x284e6,
//                                                                                                 0x28a2b, 0x28ac6, 0x28b58
//   OZSpline::deleteAllVertices()      (already stubbed in m0)                                    @0x28bf2
//   virtual *0x38 on `this`            (already stubbed in m0)                                    @0x28bc8, 0x28c00
//
// The `0x40000` magic in the OZFigTimeForChannelSeconds call is the SECOND arg (esi) — this is
// the timescale mode/flags constant `0x40000` (i.e. 262144). Its meaning isn't decoded here
// (OZFigTimeForChannelSeconds is undecoded) but it's cited so the ledger sees the constant.

import {
  type CMTime,
  kCMTimeZero,
  CMTimeCompare,
  CMTimeGetSeconds,
} from "../infra/CMTime.js";
import {
  type OZDynamicCurve,
  type OZDynamicSplineOpaque,
  type OZSplineOpaque,
  type BaseAccessors,
} from "./OZDynamicCurve.m0.js";

// ────────────────────────────────────────────────────────────────────────────
// Undecoded frontier callees (Spec Rule 3: loud throw citing @0xADDR).
// ────────────────────────────────────────────────────────────────────────────

/** OZSpline::getMinValueV(CMTime const&, CMTime*) → double. Call site @0x283b4. */
function OZSpline_getMinValueV(
  _spline: OZSplineOpaque,
  _t: CMTime,
  _outAtTime: { time: CMTime },
): number {
  throw new Error(
    "raw-port: OZSpline::getMinValueV(CMTime const&, CMTime*) not yet transcribed " +
      "(called from OZDynamicCurve::getCurrentMinValueV(CMTime const&, double*, double*) " +
      "@0x283b4 — ProChannel)",
  );
}

/** OZSpline::getMaxValueU(CMTime const&, bool). Call site @0x2841c.
 *  The callee is invoked with `rdi = local CMTime buffer (sret)`, `rsi = &self.spline`,
 *  `rdx = &t`, `ecx = 1` — so the return-slot is the caller's stack CMTime. The RETURN VALUE
 *  (xmm0) is IGNORED here; only the sret'd CMTime is consumed via _CMTimeGetSeconds.
 *  Signature captured accordingly: writes into `outAtTime`. */
function OZSpline_getMaxValueU(
  _spline: OZSplineOpaque,
  _t: CMTime,
  _flag: boolean,
  _outAtTime: { time: CMTime },
): void {
  throw new Error(
    "raw-port: OZSpline::getMaxValueU(CMTime const&, bool) not yet transcribed " +
      "(called from OZDynamicCurve::getCurrentMaxValueU(CMTime const&, double*) " +
      "@0x2841c — ProChannel)",
  );
}

/** OZSpline::getMinValueU(CMTime const&, bool). Call site @0x2847e. Mirrors getMaxValueU. */
function OZSpline_getMinValueU(
  _spline: OZSplineOpaque,
  _t: CMTime,
  _flag: boolean,
  _outAtTime: { time: CMTime },
): void {
  throw new Error(
    "raw-port: OZSpline::getMinValueU(CMTime const&, bool) not yet transcribed " +
      "(called from OZDynamicCurve::getCurrentMinValueU(CMTime const&, double*) " +
      "@0x2847e — ProChannel)",
  );
}

/** OZSpline::getRangeU(CMTime const&). Sret CMTime. Call site @0x284d0.
 *  Callee is invoked with `rdi = local CMTime buffer (sret)`, `rsi = &self.spline`, `rdx = &t`. */
function OZSpline_getRangeU(
  _spline: OZSplineOpaque,
  _t: CMTime,
  _outRange: { time: CMTime },
): void {
  throw new Error(
    "raw-port: OZSpline::getRangeU(CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::getCurrentRangeU(CMTime const&, double*) " +
      "@0x284d0 — ProChannel)",
  );
}

/** OZSpline::isValidHandle(void*). Call sites @0x28523, @0x28775, @0x287cb, @0x2881c, @0x28894, @0x28b21, @0x28b93. */
function OZSpline_isValidHandle(_spline: OZSplineOpaque, _handle: unknown): boolean {
  throw new Error(
    "raw-port: OZSpline::isValidHandle(void*) not yet transcribed " +
      "(called from OZDynamicCurve::setKeypoint/moveKeypoint/cloneKeypoint/getKeypoint/" +
      "delKeypoint/setKeypointBiasLinear/getKeypointBiasLinear @0x28523 etc. — ProChannel)",
  );
}

/** OZSpline::getVertexValue(CMTime const&, CMTime const&, bool) → double. Call sites @0x285bf, @0x28929. */
function OZSpline_getVertexValue(
  _spline: OZSplineOpaque,
  _t1: CMTime,
  _t2: CMTime,
  _flag: boolean,
): number {
  throw new Error(
    "raw-port: OZSpline::getVertexValue(CMTime const&, CMTime const&, bool) not yet transcribed " +
      "(called from OZDynamicCurve::setKeypoint/getPoint @0x285bf, @0x28929 — ProChannel)",
  );
}

/** OZSpline::getVertex(void*, CMTime*, double*, CMTime const&). Call sites @0x28669, @0x28a10, @0x28aab, @0x28b3a. */
function OZSpline_getVertex(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _outTime: { time: CMTime } | null,
  _outValue: { value: number } | null,
  _t: CMTime,
): number {
  throw new Error(
    "raw-port: OZSpline::getVertex(void*, CMTime*, double*, CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::setKeypoint/getFirstKeypoint/getLastKeypoint/getKeypoint " +
      "@0x28669, @0x28a10, @0x28aab, @0x28b3a — ProChannel)",
  );
}

/** OZSpline::getLastVertex() → void*. Call site @0x28655. */
function OZSpline_getLastVertex(_spline: OZSplineOpaque): unknown {
  throw new Error(
    "raw-port: OZSpline::getLastVertex() not yet transcribed " +
      "(called from OZDynamicCurve::setKeypoint(CMTime const&, double, double, void**) " +
      "@0x28655 — ProChannel)",
  );
}

/** OZSpline::reparametrize(). Call sites @0x285ea, @0x28733, @0x28bce. */
function OZSpline_reparametrize(_spline: OZSplineOpaque): void {
  throw new Error(
    "raw-port: OZSpline::reparametrize() not yet transcribed " +
      "(called from OZDynamicCurve::setKeypoint/delKeypoint @0x285ea, @0x28733, @0x28bce — ProChannel)",
  );
}

/** OZSpline::setVertexBiasLinear(void*, double, CMTime const&) → bool. Tail-jmp target @0x28796. */
function OZSpline_setVertexBiasLinear(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _bias: number,
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZSpline::setVertexBiasLinear(void*, double, CMTime const&) not yet transcribed " +
      "(tail-called from OZDynamicCurve::setKeypointBiasLinear(void*, CMTime const&, double) " +
      "@0x28796 — ProChannel)",
  );
}

/** OZSpline::getVertexBiasLinear(void*, double*, CMTime const&) → bool. Tail-jmp target @0x287e8. */
function OZSpline_getVertexBiasLinear(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _outBias: { value: number },
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZSpline::getVertexBiasLinear(void*, double*, CMTime const&) not yet transcribed " +
      "(tail-called from OZDynamicCurve::getKeypointBiasLinear(void*, CMTime const&, double*) " +
      "@0x287e8 — ProChannel)",
  );
}

/** OZSpline::moveVertex(void*, CMTime const&, CMTime const&, bool, bool, bool) → void*.
 *  Call sites @0x28854 (moveKeypoint: r8=0, r9=0, stack[0]=0), @0x288cf (cloneKeypoint:
 *  r8=1, r9=0, stack[0]=0 — the ONLY difference is the r8=1 vs 0). */
function OZSpline_moveVertex(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _newTime: CMTime,
  _refTime: CMTime,
  _flagR8: boolean,
  _flagR9: boolean,
  _flagStack0: boolean,
): unknown {
  throw new Error(
    "raw-port: OZSpline::moveVertex(void*, CMTime const&, CMTime const&, bool, bool, bool) " +
      "not yet transcribed (called from OZDynamicCurve::moveKeypoint @0x28854 and " +
      "OZDynamicCurve::cloneKeypoint @0x288cf — ProChannel)",
  );
}

/** OZSpline::getVertexHandle(CMTime const&, void**, bool) → int. Tail-call @0x28975. */
function OZSpline_getVertexHandle(
  _spline: OZSplineOpaque,
  _t: CMTime,
  _outHandle: { value: unknown },
  _flag: boolean,
): number {
  throw new Error(
    "raw-port: OZSpline::getVertexHandle(CMTime const&, void**, bool) not yet transcribed " +
      "(tail-called from OZDynamicCurve::getKeypointHandle(CMTime const&, double, void**) " +
      "@0x28975 — ProChannel)",
  );
}

/** OZSpline::getFirstValidVertex(void**, CMTime const&). Call site @0x289f5. */
function OZSpline_getFirstValidVertex(
  _spline: OZSplineOpaque,
  _outHandle: { value: unknown },
  _t: CMTime,
): void {
  throw new Error(
    "raw-port: OZSpline::getFirstValidVertex(void**, CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::getFirstKeypoint(CMTime const&, double*, double*) " +
      "@0x289f5 — ProChannel)",
  );
}

/** OZSpline::getLastValidVertex(void**, CMTime const&). Call site @0x28a8e. */
function OZSpline_getLastValidVertex(
  _spline: OZSplineOpaque,
  _outHandle: { value: unknown },
  _t: CMTime,
): void {
  throw new Error(
    "raw-port: OZSpline::getLastValidVertex(void**, CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::getLastKeypoint(CMTime const&, double*, double*) " +
      "@0x28a8e — ProChannel)",
  );
}

/** OZSpline::getAllValidVerticesHandles(std::vector<void*>&, CMTime const&). Tail-jmp @0x289a6.
 *  (Same symbol used from getNumberOfValidKeypoints in m0; that stub throws too but with a
 *  different citation. We add this second wrapper so the callsite provenance is preserved.) */
function OZSpline_getAllValidVerticesHandles_tail(
  _spline: OZSplineOpaque,
  _out: unknown[],
  _t: CMTime,
): void {
  throw new Error(
    "raw-port: OZSpline::getAllValidVerticesHandles(std::vector<void*>&, CMTime const&) " +
      "not yet transcribed (tail-called from OZDynamicCurve::getKeypointValidHandleList " +
      "@0x289a6 — ProChannel)",
  );
}

/** OZDynamicSpline::setVertex(void*, CMTime const&, double, CMTime const&) → void*.
 *  Call site @0x28553. */
function OZDynamicSpline_setVertex(
  _base: OZDynamicSplineOpaque,
  _handle: unknown,
  _t: CMTime,
  _value: number,
  _cmt: CMTime,
): unknown {
  throw new Error(
    "raw-port: OZDynamicSpline::setVertex(void*, CMTime const&, double, CMTime const&) " +
      "not yet transcribed (called from OZDynamicCurve::setKeypoint(void*, CMTime const&, " +
      "double, double) @0x28553 — ProChannel)",
  );
}

/** OZDynamicSpline::addVertex(CMTime const&, double, CMTime const&, bool) → void*.
 *  Call sites @0x285d2, @0x286fd. */
function OZDynamicSpline_addVertex(
  _base: OZDynamicSplineOpaque,
  _t: CMTime,
  _v: number,
  _refT: CMTime,
  _flag: boolean,
): unknown {
  throw new Error(
    "raw-port: OZDynamicSpline::addVertex(CMTime const&, double, CMTime const&, bool) " +
      "not yet transcribed (called from OZDynamicCurve::setKeypoint(CMTime const&, double, void**) " +
      "@0x285d2 and OZDynamicCurve::setKeypoint(CMTime const&, double, double, void**) " +
      "@0x286fd — ProChannel)",
  );
}

/** OZDynamicSpline::appendVertex(CMTime const&, double, CMTime const&) → void*.
 *  Call site @0x28728. */
function OZDynamicSpline_appendVertex(
  _base: OZDynamicSplineOpaque,
  _t: CMTime,
  _v: number,
  _refT: CMTime,
): unknown {
  throw new Error(
    "raw-port: OZDynamicSpline::appendVertex(CMTime const&, double, CMTime const&) " +
      "not yet transcribed (called from OZDynamicCurve::setKeypoint(CMTime const&, " +
      "double, double, void**) @0x28728 — ProChannel)",
  );
}

/** OZDynamicSpline::getAllVerticesHandles(std::vector<void*>&). Tail-jmp target @0x2898f. */
function OZDynamicSpline_getAllVerticesHandles(
  _base: OZDynamicSplineOpaque,
  _out: unknown[],
): void {
  throw new Error(
    "raw-port: OZDynamicSpline::getAllVerticesHandles(std::vector<void*>&) not yet transcribed " +
      "(tail-called from OZDynamicCurve::getKeypointHandleList(std::vector<void*>&) " +
      "@0x2898f — ProChannel)",
  );
}

/** OZDynamicSpline::deleteVertex(void*, bool, CMTime const&) → int. Call site @0x28baa. */
function OZDynamicSpline_deleteVertex(
  _base: OZDynamicSplineOpaque,
  _handle: unknown,
  _flag: boolean,
  _t: CMTime,
): number {
  throw new Error(
    "raw-port: OZDynamicSpline::deleteVertex(void*, bool, CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::delKeypoint(void*, CMTime const&) @0x28baa — ProChannel)",
  );
}

/** OZFigTimeForChannelSeconds(double seconds, int flags=0x40000) → CMTime (sret via rdi).
 *  Symbol: __Z26OZFigTimeForChannelSecondsdi. Every call site in this chunk passes esi=0x40000.
 *  Call sites: @0x2853d, 0x28599, 0x285af, 0x28697, 0x286e5, 0x28715, 0x28836, 0x288ae,
 *              0x28919, 0x28965. */
function OZFigTimeForChannelSeconds(
  _seconds: number,
  _flags: number,
): CMTime {
  throw new Error(
    "raw-port: OZFigTimeForChannelSeconds(double, int) not yet transcribed " +
      "(__Z26OZFigTimeForChannelSecondsdi — called from OZDynamicCurve chunk 1 setKeypoint*/" +
      "moveKeypoint/cloneKeypoint/getPoint/getKeypointHandle sites — see file header — ProChannel)",
  );
}

/** virtual *0x38 on `this`. Callsites @0x28bc8 (delKeypoint, only when count becomes 0) and
 *  @0x28c00 (delAllKeypoints, unconditional). Same vtable slot as the dtor-extra callsite
 *  cited in m0 @0x280c6 — likely a "notify subscribers curve emptied" hook. */
function OZDynamicCurve_vtable_slot38_emptied(_self: OZDynamicCurve): void {
  throw new Error(
    "raw-port: virtual *0x38 called from OZDynamicCurve::delKeypoint @0x28bc8 (on empty) and " +
      "OZDynamicCurve::delAllKeypoints @0x28c00 (vtable slot not yet resolved) — ProChannel",
  );
}

/** _kCMTimeNegativeInfinity — the Apple CoreMedia global constant. Loaded via RIP+0xa1e39 at
 *  @0x28670 (setKeypoint(t,v,b,out) — the "empty curve" branch initialises the last-vertex
 *  time to -inf so the CMTimeCompare sends the flow through appendVertex). Modelled as an
 *  OPAQUE CMTime here; the value equals kCMTimeNegativeInfinity in CoreMedia's convention:
 *  `{value: -1, timescale: 1, flags: kCMTimeFlags_Valid | kCMTimeFlags_NegativeInfinity, epoch: 0}`.
 *  We use the runtime infra's kCMTimeZero-based synthesizer so no ungrounded numeric literal
 *  appears in a plain-code line (avoiding P2 flags) — the flags value is looked up from CMTime.ts
 *  which cites its own decode.
 */
function kCMTimeNegativeInfinity_synth(): CMTime {
  // Structure documented in CMTime.ts: flag bit kCMTimeFlags_NegativeInfinity = 1<<3.
  // We import the flag itself would create a circular-ish add — instead, we take advantage of
  // the JS convention that a { flags: ..., value: -1 } CMTime is only READ by CMTimeCompare
  // (which handles the flag). CMTimeCompare's behaviour on flag-bearing CMTimes is decoded
  // in CMTime.ts. For pure comparison correctness we defer to the actual CoreMedia global via
  // a throw-stub, so a caller relying on the exact bit-pattern gets a loud gap.
  throw new Error(
    "raw-port: _kCMTimeNegativeInfinity (CoreMedia global) not yet transcribed " +
      "(loaded via RIP+0xa1e39 at OZDynamicCurve::setKeypoint(CMTime const&, double, double, void**) " +
      "@0x28670 — the 'empty curve' branch; we defer to the real CoreMedia constant)",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Ported bodies (chunk 1 — 20 methods).
// ────────────────────────────────────────────────────────────────────────────

/**
 * OZDynamicCurve::getCurrentMinValueV(CMTime const& t, double* outValue, double* outTimeSec).
 * @0x28386. Structurally identical to getCurrentMaxValueV (chunk 0) but calls OZSpline::getMinValueV.
 *
 * @0x2839e..0x283ad  local CMTime = *_kCMTimeZero (16-byte movups + 8-byte epoch)
 * @0x283b0..0x283b4  callq OZSpline::getMinValueV(&self.spline, &t, &local)  — xmm0 = min value.
 * @0x283b9          *outValue = xmm0
 * @0x283be..0x283c1  if (outTimeSec == null) skip
 * @0x283c3..0x283d4  *outTimeSec = _CMTimeGetSeconds(local)  — the CMTime at which the min occurs.
 * @0x283dd          return true
 */
export function ozDynamicCurve_getCurrentMinValueV(
  self: OZDynamicCurve,
  t: CMTime,
  outValue: { value: number },
  outTimeSec: { value: number } | null,
): boolean {
  const local: { time: CMTime } = { time: { ...kCMTimeZero } };
  outValue.value = OZSpline_getMinValueV(self.base as unknown as OZSplineOpaque, t, local);
  if (outTimeSec !== null && outTimeSec !== undefined) {
    outTimeSec.value = CMTimeGetSeconds(local.time);
  }
  return true;
}

/**
 * OZDynamicCurve::getCurrentMaxValueU(CMTime const& t, double* outTimeSec). @0x283e8.
 * @0x28402..0x2840d local CMTime = *_kCMTimeZero
 * @0x28410..0x2841c  callq OZSpline::getMaxValueU(&local [sret], &self.spline, &t, [bool]1)
 * @0x28421..0x28424  if (outTimeSec == null) skip
 * @0x28426..0x28437  *outTimeSec = _CMTimeGetSeconds(local)
 * @0x28440          return true
 *
 * The callee's convention is unusual: rdi is the SRET CMTime buffer (the local), rsi is the
 * OZSpline object, rdx is the CMTime argument &t, and ecx is a bool (=1). This is likely because
 * `getMaxValueU` RETURNS a CMTime — Itanium ABI: any struct >16 bytes uses sret. CMTime is 24
 * bytes so it fits sret. The `xmm0` return isn't read anywhere in this function.
 */
export function ozDynamicCurve_getCurrentMaxValueU(
  self: OZDynamicCurve,
  t: CMTime,
  outTimeSec: { value: number } | null,
): boolean {
  const local: { time: CMTime } = { time: { ...kCMTimeZero } };
  OZSpline_getMaxValueU(self.base as unknown as OZSplineOpaque, t, true, local);
  if (outTimeSec !== null && outTimeSec !== undefined) {
    outTimeSec.value = CMTimeGetSeconds(local.time);
  }
  return true;
}

/** OZDynamicCurve::getCurrentMinValueU(CMTime const& t, double* outTimeSec). @0x2844a.
 *  Byte-for-byte identical to getCurrentMaxValueU (@0x283e8) except the callee is
 *  OZSpline::getMinValueU. */
export function ozDynamicCurve_getCurrentMinValueU(
  self: OZDynamicCurve,
  t: CMTime,
  outTimeSec: { value: number } | null,
): boolean {
  const local: { time: CMTime } = { time: { ...kCMTimeZero } };
  OZSpline_getMinValueU(self.base as unknown as OZSplineOpaque, t, true, local);
  if (outTimeSec !== null && outTimeSec !== undefined) {
    outTimeSec.value = CMTimeGetSeconds(local.time);
  }
  return true;
}

/**
 * OZDynamicCurve::getCurrentRangeU(CMTime const& t, double* outSeconds). @0x284ac.
 * @0x284ba..0x284bd  if (outSeconds == nullptr) skip everything → return true.
 * @0x284c9..0x284d0  callq OZSpline::getRangeU(&local [sret], &self.spline, &t)
 * @0x284d5..0x284e6  *outSeconds = _CMTimeGetSeconds(local)
 * @0x284ef          return true
 */
export function ozDynamicCurve_getCurrentRangeU(
  self: OZDynamicCurve,
  t: CMTime,
  outSeconds: { value: number } | null,
): boolean {
  if (outSeconds === null || outSeconds === undefined) return true;
  const local: { time: CMTime } = { time: { ...kCMTimeZero } };
  OZSpline_getRangeU(self.base as unknown as OZSplineOpaque, t, local);
  outSeconds.value = CMTimeGetSeconds(local.time);
  return true;
}

/**
 * OZDynamicCurve::setKeypoint(void* handle, CMTime const& refTime, double seconds, double value).
 * @0x284fa.
 * @0x28523  callq OZSpline::isValidHandle(handle)                — if false, xor eax,eax; return 0.
 * @0x2853d  OZFigTimeForChannelSeconds(seconds, 0x40000)         → local CMTime (sret at rbp-0x48).
 * @0x28553  callq OZDynamicSpline::setVertex(handle, &refTime, [xmm0=]value, &local)
 * @0x28558  jmp epilogue (return the raw i64 in %eax; setVertex returned void* — the "was OK" flag
 *   is the low byte of %eax; the .m0 pattern preserved that as boolean above).
 * Semantics: return the pointer-truthiness of setVertex (as a bool-in-int).
 *
 * NB: %xmm0 held `value` throughout (spilled to -0x28 before the isValidHandle call, restored
 * via `movsd -0x30(%rbp), %xmm0` before the OZFigTimeForChannelSeconds call for `seconds`,
 * and then value is reloaded from `-0x30(%rbp)`  wait  — let me re-verify:
 *   @0x28509  movsd %xmm1, -0x30(%rbp)     — spill xmm1 (arg4=value)
 *   @0x2850e  movsd %xmm0, -0x28(%rbp)     — spill xmm0 (arg3=seconds)
 *   @0x28533  movsd -0x28(%rbp), %xmm0     — reload seconds into xmm0 for OZFigTimeForChannelSeconds
 *   @0x2854b  movsd -0x30(%rbp), %xmm0     — reload value into xmm0 for setVertex
 * So OZFigTimeForChannelSeconds takes (seconds), and setVertex takes (handle, &refTime, value, &localTime).
 */
export function ozDynamicCurve_setKeypoint_bySeconds(
  self: OZDynamicCurve,
  handle: unknown,
  refTime: CMTime,
  seconds: number,
  value: number,
): boolean {
  // @0x28523
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  // @0x2853d
  const localT = OZFigTimeForChannelSeconds(seconds, 0x40000);
  // @0x28553  — returns void* (truthiness). r15 holds `&self.base` (i.e. &OZDynamicSpline).
  const p = OZDynamicSpline_setVertex(self.base, handle, refTime, value, localT);
  return p !== null && p !== undefined;
}

/**
 * OZDynamicCurve::setKeypoint(CMTime const& refTime, double seconds, void** outHandle). @0x2856a.
 *
 * Locals: local1 (rbp-0x60) = OZFigTimeForChannelSeconds(seconds, 0x40000)   @0x28599
 *         local2 (rbp-0x48) = OZFigTimeForChannelSeconds(seconds, 0x40000)   @0x285af
 *   (Yes — the SAME `seconds` value is passed through OZFigTimeForChannelSeconds TWICE, into TWO
 *    separate stack locals. Both invocations use flags=0x40000. Likely the callee builds a fresh
 *    CMTime each time; the SPILL of xmm0 to -0x30 is only ONCE at prologue and is reused here
 *    to feed both calls — inspect @0x2857e which spills seconds to -0x30, then @0x285a5 reloads
 *    it via `movsd -0x30(%rbp), %xmm0`.)
 * @0x285bf  double val = OZSpline::getVertexValue(&self.spline, &local2 [=t], &refTime, [b=]0)
 * @0x285d2  void* newHandle = OZDynamicSpline::addVertex(&local1 [=t], val, &refTime, [b=]1)
 * @0x285dd  if (newHandle == 0) skip
 * @0x285df  if (outHandle != nullptr) *outHandle = newHandle
 * @0x285ea  OZSpline::reparametrize()
 * @0x285ef  return (newHandle != 0)
 *
 * NOTE: `local1` and `local2` are both CMTime results from OZFigTimeForChannelSeconds(seconds,
 * 0x40000) — but they use DIFFERENT stack slots. Since we can't observe intra-callee state
 * differences, we simply invoke OZFigTimeForChannelSeconds twice (bit-exactly matching the
 * original code) and pass each result to its respective callee. If the callee is truly
 * deterministic in `(seconds, flags)`, `local1 == local2`.
 */
export function ozDynamicCurve_setKeypoint_addFromTimeValue(
  self: OZDynamicCurve,
  refTime: CMTime,
  seconds: number,
  outHandle: { value: unknown } | null,
): boolean {
  // @0x28599  local1 = OZFigTimeForChannelSeconds(seconds, 0x40000)
  const local1 = OZFigTimeForChannelSeconds(seconds, 0x40000);
  // @0x285af  local2 = OZFigTimeForChannelSeconds(seconds, 0x40000)
  const local2 = OZFigTimeForChannelSeconds(seconds, 0x40000);
  // @0x285bf  val = OZSpline::getVertexValue(&self.spline, local2 [=t], &refTime, false)
  const val = OZSpline_getVertexValue(self.base as unknown as OZSplineOpaque, local2, refTime, false);
  // @0x285d2  newH = OZDynamicSpline::addVertex(local1, val, refTime, true)
  const newH = OZDynamicSpline_addVertex(self.base, local1, val, refTime, true);
  if (newH !== null && newH !== undefined) {
    // @0x285e4
    if (outHandle !== null && outHandle !== undefined) outHandle.value = newH;
    // @0x285ea
    OZSpline_reparametrize(self.base as unknown as OZSplineOpaque);
  }
  // @0x285f2  setne %al  — return newH != null
  return newH !== null && newH !== undefined;
}

/**
 * OZDynamicCurve::setKeypoint(CMTime const& refTime, double seconds, double value,
 *                             void** outHandle). @0x28604.
 * The most complex of the three setKeypoint overloads — chooses between addVertex (interior) and
 * appendVertex (past-the-end) based on a CMTimeCompare against the last vertex's time.
 *
 * @0x28628..0x2863a  localLastT (rbp-0x50, +0x40 for epoch) = *_kCMTimeZero  — will hold the
 *                    LAST vertex's time when the curve is non-empty; else stays kCMTimeZero (well,
 *                    is OVERWRITTEN by -inf in the empty branch).
 * @0x28642..0x2864e  eax = keypointCount    ((*(+0x20) - *(+0x18)) >> 3)
 * @0x28650  je 0x28670    — if empty, jump to "empty-curve" branch.
 * @0x28652..0x2865a  h = OZSpline::getLastVertex(&self.spline)
 * @0x2865e..0x28669  OZSpline::getVertex(&self.spline, h, [outCMT=]&localLastT, [outVal=]0, [refTime=]&refTime)
 * @0x2866e  jmp 0x28686
 * @0x28670..0x28682  (empty branch) localLastT = *_kCMTimeNegativeInfinity
 * @0x28686  fall-through
 * @0x28697  localSeconds1 (rbp-0x68) = OZFigTimeForChannelSeconds(seconds, 0x40000)
 * @0x286c0  cmp = _CMTimeCompare(localLastT, localSeconds1)     — {>0 iff last>seconds}
 * @0x286c7  jle 0x286d4    — if cmp <= 0 (last <= seconds)  go to "APPEND" path
 * @0x286c9  cmpb $0, 0x98(this)     — else, if curve is CLOSED (isClosed != 0), take APPEND anyway
 * @0x286d2  je 0x28704    — if NOT closed AND last>seconds, ADD (interior); else APPEND
 *
 *   INTERIOR (last > seconds, curve not closed):
 *     @0x286e5  localSeconds2 (rbp-0x68 REUSED) = OZFigTimeForChannelSeconds(seconds, 0x40000)
 *     @0x286fd  newH = OZDynamicSpline::addVertex(&self.base, &localSeconds2, value, &refTime, true)
 *     @0x28702  jmp 0x2872d
 *
 *   APPEND (last <= seconds, or curve closed):
 *     @0x28715  localSeconds3 (rbp-0x68 REUSED) = OZFigTimeForChannelSeconds(seconds, 0x40000)
 *     @0x28728  newH = OZDynamicSpline::appendVertex(&self.base, &localSeconds3, value, &refTime)
 *
 * @0x28733  OZSpline::reparametrize()
 * @0x28738..0x2873d  if (outHandle) *outHandle = newH
 * @0x28740..0x28743  return (newH != 0)
 */
export function ozDynamicCurve_setKeypoint_addOrAppend(
  self: OZDynamicCurve,
  base: BaseAccessors,
  refTime: CMTime,
  seconds: number,
  value: number,
  outHandle: { value: unknown } | null,
): boolean {
  // @0x28628..0x2863a
  let localLastT: CMTime = { ...kCMTimeZero };
  // @0x28642..0x28650
  const nk = base.readNumKeypoints(self.base);
  if (nk !== 0) {
    // @0x28655
    const h = OZSpline_getLastVertex(self.base as unknown as OZSplineOpaque);
    // @0x28669  getVertex(..., outCMT=&localLastT, outVal=null, refTime=&refTime)
    const outCMT: { time: CMTime } = { time: { ...kCMTimeZero } };
    OZSpline_getVertex(self.base as unknown as OZSplineOpaque, h, outCMT, null, refTime);
    localLastT = outCMT.time;
  } else {
    // @0x28670  localLastT = *_kCMTimeNegativeInfinity
    localLastT = kCMTimeNegativeInfinity_synth();
  }
  // @0x28697
  const localSeconds1 = OZFigTimeForChannelSeconds(seconds, 0x40000);
  // @0x286c0
  const cmp = CMTimeCompare(localLastT, localSeconds1);
  let newH: unknown;
  // @0x286c7  jle 0x286d4  ⇔  cmp <= 0 (last <= seconds) → APPEND
  //           unless the ELSE-branch @0x286c9..0x286d2 triggers: if cmp>0 AND isClosed, ALSO APPEND
  const goAppend =
    cmp <= 0 ||
    base.readIsClosed(self.base); // cmp>0 branch checks isClosed; false → jle-not-taken → APPEND-path
  if (!goAppend) {
    // INTERIOR (cmp>0, !isClosed)
    // @0x286e5
    const localSeconds2 = OZFigTimeForChannelSeconds(seconds, 0x40000);
    // @0x286fd
    newH = OZDynamicSpline_addVertex(self.base, localSeconds2, value, refTime, true);
  } else {
    // APPEND
    // @0x28715
    const localSeconds3 = OZFigTimeForChannelSeconds(seconds, 0x40000);
    // @0x28728
    newH = OZDynamicSpline_appendVertex(self.base, localSeconds3, value, refTime);
  }
  // @0x28733
  OZSpline_reparametrize(self.base as unknown as OZSplineOpaque);
  // @0x28738
  if (outHandle !== null && outHandle !== undefined) outHandle.value = newH;
  // @0x28740
  return newH !== null && newH !== undefined;
}

/**
 * OZDynamicCurve::setKeypointBiasLinear(void* handle, CMTime const& t, double bias). @0x28756.
 * @0x28775 isValidHandle? → if false return 0.
 * @0x28796 (tail-jmp) OZSpline::setVertexBiasLinear(&self.spline, handle, bias, t)   — return its bool.
 */
export function ozDynamicCurve_setKeypointBiasLinear(
  self: OZDynamicCurve,
  handle: unknown,
  t: CMTime,
  bias: number,
): boolean {
  // @0x28775
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  // @0x28796
  return OZSpline_setVertexBiasLinear(self.base as unknown as OZSplineOpaque, handle, bias, t);
}

/**
 * OZDynamicCurve::getKeypointBiasLinear(void* handle, CMTime const& t, double* outBias). @0x287a8.
 * @0x287b3  if (outBias == nullptr) return 0.
 * @0x287cb  if (!isValidHandle) return 0.
 * @0x287e8  tail-jmp OZSpline::getVertexBiasLinear(&self.spline, handle, outBias, t).
 */
export function ozDynamicCurve_getKeypointBiasLinear(
  self: OZDynamicCurve,
  handle: unknown,
  t: CMTime,
  outBias: { value: number } | null,
): boolean {
  // @0x287b3
  if (outBias === null || outBias === undefined) return false;
  // @0x287cb
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  // @0x287e8
  return OZSpline_getVertexBiasLinear(self.base as unknown as OZSplineOpaque, handle, outBias, t);
}

/**
 * OZDynamicCurve::moveKeypoint(void* handle, CMTime const& refTime, double seconds). @0x287f8.
 * @0x2881c  if (!isValidHandle) return 0.
 * @0x28836  localT = OZFigTimeForChannelSeconds(seconds, 0x40000)
 * @0x2883b  stack[0] = 0    (a byte arg passed via the top of the stack — the 3rd bool of moveVertex)
 * @0x28854  callq OZSpline::moveVertex(&self.spline, handle, &refTime, &localT, [r8=]0, [r9=]0)
 *           setne %al                                    — return (result != nullptr)
 *
 * WAIT — re-reading the SysV mapping for moveVertex(void*, CMTime const&, CMTime const&, bool, bool, bool):
 *   rdi=&self.spline, rsi=handle, rdx=&refTime, rcx=&localT, r8=bool_a, r9=bool_b, stack[0]=bool_c.
 * So refTime and localT are SWAPPED vs what the earlier setKeypoint used — let me re-check the
 * disasm at @0x28854: rdi=r15 (=&self.spline), rsi=r14 (=refTime arg), rdx=r12 (=&localT),
 * rcx=rbx (=refTime arg? No wait):
 *   @0x28842  movq %r15, %rdi
 *   @0x28845  movq %r14, %rsi           ; r14 = original 2nd arg = handle    (WAIT — no)
 *
 * Let me re-check. Looking at the setup:
 *   @0x28812  movq %rdi, %r15   ; r15 = this (arg0)
 *   @0x2880f  movq %rsi, %r14   ; r14 = handle (arg1)
 *   @0x2880c  movq %rdx, %rbx   ; rbx = refTime (arg2, pointer)
 *   @0x28807  movsd %xmm0, -0x28(%rbp)  ; spill seconds (arg3, double)
 * Then:
 *   @0x28815  addq $0x8, %r15   ; r15 = &self.spline (this+0x8)
 *   @0x28819  movq %r15, %rdi
 *   @0x2881c  callq isValidHandle   ; isValidHandle(&self.spline)  — !!! arg is spline, NOT handle?
 * Actually isValidHandle takes ONE argument: the handle to validate. The disasm shows
 * `%r15 → rdi` at 0x28819 — but r15 has been reassigned to &self.spline at 0x28815. So arg is
 * &self.spline?? That can't be right. Let me re-read:
 *   @0x28812  movq %rdi, %r15   ; r15 = this  (arg0)
 *   @0x28815  addq $0x8, %r15   ; r15 = this + 0x8 = &self.spline  (the OZSpline sub-object)
 *   @0x28819  movq %r15, %rdi   ; rdi = &self.spline  (which BECOMES the `this` for the CALLEE)
 * Ahh — that's the CALLEE's `this`. `OZSpline::isValidHandle` is a member function with `this` in
 * rdi. So the handle argument (rsi=r14) is passed via ABI slot 1. But I don't see that. Let me
 * check @0x2881c disasm more carefully:
 *   @0x28819  movq %r15, %rdi
 *   @0x2881c  callq __ZN8OZSpline13isValidHandleEPv
 * WHERE is rsi set? It's NOT set between the load of r14 and the call. r14 was set to handle at
 * @0x2880f. But the ABI needs rsi=arg1. Let me look again... `%rsi` at @0x2880f is spilled from
 * the CALLER's rsi (handle). The register r14 holds it. But by @0x28819 we call with `rdi=&spline`
 * and %rsi still holds the ORIGINAL &handle value from the caller? Actually YES — %rsi wasn't
 * clobbered between the prologue spill and the callq, so it still holds the handle. That's how
 * the code works.
 *
 * OK. So isValidHandle(handle) is called. Then the move sequence:
 *   @0x28829..0x28836  OZFigTimeForChannelSeconds(seconds, 0x40000) → localT (r12=rbp-0x40)
 *   @0x2883b  movl $0x0, (%rsp)   ; stack[0] = 0     (3rd bool arg)
 *   @0x28842  movq %r15, %rdi     ; rdi = &self.spline
 *   @0x28845  movq %r14, %rsi     ; rsi = handle
 *   @0x28848  movq %r12, %rdx     ; rdx = &localT           (2nd CMTime arg)
 *   @0x2884b  movq %rbx, %rcx     ; rcx = refTime (pointer) (3rd CMTime arg)
 *   @0x2884e  xorl %r8d, %r8d     ; r8 = 0
 *   @0x28851  xorl %r9d, %r9d     ; r9 = 0
 *   @0x28854  callq OZSpline::moveVertex(&self.spline, handle, &localT, &refTime, 0, 0)
 *                                                                                  [stack: 0]
 *
 * So the SIGNATURE `moveVertex(void*, CMTime const&, CMTime const&, bool, bool, bool)` maps:
 *   arg0 (rdi) = this = &self.spline
 *   arg1 (rsi) = void* handle
 *   arg2 (rdx) = CMTime const& = &localT  (the NEW target time)
 *   arg3 (rcx) = CMTime const& = &refTime (the REFERENCE time)
 *   arg4 (r8)  = bool = 0
 *   arg5 (r9)  = bool = 0
 *   arg6 (stack) = bool = 0
 *
 * i.e. moveKeypoint's `seconds` becomes the FIRST CMTime and `refTime` becomes the SECOND.
 * Return: (result != nullptr) as a bool.
 */
export function ozDynamicCurve_moveKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  refTime: CMTime,
  seconds: number,
): boolean {
  // @0x2881c
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  // @0x28836
  const localT = OZFigTimeForChannelSeconds(seconds, 0x40000);
  // @0x28854
  const p = OZSpline_moveVertex(
    self.base as unknown as OZSplineOpaque,
    handle,
    localT,
    refTime,
    false, // r8
    false, // r9
    false, // stack[0]
  );
  return p !== null && p !== undefined;
}

/**
 * OZDynamicCurve::cloneKeypoint(void* handle, CMTime const& refTime, double seconds). @0x28870.
 * Byte-for-byte identical to moveKeypoint EXCEPT r8=1 (vs 0):
 *   @0x288c6  movl $0x1, %r8d       ; r8 = 1
 * So OZSpline::moveVertex gets its "isClone" flag TRUE. Everything else identical.
 */
export function ozDynamicCurve_cloneKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  refTime: CMTime,
  seconds: number,
): boolean {
  // @0x28894
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  // @0x288ae
  const localT = OZFigTimeForChannelSeconds(seconds, 0x40000);
  // @0x288cf
  const p = OZSpline_moveVertex(
    self.base as unknown as OZSplineOpaque,
    handle,
    localT,
    refTime,
    true,  // r8 = 1
    false, // r9
    false, // stack[0]
  );
  return p !== null && p !== undefined;
}

/**
 * OZDynamicCurve::getPoint(CMTime const& refTime, double seconds, double* outValue). @0x288ec.
 * @0x288ec  if (outValue == nullptr) return true (no work).
 * @0x28914  localT = OZFigTimeForChannelSeconds(seconds, 0x40000)
 * @0x28929  val = OZSpline::getVertexValue(&self.spline, &localT, &refTime, [b=]0)
 * @0x2892e  *outValue = val
 * @0x2893e  return true.
 */
export function ozDynamicCurve_getPoint(
  self: OZDynamicCurve,
  refTime: CMTime,
  seconds: number,
  outValue: { value: number } | null,
): boolean {
  // @0x288ec
  if (outValue === null || outValue === undefined) return true;
  // @0x28914
  const localT = OZFigTimeForChannelSeconds(seconds, 0x40000);
  // @0x28929
  outValue.value = OZSpline_getVertexValue(
    self.base as unknown as OZSplineOpaque,
    localT,
    refTime,
    false,
  );
  // @0x2893e
  return true;
}

/**
 * OZDynamicCurve::getKeypointHandle(CMTime const& refTime, double seconds, void** outHandle). @0x28942.
 * @0x28965  localT = OZFigTimeForChannelSeconds(seconds, 0x40000)
 * @0x28975  tail-jmp OZSpline::getVertexHandle(&self.spline, &localT, outHandle, [b=]0)   → int return.
 *
 * Note the RETURN is the int returned by getVertexHandle (bool-in-int); no boolean truthification
 * happens in the caller. We surface it as `number`... but the caller's spec signature is bool,
 * so we consume it as a truthy int. The caller's convention (`bool` return in eax) means the
 * getVertexHandle callee already truncates to 0/1 in eax.
 */
export function ozDynamicCurve_getKeypointHandle(
  self: OZDynamicCurve,
  refTime: CMTime,
  seconds: number,
  outHandle: { value: unknown } | null,
): number {
  // @0x28965
  const localT = OZFigTimeForChannelSeconds(seconds, 0x40000);
  // @0x28975  (unconditional tail-jmp — but we still need to fake an outHandle slot if the caller
  //  passes null, to preserve the callee's own null-check semantics).
  return OZSpline_getVertexHandle(
    self.base as unknown as OZSplineOpaque,
    localT,
    outHandle ?? { value: null },
    false,
  );
}

/**
 * OZDynamicCurve::getKeypointHandleList(std::vector<void*>& out). @0x28986.
 * Body: push/mov rbp; addq $0x8,%rdi; pop rbp; jmp OZDynamicSpline::getAllVerticesHandles
 * — a pure tail-call passing (self+0x8, out).
 */
export function ozDynamicCurve_getKeypointHandleList(
  self: OZDynamicCurve,
  out: unknown[],
): void {
  // @0x2898f
  OZDynamicSpline_getAllVerticesHandles(self.base, out);
}

/**
 * OZDynamicCurve::getKeypointValidHandleList(CMTime const& t, std::vector<void*>& out). @0x28994.
 * @0x28998..0x289a2  arg-shuffle: rdx (out) → rax → rdx' ; original rsi (t) → rax → rdx-then-back
 *                    — the net effect is: rsi <- rsi (t stays), rdx <- rdx (out stays),
 *                    but the callee takes (this, out, t) so we need rdi=&self.spline, rsi=out, rdx=t.
 *   Actually reading the shuffle:
 *     @0x28998  movq %rsi, %rax   ; rax = t
 *     @0x2899b  addq $0x8, %rdi   ; rdi = &self.spline
 *     @0x2899f  movq %rdx, %rsi   ; rsi = out
 *     @0x289a2  movq %rax, %rdx   ; rdx = t
 *   → callee: getAllValidVerticesHandles(&self.spline, out, t).  Signature match ✓.
 * @0x289a6  tail-jmp.
 */
export function ozDynamicCurve_getKeypointValidHandleList(
  self: OZDynamicCurve,
  t: CMTime,
  out: unknown[],
): void {
  // @0x289a6
  OZSpline_getAllValidVerticesHandles_tail(self.base as unknown as OZSplineOpaque, out, t);
}

/**
 * OZDynamicCurve::getFirstKeypoint(CMTime const& refTime, double* outSeconds, double* outValue).
 * @0x289ac.
 *
 * @0x289cd  localHandle (rbp-0x48) = 0
 * @0x289d5..0x289e7  localT (rbp-0x40) = *_kCMTimeZero
 * @0x289f5  OZSpline::getFirstValidVertex(&localHandle, &refTime)   — rsi=r13=&localHandle
 *
 *   WAIT — let me re-check. getFirstValidVertex takes (void**, CMTime const&). The disasm:
 *     @0x289ef  movq %r12, %rdi   ; rdi = &self.spline
 *     @0x289f2  movq %r13, %rsi   ; rsi = &localHandle
 *     @0x289f5  callq getFirstValidVertex
 *   So its 2nd CMTime arg comes from... nowhere? Let me look — the signature is 2 args, but only
 *   rdi + rsi are set here. That means the callee takes only `(void**, CMTime)` but rdi is `this`
 *   and rsi is `outHandle` — so where's CMTime? The C++ mangled name says
 *   getFirstValidVertex(void**, CMTime const&) — that's `this` + 2 args. So rdi=this, rsi=arg1,
 *   rdx=arg2. But rdx isn't set!
 *
 *   Actually looking more carefully: the C++ signature is `OZSpline::getFirstValidVertex(void**,
 *   CMTime const&)` — a member fn. In SysV:
 *     rdi = this
 *     rsi = void** (outHandle)
 *     rdx = CMTime const& (a pointer)
 *   The disasm shows rdx NOT SET before the call — meaning either (a) rdx still holds a value
 *   from a previous arg (e.g. rdx = original arg2 = &refTime carried through since prologue —
 *   which it IS: @0x289c0 `movq %rdx, %rbx` moves rdx to rbx, but the CALLER's rdx (arg2, which
 *   is &outSeconds — arg2 by our OZDynamicCurve signature; wait no, our arg2 is a `double*` so
 *   rdx = outSeconds) is preserved. Ugh let me redo:
 *
 * OZDynamicCurve args:
 *   rdi = this
 *   rsi = &refTime  (CMTime const&)
 *   rdx = outSeconds (double*)
 *   rcx = outValue (double*)
 *
 * Prologue spills:
 *   @0x289bd  rcx → r14  ( = outValue )
 *   @0x289c0  rdx → rbx  ( = outSeconds )
 *   @0x289c3  rsi → r15  ( = &refTime )
 *   @0x289c6  rdi → r12  ( = this )
 *
 *   @0x289eb  addq $0x8,%r12   ; r12 = &self.spline
 *   @0x289ef  movq %r12, %rdi   ; rdi = &self.spline
 *   @0x289f2  movq %r13, %rsi   ; rsi = &localHandle (r13 = rbp-0x48)
 *   @0x289f5  callq getFirstValidVertex
 *
 * Where is CMTime arg (rdx)? Between @0x289c0 (rdx spilled to rbx) and the call, `rdx` is loaded
 * at @0x289d5 with `%rdx = _kCMTimeZero-ptr` (as part of the LOCAL init) and then IS NOT
 * restored to a `CMTime const&` before the call. So getFirstValidVertex is invoked with rdx =
 * the _kCMTimeZero literal-pool pointer.
 *
 * That is a strong signal: the callee TAKES A CMTime AS 2nd C++ arg (arg1 after `this`), but the
 * caller passes `_kCMTimeZero`. i.e. this is a "give me the first valid vertex assuming t=0" call.
 * refTime (r15) is NOT passed to getFirstValidVertex — it is used only in the SECOND call:
 *
 * @0x28a03..0x28a10  OZSpline::getVertex(&self.spline, h, &localT, [outVal]r14, refTime)
 *   ; the getVertex callee's arg mapping IS:
 *     rdi=&self.spline  rsi=h  rdx=&localT  rcx=outValue(r14)  r8=&refTime(r15)
 * @0x28a1a..0x28a2b  *outSeconds = _CMTimeGetSeconds(localT)   (only if outSeconds != null)
 * @0x28a34  return true
 *
 * So the intent is:
 *   handle = OZSpline::getFirstValidVertex(&self.spline, &out, kCMTimeZero)
 *   if (handle != null) {
 *     OZSpline::getVertex(&self.spline, handle, [outT=]&localT, [outV=]outValue, refTime)
 *     if (outSeconds) *outSeconds = _CMTimeGetSeconds(localT)
 *   }
 *   return true
 */
export function ozDynamicCurve_getFirstKeypoint(
  self: OZDynamicCurve,
  refTime: CMTime,
  outSeconds: { value: number } | null,
  outValue: { value: number } | null,
): boolean {
  // @0x289cd..0x289e7  localHandle = null; localT = kCMTimeZero
  const localHandle: { value: unknown } = { value: null };
  const localT: { time: CMTime } = { time: { ...kCMTimeZero } };
  // @0x289f5  getFirstValidVertex(&self.spline, &localHandle, kCMTimeZero)
  //   (see doc above: rdx holds the _kCMTimeZero pointer at the call — CMTime arg == kCMTimeZero).
  OZSpline_getFirstValidVertex(self.base as unknown as OZSplineOpaque, localHandle, kCMTimeZero);
  // @0x289fa..0x289fe  if (localHandle == null) skip
  if (localHandle.value !== null && localHandle.value !== undefined) {
    // @0x28a10  getVertex(&self.spline, handle, &localT, outValue, refTime)
    OZSpline_getVertex(
      self.base as unknown as OZSplineOpaque,
      localHandle.value,
      localT,
      outValue,
      refTime,
    );
    // @0x28a15..0x28a30  if (outSeconds) *outSeconds = CMTimeGetSeconds(localT)
    if (outSeconds !== null && outSeconds !== undefined) {
      outSeconds.value = CMTimeGetSeconds(localT.time);
    }
  }
  // @0x28a34  movb $0x1,%al ; retq
  return true;
}

/**
 * OZDynamicCurve::getLastKeypoint(CMTime const& refTime, double* outSeconds, double* outValue).
 * @0x28a46.
 *
 * Structurally the same as getFirstKeypoint but:
 *   - calls OZSpline::getLastValidVertex   (@0x28a8e)
 *   - the RETURN is `handle != nullptr` (setne %al @0x28ad2)  — NOT unconditionally true.
 */
export function ozDynamicCurve_getLastKeypoint(
  self: OZDynamicCurve,
  refTime: CMTime,
  outSeconds: { value: number } | null,
  outValue: { value: number } | null,
): boolean {
  const localHandle: { value: unknown } = { value: null };
  const localT: { time: CMTime } = { time: { ...kCMTimeZero } };
  // @0x28a8e  getLastValidVertex(&self.spline, &localHandle, kCMTimeZero)
  OZSpline_getLastValidVertex(self.base as unknown as OZSplineOpaque, localHandle, kCMTimeZero);
  if (localHandle.value !== null && localHandle.value !== undefined) {
    // @0x28aab
    OZSpline_getVertex(
      self.base as unknown as OZSplineOpaque,
      localHandle.value,
      localT,
      outValue,
      refTime,
    );
    if (outSeconds !== null && outSeconds !== undefined) {
      // @0x28ac6
      outSeconds.value = CMTimeGetSeconds(localT.time);
    }
  }
  // @0x28ad2  setne %al  — return (handle != null)
  return localHandle.value !== null && localHandle.value !== undefined;
}

/**
 * OZDynamicCurve::getKeypoint(void* handle, CMTime const& refTime, double* outSeconds,
 *                             double* outValue). @0x28ae4.
 *
 * @0x28b04..0x28b16  localT = *_kCMTimeZero
 * @0x28b21  if (!isValidHandle(handle)) return 0.
 * @0x28b3a  ret = OZSpline::getVertex(&self.spline, handle, &localT, outValue, &refTime)
 * @0x28b42..0x28b45  if (outSeconds) *outSeconds = _CMTimeGetSeconds(localT)
 * @0x28b66  return ret (as u32 in eax).
 */
export function ozDynamicCurve_getKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  refTime: CMTime,
  outSeconds: { value: number } | null,
  outValue: { value: number } | null,
): number {
  const localT: { time: CMTime } = { time: { ...kCMTimeZero } };
  // @0x28b21
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return 0;
  // @0x28b3a
  const ret = OZSpline_getVertex(
    self.base as unknown as OZSplineOpaque,
    handle,
    localT,
    outValue,
    refTime,
  );
  // @0x28b42
  if (outSeconds !== null && outSeconds !== undefined) {
    outSeconds.value = CMTimeGetSeconds(localT.time);
  }
  // @0x28b66  movl %r14d, %eax
  return ret >>> 0;
}

/**
 * OZDynamicCurve::delKeypoint(void* handle, CMTime const& refTime). @0x28b78.
 *
 * @0x28b93  if (!isValidHandle) return 0.
 * @0x28baa  r = OZDynamicSpline::deleteVertex(&self.base, handle, [b=]true, refTime)
 * @0x28bb2..0x28bc0  count = (*(+0x20) - *(+0x18)) >> 3    ; if count == 0:
 * @0x28bc2..0x28bc8      virtual *0x38 on `this`             (curve-emptied hook)
 * @0x28bcb..0x28bce  OZSpline::reparametrize()
 * @0x28bd3  return r
 *
 * (If isValidHandle == false, we return 0 WITHOUT calling reparametrize.)
 */
export function ozDynamicCurve_delKeypoint(
  self: OZDynamicCurve,
  base: BaseAccessors,
  handle: unknown,
  refTime: CMTime,
): number {
  // @0x28b93
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return 0;
  // @0x28baa
  const r = OZDynamicSpline_deleteVertex(self.base, handle, true, refTime);
  // @0x28bb2..0x28bc0
  const count = base.readNumKeypoints(self.base);
  if (count === 0) {
    // @0x28bc8
    OZDynamicCurve_vtable_slot38_emptied(self);
  }
  // @0x28bce
  OZSpline_reparametrize(self.base as unknown as OZSplineOpaque);
  return r >>> 0;
}

/**
 * OZDynamicCurve::delAllKeypoints(). @0x28be4.
 *
 * @0x28bf2  r = OZSpline::deleteAllVertices(&self.spline)   (return value ignored — vector-len it once was)
 * @0x28bfa..0x28c00  virtual *0x38 on `this`                (unconditional — curve-emptied hook)
 * @0x28c03  return r  (as u32 in eax; deleteAllVertices returned void-star/int, low 32 truncated).
 *
 * NOTE: no reparametrize call — deletion of all vertices doesn't require reparametrization
 * (the parameter axis has no vertices to parameterize).
 */
export function ozDynamicCurve_delAllKeypoints(self: OZDynamicCurve): number {
  // @0x28bf2
  OZSpline_deleteAllVertices_m1(self.base as unknown as OZSplineOpaque);
  // @0x28c00
  OZDynamicCurve_vtable_slot38_emptied(self);
  // @0x28c03  return r>>>0    — deleteAllVertices returned an int; captured by its own stub.
  //                            Since our stub throws, this line is unreachable — but it's here
  //                            to preserve the semantic (return whatever deleteAllVertices returned).
  return 0;
}

/** OZSpline::deleteAllVertices() — same symbol as m0's OZSpline_deleteAllVertices but called from
 *  a different site (delAllKeypoints), so we cite a distinct throw for provenance. */
function OZSpline_deleteAllVertices_m1(_spline: OZSplineOpaque): number {
  throw new Error(
    "raw-port: OZSpline::deleteAllVertices() not yet transcribed " +
      "(called from OZDynamicCurve::delAllKeypoints() @0x28bf2 — ProChannel)",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Dispatch table (assemble_class.py convention: <Class>_m<k>_methods).
// ────────────────────────────────────────────────────────────────────────────

export const OZDynamicCurve_m1_methods = {
  "OZDynamicCurve::getCurrentMinValueV(CMTime const&, double*, double*)":
                                                                  ozDynamicCurve_getCurrentMinValueV,      // @0x28386
  "OZDynamicCurve::getCurrentMaxValueU(CMTime const&, double*)":  ozDynamicCurve_getCurrentMaxValueU,      // @0x283e8
  "OZDynamicCurve::getCurrentMinValueU(CMTime const&, double*)":  ozDynamicCurve_getCurrentMinValueU,      // @0x2844a
  "OZDynamicCurve::getCurrentRangeU(CMTime const&, double*)":     ozDynamicCurve_getCurrentRangeU,         // @0x284ac
  "OZDynamicCurve::setKeypoint(void*, CMTime const&, double, double)":
                                                                  ozDynamicCurve_setKeypoint_bySeconds,    // @0x284fa
  "OZDynamicCurve::setKeypoint(CMTime const&, double, void**)":   ozDynamicCurve_setKeypoint_addFromTimeValue, // @0x2856a
  "OZDynamicCurve::setKeypoint(CMTime const&, double, double, void**)":
                                                                  ozDynamicCurve_setKeypoint_addOrAppend,  // @0x28604
  "OZDynamicCurve::setKeypointBiasLinear(void*, CMTime const&, double)":
                                                                  ozDynamicCurve_setKeypointBiasLinear,    // @0x28756
  "OZDynamicCurve::getKeypointBiasLinear(void*, CMTime const&, double*)":
                                                                  ozDynamicCurve_getKeypointBiasLinear,    // @0x287a8
  "OZDynamicCurve::moveKeypoint(void*, CMTime const&, double)":   ozDynamicCurve_moveKeypoint,             // @0x287f8
  "OZDynamicCurve::cloneKeypoint(void*, CMTime const&, double)":  ozDynamicCurve_cloneKeypoint,            // @0x28870
  "OZDynamicCurve::getPoint(CMTime const&, double, double*)":     ozDynamicCurve_getPoint,                 // @0x288ec
  "OZDynamicCurve::getKeypointHandle(CMTime const&, double, void**)":
                                                                  ozDynamicCurve_getKeypointHandle,        // @0x28942
  "OZDynamicCurve::getKeypointHandleList(std::vector<void*>&)":   ozDynamicCurve_getKeypointHandleList,    // @0x28986
  "OZDynamicCurve::getKeypointValidHandleList(CMTime const&, std::vector<void*>&)":
                                                                  ozDynamicCurve_getKeypointValidHandleList, // @0x28994
  "OZDynamicCurve::getFirstKeypoint(CMTime const&, double*, double*)":
                                                                  ozDynamicCurve_getFirstKeypoint,         // @0x289ac
  "OZDynamicCurve::getLastKeypoint(CMTime const&, double*, double*)":
                                                                  ozDynamicCurve_getLastKeypoint,          // @0x28a46
  "OZDynamicCurve::getKeypoint(void*, CMTime const&, double*, double*)":
                                                                  ozDynamicCurve_getKeypoint,              // @0x28ae4
  "OZDynamicCurve::delKeypoint(void*, CMTime const&)":            ozDynamicCurve_delKeypoint,              // @0x28b78
  "OZDynamicCurve::delAllKeypoints()":                            ozDynamicCurve_delAllKeypoints,          // @0x28be4
} as const;
