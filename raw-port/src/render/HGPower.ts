// raw-port/src/render/HGPower.ts
//
// FCP `HGPower` — Helium render-graph node that applies a per-channel
// power (gamma-like) operation with 4 exponents (R,G,B,A).
//
// Symbols decoded (Helium framework, x86_64 slice; VAs from `otool -tV`):
//   0x1f9180  HGPower::HGPower()                       [C2 base ctor]
//   0x1f91d0  HGPower::HGPower()                       [C1 complete ctor — identical body]
//   0x1f9220  HGPower::~HGPower()                      [D2 base dtor]
//   0x1f9260  HGPower::~HGPower()                      [D1 complete dtor — identical body]
//   0x1f92a0  HGPower::~HGPower()                      [D0 deleting dtor]
//   0x1f92f0  HGPower::SetParameter(int, float, float, float, float)
//   0x1f9360  HGPower::GetOutput(HGRenderer*)
//
// Vtable @Helium 0xa2e1a0 (installed ptr = 0xa2e1b0). Overrides D1/D0/
// SetParameter (idx-dispatched via slot *0x60). Everything else inherits
// HGNode.
//
// STRUCT LAYOUT (recovered from C2 ctor + SetParameter + GetOutput):
//   ---- HGNode fields (size 0x198) ----
//     0x000..0x197 : HGNode. C2 chains HGNode::HGNode() @0x1f9189.
//   ---- HGPower-specific fields ----
//     0x198 : HGNode*  cachedOutputTail   (movq $0, 0x198 in ctor @0x1f9198;
//                                          Release()d in D2 @0x1f9245)
//     0x1a0 : float[4] params              (16-byte aligned; initialised to
//                                          [1,1,1,1] by the ctor's cmpneq/
//                                          conditional-store idiom.
//                                          Read as movaps in SetParameter/
//                                          GetOutput; individual lanes are
//                                          also addressed as 0x1a0/0x1a4/
//                                          0x1a8/0x1ac by movss/movshdup.)
//   sizeof(HGPower) = 0x1b0 bytes.
//
// Ctor @0x1f9180 (verbatim):
//   0x1f9189  callq __ZN6HGNodeC2Ev              ; base ctor
//   0x1f918e  leaq  0x83501b(%rip), %rax          ; = 0xa2e1b0 own vtable installed ptr
//   0x1f9195  movq  %rax, (%rbx)                  ; *this = own vtable
//   0x1f9198  movq  $0x0, 0x198(%rbx)             ; cachedOutputTail = null
//   0x1f91a3  movaps 0x1a0(%rbx), %xmm0           ; load current params (may be junk after new)
//   0x1f91aa  cmpneqps 0x1cea8e(%rip), %xmm0      ; @0x3c7c40 = [1.0,1.0,1.0,1.0]
//                                                 ; per-lane: mask=(cur != 1.0)
//   0x1f91b2  movmskps %xmm0, %eax
//   0x1f91b5  testl %eax, %eax
//   0x1f91b7  je   0x1f91c7                      ; skip if all 4 already == 1.0
//   0x1f91b9  movaps 0x1cea80(%rip), %xmm0        ; @0x3c7c40 = [1.0,1.0,1.0,1.0]
//   0x1f91c0  movaps %xmm0, 0x1a0(%rbx)           ; params = [1.0, 1.0, 1.0, 1.0]
// Semantic: params[0..3] = 1.0f each (unity gamma / no-op) with a
// compiler-inserted no-op-if-already-set guard.
//
// D2 @0x1f9220 (verbatim, minus exception path):
//   0x1f9226  leaq 0x834f83(%rip), %rax          ; = 0xa2e1b0 own vtable
//   0x1f922d  movq %rax, (%rdi)                  ; reinstall
//   0x1f9230  movq 0x198(%rdi), %rax             ; cachedOutputTail
//   0x1f9237..0x1f9245: Release() if non-null (vcall *0x18)
//   0x1f9251  jmp __ZN6HGNodeD2Ev                ; tail-call HGNode::~HGNode()
//
// SetParameter @0x1f92f0 (verbatim; only idx==0 is handled):
//   cmpl $0, %esi ; jne 0x1f92f9  ; return -1 for idx != 0
//   (idx==0 branch)
//   xmm3 = load @0x3c7c30 = [0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff]  ; abs mask
//   xmm0 = arg1 & absmask                                  = |arg1|
//   xmm1 = insertps $0x10, xmm2, xmm1   ; xmm1[1] = xmm2[0], i.e. xmm1 = (arg2, arg3, ?, ?)
//   xmm1 = xmm1 & absmask                                  = (|arg2|, |arg3|, ?, ?)
//   xmm2 = load @0x3c9fe0 = [0.0, 0.0, 0.0, 1.0]           ; "1 in top lane" template
//   xmm2 = blendps $0x3, xmm0, xmm2      ; low2 from xmm0, high2 from mem → (|arg1|, ?, 0, 1)
//   xmm2 = shufps  $0x4c, xmm1, xmm2     ; imm 0b01001100 → (xmm2[0], xmm2[3], xmm1[0], xmm1[1])
//                                        ; = (|arg1|, 1, |arg2|, |arg3|)
//   xmm2 = shufps  $0x78, xmm2, xmm2     ; imm 0b01111000 → (v[0], v[2], v[3], v[1])
//                                        ; = (|arg1|, |arg2|, |arg3|, 1)
//   xmm2 = cmpneqps 0x1a0(%rdi), xmm2    ; per-lane: (new != cur)
//   movmskps %xmm2, %eax ; testl %eax,%eax ; je 0x1f9358 (return 0 — already equal)
//   ; store branch @0x1f9335: rebuild the same vector into xmm0 and write it.
//   movlhps %xmm0, %xmm1 ; blendps $0xc, @0x3c9fe0, %xmm0 ; shufps $0x4c, %xmm1, %xmm0
//                        ; shufps $0x78, %xmm0, %xmm0
//   → xmm0 = (|arg1|, |arg2|, |arg3|, 1.0)
//   movaps %xmm0, 0x1a0(%rdi)            ; params = (|a|, |b|, |c|, 1.0)
//   movl $1, %eax ; ret                   ; returned 1 (changed)
//   ; @0x1f9358: xorl %eax,%eax ; ret     ; returned 0 (unchanged)
// Semantic (idx==0 only):
//   this.params = (|arg1|, |arg2|, |arg3|, 1.0); return 1 if changed, 0 if same.
//   The 4th float argument (arg4) is LOADED into xmm3 but then IMMEDIATELY
//   overwritten by the abs-mask load at 0x1f92fe — so arg4 is IGNORED.
//
// GetOutput @0x1f9360:
//   1) r15 = renderer.GetInput(this, 0)                                  @0x1f9375
//   2) fast-path: if (params[0]==1.0 && params[1]==1.0 && params[2]==1.0)
//        return r15  (unchanged input)                                   @0x1f937d..0x1f93af
//      Uses `ucomiss` (ordered compare); each comparison branches on jne
//      OR jp — so NaN never enters the fast path.
//   3) node = HGObject::operator new(0x1c0)                              @0x1f93b5
//      bzero(node, 0x1c0)                                                @0x1f93ca
//      HgcPower::HgcPower()                                              @0x1f93d2
//      *(node) = 0xa2e408   (vtable for (anonymous namespace)::Power)   @0x1f93de
//      movups xmm0 (zero) → node[0x1a0..0x1af]                          @0x1f93e4
//      node[0x1b0] = null                                                @0x1f93ec
//   4) swap-cache:                                                       @0x1f93f7
//        prev = this.cachedOutputTail
//        if (prev != node) {
//          if (prev != null) prev.Release()   via *0x18                  @0x1f940b
//          this.cachedOutputTail = node                                  @0x1f9411
//          node.Retain()                       via *0x10                  @0x1f941b
//        }
//   5) cached = this.cachedOutputTail    (reload — always == node)       @0x1f941e
//      cached.SetInput(0, r15)   via *0x78                                @0x1f942d
//   6) cached.SetParameter(0, params[0], params[1], params[2], params[3])
//      via cached's vtbl *0x60. The SSE prep at 0x1f9437..0x1f944d puts:
//        xmm0 = params[0]  (movaps 0x1a0, then implicit lane[0] via SSE call ABI)
//        xmm1 = movshdup(params) = params.[1,1,3,3] → xmm1[0] = params[1]
//        xmm2 = movss 0x1a8 (params[2])
//        xmm3 = shufps $0xff, params  = params[3,3,3,3] → xmm3[0] = params[3]
//      matching the SetParameter float-arg calling convention.           @0x1f9456
//   7) r15 = this.cachedOutputTail  (reload)                             @0x1f9459
//      node.Release()                       via *0x18                    @0x1f9466
//      return r15
//   The exception epilogue @0x1f947f..0x1f94a1 Release()/delete()s the
//   local `node` and re-raises — pure C++ cleanup, not modeled here.
//
// DECODE-DON'T-FIT: HgcPower @0x1f93d2 and (anonymous namespace)::Power
// (vtable 0xa2e408) are NOT yet transcribed. The factory throws citing
// those addresses (@0x1f93d2 / @0xa2e408) so frontier.py sees the gap.

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Provenance-cited constants.
// ---------------------------------------------------------------------------

/**
 * @Helium 0x3c7c40 = 16 bytes of `1.0f, 1.0f, 1.0f, 1.0f` (0x3f800000 x 4).
 * Used by the ctor as both the compare template and the write value.
 * Reference @0x1f91aa (cmpneqps) and @0x1f91b9 (movaps).
 */
const CTOR_UNIT_PARAMS: readonly [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];

/**
 * @Helium 0x3c7cc0 = 0x3f800000 = 1.0f. Used by GetOutput as the
 * fast-path exponent test (params[i] == 1.0 → skip subgraph build).
 * References @0x1f9384, @0x1f9393, @0x1f93a6.
 */
const FAST_PATH_UNITY = 1.0;

/**
 * @Helium 0x3c7c30 = 16 bytes of `0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff`
 * (the SSE "sign-bit-clear" mask that produces `|x|` when ANDed with a float).
 * Referenced by SetParameter @0x1f92fe (movaps) and applied twice via `andps`.
 * We model the effect (per-lane `Math.abs` on the float32 value) rather than
 * the bit mask — SSE `andps` on IEEE-754 with 0x7fffffff yields exactly
 * `Math.fround(Math.abs(x))` for non-NaN, and preserves NaN payload; since
 * JS `Math.abs(NaN) === NaN` this preserves the NaN semantics too.
 */
// (No literal number needed — the mask is materialised as `Math.abs` below.
//  The address 0x3c7c30 is cited so the frontier can enumerate this literal.)

/**
 * @Helium 0x3c9fe0 = [0.0, 0.0, 0.0, 1.0] (bytes 00 00 00 00 x3 then 00 00 80 3f).
 * The "1 in the top lane" template that SetParameter uses to inject a 1.0
 * into params[3] via a blend + shuffle. Referenced @0x1f9311 (movaps for
 * the compare-vector) and @0x1f9338 (blendps for the store-vector). Both
 * uses produce the same final component (params[3] = 1.0).
 */
const SETPARAM_UNIT_TOP: readonly [number, number, number, number] = [0.0, 0.0, 0.0, 1.0];

// ---------------------------------------------------------------------------
// Undecoded-class stubs.
// ---------------------------------------------------------------------------

/**
 * `HgcPower` — the actual per-channel-power node (subclass wrapped by
 * `(anonymous namespace)::Power`). Vtable slots referenced by GetOutput
 * on the constructed instance: *0x10 Retain, *0x18 Release (inherited
 * HGObject), *0x60 SetParameter, *0x78 SetInput (inherited HGNode).
 * Ctor @Helium __ZN8HgcPowerC2Ev — not yet transcribed.
 */
export interface HgcPowerNode extends HGNode {
  SetParameter(idx: number, a: number, b: number, c: number, d: number): number;
}

/**
 * Factory: allocates 0x1c0 bytes, bzero, calls HgcPower ctor, installs
 * vtable @0xa2e408 (for `(anonymous namespace)::Power` — a subclass of
 * HgcPower whose D1/D0 tail-jump to HgcPower::~HgcPower). Then zeros
 * node[0x1a0..0x1af] and node[0x1b0].
 *
 * Throws until HgcPower is transcribed @Helium __ZN8HgcPowerC2Ev (0x1f93d2)
 * and (anonymous namespace)::Power is transcribed (vtable @0xa2e408).
 */
function newAnonPower(): HgcPowerNode {
  throw new Error(
    'HgcPower / (anonymous namespace)::Power ctor not yet transcribed @Helium __ZN8HgcPowerC2Ev (0x1f93d2) + vtable 0xa2e408',
  );
}

/**
 * `HGRenderer::GetInput` — @Helium __ZN10HGRenderer8GetInputEP6HGNodei
 * (@0x1f9375). Not yet transcribed as a full class; declared as an
 * interface for the one method GetOutput uses.
 */
export interface HGRendererCtx {
  GetInput(node: HGNode, idx: number): HGNode;
}

// ---------------------------------------------------------------------------
// HGPower
// ---------------------------------------------------------------------------

/**
 * `HGPower` — Helium node exposing a single 4-float `SetParameter(0,…)`
 * that sets a per-channel exponent vector, then builds an `HgcPower`
 * subgraph in `GetOutput` (with a no-op fast-path when all 3 supplied
 * exponents are exactly 1.0f).
 */
export class HGPower extends HGNode {
  /**
   * @Helium 0x1f9198: initialised to null by the ctor. Owned reference;
   * D2 @0x1f9245 Release()s if non-null via vcall *0x18.
   */
  cachedOutputTail: HGNode | null;

  /**
   * Per-channel exponents `[r, g, b, alpha-slot]`. Ctor @0x1f91a3..0x1f91c0
   * initialises to `[1, 1, 1, 1]` (unity — no-op). SetParameter(0, a, b, c, d)
   * writes `[|a|, |b|, |c|, 1.0]` (the 4th slot is always forced to 1.0
   * by the SSE shuffle idiom; arg4 `d` is ignored).
   */
  params: [number, number, number, number];

  /**
   * `HGPower::HGPower()` — Helium @0x1f9180 (C2) and @0x1f91d0 (C1,
   * identical). Chains HGNode::HGNode(), installs own vtable at (this),
   * nulls cachedOutputTail, initialises params[4] to 1.0 each (with the
   * compiler-inserted no-op-if-already-set guard).
   */
  constructor() {
    super();                                       // @0x1f9189
    this.vtable = 0xa2e1b0;                        // @0x1f9195 own vtable installed
    this.cachedOutputTail = null;                  // @0x1f9198
    // @0x1f91a3..0x1f91c0: params[0..3] = [1,1,1,1].
    // We eagerly set the vector — the ctor's cmpneq/skip pattern is a
    // compiler optimisation over uninitialised heap; the final observable
    // state after the ctor is unconditionally [1,1,1,1].
    this.params = [CTOR_UNIT_PARAMS[0], CTOR_UNIT_PARAMS[1], CTOR_UNIT_PARAMS[2], CTOR_UNIT_PARAMS[3]];
  }

  /**
   * `HGPower::~HGPower()` — Helium @0x1f9220 (D2), @0x1f9260 (D1),
   * @0x1f92a0 (D0). Reinstalls own vtable, Releases cachedOutputTail,
   * tail-jumps to HGNode::~HGNode().
   */
  destruct(): void {
    this.vtable = 0xa2e1b0;                        // @0x1f922d
    if (this.cachedOutputTail != null) {           // @0x1f9237
      this.cachedOutputTail.Release();             // @0x1f9245 vcall *0x18
      this.cachedOutputTail = null;
    }
    super.destruct();                              // @0x1f9251
  }

  /**
   * `HGPower::SetParameter(int idx, float a, float b, float c, float d)`
   * — Helium @0x1f92f0.
   *
   * @returns  1  if idx==0 AND the params vector actually changed
   *           0  if idx==0 AND the params vector was already equal
   *          -1  if idx != 0
   *
   * Semantic (idx==0): params = (|a|, |b|, |c|, 1.0). `d` is ignored
   * (arg4 is loaded into xmm3 which is then immediately overwritten
   * by the abs-mask constant at @0x1f92fe).
   *
   * The SSE build sequence for the "candidate" vector (shufps chain) is
   * documented in the file header; the effect is `(|a|, |b|, |c|, 1.0)`.
   */
  SetParameter(idx: number, a: number, b: number, c: number, _d: number): number {
    // @0x1f92f0..0x1f92f9: dispatch on idx.
    if (idx !== 0) {
      return -1;                                   // @0x1f92f9
    }

    // @0x1f92fe..0x1f930e: xmm0 = |a| ; xmm1 = (|b|, |c|, ?, ?).
    const na = Math.fround(Math.abs(Math.fround(a)));
    const nb = Math.fround(Math.abs(Math.fround(b)));
    const nc = Math.fround(Math.abs(Math.fround(c)));

    // @0x1f9311..0x1f9322: shuffle chain builds candidate = (|a|, |b|, |c|, 1.0).
    const cand: [number, number, number, number] = [na, nb, nc, SETPARAM_UNIT_TOP[3]];

    // @0x1f9326..0x1f9333: cmpneqps against current params — if all four
    // are equal (bitwise NEQ mask == 0), skip the store and return 0.
    // Reproduce with a strict float32 equality on each lane.
    const cur = this.params;
    const changed =
      Math.fround(cur[0]) !== cand[0] ||
      Math.fround(cur[1]) !== cand[1] ||
      Math.fround(cur[2]) !== cand[2] ||
      Math.fround(cur[3]) !== cand[3];

    if (!changed) {
      return 0;                                    // @0x1f9358 xorl %eax,%eax ; ret
    }

    // @0x1f9335..0x17934a: rebuild candidate (identical result) and store.
    this.params = [cand[0], cand[1], cand[2], cand[3]];
    return 1;                                       // @0x1f9351 movl $1, %eax
  }

  /**
   * `HGPower::GetOutput(HGRenderer* r)` — Helium @0x1f9360.
   *
   * Fast-path: if `params[0]==1.0 && params[1]==1.0 && params[2]==1.0`
   * (ordered SSE compares — NaN falls through to the slow path), return
   * `r.GetInput(this, 0)` unchanged.
   *
   * Slow path: allocate an `HgcPower`-subclass node (0x1c0 bytes), ctor
   * it, install the `(anonymous namespace)::Power` vtable @0xa2e408,
   * zero its own params slot (0x1a0..0x1b7). Then:
   *   - swap into `this.cachedOutputTail` (Release old, Retain new).
   *   - `cached.SetInput(0, input0)`   via vcall *0x78.
   *   - `cached.SetParameter(0, params[0..3])`   via vcall *0x60.
   *   - Release the temp reference; return the cached tail.
   */
  GetOutput(renderer: HGRendererCtx): HGNode {
    // @0x1f9375: input0 = r.GetInput(this, 0)
    const input0 = renderer.GetInput(this, 0);

    // @0x1f937d..0x1f93af: fast-path — check params[0..2] == 1.0f each.
    // NaN in any param makes at least one `ucomiss` set the PF, causing
    // `jne` or `jp` to leave the fast path; JS `===` on NaN is likewise
    // false, so this is faithful.
    const p0 = Math.fround(this.params[0]);
    const p1 = Math.fround(this.params[1]);
    const p2 = Math.fround(this.params[2]);
    if (p0 === FAST_PATH_UNITY && p1 === FAST_PATH_UNITY && p2 === FAST_PATH_UNITY) {
      // @0x1f9469: return r15 (=input0). No cache write, no allocation.
      return input0;
    }

    // @0x1f93b5..0x1f93ec: allocate + bzero + ctor + vtable-install + own-field zero.
    const node = newAnonPower();

    // @0x1f93f7..0x1f941e: swap-cache dance.
    const prev = this.cachedOutputTail;
    if (prev !== node) {
      if (prev != null) prev.Release();            // @0x1f940b vcall *0x18
      this.cachedOutputTail = node;                // @0x1f9411
      node.Retain();                               // @0x1f941b vcall *0x10
    }
    const cached = this.cachedOutputTail as HgcPowerNode;   // @0x1f941e reload

    // @0x1f9425..0x1f942d: cached.SetInput(0, input0)   via *0x78
    cached.SetInput(0, input0);

    // @0x1f9430..0x1f9456: cached.SetParameter(0, params[0], params[1], params[2], params[3])
    //   The SSE prep at 0x1f9437..0x1f944d splits the packed vector into
    //   the (xmm0..xmm3) float-arg registers. The observable call is the
    //   4-float SetParameter with the four params passed positionally.
    cached.SetParameter(0, this.params[0], this.params[1], this.params[2], this.params[3]);

    // @0x1f9459..0x1f9466: r15 = this.cachedOutputTail (=node); node.Release().
    const ret = this.cachedOutputTail as HGNode;
    node.Release();
    return ret;
  }
}
