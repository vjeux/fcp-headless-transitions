// OZQuadraticPath.ts — Ozone quadratic-bezier path (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice)
//
// A doubly-linked-list container of quadratic-bezier "segment" nodes.  Used
// by Ozone's shape / vector-tool code for hit-testing against user strokes.
//
// Symbols ported (mangled → address):
//   * __ZN15OZQuadraticPathC2Ev
//       OZQuadraticPath::OZQuadraticPath()   [C2 base ctor]        @0x4ef6c0
//   * __ZN15OZQuadraticPathC1Ev
//       OZQuadraticPath::OZQuadraticPath()   [C1 complete ctor]    @0x4ef6e0
//   * __ZN15OZQuadraticPathD2Ev
//       OZQuadraticPath::~OZQuadraticPath()  [D2 base dtor]        @0x4ef700
//   * __ZN15OZQuadraticPathD1Ev
//       OZQuadraticPath::~OZQuadraticPath()  [D1 complete dtor]    @0x4ef780
//   * __ZN15OZQuadraticPath18intersectsWithLineERK9PCVector2IfES3_
//       OZQuadraticPath::intersectsWithLine(
//           PCVector2<float> const&, PCVector2<float> const&)       @0x4ef800
//   * __ZN15OZQuadraticPath23intersectsWithQuadraticERK9PCVector2IfES3_S3_
//       OZQuadraticPath::intersectsWithQuadratic(
//           PCVector2<float> const&, PCVector2<float> const&,
//           PCVector2<float> const&)                                @0x4efee0
//
// -----------------------------------------------------------------------------
// SHAPE — 24 bytes = a doubly-linked-list HEAD sentinel
// -----------------------------------------------------------------------------
//   0x00  Node* next       — points to the head itself when empty
//                             (C1 ctor: `this->next = this;` @0x4ef6e4)
//   0x08  Node* prev       — points to the head itself when empty
//                             (C1 ctor: `this->prev = this;` @0x4ef6e7)
//   0x10  u64   count = 0  — segment count (C1 ctor: `this->count = 0;`
//                             @0x4ef6eb)
//
// Each Node has the same 24-byte header ({next, prev, dataPtr}) followed by
// segment data.  See intersectsWithLine notes below for the segment layout.
//
// -----------------------------------------------------------------------------
// SEGMENT LAYOUT (derived from intersectsWithLine @0x4ef800)
// -----------------------------------------------------------------------------
// From `movq 0x10(%r13), %r8`  @0x4ef87c  (Node* @0x10 → the segment `data`):
//
//   segment[+0x00] u32 kind             — 0 means "quadratic bezier"; !=0
//                                          means "line segment" (see below)
// If kind == "quadratic" (kind == 0):
//   segment[+0x04] PCVector2<float>  P0  — 8 bytes
//   segment[+0x0C] PCVector2<float>  P1  — 8 bytes (control)
//   segment[+0x14] PCVector2<float>  P2  — 8 bytes
// If kind != 0 ("line"):
//   segment[+0x04] PCVector2<float>  P0  — 8 bytes
//   segment[+0x0C] PCVector2<float>  P1  — 8 bytes
//
// The kind==0 (line) path @0x4ef9b0 does a 2D cross-product test on the
// (P1-P0) vs (queryEnd-queryStart) diagonals to find the parametric-t of the
// line-line intersection, gated by 0 <= t <= 1 on both segments, then does
// the endpoint-fabs check (see PCLineQuadIntersection GATE below).
//
// -----------------------------------------------------------------------------
// GATE CONSTANTS (RIP-relative loads in intersectsWithLine)
// -----------------------------------------------------------------------------
//   @0x4ef83d  movaps  0x21837c(%rip), %xmm7  →  const @0x707bc0
//                4×u32 = 0x7fffffff each  →  packed-f32 fabs mask.
//   @0x4ef844  movss   0x218393(%rip), %xmm8  →  const @0x707be0
//                low-u32 = 0x3727c5ac  →  float 1e-5  (endpoint tolerance).
//   @0x4ef84d  movss   0x217d06(%rip), %xmm9  →  const @0x70755c
//                low-u32 = 0xbf800000  →  float -1.0  (added to `t` to test
//                                                     `t == 1.0` via fabs).
//   @0x4efa03  movss   0x217545(%rip), %xmm4  →  const @0x706f50
//                low-u32 = 0x3f800000  →  float +1.0  (parameter upper bound).
//   @0x4efa35  movss   0x217513(%rip), %xmm1  →  const @0x706f50
//                low-u32 = 0x3f800000  →  float +1.0  (same 1.0 constant).
//
// The endpoint-fabs test is: for each returned parametric hit `t`, if
// `fabs(t) <= 1e-5` OR `fabs(t - 1.0) <= 1e-5`, DISCARD that hit (it's
// on an endpoint of a neighbouring segment, so it's not a real crossing
// but a shared vertex).  The `bl`/`r12` flags track which end of the query
// line coincides with the neighbour endpoint — if the flag is set, the
// test is skipped for that end (@0x4ef88b `cmovel` selects the endpoint
// flag when `queryEnd matches head.next.data / head.prev.data`).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all unported)
// -----------------------------------------------------------------------------
//   * int PCLineQuadIntersection<float>(
//         PCVector2<float> const& p0, PCVector2<float> const& p1,
//         PCVector2<float> const& p2, PCVector2<float> const& l0,
//         PCVector2<float> const& l1, float (*out_t) [2], float (*out_u) [2])
//       @0x4ef8c8  — the guts of "line vs quadratic bezier" solver.  Returns
//       0/1/2 (number of hits) and writes up to two (t, u) pairs.  IN-BINARY
//       symbol (non-stub), but not yet decoded here.  Frontier.
//   * void PCQuadQuadIntersection(
//         PCVector2<double> const&, PCVector2<double> const&,
//         PCVector2<double> const&, PCVector2<double> const&,
//         PCVector2<double> const&, PCVector2<double> const&,
//         double (*out) [4][2], bool)
//       @stub Ozone 0x6dd1ee  — quadratic-vs-quadratic solver.
//   * operator delete(void*)
//       @stub Ozone 0x6dfc36  — for freeing Node allocations in the dtor.
//   * ___stack_chk_fail
//       @stub Ozone 0x6dfd38  — stack canary abort.
//
// -----------------------------------------------------------------------------
// intersectsWithLine — @0x4ef800 — control flow
// -----------------------------------------------------------------------------
// Prologue: install stack canary @0x4ef811; load segment-list head into r13
// via `head.next` @0x4ef81f.  If empty (head.next == head), return 0 (`al=0`)
// @0x4ef826.
//
// LOOP:
//   node = r13; seg = node[+0x10];
//   bothEndpointsFlagged =
//     bl  |= (seg == head.prev[+0x10])   // queryStart-end == list-tail seg
//     r12 |= (seg == head.next[+0x10])   // queryEnd-end   == list-head seg
//   If seg.kind (u32 @+0) != 0:   // quadratic
//     hits = PCLineQuadIntersection<float>(
//              queryStart, queryEnd, seg+0x04, seg+0x0c, seg+0x14,
//              &out_u, &out_t)          @0x4ef8c8
//     if hits <= 0  → next-node.
//     // Otherwise iterate through `hits` results:
//     for i in 0..hits-1:
//       t = out_t[i];  u = out_u[i];
//       if bothEndpointsFlagged (r12&1) {
//         if bl&1 {
//           // FULL endpoint gate — skip hit if it's on ANY endpoint of
//           // either the query line OR the bezier segment.
//           //   if fabs(t + -1.0)  <= 1e-5  → skip and try next i
//           //   if fabs(u)         <= 1e-5  → skip and try next i
//           //   if fabs(t)         <= 1e-5  → RETURN TRUE (hit — the
//           //                              other endpoint's coincidence
//           //                              was flagged separately)
//           //   if fabs(u + -1.0)  <= 1e-5  → RETURN TRUE
//         } else {
//           // only-queryEnd-end flagged → skip only that endpoint on u.
//         }
//         // etc — see @0x4ef95c..@0x4ef9a3 for the full 4-way test.
//       } else if (bl&1) {
//         // only-queryStart-end flagged → skip that endpoint on t.
//         @0x4efa6b..@0x4efaa9.
//       } else {
//         // NO endpoint flags — any hit at all → RETURN TRUE @0x4efab0.
//       }
//     next iteration of i.
//   Else:   // kind == 0 → LINE-VS-LINE test @0x4ef9b0
//     P0 = seg+0x04;  P1 = seg+0x0c;
//     e0 = queryStart; e1 = queryEnd;
//     d1 = P1 - P0;    d2 = e1 - e0;
//     cross1 = d2.x * (d1.y) - d2.y * (d1.x)                      // via shufps
//     if cross1 == 0  → next-node (parallel).
//     v  = e0 - P0;                                                (unused post-cross)
//     cross2 = v.x * d1.y - v.y * d1.x;
//     t  = cross2 / cross1;
//     if !(0 <= t <= 1) → next-node.
//     u  = (v.y * d2.x - v.x * d2.y) / cross1;
//     if !(0 <= u <= 1) → next-node.
//     // endpoint gate exactly like the quadratic path — see @0x4efa46 onward.
//     RETURN TRUE / false based on the bl/r12 flags.
//   node = node.next;  loop until node == head.
//
// -----------------------------------------------------------------------------
// intersectsWithQuadratic — @0x4efee0 — control flow
// -----------------------------------------------------------------------------
// Same shape as intersectsWithLine, but the outer "query" is itself a
// quadratic bezier (three points).  Inner cases:
//   - seg.kind == 0  → call PCLineQuadIntersection<float>(...)
//                       @0x4f0036 with the QUERY as the line-degenerate
//                       argument and the seg as the quadratic (cast to
//                       doubles first via `cvtps2pd`).
//   - seg.kind != 0  → call PCQuadQuadIntersection<double>(...)
//                       @0x4effe3 with both seg and query as doubles;
//                       out is a [4][2] pair of `t` values.
// Endpoint-tolerance and neighbour-endpoint gates are identical.
//
// Both intersection subroutines are frontier — the whole method raises.
//
// -----------------------------------------------------------------------------
// D1/D2 dtor — @0x4ef780 / @0x4ef700
// -----------------------------------------------------------------------------
// D1 body (D2 twin @0x4ef700 is byte-identical):
//   node = head.next;
//   if (node != head)   → jump to `unlink-and-free`  loop @0x4ef7e9.
//   if (head.count != 0) {
//     // splice out — the ONLY node here is the sentinel-like connector
//     // that was left in place; unhook it.
//     tmp = head.prev.data;    // (head.next).prev = head.prev.data.next
//     head.prev.next.prev = tmp;
//     tmp.next = head.prev.next;
//     head.count = 0;
//   }
//   // then a `while (curNode != head) { free(curNode.data); curNode = curNode.next; }`
//   loop @0x4ef7c0-@0x4ef7cf frees each node's `data` pointer via
//   operator-delete (stub 0x6dfc36).
//
// This is a straightforward list-walk-and-free; the ONLY frontier is
// operator delete.
//
// -----------------------------------------------------------------------------
// C1/C2 ctor — @0x4ef6e0 / @0x4ef6c0
// -----------------------------------------------------------------------------
// Both are trivially:
//     this->next = this;
//     this->prev = this;
//     this->count = 0;
// with C2 identical at @0x4ef6c0.  NO frontier — we can implement this
// bit-exactly, and DO.

/** Opaque doubly-linked-list node — see SEGMENT LAYOUT in the file header.
 *  Not decoded here; the node's `data` payload is the actual segment. */
export interface OZQuadraticPathNode {
  next: OZQuadraticPathNode;
  prev: OZQuadraticPathNode;
  /** raw segment data pointer @+0x10 in the C++ ABI (24 bytes into the node
   *  header, past next/prev); the segment schema is documented in the file
   *  header. */
  data: unknown;
}

/** PCVector2<float>: 2×f32 = 8 bytes. */
export interface PCVector2f {
  x: number;
  y: number;
}

export class OZQuadraticPath {
  /** @+0x00 — sentinel next pointer; points to `this` when empty. */
  next: OZQuadraticPath | OZQuadraticPathNode = this;

  /** @+0x08 — sentinel prev pointer; points to `this` when empty. */
  prev: OZQuadraticPath | OZQuadraticPathNode = this;

  /** @+0x10 — segment count.  Zero when empty. */
  count: number = 0;

  /**
   * OZQuadraticPath::OZQuadraticPath()  [C1 complete ctor]        — @0x4ef6e0
   *
   * Body verbatim (7 insns):
   *   @0x4ef6e4  this->next = this
   *   @0x4ef6e7  this->prev = this
   *   @0x4ef6eb  this->count = 0
   *   ret.
   *
   * The C2 twin @0x4ef6c0 is byte-identical.
   *
   * NO frontier — we implement this bit-exactly.
   */
  constructor() {
    // @0x4ef6e4-0x4ef6eb sentinel init
    this.next = this;
    this.prev = this;
    this.count = 0;
  }

  /**
   * OZQuadraticPath::~OZQuadraticPath() [D1 complete dtor]        — @0x4ef780
   *
   * Body summary (see file header for annotated flow):
   *   1. If `head.next == head` (empty), fall through to the free loop with
   *      zero iterations @0x4ef78e-@0x4ef791.
   *   2. Otherwise, if `head.count != 0`, splice out the neighbour of the
   *      first node (see head-splice block @0x4ef79a-@0x4ef7af).
   *   3. Loop from head.next until head, freeing each node's `data` via
   *      `operator delete` (stub Ozone 0x6dfc36).
   *
   * The `operator delete` frontier is un-transcribed and this class doesn't
   * own the node allocations here (they're external nodes linked in by
   * whatever creates segments).  We raise so callers can't silently rely on
   * an unimplemented free-list walk.  @0x4ef780
   */
  destroy(): void {
    // @0x4ef78a head.next
    // @0x4ef78e-0x4ef791 empty-list short-circuit
    // @0x4ef79a-0x4ef7b7 head-splice (only if count != 0)
    // @0x4ef7c0-0x4ef7cf free-loop via operator delete — unported frontier
    // Frontier unresolved — raise. @0x4ef780
    throw new Error(
      "OZQuadraticPath::~OZQuadraticPath: requires operator delete(void*) " +
        "to free each node's data payload — not ported. @0x4ef780",
    );
  }

  /**
   * OZQuadraticPath::intersectsWithLine(
   *     PCVector2<float> const& queryStart, PCVector2<float> const& queryEnd)
   *                                                              — @0x4ef800
   *
   * Returns `true` if the query line segment [queryStart, queryEnd] crosses
   * any of the path's segments, EXCLUDING shared-endpoint touches (per the
   * endpoint-tolerance gate documented in the file header).
   *
   * The core solver is `PCLineQuadIntersection<float>` (in-binary @0x4ef8c8);
   * the endpoint gate compares each hit's parametric `t` and `u` against
   * `1e-5` and `1.0 - 1e-5` using a packed-f32 fabs mask and a fixed set of
   * float constants (see GATE CONSTANTS in the file header).
   *
   * The full control-flow structure is documented in the file header —
   * every branch in the asm maps to a clause in that annotation.  We do NOT
   * re-implement the solver here (it's frontier); we raise.
   */
  intersectsWithLine(_queryStart: PCVector2f, _queryEnd: PCVector2f): boolean {
    // Whole method depends on frontier PCLineQuadIntersection — raise.
    // @0x4ef800
    throw new Error(
      "OZQuadraticPath::intersectsWithLine: requires " +
        "PCLineQuadIntersection<float>(PCVector2f const&, PCVector2f const&, " +
        "PCVector2f const&, PCVector2f const&, PCVector2f const&, " +
        "float (*)[2], float (*)[2]) — not ported. @0x4ef800",
    );
  }

  /**
   * OZQuadraticPath::intersectsWithQuadratic(
   *     PCVector2<float> const& queryP0,
   *     PCVector2<float> const& queryP1,
   *     PCVector2<float> const& queryP2)
   *                                                              — @0x4efee0
   *
   * Returns `true` if the query quadratic bezier crosses any segment in the
   * path, with the same endpoint-tolerance gate as intersectsWithLine.
   *
   * Dispatches to two frontier solvers based on the current segment's kind:
   *   * seg.kind == 0 (line) → `PCLineQuadIntersection<float>` @0x4f0036
   *   * seg.kind != 0        → `PCQuadQuadIntersection` @0x4effe3
   *                            (double-precision; the ps→pd conversion is
   *                            done via `cvtps2pd` from the f32 query pts
   *                            and the f32 seg data before the call).
   *
   * Both solvers are frontier; the whole method raises.
   */
  intersectsWithQuadratic(
    _queryP0: PCVector2f,
    _queryP1: PCVector2f,
    _queryP2: PCVector2f,
  ): boolean {
    // Whole method depends on PCLineQuadIntersection + PCQuadQuadIntersection —
    // both frontier — raise. @0x4efee0
    throw new Error(
      "OZQuadraticPath::intersectsWithQuadratic: requires " +
        "PCLineQuadIntersection<float> + PCQuadQuadIntersection(PCVector2d) — " +
        "neither ported. @0x4efee0",
    );
  }
}
