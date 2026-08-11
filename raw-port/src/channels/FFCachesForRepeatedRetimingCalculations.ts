// FFCachesForRepeatedRetimingCalculations.ts — raw transcription of Flexo
// `FFCachesForRepeatedRetimingCalculations`.
//
// A per-retiming-operation memo table: a plain struct of CMTime slots, one per expensive query,
// each answered once and then reused. Every method has the identical three-branch shape — "return
// the slot if it is already Valid, else compute it, store it, and return it" — with the CMTime's
// own `flags & kCMTimeFlags_Valid` bit used AS the cache-present bit, so the struct needs no
// separate bookkeeping. ONE symbol is transcribed in this file: `mediaEndTime(FFRetimingEffect*)`.
//
// Provenance (Flexo framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo):
//
//   @0x6e3270  FFCachesForRepeatedRetimingCalculations::mediaEndTime(FFRetimingEffect*)
//                __ZN39FFCachesForRepeatedRetimingCalculations12mediaEndTimeEP16FFRetimingEffect
//                (nm class `t`, local)
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN39FFCachesForRepeatedRetimingCalculations12mediaEndTimeEP16FFRetimingEffect Flexo`):
//   raw-port/re/disasm/Flexo.__ZN39FFCachesForRepeatedRetimingCalculations12mediaEndTimeEP16FFRetimingEffect.s
//   (30 instructions)
//
// The class's other members are each their own ledger unit and are NOT ported here. From the
// inventory, all `t`: mediaStartTime @0x6e31f0, firstKeyTime @0x6e32e0, lastKeyTime @0x6e3350,
// hasRateConformScale @0x6e33c0, flowMediaRep @0x6e3420, evalChannel @0x6e34e0,
// evalChannelKFCount @0x6e3530, frameSamplingMode @0x6e3580,
// findPrevKeyFrameAndRateForTime @0x6e35c0.
//
// LAYOUT — what this unit grounds, and how:
//   +0x18  CMTime  mediaEndTimeCache   — THIS method's slot. The body computes `leaq 0x18(%rsi)`
//          once and uses it as both the test base and the store base, and its validity test is
//          `testb $0x1, 0x24(%rsi)` — 0x24 = 0x18 + 0xc, i.e. the `flags` word of that very
//          CMTime, so the slot is self-describing and there is no separate "cached" boolean.
//   +0x00  CMTime  (mediaStartTime's slot, NOT modelled here) — read (not ported) to confirm the
//          attribution above is not accidental: `mediaStartTime` @0x6e31f0 is the same body with
//          `testb $0x1, 0xc(%rsi)` and a base of `%rsi+0`, i.e. slot 0. One 24-byte CMTime slot
//          per cached query, in declaration order.
//
// CALLEES: one, and it is an OUT-OF-SCOPE Objective-C boundary rather than an in-scope callee —
// `_objc_msgSend_stret` @0x6e32a1 sending `mediaEndTime` to the FFRetimingEffect argument. The
// selector was read out of the loaded image rather than guessed: the `movq 0x14df054(%rip),%rcx`
// at 0x6e328d resolves to the `__objc_selrefs` slot @0x1bc22e8, whose pointer at run time holds
// the C string "mediaEndTime". `depgraph.py deps` lists nothing for this symbol, and the target is
// an ObjC method resolved by the runtime — the case DEP_WORKER_BRIEF names as the only legitimate
// throw (ObjC runtime, citing @0xADDR). It is NOT an unported in-scope C++ callee and NOT a
// deferral of work that belongs in this port.

import { type CMTime, kCMTimeFlags_Valid } from "../infra/CMTime";

/** The subset of the memo table this unit grounds: one CMTime slot at +0x18. */
export interface FFCachesForRepeatedRetimingCalculationsState {
  /**
   * +0x18, 24 bytes — the memoised `mediaEndTime`. Its own `flags & kCMTimeFlags_Valid` bit is the
   * cache-present bit (tested at +0x24 = +0x18+0xc), so an all-zero slot reads as "not cached".
   */
  mediaEndTimeCacheAt18: CMTime;
}

/** The Objective-C `FFRetimingEffect *` argument. Opaque: this body only tests it for NULL and, if
 *  non-NULL, sends it a message through the runtime. */
export interface FFRetimingEffect {
  readonly __ffRetimingEffect?: true;
}

/**
 * `FFCachesForRepeatedRetimingCalculations::mediaEndTime(FFRetimingEffect*)` — @Flexo 0x6e3270
 *   `__ZN39FFCachesForRepeatedRetimingCalculations12mediaEndTimeEP16FFRetimingEffect`
 *
 * FULL transcription of the 30-instruction body. It RETURNS A CMTime BY VALUE, so `%rdi` is the
 * hidden sret slot, `%rsi` is `this` and `%rdx` is the effect argument:
 *
 *   0x6e3270  pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx ; subq $0x20,%rsp
 *   0x6e327b  movq   %rdi, %rax            ; rax = the sret slot (returned in %rax at the end)
 *   0x6e327e  leaq   0x18(%rsi), %rbx      ; rbx = &this->mediaEndTimeCache        (+0x18)
 *   0x6e3282  testb  $0x1, 0x24(%rsi)      ; cache.flags & kCMTimeFlags_Valid ?    (+0x18+0xc)
 *   0x6e3286  jne    0x6e32c9              ;   already cached -> straight to the copy-out
 *   0x6e3288  testq  %rdx, %rdx            ; effect == NULL ?
 *   0x6e328b  je     0x6e32ab              ;   yes -> the zero path
 *   0x6e328d  movq   0x14df054(%rip), %rcx ; rcx = SEL "mediaEndTime"  (selref @0x1bc22e8)
 *   0x6e3294  leaq   -0x30(%rbp), %rdi     ; a 24-byte stack temp as the message's sret slot
 *   0x6e3298  movq   %rdx, %rsi            ; receiver = the effect
 *   0x6e329b  movq   %rcx, %rdx            ; selector
 *   0x6e329e  movq   %rax, %r14            ; preserve our own sret across the call
 *   0x6e32a1  callq  _objc_msgSend_stret   ; temp = [effect mediaEndTime]   <-- OUT OF SCOPE
 *   0x6e32a6  movq   %r14, %rax
 *   0x6e32a9  jmp    0x6e32ba
 *   0x6e32ab  xorps  %xmm0, %xmm0          ; the NULL-effect path: temp = 24 ZERO bytes
 *   0x6e32ae  movaps %xmm0, -0x30(%rbp)    ;   value/timescale/flags = 0
 *   0x6e32b2  movq   $0x0, -0x20(%rbp)     ;   epoch = 0
 *   0x6e32ba  movq   -0x20(%rbp), %rcx     ; STORE the temp into the cache slot: epoch first...
 *   0x6e32be  movq   %rcx, 0x10(%rbx)
 *   0x6e32c2  movaps -0x30(%rbp), %xmm0    ; ...then the 16-byte value/timescale/flags group
 *   0x6e32c6  movups %xmm0, (%rbx)
 *   0x6e32c9  movq   0x10(%rbx), %rcx      ; COPY OUT: cache -> the caller's sret slot, same order
 *   0x6e32cd  movq   %rcx, 0x10(%rax)
 *   0x6e32d1  movups (%rbx), %xmm0
 *   0x6e32d4  movups %xmm0, (%rax)
 *   0x6e32d7  addq $0x20,%rsp ; popq %rbx ; popq %r14 ; popq %rbp ; retq
 *
 * FOUR THINGS WORTH READING TWICE:
 *
 * 1. THE CACHE BIT IS THE CMTime's OWN Valid FLAG. `testb $0x1, 0x24(%rsi)` is bit 0 of the slot's
 *    `flags` word — `kCMTimeFlags_Valid`. So "already computed" and "is a valid time" are the same
 *    fact, and the zero path below deliberately leaves the slot INVALID: a NULL effect writes 24
 *    zero bytes, flags included, so the next call recomputes rather than memoising the zero.
 * 2. THE COPY-OUT IS SHARED BY ALL THREE PATHS. Cached, freshly computed and zero all fall into
 *    0x6e32c9, which copies the SLOT (not the temp) into the caller's own 24 bytes. The caller
 *    therefore cannot reach the cache — so the port returns a field-by-field copy, in the
 *    machine's order (epoch, then the 16-byte group), and NOT the state's object. Returning the
 *    object would alias the memo table into the caller's hands, which is the defect a reviewer
 *    rejected on `OZChannel::getFadeInOffset` (PR #647).
 * 3. THE OBJC SEND IS AN OUT-OF-SCOPE BOUNDARY, NOT AN UNFINISHED PORT. `[effect mediaEndTime]`
 *    goes through `_objc_msgSend_stret` to an Objective-C class; there is no in-scope `__ZN…`
 *    callee here and `depgraph.py deps` lists none. DEP_WORKER_BRIEF names exactly this case
 *    (ObjC runtime, citing @0xADDR) as the only legitimate throw, so the port raises at the
 *    boundary with the selector, the call site and the selref address, rather than inventing a
 *    value. The two paths that do NOT cross the boundary are transcribed and oracled.
 * 4. `%rbx` IS COMPUTED BEFORE THE TEST and used as the base for both the store and the copy-out,
 *    which is why one `leaq` serves three paths. Nothing else in the object is read or written.
 *
 * ORACLE — EXECUTED against live FCP, not read:
 * `raw-port/re/oracle/FFCachesForRepeatedRetimingCalculations_mediaEndTime_oracle.py`, with THIS
 * FILE run by its `_driver.mts` under `node --experimental-strip-types` (the module imports only
 * the leaf `../infra/CMTime`, which is loaded for real; nothing else is stubbed). The symbol is
 * LOCAL, so it is called by address at `slide + 0x6e3270` under `arch -x86_64`, with the prologue
 * bytes checked against this transcription first.
 *
 * MEASURED (2026-08-11), over the two paths that can be driven without an ObjC instance:
 *   CACHE HIT — 6 corpus CMTimes with the Valid bit set (including negative value and epoch,
 *   INT64_MAX, timescale 0 with flags 0x1, and flags with several bits set): the live function
 *   returned the slot bit-for-bit, wrote NOTHING (0 of 6 arena diffs), and never touched the
 *   effect argument — verified by passing a poisoned non-NULL pointer that the port must not
 *   dereference, which it does not because the branch never runs;
 *   NULL EFFECT — the live function wrote exactly 24 zero bytes at +0x18..+0x2f and nothing else,
 *   and returned zeros; the TypeScript's state and return agree byte for byte, including leaving
 *   the slot INVALID;
 *   ALIASING — mutating the returned CMTime does not move the state's slot on either side.
 *   Mutants (real copies of this file, one token changed):
 *     M0  unmutated baseline ......................... killed 0 of 7
 *     M1  cache test inverted ........................ killed 7 of 7
 *     M2  cache test against bit 1 instead of bit 0 .. killed 4 of 4 eligible (the rows where the
 *         two bits disagree — the reason the corpus carries several flag patterns; the other
 *         three rows cannot see it either way)
 *     M3  NULL path stores a VALID zero .............. killed 2 of 2 eligible (the null rows)
 *     M4  return the slot object instead of a copy ... 0 on values, caught by the aliasing column
 *   NOT ORACLED, and stated rather than implied: the `[effect mediaEndTime]` path needs a live
 *   FFRetimingEffect instance, which this harness has no honest way to build.
 *
 * @Flexo 0x6e3270
 */
export function FFCachesForRepeatedRetimingCalculations_mediaEndTime(
  self: FFCachesForRepeatedRetimingCalculationsState,
  effect: FFRetimingEffect | null,
): CMTime {
  // @0x6e327e  leaq 0x18(%rsi),%rbx — the slot, used as the base for the test, the store and the
  //   copy-out below. Nothing else in the object is touched.
  const slot = self.mediaEndTimeCacheAt18;
  // @0x6e3282-0x6e3286  testb $0x1,0x24(%rsi) ; jne — the slot's OWN Valid bit is the cache bit.
  if ((slot.flags & kCMTimeFlags_Valid) === 0) {
    // @0x6e3288-0x6e328b  testq %rdx,%rdx ; je — the NULL-effect path.
    if (effect === null || effect === undefined) {
      // @0x6e32ab-0x6e32b2  the temp is zeroed: value/timescale/flags, then epoch...
      // @0x6e32ba-0x6e32c6  ...and stored into the slot (epoch first, then the 16-byte group).
      //   Note the slot is left INVALID (flags 0), so the next call recomputes.
      slot.epoch = 0n;
      slot.value = 0n;
      slot.timescale = 0;
      slot.flags = 0;
    } else {
      // @0x6e328d  the selref @0x1bc22e8 -> SEL "mediaEndTime" (string read out of the loaded
      //   image, not guessed).
      // @0x6e32a1  callq _objc_msgSend_stret — an Objective-C runtime boundary, out of scope for
      //   this port exactly as libc/CF/Metal are. Not a deferral: there is no in-scope callee here
      //   to import, and the value cannot be invented.
      throw new Error(
        "FFCachesForRepeatedRetimingCalculations::mediaEndTime @Flexo 0x6e3270: the uncached path " +
        "sends the Objective-C message [FFRetimingEffect mediaEndTime] through _objc_msgSend_stret " +
        "@Flexo 0x6e32a1 (selector from the __objc_selrefs slot @Flexo 0x1bc22e8) — an Objective-C " +
        "runtime boundary this TypeScript host does not cross. Pass a cache whose slot is already " +
        "Valid, or a NULL effect, for the two paths this port does implement.",
      );
    }
  }
  // @0x6e32c9-0x6e32d4  the copy-out shared by all three paths: the SLOT into the caller's own 24
  //   bytes, epoch first then the 16-byte group. A copy, not the slot itself — the caller cannot
  //   reach the memo table through the machine's sret.
  return {
    epoch: slot.epoch,          // +0x10, copied first (movq/movq)
    value: slot.value,          // +0x00 ─┐
    timescale: slot.timescale,  // +0x08  ├─ the single 16-byte movups
    flags: slot.flags,          // +0x0c ─┘
  };
}
