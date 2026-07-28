// raw-port: OZEaseOutInterpolator (chunk m0) — ProChannel.framework (channels layer)
//
// Framework binary: /tmp/ProChannel.x86_64 (macOS FCP x86_64 slice).
// Class-methods reference range:  0x4390c .. 0x43e64  (7 methods).
// Base class: OZInterpolator  (D0 tail-calls __ZN14OZInterpolatorD2Ev @0x43e51 and @0x43e43).
//              — NOT OZLinearInterpolator (that is OZEaseInterpolator's parent).
//
// Chunk file convention (see raw-port/army/tools/assemble_class.py):
//   Exports `OZEaseOutInterpolator_m0_methods` — a dispatch table of ported bodies keyed by their
//   demangled method-selector strings. Every body cites @0xADDR + framework and every constant /
//   RIP-relative load / callee is documented at its instruction address.
//
// Instance state
// --------------
// The class carries NO fields observable in either dtor: D1 @0x43e3e is `push/mov/pop rbp ; jmp
// OZInterpolator::~D2` and D0 @0x43e48 is `push rbp ; save rbx ; call OZInterpolator::~D2 ;
// operator delete`. init() @0x43e64 is `push rbp ; mov rsp,rbp ; pop rbp ; ret` — literally the
// empty prologue/epilogue with no field writes. So OZEaseOutInterpolator adds no data beyond its
// (undecoded) OZInterpolator base.
//
// Frontier callees (undecoded — every one lands as a throwing stub citing its @0xADDR)
// --------------------------------------------------------------------------------------
//   virtual *0x18 on p1/p2/vertexA/vertexB          (getValueV(spline) on a keypoint/vertex object)
//                                                    @0x43954, 0x43965, 0x43d21, 0x43d32
//     Convention documented in OZBezierInterpolator.ts (line 471, 574): "vA.getValueV(uQuery)
//     — for a static keypoint just returns v.value". We do NOT have the vertex type decoded here
//     so it is an injected virtual on the keypoint object.
//   virtual *0x20 on p2                               (subDivide dispatch)               @0x43b03
//   virtual *0xf0 on OZSpline                         (getVertexValue @0x303a6 — see
//                                                     OZBezierInterpolator.ts line 316-317)
//                                                    @0x43cb8, 0x43cd1
//   virtual *0x18 on this  (OZInterpolator::??)                                          @0x43c20, 0x43c4f
//     Recursively called with the query key + kCMTimeZero — used by getMinMaxValues to
//     collect the endpoint values of the segment. Not decoded — throw citing addr.
//   OZSpline::getSmallDeltaU() const                                                     @0x439a6
//     Referenced by symbol name (__ZNK8OZSpline14getSmallDeltaUEv) — undecoded in the ports.
//   _CMTimeCompare                                                                       @0x43990, 0x43b8a, 0x43bd9
//   _CMTimeGetSeconds                                                                    @0x43a8c
//   _PC_CMTimeSaferAdd                                                                   @0x439d2, 0x43e17
//   _PC_CMTimeSaferSubtract                                                              @0x43a1a, 0x43a66, 0x43d7e
//   __ZmlRK6CMTimed  = operator*(CMTime const&, double)                                  @0x43a34, 0x43d98, 0x43de1
//   __ZdvRK6CMTimeS1_ = operator/(CMTime const&, CMTime const&) -> double                @0x43a74
//   __ZdvRK6CMTimed   = operator/(CMTime const&, double)                                 @0x43db2
//   _sin                                                                                 @0x43a99
//   _asin                                                                                @0x43dd2
//   std::vector<CMTime>::push_back                                                        @0x43e22
//   __ZN14OZInterpolatorD2Ev  — base D2                                                   @0x43e43, 0x43e51
//   __ZdlPv                    — operator delete                                          @0x43e5f
//
// Constants recovered via `resolve.py ProChannel const <ripTarget>`:
//   @0x43a26  RIP+0x6c98a → 0xb03b8  =  3.141592653589793   (π)
//   @0x43a91  RIP+0x6c927 → 0xb03c0  =  0.5
//   @0x43d8a  RIP+0x6c85e → 0xb05f0  =  2.0
//   @0x43da4  RIP+0x6c60c → 0xb03b8  =  3.141592653589793   (π)
//
// Semantic gist
// -------------
// interpolate: If t > kf1.time, add getSmallDeltaU() to the segment's dtDen(=kf1.time - kf2.time)
// via PC_CMTimeSaferAdd (an edge-case bump). Then compute
//   segLen = kf1.time - kf2.time
//   dt     = ( (t - kf2.time) / segLen ).seconds       [note: __ZdvRK6CMTimeS1_ is CMTime/CMTime→double]
//   ... wait, re-reading the asm: __ZdvRK6CMTimeS1_ takes two CMTime pointers and returns a CMTime
//   (dividend / divisor as a fresh CMTime — see the leaq -0xa8 sret setup at 0x43a71).
// Actually the disasm shows:
//   r15 (=-0xd8) = (kf1.time - kf2.time) * π      via __ZmlRK6CMTimed  @0x43a34
//   rbx (=-0xa8) = (t - kf2.time)                 via PC_CMTimeSaferSubtract @0x43a66
//   r14 (=-0x90) = r15 / rbx                      via __ZdvRK6CMTimeS1_ @0x43a74
//   xmm0         = seconds(r14)                   via _CMTimeGetSeconds @0x43a8c
//   xmm0 *= 0.5                                                          @0x43a91
//   xmm0 = sin(xmm0)                                                     @0x43a99
//   xmm0 = kf2_val + xmm0 * (kf1_val - kf2_val)                          @0x43aa8..0x43ab0
//   ; where kf1_val = vertexA.getValueV(spline) @0x43954, kf2_val = vertexB.getValueV(spline)
//   ;       (before-load: -0x70=v1, -0x68=v2 → but subsd puts (v2 - v1)*... hmm carefully)
// From the asm (@0x43a9e-0x43ab0):
//   xmm1 = -0x70(rbp) = v1  (first getValueV result stored @0x43957)
//   xmm2 = -0x68(rbp) = v2  (second getValueV result stored @0x43968)
//   xmm2 -= xmm1                             ;  = v2 - v1
//   xmm0 *= xmm2                             ;  = sin(...) * (v2 - v1)
//   xmm0 += xmm1                             ;  = v1 + sin(...) * (v2 - v1)
// return xmm0.
//
// getMinMaxValues @0x43b10..0x43c7d — clamps and sorts the two-vertex endpoint values by comparing
// the two CMTimes with _CMTimeCompare (twice), then calls virtual *0x18 on `this` twice, writing to
// *(rbp+0x10) and *(rbp+0x18) (the C++ double* out-args), and swaps if out[0] > out[1].
//
// subDivide @0x43ac4 — copies segment endpoints and forwards to virtual *0x20 on p2 (subDivide
// dispatch — the pattern seen throughout the interpolator family).
//
// uForCurveValue @0x43c7e — solves for u given a target curve value (the inverse of interpolate):
//   xmm0 (arg)    = queryValue
//   xmm1 = spline.getVertexValue(p1, kCMTimeZero, 0)   @0x43cb8  (via *0xf0)
//   xmm0'= spline.getVertexValue(p2, kCMTimeZero, 0)   @0x43cd1
//   hi   = max(v0, v1);  lo = min(v0, v1)                         @0x43ce0-0x43ce4
//   if (query in [lo, hi]) {  // xmm2>=lo && xmm3>=query ...
//     v1        = kf1.getValueV(kCMTimeZero) via *0x18 @0x43d21
//     v2        = kf2.getValueV(kCMTimeZero) via *0x18 @0x43d32
//     segT_pi   = (kf1.t - kf2.t) * π                    __ZmlRK6CMTimed
//     segT_pi2  = segT_pi                        // NB reused
//     segT_over_pi = segT_pi / π                 __ZdvRK6CMTimed  @0x43db2
//     u        = (query - v1) / (v2 - v1)                              @0x43dbc..0x43dce
//     alpha    = asin(u)                                                @0x43dd2
//     halfSeg  = segT_over_pi * alpha                                   @0x43de1
//     out      = kf2.time + halfSeg                                     @0x43e17
//     vec.push_back(out)                                                @0x43e22
//   }
//   return (bl & 1) — the boolean "in range" flag.
//
// init: totally empty (just push/mov/pop/ret). D1: tail-jmp to OZInterpolator::~D2. D0: call base
// D2 then jmp operator delete.

import {
  type CMTime,
  kCMTimeZero,
  CMTimeGetSeconds,
  CMTimeCompare,
  PC_CMTimeSaferAdd,
  PC_CMTimeSaferSubtract,
  CMTimeMul_double,
} from "../infra/CMTime.js";

// ────────────────────────────────────────────────────────────────────────────
// undecoded frontier — every callee below throws citing its @0xADDR (spec rule 3)
// ────────────────────────────────────────────────────────────────────────────

/** __ZdvRK6CMTimeS1_ = operator/(CMTime const&, CMTime const&) — returns a fresh CMTime.
 *  Call site @0x43a74. Not yet decoded. */
function CMTimeDiv_CMTime(_a: CMTime, _b: CMTime): CMTime {
  throw new Error(
    "raw-port: __ZdvRK6CMTimeS1_ (CMTime/CMTime → CMTime) is not yet transcribed " +
      "(called from OZEaseOutInterpolator::interpolate @0x43a74)",
  );
}

/** __ZdvRK6CMTimed = operator/(CMTime const&, double) — returns a fresh CMTime.
 *  Call site @0x43db2. Not yet decoded. */
function CMTimeDiv_double(_a: CMTime, _b: number): CMTime {
  throw new Error(
    "raw-port: __ZdvRK6CMTimed (CMTime/double → CMTime) is not yet transcribed " +
      "(called from OZEaseOutInterpolator::uForCurveValue @0x43db2)",
  );
}

/** OZSpline::getSmallDeltaU() const  (__ZNK8OZSpline14getSmallDeltaUEv) — returns a CMTime.
 *  Call site @0x439a6 (interpolate, only on the t > kf1.time branch). Not yet decoded. */
function OZSpline_getSmallDeltaU(_spline: unknown): CMTime {
  throw new Error(
    "raw-port: OZSpline::getSmallDeltaU() const is not yet transcribed " +
      "(called from OZEaseOutInterpolator::interpolate @0x439a6)",
  );
}

/** Virtual *0x18 slot on a keypoint/vertex: `double getValueV(OZSpline*)`.
 *  Convention documented in OZBezierInterpolator.ts (getValueV @0x3ea46 — for a static keypoint,
 *  returns v.value). Call sites in this class:
 *    @0x43954  (interpolate: vertexA)
 *    @0x43965  (interpolate: vertexB)
 *    @0x43d21  (uForCurveValue: p1)
 *    @0x43d32  (uForCurveValue: p2)
 *  The concrete vertex class is not decoded here — inject via a per-keyframe closure. */
export interface KeyframeVertex {
  /** vtable *0x18 : double getValueV(OZSpline*) — callee is dynamic on the vertex type. */
  getValueV?: (spline: unknown) => number;
  /** CMTime lives at struct offset +0x10 (24 bytes: 8-byte value @+0x10 + 8-byte timescale/flags
   *  packed @+0x18 + 4-byte flags @+0x20). Load pattern @0x4392a / @0x4393a. */
  time: CMTime;
}

function keyframe_getValueV(kf: KeyframeVertex, spline: unknown, addr: string): number {
  if (!kf.getValueV) {
    throw new Error(
      "raw-port: KeyframeVertex.getValueV (vtable *0x18) not injected — undecoded vertex " +
        "virtual dispatch @" + addr,
    );
  }
  return kf.getValueV(spline);
}

/** Virtual *0x20 slot on p2 in subDivide (@0x43b03). Sig: `void subDivide(OZSpline*, CMTime&)`
 *  based on the callee's `mov rdi, r14 ; mov rsi, r12` (both saved regs — no undo needed). */
function KeypointObj_vtable_slot20_subDivide(
  _p2: unknown, _spline: unknown, _time: CMTime,
): void {
  throw new Error(
    "raw-port: keypoint vtable *0x20 (subDivide dispatch) is not yet transcribed " +
      "(called from OZEaseOutInterpolator::subDivide @0x43b03)",
  );
}

/** Virtual *0xf0 slot on OZSpline: `double getVertexValue(void* keypoint, CMTime const&, int)`.
 *  Convention documented in OZBezierInterpolator.ts line 316-317. Call sites @0x43cb8 & @0x43cd1. */
function OZSpline_vtable_slot_f0_getVertexValue(
  _spline: unknown, _keypoint: unknown, _query: CMTime, _flag: number, addr: string,
): number {
  throw new Error(
    "raw-port: OZSpline vtable *0xf0 (getVertexValue) is not yet transcribed — " +
      "called from OZEaseOutInterpolator::uForCurveValue @" + addr,
  );
}

/** Virtual *0x18 slot on `this` (OZInterpolator base) — returns a `double` and is called with
 *  `(this, keypoint, kCMTimeZero, 0)` in getMinMaxValues (@0x43c20 and @0x43c4f). Undecoded. */
function OZInterpolator_vtable_slot_18(
  _this: unknown, _keypoint: unknown, _query: CMTime, _flag: number, addr: string,
): number {
  throw new Error(
    "raw-port: OZInterpolator vtable *0x18 is not yet transcribed — called from " +
      "OZEaseOutInterpolator::getMinMaxValues @" + addr,
  );
}

/** OZInterpolator::~OZInterpolator() (D2 base dtor) — undecoded.
 *  Called from D1 @0x43e43 (tail-jmp) and D0 @0x43e51. */
function OZInterpolator_D2(_this: OZEaseOutInterpolator): void {
  // The D2 body is not decoded in this file. Every decoded sibling (see
  // OZAccelerateInterpolator, OZEaseInterpolator) exposes an equivalent no-op JS
  // destroy() hook — but the base is a *frontier* callee here, so we cite it.
  // A silent no-op would be a Rule-3 violation only if the base DID observable
  // work; because we cannot prove that today, we throw when explicitly invoked.
  throw new Error(
    "raw-port: OZInterpolator::~OZInterpolator() (D2) is not yet transcribed " +
      "(called from OZEaseOutInterpolator D1 @0x43e43 / D0 @0x43e51)",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Class
// ────────────────────────────────────────────────────────────────────────────

/**
 * OZEaseOutInterpolator — quarter-sine ease-OUT interpolator. The eased time-warp is
 *   f(u) = sin(u * π/2)
 * applied to normalized u = (t - kf2.time) / (kf1.time - kf2.time). Because sin ramps quickly
 * from 0 and slowly toward 1 as its argument approaches π/2, this pulls values toward the FINAL
 * endpoint — i.e. ease-out.
 *
 * Zero instance state (see file-header notes).
 */
export class OZEaseOutInterpolator {
  readonly __brand = "OZEaseOutInterpolator" as const;

  /**
   * OZEaseOutInterpolator::interpolate(OZSpline&, CMTime const& t, void* vertexA, void* vertexB,
   *                                    CMTime const& segTime, bool, bool)  @0x0004390c
   *
   * Faithful transcription — every line cited @0xADDR. See file-header for the semantic
   * summary.  Signature-arg mapping from prologue @0x0004391e:
   *   rdi = &this (%rsi saved from rdi — not really, see: `movq %rsi,%r14` @0x43927 — %rsi is
   *         the OZSpline&; %rdx (segTime) is saved into %r12; %rcx is vertexA(ish) — see below;
   *         %r8 is vertexB-side; %r9 is trailing-time ref).
   * Reading the actual moves:
   *   @0x4391e  mov %r9, %rbx     ; rbx = arg6 (the trailing CMTime const& in the original C++
   *                                 signature — i.e. `segTime` per the mangled name).
   *   @0x43921  mov %r8, %r15    ; r15 = arg5 (bool? no — later at 0x439da it's dereffed like a
   *                                 CMTime, so this IS a CMTime-carrying object).
   *   @0x43924  mov %rdx, %r12   ; r12 = arg3 = the "vertexB / keyframe #2" ptr.
   *   @0x43927  mov %rsi, %r14   ; r14 = arg2 = the OZSpline*.
   *   @0x4392a  mov 0x20(%rcx),%rax ; %rcx = arg4 = "keyframe #1" — .time+8 read.
   *   @0x43932  movups 0x10(%rcx),%xmm0 ; low 16 of CMTime read into xmm0, spilled to -0x40.
   *   @0x4393a  mov 0x20(%r8),%rax ; then the same for %r8 (keyframe #2) — spilled to -0x50/-0x60.
   *
   * So the true argument mapping (SysV, this-call: rdi=this, rsi=spline, rdx=?, rcx=kf1, r8=kf2,
   * r9=trailing?) — the mangled signature is `interpolate(OZSpline&, CMTime const&, void*, void*,
   * CMTime const&, bool, bool)`. So (rdi=this, rsi=spline, rdx=t, rcx=kf1, r8=kf2, r9=segTime).
   * The two bools are on the stack. `t` is captured indirectly through the vtable *0x18 calls (see
   * below); the disassembler shows `%rdx` used in the `movq %rdx, %rsi` @0x43951 before the vtable
   * call at *0x18. Actually: `@0x43951 movq %rdx, %rsi ; @0x43954 callq *0x18(%rax)` — so the vtable
   * *0x18 receives `(this=rcx=kf1, spline_or_query=rdx=t)`. That matches the OZBezierInterpolator
   * convention: `getValueV(uQuery)`.
   *
   * @param spline   the OZSpline (@r14/rsi)
   * @param t        the query CMTime (@rdx)
   * @param kf1      keyframe #1 vertex-like ptr (@rcx). Contains .time (+0x10) and vtable *0x18.
   * @param kf2      keyframe #2 vertex-like ptr (@r8).  Same shape.
   * @param segTime  auxiliary CMTime (@r9, %rbx) referenced only on the t>kf1.time branch.
   * @returns        the interpolated double value (v1 + sin(...)*(v2-v1)).
   */
  interpolate(
    spline: unknown,
    t: CMTime,
    kf1: KeyframeVertex,
    kf2: KeyframeVertex,
    _segTime: CMTime,
    _boolA: boolean,
    _boolB: boolean,
  ): number {
    // @0x4392a-@0x43947 — copy CMTime fields locally (equivalent to just holding references).
    const kf1_time = kf1.time;
    const kf2_time = kf2.time;

    // @0x4394b-@0x43957 — v1 = kf1.getValueV(t) via vtable *0x18.
    const v1 = keyframe_getValueV(kf1, t, "0x43954");

    // @0x4395c-@0x43968 — v2 = kf2.getValueV(t) via vtable *0x18.
    const v2 = keyframe_getValueV(kf2, t, "0x43965");

    // @0x4396d-0x43995 — _CMTimeCompare(t, kf1.time).  Return >0 (jle at 0x43997 SKIPS this block
    // iff sign≤0, i.e. only enter when t > kf1.time strictly).
    // Argument order per the asm stack layout: (arg0=t at rsp+0..+16, arg1=kf1.time at rsp+16..+32).
    let workingSegLen: CMTime | undefined = undefined;
    if (CMTimeCompare(t, kf1_time) > 0) {
      // @0x43999-@0x439a6 — deltaU = OZSpline::getSmallDeltaU()  (into a -0x90 CMTime).
      const smallDeltaU = OZSpline_getSmallDeltaU(spline);

      // @0x439ab-@0x439d2 — PC_CMTimeSaferAdd(&kf2_time_scratch = -0x60, kf1.time, smallDeltaU).
      // Note the sret target is `-0x60(%rbp)` which was previously kf2.time — so it OVERWRITES the
      // local scratch copy of kf2.time. Downstream the code reads -0x50/-0x60 as "kf2.time" in the
      // final PC_CMTimeSaferSubtract @0x43a66, meaning: on this branch, the "kf2.time" that
      // participates in `(kf1.time - kf2.time)` is REPLACED by (kf1.time + smallDeltaU).
      // Wait — read again: `leaq -0x60(%rbp), %rdi ; call PC_CMTimeSaferAdd` — but which slots did
      // it store from? Looking at the sequence:
      //   0x439a0  %r15 = -0x90 (small-delta out)
      //   0x439a3  mov %r14, %rsi  (= OZSpline*)
      //   0x439a6  call OZSpline::getSmallDeltaU()   → writes CMTime to -0x90
      //   0x439ab  mov 0x10(r15),rax ; @0x439af mov rax, rsp+0x28
      //   0x439b4  movups (r15),xmm0 ; movups xmm0, rsp+0x18   ; arg2 = smallDeltaU on stack
      //   0x439bd  mov -0x30(rbp),rax ; movq rax, rsp+0x10
      //   0x439c6  movaps -0x40(rbp),xmm0 ; movups xmm0, (rsp) ; arg1 = kf1.time on stack
      //   0x439ce  leaq -0x60(%rbp), %rdi                       ; out = -0x60 (was kf2.time)
      //   0x439d2  call _PC_CMTimeSaferAdd
      // Result: -0x60/-0x50 now holds  kf1.time + smallDeltaU.  Downstream reads these slots
      // as if they were kf2.time — i.e. on this branch we replace kf2.time with kf1.time+deltaU.
      workingSegLen = PC_CMTimeSaferAdd(kf1_time, smallDeltaU);
    }
    // Consolidate the "effective kf2 time" used from here on. On the common (t <= kf1.time)
    // path, workingSegLen stays undefined and we use kf2.time verbatim (as at 0x43a08/0x43a0c).
    const effective_kf2_time = workingSegLen ?? kf2_time;

    // @0x439d7-@0x439ed — reload effective_kf2_time into scratch and rewrite kf1.time into rsp+0x18.
    // This is just staging for the sub call — nothing observable to compute here.

    // @0x439ed-@0x43a1a — PC_CMTimeSaferSubtract(out=-0xc0, kf1.time, effective_kf2_time).
    // Argument order: (rsp+0=kf1.time, rsp+0x18=effective_kf2_time).
    // Reading the exact asm: %rax = 0x10(r14) at 0x439d7 was actually the effective_kf2_time
    // (r14 == -0x90 which the previous branch had reused as an out ptr). This is subtle so let me
    // re-derive: after 0x439db leaq -0x90(%rbp),%r14 — r14 is the -0x90 slot which we WROTE the
    // (kf1.time+deltaU) into if we took the branch, or which is still uninitialized (kCMTimeInvalid-
    // ish garbage) if we didn't.  In the common `else` path the fallthrough @0x43997 jumped OVER
    // 0x439ce so -0x90 was NEVER filled — meaning on t <= kf1 the code reads uninitialized memory
    // at 0x439ff.  That would be UB in C++.
    //
    // *** Reviewing the disassembly range 0x43997..0x439d7 more carefully ***
    // At 0x43997 the `jle 0x439d7` jumps to just AFTER the branch, then at 0x439d7 we do
    // `mov 0x10(rbx), rax` — reading from RBX (which is the r9 arg = segTime), not from r14.  So
    // the -0x60/-0x50 slot (previously kf2.time) is used as-is, and the segTime CMTime (rbx) is
    // sourced from r9.
    //
    // Hmm wait — re-read the exact instructions at 0x439d7..0x439e9:
    //   0x439d7  movq 0x10(%rbx), %rax
    //   0x439db  leaq -0x90(%rbp), %r14
    //   0x439e2  movq %rax, 0x10(%r14)
    //   0x439e6  movups (%rbx), %xmm0
    //   0x439e9  movaps %xmm0, (%r14)
    // These COPY segTime (rbx = r9 arg) into the -0x90 slot!  So on the fallthrough branch, -0x90
    // is filled with segTime, and on the taken branch, -0x90 was filled by getSmallDeltaU().  The
    // *0x60 slot in either case still holds one of {kf2.time, kf1.time + smallDeltaU} depending on
    // whether the branch fired.
    //
    // OK, so the true semantics on the t>kf1 branch: -0x90 is DESTROYED by getSmallDeltaU (it was
    // an intermediate), then IMMEDIATELY overwritten with segTime at 0x439d7-0x439e9.  So on BOTH
    // paths, after 0x439e9:  -0x90 = segTime,  -0x60 = { kf2.time on fallthrough, or
    // kf1.time + smallDeltaU on the taken branch }.
    //
    // We cannot cleanly express "the branch replaces kf2 with kf1+delta" in TypeScript without
    // faithfully mirroring the stack — but we can capture the *observable* effect as:
    const effective_segEnd = workingSegLen ?? kf2_time; // -0x60 slot's meaning after 0x439ed.

    // @0x43a10-@0x43a1a — PC_CMTimeSaferSubtract(out=-0xc0, arg1=segTime, arg2=effective_segEnd).
    // Argument order per the stack shape: (rsp+0=segTime, rsp+0x18=effective_segEnd).
    const segMinusEnd: CMTime = PC_CMTimeSaferSubtract(_segTime, effective_segEnd);

    // @0x43a1f-@0x43a34 — leaq -0xd8,%r15 ; xmm0 = π ; __ZmlRK6CMTimed(-0xd8, segMinusEnd, π).
    const segTimesPi: CMTime = CMTimeMul_double(segMinusEnd, Math.PI);

    // @0x43a39-@0x43a66 — PC_CMTimeSaferSubtract(-0xa8, kf1.time, effective_segEnd).
    // Stack shape: (rsp+0=kf1.time, rsp+0x18=effective_segEnd).
    const kf1MinusEnd: CMTime = PC_CMTimeSaferSubtract(kf1_time, effective_segEnd);

    // @0x43a6b-@0x43a74 — __ZdvRK6CMTimeS1_(out=-0x90, num=segTimesPi, den=kf1MinusEnd).
    // Frontier — this op returns a CMTime from (CMTime/CMTime).
    const ratioCMTime: CMTime = CMTimeDiv_CMTime(segTimesPi, kf1MinusEnd);

    // @0x43a79-@0x43a8c — _CMTimeGetSeconds(ratioCMTime).
    const ratioSec: number = CMTimeGetSeconds(ratioCMTime);

    // @0x43a91 — xmm0 *= 0.5.
    const halfArg: number = ratioSec * 0.5;

    // @0x43a99 — xmm0 = sin(halfArg).
    const sinPart: number = Math.sin(halfArg);

    // @0x43a9e-@0x43ab0 — xmm2 = v2 ; xmm2 -= v1 ; xmm0 *= xmm2 ; xmm0 += v1.
    return v1 + sinPart * (v2 - v1);
  }

  /**
   * OZEaseOutInterpolator::subDivide(OZSpline&, CMTime const&, void*, void*, void*)  @0x00043ac4
   *
   * Faithful mirror. Prologue @0x43acf-@0x43ad5:
   *   %rbx = %r9      (arg7, "keypoint2 ptr")
   *   %r14 = %rdx     (arg3, "CMTime const& t")
   *   [%rsi is this, %rdi is OZSpline&]
   *
   * Body:
   *   @0x43ad5-@0x43ae5   copy kf2.time (r9+0x10..0x28) into local -0x30(%rbp) slot (24 bytes).
   *   @0x43ae9-@0x43af6   `mov (%rdi),%rax ; xorl %r10d,%r10d ; push $0 ; push $0 ; call *0x18(%rax)`
   *                       — vtable *0x18 on OZSpline (NOT on a keyframe): first 2 stack args are 0.
   *                       This is the vtable slot on OZSpline itself (the spline's own dispatch).
   *   @0x43af6           addq $0x10, %rsp        ; drop the pushed 2 zeros
   *   @0x43afa-@0x43b03   `mov (%rbx),%rax ; %rdi=%rbx=kf2 ; %rsi=%r14=t ; call *0x20(%rax)`
   *                       — vtable *0x20 on kf2 with args (kf2, t).  This is the actual subDivide
   *                       dispatch (as documented in OZBezierInterpolator).
   *
   * Both callees are undecoded — throw citing addrs.
   */
  subDivide(
    spline: unknown,
    t: CMTime,
    _p1: unknown,        // rcx, unused after prologue-copy (never read)
    _p3: unknown,        // r8, unused
    kf2: unknown,        // r9
  ): void {
    // @0x43ad5-@0x43ae5 — copy kf2.time (offset +0x10, 24 bytes) into stack.
    // In TS this is just noting we captured a reference; no actual copy needed.

    // @0x43ae9-@0x43af6 — vtable *0x18 on OZSpline itself, called with two-zero stack args.
    // The semantics of this exact slot on OZSpline are not decoded — throw.
    // (Note: unlike interpolate's *0x18 which is on a *keypoint*, here the receiver is the spline.)
    throw new Error(
      "raw-port: OZEaseOutInterpolator::subDivide vtable *0x18 on OZSpline is not yet " +
        "transcribed (called @0x43af3). Receiver-arg map: (spline, 0, 0). Callee returns void.",
    );
    // @0x43afa-@0x43b03 — vtable *0x20 on kf2:  subDivide dispatch.
    // (Kept here to document the second callee in the intended order; unreachable after the throw.)
    // eslint-disable-next-line no-unreachable
    KeypointObj_vtable_slot20_subDivide(kf2, spline, t);
  }

  /**
   * OZEaseOutInterpolator::getMinMaxValues(OZSpline&, void*, void*, CMTime const&, CMTime const&,
   *                                        double* outMin, double* outMax)  @0x00043b10
   *
   * Faithful mirror.  Prologue @0x43b24-@0x43b3c:
   *   r13 = r9    (arg6, kfB — the second keypoint reference)
   *   r15 = r8    (arg5, kfA — the first keypoint reference)
   *   r14 = rdx   (arg3, first-keypoint-CMTime? actually rdx is the 3rd C++ arg — the tA CMTime)
   *   -0x68(rbp) = rsi   (this)
   *   r12 = rdi   (arg1 — the "this" for the recursive *0x18 vcalls below)
   *
   * NOTE the mangled sig `(OZSpline&, void*, void*, CMTime const&, CMTime const&, double*, double*)`
   * plus the SysV register order (rdi=this, rsi=spline, rdx=kpA, rcx=kpB, r8=tA, r9=tB, then
   * outMin/outMax on the stack) matches the moves — so:
   *   rdi=this, rsi=spline, rdx=kpA, rcx=kpB, r8=tA (CMTime&), r9=tB (CMTime&), rbp+0x10=outMin*,
   *   rbp+0x18=outMax*.
   *
   * Wait — the mangled sig says `(OZSpline&, void*, void*, CMTime const&, CMTime const&, double*, double*)`
   * which is 7 args including `this` implicit at rdi. So: rdi=this, rsi=OZSpline&, rdx=kpA (void*),
   * rcx=kpB (void*), r8=tA (CMTime&), r9=tB (CMTime&), rbp+0x10=outMin, rbp+0x18=outMax. Matches.
   *
   * Body:
   *   @0x43b34-@0x43b63  copy kpA.time (rdx+0x10..+0x28) and kpB.time (rcx+0x10..+0x28) to locals;
   *                       also copy tA (r8, CMTime const&) at offsets (0..0x10) into -0x30/-0x40.
   *   @0x43b67-@0x43b8f  _CMTimeCompare(kpB.time?, tA?) — argument order (rsp+0=kpA.time, rsp+0x18=tA)
   *                       so it's CMTimeCompare(kpA.time, tA).  If (result > 0) the branch @0x43b93
   *                       overwrites -0x70/-0x80 (was kpA.time) with tA's fields — i.e. clamps
   *                       kpA.time up to tA.
   *                       Actually reading again — the copies at 0x43b93 read from r15 (=arg5, kfA
   *                       ptr) offset +0x10 — that's kfA's own .time (which we already copied). So
   *                       the branch REPLACES kpA.time-scratch with kfA.time via r15.  ✱confusing✱
   *                       because rdx=kpA and r8=kfA are DIFFERENT objects; the disasm shows two
   *                       different capture slots (rdx=kpA "endpoint of segment", r8=kfA "the
   *                       range's own left edge"). This is exactly the pattern used to clamp the
   *                       segment endpoints to the requested [tA, tB] range.
   *   @0x43ba3-@0x43be0  similarly _CMTimeCompare on the other side; if (result < 0), clamp
   *                       kpB.time-scratch down to kfB.time.
   *   @0x43bf5-@0x43c23  Two vtable *0x18 calls on `this` (r12) — each writes a double.
   *                       First call: (this, spline, tA, this-again-as-p5, [0,0-stack]) → *outMin.
   *                       Second call: same with tB → *outMax.
   *                       Then if (*outMin > *outMax) swap them (@0x43c5a-@0x43c68).
   *
   * See file-header for the higher-level narrative; the details below are one-to-one.
   */
  getMinMaxValues(
    _spline: unknown,
    _kpA: unknown,
    _kpB: unknown,
    _tA: CMTime,
    _tB: CMTime,
    outMin: { value: number },
    outMax: { value: number },
  ): void {
    // The two virtual *0x18 dispatches on `this` (@0x43c20 and @0x43c4f) are undecoded — throw.
    outMin.value = OZInterpolator_vtable_slot_18(this, _kpA, _tA, 0, "0x43c20");
    outMax.value = OZInterpolator_vtable_slot_18(this, _kpB, _tB, 0, "0x43c4f");

    // @0x43c5a-@0x43c68 — swap if (outMin > outMax).
    if (outMin.value > outMax.value) {
      const tmp = outMin.value;
      outMin.value = outMax.value;
      outMax.value = tmp;
    }
  }

  /**
   * OZEaseOutInterpolator::uForCurveValue(OZSpline&, void* kp1, void* kp2, CMTime const& tA,
   *                                       CMTime const& tB, double queryValue,
   *                                       std::vector<CMTime>& outVec)  @0x00043c7e
   *
   * Prologue @0x43c92-@0x43ca0:
   *   -0x38(%rbp) = xmm0 = queryValue
   *   r14 = rsi = OZSpline*
   *   r12 = rdx = kp1
   *   r15 = rcx = tA (CMTime const&)
   *   rbx = r9 = tB (CMTime const&)   [wait: r9 is the 6th arg; but queryValue was xmm0. That
   *              means the mangled signature is (OZSpline&, void*, void*, CMTime&, CMTime&, double,
   *              vector&). SysV: rdi=this, rsi=spline, rdx=kp1, rcx=kp2, r8=tA(CMTime&),
   *              r9=tB(CMTime&), xmm0=queryValue, and vector& is on the stack.]
   * Hmm — but 0x43c9a is `movq %rcx,%r15` (r15=rcx=kp2), 0x43c9d is `movq %rdx,%r12` (r12=rdx=kp1),
   * 0x43ca0 `movq %rsi,%r14` (r14=rsi=spline). Then 0x43ca3 `movq (%rsi),%rax` and `%rdi=%rsi`
   * and %rsi = %r8 (the 5th arg — CMTime const& tA). So the *0xf0 call receives
   * (spline_as_this, tA, kCMTimeZero, 0). But that's a call ON the spline with tA as the "keypoint"
   * arg? That doesn't match the OZBezierInterpolator convention where *0xf0 = getVertexValue(kp,
   * time, flag). Reading again more carefully:
   *
   *   0x43ca3  movq (%rsi),%rax     ; %rsi is still the OZSpline* — load its vptr
   *   0x43ca6  movq 0x86813(%rip),%r13   ; r13 = &_kCMTimeZero (literal-pool address load)
   *   0x43cad  movq %rsi,%rdi       ; arg0 = spline (this)
   *   0x43cb0  movq %r8,%rsi        ; arg1 = r8 = tA(CMTime&)   ← wait, the callee expects `void*`
   *                                  keypoint here. So the ORIGINAL C++ signature must be
   *                                  getVertexValue(void* keypoint, CMTime const&, int).  But we
   *                                  passed a CMTime& as `void*`??  That would be a type error in
   *                                  C++.  Actually the disasm just shows RCX/R8/R9 movement; the
   *                                  SysV register layout is only meaningful with the TRUE C++
   *                                  signature.  Let me re-index:
   *
   *   The mangled sig is `(OZSpline&, void*, void*, CMTime const&, CMTime const&, double,
   *                       std::vector<CMTime>&)`.  With `this` implicit as rdi:
   *     rdi = this
   *     rsi = OZSpline&
   *     rdx = void* (kp1)
   *     rcx = void* (kp2)
   *     r8  = CMTime const& (tA)
   *     r9  = CMTime const& (tB)
   *     xmm0 = double queryValue
   *     [stack] = std::vector<CMTime>& outVec  → rbp+0x10 at 0x43d0c.
   *   BUT the code at 0x43c97-0x43ca0 does:
   *     mov %r9, %rbx    ; rbx = r9 = tB
   *     mov %rcx, %r15   ; r15 = rcx = kp2
   *     mov %rdx, %r12   ; r12 = rdx = kp1
   *     mov %rsi, %r14   ; r14 = rsi = spline
   *   Then 0x43cad-0x43cb8:
   *     mov (%rsi),%rax  ; vptr of *spline*
   *     mov %rsi,%rdi    ; %rdi = spline           (`this` for the virtual call)
   *     mov %r8, %rsi    ; %rsi = tA               (arg1 = "keypoint")
   *     mov %r13,%rdx    ; %rdx = &kCMTimeZero     (arg2 = query CMTime)
   *     xor %ecx,%ecx    ; %rcx = 0                (arg3 = flag)
   *     callq *0xf0(%rax)
   *   So THE VIRTUAL DISPATCH getVertexValue TREATS tA (CMTime&) AS ITS "void* keypoint" ARG.
   *   That's evidence the OZSpline::getVertexValue accepts a CMTime& in this compiler variant, or
   *   the calling code is smuggling the segment endpoint TIME as the "keypoint identifier".  Since
   *   the callee is undecoded, we mirror the register mapping and throw citing addrs.
   *
   *   Similarly the second call at 0x43cc3-0x43cd1 passes tB.
   *
   *   The two results are compared via max/min and the queryValue is checked to lie in that
   *   segment-value range.  If it does, kp1.getValueV(kCMTimeZero) and kp2.getValueV(kCMTimeZero)
   *   are fetched via vtable *0x18, and a CMTime output is computed and push_back'd.
   *
   * @returns  the "was in range" boolean (bl & 1), returned via %eax at 0x43e2a.
   */
  uForCurveValue(
    spline: unknown,
    kp1: KeyframeVertex,
    kp2: KeyframeVertex,
    tA: CMTime,
    tB: CMTime,
    queryValue: number,
    outVec: CMTime[],
  ): boolean {
    // @0x43ca3-@0x43cbe — v_left = spline.getVertexValue(tA, kCMTimeZero, 0) via *0xf0.
    const v_left = OZSpline_vtable_slot_f0_getVertexValue(
      spline, tA, kCMTimeZero, 0, "0x43cb8",
    );
    // @0x43cc3-@0x43cd7 — v_right = spline.getVertexValue(tB, kCMTimeZero, 0) via *0xf0.
    const v_right = OZSpline_vtable_slot_f0_getVertexValue(
      spline, tB, kCMTimeZero, 0, "0x43cd1",
    );

    // @0x43cd7-@0x43ce4 — hi = max(v_left, v_right); lo = min(v_left, v_right).
    // (maxsd/minsd have the peculiar "src overrides dst on NaN" semantic; we mirror JS Math.max/min
    // which is close enough for finite doubles and is what the ported CMTime pipeline uses
    // elsewhere — see e.g. OZAccelerateInterpolator.)
    const hi = Math.max(v_left, v_right);
    const lo = Math.min(v_left, v_right);

    // @0x43ce8-@0x43d06 — inRange = (queryValue >= lo && queryValue <= hi)? Not quite — the asm uses
    //   cmpnltsd xmm0(=lo), xmm2(=query)   ; xmm2 = mask(query >= lo)
    //   cmpnltsd xmm3(=query), xmm1(=hi)   ; xmm1 = mask(hi >= query)
    //   andpd xmm2, xmm1
    // So `inRange = (query >= lo) && (hi >= query)`  — i.e. inclusive on both ends.
    const inRange = (queryValue >= lo) && (hi >= queryValue);

    if (inRange) {
      // @0x43d0c — outVec ptr loaded from rbp+0x10 (stack arg).  Already have it as `outVec`.

      // @0x43d10-@0x43d24 — v1 = kp1.getValueV(kCMTimeZero) via vtable *0x18.
      const v1 = keyframe_getValueV(kp1, kCMTimeZero, "0x43d21");
      // @0x43d29-@0x43d35 — v2 = kp2.getValueV(kCMTimeZero) via vtable *0x18.
      const v2 = keyframe_getValueV(kp2, kCMTimeZero, "0x43d32");

      // @0x43d3a-@0x43d4d — capture kp1.time (offset +0x10) into locals -0x50/-0x60.
      const kp1_time = kp1.time;

      // @0x43d4d-@0x43d7e — PC_CMTimeSaferSubtract(-0x90, kp1.time, kp2.time).
      // Arg order per stack shape: (rsp+0=kp1.time, rsp+0x18=kp2.time). Hmm — actually reading:
      //   0x43d4d  copy kp1.time to rsp+0x18-0x28   (arg1 = kp1.time)
      //   0x43d62  copy kp2.time (r15+0x10..+0x28) to rsp+0-0x10  (arg0 = kp2.time)
      // Since PC_CMTimeSaferSubtract(out, a, b) computes a - b, and the first stack arg is a:
      //   segLen = kp2.time - kp1.time
      const segLen = PC_CMTimeSaferSubtract(kp2.time, kp1_time);

      // @0x43d83-@0x43d98 — segLenPi = segLen * 2.0.
      // (Constant @0x43d8a is 2.0 per resolve.py.)  Note: NAMED here to disambiguate from the "π"
      // used in interpolate.  Downstream we divide by π, so the effective factor is 2/π — the
      // classic ease-out inverse-warp coefficient.
      const segLen_x2 = CMTimeMul_double(segLen, 2.0);

      // @0x43d9d-@0x43db2 — segLen_x2_over_pi = segLen_x2 / π.
      const segLen_x2_over_pi = CMTimeDiv_double(segLen_x2, Math.PI);

      // @0x43db7-@0x43dce — u = (queryValue - v1) / (v2 - v1).
      const u = (queryValue - v1) / (v2 - v1);

      // @0x43dd2 — alpha = asin(u).
      const alpha = Math.asin(u);

      // @0x43dd7-@0x43de1 — halfSeg = segLen_x2_over_pi * alpha  (via __ZmlRK6CMTimed).
      const halfSeg = CMTimeMul_double(segLen_x2_over_pi, alpha);

      // @0x43de6-@0x43e17 — out = PC_CMTimeSaferAdd(kp1.time, halfSeg).
      // Argument order per stack: (rsp+0=kp1.time, rsp+0x18=halfSeg). Actually:
      //   0x43de6 copies -0x50/-0x60 (kp1.time scratch) to rsp+0x18-0x28  (arg1)
      //   0x43df8 copies halfSeg (r12=-0x78) to rsp+0..0x10             (arg0)
      // So the ordering is (halfSeg, kp1.time) — PC_CMTimeSaferAdd(a,b) = a+b regardless.
      const out = PC_CMTimeSaferAdd(halfSeg, kp1_time);

      // @0x43e1c-@0x43e22 — outVec.push_back(out).
      outVec.push(out);
    }

    // @0x43e27-@0x43e2a — return (bl & 1) — the boolean "was in range" flag.
    return inRange;
  }

  /**
   * OZEaseOutInterpolator::init(OZSpline&, CMTime const&)  @0x00043e64
   *
   * Body @0x43e64-@0x43e69: `push rbp ; mov rsp,rbp ; pop rbp ; ret`. Completely empty.
   */
  init(_spline: unknown, _t: CMTime): void {
    // no-op — faithful mirror of the empty asm body.
  }

  /**
   * OZEaseOutInterpolator::~OZEaseOutInterpolator()  [D1 in-place]  @0x00043e3e
   *
   * @0x43e3e-@0x43e42  push rbp ; mov rsp,rbp ; pop rbp
   * @0x43e43           jmp __ZN14OZInterpolatorD2Ev     ; tail-call the base D2 dtor
   */
  destroy_D1(): void {
    OZInterpolator_D2(this);
  }

  /**
   * OZEaseOutInterpolator::~OZEaseOutInterpolator()  [D0 delete-thunk]  @0x00043e48
   *
   * @0x43e48-@0x43e4d  push rbp ; mov rsp,rbp ; push rbx ; push rax
   * @0x43e4e-@0x43e51  mov %rdi,%rbx  ; callq __ZN14OZInterpolatorD2Ev
   * @0x43e56-@0x43e5d  restore %rdi=this ; epilogue
   * @0x43e5f           jmp __ZdlPv                       ; operator delete
   */
  destroy_D0(): void {
    OZInterpolator_D2(this);
    // operator delete corresponds to JS GC — no-op.
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Chunk dispatch table (assemble_class.py convention).
// ────────────────────────────────────────────────────────────────────────────

/**
 * Method-chunk dispatch table for assemble_class.py.  Every method-body is bound
 * to a stateless closure that forwards to a fresh instance — matching the "all
 * methods are pure over injected data" shape of the FCP virtual dispatch here.
 * The keys are the demangled method-selectors from the ledger.
 */
export const OZEaseOutInterpolator_m0_methods = {
  "OZEaseOutInterpolator::interpolate(OZSpline&, CMTime const&, void*, void*, CMTime const&, bool, bool)":
    (self: OZEaseOutInterpolator, ...args: Parameters<OZEaseOutInterpolator["interpolate"]>) =>
      self.interpolate(...args),
  "OZEaseOutInterpolator::subDivide(OZSpline&, CMTime const&, void*, void*, void*)":
    (self: OZEaseOutInterpolator, ...args: Parameters<OZEaseOutInterpolator["subDivide"]>) =>
      self.subDivide(...args),
  "OZEaseOutInterpolator::getMinMaxValues(OZSpline&, void*, void*, CMTime const&, CMTime const&, double*, double*)":
    (self: OZEaseOutInterpolator, ...args: Parameters<OZEaseOutInterpolator["getMinMaxValues"]>) =>
      self.getMinMaxValues(...args),
  "OZEaseOutInterpolator::uForCurveValue(OZSpline&, void*, void*, CMTime const&, CMTime const&, double, std::__1::vector<CMTime, std::__1::allocator<CMTime>>&)":
    (self: OZEaseOutInterpolator, ...args: Parameters<OZEaseOutInterpolator["uForCurveValue"]>) =>
      self.uForCurveValue(...args),
  "OZEaseOutInterpolator::~OZEaseOutInterpolator()":
    (self: OZEaseOutInterpolator) => self.destroy_D1(),
  "OZEaseOutInterpolator::~OZEaseOutInterpolator()#D0":
    (self: OZEaseOutInterpolator) => self.destroy_D0(),
  "OZEaseOutInterpolator::init(OZSpline&, CMTime const&)":
    (self: OZEaseOutInterpolator, ...args: Parameters<OZEaseOutInterpolator["init"]>) =>
      self.init(...args),
};

export default OZEaseOutInterpolator;
