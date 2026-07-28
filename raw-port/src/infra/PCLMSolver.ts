// PCLMSolver.ts — ProCore's Levenberg–Marquardt solver core.
// Faithful transcription of the exported symbols in ProCore.framework:
//
//   @0x00000000000b6bc2  PCLMSolver::PCLMSolver()                 C2 (base ctor)
//                        __ZN10PCLMSolverC2Ev
//   @0x00000000000b6c78  PCLMSolver::PCLMSolver()                 C1 (complete ctor)
//                        __ZN10PCLMSolverC1Ev
//   @0x00000000000b6d00  PCLMSolver::~PCLMSolver()                D2 (base dtor)
//                        __ZN10PCLMSolverD2Ev
//   @0x00000000000b6db8  PCLMSolver::~PCLMSolver()                D1 (complete dtor)
//                        __ZN10PCLMSolverD1Ev
//   @0x00000000000b6dc2  PCLMSolver::~PCLMSolver()                D0 (deleting dtor)
//                        __ZN10PCLMSolverD0Ev
//   @0x00000000000b6dde  PCLMSolver::setProblem(PCLMProblem*)
//                        __ZN10PCLMSolver10setProblemEP11PCLMProblem
//   @0x00000000000b6de8  PCLMSolver::setGoal(PCGenVector<float> const&)
//                        __ZN10PCLMSolver7setGoalERK11PCGenVectorIfE
//   @0x00000000000b6e24  PCLMSolver::setState(PCGenVector<float> const&)
//                        __ZN10PCLMSolver8setStateERK11PCGenVectorIfE
//   @0x00000000000b6e60  PCLMSolver::getState()
//                        __ZN10PCLMSolver8getStateEv
//   @0x00000000000b6e6a  PCLMSolver::setTrust(PCGenVector<float> const&)
//                        __ZN10PCLMSolver8setTrustERK11PCGenVectorIfE
//   @0x00000000000b6e9e  PCLMSolver::computeEpsilon(PCGenVector<float> const&)
//                        __ZN10PCLMSolver14computeEpsilonERK11PCGenVectorIfE
//   @0x00000000000b6f9e  PCLMSolver::solve()
//                        __ZN10PCLMSolver5solveEv
//
// VTABLE (via `resolve.py ProCore vtable PCLMSolver` — __ZTV10PCLMSolver
//   @0x14c770; installed pointer = 0x14c780):
//   *0x00 -> @0xb6db8  PCLMSolver::~PCLMSolver()   D1
//   *0x08 -> @0xb6dc2  PCLMSolver::~PCLMSolver()   D0
//   (all higher slots at *0x10..*0xf8 are typeinfo/exception tables/other
//   classes' function bodies folded in by ICF — PCLMSolver itself has no
//   virtual methods beyond the two dtors.)
//
// ================================================================
// OBJECT LAYOUT (recovered from ctor @0xb6c78, dtor @0xb6d00, setState/
// setGoal/setTrust/getState + solve's field reads):
//
//   +0x00  vptr                          (8B) __ZTV10PCLMSolver+0x10 = 0x14c780
//   +0x08  PCLMProblem* problem          (8B) written by setProblem
//   +0x10  PCGenVector<float> state      (24B) getState returns &this+0x10
//   +0x28  PCGenVector<float> goal       (24B)
//   +0x40  PCGenVector<float> x          (24B) — the current parameter vector
//   +0x58  PCGenVector<float> trust      (24B)
//   +0x70  PCGenVector<float> delta      (24B) — LM step vector (5th slot)
//   +0x88  (8B tail — unused in these methods; solve does not read/write)
//   +0x90  u32   stateSize               cached from setState (0x8 of arg)
//   +0x94  u32   goalSize                cached from setGoal  (0x8 of arg)
//   +0x98  u32   configA         = 6     (from 0x4b00000006 init)
//   +0x9c  u32   maxIterations   = 0x4B  (75, tested by solve @0xb705f)
//   +0xa0  double epsilonSeed  = <0x3c23d70a3a83126f>  (see below)
//   +0xa8  u8    doneFlag       = 0
//
// PCGenVector<float> layout (24B) — recovered from PCGenBlockRef<float>
// accessors used in setState/setGoal/setTrust and computeEpsilon:
//   +0x00  char** blockRef               PCGenBlockRef internal handle
//   +0x08  u32   size (element count)
//   +0x0c  u32   strideOrCountFlag       (=1 for unit-strided contiguous;
//                                         computeEpsilon fast-paths on
//                                         `(size^1)|(otherStride^1)==0`)
//   +0x10  float* data                   dereferenced backing buffer
//   (total 24 bytes; refcount lives at data[-1] as an int32, per the
//   dtor pattern `decl -0x4(%rdi); jne skip; addq $-0x8,%rdi; call _ZdaPv`.)
//
// ================================================================
// FRONTIER CALLEES (external symbols invoked; not decoded here):
//
//   __ZN13PCGenBlockRefIfEC2Ei     PCGenBlockRef<float>::PCGenBlockRef(int)
//                                  @ProCore (stub) — allocate ref block for N floats
//   __ZN13PCGenBlockRefIPcE6assignEPS0_
//                                  PCGenBlockRef<char*>::assign(char**)
//                                  @ProCore (stub) — copy a block-ref handle
//   __ZN11PCGenVectorIfE6uniqueEv  PCGenVector<float>::unique()
//                                  @ProCore (stub) — COW-detach the vector
//   __Z13_vector_norm2IKfET_PS1_i  _vector_norm2<const float>(const float*,int)
//                                  @ProCore (stub) — squared L2 norm
//   __ZdaPv                        operator delete[](void*)   @ProCore stub
//   __ZdlPv                        operator delete(void*)     @ProCore stub
//   solve() also calls (via PCLMProblem's vtable):
//     *0x10 problem->setX(x)      pure-virtual slot 0
//     *0x18 problem->evalY(y)     pure-virtual slot 1
//     *0x20 problem->evalDy(J)    pure-virtual slot 2
//
// ================================================================
// Sibling classes referenced but NOT ported here (one class per file):
//   PCLMProblem      — infra/PCLMProblem.ts (ALREADY PORTED)
//   PCGenVector<T>   — NOT YET PORTED (frontier)
//   PCGenMatrix<T>   — NOT YET PORTED (frontier)
//   PCGenBlockRef<T> — NOT YET PORTED (frontier)
//   PCMatrixErrorException — NOT YET PORTED (referenced by solve @0xb6f9e)

import { PCLMProblem } from "./PCLMProblem";

// -------------------------------------------------------------------------
// Frontier-callee throwing stubs. Each cites its @0xADDR so the frontier
// tracker sees the gap. When the real symbol is ported, callers switch to
// the imported implementation.
// -------------------------------------------------------------------------

/**
 * `PCGenBlockRef<float>::PCGenBlockRef(int)` — allocates a refcounted block
 * of N floats and installs the handle in `this[+0]`. Called at solve()
 * @0xb70ae and computeEpsilon() @0xb6ebf.
 * Not yet transcribed. Symbol __ZN13PCGenBlockRefIfEC2Ei @ProCore; the
 * stub raises citing @0xb6ebf and @0xb70ae as the two call sites.
 */
function PCGenBlockRef_float_ctor(_thisPtr: unknown, _count: number): void {
  throw new Error(
    "PCGenBlockRef<float>::PCGenBlockRef(int) @ProCore __ZN13PCGenBlockRefIfEC2Ei " +
      "not yet transcribed (called @0xb6ebf, @0xb70ae)",
  );
}

/**
 * `PCGenBlockRef<char*>::assign(char**)` — copies a block-ref handle into
 * `this`. Called from setState @0xb6e45, setGoal @0xb6e09, setTrust @0xb6e8b.
 * Not yet transcribed. Stub throws citing its @0xb6e09 (symbol
 * __ZN13PCGenBlockRefIPcE6assignEPS0_ @ProCore).
 */
function PCGenBlockRef_charstar_assign(
  _thisPtr: unknown,
  _srcPtr: unknown,
): void {
  throw new Error(
    "PCGenBlockRef<char*>::assign(char**) @ProCore __ZN13PCGenBlockRefIPcE6assignEPS0_ " +
      "not yet transcribed (called @0xb6e09, @0xb6e45, @0xb6e8b)",
  );
}

/**
 * `_vector_norm2<const float>(const float* v, int n)` — returns the sum of
 * squares of `n` floats starting at `v` (a single-precision reduction).
 * Called from computeEpsilon @0xb6f4e. Not yet transcribed. Stub throws
 * citing its @0xb6f4e (symbol __Z13_vector_norm2IKfET_PS1_i @ProCore).
 */
function _vector_norm2(_data: unknown, _n: number): number {
  throw new Error(
    "_vector_norm2<const float>(const float*, int) @ProCore __Z13_vector_norm2IKfET_PS1_i " +
      "not yet transcribed (called @0xb6f4e)",
  );
}

/**
 * `operator delete[](void*)` — Itanium ABI @ProCore stub 0xde6ba. Not
 * decoded here; the dtor path releases refcounted blocks through it. Stub
 * throws citing its @0xde6ba.
 */
function operator_delete_array(_p: unknown): void {
  throw new Error(
    "operator delete[](void*) @ProCore stub 0xde6ba (__ZdaPv) not yet transcribed",
  );
}

// -------------------------------------------------------------------------
// PCGenVector<float> — 24-byte "view" struct. Modeled as a plain object
// with the four exact fields recovered from the disassembly. Not a full
// port (its methods live in the PCGenVector.ts file, which is on the
// frontier). This shape lets PCLMSolver read the field offsets faithfully.
// -------------------------------------------------------------------------
export interface PCGenVectorFloatShape {
  /** +0x00  char** blockRef  (PCGenBlockRef internal handle). */
  blockRef_at_0x00: unknown;
  /** +0x08  u32 size (element count). */
  size_at_0x08: number;
  /** +0x0c  u32 strideOrCountFlag (=1 for unit-strided contiguous). */
  strideFlag_at_0x0c: number;
  /** +0x10  float* data (dereferenced backing buffer, Float32Array here). */
  data_at_0x10: Float32Array | null;
}

// -------------------------------------------------------------------------
// PCLMSolver
// -------------------------------------------------------------------------

/**
 * ProCore's Levenberg–Marquardt solver. The class holds five 24-byte
 * float-vector slots (state, goal, x, trust, delta), a pointer to the
 * abstract `PCLMProblem` supplying setX/evalY/evalDy, and a small block
 * of scalar configuration (iteration cap, epsilon seed, done flag).
 *
 * @ProCore class defined by ctor @0xb6c78 and dtor @0xb6d00.
 */
export class PCLMSolver {
  /** +0x00  vptr — installed by ctor @0xb6c7c..@0xb6c83. */
  vptr_at_0x00: string = "__ZTV10PCLMSolver+0x10";

  /**
   * +0x08  PCLMProblem* problem — written only by setProblem @0xb6de2
   * (`movq %rsi, 0x8(%rdi)`) and read by solve at every iteration.
   * NOTE: ctor also clears +0x08..+0x18 via `movups %xmm0, 0x8(%rdi)`
   * @0xb6cd1, so the pointer starts null.
   */
  problem_at_0x08: PCLMProblem | null = null;

  /** +0x10  state vector (returned by getState). Ctor @0xb6c90 writes
   *  0x100000000 to 0x18 -> (size=0, strideFlag=1). @0xb6cd1 zeroes the
   *  blockRef slot at 0x10. */
  state_at_0x10: PCGenVectorFloatShape = {
    blockRef_at_0x00: null,
    size_at_0x08: 0,
    strideFlag_at_0x0c: 1,
    data_at_0x10: null,
  };

  /** +0x28  goal vector. Ctor @0xb6c97 zeroes 0x20..0x30, then @0xb6c9b
   *  writes 0x100000000 to 0x30 -> (size=0, strideFlag=1). */
  goal_at_0x28: PCGenVectorFloatShape = {
    blockRef_at_0x00: null,
    size_at_0x08: 0,
    strideFlag_at_0x0c: 1,
    data_at_0x10: null,
  };

  /** +0x40  x (current parameter) vector. Ctor @0xb6c9f zeroes 0x38..0x48,
   *  then @0xb6ca3 writes 0x100000000 to 0x48 -> (size=0, strideFlag=1). */
  x_at_0x40: PCGenVectorFloatShape = {
    blockRef_at_0x00: null,
    size_at_0x08: 0,
    strideFlag_at_0x0c: 1,
    data_at_0x10: null,
  };

  /** +0x58  trust vector. Ctor @0xb6ca7 zeroes 0x50..0x60, then @0xb6cab
   *  writes 0x100000000 to 0x60 -> (size=0, strideFlag=1). */
  trust_at_0x58: PCGenVectorFloatShape = {
    blockRef_at_0x00: null,
    size_at_0x08: 0,
    strideFlag_at_0x0c: 1,
    data_at_0x10: null,
  };

  /** +0x70  delta vector (LM step). Ctor @0xb6caf zeroes 0x68..0x78, then
   *  @0xb6cb5 writes 0 to 0x78 -> (size=0, strideFlag=0). NOTE: unlike
   *  the other four, delta's strideFlag starts at 0, not 1. */
  delta_at_0x70: PCGenVectorFloatShape = {
    blockRef_at_0x00: null,
    size_at_0x08: 0,
    strideFlag_at_0x0c: 0,
    data_at_0x10: null,
  };

  /** +0x88  tail slot (8B). Ctor @0xb6cca writes 0. Not touched by any
   *  of the small methods; solve's use (if any) is inside the un-ported
   *  body. Modeled as an opaque int64 = 0. */
  tail_at_0x88: bigint = 0n;

  /** +0x90  u32 stateSize — cached by setState @0xb6e55 as `state.size`.
   *  Ctor starts it at 0 (the tail bytes are untouched by the ctor at
   *  this address; setState always writes before solve reads it). */
  stateSize_at_0x90: number = 0;

  /** +0x94  u32 goalSize — cached by setGoal @0xb6e19 as `goal.size`. */
  goalSize_at_0x94: number = 0;

  /** +0x98  u32 configA — initialized to 6 via `movabsq $0x4b00000006`
   *  @0xb6cd5/@0xb6cdf. Purpose not yet decoded (solve reads elsewhere). */
  configA_at_0x98: number = 6;

  /** +0x9c  u32 maxIterations — initialized to 0x4B=75 via the same
   *  0x4b00000006 store @0xb6cdf (upper 4 bytes). solve tests this at
   *  @0xb705f: `cmpl 0x9c(%rbx), %r13d ; jge <exit>`. */
  maxIterations_at_0x9c: number = 0x4b;

  /** +0xa0  double epsilonSeed — initialized from RIP-relative constant
   *  load @0xb6ce6 (`movsd 0x714c2(%rip), %xmm0` -> target address
   *  0xb6cee + 0x714c2 = 0x1281b0). Raw u64 bits at 0x1281b0 are
   *  0x3c23d70a3a83126f (double interpretation = 5.377642728223711e-19;
   *  the value's precise numerical role is inside the un-ported solve
   *  body). Value cited from `resolve.py ProCore const 0x1281b0`. */
  epsilonSeed_at_0xa0: number = 5.377642728223711e-19; // u64 bits 0x3c23d70a3a83126f @0x1281b0

  /** +0xa8  u8 doneFlag — initialized to 0 via `movb $0x0, 0xa8(%rdi)`
   *  @0xb6cf6. Set by solve on convergence. */
  doneFlag_at_0xa8: number = 0;

  /**
   * `PCLMSolver::PCLMSolver()` C1 @ProCore 0xb6c78 (__ZN10PCLMSolverC1Ev).
   *
   * Full body (all @ProCore):
   *   0xb6c78  pushq %rbp / movq %rsp, %rbp
   *   0xb6c7c  leaq  0x95afd(%rip), %rax   ; rax = 0xb6c83+0x95afd = 0x14c780
   *                                          = __ZTV10PCLMSolver + 0x10
   *   0xb6c83  movq  %rax, (%rdi)          ; this[+0x00] = vptr
   *   0xb6c86  movabsq $0x100000000, %rax  ; imm64
   *   0xb6c90  movq  %rax, 0x18(%rdi)      ; state.size=0, state.stride=1
   *   0xb6c94  xorps %xmm0, %xmm0
   *   0xb6c97  movups %xmm0, 0x20(%rdi)    ; zero 0x20..0x30 (state.data
   *                                          tail + goal.blockRef)
   *   0xb6c9b  movq  %rax, 0x30(%rdi)      ; goal.size=0, goal.stride=1
   *   0xb6c9f  movups %xmm0, 0x38(%rdi)    ; zero 0x38..0x48
   *   0xb6ca3  movq  %rax, 0x48(%rdi)      ; x.size=0, x.stride=1
   *   0xb6ca7  movups %xmm0, 0x50(%rdi)    ; zero 0x50..0x60
   *   0xb6cab  movq  %rax, 0x60(%rdi)      ; trust.size=0, trust.stride=1
   *   0xb6caf  movups %xmm0, 0x68(%rdi)    ; zero 0x68..0x78
   *   0xb6cb3  xorl  %eax, %eax
   *   0xb6cb5  movq  %rax, 0x78(%rdi)      ; delta.size=0, delta.stride=0
   *   0xb6cb9  movabsq $0x100000001, %rcx  ; imm64
   *   0xb6cc3  movq  %rcx, 0x80(%rdi)      ; 8B at 0x80 -> low32=1, high32=1
   *   0xb6cca  movq  %rax, 0x88(%rdi)      ; tail = 0
   *   0xb6cd1  movups %xmm0, 0x8(%rdi)     ; zero 0x08..0x18 (problem ptr
   *                                          + state.blockRef)
   *   0xb6cd5  movabsq $0x4b00000006, %rax ; imm64
   *   0xb6cdf  movq  %rax, 0x98(%rdi)      ; configA=6, maxIter=0x4b
   *   0xb6ce6  movsd 0x714c2(%rip), %xmm0  ; xmm0 = *(double*)0x1281b0
   *                                          = 5.377642728223711e-19
   *   0xb6cee  movsd %xmm0, 0xa0(%rdi)     ; epsilonSeed = xmm0
   *   0xb6cf6  movb  $0x0, 0xa8(%rdi)      ; doneFlag = 0
   *   0xb6cfd  popq  %rbp / retq
   *
   * The C2 (base ctor) at @0xb6bc2 is a byte-identical body — the linker
   * emits both to satisfy the Itanium ABI (no virtual bases -> C1 == C2).
   * Field defaults declared on the class fields above reproduce every
   * store in this ctor; the constructor body simply asserts nothing else.
   */
  constructor() {
    // All initialization is expressed via the field declarations above;
    // each is annotated with the exact @0xADDR whose store produced it.
    // The compiler-emitted body of ctor C1 has no branches or side
    // effects beyond those stores, so the body here is intentionally empty.
  }

  /**
   * `PCLMSolver::setProblem(PCLMProblem*)` @ProCore 0xb6dde
   * (__ZN10PCLMSolver10setProblemEP11PCLMProblem).
   *
   * Full body:
   *   0xb6dde  pushq %rbp / movq %rsp, %rbp
   *   0xb6de2  movq  %rsi, 0x8(%rdi)   ; this->problem = arg
   *   0xb6de6  popq  %rbp / retq
   */
  setProblem(p: PCLMProblem | null): void {
    // @0xb6de2 — store the pointer at +0x08. No refcount / null-check.
    this.problem_at_0x08 = p;
  }

  /**
   * `PCLMSolver::setGoal(PCGenVector<float> const&)` @ProCore 0xb6de8
   * (__ZN10PCLMSolver7setGoalERK11PCGenVectorIfE).
   *
   * Full body:
   *   0xb6de8  pushq %rbp / movq %rsp, %rbp / pushq %r14 / pushq %rbx
   *   0xb6def  movq  %rdi, %rbx                ; rbx = this
   *   0xb6df2  addq  $0x28, %rdi               ; rdi = &this->goal
   *   0xb6df6  cmpq  %rdi, %rsi                ; compare arg to &goal
   *   0xb6df9  je    0xb6e16                   ; self-assign guard
   *   0xb6dfb  movq  %rsi, %r14
   *   0xb6dfe  movq  0x8(%rsi), %rax
   *   0xb6e02  movq  %rax, 0x30(%rbx)          ; goal.size|stride = arg.size|stride
   *   0xb6e06  movq  (%rsi), %rsi
   *   0xb6e09  callq __ZN13PCGenBlockRefIPcE6assignEPS0_
   *                                            ; goal.blockRef.assign(arg.blockRef)
   *   0xb6e0e  movq  0x10(%r14), %rax
   *   0xb6e12  movq  %rax, 0x38(%rbx)          ; goal.data = arg.data
   *   0xb6e16  movl  0x30(%rbx), %eax
   *   0xb6e19  movl  %eax, 0x94(%rbx)          ; goalSize = goal.size (low 32b)
   *   0xb6e1f  popq  %rbx / popq %r14 / popq %rbp / retq
   *
   * Note: the "self-assign" fast path skips the blockRef copy but still
   * caches the size at 0x94 unconditionally.
   */
  setGoal(v: PCGenVectorFloatShape): void {
    // @0xb6df6..@0xb6df9 — self-assign guard: if arg IS the goal slot, skip.
    if (v !== this.goal_at_0x28) {
      // @0xb6dfe..@0xb6e02 — copy size and strideFlag together (8B move
      // of arg[+0x8..+0x10] into this->goal[+0x8..+0x10]).
      this.goal_at_0x28.size_at_0x08 = v.size_at_0x08;
      this.goal_at_0x28.strideFlag_at_0x0c = v.strideFlag_at_0x0c;
      // @0xb6e06..@0xb6e09 — blockRef handle copy through
      // PCGenBlockRef<char*>::assign. Emitted as a throwing frontier stub.
      PCGenBlockRef_charstar_assign(this.goal_at_0x28.blockRef_at_0x00, v.blockRef_at_0x00);
      // @0xb6e0e..@0xb6e12 — copy the raw data pointer at +0x10.
      this.goal_at_0x28.data_at_0x10 = v.data_at_0x10;
    }
    // @0xb6e16..@0xb6e19 — cache goal.size (low 32 bits) at 0x94.
    this.goalSize_at_0x94 = this.goal_at_0x28.size_at_0x08 >>> 0;
  }

  /**
   * `PCLMSolver::setState(PCGenVector<float> const&)` @ProCore 0xb6e24
   * (__ZN10PCLMSolver8setStateERK11PCGenVectorIfE).
   *
   * Full body:
   *   0xb6e24  pushq %rbp / movq %rsp, %rbp / pushq %r14 / pushq %rbx
   *   0xb6e2b  movq  %rdi, %rbx                ; rbx = this
   *   0xb6e2e  addq  $0x10, %rdi               ; rdi = &this->state
   *   0xb6e32  cmpq  %rdi, %rsi
   *   0xb6e35  je    0xb6e52                   ; self-assign guard
   *   0xb6e37  movq  %rsi, %r14
   *   0xb6e3a  movq  0x8(%rsi), %rax
   *   0xb6e3e  movq  %rax, 0x18(%rbx)          ; state.size|stride = arg.size|stride
   *   0xb6e42  movq  (%rsi), %rsi
   *   0xb6e45  callq __ZN13PCGenBlockRefIPcE6assignEPS0_
   *                                            ; state.blockRef.assign(arg.blockRef)
   *   0xb6e4a  movq  0x10(%r14), %rax
   *   0xb6e4e  movq  %rax, 0x20(%rbx)          ; state.data = arg.data
   *   0xb6e52  movl  0x18(%rbx), %eax
   *   0xb6e55  movl  %eax, 0x90(%rbx)          ; stateSize = state.size
   *   0xb6e5b  popq  %rbx / popq %r14 / popq %rbp / retq
   *
   * Structurally identical to setGoal, just at offsets 0x10 vs 0x28 and
   * caches to 0x90 vs 0x94.
   */
  setState(v: PCGenVectorFloatShape): void {
    // @0xb6e32..@0xb6e35 — self-assign guard.
    if (v !== this.state_at_0x10) {
      // @0xb6e3a..@0xb6e3e — copy size + strideFlag (8B).
      this.state_at_0x10.size_at_0x08 = v.size_at_0x08;
      this.state_at_0x10.strideFlag_at_0x0c = v.strideFlag_at_0x0c;
      // @0xb6e42..@0xb6e45 — blockRef handle assign (frontier stub).
      PCGenBlockRef_charstar_assign(this.state_at_0x10.blockRef_at_0x00, v.blockRef_at_0x00);
      // @0xb6e4a..@0xb6e4e — copy raw data pointer.
      this.state_at_0x10.data_at_0x10 = v.data_at_0x10;
    }
    // @0xb6e52..@0xb6e55 — cache state.size (low 32 bits) at 0x90.
    this.stateSize_at_0x90 = this.state_at_0x10.size_at_0x08 >>> 0;
  }

  /**
   * `PCLMSolver::getState()` @ProCore 0xb6e60
   * (__ZN10PCLMSolver8getStateEv).
   *
   * Full body:
   *   0xb6e60  pushq %rbp / movq %rsp, %rbp
   *   0xb6e64  leaq  0x10(%rdi), %rax          ; rax = &this->state
   *   0xb6e68  popq  %rbp / retq
   *
   * Returns a raw pointer to the internal state vector — no copy, no
   * refcount manipulation. Callers observe live changes.
   */
  getState(): PCGenVectorFloatShape {
    // @0xb6e64 — return &this[+0x10] i.e. the state slot.
    return this.state_at_0x10;
  }

  /**
   * `PCLMSolver::setTrust(PCGenVector<float> const&)` @ProCore 0xb6e6a
   * (__ZN10PCLMSolver8setTrustERK11PCGenVectorIfE).
   *
   * Full body:
   *   0xb6e6a  pushq %rbp / movq %rsp, %rbp / pushq %r14 / pushq %rbx
   *   0xb6e71  movq  %rdi, %rbx                ; rbx = this
   *   0xb6e74  addq  $0x58, %rdi               ; rdi = &this->trust
   *   0xb6e78  cmpq  %rdi, %rsi
   *   0xb6e7b  je    0xb6e98                   ; self-assign guard
   *   0xb6e7d  movq  %rsi, %r14
   *   0xb6e80  movq  0x8(%rsi), %rax
   *   0xb6e84  movq  %rax, 0x60(%rbx)          ; trust.size|stride = arg.size|stride
   *   0xb6e88  movq  (%rsi), %rsi
   *   0xb6e8b  callq __ZN13PCGenBlockRefIPcE6assignEPS0_
   *                                            ; trust.blockRef.assign(arg.blockRef)
   *   0xb6e90  movq  0x10(%r14), %rax
   *   0xb6e94  movq  %rax, 0x68(%rbx)          ; trust.data = arg.data
   *   0xb6e98  popq  %rbx / popq %r14 / popq %rbp / retq
   *
   * DIFFERENCE FROM setState/setGoal: setTrust does NOT cache a size to
   * any tail slot — there is no `movl ..., 0xNN(%rbx)` after the join.
   * The trust region size travels solely inside the trust vector.
   */
  setTrust(v: PCGenVectorFloatShape): void {
    // @0xb6e78..@0xb6e7b — self-assign guard.
    if (v !== this.trust_at_0x58) {
      // @0xb6e80..@0xb6e84 — copy size + strideFlag (8B).
      this.trust_at_0x58.size_at_0x08 = v.size_at_0x08;
      this.trust_at_0x58.strideFlag_at_0x0c = v.strideFlag_at_0x0c;
      // @0xb6e88..@0xb6e8b — blockRef handle assign (frontier stub).
      PCGenBlockRef_charstar_assign(this.trust_at_0x58.blockRef_at_0x00, v.blockRef_at_0x00);
      // @0xb6e90..@0xb6e94 — copy raw data pointer.
      this.trust_at_0x58.data_at_0x10 = v.data_at_0x10;
    }
    // @0xb6e98 — no size cache; return.
  }

  /**
   * `PCLMSolver::computeEpsilon(PCGenVector<float> const&)` @ProCore 0xb6e9e
   * (__ZN10PCLMSolver14computeEpsilonERK11PCGenVectorIfE).
   *
   * Signature: returns a float (`xmm0`) = the L2 norm of `arg - goal`,
   * where `goal` is the internally stored goal vector (this[+0x28]).
   *
   * Full body:
   *   0xb6e9e  pushq %rbp / mov %rsp,%rbp / pushq r15,r14,r12,rbx / subq $0x20,%rsp
   *   0xb6ead  movq  %rsi, %r14                 ; r14 = &arg
   *   0xb6eb0  movq  %rdi, %r15                 ; r15 = this
   *   0xb6eb3  movl  0x8(%rsi), %ebx            ; ebx = arg.size
   *   0xb6eb6  leaq  -0x40(%rbp), %r12          ; r12 = &tmp (24B stack vector)
   *   0xb6eba  movq  %r12, %rdi
   *   0xb6ebd  movl  %ebx, %esi
   *   0xb6ebf  callq __ZN13PCGenBlockRefIfEC2Ei ; tmp.blockRef = alloc(N floats)
   *   0xb6ec4  movl  %ebx, 0x8(%r12)            ; tmp.size = N
   *   0xb6ec9  movl  $0x1, 0xc(%r12)            ; tmp.strideFlag = 1
   *   0xb6ed2  movq  (%r12), %rdi               ; rdi = tmp.blockRef.data (float*)
   *   0xb6ed6  movq  %rdi, 0x10(%r12)           ; tmp.data = tmp.blockRef.data
   *
   *   0xb6edb  movl  0x8(%r14), %eax            ; eax = N (arg.size)
   *   0xb6edf  movq  0x10(%r14), %rcx           ; rcx = arg.data
   *   0xb6ee3  movslq 0xc(%r14), %rsi           ; rsi = sign-ext arg.strideFlag
   *   0xb6ee7  movq  0x38(%r15), %rdx           ; rdx = this->goal.data
   *   0xb6eeb  movslq 0x34(%r15), %r8           ; r8  = sign-ext goal.strideFlag
   *   0xb6eef  movl  %esi, %r9d                 ; r9d  = argStride
   *   0xb6ef2  xorl  $0x1, %r9d                 ; r9d ^= 1  (0 if stride==1)
   *   0xb6ef6  movl  %r8d, %r10d                ; r10d = goalStride
   *   0xb6ef9  xorl  $0x1, %r10d                ; r10d ^= 1 (0 if stride==1)
   *   0xb6efd  orl   %r9d, %r10d                ; r10d = OR of the two xors
   *   0xb6f00  jne   0xb6f21                    ; if either stride != 1 -> strided path
   *
   *   ; -------- FAST (unit-stride) path @0xb6f02..@0xb6f1f --------
   *   0xb6f02  testl %eax, %eax
   *   0xb6f04  jle   0xb6f4c                    ; if N<=0 -> skip loop
   *   0xb6f06  xorl  %esi, %esi                 ; i = 0
   *   0xb6f08  movss (%rcx,%rsi,4), %xmm0       ; xmm0 = arg[i]
   *   0xb6f0d  subss (%rdx,%rsi,4), %xmm0       ; xmm0 -= goal[i]
   *   0xb6f12  movss %xmm0, (%rdi,%rsi,4)       ; tmp[i] = xmm0
   *   0xb6f17  incq  %rsi
   *   0xb6f1a  cmpq  %rsi, %rax
   *   0xb6f1d  jne   0xb6f08
   *   0xb6f1f  jmp   0xb6f4c
   *
   *   ; -------- SLOW (arbitrary-stride) path @0xb6f21..@0xb6f4a --------
   *   0xb6f21  testl %eax, %eax
   *   0xb6f23  jle   0xb6f4c
   *   0xb6f25  shlq  $0x2, %r8                  ; goalStrideBytes = goalStride*4
   *   0xb6f29  shlq  $0x2, %rsi                 ; argStrideBytes  = argStride*4
   *   0xb6f2d  xorl  %r9d, %r9d                 ; i = 0
   *   0xb6f30  movss (%rcx), %xmm0              ; xmm0 = *argPtr
   *   0xb6f34  subss (%rdx), %xmm0              ; xmm0 -= *goalPtr
   *   0xb6f38  movss %xmm0, (%rdi,%r9,4)        ; tmp[i] = xmm0  (tmp is unit-strided)
   *   0xb6f3e  incq  %r9
   *   0xb6f41  addq  %r8, %rdx                  ; goalPtr += goalStrideBytes
   *   0xb6f44  addq  %rsi, %rcx                 ; argPtr  += argStrideBytes
   *   0xb6f47  cmpq  %r9, %rax
   *   0xb6f4a  jne   0xb6f30
   *
   *   ; -------- reduction @0xb6f4c --------
   *   0xb6f4c  movl  %ebx, %esi                 ; esi = N
   *   0xb6f4e  callq __Z13_vector_norm2IKfET_PS1_i
   *                                             ; xmm0 = sum(tmp[i]^2)
   *   0xb6f53  movq  -0x40(%rbp), %rdi          ; rdi = tmp.blockRef
   *   0xb6f57  testq %rdi, %rdi
   *   0xb6f5a  je    0xb6f74                    ; skip refcount decrement if null
   *   0xb6f5c  decl  -0x4(%rdi)                 ; if --refcount != 0 skip free
   *   0xb6f5f  jne   0xb6f74
   *   0xb6f61  addq  $-0x8, %rdi                ; rewind to block header
   *   0xb6f65  movss %xmm0, -0x24(%rbp)         ; save xmm0 across the call
   *   0xb6f6a  callq __ZdaPv                    ; operator delete[]
   *   0xb6f6f  movss -0x24(%rbp), %xmm0         ; restore xmm0
   *   0xb6f74  sqrtss %xmm0, %xmm0              ; xmm0 = sqrt(xmm0)
   *   0xb6f78..0xb6f84  epilogue / retq
   *
   * NOTE: `sqrtss` and `subss`/`movss` are single-precision — every scalar
   * op here operates on 32-bit floats. Per PORTING_SPEC Rule 4 the port
   * wraps the arithmetic in `Math.fround` to match the machine's numerics.
   *
   * Because the buffer scratch/refcount/free/blockRef paths call frontier
   * stubs (PCGenBlockRef_float_ctor, _vector_norm2, operator_delete_array)
   * that are not yet transcribed, this method throws (@0xb6ebf's frontier
   * call) through the first frontier call it makes. The control flow above
   * is written faithfully so that when the frontier callees are ported,
   * THIS body starts working with no further edits.
   */
  computeEpsilon(v: PCGenVectorFloatShape): number {
    // @0xb6eb3 — N = arg.size.
    const N = v.size_at_0x08 >>> 0;

    // @0xb6eb6..@0xb6ed6 — allocate a scratch 24B vector `tmp` on the
    // stack, then call PCGenBlockRef<float>::PCGenBlockRef(N) to bind
    // an N-float buffer. tmp.size=N, tmp.strideFlag=1, tmp.data = the
    // freshly-allocated buffer.
    const tmp: PCGenVectorFloatShape = {
      blockRef_at_0x00: null,
      size_at_0x08: N,
      strideFlag_at_0x0c: 1,
      data_at_0x10: null,
    };
    // @0xb6ebf — ctor call (frontier stub throws until PCGenBlockRef ported).
    PCGenBlockRef_float_ctor(tmp, N);

    // The remainder of the body is transcribed even though it is
    // unreachable via the throw above — this preserves the FCP control
    // flow verbatim. When PCGenBlockRef_float_ctor is ported, execution
    // reaches these lines.
    const argData = v.data_at_0x10;
    const goalData = this.goal_at_0x28.data_at_0x10;
    // @0xb6ed6 — after the ctor, tmp.data is set to the block's floats.
    const tmpData = tmp.data_at_0x10;
    if (argData === null || goalData === null || tmpData === null) {
      // Defensive re-throw citing the exact @0xADDR whose load would have
      // dereferenced the null pointer — the disassembly does not check
      // for null; a null here is a programmer contract violation.
      throw new Error(
        "PCLMSolver::computeEpsilon @ProCore 0xb6e9e — null vector.data " +
          "(arg or goal or tmp buffer not bound before subtraction @0xb6f08)",
      );
    }
    const argStride = v.strideFlag_at_0x0c | 0;  // @0xb6ee3 movslq
    const goalStride = this.goal_at_0x28.strideFlag_at_0x0c | 0; // @0xb6eeb movslq
    // @0xb6ef2..@0xb6f00 — decide fast vs slow path.
    const bothUnit = ((argStride ^ 1) | (goalStride ^ 1)) === 0;
    if (bothUnit) {
      // @0xb6f02..@0xb6f1d — unit-stride subtraction into tmp.
      for (let i = 0; i < N; i++) {
        // Each op is 32-bit float per the `subss` opcode; Math.fround
        // enforces that at every intermediate step (PORTING_SPEC Rule 4).
        tmpData[i] = Math.fround(Math.fround(argData[i]) - Math.fround(goalData[i]));
      }
    } else {
      // @0xb6f21..@0xb6f4a — arbitrary-stride path. The C++ used raw
      // byte-pointer arithmetic (argPtr += stride*4). In the TS port
      // the stride is expressed in element units directly (data arrays
      // are Float32Array-indexed, not char*). No behavioral difference.
      let argPos = 0;
      let goalPos = 0;
      for (let i = 0; i < N; i++) {
        tmpData[i] = Math.fround(Math.fround(argData[argPos]) - Math.fround(goalData[goalPos]));
        argPos += argStride;
        goalPos += goalStride;
      }
    }
    // @0xb6f4e — sum-of-squares reduction (frontier stub throws).
    const n2 = _vector_norm2(tmpData, N);
    // @0xb6f53..@0xb6f6f — refcount decrement + operator delete[].
    // The block-ref release path is expressed here for provenance; the
    // frontier stubs throw, so this code is only reachable once ported.
    if (tmp.blockRef_at_0x00 !== null) {
      // @0xb6f5c: `decl -0x4(%rdi)` — decrement the int32 refcount at
      // data[-1]. Modeled as an opaque frontier call because the header
      // layout is owned by PCGenBlockRef, not by this class.
      operator_delete_array(tmp.blockRef_at_0x00);
      tmp.blockRef_at_0x00 = null;
    }
    // @0xb6f74 — sqrtss xmm0, xmm0. Single-precision sqrt.
    return Math.fround(Math.sqrt(Math.fround(n2)));
  }

  /**
   * `PCLMSolver::solve()` @ProCore 0xb6f9e (__ZN10PCLMSolver5solveEv).
   *
   * Full LM iteration loop (891 lines of disassembly @0xb6f9e..@0xb7b25).
   * Not yet transcribed — it depends on:
   *   - PCGenVector<float>::unique  @ProCore stub (COW-detach)
   *   - PCGenMatrix<float> operations (evalDy target, un-ported)
   *   - PCMatrixErrorException throw path (un-ported)
   *   - the Cholesky/LU solve inside the LM inner loop (un-ported)
   * The vtable calls it makes on `this->problem` (an abstract PCLMProblem*)
   * are:
   *   *0x10  problem->setX(this->state)    (call site @0xb6fc7)
   *   *0x18  problem->evalY(&this->x)      (call site @0xb6fd8)
   *   *0x20  problem->evalDy(&this->delta) (call site @0xb7099)
   * The outer loop iterates while `r13d < this->maxIterations_at_0x9c`
   * (test @0xb705f), matching a standard LM iterate-until-converged shape.
   *
   * Per PORTING_SPEC Rule 3, the body throws citing its @0xADDR until the
   * frontier callees are ported.
   */
  solve(): void {
    throw new Error(
      "PCLMSolver::solve() @ProCore 0xb6f9e not yet transcribed — the LM " +
        "iteration loop depends on PCGenVector<float>::unique @0xb6fde, " +
        "PCGenMatrix<float> operations (frontier), PCMatrixErrorException " +
        "(frontier), and the un-ported Cholesky/LU inner solve. The three " +
        "PCLMProblem vtable calls it dispatches (setX *0x10 @0xb6fc7, " +
        "evalY *0x18 @0xb6fd8, evalDy *0x20 @0xb7099) are transcribed here " +
        "purely as provenance.",
    );
  }

  /**
   * `PCLMSolver::~PCLMSolver()` D2 (base dtor) @ProCore 0xb6d00
   * (__ZN10PCLMSolverD2Ev).
   *
   * Full body:
   *   0xb6d00  pushq %rbp / movq %rsp, %rbp / pushq %rbx / pushq %rax
   *   0xb6d06  movq  %rdi, %rbx
   *   0xb6d09  leaq  0x95a70(%rip), %rax        ; rax = 0xb6d10+0x95a70 = 0x14c780
   *   0xb6d10  movq  %rax, (%rdi)               ; this->vptr = __ZTV10PCLMSolver+0x10
   *
   *   ; --- release delta (+0x70) ---
   *   0xb6d13  movq  0x70(%rdi), %rdi
   *   0xb6d17  testq %rdi, %rdi
   *   0xb6d1a  je    0xb6d32
   *   0xb6d1c  decl  -0x4(%rdi)
   *   0xb6d1f  jne   0xb6d32
   *   0xb6d21  addq  $-0x8, %rdi
   *   0xb6d25  callq __ZdaPv                    ; operator delete[]
   *   0xb6d2a  movq  $0x0, 0x70(%rbx)
   *
   *   ; --- release trust (+0x58) --- (same shape) ---
   *   0xb6d32..0xb6d49
   *
   *   ; --- release x (+0x40) ---
   *   0xb6d51..0xb6d68
   *
   *   ; --- release goal (+0x28) ---
   *   0xb6d70..0xb6d87
   *
   *   ; --- release state (+0x10) ---
   *   0xb6d8f..0xb6da6
   *
   *   0xb6dae  epilogue / retq
   *
   * Ordering: delta -> trust -> x -> goal -> state (reverse construction
   * order, per C++ ABI). Each slot's `blockRef` at +0 is treated as a
   * `char*` with an int32 refcount at `[-4]`; when the decrement reaches
   * zero the block is freed via `operator delete[]` on `blockRef - 8`.
   */
  destructor_D2(): void {
    // @0xb6d09..@0xb6d10 — re-install the vtable pointer. This is the
    // standard Itanium ABI behavior in a destructor so that any virtual
    // call during teardown resolves to the class's own methods.
    this.vptr_at_0x00 = "__ZTV10PCLMSolver+0x10";

    // Release order (reverse of construction): delta, trust, x, goal,
    // state. Each release path calls a frontier stub, so this method
    // throws through the first slot with a non-null blockRef.
    const slots: PCGenVectorFloatShape[] = [
      this.delta_at_0x70, // @0xb6d13 first release slot
      this.trust_at_0x58, // @0xb6d32
      this.x_at_0x40,     // @0xb6d51
      this.goal_at_0x28,  // @0xb6d70
      this.state_at_0x10, // @0xb6d8f
    ];
    for (const s of slots) {
      // @0xb6d17: `testq %rdi, %rdi ; je skip` — null blockRef -> no work.
      if (s.blockRef_at_0x00 !== null) {
        // @0xb6d1c..@0xb6d25 — refcount decrement + conditional free
        // (`decl -0x4(%rdi) ; jne skip ; addq $-0x8, %rdi ; callq __ZdaPv`).
        // Modeled through the frontier stub, which throws.
        operator_delete_array(s.blockRef_at_0x00);
        // @0xb6d2a: `movq $0x0, 0xNN(%rbx)` — null the slot.
        s.blockRef_at_0x00 = null;
      }
    }
    // @0xb6dae..@0xb6db4 — epilogue.
  }

  /**
   * `PCLMSolver::~PCLMSolver()` D1 (complete dtor) @ProCore 0xb6db8
   * (__ZN10PCLMSolverD1Ev).
   *
   * Full body:
   *   0xb6db8  pushq %rbp / movq %rsp, %rbp
   *   0xb6dbc  popq  %rbp
   *   0xb6dbd  jmp   __ZN10PCLMSolverD2Ev
   *
   * Pure tail-call to D2 (there are no virtual bases; D1 == D2 modulo the
   * ABI-required distinct symbol). Modeled as a direct delegate.
   */
  destructor_D1(): void {
    // @0xb6dbd — jmp to D2.
    this.destructor_D2();
  }

  /**
   * `PCLMSolver::~PCLMSolver()` D0 (deleting dtor) @ProCore 0xb6dc2
   * (__ZN10PCLMSolverD0Ev).
   *
   * Full body:
   *   0xb6dc2  pushq %rbp / movq %rsp, %rbp / pushq %rbx / pushq %rax
   *   0xb6dc8  movq  %rdi, %rbx
   *   0xb6dcb  callq __ZN10PCLMSolverD2Ev       ; run base dtor
   *   0xb6dd0  movq  %rbx, %rdi
   *   0xb6dd3  addq  $0x8, %rsp / popq %rbx / popq %rbp
   *   0xb6dd9  jmp   __ZdlPv                    ; operator delete(this)
   *
   * The deleting variant runs D2, then hands `this` to `operator delete`.
   * In TS there is no per-instance operator delete — the runtime GCs. The
   * D2 call is modeled for provenance; the trailing operator-delete call
   * is documented here (see comment @0xb6dd9) rather than emitted, since
   * it has no JS equivalent.
   */
  destructor_D0(): void {
    // @0xb6dcb — run the base dtor first.
    this.destructor_D2();
    // @0xb6dd9 — `jmp __ZdlPv` (operator delete(void*) @ProCore stub
    // 0xde6c0). No JS equivalent; GC handles the storage. Documented
    // here so the vtable slot mapping remains faithful.
  }
}
