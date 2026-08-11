// HGCache — Helium's MD5-keyed bitmap cache. This commit ports its C1 constructor.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//            (x86_64 slice — every address below is an x86_64 offset)
// DECODE:    raw-port/re/disasm/Helium.__ZN7HGCacheC1Ev.s                (ported here)
//            raw-port/re/disasm/Helium.__ZN7HGCacheD2Ev.s                (read ONLY for the layout)
//            raw-port/re/disasm/Helium.__ZN7HGCache10ClearItemsEv.s      (read ONLY for the layout)
//            The last two are each their own ledger entry and are NOT ported here.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN7HGCacheC1Ev
//       — HGCache::HGCache() [C1, complete object] @Helium 0x8b960
//
// NOT ported here (separate ledger entries): C2 @0x8b920, D2 @0x8b9a0, D1 @0x8b9f0, D0 @0x8ba40,
// AddItem @0x8bab0, GetItem @0x8bc30, ClearItems @0x8bcc0. NOTE that C1 and C2 are DISTINCT
// addresses here — not ICF-folded — with byte-identical bodies (C2's `leaq 0x97e685(%rip)` from
// rip 0x8b92b reaches the same 0xa09fb0). Porting one does not port the other.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   pthread_mutex_init — libc extern (out of scope), reached by the tail `jmp` to the mach-o
//   symbol stub @Helium 0x3c5564. Modelled as a boundary stub below, per PORTING_SPEC Rule 3.
//   Nothing else: no in-scope callee, no virtual dispatch.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (only what this ctor writes, plus the two siblings that pin the meanings)
// -----------------------------------------------------------------------------
// HGCache {
//   +0x00  vptr        — set to `__ZTV7HGCache + 0x10`. The `leaq 0x97e645(%rip), %rax` @0x8b964
//                        has rip 0x8b96b after it, and 0x8b96b + 0x97e645 = @Helium 0xa09fb0;
//                        `nm` puts __ZTV7HGCache at 0xa09fa0, so this is the standard vptr —
//                        the vtable base plus the two words (offset-to-top, typeinfo).
//   +0x08  uint32      — `movl $0x0, 0x8(%rdi)` @0x8b96e. A 32-BIT store: +0x0c..+0x0f is NOT
//                        written by this ctor (the oracle below measures that).
//   +0x10  itemsHead   — head of a singly-linked list of cache nodes. Zeroed here as the low half
//                        of `movups %xmm0, 0x10(%rdi)` @0x8b97c. Pinned as a list head by the
//                        dtor @0x8b9b1, which loads +0x10 and walks `next = node[0x00]`
//                        (`movq (%rbx), %r14` @0x8b9c0) calling `operator delete` on each node,
//                        and by ClearItems @0x8bcda which walks the same chain.
//   +0x18  itemsTail?  — zeroed here as the high half of the same `movups`. ClearItems @0x8bce3
//                        restores the emptied head from it (`movq 0x18(%r14), %rax ; movq %rax,
//                        0x10(%r14)`), so it holds the value an EMPTY list's head takes — which
//                        the ctor makes 0 as well. Its precise role needs AddItem @0x8bab0
//                        (a separate ledger entry), so it is modelled as a nullable slot and NOT
//                        given a name that claims more than the decode shows.
//   +0x20  uint64      — `movq $0x0, 0x20(%rdi)` @0x8b980. Not read by any instruction decoded
//                        for this unit; zeroed and left opaque.
//   +0x28  pthread_mutex_t — `leaq 0x28(%rdi), %rax` @0x8b975 then the tail
//                        `pthread_mutex_init(&this->mutex, NULL)` @0x8b98e. Confirmed as the lock
//                        by ClearItems, which takes `leaq 0x28(%rdi), %rbx` and calls
//                        `_pthread_mutex_lock` @0x8bcd5 / `_pthread_mutex_unlock` @0x8bcf6 on it.
//                        64 bytes on x86_64 macOS, so the object is at least 0x68 bytes.
// }
//
// -----------------------------------------------------------------------------
// FULL DISASM — HGCache::HGCache() [C1] @0x8b960 (every instruction, in order)
// -----------------------------------------------------------------------------
//   0x8b960  pushq  %rbp                          ; frame prologue
//   0x8b961  movq   %rsp, %rbp
//   0x8b964  leaq   0x97e645(%rip), %rax          ; rax = 0x8b96b + 0x97e645 = 0xa09fb0
//                                                 ;     = __ZTV7HGCache (0xa09fa0) + 0x10
//   0x8b96b  movq   %rax, (%rdi)                  ; this->vptr = that
//   0x8b96e  movl   $0x0, 0x8(%rdi)               ; 32-bit zero at +0x08 (NOT 64-bit)
//   0x8b975  leaq   0x28(%rdi), %rax              ; rax = &this->mutex
//   0x8b979  xorps  %xmm0, %xmm0                  ; xmm0 = 0
//   0x8b97c  movups %xmm0, 0x10(%rdi)             ; 16 zero bytes at +0x10..+0x1f
//   0x8b980  movq   $0x0, 0x20(%rdi)              ; 8 zero bytes at +0x20
//   0x8b988  movq   %rax, %rdi                    ; arg0 = &this->mutex
//   0x8b98b  xorl   %esi, %esi                    ; arg1 = NULL (default attributes)
//   0x8b98d  popq   %rbp                          ; epilogue BEFORE the tail call
//   0x8b98e  jmp    0x3c5564 ## symbol stub for: _pthread_mutex_init
//   0x8b993  nopw   %cs:(%rax,%rax)               ; padding — not executed
//
// DECODE NOTES
//  - The `jmp` (not `callq`) is a tail call: `pthread_mutex_init`'s `int` return lands in %eax and
//    is simply what the ctor "returns". A C++ constructor has no return value, so nothing observes
//    it — but note the ctor does NOT check it, so a failed mutex init is silently ignored. The
//    port reproduces that (the boundary stub's result is discarded, deliberately, not swallowed by
//    a catch — G1 bans that).
//  - The zeroing is deliberately three different widths — `movl` (4), `movups` (16), `movq` (8) —
//    and the gap at +0x0c..+0x0f is NOT written. Modelling the +0x08 store as 64-bit would zero
//    four bytes the machine leaves alone; the oracle measures exactly that.

/**
 * The address of `__ZTV7HGCache + 0x10`, the value written to `this+0x00` by
 * `leaq 0x97e645(%rip), %rax` @Helium 0x8b964 / `movq %rax, (%rdi)` @0x8b96b. In TS the vtable is
 * JS class dispatch, so this is documentation of the identity the machine stamps into the object
 * rather than a value the port computes with — it is kept as a named constant so the ctor's first
 * instruction has a visible counterpart, and so a reviewer can check the arithmetic
 * (rip 0x8b96b + 0x97e645 = 0xa09fb0; `nm`: __ZTV7HGCache = 0xa09fa0).
 */
export const HGCACHE_VPTR_ADDR = 0xa09fb0; // @Helium 0xa09fb0 = __ZTV7HGCache + 0x10

/**
 * A node of the `this+0x10` list, as far as this unit's decode reaches: the dtor @0x8b9c0 reads
 * the NEXT pointer from the node's first qword and the object at node+0x28 (whose vtable slot
 * +0x18 it calls). The ctor only ever stores null into the head, so nothing more is modelled;
 * AddItem @0x8bab0 is the unit that will fill this in.
 */
export interface HGCacheNode {
  /** node+0x00 — the next node (`movq (%rbx), %r14` @0x8b9c0). */
  next: HGCacheNode | null;
}

/**
 * An opaque `pthread_mutex_t` living at `this+0x28`. Modelled as a marker object rather than a
 * byte array: nothing in the ported body inspects its contents, and inventing a libc-internal
 * layout would be the magic-offset guesswork PORTING_SPEC Rule 5 forbids.
 */
export interface HGCacheMutex {
  /** True once `pthread_mutex_init` @Helium 0x3c5564 has run on it. */
  initialized: boolean;
}

/**
 * libc `int pthread_mutex_init(pthread_mutex_t *m, const pthread_mutexattr_t *attr)` — reached by
 * the tail `jmp` to the mach-o symbol stub @Helium 0x3c5564 (call site: @0x8b98e in the ctor).
 * Out-of-scope extern (PORTING_SPEC Rule 3 / DEP_WORKER_BRIEF's "only legitimate throw" list), so
 * it is a boundary stub: it records that the lock was initialised with DEFAULT attributes (the
 * `xorl %esi, %esi` @0x8b98b passes NULL) and returns libc's success code, which the caller
 * discards exactly as the machine does.
 */
function _pthread_mutex_init(m: HGCacheMutex, attr: null): number {
  // @Helium 0x3c5564 (symbol stub for: _pthread_mutex_init) — libc extern.
  void attr; // NULL at this call site: default attributes.
  m.initialized = true;
  return 0;
}

/**
 * `HGCache` — Helium's MD5-keyed bitmap cache. This file holds the symbol listed under "Symbols
 * ported here" in the file header; every other method is a separate ledger entry and will be
 * ADDED here (additive extension only). Only the offsets the ported body touches are modelled.
 */
export class HGCache {
  /** @Helium HGCache@0x08 — the u32 zeroed by `movl $0x0, 0x8(%rdi)` @0x8b96e. Its meaning needs
   *  AddItem/GetItem (separate ledger entries); it is a 32-bit slot and the ctor sets it to 0. */
  countAt0x08 = 0; // @Helium HGCache@0x08

  /** @Helium HGCache@0x10 — head of the cache's singly-linked node list (walked by the dtor
   *  @0x8b9b1 and ClearItems @0x8bcda). Zeroed by the low half of `movups %xmm0, 0x10(%rdi)`
   *  @0x8b97c. */
  itemsHead: HGCacheNode | null = null; // @Helium HGCache@0x10

  /** @Helium HGCache@0x18 — the slot ClearItems @0x8bce3 copies back into +0x10 when it empties
   *  the list. Zeroed by the high half of the same `movups` @0x8b97c. Left deliberately unnamed
   *  beyond its offset: the decode for THIS unit does not establish more. */
  slotAt0x18: HGCacheNode | null = null; // @Helium HGCache@0x18

  /** @Helium HGCache@0x20 — the qword zeroed by `movq $0x0, 0x20(%rdi)` @0x8b980. Not read by any
   *  instruction decoded for this unit. */
  slotAt0x20: unknown | null = null; // @Helium HGCache@0x20

  /** @Helium HGCache@0x28 — the pthread mutex this ctor initialises and that ClearItems
   *  locks/unlocks (@0x8bcd5 / @0x8bcf6). */
  mutex: HGCacheMutex = { initialized: false }; // @Helium HGCache@0x28

  /**
   * `HGCache::HGCache()` [C1, complete object] @Helium 0x8b960 (__ZN7HGCacheC1Ev).
   *
   * Full transcription of the 11-instruction body (see the FULL DISASM block in the file header).
   * Stamps the vptr, zeroes +0x08 (32 bits), +0x10..+0x1f (16 bytes) and +0x20 (8 bytes), and
   * tail-calls `pthread_mutex_init(&this->mutex, NULL)`.
   *
   * DIFFERENTIAL against the live binary (exported: `000000000008b960 T __ZN7HGCacheC1Ev` in
   * raw-port/army/inventory/Helium.syms.txt, so dlsym reaches it; run under
   * `arch -x86_64 /usr/bin/python3` because every cited address is an x86_64 offset and the arm64
   * slice is a different function, per OPS_LOG):
   * raw-port/re/oracle/HGCache_C1_oracle.py runs the REAL ctor on a 0x100-byte object poisoned
   * with 0xEE and then reads the object back byte by byte. What it measures, and what this port
   * therefore asserts:
   *   * +0x00..+0x07 hold 0xa09fb0 + the image slide, i.e. `__ZTV7HGCache + 0x10` — the vptr
   *     arithmetic above, confirmed against the loaded image rather than computed on paper;
   *   * +0x08..+0x0b are zero, and +0x0c..+0x0f are STILL 0xEE — the `movl` really is a 32-bit
   *     store, so a 64-bit model of that field would be wrong about four bytes;
   *   * +0x10..+0x27 are zero (the `movups` plus the `movq`);
   *   * +0x28..+0x67 match a `pthread_mutex_t` that libc's own `pthread_mutex_init(&m, NULL)`
   *     produced in this same process: 56 of the 64 bytes are byte-identical, and the qword at
   *     +48 of the mutex is a SELF-RELATIVE pointer whose `value + &mutex` is -1 — which resolves
   *     to -1 only when &mutex is exactly `object + 0x28`, so it pins the lock's OFFSET, not just
   *     its presence;
   *   * +0x68..+0xff are still 0xEE — nothing else in the object is touched.
   * See the commit message for the recorded run.
   */
  constructor() {
    // ------------------------------------------------------------
    // @0x8b960..0x8b961 — prologue (no TS-visible effect).
    // @0x8b964/@0x8b96b — leaq/movq: this->vptr = __ZTV7HGCache + 0x10 (HGCACHE_VPTR_ADDR). In TS
    //   the object's class IS its vtable, so `new HGCache()` is that store; the constant above
    //   records the address the machine writes.
    // @0x8b96e — movl $0x0, 0x8(%rdi): 32-bit zero. The four bytes at +0x0c..+0x0f are NOT
    //   written (measured — see the oracle note above).
    // ------------------------------------------------------------
    this.countAt0x08 = 0;

    // ------------------------------------------------------------
    // @0x8b979/@0x8b97c — xorps + movups: 16 zero bytes over +0x10..+0x1f, i.e. BOTH list slots.
    // @0x8b980 — movq $0x0, 0x20(%rdi): 8 more zero bytes at +0x20.
    // ------------------------------------------------------------
    this.itemsHead = null;
    this.slotAt0x18 = null;
    this.slotAt0x20 = null;

    // ------------------------------------------------------------
    // @0x8b975 — leaq 0x28(%rdi), %rax : the mutex address, computed before the zeroing.
    // @0x8b988/@0x8b98b — arg0 = &this->mutex, arg1 = NULL.
    // @0x8b98d/@0x8b98e — popq %rbp then `jmp` the stub: a TAIL call, so pthread_mutex_init's int
    //   result is what the ctor leaves in %eax. The machine never inspects it — a failed init is
    //   silently ignored — so the port discards it too rather than inventing error handling.
    // ------------------------------------------------------------
    _pthread_mutex_init(this.mutex, null);
  }
}
