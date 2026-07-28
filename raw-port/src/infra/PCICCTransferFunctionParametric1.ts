// PCICCTransferFunctionParametric1.ts — ProCore's PCICCTransferFunctionParametric1.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
// See raw-port/re/disasm/ProCore.PCICCTransferFunctionParametric1.*.s .
//
// ROLE. One concrete node in the PCICCTransferFunction visitor hierarchy: an ICC
// parametric-curve type 1 (the ICC 4.3 spec, table 65, `parametricCurveType`
// funcType == 1). The curve is a gated power law:
//     y = (a*x + b)^g   if x >= -b/a
//     y = 0             otherwise
// (Compare Parametric0 = plain gamma; Parametric2 adds a linear tail; Parametric3
//  adds a knee at a threshold; Parametric4 adds a linear pre-add. All five follow
//  the ICC "parametricCurveType" spec.)
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
//
// EXPORTED SYMBOLS (Itanium C++ ABI, ProCore x86_64 slice; VAs from `nm -arch x86_64`):
//   @0x13aec   __ZN32PCICCTransferFunctionParametric1C1Efff        ctor(float,float,float)   (C1)
//   @0x13aec   __ZN32PCICCTransferFunctionParametric1C2Efff        ctor(float,float,float)   (C2 — aliased to C1 body)
//   @0x13b12   __ZN32PCICCTransferFunctionParametric1D1Ev          ~PCICCTransferFunctionParametric1()  (D1)
//   @0x13b12   __ZN32PCICCTransferFunctionParametric1D2Ev          ~PCICCTransferFunctionParametric1()  (D2 — aliased to D1 body)
//   @0x13b18   __ZN32PCICCTransferFunctionParametric1D0Ev          ~PCICCTransferFunctionParametric1()  (D0, deleting — tail-jmps operator delete)
//   @0x13b22   __ZNK32PCICCTransferFunctionParametric1clEf         operator()(float) const
//   @0x13b5e   __ZNK32PCICCTransferFunctionParametric111getExponentEv    getExponent() const
//   @0x13b6a   __ZNK32PCICCTransferFunctionParametric14getAEv            getA() const
//   @0x13b76   __ZNK32PCICCTransferFunctionParametric14getBEv            getB() const
//   @0x13b82   __ZNK32PCICCTransferFunctionParametric16acceptER28PCICCTransferFunctionVisitor
//                                                                       accept(PCICCTransferFunctionVisitor&) const
//
// VTABLE @ProCore 0x148e18 (installed-ptr 0x148e28; verified via
//   `python3 raw-port/army/tools/vtable.py ProCore PCICCTransferFunctionParametric1`):
//     *0x00 -> 0x13b12  ~Parametric1()  [D1/D2 alias]
//     *0x08 -> 0x13b18  ~Parametric1()  [D0 deleting]
//     *0x10 -> 0x13b22  operator()(float) const
//     *0x18 -> 0x13b82  accept(PCICCTransferFunctionVisitor&) const
// (The 0x148e18 vtable is a compound table that ALSO enumerates the *0x28..
//  Parametric2, *0x58.. Parametric3, *0x88.. Parametric4 sub-vtables — a
//  standard multiple-vtable emission for the whole Parametric1..4 family that
//  share a compilation unit. Only *0x00..*0x18 are the Parametric1-specific
//  slots we install; the higher-offset entries belong to sibling classes.)
//
// STRUCT LAYOUT (recovered from ctor @0x13aec + operator() @0x13b22 + getters):
//   +0x00  vtable  : *const void   // ctor: `leaq 0x135331(%rip),%rax; movq %rax,(%rdi)` @0x13af0
//                                  //   -> vtable installed-ptr = 0x13af7 + 0x135331 = 0x148e28
//   +0x08  g       : float32       // ctor: `movss %xmm0, 0x8(%rdi)`  @0x13afa  (getExponent reads this)
//   +0x0c  a       : float32       // ctor: `movss %xmm1, 0xc(%rdi)`  @0x13aff  (getA reads this)
//   +0x10  b       : float32       // ctor: `movss %xmm2, 0x10(%rdi)` @0x13b04  (getB reads this)
//   sizeof = 0x14 bytes (last field ends at 0x14; no trailing writes beyond).
//
// RIP-relative constant used by operator() @0x13b30:
//   `movaps 0xce529(%rip), %xmm3` from next-instr 0x13b37 = target 0xe2060.
//   Read via `resolve.py ProCore const 0xe2060` (little-endian, 8 bytes shown):
//     u64 = 0x8000000080000000
//   which is a 128-bit __xmmword whose two low float32 lanes both hold 0x80000000
//   = single-precision negative-zero (-0.0f). The subsequent `xorps %xmm2,%xmm3`
//   XORs the sign bit of `b` (stored in xmm2) with the sign-bit mask, i.e.
//   computes `-b` in the low fp32 lane. This is the standard compiler idiom for
//   "negate a single-precision value" (fp32 has no `neg` instruction — the sign
//   bit is flipped via XOR against 0x80000000).
//
// The base class PCICCTransferFunction is transcribed in
//   raw-port/src/infra/PCICCTransferFunction.ts . Its D2 dtor @0x13790 is a
// 6-byte empty stub and installs no vtable — subclasses (including this one)
// each install their own directly and do NOT chain to any base body. So this
// class's D1/D2 alias is a *bare* trivial dtor: only the vtable is left as-is,
// no fields to release, no bases to unwind.

/**
 * Abstract visitor for the PCICCTransferFunction* family — Parametric1's
 * slot.  Modelled from the `accept` disassembly (see below): the visitor's
 * vtable slot 0x30 (byte offset; index 6 after the two dtor slots + Linear
 * slot @ +0x10 + Gamma slot @ +0x18 + Parametric0 slot @ +0x20 + LUT slot
 * @ +0x28) is invoked with the Parametric1 subclass instance as its single
 * argument, i.e. `visit(Parametric1 const&)`.
 *
 * Per Rule 3 (throw on undecoded, never approximate), a concrete visitor
 * implementation is *not* supplied by this port — the anonymous-namespace
 * PrintVisitor / MakeTagVisitor / DescriptionVisitor / EstimateGammaVisitor /
 * TransferValueVisitor overloads for Parametric1 (see /tmp/ProCore_symmap.tsv
 * entries __ZN12_GLOBAL__N_1{12PrintVisitor,14MakeTagVisitor,18DescriptionVisitor,
 * 20EstimateGammaVisitor,20TransferValueVisitor}5visitERK32PCICCTransferFunctionParametric1)
 * are each their own FCP class needing a separate transcription.
 *
 * NOTE: the SAME name `PCICCTransferFunctionVisitor` is used by sibling ports
 * (PCICCTransferFunctionGamma.ts declares its own `visitGamma`; Linear.ts its
 * own `visit(Linear)`). C++ concrete visitors implement ALL of these overloads
 * on ONE class — so at the TS layer these are structurally-compatible siblings
 * of the same underlying visitor. To avoid a name clash at import time, the
 * declaration here is scoped `PCICCTransferFunctionParametric1Visitor` and is
 * *not* the same TS interface as its Gamma/Linear siblings.
 */
export interface PCICCTransferFunctionParametric1Visitor {
  /**
   * Vtable slot 0x30 of the visitor. Called by
   * PCICCTransferFunctionParametric1::accept @ProCore 0x13b8c —
   *   @0x13b89  movq (%rsi), %rcx        ; visitor's vtable
   *   @0x13b8c  movq 0x30(%rcx), %rcx    ; slot at byte offset 0x30
   *   @0x13b90..@0x13b97  tail-call visitor.vtable[+0x30](visitor, this)
   */
  visit(x: PCICCTransferFunctionParametric1): void;
}

/**
 * PCICCTransferFunctionParametric1 — ICC parametric-curve type 1 node.
 *
 * The curve is `y = pow(a*x + b, g)` gated by `x >= -b/a`:
 *   * for x below the gate the output is +0.0f (single precision),
 *   * for x at or above the gate the output is the powf of the linearised x.
 *
 * All three parameters (g, a, b) are stored as single-precision floats. The
 * gate `-b/a` is computed fresh at each call — the class does NOT cache it.
 */
export class PCICCTransferFunctionParametric1 {
  /** +0x08 float32 — the gamma exponent `g`. */
  public readonly g: number;
  /** +0x0c float32 — the linear-slope coefficient `a`. */
  public readonly a: number;
  /** +0x10 float32 — the linear-offset coefficient `b`. */
  public readonly b: number;

  /**
   * PCICCTransferFunctionParametric1::PCICCTransferFunctionParametric1(float g, float a, float b)
   * @ProCore 0x13aec  (C1; C2 shares this body per the mangled-symbol alias in
   *                    /tmp/ProCore_symmap.tsv — both `C1Efff` and `C2Efff` map
   *                    to the SAME address 0x13aec).
   *
   * Full disassembly:
   *   0x13aec  pushq %rbp; movq %rsp,%rbp
   *   0x13af0  leaq  0x135331(%rip), %rax    ; -> vtable installed-ptr @ProCore 0x148e28
   *                                            (verified: 0x13af7 + 0x135331 = 0x148e28)
   *   0x13af7  movq  %rax, (%rdi)            ; this[0] = vtbl
   *   0x13afa  movss %xmm0, 0x8(%rdi)        ; this[+0x8] = g   (single-precision)
   *   0x13aff  movss %xmm1, 0xc(%rdi)        ; this[+0xc] = a   (single-precision)
   *   0x13b04  movss %xmm2, 0x10(%rdi)       ; this[+0x10]= b   (single-precision)
   *   0x13b09  popq  %rbp; retq
   *
   * Each parameter enters the function in a distinct xmm register (Itanium x86_64
   * SysV ABI: %xmm0=arg1, %xmm1=arg2, %xmm2=arg3 for successive float args). We
   * mirror the movss narrowing via `Math.fround` per PORTING_SPEC Rule 4.
   */
  public constructor(g: number, a: number, b: number) {
    // @0x13afa: movss narrows to fp32.
    this.g = Math.fround(g);
    // @0x13aff: movss narrows to fp32.
    this.a = Math.fround(a);
    // @0x13b04: movss narrows to fp32.
    this.b = Math.fround(b);
  }

  /**
   * PCICCTransferFunctionParametric1::getExponent() const  @ProCore 0x13b5e.
   *
   *   0x13b62  movss 0x8(%rdi), %xmm0
   *   0x13b67  popq  %rbp; retq
   *
   * Returns the stored `g` value (single-precision).
   */
  public getExponent(): number {
    return this.g;
  }

  /**
   * PCICCTransferFunctionParametric1::getA() const  @ProCore 0x13b6a.
   *
   *   0x13b6e  movss 0xc(%rdi), %xmm0
   *   0x13b73  popq  %rbp; retq
   */
  public getA(): number {
    return this.a;
  }

  /**
   * PCICCTransferFunctionParametric1::getB() const  @ProCore 0x13b76.
   *
   *   0x13b7a  movss 0x10(%rdi), %xmm0
   *   0x13b7f  popq  %rbp; retq
   */
  public getB(): number {
    return this.b;
  }

  /**
   * PCICCTransferFunctionParametric1::operator()(float x) const  @ProCore 0x13b22.
   *
   * Full disassembly:
   *   0x13b22  pushq %rbp; movq %rsp,%rbp
   *   0x13b26  movss 0xc(%rdi), %xmm1          ; xmm1 = a
   *   0x13b2b  movss 0x10(%rdi), %xmm2         ; xmm2 = b
   *   0x13b30  movaps 0xce529(%rip), %xmm3     ; xmm3 = __xmmword @ProCore 0xe2060
   *                                            ;      = { 0x80000000, 0x80000000, 0, 0 }
   *                                            ;      = { -0.0f (fp32), -0.0f (fp32), 0, 0 }
   *   0x13b37  xorps %xmm2, %xmm3              ; xmm3.lo = -0.0f XOR b  = -b (sign flip)
   *   0x13b3a  divss %xmm1, %xmm3              ; xmm3.lo = (-b) / a  = -b/a
   *   0x13b3e  ucomiss %xmm3, %xmm0            ; compare x (xmm0) vs -b/a (xmm3)
   *   0x13b41  jae 0x13b48                     ; jump if x >= -b/a (unordered? -> fall through)
   *   0x13b43  xorps %xmm0, %xmm0              ; else: xmm0 = 0.0f
   *   0x13b46  popq  %rbp
   *   0x13b47  retq                            ; return 0.0f
   *
   * The `jae` (jump-if-above-or-equal) branch is entered on the "unsigned"
   * flag combination CF=0 (i.e. x >= threshold *including equality*, and NOT
   * unordered). NaN inputs on either side make ucomiss set PF=1,CF=1,ZF=1 —
   * `jae` treats CF=1 as "not taken", so any NaN input flows to the `else`
   * branch and returns +0.0f. We mirror that below with an explicit NaN check
   * (JS's `<`/`>=` compare a NaN as *false*, matching x86 ucomiss for the
   * "jae" branch: any NaN -> fall through to xorps).
   *
   *   0x13b48  mulss %xmm1, %xmm0              ; xmm0 = a*x
   *   0x13b4c  addss %xmm0, %xmm2              ; xmm2 = a*x + b
   *   0x13b50  movss 0x8(%rdi), %xmm1          ; xmm1 = g   (2nd powf arg)
   *   0x13b55  movaps %xmm2, %xmm0             ; xmm0 = a*x + b  (1st powf arg)
   *   0x13b58  popq  %rbp
   *   0x13b59  jmp   _powf                     ; tail-call powf(a*x+b, g)
   *
   * Semantics (matches ICC 4.3 §10.15 parametricCurveType, funcType=1):
   *   y = (a*x + b)^g   for x >= -b/a
   *   y = 0             otherwise
   *
   * Numerical note: the threshold `-b/a` is recomputed on EVERY call. When
   * a==0 the divss produces ±inf or NaN, which then propagates through the
   * jae comparison; the ICC spec forbids a==0 for a well-formed Parametric1
   * curve, so we don't special-case it — the port propagates whatever
   * behaviour the CPU produces, matching the binary exactly.
   *
   * PORT: single-precision powf is NOT bit-exact-modelable via `Math.pow`
   * alone (same caveat as PCICCTransferFunctionGamma.call). If G4 oracle
   * coverage is added, this call should be routed through the parity
   * driver's `dlsym _powf` lookup rather than Math.pow.
   */
  public call(x: number): number {
    // @0x13b26..0x13b2b: load a, b (stored as fp32; already frounded at ctor).
    const a = this.a;
    const b = this.b;

    // @0x13b30..0x13b3a: threshold = -b / a. All ops are single-precision.
    // `-b` is a sign-bit flip (movaps 0xce529(%rip) + xorps). In fp32,
    // Math.fround(-b) is the exact same value as `-b` narrowed to fp32,
    // which is equivalent to the xorps-with-sign-mask idiom for finite b.
    // For b == 0.0f the xorps yields -0.0f; JS's unary `-` on +0 also
    // yields -0 (per ECMA-262 §12.5.7). For b == NaN the xorps toggles
    // the sign bit of a NaN — a NaN with a flipped sign is still NaN;
    // divss(NaN,a) = NaN; ucomiss(x,NaN) is unordered -> jae not taken;
    // so NaN threshold falls through to the `else` and returns 0. JS
    // preserves this because `Math.fround(NaN/a)` is NaN, and any `<`
    // against NaN is false, so the `x >= threshold` check is false and
    // we correctly return 0.
    const negB = Math.fround(-b);
    const threshold = Math.fround(negB / a);

    // @0x13b3e..0x13b47: if (!(x >= threshold)) return 0.0f. Using the
    // JS `<` operator with NOT would mis-handle NaN; instead we use the
    // exact opposite of `jae`: `x >= threshold` is TAKEN when both are
    // ordered and x is not less than threshold. In JS, `x >= threshold`
    // returns false on any NaN, matching x86's `jae` behaviour of
    // treating unordered as "not taken".
    //
    // The comparison is on fp32 lanes; we fround x once to preserve the
    // asm's single-precision domain.
    const xf = Math.fround(x);
    if (!(xf >= threshold)) {
      // @0x13b43..0x13b47: return +0.0f.
      return Math.fround(0);
    }

    // @0x13b48..0x13b4c: xmm2 = a*x + b (all fp32).
    const linearised = Math.fround(Math.fround(a * xf) + b);

    // @0x13b50..0x13b59: tail-call powf(a*x + b, g).
    // Rule 4: single-precision powf. We wrap Math.pow with Math.fround at
    // input AND output to keep the fp32 domain; see PCICCTransferFunctionGamma
    // for the identical pattern and its known oracle caveat.
    return Math.fround(Math.pow(linearised, this.g));
  }

  /**
   * PCICCTransferFunctionParametric1::accept(PCICCTransferFunctionVisitor&) const
   * @ProCore 0x13b82.
   *
   * Full disassembly:
   *   0x13b82  pushq %rbp; movq %rsp,%rbp
   *   0x13b86  movq  %rdi, %rax           ; save this
   *   0x13b89  movq  (%rsi), %rcx         ; visitor's vtable
   *   0x13b8c  movq  0x30(%rcx), %rcx     ; slot at byte offset 0x30
   *   0x13b90  movq  %rsi, %rdi           ; arg0 = visitor
   *   0x13b93  movq  %rax, %rsi           ; arg1 = this
   *   0x13b96  popq  %rbp
   *   0x13b97  jmpq  *%rcx                ; tail-call visitor.vtable[+0x30](visitor, this)
   *
   * In our object model, we call `visitor.visit(this)` — the visitor
   * interface here binds specifically to the Parametric1 overload (its own
   * `visit(x: PCICCTransferFunctionParametric1)` method).
   */
  public accept(visitor: PCICCTransferFunctionParametric1Visitor): void {
    visitor.visit(this);
  }

  /**
   * PCICCTransferFunctionParametric1::~PCICCTransferFunctionParametric1()  D1/D2 alias
   * @ProCore 0x13b12.
   *
   *   0x13b12  pushq %rbp; movq %rsp,%rbp
   *   0x13b16  popq  %rbp
   *   0x13b17  retq
   *
   * Trivial: 6 bytes of prologue+epilogue, no field release, no base chain
   * (the abstract PCICCTransferFunction base's D2 @0x13790 is itself empty
   * per raw-port/src/infra/PCICCTransferFunction.ts — nothing to unwind).
   * D0 @0x13b18 has the identical body plus a `jmp __ZdlPv` tail-call to
   * `operator delete(this)`; TS has no manual heap, so both alias to a no-op
   * (GC handles reclamation).
   */
  public destruct(): void {
    // no-op — matches the empty D1/D2 body @0x13b12.
  }
}

