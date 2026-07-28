// FFHealthMeterDataSummary.ts — FCP Flexo FFHealthMeterDataSummary:
// Running-count "health meter" statistics: a POD-style aggregator that maintains
// running sum / min / max / weighted-sum / weighted-count, plus THREE frozen
// "first-N-samples" checkpoint sums (first-5, first-15, first-30) that stop
// accumulating once `count` passes the corresponding threshold. Used by Flexo's
// health-meter UI to display Average / Peak / Min / First-15 / Weighted / etc.
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// DECODE:    raw-port/re/disasm/Flexo.FFHealthMeterDataSummary.*.s
//
// STRUCT LAYOUT (recovered field-by-field from every method's asm; sizeof ≥ 0x24):
//   +0x00 : i32    count           — number of samples ever recorded
//   +0x04 : f32    sum             — running SUM of every recorded value (never resets)
//   +0x08 : f32    min             — running MIN of every recorded value
//   +0x0c : f32    max             — running MAX of every recorded value
//   +0x10 : f32    sumFirst5       — sum of the first 5 values; frozen once count > 4
//   +0x14 : f32    sumFirst15      — sum of the first 15 values; frozen once count > 14
//   +0x18 : f32    sumFirst30      — sum of the first 30 values; frozen once count > 29
//   +0x1c : f32    weightedSum     — Σ (xᵢ · wᵢ) for the weighting curve below
//   +0x20 : f32    weightedCount   — Σ wᵢ    (matching denominator)
//   sizeof ≈ 0x24 (36 bytes). The class has no vtable and no ctor emitted in the
//   Flexo binary — it's a POD that callers zero-initialise before use.
//
// EXPORTED SYMBOLS (all in Flexo, x86_64):
//   @Flexo 0x0000000000da1310  getWeightForCount(int) const  →  f32
//   @Flexo 0x0000000000da1350  recordValue(f32)              →  void
//   @Flexo 0x0000000000da1410  getAverage() const            →  f32
//   @Flexo 0x0000000000da1430  getFirst15Average() const     →  f32
//   @Flexo 0x0000000000da1460  getPeakAverage() const        →  f32
//   @Flexo 0x0000000000da1500  getMinAverage() const         →  f32
//   @Flexo 0x0000000000da15a0  getWeighted() const           →  f32
//
// STATIC WEIGHT CONSTANTS (recovered from RIP-relative loads via resolve.py const):
//   @Flexo __const 0x156cd40 : f32 3.0   — weight for count in [0, 4]   (early)
//   @Flexo __const 0x156e940 : f32 2.0   — weight for count in [5, 14]  (mid)
//   @Flexo __const 0x156fd60 : f32 0.5   — weight for count >= 30       (late, table[0])
//   @Flexo __const 0x156fd64 : f32 1.0   — weight for count in [15, 29] (table[1], where n<30)
//   @Flexo __const 0x157012c : f32 15.0  — divisor for getFirst15Average once count > 14
//   @Flexo __const 0x156ca50 : f64 5.0   — divisor for peak/min avg first-5 branch
//   @Flexo __const 0x156f9a0 : f64 15.0  — divisor for peak/min avg first-15 branch
//   @Flexo __const 0x156efd8 : f64 30.0  — divisor for peak/min avg first-30 branch
//
// SEMANTICS SUMMARY:
//   getWeightForCount(n):    step-function weight ∈ {3.0, 2.0, 1.0, 0.5} keyed by n.
//   recordValue(x):          folds x into every field; the "first-N" sums CAP at N samples.
//   getAverage():            plain sum / count (or 0 if count == 0).
//   getFirst15Average():     sum / count while count ≤ 14 (i.e. warming up); once count
//                            > 14, returns the FROZEN sumFirst15 / 15.
//   getPeakAverage():        MAX of {running-avg, sumFirst5/5, sumFirst15/15, sumFirst30/30}
//                            gated by count so branches unlock at n≥5, n≥15, n≥30. The comparison
//                            widens to f64 for the max-selection (see the cvtss2sd pattern below).
//   getMinAverage():         same as getPeakAverage, but MIN instead of MAX. Only the direction
//                            of the ucomisd predicate differs (ja→x>y vs ja→y>x).
//   getWeighted():           weightedSum / weightedCount, or 0 if count ≤ 0.
//
// FRONTIER — NONE. Every branch, load, and constant is decoded directly from the asm.

/**
 * `FFHealthMeterDataSummary` — POD statistics aggregator (Flexo).
 *
 * All state lives in the eight primitive fields below; every method operates ONLY on
 * these + a handful of embedded fp32/fp64 constants. There is no vtable, no allocation,
 * no base class.
 */
export class FFHealthMeterDataSummary {
  /** +0x00 (i32) — sample count. Incremented once per `recordValue` call. */
  count: number;
  /** +0x04 (f32) — running sum of every recorded value. */
  sum: number;
  /** +0x08 (f32) — running minimum (updated when a smaller value arrives). */
  min: number;
  /** +0x0c (f32) — running maximum (updated when a larger value arrives). */
  max: number;
  /** +0x10 (f32) — sum of the first 5 recorded values; FROZEN once count > 4. */
  sumFirst5: number;
  /** +0x14 (f32) — sum of the first 15 recorded values; FROZEN once count > 14. */
  sumFirst15: number;
  /** +0x18 (f32) — sum of the first 30 recorded values; FROZEN once count > 29. */
  sumFirst30: number;
  /** +0x1c (f32) — Σ (xᵢ · wᵢ) using getWeightForCount(count-at-record) as wᵢ. */
  weightedSum: number;
  /** +0x20 (f32) — Σ wᵢ (matching denominator for `weightedSum`). */
  weightedCount: number;

  /**
   * Default-constructs the aggregator with all fields at zero — matching the
   * bzero'd allocation pattern used by every observed FFHealthMeterDataSummary
   * caller in Flexo. No standalone ctor symbol is exported by the framework
   * (the class is a POD; callers zero-init before use).
   */
  constructor() {
    this.count = 0;
    this.sum = Math.fround(0);
    this.min = Math.fround(0);
    this.max = Math.fround(0);
    this.sumFirst5 = Math.fround(0);
    this.sumFirst15 = Math.fround(0);
    this.sumFirst30 = Math.fround(0);
    this.weightedSum = Math.fround(0);
    this.weightedCount = Math.fround(0);
  }

  /**
   * `FFHealthMeterDataSummary::getWeightForCount(int n) const  →  float`
   * @Flexo 0x0000000000da1310  (__ZN24FFHealthMeterDataSummary17getWeightForCountEi)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFHealthMeterDataSummary.getWeightForCount.s):
   *   0xda1314  cmpl $0x5, %esi          → n cmp 5
   *   0xda1317  jge  0xda1323            → if n >= 5 → jump onward; else fall through
   *   0xda1319  movss @0x156cd40, %xmm0  → xmm0 = 3.0f  (n < 5: "early" weight)
   *   0xda1322  retq
   *   0xda1323  cmpl $0xf, %esi          → n cmp 15
   *   0xda1326  jae  0xda1332            → if n >= 15 (unsigned "ae") → jump onward
   *   0xda1328  movss @0x156e940, %xmm0  → xmm0 = 2.0f  (5 ≤ n < 15: "mid" weight)
   *   0xda1331  retq
   *   0xda1332  xorl %eax, %eax
   *   0xda1334  cmpl $0x1e, %esi         → n cmp 30
   *   0xda1337  setb %al                 → al = 1 iff n < 30 (unsigned "b")
   *   0xda133a  leaq @0x156fd60, %rcx    → &weightTable[0]
   *   0xda1341  movss (%rcx,%rax,4), %xmm0
   *                                        table[0] = 0.5f (@0x156fd60, n >= 30)
   *                                        table[1] = 1.0f (@0x156fd64, 15 ≤ n < 30)
   *   0xda1347  retq
   *
   * Truth table (from the flag-precise structure above):
   *     n <  5       → 3.0f
   *     5 ≤ n <  15  → 2.0f
   *    15 ≤ n <  30  → 1.0f
   *          n ≥ 30  → 0.5f
   *
   * `jae` (unsigned ≥) at @0xda1326 doubles as signed ≥ for the non-negative counts
   * this class actually receives (count is monotonically non-negative). Same for the
   * `setb` at @0xda1337.
   */
  getWeightForCount(n: number): number {
    // @0xda1314..0xda1317
    if (n < 5) return Math.fround(3.0);                        // @0xda1319: 3.0f
    // @0xda1323..0xda1326
    if (n < 15) return Math.fround(2.0);                       // @0xda1328: 2.0f
    // @0xda1334..0xda1337: setb %al  → al = (n < 30 ? 1 : 0)
    // @0xda1341: xmm0 = table[al]  where table = [0.5f, 1.0f]
    return n < 30 ? Math.fround(1.0) : Math.fround(0.5);
  }

  /**
   * `FFHealthMeterDataSummary::recordValue(float x)  →  void`
   * @Flexo 0x0000000000da1350  (__ZN24FFHealthMeterDataSummary11recordValueEf)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFHealthMeterDataSummary.recordValue.s):
   *
   *   ── Update the always-running SUM ──
   *   0xda1354  movss 0x4(%rdi), %xmm1     → xmm1 = sum
   *   0xda1359  addss %xmm0, %xmm1         → xmm1 = sum + x
   *   0xda135d  movss %xmm1, 0x4(%rdi)     → sum = sum + x
   *
   *   ── Fold x into the appropriate FIRST-N sums (each frozen at its cap) ──
   *   0xda1362  movl (%rdi), %eax          → eax = count
   *   0xda1364  cmpl $0x1d, %eax           → count cmp 29
   *   0xda1367  jg   0xda1390              → if count > 29 → skip all first-N updates
   *   0xda1369  movss %xmm1, 0x18(%rdi)    → sumFirst30 = new-sum   (count ≤ 29)
   *   0xda136e  cmpl $0xe,  %eax           → count cmp 14
   *   0xda1371  jg   0xda1390              → if count > 14 → skip 15/5 updates
   *   0xda1373  movss %xmm1, 0x14(%rdi)    → sumFirst15 = new-sum   (count ≤ 14)
   *   0xda1378  cmpl $0x4,  %eax           → count cmp 4
   *   0xda137b  jg   0xda1401              → if count > 4 → jump to n≤14 weight path
   *   0xda1381  movss %xmm1, 0x10(%rdi)    → sumFirst5 = new-sum    (count ≤ 4)
   *   0xda1386  movss @0x156cd40, %xmm1    → xmm1 = 3.0f            (n ≤ 4 weight)
   *   0xda138e  jmp  0xda13a4              → common weight-fold tail
   *
   *   0xda1401  movss @0x156e940, %xmm1    → xmm1 = 2.0f            (5 ≤ count ≤ 14 weight)
   *   0xda1409  jmp  0xda13a4              → common weight-fold tail
   *
   *   0xda1390  xorl %ecx, %ecx
   *   0xda1392  cmpl $0x1e, %eax           → count cmp 30
   *   0xda1395  setb %cl                   → cl = (count < 30 ? 1 : 0)
   *   0xda1398  leaq @0x156fd60, %rdx      → &weightTable[0]
   *   0xda139f  movss (%rdx,%rcx,4), %xmm1 → xmm1 = table[cl]
   *                                          table[0]=0.5f (count≥30), table[1]=1.0f (15≤count<30)
   *
   *   ── Common tail: fold (x, weight) into (weightedSum, weightedCount) ──
   *   0xda13a4  movaps  %xmm0, %xmm2       → xmm2 = [x, ?, ?, ?]
   *   0xda13a7  mulss   %xmm1, %xmm2       → xmm2[0] = x * w
   *   0xda13ab  movsd   0x1c(%rdi), %xmm3  → xmm3 = [weightedSum, weightedCount, 0, 0] (2×f32)
   *   0xda13b0  insertps $0x10, %xmm1, %xmm2
   *                                        → xmm2 = [x*w, w, xmm2[2], xmm2[3]]
   *                                          (imm 0x10 → src_index=0, dst_index=1, zmask=0)
   *   0xda13b6  addps   %xmm3, %xmm2       → xmm2 = [ws + x*w, wc + w, ...]
   *   0xda13b9  movlps  %xmm2, 0x1c(%rdi)  → store low 8B: weightedSum, weightedCount
   *
   *   ── Update min / max ──
   *   0xda13bd  testl %eax, %eax           → if count == 0 → init both min and max to x
   *   0xda13bf  je    0xda13d7
   *   0xda13c1  ucomiss 0xc(%rdi), %xmm0   → flags: x vs max  (dst=xmm0, src=max)
   *                                          CF = (x < max), ZF = (x == max)
   *   0xda13c5  ja   0xda13e7              → if x > max → update max branch
   *   0xda13c7  movss 0x8(%rdi), %xmm1     → xmm1 = min
   *   0xda13cc  ucomiss %xmm0, %xmm1       → flags: min vs x  (dst=min, src=x)
   *                                          CF = (min < x), ZF = (min == x)
   *   0xda13cf  ja   0xda13f6              → if min > x → update min branch
   *   0xda13d1  incl %eax                  → count++
   *   0xda13d3  movl %eax, (%rdi)
   *   0xda13d5  retq
   *
   *   0xda13d7  movss %xmm0, 0x8(%rdi)     → min = x   (count == 0 init)
   *   0xda13dc  movss %xmm0, 0xc(%rdi)     → max = x   (count == 0 init)
   *   0xda13e1  incl %eax; movl → count++; retq
   *
   *   0xda13e7  movss %xmm0, 0xc(%rdi)     → max = x
   *   0xda13ec  movss 0x8(%rdi), %xmm1     → xmm1 = min
   *   0xda13f1  ucomiss %xmm0, %xmm1       → CF = (min < x), ZF = (min == x)
   *   0xda13f4  jbe  0xda13d1              → if min ≤ x → just increment (no min update)
   *   0xda13f6  movss %xmm0, 0x8(%rdi)     → min = x   (x is new min despite new max)
   *   0xda13fb  incl %eax; movl → count++; retq
   *
   * NB: the "count > 29" path @0xda1390 skips ALL three first-N sum updates but still
   * folds (x, weight) into weightedSum/weightedCount — the weight is drawn from the
   * post-30 table half [0.5f]. So `count >= 30` always contributes a 0.5f-weighted term.
   *
   * NaN handling: `ucomisd`/`ucomiss` treat NaN as UNORDERED (CF=ZF=PF=1). The `ja`
   * branches (fire on CF=0 ∧ ZF=0) do NOT fire on NaN, so the fall-through paths take
   * over — which produces the "no update" outcome for min/max on NaN inputs. In JS,
   * `NaN < x`, `NaN > x`, `x < NaN`, `x > NaN` are ALL false, so a straight `if (x >
   * this.max)` matches: NaN input → no max update, no min update, count++ only.
   */
  recordValue(x: number): void {
    // @0xda1354..0xda135d: sum = sum + x  (single-precision add)
    const newSum = Math.fround(this.sum + x);
    this.sum = newSum;

    // @0xda1362: eax = count  (captured PRE-increment; the value used for all cmps below)
    const c = this.count;

    // @0xda1364..0xda1381: cascade of first-N sum updates + weight-select.
    // NOTE the disasm updates the first-N sums with the NEW running sum (xmm1 =
    // sum + x), not with x directly. So sumFirst5/15/30 track the CUMULATIVE sum of
    // the first 5/15/30 recorded values — matching the "avg over first-N" downstream use.
    let w: number;
    if (c > 29) {
      // @0xda1390..0xda139f: skip all first-N updates; weight = table[c<30 ? 1 : 0].
      // Since we're in the `c > 29` branch, c<30 is false → table[0] = 0.5f.
      // (Kept as a lookup so the shape matches recordValue AND getWeightForCount.)
      w = c < 30 ? Math.fround(1.0) : Math.fround(0.5);
    } else {
      // @0xda1369: sumFirst30 = newSum   (always in this branch, since c ≤ 29)
      this.sumFirst30 = newSum;
      if (c > 14) {
        // fall past sumFirst15 update, past sumFirst5 update, then take the n≤14 exit
        // Wait: @0xda1371 `jg 0xda1390` jumps to the c>29 path? Look again:
        //   @0xda136e cmpl $0xe, %eax  ; @0xda1371 jg 0xda1390
        // Yes: if count > 14 → jump to @0xda1390 (the post-30 weight-table path). So
        // in the "15 ≤ count ≤ 29" range we ALSO skip the sumFirst15 update and use
        // the weightTable-based selection. The weight ends up 1.0 (c<30 branch).
        w = c < 30 ? Math.fround(1.0) : Math.fround(0.5);
      } else {
        // @0xda1373: sumFirst15 = newSum   (c ≤ 14)
        this.sumFirst15 = newSum;
        if (c > 4) {
          // @0xda137b jg 0xda1401: 5 ≤ count ≤ 14 → w = 2.0f
          w = Math.fround(2.0);
        } else {
          // @0xda1381: sumFirst5 = newSum   (c ≤ 4)
          this.sumFirst5 = newSum;
          // @0xda1386: w = 3.0f
          w = Math.fround(3.0);
        }
      }
    }

    // @0xda13a4..0xda13b9: fold (x*w, w) into (weightedSum, weightedCount) via the
    // packed insertps trick. In scalar TS this is just two f32 accumulators.
    this.weightedSum = Math.fround(this.weightedSum + Math.fround(x * w));
    this.weightedCount = Math.fround(this.weightedCount + w);

    // @0xda13bd..0xda13ff: min/max update.
    if (c === 0) {
      // @0xda13d7..0xda13dc: init both to x
      this.min = Math.fround(x);
      this.max = Math.fround(x);
    } else {
      // @0xda13c1..0xda13c5: if x > max → update max, then check if x < min too
      if (x > this.max) {
        // @0xda13e7..0xda13f6: max = x; if min > x → min = x too (should not happen
        // for a well-formed sequence, but the disasm checks — model faithfully).
        this.max = Math.fround(x);
        if (this.min > x) {
          this.min = Math.fround(x);
        }
      } else if (this.min > x) {
        // @0xda13cc..0xda13cf: if min > x → update min only
        this.min = Math.fround(x);
      }
      // else: no min/max update (fall-through).
    }
    // @0xda13d1/13e1/13fb/13d3: count++
    this.count = c + 1;
  }

  /**
   * `FFHealthMeterDataSummary::getAverage() const  →  float`
   * @Flexo 0x0000000000da1410  (__ZN24FFHealthMeterDataSummary10getAverageEv)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFHealthMeterDataSummary.getAverage.s):
   *   0xda1414  movl  (%rdi), %eax        → eax = count
   *   0xda1416  testl %eax, %eax
   *   0xda1418  jle   0xda1429            → if count ≤ 0 → return 0.0f
   *   0xda141a  movss 0x4(%rdi), %xmm0    → xmm0 = sum
   *   0xda141f  cvtsi2ss %eax, %xmm1      → xmm1 = (float)count
   *   0xda1423  divss %xmm1, %xmm0        → xmm0 = sum / count
   *   0xda1427  retq
   *   0xda1429  xorps %xmm0, %xmm0        → xmm0 = 0.0f
   *   0xda142d  retq
   *
   * `jle` (signed <=) covers both count == 0 and any theoretical negative count.
   * Since `count` is monotonically non-negative in practice, this is `count == 0`.
   */
  getAverage(): number {
    // @0xda1418: jle → count ≤ 0 → 0
    if (this.count <= 0) return Math.fround(0);
    // @0xda141a..0xda1423: sum / (float)count in fp32
    return Math.fround(this.sum / Math.fround(this.count));
  }

  /**
   * `FFHealthMeterDataSummary::getFirst15Average() const  →  float`
   * @Flexo 0x0000000000da1430  (__ZN24FFHealthMeterDataSummary17getFirst15AverageEv)
   *
   * DECODE:
   *   0xda1430  movl  (%rdi), %eax        → eax = count
   *   0xda1432  cmpl  $0xe,  %eax         → count cmp 14
   *   0xda1435  jg    0xda1449            → if count > 14 → frozen path
   *   0xda1437  testl %eax, %eax
   *   0xda1439  jle   0xda145c            → elif count ≤ 0 → return 0
   *   0xda143b  movss 0x4(%rdi), %xmm0    → xmm0 = sum      (warming up)
   *   0xda1440  cvtsi2ss %eax, %xmm1
   *   0xda1444  divss %xmm1, %xmm0        → sum / count
   *   0xda1448  retq
   *   0xda1449  movss 0x14(%rdi), %xmm0   → xmm0 = sumFirst15
   *   0xda1452  divss @0x157012c, %xmm0   → / 15.0f
   *   0xda145b  retq
   *   0xda145c  xorps %xmm0, %xmm0        → return 0
   *   0xda145f  retq
   *
   * Meaning: while the aggregator is still collecting its first 15 samples, return the
   * "average so far" (sum / current count). Once the 15th sample lands (count > 14),
   * return the FROZEN sum of those first 15 samples divided by exactly 15.0f.
   */
  getFirst15Average(): number {
    // @0xda1432..0xda1435: count > 14 → use frozen sumFirst15 / 15
    if (this.count > 14) {
      return Math.fround(this.sumFirst15 / Math.fround(15.0));
    }
    // @0xda1439: count ≤ 0 → 0
    if (this.count <= 0) return Math.fround(0);
    // @0xda143b..0xda1444: sum / (float)count while count ∈ [1, 14]
    return Math.fround(this.sum / Math.fround(this.count));
  }

  /**
   * `FFHealthMeterDataSummary::getPeakAverage() const  →  float`
   * @Flexo 0x0000000000da1460  (__ZN24FFHealthMeterDataSummary14getPeakAverageEv)
   *
   * DECODE (annotated):
   *   0xda1460  movl (%rdi), %eax                  → eax = count
   *   0xda1462  testl %eax, %eax
   *   0xda1464  jle 0xda14f8                       → if count ≤ 0 → xmm0=0, ret
   *   0xda146a  cvtsi2ss %eax, %xmm1
   *   0xda146e  movss 0x4(%rdi), %xmm0             → xmm0 = sum
   *   0xda1473  divss %xmm1, %xmm0                 → xmm0 = sum / count  (current running avg)
   *   0xda1477  cmpl $0x5, %eax
   *   0xda147a  jb   0xda14fb                      → if count < 5 → return running avg
   *
   *   ; --- first-5 branch: unlocked when count ≥ 5 ---
   *   0xda1480  cvtss2sd %xmm0, %xmm2              → xmm2 = (double)running_avg
   *   0xda1484  movss 0x10(%rdi), %xmm1            → xmm1 = sumFirst5   (f32)
   *   0xda1489  cvtss2sd %xmm1, %xmm1
   *   0xda148d  divsd  @0x156ca50, %xmm1           → xmm1 = sumFirst5 / 5.0d   (f64)
   *   0xda1495  ucomisd %xmm1, %xmm2               → flags: running_avg vs first5avg
   *                                                    CF=(running < first5), ZF=(==)
   *   0xda1499  ja  0xda14a2                       → if running > first5 → keep xmm0=running
   *   0xda149b  xorps %xmm0, %xmm0
   *   0xda149e  cvtsd2ss %xmm1, %xmm0              → else xmm0 = (f32)first5avg
   *
   *   ; --- first-15 branch: unlocked when count ≥ 15 ---
   *   0xda14a2  cmpl $0xf, %eax
   *   0xda14a5  jb   0xda14f6                      → count < 15 → skip
   *   0xda14aa  cvtss2sd %xmm0, %xmm2              → widen current-max to f64
   *   0xda14ae  movss 0x14(%rdi), %xmm1            → xmm1 = sumFirst15
   *   0xda14b3  cvtss2sd %xmm1, %xmm1
   *   0xda14b7  divsd @0x156f9a0, %xmm1            → xmm1 = sumFirst15 / 15.0d
   *   0xda14bf  ucomisd %xmm1, %xmm2
   *   0xda14c3  ja  0xda14cc                       → if current-max > first15 → keep
   *   0xda14c5  xorps %xmm0, %xmm0
   *   0xda14c8  cvtsd2ss %xmm1, %xmm0              → else xmm0 = (f32)first15avg
   *
   *   ; --- first-30 branch: unlocked when count ≥ 30 ---
   *   0xda14cc  cmpl $0x1e, %eax
   *   0xda14cf  jb   0xda14f6                      → count < 30 → skip
   *   0xda14d4  cvtss2sd %xmm0, %xmm2
   *   0xda14d8  movss 0x18(%rdi), %xmm1
   *   0xda14dd  cvtss2sd %xmm1, %xmm1
   *   0xda14e1  divsd @0x156efd8, %xmm1            → / 30.0d
   *   0xda14e9  ucomisd %xmm1, %xmm2
   *   0xda14ed  ja  0xda14f6                       → keep current-max
   *   0xda14ef  xorps %xmm0, %xmm0
   *   0xda14f2  cvtsd2ss %xmm1, %xmm0              → else xmm0 = (f32)first30avg
   *   0xda14f6  popq %rbp; retq
   *
   * Semantics: returns the MAXIMUM of {running-avg, first5avg, first15avg, first30avg},
   * gated by count so a first-N average only competes once N samples have landed.
   *
   * Precision note: each comparison and assignment widens to fp64 for the compare and
   * the final cvtsd2ss narrows back — mirror that exactly so NaN/±0/rounding at the
   * fp32 boundary matches. `ucomisd` unordered (NaN) sets CF=1, so `ja` (CF=0∧ZF=0)
   * does NOT fire — the fall-through cvtsd2ss then narrows the NaN to a signaling
   * fp32 NaN. JS mirrors this: `NaN > any` is false, so the else-branch fires.
   */
  getPeakAverage(): number {
    // @0xda1464: count ≤ 0 → 0
    if (this.count <= 0) return Math.fround(0);
    // @0xda146a..0xda1473: running avg = sum / count in fp32
    let best = Math.fround(this.sum / Math.fround(this.count));
    // @0xda147a: count < 5 → return running avg
    if (this.count < 5) return best;

    // @0xda1480..0xda149e: first-5 branch (fp64 comparison, fp32 store).
    {
      const currentD = best;                 // cvtss2sd is exact for finite fp32
      const first5D = this.sumFirst5 / 5.0;  // fp64 divsd
      if (!(currentD > first5D)) {
        best = Math.fround(first5D);         // cvtsd2ss
      }
    }
    // @0xda14a5: count < 15 → return
    if (this.count < 15) return best;

    // @0xda14aa..0xda14c8: first-15 branch.
    {
      const currentD = best;
      const first15D = this.sumFirst15 / 15.0;
      if (!(currentD > first15D)) {
        best = Math.fround(first15D);
      }
    }
    // @0xda14cf: count < 30 → return
    if (this.count < 30) return best;

    // @0xda14d4..0xda14f2: first-30 branch.
    {
      const currentD = best;
      const first30D = this.sumFirst30 / 30.0;
      if (!(currentD > first30D)) {
        best = Math.fround(first30D);
      }
    }
    return best;
  }

  /**
   * `FFHealthMeterDataSummary::getMinAverage() const  →  float`
   * @Flexo 0x0000000000da1500  (__ZN24FFHealthMeterDataSummary13getMinAverageEv)
   *
   * DECODE — identical to `getPeakAverage` EXCEPT every `ucomisd %xmm1, %xmm2 ; ja`
   * is swapped to `ucomisd %xmm2, %xmm1 ; ja` (i.e. the two comparison operands are
   * exchanged). The effect is that each branch keeps the SMALLER of the two candidates
   * rather than the larger — flipping "max" to "min" while reusing the same skeleton.
   *
   *   0xda1535  ucomisd %xmm2, %xmm1     → flags: first5avg vs running
   *                                          CF=(first5<running), ZF=(==)
   *   0xda1539  ja  0xda1542             → if first5 > running → keep running
   *   0xda153b  xorps %xmm0, %xmm0
   *   0xda153e  cvtsd2ss %xmm1, %xmm0    → else xmm0 = (f32)first5avg  (i.e. smaller wins)
   * (Analogous swaps at @0xda155f/0xda1589 for first-15 / first-30.)
   */
  getMinAverage(): number {
    // @0xda1504: count ≤ 0 → 0
    if (this.count <= 0) return Math.fround(0);
    // @0xda150a..0xda1513: running avg = sum / count in fp32
    let best = Math.fround(this.sum / Math.fround(this.count));
    // @0xda151a: count < 5 → return
    if (this.count < 5) return best;

    // @0xda1520..0xda153e: first-5 branch — MIN.
    // ucomisd operands swapped ⇒ `ja` fires when first5 > running (skip update).
    // So we keep the smaller of (running, first5).
    {
      const currentD = best;
      const first5D = this.sumFirst5 / 5.0;
      if (!(first5D > currentD)) {
        best = Math.fround(first5D);
      }
    }
    if (this.count < 15) return best;

    // @0xda1547..0xda1568: first-15 branch — MIN.
    {
      const currentD = best;
      const first15D = this.sumFirst15 / 15.0;
      if (!(first15D > currentD)) {
        best = Math.fround(first15D);
      }
    }
    if (this.count < 30) return best;

    // @0xda1571..0xda1592: first-30 branch — MIN.
    {
      const currentD = best;
      const first30D = this.sumFirst30 / 30.0;
      if (!(first30D > currentD)) {
        best = Math.fround(first30D);
      }
    }
    return best;
  }

  /**
   * `FFHealthMeterDataSummary::getWeighted() const  →  float`
   * @Flexo 0x0000000000da15a0  (__ZN24FFHealthMeterDataSummary11getWeightedEv)
   *
   * DECODE (raw-port/re/disasm/Flexo.FFHealthMeterDataSummary.getWeighted.s):
   *   0xda15a4  cmpl  $0x0, (%rdi)         → count cmp 0
   *   0xda15a7  jle   0xda15b5              → if count ≤ 0 → return 0
   *   0xda15a9  movss 0x1c(%rdi), %xmm0    → xmm0 = weightedSum
   *   0xda15ae  divss 0x20(%rdi), %xmm0    → xmm0 = weightedSum / weightedCount
   *   0xda15b4  retq
   *   0xda15b5  xorps %xmm0, %xmm0         → return 0
   *   0xda15b9  retq
   *
   * Note: fp32 divss. If weightedCount is 0.0f, this produces Inf/NaN faithfully.
   */
  getWeighted(): number {
    // @0xda15a7: count ≤ 0 → 0
    if (this.count <= 0) return Math.fround(0);
    // @0xda15a9..0xda15ae: fp32 divss
    return Math.fround(this.weightedSum / this.weightedCount);
  }
}
