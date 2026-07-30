// OZViewerState — Ozone.framework class (partial port).
//
// This unit ports ONLY the single one-line accessor
// `OZViewerState::getDynamicResolution()` at @Ozone 0x36e2d0. Every other
// member of OZViewerState (ctors, dtors, setters, other getters) is a
// SEPARATE ledger entry and remains OUT OF SCOPE for this file — later
// worker(s) will EXTEND this file with additional methods per the
// one-class-per-file rule.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone (x86_64 slice). Disassembly source:
//   raw-port/re/disasm/__ZN13OZViewerState20getDynamicResolutionEv.s
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered from this getter's single field read)
// -----------------------------------------------------------------------------
//   size ≥ 0x25 (this file only decodes ONE offset)
//   +0x24  dynamicResolution : u8    ; movzbl 0x24(%rdi), %eax  @0x36e2d4
//                                    ; the accessor zero-extends this byte
//                                    ; into a 32-bit return value in %eax.
//
// Layout is deliberately UNDER-specified here: we only claim the offset
// we actually read; other slots will be documented as their own methods
// are ported. Adding a `dynamicResolution: number` field is honest at
// this granularity — a u8 field materialised as a JS number.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   NONE. This body performs one byte-load and returns. No in-scope
//   callees; no externs; no field writes; no branches.
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED HERE (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN13OZViewerState20getDynamicResolutionEv
//       — OZViewerState::getDynamicResolution() @Ozone 0x36e2d0
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZN13OZViewerState20getDynamicResolutionEv.s)
// -----------------------------------------------------------------------------
//   0x36e2d0  pushq   %rbp                       ; frame prologue
//   0x36e2d1  movq    %rsp, %rbp
//   0x36e2d4  movzbl  0x24(%rdi), %eax           ; eax = *(u8*)(this + 0x24)
//                                                ; (zero-extend into 32 bits)
//                                                ; System-V ABI: this = %rdi.
//                                                ; %eax is the return register
//                                                ; (upper 32 bits of %rax are
//                                                ;  implicitly cleared by the
//                                                ;  movzbl-to-32-bit form).
//   0x36e2d8  popq    %rbp                       ; frame epilogue
//   0x36e2d9  retq
//   0x36e2da  nopw    (%rax,%rax)                ; padding — no effect

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZViewerState` — Ozone playback/viewer state (partial port).
 *
 * ONLY the `getDynamicResolution()` accessor is transcribed in this
 * file; every other member is a separate ledger entry and OUT OF SCOPE
 * for this claim. Do NOT add un-transcribed methods to this class —
 * later worker(s) will extend it per the one-class-per-file rule.
 */
export class OZViewerState {
  /**
   * @Ozone +0x24 (u8) — the dynamic-resolution byte. Read by
   * `getDynamicResolution()` @0x36e2d4 via `movzbl 0x24(%rdi), %eax`.
   * The other 0x24 bytes of the object are OUT OF SCOPE for this
   * file and remain undocumented until their own methods are ported.
   */
  dynamicResolution: number = 0; // u8 field @+0x24

  /**
   * `OZViewerState::getDynamicResolution()` @Ozone 0x36e2d0
   *   — __ZN13OZViewerState20getDynamicResolutionEv
   *
   * Faithful transcription of the 4-instruction body: pushq/movq %rbp
   * (prologue), `movzbl 0x24(%rdi), %eax` — load the u8 at +0x24 and
   * zero-extend to 32 bits — popq %rbp (epilogue), retq. The return
   * value is a u8 zero-extended to u32; expressed in JS as a number in
   * the range [0, 255] (masking with `& 0xff` preserves the movzbl
   * semantics against a hypothetical wider field).
   *
   *   0x36e2d0  pushq  %rbp
   *   0x36e2d1  movq   %rsp, %rbp
   *   0x36e2d4  movzbl 0x24(%rdi), %eax
   *   0x36e2d8  popq   %rbp
   *   0x36e2d9  retq
   */
  getDynamicResolution(): number {
    // @0x36e2d0..0x36e2d1 — prologue (no TS-visible effect).
    // @0x36e2d4           — movzbl 0x24(%rdi), %eax: read the u8 at
    //                       offset +0x24 and zero-extend to 32 bits.
    // @0x36e2d8..0x36e2d9 — epilogue + retq.
    return this.dynamicResolution & 0xff;
  }
}
