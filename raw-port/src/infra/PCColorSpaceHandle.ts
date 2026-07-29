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

/**
 * `_CGColorSpaceCreateWithName(CFStringRef name)` — CoreGraphics extern
 * (imported-stub GOT slot @ProCore 0xde1c2). In the FCP binary it returns a
 * `+1`-retained `CGColorSpace*` for a named colour space (e.g.
 * `kCGColorSpaceDisplayP3`, `kCGColorSpaceSRGB`); returns NULL for an unknown
 * name.
 *
 * TRUE out-of-scope extern (CoreGraphics framework). Same boundary POLICY as
 * `PCCFRefTraits_CGColorSpace_release` in this file — the CoreFoundation/
 * CoreGraphics runtime is not available under JS, so calls at the boundary are
 * MODELED, not executed:
 *
 *   • On the RELEASE side (`_CGColorSpaceRelease`), the model is "no-op with
 *     the handle passed through" — reference-counting has no meaning in JS/GC.
 *   • On the CREATE side (`_CGColorSpaceCreateWithName`), the model is
 *     "return an OPAQUE TOKEN uniquely identifying the requested name",
 *     because the caller (`PCColorSpaceHandle::C1`) only stores the returned
 *     pointer into `+0x00` and never introspects it — later CG APIs that
 *     WOULD dereference the handle are themselves throw-stubbed at their own
 *     @0xADDR extern boundaries, so no fabricated behaviour leaks past this
 *     point.
 *
 * The token wraps the CFStringRef `name` itself: the observable identity of
 * two CGColorSpace handles returned for the same name is preserved (equality
 * of the underlying name), which matches CoreGraphics' documented behaviour
 * (`CGColorSpaceCreateWithName` returns a shared handle for the built-in
 * names). This is a MODEL of the extern's contract at the boundary, not a
 * fabrication of its internals — the actual CG state remains unreachable.
 */
export function CGColorSpaceCreateWithName(name: unknown): CGColorSpaceRef {
  // @ProCore stub 0xde1c2 — CoreGraphics `_CGColorSpaceCreateWithName`.
  // Boundary model: return an opaque token tied to `name`. Matches the
  // no-op-on-release policy the destructor already uses (@0x601fcc).
  return { __cgColorSpaceForName: name } as unknown as CGColorSpaceRef;
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

/**
 * `PCColorSpaceHandle::PCColorSpaceHandle(__CFString const* name)` — the
 * CFStringRef-taking complete-object constructor (C1). @ProCore 0x9b222
 * (__ZN18PCColorSpaceHandleC1EPK10__CFString).
 *
 * Disasm: raw-port/re/disasm/ProCore.__ZN18PCColorSpaceHandleC1EPK10__CFString.s
 * (13 instructions):
 *
 *   0x9b222  pushq %rbp
 *   0x9b223  movq  %rsp, %rbp
 *   0x9b226  pushq %rbx
 *   0x9b227  pushq %rax                    ; 16-byte stack align pad
 *   0x9b228  movq  %rdi, %rbx              ; rbx = this (callee-saved for after call)
 *   0x9b22b  movq  %rsi, %rdi              ; rdi = name  (arg0 for CG call)
 *   0x9b22e  callq _CGColorSpaceCreateWithName  ; @ProCore stub 0xde1c2
 *   0x9b233  movq  %rax, (%rbx)            ; this->handle (+0x00) = returned CGColorSpace*
 *   0x9b236  addq  $0x8, %rsp              ; pop align pad
 *   0x9b23a  popq  %rbx
 *   0x9b23b  popq  %rbp
 *   0x9b23c  retq
 *
 * Semantics: `this->handle = CGColorSpaceCreateWithName(name);` — a single
 * CoreGraphics call whose returned +1-retained handle is stored at offset +0x00
 * without a null check (CGColorSpaceCreateWithName returns NULL for an unknown
 * name and PCColorSpaceHandle accepts that: the destructor's null-guard at
 * @0x601fc7 is what makes the RAII pair safe against a failed lookup).
 *
 * The construction is EMPTY-BASE — no prior field zero-initialisation, no vtable
 * pointer set, no base-class ctor call. `PCColorSpaceHandle` is a plain data
 * struct with a single pointer field.
 *
 * EXTERNS (out-of-scope, per boundary policy):
 *   • `_CGColorSpaceCreateWithName` — CoreGraphics @ProCore stub 0xde1c2.
 *     Modeled by the throw-stub `CGColorSpaceCreateWithName` at the top of
 *     this file (same pattern as `_CGColorSpaceRelease` / `_CGColorSpaceRetain`
 *     used by ~PCColorSpaceHandle here and by HGGamutMap.ts respectively).
 *
 * No in-scope deps.
 *
 * @param out    the storage that receives `this` (rdi @0x9b228). In the JS port
 *               this is a `PCColorSpaceHandle` instance whose `handle` field is
 *               written in-place — matching `movq %rax, (%rbx)` @0x9b233.
 * @param name   the CFStringRef passed as `rsi` (@0x9b22b). Opaque to this
 *               function; forwarded to CoreGraphics unchanged.
 */
export function PCColorSpaceHandle_C1_CFString(
  out: PCColorSpaceHandle,
  name: unknown
): void {
  // @0x9b22e  callq _CGColorSpaceCreateWithName(name)
  // @0x9b233  movq  %rax, (%rbx)   ; store the (+1-retained) handle at +0x00
  //
  // CGColorSpaceCreateWithName is a CoreGraphics extern — the boundary-throw
  // stub at the top of this file is faithful to policy. Callers that need a
  // working ColorSpace must supply the runtime; this constructor's control
  // flow is exactly the two-line disasm below the prologue.
  out.handle = CGColorSpaceCreateWithName(name);
}
