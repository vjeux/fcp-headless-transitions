// raw-port/src/render/HGBlackWhiteRestore.ts
//
// FCP `HGBlackWhiteRestore` — Helium render-graph node that restores
// black/white "safe-clip" limits around an upstream node's output.
// GetOutput builds a small subgraph:
//
//     input ─► HGColorConform(sRGB→sRGB with Rec709-γ→Linear)
//            ─► HGColorClamp(min=blackValue.., max=whiteValue..)
//            ─► HGColorConform(Linear→Rec709-γ)   ← stored on `this.field_0x198`
//
// Symbols decoded (Helium framework, x86_64 slice; VAs are unadjusted
// VM addresses from `otool -tV`):
//   0x1c8ca0  HGBlackWhiteRestore::HGBlackWhiteRestore()      [C2 base ctor]
//   0x1c8ce0  HGBlackWhiteRestore::HGBlackWhiteRestore()      [C1 complete ctor — identical body]
//   0x1c8d20  HGBlackWhiteRestore::~HGBlackWhiteRestore()     [D2 base dtor]
//   0x1c8d60  HGBlackWhiteRestore::~HGBlackWhiteRestore()     [D1 complete dtor — identical body]
//   0x1c8da0  HGBlackWhiteRestore::~HGBlackWhiteRestore()     [D0 deleting dtor: D2+HGObject::operator delete]
//   0x1c8df0  HGBlackWhiteRestore::SetBlackWhiteValue(float, float)
//   0x1c8e10  HGBlackWhiteRestore::GetOutput(HGRenderer*)
//
// Vtable @Helium 0xa29a38 (RTTI header at 0xa29a28; installed pointer =
// vtable+0x10 = 0xa29a48). Slots inherited unchanged from HGNode/HGObject
// except D1/D0 which are this-class's own:
//   *0x00 = 0x1c8d60  ~HGBlackWhiteRestore()   [D1 complete dtor]
//   *0x08 = 0x1c8da0  ~HGBlackWhiteRestore()   [D0 deleting dtor]
//   (other slots inherit from HGNode; not re-decoded here.)
//
// STRUCT LAYOUT (recovered from C2 ctor @0x1c8ca0 + D2 dtor @0x1c8d20 +
// SetBlackWhiteValue @0x1c8df0 + GetOutput @0x1c8e10):
//   ---- inherited from HGNode (size 0x198) ----
//     0x000..0x197 : HGNode fields (see HGNode.ts). C2 tail-calls HGNode::HGNode()
//                    (@0x1c8ca9 callq __ZN6HGNodeC2Ev) BEFORE any own-field writes.
//   ---- HGBlackWhiteRestore-specific fields (start at 0x198) ----
//     0x198 : HGColorConform*  cachedOutputTail    (ctor: $0; owned; Released
//                                                    in D2 via vtbl *0x18)
//     0x1a0 : float            blackValue           (ctor: reads a movsd double
//                                                    @0x85ef00 whose low  4 bytes
//                                                    are 0x7f7fffff = FLT_MAX)
//     0x1a4 : float            whiteValue           (ctor: same movsd's high 4
//                                                    bytes = 0x00800000 = FLT_MIN)
//   sizeof(HGBlackWhiteRestore) = 0x1a8 bytes (0x1a0 + 8-byte tail padding).
//
// The movsd @0x1c8cc3 loads the 8-byte quad at 0x85ef00 = 0x7f7fffff00800000
// (little-endian bytes: ff ff 7f 7f 00 00 80 00). That single 8-byte store
// initialises BOTH floats atomically:
//   [0x1a0] = 0x7f7fffff  (float = +FLT_MAX = 3.4028234663852886e+38)
//   [0x1a4] = 0x00800000  (float = +FLT_MIN = 1.1754943508222875e-38)
//
// SetBlackWhiteValue @0x1c8df0 (recovered verbatim):
//   movss %xmm0, 0x1a0(%rdi)   ; blackValue = arg0
//   movss %xmm1, 0x1a4(%rdi)   ; whiteValue = arg1
//   ret
// So the argument order is `(black, white)`, storing black at the LOW
// offset (0x1a0). Note the ctor initialises black=FLT_MAX, white=FLT_MIN —
// i.e. "no clamp" until the caller explicitly sets a range.
//
// GetOutput @0x1c8e10 (recovered verbatim, control flow mirrored below):
//   1) inputNode = HGRenderer::GetInput(renderer, this, /*idx*/0)         @0x1c8e29
//   2) conform1 = new HGColorConform()                                    @0x1c8e36/e41
//        (allocated via HGObject::operator new(0x370) — 880 bytes; ctor at 0x1c8e41)
//   3) conform1.SetInput(0, inputNode)     via vcall *0x78(vtbl)          @0x1c8e51
//   4) conform1.SetConversion(
//        srcPrimaries    = 0                                              (edx=$0)
//        srcTransfer     = 8                                              (r8=$0? — read from asm)
//        srcMatrix       = 0                                              (r9=$1)
//        dstPrimaries    = 0                                              (rsp mem =$1)
//        dstTransfer     = 0
//        dstMatrix       = 0)
//      Actual register layout at 0x1c8e5b..1c8e70:
//        rdi = conform1
//        esi = 0                        ← srcPrimaries
//        edx = 8                        ← srcTransfer
//        ecx = 0                        ← srcMatrix
//        r8d = 0                        ← dstPrimaries
//        r9d = 1                        ← dstTransfer
//        (rsp) memory arg = 1           ← dstMatrix    (movl $0x1,(%rsp))
//      i.e. HGColorConform::SetConversion(0, 8, 0, 0, 1, 1).             @0x1c8e70
//      NOTE: enum names per demangled symbol:
//        arg1 = HGColorGamma::hgColorGammaColorPrimaries       (src)
//        arg2 = HGColorGamma::hgColorGammaTransferFunction     (src)
//        arg3 = HGColorGamma::hgColorGammaMatrixCoefficients   (src)
//        arg4/5/6 = ditto (dst).
//   5) clamp = new HGColorClamp()                                         @0x1c8e7a/e85
//        (allocated 0x1c0 = 448 bytes; ctor at 0x1c8e85)
//   6) clamp.SetInput(0, conform1)         via vcall *0x78(vtbl)          @0x1c8e95
//   7) clamp.SetClampMaxValues(                                            @0x1c8eb2
//        whiteValue,                       ← movss 0x1a4(%r15),%xmm0
//        FLT_MAX,                          ← movss @0x3cb6b0,%xmm1
//        FLT_MAX,                          ← xmm2 = xmm1
//        FLT_MAX)                          ← xmm3 = xmm1
//   8) clamp.SetClampMinValues(                                            @0x1c8ed1
//        blackValue,                       ← movss 0x1a0(%r15),%xmm0
//        FLT_MIN,                          ← movss @0x85ef10,%xmm1
//        FLT_MIN,                          ← xmm2 = xmm1
//        FLT_MIN)                          ← xmm3 = xmm1
//   9) conform2 = new HGColorConform()                                    @0x1c8edb/ee6
//  10) conform2.SetInput(0, clamp)        via vcall *0x78(vtbl)          @0x1c8ef7
//  11) conform2.SetConversion(0, 1, 1, 0, 8, 0)                          @0x1c8f19
//        rdi = conform2
//        esi = 0                        ← src primaries
//        edx = 1                        ← src transfer
//        ecx = 1                        ← src matrix (WAIT — arg3 is srcMatrix)
//        r8d = 0                        ← dst primaries
//        r9d = 8                        ← dst transfer
//        (rsp) memory arg = 0           ← dst matrix
//      i.e. SetConversion(0, 1, 1, 0, 8, 0)
//        — the "inverse" of step 4 (linear-→γ instead of γ→linear).
//  12) prev = this.field_0x198  (r13 = qword at 0x198(%r15))               @0x1c8f1e
//        If (prev != conform2)  — i.e. cache slot differs from new tail:
//          if (prev != null) prev.Release()   via vtbl *0x18                @0x1c8f36
//          this.field_0x198 = conform2                                     @0x1c8f39
//          conform2.Retain()                    via vtbl *0x10              @0x1c8f47
//          r13 = new this.field_0x198 = conform2
//  13) conform2.Release()                        via vtbl *0x18             @0x1c8f58
//  14) clamp.Release()                           via vtbl *0x18             @0x1c8f61
//  15) conform1.Release()                        via vtbl *0x18             @0x1c8f6a
//  16) return r13   (the retained cached tail, which IS conform2 after the swap)
//
// DECODE-DON'T-FIT: every constant and every call in this port cites its
// address; no numeric literal is invented. The three sub-nodes we
// instantiate (HGColorConform, HGColorClamp, HGRenderer::GetInput) are
// NOT yet transcribed as full classes in this port — we import through
// throwing stubs that cite their addresses so the frontier tracker
// sees the outstanding decode work. The graph-topology and refcount
// dance mirror the asm one-for-one.

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Provenance-cited constants (all read from the Helium x86_64 slice).
// ---------------------------------------------------------------------------

/**
 * FLT_MAX as an IEEE-754 single = 0x7f7fffff = 3.4028234663852886e+38.
 * Loaded by `movss 0x202807(%rip), %xmm1` @Helium 0x1c8ea1 →
 * next-instr 0x1c8ea9 + 0x202807 = 0x3cb6b0 (in __TEXT,__const of Helium).
 */
const FLT_MAX = 3.4028234663852886e+38;

/**
 * FLT_MIN as an IEEE-754 single = 0x00800000 = 1.1754943508222875e-38
 * (smallest positive normal). Loaded by `movss 0x696048(%rip), %xmm1`
 * @Helium 0x1c8ec0 → next-instr 0x1c8ec8 + 0x696048 = 0x85ef10.
 */
const FLT_MIN = 1.1754943508222875e-38;

/**
 * Ctor initializer quad — loaded by `movsd 0x696235(%rip), %xmm0` @Helium
 * 0x1c8cc3 → next-instr 0x1c8ccb + 0x696235 = 0x85ef00, whose 8 raw bytes
 * are `ff ff 7f 7f 00 00 80 00` = concatenated (FLT_MAX_bits | FLT_MIN_bits).
 * The subsequent `movsd %xmm0, 0x1a0(%rbx)` stores those 8 bytes into
 * fields 0x1a0 (float blackValue = FLT_MAX) and 0x1a4 (float whiteValue = FLT_MIN).
 * Documented here as a pair for provenance; the TS port assigns them
 * as two separate float fields (see the ctor below).
 */
const CTOR_INIT_BLACK = FLT_MAX;
const CTOR_INIT_WHITE = FLT_MIN;

// ---------------------------------------------------------------------------
// Stubs for as-yet-undecoded FCP classes referenced by GetOutput.
// Each stub throws with the exact @0xADDR to be transcribed later, so
// frontier.py can enumerate the outstanding work. NEVER approximate.
// ---------------------------------------------------------------------------

/**
 * `HGRenderer::GetInput(HGNode*, int)` @Helium __ZN10HGRenderer8GetInputEP6HGNodei.
 * Address to be filled in when HGRenderer is decoded.
 */
export interface HGRendererStub {
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * `HGColorConform` — Helium node applying a color-space conversion.
 * Vtable slots referenced from GetOutput:
 *   *0x10 = Retain           (inherited from HGObject)
 *   *0x18 = Release          (inherited from HGObject)
 *   *0x78 = SetInput(i,src)  (inherited from HGNode)
 * Class ctor @Helium __ZN14HGColorConformC1Ev — not yet transcribed.
 * Class method SetConversion @Helium
 *   __ZN14HGColorConform13SetConversionEN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionENS0_30hgColorGammaMatrixCoefficientsES1_S2_S3_
 *   — not yet transcribed.
 */
export interface HGColorConform extends HGNode {
  SetConversion(
    srcPrimaries: number, srcTransfer: number, srcMatrix: number,
    dstPrimaries: number, dstTransfer: number, dstMatrix: number,
  ): void;
}

/**
 * `HGColorClamp` — Helium node clamping input per-channel to [min,max].
 * Vtable slots referenced from GetOutput:
 *   *0x10 = Retain     (inherited)
 *   *0x18 = Release    (inherited)
 *   *0x78 = SetInput   (inherited)
 * Class ctor @Helium __ZN12HGColorClampC1Ev — not yet transcribed.
 * Class methods
 *   __ZN12HGColorClamp17SetClampMaxValuesEffff   (r,g,b,a maxima)
 *   __ZN12HGColorClamp17SetClampMinValuesEffff   (r,g,b,a minima)
 *   — not yet transcribed.
 */
export interface HGColorClamp extends HGNode {
  SetClampMaxValues(a: number, b: number, c: number, d: number): void;
  SetClampMinValues(a: number, b: number, c: number, d: number): void;
}

/**
 * Factory hook for `new HGColorConform()` — the C++ path is:
 *   %rdi = HGObject::operator new(0x370)   @Helium 0x1c8e36 (or 0x1c8eda)
 *   HGColorConform::HGColorConform()       @Helium 0x1c8e41 (or 0x1c8ee6)
 * Until HGColorConform is transcribed @Helium 0x1c8e41 / 0x1c8ee6, this
 * throws citing the ctor address.
 */
function newHGColorConform(): HGColorConform {
  throw new Error(
    'HGColorConform::HGColorConform not yet transcribed @Helium __ZN14HGColorConformC1Ev',
  );
}

/**
 * Factory hook for `new HGColorClamp()` — the C++ path is:
 *   %rdi = HGObject::operator new(0x1c0)   @Helium 0x1c8e7a
 *   HGColorClamp::HGColorClamp()           @Helium 0x1c8e85
 * Until HGColorClamp is transcribed @Helium 0x1c8e85, this throws citing
 * the ctor address.
 */
function newHGColorClamp(): HGColorClamp {
  throw new Error(
    'HGColorClamp::HGColorClamp not yet transcribed @Helium __ZN12HGColorClampC1Ev',
  );
}

// ---------------------------------------------------------------------------
// HGBlackWhiteRestore
// ---------------------------------------------------------------------------

/**
 * `HGBlackWhiteRestore` — Helium node that inserts a black-white "safe
 * range restore" (γ→linear → clamp → linear→γ) subgraph around an
 * upstream input node's output. Extends `HGNode`.
 *
 * @Helium ctor @0x1c8ca0/0x1c8ce0 (C2/C1 identical), dtors @0x1c8d20/
 * 0x1c8d60/0x1c8da0 (D2/D1/D0), methods @0x1c8df0 SetBlackWhiteValue,
 * @0x1c8e10 GetOutput.
 */
export class HGBlackWhiteRestore extends HGNode {
  /**
   * Cached tail node of the (conform → clamp → conform) subgraph built
   * by GetOutput. Owned reference: `this.field_0x198`.
   *
   * @Helium 0x1c8cb8: movq $0x0, 0x198(%rbx)     ; ctor init to null
   * @Helium 0x1c8d30..0x1c8d51 (D2): if non-null, vcall Release (*0x18)
   *   on the stored pointer, then tail-jmp HGNode::~HGNode.
   * @Helium 0x1c8f39: this.field_0x198 = new conform2
   */
  cachedOutputTail: HGColorConform | null;

  /**
   * "Black" floor — used as the R-channel minimum when the safe-clip
   * subgraph is built. Field @0x1a0 in the C++ layout.
   *
   * @Helium 0x1c8cc3 (movsd load 0x7f7fffff00800000) then movsd store
   * @0x1c8ccb: initial value = FLT_MAX (i.e. no floor).
   * @Helium 0x1c8df4: SetBlackWhiteValue writes arg0 here.
   */
  blackValue: number;

  /**
   * "White" ceiling — used as the R-channel maximum when the safe-clip
   * subgraph is built. Field @0x1a4 in the C++ layout.
   *
   * @Helium 0x1c8cc3 (same movsd as blackValue): initial value = FLT_MIN
   *   (i.e. no ceiling).
   * @Helium 0x1c8dfc: SetBlackWhiteValue writes arg1 here.
   */
  whiteValue: number;

  /**
   * `HGBlackWhiteRestore::HGBlackWhiteRestore()` — Helium @0x1c8ca0 (C2)
   * and @0x1c8ce0 (C1, identical body).
   *
   * Asm (C2 @0x1c8ca0, verbatim):
   *   0x1c8ca9  callq __ZN6HGNodeC2Ev         ; base ctor
   *   0x1c8cae  leaq  0x860d93(%rip), %rax    ; = 0xa29a48 (this-class installed vtable)
   *   0x1c8cb5  movq  %rax, (%rbx)            ; *this = own vtable
   *   0x1c8cb8  movq  $0x0, 0x198(%rbx)       ; cachedOutputTail = null
   *   0x1c8cc3  movsd 0x696235(%rip), %xmm0   ; load 8-byte quad @0x85ef00
   *   0x1c8ccb  movsd %xmm0, 0x1a0(%rbx)      ; store both floats atomically
   *   0x1c8cd3  ret
   */
  constructor() {
    // @Helium 0x1c8ca9: HGNode base ctor
    super();
    // @Helium 0x1c8cb5: install this class's vtable (documented, not modeled functionally)
    this.vtable = 0xa29a48;
    // @Helium 0x1c8cb8: cachedOutputTail = null
    this.cachedOutputTail = null;
    // @Helium 0x1c8cc3..0x1c8ccb: single 8-byte movsd init of {black,white}
    this.blackValue = CTOR_INIT_BLACK;
    this.whiteValue = CTOR_INIT_WHITE;
  }

  /**
   * `HGBlackWhiteRestore::~HGBlackWhiteRestore()` — Helium @0x1c8d20 (D2)
   * and @0x1c8d60 (D1, identical body); @0x1c8da0 (D0) additionally
   * invokes `HGObject::operator delete` at the end.
   *
   * Asm (D2 @0x1c8d20, verbatim, minus the exception handlers):
   *   0x1c8d26  leaq 0x860d1b(%rip), %rax   ; = 0xa29a48 (own vtable)
   *   0x1c8d2d  movq %rax, (%rdi)           ; reinstall (dtor invariant)
   *   0x1c8d30  movq 0x198(%rdi), %rax      ; load cachedOutputTail
   *   0x1c8d37  testq %rax, %rax
   *   0x1c8d3a  je   0x1c8d4b               ; skip if null
   *   0x1c8d3c  movq (%rax), %rcx           ; load vtbl
   *   0x1c8d42  movq %rax, %rdi
   *   0x1c8d45  callq *0x18(%rcx)           ; Release()
   *   0x1c8d51  jmp __ZN6HGNodeD2Ev         ; tail-call base dtor
   *
   * TS mirror: Release-if-non-null then super.destruct().
   */
  destruct(): void {
    // @Helium 0x1c8d26..0x1c8d2d: vtable reinstall — modeled by assignment.
    this.vtable = 0xa29a48;
    // @Helium 0x1c8d30..0x1c8d45: Release cachedOutputTail if present.
    if (this.cachedOutputTail != null) {
      // vcall *0x18 = HGObject::Release (inherited).
      this.cachedOutputTail.Release();
      this.cachedOutputTail = null;
    }
    // @Helium 0x1c8d51: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGBlackWhiteRestore::SetBlackWhiteValue(float black, float white)`
   * — Helium @0x1c8df0.
   *
   * Asm (verbatim):
   *   0x1c8df4  movss %xmm0, 0x1a0(%rdi)   ; blackValue = arg0
   *   0x1c8dfc  movss %xmm1, 0x1a4(%rdi)   ; whiteValue = arg1
   *   0x1c8e04  ret
   *
   * Single-precision store — wrap the JS `number` in Math.fround so
   * downstream arithmetic matches the float32 field width exactly.
   */
  SetBlackWhiteValue(black: number, white: number): void {
    this.blackValue = Math.fround(black);   // @Helium 0x1c8df4
    this.whiteValue = Math.fround(white);   // @Helium 0x1c8dfc
  }

  /**
   * `HGBlackWhiteRestore::GetOutput(HGRenderer* r)` — Helium @0x1c8e10.
   * Builds/refreshes the (conform → clamp → conform) tail subgraph and
   * returns the cached (retained) tail conform node.
   *
   * NOTE: This method is transcribed structurally against its asm —
   * every allocation, every SetConversion arg, every clamp call, every
   * Retain/Release cites the address it decodes from. The three sub-
   * classes it instantiates are NOT yet transcribed: `newHGColorConform`,
   * `newHGColorClamp`, and the HGRenderer::GetInput throw-stub will
   * raise "not yet transcribed" until they are decoded. That is the
   * correct behavior per Rule 3 (throw on undecoded, never approximate).
   */
  GetOutput(renderer: HGRendererStub): HGColorConform {
    // @Helium 0x1c8e29: inputNode = renderer.GetInput(this, 0)
    const inputNode = renderer.GetInput(this, 0);

    // @Helium 0x1c8e36..0x1c8e41: conform1 = new HGColorConform()   (allocsz 0x370)
    const conform1 = newHGColorConform();

    // @Helium 0x1c8e51: conform1.SetInput(0, inputNode)   via vcall *0x78
    conform1.SetInput(0, inputNode);

    // @Helium 0x1c8e70: conform1.SetConversion(0, 8, 0, 0, 1, 1)
    //   src (primaries, transfer, matrix) = (0, 8, 0)
    //   dst (primaries, transfer, matrix) = (0, 1, 1)
    conform1.SetConversion(0, 8, 0, 0, 1, 1);

    // @Helium 0x1c8e7a..0x1c8e85: clamp = new HGColorClamp()          (allocsz 0x1c0)
    const clamp = newHGColorClamp();

    // @Helium 0x1c8e95: clamp.SetInput(0, conform1)                  via vcall *0x78
    clamp.SetInput(0, conform1);

    // @Helium 0x1c8eb2: clamp.SetClampMaxValues(whiteValue, FLT_MAX, FLT_MAX, FLT_MAX)
    clamp.SetClampMaxValues(this.whiteValue, FLT_MAX, FLT_MAX, FLT_MAX);

    // @Helium 0x1c8ed1: clamp.SetClampMinValues(blackValue, FLT_MIN, FLT_MIN, FLT_MIN)
    clamp.SetClampMinValues(this.blackValue, FLT_MIN, FLT_MIN, FLT_MIN);

    // @Helium 0x1c8edb..0x1c8ee6: conform2 = new HGColorConform()    (allocsz 0x370)
    const conform2 = newHGColorConform();

    // @Helium 0x1c8ef7: conform2.SetInput(0, clamp)                  via vcall *0x78
    conform2.SetInput(0, clamp);

    // @Helium 0x1c8f19: conform2.SetConversion(0, 1, 1, 0, 8, 0)
    conform2.SetConversion(0, 1, 1, 0, 8, 0);

    // @Helium 0x1c8f1e..0x1c8f4a: swap cachedOutputTail if it differs
    //   r13 = this.cachedOutputTail
    //   if (r13 != conform2) {
    //     if (r13 != null) r13.Release()
    //     this.cachedOutputTail = conform2
    //     conform2.Retain()
    //     r13 = this.cachedOutputTail  ; = conform2
    //   }
    let ret: HGColorConform = this.cachedOutputTail as HGColorConform;
    if (ret !== conform2) {
      if (this.cachedOutputTail != null) {
        this.cachedOutputTail.Release();          // @Helium 0x1c8f36 vcall *0x18
      }
      this.cachedOutputTail = conform2;           // @Helium 0x1c8f39
      conform2.Retain();                          // @Helium 0x1c8f47 vcall *0x10
      ret = this.cachedOutputTail;                // @Helium 0x1c8f4a re-load
    }

    // @Helium 0x1c8f58: conform2.Release()  (local temp — refcount now == cached ref if swap happened)
    conform2.Release();
    // @Helium 0x1c8f61: clamp.Release()
    clamp.Release();
    // @Helium 0x1c8f6a: conform1.Release()
    conform1.Release();

    // @Helium 0x1c8f6d..0x1c8f7e: return r13 (the retained cached tail).
    return ret;
  }
}
