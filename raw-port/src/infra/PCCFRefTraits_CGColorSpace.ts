// PCCFRefTraits<CGColorSpace*> — ProCore.framework.
// The traits struct that PCCFRef<CGColorSpaceRef> uses to reference-count its
// handle. Ports ONE method:
//   @ProCore 0xacbe8  PCCFRefTraits<CGColorSpace*>::retain(CGColorSpace*)
//
// Source disassembly: raw-port/re/disasm/ProCore.__ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_.s
//
//   0xacbe8  pushq  %rbp
//   0xacbe9  movq   %rsp, %rbp
//   0xacbec  popq   %rbp
//   0xacbed  jmp    0xde1ec                 ## symbol stub for: _CGColorSpaceRetain
//
// This is a trivial tail-jump: the whole body forwards its one argument (the
// CGColorSpaceRef in %rdi, per System-V AMD64 ABI) straight to
// `_CGColorSpaceRetain`. The prologue/popq/jmp pattern is what clang emits for
// an inlined-away trait method that just calls a single extern.
//
// _CGColorSpaceRetain is a TRUE OUT-OF-SCOPE extern (CoreGraphics.framework —
// outside the 5-framework port surface). Per the CGColorSpace boundary-stub
// policy already established in-tree (see raw-port/src/infra/PCCFRef_CFArray.ts
// for the sibling pattern), it is modelled as a JS no-op that returns the
// handle unchanged — JS/GC handles our surrogate lifetime; the retain call is
// a CoreFoundation-level bookkeeping op with no observable effect on the port
// state.
//
// Signature: `CGColorSpaceRef _CGColorSpaceRetain(CGColorSpaceRef cs)` — takes a
// handle in %rdi, returns the same handle in %rax. The CFRetain-family idiom
// specifies "returns the argument unchanged after incrementing its retain
// count", so returning the input is faithful to the boundary.

/** Opaque CoreGraphics color-space handle (a `CGColorSpace *`). The bytes
 *  behind it are private to CoreGraphics; the port only ever passes it back
 *  through CG boundary stubs. */
export interface CGColorSpaceRef {
  readonly __brand: 'CGColorSpaceRef';
}

/**
 * CoreGraphics.framework extern — TRUE out-of-scope boundary stub.
 * Modelled as a JS no-op returning the input handle unchanged. In the real
 * binary this increments a Cocoa/CG retain count; JS GC covers our surrogate
 * lifetime, so no bookkeeping is needed here.
 *
 * @0xacbed via ProCore stub 0xde1ec  (jmp target of PCCFRefTraits<CGColorSpace*>::retain)
 */
function _CGColorSpaceRetain(cs: CGColorSpaceRef | null): CGColorSpaceRef | null {
  // CoreGraphics-level bookkeeping — no observable JS effect.
  return cs;
}

/**
 * PCCFRefTraits<CGColorSpace*>::retain — the traits hook used by
 * PCCFRef<CGColorSpaceRef> to acquire a reference to its handle.
 *
 * The disasm is literally `jmp _CGColorSpaceRetain`, so this function is a
 * pure forwarder: pass the handle through, return whatever the extern returns.
 *
 * @ProCore 0xacbe8  PCCFRefTraits<CGColorSpace*>::retain(CGColorSpace*)
 */
export function PCCFRefTraits_CGColorSpace_retain(
  cs: CGColorSpaceRef | null,
): CGColorSpaceRef | null {
  // 0xacbed  jmp _CGColorSpaceRetain   — tail-call to the CoreGraphics extern.
  return _CGColorSpaceRetain(cs);
}
