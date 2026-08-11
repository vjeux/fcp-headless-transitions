// OZSceneSettings — 272-byte (0x110) settings block that lives at OZScene+0x90 and gets
// heap-copied into OZSceneSettingsUndo records (see raw-port/src/channels/OZSceneSettingsUndo.ts
// for the ownership/undo semantics). This file adds the FIRST decoded OZSceneSettings method:
// dynamicRangeTrackingEnabled(). Every future OZSceneSettings method is a separate ledger entry
// and must be added to THIS file (additive extension only) — never a rewrite / drop of a
// currently-landed method.
//
// Framework: Ozone
// Binary:   /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only for the touched offset)
// -----------------------------------------------------------------------------
// OZSceneSettings {              // 0x110 bytes total (per OZSceneSettingsUndo.ts's copy-ctor
//                                //   allocation @0x101095: `operator new(0x110)`)
//   ...                          // fields 0x00..0x43 not yet decoded
//   uint8_t dynamicRangeTracking; // offset 0x44 — a one-byte bool.
//                                //   dynamicRangeTrackingEnabled @0x33a440 reads it via
//                                //   `movzbl 0x44(%rdi), %eax` (zero-extend to u32 return).
//                                //   Values not yet enumerated by a paired setter; opaque
//                                //   uint8_t (only 0 / 1 are meaningful for a C++ bool but
//                                //   the byte can hold anything the setter writes).
//   ...                          // fields >0x45 not yet decoded (up to 0x110)
// }
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   dynamicRangeTrackingEnabled — none. Pure single-byte load, zero-extended.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZNK15OZSceneSettings27dynamicRangeTrackingEnabledEv
//       — OZSceneSettings::dynamicRangeTrackingEnabled() const @Ozone 0x33a440
//         (raw-port/re/disasm/
//           __ZNK15OZSceneSettings27dynamicRangeTrackingEnabledEv.s — 7 lines)
//   * __ZNK15OZSceneSettings19getDisplayFrameRateEv
//       — OZSceneSettings::getDisplayFrameRate() const @Ozone 0x33a380
//         (raw-port/re/disasm/
//           __ZNK15OZSceneSettings19getDisplayFrameRateEv.s — 16 lines)
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/
//              __ZNK15OZSceneSettings27dynamicRangeTrackingEnabledEv.s)
// -----------------------------------------------------------------------------
//   __ZNK15OZSceneSettings27dynamicRangeTrackingEnabledEv:
//     0x33a440  pushq  %rbp                        ; frame prologue
//     0x33a441  movq   %rsp, %rbp
//     0x33a444  movzbl 0x44(%rdi), %eax             ; %eax = zext(byte @ this+0x44)
//     0x33a448  popq   %rbp                        ; frame epilogue
//     0x33a449  retq
//     0x33a44a  nopw   (%rax,%rax)                  ; padding

/**
 * `OZSceneSettings` — 272-byte scene-settings block. Only the fields touched by the
 * ported methods are decoded at this layer; the rest of the object is OPAQUE (undecoded)
 * and is intentionally NOT modelled here — future ports of other OZSceneSettings methods
 * will add fields as their addresses are read.
 *
 * The 0x110-byte size is known from OZSceneSettingsUndo's copy-ctor allocation
 * (see raw-port/src/channels/OZSceneSettingsUndo.ts's @0x101095 `operator new(0x110)`).
 */
export class OZSceneSettings {
  /**
   * @Ozone OZSceneSettings@+0x44 — a one-byte bool.
   *
   * Read by `dynamicRangeTrackingEnabled()` @0x33a444 via
   * `movzbl 0x44(%rdi), %eax` (zero-extend byte to 32-bit return in %eax).
   * The single-byte width tells us this is a C++ `bool` / uint8 field.
   * Preserved as `number` (0..255) here so the exact bit-width the machine
   * writes is legible; the paired setter (not yet decoded) will confirm.
   */
  dynamicRangeTrackingAt44: number = 0; // @Ozone OZSceneSettings@0x44

  /**
   * @Ozone OZSceneSettings@+0x20 — an 8-byte double: the raw frame-rate value.
   *
   * Read by `getDisplayFrameRate() const` @0x33a380 via
   * `movsd 0x20(%rdi), %xmm0` (load the double into xmm0). This is the
   * unrounded frame-rate; when the NTSC flag at +0x28 is set the getter
   * applies the 1000/1001 drop-frame rounding (see getDisplayFrameRate).
   */
  frameRateAt20: number = 0; // @Ozone OZSceneSettings@0x20 (double)

  /**
   * @Ozone OZSceneSettings@+0x28 — a one-byte bool: the "NTSC / drop-frame"
   * flag. Read by `getDisplayFrameRate() const` @0x33a385 via
   * `cmpb $0x1, 0x28(%rdi)` — when it equals 1 the getter rounds the raw
   * frame rate to the nearest 1/100 using the NTSC 1000/1001 factor; when it
   * is any other value the raw double at +0x20 is returned verbatim.
   */
  ntscFlagAt28: number = 0; // @Ozone OZSceneSettings@0x28 (u8 bool)

  /**
   * `OZSceneSettings::dynamicRangeTrackingEnabled() const` @Ozone 0x33a440
   *   — __ZNK15OZSceneSettings27dynamicRangeTrackingEnabledEv
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *
   *   0x33a440  pushq  %rbp                     ; frame prologue
   *   0x33a441  movq   %rsp, %rbp
   *   0x33a444  movzbl 0x44(%rdi), %eax          ; %eax = zext(byte @ this+0x44)
   *   0x33a448  popq   %rbp                     ; frame epilogue
   *   0x33a449  retq
   *   0x33a44a  nopw   (%rax,%rax)               ; padding
   *
   * SEMANTICS:
   *   Single-instruction body: load the byte at this+0x44 zero-extended into the
   *   low 32 bits of %eax (the SysV integer return register). The upper 32 bits
   *   of %rax are cleared by the `movzbl` write (implicit x86-64 rule: any 32-bit
   *   destination write zeroes bits 63..32). So the C++ signature
   *   `bool dynamicRangeTrackingEnabled() const` returns a u8 value in the low
   *   byte, zero-extended through the full return register.
   *
   *   In C++, `bool` values are 0 or 1 by construction — but the byte held at
   *   +0x44 can be any u8 the (as-yet-undecoded) setter writes there. This
   *   getter faithfully returns whatever byte is stored, without collapsing
   *   non-zero-non-one values to 1.
   *
   *   To preserve that (and match the u32 return width the machine writes),
   *   we mask to a u8 (`& 0xff`) — identical to the `movzbl` semantics.
   *
   * Zero in-scope callees, zero externs — pure field read.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK15OZSceneSettings27dynamicRangeTrackingEnabledEv.s
   *   (7 lines)
   */
  dynamicRangeTrackingEnabled(this: OZSceneSettings): number {
    // @0x33a444  movzbl 0x44(%rdi),%eax
    //   Zero-extend a u8 into a 32-bit return; upper 32 bits of %rax are
    //   implicitly zeroed by the 32-bit destination write. Mask to u8 here
    //   to preserve the exact zero-extended width the CPU writes.
    return this.dynamicRangeTrackingAt44 & 0xff;
  }

  /**
   * `OZSceneSettings::getDisplayFrameRate() const` @Ozone 0x33a380
   *   — __ZNK15OZSceneSettings19getDisplayFrameRateEv
   *
   * Faithful line-for-line transcription of the 16-line disassembly
   * (raw-port/re/disasm/__ZNK15OZSceneSettings19getDisplayFrameRateEv.s):
   *
   *   0x33a380  movsd  0x20(%rdi), %xmm0          ; xmm0 = frameRate (double @this+0x20)
   *   0x33a385  cmpb   $0x1, 0x28(%rdi)           ; compare NTSC flag (byte @this+0x28) to 1
   *   0x33a389  jne    0x33a3c6                   ; if flag != 1 -> return raw frameRate
   *   0x33a38b  pushq  %rbp                       ; (frame prologue for the rounding path)
   *   0x33a38c  movq   %rsp, %rbp
   *   0x33a38f  mulsd  0x3d14f1(%rip), %xmm0       ; *= 0.999000999000999  (= 1000/1001) @0x70b888
   *   0x33a397  mulsd  0x3cb089(%rip), %xmm0       ; *= 100.0               @0x705428
   *   0x33a39f  addsd  0x3ccb01(%rip), %xmm0       ; += 0.5                 @0x706ea8
   *   0x33a3a7  addsd  0x3ccb21(%rip), %xmm0       ; += 1e-07               @0x706ed0
   *   0x33a3af  roundsd $0x9, %xmm0, %xmm0         ; round toward -inf (floor); imm 0x9 = 0x8(suppress)|0x1(down)
   *   0x33a3b5  cvttpd2dq %xmm0, %xmm0             ; truncate double -> int32; NaN/Inf/
   *                                                ;   out-of-range -> 0x80000000
   *   0x33a3b9  cvtdq2pd  %xmm0, %xmm0             ; int32 -> double
   *   0x33a3bd  mulsd  0x3cb05b(%rip), %xmm0       ; *= 0.01                @0x705420
   *   0x33a3c5  popq   %rbp
   *   0x33a3c6  retq                              ; return xmm0
   *
   * SEMANTICS:
   *   The raw frame-rate double is stored at this+0x20. If the NTSC/drop-frame
   *   flag byte at this+0x28 is exactly 1, the value is snapped to the nearest
   *   1/100 using the NTSC 1000/1001 pull-down factor:
   *       floor(frameRate * (1000/1001) * 100 + 0.5 + 1e-7) / 100
   *   (the +0.5 makes it a round-to-nearest, the +1e-7 is a tie-break epsilon,
   *   and roundsd $0x9 floors — cvttpd2dq/cvtdq2pd then narrow the already-
   *   integral value through int32). Otherwise (flag != 1) the raw double at
   *   +0x20 is returned unmodified.
   *
   *   All arithmetic is IEEE double here (movsd/mulsd/addsd) — NOT single
   *   precision — so no Math.fround wrapping is applied.
   *
   * Zero in-scope callees, zero externs — pure field read + constant arithmetic.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK15OZSceneSettings19getDisplayFrameRateEv.s (16 lines)
   */
  getDisplayFrameRate(this: OZSceneSettings): number {
    // @0x33a380  movsd 0x20(%rdi),%xmm0
    let x = this.frameRateAt20;
    // @0x33a385  cmpb $0x1,0x28(%rdi) ; @0x33a389 jne 0x33a3c6
    if ((this.ntscFlagAt28 & 0xff) !== 0x1) {
      // flag != 1 -> raw frameRate returned verbatim
      return x;
    }
    // @0x33a38f  mulsd 0.999000999000999 (=1000/1001) @0x70b888
    x = x * 0.999000999000999;
    // @0x33a397  mulsd 100.0 @0x705428
    x = x * 100.0;
    // @0x33a39f  addsd 0.5 @0x706ea8
    x = x + 0.5;
    // @0x33a3a7  addsd 1e-07 @0x706ed0
    x = x + 1e-7;
    // @0x33a3af  roundsd $0x9 -> floor (round toward -inf)
    x = Math.floor(x);
    // @0x33a3b5  cvttpd2dq %xmm0, %xmm0 — truncate double -> SIGNED int32.
    //   THIS IS NOT JS `x | 0`. ToInt32 wraps modulo 2^32 and maps NaN to 0;
    //   CVTTPD2DQ instead yields the x86 INTEGER INDEFINITE value 0x80000000
    //   (-2147483648) whenever the source is NaN, either infinity, or outside
    //   the int32 range — no wrap, no zero. The two agree on every input that
    //   fits and disagree on every input that does not, which is why the
    //   difference is invisible at realistic frame rates and shows up as a
    //   plausible wrong number at the edges (measured: `| 0` answered 0 for
    //   NaN/+-Inf/1e300 and +-11158520.92 for +-1e9, where FCP answers
    //   -21474836.48 in all six cases).
    //   x is already integral here (roundsd floored it), so within range the
    //   truncation is the identity and `| 0` is exact.
    x =
      Number.isNaN(x) || x < -2147483648 || x > 2147483647
        ? -2147483648
        : x | 0;
    // @0x33a3b9  cvtdq2pd %xmm0, %xmm0 — int32 -> double (identity in JS).
    x = x + 0.0;
    // @0x33a3bd  mulsd 0.01 @0x705420
    x = x * 0.01;
    return x;
  }
}
