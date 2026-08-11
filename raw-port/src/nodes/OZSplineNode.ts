// OZSplineNode.ts — ProChannel's `OZSplineNode`, the curve-graph node that evaluates an OZSpline.
//
// Framework:  /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//             Versions/A/ProChannel  (x86_64 thin slice at /tmp/ProChannel.x86_64; VA == file
//             offset), transcribed from `otool -tV -arch x86_64` and cross-checked byte-by-byte.
//
// This is a FRESH class file and it ports TWO ledger units:
//
//   __ZNK12OZSplineNodeeqERKS_
//     — OZSplineNode::operator==(OZSplineNode const&) const   @ProChannel 0x2a34e
//   __ZNK12OZSplineNode7compareEPK11OZCurveNode
//     — OZSplineNode::compare(OZCurveNode const*) const       @ProChannel 0x2a26e
//
// The second one is here because the first one, ALONE, is a SKELETON and must not be counted
// `ported`: `operator==` is nothing but a virtual dispatch (classify_disasm: DISPATCH_ONLY,
// 0 stores / 0 compute / 1 indirect call), so the real work IS the callee. `compare` @0x2a26e is
// that callee — classify_disasm: REAL, 44 instructions, 4 direct calls, 8 compare-guards — and
// with it here the dispatch lands on a body that computes something. (Reviewer 1 on #644 filed the
// skeleton finding and named this remedy; the two units are one branch because splitting them
// would leave a false completion on main in between.)
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
// THE VTABLE TARGET IS NOW TRANSCRIBED in this same file (see `compare` below). Note that
// `depgraph.py deps` reports NO dependency for the `operator==` unit: the target is reached
// through a vtable, i.e. through DATA, so no call edge exists for it to see — which is why a
// DISPATCH_ONLY symbol was dispensed as a leaf in the first place.
//
// `compare`'s OWN dependencies, all in scope and all resolved:
//   0x29aae  OZConstantNode::compare(OZCurveNode const*) const   PORTED — imported and called
//   0x2d5b2  OZSpline::operator==(OZSpline const&) const         landed as a throw-stub in
//            raw-port/src/channels/OZSpline.m0.ts (`OZSpline.equals`), citing @0x2d5b2; this port
//            CALLS that stub rather than introducing a second one
//   0xacea0  ___dynamic_cast                                     libc++abi RTTI helper, modelled
//            with `instanceof` exactly as the landed OZConstantNode_compare models it @0x29ad5
//
// INHERITANCE, and why it is load-bearing rather than decorative: `OZSplineNode` extends
// `OZConstantNode`. Evidence — the ctor `OZSplineNode::OZSplineNode(OZSpline*, OZCurve*)`
// @0x29cb0 calls `__ZN14OZConstantNodeC2Ed` @0x298be with `%rdi` UNADJUSTED (base sub-object at
// offset 0) before installing its own vtable @0xd4fe0; and `compare` @0x2a2a7 calls
// `OZConstantNode::compare` non-virtually with the same unadjusted `this`. The TS hierarchy has to
// say so, because `OZConstantNode::compare` decides on `dynamic_cast<OZConstantNode*>(other)`:
// model OZSplineNode as unrelated and that cast fails for an OZSplineNode argument, which would
// silently turn every equal pair into `0`. (`new OZSplineNode(...)` is not usable yet — the
// inherited ctor's base copy-ctor is still a frontier stub — so construct with
// `Object.create(OZSplineNode.prototype)` until the ctor units land. The prototype chain, which is
// what `instanceof` reads, is established by the declaration and does not need the ctor to run.)
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

import { OZConstantNode, OZConstantNode_compare } from "./OZConstantNode.js";
import { OZSpline } from "../channels/OZSpline.m0.js";

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
export class OZSplineNode extends OZConstantNode {
  /**
   * +0x18 — the OWNED `OZSpline*`. Recovered from `OZSplineNode::allocOZSpline(OZSpline*)`
   * @ProChannel 0x29d0e, which `operator new`s 0xb0 bytes (@0x29d1e `movl $0xb0,%edi`), copy- or
   * default-constructs into it (@0x29d41 / @0x29d4e) and stores the result with
   * `movq %rbx, 0x18(%r14)` @0x29d53; and corroborated by `operator=` @0x2a302, which destroys
   * `0x18(%rbx)` through its vtable +0x08 and then clears the slot to 0 (@0x2a323).
   * NULL is a legal value and is the case `compare` below spends most of its instructions on.
   */
  public spline: OZSpline | null = null;

  /**
   * `OZSplineNode::compare(OZCurveNode const*) const` — @ProChannel 0x2a26e
   * (`__ZNK12OZSplineNode7compareEPK11OZCurveNode`), the resolved target of this class's vtable
   * slot +0x70 (vtable @0xd4fd0, installed ptr 0xd4fe0).
   *
   * FULL DISASM (44 instructions, 0x2a26e..0x2a301; re-derive with
   * `otool -tv -arch x86_64 -p __ZNK12OZSplineNode7compareEPK11OZCurveNode /tmp/ProChannel.x86_64`):
   *
   *   0x2a279  movq  %rdi, %r14                 ; r14 = this
   *   0x2a27c  testq %rsi, %rsi                 ; other == nullptr ?
   *   0x2a27f  je    0x2a2e5                    ;   -> the null path, below
   *   0x2a281  movq  %rsi, %r12                 ; r12 = other
   *   0x2a284  leaq  __ZTI11OZCurveNode(%rip), %rsi
   *   0x2a28b  leaq  __ZTI12OZSplineNode(%rip), %rdx
   *   0x2a292  xorl  %ebx, %ebx                 ; result = 0
   *   0x2a294  movq  %r12, %rdi
   *   0x2a297  xorl  %ecx, %ecx                 ; src2dst hint = 0
   *   0x2a299  callq ___dynamic_cast            ; r15 = dynamic_cast<OZSplineNode const*>(other)
   *   0x2a29e  movq  %rax, %r15
   *   0x2a2a1  movq  %r14, %rdi
   *   0x2a2a4  movq  %r12, %rsi
   *   0x2a2a7  callq 0x29aae                    ; al = OZConstantNode::compare(this, other)
   *   0x2a2ac  testb %al, %al                   ;   NON-virtual, `this` UNADJUSTED -> the base
   *   0x2a2ae  je    0x2a2f7                    ;   sub-object is at offset 0
   *   0x2a2b0  testq %r15, %r15                 ; cast failed ?
   *   0x2a2b3  je    0x2a2f5                    ;   -> return 0
   *   0x2a2b5  movq  0x18(%r14), %rdi           ; rdi = this->spline
   *   0x2a2b9  testq %rdi, %rdi
   *   0x2a2bc  sete  %al                        ; al = (this->spline == null)
   *   0x2a2bf  movq  0x18(%r15), %rsi           ; rsi = cast->spline
   *   0x2a2c3  testq %rsi, %rsi
   *   0x2a2c6  sete  %cl                        ; cl = (cast->spline == null)
   *   0x2a2c9  orb   %al, %cl                   ; cl = EITHER is null
   *   0x2a2cb  movq  %rdi, %rax
   *   0x2a2ce  orq   %rsi, %rax
   *   0x2a2d1  sete  %bl                        ; result = BOTH are null
   *   0x2a2d4  testb %cl, %cl
   *   0x2a2d6  jne   0x2a2f7                    ; either null -> return that result
   *   0x2a2d8  callq 0x2d5b2                    ; al = OZSpline::operator==(*this->spline, *cast->spline)
   *   0x2a2dd  movb  $0x1, %bl                  ; result = 1 …
   *   0x2a2df  testb %al, %al
   *   0x2a2e1  je    0x2a2f5                    ; … unless the splines differ -> 0
   *   0x2a2e3  jmp   0x2a2f7
   *   0x2a2e5  xorl  %ebx, %ebx                 ; --- the null path ---
   *   0x2a2e7  movq  %r14, %rdi
   *   0x2a2ea  xorl  %esi, %esi
   *   0x2a2ec  callq 0x29aae                    ; OZConstantNode::compare(this, nullptr)
   *   0x2a2f1  testb %al, %al
   *   0x2a2f3  je    0x2a2f7                    ; both arms return 0 — the call is still MADE
   *   0x2a2f5  xorl  %ebx, %ebx
   *   0x2a2f7  movl  %ebx, %eax ; ret
   *
   * SEMANTICS. Return 1 iff ALL of:
   *   other != nullptr, OZConstantNode::compare(this, other) is true (which is itself
   *   `dynamic_cast<OZConstantNode*>(other) != null && value == other.value &&
   *    defaultValue == other.defaultValue`, NaN defeating both), other IS-A OZSplineNode, and
   *   the two `spline` pointers are either BOTH null or compare equal by value.
   * Exactly one null spline gives 0. The null-`other` path returns 0 on BOTH of its arms — the
   * base call is made for its (absent) effect and its result is discarded; that is transcribed
   * rather than folded away, because folding it would remove an observable call.
   *
   * `___dynamic_cast` (@ProChannel stub 0xacea0, `xorl %ecx,%ecx` = the general hint) is the
   * libc++abi RTTI helper. It is modelled with `instanceof`, exactly as the landed sibling
   * `OZConstantNode_compare` @0x29aae models the same helper at its own call site @0x29ad5 —
   * `dynamic_cast<OZSplineNode const*>(other)` succeeds precisely when `other` is-a OZSplineNode.
   *
   * THIS METHOD IS THE VTABLE SLOT +0x70, so it stays a method (not a free function): a subclass
   * override is what `operatorEquals` must dispatch to, which is the property measured in the
   * probe.
   * @0x2a26e
   */
  compare(other: OZCurveNodeRef | OZConstantNode | null): number {
    // @0x2a27c/0x2a27f — testq %rsi,%rsi ; je 0x2a2e5
    if (other === null || other === undefined) {
      // @0x2a2e5 xorl %ebx,%ebx — result = 0
      // @0x2a2ec — the base compare is still CALLED, with nullptr.
      OZConstantNode_compare(this, null);
      // @0x2a2f3 je / @0x2a2f5 xorl %ebx,%ebx — both arms land on `return 0`.
      return 0;
    }
    // @0x2a292 xorl %ebx,%ebx — result = 0
    // @0x2a299 ___dynamic_cast(other, typeinfo OZCurveNode, typeinfo OZSplineNode, 0)
    const cast: OZSplineNode | null = other instanceof OZSplineNode ? other : null;
    // @0x2a2a7 callq 0x29aae — OZConstantNode::compare(this, other), NON-virtual, `this` unadjusted
    const base = OZConstantNode_compare(this, other as unknown as OZConstantNode);
    // @0x2a2ac/0x2a2ae — testb %al,%al ; je -> return ebx (still 0)
    if (base === 0) return 0;
    // @0x2a2b0/0x2a2b3 — testq %r15,%r15 ; je 0x2a2f5 -> xorl %ebx,%ebx ; return 0
    if (cast === null) return 0;
    // @0x2a2b5..@0x2a2c6 — sete %al / sete %cl on the two spline pointers
    const thisNull = this.spline === null || this.spline === undefined;
    const castNull = cast.spline === null || cast.spline === undefined;
    // @0x2a2c9 orb %al,%cl — either is null
    const eitherNull = thisNull || castNull;
    // @0x2a2cb..@0x2a2d1 — `orq` then `sete %bl`: the OR of two pointers is zero iff BOTH are null
    const bothNull = thisNull && castNull;
    // @0x2a2d4/@0x2a2d6 — testb %cl,%cl ; jne 0x2a2f7 — return the both-null result
    if (eitherNull) return bothNull ? 1 : 0;
    // @0x2a2d8 callq 0x2d5b2 — OZSpline::operator==(OZSpline const&) const. A landed sibling in
    // raw-port/src/channels/OZSpline.m0.ts, where it is still a throw-stub citing @0x2d5b2; this
    // call reaches THAT stub rather than introducing a new one.
    const same = (this.spline as OZSpline).equals(cast.spline as OZSpline);
    // @0x2a2dd movb $0x1,%bl ; @0x2a2df/@0x2a2e1 testb %al,%al ; je 0x2a2f5 -> 0
    return same ? 1 : 0;
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
    // @0x2a35a — jmpq *%rax with %rsi (the other node) passed through UNCHANGED, reinterpreted as
    //   the OZCurveNode base at offset 0. No pointer adjustment appears because the base is at 0,
    //   so the argument crosses unmodified — no cast is needed on this side either.
    return this.compare(other);
  }
}
