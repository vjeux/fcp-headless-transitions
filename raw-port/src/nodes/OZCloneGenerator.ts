// OZCloneGenerator.ts — raw transcription of Ozone `OZCloneGenerator`.
//
// The Clone generator scene node: a generator that re-renders another scene node's image. ONE
// symbol is transcribed in this file — `needsOwnContext(CMTime const&)`.
//
// Provenance (Ozone framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone):
//
//   @0x3c9c80  OZCloneGenerator::needsOwnContext(CMTime const&)
//                __ZN16OZCloneGenerator15needsOwnContextERK6CMTime
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN16OZCloneGenerator15needsOwnContextERK6CMTime Ozone`):
//   raw-port/re/disasm/__ZN16OZCloneGenerator15needsOwnContextERK6CMTime.s (7 lines)
//
// Every OTHER member of this large class is a SEPARATE ledger unit and is deliberately NOT ported
// here; each gets ADDED to this file when its own unit is claimed (one class = one file; G6
// add-only). The neighbours consulted as evidence below — and ONLY as evidence — are
// `doesTransformFromLocalToScreenSpace(OZRenderParams const&)` @0x3c79d0 and
// `areEffectsAppliedInScreenSpace()` @0x3c79e0.
//
// LAYOUT: none is observable. The body reads neither `this` (%rdi) nor the `CMTime const&` (%rsi):
// there is no memory operand anywhere in it. Modelling any field here would be inventing one.
//
// CALLEES: none. No call, no branch, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing for this symbol).

/**
 * `CMTime` — the rational timestamp passed by const reference.
 *
 * Declared as an opaque handle because this body never touches it: the pointer arrives in %rsi and
 * is never dereferenced. The project's real CMTime model lives in `raw-port/src/infra/CMTime.ts`;
 * importing it here would suggest this function reads a field of it, and it does not.
 */
export type CMTimeRef = unknown;

/**
 * `OZCloneGenerator` — Ozone's Clone generator scene node.
 *
 * No instance state is modelled: the one transcribed method never dereferences `this`.
 *
 * @Ozone 0x3c9c80
 */
export class OZCloneGenerator {
  /**
   * `OZCloneGenerator::needsOwnContext(CMTime const&)` — @Ozone 0x3c9c80
   *   `__ZN16OZCloneGenerator15needsOwnContextERK6CMTime`
   *
   * FULL transcription — every instruction, in order:
   *
   *   0x3c9c80  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x3c9c81  movq  %rsp,%rbp             ; frame setup (no TS counterpart)
   *   0x3c9c84  movb  $0x1,%al              ; return value = true
   *   0x3c9c86  popq  %rbp                  ; frame teardown (no TS counterpart)
   *   0x3c9c87  retq
   *   0x3c9c88  nopl  (%rax,%rax)           ; alignment padding, not executed
   *
   * One instruction with value semantics: this override answers an unconditional TRUE. Neither
   * `this` nor the time argument is read — there is no memory operand in the body — so the answer
   * cannot depend on either, and no field of the class is pinned by this unit.
   *
   * TRUE IS THE IMPLEMENTATION, NOT A PLACEHOLDER. `movb $0x1,%al` writes only the LOW BYTE, which
   * is exactly the C++ ABI for a `bool` return (the upper bits of %eax are left undefined and
   * callers must not read them) — a function returning `int 1` would emit `movl $0x1,%eax`. So the
   * class is declaring "a clone generator always needs its own render context", at any time. Its
   * sibling overrides in the same class show the compiler emitting the other answer just as
   * tersely when that is what the code says: `doesTransformFromLocalToScreenSpace` @0x3c79d0 is
   * `xorl %eax,%eax ; retq`, i.e. an unconditional FALSE.
   *
   * ORACLE (executed against live FCP, not read) — WITH A NEGATIVE CONTROL, because a
   * constant-returning function is the one shape where a broken harness looks exactly like a pass:
   * a driver that never reads %al at all would "confirm" any expected value. The symbol is `t`
   * (local), so it is not dlsym-able; it was called BY ADDRESS in a Rosetta x86_64 process —
   * `arch -x86_64 /usr/bin/python3` — at `_dyld_get_image_vmaddr_slide(Ozone) + 0x3c9c80`, with the
   * vmaddr taken from the cached inventory and cross-checked against `nm -n -arch x86_64` (never a
   * bare `nm`, which reports the arm64 slice even under Rosetta). Ozone loaded after preloading its
   * `@rpath` chain depth-first (44 images, 0 failures). Results: this function returned 1 on every
   * call — with a poisoned `this`, with a poisoned time argument, and with both NULL — while the
   * sibling `doesTransformFromLocalToScreenSpace` @0x3c79d0, called through the SAME `CFUNCTYPE`
   * in the same process, returned 0. The control is what makes the 1 meaningful.
   *
   * @param _time the `CMTime const&` in %rsi — never dereferenced by this body.
   * @returns `true`, always (@0x3c9c84).
   */
  needsOwnContext(_time: CMTimeRef): boolean {
    // @0x3c9c84  movb $0x1,%al — an unconditional true; %al alone is the bool return register.
    return true;
  }
}
