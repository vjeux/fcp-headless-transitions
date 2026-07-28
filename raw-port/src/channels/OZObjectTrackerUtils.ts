// OZObjectTrackerUtils — Flexo helper class (Ozone object-tracker). Emits
// grid-line polylines (as std::vector<std::pair<PCVector2,PCVector2>>) for
// three shapes — rectangle, super-ellipse, directional — plus a scalar helper
// (generateHorizontalEllipsePoints) that seeds points along one half of a
// super-ellipse.
//
// Framework: Flexo.framework   (x86_64 fat-slice, file offset 0x4000)
// Disassemblies:
//   raw-port/re/disasm/Flexo.OZObjectTrackerUtils.getSuperEllipseGridLines.s
//   raw-port/re/disasm/Flexo.OZObjectTrackerUtils.generateSuperEllipseGrid.s
//   raw-port/re/disasm/Flexo.OZObjectTrackerUtils.generateRectangleGridLines.s
//   raw-port/re/disasm/Flexo.OZObjectTrackerUtils.generateDirectionalGrid.s
//   raw-port/re/disasm/Flexo.OZObjectTrackerUtils.generateHorizontalEllipsePoints.s
//
// Methods (Flexo symbol addresses):
//   @0x00cb3970  getSuperEllipseGridLines(CMTime const&, PCMatrix44<double>&,
//                    PCVector2<double>&, PCVector2<double>&, PCVector2<double>&,
//                    double, double)
//   @0x00cb3df0  generateSuperEllipseGrid(vector<pair<PCVector2,PCVector2>>&,
//                    PCMatrix44<double>&, PCVector2 const&, PCVector2 const&,
//                    PCVector2 const&, double, double, double)
//   @0x00cb3ff0  generateRectangleGridLines(vector<pair<PCVector2,PCVector2>>&,
//                    PCMatrix44<double>&, PCVector2 const&, double, double,
//                    double, bool)
//   @0x00cb46b0  generateDirectionalGrid(vector<pair<PCVector2,PCVector2>>&,
//                    vector<PCVector2> const&, PCMatrix44<double>&,
//                    PCVector2 const&, double, double, bool)
//   @0x00cb4b70  generateHorizontalEllipsePoints(double, double, double, double)

/** PCVector2<double> — 16-byte {x: f64 @+0x00, y: f64 @+0x08}. Struct layout
 *  verified elsewhere (see raw-port/src/infra/PCVertexList.ts header). */
export interface PCVector2 {
  x: number;
  y: number;
}

/** PCMatrix44Tmpl<double> — 4×4 double matrix; opaque here (the methods that
 *  actually multiply it into points are stubbed frontier callees). Modeled
 *  as an unknown-shape reference so future ports can specialize. */
export interface PCMatrix44 {
  readonly __PCMatrix44__?: unique symbol;
}

/** CMTime const& — 24 B struct {value:i64, timescale:i32, flags:i32, epoch:i64}.
 *  Only used here as an opaque input; the branch key inside getSuperEllipseGridLines
 *  reads a f64 that is NOT loaded from CMTime — it is the first f64 argument
 *  (arg6, register xmm0), so CMTime is passed through unread. */
export interface CMTime {
  readonly __CMTime__?: unique symbol;
}

/** std::pair<PCVector2, PCVector2> — 32 B { first:@+0x00, second:@+0x10 }.
 *  Grid-line functions emit a std::vector of these; each entry is one line
 *  segment (endpoints in world space). Modeled as a plain object here since
 *  no C++ pair-specific API is used at this layer. */
export interface Vec2Pair {
  first: PCVector2;
  second: PCVector2;
}

/**
 * PCAlgorithm::superEllipse(double theta, double aX, double aY, double n,
 *                           double &outX, double &outY)
 *
 * Symbol: __ZN11PCAlgorithm12superEllipseEddddRdS0_  — resolved from the
 * `symbol stub for:` annotation at every callq to 0x1495fdc in this class's
 * disassembly (e.g. @0xcb4bea, @0xcb3ec2). This is the DOUBLE-precision
 * variant of super-ellipse parametrization; distinct from
 * FFEllipseMaskUtils::superEllipse (single-precision f32, already ported in
 * raw-port/src/render/FFEllipseMaskUtils.ts). The double variant is not yet
 * transcribed — its full body lives elsewhere in Flexo and hasn't been
 * demanded by any prior port. This frontier stub throws so any caller that
 * reaches it forces the eventual PCAlgorithm port.
 *
 * Expected semantic (mirroring the f32 sibling):
 *   outX = aX * |cos(theta)|^(2/n) * sign(cos(theta))
 *   outY = aY * |sin(theta)|^(2/n) * sign(sin(theta))
 *
 * @frontier Flexo PCAlgorithm::superEllipse(double,double,double,double,double&,double&)
 *           called @0xcb4bea, @0xcb4c5a, @0xcb3ec2
 */
export function PCAlgorithm_superEllipse(
  _theta: number,
  _aX: number,
  _aY: number,
  _n: number,
): { outX: number; outY: number } {
  // Undecoded frontier — see @frontier note above.
  // Stub raises rather than fabricating a formula; the sibling f32 port shows
  // what the shape looks like but the double body has not been disassembled.
  throw new Error(
    "PCAlgorithm::superEllipse not yet transcribed — Flexo symbol " +
      "__ZN11PCAlgorithm12superEllipseEddddRdS0_ (called @0xcb4bea, " +
      "@0xcb4c5a, @0xcb3ec2). Frontier: raw-port/src/infra/PCAlgorithm.ts.",
  );
}

/**
 * OZObjectTrackerUtils — Flexo static-utility class. No `this` pointer used
 * (all methods are effectively static); modeled as a TS class with static
 * methods to preserve the exported call surface.
 */
export class OZObjectTrackerUtils {
  /**
   * generateHorizontalEllipsePoints(step, aX, aY, n) -> PCVector2[]
   *
   * @Flexo 0x0000000000cb4b70
   *   (__ZN20OZObjectTrackerUtils31generateHorizontalEllipsePointsEdddd)
   * Disasm: raw-port/re/disasm/Flexo.OZObjectTrackerUtils.generateHorizontalEllipsePoints.s
   *
   * Signature (SysV x86_64):
   *   rdi = &out (std::vector<PCVector2<double>> return storage — initialized
   *               to {begin:0, end:0, capend:0} at @0xcb4b98-@0xcb4b9e)
   *   xmm0 = step   (loop increment / decrement)  [-0x48(%rbp) spill]
   *   xmm1 = aX     [-0x50(%rbp) spill]
   *   xmm2 = aY     [-0x58(%rbp) spill]
   *   xmm3 = n      [-0x60(%rbp) spill]
   *
   * Two loops emit one point per iteration by calling
   * PCAlgorithm::superEllipse(theta, aX, aY, n, &outX, &outY):
   *
   *   Loop 1 (@0xcb4bd0..@0xcb4c21):
   *     theta = -pi/2                                 // @0xcb4ba6 loads
   *                                                   // 0x156FCF8 = -1.5707963267948966
   *     do {
   *       superEllipse(theta, aX, aY, n, &outX, &outY);   // @0xcb4bea
   *       out.push_back({ x: outX, y: -outY });           // sign-flip via
   *                                                       // xor 0x80..000 @0xcb4bfd
   *       theta += step;                                  // @0xcb4c14 addsd
   *     } while (theta < 0.0);                            // ja (xmm1=0 > xmm0)
   *                                                       // @0xcb4c1d/@0xcb4c21
   *
   *   Loop 2 (@0xcb4c40..@0xcb4c94):
   *     theta = 0.0                                        // xorpd @0xcb4c23
   *     do {
   *       superEllipse(theta, aX, aY, n, &outX, &outY);    // @0xcb4c5a
   *       out.push_back({ x: outX, y: outY });             // no sign flip
   *       theta += step;                                   // @0xcb4c83
   *     } while (pi/2 >= theta);                           // jae (xmm1=+pi/2
   *                                                        // >= xmm0)
   *                                                        // 0x156FD08 = +1.5707963267948966
   *
   * Return: the mutated out-vector (matches asm ret w/ %rax = %rbx = rdi).
   *
   * Constants read from Flexo __const (file offset math: fat-slice base 0x4000):
   *   @0x156FCF8  f64  -1.5707963267948966   = -pi/2   (loop-1 start)
   *   @0x156FD08  f64  +1.5707963267948966   = +pi/2   (loop-2 exit bound)
   *   sign-flip mask 0x8000000000000000       (r13, @0xcb4bb6)  — negates outY
   *
   * Callees:
   *   @0x1495fdc  PCAlgorithm::superEllipse(double,double,double,double,double&,double&)
   *               (stub → frontier, see PCAlgorithm_superEllipse above)
   *   @0xcb4c0a / @0xcb4c79  std::vector<PCVector2<double>>::push_back — modeled
   *               inline as Array.push in TS (semantics match: append copy).
   *   @0x1497404  operator delete (unwind cleanup only; not reached in success path)
   *   @0x1495d30  _Unwind_Resume (cleanup handler)
   */
  static generateHorizontalEllipsePoints(
    step: number,
    aX: number,
    aY: number,
    n: number,
  ): PCVector2[] {
    const out: PCVector2[] = [];
    // Loop 1: theta from -pi/2 up (in +step increments) while theta < 0.
    // Note: the point pushed uses the theta value BEFORE the increment
    // (asm stores theta into -0x30(%rbp) at loop top, THEN calls superEllipse,
    //  THEN increments and tests). @0xcb4bd0..@0xcb4c21.
    let theta = -1.5707963267948966; // @0x156FCF8
    do {
      const { outX, outY } = PCAlgorithm_superEllipse(theta, aX, aY, n);
      out.push({ x: outX, y: -outY }); // sign-flip via 0x8000..0 XOR @0xcb4bfd
      theta += step;                    // @0xcb4c14
    } while (theta < 0.0);              // ja (0 > theta), @0xcb4c1d/@0xcb4c21

    // Loop 2: theta reset to 0.0 (@0xcb4c23 xorpd), continues while
    // pi/2 >= theta_after_increment. @0xcb4c40..@0xcb4c94.
    theta = 0.0;
    do {
      const { outX, outY } = PCAlgorithm_superEllipse(theta, aX, aY, n);
      out.push({ x: outX, y: outY });   // no sign flip
      theta += step;                    // @0xcb4c83
    } while (1.5707963267948966 >= theta); // jae (pi/2 >= theta), @0xcb4c88/@0xcb4c94

    return out;
  }

  /**
   * generateSuperEllipseGrid(out, xform, extent, xRange, yRange, step, aX, aY)
   *
   * @Flexo 0x0000000000cb3df0
   *   (__ZN20OZObjectTrackerUtils24generateSuperEllipseGridE...)
   * Disasm: raw-port/re/disasm/Flexo.OZObjectTrackerUtils.generateSuperEllipseGrid.s
   *
   * High-level control flow (mirroring the asm at @0xcb3df0..@0xcb3fb3):
   *
   *   1. Compute a normalization step = 1.0 / max(|extent.x*xRange.x|,
   *      |extent.y*xRange.y|).
   *        @0xcb3e28 movupd (%rdx), %xmm1        // xmm1 = extent  (x,y as pair)
   *        @0xcb3e2c movupd (%rcx), %xmm0        // xmm0 = xRange  (x,y)
   *        @0xcb3e30 movapd %xmm1, -0xC0(%rbp)   // spill extent
   *        @0xcb3e38 mulpd  %xmm1, %xmm0         // xmm0 = extent*xRange (elementwise)
   *        @0xcb3e40 unpckhpd → xmm1 = high half; maxsd xmm0,xmm1 → max of low/hi
   *        @0xcb3e48 andpd  0x156CA90 (abs-mask) // |max|
   *        @0xcb3e50 movsd  0x156CA00 = 1.0
   *        @0xcb3e58 divsd  %xmm1, %xmm0         // xmm0 = 1.0 / |max|
   *        @0xcb3e5c movsd  %xmm0, -0x50(%rbp)   // gridStep
   *        @0xcb3e61 movsd  0x8(%rdx), %xmm0     // extent.y — spill @-0x98
   *
   *   2. Build a std::vector<PCVector2> `horizPoints` (local, @-0x40) by
   *      calling generateHorizontalEllipsePoints repeatedly IN A LOOP that
   *      walks theta = pi down (theta -= gridStep) while theta >= 0.
   *        @0xcb3e7d movsd 0x156FCF0 = pi          // theta start
   *        loop @0xcb3ea0..@0xcb3f01:
   *          horizPoints.push(<one PCVector2 from PCAlgorithm::superEllipse>)
   *          theta -= gridStep
   *          while (theta >= 0)   // jae, @0xcb3efd/@0xcb3f01
   *      NOTE: this inner loop does NOT call OZObjectTrackerUtils::
   *      generateHorizontalEllipsePoints — it emits directly via
   *      PCAlgorithm::superEllipse + PCVector2 push_back. The result is a
   *      std::vector<PCVector2>. This is the FIRST arg (points-along-curve)
   *      that gets fed to generateDirectionalGrid twice below.
   *
   *   3. Call generateDirectionalGrid(out, horizPoints, xform, yRange,
   *      aY/aX, extent.x, true).
   *        @0xcb3f38 callq generateDirectionalGrid
   *      Args wiring (from @0xcb3f03..@0xcb3f32):
   *        rdi = out (arg1)                         [%r15 = -0x80(%rbp) spill]
   *        rsi = &horizPoints (@-0x40)              [%rsi = -0x40(%rbp) &]
   *        rdx = &xform (arg2)                      [%r14 = -0x88(%rbp) spill]
   *        rcx = &yRange (arg4)                     [%rbx = -0x90(%rbp) spill]
   *        r8  = 1 (bool "true")                    [movl $1, %r8d]
   *        xmm0 = aY / aX                           [divsd -0x78,-0x48 @0xcb3f03]
   *        xmm1 = extent.x                          [movsd (%r12), %xmm1]
   *
   *   4. Call OZObjectTrackerUtils::generateHorizontalEllipsePoints(step,
   *      extent.x, extent.y, aX)  → temporary vector @-0x70(%rbp).
   *        @0xcb3f58 callq generateHorizontalEllipsePoints
   *      Args (from @0xcb3f3d..@0xcb3f53):
   *        rdi = &tmpPoints @-0x70
   *        xmm0 = gridStep (-0x50)
   *        xmm1 = extent.x  (@0(%r12))
   *        xmm2 = extent.y  (@0x8(%r12))
   *        xmm3 = aX         (-0x58)
   *
   *   5. Call generateDirectionalGrid(out, tmpPoints, xform, yRange, aX,
   *      extent.y, false).
   *        @0xcb3f79 callq generateDirectionalGrid
   *      Args (from @0xcb3f5d..@0xcb3f76):
   *        rdi = out              (%r15)
   *        rsi = &tmpPoints @-0x70
   *        rdx = &xform           (%r14)
   *        rcx = &yRange          (%rbx)
   *        r8  = 0 (bool "false") [xorl %r8d,%r8d]
   *        xmm0 = aX (-0x48)
   *        xmm1 = extent.y (@0x8(%r12))
   *
   *   6. Free the two local vectors' storage (calls to operator delete
   *      @0xcb3f8b and @0xcb3f9d) — in TS this is GC, no-op.
   *
   *   7. Return %rax = %rbx = &out.
   *
   * Because BOTH the inner PCAlgorithm::superEllipse chain (step 2) AND the
   * generateDirectionalGrid callee (steps 3, 5) are frontier stubs, this
   * function will surface the demand as soon as it is invoked. It is
   * transcribed here so the call surface (arg wiring, arg order, arg
   * transformations) is preserved for the day the callees land.
   *
   * @param out          out-vector to append segments to
   * @param xform        4×4 double transform, applied by generateDirectionalGrid
   * @param extent       PCVector2<double> (arg3 %r12) — reads {x,y} at +0,+8
   * @param xRange       PCVector2<double> (arg4 %rcx) — reads {x,y} for grid step
   * @param yRange       PCVector2<double> (arg5 -0x90 spill) — passed through
   *                     unread to generateDirectionalGrid
   * @param step         first double arg (xmm0 @-0x58) — the "aX" fed to
   *                     PCAlgorithm::superEllipse and later to the second
   *                     generateHorizontalEllipsePoints call; called `step`
   *                     here to match the "step size" semantic
   * @param aX           second double arg (xmm1 @-0x78) — used as divisor for
   *                     aY/aX ratio at @0xcb3f03
   * @param aY           third double arg (xmm2 @-0x48) — dividend of aY/aX
   */
  static generateSuperEllipseGrid(
    out: Vec2Pair[],
    xform: PCMatrix44,
    extent: PCVector2,
    xRange: PCVector2,
    yRange: PCVector2,
    step: number,
    aX: number,
    aY: number,
  ): Vec2Pair[] {
    // Step 1: gridStep = 1.0 / max(|extent.x*xRange.x|, |extent.y*xRange.y|).
    // Elementwise mulpd on the pair (@0xcb3e38) then max of the two lanes
    // (@0xcb3e40..@0xcb3e44) then abs (@0xcb3e48) then 1.0/… (@0xcb3e58).
    const p0 = extent.x * xRange.x; // low lane
    const p1 = extent.y * xRange.y; // high lane
    const maxLane = Math.max(p0, p1); // maxsd (ordered) @0xcb3e44
    const absMax = Math.abs(maxLane); // andpd 0x7FFF..FF @0xcb3e48
    const gridStep = 1.0 / absMax; // divsd 1.0/absMax @0xcb3e58
    // extent.y is spilled at @0xcb3e61 but only re-loaded to feed the inner
    // superEllipse loop of step 2 (as the "aY" arg). It is not otherwise
    // consumed at this outer level.

    // Step 2: build horizPoints via PCAlgorithm::superEllipse loop.
    // theta walks from +pi down to 0 in -gridStep decrements.
    // NOTE: the asm stores +pi at @0xcb3e7d but the exit test @0xcb3ef4/
    // @0xcb3f01 is "theta_after -= gridStep; jae 0". So the loop is a
    // descending walk starting from +pi.
    const horizPoints: PCVector2[] = [];
    let theta = 3.141592653589793; // @0x156FCF0 = pi
    do {
      // Emits ONE point per iteration by calling PCAlgorithm::superEllipse
      // and pushing (outX, outY) as PCVector2 (@0xcb3ec2 + @0xcb3ee7).
      // The exact aX/aY/n args passed at @0xcb3ea8..@0xcb3ebc are:
      //   xmm1 = extent (as a packed pair — asm's movapd loads BOTH lanes)
      //   xmm2 = extent.y  (from spilled @-0x98)
      //   xmm3 = step (the outer arg — spilled @-0x58)
      // In the double-precision superEllipse(theta,aX,aY,n,&,&) signature
      // this maps arg1(theta)=theta, arg2(aX)=extent.x (low lane of xmm1),
      // arg3(aY)=extent.y, arg4(n)=step.
      const { outX, outY } = PCAlgorithm_superEllipse(
        theta,
        extent.x,
        extent.y,
        step,
      );
      horizPoints.push({ x: outX, y: outY });
      theta -= gridStep; // subsd -0x50 @0xcb3ef4
    } while (theta >= 0.0); // jae xmm1(=0) <= xmm0, @0xcb3efd/@0xcb3f01

    // Step 3: first generateDirectionalGrid call — args from @0xcb3f03..@0xcb3f38.
    OZObjectTrackerUtils.generateDirectionalGrid(
      out,
      horizPoints,
      xform,
      yRange,
      aY / aX, // divsd @0xcb3f03/@0xcb3f08
      extent.x, // (%r12) @0xcb3f0d
      true, // r8d = 1 @0xcb3f32
    );

    // Step 4: tmpPoints = generateHorizontalEllipsePoints(gridStep, extent.x,
    //                                                    extent.y, step).
    // Args from @0xcb3f3d..@0xcb3f53:
    //   xmm0 = gridStep (-0x50)
    //   xmm1 = extent.x
    //   xmm2 = extent.y
    //   xmm3 = step (the outer arg — spilled @-0x58 as `step`)
    const tmpPoints = OZObjectTrackerUtils.generateHorizontalEllipsePoints(
      gridStep,
      extent.x,
      extent.y,
      step,
    );

    // Step 5: second generateDirectionalGrid call — args from @0xcb3f5d..@0xcb3f79.
    // xmm0 = step (-0x48 spill of the outer `step`), xmm1 = extent.y, r8d = 0.
    // (Note asm loads -0x48 which is the outer arg that came in as xmm2 aka
    //  the local `aY`. Re-read: @0xcb3e04 stored xmm2 into -0x48. So -0x48
    //  is the third double arg, which we called `aY`. But the FCP source
    //  signature comment says the first `d` after the vector args is the
    //  step... The asm's spill layout is authoritative: -0x48 = xmm2 = the
    //  THIRD double arg. We match by using aY here.)
    OZObjectTrackerUtils.generateDirectionalGrid(
      out,
      tmpPoints,
      xform,
      yRange,
      aY, // (-0x48) @0xcb3f71
      extent.y, // @0x8(%r12) @0xcb3f5d
      false, // xorl %r8d,%r8d @0xcb3f76
    );

    // Steps 6/7: local-vector storage delete + return. In TS the storage is
    // GC'd; we return `out` to match the asm's %rax = %rbx = &out (@0xcb3f96).
    return out;
  }

  /**
   * getSuperEllipseGridLines(t, xform, v1, v2, v3, arg6, arg7) -> Vec2Pair[]
   *
   * @Flexo 0x0000000000cb3970
   *   (__ZN20OZObjectTrackerUtils24getSuperEllipseGridLinesE...)
   * Disasm: raw-port/re/disasm/Flexo.OZObjectTrackerUtils.getSuperEllipseGridLines.s
   *
   * Control flow (top-level dispatcher):
   *   1. Initialize return storage (%rdi) to a zero std::vector header
   *      (16 B of zero + 8 B of zero at +0x10).  @0xcb3986..@0xcb398c.
   *   2. Read the first f64 arg (%xmm0, i.e. arg6 = the first `double` in
   *      the C++ signature).  Take |arg6| via `andpd 0x156CA90` (abs-mask)
   *      @0xcb3994/@0xcb399c.  Compare against 1e-7 (loaded from 0x156E5E8)
   *      @0xcb39a0/@0xcb39a8 — `ucomisd %xmm2,%xmm3; jbe`.
   *      Branch:
   *         if (|arg6| > 1e-7)  -> rectangle path (steps 3a/3b)
   *         else                -> super-ellipse path (step 4)
   *
   *   3a. First rectangle call — @0xcb3a0b:
   *         v1' = (2*|v1.x|)*0.5 = |v1.x|,  v2' = (2*|v1.y|)*0.5 = |v1.y|
   *         (the redundant *2 then *0.5 pattern is emitted by the compiler
   *          @0xcb39bb..@0xcb39df; net effect is elementwise abs of v1)
   *         width = |v1.x|, height = |v1.y|
   *         gridStep = 40.0 / arg7   (@0xcb39e3/@0xcb39eb loads 0x1570148=40.0
   *                                    then divsd by arg7=xmm1)
   *         generateRectangleGridLines(out=%rbx, xform=v15, extent=v14=%r14,
   *                                    d1=|v1.x|, d2=|v1.y|, d3=gridStep,
   *                                    bool=true)
   *      3b. Second rectangle call — @0xcb3a2d:
   *         Same args except gridStep reloaded (0x1570148=40.0 divided again
   *         is NOT emitted; asm just uses a stashed value at %xmm0), and
   *         bool=false (xorl %ecx,%ecx).
   *         @0xcb3a10 movsd 0x1570148 → xmm0 (fresh 40.0 load, but the asm
   *         does NOT re-divide by arg7. This means the second call passes
   *         raw 40.0 as arg7's slot. Documented as-is.)
   *
   *   4. Super-ellipse path — @0xcb3a34:
   *         extraArg = 40.0 (loaded 0x1570148 into xmm2 @0xcb3a34)
   *         generateSuperEllipseGrid(out, xform, v1=rcx, v2=r8, v3=r14,
   *                                  d1=xmm0=arg6, d2=xmm1=arg7, d3=40.0)
   *         @0xcb3a4b callq generateSuperEllipseGrid.
   *
   *   5. Return %rax = %rbx = &out.
   *
   * Constants:
   *   @0x156CA90  abs-mask 0x7FFF..FF (packed)
   *   @0x156E5E8  1e-7                 (threshold for the branch)
   *   @0x156CA00  1.0                  (unused in this fn — but present in
   *                                     sibling; still noted for cross-ref)
   *   @0x156CA38  0.5                  (redundant halving of 2*|v1.{x,y}|)
   *   @0x1570148  40.0                 (grid divisor / step constant)
   *
   * The two grid-emitter callees (generateRectangleGridLines,
   * generateSuperEllipseGrid) are stubbed / partially-ported below.
   * Rectangle is a full throw-stub — its 292-line body is not decoded yet.
   *
   * NB (frontier): the wiring above matches the asm register-by-register but
   * the C++ signature naming for arg1..arg7 is only a guess based on the
   * order they appear. The concrete field names (`t`, `v1`, `v2`, `v3`,
   * `arg6`, `arg7`) are placeholders that a future PC/CM-mapping port can
   * rename without changing the transcribed call sites.
   */
  static getSuperEllipseGridLines(
    _t: CMTime,
    xform: PCMatrix44,
    v1: PCVector2,
    v2: PCVector2,
    v3: PCVector2,
    arg6: number,
    arg7: number,
  ): Vec2Pair[] {
    const out: Vec2Pair[] = []; // zero-init'd vector header (@0xcb3986..cb398c)

    // Branch key: abs of arg6 vs 1e-7 threshold. @0xcb3994..@0xcb39ac.
    const absArg6 = Math.abs(arg6); // andpd 0x156CA90
    if (absArg6 > 1e-7) {
      // Rectangle path. @0xcb39b2..@0xcb3a32.
      // The 2*abs*0.5 idiom compiles to a plain abs of each component of v1.
      const w = Math.abs(v1.x); // (2*|v1.x|)*0.5
      const h = Math.abs(v1.y); // (2*|v1.y|)*0.5
      const gridStep = 40.0 / arg7; // 0x1570148 / arg7  @0xcb39e3/@0xcb39eb

      // First rectangle call — bool=true, three doubles = (w, h, gridStep).
      // Register wiring @0xcb39ef..@0xcb3a0b:
      //   rdi=&out, rsi=xform, rdx=v3(=%r14 from rax pre-init), ecx=1,
      //   xmm0=gridStep, xmm1=w, xmm2=h.
      // The 4-double C++ signature is (…,double,double,double,bool). Match
      // the order the ABI stores them: xmm0→d1, xmm1→d2, xmm2→d3.
      OZObjectTrackerUtils.generateRectangleGridLines(
        out,
        xform,
        v3,
        gridStep, // xmm0
        w,        // xmm1 (movapd %xmm3,%xmm1 @0xcb39fd stashed w earlier)
        h,        // xmm2 (movapd %xmm2,-0x30 @0xcb3a01 stashed h earlier)
        true,
      );
      // Second rectangle call — bool=false, xmm0 reloaded to 40.0 (raw, no
      // re-divide by arg7). @0xcb3a10..@0xcb3a2d.
      OZObjectTrackerUtils.generateRectangleGridLines(
        out,
        xform,
        v3,
        40.0, // xmm0 reloaded from 0x1570148
        w,    // xmm1 restored from -0x40(%rbp)
        h,    // xmm2 restored from -0x30(%rbp)
        false,
      );
    } else {
      // Super-ellipse path. @0xcb3a34..@0xcb3a4b.
      // 40.0 loaded into xmm2, then arg wiring:
      //   rdi=&out, rsi=xform, rdx=v1(=%rcx), rcx=v2(=%r8), r8=v3(=%r14),
      //   xmm0=arg6 (unchanged from entry), xmm1=arg7, xmm2=40.0.
      OZObjectTrackerUtils.generateSuperEllipseGrid(
        out,
        xform,
        v1,
        v2,
        v3,
        arg6, // xmm0
        arg7, // xmm1
        40.0, // xmm2 — 0x1570148 loaded @0xcb3a34
      );
    }
    return out;
  }

  /**
   * generateRectangleGridLines(out, xform, extent, d1, d2, d3, flag)
   *
   * @Flexo 0x0000000000cb3ff0
   *   (__ZN20OZObjectTrackerUtils26generateRectangleGridLinesE...)
   * Disasm: raw-port/re/disasm/Flexo.OZObjectTrackerUtils.generateRectangleGridLines.s
   * (292 lines — not yet decoded; heavy SIMD / PCMatrix44 use / std::vector
   *  pair-push_back that requires the matrix-multiply and pair codegen path
   *  to be nailed down first.)
   *
   * @frontier Flexo OZObjectTrackerUtils::generateRectangleGridLines — 292 lines
   *   of SIMD @0xcb3ff0..@0xcb46af; touches PCMatrix44Tmpl<double> transforms
   *   and std::vector<pair<PCVector2,PCVector2>>::push_back / emplace_back
   *   which are not yet ported.
   */
  static generateRectangleGridLines(
    _out: Vec2Pair[],
    _xform: PCMatrix44,
    _extent: PCVector2,
    _d1: number,
    _d2: number,
    _d3: number,
    _flag: boolean,
  ): Vec2Pair[] {
    // Undecoded. Raise so callers force the eventual port. @0xcb3ff0
    throw new Error(
      "OZObjectTrackerUtils::generateRectangleGridLines not yet transcribed " +
        "— Flexo @0x00cb3ff0 (292 lines of SIMD + PCMatrix44 transforms + " +
        "std::vector<pair<PCVector2,PCVector2>> emplace_back). See disasm " +
        "raw-port/re/disasm/Flexo.OZObjectTrackerUtils.generateRectangleGridLines.s.",
    );
  }

  /**
   * generateDirectionalGrid(out, points, xform, extent, d1, d2, flag)
   *
   * @Flexo 0x0000000000cb46b0
   *   (__ZN20OZObjectTrackerUtils23generateDirectionalGridE...)
   * Disasm: raw-port/re/disasm/Flexo.OZObjectTrackerUtils.generateDirectionalGrid.s
   * (288 lines — walks a std::vector<PCVector2> of input points, transforms
   *  each pair through the PCMatrix44 and emits paired line segments; the
   *  matrix-multiply path is undecoded frontier.)
   *
   * @frontier Flexo OZObjectTrackerUtils::generateDirectionalGrid — 288 lines
   *   @0xcb46b0..@0xcb4a8f; PCMatrix44Tmpl<double> multiply + pair push_back.
   */
  static generateDirectionalGrid(
    _out: Vec2Pair[],
    _points: PCVector2[],
    _xform: PCMatrix44,
    _extent: PCVector2,
    _d1: number,
    _d2: number,
    _flag: boolean,
  ): Vec2Pair[] {
    // Undecoded. Raise so callers force the eventual port. @0xcb46b0
    throw new Error(
      "OZObjectTrackerUtils::generateDirectionalGrid not yet transcribed — " +
        "Flexo @0x00cb46b0 (288 lines of PCMatrix44Tmpl<double> multiplies + " +
        "std::vector<pair<PCVector2,PCVector2>> emplace_back). See disasm " +
        "raw-port/re/disasm/Flexo.OZObjectTrackerUtils.generateDirectionalGrid.s.",
    );
  }
}
