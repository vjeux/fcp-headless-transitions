// PCNSRefImpl — ProCore's reference-counted holder for a retained
// Objective-C (NSObject-derived) pointer. This C++ helper caches an
// Objective-C object pointer at instance +0x00 and manages its
// lifetime by tail-calling `objc_retain` / `objc_release` on it.
//
// This file ONLY transcribes ONE method today: `retain() const` at
// @ProCore 0xac542. All other members (ctor(s), dtor, release,
// operator=(), and any accessor) are SEPARATE ledger units currently
// `todo` and will extend this class file when their claims land, per
// the "one class per file" rule.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProCore.framework/Versions/A/ProCore (x86_64 slice; unadjusted VAs
// from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProCore.__ZNK12ProCore_Impl11PCNSRefImpl6retainEv.s
//
// Full 6-line disassembly of the CLAIMED method (verbatim):
//
//   __ZNK12ProCore_Impl11PCNSRefImpl6retainEv:
//   0xac542  pushq   %rbp
//   0xac543  movq    %rsp, %rbp
//   0xac546  movq    (%rdi), %rdi                    ; rdi = *this = obj*
//   0xac549  popq    %rbp
//   0xac54a  jmpq    *0x9b8a8(%rip)                  ## literal pool symbol address: _objc_retain
//
// SEMANTIC SUMMARY
//   `retain()` performs a tail-call to `objc_retain(this->obj)`. The
//   Objective-C runtime's objc_retain increments the retained refcount
//   on the passed object and returns the same object pointer (its
//   documented behaviour), so this function is a thin passthrough:
//
//     id PCNSRefImpl::retain() const {
//         return objc_retain(this->obj);
//     }
//
//   The tail-jmp (`jmpq *0x9b8a8(%rip)`) rather than `callq` matters:
//   PCNSRefImpl::retain does not preserve/inspect the return value —
//   whatever objc_retain returns is what the caller sees. The literal
//   pool at RIP+0x9b8a8 (== 0xac54a next-insn + 0x9b8a8 = 0x147df2, a
//   GOT slot in __got / __la_symbol_ptr resolving to
//   libobjc.dylib/_objc_retain at runtime) is where the ObjC runtime
//   pointer is patched by dyld.
//
// STRUCT LAYOUT DECODED FROM THIS BODY
//   ProCore_Impl::PCNSRefImpl instance layout (partial — only what this
//   function touches):
//     +0x00  id obj    ; the retained NSObject* (read @0xac546).
//     +0x08  ...       ; (unknown to this method — likely just the one
//                        field; a "wrap a retained id" impl doesn't
//                        need anything else. Confirmed once retain's
//                        peer `release()` @ProCore's next-nearest addr
//                        is transcribed by its own claim.)
//
// DEPENDENCIES
//   Direct in-scope callees: NONE. The one tail-jmp target is
//   `_objc_retain` — Objective-C runtime (libobjc.dylib), reached via
//   an indirect jmp through a GOT slot at RIP+0x9b8a8. TRUE out-of-scope
//   extern (ObjC runtime is not one of the five FCP frameworks). Modelled
//   as a raising boundary stub per policy (see PORTING_SPEC.md — same
//   treatment as PCThreadNS.ts's objc_alloc/objc_msgSend calls and the
//   HGMemory __call_once stubs).
//
// Symbols ported here (mangled -> address):
//   * __ZNK12ProCore_Impl11PCNSRefImpl6retainEv
//     -- ProCore_Impl::PCNSRefImpl::retain() const @ProCore 0xac542

/**
 * `objc_retain(id obj)` — Objective-C runtime's retain primitive.
 * Called via a RIP-relative GOT jmp at @ProCore 0xac54a
 * (`jmpq *0x9b8a8(%rip)`). TRUE out-of-scope extern (libobjc.dylib;
 * not one of the five FCP frameworks). By spec: increments the
 * retained refcount on `obj` and returns `obj` unchanged (or nil if
 * obj was nil). Modelled here as a raising stub because we have no
 * ObjC runtime in the port. */
function objc_retain_stub(_obj: unknown): unknown {
  throw new Error(
    "objc_retain(id) @ProCore imported GOT-jmp *0x9b8a8(%rip) -> 0x147df2 " +
      "(libobjc.dylib — TRUE out-of-scope ObjC runtime extern; not yet transcribed)",
  );
}

/**
 * `ProCore_Impl::PCNSRefImpl` — ProCore's C++ smart-holder for a
 * retained Objective-C object pointer (partial port).
 *
 * ONLY `retain() const` is transcribed here. All other members (ctor(s),
 * dtor, `release() const`, operator=, etc.) are SEPARATE ledger symbols
 * and are the responsibility of separate claims.
 *
 * Struct layout (partial, decoded from ported members only):
 *   +0x00  id obj  — the retained NSObject*. Read by retain() to pass
 *                    to objc_retain(). Written by ctors/operator= (not
 *                    yet transcribed).
 */
export class PCNSRefImpl {
  /**
   * `PCNSRefImpl::obj` — the retained Objective-C object pointer,
   * stored at instance +0x00. Read by `retain()` @0xac546; will be
   * written by the ctor and cleared by dtor / release (both `todo`).
   *
   * Held here as an opaque handle; we do NOT pretend to know the class
   * of the pointee (any NSObject-derived), and the retain path treats
   * it as an opaque id from ObjC's perspective.
   */
  obj: unknown = null; // @ProCore instance +0x00

  /**
   * `ProCore_Impl::PCNSRefImpl::retain() const` @ProCore 0xac542
   * (__ZNK12ProCore_Impl11PCNSRefImpl6retainEv).
   *
   * Faithful transcription of the 6-line disasm quoted in the file
   * header. Body:
   *
   *   return objc_retain(this->obj);   // tail-jmp @0xac54a
   *
   * (The disasm shows a tail-jmp, not a callq. objc_retain's documented
   * contract is to return the same pointer it received, so tail-calling
   * it forwards that pointer to our caller without further processing.)
   *
   * Return type: the Objective-C runtime returns the SAME pointer (or
   * nil) so we type the return as `unknown` — the same opaque id type
   * we hold in `obj`. Callers that need a typed handle wrap this in a
   * class-specific cast as they do in the disasm.
   */
  retain(): unknown {
    // @0xac542–0xac543: prologue (rbp frame; no callee-saves needed).
    // @0xac546:         movq (%rdi), %rdi   ; rdi = this->obj.
    const obj = this.obj;
    // @0xac549:         popq %rbp           ; tear down BEFORE tail-jmp.
    // @0xac54a:         jmpq *0x9b8a8(%rip) ; tail-jmp to objc_retain.
    //                    TRUE out-of-scope ObjC runtime extern.
    return objc_retain_stub(obj);
  }
}
