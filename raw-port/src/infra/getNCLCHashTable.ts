// getNCLCHashTable.ts — internal-linkage helper in ProCore.framework that
// returns the process-wide singleton NCLC-code → CGColorSpace hash table.
//
// FRAMEWORK: ProCore.framework
// DECODE: raw-port/re/disasm/ProCore.__ZL16getNCLCHashTablev.s
// SYMBOL: __ZL16getNCLCHashTablev  @ProCore 0x9926e  ("L" = internal linkage)
//
// TYPE (recovered from the call-site @ProCore 0x9894c-0x98965):
//   std::__1::unordered_map<
//       CGColorSpace*,                     // key
//       PCNCLCCode,                        // value
//       (anonymous namespace)::Hash,       // hash functor
//       (anonymous namespace)::Equal,      // key-equal functor
//       std::__1::allocator<std::__1::pair<CGColorSpace* const, PCNCLCCode>>
//   > *
//
// SEMANTICS (raw disasm — Itanium __cxa_guard-guarded function-local static):
//   static unordered_map<...>* result = new unordered_map<...>();
//   return result;
//
// The allocation `new unordered_map<...>()` is `operator new(0x28)` = 40 bytes,
// which is the exact size of libc++'s __hash_table root:
//     +0x00  __bucket_list_.__ptr_ = nullptr    (movups xmm0, (%rax))
//     +0x08  __bucket_list_.__deleter (bucket-count = 0, allocator empty)
//     +0x10  __p1_ (before-begin node, ptr = nullptr) (movups xmm0, 0x10(%rax))
//     +0x18  __p2_ (size_ = 0)
//     +0x20  __p3_.max_load_factor_ = 1.0f       (movl $0x3f800000, 0x20(%rax))
//     +0x24  4 bytes padding
//
// Only max_load_factor_ is nonzero; libc++ guarantees the rest is zero-init
// on an empty container.
//
// PORT STRATEGY (matches raw-port/src/render/HGACEScct_Decode.ts precedent):
// The __cxa_guard_acquire/release pattern is a compiler-emitted thread-safe
// first-write scheme for function-local statics. In single-threaded JS we
// initialize the module-scope handle eagerly at first import; the observable
// result — every caller receives the SAME map instance — is identical.
//
// This file EXPORTS the shared instance itself (not just an accessor) because
// the four call-sites in ProCore all treat the returned pointer as the
// operand of `unordered_map::operator[]` — i.e. mutable indexed access.
// See @ProCore 0x98965 / 0x98b0d / 0x98e85 / 0x99f04.

/** NCLC-code hash table entry value. Recovered as `PCNCLCCode` from the
 *  callsite typedef in the ProCore symbol map (`__ZN10PCNCLCCode...` family,
 *  see /tmp/ProCore_symmap.tsv). Full layout is a frontier symbol — the
 *  hash-table itself does not observe the value shape, only its position at
 *  +0x8 of the pair (from `movl %ecx, 0x8(%rax)` at @ProCore 0x98970). */
export interface PCNCLCCode {
  // Frontier — not yet transcribed. The port stores whatever the caller
  // hands it; we don't index into these bytes here.
  [k: string]: unknown;
}

/** Opaque `CGColorSpace*` key — modelled as the same nominal handle used by
 *  the rest of the port for CoreGraphics color spaces. */
export type CGColorSpaceKey = unknown;

/**
 * Faithful model of libc++ `unordered_map<CGColorSpace*, PCNCLCCode, Hash, Equal>`.
 *
 * The four ProCore callers only invoke `operator[]` (insert-if-absent + write
 * the value's uint32 field at +0x8 — see @0x98965..0x98970 in the decode
 * dump).  A Map<CGColorSpace*, PCNCLCCode> reproduces that observable
 * behavior bit-for-bit: same identity for repeat lookups of the same
 * CGColorSpace*, and it grows on demand.
 *
 * Hash/Equal are functors in the ProCore anonymous namespace that specialize
 * on CGColorSpaceRef identity — for our purposes JS Map's `===` on the key
 * matches the intent (CGColorSpace* addresses are compared by pointer in
 * libc++'s default hash-of-pointer strategy after the Hash functor extracts
 * the underlying void*).
 */
export type NCLCHashTable = Map<CGColorSpaceKey, PCNCLCCode>;

/**
 * The process-wide NCLC hash table.
 *
 * Direct transcription of the raw x86_64 body (7-instruction hot path once
 * the guard is set; 15-instruction slow path on first call):
 *
 *   ; ── hot path (guard already released) ───────────────────────────────
 *   0x9926e  push rbp / mov rsp,rbp / push rbx / push rax (align)
 *   0x99274  movb [guard], %al                 ; guard is a byte
 *   0x9927a  testb %al,%al
 *   0x9927c  je    0x9928c                     ; first-time: go allocate
 *   0x9927e  movq [result], %rax               ; already-initialised: load ptr
 *   0x99285/89/8a/8b  epilogue + ret
 *
 *   ; ── slow path (first call) ──────────────────────────────────────────
 *   0x9928c  leaq [guard], %rdi
 *   0x99293  callq __cxa_guard_acquire
 *   0x99298  testl %eax,%eax
 *   0x9929a  je   0x9927e                      ; race lost: another thread did it
 *   0x9929c  movl $0x28, %edi                  ; 40 bytes = sizeof(unordered_map root)
 *   0x992a1  callq operator new(unsigned long)
 *   0x992a6  xorps %xmm0,%xmm0
 *   0x992a9  movups %xmm0, 0x10(%rax)          ; zero bytes 16..31
 *   0x992ad  movups %xmm0, (%rax)              ;      "       0..15
 *   0x992b0  movl $0x3f800000, 0x20(%rax)      ; max_load_factor = 1.0f
 *   0x992b7  movq %rax, [result]               ; publish
 *   0x992be  leaq [guard], %rdi
 *   0x992c5  callq __cxa_guard_release
 *   0x992ca  jmp   0x9927e                     ; fall into hot-path ret
 *
 * @0xADDR ProCore 0x9926e (raw-port/re/disasm/ProCore.__ZL16getNCLCHashTablev.s)
 */
const _NCLC_HASH_TABLE: NCLCHashTable = (() => {
  // operator new(0x28) — allocate a fresh libc++ __hash_table root.
  // JS Map is our faithful stand-in for that empty container:
  //   - size_ = 0                     (like the movups xmm0,(%rax) at 0x992ad)
  //   - buckets = ø, before-begin = ø (like movups xmm0,0x10(%rax) at 0x992a9)
  //   - max_load_factor = 1.0f        (like movl $0x3f800000,0x20(%rax) at 0x992b0)
  //
  // @0xADDR ProCore 0x992b0 — the ONE non-zero constant (float32 1.0) is
  // implicit here: libc++ maps load-factor 1.0 to "grow when size == bucket_count",
  // which is JS Map's default insertion behaviour (unbounded).
  return new Map<CGColorSpaceKey, PCNCLCCode>();
})();

/**
 * @0xADDR ProCore 0x9926e — `getNCLCHashTable()` (internal-linkage in ProCore).
 * Returns the singleton NCLC-code → CGColorSpace hash table.
 *
 * The four ProCore callers ALL use the return value as `operator[]` on an
 * unordered_map<CGColorSpace*, PCNCLCCode, Hash, Equal> — so this function
 * hands back the same shared instance every time it's called.
 */
export function getNCLCHashTable(): NCLCHashTable {
  // @ProCore 0x9927e  movq [result], %rax; ret
  return _NCLC_HASH_TABLE;
}
