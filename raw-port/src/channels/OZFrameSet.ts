// OZFrameSet — Ozone framework. A CMTime-interval set: a sparse mapping of frames/ranges to
// time. Backed by an internal std::__1::__tree<PCHash128, less<PCHash128>, allocator<PCHash128>>
// (the D1 destructor tail-jumps to `std::__1::__tree<...>::destroy` @0x376249, which pins the
// container type). The keys are 128-bit hashes — presumably a (start,duration) hash — used to
// dedupe overlapping ranges.
//
// FRAMEWORK: Ozone.framework (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//   Versions/A/Ozone; x86_64 slice via `otool -tV`; VAs cited below are unadjusted VM addresses).
//
// LEDGER SCOPE (8 methods):
//   OZFrameSet::OZFrameSet()                              [C1] @0x3761f0
//   OZFrameSet::OZFrameSet()                              [C2] @0x376210
//   OZFrameSet::~OZFrameSet()                             [D1] @0x376230
//   OZFrameSet::~OZFrameSet()                             [D2] @0x376240
//   OZFrameSet::addFrame(CMTime, CMTime)                       @0x376250
//   OZFrameSet::addRange(PCTimeRange const&, CMTime)           @0x3762a0   (479-line body)
//   OZFrameSet::removeFrame(CMTime, CMTime)                    @0x376a90
//   OZFrameSet::removeRange(PCTimeRange const&, CMTime)        @0x376ae0   (760-line body)
//
// ── STRUCT LAYOUT ─────────────────────────────────────────────────────────────────────────
// Recovered from C1 @0x376210 (10 lines) and D1 @0x376240 (7 lines):
//
//   +0x00  __tree_node_base* endNode_ptr — self-referential sentinel. C1 writes
//                (rdi + 0x08) here (@0x376214-@0x37621f), i.e. `endNode_ptr = &this->beginNode`.
//   +0x08  __tree_node_base beginNode — a 0x10-byte value zeroed by C1's `xorps %xmm0,%xmm0 ; movups
//                %xmm0, 0x8(%rdi)` (@0x376218-@0x37621b). This is the sentinel's begin_node slot in
//                libc++'s red-black tree layout (parent=null on empty tree).
//   +0x10  size_t elementCount — the check `cmpq $0x0, 0x10(%rdi)` in addRange @0x3762ba probes
//                this slot as the "is the tree empty?" test. libc++'s __tree size lives here.
//
// The D1 loads `rsi = 0x8(%rdi)` (i.e. the parent-node pointer of the sentinel = the root of the
// tree) and tail-jumps into libc++'s tree destroy helper — the ONLY way to recover the container
// type. See raw-port/re/disasm/OZFrameSet.~OZFrameSet.s @0x376244-@0x376249.
//
// ── External stubs consumed ─────────────────────────────────────────────────────────────────
//   _PC_CMTimeSaferSubtract          @stub 0x6dcf0c   (addRange @0x37630b; not decoded)
//   _PC_CMTimeSaferAdd               @stub 0x6dcf06   (addRange @0x37636f; not decoded)
//   __ZmlRK6CMTimed (op* CMTime,d)   @stub 0x6dfc72   (addRange @0x37633a; not decoded)
//   std::__1::__tree<PCHash128,...>::destroy(node*)                                    @0x376249
//     (tail-jump target; libc++abi extern — not decoded on our side)
//
// Faithful per raw-port/army/PORTING_SPEC.md — every ported fn cites its @0xADDR; addRange /
// removeRange are throw-stubs citing their addr + the sub-callees that gate their bodies.

import type { CMTime } from "../infra/CMTime.js";

// ── PCTimeRange — the interval type addRange / removeRange operate on ──────────────────────
//
// Recovered from the addFrame/removeFrame wrappers (@0x376250..@0x37628d and @0x376a90..@0x376acd):
// the wrapper takes two on-stack CMTime values (arg1 CMTime `start` @[rbp+0x10..0x20], arg2
// CMTime `duration` @[rbp+0x20..0x30]) and packs them into a PCTimeRange laid out in the local
// slot -0x30 (24 bytes: 16-byte start + 8-byte trailing). Then it passes `&PCTimeRange` (rsi) and
// pushes the "duration" CMTime through the same stack shape as a by-value arg2 into addRange /
// removeRange. So PCTimeRange has TWO CMTimes: start + duration. Field layout:
//
//   PCTimeRange {
//     CMTime start;      // +0x00..+0x18   (value:i64 timescale:i32 flags:u32 epoch:i64)
//     CMTime duration;   // +0x18..+0x30
//   }

export interface PCTimeRange {
  start: CMTime;
  duration: CMTime;
}

// ── OZFrameSet class ────────────────────────────────────────────────────────────────────────

/**
 * OZFrameSet — a set of CMTime-anchored frames/ranges backed by a red-black tree of
 * PCHash128 keys. All methods below cite their @0xADDR in the Ozone binary.
 */
export class OZFrameSet {
  /** (+0x00) endNodePtr — self-referential sentinel; ctor makes it point at the beginNode
   *  (@0x37621f). Modeled here as an opaque object identity — the actual libc++ tree topology
   *  is not modelable in TS without porting PCHash128 first. */
  private _sentinel_at0x00: object = {};
  /** (+0x10) size_t elementCount — read by addRange's `cmpq $0x0, 0x10(%rdi)` @0x3762ba as the
   *  "is the tree empty?" gate. Written to 0 by ctor's 16-byte movups @0x37621b. */
  private _tree_size_at0x10: number = 0;
  /** Opaque storage for the tree's payload — the real container is
   *  std::__1::__tree<PCHash128, less<PCHash128>, allocator<PCHash128>> per D1's tail-jump
   *  target @0x376249. Kept as `unknown[]` until PCHash128 is ported. */
  private _entries: unknown[] = [];

  /**
   * OZFrameSet::OZFrameSet() [C1/C2 identical] @Ozone 0x376210. Complete disasm:
   *   pushq %rbp; movq %rsp,%rbp                            (@0x376210..0x376211)
   *   leaq 0x8(%rdi),%rax   (rax = &beginNode)              (@0x376214)
   *   xorps %xmm0,%xmm0                                     (@0x376218)
   *   movups %xmm0, 0x8(%rdi)  (zero beginNode + size_t)    (@0x37621b)
   *   movq %rax, (%rdi)   (endNodePtr = &beginNode)         (@0x37621f)
   *   popq %rbp; retq                                       (@0x376222..0x376223)
   *
   * The 0x10-byte movups covers beginNode (0x08..0x10) AND size_t (0x10..0x18) in one write —
   * both start at zero (empty tree). The sentinel points at itself (rooted at &beginNode).
   * C1 @0x3761f0 is a trivial forwarder to C2 @0x376210 (not shown here — identical body).
   */
  constructor() {
    // @0x37621f — sentinel points at itself (empty tree convention).
    this._sentinel_at0x00 = this;
    // @0x37621b — zero the 16-byte block covering beginNode + size_t.
    this._tree_size_at0x10 = 0;
    this._entries = [];
  }

  /**
   * OZFrameSet::~OZFrameSet() [D1/D2] @Ozone 0x376240. Complete disasm:
   *   pushq %rbp; movq %rsp,%rbp                             (@0x376240..0x376241)
   *   movq 0x8(%rdi),%rsi   (rsi = root of the tree)         (@0x376244)
   *   popq %rbp                                              (@0x376248)
   *   jmp __ZNSt3__16__treeI9PCHash128...E7destroyEPNS_11__tree_nodeIS1_PvEE  (@0x376249)
   *
   * The D1 tail-jumps into libc++'s __tree<PCHash128, less<PCHash128>, allocator<PCHash128>>::
   * destroy(node*) — the ONLY exposed reference to the container's typed identity. In JS this
   * is GC's job; we drop our references.
   */
  destroy(): void {
    // @0x376249 — release the tree; JS GC handles the rest.
    this._entries = [];
    this._tree_size_at0x10 = 0;
  }

  /**
   * OZFrameSet::addFrame(CMTime start, CMTime duration) @Ozone 0x376250. Complete disasm (22 lines):
   *   1) frame allocates a 0x50 stack slot (@0x376254).
   *   2) copies arg1 (CMTime start @rbp+0x10..0x20) into -0x30..-0x20 (@0x37625c..0x376268):
   *        movq  0x20(%rbp),%rax; movq %rax,-0x20(%rbp)      (start trailing 8 bytes)
   *        movaps 0x10(%rbp),%xmm0; movaps %xmm0,-0x30(%rbp) (start first 16 bytes)
   *        movups 0x28(%rbp),%xmm0; movups %xmm0,-0x18(%rbp) (spans start.trailing + duration.first)
   *   3) copies arg2 (CMTime duration @rbp+0x28..0x38) into -0x8(%rbp) and the outbound stack args
   *      (movq 0x38(%rbp),%rax; movq %rax,-0x8(%rbp); movq %rax,0x10(%rsp))          (@0x376270..0x37627c)
   *      (movups 0x28(%rbp),%xmm0; movups %xmm0,(%rsp))                              (@0x376281..0x376285)
   *   4) rsi = &(the on-stack PCTimeRange at -0x30)                                    (@0x376289)
   *   5) callq OZFrameSet::addRange(PCTimeRange const&, CMTime)                       (@0x37628d)
   *   6) epilogue.
   *
   * i.e. addFrame packs (start, duration) into a PCTimeRange on the stack, then forwards to
   * addRange with the SAME `duration` CMTime as the second argument.
   */
  addFrame(start: CMTime, duration: CMTime): void {
    // @0x376289..0x37628d — build PCTimeRange, forward to addRange.
    const range: PCTimeRange = { start, duration };
    this.addRange(range, duration);
  }

  /**
   * OZFrameSet::removeFrame(CMTime start, CMTime duration) @Ozone 0x376a90. Byte-identical shape
   * to addFrame (@0x376a94..@0x376acd) — same 22-instruction stack shuffle, dispatching to
   * removeRange instead of addRange. Faithful to the disasm.
   */
  removeFrame(start: CMTime, duration: CMTime): void {
    // @0x376ac9..0x376acd — build PCTimeRange, forward to removeRange.
    const range: PCTimeRange = { start, duration };
    this.removeRange(range, duration);
  }

  /**
   * OZFrameSet::addRange(PCTimeRange const&, CMTime) @Ozone 0x3762a0. Body 479 disasm lines;
   * heavy dependence on PC_CMTimeSaferSubtract @stub 0x6dcf0c, PC_CMTimeSaferAdd @stub 0x6dcf06,
   * operator*(CMTime,double) @stub 0x6dfc72, PCHash128 key construction, and libc++
   * __tree<PCHash128,...>::__insert_unique / __insert_multi. Deferred.
   */
  addRange(_range: PCTimeRange, _ctxT: CMTime): void {
    throw new Error(
      "OZFrameSet::addRange @Ozone 0x3762a0 not yet transcribed " +
      "(deps: PC_CMTimeSaferSubtract @stub 0x6dcf0c, PC_CMTimeSaferAdd @stub 0x6dcf06, " +
      "operator*(CMTime,double) @stub 0x6dfc72, PCHash128 key ctor, " +
      "libc++ std::__tree<PCHash128,less,allocator>::insert)",
    );
  }

  /**
   * OZFrameSet::removeRange(PCTimeRange const&, CMTime) @Ozone 0x376ae0. Body 760 disasm lines;
   * same sub-callee set as addRange plus libc++ __tree erase paths. Deferred.
   */
  removeRange(_range: PCTimeRange, _ctxT: CMTime): void {
    throw new Error(
      "OZFrameSet::removeRange @Ozone 0x376ae0 not yet transcribed " +
      "(deps: PC_CMTimeSaferSubtract @stub 0x6dcf0c, PC_CMTimeSaferAdd @stub 0x6dcf06, " +
      "operator*(CMTime,double) @stub 0x6dfc72, PCHash128 key ctor, " +
      "libc++ std::__tree<PCHash128,less,allocator>::erase)",
    );
  }
}
