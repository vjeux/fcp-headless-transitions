// MaskBaseSubSegmentationInfo.ts — a data-carrier struct used by FFMaskedEffectBase to describe
// a single sub-segment of a mask's "missing synthesized data" report: a bool flag, an
// FFEffectMissingSynthesizedDataState enum, a CMTimeRange, and a PCNSRef<NSString*>. The
// class' `mergeWith(other)` combines two sub-segment infos by ORing the flag, calling the
// (external) FCP merge fn on the state, taking the CMTimeRange intersection, and adopting the
// other's NSString if set.
//
// DECODE: raw-port/re/disasm/Flexo.MaskBaseSubSegmentationInfo.all.s (Flexo binary x86_64 slice,
// mangled symbols __ZN27MaskBaseSubSegmentationInfoC{1,2}E* and __ZN27MaskBaseSubSegmentation-
// Info9mergeWithERKS_ starting at file-offset 0x609610).
//
// Struct layout (recovered — all offsets confirmed by ctor body reads):
//   +0x00 hasMissingData        u8    (`movb $0x0/$0x1, (%rdi)` @0x609614 / @0x60965a)
//   +0x08 state                 i64   (FFEffectMissingSynthesizedDataState — copied as %rsi
//                                      whole 8 bytes @0x60965d)
//   +0x10 range.start.value..flags     (2×16B `movups %xmm0/%xmm1/%xmm2` @0x609631-0x609639)
//   +0x18 range.start.epoch
//   +0x20 range.duration.value..flags
//   +0x28 range.duration.epoch
//   +0x30 (range payload extends here — 48B total per CMTimeRange; last 16B live at +0x30-+0x3f)
//   +0x40 nsref                 PCNSRef (holds NSString*) — `movq %rdx, 0x40(%rdi)` @0x6096d9,
//                                followed by `addq $0x40, %rbx ; callq ...PCNSRefImpl::retain`
//                                @0x6096dd-0x6096e4; so +0x40 is a PCNSRef payload (the wrapper
//                                calls retain on construction, assign, and release on destruct).
// Total sizeof ≈ 0x48 (range is 48B = 0x30, at offset 0x10 -> 0x40, plus 8B PCNSRef).
//
// Externals still-to-decode (throwing stubs cite their callee addresses):
//   • _FFMergeMissingSynthesizedDataStates — external free fn merging two enum-state values.
//   • _PC_CMTimeRangeEnd(range) — returns range.start + range.duration (CoreMedia-style helper).
//   • _PC_CMTimeRangeMakeWithStartEnd(start, end) — builds a CMTimeRange from two CMTimes.
//   • __ZN12ProCore_Impl11PCNSRefImplaSERKS0_ (PCNSRefImpl::operator=) — assignment operator.
//   • __ZNK12ProCore_Impl11PCNSRefImpl6retainEv / 7releaseEv — CFRetain/CFRelease-style.
//   • _kPC_CMTimeRangeInfinite / _kCMTimeZero / _kCMTimeRangeZero — constants (transcribed).
//   • FFEffectMissingSynthesizedDataState — opaque i64 (enum-like) — passed through.

import { type CMTime, kCMTimeZero, CMTimeCompare, PC_CMTimeSaferAdd } from "../infra/CMTime";
import { type PCTimeRange } from "../infra/PCTimeRange";

// ── Opaque types ─────────────────────────────────────────────────────────────
// @0x609650 ctor takes FFEffectMissingSynthesizedDataState as an integer (8B — `movq %rsi`).
export type FFEffectMissingSynthesizedDataState = number;

// PCNSRef<NSString*> — a retained-Objective-C-pointer wrapper. The retain/release/assign path
// (@__stubs 0x1496f90/0x1496f96/0x1496120 in Flexo) is out of scope for this file; treat the
// payload as an opaque NSString* handle (string here — NSString content is not decoded).
export interface PCNSRef_NSString {
  ref: string | null;   // the retained NSString*, or null
}

/**
 * kPC_CMTimeRangeInfinite (Flexo literal-pool @rip+0x12e1ed2 from @0x60961f) — the CoreMedia
 * "infinite" range: start = kCMTimeZero, duration = kCMTimePositiveInfinity. The default ctor
 * (@0x609610) copies this into the newly-constructed range slot as three `movups` (0x30 bytes).
 *
 * Value transcribed from the CoreMedia SDK constant (public API):
 *   kPC_CMTimeRangeInfinite = { start: kCMTimeZero, duration: kCMTimePositiveInfinity }
 * where kCMTimePositiveInfinity = { value:0, timescale:0, flags:PositiveInfinity|Valid, epoch:0 }.
 */
export const kPC_CMTimeRangeInfinite: PCTimeRange = {
  start: {
    value: 0n,
    timescale: 0,
    flags: 0x05,  // kCMTimeFlags_Valid (0x01) | kCMTimeFlags_PositiveInfinity (0x04)
    epoch: 0n,
  },
  duration: {
    value: 0n,
    timescale: 0,
    flags: 0x05,
    epoch: 0n,
  },
};

/**
 * kCMTimeRangeZero (Flexo literal-pool @rip+0x12df91d from @0x6099ec) — the zero range:
 *   { start: kCMTimeZero, duration: kCMTimeZero }.
 * Assigned into the merged range when the intersection is empty (`mergeWith` @0x609a0a-0x609a24).
 */
export const kCMTimeRangeZero: PCTimeRange = {
  start: {
    value: kCMTimeZero.value,
    timescale: kCMTimeZero.timescale,
    flags: kCMTimeZero.flags,
    epoch: kCMTimeZero.epoch,
  },
  duration: {
    value: kCMTimeZero.value,
    timescale: kCMTimeZero.timescale,
    flags: kCMTimeZero.flags,
    epoch: kCMTimeZero.epoch,
  },
};

// ── The class ────────────────────────────────────────────────────────────────

export class MaskBaseSubSegmentationInfo {
  hasMissingData: boolean;                          // +0x00 (u8)
  state: FFEffectMissingSynthesizedDataState;       // +0x08 (i64)
  range: PCTimeRange;                               // +0x10..+0x3f (48B)
  nsref: PCNSRef_NSString;                          // +0x40 (PCNSRef payload)

  /**
   * MaskBaseSubSegmentationInfo() — default ctor.
   * @Flexo 0x0000000000609610  (__ZN27MaskBaseSubSegmentationInfoC1Ev / C2Ev)
   *
   * DECODE (raw-port/re/disasm/Flexo.MaskBaseSubSegmentationInfo.all.s @0x609610-0x609646):
   *   0x609614  movb  $0x0, (%rdi)                → hasMissingData = false
   *   0x609617  movq  $0x0, 0x8(%rdi)             → state = 0
   *   0x60961f-0x609639  load _kPC_CMTimeRangeInfinite (%rip literal-pool) as 3× xmm (48B) and
   *                      store at 0x10/0x20/0x30(%rdi)
   *                                                → range = kPC_CMTimeRangeInfinite
   *   0x60963d  movq  $0x0, 0x40(%rdi)            → nsref.ref = null
   *   0x609645  popq %rbp ; retq
   * NB: PCNSRefImpl's payload is a raw pointer; initializing to 0 makes it "empty" (no retain).
   */
  constructor();
  /**
   * MaskBaseSubSegmentationInfo(FFEffectMissingSynthesizedDataState, CMTimeRange, NSString*)
   * @Flexo 0x0000000000609650  (C2E35FF...) and @0x0000000000609650 /0x6096b0 (C1E35FF...).
   *
   * DECODE (raw-port/re/disasm/Flexo.MaskBaseSubSegmentationInfo.all.s @0x609650-0x60968d,
   *         @0x6096b0-0x6096ed — both signatures are byte-identical, C1 vs C2 differ only in
   *         mangling for base/complete-object ctor variants):
   *   0x60965a  movb $0x1, (%rdi)                 → hasMissingData = true
   *   0x60965d  movq %rsi, 0x8(%rdi)              → state = arg1 (FFEffectMissingSynthesized-
   *                                                         DataState, passed in %rsi)
   *   0x609661-0x609675  load 0x10(%rbp)/0x20(%rbp)/0x30(%rbp) as 3× xmm and store at
   *                      0x10/0x20/0x30(%rdi)     → range = arg2 (CMTimeRange passed by-value on
   *                                                         the stack frame)
   *   0x609679  movq %rdx, 0x40(%rdi)             → nsref.ref = arg3 (NSString*, in %rdx)
   *   0x60967d-0x609684  addq $0x40, %rbx (rbx=this) ; movq %rbx, %rdi ; callq
   *                      __ZNK12ProCore_Impl11PCNSRefImpl6retainEv                @__stubs 0x1496f90
   *                                                → retain the NSString*
   *   Exception path (0x60968e-0x6096a4): on retain-throw, release the partially-constructed
   *   PCNSRef and _Unwind_Resume — nothing to model in TS (GC).
   */
  constructor(state: FFEffectMissingSynthesizedDataState, range: PCTimeRange, ns: string | null);
  /**
   * MaskBaseSubSegmentationInfo(MaskBaseSubSegmentationInfo const&) — copy ctor.
   * @Flexo 0x0000000000609710  (C2ERKS_) / 0x0000000000609780  (C1ERKS_)
   *
   * DECODE (raw-port/re/disasm/Flexo.MaskBaseSubSegmentationInfo.all.s @0x609710-0x609758):
   *   0x609717  leaq 0x40(%rdi), %rbx             → &this->nsref
   *   0x60971b  movq $0x0, 0x40(%rdi)             → nsref.ref = null (init before assign)
   *   0x609723-0x609726  movzbl (%rsi)/movb %al, (%rdi)  → hasMissingData = other.hasMissingData
   *   0x609728-0x60972c  movq 0x8(%rsi)/movq %rax, 0x8(%rdi)  → state = other.state
   *   0x609730-0x609744  copy 3× xmm from 0x10/0x20/0x30(%rsi) to 0x10/0x20/0x30(%rdi)
   *                                                → range = other.range (48B memcpy)
   *   0x609748  addq $0x40, %rsi                  → &other.nsref
   *   0x60974f  callq __ZN12ProCore_Impl11PCNSRefImplaSERKS0_    @__stubs 0x1496120
   *                                                → this->nsref = other.nsref (retain/release
   *                                                                  assignment operator)
   */
  constructor(other: MaskBaseSubSegmentationInfo);
  constructor(a?: FFEffectMissingSynthesizedDataState | MaskBaseSubSegmentationInfo,
              b?: PCTimeRange,
              c?: string | null) {
    if (a === undefined) {
      // Default ctor path @0x609610.
      this.hasMissingData = false;
      this.state = 0;
      this.range = {
        start: { ...kPC_CMTimeRangeInfinite.start },
        duration: { ...kPC_CMTimeRangeInfinite.duration },
      };
      this.nsref = { ref: null };
      return;
    }
    if (a instanceof MaskBaseSubSegmentationInfo) {
      // Copy ctor path @0x609710.
      this.hasMissingData = a.hasMissingData;
      this.state = a.state;
      this.range = {
        start: { ...a.range.start },
        duration: { ...a.range.duration },
      };
      // PCNSRefImpl::operator= @__stubs 0x1496120 — copy the retained pointer (retain/release-
      // balanced). In TS with GC there is no retain count; a shallow copy of the ref is exact.
      this.nsref = { ref: a.nsref.ref };
      return;
    }
    // 3-arg ctor path @0x609650 / @0x6096b0.
    if (b === undefined) {
      // 0x60965a wrote $0x1; we would still need the range/ns args — signature requires them.
      // @0x609650 signature "throws" — raise as this path is not reachable via C++ ABI.
      throw new Error("raise: 3-arg ctor requires (state, range, ns) — @Flexo 0x609650");
    }
    this.hasMissingData = true;
    this.state = a as FFEffectMissingSynthesizedDataState;
    this.range = {
      start: { ...b.start },
      duration: { ...b.duration },
    };
    // retain on assignment @__stubs 0x1496f90 — GC handles lifetime in TS.
    this.nsref = { ref: c ?? null };
  }

  /**
   * mergeWith(MaskBaseSubSegmentationInfo const&) — combine two sub-segment infos in place.
   * @Flexo 0x00000000006097f0  (__ZN27MaskBaseSubSegmentationInfo9mergeWithERKS_)
   *
   * DECODE (raw-port/re/disasm/Flexo.MaskBaseSubSegmentationInfo.all.s @0x6097f0-0x609a4f):
   *   0x60980a-0x60980d  movzbl (%rsi)/orb %al, (%rdi)
   *                        → this->hasMissingData |= other->hasMissingData  (bitwise OR of the
   *                          u8 flag byte — matches "any missing data anywhere" semantics)
   *   0x60980f-0x60981c  movq 0x8(%rdi)/0x8(%rsi) as args; callq _FFMergeMissingSynthesized-
   *                      DataStates @external ; movq %rax, 0x8(%r14)
   *                        → this->state = FFMergeMissingSynthesizedDataStates(this->state,
   *                                                                             other->state)
   *   0x609820-0x609841  copy this->range into stack slots -0xe0/-0xd0/-0xc0(%rbp)  (48B)
   *   0x609848-0x609862  copy other->range into stack slots -0xb0/-0xa0/-0x90(%rbp)  (48B)
   *   0x609869-0x609884  copy this->range into stack slots -0x60/-0x50/-0x40(%rbp) (arg buffer)
   *   0x609884-0x609894  load _kCMTimeZero (%rip +0x12dfa8d) into -0x80/-0x70(%rbp)
   *   0x609898-0x6098c0  spill (this->range.start, kCMTimeZero) as CMTimeCompare args;
   *                      callq _CMTimeCompare  → eax = CMTimeCompare(this->range.start, kZero)
   *   0x6098c5-0x6098c7  testl %eax,%eax ; je 0x6099ec
   *                        → if this->range.start == kCMTimeZero, jump to "zero-out" path.
   *   0x6098cd-0x609928  otherwise, copy other->range's fields and re-compare
   *                      CMTimeCompare(other->range.start, kCMTimeZero) — if EQUAL, also jump
   *                      to zero-out (both starts must be non-zero to intersect).
   *   0x609930-0x60998a  else compute this-range-end via _PC_CMTimeRangeEnd(this) and compare
   *                      CMTimeCompare(other->range.start, this-end) ; if <= 0 (jle), jump to
   *                      zero-out branch (other starts at/after this ends → no intersection).
   *   0x60998e-0x6099ea  else compute other-range-end via _PC_CMTimeRangeEnd(other) and compare
   *                      CMTimeCompare(this->range.start, other-end) ; if >= 0 (jns => sign
   *                      bit clear ⇒ non-negative), jump to zero-out (this starts at/after
   *                      other ends). Otherwise fall through to the intersection path @0x609a50.
   *   0x6099ec-0x609a22  ZERO-OUT PATH: load _kCMTimeRangeZero (%rip+0x12df91d) as 3× xmm and
   *                      store at 0x10/0x20/0x30(this)  → this->range = kCMTimeRangeZero.
   *   0x609a24-0x609a3e  if (other->nsref != null) { addq $0x40,rbx ; addq $0x40,r14 ;
   *                        callq PCNSRefImpl::operator=  → this->nsref = other->nsref }
   *                      (Only overwrite when other has a non-null string.)
   *   0x609a3e-0x609a4f  epilogue: return.
   *   0x609a50-0x609bb7  INTERSECTION PATH: compute both ranges' ends via _PC_CMTimeRangeEnd,
   *                      call CMTimeCompare twice to determine max(start) and min(end), then
   *                      _PC_CMTimeRangeMakeWithStartEnd(max_start, min_end) → new range, and
   *                      jump back to 0x609a0a to store it (via the same 3× xmm path used by
   *                      the zero-out branch, sharing the store-and-nsref-copy tail).
   *
   * Semantics: mergeWith(other) sets this->range to the intersection of this->range and
   * other->range (or kCMTimeRangeZero if empty), ORs the missing-data flag, merges the state
   * via the (external) FF fn, and adopts other->nsref if other has one.
   *
   * NOTE (frontier): _FFMergeMissingSynthesizedDataStates and the two CMTimeRange helpers are
   * external symbols we have NOT decoded yet — those calls raise below with @-addr citations.
   */
  mergeWith(other: MaskBaseSubSegmentationInfo): void {
    // 0x60980a-0x60980d  OR the u8 flag
    this.hasMissingData = this.hasMissingData || other.hasMissingData;

    // 0x60980f-0x60981c  state = _FFMergeMissingSynthesizedDataStates(this.state, other.state)
    // External free function not yet decoded — raise citing the callee addr.
    this.state = mergeMissingSynthesizedDataStates_stub(this.state, other.state); // @0x609817

    // 0x609898-0x6098c0  early-exit: if this.range.start == kCMTimeZero  → zero-out path.
    // 0x609923-0x60992a  early-exit: if other.range.start == kCMTimeZero → zero-out.
    // (Both starts must be non-zero-and-finite for the intersection logic to proceed.)
    const thisStartZero = CMTimeCompare(this.range.start, kCMTimeZero) === 0;   // @0x6098c0
    const otherStartZero = CMTimeCompare(other.range.start, kCMTimeZero) === 0; // @0x609923

    let zeroOut = false;
    if (thisStartZero || otherStartZero) {
      zeroOut = true;
    } else {
      // 0x609957  thisEnd = _PC_CMTimeRangeEnd(this.range)  [external — raise citing addr]
      const thisEnd = PC_CMTimeRangeEnd_stub(this.range);   // @0x609957
      // 0x609985  if (CMTimeCompare(other.range.start, thisEnd) <= 0) → zero-out.
      if (CMTimeCompare(other.range.start, thisEnd) <= 0) { // @0x609985
        zeroOut = true;
      } else {
        // 0x6099b5  otherEnd = _PC_CMTimeRangeEnd(other.range)
        const otherEnd = PC_CMTimeRangeEnd_stub(other.range);  // @0x6099b5
        // 0x6099e3-0x6099ea  if (CMTimeCompare(this.range.start, otherEnd) >= 0) → zero-out.
        //   (`js` = sign bit set = negative; so the jump-to-intersect branch is taken only when
        //   the compare result is negative — meaning this.start < otherEnd. Otherwise zero-out.)
        if (CMTimeCompare(this.range.start, otherEnd) >= 0) { // @0x6099e3
          zeroOut = true;
        } else {
          // 0x609a50-0x609bb7  INTERSECTION PATH — decoded but requires PC_CMTimeRangeMakeWith-
          // StartEnd (external, undecoded). The disasm structure is:
          //   startCmp = CMTimeCompare(otherEnd, thisEnd)   @0x609add
          //   endCmp   = CMTimeCompare(thisEnd, otherEnd)   @0x609b0e  (note: symmetric; the
          //             disasm uses two calls but their results are used to select branches)
          //   if (otherEnd <= thisEnd && thisEnd >= otherEnd) — impossible-equal short-circuit
          //     (setle/setns pair) — jumps back to zero-out via 0x609b3a → 0x6099fe
          //   else if (otherEnd >= thisEnd && thisEnd <= otherEnd) — mirror case, same jump.
          //   else PC_CMTimeRangeMakeWithStartEnd(max(this.start,other.start), min(thisEnd,
          //                                                                        otherEnd))
          //     with the max/min chosen by cmovsq/cmovgq from the two compares.
          // The intersection endpoints are PICKED by cmov; the actual range CONSTRUCTION goes
          // through the external helper. Raise citing 0x609bb2 until that helper is decoded.
          this.range = PC_CMTimeRangeMakeWithStartEnd_stub(   // @0x609bb2
            /*max_start=*/ pickMaxStart(this.range.start, other.range.start),
            /*min_end=*/   pickMinEnd(thisEnd, otherEnd),
          );
          // 0x609a24 nsref-copy tail — fall through below with zeroOut=false.
        }
      }
    }

    // 0x6099ec-0x609a22  ZERO-OUT branch stores kCMTimeRangeZero into this.range.
    if (zeroOut) {
      this.range = {
        start: { ...kCMTimeRangeZero.start },
        duration: { ...kCMTimeRangeZero.duration },
      };
    }

    // 0x609a24-0x609a3e  if (other.nsref.ref != null) { this.nsref = other.nsref }  — via
    // PCNSRefImpl::operator= @__stubs 0x1496120 (retain/release-balanced).
    if (other.nsref.ref !== null) {
      this.nsref = { ref: other.nsref.ref };  // @0x609a39
    }
  }
}

// ── Undecoded external stubs ─────────────────────────────────────────────────
// Each raises with the FCP call-site address so the demand signal is preserved.

/**
 * _FFMergeMissingSynthesizedDataStates(a, b) — external free function; called at @0x609817.
 * Merges two FFEffectMissingSynthesizedDataState enum values. Not yet decoded.
 */
function mergeMissingSynthesizedDataStates_stub(
  _a: FFEffectMissingSynthesizedDataState,
  _b: FFEffectMissingSynthesizedDataState,
): FFEffectMissingSynthesizedDataState {
  throw new Error("raise: _FFMergeMissingSynthesizedDataStates not yet decoded @0x609817");
}

/**
 * _PC_CMTimeRangeEnd(range) — external helper; called at @0x609957 and @0x6099b5.
 * Returns range.start + range.duration as a CMTime (CoreMedia CMTimeRangeGetEnd-style).
 * Not yet decoded — declaring an inline implementation would be a fit; raise instead.
 *
 * A reference implementation would be `PC_CMTimeSaferAdd(range.start, range.duration)`.
 * We CITE that helper here (verified equivalent in the PCTimeRange.getEnd disasm at Ozone
 * @0x67756-0x6779a) but do NOT execute it — the exact FCP fn is undecoded in Flexo.
 */
function PC_CMTimeRangeEnd_stub(_range: PCTimeRange): CMTime {
  // Reference (undischarged): PC_CMTimeSaferAdd(_range.start, _range.duration)
  void PC_CMTimeSaferAdd;
  throw new Error("raise: _PC_CMTimeRangeEnd not yet decoded @0x609957");
}

/**
 * _PC_CMTimeRangeMakeWithStartEnd(start, end) — external helper; called at @0x609bb2.
 * Builds a CMTimeRange from two CMTime endpoints (start and end-exclusive). Not yet decoded.
 */
function PC_CMTimeRangeMakeWithStartEnd_stub(_start: CMTime, _end: CMTime): PCTimeRange {
  throw new Error("raise: _PC_CMTimeRangeMakeWithStartEnd not yet decoded @0x609bb2");
}

/**
 * pickMaxStart(a, b) — cmov-based max selector recovered from @0x609b7f-0x609b86:
 *   `leaq -0xe0(%rbp),%rax ; leaq -0xb0(%rbp),%rcx ; cmovgq %rax,%rcx`
 * chooses this->range.start when r13d (= CMTimeCompare(otherEnd, thisEnd)) > 0 (jg), i.e.
 * when otherEnd > thisEnd (so this.start must be the "later" one to intersect).
 *
 * NOTE: The cmov selects a POINTER; the actual choice depends on the sign of the compare
 * result recorded above. This helper mirrors the branch but requires the compare result — we
 * take the max in the natural CMTime sense.
 */
function pickMaxStart(a: CMTime, b: CMTime): CMTime {
  // @0x609b7f-0x609b86  cmov to select the later start.
  return CMTimeCompare(a, b) >= 0 ? a : b;
}

/**
 * pickMinEnd(a, b) — cmov-based min selector recovered from @0x609b6d-0x609b71:
 *   `leaq -0x80(%rbp),%rax ; cmovsq %rax,%r12`
 * chooses the smaller (earlier) end.
 */
function pickMinEnd(a: CMTime, b: CMTime): CMTime {
  // @0x609b6d-0x609b71  cmov to select the earlier end.
  return CMTimeCompare(a, b) <= 0 ? a : b;
}
