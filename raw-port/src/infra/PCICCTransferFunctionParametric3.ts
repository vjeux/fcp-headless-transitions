// PCICCTransferFunctionParametric3.ts — ProCore's PCICCTransferFunctionParametric3.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
// See raw-port/re/disasm/ProCore.PCICCTransferFunctionParametric3.*.s .
//
// ROLE. Concrete node in the PCICCTransferFunction visitor hierarchy: an
// ICC parametric-curve type 3 (the ICC 4.3 spec, table 65,
// `parametricCurveType` funcType == 3). The curve is a gated power law
// with an EXPLICITLY-stored knee threshold `d` and a linear segment below:
//     y = (a*x + b)^g   if x >= d
//     y = c * x         otherwise
// Compare Parametric1/2 which compute the knee as `-b/a`; Parametric3
// carries `d` as its own float field and does NOT recompute it.
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
//
// EXPORTED SYMBOLS (Itanium C++ ABI, ProCore x86_64 slice; VAs from
// `nm -arch x86_64` and cross-checked against `xcrun otool -tV`):
//   @0x13c8e   __ZN32PCICCTransferFunctionParametric3C2Efffff  ctor(f,f,f,f,f)  (C2)
//   @0x13cb8   __ZN32PCICCTransferFunctionParametric3C1Efffff  ctor(f,f,f,f,f)  (C1)
//   @0x13ce2   __ZN32PCICCTransferFunctionParametric3D2Ev      ~Parametric3     (D2)
//   @0x13ce8   __ZN32PCICCTransferFunctionParametric3D1Ev      ~Parametric3     (D1)
//   @0x13cee   __ZN32PCICCTransferFunctionParametric3D0Ev      ~Parametric3     (D0 deleting)
//   @0x13cf8   __ZNK32PCICCTransferFunctionParametric3clEf     operator()(float) const
//   @0x13d1e   __ZNK32PCICCTransferFunctionParametric311getExponentEv    getExponent() const
//   @0x13d2a   __ZNK32PCICCTransferFunctionParametric34getAEv            getA() const
//   @0x13d36   __ZNK32PCICCTransferFunctionParametric34getBEv            getB() const
//   @0x13d42   __ZNK32PCICCTransferFunctionParametric34getCEv            getC() const
//   @0x13d4e   __ZNK32PCICCTransferFunctionParametric34getDEv            getD() const
//   @0x13d5a   __ZNK32PCICCTransferFunctionParametric36acceptER28PCICCTransferFunctionVisitor
//                                                                       accept(PCICCTransferFunctionVisitor&) const
//
// C1 and C2 are two distinct bodies at 0x13cb8 / 0x13c8e that BOTH install
// the same vtable ptr and store the same fields; they differ only in the
// `leaq` RIP-relative displacement to that shared vtable (0x1351c5 from
// 0x13cc3 -> 0x148e88; 0x1351ef from 0x13c99 -> 0x148e88 — same target).
// This is the standard Itanium C++ ABI complete-vs-base-ctor emission.
//
// VTABLE (installed-ptr = 0x148e88 — verified via
//   `python3 raw-port/army/tools/resolve.py ProCore sym 0x148e88`
//   -> "vtable for PCICCTransferFunctionParametric3 (+0x10)"):
//   C1 @0x13cbc  `leaq 0x1351c5(%rip),%rax` -> next-instr 0x13cc3 + 0x1351c5 = 0x148e88.
//   C2 @0x13c92  `leaq 0x1351ef(%rip),%rax` -> next-instr 0x13c99 + 0x1351ef = 0x148e88.
//   Slots recovered from the ctor + method addresses:
//     *0x00 -> 0x13ce8  ~Parametric3()  [D1/D2]
//     *0x08 -> 0x13cee  ~Parametric3()  [D0 deleting]
//     *0x10 -> 0x13cf8  operator()(float) const
//     *0x18 -> 0x13d5a  accept(PCICCTransferFunctionVisitor&) const
//
// STRUCT LAYOUT (recovered from ctor @0x13cb8 + operator() @0x13cf8 + getters):
//   +0x00  vtable  : *const void   // ctor: `leaq 0x1351c5(%rip),%rax; movq %rax,(%rdi)` @0x13cbc/0x13cc3
//                                  //   -> vtable installed-ptr = 0x148e88
//   +0x08  g       : float32       // ctor: `movss %xmm0, 0x8(%rdi)`  @0x13cc6  (getExponent reads this)
//   +0x0c  a       : float32       // ctor: `movss %xmm1, 0xc(%rdi)`  @0x13ccb  (getA reads this)
//   +0x10  b       : float32       // ctor: `movss %xmm2, 0x10(%rdi)` @0x13cd0  (getB reads this)
//   +0x14  c       : float32       // ctor: `movss %xmm3, 0x14(%rdi)` @0x13cd5  (getC reads this)
//   +0x18  d       : float32       // ctor: `movss %xmm4, 0x18(%rdi)` @0x13cda  (getD reads this)
//   sizeof = 0x1c bytes (last field ends at 0x1c; no trailing writes beyond).
//
// NO RIP-relative constants are used by operator() @0x13cf8: unlike
// Parametric1/2 (which XOR `b` with the shared `-0.0f` __xmmword at
// ProCore 0xe2060 to synthesise the knee threshold), Parametric3 reads
// its knee directly from field `d` (+0x18). This is the entire point of
// funcType=3: an author-supplied knee.
//
// The base class PCICCTransferFunction is transcribed in
//   raw-port/src/infra/PCICCTransferFunction.ts . Its D2 dtor @0x13790 is a
// 6-byte empty stub and installs no vtable — subclasses (including this one)
// each install their own directly and do NOT chain to any base body. So this
// class's D1/D2 alias is a bare trivial dtor: only the vtable is left as-is,
// no fields to release, no bases to unwind.

/**
 * Abstract visitor for the PCICCTransferFunction* family — Parametric3's slot.
 * Modelled from the `accept` disassembly (see below): the visitor's vtable
 * slot at byte offset 0x40 is invoked with the Parametric3 subclass instance
 * as its single argument, i.e. `visit(Parametric3 const&)`.
 *
 * Consistent with Parametric1/Parametric2 ports: the declaration is scoped
 * to `PCICCTransferFunctionParametric3Visitor` and is NOT the same TS
 * interface as its Parametric1/2/Gamma/Linear siblings. Slot progression
 * across siblings (recovered from each class's `accept`): Parametric1 uses
 * *0x30, Parametric2 uses *0x38, Parametric3 uses *0x40 — one 8-byte slot
 * further into the visitor's vtable each time.
 */
export interface PCICCTransferFunctionParametric3Visitor {
  /**
   * Vtable slot 0x40 of the visitor. Called by
   * PCICCTransferFunctionParametric3::accept @ProCore 0x13d64 —
   *   @0x13d61  movq (%rsi), %rcx        ; visitor's vtable
   *   @0x13d64  movq 0x40(%rcx), %rcx    ; slot at byte offset 0x40
   *   @0x13d68..@0x13d6f  tail-call visitor.vtable[+0x40](visitor, this)
   */
  visit(x: PCICCTransferFunctionParametric3): void;
}

/**
 * PCICCTransferFunctionParametric3 — ICC parametric-curve type 3 node.
 *
 * The curve is:
 *   y = (a*x + b)^g   for x >= d
 *   y = c * x         otherwise
 *
 * All five parameters (g, a, b, c, d) are stored as single-precision floats
 * exactly as the caller passes them in. The knee `d` is author-supplied and
 * NOT recomputed at each call (contrast Parametric1/2, which synthesise the
 * knee at each call by XOR-and-divide of `b`/`a`).
 */
export class PCICCTransferFunctionParametric3 {
  /** +0x08 float32 — the gamma exponent `g`. */
  public readonly g: number;
  /** +0x0c float32 — the linear-slope coefficient `a`. */
  public readonly a: number;
  /** +0x10 float32 — the linear-offset coefficient `b`. */
  public readonly b: number;
  /** +0x14 float32 — the below-knee linear slope `c`. */
  public readonly c: number;
  /** +0x18 float32 — the knee threshold `d`. */
  public readonly d: number;

  /**
   * PCICCTransferFunctionParametric3::PCICCTransferFunctionParametric3(
   *   float g, float a, float b, float c, float d)
   *   @ProCore 0x13cb8 (C1) / 0x13c8e (C2) — two bodies aliased at the C++
   *   ABI level; both install vtable @0x148e88 and store the same five
   *   fp32 fields at +0x08..+0x18.
   *
   * Full disassembly (C1 @0x13cb8):
   *   0x13cb8  pushq %rbp; movq %rsp,%rbp
   *   0x13cbc  leaq  0x1351c5(%rip), %rax    ; -> vtable installed-ptr @ProCore 0x148e88
   *                                            (verified: 0x13cc3 + 0x1351c5 = 0x148e88)
   *   0x13cc3  movq  %rax, (%rdi)            ; this[0] = vtbl
   *   0x13cc6  movss %xmm0, 0x8(%rdi)        ; this[+0x08] = g   (single-precision)
   *   0x13ccb  movss %xmm1, 0xc(%rdi)        ; this[+0x0c] = a
   *   0x13cd0  movss %xmm2, 0x10(%rdi)       ; this[+0x10] = b
   *   0x13cd5  movss %xmm3, 0x14(%rdi)       ; this[+0x14] = c
   *   0x13cda  movss %xmm4, 0x18(%rdi)       ; this[+0x18] = d
   *   0x13cdf  popq  %rbp; retq
   *
   * Each parameter enters in a distinct xmm register (SysV x86_64 ABI:
   * %xmm0..%xmm4 for the first five float args). We mirror each movss
   * narrowing via `Math.fround` per PORTING_SPEC Rule 4.
   */
  public constructor(g: number, a: number, b: number, c: number, d: number) {
    // @0x13cc6: movss narrows to fp32.
    this.g = Math.fround(g);
    // @0x13ccb: movss narrows to fp32.
    this.a = Math.fround(a);
    // @0x13cd0: movss narrows to fp32.
    this.b = Math.fround(b);
    // @0x13cd5: movss narrows to fp32.
    this.c = Math.fround(c);
    // @0x13cda: movss narrows to fp32.
    this.d = Math.fround(d);
  }

  /**
   * PCICCTransferFunctionParametric3::getExponent() const  @ProCore 0x13d1e.
   *
   *   0x13d22  movss 0x8(%rdi), %xmm0
   *   0x13d27  popq  %rbp; retq
   *
   * Returns the stored `g` value (single-precision).
   */
  public getExponent(): number {
    return this.g;
  }

  /**
   * PCICCTransferFunctionParametric3::getA() const  @ProCore 0x13d2a.
   *
   *   0x13d2e  movss 0xc(%rdi), %xmm0
   *   0x13d33  popq  %rbp; retq
   */
  public getA(): number {
    return this.a;
  }

  /**
   * PCICCTransferFunctionParametric3::getB() const  @ProCore 0x13d36.
   *
   *   0x13d3a  movss 0x10(%rdi), %xmm0
   *   0x13d3f  popq  %rbp; retq
   */
  public getB(): number {
    return this.b;
  }

  /**
   * PCICCTransferFunctionParametric3::getC() const  @ProCore 0x13d42.
   *
   *   0x13d46  movss 0x14(%rdi), %xmm0
   *   0x13d4b  popq  %rbp; retq
   */
  public getC(): number {
    return this.c;
  }

  /**
   * PCICCTransferFunctionParametric3::getD() const  @ProCore 0x13d4e.
   *
   *   0x13d52  movss 0x18(%rdi), %xmm0
   *   0x13d57  popq  %rbp; retq
   */
  public getD(): number {
    return this.d;
  }

  /**
   * PCICCTransferFunctionParametric3::operator()(float x) const  @ProCore 0x13cf8.
   *
   * Full disassembly:
   *   0x13cf8  pushq %rbp; movq %rsp,%rbp
   *   0x13cfc  ucomiss 0x18(%rdi), %xmm0     ; compare x (xmm0) against d (+0x18)
   *   0x13d00  jae 0x13d09                    ; if x >= d, take the pow branch
   *   0x13d02  mulss 0x14(%rdi), %xmm0        ; fall-through (x < d): xmm0 = x * c
   *   0x13d07  popq  %rbp
   *   0x13d08  retq                           ; return c * x
   *   0x13d09  mulss 0xc(%rdi), %xmm0         ; xmm0 = x * a
   *   0x13d0e  addss 0x10(%rdi), %xmm0        ; xmm0 = a*x + b
   *   0x13d13  movss 0x8(%rdi), %xmm1         ; xmm1 = g   (powf's 2nd arg)
   *   0x13d18  popq  %rbp
   *   0x13d19  jmp   _powf (symbol stub @ProCore 0xdea50)   ; tail-call powf(a*x+b, g)
   *
   * The `jae` uses the same unordered/NaN behaviour as Parametric1/2 (see
   * those classes' operator() ports for the extensive discussion): a NaN
   * in either x or d falls through to the linear branch and returns c*x.
   * The linear branch is the fall-through here — Parametric3 orders the
   * two branches inversely to Parametric1/2 (where the linear branch is
   * the jae-taken target). The observable semantics are identical.
   *
   * Note the tail-call form: `popq %rbp; jmp _powf` — this is a genuine
   * tail-call, so powf's return value in %xmm0 becomes the caller's
   * return value directly, with no epilogue after it. The caller's
   * frame pointer has already been restored by the popq.
   *
   * Semantics (matches ICC 4.3 §10.15 parametricCurveType, funcType=3):
   *   y = (a*x + b)^g   for x >= d
   *   y = c * x         otherwise
   *
   * PORT: single-precision powf is NOT bit-exact-modelable via Math.pow
   * alone (same caveat as Parametric1/2 and PCICCTransferFunctionGamma).
   * If G4 oracle coverage is added, this call should be routed through
   * the parity driver's `dlsym _powf` lookup rather than Math.pow.
   */
  public call(x: number): number {
    // @0x13cfc: ucomiss narrows x to fp32 for the comparison; mirror that.
    const xf = Math.fround(x);
    // Fields are already frounded at ctor.
    const d = this.d;

    // @0x13d00: `jae` — taken when x >= d, unordered (NaN) falls through
    // to the linear branch. `!(xf >= d)` returns true for any NaN,
    // matching the fall-through behaviour.
    if (!(xf >= d)) {
      // @0x13d02..0x13d08: return c * x (single-precision).
      return Math.fround(this.c * xf);
    }

    // @0x13d09..0x13d0e: xmm0 = a*x + b (all fp32).
    const linearised = Math.fround(Math.fround(this.a * xf) + this.b);

    // @0x13d13..0x13d19: powf(a*x + b, g). Tail-jmp _powf.
    // Rule 4: single-precision powf. Wrapped in Math.fround at output
    // to keep the fp32 domain (input `linearised` and `this.g` are
    // already fp32).
    return Math.fround(Math.pow(linearised, this.g));
  }

  /**
   * PCICCTransferFunctionParametric3::accept(PCICCTransferFunctionVisitor&) const
   * @ProCore 0x13d5a.
   *
   * Full disassembly:
   *   0x13d5a  pushq %rbp; movq %rsp,%rbp
   *   0x13d5e  movq  %rdi, %rax           ; save this
   *   0x13d61  movq  (%rsi), %rcx         ; visitor's vtable
   *   0x13d64  movq  0x40(%rcx), %rcx     ; slot at byte offset 0x40  (Parametric3's slot)
   *   0x13d68  movq  %rsi, %rdi           ; arg0 = visitor
   *   0x13d6b  movq  %rax, %rsi           ; arg1 = this
   *   0x13d6e  popq  %rbp
   *   0x13d6f  jmpq  *%rcx                ; tail-call visitor.vtable[+0x40](visitor, this)
   *
   * Slot progression across the Parametric* siblings — recovered directly
   * from each class's `accept` body — is Parametric1: *0x30, Parametric2:
   * *0x38, Parametric3: *0x40 (this class). One 8-byte slot per subclass
   * further into the visitor's vtable, i.e. `visit(Parametric3 const&)`
   * is the third overload in emission order.
   */
  public accept(visitor: PCICCTransferFunctionParametric3Visitor): void {
    visitor.visit(this);
  }

  /**
   * PCICCTransferFunctionParametric3::~PCICCTransferFunctionParametric3()  D1/D2
   * @ProCore 0x13ce8 (D1) / 0x13ce2 (D2) — both are 6-byte empty bodies:
   *
   *   D2 @0x13ce2  pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   *   D1 @0x13ce8  pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   *
   * Trivial: no field release, no base chain (the abstract
   * PCICCTransferFunction base's D2 @0x13790 is itself empty per
   * raw-port/src/infra/PCICCTransferFunction.ts — nothing to unwind).
   *
   * D0 @0x13cee is the deleting-destructor variant with the identical
   *   empty body plus a `jmp __ZdlPv` (symbol stub @ProCore 0xde6c0) —
   *   i.e. a tail-call to `operator delete(this)`. TS has no manual heap,
   *   so both alias to a no-op (GC handles reclamation).
   */
  public destruct(): void {
    // no-op — matches the empty D1/D2 body @0x13ce8/@0x13ce2.
  }
}
