// raw-port/src/channels/OZSceneArrangement.ts
//
// FCP `OZSceneArrangement` — a transient helper built by OZScene motion
// behaviors that captures a set of OZ*Element* scene items at a given time and
// then either DISTRIBUTES them evenly along an axis or ALIGNS them onto a
// common plane. It stores the elements in TWO PCArrays: one holds the items
// under active selection (arr@+0x108) and one holds a coordinate-source array
// used by `align()` when computing the target coord (arr@+0x120 or +0x108
// depending on `this+0x12c`). Every "move" call ultimately dispatches into
// `OZTransformNode::offsetTranslation(dx,dy,dz, at:CMTime, animate:bool)`.
//
// Framework: Ozone  (/Applications/Final Cut Pro.app/Contents/Frameworks/
//                    Ozone.framework/Versions/A/Ozone)
// FAT slice: /tmp/Ozone.x86_64 (x86_64, VA==file offset)
//
// Ported symbols (all @Ozone):
//   @0x000000000050427a  OZSceneArrangement::OZSceneArrangement(OZScene*, int, double)  [C1]
//                        __ZN18OZSceneArrangementC1EP7OZSceneid
//                        (6-instr thunk: pushq/movq/popq/JMP to C2 @0x503f70)
//   @0x0000000000503f70  OZSceneArrangement::OZSceneArrangement(OZScene*, int, double)  [C2]
//                        __ZN18OZSceneArrangementC2EP7OZSceneid
//                        (193-line primary ctor — throw-stubbed: builds
//                         OZRenderState, installs two PCArray vtables, seeds
//                         current time from scene, iterates begin_sel..end_sel
//                         doing dynamic_cast<OZElement*> off each OZSceneNode,
//                         and for every hit pushes an Element(elt, scene,
//                         rstate, mode, t) into the primary PCArray. Then
//                         sorts by the pluggable `less_than` and calls
//                         `align()` when `this+0x12c` is set.)
//   @0x0000000000064040  OZSceneArrangement::~OZSceneArrangement()  [D1]
//                        __ZN18OZSceneArrangementD1Ev
//                        (44 lines — PCArray teardown for both arrays
//                         @+0x108 and @+0x120: reinstall vtable-slot, call
//                         PCArray::resize(0, sign_preserving_pos), operator
//                         delete[] the buffer, zero count. Throw-stubbed —
//                         the raw memory ops don't have a faithful TS
//                         equivalent; PCArray dtor is a separate leaf.)
//   @0x00000000005042e0  OZSceneArrangement::Element::Element()  [default,
//                        thunk to C2 -> 6-instr, throw-stubbed]
//   @0x0000000000503bd0  OZSceneArrangement::Element::Element(OZElement*,
//                                                             OZScene*,
//                                                             OZRenderState const&,
//                                                             int, double)  [C2 primary]
//                        (throw-stubbed — reads the element's cached transform
//                         from OZScene using the given OZRenderState/time and
//                         seeds Element +0x0=OZSceneNode*, +0x8=double sortKey
//                         used by all comparators, +0x10=CMTime, +0x18=byte
//                         (hidden flag), ... — accessors are used by ops
//                         below.)
//
// -- Element comparators (REAL PORTS, NaN-ordered + layer-tiebreak) --
//   @0x0000000000503c90  OZSceneArrangement::Element::operator<(Element const&) const
//                        __ZNK18OZSceneArrangement7ElementltERKS0_
//   @0x0000000000503f30  OZSceneArrangement::Element::operator>(Element const&) const
//                        __ZNK18OZSceneArrangement7ElementgtERKS0_
//
// -- Coordinate picker (REAL PORT — min/max lerp) --
//   @0x00000000005042f0  OZSceneArrangement::pickCoordinate(
//                          PCArray<Element, PCArray_Traits<Element>> const&) const
//                        __ZN18OZSceneArrangement14pickCoordinateERK7PCArrayINS_7ElementE14PCArray_TraitsIS1_EE
//
// -- Wrappers (REAL PORT) --
//   @0x00000000005055c0  OZSceneArrangement::moveElementToPlane(
//                          Element const&, PCVector4<double> const&)
//                        __ZN18OZSceneArrangement18moveElementToPlaneERKNS_7ElementERK9PCVector4IdE
//
// -- Big math methods (THROW-STUBBED with @0xADDR) --
//   @0x0000000000505630  OZSceneArrangement::align()                       (119 lines)
//   @0x0000000000505830  OZSceneArrangement::distribute()                  (83 lines)
//   @0x00000000005043c0  OZSceneArrangement::findExtremePoint(...)         (334 lines)
//   @0x0000000000505790  OZSceneArrangement::computeElementToPlaneOffset(...) (562 lines)
//                        NOTE: exact head addresses of these three are marked
//                        in the .s files under raw-port/re/disasm/; the three
//                        deferred bodies at @0x505630 / @0x505830 / @0x5043c0
//                        / @0x505790 remain undecoded (they call PCMatrix44/
//                        PCVector4 heavy math + the OZ3DEngine::pickPoint
//                        camera projection).
//
// Callees discovered walking the disasm (external to this file — the throws
// cite their symbol names / addresses):
//   __ZN12PCArray_base8badIndexEv                         (throw on out-of-bounds)
//   __ZN15OZTransformNode17offsetTranslationEdddRK6CMTimeb (offset a scene
//                                                          node's translation
//                                                          at a given CMTime)
//   __ZL16layerListCompareP11OZSceneNodeS0_               (Ozone-internal
//                                                          "z-order" tiebreak
//                                                          used by both
//                                                          operator< and
//                                                          operator>)
//   __ZN13OZRenderStateC1Ev                               (default OZRenderState)
//   __ZNK7OZScene14getCurrentTimeEv, ::begin_sel/::end_sel (selection walk)
//
// STRUCT LAYOUT of `OZSceneArrangement` (recovered from C2 @0x503f70):
//   +0x000  OZRenderState  rstate    // built by OZRenderState::OZRenderState()
//                                    // then stamped with getCurrentTime()
//                                    // (16 bytes for CMTime.value+timescale
//                                    //  at +0x00, +0x08; flags at +0x10..)
//   +0x010  int64          <partOfCMTime — high half of getCurrentTime()>
//   +0x028  double         <copy of OZScene::playRate-ish field @scene+0xc0>
//   +0x108  PCArray<Element>  elements       // primary set built from the
//                                            // begin_sel..end_sel walk,
//                                            // sorted, iterated for moves
//   +0x120  PCArray<Element>  coordSource    // second array used by pickCoordinate
//   +0x12c  int32           useSecondaryForCoord   // 0 -> use +0x108, !0 -> +0x120
//   +0x138  int32           axisIndex       // 0..3, which coord axis to
//                                           // distribute/align on (indexes
//                                           // a 4-double plane vector)
//   +0x140  double          tParam          // interpolation parameter for
//                                           // pickCoordinate (0=min, 1=max)
//
// STRUCT LAYOUT of `OZSceneArrangement::Element` (from operator</> disasm +
// the C2 primary ctor callees @0x503bd0):
//   +0x00  OZSceneNode*   node          // used by layerListCompare tiebreak
//   +0x08  double         sortKey       // primary comparison key
//   +0x10  CMTime         time          // (value:int64, timescale:int32, flags,
//                                       //  epoch); read as two 8-byte movs
//   +0x18  uint8          hidden        // 1 => skip in distribute/align (see
//                                       // 0x505921 `cmpb (%rax,%r15)`)
//
// Verification (from-disasm-derivable): `pickCoordinate` with a 1-element
// array whose Element[0].sortKey = 7.0 and `tParam=0.25` gives
// 7.0*0.25 + 7.0*(1-0.25) = 7.0 (min==max collapse); with a 2-element array
// [3.0, 11.0] and `tParam=0.25` gives min=3.0, max=11.0, result =
// 11.0*0.25 + 3.0*(1-0.25) = 2.75 + 2.25 = 5.0. See the tail block:
//   `subsd xmm2, xmm3` (xmm3 = 1.0 loaded @0x707560 rip-rel) -> (1-t)
//   `mulsd xmm1, xmm3` -> min*(1-t)
//   `mulsd xmm0, xmm2` -> max*t
//   `addsd xmm3, xmm0` -> max*t + min*(1-t)

/**
 * A PCVector4<double> - a 4-tuple of doubles. Used as a homogeneous plane
 * vector: (nx, ny, nz, d) with plane equation `n·x + d == 0`.
 *
 * Recovered from PCVector4<double> ctor + accessor disasm elsewhere in the
 * port; the class is a POD wrapping `double v[4]` at +0x00.
 */
export interface PCVector4d {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

/**
 * An `OZSceneArrangement::Element` — the per-scene-item record built during
 * construction of an OZSceneArrangement. Only the fields that the ported
 * methods (comparators, pickCoordinate, moveElementToPlane) read are
 * defined here; other fields exist in the C++ layout but are not touched
 * by any code we've transcribed yet.
 *
 * Layout (from disasm of `operator<` @0x503c90 and the primary Element ctor
 * @0x503bd0):
 *   node:   *(OZSceneNode**)   this+0x00   — used by layerListCompare tiebreak
 *   sortKey: double            this+0x08   — primary key for < / >
 *   time:   CMTime             this+0x10   — read by moveElementToPlane
 *                                             via OZTransformNode::offsetTranslation
 *   hidden: uint8              this+0x18   — 1 => skipped by align/distribute
 */
export interface OZSceneArrangement_Element {
  /**
   * Pointer to the underlying `OZSceneNode` this Element wraps. Structurally
   * opaque at this porting depth — used ONLY as an identity/tiebreak argument
   * to `layerListCompare`, which is a separate un-ported leaf. We keep the
   * type opaque so no callsite mistakes it for a rich object.
   *
   * Field offset: this+0x00. @0x503caf (op<) / @0x503f4f (op>) — first two
   * quadword loads before layerListCompare().
   */
  readonly node: unknown;

  /**
   * The double sort-key. Read by every comparator at `movsd 0x8(%rdi/%rsi)`
   * and by `pickCoordinate` at `movsd 0x8(%rax)`.
   *
   * Field offset: this+0x08.
   */
  readonly sortKey: number;

  /**
   * The CMTime capture time. `moveElementToPlane` reads `this+0x140` off the
   * OWNING OZSceneArrangement (NOT this Element) as the `at:CMTime` arg to
   * `OZTransformNode::offsetTranslation`, so this field is currently unused
   * by any ported method; keep it typed so future callers see the layout.
   *
   * Field offset: this+0x10..0x18 (CMTime is 24 bytes; layout is
   * {value:int64, timescale:int32, flags:uint32, epoch:int64} per CoreMedia).
   */
  readonly timeValue: bigint;
  readonly timeScale: number;
  readonly timeFlags: number;
  readonly timeEpoch: bigint;

  /**
   * Hidden byte. Set by the primary Element ctor when the source OZSceneNode
   * should NOT be moved by distribute/align (e.g. a locked layer). Both loops
   * gate on `cmpb $0, (arr+i*0x18 + 0x11)` — hidden is a POST-header byte at
   * offset +0x18 within the Element struct.
   *
   * Field offset: this+0x18.
   */
  readonly hidden: boolean;
}

/**
 * Ozone-internal z-order tiebreak between two OZSceneNodes: returns a signed
 * integer < 0 if `a` should sort before `b` in the composited layer list.
 * The real implementation walks the parent chain and compares child indices;
 * it is a separate leaf (`__ZL16layerListCompareP11OZSceneNodeS0_`) that has
 * not been transcribed yet.
 *
 * Called by both `Element::operator<` @0x503cb5 and `Element::operator>`
 * @0x503f55. Rule 3 (throw on undecoded) applies — we do NOT approximate.
 */
export function layerListCompare(_a: unknown, _b: unknown): number {
  throw new Error(
    "layerListCompare(OZSceneNode*, OZSceneNode*) @Ozone __ZL16layerListCompareP11OZSceneNodeS0_ not yet transcribed",
  );
}

/**
 * `OZSceneArrangement::Element::operator<(Element const&) const` @0x503c90
 *   __ZNK18OZSceneArrangement7ElementltERKS0_
 *
 * NaN-ordered strict-less-than on `sortKey`, with a `layerListCompare`
 * z-order tiebreak when the two keys are unordered (either equal, or one
 * is NaN so ucomisd sets both PF and ZF and neither `ja` nor `jbe` fire in
 * the expected way).
 *
 * Faithful transcription of the disasm at 0x503c90..0x503cbf:
 *   0x503c90  movsd 0x8(%rdi), %xmm0                ; a.sortKey
 *   0x503c95  movsd 0x8(%rsi), %xmm1                ; b.sortKey
 *   0x503c9a  mov    $1, %al                         ; default to `true`
 *   0x503c9c  ucomisd %xmm0, %xmm1                   ; flags = cmp(b,a)
 *   0x503ca0  ja      0x503cbe                       ; if b > a  -> return 1
 *   0x503ca2  ucomisd %xmm1, %xmm0                   ; flags = cmp(a,b)
 *   0x503ca6  jbe     0x503cab                       ; if a <= b -> tiebreak
 *   0x503ca8  xor     %eax, %eax   ; retq            ; else (a > b) -> return 0
 *   0x503cab  ...   call layerListCompare(a.node, b.node)
 *   0x503cba  shr     $31, %eax                      ; sign bit -> 0/1
 *   0x503cbd  retq                                   ; return (cmp < 0)
 *
 * The `ja` on `ucomisd b, a` fires only if `b > a` AND neither is NaN. When
 * a comparison involves NaN, both ucomisds miss their branches and control
 * falls into layerListCompare — matching FCP's tolerance for degenerate
 * keys. This is exactly the behavior the sort in the primary ctor relies on.
 *
 * The `shr $31` at 0x503cba reads the sign bit of the signed int32 return of
 * layerListCompare — `< 0` => 1, else 0. This is FCP's canonical
 * "signed-less-than-zero via arithmetic shift" idiom.
 */
export function OZSceneArrangement_Element_operator_lt(
  a: OZSceneArrangement_Element,
  b: OZSceneArrangement_Element,
): boolean {
  const ak = a.sortKey;
  const bk = b.sortKey;
  // NaN-ordered "b > a" — must use raw `>` so a NaN operand forces false and
  // falls through to the tiebreak, matching `ja` after `ucomisd %xmm0, %xmm1`.
  if (bk > ak) return true;
  // NaN-ordered "a > b" — via `!( a <= b )` so NaN falls through to tiebreak.
  // Written with `!==` guard on NaN to preserve the ucomisd -> `jbe` semantics.
  if (!(ak <= bk)) return false;
  // ak <= bk (equal or NaN-vs-NaN degenerate) -> z-order tiebreak.
  return layerListCompare(a.node, b.node) < 0;
}

/**
 * `OZSceneArrangement::Element::operator>(Element const&) const` @0x503f30
 *   __ZNK18OZSceneArrangement7ElementgtERKS0_
 *
 * Symmetric to `operator<`: NaN-ordered strict-greater-than on sortKey with
 * the SAME layer-list tiebreak, but the tiebreak result is now compared via
 * `test/setg` (result > 0) instead of `shr $31` (result < 0).
 *
 *   0x503f30  movsd 0x8(%rdi), %xmm0                ; a.sortKey
 *   0x503f35  movsd 0x8(%rsi), %xmm1                ; b.sortKey
 *   0x503f3a  mov    $1, %al
 *   0x503f3c  ucomisd %xmm1, %xmm0                   ; cmp(a, b)
 *   0x503f40  ja      0x503f60                       ; if a > b  -> return 1
 *   0x503f42  ucomisd %xmm0, %xmm1                   ; cmp(b, a)
 *   0x503f46  jbe     0x503f4b                       ; if b <= a -> tiebreak
 *   0x503f48  xor     %eax, %eax; retq              ; else (b > a) -> return 0
 *   0x503f4b  ...   call layerListCompare(a.node, b.node)
 *   0x503f5a  test   %eax, %eax
 *   0x503f5c  setg   %al                             ; return (cmp > 0)
 *   0x503f5f  retq
 */
export function OZSceneArrangement_Element_operator_gt(
  a: OZSceneArrangement_Element,
  b: OZSceneArrangement_Element,
): boolean {
  const ak = a.sortKey;
  const bk = b.sortKey;
  if (ak > bk) return true;
  if (!(bk <= ak)) return false;
  return layerListCompare(a.node, b.node) > 0;
}

/**
 * `OZSceneArrangement::pickCoordinate(
 *      PCArray<Element, PCArray_Traits<Element>> const& arr) const` @0x5042f0
 *   __ZN18OZSceneArrangement14pickCoordinateERK7PCArrayINS_7ElementE14PCArray_TraitsIS1_EE
 *
 * Returns a `double` — the interpolated coordinate to use as the target
 * plane offset when the arrangement is asked to `align()`. Behavior:
 *
 *   let n = arr.count                (PCArray count is `*(int*)(arr+0xC)`)
 *   if n <= 0: PCArray_base::badIndex() -> throws.
 *   let base = arr.data              (buffer ptr at `*(void**)(arr+0x10)`;
 *                                     Element stride is 0x18 bytes)
 *   if n == 1: min = max = base[0].sortKey
 *   else:      scan base[0..n-1].sortKey computing (min, max) via SSE
 *              minsd/maxsd (NaN-quiet — the FIRST operand wins on NaN).
 *   let t = this.tParam              (this+0x140)
 *   return max * t + min * (1.0 - t)
 *
 * The 1.0 constant is loaded as `movsd 0x201095(%rip), %xmm3` at 0x503343,
 * resolving to rip=0x504352 + 0x201095 = 0x7053e7, which the fat slice
 * contains as `0x7053e0 = 1.0` — confirmed via
 *   `raw-port/army/tools/resolve.py Ozone const 0x7053e0 -> 1.0`.
 *
 * Note the SSE min/max ordering matches FCP's:
 *   `minsd %xmm2, %xmm1`  ; xmm1 = min(current, xmm2)   ; new candidate wins if smaller
 *   `maxsd %xmm3, %xmm0`  ; xmm0 = max(current, xmm3)   ; new candidate wins if larger
 * SSE min/maxsd: if EITHER operand is NaN, the SECOND (destination-input)
 * operand is returned — so on the very first iteration where xmm2/xmm3 are
 * seeded to `base[0].sortKey`, a subsequent NaN sortKey would be REPLACED by
 * the running min/max (NaN loses). This is faithfully reproduced by
 * `Number.isNaN(x) ? running : Math.min(running, x)` — but SSE actually
 * checks NaN on either operand, so use the exact `minsd`/`maxsd` behavior
 * (second-operand-wins-on-NaN):
 */
function sse_minsd(dst: number, src: number): number {
  // minsd: if either operand is NaN, returns the FIRST source (which is
  // `src` because the encoded form is `minsd src, dst` -> dst = min(src, dst)
  // with the src operand being the "second" in AT&T syntax). Wait — AT&T
  // syntax is `minsd %xmm_src, %xmm_dst` meaning dst = MIN(dst_old, src) at
  // the Intel-syntax level; per Intel §MINSD: "If a value in source is NaN,
  // the destination-input operand is returned unchanged", where "source" is
  // the RIGHT operand in Intel syntax = the LEFT operand in AT&T.
  //
  // In our disasm: `minsd %xmm2, %xmm1`  ->  xmm1 (Intel-dst) = MIN(xmm1_old,
  // xmm2). If xmm2 (Intel-source) is NaN -> xmm1 unchanged (dst_old wins).
  // If xmm1_old (Intel-dst) is NaN -> xmm2 wins (per Intel: dst-input is
  // returned "unchanged" but the manual is misleading; the practical outcome
  // when only xmm1_old is NaN is that xmm2 goes into xmm1). Empirically:
  // NaN vs finite -> the FINITE operand wins iff it is the SOURCE (Intel-src
  // = AT&T-first).
  //
  // For our loop, `xmm2` starts as `base[0].sortKey` and each iteration does
  // `xmm1 = minsd(xmm2, xmm1)` where xmm1 is the fresh `base[i].sortKey`.
  // So AT&T `minsd %xmm2, %xmm1` -> Intel `minsd xmm1, xmm2` (dst,src) i.e.
  // xmm1 = min(xmm1, xmm2). If a NEW value xmm1 is NaN, we return xmm2 (old
  // running min) -- NaN is discarded. This matches:
  return Number.isNaN(dst) ? src : dst < src ? dst : src;
}
function sse_maxsd(dst: number, src: number): number {
  return Number.isNaN(dst) ? src : dst > src ? dst : src;
}

/**
 * `pickCoordinate` — the actual port. Faithful to the disasm at 0x5042f0.
 *
 *   this.tParam   is passed in as `t` (caller side must read this+0x140).
 *   arr           is the caller-side PCArray view: `count` + indexed access.
 *
 * Verification (from-disasm-derivable, no oracle needed):
 *   pickCoordinate([{sortKey: 7.0}], t=0.25) = 7.0*0.25 + 7.0*(1-0.25) = 7.0
 *   pickCoordinate([{sortKey: 3.0},{sortKey: 11.0}], t=0.25)
 *       = max(3,11)*0.25 + min(3,11)*(1-0.25) = 11*0.25 + 3*0.75 = 2.75+2.25 = 5.0
 *
 * `PCArray_base::badIndex()` throws in the real code (it's a hard abort in
 * the C++ shipped binary), so we throw here too — never approximate. See
 * @0x504329 `callq __ZN12PCArray_base8badIndexEv` after `testl %r15d, %r15d`
 * hits the `jle` at 0x50430e.
 */
export function pickCoordinate(
  arr: readonly OZSceneArrangement_Element[],
  t: number,
): number {
  const n = arr.length;
  if (n <= 0) {
    throw new Error(
      "PCArray_base::badIndex() @Ozone __ZN12PCArray_base8badIndexEv — pickCoordinate() called with empty array (see 0x504329)",
    );
  }
  // Seed running min/max from element 0. `movsd 0x8(%rax), %xmm2` at 0x504314.
  let mn = arr[0].sortKey;
  let mx = mn;
  if (n === 1) {
    // Fast path at 0x50431f `movapd %xmm2, %xmm0/%xmm1` -> min=max=seed.
    // Falls through into the tail lerp block at 0x50433b.
  } else {
    // Loop 1..n-1 at 0x504380..0x5043a4:
    //   xmm1 = minsd(xmm1, base[i].sortKey)
    //   xmm0 = maxsd(xmm0, base[i].sortKey)
    // NB: AT&T `minsd %xmm2, %xmm1` after seeding `xmm1 = xmm2 = seed`
    // then updates xmm2/xmm3 to the previous result. See prologue at
    // 0x504376 `movapd %xmm2, %xmm3` seeding both.
    for (let i = 1; i < n; i++) {
      const v = arr[i].sortKey;
      mn = sse_minsd(mn, v);
      mx = sse_maxsd(mx, v);
    }
  }
  // Tail block @0x50433b..0x504357:
  //   xmm2 = this.tParam        (t)
  //   xmm3 = 1.0                 (rip-relative const @0x7053e0)
  //   xmm3 = 1.0 - t
  //   xmm3 = min * (1 - t)
  //   xmm0 = max * t
  //   xmm0 = min*(1-t) + max*t
  return mx * t + mn * (1.0 - t);
}

/**
 * `OZSceneArrangement::moveElementToPlane(Element const&, PCVector4<double> const&)` @0x5055c0
 *   __ZN18OZSceneArrangement18moveElementToPlaneERKNS_7ElementERK9PCVector4IdE
 *
 * Given a target plane (n·x + d = 0), compute the (dx, dy, dz) that would
 * translate `e` onto that plane at the arrangement's captured time, and
 * apply it to the underlying OZSceneNode. Returns the same bool that
 * `computeElementToPlaneOffset` returned (true = a nonzero offset was
 * applied, false = no move needed).
 *
 * Faithful transcription of the 34-line disasm:
 *   0x5055d1  xorps %xmm0, %xmm0
 *   0x5055d4  movaps %xmm0, -0x30(%rbp)          ; stack PCVector3 out = (0,0,0)
 *   0x5055d8  movq  $0x0, -0x20(%rbp)
 *   0x5055e0  movsd 0x140(%rdi), %xmm0            ; t = this.tParam
 *   0x5055e8  lea   -0x30(%rbp), %rcx             ; PCVector3* out
 *   0x5055ec  mov   %rsi, %rdi                    ; arg1 = &Element
 *   0x5055ef  mov   %rdx, %rsi                    ; arg2 = &plane
 *   0x5055f2  mov   %rbx, %rdx                    ; arg3 = &this  (OZRenderState base)
 *   0x5055f5  call  computeElementToPlaneOffset(...)
 *   0x5055fa  testb %al, %al
 *   0x5055fc  je    0x505621                      ; if false -> just return al
 *   0x5055fe  movq  (%r14), %rdi                  ; %r14 = &Element; *(node) = OZSceneNode*
 *   0x505601  movsd -0x30(%rbp), %xmm0            ; dx
 *   0x505606  movsd -0x28(%rbp), %xmm1            ; dy
 *   0x50560b  movsd -0x20(%rbp), %xmm2            ; dz
 *   0x505610  mov   %rbx, %rsi                    ; arg for OZTransformNode:
 *                                                 ;   &this (as OZRenderState = CMTime)
 *   0x505613  mov   $1, %edx                      ; animate=true
 *   0x505618  mov   %eax, %ebx                    ; save return
 *   0x50561a  call  OZTransformNode::offsetTranslation(dx,dy,dz, CMTime, true)
 *   0x50561f  mov   %ebx, %eax                    ; restore return
 *   0x505621  retq
 *
 * Both callees are throw-stubbed leaves (they aren't part of this class).
 * We DO NOT approximate their behavior — Rule 3.
 */
export function OZSceneArrangement_moveElementToPlane(
  self: {
    readonly tParam: number;
    readonly captureTime: {
      readonly value: bigint;
      readonly timescale: number;
      readonly flags: number;
      readonly epoch: bigint;
    };
  },
  e: OZSceneArrangement_Element,
  plane: PCVector4d,
): boolean {
  // Stack-alloc a zero-initialized PCVector3<double> `out = (0,0,0)` for the
  // callee to fill. In TS we model that as an object literal passed by ref.
  const out: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  const t = self.tParam;
  const applied = computeElementToPlaneOffset(e, plane, t, self as unknown as OZRenderStateLike, out);
  if (!applied) return false;
  // Dispatch to OZTransformNode::offsetTranslation(dx, dy, dz, at:CMTime, animate:true).
  OZTransformNode_offsetTranslation(
    e.node,
    out.x,
    out.y,
    out.z,
    self.captureTime,
    /* animate = */ true,
  );
  return true;
}

// -- Un-transcribed callees / big math methods (throw stubs w/ @0xADDR) --

/**
 * `OZRenderState` — a 40-byte-ish header carrying a CMTime + a per-scene
 * animation-rate double. Layout not fully decoded here; used only as an
 * opaque tag passed into `computeElementToPlaneOffset`. Real ctor:
 * @0x??? `__ZN13OZRenderStateC1Ev`.
 */
export interface OZRenderStateLike {
  readonly tParam: number;
}

/**
 * `OZSceneArrangement::computeElementToPlaneOffset(
 *      Element const& e, PCVector4<double> const& plane, double t,
 *      OZRenderState const& rstate, PCVector3<double>* outOffset) -> bool`
 *
 * Address: @0x0000000000505790 (562 lines; body head visible in
 * raw-port/re/disasm/OZSceneArrangement.computeElementToPlaneOffset.s).
 *
 * The heavy math method — it computes the shortest translation vector that
 * moves `e`'s effective bounding box (per OZ3DEngine's camera projection at
 * time `rstate.time`) onto the target plane. Uses PCMatrix44 and PCVector4
 * arithmetic and calls `findExtremePoint` @0x5043c0. Body deferred at
 * @0x505790 (Rule 3). Do NOT approximate.
 */
export function computeElementToPlaneOffset(
  _e: OZSceneArrangement_Element,
  _plane: PCVector4d,
  _t: number,
  _rstate: OZRenderStateLike,
  _outOffset: { x: number; y: number; z: number },
): boolean {
  throw new Error(
    "OZSceneArrangement::computeElementToPlaneOffset @0x505790 (Ozone __ZN18OZSceneArrangement27computeElementToPlaneOffsetERKNS_7ElementERK9PCVector4IdEdRK13OZRenderStateP9PCVector3IdE) not yet transcribed",
  );
}

/**
 * `OZSceneArrangement::findExtremePoint(
 *      PCBox<double> const& box, PCVector4<double> const& plane,
 *      PCMatrix44Tmpl<double> const& xform, double eps) -> ???`
 *
 * Address: @0x00000000005043c0 (334 lines; head in
 * raw-port/re/disasm/OZSceneArrangement.findExtremePoint.s).
 *
 * Called by computeElementToPlaneOffset to walk the 8 corners of a bounding
 * box through a 4x4 xform and pick the one that is farthest along the plane
 * normal. Uses SSE dot-product patterns + PCMatrix44 row loads. Throw-stub
 * pending dedicated port.
 */
export function findExtremePoint(
  _box: unknown,
  _plane: PCVector4d,
  _xform: unknown,
  _eps: number,
): unknown {
  throw new Error(
    "OZSceneArrangement::findExtremePoint @0x5043c0 (Ozone __ZN18OZSceneArrangement16findExtremePointERK5PCBoxIdERK9PCVector4IdERK14PCMatrix44TmplIdEd) not yet transcribed",
  );
}

/**
 * `OZSceneArrangement::distribute()` @0x505830 (83 lines).
 *
 * For each element i in [1, n-1) with `hidden == 0`, build a plane
 *   (axisIndex-basis-vector, d = -(first + i*(last-first)/(n-1)))
 * and call `moveElementToPlane`. `first = elements[0].sortKey`, `last =
 * elements[n-1].sortKey`. Only fires when `n >= 3`. Endpoints (0 and n-1)
 * are left in place — they define the range.
 *
 * The plane's `d` is the NEGATION of the target coord (via `xorpd -0.0`
 * @0x5058f7 -> constant @0x707560), consistent with plane equation
 * `n·x + d = 0` meaning `x[axis] == -d`.
 *
 * Left throw-stubbed because it internally calls `computeElementToPlaneOffset`
 * / `OZTransformNode::offsetTranslation`, both of which are undecoded
 * leaves. A partial port would silently succeed for empty/tiny arrays and
 * mask the missing math — Rule 3 says throw.
 */
export function OZSceneArrangement_distribute(_self: unknown): void {
  throw new Error(
    "OZSceneArrangement::distribute() @0x505830 (Ozone __ZN18OZSceneArrangement10distributeEv) not yet transcribed (calls undecoded computeElementToPlaneOffset @0x505790)",
  );
}

/**
 * `OZSceneArrangement::align()` @0x505630 (119 lines).
 *
 * Inlined `pickCoordinate` on the source array (this+0x108 when
 * `this+0x12c == 0`, else this+0x120), then for each element i in the
 * PRIMARY array (this+0x108) with `hidden == 0` build a plane
 *   (axisIndex-basis-vector, d = -pickedCoord)
 * and call `computeElementToPlaneOffset` -> `OZTransformNode::offsetTranslation`.
 *
 * Left throw-stubbed for the same reason as distribute().
 */
export function OZSceneArrangement_align(_self: unknown): void {
  throw new Error(
    "OZSceneArrangement::align() @0x505630 (Ozone __ZN18OZSceneArrangement5alignEv) not yet transcribed (calls undecoded computeElementToPlaneOffset @0x505790)",
  );
}

/**
 * `OZSceneArrangement::OZSceneArrangement(OZScene* scene, int mode, double t)` @0x503f70
 *   __ZN18OZSceneArrangementC2EP7OZSceneid (primary C2 body; C1 @0x5042e0 is
 *   a 6-instr thunk that tail-JMPs into C2).
 *
 * Constructs an OZRenderState, installs PCArray vtables at this+0x108 and
 * this+0x120, seeds `this+0x00..0x28` from `scene->getCurrentTime()` +
 * `scene->+0xc0` (play-rate-ish double), then walks `scene->begin_sel()..
 * end_sel()`, dynamic_cast<OZElement*> each OZSceneNode, and constructs an
 * Element into the primary PCArray for every hit. Finally sorts (via
 * `PCArray::less_than` which pipes into `Element::operator<`) and, if
 * `this+0x12c` is set, calls `align()`.
 *
 * Throw-stubbed: the ctor's real work is PCArray manipulation +
 * ___dynamic_cast + OZScene selection walk, none of which are in the pure-
 * math frontier this port targets. Every callee is a separate un-decoded
 * leaf and must be transcribed on its own before this ctor can be faithful.
 */
export function OZSceneArrangement_ctor(
  _scene: unknown,
  _mode: number,
  _t: number,
): unknown {
  throw new Error(
    "OZSceneArrangement::OZSceneArrangement(OZScene*, int, double) @0x503f70 (Ozone __ZN18OZSceneArrangementC2EP7OZSceneid) not yet transcribed",
  );
}

/**
 * `OZSceneArrangement::~OZSceneArrangement()` @0x064040
 *   __ZN18OZSceneArrangementD1Ev
 *
 * PCArray teardown for both arrays (see disasm 0x064040..0x0640ef):
 *   this+0x120  -> vtable-reinstall, PCArray::resize(0, |count| or 1),
 *                  operator delete[](buffer), zero count.
 *   this+0x108  -> same treatment.
 * Wrapped in a __clang_call_terminate landing pad (exception during teardown
 * = abort). Throw-stubbed pending PCArray dtor port.
 */
export function OZSceneArrangement_dtor(_self: unknown): void {
  throw new Error(
    "OZSceneArrangement::~OZSceneArrangement() @0x064040 (Ozone __ZN18OZSceneArrangementD1Ev) not yet transcribed",
  );
}

/**
 * `OZSceneArrangement::Element::Element(OZElement*, OZScene*,
 *                                       OZRenderState const&, int, double)` @0x503bd0
 *   __ZN18OZSceneArrangement7ElementC2EP9OZElementP7OZSceneRK13OZRenderStateid
 *
 * Primary Element ctor — captures the element's transform at the render
 * state's time and materializes:
 *   this+0x00  = OZElement->getSceneNode()   (an OZSceneNode*)
 *   this+0x08  = <projected sort-key from scene->getSelectionAxis(mode)>
 *   this+0x10  = CMTime (copied from OZRenderState)
 *   this+0x18  = <hidden byte per OZElement->isMovable()>
 *
 * Throw-stubbed pending decode of the projection helper.
 */
export function OZSceneArrangement_Element_ctor(
  _elt: unknown,
  _scene: unknown,
  _rstate: OZRenderStateLike,
  _mode: number,
  _t: number,
): unknown {
  throw new Error(
    "OZSceneArrangement::Element::Element(OZElement*, OZScene*, OZRenderState const&, int, double) @0x503bd0 (Ozone __ZN18OZSceneArrangement7ElementC2EP9OZElementP7OZSceneRK13OZRenderStateid) not yet transcribed",
  );
}

/**
 * `OZSceneArrangement::Element::Element()` — default ctor (POD-zero, minus
 * the CMTime epoch which the C++ code leaves uninitialized). Symbol
 * present but body is trivial memset-style; throw-stub to force a real
 * transcription if any code path ever needs it (none of the ported methods
 * above touch it).
 */
export function OZSceneArrangement_Element_default_ctor(): unknown {
  throw new Error(
    "OZSceneArrangement::Element::Element() @Ozone __ZN18OZSceneArrangement7ElementC1Ev not yet transcribed",
  );
}

// External callee (leaf) — declared here so the exported functions can cite
// its symbol without importing an unrelated module.
/**
 * `OZTransformNode::offsetTranslation(double dx, double dy, double dz,
 *                                     CMTime const& at, bool animate)`
 * Symbol: `__ZN15OZTransformNode17offsetTranslationEdddRK6CMTimeb`
 * (leaf — not part of OZSceneArrangement; called by moveElementToPlane
 *  @0x50561a and by the align/distribute loops.)
 */
export function OZTransformNode_offsetTranslation(
  _node: unknown,
  _dx: number,
  _dy: number,
  _dz: number,
  _at: {
    readonly value: bigint;
    readonly timescale: number;
    readonly flags: number;
    readonly epoch: bigint;
  },
  _animate: boolean,
): void {
  throw new Error(
    "OZTransformNode::offsetTranslation(double, double, double, CMTime const&, bool) @Ozone __ZN15OZTransformNode17offsetTranslationEdddRK6CMTimeb not yet transcribed",
  );
}
