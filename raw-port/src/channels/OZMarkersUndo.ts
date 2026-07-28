// OZMarkersUndo — undo record that snapshots an OZChannelObjectRoot's OZTimeMarkerSet
// so it can be restored by a Swap() with the live document. FAITHFUL PORT from
// Ozone.framework. Every method cites @0xADDR.
//
// vtable @0x83d5b0 (installed via `leaq 0x73ce69(%rip),%rax` @0x1006f0 → 0x83d560 + 0x50):
//    *0x00 -> ~OZMarkersUndo()   @0x100830  (D1 — non-deleting)
//    *0x08 -> ~OZMarkersUndo()   @0x100880  (D0 — deleting)
//    *0x10 -> Swap()             @0x1008d0  (the "apply/unapply" hook — same slot pattern as
//                                            OZLastModifiedChannelsUndo, OZKeypointModificationUndo,
//                                            OZEditBoxUndo, OZDocumentTypeUndo, OZDropZoneTypeUndo)
//
// Struct layout (0x18 bytes; recovered from ctor @0x1006e0 and dtor @0x1007e0):
//   +0x00   vtable ptr           installed at 0x1006f0..0x1006f7 → OZMarkersUndo vtable body.
//   +0x08   ref  : OZChannelRef* HEAP-ALLOCATED OZChannelRef obtained by
//                                `OZChannelBase::getRef(false)` (@stub 0x6df56a) on the input
//                                root; result stored directly at +0x8 (0x100707). Note that
//                                getRef RETURNS a pointer — the FCP compiler models it as a
//                                heap OZChannelRef* handle, NOT an inline SSO string, because
//                                the D-dtors then run `~OZChannelRef` + `operator delete`
//                                on this pointer (0x100800..0x100808).
//   +0x10   markers : OZTimeMarkerSet*
//                                If (root+0xd8) != null, `operator new(0x20)` (@0x6dfca2 with
//                                immediate 0x20) allocates a new OZTimeMarkerSet, then
//                                OZTimeMarkerSet::OZTimeMarkerSet(OZTimeMarkerSet const&)
//                                (@ __ZN15OZTimeMarkerSetC1ERKS_) copy-constructs it from
//                                root+0xd8; the pointer is stored at +0x10 (0x10072f).
//                                Else +0x10 = 0.
//
// FRONTIER (undecoded — kept as throwing stubs cited by @0xADDR):
//   OZChannelBase::getRef(bool)                       @ stub 0x6df56a  (ctor)
//   OZChannelRef::~OZChannelRef()                     @ stub 0x6dd71c  (D2/D1/D0)
//   OZTimeMarkerSet::OZTimeMarkerSet(OZTimeMarkerSet const&)  @ __ZN15OZTimeMarkerSetC1ERKS_
//   OZTimeMarkerSet virtual dtor via vtable[+0x8]     (D2/D1 tail-call @0x10081d, D0 @0x1008b9)
//   _theApp global + OZApplication::getCurrentDoc()   (Swap)
//   OZChannelRef::getChannel(OZChannelBase*)          @ stub 0x6df4fe  (Swap)
//   ___dynamic_cast<OZChannelBase, OZChannelObjectRoot>  @ stub 0x6dfd0e  (Swap)
//   OZChannelObjectRoot::setTimeMarkers(OZTimeMarkerSet*)  @ __ZN19OZChannelObjectRoot14setTimeMarkersEP15OZTimeMarkerSet
//   OZDocument::postNotification(unsigned int)        @ __ZN10OZDocument16postNotificationEj
//
// Consumers referencing OZMarkersUndoC1 (13+ call sites): 0x722e4, 0x7250b, 0x13b5ef, 0x13bc37,
// 0x196aa4, 0x19ac83, 0x19b0ba, 0x1ba0a5, 0x1bd494, 0x1bd648, 0x1bd853, ... — the class is a
// widely-used undo-record type in the FCP marker-editing pipeline.

import { OZChannelObjectRootBase } from "./OZChannelObjectRootBase";

// OZChannelObjectRoot — the concrete "channel-object root" in the FCP class hierarchy that
// extends OZChannelObjectRootBase and exposes the `+0xd8` OZTimeMarkerSet* slot plus
// `setTimeMarkers(OZTimeMarkerSet*)` (@__ZN19OZChannelObjectRoot14setTimeMarkersEP15OZTimeMarkerSet).
// Not yet ported as a standalone class — modelled here as an alias so this file compiles.
export type OZChannelObjectRoot = OZChannelObjectRootBase;

// OZChannelRef opaque handle. In-binary it is a 24-byte POD (heap-allocated here); TS models it
// as an opaque object since we don't yet have a first-class port. We reserve the handle so the
// Swap() lookup can round-trip it back through OZChannelRef::getChannel (frontier).
export interface OZChannelRefHandle {
  readonly __ozChannelRef: true;
  // The FCP binary treats OZChannelRef as an opaque; we do the same to avoid inventing shape.
}

// OZTimeMarkerSet — 32-byte object (immediate `$0x20` to __Znwm @0x100717 and @0x100935).
// Layout undecoded; we model it as an opaque handle to preserve Swap()/ctor value semantics.
export interface OZTimeMarkerSet {
  readonly __ozTimeMarkerSet: true;
}

export class OZMarkersUndo {
  // +0x08. Null-checked in dtors (0x1007fb: `testq %r14,%r14 ; je ...` guards the delete).
  private ref: OZChannelRefHandle | null = null;
  // +0x10. Null-checked in dtors and Swap.
  private markers: OZTimeMarkerSet | null = null;

  // OZMarkersUndo::OZMarkersUndo(OZChannelObjectRoot const&)
  // @0x1006e0 (C2) and @0x100760 (C1) — IDENTICAL bodies, both write vtable @0x83d5b0.
  //
  //   0x1006ea: r15 = &root (rsi)
  //   0x1006f0-0x1006f7: install vtable
  //   0x1006fa: r14 = 0                             # temp marker-ptr slot
  //   0x1006fd-0x100702: this->ref = root.getRef(/*flag=*/false)
  //                      __ZNK13OZChannelBase6getRefEb — signature (bool) -> OZChannelRef*
  //                      SECOND arg (esi) is zeroed → false.
  //   0x100707:         movq %rax,0x8(%rbx)         # this->ref = returned pointer
  //   0x10070b:         r15 = *(u64*)(root + 0xd8)  # root's OZTimeMarkerSet* field
  //   0x100712-0x100715: if (!r15) skip copy
  //   0x100717-0x10071c: p = operator new(0x20)
  //   0x100721:         r14 = p
  //   0x10072a:         OZTimeMarkerSet::OZTimeMarkerSet(p, root.markers)   # copy-ctor
  //   0x10072f:         this->markers = r14 (== p or null if skipped)
  //
  //   Cleanup pad @0x10073e (unwind path if the copy-ctor throws): operator delete(r14).
  constructor(root: OZChannelObjectRoot) {
    // 0x1006f0-0x1006f7: vtable install — implicit in TS class dispatch.
    // 0x1006fa: r14 = 0 — TS field initializer `markers = null` above.
    // 0x1006fd-0x100707: this->ref = OZChannelBase::getRef(root, /*flag=*/false)
    this.ref = OZMarkersUndo._getRef(root, false);
    // 0x10070b-0x100715: read root+0xd8 → root's OZTimeMarkerSet* (may be null).
    const rootMarkers = OZMarkersUndo._readMarkersField(root);
    if (rootMarkers !== null) {
      // 0x100717-0x10072a: new OZTimeMarkerSet(rootMarkers)  (deep copy)
      this.markers = OZMarkersUndo._cloneMarkerSet(rootMarkers);
    }
    // 0x10072f: markers slot committed — assignment above.
  }

  // OZMarkersUndo::~OZMarkersUndo() @0x1007e0 (D2) and @0x100830 (D1) — IDENTICAL bodies.
  //   0x1007ea-0x1007f1: re-install vtable
  //   0x1007f4-0x1007fb: r14 = this->ref; if (r14) {
  //   0x1007fd-0x100800:   OZChannelRef::~OZChannelRef(r14)   # stub 0x6dd71c
  //   0x100805-0x100808:   operator delete(r14)               # stub __ZdlPv @0x6dfc36
  //                     }
  //   0x10080d-0x100814: rdi = this->markers; if (!rdi) return;
  //   0x100816-0x10081d: TAIL-CALL through markers.vtable[+0x8]
  //                       (D1 slot → non-deleting-dtor of OZTimeMarkerSet — but note: since
  //                        we ALLOCATED with operator new AND own the ptr, the FCP code uses
  //                        the vtable's D1 here NOT D0. This looks like a bug in the FCP
  //                        code — it leaks the 0x20 bytes of markers. We preserve the exact
  //                        observable: run D1 through the vtable, do NOT `delete markers`.)
  // In TS: null the fields; GC handles storage. We model the "leak D1" quirk by simply
  // clearing our ref, since we cannot dispatch into the marker vtable without a port.
  destroy(): void {
    // 0x1007f4-0x100808: destroy + free ref
    this.ref = null;
    // 0x10080d-0x10081d: virtual D1 on markers (leak of 0x20 bytes in FCP)
    this.markers = null;
  }

  // OZMarkersUndo::~OZMarkersUndo() @0x100880 (D0 — deleting dtor).
  // Same as D1/D2 for ref, then for markers uses vtable slot *0x08 via CALL (not tail-jump)
  // — which for OZTimeMarkerSet's vtable is its own DELETING dtor (frees the 0x20 bytes)
  // — then finally `operator delete(this)` @0x6dfc36 for OZMarkersUndo itself (0x1008c3).
  // See @0x1008b6: `movq (%rdi),%rax ; callq *0x8(%rax)`  followed by @0x1008c3 tail-jmp.
  deleteThis(): void {
    // 0x100894-0x1008a8: destroy + free ref (same as D1)
    this.ref = null;
    // 0x1008ad-0x1008b9: virtual D0 on markers (frees marker storage — different from D1!)
    this.markers = null;
    // 0x1008c3: operator delete(this) — GC in TS.
  }

  // OZMarkersUndo::Swap() @0x1008d0 — virtual "apply/unapply" hook at vtable *0x10.
  //   0x1008e1-0x1008eb: doc = _theApp->getCurrentDoc().doc    (r13 = returned .doc field @+8)
  //   0x1008f4-0x1008f8: rdi = this->ref (u64 at +0x8); rsi = &doc[+0x2b8]  (an OZChannelBase*)
  //   0x1008ff:          rax = OZChannelRef::getChannel(rdi=this.ref, rsi=doc+0x2b8)
  //   0x100904-0x100907: if (!rax) goto ret;
  //   0x100909-0x10091c: rax = dynamic_cast<OZChannelObjectRoot*>(rax as OZChannelBase*)
  //                          (source-typeinfo = __ZTI13OZChannelBase, dest = __ZTI19OZChannelObjectRoot)
  //   0x100921-0x100924: if (!rax) goto ret;
  //   0x100926:          r14 = rax                                   # the resolved root
  //   0x100929:          r12 = *(u64*)(rax + 0xd8)                   # root's current markers
  //   0x100930-0x100933: if (!r12) { r15 = null; jmp merge; }
  //   0x100935-0x10093a: p = operator new(0x20)
  //   0x100948:          OZTimeMarkerSet::OZTimeMarkerSet(p, r12)    # deep-copy live markers
  //   0x100961 merge:    rsi = this->markers (u64 at +0x10)
  //   0x100968:          OZChannelObjectRoot::setTimeMarkers(r14, this->markers)
  //                                                                  # (transfers ownership;
  //                                                                  # root's old +0xd8 now
  //                                                                  # replaced with ours)
  //   0x10096d:          this->markers = r15                         # our slot ← old copy
  //   0x100971:          rdi = *(u64*)(doc+0x588)   (an OZDocument or child)
  //   0x100978:          rsi = 0x400                                 # notification-id
  //   0x10098b:          TAIL-JMP OZDocument::postNotification(rdi, 0x400)
  swap(): void {
    // Every dereference here crosses a frontier we have not decoded — throw with the exact
    // addresses so the demand signal is filed.
    throw new Error(
      "OZMarkersUndo::Swap unimplemented — needs _theApp, " +
        "OZApplication::getCurrentDoc @0x1008eb, doc+0x2b8 OZChannelBase, " +
        "OZChannelRef::getChannel @stub 0x6df4fe, dynamic_cast to OZChannelObjectRoot " +
        "@stub 0x6dfd0e, root+0xd8 marker slot, OZTimeMarkerSet copy-ctor @0x100948, " +
        "OZChannelObjectRoot::setTimeMarkers @0x100968, and " +
        "OZDocument::postNotification(0x400) @0x10098b.",
    );
  }

  // --- frontier stubs — every call site cites the address that requires them ---

  // OZChannelBase::getRef(bool) — @stub 0x6df56a (called from ctor @0x100702).
  // Signature (from mangled name __ZNK13OZChannelBase6getRefEb): const method returning a
  // pointer to a heap OZChannelRef. Not yet ported.
  private static _getRef(_root: OZChannelObjectRoot, _flag: boolean): OZChannelRefHandle {
    throw new Error(
      "OZChannelBase::getRef(bool) unimplemented — @stub 0x6df56a; called from " +
        "OZMarkersUndo ctor @0x100702.",
    );
  }

  // Read root+0xd8 (OZTimeMarkerSet*). This is a direct struct-offset load @0x10070b in the
  // ctor and @0x100929 in Swap. Requires the OZChannelObjectRoot struct-layout port to expose
  // its `+0xd8` field.
  private static _readMarkersField(_root: OZChannelObjectRoot): OZTimeMarkerSet | null {
    throw new Error(
      "OZChannelObjectRoot+0xd8 (OZTimeMarkerSet*) accessor unimplemented — " +
        "read @0x10070b (ctor) and @0x100929 (Swap).",
    );
  }

  // OZTimeMarkerSet::OZTimeMarkerSet(OZTimeMarkerSet const&) — copy-ctor
  // __ZN15OZTimeMarkerSetC1ERKS_. Called from ctor @0x10072a and Swap @0x100948, each after
  // an operator new(0x20). Not yet ported.
  private static _cloneMarkerSet(_src: OZTimeMarkerSet): OZTimeMarkerSet {
    throw new Error(
      "OZTimeMarkerSet copy-ctor unimplemented — __ZN15OZTimeMarkerSetC1ERKS_; " +
        "called from OZMarkersUndo ctor @0x10072a and Swap @0x100948 " +
        "(each after operator new(0x20)).",
    );
  }
}
