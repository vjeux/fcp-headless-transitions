// raw-port: OZDynamicCurve (chunk m4, FINAL) — ProChannel.framework (channels layer)
//
// Framework binary: /tmp/ProChannel.x86_64 (macOS FCP x86_64 slice; VA == file offset).
// Chunk 4 is the LAST chunk of OZDynamicCurve — methods [80..88) of 88. This closes out the
// class:
//   isKeypointFlattened, getLastValidKeypointHandle, getFirstValidKeypointHandle,
//   setDefaultAtCurrentTime (2 overloads: CMTime& and void* + CMTime&), updateKeypointBias,
//   getVertexToInsert, setKeypointID.
//
// See OZDynamicCurve.m0.ts for the object layout, base-class opaque brands, and BaseAccessors.
//
// ── Frontier callees new to this chunk (throw-stubs; @0xADDR cited) ──
//   OZSpline::isValidHandle(void*)                                              @0x29755, 0x297d7, 0x29898
//   OZDynamicSpline::isVertexFlattened(void*)                                   @0x29767
//   OZSpline::getLastValidVertex(void**, CMTime const&)                         @0x2978c (tail-jmp)
//   OZSpline::getFirstValidVertex(void**, CMTime const&)                        @0x297a4 (tail-jmp)
//   OZDynamicSpline::setDefaultValueAtCurrentTime(CMTime const&)                @0x297b2
//   OZDynamicSpline::setDefaultValueAtCurrentTime(void*, CMTime const&)         @0x297ec
//   OZDynamicSpline::updateVertexBias(void*)                                    @0x29806
//   OZFigTimeForChannelSeconds(double, int) -> CMTime (out-arg)                 @0x29845
//   OZDynamicSpline::getVertexToInsert(CMTime const&, CMTime const&, double*, double*, double*, double*, double*)   @0x29863
//   OZDynamicSpline::setVertexID(void*, unsigned int)                           @0x298ac
//
// ── The "return isValidHandle result" shape used by isKeypointFlattened, setDefaultAtCurrentTime
//    (void*, CMTime&), and setKeypointID ──
//    r12d = eax (isValidHandle result); if r12 == true: do the inner call; return r12d.
// UNLIKE the m3 tail-jmp variants, the return value here is isValidHandle's result (NOT the
// inner callee's) because the inner call is a regular `callq` and we then `movl %r12d, %eax`.

import { type CMTime } from "../infra/CMTime.js";
import {
  type OZDynamicCurve,
  type OZDynamicSplineOpaque,
  type OZSplineOpaque,
} from "./OZDynamicCurve.m0.js";

// ────────────────────────────────────────────────────────────────────────────
// Undecoded frontier callees (Spec Rule 3). Every stub cites the addr it defers.
// ────────────────────────────────────────────────────────────────────────────

/** OZSpline::isValidHandle(void*). Re-stubbed for m4 provenance.
 *  Call sites in m4: @0x29755, 0x297d7, 0x29898. */
function OZSpline_isValidHandle(_spline: OZSplineOpaque, _handle: unknown): boolean {
  throw new Error(
    "raw-port: OZSpline::isValidHandle(void*) not yet transcribed " +
      "(called from OZDynamicCurve chunk 4 @0x29755, 0x297d7, 0x29898 — ProChannel)",
  );
}

/** OZDynamicSpline::isVertexFlattened(void*). Call site @0x29767. */
function OZDynamicSpline_isVertexFlattened(
  _base: OZDynamicSplineOpaque,
  _handle: unknown,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::isVertexFlattened(void*) not yet transcribed " +
      "(called from OZDynamicCurve::isKeypointFlattened(void*, bool*) @0x29767 — ProChannel)",
  );
}

/** OZSpline::getLastValidVertex(void**, CMTime const&). Tail-jmp @0x2978c. */
function OZSpline_getLastValidVertex(
  _spline: OZSplineOpaque,
  _outHandlePP: { value: unknown },
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZSpline::getLastValidVertex(void**, CMTime const&) not yet transcribed " +
      "(tail-called from OZDynamicCurve::getLastValidKeypointHandle(CMTime const&, void**) " +
      "@0x2978c — ProChannel)",
  );
}

/** OZSpline::getFirstValidVertex(void**, CMTime const&). Tail-jmp @0x297a4. */
function OZSpline_getFirstValidVertex(
  _spline: OZSplineOpaque,
  _outHandlePP: { value: unknown },
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZSpline::getFirstValidVertex(void**, CMTime const&) not yet transcribed " +
      "(tail-called from OZDynamicCurve::getFirstValidKeypointHandle(CMTime const&, void**) " +
      "@0x297a4 — ProChannel)",
  );
}

/** OZDynamicSpline::setDefaultValueAtCurrentTime(CMTime const&). Call site @0x297b2.
 *  The "no-handle" overload — applies to the whole spline's default sample. */
function OZDynamicSpline_setDefaultValueAtCurrentTime_t(
  _base: OZDynamicSplineOpaque,
  _t: CMTime,
): void {
  throw new Error(
    "raw-port: OZDynamicSpline::setDefaultValueAtCurrentTime(CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::setDefaultAtCurrentTime(CMTime const&) @0x297b2 — ProChannel)",
  );
}

/** OZDynamicSpline::setDefaultValueAtCurrentTime(void*, CMTime const&). Call site @0x297ec.
 *  The "per-handle" overload. */
function OZDynamicSpline_setDefaultValueAtCurrentTime_ht(
  _base: OZDynamicSplineOpaque,
  _handle: unknown,
  _t: CMTime,
): void {
  throw new Error(
    "raw-port: OZDynamicSpline::setDefaultValueAtCurrentTime(void*, CMTime const&) not yet " +
      "transcribed (called from OZDynamicCurve::setDefaultAtCurrentTime(void*, CMTime const&) " +
      "@0x297ec — ProChannel)",
  );
}

/** OZDynamicSpline::updateVertexBias(void*). Call site @0x29806. NOTE: called WITHOUT an
 *  isValidHandle guard — the callee itself must tolerate invalid handles (or the caller
 *  guarantees the handle is valid). Preserved verbatim (Rule 1). */
function OZDynamicSpline_updateVertexBias(
  _base: OZDynamicSplineOpaque,
  _handle: unknown,
): void {
  throw new Error(
    "raw-port: OZDynamicSpline::updateVertexBias(void*) not yet transcribed " +
      "(called from OZDynamicCurve::updateKeypointBias(void*) @0x29806 — ProChannel)",
  );
}

/** OZFigTimeForChannelSeconds(double, int) -> CMTime (via hidden out-ptr).
 *  Symbol: __Z26OZFigTimeForChannelSecondsdi. Call site @0x29845 (flags = 0x40000). */
function OZFigTimeForChannelSeconds(_seconds: number, _flags: number): CMTime {
  throw new Error(
    "raw-port: OZFigTimeForChannelSeconds(double, int) not yet transcribed " +
      "(called from OZDynamicCurve::getVertexToInsert @0x29845 with flags=0x40000 — ProChannel)",
  );
}

/** OZDynamicSpline::getVertexToInsert(CMTime const&, CMTime const&, double*, double*, double*,
 *  double*, double*). Call site @0x29863. Takes TWO CMTime refs (the caller's ref-time and the
 *  Channel-Seconds-derived local CMTime) plus 5 double out-ptrs. */
function OZDynamicSpline_getVertexToInsert(
  _base: OZDynamicSplineOpaque,
  _refT: CMTime,
  _localT: CMTime,
  _o1: { value: number } | null,
  _o2: { value: number } | null,
  _o3: { value: number } | null,
  _o4: { value: number } | null,
  _o5: { value: number } | null,
): void {
  throw new Error(
    "raw-port: OZDynamicSpline::getVertexToInsert(CMTime const&, CMTime const&, double*, " +
      "double*, double*, double*, double*) not yet transcribed (called from " +
      "OZDynamicCurve::getVertexToInsert(CMTime const&, double, double*, double*, double*, " +
      "double*, double*) @0x29863 — ProChannel)",
  );
}

/** OZDynamicSpline::setVertexID(void*, unsigned int). Call site @0x298ac. */
function OZDynamicSpline_setVertexID(
  _base: OZDynamicSplineOpaque,
  _handle: unknown,
  _id: number,
): void {
  throw new Error(
    "raw-port: OZDynamicSpline::setVertexID(void*, unsigned int) not yet transcribed " +
      "(called from OZDynamicCurve::setKeypointID(void*, unsigned int) @0x298ac — ProChannel)",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Ported bodies (chunk 4 — 8 methods; FINAL chunk of OZDynamicCurve).
// ────────────────────────────────────────────────────────────────────────────

/**
 * OZDynamicCurve::isKeypointFlattened(void* handle, bool* outFlattened). @0x2973a.
 *
 * Prologue: rdx->rbx (outFlattened), rsi->r14 (handle), rdi->r15 (this); r15 += 8 (&self.base).
 * @0x29755  al = OZSpline::isValidHandle(&self.base, handle)
 * @0x2975a  r12d = eax  (spill the isValid result — RETURN value)
 * @0x2975d  testb %al, %al
 * @0x2975f  je 0x2976e   — skip the flattened read on invalid.
 * @0x29761..0x29767  al = OZDynamicSpline::isVertexFlattened(&self.base, handle)
 * @0x2976c  movb %al, (%rbx)   — *outFlattened = (uint8) al
 * @0x2976e  movl %r12d, %eax   — return isValid (NOT the flattened bool)
 *
 * NOTE: unlike other "isXxx(void*, bool*)" accessors that return isValidHandle, this one WRITES
 * the flattened byte to *outFlattened but STILL returns isValidHandle. If outFlattened is null
 * on the valid path the write `movb %al, (%rbx)` faults — Apple's contract.
 */
export function ozDynamicCurve_isKeypointFlattened(
  self: OZDynamicCurve,
  handle: unknown,
  outFlattened: { value: boolean },
): boolean {
  // @0x29755
  const isValid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  // @0x2975f..0x2976e  if isValid: *outFlattened = isVertexFlattened(...)
  if (isValid) {
    const flat = OZDynamicSpline_isVertexFlattened(self.base, handle);
    outFlattened.value = flat;
  }
  return isValid;
}

/**
 * OZDynamicCurve::getLastValidKeypointHandle(CMTime const& t, void** outHandlePP). @0x2977a.
 *
 * Pure ABI shuffle + tail-jmp:
 *   @0x2977e  movq %rsi, %rax     ; rax = &t
 *   @0x29781  addq $0x8, %rdi     ; rdi = &self.base
 *   @0x29785  movq %rdx, %rsi     ; rsi = outHandlePP  (arg1 of the callee)
 *   @0x29788  movq %rax, %rdx     ; rdx = &t           (arg2 of the callee)
 *   @0x2978c  jmp OZSpline::getLastValidVertex(&self.base, outHandlePP, &t)
 *
 * Callee signature is (void** outHandlePP, CMTime const& t) so the args swap.
 */
export function ozDynamicCurve_getLastValidKeypointHandle(
  self: OZDynamicCurve,
  t: CMTime,
  outHandlePP: { value: unknown },
): boolean {
  return OZSpline_getLastValidVertex(
    self.base as unknown as OZSplineOpaque,
    outHandlePP,
    t,
  );
}

/**
 * OZDynamicCurve::getFirstValidKeypointHandle(CMTime const& t, void** outHandlePP). @0x29792.
 *
 * Byte-for-byte mirror of getLastValidKeypointHandle with callee OZSpline::getFirstValidVertex
 * (tail-jmp @0x297a4).
 */
export function ozDynamicCurve_getFirstValidKeypointHandle(
  self: OZDynamicCurve,
  t: CMTime,
  outHandlePP: { value: unknown },
): boolean {
  return OZSpline_getFirstValidVertex(
    self.base as unknown as OZSplineOpaque,
    outHandlePP,
    t,
  );
}

/**
 * OZDynamicCurve::setDefaultAtCurrentTime(CMTime const& t). @0x297aa. NO-HANDLE overload.
 *
 * @0x297ae  addq $0x8, %rdi
 * @0x297b2  callq OZDynamicSpline::setDefaultValueAtCurrentTime(CMTime const&)
 * @0x297b7  movb $0x1, %al          — return true
 *
 * Note that the callee is called with rsi still == &t from the entry ABI.
 */
export function ozDynamicCurve_setDefaultAtCurrentTime_t(
  self: OZDynamicCurve,
  t: CMTime,
): boolean {
  OZDynamicSpline_setDefaultValueAtCurrentTime_t(self.base, t);
  return true;
}

/**
 * OZDynamicCurve::setDefaultAtCurrentTime(void* handle, CMTime const& t). @0x297bc. PER-HANDLE.
 *
 * Prologue: rdx->rbx (&t), rsi->r14 (handle), rdi->r15 (this); r15 += 8 (&self.base).
 * @0x297d7  al = OZSpline::isValidHandle(&self.base, handle)
 * @0x297dc  r12d = eax
 * @0x297df  testb %al, %al
 * @0x297e1  je 0x297f1
 * @0x297ec  callq OZDynamicSpline::setDefaultValueAtCurrentTime(&self.base, handle, &t)
 * @0x297f1  movl %r12d, %eax        — return isValidHandle result
 */
export function ozDynamicCurve_setDefaultAtCurrentTime_ht(
  self: OZDynamicCurve,
  handle: unknown,
  t: CMTime,
): boolean {
  const isValid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  if (isValid) {
    OZDynamicSpline_setDefaultValueAtCurrentTime_ht(self.base, handle, t);
  }
  return isValid;
}

/**
 * OZDynamicCurve::updateKeypointBias(void* handle). @0x297fe.
 *
 * @0x29802  addq $0x8, %rdi
 * @0x29806  callq OZDynamicSpline::updateVertexBias(&self.base, handle)
 * @0x2980b  movb $0x1, %al         — return true
 *
 * NO isValidHandle guard — the callee tolerates the handle unchecked (Rule 1: preserve as-is).
 */
export function ozDynamicCurve_updateKeypointBias(
  self: OZDynamicCurve,
  handle: unknown,
): boolean {
  OZDynamicSpline_updateVertexBias(self.base, handle);
  return true;
}

/**
 * OZDynamicCurve::getVertexToInsert(CMTime const& t, double seconds, double* o1, double* o2,
 *                                    double* o3, double* o4, double* o5). @0x29810.
 *
 * SysV arg map on entry: rdi=this, rsi=&t, xmm0=seconds, rdx=o1, rcx=o2, r8=o3, r9=o4, [rbp+0x10]=o5.
 *
 * Prologue (@0x29821..0x29835):
 *   @0x29821  movq %r9,  -0x38(%rbp)     ; stash o4  (r9)  in local
 *   @0x29825  movq %r8,  -0x30(%rbp)     ; stash o3  (r8)  in local
 *   @0x29829  movq %rcx, %r15            ; r15 = o2  (rcx)
 *   @0x2982c  movq %rdx, %r12            ; r12 = o1  (rdx)
 *   @0x2982f  movq %rsi, %r13            ; r13 = &t
 *   @0x29832  movq %rdi, %rbx            ; rbx = this
 *   @0x29835  addq $0x8, %rbx            ; rbx = &self.base
 *
 * OZFigTimeForChannelSeconds call (@0x29839..0x29845):
 *   @0x29839  leaq -0x50(%rbp), %r14     ; r14 = &localCMTime (16-byte stack slot)
 *   @0x2983d  movq %r14, %rdi            ; rdi = &localCMTime  (hidden struct-return)
 *   @0x29840  movl $0x40000, %esi        ; esi = flags = 0x40000
 *   @0x29845  callq OZFigTimeForChannelSeconds ; localCMTime = OZFigTimeForChannelSeconds(seconds_in_xmm0, 0x40000)
 *
 * OZDynamicSpline::getVertexToInsert call (@0x2984a..0x29863):
 *   @0x2984a  movq %rbx, %rdi            ; rdi = &self.base
 *   @0x2984d  movq %r13, %rsi            ; rsi = &t          (arg 2)
 *   @0x29850  movq %r14, %rdx            ; rdx = &localCMTime (arg 3)
 *   @0x29853  movq %r12, %rcx            ; rcx = o1           (arg 4)
 *   @0x29856  movq %r15, %r8             ; r8  = o2           (arg 5)
 *   @0x29859  movq -0x30(%rbp), %r9      ; r9  = o3           (arg 6, restored from stash)
 *   @0x2985d  pushq 0x10(%rbp)           ; stack: o5           (arg 8, from caller's stack)
 *   @0x29860  pushq -0x38(%rbp)          ; stack: o4           (arg 7, from stash)
 *   @0x29863  callq OZDynamicSpline::getVertexToInsert(&self.base, &t, &localCMTime, o1, o2, o3, o4, o5)
 *   @0x29868  addq $0x10, %rsp           ; restore stack
 *   @0x2986c  movb $0x1, %al             — return true
 *
 * The seconds argument (%xmm0) is NEVER touched by OZDynamicCurve directly; it is consumed
 * transparently by OZFigTimeForChannelSeconds (which reads %xmm0 by its ABI). We surface it as
 * a `number` parameter for the TS port.
 */
export function ozDynamicCurve_getVertexToInsert(
  self: OZDynamicCurve,
  t: CMTime,
  seconds: number,
  o1: { value: number } | null,
  o2: { value: number } | null,
  o3: { value: number } | null,
  o4: { value: number } | null,
  o5: { value: number } | null,
): boolean {
  // @0x29845
  const localCMTime = OZFigTimeForChannelSeconds(seconds, 0x40000);
  // @0x29863
  OZDynamicSpline_getVertexToInsert(self.base, t, localCMTime, o1, o2, o3, o4, o5);
  return true;
}

/**
 * OZDynamicCurve::setKeypointID(void* handle, unsigned int id). @0x2987e.
 *
 * Prologue: edx->ebx (id), rsi->r14 (handle), rdi->r15 (this); r15 += 8 (&self.base).
 * @0x29898  al = OZSpline::isValidHandle(&self.base, handle)
 * @0x2989d  r12d = eax
 * @0x298a0  testb %al, %al
 * @0x298a2  je 0x298b1
 * @0x298ac  callq OZDynamicSpline::setVertexID(&self.base, handle, id)
 * @0x298b1  movl %r12d, %eax     — return isValidHandle result
 */
export function ozDynamicCurve_setKeypointID(
  self: OZDynamicCurve,
  handle: unknown,
  id: number,
): boolean {
  const isValid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  if (isValid) {
    OZDynamicSpline_setVertexID(self.base, handle, id >>> 0);
  }
  return isValid;
}

// ────────────────────────────────────────────────────────────────────────────
// Dispatch table (assemble_class.py convention: <Class>_m<k>_methods).
// ────────────────────────────────────────────────────────────────────────────

export const OZDynamicCurve_m4_methods = {
  "OZDynamicCurve::isKeypointFlattened(void*, bool*)":          ozDynamicCurve_isKeypointFlattened,          // @0x2973a
  "OZDynamicCurve::getLastValidKeypointHandle(CMTime const&, void**)":
                                                                ozDynamicCurve_getLastValidKeypointHandle,   // @0x2977a
  "OZDynamicCurve::getFirstValidKeypointHandle(CMTime const&, void**)":
                                                                ozDynamicCurve_getFirstValidKeypointHandle,  // @0x29792
  "OZDynamicCurve::setDefaultAtCurrentTime(CMTime const&)":     ozDynamicCurve_setDefaultAtCurrentTime_t,    // @0x297aa
  "OZDynamicCurve::setDefaultAtCurrentTime(void*, CMTime const&)":
                                                                ozDynamicCurve_setDefaultAtCurrentTime_ht,   // @0x297bc
  "OZDynamicCurve::updateKeypointBias(void*)":                  ozDynamicCurve_updateKeypointBias,           // @0x297fe
  "OZDynamicCurve::getVertexToInsert(CMTime const&, double, double*, double*, double*, double*, double*)":
                                                                ozDynamicCurve_getVertexToInsert,            // @0x29810
  "OZDynamicCurve::setKeypointID(void*, unsigned int)":         ozDynamicCurve_setKeypointID,                // @0x2987e
} as const;
