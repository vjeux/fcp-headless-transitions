// PCBezierNamespace::SampledContour — ProCore.framework.
// Nested class inside PCBezierNamespace. Represents the "sampled polyline" output
// buffer that PCBezierNamespace::getContour<Bezier>() writes into, plus a thin
// eval() convenience that just tail-calls getContour with *this as the sink.
//
// Two methods transcribed here (both bodies fully recovered):
//   @ProCore 0x2b480  PCBezierNamespace::SampledContour::SampledContour(Type, double)
//   @ProCore 0x2b5b2  PCBezierNamespace::SampledContour::eval(PCBezier<double,PCVector2<double>,...> const&)
//
// Source disassemblies:
//   raw-port/re/disasm/PCBezierNamespace.SampledContour.SampledContour.s
//   raw-port/re/disasm/PCBezierNamespace.SampledContour.eval.s
//
// STRUCT LAYOUT (recovered from the C2 ctor 0x2b480..0x2b4ad):
//   +0x00  int32   type          (movl %esi,(%rdi))
//   +0x08  double  tolerance     (movsd %xmm0,0x8(%rdi))
//   +0x10  vptr    PCArray<PCVector2<double>>*  (leaq @0x149b18(%rip) then mov ,0x10(%rdi))
//   +0x18  xmm0=0 -> +0x18 = 0, +0x20 = 0     (movups %xmm0,0x18(%rdi))   (PCArray internals: dataPtr, size/capacity)
//   +0x28  vptr    PCArray<double>*             (leaq @0x149b60(%rip) then mov ,0x28(%rdi))
//   +0x30  xmm0=0 -> +0x30 = 0, +0x38 = 0     (movups %xmm0,0x30(%rdi))   (PCArray internals)
//   sizeof(SampledContour) >= 0x40 (64 bytes).
//
// The two 'leaq' displacements resolve (via resolve.py sym) to:
//   @ProCore 0x149b18  "vtable for PCArray<PCVector2<double>, PCArray_Traits<PCVector2<double>>> (+0x10)"
//   @ProCore 0x149b60  "vtable for PCArray<double,           PCArray_Traits<double>>           (+0x10)"
// i.e. the installed vptrs of the two PCArray members. The +0x10 offset is
// the Itanium-ABI vtable slot layout (offset-to-top+RTTI live at -0x10/-0x08).
//
// Type is an enum (SampledContour::Type). The C++ signature says the first arg is
// a SampledContour::Type value, stored as int32 at +0x00. Enum values are not
// referenced in the ctor itself; discovering them requires disasm of a caller
// that passes them literally (getContour and its clients — deferred).

// ─── Minimal shapes for still-undecoded neighbour classes ────────────────────
// PCArray<T>, PCBezier<...>, PCVector2<double> and PCDynamicArrayBezier<...>
// are separate FCP classes on the port ledger. They have not been transcribed
// yet, so we expose the byte-accurate MINIMAL shapes needed by SampledContour
// (which never inspects their internals directly — the ctor only writes the
// vptr slot and zero-initializes the array internals; eval() forwards them
// unchanged into getContour). When those classes land they should replace
// these structural types with real imports.

/** PCVector2<double> — 16 bytes: two packed doubles at +0x00, +0x08. */
interface PCVector2Double {
  x: number;
  y: number;
}

/**
 * Minimal PCArray<T> — inlined struct at +0x10..+0x20 in SampledContour:
 *   +0x00  vptr  (installed to PCArray<T>_vtable+0x10 by SampledContour ctor)
 *   +0x08  data / size  (16 bytes zeroed by movups xmm0 at 0x18/0x30)
 *
 * The ctor only zero-initializes the internals — no actual storage is
 * allocated in SampledContour::SampledContour. Real element append/resize
 * lives in PCArray methods (separate class on the ledger).
 */
class PCArray_double {
  // Zero-initialized state after SampledContour ctor. Elements added later by
  // PCArray methods (yet to be transcribed).
  elements: number[] = [];
}
class PCArray_PCVector2_double {
  elements: PCVector2Double[] = [];
}

/**
 * Minimal PCBezier<double, PCVector2<double>, PCDynamicArrayBezier<PCVector2<double>>> —
 * used only as an opaque reference on the eval() → getContour() edge. The
 * concrete layout is recovered inside getContour() (@ProCore 0x2b5c6),
 * which is not yet transcribed.
 */
interface PCBezier_double_PCVector2_double_PCDynamicArrayBezier {
  // opaque — see @ProCore 0x2b5c6 for the full structure.
  readonly __pcBezierBrand: unique symbol;
}

/**
 * PCBezierNamespace::SampledContour::Type — nested enum.
 * Values are the raw int32 stored at (+0x00) by the ctor. The concrete tag
 * mapping (Adaptive/Uniform/etc.) is chosen by callers of the ctor; those
 * callsites have not yet been disassembled, so we expose the enum as a raw
 * numeric tag and let callers pass a typed integer. This mirrors the binary,
 * which never inspects the tag inside the ctor (the ctor just stores it).
 */
export type SampledContourType = number;

/**
 * PCBezierNamespace::SampledContour — sampled-polyline output for getContour.
 *
 * Holds two parallel PCArray<T> buffers:
 *   points  : PCArray<PCVector2<double>>  — the sampled (x,y) polyline vertices
 *   params  : PCArray<double>             — the t parameter for each sample
 *
 * Plus a discretization tag (type) and a sampling tolerance (double).
 *
 * @ProCore 0x2b480  SampledContour(Type, double)  — the C2 base-object ctor.
 * @ProCore 0x2b584  SampledContour(Type, double)  — the C1 complete-object ctor
 *                    (identical body, both share this transcription; C1 exists
 *                    as a separate symbol per Itanium ABI but the disasm shows
 *                    an entry at 0x2b584 that reuses this same 13-instruction
 *                    layout — either an alias/ICF-fold or a second copy).
 */
export class PCBezierNamespace__SampledContour {
  // +0x00
  public type: SampledContourType;
  // +0x08
  public tolerance: number;
  // +0x10..+0x20 — inlined PCArray<PCVector2<double>> (vptr + zeroed internals)
  public points: PCArray_PCVector2_double;
  // +0x28..+0x38 — inlined PCArray<double> (vptr + zeroed internals)
  public params: PCArray_double;

  /**
   * @ProCore 0x2b480  __ZN17PCBezierNamespace14SampledContourC2ENS0_4TypeEd
   *
   * Disasm (base-object ctor, 13 instructions):
   *   0x2b480  pushq  %rbp
   *   0x2b481  movq   %rsp,%rbp
   *   0x2b484  movl   %esi,(%rdi)                           // this->type      = arg1
   *   0x2b486  movsd  %xmm0,0x8(%rdi)                       // this->tolerance = arg2
   *   0x2b48b  leaq   0x11e686(%rip),%rax                   // rax = @0x149b18 = PCArray<PCVector2<double>> vtable+0x10
   *   0x2b492  movq   %rax,0x10(%rdi)                       // this->points.vptr = ^
   *   0x2b496  xorps  %xmm0,%xmm0
   *   0x2b499  movups %xmm0,0x18(%rdi)                      // this->points internals[0..16) = 0
   *   0x2b49d  leaq   0x11e6bc(%rip),%rax                   // rax = @0x149b60 = PCArray<double> vtable+0x10
   *   0x2b4a4  movq   %rax,0x28(%rdi)                       // this->params.vptr = ^
   *   0x2b4a8  movups %xmm0,0x30(%rdi)                      // this->params internals[0..16) = 0
   *   0x2b4ac  popq   %rbp
   *   0x2b4ad  retq
   */
  constructor(type: SampledContourType, tolerance: number) {
    // The disasm stores the raw esi word into (%rdi); esi is a 32-bit register,
    // and callers pass a SampledContour::Type enum by value. We do not truncate
    // to int32 here because JS numbers already hold the full 32-bit range; any
    // caller that passes a non-int32 tag is passing a value the binary would
    // itself have widened via cvtsi and stored verbatim.
    this.type = type;
    this.tolerance = tolerance;
    // xorps xmm0,xmm0 + movups xmm0,0x18(%rdi) zero-initializes the two 8-byte
    // slots at +0x18 and +0x20 (16 bytes). Same for +0x30/+0x38 via 0x30(%rdi).
    // These are PCArray's internal (data, sizeOrCapacity) fields — the vptr at
    // +0x10 / +0x28 is written first and the internals are then zeroed. We
    // model that by constructing empty PCArray instances of the right shape.
    this.points = new PCArray_PCVector2_double();
    this.params = new PCArray_double();
  }

  /**
   * @ProCore 0x2b5b2  __ZN17PCBezierNamespace14SampledContour4evalERK8PCBezierId9PCVector2IdE20PCDynamicArrayBezierIS3_EE
   *
   * Disasm (7 instructions — a pure trampoline):
   *   0x2b5b2  pushq  %rbp
   *   0x2b5b3  movq   %rsp,%rbp
   *   0x2b5b6  movq   %rdi,%rax          // save this
   *   0x2b5b9  movq   %rsi,%rdi          // arg1 = bezier (was rsi)
   *   0x2b5bc  movq   %rax,%rsi          // arg2 = this   (was rdi)
   *   0x2b5bf  popq   %rbp
   *   0x2b5c0  jmp    PCBezierNamespace::getContour<PCBezier<double,PCVector2<double>,PCDynamicArrayBezier<PCVector2<double>>>>(
   *                       PCBezier<...> const&, PCBezierNamespace::SampledContour&)
   *
   * Net effect: eval(bezier) == PCBezierNamespace::getContour(bezier, *this).
   * The ABI swap (rdi<->rsi) reorders the arguments so the "sink" reference
   * (this) becomes the SECOND parameter of getContour, matching its C++
   * declaration `getContour(Bezier const&, SampledContour&)`.
   *
   * getContour is 416 lines and lives at
   *   __ZN17PCBezierNamespace10getContour...  @ProCore 0x2b5c6
   * It is left as a throwing stub citing @0x2b5c6, so frontier.py surfaces
   * getContour @0x2b5c6 as demand for the next porting pass.
   */
  eval(bezier: PCBezier_double_PCVector2_double_PCDynamicArrayBezier): void {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    getContour(bezier, this);
  }
}

/**
 * PCBezierNamespace::getContour<PCBezier<double,PCVector2<double>,PCDynamicArrayBezier<PCVector2<double>>>>
 * @ProCore 0x2b5c6  __ZN17PCBezierNamespace10getContourI8PCBezierId9PCVector2IdE20PCDynamicArrayBezierIS3_EEEEvRKT_RNS_14SampledContourE
 *
 * Adaptive polyline sampler that fills a SampledContour from a piecewise-cubic
 * Bezier (double x, PCVector2<double> points, PCDynamicArrayBezier<PCVector2<double>> spans).
 * 416 instructions — not yet transcribed. Called from
 *   PCBezierNamespace::SampledContour::eval @ProCore 0x2b5b2 (transcribed above).
 *
 * @throws always, per raw-port Rule 3 — a loud gap is correct until the body is decoded.
 */
function getContour(
  _bezier: PCBezier_double_PCVector2_double_PCDynamicArrayBezier,
  _sink: PCBezierNamespace__SampledContour,
): void {
  throw new Error(
    "PCBezierNamespace::getContour<PCBezier<double,PCVector2<double>,PCDynamicArrayBezier<PCVector2<double>>>> @0x2b5c6 not yet transcribed",
  );
}
