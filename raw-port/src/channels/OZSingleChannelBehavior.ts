// OZSingleChannelBehavior.ts — raw transcription of Ozone `OZSingleChannelBehavior`.
//
// The OZBehavior subclass that drives exactly ONE channel (as opposed to
// `OZChannelBehavior`, which owns a list of affected channels at its own
// +0x170..+0x188 — a DIFFERENT class with a DIFFERENT layout; nothing here is
// inferred from it).
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbols ported in this file:
//   @0x3e8f60  OZSingleChannelBehavior::getChanBase() const
//                __ZNK23OZSingleChannelBehavior11getChanBaseEv
//
// Source disassembly:
//   raw-port/re/disasm/__ZNK23OZSingleChannelBehavior11getChanBaseEv.s (12 lines)

import type { OZChannel } from "./OZChannel.js";
import type { OZChannelBase } from "./OZChannelBase.js";
import type { OZChannelInfo } from "./OZChannelInfo.js";

/**
 * The UNDECODED record the `OZSingleChannelBehavior` +0x170 slot points at.
 *
 * Not an FCP-named class — no ctor for it has been disassembled yet, so its
 * size and full field list are unknown. Exactly ONE of its fields is decoded,
 * and it is decoded from four independent call sites in `OZSingleChannelBehavior`
 * that all perform the identical two-step load `movq 0x170(this), %rax ; movq
 * 0x20(%rax), …`:
 *
 *   • `getChanBase() const`        @0x3e8f6e / @0x3e8f75  (this file)
 *   • `getAffectedObject() const`  @0x3ead1e / @0x3ead25 — then NULL-checks the
 *     loaded value and tail-jumps `OZChannelBase::getObjectManipulator() const`
 *     @0x3ead2f with it as the receiver, which PROVES the field's static type
 *     is `OZChannelBase*`.
 *   • `willRemove()`               @0x3e9ff5 / @0x3e9ffc — passes it as the
 *     `OZChannelBase*` argument of
 *     `getObjectManipulatorForChannel(OZChannelBase*) const` @0x3ea01a.
 *   • copy-ctor `C2(OZSingleChannelBehavior const&, uint)` @0x3e8dc8 /
 *     @0x3e8dcf — same, feeding the same `OZChannelBase*` parameter @0x3e8ddf.
 *
 * Everything else about the record is intentionally NOT modelled: a field this
 * port has not read from the binary does not exist here.
 */
export interface OZSingleChannelBehaviorChanRecord {
  /**
   * +0x20 — the `OZChannelBase*` the behavior is bound to. May be NULL: both
   * `getAffectedObject()` @0x3ead29 (`testq %rdi, %rdi ; je`) and the copy-ctor
   * @0x3e8dd3 explicitly test the loaded pointer for NULL after this load.
   */
  chanBaseAt20: OZChannelBase | null;
}

/**
 * `OZSingleChannelBehavior` — the single-channel behavior class.
 *
 * Only the two slots this file's ported method reads are decoded; the rest of
 * the object (the vptr, the OZBehavior base, the +0x210.. own fields such as
 * the `OZChannelInfo` at +0x218, the `OZChanObjectManipRef` at +0x278, the
 * `OZChannelRef*` at +0x338 and the `PCString` at +0x340 that the copy-ctor
 * @0x3e8d01-0x3e8e39 walks) is OPAQUE and deliberately NOT modelled — later
 * ports of other methods add fields as their addresses are read.
 */
export class OZSingleChannelBehavior {
  /**
   * @Ozone offset +0x170 — pointer to the {@link OZSingleChannelBehaviorChanRecord}
   * that carries the bound channel.
   *
   * Read (never written) by every method of this class that needs the channel:
   * `getChanBase()` @0x3e8f6e, `getAffectedObject()` @0x3ead1e, `willRemove()`
   * @0x3e9ff5, `willDeleteMaterialLayer()` @0x3ea1fb, `willDeleteObject()`
   * @0x3ea38b, `willDeleteChannel()` @0x3ea5eb, `didUndoDeleteChannel()`
   * @0x3ea74a, `writeBody()` @0x3eb4b8/@0x3eb4ec, `operator=(OZBehavior const&)`
   * @0x3e967c/@0x3e96b6 and the copy-ctor @0x3e8dc8/@0x3e8e02. No method of
   * this class stores to it, so the slot is written from outside the decoded
   * set — its initial value is left NULL here rather than invented.
   */
  chanRecordAt170: OZSingleChannelBehaviorChanRecord | null = null;

  /**
   * @Ozone offset +0x180 — the 64-bit GUARD slot.
   *
   * Only ever compared against zero (`cmpq $0x0, 0x180(reg)`), never loaded
   * into a register and never stored to by any method of this class, so the
   * ONLY decoded property is its null-ness — modelled as a nullable opaque
   * pointer-width slot and left NULL. The identical guard precedes the +0x170
   * dereference in EVERY method that performs it: `getChanBase()` @0x3e8f60,
   * `getAffectedObject()` @0x3ead14, `willRemove()` @0x3e9fe7,
   * `willDeleteMaterialLayer()` @0x3ea1f1, `willDeleteObject()` @0x3ea381,
   * `willDeleteChannel()` @0x3ea5e1, `didUndoDeleteChannel()` @0x3ea740,
   * `writeBody()` @0x3eb4aa/@0x3eb4e1, `operator=` @0x3e966e/@0x3e972b and the
   * copy-ctor @0x3e8dba/@0x3e8e5b. Its meaning beyond "zero vs non-zero" is
   * NOT decoded and is not guessed at here.
   */
  guardAt180: object | null = null;

  /**
   * `OZSingleChannelBehavior::getChanBase() const` @Ozone 0x3e8f60
   * (__ZNK23OZSingleChannelBehavior11getChanBaseEv).
   *
   * Full transcription — every instruction, in order:
   *
   *   0x3e8f60  cmpq   $0x0, 0x180(%rdi)   ; guard slot == 0 ?
   *   0x3e8f68  je     0x3e8f7b            ;   zero -> the NULL return
   *   0x3e8f6a  pushq  %rbp                ; frame setup (no TS counterpart)
   *   0x3e8f6b  movq   %rsp, %rbp          ; frame setup (no TS counterpart)
   *   0x3e8f6e  movq   0x170(%rdi), %rax   ; rax = this->chanRecordAt170
   *   0x3e8f75  movq   0x20(%rax), %rax    ; rax = rax->chanBaseAt20
   *   0x3e8f79  popq   %rbp                ; frame teardown (no TS counterpart)
   *   0x3e8f7a  retq                       ; return that OZChannelBase*
   *   0x3e8f7b  xorl   %eax, %eax          ; NULL path: rax = 0
   *   0x3e8f7d  retq                       ; return NULL
   *   0x3e8f7e  nop                        ; alignment padding, not executed
   *
   * SEMANTICS: guarded two-step pointer chase. The `cmpq $0x0` at 0x3e8f60 is
   * an EQUALITY test against zero (ZF), not an ordered compare, so no
   * signed/unsigned question arises; `je` is taken exactly when the +0x180 slot
   * is zero and the function then returns NULL WITHOUT touching +0x170. Note
   * the prologue is deliberately skipped on that path — the guard is tested
   * before `pushq %rbp`, i.e. the NULL return is a true leaf exit.
   *
   * On the non-zero path the +0x170 pointer is dereferenced UNCONDITIONALLY:
   * there is no NULL check on it here (contrast the sibling
   * `getAffectedObject()` @0x3ead29, which does test the LOADED +0x20 value).
   * The port reproduces that exactly — it reads through the record without
   * re-testing, so a NULL record raises here just as the machine would fault.
   * The +0x20 value itself is returned RAW, NULL included, with no
   * normalisation.
   *
   * ZERO callees of any kind: no in-scope call, no extern, no indirect and no
   * virtual dispatch (`depgraph.py deps` lists nothing) — the whole body is two
   * loads, a compare and two returns.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK23OZSingleChannelBehavior11getChanBaseEv.s
   *   (12 lines)
   */
  getChanBase(this: OZSingleChannelBehavior): OZChannelBase | null {
    // @0x3e8f60-0x3e8f68  cmpq $0x0,0x180(%rdi) ; je 0x3e8f7b
    //   taken iff the guard slot is zero -> return NULL without reading +0x170.
    if (this.guardAt180 === null) {
      // @0x3e8f7b-0x3e8f7d  xorl %eax,%eax ; retq
      return null;
    }
    // @0x3e8f6e  movq 0x170(%rdi),%rax — no NULL check on the record pointer.
    const record = this.chanRecordAt170 as OZSingleChannelBehaviorChanRecord;
    // @0x3e8f75-0x3e8f7a  movq 0x20(%rax),%rax ; retq — returned raw.
    return record.chanBaseAt20;
  }

  /**
   * `OZSingleChannelBehavior::didSetChannelInfo(OZChannelInfo const*, OZChannel*)`
   * — @Ozone 0x3eb9c0
   * (`__ZN23OZSingleChannelBehavior17didSetChannelInfoEPK13OZChannelInfoP9OZChannel`).
   *
   * Full x86_64 body:
   *
   *   @0x3eb9c0  pushq %rbp
   *   @0x3eb9c1  movq  %rsp, %rbp
   *   @0x3eb9c4  popq  %rbp
   *   @0x3eb9c5  retq
   *
   * The receiver and both explicit pointer arguments are never read. There are
   * no calls, branches, loads, stores, or return-value construction, so the
   * faithful TypeScript body has no observable effect.
   */
  didSetChannelInfo(
    _channelInfo: OZChannelInfo | null,
    _channel: OZChannel | null,
  ): void {
    // @0x3eb9c0..0x3eb9c5 — frame setup, frame teardown, and return only.
  }
}
