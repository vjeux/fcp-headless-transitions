// OZSplineNode.ts — ProChannel's `OZSplineNode`, the curve-graph node that evaluates an OZSpline.
//
// Framework:  /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//             Versions/A/ProChannel  (x86_64 thin slice at /tmp/ProChannel.x86_64; VA == file
//             offset), transcribed from `otool -tV -arch x86_64` and cross-checked byte-by-byte.
//
// This is a FRESH class file and it ports ONE ledger unit:
//
//   __ZNK12OZSplineNodeeqERKS_
//     — OZSplineNode::operator==(OZSplineNode const&) const   @ProChannel 0x2a34e
//
// The other 30-odd OZSplineNode symbols the inventory lists (the four ctors @0x29cb0/0x29d7e/
// 0x29d88/0x29e04, the dtors, allocOZSpline @0x29d0e, createSpline @0x29ee2, getMin/MaxValue,
// getCurrentRange, reset, solveNode x2, getUForValue, cloneNode @0x2a1d6, compare @0x2a26e, ...)
// are SEPARATE ledger units and are deliberately absent. Per the one-class-one-file rule they get
// ADDED to this file when their units are claimed — do not create a sibling file, and do not delete
// what is here (G6 add-only). Placed in src/nodes/ next to its siblings OZCurveNode.ts and
// OZConstantNode.ts, which is where this family already lives.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZNK12OZSplineNodeeqERKS_.s) — the whole method is a
// virtual dispatch, so the bytes are quoted: every operand here is an addressing mode, and otool
// renders those through its symbolizer.
// ─────────────────────────────────────────────────────────────────────────────────────────────
//   0x2a34e  55              pushq %rbp                 ; prologue
//   0x2a34f  48 89 e5        movq  %rsp, %rbp
//   0x2a352  48 8b 07        movq  (%rdi), %rax         ; rax = this->vptr   (the RECEIVER's)
//   0x2a355  48 8b 40 70     movq  0x70(%rax), %rax     ; rax = vtable[+0x70]
//   0x2a359  5d              popq  %rbp                 ; epilogue BEFORE the jump
//   0x2a35a  ff e0           jmpq  *%rax                ; TAIL-CALL: the callee returns straight
//                                                       ; to operator=='s caller, with %rdi (this)
//                                                       ; and %rsi (the other node) untouched
//
// THE VTABLE SLOT IS RESOLVED, not guessed (PORTING_SPEC Rule 2):
//
//   army/tools/resolve.py ProChannel vtable OZSplineNode 0x70
//     # OZSplineNode vtable @0xd4fd0; installed ptr 0xd4fe0
//       *0x70 -> 0x2a26e  OZSplineNode::compare(OZCurveNode const*) const
//
// So `a == b` IS `a.compare(&b)`, dispatched virtually. Two consequences the port has to keep:
//   * the dispatch goes through the RECEIVER's vtable, so a subclass override of slot +0x70 is
//     what runs — this is not a direct call to OZSplineNode::compare and must not be modelled as
//     one (measured below with two different vtables);
//   * the argument is passed through unchanged and reinterpreted from `OZSplineNode const&` to
//     `OZCurveNode const*` — an upcast to the base at offset 0, which is why no pointer adjustment
//     appears. The same vtable's +0x60 slot holds `OZCurveNode::getNeededTime`, confirming
//     single inheritance with the base sub-object at offset 0.
//
// FRONTIER CALLEE — `OZSplineNode::compare(OZCurveNode const*) const` @ProChannel 0x2a26e is its
// own ledger unit and is not transcribed yet, so the slot below throws citing @0x2a26e. Note
// that `depgraph.py deps` reports NO dependency for this unit: the target is reached through a
// vtable, i.e. through DATA, so no call edge exists for it to see.
//
// STRUCT LAYOUT recoverable from this method — exactly one slot:
//   OZSplineNode {
//     +0x00  void** vptr   ; loaded @0x2a352; only its +0x70 entry is used here
//     ...                  ; everything else OPAQUE and deliberately NOT modelled
//   }
//
// ORACLE (executed, not read — raw-port/re/oracle/OZSplineNode_operatorEquals_probe.py). The body
// is nothing but a dispatch, so the differential is over the dispatch: a FAKE vtable whose +0x70
// slot is a ctypes callback records what arrives and what comes back. The symbol is `T`, but it was
// still called BY ADDRESS at slide+0x2a34e under `arch -x86_64` after checking the 14 opcode bytes
// above against BOTH the mapped image and the on-disk thin slice. Live ProChannel:
//   * passed %rdi = the receiver and %rsi = the argument through UNCHANGED, every call;
//   * returned the callee's value verbatim — 0x00, 0x01 and 0xff all came back as-is, which is
//     what a tail-call means and what a port that re-normalised the result to a boolean would
//     lose;
//   * with the ARGUMENT carrying a different vtable, still dispatched through the RECEIVER's;
//   * never touched slots +0x68 or +0x78 (both loaded with 0xdeadbeef), so the slot is +0x70.

/**
 * `OZCurveNode` — the base of the curve-node family (ProChannel). Opaque here: this unit only needs
 * it as the parameter type of the `compare` slot, and its layout is decoded in
 * raw-port/src/nodes/OZCurveNode.ts, not re-derived here.
 */
export interface OZCurveNodeRef {
  readonly __brand: "OZCurveNode";
}

/**
 * `OZSplineNode` — curve-graph node backed by an OZSpline.
 *
 * Only the +0x00 vptr slot is decoded here (see the file header); every other field is opaque and
 * intentionally not modelled, and will be added as sibling methods are ported.
 */
export class OZSplineNode {
  /**
   * `OZSplineNode::compare(OZCurveNode const*) const` — @ProChannel 0x2a26e, the resolved target of
   * this class's vtable slot +0x70 (vtable @0xd4fd0, installed ptr 0xd4fe0).
   *
   * A SEPARATE, not-yet-transcribed ledger unit. Declared here as a virtual so `operatorEquals`
   * below can dispatch through it exactly as the machine does — a subclass that overrides the slot
   * overrides this method — and it throws citing the address so the gap stays visible to depgraph
   * instead of silently answering.
   *
   * The return type is the raw byte the callee leaves in %al: `operator==` tail-jumps, so whatever
   * the slot returns is what the caller sees, and the live measurement (file header) shows 0xff
   * coming back unchanged. Modelling it as `boolean` here would quietly normalise a value the
   * machine does not.
   */
  compare(_other: OZCurveNodeRef): number {
    throw new Error(
      "OZSplineNode::compare(OZCurveNode const*) const @ProChannel 0x2a26e " +
        "(__ZNK12OZSplineNode7compareEPK11OZCurveNode) is a separate ledger unit and is not " +
        "transcribed yet — reached from OZSplineNode::operator== @ProChannel 0x2a34e as the " +
        "tail-jump @0x2a35a through vtable slot +0x70 (vtable @0xd4fd0).",
    );
  }

  /**
   * `OZSplineNode::operator==(OZSplineNode const&) const` — @ProChannel 0x2a34e
   * (`__ZNK12OZSplineNodeeqERKS_`).
   *
   * Line-for-line transcription of the 6-instruction body quoted in the file header: load the
   * receiver's vtable, take slot +0x70, and TAIL-JUMP to it with (this, other) unchanged.
   *
   * Named `operatorEquals` because TypeScript has no operator overloading; the C++ spelling and its
   * mangled symbol are in the header so the ledger keys on the address, not the name.
   *
   * THE RESULT IS NOT NORMALISED. Because @0x2a359 pops the frame BEFORE @0x2a35a jumps, the
   * callee's %al is returned to operator=='s caller untouched — measured as 0x00/0x01/0xff coming
   * back verbatim. So this returns the callee's `number`, not a `boolean`; a caller wanting the
   * C++ truth value tests it against zero exactly as the compiled caller would.
   */
  operatorEquals(other: OZSplineNode): number {
    // @0x2a352-0x2a355 — rax = this->vptr[+0x70]. Virtual on the RECEIVER, so an override runs.
    // @0x2a35a — jmpq *%rax with %rsi (the other node) passed through, reinterpreted as the
    //   OZCurveNode base at offset 0. No pointer adjustment appears because the base is at 0.
    return this.compare(other as unknown as OZCurveNodeRef);
  }
}
