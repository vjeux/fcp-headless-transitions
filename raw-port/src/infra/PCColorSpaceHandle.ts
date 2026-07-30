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
 * `_CGColorSpaceCreateWithName(CFStringRef name)` — CoreGraphics extern that
 * produces a fresh CGColorSpaceRef (+1 retain) for a named color space (e.g.
 * `kCGColorSpaceSRGB`, `kCGColorSpaceGenericGray`, `kCGColorSpaceExtendedSRGB`).
 *
 * TRUE out-of-scope extern per this port's policy — CoreGraphics is not one
 * of the five ported FCP frameworks. The value it produces is an opaque CG
 * handle that only the live CG runtime can construct. The ONLY faithful port
 * without fabricating a CGColorSpace is to `throw`, matching the boundary-
 * stub convention already used elsewhere in this port for CG-value-producing
 * externs (see `PCColorSpaceHandle_operator_lt` @ProCore 0x9b3ec, and
 * `createExtendedColorSpace` @ProCore 0x20581 which similarly cites this
 * stub at 0xde1c2 for its Extended-sRGB path).
 *
 * The single call-site currently transcribed is the PCColorSpaceHandle
 * CFString-name ctor @ProCore 0x9b22e (stub @0xde1c2).
 */
function _CGColorSpaceCreateWithName_stub(_name: unknown): CGColorSpaceRef | null {
  // @ProCore 0x9b22e -> _CGColorSpaceCreateWithName @stub 0xde1c2
  throw new Error(
    "_CGColorSpaceCreateWithName(CFStringRef) @ProCore imported-stub 0xde1c2 " +
      "(called from PCColorSpaceHandle::PCColorSpaceHandle(__CFString const*) " +
      "@ProCore 0x9b22e): TRUE out-of-scope extern (CoreGraphics.framework). " +
      "Produces an opaque CGColorSpaceRef only the live CG runtime can build " +
      "— no faithful JS answer exists without fabricating a color-space handle. " +
      "This matches the boundary-stub convention used across this port for " +
      "CG-value-producing externs (see PCColorSpaceHandle_operator_lt.ts and " +
      "createExtendedColorSpace.ts).",
  );
}

/**
 * CFStringRef — opaque CoreFoundation string handle. TRUE out-of-scope extern.
 * Modelled here as a nominal type so the ctor signature reads exactly like the
 * FCP prototype `PCColorSpaceHandle(__CFString const*)`.
 */
export type CFStringRef = unknown;

/**
 * `_CGColorSpaceCreateWithName(CFStringRef name) -> CGColorSpaceRef`
 *   CoreGraphics extern @ProCore imported-stub 0xde1c2.
 *
 * TRUE out-of-scope extern (CoreGraphics.framework). Called from
 * PCColorSpaceHandle::PCColorSpaceHandle(__CFString const*) @ProCore 0x9b22e
 * (`callq 0xde1c2 ## symbol stub for: _CGColorSpaceCreateWithName`) and from
 * createExtendedColorSpace @ProCore 0x2058b's Extended-sRGB fallback. Returns
 * a +1-retained CGColorSpaceRef for the named color-space constant (e.g.
 * kCGColorSpaceExtendedSRGB, kCGColorSpaceDisplayP3, kCGColorSpaceGenericGray).
 *
 * We honor the extern-boundary convention already used across the port (see
 * PCColorSpaceHandle_operator_lt.ts and createExtendedColorSpace.ts): throw
 * with the @0xADDR of the actual call site so any live code path that hits
 * the boundary fails loud instead of silently fabricating a color space.
 */
function CGColorSpaceCreateWithName_stub(name: CFStringRef | null): CGColorSpaceRef | null {
  // @ProCore imported-stub 0xde1c2 (`_CGColorSpaceCreateWithName`).
  // Not modelled: JS has no live CoreGraphics color-space registry.
  throw new Error(
    "_CGColorSpaceCreateWithName(CFStringRef) @ProCore stub 0xde1c2 — " +
      "CoreGraphics.framework extern (TRUE out-of-scope). Called from " +
      "PCColorSpaceHandle::PCColorSpaceHandle(__CFString const*) @ProCore " +
      "0x9b22e. Name arg (opaque CFStringRef): " + String(name),
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
   * `PCColorSpaceHandle::PCColorSpaceHandle(__CFString const*)`
   *   @ProCore 0x9b222  __ZN18PCColorSpaceHandleC1EPK10__CFString
   *
   * Complete-object ctor (C1 alias) that constructs a PCColorSpaceHandle from a
   * CoreFoundation string name (e.g. `kCGColorSpaceSRGB`,
   * `kCGColorSpaceExtendedSRGB`, `kCGColorSpaceDisplayP3`, ...). The C1 body IS
   * the real work — there is no separate C2 emitted at this address; the whole
   * function is 14 lines including prologue/epilogue.
   *
   * Full disasm (raw-port/re/disasm/ProCore.__ZN18PCColorSpaceHandleC1EPK10__CFString.s):
   *
   *   0x9b222  pushq  %rbp
   *   0x9b223  movq   %rsp, %rbp
   *   0x9b226  pushq  %rbx
   *   0x9b227  pushq  %rax                             ; align stack for callq
   *   0x9b228  movq   %rdi, %rbx                       ; rbx = this  (save across call)
   *   0x9b22b  movq   %rsi, %rdi                       ; rdi = name  (arg-shuffle)
   *   0x9b22e  callq  0xde1c2                          ; _CGColorSpaceCreateWithName(name)
   *                                                      ## symbol stub, ProCore imports
   *   0x9b233  movq   %rax, (%rbx)                     ; this->handle = rax  (+0x00)
   *   0x9b236  addq   $0x8, %rsp                       ; unwind stack
   *   0x9b23a  popq   %rbx
   *   0x9b23b  popq   %rbp
   *   0x9b23c  retq
   *   0x9b23d  nop                                     ; alignment
   *
   * Semantics recovered:
   *   PCColorSpaceHandle::PCColorSpaceHandle(CFStringRef name) {
   *     this->handle = _CGColorSpaceCreateWithName(name);   // +1 retain, may be NULL
   *   }
   *
   * The stored ref is owned by this handle: the Flexo dtor @0x601fc0 releases it
   * (via `PCCFRefTraits<CGColorSpace*>::release` -> `_CGColorSpaceRelease`). No
   * retain/copy is inserted here because CGColorSpaceCreateWithName already
   * returns a +1 reference per CF create-rule convention.
   *
   * ── PORT NOTES ──
   * TypeScript does not support multiple constructor bodies with distinct
   * parameter types the way C++ does. Every other overload in this class is
   * exposed as a static factory (see the `new*` methods on `PCColor` for the
   * same pattern), so this ctor is exposed as `newFromCFString(name)`. The
   * default constructor `new PCColorSpaceHandle(handle?)` remains the direct
   * pointer-holder path.
   *
   * The call to `_CGColorSpaceCreateWithName` is a TRUE out-of-scope extern:
   * the value it produces is an opaque CGColorSpaceRef only the live
   * CoreGraphics runtime can build. It is modelled as a boundary stub that
   * throws, matching the extern-boundary convention used across this port
   * (see `PCColorSpaceHandle_operator_lt.ts`, `createExtendedColorSpace.ts`).
   * Callers that reach this path require a live CG color-space registry that
   * does not exist in the JS port; the throw preserves that fact faithfully
   * rather than silently fabricating a handle.
   */
  public static newFromCFString(name: CFStringRef | null): PCColorSpaceHandle {
    const self = new PCColorSpaceHandle(null);
    // @0x9b22e  callq _CGColorSpaceCreateWithName(name)
    const ref = CGColorSpaceCreateWithName_stub(name);
    // @0x9b233  movq %rax, (%rbx)   — store return value in this->handle (+0x00)
    self.handle = ref;
    return self;
  }

  /**
   * `PCColorSpaceHandle::PCColorSpaceHandle(__CFString const*)`
   *   C1 complete-object ctor  @ProCore 0x9b222
   *   `__ZN18PCColorSpaceHandleC1EPK10__CFString`
   *
   * Disassembly (raw-port/re/disasm/ProCore.__ZN18PCColorSpaceHandleC1EPK10__CFString.s):
   *
   *   0x9b222  pushq %rbp
   *   0x9b223  movq  %rsp, %rbp
   *   0x9b226  pushq %rbx
   *   0x9b227  pushq %rax                       ; 16-byte-align rsp
   *   0x9b228  movq  %rdi, %rbx                 ; rbx = this
   *   0x9b22b  movq  %rsi, %rdi                 ; rdi = name (arg1: CFStringRef)
   *   0x9b22e  callq 0xde1c2                    ; symbol stub for: _CGColorSpaceCreateWithName
   *   0x9b233  movq  %rax, (%rbx)               ; this->handle = returned CGColorSpaceRef
   *   0x9b236  addq  $0x8, %rsp                 ; unwind scratch push
   *   0x9b23a  popq  %rbx
   *   0x9b23b  popq  %rbp
   *   0x9b23c  retq
   *   0x9b23d  nop
   *
   * Semantics: create a new PCColorSpaceHandle whose +0x00 field is set to the
   * result of `_CGColorSpaceCreateWithName(name)`. No other work — no throwing
   * ctor delegation, no null check, no retain adjustment (CGColorSpaceCreateWithName
   * already returns a +1-retained ref, ownership transfers to the handle to be
   * released by the Flexo dtor @0x601fc0). This is the "named-color-space" factory
   * used by call-sites that want e.g. `kCGColorSpaceExtendedSRGB` or
   * `kCGColorSpaceDisplayP3` wrapped in a PCColorSpaceHandle for the caching
   * layers (PCNCLCCode map, PCEvictionHeap<PCCFRef<CGColorSpace*>>).
   *
   * TS PORT SHAPE: TypeScript cannot overload ctors, and the existing
   * `constructor(handle?)` already covers the pointer-in path. We expose this
   * one as the static factory `newFromCFStringName(name)` so the call sequence
   * — invoke `_CGColorSpaceCreateWithName`, install result at +0x00 — reads
   * literally from the disasm. Callers that transcribe a
   * `PCColorSpaceHandle csh(name)` C++ stack ctor should call this factory.
   */
  static newFromCFStringName(name: CFStringRef | null): PCColorSpaceHandle {
    // @0x9b22e  callq _CGColorSpaceCreateWithName(name)
    const cs = CGColorSpaceCreateWithName_stub(name);
    // @0x9b233  movq %rax, (%rbx)  -> this->handle = cs
    const self = new PCColorSpaceHandle(null);
    self.handle = cs;
    return self;
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
