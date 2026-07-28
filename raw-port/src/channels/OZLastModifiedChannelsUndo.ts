// OZLastModifiedChannelsUndo — undo record that snapshots the OZDocument's "last modified
// channels" list (a std::vector<OZChannelRef>) so it can be restored by a Swap() with the
// live document state. FAITHFUL PORT from Ozone.framework. Every method cites @0xADDR.
//
// vtable @0x83d690 (installed-ptr @0x83d6a0, see vtable.py Ozone OZLastModifiedChannelsUndo):
//    *0x00 -> ~OZLastModifiedChannelsUndo()   @0x101d60  (D1 — non-deleting)
//    *0x08 -> ~OZLastModifiedChannelsUndo()   @0x101dd0  (D0 — deleting)
//    *0x10 -> Swap()                          @0x101e30  (the virtual "apply/unapply" hook)
//   Vtable ORDER + slot-set (dtor, dtor, Swap) is IDENTICAL to sibling undo records also
//   installed by the same __ZTV table: OZKeypointModificationUndo, OZEditBoxUndo,
//   OZDocumentTypeUndo, OZDropZoneTypeUndo — i.e. this is a family of "Undo w/ virtual Swap()".
//
// Struct layout (0x20 bytes; recovered from ctor @0x100690 and dtor @0x101cf0):
//   +0x00   vtable ptr       (`leaq 0x73d005(%rip),%rax ; movq %rax,(%rdi)` @0x100694..0x10069b
//                             → 0x83d6a0 = OZLastModifiedChannelsUndo vtable body)
//   +0x08   vec.__begin_     std::vector<OZChannelRef>::__begin_
//   +0x10   vec.__end_       std::vector<OZChannelRef>::__end_
//   +0x18   vec.__cap_end_   std::vector<OZChannelRef>::__end_cap_
//
// OZChannelRef element size = 0x18 (24 bytes). Confirmed by the classic libc++ `sarq $3` +
// magic multiplier `-0x5555555555555555` (== 0xAAAAAAAAAAAAAAAB) pair at 0x1006be..0x1006cc,
// which computes (byteLen>>3) * (2^64/3) = byteLen/24. OZChannelRef is a POD holding an SSO
// path string (see OZChannelFolder.ts::getChannelByRef for the path grammar). No standalone
// OZChannelRef.ts port exists yet — we model the vec's payload as a raw OZChannelRef[].
//
// FRONTIER (undecoded — Swap() calls into these; kept as throwing stubs cited by @0xADDR):
//   _theApp                                           @ RIP+0x???  (global OZApplication ptr)
//   OZApplication::getCurrentDoc()                    (returns { low:i64, doc:OZDocument* })
//   doc+0x588 -> unknown owning object                (holds ptr at +0x98 to the "last-mod
//                                                      channels holder"; sets holder.dirty
//                                                      flag byte at holder+0x78 = 1)
//   holder+0x48 -> std::vector<OZChannelRef>          (the LIVE "last modified channels" vec)
//
// LANDED SIBLING to inspect for shape: OZDropZoneTypeUndoParams.ts (params-bag pattern).

import { OZScene } from "../nodes/OZScene";

// OZChannelRef — a numeric path into an OZScene channel tree (see OZChannelFolder.ts).
// In the FCP binary this is a 24-byte POD wrapping an SSO std::string. We model it as a plain
// path string; the container semantics (copy, destroy, replace) map cleanly onto TS values.
// The FCP dtor is __ZN12OZChannelRefD1Ev (external stub @0x6dd71c — a string dtor).
export type OZChannelRef = string;

export class OZLastModifiedChannelsUndo {
  // Mirrors the +0x08..+0x18 std::vector<OZChannelRef> triple. We use a native array whose
  // length models (end-begin)/24; capacity is not exposed because none of the 6 ported methods
  // read it (only __init_with_size / __assign_with_size — which we mirror as array replace).
  private channels: OZChannelRef[] = [];

  // OZLastModifiedChannelsUndo::OZLastModifiedChannelsUndo(OZScene const*, vector<OZChannelRef> const&)
  // @0x100690 (C1) and @0x101ca0 (C2) — IDENTICAL bodies (both write the same vtable at
  // *0x83d6a0, zero-init the vec triple, then tail-call
  //   std::vector<OZChannelRef>::__init_with_size[abi:nqe210106]<OZChannelRef*,OZChannelRef*>(
  //       begin, end, count)
  // with the arg's [begin,end) range and count = (end-begin)/24).
  // NOTE: the OZScene* parameter (rsi) is DEAD — it is never read/stored. Kept in the
  // signature to preserve the FCP-observable ABI.
  constructor(_scene: OZScene | null, channels: readonly OZChannelRef[]) {
    // 0x100694-0x10069b: install vtable @0x83d6a0 — implicit in TS class dispatch.
    // 0x10069e-0x1006b1: zero-init the vector triple (begin=end=cap_end=0).
    //                   Implicit: `channels = []` field initializer above.
    // 0x1006b1-0x1006d4: __init_with_size — copy the incoming range into our vector.
    // The libc++ `__init_with_size(first, last, n)` allocates n slots and copies each; TS
    // slice() is the direct mirror because our elements are value strings.
    this.channels = channels.slice();
  }

  // OZLastModifiedChannelsUndo::~OZLastModifiedChannelsUndo() @0x101cf0 (D2) and @0x101d60 (D1)
  // — IDENTICAL bodies. Both re-install the vtable @0x83d6a0 into *this then run the vec
  // destroy sequence:
  //     r15 = __begin_; if (!r15) return;
  //     r14 = __end_;    while (r14 != r15) { r14 -= 0x18; OZChannelRef::~OZChannelRef(r14); }
  //     __end_ = __begin_;                     // 0x101d35: movq %r15,0x10(%rbx)
  // (Neither D1 nor D2 frees the __begin_ storage — that's D0's job; libc++'s split of
  // "destroy elements" vs "operator delete this" across D1/D2/D0 is preserved intact.)
  // In TS we don't manually run element dtors — GC handles the OZChannelRef strings. We
  // clear the array to mirror the observable state "end == begin".
  destroy(): void {
    // 0x101cfa-0x101d01: re-install vtable — implicit.
    // 0x101d04-0x101d33: run per-element ~OZChannelRef in reverse until __end_==__begin_.
    // 0x101d35:          __end_ = __begin_. TS mirror:
    this.channels.length = 0;
  }

  // OZLastModifiedChannelsUndo::~OZLastModifiedChannelsUndo() @0x101dd0 (D0 — deleting dtor).
  // Same as D1/D2 for the element-destroy loop, then adds:
  //     0x101e19:  callq operator delete(this)   ## __ZdlPv @0x6dfc36
  // In TS there is no explicit `delete` — the object becomes garbage-collectible after the
  // last reference drops. We expose deleteThis() for callers that want to model the vtable
  // slot *0x08 explicitly; behaviourally it is identical to destroy().
  deleteThis(): void {
    this.destroy();
    // 0x101e19: operator delete(this) — no-op in TS (GC).
  }

  // OZLastModifiedChannelsUndo::Swap() @0x101e30 — the virtual "apply/unapply" hook installed
  // at vtable slot *0x10. Swaps this.channels with the live "last modified channels" vector
  // owned by the current OZDocument. Faithful control flow:
  //
  //   0x101e42-0x101e4c: doc = _theApp->getCurrentDoc().doc      # rax:pair, r14 = doc
  //   0x101e55-0x101e58: if (!doc) goto end;
  //   0x101e5e-0x101e6d: local = {0,0,0}                          # -0x40(%rbp) local vector
  //   0x101e6d-0x101e74: sub = doc[+0x588]; holder = sub[+0x98]
  //   0x101e7b-0x101e80: if (holder) holder[+0x78] = 1            # set dirty flag
  //   0x101e84-0x101e91: srcVec = holder ? &holder[+0x48] : &sub[+0x120]
  //                                                              # cmovne — if holder null,
  //                                                              # the src is a fixed slot on
  //                                                              # `sub` itself at +0x120.
  //   0x101ea3-0x101ec4: if (&local != srcVec)
  //                        local.__assign_with_size(srcVec->begin, srcVec->end,
  //                                                 (end-begin)/24)
  //                        # local <- doc's live vec (copy)
  //   0x101ec6-0x101ecd: refetch: sub' = doc[+0x588]; holder' = sub'[+0x98]
  //   0x101ed4-0x101f01: if (holder' && &holder'[+0x48] != &this->channels)
  //                        (&holder'[+0x48])->__assign_with_size(
  //                            this->channels.begin, this->channels.end,
  //                            (end-begin)/24)
  //                        # doc's live vec <- this->channels (copy)
  //   0x101f01-0x101f27: if (&local != &this->channels)
  //                        this->channels.__assign_with_size(local.begin, local.end,
  //                                                         (end-begin)/24)
  //                        # this->channels <- local (copy)   [three-way swap via copies]
  //   0x101f2b-0x101f5e: destroy `local` (elements + free); goto end.
  //
  //   The cleanup pad at 0x101f6b runs ~vector on `local` for unwind.
  //
  // The frontier callees (_theApp, getCurrentDoc, the +0x588/+0x98/+0x78/+0x48/+0x120
  // dereferences) are NOT ported. We throw with the addresses so a demand signal is filed.
  swap(): void {
    // 0x101e42: leaq _theApp(%rip),%rax ; movq (%rax),%rdi
    // 0x101e4c: callq OZApplication::getCurrentDoc()
    throw new Error(
      "OZLastModifiedChannelsUndo::Swap unimplemented — needs _theApp @Ozone, " +
        "OZApplication::getCurrentDoc @0x101e4c, OZDocument+0x588->+0x98 holder " +
        "traversal + holder+0x78 dirty flag + holder+0x48 vector<OZChannelRef>, " +
        "and 3-way __assign_with_size (see @0x101ec1/@0x101efc/@0x101f22).",
    );
  }
}
