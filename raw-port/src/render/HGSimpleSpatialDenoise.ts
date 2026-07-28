// raw-port/src/render/HGSimpleSpatialDenoise.ts
//
// FCP `HGSimpleSpatialDenoise` — Helium spatial-denoise render node.
// Extends already-landed HGNode base (raw-port/src/render/HGNode.ts).
//
// Symbols transcribed (Helium.framework, x86_64 slice — from /tmp/Helium_symmap.tsv):
//   0x1c8240   HGSimpleSpatialDenoise::HGSimpleSpatialDenoise()         [C1/C2 — ICF identical]
//   0x1c8310   HGSimpleSpatialDenoise::~HGSimpleSpatialDenoise()        [D0 deleting dtor]
//   0x1c8360   HGSimpleSpatialDenoise::SetParameter(int, float, float, float, float) -> int
//   0x1c83d0   HGSimpleSpatialDenoise::SetFilterParams(HGNode*)
//   0x1c8460   HGSimpleSpatialDenoise::GetOutput(HGRenderer*)           [BIG — 165 lines, throw-stub]
//
// Class layout (recovered from the ctor body @0x1c8240):
//   this + 0x000  vptr                                              (base HGNode)
//   this + 0x198  int32  paramMode        (SetParameter idx=0; clamped to [0,2])
//   this + 0x19c  int32  paramIterations  (SetParameter idx=1; clamped to [1,∞) unsigned)
//   this + 0x1a0  u8     paramFlag        (SetParameter idx=2; bool != 0)
//   this + 0x1a8  ptr    childNode        (owned HGNode* — released via vtable *0x18 in dtor)
//
// Ctor initial values (@0x1c8258..0x1c8274):
//   paramMode       = 0     (low 32 bits of 0x198)
//   paramIterations = 1     (high 32 bits of 0x198 — stored via movabsq $0x100000000)
//   paramFlag       = true  (byte at 0x1a0 = 0x01)
//   childNode       = NULL
//
// SetParameter idx dispatch (@0x1c8364..):
//   idx == 0 : paramMode       = clamp(cvttss2si(value), 0, 2)
//   idx == 1 : paramIterations = max(1, cvttss2si(value)) unsigned-compare
//   idx == 2 : paramFlag       = (value != 0.0)  [+ NaN treated as true via `setp | setne`]
//   else     : return -1  (0xffffffff)
//   returns 1 on success.
//
// SetFilterParams (@0x1c83d0..):
//   Dispatches on paramMode (this + 0x198) into three parameter presets, all forwarded to
//   HGNode::SetParameter(child, idx=0, xmm0, xmm1, xmm2, 0.0) via vtable *0x60 (HGNode's
//   SetParameter — see raw-port/src/render/HGNode.ts). Then dispatches on paramFlag and
//   forwards a second SetParameter call with idx=1, xmm0 = (paramFlag ? 1.0 : 0.0).
//   The five float constants used are RIP-relative loads decoded below:
//     @Helium 0x3c7cc0 = 1.0                                  (movss @0x1c8446)
//     @Helium 0x3c7cc8 = 0.5                                  (movss @0x1c8422)
//     @Helium 0x3ca2f4 = 0.0625                               (movss @0x1c83ef)
//     @Helium 0x3ca9d4 = 0.125                                (movss @0x1c83fb & @0x1c8415)
//     @Helium 0x3cb6c4 = 0.25                                 (movss @0x1c8403)
//
// The paramMode -> (xmm0,xmm1,xmm2) preset table (recovered from the three branches):
//     paramMode == 0 (default) : xmm0=0.0625,      xmm1=0.125,   xmm2=0.25
//     paramMode == 1           : xmm0=0.125,       xmm1=0.125,   xmm2=0.0   (xorps xmm2,xmm2)
//     paramMode == 2 (else)    : xmm0=0.0625,      xmm1=0.0625,  xmm2=0.5   (via movaps xmm0,xmm1
//                                                                            fallthrough @0x1c8432)
//   The `else` branch actually re-computes xmm0=0.0625 from the fall-through
//   at @0x1c841d..0x1c8422 with an xorps xmm2 + movss 0x5f (const @0x3c7cc7 = 0.5) into xmm2,
//   then falls into the join point @0x1c842a which does `movaps xmm0,xmm1`. So the effective
//   values at the shared call site are xmm0=0.0625 (from the initial default arm's %xmm0 —
//   wait: the else path enters via a different xmm0 setup). See body comment below for the
//   exact register dataflow — the reconstruction is verbatim from the disasm, not paraphrased.
//
// GetOutput @0x1c8460 (165 lines, 23 callqs) requires HGRenderer::GetInput/GetDOD,
// HGDenoisePDE (a sibling render node), and HGNode::SetInput frontier that's not yet
// fully decoded on this branch. Rule-3 loud gap; disasm on disk.

import { HGNode } from "./HGNode.js";

// -----------------------------------------------------------------------------
// Undecoded frontier — throwing stubs citing exact call sites.
// -----------------------------------------------------------------------------

/**
 * `HGObject::operator delete(void*)` — tail-jumped from D0 @0x1c8346. Not yet transcribed.
 */
function HGObject_operatorDelete(_thisPtr: HGSimpleSpatialDenoise): void {
  throw new Error(
    "raw-port: HGObject::operator delete(void*) tail-jmp from ~HGSimpleSpatialDenoise D0 @0x1c8346 not yet transcribed"
  );
}

/**
 * Virtual dispatch on the owned `childNode->vtable[0x18]` at D0 @0x1c8332 — this is the
 * standard HGObject::Release() slot (HGNode.ts documents vtable *0x18 = HGObject::Release).
 * If a Release semantics is later required, wire it here; the child pointer is nulled in
 * the raw asm via the polymorphic release.
 */
function childNode_release_slot0x18(_child: unknown): void {
  throw new Error(
    "raw-port: child node vtable[+0x18] Release (called from ~HGSimpleSpatialDenoise D0 @0x1c8332) not yet transcribed"
  );
}

/**
 * `HGNode::SetParameter(int, float, float, float, float)` on a CHILD HGNode* — resolved as
 * child->vtable[0x60] (see raw-port/src/render/HGNode.ts vtable table: *0x60 =
 * HGNode::SetParameter). Called from SetFilterParams @0x1c8435 and @0x1c8468 (tail-jmp).
 *
 * The receiver is a foreign HGNode*, so we cannot invoke this against the port's HGNode
 * base type in TS without exposing a virtual dispatch. The signature is captured here for
 * when the concrete child-node class lands and can be typed.
 */
function child_SetParameter_slot0x60(
  _child: unknown,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number
): void {
  throw new Error(
    "raw-port: child HGNode->vtable[+0x60] (HGNode::SetParameter) — called from " +
      "HGSimpleSpatialDenoise::SetFilterParams @0x1c8435 and @0x1c8468. The concrete child " +
      "class is not yet decoded in this port branch."
  );
}

// -----------------------------------------------------------------------------
// Constants ported from RIP-relative loads (each cites its data addr).
// -----------------------------------------------------------------------------

/** @Helium 0x3c7cc0 = 1.0f  (movss @0x1c8446 → paramFlag=true xmm3 value). */
const K_ONE_F32_AT_0x3c7cc0 = Math.fround(1.0);
/** @Helium 0x3c7cc8 = 0.5f  (movss @0x1c8422 → else-branch xmm2 preset). */
const K_HALF_F32_AT_0x3c7cc8 = Math.fround(0.5);
/** @Helium 0x3ca2f4 = 0.0625f  (movss @0x1c83ef → default-branch xmm0 preset). */
const K_ONE_SIXTEENTH_F32_AT_0x3ca2f4 = Math.fround(0.0625);
/** @Helium 0x3ca9d4 = 0.125f  (movss @0x1c83fb → default-branch xmm1; and @0x1c8415 → mode==1 xmm0). */
const K_ONE_EIGHTH_F32_AT_0x3ca9d4 = Math.fround(0.125);
/** @Helium 0x3cb6c4 = 0.25f  (movss @0x1c8403 → default-branch xmm2). */
const K_ONE_QUARTER_F32_AT_0x3cb6c4 = Math.fround(0.25);

// -----------------------------------------------------------------------------
// Class
// -----------------------------------------------------------------------------

/**
 * HGSimpleSpatialDenoise — a small render-graph node that wraps a spatial-denoise filter
 * (an HGDenoisePDE-ish child). Its state is three int/bool parameters plus one owned child
 * pointer. All heavy lifting is delegated to `GetOutput` (currently a Rule-3 throw-stub).
 */
export class HGSimpleSpatialDenoise extends HGNode {
  /** @0x198 int32 — paramMode: clamped to [0, 2] by SetParameter(idx=0). */
  paramMode = 0;
  /** @0x19c int32 — paramIterations: unsigned-clamped to >= 1 by SetParameter(idx=1). */
  paramIterations = 1;
  /** @0x1a0 u8   — paramFlag: bool set by SetParameter(idx=2) (value != 0 OR NaN). */
  paramFlag = true;
  /** @0x1a8 ptr  — childNode: an owned HGNode* released via vtable[+0x18] in ~dtor. */
  childNode: unknown = null;

  /**
   * HGSimpleSpatialDenoise::HGSimpleSpatialDenoise()  @0x1c8240
   *
   * Body (verbatim @0x1c8240..0x1c8281):
   *   push/mov/sub prologue
   *   mov  %rdi,%rbx                                        ; this
   *   call __ZN6HGNodeC2Ev                                  ; base HGNode ctor
   *   leaq 0x8610eb(%rip),%rax    ; @0x1c824e — vtable ptr install (VM 0x1a2934e area)
   *   mov  %rax,(%rbx)                                      ; this->vptr = &vtable
   *   movq $0x0, 0x1a8(%rbx)                                ; childNode = NULL
   *   movabsq $0x100000000, %rax                            ; pack (0, 1) as (i32,i32)
   *   mov  %rax, 0x198(%rbx)                                ; paramMode=0, paramIterations=1
   *   movb $0x1, 0x1a0(%rbx)                                ; paramFlag = true
   *   epilogue
   */
  constructor() {
    super();
    this.paramMode = 0;
    this.paramIterations = 1;
    this.paramFlag = true;
    this.childNode = null;
  }

  /**
   * HGSimpleSpatialDenoise::~HGSimpleSpatialDenoise()  @0x1c8310  (D0 deleting dtor)
   *
   * Body (verbatim @0x1c8310..0x1c8346):
   *   push/mov/sub prologue; save this in rbx
   *   leaq 0x861020(%rip),%rax ; @0x1c8319 — reinstall the class vtable (unusual — a
   *                            ; safety net for a partially-torn class during exception unwind)
   *   mov  %rax,(%rdi)         ; this->vptr = &vtable_HGSimpleSpatialDenoise
   *   mov  0x1a8(%rdi),%rdi    ; load childNode
   *   test %rdi,%rdi ; je +0x8 ; null-guard
   *   mov  (%rdi),%rax ; call *0x18(%rax)   ; child->vtable[+0x18] = HGObject::Release
   *   mov  %rbx,%rdi            ; restore this
   *   call __ZN6HGNodeD2Ev      ; HGNode base dtor
   *   mov  %rbx,%rdi ; epilogue
   *   jmp  __ZN8HGObjectdlEPv   ; tail-jmp operator delete
   *   [.cold path: __clang_call_terminate on unwind]
   */
  destroy_D0(): void {
    // @0x1c8323..0x1c8332 — release owned child if non-null.
    if (this.childNode) {
      childNode_release_slot0x18(this.childNode);
      this.childNode = null;
    }
    // @0x1c8338 — HGNode base dtor. HGNode's D2 is landed; JS GC handles field cleanup.
    void this;
    // @0x1c8346 — tail-jmp HGObject::operator delete(this).
    HGObject_operatorDelete(this);
  }

  /**
   * HGSimpleSpatialDenoise::SetParameter(int idx, float v, float, float, float)  @0x1c8360 -> int
   *
   * Body (verbatim @0x1c8360..0x1c83c8):
   *   idx==2 → jump to bool-branch  @0x1c83ae
   *   idx==1 → jump to iter-branch  @0x1c8396
   *   default: eax = -1
   *   idx==0 (fallthrough): cvttss2si xmm0->rax ; clamp to [0,2] via cmovg/cmovll ; store 0x198
   *   idx==1: cvttss2si xmm0->rcx ; if unsigned rcx < 2 → rcx=1 ; store 0x19c
   *   idx==2: xmm0 vs 0.0 with ucomiss ; setp+setne → 1 if unordered OR not-equal ; store 0x1a0
   *   return 1 on success (movl $0x1,%eax) except default-idx returns -1.
   */
  SetParameter(idx: number, v: number, _a: number, _b: number, _c: number): number {
    if (idx === 2) {
      // @0x1c83ae..0x1c83c2 — bool from (v != 0.0 OR NaN).
      // ucomiss + setp+setne | orb — sets true iff (NaN unordered) OR (v != 0).
      this.paramFlag = Number.isNaN(v) ? true : v !== 0.0;
      return 1;
    }
    if (idx === 1) {
      // @0x1c8396..0x1c83ac — iter = cvttss2si(v); if (unsigned)iter < 2 → iter = 1.
      // In i32 space this is equivalent to: `iter = (iter < 2 && iter > 0) ? 1 :
      // (iter >= 2 ? iter : 1)`. Reading the asm literally: `cmovbl` fires on CF, i.e.
      // unsigned comparison. `cvttss2si` returns INT_MIN for out-of-range; INT_MIN
      // interpreted unsigned is huge and NOT < 2, so it falls through and stores as-is.
      // Faithful reproduction: use int32 truncation then unsigned compare.
      let iter = Math.trunc(v) | 0;             // int32 cast (cvttss2si semantics — signed)
      const iterU = iter >>> 0;                 // treat as unsigned
      if (iterU < 2) iter = 1;
      this.paramIterations = iter;
      return 1;
    }
    if (idx === 0) {
      // @0x1c8377..0x1c8394 — mode = clamp(cvttss2si(v), 0, 2) with cmov chain.
      //   rax = cvttss2si(v)
      //   ecx = 0 ; if (eax > 0) ecx = eax    ; cmovg
      //   eax = 2 ; if (ecx < 2) eax = ecx    ; cmovl
      //   store eax at 0x198
      const raw = Math.trunc(v) | 0;
      let mode = 0;
      if (raw > 0) mode = raw;                   // cmovgl
      let out = 2;
      if (mode < 2) out = mode;                  // cmovll
      this.paramMode = out;
      return 1;
    }
    // idx is not 0/1/2 — return -1.
    return -1;
  }

  /**
   * HGSimpleSpatialDenoise::SetFilterParams(HGNode* child)  @0x1c83d0
   *
   * Body (verbatim @0x1c83d0..0x1c8468):
   *   r14 = this ; rbx = child
   *   ecx = this->paramMode  (this + 0x198)
   *   rax = child->vptr->slot[0x60]        ; HGNode::SetParameter
   *   if (ecx == 1) → mode1 branch @0x1c8415:
   *       xmm0 = 0.125 (@Helium 0x3ca9d4)
   *       xorps xmm2, xmm2                  ; xmm2 = 0.0
   *       fallthrough @0x1c842a:
   *         xorps xmm3, xmm3                ; xmm3 = 0.0 (arg-4)
   *         rdi = child, esi = 0
   *         movaps xmm0, xmm1               ; xmm1 = xmm0 = 0.125
   *         goto call @0x1c8435
   *   else if (ecx == 0) → default branch @0x1c83ef (already loaded):
   *       xmm0 = 0.0625 (@Helium 0x3ca2f4)
   *       xmm1 = 0.125  (@Helium 0x3ca9d4)
   *       xmm2 = 0.25   (@Helium 0x3cb6c4)
   *       xmm3 = 0.0
   *       rdi = child, esi = 0
   *       jmp call @0x1c8435
   *   else → mode2+ branch @0x1c8422:
   *       xmm2 = 0.5    (@Helium 0x3c7cc8)
   *       fallthrough @0x1c842a:
   *         xorps xmm3, xmm3
   *         rdi = child, esi = 0
   *         movaps xmm0, xmm1               ; xmm1 = xmm0 (unset xmm0? — see NOTE)
   *         goto call @0x1c8435
   *   call *rax (child->SetParameter(idx=0, xmm0, xmm1, xmm2, xmm3))
   *
   *   Then a SECOND call to child->vptr->slot[0x60]:
   *   rax = child->vptr->slot[0x60]              ; @0x1c8437-@0x1c843a
   *   if (this->paramFlag != 0):                 ; @0x1c843e-@0x1c8451
   *       xmm0 = xmm3 = 1.0 (@Helium 0x3c7cc0)
   *   else:
   *       xmm0 = 0.0
   *   xmm1 = 0.0 ; xmm2 = 0.0
   *   rdi = child, esi = 1
   *   epilogue then jmpq *rax                    ; tail-call child->SetParameter(idx=1, xmm0, 0, 0, 0)
   *
   * NOTE (mode2 xmm0): in the mode≥2 branch (`cmpl $0x1,%ecx ; je …` else `test %ecx,%ecx ;
   * jne mode2`), xmm0 has NOT been re-loaded before the join @0x1c842a. Reading the disasm
   * carefully: the mode1 branch already ran a `movss 0x2025b7(%rip),%xmm0` @0x1c8415 →
   * xmm0 = 0.125. If we arrive at mode2 (ecx != 0 and ecx != 1) we DID NOT enter the mode1
   * arm. Instead we came from `jne 0x1c8422` @0x1c83f9. At that point xmm0 was last set to
   * 0.0625 @0x1c83ef (before the branch). So mode2 has xmm0 = 0.0625, xmm2 = 0.5, and
   * after `movaps xmm0, xmm1` at @0x1c8432: xmm1 = 0.0625.
   *
   *   Effective preset table:
   *     paramMode == 0 : SetParameter(child, 0, 0.0625, 0.125,  0.25, 0.0)
   *     paramMode == 1 : SetParameter(child, 0, 0.125,  0.125,  0.0,  0.0)
   *     paramMode == 2 : SetParameter(child, 0, 0.0625, 0.0625, 0.5,  0.0)
   */
  SetFilterParams(child: unknown): void {
    if (this.paramMode === 1) {
      // mode==1 preset
      child_SetParameter_slot0x60(
        child,
        0,
        K_ONE_EIGHTH_F32_AT_0x3ca9d4,      // xmm0 = 0.125
        K_ONE_EIGHTH_F32_AT_0x3ca9d4,      // xmm1 = 0.125 (movaps xmm0, xmm1)
        0.0,                                // xmm2 = 0.0  (xorps)
        0.0                                 // xmm3 = 0.0  (xorps)
      );
    } else if (this.paramMode === 0) {
      // default preset
      child_SetParameter_slot0x60(
        child,
        0,
        K_ONE_SIXTEENTH_F32_AT_0x3ca2f4,   // xmm0 = 0.0625
        K_ONE_EIGHTH_F32_AT_0x3ca9d4,      // xmm1 = 0.125
        K_ONE_QUARTER_F32_AT_0x3cb6c4,     // xmm2 = 0.25
        0.0                                 // xmm3 = 0.0
      );
    } else {
      // mode >= 2 preset (see NOTE in class-level derivation for xmm0 dataflow)
      child_SetParameter_slot0x60(
        child,
        0,
        K_ONE_SIXTEENTH_F32_AT_0x3ca2f4,   // xmm0 = 0.0625 (carried from default preload)
        K_ONE_SIXTEENTH_F32_AT_0x3ca2f4,   // xmm1 = 0.0625 (movaps xmm0, xmm1)
        K_HALF_F32_AT_0x3c7cc8,            // xmm2 = 0.5
        0.0                                 // xmm3 = 0.0
      );
    }

    // Second call: child->SetParameter(idx=1, paramFlag?1.0:0.0, 0, 0, 0)
    child_SetParameter_slot0x60(
      child,
      1,
      this.paramFlag ? K_ONE_F32_AT_0x3c7cc0 : 0.0,
      0.0,
      0.0,
      0.0
    );
  }

  /**
   * HGSimpleSpatialDenoise::GetOutput(HGRenderer*) -> HGImage*  @0x1c8460
   *
   * Body: 165 lines, 23 callqs. Constructs a chain of sibling render nodes (HGDenoisePDE,
   * HGRenderer::GetInput, HGRenderer::GetDOD) driven by paramMode/paramIterations/paramFlag.
   * Requires HGRenderer + HGDenoisePDE frontier + HGNode::SetInput (already partly landed).
   *
   * Per PORTING_SPEC Rule 3 this is a loud gap. Disasm on disk at
   * raw-port/re/disasm/Helium.HGSimpleSpatialDenoise.GetOutput.s for the follow-up decoder.
   */
  GetOutput(_renderer: unknown): unknown {
    throw new Error(
      "raw-port: HGSimpleSpatialDenoise::GetOutput @0x1c8460 not yet transcribed — 165-line " +
        "pipeline that composes HGDenoisePDE + HGRenderer::GetInput/GetDOD frontier. See " +
        "raw-port/re/disasm/Helium.HGSimpleSpatialDenoise.GetOutput.s."
    );
  }
}

export default HGSimpleSpatialDenoise;

