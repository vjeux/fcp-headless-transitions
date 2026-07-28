// PixelFormatListManager — a Flexo-side singleton (or leaf) manager that maintains a
// per-flag-set memoization map of "supported pixel format" lists. Given a 64-bit flag
// word (bit-packed capability descriptor), it returns a small linked list of pixel
// formats that satisfy those flags. The manager is thread-safe via an embedded
// Synchronizable sub-object and its cache is a libc++ std::map<uint64_t, ValueNode*>.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly for all four exported symbols saved at:
//   raw-port/re/disasm/Flexo.PixelFormatListManager.<mangled>.s
//
// FOUR EXPORTED SYMBOLS:
//   @Flexo 0xe3f640  __ZN22PixelFormatListManagerD1Ev   ~PixelFormatListManager() [D1]
//                     — 5-byte trampoline into D2 (Itanium-ABI thin dtor).
//   @Flexo 0xe3fdf0  __ZN22PixelFormatListManagerD0Ev   ~PixelFormatListManager() [D0]
//                     — calls D2, then tail-calls operator delete(this).
//   @Flexo 0xe3fe10  __ZN22PixelFormatListManagerD2Ev   ~PixelFormatListManager() [D2]
//                     — the real body: walks and frees the cache map.
//   @Flexo 0xe3ff30  __ZN22PixelFormatListManager19getPixelFormatListsEy
//                     getPixelFormatLists(unsigned long long flags)
//                     — 311-line memoized computation. Kept as a decoded-layout stub;
//                       full transcription is deferred because the body pulls in the
//                       Synchronizable lock, the libc++ __tree machinery, and a rich
//                       bit-field capability decoder plus a full walk of
//                       _kSupportedPixelFormats — each of those is a frontier subsystem.
//
// STRUCT LAYOUT (recovered EXHAUSTIVELY from the destructors and from getPixelFormatLists'
// entry stanza — every offset that is read or written has a self-consistent meaning):
//
//   +0x00  vtable*             // D2 @0xe3fe21..@0xe3fe28: leaq VT+0x10(%rip),%rax; movq %rax,(%rdi).
//                              //   VT installed-ptr = 0xe3fe28 + 7 + 0xad7448 = 0x1917680 (base+0x10).
//   +0x08  Node* mapLeftmost   // start of the intrusive libc++ __tree.  Loaded @0xe3fe2b:
//                              //   movq 0x8(%rdi), %r13.
//                              //   Passed as the destroy() second arg later.
//                              // Read in getPixelFormatLists ── the __tree::__find_equal
//                              // and __find_leaf are anchored at (this + 0x10) [see below];
//                              // that means the map's SENTINEL address is (this + 0x10).
//   +0x10  Node* mapRoot       // libc++ RB-tree root. Loaded in getPixelFormatLists
//                              //   @0xe3ff58/@0xe3ff5c: leaq 0x10(%rbx),%rax; save.
//                              //   @0xe3ff60: rcx = 0x10(%rbx) — the actual root pointer.
//                              // Also loaded @0xe3fe45 in D2 as the arg to __tree::destroy.
//   +0x18  size_t mapSize      // element count. Not read by the destructor, but its slot
//                              // is bracketed by the two fields above and the Synchronizable
//                              // at +0x20 — this is the libc++ 24-byte header layout.
//   +0x20  Synchronizable sync // embedded sub-object providing Lock()/Unlock(). D2 destroys
//                              //   it @0xe3fe38..@0xe3fe40 via __ZN14SynchronizableD1Ev
//                              //   with %rdi = this+0x20. getPixelFormatLists locks it at
//                              //   @0xe3ff53 (Synchronizable::Lock()).
//                              // Size unknown from these bodies; the fact that the D2 tail
//                              // moves past Synchronizable straight into std::__tree::destroy
//                              // means Synchronizable::~Synchronizable does NOT read past its
//                              // own slot. We keep it opaque here.
//
// NODE LAYOUT (libc++ __tree_node<T> with T = pair<uint64_t const, ValueNode*>):
//
//   +0x00  Node* left          // std::__tree_node_base<void*>::left
//   +0x08  Node* right         // std::__tree_node_base<void*>::right
//   +0x10  Node* parent        // std::__tree_node_base<void*>::parent
//   +0x18  bool is_black       // color bit + padding
//   +0x20  uint64_t key        // the 64-bit flag word (the getPixelFormatLists parameter).
//                              // Compared in the __find_equal loop @0xe3ff72: cmpq %r14,0x20(%rcx).
//   +0x28  ValueNode* value    // pointer to the head of a small owned linked list.
//                              // Read in D2 @0xe3fe68 as `movq 0x28(%r13), %r14`.
//
// VALUENODE LAYOUT (the object at Node.value; recovered from the D2 free-block
// @0xe3fe6c..@0xe3fea3):
//
//   +0x00  ListElement* head   // pointer to the head of a *nested* singly-linked list of
//                              //   pixel-format cells. If null → skip inner free block.
//                              //   Read @0xe3fe71 as `movq (%r14), %r15`.
//   +0x08  CFTypeRef cfRef     // an optional CFType (likely a CFArray/CFDictionary
//                              //   summarising the format list). CFRelease'd @0xe3fe9b
//                              //   via callq _CFRelease (Flexo __stubs 0x149484e).
//
// LISTELEMENT LAYOUT (the head-of-linked-list at ValueNode.head; from @0xe3fe79..@0xe3fe8d):
//
//   +0x00  Payload* payload    // raw heap buffer. If non-null, its address is scratch-
//                              //   written to +0x08 of THIS element and then delete'd.
//   +0x08  Payload* scratch    // Clang scratch-store target: `movq %rdi, 0x8(%r15)`
//                              //   before `operator delete(%rdi)`. See OZHistogramDelegate
//                              //   for the same pattern's rationale.
//
// Note: the observed D2 body drains ONE ValueNode per map entry (not a loop over a
// linked list of ValueNodes) — Node.value points at ONE ValueNode, which contains ONE
// ListElement (or null). If the actual runtime layout has a chain of ListElements per
// ValueNode, D2 leaks the tail. That mirrors what the asm ACTUALLY does — we transcribe
// verbatim, we do NOT invent a loop that isn't there.
//
// LIBC++ TAIL-CALL (D2 terminal `jmp`):
//   __ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEE...E7destroyE...
//   The symbol name says <unsigned int, FFAudioPlayerSourceInfo*> — the SAME LINKER
//   ALIAS as cachedPathsForQuals. The tree-destroy template is folded across identical
//   node-shape instantiations; the actual (key, value) types here are (uint64_t,
//   ValueNode*). See cachedPathsForQuals.ts for the full write-up.
//
// RUNTIME IMPORTS resolved:
//   __Znwm   (operator new(unsigned long))         @Flexo __stubs 0x1497452
//     Called @0xe3ff9f from getPixelFormatLists to allocate a 0x18-byte pair.
//   __ZdlPv  (operator delete(void*))              @Flexo __stubs 0x1497404
//     Called 4× in D2 (@0xe3fe85, @0xe3fe8d, @0xe3fea3, and via D0's tail @0xe3fe07).
//   _CFRelease                                     @Flexo __stubs 0x149484e
//     Called once per non-null ValueNode.cfRef in D2 @0xe3fe9b.
//   __ZN14Synchronizable4LockEv   Synchronizable::Lock()   (address not in our stub map;
//     called at @0xe3ff53 in getPixelFormatLists via direct callq — decoded via c++filt)
//   __ZN14SynchronizableD1Ev      Synchronizable::~Synchronizable()
//     called at @0xe3fe40 in D2 via direct callq — decoded via c++filt
//   _kSupportedPixelFormats      RIP-relative data table (@0xe3fff4 in getPixelFormatLists)
//     A static table of every pixel format the manager can emit. Frontier data.
//
// FRONTIER CALLEES (throwing stubs — not decoded here):
//   Synchronizable::Lock, Synchronizable::Unlock, Synchronizable::~Synchronizable
//   std::__tree::__find_equal, __find_leaf, __tree_balance_after_insert, __tree::destroy
//   operator new (__Znwm), operator delete (__ZdlPv), _CFRelease
//   The 311-line getPixelFormatLists body itself (bit-field decode +
//     _kSupportedPixelFormats table walk + per-format compatibility filtering + list
//     assembly). Its ENTRY-SEQUENCE bit-field decode is documented below.

/**
 * A single pixel format entry in the tail chain of a ValueNode. Its two-slot shape is
 * recovered from D2 @0xe3fe79..@0xe3fe8d. The payload is opaque (D2 never inspects it).
 */
export interface PixelFormatListElement {
  /** +0x00 — raw heap buffer describing one pixel format's flags. Freed on dtor. */
  payload: object | null;
  /** +0x08 — Clang scratch-store target — see PORTING_SPEC's "dead-write" rationale. */
  scratch: object | null;
}

/**
 * The struct stored at Node.value (@Node+0x28). One per cache entry, holding the
 * computed list of pixel formats plus an optional CFType summary that dependents may
 * borrow. Its two slots are decoded exhaustively from D2 @0xe3fe6c..@0xe3fea3.
 */
export interface PixelFormatListValue {
  /** +0x00 — head of the (single-element observed) list. Freed in D2 with scratch pattern. */
  head: PixelFormatListElement | null;
  /** +0x08 — an owned CFTypeRef. CFRelease'd in D2. Modeled as an opaque handle. */
  cfRef: object | null;
}

/**
 * A libc++ __tree_node for the pair<uint64_t const, PixelFormatListValue*> map. Mirrors
 * the 0x30-byte layout recovered above.
 */
interface MapNode {
  /** +0x00 */ left: MapNode | null;
  /** +0x08 */ right: MapNode | null;
  /** +0x10 */ parent: MapNode | null;
  /** +0x18 */ isBlack: boolean;
  /** +0x20 */ key: bigint;
  /** +0x28 */ value: PixelFormatListValue | null;
}

/**
 * PixelFormatListManager — a thread-safe cache from flag-word to pixel-format list.
 *
 * The class is HEAP-ALLOCATED in native FCP (D0 exists and tail-calls `operator
 * delete(this)`). Its D1→D2 trampoline pattern is the standard Itanium-ABI split.
 */
export class PixelFormatListManager {
  /**
   * +0x08 — leftmost cache of the libc++ __tree. Null when empty (native asm uses the
   * &(this+0x10) sentinel-address self-loop; we normalize to `null`).
   */
  mapLeftmost: MapNode | null = null;

  /** +0x10 — the RB-tree root. */
  mapRoot: MapNode | null = null;

  /** +0x18 — element count. Not read by destructor, mirrored for provenance. */
  mapSize: bigint = 0n;

  /**
   * +0x20 — embedded Synchronizable sub-object. Its concrete shape is decided by
   * Synchronizable's own port (frontier). We hold a placeholder here so any code that
   * needs to grab the lock can see the slot exists.
   */
  sync: object = Object.freeze({ __placeholder: "Synchronizable" });

  /**
   * PixelFormatListManager::getPixelFormatLists(u64 flags) @Flexo 0xe3ff30
   *
   * ENTRY (fully decoded — the bit-field decomposition of the 64-bit flag word):
   *   0xe3ff41  r14 = flags (%rsi)                    ; the flag word
   *   0xe3ff47  rdi += 0x20                            ; take &this->sync for Lock()
   *   0xe3ff53  Synchronizable::Lock(&this->sync)      ; MUTUAL EXCLUSION START
   *   0xe3ff58..@0xe3ff90  libc++ __find_equal on (this + 0x10) for key == flags.
   *                        HIT → returns cached value (path off @0xe3ff90 → @0xe40287,
   *                        which is out-of-frame; the epilogue Unlocks and returns).
   *   0xe3ff9a..@0xe3ffbd  MISS → new 0x18-byte pair-node (__Znwm), fill with:
   *                                left=right=0 (xmm0 store); +0x10 = 0 (parent).
   *   0xe3ffba..@0xe3ffe8  BIT-FIELD DECOMPOSITION of flags:
   *                          r13 = (flags >> 8) & 0x3    ; 2 bits — "colorspace class"
   *                          rdx = (flags >> 6) & 0xff   ; 8 bits — subrange? (see below)
   *                          rsi = (flags >> 4) & 0x3    ; 2 bits — bit-depth class
   *                          rdi = (flags >> 2) & 0x3    ; 2 bits — chroma
   *                          r8  = flags       & 0x3    ; 2 bits — component-count
   *                        The (>> 6) shift on `dl` (the low byte of rdx) uses the FULL
   *                        byte — this is 8 significant bits, likely a further-decoded
   *                        capability field. We stash them all as named locals below.
   *   0xe3ffe4..@0xe4000e  Constants: 0x8 (loop stride?), 0x3FFFFFFFFFFFFFFF, 0x7FFFFFFFFFFFFFFC.
   *                        These are libc++ pointer-tagging masks for the SBO-style
   *                        vector<PixelFormatListElement> that is likely being built
   *                        on the stack before being copied into the ValueNode.
   *   0xe3fff4  leaq _kSupportedPixelFormats(%rip), %r15
   *                        ; scan-base pointer for the format table.
   *   … (240+ lines of table walking, per-entry compatibility checks against the decoded
   *      bit-fields, per-hit list-cell append, and a final __tree_balance_after_insert
   *      + Unlock + return sequence — not transcribed here).
   *
   * The full 311-line body will demand a decoded _kSupportedPixelFormats data table and
   * a decoded Synchronizable, __tree_balance_after_insert, and inner-list helpers. All
   * of those are FRONTIER — this method throws with a targeted stub that a caller can
   * follow back to concrete decoding work.
   */
  getPixelFormatLists(flags: bigint): PixelFormatListValue | null {
    // @0xe3ff41 — capture flags (already the input).
    void flags;

    // @0xe3ff47..@0xe3ff53 — Synchronizable::Lock(&this->sync). Frontier: not ported.
    // We deliberately DO NOT stub this as an in-place no-op — call the frontier so the
    // demand signal is visible.
    synchronizableLock(this.sync);

    // @0xe3ff58..@0xe3ff90 — __find_equal on this.mapRoot for key == flags. This
    // returns the existing PixelFormatListValue* on HIT.
    //   (Reusable across cachedPathsForQuals; when that helper is ported to a shared
    //    location we should route here too. For now: frontier stub.)
    const cached = this._findEqual(flags);
    if (cached !== null) {
      // @0xe40287 (out-of-frame) → Unlock + return cached value.
      synchronizableUnlock(this.sync);
      return cached.value;
    }

    // @0xe3ff9a..@0xe3ffe8 — allocate a 0x18-byte pair node, decode bit-fields.
    // We stash the field decode here for provenance; the actual pixel-format-list
    // computation (which fills the new ValueNode) is frontier.
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const componentCount = Number(flags & 0x3n);              // @0xe3ffe5 — r8 & 0x3
    const chroma         = Number((flags >> 2n) & 0x3n);      // @0xe3ffd9 — rdi & 0x3
    const bitDepthClass  = Number((flags >> 4n) & 0x3n);      // @0xe3ffce — rsi & 0x3
    const capabilityBits = Number((flags >> 6n) & 0xffn);     // @0xe3ffc8 — dl (byte shift by 6)
    const colorspaceCls  = Number((flags >> 8n) & 0x3n);      // @0xe3ffbd — r13 & 0x3
    /* eslint-enable @typescript-eslint/no-unused-vars */

    // Everything from here on is the frontier: the 240+ lines of table walking and
    // list building against _kSupportedPixelFormats. Throw with the exact call-site.
    throw new Error(
      "PixelFormatListManager.getPixelFormatLists: 311-line list-build " +
        "(@Flexo 0xe3ff30, body @0xe3ffe8..@0xe40287) not decoded; requires " +
        "_kSupportedPixelFormats table walk + libc++ __tree insert + " +
        "Synchronizable::Unlock — all frontier."
    );
  }

  /**
   * D1 @0xe3f640 — 5-byte trampoline into D2.
   * Body: `pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp D2`.
   * We simply forward.
   */
  D1(): void {
    // @0xe3f645 — jmp __ZN22PixelFormatListManagerD2Ev.
    this.D2();
  }

  /**
   * D0 @0xe3fdf0 — deleting destructor: calls D2 then tail-calls operator delete(this).
   *
   * Body:
   *   0xe3fdf4  push %rbx; push %rax                           ; frame + align
   *   0xe3fdf6  movq %rdi, %rbx                                ; save this
   *   0xe3fdf9  callq D2                                       ; run base dtor
   *   0xe3fdfe  movq %rbx, %rdi                                ; arg = this
   *   0xe3fe07  jmp  __ZdlPv                                    ; delete this
   */
  D0(): void {
    // @0xe3fdf9 — run D2.
    this.D2();
    // @0xe3fe07 — tail-call __ZdlPv(this). In JS: mark invalidated.
    (this as { _deleted?: boolean })._deleted = true;
  }

  /**
   * D2 @0xe3fe10 — the real destructor body.
   *
   * Structure (matches the disasm exactly — see file header for offset table):
   *   0xe3fe21..@0xe3fe28  install this class's vtable slot.
   *   0xe3fe2b  r13 = this.mapLeftmost                         ; start of tree
   *   0xe3fe2f  r12 = &this.mapRoot                             ; sentinel addr
   *   0xe3fe33  if r13 == r12: goto EMPTY (@0xe3fe38)          ; empty → skip walk
   *   ── walk body (@0xe3fe68..@0xe3feda) ─────────────────────
   *   For each map node r13 in in-order:
   *     r14 = r13.value @+0x28
   *     if r14 != null:
   *       r15 = r14.head @+0x00
   *       if r15 != null:
   *         rdi = r15.payload @+0x00
   *         if rdi != null:
   *           r15.scratch = rdi     ; scratch write
   *           operator delete(rdi)
   *         operator delete(r15)
   *       rdi = r14.cfRef @+0x08
   *       if rdi != null: CFRelease(rdi)
   *       operator delete(r14)
   *     rcx = r13.right @+0x08
   *     if rcx != null:
   *       descend to leftmost of right subtree, then continue
   *     else:
   *       walk-up until we came from a left child (parent read from +0x10;
   *       is-left-child test via `cmpq (%rax),%r13` — parent.left == r13);
   *       when leftmost <- sentinel, break.
   *   ── EMPTY (@0xe3fe38..@0xe3fe5a) ─────────────────────────
   *   Synchronizable::~Synchronizable(&this.sync)               [@0xe3fe40]
   *   tail-call std::__tree::destroy(this.mapRoot)              [@0xe3fe5a]
   */
  D2(): void {
    // @0xe3fe21..@0xe3fe28 — install this class's vtable slot.
    (this as { _vtableActive?: string })._vtableActive = "PixelFormatListManager";

    // Walk phase.
    let cur: MapNode | null = this.mapLeftmost;
    while (cur !== null) {
      // @0xe3fe68..@0xe3fea3 — free the value struct (if any) held in this node.
      const v = cur.value;
      if (v !== null) {
        const head = v.head;
        if (head !== null) {
          const payload = head.payload;
          if (payload !== null) {
            // @0xe3fe81 — scratch write.
            head.scratch = payload;
            // @0xe3fe85 — operator delete(payload).
            operatorDelete(payload);
          }
          // @0xe3fe8d — operator delete(head).
          operatorDelete(head);
        }
        const cfRef = v.cfRef;
        if (cfRef !== null) {
          // @0xe3fe9b — CFRelease.
          cfRelease(cfRef);
        }
        // @0xe3fea3 — operator delete(v).
        operatorDelete(v);
      }

      // @0xe3fea8..@0xe3feda — advance to in-order successor.
      if (cur.right !== null) {
        cur = cur.right;
        while (cur.left !== null) cur = cur.left;
      } else {
        let p: MapNode | null = cur.parent;
        while (p !== null && p.right === cur) {
          cur = p;
          p = p.parent;
        }
        cur = p;
      }
    }

    // @0xe3fe38..@0xe3fe40 — destroy the embedded Synchronizable.
    synchronizableDestroy(this.sync);

    // @0xe3fe5a — tail-call libc++ __tree::destroy on the root (post-order node free).
    treeDestroy(this.mapRoot);
    this.mapLeftmost = null;
    this.mapRoot = null;
    this.mapSize = 0n;
  }

  /**
   * Local __find_equal helper mirroring the loop @0xe3ff58..@0xe3ff90 in
   * getPixelFormatLists. Reused here (and could later be lifted to a shared libc++
   * helper alongside cachedPathsForQuals._findEqual).
   */
  private _findEqual(key: bigint): MapNode | null {
    let x: MapNode | null = this.mapRoot;
    let best: MapNode | null = null;
    while (x !== null) {
      if (key < x.key) {
        x = x.left;
      } else {
        best = x;
        x = x.right;
      }
    }
    if (best === null) return null;
    if (best.key > key) return null;
    return best.key === key ? best : null;
  }
}

// ============================================================================================
// FRONTIER STUBS — each cites the exact call-site @address.
// ============================================================================================

/** @Flexo callq __ZN14Synchronizable4LockEv @0xe3ff53 */
function synchronizableLock(_sync: object): void {
  throw new Error(
    "PixelFormatListManager: Synchronizable::Lock not ported (@Flexo @0xe3ff53)"
  );
}
/** @Flexo the Unlock in getPixelFormatLists's Unlock+return epilogue (@0xe40287+) */
function synchronizableUnlock(_sync: object): void {
  throw new Error(
    "PixelFormatListManager: Synchronizable::Unlock not ported (@Flexo epilogue " +
      "at end of getPixelFormatLists — see disasm around @0xe40287+)"
  );
}
/** @Flexo callq __ZN14SynchronizableD1Ev @0xe3fe40 */
function synchronizableDestroy(_sync: object): void {
  throw new Error(
    "PixelFormatListManager: Synchronizable::~Synchronizable not ported (@Flexo @0xe3fe40)"
  );
}
/** @Flexo callq __ZdlPv (multiple sites: @0xe3fe85 / @0xe3fe8d / @0xe3fea3 / @0xe3fe07) */
function operatorDelete(_p: object): void {
  throw new Error(
    "PixelFormatListManager: operator delete not decoded " +
      "(@Flexo __stubs 0x1497404 — call sites @0xe3fe85, @0xe3fe8d, @0xe3fea3)"
  );
}
/** @Flexo callq _CFRelease @0xe3fe9b */
function cfRelease(_cf: object): void {
  throw new Error(
    "PixelFormatListManager: CFRelease not decoded (@Flexo __stubs 0x149484e — call @0xe3fe9b)"
  );
}
/** @Flexo jmp __ZNSt3__16__treeI...E7destroyE... @0xe3fe5a (tail-call in D2) */
function treeDestroy(_root: MapNode | null): void {
  throw new Error(
    "PixelFormatListManager: std::__tree::destroy not ported (@Flexo @0xe3fe5a)"
  );
}
