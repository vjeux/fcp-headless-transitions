// videoanalysis__collation__box_t.ts — Flexo.framework (infra layer).
//
// C++ class: `videoanalysis::collation::box_t` (two enclosing NAMESPACES, so the file name joins
// the qualified name with double underscores per raw-port/army/PORTING_SPEC.md; precedent:
// PCBezierNamespace__SampledContour.ts).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//         (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * videoanalysis::collation::box_t::dist(box_t const&) const   @Flexo 0x1322200
//     __ZNK13videoanalysis9collation5box_t4distERKS1_
//
// re/disasm:
//   raw-port/re/disasm/Flexo.__ZNK13videoanalysis9collation5box_t4distERKS1_.s  (385 lines)
//
// Sibling methods of this class — `similarity` @0x131b130, `intersectionSimilarity` @0x131bb30,
// `ClusterDist` @0x1322060 — are SEPARATE ledger entries and are not ported here.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from this method's accesses only — Rule 5: nothing else is invented)
// -----------------------------------------------------------------------------
// box_t {
//   +0x00  CGRect rect;      // 4 doubles (x, y, width, height) = 32 bytes. Copied WHOLE to the
//                            // outgoing argument area by `movupd (%rdi),%xmm0` + `movups
//                            // 0x10(%rdi),%xmm1` @0x1322225..0x1322234 — i.e. a 32-byte struct
//                            // passed in MEMORY, which is exactly how the SysV ABI classifies
//                            // CGRect, and is what identifies the first 32 bytes as one CGRect.
//   ...                      // +0x20..+0x47 — never touched by this method; NOT modelled.
//   +0x48  double scaleX;    // `mulsd 0x48(%r14),%xmm0` @0x132226e etc. — multiplies every X
//                            // edge (MinX/MaxX) of the owning box.
//   +0x50  double scaleY;    // `mulsd 0x50(%r14),%xmm0` @0x1322302 etc. — multiplies every Y
//                            // edge (MinY/MaxY) of the owning box.
// }
// The two scales are ADJACENT doubles: `movups 0x48(%rbx),%xmm0` @0x1322404 loads both at once
// into one xmm register, and the packed tail then uses lane 0 as X-scale and lane 1 as Y-scale.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES — all 41 calls are CoreGraphics geometry externs, zero in-scope callees
// -----------------------------------------------------------------------------
//   _CGRectIntersectsRect  symbol stub @Flexo 0x1494ed2   (1 call site)
//   _CGRectGetMinX         symbol stub @Flexo 0x1494eae  (12 call sites)
//   _CGRectGetMaxX         symbol stub @Flexo 0x1494e96  (12 call sites)
//   _CGRectGetMinY         symbol stub @Flexo 0x1494eb4   (8 call sites)
//   _CGRectGetMaxY         symbol stub @Flexo 0x1494e9c   (8 call sites)
// CoreGraphics is an out-of-scope system framework (PORTING_SPEC Rule 3 / DEP_WORKER_BRIEF), so
// these are modelled as BOUNDARY functions rather than in-scope ports: each is a documented,
// stable CGGeometry primitive, and each is written below to Apple's published semantics with its
// stub address cited. They are NOT throw-stubs, because a throw would make every call of dist()
// fail — and, more to the point, they do not have to be trusted: the differential at the bottom
// of this comment calls the REAL Flexo function and compares the whole result, so a wrong
// CGRectGetMinX model would show up as a divergence.
//
// -----------------------------------------------------------------------------
// WHAT THE FUNCTION COMPUTES (recovered control flow — see the per-branch @0xADDR notes below)
// -----------------------------------------------------------------------------
// It is the gap distance between two boxes AFTER each box's own X/Y scale is applied to its own
// edges, with one asymmetry that is easy to miss and is transcribed deliberately:
//
//   THE EARLY-OUT TESTS THE **UNSCALED** RECTS. `CGRectIntersectsRect` @0x1322242 is handed
//   `this->rect` and `other->rect` verbatim, with NO scale applied; every subsequent comparison
//   and subtraction uses SCALED edges. So a pair of boxes can be "intersecting" (answer 0.0) by
//   the unscaled test while their scaled edges are far apart, and vice versa. That is what the
//   machine does.
//
// After the early-out, the eight-way case analysis is the classic rect-gap decision tree:
//   * X-gap on the right (A.minXs >= B.maxXs), X-gap on the left (B.minXs > A.maxXs), or X-overlap.
//   * Within each, the same three-way split on Y.
//   * Both-axis gaps return `sqrt(dx*dx + dy*dy)` (the `sqrtsd` @0x132289e); a single-axis gap
//     returns that axis' signed difference DIRECTLY, with no `sqrt` and no absolute value (the
//     `jmp 0x132224b` paths, which reach the epilogue at 0x13228a2 — past the sqrt).
//
// -----------------------------------------------------------------------------
// DIFFERENTIAL vs the live binary — raw-port/re/oracle/box_t_dist_oracle.py
// -----------------------------------------------------------------------------
// `__ZNK13videoanalysis9collation5box_t4distERKS1_` is a LOCAL symbol (`nm` type `t`, not `T`), so
// dlsym cannot find it. The harness therefore resolves it the way OPS_LOG's "wrong architecture"
// entry prescribes: `nm -n -arch x86_64` for the vmaddr (a BARE `nm` would report the arm64
// slice's address and call some other function entirely — the silent-toward-VERIFIED failure),
// plus the image slide of the loaded Flexo, under `arch -x86_64 /usr/bin/python3` so the process
// really has mapped the x86_64 slice this port was transcribed from. Flexo loads outside the app
// bundle once its @rpath dependencies are preloaded depth-first (OPS_LOG, worker 1).
//
// RESULT: 4,100 box pairs (integer, fractional, negative, zero-and-negative width/height, zero
// and negative scales, shared edges, containment, a SIGNED-ZERO class described below, 512 pairs
// built to sit exactly on the branch boundaries, and the 4 pairs of the reviewer's minimal
// reproducer) — 4,100/4,100 BIT-EXACT (compared as raw IEEE-754 bit patterns, so signed zero and
// NaN payloads count), 0 divergences. 815 of those cases return a ZERO distance and 31 of them
// return a NEGATIVE zero from the live binary, which is the class the first revision of this
// corpus could not see: it put -0.0 in the EXTENTS but never in the ORIGINS or the SCALES, and
// the origin is where a -0.0 reaches the getters' pass-through arm.
// NEGATIVE CONTROLS (same corpus): scaling each box by the OTHER box's factors diverges on
// 2,928 pairs; applying the scales to the intersection test as well — the most plausible
// "tidy-up" of the asymmetry above — diverges on 415; abs() on the single-axis result diverges
// on 121; returning sqrt() on the single-axis paths diverges on 121 (the same 121, since both
// wrongly discard the sign); and the getters returning the origin VERBATIM — the defect this
// file was rejected for, kept as a control — diverges on 18.
// TWO EARLIER REVISIONS OF THIS FILE FAILED THIS DIFFERENTIAL, and both failures were in the
// CoreGraphics boundary rather than in the transcription: `max(x, x+w)` for CGRectGetMaxX cost
// 50 one-ulp divergences (the standardize double-rounding, see below), and the documented
// "empty rects never intersect" rule cost 10 more. Neither would have been visible to review by
// reading, and neither moves a result by more than a hair — which is exactly why the bit-exact
// oracle is the thing that decides this file.

/**
 * CGRect as CoreGraphics lays it out: four doubles at +0x00, +0x08, +0x10, +0x18. The whole
 * 32-byte block is copied out of `box_t+0x00` @0x1322225..0x1322234 for every CG call.
 */
export interface CGRect {
  x: number;      // +0x00
  y: number;      // +0x08
  width: number;  // +0x10
  height: number; // +0x18
}

// ============================================================================
// CORE GRAPHICS BOUNDARY (out-of-scope system framework — see FRONTIER CALLEES)
// ============================================================================
// Each function below is the documented CGGeometry primitive reached through the cited Flexo
// symbol stub. CGGeometry's getters STANDARDIZE the rectangle first: a negative width or height
// is turned into a positive extent by moving the origin.
//
// THE STANDARDIZATION IS A TWO-STEP COMPUTATION AND THE SECOND STEP ROUNDS AGAIN. This is not a
// pedantic detail — it is the single thing that made this port disagree with the binary. For a
// negative width, CGRectStandardize computes `x' = x + width` and `width' = -width`, so
//
//     MaxX = x' + width' = (x + width) - width      // TWO roundings
//
// which is NOT the same double as `x`, and not the same as `max(x, x + width)`. Measured against
// the live CoreGraphics over the oracle's 8,198 rectangles (including ±0, ±inf and NaN extents),
// `max(x, x+w)` disagreed on 50 of them by exactly 1 ulp, and the model below on 0. The 1-ulp
// error then propagated through the scale multiply and the sqrt into the returned distance.

// THE SECOND MEASURED PROPERTY OF THESE GETTERS: A ZERO EDGE ALWAYS COMES BACK POSITIVE.
// The live getters NEVER return -0.0. Returning the origin verbatim does, whenever the origin
// itself is -0.0 and the extent is not negative, and that survives into the scaled edge and out
// of `dist` as the sign of a zero result. Measured against the live CoreGraphics over 4,289
// rectangles / 17,156 getter calls covering ±0 origins, ±0 extents, negative extents, tiny and
// huge magnitudes: returning the origin verbatim disagrees on 254 calls, all of them a -0.0 the
// live function reports as +0.0; normalising a zero result to +0.0 disagrees on 0.
//
//     CGRectGetMinY({y: -0.0, height:  1.0})  -> live +0.0   (origin verbatim: -0.0)
//     CGRectGetMinY({y: -0.0, height: -0.0})  -> live +0.0   (note -0.0 < 0 is FALSE, so the
//     CGRectGetMaxY({y: -0.0, height: -0.0})  -> live +0.0    negative-extent arm is not taken)
//
// This is consistent with the two-step standardization above: CGRectStandardize recomputes the
// edge arithmetically (`x' = x + width`, and the max as `x' + width'`) rather than passing the
// field through, and IEEE addition of two zeros of opposite sign — or of any finite value to its
// negation — yields +0.0. There is no input in the sweep for which a getter returns -0.0.
//
// WHY IT MATTERS HERE, AND WHY ONLY HERE: `dist` multiplies each edge by that box's own scale,
// so a wrongly-signed zero edge flips the sign of a zero DISTANCE, and 0.0 === -0.0 in JS, so a
// value-equal comparison cannot see it at all. It is invisible for every non-zero magnitude,
// which is why the earlier sweeps agreed on 4,764 of 4,768 random cases.

/** Normalise a zero edge to +0.0 — the live getters never return -0.0 (see the note above).
 *  `v === 0` is true for both zeros, so this maps -0.0 to +0.0 and leaves everything else,
 *  including NaN and both infinities, untouched. */
function cgZeroNormalize(v: number): number {
  return v === 0 ? 0 : v;
}

/** `CGRectGetMinX` — symbol stub @Flexo 0x1494eae (12 call sites, e.g. @0x1322269).
 *  Standardized origin: for a negative width the origin moves to `x + width` (one rounding). */
function CGRectGetMinX(r: CGRect): number {
  return cgZeroNormalize(r.width < 0 ? r.x + r.width : r.x);
}

/** `CGRectGetMaxX` — symbol stub @Flexo 0x1494e96 (12 call sites, e.g. @0x132228b).
 *  `(x + width) - width` for a negative width — see the two-rounding note above. */
function CGRectGetMaxX(r: CGRect): number {
  return cgZeroNormalize(r.width < 0 ? r.x + r.width - r.width : r.x + r.width);
}

/** `CGRectGetMinY` — symbol stub @Flexo 0x1494eb4 (8 call sites, e.g. @0x13222fd). */
function CGRectGetMinY(r: CGRect): number {
  return cgZeroNormalize(r.height < 0 ? r.y + r.height : r.y);
}

/** `CGRectGetMaxY` — symbol stub @Flexo 0x1494e9c (8 call sites, e.g. @0x132231f).
 *  `(y + height) - height` for a negative height — see the two-rounding note above. */
function CGRectGetMaxY(r: CGRect): number {
  return cgZeroNormalize(r.height < 0 ? r.y + r.height - r.height : r.y + r.height);
}

/**
 * `CGRectIntersectsRect` — symbol stub @Flexo 0x1494ed2 (1 call site, @0x1322242).
 *
 * NOT the documented "empty rectangles never intersect" rule, and not a plain strict overlap
 * either. Both of those were tried and both are measurably wrong; the rule below is what the
 * live CoreGraphics actually implements, characterized by measurement:
 *
 *   Each axis is treated as the HALF-OPEN interval [min, max) — EXCEPT that a degenerate axis
 *   (max == min, i.e. a zero extent) is the single point {min}. The rects intersect iff those
 *   two sets intersect on BOTH axes. Consequently:
 *     * two proper rects that merely SHARE AN EDGE do NOT intersect (0,0,10,10) vs (10,0,10,10);
 *     * a zero-width rect sitting exactly on the other's MIN edge DOES intersect, while the same
 *       rect on the other's MAX edge does not (half-open, so the max edge is excluded);
 *     * two zero-width rects intersect iff their degenerate coordinate is equal.
 *
 * EVIDENCE: scored against the live `CGRectIntersectsRect` on 16,000 rect pairs — an 8,000-case
 * exhaustive grid over origins {-5, 0, 5, 10} x extents {-5, -0.0, 0, 5} (which is dense in
 * touching, containing, degenerate and negative-extent configurations) plus 8,000 random pairs
 * mixing fractional, integral, ±0 and sub-nanometre magnitudes: 0 mismatches. Three rejected
 * models on the same data: "empty never intersects" (the documented rule) mismatched 10 of the
 * port's 4,096 pairs, plain strict overlap mismatched 244 of the grid, and closed-interval
 * overlap mismatched 1,115.
 *
 * ENVELOPE (stated because it is not verified rather than papered over): a rect with a NaN
 * component is NOT modelled. The live function answers a mix of true and false for NaN inputs
 * (104 true / 296 false over 400 random single-NaN pairs), so no simple rule reproduces it; this
 * model returns false there. `box_t::dist`'s own arithmetic is meaningless for NaN geometry
 * anyway, and the differential corpus contains none.
 */
function CGRectIntersectsRect(a: CGRect, b: CGRect): boolean {
  return (
    cgAxisIntersects(CGRectGetMinX(a), CGRectGetMaxX(a), CGRectGetMinX(b), CGRectGetMaxX(b)) &&
    cgAxisIntersects(CGRectGetMinY(a), CGRectGetMaxY(a), CGRectGetMinY(b), CGRectGetMaxY(b))
  );
}

/** One axis of `CGRectIntersectsRect` — see that function's doc for the measured rule. */
function cgAxisIntersects(aLo: number, aHi: number, bLo: number, bHi: number): boolean {
  const aIsPoint = aLo === aHi;
  const bIsPoint = bLo === bHi;
  if (aIsPoint && bIsPoint) return aLo === bLo; // {a} ∩ {b}
  if (aIsPoint) return bLo <= aLo && aLo < bHi; // {a} ∩ [bLo, bHi)
  if (bIsPoint) return aLo <= bLo && bLo < aHi; // [aLo, aHi) ∩ {b}
  return Math.max(aLo, bLo) < Math.min(aHi, bHi); // [aLo, aHi) ∩ [bLo, bHi)
}

/**
 * `videoanalysis::collation::box_t` — a scored bounding box in Flexo's video-analysis collation
 * (auto-reframe face clustering). Only the fields this method reads are modelled: the CGRect at
 * +0x00 and the two per-box scale factors at +0x48 / +0x50.
 */
export class videoanalysis__collation__box_t {
  /** @Flexo box_t@0x00 — the box's rectangle (4 doubles), copied whole to every CG call. */
  rect: CGRect = { x: 0, y: 0, width: 0, height: 0 };

  /** @Flexo box_t@0x48 — the X scale applied to this box's own MinX/MaxX edges. */
  scaleX: number = 0;

  /** @Flexo box_t@0x50 — the Y scale applied to this box's own MinY/MaxY edges. */
  scaleY: number = 0;

  /**
   * `videoanalysis::collation::box_t::dist(box_t const&) const` @Flexo 0x1322200
   * (__ZNK13videoanalysis9collation5box_t4distERKS1_).
   *
   * Faithful transcription of all 385 disassembly lines. `%r14` = `this` (called A below),
   * `%rbx` = the `other` reference (B). Every CG call takes the rect by MEMORY (32-byte struct),
   * which is the `movupd (%reg),%xmm0 ; movups 0x10(%reg),%xmm1 ; movups ...,(%rsp)` preamble
   * repeated before each `callq`; those preambles carry no arithmetic and are not re-narrated at
   * each of the 41 sites.
   *
   * SCALED EDGE NOTATION (used in the comments): `A.minXs` = CGRectGetMinX(A.rect) * A.scaleX,
   * `B.maxYs` = CGRectGetMaxY(B.rect) * B.scaleY, and so on. Each box scales ITS OWN edges with
   * ITS OWN factors — never the other box's (`mulsd 0x48(%r14)` for A, `mulsd 0x48(%rbx)` for B).
   *
   * THE COMPARISONS ARE AT&T `ucomisd src, dst` = flags on `dst - src` (PORTING_SPEC's cheat
   * sheet). Each one is written out as the subtraction it performs next to the branch.
   *
   * @param other the other box (SysV %rsi).
   * @returns the gap distance; 0.0 when the UNSCALED rects intersect.
   */
  dist(other: videoanalysis__collation__box_t): number {
    const A = this;
    const B = other;

    // ------------------------------------------------------------------
    // @0x1322200..0x1322234 — prologue; copy A.rect and B.rect to the outgoing argument area.
    // @0x1322239 — xorpd %xmm0,%xmm0 ; movapd %xmm0,-0x20(%rbp): the result slot starts at 0.0.
    // @0x1322242 — callq _CGRectIntersectsRect(A.rect, B.rect) — UNSCALED, see the header note.
    // @0x1322247..0x1322250 — testb %al,%al ; je 0x1322255 (not intersecting -> keep going);
    //   otherwise fall into @0x132224b, which loads the 0.0 slot and jumps to the epilogue
    //   @0x13228a2, PAST the sqrtsd.
    // ------------------------------------------------------------------
    if (CGRectIntersectsRect(A.rect, B.rect)) {
      return 0; // @0x132224b -> @0x13228a2 (returns the zeroed slot, no sqrt)
    }

    // @0x1322269/@0x132226e — A.minXs; @0x132228b/@0x1322290 — B.maxXs.
    const aMinXs = CGRectGetMinX(A.rect) * A.scaleX;
    const bMaxXs = CGRectGetMaxX(B.rect) * B.scaleX;
    // @0x132229a/@0x132229e — ucomisd %xmm0(bMaxXs), %xmm1(aMinXs) => aMinXs - bMaxXs ; jae:
    //   taken iff aMinXs >= bMaxXs, i.e. A lies to the RIGHT of B. -> @0x1322432
    if (aMinXs >= bMaxXs) {
      // ---------------- A is to the RIGHT of B (@0x1322432) ----------------
      // @0x1322446/@0x132244b — A.minYs ; @0x1322468/@0x132246d — B.maxYs.
      const aMinYs = CGRectGetMinY(A.rect) * A.scaleY;
      const bMaxYs = CGRectGetMaxY(B.rect) * B.scaleY;
      // @0x1322477/@0x132247b — ucomisd %xmm0(bMaxYs), %xmm1(aMinYs) => aMinYs - bMaxYs ; jae:
      //   taken iff aMinYs >= bMaxYs -> A is also BELOW B (in CG's y-up sense, past B's top edge).
      if (aMinYs >= bMaxYs) {
        // ------- RIGHT + BELOW: a true corner gap (@0x132268c, tail @0x13227ab) -------
        // The compiler materialises the SAME difference vector twice here (once through the
        // -0x80/-0x20/-0x90/-0x50 slots @0x132269e..0x13226d1, once through -0x60/-0x30/-0x70/
        // -0x40 @0x13226e7..0x1322713) and multiplies the two copies together @0x132288d — that
        // is how it squares the vector, not two different quantities.
        // @0x13227d8 — mulpd builds {A.minXs, A.minYs}; @0x132280e — {B.maxXs, B.maxYs};
        // @0x1322817 — subpd gives {dx, dy}.
        const dx = aMinXs - bMaxXs; // @0x1322817 lane 0
        const dy = aMinYs - bMaxYs; // @0x1322817 lane 1
        // @0x132288d mulpd (the two identical copies) ; @0x1322896 unpckhpd ; @0x132289a addsd
        // ; @0x132289e sqrtsd.
        return Math.sqrt(dx * dx + dy * dy);
      }
      // @0x1322495/@0x132249a — A.maxYs ; @0x13224b7/@0x13224bc — B.minYs.
      const aMaxYs = CGRectGetMaxY(A.rect) * A.scaleY;
      const bMinYs = CGRectGetMinY(B.rect) * B.scaleY;
      // @0x13224fc..0x1322515 — the X difference is computed BEFORE the branch is resolved:
      //   subsd %xmm0(bMaxXs), %xmm1(aMinXs) => aMinXs - bMaxXs, parked in the -0x20 slot.
      const dxRight = aMinXs - bMaxXs; // @0x1322515
      // @0x1322506/@0x132251e — ucomisd -0x30(aMaxYs), %xmm1(bMinYs) => bMinYs - aMaxYs ; jbe:
      //   taken iff bMinYs <= aMaxYs, i.e. the boxes OVERLAP on Y -> the gap is purely horizontal
      //   and @0x132224b returns the parked difference AS IS (signed, no sqrt, no abs).
      if (bMinYs <= aMaxYs) {
        return dxRight; // @0x132251e -> @0x132224b -> @0x13228a2
      }
      // ------- RIGHT + ABOVE: corner gap (@0x1322524, shared tail @0x1322566/@0x132256a) -------
      // Same packed shape as the left+above case below; the A/B roles in the -0x50/-0x30/-0x60/
      // -0x70 slots are swapped (@0x132253b..0x1322562 vs @0x1322400..0x1322427).
      // @0x13225aa/@0x13225af — subsd gives A.maxYs - B.minYs.
      const dyRightAbove = aMaxYs - bMinYs; // @0x13225af
      // @0x1322621 — subpd rebuilds {dx, dy}; @0x132262f — mulpd against {dx, dy} from the
      // -0x20/-0x40 slots; @0x1322892..0x132289e — unpckhpd ; addsd ; sqrtsd.
      return Math.sqrt(dxRight * dxRight + dyRightAbove * dyRightAbove);
    }

    // @0x13222b8/@0x13222bd — A.maxXs ; @0x13222da/@0x13222df — B.minXs.
    const aMaxXs = CGRectGetMaxX(A.rect) * A.scaleX;
    const bMinXs = CGRectGetMinX(B.rect) * B.scaleX;
    // @0x13222fd/@0x1322302 — A.minYs ; @0x132231f/@0x132232e — B.maxYs.
    const aMinYs = CGRectGetMinY(A.rect) * A.scaleY;
    const bMaxYs = CGRectGetMaxY(B.rect) * B.scaleY;
    // @0x1322329/@0x1322333 — ucomisd -0x20(aMaxXs), %xmm1(bMinXs) => bMinXs - aMaxXs ; jbe:
    //   taken iff bMinXs <= aMaxXs, i.e. the boxes OVERLAP on X. -> @0x1322638
    if (bMinXs <= aMaxXs) {
      // ---------------- X-OVERLAP: the gap is purely vertical (@0x1322638) ----------------
      // @0x132263d/@0x1322641 — ucomisd %xmm0(bMaxYs), %xmm1(aMinYs) => aMinYs - bMaxYs ; jae:
      //   taken iff aMinYs >= bMaxYs -> @0x13228ae (A above B's max edge).
      if (aMinYs >= bMaxYs) {
        // @0x13228c2/@0x13228c7 — A.minYs recomputed; @0x13228e4/@0x13228e9 — B.maxYs;
        // @0x13228f3 — subsd => A.minYs - B.maxYs ; @0x13228fc — jmp 0x132224b (no sqrt).
        return aMinYs - bMaxYs;
      }
      // @0x1322659/@0x132265e — B.minYs ; @0x132267c/@0x1322681 — A.maxYs ; @0x1322687 jmps to
      // the shared @0x13228ee subtraction: subsd => B.minYs - A.maxYs ; then @0x132224b.
      const aMaxYsOverlap = CGRectGetMaxY(A.rect) * A.scaleY; // @0x1322681
      const bMinYsOverlap = CGRectGetMinY(B.rect) * B.scaleY; // @0x132265e
      return bMinYsOverlap - aMaxYsOverlap; // @0x13228f3
    }

    // ---------------- A is to the LEFT of B (bMinXs > aMaxXs) ----------------
    // @0x132233e/@0x1322342 — ucomisd %xmm0(bMaxYs), %xmm1(aMinYs) => aMinYs - bMaxYs ; jae:
    //   taken iff aMinYs >= bMaxYs -> @0x132271c (LEFT + BELOW).
    if (aMinYs >= bMaxYs) {
      // ------- LEFT + BELOW: corner gap (@0x132271c, tail @0x13227ab) -------
      // @0x13227d8 — mulpd builds {B.minXs, A.minYs}; @0x132280e — {A.maxXs, B.maxYs};
      // @0x1322817 — subpd gives {dx, dy}. (Note lane 0 subtracts A's max FROM B's min here,
      // the mirror of the RIGHT cases.)
      const dx = bMinXs - aMaxXs; // @0x1322817 lane 0
      const dy = aMinYs - bMaxYs; // @0x1322817 lane 1
      return Math.sqrt(dx * dx + dy * dy); // @0x132288d..0x132289e
    }
    // @0x132235c/@0x1322361 — A.maxYs ; @0x132237e/@0x1322383 — B.minYs.
    const aMaxYs = CGRectGetMaxY(A.rect) * A.scaleY;
    const bMinYs = CGRectGetMinY(B.rect) * B.scaleY;
    // @0x13223c2..0x13223e0 — again the X difference is computed before the branch resolves:
    //   subsd %xmm0(aMaxXs), %xmm1(bMinXs) => bMinXs - aMaxXs, parked in -0x20.
    const dxLeft = bMinXs - aMaxXs; // @0x13223e0
    // @0x13223cc/@0x13223e5 — ucomisd -0x30(aMaxYs), %xmm1(bMinYs) => bMinYs - aMaxYs ; jbe:
    //   taken iff bMinYs <= aMaxYs -> Y overlaps, so @0x132224b returns the parked X difference
    //   as is (signed, no sqrt).
    if (bMinYs <= aMaxYs) {
      return dxLeft; // @0x13223e5 -> @0x132224b
    }
    // ------- LEFT + ABOVE: corner gap (@0x13223eb, shared tail @0x1322566/@0x132256a) -------
    // @0x13225aa/@0x13225af — subsd gives A.maxYs - B.minYs (negative in this branch; it is
    // squared below, exactly as the machine does — no abs anywhere).
    const dyLeftAbove = aMaxYs - bMinYs; // @0x13225af
    // @0x13225e5/@0x1322618 — the two packed products; @0x1322621 — subpd => {dx, dy};
    // @0x132262a/@0x132262f — unpcklpd + mulpd square them; @0x1322892..0x132289e — the
    // horizontal add and sqrtsd.
    return Math.sqrt(dxLeft * dxLeft + dyLeftAbove * dyLeftAbove);
  }
}
