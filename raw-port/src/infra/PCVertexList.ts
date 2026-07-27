// raw-port: PCVertexList — ProCore framework (infra layer)
//
// PCVertexList's public surface is JUST two ctor entry points:
//   0x0009ebfe  PCVertexList(std::vector<PCVector2<double>>&)  (C1: trampoline)
//   0x0009ea14  PCVertexList(std::vector<PCVector2<double>>&)  (C2: base ctor, real body)
//
// C1 @0x9ebfe is a bare `pushq %rbp; mov %rsp,%rbp; pop %rbp; jmp C2`
// tail-call trampoline into C2, so the entire behavior lives in C2.
//
// FUNCTION OF THE CLASS
// ---------------------
// PCVertexList wraps a std::vector<PCEdgeVertex>. Given a closed polygon
// as N points (a std::vector<PCVector2<double>>), it emits 2*N
// PCEdgeVertex entries — two per polygon edge (i, i+1 mod N) — one from
// each endpoint's perspective — then sorts them lexicographically by the
// endpoint's (x,y). This is the classic sweep-line preprocessing input:
// every edge appears twice, keyed by both endpoints, ready to be scanned
// left-to-right (increasing x) by a sweepline.
//
// The `flag` byte on each PCEdgeVertex marks whether THIS endpoint is
// the lexicographically-greater ("upper") end of its edge. Comparison is
// PC_lexless: a < b iff  a.x < b.x  OR  (a.x == b.x AND a.y < b.y).
//
// The companion class PCSweepline immediately follows PCVertexList in
// the binary (its ctor sits right after this one at __ZN11PCSweeplineC2…),
// which confirms the sweep-line role.
//
// LAYOUTS (recovered from asm)
// ----------------------------
// PCVector2<double>  = 16 bytes  {x: double @+0x00, y: double @+0x08}
//   (matches every asm site; also documented in PCCurveFit.ts.)
//
// PCEdgeVertex       = 48 bytes  (imulq $0xAA...B & sarq $4 in the C2
//                                 epilogue implies "divide by 24" on a
//                                 shifted-by-4 count → element stride = 48)
//   +0x00 index   uint64   loop-index i in the source polygon vector
//   +0x08 flag    uint64   1 iff `curr` is the lex-greater endpoint of the edge, else 0
//   +0x10 curr    PCVec2   this vertex's endpoint of the edge
//   +0x20 next    PCVec2   the OTHER endpoint of the same edge
//   (Field names inferred from compareVertex which sorts by +0x10 (.x) and
//    +0x18 (.y) — i.e. the `curr` field's x/y — see below.)
//
// PCVertexList (this) = std::vector<PCEdgeVertex> — 24 bytes:
//   +0x00 begin ptr
//   +0x08 end   ptr
//   +0x10 cap   ptr
//   Confirmed by the ctor prologue @0x9ea25..0x9ea2d which zero-inits
//   all three pointer slots. No additional non-vector member fields are
//   observable in the two-method surface.
//
// FRONTIER FUNCTIONS
// ------------------
// Called by C2 but NOT ported here (this file only decodes the ctor);
// each is a documented FCP symbol we mirror in behavior:
//
//   compareVertex(PCEdgeVertex, PCEdgeVertex)                       @0x9e897
//     Sole use: the sort key. Reads only +0x10 (.x) and +0x18 (.y),
//     i.e. `curr.x` and `curr.y`. Returns (a.curr < b.curr) lex.
//     We inline it below as `_compareVertex` since it's a pure
//     three-line comparator; every branch is cited to its @addr.
//
//   std::vector<PCEdgeVertex>::push_back                            @stub in ProCore
//     Realized in JS by an ordinary Array.push({...}).
//
//   std::__introsort<..., bool(*&)(PCEdgeVertex,PCEdgeVertex),
//                    PCEdgeVertex*, false>                          @stub in libc++
//     We use Array.prototype.sort with the same comparator. std::sort
//     is not strictly required to be stable; nor is Array.sort in any
//     concrete way that matters here — the input contains no duplicate
//     curr entries in a valid simple polygon.

// ── PCVector2<double> — 16 bytes {x,y} ──
// One-per-file convention: we do NOT export this alias (PCCurveFit.ts
// already carries an internal PCVec2 with the same shape); the parity
// harness reaches into PCVertexList's public API only.
interface PCVec2 { x: number; y: number }

/**
 * PCEdgeVertex — 48-byte record; two of these are emitted per edge of
 * the source polygon.
 *
 *   +0x00 index — the edge index in the source vector (i)
 *   +0x08 flag  — 1 iff `curr` is the lex-greater endpoint of the edge
 *   +0x10 curr  — this vertex's endpoint of the edge  (PCVector2<double>)
 *   +0x20 next  — the OTHER endpoint of the same edge (PCVector2<double>)
 */
export interface PCEdgeVertex {
  index: number;   // uint64 in C++, safe int in JS for polygon sizes
  flag: number;    // 0 or 1
  curr: PCVec2;
  next: PCVec2;
}

/**
 * compareVertex(a, b)  @0x0009e897  — the sort key used by C2.
 * Reads a.curr / b.curr only (offsets +0x10, +0x18 of PCEdgeVertex).
 *
 *   @0x9e89b  movsd 0x10(%rdi), %xmm0        ; a.curr.x
 *   @0x9e8a0  movsd 0x10(%rsi), %xmm1        ; b.curr.x
 *   @0x9e8a5  ucomisd %xmm1, %xmm0           ; flags ← a.x - b.x
 *   @0x9e8a9  jbe 0x9e8af                    ; if a.x <= b.x
 *   @0x9e8ab  xorl %eax,%eax; jmp .end       ; a.x > b.x → return 0
 *   @0x9e8af  movb $1, %al                   ; provisional 1
 *   @0x9e8b1  ucomisd %xmm0, %xmm1           ; flags ← b.x - a.x
 *   @0x9e8b5  ja .end                        ; b.x > a.x (a.x < b.x) → return 1
 *   @0x9e8b7  movsd 0x18(%rdi), %xmm0        ; a.curr.y
 *   @0x9e8bc  movsd 0x18(%rsi), %xmm1        ; b.curr.y
 *   @0x9e8c1  ucomisd %xmm1, %xmm0
 *   @0x9e8c5  ja 0x9e8ab                     ; a.y > b.y → return 0
 *   @0x9e8c7  ucomisd %xmm0, %xmm1
 *   @0x9e8cb  seta %al                       ; al = (b.y > a.y) = (a.y < b.y)
 *   @0x9e8ce  ret
 */
function _compareVertex(a: PCEdgeVertex, b: PCEdgeVertex): boolean {
  // @0x9e8a5..9e8a9 — a.x > b.x → 0
  if (a.curr.x > b.curr.x) return false;
  // @0x9e8b1..9e8b5 — b.x > a.x → 1
  if (b.curr.x > a.curr.x) return true;
  // Ties: check y (same shape).
  if (a.curr.y > b.curr.y) return false;      // @0x9e8c1..9e8c5
  return b.curr.y > a.curr.y;                  // @0x9e8c7..9e8cb
}

/**
 * PCVertexList  @0x0009ea14  (C2 base ctor; C1 @0x9ebfe tail-jumps here)
 *
 * Faithful control-flow mirror of the ProCore asm. Every field/write is
 * cited to its @0xADDR. The ctor is written as a factory function on
 * the class since the whole observable behavior IS the ctor.
 *
 * @param points  the source polygon, taken by REFERENCE in C++ but not
 *                mutated; we take it by value here.
 */
export class PCVertexList {
  /**
   * Sorted output — 2*N entries, one per (edge, endpoint) pair.
   *
   *   @0x9ea25..0x9ea2d  vector begin/end/cap zero-init on `this`
   *   @0x9eb44..0x9eb8a  final introsort using compareVertex as the key
   */
  readonly edges: PCEdgeVertex[];

  constructor(points: ReadonlyArray<PCVec2>) {
    // @0x9ea25..0x9ea2d — zero-init std::vector<PCEdgeVertex>.
    const out: PCEdgeVertex[] = [];

    // @0x9ea35..0x9ea43 — n = (end-begin)/16 = points.length. If empty,
    // skip the whole loop and go to the sort-tail (which also short-
    // circuits on empty).
    const n = points.length;
    if (n === 0) {
      // @0x9ea43  je 0x9eb8f  — jump to epilogue.
      this.edges = out;
      return;
    }

    // @0x9ea50..0x9ea63 — precompute (n-1) as the wrap-check pivot; the
    // asm keeps it in -0x38(%rbp) and reuses it every iteration.
    const nMinus1 = n - 1;

    // @0x9ea67..0x9eb3e — the main loop: for i in [0..n), emit two
    // PCEdgeVertex entries per edge (i, wrap(i+1)).
    for (let i = 0; i < n; i++) {
      // @0x9ea90..0x9ea9c — curr = points[i]. r14 tracks byte offset;
      // curr is loaded via a movups from the input's data() + i*16.
      const curr = points[i];

      // @0x9eaa0..0x9eab4 — nextIdx = (i == n-1) ? 0 : i+1  (the wrap).
      //   incq %r13; cmpq %rax,-0x38(%rbp); cmovneq %r13,%rdx; shlq $4,%rdx
      //   where %rax is the pre-increment i and -0x38 is n-1.
      // Equivalent readable form:
      const nextIdx = (i === nMinus1) ? 0 : i + 1;
      // @0x9eab4..0x9eab8 — next = points[nextIdx].
      const next = points[nextIdx];

      // @0x9ead8..0x9eb0e — decide which endpoint is lexicographically
      // greater. `flagCurr` = 1 iff curr > next lex; `flagNext` is the
      // opposite (except on exact ties where both are 0).
      //   ucomisd curr.x vs next.x:
      //     if curr.x > next.x        → flagCurr=1, flagNext=0
      //     elif next.x > curr.x      → flagCurr=0, flagNext=1
      //     else /* equal */:
      //        ucomisd next.y vs curr.y:
      //          if next.y <= curr.y (i.e. curr.y >= next.y):
      //             — but strict? asm jbe → also enters flagCurr=1 branch
      //          if next.y > curr.y  → flagCurr=0, flagNext=1
      // Faithful reproduction:
      let flagCurr = 0;
      let flagNext = 0;
      if (curr.x > next.x) {
        // @0x9eaeb  flagCurr=1, flagNext=0
        flagCurr = 1;
        flagNext = 0;
      } else {
        // @0x9eaf4  flagNext = 1  (provisional)
        flagNext = 1;
        if (next.x > curr.x) {
          // @0x9eafd  ja .end  → flagCurr=0, flagNext=1
          flagCurr = 0;
        } else {
          // curr.x == next.x — tie-break on y.
          // @0x9eaff..0x9eb07 — compare next.y vs curr.y.
          if (next.y > curr.y) {
            // @0x9eb0c  jbe back-edge NOT taken → fall to 0x9eb0e:
            //           flagCurr=0, flagNext=1
            flagCurr = 0;
          } else {
            // @0x9eb0c  jbe back-edge TAKEN → go to 0x9eaeb path:
            //           flagCurr=1, flagNext=0
            flagCurr = 1;
            flagNext = 0;
          }
        }
      }

      // @0x9ea8c/0x9ea90..0x9eb22 — first push_back: {index=i, flag=flagCurr,
      // curr=curr, next=next}.
      //   -0x70(%rbp)=i, -0x68=flagCurr, r15=-0x60=curr, r15+0x10=next.
      out.push({
        index: i,
        flag: flagCurr,
        curr: { x: curr.x, y: curr.y },
        next: { x: next.x, y: next.y },
      });

      // @0x9eabd..0x9eb31 — second push_back: {index=i (pre-inc),
      // flag=flagNext, curr=next, next=curr}.
      //   -0xa0(%rbp)=i, -0x98=flagNext, r12=-0x90=next, r12+0x10=curr.
      out.push({
        index: i,
        flag: flagNext,
        curr: { x: next.x, y: next.y },
        next: { x: curr.x, y: curr.y },
      });

      // @0x9eb36..0x9eb3e — loop increment: r14 += 0x10 (curr byte
      // offset); r13 already incremented at 0x9eaa0.
    }

    // @0x9eb44..0x9eb8a — sort in place using compareVertex.
    //   The asm sets up an introsort with a computed depth bound
    //   (2 * (63 - bsr(size/48)) = 2*log2(size)) but the ordering is
    //   defined solely by compareVertex; the depth bound is a libc++
    //   implementation detail that only affects when the sort falls back
    //   to heapsort. The observable output is: sorted by compareVertex.
    // JS sort takes an int comparator; wrap _compareVertex faithfully.
    out.sort((a, b) => {
      if (_compareVertex(a, b)) return -1;
      if (_compareVertex(b, a)) return 1;
      return 0;
    });

    // @0x9eb8f..0x9eb9d — normal-return epilogue.
    this.edges = out;
  }
}
