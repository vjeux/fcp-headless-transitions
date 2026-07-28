// raw-port/src/channels/PTTriangle.ts
//
// FCP `PTTriangle` — Ozone 2D triangle primitive (float vertices,
// double-precision containment/intersection math). Owns three
// PCVector2<float> vertices, a `Type` enum, an integer id, and a bank
// of ~14 cached doubles + 3 "1.0" scalars (memoized rotation/matrix
// state — populated lazily by containsPoint/intersects).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice; file
//             offset 0x4000; VAs unadjusted from `otool -tV`).
//
// Disassembly saved at:
//   raw-port/re/disasm/PTTriangle.PTTriangle.s        (C1 @0x2ffb20)
//   raw-port/re/disasm/PTTriangle.operator=.s         (@0x2ffbb0)
//   raw-port/re/disasm/PTTriangle.operator==.s        (@0x2ffcb0)
//   raw-port/re/disasm/PTTriangle.area.s              (@0x3014c0)
//   raw-port/re/disasm/PTTriangle.containsPoint.s     (@0x300da0)
//   raw-port/re/disasm/PTTriangle.intersects.s        (@0x301050)
//
// Ledger addresses (Ozone.ledger.json):
//   0x2ffa90  PTTriangle::PTTriangle(v0, v1, v2, Type)   [C2 — not fetched
//              (C1 @0x2ffb20 is not a tail-jmp to C2; both have full bodies
//              per Ozone ledger. C1 body dumped here; C2 identical struct
//              init assumed but NOT confirmed — flagged in a throw-stub).]
//   0x2ffb20  PTTriangle::PTTriangle(v0, v1, v2, Type)   [C1 — decoded]
//   0x2ffbb0  operator=(PTTriangle const&)               [decoded]
//   0x2ffcb0  operator==(PTTriangle const&) const        [148-line; DEFERRED]
//   0x2fff10  edgeAdjacent(...) const                    [DEFERRED]
//   0x300550  vertexAdjacent(...) const                  [DEFERRED]
//   0x300960  edgeContainedByLine(...) const             [DEFERRED]
//   0x300b90  lineAdjacent(...) const                    [DEFERRED]
//   0x300da0  containsPoint(PCVector2<double> const&, double) const  [DEFERRED]
//   0x300fe0  containsTriangle(PTTriangle const&, double) const     [DEFERRED]
//   0x301050  intersects(PTTriangle const&) const        [DEFERRED — 297 line]
//   0x3014c0  area() const                               [decoded]
//
// ── STRUCT LAYOUT (recovered from C1 @0x2ffb20) ─────────────────────────────
//   PTTriangle {
//     +0x000  v0            : PCVector2<float>   (2×f32; C1 @0x2ffb8f
//                                                 `movq (%rsi),%rax; movq %rax,(%rdi)`)
//     +0x008  v1            : PCVector2<float>   (@0x2ffb95 movq from rdx)
//     +0x010  v2            : PCVector2<float>   (@0x2ffb9b movq from rcx)
//     +0x018  type          : u32 = Type         (@0x2ffba3 movl %r8d,0x18)
//     +0x01c  cachedCount   : u32 = 3            (@0x2ffb32 movl $0x3,0x1c)
//     +0x020  d1            : double = 1.0       (@0x2ffb52 movq rax,0x20)
//     +0x028  d2            : double = 0.0       (@0x2ffb56 movups xmm0=0,0x28)
//     +0x030  d3            : double = 0.0
//     +0x038  d4            : double = 0.0       (@0x2ffb5a movups xmm0=0,0x38)
//     +0x040  d5            : double = 0.0
//     +0x048  d6            : double = 1.0       (@0x2ffb4e movq rax,0x48)
//     +0x050  d7            : double = 0.0       (@0x2ffb5e movups xmm0=0,0x50)
//     +0x058  d8            : double = 0.0
//     +0x060  d9            : double = 0.0       (@0x2ffb62 movups xmm0=0,0x60)
//     +0x068  d10           : double = 0.0
//     +0x070  d11           : double = 1.0       (@0x2ffb4a movq rax,0x70)
//     +0x078  d12           : double = 0.0       (@0x2ffb66 movups xmm0=0,0x78)
//     +0x080  d13           : double = 0.0
//     +0x088  d14           : double = 0.0       (@0x2ffb6a movups xmm0=0,0x88)
//     +0x090  d15           : double = 0.0
//     +0x098  d16           : double = 1.0       (@0x2ffb43 movq rax,0x98)
//     +0x0a0  id            : u32                (@0x2ffb7f — from static idCounter++)
//     +0x0a4  flag          : u32 = 0            (@0x2ffb85 movl $0,0xa4)
//   }
//   sizeof(PTTriangle) = 0xa8 = 168 bytes.
//
//   The +0x20..+0x9f block is a 4×5-double region with an identity-pattern
//   (1.0 on diagonals at +0x20/+0x48/+0x70/+0x98 — offsets 0x28 apart, i.e.
//   40 bytes = 5 doubles per "row"). Best fit: a 4-row × 5-double memoized
//   edge/rotation cache populated on-demand by containsPoint/intersects.
//   Exact semantics not decoded here — kept as opaque doubles.
//
// ── CONSTANTS (resolved via resolve.py Ozone const) ───────────────────────
//   Ozone rip@0x707bc0 : u64 = 0x7fffffff7fffffff (2×float abs-value bitmask)
//                        (used by area @rip+0x4066d2, operator== @rip+0x407ef7,
//                         and containsPoint's `andps` guards)
//   Ozone rip@0x706ea8 : double = 0.5 (used by area @rip+0x4059ab: mulsd × 0.5)
//   Ozone rip@0x708540 : u64 = 0x3727c5ac3727c5ac (2×float 1e-5 tolerance)
//                        (used by operator== `cmpltps` at all six branch points)
//
// ── STATIC ────────────────────────────────────────────────────────────────
//   __ZN10PTTriangle9idCounterE   Ozone symbol = "PTTriangle::idCounter"
//                                 u32 static, incremented atomically(?) in C1
//                                 @0x2ffb71..0x2ffb79. Modeled as `idCounter`
//                                 module-scoped variable below.

/**
 * `PTTriangle::Type` enum — value passed to the ctor's 4th arg (r8d, u32)
 * and stored at +0x18. The 3 enum labels shipped in Ozone are not
 * exported symbols; we know the field is `u32` and we know one concrete
 * ctor site passes literals in {0,1,2}. Names not yet decoded.
 */
export type PTTriangleType = number;

/**
 * `PCVector2<float>` — Ozone's 2D float vector template. Not yet
 * landed as its own class; declared here as a structural interface so
 * PTTriangle can accept and return it faithfully. The ctor @0x2ffb8f
 * uses `movq (%rsi),%rax; movq %rax,(%rdi)` — a single 8-byte load
 * (i.e. x@+0, y@+4, 2×f32 = 8 bytes), so the on-wire layout is
 *   { x: f32 @+0, y: f32 @+4 }.
 */
export interface PCVector2f {
  x: number;
  y: number;
}

/**
 * `PCVector2<double>` — analogous 2D double vector used by
 * `containsPoint(PCVector2<double> const&, double)` (containsPoint reads
 * via `movupd (%rsi),%xmm8` — 16-byte double pair).
 */
export interface PCVector2d {
  x: number;
  y: number;
}

/**
 * Static idCounter symbol (`__ZN10PTTriangle9idCounterE`). Read+incremented
 * by the ctor @0x2ffb71/@0x2ffb79. The disasm uses non-atomic increment
 * (`movl / incl / movl`), so this is a plain u32 — not `std::atomic`.
 */
export const _PTTriangle_idCounterHolder = { value: 0 };

/**
 * `PTTriangle` — three-vertex 2D triangle with cached edge/matrix state.
 * See file header for full struct layout and provenance.
 */
export class PTTriangle {
  // +0x00..+0x08  v0.{x,y}  (2×f32)
  v0: PCVector2f;
  // +0x08..+0x10  v1.{x,y}
  v1: PCVector2f;
  // +0x10..+0x18  v2.{x,y}
  v2: PCVector2f;
  // +0x18  type (u32)
  type: PTTriangleType;
  // +0x1c  cachedCount (u32 = 3)
  cachedCount: number;
  // +0x20..+0x9f  16 doubles (memoized edge/matrix cache; 1.0s at 0x20/0x48/0x70/0x98)
  cache: Float64Array;
  // +0xa0  id (u32, from idCounter++)
  id: number;
  // +0xa4  flag (u32 = 0)
  flag: number;

  /**
   * `PTTriangle::PTTriangle(PCVector2<float> const& v0, PCVector2<float> const& v1,
   *                          PCVector2<float> const& v2, PTTriangle::Type type)`
   * @Ozone 0x2ffb20 (C1). Line-for-line decoded body:
   *   0x2ffb24  xorps xmm0,xmm0
   *   0x2ffb27  movups xmm0,(%rdi)                ; +0x00..+0x10 = 0 (v0,v1 slots)
   *   0x2ffb2a  movq $0,0x10(%rdi)                ; +0x10..+0x18 = 0 (v2 slot)
   *   0x2ffb32  movl $0x3,0x1c(%rdi)              ; +0x1c = 3 (cachedCount)
   *   0x2ffb39  movabsq $0x3ff0000000000000,%rax   ; = 1.0 double bit pattern
   *   0x2ffb43  movq %rax,0x98(%rdi)              ; +0x98 = 1.0
   *   0x2ffb4a  movq %rax,0x70(%rdi)              ; +0x70 = 1.0
   *   0x2ffb4e  movq %rax,0x48(%rdi)              ; +0x48 = 1.0
   *   0x2ffb52  movq %rax,0x20(%rdi)              ; +0x20 = 1.0
   *   0x2ffb56/5a/5e/62/66/6a  movups xmm0=0     ; +0x28,+0x38,+0x50,+0x60,+0x78,+0x88 = 0
   *   0x2ffb71  movl PTTriangle::idCounter(rip),%eax
   *   0x2ffb77  incl %eax
   *   0x2ffb79  movl %eax,PTTriangle::idCounter(rip)
   *   0x2ffb7f  movl %eax,0xa0(%rdi)              ; +0xa0 = id
   *   0x2ffb85  movl $0,0xa4(%rdi)                ; +0xa4 = 0
   *   0x2ffb8f  movq (%rsi),%rax; movq %rax,(%rdi)      ; v0 = *arg1
   *   0x2ffb95  movq (%rdx),%rax; movq %rax,0x8(%rdi)   ; v1 = *arg2
   *   0x2ffb9b  movq (%rcx),%rax; movq %rax,0x10(%rdi)  ; v2 = *arg3
   *   0x2ffba3  movl %r8d,0x18(%rdi)                    ; type = arg4
   */
  constructor(v0: PCVector2f, v1: PCVector2f, v2: PCVector2f, type: PTTriangleType) {
    // Initial zero-fill of +0x00..+0x18 (superseded by explicit copies below).
    // Then id/cache init, then vertex copies. We keep the FINAL observable
    // state; the transient zeros are not observable.
    this.v0 = { x: v0.x, y: v0.y };
    this.v1 = { x: v1.x, y: v1.y };
    this.v2 = { x: v2.x, y: v2.y };
    this.type = type >>> 0;
    this.cachedCount = 3;
    // +0x20..+0x9f: 16 doubles, 1.0 at [0], [5], [10], [15] (i.e. every 0x28 = 5 doubles).
    this.cache = new Float64Array(16);
    this.cache[0] = 1.0; // +0x20
    this.cache[5] = 1.0; // +0x48
    this.cache[10] = 1.0; // +0x70
    this.cache[15] = 1.0; // +0x98
    // idCounter++ (non-atomic u32 pre-increment then post-read of new value).
    _PTTriangle_idCounterHolder.value = (_PTTriangle_idCounterHolder.value + 1) | 0;
    this.id = _PTTriangle_idCounterHolder.value;
    this.flag = 0;
  }

  /**
   * `PTTriangle::operator=(PTTriangle const& rhs)` @Ozone 0x2ffbb0.
   *
   * Copies the fixed header (+0x00..+0x1f = 32 bytes: 3 vertices + type +
   * cachedCount, via 4 qword moves @0x2ffbb7..@0x2ffbcd), then guards on
   * `rhs == this` (@0x2ffbd5 `cmpq %rdi,%rsi; je 0x2ffc96`): if aliased
   * the 16-double cache and id are NOT re-copied — the pre-existing state
   * is preserved. Otherwise 16 doubles at +0x20..+0x9f are copied one at
   * a time (@0x2ffbde..@0x2ffc8e), then id/flag @+0xa0..+0xa8 is copied
   * (@0x2ffc96 `movq 0xa0(%rsi),%rcx; movq %rcx,0xa0(%rax)` — 8 bytes
   * covering both id (u32@+0xa0) and flag (u32@+0xa4)).
   *
   * Returns `*this` (i.e. `%rax` = original `%rdi`, set @0x2ffbb4).
   */
  assign(rhs: PTTriangle): PTTriangle {
    // @0x2ffbb7..@0x2ffbcd: header block copy.
    this.v0 = { x: rhs.v0.x, y: rhs.v0.y };
    this.v1 = { x: rhs.v1.x, y: rhs.v1.y };
    this.v2 = { x: rhs.v2.x, y: rhs.v2.y };
    this.type = rhs.type;
    this.cachedCount = rhs.cachedCount;
    // @0x2ffbd5: self-assign guard — skip cache/id copy if aliased.
    if (rhs === this) {
      return this;
    }
    // @0x2ffbde..@0x2ffc8e: 16 double moves.
    for (let i = 0; i < 16; i++) {
      this.cache[i] = rhs.cache[i];
    }
    // @0x2ffc96: id+flag qword copy.
    this.id = rhs.id;
    this.flag = rhs.flag;
    return this;
  }

  /**
   * `PTTriangle::area() const` @Ozone 0x3014c0.
   *
   * Line-for-line decoded body:
   *   0x3014c4  movsd (%rdi),%xmm0        ; xmm0.lo = *(f32,f32)@+0 (v0.x,v0.y as packed pair)
   *   0x3014c8  movsd 0x8(%rdi),%xmm1     ; xmm1.lo = v1
   *   0x3014cd  movsd 0x10(%rdi),%xmm2    ; xmm2.lo = v2
   *   0x3014d2  subps %xmm0,%xmm1         ; xmm1 = v1 - v0  (packed f32)
   *   0x3014d5  subps %xmm0,%xmm2         ; xmm2 = v2 - v0
   *   0x3014d8  shufps $0xe1,%xmm2,%xmm2   ; swap x<->y of xmm2 (imm=11.10.00.01 = [1,0,2,3])
   *   0x3014dc  mulps %xmm1,%xmm2          ; xmm2 = ((v2.y-v0.y)*(v1.x-v0.x), (v2.x-v0.x)*(v1.y-v0.y), _, _)
   *   0x3014df  movshdup %xmm2,%xmm0       ; xmm0.lo = xmm2.hi-lane-of-lower-pair (lane 1)
   *   0x3014e3  subss %xmm0,%xmm2          ; xmm2.lo = xmm2.lo - xmm2.lane1
   *                                            = (v2.y-v0.y)*(v1.x-v0.x) - (v2.x-v0.x)*(v1.y-v0.y)
   *                                              (the 2D cross-product z-component, with a sign flip
   *                                               from the shuffle: absolute value taken next)
   *   0x3014e7  andps rip+0x4066d2,%xmm2   ; abs (packed f32 |·| mask @Ozone 0x707bc0)
   *   0x3014ee  xorps %xmm0,%xmm0
   *   0x3014f1  cvtss2sd %xmm2,%xmm0       ; widen to double
   *   0x3014f5  mulsd rip+0x4059ab,%xmm0   ; * 0.5 (@Ozone rip@0x706ea8 = 0.5)
   *   0x3014fd  ret                        ; xmm0 = result (double)
   *
   * i.e. `area = |cross(v1-v0, v2-v0)| * 0.5`, with the cross product
   * computed in fp32 and the final scalar widened to double.
   *
   * The `subps` and `mulps` operate on the LOW 64 bits (2×f32 lanes)
   * because the upper 64 bits of the initial `movsd` loads are zero.
   * Everything else in the vector is unused.
   */
  area(): number {
    // Load vertices as 2×f32 pairs. JS numbers are IEEE double; we
    // fp32-narrow at each fp32 op via Math.fround to match the packed
    // fp32 SIMD semantics.
    const v0x = Math.fround(this.v0.x);
    const v0y = Math.fround(this.v0.y);
    const v1x = Math.fround(this.v1.x);
    const v1y = Math.fround(this.v1.y);
    const v2x = Math.fround(this.v2.x);
    const v2y = Math.fround(this.v2.y);
    // subps %xmm0,%xmm1  (v1-v0 as packed fp32 pair)
    const d1x = Math.fround(v1x - v0x);
    const d1y = Math.fround(v1y - v0y);
    // subps %xmm0,%xmm2  (v2-v0 as packed fp32 pair)
    const d2x = Math.fround(v2x - v0x);
    const d2y = Math.fround(v2y - v0y);
    // shufps $0xe1 swaps the low 2 lanes of xmm2 (i.e. reads d2 as [d2y, d2x])
    // mulps xmm1 -> pair = (d2y * d1x, d2x * d1y)
    const prod0 = Math.fround(d2y * d1x);
    const prod1 = Math.fround(d2x * d1y);
    // movshdup: xmm0.lo = xmm2.lane1 (i.e. prod1). subss: xmm2.lo -= xmm0.lo.
    const cross_z = Math.fround(prod0 - prod1);
    // andps abs-mask @Ozone 0x707bc0 (packed 0x7fffffff): absolute value.
    const abs_cross = Math.fround(Math.abs(cross_z));
    // cvtss2sd: widen fp32 -> fp64.
    // mulsd rip@0x706ea8 = 0.5.
    return abs_cross * 0.5;
  }

  /**
   * `PTTriangle::operator==(PTTriangle const& rhs) const` @Ozone 0x2ffcb0.
   *
   * 148-line body implementing an order-insensitive vertex-triple
   * equality: first tries the three-vertex-pairs-in-order comparison
   * (v0==r0 && v1==r1 && v2==r2), and on any mismatch falls through to
   * try alternative vertex orderings. Each pairwise comparison is a
   * packed-fp32 `|a-b| < 1e-5f` test using the abs-mask @Ozone 0x707bc0
   * and the tolerance @Ozone 0x708540 (= 2× fp32 1e-5 packed).
   *
   * The branch topology (which orderings are tried, in what order) is
   * dense and not yet decoded — 6+ compare blocks with cross-jumps.
   * Deferred to a follow-up worker to avoid guessing the branch DAG.
   */
  eq(_rhs: PTTriangle): boolean {
    throw new Error(
      "PTTriangle::operator== @Ozone 0x2ffcb0 not yet transcribed — 148-line order-insensitive " +
        "vertex-triple equality with 1e-5f fp32 tolerance (@Ozone rip 0x708540) and abs-mask " +
        "(@Ozone rip 0x707bc0). Multi-way branch DAG not decoded.",
    );
  }

  /**
   * `PTTriangle::containsPoint(PCVector2<double> const& p, double eps) const`
   * @Ozone 0x300da0. 142-line body.
   *
   * Structure recovered from the head @0x300da4..0x300e4e:
   *   1. Load v0,v1,v2 as packed fp32 pairs.
   *   2. Compute the "signed area × 2" via the same shufps/mulps/subss
   *      pattern as `area()` above (@0x300dbe..0x300dd0).
   *   3. Absolute-value @rip+0x406de4 (= Ozone 0x707bc0 abs-mask), widen
   *      to double, compare against a threshold @rip+0x406d70 (not yet
   *      resolved). Early-out at 0x300e4e if the triangle is "too small"
   *      (degenerate area guard).
   *   4. Compute dot((v1-v0),(v2-v0)) — the two-edge dot product — and
   *      compare against 0 (looking for obtuse-angle degeneracy?).
   *   5. Compute |v2-v0|² (edge-length squared) and compare against
   *      the dot product (guard for near-collinearity).
   *   6. Then converts p (a PCVector2<double>) to fp32, subtracts v0,
   *      and does the barycentric sign checks against each edge to
   *      decide inside/outside.
   *
   * The full body has ~15 basic blocks and interleaved fp32/fp64
   * conversions. Deferring rather than shipping a partial transcription
   * (this method is called by user-facing hit-testing — silently wrong
   * output here would be a big functional regression).
   */
  containsPoint(_p: PCVector2d, _eps: number): boolean {
    throw new Error(
      "PTTriangle::containsPoint @Ozone 0x300da0 not yet transcribed — 142-line body: " +
        "degenerate-area guard + dot-product/edge-length guards + fp32 barycentric sign tests. " +
        "Depends on unresolved thresholds @Ozone rip 0x300dd5+0x406de4 (abs mask, resolves to " +
        "the 0x707bc0 packed-abs constant) and @rip 0x300de0+0x406d70 (small-area cutoff, not " +
        "yet decoded).",
    );
  }

  /**
   * `PTTriangle::containsTriangle(PTTriangle const& other, double eps) const`
   * @Ozone 0x300fe0.
   *
   * Not yet decoded — presumably `all 3 vertices of other are containsPoint(this,eps)`.
   */
  containsTriangle(_other: PTTriangle, _eps: number): boolean {
    throw new Error(
      "PTTriangle::containsTriangle @Ozone 0x300fe0 not yet transcribed.",
    );
  }

  /**
   * `PTTriangle::intersects(PTTriangle const& other) const` @Ozone 0x301050.
   * 297-line body — general two-triangle SAT / edge-crossing test. Not yet
   * decoded; deferred.
   */
  intersects(_other: PTTriangle): boolean {
    throw new Error(
      "PTTriangle::intersects @Ozone 0x301050 not yet transcribed — 297-line two-triangle intersection test.",
    );
  }

  /**
   * `PTTriangle::edgeAdjacent(PTTriangle const& other, int& outA0, int& outA1,
   *                            int& outB0, int& outB1, int& outC0, int& outC1) const`
   * @Ozone 0x2fff10.
   *
   * Reports which pair of edges (if any) coincides between `this` and `other`.
   * Six out-parameters — likely (this-edge-i0, this-edge-i1, other-edge-j0,
   * other-edge-j1) plus two more indices whose semantics require decoding
   * the body. Not yet transcribed.
   */
  edgeAdjacent(
    _other: PTTriangle,
    _out: {
      a0: number;
      a1: number;
      b0: number;
      b1: number;
      c0: number;
      c1: number;
    },
  ): boolean {
    throw new Error(
      "PTTriangle::edgeAdjacent @Ozone 0x2fff10 not yet transcribed.",
    );
  }

  /**
   * `PTTriangle::vertexAdjacent(PTTriangle const& other, int& outIdx) const`
   * @Ozone 0x300550. Not yet decoded.
   */
  vertexAdjacent(_other: PTTriangle, _out: { idx: number }): boolean {
    throw new Error(
      "PTTriangle::vertexAdjacent @Ozone 0x300550 not yet transcribed.",
    );
  }

  /**
   * `PTTriangle::edgeContainedByLine(PCVector2<float> const& p0,
   *                                    PCVector2<float> const& p1,
   *                                    int& out0, int& out1, int& out2) const`
   * @Ozone 0x300960. Not yet decoded.
   */
  edgeContainedByLine(
    _p0: PCVector2f,
    _p1: PCVector2f,
    _out: { a: number; b: number; c: number },
  ): boolean {
    throw new Error(
      "PTTriangle::edgeContainedByLine @Ozone 0x300960 not yet transcribed.",
    );
  }

  /**
   * `PTTriangle::lineAdjacent(PCVector2<float> const& p0,
   *                            PCVector2<float> const& p1,
   *                            int& out0, int& out1, int& out2) const`
   * @Ozone 0x300b90. Not yet decoded.
   */
  lineAdjacent(
    _p0: PCVector2f,
    _p1: PCVector2f,
    _out: { a: number; b: number; c: number },
  ): boolean {
    throw new Error(
      "PTTriangle::lineAdjacent @Ozone 0x300b90 not yet transcribed.",
    );
  }
}
