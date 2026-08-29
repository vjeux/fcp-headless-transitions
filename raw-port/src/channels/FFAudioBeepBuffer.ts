// FFAudioBeepBuffer.ts — raw transcription of Flexo's
// `FFAudioBeepBuffer::addBufferSlice(long long)`.
//
// Symbol:
//   @Flexo 0xd06f70  __ZN17FFAudioBeepBuffer14addBufferSliceEx
//                    FFAudioBeepBuffer::addBufferSlice(long long)
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.__ZN17FFAudioBeepBuffer14addBufferSliceEx.s
//
// Full x86_64 body:
//   0xd06f70  pushq %rbp              ; frame setup (no TS counterpart)
//   0xd06f71  movq  %rsp, %rbp
//   0xd06f74  movq  %rdi, %rax         ; return the hidden result-storage address
//   0xd06f77  movq  $0x0, (%rdi)       ; zero its sole pointer-sized value
//   0xd06f7e  popq  %rbp
//   0xd06f7f  retq
//
// ABI note: a normal member call would receive `this` in %rdi and the explicit
// `long long` in %rsi. This body instead returns %rdi in %rax while constructing
// into memory at %rdi, the System V ABI pattern for a non-trivial aggregate
// returned through hidden storage. Consequently the actual receiver and the
// explicit argument are shifted to %rsi and %rdx, and neither is read. The
// returned aggregate's only initialized machine word is zero, represented by
// `null` in this port.

/** Flexo's `FFAudioBeepBuffer`; no object layout is touched by this ledger unit. */
export class FFAudioBeepBuffer {
  /**
   * `FFAudioBeepBuffer::addBufferSlice(long long)` — @Flexo 0xd06f70
   * (`__ZN17FFAudioBeepBuffer14addBufferSliceEx`).
   *
   * @param _slice the explicit signed 64-bit argument carried in %rdx after the
   * hidden result pointer and receiver; the machine body does not read it.
   * @returns the zero pointer written to hidden result storage @0xd06f77.
   */
  addBufferSlice(_slice: bigint): null {
    // @0xd06f74 — the ABI returns the caller-provided result-storage address.
    // @0xd06f77 — movq $0,(%rdi): its only represented value is a null pointer.
    return null;
  }
}
