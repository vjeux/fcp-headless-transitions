// PCCFRefTraits_vImageConverter.ts — ProCore free functions:
//   PCCFRefTraits<vImageConverter*>::retain(vImageConverter*)   @ProCore 0xacec4
//   PCCFRefTraits<vImageConverter*>::release(vImageConverter*)  @ProCore 0xacece
//
// The retain/release pair of the trait struct PCCFRef<vImageConverterRef> uses to
// manage ownership of its handle. Both are 4-instruction thunks (prologue + tail-jmp)
// that forward straight through to the CoreFoundation extern of the same name.
// vImageConverter is a CFType (Accelerate.framework's opaque vImage colour-conversion
// handle), so the compiler picks the generic _CFRetain/_CFRelease symbols rather
// than a type-specific pair.
//
// Symbols:
//   __ZN13PCCFRefTraitsIP15vImageConverterE6retainES1_   @ProCore 0xacec4
//   __ZN13PCCFRefTraitsIP15vImageConverterE7releaseES1_  @ProCore 0xacece
// Disasm:
//   raw-port/re/disasm/ProCore.__ZN13PCCFRefTraitsIP15vImageConverterE6retainES1_.s
//   raw-port/re/disasm/ProCore.__ZN13PCCFRefTraitsIP15vImageConverterE7releaseES1_.s
//
//   0xacec4  pushq %rbp                          ; retain
//   0xacec5  movq  %rsp, %rbp
//   0xacec8  popq  %rbp
//   0xacec9  jmp   _CFRetain                     ; ProCore symbol stub 0xde018
//
//   0xacece  pushq %rbp                          ; release
//   0xacecf  movq  %rsp, %rbp
//   0xaced2  popq  %rbp
//   0xaced3  jmp   _CFRelease                    ; ProCore symbol stub 0xde012
//
// Neither function does any real work — each exists purely so PCCFRefTraits<T>'s
// templated RAII operations can dispatch through a T-specific retain/release symbol
// whose ABI (single-arg, tail-jmp) is uniform across every T. For CGColorSpace* the
// compiler picks the type-specific _CGColorSpaceRetain/_CGColorSpaceRelease
// (@ProCore 0xacbe8 / 0xacbf2 — see PCCFRefTraits_CGColorSpace.ts + PCColorSpaceHandle.ts);
// for vImageConverter* it drops through to the generic CF pair because vImageConverter
// does not export a type-specific retain/release under its own name.
//
// EXTERNS:
//   _CFRetain  — CoreFoundation extern, ProCore symbol stub 0xde018. Modeled as an
//   identity no-op returning the handle unchanged. CFRetain-family semantics are
//   documented to return their argument after bumping the retain count; the JS/GC
//   port has no retain counts so returning the input handle is the faithful boundary
//   model. Mirrors `_CGColorSpaceRetain` in ./PCCFRefTraits_CGColorSpace.ts.
//   _CFRelease — CoreFoundation extern, ProCore symbol stub 0xde012. Modeled as a
//   no-op at the boundary: CFRetain/CFRelease has no meaning under JS/GC, exactly
//   as `PCCFRefTraits_CGColorSpace_release` in ./PCColorSpaceHandle.ts already does
//   for the CGColorSpace-side release. This is a MODEL of the extern's contract at
//   the boundary (drop the +1 retain on `cs`), not a fabrication of its internals.
//
// DEPS: none in-scope.

/**
 * Opaque handle to an Accelerate `vImageConverter` — a CFType created by
 * `vImageConverter_CreateWith*` APIs. Managed by CFRetain / CFRelease.
 */
export type vImageConverterRef = unknown;

/**
 * CoreFoundation.framework extern — TRUE out-of-scope boundary stub.
 * Modelled as a JS identity no-op returning the input handle unchanged.
 * CFRetain-family semantics per Apple's docs: increments the retain count and
 * returns its argument. In the JS/GC port retain counts don't exist, so
 * returning `cs` unchanged is faithful at the boundary. Mirrors
 * `_CGColorSpaceRetain` in ./PCCFRefTraits_CGColorSpace.ts (same shape, same
 * boundary policy — differs only in which CF symbol the compiler dispatches
 * to for this type).
 *
 * @0xacec9 via ProCore stub 0xde018 (jmp target of
 *   PCCFRefTraits<vImageConverter*>::retain).
 */
function _CFRetain(cs: vImageConverterRef | null): vImageConverterRef | null {
  // CoreFoundation-level bookkeeping — no observable JS effect.
  return cs;
}

/**
 * `PCCFRefTraits<vImageConverter*>::retain(vImageConverter* cs)`
 *   @ProCore 0xacec4   (__ZN13PCCFRefTraitsIP15vImageConverterE6retainES1_)
 *
 * Byte-exact from the 5-instruction disasm at the top of this file: prologue,
 * epilogue, tail-jmp to `_CFRetain` (ProCore symbol stub @0xde018). The
 * function performs no work of its own; every observable effect belongs to
 * `_CFRetain`. Because `_CFRetain` is a CoreFoundation extern modelled as an
 * identity no-op (see above), this trait method is a pure forwarder that
 * returns its argument unchanged — matching the CFRetain-family idiom
 * "returns the argument after incrementing its retain count".
 *
 * Peer instantiation for cross-check: `PCCFRefTraits<CGColorSpace*>::retain`
 * @ProCore 0xacbe8 in ./PCCFRefTraits_CGColorSpace.ts — identical prologue +
 * tail-jmp shape, differing only in the stub-target
 * (_CGColorSpaceRetain vs _CFRetain).
 *
 * @param cs the retained vImageConverter* handle (rdi @0xacec4). Passed
 *           straight to _CFRetain (@0xacec9 `jmp _CFRetain`), which under the
 *           JS boundary policy returns the same value in rax.
 * @returns  the same handle, per _CFRetain's identity-no-op boundary model.
 */
export function PCCFRefTraits_vImageConverter_retain(
  cs: vImageConverterRef | null,
): vImageConverterRef | null {
  // @0xacec4..0xacec8  prologue + epilogue (no register clobbers, no local state).
  // @0xacec9           jmp _CFRetain  (ProCore stub 0xde018) — tail-call.
  //
  // The tail-jmp means retain's return value IS whatever _CFRetain returns
  // (rax on the way out is set by the callee). Under the boundary model
  // _CFRetain is the identity, so we return `cs` unchanged — same shape as
  // PCCFRefTraits_CGColorSpace_retain in ./PCCFRefTraits_CGColorSpace.ts.
  return _CFRetain(cs);
}

/**
 * `PCCFRefTraits<vImageConverter*>::release(vImageConverter* cs)`
 *   @ProCore 0xacece   (__ZN13PCCFRefTraitsIP15vImageConverterE7releaseES1_)
 *
 * Byte-exact from the 5-instruction disasm above: prologue, epilogue, tail-jmp
 * to `_CFRelease` (ProCore symbol stub @0xde012). The function performs no
 * work of its own; every observable effect belongs to `_CFRelease`.
 *
 * `_CFRelease` is a CoreFoundation extern. In the JS/GC port it has no runtime
 * effect (retain counts don't exist here) — same boundary policy as
 * `PCCFRefTraits_CGColorSpace_release` in ./PCColorSpaceHandle.ts. We faithfully
 * MODEL the ownership drop by passing the handle through without touching it;
 * making it unreachable through the caller's field is what the JS GC then treats
 * as "freed".
 *
 * @param cs the retained vImageConverter* handle (rdi @0xacece). Passed through
 *           to _CFRelease unchanged (@0xaced3 `jmp _CFRelease`).
 */
export function PCCFRefTraits_vImageConverter_release(cs: vImageConverterRef | null): void {
  // @0xacece..0xaced2  prologue + epilogue (no register clobbers, no local state).
  // @0xaced3           jmp _CFRelease  (ProCore stub 0xde012) — tail-call.
  //
  // No-op in JS: CoreFoundation retain/release lifetime is not represented.
  // The value is intentionally read (via `void cs`) so a caller-supplied null
  // does not trigger a lint warning; _CFRelease itself is documented to no-op
  // on NULL under CoreFoundation, matching the plain tail-jmp with no null-guard
  // in the disassembly.
  void cs;
}
