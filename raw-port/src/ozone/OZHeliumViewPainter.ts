// OZHeliumViewPainter — Ozone's Helium-backed viewer painter. A tiny adapter that
// holds a back-pointer to the OZViewer it paints for; the actual painting is done
// by `draw(HGGPURenderer*, HGBuffer*)` @Ozone 0x5a57f0 and the transform lookup by
// `getTransform()` @Ozone 0x5a6d10 — both SEPARATE ledger units that later
// worker(s) EXTEND this file with.
//
// Faithful port of the Ozone x86_64 disassembly. Every method cites its
// @Ozone addr. Framework binary: Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone (x86_64 slice; VA == file offset).
//
// Provenance (raw-port/re/disasm/__ZN19OZHeliumViewPainterC1EP8OZViewer.s, 7 lines):
//   OZHeliumViewPainter(OZViewer*)   @0x5a57c0   (C1, the COMPLETE-object ctor)
//     (__ZN19OZHeliumViewPainterC1EP8OZViewer)
//
// ── The class's other symbols (each its OWN ledger unit — NOT ported here) ──
//   0x5a57b0  OZHeliumViewPainter::OZHeliumViewPainter(OZViewer*)   (C2, base-object ctor)
//   0x5a57d0  OZHeliumViewPainter::~OZHeliumViewPainter()            (one dtor variant)
//   0x5a57e0  OZHeliumViewPainter::~OZHeliumViewPainter()            (the other variant)
//   0x5a57f0  OZHeliumViewPainter::draw(HGGPURenderer*, HGBuffer*)
//   0x5a6d10  OZHeliumViewPainter::getTransform()
// The C1 ctor at 0x5a57c0 and the C2 ctor at 0x5a57b0 are DISTINCT addresses
// (16 bytes apart), not an ICF alias; this unit is the C1 variant only.
//
// ── Decoded struct layout (only what THIS ctor writes is pinned) ────────────
//
//   +0x00  ptr  viewer   // OZViewer*  (arg %rsi)   movq %rsi,(%rdi)   @0x5a57c4
//
// Nothing else is touched: the body is prologue, one store, epilogue. In
// particular there is NO vtable-pointer store — the ctor writes the argument
// straight into offset 0 — so this port asserts no vtable and no base
// subobject for the class. Zero callees, zero externs, no indirect or virtual
// calls. Confirmed via
// `depgraph.py deps __ZN19OZHeliumViewPainterC1EP8OZViewer` (no dependency rows).

/** Opaque back-pointer to the owning OZViewer (arg %rsi, stored at +0x00).
 *  Modeled the same way the sibling `OZDisplayTimer` @Ozone 0x62a110 models it:
 *  the class is its own ledger unit, and no instruction here observes a field
 *  of it. */
export type OZViewer = unknown;

export class OZHeliumViewPainter {
  // +0x00  OZViewer* back-pointer (movq %rsi,(%rdi) @0x5a57c4).
  viewer: OZViewer | null;

  /**
   * OZHeliumViewPainter::OZHeliumViewPainter(OZViewer*)
   * @0xADDR Ozone 0x00000000005a57c0
   *   (__ZN19OZHeliumViewPainterC1EP8OZViewer — the C1 complete-object ctor)
   *
   * DECODE (raw-port/re/disasm/__ZN19OZHeliumViewPainterC1EP8OZViewer.s):
   *   0x5a57c0  pushq %rbp                  ; frame
   *   0x5a57c1  movq  %rsp, %rbp
   *   0x5a57c4  movq  %rsi, (%rdi)          ; this->viewer = arg0 (OZViewer*)
   *   0x5a57c7  popq  %rbp
   *   0x5a57c8  retq                        ; void
   *   0x5a57c9  nopl  (%rax)                ; alignment padding
   *
   * The entire body is one store. Under the SysV AMD64 C++ ABI `%rdi` is
   * `this` and `%rsi` is the first declared parameter, so `movq %rsi,(%rdi)`
   * is exactly `this->viewer = viewer` at offset 0 — no vtable install, no
   * base-class ctor call, no zero-fill of any other field.
   */
  constructor(viewer: OZViewer | null) {
    // @0x5a57c4 — movq %rsi,(%rdi)
    this.viewer = viewer;
  }
}
