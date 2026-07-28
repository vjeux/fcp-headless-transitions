// HGCColorGamma_bias.ts — Helium HGCColorGamma_bias: the shim/wrapper render
// node for the "color gamma with bias" per-pixel op. This is a shallow adapter
// layer over the base HgcColorGamma_bias (lower-case 'c' — note the naming
// convention: HGC* is the render-graph node class, Hgc* is the base compute
// kernel wrapper). At this layer only three vfns are decoded:
//   * GetDOD: delegates to the sole input's DOD via HGRenderer::GetInput /
//             HGRenderer::GetDOD, but ONLY for output index 0; any other
//             index returns HGRectNull.
//   * GetROI: passes the caller's requested rect through for input index 0;
//             any other index returns HGRectNull.
//   * D1/D0 dtors: tail-call the base HgcColorGamma_bias::~HgcColorGamma_bias
//                  (+ HGObject::operator delete on the deleting path).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice).
// Disassembly saved in raw-port/re/disasm/Helium.HGCColorGamma_bias.*.s.
//
// Method addresses (otool -tV):
//   @0x000000000000fd4e0  HGCColorGamma_bias::~HGCColorGamma_bias() [D1]
//   @0x000000000000fd4f0  HGCColorGamma_bias::~HGCColorGamma_bias() [D0]
//   @0x000000000000fd510  HGCColorGamma_bias::GetDOD(HGRenderer*, int, HGRect)
//   @0x000000000000fd550  HGCColorGamma_bias::GetROI(HGRenderer*, int, HGRect)
//
// Undecoded frontier (each below is a THROWing stub citing its callee addr):
//   HgcColorGamma_bias::~HgcColorGamma_bias() [base D2] @Helium (called from D1/D0)
//   HGRenderer::GetInput(HGNode*, int)                  @Helium (called from GetDOD)
//   HGRenderer::GetDOD(HGNode*)                         @Helium (tail from GetDOD)
//   HGObject::operator delete(void*)                    @Helium (tail from D0)
//
// Numerics: pure pointer/int32 bookkeeping — no floats anywhere in these
// four methods. `int` (edx) selector is treated as signed i32 (testl/cmpl).

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — an opaque render-graph node handle. Not yet decoded here. */
export interface HGNode {}

/** HGRenderer — the render context / dependency-tracker passed to every
 *  vfn on a render node. Layout undecoded. */
export interface HGRenderer {}

/** _HGRectNull — the global sentinel HGRect (Helium __DATA_CONST @0x3d2284 =
 *  {0,0,0,0}). Both GetDOD (edx!=0 branch @0xfd514) and GetROI (edx!=0
 *  branch @0xfd55b) load it via a rip-relative leaq. Delegates to the
 *  canonical Helium constant exported by HGRect.ts. */
const HGRectNull: HGRect = HGRectNullConst;

/** HgcColorGamma_bias::~HgcColorGamma_bias() — base-class destructor. Called
 *  from the D1 thunk @0xfd4e5 (jmp) and the D0 body @0xfd4f9 (callq). The
 *  base compute-kernel class is not yet transcribed. Throwing stub cites
 *  the mangled name __ZN18HgcColorGamma_biasD2Ev. */
function HgcColorGamma_bias_dtor(_self: HGCColorGamma_bias): void {
  throw new Error(
    "HgcColorGamma_bias::~HgcColorGamma_bias @Helium __ZN18HgcColorGamma_biasD2Ev @0xfd4e5/@0xfd4f9 not yet transcribed",
  );
}

/** HGObject::operator delete(void*) — Helium's global operator-delete for
 *  HGObject descendants. Tail-called from D0 @0xfd507 (jmp). Not decoded. */
function HGObject_operatorDelete(_p: HGCColorGamma_bias): void {
  throw new Error("HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xfd507 not yet transcribed");
}

/** HGRenderer::GetInput(HGNode*, int) — called from GetDOD @0xfd537 with
 *  edx=0 (i.e. "give me input slot 0 of `this`"). Not yet transcribed. */
function HGRenderer_GetInput(_r: HGRenderer, _self: HGCColorGamma_bias, _slot: number): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0xfd537 not yet transcribed",
  );
}

/** HGRenderer::GetDOD(HGNode*) — tail-called from GetDOD @0xfd548 with the
 *  child node returned by GetInput. Not yet transcribed. */
function HGRenderer_GetDOD(_r: HGRenderer, _node: HGNode | null): HGRect {
  throw new Error(
    "HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode @0xfd548 not yet transcribed",
  );
}

/** HGCColorGamma_bias — the Helium render-graph node class for the
 *  "color gamma + bias" per-pixel operation. Derives from
 *  HgcColorGamma_bias (base, undecoded). No own instance state is visible
 *  in the four transcribed methods — they only touch `this` as an opaque
 *  pointer for the base-dtor / GetInput calls. */
export class HGCColorGamma_bias {
  /**
   * HGCColorGamma_bias::~HGCColorGamma_bias() (D1, complete-object dtor)
   * @0xfd4e0. Tail-call to the base HgcColorGamma_bias destructor.
   *
   *   @0xfd4e0 pushq %rbp
   *   @0xfd4e1 movq  %rsp, %rbp
   *   @0xfd4e4 popq  %rbp
   *   @0xfd4e5 jmp   __ZN18HgcColorGamma_biasD2Ev
   */
  destroy(): void {
    // @0xfd4e5 jmp HgcColorGamma_bias::~HgcColorGamma_bias
    HgcColorGamma_bias_dtor(this);
  }

  /**
   * HGCColorGamma_bias::~HGCColorGamma_bias() (D0, deleting dtor)
   * @0xfd4f0. Saves `this` in %rbx, runs base D2, then tail-calls
   * HGObject::operator delete on `this`.
   *
   *   @0xfd4f0 pushq %rbp
   *   @0xfd4f1 movq  %rsp, %rbp
   *   @0xfd4f4 pushq %rbx
   *   @0xfd4f5 pushq %rax                 ; align stack
   *   @0xfd4f6 movq  %rdi, %rbx           ; rbx = this
   *   @0xfd4f9 callq __ZN18HgcColorGamma_biasD2Ev
   *   @0xfd4fe movq  %rbx, %rdi           ; rdi = this
   *   @0xfd501 addq  $0x8, %rsp
   *   @0xfd505 popq  %rbx
   *   @0xfd506 popq  %rbp
   *   @0xfd507 jmp   __ZN8HGObjectdlEPv
   */
  destroyAndDelete(): void {
    // @0xfd4f9 callq HgcColorGamma_bias::~HgcColorGamma_bias
    HgcColorGamma_bias_dtor(this);
    // @0xfd507 jmp HGObject::operator delete
    HGObject_operatorDelete(this);
  }

  /**
   * HGCColorGamma_bias::GetDOD(HGRenderer*, int, HGRect) @0xfd510.
   *
   * ABI mapping (SysV x86_64):
   *   %rdi = this          (HGCColorGamma_bias*)
   *   %rsi = renderer      (HGRenderer*)
   *   %edx = outputIdx     (int)
   *   %rdx:%rcx unused for the actual HGRect (passed by value on stack in
   *     the used-to-be `HGRect` argument slot, but this method NEVER reads
   *     the requested rect).
   *
   * Faithful transcription:
   *
   *   @0xfd510 testl %edx, %edx
   *   @0xfd512 je    0xfd523             ; outputIdx == 0 → the delegate path
   *   @0xfd514 leaq  _HGRectNull(%rip), %rcx
   *   @0xfd51b movq  (%rcx), %rax        ; low  8B of null
   *   @0xfd51e movq  0x8(%rcx), %rdx     ; high 8B of null
   *   @0xfd522 retq                      ; return HGRectNull
   *
   *   ; outputIdx == 0 path:
   *   @0xfd523 pushq %rbp
   *   @0xfd524 movq  %rsp, %rbp
   *   @0xfd527 pushq %rbx
   *   @0xfd528 pushq %rax                ; align stack
   *   @0xfd529 movq  %rdi, %rax          ; rax  = this
   *   @0xfd52c movq  %rsi, %rdi          ; rdi  = renderer   (arg1 to GetInput)
   *   @0xfd52f movq  %rsi, %rbx          ; rbx  = renderer   (saved for GetDOD)
   *   @0xfd532 movq  %rax, %rsi          ; rsi  = this       (arg2 to GetInput)
   *   @0xfd535 xorl  %edx, %edx          ; edx  = 0          (arg3 = slot 0)
   *   @0xfd537 callq HGRenderer::GetInput(HGNode*, int)
   *   @0xfd53c movq  %rbx, %rdi          ; rdi = renderer    (arg1 to GetDOD)
   *   @0xfd53f movq  %rax, %rsi          ; rsi = returned HGNode*
   *   @0xfd542 addq  $0x8, %rsp
   *   @0xfd546 popq  %rbx
   *   @0xfd547 popq  %rbp
   *   @0xfd548 jmp   HGRenderer::GetDOD(HGNode*)
   *
   * Semantics: for output 0, delegate the DOD entirely to
   *   renderer->GetDOD(renderer->GetInput(this, 0))
   * i.e. this node's DOD is the DOD of its input slot 0 (a straight
   * pass-through — makes sense for a per-pixel color-op that never grows
   * the pixel domain). Any other outputIdx → HGRectNull.
   */
  GetDOD(renderer: HGRenderer, outputIdx: number, _requested: HGRect): HGRect {
    // @0xfd510 testl %edx,%edx ; @0xfd512 je → the `== 0` branch takes the
    // delegate path; anything else short-circuits to HGRectNull.
    const edx = outputIdx | 0;
    if (edx !== 0) {
      // @0xfd514  load _HGRectNull ; @0xfd522 retq
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xfd537 GetInput(renderer, this, 0)  → HGNode*
    const inputNode = HGRenderer_GetInput(renderer, this, 0);
    // @0xfd548 jmp GetDOD(renderer, inputNode) — tail-call.
    return HGRenderer_GetDOD(renderer, inputNode);
  }

  /**
   * HGCColorGamma_bias::GetROI(HGRenderer*, int, HGRect) @0xfd550.
   *
   * ABI mapping:
   *   %rdi = this           (HGCColorGamma_bias*)
   *   %rsi = renderer       (HGRenderer*) — UNREAD
   *   %edx = inputIdx       (int)
   *   %rdx:%rcx = requested (HGRect by value, passed as two 8-byte halves)
   * Return: HGRect in (%rax:%rdx).
   *
   * Faithful transcription:
   *
   *   @0xfd550 movq  %rcx, %rax          ; rax = high half of requested? NO —
   *                                        SysV passes 16B struct by value in
   *                                        (%rdx, %rcx). @0xfd550 loads %rax
   *                                        from %rcx, which by the fall-through
   *                                        return at @0xfd56d ("movq %r8, %rdx;
   *                                        retq") is the low half staged for
   *                                        return in rax; %r8 holds the high
   *                                        half. See HMaskSimpleStrokeSubtract
   *                                        GetROI @Ozone 0x425c70 for the
   *                                        identical calling convention.
   *   @0xfd553 testl %edx, %edx
   *   @0xfd555 je    0xfd56a             ; inputIdx == 0 → pass-through
   *   @0xfd557 pushq %rbp                ; the != 0 (null) path
   *   @0xfd558 movq  %rsp, %rbp
   *   @0xfd55b leaq  _HGRectNull(%rip), %rcx
   *   @0xfd562 movq  (%rcx), %rax        ; rax = low  8B of null
   *   @0xfd565 movq  0x8(%rcx), %r8      ; r8  = high 8B of null
   *   @0xfd569 popq  %rbp
   *   @0xfd56a movq  %r8, %rdx           ; join: rdx = high half of return
   *   @0xfd56d retq
   *
   * Semantics: for inputIdx == 0 the caller's requested rect is returned
   * unchanged (a pure per-pixel op has ROI == requested). Any other input
   * index → HGRectNull (the class has only one input, slot 0). This differs
   * from HMaskSimpleStrokeSubtract::GetROI which accepts slots 0 AND 1.
   */
  GetROI(_renderer: HGRenderer, inputIdx: number, requested: HGRect): HGRect {
    // @0xfd553 testl %edx,%edx ; @0xfd555 je 0xfd56a — inputIdx == 0 is the
    // pass-through; anything else returns HGRectNull.
    const edx = inputIdx | 0;
    if (edx !== 0) {
      // @0xfd55b  load _HGRectNull ; @0xfd56d retq
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xfd550 rax = rcx (low half) ; @0xfd56a rdx = r8 (high half): the
    // 16B `requested` struct flows straight through to the return regs.
    return {
      x: requested.x | 0,
      y: requested.y | 0,
      right: requested.right | 0,
      bottom: requested.bottom | 0,
    };
  }
}
