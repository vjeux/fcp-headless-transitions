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
}
