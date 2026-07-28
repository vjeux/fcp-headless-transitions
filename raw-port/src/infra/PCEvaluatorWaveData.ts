// raw-port/src/infra/PCEvaluatorWaveData.ts
//
// FCP `PCEvaluatorWaveData` — a parameterized-oscillator wave-data container
// (six double args + one int count + four lazily-allocated double[] wave
// tables + a PCSpinLock guard). Owned by higher-level ProCore evaluators.
//
// Symbols decoded here (ProCore, x86_64 slice; VAs from `otool -tV`):
//   0x0000cd88  PCEvaluatorWaveData::PCEvaluatorWaveData()                                [default ctor — all fields zero]
//   0x0000cdac  PCEvaluatorWaveData::PCEvaluatorWaveData(double, double, double, double, double, double, int)  [param ctor]
//   0x0000cde4  PCEvaluatorWaveData::operator==(PCEvaluatorWaveData const&)  const
//   0x0000ce92  PCEvaluatorWaveData::operator=(PCEvaluatorWaveData const&)
//   0x0000cf04  PCEvaluatorWaveData::~PCEvaluatorWaveData()                  [D2 base dtor]
//   0x0000cf7e  PCEvaluatorWaveData::~PCEvaluatorWaveData()                  [D1 — tail-jmp to D2]
//   0x0000cf88  PCEvaluatorWaveData::refreshWaveArrays()
//
// ─────────────────────────────────────────────────────────────────────────────
// STRUCT LAYOUT (recovered from the C1 param ctor field-by-field writes and
// cross-verified by operator= / dtor / refreshWaveArrays reads):
//
//   offset  size   field           notes (each write cites the asm line)
//   ------  -----  --------------  --------------------------------------------
//   +0x00   0x08   a0 : double     (param ctor: movsd %xmm4, (%rdi)   @0xcdb7)
//   +0x08   0x08   a1 : double     (param ctor: movsd %xmm5, 0x8(%rdi) @0xcdbb)
//   +0x10   0x08   b0 : double     (param ctor: movsd %xmm0, 0x10(%rdi) @0xcdc0)
//   +0x18   0x08   b1 : double     (param ctor: movsd %xmm1, 0x18(%rdi) @0xcdc5)
//   +0x20   0x08   c0 : double     (param ctor: movsd %xmm2, 0x20(%rdi) @0xcdca)
//   +0x28   0x08   c1 : double     (param ctor: movsd %xmm3, 0x28(%rdi) @0xcdcf)
//   +0x30   0x04   n  : int32      (param ctor: movl  %esi, 0x30(%rdi) @0xcdd4)
//   +0x38   0x08   wave0 : double*  (dyn alloc via __Znam in refreshWaveArrays)
//   +0x40   0x08   wave1 : double*  (dyn alloc via __Znam in refreshWaveArrays)
//   +0x48   0x08   wave2 : double*  (dyn alloc via __Znam in refreshWaveArrays)
//   +0x50   0x08   wave3 : double*  (dyn alloc via __Znam in refreshWaveArrays)
//   +0x58   ...    spinLock : PCSpinLock  (dtor calls PCSpinLock::lock/unlock/~;
//                                          param ctor writes int $0 at +0x58 as
//                                          the lock's initial os_unfair_lock word)
//
// The default ctor (@0xcd88) initializes everything to zero:
//    movl 0,0x30(%rdi); xorps xmm0; movups xmm0,{+0x20,+0x10,+0x00,+0x38,+0x48}; movl 0,0x58
// The param ctor (@0xcdac) sets the doubles + int, then also zeroes wave0..3
// (`movups xmm0, 0x38(%rdi); movups xmm0, 0x48(%rdi)`) and clears the lock
// word (`movl $0, 0x58(%rdi)`).
//
// ─────────────────────────────────────────────────────────────────────────────
// operator== @0xcde4 — tolerance-based equality of doubles with tolerance 1e-7,
// followed by exact-equality of the int n.
//
// Constants (VA -> file offset shift for ProCore x86_64 slice = +0x4000
// (fat-header offset); values verified by direct binary read):
//   @ProCore 0xe206f   16 bytes = 0x8000000000000000, 0x8000000000000000
//                       -> `andpd` mask that clears the sign bit (packed abs)
//   @ProCore 0x122880  8 bytes  (movsd single-scalar load) = 1.0e-07
//                       -> the tolerance threshold vs `|a - b|`
//
// Body (per field, in-order):
//   for f in [+0x00 a0, +0x08 a1, +0x10 b0, +0x18 b1, +0x28 c1, +0x20 c0]:
//     xmm1 = this[f] - other[f]
//     xmm1 = xmm1 & 0x7fffffffffffffff   ; via andpd 0x115878/... rip -> mask @0xe206f
//     xmm0 = 1e-07                        ; via movsd 0x115a80(%rip) -> @0x122880
//     if !(xmm0 > xmm1) goto FALSE        ; ucomisd + jbe 0xce8d
//   return (this->n == other->n)          ; movl + cmpl + sete
//   FALSE: return 0.
//
// Notes for a faithful port:
//   - The FIELD-COMPARISON ORDER is not [a0,a1,b0,b1,c0,c1]: the asm compares
//     +0x28 (c1) BEFORE +0x20 (c0) — a compiler reordering that preserves
//     semantics (all fields must pass; short-circuit AND). We mirror exactly.
//   - Both operands are treated as `const double`; the andpd uses PACKED lanes
//     but only the low lane is compared, so scalar semantics apply. We use
//     `Math.abs` which for finite doubles is bit-identical to andpd's mask.
//   - The `jbe` (unsigned branch on unordered/below-or-equal) makes NaN
//     compare FALSE — `ucomisd` sets CF+ZF+PF on unordered, and `jbe` takes
//     the branch when CF||ZF, so NaN goes to the FALSE path. We mirror this
//     with `!(tol > diff)` (returns FALSE if diff is NaN).
//
// ─────────────────────────────────────────────────────────────────────────────
// operator= @0xce92 — packed copy of the first 0x30 bytes (6 doubles), then
// copy the int n (+0x30), then free each of the four wave-array pointers via
// `operator delete[]` (__ZdaPv) and null them:
//
//   movups (rsi),xmm0; movups xmm0,(rdi)     ; copy [0..15]
//   movups 0x10(rsi),xmm0; movups xmm0,0x10(rdi) ; copy [16..31]
//   movups 0x20(rsi),xmm0; movups xmm0,0x20(rdi) ; copy [32..47]
//   movl 0x30(rsi),eax; movl eax,0x30(rdi)   ; copy int n
//   for each ptr in [+0x38, +0x40, +0x48, +0x50]:
//     if ptr != NULL: operator delete[](ptr)
//   // then, moving rbx to (this+0x38) and doing two more movups xmm0(=0),
//   // xorps xmm0; movups xmm0,(rbx+0x10); movups xmm0,(rbx):
//   // -> null-out (this+0x38..this+0x50) i.e. wave0..wave3
//   return
//
// Note: PCSpinLock at +0x58 is NEITHER copied NOR reset here — this matches
// the asm exactly. The lock is per-instance, decoupled from wave data.
//
// ─────────────────────────────────────────────────────────────────────────────
// ~PCEvaluatorWaveData @0xcf04 (D2 base dtor) — under lock, frees the four
// wave arrays, nulls the pointers, then unlocks and destroys the lock:
//
//   rbx = (this+0x58) = &spinLock
//   PCSpinLock::lock(&spinLock)                             @ProCore 0x349b0
//   for each ptr in [wave0..wave3]: if != NULL, operator delete[]
//   null-out wave0..wave3   (xorps xmm0; movups xmm0,+0x10(r14+0x38); movups xmm0,(r14+0x38))
//   PCSpinLock::unlock(&spinLock)                           @ProCore 0x349ba
//   ~PCSpinLock(&spinLock)  (tail-jmp)                      @ProCore PCSpinLockD1
//
// D1 @0xcf7e is a pure tail-jmp to D2 @0xcf04. In TS we model both by a single
// `destructor()` method that frees the arrays under lock.
//
// ─────────────────────────────────────────────────────────────────────────────
// refreshWaveArrays @0xcf88 — the WORK METHOD. Allocates four new N-element
// double arrays (after freeing any existing ones), fills wave0..wave3 with a
// parametric damped-oscillator wave family driven by the six doubles a0/a1/
// b0/b1/c0/c1 and the count n. 150 asm lines calling `_sin` and `_exp`.
//
// Decoded rodata constants used here:
//   @ProCore 0xe2070   16 bytes = { -0.0, -0.0 }
//                       -> `orpd` blend that FORCES sign bit on both lanes
//                          (the temp gets set to `-|value|` variant later)
//   @ProCore 0x122530  16 bytes = { 1.0, 4.0 }  (movsd used at 0xd11c
//                       loads only the 1.0 low lane -> subsd yields (1 - k/n))
//   @ProCore 0x122560  16 bytes = { 6.283185307179586, 2.0 }
//                       (movsd used at 0xd17e loads only 2π; the phase step
//                        for the k-th sample is 2π * k/n * c0 + c1 through the
//                        argument of _sin)
//
// The kernel per k in [1, n):
//   let f = k / n            ; xmm1 = cvtsi2sd(k) / cvtsi2sd(n)  (@0xd10b, 0xd112)
//   let g = (1 - f)          ; xmm0 = 1.0 - xmm1                 (@0xd11c-0xd124)
//   // Branch on sign of c1 (@0xd100: ucomisd -0x90(%rbp), xmm0 where
//   // -0x90(%rbp) holds a copy of c1). If c1 > 0 use exp((1-f) * c1');
//   // else use exp(f * c1' / n) — a different scaling path.
//   let env = exp( ... )    ; via _exp
//   let s   = sin( ... )    ; via _sin, with argument 2π*f * b1 + c0
//   wave0[k] = env * b0                          ; via movlpd at 0xd1ca
//   wave1[k] = env * sin(2π f b1 + c0)           ; via movhpd at 0xd1d0
//   wave2[k] = env * f                           ; via movsd  at 0xd167
//   wave3[k] = wave3[k-1] + sqrt(distanceSq)     ; cumulative arc length
//     where distanceSq = ( env * b0 - sqrt(a0² + a1²) )²
//                      + ( env * sin(...) - 0 )²         (the -unpcklpd terms)
//
// The above kernel is my best decoded reading of the loop body, but the
// exact algebra for `env`'s two branches (@0xd112..0xd137 vs 0xd139..0xd15d)
// and the exact use of the `orpd -0.0` sign-flip mask at 0xd0d4 (which reads
// c1 into %xmm1 and forces sign to make it negative for the exp argument)
// requires a proper 2-pass trace with register renaming to nail down which
// stack slot holds which of a0/a1/b0/b1/c0/c1/norm at each point. A
// silent partial implementation here would violate PORTING_SPEC
// Rule 3 we throw so downstream consumers see the loud gap while the six
// scalar-field ctor/dtor/comparison plumbing DOES faithfully land.
//
// ─────────────────────────────────────────────────────────────────────────────

import { PCSpinLock } from "./PCSpinLock";

/**
 * PCEvaluatorWaveData — parameterized wave-array holder used by ProCore
 * evaluators. Six doubles (a0,a1,b0,b1,c0,c1) + int n define the wave
 * family; wave0..wave3 hold n samples each, lazily generated by
 * refreshWaveArrays().
 */
export class PCEvaluatorWaveData {
  a0 = 0;
  a1 = 0;
  b0 = 0;
  b1 = 0;
  c0 = 0;
  c1 = 0;
  n = 0;
  wave0: Float64Array | null = null;
  wave1: Float64Array | null = null;
  wave2: Float64Array | null = null;
  wave3: Float64Array | null = null;
  /** PCSpinLock at struct offset +0x58 — guards wave0..wave3 alloc/free. */
  readonly spinLock = new PCSpinLock();

  /**
   * @ProCore 0x0000cd88  Default ctor. Zero-inits the 4 doubles at +0x00..+0x28,
   * the two wave-pointer pairs at +0x38..+0x4f, the int n at +0x30, and the
   * lock word at +0x58. Body:
   *   movl 0, 0x30(%rdi); xorps xmm0;
   *   movups xmm0, 0x20/0x10/0x00(rdi);
   *   movups xmm0, 0x38/0x48(rdi); movl 0, 0x58(rdi).
   * All fields already default to zero in the TS class initializers above,
   * so this constructor's body is empty.
   *
   * @ProCore 0x0000cdac  Parameterized ctor:
   *    PCEvaluatorWaveData(double b0, double b1, double c0, double c1,
   *                        double a0, double a1, int n)
   * SysV amd64 calling convention (skipping `this` in rdi):
   *    xmm0=b0, xmm1=b1, xmm2=c0, xmm3=c1, xmm4=a0, xmm5=a1, esi=n
   *
   *    movl  0, 0x58(rdi)       ; lock word = 0
   *    movsd xmm4, (rdi)        ; a0
   *    movsd xmm5, 0x8(rdi)     ; a1
   *    movsd xmm0, 0x10(rdi)    ; b0
   *    movsd xmm1, 0x18(rdi)    ; b1
   *    movsd xmm2, 0x20(rdi)    ; c0
   *    movsd xmm3, 0x28(rdi)    ; c1
   *    movl  esi, 0x30(rdi)     ; n
   *    xorps xmm0
   *    movups xmm0, 0x38(rdi)   ; wave0=NULL, wave1=NULL
   *    movups xmm0, 0x48(rdi)   ; wave2=NULL, wave3=NULL
   *
   * Note the SIX doubles arrive in a specific order that maps to
   * (b0,b1,c0,c1,a0,a1) — this is because the C++ member declaration order is
   * (a0,a1,b0,b1,c0,c1) but the CALLING-CONVENTION order is different: SysV
   * groups floats in xmm0..xmm5 in DECLARATION-ORDER of the ARGUMENT LIST, not
   * the field list. The public signature is documented as:
   *    PCEvaluatorWaveData(double, double, double, double, double, double, int)
   * with no arg names; we choose (b0,b1,c0,c1,a0,a1,n) to match the observed
   * xmm assignment order in the asm.
   */
  constructor(
    b0?: number,
    b1?: number,
    c0?: number,
    c1?: number,
    a0?: number,
    a1?: number,
    n?: number,
  ) {
    if (
      b0 !== undefined &&
      b1 !== undefined &&
      c0 !== undefined &&
      c1 !== undefined &&
      a0 !== undefined &&
      a1 !== undefined &&
      n !== undefined
    ) {
      // @ProCore 0xcdb7 - 0xcdd4:
      this.a0 = a0;
      this.a1 = a1;
      this.b0 = b0;
      this.b1 = b1;
      this.c0 = c0;
      this.c1 = c1;
      this.n = n | 0; // 32-bit int per `movl %esi, 0x30(%rdi)`
      // @ProCore 0xcdd7-0xcdde: xorps + movups pair -> wave0..wave3 = NULL.
      // Already NULL via class initializers above.
    }
    // Default-ctor path (all args undefined): fields already zero.
  }

  /**
   * @ProCore 0x0000cde4  operator==(PCEvaluatorWaveData const& other) const
   *
   * Tolerance-based double comparison: for each of the six doubles the
   * absolute difference must be STRICTLY less than 1e-7; then the int
   * n must be exactly equal. NaN differences short-circuit to FALSE
   * (matches `ucomisd`+`jbe` unordered-taken-as-below-or-equal).
   *
   * Field comparison order per asm (COMPILER-REORDERED — must match):
   *   [+0x00 a0] [+0x08 a1] [+0x10 b0] [+0x18 b1] [+0x28 c1] [+0x20 c0]
   *
   * Constants:
   *   TOL = 1e-7           @ProCore 0x122880  (movsd single scalar)
   *   MASK = 0x7fff...ffff via `andpd @ProCore 0xe206f` (packed sign-clear;
   *                             equivalent to Math.abs for finite doubles).
   */
  equals(other: PCEvaluatorWaveData): boolean {
    // @ProCore 0xcdf8: xmm0 = TOL = 1e-7 (@0x122880)
    const TOL = 1e-7;
    // Field-diff sequence matching @0xcde8..0xce80 asm order exactly:
    //   [a0, a1, b0, b1, c1, c0]  (note c1 BEFORE c0 — compiler swap).
    // `ucomisd xmm1, xmm0; jbe FALSE` means: if !(TOL > |diff|) return false.
    if (!(TOL > Math.abs(this.a0 - other.a0))) return false; // @0xcde8 / @0xcdf0
    if (!(TOL > Math.abs(this.a1 - other.a1))) return false; // @0xce0a / @0xce14
    if (!(TOL > Math.abs(this.b0 - other.b0))) return false; // @0xce22 / @0xce2c
    if (!(TOL > Math.abs(this.b1 - other.b1))) return false; // @0xce3a / @0xce44
    if (!(TOL > Math.abs(this.c1 - other.c1))) return false; // @0xce52 / @0xce5c  (c1 BEFORE c0 per asm)
    if (!(TOL > Math.abs(this.c0 - other.c0))) return false; // @0xce6a / @0xce74
    // @0xce82-0xce88: movl 0x30(rdi), eax; cmpl 0x30(rsi), eax; sete al
    return (this.n | 0) === (other.n | 0);
  }

  /**
   * @ProCore 0x0000ce92  operator=(PCEvaluatorWaveData const& other)
   *
   * Bulk-copies the 6 doubles (via three 16-byte movups) and the int n
   * from `other`, then FREEs any existing wave0..wave3 arrays on THIS
   * (operator delete[]) and NULLs them. Does NOT copy or reset the spinlock.
   *
   * Note: the asm frees the OLD wave pointers on `this` AFTER the header
   * copy — this ordering is preserved. In TS we simply drop the references
   * (GC handles the free); the null-out mirrors the asm's `movups xmm0,0x38/0x48`.
   */
  assign(other: PCEvaluatorWaveData): PCEvaluatorWaveData {
    // @ProCore 0xce9b - 0xceb4:
    this.a0 = other.a0;
    this.a1 = other.a1;
    this.b0 = other.b0;
    this.b1 = other.b1;
    this.c0 = other.c0;
    this.c1 = other.c1;
    this.n = other.n | 0;
    // @ProCore 0xceb7 - 0xceee: free each old wave ptr if non-NULL. In TS
    // with GC, dropping the reference is the equivalent — no explicit
    // delete[] needed. We match the null-out.
    this.wave0 = null;
    this.wave1 = null;
    this.wave2 = null;
    this.wave3 = null;
    return this;
  }

  /**
   * @ProCore 0x0000cf04  destructor (D2 base). Under lock, frees the four
   * wave arrays, nulls them, unlocks, and destroys the lock. In TS with GC
   * we simply drop the references; PCSpinLock's TS model is a boolean flag,
   * so lock()/unlock() calls remain semantically important (they'd throw on
   * re-entry, which is a real invariant).
   *
   * @ProCore 0x0000cf7e  D1 tail-jmp to D2 @0xcf04. Modeled here as one method.
   */
  destructor(): void {
    // @ProCore 0xcf15: PCSpinLock::lock()  @0x349b0
    this.spinLock.lock();
    // @0xcf1a - 0xcf51: free each wave ptr (delete[] equivalents).
    this.wave0 = null;
    this.wave1 = null;
    this.wave2 = null;
    this.wave3 = null;
    // @0xcf65: PCSpinLock::unlock()   @0x349ba
    this.spinLock.unlock();
    // @0xcf71: jmp PCSpinLock::~PCSpinLock() (tail-jmp). PCSpinLock's dtor
    // is a no-op per its port; nothing to do here.
  }

  /**
   * @ProCore 0x0000cf88  refreshWaveArrays() — reallocates wave0..wave3 as
   * new N-element double arrays and fills them with a damped-oscillator wave
   * family driven by (a0, a1, b0, b1, c0, c1, n). Uses _sin and _exp libm.
   *
   * Decoded rodata constants (each verified by direct binary byte-read at
   * the x86_64 slice's fat-header-adjusted file offset — see class doc):
   *   MASK_NEG0    @ProCore 0xe2070   = { -0.0, -0.0 }   (orpd -> force sign bit)
   *   PACK_1_4     @ProCore 0x122530  = { 1.0, 4.0 }     (movsd loads 1.0 scalar)
   *   PACK_2PI_2   @ProCore 0x122560  = { 2π, 2.0 }      (movsd loads 2π scalar)
   *
   * PORT STATUS (PORTING_SPEC Rule 3 — throw on undecoded):
   * The 150-line loop body's exact algebra requires a second-pass trace to
   * pin down which of a0..c1/norm/n is in each stack slot at every use, plus
   * the c1 sign branch (@0xd100 vs @0xd112..0xd158) is a bimodal path where
   * a wrong reading silently corrupts the wave data. Rather than partially transcrimate,
   * throw so downstream consumers see the gap while the six scalar-field
   * ctor/dtor/comparison plumbing DOES faithfully land.
   */
  refreshWaveArrays(): void {
    throw new Error(
      "PCEvaluatorWaveData::refreshWaveArrays @ProCore 0x0000cf88 not yet transcribed " +
        "(150-line _sin/_exp damped-oscillator loop with bimodal c1 branch; " +
        "decoded rodata @0xe2070 {-0,-0}, @0x122530 {1.0,4.0}, @0x122560 {2π,2.0}; " +
        "faithful port requires 2nd-pass stack-slot register trace)",
    );
  }
}
