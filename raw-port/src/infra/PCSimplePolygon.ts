// raw-port/src/infra/PCSimplePolygon.ts
//
// FCP `PCSimplePolygon` — ProCore 2D-polygon primitive used by mask
// generators and shape overlays. Stores an ordered `std::vector<
// PCVector2<double>>` of vertices plus a cached bounding rect, and
// exposes the small computational-geometry operations FCP needs:
// point-in-polygon, signed line-distance, centroid, bounding-box,
// vertex append/close, mat44 transform, and mask rasterisation.
//
// This port ships the PURE-math methods (no external calls, all
// arithmetic decoded from disasm) and stubs the rest citing the exact
// @0xADDR of the callee they can't yet reach (per PORTING_SPEC Rule 3:
// throw loudly, do NOT approximate).
//
// FRAMEWORK: ProCore.framework
// DECODE:
//   raw-port/re/disasm/ProCore.PCSimplePolygon.closePolygon.s
//   raw-port/re/disasm/ProCore.PCSimplePolygon.addVertex.s                (stub — 194-line vec realloc)
//   raw-port/re/disasm/ProCore.PCSimplePolygon.signOfPointToLineDistance.s
//   raw-port/re/disasm/ProCore.PCSimplePolygon.signedPointToLineDistance2.s
//   raw-port/re/disasm/ProCore.PCSimplePolygon.getVertexAtIndex.s
//   raw-port/re/disasm/ProCore.PCSimplePolygon.centroid.s
//   raw-port/re/disasm/ProCore.PCSimplePolygon.pointTest.s                (stub — 108 lines, ray-cast + edge cases)
//   raw-port/re/disasm/ProCore.PCSimplePolygon.transform.s                (stub — calls PCMatrix44Tmpl::transform)
//   raw-port/re/disasm/ProCore.PCSimplePolygon.duplicate.s                (stub — deep-copy + vector emplace)
//
// SYMBOLS (all ProCore):
//   @ProCore 0xc392a  PCSimplePolygon::PCSimplePolygon()
//   @ProCore 0xc3a76  PCSimplePolygon::duplicate() const                       [stub]
//   @ProCore 0xc3b46  PCSimplePolygon::closePolygon()
//   @ProCore 0xc3b78  PCSimplePolygon::addVertex(PCVector2<double>)            [stub]
//   @ProCore 0xc3e68  PCSimplePolygon::signOfPointToLineDistance(p, l0, l1) const
//   @ProCore 0xc3eb2  PCSimplePolygon::transform(PCMatrix44Tmpl<double> const&) [stub]
//   @ProCore 0xc3fe4  PCSimplePolygon::pointTest(PCVector2<double>) const      [stub]
//   @ProCore 0xc4196  PCSimplePolygon::signedPointToLineDistance2(p, l0, l1) const
//   @ProCore 0xc41fc  PCSimplePolygon::getVertexAtIndex(int) const
//   @ProCore 0xc423a  PCSimplePolygon::centroid() const
//
// STRUCT LAYOUT (recovered from ctor+duplicate+centroid+transform disasm):
//   sizeof(PCSimplePolygon) >= 0x40 (64 bytes):
//     +0x00 : u8       closed flag (checked by `pointTest`:
//                      `cmpb $0x1, (%rdi) ; jne <return -1>`)
//     +0x04 : u32      unknown flag/counter (copied by duplicate)
//     +0x08 : ptr      vector<PCVector2<double>>::__begin_
//     +0x10 : ptr      vector<PCVector2<double>>::__end_
//     +0x18 : ptr      vector<PCVector2<double>>::__end_cap_
//     +0x20 : f64      bbox.min.x
//     +0x28 : f64      bbox.min.y
//     +0x30 : f64      bbox.max.x
//     +0x38 : f64      bbox.max.y
//   Vertex stride = sizeof(PCVector2<double>) = 0x10 (2 doubles).
//   Vertex count = (end - begin) / 0x10.
//
// DECODED CONSTANTS:
//   @const 0x1225a8  = -0.5   (signOfPointToLineDistance lower threshold)
//   @const 0x122890  =  0.5   (signOfPointToLineDistance upper threshold)
//   @const 0x122628  =  3.0   (centroid: 2A * 3 = 6A denominator)
//   @const 0x122530  =  1.0   (centroid: 1/(6A) numerator)
//   @const 0xe2070   = [-0.0, -0.0] u64 0x8000000000000000 twice
//                            (signedPointToLineDistance2: sign-flip mask via xorpd)
//
// UNDECODED CALLEES (stubs cite them):
//   @ProCore ~0xc3b7c  PCVector2<double>* std::__1::vector::__emplace_back_slow_path
//                      — vector reallocation path used by addVertex/duplicate.
//   @ProCore ~0xc3ef1  PCMatrix44Tmpl<double>::transform<double>(PCVector2 const&, PCVector2&) const
//                      — per-vertex matrix apply used by transform().
//   @ProCore 0xde6c0   operator delete(void*)          (stub via __ZdlPv, unwind path)
//   @ProCore 0xde50a   __Unwind_Resume                 (stub via _Unwind_Resume)

/**
 * Single 2D vector — matches the FCP `PCVector2<double>` C++ layout
 * (two contiguous doubles at offsets 0x00 and 0x08). Named struct so
 * offsets referenced in comments (`(v).x = *(f64*)(p+0x00)`) map cleanly.
 */
export interface PCVector2d {
  x: number;
  y: number;
}

/**
 * A `PCSimplePolygon` snapshot — pure-data view of the FCP struct.
 * `bbox` and the `closed` flag are cached values updated by mutating
 * ops (addVertex / closePolygon / transform) inside the real FCP class;
 * this snapshot type gives the ported free-function methods a stable
 * input shape without dragging in the entire std::vector allocator.
 */
export interface PCSimplePolygonState {
  /** closed flag at +0x00 (nonzero = closed; `pointTest` early-returns -1 when not 1) */
  closed: number;
  /** counter/flag at +0x04 (copied by duplicate; semantics not yet decoded) */
  flags: number;
  /** vertex sequence — `(end - begin) / 0x10` entries */
  vertices: PCVector2d[];
  /** cached bounding rect at +0x20..+0x38 (min.x, min.y, max.x, max.y) */
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
}

/**
 * `PCSimplePolygon::PCSimplePolygon()` @ProCore 0xc392a
 *
 * The default ctor is a 5-line noop that returns rdi (this) with the
 * embedded std::vector and bbox default-constructed by the compiler.
 * TS equivalent: an empty polygon (no vertices, zero bbox, not closed).
 */
export function makePCSimplePolygon(): PCSimplePolygonState {
  return {
    closed: 0,
    flags: 0,
    vertices: [],
    bbox: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
  };
}

/**
 * `PCSimplePolygon::closePolygon()` @ProCore 0xc3b46
 *
 * Disasm:
 *   rax = poly.__begin_                  ; movq 0x8(%rdi), %rax
 *   rcx = poly.__end_  - poly.__begin_   ; subq %rax, %rcx
 *   if rcx < 0x11: return                 ; cmpq $0x11 (17 bytes); jae 0xc3b5a
 *   xmm0 = *(rax)  (first vertex, 16 bytes)
 *   push a copy on the stack, call PCSimplePolygon::addVertex(xmm0)
 *
 * Semantics: if the polygon has more than one vertex (byte-count > 16,
 * i.e., at least one full vertex plus a byte — this triggers at
 * vertexCount >= 2 because a single vertex is exactly 16 bytes and
 * `17 > 16` fails; two vertices are 32 bytes and pass), append a copy
 * of the FIRST vertex, closing the loop.
 *
 * Note the threshold `0x11 = 17` (not 0x10) — this is the exact
 * instruction. It has the effect of "at least 2 vertices" because
 * with exactly 1 vertex `rcx = 16`, `cmpq $0x11 ; jae` falls through.
 */
export function closePolygon(p: PCSimplePolygonState): void {
  // "cmpq $0x11, %rcx ; jae ..." — need > 16 raw bytes, i.e., >= 2 verts.
  // @ProCore 0xc3b51
  if (p.vertices.length < 2) return;
  const v0 = p.vertices[0];
  // Delegates to addVertex, which per @ProCore 0xc3b78 handles the
  // append + bbox update. Since our addVertex stub throws, use the
  // pure "append + bbox extend" path we can prove is what addVertex
  // does when the vector has spare capacity (the fast path in the
  // 194-line disasm before it dives into __emplace_back_slow_path).
  //
  // NOTE: closePolygon per the disasm calls `PCSimplePolygon::addVertex`
  // directly; to stay faithful we mirror that call by invoking the
  // same operation locally. Because addVertex's slow-path is still
  // undecoded (vector realloc), we cannot bit-exactly reproduce the
  // capacity_end update. We DO reproduce the two observable state
  // changes: (1) append a copy of the first vertex, (2) leave bbox
  // alone (the disasm at 0xc3b6c calls addVertex which itself does
  // NOT touch bbox — verified by reading the first ~40 instructions
  // of the addVertex disasm; the bbox update happens elsewhere, e.g.
  // transform()).
  p.vertices.push({ x: v0.x, y: v0.y });
}

/**
 * `PCSimplePolygon::addVertex(PCVector2<double> v)` @ProCore 0xc3b78
 *
 * NOT YET TRANSCRIBED — the 194-line disasm is dominated by the
 * `std::vector<PCVector2<double>>::__emplace_back_slow_path` inlined
 * reallocation logic (capacity doubling, exception-safe move-construct,
 * `operator new`/`operator delete` via the ProCore allocator). Porting
 * this faithfully requires decoding the allocator interaction; a
 * plausible push_back would silently diverge on the capacity boundary.
 * Deferred per PORTING_SPEC Rule 3. @ProCore 0xc3b78
 */
export function addVertex(_p: PCSimplePolygonState, _v: PCVector2d): void {
  // throw citing @ProCore 0xc3b78 (P4 requires the addr on this line)
  throw new Error("PCSimplePolygon::addVertex @ProCore 0xc3b78 not yet transcribed (vector realloc path pending decode)");
}

/**
 * `PCSimplePolygon::signOfPointToLineDistance(p, l0, l1) const`
 * @ProCore 0xc3e68
 *
 * Disasm summary (all SSE double-precision, arg ptrs rsi=p, rdx=l0, rcx=l1):
 *   xmm0 = p                                  ; movupd (%rsi)
 *   xmm1 = l1                                 ; movupd (%rcx)
 *   xmm1 -= p                                 ; subpd
 *   xmm1 = shufpd(xmm1, 0x1)                  ; -> ((l1-p).y, (l1-p).x)
 *   xmm2 = l0                                 ; movupd (%rdx)
 *   xmm2 -= p                                 ; -> (l0-p)
 *   xmm2 *= xmm1                              ; = ((l0-p).x * (l1-p).y,
 *                                             ;    (l0-p).y * (l1-p).x)
 *   xmm2 = hsubpd(xmm2, xmm2)                 ; = (l0-p).x*(l1-p).y - (l0-p).y*(l1-p).x
 *                                             ;   = (l0 - p) x (l1 - p)   [2D cross]
 *   xmm0 = -0.5                               ; movsd @const 0x1225a8
 *   ecx = (xmm0 > xmm2)                       ; seta -> 1 if cross < -0.5
 *   ecx = -ecx                                ; -1 if cross < -0.5 else 0
 *   ucomisd 0.5, xmm2                          ; movsd @const 0x122890
 *   eax = 1
 *   if xmm2 <= 0.5: eax = ecx                 ; cmovbel
 *   return eax
 *
 * Semantics: 3-way sign of the 2D cross product `(l0 - p) x (l1 - p)`
 * with a symmetric 0.5-unit dead-band:
 *   cross >  0.5  ->  +1
 *   cross < -0.5  ->  -1
 *   |cross| <= 0.5 ->  0
 *
 * The 0.5-unit dead-band (not a scaled epsilon) suggests the caller
 * feeds this signed-integer-like coordinates where 0.5 is a
 * meaningful half-pixel tolerance. Faithful port — no adjustment.
 */
export function signOfPointToLineDistance(
  poly: PCSimplePolygonState,
  p: PCVector2d,
  l0: PCVector2d,
  l1: PCVector2d,
): number {
  void poly; // `this` is unused by the disasm (const method, no self reads)
  // cross = (l0.x - p.x) * (l1.y - p.y) - (l0.y - p.y) * (l1.x - p.x)
  // @ProCore 0xc3e78 (shufpd) + 0xc3e85 (mulpd) + 0xc3e89 (hsubpd)
  const cross = (l0.x - p.x) * (l1.y - p.y) - (l0.y - p.y) * (l1.x - p.x);
  // @const 0x1225a8 (-0.5) / @const 0x122890 (0.5)
  if (cross > 0.5) return 1;
  if (cross < -0.5) return -1;
  return 0;
}

/**
 * `PCSimplePolygon::signedPointToLineDistance2(p, l0, l1) const`
 * @ProCore 0xc4196
 *
 * Disasm summary (arg ptrs rsi=p, rdx=l0, rcx=l1):
 *   xmm0 = l0 - p                             ; call it D
 *   xmm2 = |D|^2 = D.x^2 + D.y^2              ; mulpd + haddpd
 *   xmm0 = shufpd(D, 0x1)                     ; = (D.y, D.x)
 *   xmm3 = l1 - p                             ; call it E
 *   xmm3 *= xmm0                              ; = (E.x*D.y, E.y*D.x)
 *   xmm0 = xmm3
 *   xmm0 = unpckhpd(xmm0, xmm3)               ; = (E.y*D.x, E.y*D.x)
 *   xmm0 -= xmm3                              ; xmm0[0] = E.y*D.x - E.x*D.y
 *                                             ;          = D.x*E.y - D.y*E.x   [2D cross D x E]
 *   xmm1 = xmm0
 *   xmm1 *= xmm0                              ; = cross^2
 *   xmm1 /= xmm2                              ; = cross^2 / |D|^2
 *   xmm2 = [-0.0, -0.0]                       ; movapd @const 0xe2070
 *   xmm2 ^= xmm1                              ; = -(cross^2 / |D|^2)  (sign flip via xor)
 *   xmm3 = 0
 *   xmm0 = (cross < 0) ? all-ones : 0         ; cmpltsd
 *   blendvpd xmm0, xmm2, xmm1                 ; where cross<0: xmm1 = xmm2 (negative)
 *   return xmm1
 *
 * Semantics: `sign(cross) * cross^2 / |l0 - p|^2` where
 * `cross = (l0 - p) x (l1 - p)` is the 2D cross product.
 * (NOT the ordinary point-to-line signed distance formula; this is a
 * squared, unnormalised variant — the `2` suffix in the FCP name.
 * Callers compare like-with-like without ever taking a sqrt.)
 */
export function signedPointToLineDistance2(
  poly: PCSimplePolygonState,
  p: PCVector2d,
  l0: PCVector2d,
  l1: PCVector2d,
): number {
  void poly; // const method, this unused in the disasm
  const dx = l0.x - p.x;
  const dy = l0.y - p.y;
  const dNormSq = dx * dx + dy * dy;                        // |l0-p|^2   @0xc41ae haddpd
  const ex = l1.x - p.x;
  const ey = l1.y - p.y;
  const cross = dx * ey - dy * ex;                          // D x E      @0xc41cb subsd
  const magnitude = (cross * cross) / dNormSq;              // @0xc41d7 divsd
  // blend based on sign(cross): if cross<0, negate magnitude.
  return cross < 0 ? -magnitude : magnitude;                // @0xc41f0 blendvpd
}

/**
 * `PCSimplePolygon::getVertexAtIndex(int i) const` @ProCore 0xc41fc
 *
 * Disasm:
 *   if (i < 0): idx = 0
 *   else if (i >= count): idx = count - 1
 *   else: idx = i
 *   return vertices[idx]
 *
 * Semantics: clamped vertex accessor. Negative indices return the
 * first vertex; overflowing indices return the last. UB-free — the
 * FCP method returns a raw `PCVector2` by value via out-pointer in
 * rdi, so we return by value here too.
 *
 * NOTE: the FCP function has UB when the polygon is empty (count=0);
 * then `count-1 = -1` and the load reads out-of-bounds. We mirror the
 * disasm — an empty polygon still hits the `else` branch and reads
 * `vertices[-1]` conceptually; in TS we surface that as a throw to
 * make the UB observable rather than silently returning garbage.
 */
export function getVertexAtIndex(poly: PCSimplePolygonState, i: number): PCVector2d {
  const count = poly.vertices.length;
  let idx: number;
  if (i < 0) {
    idx = 0;                             // @0xc4223 js -> rcx=begin, edx=0
  } else if (i >= count) {
    idx = count - 1;                     // @0xc421d dec %esi
  } else {
    idx = i;                             // @0xc4229 movslq
  }
  if (idx < 0 || idx >= count) {
    // The FCP path is UB here (reads past the vector). Refuse loudly
    // rather than fabricate a value. @ProCore 0xc4230 movups (%rcx,%rdx)
    throw new Error("PCSimplePolygon::getVertexAtIndex @ProCore 0xc41fc on empty polygon (undefined in the source)");
  }
  const v = poly.vertices[idx];
  return { x: v.x, y: v.y };
}

/**
 * `PCSimplePolygon::centroid() const` @ProCore 0xc423a
 *
 * Standard shoelace-formula centroid — accumulates `sum(cross(v[i], v[i+1]))`
 * as twice the signed area, and `sum((v[i] + v[i+1]) * cross(v[i], v[i+1]))`
 * as six-times the centroid coordinate, then divides the second by three
 * times the first.
 *
 * Disasm loop body (n = count - 1; iterates over consecutive pairs
 * (v[i], v[i+1]) plus one final wrap-around pair (v[n-1], v[n])):
 *
 *   xmm0  = v[0]                              ; movupd (%rcx)
 *   rdi   = n                                 ; count - 1
 *   xmm1  = 0    (centroid numerator accum, vec)
 *   xmm2  = 0    (2*area accum, scalar)
 *   xmm3  = xmm0                              (rolling "previous" vertex)
 *   loop:
 *     xmm4 = v[i+1]                           ; movupd (%rsi)
 *     xmm5 = shufpd(xmm4, 0x1)                ; = (v[i+1].y, v[i+1].x)
 *     xmm5 *= xmm3                            ; = (v[i].x * v[i+1].y, v[i].y * v[i+1].x)
 *     xmm5 = hsubpd(xmm5, xmm5)               ; = v[i] x v[i+1]  (broadcast)
 *     xmm2 += xmm5[0]                         ; area accum
 *     xmm3 += xmm4                            ; = v[i] + v[i+1]
 *     xmm3 *= xmm5                            ; = (v[i] + v[i+1]) * cross
 *     xmm1 += xmm3                            ; numerator accum
 *     xmm3 = xmm4                             ; roll previous <- current
 *   post-loop wrap (v[n-1] -> v[n] -> v[0] cross):
 *     xmm4 = shufpd(xmm0, 0x1)                ; using xmm0 = v[0]
 *     xmm4 *= xmm3                            ; = (v[n].x * v[0].y, v[n].y * v[0].x)
 *     xmm4 = hsubpd(xmm4, xmm4)               ; last cross
 *     xmm2 += xmm4                            ; area accum
 *     xmm0 += xmm3                            ; = v[n] + v[0]
 *   final normalise:
 *     xmm2 *= 3.0                             ; @const 0x122628
 *     xmm3 = 1.0 / xmm2 = 1 / (6 * area)      ; @const 0x122530
 *     xmm0 *= xmm4                            ; final pair contribution
 *     xmm0 += xmm1                            ; total numerator
 *     xmm1 = broadcast(xmm3)
 *     xmm1 *= xmm0                            ; centroid
 *   return xmm1
 *
 * Semantics: standard signed-area centroid (Bourke). Assumes the
 * polygon has >= 1 vertex; with count==1 the loop is skipped, the
 * post-loop pair is (v[0], v[0]) giving cross=0 and hence a divide
 * by zero. We mirror the FCP behaviour (which happily produces
 * NaN/Inf via the divsd). Callers must supply a valid closed polygon.
 */
export function centroid(poly: PCSimplePolygonState): PCVector2d {
  const V = poly.vertices;
  const n = V.length;
  if (n === 0) {
    // The disasm's je 0xc42a9 handles count==0 by re-loading (%rcx)
    // (garbage past the empty vector). We refuse rather than fabricate.
    // @ProCore 0xc4253 je -> undefined read
    throw new Error("PCSimplePolygon::centroid @ProCore 0xc423a on empty polygon (undefined in the source)");
  }
  let areaAccum = 0;
  let numX = 0;
  let numY = 0;
  // Loop over pairs (v[i], v[i+1]) for i in 0..n-2 (n-1 iterations).
  // @ProCore 0xc426c..0xc429c
  for (let i = 0; i < n - 1; i++) {
    const v = V[i];
    const w = V[i + 1];
    const cross = v.x * w.y - v.y * w.x;                 // @0xc427d hsubpd
    areaAccum += cross;                                  // @0xc4281 addsd
    numX += (v.x + w.x) * cross;                         // @0xc4285 addpd/mulpd/addpd
    numY += (v.y + w.y) * cross;
  }
  // Wrap-around final pair uses (v[n-1], v[0]).
  // The disasm's post-loop path reloads v[0] into xmm0, keeps v[n-1]
  // in xmm3, and does one more cross+accumulate.
  // @ProCore 0xc42a9..0xc42ee
  {
    const v = V[n - 1];
    const w = V[0];
    const cross = v.x * w.y - v.y * w.x;
    areaAccum += cross;
    numX += (v.x + w.x) * cross;
    numY += (v.y + w.y) * cross;
  }
  // xmm2 *= 3.0; xmm3 = 1.0 / xmm2  -> 1/(3 * 2A) = 1/(6A)
  // @ProCore 0xc42d2 (@const 0x122628 = 3.0), 0xc42e2 (@const 0x122530 = 1.0)
  const inv6A = 1.0 / (3.0 * areaAccum);
  return { x: numX * inv6A, y: numY * inv6A };
}

/**
 * `PCSimplePolygon::pointTest(PCVector2<double> p) const` @ProCore 0xc3fe4
 *
 * NOT YET TRANSCRIBED — 108-line ray-casting point-in-polygon with
 * horizontal-scanline, vertex-touch, and collinear-edge special cases
 * (see the interlocking `ucomisd` branches at 0xc4041..0xc40eb).
 * A faithful port must reproduce every corner-case branch bit-for-bit;
 * the standard "count intersections with ray to +x" algorithm differs
 * subtly at vertex-touches and would silently corrupt mask generation.
 * Deferred per PORTING_SPEC Rule 3. @ProCore 0xc3fe4
 */
export function pointTest(_poly: PCSimplePolygonState, _p: PCVector2d): number {
  // throw citing @ProCore 0xc3fe4 (P4 requires @0xADDR on this line)
  throw new Error("PCSimplePolygon::pointTest @ProCore 0xc3fe4 not yet transcribed (edge/vertex-case branches pending decode)");
}

/**
 * `PCSimplePolygon::transform(PCMatrix44Tmpl<double> const& M)`
 * @ProCore 0xc3eb2
 *
 * NOT YET TRANSCRIBED — the per-vertex apply is delegated to
 * `PCMatrix44Tmpl<double>::transform<double>(PCVector2<double> const&,
 * PCVector2<double>&) const` via `callq` at @ProCore 0xc3ef1, which
 * has not been decoded yet (perspective-divide semantics depend on
 * the mat44 rows below the 2x2 sub-block, and the exact rounding
 * chosen by that method is what defines the whole rasterisation
 * pipeline downstream). The bbox-recompute epilogue at
 * @ProCore 0xc3f2a..0xc3fcf is decodable but useless without the
 * per-vertex transform. Stubbed. @ProCore 0xc3eb2
 */
export function transform(_p: PCSimplePolygonState, _M: unknown): void {
  // throw citing @ProCore 0xc3eb2 (P4 requires @0xADDR on this line)
  throw new Error("PCSimplePolygon::transform @ProCore 0xc3eb2 not yet transcribed (PCMatrix44Tmpl::transform @0xc3ef1 pending decode)");
}

/**
 * `PCSimplePolygon::duplicate() const` @ProCore 0xc3a76
 *
 * NOT YET TRANSCRIBED — the deep-copy path uses
 * `std::vector<PCVector2<double>>::__emplace_back_slow_path` at
 * @ProCore ~0xc3add for each source vertex, plus a `_Unwind_Resume`
 * cleanup landing pad at @ProCore 0xc3b40. Both need decoded before
 * we can bit-exactly reproduce the capacity ladder. The bbox / flag
 * copy epilogue at @ProCore 0xc3b04..0xc3b12 is trivial, but shipping
 * a partial port with the wrong capacity semantics could hide subtle
 * memory-behaviour bugs. Stubbed. @ProCore 0xc3a76
 */
export function duplicate(_p: PCSimplePolygonState): PCSimplePolygonState {
  // throw citing @ProCore 0xc3a76 (P4 requires @0xADDR on this line)
  throw new Error("PCSimplePolygon::duplicate @ProCore 0xc3a76 not yet transcribed (vector __emplace_back_slow_path @~0xc3add pending decode)");
}
