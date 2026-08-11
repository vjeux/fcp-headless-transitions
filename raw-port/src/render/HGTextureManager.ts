// HGTextureManager.ts — FCP Helium `HGTextureManager` (only the
// nested `TextureUsage` value-type accumulator lives here for now).
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOLS (this file):
//   @Helium 0x0000000000047c00
//     HGTextureManager::TextureUsage::summary(
//         HGTextureManager::TextureUsage const& a,   // rsi  ("inUse")
//         HGTextureManager::TextureUsage const& b,   // rdx  ("free")
//         HGTextureManager::TextureUsage const& c)   // rcx  ("queued")
//     — a member function on `*this` (rdi) that adds a per-category
//       summary of three TextureUsage donors into the receiver. Not a
//       plain replace: the receiver's existing fields are read, added
//       to the contributions below, and written back. `summary` is
//       what HGTextureManager's `_printUsageSummary` path calls with
//       the outputs of _getInUsedTotalTextureUsage / _get
//       FreeTotalTextureUsage / _getQueuedTotalTextureUsage.
//
// SOURCE DISASSEMBLY (in this worktree's raw-port/re/disasm/):
//   Helium.HGTextureManager::TextureUsage.summary.s (@0x47c00..0x47c5e)
//
// ── STRUCT LAYOUT — HGTextureManager::TextureUsage (56 bytes, 7 × u64) ──
//
//   Recovered from the SSE loads/stores in `summary` @0x47c00 and
//   corroborated by the parallel `addUsage` @0x47b20 (pure element-wise
//   paddq add of the same 7 u64 fields; see raw-port/re/disasm/
//   Helium.HGTextureManager::TextureUsage.addUsage.s):
//
//   struct TextureUsage {                 // sizeof == 0x38 (56 bytes)
//     u64 f0;  // +0x00 — "bytes" total (summed from all three donors)
//     u64 f1;  // +0x08 — donor `a`-only field
//     u64 f2;  // +0x10 — donor `a`-only field
//     u64 f3;  // +0x18 — donor `a`-only field
//     u64 f4;  // +0x20 — donor `a`-only field
//     u64 f5;  // +0x28 — donor `b`'s ".f1" contribution
//     u64 f6;  // +0x30 — donor `c`'s ".f1" contribution
//   };
//
//   The layout width (7 × u64) is proven by addUsage: it copies +0x00 as
//   xmm (f0+f1), +0x10 as xmm (f2+f3), +0x20 as xmm (f4+f5), then a plain
//   `movq 0x30(%rsi), %rax; addq %rax, 0x30(%rdi)` for f6 — matching the
//   struct size trailer. Field-purpose names are left generic (f0..f6)
//   because `summary`'s exact per-field semantics (bytes vs. count vs.
//   "in-use" flag) are not yet grounded from a caller with named args.
//
// ── DECODE OF summary @0x47c00 (AT&T, dst-src arithmetic) ─────────────────
//
//   Registers on entry (SysV x86_64, member fn):
//     rdi = this   (receiver / accumulator)
//     rsi = &a
//     rdx = &b
//     rcx = &c
//
//   Line-by-line:
//     47c04  movq  (%rdx), %rax          rax = b.f0
//     47c07  addq  (%rsi), %rax          rax = a.f0 + b.f0
//     47c0a  addq  (%rcx), %rax          rax = a.f0 + b.f0 + c.f0
//     47c0d  movq  %rax, %xmm0           xmm0 = [rax, 0]
//     47c12  movq  0x8(%rsi), %xmm1      xmm1 = [a.f1, 0]
//     47c17  punpcklqdq %xmm1, %xmm0     xmm0 = [rax, a.f1]           (lo, hi)
//     47c1b  movdqu (%rdi), %xmm1        xmm1 = [this.f0, this.f1]
//     47c1f  paddq  %xmm0, %xmm1         xmm1 = [this.f0+rax, this.f1+a.f1]
//     47c23  movdqu 0x10(%rdi), %xmm0    xmm0 = [this.f2, this.f3]     (saved for the +0x10 update)
//     47c28  movdqu 0x20(%rdi), %xmm2    xmm2 = [this.f4, this.f5]     (saved for the +0x20 update)
//     47c2d  movdqu %xmm1, (%rdi)        this.f0 = prev+rax; this.f1 += a.f1
//     47c31  movdqu 0x10(%rsi), %xmm1    xmm1 = [a.f2, a.f3]
//     47c36  paddq  %xmm0, %xmm1         xmm1 = [this.f2+a.f2, this.f3+a.f3]
//     47c3a  movdqu %xmm1, 0x10(%rdi)    this.f2 += a.f2; this.f3 += a.f3
//     47c3f  movdqu 0x20(%rsi), %xmm0    xmm0 = [a.f4, a.f5]
//     47c44  pinsrq $0x1, 0x8(%rdx), %xmm0  xmm0[hi] = b.f1   =>  xmm0 = [a.f4, b.f1]
//     47c4c  paddq  %xmm2, %xmm0         xmm0 = [this.f4+a.f4, this.f5+b.f1]
//     47c50  movdqu %xmm0, 0x20(%rdi)    this.f4 += a.f4; this.f5 += b.f1
//     47c55  movq   0x8(%rcx), %rax      rax = c.f1
//     47c59  addq   %rax, 0x30(%rdi)     this.f6 += c.f1
//
//   Net effect (transcribed 1:1 as u64 modular add):
//     this.f0 += a.f0 + b.f0 + c.f0
//     this.f1 += a.f1
//     this.f2 += a.f2
//     this.f3 += a.f3
//     this.f4 += a.f4
//     this.f5 += b.f1
//     this.f6 += c.f1
//
// No same-framework callees — the whole body is register-level arithmetic
// and mov/store, so there are no imported ports to wire.
//
// ── END DECODE ────────────────────────────────────────────────────────────

/**
 * `HGTextureManager::TextureUsage` — 7 × u64 accumulator used to build a
 * per-category texture-memory summary. Fields are u64 to match Helium's
 * 56-byte layout. We keep them as `bigint` because the binary's paddq/addq
 * are 64-bit modular adds and callers plausibly stream in byte counts that
 * can exceed 2^53.
 *
 * @Helium 0x0000000000047c00 (layout recovered from `summary`)
 * @Helium 0x0000000000047b20 (corroborated by `addUsage`)
 */
export interface TextureUsage {
  f0: bigint; // +0x00
  f1: bigint; // +0x08
  f2: bigint; // +0x10
  f3: bigint; // +0x18
  f4: bigint; // +0x20
  f5: bigint; // +0x28
  f6: bigint; // +0x30
}

// u64 wrap mask — every add in the binary is a 64-bit modular add.
// @Helium 0x0000000000047c00 (paddq / addq semantics)
const U64_MASK: bigint = 0xffffffffffffffffn;

const u64add = (x: bigint, y: bigint): bigint => (x + y) & U64_MASK;

/**
 * `HGTextureManager::TextureUsage::summary(a, b, c)` — accumulate a
 * three-donor per-category summary into `*this` (the receiver). NOT an
 * assignment: the binary reads the receiver's current fields, adds the
 * contributions listed below, and writes them back. Callers therefore
 * typically pass a freshly-constructed receiver (all-zero via
 * `TextureUsage::TextureUsage()`, @Helium 0x00000000000474c0) so the "+="
 * behaves as an assignment; nothing in this function enforces that.
 *
 *   this.f0 += a.f0 + b.f0 + c.f0
 *   this.f1 += a.f1
 *   this.f2 += a.f2
 *   this.f3 += a.f3
 *   this.f4 += a.f4
 *   this.f5 += b.f1        (note: from donor b, not a)
 *   this.f6 += c.f1        (note: from donor c, not a)
 *
 * @Helium 0x0000000000047c00
 *   mangled: __ZN16HGTextureManager12TextureUsage7summaryERKS0_S2_S2_
 *   demangled: HGTextureManager::TextureUsage::summary(
 *                HGTextureManager::TextureUsage const&,
 *                HGTextureManager::TextureUsage const&,
 *                HGTextureManager::TextureUsage const&)
 */
export function TextureUsage_summary(
  self: TextureUsage,
  a: TextureUsage,
  b: TextureUsage,
  c: TextureUsage,
): void {
  // 47c04..47c0a: rax = a.f0 + b.f0 + c.f0 (three 64-bit adds, mod 2^64).
  const sum_f0_abc: bigint = u64add(u64add(a.f0, b.f0), c.f0);

  // 47c1b..47c2d: this.f0 += sum_f0_abc; this.f1 += a.f1
  //   (packed paddq of [this.f0, this.f1] += [sum_f0_abc, a.f1])
  self.f0 = u64add(self.f0, sum_f0_abc);
  self.f1 = u64add(self.f1, a.f1);

  // 47c31..47c3a: this.f2 += a.f2; this.f3 += a.f3
  //   (packed paddq of [this.f2, this.f3] += [a.f2, a.f3])
  self.f2 = u64add(self.f2, a.f2);
  self.f3 = u64add(self.f3, a.f3);

  // 47c3f..47c50: this.f4 += a.f4; this.f5 += b.f1
  //   (packed paddq of [this.f4, this.f5] += [a.f4, b.f1] — note the
  //    `pinsrq $0x1, 0x8(%rdx), %xmm0` swaps a.f5 out for b.f1 in the
  //    high lane before the add.)
  self.f4 = u64add(self.f4, a.f4);
  self.f5 = u64add(self.f5, b.f1);

  // 47c55..47c59: this.f6 += c.f1  (scalar movq/addq trailer).
  self.f6 = u64add(self.f6, c.f1);
}

// ─────────────────────────────────────────────────────────────────────────────
// HGTextureManager::TextureInfo — the second nested value-type of
// HGTextureManager (the GL texture descriptor handed to texImage2D /
// createTexture / _findTexture).
//
// ── STRUCT LAYOUT — HGTextureManager::TextureInfo (0x3a bytes) ──────────────
//
//   struct TextureInfo {              // sizeof == 0x3a (58 bytes)
//     u32  target;          // +0x00
//     u32  width;           // +0x04
//     u32  height;          // +0x08
//     u32  internalFormat;  // +0x0c
//     u32  format;          // +0x10
//     u32  type;            // +0x14
//     u64  pixels;          // +0x18  (client-storage data pointer)
//     u64  f20;             // +0x20
//     u64  f28;             // +0x28
//     u64  f30;             // +0x30
//     u8   f38;             // +0x38
//     u8   f39;             // +0x39
//   };
//
//   The six u32 head fields are NAMED (not generic fN) because
//   `HGTextureManager::texImage2D(TextureInfo const&)` @Helium 0x4e6d0 feeds
//   them straight into the libGL `glTexImage2D` call at 0x4e988, and the
//   SysV argument registers pin each offset to a named GL parameter
//   (disasm 0x4e95c..0x4e988, with `%r14` = &info):
//
//     0x4e960  movl (%r14), %edi        -> arg1 target         => +0x00 target
//     0x4e983  xorl %esi, %esi          -> arg2 level    = 0
//     0x4e95c  movl 0xc(%r14), %edx     -> arg3 internalformat => +0x0c internalFormat
//     0x4e963  movl 0x4(%r14), %ecx     -> arg4 width          => +0x04 width
//     0x4e967  movl 0x8(%r14), %r8d     -> arg5 height         => +0x08 height
//     0x4e985  xorl %r9d, %r9d          -> arg6 border   = 0
//     0x4e980  movl %eax, (%rsp)        -> arg7 format         => +0x10 format
//              (%eax loaded at 0x4e96b from 0x10(%r14))
//     0x4e97c  movl %esi, 0x8(%rsp)     -> arg8 type           => +0x14 type
//              (%esi loaded at 0x4e96f from 0x14(%r14))
//     0x4e977  movq %r9, 0x10(%rsp)     -> arg9 pixels         => +0x18 pixels
//              (%r9 loaded at 0x4e973 from 0x18(%r14))
//
//   +0x04/+0x08 are independently corroborated by the HGLogger::log call at
//   0x4e732, whose format string is "creating texture (%dx%d) in unit %d\n"
//   and whose %ecx/%r8d come from 0x4(%r14)/0x8(%r14) (0x4e711/0x4e715).
//
//   The tail fields keep generic fN names (Rule 5: offsets documented, no
//   invented semantics) — their purposes are only partially observable from
//   the comparison predicates, which is not enough to name them:
//     sameBaseInfo       @0x46f70 — compares +0x00,+0x04,+0x08,+0x0c
//     sameSourceDataType @0x46fa0 — base + (pixels != 0) XOR-parity
//     sameClientStorage  @0x46fe0 — base + pixels-nullness + f39
//     sameStorageInfo    @0x47030 — base + pixels-nullness + f39 + f38
//     sameStorageData    @0x47080 — sameStorageInfo + pixels + f20
//     sameRangeData      @0x470f0 — sameStorageInfo + f28 + f30
//   Those are separate ledger entries and are NOT ported here.
//
//   sizeof == 0x3a is pinned by the default ctor
//   `TextureInfo::TextureInfo()` @Helium 0x46ef0, whose four overlapping
//   16-byte zero stores cover exactly [0x00, 0x3a):
//     movups %xmm0, 0x2a(%rdi) / 0x20(%rdi) / 0x10(%rdi) / (%rdi)
//   and by the trailing `movw $0x0, 0x38(%rdi)` of the 6-arg ctor below.
//
// ── END LAYOUT ───────────────────────────────────────────────────────────────

/**
 * `HGTextureManager::TextureInfo` — GL texture descriptor. Field widths match
 * Helium's 0x3a-byte layout: six u32 heads (kept as `number`, they are 32-bit
 * GL enums / dimensions) and four u64 tails plus two u8 flags. The u64 tails
 * are `bigint` because +0x18 is a raw 64-bit host pointer and +0x20/+0x28/
 * +0x30 are compared with full-width `cmpq` (they can exceed 2^53).
 *
 * @Helium 0x000000000004e6d0 (field naming recovered from texImage2D's
 *                             glTexImage2D call at 0x4e988)
 * @Helium 0x0000000000046ef0 (size 0x3a pinned by the default constructor)
 */
export class TextureInfo {
  target: number = 0; // +0x00 u32
  width: number = 0; // +0x04 u32
  height: number = 0; // +0x08 u32
  internalFormat: number = 0; // +0x0c u32
  format: number = 0; // +0x10 u32
  type: number = 0; // +0x14 u32
  pixels: bigint = 0n; // +0x18 u64
  f20: bigint = 0n; // +0x20 u64
  f28: bigint = 0n; // +0x28 u64
  f30: bigint = 0n; // +0x30 u64
  f38: number = 0; // +0x38 u8
  f39: number = 0; // +0x39 u8

  /**
   * `HGTextureManager::TextureInfo::TextureInfo(unsigned int, unsigned int,
   *  unsigned int, unsigned int, unsigned int, unsigned int)`
   *   — @Helium 0x0000000000046f40
   *   mangled: __ZN16HGTextureManager11TextureInfoC1Ejjjjjj
   *
   * The C1 (complete-object) variant. Stores the six u32 arguments into the
   * head fields, then zero-fills the whole tail. Calls nothing (no `callq` in
   * the body) and has no in-scope dependencies.
   *
   * Disasm (x86_64 slice, 13 real insns + padding):
   *   0x46f40  pushq   %rbp
   *   0x46f41  movq    %rsp, %rbp
   *   0x46f44  movl    0x10(%rbp), %eax    ; eax = arg6 (stack-passed: rdi holds
   *                                        ;   `this`, so only 5 of the 6 u32
   *                                        ;   args fit the SysV int registers;
   *                                        ;   16(%rbp) is the first stack slot
   *                                        ;   past saved-rbp + return address)
   *   0x46f47  movl    %esi,  (%rdi)       ; this->target         = arg1
   *   0x46f49  movl    %edx,  0x4(%rdi)    ; this->width          = arg2
   *   0x46f4c  movl    %ecx,  0x8(%rdi)    ; this->height         = arg3
   *   0x46f4f  movl    %r8d,  0xc(%rdi)    ; this->internalFormat = arg4
   *   0x46f53  movl    %r9d,  0x10(%rdi)   ; this->format         = arg5
   *   0x46f57  movl    %eax,  0x14(%rdi)   ; this->type           = arg6
   *   0x46f5a  xorps   %xmm0, %xmm0        ; xmm0 = 0
   *   0x46f5d  movups  %xmm0, 0x18(%rdi)   ; zero [0x18, 0x28) -> pixels, f20
   *   0x46f61  movups  %xmm0, 0x28(%rdi)   ; zero [0x28, 0x38) -> f28, f30
   *   0x46f65  movw    $0x0,  0x38(%rdi)   ; zero [0x38, 0x3a) -> f38, f39
   *   0x46f6b  popq    %rbp
   *   0x46f6c  retq
   *   0x46f6d  nopl    (%rax)              ; padding
   *
   * Every argument is stored with a 32-bit `movl`, so each is truncated to
   * u32 — mirrored here with `>>> 0`.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN16HGTextureManager11TextureInfoC1Ejjjjjj.s
   *
   * @Helium 0x0000000000046f40
   */
  constructor(
    target: number,
    width: number,
    height: number,
    internalFormat: number,
    format: number,
    type: number,
  ) {
    // 0x46f47: movl %esi, (%rdi)
    this.target = target >>> 0;
    // 0x46f49: movl %edx, 0x4(%rdi)
    this.width = width >>> 0;
    // 0x46f4c: movl %ecx, 0x8(%rdi)
    this.height = height >>> 0;
    // 0x46f4f: movl %r8d, 0xc(%rdi)
    this.internalFormat = internalFormat >>> 0;
    // 0x46f53: movl %r9d, 0x10(%rdi)
    this.format = format >>> 0;
    // 0x46f44 + 0x46f57: movl 0x10(%rbp), %eax ; movl %eax, 0x14(%rdi)
    this.type = type >>> 0;
    // 0x46f5a-0x46f5d: xorps %xmm0,%xmm0 ; movups %xmm0, 0x18(%rdi)
    this.pixels = 0n;
    this.f20 = 0n;
    // 0x46f61: movups %xmm0, 0x28(%rdi)
    this.f28 = 0n;
    this.f30 = 0n;
    // 0x46f65: movw $0x0, 0x38(%rdi)  — one 16-bit store covering both u8s.
    this.f38 = 0;
    this.f39 = 0;
  }
}

// -----------------------------------------------------------------------------
// HGTextureManager::PostTextureDeleteEventList — the deferred texture-delete
// queue nested inside HGTextureManager.
// -----------------------------------------------------------------------------
// SYMBOL PORTED HERE
//   HGTextureManager::PostTextureDeleteEventList::popEvent()  @Helium 0x48090
//   __ZN16HGTextureManager26PostTextureDeleteEventList8popEventEv
//   re/disasm: raw-port/re/disasm/
//     Helium.__ZN16HGTextureManager26PostTextureDeleteEventList8popEventEv.s
//
// FULL DISASM (9 lines, @0x48090..@0x480a6)
//   __ZN16HGTextureManager26PostTextureDeleteEventList8popEventEv:
//     0x48090  pushq %rbp
//     0x48091  movq  %rsp, %rbp
//     0x48094  movq  0x48(%rdi), %rcx        ; rcx = this->__end_   (+0x48)
//     0x48098  movq  -0x8(%rcx), %rax        ; rax = rcx[-1]        (the last void*)
//     0x4809c  addq  $-0x8, %rcx             ; rcx -= one 8-byte element
//     0x480a0  movq  %rcx, 0x48(%rdi)        ; this->__end_ = rcx
//     0x480a4  popq  %rbp
//     0x480a5  retq
//     0x480a6  nopw  %cs:(%rax,%rax)         ; alignment padding
//
// LAYOUT — recovered from the sibling methods, NOT guessed:
//   +0x00  pthread_mutex_t (0x40 bytes)
//          The constructor @0x47f50 calls `_pthread_mutex_init(%rdi, 0)` @0x47f72
//          with %rdi still holding `this`, so the mutex sits at offset 0 and the
//          next member starts at +0x40 — i.e. it occupies exactly 0x40 bytes,
//          which is sizeof(pthread_mutex_t) on macOS x86_64.
//   +0x40  void** __begin_
//   +0x48  void** __end_
//   +0x50  void** __end_cap_
//          The classic libc++ `std::vector<void*>` triple:
//            * ctor @0x47f64 `movups %xmm0, 0x40(%rdi)` zeroes +0x40/+0x48 and
//              @0x47f68 `movq $0x0, 0x50(%rdi)` zeroes +0x50 — three null pointers.
//            * `hasEvent()` @0x48070 is `__begin_ != __end_`
//              (`movq 0x40(%rdi),%rax ; cmpq 0x48(%rdi),%rax ; setne %al`).
//            * `addEvent(void*)` @0x42b20 is push_back: compare __end_ (+0x48)
//              against __end_cap_ (+0x50) @0x42b3c, store on the fast path, else
//              grow via `__Znwm` @0x42bb1 with libc++'s exact
//              `max(2*capacity, size+1)` / `0x1fffffffffffffff` overflow guard.
//            * the ctor's unwind path @0x47f85 `operator delete`s the block at
//              (%r15) = +0x40 — i.e. __begin_ owns the allocation.
//
// FRONTIER CALLEES: none. popEvent has no `callq` at all — two loads, one store,
// one pointer decrement. No externs, no indirect/virtual call.

/**
 * The element type of `PostTextureDeleteEventList`'s vector: the `void*` that
 * `addEvent(void*)` (`__ZN16HGTextureManager26PostTextureDeleteEventList8addEventEPv`
 * @Helium 0x42b20) stores verbatim @0x42b41 (`movq %rsi, (%r14)`) and that
 * `popEvent` hands back untouched in %rax @0x48098.
 *
 * The binary never dereferences it anywhere in this class, so the port keeps it
 * opaque rather than inventing a shape for it.
 */
export type PostTextureDeleteEvent = unknown;

/**
 * `pthread_mutex_t` at `PostTextureDeleteEventList+0x00` — an out-of-scope
 * libSystem type. `lock()` @Helium 0x42b10 and `unlock()` @Helium 0x42c30 are
 * its only users, and both are separate ledger units; `popEvent` never touches
 * it. Modelled as an opaque handle so the 0x40-byte member the constructor
 * initialises (`_pthread_mutex_init` @stub 0x3c5564, called @0x47f72) is
 * represented rather than silently dropped from the layout.
 */
export interface PthreadMutexT {
  readonly __pthreadMutexT: unique symbol;
}

/**
 * `HGTextureManager::PostTextureDeleteEventList` — a mutex-guarded LIFO of
 * `void*` delete events, held as a libc++ `std::vector<void*>` at +0x40.
 *
 * Only `popEvent()` is transcribed in this ledger unit; `lock`, `unlock`,
 * `addEvent`, `hasEvent`, the constructors and the destructors are their own
 * units. The member layout above is nonetheless pinned by those siblings'
 * disassembly (see the LAYOUT block), so no offset here is a guess.
 *
 * @Helium 0x47f50 (`__ZN16HGTextureManager26PostTextureDeleteEventListC2Ev`,
 * the constructor the layout is recovered from)
 */
export class PostTextureDeleteEventList {
  /**
   * @Helium offset +0x00 — the `pthread_mutex_t` guarding the vector, zero-arg
   * initialised @0x47f72 by `_pthread_mutex_init(this, nullptr)`. Untouched by
   * `popEvent`; `null` models the pre-`pthread_mutex_init` state.
   */
  mutex_at_0x00: PthreadMutexT | null = null;

  /**
   * The heap block that `__begin_`/`__end_`/`__end_cap_` point into, one entry
   * per 8-byte `void*` slot. In the binary this is the single allocation made by
   * `operator new` @0x42bb1 inside `addEvent`'s grow path and freed by
   * `operator delete` (the ctor's unwind path @0x47f91 and the destructor
   * @0x47ff0); the three members below are byte offsets into it, exactly as the
   * machine holds byte pointers into it.
   *
   * @Helium 0x42bb1 (the `__Znwm` that creates the block)
   */
  storage: Array<PostTextureDeleteEvent> = [];

  /**
   * @Helium offset +0x40 — libc++ `__begin_`, as a BYTE offset into `storage`.
   * Zeroed by the constructor @0x47f64 (`movups %xmm0, 0x40(%rdi)`), compared
   * against `__end_` by `hasEvent` @0x48074. `popEvent` never reads it.
   */
  begin_at_0x40 = 0;

  /**
   * @Helium offset +0x48 — libc++ `__end_` (one past the last live element), as
   * a BYTE offset into `storage`. Zeroed by the constructor @0x47f64, advanced
   * by 8 per `addEvent` @0x42b44, and decremented by 8 by `popEvent` @0x4809c.
   * This is the only field `popEvent` writes.
   */
  end_at_0x48 = 0;

  /**
   * @Helium offset +0x50 — libc++ `__end_cap_` (one past the last allocated
   * slot), as a BYTE offset into `storage`. Zeroed by the constructor @0x47f68
   * (`movq $0x0, 0x50(%rdi)`) and read by `addEvent`'s capacity check @0x42b38.
   * `popEvent` never touches it — a pop does not shrink the allocation.
   */
  endCap_at_0x50 = 0;

  /**
   * `HGTextureManager::PostTextureDeleteEventList::popEvent()` — @Helium 0x48090
   * (`__ZN16HGTextureManager26PostTextureDeleteEventList8popEventEv`).
   *
   * Faithful line-for-line transcription of the 9-line disassembly quoted above:
   * read `__end_`, load the element just below it, move `__end_` down by one
   * 8-byte slot, and return that element. This is `back()` followed by
   * `pop_back()` fused into one function — legal for `void*` because the element
   * type is trivially destructible, so libc++ emits no destructor call and the
   * whole body is two loads, a subtraction and a store.
   *
   * NOT thread-safe on its own: the function contains no `callq`, so it never
   * takes the `pthread_mutex_t` at +0x00. Callers are expected to bracket it
   * with `lock()` @0x42b10 / `unlock()` @0x42c30 themselves.
   *
   * NOT bounds-checked: on an empty list (`__begin_ == __end_`) the machine
   * still executes `movq -0x8(%rcx), %rax` and reads the 8 bytes below the
   * buffer, then leaves `__end_` one slot below `__begin_`. We do NOT insert a
   * guard the disasm doesn't have (PORTING_SPEC Rule 1); the TS mirror reads the
   * out-of-range index exactly as the binary reads out-of-range memory.
   *
   * @0xADDR Helium 0x48090
   */
  popEvent(): PostTextureDeleteEvent {
    // @0x48094  movq 0x48(%rdi), %rcx      ; rcx = this->__end_
    let rcx = this.end_at_0x48;
    // @0x48098  movq -0x8(%rcx), %rax      ; rax = *(void**)(rcx - 8)
    const rax = this.storage[(rcx - 0x8) >> 3];
    // @0x4809c  addq $-0x8, %rcx           ; rcx -= 8 (one element)
    rcx = rcx + -0x8;
    // @0x480a0  movq %rcx, 0x48(%rdi)      ; this->__end_ = rcx
    this.end_at_0x48 = rcx;
    // @0x480a4  popq %rbp
    // @0x480a5  retq                       ; return rax
    return rax;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HGTextureManager (the OUTER class) — added @Helium 0x4b320
// ─────────────────────────────────────────────────────────────────────────────
// Everything above this line models the NESTED value types (`TextureUsage`,
// `TextureInfo`, `PostTextureDeleteEventList`). The outer class itself had no
// members ported yet; `storageRecyclingPolicy` is the first, so the class is
// introduced here rather than in a new file — the file is already named after it
// (PORTING_SPEC: one FCP class, one file named after the class).
//
// Symbol added:
//   @Helium 0x4b320  HGTextureManager::storageRecyclingPolicy(
//                        HGTextureManager::TextureStorageRecyclingPolicy)
//     __ZN16HGTextureManager22storageRecyclingPolicyENS_29TextureStorageRecyclingPolicyE
//
// Source disassembly (re-derived with
// `raw-port/tools/disasm.sh --sym __ZN16HGTextureManager22storageRecyclingPolicyENS_29TextureStorageRecyclingPolicyE Helium`):
//   raw-port/re/disasm/Helium.__ZN16HGTextureManager22storageRecyclingPolicyENS_29TextureStorageRecyclingPolicyE.s
//
// FULL DISASM — the whole function
//   0x4b320  pushq %rbp                 ; frame setup (no TS counterpart)
//   0x4b321  movq  %rsp, %rbp
//   0x4b324  movl  %esi, 0xa8(%rdi)     ; this->storageRecyclingPolicy = arg (u32)
//   0x4b32a  popq  %rbp
//   0x4b32b  retq
//   0x4b32c  nopl  (%rax)               ; padding, not executed
//
// A pure setter: one 32-bit store, no validation, no branch, no callee
// (`depgraph.py deps` lists nothing). `movl` fixes the width at 32 bits, which
// is mirrored with `>>> 0`.

/**
 * `HGTextureManager::TextureStorageRecyclingPolicy` — the enum tag stored at
 * +0xa8. No decoded instruction pins a single enumerator: the setter
 * @0x4b324 passes `%esi` straight into the slot with no mask, no range check and
 * no branch, and the export table has no matching getter to compare against
 * (the only neighbour is `recycleClientStorageTextures(bool)` @0x4b330, a
 * different field). Modelled as an opaque u32 until a ctor or a comparison site
 * reveals the values — the same treatment the landed HGRenderJob.ts gives its
 * own enum tags.
 */
export type TextureStorageRecyclingPolicy = number;

/**
 * `HGTextureManager` — Helium's texture manager. Only the ONE field this unit
 * writes is modelled; the rest of the (large) layout is undecoded and
 * deliberately absent (PORTING_SPEC Rule 5).
 *
 * @Helium 0x4b320
 */
export class HGTextureManager {
  /**
   * @Helium HGTextureManager@0xa8 — the u32 `TextureStorageRecyclingPolicy`
   * enum tag, written by `storageRecyclingPolicy` @0x4b324 via a single
   * `movl %esi, 0xa8(%rdi)`. Measured on the live setter: the 4 bytes at +0xa8
   * take the full 32-bit argument and NO other byte of a 0x200-byte object
   * changes. Zero-initialised until a ctor is transcribed to reveal the true
   * default.
   */
  storageRecyclingPolicy_at_0xa8: TextureStorageRecyclingPolicy = 0; // @Helium HGTextureManager@0xa8

  /**
   * `HGTextureManager::storageRecyclingPolicy(HGTextureManager::TextureStorageRecyclingPolicy)`
   *   — @Helium 0x4b320
   *     __ZN16HGTextureManager22storageRecyclingPolicyENS_29TextureStorageRecyclingPolicyE
   *
   * Stores the policy enum into the u32 slot at `this+0xa8`. The whole body is
   * one `movl` between a frame prologue and a `retq` — no validation, no
   * branching, no callee. Note this is a SETTER despite the getter-style name
   * (C++ overloading by argument list); the export table has no zero-argument
   * counterpart.
   *
   * ORACLE: verified against the live Helium binary
   * (raw-port/re/oracle/HGTextureManager_storageRecyclingPolicy_oracle.py). The
   * symbol is EXPORTED (`nm -arch x86_64` type `T` @0x4b320) and is called under
   * `arch -x86_64 /usr/bin/python3` — the port is transcribed from the x86_64
   * slice — on a 0x200-byte object pre-filled with 0xEE. 208 cases (0..3,
   * INT_MAX, 0x80000000, 0xffffffff, 0xdeadbeef and 200 random u32s): the dword
   * at +0xa8 held the exact argument in 208/208, and 0 cases changed any other
   * byte of the object.
   * NEGATIVE CONTROLS (measured, same 208 cases): a 16-bit store -> 208 wrong
   * (the upper half would have kept the poison); writing +0xac instead -> 208
   * wrong; writing +0xa4 instead -> 208 wrong.
   *
   * @param policy — the enum value (SysV %esi, u32).
   */
  storageRecyclingPolicy(policy: TextureStorageRecyclingPolicy): void {
    // @0x4b324 — movl %esi, 0xa8(%rdi) : a 32-bit store. `>>> 0` models the
    //   truncation, so a negative or oversized JS number stores the same bit
    //   pattern the machine would.
    this.storageRecyclingPolicy_at_0xa8 = policy >>> 0;
  }
}
