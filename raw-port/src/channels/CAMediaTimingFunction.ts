// Ozone:CAMediaTimingFunction(Helpers) — ObjC category on Apple's CoreAnimation
// CAMediaTimingFunction (cubic-bezier timing function). Two methods:
//   -[CAMediaTimingFunction(Helpers) timingFunctionsSplitAtNormalizedTime:]  @0x288eb0
//   -[CAMediaTimingFunction(Helpers) nslogControlPoints]                     @0x2890e0
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework Ozone, x86_64 slice.

// -----------------------------------------------------------------------------
// -[CAMediaTimingFunction(Helpers) timingFunctionsSplitAtNormalizedTime:]
// -----------------------------------------------------------------------------
//
// Signature (recovered from ObjC msgSend calls):
//   (NSArray<CAMediaTimingFunction *> *)timingFunctionsSplitAtNormalizedTime:(double)t
//
// What it does (verbatim from disasm @0x288eb0..0x28908f):
//   1. Read control points p1 and p2 via
//        -[self getControlPointAtIndex:1 values:&pts1]     @0x288ef3 msgSend
//        -[self getControlPointAtIndex:2 values:&pts2]     @0x288f05 msgSend
//      Each writes 2 float32 values (x,y) into the stack slot.
//      Selector "getControlPointAtIndex:values:" resolved from selref @0x90f568.
//   2. Widen those 4 floats to 4 doubles (cvtps2pd @0x288f29 / 0x288f37).
//   3. Build two 4-element double arrays on the stack, laid out as
//        Xcoords = [ 0.0, p1.x, p2.x, 1.0 ]   at %rbp-0x50 stride 8
//        Ycoords = [ 0.0, p1.y, p2.y, 1.0 ]   at %rbp-0x70 stride 8
//      The endpoint 1.0 is a movabsq of 0x3ff0000000000000 @0x288f3e;
//      the endpoint 0.0 is `movq $0x0, ...` @0x288f08/0x288f10.
//      The runtime `1.0` reload @0x288f50 comes from f64 const @0x7053e0 = 1.0.
//   4. Call PCAlgorithm::DeCasteljauSubdivide (stub in __stubs @0x6dd5e4):
//        __ZN11PCAlgorithm20DeCasteljauSubdivideEdddPdS0_S0_S0_S0_S0_
//        signature: (double t, double a, double b,
//                    double* p0, double* p1, double* p2, double* p3, double* p4, double* p5)
//      called @0x288f87 with (t = xmm2, a = 0.0 = xmm0, b = 1.0 = xmm1) and 6 pointers
//      into the 6 stack slots at [-0x50, -0x70, -0x90, -0xb0, -0xd0, -0xf0], each a
//      2-double slot for the (x,y) coordinates of an output control point.
//      →  Body not yet transcribed (see raw-port/src/infra/PCAlgorithm.ts —
//         PCAlgorithm_DeCasteljauSubdivide is a THROWing stub @ProCore 0x15aa4).
//         Per PORTING_SPEC Rule 3 this whole method throws until that lands.
//   5. From the six output points p0..p5 (2 doubles each = (x,y)) the caller reconstructs
//      the two new timing functions:
//        segLeft  = CAMediaTimingFunction functionWithControlPoints:
//                       (p1x' - 0)/(midX - 0),
//                       (p1y' - 0)/(midY - 0),
//                       (p2x' - 0)/(midX - 0),
//                       (p2y' - 0)/(midY - 0)
//        segRight = CAMediaTimingFunction functionWithControlPoints:
//                       (p4x - midX)/(1 - midX),
//                       (p4y - midY)/(1 - midY),
//                       (p5x - midX)/(1 - midX),
//                       (p5y - midY)/(1 - midY)
//      The (subpd/divpd) block @0x288fae..0x28907c does exactly this normalization for
//      both halves, keeping each half in its OWN [0,1]×[0,1] Bezier space (Apple's
//      CAMediaTimingFunction stores relative control points).
//      Then it stores the 4 float control points to -0x28,-0x30 (4×f32 packed) — the
//      layout `functionWithControlPoints::::` expects: (c1x, c1y, c2x, c2y) as SEPARATE
//      float args in xmm0..xmm3.
//      The movshdup @0x288ff6/0x28908c splats hi lane → xmm1 = c1y, xmm3 = c2y.
//      Selector "functionWithControlPoints::::" resolved from selref @0x90f688.
//   6. objc_msgSend([NSArray class], @selector(arrayWithObjects:), segLeft, segRight, nil)
//      selref @0x909190 → "arrayWithObjects:". Return that array.
//
// The msgSend pointer is loaded ONCE into %r15 @0x288ee0 from the GOT slot @0x826028
// (= indirect entry for _objc_msgSend), and every ObjC message uses `callq *%r15`.
// This is a tail-call chain of six msgSends, each with %r15 = &objc_msgSend.
//
// Constants:
//   f64 @0x7053e0 = 1.0                                  (movsd @0x288f50)
//   imm 0x3ff0000000000000 = 1.0                          (movabsq @0x288f3e)
//   imm 0x0                                               (movq   @0x288f08 / @0x288f10)
//
// -----------------------------------------------------------------------------
// -[CAMediaTimingFunction(Helpers) nslogControlPoints]                @0x2890e0
// -----------------------------------------------------------------------------
// A debug logger — reads all 4 control points and NSLogs their coordinates. No math
// output. Deferred as a throw stub because it does not affect scene math (Rule 3).

/**
 * -[CAMediaTimingFunction(Helpers) timingFunctionsSplitAtNormalizedTime:] @0x288eb0
 *
 * Split an Apple CAMediaTimingFunction at normalized parameter `t` into two new
 * CAMediaTimingFunctions covering [0, t] and [t, 1], each renormalized so its own
 * control points are in [0,1]×[0,1] (the CAMediaTimingFunction convention).
 *
 * DEFERRED: the core algorithm is a de Casteljau cubic-bezier subdivision performed
 * by ProCore's PCAlgorithm::DeCasteljauSubdivide (@ProCore 0x15aa4), which is
 * currently a THROW stub in raw-port/src/infra/PCAlgorithm.ts. Per PORTING_SPEC
 * Rule 3 we throw here rather than substitute the subdivision — any alternative
 * scheme (e.g. Newton or bisection) would silently diverge from FCP's exact
 * recursive evaluator and corrupt every downstream sample.
 */
export function CAMediaTimingFunction_timingFunctionsSplitAtNormalizedTime(
  _self: unknown,
  _t: number,
): never {
  throw new Error(
    "-[CAMediaTimingFunction(Helpers) timingFunctionsSplitAtNormalizedTime:] " +
    "@0x288eb0 — control-flow decoded; blocked on PCAlgorithm::DeCasteljauSubdivide " +
    "@ProCore 0x15aa4 (deferred throw stub). See raw-port/src/channels/CAMediaTimingFunction.ts " +
    "header for the full post-DeCasteljau normalization formula recovered from " +
    "@0x288fae..0x28907c."
  );
}

/**
 * -[CAMediaTimingFunction(Helpers) nslogControlPoints] @0x2890e0
 *
 * Debug logger — calls -getControlPointAtIndex:values: four times and NSLogs the
 * results. Pure I/O; no scene-math impact. Deferred as a throw stub.
 */
export function CAMediaTimingFunction_nslogControlPoints(_self: unknown): never {
  throw new Error(
    "-[CAMediaTimingFunction(Helpers) nslogControlPoints] @0x2890e0 — " +
    "debug NSLog helper, not needed for scene math; body deferred."
  );
}
