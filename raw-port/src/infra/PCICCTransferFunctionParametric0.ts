// PCICCTransferFunctionParametric0.ts — ProCore's PCICCTransferFunctionParametric0.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
// See raw-port/re/disasm/ProCore.PCICCTransferFunctionParametric0.*.s .
//
// ROLE. One concrete node in the PCICCTransferFunction visitor hierarchy: an ICC
// parametric-curve type 0 (the ICC 4.3 spec, table 65, `parametricCurveType`
// funcType == 0). The curve is the plain gamma:
//     y = x^g
// (Compare Parametric1 adds a linear pre-multiply/offset with a gate; Parametric2
//  adds a linear tail; Parametric3 adds a knee at a threshold; Parametric4 adds a
//  linear pre-add. All five follow the ICC "parametricCurveType" spec.)
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
//
// EXPORTED SYMBOLS (Itanium C++ ABI, ProCore x86_64 slice; VAs from `nm -arch x86_64`):
//   @0x13a6c   __ZN32PCICCTransferFunctionParametric0C1Ef    ctor(float)                         (C1)
//   @0x13a56   __ZN32PCICCTransferFunctionParametric0C2Ef    ctor(float)                         (C2 — SEPARATE address; body byte-identical: same vtable installed-ptr, same field write)
//   @0x13a88   __ZN32PCICCTransferFunctionParametric0D1Ev    ~PCICCTransferFunctionParametric0() (D1)
//   @0x13a82   __ZN32PCICCTransferFunctionParametric0D2Ev    ~PCICCTransferFunctionParametric0() (D2 — SEPARATE trivial body)
//   @0x13a8e   __ZN32PCICCTransferFunctionParametric0D0Ev    ~PCICCTransferFunctionParametric0() (D0, deleting — tail-jmps operator delete)
//   @0x13a98   __ZNK32PCICCTransferFunctionParametric0clEf   operator()(float) const
//   @0x13aa8   __ZNK32PCICCTransferFunctionParametric08getGammaEv    getGamma() const
//   @0x13ab4   __ZNK32PCICCTransferFunctionParametric06acceptER28PCICCTransferFunctionVisitor
//                                                                    accept(PCICCTransferFunctionVisitor&) const
//
// VTABLE @ProCore 0x148de8 (installed-ptr 0x148df8; verified via
//   `python3 raw-port/army/tools/vtable.py ProCore PCICCTransferFunctionParametric0`):
//     *0x00 -> 0x13a88  ~Parametric0()   [D1]
//     *0x08 -> 0x13a8e  ~Parametric0()   [D0 deleting]
//     *0x10 -> 0x13a98  operator()(float) const
//     *0x18 -> 0x13ab4  accept(PCICCTransferFunctionVisitor&) const
// (The 0x148de8 vtable is a compound table that ALSO enumerates the *0x28..
//  Parametric1, *0x58.. Parametric2, *0x88.. Parametric3, *0xb8.. Parametric4 sub-
//  vtables — a standard multiple-vtable emission for the whole Parametric0..4
//  family that share a compilation unit. Only *0x00..*0x18 are the Parametric0-
//  specific slots we install; higher-offset entries belong to sibling classes.)
//
// STRUCT LAYOUT (recovered from ctor @0x13a6c + operator() @0x13a98 + getGamma):
//   +0x00  vtable  : *const void   // C1 ctor: `leaq 0x135381(%rip),%rax; movq %rax,(%rdi)` @0x13a70
//                                  //   -> vtable installed-ptr = 0x13a77 + 0x135381 = 0x148df8
//                                  // C2 ctor: `leaq 0x135397(%rip),%rax` @0x13a5a; next-instr
//                                  //   0x13a61 + 0x135397 = 0x148df8 (SAME vtable ptr).
//   +0x08  g       : float32       // ctor: `movss %xmm0, 0x8(%rdi)` @0x13a7a (C1) / @0x13a64 (C2)
//                                  //   (getGamma reads this)
//   sizeof = 0xc bytes (last field ends at 0xc; no trailing writes beyond).
//
// The base class PCICCTransferFunction is transcribed in
//   raw-port/src/infra/PCICCTransferFunction.ts . Its D2 dtor is a 6-byte empty
// stub and installs no vtable — subclasses (including this one) each install
// their own directly and do NOT chain to any base body. So this class's D1/D2
// destructors are *bare* trivial dtors: only the vtable is left as-is, no fields
// to release, no bases to unwind.

/**
 * Abstract visitor for the PCICCTransferFunction* family — Parametric0's slot.
 * Modelled from the `accept` disassembly (see below): the visitor's vtable slot
 * 0x28 (byte offset; index 5 counting from 0) is invoked with the Parametric0
 * subclass instance as its single argument, i.e. `visit(Parametric0 const&)`.
 *
 * Per Rule 3 (throw on undecoded, never approximate), a concrete visitor
 * implementation is *not* supplied by this port — the anonymous-namespace
 * PrintVisitor / MakeTagVisitor / DescriptionVisitor / EstimateGammaVisitor /
 * TransferValueVisitor overloads for Parametric0 (see /tmp/ProCore_symmap.tsv
 * entries __ZN12_GLOBAL__N_1{12PrintVisitor,14MakeTagVisitor,18DescriptionVisitor,
 * 20EstimateGammaVisitor,20TransferValueVisitor}5visitERK32PCICCTransferFunctionParametric0)
 * are each their own FCP class needing a separate transcription.
 *
 * NOTE: the SAME name `PCICCTransferFunctionVisitor` is used by sibling ports
 * (PCICCTransferFunctionGamma.ts declares its own `visitGamma`; Parametric1.ts
 * its own `visit(Parametric1)`). C++ concrete visitors implement ALL of these
 * overloads on ONE class — so at the TS layer these are structurally-compatible
 * siblings of the same underlying visitor. To avoid a name clash at import time,
 * the declaration here is scoped `PCICCTransferFunctionParametric0Visitor` and
 * is *not* the same TS interface as its Gamma/Linear/Parametric1 siblings.
 */
export interface PCICCTransferFunctionParametric0Visitor {
  /**
   * Vtable slot 0x28 of the visitor. Called by
   * PCICCTransferFunctionParametric0::accept @ProCore 0x13abb —
   *   @0x13abb  movq (%rsi), %rcx        ; visitor's vtable
   *   @0x13abe  movq 0x28(%rcx), %rcx    ; slot at byte offset 0x28
   *   @0x13ac2..@0x13ac9  tail-call visitor.vtable[+0x28](visitor, this)
   */
  visit(x: PCICCTransferFunctionParametric0): void;
}

/**
 * PCICCTransferFunctionParametric0 — ICC parametric-curve type 0 node.
 *
 * The curve is `y = powf(x, g)`. Only one parameter (g, single precision).
 * This is the "plain gamma" branch of ICC's parametricCurveType.
 */
export class PCICCTransferFunctionParametric0 {
  /** +0x08 float32 — the gamma exponent `g`. */
  public readonly g: number;

  /**
   * PCICCTransferFunctionParametric0::PCICCTransferFunctionParametric0(float g)
   * @ProCore 0x13a6c  (C1). A separately-emitted C2 body exists at 0x13a56
   * with byte-identical semantics (same vtable installed-ptr = 0x148df8, same
   * `movss %xmm0, 0x8(%rdi)`). Both are the SAME constructor at the ABI level
   * — Itanium C++ ABI C1 (complete-object) and C2 (base-object) constructors —
   * the compiler chose not to fold them (typical when D0 might chain through
   * ~Parametric0 which could differ subtly, though here D1/D2 are also trivial
   * so the emission is genuinely redundant).
   *
   * Full disassembly (C1 @0x13a6c):
   *   0x13a6c  pushq %rbp; movq %rsp,%rbp
   *   0x13a70  leaq  0x135381(%rip), %rax    ; -> vtable installed-ptr @ProCore 0x148df8
   *                                            (verified: 0x13a77 + 0x135381 = 0x148df8)
   *   0x13a77  movq  %rax, (%rdi)            ; this[0] = vtbl
   *   0x13a7a  movss %xmm0, 0x8(%rdi)        ; this[+0x8] = g   (single-precision)
   *   0x13a7f  popq  %rbp; retq
   *
   * The gamma enters in %xmm0 (Itanium x86_64 SysV ABI: %xmm0=arg1 for the
   * first float arg). We mirror the movss narrowing via `Math.fround` per
   * PORTING_SPEC Rule 4.
   */
  public constructor(g: number) {
    // @0x13a7a: movss narrows to fp32.
    this.g = Math.fround(g);
  }

  /**
   * PCICCTransferFunctionParametric0::getGamma() const  @ProCore 0x13aa8.
   *
   *   0x13aac  movss 0x8(%rdi), %xmm0
   *   0x13ab1  popq  %rbp; retq
   *
   * Returns the stored `g` value (single-precision).
   */
  public getGamma(): number {
    return this.g;
  }

  /**
   * PCICCTransferFunctionParametric0::operator()(float x) const  @ProCore 0x13a98.
   *
   * Full disassembly:
   *   0x13a98  pushq %rbp; movq %rsp,%rbp
   *   0x13a9c  movss 0x8(%rdi), %xmm1          ; xmm1 = g   (2nd powf arg)
   *   0x13aa1  popq  %rbp
   *   0x13aa2  jmp   _powf                     ; tail-call powf(x, g)
   *                                            ;   x is already in xmm0 (arg1 of operator()
   *                                            ;   in the SysV fp calling convention — the
   *                                            ;   float parameter enters and stays in %xmm0,
   *                                            ;   so no register move is needed before
   *                                            ;   handing off to powf.)
   *
   * Semantics (matches ICC 4.3 §10.15 parametricCurveType, funcType=0):
   *   y = x^g
   *
   * No domain gating: `x < 0` propagates powf's usual NaN behaviour (for
   * non-integer g); `x == 0` yields 0^g (0 for g>0, +inf for g<0, 1 for g==0);
   * `x` NaN yields NaN. We port that verbatim without special-casing.
   *
   * PORT: single-precision powf is NOT bit-exact-modelable via `Math.pow`
   * alone (same caveat as PCICCTransferFunctionGamma.call and Parametric1.call).
   * If G4 oracle coverage is added, this call should be routed through the
   * parity driver's `dlsym _powf` lookup rather than Math.pow.
   */
  public call(x: number): number {
    // @0x13a9c: load g (stored as fp32; already frounded at ctor).
    // xmm0 (arg x) is already single-precision as delivered by the ABI; we
    // fround it once to keep the fp32 domain explicit.
    const xf = Math.fround(x);

    // @0x13aa2: tail-call powf(x, g). Rule 4: single-precision powf. We wrap
    // Math.pow with Math.fround at input AND output to keep the fp32 domain;
    // see PCICCTransferFunctionGamma / Parametric1 for the identical pattern
    // and its known oracle caveat.
    return Math.fround(Math.pow(xf, this.g));
  }

  /**
   * PCICCTransferFunctionParametric0::accept(PCICCTransferFunctionVisitor&) const
   * @ProCore 0x13ab4.
   *
   * Full disassembly:
   *   0x13ab4  pushq %rbp; movq %rsp,%rbp
   *   0x13ab8  movq  %rdi, %rax           ; save this
   *   0x13abb  movq  (%rsi), %rcx         ; visitor's vtable
   *   0x13abe  movq  0x28(%rcx), %rcx     ; slot at byte offset 0x28
   *   0x13ac2  movq  %rsi, %rdi           ; arg0 = visitor
   *   0x13ac5  movq  %rax, %rsi           ; arg1 = this
   *   0x13ac8  popq  %rbp
   *   0x13ac9  jmpq  *%rcx                ; tail-call visitor.vtable[+0x28](visitor, this)
   *
   * In our object model, we call `visitor.visit(this)` — the visitor interface
   * here binds specifically to the Parametric0 overload (its own
   * `visit(x: PCICCTransferFunctionParametric0)` method).
   */
  public accept(visitor: PCICCTransferFunctionParametric0Visitor): void {
    visitor.visit(this);
  }

  /**
   * PCICCTransferFunctionParametric0::~PCICCTransferFunctionParametric0()  D1
   * @ProCore 0x13a88.
   *
   *   0x13a88  pushq %rbp; movq %rsp,%rbp
   *   0x13a8c  popq  %rbp
   *   0x13a8d  retq
   *
   * A byte-identical D2 body exists separately at @ProCore 0x13a82. Both are
   * trivial: 6 bytes of prologue+epilogue, no field release, no base chain
   * (the abstract PCICCTransferFunction base's D2 is itself empty per
   * raw-port/src/infra/PCICCTransferFunction.ts — nothing to unwind). D0
   * @ProCore 0x13a8e has the identical body plus a `jmp __ZdlPv` tail-call to
   * `operator delete(this)`; TS has no manual heap, so all three alias to a
   * no-op (GC handles reclamation).
   */
  public destruct(): void {
    // no-op — matches the empty D1/D2 body @0x13a88 / @0x13a82.
  }
}
