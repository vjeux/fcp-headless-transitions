// HGLUTCacheManager.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * HGLUTCacheManager::HGLUTCacheManager(HGRenderer*)  [C1] @Helium 0xdfc50
//     __ZN17HGLUTCacheManagerC1EP10HGRenderer
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN17HGLUTCacheManagerC1EP10HGRenderer.s
//
// NOT ported here (separate ledger entries): the C2 base-object ctor @0xdfc30, the D1/D2 dtors
// @0xdfd90/@0xdfc70, `clear()` @0xdfca0 and `getLUTCache(HGLUTCache::LUTEntryFactory*)`
// @0xdfdc0. `clear()` is quoted below as LAYOUT EVIDENCE only.
//
// THE C1/C2 TWIN. `HGLUTCacheManagerC2EP10HGRenderer` @0xdfc30 is a byte-for-byte identical body
// at a different address (the complete-object and base-object constructors of a class with no
// virtual bases). They are NOT ICF-folded — `nm` gives them distinct addresses — so C2 remains
// its own ledger unit and this file ports only C1. Whoever claims C2 should extend this file
// add-only rather than restating the class.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// NONE. No callq, no vtable store, no allocation: the object has no vptr and its only member
// needing construction is an empty libc++ tree, which the compiler inlines to two stores.
// `depgraph.py deps __ZN17HGLUTCacheManagerC1EP10HGRenderer` reports nothing.
//
// -----------------------------------------------------------------------------
// FULL DISASM (9 instructions, @0xdfc50..@0xdfc68)
// -----------------------------------------------------------------------------
//   0xdfc50  pushq  %rbp                     ; frame prologue
//   0xdfc51  movq   %rsp, %rbp
//   0xdfc54  movq   %rsi, (%rdi)             ; this->renderer = the HGRenderer* argument
//   0xdfc57  leaq   0x10(%rdi), %rax         ; rax = &this->cachesEndNode  (this + 0x10)
//   0xdfc5b  xorps  %xmm0, %xmm0
//   0xdfc5e  movups %xmm0, 0x10(%rdi)        ; end node .__left_ = null AND size = 0, in ONE
//                                            ;   16-byte store covering +0x10..+0x1f
//   0xdfc62  movq   %rax, 0x8(%rdi)          ; __begin_node_ = &end node   (the empty-tree
//                                            ;   invariant: begin() == end())
//   0xdfc66  popq   %rbp                     ; epilogue
//   0xdfc67  retq
//   0xdfc68  nopl   (%rax,%rax)              ; padding — not executed
//
// Note the ORDER: the 16 bytes at +0x10 are zeroed BEFORE +0x08 is written, and +0x08 receives
// an interior pointer to this same object. The port reproduces both.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT — 0x20 bytes, and the map's exact type
// -----------------------------------------------------------------------------
// The member at +0x08..+0x1f is a libc++ `std::__1::map`, and its INSTANTIATION is named
// outright by a symbol in this binary:
//
//   __ZNSt3__16__treeINS_12__value_typeIPN10HGLUTCache15LUTEntryFactoryEPS2_EE… @Helium 0x1bae0
//     = std::__1::__tree<std::__1::__value_type<HGLUTCache::LUTEntryFactory*, HGLUTCache*>, …>
//       ::destroy(std::__1::__tree_node<…>*)
//
// so the container is `std::map<HGLUTCache::LUTEntryFactory*, HGLUTCache*>` — a factory-keyed
// cache registry, which is exactly what `getLUTCache(HGLUTCache::LUTEntryFactory*)` @0xdfdc0
// implies. libc++ lays a `__tree` out as
//     +0x00 __begin_node_   +0x08 __pair1_ (the embedded __end_node_)   +0x10 __pair3_ (size)
// (the compare and allocator are empty and contribute no storage), which places, relative to
// THIS object:
//
//   offset  size  field                         proven by
//   ------  ----  ----------------------------  ---------------------------------------------
//   +0x00   0x08  HGRenderer* renderer          movq %rsi,(%rdi)            @0xdfc54 (ctor)
//   +0x08   0x08  __begin_node_                 movq %rax,0x8(%rdi)         @0xdfc62 (ctor)
//                                               movq 0x8(%rbx),%r14         @0xdfce3 (clear)
//   +0x10   0x08  __end_node_.__left_ (= root)  movups %xmm0,0x10(%rdi)     @0xdfc5e (ctor)
//                                               movq 0x10(%rbx),%rdi        @0xdfcc4 (clear,
//                                                 passed to std::__tree_remove as the root)
//   +0x18   0x08  size_type size                (same movups zeroes it)     @0xdfc5e (ctor)
//                                               cmpq $0x0,0x18(%rdi)        @0xdfca0 (clear)
//                                               decq 0x18(%rbx)             @0xdfcc0 (clear)
//
// The three map offsets are therefore each proven TWICE, by the ctor that writes them and by
// `clear()` @0xdfca0 that reads them back — `clear` loops while the count at +0x18 is non-zero,
// takes the leftmost node from +0x08, calls `std::__tree_remove` with the root from +0x10, and
// `operator delete`s the node. That independent confirmation is why the layout below is named
// rather than left as opaque bytes (PORTING_SPEC Rule 5).
//
// -----------------------------------------------------------------------------
// ORACLE — differential against the live binary, 512 cases, 0 divergences
// -----------------------------------------------------------------------------
// raw-port/re/oracle/HGLUTCacheManager_ctor_oracle.py. The symbol is EXPORTED (`nm` class `T`),
// but it is called the same way as the local ones — at x86_64 vmaddr + the loaded image's slide,
// under `arch -x86_64 /usr/bin/python3` so dyld maps the x86_64 slice these addresses come from
// (OPS_LOG "wrong architecture").
//
// Each case constructs into a 0xAA-poisoned 0x80-byte buffer with a random renderer pointer, and
// checks all four facts at once:
//   * +0x00 holds the argument verbatim                     — 0 mismatches
//   * +0x08 holds the ADDRESS of the object + 0x10, i.e. the empty-tree self-reference (this is
//     the one a port can get subtly wrong, e.g. by storing null) — 0 mismatches
//   * +0x10 and +0x18 are both zero                         — 0 mismatches
//   * NO byte outside +0x00..+0x1f is touched — the object really is 0x20 bytes of construction
//                                                            — 0 mismatches
// The C2 twin @0xdfc30 was run through the identical checks in the same harness and produced
// byte-identical results on all 512 cases, which is the evidence for the twin claim above.

import type { HGRenderer } from "./HGRenderer";

/**
 * The libc++ `std::__tree` END NODE embedded at `HGLUTCacheManager + 0x10`.
 *
 * In libc++'s red-black tree the container stores an `__end_node_` whose only meaningful member
 * is `__left_` — the tree ROOT — and `end()` is an iterator onto the ADDRESS of that node. The
 * ctor zeroes it (`movups %xmm0, 0x10(%rdi)` @0xdfc5e) and `clear()` @0xdfcc4 loads the same
 * slot and hands it to `std::__tree_remove` as the root. Only `__left_` is decoded; no other
 * member of the node is read or written by any ported code, so none is invented.
 *
 * Same shape as the landed `OZSceneListTreeEndNode` in OZSceneList.ts.
 */
export interface HGLUTCacheManagerTreeEndNode {
  /**
   * `+0x10` — `__end_node_.__left_`, the tree ROOT pointer. Null (empty tree) after the ctor.
   * Held as `unknown` because the node type
   * (`std::__tree_node<std::__value_type<HGLUTCache::LUTEntryFactory*, HGLUTCache*>>`) is not
   * decoded by this unit.
   */
  left: unknown | null;
}

/**
 * A `std::map<HGLUTCache::LUTEntryFactory*, HGLUTCache*>::iterator` — in the Itanium ABI a bare
 * `__tree` node pointer, which is either a real element node or the container's embedded end
 * node ({@link HGLUTCacheManagerTreeEndNode}). Element-node internals are never dereferenced by
 * this unit, so that arm stays an opaque brand (the OZSceneList.ts precedent).
 */
export type HGLUTCacheManagerTreeIterator =
  | HGLUTCacheManagerTreeEndNode
  | { readonly __hgLutCacheManagerTreeNode: unique symbol };

/**
 * `HGLUTCacheManager` — Helium's per-renderer registry of `HGLUTCache`s, keyed by the factory
 * that creates their entries. A 0x20-byte object: an HGRenderer back-pointer followed by an
 * inline `std::map`. No vptr (the ctor stores none) and no allocation.
 */
export class HGLUTCacheManager {
  /**
   * `+0x00  HGRenderer* renderer` — the renderer this manager belongs to, stored verbatim from
   * the ctor argument (`movq %rsi,(%rdi)` @0xdfc54). Never dereferenced by the ctor.
   */
  renderer: HGRenderer | null = null;

  /**
   * `+0x10  __end_node_` — the map's embedded end node; its `left` is the tree root.
   * Declared BEFORE `cachesBegin` below so the field initialisers can express the ctor's
   * `__begin_node_ = &__end_node_` self-reference.
   */
  cachesEndNode: HGLUTCacheManagerTreeEndNode = { left: null };

  /**
   * `+0x08  __begin_node_` — the leftmost node of the map, or the end node itself when the map
   * is empty. The ctor's `leaq 0x10(%rdi),%rax` / `movq %rax,0x8(%rdi)` pair (@0xdfc57 /
   * @0xdfc62) is libc++'s empty-tree invariant `__begin_node_ == __end_node()`, and holding a
   * JS reference to {@link cachesEndNode} IS that interior pointer.
   */
  cachesBegin: HGLUTCacheManagerTreeIterator = this.cachesEndNode;

  /**
   * `+0x18  size_type size` — the number of entries. Zeroed by the ctor's 16-byte store; read
   * by `clear()` @0xdfca0 (`cmpq $0x0,0x18(%rdi)`) and decremented there (`decq 0x18(%rbx)`).
   * A `size_t` in the machine; modelled as `number` because a container's element count cannot
   * approach 2^53 (PORTING_SPEC Rule 4 asks for bigint only where the value can).
   */
  cachesSize: number = 0;

  /**
   * `HGLUTCacheManager::HGLUTCacheManager(HGRenderer*)` [C1] — @Helium 0xdfc50
   *   (__ZN17HGLUTCacheManagerC1EP10HGRenderer)
   *
   * Faithful transcription of the whole 9-instruction body: store the renderer, zero the map's
   * end node and size, then point `__begin_node_` at the end node. See the file header for the
   * listing, the layout proof from `clear()`, and the 512-case differential.
   *
   * @param renderer — the `HGRenderer*` argument (SysV `%rsi`), stored verbatim and not
   *                   dereferenced.
   */
  constructor(renderer: HGRenderer | null) {
    // @0xdfc54 movq %rsi, (%rdi) — the argument goes in unexamined; a null renderer is stored
    // as-is, exactly as the machine would (there is no test of %rsi anywhere in the body).
    this.renderer = renderer;

    // @0xdfc5b xorps %xmm0,%xmm0 ; @0xdfc5e movups %xmm0, 0x10(%rdi)
    //   ONE 16-byte store covering BOTH +0x10 and +0x18: the end node's root pointer becomes
    //   null and the size becomes 0. This happens BEFORE the +0x08 store below.
    this.cachesEndNode = { left: null };
    this.cachesSize = 0;

    // @0xdfc57 leaq 0x10(%rdi),%rax ; @0xdfc62 movq %rax, 0x8(%rdi)
    //   __begin_node_ = &__end_node_ — libc++'s empty-tree invariant, i.e. begin() == end().
    //   Storing the reference to the object created just above IS that interior pointer.
    this.cachesBegin = this.cachesEndNode;

    // @0xdfc66..0xdfc67 — epilogue + retq. Nothing else is written: verified live, no byte of
    // the object outside +0x00..+0x1f changes.
  }
}
