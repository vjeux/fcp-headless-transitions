// std::default_delete<std::vector<uint8_t>>::operator()(vector*) — libc++ deleter
// @ProCore /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Mangled: __ZNKSt3__114default_deleteINS_6vectorIhNS_9allocatorIhEEEEEclB9nqe210106EPS4_
// Demangled:
//   std::__1::default_delete<std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>>
//     ::operator()[abi:nqe210106](std::__1::vector<unsigned char, ...>*) const
//
// This is `unique_ptr<vector<uint8_t>>::reset(nullptr)`'s deleter — the compiler INLINED
// the vector destructor into the deleter body. The result is 4 things in order:
//   (1) null-check the incoming `vector<uint8_t>* p`; if null, return.
//   (2) Inline vector<uint8_t>::~vector():
//         a. load __begin_ (offset 0x00 of vector); if non-null:
//         b. write __begin_ back into __end_ (offset 0x08) — this is libc++'s
//            "destroy elements" step, which for trivially-destructible T (=uint8_t) is
//            just __end_ = __begin_ (no destructor calls).
//         c. call operator delete(__begin_) — free the heap buffer.
//         (When __begin_ == nullptr, steps b+c are skipped; nothing to free.)
//         Note: __end_cap_ (offset 0x10) is deliberately NOT cleared — the object is
//         about to be freed, and libc++ knows the observer can't see it again.
//   (3) tail-call operator delete(p) — free the vector object itself.
//
// DECODE: raw-port/re/disasm/ProCore.__ZNKSt3__114default_deleteINS_6vectorIhNS_9allocatorIhEEEEEclB9nqe210106EPS4_.s
//
//   00a9c88  testq  %rsi, %rsi              ;; if (p == nullptr)
//   00a9c8b  je     0xa9cb5                 ;;   return
//   00a9c8d..00a9c92  prologue (push rbp; mov rsp->rbp; push rbx; push rax [align])
//   00a9c93  movq   %rsi, %rbx              ;; rbx = p    (saved across delete)
//   00a9c96  movq   (%rsi), %rdi            ;; rdi = p->__begin_          (vec+0x00)
//   00a9c99  testq  %rdi, %rdi              ;; if (__begin_ == nullptr)
//   00a9c9c  je     0xa9ca7                 ;;   skip buffer free
//   00a9c9e  movq   %rdi, 0x8(%rbx)         ;; p->__end_ = p->__begin_     (vec+0x08)
//                                              (trivially-destructible T: no dtor calls,
//                                               end = begin marks "no elements")
//   00a9ca2  callq  __ZdlPv                 ;; operator delete(__begin_)   — free buffer
//   00a9ca7  movq   %rbx, %rdi              ;; rdi = p
//   00a9caa..00a9caf  epilogue (add $0x8,rsp; pop rbx; pop rbp)
//   00a9cb0  jmp    __ZdlPv                 ;; tail-call operator delete(p) — free vector
//   00a9cb5  retq                           ;; null-input fast path
//
// FRONTIER CALLEES:
//   @ProCore 0x0a9ca2 / 0x0a9cb0  __ZdlPv  = operator delete(void*)
//     libc++ ABI extern (out-of-scope). Modelled as a throwing stub.
//
// vector<uint8_t> LAYOUT (libc++, verified against the offsets read/written here):
//   +0x00  __begin_   uint8_t*
//   +0x08  __end_     uint8_t*
//   +0x10  __end_cap_ uint8_t* (untouched here)
// The same layout is documented in raw-port/src/infra/PCICCTag.ts, whose PCVectorUint8
// interface we import — same T, same libc++ instantiation, same in-memory shape.

import type { PCVectorUint8 } from './PCICCTag.js';

/**
 * @ProCore 0x0a9ca2 / 0x0a9cb0  __ZdlPv (operator delete(void*)) — libc++ ABI.
 * Out-of-scope extern. In the FCP binary this frees the pointed-to allocation via the
 * global allocator. JS has no manual heap free, so this is a throwing stub for
 * faithfulness — callers of the deleter shouldn't observe the freed storage anyway.
 */
function operator_delete_stub(_p: unknown): void {
  throw new Error(
    "__ZdlPv @ProCore 0x0a9ca2/0x0a9cb0 (operator delete(void*)) is not yet ported (libc++ extern).",
  );
}

/**
 * std::default_delete<std::vector<uint8_t>>::operator()(vector<uint8_t>* p) const
 *
 * @ProCore 0x0a9c88
 *
 * Line-for-line transcription of the 19-instruction body. Deletes a heap-allocated
 * `std::vector<uint8_t>*` — first destroying the vector's element buffer (if any),
 * then deleting the vector object itself. Semantics preserved:
 *
 *   - p == nullptr           -> no-op.
 *   - p->__begin_ == nullptr -> skip buffer free; delete vector object.
 *   - p->__begin_ != nullptr -> set p->__end_ = p->__begin_ (trivial dtor for uint8_t),
 *                                free the buffer, delete the vector object.
 *
 * In TS we can't literally `delete this`, so `operator_delete_stub` stands in for the
 * two `__ZdlPv` calls; the observable mutation (p->__end_ = p->__begin_) is applied
 * before the buffer free just as the machine does.
 */
export function default_delete_vector_uint8_op_call(
  p: PCVectorUint8 | null,
): void {
  // @ProCore 0x0a9c88  testq %rsi, %rsi
  // @ProCore 0x0a9c8b  je 0xa9cb5              ;; null input -> return
  if (p === null) {
    return;
  }

  // @ProCore 0x0a9c96  movq (%rsi), %rdi       ;; load p->__begin_
  // @ProCore 0x0a9c99  testq %rdi, %rdi
  // @ProCore 0x0a9c9c  je 0xa9ca7              ;; __begin_ null -> skip buffer free
  //
  // In our model, `storage` + `begin` together are the "buffer pointer". A null
  // __begin_ in C++ maps to storage.length === 0 (or begin === end === endcap === 0);
  // both conditions imply there is no heap buffer to free.
  const hasBuffer = p.storage.length > 0;

  if (hasBuffer) {
    // @ProCore 0x0a9c9e  movq %rdi, 0x8(%rbx)  ;; p->__end_ = p->__begin_
    //                                             (destroy trivially-destructible elements
    //                                              by setting end = begin — no dtor calls)
    p.end = p.begin;

    // @ProCore 0x0a9ca2  callq __ZdlPv         ;; operator delete(p->__begin_)
    //                                             — free the element buffer
    operator_delete_stub(p.storage);
  }

  // @ProCore 0x0a9ca7  movq %rbx, %rdi
  // @ProCore 0x0a9cb0  jmp __ZdlPv             ;; tail-call operator delete(p)
  //                                             — free the vector object itself
  operator_delete_stub(p);
}
