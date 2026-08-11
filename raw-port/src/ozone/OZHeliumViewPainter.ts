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
// Provenance (raw-port/re/disasm/__ZN19OZHeliumViewPainterD1Ev.s, 6 lines):
//   ~OZHeliumViewPainter()           @0x5a57e0   (D1, the COMPLETE-object dtor)
//     (__ZN19OZHeliumViewPainterD1Ev)
//
// ── The class's other symbols (each its OWN ledger unit — NOT ported here) ──
//   0x5a57b0  OZHeliumViewPainter::OZHeliumViewPainter(OZViewer*)   (C2, base-object ctor)
//   0x5a57d0  OZHeliumViewPainter::~OZHeliumViewPainter()            (D2, base-object dtor)
//   0x5a57f0  OZHeliumViewPainter::draw(HGGPURenderer*, HGBuffer*)
//   0x5a6d10  OZHeliumViewPainter::getTransform()
// The C1 ctor at 0x5a57c0 and the C2 ctor at 0x5a57b0 are DISTINCT addresses
// (16 bytes apart), not an ICF alias; that unit is the C1 variant only. The
// same holds for the two dtors — D2 @0x5a57d0 and D1 @0x5a57e0 are 16 bytes
// apart and byte-identical, ordinary Itanium C1/C2-style dtor aliasing for a
// class with no virtual bases — and the dtor unit below is D1 only.
//
// ── D1 @0x5a57e0: the FULL disasm (4 real insns; 0x5a57e6 is padding) ───────
//   __ZN19OZHeliumViewPainterD1Ev:
//     0x5a57e0  pushq %rbp
//     0x5a57e1  movq  %rsp, %rbp
//     0x5a57e4  popq  %rbp
//     0x5a57e5  retq
//     0x5a57e6  nopw  %cs:(%rax,%rax)   ; padding, not code
//
// The body is EMPTY: prologue, epilogue, return. Nothing is read, nothing is
// written, nothing is called — no base-class dtor call, no member destruction,
// no `::operator delete` (D1 is the complete-object dtor, not D0), and no
// vtable re-install of the kind a polymorphic base dtor emits. So the correct
// port is an empty body, NOT a throw: claiming an undecoded gap here would be
// a lie about the decode. (It is also what the G5 gate checks —
// `classify_disasm` reads the body as EMPTY, and an incompleteness throw over
// an EMPTY disasm is REJECT_INCOMPLETE_EMPTY.)
//
// WHY it is empty follows directly from the ctor decoded below: the object
// holds exactly one pointer and takes no ownership of it (one `movq %rsi,(%rdi)`,
// no allocation, no retain, no refcount bump). A painter that BORROWS its
// viewer has nothing to release, so both destructors are trivial.
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

  /**
   * OZHeliumViewPainter::~OZHeliumViewPainter()
   * @0xADDR Ozone 0x00000000005a57e0
   *   (__ZN19OZHeliumViewPainterD1Ev — the D1 complete-object dtor)
   *
   * DECODE (raw-port/re/disasm/__ZN19OZHeliumViewPainterD1Ev.s):
   *   0x5a57e0  pushq %rbp                  ; frame
   *   0x5a57e1  movq  %rsp, %rbp
   *   0x5a57e4  popq  %rbp
   *   0x5a57e5  retq                        ; void — no body at all
   *   0x5a57e6  nopw  %cs:(%rax,%rax)       ; alignment padding
   *
   * Deliberately empty, and deliberately NOT a throw — the disassembly
   * contains no callq, no tail jmp, no member destruction and no vtable
   * write. See the D1 block in the file header for the full reasoning.
   *
   * `this.viewer` is left exactly as it is, because the machine leaves the
   * +0x00 slot exactly as it is; nulling it would be a change the binary does
   * not make. The pointer is a borrowed back-pointer (the ctor above stores
   * it without retaining), so there is nothing to release.
   *
   * Zero callees, zero externs, no indirect or virtual calls. Confirmed via
   * `depgraph.py deps __ZN19OZHeliumViewPainterD1Ev` (no dependency rows).
   */
  destroy(): void {
    // @0x5a57e0 pushq %rbp / @0x5a57e1 movq %rsp,%rbp — frame setup only.
    // @0x5a57e4 popq %rbp / @0x5a57e5 retq — no body.
  }
}
