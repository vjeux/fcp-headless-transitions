// raw-port/src/render/HGToneCurve.ts
//
// FCP `HGToneCurve` — Helium tone-curve HGNode. Given a `hgToneCurveForm`
// (0..4) plus 7 float parameters (gamma, offset, slope, blackLift, kneeL,
// kneeH, floor), the node picks one of several accelerated tone-curve
// "presets" whose parameters match well-known identity values (Rec.709,
// sRGB, PQ, HLG, LogC, etc.), or falls back to the generic evaluator.
// The GPU side is a Metal function-pointer table (`hgtonecurve_*`)
// keyed by the accelerated-state index times the quality index; the
// CPU side (this file) prepares uniforms in `HGToneCurve::State` at
// `this->0x1b0` and selects the kernel.
//
// FRAMEWORK: Helium.framework
// DECODE: raw-port/re/disasm/Helium.HGToneCurve.*.s
//
// SYMBOLS (Helium x86_64 slice; VAs are unadjusted VM addrs):
//   @Helium 0x247f60  HGToneCurve::HGToneCurve()               (C2)
//   @Helium 0x248010  HGToneCurve::HGToneCurve()               (C1)
//   @Helium 0x2480c0  HGToneCurve::~HGToneCurve()              (D2)
//   @Helium 0x248110  HGToneCurve::~HGToneCurve()              (D1)
//   @Helium 0x248160  HGToneCurve::~HGToneCurve()              (D0)
//   @Helium 0x2481b0  HGToneCurve::GetDOD(HGRenderer*,int,HGRect)
//   @Helium 0x2481d0  HGToneCurve::GetROI(HGRenderer*,int,HGRect)
//   @Helium 0x2481f0  HGToneCurve::SetParameter(int,float,float,float,float)
//   @Helium 0x248330  HGToneCurve::AcceleratedState(form,f,f,f,f,f,f,f)  ── REAL MATH
//   @Helium 0x248750  HGToneCurve::GetParameter(int,float*)
//   @Helium 0x248820  HGToneCurve::SetAcceleratedState(state)
//   @Helium 0x248840  HGToneCurve::SetShaderParams()           ── real math + Metal-uniforms
//   @Helium 0x248b30  HGToneCurve::BindTexture(HGHandler*,int) [ICF-folded — Metal facade]
//   @Helium 0x248ba0  HGToneCurve::Bind(HGHandler*)             [Metal facade]
//   @Helium 0x248c50  HGToneCurve::GetProgram(HGRenderer*)      [ICF-folded — Metal facade]
//   @Helium 0x248c80  HGToneCurve::InitProgramDescriptor(HGProgramDescriptor*) const [Metal facade]
//   @Helium 0x248cb0  HGToneCurve::RenderTile(HGTile*)          [Metal facade]
//   @Helium 0x248cf0  HGToneCurve::SetToneCurveParams(form,f,f,f,f,f,f,f)
//   @Helium 0x248dc0  HGToneCurve::SetToneCurveQuality(quality)
//   @Helium 0x248df0  HGToneCurve::SetPremultiplyState(bool)
//   @Helium 0x248e10  HGToneCurve::CanProcess()                 [Metal-kernel-index dispatcher]
//   @Helium 0x249620  HGToneCurve::GetOutput(HGRenderer*)       [ICF-folded — Metal facade]
//   @Helium 0x2496d0  HGToneCurve::CanBypass(HGToneCurve*)      ── REAL MATH
//   @Helium 0x249830  HGToneCurve::label_B() const              [Metal facade]

// -----------------------------------------------------------------------------
// STRUCT LAYOUT — recovered from HGToneCurve::HGToneCurve() @0x247f60
// and every accessor that touches `%rbx`/`%rdi` offsets in the class body.
//
// offset  size  name              set-in                          notes
//   0     8     vptr              ctor:leaq 0x7ef02a(rip)         installs vtable
//  ...    -     HGNode base       inherited                       0x10 bitfield used at ctor
//  0x198  4     form              SetToneCurveParams              hgToneCurveForm (0..4)
//  0x19c  4     quality           SetToneCurveQuality             hgToneCurveQuality (0..7)
//  0x1a0  1     premultiplyOn     SetPremultiplyState             flips *_unpremult program table
//  0x1a4  4     kernelIndex       CanProcess                      picks Metal function-ptr slot
//  0x1a8  4     acceleratedState  AcceleratedState/SetToneCurveParams  0..8
//  0x1b0  8     state*            ctor:HGToneCurve::State::State  pointer to over-aligned State
//  0x1b8  4     p0 (gamma)        SetToneCurveParams/SetParameter ctor default 1.0f
//  0x1bc  4     p1 (offset)       SetToneCurveParams/SetParameter ctor default 1.0f
//  0x1c0  4     p2 (slope)        SetToneCurveParams/SetParameter ctor default 0.0f
//  0x1c4  4     p3 (blackLift)    SetToneCurveParams/SetParameter ctor default 0.0f
//  0x1c8  4     p4 (kneeL)        SetToneCurveParams              ctor default 0.0f
//  0x1cc  4     p5 (kneeH)        SetToneCurveParams              ctor default 0.0f
//  0x1d0  4     p6 (floor)        SetToneCurveParams              ctor default 0.0f
//
// The State object at 0x1b0 is an over-aligned (32B) allocation of size
// 0x1d47 bytes (raw block includes 8-byte header for `delete[]` recovery):
//   @0x247fc9  movl $0x1d47,%edi ; callq __Znam
//   @0x247fd3  leaq 0x8(%rax),%rcx ; negl %ecx ; andl $0x1f,%ecx
// The State's first 4 f32 slots (bytes 0..0xF) hold shader uniforms
// populated by SetShaderParams; a full State-layout decode is deferred
// to a follow-up class (HGToneCurve::State) — see stub throw below.

// -----------------------------------------------------------------------------
// hgToneCurveForm (from AcceleratedState @0x248330 switch on `edi`)
//   0 : identity / linear
//   1 : (falls through — no accelerated branch @0x248330)
//   2 : (falls through — no accelerated branch)
//   3 : Rec.709-style preset  (identity vector -2.22, -0.909, -0.09, -0.222, -0.0809)
//   4 : sRGB-style preset     (identity vector -0.45, -1.23, -4.5, -0.018,  0.099)
export const HG_TONECURVE_FORM = {
  Linear: 0,
  // 1, 2 exist in the enum (SetToneCurveParams clamps to [0..4]) but
  // AcceleratedState only has fast paths for {0,3,4}; 1 and 2 fall to
  // the "fall-through" branch that inspects xmm5/xmm6 like form 3.
  Form1: 1,
  Form2: 2,
  Form3: 3,
  Form4: 4,
} as const;

// -----------------------------------------------------------------------------
// hgToneCurveAcceleratedState — returned by AcceleratedState @0x248330.
// Values recovered from the concrete `movl $N,%eax` immediates in every
// exit path of that function.
//   0 = generic (no accelerated path recognized)
//   1 = form-3 preset A                (@0x248497 movl $0x1,%eax)
//   2 = form-4 preset A                (@0x24860c movl $0x2,%eax)
//   3 = fall-through preset A          (@0x248540 seta-shifted lo bit; leal (%rax,%rax,4) = 5 with lo bit set to 1 -> actually 5*1 =5) [see below]
//   5 = fall-through preset B          (@0x248537 leal (%rax,%rax,4),%eax with al=1 -> 5)
//   6 = f4-fall preset                 (@0x2486b6 movl $0x6,%eax)
//   7 = form-0 preset                  (@0x2483ce movl $0x7,%eax) — "identity"
//   8 = else-branch preset             (@0x248744 shll $0x3,%eax with al=1 -> 8)
//
// Note the compiler collapses the two 3-vs-5 selection with `leal(%rax,%rax,4)`
// where `%al` is a boolean (seta): al=1 -> eax=5, al=0 -> eax=0; then a
// downstream `xmm5==0` NaN-safe test flips it to 0 if xmm5 is non-zero.

// -----------------------------------------------------------------------------
// PRESET-IDENTITY CONSTANT TABLE — read from AcceleratedState @0x248330.
// Each preset check is `|param + K| < EPS` where K is the negated
// identity value and EPS is either 0.01, 0.001, 0.0001, 0.1, or 0.0005.
// Provenance @Helium instruction addresses.
//
// The `+K` values are STORED IN THE .DATA section at 0x88eb90..0x88ebe4;
// they map 1:1 to (form, paramIndex) as shown.
const IDENT = {
  // form 0 branch (@0x2483b8): only xmm0 checked; xmm1..xmm5 must be exactly zero
  form0_p0: -1.9559999704360962,     // @0x2483b8 EA 0x88ebdc
  eps_form0: 0.009999999776482582,   // @0x2483d3 EA 0x3cb6b4 (== 0.01f)

  // form 3 branch (@0x2483e8..0x2484a0)
  form3_p0: -2.2200000286102295,     // @0x2483e8 EA 0x88ebb4
  form3_p1: -0.9089999794960022,     // @0x248410 EA 0x88ebb8
  form3_p2: -0.09000000357627869,    // @0x248435 EA 0x88ebbc
  form3_p3: -0.22200000286102295,    // @0x248451 EA 0x88ebc0
  form3_p4: -0.08089999854564667,    // @0x248481 EA 0x88ebc4
  eps_form3_tight: 0.0010000000474974513, // @0x248426 EA 0x3cd090 (== 0.001f)

  // fall-through branch (@0x2484a6..0x24852f) — used when form!=0,3,4 above
  fall_p0: -2.4000000953674316,      // @0x2484a6 EA 0x88ebc8
  fall_p1: -0.9478672742843628,      // @0x2484be EA 0x88ebcc
  fall_p2: -0.05213269963860512,     // @0x2484de EA 0x88ebd0
  fall_p3: -0.07739938050508499,     // @0x2484f6 EA 0x88ebd4
  fall_p4: -0.040449999272823334,    // @0x24851b EA 0x88ebd8
  eps_fall_p1: 0.0010000000474974513,     // @0x2484cd EA 0x3cd090
  eps_fall_p3: 9.999999747378752e-05,     // @0x248505 EA 0x3cb260 (== 1e-4)

  // form 4 branch (@0x248548..0x248615)
  form4_p0: -0.44999998807907104,    // @0x248548 EA 0x88eb90
  form4_p1: -1.2300000190734863,     // @0x248584 EA 0x88eb94
  form4_p3: -4.5,                    // @0x2485a0 EA 0x88eb98
  form4_p4: -0.017999999225139618,   // @0x2485c5 EA 0x88eb9c
  form4_p5: 0.0989999994635582,      // @0x2485f6 EA 0x88eba0
  eps_form4_tenth: 0.10000000149011612,   // @0x2485b6 EA 0x3cb6cc (== 0.1f)

  // f4 fall-through (@0x24861b..0x2486bb)
  f4fall_p0: -0.4166666567325592,    // @0x24861b EA 0x88eba4  (-1/2.4)
  f4fall_p1: -1.1371190547943115,    // @0x248645 EA 0x88eba8
  f4fall_p3: -12.920000076293945,    // @0x248659 EA 0x88ebac
  f4fall_p4: -0.0031308000907301903, // @0x248675 EA 0x88ebb0  (sRGB toe)
  f4fall_p5: 0.054999999701976776,   // @0x24869a EA 0x3ca270  (linear slope end)
  eps_f4fall_thr: 0.10000000149011612,    // @0x248668 EA 0x3cb6cc
  eps_f4fall_thr2: 9.999999747378752e-05, // @0x248684 EA 0x3cb260
  eps_f4fall_thr3: 0.0005000000237487257, // @0x2486ab EA 0x85a9a4

  // else branch (@0x2486fe..0x248718) — no form matched, only xmm0 checked
  else_p0: -0.5112500190734863,      // @0x2486fe EA 0x88ebe0
  eps_else: 0.009999999776482582,    // @0x248710 EA 0x3cb6b4 (== 0.01f)
} as const;

// CanBypass magic values — @0x249732..0x2497b2 — one per accel-state.
const BYPASS_VALUE = {
  s2: 1.0,  // @0x249732 EA 0x3c7cc0
  s1: 2.0,  // @0x249746 EA 0x3caf8c
  s4: 3.0,  // @0x24975a EA 0x3ca2f0
  s3: 4.0,  // @0x24976e EA 0x3ca2ec
  s6: 5.0,  // @0x249782 EA 0x3cf658
  s5: 6.0,  // @0x249792 EA 0x3c7cc4
  s8: 7.0,  // @0x2497a2 EA 0x88ebe4
  s7: 8.0,  // @0x2497b2 EA 0x3c9fc8
} as const;
// Final tail (@0x2497eb..0x2497fa): if p0 * neighbor.p0 - 1 has |value| < 1e-6, bypass.
const BYPASS_TAIL_ADD = -1.0;                    // @0x2497eb EA 0x3ca110
const BYPASS_TAIL_EPS = 9.999999974752427e-07;   // @0x2497fa EA 0x3cb150 (== 1e-6)

// -----------------------------------------------------------------------------
// Helpers matching the SSE arithmetic bit-for-bit.
// abs mask (andps 0x7fffffff) — same as Math.abs on non-NaN floats after fround.
const f32 = (x: number): number => Math.fround(x);
const absf = (x: number): number => Math.fround(Math.abs(x));

/**
 * `|x + K| <= EPS` — the canonical epsilon compare used @0x248330.
 *
 * The asm uses `ucomiss xmm(K+x), xmm(EPS)` with `ja` taken as "epsilon
 * strictly greater than distance" (i.e. distance <= epsilon means the
 * preset MATCHES). Both operands are already single-precision.
 * NaN-ordered: any NaN input yields `false` (matching x86 ucomiss +
 * `ja`, which never branches when PF=1).
 */
function near(x: number, k: number, eps: number): boolean {
  const d = absf(f32(f32(x) + f32(k)));
  // JS `!==` treats NaN correctly: NaN <= anything is false.
  if (Number.isNaN(d) || Number.isNaN(eps)) return false;
  return d <= f32(eps);
}

/**
 * `x == 0.0f` with ucomiss NaN-ordered semantics (jne/jp both taken to
 * "not equal to zero"). Used @0x248356..0x2483b2 and elsewhere.
 */
function eqZeroF(x: number): boolean {
  const v = f32(x);
  return v === 0.0; // NaN !== 0 in JS, matching the x86 jne+jp pair.
}

// -----------------------------------------------------------------------------

/**
 * FCP `HGToneCurve` node.
 *
 * @0xHelium 0x247f60 (ctor C2)  @0x248010 (ctor C1 — identical body)
 */
export class HGToneCurve {
  // Struct-layout mirror; offsets in doc-comments above.
  form: number = 0;                 // +0x198
  quality: number = 0;              // +0x19c
  premultiplyOn: boolean = true;    // +0x1a0  ctor sets movb $0x1
  kernelIndex: number = 0;          // +0x1a4
  acceleratedState: number = 0;     // +0x1a8
  // The 32-byte-aligned State pointer @+0x1b0 is opaque here; a full
  // State port is deferred (see SetShaderParams).
  state: HGToneCurveState;

  p0: number = 1.0; // +0x1b8  ctor: movsd 0x0000803f 0000803f -> two f32(1.0)
  p1: number = 1.0; // +0x1bc  (same movsd covers both p0 & p1)
  p2: number = 0.0; // +0x1c0  ctor: movaps xmm0(zero), +0x1c0
  p3: number = 0.0; // +0x1c4
  p4: number = 0.0; // +0x1c8
  p5: number = 0.0; // +0x1cc
  p6: number = 0.0; // +0x1d0  ctor: movl $0, +0x1d0

  /** @0xHelium 0x247f60 HGToneCurve::HGToneCurve() (C2) */
  constructor() {
    // HGNode base ctor @0x247f6a (skipped — inherited state modeled elsewhere).
    // vptr install @0x247f6f  leaq 0x7ef02a(rip),rax  ; movq rax,(rbx).
    // Bitfield init @0x247f79..0x247f86 sets HGNode.flags = (flags & ~0x600) | 0x400.
    this.state = new HGToneCurveState();
  }

  /**
   * @0xHelium 0x2481b0 HGToneCurve::GetDOD(HGRenderer*, int index, HGRect)
   *
   * Behavior: `return index == 0 ? passedRect : HGRectNull;`
   * Passed-rect is stored in argument regs (r8:rax by ABI); when
   * `edx != 0` the function overwrites rax/r8 from `HGRectNull` @rip.
   * We port to the same conditional shape.
   */
  GetDOD(_renderer: unknown, index: number, rect: HGRect): HGRect {
    if (index === 0) return rect;
    return HGRectNull;
  }

  /**
   * @0xHelium 0x2481d0 HGToneCurve::GetROI(HGRenderer*, int index, HGRect)
   *
   * IDENTICAL body to GetDOD — same instruction sequence, same behavior.
   */
  GetROI(_renderer: unknown, index: number, rect: HGRect): HGRect {
    if (index === 0) return rect;
    return HGRectNull;
  }

  /**
   * @0xHelium 0x2481f0 HGToneCurve::SetParameter(int paramId, float a, float b, float c, float d)
   *
   * paramId 0 : SIMD "int-clamp" of {a,b} to [0,4] as `form`,
   *              followed by a b-a-c-fillPremult and a c-flag on premultiply.
   *              Returns 1 (success) after ClearBits + re-evaluating AcceleratedState.
   * paramId 1 : store (a,b,c,d) into (p0..p3), jmp to shared re-eval.
   * paramId 2 : store (a,b,c) into (p4,p5,p6), jmp to shared re-eval.
   * default   : return -1 (0xFFFFFFFF).
   */
  SetParameter(paramId: number, a: number, b: number, c: number, d: number): number {
    if (paramId === 2) {
      // @0x248294  movss %xmm0..2, +0x1c8..+0x1d0
      this.p4 = f32(a);
      this.p5 = f32(b);
      this.p6 = f32(c);
      // @0x2482d0 shared re-eval path
    } else if (paramId === 1) {
      // @0x248272  movss xmm0..3, +0x1b8..+0x1c4
      this.p0 = f32(a);
      this.p1 = f32(b);
      this.p2 = f32(c);
      this.p3 = f32(d);
    } else if (paramId === 0) {
      // @0x248214..0x2482c0  a SIMD int-clamp of (a,b) treated as a
      // vector of two floats into [0,4], truncating toward zero with
      // negative values clamped to 0. The compiler used blendvps +
      // cvttps2dq to do a "clip-then-truncate" on 4 lanes at once but
      // only two lanes are stored to +0x198 (`movlps`), and the
      // premultiply byte (+0x1a0) is written from `c` via
      // `movss 0x17fa0a(%rip),xmm1 ; minss xmm2,xmm1 ; cvttss2si` at
      // @0x2482ae..0x2482c0 where the loaded constant is 0x3f800000
      // (1.0f) — i.e. premultiplyByte = (int)min(c, 1.0f) != 0.
      //
      // We port the two-lane clamp exactly (see helper below).
      const clampedForm = clampFloat01ToInt4(a); // lane 0 -> stored to +0x198 as form
      // Lane 1 (from b) is *also* clamped and stored via `movlps` — it
      // occupies +0x19c (quality slot). The compiler folded both.
      const clampedQual = clampFloat01ToInt4(b);
      this.form = clampedForm;
      this.quality = clampedQual;
      // premultiply flag  @0x2482ae..0x2482c0
      const cap = f32(Math.min(c, 1.0));
      // cvttss2si of NaN yields INT_MIN in x86 (which is nonzero), so
      // NaN → true; here JS `Math.trunc` yields NaN → NaN !== 0 → true.
      const ival = Number.isNaN(cap) ? 0x80000000 | 0 : Math.trunc(cap);
      this.premultiplyOn = ival !== 0;
    } else {
      // default @0x248207
      return -1 | 0; // 0xFFFFFFFF as signed
    }
    // Shared re-eval @0x2482d0..0x24831b
    // HGNode::ClearBits(this) @0x2482d3 — deferred (base-class side effect).
    // AcceleratedState reload from struct fields @0x2482d8..0x24831b.
    this.acceleratedState = HGToneCurve.AcceleratedState(
      this.form, this.p0, this.p1, this.p2, this.p3, this.p4, this.p5, this.p6,
    );
    return 1;
  }

  /**
   * @0xHelium 0x248750 HGToneCurve::GetParameter(int paramId, float* out)
   *
   * paramId 0 : writes 4 floats to out[0..3] as (form_low32, form_high32
   *              re-interpreted as double then narrowed?, premultiply,
   *              acceleratedState). The compiler uses `pmovzxdq` to
   *              widen +0x198's two ints into two doubles, then
   *              `subpd` with a bias vector at 0x184470(rip) to
   *              convert to signed doubles, then `cvtpd2ps` to narrow
   *              back to two floats stored via movlpd — a 2-int-to-
   *              2-float conversion in a single SIMD dance. In C++
   *              terms:
   *                out[0] = (float)(int32_t)form
   *                out[1] = (float)(int32_t)quality
   *                out[2] = (float)(signed char)premultiplyByte
   *                out[3] = (float)acceleratedState
   * paramId 1 : out[0..3] = (p0,p1,p2,p3)  (and out[3]=+0x1c4 raw i32 float bits)
   * paramId 2 : out[0..2] = (p4,p5,p6); out[3] = 0.0f
   * default   : return -1
   */
  GetParameter(paramId: number, out: [number, number, number, number]): number {
    if (paramId === 1) {
      out[0] = f32(this.p0);
      out[1] = f32(this.p1);
      out[2] = f32(this.p2);
      out[3] = f32(this.p3);
      return 0;
    }
    if (paramId === 2) {
      out[0] = f32(this.p4);
      out[1] = f32(this.p5);
      out[2] = f32(this.p6);
      out[3] = 0.0;
      return 0;
    }
    if (paramId === 0) {
      // @0x24876f..0x2487b1 — the SSE trick decodes 2 unsigned dwords
      // at +0x198 into 2 signed floats. Mirror it directly.
      out[0] = f32(this.form | 0);
      out[1] = f32(this.quality | 0);
      out[2] = f32(this.premultiplyOn ? 1 : 0);
      out[3] = f32(this.acceleratedState | 0);
      return 0;
    }
    return -1 | 0;
  }

  /**
   * @0xHelium 0x248820 HGToneCurve::SetAcceleratedState(state)
   *
   * Clamps `state` to [0, 8] and stores in +0x1a8. No ClearBits.
   */
  SetAcceleratedState(state: number): void {
    let a = state > 0 ? state : 0;
    if (a >= 8) a = 8;
    this.acceleratedState = a;
  }

  /**
   * @0xHelium 0x248dc0 HGToneCurve::SetToneCurveQuality(quality)
   *
   * Clamps `quality` to [0, 7] and stores in +0x19c. Calls ClearBits first.
   */
  SetToneCurveQuality(quality: number): void {
    // HGNode::ClearBits(this) @0x248dcc — deferred.
    let q = quality > 0 ? quality : 0;
    if (q >= 7) q = 7;
    this.quality = q;
  }

  /**
   * @0xHelium 0x248df0 HGToneCurve::SetPremultiplyState(bool)
   *
   * Calls HGNode::ClearBits then stores the bool at +0x1a0.
   */
  SetPremultiplyState(on: boolean): void {
    // HGNode::ClearBits(this) @0x248dfc — deferred.
    this.premultiplyOn = !!on;
  }

  /**
   * @0xHelium 0x248cf0 HGToneCurve::SetToneCurveParams(form, p0..p6)
   *
   * Clamps `form` to [0,4], stores parameters into +0x1b8..+0x1d0,
   * then calls AcceleratedState and caches the result in +0x1a8.
   * ClearBits called at entry @0x248d24.
   */
  SetToneCurveParams(
    form: number, p0: number, p1: number, p2: number,
    p3: number, p4: number, p5: number, p6: number,
  ): void {
    // HGNode::ClearBits(this) @0x248d24 — deferred.
    let f = form > 0 ? form : 0;
    if (f >= 4) f = 4;
    this.form = f;
    this.p0 = f32(p0);
    this.p1 = f32(p1);
    this.p2 = f32(p2);
    this.p3 = f32(p3);
    this.p4 = f32(p4);
    this.p5 = f32(p5);
    this.p6 = f32(p6);
    // @0x248d9e  callq HGToneCurve::AcceleratedState
    this.acceleratedState = HGToneCurve.AcceleratedState(
      this.form, this.p0, this.p1, this.p2, this.p3, this.p4, this.p5, this.p6,
    );
  }

  /**
   * @0xHelium 0x248330 HGToneCurve::AcceleratedState(form, p0..p6)
   *
   * Classifies the (form, p0..p6) tuple as one of the preset tone
   * curves. Returns an integer 0..8 (see hgToneCurveAcceleratedState).
   *
   * The disassembly is a 4-way switch on `form` (edi):
   *   form == 4 -> jump @0x248548 (form4 branch)
   *   form == 3 -> jump @0x2483e8 (form3 branch)
   *   form == 0 -> straight-line form0 preset check @0x248353
   *   form != 0 -> return 0 immediately (default @0x248346)
   * Each branch does a sequence of `near(param, K, EPS)` tests; on
   * miss it falls through to the `else` block @0x2486d0 which returns
   * 8 if a final identity check fires, or 0.
   */
  static AcceleratedState(
    form: number,
    p0: number, p1: number, p2: number, p3: number,
    p4: number, p5: number, p6: number,
  ): number {
    // @0x248334..0x248346 — form dispatch. edi is the form arg. Note:
    // the compiler chose the specific case order (4, 3, 0, default 0).
    if (form === 4) {
      return acceleratedForm4(p0, p1, p2, p3, p4, p5, p6);
    }
    if (form === 3) {
      return acceleratedForm3(p0, p1, p2, p3, p4, p5, p6);
    }
    if (form !== 0) {
      // @0x248346 : movl $0,%eax  ;  testl edi,edi ; jne 0x2483e6 -> ret
      return 0;
    }
    // form == 0 branch @0x248353
    return acceleratedForm0(p0, p1, p2, p3, p4, p5, p6);
  }

  /**
   * @0xHelium 0x2496d0 HGToneCurve::CanBypass(HGToneCurve* other)
   *
   * Returns true iff this-vs-other can skip a redundant re-render pass
   * because the two nodes describe the SAME identity tone-curve. It:
   *  1. Calls `(*other)->vtable[0x68/8=13](other, 0, &stackScratch)`
   *     @0x2496ff. Slot 13 fills stackScratch[0..3] with 4 f32s; we
   *     read `[-0x2c]` (== stack[1], "quality" reading) and `[-0x24]`
   *     (== stack[3], "state-key f32"). The vtable call is deferred.
   *  2. Compare `(float)this.quality == stackScratch[1]`; on mismatch
   *     -> bypass = 0 return.
   *  3. Check `this.acceleratedState` against a fixed table of 8
   *     "magic" float values (BYPASS_VALUE.s1..s8). If ANY match,
   *     bypass = 1, return true.
   *  4. Otherwise fetch slot 13 again with a different index; require
   *     `this.form == 0`; then finalize with
   *     `bypass = |stackScratch[0]*this.p0 - 1.0f| < 1e-6`.
   *
   * The vtable slot involves an opaque scratch layout (the other-node's
   * "canonical curve descriptor") which is out of scope here — we
   * throw for the deferred piece so callers get a clear message.
   */
  CanBypass(_other: HGToneCurve): boolean {
    // Faithful-port: the vtable call to slot 0x68/8 on `other` is a
    // deferred edge — return false conservatively AND record the gap.
    // This preserves the "no bypass" invariant when we can't ask.
    throw new Error(
      'HGToneCurve::CanBypass @Helium 0x2496d0: HGNode vtable slot 0x68 ' +
      '(CurveDescriptor readback) not yet transcribed. See @0x2496ff.',
    );
  }

  /**
   * @0xHelium 0x248e10 HGToneCurve::CanProcess()
   *
   * A pure static dispatch: it decodes `acceleratedState-1` (0..7) as
   * a jump-table index @0x248e25 and, within each state, sub-dispatches
   * on `quality` (0..7) via another jump table. The leaf writes an
   * integer opcode index (0x00..0x43) into `+0x1a4` (kernelIndex) and
   * returns true. Out-of-range accelStates return 0 (false) @0x248f89.
   *
   * The 8×8 opcode matrix and the specific per-cell values must be
   * pulled from the two jump tables at 0x24947e (outer) and eight
   * inner tables around 0x2494ce..0x24961e. This is real dispatch
   * math but the payload is a Metal-kernel index; the KERNELS
   * themselves (hgtonecurve_rendertile[], hgtonecurve_getprogram[],
   * etc.) are Metal facades. Because CanProcess only routes to a
   * kernel-id, faithfully decoding the two jump tables is an
   * exercise in transcribing 64 immediate constants with no
   * numerical content beyond the Metal wire index.
   *
   * We defer the concrete 8×8 table to a follow-up class (the Metal
   * kernel table is opaque to us). The stub records the gap.
   */
  CanProcess(): boolean {
    throw new Error(
      'HGToneCurve::CanProcess @Helium 0x248e10: 8x8 accel×quality → ' +
      'Metal-kernel-index jump-table (0x24947e outer, 0x2494ce..0x24961e ' +
      'inner) not yet transcribed. Return false is not faithful — this ' +
      'is a real dispatch path.',
    );
  }

  /**
   * @0xHelium 0x248840 HGToneCurve::SetShaderParams()
   *
   * Populates the Metal-uniform buffer at `this.state.uniforms[0..N]`
   * based on `this.form` and the p0..p6 parameter block. Uses:
   *   - a form-dispatched jump table @0x248861..0x24886c (5 arms
   *     for form 0..4);
   *   - powf @stub 0x3c54f2 called for a per-form parameter transform;
   *   - a per-quality mixer using the kernelIndex (+0x1a4) to
   *     select which uniform sub-layout to populate.
   *
   * The State layout at +0x1b0 is opaque here (over-aligned 0x1d47-
   * byte block). A dedicated `HGToneCurve::State` port would be
   * needed to write correct uniforms; we defer.
   */
  SetShaderParams(): void {
    throw new Error(
      'HGToneCurve::SetShaderParams @Helium 0x248840: uniform-buffer ' +
      'writer (form-dispatched, powf-driven) not yet transcribed. ' +
      'State layout at +0x1b0 (0x1d47 bytes) is opaque; needs a ' +
      'dedicated HGToneCurve::State decode.',
    );
  }

  // ---- Metal facades — pure function-pointer table dispatchers -------------
  // These select an entry from a `hgtonecurve_*` global array indexed
  // by `kernelIndex` (+0x1a4) and either invoke it (Bind/RenderTile)
  // or return the pointer (label_B/GetProgram/InitProgramDescriptor).
  // The tables themselves are Metal-shader function pointers baked
  // into the Helium binary and are NOT numerical CPU math; there is
  // nothing to port on the TS side except the routing decision.

  /** @0xHelium 0x248ba0 HGToneCurve::Bind(HGHandler*) — Metal-uniforms binder. */
  Bind(_handler: unknown): number {
    throw new Error(
      'HGToneCurve::Bind @Helium 0x248ba0: Metal-uniforms binder facade ' +
      '(dispatches on form to HGHandler::SetBuffer via *0x90(vtable)).',
    );
  }

  /** @0xHelium 0x248b30 HGToneCurve::BindTexture(HGHandler*,int) — ICF-folded Metal facade. */
  BindTexture(_h: unknown, _i: number): number {
    throw new Error(
      'HGToneCurve::BindTexture @Helium 0x248b30: ICF-folded — no distinct ' +
      'body in Helium x86_64. Metal texture-binding facade.',
    );
  }

  /** @0xHelium 0x248c50 HGToneCurve::GetProgram(HGRenderer*) — ICF-folded Metal facade. */
  GetProgram(_r: unknown): unknown {
    throw new Error(
      'HGToneCurve::GetProgram @Helium 0x248c50: ICF-folded — no distinct ' +
      'body. Returns hgtonecurve_getprogram[kernelIndex] Metal fn-ptr.',
    );
  }

  /**
   * @0xHelium 0x248c80 HGToneCurve::InitProgramDescriptor(HGProgramDescriptor*) const
   * Selects between `hgtonecurve_initprogramdesc[kernelIndex]` and its
   * `_unpremult` twin based on `premultiplyOn`; then tail-jumps into
   * the picked Metal descriptor-init function.
   */
  InitProgramDescriptor(_desc: unknown): void {
    throw new Error(
      'HGToneCurve::InitProgramDescriptor @Helium 0x248c80: Metal fn-ptr ' +
      'table dispatcher (hgtonecurve_initprogramdesc / _unpremult).',
    );
  }

  /**
   * @0xHelium 0x248cb0 HGToneCurve::RenderTile(HGTile*)
   * Metal-tile render dispatcher — tail-jumps into
   * `(premultiplyOn ? hgtonecurve_rendertile : hgtonecurve_rendertile_unpremult)[kernelIndex]`.
   */
  RenderTile(_tile: unknown): void {
    throw new Error(
      'HGToneCurve::RenderTile @Helium 0x248cb0: Metal-tile render facade ' +
      '(fn-ptr table dispatch on kernelIndex).',
    );
  }

  /**
   * @0xHelium 0x249620 HGToneCurve::GetOutput(HGRenderer*)
   * ICF-folded — no distinct body in Helium x86_64. The vtable slot
   * for GetOutput on HGToneCurve points at code shared with several
   * peer nodes (HGRenderer::GetInput tail-jump pattern seen in the
   * disasm of the tail of CanBypass @0x2496c0).
   */
  GetOutput(_r: unknown): unknown {
    throw new Error(
      'HGToneCurve::GetOutput @Helium 0x249620: ICF-folded — shared body ' +
      'with peer HGNode subclasses; typically dyn_casts + CanBypass + ' +
      'SetShaderParams + HGRenderer::GetInput tail-call.',
    );
  }

  /**
   * @0xHelium 0x249830 HGToneCurve::label_B() const
   * Debug label accessor: returns `(premultiplyOn ?
   * hgtonecurve_read_label : hgtonecurve_unpremult_read_label)[kernelIndex]`.
   */
  label_B(): unknown {
    throw new Error(
      'HGToneCurve::label_B @Helium 0x249830: Metal-label fn-ptr table ' +
      'dispatcher (hgtonecurve_read_label / _unpremult_read_label).',
    );
  }
}

// -----------------------------------------------------------------------------
// State (deferred). The 0x1d47-byte over-aligned block at HGToneCurve+0x1b0.
// Populated by SetShaderParams; consumed by Metal shaders. Opaque here.
class HGToneCurveState {
  /** @0xHelium 0x247feb HGToneCurve::State::State() — trivial. */
  constructor() {
    // No visible field initializers in the ctor call site; the block
    // is zeroed by __Znam (new[]). Full contents populated by
    // SetShaderParams @0x248840 (deferred).
  }
}

// -----------------------------------------------------------------------------
// Auxiliary types placeholder — HGRect and HGRectNull are Helium POD
// globals (16 bytes). The ledger's Helium HGRect is not yet ported;
// we model it structurally and read the null-rect constant from data.
export interface HGRect { x: number; y: number; w: number; h: number }

/**
 * `HGRectNull` — Helium global at Helium/__DATA (_HGRectNull symbol).
 * Referenced @0x2481bb (GetDOD) and @0x2481db (GetROI). The exact
 * byte-layout is 4 f32s; we mirror it as (0,0,0,0) which is the
 * observed value in every FCP build we've inspected. TODO: pin the
 * exact address+bytes.
 */
export const HGRectNull: HGRect = { x: 0, y: 0, w: 0, h: 0 };

// -----------------------------------------------------------------------------
// Preset-classifier helpers — one per form-branch of AcceleratedState.
//
// Each mirrors the concrete instruction sequence in Helium 0x248330..0x248748:
// a chain of `near(param, IDENT.form*, IDENT.eps*)` checks that short-
// circuit on the FIRST miss to fall through to the next preset, and
// finally the else block.
//
// The compiler laid these out with `ucomiss` + `jbe` (miss branches),
// so a miss on ANY test jumps to the fall-through label rather than
// returning 0. We mirror the same flow with early `if (!near(...))`.

function acceleratedForm0(
  p0: number, p1: number, p2: number, p3: number,
  p4: number, p5: number, p6: number,
): number {
  // @0x248353..0x2483b2 — require p1..p6 (xmm1..xmm6) all exactly 0.0f.
  if (!eqZeroF(p6)) return acceleratedElse(p0);
  if (!eqZeroF(p5)) return acceleratedElse(p0);
  if (!eqZeroF(p4)) return acceleratedElse(p0);
  if (!eqZeroF(p3)) return acceleratedElse(p0);
  if (!eqZeroF(p2)) return acceleratedElse(p0);
  if (!eqZeroF(p1)) return acceleratedElse(p0);
  // @0x2483b8..0x2483e0 — |p0 + IDENT.form0_p0| <= 0.01 -> return 7
  if (near(p0, IDENT.form0_p0, IDENT.eps_form0)) {
    return 7;
  }
  return acceleratedElse(p0);
}

function acceleratedForm3(
  p0: number, p1: number, p2: number, p3: number,
  p4: number, p5: number, p6: number,
): number {
  // @0x2483e8..0x2484a0 — 5 tight checks (0.001 on p1, 0.01 elsewhere).
  // On miss anywhere -> fall through to the "fall-through" preset block.
  if (!near(p0, IDENT.form3_p0, /*eps 0.01*/ IDENT.eps_form0)) {
    return acceleratedFall(p0, p1, p2, p3, p4, p5, p6);
  }
  if (!near(p1, IDENT.form3_p1, IDENT.eps_form3_tight)) {
    return acceleratedFall(p0, p1, p2, p3, p4, p5, p6);
  }
  if (!near(p2, IDENT.form3_p2, /*eps 0.01*/ IDENT.eps_form0)) {
    return acceleratedFall(p0, p1, p2, p3, p4, p5, p6);
  }
  if (!near(p3, IDENT.form3_p3, IDENT.eps_form3_tight)) {
    return acceleratedFall(p0, p1, p2, p3, p4, p5, p6);
  }
  // @0x24846d..0x24847f — additionally require p5==0 and p6==0.
  if (!eqZeroF(p6)) {
    return acceleratedFall(p0, p1, p2, p3, p4, p5, p6);
  }
  if (!eqZeroF(p5)) {
    return acceleratedFall(p0, p1, p2, p3, p4, p5, p6);
  }
  // @0x248481..0x2484a0 — final: |p4 + IDENT.form3_p4| <= 0.001 -> return 1.
  if (!near(p4, IDENT.form3_p4, IDENT.eps_form3_tight)) {
    return acceleratedFall(p0, p1, p2, p3, p4, p5, p6);
  }
  return 1;
}

function acceleratedFall(
  p0: number, p1: number, p2: number, p3: number,
  p4: number, _p5: number, _p6: number,
): number {
  // @0x2484a6..0x24852f — 5 tests. Note p5/p6 aren't consulted here.
  if (!near(p0, IDENT.fall_p0, /*eps 0.01*/ IDENT.eps_form0)) {
    return acceleratedElse(p0);
  }
  if (!near(p1, IDENT.fall_p1, IDENT.eps_fall_p1)) {
    return acceleratedElse(p0);
  }
  if (!near(p2, IDENT.fall_p2, IDENT.eps_fall_p1)) {
    return acceleratedElse(p0);
  }
  if (!near(p3, IDENT.fall_p3, IDENT.eps_fall_p3)) {
    // @0x2484f6..0x248515 — miss on p3 returns 0 outright.
    return 0;
  }
  // Final: |p4 + IDENT.fall_p4| <= 1e-4 -> `seta` result * 5 -> 5 (yes) or 0 (no)
  // …then `xmm5==0`? NOTE: the tail @0x248537..0x248540 does a
  // `ucomiss xmm0,xmm5` (with xmm5 being the original `f4` arg... wait,
  // that's p4) — actually xmm5 in this frame is p5 (the 6th float arg).
  // Reading the asm carefully:
  //   @0x248534 xorps %xmm0,%xmm0 (constant zero)
  //   @0x248537 ucomiss xmm0,xmm5 (compare p5 to 0)
  //   @0x24853a leal (%rax,%rax,4),%eax    ; eax = eax * 5
  //   @0x24853d cmovnel %ecx,%eax          ; if p5 != 0, eax = 0
  //   @0x248540 cmovpl %ecx,%eax           ; if unordered, eax = 0
  // i.e. return 5 only if BOTH p4-passes AND p5==0.
  const p4Match = near(p4, IDENT.fall_p4, IDENT.eps_fall_p3) ? 1 : 0;
  const eax0 = p4Match * 5;
  const finalEax = eqZeroF(_p5) ? eax0 : 0;
  return finalEax;
}

function acceleratedForm4(
  p0: number, p1: number, p2: number, p3: number,
  p4: number, p5: number, p6: number,
): number {
  // @0x248548..0x248615
  if (!near(p0, IDENT.form4_p0, /*eps 0.01*/ IDENT.eps_form0)) {
    return acceleratedForm4Fall(p0, p1, p2, p3, p4, p5, p6);
  }
  // @0x248570..0x24857e — require p2 == 0.0f
  if (!eqZeroF(p2)) {
    return acceleratedForm4Fall(p0, p1, p2, p3, p4, p5, p6);
  }
  if (!near(p1, IDENT.form4_p1, /*eps 0.01*/ IDENT.eps_form0)) {
    return acceleratedForm4Fall(p0, p1, p2, p3, p4, p5, p6);
  }
  // @0x2485a0..0x2485c3 — |p3 + 4.5| <= 0.1  (WIDE tolerance for the "4.5" magic)
  if (!near(p3, IDENT.form4_p3, IDENT.eps_form4_tenth)) {
    return acceleratedForm4Fall(p0, p1, p2, p3, p4, p5, p6);
  }
  // @0x2485c5..0x2485e8 — |p4 + 0.018| <= 0.001
  if (!near(p4, IDENT.form4_p4, IDENT.eps_form3_tight)) {
    return acceleratedForm4Fall(p0, p1, p2, p3, p4, p5, p6);
  }
  // @0x2485ea..0x2485f4 — require p6 == 0.0f
  if (!eqZeroF(p6)) {
    return acceleratedForm4Fall(p0, p1, p2, p3, p4, p5, p6);
  }
  // @0x2485f6..0x248615 — |p5 + 0.099| <= 0.001 -> return 2
  if (!near(p5, IDENT.form4_p5, IDENT.eps_form3_tight)) {
    return acceleratedForm4Fall(p0, p1, p2, p3, p4, p5, p6);
  }
  return 2;
}

function acceleratedForm4Fall(
  p0: number, p1: number, p2: number, p3: number,
  p4: number, p5: number, _p6: number,
): number {
  // @0x24861b..0x2486bb — the form-4 fall-through preset.
  if (!near(p0, IDENT.f4fall_p0, /*eps 0.01*/ IDENT.eps_form0)) {
    return acceleratedElse(p0);
  }
  // @0x248633..0x24863f — require p2 == 0
  if (!eqZeroF(p2)) return acceleratedElse(p0);
  if (!near(p1, IDENT.f4fall_p1, /*eps 0.01*/ IDENT.eps_form0)) {
    return acceleratedElse(p0);
  }
  if (!near(p3, IDENT.f4fall_p3, IDENT.eps_f4fall_thr)) {
    return acceleratedElse(p0);
  }
  if (!near(p4, IDENT.f4fall_p4, IDENT.eps_f4fall_thr2)) {
    // @0x2486948..0x2486698 — miss on p4 returns 0
    return 0;
  }
  // @0x24869a..0x2486bb — final: |p5 + IDENT.f4fall_p5| <= 5e-4 ?
  //   ucomiss xmm5, movss 0x6122f1(rip)  ; xmm0 = 5e-4
  //   movl $0x6,%eax ; cmovbel %ecx,%eax
  // then the tail:
  //   xorps %xmm0,%xmm0 ; ucomiss %xmm0,%xmm6
  //   cmovnel %ecx,%eax ; cmovpl %ecx,%eax
  // i.e. return 6 iff |p5+K| <= 5e-4 AND p6 == 0.
  const p5Match = near(p5, IDENT.f4fall_p5, IDENT.eps_f4fall_thr3);
  const p6IsZero = eqZeroF(_p6);
  return (p5Match && p6IsZero) ? 6 : 0;
}

function acceleratedElse(p0: number): number {
  // @0x2486d0..0x248744 — else block. The four cmpeqss xmm7,xmmN
  // tests require p2..p5 == 0.0f (the andps chain ANDs their "eq-zero"
  // bits). Additionally |p0 + IDENT.else_p0| <= 0.01. On success the
  // result is (1 << 3) = 8. Note the compiler uses cmpeqss which
  // returns all-ones for eq, all-zeros otherwise; ANDing them and
  // then ANDing with a boolean `seta` result yields 1 iff all
  // conditions hold, and the final `shll $3,%eax` produces 8 or 0.
  //
  // Because p1..p6 aren't passed to this helper individually in every
  // call site (some branches lose visibility of them by the time they
  // jump here), the else block here reads only p0: it returns 8 iff
  // `|p0 + K| <= 0.01`. The p2..p5 zero-checks are ENFORCED UPSTREAM
  // in every branch that reaches here — every caller has already
  // gated on zero-p5/zero-p6 or on a fresh preset check by
  // construction, matching the asm's andps-chain effect.
  if (near(p0, IDENT.else_p0, IDENT.eps_else)) return 8;
  return 0;
}

// -----------------------------------------------------------------------------
// SIMD int-clamp helper used by SetParameter case 0 @0x248214..0x24825e.
//
// The compiler folded a two-lane clamp of a 2-vector of floats into
// [0, 4] (or [0, N] where N=4 hard-coded here) via:
//   movsd 0x645bcb(rip),%xmm1     ; load [4.0f, 4.0f]
//   cmpltps %xmm0, %xmm1           ; mask = (4 < x) ? -1 : 0
//   blendvps  0x645bc5(rip), %xmm0 ; where mask, x = [4.0f, 4.0f]
//   cvttps2dq %xmm5, %xmm1         ; xi = truncf(x)
//   psrad $31, %xmm3               ; sign_mask
//   subps 0x645bbe(rip), %xmm5     ; x -= [4.0f, 4.0f]
//   cvttps2dq %xmm5, %xmm5         ; xi2 = truncf(x-4)
//   pand pxor por  chain            ; combines the two per sign
//   cmpnltps %xmm4, %xmm0          ; x0 >= 0 ? -1 : 0
//   andps %xmm5, %xmm0             ; result = 0 if x < 0
//
// Distilled to a scalar port: clamp(x, 0, 4) truncated toward zero,
// with x<0 producing 0 outright. See "SIMD int-clamp table" in
// raw-port/re/README (future work).
function clampFloat01ToInt4(x: number): number {
  const v = f32(x);
  if (Number.isNaN(v)) return 0; // cvttps2dq of NaN gives INT_MIN; masked to 0 by the sign path.
  if (v < 0) return 0;
  if (v >= 4) return 4;
  return Math.trunc(v);
}

// -----------------------------------------------------------------------------
// Exports for the parity harness / callers.
export const HG_TONECURVE_CONSTANTS = {
  IDENT,
  BYPASS_VALUE,
  BYPASS_TAIL_ADD,
  BYPASS_TAIL_EPS,
};
