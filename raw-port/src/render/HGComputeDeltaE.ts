// HGComputeDeltaE.ts — Helium "Compute Delta-E" render-graph node. An
// HGNode subclass that dispatches on a set of enum parameters (mode,
// color-space id, alpha) to either build a graph of HDR->linear-RGB
// conversion nodes (ITP path) or a graph of RGB->L*a*b* conversion +
// tone-mapping nodes (DE2000 path), then swaps in one of two owned
// compute-kernel child nodes (HgcComputeDeltaEITP or
// HgcComputeDeltaE2000fromLAB) at (this+0x1a8) whose output the
// caller consumes.
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Disassembly captured at:
//   raw-port/re/disasm/Helium.HGComputeDeltaE.HGComputeDeltaE.s              (32 lines)
//   raw-port/re/disasm/Helium.HGComputeDeltaE.~HGComputeDeltaE.s             (23 lines)
//   raw-port/re/disasm/Helium.HGComputeDeltaE.SetParameter.s                 (43 lines)
//   raw-port/re/disasm/Helium.HGComputeDeltaE.ConvertToDLRGBForDEITP.s      (226 lines)
//   raw-port/re/disasm/Helium.HGComputeDeltaE.ConvertToLABColorSpaceForDE2000.s (218 lines)
//   raw-port/re/disasm/Helium.HGComputeDeltaE.GetOutput.s                   (267 lines)
//
// Nine exported symbols owned by this class:
//   @Helium 0x0937e0  C1     — HGComputeDeltaE::HGComputeDeltaE()
//   @Helium 0x0937e0  C2     — (C1 and C2 share the same body — same __ZN..C1Ev / C2Ev entry)
//   @Helium 0x0938e0  D0     — deleting dtor (+ HGObject::operator delete)
//   @Helium 0x0938e0  D1/D2  — same shape, sharing the pre-delete body
//   @Helium 0x093930  SetParameter(int kind, float, float, float, float)
//   @Helium 0x093c90  ConvertToDLRGBForDEITP(HGRef<HGNode> const&)
//   @Helium 0x0939b0  ConvertToLABColorSpaceForDE2000(HGRef<HGNode> const&)
//   @Helium 0x093fc0  GetOutput(HGRenderer*)
//
// Class layout (proved by C2 loads + SetParameter accessors + all three
// graph-builders + GetOutput):
//   this+0x000  vtable "HGComputeDeltaE" (RIP @0x0937ef target is +0x10 into vtable)
//   this+0x008..0x190  HGNode base subobject (see HGNode::HGNode())
//   this+0x198  u32 mode (SetParameter kind=0 sets it; range 0..1;
//                          C2+0x19 `movq $0x0, 0x198` zero-initialises
//                          both this and +0x19c as a 64-bit store).
//                          Also read by GetOutput @0x93fd7:
//                          mode==0 => new HgcComputeDeltaE2000fromLAB;
//                          mode!=0 => new HgcComputeDeltaEITP.
//   this+0x19c  u32 colorSpaceEnum (SetParameter kind=1 sets it; range 0..6).
//                          Read by both ConvertTo... builders to select the
//                          conversion graph branch (jump table for ITP path,
//                          `-1..3` range check for DE2000 path).
//   this+0x1a0  u32 alphaFlag (SetParameter kind=2 sets it; range 0..1;
//                          C2+0x24 `movl $0x0, 0x1a0` initialises to 0).
//                          Read by ConvertToDLRGBForDEITP @0x93cc8
//                          (`movl 0x1a0(%rsi), %r12d`) to select between
//                          two f32 constants @0x3cd208/+4.
//   this+0x1a8  HGRef<HGNode>* activeChild (owned; ptr, refcounted).
//                          C2+0x2e `movq $0x0, 0x1a8` inits to null.
//                          Swapped in GetOutput @0x94038 via the standard
//                          `test-old; if non-null vtable[*0x18] release;
//                          store new; if same-ptr skip release` dance.
//                          Also released in D0/D1/D2 via *0x18.
//
// GetOutput is the top-level entry point. It:
//   1. Reads `mode` at this+0x198.
//   2. Allocates a new child (0x1a0 bytes) via HGObject::operator new.
//   3. Constructs it as HgcComputeDeltaEITP (mode!=0) OR HgcComputeDeltaE2000fromLAB (mode==0).
//   4. Releases the previously-cached this+0x1a8, stores the new child.
//   5. Calls renderer->GetInput(this, 0) and renderer->GetInput(this, 1) to
//      fetch the two upstream inputs (fg, bg).
//   6. For each input, calls ConvertToDLRGBForDEITP or
//      ConvertToLABColorSpaceForDE2000 (per mode) to build the pre-conversion
//      graph, then wires the resulting node into the child via SetInput.
//   7. Returns the child as the output node.
//
// Both Convert* helpers dispatch on this+0x19c (colorSpaceEnum) via a jump
// table (ITP path) or a linear branch chain (LAB path). Each branch news up
// one of the following HGNode subclasses and chains it as a child of the
// prior stage:
//   - HGHLG::InverseOETF          @93d59
//   - HGHLG::OOTF(ColorPrimaries, double) + setPeakDisplayLuminance @93d89/@93dae
//   - HGColorConformLUTData::MakeGammaCorrectLUT (?)  — via generic HGColorConformLUTData factory
//   - HGToneCurve + SetAcceleratedState + SetToneCurveQuality  @93a0d/@93a1a  (DE2000 path)
//   - HGPQ / HG709 / HG2020 primary-space converters (per jump-table branches)
//   - HGComputeMatrixColorSpaceMultiply (for RGB->XYZ / XYZ->RGB gamut chains)
// These are ALL undecoded here — every one is a frontier callee. See the
// throw-stubs below for the full inventory with cited addrs.
//
// -----------------------------------------------------------------------------

import { HGNode } from "./HGNode.js";

/** Opaque handle for Helium's `HGRenderer*` render-graph context. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };
/** Opaque handle for a generic `HGNode*` (base or subclass — refcounted). */
export type HGNodePtr = { readonly __brand: "HGNode" };

// ---------------------------------------------------------------------------
// Frontier callees — every undecoded external call from this class throws
// with the exact address it is dispatched from. Ledger driven off these.
// ---------------------------------------------------------------------------

/** HGObject::operator new(size_t) — child allocation (0x1a0 bytes in
 *  GetOutput @0x093fde, 0x1b0 bytes in ConvertToDLRGBForDEITP @0x093cd4,
 *  0x1e0 bytes in ConvertToLABColorSpaceForDE2000 @0x0939d7, and various
 *  other sizes at each new-up site — same __ZN8HGObjectnwEm symbol). */
function HGObject_operatorNew(_size: number): HGNodePtr {
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed " +
      "(frontier callee first used @Helium 0x093fe3 in HGComputeDeltaE::GetOutput)",
  );
}

/** HGNode::HGNode() — base ctor for a freshly-allocated child. Called
 *  from ConvertToDLRGBForDEITP @0x093cdf. */
function HGNode_C2(_self: HGNodePtr): void {
  throw new Error(
    "HGNode::HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x093cdf in HGComputeDeltaE::ConvertToDLRGBForDEITP)",
  );
}

/** HGNode::SetSupportedFormatPrecisions(unsigned int) — called at end of
 *  the ctor @0x093821 with argument 0xc (F16|F32 mask). Not yet decoded
 *  on the HGNode base — surfaced as a frontier here. */
function HGNode_SetSupportedFormatPrecisions(_self: HGNodePtr, _mask: number): void {
  throw new Error(
    "HGNode::SetSupportedFormatPrecisions(unsigned int) not yet transcribed " +
      "(frontier callee @Helium 0x093821 in HGComputeDeltaE::HGComputeDeltaE())",
  );
}

/** HGNode::SetInput(int slot, HGNode*) — used at
 *  ConvertToDLRGBForDEITP @0x093d27. */
function HGNode_SetInput(_self: HGNodePtr, _slot: number, _upstream: HGNodePtr | null): void {
  throw new Error(
    "HGNode::SetInput(int, HGNode*) not yet transcribed " +
      "(frontier callee @Helium 0x093d27 in HGComputeDeltaE::ConvertToDLRGBForDEITP)",
  );
}

/** Vtable slot *0x10 — HGObject::Retain() (Helium's Retain in *0x10 by
 *  convention across this framework). Called after each new-and-swap in
 *  ConvertToDLRGBForDEITP @0x093d38 and elsewhere. */
function vtable_0x10_Retain(_self: HGNodePtr): void {
  throw new Error(
    "HGObject::Retain (vtable *0x10) not yet transcribed " +
      "(frontier callee @Helium 0x093d38 in HGComputeDeltaE::ConvertToDLRGBForDEITP)",
  );
}

/** Vtable slot *0x18 — HGObject::Release(). Called on the OLD child in
 *  GetOutput @0x094010 and D0 @0x0938fa+@0x093902. */
function vtable_0x18_Release(_self: HGNodePtr): void {
  throw new Error(
    "HGObject::Release (vtable *0x18) not yet transcribed " +
      "(frontier callee @Helium 0x093902 in HGComputeDeltaE::~HGComputeDeltaE)",
  );
}

/** Vtable slot *0x78 — HGNode::SetInput(int, HGNode*) via vtable. Used
 *  throughout the Convert* graph-builders (e.g. LAB path @0x093a2d). */
function vtable_0x78_SetInput(
  _self: HGNodePtr,
  _slot: number,
  _upstream: HGNodePtr | null,
): void {
  throw new Error(
    "HGNode::SetInput (vtable *0x78) not yet transcribed " +
      "(frontier callee @Helium 0x093a2d in HGComputeDeltaE::ConvertToLABColorSpaceForDE2000)",
  );
}

/** HGHLG::InverseOETF::InverseOETF() — HDR inverse OETF stage constructor,
 *  called in ConvertToDLRGBForDEITP @0x093d59. */
function HGHLG_InverseOETF_C1(_self: HGNodePtr): void {
  throw new Error(
    "HGHLG::InverseOETF::InverseOETF() not yet transcribed " +
      "(frontier callee @Helium 0x093d59 in HGComputeDeltaE::ConvertToDLRGBForDEITP)",
  );
}

/** HGHLG::OOTF::OOTF(HGHLG::OOTF::ColorPrimaries, double) — HLG OOTF
 *  constructor, called in ConvertToDLRGBForDEITP @0x093d89 with
 *  primaries=1 and a double loaded from RIP @0x93d79 (peak luminance seed). */
function HGHLG_OOTF_C1(
  _self: HGNodePtr,
  _primaries: number,
  _peakDisplayLuminanceSeed: number,
): void {
  throw new Error(
    "HGHLG::OOTF::OOTF(HGHLG::OOTF::ColorPrimaries, double) not yet transcribed " +
      "(frontier callee @Helium 0x093d89 in HGComputeDeltaE::ConvertToDLRGBForDEITP)",
  );
}

/** HGHLG::OOTF::setPeakDisplayLuminance(double) — called immediately after
 *  the OOTF ctor with a double loaded from RIP @0x093da3.  */
function HGHLG_OOTF_setPeakDisplayLuminance(_self: HGNodePtr, _peak: number): void {
  throw new Error(
    "HGHLG::OOTF::setPeakDisplayLuminance(double) not yet transcribed " +
      "(frontier callee @Helium 0x093dae in HGComputeDeltaE::ConvertToDLRGBForDEITP)",
  );
}

/** HGToneCurve::HGToneCurve() — LAB-path tone-curve stage constructor,
 *  called in ConvertToLABColorSpaceForDE2000 @0x0939e2. */
function HGToneCurve_C1(_self: HGNodePtr): void {
  throw new Error(
    "HGToneCurve::HGToneCurve() not yet transcribed " +
      "(frontier callee @Helium 0x0939e2 in HGComputeDeltaE::ConvertToLABColorSpaceForDE2000)",
  );
}

/** HGToneCurve::SetAcceleratedState(hgToneCurveAcceleratedState) — called
 *  in ConvertToLABColorSpaceForDE2000 @0x093a0d. The enum value is chosen
 *  by cmov ladder on this+0x19c: colorSpaceEnum==3 -> 1, ==1 -> 5, else 7. */
function HGToneCurve_SetAcceleratedState(_self: HGNodePtr, _state: number): void {
  throw new Error(
    "HGToneCurve::SetAcceleratedState(HGToneCurve::hgToneCurveAcceleratedState) " +
      "not yet transcribed (frontier callee @Helium 0x093a0d in " +
      "HGComputeDeltaE::ConvertToLABColorSpaceForDE2000)",
  );
}

/** HGToneCurve::SetToneCurveQuality(hgToneCurveQuality) — called in
 *  ConvertToLABColorSpaceForDE2000 @0x093a1a with quality=7. */
function HGToneCurve_SetToneCurveQuality(_self: HGNodePtr, _quality: number): void {
  throw new Error(
    "HGToneCurve::SetToneCurveQuality(HGToneCurve::hgToneCurveQuality) " +
      "not yet transcribed (frontier callee @Helium 0x093a1a in " +
      "HGComputeDeltaE::ConvertToLABColorSpaceForDE2000)",
  );
}

/** HgcComputeDeltaEITP::HgcComputeDeltaEITP() — child compute-kernel for
 *  the ITP-based Delta-E variant. Called in GetOutput @0x093ff3 when
 *  mode!=0. */
function HgcComputeDeltaEITP_C1(_self: HGNodePtr): void {
  throw new Error(
    "HgcComputeDeltaEITP::HgcComputeDeltaEITP() not yet transcribed " +
      "(frontier callee @Helium 0x093ff3 in HGComputeDeltaE::GetOutput)",
  );
}

/** HgcComputeDeltaE2000fromLAB::HgcComputeDeltaE2000fromLAB() — child
 *  compute-kernel for the DE2000-in-LAB variant. Called in GetOutput
 *  @0x094018 when mode==0. */
function HgcComputeDeltaE2000fromLAB_C1(_self: HGNodePtr): void {
  throw new Error(
    "HgcComputeDeltaE2000fromLAB::HgcComputeDeltaE2000fromLAB() not yet transcribed " +
      "(frontier callee @Helium 0x094018 in HGComputeDeltaE::GetOutput)",
  );
}

/** HGRenderer::GetInput(HGNode* self, int slot) — used in GetOutput
 *  @0x094047 (slot 0) and @0x09406e (slot 1) to fetch the fg/bg inputs. */
function HGRenderer_GetInput(
  _renderer: HGRendererPtr,
  _self: HGNodePtr,
  _slot: number,
): HGNodePtr | null {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed " +
      "(frontier callee @Helium 0x094047 in HGComputeDeltaE::GetOutput)",
  );
}

/** HGObject::operator delete(void*) — tail-called from D0 @0x093916. The
 *  TS GC subsumes the raw free, but we keep the stub so any caller that
 *  flows through this path lands on a marker instead of a silent no-op. */
function HGObject_operatorDelete(_p: HGComputeDeltaE): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed " +
      "(frontier callee @Helium 0x093916 in HGComputeDeltaE::~HGComputeDeltaE (D0))",
  );
}

// ---------------------------------------------------------------------------
// Data constants — decoded from RIP-relative loads in ConvertTo* helpers.
// ---------------------------------------------------------------------------

/** @Helium __DATA_CONST @ ripBase+0x339515 relative to 0x93cec — a two-
 *  element f32 table indexed by (r12d==0 ? 1 : 0). Selects an alpha-lane
 *  scalar for the DLRGB conversion output, chosen by this+0x1a0.
 *  We CANNOT fabricate these bytes without a fresh RIP-resolve pass;
 *  provenance-gate requires a decode citation for any numeric literal.
 *  The exact 8-byte table lives at file-offset 0x3cd208 (Helium slide);
 *  populate with `python3 raw-port/army/tools/resolve.py Helium 0x3cd208`. */
export const HGComputeDeltaE_ALPHA_LANE_TABLE_ADDR = 0x3cd208 as const;

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

/**
 * `HGComputeDeltaE` — HGNode subclass that packages the "Compute Delta-E"
 * kernel dispatch. Owns one active compute-kernel child at (this+0x1a8).
 *
 * @Helium symbols owned by this class:
 *   C1/C2        @0x0937e0  (both spelled __ZN15HGComputeDeltaEC1Ev / C2Ev — same body)
 *   D0           @0x0938e0
 *   D1/D2        (same body shape, sharing the pre-delete tear-down)
 *   SetParameter @0x093930
 *   ConvertToDLRGBForDEITP           @0x093c90
 *   ConvertToLABColorSpaceForDE2000  @0x0939b0
 *   GetOutput    @0x093fc0
 */
export class HGComputeDeltaE extends HGNode {
  // -------------------------------------------------------------------------
  // Fields (see class-layout block at the top of the file for byte offsets).
  // -------------------------------------------------------------------------

  /** this+0x198 — mode: 0 => DE2000-from-LAB path, non-zero => ITP path. */
  private mode: number;

  /** this+0x19c — colorSpaceEnum: source-space identifier, range 0..6.
   *  Consumed by both graph-builders. */
  private colorSpaceEnum: number;

  /** this+0x1a0 — alphaFlag: range 0..1. Selects which f32 alpha-lane
   *  scalar the ITP-path RGB conversion uses (see ALPHA_LANE_TABLE_ADDR). */
  private alphaFlag: number;

  /** this+0x1a8 — cached active compute-kernel child (HGRef<HGNode>).
   *  Swapped by GetOutput; released by dtor. */
  private activeChild: HGNodePtr | null;

  /**
   * @Helium 0x0937e0  HGComputeDeltaE::HGComputeDeltaE()
   *
   * Body (32 lines):
   *   pushq  %rbp / movq %rsp, %rbp / pushq %r14 / pushq %rbx
   *   movq   %rdi, %rbx
   *   callq  __ZN6HGNodeC2Ev                       ; base ctor
   *   leaq   0x977bc2(%rip), %rax                  ; vtable "HGComputeDeltaE"
   *   movq   %rax, (%rbx)                          ; install vtable ptr
   *   movq   $0x0, 0x198(%rbx)                     ; mode=0 AND colorSpaceEnum=0 (8-byte zero)
   *   movl   $0x0, 0x1a0(%rbx)                     ; alphaFlag=0
   *   movq   $0x0, 0x1a8(%rbx)                     ; activeChild=null
   *   movq   %rbx, %rdi / movl $0xc, %esi
   *   callq  __ZN6HGNode28SetSupportedFormatPrecisionsEj(0xc)
   *   popq   %rbx / popq %r14 / popq %rbp / retq
   */
  constructor() {
    super();
    // @Helium 0x0937f9  movq $0x0, 0x198(%rbx)  (packed store initialises
    //                   BOTH mode (u32) and colorSpaceEnum (u32) to 0)
    this.mode = 0;
    this.colorSpaceEnum = 0;
    // @Helium 0x093804  movl $0x0, 0x1a0(%rbx)
    this.alphaFlag = 0;
    // @Helium 0x09380e  movq $0x0, 0x1a8(%rbx)
    this.activeChild = null;

    // @Helium 0x09381c..0x093821  callq HGNode::SetSupportedFormatPrecisions(0xc)
    // 0xc == HGNodeFormatPrecision::F32 | HGNodeFormatPrecision::F16 (bit-2 | bit-3
    // per HGNode.ts) — this node supports F16 and F32 formats. The base
    // method is not yet ported on HGNode; call the frontier stub so a
    // caller flowing through here surfaces the gap loudly.
    HGNode_SetSupportedFormatPrecisions(this as unknown as HGNodePtr, 0xc);
  }

  /**
   * @Helium 0x093930  HGComputeDeltaE::SetParameter(int kind, float, float, float, float)
   *
   * Only the `kind` selector and the first float argument are consumed.
   * The remaining three floats are ignored (they're in-register when the
   * call arrives but never read from). Returns i32 status:
   *    -1 (0xffffffff) => unknown `kind` or out-of-range value
   *     0              => value unchanged (already equal to what's stored)
   *     1              => value changed and stored
   *
   * Body:
   *   mov  $0xffffffff, %eax
   *   cmpl $0x2, %esi ; je  case-2       ; kind==2 => alphaFlag
   *   cmpl $0x1, %esi ; je  case-1       ; kind==1 => colorSpaceEnum
   *   testl %esi, %esi                    ; kind==0 => mode
   *   jne  return_-1
   *   cvttss2si %xmm0, %rcx               ; case-0: v = int(f)
   *   cmpl $0x1, %ecx ; ja  return_-1     ; range 0..1
   *   cmpl %ecx, 0x198(%rdi) ; jne set0   ; if new value differs, store & return 1
   *   xorl %eax, %eax ; ret               ; same value: return 0
   * case-1:
   *   cvttss2si %xmm0, %rcx
   *   cmpl $0x6, %ecx ; ja  return_-1     ; range 0..6
   *   cmpl %ecx, 0x19c(%rdi) ; jne set1
   *   xorl %eax, %eax ; ret
   * case-2:
   *   cvttss2si %xmm0, %rcx
   *   cmpl $0x1, %ecx ; ja  return_-1     ; range 0..1
   *   cmpl %ecx, 0x1a0(%rdi) ; jne set2
   *   xorl %eax, %eax ; ret
   * set1:   movl %ecx, 0x19c(%rdi) ; jmp return_1
   * set2:   movl %ecx, 0x1a0(%rdi) ; jmp return_1
   * set0:   movl %ecx, 0x198(%rdi)
   * return_1: movl $0x1, %eax ; ret
   * return_-1: popq %rbp ; ret            ; %eax still holds 0xffffffff
   */
  SetParameter(kind: number, v0: number, _v1: number, _v2: number, _v3: number): number {
    // @Helium 0x093934  movl $0xffffffff, %eax
    // Default status is -1; overwritten only on the "set" and "same" paths.

    if (kind === 2) {
      // @Helium 0x093973  cvttss2si %xmm0, %rcx
      // x86 cvttss2si truncates toward zero; Math.fround first to model
      // the single-precision xmm0, then Math.trunc for the truncation.
      const c = Math.trunc(Math.fround(v0));
      // @Helium 0x09397b  cmpl $0x1 ; ja return_-1   (unsigned compare)
      // Reject negatives (they'd be huge as unsigned) AND >1.
      if (c >>> 0 > 1) return -1 | 0;
      // @Helium 0x09397d  cmpl %ecx, 0x1a0(%rdi)
      if ((this.alphaFlag | 0) === c) return 0; // same value
      // @Helium 0x093991  movl %ecx, 0x1a0(%rdi)
      this.alphaFlag = c;
      return 1;
    }

    if (kind === 1) {
      // @Helium 0x09395d  cvttss2si %xmm0, %rcx
      const c = Math.trunc(Math.fround(v0));
      // @Helium 0x093962  cmpl $0x6 ; ja return_-1  (unsigned)
      if (c >>> 0 > 6) return -1 | 0;
      // @Helium 0x093967  cmpl %ecx, 0x19c(%rdi)
      if ((this.colorSpaceEnum | 0) === c) return 0;
      // @Helium 0x093989  movl %ecx, 0x19c(%rdi)
      this.colorSpaceEnum = c;
      return 1;
    }

    if (kind === 0) {
      // @Helium 0x093947  cvttss2si %xmm0, %rcx
      const c = Math.trunc(Math.fround(v0));
      // @Helium 0x09394c  cmpl $0x1 ; ja return_-1  (unsigned)
      if (c >>> 0 > 1) return -1 | 0;
      // @Helium 0x093951  cmpl %ecx, 0x198(%rdi)
      if ((this.mode | 0) === c) return 0;
      // @Helium 0x093999  movl %ecx, 0x198(%rdi)
      this.mode = c;
      return 1;
    }

    // @Helium 0x093945  jne 0x939a4  (fell through for kind ∉ {0,1,2}) => -1
    return -1 | 0;
  }

  /**
   * @Helium 0x093c90  HGComputeDeltaE::ConvertToDLRGBForDEITP(HGRef<HGNode> const&)
   *
   * 226 lines. Reads colorSpaceEnum at (source+0x19c) — arg2 is an
   * HGRef<HGNode>* whose *0x19c holds the source-node's colour-space
   * identifier. A 6-entry jump table @rip+0x2dd (base @0x093cbf) then
   * branches through one of six graph-builder subroutines, each of which:
   *   - HGObject_operatorNew's a 0x1b0/0x1c0/0x1a0-byte HGNode subclass
   *     (HGHLG::InverseOETF, HGHLG::OOTF, an unbranded child, etc.),
   *   - constructs it,
   *   - wires it as a child of the previous stage via HGNode::SetInput
   *     or vtable *0x78,
   *   - retains it, releases the caller-supplied ref, and stores the
   *     new stage into arg1 (%r14).
   *
   * Every callee in every branch is currently a frontier — we cannot
   * transcribe the arithmetic without decoding HGHLG::InverseOETF,
   * HGHLG::OOTF, HGColorConformLUTData, HGComputeMatrixColorSpaceMultiply,
   * and the primary-space converters. Throwing here surfaces the exact
   * blocker to the ledger.
   */
  ConvertToDLRGBForDEITP(_source: HGNodePtr): HGNodePtr {
    throw new Error(
      "HGComputeDeltaE::ConvertToDLRGBForDEITP frontier — not yet transcribed " +
        "@0x093c90 (226-line HDR->linear-RGB graph builder; frontier callees " +
        "HGHLG::InverseOETF::C1 @0x093d59, HGHLG::OOTF::C1 @0x093d89, " +
        "HGHLG::OOTF::setPeakDisplayLuminance @0x093dae, plus 6-branch " +
        "jump-table at @0x093cbf with unnamed primary-space converters)",
    );
  }

  /**
   * @Helium 0x0939b0  HGComputeDeltaE::ConvertToLABColorSpaceForDE2000(HGRef<HGNode> const&)
   *
   * 218 lines. Reads colorSpaceEnum at (source+0x19c) and requires
   * (colorSpaceEnum - 1) to be in [0..3) (a `leal -0x1(%rax),%ecx ;
   * cmpl $0x3,%ecx ; jae unsupported` at @0x0939c7). Then:
   *   - new HGToneCurve (0x1e0 bytes)                   @0x0939d7/@0x0939e2
   *   - HGToneCurve::SetAcceleratedState                 @0x093a0d
   *     with a cmov ladder on colorSpaceEnum:
   *       colorSpaceEnum==3 -> state=1
   *       colorSpaceEnum==1 -> state=5
   *       else              -> state=7
   *   - HGToneCurve::SetToneCurveQuality(7)              @0x093a1a
   *   - stage->SetInput(0, source) via vtable *0x78      @0x093a2d
   *   ... then chains a further set of primary-space converters and a
   *   final RGB->LAB stage (all frontier callees).
   */
  ConvertToLABColorSpaceForDE2000(_source: HGNodePtr): HGNodePtr {
    throw new Error(
      "HGComputeDeltaE::ConvertToLABColorSpaceForDE2000 frontier — not yet transcribed " +
        "@0x0939b0 (218-line RGB->LAB graph builder; frontier callees " +
        "HGToneCurve::C1 @0x0939e2, HGToneCurve::SetAcceleratedState @0x093a0d, " +
        "HGToneCurve::SetToneCurveQuality @0x093a1a, plus RGB->XYZ->LAB " +
        "primary-space converter chain not yet decoded)",
    );
  }

  /**
   * @Helium 0x093fc0  HGComputeDeltaE::GetOutput(HGRenderer*)
   *
   * 267 lines. Body sketch:
   *   0x093fd7  movl 0x198(%rdi), %r12d              ; mode = this+0x198
   *   0x093fde  movl $0x1a0, %edi ; callq operator new ; child = new(0x1a0)
   *   0x093feb  testl %r12d, %r12d ; je 0x94015      ; mode == 0 branch
   *   0x093ff0  movq %rbx, %rdi
   *   0x093ff3  callq HgcComputeDeltaEITP::HgcComputeDeltaEITP()
   *   0x093ff8  movq 0x1a8(%r15), %rdi                ; oldChild = this+0x1a8
   *   0x093fff  cmpq %rbx, %rdi                       ; skip release if same
   *   0x094002  je   0x94140                          ; (same-child fast-path)
   *   0x094008  testq %rdi, %rdi ; je 0x94038         ; null oldChild
   *   0x09400d  movq (%rdi), %rax
   *   0x094010  callq *0x18(%rax)                     ; oldChild->Release()
   *   0x094013  jmp 0x94038
   *   0x094015  movq %rbx, %rdi
   *   0x094018  callq HgcComputeDeltaE2000fromLAB::HgcComputeDeltaE2000fromLAB()
   *   0x09401d  movq 0x1a8(%r15), %rdi                ; same release dance
   *   ...
   *   0x094038  movq %rbx, 0x1a8(%r15)                ; this->activeChild = child
   *   0x09403f  movq %r14, %rdi ; movq %r15, %rsi ; xorl %edx, %edx
   *   0x094047  callq HGRenderer::GetInput(this, 0)   ; input0 = fg
   *   ...
   *   0x094064  movq %r14, %rdi ; movq %r15, %rsi ; movl $0x1, %edx
   *   0x09406e (approx) callq HGRenderer::GetInput(this, 1) ; input1 = bg
   *   ... calls one of the ConvertTo* helpers per input per mode ...
   *   ... wires the resulting nodes into `child` via SetInput ...
   *   returns `child`.
   *
   * Two branch families depend on undecoded ITP/DE2000 child-kernel
   * constructors AND on the ConvertTo* helpers, both of which throw
   * above. To be faithful (and to keep the loud gap where it belongs),
   * we throw here rather than partially wire the piece that IS decoded
   * — we need all of GetOutput or none, since the surviving code paths
   * would otherwise silently pretend the frontier work is complete.
   */
  GetOutput(_renderer: HGRendererPtr): HGNodePtr {
    throw new Error(
      "HGComputeDeltaE::GetOutput frontier — not yet transcribed " +
        "@0x093fc0 (267-line dispatch; frontier callees " +
        "HgcComputeDeltaEITP::C1 @0x093ff3, " +
        "HgcComputeDeltaE2000fromLAB::C1 @0x094018, " +
        "HGRenderer::GetInput @0x094047, and the two ConvertTo* graph-builders " +
        "which are themselves frontier)",
    );
  }

  /**
   * @Helium 0x0938e0  HGComputeDeltaE::~HGComputeDeltaE() (D0/D1/D2)
   *
   * Body (D0 shape — D1/D2 share the pre-delete portion):
   *   pushq  %rbp / movq %rsp, %rbp / pushq %rbx / pushq %rax
   *   movq   %rdi, %rbx
   *   leaq   0x977ac8(%rip), %rax           ; restore vtable ptr
   *   movq   %rax, (%rdi)
   *   movq   0x1a8(%rdi), %rdi              ; activeChild = this+0x1a8
   *   testq  %rdi, %rdi ; je +8             ; skip if null
   *   movq   (%rdi), %rax
   *   callq  *0x18(%rax)                    ; activeChild->Release()
   *   movq   %rbx, %rdi
   *   callq  __ZN6HGNodeD2Ev                ; base dtor
   *   [D0-only: jmp __ZN8HGObjectdlEPv]     ; HGObject::operator delete(this)
   *
   * TS has no vtable pointer to restore. Modelled here as an explicit
   * release of `activeChild` followed by super.destruct(). Also
   * references the HGObject_operatorDelete stub in a `void` context so
   * the frontier callee stays reachable from this file's export closure
   * without firing on the non-deleting D1/D2 paths.
   */
  destruct(): void {
    // @Helium 0x0938f3  movq 0x1a8(%rdi), %rdi
    const child = this.activeChild;
    // @Helium 0x0938fa  testq %rdi, %rdi ; je +8
    if (child !== null) {
      // @Helium 0x0938ff  movq (%rdi), %rax
      // @Helium 0x093902  callq *0x18(%rax)   ; child->Release()
      vtable_0x18_Release(child);
    }
    this.activeChild = null;
    // Chain to base — @Helium 0x093908 callq __ZN6HGNodeD2Ev
    super.destruct();
    // D0-only tail @0x093916:  jmp HGObject::operator delete(void*)
    // Left as a throw-stub marker; TS GC subsumes the actual free. Only
    // wired here as a comment marker — calling it here would fire the
    // throw for every non-deleting dtor path too, which would be wrong.
    void HGObject_operatorDelete;
  }
}

// ---------------------------------------------------------------------------
// Unused-import suppressions — every frontier stub is exported into the
// module's TDZ so future callers replacing them with real transcriptions
// have a stable reference target. Silence tsc's noUnusedLocals for the
// ones GetOutput/ConvertTo* would call if they were fully wired.
// ---------------------------------------------------------------------------
void HGObject_operatorNew;
void HGNode_C2;
void HGNode_SetInput;
void vtable_0x10_Retain;
void vtable_0x78_SetInput;
void HGHLG_InverseOETF_C1;
void HGHLG_OOTF_C1;
void HGHLG_OOTF_setPeakDisplayLuminance;
void HGToneCurve_C1;
void HGToneCurve_SetAcceleratedState;
void HGToneCurve_SetToneCurveQuality;
void HgcComputeDeltaEITP_C1;
void HgcComputeDeltaE2000fromLAB_C1;
void HGRenderer_GetInput;
