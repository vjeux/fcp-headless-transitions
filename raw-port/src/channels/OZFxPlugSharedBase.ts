// OZFxPlugSharedBase.ts — Ozone OZFxPlugSharedBase (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice; unadjusted VAs).
//
// OZFxPlugSharedBase is the shared-state base object referenced (by raw
// back-pointer) from OZFxPlugSharedLock (raw-port/src/channels/OZFxPlugSharedLock.ts).
// This unit ports ONE accessor:
//
//   __ZNK18OZFxPlugSharedBase19getPluginXPCVersionEv
//     — OZFxPlugSharedBase::getPluginXPCVersion() const   @Ozone 0x513750
//
// ADDITIVE EXTENSION (second ledger unit, added later — nothing above removed):
//
//   __ZNK18OZFxPlugSharedBase12blendModeSetEv
//     — OZFxPlugSharedBase::blendModeSet() const          @Ozone 0x29bda0
//
// This is a FRESH class (not previously on origin/main). Future
// OZFxPlugSharedBase methods are separate ledger entries and must be ADDED to
// this file (additive extension only), never rewritten.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/OZFxPlugSharedBase.__ZNK18OZFxPlugSharedBase19getPluginXPCVersionEv.s — 6 lines)
// -----------------------------------------------------------------------------
//   __ZNK18OZFxPlugSharedBase19getPluginXPCVersionEv:
//     0x513750  pushq  %rbp                     ; frame prologue
//     0x513751  movq   %rsp, %rbp
//     0x513754  movq   0x118(%rdi), %rax        ; rax = this->pluginXPCVersion  (this+0x118, qword)
//     0x51375b  popq   %rbp                     ; frame epilogue
//     0x51375c  retq                            ; return rax
//     0x51375d  nopl   (%rax)                   ; alignment pad
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES — none. Pure field read; no calls, no in-scope callees.
// -----------------------------------------------------------------------------
//
// STRUCT LAYOUT (partial — recovered only from this accessor)
//   OZFxPlugSharedBase {
//     ...
//     +0x118  int64  pluginXPCVersion   ; read (movq) and returned by
//                                        ;   getPluginXPCVersion() const @0x513754.
//     ...
//   }
// Only the +0x118 field is derivable from this method; the rest of the object
// is OPAQUE (undecoded) and intentionally NOT modeled — future ports of other
// OZFxPlugSharedBase methods will add fields as their addresses are read.

// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZNK18OZFxPlugSharedBase12blendModeSetEv.s — 7 lines)
// -----------------------------------------------------------------------------
//   __ZNK18OZFxPlugSharedBase12blendModeSetEv:
//     0x29bda0  pushq   %rbp                    ; frame prologue
//     0x29bda1  movq    %rsp, %rbp
//     0x29bda4  movzbl  0xd1(%rdi), %eax        ; eax = zero_extend32(*(u8*)(this + 0xd1))
//                                               ; System-V: this = %rdi, return in %eax.
//                                               ; NOTE: NO `andb $0x1` follows — the byte is
//                                               ; returned WHOLE (not masked to bit 0), so a
//                                               ; faithful port must not normalize it either.
//     0x29bdab  popq    %rbp                    ; frame epilogue
//     0x29bdac  retq                            ; return eax
//     0x29bdad  nopl    (%rax)                  ; alignment pad — no effect
//
// FRONTIER CALLEES — none. Pure field read; no calls, no branches, no arithmetic.
//
// CORROBORATING WRITER (not ported here — its own ledger unit):
//   __ZN18OZFxPlugSharedBase15setBlendModeSetEb @Ozone 0x29bdb0 is
//     0x29bdb4  movb  %sil, 0xd1(%rdi)          ; store the incoming `bool` byte
//   i.e. the setter writes the SAME +0xd1 slot with a one-byte store of the low
//   byte of the second integer argument register. That pairing is what fixes both
//   the offset (0xd1) and the width (one byte, a C++ `bool`) of the field below.
//
// STRUCT LAYOUT (extension — recovered from this accessor)
//   OZFxPlugSharedBase {
//     ...
//     +0xd1   u8     blendModeSet      ; movzbl 0xd1(%rdi), %eax @0x29bda4 (read)
//                                      ; movb   %sil, 0xd1(%rdi) @0x29bdb4 (written by
//                                      ;   setBlendModeSet(bool), a separate unit)
//     ...
//   }

/**
 * `OZFxPlugSharedBase` — Ozone plug-in shared-state base object.
 *
 * Only the +0x118 `pluginXPCVersion` field and its accessor are decoded here
 * (from getPluginXPCVersion). All other fields are undecoded and omitted;
 * they will be added additively as sibling methods are ported.
 */
export class OZFxPlugSharedBase {
  /**
   * (this+0x118) — the plug-in XPC protocol version. Read as a 64-bit qword
   * (`movq 0x118(%rdi), %rax` @Ozone 0x513754) and returned directly by
   * `getPluginXPCVersion() const`. Modeled as a `number` (the value is a
   * plug-in interface version, well within the safe-integer range); if a
   * future call site proves it exceeds 2^53 this becomes a bigint.
   */
  pluginXPCVersion_at_0x118 = 0;

  /**
   * `OZFxPlugSharedBase::getPluginXPCVersion() const` — @Ozone 0x513750
   *   (__ZNK18OZFxPlugSharedBase19getPluginXPCVersionEv).
   *
   * Faithful line-for-line transcription of the 6-line disassembly quoted in
   * the file header: load the qword at this+0x118 and return it.
   *
   *   @0x513750  pushq %rbp                 ; prologue (JS scope entry)
   *   @0x513751  movq  %rsp, %rbp
   *   @0x513754  movq  0x118(%rdi), %rax     ; rax = this->pluginXPCVersion_at_0x118
   *   @0x51375b  popq  %rbp                  ; epilogue
   *   @0x51375c  retq                        ; return rax
   *
   * No callees, no branches, no arithmetic — a plain field getter.
   */
  getPluginXPCVersion(): number {
    // @0x513754 movq 0x118(%rdi), %rax : load the pluginXPCVersion qword.
    // @0x51375c retq                   : return it.
    return this.pluginXPCVersion_at_0x118;
  }

  /**
   * (this+0xd1) — the "blend mode set" flag byte.
   *
   * Width and offset are pinned from both sides: `blendModeSet() const` reads it
   * with a single-byte zero-extending load (`movzbl 0xd1(%rdi), %eax` @Ozone
   * 0x29bda4), and `setBlendModeSet(bool)` writes it with a single-byte store of
   * the `bool` argument's low byte (`movb %sil, 0xd1(%rdi)` @Ozone 0x29bdb4).
   * One byte, nothing adjacent touched — a C++ `bool` slot.
   *
   * Modelled as a `number` in [0, 255] (the repo's convention for a u8 slot, cf.
   * `OZViewerState.snappingFlags`) rather than a JS `boolean`, because the getter
   * returns the byte WITHOUT normalizing it: there is no `andb $0x1` and no
   * `setne`, so a byte other than 0/1 in that slot would be returned verbatim by
   * the machine, and the port must be able to reproduce that.
   */
  blendModeSet_at_0xd1 = 0;

  /**
   * `OZFxPlugSharedBase::blendModeSet() const` — @Ozone 0x29bda0
   *   (__ZNK18OZFxPlugSharedBase12blendModeSetEv).
   *
   * Faithful line-for-line transcription of the 7-line disassembly quoted in the
   * file header: zero-extend the byte at this+0xd1 into the 32-bit return
   * register and return it.
   *
   *   @0x29bda0  pushq  %rbp                  ; prologue (JS scope entry)
   *   @0x29bda1  movq   %rsp, %rbp
   *   @0x29bda4  movzbl 0xd1(%rdi), %eax      ; eax = zero_extend32(this->blendModeSet_at_0xd1)
   *   @0x29bdab  popq   %rbp                  ; epilogue
   *   @0x29bdac  retq                         ; return eax
   *
   * No callees, no branches, no arithmetic — a plain byte-field getter. The
   * return value is the RAW zero-extended byte, not a normalized 0/1: the
   * machine performs no mask (`andb`) or predicate (`setne`) on it, so neither
   * does this port. Consequently the TS return type is `number`, matching the
   * `movzbl`-into-`%eax` result, and callers that want the C++ `bool` truth
   * value test it against zero exactly as the compiled caller would.
   */
  blendModeSet(): number {
    // @0x29bda4 movzbl 0xd1(%rdi), %eax : zero-extending byte load of +0xd1.
    // @0x29bdac retq                    : return that zero-extended byte.
    return this.blendModeSet_at_0xd1;
  }
}
