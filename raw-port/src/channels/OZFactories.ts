// OZFactories.ts — raw transcription of ProChannel `OZFactories`.
//
// `OZFactories` is ProChannel's global factory registry (the singleton that
// `getInstance` @0x0c68 hands out, populated by `addChannelFactories` @0x0d5a /
// `addFactory` @0x1750). ONE method is transcribed in this file — the
// thread-local factory-load-id map accessor. Its siblings (getInstance, the
// ctors/dtors, addFactory, addChannelFactories, setFactoryLoadID,
// clearFactoryLoadIDs, lookupFactory, findFactory, findCommonFactory,
// saveFactories) are NOT ported here; do not add them without their own
// disassembly and address citations.
//
// Provenance (ProChannel framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel
//
// Symbol ported in this file:
//   @0x2932  OZFactories::getFactoryLoadMap()
//              __ZN11OZFactories17getFactoryLoadMapEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN11OZFactories17getFactoryLoadMapEv ProChannel`):
//   raw-port/re/disasm/ProChannel.__ZN11OZFactories17getFactoryLoadMapEv.s (25 lines)
//
// ---------------------------------------------------------------------------
// WHAT THE FUNCTION IS
// ---------------------------------------------------------------------------
// A lazily-created, PER-THREAD `std::map<unsigned int, OZFactory*>`. The map
// pointer lives in pthread thread-specific storage under the ProChannel file-
// static key `(anonymous namespace)::sThreadKey`
// (`__ZN12_GLOBAL__N_110sThreadKeyE`, read @0x2938 and again @0x2967). On the
// first call from a given thread the slot is empty, so the function
// heap-allocates a 24-byte libc++ `__tree` (`operator new(0x18)` @0x2951),
// initialises it to the canonical EMPTY-tree form, installs it in TLS
// (`pthread_setspecific` @0x2971) and returns it. Every later call on that
// same thread returns the identical pointer (@0x294a `jne 0x2976`).
//
// The map's element type is NOT visible in this body — it is proven by the
// three siblings that call this function and then touch the returned tree
// (read from the binary as evidence, NOT transcribed here; each is its own
// ledger unit):
//
//   * `OZFactories::setFactoryLoadID(unsigned int, OZFactory*)` @0x2980 calls us
//     @0x2995 and passes the result straight to
//       std::__1::__tree<std::__1::__value_type<unsigned int, OZFactory*>,
//         std::__1::__map_value_compare<unsigned int,
//           std::__1::pair<unsigned int const, OZFactory*>,
//           std::__1::less<unsigned int>, true>,
//         std::__1::allocator<std::__1::pair<unsigned int const, OZFactory*>>>
//       ::__emplace_unique_key_args<...>   (callq @0x29b2)
//     then stores the `OZFactory*` into the new node at `0x28(%rax)` @0x29b7.
//     That mangled callee is what fixes the instantiation:
//     `std::map<unsigned int, OZFactory*>`.
//   * `OZFactories::lookupFactory(unsigned int)` @0x29f2 calls us @0x29fa, reads
//     the root from `0x8(%rax)` @0x29ff, walks the red-black tree comparing the
//     u32 key at `0x20(%rdx)` @0x2a11, and returns the node's value from
//     `0x28(%rcx)` @0x2a38 — i.e. key @+0x20, value @+0x28 inside the node.
//   * `OZFactories::clearFactoryLoadIDs()` @0x29c4 calls us @0x29cb, destroys the
//     root subtree via `__tree<...>::destroy` @0x29de, and then re-runs EXACTLY
//     the same three-slot reset this function performs on a fresh allocation:
//     `movq %r14,(%rbx)` @0x29e3 (with r14 = rax+8 @0x29d3), `xorps %xmm0,%xmm0`
//     @0x29e6, `movups %xmm0,0x8(%rbx)` @0x29e9. That is independent
//     confirmation of the empty-tree encoding decoded below.
//
// ---------------------------------------------------------------------------
// LAYOUT — libc++ `__tree` container, 0x18 bytes (the `movl $0x18,%edi` @0x294c)
// ---------------------------------------------------------------------------
//   struct __tree {                       // the std::map<unsigned int, OZFactory*> body
//     __node_base*   __begin_node_;       // +0x00  written @0x2964 (`movq %rax,(%rbx)`)
//     __end_node                          // +0x08  its only field is __left_ = the ROOT
//     size_t         __size_;             // +0x10
//   };                                    // 0x00..0x18 — matches operator new(0x18)
//
// Offset evidence, all from THIS body plus the siblings cited above:
//   +0x00  `movq %rax,(%rbx)` @0x2964 stores rbx+8 (computed @0x2959) — the
//          empty-tree invariant `__begin_node_ == &__end_node_`.
//   +0x08  the 16-byte `movups %xmm0,0x8(%rbx)` @0x2960 zeroes it (root = null)
//          and `lookupFactory` reads the root back from `0x8(%rax)` @0x29ff.
//   +0x10  the same 16-byte store zeroes the size word.
//
//   struct __tree_node {                  // 0x30 bytes; NOT allocated here
//     __tree_node* __left_;               // +0x00  walked @0x2a1c in lookupFactory
//     __tree_node* __right_;              // +0x08  walked @0x2a1c (index rsi = 0/1)
//     void*        __parent_;             // +0x10  (not read by any body cited here)
//     bool         __is_black_;           // +0x18  (not read by any body cited here)
//     unsigned int key;                   // +0x20  `cmpl %ebx,0x20(%rdx)` @0x2a11
//     OZFactory*   value;                 // +0x28  `movq 0x28(%rcx),%rax` @0x2a38
//   };
// The node type is modelled here only because it is the element type of the
// container this function returns; this function never allocates or reads one.
//
// ---------------------------------------------------------------------------
// CALLEES — three, all TRUE out-of-scope externs (no in-scope callee at all;
// `depgraph.py deps __ZN11OZFactories17getFactoryLoadMapEv` lists nothing, and
// there is no indirect or virtual dispatch in the body):
//   _pthread_getspecific  stub @0xacf66  (callq @0x293f)   — libSystem
//   __Znwm                stub @0xace4c  (callq @0x2951)   — operator new(size_t)
//   _pthread_setspecific  stub @0xacf78  (callq @0x2971)   — libSystem
// How each is modelled (none of them is stubbed with a throw — all three have
// exact, observable JS equivalents):
//   * pthread get/setspecific — the pthread_key_t value itself is unobservable
//     in JS; what is observable is the per-thread slot it indexes. The port runs
//     on Node's single JS thread, so that slot is one module-level binding, the
//     same convention the landed `OZChannelTimeConverter.ts` uses for its own
//     `_pthread_getspecific`-backed per-thread counter. A worker-per-thread
//     runtime would swap the binding for a per-worker map.
//   * operator new(0x18) — a 24-byte allocation whose three slots are exactly
//     the three fields above; in TS that is object construction. The
//     initialising stores are then transcribed one-for-one, in disasm order.
//
// `this` (%rdi) is never read by the body — the incoming register is dead from
// the first instruction (it is overwritten @0x2938 by the sThreadKey load).
// The three in-framework callers (@0x2995, @0x29cb, @0x29fa) all reach it with
// a plain `callq`, leaving whatever `this` they held in %rdi. It is therefore
// ported as a free function with no parameters (the mangling of a STATIC member
// `OZFactories::getFactoryLoadMap()` is byte-identical to the non-static one, so
// the symbol name cannot decide it; the body can, and the body ignores `this`).

/**
 * A libc++ `__tree_node<__value_type<unsigned int, OZFactory*>, void*>` — one
 * entry of the per-thread factory-load-id map. 0x30 bytes.
 *
 * This function neither allocates nor dereferences a node; the shape is
 * recorded because it is the element type of the container being returned, and
 * every offset below is cited from a sibling body (see the file header):
 * key @+0x20 (`cmpl %ebx,0x20(%rdx)` @0x2a11), value @+0x28
 * (`movq 0x28(%rcx),%rax` @0x2a38), children @+0x00/+0x08 (`movq (%rdx,%rsi,8),%rdx`
 * @0x2a1c), and the standard libc++ `__parent_`/`__is_black_` pair at +0x10/+0x18.
 *
 * @ProChannel 0x2932 (container); node offsets @0x2a11/@0x2a1c/@0x2a38.
 */
export interface OZFactoryLoadMapNode {
  /** +0x00 `__left_` */
  left: OZFactoryLoadMapNode | null;
  /** +0x08 `__right_` */
  right: OZFactoryLoadMapNode | null;
  /** +0x10 `__parent_` — points at another node, or at the tree's end node. */
  parent: OZFactoryLoadMapNode | OZFactoryLoadMapEndNode | null;
  /** +0x18 `__is_black_` (1 byte). */
  isBlack: boolean;
  /** +0x20 the `unsigned int` factory-load id (the map key). */
  key: number;
  /**
   * +0x28 the `OZFactory*` value. `OZFactory` is a separate ledger unit and is
   * never dereferenced through this map by the ported body, so the pointer is
   * carried opaquely rather than typed against a class this unit did not decode.
   */
  value: unknown;
}

/**
 * The embedded `__tree_end_node` living at container offset +0x08. Its single
 * field is `__left_`, which libc++ uses as the tree's ROOT pointer — that is
 * the slot `lookupFactory` reads with `movq 0x8(%rax),%rdx` @0x29ff.
 *
 * @ProChannel 0x2932 (zeroed by `movups %xmm0,0x8(%rbx)` @0x2960)
 */
export interface OZFactoryLoadMapEndNode {
  /** +0x08 of the container — `__end_node_.__left_`, i.e. the tree root. */
  left: OZFactoryLoadMapNode | null;
}

/**
 * `std::map<unsigned int, OZFactory*>` — the 0x18-byte libc++ `__tree` body
 * allocated by `operator new(0x18)` @0x294c/@0x2951.
 *
 * @ProChannel 0x2932
 */
export interface OZFactoryLoadMap {
  /**
   * +0x00 `__begin_node_`. For an EMPTY tree libc++ points it at the container's
   * own `__end_node_` (address `this + 0x08`) — that is precisely the
   * `addq $0x8,%rax` @0x2959 / `movq %rax,(%rbx)` @0x2964 pair.
   */
  beginNode: OZFactoryLoadMapNode | OZFactoryLoadMapEndNode;
  /** +0x08 `__pair1_` = the embedded `__tree_end_node` whose `__left_` is the root. */
  endNode: OZFactoryLoadMapEndNode;
  /** +0x10 `__pair3_` = `__size_`, the element count. */
  size: number;
}

/**
 * The value held in pthread thread-specific storage under
 * `(anonymous namespace)::sThreadKey` (`__ZN12_GLOBAL__N_110sThreadKeyE`, loaded
 * @0x2938 and @0x2967), i.e. what `_pthread_getspecific` @0x293f returns.
 *
 * `null` models the native NULL the slot holds before this thread's first call
 * (@0x2947 `testq %rax,%rax`). The port runs on one JS thread, so one binding is
 * the whole of that thread's TLS — the same modelling the landed
 * `OZChannelTimeConverter.ts` uses for its `_pthread_getspecific` counter.
 */
let _sThreadKeyValue: OZFactoryLoadMap | null = null;

/**
 * `OZFactories::getFactoryLoadMap()`
 *   — @ProChannel 0x2932
 *   — __ZN11OZFactories17getFactoryLoadMapEv
 *
 * Returns this thread's `std::map<unsigned int, OZFactory*>`, creating an empty
 * one on first use and installing it in thread-specific storage.
 *
 * Full transcription — every instruction, in order:
 *
 *   0x2932  pushq %rbp                        ; frame setup (no TS counterpart)
 *   0x2933  movq  %rsp, %rbp                  ; frame setup (no TS counterpart)
 *   0x2936  pushq %rbx                        ; callee-saved (no TS counterpart)
 *   0x2937  pushq %rax                        ; stack align (no TS counterpart)
 *   0x2938  movq  sThreadKey(%rip), %rdi      ; rdi = (anon)::sThreadKey
 *   0x293f  callq _pthread_getspecific        ; rax = this thread's slot value
 *   0x2944  movq  %rax, %rbx                  ; rbx = slot value
 *   0x2947  testq %rax, %rax                  ; flags on slot value
 *   0x294a  jne   0x2976                      ;   already created -> return it
 *   0x294c  movl  $0x18, %edi                 ; sizeof(__tree) = 24
 *   0x2951  callq __Znwm                      ; rax = operator new(24)
 *   0x2956  movq  %rax, %rbx                  ; rbx = the new tree
 *   0x2959  addq  $0x8, %rax                  ; rax = &tree->__end_node_ (rbx+8)
 *   0x295d  xorps %xmm0, %xmm0                ; xmm0 = 16 zero bytes
 *   0x2960  movups %xmm0, 0x8(%rbx)           ; root = null AND size = 0
 *   0x2964  movq  %rax, (%rbx)                ; __begin_node_ = &__end_node_
 *   0x2967  movq  sThreadKey(%rip), %rdi      ; rdi = (anon)::sThreadKey
 *   0x296e  movq  %rbx, %rsi                  ; rsi = the new tree
 *   0x2971  callq _pthread_setspecific        ; install it for this thread
 *   0x2976  movq  %rbx, %rax                  ; return the tree (both paths)
 *   0x2979  addq  $0x8, %rsp                  ; frame teardown (no TS counterpart)
 *   0x297d  popq  %rbx                        ; frame teardown (no TS counterpart)
 *   0x297e  popq  %rbp                        ; frame teardown (no TS counterpart)
 *   0x297f  retq                              ; single exit for both paths
 *
 * Decode notes:
 *   * `testq %rax,%rax ; jne` @0x2947/@0x294a is the plain NULL test on the TLS
 *     value — taken when the slot is NON-null, which jumps straight to the
 *     shared `movq %rbx,%rax` exit @0x2976. So an already-created map is
 *     returned untouched: no re-allocation, no second `pthread_setspecific`.
 *   * `movups %xmm0,0x8(%rbx)` @0x2960 is ONE 16-byte store covering TWO fields
 *     (+0x08 root and +0x10 size); it is written out as the two field
 *     assignments it performs, in that order.
 *   * the store order the machine uses is: zero +0x08..+0x18 FIRST (@0x2960),
 *     THEN write __begin_node_ (@0x2964). The transcription keeps that order.
 *   * `__begin_node_ = rbx + 0x8` is not a fresh object — it is the address of
 *     the container's OWN embedded end node, so the port assigns the identical
 *     object reference (`storage.endNode`), preserving the libc++ invariant
 *     `begin() == end()` for an empty map that `clearFactoryLoadIDs` @0x29e3
 *     re-establishes with the very same instruction pair.
 *
 * @returns the calling thread's factory-load-id map (never null; created empty
 *          on first call).
 */
export function OZFactories_getFactoryLoadMap(): OZFactoryLoadMap {
  // @0x2938-0x293f  movq sThreadKey(%rip),%rdi ; callq _pthread_getspecific
  // @0x2944         movq %rax,%rbx
  let tree = _sThreadKeyValue;

  // @0x2947-0x294a  testq %rax,%rax ; jne 0x2976 — a non-null slot short-circuits
  //                 to the shared exit, so everything below is the first-call path.
  if (tree === null) {
    // @0x294c-0x2951  movl $0x18,%edi ; callq __Znwm — 24 bytes of raw storage:
    //                 +0x00 __begin_node_, +0x08 __end_node_.__left_, +0x10 __size_.
    // @0x2956         movq %rax,%rbx
    const endNode = {} as OZFactoryLoadMapEndNode;
    const storage = { endNode } as OZFactoryLoadMap;

    // @0x2959  addq $0x8,%rax — rax = &storage.endNode (the container's +0x08).
    const endNodeAddr: OZFactoryLoadMapEndNode = storage.endNode;

    // @0x295d-0x2960  xorps %xmm0,%xmm0 ; movups %xmm0,0x8(%rbx) — one 16-byte
    //                 zero store covering both trailing fields.
    storage.endNode.left = null; // +0x08 root = null
    storage.size = 0; // +0x10 size = 0

    // @0x2964  movq %rax,(%rbx) — __begin_node_ = &__end_node_ (empty-tree form).
    storage.beginNode = endNodeAddr;

    // @0x2967-0x2971  movq sThreadKey(%rip),%rdi ; movq %rbx,%rsi ;
    //                 callq _pthread_setspecific — install for this thread.
    _sThreadKeyValue = storage;

    // @0x2956/@0x2971 keep the new tree in %rbx, which is what the exit returns.
    tree = storage;
  }

  // @0x2976-0x297f  movq %rbx,%rax ; ... ; retq
  return tree;
}
