// HGUserJob — Helium user-job (partial port).
//
// The class instance that HGRenderQueue::GetUserJob returns and HGUserExecUnit
// dispatches through (see raw-port/src/render/HGUserExecUnit.ts). HGUserJob is
// referenced there as an OPAQUE ref-type (`HGUserJobRef`) because none of its
// methods were ported at the time HGUserExecUnit was landed. This file adds
// the FIRST decoded HGUserJob method: SetPriority. Every future HGUserJob
// method is a separate ledger entry and must be added to THIS file
// (additive extension only) — never a rewrite / drop of currently-landed
// methods.
//
// Framework: Helium
// Binary:   /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Helium.framework/Versions/A/Helium (x86_64 slice; unadjusted VAs).
//
// Note on class distinction: HGUserJob (`__ZN9HGUserJob...`) is DIFFERENT
// from HGRenderJob (`__ZN11HGRenderJob...`) — see raw-port/src/render/
// HGRenderJob.ts for the latter. Both classes happen to expose a
// `SetPriority(Priority)` method with an enum-typed argument, and both
// use SysV's %esi (u32) for the enum tag, but they write to DIFFERENT
// field offsets (HGUserJob@+0x0c vs HGRenderJob@+0x68) inside DIFFERENT
// classes. The mangled names are the source of truth.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only for the touched offset)
// -----------------------------------------------------------------------------
// HGUserJob {
//   ...                          // fields 0x00..0x0b not yet decoded
//   uint32_t priority;   // offset 0x0c — HGUserJob::Priority enum tag.
//                        // SetPriority @0x2fe60 writes it via
//                        // `movl %esi, 0xc(%rdi)`. Values not enumerated
//                        // here; opaque u32.
//   ...                          // fields >0x10 not yet decoded
// }
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   SetPriority — none. Pure field write.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN9HGUserJob11SetPriorityENS_8PriorityE
//       — HGUserJob::SetPriority(HGUserJob::Priority) @Helium 0x2fe60
//         (raw-port/re/disasm/
//           Helium.__ZN9HGUserJob11SetPriorityENS_8PriorityE.s — 7 lines)
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/
//              Helium.__ZN9HGUserJob11SetPriorityENS_8PriorityE.s)
// -----------------------------------------------------------------------------
//   __ZN9HGUserJob11SetPriorityENS_8PriorityE:
//     0x2fe60  pushq  %rbp                       ; frame prologue
//     0x2fe61  movq   %rsp, %rbp
//     0x2fe64  movl   %esi, 0xc(%rdi)             ; this->+0x0c = arg (u32)
//     0x2fe67  popq   %rbp                       ; frame epilogue
//     0x2fe68  retq
//     0x2fe69  nopl   (%rax)                      ; padding

/**
 * `HGUserJob::Priority` — the enum whose tag is stored at HGUserJob@+0x0c.
 * Values are not yet enumerated here; SetPriority @0x2fe60 passes `esi`
 * (an unsigned 32-bit int) straight into the field. Modelled as `number`
 * so the exact machine width (u32) is legible; the getter (a separate
 * ledger entry, not in this file's scope) will confirm the enumeration
 * when it's decoded.
 */
export type HGUserJobPriority = number;

/**
 * `HGUserJob` — user-job dispatched by HGUserExecUnit.
 *
 * Only the fields touched by `SetPriority` are decoded at this layer; the
 * rest of the object is OPAQUE (undecoded) and is intentionally NOT
 * modelled here — future ports of other HGUserJob methods will add fields
 * as their addresses are read.
 */
export class HGUserJob {
  /**
   * @Helium HGUserJob@+0x0c — the u32 HGUserJob::Priority enum tag.
   * Written by SetPriority @0x2fe64 via `movl %esi, 0xc(%rdi)`. Zero-
   * initialised until a setter runs.
   */
  _priority: HGUserJobPriority = 0; // @Helium HGUserJob@0x0c

  /**
   * `HGUserJob::SetPriority(HGUserJob::Priority)` @Helium 0x2fe60
   *   — __ZN9HGUserJob11SetPriorityENS_8PriorityE
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *
   *   0x2fe60  pushq  %rbp                     ; frame prologue
   *   0x2fe61  movq   %rsp, %rbp
   *   0x2fe64  movl   %esi, 0xc(%rdi)           ; this->+0x0c = arg (u32)
   *   0x2fe67  popq   %rbp                     ; frame epilogue
   *   0x2fe68  retq
   *   0x2fe69  nopl   (%rax)                    ; padding
   *
   * Single-instruction body: store the incoming HGUserJob::Priority enum
   * argument (SysV/AAPCS puts scalar arg2 in `%rsi`; enum-args of ≤ 4 bytes
   * occupy the low 32 bits `%esi`) into the class slot at +0x0c.
   *
   * The `movl` is a 32-bit store — we mask to u32 (`>>> 0`) to preserve
   * the exact bit-width the machine writes. JS numbers are IEEE f64 which
   * can hold any u32 losslessly, but the mask keeps the observable state
   * legible as "the low 32 bits of `%esi`" (identical to `mov` semantics).
   *
   * Zero in-scope callees, zero externs — pure field write.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN9HGUserJob11SetPriorityENS_8PriorityE.s
   *   (7 lines)
   */
  SetPriority(priority: HGUserJobPriority): void {
    // @0x2fe64  movl %esi,0xc(%rdi)
    //   32-bit store; preserve the u32 width the CPU writes.
    this._priority = priority >>> 0;
  }
}
