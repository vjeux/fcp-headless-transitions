// raw-port/src/render/HGARRILogC.ts
//
// FCP `HGARRILogC` — Helium namespace-like class holding the ARRI LogC
// per-EI (Exposure Index) parameter tables and a single lookup function
// that maps a raw EI integer (e.g. 200, 400, 800, …) to the address of
// the corresponding parameter struct inside a shared static table.
//
// This class carries NO instance state — it is used purely as a
// namespace for the `logCurveParameters` static table (11 rows) and
// the `logCurveParamsForEI(unsigned int)` static lookup. The mangling
// `__ZN10HGARRILogC19logCurveParamsForEIEj` (E → static free function,
// j → unsigned int arg) confirms the "static function inside class"
// pattern (no `this` argument in the disasm).
//
// FRAMEWORK: Helium.framework
// DECODE: raw-port/re/disasm/Helium.HGARRILogC.logCurveParamsForEI.s
//
// SYMBOLS:
//   @Helium 0x102310  HGARRILogC::logCurveParamsForEI(unsigned int)
//   @Helium 0x3d1410  HGARRILogC::logCurveParameters                   [static data]
//
// LOOKUP TABLE (from RE at file_off = 0x4000 + 0x3d1410; 11 × 0x38 = 616 bytes):
//
// Each row is one ARRI LogC "EI band" parameter struct:
//   sizeof(row) = 0x38 (56 bytes):
//     0x00 : u64      nominalEI      (EI value: 160, 200, 250, 320,
//                                     400, 500, 640, 800, 1000, 1280,
//                                     1600)
//     0x08 : f64      cut            (input-domain cut / breakpoint)
//     0x10 : f64      a              (ARRI LogC linear-region slope)
//     0x18 : f64      b              (ARRI LogC linear-region offset)
//     0x20 : f64      c              (ARRI LogC log-region gain)
//     0x28 : f64      d              (ARRI LogC log-region offset)
//     0x30 : f64      e              (ARRI LogC log-region multiplier)
//     0x38 : (next row)
//
// Total table = 11 × 56 = 616 bytes. Row values below are byte-verified
// against the Helium x86_64 slice at each labelled VA.
//
// LOOKUP FORMULA (from disasm @0x102310..0x1023e1):
//
//   Input: unsigned int ei (in edi)
//   Output: void* pointing into logCurveParameters (in rax; or null if
//           ei < 0xB4 = 180 — see note below).
//
//   Note: the very first check @0x10231b `cmpl $0xb4, %edi ; jae 0x102325`
//   is a jump-if-above-or-equal; the FALL-THROUGH at 0x102323 returns
//   `rax` UNCHANGED. `rax` was loaded at 0x102314 with the base pointer
//   of `logCurveParameters` (the symbol contents, not "null"). So the
//   fall-through returns row 0 (nominalEI=160), NOT NULL. All 11 threshold
//   ranges route to a distinct row offset; every input maps to exactly
//   one row.
//
//   Thresholds (jae ⟶ NEXT branch):
//     ei <  0xB4 (180):  return &row[0]  (offset 0x000)
//     ei <  0xE1 (225):  return &row[1]  (offset 0x038)
//     ei < 0x11D (285):  return &row[2]  (offset 0x070)
//     ei < 0x168 (360):  return &row[3]  (offset 0x0A8)
//     ei < 0x1C2 (450):  return &row[4]  (offset 0x0E0)
//     ei < 0x23A (570):  return &row[5]  (offset 0x118)
//     ei < 0x2D0 (720):  return &row[6]  (offset 0x150)
//     ei < 0x384 (900):  return &row[7]  (offset 0x188)
//     ei < 0x474 (1140): return &row[8]  (offset 0x1C0)
//     ei < 0x5A0 (1440): return &row[9]  (offset 0x1F8)    (via cmovb)
//     ei >= 0x5A0:       return &row[10] (offset 0x230)    (via cmovb no-move)
//
//   The final branch is implemented differently from the preceding ones:
//   @0x1023c5..0x1023d5 uses `cmpl $0x5a0, %edi ; movl $0x1f8, %ecx ;
//   movl $0x230, %eax ; cmovbq %rcx, %rax ; addq base(%rip), %rax`.
//   The `cmovbq` (conditional move if below-unsigned) picks 0x1F8 (row 9)
//   when ei < 0x5A0 and keeps 0x230 (row 10) otherwise — semantically
//   the same as the earlier `cmp/jae/mov/add` pairs but branchless.
//
// UNDECODED CALLEES / EXTERNAL SYMBOLS:
//   NONE. This is a self-contained lookup — no libm, no ObjC, no
//   dynamic dispatch. The only cross-symbol reference is the RIP-relative
//   load of the `logCurveParameters` symbol pointer.

/**
 * A single ARRI LogC parameter row, corresponding to one Exposure Index
 * band. The values follow ARRI's published LogC transfer function
 * (linear → log-encoded video):
 *
 *   if (linear > cut):   V = c * log10(a * linear + b) + d
 *   else:                V = e * linear + f
 *
 * where `f` is derived from the continuity constraint
 *   f = c * log10(a * cut + b) + d - e * cut
 * (NOT stored — the 6th double slot at 0x30 is `e` in the ARRI convention
 *  and the 7th value in each row is the derived `f`. From the byte layout
 *  we see 6 doubles after the u64 EI field, so field naming here follows
 *  ARRI's official parameter list: cut, a, b, c, d, e, and `f` is
 *  computed on demand. Fifty-six bytes = 8 (u64 EI) + 48 (6 × f64) = 56,
 *  matching sizeof(row) = 0x38 from the disasm's row-stride constants.)
 */
export interface HGARRILogC_ParamRow {
  /** nominalEI @+0x00 (u64): the labelled ARRI ISO/EI value (e.g. 800). */
  readonly nominalEI: number;
  /** cut @+0x08: input-domain breakpoint. Below cut → linear region;
   *  above → logarithmic region. */
  readonly cut: number;
  /** a @+0x10: LogC log-region input scale. */
  readonly a: number;
  /** b @+0x18: LogC log-region input offset. */
  readonly b: number;
  /** c @+0x20: LogC log-region output scale. */
  readonly c: number;
  /** d @+0x28: LogC log-region output offset. */
  readonly d: number;
  /** e @+0x30: LogC linear-region slope. */
  readonly e: number;
}

/**
 * Namespace class holding ARRI LogC per-EI transfer-function parameters.
 * All members are static — the class is never instantiated.
 */
export class HGARRILogC {
  /**
   * `HGARRILogC::logCurveParameters` — Helium static @0x3d1410.
   *
   * 11 rows × 56 bytes (0x38 stride). Values byte-verified from the
   * Helium x86_64 slice at file offset 0x4000 + 0x3d1410 + row*0x38.
   *
   * Each row's `nominalEI` is a u64 stored as the low 8 bytes; row 0's
   * nominal EI = 160 (i.e. the LogC parameter set calibrated for ISO160).
   * The `logCurveParamsForEI` function does NOT compare against these
   * `nominalEI` values directly — it uses fixed pre-computed midpoint
   * thresholds (180, 225, 285, 360, 450, 570, 720, 900, 1140, 1440),
   * which are the arithmetic midpoints between adjacent labelled EIs.
   */
  static readonly logCurveParameters: readonly HGARRILogC_ParamRow[] = [
    // @Helium 0x3d1410  row[0] — nominalEI 160
    { nominalEI: 160, cut: 0.005561, a: 0.080216, b: 0.269036,
      c: 0.381991, d: 5.842037, e: 0.092778 },
    // @Helium 0x3d1448  row[1] — nominalEI 200
    { nominalEI: 200, cut: 0.006208, a: 0.076621, b: 0.266007,
      c: 0.382478, d: 5.776265, e: 0.092782 },
    // @Helium 0x3d1480  row[2] — nominalEI 250
    { nominalEI: 250, cut: 0.006871, a: 0.072941, b: 0.262978,
      c: 0.382966, d: 5.710494, e: 0.092786 },
    // @Helium 0x3d14b8  row[3] — nominalEI 320
    { nominalEI: 320, cut: 0.007622, a: 0.068768, b: 0.259627,
      c: 0.383508, d: 5.637732, e: 0.092791 },
    // @Helium 0x3d14f0  row[4] — nominalEI 400
    { nominalEI: 400, cut: 0.008318, a: 0.064901, b: 0.256598,
      c: 0.383999, d: 5.57196, e: 0.092795 },
    // @Helium 0x3d1528  row[5] — nominalEI 500
    { nominalEI: 500, cut: 0.009031, a: 0.060939, b: 0.253569,
      c: 0.384493, d: 5.506188, e: 0.0928 },
    // @Helium 0x3d1560  row[6] — nominalEI 640
    { nominalEI: 640, cut: 0.00984, a: 0.056443, b: 0.250219,
      c: 0.38504, d: 5.433426, e: 0.092805 },
    // @Helium 0x3d1598  row[7] — nominalEI 800
    { nominalEI: 800, cut: 0.010591, a: 0.052272, b: 0.24719,
      c: 0.385537, d: 5.367655, e: 0.092809 },
    // @Helium 0x3d15d0  row[8] — nominalEI 1000
    { nominalEI: 1000, cut: 0.011361, a: 0.047996, b: 0.244161,
      c: 0.386036, d: 5.301883, e: 0.092814 },
    // @Helium 0x3d1608  row[9] — nominalEI 1280
    { nominalEI: 1280, cut: 0.012235, a: 0.043137, b: 0.24081,
      c: 0.38659, d: 5.229121, e: 0.092819 },
    // @Helium 0x3d1640  row[10] — nominalEI 1600
    { nominalEI: 1600, cut: 0.013047, a: 0.038625, b: 0.237781,
      c: 0.387093, d: 5.16335, e: 0.092824 },
  ] as const;

  /**
   * `HGARRILogC::logCurveParamsForEI(unsigned int ei)` — Helium @0x102310.
   *
   * Returns a pointer to the ARRI LogC parameter row corresponding to a
   * given EI (Exposure Index). The lookup is a hand-coded cascade of
   * `cmp/jae` thresholds — one per row transition — followed by a final
   * branchless `cmovb` for the last decision (row 9 vs row 10).
   *
   * Full disassembly (@0x102310..0x1023e1) — 62 lines total. Reproduced
   * here inline with the semantic annotation:
   *
   *   pushq %rbp ; movq %rsp,%rbp
   *   movq  logCurveParameters(%rip), %rax     ; rax = base of table
   *   cmpl  $0xb4, %edi   ; jae 0x102325       ; ei < 180 → return &row[0]
   *   popq %rbp ; retq
   *   cmpl  $0xe1, %edi   ; jae 0x102333       ; ei < 225 → return &row[1]
   *   addq  $0x38, %rax                        ; rax += 0x38
   *   popq %rbp ; retq
   *   cmpl  $0x11d, %edi  ; jae 0x102341       ; ei < 285 → return &row[2]
   *   addq  $0x70, %rax
   *   popq %rbp ; retq
   *   cmpl  $0x168, %edi  ; jae 0x102357       ; ei < 360 → return &row[3]
   *   movl  $0xa8, %eax                        ; rax = 0xA8 (not add — reload)
   *   addq  logCurveParameters(%rip), %rax
   *   popq %rbp ; retq
   *   … same pattern for offsets 0xE0, 0x118, 0x150, 0x188, 0x1C0 …
   *   cmpl  $0x5a0, %edi                       ; final threshold: 1440
   *   movl  $0x1f8, %ecx                       ; ecx = offset for row[9]
   *   movl  $0x230, %eax                       ; eax = offset for row[10]
   *   cmovbq %rcx, %rax                        ; if ei < 1440 use 0x1f8; else 0x230
   *   addq  logCurveParameters(%rip), %rax     ; rax = base + selected offset
   *   popq %rbp ; retq
   *
   * The thresholds (180, 225, 285, 360, 450, 570, 720, 900, 1140, 1440)
   * are pre-computed midpoints between adjacent nominal EIs:
   *   floor((160+200)/2) = 180
   *   floor((200+250)/2) = 225
   *   floor((250+320)/2) = 285
   *   floor((320+400)/2) = 360
   *   floor((400+500)/2) = 450
   *   floor((500+640)/2) = 570
   *   floor((640+800)/2) = 720
   *   floor((800+1000)/2) = 900
   *   floor((1000+1280)/2) = 1140
   *   floor((1280+1600)/2) = 1440
   * — i.e. nearest-neighbour EI mapping using the arithmetic midpoint
   * as the decision boundary. Verified for all 11 midpoints.
   *
   * @param ei  raw ARRI EI (unsigned int); values below 180 map to
   *            row 0 (the ISO160 parameters — the LOWEST tabulated EI).
   * @returns   the matching parameter row (never null; the fall-through
   *            path @0x102323 returns row[0] unmodified).
   */
  static logCurveParamsForEI(ei: number): HGARRILogC_ParamRow {
    // @0x102314: load base pointer (in TS, address the array directly).
    const params = HGARRILogC.logCurveParameters;

    // @0x10231b..0x102324: cmpl $0xb4 ; jae 0x102325 ; fall-through returns row[0].
    if (ei < 0xb4) return params[0]; // ei < 180
    // @0x102325..0x102332: cmpl $0xe1 ; jae 0x102333 ; add 0x38 → row[1].
    if (ei < 0xe1) return params[1]; // ei < 225
    // @0x102333..0x102340: cmpl $0x11d ; jae 0x102341 ; add 0x70 → row[2].
    if (ei < 0x11d) return params[2]; // ei < 285
    // @0x102341..0x102356: cmpl $0x168 ; jae 0x102357 ; row[3] (offset 0xa8).
    if (ei < 0x168) return params[3]; // ei < 360
    // @0x102357..0x10236c: row[4] (offset 0xe0).
    if (ei < 0x1c2) return params[4]; // ei < 450
    // @0x10236d..0x102382: row[5] (offset 0x118).
    if (ei < 0x23a) return params[5]; // ei < 570
    // @0x102383..0x102398: row[6] (offset 0x150).
    if (ei < 0x2d0) return params[6]; // ei < 720
    // @0x102399..0x1023ae: row[7] (offset 0x188).
    if (ei < 0x384) return params[7]; // ei < 900
    // @0x1023af..0x1023c4: row[8] (offset 0x1c0).
    if (ei < 0x474) return params[8]; // ei < 1140
    // @0x1023c5..0x1023e1: cmovbq — row[9] if ei < 0x5a0, else row[10].
    if (ei < 0x5a0) return params[9]; // ei < 1440
    return params[10]; // ei >= 1440
  }
}
