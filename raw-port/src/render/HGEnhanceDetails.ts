// raw-port/src/render/HGEnhanceDetails.ts
//
// FCP `HGEnhanceDetails` — Helium render-graph node (HGNode subclass)
// implementing the "Enhance Details" effect: a compound pipeline of a
// blur, two color matrices, three sharpen stages, and a classification
// helper, driven by two user parameters (index 0 and index 1) whose
// values map through explicit closed-form functions to the internal
// subnode intensities/scales.
//
// This class is a PURE-MATH LEAF in the sense meaningful for the port:
// the interesting decoded content is the two-branch parameter-mapping
// arithmetic in `SetParameter` (a rational feedback function for idx=0
// and a reciprocal-of-linear-mix function for idx=1). The class also
// declares the subnode ownership layout and the child-fan-out shape of
// `GetOutput` (linear chain: input -> blur -> sharpen -> sharpen ->
// sharpen -> matrixB, plus internal matrixA/classify subnodes not on
// the render chain).
//
// PROVENANCE:
//   Binary : /Applications/Final Cut Pro.app/Contents/Frameworks/
//            Helium.framework/Versions/A/Helium (x86_64 slice; VAs are
//            unadjusted VM addresses from `otool -tV`).
//   Fat-slice file offset for constant reads: 0x4000 (Helium is FAT).
//   The thin slice at /tmp/Helium.x86_64 has VA == file offset — used
//   by resolve.py for direct float32 constant reads.
//
// LEDGER SYMBOLS (all Helium):
//   0x228a90  HGEnhanceDetails::HGEnhanceDetails()             [C2]
//   0x228f10  HGEnhanceDetails::HGEnhanceDetails()             [C1 tail-jmp]
//   0x228f20  HGEnhanceDetails::~HGEnhanceDetails()            [D2 base]
//   0x228fb0  HGEnhanceDetails::~HGEnhanceDetails()            [D1 complete]
//   0x229040  HGEnhanceDetails::~HGEnhanceDetails()            [D0 deleting]
//   0x2290d0  HGEnhanceDetails::SetParameter(int, float, float, float, float)
//   0x229220  HGEnhanceDetails::GetOutput(HGRenderer*)
//
// VTABLE (from `resolve.py Helium vtable HGEnhanceDetails`):
//   vtable object @0xa329f0; installed ptr 0xa32a00. Overrides in this
//   class:
//     *0x00/*0x08  ~HGEnhanceDetails (D2/D0)  @0x228fb0/@0x229040
//     *0x60        SetParameter               @0x2290d0
//   (all other slots resolve to HGNode base implementations.)
//
// STRUCT LAYOUT (recovered from C2 @0x228a90 and D2 @0x228f20; base
// HGNode subobject is 0x198 bytes, taken from HGNode.ts):
//   HGEnhanceDetails {
//     +0x000  vptr                             (= 0xa32a00 installed by C2)
//     +0x008..+0x197                            (HGNode base subobject)
//     +0x198  f32 param0                       (SetParameter idx=0 cached
//                                                input; written @0x229100.
//                                                Zero-init by C2 @0x228aac
//                                                via `xorps xmm0` +
//                                                `movups xmm0, 0x198(rbx)`.)
//     +0x19c  f32 param0Mapped                 (= x/(1+x+x^2); written
//                                                @0x229126; used to drive
//                                                sharpenA's intensity.
//                                                Zero-init by the same
//                                                movups.)
//     +0x1a0  f32 xa1                          (= x*param0Mapped; low f32
//     +0x1a4  f32 xa2                            of the pshufd/mulps mixed
//                                                store @0x22913b; drives
//                                                sharpenB. High f32 =
//                                                x*x*param0Mapped; drives
//                                                sharpenC.)
//     +0x1a8  f32 param1                       (SetParameter idx=1 cached
//                                                input; written @0x2291b3.
//                                                Zero-init by
//                                                `movl $0x0, 0x1a8(rbx)`
//                                                @0x228ab6.)
//     +0x1b0  HGBlur*             blur         (C2 alloc 0x220 @0x228ac0,
//                                                ctor @0x228ad0.)
//     +0x1b8  HGColorMatrix*      matrixA      (C2 alloc 0x200 @0x228adc,
//                                                C2 ctor @0x228aec, with
//                                                explicit vptr overwrite
//                                                @0x228af1/@0x228af8 to
//                                                Helium 0xa32330 — a
//                                                specialized ColorMatrix
//                                                subclass vtable. Also
//                                                sets a `1` at +0x1f8
//                                                @0x228afb, and allocates
//                                                a 0x147-byte inline LUT
//                                                blob loaded with 16
//                                                aligned xmm stores of
//                                                4 recurring float vectors.)
//     +0x1c0  HGSharpen*          sharpenA     (C2 alloc 0x1c0 @0x228be2,
//                                                ctor @0x228bf2.)
//     +0x1c8  HGSharpen*          sharpenB     (C2 alloc 0x1c0 @0x228bfe,
//                                                ctor @0x228c0e.)
//     +0x1d0  HGSharpen*          sharpenC     (C2 alloc 0x1c0 @0x228c1a,
//                                                ctor @0x228c2a.)
//     +0x1d8  HGEnhanceDetails_Classify*
//                                classify      (C2 alloc 0x1a0 @0x228c36,
//                                                ctor @0x228c46.)
//     +0x1e0  HGNode*             matrixB      (C2 alloc 0x1a0 @0x228c52,
//                                                base HGNode ctor
//                                                @0x228c62 with explicit
//                                                vptr overwrite
//                                                @0x228c67/@0x228c6e to
//                                                Helium 0xa32588. Also
//                                                allocates a 0x187-byte
//                                                inline data blob loaded
//                                                with the second-matrix
//                                                LUT via aligned xmm
//                                                stores.)
//   }
//
// PARAMETER SEMANTICS (from SetParameter @0x2290d0):
//   idx == 0 branch: "detail intensity" — the input `x` is stored raw at
//     +0x198, then mapped via a smooth rational feedback:
//         y = x / (1 + x + x*x)              @0x229108..@0x229126
//     `y` is broadcast into xmm2 via `movsldup` and multiplied against
//     the [x, x*x, ...] pair built by `insertps $0x10` to produce a
//     two-lane result (x*y, x*x*y) which is written as movlps to
//     +0x1a0/+0x1a4. Then `y` is fed as SetParameter idx=0 to sharpenA,
//     the +0x1a0 value to sharpenB, and the +0x1a4 value to sharpenC,
//     each via the subnode's vtable slot *0x60. HGNode::ClearBits() is
//     then called on `this` @0x229200 and 1 is returned.
//
//   idx == 1 branch: "detail radius" — the input `x` is stored raw at
//     +0x1a8, then mapped via a reciprocal-of-linear-mix:
//         y = 1.0 / ( (1 - x) * 1e-4  +  x * 10.0 )
//                                             @0x2291bb..@0x2291e2
//     `y` is fed as SetParameter idx=0 to the subnode at +0x1d8 (this
//     is `classify` — HGEnhanceDetails_Classify — verified by the D2
//     dtor release-order enumeration below) via its vtable slot *0x60.
//     HGNode::ClearBits() is then called on `this` @0x229200 and 1 is
//     returned.
//
//   Any other idx: returns -1 (0xFFFFFFFF -> asIntN 32 => -1).
//
// SetParameter EARLY-OUT: for each branch, if the incoming float `x`
// compares equal (ucomiss + jne/jnp NaN-ordered) to the currently-cached
// value at +0x198 (idx=0) or +0x1a8 (idx=1), the function returns 0
// unchanged. This is the NaN-ordered equality idiom preserved with `!==`
// (NOT `Object.is`) — NaN != NaN is required.
//
// GetOutput (@0x229220): pulls the parent renderer's input for this
// node via HGRenderer::GetInput(this, 0); if the cached param0 at +0x198
// is 0.0 (NaN-ordered), returns the upstream input node in %rax
// unchanged (the early-out at @0x229245..@0x22924d has no further
// stores). Otherwise it fans the upstream node to five subnode
// SetInput(0, upstream) calls at +0x1b0 (blur), +0x1c0 (sharpenA),
// +0x1c8 (sharpenB), +0x1d0 (sharpenC), +0x1e0 (matrixB), then returns
// matrixB (@+0x1e0). Note: matrixA (+0x1b8) and classify (+0x1d8) are
// NOT on the render chain built by GetOutput.
//
// GATE NOTE: only SetParameter and GetOutput carry decodable arithmetic
// worth transcribing at this layer. The ctor is a 238-line graph-builder
// with two big inline float-vector LUTs (0x147 + 0x187 bytes of aligned
// xmm stores) whose faithful transcription requires resolving ~32
// RIP-relative movaps sources — deferred behind explicit throw stubs
// citing their @0xADDR per PORTING_SPEC Rule 3. The D2/D0 dtors chain
// through the 7 subnode releases at slot 0x18 and are modeled as throw
// stubs pending HGNode::~HGNode transcription.

import { HGNode } from "./HGNode";

/** Opaque handle for `HGRenderer*`. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/** Opaque forward-references for the seven subnode types held by
 *  HGEnhanceDetails. Each is a peer HGNode subclass in Helium; the
 *  fields observed here are only the ones referenced by this class. */
export interface HGBlurPtr { readonly __brand: "HGBlur"; }
export interface HGColorMatrixPtr { readonly __brand: "HGColorMatrix"; }
export interface HGSharpenPtr { readonly __brand: "HGSharpen"; }
export interface HGEnhanceDetails_ClassifyPtr { readonly __brand: "HGEnhanceDetails_Classify"; }
/** matrixB slot @+0x1e0 — allocated as a bare HGNode with a specialized
 *  vptr overwrite; effectively a second color-matrix operator in the
 *  chain. Modeled as an opaque HGNode subtype. */
export interface HGColorMatrixBPtr { readonly __brand: "HGColorMatrixB"; }

/** RIP-const at Helium 0x3c7cc0 — float32 `1.0`. Read twice by
 *  SetParameter (@0x229108 for the idx=0 branch's denom seed; @0x2291bb
 *  for the idx=1 branch's reciprocal numerator seed). Byte-verified via
 *  `resolve.py Helium const 0x3c7cc0` (low u32 = 0x3f800000). */
const ONE_HELIUM_0x3C7CC0 = Math.fround(1.0);
/** RIP-const at Helium 0x3cb260 — float32 `1e-4` (0.0001). Multiplied
 *  against `(1 - x)` in the idx=1 branch @0x2291ca. Byte-verified via
 *  `resolve.py Helium const 0x3cb260` (float32 =
 *  9.999999747378752e-05, the nearest-representable float32 of 1e-4). */
const IDX1_LOW_HELIUM_0x3CB260 = Math.fround(1e-4);
/** RIP-const at Helium 0x3cc1a4 — float32 `10.0`. Multiplied against
 *  `x` in the idx=1 branch @0x2291d2. Byte-verified via
 *  `resolve.py Helium const 0x3cc1a4` (float32 = 10.0). */
const IDX1_HIGH_HELIUM_0x3CC1A4 = Math.fround(10.0);

// ----- Frontier stubs: subnode allocation, ctors, dtor slots, and the
// two upstream HGRenderer / HGNode entry points reached by this class.
// Each stub cites the exact @0xADDR of the call site (or the callee
// address where uniquely identifiable) so `frontier.py` can see the gap.

/** Frontier: `HGObject::operator new(unsigned long)` — allocates all
 *  seven subnodes plus the two inline LUT blobs. Called from C2 at
 *  many sites (@0x228ac0 for HGBlur 0x220, @0x228adc for HGColorMatrix
 *  0x200, @0x228be2/@0x228bfe/@0x228c1a for the three HGSharpen 0x1c0,
 *  @0x228c36 for HGEnhanceDetails_Classify 0x1a0, @0x228c52 for the
 *  second HGColorMatrix 0x1a0). */
function HGObject_operator_new_HGEnhanceDetails_C2_call(_size: number): unknown {
  throw new Error(
    "HGObject::operator new(unsigned long) @Helium __ZN8HGObjectnwEm @0x228ac0 not yet transcribed",
  );
}

/** Frontier: `HGBlur::HGBlur()` — @Helium __ZN6HGBlurC1Ev, called
 *  @0x228ad0. */
function HGBlur_C1_HGEnhanceDetails_call(_self: HGBlurPtr): void {
  throw new Error("HGBlur::HGBlur @Helium __ZN6HGBlurC1Ev @0x228ad0 not yet transcribed");
}
/** Frontier: `HGColorMatrix::HGColorMatrix()` — @Helium
 *  __ZN13HGColorMatrixC2Ev, called @0x228aec. */
function HGColorMatrix_C2_HGEnhanceDetails_call(_self: HGColorMatrixPtr): void {
  throw new Error(
    "HGColorMatrix::HGColorMatrix @Helium __ZN13HGColorMatrixC2Ev @0x228aec not yet transcribed",
  );
}
/** Frontier: `HGSharpen::HGSharpen()` — @Helium __ZN9HGSharpenC1Ev,
 *  called @0x228bf2 / @0x228c0e / @0x228c2a. */
function HGSharpen_C1_HGEnhanceDetails_call(_self: HGSharpenPtr): void {
  throw new Error(
    "HGSharpen::HGSharpen @Helium __ZN9HGSharpenC1Ev @0x228bf2 not yet transcribed",
  );
}
/** Frontier: `HGEnhanceDetails_Classify::HGEnhanceDetails_Classify()` —
 *  @Helium __ZN25HGEnhanceDetails_ClassifyC2Ev, called @0x228c46. */
function HGEnhanceDetails_Classify_C2_HGEnhanceDetails_call(
  _self: HGEnhanceDetails_ClassifyPtr,
): void {
  throw new Error(
    "HGEnhanceDetails_Classify::HGEnhanceDetails_Classify @Helium __ZN25HGEnhanceDetails_ClassifyC2Ev @0x228c46 not yet transcribed",
  );
}
/** Frontier: `HGNode::HGNode()` — @Helium __ZN6HGNodeC2Ev, called
 *  @0x228a9d for the class's own base subobject and @0x228c62 for the
 *  matrixB slot's base subobject before its vptr overwrite. */
function HGNode_C2_HGEnhanceDetails_call(_self: unknown): void {
  throw new Error("HGNode::HGNode @Helium __ZN6HGNodeC2Ev @0x228a9d not yet transcribed");
}
/** Frontier: `HGNode::ClearBits()` (no-arg) — @Helium
 *  __ZN6HGNode9ClearBitsEv, called by SetParameter @0x229200. */
function HGNode_ClearBits_noarg(_self: HGEnhanceDetails): void {
  throw new Error(
    "HGNode::ClearBits() (no-arg) @Helium __ZN6HGNode9ClearBitsEv @0x229200 not yet transcribed",
  );
}
/** Frontier: `HGRenderer::GetInput(HGNode*, int)` — @Helium
 *  __ZN10HGRenderer8GetInputEP6HGNodei, called by GetOutput @0x229232. */
function HGRenderer_GetInput(
  _renderer: HGRendererPtr,
  _self: HGEnhanceDetails,
  _slot: number,
): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0x229232 not yet transcribed",
  );
}

/** Frontier: subnode vtable slot *0x60 = SetParameter(idx, a, b, c, d).
 *  Called from SetParameter idx=0 branch on sharpenA @0x22915d,
 *  sharpenB @0x22917e, sharpenC via the shared tail-jmp @0x2291a2 into
 *  callq site @0x2291fa; and from the idx=1 branch on `classify` also
 *  via the shared callq @0x2291fa. */
function subnode_vfn_0x60_SetParameter(
  _self: unknown,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  throw new Error(
    "subnode vtable[0x60] (SetParameter) @Helium @0x22915d/@0x22917e/@0x2291fa not yet transcribed",
  );
}

/** Frontier: subnode vtable slot *0x78 = SetInput(int, HGNode*). Called
 *  from GetOutput @0x229260 (blur), @0x229272 (sharpenA), @0x229284
 *  (sharpenB), @0x229296 (sharpenC), @0x2292a8 (matrixB). */
function subnode_vfn_0x78_SetInput(
  _self: unknown,
  _slot: number,
  _upstream: HGNode | null,
): HGNode | null {
  throw new Error(
    "subnode vtable[0x78] (SetInput) @Helium @0x229260/@0x229272/@0x229284/@0x229296/@0x2292a8 not yet transcribed",
  );
}

/** Frontier: `HGNode::~HGNode()` — @Helium __ZN6HGNodeD2Ev, tail-jmp
 *  target of D2 @0x228f97. */
function HGNode_D2_HGEnhanceDetails_tail(_self: HGEnhanceDetails): void {
  throw new Error("HGNode::~HGNode @Helium __ZN6HGNodeD2Ev @0x228f97 not yet transcribed");
}
/** Frontier: subnode vtable slot *0x18 (release). Called seven times in
 *  D2 @0x228f3d/@0x228f4a/@0x228f57/@0x228f64/@0x228f71/@0x228f7e/@0x228f8b. */
function subnode_vfn_0x18_release_HGEnhanceDetails_D2(_self: unknown): void {
  throw new Error(
    "subnode vtable[0x18] (release) @Helium @0x228f3d..@0x228f8b not yet transcribed",
  );
}

/**
 * `HGEnhanceDetails` — Helium render-graph node implementing the
 * "Enhance Details" effect. See file header for full topology.
 *
 * @Helium symbols owned by this class:
 *   C2         @0x228a90    C1 (tail-jmp) @0x228f10
 *   D2         @0x228f20    D1 @0x228fb0    D0 @0x229040
 *   SetParameter @0x2290d0
 *   GetOutput  @0x229220
 *
 * VTable installed at Helium 0xa32a00.
 */
export class HGEnhanceDetails extends HGNode {
  /** +0x198 f32 param0 — the raw idx=0 SetParameter argument, cached
   *  for the NaN-ordered `ucomiss` equality early-out. Zero-init by C2
   *  via `xorps xmm0 ; movups xmm0, 0x198(rbx)` @0x228aac/@0x228aaf. */
  param0 = Math.fround(0.0);
  /** +0x19c f32 param0Mapped — the rational mapping `x/(1+x+x^2)` of
   *  param0; written @0x229126 by SetParameter and then fed to sharpenA
   *  as its idx=0 parameter. Zero-init by the same movups store
   *  @0x228aaf. */
  param0Mapped = Math.fround(0.0);
  /** +0x1a0 f32 xa1 = x*param0Mapped; first f32 of the movlps store
   *  @0x22913b (built by `movsldup %xmm1,%xmm2 ; mulps %xmm0,%xmm2`
   *  @0x229134/@0x229138 against the [x, x*x, ...] vector from the
   *  `insertps $0x10, %xmm3, %xmm0` @0x22912e); fed to sharpenB as its
   *  idx=0 parameter. Zero-init by the movups store @0x228aaf. */
  xa1 = Math.fround(0.0);
  /** +0x1a4 f32 xa2 = x*x*param0Mapped; second f32 of the same movlps
   *  store; fed to sharpenC as its idx=0 parameter. */
  xa2 = Math.fround(0.0);
  /** +0x1a8 f32 param1 — the raw idx=1 SetParameter argument, cached
   *  for the NaN-ordered ucomiss early-out. Zero-init by
   *  `movl $0x0, 0x1a8(rbx)` @0x228ab6. */
  param1 = Math.fround(0.0);
  /** +0x1b0 HGBlur* blur — allocated 0x220 @0x228ac0, constructed
   *  @0x228ad0. */
  blur: HGBlurPtr | null = null;
  /** +0x1b8 HGColorMatrix* matrixA — allocated 0x200 @0x228adc,
   *  constructed via C2 @0x228aec, then vptr overwritten to Helium
   *  0xa32330 @0x228af1/@0x228af8, and had its +0x1f8 int field set to
   *  1 @0x228afb. Held internally but not part of the render chain in
   *  GetOutput (which uses matrixB @+0x1e0 as its terminal). */
  matrixA: HGColorMatrixPtr | null = null;
  /** +0x1c0 HGSharpen* sharpenA — allocated 0x1c0 @0x228be2, constructed
   *  @0x228bf2. */
  sharpenA: HGSharpenPtr | null = null;
  /** +0x1c8 HGSharpen* sharpenB — allocated 0x1c0 @0x228bfe, constructed
   *  @0x228c0e. */
  sharpenB: HGSharpenPtr | null = null;
  /** +0x1d0 HGSharpen* sharpenC — allocated 0x1c0 @0x228c1a, constructed
   *  @0x228c2a. */
  sharpenC: HGSharpenPtr | null = null;
  /** +0x1d8 HGEnhanceDetails_Classify* classify — allocated 0x1a0
   *  @0x228c36, constructed @0x228c46. Held internally; target of the
   *  idx=1 branch's SetParameter call. */
  classify: HGEnhanceDetails_ClassifyPtr | null = null;
  /** +0x1e0 HGColorMatrixB* matrixB — allocated 0x1a0 @0x228c52, base
   *  HGNode ctor @0x228c62, vptr overwrite to Helium 0xa32588
   *  @0x228c67/@0x228c6e. Terminal node of the GetOutput chain. */
  matrixB: HGColorMatrixBPtr | null = null;

  /**
   * `HGEnhanceDetails::HGEnhanceDetails()` — Helium C2 @0x228a90 (C1
   * @0x228f10 tail-jmps here @0x228f15).
   *
   * Full body (238 lines of disasm) allocates seven subnodes and
   * initializes two inline float-vector LUTs via ~32 aligned xmm
   * stores. Faithful transcription is deferred per PORTING_SPEC Rule 3
   * — the individual allocation, subnode-ctor, and LUT-load callees
   * are frontier stubs above. See file header STRUCT LAYOUT for the
   * per-field @0xADDR provenance.
   */
  constructor() {
    super();
    // @0x228a90..@0x228f10 not yet transcribed — throw so callers see
    // the gap loudly per PORTING_SPEC Rule 3.
    throw new Error(
      "HGEnhanceDetails::HGEnhanceDetails() @Helium __ZN16HGEnhanceDetailsC2Ev @0x228a90 not yet transcribed",
    );
  }

  /**
   * `HGEnhanceDetails::SetParameter(int idx, float a, float b, float c, float d)`
   * — Helium @0x2290d0. Returns:
   *   - 1 on a successful write (matches FCP's convention for this
   *     Helium vtable slot).
   *   - 0 on the NaN-ordered equality early-out.
   *   - -1 for any idx not in {0, 1}.
   *
   * The `b`, `c`, `d` arguments are ignored (they exist in the mangled
   * signature `_iffff` but the body only reads xmm0 = `a`).
   */
  SetParameter(idx: number, a: number, _b: number, _c: number, _d: number): number {
    // @0x2290d7 cmpl $0x1, %esi ; je 0x2291a4  — idx==1 -> second branch.
    // @0x2290e0 movl $0xffffffff, %eax        — default return -1.
    // @0x2290e5 testl %esi, %esi ; jne 0x22920a — non-{0,1} exits -1.
    if (idx !== 0 && idx !== 1) {
      return -1; // @0x2290e0/@0x22920a
    }

    // SetParameter is invoked via a cdecl that passes `a` in %xmm0
    // (float32); wrap in Math.fround at the boundary so downstream
    // ucomiss/ops preserve float32 semantics.
    const x = Math.fround(a);

    if (idx === 0) {
      // @0x2290ed movss 0x198(%rdi), %xmm1
      // @0x2290f5 ucomiss %xmm0, %xmm1 ; jne 0x229100 ; jnp 0x22920f
      //   NaN-ordered equality: if xmm1 == xmm0 AND !NaN, fall through
      //   to 0x22920f which returns 0. Preserved verbatim with `!==`.
      if (this.param0 === x) {
        return 0; // @0x22920f
      }
      // @0x229100 movss %xmm0, 0x198(%rdi)         — cache raw input.
      this.param0 = x;

      // @0x229108 movss 0x19ebb0(%rip), %xmm2      xmm2 = 1.0
      //   (RIP addr 0x229110 + 0x19ebb0 = 0x3c7cc0; float32 1.0)
      // @0x229110 addss %xmm0, %xmm2               xmm2 = 1 + x
      // @0x229114 movaps %xmm0, %xmm3
      // @0x229117 mulss  %xmm0, %xmm3              xmm3 = x*x
      // @0x22911b addss  %xmm3, %xmm2              xmm2 = 1 + x + x*x
      const xSq = Math.fround(x * x); // @0x229117
      const denom = Math.fround(Math.fround(ONE_HELIUM_0x3C7CC0 + x) + xSq); // @0x22911b

      // @0x22911f movaps %xmm0, %xmm1
      // @0x229122 divss  %xmm2, %xmm1              xmm1 = x / (1+x+x*x)
      // @0x229126 movss  %xmm1, 0x19c(%rdi)
      const y = Math.fround(x / denom); // @0x229122
      this.param0Mapped = y; // @0x229126

      // @0x22912e insertps $0x10, %xmm3, %xmm0     xmm0.lane1 <- xmm3.lane0
      //   -> xmm0 = [x, x*x, x[2..3]]  (upper lanes carried but unused
      //     by the subsequent movlps low-2 store).
      // @0x229134 movsldup %xmm1, %xmm2            xmm2 = [y, y, ...]
      // @0x229138 mulps    %xmm0, %xmm2            xmm2 = [x*y, x*x*y, ...]
      // @0x22913b movlps   %xmm2, 0x1a0(%rdi)      store low-2 f32s.
      const xa1 = Math.fround(x * y); // @0x229138 low lane
      const xa2 = Math.fround(xSq * y); // @0x229138 lane 1
      this.xa1 = xa1;
      this.xa2 = xa2;

      // @0x229142 movq  0x1c0(%rdi), %rax          — load sharpenA.
      // @0x229149 movq  (%rax), %rcx               — vtable ptr.
      // @0x22914c movq  %rdi, %r14                 — save this.
      // @0x22914f movq  %rax, %rdi                 — sharpenA -> rdi.
      // @0x229152 xorl  %esi, %esi                 — idx = 0.
      // @0x229154..@0x22915d call *0x60(%rcx) with
      //   xmm0=xmm1=xmm2=xmm3 = y  (all four float args = y).
      subnode_vfn_0x60_SetParameter(this.sharpenA, 0, y, y, y, y);

      // @0x229160 movq  0x1c8(%r14), %rdi          — sharpenB.
      // @0x229167 movss 0x1a0(%r14), %xmm0         — xa1.
      // @0x229170..@0x22917e — call *0x60(%rax) idx=0, all four args = xa1.
      const xa1Load = this.xa1;
      subnode_vfn_0x60_SetParameter(this.sharpenB, 0, xa1Load, xa1Load, xa1Load, xa1Load);

      // @0x229181 movq  0x1d0(%r14), %rdi          — sharpenC.
      // @0x229188 movq  %r14, %rbx                 — save this in rbx.
      // @0x22918b movss 0x1a4(%r14), %xmm0         — xa2.
      // @0x229194..@0x22919f — prep xmm1/xmm2/xmm3 = xmm0.
      // @0x2291a2 jmp   0x2291fa                   — shared tail with
      //   the idx=1 branch: `callq *0x60(%rax)` then ClearBits + ret 1.
      const xa2Load = this.xa2;
      subnode_vfn_0x60_SetParameter(this.sharpenC, 0, xa2Load, xa2Load, xa2Load, xa2Load);

      // @0x2291fd movq %rbx, %rdi                  — restore self.
      // @0x229200 callq __ZN6HGNode9ClearBitsEv
      HGNode_ClearBits_noarg(this);
      // @0x229205 movl $0x1, %eax                  — return 1.
      return 1;
    }

    // idx === 1 branch @0x2291a4..@0x229205:
    // @0x2291a4 movss  0x1a8(%rdi), %xmm1
    // @0x2291ac ucomiss %xmm0, %xmm1 ; jne 0x2291b3 ; jnp 0x22920f
    //   Same NaN-ordered early-out as the idx=0 branch, on +0x1a8.
    if (this.param1 === x) {
      return 0; // @0x22920f
    }
    // @0x2291b3 movss %xmm0, 0x1a8(%rdi)          — cache raw input.
    this.param1 = x;

    // @0x2291bb movss 0x19eafd(%rip), %xmm1        xmm1 = 1.0
    //   (RIP addr 0x2291c3 + 0x19eafd = 0x3c7cc0 — same 1.0 constant
    //    as the idx=0 branch's denom seed.)
    // @0x2291c3 movaps %xmm1, %xmm2
    // @0x2291c6 subss  %xmm0, %xmm2                xmm2 = 1 - x
    // @0x2291ca mulss  0x1a208e(%rip), %xmm2       xmm2 = (1-x) * 1e-4
    //   (RIP addr 0x2291d2 + 0x1a208e = 0x3cb260; float32 1e-4)
    // @0x2291d2 mulss  0x1a2fca(%rip), %xmm0       xmm0 = x * 10.0
    //   (RIP addr 0x2291da + 0x1a2fca = 0x3cc1a4; float32 10.0)
    // @0x2291da addss  %xmm2, %xmm0                xmm0 = x*10 + (1-x)*1e-4
    // @0x2291de divss  %xmm0, %xmm1                xmm1 = 1.0 / xmm0
    const low = Math.fround(Math.fround(ONE_HELIUM_0x3C7CC0 - x) * IDX1_LOW_HELIUM_0x3CB260);
    const high = Math.fround(x * IDX1_HIGH_HELIUM_0x3CC1A4);
    const mix = Math.fround(high + low);
    const yInv = Math.fround(ONE_HELIUM_0x3C7CC0 / mix);

    // @0x2291e2 movq %rdi, %rbx                    — save self.
    // @0x2291e5 movq 0x1d8(%rdi), %rdi             — subnode +0x1d8 =
    //   classify (HGEnhanceDetails_Classify*), verified by D2 release
    //   order (the six subnode releases at 0x1b0/0x1b8/0x1c0/0x1c8/
    //   0x1d0/0x1d8/0x1e0 correspond to blur/matrixA/sharpenA/sharpenB/
    //   sharpenC/classify/matrixB in ledger-insertion order).
    // @0x2291ec movq (%rdi), %rax                   — vtable ptr.
    // @0x2291ef xorl %esi, %esi                     — idx = 0.
    // @0x2291f1..@0x2291f7 movaps %xmm1 broadcasts.
    // @0x2291fa callq *0x60(%rax)                   — subnode SetParameter.
    subnode_vfn_0x60_SetParameter(this.classify, 0, yInv, yInv, yInv, yInv);

    // @0x2291fd..@0x229205 — same tail as idx=0: ClearBits + return 1.
    HGNode_ClearBits_noarg(this);
    return 1;
  }

  /**
   * `HGEnhanceDetails::GetOutput(HGRenderer* renderer)` — Helium
   * @0x229220. Returns the pipeline's terminal HGNode:
   *   - matrixB (@+0x1e0) after chaining
   *       upstream -> blur.SetInput(0, upstream)
   *                -> sharpenA.SetInput(0, upstream)
   *                -> sharpenB.SetInput(0, upstream)
   *                -> sharpenC.SetInput(0, upstream)
   *                -> matrixB.SetInput(0, upstream)
   *     via each subnode's *0x78 slot. (All five subnodes are fed the
   *     SAME `upstream` node — in FCP's HGNode graph, SetInput just
   *     records an edge; the renderer resolves the actual graph
   *     backwards from the returned terminal node.)
   *   - If `param0` (@+0x198) equals 0.0f (NaN-ordered), the function
   *     short-circuits at @0x229245..@0x22924d without any SetInput
   *     chaining and returns whatever HGRenderer::GetInput left in
   *     %rax — i.e. the raw upstream input node unchanged.
   */
  GetOutput(renderer: HGRendererPtr): HGNode | null {
    // @0x229227 movq %rdi, %rbx                     — save self.
    // @0x22922a movq %rsi, %rdi                     — renderer -> rdi.
    // @0x22922d movq %rbx, %rsi                     — this -> rsi.
    // @0x229230 xorl %edx, %edx                     — slot 0.
    // @0x229232 callq __ZN10HGRenderer8GetInputEP6HGNodei
    const upstream = HGRenderer_GetInput(renderer, this, 0);

    // @0x229237 movss 0x198(%rbx), %xmm0            — param0.
    // @0x22923f xorps %xmm1, %xmm1
    // @0x229242 ucomiss %xmm1, %xmm0 ; jne 0x22924e ; jp 0x22924e
    //   Short-circuit: if param0 == 0.0 AND !NaN, return %rax unchanged
    //   (the upstream node from GetInput). NaN-ordered equality with
    //   `===` on `Math.fround(0.0)` — NaN != 0 is preserved.
    if (this.param0 === Math.fround(0.0)) {
      return upstream; // @0x229249..@0x22924d
    }

    // @0x22924e movq 0x1b0(%rbx), %rdi              — blur.
    // @0x229255 movq (%rdi), %rcx                   — vtable ptr.
    // @0x229258 xorl %esi, %esi                     — slot 0.
    // @0x22925a movq %rax, %rdx                     — upstream.
    // @0x22925d movq %rax, %r14                     — save upstream.
    // @0x229260 callq *0x78(%rcx)                   — blur.SetInput(0, upstream)
    subnode_vfn_0x78_SetInput(this.blur, 0, upstream);

    // @0x229263 movq 0x1c0(%rbx), %rdi              — sharpenA.
    // @0x22926a movq (%rdi), %rax
    // @0x22926d xorl %esi, %esi
    // @0x22926f movq %r14, %rdx
    // @0x229272 callq *0x78(%rax)                   — sharpenA.SetInput(0, upstream)
    subnode_vfn_0x78_SetInput(this.sharpenA, 0, upstream);

    // @0x229275..@0x229284 — sharpenB.SetInput(0, upstream)
    subnode_vfn_0x78_SetInput(this.sharpenB, 0, upstream);

    // @0x229287..@0x229296 — sharpenC.SetInput(0, upstream)
    subnode_vfn_0x78_SetInput(this.sharpenC, 0, upstream);

    // @0x229299..@0x2292a8 — matrixB.SetInput(0, upstream)
    subnode_vfn_0x78_SetInput(this.matrixB, 0, upstream);

    // @0x2292ab movq 0x1e0(%rbx), %rax               — return matrixB.
    return this.matrixB as unknown as HGNode;
  }
}

// Silence unused-symbol warnings from tsc for frontier stubs that model
// call sites of C2/D2 but aren't invoked from the two ported methods.
// (Removing these `void` refs would require deleting the stubs, which
// would erase the @0xADDR frontier annotations the ledger relies on.)
void HGObject_operator_new_HGEnhanceDetails_C2_call;
void HGBlur_C1_HGEnhanceDetails_call;
void HGColorMatrix_C2_HGEnhanceDetails_call;
void HGSharpen_C1_HGEnhanceDetails_call;
void HGEnhanceDetails_Classify_C2_HGEnhanceDetails_call;
void HGNode_C2_HGEnhanceDetails_call;
void HGNode_D2_HGEnhanceDetails_tail;
void subnode_vfn_0x18_release_HGEnhanceDetails_D2;
