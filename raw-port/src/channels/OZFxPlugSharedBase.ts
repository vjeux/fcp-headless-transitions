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
}
