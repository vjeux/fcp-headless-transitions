// raw-port/src/render/HGBilateralFilterInterpSC.ts
//
// FCP `HGBilateralFilterInterpSC` — a bilateral-filter render-graph node
// that fabricates a shader-driven interpolator across a fixed number of
// intensity bins.  Compared to the neighboring `HGBilateralFilter` class
// (which owns a single fused kernel), this "SC" (shader-code) variant
// operates by:
//   1. `BuildGraph()`  – allocating three parallel `numBins+1`-length
//      vectors of `HGNode*` (fields at 0x1a0, 0x1a8, 0x198) that together
//      encode the per-bin uniforms of a Helium fragment shader.
//   2. `UpdateParams()` – walking those three vectors in lock-step and
//      pushing the derived (spatial-blur, intensity-sigma-coef,
//      bin-center, and channel-select) uniforms into each node via
//      vtable slot *0x60 (`SetParameter(int, float, float, float, float)`).
//   3. `GetOutput()`   – wiring the caller-provided input into the
//      internally-built graph and returning the pre-baked output node
//      cached at 0x1b8.
//
// This port faithfully transcribes the arithmetic in `UpdateParams` and
// the trivial ctor / setters / GetOutput / DestroyGraph.  `BuildGraph`
// (391 lines of scene-graph orchestration that allocates two distinct
// undecoded HGNode subclasses per bin) is left as a throwing stub citing
// its address — the actual shader math needed by the port lives in
// `UpdateParams`, which is fully decoded here.
//
// Symbols decoded here (Helium.framework, x86_64 slice):
//   0x91fc0   HGBilateralFilterInterpSC::HGBilateralFilterInterpSC()   [C1]
//   0x92090   HGBilateralFilterInterpSC::HGBilateralFilterInterpSC()   [C2]
//   0x92160   HGBilateralFilterInterpSC::~HGBilateralFilterInterpSC()  [D0]
//   0x921a0   HGBilateralFilterInterpSC::DestroyGraph()
//   0x92260   HGBilateralFilterInterpSC::~HGBilateralFilterInterpSC()  [D1]
//   0x922a0   HGBilateralFilterInterpSC::~HGBilateralFilterInterpSC()  [D2]
//   0x922f0   HGBilateralFilterInterpSC::SetNumBins(uint32)
//   0x92320   HGBilateralFilterInterpSC::SetRangeScale(float)
//   0x92370   HGBilateralFilterInterpSC::SetRangeOffset(float)
//   0x923a0   HGBilateralFilterInterpSC::SetSpatialBlurRadius(float)
//   0x923d0   HGBilateralFilterInterpSC::SetIntensityBlurRadius(float)
//   0x92400   HGBilateralFilterInterpSC::SetFilterChannel(FilterChannel)
//   0x92410   HGBilateralFilterInterpSC::BuildGraph()      [stub — orchestration]
//   0x92a20   HGBilateralFilterInterpSC::UpdateParams()
//   0x92cc0   HGBilateralFilterInterpSC::GetOutput(HGRenderer*)
//
// Called-into symbols (not ported — kept as throwing stubs / citations):
//   HGNode::ClearBits()                    @0x11c890 (see HGNode.ts)
//   HGRenderer::GetInput(HGNode*, int)     @0xf2dd0  (see HGRenderer.ts)
//   HGObject::operator new(unsigned long)  (imported)
//   HGObject::operator delete(void*)       (imported)
//   HGNode subclass ctors used by BuildGraph — undecoded (throwing stub).
//
// ── STRUCT LAYOUT (recovered from ctor @0x92090 + DestroyGraph + setters)
// Extends `HGNode` (base 0x198 bytes wide — see HGNode.ts).  Own fields:
//   0x198 : std::vector<HGNode*>* nodesB   – "intensity" node vector; each
//           entry receives 3 SetParameter calls per Update (see UpdateParams).
//           Cleared to null by ctor via xorps/movups @0x920af.
//   0x1a0 : std::vector<HGNode*>* nodesA   – "spatial" node vector.
//           Cleared to null by same xorps @0x920af.
//   0x1a8 : std::vector<HGNode*>* nodesC   – "delta" node vector; one
//           SetParameter call per Update.  Cleared to null @0x920b6.
//   0x1b0 : HGNode*  input                 – lazily-constructed input node
//           (ctor allocates via `new HGObject(0x1a0)` @0x920c6; the input
//           HGNode ctor writes the vtable + base fields).  Owned pointer;
//           released by the D2 dtor path (not transcribed here).
//   0x1b8 : HGNode*  outputCache           – set to null by ctor @0x920dd;
//           written by BuildGraph; returned as-is by GetOutput.
//   0x1c0 : u32      numBins               – ctor initializes to 10
//                                             (movl $0xa @0x920e8);
//                                             SetNumBins clamps to max(2, x).
//   0x1c4 : f32      spatialBlurRadius     – ctor initializes to 1.0f
//                                             (via 8-byte movsd @0x920f2 that
//                                              writes 1.0f into 0x1c4 and
//                                              1.0f into 0x1c8 in one shot,
//                                              literal @Helium 0x3ca0b0 =
//                                              { 0x3f800000, 0x3f800000 }).
//   0x1c8 : f32      intensityBlurRadius   – see above (1.0f init).
//   0x1cc : u8       needsBuildGraph       – ctor $0x1; setters (except
//           SetFilterChannel) set it back to 1 via HGNode::ClearBits +
//           SetNumBins directly writes $0x1 @0x92301.  GetOutput checks
//           this flag @0x92cec and re-invokes BuildGraph when true.
//   0x1d0 : f32      rangeScale            – ctor: 1.0f (via movss+movlps
//                                             pair @0x92109/0x92111 —
//                                             xmm0 = { 1.0f, 0, 0, 0 } and
//                                             a 64-bit low-half store puts
//                                             1.0 at 0x1d0 and 0.0 at 0x1d4).
//                                             SetRangeScale replaces NaN or
//                                             signed values via the
//                                             abs+blend idiom (see below).
//   0x1d4 : f32      rangeOffset           – ctor: 0.0f (same store).
//   0x1d8 : i32      filterChannel         – ctor: 0 @0x92118 (enum, three
//                                             visible cases: 0, 1, else).
//
// ── DECODED FLOAT CONSTANTS (RIP-relative literal-pool offsets in Helium)
//   K_ONE_F32      = 1.0                        @Helium 0x3c7cc0 (low 32b of
//                                                { 0x3f800000, 0x40c00000 })
//   K_SIGN_MASK32  = { 0x80000000, ... }        @Helium 0x3ca0d0 (xorps flip
//                                                — negates the low f32 lane)
//   K_LN4          = 1.3862943611198906         @Helium 0x3cd140 (= 2·ln 2)
//   K_MINUS9       = -9.0                       @Helium 0x3ccd58
//   K_ABS_MASK32   = { 0x7fffffff, ... }        @Helium 0x3c7c30 (used only
//                                                by SetRangeScale sanitizer)
//   K_ONE_PACKED4  = { 1.0f, 1.0f, 1.0f, 1.0f } @Helium 0x3c7c40 (used only
//                                                by SetRangeScale sanitizer)
//   K_INIT_11      = { 1.0f, 1.0f }             @Helium 0x3ca0b0 (ctor:
//                                                writes 0x1c4/0x1c8).
//
// The K_LN4 / K_MINUS9 pair encodes the exponent-domain Gaussian
// half-width transform `-9 / (2·ln 2 · r²)` — the exact same
// transformation used by the sibling `HGBilateralFilter` class (which see).
//
// ── VTABLE SIGNATURES USED ────────────────────────────────────────────────
// Every param-write in `UpdateParams` calls `*0x60(rax)` — HGNode's
// `SetParameter(int idx, float, float, float, float)` slot (as decoded and
// documented in HGNode.ts:36).  Argument register layout for those calls:
//   rdi = node ptr, esi = idx, xmm0/xmm1/xmm2/xmm3 = four float args.
//
import { HGNode } from "./HGNode";
import { HGRenderer } from "./HGRenderer";

/**
 * Virtual dispatch of `HGNode`'s vtable slot *0x60 —
 * `HGNode::SetParameter(int idx, float, float, float, float)` @Helium 0x11cab0
 * (see HGNode.ts:36).  HGNode's own body is not yet transcribed here; every
 * per-bin uniform push in `UpdateParams` below is a `callq *0x60(rax)` in the
 * disassembly, which in TS becomes this typed-vcall shim.  Subclasses of
 * HGNode can override this slot (that's the whole point of the vtable) — the
 * concrete leaf nodes wired up by BuildGraph @0x92410 do so — but their
 * overrides are also not yet ported (@Helium 0x11cab0).  A throwing stub
 * cited to the base vtable slot address keeps the frontier visible.
 */
function HGNode_vcall_SetParameter(
  _self: HGNode,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  throw new Error(
    "HGNode vtable *0x60 SetParameter(int,float,float,float,float) " +
      "@Helium 0x11cab0 not yet transcribed (called from " +
      "HGBilateralFilterInterpSC::UpdateParams @0x92a20)",
  );
}

/** RIP-relative float literal @Helium 0x3c7cc0 (low 32b): `1.0f`. */
const K_ONE_F32 = Math.fround(1.0);
/** RIP-relative double @Helium 0x3cd140: `2·ln 2 = 1.3862943611198906`. */
const K_LN4 = 1.3862943611198906;
// K_MINUS9 @Helium 0x3ccd58 — appears literally in the mul/div dance below
// and is written as `-9.0` inline for readability; the citation stays here.
// K_SIGN_MASK32 @Helium 0x3ca0d0 — the xorps sign-flip on the low f32 lane.
// In IEEE-754 this is unary negation of a finite f32; written as `-x` on a
// Math.fround'd value where it appears.

/**
 * `HGBilateralFilterInterpSC::FilterChannel` — decoded enum. The class name
 * mangle `hgBilateralFilterInterpSC_FilterChannel` appears in the setter
 * signature @Helium 0x92400.  UpdateParams tests three cases:
 *   • 0        →  R lane = 1.0f, others = 0    (branch @0x92bd1)
 *   • 1        →  G lane = 1.0f, others = 0    (branch @0x92c10)
 *   • default  →  B lane = 1.0f, others = 0    (branch @0x92c50)
 * The register-lane assignment (xmm0 vs xmm1 vs xmm2) determines which
 * shader color channel receives the unit weight (see UpdateParams).
 */
export type HGBilateralFilterInterpSC_FilterChannel = number;

/**
 * `HGBilateralFilterInterpSC` — HGNode subclass driving a shader-based
 * bilateral interpolator.  See file header for the full symbol/layout
 * provenance.
 */
export class HGBilateralFilterInterpSC extends HGNode {
  /** Field @0x198 — "intensity" node vector.  See file header. */
  public nodesB: (HGNode | null)[] | null = null;
  /** Field @0x1a0 — "spatial" node vector.  See file header. */
  public nodesA: (HGNode | null)[] | null = null;
  /** Field @0x1a8 — "delta" node vector.  See file header. */
  public nodesC: (HGNode | null)[] | null = null;
  /** Field @0x1b0 — internally-owned input HGNode (ctor allocates one). */
  public inputNode: HGNode | null = null;
  /** Field @0x1b8 — cached output node built by BuildGraph. */
  public outputCache: HGNode | null = null;
  /** Field @0x1c0 — number of bins; ctor 10, clamped to max(2, x). */
  public numBins: number;
  /** Field @0x1c4 — spatial-blur radius (single-precision).  Ctor 1.0. */
  public spatialBlurRadius: number;
  /** Field @0x1c8 — intensity-blur radius (single-precision). Ctor 1.0. */
  public intensityBlurRadius: number;
  /** Field @0x1cc — u8 "needsBuildGraph" latch. Ctor 1; GetOutput checks. */
  public needsBuildGraph: boolean;
  /** Field @0x1d0 — range scale (sanitized f32). Ctor 1.0. */
  public rangeScale: number;
  /** Field @0x1d4 — range offset (raw f32).  Ctor 0.0. */
  public rangeOffset: number;
  /** Field @0x1d8 — FilterChannel enum. Ctor 0. */
  public filterChannel: number;

  /**
   * `HGBilateralFilterInterpSC::HGBilateralFilterInterpSC()` @Helium 0x92090.
   *
   *   HGNode::HGNode()                                        @0x9209d
   *   leaq  0x978757(%rip), %rax ; movq %rax, (%rbx)           ← vtable
   *   xorps %xmm0,%xmm0 ; movups %xmm0, 0x198(%rbx)           ← null 0x198/0x1a0
   *   movq  $0, 0x1a8(%rbx)                                    ← null 0x1a8
   *   HGObject::operator new(0x1a0)                            @0x920c6
   *   HGNode::HGNode() (on that block)                         @0x920d1
   *   movq  %r14, 0x1b0(%rbx)                                  ← install input
   *   movq  $0, 0x1b8(%rbx)                                    ← outputCache=null
   *   movl  $0xa, 0x1c0(%rbx)                                  ← numBins=10
   *   movsd 0x337fb6(%rip), %xmm0 ; movsd %xmm0, 0x1c4(%rbx)   ← 0x1c4/0x1c8 = 1.0/1.0
   *   movb  $0x1, 0x1cc(%rbx)                                  ← needsBuildGraph=1
   *   movss 0x335baf(%rip), %xmm0 ; movlps %xmm0, 0x1d0(%rbx)  ← 0x1d0=1.0, 0x1d4=0.0
   *   movl  $0x0, 0x1d8(%rbx)                                  ← filterChannel=0
   */
  constructor() {
    super();
    // this.nodesA/B/C/outputCache = null (field initializers).
    // Allocate the internally-owned input node.  Faithful to
    // @Helium 0x920c6..0x920d1: `new HGObject(0x1a0); HGNode::HGNode(this)`.
    // The port here just instantiates a bare HGNode — the extra 0x1a0-byte
    // allocation size is the shape of the *concrete* HGNode subclass the
    // ctor was written against; only the HGNode base slice is accessed by
    // any path we transcribe.
    this.inputNode = new HGNode();
    this.numBins = 10; // @0x920e8
    this.spatialBlurRadius = Math.fround(1.0); // @0x920f2 (low half of movsd)
    this.intensityBlurRadius = Math.fround(1.0); // @0x920f2 (high half of movsd)
    this.needsBuildGraph = true; // @0x92102
    this.rangeScale = Math.fround(1.0); // @0x92109 (low half of movlps)
    this.rangeOffset = Math.fround(0.0); // @0x92109 (high half of movlps)
    this.filterChannel = 0; // @0x92118
  }

  /**
   * `HGBilateralFilterInterpSC::SetNumBins(uint32)` @Helium 0x922f0.
   *
   *   HGNode::ClearBits()                    @0x922fc
   *   movb   $0x1, 0x1cc(%r14)                ← needsBuildGraph=1
   *   cmpl   $0x3, %ebx                       ← if (x >= 3) → keep x else 2
   *   movl   $0x2, %eax
   *   cmoval %ebx, %eax                       ← (unsigned above-or-equal)
   *   movl   %eax, 0x1c0(%r14)                ← store clamped value
   *
   * Semantics: `numBins = max(2, x)` treating `x` as unsigned.  For x=0..2
   * this stores 2; for x>=3 it stores x itself.  (`cmovae` is the unsigned
   * variant; since x is `uint32_t` sign-extending isn't in play.)
   */
  public SetNumBins(x: number): void {
    HGNode_ClearBits(this); // @0x922fc
    this.needsBuildGraph = true; // @0x92301
    // Unsigned max(2, x) — reflects `cmp $0x3; mov $2; cmovael ebx, eax`.
    const xU = x >>> 0;
    this.numBins = xU >= 3 ? xU : 2; // @0x92309..0x92314
  }

  /**
   * `HGBilateralFilterInterpSC::SetRangeScale(float)` @Helium 0x92320.
   *
   * NaN- and zero-sanitizer on the incoming scale.  Decoded:
   *   movaps xmm2, [K_ABS_MASK32]           ; xmm1 = abs-mask (0x7fffffff×4)
   *   movaps xmm2, arg                      ; xmm2 = arg
   *   andps  xmm2, xmm1                     ; xmm1 = arg & 0x7fffffff = |arg|
   *   xorps  xmm0, xmm0                     ; xmm0 = 0
   *   cmpneqss xmm2, xmm0                   ; xmm0 = (arg != 0) ? all1 : 0
   *                                          (NaN != 0 is false ⇒ xmm0=0)
   *   movaps xmm2, [K_ONE_PACKED4]          ; xmm2 = { 1, 1, 1, 1 }
   *   blendvps xmm0, xmm1, xmm2             ; xmm2 = xmm0.msb ? xmm1 : xmm2
   *                                          ⇒ non-zero, non-NaN → |arg|
   *                                          ⇒ zero OR NaN       → 1.0
   *   movss  xmm2, 0x1d0(rbx)               ; store into field
   *
   * i.e. `rangeScale = (isFinite(x) && x != 0) ? |x| : 1.0`.
   * The `cmpneqss` intrinsic returns all-zero for NaN inputs (IEEE ordered
   * "not-equal" is false when either operand is NaN), so NaN falls through
   * to the "use 1.0f" path exactly the same as zero.
   */
  public SetRangeScale(x: number): void {
    HGNode_ClearBits(this); // @0x92330
    const xf = Math.fround(x);
    // "arg != 0" in IEEE-ordered sense — Number.isNaN(xf) returns true for
    // NaN, and `xf !== 0` is false for +0/-0; combine to reproduce the
    // cmpneqss + blendvps semantics.  Using !== rather than Object.is per
    // the porting-spec numerics rule.
    const nonZeroAndNotNaN = !Number.isNaN(xf) && xf !== 0;
    this.rangeScale = nonZeroAndNotNaN ? Math.fround(Math.abs(xf)) : Math.fround(1.0);
  }

  /**
   * `HGBilateralFilterInterpSC::SetRangeOffset(float)` @Helium 0x92370.
   *
   *   HGNode::ClearBits()                    @0x9237e
   *   movss  arg, 0x1d4(%rbx)                ← plain store
   */
  public SetRangeOffset(x: number): void {
    HGNode_ClearBits(this); // @0x9237e
    this.rangeOffset = Math.fround(x); // @0x92388
  }

  /**
   * `HGBilateralFilterInterpSC::SetSpatialBlurRadius(float)` @Helium 0x923a0.
   *
   *   HGNode::ClearBits()                    @0x923ae
   *   movss  arg, 0x1c4(%rbx)                ← plain store
   */
  public SetSpatialBlurRadius(x: number): void {
    HGNode_ClearBits(this); // @0x923ae
    this.spatialBlurRadius = Math.fround(x); // @0x923b8
  }

  /**
   * `HGBilateralFilterInterpSC::SetIntensityBlurRadius(float)` @Helium 0x923d0.
   *
   *   HGNode::ClearBits()                    @0x923de
   *   movss  arg, 0x1c8(%rbx)                ← plain store
   */
  public SetIntensityBlurRadius(x: number): void {
    HGNode_ClearBits(this); // @0x923de
    this.intensityBlurRadius = Math.fround(x); // @0x923e8
  }

  /**
   * `HGBilateralFilterInterpSC::SetFilterChannel(FilterChannel)` @Helium 0x92400.
   *
   *   movl   %esi, 0x1d8(%rdi)               ← plain store
   *   retq
   *
   * NOTE: unlike the other setters this one does NOT call `HGNode::ClearBits`
   * and does NOT set `needsBuildGraph`.  UpdateParams re-reads 0x1d8 on
   * every call, so the change propagates on the next GetOutput anyway.
   */
  public SetFilterChannel(v: number): void {
    this.filterChannel = v | 0; // @0x92404 (i32 store)
  }

  /**
   * `HGBilateralFilterInterpSC::DestroyGraph()` @Helium 0x921a0.
   *
   * Release the cached output, then delete the three node vectors.  The
   * vector-delete pattern (@0x921db and clones) is the standard
   * "std::vector<T>::~vector" inlined form:
   *   move begin  → 0x8(node) (== end, i.e. destroy elements)
   *   operator delete(begin)
   *   operator delete(vector)
   * — but the vectors here hold non-owning `HGNode*` pointers (owned by
   * the parent scene graph, released elsewhere), so we just clear them.
   *
   * Fields cleared: 0x1b8 (via vtable *0x18 Release), 0x198, 0x1a0, 0x1a8.
   */
  public DestroyGraph(): void {
    // @0x921aa..0x921bf: if outputCache != null: outputCache->vtable_18(release)
    if (this.outputCache !== null) {
      // Release via vtable *0x18 (HGObject::Release, inherited on HGNode).
      // Not transcribed — treated as a no-op in the port; the citation is
      // kept here for the round-trip audit.  See HGNode.ts:33.
      this.outputCache = null;
    }
    // @0x921c7..0x92257: for each of nodesB (0x198), nodesA (0x1a0),
    //   nodesC (0x1a8): if != null, free the underlying block and the
    //   vector header, then null the field.
    this.nodesB = null;
    this.nodesA = null;
    this.nodesC = null;
  }

  /**
   * `HGBilateralFilterInterpSC::BuildGraph()` @Helium 0x92410.
   *
   * 391-line orchestration: `DestroyGraph`, then allocates three
   * `std::vector<HGNode*>` (each length `numBins+1`), populates each slot
   * with a freshly-`new`-allocated concrete HGNode subclass, wires
   * `SetInput` between them, and stores the terminal node into
   * `outputCache` (0x1b8).  The two HGNode subclasses used per bin are
   * `HgcBilateralFilterInterpSC_InterpolatorLastX` /
   * `HgcBilateralFilterInterpSC_InterpolatorLastY` — those are already
   * ported (see raw-port/src/render/HgcBilateralFilterInterpSC_Interpolator*)
   * but the concrete node ctor signatures + graph-wiring bytecode are not
   * decoded here yet.  Left as a throwing stub citing the address.
   */
  public BuildGraph(): void {
    throw new Error(
      "HGBilateralFilterInterpSC::BuildGraph @Helium 0x92410 not yet transcribed " +
        "(scene-graph orchestration: 391 lines allocating 3× (numBins+1) HGNode " +
        "subclasses via HGObject::operator new + wiring them via SetInput)",
    );
  }

  /**
   * `HGBilateralFilterInterpSC::UpdateParams()` @Helium 0x92a20.
   *
   * Walks the three per-bin node vectors (0x1a0 nodesA, 0x198 nodesB,
   * 0x1a8 nodesC) in lock-step, one iteration per bin `i` ∈ [0..numBins].
   * Each iteration performs up to five `SetParameter` (vtable *0x60) calls
   * to push the derived uniforms into the shader:
   *
   *   1. `nodesA[i].SetParameter(0, spatialBlurRadius, 0, 0, 0)` — pushes
   *      the raw spatial-blur radius to slot 0 of the "spatial" node.
   *      @0x92ac1..0x92aec
   *
   *   2. `nodesB[i].SetParameter(0, coef_i, coef_i, 0, 0)` where
   *      `coef_i = -9 / (2·ln2 · intensityBlurRadius²)`.  The math is
   *      computed in f64 (cvtss2sd → mulsd → mulsd → divsd → cvtsd2ss)
   *      and matches the sibling class's `intensitySigmaCoef` up to
   *      numerator sign (`-9` here vs `K_LN4` there — a different family
   *      of shader).                                       @0x92aeb..0x92b46
   *
   *   3. `nodesB[i].SetParameter(1, f, f, f, f)` where
   *      `f = i·rangeScale/numBins + rangeOffset` — the per-bin center
   *      in the intensity domain.  Saved into stack slot -0x40(rbp) for
   *      re-use by step 5.                                 @0x92b49..0x92ba9
   *
   *   4. `nodesB[i].SetParameter(2, R, G, B, 0)` where exactly one of
   *      { R, G, B } is 1.0f and the others 0, selected by `filterChannel`
   *      (0 → R, 1 → G, else → B).                         @0x92baf..0x92c72
   *
   *   5. `nodesC[i].SetParameter(0, f_next, 1/delta, -f/delta, 0)` where
   *      `delta = rangeScale/numBins + rangeOffset` and
   *      `f_next = delta + f` (the next-bin center).       @0x92a40..0x92a7d
   *      This step only fires when `nodesC` has an entry at `i` (checked
   *      at @0x92c85..0x92c9d).  It supplies the linear interpolator
   *      inside a bin with the (offset, inv-width, offset-scaled)
   *      triple needed by the shader.
   *
   * Any of the four bounds checks failing raises
   * `std::vector::__throw_out_of_range` — mirrored here as a thrown
   * `RangeError` with the same "vector too short" semantics.
   */
  public UpdateParams(): void {
    // Local aliases matching the register naming in the disasm.
    const nodesA = this.nodesA; // 0x1a0
    const nodesB = this.nodesB; // 0x198
    const nodesC = this.nodesC; // 0x1a8

    // Cache of the loop-invariant field reads that persist between vcalls.
    // The binary re-loads numBins after every vcall (in case SetParameter
    // mutates fields), so we do the same.
    // Loop bound: `for (uint i = 0; i <= numBins; ++i)` — inclusive,
    // reflecting the `ja` @0x92a8d test (`if (r14 > r15) return;`).
    let i = 0;
    // Pre-loop numBins read (@0x92a30).
    let numBins = this.numBins >>> 0;
    // Stack-cached "previous bin center" (updated by step 3 each iter).
    let prevBinCenter = Math.fround(0.0); // -0x40(rbp)

    while (i <= numBins) {
      // Each iteration re-reads the two f32 scalars saved at -0x20/-0x1c.
      const rangeScale = Math.fround(this.rangeScale); // 0x1d0 → -0x20(rbp) @0x92ab4
      const rangeOffset = Math.fround(this.rangeOffset); // 0x1d4 → -0x1c(rbp) @0x92ac1

      // ── STEP 1: nodesA[i].SetParameter(0, spatialBlurRadius, 0, 0, 0)
      // Bounds check on nodesA (vector at 0x1a0).  @0x92a96..0x92aae
      if (nodesA === null || i >= nodesA.length) {
        throw new RangeError(
          "HGBilateralFilterInterpSC::UpdateParams @0x92a20: nodesA[i] out of range " +
            "(std::vector::__throw_out_of_range @0x92ca3)",
        );
      }
      const nodeA_i = nodesA[i];
      if (nodeA_i === null) {
        throw new Error(
          "HGBilateralFilterInterpSC::UpdateParams @0x92a20: nodesA[i] is null " +
            "(binary would crash on movq (rdi) @0x92ada)",
        );
      }
      const spatial = Math.fround(this.spatialBlurRadius); // 0x1c4 @0x92ad2
      // vtable *0x60 SetParameter(0, spatial, 0, 0, 0)  @0x92ae8
      HGNode_vcall_SetParameter(nodeA_i, 0, spatial, 0.0, 0.0, 0.0);

      // ── STEP 2: nodesB[i].SetParameter(0, coef_i, coef_i, 0, 0)
      // Bounds check on nodesB (vector at 0x198).  @0x92aeb..0x92b03
      if (nodesB === null || i >= nodesB.length) {
        throw new RangeError(
          "HGBilateralFilterInterpSC::UpdateParams @0x92a20: nodesB[i] out of range " +
            "(std::vector::__throw_out_of_range @0x92ca3)",
        );
      }
      const nodeB_i = nodesB[i];
      if (nodeB_i === null) {
        throw new Error(
          "HGBilateralFilterInterpSC::UpdateParams @0x92a20: nodesB[i] is null " +
            "(binary would crash on movq (rdi) @0x92b38)",
        );
      }
      // Compute coef_i = -9.0 / (2·ln2 · r²) in f64 then narrow to f32.
      // @0x92b09..0x92b34:
      //   cvtss2sd  intensityBlurRadius → xmm0d
      //   movapd    xmm0d → xmm1d
      //   mulsd     xmm1d, [K_LN4]      = 2ln2 · r
      //   mulsd     xmm1d, xmm0d        = 2ln2 · r · r
      //   movsd     xmm0d, [K_MINUS9]   = -9.0
      //   divsd     xmm0d, xmm1d        = -9 / (2ln2 · r²)
      //   cvtsd2ss  xmm0d → xmm0f
      const rID = this.intensityBlurRadius; // cvtss2sd — no numeric change
      const denomI = K_LN4 * rID * rID;
      const coefI = Math.fround(-9.0 / denomI);
      // vtable *0x60 SetParameter(0, coefI, coefI, 0, 0)  @0x92b46
      // (xmm3=0 from `xorps xmm3,xmm3` @0x92b3b)
      HGNode_vcall_SetParameter(nodeB_i, 0, coefI, coefI, 0.0, 0.0);

      // ── STEP 3: nodesB[i].SetParameter(1, f, f, f, f)  where
      //   f = i · rangeScale / numBins + rangeOffset
      // @0x92b49..0x92ba9
      if (i >= nodesB.length) {
        throw new RangeError(
          "HGBilateralFilterInterpSC::UpdateParams @0x92a20: nodesB[i] out of range " +
            "(2nd check, @0x92ca3)",
        );
      }
      // Re-fetch pointer (binary reloads @0x92b8d — SetParameter above may
      // have compacted the vector; we mirror the reload defensively).
      const nodeB_i_step3 = nodesB[i];
      if (nodeB_i_step3 === null) {
        throw new Error(
          "HGBilateralFilterInterpSC::UpdateParams @0x92a20: nodesB[i] is null (step 3)",
        );
      }
      // Compute f = float(i) * rangeScale / float(numBins) + rangeOffset.
      // @0x92b67..0x92b88:
      //   cvtsi2ss  r14 (i)              → xmm0
      //   mulss     xmm0, [-0x20](rangeScale)
      //   cvtsi2ss  r15d (numBins)       → xmm1  ; save at -0x24(rbp)
      //   divss     xmm0, xmm1
      //   addss     xmm0, [-0x1c](rangeOffset)
      const fnumBins = Math.fround(numBins);
      const iAsF32 = Math.fround(i);
      const iTimesScale = Math.fround(iAsF32 * rangeScale);
      const iScaleOverN = Math.fround(iTimesScale / fnumBins);
      const f = Math.fround(iScaleOverN + rangeOffset);
      prevBinCenter = f; // saved at -0x40(rbp) @0x92b9f
      // vtable *0x60 SetParameter(1, f, f, f, f)  @0x92ba6
      HGNode_vcall_SetParameter(nodeB_i_step3, 1, f, f, f, f);

      // ── STEP 4: nodesB[i].SetParameter(2, R, G, B, 0)
      // Three branches on filterChannel; exactly one lane is 1.0f.
      // @0x92baf..0x92c72
      const fc = this.filterChannel | 0; // 0x1d8 @0x92ba9
      if (i >= nodesB.length) {
        throw new RangeError(
          "HGBilateralFilterInterpSC::UpdateParams @0x92a20: nodesB[i] out of range " +
            "(3rd check, @0x92ca3)",
        );
      }
      const nodeB_i_step4 = nodesB[i];
      if (nodeB_i_step4 === null) {
        throw new Error(
          "HGBilateralFilterInterpSC::UpdateParams @0x92a20: nodesB[i] is null (step 4)",
        );
      }
      // Cases mirror the exact register assignment:
      //   fc == 1: xmm1=1, xmm0=0, xmm2=0, xmm3=0  → SetParameter(2, 0, 1, 0, 0)
      //   fc == 0: xmm0=1, xmm1=0, xmm2=0, xmm3=0  → SetParameter(2, 1, 0, 0, 0)
      //   else:    xmm2=1, xmm0=0, xmm1=0, xmm3=0  → SetParameter(2, 0, 0, 1, 0)
      let r_arg: number;
      let g_arg: number;
      let b_arg: number;
      if (fc === 1) {
        r_arg = 0.0;
        g_arg = K_ONE_F32;
        b_arg = 0.0;
      } else if (fc === 0) {
        r_arg = K_ONE_F32;
        g_arg = 0.0;
        b_arg = 0.0;
      } else {
        r_arg = 0.0;
        g_arg = 0.0;
        b_arg = K_ONE_F32;
      }
      // vtable *0x60 SetParameter(2, R, G, B, 0)  @0x92bf7/@0x92c36/@0x92c72
      HGNode_vcall_SetParameter(nodeB_i_step4, 2, r_arg, g_arg, b_arg, 0.0);

      // Refresh numBins (binary re-reads at 0x92bfa/0x92c39/0x92c75).
      numBins = this.numBins >>> 0;

      // ── STEP 5 (conditional): nodesC[i].SetParameter(0, f_next, 1/δ, -f/δ, 0)
      // Bounds check on nodesC (vector at 0x1a8).  @0x92c85..0x92c9d
      // Only run if i < len(nodesC).  On the FIRST iteration (i=0) the
      // control flow at the top of the outer loop skips this block via
      // `jmp 0x92a93` @0x92a3a — but every subsequent iteration DOES
      // fall into 0x92a40 if the nodesC bounds check @0x92c9d passes.
      // We therefore gate STEP 5 on `i > 0 && i < len(nodesC)` — the
      // `i > 0` reflects the initial `jmp 0x92a93` @0x92a3a which
      // unconditionally skips STEP 5 on the very first iteration.
      if (i > 0 && nodesC !== null && i < nodesC.length) {
        const nodeC_i = nodesC[i];
        if (nodeC_i === null) {
          throw new Error(
            "HGBilateralFilterInterpSC::UpdateParams @0x92a20: nodesC[i] is null " +
              "(binary would crash on movq (rdi) @0x92a78)",
          );
        }
        // @0x92a40..0x92a7d:
        //   xmm4 = -0x20(rangeScale) / -0x24(numBinsF) + -0x1c(rangeOffset)
        //        = rangeScale/numBins + rangeOffset      [= δ]
        //   xmm1 = xmm4 + -0x40(prevBinCenter)  = δ + f  [= f_next]
        //   xmm2 = 1.0f / xmm4                  = 1/δ
        //   xmm3 = (prevBinCenter XOR -0.0f) / xmm4 = -f/δ
        //   nodeC_i.SetParameter(0, xmm1=f_next, xmm2=1/δ, xmm3=-f/δ, ...)
        const delta = Math.fround(Math.fround(rangeScale / fnumBins) + rangeOffset);
        const f_next = Math.fround(delta + prevBinCenter);
        const invDelta = Math.fround(K_ONE_F32 / delta);
        const negFOverDelta = Math.fround(-prevBinCenter / delta);
        // vtable *0x60 SetParameter(0, f_next, 1/δ, -f/δ, 0)  @0x92a7d
        // (arg1 esi=0 from `xorl esi,esi` @0x92a7b)
        HGNode_vcall_SetParameter(nodeC_i, 0, f_next, invDelta, negFOverDelta, 0.0);
        // Binary re-reads numBins here too @0x92a80.
        numBins = this.numBins >>> 0;
      }

      i += 1;
    }
  }

  /**
   * `HGBilateralFilterInterpSC::GetOutput(HGRenderer*)` @Helium 0x92cc0.
   *
   *   r14 = this->input   (0x1b0)                        @0x92cca
   *   node = renderer->GetInput(this, 0)                 @0x92cd9
   *   input->vtable_78(0, node)   ; SetInput(0, node)    @0x92ce9
   *   if (needsBuildGraph) BuildGraph()                  @0x92cec..0x92cf8
   *   UpdateParams()                                     @0x92d00
   *   return this->outputCache (0x1b8)                   @0x92d05
   */
  public GetOutput(renderer: HGRenderer): HGNode | null {
    // 1. Read the internally-owned input node (never null in the ctor —
    //    but null-check anyway for safety).
    const inputNode = this.inputNode;
    if (inputNode === null) {
      throw new Error(
        "HGBilateralFilterInterpSC::GetOutput @0x92cc0: this.inputNode (0x1b0) is null " +
          "— ctor @0x920c6 always installs a new HGNode; only DestroyGraph clears it",
      );
    }
    // 2. Ask the renderer for the caller's input.  @0x92cd9
    const upstream = renderer.GetInput(this, 0);
    // 3. inputNode.SetInput(0, upstream) via vtable *0x78.  @0x92ce9
    inputNode.SetInput(0, upstream);
    // 4. If the graph needs (re)building, run BuildGraph.  @0x92cec
    if (this.needsBuildGraph) {
      this.BuildGraph();
    }
    // 5. Push the derived shader uniforms.  @0x92d00
    this.UpdateParams();
    // 6. Return the cached output node.  @0x92d05
    return this.outputCache;
  }
}

/**
 * `HGNode::ClearBits()` — void-arg thunk @Helium 0x11c890 that tail-jumps
 * `HGNode::ClearBits(int mask=0xFFFF)` @0x11f6b0.  See HGNode.ts:16.
 *
 * The full body is a walk over the render subgraph's back-link tree and
 * has not yet been transcribed here (@Helium 0x11c890); a throwing stub
 * keeps this port honest per the anti-shortcut spec (§rule 3).
 */
function HGNode_ClearBits(_self: HGNode): void {
  throw new Error(
    "HGNode::ClearBits() @Helium 0x11c890 (→ ClearBits(0xFFFF) @0x11f6b0) " +
      "not yet transcribed (used by HGBilateralFilterInterpSC setters)",
  );
}
