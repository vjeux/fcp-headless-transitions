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
