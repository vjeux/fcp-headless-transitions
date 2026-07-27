// FFRunningStatistics.ts — running mean/variance accumulator using Welford's online algorithm.
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly saved at:
//   raw-port/re/disasm/Flexo.FFRunningStatistics.addData.s
//   raw-port/re/disasm/Flexo.FFRunningStatistics.reset.s
//   raw-port/re/disasm/Flexo.FFRunningStatistics.logStats.s
//
// Three methods (from `nm` + `otool -tV` on Flexo):
//   @Flexo 0x00000000012ed1d0  FFRunningStatistics::addData(double)
//   @Flexo 0x00000000012ed270  FFRunningStatistics::reset()
//   @Flexo 0x00000000012ed2a0  FFRunningStatistics::logStats(char const*)
//
// STRUCT LAYOUT (recovered from field writes in reset @0x12ed270 and addData @0x12ed1d0,
// and field reads in logStats @0x12ed2a0). Total sizeof = 0x30 = 48 bytes.
//   +0x00  count      uint64_t   // number of samples accumulated so far
//   +0x08  min        double     // running minimum (reset initializes to DBL_MAX = 0x7FEFFFFFFFFFFFFF)
//   +0x10  max        double     // running maximum (reset initializes to 0.0)
//   +0x18  mean       double     // running arithmetic mean (Welford)
//   +0x20  M2         double     // sum of squared differences from the running mean (Welford M2)
//   +0x28  lastValue  double     // last x passed to addData()
// Provenance of layout:
//   reset writes u64 0 @+0x00 (0x12ed274), u64 DBL_MAX @+0x08 (0x12ed27b/85), and two 128-bit
//   zeros @+0x10 (0x12ed28c) and @+0x20 (0x12ed290). addData reads/writes min@+0x08 & max@+0x10
//   as a movupd pair (0x12ed1d8, 0x12ed1fd), reads/writes mean@+0x18 (0x12ed20b, 0x12ed245),
//   reads/writes M2@+0x20 (0x12ed256, 0x12ed25b), and writes lastValue@+0x28 (0x12ed260).
//   logStats reads count@+0x00 (0x12ed2aa), mean@+0x18 (0x12ed2bc), M2@+0x20 (0x12ed2dc),
//   min@+0x08 (0x12ed300), max@+0x10 (0x12ed305), lastValue@+0x28 (0x12ed30a).
//
// NUMERICS: the class is entirely double-precision (movsd / subsd / addsd / divsd / mulsd /
// sqrtsd), so all TS ops on `number` match the ABI. The two int64->double conversions in
// addData and logStats use the well-known SSE "punpckldq+subpd" magic-constant trick to build
// (double)count without a rounding-mode-sensitive cvtsi2sd fallback for the u64 top bit; the
// mathematical result equals Number(BigInt(count)) for counts <= 2^53, which is the entire
// working range of this counter in practice (Welford stops being meaningful long before then).
// We use `Number(count)` directly and document the equivalence.

const DBL_MAX = 1.7976931348623157e+308; // == u64 0x7FEFFFFFFFFFFFFF, matches movabsq @0x12ed27b

// stderr sink for logStats. In native code logStats calls `fprintf(*___stderrp, fmt, ...)`
// (see 0x12ed2ad + 0x12ed319/0x12ed32b, both tail-jumping to _fprintf stub @0x1497758). In TS we
// route through this indirection so tests can capture output; the default writes to process.stderr.
export type FFStderrWriter = (line: string) => void;
let stderrWriter: FFStderrWriter = (line) => {
  process.stderr.write(line);
};
export function setFFStderrWriter(w: FFStderrWriter): void { stderrWriter = w; }

// C's `%g` (fprintf) picks between %e and %f automatically, with 6 significant digits by
// default and trims trailing zeros. This helper is a small transcription of that so that
// logStats output matches what FCP emits when reviewers diff logs against the app.
function formatG(x: number): string {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  if (x === 0) return "0";
  const abs = Math.abs(x);
  const exp = Math.floor(Math.log10(abs));
  const precision = 6;
  let s: string;
  if (exp < -4 || exp >= precision) {
    s = x.toExponential(precision - 1);
    s = s.replace(/\.?0+e/, "e");
    s = s.replace(/e([+-])(\d)$/, "e$10$2");
  } else {
    const frac = Math.max(0, precision - 1 - exp);
    s = x.toFixed(frac);
    if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  }
  return s;
}

export class FFRunningStatistics {
  // Fields ordered / typed per the byte-offset layout above.
  count    : number = 0;         // +0x00 (u64; TS number is exact up to 2^53)
  min      : number = DBL_MAX;   // +0x08
  max      : number = 0;         // +0x10
  mean     : number = 0;         // +0x18
  M2       : number = 0;         // +0x20
  lastValue: number = 0;         // +0x28

  constructor() { this.reset(); }

  /**
   * @Flexo 0x00000000012ed1d0  FFRunningStatistics::addData(double)
   *
   * Welford's online mean+M2 update, plus in-place min/max maintenance. The ASM is a tight
   * SIMD implementation of the following math (single-lane semantics, all double-precision):
   *
   *   x = value
   *   // [min, max] update via cmpltpd+blendvpd on packed [min,max] vs packed [x,x]:
   *   //   if (x < min) min = x;
   *   //   if (max < x) max = x;
   *   count += 1
   *   delta      = x - mean
   *   mean      += delta / (double)count
   *   M2        += (x - mean) * delta          // note: uses the NEW mean, per Welford
   *   lastValue  = x
   *
   * ASM structure:
   *   0x12ed1d8 movupd 0x8(%rdi), %xmm2         ; xmm2 = [min, max]
   *   0x12ed1dd..0x12ed1f8: cmpltpd/blendvpd    ; packed compare-and-blend against [x, x]
   *   0x12ed1fd movupd %xmm2, 0x8(%rdi)         ; store new [min, max]
   *   0x12ed202..0x12ed208: count = count + 1   ; movq/incq/movq (u64)
   *   0x12ed20b movsd 0x18(%rdi), %xmm0         ; xmm0 = mean
   *   0x12ed214 subsd %xmm0, %xmm2              ; xmm2 = x - mean = delta   (xmm1 held x)
   *   0x12ed218..0x12ed235: xmm4 = (double)count
   *       via the classic "punpckldq imm64/subpd imm128" magic-number expansion
   *       constants @Flexo 0x156cae0 = 0x4530000043300000 (double 1.9342817955203666e+25)
   *                @Flexo 0x156caf0 = 0x4330000000000000 (double 4503599627370496.0)
   *                @Flexo 0x156caf8 = 0x4530000000000000 (double 1.9342813113834067e+25)
   *   0x12ed239..0x12ed241: mean = mean + delta / count
   *   0x12ed245 movsd %xmm3, 0x18(%rdi)         ; store new mean
   *   0x12ed24a..0x12ed252: xmm0 = (x - new_mean) * delta
   *   0x12ed256 addsd 0x20(%rdi), %xmm0         ; xmm0 = M2 + (x - new_mean) * delta
   *   0x12ed25b movsd %xmm0, 0x20(%rdi)         ; store new M2
   *   0x12ed260 movsd %xmm1, 0x28(%rdi)         ; store lastValue = x
   */
  addData(value: number): void {
    const x = value;

    // packed [min, max] update — bit-exact to the SIMD blend when x is not NaN.
    // (cmpltpd yields 0 on NaN operands; the blend then keeps the current lane, i.e. NaN in x
    //  leaves min/max unchanged. We mirror that with explicit x<min / max<x comparisons.)
    if (x < this.min) this.min = x;
    if (this.max < x) this.max = x;

    // count is a u64; TS `number` carries exact integers up to 2^53 which is the reachable
    // range of this counter in practice (see NUMERICS note above).
    this.count = this.count + 1;

    const oldMean = this.mean;
    const delta = x - oldMean;

    const countAsDouble = this.count; // matches xmm4 built by the SSE magic constants
    const newMean = oldMean + delta / countAsDouble;
    this.mean = newMean;

    // Welford: M2 += (x - NEW_mean) * (x - OLD_mean)
    this.M2 = this.M2 + (x - newMean) * delta;

    this.lastValue = x;
  }

  /**
   * @Flexo 0x00000000012ed270  FFRunningStatistics::reset()
   *
   * Zeroes the counter and accumulators; primes min to DBL_MAX so the first x < min branch
   * always fires. ASM:
   *   0x12ed274 movq $0x0, (%rdi)                             ; count = 0
   *   0x12ed27b movabsq $0x7fefffffffffffff, %rax             ; DBL_MAX
   *   0x12ed285 movq %rax, 0x8(%rdi)                          ; min = DBL_MAX
   *   0x12ed289 xorps %xmm0, %xmm0
   *   0x12ed28c movups %xmm0, 0x10(%rdi)                      ; max = 0, mean = 0
   *   0x12ed290 movups %xmm0, 0x20(%rdi)                      ; M2  = 0, lastValue = 0
   */
  reset(): void {
    this.count     = 0;         // +0x00
    this.min       = DBL_MAX;   // +0x08
    this.max       = 0;         // +0x10
    this.mean      = 0;         // +0x18
    this.M2        = 0;         // +0x20
    this.lastValue = 0;         // +0x28
  }

  /**
   * @Flexo 0x00000000012ed2a0  FFRunningStatistics::logStats(char const*)
   *
   * Writes a formatted single-line report to stderr. Two branches:
   *
   *   if (count == 0)
   *       fprintf(stderr, "%s - No data\n", tag);
   *   else {
   *       // stddev shown under the "var:" label (this is the FCP binary's literal format
   *       //  string — we transcribe verbatim; it is a mislabeling in Apple's code):
   *       double stddev = (count == 1) ? 0.0 : sqrt(M2 / (double)(count - 1));
   *       fprintf(stderr,
   *               "[%llu] %s - avg:%g, var:%g, min:%g, max:%g, last time:%g\n",
   *               count, tag, mean, stddev, min, max, lastValue);
   *   }
   *
   * ASM structure:
   *   0x12ed2aa movq (%rdi), %rdx                              ; rdx = count
   *   0x12ed2ad *___stderrp                                    ; stderr FILE*
   *   0x12ed2b7 testq %rdx, %rdx ; je 0x12ed31e                ; count == 0 -> "No data" branch
   *   0x12ed2bc movsd 0x18(%rax), %xmm0                        ; xmm0 = mean
   *   0x12ed2c1 xorpd %xmm1, %xmm1                             ; xmm1 = 0.0
   *   0x12ed2c5 cmpq $0x1, %rdx ; je 0x12ed300                 ; count == 1 -> skip sqrt, stddev = 0
   *   0x12ed2cb leaq -0x1(%rdx), %rsi                          ; rsi = count - 1
   *   0x12ed2cf..0x12ed2f1: xmm3 = (double)(count - 1)         ; same u64->double magic constants
   *   0x12ed2f5 divsd %xmm3, %xmm2                             ; xmm2 = M2 / (count-1) = variance
   *   0x12ed2f9 xorps %xmm1, %xmm1
   *   0x12ed2fc sqrtsd %xmm2, %xmm1                            ; xmm1 = sqrt(variance) = stddev
   *   0x12ed300 movsd 0x8(%rax), %xmm2                         ; xmm2 = min
   *   0x12ed305 movsd 0x10(%rax), %xmm3                        ; xmm3 = max
   *   0x12ed30a movsd 0x28(%rax), %xmm4                        ; xmm4 = lastValue
   *   0x12ed30f leaq 0x39fa3c(%rip), %rsi                      ; fmt string (see literal above)
   *   0x12ed316 movb $0x5, %al                                 ; 5 xmm regs used by variadic call
   *   0x12ed319 jmp _fprintf                                   ; tail call
   *
   *   0x12ed31e leaq 0x39fa67(%rip), %rsi                      ; fmt = "%s - No data\n"
   *   0x12ed325 movq %rcx, %rdx                                ; rdx = tag (saved to rcx at 0x12ed2a4)
   *   0x12ed328 xorl %eax, %eax                                ; 0 xmm regs used
   *   0x12ed32b jmp _fprintf                                   ; tail call
   */
  logStats(tag: string): void {
    if (this.count === 0) {
      // matches fprintf(stderr, "%s - No data\n", tag) — tail-jump branch at 0x12ed31e.
      stderrWriter(tag + " - No data\n");
      return;
    }

    // The "var:" slot in the format string is fed by xmm1 = sqrtsd(M2/(count-1)) — i.e. it
    // prints stddev, not variance. We reproduce Apple's literal format string.
    let stddev: number;
    if (this.count === 1) {
      stddev = 0.0; // xorpd xmm1,xmm1 at 0x12ed2c1 flows into fprintf when the je@0x12ed2c9 fires
    } else {
      const variance = this.M2 / (this.count - 1);
      stddev = Math.sqrt(variance);
    }

    // "[%llu] %s - avg:%g, var:%g, min:%g, max:%g, last time:%g\n"
    const line =
      "[" + this.count + "] " + tag +
      " - avg:" + formatG(this.mean) +
      ", var:" + formatG(stddev) +
      ", min:" + formatG(this.min) +
      ", max:" + formatG(this.max) +
      ", last time:" + formatG(this.lastValue) + "\n";
    stderrWriter(line);
  }
}
