// OZSceneList.ts — Ozone's process-wide registry of live `OZScene`s.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice; VA == offset in the slice)
//
// `OZSceneList` is a `PCSingleton` subclass (base ctor
// `PCSingleton::PCSingleton(unsigned int)` @Ozone 0x816cc, base dtor
// @0x8174d) that owns the set of scenes currently alive, plus the mutex
// callers must hold while iterating that set.
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED IN THIS FILE (one C++ method = one member citing its @0xADDR)
// -----------------------------------------------------------------------------
//   * OZSceneList::getIterationMutex()   @Ozone 0x81820
//     __ZN11OZSceneList17getIterationMutexEv
//     DECODE: raw-port/re/disasm/__ZN11OZSceneList17getIterationMutexEv.s
//   * OZSceneList::end()                 @Ozone 0x81810
//     __ZN11OZSceneList3endEv
//     DECODE: raw-port/re/disasm/__ZN11OZSceneList3endEv.s
//
// Every other member (instance @0x4d4e0, addScene @0x4d570, removeScene
// @0x4e7a0, the ctors @0x81670 / @0x816c0, the dtors @0x81710 / @0x81760 /
// @0x817b0, begin @0x81800) is NOT ported here — this file is
// ADD-ONLY and each lands as its own member when its unit is claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT — every offset cited to the instruction it was recovered from
// -----------------------------------------------------------------------------
// Evidence: the default ctor `OZSceneList::OZSceneList()` @Ozone 0x816c0
// (raw-port/re/disasm/__ZN11OZSceneListC2Ev.s), the dtor @0x81710
// (raw-port/re/disasm/__ZN11OZSceneListD2Ev.s), and the two iterator
// accessors begin @0x81800 / end @0x81810.
//
//   OZSceneList : PCSingleton {
//     +0x00  vptr                     [ctor @0x816d1 `leaq 0x7b1438(%rip),%rax`
//                                      -> @0x816d8 `movq %rax,(%rbx)`, installed
//                                      after `PCSingleton::PCSingleton(0)`
//                                      @0x816cc; the dtor reinstalls the base
//                                      vptr @0x81719/@0x81720]
//     +0x08  PCMutex iterationMutex   [ctor @0x816db `leaq 0x8(%rbx),%rdi` ->
//                                      @0x816df `callq PCMutex::PCMutex()`;
//                                      dtor @0x8173b/@0x8173f
//                                      `leaq 0x8(%rbx),%rdi ; callq ~PCMutex()`;
//                                      its ADDRESS is what getIterationMutex
//                                      returns @0x81824]
//     +0x50  __tree __begin_node      [ctor @0x816e4/@0x816ef store `this+0x58`
//                                      here; `begin()` @0x81804 returns it
//                                      verbatim (`movq 0x50(%rdi),%rax`)]
//     +0x58  __tree __pair1_ (root)   [ctor @0x816eb `movups %xmm0,0x58(%rbx)`
//     +0x60  __tree __pair3_ (size)    zeroes both words; `end()` @0x81814
//                                      returns `&this[+0x58]`; the dtor passes
//                                      `this+0x50` and `*(this+0x58)` to
//                                      `std::__tree<PCHash128, std::less<PCHash128>,
//                                       std::allocator<PCHash128>>::destroy`
//                                      @0x81736 — which is what identifies the
//                                      container as a std::set<PCHash128>]
//   }
//
// The mutex occupies +0x08..+0x4f (0x48 bytes: the ProCore `PCMutex` vptr plus
// its embedded `pthread_mutex_t`), bounded below by the ctor's PCMutex
// construction at +0x08 and above by the first tree field at +0x50.
//
// FRONTIER CALLEES: none for this unit — `getIterationMutex` is a leaf (no
// calls, no externs, no indirect/virtual dispatch).
//
// Per PORTING_SPEC.md Rules 1, 2, 5, 6.

import { PCMutex } from "../infra/PCMutex";

/**
 * The libc++ `std::__tree` END NODE embedded at `OZSceneList + 0x58`.
 *
 * In libc++'s red-black tree the container stores an `__end_node_` whose only
 * meaningful member is `__left_` — the tree ROOT — and `end()` is an iterator
 * onto the ADDRESS of that node. That is exactly what the binary does here:
 *   * the ctor @Ozone 0x816eb zeroes the 16 bytes at +0x58 with one
 *     `movups %xmm0, 0x58(%rbx)` (root = null, size = 0 — the empty tree), and
 *     @0x816e4/@0x816ef stores `this+0x58` into the `__begin_node_` slot at
 *     +0x50, which is libc++'s empty-tree invariant (`__begin_node_ ==
 *     __end_node()`);
 *   * the dtor @0x81736 hands `this+0x50` and `*(this+0x58)` to
 *     `std::__tree<PCHash128, …>::destroy`;
 *   * `end()` @0x81814 returns `&this[+0x58]`.
 * Only `__left_` is decoded — no other member of the node is read or written
 * by any ported code, so none is invented.
 */
export interface OZSceneListTreeEndNode {
  /**
   * `+0x58` — `__end_node_.__left_`, i.e. the tree ROOT pointer. Zeroed (null,
   * empty tree) by the ctor's `movups %xmm0, 0x58(%rbx)` @Ozone 0x816eb. Held
   * as `unknown` because the node type (`std::__tree_node<PCHash128>`) is not
   * decoded by this unit.
   */
  left: unknown | null;
}

export class OZSceneList {
  /**
   * `+0x08  PCMutex iterationMutex` — the lock callers hold while walking the
   * scene set.
   *
   * Constructed in place by the default ctor (`leaq 0x8(%rbx), %rdi`
   * @Ozone 0x816db followed by `callq PCMutex::PCMutex()` @0x816df) and
   * destroyed in place by the dtor (`leaq 0x8(%rbx), %rdi` @0x8173b /
   * `callq PCMutex::~PCMutex()` @0x8173f) — i.e. an embedded sub-object, not a
   * pointer. Modelled as a live `PCMutex` instance so a JS reference to it IS
   * the `&(this+0x08)` address {@link OZSceneList.getIterationMutex} returns.
   */
  iterationMutexAt8: PCMutex = new PCMutex();

  /**
   * `OZSceneList::getIterationMutex()` — Ozone @0x00081820
   * (mangled `__ZN11OZSceneList17getIterationMutexEv`).
   *
   * Full transcription — every instruction of the function, in order
   * (raw-port/re/disasm/__ZN11OZSceneList17getIterationMutexEv.s):
   *
   *   0x81820  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x81821  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x81824  leaq  0x8(%rdi), %rax      ; return &this->iterationMutex
   *   0x81828  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x81829  retq                       ; return that address
   *   0x8182a  nopw  (%rax,%rax)          ; alignment padding, not executed
   *
   * `leaq` computes an EFFECTIVE ADDRESS — it does not dereference, does not
   * lock, and does not copy. (Compare the sibling `begin()` @0x81800, which on
   * the neighbouring slot DOES load: `movq 0x50(%rdi), %rax`.) The C++
   * signature is therefore `PCMutex& getIterationMutex()`: the caller gets a
   * reference to the embedded mutex so it can lock it itself — a by-value
   * return is impossible for a non-copyable pthread wrapper.
   *
   * The faithful TS equivalent of returning `&member` is returning the member
   * object, because a JS object value is already a reference: the caller locks
   * the same instance the list owns, exactly as in the binary.
   *
   * Zero callees, zero externs, zero indirect calls, no null check.
   *
   * @returns the embedded iteration mutex at `this + 0x08`.
   */
  getIterationMutex(): PCMutex {
    // @Ozone 0x81824: leaq 0x8(%rdi), %rax
    return this.iterationMutexAt8;
  }

  /**
   * `+0x58  std::__tree __end_node_` — the scene set's END sentinel.
   *
   * Zero-initialized by the default ctor's `movups %xmm0, 0x58(%rbx)`
   * @Ozone 0x816eb (see {@link OZSceneListTreeEndNode}). It is an embedded
   * sub-object, not a pointer: the ctor takes its ADDRESS @0x816e4
   * (`leaq 0x58(%rbx), %rax`) to seed `__begin_node_` at +0x50 @0x816ef, and
   * {@link OZSceneList.end} returns that same address.
   */
  treeEndNodeAt58: OZSceneListTreeEndNode = { left: null };

  /**
   * `OZSceneList::end()` — Ozone @0x00081810
   * (mangled `__ZN11OZSceneList3endEv`).
   *
   * Full transcription — every instruction of the function, in order
   * (raw-port/re/disasm/__ZN11OZSceneList3endEv.s):
   *
   *   0x81810  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x81811  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x81814  leaq  0x58(%rdi), %rax     ; return &this->treeEndNode
   *   0x81818  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x81819  retq                       ; return that address
   *   0x8181a  nopw  (%rax,%rax)          ; alignment padding, not executed
   *
   * `leaq`, NOT a load — and that is the whole point of the pair: its sibling
   * `begin()` @0x81800 DEREFERENCES the neighbouring slot
   * (`movq 0x50(%rdi), %rax` @0x81804, returning the stored `__begin_node_`
   * pointer), whereas `end()` returns the ADDRESS of the embedded end node.
   * This is libc++'s standard `end()` — an iterator over `__end_node()` — and
   * it is why an empty list satisfies `begin() == end()`: the ctor stores
   * exactly this address into +0x50 (@0x816e4/@0x816ef).
   *
   * Returning the field object is the faithful rendering of `&this->member`,
   * since a JS object value IS the reference; comparing the result of `end()`
   * against a `begin()` that yielded the same node therefore compares equal by
   * identity, exactly as the two pointers do in the binary.
   *
   * Zero callees, zero externs, zero indirect calls, no null check.
   *
   * @returns the embedded tree end node at `this + 0x58`.
   */
  end(): OZSceneListTreeEndNode {
    // @Ozone 0x81814: leaq 0x58(%rdi), %rax
    return this.treeEndNodeAt58;
  }
}
