// PCCFRefTraits_vImageConverter.ts — ProCore free function:
//   PCCFRefTraits<vImageConverter*>::release(vImageConverter*)  @ProCore 0xacece
//
// One tiny thunk (4 real instructions after prologue) that tail-jmps to CoreFoundation
// _CFRelease. It's the CFRelease-family primitive used by the PCCFRef<vImageConverter*>
// RAII wrapper to drop a retained vImageConverterRef (Accelerate.framework's opaque
// vImage colour-conversion handle, which is a CFType and therefore CFRetain/CFRelease-able).
//
// Symbol: __ZN13PCCFRefTraitsIP15vImageConverterE7releaseES1_   @ProCore 0xacece
// Disasm: raw-port/re/disasm/ProCore.__ZN13PCCFRefTraitsIP15vImageConverterE7releaseES1_.s
//
//   0xacece  pushq %rbp
//   0xacecf  movq  %rsp, %rbp
//   0xaced2  popq  %rbp
//   0xaced3  jmp   _CFRelease                 ; ProCore symbol stub 0xde012
//
// The function does NO real work — it exists purely so PCCFRefTraits<T>'s templated
// RAII destructor can dispatch through a T-specific `release` symbol whose ABI
// (single-arg, void return, tail-jmp) is uniform across every T. The choice of
// _CFRelease vs a type-specific release (e.g. _CGColorSpaceRelease for CGColorSpace*)
// is a per-instantiation compile-time decision: for vImageConverter* the compiler
// emits a _CFRelease tail-jmp because vImageConverter is a CFType.
//
// Peer instantiation on file for cross-check: `PCCFRefTraits<CGColorSpace*>::release`
// @ProCore 0xacbf2 in `raw-port/src/infra/PCColorSpaceHandle.ts` — identical prologue+
// tail-jmp shape, differing only in the stub-target (_CGColorSpaceRelease vs _CFRelease)
// because CGColorSpace's release is exposed under a type-specific symbol while
// vImageConverter drops through to the generic CFRelease.
//
// EXTERNS:
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
