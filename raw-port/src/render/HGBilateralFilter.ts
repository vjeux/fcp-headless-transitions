// raw-port/src/render/HGBilateralFilter.ts
//
// FCP `HGBilateralFilter` — a Helium render-graph node that wraps a
// bilateral-filter kernel node.  Concretely it is a thin `HGNode` subclass
// that owns three tuning parameters and, on `GetOutput`, lazily constructs
// an `HGBilateralFilterKernelNode`, feeds it the ingress input, then pushes
// the derived (spatialSigmaCoef, intensitySigmaCoef, windowSize) into the
// kernel via `SetParameter(0)`, `SetParameter(1)`, and `SetWindowSize(int)`.
//
// Symbols decoded here (Helium.framework, x86_64 slice):
//   0x1c87d0  HGBilateralFilter::HGBilateralFilter()   [C1 == C2 == C1]
//   0x1c8940  HGBilateralFilter::SetSpatialBlurRadius(float)
//   0x1c8970  HGBilateralFilter::SetIntensityBlurRadius(float)
//   0x1c89a0  HGBilateralFilter::SetFilterSpatialWindow(float)
//   0x1c89d0  HGBilateralFilter::UpdateParams()
//   0x1c8ad0  HGBilateralFilter::GetOutput(HGRenderer*)
//
// Called-into symbols (kept as citations; the kernel-node subsystem is not
// yet transcribed and shows up here as throwing stubs with @0xADDR):
//   HGNode::HGNode()                                  @0x11baf0 (real, imported)
//   HGNode::ClearBits()                               @0x11c890 (tail-jmps ClearBits(0xffff))
//   HGRenderer::GetInput(HGNode*, int)                — extern (not yet ported)
//   HGObject::operator new(unsigned long)             @Helium (real, imported)
//   HGObject::operator delete(void*)                  @Helium (real, imported)
//   HGBilateralFilterKernelNode::HGBilateralFilterKernelNode()   — not ported
//   HGBilateralFilterKernelNode::SetWindowSize(int)             — not ported
//   virtual *0x18 dtor (HGObject::Release)            — HGNode vtable slot
//   virtual *0x60 SetParameter(int,float,float,float,float)     — HGNode vtable slot
//   virtual *0x78 SetInput(int, HGNode*)              — HGNode vtable slot
//
// ── LAYOUT (recovered from ctor @0x1c87d0 + setter offsets) ──────────────
// Extends HGNode (base is 0x198 bytes wide; see HGNode.ts).  Own fields:
//     0x198 : 16 bytes zero-init via `xorps %xmm0,%xmm0 ; movups %xmm0,0x198`
//             (0x198,0x1a0 pair).  Only 0x1a0 is later observed reused as a
//             pointer to HGBilateralFilterKernelNode (see GetOutput @0x1c8b3c).
//     0x198 : void* field_198              — cleared to null; role undecoded.
//     0x1a0 : HGBilateralFilterKernelNode* kernel  — cleared to null; lazily
//             allocated and installed by GetOutput.
//     0x1a8 : f32   spatialBlurRadius      — init 1.0f (via movsd of the
//             8-byte constant @Helium 0x3ca0b0 = { 0x3f800000, 0x3f800000 }
//             which stores 1.0 into 0x1a8 AND 1.0 into 0x1ac in one write).
//     0x1ac : f32   intensityBlurRadius    — init 1.0f (upper half of same
//             movsd @0x3ca0b0; see above).
//     0x1b0 : f32   filterSpatialWindow    — init 3.0f (movl $0x40400000).
//
// ── DECODED FLOAT CONSTANTS USED BY UpdateParams / GetOutput ──────────────
//   K_HALF3        = 3.0                  @Helium 0x3ccd50 (8B: 0x4008000000000000)
//   K_SIGN_MASK32  = { 0x80000000, ... }  @Helium 0x3ca0d0 (xorps sign-flip)
//   K_LN4          = 1.3862943611198906   @Helium 0x3cd140 (== 2*ln(2))
//   K_MINUS9       = -9.0                 @Helium 0x3ccd58
//
// The last three (K_SIGN_MASK32, K_LN4, K_MINUS9) parametrize the exact
// (window, spatialSigmaCoef, intensitySigmaCoef) math replicated below.
//
// ── SEMANTICS ─────────────────────────────────────────────────────────────
// Setters (SetSpatialBlurRadius/SetIntensityBlurRadius/SetFilterSpatialWindow):
//   1. Call `HGNode::ClearBits()` (tail-jumps `ClearBits(0xffff)`) on `this`
//      — invalidates cached render bits for the subgraph rooted here.
//   2. Store the incoming single-precision float into the corresponding
//      offset (0x1a8 / 0x1ac / 0x1b0).
// The two calls are independent: setters do NOT recompute derived params;
// UpdateParams (or GetOutput's inlined equivalent) does that lazily.
//
// UpdateParams (and the inlined block inside GetOutput @0x1c8b6f..0x1c8c49):
//   Let r = spatialBlurRadius, i = intensityBlurRadius, w = filterSpatialWindow.
//
//   windowSize (int):
//     if (w > 0.0f):
//       tmp = (float)(r * w) / 3.0    (float→double, /K_HALF3, ROUND-UP via
//                                      roundsd imm=0xA = ROUND_TOWARD_+INF,
//                                      then cvttsd2si → truncate-to-int32)
//       windowSize = tmp                (i.e. ceil( r*w / 3 ))
//     else:
//       tmp = roundss(w, 0xA) = ceil(w)          (still a float)
//       tmp = tmp XOR K_SIGN_MASK32              (sign-flip low lane)
//       windowSize = (int)tmp = -ceil(w) = ceil(-w) = floor(|w|)·sign-flip
//     Both branches feed the same variable that finally lands in
//     `HGBilateralFilterKernelNode::SetWindowSize(int)`.
//
//   intensitySigmaCoef (float):
//     coef_i = K_LN4 / (i * K_LN4 * i)    [double]  — algebraically 1/(i*i)
//     but computed in that exact order (K_LN4 cancels only because the
//     numerator and one denominator factor are the same constant).  Passed
//     as index=1 to the kernel's SetParameter vtable slot *0x60.
//
//   spatialSigmaCoef (float):
//     tmp2 = r * K_LN4 * r                 [double]  — again literally in
//     that instruction order (r → double, then mul by K_LN4, then mul by r).
//     coef_s = K_LN4 / tmp2 = 1/(r*r)      [double → float via cvtsd2ss]
//     Passed as index=0 to the kernel's SetParameter vtable slot *0x60.
//
//   Both SetParameter calls pass (esi=idx, xmm0=xmm1=xmm2=coef, xmm3=0)
//   — the vtable signature is SetParameter(int,float,float,float,float).
//
// GetOutput(HGRenderer* r):
//   1. `HGNode* input = r->GetInput(this, 0)` — the sole ingress.
//   2. If `spatialBlurRadius == 0.0f` (bit-exact zero via ucomiss ==),
//      return `input` unchanged (early-out; kernel is not built).
//   3. Else, if `this->kernel (0x1a0) == null`, allocate a new
//      `HGBilateralFilterKernelNode` (`operator new(0x200)` then placement-
//      ctor), then install it into 0x1a0 with the standard "Release old if
//      different" dance (vtable *0x18 on the outgoing pointer).
//      Exception during ctor → operator delete + _Unwind_Resume (not modeled
//      in TS: JS GC handles the storage).
//   4. Kernel `SetInput(0, input)` via vtable slot *0x78.
//   5. Recompute (spatialSigmaCoef, intensitySigmaCoef, windowSize) exactly
//      as UpdateParams does (the block is duplicated in the binary — same
//      constants at RIP-relative offsets 0x2041ae/0x201514/0x204573/0x204178
//      that resolve to the SAME literals as UpdateParams's).
//   6. Kernel `SetParameter(0, coef_s, coef_s, coef_s, 0)` via *0x60.
//   7. Kernel `SetParameter(1, coef_i, coef_i, coef_i, 0)` via *0x60.
//   8. `HGBilateralFilterKernelNode::SetWindowSize(this->kernel, windowSize)`.
//   9. Return `input` (rbx was preserved as the GetInput result throughout).
//      NOTE: yes — the binary returns the ORIGINAL input, not the kernel.
//      That is genuinely what @0x1c8c4e does (`movq %rbx,%rax`). The caller
//      is expected to already own the kernel-node linkage installed in step
//      4; the return value serves the early-out contract in the r==0 branch.

import { HGNode } from "./HGNode";

/**
 * `HGRenderer` opaque handle.
 *
 * Not yet transcribed — modeled as an interface with the single method
 * `HGBilateralFilter::GetOutput` touches: `GetInput(HGNode*, int) -> HGNode*`
 * @Helium (extern symbol; see disasm callq @0x1c8ae5). Retained as an interface
 * to keep the TS port compilable; a real class port will supersede this.
 */
export interface HGRenderer {
  /** `HGRenderer::GetInput(HGNode*, int)` — not yet transcribed. */
  GetInput(node: HGNode, idx: number): HGNode | null;
}

/**
 * `HGBilateralFilterKernelNode` opaque handle.
 *
 * Not yet transcribed — its ctor @0x1c8b20 (`__ZN27HGBilateralFilterKernelNodeC1Ev`),
 * its non-virtual `SetWindowSize(int)` (called @0x1c8ac1, @0x1c8c49), and its
 * vtable slots *0x18 (dtor/Release, called @0x1c8b39, @0x1c8b53, @0x1c8c72),
 * *0x60 (SetParameter(int,float,float,float,float), called @0x1c8a8c, @0x1c8aac,
 * @0x1c8c1c, @0x1c8c3c), *0x78 (SetInput(int,HGNode*), called @0x1c8b65) all
 * live in another translation unit that has not yet been transcribed.
 *
 * NOT declared as `extends HGNode` in TS (even though it is at the C++ level)
 * because HGNode's `SetInput` and other methods have specific decoded return
 * types that would clash with this stub's throw-on-call shape. Interop with
 * HGNode's SetInput(0, input) contract is documented via the callsite comment
 * in `GetOutput` @0x1c8b65.
 */
export class HGBilateralFilterKernelNode {
  /**
   * vtable slot *0x60 — `SetParameter(int,float,float,float,float)`.
   * Called with (idx, coef, coef, coef, 0.0) @Helium 0x1c8a8c / 0x1c8aac /
   * 0x1c8c1c / 0x1c8c3c. Not yet transcribed — throws.
   */
  public SetParameter(
    _idx: number,
    _a: number,
    _b: number,
    _c: number,
    _d: number,
  ): void {
    throw new Error(
      "HGBilateralFilterKernelNode::SetParameter (vtable *0x60) @Helium " +
        "(called from HGBilateralFilter @0x1c8a8c, 0x1c8aac, 0x1c8c1c, 0x1c8c3c) " +
        "not yet transcribed",
    );
  }

  /**
   * vtable slot *0x78 — `SetInput(int, HGNode*)`.
   * Called with (0, input) @Helium 0x1c8b65. Not yet transcribed — throws.
   */
  public SetInput(_idx: number, _src: HGNode | null): void {
    throw new Error(
      "HGBilateralFilterKernelNode::SetInput (vtable *0x78) @Helium " +
        "(called from HGBilateralFilter @0x1c8b65) not yet transcribed",
    );
  }

  /**
   * `HGBilateralFilterKernelNode::SetWindowSize(int)` — non-virtual.
   * Called @Helium 0x1c8ac1 (tail-jmp from UpdateParams) and @0x1c8c49 (from
   * GetOutput). Not yet transcribed @Helium 0x1c8ac1 — throws.
   */
  public SetWindowSize(_n: number): void {
    throw new Error(
      "HGBilateralFilterKernelNode::SetWindowSize(int) @Helium " +
        "(called from HGBilateralFilter @0x1c8ac1, 0x1c8c49) not yet transcribed",
    );
  }
}

/**
 * Placement-construct a fresh `HGBilateralFilterKernelNode` (0x200 bytes).
 *
 * Mirrors GetOutput's `HGObject::operator new(0x200)` @Helium 0x1c8b15
 * followed by the placement ctor call @0x1c8b20 to
 * `__ZN27HGBilateralFilterKernelNodeC1Ev`. The 0x200 size (== 512 bytes) is
 * the encoded size class of the derived kernel node (its own layout is
 * beyond the HGBilateralFilter parent's 0x1b4-byte footprint by 0x4c bytes
 * of subclass state). Ctor not yet transcribed @Helium 0x1c8b20 — throws.
 */
function newHGBilateralFilterKernelNode(): HGBilateralFilterKernelNode {
  throw new Error(
    "HGBilateralFilterKernelNode::HGBilateralFilterKernelNode() @Helium 0x1c8b20 " +
      "(via HGObject::operator new(0x200) @0x1c8b15) not yet transcribed",
  );
}

/**
 * `HGNode::ClearBits()` — the void-arg thunk @Helium 0x11c890 that tail-jumps
 * `HGNode::ClearBits(int)` @0x11f6b0 with `esi = 0xFFFF` (clear all bits).
 *
 * Not exposed as a method on the ported `HGNode` class yet; the base's
 * `ClearBits(int)` body itself involves a full RB-tree walk over the render
 * subgraph (see HGNode.ts commentary around @0x11f6b0). Modeled here as a
 * throwing stub so mutation of a live filter graph loudly flags this gap.
 */
function HGNode_ClearBits(_self: HGNode): void {
  throw new Error(
    "HGNode::ClearBits() @Helium 0x11c890 (→ ClearBits(0xFFFF) @0x11f6b0) " +
      "not yet transcribed",
  );
}

/** RIP-relative float literal @Helium 0x3ccd50 — the divisor `3.0`. */
const K_HALF3 = 3.0;
/** RIP-relative double @Helium 0x3cd140 — `ln(4) = 1.3862943611198906`. */
const K_LN4 = 1.3862943611198906;
// K_SIGN_MASK32 @Helium 0x3ca0d0 = { 0x80000000, 0x80000000 } — the xorps
// mask that sign-flips the low 32-bit float lane. In IEEE-754 this is
// identical to unary negation on a finite float; we implement it as `-x`
// on a Math.fround'd value (see the else-branch inside computeKernelParams).
// K_MINUS9 (@Helium 0x3ccd58) appears in the literal pool of Helium but is
// NOT used by any executed path of UpdateParams/GetOutput reachable from
// these entry points; retained as a citation only.

/**
 * Compute the derived kernel-node inputs from the three tuning fields.
 *
 * Common core of `HGBilateralFilter::UpdateParams` @0x1c89d0 and of the
 * inlined block inside `HGBilateralFilter::GetOutput` @0x1c8b6f..0x1c8c49.
 * Both blocks use IDENTICAL constants (verified: 0x3ccd50, 0x3ca0d0, 0x3cd140
 * appear at both RIP-relative sites), so a single helper is a faithful port.
 */
function computeKernelParams(
  spatialBlurRadius: number,
  intensityBlurRadius: number,
  filterSpatialWindow: number,
): { spatialSigmaCoef: number; intensitySigmaCoef: number; windowSize: number } {
  const r = Math.fround(spatialBlurRadius);
  const iF = Math.fround(intensityBlurRadius);
  const w = Math.fround(filterSpatialWindow);

  // windowSize: mirrors @0x1c89f9..0x1c8a2d exactly.
  //   ucomiss w, 0  ; jbe zero-or-negative-branch
  //   if (w > 0):
  //     mul  w by r  (float32),
  //     cvtss2sd → f64,
  //     divsd  by K_HALF3,
  //     roundsd $0xA (round-up / +inf),
  //     cvttsd2si → i32
  //   else:
  //     roundss $0xA on w  (still f32, round-up),
  //     xorps with K_SIGN_FLIP_F32  (flip sign of low lane),
  //     cvttss2si → i32
  let windowSize: number;
  if (w > 0.0) {
    const t0f = Math.fround(r * w); // mulss xmm0(r), xmm2(w)
    const t0d = t0f; // cvtss2sd — no numeric change in JS
    const t1d = t0d / K_HALF3; // divsd by K_HALF3 (@0x3ccd50)
    const t2d = Math.ceil(t1d); // roundsd imm=0xA (toward +inf)
    windowSize = t2d | 0; // cvttsd2si
  } else {
    const t0f = Math.fround(Math.ceil(w)); // roundss imm=0xA
    // xorps with { 0x80000000, ... } sign-flips the low 32-bit float lane.
    // In IEEE-754 this is identical to unary negation on a finite float.
    const t1f = Math.fround(-t0f);
    windowSize = t1f | 0; // cvttss2si
  }

  // intensitySigmaCoef:
  //   cvtss2sd  intensityBlurRadius  → xmm1 (f64)
  //   movsd     K_LN4                → xmm2
  //   xmm3 = xmm1                    (movaps)
  //   mulsd     xmm2, xmm3           → xmm3 = K_LN4 * i
  //   mulsd     xmm1, xmm3           → xmm3 = (K_LN4 * i) * i
  //   movsd     K_LN4                → xmm1 (fresh)
  //   movapd    xmm1, xmm4           → xmm4 = K_LN4
  //   divsd     xmm3, xmm4           → xmm4 = K_LN4 / (K_LN4 * i * i)
  //   cvtsd2ss  xmm4                 → f32
  const iD = iF; // cvtss2sd
  const denomI = K_LN4 * iD * iD;
  const intensitySigmaCoef = Math.fround(K_LN4 / denomI);

  // spatialSigmaCoef: (reuses xmm2=K_LN4 and xmm1=K_LN4 from above; @0x1c8a60)
  //   cvtss2sd  spatialBlurRadius     → xmm0 (f64)
  //   mulsd     xmm0, xmm2            → xmm2 = K_LN4 * r
  //   mulsd     xmm0, xmm2            → xmm2 = K_LN4 * r * r
  //   divsd     xmm2, xmm1            → xmm1 = K_LN4 / (K_LN4 * r * r)
  //   cvtsd2ss  xmm1                  → f32
  const rD = r; // cvtss2sd
  const denomS = K_LN4 * rD * rD;
  const spatialSigmaCoef = Math.fround(K_LN4 / denomS);

  return { spatialSigmaCoef, intensitySigmaCoef, windowSize };
}

/**
 * `HGBilateralFilter` — HGNode subclass implementing a bilateral-filter
 * facade over an internally-owned `HGBilateralFilterKernelNode`.
 *
 * See file header for the full symbol/layout provenance.
 */
export class HGBilateralFilter extends HGNode {
  /**
   * `HGBilateralFilter::HGBilateralFilter()` @Helium 0x1c87d0.
   *
   *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   movq %rdi, %rbx
   *   callq HGNode::HGNode()                    @0x11baf0
   *   leaq 0x86100b(%rip), %rax ; movq %rax, (%rbx)   ← install vtable
   *   xorps %xmm0,%xmm0 ; movups %xmm0, 0x198(%rbx)   ← clear 0x198+0x1a0
   *   movsd 0x2018b6(%rip), %xmm0                     ← 8B load of
   *                                                     { 1.0f, 1.0f }
   *                                                     @Helium 0x3ca0b0
   *   movsd %xmm0, 0x1a8(%rbx)                        ← 0x1a8=1.0, 0x1ac=1.0
   *   movl $0x40400000, 0x1b0(%rbx)                   ← 0x1b0 = 3.0f
   *   epilogue.
   *
   * The `leaq 0x86100b(%rip), %rax` at @0x1c87de installs this class's own
   * vtable pointer over the HGNode-installed one. Vtable address is not
   * exercised by the pure-math port and is elided here (would appear via
   * `resolve.py Helium vtable HGBilateralFilter` when needed).
   */
  public field_198: unknown = null;
  public kernel: HGBilateralFilterKernelNode | null = null;
  public spatialBlurRadius: number;
  public intensityBlurRadius: number;
  public filterSpatialWindow: number;

  constructor() {
    super();
    // 0x198 = null, 0x1a0 = null (already via field initializers above).
    // 0x1a8 = 1.0f, 0x1ac = 1.0f, 0x1b0 = 3.0f.
    this.spatialBlurRadius = Math.fround(1.0);
    this.intensityBlurRadius = Math.fround(1.0);
    this.filterSpatialWindow = Math.fround(3.0);
  }

  /**
   * `HGBilateralFilter::SetSpatialBlurRadius(float)` @Helium 0x1c8940.
   *
   *   movss %xmm0, -0xc(%rbp)                    ← spill arg
   *   movq  %rdi, %rbx
   *   callq HGNode::ClearBits()                  @0x11c890
   *   movss -0xc(%rbp), %xmm0                    ← reload
   *   movss %xmm0, 0x1a8(%rbx)                   ← store into field
   */
  public SetSpatialBlurRadius(v: number): void {
    HGNode_ClearBits(this); // @0x1c894e
    this.spatialBlurRadius = Math.fround(v); // @0x1c8958
  }

  /**
   * `HGBilateralFilter::SetIntensityBlurRadius(float)` @Helium 0x1c8970.
   *
   *   movss %xmm0, -0xc(%rbp) ; movq %rdi, %rbx
   *   callq HGNode::ClearBits()                  @0x11c890
   *   movss -0xc(%rbp), %xmm0 ; movss %xmm0, 0x1ac(%rbx)
   */
  public SetIntensityBlurRadius(v: number): void {
    HGNode_ClearBits(this); // @0x1c897e
    this.intensityBlurRadius = Math.fround(v); // @0x1c8988
  }

  /**
   * `HGBilateralFilter::SetFilterSpatialWindow(float)` @Helium 0x1c89a0.
   *
   *   movss %xmm0, -0xc(%rbp) ; movq %rdi, %rbx
   *   callq HGNode::ClearBits()                  @0x11c890
   *   movss -0xc(%rbp), %xmm0 ; movss %xmm0, 0x1b0(%rbx)
   */
  public SetFilterSpatialWindow(v: number): void {
    HGNode_ClearBits(this); // @0x1c89ae
    this.filterSpatialWindow = Math.fround(v); // @0x1c89b8
  }

  /**
   * `HGBilateralFilter::UpdateParams()` @Helium 0x1c89d0.
   *
   * Pushes derived (spatialSigmaCoef, intensitySigmaCoef, windowSize) into
   * `this->kernel` (field @0x1a0) via its vtable slot *0x60 (SetParameter)
   * and its non-virtual `SetWindowSize(int)`. If `this->kernel == null`
   * this dereferences null — that is the FCP behavior, faithfully preserved
   * (see @0x1c8a77 which unconditionally loads `movq 0x1a0(%rbx),%rdi`).
   *
   * Layout of the two `SetParameter` calls (both vtable slot *0x60 =
   * `SetParameter(int idx, float, float, float, float)`):
   *
   *   1) idx=0 (spatial), xmm0=xmm1=xmm2=coef_s, xmm3=0.0    @0x1c8a8c
   *   2) idx=1 (intensity), xmm0=xmm1=xmm2=coef_i, xmm3=0.0  @0x1c8aac
   *
   * Then the epilogue drops the frame and TAIL-JUMPS to
   *   `HGBilateralFilterKernelNode::SetWindowSize(int)`     @0x1c8ac1
   * with rdi=this->kernel, esi=windowSize.
   */
  public UpdateParams(): void {
    const kernel = this.kernel; // @0x1c8a77 (& @0x1c8a8f) — load 0x1a0
    if (kernel === null) {
      // Faithful: the binary dereferences here unconditionally.  A null
      // kernel would segfault in FCP; we surface the same programmer error
      // loudly in TS.
      throw new Error(
        "HGBilateralFilter::UpdateParams @0x1c89d0: kernel (field @0x1a0) " +
          "is null — @0x1c8a77 unconditionally dereferences it",
      );
    }
    const { spatialSigmaCoef, intensitySigmaCoef, windowSize } =
      computeKernelParams(
        this.spatialBlurRadius,
        this.intensityBlurRadius,
        this.filterSpatialWindow,
      );
    // vtable *0x60 SetParameter(0, s, s, s, 0) @0x1c8a8c
    kernel.SetParameter(0, spatialSigmaCoef, spatialSigmaCoef, spatialSigmaCoef, 0.0);
    // vtable *0x60 SetParameter(1, i, i, i, 0) @0x1c8aac
    kernel.SetParameter(1, intensitySigmaCoef, intensitySigmaCoef, intensitySigmaCoef, 0.0);
    // tail-jmp SetWindowSize(kernel, windowSize) @0x1c8ac1
    kernel.SetWindowSize(windowSize);
  }

  /**
   * `HGBilateralFilter::GetOutput(HGRenderer*)` @Helium 0x1c8ad0.
   *
   *   input = renderer->GetInput(this, 0)                     @0x1c8ae5
   *   if (spatialBlurRadius (0x1a8) == 0.0f  [ucomiss ==])    @0x1c8afc
   *       return input                                        @0x1c8c4e
   *   if (kernel (0x1a0) == null)
   *       kernel = new (operator new 0x200)                   @0x1c8b15
   *                HGBilateralFilterKernelNode()               @0x1c8b20
   *       // If a stale kernel != new, release it via vtable *0x18
   *       // (@0x1c8b39) — the swap dance @0x1c8b25..0x1c8b56.
   *       this.kernel = kernel                                @0x1c8b3c
   *   kernel.SetInput(0, input)  via vtable *0x78             @0x1c8b65
   *   // (Same UpdateParams math block, duplicated in-line.)   @0x1c8b6f..
   *   kernel.SetParameter(0, s, s, s, 0)  via vtable *0x60    @0x1c8c1c
   *   kernel.SetParameter(1, i, i, i, 0)  via vtable *0x60    @0x1c8c3c
   *   HGBilateralFilterKernelNode::SetWindowSize(kernel, w)   @0x1c8c49
   *   return input                                            @0x1c8c4e
   */
  public GetOutput(renderer: HGRenderer): HGNode | null {
    // 1. `input = renderer->GetInput(this, 0)`  @0x1c8ae5
    const input = renderer.GetInput(this, 0);

    // 2. Early-out on r == 0.0f (bit-exact ucomiss ==).  @0x1c8af9..0x1c8afc
    //    (Also jnp @0x1c8afe to jump to return-input on NaN-free equal.)
    if (Math.fround(this.spatialBlurRadius) === 0.0) {
      return input;
    }

    // 3. Lazily construct/install the kernel.  @0x1c8b04..0x1c8b56
    let kernel = this.kernel;
    if (kernel === null) {
      kernel = newHGBilateralFilterKernelNode();
      // The binary here does a "swap and Release the old" dance
      // (@0x1c8b25..0x1c8b56).  Since 0x1a0 was just loaded as null,
      // the je @0x1c8b2f fails, the null-check je @0x1c8b34 succeeds,
      // and we simply store the new pointer.  Both branches converge
      // at @0x1c8b5d with rdi = this->kernel.
      this.kernel = kernel;
    }

    // 4. kernel->SetInput(0, input) via vtable *0x78  @0x1c8b65
    kernel.SetInput(0, input);

    // 5. Recompute the derived kernel params (identical block to UpdateParams).
    const { spatialSigmaCoef, intensitySigmaCoef, windowSize } =
      computeKernelParams(
        this.spatialBlurRadius,
        this.intensityBlurRadius,
        this.filterSpatialWindow,
      );

    // 6. kernel->SetParameter(0, s, s, s, 0)  via *0x60  @0x1c8c1c
    kernel.SetParameter(0, spatialSigmaCoef, spatialSigmaCoef, spatialSigmaCoef, 0.0);
    // 7. kernel->SetParameter(1, i, i, i, 0)  via *0x60  @0x1c8c3c
    kernel.SetParameter(1, intensitySigmaCoef, intensitySigmaCoef, intensitySigmaCoef, 0.0);
    // 8. kernel->SetWindowSize(windowSize)  (non-virtual)  @0x1c8c49
    kernel.SetWindowSize(windowSize);

    // 9. Return the ORIGINAL input pointer (movq %rbx,%rax @0x1c8c4e).
    return input;
  }

  // Suppress unused-field lint on field_198 (deliberately kept as a decoded
  // layout artifact; see file header).
  public _touchField198(): unknown {
    return this.field_198;
  }
}
