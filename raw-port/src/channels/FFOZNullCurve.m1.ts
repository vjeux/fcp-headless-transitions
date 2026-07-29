// raw-port: FFOZNullCurve (chunk m1) — Flexo.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//                   Versions/A/Flexo (x86_64 slice; VA == file offset for this build).
// Chunk 1 of 8 ports methods [20..40) of FFOZNullCurve.
//
// ── What FFOZNullCurve is (recovered from the disassembly of the whole class) ─────────────
//
// FFOZNullCurve is the "null-object" implementation of the OZCurve interface (Ozone's polymorphic
// keyframe-driven curve). It is what FCP substitutes at the interface slot whenever the concrete
// curve for a channel is absent (unbound custom-UI channel, disabled behavior, uninitialized state,
// etc.) so callers can dispatch through the standard OZCurve virtual/thunk surface WITHOUT null-
// checking on every access.
//
// Every method in this chunk is a compiler-emitted empty function whose ENTIRE body is (verbatim):
//
//   pushq %rbp
//   movq  %rsp, %rbp
//   xorl  %eax, %eax        ; only for methods with a scalar return
//   popq  %rbp
//   retq
//   nopl  (%rax,%rax)       ; padding to the next 0x10 boundary
//
// i.e. the C++ source was quite literally
//
//   uint FFOZNullCurve::getCurveInterpolation(unsigned int*) { return 0; }
//   void FFOZNullCurve::setCurveExtrapolation(unsigned int, unsigned int) {}
//   ...
//
// with NO writes to `this`, NO writes through any out-parameter (the `unsigned int*`/`double*`
// out-pointers are received in %rsi but never dereferenced), and NO branches. The uniform 0x10
// spacing between symbol starts (0x12871c0, 0x12871d0, 0x12871e0, …, 0x12872f0) is the compiler
// aligning each near-empty function to a cache-line boundary; it is NOT ICF folding — every one
// of these 20 methods has its own distinct exported symbol with its own distinct entry PC. Each
// body has been dump-verified individually against the Flexo mach-o and matches the pattern above.
//
// ── Return-value convention observed in the disassembly ──────────────────────────────────
//   * `xor eax, eax` present  → callee returns a scalar; caller sees 0 (or false, or nullptr, or
//     a wrapped-nullptr status enum). The compiler emits xor for ANY integer/pointer/bool return
//     type — a native x86 quirk we preserve at the semantic level, not the bit level.
//   * `xor eax, eax` absent   → callee is C++ `void`; only `setCustomInterpolator` and
//     `setRetimingExtrapolation` in this chunk match — their disasm ends `push rbp; mov rbp,rsp;
//     pop rbp; ret` with a `nopw` padding instead of `nopl` (a 6-byte prologue+ret instead of 7).
//
// The vector-returning overloads (`getCurveSamples(…, vector<T>*)`) DO carry `xor eax, eax` even
// though C++ signature is `void`: the low-level ABI treats the caller-provided vector pointer as an
// in-arg, not a return slot, and the function simply doesn't touch it. The xor is there because
// the true C++ return type at this address slot is `int` (the shared thunk table's per-slot type)
// and the null impl returns 0. We PRESERVE the semantic: the caller's vector remains empty (its
// header untouched) — which is what a null-curve reports for "samples".
//
// ── Field layout ─────────────────────────────────────────────────────────────────────────
// None of the 20 methods in this chunk reads or writes ANY field of `this`. `this` (%rdi) is
// received on entry and immediately discarded. Consequently the object layout is NOT constrained
// by anything in this file — it belongs to chunk 0 (ctors/dtors) to establish. We import a stub
// opaque type here so tsc has a stable receiver type; chunk 0 will widen it with real fields.
//
// ── Method addresses ported in this chunk (all Flexo.framework, cited per-function below) ─
//    20 @0x12871c0  getCurveInterpolation(unsigned int*)
//    21 @0x12871d0  setCustomInterpolator(OZCustomInterpolator*, PCSpinLock*)
//    22 @0x12871e0  setCurveExtrapolation(unsigned int, unsigned int)
//    23 @0x12871f0  getCurveExtrapolation(unsigned int*, unsigned int)
//    24 @0x1287200  setRetimingExtrapolation(bool)
//    25 @0x1287210  getRetimingExtrapolation()
//    26 @0x1287220  getCurveDefaultValue(double*)
//    27 @0x1287230  setCurveDefaultValue(double)
//    28 @0x1287240  getCurveInitialValue(double*)
//    29 @0x1287250  setCurveInitialValue(double)
//    30 @0x1287260  reverseKeypoints(void*, void*, bool)
//    31 @0x1287270  getUForValue(double, vector<CMTime>&, PCTimeRange&, CMTime&, unsigned int)
//    32 @0x1287280  getCurveSamples(double, double, unsigned int&, vector<double>*, vector<double>*)
//    33 @0x1287290  getCurveSamples(CMTime const&, CMTime const&, unsigned int&, vector<CMTime>*, vector<double>*)
//    34 @0x12872a0  getCurveSamples(double, double, unsigned int&, double**, double**, double)
//    35 @0x12872b0  getCurveSamples(CMTime const&, CMTime const&, unsigned int&, CMTime**, double**)
//    36 @0x12872c0  getCurveSamples(void*, CMTime const&, CMTime const&, unsigned int&, CMTime**, double**)
//    37 @0x12872d0  getCurveSamples(void*, CMTime const&, CMTime const&, unsigned int&, vector<CMTime>*, vector<double>*)
//    38 @0x12872e0  getSplineSamplesAndIgnoreLinear(CMTime const&, CMTime const&, CMTime const&, vector<CMTime>*, vector<double>*)
//    39 @0x12872f0  getCurveDerivativesSamples(CMTime const&, CMTime const&, unsigned int&, vector<CMTime>*, vector<double>*)
//
// ── Frontier callees new to this chunk ───────────────────────────────────────────────────
//   NONE. Every method's body is `xor eax,eax; ret` — there are zero external calls, zero vtable
//   dispatches, zero RIP-relative loads. FFOZNullCurve is the "leaf of leaves" — no callees to
//   forward to `frontier.py`.

/**
 * Opaque brand for the FFOZNullCurve receiver — chunk 0 (ctors/dtors) will replace this with the
 * real object layout. None of the 20 methods in this chunk touches any field, so a bare brand is
 * a sound receiver for now: any real object satisfying the OZCurve v-interface can be treated as
 * an FFOZNullCurve at these slots.
 *
 * NOTE: this is a `type`, not a `class`. FCP's C++ vtable indirection binds the method address to
 * the object at construction time — we mirror that with a functional dispatch table
 * (`FFOZNullCurve_m1_methods`) below rather than TS instance methods.
 *
 * The trailing `_` in the brand keeps it distinct from `FFOZNullCurve` when chunk 0 eventually
 * exports a full interface of the same name (we widen or re-declare there).
 */
export type FFOZNullCurve = { readonly __brand: "FFOZNullCurve_" };

// ────────────────────────────────────────────────────────────────────────────
// Method bodies (all identical structural shape — see file header for the exact assembly).
// ────────────────────────────────────────────────────────────────────────────

/**
 * FFOZNullCurve::getCurveInterpolation(unsigned int*)  @0x12871c0 (Flexo).
 *
 * Body:
 *   0x12871c0  push rbp / mov rbp, rsp
 *   0x12871c4  xor  eax, eax
 *   0x12871c6  pop  rbp
 *   0x12871c7  ret
 *
 * Semantic: returns 0 (unsigned int). The out-pointer at %rsi is NOT dereferenced —
 * `interpolation` receives no write. The C++ caller sees `interpolation` still holding whatever
 * was on the stack at call time. Standard null-curve pattern: "no error, no info".
 */
export function ffozNullCurve_getCurveInterpolation(
  _self: FFOZNullCurve,
  _interpolation: { u32: number },
): number {
  // @0x12871c4  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::setCustomInterpolator(OZCustomInterpolator*, PCSpinLock*)  @0x12871d0 (Flexo).
 *
 * Body:
 *   0x12871d0  push rbp / mov rbp, rsp
 *   0x12871d4  pop  rbp
 *   0x12871d5  ret     ; nopw padding (void return — no xor)
 *
 * Semantic: void, no-op. The interpolator pointer and spin-lock are received and dropped.
 * The null curve has nothing to lock against and no state to install an interpolator into.
 */
export function ffozNullCurve_setCustomInterpolator(
  _self: FFOZNullCurve,
  _interpolator: unknown /* OZCustomInterpolator* — undecoded here */,
  _lock: unknown /* PCSpinLock* — undecoded here */,
): void {
  // @0x12871d5  ret (void)
}

/**
 * FFOZNullCurve::setCurveExtrapolation(unsigned int, unsigned int)  @0x12871e0 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret
 *
 * Semantic: returns 0 (this slot's C++ signature is `int setCurveExtrapolation(uint, uint)` —
 * the shared thunk-table type carries an int return even for the void-in-source setter form).
 * Both `mode` args are received and dropped.
 */
export function ffozNullCurve_setCurveExtrapolation(
  _self: FFOZNullCurve,
  _preMode: number,
  _postMode: number,
): number {
  // @0x12871e4  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getCurveExtrapolation(unsigned int*, unsigned int)  @0x12871f0 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret
 *
 * Semantic: returns 0. Neither the `unsigned int*` out-slot nor the trailing selector `uint` is
 * touched; caller receives no extrapolation-mode information (which is correct for a null curve).
 */
export function ffozNullCurve_getCurveExtrapolation(
  _self: FFOZNullCurve,
  _outMode: { u32: number },
  _which: number,
): number {
  // @0x12871f4  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::setRetimingExtrapolation(bool)  @0x1287200 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / pop rbp / ret ; nopw (void — no xor).
 *
 * Semantic: void, no-op.
 */
export function ffozNullCurve_setRetimingExtrapolation(
  _self: FFOZNullCurve,
  _enabled: boolean,
): void {
  // @0x1287205  ret (void)
}

/**
 * FFOZNullCurve::getRetimingExtrapolation()  @0x1287210 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 *
 * Semantic: returns 0 → interpreted as `false` by C++ callers reading `bool`. The null curve
 * reports retiming-extrapolation as disabled.
 */
export function ffozNullCurve_getRetimingExtrapolation(
  _self: FFOZNullCurve,
): boolean {
  // @0x1287214  xor eax, eax  (result: 0 → false)
  return false;
}

/**
 * FFOZNullCurve::getCurveDefaultValue(double*)  @0x1287220 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 *
 * Semantic: returns 0. The `double*` out-slot is NOT written — caller reads whatever was already
 * there. (This is deliberate in the C++ source: a null curve declines to nominate a default.)
 */
export function ffozNullCurve_getCurveDefaultValue(
  _self: FFOZNullCurve,
  _outDefault: { f64: number },
): number {
  // @0x1287224  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::setCurveDefaultValue(double)  @0x1287230 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 *
 * Semantic: returns 0. The passed `double` (xmm0 on entry) is dropped.
 */
export function ffozNullCurve_setCurveDefaultValue(
  _self: FFOZNullCurve,
  _v: number,
): number {
  // @0x1287234  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getCurveInitialValue(double*)  @0x1287240 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 * Semantic: returns 0; out-double untouched (see getCurveDefaultValue).
 */
export function ffozNullCurve_getCurveInitialValue(
  _self: FFOZNullCurve,
  _outInitial: { f64: number },
): number {
  // @0x1287244  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::setCurveInitialValue(double)  @0x1287250 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 * Semantic: returns 0; passed value dropped.
 */
export function ffozNullCurve_setCurveInitialValue(
  _self: FFOZNullCurve,
  _v: number,
): number {
  // @0x1287254  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::reverseKeypoints(void*, void*, bool)  @0x1287260 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 *
 * Semantic: returns 0. Both keypoint handles (%rsi/%rdx) and the trailing bool (%cl) are received
 * and dropped. A null curve has no keypoints to reverse; the operation is trivially successful.
 */
export function ffozNullCurve_reverseKeypoints(
  _self: FFOZNullCurve,
  _handleA: unknown /* void* */,
  _handleB: unknown /* void* */,
  _flag: boolean,
): number {
  // @0x1287264  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getUForValue(double, vector<CMTime>&, PCTimeRange&, CMTime&, unsigned int)
 *   @0x1287270 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 *
 * Semantic: returns 0. The vector, PCTimeRange, CMTime, and selector are all received and dropped.
 * The vector stays empty (its header untouched) — no U-solutions for a null curve's V=value query.
 */
export function ffozNullCurve_getUForValue(
  _self: FFOZNullCurve,
  _v: number,
  _outUs: unknown[] /* vector<CMTime>& */,
  _range: unknown /* PCTimeRange& */,
  _tRef: unknown /* CMTime& */,
  _which: number,
): number {
  // @0x1287274  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getCurveSamples(double, double, unsigned int&, vector<double>*, vector<double>*)
 *   @0x1287280 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 *
 * Semantic: returns 0. Neither the count reference (%rcx: unsigned int&) nor the two out-vectors
 * are touched. Caller sees zero samples for a null curve — vectors stay empty, count remains
 * whatever the caller initialised it to (see the OZCurve interface contract; the count is expected
 * to be pre-set by caller or left at 0).
 */
export function ffozNullCurve_getCurveSamples_dd(
  _self: FFOZNullCurve,
  _fromU: number,
  _toU: number,
  _count: { u32: number },
  _outTimes: number[] /* vector<double>* — U axis */,
  _outValues: number[] /* vector<double>* — V axis */,
): number {
  // @0x1287284  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getCurveSamples(CMTime const&, CMTime const&, unsigned int&,
 *                                vector<CMTime>*, vector<double>*)  @0x1287290 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret. Semantic: returns 0; vectors untouched.
 */
export function ffozNullCurve_getCurveSamples_tt_vec(
  _self: FFOZNullCurve,
  _fromT: unknown /* CMTime const& */,
  _toT: unknown /* CMTime const& */,
  _count: { u32: number },
  _outTimes: unknown[] /* vector<CMTime>* */,
  _outValues: number[] /* vector<double>* */,
): number {
  // @0x1287294  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getCurveSamples(double, double, unsigned int&, double**, double**, double)
 *   @0x12872a0 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 *
 * Semantic: returns 0. The two `double**` out-pointer slots (%r8, %r9) are received and dropped —
 * a real curve would malloc and set *outTimesPtr / *outValuesPtr; the null curve does not.
 * Callers observing `count == 0` (their pre-set value) MUST NOT dereference the pointer-of-pointer.
 */
export function ffozNullCurve_getCurveSamples_dd_pp(
  _self: FFOZNullCurve,
  _fromU: number,
  _toU: number,
  _count: { u32: number },
  _outTimesPtr: { ptr: number[] | null },
  _outValuesPtr: { ptr: number[] | null },
  _stride: number,
): number {
  // @0x12872a4  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getCurveSamples(CMTime const&, CMTime const&, unsigned int&, CMTime**, double**)
 *   @0x12872b0 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret. Semantic: returns 0; out-pointers
 * untouched.
 */
export function ffozNullCurve_getCurveSamples_tt_pp(
  _self: FFOZNullCurve,
  _fromT: unknown /* CMTime const& */,
  _toT: unknown /* CMTime const& */,
  _count: { u32: number },
  _outTimesPtr: { ptr: unknown[] | null },
  _outValuesPtr: { ptr: number[] | null },
): number {
  // @0x12872b4  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getCurveSamples(void*, CMTime const&, CMTime const&, unsigned int&,
 *                                CMTime**, double**)  @0x12872c0 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 *
 * Semantic: returns 0. The leading `void*` (a curve-scope handle in the real impl) is dropped
 * along with the rest.
 */
export function ffozNullCurve_getCurveSamples_ctx_tt_pp(
  _self: FFOZNullCurve,
  _scope: unknown /* void* */,
  _fromT: unknown /* CMTime const& */,
  _toT: unknown /* CMTime const& */,
  _count: { u32: number },
  _outTimesPtr: { ptr: unknown[] | null },
  _outValuesPtr: { ptr: number[] | null },
): number {
  // @0x12872c4  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getCurveSamples(void*, CMTime const&, CMTime const&, unsigned int&,
 *                                vector<CMTime>*, vector<double>*)  @0x12872d0 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret. Semantic: returns 0.
 */
export function ffozNullCurve_getCurveSamples_ctx_tt_vec(
  _self: FFOZNullCurve,
  _scope: unknown /* void* */,
  _fromT: unknown /* CMTime const& */,
  _toT: unknown /* CMTime const& */,
  _count: { u32: number },
  _outTimes: unknown[] /* vector<CMTime>* */,
  _outValues: number[] /* vector<double>* */,
): number {
  // @0x12872d4  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getSplineSamplesAndIgnoreLinear(CMTime const&, CMTime const&, CMTime const&,
 *                                                vector<CMTime>*, vector<double>*)
 *   @0x12872e0 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 *
 * Semantic: returns 0. Three CMTime refs and two output vectors received & dropped; vectors stay
 * empty. In a real spline this is the "densify curved segments, leave straight segments alone"
 * sampler — the null curve has neither curved nor straight segments to report.
 */
export function ffozNullCurve_getSplineSamplesAndIgnoreLinear(
  _self: FFOZNullCurve,
  _fromT: unknown /* CMTime const& */,
  _toT: unknown /* CMTime const& */,
  _stepT: unknown /* CMTime const& */,
  _outTimes: unknown[] /* vector<CMTime>* */,
  _outValues: number[] /* vector<double>* */,
): number {
  // @0x12872e4  xor eax, eax
  return 0;
}

/**
 * FFOZNullCurve::getCurveDerivativesSamples(CMTime const&, CMTime const&, unsigned int&,
 *                                           vector<CMTime>*, vector<double>*)
 *   @0x12872f0 (Flexo).
 *
 * Body: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret.
 *
 * Semantic: returns 0. In a real curve this samples the FIRST DERIVATIVE (dV/dU) at N points
 * in [fromT, toT]; the null curve produces no samples so the derivative vector stays empty.
 */
export function ffozNullCurve_getCurveDerivativesSamples(
  _self: FFOZNullCurve,
  _fromT: unknown /* CMTime const& */,
  _toT: unknown /* CMTime const& */,
  _count: { u32: number },
  _outTimes: unknown[] /* vector<CMTime>* */,
  _outDerivs: number[] /* vector<double>* */,
): number {
  // @0x12872f4  xor eax, eax
  return 0;
}

// ────────────────────────────────────────────────────────────────────────────
// Dispatch table (assemble_class.py convention: <Class>_m<k>_methods).
// Every entry keyed by the FULL C++ demangled signature so `frontier.py` / ledger merge can pair
// each function with its ledger method-key without ambiguity across the six getCurveSamples
// overloads.
// ────────────────────────────────────────────────────────────────────────────

export const FFOZNullCurve_m1_methods = {
  "FFOZNullCurve::getCurveInterpolation(unsigned int*)":
                                                              ffozNullCurve_getCurveInterpolation,          // @0x12871c0
  "FFOZNullCurve::setCustomInterpolator(OZCustomInterpolator*, PCSpinLock*)":
                                                              ffozNullCurve_setCustomInterpolator,          // @0x12871d0
  "FFOZNullCurve::setCurveExtrapolation(unsigned int, unsigned int)":
                                                              ffozNullCurve_setCurveExtrapolation,          // @0x12871e0
  "FFOZNullCurve::getCurveExtrapolation(unsigned int*, unsigned int)":
                                                              ffozNullCurve_getCurveExtrapolation,          // @0x12871f0
  "FFOZNullCurve::setRetimingExtrapolation(bool)":            ffozNullCurve_setRetimingExtrapolation,        // @0x1287200
  "FFOZNullCurve::getRetimingExtrapolation()":                ffozNullCurve_getRetimingExtrapolation,        // @0x1287210
  "FFOZNullCurve::getCurveDefaultValue(double*)":             ffozNullCurve_getCurveDefaultValue,            // @0x1287220
  "FFOZNullCurve::setCurveDefaultValue(double)":              ffozNullCurve_setCurveDefaultValue,            // @0x1287230
  "FFOZNullCurve::getCurveInitialValue(double*)":             ffozNullCurve_getCurveInitialValue,            // @0x1287240
  "FFOZNullCurve::setCurveInitialValue(double)":              ffozNullCurve_setCurveInitialValue,            // @0x1287250
  "FFOZNullCurve::reverseKeypoints(void*, void*, bool)":      ffozNullCurve_reverseKeypoints,                // @0x1287260
  "FFOZNullCurve::getUForValue(double, std::__1::vector<CMTime, std::__1::allocator<CMTime>>&, PCTimeRange&, CMTime&, unsigned int)":
                                                              ffozNullCurve_getUForValue,                    // @0x1287270
  "FFOZNullCurve::getCurveSamples(double, double, unsigned int&, std::__1::vector<double, std::__1::allocator<double>>*, std::__1::vector<double, std::__1::allocator<double>>*)":
                                                              ffozNullCurve_getCurveSamples_dd,              // @0x1287280
  "FFOZNullCurve::getCurveSamples(CMTime const&, CMTime const&, unsigned int&, std::__1::vector<CMTime, std::__1::allocator<CMTime>>*, std::__1::vector<double, std::__1::allocator<double>>*)":
                                                              ffozNullCurve_getCurveSamples_tt_vec,          // @0x1287290
  "FFOZNullCurve::getCurveSamples(double, double, unsigned int&, double**, double**, double)":
                                                              ffozNullCurve_getCurveSamples_dd_pp,           // @0x12872a0
  "FFOZNullCurve::getCurveSamples(CMTime const&, CMTime const&, unsigned int&, CMTime**, double**)":
                                                              ffozNullCurve_getCurveSamples_tt_pp,           // @0x12872b0
  "FFOZNullCurve::getCurveSamples(void*, CMTime const&, CMTime const&, unsigned int&, CMTime**, double**)":
                                                              ffozNullCurve_getCurveSamples_ctx_tt_pp,       // @0x12872c0
  "FFOZNullCurve::getCurveSamples(void*, CMTime const&, CMTime const&, unsigned int&, std::__1::vector<CMTime, std::__1::allocator<CMTime>>*, std::__1::vector<double, std::__1::allocator<double>>*)":
                                                              ffozNullCurve_getCurveSamples_ctx_tt_vec,      // @0x12872d0
  "FFOZNullCurve::getSplineSamplesAndIgnoreLinear(CMTime const&, CMTime const&, CMTime const&, std::__1::vector<CMTime, std::__1::allocator<CMTime>>*, std::__1::vector<double, std::__1::allocator<double>>*)":
                                                              ffozNullCurve_getSplineSamplesAndIgnoreLinear, // @0x12872e0
  "FFOZNullCurve::getCurveDerivativesSamples(CMTime const&, CMTime const&, unsigned int&, std::__1::vector<CMTime, std::__1::allocator<CMTime>>*, std::__1::vector<double, std::__1::allocator<double>>*)":
                                                              ffozNullCurve_getCurveDerivativesSamples,      // @0x12872f0
} as const;
