// PCICCTransferFunctionGamma.ts — ProCore's PCICCTransferFunctionGamma. Transcribed from the
// disassembly at /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
// See raw-port/re/disasm/ProCore.PCICCTransferFunctionGamma.*.s and grep on /tmp/ProCore_symmap.tsv.
//
// ROLE. One node of the PCICCTransferFunction visitor hierarchy: a single-parameter power-curve
// transfer function y = pow(x, gamma) (single-precision), typical of ICC "curv" tags with a
// single gamma value. Concrete siblings in the same family (per /tmp/ProCore_symmap.tsv):
//   PCICCTransferFunctionLinear, PCICCTransferFunctionLUT, PCICCTransferFunctionParametric{0..4}.
// This class exposes:
//   * ctor(float gamma)  — trivial: stores gamma
//   * getGamma()         — returns the gamma
//   * operator()(float)  — returns powf(x, gamma)
//   * accept(visitor)    — vtable-dispatch on the visitor (visitor.vtable[0x18] slot)
//
// STRUCT LAYOUT (12 bytes, recovered from ctor 0x13800):
//   +0x00  vtbl  : *const void   // vtable pointer (leaq 0x13558d(%rip) @0x13804 -> const at
//                                //   ProCore 0x148d98; addr = 0x1380b + 0x13558d)
//   +0x08  gamma : float32       // movss %xmm0, 0x8(%rdi)  @0x1380e
//
// The class is a POD other than vtbl — dtor D2 is trivial (Itanium C++ ABI); only D0 (the
// deleting destructor) exists as a real code path and just tail-calls `operator delete(this)`.
// We model that as a plain JS object; there is no heap ptr to release.

/**
 * Abstract visitor over the PCICCTransferFunction hierarchy. Concrete visitors override
 * `visitGamma` (the slot invoked at vtable offset +0x18 by
 *   PCICCTransferFunctionGamma::accept @ProCore 0x13848 —
 *      @0x1384f  movq (%rsi), %rcx       ; visitor's vtable
 *      @0x13852  movq 0x18(%rcx), %rcx   ; slot at offset 0x18 (== index 3)
 *      @0x13856..@0x1385d  tail-call visitor.vtable[3](visitor, this)
 * The name "visitGamma" reflects the invariant that this dispatch is only reached from
 * the Gamma node; other nodes tail-call other slots (Linear -> +0x10, LUT -> +0x20, etc.,
 * per their disassemblies — cite each site as they land).
 */
export interface PCICCTransferFunctionVisitor {
  /** vtable slot +0x18 — invoked by PCICCTransferFunctionGamma::accept @ProCore 0x13848. */
  visitGamma(g: PCICCTransferFunctionGamma): void;
}

/**
 * PCICCTransferFunctionGamma — ICC "curv"-tag single-gamma transfer function node.
 * All addresses cited in ProCore.
 */
export class PCICCTransferFunctionGamma {
  /** +0x08 float32 — the gamma exponent. */
  public readonly gamma: number;

  /**
   * PCICCTransferFunctionGamma::PCICCTransferFunctionGamma(float)  @ProCore 0x13800
   * (C1; C2 @same-family aliases C1 per __ZN26PCICCTransferFunctionGammaC2Ef entry).
   *
   * Disasm (raw-port/re/disasm/ProCore.PCICCTransferFunctionGamma.PCICCTransferFunctionGamma.s):
   *   0x13800  pushq %rbp; movq %rsp,%rbp
   *   0x13804  leaq  0x13558d(%rip), %rax        ; vtable const @ProCore 0x148d98
   *   0x1380b  movq  %rax, (%rdi)                ; this[0] = vtbl
   *   0x1380e  movss %xmm0, 0x8(%rdi)            ; this[+0x8] = gamma (single-precision)
   *   0x13813  popq  %rbp; retq
   */
  public constructor(gamma: number) {
    // movss narrows to single precision — mirror with Math.fround per PORTING_SPEC Rule 4.
    this.gamma = Math.fround(gamma);
  }

  /**
   * PCICCTransferFunctionGamma::getGamma() const  @ProCore 0x1383c.
   *
   *   0x13840  movss 0x8(%rdi), %xmm0
   *   0x13845  popq  %rbp; retq
   *
   * Returns the stored float. No conversion; caller receives single-precision-widened-to-double
   * (which is exactly what JS `number` already holds after fround). We do not re-fround here
   * because the stored value was frounded at construction and float32 is idempotent under fround.
   */
  public getGamma(): number {
    return this.gamma;
  }

  /**
   * PCICCTransferFunctionGamma::operator()(float) const  @ProCore 0x1382c.
   *
   *   0x1382c  pushq %rbp; movq %rsp,%rbp
   *   0x13830  movss 0x8(%rdi), %xmm1                 ; xmm1 = gamma
   *   0x13835  popq  %rbp
   *   0x13836  jmp   _powf                            ## symbol stub for: _powf
   *
   * Tail-calls the libm single-precision `powf(x, gamma)`. In JS we use `Math.pow`
   * (double-precision), wrapped by `Math.fround` at both inputs and output to preserve
   * single-precision faithfulness (Rule 4).
   *
   * NOTE. `powf` is NOT bit-exact-modelable via `Math.pow` alone — the platform libm's
   * float32 pow can differ from a double pow re-narrowed. This is the standard limitation
   * documented in raw-port/ANTI_SHORTCUT.md for units not yet oracle-mapped. If G4 oracle
   * coverage is added for PCICCTransferFunctionGamma, this call should be routed through
   * the parity driver's powf-lookup (dlsym _powf) rather than Math.pow.
   */
  public call(x: number): number {
    const xf = Math.fround(x);
    const g = this.gamma;  // already frounded at ctor
    return Math.fround(Math.pow(xf, g));
  }

  /**
   * PCICCTransferFunctionGamma::accept(PCICCTransferFunctionVisitor&) const  @ProCore 0x13848.
   *
   *   0x13848  pushq %rbp; movq %rsp,%rbp
   *   0x1384c  movq  %rdi, %rax          ; save this
   *   0x1384f  movq  (%rsi), %rcx        ; visitor's vtable
   *   0x13852  movq  0x18(%rcx), %rcx    ; slot +0x18 (byte offset) == vtable[3]
   *   0x13856  movq  %rsi, %rdi          ; arg0 = visitor
   *   0x13859  movq  %rax, %rsi          ; arg1 = this
   *   0x1385c  popq  %rbp
   *   0x1385d  jmpq  *%rcx               ; tail-call visitor.vtable[+0x18](visitor, this)
   *
   * The visitor is an abstract type (no `vtable for PCICCTransferFunctionVisitor` symbol exists
   * in ProCore per `nm -a`); concrete visitors supply the slot. In our object model, we call
   * `visitor.visitGamma(this)`.
   */
  public accept(visitor: PCICCTransferFunctionVisitor): void {
    visitor.visitGamma(this);
  }

  /**
   * PCICCTransferFunctionGamma::~PCICCTransferFunctionGamma()  D2/D1 alias — POD dtor (no
   * observable work). D0 (deleting) @ProCore 0x13822 tail-jmps `operator delete` via
   *   0x13826  popq %rbp; 0x13827  jmp __ZdlPv
   * No fields need destruction and no heap references exist. Modeled as a no-op in JS.
   *
   * Distinct disassembled entry points (all 4-instruction trivial stubs — no observable work):
   *   D2 @ProCore 0x13816  (base-subobject dtor)
   *      0x13816 pushq %rbp; 0x13817 movq %rsp,%rbp; 0x1381a popq %rbp; 0x1381b retq
   *   D1 @ProCore 0x1381c  (complete-object dtor) — see PCICCTransferFunctionGamma__D1 below
   *      0x1381c pushq %rbp; 0x1381d movq %rsp,%rbp; 0x13820 popq %rbp; 0x13821 retq
   *   D0 @ProCore 0x13822  (deleting dtor — tail-calls __ZdlPv)
   */
  public dispose(): void {
    /* no-op — matches D2/D1 (trivial) and JS has no `delete this` */
  }
}

/**
 * PCICCTransferFunctionGamma::~PCICCTransferFunctionGamma()  [D1, complete-object dtor]
 *   @ProCore 0x1381c  __ZN26PCICCTransferFunctionGammaD1Ev
 *
 * re/disasm:
 *   raw-port/re/disasm/ProCore.__ZN26PCICCTransferFunctionGammaD1Ev.s  (4 instructions)
 *
 * Distinct symbol from D2/D0 but the body is IDENTICAL to D2 — a POD dtor stub:
 *
 *   @0x1381c  pushq %rbp
 *   @0x1381d  movq  %rsp, %rbp
 *   @0x13820  popq  %rbp
 *   @0x13821  retq
 *
 * No calls, no memory writes, no vtable manipulation. Under the Itanium C++ ABI, the D1
 * complete-object dtor for a class with no virtual bases is either identical to D2 (as here)
 * or a thin wrapper that invokes D2 then any virtual-base dtors — this class has none. So
 * D1 semantics = "nothing to release; no vtable to swap in for a base subobject". The
 * corresponding JS behavior is a no-op on the JS object; there is no heap ptr to free
 * (D0 does that separately) and no member-wise cleanup (`gamma` is a primitive).
 *
 * Provided as a standalone export so callers who need the exact D1 entry point (e.g. code
 * that invokes it through the vtable +0x10 slot rather than the deleting +0x18 slot) get a
 * symbol that matches the mangled name and cites the correct address.
 */
export function PCICCTransferFunctionGamma__D1(
  _self: PCICCTransferFunctionGamma,
): void {
  // @0x1381c..@0x13821  prologue → epilogue → ret. No observable work.
}

/** Alias export: mangled symbol name. @ProCore 0x1381c */
export const __ZN26PCICCTransferFunctionGammaD1Ev = PCICCTransferFunctionGamma__D1;
