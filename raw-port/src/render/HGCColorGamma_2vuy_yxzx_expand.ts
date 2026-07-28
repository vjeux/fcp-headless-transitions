// HGCColorGamma_2vuy_yxzx_expand.ts — Helium HGCColorGamma_2vuy_yxzx_expand:
// the HGNode wrapper for the '2vuy YXZX expand' path in the color-gamma
// chain.  "2vuy" is Apple's 4-byte YUV-4:2:2 pixel format (Cb Y0 Cr Y1 →
// low-to-high: y x z x pattern), and "expand" here means "widen the ROI
// on the x-axis so it starts on an even column and ends on an even column"
// — required because the packed 4:2:2 layout groups pairs of luma samples
// under a single chroma pair, so any ROI that crosses a pair boundary
// must be rounded outward to a whole pair.
//
// HGCColorGamma_* is Helium's convention for the render-graph node
// wrapper (capital 'HGC') over a lower-case 'Hgc' base class that owns
// the actual per-tile shader machinery; see the analogous port
// raw-port/src/render/HGCColorGamma_chroma_downsample_f1.ts for the same
// pattern.  All five OWN methods are decoded here:
//   * ~HGCColorGamma_2vuy_yxzx_expand() [D1]: tail-call to base D2.
//   * ~HGCColorGamma_2vuy_yxzx_expand() [D0]: base D2 + operator delete.
//   * GetOutput(HGRenderer*): trivial identity — returns `this`.
//   * GetDOD(HGRenderer*, int, HGRect): delegates to
//     renderer->GetDOD(renderer->GetInput(this, 0)) for output 0, else null.
//   * GetROI(HGRenderer*, int, HGRect): expands the requested rect on the
//     x-axis to be 2-pixel aligned for input 0, else null.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice).
// Disassembly saved in raw-port/re/disasm/Helium.HGCColorGamma_2vuy_yxzx_expand.*.s.
//
// Method addresses (from `nm -arch x86_64 -n Helium`, cross-checked
// against otool -tV):
//   @0x000fce60  HGCColorGamma_2vuy_yxzx_expand::~HGCColorGamma_2vuy_yxzx_expand() [D1]
//                (recovered via awk on otool -tV — the brief.py-supplied
//                 disasm slot was byte-identical to the D0 body when
//                 filtered on the mangled symbol; the D1 body is a
//                 3-instr thunk with the tail-jmp cited below.)
//   @0x000fce70  HGCColorGamma_2vuy_yxzx_expand::~HGCColorGamma_2vuy_yxzx_expand() [D0]
//   @0x000fce90  HGCColorGamma_2vuy_yxzx_expand::GetOutput(HGRenderer*)
//   @0x000fcea0  HGCColorGamma_2vuy_yxzx_expand::GetDOD(HGRenderer*, int, HGRect)
//   @0x000fcee0  HGCColorGamma_2vuy_yxzx_expand::GetROI(HGRenderer*, int, HGRect)
//
// Undecoded frontier (each below is a THROWing stub citing its callee addr):
//   HgcColorGamma_2vuy_yxzx_expand::~HgcColorGamma_2vuy_yxzx_expand()  [base D2]
//     @Helium __ZN30HgcColorGamma_2vuy_yxzx_expandD2Ev
//     Called from D1 tail-jmp @0xfce65 and D0 direct call @0xfce79.
//   HGRenderer::GetInput(HGNode*, int)
//     @Helium __ZN10HGRenderer8GetInputEP6HGNodei
//     Called from GetDOD @0xfcec7.
//   HGRenderer::GetDOD(HGNode*)
//     @Helium __ZN10HGRenderer6GetDODEP6HGNode
//     Tail-called from GetDOD @0xfced8.
//   HGObject::operator delete(void*)
//     @Helium __ZN8HGObjectdlEPv
//     Tail-called from D0 @0xfce87.
//
// Numerics: pure pointer / int32 bookkeeping — no floats anywhere in these
// five methods.  All int32 ops are treated as signed i32 (testl/cmpl).
// The 16-byte HGRect is passed by value in the (%rcx, %r8) register pair
// on SysV x86_64 — see the GetROI transcription for the exact register
// staging.  This is the same calling convention documented on the
// HGCColorGamma_bias port (@0xfd550).

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — an opaque render-graph node handle.  Not yet decoded here. */
export interface HGNode {}

/** HGRenderer — the render context / dependency-tracker passed to every
 *  vfn on a render node.  Layout undecoded. */
export interface HGRenderer {}

/** _HGRectNull — the global sentinel HGRect (Helium __DATA_CONST @0x3d2284 =
 *  {0,0,0,0}).  GetDOD's `edx != 0` branch @0xfcea4 loads it via a
 *  rip-relative leaq; GetROI's `edx != 0` branch @0xfcee8 loads it the
 *  same way.  Delegates to the canonical Helium constant exported by
 *  HGRect.ts. */
const HGRectNull: HGRect = HGRectNullConst;

/** HgcColorGamma_2vuy_yxzx_expand::~HgcColorGamma_2vuy_yxzx_expand() —
 *  base-class destructor.  Called from the D1 thunk @0xfce65 (jmp) and
 *  the D0 body @0xfce79 (callq).  The base compute-kernel class is not
 *  yet transcribed.  Throwing stub cites the mangled name
 *  __ZN30HgcColorGamma_2vuy_yxzx_expandD2Ev. */
function HgcColorGamma_2vuy_yxzx_expand_dtor(_self: HGCColorGamma_2vuy_yxzx_expand): void {
  throw new Error(
    "HgcColorGamma_2vuy_yxzx_expand::~HgcColorGamma_2vuy_yxzx_expand @Helium __ZN30HgcColorGamma_2vuy_yxzx_expandD2Ev @0xfce65/@0xfce79 not yet transcribed",
  );
}

/** HGObject::operator delete(void*) — Helium's global operator-delete for
 *  HGObject descendants.  Tail-called from D0 @0xfce87 (jmp).  Not decoded. */
function HGObject_operatorDelete(_p: HGCColorGamma_2vuy_yxzx_expand): void {
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xfce87 not yet transcribed",
  );
}

/** HGRenderer::GetInput(HGNode*, int) — called from GetDOD @0xfcec7 with
 *  edx=0 (i.e. "give me input slot 0 of `this`").  Not yet transcribed. */
function HGRenderer_GetInput(
  _r: HGRenderer,
  _self: HGCColorGamma_2vuy_yxzx_expand,
  _slot: number,
): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0xfcec7 not yet transcribed",
  );
}

/** HGRenderer::GetDOD(HGNode*) — tail-called from GetDOD @0xfced8 with the
 *  child node returned by GetInput.  Not yet transcribed. */
function HGRenderer_GetDOD(_r: HGRenderer, _node: HGNode | null): HGRect {
  throw new Error(
    "HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode @0xfced8 not yet transcribed",
  );
}

/**
 * HGCColorGamma_2vuy_yxzx_expand — the Helium render-graph node class for
 * the 2vuy YXZX (Y0 Cb Y1 Cr) chroma-4:2:2 color-gamma "expand" path.
 * Derives from HgcColorGamma_2vuy_yxzx_expand (base, undecoded).  No own
 * instance state is visible in the five transcribed methods — they only
 * touch `this` as an opaque pointer for the base-dtor / GetInput calls,
 * and the ROI-expand math operates purely on the caller-supplied HGRect.
 */
export class HGCColorGamma_2vuy_yxzx_expand {
  /**
   * HGCColorGamma_2vuy_yxzx_expand::~HGCColorGamma_2vuy_yxzx_expand()
   *   (D1, complete-object dtor) @0xfce60.  Tail-call to the base
   *   HgcColorGamma_2vuy_yxzx_expand destructor.
   *
   *   @0xfce60 pushq %rbp
   *   @0xfce61 movq  %rsp, %rbp
   *   @0xfce64 popq  %rbp
   *   @0xfce65 jmp   __ZN30HgcColorGamma_2vuy_yxzx_expandD2Ev
   */
  destroy(): void {
    // @0xfce65 jmp HgcColorGamma_2vuy_yxzx_expand::~HgcColorGamma_2vuy_yxzx_expand
    HgcColorGamma_2vuy_yxzx_expand_dtor(this);
  }

  /**
   * HGCColorGamma_2vuy_yxzx_expand::~HGCColorGamma_2vuy_yxzx_expand()
   *   (D0, deleting dtor) @0xfce70.  Saves `this` in %rbx, runs base D2,
   *   then tail-calls HGObject::operator delete on `this`.
   *
   *   @0xfce70 pushq %rbp
   *   @0xfce71 movq  %rsp, %rbp
   *   @0xfce74 pushq %rbx
   *   @0xfce75 pushq %rax                 ; align stack
   *   @0xfce76 movq  %rdi, %rbx           ; rbx = this
   *   @0xfce79 callq __ZN30HgcColorGamma_2vuy_yxzx_expandD2Ev
   *   @0xfce7e movq  %rbx, %rdi           ; rdi = this
   *   @0xfce81 addq  $0x8, %rsp
   *   @0xfce85 popq  %rbx
   *   @0xfce86 popq  %rbp
   *   @0xfce87 jmp   __ZN8HGObjectdlEPv
   */
  destroyAndDelete(): void {
    // @0xfce79 callq HgcColorGamma_2vuy_yxzx_expand::~HgcColorGamma_2vuy_yxzx_expand
    HgcColorGamma_2vuy_yxzx_expand_dtor(this);
    // @0xfce87 jmp HGObject::operator delete
    HGObject_operatorDelete(this);
  }

  /**
   * HGCColorGamma_2vuy_yxzx_expand::GetOutput(HGRenderer*) @0xfce90.
   *
   *   @0xfce90 pushq %rbp
   *   @0xfce91 movq  %rsp, %rbp
   *   @0xfce94 movq  %rdi, %rax       ; return `this`
   *   @0xfce97 popq  %rbp
   *   @0xfce98 retq
   *
   * Semantics: the node IS its own output.  Trivial identity — no
   * HGRendererOutput wrapper is allocated at this layer.
   */
  GetOutput(_renderer: HGRenderer): HGCColorGamma_2vuy_yxzx_expand {
    // @0xfce94 movq %rdi, %rax — return `this` unchanged.
    return this;
  }

  /**
   * HGCColorGamma_2vuy_yxzx_expand::GetDOD(HGRenderer*, int, HGRect)
   *   @0xfcea0.
   *
   * ABI mapping (SysV x86_64):
   *   %rdi = this                (HGCColorGamma_2vuy_yxzx_expand*)
   *   %rsi = renderer            (HGRenderer*)
   *   %edx = outputIdx           (int)
   *   The requested HGRect is passed by value but NEVER read here.
   *
   * Faithful transcription:
   *
   *   @0xfcea0 testl %edx, %edx
   *   @0xfcea2 je    0xfceb3               ; outputIdx == 0 → delegate path
   *   @0xfcea4 leaq  _HGRectNull(%rip), %rcx
   *   @0xfceab movq  (%rcx), %rax           ; low  8B of null
   *   @0xfceae movq  0x8(%rcx), %rdx        ; high 8B of null
   *   @0xfceb2 retq                          ; return HGRectNull
   *
   *   ; outputIdx == 0 path:
   *   @0xfceb3 pushq %rbp
   *   @0xfceb4 movq  %rsp, %rbp
   *   @0xfceb7 pushq %rbx
   *   @0xfceb8 pushq %rax                    ; align stack
   *   @0xfceb9 movq  %rdi, %rax              ; rax  = this
   *   @0xfcebc movq  %rsi, %rdi              ; rdi  = renderer (arg1 GetInput)
   *   @0xfcebf movq  %rsi, %rbx              ; rbx  = renderer (saved for GetDOD)
   *   @0xfcec2 movq  %rax, %rsi              ; rsi  = this     (arg2 GetInput)
   *   @0xfcec5 xorl  %edx, %edx              ; edx  = 0        (arg3 slot 0)
   *   @0xfcec7 callq HGRenderer::GetInput(HGNode*, int)
   *   @0xfcecc movq  %rbx, %rdi              ; rdi = renderer  (arg1 GetDOD)
   *   @0xfcecf movq  %rax, %rsi              ; rsi = returned HGNode*
   *   @0xfced2 addq  $0x8, %rsp
   *   @0xfced6 popq  %rbx
   *   @0xfced7 popq  %rbp
   *   @0xfced8 jmp   HGRenderer::GetDOD(HGNode*)
   *
   * Semantics: for output 0, delegate the DOD entirely to
   *   renderer->GetDOD(renderer->GetInput(this, 0))
   * i.e. this node's DOD is the DOD of its input slot 0 (a straight
   * pass-through — the "expand" happens on the ROI side, not the DOD).
   * Any other outputIdx → HGRectNull.
   */
  GetDOD(renderer: HGRenderer, outputIdx: number, _requested: HGRect): HGRect {
    // @0xfcea0 testl %edx,%edx ; @0xfcea2 je → the `== 0` branch takes the
    // delegate path; anything else short-circuits to HGRectNull.
    const edx: number = outputIdx | 0;
    if (edx !== 0) {
      // @0xfcea4 load _HGRectNull ; @0xfceb2 retq
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xfcec7 GetInput(renderer, this, 0)  → HGNode*
    const inputNode: HGNode | null = HGRenderer_GetInput(renderer, this, 0);
    // @0xfced8 jmp GetDOD(renderer, inputNode) — tail-call.
    return HGRenderer_GetDOD(renderer, inputNode);
  }

  /**
   * HGCColorGamma_2vuy_yxzx_expand::GetROI(HGRenderer*, int, HGRect)
   *   @0xfcee0.
   *
   * ABI mapping (SysV x86_64):
   *   %rdi = this            (HGCColorGamma_2vuy_yxzx_expand*)
   *   %rsi = renderer        (HGRenderer*) — UNREAD
   *   %edx = inputIdx        (int)
   *   %rcx = requested low   (packed: y<<32 | x  ; 4-byte-int corner form)
   *   %r8  = requested high  (packed: bottom<<32 | right)
   * Return: HGRect in (%rax:%rdx).
   *
   * Faithful transcription:
   *
   *   @0xfcee0 testl %edx, %edx
   *   @0xfcee2 je    0xfcef8               ; inputIdx == 0 → expand path
   *   @0xfcee4 pushq %rbp                    ; the != 0 (null) path
   *   @0xfcee5 movq  %rsp, %rbp
   *   @0xfcee8 leaq  _HGRectNull(%rip), %rcx
   *   @0xfceef movq  (%rcx), %rax            ; rax = low  8B of null
   *   @0xfcef2 movq  0x8(%rcx), %rdx         ; rdx = high 8B of null
   *   @0xfcef6 popq  %rbp
   *   @0xfcef7 retq
   *
   *   ; inputIdx == 0 path (the "expand" ROI transform):
   *   @0xfcef8 movq  %rcx, %rax              ; rax  = requested-low (y<<32|x)
   *   @0xfcefb movl  %r8d, %edx              ; edx  = right (low 32 of %r8)
   *   @0xfcefe andl  $0x1, %edx              ; edx  = right & 1
   *   @0xfcf01 addl  %r8d, %edx              ; edx  = right + (right & 1)
   *                                            = round `right` UP to even
   *   @0xfcf04 movabsq $-0x100000000, %rcx   ; rcx  = 0xFFFFFFFF00000000
   *   @0xfcf0e andq  %r8, %rcx               ; rcx  = bottom << 32 (top32 kept)
   *   @0xfcf11 andq  $-0x2, %rax             ; rax &= ~1 — clears low bit of x
   *                                            (rounds x DOWN to even; y's low
   *                                            bit is in bit 32, untouched by
   *                                            the &-2 mask).
   *   @0xfcf15 orq   %rcx, %rdx              ; rdx  = (bottom<<32) | right_even_up
   *   @0xfcf18 retq                           ; return {x_even_dn, y, right_even_up, bottom}
   *
   * Semantics: for inputIdx == 0 the requested ROI is expanded on the
   * x-axis to be 2-pixel aligned:
   *   x'      = x     & ~1          (round DOWN to even)
   *   right'  = right + (right & 1) (round UP to even, i.e. next even
   *                                   ≥ right, which for even `right`
   *                                   is a no-op and for odd `right`
   *                                   is `right + 1`)
   *   y       unchanged
   *   bottom  unchanged
   * This matches the 2vuy Y0/Y1 pair boundary — pixel columns are grouped
   * in pairs, so any ROI that starts on or ends on an odd column must
   * be widened outward to touch a full pair.  Any other inputIdx → null.
   */
  GetROI(_renderer: HGRenderer, inputIdx: number, requested: HGRect): HGRect {
    // @0xfcee0 testl %edx,%edx ; @0xfcee2 je 0xfcef8 — inputIdx == 0 is
    // the expand path; anything else returns HGRectNull.
    const edx: number = inputIdx | 0;
    if (edx !== 0) {
      // @0xfcee8 load _HGRectNull ; @0xfcef7 retq
      return {
        x: HGRectNull.x | 0,
        y: HGRectNull.y | 0,
        right: HGRectNull.right | 0,
        bottom: HGRectNull.bottom | 0,
      };
    }
    // @0xfcef8-@0xfcf18 — the "expand" math.  We name the fields directly
    // rather than reproduce the two-qword register staging; the algebra
    // is preserved bit-for-bit for int32 operands.
    // @0xfcf11 andq $-0x2, %rax — clears low bit of x (bit 0 of rax).
    const xEvenDown: number = (requested.x | 0) & ~1;
    // @0xfcefb-@0xfcf01 — `right + (right & 1)`.  For any int32 this is
    // the smallest even integer >= right:
    //   even right → right (unchanged);  odd right → right + 1.
    // We match the asm operand widths: `andl` and `addl` are 32-bit, so
    // the intermediate `(right & 1)` is a 0/1 int32 and the sum stays in
    // int32.  For right = 0x7FFFFFFF the asm would produce 0x80000000
    // (INT_MIN when re-interpreted as signed) — we faithfully reproduce
    // that with `((right | 0) + ((right | 0) & 1)) | 0`.
    const rightRaw: number = requested.right | 0;
    const rightEvenUp: number = (rightRaw + (rightRaw & 1)) | 0;
    // @0xfcf04-@0xfcf15 — the AND-with-high-mask keeps `bottom` untouched.
    // y (bits 32..63 of rax) is unaffected by the `andq $-0x2, %rax`
    // because the mask 0xFFFFFFFFFFFFFFFE has bits 1..63 all set.  So y
    // and bottom flow straight through the register staging.
    return {
      x: xEvenDown | 0,
      y: requested.y | 0,
      right: rightEvenUp,
      bottom: requested.bottom | 0,
    };
  }
}
