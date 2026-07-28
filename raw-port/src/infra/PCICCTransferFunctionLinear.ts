// PCICCTransferFunctionLinear.ts — ProCore concrete ICC transfer-function
// subclass for the LINEAR (identity, γ = 1.0) transfer curve.
//
// Framework: ProCore.framework  (mangled prefix __ZN27PCICCTransferFunctionLinear...)
// Base class: PCICCTransferFunction (abstract) — imported from
//   raw-port/src/infra/PCICCTransferFunction.ts (already landed).
//
// SIBLING FAMILY (from ProCore symbol table, __ZTV<Class> vtables):
//   PCICCTransferFunctionLinear     (this file)
//   PCICCTransferFunctionGamma
//   PCICCTransferFunctionLUT
//   PCICCTransferFunctionParametric0..4
// All eight subclasses share the "operator()(float) const" and
// "accept(PCICCTransferFunctionVisitor&) const" polymorphic shape. Only the
// operator() body distinguishes their math — Linear's is the identity.
//
// EXPORTED SYMBOLS (nm -arch x86_64 ProCore.framework):
//   @0x0000000000013796  PCICCTransferFunctionLinear::PCICCTransferFunctionLinear()  C2 [__ZN27PCICCTransferFunctionLinearC2Ev]
//   @0x00000000000137a6  PCICCTransferFunctionLinear::PCICCTransferFunctionLinear()  C1 [__ZN27PCICCTransferFunctionLinearC1Ev]
//   @0x00000000000137b6  PCICCTransferFunctionLinear::~PCICCTransferFunctionLinear() D2 [__ZN27PCICCTransferFunctionLinearD2Ev]
//   @0x00000000000137bc  PCICCTransferFunctionLinear::~PCICCTransferFunctionLinear() D1 [__ZN27PCICCTransferFunctionLinearD1Ev]
//   @0x00000000000137c2  PCICCTransferFunctionLinear::~PCICCTransferFunctionLinear() D0 [__ZN27PCICCTransferFunctionLinearD0Ev]
//   @0x00000000000137cc  PCICCTransferFunctionLinear::operator()(float) const        [__ZNK27PCICCTransferFunctionLinearclEf]
//   @0x00000000000137d2  PCICCTransferFunctionLinear::accept(PCICCTransferFunctionVisitor&) const
//                                                       [__ZNK27PCICCTransferFunctionLinear6acceptER28PCICCTransferFunctionVisitor]
//
// VTABLE (recovered via raw-port/army/tools/vtable.py ProCore PCICCTransferFunctionLinear):
//   vtable for PCICCTransferFunctionLinear @0x148d58  installed-ptr 0x148d68  (i.e. base+0x10)
//     *0x00 -> 0x137bc  ~PCICCTransferFunctionLinear()  D1
//     *0x08 -> 0x137c2  ~PCICCTransferFunctionLinear()  D0
//     *0x10 -> 0x137cc  operator()(float) const
//     *0x18 -> 0x137d2  accept(PCICCTransferFunctionVisitor&) const
//
// Both C1 (@0x137a6) and C2 (@0x13796) install the SAME vtable pointer 0x148d68
// (i.e. `leaq 0x1355c7(%rip), %rax` from @0x1379a lands at 0x148d68; similarly
// `leaq 0x1355b7(%rip), %rax` from @0x137aa also lands at 0x148d68 — same
// target from different RIP-relative displacements). This is the standard
// Itanium ABI C1/C2 duplication.
//
// STRUCT LAYOUT: the class has NO fields beyond the inherited vptr. Both ctors
// only write the vtable pointer to (%rdi)+0 and immediately return; no other
// stores. The base class PCICCTransferFunction (per the already-landed port)
// also has no fields. So the entire native object is a single 8-byte vptr.
//
// UNDECODED CALLEES: NONE. Every method here is a leaf function; there is no
// undecoded branch or callee that would require a Rule-3 throwing stub.

import { PCICCTransferFunction } from "./PCICCTransferFunction";

/**
 * Abstract visitor for the PCICCTransferFunction* family.
 *
 * Modelled from the `accept` disassembly (see below): the visitor's vtable
 * slot 0x10 (index 2 after the two dtor slots) is invoked with the Linear
 * subclass instance as its single argument, i.e. `visit(Linear const&)`.
 *
 * The visitor family is a private/anonymous-namespace collection inside
 * ProCore (PrintVisitor, MakeTagVisitor, DescriptionVisitor, EstimateGamma
 * Visitor, TransferValueVisitor — see nm dump for full list). Their concrete
 * vtable layouts are not decoded here; this TS interface only fixes the
 * contract that accept() invokes: a `visit(x: PCICCTransferFunctionLinear)`
 * method exists on any visitor that is passed to a Linear's accept().
 *
 * Per Rule 3 (throw on undecoded, never approximate), a concrete visitor
 * implementation is *not* supplied by this port — subclass visitors are
 * separate FCP classes each of which needs its own transcription.
 */
export interface PCICCTransferFunctionVisitor {
  /**
   * Vtable slot 0x10 of the visitor. Called by
   * PCICCTransferFunctionLinear::accept — see the disassembly-annotated method
   * body below. Any concrete visitor (PrintVisitor, MakeTagVisitor,
   * DescriptionVisitor, EstimateGammaVisitor, TransferValueVisitor, …)
   * implements this overload for the Linear subclass.
   */
  visit(x: PCICCTransferFunctionLinear): void;
}

/**
 * PCICCTransferFunctionLinear — the identity ICC transfer function.
 *
 * A concrete polymorphic subclass of the abstract base
 * {@link PCICCTransferFunction}. Instances carry no state beyond the vptr.
 * The only mathematical operation, operator()(float), is the identity map:
 * the disassembly of @0x137cc contains NO computation on %xmm0 (the incoming
 * float) before the epilogue, so the return value equals the argument
 * bit-for-bit.
 *
 * This is the ICC-profile "linear gamma" (γ = 1.0) curve: input intensity
 * maps directly to output intensity without any non-linear reshaping.
 */
export class PCICCTransferFunctionLinear extends PCICCTransferFunction {
  /**
   * Brand override so this subclass is distinguishable from the abstract
   * base and its siblings at the TS type level. There is NO runtime storage
   * for this brand in native (the C++ class has zero fields beyond vptr);
   * it exists purely so `x instanceof PCICCTransferFunctionLinear` and the
   * type-level discriminant both work.
   */
  override readonly __pcICCTransferFunctionBrand =
    "PCICCTransferFunction" as const;

  /**
   * PCICCTransferFunctionLinear::PCICCTransferFunctionLinear() — C1 & C2
   * @0x00000000000137a6  [C1, __ZN27PCICCTransferFunctionLinearC1Ev]
   * @0x0000000000013796  [C2, __ZN27PCICCTransferFunctionLinearC2Ev]
   *
   * Full C1 disassembly (@0x137a6):
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   leaq  0x1355b7(%rip), %rax    ; rax = 0x137aa + 7 + 0x1355b7 = 0x148d68
   *                                  ; i.e. vtable for PCICCTransferFunctionLinear + 0x10
   *   movq  %rax, (%rdi)             ; this->vptr = 0x148d68
   *   popq  %rbp
   *   retq
   *
   * Full C2 disassembly (@0x13796) is byte-identical apart from the RIP
   * displacement (`leaq 0x1355c7(%rip), %rax` from @0x1379a lands at the
   * same 0x148d68 target). Both ctor variants install exactly the same
   * vtable pointer and set no other fields — the class has NO members.
   *
   * TS model: a no-op constructor. The vtable pointer in native x86 is
   * implicit in TS via the class prototype chain.
   */
  constructor() {
    super();
    // @0x137a6..@0x137b5 — vtable install only, no other side effects.
    // (Native writes 0x148d68 to (this+0x00); TS handles vtable dispatch
    //  through JS's own prototype chain.)
  }

  /**
   * PCICCTransferFunctionLinear::~PCICCTransferFunctionLinear() — D1 & D2
   * @0x00000000000137bc  [D1, __ZN27PCICCTransferFunctionLinearD1Ev]
   * @0x00000000000137b6  [D2, __ZN27PCICCTransferFunctionLinearD2Ev]
   *
   * Full D1 disassembly (@0x137bc):
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   popq  %rbp
   *   retq
   *
   * Full D2 disassembly (@0x137b6): byte-identical (same prologue+epilogue,
   * no calls, no field-writes). Both are trivial-empty destructors: the
   * class has no fields to release, and its base PCICCTransferFunction's D2
   * (@0x13790) is also trivially empty, so the compiler emitted zero
   * cleanup instructions here.
   *
   * TS model: a no-op method. JS garbage collection replaces manual dtor.
   */
  __dtor_D1_Linear(): void {
    // @0x137bc..@0x137c1 — trivial empty. Nothing to destruct.
  }

  /**
   * PCICCTransferFunctionLinear::~PCICCTransferFunctionLinear() — D0
   * @0x00000000000137c2  [__ZN27PCICCTransferFunctionLinearD0Ev]
   *
   * Full disassembly:
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   popq  %rbp
   *   jmp   0xde6c0                  ## symbol stub for: __ZdlPv
   *
   * The D0 slot is the "deleting destructor" (Itanium ABI): it runs the
   * complete-object dtor and then frees the storage via `operator delete`
   * (mangled __ZdlPv). Because the class has no fields, the complete-object
   * dtor work is nil — the compiler collapsed the "run D2 then delete this"
   * sequence into a straight tail-jump to `operator delete(void*)`.
   *
   * TS model: no-op body. Native's `operator delete` corresponds to JS GC,
   * which we do not invoke directly. Any code path that reaches this method
   * has (in C++) reclaimed the heap slot; in TS the object simply becomes
   * unreachable when its last reference drops.
   */
  __dtor_D0_Linear(): void {
    // @0x137c2..@0x137c7 — deleting dtor. Tail-jumps to `operator delete(void*)`
    // (symbol stub __ZdlPv @0xde6c0). No fields to destruct; JS GC handles storage.
  }

  /**
   * PCICCTransferFunctionLinear::operator()(float) const — the transfer curve.
   * @0x00000000000137cc  [__ZNK27PCICCTransferFunctionLinearclEf]
   *
   * Full disassembly:
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   popq  %rbp
   *   retq
   *
   * The x86_64 SysV ABI passes a single `float` argument in %xmm0 and
   * returns a `float` result in %xmm0. The body of this method NEVER
   * touches %xmm0 — no cvtss2sd, no arithmetic, no memory reference — so
   * the returned bits are IDENTICAL to the incoming bits. This is the
   * mathematical identity function on IEEE-754 single precision:
   *
   *     y = x    (for all x, including ±0, ±inf, NaNs, subnormals)
   *
   * Per Rule 4 (match the machine's numerics: single-precision ops wrapped
   * in Math.fround), we round-trip through Math.fround so that any host-side
   * double-precision temporary is collapsed to float32 semantics before the
   * value is returned. In practice this is a no-op for a value that ALREADY
   * came through a float32 pipeline, but it makes the contract explicit at
   * the boundary and matches what a native `float f(float x)` would do to
   * a value briefly promoted to double.
   *
   * @param x the input intensity, IEEE-754 float32.
   * @returns x itself, preserved bit-for-bit as float32.
   */
  operator_call(x: number): number {
    // @0x137cc..@0x137d1 — identity. No computation on %xmm0.
    return Math.fround(x);
  }

  /**
   * PCICCTransferFunctionLinear::accept(PCICCTransferFunctionVisitor&) const
   * @0x00000000000137d2  [__ZNK27PCICCTransferFunctionLinear6acceptER28PCICCTransferFunctionVisitor]
   *
   * Full disassembly:
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   movq  %rdi, %rax           ; rax = this  (the Linear instance)
   *   movq  (%rsi), %rcx         ; rcx = visitor->vptr
   *   movq  0x10(%rcx), %rcx     ; rcx = visitor->vptr[0x10]
   *                              ;     = visit(PCICCTransferFunctionLinear const&)
   *   movq  %rsi, %rdi           ; rdi = visitor  (new `this` for visit)
   *   movq  %rax, %rsi           ; rsi = *this   (Linear const&, the arg)
   *   popq  %rbp
   *   jmpq  *%rcx                ; tail-call visitor->visit(*this)
   *
   * Classic Visitor double-dispatch: `accept` inspects the runtime type
   * (already resolved because `this` is a Linear — accept is on Linear's
   * own vtable) and dispatches to the visitor's overload that takes a
   * Linear reference (visitor.vtable slot 0x10).
   *
   * The specific vtable-slot -> overload correspondence — visitor slot
   * 0x10 is visit(PCICCTransferFunctionLinear const&), NOT visit(Gamma&)
   * or visit(LUT&) etc. — is proved as follows: every subclass's own
   * accept() reads the SAME slot offset 0x10 of the visitor vtable (see
   * e.g. the sibling classes' accept disasms), so 0x10 must be the slot
   * whose overload matches the DYNAMIC type of *this. Because *this here
   * is a Linear, that overload is visit(Linear const&).
   *
   * UNDECODED CALLEE: the visitor's visit(Linear&) itself. This body
   * belongs to whichever concrete visitor (PrintVisitor, MakeTagVisitor,
   * DescriptionVisitor, EstimateGammaVisitor, TransferValueVisitor, …)
   * the caller passed in — each of those has its own address (e.g.
   * PrintVisitor::visit(Linear&) @0xc567c, MakeTagVisitor::visit(Linear&)
   * @0x1449c, DescriptionVisitor::visit(Linear&) @0x2073e,
   * EstimateGammaVisitor::visit(Linear&) @0x5228e per the ProCore nm dump)
   * and is a separate port.  Per Rule 3, we do NOT reimplement any of
   * them here — this method simply invokes whatever visit(Linear&) the
   * concrete visitor supplies through the TypeScript interface method.
   *
   * @param visitor a concrete PCICCTransferFunctionVisitor whose
   *   `visit(PCICCTransferFunctionLinear)` overload (vtable slot 0x10 in
   *   native) will be tail-invoked with `this`.
   */
  accept(visitor: PCICCTransferFunctionVisitor): void {
    // @0x137d2..@0x137e7 — tail-dispatch visitor.visit(*this).
    // (Native reads visitor->vtable[0x10] and jmpq's to it; in TS we call
    //  the interface method that models that same slot.)
    visitor.visit(this);
  }
}
