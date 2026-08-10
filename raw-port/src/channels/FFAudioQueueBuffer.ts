// FFAudioQueueBuffer.ts — Flexo audio-queue buffer descriptor.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo (macOS FCP, x86_64 slice; unadjusted VAs from
//         `otool -tV`).
//
// This file ports ONLY the setter
//   FFAudioQueueBuffer::setCrossFadeLength(unsigned long long)  @Flexo 0xd183c0
// Other members of FFAudioQueueBuffer are separate ledger entries and will be
// added to this same file when their own units are claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from this setter)
// -----------------------------------------------------------------------------
//   this+0x59 : bool     _crossFadeLocked  — a 1-byte guard flag. When it is
//               NONZERO (locked), setCrossFadeLength is a NO-OP; the stored
//               crossFadeLength is frozen. When it is 0 (unlocked), the setter
//               writes the incoming value.
//   this+0x60 : uint64_t _crossFadeLength  — the cross-fade length (an
//               unsigned long long — a sample/frame count, kept as bigint per
//               PORTING_SPEC Rule 4 since a 64-bit count can exceed 2^53).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN18FFAudioQueueBuffer18setCrossFadeLengthEy
//       — FFAudioQueueBuffer::setCrossFadeLength(unsigned long long) @Flexo 0xd183c0
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__ZN18FFAudioQueueBuffer18setCrossFadeLengthEy.s)
// -----------------------------------------------------------------------------
//   0xd183c0  pushq  %rbp
//   0xd183c1  movq   %rsp, %rbp
//   0xd183c4  cmpb   $0x0, 0x59(%rdi)   ; compare this->_crossFadeLocked with 0
//   0xd183c8  jne    0xd183ce           ; if locked (!= 0) => skip the store
//   0xd183ca  movq   %rsi, 0x60(%rdi)   ; this->_crossFadeLength = value
//   0xd183ce  popq   %rbp
//   0xd183cf  retq
//
// Dependencies: 0 in-scope, 0 indirect, 0 externs. Pure guarded field store.
// -----------------------------------------------------------------------------

/**
 * `FFAudioQueueBuffer` — a Flexo audio-queue buffer descriptor. Only
 * `setCrossFadeLength` is ported in this file so far; the full instance
 * layout is filled in as other members' units land.
 */
export class FFAudioQueueBuffer {
  /**
   * this+0x59 — the cross-fade lock flag. While nonzero (`true`), the
   * cross-fade length is frozen and `setCrossFadeLength` is a no-op.
   * Initialised `false` here; the true reset value is set by the ctor (a
   * separate ledger unit). Recovered offset: 0x59.
   */
  private _crossFadeLocked: boolean = false;

  /**
   * this+0x60 — the cross-fade length (unsigned long long). Kept as `bigint`
   * (PORTING_SPEC Rule 4: a 64-bit count can exceed 2^53). Initialised 0n;
   * the ctor establishes the real default. Recovered offset: 0x60.
   */
  private _crossFadeLength: bigint = 0n;

  /**
   * `FFAudioQueueBuffer::setCrossFadeLength(unsigned long long)` —
   * @Flexo 0xd183c0 (__ZN18FFAudioQueueBuffer18setCrossFadeLengthEy).
   *
   * Faithful transcription of the 7-instruction body: a GUARDED setter.
   * `%rdi` is the implicit `this`; `%rsi` is arg 1 (the uint64 value).
   *
   *   0xd183c4  cmpb $0x0, 0x59(%rdi)  ; this->_crossFadeLocked == 0 ?
   *   0xd183c8  jne  0xd183ce          ; nonzero (locked) => skip store, return
   *   0xd183ca  movq %rsi, 0x60(%rdi)  ; this->_crossFadeLength = value
   *
   * i.e. the write only happens when the lock byte is 0 (unlocked). No
   * callees, no externs. `value` is a 64-bit unsigned integer (bigint).
   */
  setCrossFadeLength(value: bigint): void {
    // @0xd183c4 cmpb $0x0,0x59(%rdi) ; @0xd183c8 jne : if locked, do nothing.
    if (this._crossFadeLocked) {
      // @0xd183ce fall-through to epilogue: store skipped.
      return;
    }
    // @0xd183ca movq %rsi, 0x60(%rdi) : store the value (unlocked path).
    this._crossFadeLength = BigInt.asUintN(64, value);
  }
}
