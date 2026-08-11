// OZChannelObjectRootBase — the mixin/base carried by every root "channel-object" class in
// Ozone (things that own a bag of channels *and* have a time extent + recording lifecycle). It
// is NOT the channel base itself (that's OZChannelBase) — it's the ROOT-object base a channel
// hierarchy hangs off of. This translation unit only contains 4 tiny inline-ish methods; the
// real behaviour of a subclass (e.g. a real "shot" / "clip" root) lives elsewhere.
//
// DECODE:
//   raw-port/re/disasm/OZChannelObjectRootBase.getTimeExtent.s
//   raw-port/re/disasm/OZChannelObjectRootBase.getTimeExtentForChannel.s
//   raw-port/re/disasm/OZChannelObjectRootBase.didBeginRecording.s
//   raw-port/re/disasm/OZChannelObjectRootBase.didEndRecording.s
//   raw-port/re/disasm/ProChannel.__ZNK23OZChannelObjectRootBase13getTimeOffsetEv.s
//
// STRUCT LAYOUT (recovered from getTimeExtent @0x2137d0 — copies 48 bytes from this+0x98 into
// the sret, so a PCTimeRange sits at +0x98):
//   +0x98  timeExtent.start.value+timescale+flags   (movups 0x98(%rsi), %xmm0)   @0x2137e2
//   +0xa8  timeExtent.start.epoch                   (movq   0xa8(%rsi), %rcx)   @0x2137d7
//   +0xb0  timeExtent.duration.value+timescale+flags(movups 0xb0(%rsi), %xmm0)   @0x2137ec
//   +0xc0  timeExtent.duration.epoch                (movq   0xc0(%rsi), %rcx)   @0x2137f7
// Total: 48 bytes of PCTimeRange at offset 0x98 in the subclass instance. Fields prior to
// +0x98 (the first 0x98 bytes) belong to base classes / other members and are not touched by
// any method in this TU — leave them abstract.
//
// This class has no ctor in this TU either; treat instances as {timeExtent} for the ported
// surface. Subclasses are responsible for populating timeExtent; nothing here writes to it.

import type { PCTimeRange } from "../infra/PCTimeRange.js";
import type { OZChannelBase } from "./OZChannelBase.js";
import type { CMTime } from "../infra/CMTime.js";

/**
 * Vtable slot on OZChannelBase invoked by getTimeExtentForChannel — an sret CMTimeRange-returning
 * virtual @ offset 0x2c8 in the channel's vtable (0x2c8 / 8 = slot 89). Overridden by concrete
 * channel classes; the base classes we have ported (OZChannelBase.ts) do not implement it, so
 * we forward through a duck-typed hook here rather than fake a specific TS method name.
 */
export interface OZChannelWithTimeExtentVTable extends OZChannelBase {
  /** Vtable slot 0x2c8 — `PCTimeRange OZChannelBase::<virtual>(void) const` (returned via sret). */
  __vtable_0x2c8_getTimeExtent?(): PCTimeRange;
}

export class OZChannelObjectRootBase {
  /**
   * CMTime member at instance offset +0x80..+0x97 (24 bytes). Concrete subclasses populate
   * this; the base class only exposes a copy via getTimeOffset(). Offset recovered from
   * @ProChannel 0x72480 (`getTimeOffset`):
   *   0x72487  movq  0x90(%rsi), %rcx    ; timeOffset.epoch  at this+0x90
   *   0x72492  movups 0x80(%rsi), %xmm0  ; timeOffset.value+timescale+flags at this+0x80..0x8F
   */
  timeOffset!: CMTime;

  /**
   * PCTimeRange member at instance offset +0x98..+0xcf (48 bytes). Concrete subclasses populate
   * this; the base class only exposes a copy via getTimeExtent().
   */
  timeExtent!: PCTimeRange;

  /**
   * OZChannelObjectRootBase::getTimeExtent() const  →  PCTimeRange (by value, sret)
   * @Ozone 0x00000000002137d0  (__ZNK23OZChannelObjectRootBase13getTimeExtentEv)
   *
   * DECODE (raw-port/re/disasm/OZChannelObjectRootBase.getTimeExtent.s):
   *   0x2137d0-0x2137d1  frame setup (push rbp / mov rsp,rbp)
   *   0x2137d4           movq %rdi, %rax                    (return sret ptr in %rax)
   *   0x2137d7           movq  0xa8(%rsi), %rcx             (load this->timeExtent.start.epoch)
   *   0x2137de           movq  %rcx,  0x10(%rdi)            (store into sret+0x10)
   *   0x2137e2           movups 0x98(%rsi), %xmm0           (load start.value+ts+flags, 16 B)
   *   0x2137e9           movups %xmm0, (%rdi)               (store to sret+0x00)
   *   0x2137ec           movups 0xb0(%rsi), %xmm0           (load duration.value+ts+flags,16 B)
   *   0x2137f3           movups %xmm0, 0x18(%rdi)           (store to sret+0x18)
   *   0x2137f7           movq  0xc0(%rsi), %rcx             (load duration.epoch)
   *   0x2137fe           movq  %rcx,  0x28(%rdi)            (store to sret+0x28)
   *   0x213802-0x213803  epilogue + ret
   *
   * Pure 48-byte field copy from this->timeExtent — no allocation, no CMTime helper calls, no
   * validation. Just returns a snapshot of the stored range.
   */
  getTimeExtent(): PCTimeRange {
    // Deep-copy the two CMTimes to mirror the C++ by-value return (asm does an explicit copy
    // of all 48 bytes, so the caller cannot alias into our storage).
    const s = this.timeExtent.start;
    const d = this.timeExtent.duration;
    return {
      start:    { value: s.value, timescale: s.timescale, flags: s.flags, epoch: s.epoch },
      duration: { value: d.value, timescale: d.timescale, flags: d.flags, epoch: d.epoch },
    };
  }

  /**
   * OZChannelObjectRootBase::getTimeExtentForChannel(OZChannelBase const*) const  →  PCTimeRange
   * @Ozone 0x0000000000213810  (__ZNK23OZChannelObjectRootBase23getTimeExtentForChannelEPK13OZChannelBase)
   *
   * DECODE (raw-port/re/disasm/OZChannelObjectRootBase.getTimeExtentForChannel.s):
   *   0x213810-0x213815  frame setup + push rbx + push rax (align stack)
   *   0x213816           movq %rdi, %rbx                    (save sret ptr for return)
   *   0x213819           movq (%rsi), %rax                  (load channel's vtable ptr; %rsi = channel*)
   *   0x21381c           callq *0x2c8(%rax)                 (channel->vtable[0x2c8/8]())
   *                        NOTE: %rdi still holds sret ptr from caller — the virtual has the
   *                        same sret-returning signature (PCTimeRange by value), so the callee
   *                        writes its result directly into our caller-supplied sret slot.
   *                        We DO NOT pass `this` (%rdi is repurposed for sret) — this is
   *                        genuinely a delegation to the channel's own getTimeExtent-like
   *                        virtual, not a member call on OZChannelObjectRootBase.
   *   0x213822           movq %rbx, %rax                    (return sret ptr)
   *   0x213825-0x21382b  restore stack + pop rbx/rbp + ret
   *
   * Semantics: the base ignores `this` entirely — for a channel, the time extent is whatever
   * the channel's virtual reports (vtable slot 0x2c8). Subclasses would override this to
   * combine channel + root timing; here it's pure delegation.
   *
   * The vtable slot 0x2c8 is not implemented on OZChannelBase itself in the raw-port (it's
   * abstract / pure virtual on the base), so we invoke a duck-typed hook and throw if the
   * concrete channel didn't provide one — that's the correct "undecoded frontier" signal.
   */
  getTimeExtentForChannel(channel: OZChannelWithTimeExtentVTable): PCTimeRange {
    // vtable slot 0x2c8 dispatch — see @0x21381c
    const fn = channel.__vtable_0x2c8_getTimeExtent;
    if (typeof fn !== "function") {
      throw new Error( // @0x21381c undecoded vtable slot 0x2c8 on OZChannelBase-derived channel
        "OZChannelObjectRootBase::getTimeExtentForChannel: channel has no vtable slot 0x2c8 " +
        "(__vtable_0x2c8_getTimeExtent) — override in the concrete channel class. @0x21381c",
      );
    }
    return fn.call(channel);
  }

  /**
   * OZChannelObjectRootBase::didBeginRecording(OZChannelBase*, CMTime const&)  →  void
   * @Ozone 0x0000000000213830  (__ZN23OZChannelObjectRootBase17didBeginRecordingEP13OZChannelBaseRK6CMTime)
   *
   * DECODE (raw-port/re/disasm/OZChannelObjectRootBase.didBeginRecording.s):
   *   0x213830-0x213831  push rbp / mov rsp,rbp   (frame prologue)
   *   0x213834-0x213835  pop rbp / ret             (empty body)
   *
   * Base-class no-op hook — subclasses override to react to a channel entering "recording"
   * state at a given time. The base does nothing.
   */
  didBeginRecording(_channel: OZChannelBase, _time: Readonly<CMTime>): void {
    // no-op — see @0x213830 (empty prologue/epilogue only).
  }

  /**
   * OZChannelObjectRootBase::didEndRecording(OZChannelBase*, CMTime const&)  →  void
   * @Ozone 0x0000000000213840  (__ZN23OZChannelObjectRootBase15didEndRecordingEP13OZChannelBaseRK6CMTime)
   *
   * DECODE (raw-port/re/disasm/OZChannelObjectRootBase.didEndRecording.s):
   *   0x213840-0x213841  push rbp / mov rsp,rbp   (frame prologue)
   *   0x213844-0x213845  pop rbp / ret             (empty body)
   *
   * Base-class no-op hook — subclasses override to react to a channel leaving "recording"
   * state at a given time. The base does nothing.
   */
  didEndRecording(_channel: OZChannelBase, _time: Readonly<CMTime>): void {
    // no-op — see @0x213840 (empty prologue/epilogue only).
  }

  /**
   * OZChannelObjectRootBase::getTimeOffset() const  →  CMTime (by value, sret)
   * @ProChannel 0x0000000000072480  (__ZNK23OZChannelObjectRootBase13getTimeOffsetEv)
   *
   * DECODE (raw-port/re/disasm/ProChannel.__ZNK23OZChannelObjectRootBase13getTimeOffsetEv.s):
   *   0x072480-0x072481  frame setup (push rbp / mov rsp,rbp)
   *   0x072484           movq %rdi, %rax                    (return sret ptr in %rax)
   *   0x072487           movq  0x90(%rsi), %rcx             (load this->timeOffset.epoch)
   *   0x07248e           movq  %rcx, 0x10(%rdi)             (store into sret+0x10)
   *   0x072492           movups 0x80(%rsi), %xmm0           (load value+timescale/flags, 16 B)
   *   0x072499           movups %xmm0, (%rdi)               (store to sret+0x00)
   *   0x07249c-0x07249d  epilogue + ret
   *
   * Pure 24-byte field copy from this->timeOffset — no allocation, no CMTime helper calls, no
   * validation. Just returns a snapshot of the stored CMTime. Analogous to the
   * getTimeExtent() @Ozone 0x2137d0 pattern above (both are sret-by-value struct copies of a
   * time-typed member); this variant copies a single 24-byte CMTime instead of a 48-byte
   * PCTimeRange.
   */
  getTimeOffset(): CMTime {
    // Deep-copy the CMTime to mirror the C++ by-value return (asm does an explicit 24-byte
    // copy, so the caller cannot alias into our storage). Field-for-field construction —
    // the movups+movq pair reads all four fields (value/timescale/flags/epoch) from +0x80.
    const t = this.timeOffset;
    return { value: t.value, timescale: t.timescale, flags: t.flags, epoch: t.epoch };
  }

  /**
   * `OZChannelObjectRootBase::getDefaultParameterColorSpaceID() const` — @ProChannel 0x7337c
   * (__ZNK23OZChannelObjectRootBase31getDefaultParameterColorSpaceIDEv).
   *
   * FULL DISASM (raw-port/re/disasm/ProChannel.__ZNK23OZChannelObjectRootBase31getDefaultParameterColorSpaceIDEv.s):
   *   0x7337c  pushq %rbp
   *   0x7337d  movq  %rsp, %rbp
   *   0x73380  movl  $0x3, %eax        ; the whole body: a 32-bit constant 3
   *   0x73385  popq  %rbp
   *   0x73386  retq
   *   0x73387  nop                     ; inter-function alignment padding, not part of the body
   *
   * The base class's answer for "which colour space do parameters default to" is a hard-coded
   * `3`, moved with `movl` (32-bit — the C++ return type is an int-sized colour-space id, not a
   * pointer). `this` is never dereferenced: the function reads no memory at all, which is also
   * what makes it safely callable against the live binary with a poisoned `this` (the oracle
   * does exactly that).
   *
   * WHAT 3 MEANS IS DELIBERATELY NOT NAMED HERE. This TU contains no enum, and the id is
   * consumed elsewhere (`PCColorSpaceCache::intToColorSpaceID` and friends, unported). Inventing
   * a symbolic name — `kSRGB` or similar — would be a guess dressed as a decode, so the constant
   * carries the address it was read from and nothing more. A subclass that overrides this virtual
   * is a separate ledger entry; this is the base's value.
   */
  getDefaultParameterColorSpaceID(): number {
    // @0x7337c..0x7337d — prologue (no TS-visible effect).
    // @0x73380  movl $0x3, %eax
    // @0x73385..0x73386 — epilogue + retq.
    return 3; // @ProChannel 0x73380
  }
}
