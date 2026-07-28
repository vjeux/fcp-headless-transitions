// HGRegularize.ts — Helium HGRegularize: a render-graph "regularize" node
// that stacks a chain of up to 200 HGDenoisePDE stages driven by a single
// float "strength" parameter. Faithful transcription of x86_64 disassembly
// of /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HGRegularize.HGRegularize.s   (C1 → C2)
//   raw-port/re/disasm/Helium.HGRegularize.~HGRegularize.s  (D0)
//   raw-port/re/disasm/Helium.HGRegularize.SetParameter.s
//   raw-port/re/disasm/Helium.HGRegularize.GetOutput.s
//
// Helium symbols transcribed:
//   @0x001c32d0  HGRegularize::HGRegularize()                (C2 base ctor)
//   @0x001c3420  HGRegularize::HGRegularize()                (C1 complete ctor — jmp to C2)
//   @0x001c3430  HGRegularize::~HGRegularize()               (D2)
//   @0x001c34b0  HGRegularize::~HGRegularize()               (D1)
//   @0x001c3530  HGRegularize::~HGRegularize()               (D0)
//   @0x001c35b0  HGRegularize::SetParameter(int,float,float,float,float)
//   @0x001c35f0  HGRegularize::GetOutput(HGRenderer*)
//
// Vtable install (from C2 @0x001c32e3):
//   leaq  0x865866(%rip),%rax   -> data @0x001c32e3+7+0x865866 = 0xa28b50 (HGRegularize vtable)
//   movq  %rax,(%rbx)
// D0 reinstalls the vtable prefix @0x001c353a: leaq 0x86560f(%rip),%rax -> 0xa28b50 as well.
//
// STRUCT LAYOUT (recovered from the ctor + accessors):
//   ---- inherited HGObject + HGNode (size = 0x198 in this class's usage) ----
//   0x198 : HGNode*    headNode        // a bare HGNode allocated with 0x1a0 bytes then
//                                       // HGNode::HGNode() ctor'd. Stored at +0x198 (asm
//                                       // @0x001c331d), then wired as the input on
//                                       // stages[0] (asm @0x001c3343 rdx=[+0x198] fed to
//                                       // vtable+0x78 (SetInput) on children[0]).
//   0x1a0 : HGNode**   stages          // pointer to a 200-entry (0xc8) array of HGNode*.
//                                       // Allocated with operator new[]  (asm @0x001c32f7:
//                                       //   mov $0x640,%edi ; call __Znam) — 0x640 = 200*8
//                                       // bytes. stages[0] is a bare HGNode; stages[1..199]
//                                       // are HGDenoisePDE instances (see ctor loop).
//   0x1a8 : f32        strength        // SetParameter(0, x, _, _, _) writes here; ctor
//                                       // initialises to 0.0f (asm @0x001c32ed).
//
// Called symbols / data (from otool -tV comments in the disasm):
//   __ZN6HGNodeC2Ev              HGNode::HGNode()                 base ctor (@0x001c32de)
//   __ZN6HGNodeC1Ev              HGNode::HGNode()                 complete ctor
//                                (@0x001c3318, @0x001c3334)
//   __Znam                        operator new[](size_t)          (@0x001c32fc: 0x640 bytes)
//   __ZN8HGObjectnwEm            HGObject::operator new(unsigned long)
//                                (@0x001c330d, @0x001c3329, @0x001c3365)
//   __ZN12HGDenoisePDEC2Eb       HGDenoisePDE::HGDenoisePDE(bool) (@0x001c3389)
//   __ZN6HGNode9ClearBitsEv      HGNode::ClearBits()              (@0x001c35d5)
//   __ZN10HGRenderer8GetInputEP6HGNodei
//                                HGRenderer::GetInput(HGNode*, int) (@0x001c3637)
//   __ZN6HGNodeD2Ev              HGNode::~HGNode()                (D2)
//   __ZdlPv                       operator delete(void*)
//   __ZN8HGObjectdlEPv           HGObject::operator delete(void*)
//   ___clang_call_terminate       C++ EH terminate (unwind fallback in ctor)
//
// Vtable slots called through children[i]:
//   *0x78  HGNode::SetInput(int idx, HGNode* src)         (@ctor: rdx=prev stage/head,
//                                                          esi=0; @0x001c3352, @0x001c33a6)
//   *0x60  HGNode::SetParameter(int idx,f,f,f,f)          (@ctor: idx=0, xmm0=xmm1=xmm2=0.2f;
//                                                          @0x001c33ca)
//
// RIP-relative float constants (movss / ucomiss):
//   @0x001c33bc  movss  0x697764(%rip),%xmm0 ; next-instr @0x001c33c4 -> 0x001c33c4+0x697764
//                = data @0x0085ab28 ; low-32 of the double u64 = 0x3e4ccccd = 0.20000000298f
//                ⇒  0.2f  (the per-stage strength seed used at ctor time)
//   @0x001c360d  ucomiss 0x69a69c(%rip),%xmm0 ; next-instr @0x001c3614 -> 0x001c3614+0x69a69c
//                = data @0x0085dcb0 ; low-32 of u64 = 0x43480000 = 200.0f
//                ⇒  200.0f (cap for the strength-to-stage-index conversion in GetOutput)
//
// The per-stage denoise-bool computation (asm @0x001c336d..0x001c3382) is
//   uint8_t i8 = (uint8_t)i;
//   uint8_t a  = (uint8_t)((i8 * 0xcd) >> 10) * 5;   // == i/5 for i∈[0,255]
//   uint8_t c  = (uint8_t)(-1) - (i - 1);            // r12 starts 0xff, decremented each iter
//                                                    //   → c = 0xff - (i-1) = 0x100 - i (u8)
//   bool arg  = (a + c) == 0;                        // set-equal-zero (sete → esi)
// which reduces to: `arg = ((i/5) * 5 + (0x100 - i)) == 0 (mod 256)`.
// For i ∈ [1,199] the two terms cancel exactly when (i - (i/5)*5)==0, i.e. when i is a
// multiple of 5. So HGDenoisePDE is constructed with `true` on i ∈ {5,10,15,...,195} and
// `false` otherwise. This is a fixed compile-time pattern recovered directly from the
// instruction sequence; no numeric guess.

import { HGNode } from "./HGNode";
// HGObject provides the operator-new/delete allocator we cite in the ctor's
// __ZN8HGObjectnwEm / __ZN8HGObjectdlEPv callouts. The typed base is enough
// here; the actual allocator is a JS `new`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HGObject as _HGObject } from "./HGObject";

/** HGRenderer — opaque render context passed to GetOutput. Only its
 *  `GetInput(node, idx)` method is read by this file (@0x001c3637). */
export interface HGRenderer {
  /** HGRenderer::GetInput(HGNode*, int) @Helium — pulls the upstream image
   *  produced by `node` on input `idx`. Not decoded in this port; the return
   *  type is intentionally opaque. */
  GetInput(node: HGNode, idx: number): unknown;
}

/** Structural shim for the two vtable slots invoked on children in this
 *  file (SetParameter *0x60, ClearBits (no-arg overload) @0x11f???, and
 *  Release *0x18). None of these three are exported yet by HGNode.ts (only
 *  SetInput *0x78 is), so we type each as an optional-method call and cite
 *  the vtable slot addr on the call-site rather than fabricating them on
 *  the base. All are frontier: any real invocation trips a throw. */
type _HGNodeVCalls = {
  /** *vtable+0x60 — HGNode::SetParameter(int,float,float,float,float) @Helium
   *  base @0x11cab0 (see HGNode.ts header). Not yet transcribed. */
  SetParameter?(idx: number, a: number, b: number, c: number, d: number): number;
  /** HGNode::ClearBits() @Helium (v-void overload, mangled __ZN6HGNode9ClearBitsEv)
   *  — invalidates cached-render bits on the node. Not yet transcribed. */
  ClearBits?(): void;
  /** *vtable+0x18 — HGObject::Release() inherited by HGNode. Not yet
   *  transcribed. */
  Release?(): void;
};

/** HGDenoisePDE — the per-stage denoise node this class stacks. Only its
 *  ctor `HGDenoisePDE(bool)` is called from HGRegularize's ctor
 *  (@0x001c3389). Its vtable slots *0x78 (SetInput) and *0x60 (SetParameter)
 *  are invoked via the shared HGNode vtable convention. Not yet transcribed
 *  as a full class — keep as a frontier type with a throw-stub constructor
 *  so any real evaluation trips the gate rather than silently no-ops. */
export class HGDenoisePDE extends HGNode {
  /** HGDenoisePDE::HGDenoisePDE(bool) @Helium (mangled __ZN12HGDenoisePDEC2Eb,
   *  invoked from HGRegularize::HGRegularize @0x001c3389). Not yet transcribed. */
  constructor(_arg: boolean) {
    super();
    throw new Error(
      "HGDenoisePDE::HGDenoisePDE(bool) @Helium not yet transcribed " +
        "(called from HGRegularize::HGRegularize @0x001c3389)"
    );
  }
}

/**
 * HGRegularize — Helium composite render node.
 *
 * Faithful transcription of ctor / dtor / SetParameter / GetOutput.
 * Vtable @Helium 0xa28b50 (installed at +0x00; asm @0x001c32e3 & @0x001c353a).
 */
export class HGRegularize extends HGNode {
  /** +0x198 — the shared HGNode source, fed to the first denoise stage. */
  headNode!: HGNode;
  /** +0x1a0 — 200-slot stage table (stages[0]=bare HGNode; stages[i>=1]=HGDenoisePDE). */
  stages!: (HGNode | null)[];
  /** +0x1a8 — single float "strength" parameter (index 0 in SetParameter). */
  strength: number = 0.0;

  /**
   * HGRegularize::HGRegularize() @Helium @0x001c32d0 (C2) / @0x001c3420 (C1).
   *
   *   C2 body (@0x001c32d0..@0x001c33e4):
   *     HGNode::HGNode()                                (@0x001c32de)
   *     *(void**)this        = 0xa28b50  (vtable)       (@0x001c32e3)
   *     *(u32*)(this+0x1a8)  = 0                        (@0x001c32ed)  strength=0
   *     *(void**)(this+0x1a0)= operator new[](0x640)    (@0x001c32fc, @0x001c3301)
   *     headNode = new HGObject(0x1a0); HGNode::HGNode()(@0x001c330d..@0x001c3318)
   *     *(void**)(this+0x198) = headNode                (@0x001c331d)
   *     stages[0]           = new HGObject(0x1a0); HGNode::HGNode()
   *                                                     (@0x001c3324..@0x001c333d)
   *     vcall *0x78(vtbl(stages[0]))(stages[0], 0, headNode)  ; SetInput(0, headNode)
   *                                                     (@0x001c3343..@0x001c3352)
   *     for (i = 1; i < 0xc8; ++i):
   *       arg = (((u8)i * 0xcd) >> 10) * 5 + ((u8)-1 - (i-1)) == 0
   *       stages[i] = new HGObject(0x1d0); HGDenoisePDE::HGDenoisePDE(arg)
   *                                                     (@0x001c3360..@0x001c338e)
   *       vcall *0x78(vtbl(stages[i]))(stages[i], 0, stages[i-1])  ; SetInput
   *                                                     (@0x001c3399..@0x001c33a6)
   *       vcall *0x60(vtbl(stages[i]))(stages[i], 0, 0.2f, 0.2f, 0.2f, 0.0f)
   *                                                     (@0x001c33ba..@0x001c33ca)
   */
  constructor() {
    super(); // HGNode::HGNode()  @0x001c32de
    this.strength = 0.0; // @0x001c32ed: mov $0,0x1a8(%rbx)

    // stages[] = new HGNode[200] (Helium alloc: __Znam(0x640) @0x001c32fc).
    this.stages = new Array<HGNode | null>(200).fill(null);

    // headNode = new HGNode() (HGObject::operator new(0x1a0) + HGNode::HGNode()).
    this.headNode = new HGNode(); // @0x001c330d..0x001c3318, stored @0x001c331d

    // stages[0] = new HGNode(); vcall *0x78: stages[0].SetInput(0, headNode)
    const stage0 = new HGNode(); // @0x001c3324..0x001c3334
    this.stages[0] = stage0;
    // @0x001c3343: mov 0x198(%rbx),%rdx  (headNode → rdx, i.e. the src arg)
    // @0x001c3352: callq *0x78(%rax)      (vcall SetInput on stages[0])
    stage0.SetInput(0, this.headNode);

    // Loop @0x001c3355..@0x001c33da  (r15=i=1; r12b = 0xff; step 1 / dec 1; cmp $0xc8).
    // The 0.2f constant lives at Helium data @0x0085ab28 (RIP+0x697764 from @0x001c33c4).
    // See file-header derivation: SetParameter args are (0, 0.2f, 0.2f, 0.2f, 0.0f).
    const STAGE_PARAM_STRENGTH = Math.fround(0.2); // @0x0085ab28 (single-precision LE 0x3e4ccccd)
    for (let i = 1; i < 0xc8; ++i) {
      // Per-stage bool arg (see file-header derivation):
      //   asm: r12b starts at 0xff (movb $-0x1,%r12b @0x001c335b) then decb %r12b each iter
      //        @0x001c33d0; at iteration i (1..199) r12b = (0xff - (i-1)) mod 256.
      //   a = ((u8)i * 0xcd) >> 10 * 5 (i.e. (i/5)*5 for u8 i)
      //   sete on (a + r12b) == 0.
      const iu8 = i & 0xff;
      const a = ((((iu8 * 0xcd) >>> 0) >>> 10) * 5) & 0xff;
      const r12b = (0xff - (i - 1)) & 0xff;
      const arg = ((a + r12b) & 0xff) === 0;

      // HGObject::operator new(0x1d0) then HGDenoisePDE::HGDenoisePDE(arg).
      // This is a THROWING frontier stub; HGRegularize construction of a real
      // engine graph is blocked on HGDenoisePDE landing, as required by the
      // no-guess rule (PORTING_SPEC Rule 3).
      const stage = new HGDenoisePDE(arg);
      this.stages[i] = stage;

      // vcall *0x78(vtbl(stage))(stage, 0, stages[i-1])  ; SetInput(0, prev)
      // @0x001c3399: rdx=stages[i-1]; @0x001c33a6: callq *0x78(%rax)
      stage.SetInput(0, this.stages[i - 1]!);

      // vcall *0x60(vtbl(stage))(stage, esi=0, xmm0=0.2f, xmm1=0.2f, xmm2=0.2f, xmm3=0.0f)
      // @0x001c33b7: xorps %xmm3,%xmm3   (4th float = 0.0f)
      // @0x001c33bc: movss 0.2f,%xmm0    (RIP@0x0085ab28)
      // @0x001c33c4/c7: movaps %xmm0,%xmm1 / %xmm2  (xmm1=xmm2=0.2f)
      // @0x001c33ca: callq *0x60(%rax)   (SetParameter)
      const vcall = stage as unknown as _HGNodeVCalls;
      if (!vcall.SetParameter) {
        throw new Error(
          "HGNode::SetParameter(int,f,f,f,f) @0x11cab0 not yet transcribed " +
            "(vcall *0x60 from HGRegularize::HGRegularize @0x001c33ca)"
        );
      }
      vcall.SetParameter(
        0,
        STAGE_PARAM_STRENGTH,
        STAGE_PARAM_STRENGTH,
        STAGE_PARAM_STRENGTH,
        Math.fround(0.0)
      );
    }
  }

  /**
   * HGRegularize::SetParameter(int idx, float a, float, float, float) @Helium
   *   @0x001c35b0.
   *
   * Body (exactly as disassembled):
   *   eax = -1
   *   if (idx != 0) return -1;                            (@0x001c35b0..@0x001c35b7)
   *   if (this->strength ==u xmm0 && !unordered) return 0; (@0x001c35ba..@0x001c35e3)
   *   this->strength = xmm0 = a;                          (@0x001c35cd)
   *   HGNode::ClearBits()      (this)                     (@0x001c35d5)
   *   return 1;                                           (@0x001c35da)
   *
   * The `ucomiss` sets ZF+PF on equality *and* on unordered (NaN).  The `jne
   * 0x1c35c9` first-jump falls through only on equal-or-unordered; then
   * `jnp 0x1c35e1` jumps only when *not* unordered — i.e. taken exactly when
   * (a==this->strength) ordered. Faithfully: on strict-equality skip
   * (return 0); NaN new value → do the store + ClearBits + return 1.
   */
  SetParameter(idx: number, a: number, _b: number, _c: number, _d: number): number {
    // @0x001c35b0..b9: idx test.
    if (idx !== 0) return -1;
    // Ported semantics of ucomiss+jne+jnp:
    //   equal-ordered  → skip store, return 0
    //   NaN (unordered) or not-equal → store, ClearBits, return 1
    const cur = Math.fround(this.strength);
    const na = Math.fround(a);
    const equalOrdered = na === cur && !Number.isNaN(na) && !Number.isNaN(cur);
    if (equalOrdered) {
      return 0; // xor eax,eax; ret (@0x001c35e1)
    }
    this.strength = na; // @0x001c35cd: movss %xmm0,0x1a8(%rdi)
    // @0x001c35d5: callq __ZN6HGNode9ClearBitsEv  (HGNode::ClearBits() no-arg overload).
    // Guard the vcall — see frontier stub below (cites @0x001c35d5).
    const self = this as unknown as _HGNodeVCalls;
    if (!self.ClearBits) {
      throw new Error(
        "HGNode::ClearBits() @Helium (__ZN6HGNode9ClearBitsEv) not yet transcribed " +
          "(called from HGRegularize::SetParameter @0x001c35d5)"
      );
    }
    self.ClearBits();
    return 1; // @0x001c35da: mov $1,%eax
  }

  /**
   * HGRegularize::GetOutput(HGRenderer* renderer) @Helium @0x001c35f0.
   *
   * Body:
   *   xmm0 = this->strength;                              (@0x001c35f3)
   *   ; ucomiss xmm0=strength (rdi+0x1a8), xmm1=0.0 (xor'd);
   *   ; jae skip: taken when strength <= 0 ordered (NaN → not taken → run body).
   *   ecx = (int)truncf(xmm0);                            (cvttss2si @0x001c3614)
   *   rcx = (int64)ecx (sign-extend);                     (@0x001c3618)
   *   r14 = 0xc8;                                         (@0x001c361b)
   *   if (strength <=u 200.0f OR unordered) r14 = rcx;    (cmovbe @0x001c3621)
   *   gotInput = HGRenderer::GetInput(renderer, this->headNode, 0);
   *                                                        (@0x001c3625..@0x001c363c)
   *   headNode.SetInput(0, gotInput);                     (vcall *0x78 @0x001c3647)
   *   return stages[r14];                                 (@0x001c364a..@0x001c3651)
   *
   * Special case: strength <= 0 (ordered) → returns `this` (the HGRegularize
   * itself) untouched.  (asm's `jae` off @0x001c3601 skips the whole body,
   * with rax = rdi = this from the entry @0x001c35f0.)
   */
  GetOutput(renderer: HGRenderer): HGNode {
    // @0x001c35fb..@0x001c3601: ucomiss %xmm0,%xmm1 with xmm1=0.0, xmm0=strength;
    //   Ordered:  CF=0 iff 0.0 >= strength → jae taken → return this (no work).
    //             CF=1 iff 0.0 <  strength → jae NOT taken → run body.
    //   Unordered (NaN): CF=1 → jae NOT taken → run body.
    const s = Math.fround(this.strength);
    const strictlyPositive = !(s <= 0); // Number.isNaN(s) satisfies !(NaN<=0)
    if (!strictlyPositive) {
      // @0x001c365f: retq (rax = this from @0x001c35f0)
      return this;
    }

    // @0x001c3614: cvttss2si — truncate toward zero to int32. NaN was ruled
    // out above (would have returned this). For +Inf, cvttss2si emits the
    // 0x80000000 "indefinite integer".
    let idx: number;
    if (!Number.isFinite(s)) {
      idx = -0x80000000; // x86 "indefinite integer" for invalid cvttss2si
    } else {
      idx = Math.trunc(s) | 0;
    }

    // @0x001c361b: r14 = 0xc8 default.
    let r14 = 0xc8;
    // @0x001c360d..@0x001c3621: ucomiss xmm0=strength, mem=200.0f;  cmovbe rcx→r14.
    //   cmovbe = CF||ZF; for ucomiss with A=xmm0,B=mem:
    //     ordered:   CF = (A<B),  ZF = (A==B)  ⇒ take when A<=B (strength<=200)
    //     unordered: CF=1, ZF=1                ⇒ take
    if (s <= 200 || Number.isNaN(s)) {
      r14 = idx;
    }

    // @0x001c3625..@0x001c363c:
    //   renderer->GetInput(headNode, 0)   ; returns "gotInput" in rax
    const gotInput = renderer.GetInput(this.headNode, 0) as HGNode | null;

    // @0x001c363f..@0x001c3647:
    //   headNode->SetInput(0, gotInput)   ; vcall *0x78 on headNode
    //   (rdi=headNode; rsi=0; rdx=gotInput).
    this.headNode.SetInput(0, gotInput);

    // @0x001c364a..@0x001c3651:
    //   rax = *(this->stages + r14*8)     ; return stages[r14]
    // r14 can be any (potentially negative) int for strength<=200 branch, or
    // the fixed cap 200 otherwise.  We don't clamp beyond what the asm does;
    // the raw indexing IS the semantics. A null slot (only slot 200 in the
    // present layout, which is one-past-the-end) surfaces the OOB read as
    // a throw rather than a silent undefined.
    const out = this.stages[r14];
    if (!out) {
      throw new Error(
        `HGRegularize::GetOutput @0x001c35f0 — stages[${r14}] is null/undefined ` +
          `(strength=${s}); raw indexing per asm @0x001c3651`
      );
    }
    return out;
  }

  /**
   * HGRegularize::~HGRegularize() @Helium @0x001c3530 (D0), @0x001c34b0 (D1),
   * @0x001c3430 (D2).
   *
   * D0 body @0x001c3530:
   *   *(void**)this = 0xa28b50   (reinstall this-class vtable)     (@0x001c353a)
   *   for (r14 = 0; r14 < 0xc8; ++r14):                            (@0x001c3547..@0x001c356b)
   *     stage = stages[r14]                                        (@0x001c3550..@0x001c3557)
   *     vcall *0x18(vtbl(stage))(stage)          ; Release         (@0x001c355e)
   *   headNode->Release()                        ; vcall *0x18      (@0x001c356d..@0x001c3577)
   *   if (stages) operator delete(stages)                          (@0x001c357a..@0x001c358a)
   *   HGNode::~HGNode()(this)                                       (@0x001c358e)
   *   HGObject::operator delete(this)                              (jmp @0x001c359a)
   *
   * D1/D2 (@0x001c3430/@0x001c34b0) are the non-deleting variants; they run
   * the same body without the trailing `operator delete`. We collapse the
   * three overloads into a single JS-level `destruct()`; the memory-freeing
   * step (`HGObject::operator delete`) is JS GC and left out. Release
   * (vtable slot *0x18) is a frontier — call sites are marked with the addr.
   */
  destruct(): void {
    // @0x001c353a: reinstall vtable prefix — a no-op in JS (no vtable
    // pointer to overwrite), documented for provenance.
    // @0x001c3547..@0x001c356b: iterate all 200 stages and Release each.
    for (let r14 = 0; r14 < 0xc8; ++r14) {
      const s = this.stages?.[r14] as unknown as _HGNodeVCalls | null | undefined;
      if (s && typeof s.Release === "function") {
        // vcall *0x18 = HGObject::Release() @Helium 0x1a0f30 (see HGNode.ts).
        s.Release();
      }
    }
    // @0x001c356d..@0x001c3577: headNode->Release()   (vcall *0x18 @Helium 0x1a0f30).
    if (this.headNode) {
      const h = this.headNode as unknown as _HGNodeVCalls;
      if (typeof h.Release === "function") {
        h.Release();
      }
    }
    // @0x001c357a..@0x001c358a: if (stages) operator delete(stages) — JS GC.
    // @0x001c358e: HGNode::~HGNode() — HGNode.destruct if present; not
    //   currently wired on HGNode.ts (see its own header), documented gap.
    this.stages = null as unknown as (HGNode | null)[];
    this.headNode = null as unknown as HGNode;
  }
}
