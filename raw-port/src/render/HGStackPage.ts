// HGStackPage.ts — Helium's per-page bookkeeping struct for HGExecUnitStack's
// heap-slab allocator. An HGStackPage owns a single fixed-size slab of 16-byte
// entries (the payload lives at (this).buf), plus a small set of counters that
// track how many entries are currently live (offset), how many have ever been
// handed out (totalUsed), how many hand-outs have occurred (count), the size
// of the most recent hand-out (used), and an "age" stamp that the enclosing
// pool bumps monotonically.
//
// This file is a leaf math/bookkeeping unit: every method is straight-line
// integer arithmetic on the layout below plus, for `dump`, a single call
// through HGLogger. Nothing in this class allocates or references a filled
// payload — the payload is opaque `void*` land as far as the page struct is
// concerned. That's why the whole class fits in <100 lines of asm.
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium.
//
// Source disassemblies (raw-port/re/disasm/):
//   Helium.HGStackPage.HGStackPage.s   (C1 ctor)        — @0x143090
//   Helium.HGStackPage.~HGStackPage.s  (D1 dtor)        — @0x143110
//   Helium.HGStackPage.use.s           (::use)          — @0x143170
//   Helium.HGStackPage.stamp.s         (::stamp)        — @0x143190
//   Helium.HGStackPage.commit.s        (::commit)       — @0x143150
//   Helium.HGStackPage.dump.s          (::dump)         — @0x1431a0
//
// Helium symbols transcribed (mangled → demangled → address):
//   __ZN11HGStackPageC1Em    HGStackPage::HGStackPage(unsigned long)   @0x143090
//   __ZN11HGStackPageD1Ev    HGStackPage::~HGStackPage()               @0x143110
//   __ZN11HGStackPage6commitEm HGStackPage::commit(unsigned long)      @0x143150
//   __ZN11HGStackPage3useEm  HGStackPage::use(unsigned long)           @0x143170
//   __ZN11HGStackPage5stampEm HGStackPage::stamp(unsigned long)        @0x143190
//   __ZNK11HGStackPage4dumpEmib HGStackPage::dump(unsigned long,int,bool) const @0x1431a0
//
// Instance layout (56 bytes; recovered from the ctor's zero-init and every
// method's field accesses):
//
//   offset  size   name        evidence
//   ------  ----   ----------  --------
//   0x00    8      buf         @0x143090 movq $0x0 → wiped via xmmps; @0x1430c4
//                              stores HGMalloc result to (%rbx); dtor @0x143119
//                              loads (%rdi) → HGFree.
//   0x08    8      size        @0x1430c7 movq %r14, 0x8(%rbx); r14 = ctor arg
//                              (element count). dump @0x1431cf reads it.
//   0x10    8      offset      commit @0x143157 addq %rsi, 0x10(%rdi) — running
//                              commit cursor (in ELEMENTS, not bytes; commit
//                              multiplies by 16 only to compute the return
//                              pointer). dtor @0x14312c also clears this.
//   0x18    8      used        use  @0x143174 movq %rsi, 0x18(%rdi) — size of
//                              the *most recent* hand-out. dump @0x143202 reads
//                              it into %rbx.
//   0x20    8      totalUsed   use  @0x143178 addq %rsi, 0x20(%rdi) — sum of
//                              all hand-outs handed out so far this life.
//   0x28    4      count       use  @0x14317c incl 0x28(%rdi) — hand-out count.
//                              dump @0x14322d reads r15d = 0x28(%r8).
//   0x2c    4      (pad)       (28-byte struct rounded to 32 by ctor's xmmps at
//                              0x1c; ctor writes movups %xmm0, 0x1c(%rdi) which
//                              zeroes [0x1c..0x2c) — see NB below.)
//   0x30    8      age         stamp @0x143194 movq %rsi, 0x30(%rdi). dump
//                              @0x143231 subq 0x30(%r8), %r10 — age is
//                              subtracted from stamp arg to get delta.
//   -----   -----  -----------
//   total   0x38 (56) bytes
//
//   NB: the ctor zeroes [0x00..0x2c) using three 16-byte movups stores at
//   0x1430(9b/9e/a2), which cover 0..0xf, 0x10..0x1f, and 0x1c..0x2b (the
//   third overlaps the second by 4 bytes — a compiler-emitted way to zero a
//   28-byte trailing region). It then writes movq $0x0, 0x30(%rdi) @0x143090
//   to zero the 8-byte `age` field explicitly. `count` (a 4-byte field at
//   +0x28) is covered by the second/third movups. The dtor zeroes [0..0x17]
//   the same way (@0x143126..0x14312c) after HGFree.
//
// Externals (undecoded on this class's slice — cited by call site):
//   _HGMalloc  (extern C dyld-bound)  — ctor @0x1430bf
//   _HGFree    (extern C dyld-bound)  — dtor @0x143121
//   __ZN8HGLogger8_enabledE    HGLogger::_enabled   (u8 global) — dump @0x1431a2
//   __ZN8HGLogger3logEPKciS1_z HGLogger::log(char const*, int, char const*, ...)
//                              — dump call @0x1432af
//
// Rule 4 (single-precision numerics): the `dump` method reads three 64-bit
// counters, converts them to `float` via `cvtsi2ss`, multiplies by two RIP-
// resident float constants (0x287050 and 0x2870e6), and passes the results
// through the `HGLogger::log` varargs. We mirror the arithmetic through
// `Math.fround` and cite each constant's address; we do NOT invent the
// constant values — the actual bytes at those RIP addresses are read
// lazily by the ported dump function through a small helper that surfaces
// them as address-tagged throws until a follow-up patch decodes them.
//
// Nothing on this class is on the render math hot path; the whole file is
// bookkeeping for the exec-unit stack pool. `dump` is a diagnostic printf.

/* eslint-disable @typescript-eslint/no-unused-vars */

// -----------------------------------------------------------------------------
// Extern stubs — cited by address; each throws until wired.
// -----------------------------------------------------------------------------

/** Extern C `HGMalloc(size_t bytes)` — dyld-bound symbol used by HGStackPage's
 *  ctor at @0x1430bf (Helium). Returns a heap pointer of `bytes` bytes. Not
 *  yet transcribed. */
function HGMalloc(_bytes: bigint): number /* opaque page-buf handle */ {
  throw new Error("HGMalloc @Helium extern @0x1430bf (dyld-bound) not yet transcribed");
}

/** Extern C `HGFree(void*)` — dyld-bound symbol used by HGStackPage's dtor
 *  at @0x143121 (Helium). Not yet transcribed. */
function HGFree(_buf: number): void {
  throw new Error("HGFree @Helium extern @0x143121 (dyld-bound) not yet transcribed");
}

/** Global u8 `HGLogger::_enabled` at Helium data VA 0xade514, read by
 *  HGStackPage::dump @0x1431a2 as a fast bypass gate. If zero, dump is a
 *  no-op. Not yet transcribed. */
function HGLogger_enabled(): number {
  throw new Error(
    "HGLogger::_enabled u8 @Helium 0xade514 not yet transcribed",
  );
}

/** `HGLogger::log(char const*, int, char const*, ...)` — undecoded printf-like
 *  sink invoked by HGStackPage::dump at @0x1432af. Not yet transcribed. */
function HGLogger_log(
  _component: string,
  _level: number,
  _fmt: string,
  ..._args: unknown[]
): void {
  throw new Error("HGLogger::log @Helium 0x1432af not yet transcribed");
}

/** RIP-relative single-precision float constants used by HGStackPage::dump.
 *  Addresses are documented; their exact byte values are NOT invented here.
 *  Callers get a throw that names the constant's address. */
function heliumF32Const(ripAddr: number): number {
  throw new Error(
    `HGStackPage::dump RIP-const @Helium 0x${ripAddr.toString(16)} not yet transcribed`,
  );
}

// -----------------------------------------------------------------------------
// Layout constants — every offset cited to its evidence in the disassembly.
// -----------------------------------------------------------------------------

/** In-instance byte offsets. Each field is documented in the header block. */
const OFF_BUF = 0x00;      // @0x143090 ctor init; @0x143119 dtor read
const OFF_SIZE = 0x08;     // @0x1430c7 ctor init; @0x1431cf dump read
const OFF_OFFSET = 0x10;   // @0x143157 commit rmw; @0x143229 dump read
const OFF_USED = 0x18;     // @0x143174 use write; @0x143202 dump read
const OFF_TOTAL_USED = 0x20; // @0x143178 use rmw
const OFF_COUNT = 0x28;    // @0x14317c use inc; @0x14322d dump read
const OFF_AGE = 0x30;      // @0x143194 stamp write; @0x143231 dump read

/** Sizeof(page entry) — the ctor multiplies its element-count arg by 16 to
 *  compute the HGMalloc byte size, and commit multiplies its result cursor by
 *  16 to convert an element offset back into a byte offset off buf. */
const HG_STACK_PAGE_ENTRY_SIZE = 0x10; // @0x1430b8 shlq $0x4, %rdi

// -----------------------------------------------------------------------------
// Class.
// -----------------------------------------------------------------------------

/**
 * HGStackPage — one page of Helium's exec-unit stack pool.
 *
 * @Helium
 *   ctor    @0x143090   __ZN11HGStackPageC1Em
 *   dtor    @0x143110   __ZN11HGStackPageD1Ev
 *   use     @0x143170   __ZN11HGStackPage3useEm
 *   stamp   @0x143190   __ZN11HGStackPage5stampEm
 *   commit  @0x143150   __ZN11HGStackPage6commitEm
 *   dump    @0x1431a0   __ZNK11HGStackPage4dumpEmib
 *
 * Fields track: `buf` (backing HGMalloc'd slab), `size` (entry count),
 * `offset` (running cursor in elements), `used` (most recent hand-out size),
 * `totalUsed` (sum of all hand-outs), `count` (# hand-outs), `age` (stamp).
 * Layout matches C++ at the offsets cited above.
 */
export class HGStackPage {
  /** +0x00 — backing pointer (opaque handle from HGMalloc). 0 = empty page. */
  buf: number = 0;
  /** +0x08 — number of entries the page can hold. Ctor arg. */
  size: bigint = 0n;
  /** +0x10 — running cursor in *elements* (not bytes). */
  offset: bigint = 0n;
  /** +0x18 — size of the most recent `use()` hand-out. */
  used: bigint = 0n;
  /** +0x20 — cumulative sum of all `use()` hand-outs. */
  totalUsed: bigint = 0n;
  /** +0x28 — number of `use()` calls made against this page (uint32). */
  count: number = 0;
  /** +0x30 — most recent stamp value set by `stamp()`. */
  age: bigint = 0n;

  /**
   * HGStackPage::HGStackPage(unsigned long size) — @Helium 0x143090.
   *
   * ```
   *   0x143090  movq  $0x0, 0x30(%rdi)             ; age = 0
   *   0x143098  xorps %xmm0, %xmm0
   *   0x14309b  movups %xmm0, (%rdi)               ; [0x00..0x0f] = 0
   *   0x14309e  movups %xmm0, 0x10(%rdi)           ; [0x10..0x1f] = 0
   *   0x1430a2  movups %xmm0, 0x1c(%rdi)           ; [0x1c..0x2b] = 0
   *                                                (overlaps the previous
   *                                                store — compiler-emitted
   *                                                fill of the trailing 28
   *                                                bytes past the initial
   *                                                two 16-byte zeros).
   *   0x1430a6  testq %rsi, %rsi
   *   0x1430a9  je    0x1430cf                     ; if size == 0 → return
   *   ...
   *   0x1430b5  movq  %rsi, %rdi
   *   0x1430b8  shlq  $0x4, %rdi                   ; rdi = size * 16
   *   0x1430bc  movq  %rsi, %r14                   ; save size
   *   0x1430bf  callq _HGMalloc                    ; rax = HGMalloc(size*16)
   *   0x1430c4  movq  %rax, (%rbx)                 ; this.buf = rax
   *   0x1430c7  movq  %r14, 0x8(%rbx)              ; this.size = size
   *   0x1430cb..0x1430cf  epilogue
   * ```
   */
  constructor(sizeArg: bigint = 0n) {
    // Zero-init every field @0x143090..0x1430a2 (+ movq $0 at 0x30).
    this.buf = 0;
    this.size = 0n;
    this.offset = 0n;
    this.used = 0n;
    this.totalUsed = 0n;
    this.count = 0;
    this.age = 0n;

    // @0x1430a6..0x1430a9: `testq %rsi, %rsi; je return`.
    if (sizeArg !== 0n) {
      // @0x1430b8: rdi = size << 4 (== size * HG_STACK_PAGE_ENTRY_SIZE).
      const byteCount = sizeArg * BigInt(HG_STACK_PAGE_ENTRY_SIZE);
      // @0x1430bf: HGMalloc(size * 16). Returned opaque handle → this.buf.
      // @0x1430c4/0x1430c7: store buf and size fields.
      this.buf = HGMalloc(byteCount);
      this.size = sizeArg;
    }
  }

  /**
   * HGStackPage::~HGStackPage() — @Helium 0x143110.
   *
   * ```
   *   0x143119  movq  (%rdi), %rdi                 ; rdi = this.buf
   *   0x14311c  testq %rdi, %rdi
   *   0x14311f  je    0x143134                     ; buf == 0 → skip free
   *   0x143121  callq _HGFree                      ; HGFree(this.buf)
   *   0x143126  xorps %xmm0, %xmm0
   *   0x143129  movups %xmm0, (%rbx)               ; buf=0, size=0
   *   0x14312c  movq  $0x0, 0x10(%rbx)             ; offset = 0
   *   0x143134..0x14313a  epilogue
   * ```
   *
   * TS has no explicit dtor; expose as `dispose()` for callers that want to
   * mirror the C++ tear-down semantics faithfully.
   */
  dispose(): void {
    // @0x143119..0x14311f: if this.buf != 0, HGFree it.
    if (this.buf !== 0) {
      HGFree(this.buf);
      // @0x143126..0x14312c: clear buf/size/offset on the released page.
      this.buf = 0;
      this.size = 0n;
      this.offset = 0n;
    }
  }

  /**
   * HGStackPage::use(unsigned long n) — @Helium 0x143170.
   *
   * ```
   *   0x143174  movq  %rsi, 0x18(%rdi)             ; this.used = n
   *   0x143178  addq  %rsi, 0x20(%rdi)             ; this.totalUsed += n
   *   0x14317c  incl  0x28(%rdi)                   ; this.count++  (uint32)
   *   0x14317f..0x143180  epilogue
   * ```
   */
  use(n: bigint): void {
    this.used = n;
    this.totalUsed = this.totalUsed + n;
    // C++ increments a 32-bit field; mask to 32 bits like `incl` does.
    this.count = (this.count + 1) >>> 0;
  }

  /**
   * HGStackPage::stamp(unsigned long s) — @Helium 0x143190.
   *
   * ```
   *   0x143194  movq  %rsi, 0x30(%rdi)             ; this.age = s
   *   0x143198..0x143199  epilogue
   * ```
   */
  stamp(s: bigint): void {
    this.age = s;
  }

  /**
   * HGStackPage::commit(unsigned long n) — @Helium 0x143150.
   *
   * Returns `this.buf + (this.offset + n) * 16` after bumping `this.offset`.
   * The `<<4` at 0x14315f is `sizeof(entry) == 16` — commit converts an
   * element-count cursor into a byte pointer.
   *
   * ```
   *   0x143154  movq  %rsi, %rax                   ; rax = n
   *   0x143157  addq  0x10(%rdi), %rax             ; rax += this.offset
   *   0x14315b  movq  %rax, 0x10(%rdi)             ; this.offset = rax
   *   0x14315f  shlq  $0x4, %rax                   ; rax *= 16
   *   0x143163  addq  (%rdi), %rax                 ; rax += this.buf
   *   0x143166..0x143167  epilogue                 ; return rax
   * ```
   *
   * Because `buf` is an opaque handle (see HGMalloc stub), the returned
   * "pointer" is the numeric expression `buf + offset*16`. Real pointer
   * semantics land when the HGMalloc/HGFree pair is transcribed; the
   * arithmetic here is bit-exact against the disassembly.
   */
  commit(n: bigint): bigint {
    // @0x143157/0x14315b: this.offset += n; return that as `rax`.
    const newOffset = this.offset + n;
    this.offset = newOffset;
    // @0x14315f/0x143163: (newOffset << 4) + this.buf.
    const byteOffset = newOffset << 4n;
    return byteOffset + BigInt(this.buf);
  }

  /**
   * HGStackPage::dump(unsigned long stamp, int level, bool selected) const
   * — @Helium 0x1431a0.
   *
   * Emits one line via HGLogger::log describing the page's live counters.
   *
   * Fast-out gate @0x1431a2..0x1431af:
   *   ```
   *     leaq HGLogger::_enabled(%rip), %rcx
   *     movzbl (%rcx), %ecx
   *     cmpb $0x1, %cl
   *     jne  return
   *   ```
   * If `HGLogger::_enabled` is not exactly 1, dump is a no-op.
   *
   * The active path builds these varargs to HGLogger::log:
   *   ```
   *     indent = selected ? ">" : " "                @0x1431bb..0x1431cf
   *     size_bytes = this.size * 16                  @0x1431d3..0x1431da  (shlq $0x4)
   *     size_mb    = float(size_bytes) * K_MB        @0x1431dc..0x1431fa
   *                                                  (cvtsi2ss + mulss with
   *                                                   RIP-const @0x1431fa+
   *                                                   0x2870e6 → helium data)
   *     used_x100  = float(this.used)  * K_PCT_100   @0x1431e3..0x14323c
   *                                                  (mulss with RIP-const
   *                                                   @0x14323c + 0x287050 →
   *                                                   helium data)
   *     size_f     = float(this.size)                @0x143244..0x143268
   *     ratio      = used_x100 / size_f              @0x143268 divss
   *     pct        = truncf(ratio + copysign(0.5f, ratio))
   *                                                  @0x14326c..0x14328a
   *                  (andps/orps/addss/roundss $0xb — round-to-nearest-
   *                   away-from-zero via the classic magic-const trick;
   *                   cvttss2si → int %r12d).
   *     delta_age  = stamp - this.age                @0x143231
   *     HGLogger::log("stack", level,
   *       " | %s page %p : ptr = %p, offset = %lu, count = %7d, "
   *       "age = %lu, size = %7lu (%2.1f mb), (used size = %7lu, %2d%%)\n",
   *       indent, this, this.buf, this.offset, this.count, delta_age,
   *       this.size, (double)size_mb, this.used, pct)
   *   ```
   *
   * @0x1432af  callq __ZN8HGLogger3logEPKciS1_z
   *
   * All arithmetic is single-precision (Math.fround), matching the machine.
   * The two RIP-constants at RIP-next 0x1431fa and 0x14323c are cited by
   * their target VAs (0x1431fa+0x2870e6 = 0x3ca2e0 and 0x14323c+0x287050
   * = 0x3ca28c relative to __TEXT for Helium; we cite the operand form
   * verbatim and defer their byte-decoding to a follow-up patch).
   */
  dump(stamp: bigint, level: number, selected: boolean): void {
    // @0x1431a2..0x1431af: gate on HGLogger::_enabled == 1.
    if (HGLogger_enabled() !== 1) {
      return;
    }
    // @0x1431bb..0x1431cf: pick indent literal.
    const indent = selected ? ">" : " ";

    // @0x1431cf..0x1431da: size_bytes = this.size << 4 (uint64).
    const sizeBytes = this.size << 4n;

    // @0x1431dc..0x1431ef: float(sizeBytes). The `js` branch at 0x1431da
    // guards the unsigned-to-float conversion when the top bit is set:
    // `shr rax; cvtsi2ss; addss xmm0,xmm0` doubles the halved conversion.
    // For the values Helium ever passes (page bytes fit easily in an f32
    // domain that keeps cvtsi2ss's signed range) the direct path is used.
    // We mirror both branches for faithfulness — see u64ToF32 below.
    const sizeBytesF = u64ToF32(sizeBytes);
    // @0x1431fa: mulss with RIP-relative single-precision const → sizeMbF32.
    const kMbConst = heliumF32Const(0x1431fa + 0x2870e6);
    const sizeMbF32 = Math.fround(sizeBytesF * kMbConst);
    // @0x143235: cvtss2sd → sizeMb double (fed to %2.1f).
    const sizeMbF64 = sizeMbF32; // JS `number` is f64; the cvtss2sd widens.

    // @0x143202..0x143229: float(this.used) via the same signed-fixup path.
    const usedF = u64ToF32(this.used);
    // @0x14323c: mulss with second RIP-const → usedX100F32.
    const kPct100 = heliumF32Const(0x14323c + 0x287050);
    const usedX100F32 = Math.fround(usedF * kPct100);

    // @0x143244..0x143268: float(this.size) via the same fixup path.
    const sizeF = u64ToF32(this.size);

    // @0x143268: xmm1 (usedX100) /= xmm2 (sizeF).
    // Division by zero mirrors x87/SSE default IEEE semantics; the C++ code
    // does no guard. We keep the same non-guarded division.
    const ratioF32 = Math.fround(usedX100F32 / sizeF);

    // @0x14326c..0x14328a: round-to-nearest-away-from-zero via
    //   copysign(0.5f, ratio) + ratio, then truncate. In IEEE this is the
    //   textbook "add half toward the same sign, then trunc" trick.
    const half = ratioF32 >= 0 ? 0.5 : -0.5;
    const preRoundF32 = Math.fround(ratioF32 + half);
    // roundss $0xB = truncate toward zero (mode 3, precision suppressed).
    // cvttss2si %xmm1, %r12d — 32-bit signed truncation.
    const pctF32Trunc = Math.trunc(preRoundF32);
    // Fold to int32 like `cvttss2si` (defined-on-overflow = 0x80000000, but
    // Helium's inputs never reach that; we mirror the truncation only).
    const pct = pctF32Trunc | 0;

    // @0x143231: delta_age = stamp - this.age (uint64 subtraction, wraps).
    const deltaAge = (stamp - this.age) & ((1n << 64n) - 1n);

    // @0x1432af: HGLogger::log("stack", level, fmt, indent, this, this.buf,
    //   this.offset, this.count, deltaAge, this.size, sizeMbF64, this.used,
    //   pct).
    HGLogger_log(
      "stack",
      level,
      " | %s page %p : ptr = %p, offset = %lu, count = %7d, age = %lu, size = %7lu (%2.1f mb), (used size = %7lu, %2d%%)\n",
      indent,
      this,
      this.buf,
      this.offset,
      this.count,
      deltaAge,
      this.size,
      sizeMbF64,
      this.used,
      pct,
    );
  }
}

// -----------------------------------------------------------------------------
// Helper: uint64 → f32 with the exact fixup the compiler emitted.
// -----------------------------------------------------------------------------

/**
 * Reproduces the codegen sequence used at @0x1431d3..0x1431ef,
 * @0x143206..0x143229 and @0x143244..0x143268 for turning a uint64
 * (%r11/%rbx) into an f32 in %xmm0/%xmm1/%xmm2:
 * ```
 *   testq  %rN, %rN
 *   js     .Lfixup
 *   cvtsi2ss %rN, %xmmM
 *   jmp    .Ldone
 *  .Lfixup:
 *   movq   %rN, %rax
 *   shrq   %rax
 *   movl   %rNd, %esi           ; low 32 bits of rN
 *   andl   $0x1, %esi
 *   orq    %rax, %rsi           ; (rN >> 1) | (rN & 1)
 *   cvtsi2ss %rsi, %xmmM
 *   addss  %xmmM, %xmmM         ; * 2
 * ```
 * When the sign bit of the u64 is clear, the direct signed conversion is
 * exact; when it is set, halving-then-doubling with an ORed low bit avoids
 * a signed overflow while preserving one bit of low precision (this is the
 * textbook u64→f32 pattern). Return an `f32` value (Math.fround).
 */
function u64ToF32(v: bigint): number {
  // @sign-bit set path @0x1431e3..0x1431ef fixup.
  const TOP_BIT = 1n << 63n;
  if (v < 0n || (v & TOP_BIT) !== 0n) {
    // @0x1431e3..0x1431eb / @0x143212..0x143225 / @0x143250..0x143264.
    const halved = (v & ((1n << 64n) - 1n)) >> 1n;
    const low = v & 1n;
    const combined = halved | low;
    return Math.fround(Math.fround(Number(combined)) * 2);
  }
  // @0x1431dc..0x1431e1 direct signed path — cvtsi2ss with rax in range.
  return Math.fround(Number(v));
}
