// getColorSpaceList.ts — internal-linkage helper in ProCore.framework that
// returns the process-wide singleton retained-CGColorSpace vector.
//
// FRAMEWORK: ProCore.framework
// DECODE: raw-port/re/disasm/ProCore.__ZL17getColorSpaceListv.s
// SYMBOL: __ZL17getColorSpaceListv  @ProCore 0x99697  ("L" = internal linkage)
//
// TYPE (recovered from the call-site @ProCore 0x99eff):
//   std::__1::vector<
//       PCCFRef<CGColorSpace*>,
//       std::__1::allocator<PCCFRef<CGColorSpace*>>
//   > *
//
// SEMANTICS (raw disasm — Itanium __cxa_guard-guarded function-local static):
//   static vector<PCCFRef<CGColorSpace*>>* result = new vector<...>();
//   return result;
//
// The allocation is `operator new(0x18)` = 24 bytes, which is the exact size
// of libc++'s `std::vector` root:
//     +0x00  __begin_   = nullptr     (movups xmm0, (%rax))
//     +0x08  __end_     = nullptr     (movups xmm0, (%rax) — same 16-byte store)
//     +0x10  __end_cap_ = nullptr     (movq $0, 0x10(%rax))
//
// The three call-sites use the returned pointer as:
//   @0x9859d  read (binary_search-style probing loop for a matching key)
//   @0x98ea4  read
//   @0x99eff  `vector::push_back(PCCFRef<CGColorSpace*> const&)`
//
// PORT STRATEGY (matches raw-port/src/render/HGACEScct_Decode.ts precedent):
// The __cxa_guard_acquire/release pattern is a compiler-emitted thread-safe
// first-write scheme for function-local statics. In single-threaded JS we
// initialize the module-scope handle eagerly at first import; the observable
// result — every caller receives the SAME vector instance — is identical.
//
// This file EXPORTS the shared instance (not just an accessor) because the
// call-sites treat the returned pointer as a mutable container reference.

/** `PCCFRef<CGColorSpace*>` — retained-CGColorSpace RAII wrapper.
 *  Full layout is a frontier symbol (see /tmp/ProCore_symmap.tsv for the
 *  __ZN7PCCFRef... family). The vector only stores these opaquely; nothing
 *  in this file indexes into a PCCFRef's bytes. */
export type PCCFRef_CGColorSpace = unknown;

/**
 * Faithful model of libc++ `vector<PCCFRef<CGColorSpace*>>`.
 *
 * The observable operations at the three call-sites are: iteration (0x9859d,
 * 0x98ea4) and push_back (0x99eff). A JS Array of the same element type
 * reproduces both bit-for-bit.
 */
export type ColorSpaceList = PCCFRef_CGColorSpace[];

/**
 * The process-wide color-space list singleton.
 *
 * Direct transcription of the raw x86_64 body (7-instruction hot path once
 * the guard is set; 12-instruction slow path on first call):
 *
 *   ; ── hot path (guard already released) ───────────────────────────────
 *   0x99697  push rbp / mov rsp,rbp / push rbx / push rax (align)
 *   0x9969d  movb [guard], %al                 ; guard is a byte
 *   0x996a3  testb %al,%al
 *   0x996a5  je    0x996b5                     ; first-time: go allocate
 *   0x996a7  movq [result], %rax               ; already-initialised: load ptr
 *   0x996ae/b2/b3/b4  epilogue + ret
 *
 *   ; ── slow path (first call) ──────────────────────────────────────────
 *   0x996b5  leaq [guard], %rdi
 *   0x996bc  callq __cxa_guard_acquire
 *   0x996c1  testl %eax,%eax
 *   0x996c3  je   0x996a7                      ; race lost: another thread did it
 *   0x996c5  movl $0x18, %edi                  ; 24 bytes = sizeof(std::vector root)
 *   0x996ca  callq operator new(unsigned long)
 *   0x996cf  xorps %xmm0,%xmm0
 *   0x996d2  movups %xmm0, (%rax)              ; zero bytes 0..15  (__begin_, __end_)
 *   0x996d5  movq $0x0, 0x10(%rax)             ; zero bytes 16..23 (__end_cap_)
 *   0x996dd  movq %rax, [result]               ; publish
 *   0x996e4  leaq [guard], %rdi
 *   0x996eb  callq __cxa_guard_release
 *   0x996f0  jmp   0x996a7                     ; fall into hot-path ret
 *
 * @0xADDR ProCore 0x99697 (raw-port/re/disasm/ProCore.__ZL17getColorSpaceListv.s)
 */
const _COLOR_SPACE_LIST: ColorSpaceList = (() => {
  // operator new(0x18) — allocate a fresh libc++ vector root.
  // JS Array is our faithful stand-in for the empty container:
  //   - __begin_/__end_ = null       (like movups xmm0,(%rax) at 0x996d2)
  //   - __end_cap_      = null       (like movq $0x0,0x10(%rax) at 0x996d5)
  // All three fields are zero on an empty libc++ vector — matches [].length === 0.
  return [] as ColorSpaceList;
})();

/**
 * @0xADDR ProCore 0x99697 — `getColorSpaceList()` (internal-linkage in ProCore).
 * Returns the singleton `std::vector<PCCFRef<CGColorSpace*>>*` that ProCore
 * uses to retain every CGColorSpace it has cached during NCLC resolution.
 *
 * Call-sites: @0x9859d (probe/iterate), @0x98ea4 (probe/iterate),
 * @0x99eff (push_back of a freshly-constructed PCCFRef).
 */
export function getColorSpaceList(): ColorSpaceList {
  // @ProCore 0x996a7  movq [result], %rax; ret
  return _COLOR_SPACE_LIST;
}
