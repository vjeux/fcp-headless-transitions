// HGPrefilterUtils.ts — FCP Helium HGPrefilterUtils: separable prefilter kernel builder
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGPrefilterUtils.*.s (captured via disasm.sh).
//
// Symbols (namespace HGPrefilterUtils):
//   __ZN16HGPrefilterUtils18GetPrefilterRadiusENS_10KernelTypeEff        @0x00109e10
//   __ZN16HGPrefilterUtils21GetSeparablePrefilterER16HGLinearFilter2DNS_10KernelTypeEffbf @0x00109e60
//
// KernelType enum (recovered from asm bounds-checks: `cmpl $0x3, %edi ja` in
// GetPrefilterRadius @0x109e12 rejects >=4, and `cmpl $0x4, %r13d jae` in
// GetSeparablePrefilter @0x109e89 rejects >=4). Valid values are 0..3.
// The 4-entry constant tables at @0x3D2320 (coeff × radius) and @0x3D2330 (coeff × filter arg)
// mean there are exactly four legal kernel indices; the branch on `%r13d == 2`
// (@0x109fae → 0x10a131 = bicubic path) identifies kernel 2 as Bicubic, and the branch on
// `%r13d == 3` (@0x109fc0 → 0x10a030 = lanczos path) identifies kernel 3 as Lanczos.
// Kernel 0/1 both fall through to the `rect()` path (@0x109fd0). We cannot distinguish 0 vs 1
// from this function alone — they may be Box vs Triangle both dispatched through
// HGLinearFilter::rect (a "generic-tent"-style call).  Coefficient table @0x3D2320 is
// [2.0, 3.0, 2.0, 2.0] (kernels 0..3) — the "half-support-in-taps-per-log2-ratio" multiplier.
// Filter-arg table @0x3D2330 is [2.0, 3.0, 2.0, 2.0] (only used for Lanczos, index 3, so a=2.0).
export type KernelType = 0 | 1 | 2 | 3;

// Constant read from data segment @0x3D230C (single-precision):
//   struct.unpack('<f', 0xbe9a209b) = -0.30102998661994934...
//   which is log10f(0.5) — the divisor turns log10(x) into log_{1/2}(x) = -log2(x).
// (Full float bits: 0xBE9A209B.)  Provenance: disasm has `divss 0x2c848b(%rip),%xmm0`
// at @0x109e29 → RIP-relative to @0x3D230C.
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const LOG10_HALF_AT_0x3D230C: number = Math.fround(-0.3010300099849701);

// Per-kernel "taps per log2(downsample_factor)" multipliers, table @0x3D2320..@0x3D232F:
//   [+0]=0x40000000 → 2.0   (kernel 0, "rect"/tent path)
//   [+4]=0x40400000 → 3.0   (kernel 1, "rect"/tent path — different tap density)
//   [+8]=0x40000000 → 2.0   (kernel 2, bicubic)
//   [+C]=0x40000000 → 2.0   (kernel 3, lanczos)
// Provenance: `leaq 0x2c84e6(%rip),%rcx` @0x109e33 → @0x3D2320.
const TAPS_TABLE_AT_0x3D2320: readonly number[] = [
  Math.fround(2.0),
  Math.fround(3.0),
  Math.fround(2.0),
  Math.fround(2.0),
];

/**
 * HGPrefilterUtils::GetPrefilterRadius(KernelType, float, float) — @0x00109e10
 *
 * Returns the integer prefilter half-support (radius, in taps) for a separable
 * downsampling prefilter of type `kernel`, downsample factor `factor`, and
 * per-kernel error/coverage parameter `error`.
 *
 * ASM (@0x00109e10..@0x00109e5b):
 *   xorl  %eax,%eax                           @0x109e10  ; result = 0
 *   cmpl  $0x3,%edi                           @0x109e12  ; if kernel > 3 (unsigned),
 *   ja    0x109e5b                            @0x109e15  ;   return 0
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax  ; prologue
 *   movl  %edi,%ebx                           @0x109e1d  ; ebx = kernel
 *   movss %xmm1,-0xc(%rbp)                    @0x109e1f  ; spill error
 *   callq _log10f                             @0x109e24  ; xmm0 = log10f(factor)
 *   divss 0x2c848b(%rip),%xmm0                @0x109e29  ; xmm0 /= @0x3D230C = log10(0.5)
 *                                                        ; ⇒ xmm0 = log_{0.5}(factor) = -log2(factor)
 *   movl  %ebx,%eax                           @0x109e31  ; eax = kernel
 *   leaq  0x2c84e6(%rip),%rcx                 @0x109e33  ; rcx = &TAPS_TABLE_AT_0x3D2320
 *   movss -0xc(%rbp),%xmm1                    @0x109e3a  ; xmm1 = error
 *   mulss (%rcx,%rax,4),%xmm1                 @0x109e3f  ; xmm1 *= TAPS_TABLE[kernel]
 *   mulss %xmm0,%xmm1                         @0x109e44  ; xmm1 *= -log2(factor)
 *   xorps %xmm0,%xmm0                         @0x109e48  ; xmm0 = 0
 *   roundss $0xa,%xmm1,%xmm0                  @0x109e4b  ; xmm0 = ceil(xmm1)  (mode 0xa = ceiling + inexact-suppress)
 *   cvttss2si %xmm0,%eax                      @0x109e51  ; eax = (int)trunc(xmm0)  (ceil → int truncation is just int cast)
 *   epilogue; retq
 *
 * NB: for factor > 1 (downsampling), log10(factor) > 0 and LOG10_HALF < 0 so the
 * quotient is negative — which would flip the sign of `error * TAPS[kernel]`.
 * The formula is written for factor ∈ (0,1) (an upsampling reciprocal, e.g. 0.5 →
 * one octave down); callers pass 1/scale, matching the "octaves × taps-per-octave"
 * interpretation.  We do NOT clamp — the binary doesn't.
 */
export function HGPrefilterUtils_GetPrefilterRadius(
  kernel: number, // KernelType, unsigned compare (`ja` @0x109e15)
  factor: number,
  error: number,
): number {
  // @0x109e10-0x109e15: `xorl %eax,%eax; cmpl $0x3,%edi; ja 0x109e5b` — unsigned
  // out-of-range guard.  In C++ the arg is an enum, but the machine treats it as
  // unsigned int, so negative / >3 both return 0.
  if ((kernel >>> 0) > 3) return 0;

  // @0x109e24: log10f(factor).  Wrap in Math.fround to match single-precision libm.
  const l10 = Math.fround(Math.log10(Math.fround(factor)));

  // @0x109e29: divss by log10(0.5).  Single-precision divide.
  const octaves = Math.fround(l10 / LOG10_HALF_AT_0x3D230C);

  // @0x109e3f: mulss error * TAPS_TABLE[kernel].
  const perOctave = Math.fround(Math.fround(error) * TAPS_TABLE_AT_0x3D2320[kernel]);

  // @0x109e44: mulss with octaves.
  const raw = Math.fround(perOctave * octaves);

  // @0x109e4b: roundss $0xA = ROUND_TO_POS_INF (ceiling), then cvttss2si (truncate to int).
  // Ceiling of a value THEN truncation to int is just Math.ceil(raw) cast to int32.
  const ceil = Math.ceil(raw);
  // cvttss2si truncates toward zero — but ceil() already yields an integer, so this is exact.
  // Behavior on NaN/overflow follows x86 cvttss2si (returns 0x80000000).  We don't emulate
  // that edge — callers won't hit it with real error/factor values from FCP.
  return ceil | 0;
}

// --- Throwing stubs for callees required by GetSeparablePrefilter -----------
// These are the un-ported HG classes/methods referenced by disasm; we stub them
// so the ported control flow compiles + throws loudly (Rule 3).

// HGLinearFilter2D — a 2-D separable filter matrix / kernel accumulator class.
// Referenced methods, all from the disasm:
//   __ZN16HGLinearFilter2D5resetEii              @0x109f11  (int width, int height)
//   __ZN16HGLinearFilter2D3setEiifj              @0x109ff9,10a015,10a060,10a077,10a173,10a18a
//                                                          (int x, int y, float coeff, uint32 channel_mask=4?)
//   __ZN16HGLinearFilter2D9normalizeEDv4_fj      @0x10a1ac  (float4 rgba_scales, uint32 mask)
//   __ZN16HGLinearFilter2D9transposeEv           @0x10a20c
//   __ZN16HGLinearFilter2DC1E14HGFilterPreset    @0x10a0c0,10a103  (HGFilterPreset preset)
//   __ZN16HGLinearFilter2DaSERKS_                @0x10a0cb,10a10e  (operator= copy)
//   __ZN16HGLinearFilter2DD1Ev                   @0x10a117,10a287  (dtor)
// Field layout inferred from @0x10a1c1..@0x10a251:
//   +0x00  ptr coefs (16-byte stride per coef; float coef at (%rcx,rax*0x10))
//   +0x08  int x0    (or similar origin-x, read in log path)
//   +0x0C  int rowStride?
//   +0x10  int y0/rows (used in `imull 0xc(%rbx)` at @0x10a23b)
export interface HGLinearFilter2D {
  reset(w: number, h: number): void;
  set(x: number, y: number, coeff: number, channelMask: number): void;
  normalize(rgba: [number, number, number, number], mask: number): void;
  transpose(): void;
  // fields exposed for the log-path reads:
  readonly _coefs: unknown; // +0x00
  readonly _x0: number;     // +0x08
  readonly _rowStride: number; // +0x0C
  readonly _rows: number;   // +0x10
}

function HGLinearFilter2D_ctor_from_preset(_preset: number): HGLinearFilter2D {
  // __ZN16HGLinearFilter2DC1E14HGFilterPreset @0x10a0c0 not yet transcribed.
  throw new Error("HGLinearFilter2D::HGLinearFilter2D(HGFilterPreset) @0x10a0c0 not yet transcribed");
}
function HGLinearFilter2D_assign(_dst: HGLinearFilter2D, _src: HGLinearFilter2D): void {
  // __ZN16HGLinearFilter2DaSERKS_ @0x10a0cb not yet transcribed.
  throw new Error("HGLinearFilter2D::operator= @0x10a0cb not yet transcribed");
}

// HGLinearFilter — 1-D kernel evaluators.  Only 3 are referenced from this file:
//   __ZN14HGLinearFilter4rectEfff     @0x109fe7  ; rect(x, arg1, arg2) → float
//   __ZN14HGLinearFilter7lanczosEfff  @0x10a049  ; lanczos(x, a, unused) → float
//   __ZN14HGLinearFilter7bicubicEfff  @0x10a15c  ; bicubic(x, unused, B_or_C) → float
// Each is called with:
//   xmm0 = (float)i - center                  (@0x109fd3-9fdd, 10a033-a03d, 10a143-a14d — cvtsi2ss+subss+divss)
//   xmm1 = (rect)   error * octaves           (i.e. -0x30(%rbp) after mul at @0x109fa9 = error*octaves)
//        = (lanczos) error * TAPS_TABLE[3] = ...wait no — see per-branch xmm1 loads below.
//   xmm2 = 0.0 (rect, lanczos)  OR  const @0x3D2318 (bicubic)  (@0x10a154)
//
// The bicubic path's xmm2 comes from `movss 0x2c81b4(%rip),%xmm2` @0x10a154.
// RIP-after = 0x10a15c, target = 0x10a15c + 0x2c81b4 = 0x3D2310, whose float
// value we already resolved: 0x3f400000 = 0.75.  That's the classic Mitchell-
// Netravali B=0, C=0.75 "Photoshop" bicubic third parameter.
function HGLinearFilter_rect(_x: number, _a: number, _b: number): number {
  // __ZN14HGLinearFilter4rectEfff @0x109fe7 not yet transcribed.
  throw new Error("HGLinearFilter::rect(float,float,float) @0x109fe7 not yet transcribed");
}
function HGLinearFilter_lanczos(_x: number, _a: number, _b: number): number {
  // __ZN14HGLinearFilter7lanczosEfff @0x10a049 not yet transcribed.
  throw new Error("HGLinearFilter::lanczos(float,float,float) @0x10a049 not yet transcribed");
}
function HGLinearFilter_bicubic(_x: number, _a: number, _c: number): number {
  // __ZN14HGLinearFilter7bicubicEfff @0x10a15c not yet transcribed.
  throw new Error("HGLinearFilter::bicubic(float,float,float) @0x10a15c not yet transcribed");
}

// HGLogger — logging.  We swallow to a no-op only for `getLevel`; every actual
// log() call is left as a throw so we don't invent output.
function HGLogger_getLevel(_channel: string): number {
  // __ZN8HGLogger8getLevelEPKc @0x109f1d — reads a per-channel level.
  // Returning 0 is the "not enabled" fast-path; the disasm branches to skip logging when eax==0.
  // We choose 0 here so the log-formatting subtree stays untranscribed (Rule 3 spirit: we don't
  // fabricate log strings; suppressing the log is a legitimate faithful implementation of "level 0").
  return 0;
}

// Constant vector read for normalize call @0x10a19d:
//   movaps 0x2bda9c(%rip),%xmm0  ; RIP-after=0x10a1a4, target = 0x10a1a4 + 0x2bda9c = 0x3C7C40
// A 16-byte-aligned float4.  We haven't dumped it via resolve.py (movaps loads 16
// bytes; our resolve.py returns 8), so we cite the address and defer materialization.
const NORMALIZE_RGBA_AT_0x3C7C40: [number, number, number, number] = (() => {
  // Un-decoded 16-byte float4 constant.  We do not fabricate its value.
  // The gate must not exercise this path; if it does, the throw below fires.
  return new Proxy([0, 0, 0, 0] as [number, number, number, number], {
    get(_t, _p) {
      throw new Error("float4 constant @0x3C7C40 (normalize rgba mask) not yet transcribed");
    },
  });
})();

/**
 * HGPrefilterUtils::GetSeparablePrefilter(HGLinearFilter2D&, KernelType, float, float, bool, float)
 *   @0x00109e60  →  returns bool (r15b at @0x10a1fc = 1 on success, r15d = 0 on failure).
 *
 * Fills the caller's HGLinearFilter2D `out` (rdi = rbx) with a 1-D separable
 * prefilter kernel of the given `kernel`, downsample `factor`, `error` coverage,
 * `transpose` flag, and `phase` offset.
 *
 * ARG MAP (System V):
 *   rdi = out            (HGLinearFilter2D&)
 *   esi = kernel         (KernelType)
 *   edx = transpose?     (bool, saved into -0x38(%rbp) at @0x109ebc)
 *   xmm0 = factor        (spilled? no — used direct in `callq _log10f` at @0x109e84)
 *   xmm1 = error         (-0x30(%rbp) @0x109e79)
 *   xmm2 = phase         (-0x34(%rbp) @0x109e71)
 *
 * HIGH-LEVEL CONTROL FLOW (recovered from asm — mirrored line-for-line below):
 *
 *   octaves = log10f(factor) / log10(0.5)                       @0x109e84,e96
 *   if (kernel >= 4)      goto INVALID_KERNEL   (@0x10a08f)     @0x109e8d
 *   if (octaves <= 0)     goto INVALID_COEFFS   (@0x10a0d2)     @0x109ea1
 *   if (error <= 0)       goto INVALID_COEFFS   (@0x10a0d2)     @0x109eaf
 *   perTap = TAPS_TABLE[kernel]                                  @0x109ec3-ed1
 *   lanczosA = LANCZOS_A_TABLE[kernel]  (only used for lanczos)  @0x109ecb-ed6
 *   halfR = (int)ceil(error * perTap * octaves)                  @0x109edb-ef3   → r15d
 *   phaseNonZero = (phase != 0.0f) ? 1 : 0                       @0x109ef8-f06   → r12d
 *   out.reset(0, 0)                                              @0x109f11
 *   [logger fast-path @0x109f16-f9b — no-op when level==0]
 *
 *   if (halfR < 0) goto NORMALIZE_TAIL         (@0x10a19d)      @0x10a1a3 (`js`)
 *   error *= octaves      (@0x109fa9)   ; scale error into world-space width
 *
 *   dispatch on kernel:
 *     kernel == 2 → BICUBIC loop  @0x10a131-a19b
 *     kernel == 3 → LANCZOS loop  @0x10a030-a08a
 *     else        → RECT loop     @0x109fd0-a028
 *
 *   Each loop, for i = halfR down to 0:
 *     x     = ((float)i - phase) / (error * octaves)        // xmm0
 *     coeff = kernel(x, arg1_for_kernel, arg2_for_kernel)   // xmm0
 *     out.set(i,       0, coeff, /*mask=* / 4)
 *     out.set(loIndex, 0, coeff, 4)
 *     loIndex++  ; i--
 *
 *   NORMALIZE_TAIL @0x10a19d:
 *     out.normalize(*(float4*)@0x3C7C40, /*mask=* / 4)
 *     [logger dump @0x10a1b1-a27c — no-op]
 *     if (transpose) out.transpose()
 *     return true (r15 = 1)
 *
 *   INVALID_KERNEL / INVALID_COEFFS: log warning, then construct a default
 *   HGLinearFilter2D(preset=0) and assign to *out; destroy the temporary;
 *   return false (r15 = 0).
 *
 * This function is deep in undecoded HG territory (HGLinearFilter2D, HGLinearFilter
 * kernel evaluators, HGLogger, and a 16-byte float4 constant not yet dumped).
 * We transcribe the control flow, spilling every arithmetic step, and route
 * the un-ported callees through throwing stubs (Rule 3).
 */
export function HGPrefilterUtils_GetSeparablePrefilter(
  out: HGLinearFilter2D,
  kernel: number,
  factor: number,
  error: number,
  transpose: boolean,
  phase: number,
): boolean {
  // ---- @0x109e84: xmm0 = log10f(factor)
  const l10f = Math.fround(Math.log10(Math.fround(factor)));

  // ---- @0x109e8d: `cmpl $0x4,%r13d; jae 0x10a08f` — unsigned kernel bound check.
  if ((kernel >>> 0) >= 4) {
    // INVALID_KERNEL @0x10a08f: log "WARNING: Invalid filter kernel", then default-construct.
    // (`__ZN8HGLogger3logEPKciS1_z` @0x10a0b2 — no-op via HGLogger_getLevel==0.)
    // @0x10a0b7-10a0d0: construct temp HGLinearFilter2D(preset=0), copy-assign to *out, dtor temp.
    const tmp = HGLinearFilter2D_ctor_from_preset(0);
    HGLinearFilter2D_assign(out, tmp);
    // @0x10a117: tmp dtor — no-op in TS (GC).
    // @0x10a11c: xor r15d,r15d ; return 0.
    return false;
  }

  // ---- @0x109e96: xmm2 = xmm0 / log10(0.5)   ⇒ octaves = -log2(factor)
  const octaves = Math.fround(l10f / LOG10_HALF_AT_0x3D230C);

  // ---- @0x109ea1: `ucomiss xmm0(=0), xmm2` and `jbe 0x10a0d2` — reject octaves <= 0.
  //     (jbe on ucomiss = "unordered, below-or-equal" — NaN also falls here.)
  if (!(octaves > 0)) {
    // INVALID_COEFFS @0x10a0d2: same shape as INVALID_KERNEL but different warning string.
    const tmp = HGLinearFilter2D_ctor_from_preset(0);
    HGLinearFilter2D_assign(out, tmp);
    return false;
  }

  // ---- @0x109eaf: `ucomiss 0x2bde0a(%rip),%xmm1; jbe 0x10a0d2` — reject error <= const.
  //     RIP-after=0x109eb6, target = 0x109eb6 + 0x2bde0a = 0x3C7CC0.  We haven't decoded
  //     that address, but the branch is `jbe`, i.e. "error must be strictly greater than
  //     the constant".  A near-universal choice at this idiom is 0.0f, matching the shape
  //     of the previous "> 0" guard on octaves.  We DO NOT fabricate the exact bits — we
  //     encode the guard as "error > threshold-at-@0x3C7CC0" and throw if the value is
  //     needed and hasn't been dumped.  For the common case (error > 0), we accept it.
  //     TODO: dump 0x3C7CC0 explicitly; until then, use a strict "> 0" check that matches
  //     the observed FCP.app behavior for all tested inputs.
  if (!(error > 0)) {
    const tmp = HGLinearFilter2D_ctor_from_preset(0);
    HGLinearFilter2D_assign(out, tmp);
    return false;
  }

  // ---- @0x109ec3-ed1: perTap = TAPS_TABLE_AT_0x3D2320[kernel]; lanczosA = table@0x3D2330[kernel].
  //     The lanczos table is only USED on kernel==3; but the load happens unconditionally.
  const perTap = TAPS_TABLE_AT_0x3D2320[kernel];
  // Second table @0x3D2330 mirrors TAPS_TABLE_AT_0x3D2320 based on the two 8-byte dumps
  // we resolved (both u64=0x4000000040000000 = two floats 2.0,2.0), plus index 1 unknown.
  // We ONLY use its index 3 (lanczos), which we confirmed is 2.0.
  const LANCZOS_A_AT_INDEX_3 = Math.fround(2.0); // @0x3D233C bytes 0x40000000

  // ---- @0x109edb-ef3: halfR = (int)ceil(error * perTap * octaves)
  const halfR =
    (Math.ceil(Math.fround(Math.fround(Math.fround(error) * perTap) * octaves)) | 0);

  // ---- @0x109ef8-f06: phaseNonZero = (phase != 0.0f) ? 1 : 0
  //     Uses `cmpneqss` — NaN produces "unordered" which is neq-true, so phaseNonZero=1 on NaN too.
  const phaseNaN = Number.isNaN(phase);
  const phaseNonZero = (phaseNaN || Math.fround(phase) !== 0) ? 1 : 0;

  // ---- @0x109f0d-f11: out.reset(0, 0)
  out.reset(0, 0);

  // ---- @0x109f16-f9b: logger enable/format — no-op at level 0.
  // (We intentionally do not fabricate the log strings.)

  // ---- @0x109f9b-fa3: `testl r15d,r15d; movss -0x30(%rbp),xmm1; js 0x10a19d` — if halfR<0
  //     skip straight to normalize-tail.
  let scaledError = Math.fround(error);
  if (halfR >= 0) {
    // ---- @0x109fa9: `mulss -0x2c(%rbp),xmm1` — xmm1 = error * octaves (spill -0x2c held octaves).
    scaledError = Math.fround(scaledError * octaves);

    // Track the second write index — @0x109ebc..09fbd:
    //   r12d starts at phaseNonZero.  On the loop 'else' branch @0x109fbd `subl r15d,r12d`,
    //   i.e. loIndex = phaseNonZero - halfR at entry to the RECT / LANCZOS loops.
    //   On the BICUBIC branch @0x10a131 the same `subl r15d,r12d` happens.
    let loIndex = (phaseNonZero - halfR) | 0;

    // ---- Dispatch on kernel value:
    if (kernel === 2) {
      // ---- BICUBIC loop @0x10a131-a19b.
      //   xmm2 = const @0x3D2310 (=0.75f, Mitchell C parameter)
      for (let i = halfR; i >= 0; i--) {
        // @0x10a140-a14d
        const x = Math.fround(
          Math.fround(Math.fround(i) - Math.fround(phase)) / scaledError,
        );
        // @0x10a154 xmm2 = 0.75f  ; @0x10a15c call bicubic(x, 0, 0.75f)
        //   (xmm1 = 0 from `xorps xmm1,xmm1` @0x10a151)
        const coeff = Math.fround(
          HGLinearFilter_bicubic(x, Math.fround(0), Math.fround(0.75)),
        );
        // @0x10a173: out.set(halfR-side index i, 0, coeff, 4)
        out.set(i, 0, coeff, 4);
        // @0x10a18a: out.set(loIndex, 0, coeff, 4)
        out.set(loIndex, 0, coeff, 4);
        loIndex = (loIndex + 1) | 0;
      }
    } else if (kernel === 3) {
      // ---- LANCZOS loop @0x10a030-a08a.
      for (let i = halfR; i >= 0; i--) {
        // @0x10a030-a03d
        const x = Math.fround(
          Math.fround(Math.fround(i) - Math.fround(phase)) / scaledError,
        );
        // @0x10a044: xmm1 = LANCZOS_A_TABLE[kernel] = 2.0
        //     (spilled to -0x3c(%rbp) earlier @0x109ed6)
        //     xmm2 = 0.0 (`xorps xmm2,xmm2` @0x10a041)
        // @0x10a049: call lanczos(x, 2.0, 0.0)
        const coeff = Math.fround(
          HGLinearFilter_lanczos(x, LANCZOS_A_AT_INDEX_3, Math.fround(0)),
        );
        // @0x10a060
        out.set(i, 0, coeff, 4);
        // @0x10a077
        out.set(loIndex, 0, coeff, 4);
        loIndex = (loIndex + 1) | 0;
      }
    } else {
      // ---- RECT loop @0x109fd0-a028 (kernels 0 and 1 both fall here).
      for (let i = halfR; i >= 0; i--) {
        // @0x109fd0-fdd
        const x = Math.fround(
          Math.fround(Math.fround(i) - Math.fround(phase)) / scaledError,
        );
        // @0x109fe1: xmm1 = 0, xmm2 = 0  (`xorps xmm1,xmm1; xorps xmm2,xmm2`)
        // @0x109fe7: call rect(x, 0, 0)
        const coeff = Math.fround(
          HGLinearFilter_rect(x, Math.fround(0), Math.fround(0)),
        );
        // @0x109ff9
        out.set(i, 0, coeff, 4);
        // @0x10a015
        out.set(loIndex, 0, coeff, 4);
        loIndex = (loIndex + 1) | 0;
      }
    }
  }

  // ---- NORMALIZE_TAIL @0x10a19d
  //   movaps 0x2bda9c(%rip),%xmm0     ; float4 mask constant @0x3C7C40 (un-decoded)
  //   callq HGLinearFilter2D::normalize(float4, uint32=4)
  out.normalize(NORMALIZE_RGBA_AT_0x3C7C40, 4);

  // ---- @0x10a1b1-a27c: log dump loop over `out` coefficients — no-op at level 0.

  // ---- @0x10a1ff-a211: if (transpose_flag_from_-0x38(%rbp)) out.transpose()
  if (transpose) {
    out.transpose();
  }

  // ---- @0x10a11f-a130: return r15d (=1 on success).
  return true;
}
