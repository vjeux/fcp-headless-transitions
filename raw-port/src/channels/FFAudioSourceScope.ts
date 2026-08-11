// FFAudioSourceScope.ts — raw transcription of Flexo `FFAudioSourceScope`.
//
// Flexo's audio source scope: the descriptor the dynamic scoping window builds
// for one audio source over a time range. This file ports ONE method; every
// other member is a separate ledger entry and will be ADDED to this same file
// when claimed — never a rewrite.
//
// Provenance (Flexo framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file — ONE method:
//   @0xe6a090  FFAudioSourceScope::DifferentFadeInOrOutInfo(FFAudioSourceScope const&)
//              __ZN18FFAudioSourceScope24DifferentFadeInOrOutInfoERKS_
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym __ZN18FFAudioSourceScope24DifferentFadeInOrOutInfoERKS_ Flexo`):
//   raw-port/re/disasm/Flexo.__ZN18FFAudioSourceScope24DifferentFadeInOrOutInfoERKS_.s  (19 lines)
//
// NOT ported here (a few of the 57 sibling symbols, each its own ledger entry):
// C1/C2 @0xe69b30, DifferentFadeInfo @0xe6a040, DifferentScopeTiming @0xe6a0e0,
// GetScopeRange @0xe6a1d0, SetAudioChannelCount @0xe6a250, SetAudioEffects
// @0xe6a260, GetAudioEffects @0xe6a290, SetScopeChannelMap @0xe6a2a0,
// SetScopeRoutingMap @0xe6a2e0, SetScopeMonoDownmix @0xe6a320,
// SetAudioChannelMap @0xe6a330, SetPlayRoles @0xe6a360, SetChannelValenceID
// @0xe6a390, SetScopeType @0xe6a3a0, SetComponentsPlaybackInfo @0xe5c7c0.
//
// ---------------------------------------------------------------------------
// LAYOUT — only the four dwords this method reads
// ---------------------------------------------------------------------------
// FFAudioSourceScope {
//   ...                       // +0x00..+0x7f not touched by this method
//   uint32_t fadeField_0x80;  // +0x80 — compared first  @0xe6a094/@0xe6a09c
//   uint32_t fadeField_0x84;  // +0x84 — compared third  @0xe6a0b2/@0xe6a0b8
//   uint32_t fadeField_0x88;  // +0x88 — compared second @0xe6a0a4/@0xe6a0aa
//   uint32_t fadeField_0x8c;  // +0x8c — compared last   @0xe6a0c0/@0xe6a0c6
//   ...                       // +0x90.. not touched by this method
// }
//
// HOW THE FOUR PAIR UP (grounded, not guessed): the sibling
// `FFAudioSourceScope::DifferentFadeInfo(FFAudioSourceScope const&, bool)`
// @0xe6a040 branches on its bool @0xe6a044 and then compares EITHER
// {+0x80, +0x88} (flag non-zero, @0xe6a048/@0xe6a058) OR {+0x84, +0x8c}
// (flag zero, @0xe6a066/@0xe6a076). That is what splits the four dwords into
// two two-field groups, and it is why this method — "FadeIn OR Out" — compares
// all four. WHICH group is the fade-in and which the fade-out is NOT pinned by
// any decoded instruction (that is the caller's convention for the bool), so
// the fields keep offset names instead of invented ones. All four are read with
// `movl`/`cmpl`, so all four are 32 bits wide.
//
// ---------------------------------------------------------------------------
// FULL DISASM — DifferentFadeInOrOutInfo @0xe6a090
// ---------------------------------------------------------------------------
//   0xe6a090  pushq %rbp                    ; frame prologue
//   0xe6a091  movq  %rsp, %rbp
//   0xe6a094  movl  0x80(%rdi), %ecx        ; ecx = this->+0x80
//   0xe6a09a  movb  $0x1, %al               ; preload the answer TRUE
//   0xe6a09c  cmpl  0x80(%rsi), %ecx        ; vs other->+0x80
//   0xe6a0a2  jne   0xe6a0cf                ; differ -> return with al = 1
//   0xe6a0a4  movl  0x88(%rdi), %ecx        ; ecx = this->+0x88
//   0xe6a0aa  cmpl  0x88(%rsi), %ecx
//   0xe6a0b0  jne   0xe6a0cf                ; differ -> return with al = 1
//   0xe6a0b2  movl  0x84(%rdi), %ecx        ; ecx = this->+0x84
//   0xe6a0b8  cmpl  0x84(%rsi), %ecx
//   0xe6a0be  jne   0xe6a0cf                ; differ -> return with al = 1
//   0xe6a0c0  movl  0x8c(%rdi), %eax        ; eax = this->+0x8c
//   0xe6a0c6  cmpl  0x8c(%rsi), %eax
//   0xe6a0cc  setne %al                     ; al = (they differ)
//   0xe6a0cf  popq  %rbp                    ; epilogue
//   0xe6a0d0  retq                          ; bool in %al
//   0xe6a0d1  nopw  %cs:(%rax,%rax)         ; padding — not executed
//
// Note the compare ORDER the compiler chose — +0x80, +0x88, +0x84, +0x8c, i.e.
// one field from each group alternately, not ascending address order. The port
// keeps that order. It cannot change the answer (the four tests are pure reads
// combined with OR), but transcribing the order is what Rule 1 asks for, and it
// is the detail a reviewer diffs against the disassembly.
//
// The final `setne` writes only %al; the three early exits reach the same `ret`
// with the `movb $0x1` from @0xe6a09a still in %al. There is no fifth path.
//
// FRONTIER CALLEES: none. The body contains no call of any kind.
//
// ---------------------------------------------------------------------------
// ORACLE — differential against the live Flexo binary: 1,440 cases, 0
// divergences (raw-port/re/oracle/FFAudioSourceScope_DifferentFadeInOrOutInfo_oracle.py).
// The symbol is LOCAL (`t`), so the harness calls it BY ADDRESS at
// slide+0xe6a090 under `arch -x86_64 /usr/bin/python3` after preloading Flexo's
// @rpath chain, and refuses to run unless the process is x86_64 and the bytes at
// the target are the transcribed prologue (OPS_LOG: an address call into the
// wrong slice lands in unrelated code and fails silently toward VERIFIED).
// Both objects are filled with INDEPENDENT random bytes and only the four
// dwords are then set, so a body that read any other field would disagree
// almost immediately. Coverage: all 16 match/differ patterns over the four
// fields x 40 repetitions with fresh noise (edge values 0, 1, 2, 0x7fffffff,
// 0x80000000, 0xffffffff and random u32s), 200 self-comparisons (an object
// against itself must answer false — it did, every time), and 600 fully random
// pairs. Live answered DIFFERENT in 1,200 of the 1,440.
// NEGATIVE CONTROLS (400 cases): comparing only the {+0x80,+0x88} group -> 90
// wrong; only {+0x84,+0x8c} -> 74 wrong; returning equal-ness instead of
// different-ness -> 400 wrong. A fourth control, comparing the two 64-bit lanes
// at +0x80 and +0x88 instead of four dwords, came back 0/400 — reported here as
// what it is: those four dwords exactly tile the same 16 bytes, so that model is
// EQUIVALENT rather than caught. The port still transcribes four separate 32-bit
// compares because that is what the four `cmpl`s do.

/**
 * `FFAudioSourceScope` — Flexo's per-source audio scope descriptor. This file
 * ports `DifferentFadeInOrOutInfo` only; see the file header for the sibling
 * symbols and their addresses.
 */
export class FFAudioSourceScope {
  /** @Flexo FFAudioSourceScope@0x80 — u32, read @0xe6a094 and compared against
   *  the other scope's same slot @0xe6a09c. Grouped with +0x88 by the sibling
   *  DifferentFadeInfo @0xe6a048. Zero-initialised: the ctor @0xe69b30 is a
   *  separate ledger entry, so the true default is not yet grounded. */
  fadeField_0x80: number = 0; // @Flexo FFAudioSourceScope@0x80

  /** @Flexo FFAudioSourceScope@0x84 — u32, read @0xe6a0b2, compared @0xe6a0b8.
   *  Grouped with +0x8c by DifferentFadeInfo @0xe6a066. */
  fadeField_0x84: number = 0; // @Flexo FFAudioSourceScope@0x84

  /** @Flexo FFAudioSourceScope@0x88 — u32, read @0xe6a0a4, compared @0xe6a0aa.
   *  Grouped with +0x80 by DifferentFadeInfo @0xe6a058. */
  fadeField_0x88: number = 0; // @Flexo FFAudioSourceScope@0x88

  /** @Flexo FFAudioSourceScope@0x8c — u32, read @0xe6a0c0, compared @0xe6a0c6.
   *  Grouped with +0x84 by DifferentFadeInfo @0xe6a076. */
  fadeField_0x8c: number = 0; // @Flexo FFAudioSourceScope@0x8c

  /**
   * `FFAudioSourceScope::DifferentFadeInOrOutInfo(FFAudioSourceScope const&)`
   *   @Flexo 0xe6a090 (__ZN18FFAudioSourceScope24DifferentFadeInOrOutInfoERKS_)
   *
   * Faithful line-for-line transcription of the 19-line body reproduced in the
   * file header: four 32-bit compares in the compiler's order (+0x80, +0x88,
   * +0x84, +0x8c), each an early `true` on inequality, the last one landing in
   * %al through `setne`. No calls, no other state, no side effects.
   *
   * @param other the scope to compare against (%rsi).
   * @returns true when ANY of the four fade dwords differs.
   */
  DifferentFadeInOrOutInfo(other: FFAudioSourceScope): boolean {
    // @0xe6a090..0xe6a091 — prologue (no TS-visible effect).
    // @0xe6a09a — movb $0x1, %al : the answer is TRUE unless the fall-through
    //   `setne` at the end says otherwise.

    // @0xe6a094/@0xe6a09c — movl 0x80(%rdi), %ecx ; cmpl 0x80(%rsi), %ecx
    if ((this.fadeField_0x80 >>> 0) !== (other.fadeField_0x80 >>> 0)) {
      return true; // @0xe6a0a2 jne -> @0xe6a0cf with al = 1
    }
    // @0xe6a0a4/@0xe6a0aa — movl 0x88(%rdi), %ecx ; cmpl 0x88(%rsi), %ecx
    if ((this.fadeField_0x88 >>> 0) !== (other.fadeField_0x88 >>> 0)) {
      return true; // @0xe6a0b0 jne -> @0xe6a0cf with al = 1
    }
    // @0xe6a0b2/@0xe6a0b8 — movl 0x84(%rdi), %ecx ; cmpl 0x84(%rsi), %ecx
    if ((this.fadeField_0x84 >>> 0) !== (other.fadeField_0x84 >>> 0)) {
      return true; // @0xe6a0be jne -> @0xe6a0cf with al = 1
    }
    // @0xe6a0c0/@0xe6a0c6/@0xe6a0cc — movl 0x8c(%rdi), %eax ; cmpl 0x8c(%rsi),
    //   %eax ; setne %al : the answer is exactly "these two differ".
    return (this.fadeField_0x8c >>> 0) !== (other.fadeField_0x8c >>> 0);
    // @0xe6a0cf..0xe6a0d0 — epilogue + retq, bool in %al.
  }
}
