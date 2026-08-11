// HGTraversal::IterativeUniqueTraversal<(HGTraversal::NodeInput)1,
//   (HGTraversal::IteratorOrder)1, (HGTraversal::TraversalOrder)1,
//   (HGTraversal::InputOrder)1>::Visitor — Helium node-graph traversal callback.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice). Disassembly source:
//   raw-port/re/disasm/Helium.__ZN11HGTraversal24IterativeUniqueTraversalILNS_9NodeInputE1ELNS_13IteratorOrderE1ELNS_14TraversalOrderE1ELNS_10InputOrderE1EE7Visitor9terminateEP10HGRendererP6HGNode.s
//
// FILE NAME: the C++ class is a NESTED class of a TEMPLATE INSTANTIATION, so the
// name flattens both, following the two conventions already on main —
// `Outer__Inner` for nesting (PORTING_SPEC; precedent PCBezierNamespace__SampledContour.ts)
// and underscore-joined template arguments (precedent
// std__tuple_less_4_CGColorSpace_AlphaFormat.ts, PCMatrix44Tmpl.ts). The four
// trailing `_1`s are the four non-type template arguments in declaration order:
// NodeInput=1, IteratorOrder=1, TraversalOrder=1, InputOrder=1. Each of the other
// SEVEN instantiations of this Visitor in Helium is a DIFFERENT C++ class with its
// own address and its own ledger entry — they are NOT this file's scope:
//   @0xa3be0 <0,0,0,0>   @0xa4880 <0,0,1,1>   @0xa4060 <0,1,1,1>   @0x1b2d0 <1,0,0,0>
//   @0xa56d0 <1,0,1,1>   and the sibling templates IterativeTraversal<1,0>::Visitor
//   @0xa38c0 and RecursiveTraversal<1,0>::Visitor @0x1b270.
// (Confirmed distinct addresses, i.e. NOT ICF-folded: `nm -arch x86_64` lists
// exactly one symbol at 0xa51c0.)
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN11HGTraversal24IterativeUniqueTraversalILNS_9NodeInputE1ELNS_13IteratorOrderE1E
//     LNS_14TraversalOrderE1ELNS_10InputOrderE1EE7Visitor9terminateEP10HGRendererP6HGNode
//       — …::Visitor::terminate(HGRenderer*, HGNode*) @Helium 0xa51c0
//
// NOT ported here (separate ledger entries, this file is ADD-ONLY):
//   * …::Visitor::visitNode(HGRenderer*, HGNode*) @Helium 0xa51b0 — vtable slot *0x00.
//   * …::IterativeUniqueTraversal<1,1,1,1>::operator()(HGRenderer*, HGNode*, Visitor&)
//     @Helium 0xa51d0 — the 342-line driver that owns the deque walk.
//
// -----------------------------------------------------------------------------
// LAYOUT
// -----------------------------------------------------------------------------
// Visitor {
//   void** __vptr;   // +0x00 — `vtable for …::Visitor` @Helium 0xa0c168, the
//                    // Itanium-ABI payload pointer the ctor would install being
//                    // 0xa0c178 (= vtable + 0x10, past offset-to-top and RTTI).
//                    // Slot map (raw-port/army/tools/vtable.py Helium <class>):
//                    //     *0x00 -> 0xa51b0  visitNode(HGRenderer*, HGNode*)
//                    //     *0x08 -> 0xa51c0  terminate(HGRenderer*, HGNode*)  <- this file
// }
// No data member is decoded: `terminate` does not dereference `this` (or either
// argument) at all, so nothing beyond the vtable pointer is grounded, and
// PORTING_SPEC Rule 5 forbids naming bytes no instruction touches.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   terminate — none. The body contains no call of any kind.

import type { HGRenderer } from "./HGRenderer";
import type { HGNode } from "./HGNode";

/**
 * `HGTraversal::IterativeUniqueTraversal<(NodeInput)1, (IteratorOrder)1,
 * (TraversalOrder)1, (InputOrder)1>::Visitor` — the callback object the
 * matching `operator()` @Helium 0xa51d0 drives while it walks a node graph.
 * This file ports `terminate` only (see the header); `visitNode` @0xa51b0 is a
 * separate ledger entry and will be ADDED to this same file when claimed.
 */
export class HGTraversal__IterativeUniqueTraversal_1_1_1_1__Visitor {
  /**
   * `…::Visitor::terminate(HGRenderer*, HGNode*)` @Helium 0xa51c0
   *
   * Full 7-line body (raw-port/re/disasm/Helium.__ZN11HGTraversal24Iterative…
   * …7Visitor9terminateEP10HGRendererP6HGNode.s):
   *
   *   0xa51c0  pushq %rbp                 ; frame prologue
   *   0xa51c1  movq  %rsp, %rbp
   *   0xa51c4  xorl  %eax, %eax           ; return value = 0
   *   0xa51c6  popq  %rbp                 ; epilogue
   *   0xa51c7  retq
   *   0xa51c8  nopl  (%rax,%rax)          ; padding — not executed
   *
   * SEMANTICS — this instantiation's early-out hook is the "never terminate"
   * default: it returns 0 unconditionally, reading neither `this` (%rdi) nor
   * the renderer (%rsi) nor the node (%rdx). Every instruction of the body is
   * transcribed below; there is nothing else in it.
   *
   * The return type is `bool`, pinned by the CALL SITE rather than by the
   * mangling (an Itanium mangled name does not encode the return type): the
   * driver `…IterativeUniqueTraversal<1,1,1,1>::operator()` @Helium 0xa51d0
   * invokes this through vtable slot *0x08 and immediately tests only the low
   * byte —
   *
   *   0xa551e  movq  (%rdi), %rax         ; rax = visitor->__vptr
   *   0xa5525  callq *0x8(%rax)           ; -> terminate(renderer, node)
   *   0xa5528  testb %al, %al             ; BYTE-wide test: a bool
   *   0xa552a  jne   0xa5565              ; true -> leave the walk
   *
   * — so returning `false` here means the walk always runs to completion for
   * this instantiation. `xorl %eax, %eax` zeroes the full 64-bit %rax, so the
   * answer is 0 in AL and in RAX alike.
   *
   * ORACLE — differential against the live Helium binary, 1,500 cases, 0
   * divergences (raw-port/re/oracle/
   * HGTraversal__IterativeUniqueTraversal_1_1_1_1__Visitor_terminate_oracle.py).
   * This symbol is LOCAL (`nm -arch x86_64` type `t`), so dlsym cannot reach it;
   * the harness dlopens Helium under `arch -x86_64 /usr/bin/python3` and calls it
   * BY ADDRESS at `slide + 0xa51c0`. Because an address call would silently hit
   * unrelated code in the wrong slice (OPS_LOG "wrong architecture"), the harness
   * first asserts the process is x86_64 AND that the 8 bytes at the call target
   * are exactly the transcribed encoding `55 48 89 e5 31 c0 5d c3`, refusing to
   * run otherwise. Cases: 1,500 calls over (a) all-null arguments, (b) random
   * 48-bit junk pointers, and (c) real 0x5A-filled 64-byte buffers — every call
   * returned 0 in both RAX and AL, and every argument buffer came back
   * unmodified, confirming the body reads and writes nothing.
   * HARNESS SENSITIVITY (the control that matters for a constant function):
   * calling `HGRenderJob::GetUserName` @0x54820 through the SAME CFUNCTYPE
   * returned the non-zero sentinel pointer, so the harness genuinely reads
   * %rax and the zeros above are the real `xorl`, not a default.
   * NEGATIVE CONTROLS (300 cases): a port returning true -> 300 wrong; a port
   * returning the low byte of the HGNode* argument -> 300 wrong.
   *
   * @param _renderer HGRenderer* (SysV %rsi) — never read by this body.
   * @param _node     HGNode* (SysV %rdx) — never read by this body.
   * @returns false, always — this instantiation never asks the walk to stop.
   */
  terminate(_renderer: HGRenderer | null, _node: HGNode | null): boolean {
    // ------------------------------------------------------------
    // @0xa51c0..0xa51c1 — prologue (no TS-visible effect).
    // @0xa51c4 — xorl %eax, %eax : return value = 0 (the caller tests AL).
    // @0xa51c6..0xa51c7 — epilogue + retq.
    // ------------------------------------------------------------
    return false;
  }
}
