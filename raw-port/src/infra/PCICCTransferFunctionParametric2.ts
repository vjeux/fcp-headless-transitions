// PCICCTransferFunctionParametric2.ts — ProCore's PCICCTransferFunctionParametric2.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
// See raw-port/re/disasm/ProCore.PCICCTransferFunctionParametric2.*.s .
//
// ROLE. Another concrete node in the PCICCTransferFunction visitor hierarchy: an
// ICC parametric-curve type 2 (the ICC 4.3 spec, table 65,
// `parametricCurveType` funcType == 2). The curve is a gated power law WITH a
// constant tail offset:
//     y = (a*x + b)^g + c   if x >= -b/a
//     y = c                 otherwise
// Compare Parametric1 (no c) and Parametric3 (adds a knee at threshold t) and
// Parametric4 (adds a linear pre-add e*x + f below the knee). This is the
// direct four-parameter (g, a, b, c) extension of Parametric1.
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
//
// EXPORTED SYMBOLS (Itanium C++ ABI, ProCore x86_64 slice; VAs from `nm -arch x86_64`
// and cross-checked against `xcrun otool -tV`):
//   @0x13bbe   __ZN32PCICCTransferFunctionParametric2C1Effff  ctor(float,float,float,float)  (C1)
//   @0x13bbe   __ZN32PCICCTransferFunctionParametric2C2Effff  ctor(float,float,float,float)  (C2 aliased to C1 body)
//   @0x13be2   __ZN32PCICCTransferFunctionParametric2D1Ev     ~PCICCTransferFunctionParametric2  (D1)
//   @0x13be2   __ZN32PCICCTransferFunctionParametric2D2Ev     ~PCICCTransferFunctionParametric2  (D2 aliased to D1 body)
//   @0x13bee   __ZN32PCICCTransferFunctionParametric2D0Ev     ~PCICCTransferFunctionParametric2  (D0 deleting; tail-jmp `operator delete`)
//   @0x13bf8   __ZNK32PCICCTransferFunctionParametric2clEf    operator()(float) const
//   @0x13c46   __ZNK32PCICCTransferFunctionParametric211getExponentEv    getExponent() const
//   @0x13c52   __ZNK32PCICCTransferFunctionParametric24getAEv            getA() const
//   @0x13c5e   __ZNK32PCICCTransferFunctionParametric24getBEv            getB() const
//   @0x13c6a   __ZNK32PCICCTransferFunctionParametric24getCEv            getC() const
//   @0x13c76   __ZNK32PCICCTransferFunctionParametric26acceptER28PCICCTransferFunctionVisitor
//                                                                       accept(PCICCTransferFunctionVisitor&) const
//
// VTABLE (installed-ptr = 0x148e58 — verified via
//   `python3 raw-port/army/tools/resolve.py ProCore sym 0x148e58`):
//   ctor loads `leaq 0x13528f(%rip),%rax` @0x13bc2 -> next-instr 0x13bc9,
//   0x13bc9 + 0x13528f = 0x148e58.
//   Slots recovered from the ctor + method addresses:
//     *0x00 -> 0x13be2  ~Parametric2()  [D1/D2 alias]
//     *0x08 -> 0x13bee  ~Parametric2()  [D0 deleting]
//     *0x10 -> 0x13bf8  operator()(float) const
//     *0x18 -> 0x13c76  accept(PCICCTransferFunctionVisitor&) const
//   (This is the Parametric2-specific installed-vtable ptr; separately from the
//    Parametric1..4 compound-vtable emission described in Parametric1.ts.)
//
// STRUCT LAYOUT (recovered from ctor @0x13bbe + operator() @0x13bf8 + getters):
//   +0x00  vtable  : *const void   // ctor: `leaq 0x13528f(%rip),%rax; movq %rax,(%rdi)` @0x13bc2/0x13bc9
//                                  //   -> vtable installed-ptr = 0x148e58
//   +0x08  g       : float32       // ctor: `movss %xmm0, 0x8(%rdi)`  @0x13bcc  (getExponent reads this)
//   +0x0c  a       : float32       // ctor: `movss %xmm1, 0xc(%rdi)`  @0x13bd1  (getA reads this)
//   +0x10  b       : float32       // ctor: `movss %xmm2, 0x10(%rdi)` @0x13bd6  (getB reads this)
//   +0x14  c       : float32       // ctor: `movss %xmm3, 0x14(%rdi)` @0x13bdb  (getC reads this)
//   sizeof = 0x18 bytes (last field ends at 0x18; no trailing writes beyond).
//
// RIP-relative constant used by operator() @0x13c0b:
//   `movaps 0xce44e(%rip), %xmm3` from next-instr 0x13c12 = target 0xe2060.
//   Read via the same __xmmword as Parametric1 (see raw-port/src/infra/
//   PCICCTransferFunctionParametric1.ts): 128-bit __xmmword whose two low
//   float32 lanes both hold 0x80000000 = single-precision -0.0f. Used to
//   compute `-b` via `xorps xmm2,xmm3` (sign-flip of b). This exact
//   __xmmword is SHARED by every Parametric* class's operator() — it lives
//   in ProCore's __TEXT,__const section at VA 0xe2060.
//
// The base class PCICCTransferFunction is transcribed in
//   raw-port/src/infra/PCICCTransferFunction.ts . Its D2 dtor @0x13790 is a
// 6-byte empty stub and installs no vtable — subclasses (including this one)
// each install their own directly and do NOT chain to any base body. So this
// class's D1/D2 alias is a bare trivial dtor: only the vtable is left as-is,
// no fields to release, no bases to unwind.

/**
 * Abstract visitor for the PCICCTransferFunction* family — Parametric2's slot.
 * Modelled from the `accept` disassembly (see below): the visitor's vtable
 * slot 0x38 (byte offset — one more than Parametric1's *0x30) is invoked
 * with the Parametric2 subclass instance as its single argument, i.e.
 * `visit(Parametric2 const&)`.
 *
 * The same TS-level naming convention as Parametric1's port applies: the
 * declaration is scoped to `PCICCTransferFunctionParametric2Visitor` and is
 * NOT the same TS interface as its Parametric1/Gamma/Linear siblings.
 */
export interface PCICCTransferFunctionParametric2Visitor {
  /**
   * Vtable slot 0x38 of the visitor. Called by
   * PCICCTransferFunctionParametric2::accept @ProCore 0x13c80 —
   *   @0x13c7d  movq (%rsi), %rcx        ; visitor's vtable
   *   @0x13c80  movq 0x38(%rcx), %rcx    ; slot at byte offset 0x38
   *   @0x13c84..@0x13c8b  tail-call visitor.vtable[+0x38](visitor, this)
   */
  visit(x: PCICCTransferFunctionParametric2): void;
}

/**
 * PCICCTransferFunctionParametric2 — ICC parametric-curve type 2 node.
 *
 * The curve is `y = pow(a*x + b, g) + c` gated by `x >= -b/a`:
 *   * for x below the gate the output is +c   (single precision),
 *   * for x at or above the gate the output is powf(a*x+b, g) + c.
 *
 * All four parameters (g, a, b, c) are stored as single-precision floats. The
 * gate `-b/a` is computed fresh at each call — the class does NOT cache it.
 */
export class PCICCTransferFunctionParametric2 {
  /** +0x08 float32 — the gamma exponent `g`. */
  public readonly g: number;
  /** +0x0c float32 — the linear-slope coefficient `a`. */
  public readonly a: number;
  /** +0x10 float32 — the linear-offset coefficient `b`. */
  public readonly b: number;
  /** +0x14 float32 — the constant tail offset `c`. */
  public readonly c: number;

  /**
   * PCICCTransferFunctionParametric2::PCICCTransferFunctionParametric2(
   *   float g, float a, float b, float c)  @ProCore 0x13bbe  (C1; C2 aliased
   *   to this same body per the mangled-symbol alias in /tmp/ProCore_symmap.tsv).
   *
   * Full disassembly:
   *   0x13bbe  pushq %rbp; movq %rsp,%rbp
   *   0x13bc2  leaq  0x13528f(%rip), %rax    ; -> vtable installed-ptr @ProCore 0x148e58
   *                                            (verified: 0x13bc9 + 0x13528f = 0x148e58)
   *   0x13bc9  movq  %rax, (%rdi)            ; this[0] = vtbl
   *   0x13bcc  movss %xmm0, 0x8(%rdi)        ; this[+0x8] = g   (single-precision)
   *   0x13bd1  movss %xmm1, 0xc(%rdi)        ; this[+0xc] = a   (single-precision)
   *   0x13bd6  movss %xmm2, 0x10(%rdi)       ; this[+0x10]= b   (single-precision)
   *   0x13bdb  movss %xmm3, 0x14(%rdi)       ; this[+0x14]= c   (single-precision)
   *   0x13be0  popq  %rbp; retq
   *
   * Each parameter enters in a distinct xmm register (SysV x86_64 ABI:
   * %xmm0=arg1, %xmm1=arg2, %xmm2=arg3, %xmm3=arg4 for successive float
   * args). We mirror the movss narrowing via `Math.fround` per PORTING_SPEC
   * Rule 4.
   */
  public constructor(g: number, a: number, b: number, c: number) {
    // @0x13bcc: movss narrows to fp32.
    this.g = Math.fround(g);
    // @0x13bd1: movss narrows to fp32.
    this.a = Math.fround(a);
    // @0x13bd6: movss narrows to fp32.
    this.b = Math.fround(b);
    // @0x13bdb: movss narrows to fp32.
    this.c = Math.fround(c);
  }

  /**
   * PCICCTransferFunctionParametric2::getExponent() const  @ProCore 0x13c46.
   *
   *   0x13c4a  movss 0x8(%rdi), %xmm0
   *   0x13c4f  popq  %rbp; retq
   *
   * Returns the stored `g` value (single-precision).
   */
  public getExponent(): number {
    return this.g;
  }

  /**
   * PCICCTransferFunctionParametric2::getA() const  @ProCore 0x13c52.
   *
   *   0x13c56  movss 0xc(%rdi), %xmm0
   *   0x13c5b  popq  %rbp; retq
   */
  public getA(): number {
    return this.a;
  }

  /**
   * PCICCTransferFunctionParametric2::getB() const  @ProCore 0x13c5e.
   *
   *   0x13c62  movss 0x10(%rdi), %xmm0
   *   0x13c67  popq  %rbp; retq
   */
  public getB(): number {
    return this.b;
  }

  /**
   * PCICCTransferFunctionParametric2::getC() const  @ProCore 0x13c6a.
   *
   *   0x13c6e  movss 0x14(%rdi), %xmm0
   *   0x13c73  popq  %rbp; retq
   */
  public getC(): number {
    return this.c;
  }

  /**
   * PCICCTransferFunctionParametric2::operator()(float x) const  @ProCore 0x13bf8.
   *
   * Full disassembly:
   *   0x13bf8  pushq %rbp; movq %rsp,%rbp
   *   0x13bfc  pushq %rbx
   *   0x13bfd  pushq %rax                     ; align stack for the powf call
   *   0x13bfe  movq  %rdi, %rbx               ; rbx = this  (survives across the call)
   *   0x13c01  movss 0xc(%rdi), %xmm1         ; xmm1 = a
   *   0x13c06  movss 0x10(%rdi), %xmm2        ; xmm2 = b
   *   0x13c0b  movaps 0xce44e(%rip), %xmm3    ; xmm3 = __xmmword @ProCore 0xe2060
   *                                            ;      = { 0x80000000, 0x80000000, 0, 0 }
   *                                            ;      = { -0.0f (fp32), -0.0f (fp32), 0, 0 }
   *   0x13c12  xorps %xmm2, %xmm3             ; xmm3.lo = -0.0f XOR b  = -b (sign flip)
   *   0x13c15  divss %xmm1, %xmm3             ; xmm3.lo = (-b) / a  = -b/a
   *   0x13c19  ucomiss %xmm3, %xmm0           ; compare x (xmm0) vs -b/a (xmm3)
   *   0x13c1c  jae 0x13c25                    ; jump if x >= -b/a (else branch)
   *   0x13c1e  movss 0x14(%rbx), %xmm0        ; else: xmm0 = c
   *   0x13c23  jmp 0x13c3f                    ; skip to epilogue
   *
   * The `jae` uses the same unordered/NaN behaviour as Parametric1
   * (see that class's operator() port for the extensive discussion): a
   * NaN in either x or the computed threshold falls through to the
   * `else` branch and returns `c`.
   *
   *   0x13c25  mulss %xmm1, %xmm0             ; xmm0 = a*x
   *   0x13c29  addss %xmm0, %xmm2             ; xmm2 = a*x + b
   *   0x13c2d  movss 0x8(%rbx), %xmm1         ; xmm1 = g   (2nd powf arg)
   *   0x13c32  movaps %xmm2, %xmm0            ; xmm0 = a*x + b  (1st powf arg)
   *   0x13c35  callq _powf                    ; xmm0 = powf(a*x+b, g)
   *   0x13c3a  addss 0x14(%rbx), %xmm0        ; xmm0 += c
   *   0x13c3f  addq $0x8, %rsp                ; unwind align+push
   *   0x13c43  popq  %rbx
   *   0x13c44  popq  %rbp
   *   0x13c45  retq
   *
   * Semantics (matches ICC 4.3 §10.15 parametricCurveType, funcType=2):
   *   y = (a*x + b)^g + c   for x >= -b/a
   *   y = c                 otherwise
   *
   * Numerical note: as in Parametric1, `-b/a` is recomputed on EVERY
   * call. When a==0 the divss produces ±inf or NaN, propagated through
   * the jae comparison; the ICC spec forbids a==0 for a well-formed
   * Parametric2 curve, so we don't special-case it — the port
   * propagates whatever behaviour the CPU produces, matching the
   * binary exactly.
   *
   * PORT: single-precision powf is NOT bit-exact-modelable via
   * `Math.pow` alone (same caveat as PCICCTransferFunctionGamma.call
   * and Parametric1.call). If G4 oracle coverage is added, this call
   * should be routed through the parity driver's `dlsym _powf` lookup
   * rather than Math.pow.
   */
  public call(x: number): number {
    // @0x13c01..0x13c06: load a, b (stored as fp32; already frounded at ctor).
    const a = this.a;
    const b = this.b;
    const c = this.c;

    // @0x13c0b..0x13c15: threshold = -b / a. All ops are single-precision.
    // `-b` is a sign-bit flip (movaps 0xce44e(%rip) + xorps). See the
    // Parametric1 port's identical comment block for the NaN / -0
    // discussion — it applies verbatim here.
    const negB = Math.fround(-b);
    const threshold = Math.fround(negB / a);

    // @0x13c19..0x13c23: if (!(x >= threshold)) return c. `x >= threshold`
    // returns false in JS for any NaN, matching x86's `jae` behaviour of
    // treating unordered as "not taken".
    const xf = Math.fround(x);
    if (!(xf >= threshold)) {
      // @0x13c1e..0x13c23: return c.
      return c;
    }

    // @0x13c25..0x13c29: xmm2 = a*x + b (all fp32).
    const linearised = Math.fround(Math.fround(a * xf) + b);

    // @0x13c2d..0x13c35: powf(a*x + b, g).
    // Rule 4: single-precision powf. Wrapped in Math.fround at input AND
    // output to keep the fp32 domain (same pattern as Parametric1.call).
    const powed = Math.fround(Math.pow(linearised, this.g));

    // @0x13c3a: addss %xmm0, [+0x14] -> result += c. Result stays fp32.
    return Math.fround(powed + c);
  }

  /**
   * PCICCTransferFunctionParametric2::accept(PCICCTransferFunctionVisitor&) const
   * @ProCore 0x13c76.
   *
   * Full disassembly:
   *   0x13c76  pushq %rbp; movq %rsp,%rbp
   *   0x13c7a  movq  %rdi, %rax           ; save this
   *   0x13c7d  movq  (%rsi), %rcx         ; visitor's vtable
   *   0x13c80  movq  0x38(%rcx), %rcx     ; slot at byte offset 0x38  (Parametric2's slot)
   *   0x13c84  movq  %rsi, %rdi           ; arg0 = visitor
   *   0x13c87  movq  %rax, %rsi           ; arg1 = this
   *   0x13c8a  popq  %rbp
   *   0x13c8b  jmpq  *%rcx                ; tail-call visitor.vtable[+0x38](visitor, this)
   *
   * Note: Parametric1 uses visitor.vtable[+0x30]; Parametric2 uses
   * visitor.vtable[+0x38] (one 8-byte slot further into the visitor's
   * vtable). This matches the C++ visitor pattern's per-subclass overload
   * emission. In our TS model we call `visitor.visit(this)` bound to the
   * Parametric2 overload interface declared above.
   */
  public accept(visitor: PCICCTransferFunctionParametric2Visitor): void {
    visitor.visit(this);
  }

  /**
   * PCICCTransferFunctionParametric2::~PCICCTransferFunctionParametric2()  D1/D2 alias
   * @ProCore 0x13be2.
   *
   *   0x13be2  pushq %rbp; movq %rsp,%rbp
   *   0x13be6  popq  %rbp
   *   0x13be7  retq
   *
   * Trivial: 6 bytes of prologue+epilogue, no field release, no base chain
   * (the abstract PCICCTransferFunction base's D2 @0x13790 is itself empty
   * per raw-port/src/infra/PCICCTransferFunction.ts — nothing to unwind).
   * D0 @0x13bee has the identical body plus a `jmp __ZdlPv` tail-call to
   * `operator delete(this)`; TS has no manual heap, so both alias to a
   * no-op (GC handles reclamation).
   */
  public destruct(): void {
    // no-op — matches the empty D1/D2 body @0x13be2.
  }
}
