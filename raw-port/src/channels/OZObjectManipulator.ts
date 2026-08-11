// OZObjectManipulator.ts — raw transcription of Ozone `OZObjectManipulator`.
//
// The base class of Ozone's manipulable scene objects — 255 symbols carry its name, and OZScene
// tracks its instances (`registerObject` @0x576c0, `selectObject` @0x50fd0, and the
// `list<OZObjectManipulator*>` threaded through the hash/state calls). TWO symbols are transcribed
// in this file, each from its own claim:
// `prepareForDragOperation(OZPasteList*, OZChannelBase*, unsigned int, unsigned int)` and
// `didFinishLoadingIntoMotionEffect()`.
//
// Provenance (Ozone framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone):
//
//   @0x149bb0  OZObjectManipulator::prepareForDragOperation(OZPasteList*, OZChannelBase*,
//                                                           unsigned int, unsigned int)
//                __ZN19OZObjectManipulator23prepareForDragOperationEP11OZPasteListP13OZChannelBasejj
//   @0xfae40   OZObjectManipulator::didFinishLoadingIntoMotionEffect()
//                __ZN19OZObjectManipulator32didFinishLoadingIntoMotionEffectEv
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN19OZObjectManipulator23prepareForDragOperationEP11OZPasteListP13OZChannelBasejj Ozone`):
//   raw-port/re/disasm/__ZN19OZObjectManipulator23prepareForDragOperationEP11OZPasteListP13OZChannelBasejj.s
//   (7 lines)
//
// Every OTHER member of this large class is a SEPARATE ledger unit and is deliberately NOT ported
// here; each gets ADDED to this file when its own unit is claimed (one class = one file; G6
// add-only). The three consulted below as EVIDENCE ONLY — because they are what prove the oracle
// harness reads the real return register — are `onScreenControlsActive()` @0x8cb20,
// `getNaturalDurationFlags()` @0x8cb00 and `canCopy() const` @0x8ca80.
//
// SUBCLASS OVERRIDES OF THE SAME VIRTUAL, none of them assumed here and none of them this symbol:
// `OZSceneNode::prepareForDragOperation` @0x94f50 (plus its Thn16 thunk @0x95060) and
// `OZEffect::prepareForDragOperation` @0xf99a0. This file ports the BASE-class default only.
//
// LAYOUT: none is observable. The body reads no field of `this` and none of its four arguments —
// there is no memory operand anywhere in it.
//
// CALLEES: none. No call, no branch, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing for this symbol).

/** `OZPasteList*` — opaque here: the pointer arrives in %rsi and is never dereferenced. */
export type OZPasteListRef = unknown;
/** `OZChannelBase*` — opaque here: the pointer arrives in %rdx and is never dereferenced. */
export type OZChannelBaseRef = unknown;

/**
 * `OZObjectManipulator` — the base class of Ozone's manipulable scene objects.
 *
 * No instance state is modelled: the one transcribed method never dereferences `this`.
 *
 * @Ozone 0x149bb0
 */
export class OZObjectManipulator {
  /**
   * `OZObjectManipulator::prepareForDragOperation(OZPasteList*, OZChannelBase*, unsigned int,
   * unsigned int)` — @Ozone 0x149bb0
   *   `__ZN19OZObjectManipulator23prepareForDragOperationEP11OZPasteListP13OZChannelBasejj`
   *
   * FULL transcription — every instruction, in order:
   *
   *   0x149bb0  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x149bb1  movq  %rsp,%rbp             ; frame setup (no TS counterpart)
   *   0x149bb4  movb  $0x1,%al              ; return value = true
   *   0x149bb6  popq  %rbp                  ; frame teardown (no TS counterpart)
   *   0x149bb7  retq
   *   0x149bb8  nopl  (%rax,%rax)           ; alignment padding, not executed
   *
   * One instruction with value semantics: the base-class default accepts every drag. None of the
   * four arguments is read — no `%rsi`, `%rdx`, `%ecx` or `%r8d` operand appears — and neither is
   * any field of `this`, so the answer cannot depend on the paste list, the channel or either
   * unsigned flag word. This is the DEFAULT that subclasses override:
   * `OZSceneNode::prepareForDragOperation` @0x94f50 and `OZEffect::prepareForDragOperation`
   * @0xf99a0 are different, much longer functions and are their own ledger units.
   *
   * TRUE IS THE IMPLEMENTATION, NOT A PLACEHOLDER. `movb $0x1,%al` writes only the LOW BYTE — the
   * C++ ABI for a `bool` return (a function returning `int 1` emits `movl $0x1,%eax`), so the
   * signature is `bool` and the value is `true`.
   *
   * ORACLE (executed against live FCP, not read) — WITH TWO CONTROLS, because a constant-returning
   * function is the one shape where a broken harness is indistinguishable from a pass: a driver
   * that never reads %al would "confirm" any expectation, and one that only tests truthiness would
   * accept any non-zero. The symbol is exported (`T`), so it was dlsym'd/called by address in a
   * Rosetta x86_64 process — `arch -x86_64 /usr/bin/python3` — at
   * `_dyld_get_image_vmaddr_slide(Ozone) + 0x149bb0`, after preloading Ozone's `@rpath` chain
   * depth-first (44 images, 0 failures). Results, all in one process and through the same ctypes
   * plumbing:
   *   * this function returned 1 on every call — poisoned `this` with real argument pointers,
   *     NULLs everywhere, and 0xFFFFFFFF in both unsigned words;
   *   * the same-class control `onScreenControlsActive()` @0x8cb20 (`xorl %eax,%eax`) returned 0;
   *   * the same-class control `getNaturalDurationFlags()` @0x8cb00 (`movl $0x6,%eax`) returned 6.
   * A zero AND a six from neighbours is what makes the one here mean something.
   *
   * @param _pasteList the `OZPasteList*` in %rsi — never dereferenced.
   * @param _channel   the `OZChannelBase*` in %rdx — never dereferenced.
   * @param _flagsA    the first `unsigned int` in %ecx — never read.
   * @param _flagsB    the second `unsigned int` in %r8d — never read.
   * @returns `true`, always (@0x149bb4).
   */
  prepareForDragOperation(
    _pasteList: OZPasteListRef,
    _channel: OZChannelBaseRef,
    _flagsA: number,
    _flagsB: number,
  ): boolean {
    // @0x149bb4  movb $0x1,%al — an unconditional true; %al alone is the bool return register.
    return true;
  }

  /**
   * `OZObjectManipulator::didFinishLoadingIntoMotionEffect()` — @Ozone 0xfae40
   *   `__ZN19OZObjectManipulator32didFinishLoadingIntoMotionEffectEv`
   *
   * FULL transcription — every instruction, in order:
   *
   *   0xfae40  pushq %rbp                   ; frame setup (no TS counterpart)
   *   0xfae41  movq  %rsp,%rbp              ; frame setup (no TS counterpart)
   *   0xfae44  popq  %rbp                   ; frame teardown (no TS counterpart)
   *   0xfae45  retq                         ; return (void)
   *   0xfae46  nopw  %cs:(%rax,%rax)        ; alignment padding, not executed
   *
   * THE BODY IS EMPTY, AND THAT IS THE IMPLEMENTATION. Between the prologue and the epilogue
   * there is not one instruction: no load, no store, no call, no branch, no immediate, and
   * `%rdi` is never touched, so `this` is neither read nor written. This is the base class's
   * do-nothing default for a virtual that subclasses override — the load-completion hook that
   * a plain manipulator has no work for. Its immediate neighbour
   * `OZObjectManipulator::didFinishLoadingIntoScene()` @0xfae30 is byte-for-byte the same
   * six-byte shape (a SEPARATE ledger unit, not ported here); the pair is the two default
   * load hooks.
   *
   * NOT A STUB, AND NOT AN UNDECODED GAP. The distinction matters because an empty TS body is
   * also what a skipped port looks like, so it is settled against the machine rather than
   * asserted: subclasses that DO have work emit it here — `OZSceneNode`'s override of this
   * same virtual @0x961a0 pushes `%r14`/`%rbx`, walks the intrusive lists at `this+0x3e0` and
   * `this+0x3c8`, and makes a virtual call through `+0x180` (a separate ledger unit, cited as
   * a control only). If @0xfae40 were a decode failure rather than an empty function, that
   * sibling would read empty too.
   *
   * CALLEES: none — no call, no branch, no extern, no indirect or virtual dispatch
   * (`depgraph.py deps` lists nothing for this symbol).
   *
   * LAYOUT: nothing observable. The body touches no field of `this`, so this unit adds no
   * instance state to the class (inventing a field here would be invention, not transcription).
   *
   * ORACLE (executed against live FCP, not read) — the differential is
   * `raw-port/re/oracle/OZObjectManipulator_didFinishLoadingIntoMotionEffect_oracle.py`, run
   * under `arch -x86_64 /usr/bin/python3` (every address here is an x86_64 offset; an arm64
   * vmaddr would land on another function and fail silently toward VERIFIED). The symbol is
   * LOCAL (`nm` type `t`), so it is called at `_dyld_get_image_vmaddr_slide(Ozone) + 0xfae40`
   * with the bytes checked first. "It does nothing" is the one claim an instrument can seem to
   * confirm while measuring nothing, so each half is paired with a control that fails if the
   * instrument is blind — and all of them fired:
   *   * the body reads back as `55 48 89 e5 5d c3`, with a one-byte-off negative control that
   *     fails as it must;
   *   * SHAPE CONTROL: `OZSceneNode`'s override @0x961a0, read through the identical path, is
   *     `55 48 89 e5 41 56 53 …` — a different shape, so "empty" is a fact about this address;
   *   * WRITES NOTHING: a 0xCD-poisoned 0x100-byte `this` is byte-identical after the call,
   *     and the MUTATION CONTROL (`pthread_cond_init` over an identical arena) IS reported as
   *     changed by the same comparison, so the diff can see a write when there is one;
   *   * READS NOTHING: called with `this` at UNMAPPED 0xdead0000 it returns normally, and the
   *     FAULT CONTROL — a forked child dereferencing that same address — dies with SIGSEGV, so
   *     an unmapped read really is fatal here and surviving means no read happened.
   *
   * @returns nothing; the C++ return type is `void` (the epilogue defines no register).
   */
  didFinishLoadingIntoMotionEffect(): void {
    // @0xfae40..0xfae41 — prologue (no TS-visible effect).
    // The function body is empty: there is no instruction between the prologue and the
    // epilogue, so there is nothing to transcribe here. `this` is not touched.
    // @0xfae44..0xfae45 — popq %rbp; retq.
    return; // @Ozone 0xfae45
  }
}
