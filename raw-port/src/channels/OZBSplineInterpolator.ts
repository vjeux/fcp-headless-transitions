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
  /** +0x58 — double* basis_ptr; the rational basis functions filled by
   *  generateRationalBasisFunctions(u). This port models it as a same-length array. */
  basis: Float64Array | number[];
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

/** OZBSplineInterpolator::generateRationalBasisFunctions(double)  @ProChannel 0x41e8c.
 *  Fills this->basis (this+0x58) with the rational NURB basis at parameter u. 169-line body
 *  containing an inner Cox-de-Boor recurrence — not yet transcribed. */
export function generateRationalBasisFunctions(
  _state: OZBSplineInterpolatorState,
  _u: number,
): void {
  throw new Error(
    "OZBSplineInterpolator::generateRationalBasisFunctions(double) @ProChannel 0x41e8c not yet " +
      "transcribed — 169-line Cox-de-Boor recurrence with knot-vector index search.",
  );
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
