// OZChannelSegmentVisitor — ProChannel double-dispatch visitor for OZChannel curve segments.
//
// This is the ABSTRACT VISITOR BASE. All 12 `visit*` methods (visitLinear, visitBezier,
// visitConstant, visitEase, visitEaseIn, visitEaseOut, visitAccelerate, visitDecelerate,
// visitCatmullRom, visitExponential, visitLogarithmic, visitEase) are DEFAULT no-ops:
// each is exactly `pushq %rbp; movq %rsp,%rbp; popq %rbp; retq` (4-instruction empty
// virtual). Subclasses override the specific visit kinds they care about.
//
// The heavy static/dispatch helpers (visitSegments, mapRepeat, mapProgressiveRepeat,
// mapPingPong) live on the same class as CLASS METHODS (not instance virtuals).
//
// EXTRACTION NOTE: `otool -tV -arch x86_64` on the FAT dylib misses labels for
// visitSegments (@0xa111c) and mapRepeat (@0xa46e6) — a known otool linear-sweep
// artifact around adjacent T-symbols. Using `lipo -thin x86_64` + `objdump -d
// --start-address=<VA> --stop-address=<VA+size>` on the thin slice recovers both
// bodies exactly. They are NOT ICF-folded (unique nm entries and unique byte
// content). visitSegments is a ~2600-line curve-tree walk (deferred); mapRepeat
// is a 12-instruction wrapper around mapProgressiveRepeat (transcribed below).
//
// Framework: ProChannel
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework
//
// Faithful transcription of the class's exported symbols:
//
//   @0xa3d34  C1() [= C2]                                              PORTED
//   @0xa3d4a  ~OZChannelSegmentVisitor() [D1 = D2]                     PORTED
//   @0xa3d50  ~OZChannelSegmentVisitor() [D0 — jmp __ZdlPv]            PORTED
//   @0xa3d5a  visitConstant(double, CMTime const&, CMTime const&)      PORTED (empty)
//   @0xa3d60  visitLinear(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double)     PORTED (empty)
//   @0xa3d66  visitBezier(...)                                         PORTED (empty)
//   @0xa3d6c  visitEase(...)                                           PORTED (empty)
//   @0xa3d72  visitEaseIn(...)                                         PORTED (empty)
//   @0xa3d78  visitEaseOut(...)                                        PORTED (empty)
//   @0xa3d7e  visitAccelerate(...)                                     PORTED (empty)
//   @0xa3d84  visitDecelerate(...)                                     PORTED (empty)
//   @0xa3d8a  visitCatmullRom(...)                                     PORTED (empty)
//   @0xa3d90  visitExponential(...)                                    PORTED (empty)
//   @0xa3d96  visitLogarithmic(...)                                    PORTED (empty)
//   @ProChannel 0xa111c  visitSegments(OZChannel const&, CMTime, CMTime, OZChannelSegmentVisitor&) STUB (2600-line body — deferred)
//   @ProChannel 0xa46e6  mapRepeat(CMTime, CMTime, CMTime, bool)                        PORTED (thin wrapper over mapProgressiveRepeat)
//   @ProChannel 0xa4702  mapProgressiveRepeat(CMTime, CMTime, CMTime, bool, long&)      STUB (460-line body — deferred)
//   @ProChannel 0xa3d9c  mapPingPong(CMTime, CMTime, CMTime, CMTime, bool, bool&)       STUB (575-line body — deferred)
//
// C1/C2 and D1/D2 are ICF-alias siblings — only C1 and D1/D0 entry points are documented here.
//
// VTABLE (from ctor `leaq 0x3ec29(%rip), %rax; movq %rax, (%rdi)` @0xa3d38..a3d3f):
//   vtable_for_OZChannelSegmentVisitor base VA = 0xe2958
//   installed value                (=base+0x10) = 0xe2968
//   (verified via resolve.py ProChannel sym 0xe2968 -> "vtable for OZChannelSegmentVisitor (+0x10)")
//
// STRUCT LAYOUT:
//   +0x00  vptr  — the sole field (only offset ever touched is +0x00, at C1 @0xa3d38-3f).
//   (No other fields observed in any method of this class.)

import type { CMTime } from "../infra/CMTime";

// -----------------------------------------------------------------------------
// Frontier callees (heavy-math methods on this class, not yet transcribed).
// -----------------------------------------------------------------------------

/**
 * Frontier: `OZSpline` — an opaque handle to a channel segment's spline knot data.
 * Passed by-reference to every `visit*` method that takes 4 CMTime args + a double.
 * The visitor base's default methods never dereference it; subclasses do.
 * @frontier ProChannel OZSpline
 */
export interface OZSpline {
  readonly __brand: "OZSpline";
}

/**
 * Frontier: `OZChannel` — the source channel argument to visitSegments. Full port lives
 * at raw-port/src/channels/OZChannel.ts (already transcribed for other paths); we only
 * accept it opaquely here since visitSegments's own body isn't decoded.
 * @frontier ProChannel OZChannel  (visitSegments call sig)
 */
export interface OZChannelHandle {
  readonly __brand: "OZChannel";
}

// -----------------------------------------------------------------------------
// Constants.
// -----------------------------------------------------------------------------

/**
 * The installed vtable pointer stored at (this+0x00) by C1. Cross-verified:
 *   0xa3d38 + 7 + 0x3ec29 = 0xe2968 (= "vtable for OZChannelSegmentVisitor + 0x10").
 * @const ProChannel 0xe2968
 */
export const OZChannelSegmentVisitor_VTABLE_INSTALLED_VA = 0xe2968;

// -----------------------------------------------------------------------------
// The class.
// -----------------------------------------------------------------------------

/**
 * OZChannelSegmentVisitor — the abstract double-dispatch visitor for OZChannel curve
 * segments. All `visit*` methods are empty no-ops in this base; subclasses override
 * the ones they care about (e.g. OZLinearInterpolator overrides visitLinear).
 *
 * @Ozone n/a — this class lives in ProChannel.framework.
 */
export class OZChannelSegmentVisitor {
  /**
   * +0x00 — the vtable pointer. Installed by C1 as {VTABLE_INSTALLED_VA}. Modeled
   * here as a readonly nominal to preserve C++ layout intent; TS dispatch uses the
   * prototype chain instead.
   */
  readonly vptr: number = OZChannelSegmentVisitor_VTABLE_INSTALLED_VA;

  // ===========================================================================
  // C1() / C2() — @0xa3d34.
  //
  // Body:
  //   pushq %rbp
  //   movq %rsp, %rbp
  //   leaq 0x3ec29(%rip), %rax        ; rax = &vtable+0x10 = 0xe2968
  //   movq %rax, (%rdi)               ; this->vptr = 0xe2968
  //   popq %rbp
  //   retq
  //
  // C1 and C2 are ICF-alias siblings — the mangled distinction is a linker concern;
  // we expose one ctor.
  // ===========================================================================

  /** OZChannelSegmentVisitor() — default ctor, @0xa3d34. Field initializer of `vptr` matches. */
  constructor() {
    // @0xa3d38..3f — the vptr install is captured by the field-initializer above.
  }

  // ===========================================================================
  // ~OZChannelSegmentVisitor() — @0xa3d4a (D1 = D2), and D0 @0xa3d50.
  //
  // D1 body:  pushq %rbp; movq %rsp,%rbp; popq %rbp; retq        (empty)
  // D0 body:  pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp __ZdlPv (delete-and-return)
  //
  // The empty D1 body is expected: this class has no owned resources. D0 tail-jumps
  // into `::operator delete` — modeled here by leaving destruction to the JS GC.
  // ===========================================================================

  /** ~OZChannelSegmentVisitor() — @0xa3d4a (D1/D2 empty body). No-op. */
  destroy(): void {
    // @0xa3d4a..4f — pushq/popq/retq. No fields to release.
  }

  // ===========================================================================
  // The 12 default-empty visit* virtuals — each is a pushq/popq/retq stub in the
  // abstract base. Their bodies at the listed addresses are byte-verbatim
  // identical (differ only by callq return target). We reproduce each as an
  // empty method so subclasses can override.
  // ===========================================================================

  /** visitConstant(double, CMTime const&, CMTime const&) — @0xa3d5a (empty in base). */
  visitConstant(_v: number, _t0: CMTime, _t1: CMTime): void {
    // @0xa3d5a..5f — no-op.
  }

  /** visitLinear(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double) — @0xa3d60. */
  visitLinear(
    _spline: OZSpline,
    _a: unknown, _b: unknown,
    _t0: CMTime, _t1: CMTime, _t2: CMTime, _t3: CMTime,
    _u: number,
  ): void {
    // @0xa3d60..65 — no-op.
  }

  /** visitBezier(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double) — @0xa3d66. */
  visitBezier(
    _spline: OZSpline,
    _a: unknown, _b: unknown,
    _t0: CMTime, _t1: CMTime, _t2: CMTime, _t3: CMTime,
    _u: number,
  ): void {
    // no-op default.
  }

  /** visitEase(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double). */
  visitEase(
    _spline: OZSpline,
    _a: unknown, _b: unknown,
    _t0: CMTime, _t1: CMTime, _t2: CMTime, _t3: CMTime,
    _u: number,
  ): void {
    // no-op default.
  }

  /** visitEaseIn(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double). */
  visitEaseIn(
    _spline: OZSpline,
    _a: unknown, _b: unknown,
    _t0: CMTime, _t1: CMTime, _t2: CMTime, _t3: CMTime,
    _u: number,
  ): void {
    // no-op default.
  }

  /** visitEaseOut(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double). */
  visitEaseOut(
    _spline: OZSpline,
    _a: unknown, _b: unknown,
    _t0: CMTime, _t1: CMTime, _t2: CMTime, _t3: CMTime,
    _u: number,
  ): void {
    // no-op default.
  }

  /** visitAccelerate(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double). */
  visitAccelerate(
    _spline: OZSpline,
    _a: unknown, _b: unknown,
    _t0: CMTime, _t1: CMTime, _t2: CMTime, _t3: CMTime,
    _u: number,
  ): void {
    // no-op default.
  }

  /** visitDecelerate(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double). */
  visitDecelerate(
    _spline: OZSpline,
    _a: unknown, _b: unknown,
    _t0: CMTime, _t1: CMTime, _t2: CMTime, _t3: CMTime,
    _u: number,
  ): void {
    // no-op default.
  }

  /** visitCatmullRom(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double). */
  visitCatmullRom(
    _spline: OZSpline,
    _a: unknown, _b: unknown,
    _t0: CMTime, _t1: CMTime, _t2: CMTime, _t3: CMTime,
    _u: number,
  ): void {
    // no-op default.
  }

  /** visitExponential(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double). */
  visitExponential(
    _spline: OZSpline,
    _a: unknown, _b: unknown,
    _t0: CMTime, _t1: CMTime, _t2: CMTime, _t3: CMTime,
    _u: number,
  ): void {
    // no-op default.
  }

  /** visitLogarithmic(OZSpline&, void*, void*, CMTime,CMTime,CMTime,CMTime, double). */
  visitLogarithmic(
    _spline: OZSpline,
    _a: unknown, _b: unknown,
    _t0: CMTime, _t1: CMTime, _t2: CMTime, _t3: CMTime,
    _u: number,
  ): void {
    // no-op default.
  }

  // ===========================================================================
  // Static / class-method helpers — visitSegments, mapRepeat, mapProgressiveRepeat,
  // mapPingPong. Each is a real body (heavy math for the last two, ICF-folded for
  // the first two), not part of the visitor base's virtual dispatch surface.
  // ===========================================================================

  /**
   * visitSegments(OZChannel const&, CMTime const&, CMTime const&, OZChannelSegmentVisitor&)
   *
   * Class method: walks the segments of a channel between two CMTimes and fires the
   * appropriate `visit*` on the passed visitor. Body extracted with a lipo-thin slice at
   * @ProChannel 0xa111c — ~2600 lines of curve-tree traversal + `__dynamic_cast` type
   * discrimination (OZCurve -> getRootNode -> per-node type check into OZConstantNode /
   * OZSplineNode / etc. -> dispatch to visitConstant/visitLinear/... on the visitor).
   *
   * Refuse to guess: transcription of the 2600-line body is deferred to a dedicated pass.
   *
   * @frontier ProChannel OZChannelSegmentVisitor::visitSegments @0xa111c (~2600 lines; disasm
   *   dumped in raw-port/re/disasm/ProChannel.OZChannelSegmentVisitor.__ZN23OZChannelSegmentVisitor13visitSegmentsERK9OZChannelRK6CMTimeS5_RS_.s)
   */
  static visitSegments(
    _ch: OZChannelHandle,
    _t0: CMTime,
    _t1: CMTime,
    _visitor: OZChannelSegmentVisitor,
  ): void {
    throw new Error(
      "OZChannelSegmentVisitor::visitSegments @ProChannel 0xa111c not yet transcribed " +
        "(2600-line curve-tree walker — see re/disasm/ProChannel.OZChannelSegmentVisitor." +
        "__ZN23OZChannelSegmentVisitor13visitSegmentsERK9OZChannelRK6CMTimeS5_RS_.s)",
    );
  }

  /**
   * mapRepeat(CMTime const&, CMTime const&, CMTime const&, bool)
   *
   * Body extracted at @ProChannel 0xa46e6 (12 instructions):
   *
   *   0xa46e6  pushq  %rbp
   *   0xa46e7  movq   %rsp, %rbp
   *   0xa46ea  pushq  %rbx
   *   0xa46eb  pushq  %rax                    ; align stack + reserve 8B
   *   0xa46ec  movq   %rdi, %rbx              ; save sret buffer (CMTime out ptr)
   *   0xa46ef  leaq   -0x10(%rbp), %r9        ; r9 = &throwaway long
   *   0xa46f3  callq  0xa4702                 ; -> mapProgressiveRepeat(rdi=sret, rsi=t, rdx=lo, rcx=hi, r8=flag, r9=&countOut)
   *   0xa46f8  movq   %rbx, %rax              ; return sret buffer
   *   0xa46fb  addq   $0x8, %rsp
   *   0xa46ff  popq   %rbx
   *   0xa4700  popq   %rbp
   *   0xa4701  retq
   *
   * Faithful C++: `mapRepeat` is a TAIL WRAPPER over `mapProgressiveRepeat` with a
   * throwaway `long repeatCount` out-parameter that the caller doesn't want. The
   * two functions share the same time-remap output; only the sixth `long&` output
   * (how many times the range was wrapped) is discarded here.
   *
   * @source @ProChannel 0xa46e6  OZChannelSegmentVisitor::mapRepeat
   * @source raw-port/re/disasm/ProChannel.OZChannelSegmentVisitor.__ZN23OZChannelSegmentVisitor9mapRepeatERK6CMTimeS2_S2_b.s
   */
  static mapRepeat(t: CMTime, lo: CMTime, hi: CMTime, flag: boolean): CMTime {
    // @0xa46ef  leaq -0x10(%rbp), %r9  — allocate the throwaway `long` out-param.
    const throwawayRepeatCount = { value: 0n };
    // @0xa46f3  callq mapProgressiveRepeat — forward all 5 real args + &countOut.
    // The wrapper cannot compute a result any way except by delegating; the
    // callee's return IS this function's return per the x86_64 sret convention.
    return OZChannelSegmentVisitor.mapProgressiveRepeat(
      t, lo, hi, flag, throwawayRepeatCount,
    );
  }

  /**
   * mapProgressiveRepeat(CMTime, CMTime, CMTime, bool, long&)
   *
   * ~460-line body — reflect-in-range with a running repeat-count out-parameter. Bit-exact
   * transcription requires per-instruction decoding and is deferred.
   *
   * @frontier ProChannel OZChannelSegmentVisitor::mapProgressiveRepeat (460-line body)
   */
  static mapProgressiveRepeat(
    _t: CMTime,
    _lo: CMTime,
    _hi: CMTime,
    _flag: boolean,
    _repeatCountOut: { value: bigint },
  ): CMTime {
    throw new Error(
      "OZChannelSegmentVisitor::mapProgressiveRepeat @ProChannel 0xa4702 not yet transcribed " +
        "(460-line body — see raw-port/re/disasm/ProChannel.OZChannelSegmentVisitor." +
        "__ZN23OZChannelSegmentVisitor20mapProgressiveRepeatERK6CMTimeS2_S2_bRl.s)",
    );
  }

  /**
   * mapPingPong(CMTime, CMTime, CMTime, CMTime, bool, bool&)
   *
   * ~575-line body — reflect-and-negate ping-pong mapping with a reversed-flag out-parameter.
   * Bit-exact transcription is deferred.
   *
   * @frontier ProChannel OZChannelSegmentVisitor::mapPingPong (575-line body)
   */
  static mapPingPong(
    _t: CMTime,
    _lo: CMTime,
    _hi: CMTime,
    _mid: CMTime,
    _flag: boolean,
    _reversedOut: { value: boolean },
  ): CMTime {
    throw new Error(
      "OZChannelSegmentVisitor::mapPingPong @ProChannel 0xa3d9c not yet transcribed " +
        "(575-line body — see raw-port/re/disasm/ProChannel.OZChannelSegmentVisitor." +
        "__ZN23OZChannelSegmentVisitor11mapPingPongERK6CMTimeS2_S2_S2_bRb.s)",
    );
  }
}
