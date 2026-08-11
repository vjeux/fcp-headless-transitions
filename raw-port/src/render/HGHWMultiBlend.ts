// HGHWMultiBlend — Helium's hardware multi-input blend node. This commit ports its
// `UpdateHWBlendStatus` refresh.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//            (x86_64 slice — every address below is an x86_64 offset)
// DECODE:    raw-port/re/disasm/Helium.__ZN14HGHWMultiBlend19UpdateHWBlendStatusEP10HGRenderer.s
//
// This file ports ONLY the symbol listed below; every other HGHWMultiBlend method — the C1/C2
// ctors @0x2bfc0/@0x2be40, label_B @0x2bfd0, the five SetInput overloads, SetParameter @0x2bfe0,
// GetOutput @0x2c250, GetDOD @0x2d010, RenderPageMetal @0x2d6xx — is its own ledger entry and
// will be ADDED here (additive extension only) when claimed.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN14HGHWMultiBlend19UpdateHWBlendStatusEP10HGRenderer
//       — HGHWMultiBlend::UpdateHWBlendStatus(HGRenderer*) @Helium 0x2c230
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   none. Four instructions, one compare and one byte store; no callq, no branch, and the
//   HGRenderer* argument is never even loaded.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (only the two slots this method touches)
// -----------------------------------------------------------------------------
//   +0x1d8  uint32 blendMode — compared against 0 by `cmpl $0x0, 0x1d8(%rdi)` @0x2c234. A 32-BIT
//           read. This class's own C2 ctor initialises it with `movl $0x2, 0x1d8(%rbx)` @0x2bef4,
//           so 2 is the constructed default. (The base class HGHWBlend writes the same slot —
//           `movq $0x1, 0x1d8(%rbx)` in its ctors @0x1a9318/@0x1a93f8/@0x1a94db/@0x1a96bb and
//           `movl %ecx, 0x1d8(%rdi)` in HGHWBlend::SetParameter @0x1a99bc — which is what places
//           the field in the shared base and shows it is a caller-settable mode word, not a
//           private cache.)
//   +0x1e0  uint8  hwBlendStatus — written by `setne 0x1e0(%rdi)` @0x2c23b, an 8-BIT store of 0
//           or 1. HGHWBlend's ctors zero it as part of a 16-bit `movw $0x0, 0x1e0(%rbx)`
//           @0x1a9323 etc., i.e. +0x1e0 and +0x1e1 are two separate bytes and this method touches
//           ONLY the first. HGHWBlend has its own, longer UpdateHWBlendStatus @0x1a9c60 that ends
//           in `movb %al, 0x1e0(%rbx)` @0x1a9ce5 — a different computation into the same slot;
//           that override is NOT this unit.
//
// -----------------------------------------------------------------------------
// FULL DISASM — UpdateHWBlendStatus @0x2c230 (every instruction, in order)
// -----------------------------------------------------------------------------
//   0x2c230  pushq %rbp                      ; frame prologue
//   0x2c231  movq  %rsp, %rbp
//   0x2c234  cmpl  $0x0, 0x1d8(%rdi)         ; flags on (blendMode - 0), a 32-bit read
//   0x2c23b  setne 0x1e0(%rdi)               ; store (blendMode != 0) as a byte, 0 or 1
//   0x2c242  popq  %rbp                      ; epilogue
//   0x2c243  retq
//   0x2c244  nopw  %cs:(%rax,%rax)           ; padding — not executed
//
// DECODE NOTES
//  - `setne` keys on ZF alone, so this is exactly "blendMode is non-zero" — not a comparison
//    against the constructed default 2, and not a bitmask. Any non-zero mode gives 1.
//  - The destination of `setne` is MEMORY, so the store is one byte wide and the value is
//    canonical 0 or 1. Modelling the field as a 32-bit write would clobber +0x1e1..+0x1e3, which
//    the machine leaves alone; the oracle measures that.
//  - The `HGRenderer*` parameter (%rsi) is never read. It is part of the virtual signature, not
//    of this override's behaviour — measured below by passing poison.
//  - Nothing is returned (void); the only observable effect is the single byte.

/**
 * `HGHWMultiBlend` — Helium hardware multi-input blend node. This file holds the symbol listed
 * under "Symbols ported here" in the file header; every other method is a separate ledger entry.
 * Only the two offsets the ported body touches are modelled (PORTING_SPEC Rule 5).
 */
export class HGHWMultiBlend {
  /**
   * @Helium HGHWMultiBlend@0x1d8 — the u32 blend-mode word this refresh tests. Initialised to 2
   * by this class's ctor @0x2bef4 (and to 1 by the base HGHWBlend's ctors @0x1a9318 …), and set
   * by HGHWBlend::SetParameter @0x1a99bc. Held as an unsigned 32-bit value; only its
   * zero/non-zero state matters to the ported method.
   */
  blendMode_at_0x1d8 = 2; // @Helium HGHWMultiBlend@0x1d8 — ctor default, `movl $0x2` @0x2bef4

  /**
   * @Helium HGHWMultiBlend@0x1e0 — the one-byte "hardware blend is active" status this refresh
   * writes with `setne` @0x2c23b. Zero-initialised (the base ctors clear it together with +0x1e1
   * via a 16-bit store). Held as a NUMBER because the machine's slot is a byte that other code
   * reads directly; the values this method can produce are exactly 0 and 1.
   */
  hwBlendStatus_at_0x1e0 = 0; // @Helium HGHWMultiBlend@0x1e0

  /**
   * `HGHWMultiBlend::UpdateHWBlendStatus(HGRenderer*)` @Helium 0x2c230
   *   (__ZN14HGHWMultiBlend19UpdateHWBlendStatusEP10HGRenderer)
   *
   * Full transcription of the 5-instruction body (see the FULL DISASM block in the file header):
   * set the one-byte status at +0x1e0 to 1 when the u32 mode at +0x1d8 is non-zero, else 0. No
   * callees, no branch, no return value, and the renderer argument is not read.
   *
   * DIFFERENTIAL against the live binary (exported: `000000000002c230 T` in
   * raw-port/army/inventory/Helium.syms.txt, so dlsym reaches it; run under
   * `arch -x86_64 /usr/bin/python3` because every address cited here is an x86_64 offset and the
   * arm64 slice is a different function, per OPS_LOG):
   * raw-port/re/oracle/HGHWMultiBlend_UpdateHWBlendStatus_oracle.py calls the real method on a
   * 0x220-byte object poisoned with 0xEE, sweeping the +0x1d8 word over 0, 1, 2, the sign-bit
   * patterns and seeded-random u32s, and after each call checks the byte at +0x1e0, that +0x1e1
   * is still poison (so the store really is 8 bits), and that no other byte of the object moved.
   * The renderer pointer is poison throughout. See the commit message for the recorded run.
   *
   * @param _renderer the HGRenderer* (%rsi) — never dereferenced.
   */
  UpdateHWBlendStatus(_renderer: unknown): void {
    // ------------------------------------------------------------
    // @0x2c234 — cmpl $0x0, 0x1d8(%rdi) : a 32-bit read of the mode word; `>>> 0` is that width.
    // @0x2c23b — setne 0x1e0(%rdi) : ZF-only, so "non-zero" -> 1 and "zero" -> 0, stored as ONE
    //   byte. The neighbouring byte at +0x1e1 is deliberately not touched.
    // ------------------------------------------------------------
    void _renderer; // %rsi is never loaded by the body.
    this.hwBlendStatus_at_0x1e0 = (this.blendMode_at_0x1d8 >>> 0) !== 0 ? 1 : 0;
  }
}
