// OZLibraryPresetsMap.ts — Ozone framework's owning wrapper around
//   std::map<PCString, OZLibraryPresetsMapDatum>
// used by FCP's Motion/Ozone runtime to store per-preset metadata records keyed
// by (project-scoped) PCString identifier.
//
// Verbatim from FCP's Ozone framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// TWO symbols in the framework — the Itanium ABI D0 / D1 pair:
//   @Ozone 0x00000000005a4af0  OZLibraryPresetsMap::~OZLibraryPresetsMap()   (D1 — complete-object)
//   @Ozone 0x00000000005a4b10  OZLibraryPresetsMap::~OZLibraryPresetsMap()   (D0 — deleting)
// The framework exports no other member functions of OZLibraryPresetsMap — every observable
// FCP-side behaviour of this class lives in these two destructors, plus construction (implicit,
// inline in whichever owner allocates it — not present as an exported symbol). Population of
// the map happens via `std::map::emplace` etc from *external* callers holding a pointer to the
// instance; the associated helpers exist in the framework (see FRONTIER at bottom) but are
// not members of this class.
//
// Source disassembly:
//   raw-port/re/disasm/OZLibraryPresetsMap.~OZLibraryPresetsMap.s
// (D1 body @0x5a4af0..0x5a4b02, D0 body @0x5a4b10..0x5a4b2f)
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────────────
// Recovered from D1 @0x5a4af0..0x5a4b02:
//     0x5a4af4  movq 0x10(%rdi), %rsi        ; load root node pointer
//     0x5a4af8  addq $0x8, %rdi              ; advance to inner __tree object
//     0x5a4afd  jmp  __tree::destroy         ; tail-call: (tree*=this+8, node*=root)
// and from D0 @0x5a4b10..0x5a4b2f:
//     movq %rdi, %rbx; addq $0x8, %rdi; movq 0x10(%rbx), %rsi; callq __tree::destroy;
//     movq %rbx, %rdi; jmp __ZdlPv           ; tail-call: operator delete(this)
//
//   offset  size  field                     comments
//   ------  ----  ------------------------  --------------------------------------------------
//   +0x00   0x08  ownerOrScalar : u64       Present but NEVER referenced by either destructor.
//                                           No exported member function of OZLibraryPresetsMap
//                                           touches this word, so we cannot decode its semantics
//                                           from the class itself. Non-member callers (map owner
//                                           / OZLibraryEntry glue — see FRONTIER) write it. To
//                                           stay faithful we hold it as an opaque bigint that
//                                           round-trips verbatim; we never interpret it.
//   +0x08   0x??  tree          : __tree    libc++ std::__1::__tree<
//                                             __value_type<PCString, OZLibraryPresetsMapDatum>,
//                                             __map_value_compare<PCString,
//                                                 pair<PCString const, OZLibraryPresetsMapDatum>,
//                                                 less<PCString>, /*Unique=*/true>,
//                                             allocator<pair<PCString const, OZLibraryPresetsMapDatum>>>
//                                           The tree itself starts at +0x08. From D1 we know the
//                                           root-node pointer lives at (this+0x10) = +0x08 of
//                                           the tree, matching libc++'s layout where the root is
//                                           stored in `__end_node_.__left_`. Full tree size is not
//                                           deducible from just the destructors — it depends on
//                                           libc++'s internal layout of __compressed_pair<> for
//                                           the size and allocator/comparator — but its
//                                           observable behaviour, a std::map keyed on PCString
//                                           with std::less<PCString> ordering (Unique=true, so a
//                                           `std::map`, not `std::multimap`), is fully specified.
//
// The `Unique=true` template arg is the tell that this is a `std::map`, not `std::multimap`.
// In TS we model it as an ES `Map<string, OZLibraryPresetsMapDatum>` keyed on the underlying
// CFStringRef's UTF-8 form (PCString.toString()); ES `Map` is insertion-ordered rather than
// key-ordered, and code that relied on `std::map`'s ordered traversal would need to sort keys
// itself. All two OBSERVED FCP-observable operations on the outer class (D0/D1) are
// order-independent (they destroy every entry), so the difference does not affect fidelity of
// the two ports below.
//
// ── FRONTIER CALLEES (not members of this class — throw-stubbed if invoked from within) ──
//   __ZNSt3__16__treeI...E7destroyEP...    std::__1::__tree<...>::destroy(node*)
//         @Ozone (libc++ instantiation) — recursive post-order deletion of every tree node
//         (which invokes ~OZLibraryPresetsMapDatum + delete). In TS we simply drop references
//         (`this.tree.clear()`); we do NOT re-implement libc++'s intrusive-tree teardown.
//   __ZdlPv    operator delete(void*)     libSystem — freed by D0 after tree teardown.
// Neither is an Ozone frontier; both are C++ runtime.
//
// Reused ports:
//   PCString — see raw-port/src/infra/PCString.ts (used only as the map key type; the actual
//              key comparison here is std::less<PCString>. We use PCString's canonical utf-8
//              string form as the ES Map key to preserve unique-identity semantics.)
//
// OZLibraryPresetsMapDatum has its own set of exported symbols (see /tmp/Ozone_symmap.tsv
// entries under __ZN24OZLibraryPresetsMapDatum...). Those are NOT members of THIS class and
// belong to a separate port; here we only forward-declare Datum as an opaque record so the
// map value type is nameable without dragging Datum's ctor/dtor into this file.

import { PCString } from "../infra/PCString";

// Opaque forward-declaration. The full port lives in its own file (see task queue). We take
// Datum by reference only — this class does not construct, copy, or read Datum's fields.
// Modeling it as a nominal opaque interface prevents any accidental cross-file assumption.
export interface OZLibraryPresetsMapDatum {
  /** Nominal-typing marker so `OZLibraryPresetsMapDatum` and `unknown` are not structurally
   *  interchangeable. Ported separately from OZLibraryPresetsMap. */
  readonly __brand_OZLibraryPresetsMapDatum: unique symbol;
}

/**
 * OZLibraryPresetsMap — wrapper around std::map<PCString, OZLibraryPresetsMapDatum>.
 *
 * The Ozone framework exports only the two destructors (D0/D1) for this class; every
 * mutation (insertion, lookup, erasure) originates from non-member callers that dispatch
 * directly to the underlying std::map through pointer-to-member accessors. In this port
 * the two destructors are faithful — every other operation on the class would require
 * decoding those external callers, so it is NOT exposed here.
 */
export class OZLibraryPresetsMap {
  /**
   * @+0x00  Opaque 64-bit word initialised by whichever non-member owner allocates the
   * instance. Neither D0 nor D1 touches it, and no other exported member function of
   * OZLibraryPresetsMap exists, so its semantics cannot be decoded from this class in
   * isolation. Modeled as `bigint` (round-trip only). See FRONTIER note above.
   */
  ownerOrScalar: bigint = 0n;

  /**
   * @+0x08  The libc++ std::map instantiated as
   *   std::map<PCString, OZLibraryPresetsMapDatum, std::less<PCString>>.
   *
   * Modeled as an ES Map keyed on the PCString's canonical string form
   * (see PCString.toString()) so that two PCString handles referring to the same
   * underlying CFStringRef map to the same entry — matching std::map's uniqueness
   * (the framework instantiates the __tree with `Unique=true`).
   *
   * Insertion-order iteration differs from std::map's key-ordered iteration; the
   * two destructors ported below do not observe order, so this port is faithful for
   * their behaviour. Any caller that needs ordered traversal must sort by key.
   */
  tree: Map<string, { key: PCString; value: OZLibraryPresetsMapDatum }> = new Map();

  /**
   * D1 — complete-object destructor.
   *   @Ozone 0x00000000005a4af0..0x00000000005a4b02
   *
   * Disassembly:
   *   0x5a4af0  pushq %rbp
   *   0x5a4af1  movq  %rsp, %rbp
   *   0x5a4af4  movq  0x10(%rdi), %rsi         ; rsi = root node pointer (== this.tree root)
   *   0x5a4af8  addq  $0x8, %rdi               ; rdi = &this->tree  (inner __tree object)
   *   0x5a4afc  popq  %rbp
   *   0x5a4afd  jmp   __ZNSt3__16__treeI...E7destroyEP...
   *              ; std::__1::__tree<value_type,__map_value_compare,allocator>::destroy(root)
   *              ; Recursive post-order deletion of every node — invokes
   *              ; ~OZLibraryPresetsMapDatum on each value slot then `delete` on the node.
   *
   * The tail-call to `__tree::destroy` is the ONLY work done here. There is no explicit
   * `delete this` (that belongs to D0). In TS: dropping references from `this.tree` is
   * equivalent — the GC reclaims every {key, value} pair, running whatever finalisation
   * PCString or OZLibraryPresetsMapDatum register on their own. The `ownerOrScalar`
   * word is NOT cleared here (matching asm, which never writes to it).
   *
   * NB the destructor does not touch `this->ownerOrScalar` — mirror that faithfully.
   */
  D1_destructor(): void {
    // asm @0x5a4af4: rsi <- 0x10(rdi) ; but destroy() is called with (tree*, root*),
    //  and libc++'s __tree::destroy internally walks every subtree recursively. In TS
    //  we surrender the whole map in one step; there is no per-node dtor observable
    //  outside of the value_type's own dtor (which will run under GC).
    this.tree.clear();
  }

  /**
   * D0 — deleting destructor (virtual-delete thunk).
   *   @Ozone 0x00000000005a4b10..0x00000000005a4b2f
   *
   * Disassembly:
   *   0x5a4b10  pushq %rbp
   *   0x5a4b11  movq  %rsp, %rbp
   *   0x5a4b14  pushq %rbx
   *   0x5a4b15  pushq %rax                 ; 16-byte stack align
   *   0x5a4b16  movq  %rdi, %rbx           ; save this
   *   0x5a4b19  addq  $0x8, %rdi           ; &this->tree
   *   0x5a4b1d  movq  0x10(%rbx), %rsi     ; root pointer
   *   0x5a4b21  callq __tree::destroy      ; tree teardown (same as D1)
   *   0x5a4b26  movq  %rbx, %rdi           ; restore this
   *   0x5a4b29  addq  $0x8, %rsp
   *   0x5a4b2d  popq  %rbx
   *   0x5a4b2e  popq  %rbp
   *   0x5a4b2f  jmp   __ZdlPv              ; operator delete(this) — tail-call
   *
   * Semantically: run the D1 tree-teardown then `delete this`. In a GC language there is
   * no `operator delete`; releasing our own reference is the closest equivalent. Callers
   * of `D0_deleting_destructor()` must not use the instance afterwards.
   */
  D0_deleting_destructor(): void {
    // Mirror the asm: run the D1 body first (tree teardown)...
    this.D1_destructor();
    // ...then the tail-call to __ZdlPv (operator delete). In JS there is no explicit
    // free; the object becomes garbage once its owner drops the reference. Nothing else
    // to do — recording the equivalent semantic step here is the whole point of D0
    // being distinct from D1.
  }
}
