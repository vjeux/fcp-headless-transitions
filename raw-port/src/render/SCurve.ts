// SCurve.ts — Flexo SCurve: Bezier-based S-curve fitter for shadows/highlights.
//
// Faithful transcription of the Flexo framework class `SCurve`.
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (x86_64 slice). Disassembly saved at raw-port/re/disasm/Flexo.SCurve.*.s (see also
// the enclosing SCurve section of /tmp/Flexo_tV.txt lines 93916..95428).
//
// Class @Flexo. Methods (all four addresses recovered from `nm -a` + the tV dump):
//   SCurve::computeBezierShadowsHightlight(double, double, double, double,
//                                          point2*, float&, float&)     @Flexo 0x62f40
//   SCurve::fitCurveToPoints(std::vector<float> const&, std::vector<float> const&,
//                            double&, double&, double&, double&, float) @Flexo 0x63330
//   SCurve::getCurve(double, double, double, double,
//                    std::vector<float>&)                                @Flexo 0x63eb0
//   SCurve::maxDiff(std::vector<float> const&, std::vector<float> const&,
//                   double, double, double, double)                     @Flexo 0x642d0
//
// DECODE (what the disassembly reveals about behaviour and dependencies):
//
//   Overall shape.  The four methods form one subsystem: `computeBezierShadowsHightlight`
//   builds the 5 Bezier control points of a monotone S-curve from four scalar
//   parameters (a = shadows-input, b = highlights-input, c = shadows-slope,
//   d = highlights-slope; recovered from the xmm{0..3} register assignments at
//   the entry @0x62f40..0x62f5f) and writes two float outputs (shadow-tangent
//   `float& out_s` in %rsi, highlight-tangent `float& out_h` in %rdx). It then
//   tail-calls `ASpline2Bezier(point2* out, int n=5, point2* pts)` @0x6330a with
//   the 5 stored control points to lay them out as a monotonic Bezier curve.
//
//   getCurve @0x63eb0.  Calls computeBezierShadowsHightlight @0x63eee and then
//   loops 0x100 (=256) times sampling `BezierYfromX(point2*, int=0xD, float x)`
//   @0x64015 into the caller-provided std::vector<float>& (rdi). This is the
//   256-entry 1D LUT flavour.
//
//   fitCurveToPoints @0x63330.  Sets up a Grand-Central-Dispatch block
//   (`__ZN12_GLOBAL__N_117cFitCurveToPointsE...invoke` @0x64c80 is the block-invoke
//   trampoline; also block byref copy/dispose helpers at 0x64bc0/0x64c00/0x64c20/0x64c60).
//   It appears to be an iterative fit: repeatedly calls getCurve then maxDiff to
//   drive the four scalar (a,b,c,d) params to minimize residual. Full control
//   flow is 600 lines of SIMD, unresolved without further decode; see the
//   raw disasm file for evidence.
//
//   maxDiff @0x642d0.  Also builds a Bezier via computeBezierShadowsHightlight
//   @0x64707 and @0x64f31 and returns a scalar (the L-inf residual, in xmm0)
//   between the fitted curve and the supplied std::vector<float> of samples.
//
//   Callee frontier (all `symbol stub for:` / cross-symbol callq).  These are
//   the boundary functions we CANNOT synthesize from this class alone:
//
//     __Z14ASpline2BezierP6point2iS0_        @0x6330a         ASpline2Bezier(point2*, int, point2*)
//     __Z12BezierYfromXP6point2if            @0x64015         BezierYfromX(point2*, int, float)
//     _logf                                  @0x63155/0x6313c (multiple sites)
//     _powf                                  @0x631f7/0x632af/0x6355d/0x6359a (multiple sites)
//     std::vector<float>::__throw_length_error[abi:nqe210106]    @0x64b73/0x64b86
//     std::__throw_bad_array_new_length[abi:nqe210106]           @0x64b7a
//     __ZdlPv                                @0x64bb2/0x64c15/0x64c75  operator delete
//     __Unwind_Resume                        @0x64bba
//     ___stack_chk_fail                      @0x64329/0x64b81
//
//   Constants (RIP-relative literal-pool doubles/floats visible in the disasm; not
//   yet resolved to explicit numeric values via `resolve.py Flexo const <abs_addr>`
//   in this pass — they must be resolved before any real math is transcribed):
//
//     @0x62f6e   mulsd  0x150a1da(%rip),%xmm4        - a squaring/scale coefficient
//     @0x62f84   movsd  0x150a1cc(%rip),%xmm4        - a 0.5 or similar scalar
//     @0x62fc0   movl   $0x3f800000,(%rdx)           - 1.0f  (initial highlight slope)
//     @0x62fe4   movl   $0x3f800000,(%rdx)           - 1.0f  (mirror)
//     @0x62ff8   addsd  0x1509a00(%rip),%xmm1        - shift by an additive constant
//     @0x62fef   xorps  0x1509cde(%rip),%xmm3        - a sign-flip mask
//     @0x63091   pshufd/pslld/blendvps sequence      - packed lane-select for two floats
//     @0x630f1   movapd 0x1509917(%rip),%xmm3        - a paired double coefficient
//     @0x63170   andpd  0x1509918(%rip),%xmm3        - abs-value mask (double)
//     @0x63178   movsd  0x15098b8(%rip),%xmm0        - another scalar (likely 1.0)
//     @0x63225   movaps 0x1509ac4(%rip),%xmm2        - a packed sign-flip
//
//   (Resolving each of these to a concrete number is a per-constant pass with
//    `resolve.py Flexo const <addr>`; leaving them undecoded and throwing at
//    method entry is faithful under the porting rules — better to fail loudly
//    than to guess a coefficient.)
//
//   point2 layout (used pervasively).  It is a { float x; float y; } — 8 bytes,
//   stored via aligned single-precision moves. Buffer of 5 point2's occupies
//   0x28 bytes on the stack at -0x40(%rbp) (@0x632fe leaq -0x40(%rbp),%rdi;
//   @0x63302 movl $0x5,%esi passed as the count to ASpline2Bezier). We model
//   point2 here as the { x, y } record read directly out of the disasm.
//
// NUMERICS.  Every arithmetic op in the four methods is either double-precision
// (mulsd/addsd/subsd/divsd/sqrtsd) or single-precision (mulss/addss/subss/divss/
// sqrtss). Two conversions are used repeatedly:
//   cvtsd2ss  double -> single-round  (Math.fround(x))
//   cvtss2sd  single -> double        (no rounding needed for JS's f64)
// A faithful port MUST wrap single-precision expressions in `Math.fround`, and
// float outputs (out_s, out_h, the vector<float> in getCurve, and the return of
// maxDiff which is loaded as a float) MUST be single-precision.
//
// STATUS (this file).  All four method bodies are heavy SIMD (200-600 lines
// each) with the control flow interleaved with literal-pool constants that are
// not yet numerically resolved. Under the porting rules, an approximate rewrite
// is not allowed; each method is therefore delivered as a throwing stub that
// cites its @0xADDR and its frontier callees. The frontier list above is the
// exact set of Flexo symbols that must be decoded next before the bodies can
// be transcribed line-for-line.

// ---------------------------------------------------------------------------
// point2 — the 8-byte {x,y} float pair the SCurve stack buffer holds.
// Recovered from the stack layout at -0x40..-0x18(%rbp) in computeBezierShadowsHightlight
// (5 slots x 8 bytes = 0x28), plus the {x,y} field access pattern in BezierYfromX callers.
// ---------------------------------------------------------------------------
/** point2 (Flexo).  16-bit-aligned float pair — { x, y } — read via movaps/movlps
 *  and passed by pointer into ASpline2Bezier / BezierYfromX. */
export interface point2 {
  x: number;  // float32
  y: number;  // float32
}

// ---------------------------------------------------------------------------
// Frontier callees (undecoded — throwing stubs citing their @0xADDR).
// ---------------------------------------------------------------------------

/** ASpline2Bezier(point2* out, int n, point2* pts)  @Flexo 0x6330a (call site).
 *  External C symbol `__Z14ASpline2BezierP6point2iS0_`. Reduces `n` Newton-basis
 *  spline control points to a Bezier control polygon (in-place-like: out and pts
 *  may alias per callsite; in this class pts=%rdi=<stack buf>, out=%rdx=`%rbx`
 *  which is the SCurve object pointer passed in the first arg — meaning the
 *  Bezier control points are written back into the SCurve instance).
 *  Body lives elsewhere in Flexo; not yet transcribed. */
export function ASpline2Bezier(_out: point2[], _n: number, _pts: point2[]): void {
  throw new Error("ASpline2Bezier @Flexo (external, called from SCurve::computeBezierShadowsHightlight @Flexo 0x6330a) not yet transcribed");
}

/** BezierYfromX(point2* pts, int n, float x)  @Flexo 0x64015 (call site).
 *  External C symbol `__Z12BezierYfromXP6point2if`. Evaluates a Bezier curve
 *  (n+1 control points; n=0xD i.e. 13 here) at the given normalized x, returning
 *  the corresponding y (single-precision, in %xmm0). Not yet transcribed. */
export function BezierYfromX(_pts: point2[], _n: number, _x: number): number {
  throw new Error("BezierYfromX @Flexo (external, called from SCurve::getCurve @Flexo 0x64015) not yet transcribed");
}

// ---------------------------------------------------------------------------
// SCurve methods — deferred stubs pending decode of the SIMD bodies.
// ---------------------------------------------------------------------------

/** SCurve::computeBezierShadowsHightlight(double a, double b, double c, double d,
 *                                         point2* out5, float& out_shadow,
 *                                         float& out_highlight)   @Flexo 0x62f40
 *
 *  Register-arg mapping (System V AMD64, from the entry at @0x62f4c..@0x62f70):
 *    %rdi (this)     -> the SCurve instance; ASpline2Bezier writes its Bezier
 *                       control points back into this pointer.
 *    %xmm0 (double)  -> `a`  (shadows-input;   compared to 0 at @0x62f7a).
 *    %xmm1 (double)  -> `b`  (highlights-input; compared to 0 at @0x62f98).
 *    %xmm2 (double)  -> `c`  (scaled by a constant at @0x63048; a slope-like factor).
 *    %xmm3 (double)  -> `d`  (also stored to -0x70(%rbp) for later use in the Bezier build).
 *    (arg 5-7 on stack)
 *    %rsi (float&)   -> `out_shadow`     (initialized to 0.0f at @0x62fa6).
 *    %rdx (float&)   -> `out_highlight`  (initialized to 1.0f = 0x3f800000 at @0x62fc0/@0x62fe4).
 *
 *  Full transcription pending: the body is 220 lines of SIMD blended-select
 *  arithmetic with logf/powf calls at @0x63155 and @0x631f7/@0x632af, followed
 *  by a call to ASpline2Bezier @0x6330a with the 5 stacked control points.
 *
 *  Frontier callees (must be decoded before this body can be written):
 *    _logf                 @Flexo stubs 0x63155, 0x6313c
 *    _powf                 @Flexo stubs 0x631f7, 0x632af
 *    ASpline2Bezier        @Flexo 0x6330a
 *  Plus ~10 unresolved RIP-relative literal-pool constants listed in the
 *  file header (@0x62f6e / @0x62f84 / @0x62ff8 / @0x62fef / @0x63048 / etc.).
 */
export function SCurve_computeBezierShadowsHightlight(
  _self: object,
  _a: number, _b: number, _c: number, _d: number,
  _out5: point2[],
  _outShadow: { value: number },
  _outHighlight: { value: number },
): void {
  throw new Error("SCurve::computeBezierShadowsHightlight @Flexo 0x62f40 not yet transcribed (needs _logf, _powf, ASpline2Bezier @0x6330a, plus decode of RIP-relative constants at 0x62f6e, 0x62f84, 0x62ff8, 0x62fef, 0x63048, 0x630f1, 0x63170, 0x63178, 0x63225)");
}

/** SCurve::getCurve(double a, double b, double c, double d,
 *                   std::vector<float>& out)         @Flexo 0x63eb0
 *
 *  Register-arg mapping (from @0x63eb0..@0x63ee7):
 *    %rdi -> `this` (SCurve*), stored to -0xf0(%rbp) at @0x63ec4.
 *    %xmm0..%xmm3 -> a,b,c,d (same convention as computeBezierShadowsHightlight).
 *    %rsi (arg 6) -> std::vector<float>& out.
 *
 *  Body outline observed at 0x63ee0..0x64265:
 *    (1) callq SCurve::computeBezierShadowsHightlight @0x63eee to build the
 *        Bezier control points into `this` and get out_shadow (-0xe4(%rbp))
 *        and out_highlight (-0xe0(%rbp)).
 *    (2) Loop `for (i = 0; i < 0x100; ++i)` (@0x63fce cmpq $0x100, %rdx):
 *          x = (float)i / 255.0f          (@0x64001 divss 0x1508f5f(%rip),%xmm0)
 *          y = BezierYfromX(this, 0xD, x) (@0x64015 call)
 *          plus post-processing that blends x into two sub-intervals bounded
 *          by out_shadow/out_highlight (visible at @0x64070..@0x640da), and
 *          push_back the resulting float into the std::vector<float>.
 *    (3) The vector is grown to length 256; capacity reallocs go through the
 *        __throw_length_error path at @0x64bxx.
 *
 *  Frontier callees (must be decoded before this body can be written):
 *    SCurve::computeBezierShadowsHightlight   @Flexo 0x62f40 (self, above)
 *    BezierYfromX                              @Flexo 0x64015
 *    std::vector<float>::push_back / capacity / __throw_length_error
 *    Plus resolution of the RIP-relative float constants at 0x63f05, 0x63f15,
 *    0x63f4b, 0x63f5f (all pulled from the literal pool during the pre-loop
 *    setup at @0x63efd..@0x63f7b).
 */
export function SCurve_getCurve(
  _self: object,
  _a: number, _b: number, _c: number, _d: number,
  _out: number[],
): void {
  throw new Error("SCurve::getCurve @Flexo 0x63eb0 not yet transcribed (depends on SCurve::computeBezierShadowsHightlight @Flexo 0x62f40 and BezierYfromX @Flexo 0x64015)");
}

/** SCurve::maxDiff(std::vector<float> const& xs,
 *                  std::vector<float> const& ys,
 *                  double a, double b, double c, double d)   @Flexo 0x642d0
 *
 *  Register-arg mapping (from @0x642d0..@0x64300):
 *    %rdi -> `this` (SCurve*)          (only used to feed computeBezierShadowsHightlight).
 *    %rsi -> const std::vector<float>& xs.
 *    %rdx -> const std::vector<float>& ys.
 *    %xmm0..%xmm3 -> a,b,c,d.
 *  Returns: float (in %xmm0). The L-inf (or L2 — requires body decode)
 *  residual between the current SCurve(a,b,c,d) and the sampled (xs,ys).
 *
 *  Body outline: two calls to SCurve::computeBezierShadowsHightlight visible
 *  at @0x64707 and @0x64f31, plus a Vec2f-typed inner allocation
 *  (`__throw_length_error` at @0x64b73 references std::vector<Vec2f>). Full
 *  loop math is 750 lines of SIMD and not yet transcribed.
 *
 *  Frontier callees:
 *    SCurve::computeBezierShadowsHightlight   @Flexo 0x62f40
 *    std::vector<Vec2f>::__throw_length_error @0x64b73
 *    std::__throw_bad_array_new_length        @0x64b7a
 *    operator delete (__ZdlPv)                @0x64bb2
 *    __Unwind_Resume                          @0x64bba
 */
export function SCurve_maxDiff(
  _self: object,
  _xs: number[], _ys: number[],
  _a: number, _b: number, _c: number, _d: number,
): number {
  throw new Error("SCurve::maxDiff @Flexo 0x642d0 not yet transcribed (depends on SCurve::computeBezierShadowsHightlight @Flexo 0x62f40)");
}

/** SCurve::fitCurveToPoints(std::vector<float> const& xs,
 *                           std::vector<float> const& ys,
 *                           double& a, double& b, double& c, double& d,
 *                           float tolerance)                @Flexo 0x63330
 *
 *  Register-arg mapping (from @0x63330..@0x63370):
 *    %rdi -> `this` (SCurve*).
 *    %rsi -> const std::vector<float>& xs.
 *    %rdx -> const std::vector<float>& ys.
 *    %rcx, %r8, %r9, and one stack slot -> double& a, b, c, d (in/out params).
 *    %xmm0 (float via cvtss2sd on stack) -> tolerance.
 *
 *  Body outline (600 lines of SIMD): sets up a Grand-Central-Dispatch block
 *  whose invoke lives at @0x64c80 (`_ZN12_GLOBAL__N_117cFitCurveToPointsE..._block_invoke`,
 *  copy/dispose helpers at @0x64bc0/@0x64c00/@0x64c20/@0x64c60). Iterates over
 *  candidate (a,b,c,d) tuples, calling maxDiff, and keeps the best. Concrete
 *  algorithm (gradient descent, Nelder-Mead, or bracketed line-search) requires
 *  decoding the block trampoline body — not yet done.
 *
 *  Frontier callees:
 *    SCurve::maxDiff                                          @Flexo 0x642d0 (self, above)
 *    SCurve::getCurve                                         @Flexo 0x63eb0 (self, above)
 *    _dispatch_apply_f  /  block_invoke                       @Flexo 0x64c80 (block trampoline)
 *    std::vector<...>::__throw_length_error / bad_array_new   @Flexo 0x64b73/0x64b7a
 */
export function SCurve_fitCurveToPoints(
  _self: object,
  _xs: number[], _ys: number[],
  _a: { value: number }, _b: { value: number },
  _c: { value: number }, _d: { value: number },
  _tolerance: number,
): void {
  throw new Error("SCurve::fitCurveToPoints @Flexo 0x63330 not yet transcribed (depends on SCurve::maxDiff @Flexo 0x642d0, SCurve::getCurve @Flexo 0x63eb0, and the block trampoline @Flexo 0x64c80)");
}
