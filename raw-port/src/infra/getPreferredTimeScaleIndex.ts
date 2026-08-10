// getPreferredTimeScaleIndex.ts — internal-linkage helper in ProCore.framework
// that returns the process-wide `std::ios_base::xalloc()` index used to stash a
// "preferred time scale" in an iostream's custom pword/iword storage.
//
// FRAMEWORK: ProCore.framework
// DECODE: raw-port/re/disasm/ProCore.__ZL26getPreferredTimeScaleIndexv.s
// SYMBOL: __ZL26getPreferredTimeScaleIndexv  @ProCore 0x5e010  ("L" = internal linkage)
//
// TYPE: int  (the return is `%eax`, a 32-bit int loaded from the static `index`).
//
// SEMANTICS (raw disasm — Itanium __cxa_guard-guarded function-local static):
//   static int index = std::ios_base::xalloc();
//   return index;
//
// `std::ios_base::xalloc()` (libc++ `__ZNSt3__18ios_base6xallocEv`) hands out a
// fresh, process-unique integer each time it is called; the compiler-emitted
// function-local static caches the FIRST result so every caller of
// getPreferredTimeScaleIndex() observes the SAME index (the whole point — it's
// the key into ios_base::iword/pword custom storage for the preferred time
// scale). It is a TRUE OUT-OF-SCOPE EXTERN: libc++ iostream machinery, not an
// in-scope ProCore/ProChannel/Helium/Ozone symbol. Its imported stub is at
// @0xde696 (`callq 0xde696 ## symbol stub for: __ZNSt3__18ios_base6xallocEv`).
//
// PORT STRATEGY:
// The __cxa_guard_acquire/release pattern is a compiler-emitted thread-safe
// first-write scheme for a function-local static: the initializer runs on the
// FIRST CALL (not at load), then every subsequent call returns the cached int.
// We reproduce that exactly with a lazy module-scope cache that is populated on
// the first call via the extern-stub initializer. In single-threaded JS the
// guard is trivially satisfied (no race), matching the observable behaviour of
// the guarded machine code: one initialization, one shared index.

/**
 * `std::ios_base::xalloc()` — libc++ iostream custom-storage index allocator.
 *
 * TRUE OUT-OF-SCOPE EXTERN (libc++ / STL). Called via ProCore's imported stub
 * at @0xde696 from getPreferredTimeScaleIndex() @0x5e03d. Returns a fresh,
 * process-unique `int` on each call; the caller caches the first result.
 *
 * Not transcribed — it is STL runtime, outside the FCP frameworks in scope.
 * (Its internal state is a single atomic counter in the C++ standard library.)
 */
function ios_base_xalloc(): number {
  throw new Error(
    "std::ios_base::xalloc() @0xde696 (imported stub; libc++ __ZNSt3__18ios_base6xallocEv) " +
      "not transcribed — TRUE out-of-scope extern (STL iostream custom-storage index allocator)"
  );
}

/**
 * Function-local static `index` for getPreferredTimeScaleIndex(), plus its
 * Itanium guard byte. `null` guard state = uninitialised (guard byte 0 at
 * @0x5e016); a set guard holds the cached `int`.
 *
 * @0xADDR ProCore 0x5e010 statics:
 *   guard = __ZGVZL26getPreferredTimeScaleIndexvE5index
 *   index = __ZZL26getPreferredTimeScaleIndexvE5index
 */
let _index_guard = false; // __ZGVZ...E5index  (byte at @0x5e016)
let _index_value = 0; // __ZZ...E5index    (int  at @0x5e020/@0x5e042)

/**
 * @0xADDR ProCore 0x5e010 — `getPreferredTimeScaleIndex()` (internal-linkage in ProCore).
 *
 * Returns the cached `std::ios_base::xalloc()` index that ProCore uses as the
 * iword/pword slot key for the "preferred time scale" stored on an iostream.
 *
 * Direct transcription of the raw x86_64 body (function-local static):
 *
 *   ; ── hot path (guard already set) ────────────────────────────────────
 *   0x5e010  push rbp / mov rsp,rbp / push rbx / push rax (align)
 *   0x5e016  movb [guard], %al                 ; guard is a byte
 *   0x5e01c  testb %al,%al
 *   0x5e01e  je   0x5e02d                       ; first-time: go initialise
 *   0x5e020  movl [index], %eax                 ; already-initialised: load int
 *   0x5e026/2a/2b/2c  epilogue + ret
 *
 *   ; ── slow path (first call) ──────────────────────────────────────────
 *   0x5e02d  leaq [guard], %rdi
 *   0x5e034  callq __cxa_guard_acquire
 *   0x5e039  testl %eax,%eax
 *   0x5e03b  je   0x5e020                        ; race lost: another thread did it
 *   0x5e03d  callq __ZNSt3__18ios_base6xallocEv  ; index = std::ios_base::xalloc()
 *   0x5e042  movl %eax, [index]                  ; publish the returned int
 *   0x5e048  leaq [guard], %rdi
 *   0x5e04f  callq __cxa_guard_release
 *   0x5e054  jmp   0x5e020                        ; fall into hot-path ret
 *   ; (0x5e056.. is the __cxa_guard_abort/_Unwind_Resume cleanup landing pad
 *   ;  for an exception thrown by xalloc — reproduced by the throw propagating
 *   ;  out with the guard left unset, so a retry re-attempts init.)
 */
export function getPreferredTimeScaleIndex(): number {
  // @0x5e016 movb [guard],%al ; @0x5e01c testb ; @0x5e01e je (init if guard==0)
  if (!_index_guard) {
    // @0x5e034 __cxa_guard_acquire — single-threaded JS always "wins" the race.
    // @0x5e03d callq std::ios_base::xalloc() — the sole one-time initializer.
    //   If it throws (extern not landed), the guard stays unset (matching the
    //   __cxa_guard_abort landing pad @0x5e056), so a later call retries init.
    const v = ios_base_xalloc();
    // @0x5e042 movl %eax,[index]
    _index_value = v | 0; // 32-bit int store
    // @0x5e04f __cxa_guard_release — publish the initialised guard.
    _index_guard = true;
  }
  // @0x5e020 movl [index],%eax ; ret — return the cached int.
  return _index_value;
}
