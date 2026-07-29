// HGGamutMap — Helium gamut-mapping render-graph node. Framework: Helium.
//
// Symbols on Helium (x86_64 thin slice VA==offset):
//   __ZN10HGGamutMapC1Ev                            @0x1573d0  ctor complete   (tail-jmp to C2)
//   __ZN10HGGamutMapC2Ev                            @0x157430  ctor base-subobj (real body)
//   __ZN10HGGamutMapD0Ev                            @0x157550  deleting dtor
//   __ZN10HGGamutMapD1Ev                            @0x1574f0  base dtor
//   __ZN10HGGamutMapD2Ev                            @0x157490  base-subobj dtor
//   __ZN10HGGamutMap13SetConversionEP12CGColorSpaceS1_
//                                                    @0x1575c0  SetConversion(CGColorSpace*, CGColorSpace*)
//   __ZN10HGGamutMap13SetConversionEN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionENS0_30hgColorGammaMatrixCoefficientsES1_S2_S3_
//                                                    @0x157650  SetConversion(6× HGColorGamma enums)
//   __ZN10HGGamutMap13SetConversionEN14HGColorConform30hgColorConformConversionPresetE
//                                                    @0x1576d0  SetConversion(HGColorConform preset)
//   __ZN10HGGamutMap8SetSlopeEf                      @0x157740  SetSlope(float)
//   __ZN10HGGamutMap21DebugOutOfGamutColorsEb        @0x157750  DebugOutOfGamutColors(bool)
//   __ZN10HGGamutMap9GetOutputEP10HGRenderer         @0x157760  GetOutput(HGRenderer*)
//
// FAITHFUL PORT — every function cites @Helium 0xADDR. Undecoded frontier callees throw.
// Single-precision stores wrapped in Math.fround (Rule 4).

// ── STRUCT LAYOUT (recovered from HGGamutMap::HGGamutMap C2 @0x157430..0x15748a) ──────────────
//   Inherits from HGNode (HGNode::HGNode() called @0x157439). Fields observed:
//     +0x00   vptr slot                     (set to HGGamutMap vtable payload via
//                                            `leaq 0x8c8aeb(%rip),%rax; movq %rax,(%rbx)` @0x15743e
//                                            -> RIP-end=0x157445, disp=0x8c8aeb -> target=0xa1ff30)
//     +0x198  CGColorSpace* srcColorSpace   — set by SetConversion(CGColorSpace*,CGColorSpace*)
//                                            with CGColorSpaceRetain/Release balance. Init 0
//                                            (xorps+movups block @0x157464).
//     +0x1a0  CGColorSpace* dstColorSpace   — likewise. Init 0.
//     +0x1a8  u32 conversionKind            — 0 (nothing set), 1 (HGColorGamma variant), 8
//                                            (CGColorSpace* variant); or preset value from the
//                                            HGColorConform variant. Init 0 via the zero block.
//     +0x1ac  u32 srcColorPrimaries         — HGColorGamma::hgColorGammaColorPrimaries
//     +0x1b0  u32 dstColorPrimaries         — HGColorGamma::hgColorGammaColorPrimaries
//     +0x1b4  u32 srcTransferFunction       — HGColorGamma::hgColorGammaTransferFunction (also
//                                            reset to 8 by ctor's `movsd; movups %xmm0, 0x1b4`)
//     +0x1b8  u32 dstTransferFunction       — ctor stores 8 here too (from movsd upper zero-
//                                            extended path); SetConversion(CGColorSpace*) writes 8
//                                            here explicitly (`movq $0x8, 0x1b8(%rbx)` @0x157613).
//     +0x1bc  u32 srcMatrixCoefficients     — ctor 0 via movsd+movups upper-64 zeros.
//     +0x1c0  u32 dstMatrixCoefficients     — ctor 0.
//     +0x1c8  qword ptr  debug/hgcNode      — SetConversion doesn't touch it; ctor 0 @0x157448.
//                                            D0 checks & releases via vt[0x18] @0x157582..0x15758a.
//                                            GetOutput lazily creates an HgcGamutDebug when the
//                                            debug flag is on @0x157796..0x1577bc.
//     +0x1d0  f32   slope                   — set by SetSlope @0x157744. Init 0.0f @0x157453.
//     +0x1d4  u8    debugOutOfGamutColors   — set by DebugOutOfGamutColors @0x157754. Init 0
//                                            @0x15745d.

// ── seed constants (all Helium thin-slice VA==offset) ──────────────────────────────────────────
/** @const 0x85ab60  qword `08 00 00 00 08 00 00 00` = (u32 8, u32 8) — ctor `movsd 0x7036e3(%rip),%xmm0`
 *  @0x157475 (RIP-end=0x15747d, disp=0x7036e3 -> 0x85ab60). Because `movsd` zero-extends the upper
 *  64 bits of xmm0, the subsequent `movups %xmm0, 0x1b4(%rbx)` @0x15747d stores the packed pattern
 *  (u32=8, u32=8, u32=0, u32=0) into +0x1b4..+0x1c3, i.e. srcTransferFunction=8, dstTransferFunction=8,
 *  srcMatrixCoefficients=0, dstMatrixCoefficients=0. */
const CTOR_TRANSFER_MATRIX_DEFAULT: readonly [number, number, number, number] = [8, 8, 0, 0];

/** @const 0x85ab70  packed float4 = (0.0, 0.0, 0.0, u32 8)  read as raw 4×u32 = (0, 0, 0, 8)
 *  — SetConversion(CGColorSpace*) `movaps 0x70354b(%rip),%xmm0` @0x15761e (RIP-end=0x157625,
 *  disp=0x70354b -> 0x85ab70). Stored via `movups %xmm0, 0x1a8(%rbx)` @0x157625 into +0x1a8..+0x1b7,
 *  overwriting: conversionKind=0, srcColorPrimaries=0, dstColorPrimaries=0, srcTransferFunction=8.
 *  Then `movq $0x8, 0x1b8(%rbx)` @0x157613 sets +0x1b8=8 (dstTransferFunction=8), and
 *  `movl $0x0, 0x1c0(%rbx)` @0x15762c sets +0x1c0=0. (Note: `movq $0x8, +0x1b8` is 8 bytes wide so
 *  it also zeros +0x1bc — dstTransferFunction=8, srcMatrixCoefficients=0.) But wait: the assembler
 *  wrote conversionKind=0 first via the packed store — SetConversion(CGColorSpace*) clears the
 *  gamma spec entirely (kind=0 means "use raw CGColorSpace*, not gamma-derived"). */
const SETCONV_CG_PACK: readonly [number, number, number, number] = [0, 0, 0, 8];

/** @const 0x85ab80  packed float4 read as raw 4×u32 = (0, 0, 8, 8)
 *  — SetConversion(HGColorConform preset) `movaps 0x703461(%rip),%xmm0` @0x157718 (RIP-end=0x15771f,
 *  disp=0x703461 -> 0x85ab80). Stored via `movups %xmm0, 0x1ac(%rbx)` @0x15771f into
 *  +0x1ac..+0x1bb: srcColorPrimaries=0, dstColorPrimaries=0, srcTransferFunction=8, dstTransferFunction=8.
 *  Then `movq $0x0, 0x1bc(%rbx)` @0x157726 sets +0x1bc/+0x1c0 both to 0.
 *  (The kind at +0x1a8 is set separately just above from the preset arg — see method comment.) */
const SETCONV_PRESET_PACK: readonly [number, number, number, number] = [0, 0, 8, 8];

// ── opaque frontier types ──────────────────────────────────────────────────────────────────────
/** HGNode base — see HGNode.ts. Layout opaque here. */
export interface HGNode {
  /** vt[0x18] = HGObject::Release() — called by D0 @0x15758a and by GetOutput @0x1577b9. */
  Release(): void;
}
/** HGRenderer::GetInput(HGNode*, int) @Helium 0xf2dd0 — called by GetOutput @0x15777a with idx=0. */
export interface HGRenderer {
  GetInput(node: HGNode, idx: number): unknown;
}
/** CGColorSpace opaque handle (CoreGraphics). Managed via CGColorSpaceRetain/Release. */
export type CGColorSpace = unknown;
/** Opaque handle returned by HGRenderer::GetInput. */
export type HGImageRef = unknown;

// ── enum-like unions (mirror the HGColorGamma / HGColorConform enum namespaces) ────────────────
/** HGColorGamma::hgColorGammaColorPrimaries — opaque enum value (u32). */
export type HGColorGammaColorPrimaries = number;
/** HGColorGamma::hgColorGammaTransferFunction — opaque enum value (u32). Default 8 in ctor. */
export type HGColorGammaTransferFunction = number;
/** HGColorGamma::hgColorGammaMatrixCoefficients — opaque enum value (u32). */
export type HGColorGammaMatrixCoefficients = number;
/** HGColorConform::hgColorConformConversionPreset — opaque enum value (u32). */
export type HGColorConformConversionPreset = number;

// ── CoreGraphics stubs ─────────────────────────────────────────────────────────────────────────
/** _CGColorSpaceRelease @Helium stub 0x3c4b98 — CoreFoundation-style release. */
function CGColorSpaceRelease(_cs: CGColorSpace | null): void {
  throw new Error('_CGColorSpaceRelease @Helium stub 0x3c4b98 not yet transcribed (CoreGraphics)');
}
/** _CGColorSpaceRetain @Helium stub 0x3c4b9e — returns retained handle. */
function CGColorSpaceRetain(_cs: CGColorSpace): CGColorSpace {
  throw new Error('_CGColorSpaceRetain @Helium stub 0x3c4b9e not yet transcribed (CoreGraphics)');
}
/** HgcGamutDebug ctor @Helium __ZN13HgcGamutDebugC1Ev — invoked lazily by GetOutput @0x15779c
 *  when +0x1d4 (debug flag) is on. Frontier — port HgcGamutDebug.ts before this branch fires. */
function newHgcGamutDebug(): HGNode {
  throw new Error('HgcGamutDebug::HgcGamutDebug @Helium (callsite 0x15779c) not yet transcribed');
}

// ── the class ──────────────────────────────────────────────────────────────────────────────────
export class HGGamutMap implements HGNode {
  // +0x198
  private srcColorSpace: CGColorSpace | null = null;
  // +0x1a0
  private dstColorSpace: CGColorSpace | null = null;
  // +0x1a8  conversionKind (0=none, 1=HGColorGamma-configured, 8=CGColorSpace-configured, else=preset)
  private conversionKind: number = 0;
  // +0x1ac
  private srcColorPrimaries: HGColorGammaColorPrimaries = 0;
  // +0x1b0
  private dstColorPrimaries: HGColorGammaColorPrimaries = 0;
  // +0x1b4  — ctor init to 8 (u32 low half of CTOR_TRANSFER_MATRIX_DEFAULT)
  private srcTransferFunction: HGColorGammaTransferFunction = CTOR_TRANSFER_MATRIX_DEFAULT[0];
  // +0x1b8  — ctor init to 8 (u32 high half of CTOR_TRANSFER_MATRIX_DEFAULT)
  private dstTransferFunction: HGColorGammaTransferFunction = CTOR_TRANSFER_MATRIX_DEFAULT[1];
  // +0x1bc
  private srcMatrixCoefficients: HGColorGammaMatrixCoefficients = CTOR_TRANSFER_MATRIX_DEFAULT[2];
  // +0x1c0
  private dstMatrixCoefficients: HGColorGammaMatrixCoefficients = CTOR_TRANSFER_MATRIX_DEFAULT[3];
  // +0x1c8
  private debugNode: HGNode | null = null;
  // +0x1d0
  private slope: number = 0;
  // +0x1d4
  private debugOutOfGamut: boolean = false;

  /**
   * HGGamutMap::HGGamutMap() @Helium 0x1573d0 (C1) / 0x157430 (C2, real body).
   * Runs HGNode::HGNode() base ctor, installs vtable @0xa1ff30 at +0x00, zeros +0x1c8, +0x1d0,
   * +0x1d4, and zeros +0x198..+0x1b3 with two `movups %xmm0`. Then loads
   * CTOR_TRANSFER_MATRIX_DEFAULT (movsd @0x157475) and stores it packed at +0x1b4..+0x1c3.
   * All that is captured by field initializers above.
   */
  constructor() {
    // no additional body — all writes are in field initializers.
  }

  /**
   * HGGamutMap::~HGGamutMap() @Helium 0x157550 (D0 deleting), 0x1574f0 (D1), 0x157490 (D2).
   * D0 installs the base vptr (`leaq 0x8c89d0(%rip),%rax; movq %rax,(%rdi)` @0x157559
   * -> target=0xa1ff30), releases srcColorSpace/dstColorSpace via _CGColorSpaceRelease
   * @0x15756a/@0x157576, conditionally releases debugNode via vt[0x18] @0x157587..0x15758a
   * (only when +0x1c8 != null), then HGNode::~HGNode() @0x157590 and HGObject::operator delete
   * @0x15759e (tail-jump).
   */
  destroy(): void {
    // @0x15756a
    CGColorSpaceRelease(this.srcColorSpace);
    this.srcColorSpace = null;
    // @0x157576
    CGColorSpaceRelease(this.dstColorSpace);
    this.dstColorSpace = null;
    // @0x15757b..0x15758a: if (debugNode) debugNode->Release();
    if (this.debugNode !== null) {
      this.debugNode.Release();
      this.debugNode = null;
    }
    // HGNode::~HGNode() @0x157590 and delete @0x15759e — deferred to GC.
  }

  /** @vt-slot 0x18 (inherited from HGNode, HGGamutMap doesn't override). */
  Release(): void {
    throw new Error('HGNode::Release vt[0x18] @Helium (inherited by HGGamutMap, callsite 0x15758a) not yet transcribed');
  }

  /**
   * HGGamutMap::SetConversion(CGColorSpace* src, CGColorSpace* dst) @Helium 0x1575c0.
   *
   * Idempotent setter with CG retain/release balance:
   *   if (this->srcColorSpace != src) {
   *     CGColorSpaceRelease(this->srcColorSpace);
   *     this->srcColorSpace = CGColorSpaceRetain(src);
   *   }
   *   if (this->dstColorSpace != dst) {
   *     CGColorSpaceRelease(this->dstColorSpace);
   *     this->dstColorSpace = CGColorSpaceRetain(dst);
   *   }
   *   this->dstTransferFunction = 8;             // movq $0x8, 0x1b8 @0x157613
   *   [+0x1a8..+0x1b7] = SETCONV_CG_PACK;        // movups %xmm0, 0x1a8 @0x157625
   *   this->dstMatrixCoefficients = 0;           // movl $0x0, 0x1c0 @0x15762c
   *
   * Note: the packed store at +0x1a8 overrides the prior conversionKind and gamma-primaries
   * fields, meaning conversionKind is reset to 0 (the packed constant's first u32) — but the
   * intent is "use CGColorSpace pointers exclusively". The dstTransferFunction=8 write at +0x1b8
   * is technically redundant with the packed store's slot 4 (also 8), but the disasm does both
   * (dead-store-fold left as the compiler emitted it — a QWORD store BEFORE the movups, so the
   * movups actually overwrites the QWORD's high half. Compiler-preserved shape.).
   */
  SetConversionByColorSpace(src: CGColorSpace, dst: CGColorSpace): void {
    // @0x1575d7: cmpq %rdi(=srcColorSpace stored), %rsi(=src arg); je -> skip retain/release
    if (this.srcColorSpace !== src) {
      CGColorSpaceRelease(this.srcColorSpace);  // @0x1575df
      this.srcColorSpace = CGColorSpaceRetain(src);  // @0x1575e7..0x1575ec
    }
    // @0x1575fa
    if (this.dstColorSpace !== dst) {
      CGColorSpaceRelease(this.dstColorSpace);  // @0x1575ff
      this.dstColorSpace = CGColorSpaceRetain(dst);  // @0x157607..0x15760c
    }
    // @0x157613: movq $0x8, +0x1b8
    this.dstTransferFunction = 8;
    // @0x15761e..0x157625: movaps 0x85ab70; movups %xmm0, +0x1a8
    this.conversionKind = SETCONV_CG_PACK[0];
    this.srcColorPrimaries = SETCONV_CG_PACK[1];
    this.dstColorPrimaries = SETCONV_CG_PACK[2];
    this.srcTransferFunction = SETCONV_CG_PACK[3];
    // Note the QWORD dstTransferFunction=8 above is folded/overwritten by the packed store's
    // subsequent 8 bytes at +0x1b0..+0x1b7 (only +0x1b0..+0x1b7); +0x1b8..+0x1c7 keeps the
    // dstTransferFunction=8 QWORD-store's low 4 bytes (dstTransferFunction=8) and its high 4
    // bytes (which is srcMatrixCoefficients=0 — QWORD-writing 0x00000008 zero-extends). So
    // after all stores: dstTransferFunction=8, srcMatrixCoefficients=0.
    this.dstTransferFunction = 8;
    this.srcMatrixCoefficients = 0;
    // @0x15762c: movl $0x0, +0x1c0
    this.dstMatrixCoefficients = 0;
  }

  /**
   * HGGamutMap::SetConversion(6× HGColorGamma enums) @Helium 0x157650.
   *
   * Signature is (this, srcPrim, srcTF, srcMC, dstPrim, dstTF, dstMC) — SysV amd64 passes esi,
   * edx, ecx, r8d, r9d, then the 7th arg (dstMC) via stack at 0x10(%rbp) which is loaded to %eax.
   *
   *   this->conversionKind         = 1;                // @0x15765c: movl $1, +0x1a8
   *   this->srcColorPrimaries      = srcPrim;          // @0x157666: movl %esi, +0x1ac
   *   this->srcTransferFunction    = srcTF;            // @0x15766c: movl %edx, +0x1b4
   *   this->srcMatrixCoefficients  = srcMC;            // @0x157672: movl %ecx, +0x1bc
   *   this->dstColorPrimaries      = dstPrim;          // @0x157678: movl %r8d, +0x1b0
   *   this->dstTransferFunction    = dstTF;            // @0x15767f: movl %r9d, +0x1b8
   *   this->dstMatrixCoefficients  = dstMC;            // @0x157686: movl %eax, +0x1c0
   *   CGColorSpaceRelease(this->srcColorSpace);        // @0x157693
   *   this->srcColorSpace = null;                      // @0x157698
   *   CGColorSpaceRelease(this->dstColorSpace);        // @0x1576aa
   *   this->dstColorSpace = null;                      // @0x1576af
   */
  SetConversionByGamma(
    srcPrimaries: HGColorGammaColorPrimaries,
    srcTransfer: HGColorGammaTransferFunction,
    srcMatrix: HGColorGammaMatrixCoefficients,
    dstPrimaries: HGColorGammaColorPrimaries,
    dstTransfer: HGColorGammaTransferFunction,
    dstMatrix: HGColorGammaMatrixCoefficients,
  ): void {
    this.conversionKind = 1;                    // @0x15765c
    this.srcColorPrimaries = srcPrimaries;      // @0x157666
    this.srcTransferFunction = srcTransfer;     // @0x15766c
    this.srcMatrixCoefficients = srcMatrix;     // @0x157672
    this.dstColorPrimaries = dstPrimaries;      // @0x157678
    this.dstTransferFunction = dstTransfer;     // @0x15767f
    this.dstMatrixCoefficients = dstMatrix;     // @0x157686
    CGColorSpaceRelease(this.srcColorSpace);    // @0x157693
    this.srcColorSpace = null;                  // @0x157698
    CGColorSpaceRelease(this.dstColorSpace);    // @0x1576aa
    this.dstColorSpace = null;                  // @0x1576af
  }

  /**
   * HGGamutMap::SetConversion(HGColorConform preset) @Helium 0x1576d0.
   *
   *   uint32_t kind;
   *   if ((preset - 1) < 2) kind = 0; else kind = preset;   // @0x1576d9..0x1576e1
   *                                                          // (leal -1,%esi,%eax; cmp $2,%eax;
   *                                                          //  cmovae %esi,%ecx starting %ecx=0)
   *   this->conversionKind = kind;                           // @0x1576e4
   *   CGColorSpaceRelease(this->srcColorSpace);              // @0x1576f1
   *   this->srcColorSpace = null;                            // @0x1576f6
   *   CGColorSpaceRelease(this->dstColorSpace);              // @0x157708
   *   this->dstColorSpace = null;                            // @0x15770d
   *   [+0x1ac..+0x1bb] = SETCONV_PRESET_PACK;                // @0x157718..0x15771f
   *                                                           //   srcPrim=0, dstPrim=0,
   *                                                           //   srcTF=8, dstTF=8
   *   this->dstTransferFunction (aliased at +0x1bc as qword-0 target) = 0;
   *   this->srcMatrixCoefficients = 0;                       // via `movq $0x0, +0x1bc`
   *   this->dstMatrixCoefficients = 0;                       //   (QWORD zero @0x157726 clears
   *                                                           //   +0x1bc..+0x1c3)
   *
   * The `preset-1 < 2` idiom means presets 1 and 2 both collapse to conversionKind=0 (identity /
   * disabled); any other preset value flows through unchanged. This matches an FCP convention
   * where presets 1 and 2 are reserved "no conversion" sentinels.
   */
  SetConversionByPreset(preset: HGColorConformConversionPreset): void {
    // @0x1576d9..0x1576e1: kind = ((preset - 1) < 2) ? 0 : preset  (unsigned compare)
    const shifted = (preset - 1) >>> 0;
    const kind = shifted < 2 ? 0 : preset;
    this.conversionKind = kind;                                     // @0x1576e4
    CGColorSpaceRelease(this.srcColorSpace);                        // @0x1576f1
    this.srcColorSpace = null;                                      // @0x1576f6
    CGColorSpaceRelease(this.dstColorSpace);                        // @0x157708
    this.dstColorSpace = null;                                      // @0x15770d
    // @0x157718..0x15771f: movaps 0x85ab80; movups %xmm0, +0x1ac
    this.srcColorPrimaries = SETCONV_PRESET_PACK[0];
    this.dstColorPrimaries = SETCONV_PRESET_PACK[1];
    this.srcTransferFunction = SETCONV_PRESET_PACK[2];
    this.dstTransferFunction = SETCONV_PRESET_PACK[3];
    // @0x157726: movq $0x0, +0x1bc  — zero-writes 8 bytes at +0x1bc..+0x1c3
    this.srcMatrixCoefficients = 0;
    this.dstMatrixCoefficients = 0;
  }

  /**
   * HGGamutMap::SetSlope(float x) @Helium 0x157740.
   *   this->slope = x;    // @0x157744: movss %xmm0, +0x1d0(%rdi)
   * That's the entire body (prologue + epilogue only). No dedup / no ClearBits — a raw setter.
   */
  SetSlope(x: number): void {
    this.slope = Math.fround(x);  // @0x157744
  }

  /**
   * HGGamutMap::DebugOutOfGamutColors(bool b) @Helium 0x157750.
   *   this->debugOutOfGamut = b;   // @0x157754: movb %sil, +0x1d4(%rdi)
   * Raw byte setter — no side effects, no ClearBits.
   */
  DebugOutOfGamutColors(b: boolean): void {
    this.debugOutOfGamut = b;  // @0x157754
  }

  /**
   * HGGamutMap::GetOutput(HGRenderer* r) @Helium 0x157760.
   *
   * Structure (from raw-port/re/disasm/Helium.HGGamutMap.GetOutput.s @0x157760..0x1578??):
   *   1) `input = HGRenderer::GetInput(r, this, 0)`                   @0x15777a
   *   2) if `this->debugOutOfGamut == 1`  @0x157782..0x15778a
   *        - lazily construct an HgcGamutDebug node (new HGObject(0x1a0); HgcGamutDebug::HgcGamutDebug())
   *          @0x15778c..0x15779c
   *        - swap-release the old +0x1c8 debugNode via vt[0x18] and store the new one @0x1577a1..0x1577c3
   *        - `retval = debugNode` @0x1577c3; jump to a common tail @0x15788e/0x1578a3
   *   3) else branch @0x1577cb..: examines srcColorSpace / dstColorSpace / conversionKind to decide
   *      whether the transform is an identity (srcColorSpace == dstColorSpace && conversionKind == 0)
   *      -> return input pass-through; otherwise build an HgcGamutMap render node with the
   *      current parameters. Full transcription pending: HgcGamutMap / HgcColorGamma layouts and
   *      HGRenderer render-node cache API are undecoded frontiers.
   *
   * Returns the render-graph output image (an HGImageRef).
   */
  GetOutput(_r: HGRenderer): HGImageRef {
    // Only the debug-node lazy-alloc branch is fully decoded. Beyond that, we hit undecoded
    // frontier types — throw citing the specific unfinished callsites.
    if (this.debugOutOfGamut) {
      // The debug branch @0x15778c..0x1577c3
      const nd = newHgcGamutDebug();  // @0x15779c (constructs & returns a new HgcGamutDebug)
      // @0x1577a1..0x1577b9: swap-release old debugNode
      if (this.debugNode !== null && this.debugNode !== nd) {
        this.debugNode.Release();
      }
      this.debugNode = nd;
      // The tail past 0x1578a3 configures the debug node and returns it as the output image.
      throw new Error(
        'HGGamutMap::GetOutput debug-tail @Helium 0x1578a3 not yet transcribed ' +
        '(HgcGamutDebug config + HGRenderer output emission)',
      );
    }
    throw new Error(
      'HGGamutMap::GetOutput @Helium 0x157760 (non-debug branch @0x1577cb) not yet transcribed ' +
      '(needs HgcGamutMap render node + HGRenderer cache API)',
    );
  }
}
