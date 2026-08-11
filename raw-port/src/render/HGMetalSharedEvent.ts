// HGMetalSharedEvent — Helium wrapper around an `id<MTLSharedEvent>` (partial port).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice). Disassembly sources:
//   raw-port/re/disasm/Helium.__ZN18HGMetalSharedEvent10setEventIDEj.s   (setEventID — PORTED here)
//   raw-port/re/disasm/Helium.__ZN18HGMetalSharedEventC2E15HGMTLDeviceType.s
//                                                                        (the C2 ctor — read ONLY
//                                                                        to pin +0x18's width and
//                                                                        default; it is a separate
//                                                                        ledger entry and is NOT
//                                                                        ported here)
//
// This file ports ONLY the symbol listed under "Symbols ported here" below.
// setLabel @0x1d5600, the two signal overloads @0x1d5720 / @0x1d57a0, the two
// wait overloads @0x1d5800 / @0x1d5860, the ctors @0x1d5530 / @0x1d5570 and the
// dtors @0x1d55b0 / @0x1d55d0 are each a separate ledger entry and will be
// ADDED to THIS file (additive extension only) when claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered from the C2 ctor, which writes +0x00..+0x1c)
// -----------------------------------------------------------------------------
// HGMetalSharedEvent {
//   HGMTLDeviceType device;   // +0x00 — the Metal device handle the object was built
//                             //   from. Ctor stores its argument straight in:
//                             //   `movq %rsi, (%rdi)` @0x1d553c.
//   id<MTLSharedEvent> event; // +0x08 — first zeroed by the ctor's
//                             //   `movups %xmm0, 0x8(%rdi)` @0x1d5542, then overwritten
//                             //   @0x1d555d with the result of the ObjC message
//                             //   `-[device newSharedEvent]` (selector ref @0x1d554d,
//                             //   msgSend @0x1d5557). An ObjC/Metal object — OUT OF
//                             //   SCOPE for this port.
//   /* +0x10 */               // also zeroed by that same 16-byte `movups` and never
//                             //   written again by any decoded instruction here; role
//                             //   unknown, so it is NOT modelled as a field (Rule 5).
//   uint32_t eventID;         // +0x18 — the u32 this file's setEventID writes. The ctor
//                             //   zero-initialises it with `movl $0x0, 0x18(%rdi)`
//                             //   @0x1d5546 — a 4-byte store, which is what pins both
//                             //   the offset and the width independently of the setter.
// }
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   setEventID — none. Four instructions, one store; no callq, no symbol stub,
//                no indirect call, no ObjC message. `depgraph.py deps
//                __ZN18HGMetalSharedEvent10setEventIDEj` reports nothing at all.
//                (Note the contrast with the ctor, which DOES send
//                `newSharedEvent` — none of that reaches this method.)
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN18HGMetalSharedEvent10setEventIDEj
//       — HGMetalSharedEvent::setEventID(unsigned int) @Helium 0x1d55f0
//
// -----------------------------------------------------------------------------
// FULL DISASM — setEventID @0x1d55f0 (6 lines, the entire function)
// -----------------------------------------------------------------------------
//   __ZN18HGMetalSharedEvent10setEventIDEj:
//     0x1d55f0  pushq %rbp                  ; frame prologue
//     0x1d55f1  movq  %rsp, %rbp
//     0x1d55f4  movl  %esi, 0x18(%rdi)      ; this->eventID (u32) = esi
//     0x1d55f7  popq  %rbp                  ; epilogue
//     0x1d55f8  retq
//     0x1d55f9  nopl  (%rax)                ; padding — not executed
//
// A single 32-bit store of the SysV second integer argument. No validation, no
// masking, no branch, no side effect on any other slot — the `unsigned int`
// parameter (`j` in the mangling) goes in verbatim.

/**
 * `HGMetalSharedEvent` — Helium's wrapper around an `id<MTLSharedEvent>`
 * created from an `HGMTLDeviceType`. This file models only the `eventID` slot
 * that `setEventID` writes; see the header for the rest of the decoded layout
 * and for why +0x08/+0x10 are deliberately not declared as members.
 */
export class HGMetalSharedEvent {
  /**
   * @Helium HGMetalSharedEvent@0x18 — the u32 event id.
   *
   * Written by `setEventID` @0x1d55f4 (`movl %esi, 0x18(%rdi)`) and
   * zero-initialised by the C2 ctor @0x1d5546 (`movl $0x0, 0x18(%rdi)`). Both
   * stores are `movl`, i.e. 4 bytes, and a real `setEventID` call on a poisoned
   * object leaves every byte outside +0x18..+0x1c untouched — so the field is
   * exactly this dword.
   *
   * `0` is the ctor's decoded default, not a placeholder. Held as an UNSIGNED
   * 32-bit value: the parameter is `unsigned int` (`j`), and the binary stores
   * 0x80000000 as 2147483648 rather than -2147483648 (measured — see the
   * setter's ORACLE note).
   */
  eventID: number = 0; // @Helium HGMetalSharedEvent@0x18

  /**
   * `HGMetalSharedEvent::setEventID(unsigned int)` @Helium 0x1d55f0
   *   (__ZN18HGMetalSharedEvent10setEventIDEj)
   *
   * Faithful transcription of the entire 6-line function: one 32-bit store of
   * the argument into the `eventID` slot at `this+0x18`. No callees, no
   * branches, no validation. The full disassembly is quoted in the file header.
   *
   * ORACLE — verified by calling the live Helium binary. The symbol is exported
   * (the cached inventory lists `00000000001d55f0 T
   * __ZN18HGMetalSharedEvent10setEventIDEj`), and the body touches one fixed
   * offset and never reads the ObjC event pointer at +0x08, so it can be called
   * on a synthetic object with no Metal device present. The harness dlopens
   * Helium under `arch -x86_64 /usr/bin/python3` (every address here is an
   * x86_64 offset; a native arm64 process would be checking this port against
   * code it did not transcribe — see OPS_LOG) and calls the real setter on a
   * 0x200-byte buffer poisoned with 0xEE, over 1,071 values: exhaustive 0..63,
   * plus 0xffff, 0x10000, 0xffff0000, 0x7fffffff, 0x80000000, 0xfffffffe,
   * 0xffffffff, and 1,000 random u32s. Results:
   *   - the dword at +0x18 equals the argument on 1071/1071;
   *   - no byte outside +0x18..+0x1c changed on 1071/1071, so this really is a
   *     single 4-byte store and nothing else.
   * NEGATIVE CONTROLS (measured on that same corpus): a 16-bit store would be
   * wrong on 1006/1071; and for signedness, the binary leaves 2147483648 in the
   * slot for the argument 0x80000000, so `>>> 0` is the right model and `| 0`
   * (which would give -2147483648) is measurably wrong.
   *
   * @param eventID — the event id, SysV `%esi`, an `unsigned int` (u32).
   */
  setEventID(eventID: number): void {
    // ------------------------------------------------------------
    // @0x1d55f0..0x1d55f1 — prologue (no TS-visible effect).
    // @0x1d55f4 — movl %esi, 0x18(%rdi) : store the u32 at offset +0x18.
    //   `>>> 0` models the 32-bit truncation and the unsigned width, so a
    //   negative or oversized JS number leaves the same bit pattern the
    //   machine would (and 0x80000000 reads back as 2147483648, matching the
    //   measured behaviour of the real symbol).
    // @0x1d55f7..0x1d55f8 — epilogue + retq.
    // ------------------------------------------------------------
    this.eventID = eventID >>> 0;
  }
}
