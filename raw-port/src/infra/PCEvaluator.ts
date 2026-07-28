// raw-port/src/infra/PCEvaluator.ts
//
// FCP `PCEvaluator` — ProCore evaluator utility with two families of
// static-like member functions:
//
//   1. Ellipse family (pure math — arc length & point-on-arc):
//        findLengthOfEllipse (double, double, double, double)  @0xd2b4
//        findPointOnEllipse  (double, double, double, double, double,
//                             double*, double*, double*)       @0xd322
//   2. Sine-wave family (uses embedded PCEvaluatorWaveData at +0x38..0x5c
//      guarded by an embedded PCSpinLock at +0x58; frontier — not yet
//      transcribed):
//        findLengthOfSineWave (double, double, double, double,
//                              double, double, int)            @0xdce4
//        findPointOnSineWave  (double, double, double, double,
//                              double, double, double, int,
//                              double*, double*)               @0xdb02
//
// Faithfully transcribed from ProCore.framework/Versions/A/ProCore
// (x86_64 slice; VAs are otool -tV VAs). Uses the yet-to-be-ported
// PCCalculus (raw-port/src/infra/PCCalculus.ts — not yet landed) for
// the classical `ellipseLineIntegral` closed-form evaluator, so a
// through call from `findLengthOfEllipse` runs into a throw-stub until
// PCCalculus lands.
//
// Source disassembly (raw-port/re/disasm/):
//   ProCore.PCEvaluator.PCEvaluator.s                @0xd234 (C1 copy-ctor;
//                                                     C1 default @0xd234;
//                                                     C2 default @0xd210;
//                                                     C2 copy    @0xd258)
//   ProCore.PCEvaluator.findLengthOfEllipse.s        @0xd2b4
//   ProCore.PCEvaluator.findPointOnEllipse.s         @0xd322 (214 lines)
//   ProCore.PCEvaluator.findLengthOfSineWave.s       @0xdce4 (94 lines)
//   ProCore.PCEvaluator.findPointOnSineWave.s        @0xdb02 (327 lines)
//
// ---------------------------------------------------------------------------
// CLASS LAYOUT — 0x5c (92) bytes total, recovered from the four ctor
// variants (all four use the SAME zeroing sequence — the copy-ctor
// completely IGNORES its `PCEvaluator const&` source argument, i.e. a
// copy behaves exactly like a default construction. This is verbatim
// from the disasm and is preserved here as a Rule-1 mirror.):
//
//   +0x00  16 bytes  wavePoints[0..1]   // xorps xmm0; movups xmm0,(rdi)
//                                        //   double xArr0 (0x00)
//                                        //   double yArr0 (0x08)
//                                        //   (or whatever — packed4f-aligned
//                                        //    zero init; PCEvaluatorWaveData
//                                        //    ownership lives further down)
//   +0x10  16 bytes  zero               // movups xmm0,0x10(rdi)
//   +0x20  16 bytes  zero               // movups xmm0,0x20(rdi)
//   +0x30  4  bytes  int32 = 0          // movl $0,0x30(rdi)
//   +0x38  16 bytes  zero               // movups xmm0,0x38(rdi)
//                                        //   — start of embedded
//                                        //   PCEvaluatorWaveData
//                                        //   (D2 tail-jmps its dtor)
//   +0x48  16 bytes  zero               // movups xmm0,0x48(rdi)
//   +0x58  4  bytes  int32 = 0          // movl $0,0x58(rdi)
//                                        //   — first field of PCSpinLock
//                                        //   used by findLengthOfSineWave
//                                        //   @0xdd25 (leaq 0x58(rdi),r14 ->
//                                        //   PCSpinLock::lock)
//
// Total sizeof(PCEvaluator) = 0x5c = 92 bytes (0x30 own + 0x2c = 44 bytes for
// PCEvaluatorWaveData + PCSpinLock combined; PCEvaluatorWaveData starts at
// +0x38 and PCSpinLock at +0x58 within the wave-data struct).
//
// Note on the D2 dtor @0xd2a0: it's a bare `pushq/popq/jmp
// PCEvaluatorWaveData::~PCEvaluatorWaveData()`, so the whole object's
// non-trivial destruction reduces to destroying its embedded
// PCEvaluatorWaveData member (whose own dtor is a separate porting
// target — see the "frontier" section below).
//
// ---------------------------------------------------------------------------
// RIP-relative constants used by findLengthOfEllipse @0xd2b4 (ProCore
// __TEXT,__const section VA=[0xe1b10, 0x128569)):
//
//   @0x122670  packed 2xu64 = [0x7fffffffffffffff, 0x7fffffffffffffff]
//              (packed double-precision `fabs` sign-clear mask; loaded
//               via `movapd 0x1153ac(%rip),%xmm0` @0xd2bc — next-instr
//               VA=0xd2c4, offset 0x1153ac -> target 0x122670)
//
//   @0x122880  float64 = 1.0e-7
//              (epsilon threshold; loaded via `movsd 0x1155ac(%rip),%xmm3`
//               @0xd2cc — next=0xd2d4 -> 0x122880; and via `cmpltsd
//               0x115591(%rip),%xmm0` @0xd2e6 — next=0xd2ef -> 0x122880)
//
//   @0x122538  float64 = 4.0
//              (quarter-ellipse -> full-ellipse multiplier; loaded via
//               `mulsd 0x115252(%rip),%xmm2` @0xd2de — next=0xd2e6 -> 0x122538;
//               `mulsd 0x115236(%rip),%xmm1` @0xd2fa — next=0xd302 -> 0x122538;
//               `mulsd 0x115218(%rip),%xmm0` @0xd318 — next=0xd320 -> 0x122538)
//
//   @0x122570  float64 = 1.5707963267948966  (i.e. π/2)
//              (quarter-ellipse angle argument to
//               PCCalculus::ellipseLineIntegral; loaded via `movsd
//               0x11525d(%rip),%xmm0` @0xd30b — next=0xd313 -> 0x122570)
//
// All four values verified by direct byte-read of the ProCore x86_64
// slice at those file offsets — see the header comment above for the
// section-relative offset arithmetic (foff = VA - 0xe1b10 + 924432).
//
// ---------------------------------------------------------------------------
// FRONTIER (not decoded in this port pass):
//   * PCCalculus::ellipseLineIntegral(double, double, double)  @0xac24
//     — a call target of findLengthOfEllipse. Signature reads:
//       arg0 = angle (radians, the upper integration limit),
//       arg1 = semi-axis a, arg2 = semi-axis b. Body @0xac24 minsd's
//       xmm1 vs xmm2 to canonicalise (a<=b), squares both, and calls
//       into PCCalculus::LegendreEllipticE / F for the closed form.
//     Rule-3 throw-stub cited below at its call site.
//
//   * PCEvaluatorWaveData (embedded @+0x38..0x57): its default ctor, its
//     `operator=`, its `operator==`, its `refreshWaveArrays`, and its D2
//     dtor are ALL called by findLengthOfSineWave / findPointOnSineWave.
//     Whole class is unlanded; those two methods therefore stay Rule-3
//     throw-stubs until PCEvaluatorWaveData + PCSpinLock land.
//
//   * PCSpinLock (@+0x58..0x5b): lock/unlock guard the wave-data cache.
//     Unlanded.
//
//   * PCEvaluator::findPointOnEllipse @0xd322 (214 lines): a Newton /
//     bisection-style search on the ellipse arc-length-inverse. Body is
//     mechanical but long; deferred to its own porting pass — DO NOT
//     paraphrase (see PORTING_SPEC Rule 1 + the Newton-solver anti-shortcut
//     lesson in raw-port/army/PORTING_SPEC.md).

// -----------------------------------------------------------------------------
// Frontier throwing stubs.
// -----------------------------------------------------------------------------

/**
 * `PCCalculus::ellipseLineIntegral(double angle, double a, double b) -> double`
 * @ProCore 0xac24. Not yet transcribed.
 *
 * Called from `PCEvaluator::findLengthOfEllipse` @0xd313 with
 * angle=π/2 (loaded from @0x122570), a and b in xmm1/xmm2 (from the
 * caller's first two arguments).
 */
function PCCalculus_ellipseLineIntegral_at_0xac24(
  _angle: number,
  _a: number,
  _b: number,
): number {
  throw new Error(
    "raw-port: PCCalculus::ellipseLineIntegral(double,double,double) @ProCore 0xac24 " +
      "not yet transcribed (called from PCEvaluator::findLengthOfEllipse @0xd313)"
  );
}

/**
 * `PCEvaluatorWaveData::PCEvaluatorWaveData()` @ProCore (private) — invoked
 * indirectly via the embedded-member default-init of PCEvaluator. In the
 * PCEvaluator ctors themselves the wave-data is init'd inline via `xorps`
 * + two `movups`es (see LAYOUT above) — no external call — so this stub
 * is only reachable if a subclass reuses PCEvaluatorWaveData externally.
 */
function PCEvaluatorWaveData_default_ctor(): never {
  throw new Error(
    "raw-port: PCEvaluatorWaveData::PCEvaluatorWaveData() default ctor — not yet transcribed. " +
      "In PCEvaluator, the embedded wave-data is inline-zeroed by the C1/C2 ctors themselves."
  );
}

/**
 * `PCEvaluatorWaveData::~PCEvaluatorWaveData()` @ProCore (private) — tail-jmp
 * target of PCEvaluator::~PCEvaluator D2 @0xd2a5. Not yet transcribed.
 */
function PCEvaluatorWaveData_dtor_at_D2_call(): void {
  throw new Error(
    "raw-port: PCEvaluatorWaveData::~PCEvaluatorWaveData() — tail-jmp target of " +
      "PCEvaluator::~PCEvaluator D2 @0xd2a5. Not yet transcribed."
  );
}

// -----------------------------------------------------------------------------
// The class.
// -----------------------------------------------------------------------------

/**
 * `PCEvaluator` — ProCore's ellipse/sine-wave arc-length and
 * point-on-arc utility.
 *
 * See file header for the full layout, constant, and frontier map.
 */
export class PCEvaluator {
  // --- Layout mirror ------------------------------------------------------
  // The eight 8-byte doubles at +0x00..0x38 own no semantic name in the
  // disasm — they're just the "own state" of PCEvaluator (writeable by
  // its ctors, presumably read by findPointOnEllipse's Newton-solver
  // temporaries; the caching of ellipse arc-length parameters). Named
  // `state_00`..`state_30` here to keep the offset trail visible.

  /** @+0x00 (2 doubles cleared by `xorps xmm0; movups xmm0,(rdi)` @0xd224). */
  public state_00_lo: number = 0;
  /** @+0x08 (top half of the above movups). */
  public state_00_hi: number = 0;
  /** @+0x10 (movups xmm0,0x10(rdi) @0xd220). */
  public state_10_lo: number = 0;
  /** @+0x18. */
  public state_10_hi: number = 0;
  /** @+0x20 (movups xmm0,0x20(rdi) @0xd21c). */
  public state_20_lo: number = 0;
  /** @+0x28. */
  public state_20_hi: number = 0;
  /** @+0x30 int32 (`movl %eax,0x30(rdi)` @0xd216 with %eax=0). */
  public state_30_i32: number = 0;

  /** @+0x38..0x57 — embedded PCEvaluatorWaveData. Layout not decoded. */
  public waveData_38_lo: number = 0;
  /** @+0x40. */
  public waveData_38_hi: number = 0;
  /** @+0x48. */
  public waveData_48_lo: number = 0;
  /** @+0x50. */
  public waveData_48_hi: number = 0;

  /** @+0x58 int32 — first field of embedded PCSpinLock (spin-locked int). */
  public spinLock_58_i32: number = 0;

  /**
   * `PCEvaluator::PCEvaluator()` — default ctor. Both C1 @0xd234 and C2
   * @0xd210 have IDENTICAL bodies (no vtable install; not polymorphic):
   *
   *   pushq %rbp; movq %rsp,%rbp
   *   xorl %eax,%eax                  ; eax = 0
   *   movl %eax,0x30(%rdi)            ; state_30_i32 = 0
   *   xorps %xmm0,%xmm0               ; xmm0 = 0
   *   movups %xmm0,0x20(%rdi)         ; state_20 = 0
   *   movups %xmm0,0x10(%rdi)         ; state_10 = 0
   *   movups %xmm0,(%rdi)             ; state_00 = 0
   *   movups %xmm0,0x38(%rdi)         ; waveData_38 = 0
   *   movups %xmm0,0x48(%rdi)         ; waveData_48 = 0
   *   movl %eax,0x58(%rdi)            ; spinLock_58 = 0
   *   pop rbp; ret
   *
   * Also called by the copy-ctor `PCEvaluator(PCEvaluator const&)` at
   * @0xd258 (C2) / @0xd27c (C1), whose bodies are IDENTICAL to the
   * default ctor — the source-reference argument is COMPLETELY IGNORED
   * (verified by the disasm: no `%rsi` reads anywhere in either copy
   * body). This is preserved verbatim by the `constructor()` here and
   * by the `static copy()` factory below.
   */
  public constructor() {
    // Field defaults above already handle every zero-init. This body
    // corresponds to the disassembly at @0xd210..@0xd233 (C2 default) /
    // @0xd234..0xd257 (C1 default).
  }

  /**
   * `PCEvaluator::PCEvaluator(PCEvaluator const&)` @0xd258 (C2) / @0xd27c
   * (C1). The disassembly IGNORES the reference and just zero-inits, so
   * a copy is byte-identical to a default construction. Not a bug in
   * our port — a bug in FCP's own source that we mirror faithfully.
   *
   * We expose it as a static factory rather than a JS copy-constructor
   * so callers can't confuse it with a "deep-copy" they might expect.
   */
  public static copy(_source: PCEvaluator): PCEvaluator {
    // Faithful mirror of @0xd258..@0xd27b: no reads from `_source`.
    return new PCEvaluator();
  }

  /**
   * `PCEvaluator::~PCEvaluator()` — D2 @0xd2a0 tail-jmps
   * PCEvaluatorWaveData::~PCEvaluatorWaveData(). D1 @0xd2aa is the
   * complete-object dtor and has identical semantics via ICF-like
   * folding (`pushq %rbp; movq %rsp,%rbp; ...`). No other cleanup: the
   * seven doubles + one int at +0x00..+0x37 are trivial and require no
   * destruction; the embedded PCEvaluatorWaveData at +0x38 needs its
   * own destructor run, which is currently a Rule-3 frontier — see the
   * throw-stub above.
   */
  public destruct(): void {
    // Faithful mirror of D2 @0xd2a0-0xd2a5:  `jmp PCEvaluatorWaveData::D2`.
    PCEvaluatorWaveData_dtor_at_D2_call();
  }

  /**
   * `PCEvaluator::findLengthOfEllipse(double, double, double, double) -> double`
   * @0xd2b4. Body (34 lines, fully transcribed):
   *
   * The first two `movapd` at @0xd2b4-0xd2b8 permute the incoming xmm0/xmm1
   * registers — `xmm2 = old xmm1`, `xmm1 = old xmm0`. After that point
   * `xmm0` still holds its ORIGINAL value (the first argument, `a`).
   * The disassembly then loads a `fabs` mask into xmm0 (destroying the
   * original `a`), which means the FIRST TWO arguments are the only ones
   * that survive: they are conventionally the two semi-axes `a` and `b`.
   * The third and fourth arguments (xmm2, xmm3) are OVERWRITTEN
   * immediately by the first `movapd` and by `movsd 1e-7,xmm3`
   * respectively — the disasm never reads them. This is faithful and
   * preserved as `_arg2` / `_arg3` (unused) below.
   *
   * Semantics (register-for-register):
   *
   *   xmm2 = arg1 = b                            (0xd2b4)
   *   xmm1 = arg0 = a                            (0xd2b8)
   *   xmm0 = FABS_MASK @0x122670                 (0xd2bc)
   *   xmm4 = xmm1 = a                            (0xd2c4)
   *   xmm4 = xmm4 & FABS_MASK  = |a|             (0xd2c8)
   *   xmm3 = EPS_1e-7 @0x122880                  (0xd2cc)
   *   flags = ucomisd(xmm4, xmm3)  // |a| ? 1e-7 (0xd2d4)
   *   xmm0 = xmm2 & FABS_MASK  = |b|             (0xd2d8)
   *
   *   if (|a| <= 1e-7)   goto pathB @0xd2f4     (0xd2dc jbe)
   *
   *   // pathA (|a| > 1e-7):
   *   xmm2 = xmm2 * FOUR @0x122538  = 4*b        (0xd2de)
   *   xmm0 = cmpltsd(|b|, PI_OVER_2 @0x122570)  // xmm0 = (|b|<π/2) ? -1 : 0
   *                                              (0xd2e6)
   *   xmm0 = (~xmm0) & xmm2                      // = if(|b|<π/2) 0 else 4*b
   *                                              (0xd2ef andnpd)
   *   return xmm0                                (0xd2f3)
   *
   *   pathB (|a| <= 1e-7):
   *   flags = ucomisd(xmm0=|b|, xmm3=1e-7)      (0xd2f4)
   *   if (|b| <= 1e-7)   goto pathC @0xd307     (0xd2f8 jbe)
   *
   *   // pathB.tail (|b| > 1e-7):
   *   xmm1 = xmm1 * FOUR @0x122538  = 4*a        (0xd2fa)
   *   xmm0 = xmm1 = 4*a                          (0xd302)
   *   return xmm0                                (0xd306)
   *
   *   // pathC (|a| <= 1e-7  AND  |b| <= 1e-7):
   *   xmm0 = PI_OVER_2 @0x122570                 (0xd30b)
   *   xmm0 = PCCalculus::ellipseLineIntegral(π/2, a, b)  (0xd313 callq)
   *   xmm0 = xmm0 * FOUR @0x122538               (0xd318)
   *   return xmm0                                (0xd321)
   *
   * The three return paths correspond to the three "degenerate & general"
   * cases of a quarter-ellipse arc-length evaluation:
   *   - a nearly zero, b nearly zero      -> compute the general integral
   *   - a nearly zero, b not-nearly-zero  -> return 4b (degenerate: line)
   *   - a not-nearly-zero (any b)         -> weird `if(|b|<π/2) 0 else 4b`
   *
   * That third arm is peculiar (a well-formed ellipse arc-length would
   * usually call ellipseLineIntegral in the general case), but it IS
   * what the binary computes. We transcribe it verbatim per PORTING_SPEC
   * Rule 1.
   */
  public findLengthOfEllipse(
    a: number,
    b: number,
    _arg2: number,
    _arg3: number,
  ): number {
    // Constants (see file header for provenance).
    const EPS = 1.0e-7;             // @0x122880
    const FOUR = 4.0;               // @0x122538
    const PI_OVER_2 = 1.5707963267948966; // @0x122570
    // `andpd fabs_mask, x` in double precision = mask off the sign bit.
    const absA = Math.abs(a);       // 0xd2c8 andpd
    const absB = Math.abs(b);       // 0xd2d8 andpd
    // Path selector on |a| vs EPS.
    if (absA > EPS) {
      // Path A @0xd2de..0xd2f3.
      const fourB = b * FOUR;
      // `cmpltsd absB, PI_OVER_2` sets xmm0=(-1 if absB<PI/2, else 0);
      // then `andnpd xmm2, xmm0` = (~xmm0) & xmm2.
      // Net: return (absB < PI/2) ? 0 : 4*b.
      return (absB < PI_OVER_2) ? 0.0 : fourB;
    }
    // Path B/C — |a| <= EPS.
    if (absB > EPS) {
      // Path B.tail @0xd2fa..0xd306:  return 4*a.
      return a * FOUR;
    }
    // Path C @0xd307..0xd321: return 4 * PCCalculus::ellipseLineIntegral(π/2, a, b).
    return PCCalculus_ellipseLineIntegral_at_0xac24(PI_OVER_2, a, b) * FOUR;
  }

  /**
   * `PCEvaluator::findPointOnEllipse(double s, double angle1, double angle2,
   *   double a, double b, double* outX, double* outY, double* outOther)`
   * @0xd322 (214 lines).
   *
   * Newton/bisection point-on-arc solver. Reads the ellipse arc-length
   * evaluator (`PCCalculus::ellipseLineIntegral` @0xac24 — see the
   * throw-stub above) inside a fixed-point iteration to find the angle
   * θ at fractional-arc-length `s` along the arc from `angle1` to
   * `angle2` on an ellipse with semi-axes `(a, b)`, writing the (x, y)
   * point to `*outX`/`*outY` and an auxiliary quantity (arc-length /
   * derivative / etc.) to `*outOther`.
   *
   * The body is 214 lines of SSE double-precision arithmetic and calls
   * back into PCCalculus multiple times. Not yet transcribed — Rule-1
   * forbids paraphrasing a solver-shape function (see the Newton-solver
   * anti-shortcut lesson in PORTING_SPEC).
   */
  public findPointOnEllipse(
    _s: number,
    _angle1: number,
    _angle2: number,
    _a: number,
    _b: number,
    _outX: { value: number },
    _outY: { value: number },
    _outOther: { value: number },
  ): void {
    throw new Error(
      "raw-port: PCEvaluator::findPointOnEllipse @0xd322 (214-line Newton/bisection " +
        "solver over PCCalculus::ellipseLineIntegral) not yet transcribed"
    );
  }

  /**
   * `PCEvaluator::findLengthOfSineWave(double, double, double, double,
   *   double, double, int) -> double` @0xdce4 (94 lines).
   *
   * Reads the embedded PCEvaluatorWaveData cache at +0x38 (arc-length
   * pre-integration table). Guarded by the PCSpinLock at +0x58 (lock
   * @0xdd2c, unlock @0xdd6b). If the cache key doesn't match the
   * requested (a, b, phase, ...) tuple (`operator==` @0xdd38), copies
   * the new key in (`operator=` @0xdd48) and calls
   * `PCEvaluatorWaveData::refreshWaveArrays` @0xdd50 to rebuild the
   * table. Returns the last entry of the arc-length array
   * `waveData->arr[waveData->count-1]` (@0xdd55..0xdd63).
   *
   * All the frontier types (PCEvaluatorWaveData, PCSpinLock) are
   * unlanded — Rule-3 throw-stub until they land.
   */
  public findLengthOfSineWave(
    _amp: number,
    _freq: number,
    _phase: number,
    _x1: number,
    _x2: number,
    _extra5: number,
    _samples: number,
  ): number {
    throw new Error(
      "raw-port: PCEvaluator::findLengthOfSineWave @0xdce4 not yet transcribed — " +
        "depends on unlanded PCEvaluatorWaveData (embedded @+0x38..0x57) and " +
        "PCSpinLock (embedded @+0x58..0x5b)"
    );
  }

  /**
   * `PCEvaluator::findPointOnSineWave(double, double, double, double,
   *   double, double, double, int, double*, double*)` @0xdb02 (327 lines).
   *
   * Same-family method as findLengthOfSineWave — pulls or refreshes the
   * PCEvaluatorWaveData arc-length cache, then linear-interpolates the
   * cached (x, y) samples to hit the requested fractional arc length.
   * All frontier types unlanded — Rule-3 throw-stub.
   */
  public findPointOnSineWave(
    _amp: number,
    _freq: number,
    _phase: number,
    _x1: number,
    _x2: number,
    _extra5: number,
    _sExtra: number,
    _samples: number,
    _outX: { value: number },
    _outY: { value: number },
  ): void {
    throw new Error(
      "raw-port: PCEvaluator::findPointOnSineWave @0xdb02 not yet transcribed — " +
        "depends on unlanded PCEvaluatorWaveData + PCSpinLock (see findLengthOfSineWave)"
    );
  }
}

// Reference the unused stubs so they aren't dead code and preserve
// their address citations for the provenance scanner.
void PCEvaluatorWaveData_default_ctor;
