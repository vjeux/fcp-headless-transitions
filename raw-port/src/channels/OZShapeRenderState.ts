// OZShapeRenderState.ts — FCP Flexo class OZShapeRenderState.
// Transcribed from the x86_64 disassembly of Flexo in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//   Versions/A/Flexo
// (see raw-port/re/disasm/Flexo.OZShapeRenderState.~OZShapeRenderState.s).
//
// PROVENANCE / DECODE:
//   Symbols found in Flexo (from nm | c++filt):
//     0x5ff830 t OZShapeRenderState::~OZShapeRenderState()   (D1 complete-object dtor)
//   The ledger currently lists exactly ONE method for this class (its D1 dtor); no ctor,
//   accessor, or other method is present in Flexo's symbol table so we cannot deduce the
//   full struct layout — only the field(s) actually touched by the dtor.
//
// Stub table entries used (resolve.py Flexo stub <addr>):
//   0x149630c  __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
//              PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*)
//
// Struct layout (partial, recovered from the D1 dtor @0x5ff830 which does
// `movq 0x50(%rdi), %rdi; testq %rdi, %rdi; je .end; callq
//  PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*)`):
//   +0x50  colorSpace : CGColorSpace*  (raw CG pointer; non-null branch calls release traits)
//   (all other fields — expected: shape-geometry buffers, transform, cached bounds — are
//    NOT decodable from the dtor alone; they will surface when a ctor/accessor lands.)
//
// The dtor does NOT release any other members and does NOT call a base-class dtor:
// the disasm is a straight-line free of exactly one CGColorSpace* handle at +0x50, then
// the `movq %rax, %rdi; callq ___clang_call_terminate` landing pad for exception unwind.
// (See the exact 12-line disassembly file cited above.)

// ---------------------------------------------------------------------------
// External stub — kept ungrounded (throws), mirroring the sibling PCColor /
// PCImageAttributes port style. PCCFRefTraits<CGColorSpace*>::release is a
// free traits function (`static void release(CGColorSpace*)`) that
// internally calls CGColorSpaceRelease when the pointer is non-null; the
// exact body lives in ProCore and is not yet transcribed.
// ---------------------------------------------------------------------------

/**
 * `PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*)` — external stub
 * for __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_, called via the
 * Flexo __stubs entry @0x149630c from OZShapeRenderState::~OZShapeRenderState
 * @0x5ff83d. Not yet transcribed.
 */
function PCCFRefTraits_CGColorSpace_release_stub(_p: unknown): void {
  throw new Error(
    "PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*) @Flexo stub 0x149630c " +
      "(__ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_) not yet transcribed",
  );
}

// ---------------------------------------------------------------------------
// The class
// ---------------------------------------------------------------------------

/**
 * `OZShapeRenderState` — Ozone shape render state. Only the +0x50 CGColorSpace*
 * field is decoded so far (from the dtor); further fields become known when a
 * ctor/accessor is added to the disassembly corpus.
 */
export interface OZShapeRenderState {
  /** @Flexo OZShapeRenderState +0x50 — `CGColorSpace*` released by the dtor.
   *  Loaded @0x5ff834 (`movq 0x50(%rdi), %rdi`), null-checked @0x5ff838
   *  (`testq %rdi, %rdi; je .end`), released @0x5ff83d via
   *  PCCFRefTraits<CGColorSpace*>::release. */
  colorSpace: unknown;
}

/**
 * `OZShapeRenderState::~OZShapeRenderState()` — D1 complete-object destructor,
 * @Flexo 0x5ff830. Transcribed line-for-line from the 12-line disassembly:
 *
 *     __ZN18OZShapeRenderStateD1Ev:
 *     0x5ff830  pushq  %rbp
 *     0x5ff831  movq   %rsp, %rbp
 *     0x5ff834  movq   0x50(%rdi), %rdi        ; rdi = this->colorSpace
 *     0x5ff838  testq  %rdi, %rdi              ; if (colorSpace == nullptr)
 *     0x5ff83b  je     0x5ff842                ;   goto .end
 *     0x5ff83d  callq  0x149630c               ; PCCFRefTraits<CGColorSpace*>::release
 *     0x5ff842  popq   %rbp                    ; .end:
 *     0x5ff843  retq
 *     0x5ff844  movq   %rax, %rdi              ; landing pad (unreachable in TS)
 *     0x5ff847  callq  ___clang_call_terminate
 *     0x5ff84c  nopl   (%rax)
 *
 * The exception landing pad (0x5ff844-0x5ff84c) has no observable effect in
 * normal control flow — it fires only if an in-flight destructor throws while
 * this frame is being unwound, which cannot happen from the single non-throwing
 * call in the transcribed body — so it is not modeled in TS.
 */
export function OZShapeRenderState_dtor(self: OZShapeRenderState): void {
  // 0x5ff834  movq 0x50(%rdi), %rdi
  const colorSpace = self.colorSpace;
  // 0x5ff838  testq %rdi, %rdi ; je end
  if (colorSpace !== null && colorSpace !== undefined) {
    // 0x5ff83d  callq PCCFRefTraits<CGColorSpace*>::release
    PCCFRefTraits_CGColorSpace_release_stub(colorSpace);
  }
  // 0x5ff842  popq %rbp ; retq  — return.
}
