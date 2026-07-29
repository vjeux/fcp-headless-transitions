/**
 * HGApply3DLUT (Helium framework) — 3D LUT applicator + gamma/cubic-transfer inversion.
 *
 * A 3D lookup-table filter used by the color/grade pipeline. This port covers the
 * pure-math kernel that is decoded from the binary: InvCubic, the closed-form
 * (Cardano) inversion of a scalar cubic transfer function that maps a normalized LUT
 * axis coordinate back to a source colour value.
 *
 * The remaining class methods (constructors, dtors, SetLUT, SetLUTBitmap, Init, GetOutput)
 * are Metal/CoreImage plumbing whose bodies are not yet transcribed; they are declared as
 * throwing stubs that cite their exact source addresses so the ledger can see the gaps.
 *
 * Struct layout partially recovered from InvCubic + the Init(unsigned long, HGFormat, float, float, bool, ...)
 * wrapper at @Helium 0x72ad0 (which fills three defaults from a constant pool at 0x3ccce8/0x3cccec/0x3cccf0):
 *   +0x1d8  int32_t  size    — LUT edge length (e.g. 33 for a 33x33x33 LUT). Used as (size-1) below.
 *   +0x1e4  float    d       — cubic RHS/offset (target-side constant)
 *   +0x1ec  float    b       — cubic x^2 coefficient (used in the -b/(3a) depression shift)
 *   +0x1f0  float    a       — cubic x^3 coefficient (divisor)
 *   +0x1f8  float    e       — depressed-cubic linear coefficient (a.k.a. p; enters as e^3/27)
 *   +0x1fc  float    c       — extra constant folded into q via c/27
 *
 * Default (a,b,c) from the Init wrapper's rip-relative loads at
 *   [0x72ad4 rip+0x35a20c] -> 0x3ccce8:  2.665f      (default a)
 *   [0x72adc rip+0x35a208] -> 0x3cccec: -2.896f     (default b)
 *   [0x72ae4 rip+0x35a204] -> 0x3cccf0:  1.231f      (default c)
 * These are the sRGB-family cubic-gamma coefficients this class inverts by default.
 */

// DECODE reference: re/disasm/Helium.HGApply3DLUT.InvCubic.s (from raw-port/tools/disasm.sh).
// Constants below are RIP-relative reads resolved against /tmp/Helium.x86_64 (thin x86_64 slice,
// VA == file offset for __const at 0x3c7b80..; verified with raw-port/army/tools/resolve.py).
//
// Constant-pool values consumed by InvCubic (all cited @Helium file-offset in __const):
//   @const 0x3ca300 (f64) = -1.0         ; addsd  at @0x729a0
//   @const 0x3c7cc0 (f32) =  1.0f        ; movss  at @0x729b0 (early-exit return)
//   @const 0x3ccd60 (f64) = 27.0         ; movsd  at @0x729ea
//   @const 0x3ccd68 (f64) = -0.5         ; mulsd  at @0x72a1c
//   @const 0x3cb178 (f64) =  0.25        ; mulsd  at @0x72a35
//   @const 0x3ccd70 (f64) = -3.0         ; mulsd  at @0x72ab1
const K_NEG_ONE   = -1.0;   // @Helium 0x3ca300
const K_ONE_F32   =  1.0;   // @Helium 0x3c7cc0 (float32)
const K_TWENTY7   = 27.0;   // @Helium 0x3ccd60
const K_NEG_HALF  = -0.5;   // @Helium 0x3ccd68
const K_QUARTER   =  0.25;  // @Helium 0x3cb178
const K_NEG_THREE = -3.0;   // @Helium 0x3ccd70

/**
 * The subset of HGApply3DLUT state InvCubic reads. Field offsets are in bytes from
 * the class base. Names come from the roles below (all float32 storage on the C++ side).
 */
export interface HGApply3DLUTCubicFields {
  /** +0x1d8 int32_t — LUT edge length. */
  size: number;
  /** +0x1e4 float  — cubic constant/RHS. */
  d: number;
  /** +0x1ec float  — x^2 coefficient (for -b/(3a) depression). */
  b: number;
  /** +0x1f0 float  — x^3 coefficient (divisor). */
  a: number;
  /** +0x1f8 float  — depressed linear coef (p; contributes e^3/27). */
  e: number;
  /** +0x1fc float  — extra constant folded into q via c/27. */
  c: number;
}

export class HGApply3DLUT {
  // The full struct is >0x200 bytes (many Metal-plumbing pointers). Only the cubic-inversion
  // fields are decoded here — everything else is opaque until the corresponding methods are
  // transcribed.
  /** +0x1d8 int32_t LUT edge length. */ size: number = 0;
  /** +0x1e4 float d.  */ d: number = 0;
  /** +0x1ec float b.  */ b: number = 0;
  /** +0x1f0 float a.  */ a: number = 0;
  /** +0x1f8 float e.  */ e: number = 0;
  /** +0x1fc float c.  */ c: number = 0;

  /**
   * HGApply3DLUT::InvCubic(float f) @Helium 0x72980
   *
   * Given a normalized LUT-axis output index `f`, invert the class's cubic transfer
   * function to recover the source coordinate. Uses Cardano's closed form on a depressed
   * cubic; the intermediate rounding to float32 mid-computation is preserved bit-exactly
   * because the compiler alternates between float32 (movss/mulss/addss/cvtsd2ss) and
   * float64 (movsd/mulsd/sqrtsd) at specific points.
   *
   * Disasm-driven transcription (line-for-line; see re/disasm/Helium.HGApply3DLUT.InvCubic.s):
   *   @0x72980 movaps %xmm0,%xmm1     ; save input f in xmm1
   *   @0x72983 xorps  %xmm0,%xmm0     ; xmm0 = 0.0f
   *   @0x72986 ucomiss %xmm0,%xmm1    ; compare f to 0.0f
   *   @0x72989 jne  0x7298e           ; NaN-ordered idiom: !== 0
   *   @0x7298b jp   0x7298e
   *   @0x7298d retq                   ; f == 0  ->  return 0.0f
   *
   *   @0x7298e..0x729a0 : xmm1 = (double)(int)this->size + K_NEG_ONE   ; n = size - 1  (as double)
   *   @0x729a8..0x729ac ucomisd xmm0,xmm1 + jne/jp                     ; if f == (size-1) return 1.0f
   *   @0x729b0 movss  K_ONE_F32,%xmm0
   *   @0x729b8 retq
   *
   *   ; --- Cardano path ---
   *   @0x729c2  xmm2 = (double) this->c            ; +0x1fc, cvtss2sd
   *   @0x729ce  xmm3 = (double) this->d            ; +0x1e4, cvtss2sd
   *   @0x729d6  xmm4 =          this->a  (float)   ; +0x1f0, still float in xmm4
   *   @0x729e2  xmm0 = (double)f / n               ; normalized coord in [0,1]  ("t")
   *   @0x729e6  xmm3 = d - t
   *   @0x729ea  xmm0 = 27.0                        ; K_TWENTY7
   *   @0x729f5  xmm1 = (double) this->a
   *   @0x729f9  spill xmm1 -> [rbp-0x28]           ; "aD" (double a)
   *   @0x729fe  xmm3 = 27 * (d - t)
   *   @0x72a02  xmm3 = (27*(d-t)) / a
   *   @0x72a06  xmm3 += c
   *   @0x72a0a  xmm3 /= 27                         ; xmm3 = c/27 + (d-t)/a  (before f32 round)
   *   @0x72a11  round to float:   f1 = (float) xmm3
   *   @0x72a18  xmm2 = (double) f1                 ; re-widen the just-rounded float
   *   @0x72a1c  xmm2 *= K_NEG_HALF                 ; qHalf = -f1/2  (this is the "-q/2" of Cardano)
   *   @0x72a24  xmm4 = xmm2 ; spill xmm2 -> [rbp-0x20]     ; qHalf saved twice
   *   @0x72a2d  xmm1 = f1*f1        (FLOAT multiply)
   *   @0x72a31  xmm1 = (double)(f1^2)
   *   @0x72a35  xmm1 = 0.25 * f1^2
   *   @0x72a3d  xmm2 =           this->e   (float)   ; +0x1f8
   *   @0x72a48  xmm3 = e*e         (FLOAT)
   *   @0x72a4c  xmm3 = e*e*e       (FLOAT)
   *   @0x72a53  xmm2 = (double)(e^3)
   *   @0x72a57  xmm2 = e^3 / 27
   *   @0x72a5b  xmm2 = 0.25*f1^2 + e^3/27           ; discriminant of the depressed cubic
   *   @0x72a62  xmm1 = sqrt(xmm2)                   ; DOUBLE sqrt
   *   @0x72a66  spill xmm1 -> [rbp-0x18]            ; "s" = sqrt(disc)
   *   @0x72a6b  xmm0 = qHalf
   *   @0x72a6f  xmm0 = qHalf + s                    ; ready for cbrt
   *   @0x72a76  callq cbrt                          ; xmm0 = cbrt(qHalf + s)     (double)
   *   @0x72a7b  cvtsd2ss                            ; ROUND to float32
   *   @0x72a7f  spill (float) -> [rbp-0xc]
   *   @0x72a84  xmm0 = qHalf                        ; reload (double)
   *   @0x72a89  xmm0 = qHalf - s
   *   @0x72a8e  callq cbrt                          ; xmm0 = cbrt(qHalf - s)
   *   @0x72a93  cvtsd2ss                            ; ROUND to float32
   *   @0x72a97  addss  [rbp-0xc], xmm0              ; sum of two cbrts in FLOAT32
   *   @0x72a9c  cvtss2sd                            ; re-widen to double
   *   @0x72aa0  xmm1 = (double) this->b             ; +0x1ec
   *   @0x72aac  xmm2 = (double)a  (from [rbp-0x28])
   *   @0x72ab1  xmm2 *= K_NEG_THREE                 ; -3a
   *   @0x72ab9  xmm1 = b / (-3a)                    ; = -b/(3a)  (depression shift)
   *   @0x72abd  xmm0 = cbrt-sum + (-b/(3a))
   *   @0x72ac4  return (float) xmm0
   *
   * @0xADDR 0x72980
   */
  InvCubic(f: number): number {
    // Preserve the exact ucomiss NaN-ordered idiom: `jne+jp` after ucomiss branches TO the else on
    // any inequality OR unordered (NaN) compare. `f !== 0` matches (NaN !== 0 is true, so NaN
    // falls through to the Cardano path just like the binary does). Do NOT use Object.is.
    //   @0x72980..0x7298d
    if (f !== 0) {
      // n = (double)((int)this->size) + (-1.0)  — @0x72998..0x729a0
      const n = ((this.size | 0) + K_NEG_ONE);
      // (double)f vs (size-1) — @0x729a8..0x729ac  (same NaN-ordered idiom)
      if (f !== n) {
        // Cardano path. All arithmetic mirrors the disasm word-for-word.
        // Widen fields.  @0x729c2..0x729de
        const cD = this.c;               // (double)c   @0x729c2 cvtss2sd
        const dD = this.d;               // (double)d   @0x729ce cvtss2sd
        const aF = Math.fround(this.a);  // still float32-shaped for +0x1f0
        // t = f / n   @0x729e2 divsd  (xmm0 = (double)f / xmm1 = n)
        const t = f / n;
        // r = d - t   @0x729e6 subsd
        let r = dD - t;
        // aD = (double)a  @0x729f5
        const aD = aF;
        // r = 27 * r  @0x729fe mulsd
        r = K_TWENTY7 * r;
        // r = r / aD  @0x72a02 divsd
        r = r / aD;
        // r = r + c   @0x72a06 addsd
        r = r + cD;
        // r = r / 27  @0x72a0a divsd
        r = r / K_TWENTY7;
        // f1 = (float) r  @0x72a11 cvtsd2ss  (bit-exact float rounding!)
        const f1 = Math.fround(r);
        // qHalf = (double)f1 * -0.5  @0x72a18..0x72a1c
        const qHalf = f1 * K_NEG_HALF;
        // fsq_f = f1*f1 (FLOAT)  @0x72a2d mulss ; then widen  @0x72a31 cvtss2sd
        const fsq_f = Math.fround(f1 * f1);
        // term1 = 0.25 * (double)fsq_f  @0x72a35 mulsd
        const term1 = K_QUARTER * fsq_f;
        const eF = Math.fround(this.e);
        // e*e*e in FLOAT then widen  @0x72a45..0x72a53
        const e3_f = Math.fround(Math.fround(eF * eF) * eF);
        // term2 = e^3 / 27  @0x72a57 divsd
        const term2 = e3_f / K_TWENTY7;
        // disc = term1 + term2  @0x72a5b addsd
        const disc = term1 + term2;
        // s = sqrt(disc)  DOUBLE  @0x72a62 sqrtsd
        const s = Math.sqrt(disc);
        // cbrtA = (float) cbrt(qHalf + s)  @0x72a6f..0x72a7b
        const cbrtA = Math.fround(Math.cbrt(qHalf + s));
        // cbrtB = (float) cbrt(qHalf - s)  @0x72a89..0x72a93
        const cbrtB = Math.fround(Math.cbrt(qHalf - s));
        // sum_f = (float)(cbrtA + cbrtB)   @0x72a97 addss  (FLOAT32 addition!)
        const sum_f = Math.fround(cbrtA + cbrtB);
        // shift = b / (-3a)  @0x72ab1..0x72ab9
        const bD = Math.fround(this.b);
        const shift = bD / (K_NEG_THREE * aD);
        // widen sum to double, add shift, return as float
        // @0x72a9c cvtss2sd ; @0x72abd addsd ; @0x72ac4 cvtsd2ss
        return Math.fround(sum_f + shift);
      }
      // f == size-1 branch: @0x729b0 movss K_ONE_F32 ; retq
      return K_ONE_F32;
    }
    // f == 0 branch: @0x7298d retq with xmm0 = 0.0
    return 0;
  }

  // -------------------------------------------------------------------------
  // Un-transcribed methods (Metal/CoreImage plumbing bodies not yet decoded).
  // Each throws with its exact source @0xADDR so frontier.py sees the gap and
  // the ledger cannot mark this class "verified" until they are done.
  // -------------------------------------------------------------------------

  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x71690 — primary ctor; not yet transcribed. */
  static ctor_71690(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x71690 not yet transcribed"); }
  /** HGApply3DLUT::Init(...) @Helium 0x71740 — long-form Init; not yet transcribed. */
  Init_71740(..._args: unknown[]): never { throw new Error("HGApply3DLUT::Init @0x71740 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x71fe0 — copy/move ctor variant; not yet transcribed. */
  static ctor_71fe0(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x71fe0 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x72090 — ctor variant; not yet transcribed. */
  static ctor_72090(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x72090 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x72140 — ctor variant; not yet transcribed. */
  static ctor_72140(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x72140 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x721f0 — ctor variant; not yet transcribed. */
  static ctor_721f0(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x721f0 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x722a0 — ctor variant; not yet transcribed. */
  static ctor_722a0(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x722a0 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x72350 — ctor variant; not yet transcribed. */
  static ctor_72350(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x72350 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x72420 — ctor variant; not yet transcribed. */
  static ctor_72420(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x72420 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x724f0 — ctor variant; not yet transcribed. */
  static ctor_724f0(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x724f0 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x725c0 — ctor variant; not yet transcribed. */
  static ctor_725c0(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x725c0 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x72690 — ctor variant; not yet transcribed. */
  static ctor_72690(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x72690 not yet transcribed"); }
  /** HGApply3DLUT::HGApply3DLUT(...) @Helium 0x72770 — ctor variant; not yet transcribed. */
  static ctor_72770(): never { throw new Error("HGApply3DLUT::HGApply3DLUT @0x72770 not yet transcribed"); }
  /** HGApply3DLUT::~HGApply3DLUT() @Helium 0x72850 — dtor variant; not yet transcribed. */
  dtor_72850(): never { throw new Error("HGApply3DLUT::~HGApply3DLUT @0x72850 not yet transcribed"); }
  /** HGApply3DLUT::~HGApply3DLUT() @Helium 0x728b0 — dtor variant; not yet transcribed. */
  dtor_728b0(): never { throw new Error("HGApply3DLUT::~HGApply3DLUT @0x728b0 not yet transcribed"); }
  /** HGApply3DLUT::~HGApply3DLUT() @Helium 0x72910 — dtor variant; not yet transcribed. */
  dtor_72910(): never { throw new Error("HGApply3DLUT::~HGApply3DLUT @0x72910 not yet transcribed"); }

  /**
   * HGApply3DLUT::Init(unsigned long, HGFormat, float, float, bool, ...) @Helium 0x72ad0
   *
   * Short-form Init wrapper. Disasm shows it loads three float32 defaults from the constant pool:
   *   @0x72ad4 movss [rip+0x35a20c]  -> 0x3ccce8:  2.665f   (default a)
   *   @0x72adc movss [rip+0x35a208]  -> 0x3cccec: -2.896f   (default b)
   *   @0x72ae4 movss [rip+0x35a204]  -> 0x3cccf0:  1.231f   (default c)
   *   @0x72aec xorps xmm2,xmm2                             (zero — likely d default)
   *   @0x72af0 jmp   HGApply3DLUT::Init(..., float, float, float, float, float, float, ...)
   * The tail-called long-form Init body is not yet transcribed (see Init_71740 above).
   */
  Init_72ad0(..._args: unknown[]): never { throw new Error("HGApply3DLUT::Init @0x72ad0 not yet transcribed"); }
  /** HGApply3DLUT::SetLUT(...) @Helium 0x72b00 — not yet transcribed. */
  SetLUT_72b00(..._args: unknown[]): never { throw new Error("HGApply3DLUT::SetLUT @0x72b00 not yet transcribed"); }
  /** HGApply3DLUT::SetLUT(...) @Helium 0x73280 — overload; not yet transcribed. */
  SetLUT_73280(..._args: unknown[]): never { throw new Error("HGApply3DLUT::SetLUT @0x73280 not yet transcribed"); }
  /** HGApply3DLUT::SetLUTBitmap(...) @Helium 0x73b40 — not yet transcribed. */
  SetLUTBitmap(..._args: unknown[]): never { throw new Error("HGApply3DLUT::SetLUTBitmap @0x73b40 not yet transcribed"); }
  /** HGApply3DLUT::GetOutput(...) @Helium 0x73bd0 — not yet transcribed. */
  GetOutput(..._args: unknown[]): never { throw new Error("HGApply3DLUT::GetOutput @0x73bd0 not yet transcribed"); }
}
