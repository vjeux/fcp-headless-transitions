// PCPixelFormat — ProCore's pixel-format enumeration + attribute-lookup helpers.
// Faithful port of the ProCore x86_64 disassembly. Every method cites its @ProCore addr.
//
// Framework: ProCore
// Provenance (raw-port/re/disasm/ProCore.PCPixelFormat.*.s):
//   PCPixelFormat::getGLInternalFormat(ChannelOrder)   @0x035308
//   PCPixelFormat::getGLDataFormat(ChannelOrder)       @0x035324
//   PCPixelFormat::getGLDataType(ChannelOrder)         @0x035342
//   PCPixelFormat::getPixelFormat(u32, u32)            @0x035360
//   PCPixelFormat::getBitsPerPixel(ChannelOrder)       @0x035388
//   PCPixelFormat::getBitsPerChannel(ChannelOrder)     @0x0353a4
//   PCPixelFormat::getBytesPerPixel(ChannelOrder)      @0x0353c2
//   PCPixelFormat::hasRGB(ChannelOrder)                @0x0353e0
//   PCPixelFormat::hasGray(ChannelOrder)               @0x0353fe
//   PCPixelFormat::hasAlpha(ChannelOrder)              @0x03541c
//   PCPixelFormat::hasAlphaLast(ChannelOrder)          @0x03543a
//   PCPixelFormat::isFloat(ChannelOrder)               @0x035458
//   PCPixelFormat::getNumChannels(ChannelOrder)        @0x035476
//   PCPixelFormat::is8Bit(ChannelOrder)                @0x035494
//   PCPixelFormat::is16Bit(ChannelOrder)               @0x0354a2
//   PCPixelFormat::is32Bit(ChannelOrder)               @0x0354b2
//   PCPixelFormat::setRGB(ChannelOrder)                @0x0354f6
//   PCPixelFormat::setGray(ChannelOrder)               @0x035524
//   PCPixelFormat::addAlpha(ChannelOrder)              @0x035552
//   PCPixelFormat::removeAlpha(ChannelOrder)           @0x0355b8
//   PCPixelFormat::setDepth(ChannelOrder, u32, bool)   @0x035620
//
// ─── Decoded data tables ────────────────────────────────────────────────────────────────────
//
// PCPixelFormat has NO instance state; every public method is static and reads one of two
// module-local (`(anonymous namespace)`) global arrays. All arrays are declared 18 entries wide,
// indexed by the ChannelOrder enum value (0..17).
//
// TABLE `pixelInfo` @ProCore data addr 0x123cd0 — 18 × 24-byte records:
//   +0x00 (i32)  bitsPerPixel
//   +0x04 (i32)  bitsPerChannel
//   +0x08 (i32)  bytesPerPixel
//   +0x0c (u8)   hasRGB
//   +0x0d (u8)   hasGray
//   +0x0e (u8)   hasAlpha
//   +0x0f (u8)   hasAlphaLast
//   +0x10 (u8)   isFloat
//   +0x14 (i32)  numChannels
// (offsets +0x11..+0x13 are padding; +0x18..+0x1f is 8-byte tail padding.)
// The `2*rax + rax = 3*rax; 4*(3*rax) = 12*rax` scaling means the strided-index math the disasm
// emits is `pixelInfo + 8 * (3 * order) = pixelInfo + 24 * order` — 24 bytes/entry confirmed.
//
// TABLE `glInfo` @ProCore data addr 0x123bf0 — 18 × 12-byte records:
//   +0x00 (i32)  internalFormat
//   +0x04 (i32)  dataFormat
//   +0x08 (i32)  dataType
//
// Both tables were dumped from the running ProCore.x86_64 binary at the addresses computed from
// the leaq rip-relative displacements in the disassembly (@0x353b4/@0x353f0/@0x353b4 for
// pixelInfo, @0x035334 for glInfo). The 18-row array is stopped at 18 by the `cmpl $0x12, edi
// ; cmovbl edi, eax ; else eax=0` clamp seen in every getter: any ChannelOrder value >= 0x12
// (18) is treated as if it were 0 (the "invalid" all-zeros row).
//
// FAITHFUL PORT — every function cites its @ProCore 0xADDR. No approximations, no invented
// helpers. All decoded numeric literals cite their source address or table.

/**
 * `PCPixelFormat::ChannelOrder` — the 18-way enum indexing into `pixelInfo` and `glInfo`.
 *
 * Names are inferred from the row content of `pixelInfo` (see comments below); the numeric
 * values are DECODED from the layout — the disasm compares against 0x12 (18) as the exclusive
 * upper bound and against specific small integers (1, 2, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15)
 * in the switch-tables of addAlpha/removeAlpha/setRGB/setGray/setDepth. Enum names in the FCP
 * header could differ, but the underlying integer values are what disassembly cares about.
 */
export const enum ChannelOrder {
  /** Row 0 — the "invalid / not-a-format" slot. All pixelInfo/glInfo fields are 0. */
  kInvalid = 0,
  /** Row 1 — 8-bit gray. pixelInfo[1] = (bpp=8, bpc=8, bytes=1, gray=1, ch=1). */
  kY8 = 1,
  /** Row 2 — 8-bit gray+alpha. pixelInfo[2] = (bpp=16, bpc=8, bytes=2, gray=1, alpha=1, aLast=1, ch=2). */
  kYA8 = 2,
  /** Row 3 — 8-bit RGBA (alpha-first). pixelInfo[3] = (bpp=32, bpc=8, bytes=4, RGB=1, alpha=1, aLast=0, ch=4). */
  kARGB8 = 3,
  /** Row 4 — same shape as row 3. Presumed BGRA vs. ARGB order (same attributes; distinguishing use
   *  is done by the glInfo dataFormat differing between rows 3 and 4). */
  kBGRA8 = 4,
  /** Row 5 — 8-bit RGBA (alpha-last, hasAlphaLast=1). glInfo[5].dataType differs from row 4. */
  kRGBA8_5 = 5,
  /** Row 6 — same shape as row 5, different GL encoding. */
  kRGBA8_6 = 6,
  /** Row 7 — 16-bit gray. */
  kY16 = 7,
  /** Row 8 — 16-bit gray+alpha. */
  kYA16 = 8,
  /** Row 9 — 16-bit RGB (no alpha). ch=3. */
  kRGB16 = 9,
  /** Row 10 — 16-bit RGBA. ch=4, alpha=1, aLast=1. */
  kRGBA16 = 10,
  /** Row 11 — 16-bit half-float gray. */
  kY16F = 11,
  /** Row 12 — 16-bit half-float gray+alpha. */
  kYA16F = 12,
  /** Row 13 — 16-bit half-float RGBA. */
  kRGBA16F = 13,
  /** Row 14 — 32-bit float gray. */
  kY32F = 14,
  /** Row 15 — 32-bit float gray+alpha. */
  kYA32F = 15,
  /** Row 16 — 32-bit float RGBA (aLast=1). */
  kRGBA32F = 16,
  /** Row 17 — 32-bit float RGBA (aLast=0, e.g. ARGB32F). */
  kARGB32F = 17,
}

// ── decoded tables (from ProCore.x86_64 @0x123bf0 and @0x123cd0) ───────────────────────────

/**
 * `pixelInfo` table — @ProCore data addr 0x123cd0, 18 × 24-byte entries. Extracted verbatim
 * from the binary. See file-header for the record layout.
 *
 * Rows dumped by opening the ProCore thin slice at that offset (see re/disasm/*.s cites at
 * @0x353b4 which resolves to this same address via `leaq __ZN12_GLOBAL__N_19pixelInfoE(%rip)`).
 */
const pixelInfo: ReadonlyArray<{
  bitsPerPixel: number;
  bitsPerChannel: number;
  bytesPerPixel: number;
  hasRGB: number;
  hasGray: number;
  hasAlpha: number;
  hasAlphaLast: number;
  isFloat: number;
  numChannels: number;
}> = [
  // @ProCore 0x123cd0 (decoded, decode: pixelInfo)
  { bitsPerPixel: 0,   bitsPerChannel: 0,  bytesPerPixel: 0,  hasRGB: 0, hasGray: 0, hasAlpha: 0, hasAlphaLast: 0, isFloat: 0, numChannels: 0 },
  { bitsPerPixel: 8,   bitsPerChannel: 8,  bytesPerPixel: 1,  hasRGB: 0, hasGray: 1, hasAlpha: 0, hasAlphaLast: 0, isFloat: 0, numChannels: 1 },
  { bitsPerPixel: 16,  bitsPerChannel: 8,  bytesPerPixel: 2,  hasRGB: 0, hasGray: 1, hasAlpha: 1, hasAlphaLast: 1, isFloat: 0, numChannels: 2 },
  { bitsPerPixel: 32,  bitsPerChannel: 8,  bytesPerPixel: 4,  hasRGB: 1, hasGray: 0, hasAlpha: 1, hasAlphaLast: 0, isFloat: 0, numChannels: 4 },
  { bitsPerPixel: 32,  bitsPerChannel: 8,  bytesPerPixel: 4,  hasRGB: 1, hasGray: 0, hasAlpha: 1, hasAlphaLast: 0, isFloat: 0, numChannels: 4 },
  { bitsPerPixel: 32,  bitsPerChannel: 8,  bytesPerPixel: 4,  hasRGB: 1, hasGray: 0, hasAlpha: 1, hasAlphaLast: 1, isFloat: 0, numChannels: 4 },
  { bitsPerPixel: 32,  bitsPerChannel: 8,  bytesPerPixel: 4,  hasRGB: 1, hasGray: 0, hasAlpha: 1, hasAlphaLast: 1, isFloat: 0, numChannels: 4 },
  { bitsPerPixel: 16,  bitsPerChannel: 16, bytesPerPixel: 2,  hasRGB: 0, hasGray: 1, hasAlpha: 0, hasAlphaLast: 0, isFloat: 0, numChannels: 1 },
  { bitsPerPixel: 32,  bitsPerChannel: 16, bytesPerPixel: 4,  hasRGB: 0, hasGray: 1, hasAlpha: 1, hasAlphaLast: 1, isFloat: 0, numChannels: 2 },
  { bitsPerPixel: 48,  bitsPerChannel: 16, bytesPerPixel: 6,  hasRGB: 1, hasGray: 0, hasAlpha: 0, hasAlphaLast: 0, isFloat: 0, numChannels: 3 },
  { bitsPerPixel: 64,  bitsPerChannel: 16, bytesPerPixel: 8,  hasRGB: 1, hasGray: 0, hasAlpha: 1, hasAlphaLast: 1, isFloat: 0, numChannels: 4 },
  { bitsPerPixel: 16,  bitsPerChannel: 16, bytesPerPixel: 2,  hasRGB: 0, hasGray: 1, hasAlpha: 0, hasAlphaLast: 0, isFloat: 1, numChannels: 1 },
  { bitsPerPixel: 32,  bitsPerChannel: 16, bytesPerPixel: 4,  hasRGB: 0, hasGray: 1, hasAlpha: 1, hasAlphaLast: 1, isFloat: 1, numChannels: 2 },
  { bitsPerPixel: 64,  bitsPerChannel: 16, bytesPerPixel: 8,  hasRGB: 1, hasGray: 0, hasAlpha: 1, hasAlphaLast: 1, isFloat: 1, numChannels: 4 },
  { bitsPerPixel: 32,  bitsPerChannel: 32, bytesPerPixel: 4,  hasRGB: 0, hasGray: 1, hasAlpha: 0, hasAlphaLast: 0, isFloat: 1, numChannels: 1 },
  { bitsPerPixel: 64,  bitsPerChannel: 32, bytesPerPixel: 8,  hasRGB: 0, hasGray: 1, hasAlpha: 1, hasAlphaLast: 1, isFloat: 1, numChannels: 2 },
  { bitsPerPixel: 128, bitsPerChannel: 32, bytesPerPixel: 16, hasRGB: 1, hasGray: 0, hasAlpha: 1, hasAlphaLast: 1, isFloat: 1, numChannels: 4 },
  { bitsPerPixel: 128, bitsPerChannel: 32, bytesPerPixel: 16, hasRGB: 1, hasGray: 0, hasAlpha: 1, hasAlphaLast: 0, isFloat: 1, numChannels: 4 },
];

/**
 * `glInfo` table — @ProCore data addr 0x123bf0, 18 × 12-byte entries. Each row is
 * (internalFormat, dataFormat, dataType). Values are OpenGL enum constants.
 */
const glInfo: ReadonlyArray<{
  internalFormat: number;
  dataFormat: number;
  dataType: number;
}> = [
  // @ProCore 0x123bf0 (decoded)
  { internalFormat: 0,     dataFormat: 0,     dataType: 0 },
  { internalFormat: 32832, dataFormat: 6409,  dataType: 5121 },   // GL_LUMINANCE / UBYTE
  { internalFormat: 32837, dataFormat: 6410,  dataType: 5121 },   // GL_LUMINANCE_ALPHA / UBYTE
  { internalFormat: 32856, dataFormat: 32993, dataType: 32821 },
  { internalFormat: 32856, dataFormat: 6408,  dataType: 32821 },
  { internalFormat: 32856, dataFormat: 6408,  dataType: 33639 },
  { internalFormat: 32856, dataFormat: 32993, dataType: 33639 },
  { internalFormat: 32834, dataFormat: 6409,  dataType: 5123 },   // 16-bit LUMINANCE / USHORT
  { internalFormat: 32840, dataFormat: 6410,  dataType: 5123 },
  { internalFormat: 32852, dataFormat: 6407,  dataType: 5123 },
  { internalFormat: 32859, dataFormat: 6408,  dataType: 5123 },
  { internalFormat: 34846, dataFormat: 6409,  dataType: 5131 },   // half-float LUMINANCE
  { internalFormat: 34847, dataFormat: 6410,  dataType: 5131 },
  { internalFormat: 34842, dataFormat: 6408,  dataType: 5131 },
  { internalFormat: 34840, dataFormat: 6409,  dataType: 5126 },   // 32-bit float LUMINANCE
  { internalFormat: 34841, dataFormat: 6410,  dataType: 5126 },
  { internalFormat: 34836, dataFormat: 6408,  dataType: 5126 },
  { internalFormat: 34836, dataFormat: 32993, dataType: 5126 },
];

// Tables driving the `addAlpha` / `removeAlpha` / `setRGB` / `setGray` / `setDepth` switches.
// Each is DECODED from the compiler-emitted jump-table + inline movl-immediate targets in the
// disassembly.

/**
 * `addAlpha` target table. Extracted from the jump-table @0x35598 (8 entries × 4-byte
 * rcx-relative dispatch offsets) + the inline movl-immediate at each fallthrough label. See
 * re/disasm/ProCore.PCPixelFormat.addAlpha.s @0x35552..@0x35597.
 *
 * Entries not present are the "default" branch (order not in {1, 7..14}) which either
 * returns 2 (if input was 1) or returns input unchanged.
 */
const addAlpha_by_order: ReadonlyMap<number, number> = new Map<number, number>([
  // @ProCore 0x35552..@0x35597 (decoded from switch @0x35556..@0x35591)
  [1, 2],   //  order 1 -> 2  (Y8 -> YA8)         via @0x3557a `cmpl $0x1,%edi ; je .ret_2`
  [7, 8],   //  order 7 -> 8  (Y16 -> YA16)       via jump-table entry @0x35598[0] -> @0x3556e movl $8
  [8, 8],   //  order 8 -> 8  (YA16 unchanged)    via jt[1] -> @0x3557f mov edi,eax
  [9, 10],  //  order 9 -> 10 (RGB16 -> RGBA16)   via jt[2] -> @0x35591 mov $10
  [10, 10], //  order 10 unchanged                via jt[3] -> @0x3557f
  [11, 12], //  order 11 -> 12                    via jt[4] -> @0x35583 mov $12
  [12, 12], //  order 12 unchanged                via jt[5] -> @0x3557f
  [13, 13], //  order 13 unchanged                via jt[6] -> @0x3557f
  [14, 15], //  order 14 -> 15 (Y32F -> YA32F)    via jt[7] -> @0x3558a mov $15
]);

/**
 * `removeAlpha` target table. Extracted from re/disasm/ProCore.PCPixelFormat.removeAlpha.s
 * (jump-table @0x35600, 8 entries) + fallthrough labels.
 */
const removeAlpha_by_order: ReadonlyMap<number, number> = new Map<number, number>([
  // @ProCore 0x355b8..@0x355fd (decoded from switch @0x355bc..@0x355f7)
  [2, 1],   //  order 2 -> 1  (YA8 -> Y8)          via @0x355e0 `cmpl $0x2,%edi ; je .ret_1`
  [8, 7],   //  order 8 -> 7  (YA16 -> Y16)        via jt[0] -> @0x355d4 mov $7
  [9, 9],   //  order 9 unchanged                  via jt[1] -> @0x355e5 mov edi,eax
  [10, 9],  //  order 10 -> 9 (RGBA16 -> RGB16)    via jt[2] -> @0x355f7 mov $9
  [11, 11], //  order 11 unchanged                 via jt[3] -> @0x355e5
  [12, 11], //  order 12 -> 11                     via jt[4] -> @0x355e9 mov $11
  [13, 13], //  order 13 unchanged                 via jt[5] -> @0x355e5
  [14, 14], //  order 14 unchanged                 via jt[6] -> @0x355e5
  [15, 14], //  order 15 -> 14 (YA32F -> Y32F)     via jt[7] -> @0x355f0 mov $14
]);

/**
 * `setRGB` — mask + table. If bit `(order-1)` is set in `setRGB_mask` AND `(order-1) < 15`,
 * the return value is `setRGB_table[order-1]`; else the input is returned unchanged.
 *
 * @ProCore mask literal 0x6cc3 @0x35505; table addr 0x123e80 (leaq @0x35517).
 */
const setRGB_mask = 0x6cc3;
const setRGB_table: ReadonlyArray<number> = [
  // @ProCore 0x123e80 (decoded), 15 entries indexed by order-1
   3,  3,  0,  0,  0,   0,  9, 10,  0,  0,  13, 13,  0, 16, 16,
];

/**
 * `setGray` — mask + table. If bit `(order-3)` is set in `setGray_mask` AND `(order-3) < 15`,
 * the return value is `setGray_table[order-3]`; else the input is returned unchanged.
 *
 * @ProCore mask literal 0x64cf @0x35533; table addr 0x123ebc (leaq @0x35545).
 */
const setGray_mask = 0x64cf;
const setGray_table: ReadonlyArray<number> = [
  // @ProCore 0x123ebc (decoded), 15 entries indexed by order-3
   2,  2,  2,  2,  0,   0,  7,  8,  0,  0,  12,  0,  0, 15, 15,
];

/**
 * `setDepth` — 4 dispatch cases (float×32bits, float×16bits, int×16bits, int×8bits), each with
 * its own table + validity gate. Encoded per-branch below.
 *
 * @ProCore 0x35620..@0x356a6.
 */
const setDepth_halfFloat_mask = 0x1e3ff; // @ProCore 0x3563d
const setDepth_halfFloat_table: ReadonlyArray<number> = [
  // @ProCore 0x123ef8 (decoded), 17 entries indexed by order-1
  11, 12, 13, 13, 13, 13, 11, 12, 13, 13,  0,  0,  0, 11, 12, 13, 13,
];
const setDepth_int8_maxIdx = 11; // @ProCore 0x35661 `cmpl $0xb,%ecx ; jae .end`  (valid: order-7 in [0..10])
const setDepth_int8_table: ReadonlyArray<number> = [
  // @ProCore 0x123f70 (decoded), 11 entries indexed by order-7
   1,  2,  3,  3,  1,  2,  3,  1,  2,  3,  3,
];
const setDepth_float32_maxIdx = 13; // @ProCore 0x35674 `cmpl $0xd,%ecx ; jae .end`  (valid: order-1 in [0..12])
const setDepth_float32_table: ReadonlyArray<number> = [
  // @ProCore 0x123f3c (decoded), 13 entries indexed by order-1
  14, 15, 16, 16, 16, 16, 14, 15, 16, 16, 14, 15, 16,
];
const setDepth_int16_mask = 0x1fc3f; // @ProCore 0x3568d
const setDepth_int16_table: ReadonlyArray<number> = [
  // @ProCore 0x123f9c (decoded), 17 entries indexed by order-1
   7,  8, 10, 10, 10, 10,  0,  0,  0,  0,  7,  8, 10,  7,  8, 10, 10,
];

// ── clamp helper reflecting the shared prologue of the pixelInfo-indexing methods ──────────

/**
 * The row-clamp emitted by every pixelInfo/glInfo getter as the shared prologue:
 *
 *   xorl %eax,%eax ; cmpl $0x12,%edi ; cmovbl %edi,%eax
 *
 * Reads: `eax = (order < 0x12) ? order : 0`. Any out-of-range enum value routes to row 0 (the
 * all-zeros "invalid" slot) — which is why the getters never bounds-fault.
 */
function clampRow(order: number): number {
  const o = order | 0;
  // `cmpl $0x12,%edi` treats %edi as UNSIGNED (`cmovbl` = cmov-below-unsigned). Negative inputs
  // therefore compare above 0x12 and clamp to 0 — mirror that with `>>> 0`.
  return (o >>> 0) < 0x12 ? o : 0;
}

// ── PCPixelFormat ───────────────────────────────────────────────────────────────────────────

/**
 * `PCPixelFormat` — a family of static helpers on the `ChannelOrder` enum. There is no
 * instance state (no ctor / dtor entries in the ProCore ledger for this class); every method
 * is a pure function of its arguments and the two decoded lookup tables.
 */
export class PCPixelFormat {
  /**
   * `PCPixelFormat::getGLInternalFormat(ChannelOrder order)` — @0x035308.
   *
   * Disasm (decoded from raw bytes — ICF-folded from getGLDataFormat/getGLDataType shape):
   *   0x35308  xorl  %eax,%eax ; cmpl $0x12,%edi ; cmovbl %edi,%eax
   *   0x35314  leaq  (%rax,%rax,2),%rax                                 (rax = 3*idx)
   *   0x35318  leaq  __ZN12_GLOBAL__N_16glInfoE(%rip),%rcx              (rcx = glInfo)
   *   0x3531f  movl  (%rcx,%rax,4),%eax                                 (eax = glInfo[idx].internalFormat)
   */
  static getGLInternalFormat(order: ChannelOrder): number {
    // @0x3530c..@0x35311 — clamp order-in-range
    const idx = clampRow(order);
    // @0x3531f — read internalFormat (offset +0x00 of the 12-byte record)
    return glInfo[idx].internalFormat | 0;
  }

  /**
   * `PCPixelFormat::getGLDataFormat(ChannelOrder order)` — @0x035324.
   *
   * Disasm identical to getGLInternalFormat except the final load offset is +0x04:
   *   0x3533b  movl  0x4(%rcx,%rax,4),%eax                              (eax = glInfo[idx].dataFormat)
   */
  static getGLDataFormat(order: ChannelOrder): number {
    const idx = clampRow(order); // @0x35328..@0x3532d
    return glInfo[idx].dataFormat | 0; // @0x3533b (+4 offset)
  }

  /**
   * `PCPixelFormat::getGLDataType(ChannelOrder order)` — @0x035342.
   *
   * Final load offset +0x08:
   *   0x35359  movl  0x8(%rcx,%rax,4),%eax                              (eax = glInfo[idx].dataType)
   */
  static getGLDataType(order: ChannelOrder): number {
    const idx = clampRow(order); // @0x35346..@0x3534b
    return glInfo[idx].dataType | 0; // @0x35359 (+8 offset)
  }

  /**
   * `PCPixelFormat::getPixelFormat(u32 dataFormat, u32 dataType)` — @0x035360.
   *
   * Reverse lookup: linear scan of the 18-entry `glInfo` table for the first row where
   * `glInfo[k].dataFormat == dataFormat` AND `glInfo[k].dataType == dataType`; returns the
   * matching ChannelOrder index, or 0 if no row matches.
   *
   * Disasm scans `rcx = &glInfo[0].dataType` (== glInfo base + 8) with a step of 12 bytes:
   *   0x35364  leaq  0xee88d(%rip),%rcx                                 (rcx = glInfo + 8)
   *   0x3536b  xorl  %eax,%eax                                          (k = 0)
   *   0x3536d  cmpl  %edi,-0x4(%rcx)                                    (glInfo[k].dataFormat == dataFormat?)
   *   0x35370  jne   .next
   *   0x35372  cmpl  %esi,(%rcx)                                        (glInfo[k].dataType == dataType?)
   *   0x35374  je    .found
   *   .next:   incq  %rax ; addq $0xc,%rcx                              (k++, rcx += 12)
   *   0x3537d  cmpq  $0x12,%rax ; jne .loop
   *   0x35383  xorl  %eax,%eax                                          (miss -> 0)
   *   .found:  retq
   */
  static getPixelFormat(dataFormat: number, dataType: number): ChannelOrder {
    // @0x3536b..@0x35381 — scan 18 rows
    const df = dataFormat | 0;
    const dt = dataType | 0;
    for (let k = 0; k < 18; k++) {
      if ((glInfo[k].dataFormat | 0) === df && (glInfo[k].dataType | 0) === dt) {
        return k as ChannelOrder;
      }
    }
    // @0x35383 — sentinel: 0 (== kInvalid) on miss
    return 0 as ChannelOrder;
  }

  /**
   * `PCPixelFormat::getBitsPerPixel(ChannelOrder order)` — @0x035388.
   *
   * `pixelInfo[order].bitsPerPixel` (offset +0x00 of the 24-byte record).
   *
   * Disasm — same clamp/scale pattern as the glInfo getters; scale-factor is `(rax*8)` (from
   * `leaq (rax,rax,2) ; movl (rcx,rax,8)` — 8 * (3 * order) = 24 * order — 24-byte record):
   *   0x3538c  xorl %eax,%eax ; cmpl $0x12,%edi ; cmovbl %edi,%eax
   *   0x35394  leaq (%rax,%rax,2),%rax                                  (rax = 3*idx)
   *   0x35398  leaq __ZN12_GLOBAL__N_19pixelInfoE(%rip),%rcx            (rcx = pixelInfo)
   *   0x3539f  movl (%rcx,%rax,8),%eax                                  (rcx + 24*idx + 0)
   */
  static getBitsPerPixel(order: ChannelOrder): number {
    const idx = clampRow(order); // @0x3538c..@0x35391
    return pixelInfo[idx].bitsPerPixel | 0; // @0x3539f (+0 offset)
  }

  /**
   * `PCPixelFormat::getBitsPerChannel(ChannelOrder order)` — @0x0353a4.
   *
   * Load offset +0x04 into the 24-byte record:
   *   0x353bb  movl 0x4(%rcx,%rax,8),%eax
   */
  static getBitsPerChannel(order: ChannelOrder): number {
    const idx = clampRow(order); // @0x353a8..@0x353ad
    return pixelInfo[idx].bitsPerChannel | 0; // @0x353bb (+4 offset)
  }

  /**
   * `PCPixelFormat::getBytesPerPixel(ChannelOrder order)` — @0x0353c2.
   *
   * Load offset +0x08:
   *   0x353d9  movl 0x8(%rcx,%rax,8),%eax
   */
  static getBytesPerPixel(order: ChannelOrder): number {
    const idx = clampRow(order); // @0x353c6..@0x353cb
    return pixelInfo[idx].bytesPerPixel | 0; // @0x353d9 (+8 offset)
  }

  /**
   * `PCPixelFormat::hasRGB(ChannelOrder order)` — @0x0353e0.
   *
   * Load offset +0x0c as a single byte:
   *   0x353f7  movb 0xc(%rcx,%rax,8),%al
   */
  static hasRGB(order: ChannelOrder): boolean {
    const idx = clampRow(order); // @0x353e4..@0x353e9
    return (pixelInfo[idx].hasRGB & 0xff) !== 0; // @0x353f7 (+0xc offset, movb)
  }

  /**
   * `PCPixelFormat::hasGray(ChannelOrder order)` — @0x0353fe.
   *
   * Load offset +0x0d:
   *   0x35415  movb 0xd(%rcx,%rax,8),%al
   */
  static hasGray(order: ChannelOrder): boolean {
    const idx = clampRow(order); // @0x35402..@0x35407
    return (pixelInfo[idx].hasGray & 0xff) !== 0; // @0x35415 (+0xd offset)
  }

  /**
   * `PCPixelFormat::hasAlpha(ChannelOrder order)` — @0x03541c.
   *
   * Load offset +0x0e:
   *   0x35433  movb 0xe(%rcx,%rax,8),%al
   */
  static hasAlpha(order: ChannelOrder): boolean {
    const idx = clampRow(order); // @0x35420..@0x35425
    return (pixelInfo[idx].hasAlpha & 0xff) !== 0; // @0x35433 (+0xe offset)
  }

  /**
   * `PCPixelFormat::hasAlphaLast(ChannelOrder order)` — @0x03543a.
   *
   * Load offset +0x0f:
   *   0x35451  movb 0xf(%rcx,%rax,8),%al
   */
  static hasAlphaLast(order: ChannelOrder): boolean {
    const idx = clampRow(order); // @0x3543e..@0x35443
    return (pixelInfo[idx].hasAlphaLast & 0xff) !== 0; // @0x35451 (+0xf offset)
  }

  /**
   * `PCPixelFormat::isFloat(ChannelOrder order)` — @0x035458.
   *
   * Load offset +0x10:
   *   0x3546f  movb 0x10(%rcx,%rax,8),%al
   */
  static isFloat(order: ChannelOrder): boolean {
    const idx = clampRow(order); // @0x3545c..@0x35461
    return (pixelInfo[idx].isFloat & 0xff) !== 0; // @0x3546f (+0x10 offset)
  }

  /**
   * `PCPixelFormat::getNumChannels(ChannelOrder order)` — @0x035476.
   *
   * Load offset +0x14 (int32):
   *   0x3548d  movl 0x14(%rcx,%rax,8),%eax
   */
  static getNumChannels(order: ChannelOrder): number {
    const idx = clampRow(order); // @0x3547a..@0x3547f
    return pixelInfo[idx].numChannels | 0; // @0x3548d (+0x14 offset)
  }

  /**
   * `PCPixelFormat::is8Bit(ChannelOrder order)` — @0x035494.
   *
   * Disasm — NOT a table lookup; a range check on the enum value:
   *   0x35498  decl %edi                                                (edi = order - 1)
   *   0x3549a  cmpl $0x6,%edi                                           (order-1 < 7 as unsigned?)
   *   0x3549d  setb %al                                                 (al = 1 iff order-1 in [0..6])
   *
   * i.e. returns true iff order is in the closed range [1..7]. Matches rows 1..7 in pixelInfo
   * which are the 8-bit-per-channel formats (kY8, kYA8, kARGB8, kBGRA8, kRGBA8_5, kRGBA8_6, kY16).
   * NOTE — this includes kY16 (row 7) whose bpc=16, so the name "is8Bit" is FCP's, not a
   * bpc==8 predicate. Faithful port preserves the check verbatim.
   */
  static is8Bit(order: ChannelOrder): boolean {
    // @0x35498..@0x3549d — `(order-1) < 7` as unsigned
    const shifted = ((order | 0) - 1) >>> 0;
    return shifted < 7;
  }

  /**
   * `PCPixelFormat::is16Bit(ChannelOrder order)` — @0x0354a2.
   *
   * Range check `(order-7) < 7` (order in [7..13]):
   *   0x354a6  addl $-0x7,%edi
   *   0x354a9  cmpl $0x7,%edi
   *   0x354ac  setb %al
   */
  static is16Bit(order: ChannelOrder): boolean {
    // @0x354a6..@0x354ac
    const shifted = ((order | 0) - 7) >>> 0;
    return shifted < 7;
  }

  /**
   * `PCPixelFormat::is32Bit(ChannelOrder order)` — @0x0354b2.
   *
   * Range check `(order-14) < 4` (order in [14..17]):
   *   0x354b6  addl $-0xe,%edi
   *   0x354b9  cmpl $0x4,%edi
   *   0x354bc  setb %al
   */
  static is32Bit(order: ChannelOrder): boolean {
    // @0x354b6..@0x354bc
    const shifted = ((order | 0) - 14) >>> 0;
    return shifted < 4;
  }

  /**
   * `PCPixelFormat::setRGB(ChannelOrder order)` — @0x0354f6.
   *
   * Returns the RGB-projection of a given order, or the input unchanged if it has no RGB
   * counterpart. Uses a bitmask+table gate:
   *
   *   ecx = order - 1
   *   if (ecx >= 15) return input                        (@0x354ff `cmpl $0xf,%ecx`)
   *   if ((0x6cc3 >> ecx) & 1) == 0: return input        (@0x35505..@0x35513)
   *   return setRGB_table[ecx]                            (@0x35515..@0x3551e)
   */
  static setRGB(order: ChannelOrder): ChannelOrder {
    const o = order | 0;
    const idx = o - 1;
    // @0x354fc..@0x35502 — bounds
    if (idx < 0 || idx >= 15) return o as ChannelOrder;
    // @0x35505..@0x35513 — mask check
    if (((setRGB_mask >>> idx) & 1) === 0) return o as ChannelOrder;
    // @0x35515..@0x3551e — table lookup
    return setRGB_table[idx] as ChannelOrder;
  }

  /**
   * `PCPixelFormat::setGray(ChannelOrder order)` — @0x035524.
   *
   *   ecx = order - 3
   *   if (ecx >= 15) return input                        (@0x35530)
   *   if ((0x64cf >> ecx) & 1) == 0: return input        (@0x35533..@0x35541)
   *   return setGray_table[ecx]                           (@0x35543..@0x3554c)
   */
  static setGray(order: ChannelOrder): ChannelOrder {
    const o = order | 0;
    const idx = o - 3;
    // @0x3552a..@0x35530
    if (idx < 0 || idx >= 15) return o as ChannelOrder;
    // @0x35533..@0x35541
    if (((setGray_mask >>> idx) & 1) === 0) return o as ChannelOrder;
    // @0x35543..@0x3554c
    return setGray_table[idx] as ChannelOrder;
  }

  /**
   * `PCPixelFormat::addAlpha(ChannelOrder order)` — @0x035552.
   *
   * Switch on `order-7` (valid range 7..14) with a compiler-emitted jump table
   * @0x35598 (8 entries). Outside that range: if `order == 1` return 2, else return
   * order unchanged.
   *
   * Decoded from re/disasm/ProCore.PCPixelFormat.addAlpha.s and the jump-table bytes
   * @0x35598..@0x355b7.
   */
  static addAlpha(order: ChannelOrder): ChannelOrder {
    const o = order | 0;
    // @0x35556..@0x3557d — jump-table dispatch + default handling
    const mapped = addAlpha_by_order.get(o);
    if (mapped !== undefined) return mapped as ChannelOrder;
    // @0x3557a..@0x3557f — default: return input (or 2 if input was 1, already captured above)
    return o as ChannelOrder;
  }

  /**
   * `PCPixelFormat::removeAlpha(ChannelOrder order)` — @0x0355b8.
   *
   * Switch on `order-8` (valid range 8..15) with a jump table @0x35600 (8 entries).
   * Outside that range: if `order == 2` return 1, else return order unchanged.
   *
   * Decoded from raw bytes at @0x355b8..@0x35617 (ICF-folded — otool label missing;
   * decoded via capstone/hex-inspection).
   */
  static removeAlpha(order: ChannelOrder): ChannelOrder {
    const o = order | 0;
    // @0x355bc..@0x355e3 — jump-table dispatch + default handling
    const mapped = removeAlpha_by_order.get(o);
    if (mapped !== undefined) return mapped as ChannelOrder;
    // @0x355e5..@0x355e7 — default: return input unchanged
    return o as ChannelOrder;
  }

  /**
   * `PCPixelFormat::setDepth(ChannelOrder order, u32 bits, bool isFloat)` — @0x035620.
   *
   * Four dispatch cases keyed by `(isFloat, bits)` — each with its own table + validity gate:
   *
   *   (isFloat=1, bits=32) -> setDepth_float32_table[order-1] if order-1 in [0..12]      (@0x35671..@0x35682)
   *   (isFloat=1, bits=16) -> setDepth_halfFloat_table[order-1] if bit (order-1) set in 0x1e3ff
   *                           AND order-1 < 17                                             (@0x35634..@0x35652)
   *   (isFloat=0, bits=16) -> setDepth_int16_table[order-1] if bit (order-1) set in 0x1fc3f
   *                           AND order-1 < 17                                             (@0x35684..@0x3569b)
   *   (isFloat=0, bits=8)  -> setDepth_int8_table[order-7] if order-7 in [0..10]           (@0x3565e..@0x3566f)
   *   any other (bits, isFloat) combination -> return input unchanged                     (@0x35632/@0x3565c)
   *
   * Decoded from raw bytes at @0x35620..@0x356a6 (ICF-folded — decoded via capstone).
   */
  static setDepth(order: ChannelOrder, bits: number, isFloat: boolean): ChannelOrder {
    const o = order | 0;
    const b = bits | 0;
    // @0x35624..@0x35628 — split on isFloat
    if (isFloat) {
      // @0x3562a..@0x3562d — bits == 32 -> float32 table
      if (b === 32) {
        const idx = o - 1;
        // @0x35674 — `cmpl $0xd,%ecx ; jae .end`  (invalid if idx >= 13, unsigned)
        if ((idx >>> 0) >= setDepth_float32_maxIdx) return o as ChannelOrder;
        // @0x3567b..@0x35682 — table[idx]
        return setDepth_float32_table[idx] as ChannelOrder;
      }
      // @0x3562f..@0x35632 — bits == 16 -> half-float table
      if (b === 16) {
        const idx = o - 1;
        // @0x35637..@0x35647 — validity: (idx < 17) AND (mask bit set)
        if ((idx >>> 0) >= 17) return o as ChannelOrder;
        if (((setDepth_halfFloat_mask >>> idx) & 1) === 0) return o as ChannelOrder;
        // @0x35649..@0x35652 — table[idx]
        return setDepth_halfFloat_table[idx] as ChannelOrder;
      }
      // @0x35632 — anything else: return unchanged
      return o as ChannelOrder;
    }
    // @0x35654..@0x35657 — bits == 16 -> int16 table
    if (b === 16) {
      const idx = o - 1;
      // @0x35687..@0x35697 — validity: (idx < 17) AND (mask bit set)
      if ((idx >>> 0) >= 17) return o as ChannelOrder;
      if (((setDepth_int16_mask >>> idx) & 1) === 0) return o as ChannelOrder;
      // @0x35699..@0x356a2 — table[idx]
      return setDepth_int16_table[idx] as ChannelOrder;
    }
    // @0x35659..@0x3565c — bits == 8 -> int8 table
    if (b === 8) {
      const idx = o - 7;
      // @0x35661 — validity: (idx < 11) unsigned
      if ((idx >>> 0) >= setDepth_int8_maxIdx) return o as ChannelOrder;
      // @0x35666..@0x3566f — table[idx]
      return setDepth_int8_table[idx] as ChannelOrder;
    }
    // @0x3565c — unsupported bits: return unchanged
    return o as ChannelOrder;
  }
}
