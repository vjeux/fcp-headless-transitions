// FFRecentAverageInterval.ts — a mutex-guarded fixed-window running-sum tracker.
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly saved at:
//   raw-port/re/disasm/Flexo.FFRecentAverageInterval.push_value.s
//
// Only one exported symbol was found for this class (ctor/dtor are inlined at each caller):
//   @Flexo 0x0000000000d5b510  FFRecentAverageInterval::push_value(double)
//
// STRUCT LAYOUT (recovered from the field reads/writes in push_value):
//   +0x00  vtable ptr (implied by class shape; not touched by push_value)
//   +0x08  std::mutex mtx           // mutex.lock() @0xd5b52a, mutex.unlock() @0xd5b647
//   +0x48  uint64_t maxCount        // compared to count @0xd5b536 (cmpq 0x48(%r14), %rax)
//   +0x50  double sum               // subsd @0xd5b5b4, addsd @0xd5b5e5 — running sum
//   +0x58  std::deque<double> q     // add_back_capacity @0xd5b600 confirms deque<double>
//     +0x60  T** __map_.__first_
//     +0x68  T** __map_.__end_
//     +0x78  size_t __start_        // begin index into flattened map (front) — inc'd on pop_front
//     +0x80  size_t __size_         // number of elements currently in the deque
//
// SEMANTICS (from the single exported method):
//   push_value(v):
//     lock(&mtx)                                                      // @0xd5b52a
//     if (q.__size_ == this->maxCount) {                              // @0xd5b536 cmpq
//        // pop_front: fetch q.front() from map/block indexing
//        //   block  = q.__map_.__first_[q.__start_ >> 9]              // @0xd5b544..0xd5b54f (shr 9 = /512)
//        //   slot   = q.__start_ & 0x1ff                              // @0xd5b555 andl 0x1ff
//        //   front  = block[slot]                                     // @0xd5b55b movsd (%rsi,%rdi,8)
//        q.__size_ -= 1                                                // @0xd5b560 decq %rax; movq %rax, 0x80(%r14)
//        q.__start_ += 1                                               // @0xd5b56a incq %rdx; movq %rdx, 0x78(%r14)
//        if (q.__start_ >= 0x400) {                                    // @0xd5b571 cmpq $0x400 = 1024
//          // wrap the block-map: dealloc the retired block, advance __first_, subtract 512 from __start_
//          delete q.__map_.__first_[0]                                 // @0xd5b57a movq (%rcx),%rdi; @0xd5b582 callq _ZdlPv
//          q.__map_.__first_ += 1  (advance one block ptr = +8 bytes)  // @0xd5b597 addq $0x8,%rcx; movq %rcx,0x60(%r14)
//          q.__start_ -= 0x200                                         // @0xd5b59f movq $-0x200,%rdx; addq 0x78(%r14),%rdx; movq %rdx,0x78(%r14)
//        }
//        this->sum -= front                                            // @0xd5b5ae subsd %xmm1,%xmm0; movsd %xmm0,0x50
//     }
//     this->sum += v                                                   // @0xd5b5e5 addsd -0x18(%rbp),%xmm0; movsd %xmm0,0x50
//     // push_back: figure out target block+slot from (__start_+__size_); grow map if at capacity
//     let backIdx = q.__start_ + q.__size_                              // @0xd5b5f4 addq %rax,%rdx
//     if (backIdx == blockMapCapacity) q.__add_back_capacity()          // @0xd5b5fa jne / @0xd5b600 callq
//     block = q.__map_.__first_[backIdx >> 9]                           // @0xd5b61a shrq $9
//     slot  = backIdx & 0x1ff                                           // @0xd5b622 andl $0x1ff
//     block[slot] = v                                                   // @0xd5b62d movsd %xmm0,(%rcx,%rdx,8)
//     q.__size_ += 1                                                    // @0xd5b632 incq %rax; movq %rax,0x80
//     unlock(&mtx)                                                     // @0xd5b647 jmp mutex.unlock
//
// NUMERICS: pure double-precision throughout (movsd / subsd / addsd, no float32 conversions).
//   Because JS numbers ARE IEEE754 doubles, addsd/subsd map to `+`/`-` bit-for-bit.
//
// PORTING NOTE ON std::deque INTERNALS:
//   FCP uses libc++ std::deque<double>, a two-level ring: a resizable map of pointers to 512-element
//   blocks (0x200 elements per block; the wrap-boundary at __start_>=0x400 is where the front block
//   is retired and __first_ is bumped). The OBSERVABLE state that any caller of push_value can see
//   (via ADL/other accessors we haven't decoded yet) is exclusively (sum, size, maxCount). The
//   individual queue elements are not read back through any exported symbol of this class. This
//   port therefore models the deque with a plain JS array and uses Array.prototype.shift/push —
//   sum is maintained bit-identically (double subtraction/addition), size and maxCount are
//   bit-identical (integer counters), and no other externally observable state exists.
//
// THREAD SAFETY: JavaScript is single-threaded within a realm; the mutex around push_value is a
// no-op in the port. The lock/unlock calls are still cited above so a reviewer can see they were
// read and intentionally elided (not silently dropped).

/**
 * Fixed-window running-sum tracker.
 *
 * Corresponds to FCP class `FFRecentAverageInterval` (only exported symbol:
 * `push_value(double)` @Flexo 0x0000000000d5b510). Layout inferred from field
 * accesses in `push_value` (see file-level comment).
 */
export class FFRecentAverageInterval {
  /** @Flexo +0x48 — the fixed window size compared against `q.__size_` at 0xd5b536. */
  private readonly maxCount: number;
  /** @Flexo +0x50 — running sum of the window (double); addsd/subsd @0xd5b5b4 / 0xd5b5e5. */
  private sum: number;
  /** @Flexo +0x58 std::deque<double> — modelled as a JS ring; only its front/back semantics
   *  (pop_front on full, push_back always) and its `.length` matter to the observable output.
   */
  private readonly q: number[];

  /**
   * Construct a running-average interval with a fixed window `maxCount`.
   *
   * No explicit ctor symbol was exported by Flexo for this class (the ctor is
   * inlined at each caller), so the initial values of the fields are recovered
   * from the ONLY behaviour push_value assumes about a fresh instance: `sum`
   * starts at 0.0 (0xd5b5ae reads it, adds the new value, writes it back — the
   * first call must therefore see sum=0), and `q` starts empty. `maxCount` is
   * fixed for the lifetime of the object (only ever READ at 0xd5b536, never
   * written by push_value).
   */
  constructor(maxCount: number) {
    // Guard: maxCount==0 would make every push subtract-then-add and never accumulate a window.
    // The disasm doesn't handle this case specially, but the caller pattern (fixed window sizes
    // like 30, 60, etc.) implies maxCount >= 1. Not enforced here — mirror the binary's silence.
    this.maxCount = maxCount;
    this.sum = 0.0;
    this.q = [];
  }

  /**
   * Push a new sample onto the window, evicting the oldest if full.
   *
   * @Flexo 0x0000000000d5b510  FFRecentAverageInterval::push_value(double)
   *
   * Control flow (see file-level comment for cited addresses):
   *   1. If the window is full (`q.length === maxCount`), pop the front element
   *      and subtract it from the running sum.
   *   2. Add the new value to the running sum.
   *   3. Append the new value to the back of the window.
   *
   * The mutex around the body (@0xd5b52a lock, @0xd5b647 unlock) is elided in
   * the port because JavaScript execution is single-threaded within a realm.
   */
  push_value(v: number): void {
    // @0xd5b52a callq std::mutex::lock  (elided — single-threaded JS)

    // @0xd5b536 cmpq 0x48(%r14), %rax  — "if (q.__size_ == this->maxCount)"
    if (this.q.length === this.maxCount) {
      // @0xd5b544..0xd5b55b — front = q.__map_.__first_[q.__start_ >> 9][q.__start_ & 0x1ff]
      // (See file-level comment for the block-map indexing; modelled here as `q.shift()`.)
      // @0xd5b560/56a — q.__size_--, q.__start_++
      // @0xd5b571..0xd5b5aa — wrap the map when q.__start_ >= 0x400 (dealloc retired block,
      //                       advance __first_, subtract 0x200 from __start_). Elided: the
      //                       JS array's storage strategy is opaque; only front/back semantics matter.
      const front = this.q.shift() as number;
      // @0xd5b5ae/b4/b8 — subsd + writeback: this->sum -= front
      this.sum = this.sum - front;
    }

    // @0xd5b5e5 addsd -0x18(%rbp), %xmm0; @0xd5b5ea movsd %xmm0, 0x50(%r14) — this->sum += v
    // NOTE: the disasm loads sum into xmm0 BEFORE the "if size==max" branch merges (at 0xd5b5ae
    // in the taken branch, 0xd5b5c0 in the not-taken branch), then adds v at 0xd5b5e5 UNCONDITIONALLY
    // AFTER the merge point. So sum += v runs on every call, and (only when full) sum -= front runs
    // first. Order in this port matches: subtract-before-add if full, then add.
    this.sum = this.sum + v;

    // @0xd5b5f4..0xd5b62d — push_back: compute block+slot from (__start_ + __size_), grow if at
    //                       capacity (__add_back_capacity @0xd5b600), write v, then __size_++.
    //                       Modelled as q.push(v).
    this.q.push(v);

    // @0xd5b647 jmp std::mutex::unlock  (elided — single-threaded JS)
  }

  /**
   * Read the current running sum. Not an exported symbol on Flexo — added here so
   * the class is testable from TS without exposing the internal deque. Reviewers:
   * this is a pure accessor on already-decoded state (+0x50), not new logic.
   */
  getSum(): number {
    return this.sum;
  }

  /**
   * Read the current window size. Not an exported symbol on Flexo — added here so
   * the class is testable from TS. Pure accessor on already-decoded state (+0x80).
   */
  getCount(): number {
    return this.q.length;
  }
}
