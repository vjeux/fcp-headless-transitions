// cachedPathsForQuals — a per-project cache of "arranged path" lookups keyed by
// a 64-bit "arrangement id" produced by -[FFSVContext arranged] / +[FFProject arranged:].
// The class is an intrusive libc++ std::map<uint64_t, id> (RB-tree with a class-embedded
// sentinel), plus a size counter, used by Flexo's shot/quality routing to memoize the
// FFProject lookup for a given (project, arrangement) pair. The class name comes from
// the mangled prefix _ZN19cachedPathsForQuals... — this is FCP's own name.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly saved at:
//   raw-port/re/disasm/Flexo.cachedPathsForQuals.lookupPathForContext.s   (@0xfc7520)
//   raw-port/re/disasm/Flexo.cachedPathsForQuals.D1.s                     (@0xfc7750)
//   raw-port/re/disasm/Flexo.cachedPathsForQuals.D2.s                     (@0xfc76c0)
//
// THREE EXPORTED SYMBOLS:
//   @Flexo 0xfc7520  __ZN19cachedPathsForQuals20lookupPathForContextEP10FFProviderP11FFSVContext
//                     cachedPathsForQuals::lookupPathForContext(FFProvider*, FFSVContext*)
//   @Flexo 0xfc7750  __ZN19cachedPathsForQualsD1Ev  ~cachedPathsForQuals() [D1: complete]
//   @Flexo 0xfc76c0  __ZN19cachedPathsForQualsD2Ev  ~cachedPathsForQuals() [D2: base]
// D1 (@0xfc7750) and D2 (@0xfc76c0) are byte-identical bodies (differ only in address).
// This is the standard libc++ RB-tree destructor pattern for a class that has no virtual
// bases and no vtable — D1 == D2, and there is NO D0 (the class is not virtual, so
// `delete p` on a base ptr can't reach it; only local/embedded destruction is possible,
// which is what D1/D2 handle).
//
// STRUCT LAYOUT (recovered EXHAUSTIVELY from all three functions — every offset that is
// ever read or written has a consistent meaning):
//
//   +0x00  Node* leftmost      // "leftmost" cache used by std::map's __tree_iterator::begin().
//                              // Destructors: `movq (%rdi), %r12` @0xfc775e/@0xfc76ce loads it,
//                              // then the in-order traversal walks up from here.
//                              // Non-empty when != &sentinel (i.e. != this+0x08).
//                              // NULLed via `movq %rax, (%rbx)` @0xfc7663 during rebalancing when
//                              // a leftmost insert happens (the new node becomes leftmost).
//   +0x08  Node* root          // pointer to the RB-tree root. This is the "sentinel" node's
//                              // parent slot — libc++ uses `this + offsetof(sentinel)` as the
//                              // header's back-pointer, hence `leaq 0x8(%rdi), %r14` @0xfc76d1
//                              // and the comparison "leftmost == &this->root" as the empty check.
//                              // Also read as `movq 0x8(%rdi), %rsi` @0xfc772f to pass to the
//                              // tree-destroy tail-call.
//                              // Insert path @0xfc7666 loads it as the "hint parent" for
//                              // __tree_balance_after_insert (via `movq 0x8(%rbx), %rdi`).
//   +0x10  size_t size         // element count; incremented after successful insert via
//                              //   `incq 0x10(%rbx)` @0xfc7672.
//
// sizeof(cachedPathsForQuals) is 0x18 bytes.
//
// NODE LAYOUT (an intrusive libc++ __tree_node<T> with T = pair<uint64_t const, id>,
// hoisted to 0x30 bytes — allocated via `movl $0x30, %edi; callq __Znwm` @0xfc7632/@0xfc7637):
//
//   +0x00  Node* left          // set to nullptr on insert via `movups %xmm0, (%rax)` @0xfc764e
//                              //   (zeros +0x00 AND +0x08 at once via xmm0=0).
//                              // Read in the dtor traversal @0xfc7713 as `movq (%rcx), %rcx`
//                              // (left-descent to leftmost of right subtree).
//   +0x08  Node* right         // also zeroed by the same xmm0 store. Read @0xfc7700 as
//                              //   `movq 0x8(%r12), %rcx` (right subtree check).
//   +0x10  Node* parent        // set to r12 (previous node before insert) via
//                              //   `movq %r12, 0x10(%rax)` @0xfc7651.
//                              // Read in the "up-and-right" phase @0xfc7720 as `movq
//                              //   0x10(%r12), %rax` (walk to parent), then compare to
//                              //   (parent).left == this (`cmpq (%rax), %r12`) to detect
//                              //   "I was the right child, keep going up" vs "I was the left".
//   +0x18  bool is_black       // (also color bit + padding). Not read by ANY of these three
//                              // functions — set implicitly by __tree_balance_after_insert
//                              // (out-of-line). Assume libc++ layout.
//   +0x20  uint64_t key        // the arrangement-id key. Stored on insert @0xfc763f as
//                              //   `movq %r14, 0x20(%rax)` (r14 held the +[FFProject
//                              //   arranged:] result). Compared during lookup @0xfc7592
//                              //   `cmpq %r14, 0x20(%rax)` and @0xfc760f
//                              //   `movq 0x20(%rcx), %rcx; cmpq %rcx, %r14`.
//   +0x28  id value            // the retained ObjC path object. Stored on insert @0xfc767e
//                              //   `movq %rax, 0x28(%r13)` (rax = retained lookup result).
//                              // ZERO-INITIALIZED first via `movq $0x0, 0x28(%rax)` @0xfc7643
//                              //   (the retain happens BEFORE the tree slot is filled; the
//                              //   window between the alloc and the value-store is where we
//                              //   would leak the retain on an out-of-memory in the balance;
//                              //   Clang emits it this way to satisfy strict exception-safety).
//                              // Read in the destructor traversal @0xfc76f8 as `movq
//                              //   0x28(%r12), %rdi` passed to _objc_release.
//                              // Read in the found-path @0xfc76b8 as `movq 0x28(%r13), %r12`
//                              //   (this is the return value on cache hit).
//
// sizeof(Node) is 0x30 bytes.
//
// LIBC++ TREE TAIL-CALL (the destructor's terminal `jmp`):
//   __ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEE...E7destroyE...
//   -> std::__1::__tree<pair<uint32_t, FFAudioPlayerSourceInfo*>, ...>::destroy(...)
//   This symbol name says <unsigned int, FFAudioPlayerSourceInfo*> — mismatched with the
//   64-bit key we observe here. That is a Clang LINKER ALIAS: the tree-destroy
//   template body is byte-compatible across any (key, value) pair of the same size class
//   (pointer-sized) and same node offsets, so the linker folds identical bodies into one
//   symbol. The type-name in the symbol reflects whichever template happened to be
//   emitted first in this translation-unit's link order; do NOT read it as the actual
//   value type of THIS map. The observed node offsets (key@0x20 is 64-bit, value@0x28
//   is an id) are ground truth.
//
// LIBC++ HELPERS resolved:
//   __ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_
//     -> void std::__1::__tree_balance_after_insert(__tree_node_base<void*>*, __tree_node_base<void*>*)
//     Called @0xfc766d after the raw-slot store. Frontier — throwing stub below.
//   __Znwm    (operator new(unsigned long))  @Flexo __stubs 0x1497452
//     Called @0xfc7637 to allocate the 0x30-byte tree node.
//
// OBJC RUNTIME IMPORTS observed:
//   _objc_release @Flexo (loaded via `movq 0x926027/0x92616a(%rip), %r15` in dtor and lookup).
//   _objc_retain   @Flexo (loaded via `callq *0x92611b(%rip)` @0xfc75ef during insert).
//   Selector refs (all loaded as `movq <RIP>(%rip), %rsi` into the second-arg selector reg
//   right before `callq *%r13`/`*%r15`):
//     @0xfc7548  → SEL "arranged"           on `%r14` (the FFSVContext ctx)
//     @0xfc7566  → SEL "arranged:"          on +_OBJC_CLASS_$_FFProject (class method)
//     @0xfc75c0  → SEL "arranged"           on `-0x38(%rbp)` (the FFProvider provider)
//     @0xfc75d5  → SEL — the "path finder" class method on +[FFProject <sel>...] taking
//                        (id provider, id arrangedProject, unsigned selectionKey) — this is
//                        the actual "compute the path" side-call whose result is cached.
//
// FRONTIER CALLEES (throwing stubs — not decoded here):
//   FFThreadBlockTallyGetCurrent, FFThreadBlockTallyStartTimer,
//   FFThreadBlockTallyStopTimer                                (thread-perf instrumentation)
//   -[FFSVContext arranged]                                    (returns 32-bit arrangement id)
//   +[FFProject arranged:(uint32_t)]                           (map arrangement id → project?)
//   -[FFProvider arranged]                                     (secondary arranged call)
//   +[FFProject <path-lookup-sel>:(FFProvider*, id, uint32_t)] (the actual heavy path lookup)
//   objc_retain, objc_release                                  (ARC bridge)
//   std::__tree_balance_after_insert                           (RB rebalance)
//   operator new (__Znwm)                                      (0x30-byte node alloc)
//   std::__tree::destroy                                       (post-order tree free)

/**
 * Opaque ObjC pointer type — arbitrary Objective-C object handled via retain/release.
 * The cache's value type is what +[FFProject <path-lookup-sel>:] returns; it is neither
 * inspected nor cast anywhere in the three decoded functions.
 */
export type ObjCId = object | null;

/** Forward-declared frontier types (no decoded members — they only enter as callee args). */
export type FFProvider = object;
export type FFSVContext = object;

/**
 * One entry of the intrusive RB-tree. Mirrors the 0x30-byte libc++ __tree_node layout
 * recovered from the insert path @0xfc7632..@0xfc767e.
 */
interface Node {
  /** +0x00 — left child.  Zeroed on alloc @0xfc764e. */
  left: Node | null;
  /** +0x08 — right child. Zeroed on alloc @0xfc764e. */
  right: Node | null;
  /** +0x10 — parent link. Set on alloc @0xfc7651 to the pre-insert hint node. */
  parent: Node | null;
  /** +0x18 — color bit + padding. Set by __tree_balance_after_insert (frontier). */
  isBlack: boolean;
  /** +0x20 — 64-bit arrangement key (result of +[FFProject arranged:] cast to u64). */
  key: bigint;
  /** +0x28 — the retained ObjC path value. Zero-initialized @0xfc7643, filled @0xfc767e. */
  value: ObjCId;
}

/**
 * cachedPathsForQuals — a project-arrangement path memoizer.
 *
 * INVARIANT: when empty, `leftmost === null` AND the notional sentinel loops back to
 * itself. In native FCP the sentinel is the class instance's own `+0x08` slot; in JS we
 * represent "empty" as `leftmost === null && root === null && size === 0`.
 */
export class cachedPathsForQuals {
  /** +0x00 — the leftmost (smallest-key) node in the tree, or null when empty. */
  leftmost: Node | null = null;
  /** +0x08 — the tree root, or null when empty. */
  root: Node | null = null;
  /** +0x10 — element count. */
  size: bigint = 0n;

  /**
   * cachedPathsForQuals::lookupPathForContext(FFProvider*, FFSVContext*) @Flexo 0xfc7520
   *
   * Structure of the disassembly:
   *   ── perf instrumentation ─────────────────────────────────────────────
   *   @0xfc753b  callq _FFThreadBlockTallyGetCurrent      ; %rax = tally
   *   @0xfc7543  callq _FFThreadBlockTallyStartTimer      ; start(tally, ???)
   *   ── build the 64-bit lookup key from (ctx, project) ──────────────────
   *   @0xfc7548  movq 0xc015d1(%rip), %rsi                ; SEL "arranged"
   *   @0xfc754f  movq 0x92616a(%rip), %r15                ; @sel objc_msgSend
   *   @0xfc7559  callq *%r15                              ; ctx.arranged  → %r12d (u32)
   *   @0xfc755f  leaq _OBJC_CLASS_$_FFProject(%rip), %rdi
   *   @0xfc7566  movq 0xc034f3(%rip), %rsi                ; SEL "arranged:"
   *   @0xfc756f  callq *%r15                              ; +[FFProject arranged:%edx=r12d]
   *   @0xfc7572  movq %rax, %r14                          ; %r14 = 64-bit map key
   *   ── binary search the tree for `key == r14` ──────────────────────────
   *   @0xfc7575..@0xfc75af  standard libc++ __tree::__find_equal loop:
   *     start from root at (this+0x08). At each node: rcx = (r14 < node.key ? 1 : 0),
   *     step to left/right child at offset (0 or 8). Track the "insertion parent" in
   *     %r13. On loop exit: if r13!=&sentinel AND r13.key <= r14 → HIT (jump to
   *     0xfc76a6). Otherwise → MISS (fall through, insert path).
   *   ── HIT path @0xfc76a6..@0xfc76bc ────────────────────────────────────
   *     @0xfc76a6  callq _FFThreadBlockTallyGetCurrent
   *     @0xfc76ae  movl $0x14, %esi                       ; timer id = 0x14
   *     @0xfc76b3  callq _FFThreadBlockTallyStopTimer
   *     @0xfc76b8  movq 0x28(%r13), %r12                   ; hit.value → return
   *     @0xfc76bc  jmp   0xfc7694                          ; common epilogue
   *   ── MISS path @0xfc75b5..@0xfc7694 ───────────────────────────────────
   *     @0xfc75b5  leaq _OBJC_CLASS_$_FFProject(%rip), %rax  ; class for the msgSend
   *     @0xfc75c0  movq 0xbf2739(%rip), %rsi              ; SEL — provider.arranged
   *     @0xfc75c7  movq -0x38(%rbp), %rdi                 ; %rdi = provider
   *     @0xfc75d2  callq *%r13                             ; provider.arranged → %rax
   *     @0xfc75d5  movq 0xc100d4(%rip), %rsi              ; SEL — the path finder
   *     @0xfc75e0  movq %rax, %rdx                         ; arg3 = arranged provider
   *     @0xfc75e3  movl %r12d, %ecx                        ; arg4 = ctx arranged (u32)
   *     @0xfc75e6  callq *%r13                             ; +[FFProject <sel>:…] → path
   *     @0xfc75ef  callq *_objc_retain@GOT                 ; retain the path
   *     @0xfc75f5..@0xfc7623  __tree::__find_leaf: descend from root, picking left when
   *                          r14 < node.key, right otherwise, until reaching a null
   *                          child slot. That slot's address ends up in %r15 for the
   *                          store-through-child-link.
   *     @0xfc7632  movl $0x30, %edi
   *     @0xfc7637  callq __Znwm                            ; new node (frontier)
   *     @0xfc763f  movq %r14, 0x20(%rax)                   ; node.key = r14
   *     @0xfc7643  movq $0x0, 0x28(%rax)                   ; node.value = nil (temp)
   *     @0xfc764b  xorps %xmm0, %xmm0
   *     @0xfc764e  movups %xmm0, (%rax)                    ; node.left = right = null
   *     @0xfc7651  movq %r12, 0x10(%rax)                   ; node.parent = insert parent
   *     @0xfc7655  movq %rax, (%r15)                       ; parent.<slot> = &node
   *     @0xfc7658..@0xfc7663  update leftmost cache when new node becomes leftmost
   *     @0xfc766d  callq __tree_balance_after_insert       ; frontier
   *     @0xfc7672  incq 0x10(%rbx)                          ; ++size
   *     @0xfc767e  movq %rax, 0x28(%r13)                    ; node.value = retained path
   *     ── same tally-stop → return ─────────────────────────────────────
   *     @0xfc7682  callq _FFThreadBlockTallyGetCurrent
   *     @0xfc768a  movl $0x14, %esi
   *     @0xfc768f  callq _FFThreadBlockTallyStopTimer
   *     @0xfc7694..@0xfc76a5  epilogue; return %r12 (path)
   *
   * The method is a two-layer bundle of frontier callees:
   *   • unresolved ObjC selectors (arranged / arranged: / provider.arranged / path-finder)
   *   • unported libc++ RB-tree primitives (__find_equal, __find_leaf, balance_after_insert)
   *   • unported FFThreadBlockTally instrumentation
   * Per the porting spec, we transcribe the FLOW, cite every callee by address, and route
   * the actual work to throwing stubs. A downstream caller that hits this will be visibly
   * blocked with a concrete list of what to decode next — that IS the intended behavior.
   */
  lookupPathForContext(provider: FFProvider, ctx: FFSVContext): ObjCId {
    // @0xfc753b..@0xfc7543 — start the thread-block-tally timer for this lookup.
    const tallyStart = ffThreadBlockTallyGetCurrent();
    ffThreadBlockTallyStartTimer(tallyStart);

    // @0xfc7548..@0xfc7572 — build the 64-bit map key from the (ctx, project) pair.
    const ctxArranged = objcMsgSendArranged(ctx);              // @0xfc7559 → %r12d
    const key = objcMsgSendArrangedClass(ctxArranged);         // @0xfc756f → %r14 (id-as-u64)

    // @0xfc7575..@0xfc75af — __tree::__find_equal(key). HIT: return cached value.
    const hit = this._findEqual(key);
    if (hit !== null) {
      // HIT: @0xfc76a6..@0xfc76b8 — stop timer, return node.value.
      ffThreadBlockTallyStopTimer(ffThreadBlockTallyGetCurrent(), 0x14);
      return hit.value;
    }

    // MISS: @0xfc75b5..@0xfc767e — compute the path then insert.
    const provArranged = objcMsgSendProviderArranged(provider);         // @0xfc75d2
    const computedPath = objcMsgSendPathFinder(provider, provArranged,  // @0xfc75e6
                                               ctxArranged);
    const retained = objcRetain(computedPath);                          // @0xfc75ef

    // @0xfc75f5..@0xfc7623 — __tree::__find_leaf: descend to the null slot for `key`.
    const [parent, slotIsLeft] = this._findLeaf(key);

    // @0xfc7632..@0xfc7663 — new node (0x30 bytes), link it in.
    const node: Node = {
      left: null,           // @0xfc764e — xmm0-zeroed
      right: null,          // @0xfc764e — xmm0-zeroed
      parent,               // @0xfc7651
      isBlack: false,       // set by balance_after_insert
      key,                  // @0xfc763f
      value: null,          // @0xfc7643 — nil'd BEFORE the store below
    };
    if (parent === null) {
      // First insert: root and leftmost both become this node.
      this.root = node;
      this.leftmost = node;
    } else {
      if (slotIsLeft) parent.left = node; else parent.right = node;
      // @0xfc7658..@0xfc7663 — leftmost cache update.
      if (slotIsLeft && parent === this.leftmost) {
        this.leftmost = node;
      }
    }

    // @0xfc766d — __tree_balance_after_insert(root, node). Frontier: recolors + rotations.
    treeBalanceAfterInsert(this.root, node);

    // @0xfc7672 — ++size (as native 64-bit incq).
    this.size = (this.size + 1n) & 0xFFFFFFFFFFFFFFFFn;

    // @0xfc767e — node.value = retained path.
    node.value = retained;

    // @0xfc7682..@0xfc768f — stop timer, return path.
    ffThreadBlockTallyStopTimer(ffThreadBlockTallyGetCurrent(), 0x14);

    // @0xfc7694..@0xfc76a5 — epilogue: return %r12 (== retained path == node.value).
    return retained;
  }

  /**
   * Mirrors the libc++ __tree::__find_equal loop @0xfc7579..@0xfc75af.
   * Returns the node whose key equals `key`, or null when no such node exists.
   */
  private _findEqual(key: bigint): Node | null {
    // @0xfc7579  x = this.root; if x==null → miss
    // @0xfc7590  loop:  cl = (key < x.key ? 1 : 0)
    //                   if !cl: best = x
    //                   x = (cl ? x.left : x.right)
    //                   if x != null: goto loop
    // @0xfc75a6  if best == &this.root → miss
    // @0xfc75ab  if best.key > key → miss
    let x: Node | null = this.root;
    let best: Node | null = null;
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

  /**
   * Mirrors the libc++ __tree::__find_leaf loop @0xfc75f5..@0xfc7623.
   * Returns the (parent, slotIsLeft) pair identifying the null child slot where a new
   * node with `key` should be linked in.
   */
  private _findLeaf(key: bigint): [Node | null, boolean] {
    if (this.root === null) return [null, true];  // empty tree — parent==null path

    let parent: Node = this.root;
    for (;;) {
      if (key < parent.key) {
        if (parent.left === null) return [parent, true];
        parent = parent.left;
      } else if (key > parent.key) {
        if (parent.right === null) return [parent, false];
        parent = parent.right;
      } else {
        // key == parent.key. Unreachable when called after __find_equal returned null.
        throw new Error(
          "cachedPathsForQuals._findLeaf: unreachable — duplicate key after __find_equal miss"
        );
      }
    }
  }

  /**
   * cachedPathsForQuals::~cachedPathsForQuals() [D1 @0xfc7750 == D2 @0xfc76c0]
   *
   * The body performs an in-order traversal of the tree, calling _objc_release on each
   * node's `value` (offset +0x28), then tail-calls libc++ __tree::destroy to free the
   * node storage in post-order. The class has NO vtable, hence no D0.
   *
   * Literal control flow (D1 side, addrs match D2 mod +0x90):
   *   @0xfc775e  r12 = this.leftmost                        ; start at leftmost
   *   @0xfc7761  r14 = &this.root                            ; sentinel address
   *   @0xfc7765  if r12 == r14: goto EMPTY (@0xfc77bf)      ; empty tree short-circuit
   *   @0xfc776a  r15 = _objc_release                         ; cached callee
   *   ── release-and-advance loop ─────────────────────────
   *   @0xfc7788  release(r12.value @+0x28)
   *   @0xfc7790  rcx = r12.right @+0x08
   *   @0xfc7795  if rcx == 0:                                 (no right subtree)
   *   @0xfc77b0    ; walk up: r12 = r12.parent @+0x10
   *   @0xfc77b5    ; if parent.left == r12: continue (was left child, stop)
   *   @0xfc77b8    ; else keep walking up (was right child)
   *   @0xfc77bb    ; jne 0xfc77b0  (loop)
   *              else: descend to leftmost of right subtree
   *   @0xfc77a0    rax = rcx
   *   @0xfc77a3    rcx = rcx.left @+0x00
   *   @0xfc77a6    if rcx: goto 0xfc77a0
   *   @0xfc77ab    goto 0xfc7780 (r12 = rax; loop)
   *   @0xfc77bf  EMPTY: rsi = this.root @+0x08
   *   @0xfc77ce  tail-call __tree<...>::destroy(this, rsi)   ; frontier
   *
   * The in-order walk uses libc++'s standard __tree_iterator::__tree_next idiom.
   */
  D1(): void {
    this._runDtorBody();
  }

  /**
   * D2 body @0xfc76c0..@0xfc773e is BYTE-IDENTICAL to D1. Route through shared body.
   * Kept as a distinct method because the mangled name is a separate exported symbol.
   */
  D2(): void {
    this._runDtorBody();
  }

  /** Shared destructor body used by D1/D2 (byte-identical in the framework). */
  private _runDtorBody(): void {
    if (this.leftmost === null) {
      treeDestroy(this.root);
      this.root = null;
      this.size = 0n;
      return;
    }
    let cur: Node | null = this.leftmost;
    while (cur !== null) {
      // @0xfc7788 — objc_release(cur.value).
      objcRelease(cur.value);

      // @0xfc7790..@0xfc77bb — advance to in-order successor.
      if (cur.right !== null) {
        cur = cur.right;
        while (cur.left !== null) cur = cur.left;
      } else {
        let p: Node | null = cur.parent;
        while (p !== null && p.right === cur) {
          cur = p;
          p = p.parent;
        }
        cur = p;
      }
    }
    // @0xfc77bf..@0xfc77ce — post-order free of all nodes.
    treeDestroy(this.root);
    this.leftmost = null;
    this.root = null;
    this.size = 0n;
  }
}

// ============================================================================================
// FRONTIER STUBS — each cites the exact call-site @address in the disassembly.
// ============================================================================================

/** @Flexo callq _FFThreadBlockTallyGetCurrent @0xfc753b / @0xfc7682 / @0xfc76a6 */
function ffThreadBlockTallyGetCurrent(): unknown {
  throw new Error(
    "cachedPathsForQuals: FFThreadBlockTallyGetCurrent not decoded " +
      "(@Flexo callq _FFThreadBlockTallyGetCurrent — C symbol from libFFThreadBlockTally)"
  );
}
/** @Flexo callq _FFThreadBlockTallyStartTimer @0xfc7543 */
function ffThreadBlockTallyStartTimer(_tally: unknown): void {
  throw new Error(
    "cachedPathsForQuals: FFThreadBlockTallyStartTimer not decoded (@Flexo @0xfc7543)"
  );
}
/** @Flexo callq _FFThreadBlockTallyStopTimer @0xfc768f / @0xfc76b3 */
function ffThreadBlockTallyStopTimer(_tally: unknown, _timerId: number): void {
  throw new Error(
    "cachedPathsForQuals: FFThreadBlockTallyStopTimer not decoded (@Flexo @0xfc768f, timer id 0x14)"
  );
}
/** @Flexo callq *%r15 @0xfc7559 — objc_msgSend(ctx, sel "arranged") returning u32. */
function objcMsgSendArranged(_ctx: FFSVContext): number {
  throw new Error(
    "cachedPathsForQuals: -[FFSVContext arranged] not decoded (@Flexo @0xfc7559, sel_ref @0xfc7548)"
  );
}
/** @Flexo callq *%r15 @0xfc756f — +[FFProject arranged:(u32)] → id (interpreted as u64 key). */
function objcMsgSendArrangedClass(_ctxArranged: number): bigint {
  throw new Error(
    "cachedPathsForQuals: +[FFProject arranged:] not decoded (@Flexo @0xfc756f, sel_ref @0xfc7566)"
  );
}
/** @Flexo callq *%r13 @0xfc75d2 — the "provider.arranged" side call on the miss path. */
function objcMsgSendProviderArranged(_provider: FFProvider): ObjCId {
  throw new Error(
    "cachedPathsForQuals: -[FFProvider arranged] (miss-path) not decoded (@Flexo @0xfc75d2, sel_ref @0xfc75c0)"
  );
}
/** @Flexo callq *%r13 @0xfc75e6 — +[FFProject <path-finder-sel>:] returning the actual path. */
function objcMsgSendPathFinder(_provider: FFProvider, _arrangedProv: ObjCId, _ctxArranged: number): ObjCId {
  throw new Error(
    "cachedPathsForQuals: +[FFProject <path-finder-sel>:] not decoded (@Flexo @0xfc75e6, sel_ref @0xfc75d5)"
  );
}
/** @Flexo callq *_objc_retain @0xfc75ef */
function objcRetain(_o: ObjCId): ObjCId {
  throw new Error(
    "cachedPathsForQuals: _objc_retain not decoded (@Flexo callq *_objc_retain @0xfc75ef)"
  );
}
/** @Flexo callq *%r15 @0xfc778d / @0xfc76fd — _objc_release */
function objcRelease(_o: ObjCId): void {
  throw new Error(
    "cachedPathsForQuals: _objc_release not decoded (@Flexo callq *_objc_release @0xfc778d / @0xfc76fd)"
  );
}
/** @Flexo callq __ZNSt3__127__tree_balance_after_insertB9nqe210106... @0xfc766d */
function treeBalanceAfterInsert(_root: Node | null, _newNode: Node): void {
  throw new Error(
    "cachedPathsForQuals: std::__tree_balance_after_insert not ported (@Flexo callq @0xfc766d)"
  );
}
/** @Flexo jmp __ZNSt3__16__treeI...E7destroyE... @0xfc77ce / @0xfc773e (tail-call in dtor) */
function treeDestroy(_root: Node | null): void {
  throw new Error(
    "cachedPathsForQuals: std::__tree::destroy not ported (@Flexo jmp @0xfc77ce / @0xfc773e)"
  );
}
