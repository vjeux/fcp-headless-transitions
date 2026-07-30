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
 *
 * ADDITIONAL SYMBOL PORTED IN THIS FILE
 *   PCColorSpaceHandle::PCColorSpaceHandle(__CFString const*) @ProCore 0x9b222
 *     __ZN18PCColorSpaceHandleC1EPK10__CFString
 *   Modelled as static factory `C1_CFString(self, name)` (TS single-ctor
 *   constraint). Body is a straight-line
 *   `this->handle = CGColorSpaceCreateWithName(name)`. Disasm source:
 *   raw-port/re/disasm/ProCore.__ZN18PCColorSpaceHandleC1EPK10__CFString.s
 */

import type { CGColorSpaceRef } from "./PCColor";

/**
 * `CGColorSpaceCreateWithName(CFStringRef name)` — CoreGraphics extern
 * (CoreGraphics.framework). Called from the PCColorSpaceHandle(CFString*)
 * ctor @ProCore 0x9b22e via stub 0xde1c2. TRUE OUT-OF-SCOPE extern (Apple
 * CoreGraphics runtime). In this port there is no CoreGraphics — CGColorSpace
 * has no independent existence. We model the call as a boundary stub that
 * throws citing @0xADDR, consistent with other CG* externs in-tree (see
 * PCCFRefTraits_CGColorSpace_release above, which is also modelled as a
 * boundary no-op/stub). Callers are expected to route colorspace lookups
 * through the higher-level Ozone/ProCore APIs that are wired to a JS-side
 * color pipeline, not directly through this raw name-lookup extern.
 *
 * @param _name CFStringRef — CoreFoundation string handle naming a
 *   registered CGColorSpace (e.g. `kCGColorSpaceSRGB`, `kCGColorSpaceGenericRGB`).
 * @returns CGColorSpaceRef — the newly-created (retained) color space, or
 *   null if the name is unknown. The caller owns the +1 retain and is
 *   responsible for CGColorSpaceRelease.
 */
export function CGColorSpaceCreateWithName(_name: unknown): CGColorSpaceRef | null {
  // @ProCore stub 0xde1c2 — CGColorSpaceCreateWithName (CoreGraphics extern).
  throw new Error(
    "CGColorSpaceCreateWithName (CoreGraphics extern) not modelled in this " +
      "port — called from PCColorSpaceHandle::PCColorSpaceHandle(CFString*) " +
      "@ProCore 0x9b22e via stub 0xde1c2. This is a TRUE out-of-scope extern " +
      "(Apple CoreGraphics runtime). Consistent with other CG* externs in-tree " +
      "(PCCFRefTraits_CGColorSpace_release @ProCore 0xacbf2 -> _CGColorSpaceRelease " +
      "stub 0xde1e6). Route colorspace lookups through the higher-level ProCore " +
      "APIs instead.",
  );
}

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

   * `PCColorSpaceHandle::PCColorSpaceHandle(__CFString const*)` @ProCore 0x9b222
   *   __ZN18PCColorSpaceHandleC1EPK10__CFString
   *
   * Disasm (raw-port/re/disasm/ProCore.__ZN18PCColorSpaceHandleC1EPK10__CFString.s):
   *
   *   0x9b222  pushq %rbp                     ; prologue
   *   0x9b223  movq  %rsp, %rbp
   *   0x9b226  pushq %rbx                     ; callee-saved
   *   0x9b227  pushq %rax                     ; 16-byte align pad
   *   0x9b228  movq  %rdi, %rbx               ; rbx = `this` (save across call)
   *   0x9b22b  movq  %rsi, %rdi               ; rdi = name (arg -> CGColorSpaceCreateWithName)
   *   0x9b22e  callq  _CGColorSpaceCreateWithName  ## stub 0xde1c2 (CoreGraphics extern)
   *   0x9b233  movq  %rax, (%rbx)             ; this->handle = rax  (field +0x00)
   *   0x9b236  addq  $0x8, %rsp               ; unwind align pad
   *   0x9b23a  popq  %rbx
   *   0x9b23b  popq  %rbp
   *   0x9b23c  retq
   *
   * SEMANTICS
   *   Complete-object ctor (C1). Stores CGColorSpaceCreateWithName(name) into
   *   the sole +0x00 field. The ctor OWNS the +1 retain returned by CG (the
   *   matching CGColorSpaceRelease happens in ~PCColorSpaceHandle @Flexo 0x601fc0).
   *
   *   TS modelling: since JS/TS has a single-constructor model and the class's
   *   default constructor above already accepts an optional `handle` arg, this
   *   named C1 variant is exposed as a static factory `C1_CFString` that mirrors
   *   the disasm one-for-one. Call it in place of `new PCColorSpaceHandle(...)`
   *   at any C1 call-site the porter is transcribing so the extern boundary is
   *   visible in the ported code.
   *
   * @param self  The PCColorSpaceHandle instance being initialised (`this` /
   *   %rdi in the disasm — `movq %rdi, %rbx` @0x9b228).
   * @param name  CFStringRef — the CoreGraphics color-space name (%rsi in the
   *   disasm — `movq %rsi, %rdi` @0x9b22b, passed on to CG*CreateWithName).
   */
  public static C1_CFString(self: PCColorSpaceHandle, name: unknown): void {
    // @0x9b228  movq %rdi, %rbx           — save `this`
    // @0x9b22b  movq %rsi, %rdi           — pass name as CG*CreateWithName arg
    // @0x9b22e  callq _CGColorSpaceCreateWithName ## stub 0xde1c2
    const cs = CGColorSpaceCreateWithName(name);
    // @0x9b233  movq %rax, (%rbx)         — this->handle = returned CGColorSpaceRef
    self.handle = cs;
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

  /**
   * PCColorSpaceHandle::getColorSpaceRef() const  @ProCore 0x9b384
   *   __ZNK18PCColorSpaceHandle16getColorSpaceRefEv
   *
   * Disasm (raw-port/re/disasm/ProCore.__ZNK18PCColorSpaceHandle16getColorSpaceRefEv.s):
   *   0x9b384  pushq %rbp
   *   0x9b385  movq  %rsp, %rbp
   *   0x9b388  movq  %rdi, %rax        ; return value = %rdi = `this`
   *   0x9b38b  popq  %rbp
   *   0x9b38c  retq
   *   0x9b38d  nop                     ; alignment
   *
   * Semantics: return `this` reinterpreted as a CGColorSpaceRef. The function does NOT
   * dereference `this` — it does not load the +0x00 handle field the way the Flexo dtor
   * @0x601fc4 does (that load reads a `PCCFRef<CGColorSpace*>` box). Here in ProCore,
   * `PCColorSpaceHandle` and `CGColorSpaceRef` are treated as the same address — the
   * class is a tag-only wrapper over the CGColorSpace opaque struct. Getting the "ref"
   * therefore just casts the `this` pointer to CGColorSpaceRef. This is a common CF-
   * wrapper idiom: `class PCColorSpaceHandle : private __CGColorSpace {}` (or an empty
   * distinct-type reinterpret_cast trick) — same bits, different C++ type.
   *
   * The dtor's `movq (%rdi), %rdi` in Flexo (@0x601fc4) belongs to a DIFFERENT compilation
   * of PCColorSpaceHandle — Flexo instantiates it as a pointer-holder box, while ProCore
   * instantiates it as a tag. The mangled symbol and demangled name are identical because
   * both TUs see the same header, but the emitted body reflects the local usage. In this
   * port we honor the ProCore semantics for getColorSpaceRef (identity cast) and the
   * Flexo semantics for the dtor (deref+release). Callers that want the CGColorSpaceRef
   * out of a wrapper get the object itself, not the +0x00 field.
   *
   * Since JS has no `this`-as-pointer identity, we return the PCColorSpaceHandle instance
   * — a `PCColorSpaceHandle` is-a `CGColorSpaceRef` for API purposes here. Downstream
   * ProCore call-sites (10+ callq sites decoded in the binary) will treat the return
   * value opaque and pass it back to CG* APIs which are boundary-stubbed anyway.
   */
  public getColorSpaceRef(): PCColorSpaceHandle {
    // @0x9b388  movq %rdi, %rax  — return value = this-pointer, no field load.
    return this;
  }

  /**
   * PCColorSpaceHandle::getCGColorSpace() const  @ProCore 0x9afee
   *   __ZNK18PCColorSpaceHandle15getCGColorSpaceEv
   *
   * Disassembly (raw-port/re/disasm/ProCore.__ZNK18PCColorSpaceHandle15getCGColorSpaceEv.s):
   *
   *   0x9afee  pushq %rbp                     ; prologue
   *   0x9afef  movq  %rsp, %rbp
   *   0x9aff2  movq  (%rdi), %rax             ; rax = *(void**)this  = field @+0x00
   *   0x9aff5  popq  %rbp                     ; epilogue
   *   0x9aff6  retq                           ; return rax
   *   0x9aff7  nop                            ; alignment
   *
   * A dead-simple getter: load the first pointer-sized slot of `this` and
   * return it. That slot is `handle` (see the class definition above and
   * the Flexo ~PCColorSpaceHandle dtor @0x601fc4 which does the SAME load
   * before releasing). Zero calls, zero branches, no null check.
   *
   * The distinction versus the sibling `getColorSpaceRef()` @0x9b384: that
   * one returns `this` (identity cast); THIS one dereferences +0x00 and
   * returns the stored CGColorSpace*. Both are legitimate wrapper idioms
   * in ProCore's dual-TU compilation of PCColorSpaceHandle.
   */
  public getCGColorSpace(): CGColorSpaceRef | null {
    // @0x9aff2  movq (%rdi), %rax
    return this.handle;
  }
}
