// HGRenderJob — Helium render job (partial port).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice). Disassembly source:
//   raw-port/re/disasm/Helium.__ZN11HGRenderJob10SetUserTagEy.s
//
// This file currently ports ONLY one method — `SetUserTag(uint64_t)`
// @Helium 0x54650. HGRenderJob is a large class (data at offset 0xc8+
// implies at least a 0xd0-byte layout); every other method is a separate
// ledger entry and will be added to THIS file (additive extension only)
// when it is claimed. Never a rewrite / drop of the currently-landed
// method.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only for the touched offset)
// -----------------------------------------------------------------------------
// HGRenderJob {
//   ...                          // fields 0x00..0xc0 not yet decoded
//   uint64_t userTag;   // offset 0xc8 — a user-supplied tag word; the
//                       // SetUserTag setter @0x54650 writes to it. The
//                       // matching getter (GetUserTag) is a separate
//                       // ledger entry not in this file's scope.
//   ...                          // fields >0xd0 not yet decoded
// }
//
// The `movq %rsi, 0xc8(%rdi)` at @0x54654 stores the argument (%rsi = 2nd
// SysV integer arg, the `y` = unsigned long long) into `this[0xc8]`.
// Nothing else is written; there are no callees; there is no ABI
// alignment on the 8-byte store.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   (none — the disasm has no callq instruction)
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN11HGRenderJob10SetUserTagEy
//       — HGRenderJob::SetUserTag(unsigned long long) @Helium 0x54650
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   0x54650  pushq  %rbp                              ; frame prologue
//   0x54651  movq   %rsp, %rbp
//   0x54654  movq   %rsi, 0xc8(%rdi)                  ; this->userTag = arg
//                                                    ; (%rdi = this, %rsi = tag)
//   0x5465b  popq   %rbp                              ; epilogue
//   0x5465c  retq
//   0x5465d  nopl   (%rax)                            ; padding

/**
 * `HGRenderJob` — Helium render job. Only its `SetUserTag` setter is
 * ported in this file; every other method is a separate ledger entry
 * (see file header). Field offsets not yet decoded are omitted; the
 * only visible member is `userTag` at offset 0xc8.
 */
export class HGRenderJob {
  /** @Helium HGRenderJob@0xc8 — the user-supplied tag word. Written by
   *  SetUserTag @0x54654; read by the matching getter (separate ledger
   *  entry). Stored as bigint because it is a 64-bit value with no
   *  sign convention and callers may set values that exceed 2^53. */
  userTag: bigint = 0n; // @Helium HGRenderJob@0xc8

  /**
   * `HGRenderJob::SetUserTag(unsigned long long)` @Helium 0x54650
   * (__ZN11HGRenderJob10SetUserTagEy).
   *
   * Faithful line-for-line transcription: writes the argument to the
   * userTag field at `this+0xc8`. No callees, no side effects, no
   * threading barriers — the disasm is a single 8-byte store between
   * a frame prologue and a `retq`.
   *
   * @param tag  the tag value (SysV %rsi at call site).
   */
  SetUserTag(tag: bigint): void {
    // ------------------------------------------------------------
    // @0x54650..0x54651 — prologue (no TS-visible effect).
    // @0x54654 — movq %rsi, 0xc8(%rdi)  →  this->userTag = tag
    // @0x5465b..0x5465c — epilogue + retq.
    // ------------------------------------------------------------
    this.userTag = tag;
  }
}
