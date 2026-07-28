// raw-port/src/render/HGCompositeWithMask.ts
//
// FCP `HGCompositeWithMask` — Helium render-graph node that composites
// two inputs through a mask, with two mode selection based on a client
// flag AND a renderer capability query. Exposes 2 parameters via
// `SetParameter(int idx, float, float, float, float)`.
//
// Symbols decoded (Helium framework, x86_64 slice; VAs from `otool -tV`):
//   0x174f30  HGCompositeWithMask::HGCompositeWithMask()          [C2 base ctor]
//   0x174f60  HGCompositeWithMask::HGCompositeWithMask()          [C1 complete ctor — identical body]
//   0x174f90  HGCompositeWithMask::~HGCompositeWithMask()         [D2 base dtor]
//   0x174fd0  HGCompositeWithMask::~HGCompositeWithMask()         [D1 complete dtor — identical body]
//   0x175010  HGCompositeWithMask::~HGCompositeWithMask()         [D0 deleting dtor: D2 + HGObject::operator delete]
//   0x175060  HGCompositeWithMask::SetParameter(int, float, float, float, float)
//   0x1750b0  HGCompositeWithMask::GetOutput(HGRenderer*)
//
// Vtable @Helium 0xa214e8 (installed ptr = 0xa214f8). Slots this class
// overrides: *0x00 D1 dtor (0x174fd0), *0x08 D0 dtor (0x175010), *0x60
// SetParameter (0x175060). Everything else inherits HGNode's slots.
//
// STRUCT LAYOUT (recovered from C2 ctor @0x174f30, D2 dtor @0x174f90,
// SetParameter @0x175060, GetOutput @0x1750b0):
//   ---- inherited from HGNode (size 0x198) ----
//     0x000..0x197 : HGNode fields (see HGNode.ts). C2 tail-calls
//                    HGNode::HGNode() @0x174f39 before own-field writes.
//   ---- HGCompositeWithMask-specific fields (start at 0x198) ----
//     0x198 : HGNode*  cachedOutputTail    (ctor: xmm0=0 → 0x198/0x1a0 written via movups)
//     0x1a0 : i32      useDODPath          (ctor: same movups clears it; SetParameter idx=0 sets it)
//     0x1a4 : float    maskAmount          (SetParameter idx=1 stores clamp(x,0,1) here)
//                                          (ctor did NOT init this — it lies in the 16-byte
//                                           xorps window @0x198 that includes 0x1a0/0x1a4? Yes:
//                                           movups %xmm0 (16 bytes of zero) to 0x198 covers
//                                           0x198..0x1a7. So 0x1a4 starts at 0. Rest of the
//                                           16-byte range initialises 0x1a0 and 0x1a4 to +0.0f.)
//   sizeof(HGCompositeWithMask) = 0x1a8 bytes.
//
// Ctor @0x174f30 (C2, verbatim):
//   0x174f39  callq __ZN6HGNodeC2Ev              ; base ctor
//   0x174f3e  leaq  0x8ac5b3(%rip), %rax          ; = 0xa214f8 own vtable installed ptr
//   0x174f45  movq  %rax, (%rbx)                  ; *this = own vtable
//   0x174f48  xorps %xmm0, %xmm0
//   0x174f4b  movups %xmm0, 0x198(%rbx)           ; zero 16 bytes @0x198..0x1a7:
//                                                 ;   cachedOutputTail=null, useDODPath=0,
//                                                 ;   maskAmount=+0.0f, tail-byte=0.
//
// D2 @0x174f90 (verbatim, minus exception path):
//   0x174f96  leaq 0x8ac55b(%rip), %rax          ; = 0xa214f8 own vtable
//   0x174f9d  movq %rax, (%rdi)                  ; reinstall vtable
//   0x174fa0  movq 0x198(%rdi), %rax             ; load cachedOutputTail
//   0x174fa7  testq %rax, %rax
//   0x174faa  je   0x174fbb                      ; skip if null
//   0x174fac  movq (%rax), %rcx                  ; vtbl
//   0x174fb5  callq *0x18(%rcx)                  ; Release()
//   0x174fc1  jmp __ZN6HGNodeD2Ev                ; tail-call base dtor
//
// D0 @0x175010: same body as D2 (Release cached tail, reinstall vtable,
// call HGNode::~HGNode), then tail-jmp HGObject::operator delete.
//
// SetParameter @0x175060 (verbatim, mirrors the switch on idx):
//   cmpl $0x1, %esi                              ; idx == 1 ?
//   je   0x175085                                ; -> clamp&store branch
//   movl $-1, %eax                               ; default ret = -1
//   testl %esi, %esi                             ; idx == 0 ?
//   jne  0x175084                                ; -> return -1
//   ; idx == 0 branch:
//   xorps %xmm1, %xmm1
//   xorl  %eax, %eax
//   ucomiss %xmm1, %xmm0                         ; xmm0 (arg1) vs 0.0
//   seta %al                                     ; al = (arg1 > 0.0)
//   movl %eax, 0x1a0(%rdi)                       ; useDODPath = (arg1>0)?1:0
//   movl $0x1, %eax                              ; ret = 1
//   ret
//   ; idx == 1 branch (@0x175085):
//   movss 0x252c2f(%rip), %xmm1                  ; @0x3c7cc0 = 1.0f
//   minss %xmm0, %xmm1                           ; xmm1 = min(1.0, arg1)
//   xorps %xmm0, %xmm0
//   maxss %xmm0, %xmm1                           ; xmm1 = max(0.0, xmm1) = clamp(arg1,0,1)
//   movss %xmm1, 0x1a4(%rdi)                     ; maskAmount = clamped
//   movl  $0x1, %eax                             ; ret = 1
//   ret
// NB: arg2/arg3/arg4 (xmm1/xmm2/xmm3) are IGNORED by both branches — this
// is a 1-arg logical parameter dispatched via a 4-arg vtable slot.
//
// GetOutput @0x1750b0 (mirrored below): decides between two subgraph
// factories based on a renderer capability + the useDODPath flag.
//   1) mode = renderer.getSomeCapability()   via vcall *0x130           @0x1750ca
//   2) if (mode == true) useDODbranch = 0;
//      else              useDODbranch = (this.useDODPath == 1)
//   3) input0 = renderer.GetInput(this, 0)                              @0x1750ed
//      input1 = renderer.GetInput(this, 1)                              @0x175101
//      input2 = renderer.GetInput(this, 2)                              @0x175114
//   4) if (useDODbranch) {
//        node = HGObject::operator new(0x1a0)
//        HgcCompositeWithMask::HgcCompositeWithMask()  @0x175131
//        *(node) = vtable for HGComposite_LimitedDOD   (@0xa21750)     @0x175136
//      } else {
//        node = HGObject::operator new(0x1b0)
//        HgcCompositeWithMask::HgcCompositeWithMask()  @0x175152
//        *(node) = vtable for HGComposite_OptimizedROI (@0xa219a8)     @0x175157
//        node[0x1a0] = 0                                                 @0x175161
//      }
//   5) node.SetInput(0, input0)   via vcall *0x78                       @0x175174
//      node.SetInput(1, input1)   via vcall *0x78                       @0x175185
//      node.SetInput(2, input2)   via vcall *0x78                       @0x175196
//   6) if (useDODbranch) {                                              @0x17519c
//        ov = HGObject::operator new(0x1a0)
//        HGOverwrite::HGOverwrite()                    @0x1751ae
//        ov.SetInput(0, input0)  via *0x78                              @0x1751c0
//        ov.SetInput(1, node)    via *0x78                              @0x1751d2
//        prev = this.cachedOutputTail                                    @0x1751d5
//        if (prev != ov) {
//          if (prev != null) prev.Release()   via *0x18                 @0x1751e9
//          this.cachedOutputTail = ov                                   @0x1751ec
//          ov.Retain()                        via *0x10                 @0x1751fa
//        }
//        ov.Release()                          via *0x18                 @0x175204
//        // (node's Release is fall-through to the shared epilogue at 0x17524d — no earlier Release of node)
//        // WAIT: actually flow jumps from 0x175207 to 0x17524d, then Release(node) at 0x17525a.
//      } else {                                                          @0x175209
//        // Non-DOD branch: call node.SetParameter(0, maskAmount, 0, 0, 0) via *0x60
//        movss 0x1a4(%r14), %xmm0    ; xmm0 = this.maskAmount
//        xorps xmm1,xmm2,xmm3        ; extra args = 0
//        node.SetParameter(0, maskAmount, 0, 0, 0)     via vcall *0x60  @0x175223
//        prev = this.cachedOutputTail                                    @0x175226
//        if (prev != node) {
//          if (prev != null) prev.Release()   via *0x18                 @0x17523a
//          this.cachedOutputTail = node                                 @0x17523d
//          node.Retain()                      via *0x10                 @0x17524a
//        }
//      }
//   7) shared epilogue @0x17524d:
//        r14 = this.cachedOutputTail    (reloaded)                       @0x17524d
//        node.Release()                 via *0x18                        @0x17525a
//        return r14
//
// DECODE-DON'T-FIT: three sub-classes are NOT yet transcribed. Each is
// referenced through a throwing factory stub citing its ctor address:
//   HgcCompositeWithMask   @Helium __ZN20HgcCompositeWithMaskC2Ev  (variant subclasses HGComposite_LimitedDOD @vtbl 0xa21750, HGComposite_OptimizedROI @vtbl 0xa219a8)
//   HGOverwrite            @Helium __ZN11HGOverwriteC1Ev
//   HGRenderer::GetInput   @Helium __ZN10HGRenderer8GetInputEP6HGNodei
//   HGRenderer's slot 0x130 (capability query) — unresolved without a full HGRenderer decode.

import { HGNode } from './HGNode.js';

/**
 * @Helium 0x3c7cc0 = 0x3f800000 = 1.0f (clamp upper bound in SetParameter idx==1).
 * Loaded by `movss 0x252c2f(%rip), %xmm1` @0x175089 → next-instr 0x175091 + 0x252c2f = 0x3c7cc0.
 */
const CLAMP_MAX_1F = 1.0;

// ---------------------------------------------------------------------------
// Stubs for as-yet-undecoded FCP classes referenced by GetOutput.
// Each throw cites the @0xADDR that must be transcribed next.
// ---------------------------------------------------------------------------

/**
 * `HGRenderer` — a Helium renderer/context. GetOutput calls two of its
 * slots:
 *   - vtable slot *0x130 (unknown-named capability query) @Helium 0x1750ca
 *   - `HGRenderer::GetInput(HGNode*, int)` @Helium
 *     __ZN10HGRenderer8GetInputEP6HGNodei                @Helium 0x1750ed
 * The class is not yet transcribed; the interface below declares only
 * the two methods this port calls.
 */
export interface HGRendererCtx {
  /** @Helium 0x1750ca vcall *0x130 on the renderer. Semantic: returns
   *  bool. If true, forces the OptimizedROI (non-DOD) subgraph. */
  queryDisableDOD(): boolean;
  /** @Helium 0x1750ed / 0x175101 / 0x175114: HGRenderer::GetInput. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * `HgcCompositeWithMask` — the actual compositor node. Two subclasses
 * (HGComposite_LimitedDOD @vtbl 0xa21750; HGComposite_OptimizedROI @vtbl
 * 0xa219a8) share this ctor + differ by vtable + one extra i32 field.
 * Not yet transcribed @Helium 0x175131/0x175152 — factories throw citing the ctor address
 * (__ZN20HgcCompositeWithMaskC2Ev).
 */
export interface HgcCompositeWithMaskNode extends HGNode {
  /** Vtable slot *0x60 in the subclass: `SetParameter(int,float,float,float,float)`. */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): number;
}

/** Factory: allocates 0x1a0 bytes, calls HgcCompositeWithMask ctor,
 *  then overwrites vtable with HGComposite_LimitedDOD @0xa21750.
 *  Throws until HgcCompositeWithMask is transcribed
 *  @Helium __ZN20HgcCompositeWithMaskC2Ev. */
function newHGComposite_LimitedDOD(): HgcCompositeWithMaskNode {
  throw new Error(
    'HGComposite_LimitedDOD ctor not yet transcribed @Helium __ZN20HgcCompositeWithMaskC2Ev (0x175131) + vtable 0xa21750',
  );
}

/** Factory: allocates 0x1b0 bytes, calls HgcCompositeWithMask ctor,
 *  overwrites vtable with HGComposite_OptimizedROI @0xa219a8, then
 *  writes 0 at offset 0x1a0 in the new node. Throws until
 *  HgcCompositeWithMask is transcribed
 *  @Helium __ZN20HgcCompositeWithMaskC2Ev. */
function newHGComposite_OptimizedROI(): HgcCompositeWithMaskNode {
  throw new Error(
    'HGComposite_OptimizedROI ctor not yet transcribed @Helium __ZN20HgcCompositeWithMaskC2Ev (0x175152) + vtable 0xa219a8',
  );
}

/** Factory: allocates 0x1a0 bytes and calls HGOverwrite::HGOverwrite().
 *  Throws until HGOverwrite is transcribed
 *  @Helium __ZN11HGOverwriteC1Ev. */
function newHGOverwrite(): HGNode {
  throw new Error(
    'HGOverwrite::HGOverwrite not yet transcribed @Helium __ZN11HGOverwriteC1Ev (0x1751ae)',
  );
}

// ---------------------------------------------------------------------------
// HGCompositeWithMask
// ---------------------------------------------------------------------------

/**
 * `HGCompositeWithMask` — Helium node exposing two parameters and
 * building a mask-composite subgraph on `GetOutput`. Extends `HGNode`.
 */
export class HGCompositeWithMask extends HGNode {
  /**
   * @Helium 0x174f4b: zeroed by the ctor (part of a 16-byte movups).
   * Owned reference; Release()d in D2 @0x174fb5 via vcall *0x18.
   */
  cachedOutputTail: HGNode | null;

  /**
   * @Helium 0x174f4b: zeroed by the ctor movups. Set by SetParameter
   * idx==0 to `(arg1 > 0) ? 1 : 0` (see @0x175079). Read by GetOutput
   * @0x1750dc as `cmpl $1, 0x1a0(this)`. Semantic: "prefer DOD mode".
   */
  useDODPath: number;

  /**
   * @Helium 0x174f4b: zeroed by the ctor movups. Set by SetParameter
   * idx==1 to `clamp(arg1, 0.0, 1.0)` (see @0x175089-9c). Read by
   * GetOutput @0x175209 for the non-DOD (OptimizedROI) subgraph.
   */
  maskAmount: number;

  /**
   * `HGCompositeWithMask::HGCompositeWithMask()` — Helium @0x174f30 (C2)
   * and @0x174f60 (C1, identical). Chains HGNode::HGNode(), installs
   * own vtable at (this), then movups-zeroes 16 bytes @0x198 covering
   * cachedOutputTail, useDODPath, and maskAmount (plus 4 bytes of tail
   * padding to complete the SSE store).
   */
  constructor() {
    super();                                     // @Helium 0x174f39 HGNode::HGNode()
    this.vtable = 0xa214f8;                      // @Helium 0x174f45 install own vtable
    this.cachedOutputTail = null;                // @Helium 0x174f4b movups zero (0x198)
    this.useDODPath = 0;                         // @Helium 0x174f4b movups zero (0x1a0)
    this.maskAmount = 0;                         // @Helium 0x174f4b movups zero (0x1a4)
  }

  /**
   * `HGCompositeWithMask::~HGCompositeWithMask()` — Helium @0x174f90 (D2),
   * @0x174fd0 (D1, identical), @0x175010 (D0, D2 + delete). Reinstalls
   * own vtable, Release()s cachedOutputTail if present, tail-jumps to
   * HGNode::~HGNode().
   */
  destruct(): void {
    this.vtable = 0xa214f8;                      // @Helium 0x174f9d
    if (this.cachedOutputTail != null) {         // @Helium 0x174fa7
      this.cachedOutputTail.Release();           // @Helium 0x174fb5 vcall *0x18
      this.cachedOutputTail = null;
    }
    super.destruct();                            // @Helium 0x174fc1 tail-jmp HGNode::~HGNode()
  }

  /**
   * `HGCompositeWithMask::SetParameter(int idx, float a, float b, float c, float d)`
   * — Helium @0x175060.
   *
   * @returns 1 on success, -1 on unknown index. `b`, `c`, `d` are
   *          ignored by both branches (per verbatim asm).
   *
   * idx==0: sets `useDODPath = (a > 0.0f) ? 1 : 0`. Uses `ucomiss` +
   *   `seta`, which is UN-ordered-comparison → strictly greater. NaN
   *   yields false (seta clears al), matching FCP's semantics exactly.
   *
   * idx==1: sets `maskAmount = clamp(a, 0.0f, 1.0f)`. The clamp is
   *   `max(0.0f, min(1.0f, a))` — the same NaN-quiet ordering as
   *   `minss(1,a); maxss(0,minss_result)`: NaN in `a` → `minss` returns
   *   the second operand (a), then `maxss(0, NaN)` returns 0 (SSE
   *   max/min take the second-source when the compare is NaN).
   */
  SetParameter(idx: number, a: number, _b: number, _c: number, _d: number): number {
    // @Helium 0x175060: cmpl $0x1, %esi ; je 0x175085
    if (idx === 1) {
      // @Helium 0x175085..0x17509c: clamp(a, 0, 1)
      // minss %xmm0, %xmm1  where xmm1 was 1.0 → xmm1 = min(1.0, a)
      const clampedMin = Math.min(CLAMP_MAX_1F, Math.fround(a));
      // xorps xmm0,xmm0 ; maxss %xmm0, %xmm1 → xmm1 = max(0.0, minned)
      const clamped = Math.max(0.0, clampedMin);
      this.maskAmount = Math.fround(clamped);
      return 1;                                   // @Helium 0x1750a4 movl $0x1, %eax
    }
    // @Helium 0x175065: default eax = -1
    // @Helium 0x17506a..0x17506c: testl esi,esi ; jne 0x175084 (return -1)
    if (idx !== 0) {
      return -1;                                  // @Helium 0x175084 retq with eax=-1
    }
    // @Helium 0x17506e..0x17507f: idx==0 branch — set useDODPath = (a>0)?1:0.
    // `ucomiss xmm1(=0), xmm0(=a) ; seta %al` → al = (a > 0 && !NaN).
    // Reproduce with a strict-greater comparison — JavaScript `>` on
    // NaN is false, matching `seta` after ucomiss.
    this.useDODPath = (Math.fround(a) > 0) ? 1 : 0;
    return 1;                                     // @Helium 0x17507f movl $0x1, %eax
  }

  /**
   * `HGCompositeWithMask::GetOutput(HGRenderer* r)` — Helium @0x1750b0.
   *
   * Builds one of two subgraphs:
   *   DOD path (r.queryDisableDOD()==false && this.useDODPath==1):
   *     comp = new HGComposite_LimitedDOD(alloc size 0x1a0)
   *     comp.SetInput(0, r.GetInput(this,0))
   *     comp.SetInput(1, r.GetInput(this,1))
   *     comp.SetInput(2, r.GetInput(this,2))
   *     ov  = new HGOverwrite()  (alloc size 0x1a0)
   *     ov.SetInput(0, r.GetInput(this,0))
   *     ov.SetInput(1, comp)
   *     cache ov and return it
   *   Non-DOD path (otherwise):
   *     comp = new HGComposite_OptimizedROI(alloc size 0x1b0; field 0x1a0 = 0)
   *     comp.SetInput(0/1/2, ...)
   *     comp.SetParameter(0, this.maskAmount, 0, 0, 0) via vtbl *0x60
   *     cache comp and return it
   */
  GetOutput(renderer: HGRendererCtx): HGNode {
    // @Helium 0x1750c4..0x1750d0: bool cap = renderer.queryDisableDOD()
    const cap = renderer.queryDisableDOD();
    let useDOD = 0;
    if (cap) {
      // @Helium 0x1750d4: xorl %r15d, %r15d ; jmp 0x1750e5 (useDOD=0)
      useDOD = 0;
    } else {
      // @Helium 0x1750d9: cmpl $1, 0x1a0(%r14) ; sete %r15b
      useDOD = (this.useDODPath === 1) ? 1 : 0;
    }

    // @Helium 0x1750ed / 0x175101 / 0x175114: three GetInput calls, idx 0..2.
    const input0 = renderer.GetInput(this, 0);
    const input1 = renderer.GetInput(this, 1);
    const input2 = renderer.GetInput(this, 2);

    // @Helium 0x17511c..0x175161: allocate the compositor node.
    // Branch on r15b: DOD → LimitedDOD (0x1a0-byte alloc + own vtable);
    //                 non-DOD → OptimizedROI (0x1b0-byte alloc + own vtable + node[0x1a0]=0).
    let comp: HgcCompositeWithMaskNode;
    if (useDOD) {
      // @Helium 0x175121..0x17513d: LimitedDOD
      comp = newHGComposite_LimitedDOD();
    } else {
      // @Helium 0x175142..0x175161: OptimizedROI (+node[0x1a0]=0)
      comp = newHGComposite_OptimizedROI();
    }

    // @Helium 0x17516b..0x175196: three vcalls *0x78 (HGNode::SetInput)
    // on the freshly built compositor node.
    comp.SetInput(0, input0);                    // @0x175174
    comp.SetInput(1, input1);                    // @0x175185
    comp.SetInput(2, input2);                    // @0x175196

    // @Helium 0x175199: testb %r15b, %r15b ; je 0x175209 (non-DOD tail)
    if (useDOD) {
      // ---- DOD path @0x17519e..0x175207 ----
      // ov = new HGOverwrite()
      const ov = newHGOverwrite();               // @0x1751a3/0x1751ae
      // ov.SetInput(0, input0) via *0x78
      ov.SetInput(0, input0);                    // @0x1751c0
      // ov.SetInput(1, comp)  via *0x78
      ov.SetInput(1, comp);                      // @0x1751d2

      // @Helium 0x1751d5..0x1751fa: swap cachedOutputTail if differs.
      let prev = this.cachedOutputTail;
      if (prev !== ov) {
        if (prev != null) prev.Release();        // @0x1751e9 vcall *0x18
        this.cachedOutputTail = ov;              // @0x1751ec
        ov.Retain();                             // @0x1751fa vcall *0x10
      }
      // @Helium 0x1751fd..0x175204: ov.Release() (local temp)
      ov.Release();
      // @Helium 0x175207: jmp 0x17524d — falls through to shared epilogue.
    } else {
      // ---- Non-DOD path @0x175209..0x17524a ----
      // @Helium 0x175209: xmm0 = this.maskAmount
      //         0x175215: xmm1=xmm2=xmm3 = 0.0
      //         0x175223: comp.SetParameter(0, maskAmount, 0, 0, 0)  via vcall *0x60
      comp.SetParameter(0, this.maskAmount, 0, 0, 0);

      // @Helium 0x175226..0x17524a: swap cachedOutputTail if differs.
      let prev = this.cachedOutputTail;
      if (prev !== comp) {
        if (prev != null) prev.Release();        // @0x17523a vcall *0x18
        this.cachedOutputTail = comp;            // @0x17523d
        comp.Retain();                           // @0x17524a vcall *0x10
      }
    }

    // @Helium 0x17524d..0x17525d: shared epilogue —
    //   r14 = this.cachedOutputTail (reloaded — that's what we return)
    //   comp.Release() (local temp; if the swap happened it's still alive via the cache retain)
    //   return r14
    const ret = this.cachedOutputTail as HGNode;
    comp.Release();                              // @0x17525a vcall *0x18
    return ret;
  }
}
