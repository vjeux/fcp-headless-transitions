// raw-port/src/render/HGAnaglyph.ts
//
// FCP `HGAnaglyph` — Helium render-graph node that programs an
// `HgcAnaglyph` GPU compositor (stored at `this.field_0x198`) with
// three sets of parameters (opacity + left-eye 4-float tint +
// right-eye 4-float tint) and forwards the two input HGNodes as its
// input textures. The node behaves like a thin scheduler around the
// underlying `HgcAnaglyph` compositor: at `GetOutput` time it copies
// the current stored parameters into the compositor and returns it as
// the render output.
//
// Symbols decoded (Helium framework, x86_64 slice; VAs are unadjusted
// VM addresses from `otool -tV`):
//   0x6f350  HGAnaglyph::HGAnaglyph()                 [C2 base ctor]
//   0x6f430  HGAnaglyph::HGAnaglyph()                 [C1 complete ctor — tail-jmp to C2]
//   0x6f440  HGAnaglyph::~HGAnaglyph()                [D2 base dtor]
//   0x6f480  HGAnaglyph::~HGAnaglyph()                [D1 complete dtor — identical body to D2]
//   0x6f4c0  HGAnaglyph::~HGAnaglyph()                [D0 deleting dtor: reinstall vtbl; D2; ::operator delete]
//   0x6f510  HGAnaglyph::SetParameter(int, float, float, float, float)
//   0x6f620  HGAnaglyph::GetParameter(int, float*)
//   0x6f6c0  HGAnaglyph::GetOutput(HGRenderer*)
//   0x6f7b0  HGAnaglyph::GetDOD(HGRenderer*, int, HGRect)
//   0x6f830  HGAnaglyph::GetROI(HGRenderer*, int, HGRect)
//
// Vtable @Helium 0xa086d0 (RTTI header at 0xa086d0; installed pointer =
// vtable+0x10 = 0xa086e0, from `resolve.py Helium vtable HGAnaglyph`).
// Slots that this class overrides (all others inherit from HGNode):
//   *0x00 = 0x6f480  ~HGAnaglyph()   [D1 complete dtor]
//   *0x08 = 0x6f4c0  ~HGAnaglyph()   [D0 deleting dtor]
//   *0x60 = 0x6f510  SetParameter(int,float,float,float,float)
//   *0x68 = 0x6f620  GetParameter(int,float*)
// (Retain/Release/debugDescription/... all inherit from HGObject/HGNode.)
//
// STRUCT LAYOUT (recovered from C2 ctor @0x6f350 + SetParameter @0x6f510
// + GetParameter @0x6f620 + GetOutput @0x6f6c0):
//   ---- inherited from HGNode (size 0x198) ----
//     0x000..0x197 : HGNode fields (see HGNode.ts). C2 tail-calls HGNode::HGNode()
//                    (@0x6f35e callq __ZN6HGNodeC2Ev) BEFORE any own-field writes.
//   ---- HGAnaglyph-specific fields (start at 0x198) ----
//     0x198 : HgcAnaglyph*  compositor         (ctor: newed via HGObject::operator new
//                                                (arg = 0x1a0 = 416) then HgcAnaglyph::HgcAnaglyph();
//                                                stored via Release/store-new/no-Retain pattern
//                                                @0x6f39c..0x6f3b5.  D2 Releases via vtbl *0x18.)
//     0x1a0 : float         opacity            (SetParameter idx=0; GetParameter idx=0 reads it back
//                                                and writes 0 to the following 4 bytes at *rdx+0x4;
//                                                see GetParameter @0x6f637).
//     0x1a4 : float[4]      leftTintRGBA       (SetParameter idx=1 stores xmm0..xmm3 into 0x1a4/8/c/0x1b0)
//     0x1b4 : float[4]      rightTintRGBA      (SetParameter idx=2 stores xmm0..xmm3 into 0x1b4/8/c/0x1c0)
//   Sizeof(HGAnaglyph) = 0x1c4 rounded to alignment (parent HGNode + 0x2c own).
//
// Note: ctor @0x6f374-0x6f38c writes THREE `xmmps` zeros — `xorps xmm0; movups xmm0, 0x198`
// (16 bytes), `movups xmm0, 0x1a8` (16 bytes), `movups xmm0, 0x1b4` (16 bytes) — which
// collectively zero fields 0x198..0x1c3 (the union of compositor slot + opacity + both
// tints, 3x 16 bytes = 48 bytes). The compositor pointer at 0x198 is then overwritten
// by the newed HgcAnaglyph @0x6f3b5.
//
// GetOutput @0x6f6c0 (recovered verbatim, control flow mirrored below):
//   1) leftInput  = HGRenderer::GetInput(renderer, this, 0)          @0x6f6d8
//   2) rightInput = HGRenderer::GetInput(renderer, this, 1)          @0x6f6eb
//   3) compositor = this.field_0x198
//      compositor.SetInput(0, leftInput)     via vcall *0x78         @0x6f702
//   4) compositor = this.field_0x198  (reloaded from mem)
//      compositor.SetInput(1, rightInput)    via vcall *0x78         @0x6f717
//   5) compositor.SetParameter(0, opacity, 0, 0, 0)  via vcall *0x60 @0x6f737
//        (xmm0 = 0x1a0(this); xmm1=xmm2=xmm3=0 via xorps @0x6f72c/f/32)
//   6) compositor.SetParameter(1, leftTint[0..3])    via vcall *0x60 @0x6f769
//   7) compositor.SetParameter(2, rightTint[0..3])   via vcall *0x60 @0x6f79b
//   8) return this.field_0x198                                       @0x6f7af
//
// GetDOD @0x6f7b0 (recovered verbatim):
//   - if (inputIdx >= 2) return _HGRectNull                          @0x6f7b3..0x6f7c3
//   - a = HGRenderer::GetInput(renderer, this, 0)                    @0x6f7dd
//   - dodA = HGRenderer::GetDOD(renderer, a)                         @0x6f7e8
//   - b = HGRenderer::GetInput(renderer, this, 1)                    @0x6f7fe
//   - dodB = HGRenderer::GetDOD(renderer, b)                         @0x6f809
//   - return HGRectIntersection(dodA, dodB)                          @0x6f822 (tail-jmp)
//
// GetROI @0x6f830 (recovered verbatim):
//   - if (inputIdx >= 2) return _HGRectNull                          @0x6f833..0x6f843
//   - a = HGRenderer::GetInput(renderer, this, inputIdx)             @0x6f85d
//   - roiA = HGRenderer::GetDOD(renderer, a)                         @0x6f868
//   - return HGRectIntersection(roiA, callerRect)                    @0x6f883 (tail-jmp)
//
// SetParameter @0x6f510 (recovered verbatim). Argument order is
//   %esi = paramIndex,  %xmm0..%xmm3 = up to 4 floats.
//   Returns 1 if any stored field changed (which also triggers a call to
//   `HGNode::ClearBits()` @0x6f60a), 0 otherwise (including unknown idx).
//   The pair `jne <NEQ>; jnp <EQ>` after ucomiss implements "if (a==b) EQ".
//
// GetParameter @0x6f620 (recovered verbatim). %esi = paramIndex, %rdx = float* out.
//   Returns 0 on success; 0xffffffff for unknown indices (no write to *out).
//     idx==0: out[0] = opacity;    out[1]=0;             out[2]=0;             out[3]=0.
//     idx==1: out[0..3] = leftTint[0..3].
//     idx==2: out[0..3] = rightTint[0..3].
//
// DECODE-DON'T-FIT: every constant and every call in this port cites its
// address. `HgcAnaglyph` is a NOT-yet-transcribed FCP class: we import it
// through throwing stubs citing the ctor @0x6f39c so the frontier tracker
// sees the outstanding decode work. HGRenderer::GetInput and
// HGRenderer::GetDOD are similarly stubbed. HGRectIntersection IS already
// ported (see HGRect.ts) and is imported directly.

import { HGObject } from './HGObject.js';
import { HGNode } from './HGNode.js';
import { HGRect, HGRectNull, HGRectIntersection } from './HGRect.js';

// ---------------------------------------------------------------------------
// Frontier stubs: FCP classes referenced here but not yet transcribed.
// Each throws citing its @0xADDR per PORTING_SPEC.md rule 3.
// ---------------------------------------------------------------------------

/**
 * `HGRenderer` — the render-graph traversal driver. Only two methods
 * are referenced from HGAnaglyph:
 *   GetInput(HGNode* node, int idx) -> HGNode*
 *     @Helium __ZN10HGRenderer8GetInputEP6HGNodei
 *   GetDOD(HGNode* node) -> HGRect
 *     @Helium __ZN10HGRenderer6GetDODEP6HGNode
 * Neither is yet decoded.  We shape this as a thin interface here so the
 * TS compiler can typecheck the call sites; when HGRenderer is decoded
 * as a class, this interface becomes its base type.
 */
export interface HGRendererStub {
  /** @Helium 0x6f6d8 / 0x6f6eb / 0x6f7dd / 0x6f7fe / 0x6f85d — C symbol vcalled. */
  GetInput(node: HGNode, idx: number): HGNode;
  /** @Helium 0x6f7e8 / 0x6f809 / 0x6f868 — C symbol vcalled. */
  GetDOD(node: HGNode): HGRect;
}

/**
 * `HgcAnaglyph` — the underlying compositor object that HGAnaglyph owns
 * at `this.field_0x198`. NOT yet transcribed. Referenced via three
 * vtable slots:
 *   *0x10 = Retain            (inherited from HGObject)
 *   *0x18 = Release           (inherited from HGObject)
 *   *0x60 = SetParameter(u32, f32, f32, f32, f32)
 *   *0x78 = SetInput(u32 idx, HGNode* src)
 * Class ctor `HgcAnaglyph::HgcAnaglyph()` @Helium __ZN11HgcAnaglyphC1Ev
 *   — call site @0x6f39c; allocation size 0x1a0 (416) @0x6f38c.
 * Not yet transcribed.
 */
export interface HgcAnaglyph {
  /** vtable *0x60 @Helium — called from HGAnaglyph::GetOutput @0x6f737/0x6f769/0x6f79b. */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x78 @Helium — called from HGAnaglyph::GetOutput @0x6f702/0x6f717. */
  SetInput(idx: number, src: HGNode): void;
  /** vtable *0x18 @Helium — HGObject::Release, called from ctor/dtor. */
  Release(): void;
}

/**
 * Factory hook for `new HgcAnaglyph()`.
 *   %rdi = HGObject::operator new(0x1a0)  @Helium 0x6f38c/0x6f391
 *   HgcAnaglyph::HgcAnaglyph()             @Helium 0x6f39c
 * Until HgcAnaglyph is transcribed @Helium 0x6f39c, this throws citing the ctor address.
 */
function newHgcAnaglyph(): HgcAnaglyph {
  throw new Error(
    'HgcAnaglyph::HgcAnaglyph not yet transcribed @Helium 0x6f39c ' +
      '(mangled __ZN11HgcAnaglyphC1Ev); alloc size 0x1a0 @Helium 0x6f38c',
  );
}

/**
 * `HGNode::ClearBits()` — Helium @0x11f6b0 — called from
 * HGAnaglyph::SetParameter's "value changed" tail @0x6f60a. Not yet
 * transcribed in HGNode.ts @Helium 0x11f6b0 (the SetInput throw-stub there also references
 * this address). Here we throw with the same citation so the frontier
 * tracker sees the outstanding decode work.
 */
function HGNode_ClearBits(_self: HGNode): void {
  throw new Error(
    'HGNode::ClearBits not yet transcribed @Helium 0x11f6b0 ' +
      '(called from HGAnaglyph::SetParameter tail @Helium 0x6f60a)',
  );
}

// ---------------------------------------------------------------------------
// HGAnaglyph
// ---------------------------------------------------------------------------

/**
 * `HGAnaglyph` — Helium node that programs an `HgcAnaglyph` compositor
 * with (opacity, leftEyeTint, rightEyeTint) and forwards two input
 * HGNodes as its texture inputs.  Extends `HGNode`.
 *
 * @Helium ctors @0x6f350 (C2) / 0x6f430 (C1);
 *         dtors  @0x6f440 (D2) / 0x6f480 (D1) / 0x6f4c0 (D0);
 *         methods @0x6f510 SetParameter, @0x6f620 GetParameter,
 *                 @0x6f6c0 GetOutput, @0x6f7b0 GetDOD, @0x6f830 GetROI.
 */
export class HGAnaglyph extends HGNode {
  /**
   * Owned `HgcAnaglyph` compositor. Field @0x198 in the C++ layout.
   *
   * @Helium 0x6f377: initial 16-byte `xorps xmm0; movups xmm0, 0x198(%rbx)`
   *   zeros this slot as part of the wider 48-byte zero.
   * @Helium 0x6f39c: overwritten by newed HgcAnaglyph after the alloc @0x6f38c.
   * @Helium 0x6f3a1..0x6f3b5: refcount dance — old value at 0x198 (nullptr from
   *   the xorps zero) is compared to the new pointer; if different, old is
   *   Released via vtbl *0x18 (skipped since nullptr) and new is stored.
   *   NO Retain — the new object was just constructed with refcount 1.
   * @Helium 0x6f450..0x6f471 (D2): if non-null, vcall Release (*0x18) on
   *   the stored pointer, then tail-jmp HGNode::~HGNode.
   */
  compositor: HgcAnaglyph | null;

  /**
   * Opacity. Float @0x1a0. Ctor-init 0.0 (from xorps @0x6f377).
   * @Helium 0x6f53b: SetParameter idx=0 writes here.
   * @Helium 0x6f637: GetParameter idx=0 reads here.
   */
  opacity: number;

  /**
   * Left-eye tint. Four floats @0x1a4/0x1a8/0x1ac/0x1b0. Ctor-init all 0.0.
   * @Helium 0x6f588..0x6f5a0: SetParameter idx=1 stores xmm0..xmm3 here.
   * @Helium 0x6f650..0x6f676: GetParameter idx=1 reads them back.
   */
  leftTint: [number, number, number, number];

  /**
   * Right-eye tint. Four floats @0x1b4/0x1b8/0x1bc/0x1c0. Ctor-init all 0.0.
   * @Helium 0x6f5e6..0x6f5fe: SetParameter idx=2 stores xmm0..xmm3 here.
   * @Helium 0x6f680..0x6f6a6: GetParameter idx=2 reads them back.
   */
  rightTint: [number, number, number, number];

  /**
   * `HGAnaglyph::HGAnaglyph()` — Helium @0x6f350 (C2). The C1 @0x6f430
   * is a `pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp C2` trampoline so
   * both share this body.
   *
   * Asm (C2 @0x6f350, verbatim, minus exception cleanup):
   *   0x6f35e  callq __ZN6HGNodeC2Ev              ; base ctor
   *   0x6f363  leaq  0x999376(%rip), %rax         ; = 0xa086e0 (HGAnaglyph installed vtable ptr)
   *   0x6f36a  movq  %rax, (%rbx)                 ; *this = HGAnaglyph vtable
   *   0x6f36d  leaq  0x198(%rbx), %r12            ; r12 = &this.compositor
   *   0x6f374  xorps %xmm0, %xmm0                 ; xmm0 = 0
   *   0x6f377  movups %xmm0, 0x198(%rbx)          ; zero {compositor, opacity, leftTint[0]}
   *   0x6f37e  movups %xmm0, 0x1a8(%rbx)          ; zero {leftTint[1..3], rightTint[0]}
   *   0x6f385  movups %xmm0, 0x1b4(%rbx)          ; zero {rightTint[0..3]}
   *   0x6f38c  movl   $0x1a0, %edi                ; edi = 416 = sizeof(HgcAnaglyph)
   *   0x6f391  callq __ZN8HGObjectnwEm            ; HGObject::operator new(416)
   *   0x6f396  movq   %rax, %r14                  ; r14 = raw storage
   *   0x6f399  movq   %rax, %rdi
   *   0x6f39c  callq __ZN11HgcAnaglyphC1Ev        ; HgcAnaglyph::HgcAnaglyph()
   *   0x6f3a1  movq   (%r12), %rdi                ; rdi = old this.compositor (nullptr)
   *   0x6f3a5  cmpq   %r14, %rdi
   *   0x6f3a8  je     0x6f3bb                     ; if (old == new)  skip Release-old, Release-new
   *   0x6f3aa  testq  %rdi, %rdi
   *   0x6f3ad  je     0x6f3b5                     ; if (old == null) skip Release
   *   0x6f3af  movq   (%rdi), %rax                ; load vtbl(old)
   *   0x6f3b2  callq  *0x18(%rax)                 ; old.Release()
   *   0x6f3b5  movq   %r14, (%r12)                ; this.compositor = new
   *   0x6f3b9  jmp    0x6f3c9                     ; done
   *   0x6f3bb  testq  %r14, %r14
   *   0x6f3be  je     0x6f3c9                     ; if (new == null) done
   *   0x6f3c0  movq   (%r14), %rax
   *   0x6f3c3  movq   %r14, %rdi
   *   0x6f3c6  callq  *0x18(%rax)                 ; new.Release()  ← self-cancellation
   *   0x6f3c9  ret
   */
  constructor() {
    // @Helium 0x6f35e: HGNode base ctor
    super();
    // @Helium 0x6f36a: install this class's vtable (documented, not modeled functionally)
    this.vtable = 0xa086e0;
    // @Helium 0x6f374..0x6f385: three xorps/movups zeros for the 48 bytes 0x198..0x1c3.
    this.compositor = null;
    this.opacity = Math.fround(0.0);
    this.leftTint = [Math.fround(0.0), Math.fround(0.0), Math.fround(0.0), Math.fround(0.0)];
    this.rightTint = [Math.fround(0.0), Math.fround(0.0), Math.fround(0.0), Math.fround(0.0)];
    // @Helium 0x6f38c..0x6f39c: alloc + HgcAnaglyph::HgcAnaglyph() (throws until decoded)
    const newComp = newHgcAnaglyph();
    // @Helium 0x6f3a1..0x6f3b5: Release-old-if-nonnull-and-different + store new.
    if ((this.compositor as HgcAnaglyph | null) !== newComp) {
      if (this.compositor != null) {
        // vcall *0x18 = HGObject::Release (inherited).
        (this.compositor as HgcAnaglyph).Release();
      }
      this.compositor = newComp;
    } else {
      // @Helium 0x6f3bb..0x6f3c6: `je 0x6f3bb` path — old == new. Release-new
      // (self-cancellation) if new is non-null.
      if (newComp != null) {
        (newComp as HgcAnaglyph).Release();
      }
    }
  }

  /**
   * `HGAnaglyph::~HGAnaglyph()` — Helium @0x6f440 (D2), @0x6f480 (D1,
   * identical body); @0x6f4c0 (D0) additionally invokes
   * `HGObject::operator delete` at the end.
   *
   * Asm (D2 @0x6f440, verbatim, minus exception handlers):
   *   0x6f446  leaq 0x999293(%rip), %rax    ; = 0xa086e0 (own vtable installed ptr)
   *   0x6f44d  movq %rax, (%rdi)            ; reinstall (dtor invariant)
   *   0x6f450  movq 0x198(%rdi), %rax       ; load compositor
   *   0x6f457  testq %rax, %rax
   *   0x6f45a  je   0x6f46b                 ; skip if null
   *   0x6f45c  movq (%rax), %rcx            ; load vtbl
   *   0x6f462  movq %rax, %rdi
   *   0x6f465  callq *0x18(%rcx)            ; compositor.Release()
   *   0x6f471  jmp __ZN6HGNodeD2Ev          ; tail-call base dtor
   *
   * (D1 body @0x6f480 is byte-identical; D0 @0x6f4c0 adds
   *  `callq __ZN8HGObjectdlEPv` after the base-dtor tail.)
   */
  destruct(): void {
    // @Helium 0x6f446..0x6f44d: vtable reinstall — modeled by assignment.
    this.vtable = 0xa086e0;
    // @Helium 0x6f450..0x6f465: Release compositor if present.
    if (this.compositor != null) {
      this.compositor.Release();
      this.compositor = null;
    }
    // @Helium 0x6f471: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGAnaglyph::SetParameter(int idx, float a, float b, float c, float d)`
   * — Helium @0x6f510.  Vtable slot *0x60 (overrides HGNode::SetParameter).
   *
   * Returns 1 if any stored field changed (also calls HGNode::ClearBits()
   * @0x6f60a), 0 otherwise (including unknown idx).
   *
   * Asm dispatch:
   *   idx==0: opacity path — early-out if new == stored (ucomiss + jne/jnp).
   *   idx==1: leftTint path — early-out iff all 4 floats equal the stored.
   *   idx==2: rightTint path — same shape as idx==1 but on rightTint.
   *   else:   fall through to `retq` @0x6f615 with eax=0.
   *
   * Note on ucomiss semantics (@0x6f530..):
   *   `jne <NEQ>; jnp <EQ>` reads as "equal iff ZF=1 and PF=0" — i.e.
   *   values compare equal AND neither is NaN. In JS, wrapping both sides
   *   through Math.fround and using `===` yields the same result (NaN
   *   !== NaN in JS, matching ucomiss's unordered-flag behavior).
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): number {
    // @Helium 0x6f510: xorl %eax, %eax — initial retval = 0.
    let ret = 0;
    // @Helium 0x6f512..0x6f51e: cmpl+je dispatch on idx.
    if (idx === 0) {
      // @Helium 0x6f528..0x6f535: opacity early-out.
      const newA = Math.fround(a);
      if (!(this.opacity === newA)) {
        // @Helium 0x6f53b: movss %xmm0, 0x1a0(%rdi) — opacity = newA
        this.opacity = newA;
        // @Helium 0x6f543 -> 0x6f606: ClearBits + eax=1 + ret
        HGNode_ClearBits(this);
        ret = 1;
      }
    } else if (idx === 1) {
      // @Helium 0x6f548..0x6f582: leftTint 4-way ucomiss chain.
      const na = Math.fround(a);
      const nb = Math.fround(b);
      const nc = Math.fround(c);
      const nd = Math.fround(d);
      const allEqual =
        this.leftTint[0] === na &&
        this.leftTint[1] === nb &&
        this.leftTint[2] === nc &&
        this.leftTint[3] === nd;
      if (!allEqual) {
        // @Helium 0x6f588..0x6f5a0: store all 4 floats.
        this.leftTint[0] = na;
        this.leftTint[1] = nb;
        this.leftTint[2] = nc;
        this.leftTint[3] = nd;
        // @Helium 0x6f5a8 -> 0x6f606: ClearBits + eax=1 + ret
        HGNode_ClearBits(this);
        ret = 1;
      }
    } else if (idx === 2) {
      // @Helium 0x6f5aa..0x6f5e4: rightTint 4-way ucomiss chain.
      const na = Math.fround(a);
      const nb = Math.fround(b);
      const nc = Math.fround(c);
      const nd = Math.fround(d);
      const allEqual =
        this.rightTint[0] === na &&
        this.rightTint[1] === nb &&
        this.rightTint[2] === nc &&
        this.rightTint[3] === nd;
      if (!allEqual) {
        // @Helium 0x6f5e6..0x6f5fe: store all 4 floats.
        this.rightTint[0] = na;
        this.rightTint[1] = nb;
        this.rightTint[2] = nc;
        this.rightTint[3] = nd;
        // fall through to 0x6f606: ClearBits + eax=1 + ret
        HGNode_ClearBits(this);
        ret = 1;
      }
    }
    // else: idx is unknown — @Helium 0x6f615 return with eax=0.
    return ret;
  }

  /**
   * `HGAnaglyph::GetParameter(int idx, float* out)` — Helium @0x6f620.
   * Vtable slot *0x68 (overrides HGNode::GetParameter).
   *
   * Returns 0 on success; 0xffffffff (as u32; -1 as i32) for unknown idx
   * (in which case *out is NOT written).
   *
   * The `float* out` semantics: in TS we take a 4-slot tuple and mutate
   * it in place.  Asm dispatch:
   *   idx==0: out = [opacity, 0, 0, 0].  @0x6f637..0x6f64e -> tail @0x6f6ae.
   *     - @0x6f637 movss %xmm0,(%rdx)         out[0] = opacity
   *     - @0x6f643 movq $0, 0x4(%rdx)         out[1] = 0.0, out[2] = 0.0 (8 zero bytes)
   *     - @0x6f64b xorps %xmm0, %xmm0         xmm0 = 0.0
   *     - @0x6f6ae movss %xmm0, 0xc(%rdx)     out[3] = 0.0
   *   idx==1: out[0..3] = leftTint[0..3].  @0x6f650..0x6f676 -> tail @0x6f6ae.
   *   idx==2: out[0..3] = rightTint[0..3]. @0x6f680..0x6f6a6 -> tail @0x6f6ae.
   *   else:   `movl $0xffffffff, %eax; jne 0x6f6b5` @0x6f62e..0x6f635 — return -1
   *           without touching *out.
   */
  GetParameter(idx: number, out: [number, number, number, number]): number {
    if (idx === 0) {
      // @Helium 0x6f637..0x6f6ae: opacity path.
      out[0] = this.opacity;
      out[1] = Math.fround(0);
      out[2] = Math.fround(0);
      out[3] = Math.fround(0);
      return 0; // @Helium 0x6f6b3
    } else if (idx === 1) {
      // @Helium 0x6f650..0x6f6ae: leftTint path.
      out[0] = this.leftTint[0];
      out[1] = this.leftTint[1];
      out[2] = this.leftTint[2];
      out[3] = this.leftTint[3];
      return 0;
    } else if (idx === 2) {
      // @Helium 0x6f680..0x6f6ae: rightTint path.
      out[0] = this.rightTint[0];
      out[1] = this.rightTint[1];
      out[2] = this.rightTint[2];
      out[3] = this.rightTint[3];
      return 0;
    }
    // @Helium 0x6f62e..0x6f635: unknown idx -> return -1 (0xffffffff) w/o writing *out.
    return 0xffffffff | 0;
  }

  /**
   * `HGAnaglyph::GetOutput(HGRenderer* renderer)` — Helium @0x6f6c0.
   * Programs the compositor with the current parameters and returns it.
   *
   * Asm (verbatim, minus the frame pointer plumbing):
   *   0x6f6d8 leftInput  = HGRenderer::GetInput(renderer, this, 0)
   *   0x6f6eb rightInput = HGRenderer::GetInput(renderer, this, 1)
   *   0x6f6f3 rdi = compositor
   *   0x6f702 callq *0x78(vtbl)                     ; SetInput(0, leftInput)
   *   0x6f705 rdi = compositor (reload)
   *   0x6f717 callq *0x78(vtbl)                     ; SetInput(1, rightInput)
   *   0x6f71a rdi = compositor
   *   0x6f721 xmm0 = 0x1a0(rbx)                     ; opacity
   *   0x6f72c/f/32 xorps xmm1, xmm2, xmm3
   *   0x6f735 esi = 0
   *   0x6f737 callq *0x60(vtbl)                     ; SetParameter(0, opacity, 0, 0, 0)
   *   0x6f741..0x6f759 xmm0..xmm3 = leftTint[0..3]
   *   0x6f764 esi = 1
   *   0x6f769 callq *0x60(vtbl)                     ; SetParameter(1, leftTint...)
   *   0x6f773..0x6f78b xmm0..xmm3 = rightTint[0..3]
   *   0x6f796 esi = 2
   *   0x6f79b callq *0x60(vtbl)                     ; SetParameter(2, rightTint...)
   *   0x6f79e rax = compositor
   *   0x6f7af ret
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x6f6d8
    const leftInput  = renderer.GetInput(this, 0);
    // @Helium 0x6f6eb
    const rightInput = renderer.GetInput(this, 1);

    // @Helium 0x6f6f3..0x6f717
    const comp = this.compositor;
    if (comp == null) {
      // The asm makes no null-check — a null-composited HGAnaglyph would
      // segfault. TS: throw a decode-cited error so it's a loud gap.
      throw new Error(
        'HGAnaglyph::GetOutput @Helium 0x6f6f3: this.compositor is null; ' +
          'the C++ path unconditionally dereferences it (no NPE guard @0x6f6fa).',
      );
    }
    comp.SetInput(0, leftInput);   // @Helium 0x6f702 vcall *0x78
    comp.SetInput(1, rightInput);  // @Helium 0x6f717 vcall *0x78

    // @Helium 0x6f721..0x6f737: SetParameter(0, opacity, 0, 0, 0)
    comp.SetParameter(0, this.opacity, Math.fround(0), Math.fround(0), Math.fround(0));

    // @Helium 0x6f741..0x6f769: SetParameter(1, leftTint[0..3])
    comp.SetParameter(
      1,
      this.leftTint[0],
      this.leftTint[1],
      this.leftTint[2],
      this.leftTint[3],
    );

    // @Helium 0x6f773..0x6f79b: SetParameter(2, rightTint[0..3])
    comp.SetParameter(
      2,
      this.rightTint[0],
      this.rightTint[1],
      this.rightTint[2],
      this.rightTint[3],
    );

    // @Helium 0x6f79e: return this.compositor.  In the C++ ABI HgcAnaglyph
    // is an HGObject subclass (not HGNode), but the caller of GetOutput
    // treats the result as an opaque HGNode-shaped output. Cast is
    // faithful to the untyped pointer return in asm.
    return comp as unknown as HGNode;
  }

  /**
   * `HGAnaglyph::GetDOD(HGRenderer* renderer, int inputIdx, HGRect callerRect)`
   * — Helium @0x6f7b0.
   *
   * Asm (verbatim):
   *   0x6f7b0 cmpl $0x2, %edx; jl 0x6f7c4
   *   0x6f7b5..0x6f7c3 if (inputIdx >= 2) return _HGRectNull
   *   0x6f7dd a    = HGRenderer::GetInput(renderer, this, 0)   ; xorl %edx forces idx=0
   *   0x6f7e8 dodA = HGRenderer::GetDOD(renderer, a)
   *   0x6f7fe b    = HGRenderer::GetInput(renderer, this, 1)   ; movl $0x1,%edx forces idx=1
   *   0x6f809 dodB = HGRenderer::GetDOD(renderer, b)
   *   0x6f822 return HGRectIntersection(dodA, dodB)            ; tail-jmp
   *
   * The `callerRect` fourth arg is NOT used in the compute path — it's
   * present in the ABI but this method's body doesn't reference it.
   */
  GetDOD(renderer: HGRendererStub, inputIdx: number, _callerRect: HGRect): HGRect {
    // @Helium 0x6f7b0..0x6f7c3
    if (inputIdx >= 2) {
      return HGRectNull;
    }
    // @Helium 0x6f7dd/0x6f7e8
    const a = renderer.GetInput(this, 0);
    const dodA = renderer.GetDOD(a);
    // @Helium 0x6f7fe/0x6f809
    const b = renderer.GetInput(this, 1);
    const dodB = renderer.GetDOD(b);
    // @Helium 0x6f822
    return HGRectIntersection(dodA, dodB);
  }

  /**
   * `HGAnaglyph::GetROI(HGRenderer* renderer, int inputIdx, HGRect callerRect)`
   * — Helium @0x6f830.
   *
   * Asm (verbatim):
   *   0x6f830 cmpl $0x2, %edx; jl 0x6f844
   *   0x6f835..0x6f843 if (inputIdx >= 2) return _HGRectNull
   *   0x6f85d a    = HGRenderer::GetInput(renderer, this, inputIdx)
   *          ↑ NOTE: unlike GetDOD, %rdx is NOT zeroed — caller's inputIdx flows through.
   *   0x6f868 dodA = HGRenderer::GetDOD(renderer, a)
   *   0x6f883 return HGRectIntersection(dodA, callerRect)   ; tail-jmp
   */
  GetROI(renderer: HGRendererStub, inputIdx: number, callerRect: HGRect): HGRect {
    // @Helium 0x6f830..0x6f843
    if (inputIdx >= 2) {
      return HGRectNull;
    }
    // @Helium 0x6f85d
    const a = renderer.GetInput(this, inputIdx);
    // @Helium 0x6f868
    const dodA = renderer.GetDOD(a);
    // @Helium 0x6f883
    return HGRectIntersection(dodA, callerRect);
  }
}

// Ensure HGObject is imported at type-usage granularity (compositor Release
// vcall referenced the interface directly, so no runtime HGObject binding
// is used in the emitted JS; but keep the symbol referenced so tsc doesn't
// prune it and so provenance for the *0x18 vcall citation is anchored.)
void HGObject;
