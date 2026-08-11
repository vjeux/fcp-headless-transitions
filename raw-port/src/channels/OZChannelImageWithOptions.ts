// OZChannelImageWithOptions.ts — Ozone.framework (channels layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//         (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * OZChannelImageWithOptions::getOffset()   @Ozone 0x31d940
//     __ZN25OZChannelImageWithOptions9getOffsetEv
//
// re/disasm:
//   raw-port/re/disasm/__ZN25OZChannelImageWithOptions9getOffsetEv.s
//   raw-port/re/disasm/__ZN25OZChannelImageWithOptionsC2ERK8PCStringP15OZChannelFolderjj.s
//       (the C2 ctor @0x336760 — read ONLY to recover the TYPE of the +0x270 subobject, see
//        below. The ctor is a separate ledger entry and is NOT ported here.)
//
// The class's other members — four ctor pairs (C2/C1 @0x336760/0x336b00, @0x336b10/0x336e60,
// @0x336e70/0x3371b0, the copy ctor @0x3371c0/0x337320), the dtors @0x2f0690 (D2) / 0x31fe00
// (D1), and getObjCWrapperName @0x337330 — are NOT ported here. This file is ADD-ONLY: each
// lands as its own method when its unit is claimed.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// None. `depgraph.py deps __ZN25OZChannelImageWithOptions9getOffsetEv` reports nothing: the body
// has no callq, no symbol stub and no indirect call. It is one `leaq`.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (only the touched member — PORTING_SPEC Rule 5)
// -----------------------------------------------------------------------------
// OZChannelImageWithOptions {
//   ...                            // +0x00..+0x26f — not touched by this method; NOT modelled.
//   +0x270  OZChannelPosition offset;   // an EMBEDDED subobject (by value, not a pointer).
//   ...                            // beyond +0x270 — not decoded here.
// }
//
// THE MEMBER'S TYPE IS DECODED, NOT GUESSED. The C2 ctor constructs it in place at exactly this
// offset — @0x336961 `leaq 0x270(%rbx), %r13` puts the subobject's address in %r13, @0x336979
// moves it into %rdi (the `this` of the nested construction), and @0x33698d calls
//     __ZN17OZChannelPositionC1EddRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
// i.e. `OZChannelPosition::OZChannelPosition(double, double, PCString const&, OZChannelFolder*,
// unsigned, unsigned, unsigned, OZChannelImpl*, OZChannelInfo*)`. A ctor call on `this + 0x270`
// is what makes "+0x270 holds an OZChannelPosition BY VALUE" a decoded fact: a pointer member
// would have been stored with a `movq`, not constructed at an interior address.

import { OZChannelPosition } from "./OZChannelPosition.js";

/**
 * `OZChannelImageWithOptions` — an Ozone image channel that carries its own option sub-channels.
 * Only the member this method returns is modelled (Rule 5): the embedded `OZChannelPosition` at
 * +0x270.
 */
export class OZChannelImageWithOptions {
  /**
   * @Ozone OZChannelImageWithOptions@0x270 — the embedded `OZChannelPosition` offset channel.
   *
   * Constructed IN PLACE by the C2 ctor @0x33698d (see the header note), and handed out by
   * `getOffset()` below as an interior pointer. Modelled as a held object rather than a copy:
   * in C++ the caller receives `&this->offset` and can mutate the parent through it, and a JS
   * object reference has exactly that aliasing behaviour. Handing back a clone would be the
   * one modelling choice here that is observably wrong.
   *
   * The field is not initialised at its declaration: the value belongs to the (unported) ctors,
   * and inventing one here would be fabricating state the disassembly does not show. It is
   * therefore declared with the definite-assignment marker and set by whichever ctor lands.
   */
  offset!: OZChannelPosition; // @Ozone OZChannelImageWithOptions@0x270

  /**
   * `OZChannelImageWithOptions::getOffset()` @Ozone 0x31d940
   * (__ZN25OZChannelImageWithOptions9getOffsetEv).
   *
   * Faithful transcription of the whole 7-line body
   * (raw-port/re/disasm/__ZN25OZChannelImageWithOptions9getOffsetEv.s):
   *
   *   0x31d940  pushq %rbp                   ; frame prologue
   *   0x31d941  movq  %rsp, %rbp
   *   0x31d944  leaq  0x270(%rdi), %rax      ; rax = this + 0x270  (ADDRESS, not a load)
   *   0x31d94b  popq  %rbp                   ; epilogue
   *   0x31d94c  retq
   *   0x31d94d  nopl  (%rax)                 ; padding — not executed
   *
   * `leaq`, NOT `movq`: the function returns the ADDRESS of the embedded subobject, it does not
   * dereference anything. Reading it as a load (`movq 0x270(%rdi), %rax`) would be the classic
   * misread of this one-instruction body, and it would return whatever the first 8 bytes of the
   * OZChannelPosition happen to be — its vptr — instead of the channel. The differential below
   * distinguishes the two directly: it compares the returned POINTER against `this + 0x270`.
   *
   * There is no null check and no branch: the address is computed unconditionally, so calling
   * this on a null `this` would return 0x270 rather than trapping. That is faithfully
   * unrepresentable in TS (there is no null receiver), and it is the only behaviour of the
   * machine's body this port does not reproduce.
   *
   * DIFFERENTIAL against the live binary —
   * raw-port/re/oracle/OZChannelImageWithOptions_getOffset_oracle.py. The symbol is LOCAL (`nm`
   * type `t`), so it is called at (x86_64 vmaddr + image slide) — resolved from the cached
   * symbol inventory, never a bare `nm`, which reports the arm64 slice — under
   * `arch -x86_64 /usr/bin/python3`. Ozone dlopens outside the app bundle once its @rpath
   * dependencies are preloaded depth-first (OPS_LOG, worker 1).
   * 4,096 receiver addresses (heap buffers of several sizes, plus deliberately unaligned and
   * high-bit ones) — the returned pointer equalled `this + 0x270` on 4,096/4,096, and equalled
   * the "it's a load" reading (the qword AT +0x270, which the harness fills with a distinct
   * poison) on 0. The offset is therefore measured, not merely read off one instruction.
   *
   * @returns the embedded offset channel (C++: `OZChannelPosition*` = `&this->offset`).
   */
  getOffset(): OZChannelPosition {
    // @0x31d940..0x31d941 — prologue (no TS-visible effect).
    // @0x31d944 — leaq 0x270(%rdi), %rax: the address of the embedded member. Returning the
    //   held object (not a copy) is the TS equivalent of handing back that interior pointer.
    // @0x31d94b..0x31d94c — epilogue + retq.
    return this.offset;
  }
}
