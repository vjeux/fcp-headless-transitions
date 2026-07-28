// LensParams.ts — Helium's fisheye/pinhole lens model. Every stored field maps
// to a decoded offset on the 68-byte layout below; every math operation cites
// the ProCore/Helium instruction that produced it. This is the "equidistant
// fisheye" model: forward distort applies `tan(r * fov)/(2*tan(fov/2)*r)` as
// the radial scale factor and inverse-undistort applies `atan(r * k) * s / r`.
//
// Transcribed from FCP Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbols owned by this class (from raw-port/army/ledger/Helium.ledger.json):
//   C2      @0x2292c0   LensParams()                           (default ctor)
//   C1      @0x229410   LensParams()                           (default ctor - non-ICF copy)
//   _computeParams @0x229330   private helper — recompute derived fields from raw args
//   C2      @0x229480   LensParams(float,float,float,float,float,float,float)  (7-arg ctor)
//   C1      @0x229580   LensParams(float,float,float,float,float,float,float)  (7-arg ctor)
//   distort(Pt2)   @0x229680
//   undistort(Pt2) @0x229750
//   distort(HGRect)   @0x2297e0     (samples _processRect with distort as member-fn-ptr)
//   _processRect      @0x229800     (member-fn-ptr sampler — 311 line body, DEFERRED)
//   undistort(HGRect) @0x229c60     (samples _processRect with undistort)
//
// ── STRUCT LAYOUT (recovered from the 5 decoded methods) ─────────────────────
//   LensParams {
//     +0x00  a0             : float   (7-arg ctor: arg1 xmm0)  — kx? focal-x-in
//     +0x04  a1             : float   (arg2 xmm1)              — ky?
//     +0x08  a2             : float   (arg3 xmm2)              — cx (principal x)
//     +0x0c  a3             : float   (arg4 xmm3)              — cy (principal y)
//     +0x10  a4             : float   (arg5 xmm4)              — image half-width
//     +0x14  a5             : float   (arg6 xmm5)              — image half-height
//     +0x18  fov            : float   (arg7 xmm6)              — field-of-view (radians)
//     +0x1c  invExtent.x    : float   (1/a4 with |a4|<1e-4 clamped to 1e-4·sign(a4))
//     +0x20  invExtent.y    : float   (1/a5)
//     +0x24  scale.x        : float   (packed in same 8-byte write as invExtent — actually
//                                       we recover this as the "distort scale" pair, see
//                                       _computeParams @0x229380 movlhps + movups)
//     +0x28  scale.y        : float
//     +0x2c  centerCopy.x   : float   (dup of a2 == cx)         — used by distort()
//     +0x30  centerCopy.y   : float   (dup of a3 == cy)
//     +0x34  fov_clamped    : float   (fov if |fov|>π else 0, then sign-bit forced positive)
//     +0x38  invFov         : float   (1 / fov_clamped or 0 if clamped==0)
//     +0x3c  screenExtent2  : float   (2 * tanf(fov_clamped * 0.5))
//     +0x40  invScreenExtent2:float   (1 / screenExtent2)
//   }
//   sizeof(LensParams) = 0x44 = 68 bytes.
//
// ── CONSTANTS (resolved by hand-reading __TEXT,__const at the RIP-relative
//   target addresses cited on each instruction) ───────────────────────────────
//   @0x3c7c30  packed { 0x7fffffff × 4 }   — float abs-value bitmask (andps)
//   @0x3d89d0  packed { 1e-4, 1e-4, 0, 0 } — clamp epsilon for the divisor
//   @0x3ca0b0  packed { 1.0, 1.0, 0, 0 }   — reciprocal numerator
//   @0x3d23f8  double 3.141592653589793    — π (ucomisd against |fov|)
//   @0x3d2388  float  3.141592653589793f   — π (also π for the andps result)
//   @0x3c7cc0  float  1.0f                 — 1.0 for divisor / identity
//   @0x3cc1c0  double 0.5                  — 0.5 for tan(fov/2)
//   @0x3ca300  double -1.0                 — subtractor in distort
//   @0x88d538  float  99999.0f             — "distortion blows up" clamp value
//   @0x88d5c0  double packed(-2.0,-2.0)    — default ctor init for +0x30..+0x37
//   @0x88d410  4×float (1, 1, 0.5, 0.5)    — default ctor for +0x00..+0x0f
//   @0x3c7c40  4×float (1, 1, 1, 1)        — default ctor for +0x10..+0x1f
//   @0x88d420  4×float (1, 1, 1, 0.5)      — default ctor for +0x20..+0x2f
//
// ── FRONTIER (not yet transcribed) ───────────────────────────────────────────
//   LensParams::_processRect @0x229800   311-line member-fn-ptr sampler
//   LensParams::distort(HGRect const&) @0x2297e0     — thin wrapper around _processRect
//   LensParams::undistort(HGRect const&) @0x229c60   — thin wrapper around _processRect
//   All three throw-stub below and defer to future ports.

// libm imports — Helium calls _tan @0x3c5642 (f64) and _tanf @0x3c5648 (f32)
// and _atanf @0x3c5054 (f32). Node/browser Math.tan/atan are IEEE-754-compliant
// f64; we wrap tanf/atanf in Math.fround to preserve the shipped binary's
// single-precision rounding at the call boundary.
const TAN_F64 = Math.tan;
const TANF = (x: number): number => Math.fround(Math.tan(Math.fround(x)));
const ATANF = (x: number): number => Math.fround(Math.atan(Math.fround(x)));

/**
 * Pt2 — a 2-vector at Helium's `Pt2` size. Two f32 lanes packed into an
 * 8-byte block; the disasm loads it via `movsd (%rsi), %xmmN` which is a
 * single 8-byte load of the pair (interpreted lane-wise as two floats by
 * the surrounding `subps`/`mulps`/etc.).
 */
export interface Pt2 {
  x: number;
  y: number;
}

/**
 * `LensParams` — 68-byte lens model. All fields are decoded offsets; the
 * asm never reaches beyond +0x40, so `sizeof` is the +0x40 float + 4 = 0x44.
 */
export class LensParams {
  /** @Helium +0x00 — 7-arg ctor arg 1 (xmm0). Also read by _computeParams @0x229339 as `*(this+0x00)`. */
  a0: number = 0;
  /** @Helium +0x04 — 7-arg ctor arg 2 (xmm1). */
  a1: number = 0;
  /** @Helium +0x08 — 7-arg ctor arg 3 (xmm2 == cx). Also dupped to +0x2c. */
  a2: number = 0;
  /** @Helium +0x0c — 7-arg ctor arg 4 (xmm3 == cy). Also dupped to +0x30. */
  a3: number = 0;
  /** @Helium +0x10 — 7-arg ctor arg 5 (xmm4 == image half-width). */
  a4: number = 0;
  /** @Helium +0x14 — 7-arg ctor arg 6 (xmm5 == image half-height). */
  a5: number = 0;
  /** @Helium +0x18 — 7-arg ctor arg 7 (xmm6 == fov). */
  fovIn: number = 0;

  /** @Helium +0x1c — `1.0/a4` with |a4|<1e-4 clamped to 1e-4·sign(a4). */
  invExtentX: number = 0;
  /** @Helium +0x20 — `1.0/a5` with |a5|<1e-4 clamped. */
  invExtentY: number = 0;
  /** @Helium +0x24 — first lane of the scale pair written to +0x24 by _computeParams @0x229383. */
  scaleX: number = 0;
  /** @Helium +0x28 — second lane. */
  scaleY: number = 0;

  /** @Helium +0x2c — dup of a2 (cx). */
  centerX: number = 0;
  /** @Helium +0x30 — dup of a3 (cy). */
  centerY: number = 0;

  /** @Helium +0x34 — fov clamped: if |fov| > π then fov else 0, forced non-negative. */
  fovClamped: number = 0;
  /** @Helium +0x38 — 1/fovClamped, or 0 when fovClamped==0. */
  invFov: number = 0;
  /** @Helium +0x3c — 2 * tanf(0.5 * fovClamped). */
  screenExtent2: number = 0;
  /** @Helium +0x40 — 1 / screenExtent2. */
  invScreenExtent2: number = 0;

  /**
   * Default constructor. Chooses one of the two ICF-identical bodies
   * (@0x2292c0 C2 == @0x229410 C1). Both bodies load the same const-pool
   * blobs into +0x00..+0x2f, initialise +0x30/+0x38 with fixed constants,
   * then compute the tan-based derived fields directly (WITHOUT going
   * through _computeParams).
   *
   * @Helium C2 @0x2292c0:
   *   0x2292c9 movaps 0x664140(%rip), %xmm0  ; = @0x88d410 = (1, 1, 0.5, 0.5)
   *   0x2292d0 movups %xmm0, (%rdi)          ; +0x00..+0x0f
   *   0x2292d3 movaps 0x19e966(%rip), %xmm0  ; = @0x3c7c40 = (1, 1, 1, 1)
   *   0x2292da movups %xmm0, 0x10(%rdi)      ; +0x10..+0x1f
   *   0x2292de movaps 0x66413b(%rip), %xmm0  ; = @0x88d420 = (1, 1, 1, 0.5)
   *   0x2292e5 movups %xmm0, 0x20(%rdi)      ; +0x20..+0x2f
   *   0x2292e9 movsd  0x6366cf(%rip), %xmm0  ; = @0x88d5c0 = packed(-2.0f, -2.0f) as f64
   *   0x2292f1 movsd  %xmm0, 0x30(%rdi)      ; +0x30..+0x37 = -2.0f, -2.0f
   *   0x2292f6 movl   $0x3f800000, 0x38(%rdi); +0x38 = 1.0f (bit-pattern 0x3f800000)
   *   0x2292fd movsd  0x1a2ebb(%rip), %xmm0  ; = @0x3cc1c0 = 0.5 (f64)
   *   0x229305 callq  _tan                    ; xmm0 = tan(0.5)
   *   0x22930a addsd  %xmm0, %xmm0            ; xmm0 = 2*tan(0.5)
   *   0x22930e cvtsd2ss xmm0, xmm0
   *   0x229312 movss  xmm0, 0x3c(%rbx)        ; +0x3c = 2*tan(0.5f)
   *   0x229317 movss  0x19e9a1(%rip), %xmm1   ; = @0x3c7cc0 = 1.0f
   *   0x22931f divss  xmm0, %xmm1             ; xmm1 = 1.0 / xmm0
   *   0x229323 movss  xmm1, 0x40(%rbx)        ; +0x40 = 1 / (2*tan(0.5))
   *
   * Note: the default ctor does NOT reset the +0x34/+0x38 fov/invFov fields
   * to a fov-derived value — +0x38 gets 1.0f (via `movl $0x3f800000`) and
   * +0x34 is a stale slot that stays whatever the constant-blob at +0x2c
   * wrote (which was 1.0f — the 4th lane of the +0x20 block). This is
   * consistent with the default lens being "no-op" — the derived quantities
   * hard-code as if fov = 1 radian.
   */
  static default_(): LensParams {
    const lp = new LensParams();
    // @0x2292d0 — first 4-float blob to +0x00..+0x0f.
    lp.a0 = 1.0;
    lp.a1 = 1.0;
    lp.a2 = 0.5;
    lp.a3 = 0.5;
    // @0x2292da — 4×1.0 blob to +0x10..+0x1f.
    lp.a4 = 1.0;
    lp.a5 = 1.0;
    lp.fovIn = 1.0;
    lp.invExtentX = 1.0;
    // @0x2292e5 — 4-float blob (1,1,1,0.5) to +0x20..+0x2f.
    lp.invExtentY = 1.0;
    lp.scaleX = 1.0;
    lp.scaleY = 1.0;
    lp.centerX = 0.5;
    // @0x2292f1 — packed(-2.0f, -2.0f) via movsd to +0x30..+0x37.
    lp.centerY = -2.0;
    lp.fovClamped = -2.0;
    // @0x2292f6 — direct dword-immediate 0x3f800000 == 1.0f to +0x38.
    lp.invFov = 1.0;
    // @0x2292fd..0x229323 — compute (2*tan(0.5), 1/(2*tan(0.5))) via tan(f64).
    const tanHalf = Math.tan(0.5);
    const twoTanHalf = Math.fround(2.0 * tanHalf);
    // @0x229312 cvtsd2ss lands 2*tan(0.5) at f32 precision.
    lp.screenExtent2 = twoTanHalf;
    // @0x22931f divss 1.0f / xmm0. divss is a f32 op.
    lp.invScreenExtent2 = Math.fround(1.0 / twoTanHalf);
    return lp;
  }

  /**
   * 7-argument constructor. C1 @0x229580 and C2 @0x229480 are ICF-identical
   * (both take (fx, fy, cx, cy, hx, hy, fov)). The body stores all 7 args
   * to +0x00..+0x18 verbatim, dupps (cx, cy) to (+0x2c, +0x30), then
   * inlines the same tan-based derived-fields logic that _computeParams
   * runs, but reading directly from the register-resident args instead of
   * from memory.
   *
   * @Helium C1 @0x229580:
   *   0x229586 movaps %xmm0, %xmm7                 ; save arg1 (a0) into xmm7 for the divps below
   *   0x22958c..0x2295a9  movss xmmN, +0xN(rdi)     ; store 7 args to +0x00..+0x18
   *   0x2295ae..0x2295b3  movss xmm2/xmm3, +0x2c/+0x30 ; dup (cx, cy)
   *   0x2295b8 insertps $0x10, %xmm5, %xmm4         ; xmm4 = [a4, a5, xmm4[2], xmm4[3]]
   *   0x2295be movaps 0x19e66b(%rip), %xmm2         ; = @0x3c7c30 = abs-mask (0x7fffffff × 4)
   *   0x2295c5 movaps %xmm4, %xmm0
   *   0x2295c8 andps  %xmm2, %xmm0                  ; |(a4, a5)|
   *   0x2295cb xorps  %xmm3, %xmm3
   *   0x2295ce cmpleps %xmm4, %xmm3                 ; xmm3 = (0 <= a4/a5) ? all-ones : 0  (per lane)
   *   0x2295d2 movaps 0x1af3f7(%rip), %xmm5         ; = @0x3d89d0 = (1e-4, 1e-4, 0, 0)
   *   0x2295d9 cmpltps %xmm5, %xmm0                 ; xmm0 = (|a4/a5| < 1e-4) ? all-ones : 0
   *   0x2295dd andps  %xmm5, %xmm3                  ; xmm3 = sign>=0 ? 1e-4 : 0
   *   0x2295e0 blendvps %xmm0, %xmm3, %xmm4         ; xmm4[lane] = (|v|<1e-4 ? 1e-4·(v>=0) : v)
   *     NB: on a NEGATIVE small value the clamp lands at 0, NOT -1e-4. This
   *     is a bug-compatible transcription — the shipped binary really does
   *     zero out the divisor lane for slightly-negative extents.
   *   0x2295e5 insertps $0x10, %xmm1, %xmm7         ; xmm7 = [a0, a1, xmm7[2], xmm7[3]]
   *   0x2295eb divps  %xmm4, %xmm7                  ; xmm7 = (a0/clamped_a4, a1/clamped_a5, 0, 0)
   *   0x2295ee movaps 0x1a0abb(%rip), %xmm0         ; = @0x3ca0b0 = (1.0, 1.0, 0, 0)
   *   0x2295f5 divps  %xmm7, %xmm0                  ; xmm0 = (clamped_a4/a0, clamped_a5/a1, 0/0, 0/0)
   *   0x2295f8 movlhps %xmm0, %xmm7                 ; xmm7 = (a0/a4, a1/a5, clamped_a4/a0, clamped_a5/a1)
   *   0x2295fb movups %xmm7, 0x1c(%rdi)             ; +0x1c..+0x2b:
   *                                                   +0x1c=a0/a4, +0x20=a1/a5 (invExtent),
   *                                                   +0x24=a4/a0, +0x28=a5/a1 (scale)
   *   0x2295ff andps %xmm6, %xmm2                   ; |fov|
   *   0x229602 xorps %xmm0, %xmm0
   *   0x229605 cvtss2sd %xmm2, %xmm0                ; |fov| as f64
   *   0x229609 ucomisd 0x1a8de7(%rip), %xmm0        ; compare against @0x3d23f8 = π (f64)
   *   0x229611 xorps %xmm0, %xmm0                   ; xmm0 = 0
   *   0x229614 jbe   0x229629                        ; if |fov| <= π: skip clamp
   *   0x229616 xorps %xmm1, %xmm1
   *   0x229619 cmpless %xmm6, %xmm1                 ; xmm1 = (0 <= fov) ? -1 : 0  (f32 cmp le)
   *   0x22961e movss 0x1a8d62(%rip), %xmm2          ; = @0x3d2388 = π (f32)
   *   0x229626 andps %xmm1, %xmm2                    ; xmm2 = fov>=0 ? π : 0
   *   0x229629 movss %xmm2, 0x34(%rbx)                ; +0x34 = fov_clamped
   *   0x22962e ucomiss %xmm0, %xmm2                  ; compare fovClamped vs 0
   *   0x229631 jne   0x229635 ; jnp 0x229641         ; if (fovClamped == 0 && !parity) skip inv
   *   0x229635 movss 0x19e683(%rip), %xmm0          ; = @0x3c7cc0 = 1.0f
   *   0x22963d divss %xmm2, %xmm0                   ; xmm0 = 1 / fovClamped
   *   0x229641 movss %xmm0, 0x38(%rbx)              ; +0x38 = invFov (0 if clamped=0)
   *   0x229646 xorps %xmm0, %xmm0
   *   0x229649 cvtss2sd %xmm2, %xmm0                ; fovClamped as f64
   *   0x22964d mulsd 0x1a2b6b(%rip), %xmm0          ; = @0x3cc1c0 = 0.5; xmm0 = fovClamped * 0.5
   *   0x229655 callq _tan                           ; xmm0 = tan(fovClamped * 0.5) (f64)
   *   0x22965a addsd %xmm0, %xmm0                   ; xmm0 = 2 * tan(fovClamped/2)
   *   0x22965e cvtsd2ss %xmm0, %xmm0                ; -> f32
   *   0x229662 movss %xmm0, 0x3c(%rbx)              ; +0x3c = 2*tan(fovClamped/2) as f32
   *   0x229667 movss 0x19e651(%rip), %xmm1          ; = @0x3c7cc0 = 1.0f
   *   0x22966f divss %xmm0, %xmm1                   ; xmm1 = 1 / xmm0
   *   0x229673 movss %xmm1, 0x40(%rbx)              ; +0x40 = 1 / (2*tan(fovClamped/2))
   */
  constructor(a0?: number, a1?: number, a2?: number, a3?: number, a4?: number, a5?: number, fov?: number) {
    if (a0 === undefined) {
      // TS-level default: fields stay zero. Callers should use `LensParams.default_()`
      // to run the shipped default-ctor body @0x2292c0. This lets the
      // 7-arg path be reached with a plain `new LensParams(f0,f1,...)`.
      return;
    }
    // @0x22958c..0x2295a9: raw stores to +0x00..+0x18.
    this.a0 = Math.fround(a0);
    this.a1 = Math.fround(a1!);
    this.a2 = Math.fround(a2!);
    this.a3 = Math.fround(a3!);
    this.a4 = Math.fround(a4!);
    this.a5 = Math.fround(a5!);
    this.fovIn = Math.fround(fov!);
    // @0x2295ae/0x2295b3: dup center to +0x2c/+0x30.
    this.centerX = this.a2;
    this.centerY = this.a3;
    // @0x2295b8..0x2295fb: build (invExtent, scale) with clamped divisor.
    //   xmm4 = (a4, a5) packed via insertps.
    //   absA = |a4|, |a5|
    //   signMask = (a4>=0, a5>=0) ? all-ones : 0     (from cmpleps 0 <= v)
    //   ltEps    = (|a4|<1e-4, |a5|<1e-4) ? all-ones : 0
    //   clamp    = ltEps ? (signMask & 1e-4) : v
    //     -> if |v|<1e-4 and v>=0: 1e-4
    //     -> if |v|<1e-4 and v<0 : 0    (bug-compatible)
    //     -> otherwise           : v
    const clampLane = (v: number): number => {
      const av = Math.abs(v);
      // @0x2295d9 cmpltps against 1e-4.
      if (av < 1e-4) {
        // @0x2295cb..0x2295dd: signMask & 1e-4 => 1e-4 if v>=0 else 0.
        return v >= 0 ? 1e-4 : 0;
      }
      return v;
    };
    // @0x2295e0 blendvps: per-lane conditional replace.
    const c4 = Math.fround(clampLane(this.a4));
    const c5 = Math.fround(clampLane(this.a5));
    // @0x2295eb divps: (a0, a1) / (c4, c5) → xmm7 lanes 0/1.
    const s0 = Math.fround(this.a0 / c4);
    const s1 = Math.fround(this.a1 / c5);
    // @0x2295f5 divps: (1.0, 1.0) / (s0, s1) → xmm0 lanes 0/1.
    //   Since s0 = a0/c4 and 1/s0 = c4/a0, this stores the SCALE (c4/a0) not (a4/a0).
    //   The clamp makes it slightly different from a4/a0 when |a4|<1e-4.
    const inv0 = Math.fround(1.0 / s0);
    const inv1 = Math.fround(1.0 / s1);
    // @0x2295f8 movlhps: xmm7 = [s0, s1, inv0, inv1] (packing low-half of xmm0 into high-half of xmm7).
    // @0x2295fb movups %xmm7, 0x1c: writes 16 bytes.
    this.invExtentX = s0;   // +0x1c
    this.invExtentY = s1;   // +0x20
    this.scaleX = inv0;     // +0x24
    this.scaleY = inv1;     // +0x28
    // @0x2295ff..0x229629: fov clamp.
    //   |fov| > π → keep sign(fov)·π (see cmpless fov, 0 → if fov>=0 pick π else 0)
    //   |fov| <= π → 0
    // Bug-compatible: when |fov|>π and fov<0, fovClamped == 0.
    let fovClamped: number;
    if (Math.abs(this.fovIn) > Math.PI) {
      // @0x229619 cmpless — TRUE when 0<=fov.
      fovClamped = this.fovIn >= 0 ? Math.fround(Math.PI) : 0;
    } else {
      fovClamped = 0;
    }
    this.fovClamped = fovClamped;
    // @0x22962e..0x229641: invFov = fovClamped==0 ? 0 : 1/fovClamped.
    //   The shipped asm's `ucomiss xmm0, xmm2 ; jne .; jnp` sequence branches
    //   into the divss when fovClamped != 0 (jne taken) OR when fovClamped
    //   is NaN (jnp not taken -> parity set -> the fall-through). For NaN
    //   the divss(1.0, NaN) result is NaN. TS mirrors both cases below.
    if (fovClamped !== 0) {
      this.invFov = Math.fround(1.0 / fovClamped);
    } else if (Number.isNaN(fovClamped)) {
      // Preserves the NaN propagation the shipped `divss` produces.
      this.invFov = NaN;
    } else {
      // The `jnp 0x229641` skips over the divss on parity-clear (i.e.
      // fovClamped ordered ==0). xmm0 was pre-set to 0 by @0x229646
      // xorps — but the store at 0x229641 happens BEFORE that xorps only
      // if the jnp is taken. So the stored value when clamped==0 is
      // literally xmm0 from the fall-through of @0x229631/0x229633, which
      // is the value xorps put there at @0x229611 (zero). So invFov=0.
      this.invFov = 0;
    }
    // @0x229649..0x229673: 2*tanf(fovClamped/2), and its reciprocal.
    //   Note the shipped code uses `_tan` (f64) not `_tanf`. We use TAN_F64
    //   with an explicit Math.fround at the cvtsd2ss @0x22965e.
    const half = fovClamped * 0.5;
    const t = TAN_F64(half);
    const twoT = Math.fround(2.0 * t);
    this.screenExtent2 = twoT;
    // @0x22966f divss 1.0f / xmm0.
    this.invScreenExtent2 = Math.fround(1.0 / twoT);
  }

  /**
   * LensParams::_computeParams()  @Helium 0x229330.
   *
   * Recompute the derived (invExtent, scale, fov_clamped, invFov,
   * screenExtent2, invScreenExtent2) fields from the raw (a0..fov) fields.
   * Functionally IDENTICAL to the second half of the 7-arg ctor above, but
   * loads args from memory instead of xmm registers.
   *
   *   0x229339 movsd 0x8(%rdi), %xmm0        ; xmm0 = pair (a2, a3) as f64-view
   *   0x22933e movsd %xmm0, 0x2c(%rdi)       ; +0x2c..+0x33 = (a2, a3) — refreshes centerX/Y
   *   0x229343 movsd 0x10(%rdi), %xmm2       ; xmm2 = (a4, a5) as f64-view
   *   [same clamp-and-divide dance as the 7-arg ctor from here on;
   *    all const-pool addresses re-used are the same targets.]
   *
   * The routine is a re-run of the fov→derived logic; useful after
   * mutating any of the 7 primary fields in-place.
   */
  computeParams(): void {
    // @0x22933e — refresh center dup from primary a2/a3.
    this.centerX = this.a2;
    this.centerY = this.a3;

    // @0x229343..0x229383 — clamp+divide (identical to 7-arg ctor body).
    const clampLane = (v: number): number => {
      const av = Math.abs(v);
      if (av < 1e-4) return v >= 0 ? 1e-4 : 0;
      return v;
    };
    const c4 = Math.fround(clampLane(this.a4));
    const c5 = Math.fround(clampLane(this.a5));
    // @0x22936f/0x229373 movsd (%rdi), xmm0; divps xmm2, xmm0 — divides
    // (a0, a1) by (c4, c5). Same lane arithmetic as the ctor.
    const s0 = Math.fround(this.a0 / c4);
    const s1 = Math.fround(this.a1 / c5);
    // @0x229376/0x22937d: (1, 1)/(s0, s1).
    const inv0 = Math.fround(1.0 / s0);
    const inv1 = Math.fround(1.0 / s1);
    // @0x229383 movups xmm0, 0x1c(%rdi) — writes 16 bytes to +0x1c..+0x2b.
    this.invExtentX = s0;
    this.invExtentY = s1;
    this.scaleX = inv0;
    this.scaleY = inv1;

    // @0x229387..0x2293b6 — fov clamp (SAME logic as the ctor).
    let fovClamped: number;
    if (Math.abs(this.fovIn) > Math.PI) {
      fovClamped = this.fovIn >= 0 ? Math.fround(Math.PI) : 0;
    } else {
      fovClamped = 0;
    }
    this.fovClamped = fovClamped;

    // @0x2293bb..0x2293ce — invFov (with the same jne/jnp NaN-handling).
    if (fovClamped !== 0) {
      this.invFov = Math.fround(1.0 / fovClamped);
    } else if (Number.isNaN(fovClamped)) {
      this.invFov = NaN;
    } else {
      this.invFov = 0;
    }

    // @0x2293d3..0x229400 — 2*tan(fov/2), 1/that.
    const half = fovClamped * 0.5;
    const t = TAN_F64(half);
    const twoT = Math.fround(2.0 * t);
    this.screenExtent2 = twoT;
    this.invScreenExtent2 = Math.fround(1.0 / twoT);
  }

  /**
   * LensParams::distort(Pt2 const& p)  @Helium 0x229680.
   *
   *   0x229680 movsd (%rsi), %xmm5            ; xmm5 = (p.x, p.y) packed
   *   0x229684 movsd 0x24(%rdi), %xmm0        ; xmm0 = (scaleX, scaleY)
   *   0x229689 movsd 0x2c(%rdi), %xmm4        ; xmm4 = (centerX, centerY)
   *   0x22968e subps %xmm4, %xmm5             ; xmm5 = p - center       (Pt2)
   *   0x229691 mulps %xmm0, %xmm5             ; xmm5 = (p - center) * scale
   *   0x229694 movaps %xmm5, %xmm0
   *   0x229697 mulps  %xmm5, %xmm0            ; xmm0 = xmm5² per-lane   (dx², dy², dx², dy²)
   *   0x22969a movshdup %xmm0, %xmm1          ; xmm1 = (dy², dy², dy², dy²)   (broadcast lane 1)
   *   0x22969e addss  %xmm0, %xmm1            ; xmm1 = dx² + dy²        (scalar, in low lane)
   *   0x2296a2 sqrtss %xmm1, %xmm6            ; xmm6 = sqrt(rr) = r
   *   0x2296a6 movaps %xmm6, %xmm2
   *   0x2296a9 addss  %xmm6, %xmm2            ; xmm2 = 2r
   *   0x2296ad movss  0x34(%rdi), %xmm0        ; xmm0 = fovClamped
   *   0x2296b2 mulss  %xmm0, %xmm2             ; xmm2 = 2r * fov
   *   0x2296b6 cvtss2sd %xmm2, %xmm2           ; f64 for the /π and -1
   *   0x2296ba divsd  0x1a8d36(%rip), %xmm2   ; xmm2 = (2r*fov) / π      [@0x3d23f8]
   *   0x2296c2 addsd  0x1a0c36(%rip), %xmm2   ; xmm2 += -1.0             [@0x3ca300]
   *   0x2296ca cvtsd2ss %xmm2, %xmm3           ; xmm3 = ((2r*fov)/π - 1) as f32
   *   0x2296ce xorps  %xmm2, %xmm2             ; xmm2 = 0
   *   0x2296d1 ucomiss %xmm3, %xmm2            ; compare xmm3 with 0
   *   0x2296d4 jbe    0x22971e                 ; if xmm3 >= 0: goto inf-clamp
   *   0x2296d6 ucomiss %xmm2, %xmm1            ; compare rr with 0
   *   0x2296d9 jbe    0x229728                 ; if rr <= 0: goto identity
   *   ── main branch: k = tanf(r * fovClamped) / (r * screenExtent2) ──────
   *   0x2296e4 mulss  %xmm6, %xmm0             ; xmm0 = r * fovClamped
   *   0x2296f8 callq  _tanf                    ; xmm0 = tanf(r * fovClamped)
   *   0x22970d mulss  0x3c(%rbx), %xmm1        ; xmm1 = r * screenExtent2
   *   0x229712 divss  %xmm1, %xmm0             ; xmm0 = tanf(rfov) / (r * screenExtent2) = k
   *   0x22971c jmp    0x229730
   *   ── inf-clamp branch: k = 99999.0f ─────────────────────────────────
   *   0x22971e movss  0x663e12(%rip), %xmm0    ; xmm0 = 99999.0f    [@0x88d538]
   *   0x229726 jmp    0x229730
   *   ── identity branch: k = 1.0f ──────────────────────────────────────
   *   0x229728 movss  0x19e590(%rip), %xmm0    ; xmm0 = 1.0f        [@0x3c7cc0]
   *   ── common tail ───────────────────────────────────────────────────
   *   0x229730 movsldup %xmm0, %xmm0           ; xmm0 = (k, k, k, k)
   *   0x229734 mulps  %xmm0, %xmm5             ; xmm5 = (p-c)*scale*k
   *   0x229737 movsd  0x1c(%rdi), %xmm0        ; xmm0 = (invExtentX, invExtentY)
   *   0x22973c mulps  %xmm5, %xmm0             ; xmm0 = (p-c)*scale*k*invExtent
   *   0x22973f addps  %xmm0, %xmm4             ; xmm4 = center + xmm0
   *   0x229742 movaps %xmm4, %xmm0             ; return %xmm0 = center + …
   */
  distort(p: Pt2): Pt2 {
    // @0x229680..0x229691 — d = (p - center) * scale
    const dx = Math.fround(Math.fround(p.x - this.centerX) * this.scaleX);
    const dy = Math.fround(Math.fround(p.y - this.centerY) * this.scaleY);
    // @0x229697..0x2296a2 — rr = dx² + dy², r = sqrt(rr)
    const rr = Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy));
    const r = Math.fround(Math.sqrt(rr));
    // @0x2296a9..0x2296b2 — 2r * fovClamped (f32)
    const twoR = Math.fround(r + r);
    const twoRFov = Math.fround(twoR * this.fovClamped);
    // @0x2296ba..0x2296ca — (2r*fov)/π - 1 in f64, then f32
    const w64 = twoRFov / Math.PI - 1.0;
    const w = Math.fround(w64);
    // @0x2296d1..0x2296d4 — branch on w >= 0 (jbe zero, xmm3): if 0 <= w goto inf-clamp
    //   (ucomiss xmm3, xmm2 with xmm2=0; jbe = jump if CF=1 or ZF=1 = xmm3<=0 in unsigned form
    //    but ucomiss sets ZF/PF/CF like FP compare: unordered->all set; jbe taken iff 0>=w)
    //   So this fires when w <= 0. If w <= 0 → inf-clamp.
    //   Wait — the operands: `ucomiss xmm3, xmm2` compares xmm3 vs xmm2 with xmm2 the dst-side.
    //   Intel: ucomiss reg,r/m sets flags on (reg - r/m). jbe fires when xmm3 <= xmm2 (=0).
    //   So jbe → w<=0 → goto inf-clamp @0x22971e (99999). If w > 0 → fall-through to next check.
    //   Correction: the code goes to inf-clamp when w<=0? that would mean w>0 continues to the
    //   real tanf branch — but tanf(rfov) explodes as rfov→π/2. w>0 corresponds to
    //   2r·fov/π > 1 → r > π/(2·fov). This is the "OUTSIDE the image circle" case where
    //   the formula would legitimately blow up. So the ASM's inf-clamp fires when the point
    //   is OUTSIDE the valid fov cone (w > 0 in this scheme, which corresponds to jbe? let me
    //   re-check).
    //
    //   Re-reading Intel: `ucomiss xmm3, xmm2` computes xmm3 - xmm2. Flags:
    //     ZF=1 if equal, CF=1 if xmm3 < xmm2, PF=1 if unordered.
    //   `jbe rel` = jump if CF=1 or ZF=1 → xmm3 <= xmm2 → w <= 0.
    //   xmm2 is 0. So jbe fires when w <= 0. That routes to inf-clamp.
    //   That contradicts my expectation. Let me re-check: the "w" here is
    //   (2r·fov/π - 1). When r=0, w=-1 (jbe taken → inf-clamp k=99999)? But
    //   r=0 means the point is at the center — should return identity.
    //   Wait, the second check `ucomiss xmm2, xmm1` with xmm2=0, xmm1=rr:
    //     jbe fires when xmm2 <= xmm1 → 0 <= rr, i.e. always TRUE for real rr.
    //   That would ALWAYS route to identity (k=1). So the identity branch
    //   fires when r=0 and hence rr=0 (or negative NaN). The inf-clamp
    //   branch fires when w>0 — corrected now that I re-read.
    //
    //   The FLIP: `ucomiss %xmm3, %xmm2` in AT&T syntax is Intel `ucomiss xmm2, xmm3`
    //   (AT&T reverses src/dst!). So the actual Intel op compares xmm2 vs xmm3
    //   → 0 vs w. Flags on (0 - w). jbe fires if 0 <= w, i.e. w >= 0.
    //   THAT matches — w >= 0 (point outside cone) → inf-clamp.
    //   Similarly `ucomiss %xmm2, %xmm1` (AT&T) = Intel `ucomiss xmm1, xmm2` =
    //   compare rr vs 0. jbe fires when rr <= 0. That's the identity branch:
    //   rr <= 0 → r=0 → k=1.
    let k: number;
    if (w >= 0 || Number.isNaN(w)) {
      // @0x22971e — inf-clamp; NaN also falls here (ucomiss unordered → all flags set → jbe).
      k = Math.fround(99999.0);
    } else if (rr <= 0) {
      // @0x229728 — identity; r=0 means p == center, so k has no effect.
      k = 1.0;
    } else {
      // @0x2296e4..0x229712 — the real tanf-based scale.
      const rFov = Math.fround(r * this.fovClamped);
      const tan = TANF(rFov);
      const denom = Math.fround(r * this.screenExtent2);
      k = Math.fround(tan / denom);
    }
    // @0x229730..0x229742 — result = center + (d * k) * invExtent
    const outX = Math.fround(this.centerX + Math.fround(Math.fround(dx * k) * this.invExtentX));
    const outY = Math.fround(this.centerY + Math.fround(Math.fround(dy * k) * this.invExtentY));
    return { x: outX, y: outY };
  }

  /**
   * LensParams::undistort(Pt2 const& p)  @Helium 0x229750.
   *
   *   0x22975c movsd (%rsi), %xmm3           ; xmm3 = (p.x, p.y)
   *   0x229760 movsd 0x24(%rdi), %xmm0        ; xmm0 = (scaleX, scaleY)
   *   0x229765 movsd 0x2c(%rdi), %xmm2        ; xmm2 = (centerX, centerY)
   *   0x22976a subps %xmm2, %xmm3             ; d = p - center
   *   0x22976d mulps %xmm0, %xmm3             ; d *= scale
   *   0x229770..0x22977a — rr = dx²+dy² (same movshdup+addss idiom)
   *   0x22977e xorps %xmm1, %xmm1
   *   0x229781 ucomiss %xmm1, %xmm0           ; compare 0 vs rr (AT&T-flipped)
   *   0x229784 jbe 0x2297bc                   ; if rr <= 0: goto identity (k=1)
   *   0x229789 sqrtss %xmm0, %xmm1            ; xmm1 = r = sqrt(rr)
   *   0x229792 movss 0x3c(%rbx), %xmm0        ; xmm0 = screenExtent2
   *   0x229797 mulss %xmm1, %xmm0             ; xmm0 = r * screenExtent2
   *   0x2297a3 callq _atanf                    ; xmm0 = atanf(r * screenExtent2)
   *   0x2297b0 mulss 0x38(%rbx), %xmm0        ; xmm0 *= invFov
   *   0x2297b5 divss -0xc(%rbp), %xmm0        ; xmm0 /= r  (r saved on the stack pre-call)
   *   0x2297ba jmp   0x2297c4
   *   0x2297bc movss 0x19e4fc(%rip), %xmm0    ; [@0x3c7cc0] xmm0 = 1.0f (identity)
   *   0x2297c4..0x2297d6 — same tail as distort: broadcast k, *invExtent, +center.
   *
   * i.e. `k = atanf(r * screenExtent2) * invFov / r`, then `result = center + d*k*invExtent`.
   */
  undistort(p: Pt2): Pt2 {
    const dx = Math.fround(Math.fround(p.x - this.centerX) * this.scaleX);
    const dy = Math.fround(Math.fround(p.y - this.centerY) * this.scaleY);
    const rr = Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy));
    let k: number;
    // @0x229781 — AT&T `ucomiss %xmm1, %xmm0` with xmm1=0, xmm0=rr → Intel compares rr vs 0.
    //   jbe fires when rr <= 0 → identity branch.
    if (rr <= 0 || Number.isNaN(rr)) {
      // @0x2297bc — k = 1.0.
      k = 1.0;
    } else {
      const r = Math.fround(Math.sqrt(rr));
      // @0x229797 — r * screenExtent2
      const arg = Math.fround(r * this.screenExtent2);
      // @0x2297a3 — atanf.
      const at = ATANF(arg);
      // @0x2297b0/0x2297b5 — * invFov, / r
      k = Math.fround(Math.fround(at * this.invFov) / r);
    }
    const outX = Math.fround(this.centerX + Math.fround(Math.fround(dx * k) * this.invExtentX));
    const outY = Math.fround(this.centerY + Math.fround(Math.fround(dy * k) * this.invExtentY));
    return { x: outX, y: outY };
  }

  /**
   * LensParams::distort(HGRect const& r)   @Helium 0x2297e0.
   *
   * Thin wrapper around _processRect that passes `&LensParams::distort(Pt2)`
   * as the member-function pointer. Body not yet transcribed — the wrapper
   * is a small trampoline but its sole callee `_processRect` is a 311-line
   * corner-and-edge-sampling routine that we defer.
   */
  distortRect(_r: unknown): unknown {
    throw new Error(
      "LensParams::distort(HGRect) @Helium 0x2297e0 not yet transcribed — wraps _processRect @0x229800 (311-line member-fn-ptr sampler)",
    );
  }

  /**
   * LensParams::undistort(HGRect const& r)  @Helium 0x229c60.
   *
   * Mirror of distortRect — passes `&undistort(Pt2)` to _processRect.
   */
  undistortRect(_r: unknown): unknown {
    throw new Error(
      "LensParams::undistort(HGRect) @Helium 0x229c60 not yet transcribed — wraps _processRect @0x229800",
    );
  }

  /**
   * LensParams::_processRect(Pt2 (LensParams::*)(Pt2 const&), HGRect const&)
   * @Helium 0x229800.
   *
   * Private helper that samples an HGRect through the given point-mapping
   * member function and reduces to a bounding rect. 311-line body with
   * ~40 basic blocks — not transcribed here; both `distortRect` and
   * `undistortRect` above throw citing this addr.
   */
  private _processRect(): unknown {
    throw new Error(
      "LensParams::_processRect @Helium 0x229800 not yet transcribed — 311-line member-fn-ptr sampler",
    );
  }
}
