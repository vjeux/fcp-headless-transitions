// OZBSplineInterpolator — B-spline (NURB) keyframe interpolator (ProChannel.framework).
// Faithful transcription. Class enumerates 23 method addresses (raw-port/army/ledger/
// ProChannel.ledger.json under key "OZBSplineInterpolator"); this file ports:
//   - the pure-math pieces that don't depend on undecoded callees:
//       convertBSplineBiasToLinear @0x41cfa   (piecewise-rational bias remap; 19 lines, no calls)
//       useKeypoints              @0x42126   (returns 0)
//       evalBSplineNURB           @0x42704   (dot product: sum_i vals[i] * basis[i])
//   - the vector-math method that only depends on the NURB dot product / RIP-constants:
//       (none currently — evalBSplineNURB itself calls generateRationalBasisFunctions which is
//        undecoded here; we transcribe evalBSplineNURB's control flow and stub the callee).
// Everything else (init/interpolate/knot-vector generators/rational-basis/fillTempArrays/adjusted
// Min/Max U/ctors/dtors/operator=/operator==) currently touches undecoded callees (OZSpline
// virtual vtables, std::vector<double>::push_back, OZFigTimeForChannelSeconds, CMTime helpers,
// getVertexInputHandles/getValueV vtable slots, OZBezierInterpolator::computeTangents-style
// spline-neighbor lookups). Per PORTING_SPEC Rule 3, each such method is a stub whose error
// message cites its own @0xADDR so frontier.py can enumerate the gap.
//
// Decode evidence (all in this worktree):
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.convertBSplineBiasToLinear.s
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.useKeypoints.s
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.evalBSplineNURB.s
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.init.s
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.interpolate.s
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.generateOpenKnotVector.s
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.generatePeriodicKnotVector.s
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.generateRationalBasisFunctions.s
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.fillTempArrays.s
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.getAdjustedMinU.s
//   raw-port/re/disasm/ProChannel.OZBSplineInterpolator.getAdjustedMaxU.s
// RIP-relative constants resolved with `raw-port/army/tools/resolve.py ProChannel const <addr>`.

// ────────────────────────────────────────────────────────────────────────────────────────
// OZBSplineInterpolator::convertBSplineBiasToLinear(double u)  @ProChannel 0x41cfa
// ────────────────────────────────────────────────────────────────────────────────────────
// Full disassembly (19 lines, no callees):
//   0x41cfa  push %rbp ; mov %rsp,%rbp
//   0x41cfe  movapd %xmm0, %xmm1                 ; xmm1 = u   (input in xmm0)
//   0x41d02  movsd  0x6d81e(%rip), %xmm0         ; xmm0 = *0xaf528 = 1.0
//   0x41d0a  ucomisd %xmm1, %xmm0                ; flags <- xmm0 (1.0) vs xmm1 (u)
//   0x41d0e  jbe    0x41d26                      ; jump if CF|ZF (unordered OR 1.0 <= u)
//   0x41d10  movsd  0x6eae0(%rip), %xmm0         ; xmm0 = *0xb07f8 = 1.9
//   0x41d18  subsd  %xmm1, %xmm0                 ; xmm0 = 1.9 - u
//   0x41d1c  divsd  0x6eadc(%rip), %xmm0         ; xmm0 = (1.9 - u) / *0xb0800 = (1.9-u) / 0.9
//   0x41d24  jmp    0x41d48                      ; return
//   0x41d26  xorpd  %xmm0, %xmm0                 ; xmm0 = 0.0
//   0x41d2a  ucomisd 0x6d7f6(%rip), %xmm1        ; flags <- xmm1 (u) vs *0xaf528 (1.0)
//   0x41d32  jb     0x41d48                      ; jump if CF (u < 1.0 OR unordered) -> return 0
//   0x41d34  movsd  0x6eaac(%rip), %xmm0         ; xmm0 = *0xb07e8 = 25.0
//   0x41d3c  subsd  %xmm1, %xmm0                 ; xmm0 = 25.0 - u
//   0x41d40  divsd  0x6eaa8(%rip), %xmm0         ; xmm0 = (25.0 - u) / *0xb07f0 = (25.0-u)/24.0
//   0x41d48  pop %rbp ; ret
//
// RIP constants (resolved via resolve.py ProChannel const):
//   *0xaf528 = 1.0     (double)  ; also used as literal-pool 1.0
//   *0xb07f8 = 1.9     (double)
//   *0xb0800 = 0.9     (double)
//   *0xb07e8 = 25.0    (double)
//   *0xb07f0 = 24.0    (double)
//
// The first ucomisd is `ucomisd %xmm1,%xmm0` (AT&T) => Intel `ucomisd xmm0, xmm1`; flags reflect
// xmm0 - xmm1 = 1.0 - u. `jbe` (below-or-equal) fires when CF=1 or ZF=1, i.e. (1.0 <= u) OR
// unordered.  Fall-through (ordered && 1.0 > u, i.e. ordered u < 1.0) computes the "u<1" branch.
// The second `ucomisd 0x6d7f6(%rip), %xmm1` (AT&T) => Intel `ucomisd xmm1, mem`; flags reflect
// xmm1 - 1.0 = u - 1.0. `jb` fires when CF=1 (u < 1.0 OR unordered). Since path 2 is only reached
// after 1.0 <= u OR NaN, `jb` here handles the NaN case -> return 0.
export function convertBSplineBiasToLinear(u: number): number {
  // Ordered u < 1.0 (first branch fall-through):
  if (u < 1.0) return (1.9 - u) / 0.9;         // @0x41d10..0x41d24
  // At this point u >= 1.0 OR u is NaN. NaN comparison u<1.0 in JS is false so we get here for NaN.
  // The FCP path re-tests: jb (CF=1: u<1.0 or NaN) -> return 0. In JS, NaN < 1.0 === false, so
  // an explicit NaN check preserves the "NaN => 0" behavior of the assembly.
  if (Number.isNaN(u)) return 0.0;             // @0x41d26..0x41d32 (unordered => xmm0=0, return)
  return (25.0 - u) / 24.0;                    // @0x41d34..0x41d48
}

// ────────────────────────────────────────────────────────────────────────────────────────
// OZBSplineInterpolator::useKeypoints()  @ProChannel 0x42126
// ────────────────────────────────────────────────────────────────────────────────────────
// Full disassembly (6 lines): xorl %eax,%eax ; ret. Returns false (0).
// This is a virtual override — B-splines DON'T use keypoints directly (they use the vertex
// polygon as control points instead). The Linear/Bezier variants return 1 (true).
export function useKeypoints(): boolean {
  return false;                                // @0x4212a: xorl %eax, %eax
}

// ────────────────────────────────────────────────────────────────────────────────────────
// OZBSplineInterpolator::evalBSplineNURB(OZSpline& sp, double u)  @ProChannel 0x42704
// ────────────────────────────────────────────────────────────────────────────────────────
// Full disassembly (27 lines):
//   0x42704 push %rbp ; mov %rsp,%rbp ; push %rbx ; push %rax
//   0x4270a  mov  %rdi, %rbx                    ; rbx = this
//   0x4270d  call OZBSplineInterpolator::generateRationalBasisFunctions(double)   ; (this, u)
//   0x42712  mov  0x20(%rbx), %eax               ; eax = this->count32 (uint32 at +0x20)
//   0x42715  test %rax, %rax
//   0x42718  je   0x42740                       ; count==0 -> return 0
//   0x4271a  mov  0x08(%rbx), %rcx               ; rcx = this->values_ptr   (double* at +0x08)
//   0x4271e  mov  0x58(%rbx), %rdx               ; rdx = this->basis_ptr    (double* at +0x58)
//   0x42722  xorpd %xmm0, %xmm0                  ; acc = 0.0
//   0x42726  xorl  %esi, %esi                    ; i = 0
//   0x42728  movsd (%rcx, %rsi, 8), %xmm1        ; xmm1 = values[i]
//   0x4272d  mulsd (%rdx, %rsi, 8), %xmm1        ; xmm1 = values[i] * basis[i]
//   0x42732  addsd %xmm1, %xmm0                  ; acc += xmm1
//   0x42736  inc %rsi
//   0x42739  cmp %rsi, %rax
//   0x4273c  jne 0x42728
//   0x4273e  jmp 0x42744                        ; return acc
//   0x42740  xorpd %xmm0, %xmm0                  ; acc = 0.0
//   0x42744  add $8,%rsp ; pop %rbx ; pop %rbp ; ret
//
// Layout (from evalBSplineNURB accessors):
//   OZBSplineInterpolator +0x08 : double* values_ptr  (control-point values array)
//   OZBSplineInterpolator +0x20 : uint32 count        (number of control points)
//   OZBSplineInterpolator +0x58 : double* basis_ptr   (rational basis functions, filled by
//                                                       generateRationalBasisFunctions(u))
// The basis array is expected to have `count` entries; the values array likewise. The dot product
// yields the NURBS evaluation at parameter u. count==0 short-circuits to 0.
export interface OZBSplineInterpolatorState {
  /** +0x08 — double* values_ptr; control-point values. */
  values: Float64Array | number[];
  /** +0x20 — uint32 count; number of control points to fold. */
  count: number;
  /** +0x28 — double* weights_ptr; per-control-point weights used by
   *  generateRationalBasisFunctions to normalize into R_i(u). Read at @0x4204f/0x420ba. */
  weights: Float64Array | number[];
  /** +0x40 — double* knots_ptr; NURB knot vector of length count+order (n = count+order).
   *  Read at @0x41ed6/0x41f7c/0x41fc1/0x42007. */
  knots: Float64Array | number[];
  /** +0x58/+0x60 — std::vector<double> basis; filled by generateRationalBasisFunctions.
   *  This port models it as a growable number[] (push_back semantics). */
  basis: number[] | Float64Array;
  /** +0x70 — uint32 order (spline order k). Read at @0x41e9b/0x41f14. */
  order: number;
}

export function evalBSplineNURB(state: OZBSplineInterpolatorState, u: number): number {
  // Prime the basis-functions array. In the binary this is a virtual call on `this`; here it's
  // an ordinary call that mutates state.basis. The callee is currently a throwing stub — a
  // caller that wants the true value must supply a pre-filled basis (or wait for the callee
  // to be transcribed).
  generateRationalBasisFunctions(state, u);         // @0x4270d

  const count = state.count | 0;                     // @0x42712: mov 0x20(%rbx), %eax  (u32)
  if (count === 0) return 0.0;                       // @0x42715..0x42718 / 0x42740

  const values = state.values;                       // @0x4271a: mov 0x08(%rbx), %rcx
  const basis = state.basis;                         // @0x4271e: mov 0x58(%rbx), %rdx
  let acc = 0.0;                                     // @0x42722: xorpd %xmm0, %xmm0
  for (let i = 0; i < count; i++) {                  // @0x42726..0x4273c
    acc += values[i] * basis[i];                     // @0x42728..0x42732
  }
  return acc;
}

// ────────────────────────────────────────────────────────────────────────────────────────
// Throwing stubs — every method whose body touches an undecoded callee or an unmodelled struct
// field. Each cites its @0xADDR so raw-port/army/tools/frontier.py can enumerate the gaps.
// ────────────────────────────────────────────────────────────────────────────────────────

/** OZBSplineInterpolator::OZBSplineInterpolator()  @ProChannel 0x418ca (C2 base ctor). */
export function ctorC2(): void {
  throw new Error(
    "OZBSplineInterpolator::OZBSplineInterpolator() @ProChannel 0x418ca not yet transcribed — " +
      "requires OZInterpolator base-ctor decode and the full member layout (+0x00..+0x78).",
  );
}

/** OZBSplineInterpolator::OZBSplineInterpolator()  @ProChannel 0x4191c (C1 complete ctor). */
export function ctorC1(): void {
  throw new Error(
    "OZBSplineInterpolator::OZBSplineInterpolator() @ProChannel 0x4191c not yet transcribed.",
  );
}

/** OZBSplineInterpolator::OZBSplineInterpolator(OZBSplineInterpolator const&)  @ProChannel 0x4196e. */
export function ctorC2Copy(): void {
  throw new Error(
    "OZBSplineInterpolator::OZBSplineInterpolator(const&) @ProChannel 0x4196e not yet transcribed.",
  );
}

/** OZBSplineInterpolator::OZBSplineInterpolator(OZBSplineInterpolator const&)  @ProChannel 0x41a8e. */
export function ctorC1Copy(): void {
  throw new Error(
    "OZBSplineInterpolator::OZBSplineInterpolator(const&) @ProChannel 0x41a8e not yet transcribed.",
  );
}

/** OZBSplineInterpolator::~OZBSplineInterpolator()  @ProChannel 0x41a98 (D2 base dtor). */
export function dtorD2(): void {
  throw new Error(
    "OZBSplineInterpolator::~OZBSplineInterpolator() @ProChannel 0x41a98 not yet transcribed.",
  );
}

/** OZBSplineInterpolator::~OZBSplineInterpolator()  @ProChannel 0x41b02 (D1 complete dtor). */
export function dtorD1(): void {
  throw new Error(
    "OZBSplineInterpolator::~OZBSplineInterpolator() @ProChannel 0x41b02 not yet transcribed.",
  );
}

/** OZBSplineInterpolator::~OZBSplineInterpolator()  @ProChannel 0x41b0c (D0 deleting dtor). */
export function dtorD0(): void {
  throw new Error(
    "OZBSplineInterpolator::~OZBSplineInterpolator() @ProChannel 0x41b0c not yet transcribed.",
  );
}

/** OZBSplineInterpolator::operator=(OZBSplineInterpolator const&)  @ProChannel 0x41b28. */
export function operatorAssign(): void {
  throw new Error(
    "OZBSplineInterpolator::operator=(const&) @ProChannel 0x41b28 not yet transcribed.",
  );
}

/** OZBSplineInterpolator::operator==(OZBSplineInterpolator const&)  @ProChannel 0x41bc0. */
export function operatorEquals(): boolean {
  throw new Error(
    "OZBSplineInterpolator::operator==(const&) @ProChannel 0x41bc0 not yet transcribed.",
  );
}

/** OZBSplineInterpolator::generateOpenKnotVector(OZSpline&)  @ProChannel 0x41d4a.
 *  Pushes an open knot vector onto this->knots (vector<double> at this+0x40). Requires
 *  std::vector<double>::push_back modelling and this->count32 (+0x20), this->order (+0x70).
 *  The loop body reads knots[i] and adds a RIP constant at 0x6d75e(%rip) from @0x41dc2 —
 *  target = 0x41dca + 0x6d75e = 0xaf528 = 1.0 (the standard "increment by 1.0" open-knot step).
 */
export function generateOpenKnotVector(): void {
  throw new Error(
    "OZBSplineInterpolator::generateOpenKnotVector(OZSpline&) @ProChannel 0x41d4a not yet " +
      "transcribed — requires std::vector<double>::push_back modelling.",
  );
}

/** OZBSplineInterpolator::generatePeriodicKnotVector(OZSpline&)  @ProChannel 0x41e06. */
export function generatePeriodicKnotVector(): void {
  throw new Error(
    "OZBSplineInterpolator::generatePeriodicKnotVector(OZSpline&) @ProChannel 0x41e06 not yet " +
      "transcribed — requires std::vector<double>::push_back modelling.",
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────
// OZBSplineInterpolator::generateRationalBasisFunctions(double u)  @ProChannel 0x41e8c
// ────────────────────────────────────────────────────────────────────────────────────────
// Faithful transcription of the 169-line body at raw-port/re/disasm/
//   ProChannel.OZBSplineInterpolator.generateRationalBasisFunctions.s
//
// Purpose: fill this->basis (`state.basis`) with the rational NURB basis functions
// { R_i(u) = N_{i,order}(u) * w_i / SUM_j( N_{j,order}(u) * w_j ) } at parameter u.
//
// Layout evidence (all from this exact disassembly):
//   +0x20 (u32)  count             — number of control points          (movl 0x20(%rdi), ...)
//   +0x28 (ptr)  weights_ptr       — double* weights, one per CP       (movq 0x28(%rbx), %rdx)
//   +0x40 (ptr)  knots_ptr         — double* knots, length count+order (movq 0x40(%rbx), %rcx)
//   +0x58/+0x60  basis vec begin/end                                   (movq 0x58(%rbx),%rax; %rax→+0x60)
//   +0x70 (u32)  order             — spline order k                    (movl 0x70(%rbx), ...)
//
// RIP-relative constants (resolved via raw-port/army/tools/resolve.py ProChannel const):
//   *0xaf528 = 1.0                                     — sentinel one
//   *0xb0390 = 0x7fffffff_ffffffff (NaN-quiet mask)    — abs-mask for `|x|` via andpd
//   *0xb03b0 = 1e-07                                   — near-zero eps for basis / denominator
//   0x3ff0000000000000 = 1.0 bit-pattern               — stored via movabsq / movq (see @0x42030)
//
// Algorithm outline (matches the 5 phases of the disassembly):
//   PHASE 0  @0x41e9b..0x41ec0
//     n = this->order + this->count. If n == 0 → epilogue (no work).
//     Allocate temp = new vector<double>(n)  [rbp-0x38].
//     Reset basis: this->basis_end = this->basis_begin (`basis.length = 0`).
//   PHASE 1  @0x41ecd..0x41f12 — Cox-de-Boor base case  N_{i,1}(u)
//     numMinus1 = n - 1
//     for i in 0..numMinus1-1:
//       temp[i] = (knots[i] <= u < knots[i+1]) ? 1.0 : 0.0    (NaN u → 0)
//   PHASE 2  @0x41f14..0x42001 — Cox-de-Boor recurrence for r = 2..order
//     d = max(3, order+1). Outer loop  r = 2; r < d; r++  (so r = 2..order inclusive).
//     inner size = n - r. For j in 0..(n-r)-1:
//       left  = (|temp[j]|   < eps) ? 0
//                                   : temp[j]   * (u - knots[j])       / (knots[j+r-1] - knots[j])
//       right = (|temp[j+1]| < eps) ? 0
//                                   : temp[j+1] * (knots[j+r]  - u)    / (knots[j+r]   - knots[j+1])
//       temp[j] = left + right
//   PHASE 3  @0x42007..0x4203e — snap u to last knot
//     if |u - knots[n-1]| < eps:  temp[count-1] = 1.0
//   PHASE 4  @0x4203e..0x420e6 — weight & normalize into rational basis
//     if count == 0: skip (fall through to cleanup).
//     W = sum_{i=0..count-1} temp[i] * weights[i]        (NURB denominator)
//     For each i in 0..count-1:
//       if |W| < eps: push_back(basis, 0.0)              (degenerate → zeros)
//       else:         push_back(basis, temp[i] * weights[i] / W)
//   PHASE 5  @0x420e8..0x42106 — delete temp buffer (`operator delete`), ret.
//
// NaN semantics: every ucomisd branch is transcribed with JS comparisons that reproduce the
// unordered outcome of the assembly.  In PHASE 1, `u < knots[i]` uses `<` (NaN → false, but the
// asm's `jb` fires on unordered → temp[i]=0, so we explicit-check NaN and force 0 as well).
//
// This function mutates `state.basis` in-place, replacing its contents. The type is widened to
// `number[]` here (the push_back model); readers (evalBSplineNURB) index-read it and still work.
export function generateRationalBasisFunctions(
  state: OZBSplineInterpolatorState,
  u: number,
): void {
  const K_ONE = 1.0;                     // *0xaf528  (also 0x3ff0000000000000 bit-pattern)
  const EPS = 1e-07;                     // *0xb03b0

  const order = state.order | 0;         // +0x70 (u32)
  const count = state.count | 0;         // +0x20 (u32)
  const n = (order + count) | 0;         // @0x41e9b..0x41ea3

  // Reset basis contents. The asm sets this->basis_end = this->basis_begin (`vector.clear()` w/o
  // running dtors on trivially-destructible doubles), then push_back appends new entries.
  // In JS we model this as replacing the sequence.
  const basis: number[] = [];
  state.basis = basis;

  if (n === 0) return;                   // @0x41ea3: je 0x420fa (empty spline: nothing to do)

  // Allocate temp of length n (elements zero-initialized by std::vector<double>::vector(size_t)).
  const temp = new Float64Array(n);      // @0x41ebb: std::vector<double>::vector(n)
  const knots = state.knots;             // @0x41ed6/0x42007: movq 0x40(%rbx), %rcx
  const weights = state.weights;         // @0x4204f/0x420ba: movq 0x28(%rbx), %rdx

  // ── PHASE 1: base-case indicator functions N_{i,1}(u) ────────────────────────────────
  const numMinus1 = (n - 1) | 0;         // @0x41ed0: decl %eax
  if (numMinus1 !== 0) {                 // @0x41ed4: je 0x41f14
    // NaN u handling: ucomisd's `jb` fires when unordered, so both u<knots[i] path and NaN
    // path drop through to xmm1=0. We force the same behavior explicitly with isNaN.
    const uIsNaN = u !== u;              // NaN-only test (u!==u iff NaN)
    for (let i = 0; i < numMinus1; i++) {
      // @0x41ee8: ucomisd knots[i], u ; @0x41ef1 jb → temp[i]=0
      if (uIsNaN || u < knots[i]) {
        temp[i] = 0.0;                   // @0x41eed/0x41f03/0x41f07
      } else {
        // @0x41ef3: xmm1 = knots[i+1]; @0x41ef9: ucomisd u, knots[i+1]; @0x41f01 ja → xmm1=1.0
        // ja fires on CF=0 & ZF=0 (i.e. knots[i+1] > u, ordered). Fall-through zeros xmm1.
        temp[i] = (knots[i + 1] > u) ? K_ONE : 0.0;
      }
    }
  }

  // ── PHASE 2: Cox-de-Boor recurrence for r = 2..order ─────────────────────────────────
  if (order >= 2) {                      // @0x41f17: cmpl $0x2,%esi ; jb 0x42007
    // d = max(3, order+1). Outer counter esi runs 2..d-1  ⇒  r = 2..order inclusive.
    // @0x41f24..0x41f2e: incl esi ; cmpl $0x4,esi ; mov $0x3,edx ; cmovael esi,edx
    const orderPlus1 = (order + 1) | 0;
    const d = (orderPlus1 >= 4) ? orderPlus1 : 3;
    // rdi tracks (r-1) via the movabsq $0x100000001 + incq rdi pattern (low32 used with leal).
    // We just use `r - 1` directly for the knot index knots[j + r - 1].
    for (let r = 2; r < d; r++) {         // @0x41f31: mov $0x2,esi ; @0x41ffe cmp edx,esi ; jne
      const innerLen = (n - r) | 0;       // @0x41f5c: subl %esi,%r8d
      if (innerLen <= 0) continue;        // asm's `jb 0x41f50→0x41ff8` when innerLen==0
      // xmm2 primed with temp[0] before inner loop — but that value is overwritten only inside
      // the loop before it is *read* for the left term, so we simply read temp[j] each iter.
      for (let j = 0; j < innerLen; j++) {
        // Left term: (|temp[j]| < eps) ? 0 : temp[j]*(u - knots[j])/(knots[j+r-1]-knots[j])
        // @0x41f66..0x41fa4
        let left: number;
        const tj = temp[j];
        const absTj = tj < 0 ? -tj : tj;  // andpd with 0x7fffff..ff = |x| for doubles
        if (EPS > absTj) {                // @0x41f72: ucomisd |xmm2|,xmm1(=eps) ; ja
          left = 0.0;                     // @0x41f76: xorpd %xmm4,%xmm4  (xmm4 stays 0)
        } else {
          const kj = knots[j];            // @0x41f80: movsd (r10,r9,8),%xmm4
          const num = u - kj;             // @0x41f8a: subsd %xmm4,%xmm5 (xmm5 was u)
          const numer = tj * num;         // @0x41f8e: mulsd %xmm5,%xmm2
          const den = knots[j + r - 1] - kj;  // @0x41f96..0x41f9c
          left = numer / den;             // @0x41fa0: divsd %xmm5,%xmm2
        }

        // Right term: (|temp[j+1]| < eps) ? 0
        //           : temp[j+1] * (knots[j+r] - u) / (knots[j+r] - knots[j+1])
        // @0x41fa8..0x41fde
        let right: number;
        const tj1 = temp[j + 1];          // @0x41fa8: movsd 0x8(rcx,r9,8),%xmm2
        const absTj1 = tj1 < 0 ? -tj1 : tj1;
        if (EPS > absTj1) {               // @0x41fb7: ucomisd |xmm2|,xmm1(=eps) ; ja
          right = 0.0;                    // xmm3 stays 0
        } else {
          const kjR = knots[j + r];       // @0x41fc5: movsd (r11,r10,8),%xmm5 with r10=r+j
          const diff = kjR - u;           // @0x41fcf..0x41fd3
          const numer = diff * tj1;
          const den = kjR - knots[j + 1]; // @0x41fd7: subsd 0x8(r11,r9,8),%xmm5
          right = numer / den;
        }

        temp[j] = left + right;           // @0x41fe2..0x41fe6
      }
    }
  }

  // ── PHASE 3: snap u to last-knot ─────────────────────────────────────────────────────
  // if |u - knots[n-1]| < eps: temp[count-1] = 1.0
  // @0x42007..0x4203e. Note: uses count (this+0x20), not n-1, for the WRITE index.
  {
    const diff = u - knots[numMinus1];    // @0x4200b: subsd (rcx,rax,8),%xmm6 ; rax=numMinus1
    const absDiff = diff < 0 ? -diff : diff;   // @0x42010: andpd abs_mask,%xmm6
    if (EPS > absDiff) {                  // @0x42020: ucomisd |diff|,%xmm0(=eps) ; jbe skip
      if (count !== 0) {                  // implicit: count-1 write is only safe when count>=1
        temp[count - 1] = K_ONE;          // @0x42030..0x4203a: store bit-pattern 0x3ff0..0
      }
    }
  }

  // ── PHASE 4: weight & normalize into rational basis ──────────────────────────────────
  if (count === 0) {                      // @0x4203e: testq %rax,%rax ; je 0x420e8
    // fall through to cleanup (empty basis).
  } else {
    // W = sum_{i=0..count-1} temp[i] * weights[i]        @0x42053..0x4206d
    let W = 0.0;                          // @0x42053: xorpd %xmm1,%xmm1
    for (let i = 0; i < count; i++) {
      W += temp[i] * weights[i];          // @0x42059..0x42063
    }
    const absW = W < 0 ? -W : W;          // @0x4206f/0x42077: andpd abs_mask,%xmm1

    for (let i = 0; i < count; i++) {     // @0x42080..0x420e6
      // @0x4208f: ucomisd |W|,%xmm0(=eps) ; jbe → normal branch, else degenerate 0
      if (EPS > absW) {                   // ja fires on ordered eps > |W|
        basis.push(0.0);                  // @0x4209b..0x420ae: push_back(0.0)
      } else {
        // @0x420b0..0x420d3: push_back(temp[i] * weights[i] / W)
        basis.push((temp[i] * weights[i]) / W);
      }
    }
  }

  // PHASE 5: temp is dropped when its `Float64Array` goes out of scope in JS (no explicit delete).
  // @0x420e8..0x420f5 in the asm calls `operator delete` on the vector's buffer.
}

/** OZBSplineInterpolator::getAdjustedMaxU(OZSpline&, CMTime const&, CMTime const&)
 *  @ProChannel 0x4212e. Depends on OZSpline vtable slots +0x10/+0x58 and OZFigTimeForChannelSeconds. */
export function getAdjustedMaxU(): void {
  throw new Error(
    "OZBSplineInterpolator::getAdjustedMaxU(OZSpline&, CMTime, CMTime) @ProChannel 0x4212e not " +
      "yet transcribed — requires OZSpline vtable slots +0x10/+0x58 and OZFigTimeForChannelSeconds " +
      "@ProChannel 0xacafe.",
  );
}

/** OZBSplineInterpolator::getAdjustedMinU(OZSpline&, CMTime const&, CMTime const&)
 *  @ProChannel 0x421ee. Same callee dependencies as getAdjustedMaxU. */
export function getAdjustedMinU(): void {
  throw new Error(
    "OZBSplineInterpolator::getAdjustedMinU(OZSpline&, CMTime, CMTime) @ProChannel 0x421ee not " +
      "yet transcribed — requires OZSpline vtable slots +0x10/+0x58 and OZFigTimeForChannelSeconds " +
      "@ProChannel 0xacafe.",
  );
}

/** OZBSplineInterpolator::init(OZSpline&, CMTime const&)  @ProChannel 0x4229a. */
export function init(): void {
  throw new Error(
    "OZBSplineInterpolator::init(OZSpline&, CMTime const&) @ProChannel 0x4229a not yet " +
      "transcribed — 36-line body calling into knot-vector generators and fillTempArrays.",
  );
}

/** OZBSplineInterpolator::fillTempArrays(OZSpline&, CMTime const&)  @ProChannel 0x4230e. */
export function fillTempArrays(): void {
  throw new Error(
    "OZBSplineInterpolator::fillTempArrays(OZSpline&, CMTime const&) @ProChannel 0x4230e not " +
      "yet transcribed — 198-line body iterating the spline's vertex list.",
  );
}

/** OZBSplineInterpolator::interpolate(OZSpline&, CMTime const&, void*, void*, CMTime&, bool, bool)
 *  @ProChannel 0x425fc. 73-line body — chains getAdjustedMinU/Max, init, evalBSplineNURB, and
 *  the ease-time virtual dispatch. Not yet transcribed. */
export function interpolate(): void {
  throw new Error(
    "OZBSplineInterpolator::interpolate(OZSpline&, CMTime, void*, void*, CMTime&, bool, bool) " +
      "@ProChannel 0x425fc not yet transcribed.",
  );
}
