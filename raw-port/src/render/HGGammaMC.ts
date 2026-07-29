// raw-port/src/render/HGGammaMC.ts
//
// FCP `HGGammaMC` — Helium render-graph node: a multi-channel (per-RGB) gamma
// operator that packs 3 independent gamma exponents (R,G,B) alongside their
// pre-computed 1-gamma complements into two 4-wide SIMD f32 fields. Extends
// `HGNode`. Mirrors `HGGamma` structurally but with SIMD-vectorized state and
// a wider parameter space.
//
// Symbols decoded here (Helium, x86_64 slice; VAs are unadjusted VM addresses
// from otool -tV of Helium.framework):
//   0x179e20  HGGammaMC::HGGammaMC()                    [C2 base ctor]
//   0x179ea0  HGGammaMC::HGGammaMC()                    [C1 complete ctor — identical body to C2]
//   0x179f20  HGGammaMC::~HGGammaMC()                   [D2 base dtor]
//   0x179f60  HGGammaMC::~HGGammaMC()                   [D1 complete dtor — identical body to D2]
//   0x179fa0  HGGammaMC::~HGGammaMC()                   [D0 deleting dtor: D2; then HGObject::operator delete]
//   0x179ff0  HGGammaMC::SetParameter(int, float, float, float, float)
//   0x17a0b0  HGGammaMC::GetOutput(HGRenderer*)
//
// Vtable @Helium (installed base). Ctors and dtors do `leaq 0x8a8583(%rip),%rax`
// @0x179e2e (C2) / 0x8a8503 @0x179eae (C1) / 0x8a848b @0x179f26 (D2) /
// 0x8a844b @0x179f6c (D1) / 0x8a8408 @0x179fa9 (D0) and store %rax into (%rbx)
// = this+0x00. The vtable itself is not enumerated here — JS prototype chain
// models this dispatch.
//
// STRUCT LAYOUT (recovered from HGGammaMC::HGGammaMC() @0x179e20 field-by-field;
// HGNode ends at ~0x198, HGGammaMC adds three fields starting there):
//   ---- inherited from HGNode (size ~= 0x198) ----
//     0x00..0x197  HGNode fields (see HGNode.ts)
//   ---- HGGammaMC-specific fields ----
//     0x198 : HGObject*   childRenderNode  (ctor: 0; the resolved HgcGamma
//                                            installed by GetOutput via HGNode-
//                                            slot-swap; released by dtor through
//                                            vtable *0x18 = Release)
//     0x1a0 : f32x4       gammaVec         (ctor: reset to (1.0,1.0,1.0,1.0)
//                                            if not already; SetParameter stores
//                                            (|r|,|g|,|b|,1.0) here)
//     0x1b0 : f32x4       oneMinusGammaVec (ctor: reset to (0.0,0.0,0.0,1.0)
//                                            if not already; SetParameter stores
//                                            (1-|r|,1-|g|,1-|b|,1.0) here)
//
// Runtime numeric constants (16-byte SIMD literals; addresses from the RIP-rel
// decode below, values read directly from the x86_64 slice file at those
// offsets — VA == file offset for the thin slice at /tmp/Helium.x86_64):
//   @Helium 0x3c7c30  16b = ff ff ff 7f (x4)
//                     = (NaN, NaN, NaN, NaN) as f32x4
//                     = per-lane 0x7fffffff sign-clear (abs) mask; used by
//                       SetParameter @0x179ffe (movaps into xmm3) and applied
//                       to input lanes by `andps` @0x17a005, 0x17a00e.
//   @Helium 0x3c7c40  = (1.0, 1.0, 1.0, 1.0) f32x4
//                     — the ctor "gammaVec default" against which +0x1a0 is
//                       compared @0x179e4a and, on any lane-mismatch, reset
//                       to (movaps @0x179e6f-@0x179e76).
//   @Helium 0x3c9fe0  = (0.0, 0.0, 0.0, 1.0) f32x4
//                     — the ctor "oneMinusGammaVec default" against which
//                       +0x1b0 is compared @0x179e60 and, on mismatch, reset
//                       (movaps @0x179e7d-@0x179e84). Also loaded by
//                       SetParameter @0x17a06d as the (0,0,0,1) source used
//                       to fill the alpha-slot & the "throwaway" upper lanes
//                       before the shufps pack.
//   @Helium 0x3c7cc0  low-32 = 0x3f800000 = f32 1.0
//                     — the scalar 1.0f loaded by SetParameter @0x17a011 into
//                       xmm2 (movss zeroes the upper 3 lanes) and again by the
//                       insertps @0x17a054 that pins lane 3 to 1.0 in the
//                       oneMinus vector before compare/store.
//   @Helium 0x3ca0b0  = (1.0, 1.0, 0.0, 0.0) f32x4
//                     — used by SetParameter @0x17a019 (movaps into xmm3) as
//                       the "reference" for computing the one-minus vector:
//                       xmm3 = (1,1,0,0) - (|g|,|b|,X,X) yields (1-|g|, 1-|b|,
//                       0-X, 0-X) which is then rearranged into
//                       (1-|r|, 1-|g|, 1-|b|, 1) via shufps+insertps.
//
// Undecoded dependencies (throw-stubbed at their call sites, per Rule 3):
//   HGRenderer::GetInput(HGNode*, int)     @0x17a0d6 in this framework
//   HgcGamma::HgcGamma()                    @0x17a133 (0x1d0-byte compositor node
//                                            — the SAME HgcGamma type used by
//                                            HGGamma.ts, not a "MC" variant)
//   HGObject::operator new(unsigned long)  @0x17a11b
//   std::string::assign(char const*)       @0x17a17b (label plumbing)
//   HGNode-slot Retain/Release (*0x10/*0x18) @0x17a1a4, 0x17a1b4 (compositor swap)
//   HgcGamma::SetInput(int, HGNode*) (*0x78) @0x17a1c6
//   HgcGamma::SetParameter(int, float, float, float, float) (*0x60) @0x17a1ef, 0x17a20b
//
// Semantic conclusion: only the ctor, D2/D1/D0 dtors, and SetParameter are pure
// enough to transcribe end-to-end. GetOutput is a compositor-graph rewriter
// that requires HGRenderer + HgcGamma + the string label plumbing to be
// decoded first, so it is a throw-stub citing its address (a loud gap is
// correct — Rule 3).

import { HGNode } from "./HGNode.js";

/** Address of the FCP HGRenderer type — held opaquely at the port level. */
export interface HGRendererLike { readonly __hgRenderer: true; }

/**
 * Fixed-length 4-element f32 tuple modelling an SSE `xmm` register. All lane
 * arithmetic in this file is single-precision (`Math.fround`-guarded) to
 * bit-match the machine's movaps/subps/andps behaviour.
 */
type F32x4 = [number, number, number, number];

/**
 * Per-lane abs (sign-clear) applied by `andps xmm3, xmm_in` where xmm3 is the
 * 16-byte constant at Helium 0x3c7c30 = (0x7fffffff x 4). The mask is applied
 * to ALL 4 lanes even though upper lanes carry caller garbage — that garbage
 * is either overwritten later by the pack sequence or masked away by the
 * final shufps/insertps rewrites, so it's semantically safe here.
 */
function absF32(x: number): number {
  return Math.fround(Math.abs(Math.fround(x)));
}

/**
 * SIMD-lane-wise "any not equal" using `cmpneqps` + `movmskps` + `testl`:
 * returns TRUE if ANY of the 4 lanes differ (ordered NEQ; NaN in either side
 * yields "unordered", which cmpneqps returns 0xffffffff for — matching the
 * decoded jne/jnp flow below). Used by ctor @0x179e4a & @0x179e60, and by
 * SetParameter @0x17a038 & @0x17a05e.
 */
function anyLaneNeq(a: F32x4, b: F32x4): boolean {
  for (let i = 0; i < 4; i++) {
    const ai = Math.fround(a[i] as number);
    const bi = Math.fround(b[i] as number);
    // NaN handling: cmpneqps returns 0xffffffff for NaN operands (unordered
    // treats as "not equal"), so we mirror that with an explicit isNaN check.
    if (Number.isNaN(ai) || Number.isNaN(bi)) return true;
    if (ai !== bi) return true;
  }
  return false;
}

export class HGGammaMC extends HGNode {
  /** @0x198 childRenderNode — the HgcGamma installed by GetOutput. */
  private _childRenderNode: unknown = null;                       // @0x179e38: movq $0, 0x198(%rbx)

  /**
   * @0x1a0 gammaVec — packed (|r|, |g|, |b|, 1.0) after every successful
   * SetParameter. Ctor default = (1.0, 1.0, 1.0, 1.0). Sixteen aligned bytes;
   * every store is a `movaps` to this exact offset.
   */
  private _gammaVec: F32x4 = [
    Math.fround(1.0), Math.fround(1.0), Math.fround(1.0), Math.fround(1.0),
  ];

  /**
   * @0x1b0 oneMinusGammaVec — packed (1-|r|, 1-|g|, 1-|b|, 1.0) after every
   * successful SetParameter. Ctor default = (0.0, 0.0, 0.0, 1.0). Sixteen
   * aligned bytes; every store is a `movaps` to this exact offset.
   */
  private _oneMinusGammaVec: F32x4 = [
    Math.fround(0.0), Math.fround(0.0), Math.fround(0.0), Math.fround(1.0),
  ];

  /**
   * HGGammaMC::HGGammaMC() @0x179e20 (C2 base ctor; C1 @0x179ea0 has an
   * identical body).
   *
   * Instruction-by-instruction:
   *   @0x179e29 callq HGNode::HGNode() @0x11baf0
   *   @0x179e2e leaq 0x8a8583(%rip),%rax; @0x179e35 movq %rax, (%rbx)
   *     — install HGGammaMC vtable at this+0x00. JS prototype chain models it.
   *   @0x179e38 movq $0, 0x198(%rbx)  — childRenderNode = nullptr.
   *   @0x179e43 movaps 0x1a0(%rbx), %xmm0
   *   @0x179e4a cmpneqps [0x3c7c40 = (1,1,1,1)], %xmm0
   *   @0x179e52 movmskps %xmm0, %eax
   *   @0x179e55 testl %eax, %eax
   *   @0x179e57 jne 0x179e6f    — if ANY lane of gammaVec != (1,1,1,1), branch
   *                               to the RESET block.
   *   @0x179e59 movaps 0x1b0(%rbx), %xmm0
   *   @0x179e60 cmpneqps [0x3c9fe0 = (0,0,0,1)], %xmm0
   *   @0x179e68 movmskps + testl + je 0x179e8b
   *     — likewise for oneMinusGammaVec. Fall-through only if both fields
   *       already exactly match defaults; else RESET.
   *   RESET block @0x179e6f:
   *     @0x179e6f movaps [0x3c7c40 = (1,1,1,1)], %xmm0
   *     @0x179e76 movaps %xmm0, 0x1a0(%rbx)
   *     @0x179e7d movaps [0x3c9fe0 = (0,0,0,1)], %xmm0
   *     @0x179e84 movaps %xmm0, 0x1b0(%rbx)
   *
   * On a freshly-`operator new`'d object both fields read as (0,0,0,0) (bzero'd),
   * so the compare fires and the defaults are written. This is the "normalize
   * an uninitialized field" pattern (same as HGGamma's scalar version).
   */
  constructor() {
    super();                                                       // @0x179e29 callq HGNode::HGNode() @0x11baf0
    // @0x179e2e leaq 0x8a8583(%rip),%rax; @0x179e35 movq %rax,(%rbx)
    //   -> install HGGammaMC vtable. JS prototype chain covers this.
    this._childRenderNode = null;                                  // @0x179e38 movq $0, 0x198(%rbx)

    // Defaults — literal constants read from the x86_64 slice at the RIP-rel
    // addresses cited in the header block:
    const gammaDefault: F32x4 = [                                  // @Helium 0x3c7c40
      Math.fround(1.0), Math.fround(1.0), Math.fround(1.0), Math.fround(1.0),
    ];
    const oneMinusDefault: F32x4 = [                               // @Helium 0x3c9fe0
      Math.fround(0.0), Math.fround(0.0), Math.fround(0.0), Math.fround(1.0),
    ];

    // @0x179e43-@0x179e57 : if gammaVec != default -> jne 0x179e6f
    // @0x179e59-@0x179e6d : else if oneMinus != default -> je 0x179e8b (skip reset)
    //   The je-target only fires when BOTH already match; either mismatch
    //   falls into the reset block.
    const gammaMismatch = anyLaneNeq(this._gammaVec, gammaDefault);
    const oneMinusMismatch = anyLaneNeq(this._oneMinusGammaVec, oneMinusDefault);
    if (gammaMismatch || oneMinusMismatch) {
      // @0x179e6f-@0x179e76 : movaps [0x3c7c40], %xmm0; movaps %xmm0, 0x1a0(%rbx)
      this._gammaVec = [gammaDefault[0], gammaDefault[1], gammaDefault[2], gammaDefault[3]];
      // @0x179e7d-@0x179e84 : movaps [0x3c9fe0], %xmm0; movaps %xmm0, 0x1b0(%rbx)
      this._oneMinusGammaVec = [
        oneMinusDefault[0], oneMinusDefault[1], oneMinusDefault[2], oneMinusDefault[3],
      ];
    }
  }

  /**
   * HGGammaMC::SetParameter(int idx, float r, float g, float b, float a)
   *   @0x179ff0.
   *
   * Return semantics (matching the exit paths @0x179ff9 / @0x17a09e / @0x17a0a5):
   *   idx != 0                             -> -1  (0xffffffff, "unhandled")
   *   packed values differ from stored     ->  1  (write both fields; changed)
   *   packed values match stored           ->  0  (no write; unchanged)
   *
   * Packing (see header block "SetParameter constants" for the trail):
   *   gammaVec_new         = ( |r|, |g|, |b|, 1.0 )   -> +0x1a0
   *   oneMinusGammaVec_new = ( 1-|r|, 1-|g|, 1-|b|, 1.0 ) -> +0x1b0
   *
   * NOTE: the `a` (alpha) argument arrives in xmm3 (@0x17a000 andps sequence)
   * but is NEVER read into either stored vector — the machine unconditionally
   * writes 1.0f to lane 3 of both fields via the `movss [0x3c7cc0=1.0f]`
   * @0x17a011 + `insertps $0x30 xmm2,xmm4` @0x17a02e path. This is faithful
   * to the disassembly: alpha is a passthrough for the vtable signature but
   * has no effect on the stored state.
   *
   * The change-detection tests both new fields via `cmpneqps` + `movmskps`
   * (@0x17a038 for gammaVec, @0x17a05e for oneMinus). If EITHER differs, the
   * store block writes BOTH; if both match, nothing is written. That means
   * inconsistent state (only one field stale) cannot arise from this method.
   */
  SetParameter(idx: number, r: number, _g: number, _b: number, _a: number): number {
    // @0x179ff0-@0x179ff9 : return -1 for any non-zero idx.
    if ((idx | 0) !== 0) return -1;

    // The disassembly's per-lane abs (`andps xmm3, xmm{0,1}`) applies the
    // 0x7fffffff mask to all 4 lanes of xmm0/xmm1, but only lanes {0, 1} of
    // the interleaved (r,g,b) source are ever consumed by the pack sequence
    // (see the shufps/insertps @0x17a07a-@0x17a07e / @0x17a08f-@0x17a093).
    // We compute the three scalar absolutes directly, which is bit-identical
    // to the lane-0 behaviour of andps for finite inputs and matches its
    // NaN-preserving behaviour (Math.abs(NaN) === NaN under IEEE-754).
    const absR = absF32(r);
    const absG = absF32(_g);
    const absB = absF32(_b);
    // (`a` is ignored per the semantic-note above.)

    const one = Math.fround(1.0);
    // Packing sequence @0x17a074-@0x17a082 (gammaVec) and @0x17a089-@0x17a097
    // (oneMinusVec) results in these two vectors after all the blend/shuffle
    // instructions. The tuples below are the FINAL SIMD contents that get
    // stored — see the shufps-trace comments in the header block.
    const gammaNew: F32x4 = [absR, absG, absB, one];               // -> +0x1a0
    const oneMinusNew: F32x4 = [
      Math.fround(one - absR),
      Math.fround(one - absG),
      Math.fround(one - absB),
      one,
    ];                                                              // -> +0x1b0

    // @0x17a038 cmpneqps %xmm4, 0x1a0(%rdi)  -> gammaVec differ?
    // @0x17a05e cmpneqps %xmm4, 0x1b0(%rdi)  -> oneMinus differ?
    // Store-if-EITHER-differs; unchanged-if-BOTH-match. This matches the
    // control flow: two independent jne's, both flowing into the same store
    // block @0x17a06d; only if both compares fall through do we hit
    // xorl %eax,%eax / retq @0x17a0a5 (return 0).
    const gammaDiff = anyLaneNeq(gammaNew, this._gammaVec);
    const oneMinusDiff = anyLaneNeq(oneMinusNew, this._oneMinusGammaVec);
    if (gammaDiff || oneMinusDiff) {
      // @0x17a082 movaps %xmm0, 0x1a0(%rdi) -- write gammaVec.
      this._gammaVec = gammaNew;
      // @0x17a097 movaps %xmm2, 0x1b0(%rdi) -- write oneMinusGammaVec.
      this._oneMinusGammaVec = oneMinusNew;
      return 1;                                                    // @0x17a09e movl $1, %eax
    }
    return 0;                                                       // @0x17a0a5 xorl %eax, %eax
  }

  /**
   * HGGammaMC::GetOutput(HGRenderer*) @0x17a0b0.
   *
   * Compositor-graph rewriter (full body 121 lines of disassembly):
   *   1. @0x17a0d6 call HGRenderer::GetInput(this, 0) -> upstream node r15.
   *   2. @0x17a0de-@0x17a10e per-lane fast-path check on gammaVec:
   *        ucomiss gammaVec[0] vs 1.0f   (jne/jp escape)
   *        movshdup -> gammaVec[1]; ucomiss vs 1.0f   (jne/jp escape)
   *        movss gammaVec[2]; ucomiss vs 1.0f        (jne/jp escape)
   *        -> if all three of R,G,B gammas equal 1.0f AND ordered (no NaN),
   *          jump to @0x17a22e return-path with r15 unchanged (pass-through).
   *      The lane-3 (alpha) slot is NOT tested — consistent with alpha
   *      always being 1.0 by construction (see SetParameter).
   *   3. @0x17a116 allocate 0x1d0 bytes via HGObject::operator new, bzero,
   *      call HgcGamma::HgcGamma() @0x17a133, install vtable, zero the three
   *      f32x4 pad quads at +0x1a0/+0x1b0/+0x1c0 of the HgcGamma.
   *   4. @0x17a174 std::string::assign "HgcGamma" -> HgcGamma+0x1a0 (label).
   *      @0x17a187 std::string::assign ""       -> HgcGamma+0x1b8 (desc empty).
   *   5. @0x17a190 hang the HgcGamma under this via HGNode-slot swap:
   *      release old this[0x198], store new, retain new (*0x10/*0x18 vtable).
   *   6. @0x17a1c6 call HgcGamma::SetInput(0, upstream_r15) via *0x78.
   *   7. @0x17a1d0-@0x17a1ef push gammaVec via HgcGamma::SetParameter(0, r,g,b,a):
   *      movaps 0x1a0(this) -> xmm0; movshdup -> xmm1 (g,g,g,g);
   *      movss 0x1a8(this) -> xmm2 (b); shufps $0xff xmm0,xmm0 -> xmm3 (a,a,a,a).
   *      callq *0x60(HgcGamma vtable) with esi=0.
   *   8. @0x17a1f2-@0x17a20b same for oneMinusGammaVec, esi=1.
   *   9. @0x17a21e read this->_childRenderNode into r15 as return value.
   *      Then Release the local +1 refcount on HgcGamma (@0x17a22b callq *0x18).
   *  10. Return the newly-installed HgcGamma.
   *
   * All of steps 1, 3, 4, 5, 6, 7, 8 require classes that are NOT yet in the
   * port (HGRenderer, HgcGamma, std::string). Per Rule 3 the method throws
   * until those land — a plausible pass-through or "just create a node" would
   * silently corrupt the compositor optimization.
   */
  GetOutput(_renderer: HGRendererLike): unknown {
    throw new Error(
      "HGGammaMC::GetOutput @0x17a0b0 not yet transcribed — requires HGRenderer @Helium " +
        "(GetInput @0x17a0d6), HgcGamma @Helium (0x1d0-byte compositor leaf @0x17a133), " +
        "and std::string::assign wiring for the 'HgcGamma' label @0x17a17b/0x17a187.",
    );
  }

  /**
   * HGGammaMC::~HGGammaMC() @0x179f20 (D2 base dtor).
   *
   * Instruction-by-instruction:
   *   @0x179f26 leaq 0x8a848b(%rip),%rax; @0x179f2d movq %rax,(%rdi)
   *     -- reinstall HGGammaMC vptr (defensive; JS does not need this).
   *   @0x179f30 movq 0x198(%rdi), %rax  -- load childRenderNode.
   *   @0x179f37 testq %rax, %rax; je 0x179f4b  -- skip release if null.
   *   @0x179f3c movq (%rax), %rcx  -- child vtable.
   *   @0x179f42 movq %rax, %rdi; @0x179f45 callq *0x18(%rcx)
   *     -- call child->vtable[3] = HGObject::Release().
   *   @0x179f51 jmp HGNode::~HGNode() @0x11bf20 -- tail-call base dtor.
   *
   * D1 @0x179f60 is byte-for-byte identical to D2 with a different vtable
   *   `leaq` disp (@0x179f66: leaq 0x8a844b(%rip),%rax vs @0x179f26: 0x8a848b).
   *   Both leaq disps target the *same* HGGammaMC vtable base (0x0-offset
   *   thunks + primary vtable are stored adjacently); the difference is
   *   which of the two "installed pointer" slots is written, which is
   *   irrelevant to JS. So the same body handles both D2 and D1.
   *
   * D0 @0x179fa0 = D2 body then `jmp HGObject::operator delete` @0x179fd6.
   */
  destroy(): void {
    // JS has no destructor; this method is provided for parity with the FCP
    // C++ deterministic-destruction path. Callers that manage HGObject
    // lifetime (Retain/Release) should invoke it when refcount drops to zero.
    const child = this._childRenderNode as { Release?: () => void } | null;
    if (child !== null && child !== undefined) {
      // @0x179f45 callq *0x18(%rcx) -- vtable slot 3 = HGObject::Release
      child.Release?.();
    }
    this._childRenderNode = null;
    // Base HGNode dtor runs via GC / higher-level release chain; no explicit
    // tail-call is meaningful here.
  }
}
