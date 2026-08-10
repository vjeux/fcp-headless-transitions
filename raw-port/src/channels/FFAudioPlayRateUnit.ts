// FFAudioPlayRateUnit.ts — the FCP Flexo framework's audio play-rate effect
// unit. This file ports the single const accessor playRateEffectAudioUnit,
// faithfully transcribed from the FCP Flexo binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (x86_64 slice; unadjusted VAs — the same addresses raw-port/re/disasm uses).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (only the fields playRateEffectAudioUnit reads are decoded here)
// -----------------------------------------------------------------------------
//   +0x10  <effect>*   ; a pointer to the play-rate effect object
//                        (read @0xd174c4 `movq 0x10(%rdi),%rax`)
//       within that effect object:
//   +0x20  AudioUnit   ; the effect's AudioUnit handle
//                        (read @0xd174c8 `movq 0x20(%rax),%rax`)
//
// playRateEffectAudioUnit only performs this two-step pointer walk; it does not
// touch any other slot of either object, so we model +0x10 as an opaque effect
// holder exposing an opaque `audioUnitAt20` handle. We do NOT invent the rest
// of either struct (PORTING_SPEC Rule 5 — model only the fields actually read).
// No externs, no in-scope callees, no indirect/virtual calls.

/**
 * A minimal opaque model of the object at FFAudioPlayRateUnit+0x10 (the
 * play-rate effect) — only its +0x20 AudioUnit handle is decoded, because that
 * is the only slot playRateEffectAudioUnit dereferences.
 */
export interface FFPlayRateEffect {
  /**
   * @Flexo offset +0x20 within the +0x10 effect — the effect's AudioUnit
   * handle (read @0xd174c8 `movq 0x20(%rax),%rax`). Opaque Core Audio handle.
   */
  audioUnitAt20: unknown;
}

/**
 * FFAudioPlayRateUnit — Flexo's audio play-rate effect unit. Only the const
 * accessor playRateEffectAudioUnit is ported in this file (per PORTING_SPEC's
 * one-symbol-per-file rule for its owning class).
 * @Flexo (Flexo.framework)
 */
export class FFAudioPlayRateUnit {
  /**
   * @Flexo offset +0x10 — pointer to the play-rate effect object whose +0x20
   * is the AudioUnit (read @0xd174c4 `movq 0x10(%rdi),%rax`). Opaque; only its
   * +0x20 field is dereferenced here.
   */
  effectAt10: FFPlayRateEffect = { audioUnitAt20: null };

  /**
   * `FFAudioPlayRateUnit::playRateEffectAudioUnit() const` -> AudioUnit
   *   — @Flexo 0xd174c0
   *   — __ZNK19FFAudioPlayRateUnit23playRateEffectAudioUnitEv
   *
   * Faithful line-for-line transcription of the 8-line disassembly:
   *   0xd174c0  pushq  %rbp
   *   0xd174c1  movq   %rsp, %rbp
   *   0xd174c4  movq   0x10(%rdi), %rax        ; rax = this->effectAt10 (+0x10)
   *   0xd174c8  movq   0x20(%rax), %rax        ; rax = effect->audioUnitAt20 (+0x20)
   *   0xd174cc  popq   %rbp
   *   0xd174cd  retq
   *   0xd174ce  nop                            ; alignment padding
   *
   * SEMANTICS: a pure two-step pointer walk — dereference the play-rate effect
   * pointer at this+0x10, then return the AudioUnit handle stored at that
   * effect's +0x20. Both are `movq` MEMORY LOADS (not `leaq`), so each step
   * reads a stored POINTER VALUE, not an address-of. The returned value is the
   * VALUE at effect+0x20 (the AudioUnit handle itself).
   *
   * DEPENDENCIES: zero in-scope callees, zero externs, no indirect/virtual
   * dispatch. Pure field access.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Flexo.__ZNK19FFAudioPlayRateUnit23playRateEffectAudioUnitEv.s (8 lines)
   */
  playRateEffectAudioUnit(): unknown {
    // @0xd174c4  movq 0x10(%rdi),%rax  ; rax = this->effectAt10
    const effect = this.effectAt10;
    // @0xd174c8  movq 0x20(%rax),%rax  ; rax = effect->audioUnitAt20
    return effect.audioUnitAt20;
  }
}
