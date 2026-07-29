// raw-port: OZDynamicCurve (chunk m3) — ProChannel.framework (channels layer)
//
// Framework binary: /tmp/ProChannel.x86_64 (macOS FCP x86_64 slice; VA == file offset).
// Chunk 3 ports methods [60..80) of OZDynamicCurve — twenty methods:
//   getKeypointOutputHandles, setKeypointInterpolation, setCurveInterpolation,
//   getCurveInterpolation, getKeypointInterpolation, generateKeypoints, reparametrizeCurve,
//   reverseWindingOrder, getVertexChannel, setVertexChannel, getPreviousKeypointHandle,
//   getNextKeypointHandle, getPreviousValidKeypointHandle (2 overloads),
//   getNextValidKeypointHandle (2 overloads), deriveKeypoint, isValidHandle, flattenCurve,
//   isCurveFlattened.
//
// See OZDynamicCurve.m0.ts for the object layout, base-class opaque brands, and BaseAccessors.
//
// ── New object field recovered in this chunk ──────────────────────────────────────────
//   +0xD8  uint32_t curveInterpolationHint   — set by setCurveInterpolation @0x29365
//                                              (movl %ebx, 0xd8(%r14) after the base call).
//   The m0 layout note (which said the struct ended at +0xD8 with CMTime.epoch spilling to
//   +0xD0..+0xD8) is therefore INCOMPLETE: the OZDynamicCurve object extends past +0xD8 to at
//   least +0xDC. We do not touch OZDynamicCurve.m0.ts here; we surface the field via a caller-
//   injected accessor (see CurveInterpolationHintAccessor below) so BOTH the byte offset and its
//   provenance @0x29365 are preserved without editing the base-class type.
//
// ── Frontier callees new to this chunk (throw-stubs; @0xADDR cited) ──
//   OZSpline::isValidHandle(void*)                                                          @0x292d4, 0x29323, 0x293a0, 0x29429, 0x29473, 0x294bf, 0x2950d, 0x29586, 0x295d2, 0x296e3, 0x29715
//   OZSpline::setInterpolation(unsigned int)                                                @0x29360
//   OZDynamicSpline::getInterpolation(unsigned int*, bool*, bool*)                          @0x2937d (tail-jmp)
//   OZSpline::getVertexInterpolation(void*, unsigned int*, bool*)                           @0x293bd (tail-jmp)
//   OZSpline::setVertexInterpolation(void*, unsigned int)                                   @0x2933e (tail-jmp)
//   OZSpline::generateExtrapolatedVertices(unsigned int, unsigned int, CMTime const&)       @0x293de (tail-jmp)
//   OZSpline::reparametrize()                                                               @0x293ec
//   OZDynamicSpline::reverseWindingOrder(CMTime const&)                                     @0x29405
//   OZDynamicSpline::getVertexChannel(void*)                                                @0x29444
//   OZDynamicSpline::setVertexChannel(void*, OZChannelVertexFolder*)                        @0x29491
//   OZSpline::getPreviousVertex(void*)                                                      @0x294ce
//   OZSpline::getNextVertex(void*)                                                          @0x2951c
//   OZSpline::getPreviousValidVertex(void*, void**, CMTime const&)                          @0x29578
//   OZSpline::getNextValidVertex(void*, void**, CMTime const&)                              @0x295f3
//   OZSpline::getPreviousValidVertex(CMTime const&, void**, CMTime const&, bool)            @0x2965a
//   OZSpline::getNextValidVertex(CMTime const&, void**, CMTime const&, bool)                @0x296b0
//   OZFigTimeForChannelSeconds(double, int) -> CMTime (out-arg)                             @0x29646, 0x2969c
//   OZDynamicSpline::getVertexOutputHandles(void*, double*, double*, CMTime const&, bool)   @0x292f9 (tail-jmp)
//   OZSpline::deriveVertex(void*, CMTime const&)                                            @0x296f9
//   OZDynamicSpline::flattenSpline()                                                        @0x29722
//   OZDynamicSpline::isSplineFlattened()                                                    @0x29735 (tail-jmp)
//   _kCMTimeZero  (Apple CoreMedia global; RIP-relative literal-pool)                       @0x293d6, 0x293fe, 0x296ec
//
// ── The many "return isValidHandle result" shape ──
// Numerous methods (setKeypointInterpolation, getKeypointInterpolation, getKeypointOutputHandles,
// etc.) share the pattern:
//    if (!isValidHandle(h)) return false;
//    return callBase(...); // via tail-jmp so eax comes from the tail call
// The bool result is the tail's return, NOT isValidHandle's — because on the false path the
// function xors %eax and returns; on the true path it tail-jmps and inherits the callee's eax.

import { type CMTime } from "../infra/CMTime.js";
import { kCMTimeZero } from "../infra/CMTime.js";
import {
  type OZDynamicCurve,
  type OZDynamicSplineOpaque,
  type OZSplineOpaque,
} from "./OZDynamicCurve.m0.js";

// ────────────────────────────────────────────────────────────────────────────
// Injected accessors (Spec Rule 5) — surface fields of the base sub-objects we
// haven't typed yet without editing OZDynamicCurve.m0.ts.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Accessor for the u32 field at OZDynamicCurve+0xD8 ("curveInterpolationHint" — recovered from
 * setCurveInterpolation @0x29365 `movl %ebx, 0xd8(%r14)`). Caller injects to isolate the byte-
 * offset write from the not-yet-typed struct tail.
 */
export interface CurveInterpolationHintAccessor {
  /** Write self+0xD8 <- (uint32) interp @0x29365. */
  writeHint(self: OZDynamicCurve, interp: number): void;
  /** Read self+0xD8 (used nowhere in this chunk; provided for symmetry). */
  readHint(self: OZDynamicCurve): number;
}

// Opaque brand for OZChannelVertexFolder — a not-yet-ported class whose pointers surface through
// the get/setVertexChannel accessors.
export type OZChannelVertexFolderOpaque = { readonly __brand: "OZChannelVertexFolder" };

// ────────────────────────────────────────────────────────────────────────────
// Undecoded frontier callees (Spec Rule 3). Every stub cites the addr it defers.
// ────────────────────────────────────────────────────────────────────────────

/** OZSpline::isValidHandle(void*). Also stubbed in m1/m2 — re-stubbed for m3 provenance.
 *  Call sites in m3: @0x292d4, 0x29323, 0x293a0, 0x29429, 0x29473, 0x294bf, 0x2950d, 0x29586,
 *  0x295d2, 0x296e3, 0x29715 (all through the OZSpline+0x8 sub-object). */
function OZSpline_isValidHandle(_spline: OZSplineOpaque, _handle: unknown): boolean {
  throw new Error(
    "raw-port: OZSpline::isValidHandle(void*) not yet transcribed " +
      "(called from OZDynamicCurve chunk 3 accessors — many sites — ProChannel)",
  );
}

/** OZSpline::setInterpolation(unsigned int). Call site @0x29360. */
function OZSpline_setInterpolation(_spline: OZSplineOpaque, _interp: number): void {
  throw new Error(
    "raw-port: OZSpline::setInterpolation(unsigned int) not yet transcribed " +
      "(called from OZDynamicCurve::setCurveInterpolation(unsigned int) @0x29360 — ProChannel)",
  );
}

/** OZDynamicSpline::getInterpolation(unsigned int*, bool*, bool*). Tail-jmp @0x2937d. */
function OZDynamicSpline_getInterpolation(
  _base: OZDynamicSplineOpaque,
  _outInterp: { value: number } | null,
  _outHasPerKeypoint: { value: boolean } | null,
  _outIsMixed: { value: boolean } | null,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::getInterpolation(unsigned int*, bool*, bool*) not yet transcribed " +
      "(tail-called from OZDynamicCurve::getCurveInterpolation(unsigned int*, bool*, bool*) " +
      "@0x2937d — ProChannel)",
  );
}

/** OZSpline::getVertexInterpolation(void*, unsigned int*, bool*). Tail-jmp @0x293bd. */
function OZSpline_getVertexInterpolation(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _outInterp: { value: number } | null,
  _outHasPer: { value: boolean } | null,
): boolean {
  throw new Error(
    "raw-port: OZSpline::getVertexInterpolation(void*, unsigned int*, bool*) not yet transcribed " +
      "(tail-called from OZDynamicCurve::getKeypointInterpolation(void*, unsigned int*, bool*) " +
      "@0x293bd — ProChannel)",
  );
}

/** OZSpline::setVertexInterpolation(void*, unsigned int). Tail-jmp @0x2933e. */
function OZSpline_setVertexInterpolation(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _interp: number,
): boolean {
  throw new Error(
    "raw-port: OZSpline::setVertexInterpolation(void*, unsigned int) not yet transcribed " +
      "(tail-called from OZDynamicCurve::setKeypointInterpolation(void*, unsigned int) " +
      "@0x2933e — ProChannel)",
  );
}

/** OZSpline::generateExtrapolatedVertices(unsigned int, unsigned int, CMTime const&).
 *  Tail-jmp @0x293de with rcx = &_kCMTimeZero (loaded @0x293d6). */
function OZSpline_generateExtrapolatedVertices(
  _spline: OZSplineOpaque,
  _a: number,
  _b: number,
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZSpline::generateExtrapolatedVertices(unsigned int, unsigned int, CMTime const&) " +
      "not yet transcribed (tail-called from OZDynamicCurve::generateKeypoints(unsigned int, " +
      "unsigned int) @0x293de with t=kCMTimeZero — ProChannel)",
  );
}

/** OZSpline::reparametrize(). Call site @0x293ec. */
function OZSpline_reparametrize(_spline: OZSplineOpaque): void {
  throw new Error(
    "raw-port: OZSpline::reparametrize() not yet transcribed " +
      "(called from OZDynamicCurve::reparametrizeCurve() @0x293ec — ProChannel)",
  );
}

/** OZDynamicSpline::reverseWindingOrder(CMTime const&). Call site @0x29405 with rsi=&_kCMTimeZero. */
function OZDynamicSpline_reverseWindingOrder(_base: OZDynamicSplineOpaque, _t: CMTime): void {
  throw new Error(
    "raw-port: OZDynamicSpline::reverseWindingOrder(CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::reverseWindingOrder() @0x29405 with t=kCMTimeZero — ProChannel)",
  );
}

/** OZDynamicSpline::getVertexChannel(void*). Call site @0x29444. Returns OZChannelVertexFolder*. */
function OZDynamicSpline_getVertexChannel(
  _base: OZDynamicSplineOpaque,
  _handle: unknown,
): OZChannelVertexFolderOpaque | null {
  throw new Error(
    "raw-port: OZDynamicSpline::getVertexChannel(void*) not yet transcribed " +
      "(called from OZDynamicCurve::getVertexChannel(void*, OZChannelVertexFolder**) " +
      "@0x29444 — ProChannel)",
  );
}

/** OZDynamicSpline::setVertexChannel(void*, OZChannelVertexFolder*). Call site @0x29491. */
function OZDynamicSpline_setVertexChannel(
  _base: OZDynamicSplineOpaque,
  _handle: unknown,
  _folder: OZChannelVertexFolderOpaque,
): void {
  throw new Error(
    "raw-port: OZDynamicSpline::setVertexChannel(void*, OZChannelVertexFolder*) not yet transcribed " +
      "(called from OZDynamicCurve::setVertexChannel(void*, OZChannelVertexFolder*) " +
      "@0x29491 — ProChannel)",
  );
}

/** OZSpline::getPreviousVertex(void*). Call site @0x294ce. Returns void* (previous vertex handle). */
function OZSpline_getPreviousVertex(_spline: OZSplineOpaque, _handle: unknown): unknown {
  throw new Error(
    "raw-port: OZSpline::getPreviousVertex(void*) not yet transcribed " +
      "(called from OZDynamicCurve::getPreviousKeypointHandle(CMTime const&, void*, void**) " +
      "@0x294ce — ProChannel)",
  );
}

/** OZSpline::getNextVertex(void*). Call site @0x2951c. Returns void*. */
function OZSpline_getNextVertex(_spline: OZSplineOpaque, _handle: unknown): unknown {
  throw new Error(
    "raw-port: OZSpline::getNextVertex(void*) not yet transcribed " +
      "(called from OZDynamicCurve::getNextKeypointHandle(CMTime const&, void*, void**) " +
      "@0x2951c — ProChannel)",
  );
}

/** OZSpline::getPreviousValidVertex(void*, void**, CMTime const&). Call site @0x29578.
 *  Writes an out-handle into *rdx (the second arg) and returns void (result read from *outSlot). */
function OZSpline_getPreviousValidVertex_h(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _outSlot: { value: unknown },
  _refT: CMTime,
): void {
  throw new Error(
    "raw-port: OZSpline::getPreviousValidVertex(void*, void**, CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::getPreviousValidKeypointHandle(CMTime const&, void*, void**) " +
      "@0x29578 — ProChannel)",
  );
}

/** OZSpline::getNextValidVertex(void*, void**, CMTime const&). Call site @0x295f3. */
function OZSpline_getNextValidVertex_h(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _outSlot: { value: unknown },
  _refT: CMTime,
): void {
  throw new Error(
    "raw-port: OZSpline::getNextValidVertex(void*, void**, CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::getNextValidKeypointHandle(CMTime const&, void*, void**) " +
      "@0x295f3 — ProChannel)",
  );
}

/** OZSpline::getPreviousValidVertex(CMTime const&, void**, CMTime const&, bool). Call site @0x2965a. */
function OZSpline_getPreviousValidVertex_t(
  _spline: OZSplineOpaque,
  _t: CMTime,
  _outHandlePP: { value: unknown },
  _refT: CMTime,
  _b: boolean,
): void {
  throw new Error(
    "raw-port: OZSpline::getPreviousValidVertex(CMTime const&, void**, CMTime const&, bool) " +
      "not yet transcribed (called from OZDynamicCurve::getPreviousValidKeypointHandle(" +
      "CMTime const&, double, void**) @0x2965a — ProChannel)",
  );
}

/** OZSpline::getNextValidVertex(CMTime const&, void**, CMTime const&, bool). Call site @0x296b0. */
function OZSpline_getNextValidVertex_t(
  _spline: OZSplineOpaque,
  _t: CMTime,
  _outHandlePP: { value: unknown },
  _refT: CMTime,
  _b: boolean,
): void {
  throw new Error(
    "raw-port: OZSpline::getNextValidVertex(CMTime const&, void**, CMTime const&, bool) " +
      "not yet transcribed (called from OZDynamicCurve::getNextValidKeypointHandle(" +
      "CMTime const&, double, void**) @0x296b0 — ProChannel)",
  );
}

/** OZFigTimeForChannelSeconds(double seconds, int flags) -> CMTime (via hidden out-ptr rdi).
 *  Symbol: __Z26OZFigTimeForChannelSecondsdi. Call sites @0x29646, 0x2969c.
 *  Both call sites pass flags = 0x40000; the caller's `seconds` is live in %xmm0 and forwarded. */
function OZFigTimeForChannelSeconds(_seconds: number, _flags: number): CMTime {
  throw new Error(
    "raw-port: OZFigTimeForChannelSeconds(double, int) not yet transcribed " +
      "(called from OZDynamicCurve::getPreviousValidKeypointHandle @0x29646 and " +
      "OZDynamicCurve::getNextValidKeypointHandle @0x2969c, both with flags=0x40000 — ProChannel)",
  );
}

/** OZDynamicSpline::getVertexOutputHandles(void*, double*, double*, CMTime const&, bool).
 *  Tail-jmp @0x292f9. Mirrors getVertexInputHandles (used in m2). */
function OZDynamicSpline_getVertexOutputHandles(
  _base: OZDynamicSplineOpaque,
  _handle: unknown,
  _outA: { value: number } | null,
  _outB: { value: number } | null,
  _t: CMTime,
  _b: boolean,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::getVertexOutputHandles(void*, double*, double*, CMTime const&, " +
      "bool) not yet transcribed (tail-called from OZDynamicCurve::getKeypointOutputHandles(" +
      "void*, CMTime const&, double*) @0x292f9 — ProChannel)",
  );
}

/** OZSpline::deriveVertex(void*, CMTime const&). Call site @0x296f9. */
function OZSpline_deriveVertex(_spline: OZSplineOpaque, _handle: unknown, _t: CMTime): void {
  throw new Error(
    "raw-port: OZSpline::deriveVertex(void*, CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::deriveKeypoint(void*) @0x296f9 with t=kCMTimeZero — ProChannel)",
  );
}

/** OZDynamicSpline::flattenSpline(). Call site @0x29722. */
function OZDynamicSpline_flattenSpline(_base: OZDynamicSplineOpaque): void {
  throw new Error(
    "raw-port: OZDynamicSpline::flattenSpline() not yet transcribed " +
      "(called from OZDynamicCurve::flattenCurve() @0x29722 — ProChannel)",
  );
}

/** OZDynamicSpline::isSplineFlattened(). Tail-jmp @0x29735. */
function OZDynamicSpline_isSplineFlattened(_base: OZDynamicSplineOpaque): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::isSplineFlattened() not yet transcribed " +
      "(tail-called from OZDynamicCurve::isCurveFlattened() @0x29735 — ProChannel)",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Ported bodies (chunk 3 — 20 methods).
// ────────────────────────────────────────────────────────────────────────────

/**
 * OZDynamicCurve::getKeypointOutputHandles(void* handle, CMTime const& t, double* outBias). @0x292b6.
 *
 * Byte-for-byte mirror of getKeypointInputHandles (ported in m2 @0x29262) except the tail-jmp
 * target is OZDynamicSpline::getVertexOutputHandles.
 *
 * Prologue:  rcx->r14 (outBias); rdx->rbx (&t); rsi->r15 (handle); rdi->r12 (this); r12 += 8 (&self.base).
 * Guard:     if (!OZSpline::isValidHandle(&self.base, handle)) return false.  @0x292d4
 * Tail call: OZDynamicSpline::getVertexOutputHandles(&self.base, handle, outA=null,
 *              outB=outBias, &t, b=true).                                      @0x292f9
 *   (rdx = 0 sets outA to null; rcx = r14 = outBias; r8 = rbx = &t; r9d = 1.)
 */
export function ozDynamicCurve_getKeypointOutputHandles(
  self: OZDynamicCurve,
  handle: unknown,
  t: CMTime,
  outBias: { value: number } | null,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  return OZDynamicSpline_getVertexOutputHandles(self.base, handle, null, outBias, t, true);
}

/**
 * OZDynamicCurve::setKeypointInterpolation(void* handle, unsigned int interp). @0x2930a.
 *
 * Prologue:  edx->ebx (interp); rsi->r14 (handle); rdi->r15 (this); r15 += 8 (&self.base).
 * Guard:     if (!OZSpline::isValidHandle(&self.base, handle)) return false;  @0x29323
 * Tail call: OZSpline::setVertexInterpolation(&self.base, handle, interp).    @0x2933e
 *   (rdi = &self.base; rsi = handle; edx = interp.)
 * Return: bool (the callee's eax, forwarded via tail-jmp).
 */
export function ozDynamicCurve_setKeypointInterpolation(
  self: OZDynamicCurve,
  handle: unknown,
  interp: number,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  return OZSpline_setVertexInterpolation(self.base as unknown as OZSplineOpaque, handle, interp);
}

/**
 * OZDynamicCurve::setCurveInterpolation(unsigned int interp). @0x29350.
 *
 * @0x29357  movl %esi, %ebx           - spill interp
 * @0x29359  movq %rdi, %r14           - spill this
 * @0x2935c  addq $0x8, %rdi           - rdi = &self.base
 * @0x29360  callq OZSpline::setInterpolation(interp)
 * @0x29365  movl %ebx, 0xd8(%r14)     - this.curveInterpolationHint = interp    (NEW FIELD +0xD8)
 * @0x2936c  movb $0x1, %al            - return true.
 *
 * The +0xD8 write is DECLARED here (see CurveInterpolationHintAccessor above); the caller
 * supplies the writer closure so we don't leak the byte offset outside this file.
 */
export function ozDynamicCurve_setCurveInterpolation(
  self: OZDynamicCurve,
  interp: number,
  acc: CurveInterpolationHintAccessor,
): boolean {
  // @0x29360
  OZSpline_setInterpolation(self.base as unknown as OZSplineOpaque, interp);
  // @0x29365  self+0xD8 <- (uint32) interp
  acc.writeHint(self, interp >>> 0);
  // @0x2936c
  return true;
}

/**
 * OZDynamicCurve::getCurveInterpolation(unsigned int* outInterp, bool* outHasPerKeypoint,
 *                                       bool* outIsMixed). @0x29374.
 *
 * @0x29378  addq $0x8, %rdi         - rdi = &self.base   (OZDynamicSpline*)
 * @0x2937d  jmp  OZDynamicSpline::getInterpolation(unsigned int*, bool*, bool*)
 *
 * Straight tail-jmp; rax = callee's rax.
 */
export function ozDynamicCurve_getCurveInterpolation(
  self: OZDynamicCurve,
  outInterp: { value: number } | null,
  outHasPerKeypoint: { value: boolean } | null,
  outIsMixed: { value: boolean } | null,
): boolean {
  return OZDynamicSpline_getInterpolation(self.base, outInterp, outHasPerKeypoint, outIsMixed);
}

/**
 * OZDynamicCurve::getKeypointInterpolation(void* handle, unsigned int* outInterp, bool* outHasPer).
 * @0x29382.
 *
 * Prologue:  rcx->rbx (outHasPer); rdx->r14 (outInterp); rsi->r15 (handle); rdi->r12 (this);
 *            r12 += 8 (&self.base).
 * Guard:     if (!OZSpline::isValidHandle(&self.base, handle)) return false;   @0x293a0
 * Tail call: OZSpline::getVertexInterpolation(&self.base, handle, outInterp, outHasPer). @0x293bd
 */
export function ozDynamicCurve_getKeypointInterpolation(
  self: OZDynamicCurve,
  handle: unknown,
  outInterp: { value: number } | null,
  outHasPer: { value: boolean } | null,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  return OZSpline_getVertexInterpolation(
    self.base as unknown as OZSplineOpaque,
    handle,
    outInterp,
    outHasPer,
  );
}

/**
 * OZDynamicCurve::generateKeypoints(unsigned int a, unsigned int b). @0x293ce.
 *
 * @0x293d2  addq $0x8, %rdi       - rdi = &self.base
 * @0x293d6  movq 0xa10e3(%rip), %rcx    ## _kCMTimeZero  (3rd-arg-by-ref)
 * @0x293de  jmp   OZSpline::generateExtrapolatedVertices(unsigned int, unsigned int, CMTime const&)
 *
 * Tail-jmp; refT = kCMTimeZero.
 */
export function ozDynamicCurve_generateKeypoints(
  self: OZDynamicCurve,
  a: number,
  b: number,
): boolean {
  return OZSpline_generateExtrapolatedVertices(
    self.base as unknown as OZSplineOpaque,
    a,
    b,
    kCMTimeZero,
  );
}

/**
 * OZDynamicCurve::reparametrizeCurve(). @0x293e4.
 *
 * @0x293e8  addq $0x8, %rdi
 * @0x293ec  callq OZSpline::reparametrize()
 * @0x293f1  movb  $0x1, %al          - return true
 */
export function ozDynamicCurve_reparametrizeCurve(self: OZDynamicCurve): boolean {
  OZSpline_reparametrize(self.base as unknown as OZSplineOpaque);
  return true;
}

/**
 * OZDynamicCurve::reverseWindingOrder(). @0x293f6.
 *
 * @0x293fa  addq $0x8, %rdi
 * @0x293fe  movq 0xa10bb(%rip), %rsi         ## _kCMTimeZero
 * @0x29405  callq OZDynamicSpline::reverseWindingOrder(CMTime const&)
 * @0x2940a  movb  $0x1, %al                   - return true
 */
export function ozDynamicCurve_reverseWindingOrder(self: OZDynamicCurve): boolean {
  OZDynamicSpline_reverseWindingOrder(self.base, kCMTimeZero);
  return true;
}

/**
 * OZDynamicCurve::getVertexChannel(void* handle, OZChannelVertexFolder** outFolder). @0x2940e.
 *
 * @0x29419  rdx->rbx (outFolder), rsi->r14 (handle), rdi->r15 (this); r15 += 8 (&self.base).
 * @0x29426..0x2942e  al = OZSpline::isValidHandle(&self.base, handle)
 * @0x2942e  testq %rbx, %rbx   - r12b = (outFolder != null)
 * @0x29435  andb  %al, %r12b   - r12b = isValid && (outFolder != null)
 * @0x29438  cmpb  $0x1, %r12b  - jne skip
 * @0x29444  callq OZDynamicSpline::getVertexChannel(&self.base, handle) -> rax
 * @0x29449  movq  %rax, (%rbx)  - *outFolder = rax
 * @0x2944c  movl  %r12d, %eax   - return the guard (isValid && outFolder!=null).
 *
 * NOTE: The return is the CONJOINED guard, NOT isValidHandle alone — a null outFolder short-
 * circuits and yields false even if the handle IS valid. This matches Motion's "you must give me
 * an out-ptr for me to consider the call successful" convention (also seen in setVertexChannel).
 */
export function ozDynamicCurve_getVertexChannel(
  self: OZDynamicCurve,
  handle: unknown,
  outFolder: { value: OZChannelVertexFolderOpaque | null } | null,
): boolean {
  // @0x29426  al = isValidHandle(&self.base, handle)
  const isValid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  // @0x2942e..0x29435  guard = isValid && (outFolder != null)
  const guard = isValid && outFolder !== null;
  // @0x29438..0x2944c  if guard: *outFolder = getVertexChannel(...)
  if (guard) {
    const folder = OZDynamicSpline_getVertexChannel(self.base, handle);
    (outFolder as { value: OZChannelVertexFolderOpaque | null }).value = folder;
  }
  return guard;
}

/**
 * OZDynamicCurve::setVertexChannel(void* handle, OZChannelVertexFolder* folder). @0x29458.
 *
 * Same guard shape as getVertexChannel: guard = isValid && (folder != null).
 * @0x29491  if guard: OZDynamicSpline::setVertexChannel(&self.base, handle, folder).
 * @0x29496  return guard (r12b).
 */
export function ozDynamicCurve_setVertexChannel(
  self: OZDynamicCurve,
  handle: unknown,
  folder: OZChannelVertexFolderOpaque | null,
): boolean {
  const isValid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  const guard = isValid && folder !== null;
  if (guard) {
    OZDynamicSpline_setVertexChannel(self.base, handle, folder as OZChannelVertexFolderOpaque);
  }
  return guard;
}

/**
 * OZDynamicCurve::getPreviousKeypointHandle(CMTime const& t, void* handle, void** outHandlePP).
 * @0x294a2.
 *
 * SysV arg map: rdi=this, rsi=&t, rdx=handle, rcx=outHandlePP.
 *   @0x294ac  movq %rcx, %rbx    ; rbx = outHandlePP
 *   @0x294af  movq %rdx, %r14    ; r14 = handle
 *   @0x294b2  movq %rdi, %r15    ; r15 = this
 *   @0x294b5  addq $0x8, %r15    ; r15 = &self.base
 *   @0x294b9  movq %r15, %rdi    ; rdi = &self.base
 *   @0x294bc  movq %rdx, %rsi    ; rsi = handle (rdx is still handle from entry)
 *   @0x294bf  callq OZSpline::isValidHandle(&self.base, handle)
 *   @0x294c4  testb %al, %al          - jz false-path
 *   @0x294c8  callq OZSpline::getPreviousVertex(&self.base, handle) -> rax   @0x294ce
 *   @0x294d3  testq %rbx, %rbx        - if outHandlePP != null:
 *   @0x294d8    movq %rax, (%rbx)      - *outHandlePP = rax
 *   @0x294db  testq %rax, %rax
 *   @0x294de  setne %al               - return (rax != nullptr)
 *
 * The `t` argument is ACCEPTED but IGNORED. We preserve the signature (Rule 6).
 */
export function ozDynamicCurve_getPreviousKeypointHandle(
  self: OZDynamicCurve,
  _t: CMTime,
  handle: unknown,
  outHandlePP: { value: unknown } | null,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  const rax = OZSpline_getPreviousVertex(self.base as unknown as OZSplineOpaque, handle);
  if (outHandlePP !== null) outHandlePP.value = rax;
  return rax !== null && rax !== undefined;
}

/**
 * OZDynamicCurve::getNextKeypointHandle(CMTime const& t, void* handle, void** outHandlePP).
 * @0x294f0.
 *
 * Byte-for-byte identical to getPreviousKeypointHandle except the call at @0x2951c is
 * OZSpline::getNextVertex (not getPreviousVertex).
 */
export function ozDynamicCurve_getNextKeypointHandle(
  self: OZDynamicCurve,
  _t: CMTime,
  handle: unknown,
  outHandlePP: { value: unknown } | null,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  const rax = OZSpline_getNextVertex(self.base as unknown as OZSplineOpaque, handle);
  if (outHandlePP !== null) outHandlePP.value = rax;
  return rax !== null && rax !== undefined;
}

/**
 * OZDynamicCurve::getPreviousValidKeypointHandle(CMTime const& t, void* handle, void** outHandlePP).
 * @0x2953e.
 *
 * Disasm shape (35 lines):
 *   @0x29551  movq %rcx, %rbx           ; outHandlePP
 *   @0x29554  movq %rdx, %r15           ; handle
 *   @0x29557  movq %rsi, %r14           ; &t
 *   @0x2955a  movq %rdi, %r12           ; this
 *   @0x2955d  addq $0x8, %r12           ; &self.base
 *   @0x29561  movq %r12, %rdi
 *   @0x29564  movq %rdx, %rsi           ; rsi = handle
 *   @0x29567..@0x29586  callq OZSpline::isValidHandle(&self.base, handle)
 *   je 0x295a1                          ; false-path
 *   leaq -0x30(%rbp), %r13    ; &local (stack slot for the "out" void*)
 *   movq $0, (%r13)           ; local = null
 *   callq OZSpline::getPreviousValidVertex(&self.base, handle, &local, refT) @0x29578
 *   movq (%r13), %rax         ; rax = local
 *   testq %rbx, %rbx          ; if outHandlePP != null:
 *   movq %rax, (%rbx)         ;   *outHandlePP = local
 *   testq %rax, %rax
 *   setne %al                 ; return (local != nullptr)
 */
export function ozDynamicCurve_getPreviousValidKeypointHandle_h(
  self: OZDynamicCurve,
  t: CMTime,
  handle: unknown,
  outHandlePP: { value: unknown } | null,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  const local: { value: unknown } = { value: null };
  OZSpline_getPreviousValidVertex_h(
    self.base as unknown as OZSplineOpaque,
    handle,
    local,
    t,
  );
  if (outHandlePP !== null) outHandlePP.value = local.value;
  return local.value !== null && local.value !== undefined;
}

/**
 * OZDynamicCurve::getNextValidKeypointHandle(CMTime const& t, void* handle, void** outHandlePP).
 * @0x295ae. Byte-for-byte mirror of the Previous variant, calling OZSpline::getNextValidVertex
 * (void*, void**, CMTime const&) @0x295f3 in place of the previous-vertex variant.
 */
export function ozDynamicCurve_getNextValidKeypointHandle_h(
  self: OZDynamicCurve,
  t: CMTime,
  handle: unknown,
  outHandlePP: { value: unknown } | null,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  const local: { value: unknown } = { value: null };
  OZSpline_getNextValidVertex_h(
    self.base as unknown as OZSplineOpaque,
    handle,
    local,
    t,
  );
  if (outHandlePP !== null) outHandlePP.value = local.value;
  return local.value !== null && local.value !== undefined;
}

/**
 * OZDynamicCurve::getPreviousValidKeypointHandle(CMTime const& t, double seconds, void** outHandlePP).
 * @0x2961e.
 *
 *   @0x2962d  movq %rdx, %rbx                 ; rbx = outHandlePP
 *   @0x29630  movq %rsi, %r14                 ; r14 = &t (refCMTime)
 *   @0x29633  movq %rdi, %r15                 ; r15 = this
 *   @0x29636  addq $0x8, %r15                 ; r15 = &self.base
 *   @0x2963a  leaq -0x38(%rbp), %r12          ; r12 = &localCMTime (16-byte stack slot)
 *   @0x2963e  movq %r12, %rdi                 ; rdi = &localCMTime (hidden 1st arg for struct return)
 *   @0x29641  movl $0x40000, %esi             ; esi = flags (0x40000)
 *   @0x29646  callq OZFigTimeForChannelSeconds ; *r12 = OZFigTimeForChannelSeconds(seconds_in_xmm0, 0x40000)
 *   @0x2964b  movq %r15, %rdi                 ; rdi = &self.base
 *   @0x2964e  movq %r12, %rsi                 ; rsi = &localCMTime
 *   @0x29651  movq %rbx, %rdx                 ; rdx = outHandlePP
 *   @0x29654  movq %r14, %rcx                 ; rcx = refT
 *   @0x29657  xorl %r8d, %r8d                 ; r8 = 0 (bool false)
 *   @0x2965a  callq OZSpline::getPreviousValidVertex(&self.base, &localCMTime, outHandlePP, refT, false)
 *   @0x2965f  cmpq $0, (%rbx)                 ; rbx is outHandlePP
 *   @0x29663  setne %al                       ; return (*outHandlePP != nullptr)
 *
 * Unlike the (void*, void**) overload (which staged through r13/&local), this variant passes
 * outHandlePP directly as the 3rd arg and reads it back after the call. The caller MUST pass a
 * non-null outHandlePP (there's no null-check); if outHandlePP is null this dereferences a null
 * pointer — that's Apple's contract, we preserve it (Rule 1).
 *
 * OZFigTimeForChannelSeconds signature (from mangled name `_Z26OZFigTimeForChannelSecondsdi`
 * — `d` = double, `i` = int): void OZFigTimeForChannelSeconds(CMTime* out, double seconds, int flags).
 */
export function ozDynamicCurve_getPreviousValidKeypointHandle_d(
  self: OZDynamicCurve,
  t: CMTime,
  seconds: number,
  outHandlePP: { value: unknown },
): boolean {
  // @0x29646  local = OZFigTimeForChannelSeconds(seconds, 0x40000)
  const local = OZFigTimeForChannelSeconds(seconds, 0x40000);
  // @0x2965a  OZSpline::getPreviousValidVertex(&self.base, &local, outHandlePP, refT, false)
  OZSpline_getPreviousValidVertex_t(
    self.base as unknown as OZSplineOpaque,
    local,
    outHandlePP,
    t,
    false,
  );
  // @0x2965f..0x29663  return (*outHandlePP != nullptr)
  return outHandlePP.value !== null && outHandlePP.value !== undefined;
}

/**
 * OZDynamicCurve::getNextValidKeypointHandle(CMTime const& t, double seconds, void** outHandlePP).
 * @0x29674. Byte-for-byte mirror of the Previous double-overload, calling
 * OZSpline::getNextValidVertex(CMTime const&, void**, CMTime const&, bool) @0x296b0 in place of
 * getPreviousValidVertex.
 */
export function ozDynamicCurve_getNextValidKeypointHandle_d(
  self: OZDynamicCurve,
  t: CMTime,
  seconds: number,
  outHandlePP: { value: unknown },
): boolean {
  const local = OZFigTimeForChannelSeconds(seconds, 0x40000);
  OZSpline_getNextValidVertex_t(
    self.base as unknown as OZSplineOpaque,
    local,
    outHandlePP,
    t,
    false,
  );
  return outHandlePP.value !== null && outHandlePP.value !== undefined;
}

/**
 * OZDynamicCurve::deriveKeypoint(void* handle). @0x296ca.
 *
 * @0x296ca  testq %rsi, %rsi        - early-return: if (handle == null) return 0.
 * @0x296cd  je    0x29702           - false-path
 * @0x296d6  movq  %rsi, %rbx        ; rbx = handle
 * @0x296d9  movq  %rdi, %r14        ; r14 = this
 * @0x296dc  addq  $0x8, %r14        ; r14 = &self.base
 * @0x296e3  callq OZSpline::isValidHandle(&self.base, handle)
 * @0x296e8  testb %al, %al
 * @0x296ea  je    0x29705           - false-path (return 0)
 * @0x296ec  movq  0xa0dcd(%rip), %rdx   ## _kCMTimeZero
 * @0x296f3  movq  %r14, %rdi        ; rdi = &self.base
 * @0x296f6  movq  %rbx, %rsi        ; rsi = handle
 * @0x296f9  callq OZSpline::deriveVertex(&self.base, handle, kCMTimeZero)
 * @0x296fe  movb  $0x1, %al         - return true
 *
 * The pre-guard on `handle != null` is a genuine early-exit BEFORE isValidHandle (unlike other
 * accessors that let isValidHandle do it). Preserved.
 */
export function ozDynamicCurve_deriveKeypoint(self: OZDynamicCurve, handle: unknown): boolean {
  // @0x296ca..0x296cd
  if (handle === null || handle === undefined) return false;
  // @0x296e3
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  // @0x296f9
  OZSpline_deriveVertex(self.base as unknown as OZSplineOpaque, handle, kCMTimeZero);
  return true;
}

/**
 * OZDynamicCurve::isValidHandle(void* handle). @0x2970c.
 *
 * @0x29710  addq $0x8, %rdi
 * @0x29715  jmp  OZSpline::isValidHandle(&self.base, handle)
 *
 * Pure delegate.
 */
export function ozDynamicCurve_isValidHandle(self: OZDynamicCurve, handle: unknown): boolean {
  return OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
}

/**
 * OZDynamicCurve::flattenCurve(). @0x2971a.
 *
 * @0x2971e  addq $0x8, %rdi
 * @0x29722  callq OZDynamicSpline::flattenSpline()
 * @0x29727  movb  $0x1, %al         - return true
 */
export function ozDynamicCurve_flattenCurve(self: OZDynamicCurve): boolean {
  OZDynamicSpline_flattenSpline(self.base);
  return true;
}

/**
 * OZDynamicCurve::isCurveFlattened(). @0x2972c.
 *
 * @0x29730  addq $0x8, %rdi
 * @0x29734  jmp  OZDynamicSpline::isSplineFlattened()
 *
 * Pure delegate (tail-jmp).
 */
export function ozDynamicCurve_isCurveFlattened(self: OZDynamicCurve): boolean {
  return OZDynamicSpline_isSplineFlattened(self.base);
}

// ────────────────────────────────────────────────────────────────────────────
// Dispatch table (assemble_class.py convention: <Class>_m<k>_methods).
// ────────────────────────────────────────────────────────────────────────────

export const OZDynamicCurve_m3_methods = {
  "OZDynamicCurve::getKeypointOutputHandles(void*, CMTime const&, double*)":
                                                                ozDynamicCurve_getKeypointOutputHandles,        // @0x292b6
  "OZDynamicCurve::setKeypointInterpolation(void*, unsigned int)":
                                                                ozDynamicCurve_setKeypointInterpolation,        // @0x2930a
  "OZDynamicCurve::setCurveInterpolation(unsigned int)":        ozDynamicCurve_setCurveInterpolation,           // @0x29350
  "OZDynamicCurve::getCurveInterpolation(unsigned int*, bool*, bool*)":
                                                                ozDynamicCurve_getCurveInterpolation,           // @0x29374
  "OZDynamicCurve::getKeypointInterpolation(void*, unsigned int*, bool*)":
                                                                ozDynamicCurve_getKeypointInterpolation,        // @0x29382
  "OZDynamicCurve::generateKeypoints(unsigned int, unsigned int)":
                                                                ozDynamicCurve_generateKeypoints,               // @0x293ce
  "OZDynamicCurve::reparametrizeCurve()":                       ozDynamicCurve_reparametrizeCurve,              // @0x293e4
  "OZDynamicCurve::reverseWindingOrder()":                      ozDynamicCurve_reverseWindingOrder,             // @0x293f6
  "OZDynamicCurve::getVertexChannel(void*, OZChannelVertexFolder**)":
                                                                ozDynamicCurve_getVertexChannel,                // @0x2940e
  "OZDynamicCurve::setVertexChannel(void*, OZChannelVertexFolder*)":
                                                                ozDynamicCurve_setVertexChannel,                // @0x29458
  "OZDynamicCurve::getPreviousKeypointHandle(CMTime const&, void*, void**)":
                                                                ozDynamicCurve_getPreviousKeypointHandle,       // @0x294a2
  "OZDynamicCurve::getNextKeypointHandle(CMTime const&, void*, void**)":
                                                                ozDynamicCurve_getNextKeypointHandle,           // @0x294f0
  "OZDynamicCurve::getPreviousValidKeypointHandle(CMTime const&, void*, void**)":
                                                                ozDynamicCurve_getPreviousValidKeypointHandle_h, // @0x2953e
  "OZDynamicCurve::getNextValidKeypointHandle(CMTime const&, void*, void**)":
                                                                ozDynamicCurve_getNextValidKeypointHandle_h,    // @0x295ae
  "OZDynamicCurve::getPreviousValidKeypointHandle(CMTime const&, double, void**)":
                                                                ozDynamicCurve_getPreviousValidKeypointHandle_d, // @0x2961e
  "OZDynamicCurve::getNextValidKeypointHandle(CMTime const&, double, void**)":
                                                                ozDynamicCurve_getNextValidKeypointHandle_d,    // @0x29674
  "OZDynamicCurve::deriveKeypoint(void*)":                      ozDynamicCurve_deriveKeypoint,                  // @0x296ca
  "OZDynamicCurve::isValidHandle(void*)":                       ozDynamicCurve_isValidHandle,                   // @0x2970c
  "OZDynamicCurve::flattenCurve()":                             ozDynamicCurve_flattenCurve,                    // @0x2971a
  "OZDynamicCurve::isCurveFlattened()":                         ozDynamicCurve_isCurveFlattened,                // @0x2972c
} as const;
