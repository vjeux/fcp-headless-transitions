// OZChanSceneNodeRef.ts — the FCP Ozone class `OZChanSceneNodeRef`, the
// channel type that holds a reference to another node in the scene graph.
//
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
// Versions/A/Ozone.
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/
//     __ZN18OZChanSceneNodeRef27setAllowsCyclicDependenciesEb.s  (ported here)
//     __ZNK18OZChanSceneNodeRef27getAllowsCyclicDependenciesEv.s (layout evidence)
//
// SYMBOL PORTED IN THIS UNIT
//   0x001b37c0 T __ZN18OZChanSceneNodeRef27setAllowsCyclicDependenciesEb
//               OZChanSceneNodeRef::setAllowsCyclicDependencies(bool)
//
// SIBLING SYMBOLS OF THIS CLASS (each its own ledger unit, all still `todo`,
// deliberately NOT written here):
//   0x001b2ea0 T OZChanSceneNodeRef::setDependency()
//   0x001b30d0 T OZChanSceneNodeRef::clone() const
//   0x001b3110 T OZChanSceneNodeRef::removeDependency()
//   0x001b3190 T OZChanSceneNodeRef::copy(OZChannelBase const*, bool)
//   0x001b32d0 T OZChanSceneNodeRef::assign(OZChannelBase const*)
//   0x001b3400 T OZChanSceneNodeRef::setValue(CMTime const&, double, bool)
//   0x001b3610 T OZChanSceneNodeRef::getNode() const
//   0x001b3660 T OZChanSceneNodeRef::setNode(OZSceneNode*)
//   0x001b3680 T OZChanSceneNodeRef::canReferenceObject(OZObjectManipulator const*) const
//   0x001b37b0 T OZChanSceneNodeRef::getAllowsCyclicDependencies() const
//   0x001b37d0 T OZChanSceneNodeRef::parseBegin(PCSerializerReadStream&)
//   0x001b38e0 T OZChanSceneNodeRef::parseEnd(PCSerializerReadStream&)
//   0x001b39f0 T OZChanSceneNodeRef::getObjectRef() const
//   0x001b3a40 T OZChanSceneNodeRef::setObjectRef(void*, bool)
//
// FRONTIER CALLEES: none.  The ported body is a single store; it contains no
// `callq` and no indirect branch.  `depgraph.py deps` on the mangled name
// reports nothing at all.
//
// ── THE FIELD ────────────────────────────────────────────────────────────
// +0x9b : bool allowsCyclicDependencies
//
// Pinned by the matched accessor PAIR, which sit 0x10 bytes apart in the text
// section and touch that one byte and nothing else:
//
//   OZChanSceneNodeRef::getAllowsCyclicDependencies() const  @0x1b37b0
//     0x1b37b4  movzbl 0x9b(%rdi), %eax     ; ZERO-extending byte load
//     0x1b37bb  popq %rbp / retq
//
//   OZChanSceneNodeRef::setAllowsCyclicDependencies(bool)    @0x1b37c0
//     0x1b37c4  movb   %sil, 0x9b(%rdi)     ; raw byte store of arg1's low 8
//     0x1b37cb  popq %rbp / retq
//
// A getter that `movzbl`s exactly what the setter `movb`s, at the same
// displacement, is what identifies +0x9b as a single one-byte field rather
// than part of a wider one. `OZChanSceneNodeRef` is an `OZChannelBase`
// subclass (see `getNode()` @0x1b361a calling
// `OZChannelBase::getObjectManipulator()`), so +0x9b lives in the derived
// class's own storage past the base subobject; nothing in this unit's
// evidence describes the rest of the object, and none of it is invented here.
//
// ── WHAT THE FLAG MEANS ──────────────────────────────────────────────────
// It gates the cyclic-dependency check on a scene-node reference: this class
// is the channel that points one node at another (`setNode(OZSceneNode*)`
// @0x1b3660, `getNode()` @0x1b3610), and it maintains an explicit dependency
// edge (`setDependency()` @0x1b2ea0 / `removeDependency()` @0x1b3110). The
// flag's readers are those units, not this one — the setter itself performs
// no validation whatsoever, which is the point worth preserving: it does NOT
// re-check or break existing cycles, it only records the permission bit.

/**
 * Runtime shape of an `OZChanSceneNodeRef`, limited to what this unit's
 * evidence pins.
 *
 * The class derives from `OZChannelBase` (established by `getNode()`
 * @0x1b361a, which calls `OZChannelBase::getObjectManipulator()` on `this`),
 * so the object carries a base subobject ahead of +0x9b. That storage is
 * left un-modelled rather than guessed at: this unit only proves the single
 * byte below.
 */
export interface OZChanSceneNodeRefInstance {
  /**
   * +0x9b — `bool allowsCyclicDependencies`.
   *
   * Stored by `movb %sil, 0x9b(%rdi)` @0x1b37c4 and read back by
   * `movzbl 0x9b(%rdi), %eax` @0x1b37b4 in the getter. Modelled as the raw
   * byte the instructions move, so a reviewer can line the field up with the
   * `movb`/`movzbl` pair directly.
   */
  allowsCyclicDependencies_at_0x9b: number;
}

/**
 * OZChanSceneNodeRef::setAllowsCyclicDependencies(bool)  —  Ozone @0x1b37c0.
 *
 * Faithful transcription of raw-port/re/disasm/
 * __ZN18OZChanSceneNodeRef27setAllowsCyclicDependenciesEb.s
 * (0x1b37cd is alignment padding, not code):
 *
 *   0x1b37c0  pushq %rbp
 *   0x1b37c1  movq  %rsp, %rbp
 *   0x1b37c4  movb  %sil, 0x9b(%rdi)     ; this->allowsCyclicDependencies = arg1
 *   0x1b37cb  popq  %rbp
 *   0x1b37cc  retq
 *
 * One store and nothing else: no null check, no read of any other field, no
 * dependency-graph revalidation, no call. Setting the flag to `false` on a
 * reference that already participates in a cycle does NOT break that cycle —
 * the byte is simply overwritten.
 *
 * The instruction moves the low 8 bits of %rsi (`%sil`) verbatim; the SysV
 * ABI guarantees a `bool` argument is 0 or 1 there, which is why the getter
 * @0x1b37b4 can `movzbl` it straight back out. The port takes a `boolean` to
 * match the C++ signature and writes the corresponding 0/1 byte.
 *
 * @param self  the channel (%rdi).
 * @param value the new flag (%sil).
 */
export function OZChanSceneNodeRef_setAllowsCyclicDependencies(
  self: OZChanSceneNodeRefInstance,
  value: boolean
): void {
  // 0x1b37c4  movb %sil, 0x9b(%rdi)
  self.allowsCyclicDependencies_at_0x9b = value ? 1 : 0;
}
