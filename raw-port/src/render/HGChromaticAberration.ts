// HGChromaticAberration — Helium.framework filter node for chromatic-aberration RGB channel offset.
// This class is a filter-graph facade: its GetOutput binds a Metal render pass; its ctor allocates
// HGXForm/HGTransform child nodes and installs a fixed vtable. Only SetParameter contains
// FCP-authored numeric math and only for parameter indices 0 and 1 (which are symmetric — the
// per-channel offset amount for two of the three RGB channels). The third (index 2) is a color
// triple with a `blendvps` conditional replacement; the ctors and dtors are HGNode/HGObject-new
// plumbing over undecoded external calls.
//
// This file transcribes:
//   - SetParameter, case 0 (parameter index 0)  @Helium 0x224970 (falls through to 0x22498b)
//   - SetParameter, case 1 (parameter index 1)  @Helium 0x2249fb
//   - SetParameter, case 2 (parameter index 2)  @Helium 0x224a68  — layout-only (offsets); the
//        blendvps-selected constant and 3-float store are noted but the read-of-current /
//        equality-early-out semantics duplicate case 0/1; a full body would only clone the
//        pattern. Currently STUB with @0xADDR so the callee-store dispatch is not silently
//        guessed.
//   - SetParameter default/case >=3  @Helium 0x22497e  (returns -1 aka 0xFFFFFFFF)
// All ctor/dtor/GetOutput methods are throw-stubs citing their @0xADDR.
//
// Decode evidence:
//   raw-port/re/disasm/Helium.HGChromaticAberration.SetParameter.s
//   raw-port/re/disasm/Helium.HGChromaticAberration.GetOutput.s
//   raw-port/re/disasm/Helium.HGChromaticAberration.HGChromaticAberration.s
// RIP constants resolved directly from /tmp/Helium.x86_64 (VA==offset in the thin fat-slice):
//   @0x3C7C30 movaps  = { 0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff }  = fabs mask (SSE)
//   @0x3CA294 float32 = 100.0
//   @0x3CA260 float64 = 1.0
//   @0x88D2A0 float32 = 1.1
//   @0x3C7CC0 float32 = 1.0                    (first entry of a 1.0/6.0/0.5/-0.5 LUT)
// Member layout (recovered from SetParameter stores + ctor stores):
//   this+0x198 : float  aberrationAmount0   (param 0)
//   this+0x19c : float  aberrationAmount1   (param 1)
//   this+0x1a0 : float  color2R             (param 2 R)   -- see @0x224a68
//   this+0x1a4 : float  color2G             (param 2 G)
//   this+0x1a8 : float  color2B             (param 2 B)
//   this+0x1ac : uint32 dirtyFlag           (set to 1 on any param change; then HGNode::ClearBits)
// Amount-parameter mapping (cases 0 & 1, common formula):
//   let a = fabsf(x) / 100.0f;                            (@0x22498b..0x224995)
//   let scaled = (float)(1.0 - a + 1.1f * a) = 1.0 + a/10 = 1.0 + fabsf(x)/1000.0f
//                                                        (@0x2249a4..0x2249c0)
//   if (x <= 0)  result = 1.0f / scaled;                  (@0x2249c7..0x2249da)
//   else         result = scaled;
//   if (this->slot != result) { this->slot = result; this->dirty = 1; HGNode::ClearBits(); return 1; }
//   else                                                    return 0;
// Verified numerically:
//   x =    0    -> a=0     -> scaled=1.0  -> result=1.0
//   x = +100    -> a=1     -> scaled=1.1  -> result=1.1
//   x = -100    -> a=1     -> scaled=1.1  -> result=1/1.1 ≈ 0.909090..
//   x = +1000   -> a=10    -> scaled=2.0  -> result=2.0
//   x = -1000   -> scaled=2.0 -> result=0.5
// (i.e. a soft symmetric ratio scale centered at 1.0.)

// ────────────────────────────────────────────────────────────────────────────────────────
// Public state model
// ────────────────────────────────────────────────────────────────────────────────────────
export interface HGChromaticAberrationState {
  /** this+0x198 float — param 0 (aberration amount, channel A). */
  amount0: number;
  /** this+0x19c float — param 1 (aberration amount, channel B). */
  amount1: number;
  /** this+0x1a0 float — param 2 R. */
  color2R: number;
  /** this+0x1a4 float — param 2 G. */
  color2G: number;
  /** this+0x1a8 float — param 2 B. */
  color2B: number;
  /** this+0x1ac uint32 — dirtyFlag (1 = a param changed since last render). */
  dirty: number;
}

// ────────────────────────────────────────────────────────────────────────────────────────
// SetParameter case 0/1 helper — the "amount" mapping described above.
// @Helium 0x22498b..0x2249da (case 0, member +0x198)
// @Helium 0x2249fb..0x224a4a (case 1, member +0x19c)
// The two branches use IDENTICAL constants and identical structure (verified by decoding both
// sets of RIP offsets — same targets 0x3C7C30/0x3CA294/0x3CA260/0x88D2A0/0x3C7CC0).
// ────────────────────────────────────────────────────────────────────────────────────────
function mapAberrationAmount(x: number): number {
  // xmm0 = x (float32 param).
  // xmm1 = movaps 0x3C7C30 = |mask 0x7fffffff|; xmm1 &= xmm0  -> xmm1 = fabsf(x).
  // divss xmm1, 100.0f          -> xmm1 = fabsf(x) / 100.0f.
  const a_f32 = Math.fround(Math.abs(x) / Math.fround(100.0));
  // xmm2 = (double)xmm1                     ; xmm3 = 1.0 (f64).
  const a_f64 = a_f32; // JS number is f64; cvtss2sd of the f32 value.
  // mulss xmm1, 1.1f                        -> xmm1 (f32) = 1.1f * a_f32.
  // cvtss2sd xmm1                           -> xmm1 (f64) = (double)(1.1f * a_f32).
  const b_f64 = Math.fround(Math.fround(1.1) * a_f32);
  // xmm3 = xmm3 - xmm2 = 1.0 - a_f64        ; xmm1 = xmm3 + xmm1 = 1.0 - a_f64 + b_f64.
  // cvtsd2ss xmm1                           -> f32 result "scaled".
  const scaled = Math.fround(1.0 - a_f64 + b_f64);
  // ucomiss xmm0, xmm2(=0); jbe -> if 0 <= xmm0 fall through; else invert with 1.0f / scaled.
  // FCP's "0 <= xmm0" branch keeps xmm1 (scaled) as-is; the fall-through branch loads 1.0f into
  // xmm0 and divides. Note: NaN causes jbe fall-through (ucomiss sets CF|PF|ZF on unordered) so
  // NaN takes the "1.0/scaled" path — but scaled itself would be NaN too, so the result is NaN
  // either way; ordered handling below matches the ordered case exactly and preserves NaN.
  if (x <= 0) {
    return Math.fround(Math.fround(1.0) / scaled);
  }
  return scaled;
}

/**
 * HGChromaticAberration::SetParameter(int index, float p0, float p1, float p2, float p3)
 * @Helium 0x224970.
 * Return value semantics (from the epilogue @0x224acb..0x224ae3):
 *   +1  -> a change was actually applied (new value != stored value); HGNode::ClearBits() ran.
 *    0  -> the new value equalled the stored value; no-op.
 *   -1  -> index >= 3 (unhandled); the very early "movl $-1,%eax; testl %esi,%esi; jne 0x224ae0"
 *          returns -1 when index is negative or >= 3.
 */
export function SetParameter(
  state: HGChromaticAberrationState,
  index: number,
  p0: number,
  _p1: number,
  _p2: number,
  _p3: number,
): number {
  // @0x224970..0x22497c dispatch.
  if (index === 2) {
    // @0x224a68 — the 3-float color case. The body performs a blendvps to replace channel-2
    // with 0.0 or the RIP-loaded 4-vector at @0x3C7C30 (all-NaN mask) depending on sign, then
    // a triple ucomiss/jne equality-check against the currently-stored triple (+0x1a0/+0x1a4/
    // +0x1a8) with an early-out. Not yet transcribed — the blendvps selection semantics need a
    // separate decode pass. @0x224a68 not yet transcribed.
    throw new Error(
      "HGChromaticAberration::SetParameter case index=2 @Helium 0x224a68 not yet transcribed — " +
        "blendvps color-triple path.",
    );
  }
  if (index === 1) {
    // @0x2249fb — same math as index 0, stored to +0x19c.
    const newVal = mapAberrationAmount(p0);
    const old = Math.fround(state.amount1);
    // @0x224a53..0x224a5c: ucomiss old,new; jne -> store+dirty; jnp (ordered same) -> ret 0.
    if (!Number.isNaN(newVal) && !Number.isNaN(old) && newVal === old) {
      return 0;
    }
    state.amount1 = newVal;
    state.dirty = 1;
    return 1;
  }
  if (index === 0) {
    // @0x22498b — fall-through path (case 0).
    const newVal = mapAberrationAmount(p0);
    const old = Math.fround(state.amount0);
    if (!Number.isNaN(newVal) && !Number.isNaN(old) && newVal === old) {
      return 0;
    }
    state.amount0 = newVal;
    state.dirty = 1;
    return 1;
  }
  // @0x22497e: movl $-1,%eax ; testl %esi,%esi ; jne 0x224ae0 -> return -1.
  return -1;
}

// ────────────────────────────────────────────────────────────────────────────────────────
// Throwing stubs — every method whose body touches undecoded HGNode/HGObject/HGRenderer/Metal
// callees. Each cites its @0xADDR so frontier.py can enumerate the gap.
// ────────────────────────────────────────────────────────────────────────────────────────

/** HGChromaticAberration::HGChromaticAberration()  @Helium 0x224640 (C2 base ctor).
 *  Constructs an HGNode base, installs vtable @Helium 0x224652+0x80da67=0xa322bf, stores a
 *  128-bit constant to this+0x198 (initial amount0/amount1 pair), sets this+0x1a8 = 1.0f
 *  (initial color2B), allocates a child HGNode (0x1a0 bytes) at this+0x1c0, allocates two
 *  HGXForm at this+0x1b0/+0x1b8, allocates two HGTransform at this+0x1c8/+0x1d0, then wires
 *  them via *0xa0() and *0x78() vtable dispatches. Requires HGNode/HGObject-new/HGXForm/
 *  HGTransform decodes. */
export function HGChromaticAberration_C2(): void {
  throw new Error(
    "HGChromaticAberration::HGChromaticAberration() @Helium 0x224640 not yet transcribed — " +
      "chains HGNode::HGNode, HGObject::operator new, HGXForm::HGXForm, HGTransform::HGTransform.",
  );
}

/** HGChromaticAberration::HGChromaticAberration()  @Helium 0x224800 (C1 complete ctor, thunks C2). */
export function HGChromaticAberration_C1(): void {
  throw new Error(
    "HGChromaticAberration::HGChromaticAberration() @Helium 0x224800 not yet transcribed — " +
      "thunks C2 @Helium 0x224640.",
  );
}

/** HGChromaticAberration::~HGChromaticAberration()  @Helium 0x224810 (D2 base dtor). */
export function HGChromaticAberration_D2(): void {
  throw new Error(
    "HGChromaticAberration::~HGChromaticAberration() @Helium 0x224810 not yet transcribed.",
  );
}

/** HGChromaticAberration::~HGChromaticAberration()  @Helium 0x224880 (D1 complete dtor). */
export function HGChromaticAberration_D1(): void {
  throw new Error(
    "HGChromaticAberration::~HGChromaticAberration() @Helium 0x224880 not yet transcribed.",
  );
}

/** HGChromaticAberration::~HGChromaticAberration()  @Helium 0x2248f0 (D0 deleting dtor). */
export function HGChromaticAberration_D0(): void {
  throw new Error(
    "HGChromaticAberration::~HGChromaticAberration() @Helium 0x2248f0 not yet transcribed.",
  );
}

/** HGChromaticAberration::GetOutput(HGRenderer*)  @Helium 0x224af0. 144-line body binding the
 *  chromatic-aberration Metal shader; not yet transcribed. */
export function GetOutput(): void {
  throw new Error(
    "HGChromaticAberration::GetOutput(HGRenderer*) @Helium 0x224af0 not yet transcribed — " +
      "144-line Metal render-pass binding.",
  );
}
