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
//   ...                          // fields 0x10..0x3f not yet decoded
//   // ^ NARROWED by the GetQueueID port below — the first field decoded
//   //   inside that range is:
//   uint32_t queueID;    // offset 0x14 — the u32 render-queue identifier.
//                        // GetQueueID @0x2fef4 READS it via
//                        // `movl 0x14(%rdi), %eax`; the sibling setter
//                        // SetQueueID(unsigned int) @0x2fe54 WRITES it via
//                        // `movl %esi, 0x14(%rdi)` (its `unsigned int`
//                        // parameter is what fixes the field's type and
//                        // 32-bit width); and the ctor @0x2fd19 zero-inits
//                        // +0x14..+0x23 with `movups %xmm0, 0x14(%rbx)`,
//                        // so the field starts at 0.
//   ...                          // fields 0x18..0x3f still not decoded
//   void (*notifyFunc)(HGUserJob*);
//                        // offset 0x40 — function pointer written by
//                        // SetNotifyFunc @0x2fee0 via
//                        // `movq %rsi, 0x40(%rdi)` (8-byte code ptr).
//   ...                          // fields >0x48 not yet decoded
// }
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   SetPriority     — none. Pure field write.
//   SetNotifyFunc   — none. Pure field write.
//   GetQueueID      — none. Pure field read.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN9HGUserJob11SetPriorityENS_8PriorityE
//       — HGUserJob::SetPriority(HGUserJob::Priority) @Helium 0x2fe60
//         (raw-port/re/disasm/
//           Helium.__ZN9HGUserJob11SetPriorityENS_8PriorityE.s — 7 lines)
//   * __ZN9HGUserJob13SetNotifyFuncEPFvPS_E
//       — HGUserJob::SetNotifyFunc(void (*)(HGUserJob*)) @Helium 0x2fee0
//         (raw-port/re/disasm/
//           Helium.__ZN9HGUserJob13SetNotifyFuncEPFvPS_E.s — 7 lines)
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
 * `HGUserJob::NotifyFunc` — a C function pointer of type
 * `void (*)(HGUserJob*)`. Stored at HGUserJob@+0x40 by
 * `SetNotifyFunc` @0x2fee4 via `movq %rsi, 0x40(%rdi)` (8-byte pointer
 * store). Callers dispatch through this slot to notify observers of
 * the job's completion or state transition. The setter transcribed
 * in this file only writes; the read/dispatch site lives in a peer
 * method (not in scope here).
 *
 * Modelled as a plain TS function of the same shape. The pointer's
 * IDENTITY is what matters (equal-to comparisons in the caller may
 * check "is a callback installed?"); JS closures preserve identity
 * bit-for-bit for this purpose.
 */
export type HGUserJobNotifyFn = (job: HGUserJob) => void;

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
   * @Helium HGUserJob@+0x40 — a function-pointer slot. Written by
   * `SetNotifyFunc(void (*)(HGUserJob*))` @0x2fee4 via
   * `movq %rsi, 0x40(%rdi)`. The 64-bit `movq` (8-byte) store confirms
   * this holds a raw pointer (Itanium ABI 8-byte code pointers on
   * x86_64). The stored value is the callback the render machinery
   * invokes to notify observers of this HGUserJob's completion / state.
   *
   * Modelled as `HGUserJobNotifyFn | null`: null = "no callback set"
   * (the zero-initialised value in C++), a function = the exact
   * callback pointer the CPU stored. Callers of the notify path
   * check this slot for null before dispatch — that read isn't in
   * SetNotifyFunc's scope, so this file only writes.
   */
  _notifyFunc: HGUserJobNotifyFn | null = null; // @Helium HGUserJob@0x40

  /**
   * @Helium HGUserJob@+0x14 — the u32 render-queue identifier.
   *
   * Read by `GetQueueID()` @0x2fef4 via `movl 0x14(%rdi), %eax`. The
   * field's type and width come from its sibling setter
   * `SetQueueID(unsigned int)` @0x2fe54, whose whole body is
   * `movl %esi, 0x14(%rdi)` — an `unsigned int` parameter stored as a
   * 32-bit word at the very offset this getter loads. (SetQueueID is a
   * SEPARATE ledger unit and is deliberately NOT ported here; its
   * disassembly is cited only as layout evidence, exactly as the class
   * header does.)
   *
   * Initial value 0: the constructor @0x2fd19 zeroes +0x14..+0x23 with
   * `movups %xmm0, 0x14(%rbx)`.
   */
  _queueID: number = 0; // @Helium HGUserJob@0x14

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

  /**
   * `HGUserJob::SetNotifyFunc(void (*)(HGUserJob*))` @Helium 0x2fee0
   *   — __ZN9HGUserJob13SetNotifyFuncEPFvPS_E
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *
   *   0x2fee0  pushq  %rbp                     ; frame prologue
   *   0x2fee1  movq   %rsp, %rbp
   *   0x2fee4  movq   %rsi, 0x40(%rdi)          ; this->+0x40 = arg (function ptr, 8 bytes)
   *   0x2fee8  popq   %rbp                     ; frame epilogue
   *   0x2fee9  retq
   *   0x2feea  nopw   (%rax,%rax)               ; padding
   *
   * Single-instruction body: store the incoming function-pointer
   * argument (SysV/AAPCS puts scalar arg2 in `%rsi`; a code pointer
   * occupies all 64 bits) into the class slot at +0x40. The write
   * width `movq` is 8 bytes — the full pointer, not a truncated value.
   *
   * Zero in-scope callees, zero externs — pure field write. This is a
   * "setter" method mirroring `SetPriority`'s structural shape (same
   * prologue/store/epilogue skeleton), differing only in the store
   * width (movq vs movl) and offset (+0x40 vs +0x0c). See the top-of-
   * file "STRUCT LAYOUT" comment for the field's decoded role.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN9HGUserJob13SetNotifyFuncEPFvPS_E.s
   *   (7 lines)
   */
  SetNotifyFunc(fn: HGUserJobNotifyFn | null): void {
    // @0x2fee4  movq %rsi,0x40(%rdi)
    //   8-byte pointer store. In C++ the caller may pass a null pointer
    //   (0x0000000000000000) to clear the callback; we model that with
    //   TS `null` so the read side ("if (this._notifyFunc)" -> dispatch)
    //   observes the same "no callback" semantics.
    this._notifyFunc = fn;
  }

  /**
   * `HGUserJob::GetQueueID()` @Helium 0x2fef0
   *   — __ZN9HGUserJob10GetQueueIDEv
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *
   *   0x2fef0  pushq  %rbp                     ; frame prologue
   *   0x2fef1  movq   %rsp, %rbp
   *   0x2fef4  movl   0x14(%rdi), %eax          ; eax = this->+0x14 (u32 load)
   *   0x2fef7  popq   %rbp                     ; frame epilogue
   *   0x2fef8  retq
   *   0x2fef9  nopl   (%rax)                    ; padding — not executed
   *
   * Single-instruction body: load the 32-bit field at +0x14 into the
   * return register. The mirror image of `SetPriority`/`SetNotifyFunc`
   * above — same prologue/one-access/epilogue skeleton, but a READ.
   *
   * `movl` into `%eax` zero-extends into `%rax`, so the value is an
   * unsigned 32-bit quantity; the port masks with `>>> 0` to keep that
   * width observable, matching the mask `SetPriority` applies on the
   * store side. No sign extension is performed by the machine and none
   * is performed here.
   *
   * Zero in-scope callees, zero externs, no dispatch — pure field read
   * (`depgraph.py deps` lists nothing for this symbol).
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN9HGUserJob10GetQueueIDEv.s (7 lines)
   */
  GetQueueID(): number {
    // @0x2fef4  movl 0x14(%rdi),%eax
    //   32-bit zero-extending load; preserve the u32 width the CPU reads.
    return this._queueID >>> 0;
  }
}
