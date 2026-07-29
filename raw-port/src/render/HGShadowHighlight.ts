// HGShadowHighlight — Helium shadow/highlight render-graph node. Framework: Helium.
//
// This is the "slow" (higher-quality) variant sibling to HGShadowHighlightFast.
// It carries its OWN two 2D lookup tables (10 widths × 11 amounts × 5 floats) that drive the
// preset selection: GetSettings(width, amount, out) bilinear-interpolates a 5-float preset,
// and UpdateParams calls it twice (once for shadow, once for highlight) and builds an HGRenderer
// graph (plumbing, throw-stubbed here per PORTING_SPEC Rule 3).
//
// Decoded symbols (Helium x86_64 thin slice, VA==file offset):
//   __ZN17HGShadowHighlightC1Ev                          @0x5c6d0  ctor (tail-jmp to C2)
//   __ZN17HGShadowHighlight20SetInputShadowAmountEf      @0x5c820  store f32 -> this+0x220
//   __ZN17HGShadowHighlight24SetInputShadowTonalWidthEf  @0x5c850  store f32 -> this+0x224
//   __ZN17HGShadowHighlight14SetInputRadiusEf            @0x5c880  store f32 -> this+0x228
//   __ZN17HGShadowHighlight23SetInputHighlightAmountEf   @0x5c8b0  store f32 -> this+0x22c
//   __ZN17HGShadowHighlight27SetInputHighlightTonalWidthEf @0x5c8e0 store f32 -> this+0x230
//   __ZN17HGShadowHighlight23SetInputColorCorrectionEf   @0x5c910  store f32 -> this+0x234
//   __ZN17HGShadowHighlight23SetInputMidtoneContrastEf   @0x5c940  store f32 -> this+0x238
//   __ZN17HGShadowHighlight16CIToHGBlurRadiusEf          @0x5c970  x * 3.0f  (const @0x3ca2f0)
//   __ZN17HGShadowHighlight12UpdateParamsEv              @0x5c980  builds HGRenderer scene graph
//   __ZN17HGShadowHighlight11GetSettingsEffP26HGShadowHighlight_Settings @0x5d270
//                                                                 2D LUT bilinear interp
//   __ZN17HGShadowHighlight9GetOutputEP10HGRenderer      @0x5d5e0  facade -> HGRenderer path
//
// Static-data provenance (VA==file offset in /tmp/Helium.x86_64):
//   @0x3cc1d0  s_WidthsTable   int32[10] = {0,10,20,...,90}
//   @0x3cc200  s_AmountsTable  int32[10] = {0,10,20,...,90}
//   @0x3cc230  s_SettingsTable float32[10][11][5] (10 widths, 11 amounts, 5-tuple, 20B/cell, 220B/row)
//   @0x3ca2f0  f32 = 3.0f    — CIToHGBlurRadius multiplier
//   @0x3ca294  f32 = 100.0f  — bracket-search upper sentinel (out-of-range printf trigger)
//   @0x3cc1a4..3cc1bc  f32 sentinels 10..90 for bracket search (inlined by compiler)
//
// FAITHFUL PORT — every function cites @Helium 0xADDR. Every constant cites its byte address.
// Undecoded callees (HGRenderer graph construction in UpdateParams / GetOutput) throw citing
// their FCP address (PORTING_SPEC Rule 3). Single-precision ops wrapped in Math.fround (Rule 4).

// ── Struct layout (recovered from setter disasm) ────────────────────────────────────────────
//   +0x220  f32  inShadowAmount           SetInputShadowAmount        @0x5c838
//   +0x224  f32  inShadowTonalWidth       SetInputShadowTonalWidth    @0x5c868
//   +0x228  f32  inRadius                 SetInputRadius              @0x5c898
//   +0x22c  f32  inHighlightAmount        SetInputHighlightAmount     @0x5c8c8
//   +0x230  f32  inHighlightTonalWidth    SetInputHighlightTonalWidth @0x5c8f8
//   +0x234  f32  inColorCorrection        SetInputColorCorrection     @0x5c928
//   +0x238  f32  inMidtoneContrast        SetInputMidtoneContrast     @0x5c958
//   Each setter first calls HGNode::ClearBits() (cache invalidation) — modeled here as a
//   bumped `_dirty` counter since HGNode is a base facade we do not port.

/** @const 0x3ca2f0  f32 = 3.0f — mulss immediate in CIToHGBlurRadius @0x5c974. */
const KF_CI_TO_HG_BLUR = 3.0;

/**
 * Bracket-search sentinels read inline by GetSettings @0x5d270 (10, 20, ..., 90) plus a
 * final 100.0 upper bound. These match s_WidthsTable/s_AmountsTable entries 1..10 exactly.
 *   @const 0x3cc1a4 = 10.0f   @const 0x3cc144 = 20.0f   @const 0x3cc1a8 = 30.0f
 *   @const 0x3cc140 = 40.0f   @const 0x3cc1ac = 50.0f   @const 0x3cc1b0 = 60.0f
 *   @const 0x3cc1b4 = 70.0f   @const 0x3cc1b8 = 80.0f   @const 0x3cc1bc = 90.0f
 *   @const 0x3ca294 = 100.0f (out-of-range sentinel, jb -> printf branch @0x5d5ae / @0x5d5c1)
 */
const KF_BRACKETS: readonly number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

/** @const 0x3cc1d0  int32[10] s_WidthsTable  — bracket LOWER bounds (also lookup axis). */
const S_WIDTHS_TABLE: readonly number[] = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
/** @const 0x3cc200  int32[10] s_AmountsTable — bracket LOWER bounds (also lookup axis). */
const S_AMOUNTS_TABLE: readonly number[] = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

/**
 * @const 0x3cc230  s_SettingsTable — presets that drive shadow/highlight rendering.
 *
 * Layout recovered from GetSettings @0x5d270:
 *   row stride 0xdc bytes (220) — 10 rows indexed by width-slot (0..9).
 *   cell stride 0x14 bytes (20) — 11 cells per row indexed by amount-slot (0..10). The 11th
 *   cell is the amount=100 endpoint used ONLY by the bracket at the top end.
 *   Each cell is float32[5]: the low 4 floats form a vec4 (movups reads +0x00..+0x0f), the 5th
 *   is a scalar (movss reads +0x10). The 5 fields are opaque preset weights the UpdateParams
 *   graph consumes; we do not name them further because their meanings only crystallize inside
 *   the un-ported HGRenderer wiring.
 */
const S_SETTINGS_TABLE: readonly (readonly (readonly [number, number, number, number, number])[])[] = [
  /* widthIdx=0 */ [
    [8.30083561, 16.1615601, 0.0463580005, 0.298013002, 0],
    [11, 16.1615601, 0.0463580005, 0.298013002, 0],
    [9.84679699, 16.6880226, 0.0463580005, 0.298013002, 0],
    [8.89972115, 16.5376053, 0.0463580005, 0.298013002, 0],
    [8.52367687, 16.7632313, 0.0463580005, 0.298013002, 0],
    [8.20334244, 17.1392746, 0.0463580005, 0.298013002, 0],
    [8.6217947, 17.0640678, 0.0463580005, 0.298013002, 0],
    [9.26282024, 16.2367687, 0, 0.298013002, 0],
    [9.31089687, 16.4623966, 0, 0.298013002, 0],
    [8.95833302, 16.1615601, 0, 0.298013002, 0],
    [9.0064106, 16.5, 0, 0.298013002, 0],
  ],
  /* widthIdx=1 */ [
    [8.45403862, 11.7242346, 0.0331129991, 0.423841, 0],
    [10, 11.7242346, 0.0331129991, 0.423841, 0],
    [8.64902496, 12.1754885, 0.0331129991, 0.423841, 0],
    [8.16156006, 12.4011145, 0.0331129991, 0.423841, 0],
    [7.70195007, 12.4011145, 0.0331129991, 0.423841, 0],
    [7.33983278, 12.3259058, 0.0264899991, 0.423841, 0],
    [7.6044569, 12.2506962, 0.00662299991, 0.423841, 0],
    [7.95264578, 12.5515318, 0, 0.423841, 0],
    [7.85515308, 12.4011145, 0, 0.423841, 0],
    [7.98076916, 12.4763231, 0, 0.450331002, 0.899999976],
    [8.16156006, 13.0779953, 0, 0.463575989, 0.600000024],
  ],
  /* widthIdx=2 */ [
    [8.48189354, 9.01671314, 0.0264899991, 0.503310978, -0.741721988],
    [9.35933113, 9.01671314, 0.0264899991, 0.503310978, -0.741721988],
    [8.32869053, 9.31754875, 0.0264899991, 0.503310978, -0.741721988],
    [7.70195007, 9.39275742, 0.0264899991, 0.503310978, -0.741721988],
    [7.17270184, 9.24234009, 0.0264899991, 0.503310978, -0.741721988],
    [6.83843994, 9.46796608, 0.0264899991, 0.503310978, -0.741721988],
    [7.3955431, 10.2200556, 0.0264899991, 0.503310978, -0.741721988],
    [7.72980499, 10.7465181, 0.0463580005, 0.503310978, -0.741721988],
    [7.66016722, 10.4456825, 0, 0.503310978, -0.741721988],
    [7.67409515, 10.5208912, 0, 0.503310978, -0.529801011],
    [7.71587801, 10.8217268, 0.0132449996, 0.503310978, -0.529801011],
  ],
  /* widthIdx=3 */ [
    [8.34261799, 6.91086292, 0.0794700012, 1, 2],
    [9.16434479, 6.91086292, 0.0794700012, 1, 2],
    [8.18941498, 7.6629529, 0.0794700012, 1, 2],
    [7.56267405, 7.73816204, 0.0794700012, 1, 2],
    [7.22841215, 7.96378899, 0.0794700012, 1, 2],
    [7.00557089, 8.18941498, 0.0794700012, 1, 2],
    [7.18662882, 8.26462364, 0.0198679995, 1, 2],
    [7.47910881, 8.7910862, 0.0397350006, 1, 2],
    [7.70195007, 9.24234009, 0.0529799983, 1, 2],
    [7.66016722, 9.31754875, 0.0463580005, 1, 2],
    [7.79944277, 9.61838436, 0.0198679995, 1, 0.800000012],
  ],
  /* widthIdx=4 */ [
    [8.07799435, 5.48189402, 0.125827998, 1, 0.5],
    [8.91364861, 5.48189402, 0.125827998, 1, 0.5],
    [7.98050117, 6.08356524, 0.125827998, 1, 0.5],
    [7.36768818, 6.1587739, 0.0927150026, 1, 0.5],
    [7.07520914, 6.45960999, 0.105959997, 1, 0.5],
    [6.76281977, 6.375, 0.0463580005, 1, 0.5],
    [7.22841215, 7.21169901, 0.112582996, 1, 0],
    [7.31197786, 7.36211681, 0.0728479996, 1, 0],
    [7.49303579, 7.6629529, 0.0529799983, 1, 0],
    [7.67409515, 8.03899765, 0.0728479996, 1, -0.0794700012],
    [7.78551483, 8.49025059, 0.139072999, 1, -0.0794700012],
  ],
  /* widthIdx=5 */ [
    [9.05292511, 4.504179, 0.198675007, 1, -0.264901012],
    [8.95543194, 4.504179, 0.198675007, 1, -0.264901012],
    [7.92479086, 5.03064108, 0.198675007, 1, -0.264901012],
    [7.40947104, 5.25626802, 0.198675007, 1, -0.264901012],
    [6.90807819, 5.25626802, 0.132449999, 1, -0.264901012],
    [6.64345407, 5.40668488, 0.132449999, 1, -0.264901012],
    [7.13091898, 6.08356524, 0.172185004, 1, -0.450331002],
    [7.25626802, 6.38440084, 0.145695001, 1, -0.715232015],
    [7.29804993, 6.61002779, 0.145695001, 1, -0.715232015],
    [7.28412199, 6.76044607, 0.119204998, 1, -0.715232015],
    [7.36768818, 6.98607302, 0.119204998, 1, -0.76821202],
  ],
  /* widthIdx=6 */ [
    [8.69080734, 3.45125294, 0.178808004, 1, -1.11258304],
    [8.71866322, 3.45125294, 0.178808004, 1, -1.11258304],
    [7.57660198, 3.90250707, 0.178808004, 1, -1.11258304],
    [7.14484692, 4.20334196, 0.178808004, 1, -0.847681999],
    [6.81058502, 4.42896891, 0.178808004, 1, -0.847681999],
    [6.46239614, 4.504179, 0.178808004, 1, -0.847681999],
    [6.85236788, 5.10585022, 0.165563002, 1, -1.37748301],
    [7.01949883, 5.40668488, 0.132449999, 1, -1.48344398],
    [7.04735422, 5.70752096, 0.132449999, 1, -1.77483404],
    [7.17270184, 5.93314695, 0.0927150026, 1, -1.96026504],
    [7.18662882, 6.08356524, 0.0927150026, 1, -1.72185397],
  ],
  /* widthIdx=7 */ [
    [8.81615639, 2.9000001, 0.271522999, 1, -1.48344398],
    [8.66295242, 2.9000001, 0.271522999, 1, -1.48344398],
    [7.61838388, 3.37604499, 0.271522999, 1, -1.48344398],
    [7.18662882, 3.69230795, 0.271522999, 1, -1.48344398],
    [6.824512, 3.90250707, 0.225165993, 1, -1.50993395],
    [6.46239614, 3.97771597, 0.225165993, 1, -1.21854305],
    [6.83843994, 4.57938719, 0.251655996, 1, -1.58940399],
    [7.48397398, 5.25, 0.304636002, 1, -2.33112597],
    [7.17270184, 5.25626802, 0.192053005, 1, -2.304636],
    [7.22841215, 5.50961494, 0.218542993, 1, -2.304636],
    [7.27019501, 5.70752096, 0.218542993, 1, -2.46357608],
  ],
  /* widthIdx=8 */ [
    [8.64902496, 2.5, 0.231787995, 1, -2.14569497],
    [8.69080734, 2.5, 0.231787995, 1, -2.14569497],
    [7.54874706, 2.95000005, 0.231787995, 1, -2.14569497],
    [7.08913708, 3.30083609, 0.231787995, 1, -2.14569497],
    [6.74094677, 3.52646208, 0.231787995, 1, -2.14569497],
    [6.37882996, 3.60167098, 0.238410994, 1, -1.695364],
    [7.14743614, 4.38461494, 0.284767985, 1, -2.33112597],
    [7.04735422, 4.65459585, 0.291390985, 1, -2.27814603],
    [7.07520914, 4.8802228, 0.291390985, 1, -2.27814603],
    [7.17270184, 5.18105793, 0.304636002, 1, -2.728477],
    [7.31197786, 5.40668488, 0.304636002, 1, -2.728477],
  ],
  /* widthIdx=9 */ [
    [8.62117004, 2.20000005, 0.238410994, 1, -2.33112597],
    [8.50974941, 2.20000005, 0.238410994, 1, -2.33112597],
    [7.42339802, 2.70000005, 0.238410994, 1, -2.33112597],
    [7.07520914, 3.0752089, 0.238410994, 1, -2.119205],
    [6.72701883, 3.30083609, 0.238410994, 1, -2.119205],
    [6.35097504, 3.45125294, 0.238410994, 1, -2.119205],
    [6.71309185, 3.97771597, 0.152318001, 1, -2.75496697],
    [6.90705204, 4.42896891, 0.152318001, 1, -3.20529795],
    [7.00320482, 4.72980499, 0.152318001, 1, -3.390728],
    [7.17270184, 5.03064108, 0.152318001, 1, -3.49668908],
    [7.11538506, 5.18105793, 0.152318001, 1, -3.49668908],
  ],
];

/** The 5-float preset result of GetSettings. Field names are placeholders (see table doc). */
export interface HGShadowHighlightSettings {
  /** cell +0x00  (movups xmm3 lane 0) */ a0: number;
  /** cell +0x04  (movups xmm3 lane 1) */ a1: number;
  /** cell +0x08  (movups xmm3 lane 2) */ a2: number;
  /** cell +0x0c  (movups xmm3 lane 3) */ a3: number;
  /** cell +0x10  (movss  xmm3 scalar) */ a4: number;
}

/**
 * HGShadowHighlight instance state. Field offsets in the C++ layout are recovered from the
 * setters and shown for each field. Setters bump `_dirty` where the disasm calls
 * `HGNode::ClearBits()` — that HGNode base is not ported here (graph-cache invalidation).
 */
export class HGShadowHighlight {
  /** +0x220 */ inShadowAmount = 0.0;
  /** +0x224 */ inShadowTonalWidth = 0.0;
  /** +0x228 */ inRadius = 0.0;
  /** +0x22c */ inHighlightAmount = 0.0;
  /** +0x230 */ inHighlightTonalWidth = 0.0;
  /** +0x234 */ inColorCorrection = 0.0;
  /** +0x238 */ inMidtoneContrast = 0.0;
  /** HGNode::ClearBits() stand-in — bumped on every setter to model the call at
   *  @0x5c82e, @0x5c85e, @0x5c88e, @0x5c8be, @0x5c8ee, @0x5c91e, @0x5c94e. */
  _dirty = 0;

  /** @0x5c6d0  HGShadowHighlight::HGShadowHighlight() — tail-jmp to C2Ev (base ctor). */
  constructor() {
    // Base subobject (HGNode etc.) ctor is not ported; class fields hold their default 0.
  }

  /** @0x5c820  SetInputShadowAmount(f) — stores f -> this+0x220 after HGNode::ClearBits(). */
  SetInputShadowAmount(f: number): void {
    this._dirty++;                       // HGNode::ClearBits() @0x5c82e
    this.inShadowAmount = Math.fround(f); // movss %xmm0, 0x220(%rbx) @0x5c838
  }

  /** @0x5c850  SetInputShadowTonalWidth(f) — stores f -> this+0x224. */
  SetInputShadowTonalWidth(f: number): void {
    this._dirty++;                          // HGNode::ClearBits() @0x5c85e
    this.inShadowTonalWidth = Math.fround(f); // movss %xmm0, 0x224(%rbx) @0x5c868
  }

  /** @0x5c880  SetInputRadius(f) — stores f -> this+0x228. */
  SetInputRadius(f: number): void {
    this._dirty++;                  // HGNode::ClearBits() @0x5c88e
    this.inRadius = Math.fround(f); // movss %xmm0, 0x228(%rbx) @0x5c898
  }

  /** @0x5c8b0  SetInputHighlightAmount(f) — stores f -> this+0x22c. */
  SetInputHighlightAmount(f: number): void {
    this._dirty++;                          // HGNode::ClearBits() @0x5c8be
    this.inHighlightAmount = Math.fround(f); // movss %xmm0, 0x22c(%rbx) @0x5c8c8
  }

  /** @0x5c8e0  SetInputHighlightTonalWidth(f) — stores f -> this+0x230. */
  SetInputHighlightTonalWidth(f: number): void {
    this._dirty++;                              // HGNode::ClearBits() @0x5c8ee
    this.inHighlightTonalWidth = Math.fround(f); // movss %xmm0, 0x230(%rbx) @0x5c8f8
  }

  /** @0x5c910  SetInputColorCorrection(f) — stores f -> this+0x234. */
  SetInputColorCorrection(f: number): void {
    this._dirty++;                         // HGNode::ClearBits() @0x5c91e
    this.inColorCorrection = Math.fround(f); // movss %xmm0, 0x234(%rbx) @0x5c928
  }

  /** @0x5c940  SetInputMidtoneContrast(f) — stores f -> this+0x238. */
  SetInputMidtoneContrast(f: number): void {
    this._dirty++;                          // HGNode::ClearBits() @0x5c94e
    this.inMidtoneContrast = Math.fround(f); // movss %xmm0, 0x238(%rbx) @0x5c958
  }

  /** @0x5c970  CIToHGBlurRadius(f) — returns f * 3.0f (single-precision).
   *
   *  Disasm:
   *    mulss 0x36d974(%rip), %xmm0   ## next_ip=0x5c97c; target=0x5c97c+0x36d974=0x3ca2f0=3.0f
   *    retq
   *
   *  Free function on this class — takes no `this`. */
  static CIToHGBlurRadius(f: number): number {
    return Math.fround(Math.fround(f) * KF_CI_TO_HG_BLUR);
  }

  /**
   * @0x5d270  GetSettings(width, amount, out) — bilinear-interp a 5-float preset from
   *           s_SettingsTable[widthIdx][amountIdx] using two 2D LUT axes.
   *
   * Control flow transcribed from raw-port/re/disasm/Helium.HGShadowHighlight.GetSettings.s:
   *   1. Bracket-search width in [0, 10, 20, ..., 90, 100] to find widthIdx in [0, 9].
   *      If input < 0 or >= 100, falls to printf "width %f is out of table range" @0x5d5ae.
   *   2. Bracket-search amount identically. OOR falls to "amount %f ..." @0x5d5c1.
   *   3. Convert int32 endpoints via cvtsi2ss (@0x5d3a6, @0x5d4f2), compute
   *        u = (width  - widths[widthIdx])   / (widths[widthIdx+1]   - widths[widthIdx])
   *        v = (amount - amounts[amountIdx]) / (amounts[amountIdx+1] - amounts[amountIdx])
   *      (subss xmm2,xmm0 @0x5d4d8; divss @0x5d4e0 / @0x5d507)
   *   4. Load four cells c00 c01 c10 c11 (@0x5d571,75,79,7d for vec4 lanes; scalar tail
   *      @0x5d520,31,41,47).
   *   5. Bilinear-interp: row0=mix(c00,c01,v); row1=mix(c10,c11,v); out=mix(row0,row1,u).
   *      The disasm uses `(y-x)*t + x` (subps/mulps/addps @0x5d581/88/8b) — preserved here.
   *   6. Store 16-byte vec4 to out+0x00 (@0x5d5a4), 4-byte scalar to out+0x10 (@0x5d5a7).
   */
  static GetSettings(width: number, amount: number, out: HGShadowHighlightSettings): void {
    const w = Math.fround(width);
    const a = Math.fround(amount);

    // Bracket-search width. First check xorps xmm2,xmm2; ucomiss xmm2,xmm0; jb 0x5d28f
    // catches widthIdx=0 iff (w >= 0 && 10 > w). Each subsequent check has the form
    // ucomiss <k*10>(%rip),%xmm0; jb; movl $k,%eax; movss <(k+1)*10>(%rip),%xmm2; ucomiss ...
    let widthIdx = -1;
    if      (w >= 0                                && Math.fround(KF_BRACKETS[0]) > w) widthIdx = 0;
    else if (w >= Math.fround(KF_BRACKETS[0])       && Math.fround(KF_BRACKETS[1]) > w) widthIdx = 1;
    else if (w >= Math.fround(KF_BRACKETS[1])       && Math.fround(KF_BRACKETS[2]) > w) widthIdx = 2;
    else if (w >= Math.fround(KF_BRACKETS[2])       && Math.fround(KF_BRACKETS[3]) > w) widthIdx = 3;
    else if (w >= Math.fround(KF_BRACKETS[3])       && Math.fround(KF_BRACKETS[4]) > w) widthIdx = 4;
    else if (w >= Math.fround(KF_BRACKETS[4])       && Math.fround(KF_BRACKETS[5]) > w) widthIdx = 5;
    else if (w >= Math.fround(KF_BRACKETS[5])       && Math.fround(KF_BRACKETS[6]) > w) widthIdx = 6;
    else if (w >= Math.fround(KF_BRACKETS[6])       && Math.fround(KF_BRACKETS[7]) > w) widthIdx = 7;
    else if (w >= Math.fround(KF_BRACKETS[7])       && Math.fround(KF_BRACKETS[8]) > w) widthIdx = 8;
    else if (w >= Math.fround(KF_BRACKETS[8])       && Math.fround(KF_BRACKETS[9]) > w) widthIdx = 9;
    if (widthIdx < 0) {
      // @0x5d5ae — printf("width %f is out of table range"). Faithful throw rather than silent
      // return: caller must feed values inside [0, 100).
      throw new Error("HGShadowHighlight::GetSettings @0x5d5ae — width " + w + " is out of table range");
    }

    let amountIdx = -1;
    if      (a >= 0                                && Math.fround(KF_BRACKETS[0]) > a) amountIdx = 0;
    else if (a >= Math.fround(KF_BRACKETS[0])       && Math.fround(KF_BRACKETS[1]) > a) amountIdx = 1;
    else if (a >= Math.fround(KF_BRACKETS[1])       && Math.fround(KF_BRACKETS[2]) > a) amountIdx = 2;
    else if (a >= Math.fround(KF_BRACKETS[2])       && Math.fround(KF_BRACKETS[3]) > a) amountIdx = 3;
    else if (a >= Math.fround(KF_BRACKETS[3])       && Math.fround(KF_BRACKETS[4]) > a) amountIdx = 4;
    else if (a >= Math.fround(KF_BRACKETS[4])       && Math.fround(KF_BRACKETS[5]) > a) amountIdx = 5;
    else if (a >= Math.fround(KF_BRACKETS[5])       && Math.fround(KF_BRACKETS[6]) > a) amountIdx = 6;
    else if (a >= Math.fround(KF_BRACKETS[6])       && Math.fround(KF_BRACKETS[7]) > a) amountIdx = 7;
    else if (a >= Math.fround(KF_BRACKETS[7])       && Math.fround(KF_BRACKETS[8]) > a) amountIdx = 8;
    else if (a >= Math.fround(KF_BRACKETS[8])       && Math.fround(KF_BRACKETS[9]) > a) amountIdx = 9;
    if (amountIdx < 0) {
      // @0x5d5c1 — printf("amount %f is out of table range").
      throw new Error("HGShadowHighlight::GetSettings @0x5d5c1 — amount " + a + " is out of table range");
    }

    // Normalize (cvtsi2ss the int32 endpoints, then subss + divss). @0x5d3a6, @0x5d4d8, @0x5d4e0.
    const wLo = Math.fround(S_WIDTHS_TABLE[widthIdx]);
    const wHi = Math.fround(S_WIDTHS_TABLE[widthIdx + 1] ?? 100);
    const aLo = Math.fround(S_AMOUNTS_TABLE[amountIdx]);
    const aHi = Math.fround(S_AMOUNTS_TABLE[amountIdx + 1] ?? 100);
    const u = Math.fround(Math.fround(w - wLo) / Math.fround(wHi - wLo)); // width fraction @0x5d4e0
    const v = Math.fround(Math.fround(a - aLo) / Math.fround(aHi - aLo)); // amount fraction @0x5d507

    // Load 4 bracket cells from s_SettingsTable.
    const c00 = S_SETTINGS_TABLE[widthIdx    ][amountIdx    ]; // @0x5d571 vec4 / @0x5d520 scalar
    const c01 = S_SETTINGS_TABLE[widthIdx    ][amountIdx + 1]; // @0x5d575 vec4 / @0x5d531 scalar
    const c10 = S_SETTINGS_TABLE[widthIdx + 1][amountIdx    ]; // @0x5d579 vec4 / @0x5d541 scalar
    const c11 = S_SETTINGS_TABLE[widthIdx + 1][amountIdx + 1]; // @0x5d57d vec4 / @0x5d547 scalar

    // SSE bilinear: (y-x)*t + x on both axes. Preserves subps/mulps/addps chain.
    // JS scalar Math.fround matches per-lane movss rounding.
    const mixF = (x: number, y: number, t: number): number =>
      Math.fround(Math.fround(Math.fround(y - x) * t) + x);

    // row0 = c00 + v*(c01-c00);  row1 = c10 + v*(c11-c10)   — inner axis is v (amount).
    const row0_0 = mixF(c00[0], c01[0], v);
    const row0_1 = mixF(c00[1], c01[1], v);
    const row0_2 = mixF(c00[2], c01[2], v);
    const row0_3 = mixF(c00[3], c01[3], v);
    const row0_4 = mixF(c00[4], c01[4], v); // scalar lane @0x5d54d/51/55
    const row1_0 = mixF(c10[0], c11[0], v);
    const row1_1 = mixF(c10[1], c11[1], v);
    const row1_2 = mixF(c10[2], c11[2], v);
    const row1_3 = mixF(c10[3], c11[3], v);
    const row1_4 = mixF(c10[4], c11[4], v); // scalar lane @0x5d559/5d/61

    // out = row0 + u*(row1-row0) — outer axis is u (width). @0x5d597/9a/9e/a1.
    out.a0 = mixF(row0_0, row1_0, u);
    out.a1 = mixF(row0_1, row1_1, u);
    out.a2 = mixF(row0_2, row1_2, u);
    out.a3 = mixF(row0_3, row1_3, u);
    out.a4 = mixF(row0_4, row1_4, u); // @0x5d565/69/6d
  }

  /**
   * @0x5c980  UpdateParams() — builds the HGRenderer scene graph. Calls GetSettings twice
   *          (once with (shadowAmount, shadowTonalWidth) -> @0x5c9a8, once with
   *          (highlightAmount, highlightTonalWidth) -> @0x5c9c4) then `new HGObject` allocates
   *          a chain of HGTransform / HGTextureWrap / gain nodes and binds via ~50 vtable
   *          dispatches. Not portable in isolation.
   */
  UpdateParams(): void {
    throw new Error(
      "HGShadowHighlight::UpdateParams @0x5c980 not yet transcribed " +
      "(HGObject::operator new, HGTransform ctor+vt[0x90], HGTextureWrap vt[0x230], plus " +
      "20+ scene-graph vtable slots — plumbing frontier)",
    );
  }

  /**
   * @0x5d5e0  GetOutput(renderer) — dispatches into HGRenderer to render the pass. 37-line
   *          facade that hands off to the HGRenderer graph built by UpdateParams. Not portable
   *          without the render frontier.
   */
  GetOutput(_renderer: unknown): unknown {
    throw new Error(
      "HGShadowHighlight::GetOutput @0x5d5e0 not yet transcribed " +
      "(HGRenderer forward — depends on UpdateParams graph)",
    );
  }
}

// Tables + brackets are exported for parity harness / oracle tests.
export {
  KF_CI_TO_HG_BLUR,
  KF_BRACKETS,
  S_WIDTHS_TABLE,
  S_AMOUNTS_TABLE,
  S_SETTINGS_TABLE,
};
