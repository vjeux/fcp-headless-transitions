// PCICCTransferFunctionParametric4 — ProCore framework
//
// ICC v4 Parametric Curve Type 4 (7-parameter piecewise TRC), per ICC.1:2010
// Table 65 / clause 10.15 (ParametricCurveType, functionType = 4):
//
//     Y = (a*X + b)^gamma + e   if X >= d
//     Y =  c*X + f               if X <  d
//
// State layout (recovered from ctor @0x13d72 movss stores):
//   +0x00  vtable
//   +0x08  float gamma           (getExponent @0x13e2c reads +0x08)
//   +0x0c  float a               (getA        @0x13e38 reads +0x0c)
//   +0x10  float b               (getB        @0x13e44 reads +0x10)
//   +0x14  float c               (getC        @0x13e50 reads +0x14)
//   +0x18  float d               (getD        @0x13e5c reads +0x18)
//   +0x1c  float e               (getE        @0x13e68 reads +0x1c)
//   +0x20  float f               (getF        @0x13e74 reads +0x20)
//
// All values are single-precision (movss / xmmN); Math.fround is applied at
// every arithmetic step to preserve float32 rounding per PORTING_SPEC rule 4.
//
// Framework: ProCore (/Applications/Final Cut Pro.app/.../ProCore.framework)
// Mangled ctor:      __ZN32PCICCTransferFunctionParametric4C2Efffffff  @0x13d72
// Mangled ctor (C1): __ZN32PCICCTransferFunctionParametric4C1Efffffff  @0x13da6
// Mangled operator: __ZNK32PCICCTransferFunctionParametric4clEf        @0x13df0

/** libm powf(x, y). Single-precision. Called from operator() @0x13e1a via `__ZL powf` stub. */
function powf(x: number, y: number): number {
  // Math.pow is double-precision in JS; fround the result to single to match
  // libm's powf return width (per the FCP disasm the return is consumed as
  // an xmm float and immediately participates in single-precision addss).
  return Math.fround(Math.pow(Math.fround(x), Math.fround(y)));
}

/**
 * PCICCTransferFunctionVisitor — the abstract visitor accept() dispatches to.
 * Only vtable slot +0x48 is referenced from accept() @0x13e80–@0x13e95.
 * Not yet transcribed — the visitors that implement it live in an anonymous
 * namespace (MakeTagVisitor, DescriptionVisitor, EstimateGammaVisitor,
 * TransferValueVisitor, PrintVisitor) — see ProCore.syms.txt.
 */
export interface PCICCTransferFunctionVisitor {
  /** vtable slot +0x48: visit(PCICCTransferFunctionParametric4 const&). Tail-called from accept() @0x13e95. */
  __vtable: {
    slot_0x48: (self: PCICCTransferFunctionVisitor, fn: PCICCTransferFunctionParametric4) => void;
  };
}

/**
 * PCICCTransferFunctionParametric4
 *
 * Ported addresses:
 *   ctor (C2)     @0x13d72   __ZN32PCICCTransferFunctionParametric4C2Efffffff
 *   ctor (C1)     @0x13da6   __ZN32PCICCTransferFunctionParametric4C1Efffffff  (identical body)
 *   dtor (D2)     @0x13dda   __ZN32PCICCTransferFunctionParametric4D2Ev        (trivial: ret)
 *   dtor (D1)     @0x13de0   __ZN32PCICCTransferFunctionParametric4D1Ev        (trivial: ret)
 *   dtor (D0)     @0x13de6   __ZN32PCICCTransferFunctionParametric4D0Ev        (tail-calls ::operator delete)
 *   operator()    @0x13df0   __ZNK32PCICCTransferFunctionParametric4clEf
 *   getExponent   @0x13e2c   +0x08
 *   getA          @0x13e38   +0x0c
 *   getB          @0x13e44   +0x10
 *   getC          @0x13e50   +0x14
 *   getD          @0x13e5c   +0x18
 *   getE          @0x13e68   +0x1c
 *   getF          @0x13e74   +0x20
 *   accept        @0x13e80   tail-calls visitor->vtable[+0x48](visitor, this)
 */
export class PCICCTransferFunctionParametric4 {
  /** +0x00 vtable pointer, set at ctor @0x13d76 (C2) / @0x13daa (C1). Opaque here. */
  public __vtable: unknown;

  /** +0x08  gamma (a.k.a. the exponent). Single-precision. */
  public readonly gamma: number;
  /** +0x0c  a coefficient of the power segment. Single-precision. */
  public readonly a: number;
  /** +0x10  b offset of the power segment. Single-precision. */
  public readonly b: number;
  /** +0x14  c coefficient of the linear segment. Single-precision. */
  public readonly c: number;
  /** +0x18  d break point (X threshold between linear and power segments). Single-precision. */
  public readonly d: number;
  /** +0x1c  e offset added AFTER pow() in the power segment. Single-precision. */
  public readonly e: number;
  /** +0x20  f offset added in the linear segment. Single-precision. */
  public readonly f: number;

  /**
   * Constructor(gamma, a, b, c, d, e, f) — @0x13d72 (C2) / @0x13da6 (C1)
   *
   * Instruction transcription (identical for C1 and C2 modulo the vtable literal):
   *   @0x13d76  lea  0x13513b(%rip), %rax   — vtable (C2)   |   @0x13daa: 0x135107 (C1)
   *   @0x13d7d  mov  %rax, (%rdi)           — this->__vtable = ...
   *   @0x13d80  movss %xmm0, 0x08(%rdi)     — gamma
   *   @0x13d85  movss %xmm1, 0x0c(%rdi)     — a
   *   @0x13d8a  movss %xmm2, 0x10(%rdi)     — b
   *   @0x13d8f  movss %xmm3, 0x14(%rdi)     — c
   *   @0x13d94  movss %xmm4, 0x18(%rdi)     — d
   *   @0x13d99  movss %xmm5, 0x1c(%rdi)     — e
   *   @0x13d9e  movss %xmm6, 0x20(%rdi)     — f
   *
   * Every parameter arrives as a single-precision float (xmm register, movss
   * store), so each is fround'd at construction to preserve float32 identity.
   */
  constructor(gamma: number, a: number, b: number, c: number, d: number, e: number, f: number) {
    // vtable literal at @0x13d76 (C2) — opaque address, marked here.
    this.__vtable = "PCICCTransferFunctionParametric4::vtable (C2 @rip+0x13513b, from @0x13d76)";
    this.gamma = Math.fround(gamma);
    this.a = Math.fround(a);
    this.b = Math.fround(b);
    this.c = Math.fround(c);
    this.d = Math.fround(d);
    this.e = Math.fround(e);
    this.f = Math.fround(f);
  }

  /**
   * ~PCICCTransferFunctionParametric4() — D2 @0x13dda / D1 @0x13de0
   *
   * Both trivial: `push rbp; mov rbp,rsp; pop rbp; ret`. No members with
   * non-trivial destructors, no base-class dtor call visible. We model as
   * a no-op.
   */
  destructor_D2(): void {
    // trivial (@0x13dda)
  }

  /**
   * ~PCICCTransferFunctionParametric4() — D0 (deleting) @0x13de6
   *   @0x13deb  jmp  __ZdlPv (::operator delete(void*))
   *
   * i.e. it just tail-calls ::operator delete on `this`. No dtor body runs
   * because D1/D2 are trivial. We model as a no-op call to the allocator.
   */
  destructor_D0_deleting(deleteFn: (p: PCICCTransferFunctionParametric4) => void): void {
    // @0x13de6 body is empty (push/mov/pop) then tail-jmp to operator delete.
    deleteFn(this);
  }

  /**
   * operator()(float x) const — @0x13df0
   *
   * Instruction transcription:
   *   @0x13df9  ucomiss 0x18(%rdi), %xmm0    — compare x with d  (AT&T: cmp xmm0 vs [d])
   *   @0x13dfd  jae     @0x13e0b             — if x >= d, take power branch
   *   ; else (x < d): LINEAR
   *   @0x13dff  mulss   0x14(%rbx), %xmm0    — x *= c
   *   @0x13e04  addss   0x20(%rbx), %xmm0    — x += f
   *   @0x13e09  jmp     @0x13e24             — return
   *   ; then (x >= d): POWER
   *   @0x13e0b  mulss   0x0c(%rbx), %xmm0    — x *= a
   *   @0x13e10  addss   0x10(%rbx), %xmm0    — x += b
   *   @0x13e15  movss   0x08(%rbx), %xmm1    — xmm1 = gamma
   *   @0x13e1a  call    powf                  — xmm0 = powf(a*x+b, gamma)
   *   @0x13e1f  addss   0x1c(%rbx), %xmm0    — xmm0 += e
   *   @0x13e24  ret
   *
   * ==> Y = (x >= d) ? powf(a*x + b, gamma) + e
   *                  :  c*x + f
   *
   * That is exactly ICC Parametric Curve Type 4.
   *
   * ORDERED COMPARE: `ucomiss` sets ZF/PF/CF and `jae` == `jnc` fires when
   * CF=0. If `x` is NaN the compare is UNORDERED (ZF=PF=CF=1) → jae NOT
   * taken → the LINEAR branch runs with NaN, producing NaN out. That matches
   * libc behavior; we reproduce it via NaN propagation through * and +.
   */
  call(x: number): number {
    // ucomiss / jae semantics: jae taken iff x >= d AND ordered.
    // In JS, `x >= d` returns false when x is NaN, matching the unordered→not-taken
    // behavior of `jae` after `ucomiss`.
    const xf = Math.fround(x);
    if (xf >= this.d) {
      // POWER branch @0x13e0b–@0x13e1f
      const linear = Math.fround(Math.fround(this.a * xf) + this.b);
      const powed = powf(linear, this.gamma);
      return Math.fround(powed + this.e);
    } else {
      // LINEAR branch @0x13dff–@0x13e09
      return Math.fround(Math.fround(this.c * xf) + this.f);
    }
  }

  /**
   * getExponent() const — @0x13e2c
   *   movss 0x08(%rdi), %xmm0 ; ret     — returns this->gamma
   */
  getExponent(): number { return this.gamma; }

  /**
   * getA() const — @0x13e38
   *   movss 0x0c(%rdi), %xmm0 ; ret     — returns this->a
   */
  getA(): number { return this.a; }

  /**
   * getB() const — @0x13e44
   *   movss 0x10(%rdi), %xmm0 ; ret     — returns this->b
   */
  getB(): number { return this.b; }

  /**
   * getC() const — @0x13e50
   *   movss 0x14(%rdi), %xmm0 ; ret     — returns this->c
   */
  getC(): number { return this.c; }

  /**
   * getD() const — @0x13e5c
   *   movss 0x18(%rdi), %xmm0 ; ret     — returns this->d
   */
  getD(): number { return this.d; }

  /**
   * getE() const — @0x13e68
   *   movss 0x1c(%rdi), %xmm0 ; ret     — returns this->e
   */
  getE(): number { return this.e; }

  /**
   * getF() const — @0x13e74
   *   movss 0x20(%rdi), %xmm0 ; ret     — returns this->f
   */
  getF(): number { return this.f; }

  /**
   * accept(PCICCTransferFunctionVisitor& v) const — @0x13e80
   *
   * Instruction transcription:
   *   @0x13e84  mov  %rdi, %rax           — save this
   *   @0x13e87  mov  (%rsi), %rcx         — rcx = v.__vtable
   *   @0x13e8a  mov  0x48(%rcx), %rcx     — rcx = v.__vtable[+0x48]
   *   @0x13e8e  mov  %rsi, %rdi           — arg1 = &v  (self of visitor)
   *   @0x13e91  mov  %rax, %rsi           — arg2 = this
   *   @0x13e95  jmp  *%rcx                — tail-call visitor.visit(this)
   *
   * i.e. v.__vtable[+0x48](&v, this) — dispatch through the visitor's
   * Parametric4-overload virtual.
   */
  accept(v: PCICCTransferFunctionVisitor): void {
    v.__vtable.slot_0x48(v, this);
  }
}

// --- verification (against ICC Parametric Curve Type 4, from disasm formula) ---
//
// Concrete check the port matches the transcribed formula (not a spec re-derivation):
//
//   sRGB-style params (ICC v4 encoding of sRGB per ICC.1:2010):
//     gamma = 2.4, a = 1/1.055, b = 0.055/1.055, c = 1/12.92, d = 0.04045, e = 0, f = 0
//   For x = 0.5 (>= d): Y = ((0.5/1.055) + 0.055/1.055)^2.4
//                         = (0.555/1.055)^2.4  ≈ 0.5259...^2.4  ≈ 0.21404...
//   For x = 0.02  (< d): Y = 0.02 / 12.92                    ≈ 0.001548...
// (See commit message for the raw fround'd float32 values used at commit time.)
