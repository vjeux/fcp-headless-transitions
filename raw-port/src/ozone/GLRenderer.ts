// raw-port/src/ozone/GLRenderer.ts
//
// FCP `GLRenderer` — Ozone.framework's top-level render driver (owner of the
// render-graph traversal: cacheBitmap, getFrameNode, renderImageFromNode,
// enter/leaveDesperationMode, etc.). This file ports ONLY the two-int
// constructor C1 (complete-object variant); the rest of the class body is
// tracked by separate ledger entries and will be added here (ADD-ONLY) as
// those units are claimed. One class per file (PORTING_SPEC Rule 6).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone.
//
// DISASSEMBLY — both slices agree the body is EMPTY (a trivial ctor):
//   x86_64  __ZN10GLRendererC1Eii @Ozone 0x23a970:
//     0x23a970  pushq %rbp
//     0x23a971  movq  %rsp, %rbp
//     0x23a974  popq  %rbp
//     0x23a975  retq
//   arm64   __ZN10GLRendererC1Eii @Ozone 0x1ec654:
//     0x1ec654  ret
//
// The (int, int) constructor writes NO fields and calls NOTHING — the two
// integer arguments are consumed and discarded. (The sibling C2 base-object
// ctor @0x1ec650 and the destructors D1/D2 @0x1ec658/0x1ec65c are likewise
// bare `ret` in the arm64 slice.) There is no struct state to model from this
// unit: the object is left in its default (zero/empty) state. Later member
// functions that DO touch GLRenderer fields will introduce those fields into
// this class as their disassemblies are ported.

/**
 * `GLRenderer` — Ozone render driver. Only the complete-object constructor
 * `GLRenderer(int, int)` is ported here; it is a trivial (empty) ctor.
 */
export class GLRenderer {
  /**
   * `GLRenderer::GLRenderer(int, int)` [C1 complete-object] —
   * @Ozone 0x1ec654 (arm64) / 0x23a970 (x86_64)  (__ZN10GLRendererC1Eii).
   *
   * Faithful transcription of an EMPTY constructor body: the disassembly is
   * only the frame prologue/epilogue and `ret` — no field is written and no
   * callee is invoked. The two integer parameters are ignored by this ctor.
   *
   * @param _a  first int argument (unused by the ctor body).
   * @param _b  second int argument (unused by the ctor body).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_a: number, _b: number) {
    // @0x1ec654 (arm64) / 0x23a970..0x23a975 (x86_64): prologue + ret only.
    // No field writes, no calls — the object is left in its default state.
  }
}
