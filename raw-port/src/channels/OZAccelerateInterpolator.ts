// OZAccelerateInterpolator.ts
// Faithful raw-port of ProChannel::OZAccelerateInterpolator.
//
// Source: ProChannel framework (macOS FCP), x86_64 slice.
//   ports:
//     - OZAccelerateInterpolator::easeTime(OZSpline&, CMTime const&, void*, void*) @0xa4d0e
//     - OZAccelerateInterpolator::~OZAccelerateInterpolator()  [D1]                 @0xa4e88
//     - OZAccelerateInterpolator::~OZAccelerateInterpolator()  [D0, delete-thunk]   @0xa4e92
//
// Provenance: every load/store, callq, and RIP-relative const is cited by @0xADDR
// from the otool -tV extraction of ProChannel (x86_64 slice), stored at
//   raw-port/re/disasm/ProChannel.OZAccelerateInterpolator.*.s
// The easeTime body is ICF-folded in the emitted disasm (label lost by otool),
// but the code block is unambiguous — anchored between the labeled D1 dtor at 0xa4e88
// and the preceding function tail. We transcribe the body verbatim from that range.
//
// Class shape:
//   OZAccelerateInterpolator : OZLinearInterpolator (D1 tail-calls the base dtor @0xa4e8d).
//   The vtable at __ZTV24OZAccelerateInterpolator lives at 0xe29e0 (x86_64).

import {
  type CMTime,
  kCMTimeZero,
  CMTimeGetSeconds,
  PC_CMTimeSaferSubtract,
  PC_CMTimeSaferAdd,
  CMTimeMul_double,
} from "../infra/CMTime.js";
import { easeInOut as PCMath_easeInOut } from "../infra/PCMath.js";

// -----------------------------------------------------------------------------
// Undecoded frontier callees (throwing stubs — each cites its call site + symbol).
// -----------------------------------------------------------------------------

/**
 * Base-class dtor: __ZN20OZLinearInterpolatorD2Ev — called from both D1 @0xa4e8d and D0 @0xa4e9b.
 * Not yet ported.
 */
function OZLinearInterpolator_D2(_thisPtr: OZAccelerateInterpolator): void {
  throw new Error(
    "raw-port: OZLinearInterpolator::~OZLinearInterpolator() (D2 base dtor) is not yet ported " +
      "(called from ~OZAccelerateInterpolator D1 @0xa4e8d and D0 @0xa4e9b)"
  );
}

/**
 * Deallocation stub: __ZdlPv (operator delete) — tail-jumped from D0 @0xa4ea9.
 */
function operator_delete(_thisPtr: OZAccelerateInterpolator): void {
  throw new Error("raw-port: ::operator delete is not yet ported (tail-jmp from D0 @0xa4ea9)");
}

/**
 * OZSpline vtable slot @+0x28 — virtual call site callq *0x28(%rax) @0xa4d38.
 * rax = *(vptr of r14) and the this-pointer for the vcall is r14. The rsi arg is kCMTimeZero.
 * Returns a double in xmm0.
 *
 * The concrete OZSpline vtable is not yet decoded. We stub the slot and document its ABI:
 *   double slot28(void* receiver, CMTime const& t)
 */
function OZSpline_vtable_slot28(_spline: unknown, _time: CMTime): number {
  throw new Error(
    "raw-port: OZSpline vtable[+0x28] (virtual dispatch @0xa4d38) is not yet ported. " +
      "Signature: double(OZSpline*, CMTime const&). Concrete class + vtable index unknown."
  );
}

// -----------------------------------------------------------------------------
// Class
// -----------------------------------------------------------------------------

/**
 * OZAccelerateInterpolator — an interpolator that eases a CMTime by feeding an
 * "acceleration" setting (fetched via a virtual call on an OZSpline) to
 * PCMath::easeInOut, then remapping the eased normalized u back to a CMTime in the
 * segment [t_next, t_nextNext].
 *
 * The class inherits from OZLinearInterpolator; base fields occupy some prefix bytes.
 * easeTime three "context" pointer args (an OZSpline* and two curve-side context ptrs)
 * are supplied by the caller, not stored on this.
 */
export class OZAccelerateInterpolator {
  readonly __brand = "OZAccelerateInterpolator" as const;

  /**
   * OZAccelerateInterpolator::easeTime(OZSpline&, CMTime const&, void*, void*) @0xa4d0e
   *
   * Returns a CMTime via SysV sret. Native ABI:
   *   rdi = &result (sret)          -> rbx
   *   rsi = this                     (base-class ptr; unused after prologue)
   *   rdx = &spline (OZSpline&)      (not captured by name; see r14 receiver below)
   *   rcx = &t (CMTime const&)       -> r13
   *   r8  = currCtx (void*)          -> r14 — the OZSpline* receiver for the vcall
   *   r9  = nextCtx (void*)          -> r12
   *
   * NOTE: the disassembly captures rcx->r13, r8->r14, r9->r12, rdi->rbx. rdx (the
   * OZSpline& in the source-level signature) is not moved to a callee-saved reg — this
   * is consistent with the vtable call being on r14 (the void* that IS the spline receiver
   * in this compiled variant). We surface the caller-observable behavior via a spline
   * parameter that maps to the r8/r14 receiver.
   *
   * Full body @0xa4d0e..0xa4e86 — 130 bytes, transcribed step-by-step in the numbered blocks
   * below. Constants decoded from the RIP-relative doubles:
   *   @0xa4d3b  const @0xb05f0 = 2.0
   *   @0xa4d47  const @0xb03c0 = 0.5
   *   @0xa4e11  const @0xaf528 = 1.0
   *
   * Semantics: given segment (curr -> t_next -> t_nextNext) and input time t,
   *   1. accelIn = (2 - spline.slot28(kCMTimeZero)) * 0.5                    @0xa4d3b..0xa4d4f
   *   2. localDelta = (curr - t_next).seconds                                @0xa4d54..0xa4dab
   *   3. segmentDur = (t_next - t_nextNext).seconds                          @0xa4db5..0xa4df7
   *   4. u = localDelta / segmentDur                                         @0xa4dfc..0xa4e01
   *   5. eased_u = PCMath.easeInOut(t=u, aI=accelIn, aO=0, t0=0, t1=1).out   @0xa4e05..0xa4e2d
   *   6. scaled = segmentDurCMTime * eased_u  (operator*(CMTime, double))    @0xa4e38..0xa4e42
   *   7. result = PC_CMTimeSaferAdd(t_next, scaled)                          @0xa4e47..0xa4e70
   */
  easeTime(
    _spline: unknown,
    t: CMTime,
    currCtxSpline: unknown,
    nextCtx: unknown
  ): CMTime {
    // @0xa4d2b..0xa4d38 — virtual call on currCtxSpline via vtable[+0x28] with kCMTimeZero.
    const splineVal = OZSpline_vtable_slot28(currCtxSpline, kCMTimeZero);

    // @0xa4d3b..0xa4d4f  accelIn = (2.0 - splineVal) * 0.5
    const accelIn = (2.0 - splineVal) * 0.5;

    // @0xa4d54..0xa4dab
    //   curr   = t                (from r13; local 24-byte copy)
    //   t_next = *(r14 + 0x10)    (CMTime lives at spline+0x10)
    //   localDelta = (curr - t_next).seconds
    const t_next = readCMTimeAtOffset16(currCtxSpline);
    const localDelta = CMTimeGetSeconds(PC_CMTimeSaferSubtract(t, t_next));

    // @0xa4db5..0xa4df7
    //   t_nextNext = *(r12 + 0x10)
    //   segmentDur = (t_next - t_nextNext).seconds
    const t_nextNext = readCMTimeAtOffset16(nextCtx);
    const segmentDurCMTime = PC_CMTimeSaferSubtract(t_next, t_nextNext);
    const segmentDurSec = CMTimeGetSeconds(segmentDurCMTime);

    // @0xa4dfc..0xa4e01  u = localDelta / segmentDurSec
    const u = localDelta / segmentDurSec;

    // @0xa4e05..0xa4e2d  PCMath.easeInOut(t=u, aI=accelIn, aO=0, t0=0, t1=1)
    //   speed-out ptr is null @0xa4e2b (xorl %esi, %esi); we discard .speed here.
    const eased = PCMath_easeInOut(u, accelIn, 0.0, 0.0, 1.0).out;

    // @0xa4e38..0xa4e42  scaled = segmentDurCMTime * eased_u (operator*(CMTime const&, double))
    const scaled = CMTimeMul_double(segmentDurCMTime, eased);

    // @0xa4e47..0xa4e70  result = t_next + scaled  (via PC_CMTimeSaferAdd)
    return PC_CMTimeSaferAdd(t_next, scaled);
  }

  /**
   * OZAccelerateInterpolator::~OZAccelerateInterpolator() [D1 in-place dtor] @0xa4e88
   *
   * Body:
   *   @0xa4e88..0xa4e8c  pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   @0xa4e8d           jmp __ZN20OZLinearInterpolatorD2Ev     ; tail-call base D2
   */
  destroy_D1(): void {
    OZLinearInterpolator_D2(this);
  }

  /**
   * OZAccelerateInterpolator::~OZAccelerateInterpolator() [D0 delete-thunk] @0xa4e92
   *
   * Body:
   *   @0xa4e92..0xa4e97  pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   @0xa4e98           movq %rdi, %rbx
   *   @0xa4e9b           callq __ZN20OZLinearInterpolatorD2Ev  ; base D2 (not tail-call)
   *   @0xa4ea0..0xa4ea8  restore rdi=this ; epilogue
   *   @0xa4ea9           jmp _operator_delete(void*)  (__ZdlPv)
   */
  destroy_D0(): void {
    OZLinearInterpolator_D2(this);
    operator_delete(this);
  }
}

/**
 * Read the CMTime stored at container + 0x10 — the shape of the r14/r12 "context" pointer
 * shared with the raw FCP asm. In the port we do not have real memory offsets, so this
 * helper is a documented indirection: callers of easeTime must construct a wrapper whose
 * .timeAt16 field yields the CMTime the raw asm reads via
 *   movq 0x10(%r), q0 ; movq 0x20(%r), x8.
 *
 * A throwing stub here is faithful — no real memory model exists to answer this. Callers
 * that provide a well-formed wrapper (see the CMTimeAt16 protocol below) will succeed.
 */
function readCMTimeAtOffset16(container: unknown): CMTime {
  if (container && typeof container === "object" && "timeAt16" in container) {
    const t = (container as { timeAt16: CMTime }).timeAt16;
    return t;
  }
  throw new Error(
    "raw-port: OZAccelerateInterpolator::easeTime requires currCtxSpline and nextCtx to expose " +
      "a `timeAt16: CMTime` field mirroring the raw FCP *(ptr + 0x10) CMTime load " +
      "(@0xa4d69 and @0xa4dc8). Provide a wrapper object or port the concrete container class."
  );
}

/**
 * Protocol type callers can use to satisfy the CMTime@+0x10 loads in easeTime.
 */
export interface CMTimeAt16 {
  timeAt16: CMTime;
}

export default OZAccelerateInterpolator;
