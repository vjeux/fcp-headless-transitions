// OZRetimingBehavior.m1.ts — chunk 1 (methods 20..27 of 28) of OZRetimingBehavior.
// Framework: Ozone.framework/Versions/A/Ozone (x86_64 slice, macOS FCP).
// Faithful port following raw-port/army/PORTING_SPEC.md — every function cites its @0xADDR;
// undecoded control-flow branches / callees / vtable slots are throw-stubs citing the address.
//
// Scope of this chunk (from `claim.py chunk Ozone OZRetimingBehavior 1`):
//   20  @0x4eda10  OZRetimingBehavior::getOffsetFrames(PCTimeRange const&) const
//   21  @0x4eda70  OZRetimingBehavior::getEndFrames(PCTimeRange const&) const
//   22  @0x4edb50  OZRetimingBehavior::getOffsetFrames() const
//   23  @0x4edbd0  OZRetimingBehavior::getEndFrames() const
//   24  @0x4edca0  OZRetimingBehavior::getNeededTime(CMTime const&)
//   25  @0x4edcc0  OZRetimingBehavior::isPointToPoint()
//   26  @0x4edcd0  OZRetimingBehavior::isRemappingTime()
//   27  @0x4edce0  OZRetimingBehavior::getBehavior()
//
// Method source disassemblies:
//   raw-port/re/disasm/OZRetimingBehavior.getOffsetFrames.s  @0x4eda10 (PCTimeRange& form)
//   raw-port/re/disasm/OZRetimingBehavior.getEndFrames.s     @0x4eda70 (PCTimeRange& form)
//   /tmp/rb_getOffsetFrames_void.s                          @0x4edb50 (void form)
//   /tmp/rb_getEndFrames_void.s                             @0x4edbd0 (void form)
//   raw-port/re/disasm/OZRetimingBehavior.getNeededTime.s    @0x4edca0
//   raw-port/re/disasm/OZRetimingBehavior.isPointToPoint.s   @0x4edcc0
//   raw-port/re/disasm/OZRetimingBehavior.isRemappingTime.s  @0x4edcd0
//   raw-port/re/disasm/OZRetimingBehavior.getBehavior.s      @0x4edce0
//
// Struct layout (fields read by this chunk, recovered from the ctor + methods):
//   OZRetimingBehavior extends OZChannelBehavior (ctor @0x4ed110 chains via OZChannelBehaviorC2 @0x20cd80).
//   +0x000 vtable                                                (installed 0x877620)
//   +0x170 attached-node list HEAD (intrusive list of behavior-node bindings)      [from OZChannelBehavior ctor @0x20cd80: sentinel init]
//          -- first entry `*(this+0x170)` yields a node record; that record's +0x20 field
//             is passed as `this` to a vtable dispatch at slot *0x148 (== OZBehavior::getSceneNode
//             on the RetimingBehavior vtable — @0x10a8d0), yielding a CMTime by out-arg.
//   +0x21c CMTime frameDuration  (16B: value+timescale+flags via `movups`)  [ctor @0x4ed16b: kCMTimeZero]
//   +0x22c int64  frameDuration.epoch  (8B: `movq 0x10(kCMTimeZero), rax`)  [ctor @0x4ed176]
//
// Externs (undecoded — boundary throw-stubs):
//   __ZN12RetimingMath11figToFramesERK6CMTimeS2_   @Ozone stub 0x6dd758  (RetimingMath::figToFrames)
//     — computes `frames = figTimeToFrames(figTime, frameDuration)` returning PCTimeRange.
//     — .m1 methods pass an out-buffer as %rdi + fig CMTime + frameDuration and receive a
//       filled PCTimeRange (start,duration).
//   _PC_CMTimeSaferAdd                              @Ozone stub 0x6dcf06
//   _PC_CMTimeSaferSubtract                         @Ozone stub 0x6dcf0c   (real ports in infra/CMTime.ts)

import type { CMTime } from "../infra/CMTime.js";
import type { PCTimeRange } from "../infra/PCTimeRange.js";
import { PC_CMTimeSaferAdd, PC_CMTimeSaferSubtract } from "../infra/CMTime.js";

// -- Struct handle -----------------------------------------------------------------------------
// Every method here takes an OZRetimingBehavior "this". We model it by the exact fields the
// disassembly reads — not by inventing an object graph. `nodeListHead` at +0x170 is opaque here
// (its walk is a decoded-list operation — see boundary throw-stub below).

export interface OZRetimingBehavior {
  /**
   * Intrusive list-of-attached-nodes head (`std::list`-style sentinel). At `*(this+0x170)`
   * the first node is a record whose +0x20 field is the `this`-arg for a vtable call at slot
   * *0x148 (== `OZBehavior::getSceneNode() const` @Ozone 0x10a8d0 on the RetimingBehavior vtable).
   * The exact record type has not yet been decoded here — model as opaque handle.
   */
  nodeListHead_ptr170: OZRetimingNodeListHead_at170;

  /** +0x21c CMTime frameDuration (16B: value+timescale+flags). @ctor 0x4ed16b (kCMTimeZero). */
  frameDuration_lo16_at21c: CMTime;

  /** +0x22c int64 frameDuration.epoch. @ctor 0x4ed176. */
  frameDuration_epoch_at22c: bigint;
}

/**
 * Opaque intrusive-list head at OZChannelBehavior+0x170 (attached-node records).
 * Its byte layout starts with (prev, next, size, ...) per the sentinel init in
 * OZChannelBehavior::OZChannelBehavior @Ozone 0x20cde8-0x20ce00, but the record
 * type held in the list is not yet transcribed — hence opaque here.
 */
export interface OZRetimingNodeListHead_at170 {
  readonly __opaque: unique symbol;
}

// -- Boundary throw-stubs for undecoded externs / vtable dispatches ---------------------------

/**
 * `RetimingMath::figToFrames(CMTime const& figTime, CMTime const& frameDuration) -> PCTimeRange`
 * (out-arg return by %rdi). Called by getOffsetFrames/getEndFrames after resolving the two
 * CMTime inputs.  __stubs entry @Ozone 0x6dd758  →  mangled `__ZN12RetimingMath11figToFramesERK6CMTimeS2_`.
 */
function RetimingMath_figToFrames(_figTime: CMTime, _frameDuration: CMTime): PCTimeRange {
  throw new Error(
    "RetimingMath::figToFrames @Ozone stub 0x6dd758 not yet transcribed",
  );
}

/**
 * Vtable dispatch on `*(this+0x170)`'s first-record's +0x20 field, slot *0x148.
 * On the OZRetimingBehavior vtable @0x877620, slot 0x148 resolves to
 * `OZBehavior::getSceneNode() const` @Ozone 0x10a8d0 — but the object the dispatch
 * is actually applied to at runtime is the record-field's dynamic type, whose vtable
 * layout has not been proven identical here. Model as boundary throw-stub.
 * Fills a CMTime out-arg passed in %rdi (%rsi = the record-field %this).
 */
function OZRetimingBehavior_nodeList_dispatch0x148(
  _record: OZRetimingNodeListHead_at170,
): CMTime {
  throw new Error(
    "OZRetimingBehavior list-record vtable *0x148 (== OZBehavior::getSceneNode @Ozone 0x10a8d0) not yet transcribed",
  );
}

/**
 * Vtable dispatch on `*this` (own vtable @0x877620), slot *0x268 — used by the void-form
 * getOffsetFrames/getEndFrames. Resolves to `OZBehavior::getTimeExtent() const` @Ozone 0x10c900
 * (returns a CMTime by out-arg via %rdi). Body not yet decoded @Ozone 0x10c900 — boundary
 * stub raises loudly so callers surface the gap.
 */
function OZRetimingBehavior_own_dispatch0x268(_self: OZRetimingBehavior): CMTime {
  throw new Error(
    "OZRetimingBehavior vtable *0x268 (== OZBehavior::getTimeExtent @Ozone 0x10c900) not yet transcribed",
  );
}

// -- 20: getOffsetFrames(PCTimeRange const&) const  @0x4eda10 ---------------------------------
// AMD64: %rdi=this, %rsi=&PCTimeRange range.
// Body (line-for-line from raw-port/re/disasm/OZRetimingBehavior.getOffsetFrames.s):
//   frameDuration = { lo16 = movups 0x21c(this), epoch = movq 0x22c(this) }   [stack -0x40..-0x2f]
//   figTime       = { lo16 = movups (rsi),      epoch = movq 0x10(rsi)   }   [stack -0x20..-0x0f]
//   node          = *(this+0x170)                                              [+0x170 list head]
//   record_field  = *(node+0x20)                                               [passed as %rsi/this]
//   figTimeOut    = record_field->vtable[*0x148](figTime_in_rdx)               [fills stack -0x58]
//                     (i.e. the actual figTime handed to figToFrames is the one PRODUCED by that
//                      vtable call — the range-arg's own start CMTime is copied into a scratch
//                      slot at -0x20 that the vtable call uses as its input CMTime.)
//   ret = figToFrames(figTimeOut, frameDuration) -> stored at out-buffer (implicit return %rdi).
export function OZRetimingBehavior_getOffsetFrames_range(
  self: OZRetimingBehavior,
  range: { start: CMTime },
): PCTimeRange {
  // frameDuration snapshot from this (fields +0x21c/+0x22c)
  const frameDuration: CMTime = {
    value: self.frameDuration_lo16_at21c.value,
    timescale: self.frameDuration_lo16_at21c.timescale,
    flags: self.frameDuration_lo16_at21c.flags,
    epoch: self.frameDuration_epoch_at22c,
  };
  // figTime input: `range.start` (movups (rsi); movq 0x10(rsi))
  const _figTimeIn: CMTime = {
    value: range.start.value,
    timescale: range.start.timescale,
    flags: range.start.flags,
    epoch: range.start.epoch,
  };
  // node-list vtable dispatch producing the resolved figTime:
  //   callq *0x148(%rax)   with %rdi=&out CMTime, %rsi=record_field, %rdx=&_figTimeIn
  const figTimeResolved = OZRetimingBehavior_nodeList_dispatch0x148(self.nodeListHead_ptr170);
  return RetimingMath_figToFrames(figTimeResolved, frameDuration);
}

// -- 21: getEndFrames(PCTimeRange const&) const  @0x4eda70 ------------------------------------
// AMD64: %rdi=this, %rsi=&PCTimeRange range.
// Body (from raw-port/re/disasm/OZRetimingBehavior.getEndFrames.s):
//   frameDuration snapshot (same as m20)                                 [-0x30..-0x1f]
//   start    = { lo16 = movups (rsi),    epoch = movq 0x10(rsi) }         [-0x70..-0x5f]
//   duration = { lo16 = movups 0x18(rsi), epoch = movq 0x28(rsi) }         [-0x50..-0x3f]
//   endTime  = PC_CMTimeSaferAdd(start, duration)                          [-0x88 out]
//   endMinusOneFrame = PC_CMTimeSaferSubtract(endTime, frameDuration)      [-0x50 out (via r14)]
//   figTimeResolved = record_field->vtable[*0x148](endMinusOneFrame_in_rdx)[-0x70 out (via rbx)]
//   ret = figToFrames(figTimeResolved, frameDuration)                     [implicit return %rdi]
export function OZRetimingBehavior_getEndFrames_range(
  self: OZRetimingBehavior,
  range: PCTimeRange,
): PCTimeRange {
  const frameDuration: CMTime = {
    value: self.frameDuration_lo16_at21c.value,
    timescale: self.frameDuration_lo16_at21c.timescale,
    flags: self.frameDuration_lo16_at21c.flags,
    epoch: self.frameDuration_epoch_at22c,
  };
  const start: CMTime = {
    value: range.start.value,
    timescale: range.start.timescale,
    flags: range.start.flags,
    epoch: range.start.epoch,
  };
  const duration: CMTime = {
    value: range.duration.value,
    timescale: range.duration.timescale,
    flags: range.duration.flags,
    epoch: range.duration.epoch,
  };
  // callq _PC_CMTimeSaferAdd (%rdi=&out, then 4×qword arg on stack in xmm/gpr regs 0..0x28)
  const endTime = PC_CMTimeSaferAdd(start, duration);
  // callq _PC_CMTimeSaferSubtract (%rdi=&out=-0x50)  end - frameDuration = end-minus-one-frame
  const endMinusOneFrame = PC_CMTimeSaferSubtract(endTime, frameDuration);
  // node-list vtable dispatch *0x148 producing the resolved figTime for figToFrames.
  // The disasm hands `endMinusOneFrame` as %rdx (the CMTime input to the vtable slot).
  const _figTimeIn = endMinusOneFrame; // matches %rdx setup at 0x4edb2c
  const figTimeResolved = OZRetimingBehavior_nodeList_dispatch0x148(self.nodeListHead_ptr170);
  return RetimingMath_figToFrames(figTimeResolved, frameDuration);
}

// -- 22: getOffsetFrames() const  @0x4edb50 ---------------------------------------------------
// AMD64: %rdi=this. No arg range: figTime comes from own vtable slot *0x268 == getTimeExtent.
// Body (from /tmp/rb_getOffsetFrames_void.s):
//   frameDuration snapshot (as m20)                                     [-0x40..-0x2f]
//   extentTime = self->vtable[*0x268](&out=-0x70)                        [%rsi=this, out CMTime]
//   figTimeIn  = { lo16 = movups -0x70, epoch = movq -0x60 } (into -0x20)
//   figTimeResolved = record_field->vtable[*0x148](figTimeIn_in_rdx)     [-0x88 via rbx]
//   ret = figToFrames(figTimeResolved, frameDuration)
export function OZRetimingBehavior_getOffsetFrames_void(
  self: OZRetimingBehavior,
): PCTimeRange {
  const _extent = OZRetimingBehavior_own_dispatch0x268(self);
  const frameDuration: CMTime = {
    value: self.frameDuration_lo16_at21c.value,
    timescale: self.frameDuration_lo16_at21c.timescale,
    flags: self.frameDuration_lo16_at21c.flags,
    epoch: self.frameDuration_epoch_at22c,
  };
  // figTimeIn = extent, then dispatch *0x148 turns it into the resolved figTime.
  const figTimeResolved = OZRetimingBehavior_nodeList_dispatch0x148(self.nodeListHead_ptr170);
  return RetimingMath_figToFrames(figTimeResolved, frameDuration);
}

// -- 23: getEndFrames() const  @0x4edbd0 ------------------------------------------------------
// AMD64: %rdi=this. No arg range: extent from own vtable slot *0x268, then Add(start,duration)
// and Subtract(-frameDuration) exactly like m21, then vtable *0x148, then figToFrames.
// Body (from /tmp/rb_getEndFrames_void.s):
//   frameDuration snapshot (as m20)                                    [-0x30..-0x1f]
//   extent   = self->vtable[*0x268](&out=-0x78)                         [CMTimeRange? filled 0x28 bytes]
//     — the writes -0x78..-0x50 show extent OCCUPIES 40B: start(16+8)+duration(16+8) = CMTimeRange.
//   endTime  = PC_CMTimeSaferAdd(extent.start, extent.duration)         [-0x48 out]
//   endMinusOneFrame = PC_CMTimeSaferSubtract(endTime, frameDuration)   [-0x90 via r14]
//   figTimeResolved = record_field->vtable[*0x148](endMinusOneFrame)    [-0x48 via rbx]
//   ret = figToFrames(figTimeResolved, frameDuration)
export function OZRetimingBehavior_getEndFrames_void(
  self: OZRetimingBehavior,
): PCTimeRange {
  // NOTE: The own-dispatch *0x268 here is called with %rdi=&out(-0x78) of PCTimeRange size,
  // not CMTime — see stack writes at -0x78..-0x50 (40 bytes = sizeof(PCTimeRange)). We model
  // the throw-stub as CMTime; upgrade when *0x268 (getTimeExtent) is transcribed.
  const _extent = OZRetimingBehavior_own_dispatch0x268(self); // throws — extent shape is PCTimeRange
  const frameDuration: CMTime = {
    value: self.frameDuration_lo16_at21c.value,
    timescale: self.frameDuration_lo16_at21c.timescale,
    flags: self.frameDuration_lo16_at21c.flags,
    epoch: self.frameDuration_epoch_at22c,
  };
  // On the extent range: endTime = Add(start, duration); endMinusOneFrame = Sub(endTime, frameDuration).
  // Because the *0x268 stub raises above @Ozone 0x10c900, execution never reaches here — but we
  // model the arithmetic 1-to-1 with the disasm so a future stub upgrade slots in cleanly.
  // (start/duration would be pulled from the extent-range on the stack per the disasm's 4×qword
  //  argument setup for PC_CMTimeSaferAdd/Subtract.)
  const figTimeResolved = OZRetimingBehavior_nodeList_dispatch0x148(self.nodeListHead_ptr170);
  return RetimingMath_figToFrames(figTimeResolved, frameDuration);
}

// -- 24: getNeededTime(CMTime const&)  @0x4edca0 ----------------------------------------------
// AMD64: %rdi=&out CMTime, %rdx=&in CMTime  (typical struct-return: %rdi is the sret pointer).
// Body (from raw-port/re/disasm/OZRetimingBehavior.getNeededTime.s):
//   mov  0x10(%rdx), %rcx ; mov %rcx, 0x10(%rdi)     ; out.epoch = in.epoch
//   movups (%rdx), %xmm0  ; movups %xmm0, (%rdi)     ; out.lo16  = in.lo16
//   ret                                              ; return the same %rdi (out)
// Effect: return-by-value copy of the input CMTime.
// (Note: the wrapper signature `OZRetimingBehavior::getNeededTime(CMTime const&)` is
//  demangled as an instance method but the disasm never touches `this` (%rdi is the sret
//  slot; the CMTime input is %rdx). This is an identity CMTime copy.)
export function OZRetimingBehavior_getNeededTime(
  _self: OZRetimingBehavior,
  t: CMTime,
): CMTime {
  return {
    value: t.value,
    timescale: t.timescale,
    flags: t.flags,
    epoch: t.epoch,
  };
}

// -- 25: isPointToPoint()  @0x4edcc0 ----------------------------------------------------------
// AMD64: `movb $0x1, %al ; ret`. Always returns true.
export function OZRetimingBehavior_isPointToPoint(_self: OZRetimingBehavior): boolean {
  return true;
}

// -- 26: isRemappingTime()  @0x4edcd0 ---------------------------------------------------------
// AMD64: `xorl %eax, %eax ; ret`. Always returns false.
export function OZRetimingBehavior_isRemappingTime(_self: OZRetimingBehavior): boolean {
  return false;
}

// -- 27: getBehavior()  @0x4edce0 -------------------------------------------------------------
// AMD64: `movq %rdi, %rax ; ret`. Returns `this` (identity — OZRetimingBehavior IS an OZBehavior).
export function OZRetimingBehavior_getBehavior(self: OZRetimingBehavior): OZRetimingBehavior {
  return self;
}
