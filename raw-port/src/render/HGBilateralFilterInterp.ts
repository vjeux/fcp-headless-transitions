// raw-port/src/render/HGBilateralFilterInterp.ts
//
// FCP `HGBilateralFilterInterp` — Helium render-graph node that composes a
// LADDER of `numBins` inner nodes into an "interpolated" bilateral filter.
// Unlike the single-kernel `HGBilateralFilter` (see HGBilateralFilter.ts),
// this class carries FOUR parallel `std::vector<HGNode*>` (at offsets 0x198,
// 0x1a0, 0x1a8, 0x1b0) — one node per intensity bin — plus a single "root"
// subnode at 0x1b8, and its `UpdateParams` walks the four vectors in lock-
// step and pushes bin-indexed parameters into each element via `HGNode`
// vtable slot *0x60 (`SetParameter(int,float,float,float,float)`).
//
// Symbols decoded here (Helium.framework, x86_64 slice; VAs from
// otool -tV; the fat-slice file offset is +0x4000 but VAs below are the
// UNADJUSTED VM addresses reported by otool):
//   0x108e30  HGBilateralFilterInterp::HGBilateralFilterInterp()      [C2]
//   0x108ef0  HGBilateralFilterInterp::HGBilateralFilterInterp()      [C1 — body identical to C2]
//   0x108fb0  HGBilateralFilterInterp::~HGBilateralFilterInterp()     [D2 base dtor]
//   0x108ff0  HGBilateralFilterInterp::DestroyGraph()
//   0x1090e0  HGBilateralFilterInterp::~HGBilateralFilterInterp()     [D1 complete — same body as D2]
//   0x109120  HGBilateralFilterInterp::~HGBilateralFilterInterp()     [D0 deleting — D2 + operator delete]
//   0x109170  HGBilateralFilterInterp::SetNumBins(unsigned int)
//   0x1091a0  HGBilateralFilterInterp::SetRangeScale(float)
//   0x1091f0  HGBilateralFilterInterp::SetRangeOffset(float)
//   0x109220  HGBilateralFilterInterp::SetSpatialBlurRadius(float)
//   0x109250  HGBilateralFilterInterp::SetIntensityBlurRadius(float)
//   0x109280  HGBilateralFilterInterp::BuildGraph()                    [large — throwing stub]
//   0x109bb0  HGBilateralFilterInterp::UpdateParams()                  [full transcription]
//   0x109db0  HGBilateralFilterInterp::GetOutput(HGRenderer*)          [full transcription]
//
// Saved disassembly under raw-port/re/disasm/Helium.HGBilateralFilterInterp.*.s
// (see `raw-port/tools/disasm.sh HGBilateralFilterInterp <method> Helium`).
//
// Called-into symbols (kept as citations; the graph-builder subsystem is
// not yet transcribed, and vector-element target classes are only constructed
// in BuildGraph — hence the throwing stubs below):
//   HGNode::HGNode()                                       @0x11baf0 (real, imported)
//   HGNode::ClearBits()                                    @0x11c890 (via HGBilateralFilter's model)
//   HGNode::~HGNode()                                      @0x11bf20 (real, imported)
//   HGNode vtable *0x18 (HGObject::Release)                @0x1a0f30
//   HGNode vtable *0x60 SetParameter(int,f,f,f,f)          @0x11cab0 (base default; subclasses override)
//   HGNode vtable *0x78 SetInput(int, HGNode*)             @0x11c5f0
//   HGRenderer::GetInput(HGNode*, int)                     — extern (not yet ported)
//   HGObject::operator new(unsigned long)                  @Helium (real, imported)
//   HGObject::operator delete(void*)                       @Helium (real, imported)
//   std::vector<HGNode*>::__throw_out_of_range              @Helium (libc++ symbol)
//
// ── LAYOUT (recovered from ctor @0x108ef0/@0x108e30 + setter offsets
//     + DestroyGraph @0x108ff0 + UpdateParams @0x109bb0) ─────────────────
// Extends HGNode (base is 0x198 bytes wide; see HGNode.ts).  Own fields:
//     0x198 : std::vector<HGNode*> vecA         — 24 bytes (begin/end/end_cap).
//             Zero-init via `xorps %xmm0,%xmm0 ; movups %xmm0, 0x198(%rbx)`
//             at ctor @0x108f0f (writes 16 bytes: begin=0, end=0). Ctor does
//             NOT explicitly zero end_cap; libc++'s vector default-ctor is
//             expected to leave it 0 as part of the aggregate zero. Populated
//             in BuildGraph; consumed in UpdateParams; freed in DestroyGraph.
//             DestroyGraph pattern @0x108ff0..0x109047 confirms the element
//             layout: for each element ptr `w = vecA[i]`, do
//                 if (w->inner (+0)) { w->linkedField (+8) = w->inner ;
//                                       operator delete(w->inner); }
//                 operator delete(w);
//             i.e. every element is itself a two-word object owning a heap
//             child. That inner class is NOT decoded here (BuildGraph is
//             the constructor site).
//     0x1a0 : std::vector<HGNode*> vecB         — 24 bytes; second half of
//             the same 16-byte xorps store completes at 0x1a0 (begin) and
//             0x1a8 (end) — but 0x1a8 is ALSO the start of the next vector.
//             The layout is 4 back-to-back 24-byte vectors starting at
//             0x198, so the two `movups %xmm0, 0x198` and `movups %xmm0, 0x1a8`
//             collectively zero 0x198..0x1b7 = the first three vectors'
//             begin/end pairs. The fourth vector's begin/end at 0x1b0/0x1b8
//             overlap the C++-level 0x1b8 slot (`kernel`) — which the ctor
//             overwrites with a NON-NULL just-alloc'd HGNode below. So the
//             layout is actually THREE vectors 0x198/0x1a0/0x1a8, a fourth
//             vector at 0x1b0, and a bare HGNode* at 0x1b8.  Confirmed by
//             UpdateParams which addresses (0x198, 0x1a0, 0x1a8, 0x1b0) as
//             the four `std::vector<HGNode*>` bases and reads (rax)/(rax+8)
//             as (begin/end) at each of them (see @0x109c26..0x109c37 etc.).
//             ── NOTE: within a std::vector each 24-byte object is
//             (begin, end, end_capacity); the setter loops only read `begin`
//             and `end` (@0x109c2d/0x109c30) and compute size = (end-begin)/8
//             (`sarq $0x3` @0x109c37).
//     0x1a8 : std::vector<HGNode*> vecC         — 24 bytes.
//     0x1b0 : std::vector<HGNode*> vecD         — 24 bytes.
//     0x1b8 : HGNode*  rootChild                — allocated in ctor via
//             HGObject::operator new(0x1a0) then HGNode ctor @0x108f2d.
//             ~0x1a0-byte bare `HGNode` (matches sizeof HGNode from HGNode.ts).
//             Destroyed by dtor via vtable *0x18 (`Release`) @0x108fcd.
//     0x1c0 : HGNode*  outputHead                — cleared to null in ctor
//             (@0x108f39). Populated by BuildGraph (final wired output).
//             GetOutput @0x109df5 returns it. DestroyGraph @0x108ffa..0x109014
//             releases it via vtable *0x18 then clears to null.
//     0x1c8 : uint32_t numBins                   — init 10 in ctor @0x108f44.
//             SetNumBins clamps: `numBins = (arg >= 3) ? arg : 2` (@0x109189..
//             0x109194) AND sets dirtyFlag @0x1d4 to 1 (@0x109181).
//     0x1cc : f32 spatialBlurRadius              — init 1.0f in ctor @0x108f4e
//             (movsd of 8-byte constant @Helium 0x3ca0b0 = { 0x3f800000,
//             0x3f800000 } stores 1.0 into 0x1cc AND 1.0 into 0x1d0 in one
//             8-byte write). SetSpatialBlurRadius writes 0x1cc (@0x109238).
//     0x1d0 : f32 intensityBlurRadius            — init 1.0f (upper half of
//             same movsd @0x3ca0b0). SetIntensityBlurRadius writes 0x1d0
//             (@0x109268).
//     0x1d4 : bool dirtyFlag / "graph must be rebuilt"
//             — init 1 in ctor @0x108f5e (movb $0x1).
//             SetNumBins also asserts it to 1 @0x109181.
//             GetOutput consumes it @0x109ddc — if `== 1` calls BuildGraph
//             (@0x109de8). BuildGraph is presumed to clear it (not decoded).
//     0x1d8 : f32 rangeScale                     — init 1.0f in ctor @0x108f65
//             (movss loads 1.0 from @Helium 0x3c7cc0 low 32 bits, then movlps
//             writes 8 bytes: 0x1d8=1.0, 0x1dc=0.0). SetRangeScale writes
//             0x1d8 with a ZERO-GUARD: `rangeScale = (arg != 0.0f) ? |arg|
//             : 1.0f` (@0x1091b5..0x1091d7 — see the blendvps + andps + cmpneqss
//             sequence decoded in SetRangeScale below).
//     0x1dc : f32 rangeOffset                    — init 0.0f in ctor @0x108f6d.
//             SetRangeOffset writes 0x1dc plainly (@0x109208).
//
// ── DECODED FLOAT / VECTOR CONSTANTS ──────────────────────────────────────
//   K_ONE_ONE_PAIR = { 1.0f, 1.0f }                @Helium 0x3ca0b0
//                     u64=0x3f800000_3f800000
//                     — 8-byte movsd seed for spatial+intensity blur radii.
//   K_ONEF         = 1.0f                          @Helium 0x3c7cc0 (low 32b)
//                     — the movss load in ctor for rangeScale seed, ALSO the
//                     movss load in UpdateParams @0x109bee (K_ONEF divss on
//                     xmm4 to get 1 / (rs/numBins + ro)).
//   K_ABS_MASK4x32 = { 0x7fffffff, 0x7fffffff,     @Helium 0x3c7c30
//                      0x7fffffff, 0x7fffffff }
//                     — 128-bit `andps` mask that clears the IEEE-754 sign
//                     bit of each float lane (abs on f32).
//   K_ONE_4x32     = { 1.0f, 1.0f, 1.0f, 1.0f }    @Helium 0x3c7c40
//                     — 128-bit fallback for SetRangeScale's blendvps.
//   K_SIGN_MASK32  = { 0x80000000, 0x80000000 }    @Helium 0x3ca0d0
//                     — 8-byte `xorps` mask for negating a float lane.
//   K_LN4          = 1.3862943611198906            @Helium 0x3cd140
//                     u64=0x3ff62e42fefa39ef       — 2·ln(2).
//   K_MINUS9       = -9.0                          @Helium 0x3ccd58
//                     u64=0xc022000000000000       — the numerator in the
//                     intensity-coef formula (see UpdateParams).
//
// ── SEMANTICS ─────────────────────────────────────────────────────────────
// Setters:
//   SetNumBins(u32 n):       ClearBits(); dirtyFlag=1; numBins = (n>=3)?n:2.
//   SetSpatialBlurRadius(f): ClearBits(); spatialBlurRadius = f.
//   SetIntensityBlurRadius(f):ClearBits(); intensityBlurRadius = f.
//   SetRangeOffset(f):       ClearBits(); rangeOffset = f.
//   SetRangeScale(f):        ClearBits(); rangeScale = (f != 0.0f) ? |f| : 1.0f
//                             (the abs+nonzero-guard is a real ANTI-DIV-BY-ZERO
//                              precomputation for UpdateParams @0x109d14 which
//                              later divides `k * rangeScale / numBins`; a zero
//                              rangeScale would produce a zero denominator in
//                              the derivative-forming block @0x109bd5).
//
// UpdateParams — full-scan per-bin loop, k from 0 to numBins INCLUSIVE
// (the loop terminator @0x109c1a is `if (r14 > r15) exit`, so the trailing
// k == numBins iteration is executed — but for that trailing k the branch at
// @0x109d77 (`jae`) SKIPS the fifth per-bin call into vecD @0x1b0; only the
// first four SetParameter calls fire on k == numBins). For each k:
//
//   let rs   = rangeScale         (@0x1d8, into -0x20)
//   let ro   = rangeOffset        (@0x1dc, into -0x1c)
//   let sBR  = spatialBlurRadius  (@0x1cc)
//   let iBR  = intensityBlurRadius(@0x1d0)
//
//   [call 1]  vecA[k].SetParameter(0, sBR, sBR, 0.0f, 0.0f)   @0x109c78
//   [call 2]  let iD    = (double) iBR
//             let denom = K_LN4 * iD * iD            // K_LN4 * iBR * iBR
//             let coefI = (float)(K_MINUS9 / denom)   // = -9 / (K_LN4 * iBR^2)
//             vecB[k].SetParameter(0, coefI, coefI, coefI, 0.0f)   @0x109cd6
//   [call 3]  let kF       = (float) k
//             let numBinsF = (float) numBins         // store to -0x24
//             let offset   = ro + (kF * rs) / numBinsF
//             (This is the k-th sample point in [ro, ro + rs] with rs/numBins
//              step.  Note: rs was pre-normalized in SetRangeScale to |rs|
//              with a 0 -> 1.0f fallback, so this ratio is always finite.)
//             vecB[k].SetParameter(1, offset, offset, offset, offset)   @0x109d36
//             (offset is also stashed to stack -0x40 for call 5.)
//   [call 4]  vecC[k].SetParameter(0, sBR, sBR, 0.0f, 0.0f)   @0x109d6d
//   [call 5, ONLY when k < numBins]:
//             let denom4  = rs / numBinsF + ro
//             let nextOff = offset + denom4          // = ro + (k+1)*rs/numBinsF + ro  — nb
//             let recipD  = 1.0f / denom4
//             let negOffD = -offset / denom4         // XOR K_SIGN_MASK32 then divss
//             vecD[k].SetParameter(0, nextOff, recipD, negOffD, ???)   @0x109c0d
//             — xmm3 is used for the SetParameter call but its value at the
//             callsite is `-offset / denom4` (see the xorps K_SIGN_MASK32 then
//             divss %xmm4,%xmm3 at 0x109bfd..0x109c04). xmm0 at the callsite
//             holds the STALE `offset` (from -0x40) — that's the FIRST float
//             arg to SetParameter (after esi=0 idx). Wait — SetParameter's
//             signature is `(int, f, f, f, f)`, ABI floats go to xmm0..xmm3.
//             At the callsite (@0x109c0d) xmm0=offset (stale), xmm1=nextOff,
//             xmm2=recipD, xmm3=negOffD. So the actual call is:
//                 vecD[k].SetParameter(0, offset, nextOff, recipD, negOffD)
//             (four floats; xmm0 first, xmm3 last — the standard SysV order).
//             ── Interpretation: offset and nextOff are the [lo, hi] bounds
//             of the k-th bin, recipD is 1/(hi-lo), negOffD is -lo/(hi-lo);
//             these together are the coefficients of the linear remap
//             (v - lo) / (hi - lo) that a downstream shader uses to normalize
//             intensity into the k-th bin.
//
//   If any vec size <= k at any point, calls
//   `std::vector<HGNode*>::__throw_out_of_range` (@0x109d9e).
//
// GetOutput(HGRenderer* r):
//   1. `HGNode* input = r->GetInput(this, 0)`                            @0x109dc9
//   2. `rootChild.SetInput(0, input)` via HGNode vtable *0x78            @0x109dd9
//   3. If `dirtyFlag == 1`, call `this->BuildGraph()`                    @0x109de8
//   4. Call `this->UpdateParams()`                                       @0x109df0
//   5. Return `this->outputHead` (field @0x1c0)                          @0x109df5
//
// ── STUB SURFACES (intentionally throwing, per PORTING_SPEC Rule 3) ──
//   - `BuildGraph()`: 602 lines of graph wiring (allocations of subclass
//     HGNode instances, vector pushes, SetInput chains between them).
//     Not yet transcribed. The class is USABLE for setter-only calls.
//   - HGRenderer::GetInput: extern.
//   - HGNode vtable *0x60 / *0x78: modelled via HGNode.ts's methods; the
//     actual per-element HGNode subclasses' override targets aren't yet
//     decoded, but at the port level we call through HGNode's declared
//     `SetParameter` / `SetInput` which itself throws (the base default).
//     A `GetOutput` call on an actually-populated graph would therefore
//     surface those inner stubs — that's the intended loud gap.
//   - HGNode::ClearBits() — modeled via `HGNode_ClearBits` throwing stub
//     (mirroring HGBilateralFilter.ts's decision).

import { HGNode } from "./HGNode";

/**
 * Vtable-slot narrowing for the per-bin subnodes that populate the four
 * vectors (vecA/vecB/vecC/vecD). UpdateParams invokes vtable slot *0x60
 * = `SetParameter(int, float, float, float, float)` on each element
 * (@0x109c0d, @0x109c78, @0x109cd6, @0x109d36, @0x109d6d — five distinct
 * callsites). The base-class default `HGNode::SetParameter` @0x11cab0 is
 * not yet transcribed on the ported `HGNode`; every subclass ACTUALLY
 * stored in these vectors overrides that slot with its own decoded
 * handler (allocated by BuildGraph, which is itself a stub here).
 *
 * We narrow the vector element type to this interface so the port
 * type-checks without either (a) mutating HGNode.ts to add a stub
 * SetParameter method (would touch a heavily-shared file) or
 * (b) fabricating a placeholder — both would violate PORTING_SPEC.
 * The runtime-observable behavior when a real vector element is
 * absent is unchanged: BuildGraph @Helium 0x109280 throws, so
 * UpdateParams never reaches these calls in the ported flow.
 */
export interface HGBilateralFilterInterpSubNode extends HGNode {
  /**
   * `HGNode` vtable slot *0x60 — `SetParameter(int, float, float, float, float)`.
   * Base default @Helium 0x11cab0 (undecoded — throws on the ported HGNode);
   * the actual subclass at each vector element overrides this. Called from
   * UpdateParams @0x109c0d, @0x109c78, @0x109cd6, @0x109d36, @0x109d6d.
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
}

// ── decoded RIP-relative constants ──────────────────────────────────────
/** @const 1.0f @Helium 0x3c7cc0 (low 32b of an 8-byte pair). */
const K_ONEF = Math.fround(1.0);
/** @const 2·ln(2) = 1.3862943611198906 @Helium 0x3cd140 (u64=0x3ff62e42fefa39ef). */
const K_LN4 = 1.3862943611198906;
/** @const -9.0 @Helium 0x3ccd58 (u64=0xc022000000000000). */
const K_MINUS9 = -9.0;

/**
 * `HGRenderer` opaque handle — the argument to GetOutput.
 *
 * Not yet transcribed @Helium (extern symbol); modeled as an interface
 * with the single method GetOutput touches: `GetInput(HGNode*, int)`
 * (called via callq __ZN10HGRenderer8GetInputEP6HGNodei @0x109dc9).
 * Retained here to keep the port compilable; a full class port will
 * supersede this stub.
 */
export interface HGRenderer {
  /** `HGRenderer::GetInput(HGNode*, int)` — not yet transcribed @0x109dc9. */
  GetInput(node: HGNode, idx: number): HGNode | null;
}

/**
 * `HGNode::ClearBits()` — the void-arg thunk @Helium 0x11c890 that tail-
 * jumps `HGNode::ClearBits(int)` @0x11f6b0 with `esi = 0xFFFF` (clear all
 * bits). Called from every setter's `callq __ZN6HGNode9ClearBitsEv`
 * (@0x10917c, @0x1091b0, @0x1091fe, @0x10922e, @0x10925e).
 *
 * Modeled as a throwing stub — the underlying `HGNode::ClearBits(int)`
 * body walks the render subgraph's RB-tree and is not yet transcribed
 * (see the commentary in HGNode.ts around @0x11f6b0). A live setter call
 * therefore loudly flags this gap; a pure-math replay that avoids setters
 * (constructing an instance and only reading fields) is unaffected.
 */
function HGNode_ClearBits(_self: HGNode): void {
  throw new Error(
    "HGNode::ClearBits() @Helium 0x11c890 (→ ClearBits(0xFFFF) @0x11f6b0) " +
      "not yet transcribed",
  );
}

/**
 * Placement-construct a fresh bare `HGNode` (0x1a0 bytes) — the child
 * that lives at field `rootChild` @0x1b8.
 *
 * Mirrors ctor's `HGObject::operator new(0x1a0)` @0x108f22 followed by
 * placement `HGNode::HGNode()` @0x108f2d. Since `HGNode` IS ported
 * (see HGNode.ts), the TS equivalent is simply `new HGNode()` — but the
 * FCP semantic here is that the allocation is 0x1a0 bytes exactly, i.e.
 * a BARE HGNode (no subclass state beyond the ~0x1a0 base). We surface a
 * throwing stub only because instantiating an HGNode currently pulls in
 * HGNode's own not-yet-transcribed init paths (Init/ClearNodeChain etc.).
 *
 * Not yet transcribed @Helium 0x108f22 (the allocation-plus-construct
 * pair as a single functor) — throws.
 */
function newBareHGNode(): HGNode {
  throw new Error(
    "HGBilateralFilterInterp: HGObject::operator new(0x1a0) + HGNode() " +
      "@Helium 0x108f22..0x108f2d not yet transcribed (rootChild construction)",
  );
}

/**
 * `HGBilateralFilterInterp` — HGNode subclass implementing a multi-bin
 * "interpolated" bilateral filter facade over an internally-owned graph
 * of per-bin HGNode subclasses (populated by BuildGraph, not yet ported).
 *
 * See file header for the full symbol/layout provenance.
 */
export class HGBilateralFilterInterp extends HGNode {
  // ── decoded fields (offsets recovered from ctor / setters / DestroyGraph
  // / UpdateParams; see file header) ─────────────────────────────────────
  /** @0x198 std::vector<HGNode*> — per-bin subnode set A (used by UpdateParams call 1). */
  public vecA: HGBilateralFilterInterpSubNode[] = [];
  /** @0x1a0 std::vector<HGNode*> — per-bin subnode set B (calls 2 and 3). */
  public vecB: HGBilateralFilterInterpSubNode[] = [];
  /** @0x1a8 std::vector<HGNode*> — per-bin subnode set C (call 4). */
  public vecC: HGBilateralFilterInterpSubNode[] = [];
  /** @0x1b0 std::vector<HGNode*> — per-bin subnode set D (call 5, k < numBins only). */
  public vecD: HGBilateralFilterInterpSubNode[] = [];
  /** @0x1b8 bare HGNode — the graph root child; alloc'd in ctor @0x108f22. */
  public rootChild!: HGNode;
  /** @0x1c0 HGNode* — the wired output; cleared to null in ctor @0x108f39; set by BuildGraph. */
  public outputHead: HGNode | null = null;
  /** @0x1c8 uint32_t numBins — init 10 @0x108f44; SetNumBins clamps to (>=3 ? n : 2). */
  public numBins: number = 10;
  /** @0x1cc f32 spatialBlurRadius — init 1.0f @0x108f4e/@0x108f56. */
  public spatialBlurRadius: number = Math.fround(1.0);
  /** @0x1d0 f32 intensityBlurRadius — init 1.0f (upper half of same 8-byte movsd @0x108f4e). */
  public intensityBlurRadius: number = Math.fround(1.0);
  /** @0x1d4 bool dirtyFlag — init 1 @0x108f5e; SetNumBins asserts 1 @0x109181. */
  public dirtyFlag: boolean = true;
  /** @0x1d8 f32 rangeScale — init 1.0f (movss @Helium 0x3c7cc0 → 0x1d8; @0x108f65..@0x108f6d). */
  public rangeScale: number = Math.fround(1.0);
  /** @0x1dc f32 rangeOffset — init 0.0f (upper half of the same movlps 8-byte store). */
  public rangeOffset: number = Math.fround(0.0);

  /**
   * `HGBilateralFilterInterp::HGBilateralFilterInterp()` @Helium 0x108ef0
   * (C1; body identical to C2 @0x108e30 — verified via otool -tV).
   *
   * Decoded body:
   *   callq HGNode::HGNode()                              @0x108efd
   *   leaq  0x912377(%rip),%rax ; movq %rax,(%rbx)        ← install vtable
   *                                                        (@0xa1b280, unused
   *                                                        by the port)
   *   xorps %xmm0,%xmm0
   *   movups %xmm0, 0x198(%rbx)                           ← vecA begin/end = 0/0
   *   movups %xmm0, 0x1a8(%rbx)                           ← vecC begin/end = 0/0
   *                                                        (vecB and vecD's
   *                                                         begin/end at 0x1a0
   *                                                         and 0x1b0 are the
   *                                                         upper halves of
   *                                                         these two 16-byte
   *                                                         stores.)
   *   movl  $0x1a0, %edi ; callq HGObject::operator new(0x1a0)   @0x108f1d
   *   callq HGNode::HGNode()                              @0x108f2d
   *   movq  %r14, 0x1b8(%rbx)                             ← rootChild = new HGNode
   *   movq  $0x0, 0x1c0(%rbx)                             ← outputHead = null
   *   movl  $0xa, 0x1c8(%rbx)                             ← numBins = 10
   *   movsd @Helium 0x3ca0b0, %xmm0 ; movsd %xmm0, 0x1cc  ← spatial=1.0, intensity=1.0
   *   movb  $0x1, 0x1d4(%rbx)                             ← dirtyFlag = 1
   *   movss @Helium 0x3c7cc0, %xmm0 ; movlps %xmm0, 0x1d8 ← rangeScale=1.0, rangeOffset=0.0
   *   epilogue.
   */
  constructor() {
    super(); // callq HGNode::HGNode() @0x108efd
    // All own-field initializations are already declared inline above.
    // The vector zero-inits (@0x108f0f/@0x108f16) correspond to the empty
    // TS arrays; the fields at 0x1c0..0x1dc match the field declarators.
    // Only the "operator new + HGNode()" for rootChild remains; that surface
    // is a stub because HGNode's construction path itself is not yet transcribed.
    // See PORTING_SPEC Rule 3 — throw loudly rather than fabricate.
    this.rootChild = newBareHGNode(); // @0x108f22 (new) + @0x108f2d (ctor)
  }

  /**
   * `HGBilateralFilterInterp::SetNumBins(unsigned int)` @Helium 0x109170.
   *
   *   movq  %rdi, %r14                                    ; this
   *   movl  %esi, %ebx                                    ; arg
   *   callq HGNode::ClearBits()                           @0x10917c
   *   movb  $0x1, 0x1d4(%r14)                             ← dirtyFlag = 1
   *   cmpl  $0x3, %ebx                                    @0x109189
   *   movl  $0x2, %eax
   *   cmovael %ebx, %eax                                  ; if (arg >= 3) eax=arg else 2
   *   movl  %eax, 0x1c8(%r14)                             ← numBins = clamped
   */
  public SetNumBins(n: number): void {
    HGNode_ClearBits(this); // @0x10917c
    this.dirtyFlag = true; // @0x109181
    // cmovae is unsigned>=; the C++ signature is `unsigned int` so treat n as u32.
    const nU32 = n >>> 0; // enforce u32 domain (asIntN of the arg register)
    this.numBins = nU32 >= 3 ? nU32 : 2; // @0x109189..@0x109194
  }

  /**
   * `HGBilateralFilterInterp::SetRangeScale(float)` @Helium 0x1091a0.
   *
   *   movaps %xmm0, -0x20(%rbp)                           ; spill arg (16B slot)
   *   movq   %rdi, %rbx
   *   callq  HGNode::ClearBits()                          @0x1091b0
   *   movaps 0x2bea74(%rip), %xmm1                        ; xmm1 = K_ABS_MASK4x32 @Helium 0x3c7c30
   *   movaps -0x20(%rbp), %xmm2                           ; xmm2 = arg (all 128b)
   *   andps  %xmm2, %xmm1                                 ; xmm1 = |arg|  (per-lane abs)
   *   xorps  %xmm0, %xmm0                                 ; xmm0 = 0.0f
   *   cmpneqss %xmm2, %xmm0                               ; xmm0 = (arg != 0.0) ? -1 : 0 (low lane)
   *   movaps 0x2bea6e(%rip), %xmm2                        ; xmm2 = K_ONE_4x32 @Helium 0x3c7c40
   *   blendvps %xmm0, %xmm1, %xmm2                        ; xmm2 = mask.MSB ? |arg| : 1.0
   *                                                        (SSE4.1 blendvps: implicit XMM0 mask;
   *                                                         result to xmm2)
   *   movss  %xmm2, 0x1d8(%rbx)                           ← rangeScale = result
   *
   * Semantic: `rangeScale = (arg != 0.0f) ? |arg| : 1.0f`. This is a
   * defensive normalization that guarantees a non-zero, non-negative
   * range for UpdateParams's divisor `(rs / numBins + ro)` at @0x109bd5.
   * Note: cmpneqss propagates NaN → NEQ evaluates FALSE for NaN vs 0.0
   * (per IEEE-754 unordered), so a NaN arg falls into the else branch
   * (→ 1.0f). We reproduce that below with `!Number.isNaN(f) && f !== 0`.
   */
  public SetRangeScale(v: number): void {
    HGNode_ClearBits(this); // @0x1091b0
    const f = Math.fround(v);
    // cmpneqss: (f != 0.0) — false when f is NaN (unordered) OR f is 0.
    // blendvps then picks the 1.0 fallback in either case.
    const nonZero = !Number.isNaN(f) && f !== 0.0;
    this.rangeScale = nonZero ? Math.fround(Math.abs(f)) : Math.fround(1.0);
  }

  /**
   * `HGBilateralFilterInterp::SetRangeOffset(float)` @Helium 0x1091f0.
   *
   *   movss  %xmm0, -0xc(%rbp)                            ; spill arg
   *   movq   %rdi, %rbx
   *   callq  HGNode::ClearBits()                          @0x1091fe
   *   movss  -0xc(%rbp), %xmm0
   *   movss  %xmm0, 0x1dc(%rbx)                           ← rangeOffset = arg
   */
  public SetRangeOffset(v: number): void {
    HGNode_ClearBits(this); // @0x1091fe
    this.rangeOffset = Math.fround(v); // @0x109208
  }

  /**
   * `HGBilateralFilterInterp::SetSpatialBlurRadius(float)` @Helium 0x109220.
   *
   *   movss  %xmm0, -0xc(%rbp)
   *   movq   %rdi, %rbx
   *   callq  HGNode::ClearBits()                          @0x10922e
   *   movss  -0xc(%rbp), %xmm0
   *   movss  %xmm0, 0x1cc(%rbx)                           ← spatialBlurRadius = arg
   */
  public SetSpatialBlurRadius(v: number): void {
    HGNode_ClearBits(this); // @0x10922e
    this.spatialBlurRadius = Math.fround(v); // @0x109238
  }

  /**
   * `HGBilateralFilterInterp::SetIntensityBlurRadius(float)` @Helium 0x109250.
   *
   *   movss  %xmm0, -0xc(%rbp)
   *   movq   %rdi, %rbx
   *   callq  HGNode::ClearBits()                          @0x10925e
   *   movss  -0xc(%rbp), %xmm0
   *   movss  %xmm0, 0x1d0(%rbx)                           ← intensityBlurRadius = arg
   */
  public SetIntensityBlurRadius(v: number): void {
    HGNode_ClearBits(this); // @0x10925e
    this.intensityBlurRadius = Math.fround(v); // @0x109268
  }

  /**
   * `HGBilateralFilterInterp::DestroyGraph()` @Helium 0x108ff0.
   *
   * Releases the outputHead child (via HGNode vtable *0x18 = Release @0x1a0f30)
   * and clears it (@0x108ffa..@0x109014); then for each of the four vectors
   * (in binary order 0x198, 0x1a0, 0x1a8, 0x1b0), pops the SOLE element (r14,
   * a 2-word wrapper), calls operator delete on wrapper.inner (via a copy of
   * the pointer to wrapper+8 — presumably an intrusive back-link) then on
   * wrapper itself, and clears the vector's begin pointer to null.
   *
   * ── C++ pattern (matches @0x108ff0..@0x1090d7 for all four vectors):
   *     if (v.begin) {                        // .begin at (v+0)
   *         w = *v.begin
   *         if (w->inner (+0)) {              // NON-standard: w is 16 bytes
   *             w->linkedField (+8) = w->inner
   *             HGObject::operator delete(w->inner)
   *         }
   *         HGObject::operator delete(w)
   *         v.begin = null                     // clears just .begin, not .end
   *     }
   *
   * TS transcription: since we model each vector as `HGNode[]` and don't own
   * the 2-word "wrapper" layout (that's a BuildGraph-time construction we
   * haven't decoded), the faithful reflex here is to CLEAR each vector and
   * null out `outputHead`; the wrapper-inner delete is a memory-management
   * detail JS's GC handles for us once we drop the references.
   */
  public DestroyGraph(): void {
    // @0x108ffa..@0x109014: release outputHead via vtable *0x18, then null.
    // vtable *0x18 = HGObject::Release @0x1a0f30 (ref-count decrement +
    // conditional destroy). Not yet transcribed — surfaced via HGNode's
    // owner if/when a live outputHead pointer is present here.
    if (this.outputHead !== null) {
      // In FCP this is `callq *0x18(vtable(outputHead))` @0x109009 — a
      // Release call. TS drops the reference; JS GC completes the effect.
      this.outputHead = null; // @0x10900c
    }
    // @0x109017..@0x109047: vecA (offset 0x198) — delete inner wrapper.
    this.vecA.length = 0; // clears begin/end/end_cap effectively (@0x10903c)
    // @0x109047..@0x109077: vecB (offset 0x1a0).
    this.vecB.length = 0; // @0x10906c
    // @0x109077..@0x1090a7: vecC (offset 0x1a8).
    this.vecC.length = 0; // @0x10909c
    // @0x1090a7..@0x1090d7: vecD (offset 0x1b0).
    this.vecD.length = 0; // @0x1090cc
  }

  /**
   * `HGBilateralFilterInterp::BuildGraph()` @Helium 0x109280.
   *
   * 602 lines of graph wiring: allocates per-bin HGNode-subclass instances,
   * constructs 2-word wrappers, pushes them into the four vectors at 0x198/
   * 0x1a0/0x1a8/0x1b0, calls SetInput chains between them, and finally
   * writes the wired sink into `outputHead` (@0x1c0). The subclass targets
   * (blur / thresholding / interpolation kernel nodes) live in TUs not yet
   * transcribed.
   *
   * Not yet transcribed @Helium 0x109280 — throws.
   */
  public BuildGraph(): void {
    throw new Error(
      "HGBilateralFilterInterp::BuildGraph() @Helium 0x109280 not yet transcribed " +
        "(602-line graph builder; per-bin HGNode subclasses undecoded)",
    );
  }

  /**
   * `HGBilateralFilterInterp::UpdateParams()` @Helium 0x109bb0.
   *
   * See file header for the full per-bin scheme. The transcription mirrors
   * the disassembly's instruction order and constants exactly.
   *
   * Loop bounds: `for (uint32_t k = 0; k <= numBins; ++k)` — the `ja` at
   * @0x109c1a (`if r14 > r15 exit`) means k == numBins IS visited (calls 1–4
   * fire for the trailing bin edge; call 5 into vecD @0x1b0 is guarded by
   * the extra `jae` at @0x109d77 which skips it when k >= numBins).
   *
   * Every vector index access mirrors the binary's own bounds check
   * (@0x109c23..@0x109c3e etc.): if `size <= k`, throw the same
   * `std::__1::vector<HGNode*>::__throw_out_of_range` (@0x109d9e) semantic.
   */
  public UpdateParams(): void {
    // @0x109bc0  r15 = this.numBins  (u32).
    let numBins = this.numBins >>> 0;

    // @0x109bc7  r14 = 0 (loop index k, u32).
    // @0x109bca  jmp  0x109c23  — enter the "check vecA.size > k" body first.
    for (let k = 0; ; k = (k + 1) >>> 0) {
      // ── vecA @0x1a8 bounds check @0x109c23..0x109c3e ────────────────
      // Note: the disassembly's `rcx = 0x1a8(this) + 0` and `rcx = 0x1a8+8`,
      // then `(end - begin) >> 3` (each pointer is 8 bytes) → size.
      // (See @0x109c26..@0x109c37.) We use `.length` since the TS model
      // already stores element count natively.
      if (this.vecA.length <= k) throw_vec_out_of_range();
      // ── load fields into stack slots (mirrors @0x109c44..@0x109c59) ──
      const rs = Math.fround(this.rangeScale); // @0x1d8 → -0x20  (@0x109c44)
      const ro = Math.fround(this.rangeOffset); // @0x1dc → -0x1c  (@0x109c51)
      const sBR = Math.fround(this.spatialBlurRadius); // @0x1cc  (@0x109c62)
      const iBR = Math.fround(this.intensityBlurRadius); // @0x1d0  (@0x109c99)

      // ── [call 1] vecA[k].SetParameter(0, sBR, sBR, 0, 0)  @0x109c78 ──
      // The disasm loads xmm0=sBR into both xmm0 and xmm1 (movaps xmm0,xmm1
      // @0x109c75) and zeros xmm2/xmm3 (@0x109c6d/@0x109c70). esi=0.
      this.vecA[k].SetParameter(0, sBR, sBR, Math.fround(0.0), Math.fround(0.0));

      // ── vecB @0x1a0 bounds check @0x109c7b..0x109c93 ────────────────
      if (this.vecB.length <= k) throw_vec_out_of_range();

      // ── [call 2] coefI = (float)(K_MINUS9 / (K_LN4 * iBR * iBR))  @0x109c99..0x109cc0
      //   cvtss2sd  iBR                    → xmm0 (f64)
      //   mulsd     K_LN4, xmm1  ;  xmm1 = xmm0 * K_LN4
      //   mulsd     xmm0, xmm1   ;  xmm1 = (xmm0 * K_LN4) * xmm0  = K_LN4 * iBR^2
      //   movsd     K_MINUS9      → xmm0
      //   divsd     xmm1, xmm0    ;  xmm0 = K_MINUS9 / (K_LN4 * iBR^2)
      //   cvtsd2ss  xmm0 → f32
      //   call *0x60 with (esi=0, xmm0=xmm1=xmm2=coefI, xmm3=0)  @0x109cd6
      const iD = iBR; // cvtss2sd — JS numbers are f64 already
      const denomI = K_LN4 * iD * iD;
      const coefI = Math.fround(K_MINUS9 / denomI);
      this.vecB[k].SetParameter(0, coefI, coefI, coefI, Math.fround(0.0));

      // ── vecB @0x1a0 bounds check @0x109cd9..0x109cf1 (SAME vector, again) ─
      if (this.vecB.length <= k) throw_vec_out_of_range();

      // ── [call 3] offset = ro + (kF * rs) / numBinsF  @0x109cf7..0x109d36 ─
      //   cvtsi2ss  k (r14, treated as int64 → f32)      → xmm0  @0x109cfa
      //   mulss     -0x20(rs), xmm0                       → xmm0 = k * rs
      //   mov       r15d, ecx  ;  cvtsi2ss  ecx → xmm1     ; numBins as int64→f32
      //   movss     xmm1, -0x24(rbp)                       ; SAVE numBinsF to stack (used by call 5)
      //   divss     xmm1, xmm0                             → xmm0 = (k * rs) / numBinsF
      //   addss     -0x1c(ro), xmm0                        → xmm0 = ro + (k * rs) / numBinsF
      //   movaps    xmm0, -0x40(rbp)                       ; SAVE offset to stack (used by call 5)
      //   call *0x60 with (esi=1, xmm0=xmm1=xmm2=xmm3=offset)  @0x109d36
      // Note: k is u32; SysV ABI CVTSI2SS reads a 64-bit register (r14),
      // safe because k <= numBins <= 2^32 - 1 which fits in i64. In TS `k`
      // is a JS number already; Math.fround yields the f32 view.
      const kF = Math.fround(k); // cvtsi2ss @0x109cfa
      const numBinsF = Math.fround(numBins); // cvtsi2ss @0x109d0a; STORED at -0x24
      const kRs = Math.fround(kF * rs); // mulss @0x109cff
      const kRsOverN = Math.fround(kRs / numBinsF); // divss @0x109d14
      const offset = Math.fround(kRsOverN + ro); // addss @0x109d18 — SAVED at -0x40
      this.vecB[k].SetParameter(1, offset, offset, offset, offset);

      // ── vecC @0x1a8 bounds check @0x109d39..0x109d51 ────────────────
      if (this.vecC.length <= k) throw_vec_out_of_range();

      // ── [call 4] vecC[k].SetParameter(0, sBR, sBR, 0, 0)  @0x109d6d ──
      //   Reload sBR from field @0x1cc (@0x109d57) — the disasm does the
      //   reload rather than reuse the -0x20 slot; we mirror that intent
      //   (the value is unchanged, but the read is FROM THE FIELD).
      const sBR2 = Math.fround(this.spatialBlurRadius); // @0x109d57
      this.vecC[k].SetParameter(
        0,
        sBR2,
        sBR2,
        Math.fround(0.0),
        Math.fround(0.0),
      );

      // ── loop-terminator check @0x109d70..0x109d7a ───────────────────
      //   r15d = this.numBins (reload)      @0x109d70
      //   if (k >= numBins) goto @0x109c17 (increment + top-check)
      //                     — SKIPS the vecD @0x1b0 call.
      // We re-load numBins here (the field could theoretically change if a
      // vtable SetParameter callback re-entered; the binary reloads it, so
      // we do too).
      numBins = this.numBins >>> 0; // @0x109d70

      if (k < numBins) {
        // ── vecD @0x1b0 bounds check @0x109d80..0x109d98 ──────────────
        if (this.vecD.length <= k) throw_vec_out_of_range();

        // ── [call 5] vecD[k].SetParameter(0, offset, nextOff, recipD, negOffD)
        //   @0x109bd0..@0x109c0d
        //   movss  -0x20(rs), xmm4                      ; xmm4 = rs
        //   divss  -0x24(numBinsF), xmm4                ; xmm4 = rs / numBinsF
        //   addss  -0x1c(ro), xmm4                      ; xmm4 = rs/numBinsF + ro
        //                                               ;    ── this is the WIDTH+ro of one bin
        //   movaps xmm4, xmm1                           ; xmm1 = xmm4
        //   movaps -0x40(offset), xmm0                  ; xmm0 = SAVED offset (from call 3)
        //   addss  xmm0, xmm1                           ; xmm1 = (rs/numBinsF + ro) + offset
        //                                               ;      = ro + (k+1)*rs/numBinsF + ro
        //   movss  K_ONEF(@0x3c7cc0), xmm2              ; xmm2 = 1.0f
        //   divss  xmm4, xmm2                           ; xmm2 = 1 / (rs/numBinsF + ro)
        //   movaps xmm0, xmm3                           ; xmm3 = offset
        //   xorps  K_SIGN_MASK32(@0x3ca0d0), xmm3       ; xmm3 = -offset
        //   divss  xmm4, xmm3                           ; xmm3 = -offset / (rs/numBinsF + ro)
        //   call *0x60 with (esi=0, xmm0=offset, xmm1, xmm2, xmm3)  @0x109c0d
        const rsOverN = Math.fround(rs / numBinsF);
        const denom4 = Math.fround(rsOverN + ro);
        const nextOff = Math.fround(offset + denom4);
        const recipD = Math.fround(K_ONEF / denom4);
        const negOffD = Math.fround(-offset / denom4);
        this.vecD[k].SetParameter(0, offset, nextOff, recipD, negOffD);

        // fall through to the increment/loop-top check via @0x109c10 path
        // (@0x109c10 reloads r15d = this.numBins again; we reload below).
      }

      // @0x109c10 (loop increment path) or @0x109c17 (skip-vecD path):
      //   r15d = this.numBins                     @0x109c10  (already reloaded above)
      //   ++r14
      //   if (r14 > r15) exit                     @0x109c1a..0x109c1d
      // The loop terminates when k > numBins, i.e. after the trailing
      // k == numBins iteration has run its four SetParameter calls
      // (call 5 is skipped for k == numBins by the earlier `jae`).
      numBins = this.numBins >>> 0; // @0x109c10
      if (k >= numBins) break; // ja == `k+1 > numBins` == `k >= numBins`
    }
  }

  /**
   * `HGBilateralFilterInterp::GetOutput(HGRenderer*)` @Helium 0x109db0.
   *
   *   pushq ... ; movq %rdi, %rbx                    ; rbx = this
   *   movq   0x1b8(%rdi), %r14                       ; r14 = rootChild
   *   movq   %rsi, %rdi ; movq %rbx, %rsi ; xorl %edx,%edx
   *   callq  HGRenderer::GetInput(HGNode*, int)      @0x109dc9
   *   movq   (%r14), %rcx ; movq %r14, %rdi ; xorl %esi, %esi ; movq %rax, %rdx
   *   callq  *0x78(%rcx)                             @0x109dd9   ← rootChild.SetInput(0, input)
   *   cmpb   $0x1, 0x1d4(%rbx)                       @0x109ddc  (dirtyFlag == 1)
   *   jne    0x109ded
   *   movq   %rbx, %rdi ; callq BuildGraph()          @0x109de8
   *   movq   %rbx, %rdi ; callq UpdateParams()        @0x109df0
   *   movq   0x1c0(%rbx), %rax                       @0x109df5   ← return outputHead
   *   epilogue.
   */
  public GetOutput(renderer: HGRenderer): HGNode | null {
    // @0x109dba  r14 = this.rootChild
    const rootChild = this.rootChild;

    // @0x109dc9  input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);

    // @0x109dd9  rootChild.SetInput(0, input) via HGNode vtable *0x78
    rootChild.SetInput(0, input);

    // @0x109ddc..@0x109de3  if (dirtyFlag == 1) BuildGraph()
    if (this.dirtyFlag) {
      this.BuildGraph(); // @0x109de8
    }

    // @0x109df0  UpdateParams()
    this.UpdateParams();

    // @0x109df5  return this.outputHead
    return this.outputHead;
  }
}

/**
 * `std::__1::vector<HGNode*, std::allocator<HGNode*>>::__throw_out_of_range`
 * — the libc++ out-of-range trampoline invoked from @0x109d9e whenever any
 * of the four vectors' `.size() <= k`. Faithful in TS: throw a matching
 * error. Not yet transcribed as a real C++ dispatcher (it's a libc++
 * private symbol); the TS `throw` mirrors its effect on the caller.
 */
function throw_vec_out_of_range(): never {
  throw new Error(
    "std::vector<HGNode*>::__throw_out_of_range @Helium (called from " +
      "HGBilateralFilterInterp::UpdateParams @0x109d9e)",
  );
}
