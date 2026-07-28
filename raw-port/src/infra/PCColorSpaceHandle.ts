/**
 * PCColorSpaceHandle — thin C++ wrapper around a CGColorSpace*, one pointer-sized
 * field, RAII-released in its destructor via PCCFRefTraits<CGColorSpace*>::release.
 *
 * Ledger @Flexo:
 *   ~PCColorSpaceHandle @0x601fc0  __ZN18PCColorSpaceHandleD1Ev
 *
 * Decoded from disasm ~PCColorSpaceHandle @Flexo 0x601fc0:
 *
 *   0x601fc0  pushq %rbp
 *   0x601fc4  movq  (%rdi), %rdi              ; load field +0x00 (the CGColorSpace* handle)
 *   0x601fc7  testq %rdi, %rdi                ; if null, skip release
 *   0x601fca  je    0x601fd1
 *   0x601fcc  callq __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
 *                                             ; PCCFRefTraits<CGColorSpace*>::release(cs)
 *                                             ; which tail-jmps to _CGColorSpaceRelease
 *                                             ; (verified via ProCore @0x000acbf2)
 *   0x601fd1  popq  %rbp
 *   0x601fd2  retq
 *   0x601fd3  movq  %rax, %rdi                ; landing pad
 *   0x601fd6  callq ___clang_call_terminate
 *
 * Layout recovered:
 *   +0x00  CGColorSpace* handle       (only field observed; sizeof == 8)
 *
 * NOTE: no ctor/copy/assign was emitted by the compiler into Flexo (inlined at call sites
 * or ICF-folded elsewhere). Only D1 (complete-object destructor) is present at 0x601fc0.
 * We provide the destructor faithfully; anything beyond that single decoded body is left
 * as a throw-stub so it fails loud.
 */

import type { CGColorSpaceRef } from "./PCColor";

/**
 * PCCFRefTraits<CGColorSpace*>::release(CGColorSpace* cs)  @ProCore 0x000acbf2
 *   __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
 *   pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp _CGColorSpaceRelease   (stub @0xde1e6)
 *
 * Simple tail-jmp thunk to CFRelease-family primitive. JS side has no CoreFoundation
 * lifecycle so the release is a no-op on the handle; we still centralise it here so the
 * call-site @0x601fcc reads exactly like the binary.
 */
export function PCCFRefTraits_CGColorSpace_release(cs: CGColorSpaceRef | null): void {
  // @ProCore 0x000acbf2 -> _CGColorSpaceRelease @stub 0xde1e6
  // No-op in JS: CoreFoundation retain/release does not exist here.
  void cs;
}

export class PCColorSpaceHandle {
  /**
   * +0x00  CGColorSpace* (the sole field; recovered from `movq (%rdi), %rdi` at 0x601fc4
   * followed by null-check + release).
   */
  public handle: CGColorSpaceRef | null;

  constructor(handle: CGColorSpaceRef | null = null) {
    // No ctor symbol emitted in Flexo (inlined). The struct is a single pointer field,
    // so a faithful default+set is the only initialisation path visible in the binary.
    this.handle = handle;
  }

  /**
   * ~PCColorSpaceHandle()  @Flexo 0x00601fc0  __ZN18PCColorSpaceHandleD1Ev
   * Reads +0x00; if non-null, calls PCCFRefTraits<CGColorSpace*>::release(handle).
   */
  public destroy(): void {
    // @0x601fc4  movq (%rdi), %rdi
    const cs = this.handle;
    // @0x601fc7  testq %rdi, %rdi   /   je 0x601fd1
    if (cs !== null) {
      // @0x601fcc  callq PCCFRefTraits<CGColorSpace*>::release
      PCCFRefTraits_CGColorSpace_release(cs);
    }
    this.handle = null;
  }
}
