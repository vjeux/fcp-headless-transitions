// TextureDeleteQueue.ts — Helium's deferred texture-deletion queue.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOL (this file):
//   @Helium 0x0000000000043780
//     TextureDeleteQueue::_popFrontRequest()
//     mangled: __ZN18TextureDeleteQueue16_popFrontRequestEv
//
// SOURCE DISASSEMBLY:
//   raw-port/re/disasm/Helium.__ZN18TextureDeleteQueue16_popFrontRequestEv.s (66 lines)
//
// The method returns a `DeleteRequest` BY VALUE, so the x86_64 SysV ABI gives
// it a hidden sret pointer:  %rdi = &returnSlot,  %rsi = this.  The body
// therefore reads `this` through %r14 and writes the popped record through
// %rbx (the caller's return slot).
//
// ═══════════════════════════════════════════════════════════════════════════
// STRUCT LAYOUT — TextureDeleteQueue (only the offsets this method touches)
// ═══════════════════════════════════════════════════════════════════════════
//
//   +0x10  u64   c10   ─┐ five u64 accounting counters, each DECREMENTED by
//   +0x18  u64   c18    │ the popped request's +0x54 datum along one of three
//   +0x20  u64   c20    │ mutually-exclusive arms (see the decode below).
//   +0x28  u64   c28    │ Purpose-names are deliberately NOT invented — only
//   +0x30  u64   c30   ─┘ their per-arm bookkeeping role is observable here.
//
//   +0x50  std::deque<TextureDeleteQueue::DeleteRequest>   (libc++, 0x30 bytes)
//     +0x50  __map_.__first_      (not touched by this method)
//     +0x58  __map_.__begin_      pointer to the first live block pointer
//     +0x60  __map_.__end_        (not touched by this method)
//     +0x68  __map_.__end_cap_    (not touched by this method)
//     +0x70  __start_             element offset of the front element
//     +0x78  __size_              live element count
//   +0x80  pthread_mutex_t        (corroborated by TextureDeleteQueueLock's
//                                  ctor/dtor `leaq 0x80(%rsi)` @0x43da7 —
//                                  see raw-port/src/channels/TextureDeleteQueueLock.ts)
//   +0x120 pthread_cond_t         broadcast at the end of every pop @0x4384c
//
//   The +0x50 deque start is independently corroborated by
//   `TextureDeleteQueueLock::getQueue()` @Helium 0x43e10, which returns
//   `queue + 0x50` — i.e. a pointer to exactly this deque sub-object.
//
// ── libc++ deque geometry ───────────────────────────────────────────────────
//   sizeof(DeleteRequest) == 0x88 (136 bytes) — pinned by the `movl $0x88,%edx`
//   memcpy length @0x437cd and by the DeleteRequest constructor
//   `__ZN18TextureDeleteQueue13DeleteRequestC1EP16HGTextureManagerNS1_12TextureEntryEPvbb`
//   @Helium 0x42030, whose last stores are `movq %rax, 0x78(%rbx)` and
//   `movq $0x0, 0x80(%rbx)` (so the record ends at 0x88).
//
//   libc++ picks __block_size = 4096 / sizeof(T) when sizeof(T) < 256, giving
//   4096 / 136 = 30 elements per block. The binary confirms 30 three ways:
//     * the division-by-30 magic multiply at 0x43799 (see below),
//     * `addq $-0x1e, 0x70(%r14)` @0x43840 — __start_ -= 30,
//     * `cmpq $0x3c, %r15` @0x4382c — the 2 * 30 spare-block threshold.
//
// ── DECODE OF _popFrontRequest @0x43780 (AT&T, dst-src arithmetic) ──────────
//
//   Registers: %rbx = sret return slot, %r14 = this,
//              %r12 = this->__map_.__begin_ (read ONCE, before any advance),
//              %r15 = this->__start_ (the pre-increment value).
//
//   43791  movq 0x58(%rsi), %r12          r12 = __map_.__begin_
//   43795  movq 0x70(%rsi), %r15          r15 = __start_
//   43799  movabsq $0x8888888888888889, %rcx
//   437a3  movq %r15, %rax
//   437a6  mulq %rcx                      unsigned 128-bit multiply
//   437a9  shrq $0x4, %rdx                rdx = q = __start_ / 30
//                                         (0x8888888888888889 == ceil(2^68/30),
//                                          so mulhi-then->>4 is an exact
//                                          unsigned divide by 30)
//   437ad  movq %rdx, %rax
//   437b0  shlq $0x5, %rax                rax = q * 32
//   437b4  leaq (%rdx,%rdx), %rcx         rcx = q * 2
//   437b8  subq %rax, %rcx                rcx = 2q - 32q = -30q
//   437bb  addq %r15, %rcx                rcx = r = __start_ - 30q  (= start % 30)
//   437be  movq %rcx, %rax
//   437c1  shlq $0x7, %rax                rax = r * 128
//   437c5  leaq (%rax,%rcx,8), %rsi       rsi = r*128 + r*8 = r * 136 (= r * 0x88)
//   437c9  addq (%r12,%rdx,8), %rsi       rsi = mapBegin[q] + r*0x88  (front element)
//   437cd  movl $0x88, %edx
//   437d2  callq _memcpy                  memcpy(returnSlot, frontElement, 0x88)
//
//   ── accounting arms — all three read the COPY (%rbx), not the deque slot ──
//   437d7  cmpb $0x2, 0x40(%rbx)          out[+0x40] vs 2
//   437db  jne  0x437e8                   != 2 -> arm B
//   437dd  movslq 0x54(%rbx), %rax        [ARM A] rax = (i64)(i32) out[+0x54]
//   437e1  movl $0x18, %ecx               rcx = 0x18   (-> this + 0x10 + 0x18 = c28)
//   437e6  jmp  0x4381c
//   437e8  movslq 0x54(%rbx), %rax        [ARM B] rax = (i64)(i32) out[+0x54]
//   437ec  movl $0x20, %ecx               rcx = 0x20   (-> this + 0x10 + 0x20 = c30)
//   437f1  cmpb $0x1, 0x4d(%rbx)          out[+0x4d] vs 1
//   437f5  jne  0x4381c                   != 1 -> take arm B's subtraction
//   437f7  movdqu 0x10(%r14), %xmm0       [ARM C] xmm0 = [c10, c18]
//   437fd  movq %rax, %xmm1
//   43802  pshufd $0x44, %xmm1, %xmm1     xmm1 = [rax, rax]
//   43807  psubq %xmm1, %xmm0             xmm0 = [c10 - rax, c18 - rax]
//   4380b  movdqu %xmm0, 0x10(%r14)       store both back
//   43811  movl $0x10, %ecx               rcx = 0x10   (-> this + 0x10 + 0x10 = c20)
//   43816  cmpb $0x0, 0x4c(%rbx)          out[+0x4c] - 0   (SIGNED byte)
//   4381a  js   0x43821                   SF set (out[+0x4c] < 0) -> skip the subtract
//   4381c  subq %rax, 0x10(%r14,%rcx)     *(u64*)(this + 0x10 + rcx) -= rax
//
//   ── deque pop-front bookkeeping ─────────────────────────────────────────
//   43821  decq 0x78(%r14)                __size_ -= 1
//   43825  incq %r15                      start' = __start_ + 1
//   43828  movq %r15, 0x70(%r14)          __start_ = start'
//   4382c  cmpq $0x3c, %r15               start' vs 60  (UNSIGNED, jb below)
//   43830  jb   0x43845                   start' < 60 -> keep the front block
//   43832  movq (%r12), %rdi              rdi = mapBegin[0]  (the now-empty block)
//   43836  callq __ZdlPv                  operator delete(block)
//   4383b  addq $0x8, 0x58(%r14)          __map_.__begin_ += 1 pointer
//   43840  addq $-0x1e, 0x70(%r14)        __start_ -= 30
//                                         (libc++ __maybe_remove_front_spare:
//                                          once a whole block has been consumed
//                                          twice over, release the front block)
//   43845  leaq 0x120(%r14), %rdi
//   4384c  callq _pthread_cond_broadcast  broadcast(&this->cond)
//   43851  movl 0x78(%r14), %edi          DEAD LOAD — %edi is never used before
//                                         the epilogue (0x43855/0x43856 are
//                                         `nop`/`nopl` and 0x4385a overwrites
//                                         %rax with %rbx). Almost certainly the
//                                         argument setup of a logging call that
//                                         the optimizer removed. It has no
//                                         observable effect; nothing to port.
//   4385a  movq %rbx, %rax                return the sret pointer
//
// ── Callees ─────────────────────────────────────────────────────────────────
//   ZERO in-scope callees (`depgraph.py deps __ZN18TextureDeleteQueue16_
//   popFrontRequestEv` prints nothing). The three `callq`s are all TRUE
//   out-of-scope externs reached through symbol stubs:
//     _memcpy                  @stub 0x3c5438  (libc / libSystem)
//     __ZdlPv operator delete  @stub 0x3c4fa0  (libc++ ABI)
//     _pthread_cond_broadcast  @stub 0x3c5522  (libpthread / libSystem)
//   No indirect or virtual calls anywhere in the body.
//
// ── END DECODE ──────────────────────────────────────────────────────────────

/**
 * Opaque `pthread_cond_t` handle embedded at TextureDeleteQueue +0x120.
 * Modelled the same way `TextureDeleteQueueLock` models the queue's
 * `pthread_mutex_t` at +0x80 (an opaque brand with the one operation the
 * binary performs on it) rather than as a raw 48-byte blob — the pthread
 * runtime itself is out of scope.
 *
 * @see Helium 0x4384c  callq _pthread_cond_broadcast @stub 0x3c5522
 */
export interface PthreadCond {
  /** Native: `pthread_cond_broadcast(this)`. @see Helium 0x3c5522 (stub). */
  broadcast(): void;
}

/**
 * `TextureDeleteQueue::DeleteRequest` — the 0x88-byte (136-byte) deque
 * element. Only the four fields `_popFrontRequest` actually reads are decoded
 * here; the remaining bytes are carried verbatim by the `memcpy` @0x437d2 and
 * are not interpreted by this method (they belong to the `DeleteRequest`
 * constructor's ledger entry @Helium 0x42030, which is not ported here).
 *
 * Field names stay generic (offset-suffixed) because this method only reveals
 * each field's bookkeeping ROLE, not its meaning — same convention as
 * `HGTextureManager::TextureUsage`'s f0..f6.
 *
 * @Helium 0x0000000000043780  (offsets read by _popFrontRequest)
 * @Helium 0x0000000000042030  (sizeof == 0x88, pinned by the constructor's
 *                              trailing `movq $0x0, 0x80(%rbx)`)
 */
export interface DeleteRequest {
  /**
   * +0x40, u8 — arm selector. `cmpb $0x2` @0x437d7: the value 2 routes the
   * pop's accounting to counter c28.
   */
  f40: number;
  /**
   * +0x4c, SIGNED i8 — read by `cmpb $0x0` + `js` @0x43816/0x4381a: a
   * negative value suppresses arm C's c20 subtraction.
   */
  f4c: number;
  /**
   * +0x4d, u8 — read by `cmpb $0x1` @0x437f1: the value 1 selects arm C.
   */
  f4d: number;
  /**
   * +0x54, i32 — the amount subtracted from the queue's counters, loaded with
   * `movslq` (sign-extended to 64 bits) @0x437dd / 0x437e8.
   */
  f54: number;
}

/**
 * `TextureDeleteQueue` — the subset of the object this method reads or writes.
 * The libc++ `std::deque<DeleteRequest>` at +0x50 is modelled structurally
 * (a map of fixed 30-element blocks plus `__start_` / `__size_`) rather than
 * as raw memory, so every pointer computation in the disassembly has a direct
 * counterpart: `mapBegin[q]` is `blocks[mapBeginIdx + q]`, and advancing
 * `__map_.__begin_` by one pointer (`addq $0x8`) is `mapBeginIdx += 1`.
 *
 * @Helium 0x0000000000043780
 */
export interface TextureDeleteQueue {
  /** +0x10, u64 — decremented by arm C (`psubq` low lane @0x43807). */
  c10: bigint;
  /** +0x18, u64 — decremented by arm C (`psubq` high lane @0x43807). */
  c18: bigint;
  /** +0x20, u64 — arm C's conditional target (rcx = 0x10 @0x43811). */
  c20: bigint;
  /** +0x28, u64 — arm A's target (rcx = 0x18 @0x437e1). */
  c28: bigint;
  /** +0x30, u64 — arm B's target (rcx = 0x20 @0x437ec). */
  c30: bigint;

  /**
   * Backing storage of the deque's block-pointer map. Each live entry is one
   * 30-element block; a `null` entry is storage that has been handed back to
   * `operator delete`. @Helium 0x437c9 (`addq (%r12,%rdx,8), %rsi`).
   */
  blocks: (DeleteRequest[] | null)[];
  /**
   * +0x58 `__map_.__begin_`, expressed as an index into {@link blocks}.
   * Advanced by one pointer when the front block is released.
   * @Helium 0x4383b (`addq $0x8, 0x58(%r14)`).
   */
  mapBeginIdx: number;
  /** +0x70 `__start_` — element offset of the front element. */
  start: bigint;
  /** +0x78 `__size_` — live element count. */
  size: bigint;

  /** +0x120 `pthread_cond_t`. @Helium 0x43845 (`leaq 0x120(%r14), %rdi`). */
  cond: PthreadCond;
}

/**
 * libc++ `__deque_block_size` for `DeleteRequest`: 4096 / sizeof(T) with
 * sizeof(T) == 0x88 == 136 → 30. Materialised in the binary as the
 * divide-by-30 magic multiply @0x43799 and as the literal `-0x1e` @0x43840.
 *
 * @Helium 0x0000000000043840  (`addq $-0x1e, 0x70(%r14)`)
 */
const DEQUE_BLOCK_SIZE: bigint = 30n;

/**
 * The spare-block threshold: `cmpq $0x3c, %r15` — 0x3c == 60 == 2 * 30.
 *
 * @Helium 0x000000000004382c
 */
const DEQUE_FRONT_SPARE_THRESHOLD: bigint = 0x3cn;

/** u64 wrap mask — `decq` / `subq` / `psubq` are all 64-bit modular ops. */
// @Helium 0x0000000000043807 (psubq) / 0x000000000004381c (subq) semantics
const U64_MASK: bigint = 0xffffffffffffffffn;

const u64sub = (x: bigint, y: bigint): bigint => (x - y) & U64_MASK;

/**
 * `TextureDeleteQueue::_popFrontRequest()` — @Helium 0x0000000000043780
 *   mangled: __ZN18TextureDeleteQueue16_popFrontRequestEv
 *
 * Pops the front `DeleteRequest` off the queue's `std::deque` at +0x50,
 * returning a COPY of it (the native ABI returns by value through the hidden
 * sret pointer in %rdi), updates the queue's byte-accounting counters along
 * one of three mutually-exclusive arms, releases the front block once a whole
 * block-and-a-half has been consumed, and broadcasts the queue's condition
 * variable.
 *
 * Faithful line-for-line transcription of the 66-line disassembly documented
 * at the top of this file. No in-scope callees; the only calls are the
 * out-of-scope `_memcpy`, `operator delete` and `_pthread_cond_broadcast`
 * externs.
 *
 * @param self `this` (%rsi — the second register argument, because %rdi
 *             carries the hidden sret pointer).
 * @returns the popped request — the caller's sret slot, filled by the
 *          `memcpy` @0x437d2 and then read back by the accounting arms.
 */
export function TextureDeleteQueue__popFrontRequest(
  self: TextureDeleteQueue,
): DeleteRequest {
  // @0x43791: movq 0x58(%rsi), %r12 — snapshot __map_.__begin_ BEFORE any
  //   advance; the block release at 0x43832 dereferences this old value.
  const mapBeginIdxAtEntry = self.mapBeginIdx;
  // @0x43795: movq 0x70(%rsi), %r15 — the pre-increment __start_.
  const startAtEntry = self.start;

  // @0x43799-0x437a9: rdx = q = __start_ / 30, computed as an unsigned
  //   mulhi by 0x8888888888888889 (== ceil(2^68/30)) followed by >> 4. For
  //   any u64 input that is exactly the unsigned quotient, so we express it
  //   as the division it implements.
  const q = startAtEntry / DEQUE_BLOCK_SIZE;
  // @0x437ad-0x437bb: rcx = r = start - 30q, built as
  //   (q*2) - (q*32) + start  — transcribed in that exact shape.
  const r = (q + q - q * 32n + startAtEntry) & U64_MASK;

  // @0x437be-0x437c9: rsi = mapBegin[q] + r*136.
  //   r*128 + r*8 is the byte offset of element r inside its block; in the
  //   structural model that is simply element index r of block q.
  const block = self.blocks[mapBeginIdxAtEntry + Number(q)];
  if (block == null) {
    // The binary dereferences mapBegin[q] unconditionally — a null block here
    // would be a torn deque (C++ undefined behaviour). Do not fabricate a
    // record. @Helium 0x437c9
    throw new Error(
      "TextureDeleteQueue::_popFrontRequest(): deque block " +
        String(mapBeginIdxAtEntry + Number(q)) +
        " is not allocated; `addq (%r12,%rdx,8), %rsi` @Helium 0x437c9 " +
        "dereferences __map_.__begin_[__start_ / 30] unconditionally, so a " +
        "missing block is C++ undefined behaviour. @Helium 0x43780",
    );
  }
  const front = block[Number(r)];
  if (front === undefined) {
    // Same reasoning as above for the intra-block index. @Helium 0x437c5
    throw new Error(
      "TextureDeleteQueue::_popFrontRequest(): element " +
        String(r) +
        " of the front block is not present; `leaq (%rax,%rcx,8), %rsi` " +
        "@Helium 0x437c5 addresses it unconditionally. @Helium 0x43780",
    );
  }

  // @0x437cd-0x437d2: movl $0x88,%edx ; callq _memcpy
  //   memcpy(returnSlot, frontElement, 0x88) — a flat 136-byte copy of the
  //   record. `_memcpy` is a TRUE out-of-scope libc extern (@stub 0x3c5438);
  //   a by-value struct copy of the modelled record is its exact effect here.
  const out: DeleteRequest = {
    f40: front.f40,
    f4c: front.f4c,
    f4d: front.f4d,
    f54: front.f54,
  };

  // Every arm reads the COPY (%rbx), never the deque slot.
  // @0x437dd / 0x437e8: movslq 0x54(%rbx), %rax — sign-extend the i32 to 64
  //   bits (`| 0` gives the signed 32-bit view; BigInt widens it).
  const amount = BigInt(out.f54 | 0);

  // @0x437d7-0x437db: cmpb $0x2, 0x40(%rbx) ; jne
  if ((out.f40 & 0xff) === 0x2) {
    // ARM A — @0x437e1: rcx = 0x18  =>  target is *(u64*)(this + 0x28) = c28.
    // @0x4381c: subq %rax, 0x10(%r14,%rcx)
    self.c28 = u64sub(self.c28, amount);
  } else {
    // @0x437ec: rcx = 0x20  =>  default target is *(u64*)(this + 0x30) = c30.
    // @0x437f1-0x437f5: cmpb $0x1, 0x4d(%rbx) ; jne 0x4381c
    if ((out.f4d & 0xff) !== 0x1) {
      // ARM B — falls straight through to the subtraction with rcx = 0x20.
      // @0x4381c: subq %rax, 0x10(%r14,%rcx)
      self.c30 = u64sub(self.c30, amount);
    } else {
      // ARM C — @0x437f7-0x4380b: movdqu 0x10(%r14) ; psubq [rax,rax] ; store.
      //   Both u64 lanes of [c10, c18] are decremented by `amount`.
      self.c10 = u64sub(self.c10, amount);
      self.c18 = u64sub(self.c18, amount);
      // @0x43811: rcx = 0x10  =>  target is *(u64*)(this + 0x20) = c20.
      // @0x43816-0x4381a: cmpb $0x0, 0x4c(%rbx) ; js — the SIGNED byte at
      //   +0x4c being negative skips the subtraction entirely.
      const f4cSigned = (out.f4c << 24) >> 24; // sign-extend the byte
      if (f4cSigned >= 0) {
        // @0x4381c: subq %rax, 0x10(%r14,%rcx)
        self.c20 = u64sub(self.c20, amount);
      }
    }
  }

  // @0x43821: decq 0x78(%r14) — __size_ -= 1 (64-bit modular).
  self.size = u64sub(self.size, 1n);
  // @0x43825-0x43828: incq %r15 ; movq %r15, 0x70(%r14) — __start_ += 1.
  let startAfter = (startAtEntry + 1n) & U64_MASK;
  self.start = startAfter;

  // @0x4382c-0x43830: cmpq $0x3c, %r15 ; jb — UNSIGNED compare against 60.
  if (startAfter >= DEQUE_FRONT_SPARE_THRESHOLD) {
    // @0x43832-0x43836: movq (%r12), %rdi ; callq __ZdlPv
    //   operator delete(mapBegin[0]) — the fully-consumed front block. This
    //   is a TRUE out-of-scope libc++ extern (@stub 0x3c4fa0); under JS GC
    //   the deallocation is implicit, so we drop the reference, which is the
    //   observable part of the free.
    self.blocks[mapBeginIdxAtEntry] = null;
    // @0x4383b: addq $0x8, 0x58(%r14) — advance __map_.__begin_ by one
    //   pointer (8 bytes) == one block slot.
    self.mapBeginIdx = mapBeginIdxAtEntry + 1;
    // @0x43840: addq $-0x1e, 0x70(%r14) — __start_ -= 30.
    startAfter = u64sub(startAfter, DEQUE_BLOCK_SIZE);
    self.start = startAfter;
  }

  // @0x43845-0x4384c: leaq 0x120(%r14), %rdi ; callq _pthread_cond_broadcast.
  //   TRUE out-of-scope POSIX extern (@stub 0x3c5522) — modelled as the one
  //   operation the binary performs on the opaque condition variable, exactly
  //   as TextureDeleteQueueLock models the queue's mutex at +0x80.
  self.cond.broadcast();

  // @0x43851: movl 0x78(%r14), %edi — DEAD LOAD (see the decode above); %edi
  //   is never consumed, so there is nothing to transcribe.

  // @0x4385a: movq %rbx, %rax — return the (already filled) sret slot.
  return out;
}
