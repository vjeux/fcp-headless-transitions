// PCCFRefTraits<CGImage*> — ProCore.framework.
//
// The traits struct that `PCCFRef<CGImageRef>` uses to reference-count its handle. Ports ONE
// method:
//   @ProCore 0xacc92  PCCFRefTraits<CGImage*>::release(CGImage*)
//                       __ZN13PCCFRefTraitsIP7CGImageE7releaseES1_
//
// The sibling hook `PCCFRefTraits<CGImage*>::retain(CGImage*)` @ProCore 0xacc88 is its OWN ledger
// unit and is deliberately NOT ported here; it will be ADDED to this file when claimed (one class
// = one file; G6 add-only). Same arrangement as the landed `PCCFRefTraits_CGColorSpace.ts`, which
// holds that instantiation's `retain` and awaits its `release`.
//
// Source disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN13PCCFRefTraitsIP7CGImageE7releaseES1_ ProCore`):
//   raw-port/re/disasm/ProCore.__ZN13PCCFRefTraitsIP7CGImageE7releaseES1_.s (5 lines — the whole
//   function)
//
//   0xacc92  pushq %rbp
//   0xacc93  movq  %rsp, %rbp
//   0xacc96  popq  %rbp
//   0xacc97  jmp   0xde2b8            ## symbol stub for: _CGImageRelease
//
// A trivial TAIL-JUMP: the whole body forwards its one argument (the `CGImageRef` in %rdi, per the
// SysV AMD64 ABI) straight to `_CGImageRelease`, with no null check, no branch, no field access and
// no other callee. The prologue/popq/jmp shape is what clang emits for an inlined-away trait method
// that wraps exactly one extern.
//
// `_CGImageRelease` is a TRUE OUT-OF-SCOPE extern — CoreGraphics.framework, outside the five-
// framework port surface. Modelled with the CG boundary-stub policy already established in-tree by
// the landed `PCCFRefTraits_CGColorSpace.ts` (`_CGColorSpaceRetain`) and `PCCFRef_CFArray.ts`: a JS
// no-op. That is the faithful choice here rather than a throw, and deliberately so on two counts —
//   * SEMANTICS: the observable effect of `CGImageRelease` is a CoreFoundation retain-count
//     decrement on a handle whose bytes are private to CoreGraphics. The port holds a surrogate
//     handle whose lifetime is JS GC's business, so there is no count for it to decrement and
//     nothing about the port's own state changes. A throw would be claiming the function is
//     undecoded, and it is not: it is fully decoded and its one instruction crosses the boundary.
//   * PRECEDENT + GATE: the retain twin landed with exactly this treatment, and G5 classifies this
//     body EMPTY (0 stores, 0 compute, 0 in-frame calls — the `jmp` leaves the frame), for which an
//     incompleteness throw is the REJECT_INCOMPLETE_EMPTY cheat shape, not faithfulness.
//
// CALLEES: the one CoreGraphics extern above, reached through the ProCore symbol stub at 0xde2b8.
// No in-scope callee, no indirect or virtual dispatch (`depgraph.py deps` lists nothing).

/**
 * Opaque CoreGraphics image handle (a `CGImage *`).
 *
 * The bytes behind it are private to CoreGraphics; this port only ever passes it back through CG
 * boundary stubs. Declared here for the same reason `CGColorSpaceRef` is declared in the landed
 * sibling — the two traits instantiations are separate C++ types and neither imports the other.
 */
export interface CGImageRef {
  readonly __brand: "CGImageRef";
}

/**
 * CoreGraphics.framework extern — TRUE out-of-scope boundary stub.
 *
 * `void CGImageRelease(CGImageRef image)`: takes a handle in %rdi and returns nothing, decrementing
 * the image's retain count and freeing it at zero. Modelled as a JS no-op: JS GC owns the surrogate
 * handle's lifetime, so there is no count to decrement and no observable effect on port state.
 *
 * @0xacc97 via ProCore stub 0xde2b8 (the jmp target of PCCFRefTraits&lt;CGImage*&gt;::release)
 */
function _CGImageRelease(_image: CGImageRef | null): void {
  // CoreGraphics-level bookkeeping — no observable JS effect. See the file header for why this is
  // a no-op boundary stub and not a throw.
}

/**
 * `PCCFRefTraits<CGImage*>::release(CGImage*)` — @ProCore 0xacc92
 *   `__ZN13PCCFRefTraitsIP7CGImageE7releaseES1_`
 *
 * The traits hook `PCCFRef<CGImageRef>` calls to drop a reference to its handle.
 *
 * FULL transcription — the disassembly is literally `jmp _CGImageRelease` between a frame prologue
 * and its teardown, so this function is a pure forwarder: the argument passes through untouched and
 * nothing is returned. Note what is NOT there — no `testq %rdi,%rdi` null guard (CGImageRelease
 * tolerates NULL itself), no retain-count read, no store.
 *
 * ORACLE (executed against live FCP, not read). The symbol is exported (`T`), so it was dlsym'd
 * from ProCore in a Rosetta x86_64 process — `arch -x86_64 /usr/bin/python3` — and called against a
 * REAL CoreGraphics image built for the test, with the retain count read through
 * `CFGetRetainCount` on either side of the call:
 *   * count 2 -> 1 after one call, 1 -> released after the next, i.e. the trait really does forward
 *     to `CGImageRelease` and drops exactly ONE reference per call — never two, which is what a
 *     mis-decoded double-release would show;
 *   * calling it with NULL returns normally and does not crash, matching the absence of a null
 *     guard in the body;
 *   * the retain count of an unrelated second image is unchanged, so the call affects only its
 *     argument.
 * The TS port models this boundary as a no-op by policy (see the file header), so what the oracle
 * pins is the FORWARDING TARGET and its arity — the part a reader could get wrong.
 *
 * @param image the `CGImageRef` in %rdi; may be null.
 */
export function PCCFRefTraits_CGImage_release(image: CGImageRef | null): void {
  // 0xacc97  jmp _CGImageRelease — tail-call to the CoreGraphics extern, argument unchanged.
  _CGImageRelease(image);
}
