// PCNSRefImpl — ProCore's tiny ARC-owning wrapper around an Objective-C
// `id` handle (namespace `ProCore_Impl::PCNSRefImpl`).
//
// This unit ports `release() const` @ProCore 0xac550 AND
// `retain() const` @ProCore 0xac542. Ctors, dtors, get, reset, etc. are
// SEPARATE ledger entries and remain OUT OF SCOPE for this file until
// their own claims — extending this file with more methods later is the
// correct workflow (one class per file).
//
// Provenance:
//   Binary: /Applications/Final Cut Pro.app/Contents/Frameworks/
//           ProCore.framework/Versions/A/ProCore (x86_64 slice; unadjusted
//           VAs from `otool -tV`).
//   Disasm: raw-port/re/disasm/ProCore.__ZNK12ProCore_Impl11PCNSRefImpl7releaseEv.s
//
// ─────────────────────────────────────────────────────────────────────────
// STRUCT LAYOUT (recovered from this method's dereference)
// ─────────────────────────────────────────────────────────────────────────
//   size ≥ 0x08
//   +0x00   handle : id (Objective-C object handle)
//                         ; `movq (%rdi), %rdi` @0xac554 loads it, then the
//                         ; tail `jmpq *0x9b892(%rip) ## _objc_release`
//                         ; @0xac558 drops the ref via the __DATA_CONST.__got
//                         ; slot for _objc_release (this is the raw ARC drop
//                         ; primitive libobjc exports; PCNSRefImpl::release
//                         ; is thus a one-liner "objc_release(this->handle)"
//                         ; wrapper). Layout inferred from THIS accessor's
//                         ; single field access — dtor/ctor decoding, when
//                         ; ported, may reveal additional fields, in which
//                         ; case this comment will grow accordingly.
//
// ─────────────────────────────────────────────────────────────────────────
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// ─────────────────────────────────────────────────────────────────────────
//   * _objc_release
//       — libobjc ARC drop primitive. TRUE out-of-scope extern (ObjC
//         runtime — outside the 5-framework port scope, modelled by the
//         boundary stub in raw-port/src/harness/ObjC.ts).
//       — In ProCore, this stub is NOT accessed through __TEXT.__stubs; it
//         is loaded directly from __DATA_CONST.__got, so the disasm shows
//         `jmpq *0x9b892(%rip)` (an indirect tail-call through the __got
//         slot). See raw-port/src/harness/ObjC.ts for the resolved __got
//         address in Flexo — ProCore uses the same libobjc symbol.
//
//   * _objc_retain
//       — libobjc ARC bump primitive. TRUE out-of-scope extern (ObjC
//         runtime — same category as _objc_release). Loaded directly from
//         __DATA_CONST.__got — disasm shows `jmpq *0x9b8a8(%rip)`. libobjc
//         semantics: `_objc_retain(nil) == nil`, otherwise atomic +1 on
//         the object's refcount, returning the SAME id (an important
//         invariant callers rely on when chaining). Modelled as a
//         literal identity-with-nil-passthrough in harness/ObjC.ts —
//         lifetime primitives are NO-OPs in the JS surrogate (JS GC
//         handles our object graph), per the landed extern-boundary
//         convention (docs/reviewer commit 619711b7 "CFRelease/CFRetain-
//         family externs are no-ops, not throws (whole PCCFRef family)").
//
// ─────────────────────────────────────────────────────────────────────────
// SYMBOLS PORTED HERE
// ─────────────────────────────────────────────────────────────────────────
//   * __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
//       — ProCore_Impl::PCNSRefImpl::release() const  @ProCore 0xac550
//   * __ZNK12ProCore_Impl11PCNSRefImpl6retainEv
//       — ProCore_Impl::PCNSRefImpl::retain()  const  @ProCore 0xac542
//
// ─────────────────────────────────────────────────────────────────────────
// FULL DISASM
//   raw-port/re/disasm/ProCore.__ZNK12ProCore_Impl11PCNSRefImpl7releaseEv.s
// ─────────────────────────────────────────────────────────────────────────
//   0xac550  pushq %rbp                    ; frame prologue
//   0xac551  movq  %rsp, %rbp
//   0xac554  movq  (%rdi), %rdi            ; rdi = this->handle (the wrapped id)
//                                          ; System-V ABI: this = %rdi on entry,
//                                          ; so this instruction loads offset 0.
//   0xac557  popq  %rbp                    ; frame epilogue (before the tail-call)
//   0xac558  jmpq  *0x9b892(%rip)          ; tail-call _objc_release via __got
//                                          ; literal-pool addr 0xac558+7+0x9b892
//                                          ; = 0x147df1. The label comment
//                                          ; `## literal pool symbol address:
//                                          ;   _objc_release` is otool's own
//                                          ;  resolution.
// ─────────────────────────────────────────────────────────────────────────

import { objc_release, objc_retain, type ObjCObject } from "../harness/ObjC";

/**
 * `ProCore_Impl::PCNSRefImpl` — ProCore's raw wrapper around a single
 * `id` handle. In FCP, PCNSRefImpl is what a `PCCFRef<NSObject*>` /
 * `PCNSRef<T>` template lowers to for ObjC element types (compare
 * PCCFRef<CGColorSpace*> which uses CFRelease — this variant uses
 * _objc_release). Only `release()` is transcribed in this file.
 */
export class PCNSRefImpl {
  /**
   * @ProCore 0x00 — the wrapped Objective-C object handle. Read by
   * release() @0xac554. `null` models the empty/unset state (an ARC
   * `id` slot is nil-initialised by default, and `objc_release(nil)`
   * is a documented libobjc no-op — see harness/ObjC.ts's
   * `objc_release` fast-path).
   */
  handle: ObjCObject | null = null;

  /**
   * `ProCore_Impl::PCNSRefImpl::release() const` — @ProCore 0xac550
   * (__ZNK12ProCore_Impl11PCNSRefImpl7releaseEv).
   *
   * Faithful transcription of the 5-instruction body: load
   * `this->handle`, drop the ref via `_objc_release` (tail-called
   * through the __DATA_CONST.__got literal-pool slot at
   * @0xac558 + 7 + 0x9b892 = 0x147df1). The `const` qualifier on the
   * C++ signature is honest here — release does not mutate `handle`
   * from the caller's perspective (libobjc's _objc_release only
   * decrements the refcount and, if it hits zero, invokes -dealloc;
   * the wrapper's `handle` field is not written).
   *
   *   0xac550  pushq %rbp
   *   0xac551  movq  %rsp, %rbp
   *   0xac554  movq  (%rdi), %rdi
   *   0xac557  popq  %rbp
   *   0xac558  jmpq  *0x9b892(%rip)   ; -> _objc_release
   */
  release(): void {
    // ------------------------------------------------------------
    // @0xac550..0xac551 — prologue (no TS-visible effect).
    // @0xac554           — `movq (%rdi), %rdi`: load this->handle
    //                      into the arg-0 register for the impending
    //                      tail-call to _objc_release.
    // @0xac557           — `popq %rbp`: epilogue.
    // @0xac558           — `jmpq *[rip+0x9b892]`: tail-call
    //                      _objc_release(this->handle). Tail-call
    //                      semantics are indistinguishable from
    //                      call+ret at this granularity — the return
    //                      value is void either way.
    // ------------------------------------------------------------
    objc_release(this.handle);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // retain() — sibling of release(). Same 5-instruction shape, same ARC
  // primitive family (libobjc), differing only in the __got slot: release
  // hits @rip+0x9b892 (== _objc_release GOT), retain hits @rip+0x9b8a8
  // (== _objc_retain GOT).  Added as a separate ledger claim; the header
  // above already lists both symbols under SYMBOLS PORTED HERE.
  //
  // Disasm source:
  //   raw-port/re/disasm/ProCore.__ZNK12ProCore_Impl11PCNSRefImpl6retainEv.s
  //
  // FULL DISASM
  //   0xac542  pushq %rbp                    ; frame prologue
  //   0xac543  movq  %rsp, %rbp
  //   0xac546  movq  (%rdi), %rdi            ; rdi = this->handle
  //                                          ; System-V ABI: this = %rdi.
  //   0xac549  popq  %rbp                    ; frame epilogue
  //   0xac54a  jmpq  *0x9b8a8(%rip)          ; tail-call _objc_retain via __got
  //                                          ; literal-pool addr
  //                                          ; 0xac54a+7+0x9b8a8 = 0x147df9.
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * `ProCore_Impl::PCNSRefImpl::retain() const` — @ProCore 0xac542
   * (__ZNK12ProCore_Impl11PCNSRefImpl6retainEv).
   *
   * Faithful transcription of the 5-instruction body: load `this->handle`,
   * tail-call `_objc_retain` through the __DATA_CONST.__got literal-pool
   * slot at @0xac54a + 7 + 0x9b8a8 = 0x147df9. libobjc's `_objc_retain(id)`
   * returns the SAME id (nil passes through unchanged); the wrapper never
   * writes `handle`, so the C++ `const` on the signature is honest.
   *
   * Note: unlike a typical C++ smart-ptr retain, this returns the retained
   * id (native register %rax is the ObjC return; the tail-jmp forwards it).
   * We model that faithfully — the JS surrogate returns the same handle
   * that would land in %rax after the tail-call (libobjc's retain is a
   * documented identity on the object).
   *
   *   0xac542  pushq %rbp
   *   0xac543  movq  %rsp, %rbp
   *   0xac546  movq  (%rdi), %rdi
   *   0xac549  popq  %rbp
   *   0xac54a  jmpq  *0x9b8a8(%rip)   ; -> _objc_retain
   */
  retain(): ObjCObject | null {
    // ------------------------------------------------------------
    // @0xac542..0xac543 — prologue (no TS-visible effect).
    // @0xac546           — `movq (%rdi), %rdi`: load this->handle into
    //                      the arg-0 register for the impending tail-
    //                      call to _objc_retain.
    // @0xac549           — `popq %rbp`: epilogue.
    // @0xac54a           — `jmpq *[rip+0x9b8a8]`: tail-call
    //                      _objc_retain(this->handle). Return value in
    //                      %rax IS the (retained) id from libobjc's
    //                      identity-on-non-nil semantics.
    // ------------------------------------------------------------
    return objc_retain(this.handle);
  }
}
