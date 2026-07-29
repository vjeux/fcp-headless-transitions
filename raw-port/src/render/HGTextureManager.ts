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
