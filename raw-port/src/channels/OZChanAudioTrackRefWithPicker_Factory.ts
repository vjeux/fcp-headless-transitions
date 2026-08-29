// OZChanAudioTrackRefWithPicker_Factory.ts — raw transcription of Ozone's
// `OZChanAudioTrackRefWithPicker_Factory::revision()`.
//
// Symbol:
//   @Ozone 0x20310  __ZN37OZChanAudioTrackRefWithPicker_Factory8revisionEv
//                   OZChanAudioTrackRefWithPicker_Factory::revision()
//
// Source disassembly:
//   raw-port/re/disasm/__ZN37OZChanAudioTrackRefWithPicker_Factory8revisionEv.s
//
// Full x86_64 body:
//   0x20310  pushq %rbp                 ; frame setup (no TS counterpart)
//   0x20311  movq  %rsp, %rbp
//   0x20314  xorl  %eax, %eax            ; return the 32-bit value 0
//   0x20316  popq  %rbp                 ; frame teardown
//   0x20317  retq
//   0x20318  nopl  (%rax,%rax)          ; alignment padding after the return
//
// There is no load, call, or branch, and the receiver in %rdi is never read.
// The adjacent `version()` ledger unit @Ozone 0x20300 has the same body shape
// but executes `movl $0x1,%eax`, confirming that the zero here is the factory's
// deliberate revision value rather than an omitted computation.

/** Ozone's factory for audio-track-reference channels with a picker. */
export class OZChanAudioTrackRefWithPicker_Factory {
  /**
   * `OZChanAudioTrackRefWithPicker_Factory::revision()` — @Ozone 0x20310
   * (`__ZN37OZChanAudioTrackRefWithPicker_Factory8revisionEv`).
   *
   * The machine body ignores `this` and returns the zero written to `%eax` at
   * @0x20314, so this is represented as a static constant-returning method.
   */
  static revision(): number {
    // @0x20310..@0x20311 — frame setup.
    // @0x20314 — xorl %eax,%eax: return 0 as a 32-bit integer.
    // @0x20316..@0x20317 — frame teardown and return.
    return 0;
  }
}
