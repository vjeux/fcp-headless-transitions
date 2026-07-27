// OZChannelParameterComponent.ts — Flexo's OZChannelParameterComponent.
// Only the D1 and D0 dtor symbols are exported from the framework, and
// BOTH of them are pure-trap stubs: the compiler emitted a `ud2`
// (undefined instruction) as the entire body. This is what clang emits
// for an abstract class whose destructor is never expected to run — any
// attempt to invoke it aborts the process at that instruction.
//
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/Flexo.framework/Versions/A/Flexo.
//
// DECODE. Both symbols are transcribed exactly:
//   D1 @Flexo 0x1491b40:  push rbp / mov rbp,rsp / ud2 / nopw ...
//   D0 @Flexo 0x1491b50:  push rbp / mov rbp,rsp / ud2 / nopw ...
// There is no field access, no callee, no branch. The only decoded
// side-effect is the trap. Nothing about struct layout is recoverable
// from these two symbols alone (no store to a vtbl slot at +0x00, no
// read of any +0xNN field). Any layout / behaviour beyond this trap is
// FRONTIER for this file and is deferred to whichever port lands the
// abstract base or the concrete subclass that uses this component.

/**
 * `OZChannelParameterComponent` — a Flexo channel-parameter component
 * whose destructors are pure `ud2` traps in the shipped binary.
 *
 * Faithful port surface: the two dtor entry points throw on entry,
 * mirroring the `ud2` semantics. Do not add fields or behaviour that is
 * not recoverable from these two symbols — see the file header for the
 * FRONTIER scope statement.
 */
export class OZChannelParameterComponent {
  /**
   * `OZChannelParameterComponent::~OZChannelParameterComponent()` @Flexo
   * 0x1491b40 (D1, non-deleting / base-object dtor).
   *
   * Disasm (all @Flexo):
   *   0x1491b40  push rbp
   *   0x1491b41  mov  rbp, rsp
   *   0x1491b44  ud2                    ; undefined instruction — traps.
   *   0x1491b46  nopw cs:[rax+rax]      ; padding.
   *
   * Faithful behaviour: control never returns; the `ud2` raises SIGILL.
   * Modelled as a throw citing @0x1491b44 so any caller that reaches
   * this fails loudly instead of silently no-oping.
   */
  dispose(): void {
    // @0x1491b44: `ud2` — clang emits this for "should never be called".
    throw new Error(
      "OZChannelParameterComponent::~OZChannelParameterComponent() @Flexo " +
        "0x1491b40 (D1) is a `ud2` trap in the shipped binary — reaching it " +
        "aborts the process (SIGILL).",
    );
  }

  /**
   * `OZChannelParameterComponent::~OZChannelParameterComponent()` @Flexo
   * 0x1491b50 (D0, deleting dtor).
   *
   * Disasm (all @Flexo):
   *   0x1491b50  push rbp
   *   0x1491b51  mov  rbp, rsp
   *   0x1491b54  ud2                    ; undefined instruction — traps.
   *   0x1491b56  nopw cs:[rax+rax]      ; padding.
   *
   * Identical shape to D1. Same faithful throw.
   */
  dispose_and_delete(): void {
    // @0x1491b54: `ud2` — clang emits this for "should never be called".
    throw new Error(
      "OZChannelParameterComponent::~OZChannelParameterComponent() @Flexo " +
        "0x1491b50 (D0) is a `ud2` trap in the shipped binary — reaching it " +
        "aborts the process (SIGILL).",
    );
  }
}
