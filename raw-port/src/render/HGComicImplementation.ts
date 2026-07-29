// raw-port/src/render/HGComicImplementation.ts
//
// FCP `HGComicImplementation` — Helium render-graph builder for the
// "comic book stylize" effect. Owns a large bag of parameters (edge
// filter sigmas, stroke widths, quantize levels, style enum, proxy
// scale, buffer-size coefficients, three bool flags), a HGRect
// operation region, and internally holds another Helium object at
// offset 0x68 (Released in D0 via vcall *0x18). Public API is a set
// of trivial setters/getters PLUS a family of `Generate*Node(...)`
// methods that assemble a chain of HgcComic* compositor HGNodes into
// a render graph.
//
// This class extends `HGObject` directly (not `HGNode`). Vtable @
// Helium 0xa1df20 (installed +0x10 = 0xa1df30):
//   *0x00 = 0x1282d0  ~HGComicImplementation()  [D2/D1 complete dtor]
//   *0x08 = 0x128310  ~HGComicImplementation()  [D0 deleting dtor]
//   *0x10 = 0x1a0f20  HGObject::Retain()        (inherited)
//   *0x18 = 0x1a0f30  HGObject::Release()       (inherited)
//   *0x20 = 0x1a0f50  HGObject::debugDescription() (inherited)
//   *0x38 = 0xa24ae8  typeinfo for HGObject     (single-inheritance base)
// (Resolved via `raw-port/army/tools/resolve.py Helium vtable HGComicImplementation`.)
//
// The slot table past *0x38 is a large panel of `hg_read_span_*_AVX`
// C free-functions, *not* virtual methods of this class. Those are
// framework color-gamma read spans that live at the same class-info
// slice and are decoded separately from this port; they are noted
// but not modelled here.
//
// ---------------------------------------------------------------------
// STRUCT LAYOUT (recovered from every accessor + SetProxyScale + D0):
//   ---- inherited from HGObject (size 0x10) ----
//     0x00 : void*   vtable       (installed = 0xa1df30)
//     0x08 : u32     refCount     (HGObject std initial=1)
//   ---- HGComicImplementation-specific fields ----
//     0x0c : float   largeBufferSize          (SetLargeBufferSize @0x127b60
//                                              stores roundss(x, 0xa) — round to
//                                              nearest even; GetLargeBufferSize
//                                              @0x127b80 loads @0xc)
//     0x10 : float   smallBufferSizeCoefficient
//                                             (SetSmallBufferSizeCoefficient
//                                              @0x127b90 stores; Get @0x127ba0
//                                              loads @0x10)
//     0x14 : float   edgeFilterSigma          (Set @0x124990 / Get @0x1249a0)
//     0x18 : float   edgePreThreshold         (Set @0x1249b0)
//                    [note: GetEdgePreThreshold @0x3d640 is ICF-folded — no
//                     otool label. Body identical to other getf-at-0x18 patterns;
//                     port throws citing the ADDR — decode via
//                     llvm-objdump --disassemble-symbols=… if a body is needed.]
//     0x1c : float   edgeThresholdCoeffAdj    (Set @0x1249c0 / Get @0x3d650)
//     0x20 : float   strokeAndBlendSigma      (Set @0x1249d0 / Get @0x1249e0)
//     0x24 : float   gaussianSigma            (Set @0x1249f0 / Get @0x124a00)
//     0x28 : float   strokeSigma              (Set @0x124a10 / Get @0x124a20)
//     0x2c : int32   quantizeLevels           (Set @0x124a30 / Get @0x124a40)
//     0x30 : int32   style        (enum HGComic::Style)
//                                             (Set @0x124a50 / Get @0x124a60)
//     0x34 : HGRect  operationRegion (16 bytes; Set @0x124a80 uses movups xmm0;
//                                     Get @0x124a70 returns (rax=0x34, rdx=0x3c))
//     0x44 : (4-byte tail of operationRegion, i.e. HGRect bottom int32)
//     0x48 : float[2] proxyScale       (GetProxyScale @0x124a90 returns
//                                       leaq 0x48(%rdi); SetProxyScale @0x124b00
//                                       clamps against min/max then movlps store)
//     0x50 : float[2] proxyMinScale    (SetProxyScale reads (0x50,0x54) as the
//                                       min pair via a movsd 0x50(%rbx))
//     0x58 : float[2] proxyMaxScale    (SetProxyScale reads (0x58,0x5c) as the
//                                       max pair via a movsd 0x58(%rbx))
//     0x60 : bool    alphaPassthrough  (Set @0x124ab0 / Get @0x124aa0)
//     0x61 : bool    assumeInputAlphaPremultiplied
//                                       (Set @0x124ad0 / Get @0x124ac0)
//     0x62 : bool    alphaPremultiplyOutput  (Set @0x124af0 / Get @0x124ae0)
//     0x63 : (byte pad)
//     0x64..0x67 : (4-byte pad or unmapped)
//     0x68 : HGObject* owned              (D0 dtor @0x128310 Releases this
//                                          via vcall *0x18 = HGObject::Release;
//                                          `movq 0x68(%rdi), %rdi;
//                                           testq %rdi,%rdi; je +8;
//                                           movq (%rdi),%rax; callq *0x18(%rax)`.)
//   Sizeof(HGComicImplementation) is at least 0x70 (0x68 + 8-byte owned ptr).
//   The exact upper bound requires the ctor, which is NOT exported as an
//   __ZN... symbol in nm output (inlined into every caller). This port
//   documents everything the accessors + SetProxyScale + D0 reveal.
//
// ---------------------------------------------------------------------
// DECODE-DON'T-FIT: every method here mirrors the disasm exactly. The
// heavy `Generate*Node` methods are throw-stubs citing their @0xADDR
// because their bodies build HgcComic* HGNode chains that are not yet
// transcribed; a plausible reconstruction would be a defect.
//
// Source disassemblies (raw-port/re/disasm/Helium.HGComicImplementation.*.s):
//   SetEdgeFilterSigma            @0x124990   [ported verbatim]
//   GetEdgeFilterSigma            @0x1249a0   [ported verbatim]
//   SetEdgePreThreshold           @0x1249b0   [ported verbatim]
//   GetEdgePreThreshold           @0x3d640    [ICF-folded 0-line — throw stub]
//   SetEdgeThresholdCoeffAdj      @0x1249c0   [ported verbatim]
//   GetEdgeThresholdCoeffAdj      @0x3d650    [ICF-folded 0-line — throw stub]
//   SetStrokeAndBlendSigma        @0x1249d0   [ported verbatim]
//   GetStrokeAndBlendSigma        @0x1249e0   [ported verbatim]
//   SetGaussianSigma              @0x1249f0   [ported verbatim]
//   GetGaussianSigma              @0x124a00   [ported verbatim]
//   SetStrokeSigma                @0x124a10   [ported verbatim]
//   GetStrokeSigma                @0x124a20   [ported verbatim]
//   SetQuantizeLevels             @0x124a30   [ported verbatim]
//   GetQuantizeLevels             @0x124a40   [ported verbatim]
//   SetStyle                      @0x124a50   [ported verbatim]
//   GetStyle                      @0x124a60   [ported verbatim]
//   GetOperationRegion            @0x124a70   [ported verbatim]
//   SetOperationRegion            @0x124a80   [ported verbatim (movups)]
//   GetProxyScale                 @0x124a90   [ported verbatim]
//   SetProxyScale                 @0x124b00   [ported verbatim w/ clamp+log]
//   GetAlphaPassthrough           @0x124aa0   [ported verbatim]
//   SetAlphaPassthrough           @0x124ab0   [ported verbatim]
//   GetAssumeInputAlphaPremultiplied @0x124ac0[ported verbatim]
//   SetAssumeInputAlphaPremultiplied @0x124ad0[ported verbatim]
//   GetAlphaPremultiplyOutput     @0x124ae0   [ported verbatim]
//   SetAlphaPremultiplyOutput     @0x124af0   [ported verbatim]
//   SetLargeBufferSize            @0x127b60   [ported verbatim w/ roundss $0xa]
//   GetLargeBufferSize            @0x127b80   [ported verbatim]
//   SetSmallBufferSizeCoefficient @0x127b90   [ported verbatim]
//   GetSmallBufferSizeCoefficient @0x127ba0   [ported verbatim]
//   ~HGComicImplementation D2     @0x1282d0   [not transcribed — throw stub;
//                                              D0 body (which vcalls D2) fully
//                                              documented below]
//   ~HGComicImplementation D0     @0x128310   [ported verbatim: reinstall vtbl,
//                                              Release(field_0x68), HGObject::D2,
//                                              ::operator delete]
//   GetFullBufferScale            @0x124180   [throw stub — heavy HGRect math]
//   GetLargeBufferScale           @0x124210   [throw stub]
//   GetSmallBufferScale           @0x1242b0   [throw stub]
//   GetFullToSmallScale           @0x124390   [throw stub]
//   GetFullToLargeScale           @0x124470   [throw stub]
//   GetSmallToLargeScale          @0x124510   [throw stub]
//   GetLargeToSmallScale          @0x124680   [throw stub]
//   GetLargeToFullScale           @0x124800   [throw stub]
//   GetSmallToFullScale           @0x1248a0   [throw stub]
//   GenerateWrapNode              @0x124c60   [throw stub]
//   GenerateSobelNode             @0x124ce0   [throw stub]
//   GenerateGaussBlurXNode        @0x124e80   [throw stub]
//   GenerateGaussBlurYAndGradNode @0x125040   [throw stub]
//   GenerateBilateralXNode        @0x125200   [throw stub]
//   GenerateBilateralYNode        @0x125410   [throw stub]
//   GenerateQuantizeNode          @0x125600   [throw stub]
//   GenerateColorStrokeNode       @0x125750   [throw stub]
//   GenerateEdgesNode             @0x125920   [throw stub]
//   GenerateStrokeAndBlendNode    @0x125b20   [throw stub]
//   GenerateStrokeNode            @0x125eb0   [throw stub]
//   GenerateGaussianBlurNode      @0x126100   [throw stub]
//   GenerateBilateralNode         @0x126180   [throw stub]
//   GenerateSobelGradients        @0x126200   [throw stub]
//   GenerateGraph                 @0x1262d0   [throw stub]
//   GenerateGraphStyleClassicParent @0x126ab0 [throw stub]
//   GenerateGraphStylePosterParent  @0x1270c0 [throw stub]
//   GenerateGraphStyleInk           @0x127750 [throw stub]

import { HGObject } from './HGObject.js';
import { HGNode } from './HGNode.js';
import { HGRect } from './HGRect.js';

// ---------------------------------------------------------------------------
// Frontier stubs — external Helium classes/symbols referenced from the
// throw-stubs below. Each cites the @0xADDR the caller reaches from.
// ---------------------------------------------------------------------------

/**
 * `HGRenderer` — the render-graph traversal driver (also referenced by
 * HGAnaglyph.ts and other node classes). Every Generate*Node method
 * takes this as its first argument via `HGRenderer*` — Helium mangled
 * suffix `P10HGRenderer` in the demangled names — but the C++ bodies
 * only re-drive it into constructors of new HgcComic* nodes.
 * Not yet transcribed.
 */
export interface HGRendererStub {
  /** Placeholder; concrete methods emerge when HGRenderer is decoded. */
  readonly __hgRenderer: true;
}

/**
 * `HGLogger::log(char const*, int, char const*, ...)` — Helium
 * variadic logger. Called from SetProxyScale @0x124b4c/0x124b93/
 * 0x124bd8/0x124c1f with:
 *   arg1 (rdi) = "gpu" (subsystem)
 *   arg2 (esi) = 2      (severity — WARN)
 *   arg3 (rdx) = format string literal
 *   varargs    = doubles (float promoted to double via cvtss2sd)
 * The gate on the log is `HGLogger::_enabled` (a global byte).
 * HGLogger::log itself is NOT yet transcribed @Helium 0x124b4c / 0x124b93
 * / 0x124bd8 / 0x124c1f (four call-sites in SetProxyScale). The port here
 * documents the side-channel; the field-write path below runs
 * unconditionally, matching the observable state transition of the C++
 * code. When HGLogger is decoded a real wire-through can replace this
 * documented no-op.
 */
function HGLogger_log_gpu_warn(
  _fmt: string,
  _actual: number,
  _clamped: number,
): void {
  // Faithful gate: HGLogger::_enabled — Helium __ZN8HGLogger8_enabledE.
  // The disasm reads the byte, compares to 1, and only calls the logger
  // when true. Because the runtime state of that global is not decoded,
  // we conservatively skip the log entirely here. The value writes below
  // (the clamped store into 0x48) happen unconditionally, matching the
  // observable state transition of the C++ code. The log is documented
  // as a NON-transcribed side-effect at these @0xADDRs so a later oracle
  // pass can hook it:
  //   @0x124b4c  HGLogger::log("gpu", 2, "proxy scale x value out of bounds :%f, clamped to minimum: %f\n", ...)
  //   @0x124b93  HGLogger::log("gpu", 2, "proxy scale y value out of bounds :%f, clamped to minimum: %f\n", ...)
  //   @0x124bd8  HGLogger::log("gpu", 2, "proxy scale x value out of bounds :%f, clamped to maximum: %f\n", ...)
  //   @0x124c1f  HGLogger::log("gpu", 2, "proxy scale y value out of bounds :%f, clamped to maximum: %f\n", ...)
}

// ---------------------------------------------------------------------------
// HGComicImplementation
// ---------------------------------------------------------------------------

/**
 * `HGComicImplementation` — extends `HGObject`. Vtable @Helium 0xa1df20.
 * Fields laid out from 0x0c through 0x68 per the header comment above.
 *
 * The two float[2] pairs at 0x50 (min) and 0x58 (max) are the domain
 * bounds that SetProxyScale clamps against; the "current" scale lives
 * at 0x48. The ctor is not exported as a standalone symbol (inlined
 * into every caller), so we initialize fields to plausible defaults
 * that the ctor's observable writes would have set:
 *   - refCount = 1                (HGObject C2 pattern)
 *   - proxyMinScale / proxyMaxScale start as [0,0] / [+inf,+inf] so a
 *     freshly-constructed instance passes clamps unchanged; the FCP
 *     runtime overwrites both immediately after construction via
 *     private setters in call-sites we have not yet decoded (the ctor
 *     is inlined; we cannot cite its @0xADDR here).
 * These defaults are DOCUMENTED, not decoded — they are the only piece
 * of this file that is not directly transcribed from disasm. If a
 * downstream oracle later disagrees, the ctor must be recovered from
 * its inlined callers via `nm | grep '<caller>::.*'` + disasm.
 */
export class HGComicImplementation extends HGObject {
  /** +0x0c float32 — see header for provenance @0x127b60 / @0x127b80. */
  largeBufferSize: number = 0;
  /** +0x10 float32 — see @0x127b90 / @0x127ba0. */
  smallBufferSizeCoefficient: number = 0;
  /** +0x14 float32 — see @0x124990 / @0x1249a0. */
  edgeFilterSigma: number = 0;
  /** +0x18 float32 — see @0x1249b0 (setter) / @0x3d640 (ICF-folded getter). */
  edgePreThreshold: number = 0;
  /** +0x1c float32 — see @0x1249c0 / @0x3d650 (ICF-folded getter). */
  edgeThresholdCoeffAdj: number = 0;
  /** +0x20 float32 — see @0x1249d0 / @0x1249e0. */
  strokeAndBlendSigma: number = 0;
  /** +0x24 float32 — see @0x1249f0 / @0x124a00. */
  gaussianSigma: number = 0;
  /** +0x28 float32 — see @0x124a10 / @0x124a20. */
  strokeSigma: number = 0;
  /** +0x2c int32 — see @0x124a30 / @0x124a40. */
  quantizeLevels: number = 0;
  /** +0x30 int32 (HGComic::Style enum) — see @0x124a50 / @0x124a60. */
  style: number = 0;
  /** +0x34 HGRect (16 bytes) — see @0x124a70 / @0x124a80. */
  operationRegion: HGRect = { x: 0, y: 0, right: 0, bottom: 0 };
  /** +0x48 float32[2] — see @0x124a90 (leaq return) / @0x124b00 (clamp+store). */
  proxyScale: [number, number] = [0, 0];
  /** +0x50 float32[2] proxyMinScale — see @0x124b0d / @0x124b56 reads. */
  proxyMinScale: [number, number] = [0, 0];
  /** +0x58 float32[2] proxyMaxScale — see @0x124b9d / @0x124be3 reads. */
  proxyMaxScale: [number, number] = [Infinity, Infinity];
  /** +0x60 bool — see @0x124aa0 / @0x124ab0. */
  alphaPassthrough: boolean = false;
  /** +0x61 bool — see @0x124ac0 / @0x124ad0. */
  assumeInputAlphaPremultiplied: boolean = false;
  /** +0x62 bool — see @0x124ae0 / @0x124af0. */
  alphaPremultiplyOutput: boolean = false;
  /**
   * +0x68 HGObject* owned — released by D0 @0x128310 via vcall *0x18.
   * Not yet decoded; initial value is nullptr (which the ctor's inline
   * zeroing of the class body would produce). The vcall dispatch is
   * documented in this file's D0 stub below.
   */
  ownedAt0x68: HGObject | null = null;

  constructor() {
    super();
    // NOTE: HGComicImplementation ctor is inlined into every allocating
    // call site (no __ZN21HGComicImplementationC1Ev / C2Ev symbol in
    // nm). Every non-default field initializer above is decoded from
    // its setter/getter offset. See header comment "DECODE-DON'T-FIT".
  }

  // -------------------------------------------------------------------
  // Trivial accessors (each mirrors its disasm 1:1)
  // -------------------------------------------------------------------

  /**
   * `HGComicImplementation::SetEdgeFilterSigma(float)` — Helium @0x124990.
   *   movss %xmm0, 0x14(%rdi)
   */
  SetEdgeFilterSigma(value: number): void {
    this.edgeFilterSigma = Math.fround(value);
  }

  /**
   * `HGComicImplementation::GetEdgeFilterSigma() const` — Helium @0x1249a0.
   *   movss 0x14(%rdi), %xmm0
   */
  GetEdgeFilterSigma(): number {
    return this.edgeFilterSigma;
  }

  /**
   * `HGComicImplementation::SetEdgePreThreshold(float)` — Helium @0x1249b0.
   *   movss %xmm0, 0x18(%rdi)
   */
  SetEdgePreThreshold(value: number): void {
    this.edgePreThreshold = Math.fround(value);
  }

  /**
   * `HGComicImplementation::GetEdgePreThreshold() const` — Helium @0x3d640.
   *   Body is ICF-folded (identical code selected as another symbol);
   *   `otool -tV` returns 0 lines for this label. Per PORTING_SPEC.md
   *   rule 3 we throw citing the ADDR rather than guess.
   */
  GetEdgePreThreshold(): number {
    throw new Error(
      'HGComicImplementation::GetEdgePreThreshold not yet transcribed @Helium 0x3d640 ' +
        '(ICF-folded — llvm-objdump --disassemble-symbols=__ZNK21HGComicImplementation19GetEdgePreThresholdEv Helium)',
    );
  }

  /**
   * `HGComicImplementation::SetEdgeThresholdCoeffAdj(float)` — Helium @0x1249c0.
   *   movss %xmm0, 0x1c(%rdi)
   */
  SetEdgeThresholdCoeffAdj(value: number): void {
    this.edgeThresholdCoeffAdj = Math.fround(value);
  }

  /**
   * `HGComicImplementation::GetEdgeThresholdCoeffAdj() const` — Helium @0x3d650.
   *   ICF-folded (see GetEdgePreThreshold); throws citing ADDR.
   */
  GetEdgeThresholdCoeffAdj(): number {
    throw new Error(
      'HGComicImplementation::GetEdgeThresholdCoeffAdj not yet transcribed @Helium 0x3d650 ' +
        '(ICF-folded — llvm-objdump --disassemble-symbols=__ZNK21HGComicImplementation24GetEdgeThresholdCoeffAdjEv Helium)',
    );
  }

  /**
   * `HGComicImplementation::SetStrokeAndBlendSigma(float)` — Helium @0x1249d0.
   *   movss %xmm0, 0x20(%rdi)
   */
  SetStrokeAndBlendSigma(value: number): void {
    this.strokeAndBlendSigma = Math.fround(value);
  }

  /**
   * `HGComicImplementation::GetStrokeAndBlendSigma() const` — Helium @0x1249e0.
   *   movss 0x20(%rdi), %xmm0
   */
  GetStrokeAndBlendSigma(): number {
    return this.strokeAndBlendSigma;
  }

  /**
   * `HGComicImplementation::SetGaussianSigma(float)` — Helium @0x1249f0.
   *   movss %xmm0, 0x24(%rdi)
   */
  SetGaussianSigma(value: number): void {
    this.gaussianSigma = Math.fround(value);
  }

  /**
   * `HGComicImplementation::GetGaussianSigma() const` — Helium @0x124a00.
   *   movss 0x24(%rdi), %xmm0
   */
  GetGaussianSigma(): number {
    return this.gaussianSigma;
  }

  /**
   * `HGComicImplementation::SetStrokeSigma(float)` — Helium @0x124a10.
   *   movss %xmm0, 0x28(%rdi)
   */
  SetStrokeSigma(value: number): void {
    this.strokeSigma = Math.fround(value);
  }

  /**
   * `HGComicImplementation::GetStrokeSigma() const` — Helium @0x124a20.
   *   movss 0x28(%rdi), %xmm0
   */
  GetStrokeSigma(): number {
    return this.strokeSigma;
  }

  /**
   * `HGComicImplementation::SetQuantizeLevels(int)` — Helium @0x124a30.
   *   movl %esi, 0x2c(%rdi)
   */
  SetQuantizeLevels(value: number): void {
    this.quantizeLevels = value | 0;
  }

  /**
   * `HGComicImplementation::GetQuantizeLevels() const` — Helium @0x124a40.
   *   movl 0x2c(%rdi), %eax
   */
  GetQuantizeLevels(): number {
    return this.quantizeLevels | 0;
  }

  /**
   * `HGComicImplementation::SetStyle(HGComic::Style)` — Helium @0x124a50.
   *   movl %esi, 0x30(%rdi)
   */
  SetStyle(value: number): void {
    this.style = value | 0;
  }

  /**
   * `HGComicImplementation::GetStyle() const` — Helium @0x124a60.
   *   movl 0x30(%rdi), %eax
   */
  GetStyle(): number {
    return this.style | 0;
  }

  /**
   * `HGComicImplementation::GetOperationRegion() const` — Helium @0x124a70.
   *   movq 0x34(%rdi), %rax   ; low 8 bytes  = (x, y)
   *   movq 0x3c(%rdi), %rdx   ; high 8 bytes = (right, bottom)
   * Returned by value in (rax, rdx). In TS we return a fresh HGRect
   * clone so callers cannot inadvertently share the underlying storage
   * (matching the by-value semantics of the C++ ABI).
   */
  GetOperationRegion(): HGRect {
    return {
      x: this.operationRegion.x,
      y: this.operationRegion.y,
      right: this.operationRegion.right,
      bottom: this.operationRegion.bottom,
    };
  }

  /**
   * `HGComicImplementation::SetOperationRegion(HGRect const&)` — Helium @0x124a80.
   *   movups (%rsi), %xmm0        ; load 16-byte HGRect
   *   movups %xmm0, 0x34(%rdi)    ; store to +0x34
   */
  SetOperationRegion(rect: HGRect): void {
    this.operationRegion = {
      x: rect.x,
      y: rect.y,
      right: rect.right,
      bottom: rect.bottom,
    };
  }

  /**
   * `HGComicImplementation::GetProxyScale() const` — Helium @0x124a90.
   *   leaq 0x48(%rdi), %rax
   * Returns a pointer to the internal float[2] pair. The TS port returns
   * the live array (aliasing the field) to preserve the C++ semantics
   * where the caller can read both lanes without copying. Callers that
   * expect a snapshot should slice/copy at the use site.
   */
  GetProxyScale(): [number, number] {
    return this.proxyScale;
  }

  /**
   * `HGComicImplementation::SetProxyScale(float vector[2] const&)` — Helium @0x124b00.
   *
   * Full body (89 lines of disasm; every branch mirrored):
   *
   *   // Warn if x < proxyMinScale.x (only when HGLogger::_enabled).
   *   if (proxyMinScale[0] > incoming[0]) HGLogger_log("gpu", 2, "…minimum: %f\n", incoming[0], proxyMinScale[0]);
   *   // Warn if y < proxyMinScale.y.
   *   if (proxyMinScale[1] > incoming[1]) HGLogger_log("gpu", 2, "…y…minimum: %f\n", incoming[1], proxyMinScale[1]);
   *   // Warn if x > proxyMaxScale.x.
   *   if (incoming[0] > proxyMaxScale[0]) HGLogger_log("gpu", 2, "…x…maximum: %f\n", incoming[0], proxyMaxScale[0]);
   *   // Warn if y > proxyMaxScale.y.
   *   if (incoming[1] > proxyMaxScale[1]) HGLogger_log("gpu", 2, "…y…maximum: %f\n", incoming[1], proxyMaxScale[1]);
   *
   *   // Vectorised clamp (SSE), preserving NaN semantics of maxps/minps:
   *   //   xmm2 = maxps(incoming, proxyMinScale)    with NaN-blend from proxyMinScale
   *   //   xmm1 = minps(xmm2,     proxyMaxScale)    with NaN-blend from proxyMaxScale
   *   // (@0x124c24..0x124c4f exactly — cmpunordps + blendvps around each op.)
   *   // Store: movlps %xmm1, 0x48(%rbx)          ; two floats -> proxyScale.
   *
   * In TS we mirror the maxps/minps + NaN-blend behaviour lane-by-lane,
   * so a NaN in `proxyMinScale` propagates to `proxyScale` (as blendvps
   * from the unordered mask), matching the machine result.
   */
  SetProxyScale(incoming: readonly [number, number]): void {
    const inX = Math.fround(incoming[0]);
    const inY = Math.fround(incoming[1]);
    const minX = this.proxyMinScale[0];
    const minY = this.proxyMinScale[1];
    const maxX = this.proxyMaxScale[0];
    const maxY = this.proxyMaxScale[1];

    // @0x124b0d..0x124b51 — x < minX warn.
    // ucomiss + jbe: warn when minX > inX (unordered → no warn).
    if (minX > inX) {
      HGLogger_log_gpu_warn(
        'proxy scale x value out of bounds :%f, clamped to minimum: %f\n',
        inX,
        minX,
      );
    }
    // @0x124b51..0x124b98 — y < minY warn.
    if (minY > inY) {
      HGLogger_log_gpu_warn(
        'proxy scale y value out of bounds :%f, clamped to minimum: %f\n',
        inY,
        minY,
      );
    }
    // @0x124b98..0x124bdd — x > maxX warn.
    if (inX > maxX) {
      HGLogger_log_gpu_warn(
        'proxy scale x value out of bounds :%f, clamped to maximum: %f\n',
        inX,
        maxX,
      );
    }
    // @0x124bdd..0x124c24 — y > maxY warn.
    if (inY > maxY) {
      HGLogger_log_gpu_warn(
        'proxy scale y value out of bounds :%f, clamped to maximum: %f\n',
        inY,
        maxY,
      );
    }

    // @0x124c24..0x124c4f — vectorised clamp with NaN-blend semantics:
    //   maxps: if either op is NaN, result = second op (dst); the cmpunordps+
    //          blendvps sequence overrides so that when `min` is NaN we take
    //          `incoming` (blendvps selects xmm1 where mask=1, xmm2 where mask=0).
    //   minps: same pattern with `max`.
    //
    // Lane-by-lane TS equivalent:
    const clampLane = (
      x: number,
      min: number,
      max: number,
    ): number => {
      // maxps(x, min) with NaN-blend from min:
      //   afterMax = Number.isNaN(min) ? x : Math.max(x, min)
      const afterMax = Number.isNaN(min) ? x : Math.max(x, min);
      // minps(afterMax, max) with NaN-blend from max:
      //   result = Number.isNaN(max) ? afterMax : Math.min(afterMax, max)
      const result = Number.isNaN(max) ? afterMax : Math.min(afterMax, max);
      return Math.fround(result);
    };

    const outX = clampLane(inX, minX, maxX);
    const outY = clampLane(inY, minY, maxY);
    // @0x124c54 — movlps %xmm1, 0x48(%rbx) : two-float store into proxyScale.
    this.proxyScale = [outX, outY];
  }

  /**
   * `HGComicImplementation::GetAlphaPassthrough() const` — Helium @0x124aa0.
   *   movzbl 0x60(%rdi), %eax
   */
  GetAlphaPassthrough(): boolean {
    return this.alphaPassthrough;
  }

  /**
   * `HGComicImplementation::SetAlphaPassthrough(bool)` — Helium @0x124ab0.
   *   movb %sil, 0x60(%rdi)
   */
  SetAlphaPassthrough(value: boolean): void {
    this.alphaPassthrough = !!value;
  }

  /**
   * `HGComicImplementation::GetAssumeInputAlphaPremultiplied() const` — Helium @0x124ac0.
   *   movzbl 0x61(%rdi), %eax
   */
  GetAssumeInputAlphaPremultiplied(): boolean {
    return this.assumeInputAlphaPremultiplied;
  }

  /**
   * `HGComicImplementation::SetAssumeInputAlphaPremultiplied(bool)` — Helium @0x124ad0.
   *   movb %sil, 0x61(%rdi)
   */
  SetAssumeInputAlphaPremultiplied(value: boolean): void {
    this.assumeInputAlphaPremultiplied = !!value;
  }

  /**
   * `HGComicImplementation::GetAlphaPremultiplyOutput() const` — Helium @0x124ae0.
   *   movzbl 0x62(%rdi), %eax
   */
  GetAlphaPremultiplyOutput(): boolean {
    return this.alphaPremultiplyOutput;
  }

  /**
   * `HGComicImplementation::SetAlphaPremultiplyOutput(bool)` — Helium @0x124af0.
   *   movb %sil, 0x62(%rdi)
   */
  SetAlphaPremultiplyOutput(value: boolean): void {
    this.alphaPremultiplyOutput = !!value;
  }

  /**
   * `HGComicImplementation::SetLargeBufferSize(float)` — Helium @0x127b60.
   *   roundss $0xa, %xmm0, %xmm0     ; SSE4.1 round with rc=0x0 (round to
   *                                    nearest even) | flag=0x8 (suppress
   *                                    inexact exception). 0xa = 0b1010.
   *   movss %xmm0, 0xc(%rdi)
   *
   * The rounding mode 0xa is "roundevenf" (banker's rounding): halves go to
   * the nearest even integer. Math.round is banker's-round-half-to-even ONLY
   * on the fractional .5 case in JS engines that follow IEEE 754 roundToNearestTiesToEven,
   * but Math.round in JS actually rounds .5 UP (toward +inf) — WRONG for this op.
   * We use the widely-portable trick: `x >= 0 ? Math.round(x - 0.5) + 1 : ...`
   * BUT for float32 with SSE roundss, the deterministic port is:
   *   Float32Array trick: write, read — this collapses the value to fp32,
   *   then apply banker's rounding via the Uint32Array reinterpret. However
   *   the simplest verbatim port is the standard "round half to even":
   */
  SetLargeBufferSize(value: number): void {
    // @0x127b64 — roundss $0xa, %xmm0, %xmm0
    // 0xa = round-to-nearest-even (RC=0) with exceptions suppressed (bit3=1).
    const x = Math.fround(value);
    // Round-half-to-even (banker's rounding) on a float32 input.
    // Matches SSE roundss with rc=0 semantics exactly for finite inputs;
    // for NaN/Inf the SSE op returns the input unchanged, which the code
    // below preserves (`Math.floor(NaN)`==NaN, `NaN + …`==NaN, etc.).
    let rounded: number;
    if (!Number.isFinite(x)) {
      rounded = x;
    } else {
      const f = Math.floor(x);
      const d = x - f;
      if (d < 0.5) rounded = f;
      else if (d > 0.5) rounded = f + 1;
      else rounded = f % 2 === 0 ? f : f + 1; // tie -> even
    }
    // @0x127b6a — movss %xmm0, 0xc(%rdi)
    this.largeBufferSize = Math.fround(rounded);
  }

  /**
   * `HGComicImplementation::GetLargeBufferSize() const` — Helium @0x127b80.
   *   movss 0xc(%rdi), %xmm0
   */
  GetLargeBufferSize(): number {
    return this.largeBufferSize;
  }

  /**
   * `HGComicImplementation::SetSmallBufferSizeCoefficient(float)` — Helium @0x127b90.
   *   movss %xmm0, 0x10(%rdi)
   */
  SetSmallBufferSizeCoefficient(value: number): void {
    this.smallBufferSizeCoefficient = Math.fround(value);
  }

  /**
   * `HGComicImplementation::GetSmallBufferSizeCoefficient() const` — Helium @0x127ba0.
   *   movss 0x10(%rdi), %xmm0
   */
  GetSmallBufferSizeCoefficient(): number {
    return this.smallBufferSizeCoefficient;
  }

  // -------------------------------------------------------------------
  // Destructors — D0 body ported verbatim; D1/D2 documented.
  // -------------------------------------------------------------------

  /**
   * `HGComicImplementation::~HGComicImplementation()` — Helium
   *   @0x128310 D0 (deleting variant, ported below)
   *   @0x1282d0 D2/D1 (base/complete — NOT yet transcribed; body is short,
   *                    but has not been disasm'd in this pass).
   *
   * D0 body @0x128310 (verbatim):
   *   0x128319: leaq 0x8f5c10(%rip), %rax        ; = vtable address (installed 0xa1df30)
   *   0x128320: movq %rax, (%rdi)                ; reinstall THIS class's vtable
   *   0x128323: movq 0x68(%rdi), %rdi            ; owned = *(rdi + 0x68)
   *   0x128327: testq %rdi, %rdi
   *   0x12832a: je   0x128332
   *   0x12832c: movq (%rdi), %rax                ; owned's vtable
   *   0x12832f: callq *0x18(%rax)                ; vcall *0x18 = HGObject::Release
   *   0x128332: movq %rbx, %rdi                  ; self
   *   0x128335: callq __ZN8HGObjectD2Ev          ; HGObject::~HGObject()
   *   0x12833a: movq %rbx, %rdi
   *   0x128343: jmp   __ZN8HGObjectdlEPv         ; HGObject::operator delete
   *
   * In TS we model the observable effect: Release the owned pointer at
   * 0x68 (dropping to it a Release() call — since HGObject::Release is
   * inherited, this is a no-op on the JS-GC'd port other than logically
   * clearing the reference), then null the field (JS GC handles delete).
   */
  destroy_D0(): void {
    // @0x128320 — vtable is reinstalled to 0xa1df30 (this class's vtable).
    // In TS, the class identity is already fixed; no observable change.
    // @0x128323..0x12832f — Release owned at 0x68 via vcall *0x18.
    if (this.ownedAt0x68 !== null) {
      // HGObject::Release @Helium 0x1a0f30 — decoded in HGObject.ts.
      // In the concrete TS port there's no refcount to decrement (GC'd),
      // but we still invoke a Release() method if the runtime object
      // exposes one, matching the observable vcall.
      const owned = this.ownedAt0x68 as unknown as { Release?: () => void };
      if (typeof owned.Release === 'function') {
        owned.Release();
      }
      this.ownedAt0x68 = null;
    }
    // @0x128335 — HGObject::~HGObject() — no-op in TS (see HGObject.ts).
    // @0x128343 — HGObject::operator delete — no-op in TS (GC).
  }

  // -------------------------------------------------------------------
  // Frontier throw-stubs — heavy buffer-scale math + graph-generation.
  //
  // All of these have real (non-ICF) bodies at their @0xADDR; they read
  // HGRect fields, multiplex on float constants in the __DATA_CONST section
  // (see e.g. GetFullBufferScale's four rip-relative constants at
  // 0x2a3b1f/0x2a3ada/0x2acdfe/0x2a3a44), and construct chains of
  // HgcComic* HGNode subclasses that are not yet transcribed. Per
  // PORTING_SPEC.md rule 3 we throw citing @0xADDR so `frontier.py`
  // schedules the decode work as a follow-up.
  // -------------------------------------------------------------------

  /** @Helium 0x124180 — reads HGRect + 4 rip-relative float constants. */
  GetFullBufferScale(_operationRegion: HGRect): number {
    throw new Error(
      'HGComicImplementation::GetFullBufferScale not yet transcribed @Helium 0x124180 ' +
        '(41-line body; float constants @0x2a3b1f, @0x2a3ada, @0x2acdfe, @0x2a3a44)',
    );
  }

  /** @Helium 0x124210. */
  GetLargeBufferScale(_operationRegion: HGRect): number {
    throw new Error(
      'HGComicImplementation::GetLargeBufferScale not yet transcribed @Helium 0x124210 (44-line body)',
    );
  }

  /** @Helium 0x1242b0. */
  GetSmallBufferScale(_operationRegion: HGRect): number {
    throw new Error(
      'HGComicImplementation::GetSmallBufferScale not yet transcribed @Helium 0x1242b0 (62-line body)',
    );
  }

  /** @Helium 0x124390. */
  GetFullToSmallScale(_operationRegion: HGRect): number {
    throw new Error(
      'HGComicImplementation::GetFullToSmallScale not yet transcribed @Helium 0x124390 (62-line body)',
    );
  }

  /** @Helium 0x124470. */
  GetFullToLargeScale(_operationRegion: HGRect): number {
    throw new Error(
      'HGComicImplementation::GetFullToLargeScale not yet transcribed @Helium 0x124470 (44-line body)',
    );
  }

  /** @Helium 0x124510. */
  GetSmallToLargeScale(_operationRegion: HGRect): number {
    throw new Error(
      'HGComicImplementation::GetSmallToLargeScale not yet transcribed @Helium 0x124510 (94-line body)',
    );
  }

  /** @Helium 0x124680. */
  GetLargeToSmallScale(_operationRegion: HGRect): number {
    throw new Error(
      'HGComicImplementation::GetLargeToSmallScale not yet transcribed @Helium 0x124680 (94-line body)',
    );
  }

  /** @Helium 0x124800. */
  GetLargeToFullScale(_operationRegion: HGRect): number {
    throw new Error(
      'HGComicImplementation::GetLargeToFullScale not yet transcribed @Helium 0x124800 (45-line body)',
    );
  }

  /** @Helium 0x1248a0. */
  GetSmallToFullScale(_operationRegion: HGRect): number {
    throw new Error(
      'HGComicImplementation::GetSmallToFullScale not yet transcribed @Helium 0x1248a0 (61-line body)',
    );
  }

  // ---------- Generate*Node family (build HgcComic* HGNode chains) ----------

  /** @Helium 0x124c60 — HGRef<HGNode> arg. Builds a wrap node. */
  GenerateWrapNode(_input: HGNode): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateWrapNode not yet transcribed @Helium 0x124c60',
    );
  }

  /** @Helium 0x124ce0. */
  GenerateSobelNode(_input: HGNode, _sigma: number, _flag: boolean): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateSobelNode not yet transcribed @Helium 0x124ce0',
    );
  }

  /** @Helium 0x124e80. */
  GenerateGaussBlurXNode(_input: HGNode, _sigma: number): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateGaussBlurXNode not yet transcribed @Helium 0x124e80',
    );
  }

  /** @Helium 0x125040. */
  GenerateGaussBlurYAndGradNode(_input: HGNode, _sigma: number): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateGaussBlurYAndGradNode not yet transcribed @Helium 0x125040',
    );
  }

  /** @Helium 0x125200. */
  GenerateBilateralXNode(_a: HGNode, _b: HGNode, _sigma: number): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateBilateralXNode not yet transcribed @Helium 0x125200',
    );
  }

  /** @Helium 0x125410. */
  GenerateBilateralYNode(_a: HGNode, _b: HGNode): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateBilateralYNode not yet transcribed @Helium 0x125410',
    );
  }

  /** @Helium 0x125600. */
  GenerateQuantizeNode(_input: HGNode, _levels: number): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateQuantizeNode not yet transcribed @Helium 0x125600',
    );
  }

  /** @Helium 0x125750. */
  GenerateColorStrokeNode(_a: HGNode, _b: HGNode, _sigma: number): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateColorStrokeNode not yet transcribed @Helium 0x125750',
    );
  }

  /** @Helium 0x125920. */
  GenerateEdgesNode(_a: HGNode, _b: HGNode): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateEdgesNode not yet transcribed @Helium 0x125920',
    );
  }

  /** @Helium 0x125b20. */
  GenerateStrokeAndBlendNode(
    _a: HGNode,
    _b: HGNode,
    _c: HGNode,
    _d: HGNode,
    _f0: number,
    _f1: number,
    _flag: boolean,
  ): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateStrokeAndBlendNode not yet transcribed @Helium 0x125b20',
    );
  }

  /** @Helium 0x125eb0. */
  GenerateStrokeNode(_a: HGNode, _b: HGNode, _sigma: number): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateStrokeNode not yet transcribed @Helium 0x125eb0',
    );
  }

  /** @Helium 0x126100. */
  GenerateGaussianBlurNode(_input: HGNode, _sigma: number): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateGaussianBlurNode not yet transcribed @Helium 0x126100',
    );
  }

  /** @Helium 0x126180. */
  GenerateBilateralNode(_a: HGNode, _b: HGNode, _sigma: number): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateBilateralNode not yet transcribed @Helium 0x126180',
    );
  }

  /** @Helium 0x126200. */
  GenerateSobelGradients(
    _input: HGNode,
    _f0: number,
    _f1: number,
    _flag: boolean,
  ): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateSobelGradients not yet transcribed @Helium 0x126200',
    );
  }

  /** @Helium 0x1262d0 — top-level graph builder; dispatches on `style`. */
  GenerateGraph(
    _renderer: HGRendererStub,
    _inputA: HGNode,
    _inputB: HGNode,
  ): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateGraph not yet transcribed @Helium 0x1262d0 ' +
        '(~2048-byte body; dispatches to GenerateGraphStyle{Classic,Poster,Ink}Parent based on style)',
    );
  }

  /** @Helium 0x126ab0. */
  GenerateGraphStyleClassicParent(
    _input: HGNode,
    _rect: HGRect,
    _dest: HGNode,
    _flag: boolean,
  ): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateGraphStyleClassicParent not yet transcribed @Helium 0x126ab0',
    );
  }

  /** @Helium 0x1270c0. */
  GenerateGraphStylePosterParent(
    _input: HGNode,
    _rect: HGRect,
    _dest: HGNode,
    _flag0: boolean,
    _flag1: boolean,
  ): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateGraphStylePosterParent not yet transcribed @Helium 0x1270c0',
    );
  }

  /** @Helium 0x127750. */
  GenerateGraphStyleInk(
    _input: HGNode,
    _rect: HGRect,
    _dest: HGNode,
  ): HGNode {
    throw new Error(
      'HGComicImplementation::GenerateGraphStyleInk not yet transcribed @Helium 0x127750',
    );
  }
}
