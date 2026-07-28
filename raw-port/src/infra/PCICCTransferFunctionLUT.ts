// PCICCTransferFunctionLUT.ts — ProCore concrete ICC transfer-function
// subclass backed by a 1-D LOOKUP TABLE of float32 samples over [0.0, 1.0].
//
// Framework: ProCore.framework  (mangled prefix __ZN24PCICCTransferFunctionLUT...)
// Base class: PCICCTransferFunction (abstract) — imported from
//   raw-port/src/infra/PCICCTransferFunction.ts (already landed).
//
// SIBLING FAMILY (from ProCore symbol table, __ZTV<Class> vtables):
//   PCICCTransferFunctionLinear, PCICCTransferFunctionGamma,
//   PCICCTransferFunctionLUT (this file),
//   PCICCTransferFunctionParametric0..4.
// All eight subclasses share the `operator()(float) const` and
// `accept(PCICCTransferFunctionVisitor&) const` polymorphic shape. Only the
// operator() body distinguishes them.
//
// EXPORTED SYMBOLS (nm -arch x86_64 ProCore.framework):
//   @0x0000000000013860  PCICCTransferFunctionLUT::PCICCTransferFunctionLUT(float const*, float const*) C2 [__ZN24PCICCTransferFunctionLUTC2EPKfS1_]
//   @0x0000000000013894  PCICCTransferFunctionLUT::PCICCTransferFunctionLUT(float const*, float const*) C1 [__ZN24PCICCTransferFunctionLUTC1EPKfS1_]
//   @0x00000000000138c8  PCICCTransferFunctionLUT::~PCICCTransferFunctionLUT() D2 [__ZN24PCICCTransferFunctionLUTD2Ev]
//   @0x00000000000138ee  PCICCTransferFunctionLUT::~PCICCTransferFunctionLUT() D1 [__ZN24PCICCTransferFunctionLUTD1Ev]
//   @0x0000000000013914  PCICCTransferFunctionLUT::~PCICCTransferFunctionLUT() D0 [__ZN24PCICCTransferFunctionLUTD0Ev]
//   @0x0000000000013948  PCICCTransferFunctionLUT::operator()(float) const [__ZNK24PCICCTransferFunctionLUTclEf]
//   @0x0000000000013a2a  PCICCTransferFunctionLUT::getLUTBegin() const     [__ZNK24PCICCTransferFunctionLUT11getLUTBeginEv]
//   @0x0000000000013a34  PCICCTransferFunctionLUT::getLUTEnd()   const     [__ZNK24PCICCTransferFunctionLUT9getLUTEndEv]
//   @0x0000000000013a3e  PCICCTransferFunctionLUT::accept(PCICCTransferFunctionVisitor&) const
//                                                    [__ZNK24PCICCTransferFunctionLUT6acceptER28PCICCTransferFunctionVisitor]
//
// VTABLE (recovered via raw-port/army/tools/vtable.py ProCore PCICCTransferFunctionLUT):
//   vtable for PCICCTransferFunctionLUT @0x148db8  installed-ptr 0x148dc8  (i.e. base+0x10)
//     *0x00 -> 0x138ee  ~PCICCTransferFunctionLUT()  D1
//     *0x08 -> 0x13914  ~PCICCTransferFunctionLUT()  D0
//     *0x10 -> 0x13948  operator()(float) const
//     *0x18 -> 0x13a3e  accept(PCICCTransferFunctionVisitor&) const
//   (Both C1 @0x13894 and C2 @0x13860 install the same 0x148dc8 vptr via
//    `leaq 0x135529(%rip),%rax` @0x13898 and `leaq 0x13555d(%rip),%rax` @0x13864
//    respectively; targets are identical — standard Itanium-ABI C1/C2 duplication.
//    Similarly D0/D1/D2 each rewrite (%rdi) to 0x148dc8 via three different rip
//    displacements @0x1391d/@0x138f2/@0x138cc that all resolve to 0x148dc8.)
//
// STRUCT LAYOUT (24 bytes past the vptr — recovered from the two ctors + D0/D1/D2):
//   +0x00  vtbl        : *const void        ; the vtable ptr (@0x148dc8)
//   +0x08  __begin_    : float*             ; std::vector<float>::__begin_
//   +0x10  __end_      : float*             ; std::vector<float>::__end_
//   +0x18  __end_cap_  : float* (packed)    ; std::vector<float>::__end_cap_.__value_
// The three vector members are the standard libc++ `std::__1::vector<float>` layout
// (see mangled tail-call target of C1/C2:
//   __ZNSt3__16vectorIfNS_9allocatorIfEEE16__init_with_sizeB9nqe210106IPKfS6_EEvT_T0_m
//   -> std::__1::vector<float>::__init_with_size<float const*,float const*>(begin,end,size)).
// The ctor computes size = (rdx - rsi) >> 2 (element count) and hands it to __init_with_size,
// which copies [begin,end) into freshly-allocated storage. Field offsets recovered from:
//   ctor @0x138a2..@0x138b7 zeros +0x08 (movups xmm0,0x8) and +0x18 (movq $0,0x18) before
//   the tail-jmp to __init_with_size; D0/D1/D2 read +0x08 as `__begin_` and (D0 only) write
//   +0x10 with a copy of __begin_ prior to `operator delete(__begin_)`.
//
// CALLEE ORACLES:
//   __ZNSt3__16vectorIfNS_9allocatorIfEEE16__init_with_size...  — libc++ vector-init template
//   __ZdlPv @0xde6c0 (symbol stub for operator delete(void*))    — libSystem C++ runtime
// Both are external libc++/libSystem calls; in JS we materialise the LUT array up front (see
// the constructor comment) and rely on GC in place of `operator delete`.
//
// TEXT-CONST LITERALS (read via lipo -thin x86_64 + __TEXT/__const at 0xe1b10 offset 924432):
//   @ProCore 0xe1f70   float32  = 1.0f          ; upper-bound test in operator()
//   @ProCore 0x122b78  float32  = 9.223372e+18f ; 2^63, the signed↔unsigned u64→float fixup
//   @ProCore 0x122530  float64  = 1.0           ; `1.0 - f` in the lerp
//
// UNDECODED CALLEES: NONE. Both external callees are non-FCP (libc++/libSystem) and are
// modeled by higher-level JS operations that faithfully reproduce their effect on this class.

import { PCICCTransferFunction } from "./PCICCTransferFunction";

/**
 * Visitor over the PCICCTransferFunction* family — the slot invoked from THIS class'
 * accept is vtable offset +0x20 (index 4 after two dtor slots, operator(), accept — same
 * layout as the sibling nodes' visitors but pointed at their own visit-LUT overload).
 * Recovered from `PCICCTransferFunctionLUT::accept` @ProCore 0x13a3e:
 *    0x13a45  movq (%rsi), %rcx        ; visitor's vtable
 *    0x13a48  movq 0x20(%rcx), %rcx    ; slot +0x20 == vtable[4]
 *    0x13a4c..0x13a53  tail-call rcx(visitor, this)
 *
 * (Compare: sibling Gamma dispatches +0x18; sibling Linear dispatches +0x10; the visitor
 * hierarchy is one vtable-per-transfer-function-shape. Sibling Visitor definitions in the
 * other subclass files use the same interface name locally; here we scope the LUT-visit
 * contract explicitly under a distinct interface `PCICCTransferFunctionLUTVisitor` to avoid
 * an ambient re-declaration collision with the sibling files' `PCICCTransferFunctionVisitor`
 * definitions until a unified visitor hierarchy is landed.)
 */
export interface PCICCTransferFunctionLUTVisitor {
  /** Vtable slot +0x20 — LUT-node visit overload. */
  visitLUT(x: PCICCTransferFunctionLUT): void;
}

/**
 * PCICCTransferFunctionLUT — ICC LUT-based transfer function node. Wraps an
 * immutable std::vector<float> sampled uniformly over the input domain [0,1].
 * All addresses cited in ProCore.
 */
export class PCICCTransferFunctionLUT extends PCICCTransferFunction {
  /** +0x08..+0x18 shape: the underlying float32 LUT samples, copied at construction. */
  public readonly lut: Float32Array;

  /**
   * PCICCTransferFunctionLUT::PCICCTransferFunctionLUT(float const*, float const*)
   *   C1 @ProCore 0x13894   (installs vptr via leaq 0x135529(%rip),%rax @0x13898 -> 0x148dc8)
   *   C2 @ProCore 0x13860   (installs vptr via leaq 0x13555d(%rip),%rax @0x13864 -> 0x148dc8)
   *
   * Both ctors are IDENTICAL apart from the RIP displacement — Itanium ABI C1/C2 duplication:
   *   push rbp; mov rsp,rbp
   *   lea  <vtbl>(%rip), rax; mov rax, (%rdi)         ; this[0] = vtable
   *   lea  8(%rdi), rax                                ; &this->vector
   *   mov  %rdx, %rcx; sub %rsi, %rcx; sar 2, %rcx    ; size = (end - begin) / 4  (element count)
   *   xorps %xmm0, %xmm0
   *   movups %xmm0, 8(%rdi)                            ; zero __begin_ & __end_
   *   movq   $0, 0x18(%rdi)                            ; zero __end_cap_
   *   mov  %rax, %rdi                                  ; arg0 = &this->vector
   *   pop  rbp
   *   jmp  __ZNSt3__16vectorIfNS_9allocatorIfEEE16__init_with_size...  ; copy [begin,end) into it
   *
   * The tail-call to std::vector's __init_with_size template copies `size` floats from
   * `[begin, end)` into a freshly-allocated buffer and writes the three pointer fields.
   *
   * In JS we take a Float32Array copy of the samples — the class's only observable dependence
   * on the underlying vector is (a) its element count, (b) the sequence of samples read by
   * operator(). We use `new Float32Array(input)` which is a plain memcpy semantically identical
   * to __init_with_size for float32 storage.
   */
  public constructor(begin: Float32Array | ArrayLike<number>, end?: number) {
    super();
    // Mirror the pointer-pair -> element-count conversion: (end - begin) >> 2. In JS we
    // accept either a Float32Array slice or a (Float32Array, endIndex) pair. Both preserve
    // the "N floats between two positions" invariant that maps to (rdx - rsi) >> 2.
    if (end === undefined) {
      // Sliced copy — semantically identical to __init_with_size with begin=begin[0],
      // end=begin[length]. `new Float32Array(iter)` performs the element-wise copy.
      this.lut = new Float32Array(begin as ArrayLike<number>);
    } else {
      const src = begin as Float32Array;
      this.lut = new Float32Array(end);
      for (let i = 0; i < end; i++) this.lut[i] = src[i];
    }
  }

  /**
   * PCICCTransferFunctionLUT::getLUTBegin() const  @ProCore 0x13a2a.
   *
   *   0x13a2a  pushq %rbp; movq %rsp,%rbp
   *   0x13a2e  movq  0x8(%rdi), %rax        ; return this->__begin_
   *   0x13a32  popq  %rbp; retq
   *
   * Returns a raw pointer to the LUT's first sample. In JS we expose the backing
   * Float32Array itself — reads from index 0 correspond bit-for-bit to `*__begin_`.
   */
  public getLUTBegin(): Float32Array {
    return this.lut;
  }

  /**
   * PCICCTransferFunctionLUT::getLUTEnd() const  @ProCore 0x13a34.
   *
   *   0x13a34  pushq %rbp; movq %rsp,%rbp
   *   0x13a38  movq  0x10(%rdi), %rax       ; return this->__end_
   *   0x13a3c  popq  %rbp; retq
   *
   * Returns the one-past-the-last pointer, i.e. begin + length. In JS we return the
   * element count (equivalent under the "raw pointer arithmetic" semantics — `end - begin`
   * IS the element count that operator() itself computes via `(rcx = end-begin) >> 2`).
   */
  public getLUTEnd(): number {
    return this.lut.length;
  }

  /**
   * PCICCTransferFunctionLUT::operator()(float) const  @ProCore 0x13948.
   *
   * Piecewise-linear interpolation of the LUT over [0, 1]:
   *   let N = end - begin;
   *   if x <= 0     -> return LUT[0]
   *   if x >= 1     -> return LUT[N-1]
   *   let p     = x * (N - 1)          ; (single-precision throughout)
   *   let idx   = floor(p)              ; integer index into the LUT
   *   let f     = p - idx               ; fractional position in [0, 1)
   *   let r64   = (1.0 - f)*LUT[idx] + f*LUT[idx+1]   ; done as double (see cvtps2pd + mulpd)
   *   return (float)r64
   *
   * Full disassembly (raw-port/re/disasm/ProCore.PCICCTransferFunctionLUT.operator().s):
   *   @0x13948  pushq %rbp; movq %rsp,%rbp
   *   @0x1394c  xorps %xmm1,%xmm1                       ; xmm1 = 0.0f
   *   @0x1394f  ucomiss %xmm0,%xmm1                     ; cmp(0.0, x)
   *   @0x13952  jae 0x1397b                             ; if 0.0 >= x  -> return LUT[0]
   *
   *   @0x13954  movq 0x8(%rdi),%rax                     ; rax = __begin_
   *   @0x13958  movq 0x10(%rdi),%rcx                    ; rcx = __end_
   *   @0x1395c  subq %rax,%rcx; sarq $2,%rcx            ; rcx = N = (end - begin) >> 2
   *
   *   @0x13963  ucomiss 0xce606(%rip),%xmm0             ; cmp(x, 1.0f)         @ProCore 0xe1f70
   *   @0x1396a  jae 0x13988                             ; if x >= 1.0  -> return LUT[N-1]
   *
   *   @0x1396c  decq %rcx                               ; rcx = N - 1
   *   @0x1396f  js  0x13993                             ; unsigned-huge path (N-1 < 0)
   *
   *   ; normal signed path: cvtsi2ss on N-1
   *   @0x13971  xorps %xmm1,%xmm1
   *   @0x13974  cvtsi2ss %rcx,%xmm1                     ; xmm1 = (float)(N-1)
   *   @0x13979  jmp 0x139ab
   *
   *   ; unsigned path (compiler-emitted; only reachable for absurdly-large N):
   *   @0x13993  movq %rcx,%rdx; shrq %rdx
   *   @0x13996  andl $1,%ecx; orq %rdx,%rcx
   *   @0x1399f  xorps %xmm1,%xmm1
   *   @0x139a2  cvtsi2ss %rcx,%xmm1
   *   @0x139a7  addss %xmm1,%xmm1                       ; ×2 (round-then-double u64->float)
   *
   *   @0x139ab  mulss %xmm1,%xmm0                       ; xmm0 = x * (N-1)  (= p)
   *   @0x139af  xorps %xmm1,%xmm1
   *   @0x139b2  roundss $0x9,%xmm0,%xmm1                ; xmm1 = floor(p)   (imm 0x9 = round-down, suppress exc.)
   *   @0x139b8  cvttss2si %xmm1,%rdx                    ; rdx = (i64)floor(p)
   *
   *   ; signed-safe cvt of the truncated float to unsigned (compiler idiom): if the signed cvt
   *   ; overflowed, mask against a second cvt of (x - 2^63) and re-OR. For our N (LUT length),
   *   ; rdx is always positive and modest, so rsi=0 and rcx=rdx in practice.
   *   @0x139bd  movq %rdx,%rsi; sarq $0x3f,%rsi         ; rsi = rdx < 0 ? -1 : 0
   *   @0x139c4  subss 0x10f1ac(%rip),%xmm1              ; xmm1 -= 2^63f     @ProCore 0x122b78 = 9.223372e18f
   *   @0x139cc  cvttss2si %xmm1,%rcx
   *   @0x139d1  andq %rsi,%rcx; orq %rdx,%rcx           ; rcx = idx (canonical unsigned)
   *
   *   @0x139d7  js 0x139e3                              ; second u64->float fixup if needed
   *   @0x139d9  xorps %xmm1,%xmm1
   *   @0x139dc  cvtsi2ss %rcx,%xmm1                     ; xmm1 = (float)idx
   *   @0x139e1  jmp 0x139fd
   *   @0x139e3  movq %rcx,%rdx; shrq %rdx
   *   @0x139e6  movl %ecx,%esi; andl $1,%esi; orq %rdx,%rsi
   *   @0x139f1  xorps %xmm1,%xmm1; cvtsi2ss %rsi,%xmm1; addss %xmm1,%xmm1
   *
   *   @0x139fd  subss %xmm1,%xmm0                       ; xmm0 = p - idx = f (fractional)
   *   @0x13a01  cvtss2sd %xmm0,%xmm0                    ; f (double)
   *   @0x13a05  movsd 0x10eb23(%rip),%xmm1              ; xmm1 = 1.0 (double)   @ProCore 0x122530
   *   @0x13a0d  subsd %xmm0,%xmm1                       ; xmm1 = 1.0 - f (double)
   *   @0x13a11  cvtps2pd (%rax,%rcx,4),%xmm2            ; xmm2 = ( (double)LUT[idx], (double)LUT[idx+1] )
   *   @0x13a15  unpcklpd %xmm0,%xmm1                    ; xmm1 = ( 1.0 - f, f )      (packed doubles)
   *   @0x13a19  mulpd %xmm2,%xmm1                       ; xmm1 = ( (1-f)*LUT[idx], f*LUT[idx+1] )
   *   @0x13a1d  haddpd %xmm1,%xmm1                      ; low = (1-f)*LUT[idx] + f*LUT[idx+1]
   *   @0x13a21  xorps %xmm0,%xmm0
   *   @0x13a24  cvtsd2ss %xmm1,%xmm0                    ; return (float)result
   *   @0x13a28  popq %rbp; retq
   *
   *   ; early-return branches:
   *   @0x1397b  movq 0x8(%rdi),%rax; movss (%rax),%xmm0; jmp 0x13a28   ; x<=0 -> LUT[0]
   *   @0x13988  movss -0x4(%rax,%rcx,4),%xmm0; jmp 0x13a28              ; x>=1 -> LUT[N-1]
   *
   * NUMERIC FAITHFULNESS. The interior computation mixes single-precision (p = x*(N-1),
   * f = p - idx) with double-precision (`cvtps2pd`, `1.0 - f` in double, `mulpd`, `haddpd`)
   * and then narrows back with `cvtsd2ss`. We mirror this precisely: `Math.fround` guards the
   * single-precision segments; the double-precision lerp uses plain JS `number` arithmetic
   * (JS's default 64-bit IEEE 754 matches the SSE double path bit-for-bit); the final
   * `Math.fround` reproduces the cvtsd2ss narrowing (Rule 4).
   */
  public call(x: number): number {
    const xf = Math.fround(x);
    // ucomiss with x=NaN sets PF -> jae not taken -> falls through; but for NaN we skip both
    // early-outs and would produce a NaN through the arithmetic. We mirror that exactly by
    // NOT special-casing NaN: the fround / arithmetic chain propagates it just like SSE.
    if (0.0 >= xf) {
      // early-return branch @0x1397b: xmm0 = *(__begin_) = LUT[0]
      return Math.fround(this.lut[0]);
    }
    const N = this.lut.length;
    if (xf >= 1.0) {
      // early-return branch @0x13988: xmm0 = LUT[N-1] via (%rax + rcx*4 - 4)
      return Math.fround(this.lut[N - 1]);
    }
    // Interior lerp path @0x1396c..0x13a28. Both the (N-1)-to-float and idx-to-float paths
    // reduce to the trivial "signed positive int -> float32" case here because N-1 and idx
    // are always small non-negative integers (LUT length is a std::vector<float> size, and
    // idx = floor(x * (N-1)) with 0 < x < 1 stays in [0, N-2]). The compiler-emitted u64
    // fixup is unreachable for these operands and is preserved in the doc-comment only.
    const NmOneF = Math.fround(N - 1);
    const p = Math.fround(xf * NmOneF);
    // roundss $0x9 = round-down (floor); cvttss2si narrows to i64.
    const pFloor = Math.fround(Math.floor(p));
    const idx = Math.floor(p) | 0;  // truncated i64 -> JS int (safe: N is a plain array length)
    const f32 = Math.fround(p - pFloor);        // single-precision fractional
    const fD = f32;                              // cvtss2sd — widen (exact)
    const oneMinusF = 1.0 - fD;                  // subsd 1.0 (double) — matches @0x13a0d
    // cvtps2pd loads two consecutive float32s at (%rax, rcx, 4) and widens both to doubles.
    const a = this.lut[idx];      // (double)LUT[idx]     — exact widening
    const b = this.lut[idx + 1];  // (double)LUT[idx+1]
    // mulpd+haddpd = (1-f)*a + f*b, done in double.
    const resD = oneMinusF * a + fD * b;
    // cvtsd2ss — narrow back to float32.
    return Math.fround(resD);
  }

  /**
   * PCICCTransferFunctionLUT::accept(PCICCTransferFunctionVisitor&) const  @ProCore 0x13a3e.
   *
   *   0x13a3e  pushq %rbp; movq %rsp,%rbp
   *   0x13a42  movq  %rdi,%rax                       ; save this
   *   0x13a45  movq  (%rsi),%rcx                     ; visitor's vtable
   *   0x13a48  movq  0x20(%rcx),%rcx                 ; slot +0x20 == vtable[4]
   *   0x13a4c  movq  %rsi,%rdi                       ; arg0 = visitor
   *   0x13a4f  movq  %rax,%rsi                       ; arg1 = this
   *   0x13a52  popq  %rbp
   *   0x13a53  jmpq  *%rcx                           ; tail-call visitor.vtable[+0x20](visitor, this)
   *
   * The visitor is an abstract type (no `vtable for PCICCTransferFunctionVisitor` symbol
   * exists in ProCore per `nm -a`); concrete visitors (PrintVisitor, MakeTagVisitor,
   * DescriptionVisitor, EstimateGammaVisitor, TransferValueVisitor) each supply the slot.
   * We call `visitor.visitLUT(this)`.
   */
  public accept(visitor: PCICCTransferFunctionLUTVisitor): void {
    visitor.visitLUT(this);
  }

  /**
   * ~PCICCTransferFunctionLUT — three exported destructor entry points:
   *
   *   D2 @ProCore 0x138c8:                    ; base-subobject dtor
   *     0x138cc  leaq  0x1354f5(%rip),%rax   ; vtable @0x148dc8
   *     0x138d3  movq  %rax,(%rdi)           ; this[0] = vtable  (revert to Type's vptr)
   *     0x138d6  movq  0x8(%rdi),%rax        ; rax = __begin_
   *     0x138da  testq %rax,%rax; je  0x138ec ; if (!__begin_) skip
   *     0x138df  movq  %rax,0x10(%rdi)       ; __end_ = __begin_   (libc++ vector::clear)
   *     0x138e3  movq  %rax,%rdi             ; arg = __begin_
   *     0x138e6  popq  %rbp; jmp __ZdlPv     ; operator delete(__begin_)
   *     0x138ec  popq  %rbp; retq
   *
   *   D1 @ProCore 0x138ee:                    ; complete-object dtor (identical body to D2)
   *     0x138f2  leaq  0x1354cf(%rip),%rax   ; SAME 0x148dc8 target via different RIP disp.
   *     ...same shape as D2...
   *
   *   D0 @ProCore 0x13914:                    ; deleting dtor (calls D2 body then `delete this`)
   *     0x13914  pushq %rbp; movq %rsp,%rbp
   *     0x13918  pushq %rbx; pushq %rax
   *     0x1391a  movq  %rdi,%rbx
   *     0x1391d  leaq  0x1354a4(%rip),%rax  ; vtable @0x148dc8
   *     0x13924  movq  %rax,(%rdi)          ; this[0] = vtable
   *     0x13927  movq  0x8(%rdi),%rdi       ; rdi = __begin_
   *     0x1392b  testq %rdi,%rdi; je 0x13939
   *     0x13930  movq  %rdi,0x10(%rbx)      ; __end_ = __begin_
   *     0x13934  callq __ZdlPv              ; operator delete(__begin_)
   *     0x13939  movq  %rbx,%rdi
   *     0x1393c  addq  $8,%rsp; popq %rbx; popq %rbp
   *     0x13942  jmp   __ZdlPv              ; operator delete(this)
   *
   * In JS the vector's storage is a Float32Array owned by `this.lut`; GC replaces both
   * `operator delete(__begin_)` and `operator delete(this)`. There is no observable side
   * effect to model; we expose a no-op `dispose()` that mirrors the D2/D1 shape and drops
   * the reference so the underlying Float32Array can be collected sooner if needed.
   */
  public dispose(): void {
    /* no-op — matches D2/D1 body semantically; GC replaces libc++ operator delete. */
  }
}
