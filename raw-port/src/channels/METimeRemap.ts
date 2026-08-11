// METimeRemap.ts — raw transcription of Ozone `METimeRemap`.
//
// The time-remap description a Motion template carries: three CMTime durations
// (intro / outro / scaleable) plus a handful of boolean policy flags that say
// whether the intro and outro are optional, whether the clip loops, and whether
// its start/end are time-aligned. ONE symbol is transcribed in this file —
// `setOutroDuration(CMTime const&)`. Every other member of the class is a
// SEPARATE ledger unit and is NOT ported here; do not add them without their
// own disassembly and address citations: the C2/C1 ctors,
// `setIntroDuration(CMTime const&)` @0x1245a0, `getIntroDuration()` @0x1245c0,
// `getOutroDuration()` @0x1245f0, `setScaleableDuration(CMTime const&)`,
// `getScaleableDuration()`, `setIsIntroOptional(bool)`, `isIntroOptional()`,
// `setIsOutroOptional(bool)`, `isOutroOptional()`, `setIsLoop(bool)`,
// `isLoop()`, `setIsStartTimeAligned(bool)`, `isStartTimeAligned()`,
// `setIsEndTimeAligned(bool)`, `isEndTimeAligned()`,
// `setBuildEnableChannels(OZChannelBool const*, OZChannelBool const*)`,
// `getValidMotionRange()`, `shouldShowIntro()`, `shouldShowOutro()`,
// `motionTimeFromComponentTime(...)`, `componentTimeFromMotionTime(...)`,
// `test()`.
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x1245d0  METimeRemap::setOutroDuration(CMTime const&)
//                __ZN11METimeRemap16setOutroDurationERK6CMTime
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN11METimeRemap16setOutroDurationERK6CMTime Ozone`):
//   raw-port/re/disasm/__ZN11METimeRemap16setOutroDurationERK6CMTime.s (9 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT — the one slot this body writes, corroborated by two siblings
// (EVIDENCE, not ports):
//
//   struct METimeRemap {
//     CMTime introDuration;   // +0x00..+0x17 — `setIntroDuration` @0x1245a0
//                             //   writes exactly this range with the SAME
//                             //   two-move shape (`movq 0x10(%rsi),%rax ; movq
//                             //   %rax,0x10(%rdi)` @0x1245a4/@0x1245a8 then
//                             //   `movups (%rsi),%xmm0 ; movups %xmm0,(%rdi)`
//                             //   @0x1245ac/@0x1245af), which is what proves
//                             //   the struct starts with a CMTime and that
//                             //   sizeof(CMTime) == 0x18 here.
//     CMTime outroDuration;   // +0x18..+0x2f — written by THIS unit; and
//                             //   `getOutroDuration()` @0x1245f0 returns its
//                             //   ADDRESS (`leaq 0x18(%rdi),%rax` @0x1245f4),
//                             //   a CMTime const& — the same base offset,
//                             //   independently confirmed.
//     ...                     // scaleableDuration and the bool flags follow;
//                             //   their offsets are NOT claimed here because
//                             //   this body does not touch them.
//   };
//
// The 24-byte CMTime is copied as CoreMedia lays it out (see
// raw-port/src/infra/CMTime.ts):
//   +0x00 int64 value ; +0x08 int32 timescale ; +0x0c uint32 flags ; +0x10 int64 epoch
// which is exactly why one 16-byte `movups` covers {value, timescale, flags}
// and one 8-byte `movq` covers {epoch}.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch (`depgraph.py deps` lists nothing for this symbol).

import type { CMTime } from "../infra/CMTime.js";

/**
 * `METimeRemap` — a Motion template's time-remap description.
 *
 * Only the CMTime slot this unit writes is modelled, plus the sibling CMTime at
 * +0x00 that the same two-move copy shape pins (see the file header). The
 * remaining fields are deliberately absent rather than invented.
 *
 * @Ozone 0x1245d0
 */
export class METimeRemap {
  /**
   * +0x00..+0x17 — `introDuration`. Present because
   * `setIntroDuration(CMTime const&)` @0x1245a0 writes precisely this range
   * with the identical instruction shape, which is what fixes the outro's
   * +0x18 base. NOT written by this unit.
   */
  introDuration_at_0x00: CMTime = {
    value: 0n,
    timescale: 0,
    flags: 0,
    epoch: 0n,
  };

  /**
   * +0x18..+0x2f — `outroDuration`, the CMTime this unit assigns.
   * `getOutroDuration()` @0x1245f0 hands back the address of this same slot
   * (`leaq 0x18(%rdi),%rax` @0x1245f4).
   */
  outroDuration_at_0x18: CMTime = {
    value: 0n,
    timescale: 0,
    flags: 0,
    epoch: 0n,
  };

  /**
   * `METimeRemap::setOutroDuration(CMTime const&)` — @Ozone 0x1245d0
   *   __ZN11METimeRemap16setOutroDurationERK6CMTime
   *
   * Copy the caller's 24-byte CMTime into the outro-duration slot.
   *
   * Full transcription — every instruction, in order:
   *
   *   0x1245d0  pushq  %rbp                 ; frame setup (no TS counterpart)
   *   0x1245d1  movq   %rsp,%rbp            ; frame setup (no TS counterpart)
   *   0x1245d4  movq   0x10(%rsi),%rax      ; rax = src.epoch      (+0x10, 8 B)
   *   0x1245d8  movq   %rax,0x28(%rdi)      ; this->outro.epoch    (+0x18+0x10)
   *   0x1245dc  movups (%rsi),%xmm0         ; xmm0 = src{value,timescale,flags}
   *                                         ;        (+0x00, 16 B, UNALIGNED)
   *   0x1245df  movups %xmm0,0x18(%rdi)     ; this->outro{value,timescale,flags}
   *   0x1245e3  popq   %rbp                 ; frame teardown (no TS counterpart)
   *   0x1245e4  retq                        ; returns void
   *   0x1245e5  nopw   %cs:(%rax,%rax)      ; alignment padding, not executed
   *
   * Decode notes:
   *   * the copy is a 24-byte struct assignment split by the compiler into an
   *     8-byte tail move and a 16-byte SSE move, and the EPOCH IS WRITTEN FIRST
   *     (@0x1245d8, before @0x1245df). The order is unobservable to a
   *     single-threaded caller — the two stores hit disjoint bytes — but the
   *     port keeps it so the transcription reads in instruction order.
   *   * `movups`, not `movaps`: the source CMTime reference is not assumed
   *     16-byte aligned. No alignment fixup is performed and none is modelled.
   *   * the destination offsets are `0x18` and `0x28`, i.e. the outro CMTime's
   *     base and its `epoch` field — this is the SAME body as
   *     `setIntroDuration` @0x1245a0 with the base shifted by one CMTime.
   *   * no validation of the incoming CMTime (no flags check, no timescale
   *     check): every field is copied verbatim, including an invalid CMTime.
   *     The port therefore copies the four fields as-is rather than routing
   *     through any CMTime constructor.
   *   * ZERO callees: no in-scope call, no extern, no indirect or virtual
   *     dispatch (`depgraph.py deps` lists nothing).
   *
   * @param src the `CMTime const&` in %rsi.
   */
  setOutroDuration(src: CMTime): void {
    // The slot is MUTATED IN PLACE, not replaced: `getOutroDuration()`
    // @0x1245f0 hands out the ADDRESS of this slot (`leaq 0x18(%rdi),%rax`), so
    // a caller can be holding a reference to it while this store runs — exactly
    // as in the binary, where the bytes at this+0x18 are overwritten and the
    // address never changes.
    const dst = this.outroDuration_at_0x18;
    // @0x1245d4/@0x1245d8  movq 0x10(%rsi),%rax ; movq %rax,0x28(%rdi)
    //   — the 8-byte epoch tail, stored FIRST.
    dst.epoch = src.epoch;
    // @0x1245dc/@0x1245df  movups (%rsi),%xmm0 ; movups %xmm0,0x18(%rdi)
    //   — the 16-byte {value, timescale, flags} block, in one store.
    dst.value = src.value;
    dst.timescale = src.timescale;
    dst.flags = src.flags;
    // @0x1245e4  retq
  }
}
