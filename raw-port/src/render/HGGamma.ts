// raw-port/src/render/HGGamma.ts
//
// FCP `HGGamma` — Helium render-graph node: a per-channel gamma (power)
// operator. Extends `HGNode`. GetOutput chooses one of two low-level
// compositor implementations (`HgcGamma` when premultiplied, `HgcGammaNoPremult`
// otherwise) and hangs it under this node as the resolved child.
//
// Symbols decoded here (Helium, x86_64 slice; VAs are unadjusted VM addresses
// from otool -tV):
//   0x179880  HGGamma::HGGamma()                      [C2 base ctor]
//   0x1798d0  HGGamma::HGGamma()                      [C1 complete ctor — identical body to C2]
//   0x179920  HGGamma::~HGGamma()                     [D2 base dtor]
//   0x179960  HGGamma::~HGGamma()                     [D1 complete dtor — identical body to D2]
//   0x1799a0  HGGamma::~HGGamma()                     [D0 deleting dtor: D2; then HGObject::operator delete]
//   0x1799f0  HGGamma::SetPremultiplyState(bool)
//   0x179a00  HGGamma::SetParameter(int, float, float, float, float)
//   0x179a40  HGGamma::GetOutput(HGRenderer*)
//
// Vtable @Helium 0x8a2138 (RIP-rel loads in ctors: leaq 0x8a88b3(%rip),%rax @0x17988e
// resolve to that vtable base; the store `movq %rax,(%rbx)` installs it as the
// primary vptr at offset 0x00 of the HGNode base sub-object). Not enumerated
// here — this port dispatches through the JS prototype chain.
//
// STRUCT LAYOUT (recovered from HGGamma::HGGamma() @0x179880 field-by-field;
// HGNode ends at ~0x198, HGGamma adds three fields starting there):
//   ---- inherited from HGNode (size ≈ 0x198) ----
//     0x00..0x197  HGNode fields (see HGNode.ts)
//   ---- HGGamma-specific fields ----
//     0x198 : HGObject*   childRenderNode  (ctor: $0; the resolved HgcGamma or
//                                            HgcGammaNoPremult installed by GetOutput
//                                            via HGNode-slot-swap; released by dtor
//                                            through vtable *0x18 = Release)
//     0x1a0 : f32         gamma            (ctor normalizes to 1.0 if != 1.0 or NaN
//                                            — memory is zeroed by HGObject::operator new
//                                            so the initial read is 0.0, so the check
//                                            always fires on a fresh object)
//     0x1a4 : bool        premultiplyState (ctor: $1 = true)
//
// Runtime numeric constants (RIP-rel literal-pool addresses from disasm; low-32
// bits are the operand for movss/andps single-precision ops — decode via
// resolve.py Helium const <ADDR>, then take (u64 & 0xffffffff) as u32 -> f32):
//   @0x3c7cc0  u32=0x3f800000  f=1.0           (ctor cmp target; also GetOutput
//                                                cmp target at @0x179cb4)
//   @0x3c7c30  u32=0x7fffffff  f=NaN(bitmask)  (per-lane abs-value mask —
//                                                clears the sign bit via andps;
//                                                used by SetParameter @0x179a0e
//                                                and GetOutput @0x179a82,0x179cca)
//   @0x3cd08f  u32=0x83126f00  f approx -4.303e-37 (GetOutput @0x179a8c — the small
//                                                epsilon compared with |1.0-gamma|
//                                                to detect "gamma is effectively 1.0";
//                                                if |1-g| < eps take the fast pass-
//                                                through path and return the raw
//                                                upstream input unchanged)
//
// Undecoded dependencies (throw-stubbed at their call sites, per Rule 3):
//   HGRenderer::GetInput(HGNode*, int)         @0x179a6d, 0x179cf2 in this framework
//   HGRenderer::IsMergeable(HGNode*, int, bool) @0x179bff
//   HgcGamma::HgcGamma()                       @0x179adf   (0x1d0-byte compositor node)
//   HgcGammaNoPremult::HgcGammaNoPremult()     @0x179b6e   (0x1d0-byte compositor node)
//   ::___dynamic_cast (RTTI cast to (anonymous)::Gamma<HgcGamma[NoPremult]>
//                                              @0x179c39
//   HGObject::operator new(unsigned long)      @0x179abd, 0x179c7a
//   std::string::assign(char const*)           @0x179b44 etc. (label plumbing)
//
// Semantic conclusion: only the ctor, dtor, SetParameter, and SetPremultiplyState
// are pure enough to transcribe end-to-end. GetOutput is a compositor-graph
// rewriter that requires HGRenderer + HgcGamma[NoPremult] + the (anon) Gamma<T>
// merge-typeinfo machinery to be decoded first, so it is a throw-stub citing
// its address (a loud gap is correct — Rule 3).

import { HGNode } from "./HGNode.js";

/** Address of the FCP HGRenderer type — held opaquely at the port level. */
export interface HGRendererLike { readonly __hgRenderer: true; }

export class HGGamma extends HGNode {
  /** @0x198 childRenderNode — the HgcGamma / HgcGammaNoPremult installed by GetOutput. */
  private _childRenderNode: unknown = null;                       // @0x179898: movq $0, 0x198(%rbx)

  /** @0x1a0 gamma exponent (single-precision). */
  private _gamma: number = 1.0;

  /** @0x1a4 premultiply state; ctor default true. */
  private _premultiply: boolean = true;

  /** HGGamma::HGGamma() @0x179880 (C2 ctor; C1 @0x1798d0 has an identical body). */
  constructor() {
    super();                                                       // @0x179889 callq HGNode::HGNode() @0x11baf0
    // @0x17988e leaq 0x8a88b3(%rip), %rax; @0x179895 movq %rax, (%rbx)
    //   -- install HGGamma vtable @0x8a2138 at this+0x00. JS prototype chain
    //   already models this dispatch, no separate action needed.
    this._childRenderNode = null;                                  // @0x179898 movq $0, 0x198(%rbx)
    this._premultiply = true;                                      // @0x1798a3 movb $1, 0x1a4(%rbx)
    // @0x1798aa movss 0x1a0(%rbx), %xmm0
    // @0x1798b2 ucomiss [0x3c7cc0(=1.0f)], %xmm0
    // @0x1798b9 jne 0x1798bd ; @0x1798bb jnp 0x1798c7
    //   ⇒ if gamma != 1.0 (ordered) OR NaN (unordered): fall into store; else skip.
    //   Written to normalize an uninitialized/zero gamma slot to 1.0.
    const g = Math.fround(this._gamma);
    // ucomiss NaN behaviour: PF=CF=ZF=1 -> jne (ZF=1) NOT taken -> jnp (PF=1)
    //   NOT taken -> falls through to the store. So NaN also triggers the reset.
    if (Number.isNaN(g) || g !== Math.fround(1.0)) {
      this._gamma = Math.fround(1.0);                              // @0x1798bd movl $0x3f800000, 0x1a0(%rbx)
    }
  }

  /** HGGamma::SetPremultiplyState(bool) @0x1799f0 — one-line setter. */
  SetPremultiplyState(state: boolean): void {
    // @0x1799f4 movb %sil, 0x1a4(%rdi)
    this._premultiply = state;
  }

  /**
   * HGGamma::SetParameter(int idx, float r, float g, float b, float a) @0x179a00
   *   Returns:
   *     -1 (0xffffffff) if idx != 0        (@0x179a00 movl $-1,%eax ; testl %esi,%esi ; je fallthrough ; retq)
   *      1 if new |r| differs from stored gamma (write it, return changed)
   *      0 if |r| equals stored gamma (no change)
   *
   *   Note: the "value" used is abs(r), computed via `andps xmm0, [0x3c7c30]`
   *   which is the per-lane 0x7fffffff sign-clear mask. `g`,`b`,`a` are read
   *   but never used by this method (they are part of the base HGNode virtual
   *   signature: SetParameter(int,float,float,float,float)).
   */
  SetParameter(idx: number, r: number, _g: number, _b: number, _a: number): number {
    // @0x179a00-0x179a09 : if idx != 0 -> return -1
    if ((idx | 0) !== 0) return -1;                                // idx test @0x179a05 testl %esi,%esi
    // @0x179a0e andps xmm0, [0x3c7c30 = 0x7fffffff mask] — abs(r) in f32
    const absR = Math.fround(Math.abs(Math.fround(r)));
    // @0x179a15 movss 0x1a0(%rdi),%xmm1 ; @0x179a1d ucomiss %xmm0,%xmm1
    // @0x179a20 jne 0x179a24 ; @0x179a22 jnp 0x179a33
    //   -- if gamma != absR (ordered), branch to store & return 1;
    //     if equal (or NaN ordering), skip to return 0.
    const cur = Math.fround(this._gamma);
    if (Number.isNaN(cur) || Number.isNaN(absR) || cur !== absR) {
      this._gamma = absR;                                          // @0x179a24 movss %xmm0, 0x1a0(%rdi)
      return 1;                                                    // @0x179a2c movl $1, %eax
    }
    return 0;                                                      // @0x179a33 xorl %eax, %eax
  }

  /**
   * HGGamma::GetOutput(HGRenderer*) @0x179a40
   *
   * The full body is a large compositor-graph rewrite:
   *   1. @0x179a6d call HGRenderer::GetInput(this, 0) -> upstream node r15.
   *   2. @0x179a82 compute |1.0f - gamma| (subss then andps 0x7fffffff mask).
   *   3. @0x179a97 ucomiss vs 0x3cd08f (approx -4.3e-37 as f32, `ja` branch) ->
   *        if |1-g| < eps, jump to @0x179d90 return-path with r15 unchanged
   *        (pass-through: gamma == 1 optimization).
   *   4. Else allocate 0x1d0 bytes via HGObject::operator new, zero via ___bzero.
   *   5. Branch on `_premultiply`: construct in place either HgcGamma() @0x179adf
   *      or HgcGammaNoPremult() @0x179b6e; install its vtable; zero the three
   *      f32x4 param quads at +0x1a0/+0x1b0/+0x1c0; hang under this via the
   *      HGNode-slot mechanism (release old *this[0x198]; store new; Retain via
   *      vtable *0x10); std::string::assign the label ("HgcGamma"/"HgcGammaNoPremult")
   *      and description into fields at +0x1a0 and +0x1b8 (of the compositor node —
   *      note this is offsets in the 0x1d0-byte HgcGamma, NOT this HGGamma).
   *   6. @0x179bff call HGRenderer::IsMergeable(this, 0, false).
   *   7. If mergeable AND r15!=null: RTTI-dynamic-cast r15 (upstream) to either
   *      (anon)::Gamma<HgcGamma> or Gamma<HgcGammaNoPremult> (typeinfo picked by
   *      premultiply bit) — if the cast succeeds we're chaining gamma-with-gamma
   *      -> fetch its stored gamma via *(cast+0x68) virtual call, MULTIPLY both
   *      gammas together (abs-masked), allocate another 0x1d0 node, and set THAT
   *      as the child, replacing the merged pair with a single stronger gamma.
   *   8. @0x179d75 else: virtual-call *(child->vtable+0x60) which is
   *      HGNode::SetParameter, passing gamma in xmm0..xmm2 (r,g,b) and 1.0 in
   *      xmm3 (a) — pushes the gamma value into the compositor node.
   *      Then *(child->vtable+0x78) = HGNode::SetInput(0, upstream) plumbs the
   *      dataflow.
   *   9. Return this->_childRenderNode (the newly-installed 0x1d0-byte node).
   *
   * ALL of steps 1, 4, 5, 6, 7 require classes that are NOT yet in the port:
   *   • HGRenderer
   *   • HgcGamma / HgcGammaNoPremult (0x1d0-byte compositor leaves)
   *   • the (anonymous namespace) Gamma<T> merge helper + its RTTI typeinfo
   * Per Rule 3 the method throws until those land — a plausible pass-through
   * or "just create a node" would silently corrupt the merge optimization.
   */
  GetOutput(_renderer: HGRendererLike): unknown {
    throw new Error(
      "HGGamma::GetOutput @0x179a40 not yet transcribed — requires HGRenderer @Helium " +
        "(GetInput/IsMergeable), HgcGamma @Helium (0x1d0-byte compositor leaf), " +
        "HgcGammaNoPremult @Helium, and (anonymous)::Gamma<T> RTTI merge typeinfo " +
        "@__ZTIN12_GLOBAL__N_15GammaI8HgcGammaEE / @__ZTIN12_GLOBAL__N_15GammaI17HgcGammaNoPremultEE.",
    );
  }

  /**
   * HGGamma::~HGGamma() @0x179920 (D2 base dtor; D1 @0x179960 identical body;
   * D0 @0x1799a0 = D2 then HGObject::operator delete).
   *
   *   @0x179926 leaq [vtable+0x10](%rip), %rax ; movq %rax, (%rdi)
   *     -- reinstall HGGamma primary vptr (defensive; JS does not need this).
   *   @0x179930 movq 0x198(%rdi), %rax ; testq ; je skip
   *     -- load child render node, skip release if null.
   *   @0x179945 callq *0x18(%rcx)  -- call child->vtable[3] = HGObject::Release().
   *   @0x179951 jmp HGNode::~HGNode() @0x11bf20 -- tail-call base dtor.
   */
  destroy(): void {
    // JS has no destructor; this method is provided for parity with the FCP
    // C++ deterministic-destruction path. Callers that manage HGObject
    // lifetime (Retain/Release) should invoke it when refcount drops to zero.
    const child = this._childRenderNode as { Release?: () => void } | null;
    if (child !== null && child !== undefined) {
      // @0x179945 callq *0x18(%rcx) — vtable slot 3 = HGObject::Release
      child.Release?.();
    }
    this._childRenderNode = null;
    // Base HGNode dtor runs via GC / higher-level release chain; no explicit tail-call
    // is meaningful here.
  }
}
