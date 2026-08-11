// OZBehavior.m1.ts — OZBehavior methods, chunk 1 (indices 20..40 of 90), PLUS one method from
// outside that range (getSceneNode @0x10a8b0, index < 20) that was claimed as its own ledger unit
// later. The chunk boundary came from `claim.py chunk`, a work-splitting artifact — it is not a
// class boundary, and PORTING_SPEC's rule is ONE CLASS = ONE FILE. Adding the method here keeps
// OZBehavior at a single file; opening a second `OZBehavior.ts` would create exactly the
// two-files-one-class drift OPS_LOG records for OZScene. Flagged for the reviewer: if the project
// prefers the chunk files renamed/merged to `OZBehavior.ts`, that is a rename of this file, not a
// new one.
// Framework: Ozone.framework/Versions/A/Ozone (x86_64 slice, macOS FCP).
// Faithful port following raw-port/army/PORTING_SPEC.md — every function cites its @0xADDR;
// undecoded control-flow branches / callees / vtable slots are throw-stubs citing the address.
//
// Scope of this chunk (from `claim.py chunk Ozone OZBehavior 1`):
//   --  @0x000000000010a8b0  OZBehavior::getSceneNode()            [added later; its own unit]
//   20  @0x000000000010a9a0  OZBehavior::getPasteEntry(OZChannelBase*)
//   21  @0x000000000010aa70  OZBehavior::allowDrag(OZFactoryBase*, OZChannelBase*, uint, uint*, uint*, uint)
//   22  @0x000000000010abe0  OZBehavior::prepareForDragOperation(OZPasteList*, OZChannelBase*, uint, uint)
//   23  @0x000000000010ac40  OZBehavior::performDragOperation(OZFactoryBase*, OZChannelBase*, uint, uint, uint, uint, CMTime const&)
//   24  @0x000000000010adf0  OZBehavior::deleteThis(OZChannelBase*)
//   25  @0x000000000010ae50  OZBehavior::copy(OZChannelBase*)
//   26  @0x000000000010ae70  OZBehavior::paste(OZChannelBase*)
//   27  @0x000000000010ae90  OZBehavior::rename(OZChannelBase*, PCString*)
//   28  @0x000000000010aeb0  OZBehavior::isSelected() const
//   29  @0x000000000010aef0  OZBehavior::select()
//   30  @0x000000000010af30  OZBehavior::deselect()
//   31  @0x000000000010afb0  OZBehavior::isAnyParentSelected() const
//   32  @0x000000000010b070  OZBehavior::dirty()
//   33  @0x000000000010b0f0  OZBehavior::calcStaticHash(PCSerializerWriteStream&, list<OZObjectManipulator*>&)
//   34  @0x000000000010b2a0  OZBehavior::calcHashForState(PCSerializerWriteStream&, OZRenderParams const&, list<OZObjectManipulator*>&)
//   35  @0x000000000010b610  OZBehavior::canAddToSceneNode(OZSceneNode*)
//   36  @0x000000000010b630  OZBehavior::CanAddToSceneNode(PCUUID const&, OZSceneNode const*)
//   37  @0x000000000010b6d0  OZBehavior::IsChannelAffectedByBehaviors(OZChannelBase const*, bool)   [FULL PORT]
//   38  @0x000000000010b8f0  OZBehavior::GetBehaviorsAffectingChannel(...)
//   39  @0x000000000010bc10  OZBehavior::isUltimatelyAffectedBy(OZChannel const*, list<OZObjectManipulator*>&)
//
// This file fully transcribes the [FULL PORT] method (the high-value systemic frontier callee —
// six call-sites in OZSimSystemMoToFoBehavior::isSceneNodeAnimated alone; the "isAnimated" base).
// All other 19 methods are throwing stubs that cite their @0xADDR so `frontier.py` can list
// them as remaining work and no engine caller ever silently gets a plausible-looking zero.

import type { OZChannelBase } from "./OZChannelBase.js";
import type { OZChannelFolder } from "./OZChannelFolder.js";

// -- Undecoded external callees used by the ported method — throw with @0xADDR ------------------

/**
 * Runtime dynamic_cast to OZChannel / OZChannelFolder / OZBehaviorCurveNode / OZSimulationCurveNode.
 * The disassembly emits calls to `__dynamic_cast` (Ozone stub @0x6dfd0e). We model this at the TS
 * layer as an instanceof check — but since OZChannel/OZChannelFolder/etc. don't have concrete TS
 * shapes hooked up yet at the object-graph level exposed to this chunk, we throw. Callers must
 * either (a) provide a resolver, or (b) upgrade this to a real instanceof once the class chain
 * is imported here.
 */
function dynCastToOZChannel(_obj: OZChannelBase): unknown {
  throw new Error(
    "__dynamic_cast<OZChannel>(OZChannelBase*) @Ozone 0x6dfd0e stub — not yet transcribed",
  );
}
function dynCastToOZChannelFolder(_obj: OZChannelBase): OZChannelFolder | null {
  throw new Error(
    "__dynamic_cast<OZChannelFolder>(OZChannelBase*) @Ozone 0x6dfd0e stub — not yet transcribed",
  );
}
function dynCastToOZBehaviorCurveNode(_p: unknown): unknown {
  throw new Error(
    "__dynamic_cast<OZBehaviorCurveNode>(void*) @Ozone 0x6dfd0e stub — not yet transcribed",
  );
}
function dynCastToOZSimulationCurveNode(_p: unknown): unknown {
  throw new Error(
    "__dynamic_cast<OZSimulationCurveNode>(void*) @Ozone 0x6dfd0e stub — not yet transcribed",
  );
}

/**
 * OZChannel::enumerateCurveProcessingNodes(std::vector<void*>&) @ProChannel 0x1c7aa.
 * Body (decoded @raw-port/re/disasm/ProChannel.OZChannel.enumerateCurveProcessingNodes.s):
 *   zeroes the 24-byte out-vector at *rdi (+0/+8/+0x10), then reads
 *   `impl = channel->impl(+0x70); sub = impl->something(+0x8);` and dispatches
 *   `sub->vtable[0x478 / 8 = slot 143](out_vector)` which fills the vector.
 * The concrete populator lives in an OZChannelImpl subclass; not yet transcribed.
 * Returns the populated vector of `void*` (each element is a curve-processing-node pointer).
 */
function ozChannelEnumerateCurveProcessingNodes(_ch: unknown): unknown[] {
  throw new Error(
    "OZChannel::enumerateCurveProcessingNodes @ProChannel 0x1c7aa (vtable slot @+0x478) not yet transcribed",
  );
}

/**
 * OZChannelBase::testFlag(uint64_t) @ProChannel 0x49eec.
 * Faithfully: returns `(this->flags[+0x38] & mask) != 0`. Free-standing here so the ported
 * method reads exactly like the disassembly's `callq __ZNK13OZChannelBase8testFlagEy`.
 */
function channelBaseTestFlag(ch: OZChannelBase, mask: bigint): boolean {
  // OZChannelBase.flags is a bigint in the TS port (raw-port/src/channels/OZChannelBase.ts).
  return ((ch as unknown as { flags: bigint }).flags & mask) !== 0n;
}

/**
 * OZSimulationCurveNode::anyAffectingBehaviors() @Ozone (called from @0x10b7b2 via direct
 * `__ZN21OZSimulationCurveNode21anyAffectingBehaviorsEv`). Not in this chunk — throw-stub
 * so a caller cannot fake-zero when we walk here. Fill in from Ozone.ledger.json once ported.
 */
function ozSimulationCurveNodeAnyAffectingBehaviors(_n: unknown): boolean {
  throw new Error(
    "OZSimulationCurveNode::anyAffectingBehaviors() @Ozone not yet transcribed",
  );
}

/**
 * Virtual dispatch used by both non-folder loop tails (@0x10b78f and @0x10b88b, identical shape):
 *
 *   ; rax = OZBehaviorCurveNode* (return of the OZBehaviorCurveNode dynamic_cast)
 *   movq  0x8(%rax), %rdi          ; sub  = curveNode->field_0x8
 *   movq  0x10(%rdi), %rax         ; vptr = *(sub + 0x10)                (vtable pointer)
 *   addq  $0x10, %rdi              ; this = sub + 0x10                   (adjusted receiver)
 *   xorl  %esi, %esi               ; arg1 = false (0)
 *   movl  $0x1, %edx               ; arg2 = 1
 *   callq *0x10(%rax)              ; vtable slot 0x10 / 8 = index 2
 *
 * The receiver is the "sub-object at +0x10 of the field_0x8 of the OZBehaviorCurveNode." vtable
 * slot 2 returns a byte (`testb %al, %al`); truthy means "affects this channel" and short-circuits
 * the enumeration to `movb $0x1, %bl` -> return true.
 * The exact virtual method is not yet resolved in this port; throw-stub @Ozone 0x10b78f.
 */
function ozBehaviorCurveNodeSlot2Affects(_curveNode: unknown, _falseArg: false, _oneArg: 1): boolean {
  throw new Error(
    "OZBehaviorCurveNode subobject(+0x8+0x10)->vtable[2](false, 1) @Ozone 0x10b78f/0x10b88b — vtable slot not yet resolved",
  );
}

// -- Method 20..39 stubs (single-line stubs cite @0xADDR; body not yet decoded) -----------------

/** @Ozone 0x10a9a0 OZBehavior::getPasteEntry(OZChannelBase*) */
export function getPasteEntry_OZBehavior(_this: unknown, _ch: OZChannelBase): unknown {
  throw new Error("OZBehavior::getPasteEntry @Ozone 0x10a9a0 not yet transcribed");
}
/** @Ozone 0x10aa70 OZBehavior::allowDrag(OZFactoryBase*, OZChannelBase*, uint, uint*, uint*, uint) */
export function allowDrag_OZBehavior(
  _this: unknown, _fb: unknown, _ch: OZChannelBase,
  _a: number, _b: Uint32Array, _c: Uint32Array, _d: number,
): number {
  throw new Error("OZBehavior::allowDrag @Ozone 0x10aa70 not yet transcribed");
}
/** @Ozone 0x10abe0 OZBehavior::prepareForDragOperation(OZPasteList*, OZChannelBase*, uint, uint) */
export function prepareForDragOperation_OZBehavior(
  _this: unknown, _pl: unknown, _ch: OZChannelBase, _a: number, _b: number,
): void {
  throw new Error("OZBehavior::prepareForDragOperation @Ozone 0x10abe0 not yet transcribed");
}
/** @Ozone 0x10ac40 OZBehavior::performDragOperation(OZFactoryBase*, OZChannelBase*, uint, uint, uint, uint, CMTime const&) */
export function performDragOperation_OZBehavior(
  _this: unknown, _fb: unknown, _ch: OZChannelBase,
  _a: number, _b: number, _c: number, _d: number, _t: unknown,
): number {
  throw new Error("OZBehavior::performDragOperation @Ozone 0x10ac40 not yet transcribed");
}
/** @Ozone 0x10adf0 OZBehavior::deleteThis(OZChannelBase*) */
export function deleteThis_OZBehavior(_this: unknown, _ch: OZChannelBase): void {
  throw new Error("OZBehavior::deleteThis @Ozone 0x10adf0 not yet transcribed");
}
/** @Ozone 0x10ae50 OZBehavior::copy(OZChannelBase*) */
export function copy_OZBehavior(_this: unknown, _ch: OZChannelBase): unknown {
  throw new Error("OZBehavior::copy @Ozone 0x10ae50 not yet transcribed");
}
/** @Ozone 0x10ae70 OZBehavior::paste(OZChannelBase*) */
export function paste_OZBehavior(_this: unknown, _ch: OZChannelBase): number {
  throw new Error("OZBehavior::paste @Ozone 0x10ae70 not yet transcribed");
}
/** @Ozone 0x10ae90 OZBehavior::rename(OZChannelBase*, PCString*) */
export function rename_OZBehavior(_this: unknown, _ch: OZChannelBase, _s: unknown): number {
  throw new Error("OZBehavior::rename @Ozone 0x10ae90 not yet transcribed");
}
/** @Ozone 0x10aeb0 OZBehavior::isSelected() const */
export function isSelected_OZBehavior(_this: unknown): boolean {
  throw new Error("OZBehavior::isSelected @Ozone 0x10aeb0 not yet transcribed");
}
/** @Ozone 0x10aef0 OZBehavior::select() */
export function select_OZBehavior(_this: unknown): void {
  throw new Error("OZBehavior::select @Ozone 0x10aef0 not yet transcribed");
}
/** @Ozone 0x10af30 OZBehavior::deselect() */
export function deselect_OZBehavior(_this: unknown): void {
  throw new Error("OZBehavior::deselect @Ozone 0x10af30 not yet transcribed");
}
/** @Ozone 0x10afb0 OZBehavior::isAnyParentSelected() const */
export function isAnyParentSelected_OZBehavior(_this: unknown): boolean {
  throw new Error("OZBehavior::isAnyParentSelected @Ozone 0x10afb0 not yet transcribed");
}
/** @Ozone 0x10b070 OZBehavior::dirty() */
export function dirty_OZBehavior(_this: unknown): void {
  throw new Error("OZBehavior::dirty @Ozone 0x10b070 not yet transcribed");
}
/** @Ozone 0x10b0f0 OZBehavior::calcStaticHash(PCSerializerWriteStream&, list<OZObjectManipulator*>&) */
export function calcStaticHash_OZBehavior(_this: unknown, _s: unknown, _l: unknown): void {
  throw new Error("OZBehavior::calcStaticHash @Ozone 0x10b0f0 not yet transcribed");
}
/** @Ozone 0x10b2a0 OZBehavior::calcHashForState(PCSerializerWriteStream&, OZRenderParams const&, list<OZObjectManipulator*>&) */
export function calcHashForState_OZBehavior(_this: unknown, _s: unknown, _rp: unknown, _l: unknown): void {
  throw new Error("OZBehavior::calcHashForState @Ozone 0x10b2a0 not yet transcribed");
}
/** @Ozone 0x10b610 OZBehavior::canAddToSceneNode(OZSceneNode*) */
export function canAddToSceneNode_OZBehavior(_this: unknown, _n: unknown): boolean {
  throw new Error("OZBehavior::canAddToSceneNode @Ozone 0x10b610 not yet transcribed");
}
/** @Ozone 0x10b630 OZBehavior::CanAddToSceneNode(PCUUID const&, OZSceneNode const*) [static] */
export function CanAddToSceneNode_static(_uuid: unknown, _n: unknown): boolean {
  throw new Error("OZBehavior::CanAddToSceneNode (static) @Ozone 0x10b630 not yet transcribed");
}

// -------------------------------------------------------------------------------------------------
// Method 37 — OZBehavior::IsChannelAffectedByBehaviors(OZChannelBase const*, bool)   [FULL PORT]
// -------------------------------------------------------------------------------------------------
//
// Mangled : __ZN10OZBehavior28IsChannelAffectedByBehaviorsEPK13OZChannelBaseb
// Address : @Ozone 0x10b6d0  (static — no `this`; args are (%rdi=channel, %esi=useSim as byte))
// Source  : raw-port/re/disasm/OZBehavior.IsChannelAffectedByBehaviors.s (156 lines, decoded end-to-end)
//
// The function answers "does at least one behavior affect this channel (or, if the channel is a
// folder, any of its non-flagged descendants)?" It has two top-level branches keyed on
// `channel->flags & 0x1000` (`testb $0x10, 0x39(%rdi)` — bit 12 of the u64 flags field at +0x38):
//
// A. NON-FOLDER (channel is a leaf OZChannel or something else)                    @0x10b6ee ... @0x10b8b3
//    1. `chan = __dynamic_cast<OZChannel>(channel)` — @0x10b700.
//       If cast fails (rax == 0) -> return false.                                   @0x10b708 -> @0x10b8b3
//    2. `std::vector<void*> nodes; chan->enumerateCurveProcessingNodes(&nodes)`    @0x10b715
//       (out-param initialized in the callee; caller provides sret at -0x40(%rbp).)
//    3. Read `begin = *(nodes+0)`, `end = *(nodes+8)`.                              @0x10b71a/@0x10b71e
//       If begin == end -> return false (nothing enumerated).                       @0x10b725 -> @0x10b89f
//    4. LOOP over `[begin, end)` with 8-byte stride. Each element is a `void*` p.
//       - If p == NULL -> skip (continue).                                           @0x10b762/@0x10b850..0x10b864
//       - Split on `useSim` (r14b, arg1's byte):
//
//         (i) useSim == true                                                         @0x10b732 -> @0x10b73b (fall-through)
//             - Try `bc = __dynamic_cast<OZBehaviorCurveNode>(p)`.                   @0x10b767..@0x10b772
//               If bc != NULL, dispatch the virtual "affects channel" query on the
//               curve-node's sub-object:
//                   sub  = *(bc + 0x8)
//                   this = sub + 0x10
//                   vptr = *(sub + 0x10)
//                   ok   = vptr[2](/*falseArg*/ false, /*oneArg*/ 1)                @0x10b77c..@0x10b78f
//               If ok is truthy -> return true.                                     @0x10b792 -> @0x10b892
//             - Else try `sc = __dynamic_cast<OZSimulationCurveNode>(p)`.           @0x10b79a..@0x10b7a5
//               If sc != NULL and `sc->anyAffectingBehaviors()` is truthy ->
//               return true.                                                        @0x10b7b2..@0x10b7b9 -> @0x10b892
//
//         (ii) useSim == false                                                      @0x10b735 -> @0x10b846
//             - Only try `bc = __dynamic_cast<OZBehaviorCurveNode>(p)`.             @0x10b866..@0x10b86e
//               Same virtual dispatch shape as (i); on truthy -> return true.       @0x10b878..@0x10b88b -> @0x10b892
//
//    5. Loop exhausts without a hit -> return false. (The single common exit at 0x10b89f/0x10b8b3
//       also frees the enumerated vector via `operator delete` @0x10b8ae.)
//
// B. FOLDER  (channel->flags & 0x1000)                                              @0x10b7c0 ... @0x10b8b3
//    1. `folder = __dynamic_cast<OZChannelFolder>(channel)`.                        @0x10b7d2
//    2. `impl = folder->field_at_0x70`. If NULL -> return false.                    @0x10b7d7..@0x10b7de
//    3. Read the vector-of-children at `impl` : `begin = *(impl+0)`, `end = *(impl+8)`.
//       If begin == end -> return false.                                            @0x10b7e4..@0x10b7eb -> @0x10b842 -> 0
//    4. LOOP over `[begin, end)` with 8-byte stride. Each element is an
//       `OZChannelBase*` p (loaded as `movq -0x8(%r12), %rdi` after `addq $0x8,%r12`
//       and a fall-through — the pointer read is BEHIND the cursor).                @0x10b7f5/@0x10b800..
//       For each child:
//         - If `child->testFlag(0x2)` is TRUE -> skip this child (do NOT recurse
//           and do NOT count as affected).                                          @0x10b825..@0x10b836
//         - Else recurse: `hit = IsChannelAffectedByBehaviors(child, useSim)`.      @0x10b800..@0x10b80d
//           If hit truthy -> return true (short-circuit, break out of loop).        @0x10b81d..@0x10b81f -> @0x10b8b3
//    5. Loop exhausts without a hit -> return false.                                @0x10b8b3
//
// Return: `bool` (byte in %al). The FOLDER branch does NOT allocate/free the caller's local
// vector (that path never enters the `-0x40(%rbp)` sret slot). The non-folder branch DOES; the
// unified exit frees it via `operator delete` at @0x10b8ae iff `-0x40(%rbp) != 0`.
//
// The function is STATIC in effect (never dereferences `this` — the initial `pushq %rbp / movq
// %rsp,%rbp` is followed by argument-only work; the D2 destructor slot is unused). We port it as
// a free `export function` accepting `(channel, useSim)`.
export function IsChannelAffectedByBehaviors(
  channel: OZChannelBase,
  useSim: boolean,
): boolean {
  // -- Split on the folder flag (bit 12 of channel->flags — `testb $0x10, 0x39(%rdi)`) --
  // @0x10b6e4: testb $0x10, 0x39(%rdi)
  // @0x10b6e8: jne  0x10b7c0                                    ; -> FOLDER branch
  const flags = (channel as unknown as { flags: bigint }).flags;
  if ((flags & 0x1000n) !== 0n) {
    // -- Branch B: FOLDER --------------------------------------------------------------
    // @0x10b7c0..@0x10b7d2: dynamic_cast<OZChannelFolder>(channel)
    const folder = dynCastToOZChannelFolder(channel);
    // @0x10b7d7: movq 0x70(%rax), %r15    ; children container ptr
    // @0x10b7db: testq %r15,%r15 ; je 0x10b8b3   ; NULL container -> return 0
    if (!folder) return false;
    const kids = (folder as unknown as { children: OZChannelBase[] }).children;
    // @0x10b7e4..@0x10b7eb: begin==end fast-exit
    if (!kids || kids.length === 0) return false;
    // @0x10b7f1: movzbl %r14b,%r14d  ; normalize useSim to 0/1
    const useSimNorm = useSim ? true : false;
    // @0x10b7f5..@0x10b840: loop
    for (const child of kids) {
      // @0x10b825..@0x10b82f: testFlag(0x2)  -> if TRUE, skip this child
      if (channelBaseTestFlag(child, 0x2n)) continue;
      // @0x10b800..@0x10b80d: recurse
      const hit = IsChannelAffectedByBehaviors(child, useSimNorm);
      // @0x10b81d..@0x10b81f: testb %bl,%bl ; jne 0x10b8b3  (return true)
      if (hit) return true;
      // else: fall through to next iteration (@0x10b80f/@0x10b813 cmp/je-end path)
    }
    // @0x10b842 -> @0x10b8b3: xorl %ebx,%ebx ; return false
    return false;
  }

  // -- Branch A: NON-FOLDER ----------------------------------------------------------------
  // @0x10b6ee..@0x10b700: dynamic_cast<OZChannel>(channel)
  const chan = dynCastToOZChannel(channel);
  // @0x10b705..@0x10b708: null => return false
  if (chan === null || chan === undefined) return false;
  // @0x10b70e..@0x10b715: enumerateCurveProcessingNodes(sret vector, chan)
  const nodes = ozChannelEnumerateCurveProcessingNodes(chan);
  // @0x10b71a..@0x10b725: begin == end fast-exit
  if (!nodes || nodes.length === 0) return false;

  // @0x10b732..@0x10b735: dispatch on useSim
  if (useSim) {
    // Branch A(i): useSim == true — try OZBehaviorCurveNode THEN OZSimulationCurveNode.
    // @0x10b73b/@0x10b742: load typeinfo pointers for both target types (folded to constants).
    for (const p of nodes) {
      // @0x10b762..@0x10b765: skip NULL entries
      if (p === null || p === undefined) continue;

      // @0x10b767..@0x10b772: dynamic_cast<OZBehaviorCurveNode>(p)
      const bc = dynCastToOZBehaviorCurveNode(p);
      // @0x10b777..@0x10b78f: if non-null, invoke virtual "affects channel" on sub-object
      if (bc !== null && bc !== undefined) {
        const ok = ozBehaviorCurveNodeSlot2Affects(bc, false, 1);
        // @0x10b792..@0x10b794: testb %al,%al ; jne 0x10b892 (return true)
        if (ok) return true;
      }

      // @0x10b79a..@0x10b7a5: dynamic_cast<OZSimulationCurveNode>(p)
      const sc = dynCastToOZSimulationCurveNode(p);
      // @0x10b7aa..@0x10b7ad: NULL -> next iter
      if (sc === null || sc === undefined) continue;
      // @0x10b7af..@0x10b7b9: sc->anyAffectingBehaviors() ; nonzero -> return true
      if (ozSimulationCurveNodeAnyAffectingBehaviors(sc)) return true;
      // else fall through to next iter
    }
  } else {
    // Branch A(ii): useSim == false — try OZBehaviorCurveNode only.
    // @0x10b846: load OZBehaviorCurveNode typeinfo into r14.
    for (const p of nodes) {
      // @0x10b85d..@0x10b864: skip NULL entries
      if (p === null || p === undefined) continue;
      // @0x10b866..@0x10b86e: dynamic_cast<OZBehaviorCurveNode>(p)
      const bc = dynCastToOZBehaviorCurveNode(p);
      // @0x10b873..@0x10b876: NULL -> next iter
      if (bc === null || bc === undefined) continue;
      // @0x10b878..@0x10b88b: virtual "affects channel"
      const ok = ozBehaviorCurveNodeSlot2Affects(bc, false, 1);
      // @0x10b88e..@0x10b890: nonzero -> return true
      if (ok) return true;
    }
  }

  // @0x10b89f/@0x10b8b3: loop exhausted -> false (unified return path frees the enumerated
  // vector; the TS port relies on GC for that, which is a no-op equivalent).
  return false;
}

// -- Remaining chunk-1 stubs (indices 38, 39) --------------------------------------------------

/** @Ozone 0x10b8f0 OZBehavior::GetBehaviorsAffectingChannel(OZChannelBase const*, list<OZBehavior*>&, bool) */
export function GetBehaviorsAffectingChannel_static(
  _ch: OZChannelBase, _out: unknown, _useSim: boolean,
): void {
  throw new Error(
    "OZBehavior::GetBehaviorsAffectingChannel @Ozone 0x10b8f0 not yet transcribed",
  );
}

/** @Ozone 0x10bc10 OZBehavior::isUltimatelyAffectedBy(OZChannel const*, list<OZObjectManipulator*>&) */
export function isUltimatelyAffectedBy_channel_OZBehavior(
  _this: unknown, _ch: unknown, _list: unknown,
): boolean {
  throw new Error(
    "OZBehavior::isUltimatelyAffectedBy(OZChannel const*, list) @Ozone 0x10bc10 not yet transcribed",
  );
}

// -- Added later, its own ledger unit: OZBehavior::getSceneNode() ------------------------------

/**
 * `OZBehavior::getSceneNode()` — @Ozone 0x10a8b0
 *   `__ZN10OZBehavior12getSceneNodeEv`
 *
 * FULL transcription — every instruction, in order:
 *
 *   0x10a8b0  pushq %rbp                    ; frame setup (no TS counterpart)
 *   0x10a8b1  movq  %rsp,%rbp               ; frame setup (no TS counterpart)
 *   0x10a8b4  movq  0x140(%rdi),%rax        ; return *(OZSceneNode**)(this + 0x140)
 *   0x10a8bb  popq  %rbp                    ; frame teardown (no TS counterpart)
 *   0x10a8bc  retq
 *   0x10a8bd  nopl  (%rax)                  ; alignment padding, not executed
 *
 * A single 8-byte field read: no null check, no branch, no callee, no indirect or virtual dispatch
 * (`depgraph.py deps` lists nothing). The pointer is returned exactly as stored, including null.
 *
 * WHAT +0x140 IS. This body is what TYPES that slot for the rest of the class: the parked analysis
 * of `OZBehavior::getScene() const` @0x10a8e0 (see army/depgraph/blocked.jsonl) reads +0x140 and
 * then dispatches through the loaded pointer's vtable slot +0x110, which resolves to
 * `OZSceneNode::getScene() const` — so the field holds an `OZSceneNode*`, and this getter is the
 * accessor for it.
 *
 * THREE NEARBY SYMBOLS THAT ARE NOT THIS ONE, each its own ledger unit and none assumed here:
 * the const overload `__ZNK10OZBehavior12getSceneNodeEv` @0x10a8d0, the non-virtual adjustor thunk
 * `__ZThn16_N10OZBehavior12getSceneNodeEv` @0x10a8c0, and `getScene() const` @0x10a8e0.
 *
 * ORACLE (executed against live FCP, not read). The symbol is exported (`T`), so it was dlsym'd
 * from Ozone in a Rosetta x86_64 process — `arch -x86_64 /usr/bin/python3` — after preloading
 * Ozone's `@rpath` chain depth-first (44 images, 0 failures). A 0x200-byte object was poisoned with
 * 0xCD and its qword at +0x140 set to each of 0, 1, 0xDEADBEEF, INT64_MAX and all-ones: live Ozone
 * returned exactly that qword every time, and a byte-diff of the object afterwards showed it
 * UNMODIFIED (this is a getter, and that is checked, not assumed). NEGATIVE CONTROL: with a
 * different value planted at the +0x148 neighbour, the return was still the +0x140 value — so the
 * offset in this port is pinned by measurement, not just by reading the displacement.
 *
 * @param self the `OZBehavior*` in %rdi.
 * @returns the `OZSceneNode*` stored at `this + 0x140`, verbatim (null included).
 */
export function getSceneNode_OZBehavior(self: OZBehaviorFields): unknown {
  // @0x10a8b4 — movq 0x140(%rdi),%rax : one 8-byte field read, returned unchanged.
  return self.sceneNodeAt0x140;
}

/**
 * The one field of `OZBehavior` that `getSceneNode` reads.
 *
 * Declared as a narrow structural view rather than a whole-class model on purpose: this chunk file
 * ports methods, not the class's layout, and the only offset any of them establishes so far is
 * this one. The ctor units will supply the rest.
 */
export interface OZBehaviorFields {
  /** +0x140 — `OZSceneNode*`; read by getSceneNode @0x10a8b4 and by getScene @0x10a8e4. */
  sceneNodeAt0x140: unknown;
}
