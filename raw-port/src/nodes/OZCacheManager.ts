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
}
