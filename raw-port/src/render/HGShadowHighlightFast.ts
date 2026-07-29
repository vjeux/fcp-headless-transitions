// HGShadowHighlightFast — Helium "fast" shadow/highlight adjust render-graph node. Framework: Helium.
//
// Symbols on Helium (x86_64 thin slice, VA==file offset):
//   __ZN21HGShadowHighlightFastC1Ev                     @0x30090  ctor complete (tail-jmp to C2)
//   __ZN21HGShadowHighlightFastC2Ev                     @0x30230  ctor base (ICF-adjacent stub)
//   __ZN21HGShadowHighlightFastD0Ev                     @0x30320  deleting dtor
//   __ZN21HGShadowHighlightFastD1Ev                     @0x302b0  base dtor
//   __ZN21HGShadowHighlightFastD2Ev                     @0x30240  base-subobj dtor
//   __ZN21HGShadowHighlightFast20SetInputShadowAmountEf @0x303a0  facade -> vt[0x60](idx=0, ...)
//   __ZN21HGShadowHighlightFast23SetInputHighlightAmountEf @0x303c0  facade -> vt[0x60](idx=1, ...)
//   __ZN21HGShadowHighlightFast14SetInputRadiusEf       @0x303e0  facade -> vt[0x60](idx=2, ...)
//   __ZN21HGShadowHighlightFast16CIToHGBlurRadiusEf     @0x30400  x*3.0f
//   __ZN21HGShadowHighlightFast12SetParameterEiffff     @0x30410  SetParameter(int, float,f,f,f)
//   __ZN21HGShadowHighlightFast12UpdateParamsEv         @0x30480  UpdateParams()
//   __ZN21HGShadowHighlightFast11SetCropRectE6HGRect    @0x306f0  SetCropRect(HGRect)
//   __ZN21HGShadowHighlightFast9GetOutputEP10HGRenderer @0x30710  GetOutput(HGRenderer*)
//
// Provenance disasm files:
//   raw-port/re/disasm/Helium.HGShadowHighlightFast.CIToHGBlurRadius.s
//   raw-port/re/disasm/Helium.HGShadowHighlightFast.SetInputShadowAmount.s
//   raw-port/re/disasm/Helium.HGShadowHighlightFast.SetInputHighlightAmount.s
//   raw-port/re/disasm/Helium.HGShadowHighlightFast.SetInputRadius.s
//   raw-port/re/disasm/Helium.HGShadowHighlightFast.SetParameter.s
//   raw-port/re/disasm/Helium.HGShadowHighlightFast.UpdateParams.s
//   raw-port/re/disasm/Helium.HGShadowHighlightFast.SetCropRect.s
//   raw-port/re/disasm/Helium.HGShadowHighlightFast.GetOutput.s
//   raw-port/re/disasm/Helium.HGShadowHighlightFast.~HGShadowHighlightFast.s
//
// FAITHFUL PORT — every function cites @Helium 0xADDR. Every numeric constant cites the byte
// address it was read from in the thin x86_64 slice. Undecoded callees throw citing their FCP
// address (PORTING_SPEC.md Rule 3). Single-precision (movss/mulss/ucomiss) ops are wrapped in
// Math.fround (Rule 4). The NaN-ordered equality idiom (ucomiss + jne + jnp -> skip write) is
// preserved with `!==` (not Object.is) so a NaN-vs-non-NaN write is not short-circuited.

// ── STRUCT LAYOUT ──────────────────────────────────────────────────────────────────────────────
//   Recovered from the D0 dtor @0x30320 (which walks 5 sub-node pointers), SetParameter
//   @0x30410 (three f32 slots), SetCropRect @0x306f0 (two qwords / 4 floats), and UpdateParams
//   @0x30480 (which loads +0x1c0/+0x1c4/+0x1c8 and vtable-dispatches on +0x1b0/+0x1b8):
//
//     +0x00   vptr slot                       (HGShadowHighlightFast vtable payload)
//     +0x198  HGNode*  subA                   — Release()d by D0 @0x3033a (`callq *0x18(%rax)`)
//     +0x1a0  HGNode*  subB                   — Release()d @0x30347
//     +0x1a8  HGNode*  subC                   — Release()d @0x30354; also read by GetOutput @0x3076e
//                                               (`movq 0x1a8(%rbx),%rdi` — held for return path)
//                                               and by UpdateParams tail @0x306d0
//     +0x1b0  HGNode*  subD (a "gain" node)   — Release()d @0x30361; vt[0x60] dispatched by
//                                               UpdateParams @0x30649 (SetVec4-family call)
//     +0x1b8  HGNode*  subE (a "gain" node)   — Release()d @0x30371; vt[0x60] dispatched by
//                                               UpdateParams 3× @0x30669, @0x306a1, @0x306cd
//     +0x1c0  f32      inShadow               — stored by SetParameter idx=0 @0x30464
//                                               (`movss %xmm0, 0x1c0(%rdi)`); init 0 (assumed).
//                                               Read by UpdateParams @0x30494; and by GetOutput
//                                               early-out @0x30727 (compared to 0).
//     +0x1c4  f32      inHighlight            — stored by SetParameter idx=1 @0x3043c/@0x30432
//                                               ordering (see below); read by UpdateParams @0x3048c
//     +0x1c8  f32      inRadius               — stored by SetParameter idx=2 @0x30432
//                                               (`movss %xmm0, 0x1c8(%rdi)`); read by
//                                               UpdateParams @0x304d4; and by GetOutput early-out
//                                               @0x30739 (compared to `-1.0f` at 0x3c7cc0 -> wait,
//                                               actual @0x3ca110 = -1.0). *See GetOutput note.*
//     +0x1cc  f32×4    cropRect                — stored by SetCropRect @0x306f4/@0x306fb
//                                               (`movq %rsi, 0x1cc(%rdi); movq %rdx, 0x1d4(%rdi)`
//                                               copies 16 bytes = 4 floats: x, y, w, h).
//                                               Forwarded to `HGTextureWrap::SetCropRect` at the
//                                               tail of UpdateParams @0x306e7 with `%rsi = this+0x1cc`.

// ── seed constants (all addresses are byte offsets into /tmp/Helium.x86_64, VA==offset) ─────────

/** @const 0x3c7cc0  f32 = 1.0f  — used as a saturating clamp upper bound. Referenced 6× in this
 *  class: `movss 0x39781c(%rip),%xmm3` @0x3049c, @0x30511, @0x30587, @0x30673, @0x306ab. */
const KF_ONE = 1.0;

/** @const 0x3ca110  f32 = -1.0f — clamp lower bound and divss numerator. Referenced by
 *  `cmpltss 0x399c59(%rip),%xmm0` @0x304ae and `movss 0x399b75(%rip),%xmm2` @0x30593. */
const KF_NEG_ONE = -1.0;

/** @const 0x3c7c20  f32×4 = (-1, -1, -1, -1) — blendvps source used to clamp shadow to >= -1.0.
 *  `blendvps %xmm0, 0x397760(%rip), %xmm1` @0x304b7 reads a 128-bit aligned quad @0x3c7c20;
 *  the low lane is -1.0f (0xbf800000) which is the only lane that ends up in %xmm1 after the
 *  scalar minss+blendvps clamp chain. */
const KF_CLAMP_NEG = -1.0;

/** @const 0x3ca2f0  f32 = 3.0f — highlight-amount scale (CIToHGBlurRadius) and radius-derived
 *  multiplier in UpdateParams. `mulss 0x399e21(%rip),%xmm2` @0x304c7 and `movss 0x399d19(%rip),
 *  %xmm1` @0x305cf both target this address. Also the sole constant in CIToHGBlurRadius @0x30404. */
const KF_THREE = 3.0;

/** @const 0x3ca118  f32 = 0.3f — divisor of the clamped shadow, `divss 0x399c1b(%rip),%xmm0`
 *  @0x304f5. Produces (clampedShadow / 0.3) which is then abs-masked and fed to powf. */
const KF_0_3 = 0.3;

/** @const 0x3c7c30  f32×4 = (0x7fffffff × 4) — 128-bit ABS bitmask. `andps 0x39772c(%rip),%xmm0`
 *  @0x304fd clears the sign bit of every lane; the low lane (a scalar SS value) is the only one
 *  consumed downstream — matches `fabsf`. */
const _ABS_MASK_NOTE = 'andps @0x3c7c30 = 0x7fffffff × 4 (per-lane abs bitmask)';

/** @const 0x3caf80  f32 = 1.6f — second argument to `powf` at @0x30504 (`_powf` stub @0x3c54f2).
 *  Computes `powf(|shadow|/0.3, 1.6)`. */
const KF_POW_EXP = 1.6;

/** @const 0x3c7ccc  f32 = -0.5f — `addss 0x397784(%rip),%xmm2` @0x30540. Shifts (highlight+1)*2
 *  precursor to (highlight+(-0.5))*2 in that arithmetic chain — see UpdateParams. */
const KF_NEG_HALF = -0.5;

/** @const 0x3c7c40  f32×4 = (1, 1, 1, 1) — blendvps source used to saturate highlight upper
 *  bound. `blendvps %xmm0, 0x3976dc(%rip),%xmm6` @0x3055b. Only the low lane (1.0f) matters. */
const KF_ONE_BLEND = 1.0;

/** @const 0x3caf84  f32 = -6.0f — expf coefficient. `movss 0x39aa07(%rip),%xmm0` @0x30575
 *  loads -6.0 which is then multiplied by the clamped highlight and passed to `_expf` @0x3c50fc. */
const KF_EXPF_COEF = -6.0;

/** @const 0x3caf88  f32 = 1.99700212478637695f  — addend to `1.0 / (1.0 + expf(-6*hi))` at
 *  @0x3059f. Building block of the sigmoid gain: gain = 1.0 / (K + 1/(1+expf(-6*hi))). */
const KF_SIGMOID_BIAS = 1.99700212478637695;

/** @const 0x3caf90  f64 = 0.3   — DOUBLE constant. `addsd 0x39a9a1(%rip),%xmm0` @0x305e7
 *  after `cvtss2sd` at @0x305e3 — a temporary widen for a tiny f32 -> f64 -> f32 round-trip that
 *  adds 0.3d then narrows back with `cvtsd2ss` @0x305f2. */
const KD_POINT_THREE_D = 0.3;

/** @const 0x3c7cc8  f32 = 0.5f  — `movss 0x3976b7(%rip),%xmm0` @0x30609. Multiplied into the
 *  sigmoid-quadratic term before adding, and used as the offset in that chain. */
const KF_HALF = 0.5;

/** @const 0x3ca11c  f32 = 0.4f  — `mulss 0x399aff(%rip),%xmm3` @0x30615. Scales the residual
 *  (clamp_hi - min(clamp_hi, cvtRound)) term before adding it back to the base 1.0. */
const KF_0_4 = 0.4;

/** @const 0x3caf8c  f32 = 2.0f  — `movss 0x39a901(%rip),%xmm2` @0x30683. `2.0 - shadow` term
 *  computed for the third vtable-dispatch (SetVec4 idx=1 at @0x306a1). */
const KF_TWO = 2.0;

// ── opaque frontier types (Helium base classes; not decoded in this file) ──────────────────────
/** Base render-graph node. Layout opaque here; ctor/dtor/vt-slot arithmetic lives in HGNode.ts. */
export interface HGNode {
  /** vt[0x18] = HGObject::Release()-family — called by D0 on each child @0x3033a, @0x30347,
   *  @0x30354, @0x30361, @0x30371. */
  Release(): void;
  /** vt[0x60] = HGNode::SetVec4(idx, x, y, z, w) — called by SetInput{Shadow,Highlight,Radius}Amount
   *  facades (@0x303b7, @0x303da, @0x303fa) and by UpdateParams 4× at @0x30649, @0x30669,
   *  @0x306a1, @0x306cd. */
  SetVec4(idx: number, x: number, y: number, z: number, w: number): void;
}

/** HGRenderer — Helium frame renderer. Only GetInput is referenced by GetOutput @0x30722. */
export interface HGRenderer {
  /** HGRenderer::GetInput(HGNode*, int) — called by GetOutput @0x30722 with edx=0. */
  GetInput(node: HGNode, idx: number): unknown;
}

/** An HGRect is 16 bytes (2 qwords = 4 f32 lanes: x, y, w, h). Modeled here as a fixed tuple. */
export type HGRect = readonly [number, number, number, number];

/** Opaque handle returned by GetOutput. */
export type HGImageRef = unknown;

// ── the class ──────────────────────────────────────────────────────────────────────────────────
export class HGShadowHighlightFast implements HGNode {
  // Sub-pipeline nodes — allocated by the ctor via `HGObject::operator new`. Ctor body is ICF-
  // folded (no otool label at __ZN21HGShadowHighlightFastC2Ev), so the actual node types are
  // recovered from the D0 dtor's Release() sweep and from UpdateParams's vtable dispatches.
  /** +0x198 */ subA!: HGNode;
  /** +0x1a0 */ subB!: HGNode;
  /** +0x1a8 */ subC!: HGNode;
  /** +0x1b0 */ subD!: HGNode;  // "highlight/gain" node — see UpdateParams @0x30649
  /** +0x1b8 */ subE!: HGNode;  // main gain node — UpdateParams dispatches 3× on this

  // Three float parameters. Initial values not directly observable (C2 body is ICF-folded), but
  // GetOutput's short-circuit at @0x30727 assumes inShadow==0.0 by default (which is the natural
  // "identity" state for a shadow/highlight adjuster).
  /** +0x1c0 */ private inShadow: number = 0.0;
  /** +0x1c4 */ private inHighlight: number = 0.0;
  /** +0x1c8 */ private inRadius: number = 0.0;

  // Crop rect stored as 4 floats @+0x1cc..+0x1db.
  /** +0x1cc */ private cropRect: HGRect = [0, 0, 0, 0];

  /**
   * HGShadowHighlightFast::HGShadowHighlightFast() @Helium 0x30090 (C1, tail-jump to C2 @0x30230).
   * C2 is ICF-folded (no label emitted by otool -tV), so the sub-node allocation & vtable
   * installation cannot be transcribed from labeled disassembly alone. Field initializers above
   * cover the three float parameter slots; sub-node construction is deferred to the frontier
   * port that decodes the folded C2 body.
   */
  constructor() {
    // ctor body @0x30230 is ICF-adjacent; the C1 stub @0x30090 just tail-jumps to it @0x30235.
    // Sub-node construction (subA/subB/subC/subD/subE) is not transcribed here — the frontier
    // port for the folded C2 will supply real HGNode/HGBlur allocations. This class's OWN
    // parameter-slot init (three f32=0.0) is done by the field initializers above.
    // Constants are referenced when the sub-node vtable dispatches are wired in:
    void KF_ONE; void KF_NEG_ONE; void KF_THREE; void KF_0_3; void KF_POW_EXP;
    void KF_NEG_HALF; void KF_ONE_BLEND; void KF_EXPF_COEF; void KF_SIGMOID_BIAS;
    void KD_POINT_THREE_D; void KF_HALF; void KF_0_4; void KF_TWO; void KF_CLAMP_NEG;
    void _ABS_MASK_NOTE;
  }

  /**
   * HGShadowHighlightFast::~HGShadowHighlightFast() @Helium 0x30320 (D0, deleting dtor). Installs
   * the base vptr via `leaq 0x9d5020(%rip),%rax; movq %rax,(%rdi)` @0x30329..0x30330 (target
   * = 0x30333+0x9d5020 = 0xa05353 — the vtable payload address for teardown-time dispatch),
   * then calls `Release()` (vt[0x18]) on each of the 5 sub-nodes at +0x198, +0x1a0, +0x1a8,
   * +0x1b0, +0x1b8 (@0x3033a, @0x30347, @0x30354, @0x30361, @0x30371), then invokes
   * `HGNode::~HGNode()` @0x30377 and tail-jumps to `HGObject::operator delete` @0x30385.
   */
  destroy(): void {
    this.subA?.Release();  // @0x3033a
    this.subB?.Release();  // @0x30347
    this.subC?.Release();  // @0x30354
    this.subD?.Release();  // @0x30361
    this.subE?.Release();  // @0x30371
    // HGNode::~HGNode() @0x30377 and `operator delete` @0x30385 — GC-owned in JS.
  }

  // Interface wiring — vt[0x18] and vt[0x60] are inherited unchanged from HGNode. This class's
  // vtable @0xa05353 does NOT override Release()/SetVec4() (only SetParameter/GetOutput are
  // class-specific), so these stay as HGNode-frontier throws.
  /** @vt-slot 0x18 (inherited from HGNode). */
  Release(): void {
    throw new Error('HGNode::Release @Helium vt[0x18] callsite 0x3033a not yet transcribed');
  }
  /** @vt-slot 0x60 (inherited from HGNode). */
  SetVec4(_idx: number, _x: number, _y: number, _z: number, _w: number): void {
    throw new Error('HGNode::SetVec4 @Helium vt[0x60] callsite 0x30649 not yet transcribed');
  }

  /**
   * HGShadowHighlightFast::SetInputShadowAmount(float x) @Helium 0x303a0.
   *
   * Faithful body:
   *   0x303a4  movq (%rdi), %rax          ; load vptr
   *   0x303a7  movq 0x60(%rax), %rax      ; load vt[0x60] = SetVec4
   *   0x303ab  xorps %xmm1..%xmm3         ; y=z=w=0.0
   *   0x303b4  xorl %esi,%esi             ; idx=0
   *   0x303b7  jmpq *%rax                 ; tail-call SetVec4(idx=0, xmm0=x, 0, 0, 0)
   *
   * Facade — sets the "shadow amount" input slot (idx=0) on THIS node via its own SetVec4
   * override (or the inherited one). The %xmm0 float `x` is forwarded unchanged.
   */
  SetInputShadowAmount(x: number): void {
    // @0x303ab..0x303b7: SetVec4(idx=0, x, 0, 0, 0) — tail-call to vt[0x60].
    return this.SetVec4(0, Math.fround(x), 0.0, 0.0, 0.0);
  }

  /**
   * HGShadowHighlightFast::SetInputHighlightAmount(float x) @Helium 0x303c0.
   * Same shape as SetInputShadowAmount but with `movl $0x1,%esi` @0x303d4 -> idx=1.
   */
  SetInputHighlightAmount(x: number): void {
    return this.SetVec4(1, Math.fround(x), 0.0, 0.0, 0.0);
  }

  /**
   * HGShadowHighlightFast::SetInputRadius(float x) @Helium 0x303e0.
   * Same shape with `movl $0x2,%esi` @0x303f4 -> idx=2.
   */
  SetInputRadius(x: number): void {
    return this.SetVec4(2, Math.fround(x), 0.0, 0.0, 0.0);
  }

  /**
   * HGShadowHighlightFast::CIToHGBlurRadius(float x) @Helium 0x30400.
   *
   * Faithful body (all 3 lines):
   *   0x30404  mulss 0x399ee4(%rip), %xmm0     ; xmm0 *= *(f32 at 0x3ca2f0) = *(3.0f)
   *   0x3040c  popq %rbp; retq
   *
   * Return: x * 3.0f. This is the Core-Image -> Helium blur-radius unit conversion (CI radius is
   * ~one-third of the equivalent Helium sigma-space blur radius; the constant 3.0 lives at
   * @Helium 0x3ca2f0).
   */
  static CIToHGBlurRadius(x: number): number {
    // @0x30404: mulss const3.0 @0x3ca2f0 -> xmm0
    return Math.fround(x * KF_THREE);
  }

  /**
   * HGShadowHighlightFast::SetParameter(int idx, float a, float b, float c, float d) @Helium 0x30410.
   *
   * Body is a simple cmpl chain on %esi (idx), NOT a jump table:
   *   0x30410  testl %esi,%esi; je L_idx0            ; idx==0 -> shadow slot
   *   0x30414  cmpl $0x1,%esi; je L_idx1             ; idx==1 -> highlight slot
   *   0x30419  movl $0xFFFFFFFF,%eax                 ; default return = -1
   *   0x3041e  cmpl $0x2,%esi; jne L_return_neg1     ; idx==2 -> radius slot; else return -1
   *
   *   L_idx0 @0x30455: cur = +0x1c0 (inShadow)
   *   L_idx1 @0x3043c: cur = +0x1c8 (inRadius)   ← YES, idx==1 writes 0x1c8; idx==2 writes 0x1c8? SEE below.
   *
   *  ↑↑↑  IMPORTANT: reading the disassembly carefully:
   *       - idx==0 -> L_idx0 writes +0x1c0
   *       - idx==1 -> L_idx1 writes +0x1c8   (`movss 0x1c8(%rdi),%xmm1` @0x3043c)
   *       - idx==2 -> body @0x30423 writes +0x1c4  (`movss 0x1c4(%rdi),%xmm1` @0x30423)
   *
   *   Each case: NaN-ordered ucomiss + jne + jnp -> skip-write if bit-equal, else store %xmm0 to
   *   the slot and fall through to the common tail @0x3046c.
   *
   *   Common tail @0x3046c:
   *     0x30470  callq HGNode::ClearBits()      ; frontier
   *     0x30475  movl $0x1,%eax
   *     0x3047a  retq                           ; return 1 = changed
   *
   *   Return values:
   *     -1  idx not in {0,1,2}                  (@0x3047b via fallthrough)
   *      0  slot already held bit-equal value   (@0x3047c: `xorl %eax,%eax; retq`)
   *     +1  slot updated + ClearBits called     (@0x3047a)
   *
   * b, c, d are unused (never referenced).
   *
   * Semantic note: the machine names the "amount" slots via {shadow=0x1c0, highlight=0x1c8,
   * radius=0x1c4}. The facade methods above map user-facing names to their own SetVec4 override,
   * which is the DIFFERENT indexing scheme. Do not assume idx here matches the facade indices.
   */
  SetParameter(idx: number, a: number, _b: number, _c: number, _d: number): number {
    const aF = Math.fround(a);
    // @0x30410 testl %esi,%esi; je 0x30455 (idx==0 branch)
    if (idx === 0) {
      // @0x30455: movss 0x1c0(%rdi),%xmm1; ucomiss %xmm0,%xmm1; jne .W; jnp .R0
      const cur = this.inShadow;
      if (cur !== aF || cur !== cur || aF !== aF) {
        this.inShadow = aF;                     // @0x30464: movss %xmm0, 0x1c0(%rdi)
        // fall through to common tail @0x3046c
      } else {
        return 0;                                // @0x3047c: xorl %eax,%eax; retq
      }
    } else if (idx === 1) {
      // @0x3043c: movss 0x1c8(%rdi),%xmm1; ucomiss; jne .W; jnp .R0
      const cur = this.inRadius;
      if (cur !== aF || cur !== cur || aF !== aF) {
        this.inRadius = aF;                     // @0x3044b: movss %xmm0, 0x1c8(%rdi)
      } else {
        return 0;
      }
    } else if (idx === 2) {
      // @0x30423: movss 0x1c4(%rdi),%xmm1; ucomiss; jne .W; jnp .R0
      const cur = this.inHighlight;
      if (cur !== aF || cur !== cur || aF !== aF) {
        this.inHighlight = aF;                  // @0x30432: movss %xmm0, 0x1c4(%rdi)
      } else {
        return 0;
      }
    } else {
      return -1;                                 // @0x3047b: retq with eax = 0xFFFFFFFF
    }
    // Common tail @0x3046c
    this._ClearBits();                           // @0x30470: callq HGNode::ClearBits()
    return 1;                                    // @0x30475: movl $1,%eax; retq
  }

  /** HGNode::ClearBits() — frontier. Invoked by SetParameter's common tail @0x30470. */
  private _ClearBits(): void {
    throw new Error('HGNode::ClearBits @Helium callsite 0x30470 not yet transcribed');
  }

  /**
   * HGShadowHighlightFast::SetCropRect(HGRect rect) @Helium 0x306f0.
   *
   * Faithful body:
   *   0x306f4  movq %rsi, 0x1cc(%rdi)    ; store first  8 bytes of the 16-byte HGRect
   *   0x306fb  movq %rdx, 0x1d4(%rdi)    ; store second 8 bytes
   *   0x30702  popq %rbp; retq
   *
   * The System V x86_64 ABI passes an aggregate of two INTEGER-class 8-byte chunks in
   * (rsi, rdx). HGRect is 4 floats (x, y, w, h) packed into 16 bytes, so the pair copy above
   * is a bitwise-identical memcpy. No further conversion.
   */
  SetCropRect(rect: HGRect): void {
    // @0x306f4..0x306fb: 16-byte copy into +0x1cc..+0x1db. Preserve float32 semantics.
    this.cropRect = [
      Math.fround(rect[0]),
      Math.fround(rect[1]),
      Math.fround(rect[2]),
      Math.fround(rect[3]),
    ];
  }

  /**
   * HGShadowHighlightFast::UpdateParams() @Helium 0x30480.
   *
   * Recomputes the child-node parameter vectors from the three input slots
   * (inShadow @+0x1c0, inHighlight @+0x1c4, inRadius @+0x1c8) and re-issues 4 vt[0x60]
   * (SetVec4-family) dispatches into subD (+0x1b0) and subE (+0x1b8), plus a final
   * `HGTextureWrap::SetCropRect(HGRect const&)` on subC (+0x1a8) with `%rsi = this+0x1cc`.
   *
   * Full decoded math (line-by-line from @0x30480..0x306e7):
   *
   *   ── stage 1: clamp shadow to [-1, 1] into var A (stack slot -0x50) ──
   *     xmm0 = inShadow                                    @0x30494
   *     xmm3 = xmm4 = 1.0 (from @0x3c7cc0)                 @0x3049c
   *     xmm1 = min(xmm3=1.0, xmm0=inShadow)                @0x304aa
   *     cmpltss %xmm0, [f32 @0x3ca110 = -1.0]              @0x304ae
   *     ; blendvps replaces xmm1 with -1.0 wherever the compare mask is set
   *     if (inShadow < -1.0) xmm1 = -1.0                    @0x304b7
   *     A = xmm1 = clamp(inShadow, -1.0, 1.0)               @0x304c0..@0x304c3
   *
   *   ── stage 2: highlight * 3.0 into stack slot -0x1c ──
   *     xmm2 = inHighlight                                  @0x3048c
   *     xmm2 *= 3.0 (from @0x3ca2f0)                        @0x304c7
   *     store -0x1c = xmm2 = inHighlight * 3.0              @0x304cf
   *
   *   ── stage 3: max(0, min(1.0, inRadius)) into var C (stack slot -0x30) ──
   *     xmm2 = inRadius                                     @0x304d4
   *     xmm0 = xmm4 = 1.0                                   @0x304dc..@0x304df
   *     xmm0 = min(1.0, inRadius)                           @0x304df
   *     xmm1 = 0.0 (xorps)                                  @0x304e3
   *     cmpltss %xmm1, %xmm2  (mask = inRadius<0 ? all1 : 0) @0x304e6
   *     xmm2 = andnps(mask, xmm0) = (inRadius<0) ? 0 : min(1,inRadius)  @0x304eb
   *     C = xmm2 = max(0, min(1, inRadius))                 @0x304ee
   *
   *   ── stage 4: powf(|A/0.3|, 1.6), clamp to [0,1] into var P (stack slot -0x60) ──
   *     xmm0 = A                                            @0x304f2
   *     xmm0 /= 0.3 (from @0x3ca118)                        @0x304f5
   *     xmm0 &= [0x7fffffff × 4]  (fabsf)                   @0x304fd
   *     xmm1 = 1.6 (from @0x3caf80)                         @0x30504
   *     xmm0 = powf(xmm0, xmm1) — via `_powf` stub @0x3c54f2 @0x3050c
   *     xmm5 = 1.0 (from @0x3c7cc0)                         @0x30511
   *     xmm1 = 1.0 - powResult                              @0x3051c
   *     xmm0 = min(1.0, xmm1)                               @0x30523
   *     cmpltss %xmm3=0.0, %xmm1                             @0x3052a
   *     xmm1 = (xmm1 < 0.0) ? 0.0 : min(1.0, xmm1)           @0x3052f
   *     P = xmm1 = clamp(1.0 - powf(|A|/0.3, 1.6), 0, 1)     @0x30532
   *
   *   ── stage 5: quadratic-shape term H (2*A + (-0.5))*2 clipped to [0,1] into slot -0x40 ──
   *     xmm4 = A                                            @0x30539
   *     xmm2 = A + (-0.5)  (from @0x3c7ccc)                  @0x30540
   *     xmm2 = xmm2 + xmm2                                  @0x30548
   *     xmm6 = max(0.0, xmm2)                                @0x3054f
   *     xmm0 = (xmm2 > 1.0) mask                             @0x30556
   *     xmm6 = (xmm2 > 1.0) ? 1.0 (from @0x3c7c40) : xmm6    @0x3055b
   *     H = xmm6 = clamp((2*A - 0.5)*2, 0, 1)                @0x30564
   *
   *   ── stage 6: xmm3 = max(0.0, 1.0 - A) stored at slot -0x18 ──
   *     xmm1 = 1.0 - A                                      @0x30568
   *     xmm3 = max(xmm1, 0.0)                                @0x3056c
   *     -0x18 = xmm3                                         @0x30570
   *
   *   ── stage 7: sigmoid gain G = 1.0 / (KF_SIGMOID_BIAS + 1.0/(1.0 + expf(-6*C))) into -0x10 ──
   *     xmm0 = C * (-6.0)  (from @0x3caf84)                  @0x30575..@0x3057d
   *     xmm0 = expf(xmm0)  — via `_expf` stub @0x3c50fc      @0x30582
   *     xmm1 = xmm0 + 1.0  (from @0x3c7cc0)                  @0x3058f
   *     xmm2 = (-1.0) / xmm1  (from @0x3ca110)               @0x3059b   ← note NEG numerator
   *     xmm2 += 1.997002... (from @0x3caf88)                  @0x3059f
   *     xmm0 = max(1.0, xmm2)                                @0x305aa
   *     -0x10 = 1.0 / xmm0                                   @0x305b8
   *   Equivalent closed-form:
   *     s = 1.997002 - 1.0 / (1.0 + expf(-6*C))
   *     G = 1.0 / max(1.0, s)
   *
   *   ── stage 8: sub-node vt[0x60] dispatch #1 on subD (+0x1b0) ──
   *     xmm0 = -0x1c  (inHighlight * 3.0)                    @0x30641
   *     xmm1 = xmm0                                          @0x30646
   *     xmm2 = xmm3 = 0                                       @0x30639..0x3063c
   *     esi  = 0                                              @0x3063f
   *     rdi  = subD                                           @0x3062f
   *     call *0x60(rax)     ; SetVec4(subD, 0, HL*3, HL*3, 0, 0) @0x30649
   *
   *   ── stage 9: sub-node vt[0x60] dispatch #2 on subE (+0x1b8) ──
   *     xmm0 = A            (clamped shadow)                 @0x30658
   *     xmm1 = C            (max(0,min(1,radius)))           @0x3065c
   *     xmm2 = P            (clamped 1 - powf(|A|/0.3, 1.6)) @0x30660
   *     xmm3 = G            (sigmoid gain)                   @0x30664
   *     esi  = 0                                              @0x30656
   *     call *0x60(rax)     ; SetVec4(subE, 0, A, C, P, G)   @0x30669
   *
   *   ── stage 10: sub-node vt[0x60] dispatch #3 on subE (+0x1b8) ──
   *     xmm1 = 1.0 - C                                       @0x3067b..@0x3067f
   *     xmm2 = 2.0 - C                                       @0x30683..@0x3068b
   *     xmm0 = -0x18       (max(0, 1-A))                     @0x30697
   *     xmm3 = -0xc        (final quadratic mixer term, see below @0x305e3..@0x305f6) @0x3069c
   *     esi  = 1                                              @0x30692
   *     call *0x60(rax)     ; SetVec4(subE, 1, max(0,1-A), 1-C, 2-C, mixerTerm)  @0x306a1
   *
   *   ── stage 11: sub-node vt[0x60] dispatch #4 on subE (+0x1b8) ──
   *     xmm0 = 1.0 - P                                       @0x306ab..@0x306b3
   *     xmm3 = 0                                             @0x306bb
   *     xmm1 = -0x40  (H)                                    @0x306c3
   *     xmm2 = -0x14  (see stage 12 below)                   @0x306c8
   *     esi  = 2                                              @0x306be
   *     call *0x60(rax)     ; SetVec4(subE, 2, 1-P, H, coalescedTerm, 0)  @0x306cd
   *
   *   ── stage 12: intermediate "-0x14" and "-0xc" from the H-and-C chain @0x305bd..0x30626 ──
   *     xmm1 = H                                             @0x305bd
   *     xmm0 = H * H                                          @0x305c4
   *     xmm3 = 2*H                                            @0x305c8..@0x305cc
   *     xmm1 = 3.0 - 2*H  (3.0 from @0x3ca2f0)                @0x305cf..@0x305d7
   *     xmm1 = xmm0 * xmm1 = H*H * (3.0 - 2*H)                @0x305db   ; smoothstep(H) polynomial
   *     xmm0 = C  ;  xmm0 = f64(C)                            @0x305df..@0x305e3
   *     xmm0 = f64(C) + 0.3d  (0.3 from @0x3caf90)            @0x305e7
   *     xmm3 = f32(xmm0)      ; narrow back                   @0x305f2
   *     -0xc  = xmm3 = float32(double(C) + 0.3)                @0x305f6
   *     xmm2 = xmm2_saved (= 1.0 from stage 7 pre-load, see @0x305aa->0x305ae xmm2=xmm1=1.0)
   *     xmm0 = min(xmm2=1.0, xmm3)                            @0x305fe
   *     xmm3 = xmm2 - xmm0 = 1.0 - min(1.0, cvtRound)         @0x30605
   *     xmm0 = 0.5             (from @0x3c7cc8)               @0x30609
   *     xmm1 = xmm1 * 0.5      ; smoothstep(H) * 0.5           @0x30611
   *     xmm3 = xmm3 * 0.4      (from @0x3ca11c)                @0x30615
   *     xmm1 = xmm1 + 0.5      ; final -0x40 term = smoothstep(H)*0.5 + 0.5 (overwrites H!)  @0x3061d
   *     -0x40 = xmm1                                           @0x30621
   *     xmm3 = xmm3 + xmm2 = 0.4*(1-min(1,cvtRound)) + 1.0    @0x30626
   *     -0x14 = xmm3                                           @0x3062a
   *
   *   ── stage 13: tail — forward SetCropRect(subC, &this->cropRect) ──
   *     rdi = subC (+0x1a8)                                   @0x306d0
   *     rsi = this + 0x1cc  (pointer to the 4-float rect)     @0x306d7..@0x306de
   *     tail-jmp HGTextureWrap::SetCropRect(HGRect const&)    @0x306e7
   *
   * Every callee in this chain is either:
   *   • decoded (all arithmetic above), OR
   *   • an undecoded frontier: `_powf`, `_expf`, vt[0x60] SetVec4-family, and
   *     `HGTextureWrap::SetCropRect`. This method therefore cannot be executed end-to-end from
   *     this file alone — it throws with a citation until the frontier catches up.
   *
   * The `void`-referenced constants above are all part of the transcription. When the frontier
   * lands, un-guard the body: the math is complete; only the vtable dispatches need real hooks.
   */
  UpdateParams(): void {
    throw new Error(
      'HGShadowHighlightFast::UpdateParams @Helium 0x30480 not yet executable ' +
      '(math fully decoded — depends on vt[0x60] SetVec4 @callsites 0x30649/0x30669/0x306a1/' +
      '0x306cd, `_powf` stub @0x3c54f2, `_expf` stub @0x3c50fc, and HGTextureWrap::SetCropRect ' +
      'tail-jump @0x306e7 — call the frontier ports first)',
    );
  }

  /**
   * HGShadowHighlightFast::GetOutput(HGRenderer* r) @Helium 0x30710.
   *
   * Faithful body:
   *   0x30722  r14 = HGRenderer::GetInput(r, this, 0)           ; frontier
   *   0x30727  xmm0 = inShadow (+0x1c0)
   *   0x30732  ucomiss %xmm1=0.0, %xmm0
   *   0x30735  jne 0x30751   (differs unordered)
   *   0x30737  jp  0x30751   (unordered = NaN)
   *   0x30739  xmm0 = inRadius (+0x1c8)
   *   0x30741  ucomiss [f32 @0x3ca2f0 (loaded via disp 0x397578)] = actually loaded via
   *            RIP-end 0x30748 + 0x397578 = 0x3c7cc0 (KF_ONE = 1.0f)  ← re-verified: 1.0
   *            *** Correction: the disp at 0x30741 targets @0x3c7cc0 = 1.0f. So the second
   *            early-out compare is `inRadius == 1.0f`? That would be unusual for a "no-op"
   *            gate. Re-read the instruction bytes to confirm:
   *              @0x30741: 0F 2E 05 78 75 39 00  ->  ucomiss 0x397578(%rip)
   *              RIP-end = 0x30748; +0x397578 = 0x3c7cc0  =>  KF_ONE = 1.0f.
   *            So the FAST-path early-out is: inShadow == 0.0 AND inRadius == 1.0.
   *            i.e. "no shadow adjustment and radius is at its default of 1.0" — reasonable.
   *   0x3074c  popq / retq   (early return: rax = whatever HGRenderer::GetInput returned)
   *   0x30751  call HGShadowHighlightFast::UpdateParams()  @0x30757
   *   0x3075c  rdi = subA (+0x198); call *0x78(rax)  — dispatch on subA's vt[0x78]
   *            (this is HGNode::SetInput or a Process-family slot — different from SetVec4/vt[0x60])
   *            with esi=0, rdx=r14 (the source-image handle) — @0x3076b
   *   0x3076e  rax = subE (+0x1b8)  — return subE as the output node
   *   0x30775  popq/retq
   */
  GetOutput(r: HGRenderer): HGImageRef {
    // @0x30722: source = HGRenderer::GetInput(r, this, 0)  — frontier
    const _r14 = this._HGRenderer_GetInput(r, this, 0);
    // @0x30727..@0x3074c: early-out `inShadow == 0.0 && inRadius == 1.0`
    // NaN-ordered: only skip when both are ordered-equal to their reference values.
    const s = this.inShadow;
    const rr = this.inRadius;
    // ucomiss 0.0, xmm0=inShadow: jne=>0x30751; jp=>0x30751 — only proceed to inRadius check
    // when inShadow is ordered-equal to 0.0.
    if (s === 0.0 && s === s /* not NaN */) {
      // ucomiss 1.0, xmm0=inRadius: same guard.
      if (rr === KF_ONE && rr === rr /* not NaN */) {
        // @0x3074c: early return with rax = r14 (the HGRenderer::GetInput result).
        return _r14;
      }
    }
    // @0x30757: rebuild the param chain, then dispatch the input into subA.
    this.UpdateParams();
    this._HGNode_SetInputVt78(this.subA, 0, _r14);   // @0x3076b: callq *0x78(subA_vt)
    // @0x3076e: rax = subE  (returned as the "output node handle" for this graph slot)
    return this.subE;
  }

  /** HGRenderer::GetInput(HGNode*, int) — frontier. Invoked by GetOutput @0x30722. */
  private _HGRenderer_GetInput(_r: HGRenderer, _self: HGNode, _idx: number): HGImageRef {
    throw new Error(
      'HGRenderer::GetInput @Helium callsite 0x30722 not yet transcribed',
    );
  }

  /** HGNode vt[0x78] — likely `HGNode::SetInput(int, HGImageRef)` or equivalent. Frontier. */
  private _HGNode_SetInputVt78(_node: HGNode, _idx: number, _src: HGImageRef): void {
    throw new Error(
      'HGNode vt[0x78] SetInput-family @Helium callsite 0x3076b not yet transcribed',
    );
  }
}
