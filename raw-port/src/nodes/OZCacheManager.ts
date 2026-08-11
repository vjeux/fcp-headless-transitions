// OZCacheManager — Ozone-layer cache/inhibit manager. This file starts with
// the `inhibit(bool)` setter — a 7-instruction atomic-swap of a byte flag at
// this+0x18. Other methods of OZCacheManager (ctor, destructor, hasSomething
// checks, etc.) are separate ledger units and will be added to this file as
// each of their units is claimed. Per porting-spec Rule 6 (one class per
// file), the file is named after the class and holds only OZCacheManager.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — only fields touched by the currently-ported methods)
// -----------------------------------------------------------------------------
// OZCacheManager {
//   ...
//   +0x18  inhibitFlag : uint8_t   // bool set by inhibit(bool); read by
//                                   // future accessors. Written via `xchgb`
//                                   // for atomic single-instr publication
//                                   // to other threads that might poll it.
//   ...
// }
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN14OZCacheManager7inhibitEb
//       — OZCacheManager::inhibit(bool) @Ozone 0x38f2c0
//   * __ZN14OZCacheManager15clearImageCacheEv
//       — OZCacheManager::clearImageCache() @Ozone 0x38ee00
//
// -----------------------------------------------------------------------------
// LAYOUT ADDED BY clearImageCache (@0x38ee00) — only what THAT body writes:
//   +0x28  uint32  zeroed by `xchgl %eax,0x28(%rbx)` @0x38ee19 (atomic, 32-bit)
//   +0x30  uint64  zeroed by `xchgq %rax,0x30(%rbx)` @0x38ee1e (atomic, 64-bit)
// Their meaning is NOT decoded by this body (it only clears them), so they are
// recorded as raw offset-named slots rather than given invented names (Rule 5).
//
// -----------------------------------------------------------------------------
// FILE-STATIC `(anonymous namespace)::hosted` (__ZN12_GLOBAL__N_16hostedE)
// -----------------------------------------------------------------------------
// An Ozone-internal one-byte flag, read by clearImageCache @0x38ee00 as an
// early-out guard. Its writer and its other readers are both in this same
// class (evidence, not transcribed — each is its own ledger unit):
//   * written `movb %bl, hosted(%rip)` @0x38e8e7, in the body that first tries
//     the ObjC `-[PCApp openUntitledDocumentAndDisplay:error:]` @0x38e8d6 and
//     records the flag only when that returns false;
//   * read `movzbl hosted(%rip),%eax` @0x38e904 — the whole body of
//     `OZCacheManager::isHosted()` @0x38e900.
// Mach-O zero-fills an uninitialised file-static, so its start value is 0
// ("not hosted"). Modelled as a module-level byte, the same convention the
// landed OZChannelTimeConverter.ts uses for its own file-static.

/**
 * `(anonymous namespace)::hosted` — the Ozone file-static byte
 * (`__ZN12_GLOBAL__N_16hostedE`) that `clearImageCache` @0x38ee00 tests as its
 * early-out guard (`cmpb $0x0, hosted(%rip)` @0x38ee00). See the file header
 * for the writer @0x38e8e7 and the `isHosted()` reader @0x38e900 that ground
 * it. Mach-O zero-fills an uninitialised file-static, so it starts at 0.
 */
let hosted: number = 0; // @Ozone __ZN12_GLOBAL__N_16hostedE

/**
 * `PMClearBitmapCache()` (`__Z18PMClearBitmapCachev`) — a TRUE OUT-OF-SCOPE
 * extern. It is exported by **ProMedia.framework**, a SIXTH framework outside
 * this port's five (ProCore / ProChannel / Ozone / Flexo / Helium): `nm` finds
 * the symbol in none of the five and `nm -gU ProMedia` finds exactly one. Ozone
 * reaches it through the imported symbol stub 0x6dd158, called @0x38ee12.
 *
 * There is no ProMedia bitmap cache in this port, so the default hook is a
 * documented NO-OP rather than a throw: the call has no state here to affect,
 * and throwing would abort the two atomic clears the SAME body performs
 * afterwards (@0x38ee19/@0x38ee1e), which are real, observable work. A host
 * that does own a ProMedia cache wires the real function through
 * {@link OZCacheManager.setPMClearBitmapCache} — the same injection pattern the
 * landed PCSharedMutex port uses for `_pthread_self`.
 */
let _pmClearBitmapCache: () => void = () => {
  // no-op boundary: this port models no ProMedia bitmap cache.
};

/**
 * `OZCacheManager::inhibit(bool)` — @Ozone 0x38f2c0
 *   __ZN14OZCacheManager7inhibitEb
 *
 * Faithful transcription of the 7-instruction body:
 *
 *   0x38f2c0  pushq  %rbp
 *   0x38f2c1  movq   %rsp, %rbp
 *   0x38f2c4  xchgb  %sil, 0x18(%rdi)   ; atomic swap: new (%sil, from arg1)
 *                                       ;              old (%rdi+0x18 -> %sil)
 *   0x38f2c8  popq   %rbp
 *   0x38f2c9  retq                       ; return old byte in %sil (via %eax
 *                                       ; low-byte convention — u8 return)
 *   0x38f2ca  nopw   (%rax,%rax)         ; alignment
 *
 * The `xchgb` with a memory operand is IMPLICITLY LOCK-prefixed on x86; it
 * atomically writes the new value and returns the previous one. That is the
 * canonical C++11 `std::atomic<bool>::exchange(newVal, std::memory_order_seq_cst)`
 * pattern the compiler emits for `bool inhibit(bool v) { return flag_.exchange(v); }`.
 *
 * No calls out, no branches. Pure atomic-swap setter/getter combo.
 */
export class OZCacheManager {
  /** +0x18 — the inhibit flag byte. Swapped atomically by `inhibit(bool)`. */
  inhibitFlag: number = 0;

  /**
   * Atomically set the inhibit flag to `v` and return its previous value.
   * @0x38f2c0 __ZN14OZCacheManager7inhibitEb
   */
  inhibit(v: boolean): boolean {
    // @0x38f2c4 xchgb %sil, 0x18(%rdi)  — atomic swap of the byte at +0x18.
    // JavaScript is single-threaded; the sequential-consistency guarantee is
    // trivially satisfied. We still model the SWAP semantics (return old,
    // write new) so callers that read the return value stay correct.
    const oldVal = this.inhibitFlag !== 0;
    this.inhibitFlag = v ? 1 : 0;
    return oldVal;
  }

  /** +0x28 — uint32 slot; zeroed by clearImageCache (`xchgl` @0x38ee19).
   *  Meaning not decoded by any ported body; kept as a raw offset-named slot. */
  u32At28: number = 0;

  /** +0x30 — uint64 slot; zeroed by clearImageCache (`xchgq` @0x38ee1e).
   *  Meaning not decoded by any ported body; kept as a raw offset-named slot. */
  qwordAt30: bigint = 0n;

  /**
   * Inject the real `PMClearBitmapCache` (ProMedia.framework — out of this
   * port's scope; see the stub's docblock). Defaults to a no-op.
   */
  static setPMClearBitmapCache(fn: () => void): void {
    _pmClearBitmapCache = fn;
  }

  /**
   * `OZCacheManager::clearImageCache()` — @Ozone 0x38ee00
   *   __ZN14OZCacheManager15clearImageCacheEv
   *
   * Drops the image cache — unless Ozone is running HOSTED, in which case the
   * whole body is skipped.
   *
   * Full transcription — every instruction, in order (18-line disasm at
   * raw-port/re/disasm/__ZN14OZCacheManager15clearImageCacheEv.s):
   *
   *   0x38ee00  cmpb  $0x0, hosted(%rip)   ; (anon)::hosted == 0 ?
   *   0x38ee07  jne   0x38ee28             ;   hosted -> return immediately
   *   0x38ee09  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x38ee0a  movq  %rsp,%rbp            ; frame setup (no TS counterpart)
   *   0x38ee0d  pushq %rbx                 ; callee-saved (no TS counterpart)
   *   0x38ee0e  pushq %rax                 ; stack align (no TS counterpart)
   *   0x38ee0f  movq  %rdi,%rbx            ; rbx = this (survives the call)
   *   0x38ee12  callq <stub PMClearBitmapCache>
   *   0x38ee17  xorl  %eax,%eax
   *   0x38ee19  xchgl %eax,0x28(%rbx)      ; atomically this->u32At28 = 0
   *   0x38ee1c  xorl  %eax,%eax
   *   0x38ee1e  xchgq %rax,0x30(%rbx)      ; atomically this->qwordAt30 = 0
   *   0x38ee22  addq  $0x8,%rsp            ; frame teardown (no TS counterpart)
   *   0x38ee26  popq  %rbx                 ; frame teardown (no TS counterpart)
   *   0x38ee27  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x38ee28  retq                       ; shared exit for both paths
   *   0x38ee29  nopl  (%rax)               ; alignment padding, not executed
   *
   * Decode notes:
   *   * the guard is tested BEFORE the prologue and jumps straight to the
   *     shared `retq` — a hosted Ozone leaves both slots untouched and does not
   *     call ProMedia at all.
   *   * `xchg` with a memory operand is IMPLICITLY LOCK-prefixed on x86, so
   *     both clears are atomic publications (the same idiom the landed
   *     `inhibit(bool)` port documents for its `xchgb`). Their OLD values are
   *     discarded here — nothing reads %eax/%rax afterwards — so the port just
   *     assigns, in the machine's order: the 32-bit slot first, then the
   *     64-bit one.
   *   * widths are preserved: +0x28 is written by a 32-bit `xchgl` and +0x30 by
   *     a 64-bit `xchgq` (modelled as `number` and `bigint` respectively).
   *   * the ONE callee is a true out-of-scope extern (ProMedia.framework — a
   *     sixth framework); see the `_pmClearBitmapCache` docblock for why the
   *     default hook is a documented no-op rather than a throw. No in-scope
   *     call, no indirect and no virtual dispatch (`depgraph.py deps` lists
   *     nothing).
   */
  clearImageCache(): void {
    // @0x38ee00/@0x38ee07  cmpb $0x0,hosted(%rip) ; jne 0x38ee28
    if (hosted !== 0) {
      return;
    }

    // @0x38ee12  callq <stub 0x6dd158> PMClearBitmapCache()
    _pmClearBitmapCache();

    // @0x38ee17/@0x38ee19  xorl %eax,%eax ; xchgl %eax,0x28(%rbx)
    this.u32At28 = 0;

    // @0x38ee1c/@0x38ee1e  xorl %eax,%eax ; xchgq %rax,0x30(%rbx)
    this.qwordAt30 = 0n;
  }

}
