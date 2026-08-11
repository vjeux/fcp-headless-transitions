// OZSegmentationMask.ts — Ozone `OZSegmentationMask`, the scene object behind
// FCP's segmentation (masking) UI. This file ports ONE method of that class:
//
//   @0x414670  OZSegmentationMask::canCopy() const
//                __ZNK18OZSegmentationMask7canCopyEv
//
// FRAMEWORK: Ozone.framework (Final Cut Pro), x86_64 slice.
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// DECODE:    raw-port/re/disasm/__ZNK18OZSegmentationMask7canCopyEv.s
//            (re-derive with `raw-port/tools/disasm.sh --sym
//             __ZNK18OZSegmentationMask7canCopyEv Ozone`)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is NOT ported
// here — including the secondary-base entry point for THIS method,
// `__ZThn16_NK18OZSegmentationMask7canCopyEv` @0x414680, which is its own
// symbol (see the thunk note below).
//
// ── DISASSEMBLY (verbatim, the WHOLE function) ──────────────────────────────
//   0000000000414670  pushq  %rbp                  ; frame setup
//   0000000000414671  movq   %rsp, %rbp            ; frame setup
//   0000000000414674  xorl   %eax, %eax            ; return value = 0 = false
//   0000000000414676  popq   %rbp                  ; frame teardown
//   0000000000414677  retq                         ; returns bool in %al
//   0000000000414678  nopl   (%rax,%rax)           ; alignment padding, not code
//
// One instruction with value semantics. `this` (%rdi) is never dereferenced,
// nothing is called, nothing is allocated: no in-scope callee, no extern, no
// indirect or virtual dispatch (`depgraph.py deps` lists nothing).
//
// ── WHY "ALWAYS FALSE" IS THE IMPLEMENTATION, NOT A GAP ─────────────────────
// `canCopy() const` is a VIRTUAL on the Ozone scene-object hierarchy that each
// class answers for itself, and the family shows both answers:
//   @0xccca0   OZImageElement::canCopy()      — REAL work: takes &this+0x5820,
//              loads _kCMTimeZero and runs CMTime comparisons before answering.
//   @0x5eb660  OZProjectNode::canCopy()       — the same 5-instruction
//              constant-false body as this one.
//   @0x533030  OZRig::canCopy(), @0x572780 OZRigWidget::canCopy(),
//   @0x111e30  OZAudioMasterTrack::canCopy(), @0x8ca80
//              OZObjectManipulator::canCopy() — the other overrides.
// So a segmentation mask deliberately declares itself NOT copyable (FCP's
// copy/paste and duplicate commands skip it), exactly as a project node does.
// There is nothing deferred here, and a throw would be wrong.
//
// ── SECONDARY-BASE ENTRY POINT ──────────────────────────────────────────────
// `nm` also lists `__ZThn16_NK18OZSegmentationMask7canCopyEv` @0x414680 — the
// entry the vtable of a base subobject at +0x10 uses (so OZSegmentationMask
// inherits from at least two polymorphic bases). Normally such a thunk
// subtracts 16 from `this` and jumps to the primary; here the compiler emitted
// a full BYTE-IDENTICAL constant-false body instead, because the function
// never touches `this` and there is nothing to adjust. It is its own ledger
// symbol and is NOT ported by this unit; whoever claims it lands on the same
// answer through a different address.

/**
 * Model of the `OZSegmentationMask` instance state THIS method touches.
 *
 * It touches nothing — the body never dereferences `%rdi`. The interface
 * exists so the ported method keeps the C++ signature (a const member
 * function) and so later units of this class have something to extend with
 * the fields their own disassembly proves.
 *
 * @Ozone 0x414670
 */
export interface OZSegmentationMaskState {
  /** No field is read or written by `canCopy` (@0x414670..@0x414677). */
  readonly _noFieldsTouchedByCanCopy?: never;
}

/**
 * `OZSegmentationMask::canCopy() const` — @Ozone 0x414670
 *   __ZNK18OZSegmentationMask7canCopyEv
 *
 * Full transcription — every instruction, in order:
 *
 *   0x414670  pushq %rbp        ; frame setup (no TS counterpart)
 *   0x414671  movq  %rsp,%rbp   ; frame setup (no TS counterpart)
 *   0x414674  xorl  %eax,%eax   ; %al = 0 -> false
 *   0x414676  popq  %rbp        ; frame teardown (no TS counterpart)
 *   0x414677  retq              ; returns the bool in %al
 *   0x414678  nopl  (%rax,%rax) ; alignment padding, not executed
 *
 * Decode notes:
 *   * `xorl %eax,%eax` zeroes all 64 bits of RAX; the C++ return type is
 *     `bool`, read from %al, so the value is `false`.
 *   * no load, no store, no call — the override ignores object state entirely,
 *     which is what makes "always false" the complete transcription rather
 *     than a simplification (see the file header for the sibling overrides
 *     that DO compute).
 *
 * @param _self %rdi — never dereferenced.
 * @returns the bool in %al: always `false` (@0x414674).
 */
export function OZSegmentationMask_canCopy(_self: OZSegmentationMaskState): boolean {
  // @0x414674  xorl %eax,%eax ; @0x414677 retq
  return false;
}
