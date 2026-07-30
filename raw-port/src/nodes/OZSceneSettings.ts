// OZSceneSettings — the scene's global-settings bag (canvas format, frame rate,
// 360°-project flag, glyph OSC mode, bit depth, ...). Owned by OZScene and read
// throughout the render pipeline. This file is the FIRST decoded field/method
// for the real OZSceneSettings class (offsets recovered from Ozone disasm; the
// existing `OZSceneSettings` name in OZScene.ts and OZSimulationState.ts is a
// module-local shim/brand stub — those will be reconciled as their peers land).
//
// Framework: Ozone
// Binary:   /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs).
// Disasm:   raw-port/re/disasm/__ZNK15OZSceneSettings12is360ProjectEv.s
//
// -----------------------------------------------------------------------------
// FIELD LAYOUT (fields discovered from is360Project's read; other slots are
// undecoded and NOT modelled here — future ports will add them)
// -----------------------------------------------------------------------------
//   +0x10c  int32  is360ProjectFlagAt10c  ; @0x33a554 read (32-bit `cmpl` load)
//
// The `cmpl $0x0, 0x10c(%rdi)` at @0x33a554 reads a 32-bit slot and compares
// to zero. `setne %al` returns 1 iff the loaded value is non-zero. The width
// is 32 bits (`cmpl`), so we model the field as an `int32` (using JS `number`;
// only bit-width matters at truncation points — none here, since we only test
// != 0).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZNK15OZSceneSettings12is360ProjectEv
//       — OZSceneSettings::is360Project() const @Ozone 0x33a550
//         (raw-port/re/disasm/__ZNK15OZSceneSettings12is360ProjectEv.s — 7 lines)
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   __ZNK15OZSceneSettings12is360ProjectEv:
//     0x33a550  pushq  %rbp                        ; frame prologue
//     0x33a551  movq   %rsp, %rbp
//     0x33a554  cmpl   $0x0, 0x10c(%rdi)           ; flag - 0  (32-bit read at +0x10c)
//     0x33a55b  setne  %al                         ; %al = (flag != 0) ? 1 : 0
//                                                    ; (setne = "set if ZF==0"; ZF cleared
//                                                    ;  when flag != 0 in the sub above)
//     0x33a55e  popq   %rbp                        ; frame epilogue
//     0x33a55f  retq                               ; return zero-extended %al

/**
 * `OZSceneSettings` — the scene-wide settings bag. ONLY the field touched by
 * `is360Project` is decoded at this layer; the rest of the object is OPAQUE.
 * Peers (setFrameRate, getFrameDuration, setBGColor, ...) will each land their
 * own offsets as they're ported and extend this class. Per the porting spec,
 * we DON'T fabricate unread fields.
 */
export class OZSceneSettings {
  /**
   * @Ozone offset +0x10c — a 32-bit flag read by `is360Project() const`
   * @0x33a554 via `cmpl $0x0, 0x10c(%rdi)`. The 4-byte load width tells us
   * this slot holds a 32-bit integer (possibly a `bool32`/`BOOL` or an
   * enum-like project-type discriminator). Modelled as `number` since JS
   * numbers cover all int32 values; no arithmetic is performed on this
   * field in is360Project so no width-truncation is required here.
   *
   * The name reflects what is360Project reads: a non-zero value means the
   * scene is a 360° project. The setter for this flag lives elsewhere in
   * Ozone (not yet ported); when it lands the field's precise semantics
   * (bool32 vs enum) will be pinned.
   */
  is360ProjectFlagAt10c: number = 0;

  /**
   * `OZSceneSettings::is360Project() const`
   *   — @Ozone 0x33a550
   *   — __ZNK15OZSceneSettings12is360ProjectEv
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *   0x33a550  pushq  %rbp
   *   0x33a551  movq   %rsp, %rbp
   *   0x33a554  cmpl   $0x0, 0x10c(%rdi)   ; flags = (flag - 0), 32-bit
   *   0x33a55b  setne  %al                 ; %al = (flag != 0) ? 1 : 0
   *   0x33a55e  popq   %rbp
   *   0x33a55f  retq                       ; C++ `bool` returned in %al (zero-ext)
   *
   * Semantics: returns TRUE iff the 32-bit flag at +0x10c is non-zero. The
   * `cmpl` computes `dst - src` = `flag - 0` in AT&T operand order; `setne`
   * takes ZF==0, i.e. the subtraction was non-zero, i.e. `flag != 0`. The C++
   * return type is `bool` (1 byte), returned via the low byte %al.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure field
   * comparison. The @Ozone offset +0x10c is decoded here; no other field is
   * touched.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK15OZSceneSettings12is360ProjectEv.s (7 lines)
   */
  is360Project(): boolean {
    // @0x33a554  cmpl $0x0, 0x10c(%rdi)
    // @0x33a55b  setne %al
    //   `setne` after `cmpl X, 0` is TRUE iff X != 0. Truncate to int32
    //   the way the `cmpl` load would (32-bit fetch): the value is used
    //   only for a != 0 test, so `| 0` clamps the JS number to int32 and
    //   preserves the exact zero-vs-non-zero distinction the machine sees.
    return (this.is360ProjectFlagAt10c | 0) !== 0;
  }
}
