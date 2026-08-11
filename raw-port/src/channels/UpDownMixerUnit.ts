// UpDownMixerUnit.ts — Flexo Audio Unit that up-/down-mixes between channel layouts
// (the AUSDK `ausdk::AUBase` idiom, same family as AUPassThrough / AUUnityMixer in this
// directory).
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//            (x86_64 slice — every address below is an x86_64 offset)
// DECODE:    raw-port/re/disasm/Flexo.__ZN15UpDownMixerUnit12SupportsTailEv.s
//
// This file ports ONLY the symbol listed below. Every other UpDownMixerUnit method is its own
// ledger entry and will be ADDED to this file (additive extension only — never a rewrite or a
// drop of a landed sibling) when it is claimed. For scale, the class's other symbols in
// raw-port/army/inventory/Flexo.syms.txt are Initialize @0x12400f0, InitializeHilbert
// @0x123fdd0, Reset @0x1240120, GetParameterInfo @0x12403a0, GetParameterValueStrings
// @0x12402d0, SetParameter @0x1240550, RenderBus @0x12405c0, ProcessBufferLists @0x1240810,
// the C1/C2 ctors and the D0/D1/D2 dtors — none of them touched here.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN15UpDownMixerUnit12SupportsTailEv
//       — UpDownMixerUnit::SupportsTail() @Flexo 0x1241530
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   SupportsTail — none. There is no `callq` at any address in the body, and no memory
//                  operand at all: the function never dereferences `%rdi`.
//
// -----------------------------------------------------------------------------
// FULL DISASM — SupportsTail @0x1241530 (every instruction, in order)
// -----------------------------------------------------------------------------
//   0x1241530  pushq  %rbp                    ; frame prologue
//   0x1241531  movq   %rsp, %rbp
//   0x1241534  movb   $0x1, %al               ; the return value: bool true in %al
//   0x1241536  popq   %rbp                    ; epilogue
//   0x1241537  retq
//   0x1241538  nopl   (%rax,%rax)             ; alignment padding — not executed
//
// DECODE NOTES
//  - `movb $0x1, %al` is the whole function. The SysV return register for a `bool` is %al, so
//    this is an unconditional `return true`. There is no branch, no load, and no store: the
//    object pointer in %rdi is never read, which is why the port takes no state.
//  - This is an override of the AUSDK's `ausdk::AUBase::SupportsTail()` (which answers false by
//    default); the class opting in is the entire content of the method. Nothing about WHAT the
//    tail is lives here — `GetTailTime` is a different symbol and is not part of this unit.
//  - The trailing `nopl` is inter-function alignment padding emitted after the `retq`; it is
//    unreachable and has no TS counterpart.

/**
 * `UpDownMixerUnit` — Flexo up/down-mix Audio Unit. This file holds the methods listed under
 * "Symbols ported here" in the file header; every other method is a separate ledger entry.
 * No instance fields are modelled: the one ported method reads none, and inventing an AUBase
 * layout here would be exactly the magic-offset guesswork PORTING_SPEC Rule 5 forbids.
 */
export class UpDownMixerUnit {
  /**
   * `UpDownMixerUnit::SupportsTail()` -> `bool` @Flexo 0x1241530
   *   (__ZN15UpDownMixerUnit12SupportsTailEv)
   *
   * Full transcription of the 5-instruction body (see the FULL DISASM block in the file
   * header). Unconditionally true: `movb $0x1, %al` between a bare prologue and `retq`, with
   * no load, no branch, and no call — the object is not consulted at all.
   *
   * DIFFERENTIAL against the live binary. The symbol is LOCAL (`t` in
   * raw-port/army/inventory/Flexo.syms.txt, not `T`), so dlsym cannot reach it; instead
   * raw-port/re/oracle/UpDownMixerUnit_SupportsTail_oracle.py loads Flexo under
   * `arch -x86_64 /usr/bin/python3` (walking the `@rpath` chain depth-first, since a hardened
   * python strips DYLD_*), measures the image slide from an exported symbol, and calls
   * `slide + 0x1241530` directly. Measured, not assumed:
   *   - the 8 bytes at the computed address are `55 48 89 e5 b0 01 5d c3` — byte-identical to
   *     the transcribed instructions, which is what proves the slide arithmetic landed on THIS
   *     function (the OPS_LOG hazard is a bare `nm` handing back arm64 addresses, so the
   *     address is taken from the x86_64 symbol cache and then verified against the opcodes);
   *   - 0 of the class's 13 other symbols carry those same bytes, so that check discriminates;
   *   - called with `this` = NULL, 0x1, 0xdeadbeef, 0x0000ffffffffffff, a 0xEE-poisoned
   *     0x400-byte buffer and a zeroed one, the live function returns true in 6 of 6 — the
   *     measurement behind "it ignores its object".
   *
   * @returns true — this unit reports that it has a tail.
   */
  SupportsTail(): boolean {
    // ------------------------------------------------------------
    // @0x1241530..0x1241531 — prologue (no TS-visible effect).
    // @0x1241534 — movb $0x1, %al : the bool return value, unconditionally 1.
    // @0x1241536..0x1241537 — epilogue + retq.
    // ------------------------------------------------------------
    return true;
  }
}
